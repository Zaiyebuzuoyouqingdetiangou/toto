// 「只有状态类、没有触发器」的开关接线（点主体切换 .flipped / .active 之类的状态类）。
// 接线结果以属性留在主体上；克隆或缓存还原后监听会丢，这里能按属性原样接回，
// 供工具栏链与维修兔的隔离副本共用，避免副本里“看着像接过线、点了却不动”。
export const ORPHAN_STATE_ATTR = 'data-rm-orphan-state-wired';
const ORPHAN_STATE_WIRED = new WeakSet();

export function isOrphanStateWired(target) {
    return ORPHAN_STATE_WIRED.has(target);
}

export function attachOrphanStateToggle(target, state) {
    if (!target || !state || ORPHAN_STATE_WIRED.has(target)) return false;
    ORPHAN_STATE_WIRED.add(target);
    target.setAttribute(ORPHAN_STATE_ATTR, state);
    target.setAttribute('role', 'button');
    target.setAttribute('tabindex', '0');
    target.style.cursor = 'pointer';
    const toggle = event => {
        if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault?.();
        target.classList.toggle(state);
    };
    target.addEventListener('click', toggle);
    target.addEventListener('keydown', toggle);
    return true;
}

// 按主体上已有的属性把丢掉的监听接回来；没接过线的主体不碰。
export function rearmOrphanStateWiring(root) {
    if (!root?.querySelectorAll) return 0;
    let wired = 0;
    for (const target of root.querySelectorAll(`[${ORPHAN_STATE_ATTR}]`)) {
        if (attachOrphanStateToggle(target, target.getAttribute(ORPHAN_STATE_ATTR))) wired += 1;
    }
    return wired;
}
