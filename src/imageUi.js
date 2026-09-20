import { getSettings } from './settings.js?rmv=1.5.53-image1';
import { getImageBackendStatus, getImageCharacters, generateMirrorImage } from './baibaiImage.js?rmv=1.5.53-image1';
import { loadMirrorImage, saveMirrorImage, loadMirrorImageDraft, saveMirrorImageDraft } from './imageStore.js?rmv=1.5.53-image1';

// The lock lives beyond a panel's lifetime. Closing, reopening or aborting a UI
// cannot release a provider reservation before its Promise actually settles.
const jobs = new Map();
const pendingSaves = new Map();
const sessionDrafts = new Map();
const regions = new WeakMap();
const mountedRoots = new WeakMap();
const regionOwners = new WeakMap();
let savedImagesExist = null;
let panel = null;
function hasStoredImages() {
    if (savedImagesExist !== null) return savedImagesExist;
    try {
        savedImagesExist = false;
        for (let i = 0; i < globalThis.localStorage.length; i++) {
            if (globalThis.localStorage.key(i)?.startsWith('rabbitMirror:image:v1:images:')) { savedImagesExist = true; break; }
        }
    } catch { savedImagesExist = true; }
    return savedImagesExist;
}
function targetFor(root) {
    try { return globalThis.__rabbitMirrorIndependentActionsV1?.prepareImageTarget?.(root) || null; }
    catch { return null; }
}
function current(target) {
    try { return target?.assertCurrent?.() !== false; } catch { return false; }
}
function el(doc, tag, text, attrs = {}) {
    const node = doc.createElement(tag);
    if (text) node.textContent = text;
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    return node;
}
// Only fixed descriptions and numeric HTTP status reach the UI. Provider
// messages, response bodies, source text and credentials are never echoed.
function imageFailureText(error, stage) {
    const stages = { backend: '检查柏宝绘连接', characters: '读取柏宝绘角色资料', planning: '画面构思', drawing: '柏宝绘出图' };
    const reasons = {
        PLAN_EMPTY_SOURCE: '未读取到可供构思的镜面内容。',
        PLAN_INVALID_JSON: '副 API 已返回内容，但构思结果不是可解析的 JSON。',
        PLAN_INVALID_OBJECT: '构思结果应为一个 JSON 对象，实际格式不符。',
        PLAN_MISSING_PROMPT: '构思结果缺少非空的画面标签 prompt。',
        PLAN_INVALID_CHARACTERS: '构思结果的 characters 不是数组。',
        PLAN_INCOMPLETE_CHARACTER: '构思结果中至少一位角色缺少 name 或 tag，整份结果未被接收。',
        PLAN_DISABLED: '镜面生图已关闭。',
        PLAN_CONFIGURATION: '兔子镜副 API 连接或模型尚未配置完整，未发送构思请求。',
        PLAN_REQUEST_LIMIT: '规划材料超过原有请求上限；未截断材料，未发送构思请求。',
        PLAN_CONTEXT_BOUNDARY: '原有上下文边界检查未通过，未发送构思请求。',
        PLAN_DISPATCH_LEASE: '原有单次请求租约未通过，未再次发送构思请求。',
        PLAN_PREFLIGHT: '构思请求在本地检查阶段失败，尚未发送。',
        PLAN_RESPONSE_LIMIT: '返回内容触及原有响应上限，读取被停止。',
        PLAN_AUTH: '副 API 报告认证或访问被拒绝，请检查连接配置与权限。',
        PLAN_RATE_LIMIT: '副 API 报告请求频率或额度限制。',
        PLAN_CONCURRENCY: '副 API 或宿主报告并发限制。',
        PLAN_NETWORK: '副 API 连接或响应流中断。',
        PLAN_HTTP: '副 API 返回失败 HTTP 状态。',
        PLAN_EMPTY_RESPONSE: '副 API 返回为空，没有可解析的画面构思。',
        PLAN_UNPARSED_STREAM: '收到了副 API 流式数据，但未解析到文本内容。',
        PLAN_UPSTREAM_ERROR: '副 API 的响应中包含上游错误。',
        PLAN_REQUEST_FAILED: '构思请求未完成，宿主未提供可确认的具体原因。',
        PLAN_TARGET_CHANGED: '聊天、分支或镜面内容已变化，请回到当前镜面重新打开。',
        PLAN_SETTINGS_CHANGED: '生图开关或副 API 设置已变化，请重新打开面板。',
    };
    const providerReasons = {
        not_configured: '柏宝绘尚未配置连接。', unsupported_api: '柏宝绘公开接口不兼容。',
        invalid_args: '生图参数不完整或未被柏宝绘接受，请检查提示词。',
        invalid_result: '柏宝绘未返回可用的图片路径或图片数据。',
        stale_owner: '聊天或镜面已变化，未发送生图请求。',
        rate_limited: '柏宝绘报告限流。', aborted: '本次操作已取消。',
    };
    let code = Object.hasOwn(reasons, error?.rabbitMirrorImageCode) ? error.rabbitMirrorImageCode : '';
    let reason = code ? reasons[code] : '';
    if (!reason && stage !== 'planning' && Object.hasOwn(providerReasons, error?.code)) {
        code = error.code; reason = providerReasons[code];
    }
    if (!reason) { code = 'UNKNOWN'; reason = '未取得可确认的具体原因；不能据此判定为文字过少。'; }
    const status = error?.rabbitMirrorImageHttpStatus;
    const http = stage === 'planning' && Number.isInteger(status) && status >= 400 && status <= 599 ? `，HTTP ${status}` : '';
    const next = stage === 'drawing' ? '' : '尚未进入柏宝绘出图。';
    return `${stages[stage] || '生图准备'}未完成：${reason}（${code}${http}）${next}原图保留，没有自动补发。`;
}

function safeImageUrl(value) {
    const text = String(value || '');
    if (!text) return '';
    if (/^data:image\/(?:png|jpeg|webp|gif);base64,[a-z\d+/=\s]+$/i.test(text)) return text;
    try {
        const url = new URL(text, document.baseURI);
        if (['http:', 'https:'].includes(url.protocol)) return url.href;
        // TT stores provider images on its own local Tauri host. Reuse that
        // saved path; restoring an image must never require another generation.
        const host = new URL(document.location?.href || document.baseURI);
        if (host.protocol === 'tauri:' && host.host === 'localhost'
            && url.protocol === host.protocol && url.host === host.host
            && !host.username && !host.password && !url.username && !url.password) return url.href;
        return '';
    } catch { return ''; }
}
function makeImage(doc, record) {
    const image = el(doc, 'img', '', { alt: '这一面兔子镜的插图' });
    image.style.cssText = 'display:block;max-width:100%;height:auto;object-fit:contain;margin:auto;';
    const url = safeImageUrl(record?.url || record?.path || record?.dataUrl);
    if (url) image.src = url;
    return image;
}
function stored(key) {
    try { return { record: loadMirrorImage(key), draft: sessionDrafts.get(key) || loadMirrorImageDraft(key) }; }
    catch { return { record: null, draft: null, error: '此设备的图片存档暂时无法读取；不会覆盖原存档。' }; }
}
function rememberDraft(key, draft) {
    const value = { ...draft, updatedAt: Date.now() };
    sessionDrafts.set(key, value);
    saveMirrorImageDraft(key, value);
}
function pendingImage(key, saved) {
    const records = pendingSaves.get(key)?.records;
    if (!records?.length) return saved;
    const { history = [], ...currentSaved } = saved || {};
    return { ...records.at(-1), history: [...history, ...(saved ? [currentSaved] : []), ...records.slice(0, -1)] };
}
function flushPendingImages(key) {
    const pending = pendingSaves.get(key);
    while (pending?.records.length) {
        // Remove only a confirmed saved prefix. A later failure keeps every
        // remaining paid result available, in original generation order.
        saveMirrorImage(key, pending.records[0]);
        pending.records.shift();
    }
    if (pending && !pending.records.length) pendingSaves.delete(key);
    return loadMirrorImage(key);
}

export function mountMirrorImage(root) {
    if (!root?.isConnected) return;
    const anchor = root.closest('toto') || root;
    if (mountedRoots.get(root) === anchor.parentElement) return;
    for (const sibling of Array.from(anchor.parentElement?.children || [])) {
        if (sibling.hasAttribute('data-rm-image-region') && !regionOwners.get(sibling)?.isConnected) sibling.remove();
    }
    if (!pendingSaves.size && !hasStoredImages()) { mountedRoots.set(root, anchor.parentElement); return; }
    const target = targetFor(root);
    const previous = regions.get(root);
    if (!target) { previous?.remove(); regions.delete(root); return; }
    mountedRoots.set(root, anchor.parentElement);
    const state = stored(target.key);
    const record = pendingImage(target.key, state.record);
    if (!record) return;
    // Remove only our sibling region. Never alter generated mirror HTML.
    if (previous?.isConnected && previous.dataset.rmImageKey === target.key && previous.dataset.rmImageStamp === String(record.generatedAt || '')) return;
    previous?.remove();
    for (const sibling of Array.from(anchor.parentElement?.children || [])) {
        if (sibling !== anchor && sibling.hasAttribute('data-rm-image-region') && sibling.dataset.rmImageKey === target.key) sibling.remove();
    }
    const doc = root.ownerDocument;
    const region = el(doc, 'div', '', { 'data-rm-image-region': '', 'data-rm-tool-ui': 'true' });
    const disclosure = el(doc, 'details');
    region.dataset.rmImageKey = target.key;
    region.dataset.rmImageStamp = String(record.generatedAt || '');
    region.style.cssText = 'display:block;clear:both;max-width:100%;box-sizing:border-box;margin:8px 0;padding:10px;border:1px solid var(--SmartThemeBorderColor,#cfdae5);border-radius:12px;';
    const summary = el(doc, 'summary', pendingSaves.has(target.key) ? '🖼 查看本面插图（尚未保存）' : '🖼 查看本面插图');
    const open = el(doc, 'button', '查看／编辑提示词', { type: 'button' });
    open.addEventListener('click', () => openMirrorImagePanel(root, { opener: open }));
    disclosure.append(summary, makeImage(doc, record), open); region.append(disclosure);
    anchor.after(region);
    regions.set(root, region);
    regionOwners.set(region, root);
}

function closePanel() {
    if (!panel) return;
    const previous = panel;
    panel = null;
    previous.cleanup(); previous.host.remove();
    if (previous.opener?.isConnected) previous.opener.focus();
}
export function closeMirrorImagePanel() { closePanel(); }

export function openMirrorImagePanel(root, { opener = null } = {}) {
    closePanel();
    const doc = root.ownerDocument;
    const target = targetFor(root);
    const state = target ? stored(target.key) : {};
    const host = el(doc, 'div', '', { 'data-rm-image-portal': '', 'data-rm-tool-ui': 'true' });
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483646;background:#0007;display:flex;align-items:center;justify-content:center;padding:8px;box-sizing:border-box;';
    const box = el(doc, 'section', '', { role: 'dialog', 'aria-modal': 'true', 'aria-label': '兔子镜生图', tabindex: '-1' });
    box.style.cssText = 'width:620px;max-width:100%;max-height:100%;min-height:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding:16px;border-radius:18px;background:var(--SmartThemeBlurTintColor,#fff);color:var(--SmartThemeBodyColor,#34495d);border:1px solid var(--SmartThemeBorderColor,#cfdae5);display:flex;flex-direction:column;gap:12px;';
    const heading = el(doc, 'header'); heading.style.cssText = 'display:flex;align-items:center;gap:12px;';
    const title = el(doc, 'strong', target?.title || '兔子镜生图'); title.style.cssText = 'flex:1;overflow-wrap:anywhere;';
    const close = el(doc, 'button', '关闭', { type: 'button', 'data-rm-image-action': 'close' });
    close.addEventListener('click', closePanel); heading.append(title, close);
    const status = el(doc, 'p', state.error || (!target ? '这面兔子镜暂时无法绑定保存位置。请重新打开当前聊天中的已保存镜面；本次不会发起请求。' : '首次生成：构思一次，再出图一次。编辑、查看和保存草稿不调用模型。'), { role: 'status', 'aria-live': 'polite' });
    const notice = el(doc, 'p', '重新构思：仅调用一次副 API。按当前提示词绘制：仅调用一次柏宝绘。柏宝绘内部重试按其原有规则执行。');
    const preview = el(doc, 'div');
    const fields = el(doc, 'div'); fields.style.cssText = 'display:grid;gap:12px;';
    const inputs = {};
    function field(name, label, tag = 'textarea') {
        const wrap = el(doc, 'label', label); wrap.style.cssText = 'display:grid;gap:5px;';
        const input = el(doc, tag, '', { 'data-rm-image-field': name });
        input.style.cssText = 'width:100%;min-width:0;box-sizing:border-box;font:inherit;color:inherit;background:var(--SmartThemeBlurTintColor,#fff);border:1px solid var(--SmartThemeBorderColor,#b8c5d6);border-radius:8px;padding:8px;';
        if (tag === 'textarea') { input.rows = 3; input.style.resize = 'vertical'; }
        inputs[name] = input; wrap.append(input); fields.append(wrap); return input;
    }
    const format = field('promptFormat', '提示词写法', 'select');
    format.append(el(doc, 'option', '自然语言＋标签（NAI 5）', { value: 'nai5-natural' }), el(doc, 'option', '标签（NAI 4.5）', { value: 'nai45-tags' }));
    field('prompt', '画面标签'); field('nl', '画面描述'); field('flatPrompt', '完整通用提示词（不支持独立人物字段的后端使用）');
    const characters = el(doc, 'div'); characters.style.cssText = 'display:grid;gap:12px;'; fields.append(characters);
    const size = field('size', '画幅', 'select');
    size.append(el(doc, 'option', '沿用柏宝绘默认', { value: '' }), el(doc, 'option', '竖向', { value: 'portrait' }), el(doc, 'option', '横向', { value: 'landscape' }));
    const send = el(doc, 'details'); send.append(el(doc, 'summary', '本次发送预览'));
    const sendPreview = el(doc, 'pre'); sendPreview.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;'; send.append(sendPreview);
    const actions = el(doc, 'div'); actions.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    const buttons = {};
    function button(name, label, fn) {
        const b = el(doc, 'button', label, { type: 'button', 'data-rm-image-action': name });
        b.style.cssText = 'font:inherit;min-height:42px;white-space:normal;padding:8px 12px;';
        b.addEventListener('click', fn); actions.append(b); buttons[name] = b; return b;
    }
    box.append(heading, status, notice, actions, preview, fields, send); host.append(box); doc.body.append(host);
    let backend = null;
    let characterInputs = [];
    let localRecord = state.record;
    function readDraft() {
        return { prompt: inputs.prompt.value, nl: inputs.nl.value, flatPrompt: inputs.flatPrompt.value,
            promptFormat: format.value, characters: characterInputs.map(row => ({ name: row.name.value, tag: row.tag.value, nl: row.nl.value })).filter(row => row.name || row.tag || row.nl) };
    }
    function fillDraft(value = {}) {
        for (const name of ['prompt', 'nl', 'flatPrompt']) inputs[name].value = value[name] || '';
        format.value = value.promptFormat || getSettings().imagePromptFormat;
        characters.replaceChildren(); characterInputs = [];
        for (const source of value.characters || []) {
            const group = el(doc, 'fieldset'); group.append(el(doc, 'legend', '画中人物'));
            const row = {};
            for (const [key, label] of [['name', '姓名'], ['tag', '外貌标签'], ['nl', '外貌描述']]) {
                const wrap = el(doc, 'label', label); wrap.style.cssText = 'display:grid;gap:4px;margin:6px 0;';
                const input = el(doc, key === 'name' ? 'input' : 'textarea', '', { 'data-rm-image-character': key });
                input.value = source[key] || ''; input.style.cssText = 'width:100%;min-width:0;box-sizing:border-box;font:inherit;';
                row[key] = input; wrap.append(input); group.append(wrap);
            }
            characterInputs.push(row); characters.append(group);
        }
        updatePreview();
    }
    function updatePreview() {
        const draft = readDraft();
        const supports = backend?.supportsCharacters === true;
        sendPreview.textContent = JSON.stringify({ prompt: supports ? draft.prompt : (draft.flatPrompt || (draft.characters.length ? '请补全完整通用提示词，当前不会发送。' : draft.prompt)),
            nl: draft.promptFormat === 'nai5-natural' ? draft.nl : '',
            ...(supports ? { characters: draft.characters.map(person => draft.promptFormat === 'nai45-tags' ? { name: person.name, tag: person.tag } : person) } : {}), ...(size.value ? { size: size.value } : {}) }, null, 2);
    }
    function showRecord(record) {
        preview.replaceChildren();
        if (!record) return;
        preview.append(makeImage(doc, record));
        const link = el(doc, 'a', '打开原图', { target: '_blank', rel: 'noopener noreferrer' });
        const url = safeImageUrl(record.url || record.path || record.dataUrl); if (url) link.href = url;
        preview.append(link);
        if (record.history?.length) {
            const history = el(doc, 'details'); history.append(el(doc, 'summary', '之前生成的图片'));
            for (const old of record.history) history.append(makeImage(doc, old));
            preview.append(history);
        }
    }
    function renderState() {
        if (!host.isConnected) return;
        const busy = target && jobs.has(target.key);
        const enabled = getSettings().imageEnabled === true;
        box.setAttribute('aria-busy', String(!!busy));
        for (const node of fields.querySelectorAll('input,textarea,select')) node.disabled = !!busy;
        for (const name of ['generate', 'reconceive', 'draw']) buttons[name].disabled = !target || !enabled || !!busy;
        const draft = readDraft();
        const drawablePrompt = backend?.supportsCharacters === false
            ? draft.flatPrompt || (draft.characters.length ? '' : draft.prompt) : draft.prompt;
        buttons.draw.disabled ||= !drawablePrompt.trim();
        buttons.saveDraft.disabled = !target || !!busy;
        buttons.cancel.hidden = !busy;
        buttons.saveOnly.hidden = !target || !pendingSaves.has(target.key);
        buttons.generate.hidden = !!localRecord || !!inputs.prompt.value.trim();
        buttons.draw.textContent = localRecord ? '按当前提示词重新生图' : '按当前提示词生图';
        if (!enabled && target) status.textContent = '镜面生图尚未开启。请在兔子镜「设置 → 镜面生图」启用；已保存图片仍可查看。';
    }
    function notify() {
        if (panel?.target?.key === target?.key) panel.renderState();
    }
    async function run(kind) {
        if (!target || !getSettings().imageEnabled || jobs.has(target.key)) return;
        if (!current(target)) { status.textContent = '聊天或这一面已变化，请回到对应镜面重新打开生图。'; return; }
        const controller = new AbortController();
        jobs.set(target.key, controller); renderState();
        let stage = 'backend';
        try {
            if (kind !== 'reconceive') {
                const connection = await getImageBackendStatus();
                if (!connection.configured) { status.textContent = '柏宝绘尚未连接，请先完成它的连接配置。本次没有发起模型请求。'; return; }
            }
            let draft = readDraft();
            if (kind !== 'draw') {
                status.textContent = '正在构思画面（一次副 API 请求）…';
                stage = 'characters';
                const publicCharacters = await getImageCharacters({ floor: target.floor });
                stage = 'planning';
                draft = await target.plan({ publicCharacters, promptFormat: format.value }, { signal: controller.signal });
                // Draft persistence is local only. A failed draft save must not
                // discard the completed plan or trigger a second paid request.
                try { rememberDraft(target.key, draft); } catch { status.textContent = '画面已构思，但草稿未能保存；当前页面仍可编辑。'; }
                if (host.isConnected) fillDraft(draft);
            }
            if (kind === 'reconceive') {
                if (!host.isConnected && panel?.target?.key === target.key) panel.receive(localRecord, draft);
                status.textContent = '构思完成。请检查提示词，点击生图才会调用柏宝绘。'; return;
            }
            if (!current(target)) throw new Error('target_changed');
            if (controller.signal.aborted) throw new Error('aborted');
            if (kind === 'draw') { try { rememberDraft(target.key, draft); } catch { /* Retain exact edited draft in this page even if storage is full. */ } }
            stage = 'drawing';
            status.textContent = '正在调用柏宝绘（一次生图调用）…';
            const record = await generateMirrorImage(draft, { signal: controller.signal, character: target.group,
                ...(size.value ? { size: size.value } : {}), assertCurrent: target.assertCurrent,
                onProgress: progress => { if (host.isConnected) status.textContent = '柏宝绘：' + ({ queued:'排队中', generating:'绘制中', 'queued-remote':'远端排队中', retrying:'按柏宝绘规则重试中', saving:'保存中' }[progress?.phase] || '处理中'); } });
            // Even after a chat switch, save only under the frozen original key.
            const pending = pendingSaves.get(target.key) || { records: [], target };
            pending.records.push(record); pendingSaves.set(target.key, pending);
            savedImagesExist = true;
            try {
                localRecord = flushPendingImages(target.key); status.textContent = '图片已保存到对应镜面。';
            } catch {
                localRecord = pendingImage(target.key, stored(target.key).record);
                status.textContent = '图片已生成，但此设备保存失败。请点击“只保存已生成图片”按顺序保存全部待存图片，或打开原图另存；不会再次生图。';
            }
            if (host.isConnected) showRecord(localRecord);
            else if (panel?.target?.key === target.key) panel.receive(localRecord, draft);
            if (current(target) && root.isConnected) { mountedRoots.delete(root); mountMirrorImage(root); }
        } catch (error) {
            // Never display arbitrary provider error bodies (may contain secrets).
            status.textContent = error?.message === 'target_changed' ? '聊天或镜面已变化，未继续生图。' : controller.signal.aborted ? '已请求取消；本次调用结算完成后才能再次生成。原图保留。' : imageFailureText(error, stage);
        } finally {
            jobs.delete(target.key); notify();
        }
    }
    button('generate', '构思并生成插图', () => run('generate'));
    button('reconceive', '重新构思（仅文本）', () => run('reconceive'));
    button('draw', '按当前提示词生图', () => run('draw'));
    button('saveDraft', '保存提示词草稿', () => {
        if (!target) return;
        try { rememberDraft(target.key, readDraft()); status.textContent = '草稿已保存，没有发起请求。'; }
        catch { status.textContent = '草稿保存失败，当前输入仍保留。'; }
    });
    button('cancel', '取消本次请求', () => {
        jobs.get(target?.key)?.abort(); status.textContent = '已请求取消，正在等待本次调用结束；不会自动重试。';
    });
    button('saveOnly', '只保存已生成图片', () => {
        const pending = pendingSaves.get(target?.key); if (!pending) return;
        try {
            localRecord = flushPendingImages(target.key);
            showRecord(localRecord); status.textContent = '图片已保存，没有调用模型。';
            if (current(target)) { mountedRoots.delete(root); mountMirrorImage(root); }
        } catch {
            localRecord = pendingImage(target.key, stored(target.key).record); showRecord(localRecord);
            status.textContent = '保存仍未全部完成。已保存的图片与剩余待存图片均保留；请重试保存或打开原图另存，不会重新生成。';
        }
        renderState();
    });
    fields.addEventListener('input', event => {
        if (event.target !== inputs.flatPrompt && event.target !== size && event.target !== format && inputs.flatPrompt.value) {
            inputs.flatPrompt.value = ''; status.textContent = '画面或人物已编辑，旧通用提示词已清空；请补全完整提示词，或重新构思后核对。';
        }
        updatePreview(); renderState();
    });
    function fit() {
        const view = doc.defaultView, viewport = view.visualViewport;
        host.style.left = `${viewport?.offsetLeft || 0}px`; host.style.top = `${viewport?.offsetTop || 0}px`;
        host.style.right = 'auto'; host.style.bottom = 'auto';
        host.style.width = `${viewport?.width || view.innerWidth}px`; host.style.height = `${viewport?.height || view.innerHeight}px`;
    }
    function keydown(event) {
        if (event.key === 'Escape') { event.preventDefault(); closePanel(); }
        if (event.key === 'Tab') {
            const focusable = [...box.querySelectorAll('button,input,textarea,select,a[href]')].filter(node => !node.disabled && !node.hidden && node.getClientRects().length);
            const first = focusable[0], last = focusable.at(-1);
            if (event.shiftKey && doc.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && doc.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
    }
    doc.defaultView.addEventListener('resize', fit); doc.defaultView.visualViewport?.addEventListener('resize', fit); doc.defaultView.visualViewport?.addEventListener('scroll', fit);
    host.addEventListener('keydown', keydown);
    panel = { host, target, opener, renderState, receive: (record, draft) => { localRecord = record; fillDraft(draft); showRecord(record); }, cleanup: () => {
        doc.defaultView.removeEventListener('resize', fit); doc.defaultView.visualViewport?.removeEventListener('resize', fit); doc.defaultView.visualViewport?.removeEventListener('scroll', fit);
    } };
    const pending = target && pendingSaves.get(target.key);
    if (pending) localRecord = pendingImage(target.key, localRecord);
    const latestDraft = state.draft && (!localRecord || Number(state.draft.updatedAt || 0) >= Date.parse(localRecord.generatedAt || ''))
        ? state.draft : localRecord?.promptMetadata || localRecord || state.draft || {};
    fillDraft(latestDraft); showRecord(localRecord); renderState(); fit(); close.focus();
    Promise.resolve().then(() => getImageBackendStatus()).then(value => { backend = value; if (host.isConnected) { updatePreview(); renderState(); } }).catch(() => {});
}
