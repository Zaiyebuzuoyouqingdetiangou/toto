const BOUND_ATTR = 'data-rm-sibling-tabs';
const TAB_ATTR = 'data-rm-sibling-tab';
const BOUND = new WeakSet();
const STYLE_ID = 'rabbit-mirror-sibling-tab-style';
function ensureStyle() {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID))
        return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `[${TAB_ATTR}="active"]{box-shadow:inset 0 0 0 2px currentColor!important;}`;
    (document.head || document.documentElement).append(style);
}
function hasOwnAction(button) {
    if (button.disabled)
        return true;
    if (button.hasAttribute('popovertarget') || button.hasAttribute('commandfor') || button.closest('label, a[href], form'))
        return true;
    if ([...button.attributes].some(attr => /^data-rm-/.test(attr.name) && !/^data-rm-(?:polish|press|sibling|select)/.test(attr.name)))
        return true;
    if (/^(?:submit|reset)$/i.test(button.getAttribute('type') || ''))
        return true;
    if ([...button.attributes].some(attr => /^data-rabbit-mirror-.*(?:rescue|wired|fallback)/.test(attr.name)))
        return true;
    return false;
}
function inlineHidden(node) {
    return node.style?.getPropertyValue('display') === 'none';
}
function findTabSets(root) {
    const sets = [];
    const rows = new Set([...root.querySelectorAll('button, [role="button"]')].map(button => button.parentElement).filter(Boolean));
    for (const row of rows) {
        if (row === root || row.closest('[data-rm-ui]'))
            continue;
        const buttons = [...row.children];
        if (buttons.length < 2 || buttons.length > 8)
            continue;
        if (!buttons.every(node => node.matches('button, [role="button"]') && !hasOwnAction(node)))
            continue;
        const panels = [];
        for (let next = row.nextElementSibling; next && panels.length < buttons.length; next = next.nextElementSibling) {
            if (next.matches('style, script, template'))
                continue;
            panels.push(next);
        }
        if (panels.length !== buttons.length)
            continue;
        const shown = panels.filter(panel => !inlineHidden(panel));
        if (shown.length !== 1)
            continue;
        if (!panels.every(panel => String(panel.textContent || '').trim().length >= 4 && !panel.querySelector('button, input, select, textarea, label, [data-rm-ui]')))
            continue;
        sets.push({ row, buttons, panels, display: shown[0].style.getPropertyValue('display') || '' });
    }
    return sets;
}
function show(set, index) {
    set.panels.forEach((panel, at) => {
        if (at === index) {
            if (set.display && set.display !== 'none')
                panel.style.setProperty('display', set.display);
            else
                panel.style.removeProperty('display');
        }
        else
            panel.style.setProperty('display', 'none');
    });
    set.buttons.forEach((button, at) => {
        button.setAttribute('aria-pressed', at === index ? 'true' : 'false');
        if (at === index)
            button.setAttribute(TAB_ATTR, 'active');
        else
            button.setAttribute(TAB_ATTR, '');
    });
}
export function installSiblingTabRescue(root) {
    if (!root?.querySelectorAll)
        return 0;
    let count = 0;
    for (const set of findTabSets(root)) {
        ensureStyle();
        set.row.setAttribute(BOUND_ATTR, String(set.buttons.length));
        const current = set.panels.findIndex(panel => !inlineHidden(panel));
        set.buttons.forEach((button, index) => {
            button.setAttribute(TAB_ATTR, index === current ? 'active' : '');
            button.setAttribute('aria-pressed', index === current ? 'true' : 'false');
            if (BOUND.has(button))
                return;
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
const NUMBERED = /(?:^|[-_])(\d{1,2})$/;
const STAGE_ATTR = /\[\s*(data-(?!rm-|rabbit-)[\w-]+)\s*=\s*["']?(\d{1,2})["']?\s*\]/;
function splitCompounds(selector) {
    const parts = [];
    let depth = 0, current = '';
    for (const char of selector) {
        if (char === '[' || char === '(')
            depth += 1;
        if (char === ']' || char === ')')
            depth = Math.max(0, depth - 1);
        if (!depth && /[\s>+~]/.test(char)) {
            if (current)
                parts.push(current);
            current = '';
            continue;
        }
        current += char;
    }
    if (current)
        parts.push(current);
    return parts;
}
function numberOf(button) {
    const numbers = new Set();
    for (const token of button.classList) {
        const match = NUMBERED.exec(token);
        if (match)
            numbers.add(Number(match[1]));
    }
    return numbers.size === 1 ? [...numbers][0] : null;
}
function stagePrograms(root) {
    const scope = root.closest?.('toto') || root;
    const text = [...(scope.querySelectorAll?.('style') || [])].map(node => String(node.textContent || '')).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
    const programs = new Map();
    for (const match of text.matchAll(/([^{}@;]+)\{/g)) {
        for (const selector of match[1].split(',')) {
            const compounds = splitCompounds(selector.trim());
            for (let index = 0; index < compounds.length - 1; index += 1) {
                const attr = STAGE_ATTR.exec(compounds[index]);
                if (!attr)
                    continue;
                const base = compounds[index].replace(/\[[^\]]*\]/g, '').replace(/::?[\w-]+(?:\([^()]*\))?/g, '').trim();
                if (!base || !/^[.#][A-Za-z_][\w-]*(?:[.#][A-Za-z_][\w-]*)*$/.test(base))
                    continue;
                const key = `${attr[1]}|${base}`;
                if (!programs.has(key))
                    programs.set(key, { attr: attr[1], base, values: new Set() });
                programs.get(key).values.add(Number(attr[2]));
            }
        }
    }
    return [...programs.values()];
}
function findStageSets(root) {
    const sets = [];
    const programs = stagePrograms(root);
    if (!programs.length)
        return sets;
    const rows = new Set([...root.querySelectorAll('button, [role="button"]')].map(button => button.parentElement).filter(Boolean));
    for (const row of rows) {
        if (row === root || row.closest('[data-rm-ui]') || /^\d+$/.test(row.getAttribute(BOUND_ATTR) || ''))
            continue;
        const buttons = [...row.children].filter(node => node.matches('button, [role="button"]'));
        if (buttons.length < 2 || buttons.length > 12 || buttons.length !== row.children.length)
            continue;
        if (!buttons.every(node => !hasOwnAction(node)))
            continue;
        const numbers = buttons.map(numberOf);
        if (numbers.some(number => number === null) || new Set(numbers).size !== numbers.length)
            continue;
        const fits = programs.filter(program => numbers.every(number => program.values.has(number)));
        if (fits.length !== 1)
            continue;
        const [program] = fits;
        let carrier = null;
        try {
            carrier = row.parentElement?.closest(program.base) || null;
        }
        catch {
            carrier = null;
        }
        if (!carrier || !root.contains(carrier) || carrier.closest('[data-rm-ui]'))
            continue;
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
    if (!root?.querySelectorAll)
        return 0;
    let count = 0;
    for (const set of findStageSets(root)) {
        ensureStyle();
        set.row.setAttribute(BOUND_ATTR, `${set.attr}:${set.buttons.length}`);
        const current = Number(set.carrier.getAttribute(set.attr));
        showStage(set, set.numbers.includes(current) ? current : Math.min(...set.numbers));
        set.buttons.forEach((button, index) => {
            if (BOUND.has(button))
                return;
            BOUND.add(button);
            button.addEventListener('click', event => { event.preventDefault(); showStage(set, set.numbers[index]); });
        });
        count++;
    }
    return count;
}
