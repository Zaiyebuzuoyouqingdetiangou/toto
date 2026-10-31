import { layoutRect } from '../faceZoomMetrics.js?rmv=2.3.2';
const PROBE_ATTR = 'data-rm-frame-probe';
export const FACE_FRAME_ATTR = 'data-rm-face-frame';
export const FACE_FRAME_BODY_ATTR = 'data-rm-face-frame-body';
export const FACE_FRAME_VARS = ['--rm-face-frame-bg', '--rm-face-frame-bg-image', '--rm-face-frame-border', '--rm-face-frame-radius', '--rm-face-frame-shadow'];
const SKIP_TAGS = new Set(['SUMMARY', 'STYLE', 'SCRIPT', 'TEMPLATE', 'LINK', 'META']);
function alphaOf(color) {
    const text = String(color || '').trim().toLowerCase();
    if (!text || text === 'transparent')
        return 0;
    const slash = text.match(/\/\s*([\d.]+%?)\s*\)$/);
    if (slash)
        return slash[1].endsWith('%') ? Number.parseFloat(slash[1]) / 100 : Number.parseFloat(slash[1]);
    const match = text.match(/^rgba?\(([^)]*)\)$/);
    if (!match)
        return 1;
    const parts = match[1].split(/[\s,]+/).filter(Boolean);
    return parts.length >= 4 ? Number.parseFloat(parts[3]) : 1;
}
function borderOf(style) {
    const sides = ['Top', 'Right', 'Bottom', 'Left']
        .map(side => ({ width: Number.parseFloat(style[`border${side}Width`]) || 0, style: style[`border${side}Style`], color: style[`border${side}Color`] }))
        .filter(side => side.width > 0 && side.style !== 'none' && alphaOf(side.color) > 0.02);
    if (!sides.length)
        return '';
    const best = sides.sort((a, b) => b.width - a.width)[0];
    return `${best.width}px ${best.style} ${best.color}`;
}
function authoredFrame(details, view) {
    details.setAttribute(PROBE_ATTR, 'true');
    try {
        const style = view.getComputedStyle(details);
        return {
            bg: alphaOf(style.backgroundColor) > 0.02 ? style.backgroundColor : '',
            bgImage: style.backgroundImage && style.backgroundImage !== 'none' ? style.backgroundImage : '',
            border: borderOf(style),
            radius: style.borderRadius && !/^0(?:px)?(?:\s+0(?:px)?)*$/.test(style.borderRadius) ? style.borderRadius : '',
            shadow: style.boxShadow && style.boxShadow !== 'none' ? style.boxShadow : '',
        };
    }
    catch {
        return null;
    }
    finally {
        details.removeAttribute(PROBE_ATTR);
    }
}
function faceBody(details) {
    const children = [...details.children].filter(node => !SKIP_TAGS.has(node.tagName)
        && !node.matches('[data-collapse-btn], .details-collapse-btn, [data-rm-mobile-controls], [popover]'));
    return children.length === 1 ? children[0] : null;
}
export function clearFaceFrame(details) {
    if (!details?.removeAttribute)
        return;
    details.removeAttribute(FACE_FRAME_ATTR);
    for (const name of FACE_FRAME_VARS)
        details.style?.removeProperty?.(name);
    for (const node of details.querySelectorAll?.(`[${FACE_FRAME_BODY_ATTR}]`) || [])
        node.removeAttribute(FACE_FRAME_BODY_ATTR);
    for (const node of details.querySelectorAll?.(`[${FACE_FLUSH_ATTR}]`) || [])
        node.removeAttribute(FACE_FLUSH_ATTR);
    details.removeAttribute('data-rm-face-flush-checked');
    for (const node of details.querySelectorAll?.('[data-rm-face-flush-checked]') || [])
        node.removeAttribute('data-rm-face-flush-checked');
}
export const FACE_FLUSH_ATTR = 'data-rm-face-flush';
const FLUSH_CHECKED_ATTR = 'data-rm-face-flush-checked';
const MAX_INSET = 40;
export function flushFaceBlocks(details) {
    const view = details?.ownerDocument?.defaultView;
    if (!details?.isConnected || typeof view?.getComputedStyle !== 'function')
        return 0;
    if (details.hasAttribute(FLUSH_CHECKED_ATTR))
        return 0;
    if (!details.open || details.hidden || details.style.display === 'none' || details.hasAttribute('data-rm-ephemeral-failure'))
        return 0;
    const blocks = [...details.children].filter(node => !SKIP_TAGS.has(node.tagName)
        && !node.matches('[data-collapse-btn], .details-collapse-btn, [data-rm-mobile-controls], [popover]'));
    if (!blocks.length || !blocks.some(node => node.getClientRects().length))
        return 0;
    let count = 0;
    for (const node of blocks) {
        if (!node.getClientRects().length)
            continue;
        let style;
        try {
            style = view.getComputedStyle(node);
        }
        catch {
            continue;
        }
        if (style.position === 'absolute' || style.position === 'fixed' || style.display.startsWith('inline'))
            continue;
        const left = Number.parseFloat(style.marginLeft) || 0, right = Number.parseFloat(style.marginRight) || 0;
        if (left <= 0 || right <= 0 || left > MAX_INSET || right > MAX_INSET || Math.abs(left - right) > 2)
            continue;
        const before = layoutRect(node).width;
        node.setAttribute(FACE_FLUSH_ATTR, 'true');
        const after = layoutRect(node).width;
        if (after - before < (left + right) - 2) {
            node.removeAttribute(FACE_FLUSH_ATTR);
            continue;
        }
        count += 1;
    }
    details.setAttribute(FLUSH_CHECKED_ATTR, 'true');
    return count;
}
export function carryFaceFrame(details) {
    const view = details?.ownerDocument?.defaultView;
    if (!details?.isConnected || typeof view?.getComputedStyle !== 'function')
        return false;
    if (details.hasAttribute(FACE_FRAME_ATTR)) {
        if (details.getAttribute(FACE_FRAME_ATTR) !== 'true' || details.querySelector(':scope > [data-rm-face-frame-body]'))
            return details.getAttribute(FACE_FRAME_ATTR) === 'true';
        clearFaceFrame(details);
    }
    if (details.hasAttribute('data-rm-ephemeral-failure'))
        return false;
    const body = faceBody(details);
    const none = () => { details.setAttribute(FACE_FRAME_ATTR, 'none'); return false; };
    if (!body)
        return none();
    const frame = authoredFrame(details, view);
    if (!frame)
        return false;
    if (!frame.bg && !frame.bgImage && !frame.border && !frame.shadow)
        return none();
    let own;
    try {
        own = view.getComputedStyle(body);
    }
    catch {
        return false;
    }
    const ownBackground = alphaOf(own.backgroundColor) > 0.02 || (own.backgroundImage && own.backgroundImage !== 'none');
    const vars = {
        '--rm-face-frame-bg': ownBackground ? '' : frame.bg,
        '--rm-face-frame-bg-image': ownBackground ? '' : frame.bgImage,
        '--rm-face-frame-border': borderOf(own) ? '' : frame.border,
        '--rm-face-frame-radius': (Number.parseFloat(own.borderTopLeftRadius) || 0) ? '' : frame.radius,
        '--rm-face-frame-shadow': own.boxShadow && own.boxShadow !== 'none' ? '' : frame.shadow,
    };
    if (!vars['--rm-face-frame-bg'] && !vars['--rm-face-frame-bg-image'] && !vars['--rm-face-frame-border'] && !vars['--rm-face-frame-shadow'])
        return none();
    const parts = { '--rm-face-frame-bg': 'bg', '--rm-face-frame-bg-image': 'bgimg', '--rm-face-frame-border': 'border', '--rm-face-frame-radius': 'radius', '--rm-face-frame-shadow': 'shadow' };
    const tokens = [];
    for (const [name, value] of Object.entries(vars)) {
        if (value) {
            details.style.setProperty(name, value);
            tokens.push(parts[name]);
        }
        else
            details.style.removeProperty(name);
    }
    body.setAttribute(FACE_FRAME_BODY_ATTR, tokens.join(' '));
    details.setAttribute(FACE_FRAME_ATTR, 'true');
    return true;
}
const TOGGLE_BOUND = new WeakSet();
export function carryExternalFaceFrames(host) {
    let count = 0;
    for (const details of host?.querySelectorAll?.(':scope > details[data-rabbit-mirror-external-details="true"]:not(.rabbit-mirror-external-placeholder)') || []) {
        if (!TOGGLE_BOUND.has(details)) {
            TOGGLE_BOUND.add(details);
            details.addEventListener('toggle', () => { if (details.open && details.closest('[data-rm-placement="external"]')) {
                try {
                    flushFaceBlocks(details);
                }
                catch { }
            } });
        }
        try {
            flushFaceBlocks(details);
        }
        catch { }
        try {
            if (carryFaceFrame(details))
                count += 1;
        }
        catch { }
    }
    return count;
}
