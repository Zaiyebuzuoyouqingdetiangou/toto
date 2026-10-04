// Local fallback only for WebViews without the native Popover API.
// The generated document supplies the content; no scripts or remote targets run.
const roots = new WeakMap();
const TARGET_ATTR = 'data-rm-popover-fallback';
const BUTTON_SELECTOR = 'button[popovertarget], input[type="button"][popovertarget], button[commandfor]';

function targetFor(root, button) {
    const id = button.getAttribute('popovertarget') || button.getAttribute('commandfor') || '';
    const targets = [...root.querySelectorAll('[id]')].filter(node => node.id === id && node.hasAttribute('popover'));
    return targets.length === 1 && typeof targets[0].showPopover !== 'function' ? targets[0] : null;
}

function actionFor(button) {
    const command = button.getAttribute('command');
    if (button.hasAttribute('commandfor')) return ({ 'show-popover': 'show', 'hide-popover': 'hide', 'toggle-popover': 'toggle' })[command] || '';
    return button.getAttribute('popovertargetaction') || 'toggle';
}

function setHidden(state, hidden, returnFocus = true) {
    state.open = !hidden;
    state.target.hidden = hidden;
    state.target.setAttribute('aria-hidden', String(hidden));
    state.target.style.setProperty('display', hidden ? 'none' : state.display, 'important');
    for (const button of state.controls) if (actionFor(button) !== 'hide') button.setAttribute('aria-expanded', String(!hidden));
    if (hidden) {
        if (returnFocus && state.opener?.isConnected !== false) state.opener?.focus?.({ preventScroll: true });
    } else {
        const focusTarget = state.target.querySelector('button, input, textarea, select, [tabindex]') || state.target;
        if (focusTarget === state.target && !state.target.hasAttribute('tabindex')) state.target.setAttribute('tabindex', '-1');
        focusTarget.focus?.({ preventScroll: true });
    }
}

function inPopupBranch(candidate, ancestor) {
    if (candidate === ancestor || ancestor.target.contains(candidate.target)) return true;
    const seen = new Set();
    for (let parent = candidate.parentPopup; parent && !seen.has(parent); parent = parent.parentPopup) {
        if (parent === ancestor || ancestor.target.contains(parent.target)) return true;
        seen.add(parent);
    }
    return false;
}

function popupParent(binding, state, button) {
    // Native nested popovers also include a target outside the parent's DOM when
    // its invoker is inside that parent. Keep this relationship in memory only.
    for (const origin of [button.parentElement, state.target.parentElement]) {
        for (let node = origin; node; node = node.parentElement) {
            const parent = binding.targets.get(node);
            if (parent && parent !== state && parent.open && !inPopupBranch(parent, state)) return parent;
        }
    }
    return null;
}

function closeBranch(binding, state, returnFocus = true) {
    for (const child of binding.targets.values()) {
        if (child !== state && child.open && inPopupBranch(child, state)) setHidden(child, true, false);
    }
    setHidden(state, true, returnFocus);
}

function prepare(root, binding, target) {
    if (binding.targets.has(target)) return binding.targets.get(target);
    const view = target.ownerDocument?.defaultView;
    const computed = view?.getComputedStyle?.(target);
    const display = target.getAttribute('data-rm-popover-display') || target.style.getPropertyValue('display') || computed?.display;
    const state = { target, controls: new Set(), opener: null, open: false, display: display && display !== 'none' ? display : 'block' };
    binding.targets.set(target, state);
    target.setAttribute(TARGET_ATTR, 'true');
    target.setAttribute('data-rm-popover-display', state.display);
    // A local floating surface, never the host-wide fixed/top-layer behavior.
    const parent = target.parentElement;
    if (parent && (!view?.getComputedStyle?.(parent)?.position || view.getComputedStyle(parent).position === 'static')) {
        parent.style.setProperty('position', 'relative');
    }
    target.style.setProperty('position', 'absolute', 'important');
    target.style.setProperty('inset', '0 0 auto 0', 'important');
    target.style.setProperty('margin', '0', 'important');
    target.style.setProperty('width', 'auto', 'important');
    target.style.setProperty('max-width', '100%', 'important');
    target.style.setProperty('box-sizing', 'border-box');
    target.style.setProperty('max-height', '80vh', 'important');
    target.style.setProperty('overflow', 'auto', 'important');
    target.style.setProperty('z-index', '50');
    const closePresent = [...target.querySelectorAll(BUTTON_SELECTOR)].some(button => targetFor(root, button) === target && actionFor(button) === 'hide');
    if (!closePresent && target.ownerDocument?.createElement) {
        const close = target.ownerDocument.createElement('button');
        close.setAttribute('type', 'button'); close.setAttribute('popovertarget', target.id); close.setAttribute('popovertargetaction', 'hide');
        close.setAttribute('data-rm-popover-close', 'true'); close.setAttribute('aria-label', '关闭弹窗'); close.textContent = '关闭';
        target.appendChild(close);
    }
    setHidden(state, true, false);
    return state;
}

export function installNativePopoverFallback(root) {
    if (!root?.querySelectorAll) return 0;
    let binding = roots.get(root);
    if (!binding) {
        if (![...root.querySelectorAll(BUTTON_SELECTOR)].some(button => targetFor(root, button) && actionFor(button))) return 0;
        binding = { targets: new Map(), openOrder: 0 }; roots.set(root, binding);
        root.addEventListener('click', event => {
            const button = event.target?.closest?.(BUTTON_SELECTOR);
            if (!button || button.disabled || !root.contains(button)) return;
            const target = targetFor(root, button), action = actionFor(button);
            if (!target || !action) return;
            const state = prepare(root, binding, target);
            state.controls.add(button);
            event.preventDefault?.(); event.stopPropagation?.();
            const show = action === 'show' || (action === 'toggle' && !state.open);
            if (show) {
                if (state.open) return;
                state.parentPopup = popupParent(binding, state, button);
                if (target.getAttribute('popover') !== 'manual') for (const other of binding.targets.values()) {
                    if (other !== state && other.open && other.target.getAttribute('popover') !== 'manual'
                        && !inPopupBranch(state, other)) closeBranch(binding, other, false);
                }
                state.openOrder = ++binding.openOrder;
                state.opener = button; setHidden(state, false);
            } else closeBranch(binding, state);
        });
        root.addEventListener('keydown', event => {
            if (event.key !== 'Escape') return;
            const open = [...binding.targets.values()].filter(state => state.open && root.contains(state.target))
                .sort((a, b) => a.openOrder - b.openOrder);
            if (!open.length) return;
            event.preventDefault?.(); event.stopPropagation?.(); closeBranch(binding, open.at(-1));
        });
        root.addEventListener('toggle', event => {
            const closed = event.target;
            if (!closed?.matches?.('details') || closed.open || !root.contains(closed)) return;
            for (const state of binding.targets.values()) if (state.open && closed.contains(state.target)) closeBranch(binding, state, false);
        }, true);
    }
    const before = binding.targets.size;
    for (const button of root.querySelectorAll(BUTTON_SELECTOR)) {
        const target = targetFor(root, button);
        if (target && actionFor(button)) prepare(root, binding, target).controls.add(button);
    }
    for (const state of binding.targets.values()) if (!state.open) for (const button of state.controls) {
        if (actionFor(button) !== 'hide') button.setAttribute('aria-expanded', 'false');
    }
    return binding.targets.size - before;
}

export function nativePopoverFallbackCount(root) {
    return [...(roots.get(root)?.targets?.keys() || [])].filter(target => root.contains(target)).length;
}

export function inspectNativePopoverFallback(root) {
    const report = { wired: nativePopoverFallbackCount(root), native: 0, missingTargets: 0, unwired: 0 };
    if (!root?.querySelectorAll) return report;
    const native = new Set(), missing = new Set();
    for (const button of root.querySelectorAll(BUTTON_SELECTOR)) {
        if (button.hasAttribute('commandfor') && !/-popover$/.test(button.getAttribute('command') || '')) continue;
        const id = button.getAttribute('popovertarget') || button.getAttribute('commandfor') || '';
        const targets = [...root.querySelectorAll('[id]')].filter(node => node.id === id && node.hasAttribute('popover'));
        if (targets.length !== 1 || !actionFor(button)) { report.missingTargets++; continue; }
        if (typeof targets[0].showPopover === 'function') native.add(targets[0]);
        else if (!roots.get(root)?.targets.has(targets[0])) missing.add(targets[0]);
    }
    report.native = native.size; report.unwired = missing.size;
    return report;
}
