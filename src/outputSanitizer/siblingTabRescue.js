// 一排没写任何动作的按钮，后面紧跟着同样多的内容块，第一块显示、其余写了内联 display:none
// （「第一站／第二站／第三站」三个按钮 + 三张站点卡片）：模型想做成分页，却只写了样子，点了没反应。
// 这里按顺序把第 i 个按钮接到第 i 块内容上：点哪个显示哪块，其余收起。只认很确定的结构：
// - 按钮那一排里只有按钮（button 或 role=button），没有 popovertarget、data-rm-*、label/for、提交这类自带动作；
// - 紧跟在这一排后面的同级元素正好和按钮一样多，恰好一块显示、其余都是内联 display:none，每块都有字、里面没有按钮；
// - 不在新交互驱动（data-rm-ui）里面。

const BOUND_ATTR = 'data-rm-sibling-tabs';
const TAB_ATTR = 'data-rm-sibling-tab';
const BOUND = new WeakSet();
const STYLE_ID = 'rabbit-mirror-sibling-tab-style';

// 选中的那个按钮描一圈，免得点完挪开手指就看不出当前是哪一页。
function ensureStyle() {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `[${TAB_ATTR}="active"]{box-shadow:inset 0 0 0 2px currentColor!important;}`;
    (document.head || document.documentElement).append(style);
}

function hasOwnAction(button) {
    if (button.disabled) return true;
    if (button.hasAttribute('popovertarget') || button.hasAttribute('commandfor') || button.closest('label, a[href], form')) return true;
    if ([...button.attributes].some(attr => /^data-rm-/.test(attr.name) && !/^data-rm-(?:polish|press|sibling)/.test(attr.name))) return true;
    if (/^(?:submit|reset)$/i.test(button.getAttribute('type') || '')) return true;
    // 别的维修已经接管过的按钮（data-rabbit-mirror-*-rescue 之类）不再抢。
    if ([...button.attributes].some(attr => /^data-rabbit-mirror-.*(?:rescue|wired|fallback)/.test(attr.name))) return true;
    return false;
}

function inlineHidden(node) {
    return node.style?.getPropertyValue('display') === 'none';
}

function findTabSets(root) {
    const sets = [];
    const rows = new Set([...root.querySelectorAll('button, [role="button"]')].map(button => button.parentElement).filter(Boolean));
    for (const row of rows) {
        if (row === root || row.closest('[data-rm-ui]')) continue;
        const buttons = [...row.children];
        if (buttons.length < 2 || buttons.length > 8) continue;
        if (!buttons.every(node => node.matches('button, [role="button"]') && !hasOwnAction(node))) continue;
        const panels = [];
        for (let next = row.nextElementSibling; next && panels.length < buttons.length; next = next.nextElementSibling) {
            if (next.matches('style, script, template')) continue;
            panels.push(next);
        }
        if (panels.length !== buttons.length) continue;
        const shown = panels.filter(panel => !inlineHidden(panel));
        if (shown.length !== 1) continue;
        if (!panels.every(panel => String(panel.textContent || '').trim().length >= 4 && !panel.querySelector('button, input, select, textarea, label, [data-rm-ui]'))) continue;
        sets.push({ row, buttons, panels, display: shown[0].style.getPropertyValue('display') || '' });
    }
    return sets;
}

function show(set, index) {
    set.panels.forEach((panel, at) => {
        if (at === index) {
            if (set.display && set.display !== 'none') panel.style.setProperty('display', set.display);
            else panel.style.removeProperty('display');
        } else panel.style.setProperty('display', 'none');
    });
    set.buttons.forEach((button, at) => {
        button.setAttribute('aria-pressed', at === index ? 'true' : 'false');
        if (at === index) button.setAttribute(TAB_ATTR, 'active'); else button.setAttribute(TAB_ATTR, '');
    });
}

export function installSiblingTabRescue(root) {
    if (!root?.querySelectorAll) return 0;
    let count = 0;
    for (const set of findTabSets(root)) {
        ensureStyle();
        set.row.setAttribute(BOUND_ATTR, String(set.buttons.length));
        const current = set.panels.findIndex(panel => !inlineHidden(panel));
        set.buttons.forEach((button, index) => {
            button.setAttribute(TAB_ATTR, index === current ? 'active' : '');
            button.setAttribute('aria-pressed', index === current ? 'true' : 'false');
            if (BOUND.has(button)) return;
            BOUND.add(button);
            button.addEventListener('click', event => {
                event.preventDefault();
                show(set, index);
            });
        });
        count++;
    }
    return count;
}
