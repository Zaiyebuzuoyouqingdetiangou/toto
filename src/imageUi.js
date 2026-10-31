import { rmT as __rmT } from "./textTable.js?rmv=2.3.3";
import { describeLocalStorageUsage } from './storageUsage.js?rmv=2.3.3';
import { getSettings } from './settings.js?rmv=2.3.3';
import { getImageBackendStatus, getImageCharacters, generateMirrorImage } from './baibaiImage.js?rmv=2.3.3';
import { captureMirrorImageOwner, mirrorImageOwnerSourceKey, mirrorImageOwnerMatchesKey, mirrorImageOwnerReceipt, saveMirrorImageForOwner, loadMirrorImage, loadMirrorImageDraft, saveMirrorImageDraft, mirrorImagePromptCleanupRevision, MIRROR_IMAGE_PROMPTS_CLEARED_EVENT } from './imageStore.js?rmv=2.3.3';
import { applyAppearanceTheme } from './appearanceTheme.js?rmv=2.3.3';
import { imageLlmConfigured } from './imageLlm.js?rmv=2.3.3';
import { buildSingleImagePrompt } from './imagePromptPayload.js?rmv=2.3.3';
import { draftFromSavedImage } from './chatu8Image.js?rmv=2.3.3';
import { listBuiltinImageFrames, rerollBuiltinImage, showBuiltinImageVersion, builtinImageReady, builtinImageReusable } from './builtinImage.js?rmv=2.3.3';
const jobs = new Set();
const pendingSaves = new Set();
const sessionDrafts = new Set();
let draftCleanupRevision = mirrorImagePromptCleanupRevision();
function syncPromptCleanup() {
    const revision = mirrorImagePromptCleanupRevision();
    if (revision === draftCleanupRevision)
        return;
    sessionDrafts.clear();
    draftCleanupRevision = revision;
}
const regions = new WeakMap();
const mountedRoots = new WeakMap();
const regionOwners = new WeakMap();
let savedImagesExist = null;
let panel = null;
function hasStoredImages() {
    if (savedImagesExist !== null)
        return savedImagesExist;
    try {
        savedImagesExist = false;
        for (let i = 0; i < globalThis.localStorage.length; i++) {
            if (globalThis.localStorage.key(i)?.startsWith('rabbitMirror:image:v1:images:')) {
                savedImagesExist = true;
                break;
            }
        }
    }
    catch {
        savedImagesExist = true;
    }
    if (!savedImagesExist) {
        try {
            const chat = globalThis.SillyTavern?.getContext?.()?.chat;
            const has = Array.isArray(chat) && chat.some(msg => (msg?.extra?.rabbitMirrorImages && Object.keys(msg.extra.rabbitMirrorImages).length)
                || (Array.isArray(msg?.swipe_info) && msg.swipe_info.some(info => info?.extra?.rabbitMirrorImages && Object.keys(info.extra.rabbitMirrorImages).length)));
            if (has) {
                savedImagesExist = true;
                return true;
            }
        }
        catch { }
        savedImagesExist = null;
        return false;
    }
    return savedImagesExist;
}
function targetFor(root) {
    try {
        return globalThis.__rabbitMirrorIndependentActionsV1?.prepareImageTarget?.(root) || null;
    }
    catch {
        return null;
    }
}
function current(target) {
    try {
        return !!target && target.assertCurrent?.() !== false;
    }
    catch {
        return false;
    }
}
function el(doc, tag, text, attrs = {}) {
    const node = doc.createElement(tag);
    if (text)
        node.textContent = text;
    for (const [name, value] of Object.entries(attrs))
        node.setAttribute(name, value);
    return node;
}
function safeImageUrl(value) {
    const text = String(value || '');
    if (!text)
        return '';
    if (/^data:image\/(?:png|jpeg|webp|gif);base64,[a-z\d+/=\s]+$/i.test(text))
        return text;
    try {
        const url = new URL(text, document.baseURI);
        if (['http:', 'https:'].includes(url.protocol))
            return url.href;
        const host = new URL(document.location?.href || document.baseURI);
        if (host.protocol === 'tauri:' && host.host === 'localhost'
            && url.protocol === host.protocol && url.host === host.host
            && !host.username && !host.password && !url.username && !url.password)
            return url.href;
        return '';
    }
    catch {
        return '';
    }
}
function makeImage(doc, record) {
    const image = el(doc, 'img', '', { alt: __rmT("7eHbUflchZVaLn9MCsSXAo3W") });
    image.style.cssText = 'display:block;max-width:100%;height:auto;object-fit:contain;margin:auto;';
    const url = safeImageUrl(record?.url || record?.path || record?.dataUrl);
    if (url)
        image.src = url;
    return image;
}
function stored(key) {
    syncPromptCleanup();
    const session = ownedForTarget(sessionDrafts, { key });
    try {
        const savedDraft = loadMirrorImageDraft(key);
        const draft = savedDraft?.imageOwnerReceipt && !mirrorImageOwnerMatchesKey(savedDraft.imageOwnerReceipt, key) ? null : savedDraft;
        return { record: loadMirrorImage(key), draft: session?.draft || draft };
    }
    catch {
        return { record: null, draft: session?.draft || null, error: __rmT("qqUX8uX8.tOEBePmRpsPvYxUR4UmYCrD6fsj3H5aPybwk3SzH7kQrISyuyf9uT") };
    }
}
function storedForTarget(target) {
    const primary = stored(target.key);
    if (primary.record || primary.error)
        return primary;
    for (const key of Array.isArray(target.altKeys) ? target.altKeys : []) {
        const alt = stored(key);
        if (alt.record)
            return { ...primary, record: alt.record };
    }
    return primary;
}
function rememberDraft(key, draft, owner) {
    syncPromptCleanup();
    if (!owner)
        throw new Error('target_changed');
    const value = { ...draft, updatedAt: Date.now() };
    const previous = [...sessionDrafts].find(entry => sameOwner(entry.owner, owner));
    if (previous)
        previous.draft = value;
    else
        sessionDrafts.add({ owner, draft: value });
    if (!mirrorImageOwnerMatchesKey(owner, key))
        return;
    saveMirrorImageDraft(key, { ...value, imageOwnerReceipt: mirrorImageOwnerReceipt(owner) });
}
function sameOwner(left, right) {
    return left.token === right.token && left.entry === right.entry && left.chat === right.chat && mirrorImageOwnerSourceKey(left) === mirrorImageOwnerSourceKey(right)
        && (left.scope || '') === (right.scope || '');
}
function ownedForTarget(entries, target) {
    if (!target || !current(target))
        return null;
    for (const entry of entries)
        if (mirrorImageOwnerMatchesKey(entry.owner, target.key))
            return entry;
    return null;
}
function pendingForOwner(key, owner) {
    for (const pending of pendingSaves) {
        if (sameOwner(pending.owner, owner))
            return pending;
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
    if (!records?.length)
        return saved;
    const { history = [], ...currentSaved } = saved || {};
    const previous = [...history, ...(saved ? [currentSaved] : [])]
        .filter(record => !records.some(paid => samePaidImage(record, paid)));
    return { ...records.at(-1), history: [...previous, ...records.slice(0, -1)] };
}
function flushPendingImages(pending) {
    let saved = null;
    while (pending?.records.length) {
        saved = saveMirrorImageForOwner(pending.key, pending.records[0], pending.owner);
        pending.records.shift();
    }
    if (pending && !pending.records.length)
        pendingSaves.delete(pending);
    return saved;
}
export function mountMirrorImage(root) {
    if (!root?.isConnected)
        return;
    const anchor = root.closest('toto') || root;
    const mounted = mountedRoots.get(root);
    if (mounted?.parent === anchor.parentElement && current(mounted.target))
        return;
    for (const sibling of Array.from(anchor.parentElement?.children || [])) {
        const owner = regionOwners.get(sibling);
        if (sibling.hasAttribute('data-rm-image-region') && (!owner?.root.isConnected || !current(owner.target)))
            sibling.remove();
    }
    if (!pendingSaves.size && !hasStoredImages())
        return;
    const target = targetFor(root);
    const previous = regions.get(root);
    if (!target) {
        previous?.remove();
        regions.delete(root);
        return;
    }
    mountedRoots.set(root, { parent: anchor.parentElement, target });
    const state = storedForTarget(target);
    const pending = ownedForTarget(pendingSaves, target);
    const record = pendingImage(pending, state.record);
    if (!record) {
        previous?.remove();
        regions.delete(root);
        return;
    }
    if (previous?.isConnected && previous.dataset.rmImageKey === target.key && previous.dataset.rmImageStamp === String(record.generatedAt || ''))
        return;
    previous?.remove();
    for (const sibling of Array.from(anchor.parentElement?.children || [])) {
        if (sibling !== anchor && sibling.hasAttribute('data-rm-image-region') && sibling.dataset.rmImageKey === target.key)
            sibling.remove();
    }
    const doc = root.ownerDocument;
    const region = el(doc, 'div', '', { 'data-rm-image-region': '', 'data-rm-tool-ui': 'true' });
    const disclosure = el(doc, 'details');
    region.dataset.rmImageKey = target.key;
    region.dataset.rmImageStamp = String(record.generatedAt || '');
    region.style.cssText = 'display:block;clear:both;max-width:100%;box-sizing:border-box;margin:8px 0;padding:10px;border:1px solid var(--SmartThemeBorderColor,#cfdae5);border-radius:12px;';
    const summary = el(doc, 'summary', pending ? __rmT("aVRKEwnJIKvADI70d0xjzuhOdZ4MsozhfGdYcmZ8") : __rmT("Gfq0ICrSlI_.3YHD3ZdXAo3W"));
    const open = el(doc, 'button', __rmT("O8S4HLR32MC_mazMwDCggk"), { type: 'button' });
    open.addEventListener('click', () => openMirrorImagePanel(root, { opener: open }));
    disclosure.append(summary, makeImage(doc, record), open);
    region.append(disclosure);
    anchor.after(region);
    regions.set(root, region);
    regionOwners.set(region, { root, target });
}
function closePanel() {
    if (!panel)
        return;
    const previous = panel;
    panel = null;
    try {
        previous.cleanup();
    }
    finally {
        try {
            if (previous.host.open && typeof previous.host.close === 'function')
                previous.host.close();
        }
        catch { }
        previous.host.remove();
    }
    try {
        previous.onClose?.();
    }
    catch (error) {
        console.debug('[RabbitMirror] image panel tool restore skipped:', error);
    }
    if (previous.opener?.isConnected)
        previous.opener.focus();
}
export function closeMirrorImagePanel() { closePanel(); }
export function openMirrorImagePanel(root, { opener = null, onClose = null } = {}) {
    closePanel();
    const doc = root.ownerDocument;
    const target = targetFor(root);
    const state = target ? storedForTarget(target) : {};
    const panelJobs = new Set();
    const host = el(doc, 'dialog', '', { 'data-rm-image-portal': '', 'data-rm-tool-ui': 'true', 'aria-label': __rmT("8vfuqCi7DgNrUk") });
    host.style.cssText = 'position:fixed;inset:0;margin:0;border:0;max-width:none;max-height:none;min-width:0;min-height:0;z-index:2147483646;background:#0007;display:flex;align-items:center;justify-content:center;padding:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));box-sizing:border-box;overflow:hidden;';
    applyAppearanceTheme(host);
    const style = el(doc, 'style');
    style.textContent = 'dialog[data-rm-image-portal]::backdrop{background:transparent}[data-rm-image-portal] button,[data-rm-image-portal] input,[data-rm-image-portal] textarea,[data-rm-image-portal] select{box-sizing:border-box;font:inherit;color:var(--rh-text,var(--SmartThemeBodyColor,#34495d));background:var(--rh-field,var(--rh-card,var(--SmartThemeBlurTintColor,#fff)));border:1px solid var(--rh-border,var(--SmartThemeBorderColor,#cfdae5));border-radius:8px}[data-rm-image-portal] button{min-height:42px;padding:8px 12px;white-space:normal;cursor:pointer}[data-rm-image-portal] button:disabled{opacity:.55;cursor:default}[data-rm-image-portal] a{color:var(--rh-primary,var(--SmartThemeQuoteColor,#ce729c))}[data-rm-image-portal] fieldset{min-width:0;border:1px solid var(--rh-border,var(--SmartThemeBorderColor,#cfdae5));border-radius:10px}';
    host.append(style);
    const box = el(doc, 'section', '', { role: 'dialog', 'aria-modal': 'true', 'aria-label': __rmT("8vfuqCi7DgNrUk"), tabindex: '-1' });
    box.style.cssText = 'width:620px;max-width:100%;max-height:100%;min-width:0;min-height:0;overflow:hidden;box-sizing:border-box;padding:16px;border-radius:18px;background:var(--rh-bg,var(--SmartThemeBlurTintColor,#fff));color:var(--rh-text,var(--SmartThemeBodyColor,#34495d));border:1px solid var(--rh-border,var(--SmartThemeBorderColor,#cfdae5));display:flex;flex-direction:column;gap:12px;font:16px/1.5 sans-serif;';
    const heading = el(doc, 'header');
    heading.style.cssText = 'display:flex;align-items:center;gap:12px;flex:0 0 auto;';
    const title = el(doc, 'strong', target?.title || __rmT("8vfuqCi7DgNrUk"));
    title.style.cssText = 'flex:1;overflow-wrap:anywhere;';
    const close = el(doc, 'button', __rmT("t8hHPh"), { type: 'button', 'data-rm-image-action': 'close' });
    close.addEventListener('click', closePanel);
    heading.append(title, close);
    const status = el(doc, 'p', state.error || (!target ? __rmT("GVZEgQQtm7c6MpqL5HZixZTM2peNjP.LRi2dncLcVOXUBj6QivUWdZ4GLwOzfulutfny6CWwW0pSwnHhvGY3VYcayv0f8f4bZjkFdPt.FMX8.i_z") : __rmT("nzMTU28qNgVBhvwCzAQ_F.tr_QapFdjFoVBLyVnqVL3U6ffCZLwCyJxFz3w3iCfH2.ADscP2PblqI_PqJ4pFrh")), { role: 'status', 'aria-live': 'polite' });
    const planningLabel = () => imageLlmConfigured(getSettings()) ? __rmT("lG.pzLFyLF2NBMEq") : __rmT("az3HOeBp2slxTh");
    const drawingLabel = () => getSettings().imageBackend === 'chatu8' ? __rmT("OyY9PHpS") : __rmT("lo7wSMYV");
    const notice = el(doc, 'p', `${__rmT("YTlLwp.mb9Sy3XsiMKduER5Tjwf")}${planningLabel()}${__rmT("F6wD4DoePXUwRkQKRZI3VVkUSvkU8sUg.6tlT.TE")}${drawingLabel()}${__rmT("jzk")}`);
    const preview = el(doc, 'div');
    const fields = el(doc, 'div');
    fields.style.cssText = 'display:grid;gap:12px;';
    const inputs = {};
    function field(name, label, tag = 'textarea') {
        const wrap = el(doc, 'label', label);
        wrap.style.cssText = 'display:grid;gap:5px;';
        const input = el(doc, tag, '', { 'data-rm-image-field': name });
        input.style.cssText = 'width:100%;min-width:0;box-sizing:border-box;font:inherit;padding:8px;';
        if (tag === 'textarea') {
            input.rows = 3;
            input.style.resize = 'vertical';
        }
        inputs[name] = input;
        wrap.append(input);
        fields.append(wrap);
        return input;
    }
    const format = field('promptFormat', __rmT("uxu5mR9tHHJ.Ph"), 'select');
    const composition = field('compositionMode', __rmT("T_gkkVYIdouOYvr_un82iW7Y3pnyH6mJuLf"), 'select');
    composition.append(el(doc, 'option', __rmT("_FvxFGnMwJs"), { value: 'scene' }), el(doc, 'option', __rmT("nluPzUTjKyudsmOSrvLfDONOIYnK.ZscQ_G"), { value: 'auto' }));
    composition.value = getSettings().imageCompositionMode || 'scene';
    format.append(el(doc, 'option', __rmT("KZgptdNnhSNMauU_i7S0TQ1idfEPVGbBhUdqqh"), { value: 'nai5-natural' }), el(doc, 'option', __rmT("JskGJXqiIxQiBSmG4gh7JlXr93tRcT"), { value: 'nai45-tags' }));
    field('prompt', __rmT("_PMsVc1xXNp"));
    field('nl', __rmT("_PMsVFWM3cY"));
    field('flatPrompt', __rmT("RAdA48Qxrt.zezbAGuKkjERR6ndoe1SLqbF6NXF6KwQkQ3HKbnQFlnXNgmCO9k"));
    const characters = el(doc, 'div');
    characters.style.cssText = 'display:grid;gap:12px;';
    fields.append(characters);
    const size = field('size', __rmT("3MvIuf"), 'select');
    size.append(el(doc, 'option', __rmT("qByhHqtjO8z.1iRQjdFSgk"), { value: '' }), el(doc, 'option', __rmT("d9te2T"), { value: 'portrait' }), el(doc, 'option', __rmT("uPte2T"), { value: 'landscape' }));
    const send = el(doc, 'details');
    send.append(el(doc, 'summary', __rmT("kud2RQs3VhBZXvMX")));
    const sendPreview = el(doc, 'pre');
    sendPreview.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;';
    send.append(sendPreview);
    const actions = el(doc, 'div');
    actions.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    const buttons = {};
    function button(name, label, fn) {
        const b = el(doc, 'button', label, { type: 'button', 'data-rm-image-action': name });
        b.style.cssText = 'font:inherit;min-height:42px;white-space:normal;padding:8px 12px;';
        b.addEventListener('click', fn);
        actions.append(b);
        buttons[name] = b;
        return b;
    }
    const scroll = el(doc, 'div', '', { 'data-rm-image-scroll': '' });
    scroll.style.cssText = 'min-height:0;min-width:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;display:flex;flex-direction:column;gap:12px;';
    const builtinFrames = listBuiltinImageFrames(root);
    const builtin = builtinFrames.length ? buildBuiltinSection(doc, root, builtinFrames) : null;
    if (builtin) {
        const manual = el(doc, 'details', '', { 'data-rm-image-manual': '' });
        const manualSummary = el(doc, 'summary', __rmT("MwbpnGJQWuM_3apzfkoiEzgG3dk"));
        manualSummary.style.cssText = 'cursor:pointer;min-height:36px;display:flex;align-items:center;';
        manual.style.cssText = 'border-top:1px solid var(--SmartThemeBorderColor,#cfdae5);padding-top:8px;';
        const manualBody = el(doc, 'div');
        manualBody.style.cssText = 'display:flex;flex-direction:column;gap:12px;margin-top:8px;';
        manualBody.append(status, notice, actions, preview, fields, send);
        manual.append(manualSummary, manualBody);
        if (getSettings().imageEnabled !== true)
            manual.hidden = true;
        scroll.append(builtin.section, manual);
    }
    else
        scroll.append(status, notice, actions, preview, fields, send);
    box.append(heading, scroll);
    host.append(box);
    doc.body.append(host);
    let backend = null;
    let characterInputs = [];
    let localRecord = state.record;
    function readDraft() {
        return { prompt: inputs.prompt.value, nl: inputs.nl.value, flatPrompt: inputs.flatPrompt.value,
            promptFormat: format.value, characters: characterInputs.map(row => ({ name: row.name.value, tag: row.tag.value, nl: row.nl.value })).filter(row => row.name || row.tag || row.nl) };
    }
    function fillDraft(value = {}) {
        for (const name of ['prompt', 'nl', 'flatPrompt'])
            inputs[name].value = value[name] || '';
        format.value = value.promptFormat || getSettings().imagePromptFormat;
        characters.replaceChildren();
        characterInputs = [];
        for (const source of value.characters || []) {
            const group = el(doc, 'fieldset');
            group.append(el(doc, 'legend', __rmT("_P655i5j69h")));
            const row = {};
            for (const [key, label] of [['name', __rmT("W84Q2T")], ['tag', __rmT("jFQZ4V1xXNp")], ['nl', __rmT("jFQZ4QWM3cY")]]) {
                const wrap = el(doc, 'label', label);
                wrap.style.cssText = 'display:grid;gap:4px;margin:6px 0;';
                const input = el(doc, key === 'name' ? 'input' : 'textarea', '', { 'data-rm-image-character': key });
                input.value = source[key] || '';
                input.style.cssText = 'width:100%;min-width:0;box-sizing:border-box;font:inherit;';
                row[key] = input;
                wrap.append(input);
                group.append(wrap);
            }
            characterInputs.push(row);
            characters.append(group);
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
        if (!record)
            return;
        preview.append(makeImage(doc, record));
        const link = el(doc, 'a', __rmT("r9WoqsWJoBT"), { target: '_blank', rel: 'noopener noreferrer' });
        const url = safeImageUrl(record.url || record.path || record.dataUrl);
        if (url)
            link.href = url;
        preview.append(link);
        if (record.history?.length) {
            const history = el(doc, 'details');
            history.append(el(doc, 'summary', __rmT("gzlbn.vh8hifXQI.Z_k")));
            for (const old of record.history)
                history.append(makeImage(doc, old));
            preview.append(history);
        }
    }
    function renderState() {
        if (!host.isConnected)
            return;
        const busy = ownedForTarget(jobs, target);
        const enabled = getSettings().imageEnabled === true;
        box.setAttribute('aria-busy', String(!!busy));
        for (const node of fields.querySelectorAll('input,textarea,select'))
            node.disabled = !!busy;
        for (const name of ['generate', 'reconceive', 'draw'])
            buttons[name].disabled = !target || !enabled || !!busy;
        const draft = readDraft();
        const drawablePrompt = backend?.supportsCharacters === false
            ? draft.flatPrompt || (draft.characters.length ? '' : draft.prompt) : draft.prompt;
        buttons.draw.disabled ||= !drawablePrompt.trim();
        buttons.saveDraft.disabled = !target || !!busy;
        buttons.cancel.hidden = !busy;
        buttons.saveOnly.hidden = !ownedForTarget(pendingSaves, target);
        buttons.generate.hidden = !!localRecord || !!inputs.prompt.value.trim();
        buttons.draw.textContent = localRecord ? __rmT("Um1cOGQJEMiisobPQ_fIGltgh_C") : __rmT("N8520Z1T92LqzjcZdBY8sf");
        if (!enabled && target)
            status.textContent = __rmT("58uQUPJY86mCU.DbyKQO67w1.e4mg5vHcw9c.ViYmXLywDkw5A3OFEy8P0211YDyK6YfmTNQdkncTg0AVqTQFW7_fLo1kvTrEwELRf");
    }
    function notify() {
        panel?.renderState();
    }
    async function run(kind) {
        if (!target || !getSettings().imageEnabled || ownedForTarget(jobs, target))
            return;
        if (!current(target)) {
            status.textContent = __rmT("0jQkHf6UfFdNusPAvau7RpS2N7WK9zr_reWOZUelxOCETvrWeFsPnSOtmJtHuvkC");
            return;
        }
        let owner = null;
        try {
            owner = captureMirrorImageOwner(target.key);
        }
        catch { }
        if (!owner || !mirrorImageOwnerMatchesKey(owner, target.key)) {
            status.textContent = __rmT("EYmAVP3eTXDnx1LgQkeBfgbIxZkCK8DmX2yd5tz7VH2NdWyf1vPz4Z2g2p9lAtACXLCcXnAzHkI9b3QNh074lE6rDRMQNKqOM2edXGVU79s");
            return;
        }
        const controller = new AbortController();
        const job = { owner, controller, allowNextDispatch: true };
        const assertCallerCurrent = () => { if (!job.allowNextDispatch)
            throw new Error('panel_closed'); };
        jobs.add(job);
        panelJobs.add(job);
        renderState();
        let completedDraft = null, draftSaveFailed = false;
        try {
            if (kind !== 'reconceive') {
                const connection = await getImageBackendStatus();
                if (!connection.configured) {
                    status.textContent = `${drawingLabel()}${__rmT("MI_thw3paRV65K3f1zxkj79.4ZjoNXnwRGdDh8IvoqjE2tX4KWRIJq45wkyZSa8q6wdJMuGP")}`;
                    return;
                }
            }
            let draft = readDraft();
            if (kind !== 'draw') {
                status.textContent = `${__rmT("m6Fq0yjVvIk33TZ81AVEm4ON")}${planningLabel()}${__rmT("wCz_6VKdGbG")}`;
                const publicCharacters = await getImageCharacters({ floor: target.floor });
                if (!current(target) || !mirrorImageOwnerMatchesKey(owner, target.key))
                    throw new Error('target_changed');
                assertCallerCurrent();
                const retainCompleted = value => {
                    completedDraft = value;
                    try {
                        rememberDraft(target.key, value, owner);
                    }
                    catch {
                        draftSaveFailed = true;
                    }
                };
                draft = await target.plan({ publicCharacters, promptFormat: format.value, compositionMode: composition.value }, {
                    signal: controller.signal, onCompleted: retainCompleted, assertCallerCurrent,
                });
                if (completedDraft !== draft)
                    retainCompleted(draft);
                if (!current(target) || !mirrorImageOwnerMatchesKey(owner, target.key))
                    throw new Error('target_changed');
                if (host.isConnected)
                    fillDraft(draft);
            }
            if (kind === 'reconceive') {
                if (!host.isConnected && current(panel?.target) && mirrorImageOwnerMatchesKey(owner, panel?.target?.key))
                    panel.receive(localRecord, draft);
                status.textContent = draftSaveFailed ? __rmT("wGdzFnmxWbmt9YwSC6Isuwdu0XWhdByqArrPSNEKpZsmQmZE58u41Up7p6BXhmJMPFlTH6MJIyIarlH9") : `${__rmT("Zg.lSfUeWxSjLt3W8B08QLRBjwlE87UGsZJGskH0nUMtD7WDq3hEkk")}${drawingLabel()}${__rmT("jzk")}`;
                return;
            }
            if (!current(target) || !mirrorImageOwnerMatchesKey(owner, target.key))
                throw new Error('target_changed');
            if (controller.signal.aborted)
                throw new Error('aborted');
            assertCallerCurrent();
            if (kind === 'draw') {
                try {
                    rememberDraft(target.key, draft, owner);
                }
                catch { }
            }
            status.textContent = `${__rmT("J94accYePMs")}${drawingLabel()}${__rmT("UzHbUY4QvhjBerL0ts.Unns7")}`;
            const record = await generateMirrorImage(draft, { signal: controller.signal, character: target.group,
                ...(size.value ? { size: size.value } : {}), assertCurrent: target.assertCurrent,
                onProgress: progress => { if (host.isConnected)
                    status.textContent = drawingLabel() + __rmT("7ys") + ({ queued: __rmT("2y4.7Ukc"), generating: __rmT("QwqphUkc"), 'queued-remote': __rmT("Nm9dm8eWDVee0k"), retrying: __rmT("UmrFP4VyfM21ry6Hsf3sekCcY.p"), saving: __rmT("Dsv9Sckc") }[progress?.phase] || __rmT("X.PAHVkc")); } });
            const pending = pendingForOwner(target.key, owner);
            pending.records.push(record);
            savedImagesExist = true;
            try {
                localRecord = flushPendingImages(pending);
                status.textContent = __rmT("Aw87DO3lUVcqyeNMcoyx3PAnmCnrrk");
            }
            catch {
                localRecord = pendingImage(pending, current(target) && mirrorImageOwnerMatchesKey(owner, target.key) ? storedForTarget(target).record : null);
                status.textContent = __rmT("Y6vl2_EIwEDr1vhyRRAW.gXmcewxNLVnS.j7D848UItezKOgUn2azzcvj_4U6doPjB_EbIhMDXmF7_fsNPzylK_zwzvSz74rmw9h86FrTFyd5PZs4LCRjK.kotRQGdUYMjoo5U_oKxOElcKJf_C");
            }
            if (current(target) && mirrorImageOwnerMatchesKey(owner, target.key) && host.isConnected)
                showRecord(localRecord);
            else if (current(panel?.target) && mirrorImageOwnerMatchesKey(owner, panel?.target?.key))
                panel.receive(localRecord, draft);
            if (current(target) && mirrorImageOwnerMatchesKey(owner, target.key) && root.isConnected) {
                mountedRoots.delete(root);
                mountMirrorImage(root);
            }
        }
        catch (error) {
            if (completedDraft && panel?.host !== host && current(panel?.target) && mirrorImageOwnerMatchesKey(owner, panel?.target?.key))
                panel.receive(localRecord, completedDraft);
            status.textContent = completedDraft && (!current(target) || !mirrorImageOwnerMatchesKey(owner, target.key))
                ? __rmT("OgmBVNgWMhLuN2RQ3DDF6gS1CBYMSmVX5.MrUbb1Rv4JUPlrxEr8LxsWbTfjcUebHkybE.IZY3Y") : completedDraft && (controller.signal.aborted || !job.allowNextDispatch) ? __rmT("HMZrYYtQvdO9sI79.RrrIQ4V98MnjJUiZa8vmi22mAX.bh") : error?.message === 'target_changed' ? __rmT("PTwGREJGwS63TlHuDtSnyL9Di6h1AvoFhglvawKq") : controller.signal.aborted ? __rmT("kI2Z2diW9X1mjnECoIP.2fU4HhiQBMA2161e_yIuRz_KScyF3W7jy21zv28EEOEax4a7sQGP") : `${__rmT("EgQXEpwVLZEaBrfb84LEawxL")}${planningLabel()}${__rmT("Yos")}${drawingLabel()}${__rmT("mqGtq4sBrqXl2hQ2ugf0P0qDDvmspPv7adM.PpYD2pdkZGKXq8_")}`;
        }
        finally {
            jobs.delete(job);
            panelJobs.delete(job);
            notify();
        }
    }
    button('generate', __rmT("8THtbgLg67Tp6gxBsyf"), () => run('generate'));
    button('reconceive', __rmT("YYnwwijVvIkimNROCR.kc74y"), () => run('reconceive'));
    button('draw', __rmT("N8520Z1T92LqzjcZdBY8sf"), () => run('draw'));
    button('saveDraft', __rmT("iSDJ7xyavI4uIZo8l_h"), () => {
        if (!current(target))
            return;
        try {
            rememberDraft(target.key, readDraft(), captureMirrorImageOwner(target.key));
            status.textContent = __rmT("4zBIgI8FZmBxKX4v34oLiPOWKNTdL2j429E");
        }
        catch {
            status.textContent = __rmT("Pk0XVfdViizy4OaQKVnLRZEUkUzVmkoQfGdeXbKq");
        }
    });
    button('cancel', __rmT("XMAvldDHRwcOMJ72"), () => {
        ownedForTarget(jobs, target)?.controller.abort();
        status.textContent = __rmT("RNXo3cPPnpYZ7JZ_LUzOlIo58gCd7RMOJG_TuIQExo.e9XV8m2LZPBIzgCbziSkC");
    });
    button('saveOnly', __rmT("SgxeWnnFS8iZINz6oJNIcf"), () => {
        const pending = ownedForTarget(pendingSaves, target);
        if (!pending)
            return;
        try {
            localRecord = flushPendingImages(pending);
            showRecord(localRecord);
            status.textContent = __rmT("imRFQI8FZmBxKX4v34oLid989UnTi15829E");
            if (current(target)) {
                mountedRoots.delete(root);
                mountMirrorImage(root);
            }
        }
        catch {
            localRecord = pendingImage(pending, storedForTarget(target).record);
            showRecord(localRecord);
            status.textContent = __rmT("LFtVeyM6EOy6uE1ppJZrDZckpyEnU5YpciZXkOkBVdyf514DNr.jpy2QzUOj6Vf0OSCRaGOEzfZY_ZQwT45y.cHmSvUwEZpQn4txPcnw7D34h4V4_sxb0YnW8ik");
        }
        renderState();
    });
    fields.addEventListener('input', event => {
        if (event.target !== inputs.flatPrompt && event.target !== size && event.target !== format && event.target !== composition && inputs.flatPrompt.value) {
            inputs.flatPrompt.value = '';
            status.textContent = __rmT("ZSatwhb7x3uk5t2k1K5vgXjbvjgYzPdHn269xvl941z4qsWDt9Vw6S6fi3Sl3bou34J32FQHJ33H2NGsZ9TEaymNrnKWZ08cANA");
        }
        updatePreview();
        renderState();
    });
    function fit() {
        const view = doc.defaultView, viewport = view.visualViewport;
        host.style.left = `${viewport?.offsetLeft || 0}px`;
        host.style.top = `${viewport?.offsetTop || 0}px`;
        host.style.right = 'auto';
        host.style.bottom = 'auto';
        host.style.width = `${viewport?.width || view.innerWidth}px`;
        host.style.height = `${viewport?.height || view.innerHeight}px`;
    }
    function keydown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            closePanel();
        }
        if (event.key === 'Tab') {
            const focusable = [...box.querySelectorAll('button,input,textarea,select,a[href]')].filter(node => !node.disabled && !node.hidden && node.getClientRects().length);
            const first = focusable[0], last = focusable.at(-1);
            if (event.shiftKey && doc.activeElement === first) {
                event.preventDefault();
                last?.focus();
            }
            else if (!event.shiftKey && doc.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        }
    }
    doc.defaultView.addEventListener('resize', fit);
    doc.defaultView.visualViewport?.addEventListener('resize', fit);
    doc.defaultView.visualViewport?.addEventListener('scroll', fit);
    host.addEventListener('keydown', keydown);
    host.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); closePanel(); });
    host.addEventListener('click', event => { if (event.target === host)
        closePanel(); event.stopPropagation(); });
    const promptsCleared = () => {
        syncPromptCleanup();
        if (!ownedForTarget(jobs, target)) {
            fillDraft({});
            const saved = target ? storedForTarget(target).record : null;
            if (saved) {
                localRecord = saved;
                showRecord(saved);
            }
        }
        builtin?.promptsCleared?.();
        renderState();
    };
    globalThis.addEventListener?.(MIRROR_IMAGE_PROMPTS_CLEARED_EVENT, promptsCleared);
    panel = { host, target, opener, onClose, renderState, receive: (record, draft) => { localRecord = record; fillDraft(draft); showRecord(record); }, cleanup: () => {
            for (const job of panelJobs)
                job.allowNextDispatch = false;
            doc.defaultView.removeEventListener('resize', fit);
            doc.defaultView.visualViewport?.removeEventListener('resize', fit);
            doc.defaultView.visualViewport?.removeEventListener('scroll', fit);
            globalThis.removeEventListener?.(MIRROR_IMAGE_PROMPTS_CLEARED_EVENT, promptsCleared);
            builtin?.cleanup();
        } };
    const pending = ownedForTarget(pendingSaves, target);
    if (pending)
        localRecord = pendingImage(pending, localRecord);
    const latestDraft = state.draft && (!localRecord || Number(state.draft.updatedAt || 0) >= (Date.parse(localRecord.generatedAt || '') || 0))
        ? state.draft : draftFromSavedImage(localRecord) || state.draft || {};
    fillDraft(latestDraft);
    showRecord(localRecord);
    renderState();
    let modalOpened = false;
    try {
        if (typeof host.showModal === 'function') {
            host.showModal();
            modalOpened = true;
        }
    }
    catch { }
    if (!modalOpened) {
        const active = [...doc.querySelectorAll('dialog[open]')].reverse().find(node => {
            if (node === host)
                return false;
            try {
                return node.matches(':modal');
            }
            catch {
                return true;
            }
        });
        (active || doc.body).append(host);
        host.setAttribute('open', '');
    }
    fit();
    close.focus();
    Promise.resolve().then(() => getImageBackendStatus()).then(value => { backend = value; if (host.isConnected) {
        updatePreview();
        renderState();
    } }).catch(() => { });
}
const builtinJobs = new Set();
function buildBuiltinSection(doc, root, initial) {
    const sectionTarget = targetFor(root);
    let frames = initial;
    let selected = 0;
    let editing = false;
    let message = '';
    const section = el(doc, 'section', '', { 'data-rm-builtin-image-panel': '' });
    section.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
    const head = el(doc, 'div');
    head.style.cssText = 'display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;';
    const headTitle = el(doc, 'strong', __rmT("K1rMpZ5uCXIpkIOO"));
    const headNote = el(doc, 'span');
    headNote.style.cssText = 'font-size:12px;opacity:.75;';
    head.append(headTitle, headNote);
    const tabs = el(doc, 'div', '', { role: 'tablist', 'aria-label': __rmT("2wa6biv5r4AYTpFCsyf") });
    tabs.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';
    const view = el(doc, 'div');
    view.style.cssText = 'position:relative;border-radius:12px;overflow:hidden;background:rgba(0,0,0,.06);min-height:120px;display:flex;align-items:center;justify-content:center;';
    const nav = el(doc, 'div');
    nav.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;';
    const prev = el(doc, 'button', '‹', { type: 'button', 'aria-label': __rmT("KlqvWUAC") });
    const counter = el(doc, 'span');
    counter.style.cssText = 'min-width:56px;text-align:center;font-variant-numeric:tabular-nums;';
    const next = el(doc, 'button', '›', { type: 'button', 'aria-label': __rmT("K_qvWUAC") });
    const navNote = el(doc, 'span', __rmT("tWP97L2E76zqzLULOP6dXk"));
    navNote.style.cssText = 'font-size:12px;opacity:.75;';
    for (const b of [prev, next])
        b.style.cssText = 'min-width:44px;min-height:40px;font:inherit;font-size:18px;';
    nav.append(prev, counter, next, navNote);
    const statusLine = el(doc, 'p', '', { role: 'status' });
    statusLine.style.cssText = 'margin:0;font-size:13px;';
    const row = el(doc, 'div');
    row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    const roll = el(doc, 'button', __rmT("U.XNjslbgyyLg_uG"), { type: 'button', 'data-rm-builtin-action': 'reroll' });
    const cancel = el(doc, 'button', __rmT("WFOL6BsLHPp"), { type: 'button', 'data-rm-builtin-action': 'cancel' });
    const edit = el(doc, 'button', __rmT("VQ.9t1fqaOA2l.cz"), { type: 'button', 'data-rm-builtin-action': 'edit' });
    for (const b of [roll, cancel, edit])
        b.style.cssText = 'min-height:44px;padding:8px 14px;font:inherit;white-space:normal;';
    roll.style.flex = '1 1 160px';
    cancel.style.flex = '1 1 160px';
    row.append(roll, cancel, edit);
    const hint = el(doc, 'p', '');
    hint.style.cssText = 'margin:0;font-size:12px;opacity:.75;';
    const sourceLine = el(doc, 'p', '');
    sourceLine.style.cssText = 'margin:0;font-size:12px;opacity:.75;';
    sourceLine.hidden = true;
    const editor = el(doc, 'div');
    editor.style.cssText = 'display:grid;gap:6px;';
    const editLabel = el(doc, 'label', __rmT("V647pAPnliBPWj..BeGWfrqq1uIDbdHKL...CQ5g_4b7Em7EWnt0L9TIk9nTFLiiNIuReOexLOG"));
    editLabel.style.cssText = 'display:grid;gap:6px;font-size:13px;';
    const editBox = el(doc, 'textarea', '', { rows: '4' });
    editBox.style.cssText = 'width:100%;min-width:0;box-sizing:border-box;font:inherit;padding:8px;resize:vertical;';
    const editGo = el(doc, 'button', __rmT("N8vx.ME.mNI3p89hZqwKAh"), { type: 'button', 'data-rm-builtin-action': 'reroll-edited' });
    editGo.style.cssText = 'min-height:44px;padding:8px 14px;font:inherit;';
    editLabel.append(editBox);
    editor.append(editLabel, editGo);
    section.append(head, tabs, view, nav, statusLine, row, hint, sourceLine, editor);
    const provider = () => getSettings().imageBackend === 'chatu8' ? __rmT("OyY9PHpS") : __rmT("lo7wSMYV");
    const currentFrame = () => frames[Math.min(selected, frames.length - 1)];
    const frameJob = item => current(sectionTarget) && item ? ownedForTarget(builtinJobs, { key: item.key }) : null;
    const refresh = () => { frames = listBuiltinImageFrames(root); if (!frames.length)
        frames = initial; };
    const mine = { onText: text => { if (section.isConnected)
            statusLine.textContent = text; }, done: () => { if (section.isConnected) {
            refresh();
            render();
        } } };
    function render() {
        if (!section.isConnected && section.parentNode)
            return;
        const item = currentFrame();
        const job = frameJob(item);
        if (job)
            job.listeners.add(mine);
        const ready = builtinImageReady() && current(sectionTarget);
        const firstDraw = item.busy && !job;
        headNote.textContent = `${__rmT("rBfxH16jJvBrk.pwR68385Cx")}${frames.length}${__rmT("2RWCuk")}`;
        tabs.replaceChildren();
        tabs.hidden = frames.length < 2;
        frames.forEach((entry, index) => {
            const tab = el(doc, 'button', `${__rmT("EGmCyT")}${index + 1}`, { type: 'button', role: 'tab', 'aria-selected': String(index === selected) });
            tab.style.cssText = `min-height:40px;padding:0 14px;border-radius:999px;font:inherit;font-size:13px;${index === selected ? 'font-weight:700;outline:2px solid currentColor;' : ''}`;
            tab.addEventListener('click', () => { selected = index; editing = false; message = ''; render(); });
            tabs.append(tab);
        });
        view.replaceChildren();
        const shown = item.versions[item.current];
        if (shown) {
            const image = makeImage(doc, shown);
            image.style.opacity = job ? '.55' : '1';
            image.addEventListener('error', () => { image.remove(); if (!view.firstChild)
                view.append(el(doc, 'span', __rmT("tknOlz9_rnzvrfOLbiLQUBCC3QV.mtrvW80EAmKq"))); }, { once: true });
            view.append(image);
        }
        else
            view.append(el(doc, 'span', item.broken && item.brokenCode === 'image_version_unconfirmed' ? __rmT("012Mj.mABgoJT4uVPoehPx5fsF82c2QNRLB36rgOFCa.bh") : item.broken ? __rmT("KZ3a4x.15L7qyfLkc5lGuOwjX2nrrk") : __rmT("wiQvf5a4JiNc8Uey4DD")));
        const total = item.versions.length;
        counter.textContent = total ? `${item.current + 1} / ${total}` : '0 / 0';
        const gone = !!sectionTarget && !current(sectionTarget);
        prev.disabled = gone || !!job || firstDraw || item.current <= 0;
        next.disabled = gone || !!job || firstDraw || item.current >= total - 1;
        nav.hidden = total < 2;
        roll.hidden = !!job;
        cancel.hidden = !job;
        const unconfirmed = item.broken && item.brokenCode === 'image_version_unconfirmed';
        const blocked = item.broken && !unconfirmed;
        roll.disabled = !ready || firstDraw || blocked;
        edit.disabled = !ready || !!job || firstDraw || blocked;
        editGo.disabled = !ready || !!job || firstDraw || blocked;
        editor.hidden = !editing;
        if (editing && !editBox.dataset.forKey) {
            editBox.value = item.editPrompt || item.prompt;
            editBox.dataset.forKey = item.key;
        }
        const reusable = builtinImageReusable(shown);
        const sources = shown?.looksSources && typeof shown.looksSources === 'object' ? Object.entries(shown.looksSources).map(([name, source]) => `${name}=${source}`).join(' ') : '';
        sourceLine.textContent = sources ? `${__rmT("vyzxsqQ0PMcStf")}${sources}` : '';
        sourceLine.hidden = !sources;
        hint.textContent = !ready
            ? __rmT("iKIOmRhouX1A4jIm3mljyozKhd44uw8dVJGJBebepZxH1QbOQDXDJDm36.HGpA_lZQLNEXy_5z2NR6bWbkwn1tlaLNfEDhl0eBZIvCw9") : unconfirmed ? `${__rmT("LzY.7H.Cr52tz1NF89tiZRtOIL6JDOb2uNxi3Gt2J0AgTH2xrXywPT9hIhw8u4mAiKqdIXCMqkG71yKEHgXEpe03hZu5wihhAs0hIjav9DVTe.PsAuYk8h")}${provider()}${__rmT("Bx.Y0WKg")}` : item.broken ? __rmT("46vmSOfribgq_I85QooY1DXD_qjF3gD6pOXBANf8rpti2rojSFRJvtm4GF8Qc.wmISQpVB2ESbEobh") : reusable ? `${__rmT("TDO7H5IUjxdwp_cWg7KmDnv.jiAEpAjlxfRGcIeBCLtywgDVqOGU1h")}${provider()}${__rmT("wrAl8ZLVxUJcdXoUCEzs3XgA3noWe6kQBewKwGXQs7wVTWFvq8_")}` : `${shown?.promptsCleared ? __rmT("7xarO0VyF6FpMxkuQ3F4dRWfooE") : __rmT("lVqD1EdBXRAN5.AlDN9kojYuIrWO1pQV87ECeEovMRjzciqV")}${__rmT("niFVE82SZEtYDTJ6V.OFv3j8f0YDW4lKraQkBsgFwwxuuyW44Osq02RV")}${imageLlmConfigured(getSettings()) ? __rmT("neGCromGwExH8EcdvSFOSACA5Sr3AP9wuLf") : ''}${__rmT("i8PpcJNrt8cu9f")}${provider()}${__rmT("Bx.Y0WKg")}`;
        statusLine.textContent = job ? (job.text || `${__rmT("cIFOASxxp6OBTh")}${Math.min(5, total + 1)}${__rmT("qGtZ0c.2")}`) : firstDraw ? __rmT("lVqG487HKnd08jY3iYsCYI9R0eJ41pjASnVoNlMeKZb4aSQX") : message;
    }
    async function start(edited) {
        const item = currentFrame();
        if (!current(sectionTarget) || frameJob(item))
            return;
        let owner = null;
        try {
            owner = captureMirrorImageOwner(item.key);
        }
        catch { }
        if (!owner || !mirrorImageOwnerMatchesKey(owner, item.key)) {
            statusLine.textContent = __rmT("1zhtfVww8FZXxfKX7NuBhpHFVvC4LV_BpAmxL1tUTZskSULNje_7bwxws3Icx2S9Bm7LEkZpmUIXdZTQ3ZwdY369KNGcxf");
            return;
        }
        const controller = new AbortController();
        const job = { owner, controller, text: '', listeners: new Set([mine]) };
        builtinJobs.add(job);
        message = '';
        render();
        try {
            const { painted, saveError } = await rerollBuiltinImage(root, item.frame, { prompt: edited, signal: controller.signal,
                onText: text => { job.text = text; for (const listener of job.listeners) {
                    try {
                        listener.onText?.(text);
                    }
                    catch { }
                } } });
            message = saveError
                ? `${__rmT("xbNtSbEc")}${painted ? __rmT("7QeST865Wt_OmBFixnCuCKU7ie7eHz8hnlf") : ''}${__rmT("DV_f1A7K.QQqy2cWkRsbn6W3m6wlcT")}${/quota/i.test(String(saveError?.name || saveError?.message || '')) ? __rmT("kudkyIBewsuq4LIF") : String(saveError?.message || __rmT("AQ96ALbkGU_")).slice(0, 60)}${__rmT("7os")}${describeLocalStorageUsage()}${__rmT("qsvnJ9GvalHaHg1JIiyaRQJsCdfeaUmcJVPWa1GD.1up7ErNSSJdVbncGnYLXSnXUSzj4_hznRhobh")}${provider() === __rmT("lo7wSMYV") ? __rmT("YbY6hO3dWu81ci2x8nQGZw5ObNs") : __rmT("7eHmOQmA3I52h0FA1tkQc7EI")}` : painted ? __rmT("2GvWLJbEvlt2rMM4Slc8H.thaBs1ZQcE2j.pcoD2OdL.bh") : __rmT("KY9lVngg.MkQG8F9KDHlcMX1xVp9HxobYy.LugjmPnTGZSh_9JUZ7wBq9WfKmKza7vdXG77KY3Y");
        }
        catch (error) {
            message = controller.signal.aborted ? __rmT("qwLkkacs7oaTlfyt9l62bC49RD1rrk") : `${__rmT("WzGbtYADP_xF5i4vZh0Miiczb13TwUmK29E")}${String(error?.message || '').slice(0, 120)}`;
        }
        finally {
            builtinJobs.delete(job);
            refresh();
            for (const listener of job.listeners) {
                try {
                    listener.done?.();
                }
                catch { }
            }
        }
    }
    roll.addEventListener('click', () => start(''));
    cancel.addEventListener('click', () => { const job = frameJob(currentFrame()); if (!job) {
        refresh();
        render();
        return;
    } job.controller.abort(); statusLine.textContent = __rmT("HCTmNbm6O.Keg3bgjXqzALqzx_s2WDgYSunPXfWdGX959a4MpXqBbq5X"); });
    edit.addEventListener('click', () => { editing = !editing; editBox.dataset.forKey = ''; render(); });
    editGo.addEventListener('click', () => { const text = editBox.value.trim(); if (text.length < 4) {
        statusLine.textContent = __rmT(".TFGufFoa44FXoOc4DD");
        return;
    } start(text); });
    const stale = () => !!sectionTarget && !current(sectionTarget);
    const step = delta => {
        if (stale()) {
            message = __rmT("v6u0M.0Dgk_oiOnu3ObobRE653hN5iQLFcMQ1py0fI0PZ0B.n0_EdNX6T1sXQPCBqr0woYENy2aD53A.gHUuCrHxWPoZd32oqY6gFMJ_kVdo.k");
            render();
            return;
        }
        const item = currentFrame();
        const target = item.current + delta;
        if (target < 0 || target >= item.versions.length)
            return;
        try {
            showBuiltinImageVersion(root, item.frame, target);
            message = '';
        }
        catch {
            message = __rmT("rW8KMHX5YiaNv419eWlfXdunLTaZoYKPP3bDaGwamnvjae7VKxIG1orFqKs9uT");
        }
        refresh();
        render();
    };
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    render();
    return { section, cleanup: () => { }, promptsCleared: () => {
            if (!frameJob(currentFrame())) {
                editing = false;
                editBox.value = '';
                editBox.dataset.forKey = '';
            }
            refresh();
            render();
        } };
}
