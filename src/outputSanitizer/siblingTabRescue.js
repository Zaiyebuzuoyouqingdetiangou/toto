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
    if ([...button.attributes].some(attr => /^data-rm-/.test(attr.name) && !/^data-rm-(?:polish|press|sibling|select)/.test(attr.name))) return true;
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

// ——— 按钮类名带号码 + 外层按号码切换的样式 ———
// 一排按钮没写任何动作，类名却带着号码（…-stage-1、…-tab-2），样式写着 .sheet[data-scale="1"] .tier-1{display:block}：
// 模型想按号码切换、却没有东西去改 .sheet 上的 data-scale。这里按类名里的号码接上：点哪个，就把那个号码写到
// 外层那一层（样式里写的 .sheet）的这个属性上。只认很确定的结构：
// - 一排里都是没动作的按钮，每个按钮类名里恰好有一个号码，号码各不相同；
// - 样式里有「类名或 id ＋ [data-xxx="号码"]」的外层条件（不是插件自己的 data-rm-*），这些号码都包括按钮上的；
// - 这一层包着整排按钮，所有按钮找到的是同一层。
const NUMBERED = /(?:^|[-_])(\d{1,2})$/;
const STAGE_ATTR = /\[\s*(data-(?!rm-|rabbit-)[\w-]+)\s*=\s*["']?(\d{1,2})["']?\s*\]/;

// 按组合符拆成复合选择器；方括号、括号里的 ~ > 空格不算（[data-rm-on~="x"] 是一个整体）。
function splitCompounds(selector) {
    const parts = []; let depth = 0, current = '';
    for (const char of selector) {
        if (char === '[' || char === '(') depth += 1;
        if (char === ']' || char === ')') depth = Math.max(0, depth - 1);
        if (!depth && /[\s>+~]/.test(char)) { if (current) parts.push(current); current = ''; continue; }
        current += char;
    }
    if (current) parts.push(current);
    return parts;
}

function numberOf(button) {
    const numbers = new Set();
    for (const token of button.classList) { const match = NUMBERED.exec(token); if (match) numbers.add(Number(match[1])); }
    return numbers.size === 1 ? [...numbers][0] : null;
}

function stagePrograms(root) {
    const scope = root.closest?.('toto') || root;
    const text = [...(scope.querySelectorAll?.('style') || [])].map(node => String(node.textContent || '')).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
    const programs = new Map(); // `${attr}|${base}` → { attr, base, values: Set }
    for (const match of text.matchAll(/([^{}@;]+)\{/g)) {
        for (const selector of match[1].split(',')) {
            const compounds = splitCompounds(selector.trim());
            for (let index = 0; index < compounds.length - 1; index += 1) {
                const attr = STAGE_ATTR.exec(compounds[index]);
                if (!attr) continue;
                const base = compounds[index].replace(/\[[^\]]*\]/g, '').replace(/::?[\w-]+(?:\([^()]*\))?/g, '').trim();
                if (!base || !/^[.#][A-Za-z_][\w-]*(?:[.#][A-Za-z_][\w-]*)*$/.test(base)) continue;
                const key = `${attr[1]}|${base}`;
                if (!programs.has(key)) programs.set(key, { attr: attr[1], base, values: new Set() });
                programs.get(key).values.add(Number(attr[2]));
            }
        }
    }
    return [...programs.values()];
}

function findStageSets(root) {
    const sets = [];
    const programs = stagePrograms(root);
    if (!programs.length) return sets;
    const rows = new Set([...root.querySelectorAll('button, [role="button"]')].map(button => button.parentElement).filter(Boolean));
    for (const row of rows) {
        // 上面的「分页」已经接管的一排（记号是纯数字）不抢；副本里重新接线时自己的记号（属性:数量）照常再接。
        if (row === root || row.closest('[data-rm-ui]') || /^\d+$/.test(row.getAttribute(BOUND_ATTR) || '')) continue;
        const buttons = [...row.children].filter(node => node.matches('button, [role="button"]'));
        if (buttons.length < 2 || buttons.length > 12 || buttons.length !== row.children.length) continue;
        if (!buttons.every(node => !hasOwnAction(node))) continue;
        const numbers = buttons.map(numberOf);
        if (numbers.some(number => number === null) || new Set(numbers).size !== numbers.length) continue;
        const fits = programs.filter(program => numbers.every(number => program.values.has(number)));
        if (fits.length !== 1) continue;
        const [program] = fits;
        let carrier = null;
        try { carrier = row.parentElement?.closest(program.base) || null; } catch { carrier = null; }
        if (!carrier || !root.contains(carrier) || carrier.closest('[data-rm-ui]')) continue;
        sets.push({ row, buttons, numbers, carrier, attr: program.attr });
    }
    return sets;
}

function showStage(set, number) {
    set.carrier.setAttribute(set.attr, String(number));
    set.buttons.forEach((button, index) => {
        const active = set.numbers[index] === number;
        button.setAttribute('aria-pressed', String(active));
        button.setAttribute(TAB_ATTR, active ? 'active' : '');
    });
}

export function installNumberedStageRescue(root) {
    if (!root?.querySelectorAll) return 0;
    let count = 0;
    for (const set of findStageSets(root)) {
        ensureStyle();
        set.row.setAttribute(BOUND_ATTR, `${set.attr}:${set.buttons.length}`);
        const current = Number(set.carrier.getAttribute(set.attr));
        showStage(set, set.numbers.includes(current) ? current : Math.min(...set.numbers));
        set.buttons.forEach((button, index) => {
            if (BOUND.has(button)) return;
            BOUND.add(button);
            button.addEventListener('click', event => { event.preventDefault(); showStage(set, set.numbers[index]); });
        });
        count++;
    }
    return count;
}
