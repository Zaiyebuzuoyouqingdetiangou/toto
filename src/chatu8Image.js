// 智绘姬（st-chatu8）生图渠道：通过酒馆事件把提示词交给智绘姬，按请求编号接回图片。
// 直接沿用智绘姬里已经配好的模型、接口和出图设置；不改它的全局设置，不加数量限制，不截短提示词，
// 结果不明时不自动重发。只取消兔子镜自己的等待，不影响智绘姬里的其他任务。
import { getContext } from './independentApi/runtime.js?rmv=1.76.0';
import { buildSingleImagePrompt } from './imagePromptPayload.js?rmv=1.76.0';

const SUPPORTED_MODES = new Set(['sd', 'novelai', 'comfyui', 'banana', 'runninghub']);

function failure(code, message, extra = {}) {
    const error = new Error(message);
    error.code = code;
    Object.assign(error, extra);
    return error;
}

export function chatu8Status() {
    const ctx = getContext();
    const settings = ctx?.extensionSettings?.['st-chatu8'];
    const events = ctx?.eventSource;
    if (!settings) return { configured: false, reason: '没有检测到智绘姬（st-chatu8），请先安装并配置。' };
    // 智绘姬的总开关默认关闭，值可能是布尔或字符串。
    if (!(settings.scriptEnabled === true || settings.scriptEnabled === 'true')) return { configured: false, reason: '智绘姬没有启用（请在智绘姬里打开总开关）。' };
    const mode = String(settings.mode || '').trim().toLowerCase();
    if (mode && !SUPPORTED_MODES.has(mode)) return { configured: false, reason: `智绘姬当前模式（${mode}）暂不支持。` };
    if (typeof events?.on !== 'function' || typeof events?.emit !== 'function') return { configured: false, reason: '酒馆事件接口不可用，无法连接智绘姬。' };
    return { configured: true, mode: mode || '默认' };
}

function requestId() {
    let random = Math.random().toString(36).slice(2, 10);
    try { random = globalThis.crypto.randomUUID().slice(0, 12); } catch { /* fallback above */ }
    return `rabbit-mirror-${Date.now().toString(36)}-${random}`;
}

const CHATU8_WAIT_MS = 15 * 60 * 1000;
function waitForChatu8Image({ prompt, width, height, signal }) {
    const ctx = getContext();
    const events = ctx.eventSource;
    const id = requestId();
    return new Promise((resolve, reject) => {
        let done = false;
        let timer = null;
        const cleanup = () => {
            done = true;
            if (timer) clearTimeout(timer);
            // 只移除本次的监听，不清空其他插件的监听。
            try { (events.removeListener || events.off)?.call(events, 'generate-image-response', onResponse); } catch { /* ignore */ }
            signal?.removeEventListener?.('abort', onAbort);
        };
        // 智绘姬内部出错没回调、或在它自己界面里取消了不带编号：不能一直等（面板会一直「正在画」、重画也被挡着）。
        timer = setTimeout(() => { if (done) return; cleanup(); reject(failure('provider_error', '智绘姬 15 分钟没有回音；不会自动再次请求。')); }, CHATU8_WAIT_MS);
        const onResponse = data => {
            if (done || !data || data.id !== id) return;
            cleanup();
            if (data.cancelled) { reject(failure('aborted', '智绘姬这次出图被取消了。')); return; }
            // 智绘姬取消任务时也是 success:false，并在 error 里写原因。
            if (!data.success) { reject(failure('invalid_result', `智绘姬没有画成这张图${data.error ? `：${String(data.error)}` : ''}；不会自动再次请求。`)); return; }
            if (data.isVideo) { reject(failure('invalid_result', '智绘姬返回的是视频，兔子镜只接收图片。')); return; }
            const image = String(data.imageData || '');
            if (!image) { reject(failure('invalid_result', '智绘姬没有返回图片；不会自动再次请求。')); return; }
            resolve(image);
        };
        const onAbort = () => { if (done) return; cleanup(); reject(failure('aborted', '生图已取消。')); };
        if (signal?.aborted) { onAbort(); return; }
        signal?.addEventListener?.('abort', onAbort, { once: true });
        events.on('generate-image-response', onResponse);
        const request = { id, prompt };
        if (Number(width) > 0 && Number(height) > 0) { request.width = Number(width); request.height = Number(height); }
        try { events.emit('generate-image-request', request); }
        catch (error) { cleanup(); reject(failure('provider_error', `没能把请求交给智绘姬：${String(error?.message || error)}`)); }
    });
}

// 把图片存成酒馆本地路径：已经是路径就直接用；base64 就上传到 /api/images/upload。
async function blobUrlToDataUrl(url) {
    const blob = await (await fetch(url)).blob();
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

// 生图服务给的是别处的网址（常见于它们自己服务器上的临时链接，过一阵就失效）时，图不在酒馆里，
// 以前原样存网址，链接一过期图就「自己」没了。现在先把图下载下来存进酒馆；下载不了（跨域不让读）才只能存网址。
function isForeignImageUrl(image) {
    try {
        const url = new URL(image, document.baseURI);
        if (!['http:', 'https:'].includes(url.protocol)) return false;
        const here = new URL(document.baseURI);
        return url.origin !== here.origin;
    } catch { return false; }
}
export async function persistImage(image, { label = '智绘姬' } = {}) {
    // blob: 地址只在本次页面里有效，先转成图片数据再保存。
    if (/^blob:/i.test(image)) {
        try { image = await blobUrlToDataUrl(image); } catch (error) {
            console.warn(`[RabbitMirror] ${label}返回的临时图片读不出来`, error);
            return { path: null, dataUrl: '', saveFailed: true };
        }
    }
    let foreignUrl = '';
    if (isForeignImageUrl(image)) {
        foreignUrl = image;
        try { image = await blobUrlToDataUrl(image); } catch (error) {
            console.warn(`[RabbitMirror] ${label}返回的是别处的图片网址，下载不下来，只能存网址（链接失效后图会读不到）`, error);
            try { globalThis.toastr?.warning?.(`${label}给的是别处的图片链接，没能存进酒馆；链接失效后这张图会读不到。`, '兔子镜'); } catch { /* ignore */ }
            return { path: image, dataUrl: '', remote: true };
        }
    }
    const match = /^data:image\/([a-z0-9.+-]+);base64,(.+)$/i.exec(image);
    if (!match) {
        // 同站的地址：去掉主机部分只存路径，换了访问地址（局域网／外网／手机）也照样读得到。
        try { const url = new URL(image, document.baseURI); if (['http:', 'https:'].includes(url.protocol)) return { path: `${url.pathname}${url.search}`, dataUrl: '' }; } catch { /* 不是网址 */ }
        return { path: image, dataUrl: '' };
    }
    const format = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    const ctx = getContext();
    const headers = typeof ctx?.getRequestHeaders === 'function' ? ctx.getRequestHeaders() : { 'Content-Type': 'application/json' };
    try {
        const response = await fetch('/api/images/upload', {
            method: 'POST',
            headers,
            body: JSON.stringify({ image: match[2], format, ch_name: '兔子镜' }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!result?.path) throw new Error('没有返回图片路径');
        return { path: String(result.path), dataUrl: '' };
    } catch (error) {
        // 生成成功但保存失败：保留这次的图片数据用于显示，并明确告诉用户，避免误以为没生成而重复出图。
        try { globalThis.toastr?.warning?.(`${label}已经画好，但图片保存失败；这张图刷新后可能不在。`, '兔子镜'); } catch { /* ignore */ }
        console.warn(`[RabbitMirror] ${label}图片保存失败`, error);
        // 下载到了别处的图却存不进酒馆：先留网址能看，图片数据也留着当备份。
        return { path: foreignUrl || null, dataUrl: image, saveFailed: true };
    }
}

export async function generateViaChatu8(plan, { signal, size, assertCurrent } = {}) {
    const status = chatu8Status();
    if (!status.configured) throw failure('not_configured', status.reason);
    // 智绘姬只接收一个 prompt；完整场景和每个人的已知外貌都须在其中。
    const prompt = buildSingleImagePrompt(plan);
    if (!prompt) throw failure('invalid_args', '当前画面没有提示词；请编辑或重新构思。');
    if (signal?.aborted) throw failure('aborted', '生图已取消。');
    if (typeof assertCurrent === 'function' && assertCurrent() === false) throw failure('stale_owner', '聊天或镜面已经变化，未发送生图请求。');
    const dimensions = size === 'portrait' ? { width: 832, height: 1216 } : size === 'landscape' ? { width: 1216, height: 832 } : {};
    const image = await waitForChatu8Image({ prompt, signal, ...dimensions });
    const stored = await persistImage(image);
    return {
        url: stored.path || stored.dataUrl, path: stored.path, dataUrl: stored.dataUrl, prompt, provider: 'st-chatu8',
        generatedAt: new Date().toISOString(),
        promptMetadata: { prompt: String(plan?.prompt || ''), nl: String(plan?.nl || ''), flatPrompt: String(plan?.flatPrompt || ''),
            promptFormat: plan?.promptFormat === 'nai45-tags' ? 'nai45-tags' : 'nai5-natural', backend: `st-chatu8:${status.mode}`, size, saveFailed: stored.saveFailed === true },
    };
}
