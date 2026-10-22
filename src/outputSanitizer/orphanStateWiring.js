// 「只有状态类、没有触发器」的开关接线（点主体切换 .flipped / .active 之类的状态类）。
// 接线结果以属性留在主体上；克隆或缓存还原后监听会丢，这里能按属性原样接回，
// 供工具栏链与维修兔的隔离副本共用，避免副本里“看着像接过线、点了却不动”。
export const ORPHAN_STATE_ATTR = 'data-rm-orphan-state-wired';
const ORPHAN_STATE_WIRED = new WeakSet();

export function isOrphanStateWired(target) {
    return ORPHAN_STATE_WIRED.has(target);
}

// 主体默认藏着（.面板{display:none} .面板.active{display:block}）时，点它是点不到的：
// 由紧挨在它前面的那个「看着就是让人点的」东西（按钮、cursor:pointer、类名带 trigger/btn/toggle）来切换。
export const ORPHAN_TRIGGER_ATTR = 'data-rm-orphan-state-trigger';
const ORPHAN_TARGET_KEY = 'data-rm-orphan-state-key';
let orphanKeySeq = 0;
const TRIGGER_NAME = /(?:^|[-_])(?:trigger|btn|button|toggle|tap|click|handle|opener|switch|link)(?:$|[-_\d])/i;

function hiddenByStyle(node) {
    try {
        const view = node.ownerDocument?.defaultView;
        const style = view?.getComputedStyle?.(node);
        return !!style && (style.display === 'none' || style.visibility === 'hidden');
    } catch { return false; }
}

// 维修兔自己的「点了没反应」提示不算块里的字。
function blockTextWithoutStatus(node) {
    const statuses = [...(node.querySelectorAll?.('[data-rabbit-mirror-inert-action-status]') || [])];
    if (!statuses.length) return String(node.textContent || '').trim();
    let text = '';
    const walker = node.ownerDocument.createTreeWalker(node, 4);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) if (!statuses.some(st => st.contains(t))) text += t.nodeValue;
    return text.trim();
}

// 块里那个按钮得是「闲着的」：看得见、能点、没有别的用处。
// 别的修复已经接过线的（data-rabbit-mirror-*）不要；只被「点了没反应」兜底标过的、或已经替别的面板当触发处的可以。
function innerButtonIsFree(el) {
    if (typeof el.checkVisibility === 'function' && !el.checkVisibility({ visibilityProperty: true, opacityProperty: false })) return false;
    if (!el.getClientRects?.().length) return false;
    try { if (el.ownerDocument?.defaultView?.getComputedStyle?.(el)?.visibility === 'hidden') return false; } catch { /* 拿不到样式就不管 */ }
    if (el.closest('[aria-hidden="true"], [inert]')) return false;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
    if (el.getAttribute(ORPHAN_STATE_ATTR)) return false;
    if (el.closest('[data-rabbit-mirror-tool-entry-host], [data-rm-ui], form, summary, label, details:not([open])')) return false;
    if (String(el.getAttribute('type') || '').toLowerCase() === 'submit') return false;
    const doc = el.ownerDocument;
    for (const attr of el.attributes) {
        const name = attr.name;
        if (/^(?:popovertarget|commandfor|onclick|onchange|oninput|onpointerdown|onmousedown|form|formaction|href)$/.test(name)) return false;
        if (name === 'aria-controls' && String(attr.value).split(/\s+/).some(id => id && doc?.getElementById(id))) return false;
        if (/^data-rm-/.test(name) && !/^data-rm-(?:press|polish|orphan-state-trigger)/.test(name)) return false;
        if (/^data-rabbit-mirror-/.test(name) && !/^data-rabbit-mirror-inert-action-(?:rescue|active)$/.test(name)) return false;
    }
    return true;
}

export function findOrphanStateTrigger(target) {
    let node = target?.previousElementSibling;
    let firstReal = true;
    for (let step = 0; node && step < 3; step += 1, node = node.previousElementSibling) {
        if (node.matches?.('style, script, br, hr') || node.contains(target) || hiddenByStyle(node)) continue;
        const adjacent = firstReal;
        firstReal = false;
        // 它自己是另一组状态的主体：不拿来当触发处（点一下会同时切两样）。已经替前一块面板当触发处的照样可以（一个按钮开几块）。
        if (node.getAttribute?.(ORPHAN_STATE_ATTR)) return null;
        let pointer = false;
        try { pointer = node.ownerDocument?.defaultView?.getComputedStyle?.(node)?.cursor === 'pointer'; } catch { pointer = false; }
        if (node.matches?.('button, [role="button"], a') || pointer || TRIGGER_NAME.test(String(node.getAttribute?.('class') || ''))) return node;
        // 前面紧挨着的这一块本身不是按钮，但里面只有一个按钮（「签筒＋摇签按钮」整块在结果面板前面）：就是它。
        // 只看紧挨着的那一块、块里字不多；按钮已经有别的用处（插件交互、弹窗、表单、翻页）的不算。
        if (adjacent && blockTextWithoutStatus(node).length <= 80) {
            // 块里所有按钮都数（藏着的也算）：不止一个就不猜；没有按钮或按钮不闲，照旧往前找。
            const buttons = [...(node.querySelectorAll?.('button, [role="button"]') || [])];
            if (buttons.length > 1) return null;
            if (buttons.length === 1 && innerButtonIsFree(buttons[0])) return buttons[0];
        }
        // 中间隔着一段普通文字就不再往前找。
        if (String(node.textContent || '').trim().length > 40) return null;
    }
    return null;
}

export function attachOrphanStateToggle(target, state, trigger = null) {
    if (!target || !state || ORPHAN_STATE_WIRED.has(target)) return false;
    // 默认藏着：存档里正开着的（带着状态类），先摘掉类看它本来藏不藏，再放回去。
    let hiddenByDefault = hiddenByStyle(target);
    if (!hiddenByDefault && target.classList.contains(state)) {
        target.classList.remove(state);
        hiddenByDefault = hiddenByStyle(target);
        target.classList.add(state);
    }
    if (!trigger && hiddenByDefault) trigger = findOrphanStateTrigger(target);
    // 默认藏着、前面又找不到能点的东西：不接（接在看不见的主体上点不到，还会在诊断里显得像接好了）。
    if (!trigger && hiddenByDefault) return false;
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
        // 旧存档里接在主体自己身上的那一套（role、tabindex、手形光标）撤掉，主体本来不是让人点的。
        if (target.getAttribute('role') === 'button') target.removeAttribute('role');
        if (target.getAttribute('tabindex') === '0') target.removeAttribute('tabindex');
        if (target.style.cursor === 'pointer') target.style.removeProperty('cursor');
    }
    if (!clicker.matches?.('button, a')) {
        clicker.setAttribute('role', 'button');
        clicker.setAttribute('tabindex', '0');
    }
    clicker.style.cursor = 'pointer';
    const toggle = event => {
        if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
        // 主体自己接线时，点到主体里面的按钮、链接不算点主体。
        const inner = event.target?.closest?.('button, a, input, select, textarea');
        if (!trigger && inner && inner !== target && target.contains(inner)) return;
        event.preventDefault?.();
        const on = target.classList.toggle(state);
        if (trigger) trigger.setAttribute('aria-expanded', String(on));
    };
    clicker.addEventListener('click', toggle);
    clicker.addEventListener('keydown', toggle);
    return true;
}

// 按主体上已有的属性把丢掉的监听接回来；没接过线的主体不碰。
export function rearmOrphanStateWiring(root) {
    if (!root?.querySelectorAll) return 0;
    let wired = 0;
    for (const target of root.querySelectorAll(`[${ORPHAN_STATE_ATTR}]`)) {
        const key = target.getAttribute(ORPHAN_TARGET_KEY);
        let trigger = null;
        if (key) { try { trigger = root.querySelector(`[${ORPHAN_TRIGGER_ATTR}~="${CSS.escape(key)}"]`); } catch { trigger = null; } }
        if (attachOrphanStateToggle(target, target.getAttribute(ORPHAN_STATE_ATTR), trigger)) wired += 1;
    }
    return wired;
}
