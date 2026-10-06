import { getSettings } from './settings.js?rmv=1.66.0';
import { generateMirrorImage } from './baibaiImage.js?rmv=1.66.0';
import { loadMirrorImage, saveMirrorImage } from './imageStore.js?rmv=1.66.0';
import { getContext, hashText } from './independentApi/runtime.js?rmv=1.66.0';

// 同一提示词在滚动、重挂载时共用这一次请求，避免每刷一次工具就再打一次柏宝绘。
const inflight = new Map();
const waiters = new Map();
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
        image.style.cssText = 'display:block;width:100%;height:100%;object-fit:cover;';
        frame.prepend(image);
    }
    image.src = url;
    return true;
}

function note(frame, text) {
    if (frame.querySelector?.('[data-rm-draw-status]')) return;
    const line = frame.ownerDocument.createElement('p');
    line.setAttribute('data-rm-draw-status', '1');
    line.textContent = text;
    line.style.cssText = 'margin:0;padding:12px;font-size:12px;line-height:1.45;opacity:.72;';
    frame.append(line);
}

function anyWaiterConnected(key) {
    const nodes = waiters.get(key);
    if (!nodes) return false;
    for (const node of nodes) if (node.isConnected) return true;
    return false;
}

function startJob(key, prompt) {
    const existing = inflight.get(key);
    if (existing) return existing;
    const job = (async () => {
        const settings = getSettings();
        const record = await generateMirrorImage({
            prompt,
            flatPrompt: prompt,
            nl: prompt,
            characters: [],
            promptFormat: settings.imagePromptFormat,
        }, {
            character: characterGroup(),
            assertCurrent: () => anyWaiterConnected(key),
        });
        try { saveMirrorImage(key, record); }
        catch (error) { console.warn('[RabbitMirror] 内置生图已画成，但没能写入本机存档', error); }
        return record;
    })();
    inflight.set(key, job);
    job.finally(() => { if (inflight.get(key) === job) inflight.delete(key); });
    return job;
}

async function fillFrame(root, frame) {
    if (frame.querySelector?.('img[data-rm-draw-result][src]')) return;
    const prompt = readPrompt(frame);
    if (!prompt) return;
    const key = storageKey(root, frame, prompt);
    const saved = readSaved(key);
    if (saved.broken) {
        note(frame, '这一面的画面存档读不出来，没有重新生图。');
        return;
    }
    if (saved.record && paint(frame, saved.record)) return;
    if (failed.has(key)) {
        note(frame, '这一面的画面这次没有画成。');
        return;
    }
    let nodes = waiters.get(key);
    if (!nodes) { nodes = new Set(); waiters.set(key, nodes); }
    nodes.add(frame);
    try {
        const record = await startJob(key, prompt);
        if (frame.isConnected) paint(frame, record);
    } catch (error) {
        const code = error?.code;
        if (code === 'not_configured' || code === 'unsupported_api' || code === 'invalid_args' || code === 'invalid_result') failed.add(key);
        if (frame.isConnected) note(frame, code === 'not_configured' || code === 'unsupported_api'
            ? '柏宝绘还没连好，这一面先留着提示词。'
            : '这一面的画面这次没有画成。');
        console.warn('[RabbitMirror] 内置生图没有填进图框', error);
    } finally {
        nodes.delete(frame);
        if (!nodes.size) waiters.delete(key);
    }
}

export function fillBuiltinImageFrames(root) {
    if (getSettings().builtinImageEnabled !== true || !root?.querySelectorAll) return;
    const seen = new Set();
    for (const frame of root.querySelectorAll('[data-rm-draw-frame]')) {
        const face = frame.closest?.('details') || frame.closest?.('toto') || root;
        if (seen.has(face)) continue;
        seen.add(face);
        void fillFrame(root, frame);
    }
}
