import { rearmAttributeCycleButtons } from './attributeCycleWiring.js?rmv=2.1.6';
export const ORPHAN_STATE_ATTR = 'data-rm-orphan-state-wired';
const ORPHAN_STATE_WIRED = new WeakSet();
export function isOrphanStateWired(target) {
    return ORPHAN_STATE_WIRED.has(target);
}
export const ORPHAN_TRIGGER_ATTR = 'data-rm-orphan-state-trigger';
const ORPHAN_TARGET_KEY = 'data-rm-orphan-state-key';
let orphanKeySeq = 0;
const TRIGGER_NAME = /(?:^|[-_])(?:trigger|btn|button|toggle|tap|click|handle|opener|switch|link)(?:$|[-_\d])/i;
function hiddenByStyle(node) {
    try {
        const view = node.ownerDocument?.defaultView;
        const style = view?.getComputedStyle?.(node);
        return !!style && (style.display === 'none' || style.visibility === 'hidden');
    }
    catch {
        return false;
    }
}
function blockTextWithoutStatus(node) {
    const statuses = [...(node.querySelectorAll?.('[data-rabbit-mirror-inert-action-status]') || [])];
    if (!statuses.length)
        return String(node.textContent || '').trim();
    let text = '';
    const walker = node.ownerDocument.createTreeWalker(node, 4);
    for (let t = walker.nextNode(); t; t = walker.nextNode())
        if (!statuses.some(st => st.contains(t)))
            text += t.nodeValue;
    return text.trim();
}
export function innerButtonIsFree(el) {
    if (typeof el.checkVisibility === 'function' && !el.checkVisibility({ visibilityProperty: true, opacityProperty: false }))
        return false;
    if (!el.getClientRects?.().length)
        return false;
    try {
        if (el.ownerDocument?.defaultView?.getComputedStyle?.(el)?.visibility === 'hidden')
            return false;
    }
    catch { }
    if (el.closest('[aria-hidden="true"], [inert]'))
        return false;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true')
        return false;
    if (el.getAttribute(ORPHAN_STATE_ATTR))
        return false;
    if (el.closest('[data-rabbit-mirror-tool-entry-host], [data-rm-ui], form, summary, label, details:not([open])'))
        return false;
    if (String(el.getAttribute('type') || '').toLowerCase() === 'submit')
        return false;
    const doc = el.ownerDocument;
    for (const attr of el.attributes) {
        const name = attr.name;
        if (/^(?:popovertarget|commandfor|onclick|onchange|oninput|onpointerdown|onmousedown|form|formaction|href)$/.test(name))
            return false;
        if (name === 'aria-controls' && String(attr.value).split(/\s+/).some(id => id && doc?.getElementById(id)))
            return false;
        if (/^data-rm-/.test(name) && !/^data-rm-(?:press|polish|orphan-state-trigger|state-group|pulse-trigger|select-item|select-step|flag-toggle)/.test(name))
            return false;
        if (/^data-rabbit-mirror-/.test(name) && !/^data-rabbit-mirror-inert-action-(?:rescue|active)$/.test(name))
            return false;
    }
    return true;
}
function realButtons(node) {
    return [...(node.querySelectorAll?.('button, [role="button"]') || [])].filter(el => el.matches('button') || !el.querySelector('button'));
}
function isResultPanel(el, target, state) {
    if (el === target || hiddenByStyle(el) || el.getAttribute(ORPHAN_STATE_ATTR))
        return true;
    if (!state || !el.classList?.contains(state))
        return false;
    el.classList.remove(state);
    const hidden = hiddenByStyle(el);
    el.classList.add(state);
    return hidden;
}
function multiButtonTrigger(node, target, state) {
    const buttons = realButtons(node);
    if (buttons.length < 2)
        return undefined;
    const panels = [];
    for (let next = node.nextElementSibling; next; next = next.nextElementSibling) {
        if (next.matches('style, script, br, hr'))
            continue;
        if (!isResultPanel(next, target, state))
            break;
        panels.push(next);
        if (next === target)
            break;
    }
    let count = panels.length;
    for (let next = target.nextElementSibling; next && panels.includes(target); next = next.nextElementSibling) {
        if (next.matches('style, script, br, hr'))
            continue;
        if (!isResultPanel(next, target, state))
            break;
        count += 1;
    }
    const index = panels.indexOf(target);
    if (index < 0 || count !== buttons.length)
        return null;
    const button = buttons[index];
    return innerButtonIsFree(button) ? button : null;
}
export function findOrphanStateTrigger(target, state = '') {
    let node = target?.previousElementSibling;
    let firstReal = true;
    let passedPanel = false;
    for (let step = 0; node && step < 3; step += 1, node = node.previousElementSibling) {
        if (node.matches?.('style, script, br, hr') || node.contains(target) || hiddenByStyle(node))
            continue;
        const adjacent = firstReal;
        firstReal = false;
        if (node.getAttribute?.(ORPHAN_STATE_ATTR)) {
            passedPanel = true;
            continue;
        }
        let pointer = false;
        try {
            pointer = node.ownerDocument?.defaultView?.getComputedStyle?.(node)?.cursor === 'pointer';
        }
        catch {
            pointer = false;
        }
        const multi = !node.matches?.('button, a') ? multiButtonTrigger(node, target, state) : undefined;
        if (multi !== undefined)
            return multi;
        if (passedPanel)
            return null;
        if (node.matches?.('button, [role="button"], a') || pointer || TRIGGER_NAME.test(String(node.getAttribute?.('class') || '')))
            return node;
        if (adjacent && blockTextWithoutStatus(node).length <= 80) {
            const buttons = [...(node.querySelectorAll?.('button, [role="button"]') || [])];
            if (buttons.length > 1)
                return null;
            if (buttons.length === 1 && innerButtonIsFree(buttons[0]))
                return buttons[0];
        }
        if (String(node.textContent || '').trim().length > 40)
            return null;
    }
    return null;
}
export function attachOrphanStateToggle(target, state, trigger = null) {
    if (!target || !state || ORPHAN_STATE_WIRED.has(target))
        return false;
    let hiddenByDefault = hiddenByStyle(target);
    if (!hiddenByDefault && target.classList.contains(state)) {
        target.classList.remove(state);
        hiddenByDefault = hiddenByStyle(target);
        target.classList.add(state);
    }
    if (!trigger && hiddenByDefault)
        trigger = findOrphanStateTrigger(target, state);
    if (!trigger && hiddenByDefault)
        return false;
    ORPHAN_STATE_WIRED.add(target);
    target.setAttribute(ORPHAN_STATE_ATTR, state);
    const clicker = trigger || target;
    if (trigger) {
        const key = target.getAttribute(ORPHAN_TARGET_KEY) || `o${Date.now().toString(36)}${(orphanKeySeq += 1)}`;
        target.setAttribute(ORPHAN_TARGET_KEY, key);
        const keys = new Set(String(trigger.getAttribute(ORPHAN_TRIGGER_ATTR) || '').split(/\s+/).filter(Boolean));
        keys.add(key);
        trigger.setAttribute(ORPHAN_TRIGGER_ATTR, [...keys].join(' '));
        trigger.setAttribute('aria-expanded', String(target.classList.contains(state)));
        if (target.getAttribute('role') === 'button')
            target.removeAttribute('role');
        if (target.getAttribute('tabindex') === '0')
            target.removeAttribute('tabindex');
        if (target.style.cursor === 'pointer')
            target.style.removeProperty('cursor');
    }
    if (!clicker.matches?.('button, a')) {
        clicker.setAttribute('role', 'button');
        clicker.setAttribute('tabindex', '0');
    }
    clicker.style.cursor = 'pointer';
    const toggle = event => {
        if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ')
            return;
        const inner = event.target?.closest?.('button, a, input, select, textarea');
        if (!trigger && inner && inner !== target && target.contains(inner))
            return;
        event.preventDefault?.();
        const on = target.classList.toggle(state);
        if (trigger)
            trigger.setAttribute('aria-expanded', String(on));
    };
    clicker.addEventListener('click', toggle);
    clicker.addEventListener('keydown', toggle);
    return true;
}
export function rearmOrphanStateWiring(root) {
    if (!root?.querySelectorAll)
        return 0;
    let wired = 0;
    for (const target of root.querySelectorAll(`[${ORPHAN_STATE_ATTR}]`)) {
        const key = target.getAttribute(ORPHAN_TARGET_KEY);
        let trigger = null;
        if (key) {
            try {
                trigger = root.querySelector(`[${ORPHAN_TRIGGER_ATTR}~="${CSS.escape(key)}"]`);
            }
            catch {
                trigger = null;
            }
        }
        if (trigger && !trigger.matches?.('button, a') && realButtons(trigger).length > 1) {
            trigger.removeAttribute(ORPHAN_TRIGGER_ATTR);
            trigger.removeAttribute('aria-expanded');
            if (trigger.getAttribute('role') === 'button')
                trigger.removeAttribute('role');
            if (trigger.getAttribute('tabindex') === '0')
                trigger.removeAttribute('tabindex');
            if (trigger.style?.cursor === 'pointer')
                trigger.style.removeProperty('cursor');
            trigger = null;
        }
        if (attachOrphanStateToggle(target, target.getAttribute(ORPHAN_STATE_ATTR), trigger))
            wired += 1;
    }
    try {
        wired += rearmAttributeCycleButtons(root);
    }
    catch { }
    return wired;
}
