export const EXTERNAL_ANCHORS = Object.freeze(['auto', 'body', 'outside']);
export function normalizeExternalAnchor(value) {
    const text = String(value || '').trim();
    return EXTERNAL_ANCHORS.includes(text) ? text : 'auto';
}
function colorAlpha(value) {
    const text = String(value || '').trim().toLowerCase();
    if (!text || text === 'transparent' || text === 'none')
        return 0;
    const slash = text.match(/\/\s*([\d.]+%?)\s*\)$/);
    if (slash)
        return slash[1].endsWith('%') ? Number.parseFloat(slash[1]) / 100 : Number.parseFloat(slash[1]);
    const match = text.match(/^(?:rgba?|hsla?)\(([^)]*)\)$/);
    if (!match)
        return 1;
    const parts = match[1].split(/[\s,]+/).filter(Boolean);
    if (parts.length < 4)
        return 1;
    const last = parts[parts.length - 1];
    const alpha = last.endsWith('%') ? Number.parseFloat(last) / 100 : Number.parseFloat(last);
    return Number.isFinite(alpha) ? alpha : 1;
}
export function paintsBubble(node, view = node?.ownerDocument?.defaultView || globalThis) {
    if (!node || typeof view?.getComputedStyle !== 'function')
        return false;
    let style;
    try {
        style = view.getComputedStyle(node);
    }
    catch {
        return false;
    }
    if (!style)
        return false;
    if (colorAlpha(style.backgroundColor) > 0.02)
        return true;
    if (style.backgroundImage && style.backgroundImage !== 'none')
        return true;
    if (style.boxShadow && style.boxShadow !== 'none')
        return true;
    for (const side of ['Top', 'Bottom', 'Left', 'Right']) {
        const width = Number.parseFloat(style[`border${side}Width`]) || 0;
        if (width > 0 && style[`border${side}Style`] !== 'none' && colorAlpha(style[`border${side}Color`]) > 0.02)
            return true;
    }
    return false;
}
function bodyUsable(body, view) {
    if (!body?.isConnected || typeof view?.getComputedStyle !== 'function')
        return false;
    let style;
    try {
        style = view.getComputedStyle(body);
    }
    catch {
        return false;
    }
    if (!style || style.display === 'none' || style.visibility === 'hidden')
        return false;
    let rect;
    try {
        rect = body.getBoundingClientRect();
    }
    catch {
        return false;
    }
    return rect.width >= 220 && rect.height > 0;
}
export function resolveExternalAnchor(messageElement, body, setting = 'auto', { busy = false } = {}) {
    const mode = normalizeExternalAnchor(setting);
    if (mode === 'outside')
        return 'outside';
    const view = messageElement?.ownerDocument?.defaultView || globalThis;
    const hasBody = !!(body && body !== messageElement && messageElement?.contains?.(body));
    if (!hasBody || busy)
        return 'message';
    if (mode === 'body')
        return bodyUsable(body, view) ? 'body' : 'message';
    return bodyUsable(body, view) && paintsBubble(body, view) ? 'body' : 'message';
}
