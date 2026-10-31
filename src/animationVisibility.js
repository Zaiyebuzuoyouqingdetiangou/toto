import { ANIMATION_SUSPENDED_ATTR } from './runtimeAnimationState.js?rmv=2.2.0';
import { getSettings } from './settings.js?rmv=2.2.0';
export const ANIMATION_AWAKE_EVENT = 'rabbitmirror:animation-awake';
export const IDLE_MS = 25000;
const roots = new Map();
const heldRates = new Map();
let observer = null;
let documentOwner = null;
let idleMode = null;
function idlePauseEnabled() {
    if (idleMode === null) {
        try {
            idleMode = getSettings().animationIdlePause || 'auto';
        }
        catch {
            idleMode = 'auto';
        }
    }
    const mode = idleMode;
    if (mode === 'off')
        return false;
    if (mode === 'on')
        return true;
    try {
        return !!(documentOwner?.defaultView || globalThis).matchMedia?.('(pointer: coarse)')?.matches;
    }
    catch {
        return false;
    }
}
function releaseRates(root) {
    const held = heldRates.get(root);
    heldRates.delete(root);
    for (const [animation, rate] of held || []) {
        try {
            if (animation.playbackRate === 0)
                animation.playbackRate = rate;
        }
        catch { }
    }
}
function holdUnpausedCssAnimations(root, loopingOnly = false) {
    let animations;
    try {
        animations = root.getAnimations?.({ subtree: true }) || [];
    }
    catch {
        return;
    }
    for (const animation of animations) {
        const target = animation.effect?.target;
        if (typeof animation.animationName !== 'string' || !target || (target !== root && !root.contains(target)))
            continue;
        if (animation.playState !== 'running' || !Number.isFinite(animation.playbackRate) || animation.playbackRate === 0)
            continue;
        if (loopingOnly) {
            try {
                if (animation.effect.getTiming().iterations !== Infinity)
                    continue;
            }
            catch {
                continue;
            }
        }
        const held = heldRates.get(root) || new Map();
        try {
            const rate = animation.playbackRate;
            animation.playbackRate = 0;
            held.set(animation, rate);
            heldRates.set(root, held);
        }
        catch { }
    }
}
function paint(root, deferHold = null) {
    const state = roots.get(root);
    if (!state)
        return;
    if (!root.isConnected) {
        untrackMirrorAnimations(root);
        return;
    }
    const reason = !state.visible || documentOwner?.hidden === true ? 'offscreen' : state.idle ? 'idle' : '';
    const before = root.getAttribute(ANIMATION_SUSPENDED_ATTR);
    if (reason) {
        if (before !== reason) {
            releaseRates(root);
            root.setAttribute(ANIMATION_SUSPENDED_ATTR, reason);
        }
        if (deferHold)
            deferHold.push([root, reason === 'idle']);
        else
            holdUnpausedCssAnimations(root, reason === 'idle');
    }
    else {
        if (before !== null)
            root.removeAttribute(ANIMATION_SUSPENDED_ATTR);
        releaseRates(root);
    }
    if (before !== null && before !== reason) {
        try {
            root.dispatchEvent(new CustomEvent(ANIMATION_AWAKE_EVENT, { bubbles: true }));
        }
        catch { }
    }
    armIdle(root);
}
function armIdle(root) {
    const state = roots.get(root);
    if (!state)
        return;
    clearTimeout(state.timer);
    state.timer = 0;
    if (!state.visible || state.idle || documentOwner?.hidden === true || !idlePauseEnabled())
        return;
    state.timer = setTimeout(() => {
        const current = roots.get(root);
        if (!current || !current.visible || !idlePauseEnabled())
            return;
        current.idle = true;
        paint(root);
    }, IDLE_MS);
}
function wake(root) {
    const state = roots.get(root);
    if (!state)
        return;
    if (state.idle) {
        state.idle = false;
        paint(root);
    }
    else
        armIdle(root);
}
const TOUCH_EVENTS = ['pointerdown', 'wheel', 'keydown', 'input', 'toggle'];
function onTouch(event) {
    wake(event.currentTarget);
}
function visibilityChanged() {
    for (const root of roots.keys())
        paint(root);
}
export function trackMirrorAnimations(root) {
    if (!root?.isConnected || roots.has(root))
        return;
    const doc = root.ownerDocument;
    const Observer = doc?.defaultView?.IntersectionObserver || globalThis.IntersectionObserver;
    if (typeof Observer !== 'function')
        return;
    if (!observer) {
        documentOwner = doc;
        observer = new Observer(entries => {
            const holds = [];
            for (const entry of entries) {
                const state = roots.get(entry.target);
                if (!state)
                    continue;
                const visible = entry.isIntersecting === true;
                if (visible && !state.visible)
                    state.idle = false;
                state.visible = visible;
                paint(entry.target, holds);
            }
            for (const [root, loopingOnly] of holds)
                if (roots.has(root))
                    holdUnpausedCssAnimations(root, loopingOnly);
        }, { root: null, threshold: 0 });
        doc.addEventListener('visibilitychange', visibilityChanged);
    }
    if (doc !== documentOwner)
        return;
    roots.set(root, { visible: true, idle: false, timer: 0 });
    for (const type of TOUCH_EVENTS)
        root.addEventListener(type, onTouch, { capture: true, passive: true });
    paint(root);
    observer.observe(root);
}
export function untrackMirrorAnimations(root) {
    const state = roots.get(root);
    if (!state)
        return;
    clearTimeout(state.timer);
    roots.delete(root);
    for (const type of TOUCH_EVENTS)
        root.removeEventListener?.(type, onTouch, { capture: true });
    observer?.unobserve(root);
    const wasSuspended = root.hasAttribute?.(ANIMATION_SUSPENDED_ATTR);
    root.removeAttribute?.(ANIMATION_SUSPENDED_ATTR);
    releaseRates(root);
    if (wasSuspended && root.isConnected) {
        try {
            root.dispatchEvent(new CustomEvent(ANIMATION_AWAKE_EVENT, { bubbles: true }));
        }
        catch { }
    }
    if (!roots.size)
        destroyMirrorAnimationVisibility();
}
export function pruneMirrorAnimationVisibility() {
    for (const root of roots.keys())
        if (!root.isConnected)
            untrackMirrorAnimations(root);
}
export function refreshMirrorAnimationIdlePause() {
    idleMode = null;
    const enabled = idlePauseEnabled();
    for (const [root, state] of roots) {
        if (!enabled && state.idle)
            state.idle = false;
        paint(root);
    }
}
export function destroyMirrorAnimationVisibility() {
    observer?.disconnect();
    observer = null;
    documentOwner?.removeEventListener('visibilitychange', visibilityChanged);
    documentOwner = null;
    for (const [root, state] of roots) {
        clearTimeout(state.timer);
        for (const type of TOUCH_EVENTS)
            root.removeEventListener?.(type, onTouch, { capture: true });
        root.removeAttribute?.(ANIMATION_SUSPENDED_ATTR);
        releaseRates(root);
    }
    roots.clear();
}
