import { describeLocalStorageUsage } from './storageUsage.js?rmv=1.82.0';
import { getSettings } from './settings.js?rmv=1.82.0';
import { getImageBackendStatus, getImageCharacters, generateMirrorImage } from './baibaiImage.js?rmv=1.82.0';
import { captureMirrorImageOwner, mirrorImageOwnerMatchesKey, mirrorImageOwnerReceipt, saveMirrorImageForOwner, loadMirrorImage, loadMirrorImageDraft, saveMirrorImageDraft } from './imageStore.js?rmv=1.82.0';
import { applyAppearanceTheme } from './appearanceTheme.js?rmv=1.82.0';
import { imageLlmConfigured } from './imageLlm.js?rmv=1.82.0';
import { buildSingleImagePrompt } from './imagePromptPayload.js?rmv=1.82.0';
import { draftFromSavedImage } from './chatu8Image.js?rmv=1.82.0';
import { listBuiltinImageFrames, rerollBuiltinImage, showBuiltinImageVersion, builtinImageReady, builtinImageReusable } from './builtinImage.js?rmv=1.82.0';

// The lock lives beyond a panel's lifetime. Closing, reopening or aborting a UI
// cannot release a provider reservation before its Promise actually settles.
const jobs = new Set();
const pendingSaves = new Set();
const sessionDrafts = new Set();
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
    // 插图记录也可能只在消息上（跟聊天记录存的）：当前聊天里有就算有。不记住「没有」，换聊天后再看。
    if (!savedImagesExist) {
        try {
            const chat = globalThis.SillyTavern?.getContext?.()?.chat;
            const has = Array.isArray(chat) && chat.some(msg => (msg?.extra?.rabbitMirrorImages && Object.keys(msg.extra.rabbitMirrorImages).length)
                || (Array.isArray(msg?.swipe_info) && msg.swipe_info.some(info => info?.extra?.rabbitMirrorImages && Object.keys(info.extra.rabbitMirrorImages).length)));
            if (has) { savedImagesExist = true; return true; }
        } catch { /* 读不到就照本机的算 */ }
        savedImagesExist = null;
        return false;
    }
    return savedImagesExist;
}
function targetFor(root) {
    try { return globalThis.__rabbitMirrorIndependentActionsV1?.prepareImageTarget?.(root) || null; }
    catch { return null; }
}
function current(target) {
    try { return !!target && target.assertCurrent?.() !== false; } catch { return false; }
}
function el(doc, tag, text, attrs = {}) {
    const node = doc.createElement(tag);
    if (text) node.textContent = text;
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    return node;
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
    const session = ownedForTarget(sessionDrafts, { key });
    try {
        const savedDraft = loadMirrorImageDraft(key);
        const draft = savedDraft?.imageOwnerReceipt && !mirrorImageOwnerMatchesKey(savedDraft.imageOwnerReceipt, key) ? null : savedDraft;
        return { record: loadMirrorImage(key), draft: session?.draft || draft };
    }
    catch { return { record: null, draft: session?.draft || null, error: '此设备的图片存档暂时无法读取；不会覆盖原存档。' }; }
}
// 本面的插图：先按当前内容找；找不到时（比如维修兔修过，内容变了）再按最初那一版找。只读，不搬存档。
function storedForTarget(target) {
    const primary = stored(target.key);
    if (primary.record || primary.error) return primary;
    for (const key of Array.isArray(target.altKeys) ? target.altKeys : []) {
        const alt = stored(key);
        if (alt.record) return { ...primary, record: alt.record };
    }
    return primary;
}
function rememberDraft(key, draft, owner) {
    if (!owner) throw new Error('target_changed');
    const value = { ...draft, updatedAt: Date.now() };
    const previous = [...sessionDrafts].find(entry => sameOwner(entry.owner, owner));
    if (previous) previous.draft = value;
    else sessionDrafts.add({ owner, draft: value });
    // A paid plan may finish after switching chats. Keep it for that owner in
    // memory, without overwriting a draft at a now-reused numeric key.
    if (!mirrorImageOwnerMatchesKey(owner, key)) return;
    // The owner session already has the draft. Report a durable write failure
    // to the caller instead of falsely displaying “saved”.
    saveMirrorImageDraft(key, { ...value, imageOwnerReceipt: mirrorImageOwnerReceipt(owner) });
}
function sameOwner(left, right) {
    return left.token === right.token && left.entry === right.entry && left.chat === right.chat && left.source === right.source
        && (left.scope || '') === (right.scope || '');
}
function ownedForTarget(entries, target) {
    if (!target || !current(target)) return null;
    for (const entry of entries) if (mirrorImageOwnerMatchesKey(entry.owner, target.key)) return entry;
    return null;
}
function pendingForOwner(key, owner) {
    for (const pending of pendingSaves) {
        if (sameOwner(pending.owner, owner)) return pending;
    }
    const pending = { key, owner, records: [] };
    pendingSaves.add(pending);
    return pending;
}
function samePaidImage(left, right) {
    return (left?.url || left?.path || left?.dataUrl) === (right?.url || right?.path || right?.dataUrl)
        && left?.generatedAt === right?.generatedAt;
}
function pendingImage(pending, saved) {
    const records = pending?.records;
    if (!records?.length) return saved;
    const { history = [], ...currentSaved } = saved || {};
    // A failed durable write may already have updated the live message. Keep
    // each paid result once in the preview while its save remains retryable.
    const previous = [...history, ...(saved ? [currentSaved] : [])]
        .filter(record => !records.some(paid => samePaidImage(record, paid)));
    return { ...records.at(-1), history: [...previous, ...records.slice(0, -1)] };
}
function flushPendingImages(pending) {
    let saved = null;
    while (pending?.records.length) {
        // Remove only a confirmed saved prefix. A later failure keeps every
        // remaining paid result available, in original generation order.
        saved = saveMirrorImageForOwner(pending.key, pending.records[0], pending.owner);
        pending.records.shift();
    }
    if (pending && !pending.records.length) pendingSaves.delete(pending);
    return saved;
}

export function mountMirrorImage(root) {
    if (!root?.isConnected) return;
    const anchor = root.closest('toto') || root;
    const mounted = mountedRoots.get(root);
    if (mounted?.parent === anchor.parentElement && current(mounted.target)) return;
    for (const sibling of Array.from(anchor.parentElement?.children || [])) {
        const owner = regionOwners.get(sibling);
        if (sibling.hasAttribute('data-rm-image-region') && (!owner?.root.isConnected || !current(owner.target))) sibling.remove();
    }
    if (!pendingSaves.size && !hasStoredImages()) return;
    const target = targetFor(root);
    const previous = regions.get(root);
    if (!target) { previous?.remove(); regions.delete(root); return; }
    mountedRoots.set(root, { parent: anchor.parentElement, target });
    const state = storedForTarget(target);
    const pending = ownedForTarget(pendingSaves, target);
    const record = pendingImage(pending, state.record);
    if (!record) { previous?.remove(); regions.delete(root); return; }
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
    const summary = el(doc, 'summary', pending ? '🖼 查看本面插图（尚未保存）' : '🖼 查看本面插图');
    const open = el(doc, 'button', '查看／编辑提示词', { type: 'button' });
    open.addEventListener('click', () => openMirrorImagePanel(root, { opener: open }));
    disclosure.append(summary, makeImage(doc, record), open); region.append(disclosure);
    anchor.after(region);
    regions.set(root, region);
    regionOwners.set(region, { root, target });
}

function closePanel() {
    if (!panel) return;
    const previous = panel;
    panel = null;
    try { previous.cleanup(); } finally {
        try { if (previous.host.open && typeof previous.host.close === 'function') previous.host.close(); } catch {}
        previous.host.remove();
    }
    try { previous.onClose?.(); } catch (error) { console.debug('[RabbitMirror] image panel tool restore skipped:', error); }
    if (previous.opener?.isConnected) previous.opener.focus();
}
export function closeMirrorImagePanel() { closePanel(); }

export function openMirrorImagePanel(root, { opener = null, onClose = null } = {}) {
    closePanel();
    const doc = root.ownerDocument;
    const target = targetFor(root);
    const state = target ? storedForTarget(target) : {};
    const panelJobs = new Set();
    const host = el(doc, 'dialog', '', { 'data-rm-image-portal': '', 'data-rm-tool-ui': 'true', 'aria-label': '兔子镜生图' });
    host.style.cssText = 'position:fixed;inset:0;margin:0;border:0;max-width:none;max-height:none;min-width:0;min-height:0;z-index:2147483646;background:#0007;display:flex;align-items:center;justify-content:center;padding:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));box-sizing:border-box;overflow:hidden;';
    applyAppearanceTheme(host);
    const style = el(doc, 'style');
    style.textContent = 'dialog[data-rm-image-portal]::backdrop{background:transparent}[data-rm-image-portal] button,[data-rm-image-portal] input,[data-rm-image-portal] textarea,[data-rm-image-portal] select{box-sizing:border-box;font:inherit;color:var(--rh-text,var(--SmartThemeBodyColor,#34495d));background:var(--rh-field,var(--rh-card,var(--SmartThemeBlurTintColor,#fff)));border:1px solid var(--rh-border,var(--SmartThemeBorderColor,#cfdae5));border-radius:8px}[data-rm-image-portal] button{min-height:42px;padding:8px 12px;white-space:normal;cursor:pointer}[data-rm-image-portal] button:disabled{opacity:.55;cursor:default}[data-rm-image-portal] a{color:var(--rh-primary,var(--SmartThemeQuoteColor,#ce729c))}[data-rm-image-portal] fieldset{min-width:0;border:1px solid var(--rh-border,var(--SmartThemeBorderColor,#cfdae5));border-radius:10px}';
    host.append(style);
    const box = el(doc, 'section', '', { role: 'dialog', 'aria-modal': 'true', 'aria-label': '兔子镜生图', tabindex: '-1' });
    box.style.cssText = 'width:620px;max-width:100%;max-height:100%;min-width:0;min-height:0;overflow:hidden;box-sizing:border-box;padding:16px;border-radius:18px;background:var(--rh-bg,var(--SmartThemeBlurTintColor,#fff));color:var(--rh-text,var(--SmartThemeBodyColor,#34495d));border:1px solid var(--rh-border,var(--SmartThemeBorderColor,#cfdae5));display:flex;flex-direction:column;gap:12px;font:16px/1.5 sans-serif;';
    const heading = el(doc, 'header'); heading.style.cssText = 'display:flex;align-items:center;gap:12px;flex:0 0 auto;';
    const title = el(doc, 'strong', target?.title || '兔子镜生图'); title.style.cssText = 'flex:1;overflow-wrap:anywhere;';
    const close = el(doc, 'button', '关闭', { type: 'button', 'data-rm-image-action': 'close' });
    close.addEventListener('click', closePanel); heading.append(title, close);
    const status = el(doc, 'p', state.error || (!target ? '这面兔子镜暂时无法绑定保存位置。请重新打开当前聊天中的已保存镜面；本次不会发起请求。' : '首次生成：构思一次，再出图一次。编辑、查看和保存草稿不调用模型。'), { role: 'status', 'aria-live': 'polite' });
    const planningLabel = () => imageLlmConfigured(getSettings()) ? '生图 LLM' : '副 API';
    const drawingLabel = () => getSettings().imageBackend === 'chatu8' ? '智绘姬' : '柏宝绘';
    const notice = el(doc, 'p', `重新构思：仅调用一次${planningLabel()}。按当前提示词绘制：仅调用一次${drawingLabel()}。`);
    const preview = el(doc, 'div');
    const fields = el(doc, 'div'); fields.style.cssText = 'display:grid;gap:12px;';
    const inputs = {};
    function field(name, label, tag = 'textarea') {
        const wrap = el(doc, 'label', label); wrap.style.cssText = 'display:grid;gap:5px;';
        const input = el(doc, tag, '', { 'data-rm-image-field': name });
        input.style.cssText = 'width:100%;min-width:0;box-sizing:border-box;font:inherit;padding:8px;';
        if (tag === 'textarea') { input.rows = 3; input.style.resize = 'vertical'; }
        inputs[name] = input; wrap.append(input); fields.append(wrap); return input;
    }
    const format = field('promptFormat', '提示词写法', 'select');
    const composition = field('compositionMode', '构图方式（重新构思时生效）', 'select');
    composition.append(el(doc, 'option', '场景插画', { value: 'scene' }), el(doc, 'option', '按展现形式演绎／长文本高光', { value: 'auto' }));
    composition.value = getSettings().imageCompositionMode || 'scene';
    format.append(el(doc, 'option', '自然语言＋标签（NAI 5）', { value: 'nai5-natural' }), el(doc, 'option', '标签（NAI 4.5）', { value: 'nai45-tags' }));
    field('prompt', '画面标签'); field('nl', '画面描述'); field('flatPrompt', '完整通用提示词（不支持独立人物字段的后端使用）');
    const characters = el(doc, 'div'); characters.style.cssText = 'display:grid;gap:12px;'; fields.append(characters);
    const size = field('size', '画幅', 'select');
    size.append(el(doc, 'option', '沿用生图渠道默认', { value: '' }), el(doc, 'option', '竖向', { value: 'portrait' }), el(doc, 'option', '横向', { value: 'landscape' }));
    const send = el(doc, 'details'); send.append(el(doc, 'summary', '本次发送预览'));
    const sendPreview = el(doc, 'pre'); sendPreview.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;'; send.append(sendPreview);
    const actions = el(doc, 'div'); actions.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    const buttons = {};
    function button(name, label, fn) {
        const b = el(doc, 'button', label, { type: 'button', 'data-rm-image-action': name });
        b.style.cssText = 'font:inherit;min-height:42px;white-space:normal;padding:8px 12px;';
        b.addEventListener('click', fn); actions.append(b); buttons[name] = b; return b;
    }
    const scroll = el(doc, 'div', '', { 'data-rm-image-scroll': '' });
    scroll.style.cssText = 'min-height:0;min-width:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;display:flex;flex-direction:column;gap:12px;';
    // 这一面有内置生图的图框时，最上面放「这一面的插图」（重画、翻历史）；原来的手动生图收进下面的折叠区。
    const builtinFrames = listBuiltinImageFrames(root);
    const builtin = builtinFrames.length ? buildBuiltinSection(doc, root, builtinFrames) : null;
    if (builtin) {
        const manual = el(doc, 'details', '', { 'data-rm-image-manual': '' });
        const manualSummary = el(doc, 'summary', '整面配图（手动生图）');
        manualSummary.style.cssText = 'cursor:pointer;min-height:36px;display:flex;align-items:center;';
        manual.style.cssText = 'border-top:1px solid var(--SmartThemeBorderColor,#cfdae5);padding-top:8px;';
        const manualBody = el(doc, 'div'); manualBody.style.cssText = 'display:flex;flex-direction:column;gap:12px;margin-top:8px;';
        manualBody.append(status, notice, actions, preview, fields, send);
        manual.append(manualSummary, manualBody);
        if (getSettings().imageEnabled !== true) manual.hidden = true;
        scroll.append(builtin.section, manual);
    } else scroll.append(status, notice, actions, preview, fields, send);
    box.append(heading, scroll); host.append(box); doc.body.append(host);
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
        const singlePrompt = buildSingleImagePrompt(draft);
        const chatu = getSettings().imageBackend === 'chatu8';
        sendPreview.textContent = JSON.stringify({ prompt: supports ? draft.prompt : singlePrompt,
            ...(!chatu ? { nl: draft.promptFormat === 'nai45-tags' ? '' : supports ? draft.nl : singlePrompt } : {}),
            ...(supports && draft.characters.length ? { characters: draft.characters.map(person => draft.promptFormat === 'nai45-tags' ? { ...person, nl: '' } : person) } : {}), ...(size.value ? { size: size.value } : {}) }, null, 2);
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
        const busy = ownedForTarget(jobs, target);
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
        buttons.saveOnly.hidden = !ownedForTarget(pendingSaves, target);
        buttons.generate.hidden = !!localRecord || !!inputs.prompt.value.trim();
        buttons.draw.textContent = localRecord ? '按当前提示词重新生图' : '按当前提示词生图';
        if (!enabled && target) status.textContent = '镜面生图尚未开启。请在兔子镜「设置 → 镜面生图」启用；已保存图片仍可查看。';
    }
    function notify() {
        panel?.renderState();
    }
    async function run(kind) {
        if (!target || !getSettings().imageEnabled || ownedForTarget(jobs, target)) return;
        if (!current(target)) { status.textContent = '聊天或这一面已变化，请回到对应镜面重新打开生图。'; return; }
        let owner = null;
        try { owner = captureMirrorImageOwner(target.key); } catch { /* No paid request without an owner. */ }
        if (!owner || !mirrorImageOwnerMatchesKey(owner, target.key)) {
            status.textContent = '这面兔子镜暂时无法绑定保存位置。请等待聊天加载完成后重新打开；本次没有发起请求。'; return;
        }
        const controller = new AbortController();
        const job = { owner, controller, allowNextDispatch: true };
        const assertCallerCurrent = () => { if (!job.allowNextDispatch) throw new Error('panel_closed'); };
        jobs.add(job); panelJobs.add(job); renderState();
        let completedDraft = null, draftSaveFailed = false;
        try {
            if (kind !== 'reconceive') {
                const connection = await getImageBackendStatus();
                if (!connection.configured) { status.textContent = `${drawingLabel()}尚未连接，请先完成它的连接配置。本次没有发起模型请求。`; return; }
            }
            let draft = readDraft();
            if (kind !== 'draw') {
                status.textContent = `正在构思画面（一次${planningLabel()}请求）…`;
                const publicCharacters = await getImageCharacters({ floor: target.floor });
                if (!current(target) || !mirrorImageOwnerMatchesKey(owner, target.key)) throw new Error('target_changed');
                assertCallerCurrent();
                const retainCompleted = value => {
                    completedDraft = value;
                    try { rememberDraft(target.key, value, owner); } catch { draftSaveFailed = true; }
                };
                draft = await target.plan({ publicCharacters, promptFormat: format.value, compositionMode: composition.value }, {
                    signal: controller.signal, onCompleted: retainCompleted, assertCallerCurrent,
                });
                // Older action bridges may only return their completed plan.
                if (completedDraft !== draft) retainCompleted(draft);
                if (!current(target) || !mirrorImageOwnerMatchesKey(owner, target.key)) throw new Error('target_changed');
                if (host.isConnected) fillDraft(draft);
            }
            if (kind === 'reconceive') {
                if (!host.isConnected && current(panel?.target) && mirrorImageOwnerMatchesKey(owner, panel?.target?.key)) panel.receive(localRecord, draft);
                status.textContent = draftSaveFailed ? '构思完成，但草稿未能保存；当前页面仍可编辑，请另行复制保留。'
                    : `构思完成。请检查提示词，点击生图才会调用${drawingLabel()}。`; return;
            }
            if (!current(target) || !mirrorImageOwnerMatchesKey(owner, target.key)) throw new Error('target_changed');
            if (controller.signal.aborted) throw new Error('aborted');
            assertCallerCurrent();
            if (kind === 'draw') { try { rememberDraft(target.key, draft, owner); } catch { /* Retain exact edited draft in this page even if storage is full. */ } }
            status.textContent = `正在调用${drawingLabel()}（一次生图调用）…`;
            const record = await generateMirrorImage(draft, { signal: controller.signal, character: target.group,
                ...(size.value ? { size: size.value } : {}), assertCurrent: target.assertCurrent,
                onProgress: progress => { if (host.isConnected) status.textContent = drawingLabel() + '：' + ({ queued:'排队中', generating:'绘制中', 'queued-remote':'远端排队中', retrying:'按生图渠道规则重试中', saving:'保存中' }[progress?.phase] || '处理中'); } });
            // Paid completion belongs to the captured message, even after its
            // numeric floor has moved or been reused by another message.
            const pending = pendingForOwner(target.key, owner);
            pending.records.push(record);
            savedImagesExist = true;
            try {
                localRecord = flushPendingImages(pending); status.textContent = '图片已保存到对应镜面。';
            } catch {
                localRecord = pendingImage(pending, current(target) && mirrorImageOwnerMatchesKey(owner, target.key) ? storedForTarget(target).record : null);
                status.textContent = '图片已生成，但此设备保存失败。请点击“只保存已生成图片”按顺序保存全部待存图片，或打开原图另存；不会再次生图。';
            }
            if (current(target) && mirrorImageOwnerMatchesKey(owner, target.key) && host.isConnected) showRecord(localRecord);
            else if (current(panel?.target) && mirrorImageOwnerMatchesKey(owner, panel?.target?.key)) panel.receive(localRecord, draft);
            if (current(target) && mirrorImageOwnerMatchesKey(owner, target.key) && root.isConnected) { mountedRoots.delete(root); mountMirrorImage(root); }
        } catch (error) {
            if (completedDraft && panel?.host !== host && current(panel?.target) && mirrorImageOwnerMatchesKey(owner, panel?.target?.key)) panel.receive(localRecord, completedDraft);
            // Never display arbitrary provider error bodies (may contain secrets).
            status.textContent = completedDraft && (!current(target) || !mirrorImageOwnerMatchesKey(owner, target.key))
                ? '聊天或镜面已变化，完成的构思已为原镜面保留，未继续生图。'
                : completedDraft && (controller.signal.aborted || !job.allowNextDispatch) ? '已停止后续绘制，完成的构思已保留。'
                : error?.message === 'target_changed' ? '聊天或镜面已变化，未继续生图。' : controller.signal.aborted ? '已请求取消；本次调用结算完成后才能再次生成。原图保留。' : `本次未完成。请检查${planningLabel()}／${drawingLabel()}连接或提示词；原图保留，没有自动补发。`;
        } finally {
            jobs.delete(job); panelJobs.delete(job); notify();
        }
    }
    button('generate', '构思并生成插图', () => run('generate'));
    button('reconceive', '重新构思（仅文本）', () => run('reconceive'));
    button('draw', '按当前提示词生图', () => run('draw'));
    button('saveDraft', '保存提示词草稿', () => {
        if (!current(target)) return;
        try { rememberDraft(target.key, readDraft(), captureMirrorImageOwner(target.key)); status.textContent = '草稿已保存，没有发起请求。'; }
        catch { status.textContent = '草稿保存失败，当前输入仍保留。'; }
    });
    button('cancel', '取消本次请求', () => {
        ownedForTarget(jobs, target)?.controller.abort(); status.textContent = '已请求取消，正在等待本次调用结束；不会自动重试。';
    });
    button('saveOnly', '只保存已生成图片', () => {
        const pending = ownedForTarget(pendingSaves, target); if (!pending) return;
        try {
            localRecord = flushPendingImages(pending);
            showRecord(localRecord); status.textContent = '图片已保存，没有调用模型。';
            if (current(target)) { mountedRoots.delete(root); mountMirrorImage(root); }
        } catch {
            localRecord = pendingImage(pending, storedForTarget(target).record); showRecord(localRecord);
            status.textContent = '保存仍未全部完成。已保存的图片与剩余待存图片均保留；请重试保存或打开原图另存，不会重新生成。';
        }
        renderState();
    });
    fields.addEventListener('input', event => {
        if (event.target !== inputs.flatPrompt && event.target !== size && event.target !== format && event.target !== composition && inputs.flatPrompt.value) {
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
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closePanel(); }
        if (event.key === 'Tab') {
            const focusable = [...box.querySelectorAll('button,input,textarea,select,a[href]')].filter(node => !node.disabled && !node.hidden && node.getClientRects().length);
            const first = focusable[0], last = focusable.at(-1);
            if (event.shiftKey && doc.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && doc.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
    }
    doc.defaultView.addEventListener('resize', fit); doc.defaultView.visualViewport?.addEventListener('resize', fit); doc.defaultView.visualViewport?.addEventListener('scroll', fit);
    host.addEventListener('keydown', keydown);
    host.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); closePanel(); });
    host.addEventListener('click', event => { if (event.target === host) closePanel(); event.stopPropagation(); });
    panel = { host, target, opener, onClose, renderState, receive: (record, draft) => { localRecord = record; fillDraft(draft); showRecord(record); }, cleanup: () => {
        // Closing keeps already-dispatched work and its lock alive, but cannot
        // start the next paid step when that work returns.
        for (const job of panelJobs) job.allowNextDispatch = false;
        doc.defaultView.removeEventListener('resize', fit); doc.defaultView.visualViewport?.removeEventListener('resize', fit); doc.defaultView.visualViewport?.removeEventListener('scroll', fit);
        builtin?.cleanup();
    } };
    const pending = ownedForTarget(pendingSaves, target);
    if (pending) localRecord = pendingImage(pending, localRecord);
    // 从存档还原时连人物外貌一起还原；旧记录没存人物就用实际发出去的整段（见 draftFromSavedImage）。
    const latestDraft = state.draft && (!localRecord || Number(state.draft.updatedAt || 0) >= (Date.parse(localRecord.generatedAt || '') || 0))
        ? state.draft : draftFromSavedImage(localRecord) || state.draft || {};
    fillDraft(latestDraft); showRecord(localRecord); renderState();
    let modalOpened = false;
    try {
        if (typeof host.showModal === 'function') { host.showModal(); modalOpened = true; }
    } catch { /* Older hosts may expose an unusable dialog API. */ }
    if (!modalOpened) {
        // A body sibling of an active modal is inert. Keep fallback UI in its
        // active subtree on WebViews without a working top-layer dialog API.
        const active = [...doc.querySelectorAll('dialog[open]')].reverse().find(node => {
            if (node === host) return false;
            try { return node.matches(':modal'); } catch { return true; }
        });
        (active || doc.body).append(host);
        host.setAttribute('open', '');
    }
    fit(); close.focus();
    Promise.resolve().then(() => getImageBackendStatus()).then(value => { backend = value; if (host.isConnected) { updatePreview(); renderState(); } }).catch(() => {});
}


// 「这一面的插图」：一面里每个内置图框各自的历史，选哪张就在镜面上显示哪张；「再画一张」只发一次生图请求。
// 关面板不会取消正在画的那张（画完照样存进去）；要停就点「取消这次」。
const builtinJobs = new Set();
function buildBuiltinSection(doc, root, initial) {
    const sectionTarget = targetFor(root);
    let frames = initial;
    let selected = 0;
    let editing = false;
    let message = '';
    const section = el(doc, 'section', '', { 'data-rm-builtin-image-panel': '' });
    section.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
    const head = el(doc, 'div'); head.style.cssText = 'display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;';
    const headTitle = el(doc, 'strong', '这一面的插图');
    const headNote = el(doc, 'span'); headNote.style.cssText = 'font-size:12px;opacity:.75;';
    head.append(headTitle, headNote);
    const tabs = el(doc, 'div', '', { role: 'tablist', 'aria-label': '选择是哪一张图' }); tabs.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';
    const view = el(doc, 'div'); view.style.cssText = 'position:relative;border-radius:12px;overflow:hidden;background:rgba(0,0,0,.06);min-height:120px;display:flex;align-items:center;justify-content:center;';
    const nav = el(doc, 'div'); nav.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;';
    const prev = el(doc, 'button', '‹', { type: 'button', 'aria-label': '上一张' });
    const counter = el(doc, 'span'); counter.style.cssText = 'min-width:56px;text-align:center;font-variant-numeric:tabular-nums;';
    const next = el(doc, 'button', '›', { type: 'button', 'aria-label': '下一张' });
    const navNote = el(doc, 'span', '镜面上显示这一张'); navNote.style.cssText = 'font-size:12px;opacity:.75;';
    for (const b of [prev, next]) b.style.cssText = 'min-width:44px;min-height:40px;font:inherit;font-size:18px;';
    nav.append(prev, counter, next, navNote);
    const statusLine = el(doc, 'p', '', { role: 'status' }); statusLine.style.cssText = 'margin:0;font-size:13px;';
    const row = el(doc, 'div'); row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    const roll = el(doc, 'button', '↻ 再画一张', { type: 'button', 'data-rm-builtin-action': 'reroll' });
    const cancel = el(doc, 'button', '取消这次', { type: 'button', 'data-rm-builtin-action': 'cancel' });
    const edit = el(doc, 'button', '改提示词再画', { type: 'button', 'data-rm-builtin-action': 'edit' });
    for (const b of [roll, cancel, edit]) b.style.cssText = 'min-height:44px;padding:8px 14px;font:inherit;white-space:normal;';
    roll.style.flex = '1 1 160px'; cancel.style.flex = '1 1 160px';
    row.append(roll, cancel, edit);
    const hint = el(doc, 'p', ''); hint.style.cssText = 'margin:0;font-size:12px;opacity:.75;';
    const sourceLine = el(doc, 'p', ''); sourceLine.style.cssText = 'margin:0;font-size:12px;opacity:.75;'; sourceLine.hidden = true;
    const editor = el(doc, 'div'); editor.style.cssText = 'display:grid;gap:6px;';
    const editLabel = el(doc, 'label', '这张图的提示词（这一面生成时写好的；改了只影响这次重画）'); editLabel.style.cssText = 'display:grid;gap:6px;font-size:13px;';
    const editBox = el(doc, 'textarea', '', { rows: '4' }); editBox.style.cssText = 'width:100%;min-width:0;box-sizing:border-box;font:inherit;padding:8px;resize:vertical;';
    const editGo = el(doc, 'button', '按改过的提示词画', { type: 'button', 'data-rm-builtin-action': 'reroll-edited' });
    editGo.style.cssText = 'min-height:44px;padding:8px 14px;font:inherit;';
    editLabel.append(editBox); editor.append(editLabel, editGo);
    section.append(head, tabs, view, nav, statusLine, row, hint, sourceLine, editor);

    const provider = () => getSettings().imageBackend === 'chatu8' ? '智绘姬' : '柏宝绘';
    const currentFrame = () => frames[Math.min(selected, frames.length - 1)];
    const frameJob = item => current(sectionTarget) && item ? ownedForTarget(builtinJobs, { key: item.key }) : null;
    const refresh = () => { frames = listBuiltinImageFrames(root); if (!frames.length) frames = initial; };
    // 关掉面板再打开：正在画的那张还在画，新面板接着看进度、画完也刷新。
    const mine = { onText: text => { if (section.isConnected) statusLine.textContent = text; }, done: () => { if (section.isConnected) { refresh(); render(); } } };
    function render() {
        if (!section.isConnected && section.parentNode) return;
        const item = currentFrame();
        const job = frameJob(item);
        if (job) job.listeners.add(mine);
        const ready = builtinImageReady() && current(sectionTarget);
        const firstDraw = item.busy && !job; // 这一面自己的首画还在跑
        headNote.textContent = `内置生图 · 共 ${frames.length} 张`;
        tabs.replaceChildren();
        tabs.hidden = frames.length < 2;
        frames.forEach((entry, index) => {
            const tab = el(doc, 'button', `图 ${index + 1}`, { type: 'button', role: 'tab', 'aria-selected': String(index === selected) });
            tab.style.cssText = `min-height:40px;padding:0 14px;border-radius:999px;font:inherit;font-size:13px;${index === selected ? 'font-weight:700;outline:2px solid currentColor;' : ''}`;
            tab.addEventListener('click', () => { selected = index; editing = false; message = ''; render(); });
            tabs.append(tab);
        });
        view.replaceChildren();
        const shown = item.versions[item.current];
        if (shown) {
            const image = makeImage(doc, shown);
            image.style.opacity = job ? '.55' : '1';
            image.addEventListener('error', () => { image.remove(); if (!view.firstChild) view.append(el(doc, 'span', '这张图读不到了，可以再画一张。')); }, { once: true });
            view.append(image);
        } else view.append(el(doc, 'span', item.broken && item.brokenCode === 'image_version_unconfirmed' ? '这张图认不出是哪一版，原档保留着。' : item.broken ? '这张图的存档读不出来。' : '这张图还没画。'));
        const total = item.versions.length;
        counter.textContent = total ? `${item.current + 1} / ${total}` : '0 / 0';
        const gone = !!sectionTarget && !current(sectionTarget);
        prev.disabled = gone || !!job || firstDraw || item.current <= 0;
        next.disabled = gone || !!job || firstDraw || item.current >= total - 1;
        nav.hidden = total < 2;
        roll.hidden = !!job; cancel.hidden = !job;
        // 只认不出原图是哪一版（旧分支）：原档留着，手动再画一张照样能存进这个分支，和图框里的「重新生图」一样能用。
        const unconfirmed = item.broken && item.brokenCode === 'image_version_unconfirmed';
        const blocked = item.broken && !unconfirmed;
        roll.disabled = !ready || firstDraw || blocked; edit.disabled = !ready || !!job || firstDraw || blocked; editGo.disabled = !ready || !!job || firstDraw || blocked;
        editor.hidden = !editing;
        if (editing && !editBox.dataset.forKey) { editBox.value = item.editPrompt || item.prompt; editBox.dataset.forKey = item.key; }
        const reusable = builtinImageReusable(shown);
        // 这张图每个人的长相是从哪来的（建档角色／人设／世界书／模型写的），画得不像时一眼看出哪一步没对上。
        const sources = shown?.looksSources && typeof shown.looksSources === 'object' ? Object.entries(shown.looksSources).map(([name, source]) => `${name}=${source}`).join(' ') : '';
        sourceLine.textContent = sources ? `长相来源：${sources}` : '';
        sourceLine.hidden = !sources;
        hint.textContent = !ready
            ? '内置生图没有开启：在兔子镜设置里打开后才能重画；已经画好的图照样能翻看、切换。'
            : unconfirmed ? `这张图的存档认不出是哪一版（旧分支留下的），原档保留不动；再画一张会存进这个分支，花一次${provider()}额度。`
            : item.broken ? '这张图的存档读不出来，重画的结果会存不进去，所以先不让画。'
            : reusable ? `同一段提示词，换随机种子再画一次，花一次${provider()}额度，不调用语言模型。最多留 5 张。`
            : `这张是旧版本画的，没留下当时的提示词：再画会按这一面写的画面重新准备一次提示词${imageLlmConfigured(getSettings()) ? '（会调用一次生图 LLM）' : ''}，再花一次${provider()}额度。`;
        statusLine.textContent = job ? (job.text || `正在画第 ${Math.min(5, total + 1)} 张…`) : firstDraw ? '这一面自己的那张正在画，画完再重画。' : message;
    }
    async function start(edited) {
        const item = currentFrame();
        if (!current(sectionTarget) || frameJob(item)) return;
        let owner = null;
        try { owner = captureMirrorImageOwner(item.key); } catch { /* Wait for a usable save owner. */ }
        if (!owner || !mirrorImageOwnerMatchesKey(owner, item.key)) {
            statusLine.textContent = '这面兔子镜暂时无法绑定保存位置，请重新打开当前镜面；本次没有发起请求。'; return;
        }
        const controller = new AbortController();
        const job = { owner, controller, text: '', listeners: new Set([mine]) };
        builtinJobs.add(job);
        message = ''; render();
        try {
            const { painted, saveError } = await rerollBuiltinImage(root, item.frame, { prompt: edited, signal: controller.signal,
                onText: text => { job.text = text; for (const listener of job.listeners) { try { listener.onText?.(text); } catch { /* 面板已关 */ } } } });
            message = saveError
                ? `画好了${painted ? '、镜面上先换成了新画的这张' : ''}，但没能存进本机存档（${/quota/i.test(String(saveError?.name || saveError?.message || '')) ? '本机存储满了' : String(saveError?.message || '写入失败').slice(0, 60)}；${describeLocalStorageUsage()}），所以这里还是旧的几张、翻不到新图，刷新后也会变回旧图。${provider() === '柏宝绘' ? '柏宝绘图库里有这张。' : '这张图没能存下来。'}`
                : painted ? '画好了，镜面上已经换成新画的这张。' : '画好了、已经存档；这一面刚重新加载过，刷新这一面后显示。';
        } catch (error) {
            message = controller.signal.aborted ? '已取消，原来的图没动。'
                : `这次没画成，原来的图没动。${String(error?.message || '').slice(0, 120)}`;
        } finally {
            builtinJobs.delete(job);
            refresh();
            for (const listener of job.listeners) { try { listener.done?.(); } catch { /* 面板已关 */ } }
        }
    }
    roll.addEventListener('click', () => start(''));
    cancel.addEventListener('click', () => { const job = frameJob(currentFrame()); if (!job) { refresh(); render(); return; } job.controller.abort(); statusLine.textContent = '已请求取消，等这次调用结束；不会自动重试。'; });
    edit.addEventListener('click', () => { editing = !editing; editBox.dataset.forKey = ''; render(); });
    editGo.addEventListener('click', () => { const text = editBox.value.trim(); if (text.length < 4) { statusLine.textContent = '提示词太短了。'; return; } start(text); });
    // 面板打开以后，这一层换成了别的消息（删楼、重新生成）：旧面板不再切图，免得改到新消息的插图。
    const stale = () => !!sectionTarget && !current(sectionTarget);
    const step = delta => {
        if (stale()) { message = '这一面已经换成别的回复了，这个面板不能再切图；请关掉面板，在现在这一面上重新打开。'; render(); return; }
        const item = currentFrame();
        const target = item.current + delta;
        if (target < 0 || target >= item.versions.length) return;
        try { showBuiltinImageVersion(root, item.frame, target); message = ''; }
        catch { message = '没能切换（本机存储写不进去），镜面上的图没变。'; }
        refresh();
        render();
    };
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    render();
    return { section, cleanup: () => {} };
}
