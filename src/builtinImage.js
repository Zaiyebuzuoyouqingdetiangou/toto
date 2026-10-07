import { getSettings } from './settings.js?rmv=1.67.18';
import { generateMirrorImage } from './baibaiImage.js?rmv=1.67.18';
import { loadMirrorImage, saveMirrorImage } from './imageStore.js?rmv=1.67.18';
import { getContext, hashText } from './independentApi/runtime.js?rmv=1.67.18';
import { imageLlmConfigured } from './imageLlm.js?rmv=1.67.18';

// 同一提示词在滚动、重挂载时共用这一次请求，避免每刷一次工具就再打一次柏宝绘。
const inflight = new Map();
const waiters = new Map();
const progress = new Map();
// 没连上柏宝绘时不要在每次刷新里反复请求。刷新页面后可以再试。
const failed = new Set();

function safeImageUrl(value) {
    const text = String(value || '');
    if (!text) return '';
    if (/^data:image\/(?:png|jpeg|webp|gif);base64,[a-z\d+/=\s]+$/i.test(text)) return text;
    try {
        const url = new URL(text, document.baseURI);
        if (['http:', 'https:'].includes(url.protocol)) return url.href;
        const host = new URL(document.location?.href || document.baseURI);
        if (host.protocol === 'tauri:' && host.host === 'localhost'
            && url.protocol === host.protocol && url.host === host.host
            && !host.username && !host.password && !url.username && !url.password) return url.href;
        return '';
    } catch { return ''; }
}

function characterGroup() {
    const ctx = getContext();
    const person = ctx.characters?.[ctx.characterId] || ctx.character || {};
    return String(person.name || ctx.name2 || '').trim() || '兔子镜';
}

function readPrompt(frame) {
    const node = frame.querySelector?.('[data-rm-draw-prompt]');
    let text = node ? node.textContent : '';
    if (!String(text).trim()) {
        const attr = frame.getAttribute?.('data-rm-draw-prompt') || '';
        if (attr && attr !== '1') text = attr;
    }
    text = String(text || '').replace(/\s+/g, ' ').trim();
    if (text.length < 4) return '';
    return text.slice(0, 800);
}

function storageKey(root, frame, prompt) {
    const details = frame.closest?.('details');
    const ctx = getContext();
    const chat = details?.dataset?.rabbitMirrorOwnerChat
        || String(ctx.getCurrentChatId?.() ?? ctx.chatId ?? '');
    const mes = details?.dataset?.rabbitMirrorOwnerMesid ?? '';
    const swipe = details?.dataset?.rabbitMirrorOwnerSwipe ?? '';
    const frames = [...(root.querySelectorAll?.('[data-rm-draw-frame]') || [])];
    const index = Math.max(0, frames.indexOf(frame));
    return `builtin:${chat}:${mes}:${swipe}:${index}:${hashText(prompt)}`;
}

function readSaved(key) {
    try { return { record: loadMirrorImage(key) }; }
    catch { return { broken: true }; }
}

function frameImageSize(frame) {
    // 情侣头像：一张横向双人图，之后左右各裁一个方形头像。
    if (frame?.getAttribute?.('data-rm-draw-pair') === 'avatar') return 'landscape';
    const width = frame.clientWidth;
    const height = frame.clientHeight;
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
        return width >= height ? 'landscape' : 'portrait';
    }
    // Hidden frames can still declare their intended shape. Unknown geometry keeps the backend default.
    const view = frame.ownerDocument?.defaultView;
    const ratio = String(view?.getComputedStyle?.(frame)?.aspectRatio
        || frame.style?.getPropertyValue('aspect-ratio') || '').trim().replace(/^auto\s+/, '');
    const parts = ratio.split('/').map(part => Number(part.trim()));
    if (parts.length > 2 || parts.some(value => !Number.isFinite(value) || value <= 0)) return undefined;
    return parts[0] >= (parts[1] || 1) ? 'landscape' : 'portrait';
}

function fitFrameImage(image, record) {
    // Only newly generated records opt into filling the frame; legacy saves retain their display policy.
    image.style.setProperty('object-fit', record?.builtinImageFit === 'cover' ? 'cover' : 'contain', 'important');
    image.style.setProperty('object-position', 'center', 'important');
}

function paint(frame, record) {
    const url = safeImageUrl(record?.url || record?.path || record?.dataUrl);
    if (!url) return false;
    const promptNode = frame.querySelector?.('[data-rm-draw-prompt]');
    if (promptNode) promptNode.hidden = true;
    frame.querySelector?.('[data-rm-draw-status]')?.remove();
    let image = frame.querySelector?.('img[data-rm-draw-result]');
    if (!image) {
        image = frame.ownerDocument.createElement('img');
        image.setAttribute('data-rm-draw-result', '1');
        image.alt = '这一面的画面';
        image.style.cssText = 'display:block;width:100%;height:100%;';
        frame.prepend(image);
    }
    fitFrameImage(image, record);
    image.src = url;
    if (frame.getAttribute?.('data-rm-draw-pair') === 'avatar') paintAvatarPair(frame, image, url);
    return true;
}

// 情侣头像：同一张图左右两半各显示成一个方形头像，下面各有「保存」，裁成正方形图片。
function paintAvatarPair(frame, image, url) {
    const doc = frame.ownerDocument;
    image.style.setProperty('display', 'none', 'important');
    frame.style.setProperty('aspect-ratio', 'auto', 'important');
    frame.style.setProperty('height', 'auto', 'important');
    frame.style.setProperty('overflow', 'visible', 'important');
    frame.querySelector?.('[data-rm-draw-pair-view]')?.remove();
    const view = doc.createElement('div');
    view.setAttribute('data-rm-draw-pair-view', '1');
    view.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;';
    for (const side of ['left', 'right']) {
        const cell = doc.createElement('div');
        cell.style.cssText = 'display:grid;gap:6px;justify-items:center;min-width:0;';
        const tile = doc.createElement('div');
        tile.setAttribute('role', 'img');
        tile.setAttribute('aria-label', side === 'left' ? '左边的头像' : '右边的头像');
        tile.style.cssText = `width:100%;aspect-ratio:1/1;border-radius:18px;background-image:url("${url.replace(/"/g, '%22')}");`
            + `background-size:200% auto;background-repeat:no-repeat;background-position:${side === 'left' ? '0%' : '100%'} 50%;box-shadow:0 4px 14px rgba(0,0,0,.18);`;
        const save = doc.createElement('button');
        save.type = 'button';
        save.textContent = side === 'left' ? '保存左边' : '保存右边';
        save.style.cssText = 'min-height:32px;padding:4px 12px;border-radius:999px;border:1px solid currentColor;background:transparent;color:inherit;font-size:12px;cursor:pointer;';
        save.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            void saveAvatarHalf(url, side, doc);
        });
        cell.append(tile, save);
        view.append(cell);
    }
    frame.append(view);
}

function loadImageForCrop(url, doc) {
    return new Promise((resolve, reject) => {
        const img = new (doc.defaultView?.Image || Image)();
        if (!/^(data:|blob:)/i.test(url)) img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('图片读不出来'));
        img.src = url;
    });
}

async function saveAvatarHalf(url, side, doc) {
    let dataUrl = '';
    try {
        const img = await loadImageForCrop(url, doc);
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const size = Math.max(1, Math.floor(Math.min(width / 2, height)));
        const startX = (side === 'left' ? 0 : width / 2) + (width / 2 - size) / 2;
        const startY = (height - size) / 2;
        const canvas = doc.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas.getContext('2d').drawImage(img, startX, startY, size, size, 0, 0, size, size);
        dataUrl = canvas.toDataURL('image/png');
    } catch (error) {
        console.warn('[RabbitMirror] 头像裁剪失败，改为打开原图', error);
    }
    showAvatarSaveSheet(dataUrl || url, !!dataUrl, side, doc);
}

// 电脑上直接下载；手机和 TT 里下载按钮可能无效，所以同时把图片放大显示，可以长按保存。
function showAvatarSaveSheet(src, cropped, side, doc) {
    doc.querySelector('[data-rm-avatar-save]')?.remove();
    const overlay = doc.createElement('div');
    overlay.setAttribute('data-rm-avatar-save', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:rgba(8,10,14,.72);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';
    const card = doc.createElement('div');
    card.style.cssText = 'display:grid;gap:12px;justify-items:center;width:min(360px,100%);padding:18px;border-radius:20px;box-sizing:border-box;'
        + 'background:var(--SmartThemeBlurTintColor,#1f2229);color:var(--SmartThemeBodyColor,#eee);text-align:center;';
    const img = doc.createElement('img');
    img.src = src;
    img.alt = side === 'left' ? '左边的头像' : '右边的头像';
    img.style.cssText = 'width:100%;max-width:300px;aspect-ratio:1/1;object-fit:cover;border-radius:18px;';
    const hint = doc.createElement('div');
    hint.style.cssText = 'font-size:12px;opacity:.75;line-height:1.5;';
    hint.textContent = cropped ? '手机上可以长按图片保存；电脑上点「下载」。' : '没能裁成方形，这是原图；可以长按或右键保存后自行裁剪。';
    const row = doc.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;';
    const download = doc.createElement('a');
    download.href = src;
    download.download = `兔子镜头像-${side === 'left' ? '左' : '右'}.png`;
    download.textContent = '下载';
    download.className = 'menu_button';
    download.style.cssText = 'min-height:34px;padding:6px 16px;text-decoration:none;';
    const close = doc.createElement('button');
    close.type = 'button';
    close.className = 'menu_button';
    close.textContent = '关闭';
    close.style.cssText = 'min-height:34px;padding:6px 16px;';
    close.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', event => { if (event.target === overlay) overlay.remove(); });
    row.append(download, close);
    card.append(img, hint, row);
    overlay.append(card);
    doc.body.append(overlay);
}

function note(frame, text, root = null) {
    frame.querySelector?.('[data-rm-draw-status]')?.remove();
    const doc = frame.ownerDocument;
    const box = doc.createElement('div');
    box.setAttribute('data-rm-draw-status', '1');
    box.style.cssText = 'margin:0;padding:12px;font-size:12px;line-height:1.45;display:grid;gap:8px;align-content:center;height:100%;box-sizing:border-box;';
    const line = doc.createElement('p');
    line.textContent = text;
    line.style.cssText = 'margin:0;opacity:.72;';
    box.append(line);
    if (root) {
        // 失败后由用户决定要不要再画一次；只在点击时发一次请求，不自动重试。
        const row = doc.createElement('div');
        row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
        const button = (label, run) => {
            const node = doc.createElement('button');
            node.type = 'button';
            node.textContent = label;
            node.style.cssText = 'padding:5px 10px;border-radius:8px;border:1px solid currentColor;background:transparent;color:inherit;font-size:12px;cursor:pointer;';
            node.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); run(node); });
            return node;
        };
        row.append(button('重新生图', () => { const prompt = readPrompt(frame); failed.delete(storageKey(root, frame, prompt)); box.remove(); void fillFrame(root, frame); }));
        box.append(row);
    }
    frame.append(box);
}

function anyWaiterConnected(key) {
    const nodes = waiters.get(key);
    if (!nodes) return false;
    for (const node of nodes) if (node.isConnected) return true;
    return false;
}

function reportProgress(key, text) {
    if (progress.get(key) === text) return;
    progress.set(key, text);
    for (const frame of waiters.get(key) || []) if (frame.isConnected) note(frame, text);
}

// 设置了生图 LLM API 时，由它按这一面的内容另写正式的画面提示词；没写出来就用小剧场里那段线索。
async function planWithImageLlm(frame, onProgress) {
    const details = frame?.closest?.('details');
    const bridge = globalThis.__rabbitMirrorIndependentActionsV1;
    const target = details && typeof bridge?.prepareImageTarget === 'function' ? bridge.prepareImageTarget(details) : null;
    if (!target?.plan) return null;
    try {
        const focus = readPrompt(frame);
        const plan = await target.plan(focus ? { focus } : {}, { builtin: true, onProgress });
        return plan && String(plan.prompt || plan.flatPrompt || plan.nl || '').trim() ? plan : null;
    } catch (error) {
        console.warn('[RabbitMirror] 生图 LLM 没有写出画面提示词，改用小剧场里的画面线索', error);
        return null;
    }
}

function startJob(key, prompt, frame) {
    const existing = inflight.get(key);
    if (existing) return existing;
    const job = (async () => {
        const size = frameImageSize(frame);
        const settings = getSettings();
        const withLlm = imageLlmConfigured(settings);
        if (withLlm) reportProgress(key, '生图 LLM 正在构思画面提示词…');
        const planned = withLlm ? await planWithImageLlm(frame, phase => {
            if (phase === 'response-chunk' || phase === 'connection-manager-frame') {
                reportProgress(key, '生图 LLM 正在返回画面提示词…');
            }
        }) : null;
        const provider = settings.imageBackend === 'chatu8' ? '智绘姬' : '柏宝绘';
        reportProgress(key, `${withLlm ? planned ? '提示词已完成，' : '沿用本面画面线索，' : ''}正在交给${provider}生图…`);
        const generated = await generateMirrorImage(planned ? {
            prompt: String(planned.prompt || planned.flatPrompt || planned.nl || ''),
            flatPrompt: String(planned.flatPrompt || planned.prompt || ''),
            nl: String(planned.nl || ''),
            characters: Array.isArray(planned.characters) ? planned.characters : [],
            promptFormat: settings.imagePromptFormat,
        } : {
            prompt,
            flatPrompt: prompt,
            nl: prompt,
            characters: [],
            promptFormat: settings.imagePromptFormat,
        }, {
            character: characterGroup(),
            size,
            assertCurrent: () => anyWaiterConnected(key),
            onProgress: event => {
                const phase = { queued: '排队中', generating: '绘制中', 'queued-remote': '远端排队中', retrying: '按渠道规则重试中', saving: '保存中' }[event?.phase];
                if (phase) reportProgress(key, `${provider}：${phase}…`);
            },
        });
        const record = { ...generated, builtinImageFit: 'cover' };
        try { saveMirrorImage(key, record); }
        catch (error) { console.warn('[RabbitMirror] 内置生图已画成，但没能写入本机存档', error); }
        return record;
    })();
    inflight.set(key, job);
    const cleanup = () => {
        if (inflight.get(key) === job) { inflight.delete(key); progress.delete(key); }
    };
    job.then(cleanup, cleanup);
    return job;
}

async function fillFrame(root, frame) {
    const existingImage = frame.querySelector?.('img[data-rm-draw-result][src]');
    if (existingImage) return;
    const prompt = readPrompt(frame);
    if (!prompt) return;
    const key = storageKey(root, frame, prompt);
    const saved = readSaved(key);
    if (saved.broken) {
        note(frame, '这一面的画面存档读不出来，没有重新生图。', root);
        return;
    }
    if (saved.record && paint(frame, saved.record)) return;
    if (failed.has(key)) {
        note(frame, '这一面的画面这次没有画成。', root);
        return;
    }
    let nodes = waiters.get(key);
    if (!nodes) { nodes = new Set(); waiters.set(key, nodes); }
    nodes.add(frame);
    if (progress.has(key)) note(frame, progress.get(key));
    try {
        const record = await startJob(key, prompt, frame);
        if (frame.isConnected) paint(frame, record);
    } catch (error) {
        const code = error?.code;
        if (code === 'not_configured' || code === 'unsupported_api' || code === 'invalid_args' || code === 'invalid_result') failed.add(key);
        if (frame.isConnected) note(frame, code === 'not_configured' || code === 'unsupported_api'
            ? `${String(error?.message || '生图渠道还没连好')}这一面先留着提示词。`
            : '这一面的画面这次没有画成。', root);
        console.warn('[RabbitMirror] 内置生图没有填进图框', error);
    } finally {
        nodes.delete(frame);
        if (!nodes.size) waiters.delete(key);
    }
}

export function fillBuiltinImageFrames(root) {
    if (getSettings().builtinImageEnabled !== true || !root?.querySelectorAll) return;
    // 一面里有几个图框就画几张（比如分镜每格一张），每个图框各自存档、各自重试。
    for (const frame of root.querySelectorAll('[data-rm-draw-frame]')) void fillFrame(root, frame);
}
