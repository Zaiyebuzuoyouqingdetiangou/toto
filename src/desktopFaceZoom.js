import { getSettings } from './settings.js?rmv=2.0.0';
import { DESKTOP_ZOOM_FACE_SELECTOR, VIRTUAL_PHONE_WIDTH, VIRTUAL_PHONE_HEIGHT, zoomInlineOriginals, restoreZoomInlineStyle, faceZoomEvents, evaluateMediaForVirtualPhone } from './faceZoomMetrics.js?rmv=2.0.0';
export { DESKTOP_ZOOM_FACE_SELECTOR, VIRTUAL_PHONE_WIDTH, VIRTUAL_PHONE_HEIGHT, evaluateMediaForVirtualPhone };
export const FACE_DESIGN_WIDTH = 400;
export const FACE_MAX_VISUAL_WIDTH = 640;
export const FACE_NARROW_FALLBACK_WIDTH = 460;
const WIDE_QUERY = '(min-width: 900px)';
const MODE_ATTR = 'data-rm-face-zoom';
const ZOOM_VAR = '--rm-face-zoom';
const VW_VAR = '--rm-face-vw';
const VH_VAR = '--rm-face-vh';
const LANE_HYSTERESIS_PX = 24;
let installed = null;
let syncHandle = null;
let supportCache = null;
let lastLane = 0;
const originalMedia = new WeakMap();
const originalDeclarations = new WeakMap();
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
    let narrowest = 0;
    const faces = chat.querySelectorAll(DESKTOP_ZOOM_FACE_SELECTOR);
    for (let index = faces.length - 1; index >= 0 && index >= faces.length - 6; index -= 1) {
        const width = faceLaneWidth(faces[index], view);
        if (width > 0 && (!narrowest || width < narrowest))
            narrowest = width;
    }
    if (narrowest)
        return narrowest;
    const texts = chat.querySelectorAll('.mes .mes_text');
    for (let index = texts.length - 1; index >= 0 && index >= texts.length - 6; index -= 1) {
        const width = contentWidth(texts[index], view);
        if (width > 0 && (!narrowest || width < narrowest))
            narrowest = width;
    }
    return narrowest;
}
export function desktopFaceZoomFactor(lane) {
    const width = Math.min(Number(lane) || 0, FACE_MAX_VISUAL_WIDTH);
    const factor = width / FACE_DESIGN_WIDTH;
    if (!Number.isFinite(factor) || factor < 1.05)
        return 1;
    return Math.round(factor * 1000) / 1000;
}
const VIEWPORT_UNIT = /(-?(?:\d+\.?\d*|\.\d+))(s|l|d)?(vw|vh|vi|vb|vmin|vmax)\b/gi;
function replaceViewportUnits(value) {
    return String(value).replace(VIEWPORT_UNIT, (match, number, prefix, unit) => {
        const kind = unit.toLowerCase();
        const variable = kind === 'vw' || kind === 'vi' || kind === 'vmin' ? VW_VAR : VH_VAR;
        return `calc(${number} * var(${variable}, 1${(prefix || '') + unit}))`;
    });
}
function virtualizeDeclarations(rule, on) {
    const style = rule?.style;
    if (!style || typeof style.getPropertyValue !== 'function')
        return;
    if (on) {
        if (originalDeclarations.has(rule))
            return;
        const changed = [];
        for (let index = 0; index < style.length; index += 1) {
            const name = style.item(index);
            const value = style.getPropertyValue(name);
            VIEWPORT_UNIT.lastIndex = 0;
            if (!value || !VIEWPORT_UNIT.test(value))
                continue;
            changed.push([name, value, style.getPropertyPriority(name)]);
        }
        if (!changed.length)
            return;
        originalDeclarations.set(rule, changed);
        for (const [name, value, priority] of changed) {
            try {
                style.setProperty(name, replaceViewportUnits(value), priority);
            }
            catch { }
        }
    }
    else if (originalDeclarations.has(rule)) {
        for (const [name, value, priority] of originalDeclarations.get(rule)) {
            try {
                style.setProperty(name, value, priority);
            }
            catch { }
        }
        originalDeclarations.delete(rule);
    }
}
const INLINE_VIEWPORT_SELECTOR = '[style*="vw" i], [style*="vh" i], [style*="vmin" i], [style*="vmax" i]';
function virtualizeInline(face, on) {
    const nodes = [...(face?.querySelectorAll?.(INLINE_VIEWPORT_SELECTOR) || [])];
    if (face?.matches?.(INLINE_VIEWPORT_SELECTOR))
        nodes.push(face);
    for (const node of nodes) {
        const style = node.style;
        if (!style)
            continue;
        if (on) {
            if (zoomInlineOriginals.has(node))
                continue;
            const changed = [];
            for (let index = 0; index < style.length; index += 1) {
                const name = style.item(index);
                const value = style.getPropertyValue(name);
                VIEWPORT_UNIT.lastIndex = 0;
                if (value && VIEWPORT_UNIT.test(value))
                    changed.push([name, value, style.getPropertyPriority(name)]);
            }
            if (!changed.length)
                continue;
            const text = node.getAttribute('style');
            for (const [name, value, priority] of changed) {
                try {
                    style.setProperty(name, replaceViewportUnits(value), priority);
                }
                catch { }
            }
            zoomInlineOriginals.set(node, { text, zoomed: node.getAttribute('style'), props: changed });
        }
        else if (zoomInlineOriginals.has(node)) {
            restoreZoomInlineStyle(node, node, zoomInlineOriginals.get(node));
            zoomInlineOriginals.delete(node);
        }
    }
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
        virtualizeDeclarations(rule, on);
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
    virtualizeInline(face, on);
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
function clearZoomVars(root) {
    for (const name of [ZOOM_VAR, VW_VAR, VH_VAR])
        root.style.removeProperty(name);
    lastLane = 0;
}
function writeViewportVars(doc, factor) {
    const root = doc.documentElement;
    const view = doc.defaultView;
    const vw = `${VIRTUAL_PHONE_WIDTH / 100}px`;
    const height = Math.max(1, Number(view?.innerHeight) || VIRTUAL_PHONE_HEIGHT);
    const vh = `${Math.round(height / Math.max(1, factor) / 100 * 1000) / 1000}px`;
    if (root.style.getPropertyValue(VW_VAR) !== vw)
        root.style.setProperty(VW_VAR, vw);
    if (root.style.getPropertyValue(VH_VAR) !== vh)
        root.style.setProperty(VH_VAR, vh);
}
export function syncDesktopFaceZoom(doc = installed?.doc || globalThis.document) {
    const root = doc?.documentElement;
    if (!root)
        return '';
    const mode = desktopFaceZoomMode(doc);
    const before = root.getAttribute(MODE_ATTR) || '';
    if (mode === 'zoom') {
        clearCompactShells(doc);
        if (before !== 'zoom')
            root.setAttribute(MODE_ATTR, 'zoom');
        const lane = laneWidth(doc);
        const current = root.style.getPropertyValue(ZOOM_VAR);
        if (lane > 0 && (!current || Math.abs(lane - lastLane) >= LANE_HYSTERESIS_PX)) {
            const value = String(desktopFaceZoomFactor(lane));
            if (current !== value)
                root.style.setProperty(ZOOM_VAR, value);
            lastLane = lane;
        }
        writeViewportVars(doc, Number(root.style.getPropertyValue(ZOOM_VAR)) || 1);
        for (const face of doc.querySelectorAll(DESKTOP_ZOOM_FACE_SELECTOR))
            virtualizeFaceMedia(face, true);
    }
    else {
        if (mode)
            root.setAttribute(MODE_ATTR, mode);
        else
            root.removeAttribute(MODE_ATTR);
        clearZoomVars(root);
        if (before === 'zoom')
            for (const face of doc.querySelectorAll(DESKTOP_ZOOM_FACE_SELECTOR))
                virtualizeFaceMedia(face, false);
    }
    observeChat(doc, mode === 'zoom');
    if (before !== (mode || '')) {
        try {
            faceZoomEvents?.dispatchEvent(new Event('change'));
        }
        catch { }
    }
    return mode;
}
function cancelHandle(view, handle) {
    if (!handle)
        return;
    if (handle.frame) {
        try {
            view?.cancelAnimationFrame?.(handle.id);
        }
        catch { }
    }
    else
        clearTimeout(handle.id);
}
export function scheduleDesktopFaceZoomSync() {
    const view = installed?.view || globalThis.window;
    if (syncHandle)
        return;
    const run = () => { syncHandle = null; try {
        syncDesktopFaceZoom();
    }
    catch (error) {
        console.debug('[RabbitMirror] desktop zoom sync failed', error);
    } };
    syncHandle = typeof view?.requestAnimationFrame === 'function'
        ? { id: view.requestAnimationFrame(run), frame: true }
        : { id: setTimeout(run, 16), frame: false };
}
function virtualizeNow(face) {
    if (face?.isConnected && face.matches?.(DESKTOP_ZOOM_FACE_SELECTOR))
        virtualizeFaceMedia(face, true);
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
                virtualizeNow(faceOf(record.target));
                continue;
            }
            for (const node of record.addedNodes || []) {
                if (node.nodeType !== 1)
                    continue;
                if (node.nodeName === 'STYLE')
                    virtualizeNow(faceOf(node));
                else if (node.nodeName === 'DETAILS' || node.querySelector?.('details, style')) {
                    for (const style of node.querySelectorAll?.('style') || [])
                        virtualizeNow(faceOf(style));
                    if (node.nodeName === 'DETAILS' || node.querySelector?.('details')) {
                        newFace = true;
                        let faces = [];
                        try {
                            faces = node.matches?.(DESKTOP_ZOOM_FACE_SELECTOR) ? [node] : [...node.querySelectorAll(DESKTOP_ZOOM_FACE_SELECTOR)];
                        }
                        catch {
                            faces = [];
                        }
                        if (!faces.length)
                            faces = [faceOf(node)];
                        for (const face of faces)
                            virtualizeNow(face);
                    }
                }
            }
        }
        if (newFace && !doc.documentElement.style.getPropertyValue(ZOOM_VAR))
            scheduleDesktopFaceZoomSync();
    });
    installed.mutationObserver.observe(chat, { childList: true, subtree: true, characterData: false });
    installed.mutationTarget = chat;
}
export function noteDesktopZoomFace(root) {
    const doc = root?.ownerDocument;
    if (!doc || !installed || !root.closest?.('#chat'))
        return;
    if (!desktopFaceZoomActive(doc))
        return;
    let face = null;
    try {
        face = root.matches?.(DESKTOP_ZOOM_FACE_SELECTOR) ? root : root.querySelector?.(':scope > details') || root.closest?.(DESKTOP_ZOOM_FACE_SELECTOR);
    }
    catch {
        face = null;
    }
    virtualizeNow(face);
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
    cancelHandle(view, syncHandle);
    syncHandle = null;
    installed = null;
    const root = doc.documentElement;
    const before = root.getAttribute(MODE_ATTR) || '';
    if (before === 'zoom')
        for (const face of doc.querySelectorAll(DESKTOP_ZOOM_FACE_SELECTOR))
            virtualizeFaceMedia(face, false);
    root.removeAttribute(MODE_ATTR);
    clearZoomVars(root);
    if (before) {
        try {
            faceZoomEvents?.dispatchEvent(new Event('change'));
        }
        catch { }
    }
}
export function refreshDesktopFaceZoom() {
    if (installed)
        syncDesktopFaceZoom(installed.doc);
}
