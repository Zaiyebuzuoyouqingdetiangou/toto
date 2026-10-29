import { layoutRect } from '../faceZoomMetrics.js?rmv=2.0.0';
export const REVEAL_MOTION_ID = 'rm-motion';
const BOUND = new WeakSet();
const CHROME = ['summary', '[data-rabbit-mirror-maintenance-rabbit]', '[data-rabbit-mirror-feedback-cat]', '[data-rabbit-mirror-recipe]',
    '[data-rabbit-mirror-resay]', '[data-rabbit-mirror-tool-entry-host]', '[data-rm-face-swipe-host]', '[data-rm-image-region]',
    '[data-rm-image-portal]', '[data-rabbit-mirror-maintenance-menu]', '[data-rabbit-mirror-feedback-cat-menu]',
    '[data-rabbit-mirror-recipe-menu]', '[data-rabbit-mirror-interaction-diagnostic]', '[data-collapse-btn]'].join(',');
const INPUT_WINDOW_MS = 1500;
const MAX_PER_BURST = 12;
const ENTER_MS = 220;
const SETTLE_MS = 450;
export function isRevealMotionAnimation(animation) {
    return animation?.id === REVEAL_MOTION_ID;
}
function reducedMotion(view) {
    try {
        return Boolean(view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    }
    catch {
        return false;
    }
}
function hasOwnMotion(node, style) {
    if ((style.animationName || 'none') !== 'none')
        return true;
    try {
        if ((node.getAnimations?.() || []).some(animation => !isRevealMotionAnimation(animation)))
            return true;
    }
    catch { }
    const durations = String(style.transitionDuration || '0s').split(',').map(value => parseFloat(value) || 0);
    if (!durations.some(value => value > 0))
        return false;
    return /\b(?:all|opacity|transform|translate|scale)\b/.test(String(style.transitionProperty || ''));
}
function enter(node, view) {
    if (!node.isConnected || node.closest?.('[data-rm-part]'))
        return false;
    let style;
    try {
        style = view.getComputedStyle(node);
    }
    catch {
        return false;
    }
    if (style.display === 'none' || style.visibility === 'hidden')
        return false;
    const rect = layoutRect(node);
    if (!rect || !rect.width || !rect.height)
        return false;
    if (hasOwnMotion(node, style))
        return false;
    const lift = style.display !== 'inline' && rect.height >= 24
        && (style.transform || 'none') === 'none' && (style.translate || 'none') === 'none';
    const opacity = Number.parseFloat(style.opacity);
    const target = Number.isFinite(opacity) ? opacity : 1;
    if (target <= 0.02)
        return false;
    const frames = lift
        ? [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: target, transform: 'translateY(0)' }]
        : [{ opacity: 0 }, { opacity: target }];
    try {
        node.animate(frames, { duration: ENTER_MS, easing: 'cubic-bezier(.2,.7,.3,1)', id: REVEAL_MOTION_ID });
        return true;
    }
    catch {
        return false;
    }
}
function settle(group, view) {
    if (!group.isConnected || group.closest?.('[data-rm-part]'))
        return false;
    let style;
    try {
        style = view.getComputedStyle(group);
    }
    catch {
        return false;
    }
    if (style.display === 'none' || hasOwnMotion(group, style))
        return false;
    const filter = (style.filter || 'none') === 'none';
    const sink = (style.transform || 'none') === 'none' && (style.translate || 'none') === 'none';
    if (!filter && !sink)
        return false;
    const frame = (bright, y) => ({ ...(filter ? { filter: `brightness(${bright})` } : {}), ...(sink ? { transform: `translateY(${y}px)` } : {}) });
    try {
        group.animate([frame(1, 0), frame(1.07, 1.5), frame(1, 0)], { duration: SETTLE_MS, easing: 'ease-out', id: REVEAL_MOTION_ID });
        return true;
    }
    catch {
        return false;
    }
}
export function installRevealMotion(root) {
    const face = root?.matches?.('details') ? root : root?.querySelector?.('details');
    if (!face || BOUND.has(face))
        return;
    const view = face.ownerDocument?.defaultView;
    if (!view?.MutationObserver || typeof face.animate !== 'function')
        return;
    BOUND.add(face);
    let lastInput = -Infinity;
    const touched = event => {
        if (!event.isTrusted)
            return;
        const target = event.target?.closest ? event.target : event.target?.parentElement;
        if (target?.closest?.(CHROME))
            return;
        lastInput = Date.now();
    };
    for (const type of ['pointerdown', 'pointerup', 'click', 'keydown', 'input', 'change'])
        face.addEventListener(type, touched, true);
    const pending = { enter: new Set(), settle: new Set() };
    let scheduled = false;
    const flush = () => {
        scheduled = false;
        const entering = [...pending.enter], settling = [...pending.settle];
        pending.enter.clear();
        pending.settle.clear();
        if (reducedMotion(view))
            return;
        let count = 0;
        const moved = new Set();
        for (const node of entering) {
            if (count >= MAX_PER_BURST)
                break;
            if (node.getAttribute('data-rm-result-active') !== 'true')
                continue;
            if ([...moved].some(other => other !== node && other.contains(node)))
                continue;
            if (enter(node, view)) {
                moved.add(node);
                count++;
            }
        }
        for (const group of settling)
            if (group.getAttribute('data-rm-done') === 'true')
                settle(group, view);
    };
    const observer = new view.MutationObserver(records => {
        if (Date.now() - lastInput > INPUT_WINDOW_MS)
            return;
        for (const record of records) {
            const node = record.target;
            if (record.attributeName === 'data-rm-result-active') {
                if (record.oldValue === 'false' && node.getAttribute('data-rm-result-active') === 'true')
                    pending.enter.add(node);
            }
            else if (record.attributeName === 'data-rm-done') {
                if (record.oldValue !== 'true' && node.getAttribute('data-rm-done') === 'true' && node.matches?.('[data-rm-ui]'))
                    pending.settle.add(node);
            }
        }
        if ((pending.enter.size || pending.settle.size) && !scheduled) {
            scheduled = true;
            (view.requestAnimationFrame || (callback => view.setTimeout(callback, 16)))(flush);
        }
    });
    observer.observe(face, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['data-rm-result-active', 'data-rm-done'] });
}
