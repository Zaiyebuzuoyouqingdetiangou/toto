import { ANIMATION_SUSPENDED_ATTR } from './runtimeAnimationState.js?rmv=1.62.83';

// One observer, no scroll handler, per-frame scan or polling. CSS supplies the
// temporary pause; releasing it restores authored/checked/reduced-motion rules.
const roots = new Map();
const heldRates = new Map();
let observer = null;
let documentOwner = null;
function releaseRates(root) {
    const held = heldRates.get(root);
    heldRates.delete(root);
    for (const [animation, rate] of held || []) {
        // Restore speed only. Never call play(), which could undo a user pause.
        try { if (animation.playbackRate === 0) animation.playbackRate = rate; } catch { /* detached effect */ }
    }
}
function holdUnpausedCssAnimations(root) {
    // Inline running!important can outrank the suspension stylesheet. Freeze
    // only still-running CSS animations without changing their play/pause state.
    let animations;
    try { animations = root.getAnimations?.({ subtree: true }) || []; } catch { return; }
    for (const animation of animations) {
        const target = animation.effect?.target;
        if (typeof animation.animationName !== 'string' || !target || (target !== root && !root.contains(target))) continue;
        if (animation.playState !== 'running' || !Number.isFinite(animation.playbackRate) || animation.playbackRate === 0) continue;
        const held = heldRates.get(root) || new Map();
        try {
            const rate = animation.playbackRate;
            animation.playbackRate = 0;
            held.set(animation, rate); heldRates.set(root, held);
        } catch { /* CSS suspension remains available on older hosts */ }
    }
}
function paint(root, visible) {
    if (!root.isConnected) { untrackMirrorAnimations(root); return; }
    const suspended = !visible || documentOwner?.hidden === true;
    root.toggleAttribute(ANIMATION_SUSPENDED_ATTR, suspended);
    if (suspended) holdUnpausedCssAnimations(root);
    else releaseRates(root);
}
function visibilityChanged() {
    for (const [root, visible] of roots) paint(root, visible);
}
export function trackMirrorAnimations(root) {
    if (!root?.isConnected || roots.has(root)) return;
    const doc = root.ownerDocument;
    const Observer = doc?.defaultView?.IntersectionObserver || globalThis.IntersectionObserver;
    if (typeof Observer !== 'function') return; // unsupported hosts keep their authored behavior
    if (!observer) {
        documentOwner = doc;
        observer = new Observer(entries => {
            for (const entry of entries) {
                if (!roots.has(entry.target)) continue;
                const visible = entry.isIntersecting === true;
                roots.set(entry.target, visible);
                paint(entry.target, visible);
            }
        }, { root: null, threshold: 0 });
        doc.addEventListener('visibilitychange', visibilityChanged);
    }
    if (doc !== documentOwner) return;
    roots.set(root, true);
    paint(root, true);
    observer.observe(root);
}
export function untrackMirrorAnimations(root) {
    if (!roots.delete(root)) return;
    observer?.unobserve(root);
    root.removeAttribute?.(ANIMATION_SUSPENDED_ATTR);
    releaseRates(root);
    if (!roots.size) destroyMirrorAnimationVisibility();
}
export function pruneMirrorAnimationVisibility() {
    for (const root of roots.keys()) if (!root.isConnected) untrackMirrorAnimations(root);
}
export function destroyMirrorAnimationVisibility() {
    observer?.disconnect(); observer = null;
    documentOwner?.removeEventListener('visibilitychange', visibilityChanged); documentOwner = null;
    for (const root of roots.keys()) {
        root.removeAttribute?.(ANIMATION_SUSPENDED_ATTR);
        releaseRates(root);
    }
    roots.clear();
}
