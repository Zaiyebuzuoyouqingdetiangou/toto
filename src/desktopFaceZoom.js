import { getSettings } from './settings.js?rmv=1.100.0';
export const FACE_DESIGN_WIDTH = 400;
export const FACE_MAX_VISUAL_WIDTH = 640;
export const FACE_NARROW_FALLBACK_WIDTH = 460;
export const VIRTUAL_PHONE_WIDTH = 440;
export const VIRTUAL_PHONE_HEIGHT = 900;
const WIDE_QUERY = '(min-width: 900px)';
const MODE_ATTR = 'data-rm-face-zoom';
const ZOOM_VAR = '--rm-face-zoom';
export const DESKTOP_ZOOM_FACE_SELECTOR = [
    '#chat .rabbit-mirror-external-shell[data-rm-source][data-rm-placement] > details[data-rabbit-mirror-external-details="true"]:not(.rabbit-mirror-external-placeholder)',
    '#chat toto[data-rabbit-mirror="true"] > details',
].join(', ');
let installed = null;
let syncFrame = 0;
let pendingFaces = new Set();
let facesFrame = 0;
let supportCache = null;
const originalMedia = new WeakMap();
const virtualizedSheets = new WeakMap();
export function desktopFaceZoomEnabled(settings = getSettings()) {
    return settings?.desktopFaceZoom !== false;
}
export function desktopFaceZoomSupported(doc = globalThis.document) {
    if (supportCache !== null)
        return supportCache;
    let ok = false;
    try {
        const view = doc?.defaultView;
        if (view?.CSS?.supports?.('zoom', '2') && 'currentCSSZoom' in (view.Element?.prototype || {})) {
            const probe = doc.createElement('div');
            probe.style.cssText = 'position:absolute;left:-10000px;top:0;visibility:hidden;zoom:2;width:50px;height:10px;';
            const inner = doc.createElement('div');
            inner.style.cssText = 'width:20px;height:5px;';
            probe.append(inner);
            (doc.body || doc.documentElement).append(probe);
            const outer = probe.getBoundingClientRect().width, child = inner.getBoundingClientRect().width;
            ok = Math.abs(outer - 100) < 1 && Math.abs(child - 40) < 1 && inner.offsetWidth === 20;
            probe.remove();
        }
    }
    catch {
        ok = false;
    }
    supportCache = ok;
    return ok;
}
export function desktopFaceZoomMode(doc = globalThis.document, settings = getSettings()) {
    const view = doc?.defaultView;
    let wide = false;
    try {
        wide = !!view?.matchMedia?.(WIDE_QUERY)?.matches;
    }
    catch {
        wide = false;
    }
    if (!wide || !desktopFaceZoomEnabled(settings))
        return '';
    return desktopFaceZoomSupported(doc) ? 'zoom' : 'narrow';
}
export function desktopFaceZoomActive(doc = globalThis.document) {
    return doc?.documentElement?.getAttribute?.(MODE_ATTR) === 'zoom';
}
function contentWidth(node, view) {
    let style = null;
    try {
        style = view.getComputedStyle(node);
    }
    catch {
        return 0;
    }
    if (!style || /^(?:inline|contents|none)$/.test(style.display))
        return -1;
    const pad = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    return Math.max(0, (node.clientWidth || 0) - pad);
}
function faceLaneWidth(face, view) {
    for (let node = face?.parentElement; node && node.id !== 'chat'; node = node.parentElement) {
        const width = contentWidth(node, view);
        if (width >= 0)
            return width;
    }
    return 0;
}
function laneWidth(doc) {
    const view = doc.defaultView;
    const chat = doc.getElementById('chat');
    if (!chat || !view)
        return 0;
    const faces = chat.querySelectorAll(DESKTOP_ZOOM_FACE_SELECTOR);
    for (let index = faces.length - 1; index >= 0 && index >= faces.length - 6; index -= 1) {
        const width = faceLaneWidth(faces[index], view);
        if (width > 0)
            return width;
    }
    const texts = chat.querySelectorAll('.mes .mes_text');
    for (let index = texts.length - 1; index >= 0 && index >= texts.length - 6; index -= 1) {
        const width = contentWidth(texts[index], view);
        if (width > 0)
            return width;
    }
    return 0;
}
export function desktopFaceZoomFactor(lane) {
    const width = Math.min(Number(lane) || 0, FACE_MAX_VISUAL_WIDTH);
    const factor = width / FACE_DESIGN_WIDTH;
    if (!Number.isFinite(factor) || factor < 1.05)
        return 1;
    return Math.round(factor * 1000) / 1000;
}
function splitTopLevel(text, separator) {
    const parts = [];
    let depth = 0, start = 0;
    const lower = text.toLowerCase();
    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (char === '(')
            depth += 1;
        else if (char === ')')
            depth = Math.max(0, depth - 1);
        else if (depth === 0 && lower.startsWith(separator, index)) {
            parts.push(text.slice(start, index));
            start = index + separator.length;
            index = start - 1;
        }
    }
    parts.push(text.slice(start));
    return parts;
}
function lengthPx(value) {
    const match = String(value || '').trim().match(/^(-?\d*\.?\d+)\s*(px|em|rem)?$/i);
    if (!match)
        return null;
    const number = Number(match[1]);
    if (!Number.isFinite(number))
        return null;
    const unit = String(match[2] || 'px').toLowerCase();
    if (!match[2] && number !== 0)
        return null;
    return unit === 'px' ? number : number * 16;
}
const WIDTH_FEATURE = /^(?:(min|max)-)?(?:device-)?(width|aspect-ratio)$/;
function ratioValue(value) {
    const match = String(value || '').trim().match(/^(\d*\.?\d+)\s*(?:\/\s*(\d*\.?\d+))?$/);
    if (!match)
        return null;
    const ratio = Number(match[1]) / (match[2] ? Number(match[2]) : 1);
    return Number.isFinite(ratio) ? ratio : null;
}
function compare(actual, op, expected) {
    if (expected === null || !Number.isFinite(actual))
        return null;
    if (op === 'min')
        return actual >= expected;
    if (op === 'max')
        return actual <= expected;
    if (op === '=')
        return Math.abs(actual - expected) < 0.01;
    if (op === '<')
        return actual < expected;
    if (op === '<=')
        return actual <= expected;
    if (op === '>')
        return actual > expected;
    if (op === '>=')
        return actual >= expected;
    return null;
}
const FLIP = { '<': '>', '<=': '>=', '>': '<', '>=': '<=', '=': '=' };
function evaluateCondition(condition, virtual, view) {
    const inner = condition.trim().replace(/^\(\s*|\s*\)$/g, '').trim();
    if (!inner || /\(|\bor\b|\bnot\b/i.test(inner))
        return null;
    const colon = inner.indexOf(':');
    if (colon > 0 && !/[<>=]/.test(inner)) {
        const name = inner.slice(0, colon).trim().toLowerCase();
        const value = inner.slice(colon + 1).trim();
        if (name === 'orientation')
            return value.toLowerCase() === (virtual.height >= virtual.width ? 'portrait' : 'landscape');
        const match = name.match(WIDTH_FEATURE);
        if (match) {
            const op = match[1] || '=';
            if (match[2] === 'width')
                return compare(virtual.width, op, lengthPx(value));
            return compare(virtual.width / Math.max(1, virtual.height), op, ratioValue(value));
        }
    }
    else if (/[<>=]/.test(inner)) {
        const tokens = inner.split(/\s*(<=|>=|<|>|=)\s*/).map(token => token.trim()).filter(token => token !== '');
        const nameAt = tokens.findIndex(token => /^(?:device-)?width$/i.test(token));
        if (nameAt >= 0 && (tokens.length === 3 || tokens.length === 5)) {
            const checks = [];
            if (nameAt + 2 < tokens.length)
                checks.push(compare(virtual.width, tokens[nameAt + 1], lengthPx(tokens[nameAt + 2])));
            if (nameAt - 2 >= 0)
                checks.push(compare(virtual.width, FLIP[tokens[nameAt - 1]], lengthPx(tokens[nameAt - 2])));
            if (!checks.length || checks.some(result => result === null))
                return null;
            return checks.every(Boolean);
        }
        if (/width|aspect-ratio|orientation/i.test(inner))
            return null;
    }
    if (/width|aspect-ratio|orientation/i.test(inner))
        return null;
    try {
        return !!view.matchMedia(`(${inner})`).matches;
    }
    catch {
        return null;
    }
}
function evaluateQuery(query, virtual, view) {
    let text = query.trim();
    let negate = false;
    if (/^not\s/i.test(text)) {
        negate = true;
        text = text.replace(/^not\s+/i, '');
    }
    else
        text = text.replace(/^only\s+/i, '');
    const parts = splitTopLevel(text, ' and ').map(part => part.trim()).filter(Boolean);
    if (!parts.length)
        return null;
    let result = true;
    for (const part of parts) {
        if (part.startsWith('(')) {
            const value = evaluateCondition(part, virtual, view);
            if (value === null)
                return null;
            result = result && value;
        }
        else if (/^(?:all|screen)$/i.test(part)) {
        }
        else if (/^[a-z-]+$/i.test(part)) {
            result = false;
        }
        else
            return null;
    }
    return negate ? !result : result;
}
export function evaluateMediaForVirtualPhone(mediaText, view = globalThis.window, virtual = null) {
    const text = String(mediaText || '').trim();
    if (!text || !/width|aspect-ratio|orientation/i.test(text))
        return null;
    const size = virtual || { width: VIRTUAL_PHONE_WIDTH, height: VIRTUAL_PHONE_HEIGHT };
    let any = false;
    for (const query of splitTopLevel(text, ',')) {
        const value = evaluateQuery(query, size, view);
        if (value === null)
            return null;
        if (value)
            any = true;
    }
    return any;
}
function walkMediaRules(owner, on, view) {
    let rules = null;
    try {
        rules = owner.cssRules;
    }
    catch {
        return;
    }
    for (const rule of rules || []) {
        const isMedia = rule?.constructor?.name === 'CSSMediaRule' || (typeof CSSRule !== 'undefined' && rule?.type === CSSRule.MEDIA_RULE);
        if (isMedia && rule.media) {
            if (on) {
                const original = originalMedia.has(rule) ? originalMedia.get(rule) : rule.media.mediaText;
                const value = evaluateMediaForVirtualPhone(original, view);
                if (value !== null) {
                    originalMedia.set(rule, original);
                    const next = value ? 'all' : 'not all';
                    if (rule.media.mediaText !== next) {
                        try {
                            rule.media.mediaText = next;
                        }
                        catch { }
                    }
                }
            }
            else if (originalMedia.has(rule)) {
                try {
                    rule.media.mediaText = originalMedia.get(rule);
                }
                catch { }
                originalMedia.delete(rule);
            }
        }
        if (rule?.cssRules)
            walkMediaRules(rule, on, view);
    }
}
function faceStyleElements(face) {
    const styles = [...(face?.querySelectorAll?.('style') || [])];
    const parent = face?.parentElement;
    if (parent)
        for (const node of parent.children)
            if (node.tagName === 'STYLE' && !styles.includes(node))
                styles.push(node);
    return styles;
}
export function virtualizeFaceMedia(face, on, view = face?.ownerDocument?.defaultView) {
    for (const style of faceStyleElements(face)) {
        let sheet = null;
        try {
            sheet = style.sheet;
        }
        catch {
            sheet = null;
        }
        if (!sheet)
            continue;
        if (on && virtualizedSheets.get(style) === sheet)
            continue;
        walkMediaRules(sheet, on, view);
        if (on)
            virtualizedSheets.set(style, sheet);
        else
            virtualizedSheets.delete(style);
    }
}
function clearCompactShells(doc) {
    for (const host of doc.querySelectorAll('#chat .rabbit-mirror-external-shell[data-rm-independent-external-compact-shell]')) {
        host.removeAttribute('data-rm-independent-external-compact-shell');
        host.style.removeProperty('--rm-external-compact-width');
        delete host.dataset.rmIndependentExternalCompactShell;
    }
}
export function syncDesktopFaceZoom(doc = installed?.doc || globalThis.document) {
    const root = doc?.documentElement;
    if (!root)
        return '';
    const mode = desktopFaceZoomMode(doc);
    const before = root.getAttribute(MODE_ATTR) || '';
    if (mode === 'zoom') {
        const factor = desktopFaceZoomFactor(laneWidth(doc));
        const value = String(factor);
        if (root.style.getPropertyValue(ZOOM_VAR) !== value)
            root.style.setProperty(ZOOM_VAR, value);
        if (before !== 'zoom')
            root.setAttribute(MODE_ATTR, 'zoom');
        clearCompactShells(doc);
        for (const face of doc.querySelectorAll(DESKTOP_ZOOM_FACE_SELECTOR))
            virtualizeFaceMedia(face, true);
    }
    else {
        if (mode)
            root.setAttribute(MODE_ATTR, mode);
        else
            root.removeAttribute(MODE_ATTR);
        root.style.removeProperty(ZOOM_VAR);
        if (before === 'zoom')
            for (const face of doc.querySelectorAll(DESKTOP_ZOOM_FACE_SELECTOR))
                virtualizeFaceMedia(face, false);
    }
    observeChat(doc, mode === 'zoom');
    return mode;
}
export function scheduleDesktopFaceZoomSync() {
    const view = installed?.view || globalThis.window;
    if (syncFrame)
        return;
    const run = () => { syncFrame = 0; try {
        syncDesktopFaceZoom();
    }
    catch (error) {
        console.debug('[RabbitMirror] desktop zoom sync failed', error);
    } };
    syncFrame = typeof view?.requestAnimationFrame === 'function' ? view.requestAnimationFrame(run) : setTimeout(run, 16);
}
function flushPendingFaces() {
    facesFrame = 0;
    const doc = installed?.doc || globalThis.document;
    const faces = [...pendingFaces];
    pendingFaces = new Set();
    if (!desktopFaceZoomActive(doc))
        return;
    for (const face of faces)
        if (face?.isConnected && face.matches?.(DESKTOP_ZOOM_FACE_SELECTOR))
            virtualizeFaceMedia(face, true);
}
function queueFace(face) {
    if (!face)
        return;
    pendingFaces.add(face);
    if (facesFrame)
        return;
    const view = installed?.view || globalThis.window;
    facesFrame = typeof view?.requestAnimationFrame === 'function' ? view.requestAnimationFrame(flushPendingFaces) : setTimeout(flushPendingFaces, 16);
}
function faceOf(node) {
    const element = node?.nodeType === 1 ? node : node?.parentElement;
    let details = null;
    try {
        details = element?.closest?.(DESKTOP_ZOOM_FACE_SELECTOR) || null;
    }
    catch {
        details = null;
    }
    if (details)
        return details;
    const sibling = element?.parentElement?.querySelector?.(':scope > details');
    return sibling?.matches?.(DESKTOP_ZOOM_FACE_SELECTOR) ? sibling : null;
}
function observeChat(doc, on) {
    if (!installed)
        return;
    const chat = doc.getElementById('chat');
    if (installed.resizeObserver && installed.observedChat !== chat) {
        if (installed.observedChat)
            installed.resizeObserver.unobserve(installed.observedChat);
        installed.observedChat = chat || null;
        if (chat)
            installed.resizeObserver.observe(chat);
    }
    if (!on || !chat) {
        installed.mutationObserver?.disconnect();
        installed.mutationTarget = null;
        return;
    }
    if (installed.mutationTarget === chat)
        return;
    installed.mutationObserver?.disconnect();
    const View = doc.defaultView;
    if (typeof View?.MutationObserver !== 'function')
        return;
    installed.mutationObserver = new View.MutationObserver(records => {
        let newFace = false;
        for (const record of records) {
            if (record.target?.nodeName === 'STYLE') {
                queueFace(faceOf(record.target));
                continue;
            }
            for (const node of record.addedNodes || []) {
                if (node.nodeType !== 1)
                    continue;
                if (node.nodeName === 'STYLE')
                    queueFace(faceOf(node));
                else if (node.nodeName === 'DETAILS' || node.querySelector?.('details, style')) {
                    for (const style of node.querySelectorAll?.('style') || [])
                        queueFace(faceOf(style));
                    if (node.nodeName === 'DETAILS' || node.querySelector?.('details'))
                        newFace = true;
                }
            }
        }
        if (newFace && !doc.documentElement.style.getPropertyValue(ZOOM_VAR))
            scheduleDesktopFaceZoomSync();
    });
    installed.mutationObserver.observe(chat, { childList: true, subtree: true });
    installed.mutationTarget = chat;
}
export function noteDesktopZoomFace(root) {
    const doc = root?.ownerDocument;
    if (!doc || !installed || !root.closest?.('#chat'))
        return;
    let face = null;
    try {
        face = root.matches?.(DESKTOP_ZOOM_FACE_SELECTOR) ? root : root.querySelector?.(':scope > details') || root.closest?.(DESKTOP_ZOOM_FACE_SELECTOR);
    }
    catch {
        face = null;
    }
    if (!desktopFaceZoomActive(doc))
        return;
    if (face)
        queueFace(face);
    if (!doc.documentElement.style.getPropertyValue(ZOOM_VAR))
        scheduleDesktopFaceZoomSync();
}
export function installDesktopFaceZoom(doc = globalThis.document) {
    const view = doc?.defaultView;
    if (!doc?.documentElement || !view)
        return;
    if (installed?.doc === doc) {
        scheduleDesktopFaceZoomSync();
        return;
    }
    destroyDesktopFaceZoom();
    let resizeTimer = 0;
    const onResize = () => {
        if (resizeTimer)
            view.clearTimeout(resizeTimer);
        resizeTimer = view.setTimeout(() => { resizeTimer = 0; scheduleDesktopFaceZoomSync(); }, 120);
    };
    let media = null;
    try {
        media = view.matchMedia(WIDE_QUERY);
    }
    catch {
        media = null;
    }
    const onMedia = () => scheduleDesktopFaceZoomSync();
    try {
        media?.addEventListener?.('change', onMedia);
    }
    catch { }
    view.addEventListener('resize', onResize, { passive: true });
    let chatWidth = -1;
    const resizeObserver = typeof view.ResizeObserver === 'function' ? new view.ResizeObserver(entries => {
        const width = Math.round(Number(entries?.[entries.length - 1]?.contentRect?.width) || 0);
        if (width === chatWidth)
            return;
        chatWidth = width;
        onResize();
    }) : null;
    installed = { doc, view, media, onMedia, onResize, resizeObserver, observedChat: null, mutationObserver: null, mutationTarget: null, cancelResize: () => resizeTimer && view.clearTimeout(resizeTimer) };
    syncDesktopFaceZoom(doc);
}
export function destroyDesktopFaceZoom() {
    if (!installed)
        return;
    const { doc, view, media, onMedia, onResize, resizeObserver, mutationObserver, cancelResize } = installed;
    try {
        media?.removeEventListener?.('change', onMedia);
    }
    catch { }
    view.removeEventListener('resize', onResize);
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    cancelResize?.();
    if (syncFrame) {
        try {
            view.cancelAnimationFrame?.(syncFrame);
        }
        catch { }
        clearTimeout(syncFrame);
        syncFrame = 0;
    }
    if (facesFrame) {
        try {
            view.cancelAnimationFrame?.(facesFrame);
        }
        catch { }
        clearTimeout(facesFrame);
        facesFrame = 0;
    }
    pendingFaces = new Set();
    installed = null;
    const root = doc.documentElement;
    if (root.getAttribute(MODE_ATTR) === 'zoom')
        for (const face of doc.querySelectorAll(DESKTOP_ZOOM_FACE_SELECTOR))
            virtualizeFaceMedia(face, false);
    root.removeAttribute(MODE_ATTR);
    root.style.removeProperty(ZOOM_VAR);
}
export function refreshDesktopFaceZoom() {
    if (installed)
        syncDesktopFaceZoom(installed.doc);
}
