export const DESKTOP_ZOOM_FACE_SELECTOR = [
    '#chat .rabbit-mirror-external-shell[data-rm-source][data-rm-placement] > details[data-rabbit-mirror-external-details="true"]',
    '#chat toto[data-rabbit-mirror="true"] > details',
].join(', ');
export const VIRTUAL_PHONE_WIDTH = 440;
export const VIRTUAL_PHONE_HEIGHT = 900;
export function cssZoomOf(element) {
    const node = element?.nodeType === 1 ? element : element?.parentElement;
    const value = Number(node?.currentCSSZoom);
    return Number.isFinite(value) && value > 0 ? value : 1;
}
export function toLayoutPx(element, px) {
    const value = Number(px);
    if (!Number.isFinite(value))
        return value;
    const zoom = cssZoomOf(element);
    return zoom === 1 ? value : value / zoom;
}
export function layoutRect(element) {
    const rect = element?.getBoundingClientRect?.();
    if (!rect)
        return rect;
    const zoom = cssZoomOf(element);
    if (zoom === 1)
        return rect;
    const scale = value => Number(value) / zoom;
    return {
        left: scale(rect.left), right: scale(rect.right), top: scale(rect.top), bottom: scale(rect.bottom),
        x: scale(rect.x), y: scale(rect.y), width: scale(rect.width), height: scale(rect.height),
    };
}
export function insideDesktopZoomFace(element) {
    const node = element?.nodeType === 1 ? element : element?.parentElement;
    const root = node?.ownerDocument?.documentElement;
    if (root?.getAttribute?.('data-rm-face-zoom') !== 'zoom')
        return false;
    try {
        return !!node.closest(DESKTOP_ZOOM_FACE_SELECTOR);
    }
    catch {
        return false;
    }
}
export function layoutViewportWidthFor(element) {
    if (insideDesktopZoomFace(element))
        return VIRTUAL_PHONE_WIDTH;
    const node = element?.nodeType === 1 ? element : element?.parentElement;
    const view = node?.ownerDocument?.defaultView || globalThis;
    return Math.max(0, Number(view?.innerWidth || node?.ownerDocument?.documentElement?.clientWidth || 0));
}
export function phoneFrameMapper(element) {
    const node = element?.nodeType === 1 ? element : element?.parentElement;
    if (!insideDesktopZoomFace(node))
        return rect => rect ? { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height } : null;
    let face = null;
    try {
        face = node.closest(DESKTOP_ZOOM_FACE_SELECTOR);
    }
    catch {
        face = null;
    }
    const faceRect = face?.getBoundingClientRect?.();
    const zoom = cssZoomOf(face);
    const inset = Math.max(0, (VIRTUAL_PHONE_WIDTH - Number(face?.offsetWidth || 0)) / 2);
    const x = value => (Number(value) - Number(faceRect?.left || 0)) / zoom + inset;
    const y = value => (Number(value) - Number(faceRect?.top || 0)) / zoom;
    return rect => rect ? { left: x(rect.left), right: x(rect.right), top: y(rect.top), bottom: y(rect.bottom), width: Number(rect.width) / zoom, height: Number(rect.height) / zoom } : null;
}
export function phoneFrameRect(element) {
    let rect = null;
    try {
        rect = element?.getBoundingClientRect?.() || null;
    }
    catch {
        rect = null;
    }
    return rect ? phoneFrameMapper(element)(rect) : null;
}
export const zoomInlineOriginals = new WeakMap();
export function restoreZoomInlineStyle(source, target, record = zoomInlineOriginals.get(source)) {
    if (!record || !target?.style)
        return;
    if (target.getAttribute?.('style') === record.zoomed) {
        if (record.text === null)
            target.removeAttribute('style');
        else
            target.setAttribute('style', record.text);
        return;
    }
    for (const [name, value, priority] of record.props || []) {
        try {
            target.style.setProperty(name, value, priority);
        }
        catch { }
    }
}
export const faceZoomEvents = typeof EventTarget === 'function' ? new EventTarget() : null;
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
