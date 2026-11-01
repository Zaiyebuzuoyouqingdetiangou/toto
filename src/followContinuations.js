import { rabbitMirrorMessageSourceHash, rabbitMirrorMultifaceSourceHash } from './multifaceProof.js?rmv=2.10.1';
import { parseMultifaceOutput } from './multifaceProtocol.js?rmv=2.10.1';
import { readFollowPartialResult } from './followPartialResults.js?rmv=2.10.1';
import { getRenderedRabbitMirrorInteractionRoots } from './outputSanitizer/runtime.js?rmv=2.10.1';
const CHAT_KEY = 'rabbit_mirror_follow_continuations_v1';
const MAX_CHARS = 512 * 1024;
const MAX_SECTIONS_PER_FACE = 30;
const MAX_PARAGRAPHS_PER_SECTION = 80;
const MAX_PARAGRAPH_CHARS = 4000;
const MULTIFACE_MARK = /<toto\b[^>]*\sdata-rm-face\s*=/i;
function metadataOf(ctx) {
    try {
        const metadata = ctx?.chatMetadata || globalThis.SillyTavern?.getContext?.()?.chatMetadata || globalThis.chat_metadata;
        return metadata && typeof metadata === 'object' ? metadata : null;
    }
    catch {
        return null;
    }
}
function swipeOf(message) {
    return Number.isInteger(message?.swipe_id) ? message.swipe_id : 0;
}
function slotOf(index, message) {
    return `${Number(index)}:${swipeOf(message)}`;
}
function cleanParagraphs(paragraphs) {
    return (Array.isArray(paragraphs) ? paragraphs : [])
        .map(part => String(part ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_PARAGRAPH_CHARS))
        .filter(Boolean)
        .slice(0, MAX_PARAGRAPHS_PER_SECTION);
}
function detailsOf(root) {
    if (!root)
        return null;
    if (root.matches?.('details'))
        return root;
    return root.querySelector?.(':scope > details') || root.querySelector?.('details') || root.closest?.('details') || null;
}
function messageElementOf(details) {
    return details?.closest?.('.mes[mesid], [mesid].mes') || null;
}
function followFaceDetails(messageEl) {
    let roots = [];
    try {
        roots = getRenderedRabbitMirrorInteractionRoots(messageEl);
    }
    catch {
        roots = [];
    }
    const list = [];
    for (const root of roots) {
        const details = detailsOf(root);
        if (!details || list.includes(details))
            continue;
        if (details.closest('[data-rm-source="independent"]'))
            continue;
        if (details.parentElement?.closest?.('details'))
            continue;
        list.push(details);
    }
    return list;
}
const sourceCache = new WeakMap();
function followFaceSources(chat, index, message) {
    let partial = null;
    try {
        partial = readFollowPartialResult(chat, index);
    }
    catch {
        partial = null;
    }
    const source = typeof partial?.html === 'string' && partial.html ? partial.html : String(message?.mes || '');
    const cached = sourceCache.get(message);
    if (cached && cached.source === source)
        return cached.faces;
    let faces = [source];
    if (MULTIFACE_MARK.test(source)) {
        try {
            const parsed = parseMultifaceOutput(source, { allowProse: true });
            faces = parsed?.ok && parsed.faces.length ? parsed.faces.map(face => String(face.html || '')) : [source];
        }
        catch {
            faces = [source];
        }
    }
    if (message && typeof message === 'object')
        sourceCache.set(message, { source, faces });
    return faces;
}
export function followFaceKey(root, ctx) {
    const details = detailsOf(root);
    const messageEl = messageElementOf(details);
    const index = Number(messageEl?.getAttribute?.('mesid'));
    const message = Number.isInteger(index) && index >= 0 ? ctx?.chat?.[index] : null;
    if (!message || message.is_user)
        return '';
    const position = followFaceDetails(messageEl).indexOf(details);
    if (position < 0)
        return '';
    const sources = followFaceSources(ctx.chat, index, message);
    const source = sources.length > 1 ? sources[position] : sources[0];
    if (typeof source !== 'string')
        return '';
    return `${position}:${rabbitMirrorMultifaceSourceHash(source)}`;
}
export function isFollowFaceRoot(root) {
    const details = detailsOf(root);
    if (!details?.isConnected)
        return false;
    if (details.closest('[data-rm-source="independent"]'))
        return false;
    return !!messageElementOf(details);
}
function readStore(metadata) {
    const value = metadata?.[CHAT_KEY];
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
export function saveFollowContinuation(ctx, index, message, faceKey, paragraphs) {
    const metadata = metadataOf(ctx);
    const list = cleanParagraphs(paragraphs);
    if (!metadata || !message || !list.length || !faceKey)
        return false;
    try {
        const store = { ...readStore(metadata) };
        const slot = slotOf(index, message);
        const sourceHash = rabbitMirrorMessageSourceHash(message);
        const previous = store[slot] && store[slot].sourceHash === sourceHash && store[slot].faces && typeof store[slot].faces === 'object'
            ? store[slot] : { sourceHash, faces: {} };
        const sections = Array.isArray(previous.faces[faceKey]) ? previous.faces[faceKey].slice() : [];
        if (sections.length >= MAX_SECTIONS_PER_FACE)
            return false;
        sections.push(list);
        store[slot] = { sourceHash, faces: { ...previous.faces, [faceKey]: sections }, ts: Date.now() };
        let size = JSON.stringify(store).length;
        while (size > MAX_CHARS) {
            const victim = Object.entries(store).filter(([key]) => key !== slot)
                .sort(([, a], [, b]) => Number(a?.ts || 0) - Number(b?.ts || 0))[0];
            if (!victim)
                break;
            delete store[victim[0]];
            size = JSON.stringify(store).length;
        }
        if (size > MAX_CHARS)
            return false;
        metadata[CHAT_KEY] = store;
        return true;
    }
    catch {
        return false;
    }
}
export function followContinuationsFor(ctx, index, message, faceKey) {
    if (!faceKey)
        return [];
    const record = readStore(metadataOf(ctx))[slotOf(index, message)];
    if (!record || record.sourceHash !== rabbitMirrorMessageSourceHash(message))
        return [];
    const sections = record.faces?.[faceKey];
    return Array.isArray(sections) ? sections.map(cleanParagraphs).filter(list => list.length) : [];
}
export function restoreFollowContinuations(root, ctx) {
    if (!isFollowFaceRoot(root))
        return 0;
    const details = detailsOf(root);
    const messageEl = messageElementOf(details);
    const index = Number(messageEl?.getAttribute('mesid'));
    const message = Number.isInteger(index) ? ctx?.chat?.[index] : null;
    if (!message || message.is_user)
        return 0;
    const sections = followContinuationsFor(ctx, index, message, followFaceKey(root, ctx));
    if (!sections.length)
        return 0;
    const article = details.querySelector('article') || details;
    const numbered = [...article.querySelectorAll('section[data-rm-continuation]')]
        .filter(node => /^\d+$/.test(String(node.getAttribute('data-rm-continuation'))));
    const have = numbered.map(node => Number(node.getAttribute('data-rm-continuation')));
    const inOrder = have.length <= sections.length && have.every((value, at) => value === at + 1);
    if (!inOrder)
        numbered.forEach(node => node.remove());
    const start = inOrder ? have.length : 0;
    const doc = article.ownerDocument || document;
    for (let at = start; at < sections.length; at += 1) {
        const section = doc.createElement('section');
        section.setAttribute('data-rm-continuation', String(at + 1));
        for (const text of sections[at]) {
            const paragraph = doc.createElement('p');
            paragraph.textContent = text;
            section.append(paragraph);
        }
        article.append(section);
    }
    return sections.length - start;
}
export function restoreFollowContinuationsInMessage(ctx, index, doc = globalThis.document) {
    const messageEl = doc?.querySelector?.(`.mes[mesid="${Number(index)}"]`);
    if (!messageEl)
        return 0;
    return followFaceDetails(messageEl).reduce((sum, details) => sum + restoreFollowContinuations(details, ctx), 0);
}
