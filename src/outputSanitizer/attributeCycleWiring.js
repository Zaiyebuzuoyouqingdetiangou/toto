export const ATTR_CYCLE_ATTR = 'data-rm-attr-cycle';
const ATTR_CYCLE_VALUES = 'data-rm-attr-cycle-values';
const BOUND = new WeakSet();
const OWN_ATTR = /^data-(?:rm-|rabbit-mirror-|vs-)/i;
const ATTR_IN_SELECTOR = /\[\s*(data-[\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([\w-]+))\s*\]/g;
function styleText(root) {
    const scope = root?.closest?.('toto') || root;
    return [...(scope?.querySelectorAll?.('style') || [])].map(node => String(node.textContent || '')).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
}
function compounds(selector) {
    const out = [];
    let depth = 0, current = '';
    for (const char of selector) {
        if (char === '[' || char === '(')
            depth += 1;
        else if (char === ']' || char === ')')
            depth = Math.max(0, depth - 1);
        if (!depth && /[\s>+~]/.test(char)) {
            if (current)
                out.push(current);
            current = '';
            continue;
        }
        current += char;
    }
    if (current)
        out.push(current);
    return out;
}
const stripPseudo = text => text.replace(/::?[a-z-]+(\([^)]*\))?/gi, '');
function safeMatches(node, selector) {
    if (!selector || !/[.#\w]/.test(selector))
        return false;
    try {
        return !!node?.matches?.(selector);
    }
    catch {
        return false;
    }
}
function readProgram(root) {
    const text = styleText(root);
    const values = new Map();
    const links = [];
    for (const match of text.matchAll(/([^{}@;]+)\{/g)) {
        for (const raw of match[1].split(',')) {
            const selector = raw.trim();
            if (!selector.includes('[data-'))
                continue;
            const parts = compounds(selector);
            parts.forEach((part, index) => {
                for (const hit of part.matchAll(ATTR_IN_SELECTOR)) {
                    const name = hit[1].toLowerCase();
                    if (OWN_ATTR.test(name))
                        continue;
                    const value = String(hit[2] ?? hit[3] ?? hit[4] ?? '').trim();
                    if (!value || /\s/.test(value))
                        continue;
                    if (!values.has(name))
                        values.set(name, []);
                    if (!values.get(name).includes(value))
                        values.get(name).push(value);
                    const tail = index < parts.length - 1 ? stripPseudo(parts[parts.length - 1]) : '';
                    const last = /[.#[]/.test(tail) ? tail : '';
                    links.push({ name, last });
                }
            });
        }
    }
    return { values, links };
}
const INERT_MARK = /^data-rabbit-mirror-inert-action-(?:rescue|active)$/;
function isFreeButton(button) {
    if (!button?.matches?.('button, [role="button"]') || button.matches('a[href], [disabled], [onclick]'))
        return false;
    if (button.closest('[data-rm-ui], summary, label, form, [data-rabbit-mirror-tool-entry-host], [data-rm-mobile-controls], [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat]'))
        return false;
    if (button.hasAttribute('popovertarget') || button.hasAttribute('commandfor') || button.hasAttribute('form'))
        return false;
    return ![...button.attributes].some(attr => (/^data-rm-(?!press|polish|feedback)/.test(attr.name) && attr.name !== ATTR_CYCLE_ATTR && attr.name !== ATTR_CYCLE_VALUES)
        || (/^data-rabbit-mirror-/.test(attr.name) && !INERT_MARK.test(attr.name)));
}
function bind(button) {
    if (BOUND.has(button))
        return false;
    const name = button.getAttribute(ATTR_CYCLE_ATTR);
    const order = String(button.getAttribute(ATTR_CYCLE_VALUES) || '').split(/\s+/).filter(Boolean);
    if (!name || order.length < 2)
        return false;
    BOUND.add(button);
    button.addEventListener('click', event => {
        const holder = button.parentElement?.closest?.(`[${CSS.escape(name)}]`);
        if (!holder)
            return;
        event.preventDefault?.();
        const current = holder.getAttribute(name);
        const next = order[(order.indexOf(current) + 1) % order.length];
        holder.setAttribute(name, next);
        button.setAttribute('aria-pressed', String(next !== order[0]));
    });
    return true;
}
export function rearmAttributeCycleButtons(root) {
    let wired = 0;
    for (const button of root?.querySelectorAll?.(`[${ATTR_CYCLE_ATTR}]`) || [])
        if (bind(button))
            wired += 1;
    return wired;
}
export function wireAttributeCycleButtons(root) {
    if (!root?.querySelectorAll)
        return 0;
    let wired = rearmAttributeCycleButtons(root);
    const { values, links } = readProgram(root);
    if (!values.size)
        return wired;
    const holders = [];
    for (const [name, list] of values) {
        const all = [...root.querySelectorAll(`[${CSS.escape(name)}]`)];
        if (all.length !== 1)
            continue;
        const holder = all[0];
        if (holder.closest('[data-rm-ui]') || holder.matches('details, summary, toto, button, input, select, textarea, option') || holder.querySelector(':scope > summary'))
            continue;
        if ([...holder.querySelectorAll(`[${ATTR_CYCLE_ATTR}]`)].some(button => button.getAttribute(ATTR_CYCLE_ATTR) === name))
            continue;
        const current = String(holder.getAttribute(name) || '').trim();
        const others = list.filter(value => value !== current);
        if (!current || !others.length)
            continue;
        holders.push({ holder, name, order: [current, ...others] });
    }
    const taken = new Set();
    for (const item of holders) {
        const free = [...item.holder.querySelectorAll('button, [role="button"]')].filter(button => isFreeButton(button) && !button.hasAttribute(ATTR_CYCLE_ATTR) && !taken.has(button));
        if (!free.length)
            continue;
        let button = free.find(candidate => links.some(link => link.name === item.name && link.last && safeMatches(candidate, link.last)));
        if (!button) {
            const stem = item.name.replace(/^data-/, '').toLowerCase();
            if (stem.length >= 3)
                button = free.find(candidate => `${candidate.className || ''} ${candidate.id || ''}`.toLowerCase().includes(stem));
        }
        item.button = button || null;
        if (button)
            taken.add(button);
    }
    const unmatched = holders.filter(item => !item.button);
    if (unmatched.length === 1) {
        const free = [...unmatched[0].holder.querySelectorAll('button, [role="button"]')].filter(button => isFreeButton(button) && !button.hasAttribute(ATTR_CYCLE_ATTR) && !taken.has(button));
        if (free.length === 1)
            unmatched[0].button = free[0];
    }
    for (const item of holders) {
        if (!item.button)
            continue;
        item.button.setAttribute(ATTR_CYCLE_ATTR, item.name);
        item.button.setAttribute(ATTR_CYCLE_VALUES, item.order.join(' '));
        const kept = [];
        for (const id of String(item.button.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean)) {
            const status = root.querySelector?.(`[data-rabbit-mirror-inert-action-status]#${CSS.escape(id)}`);
            if (status)
                status.remove();
            else
                kept.push(id);
        }
        if (kept.length)
            item.button.setAttribute('aria-describedby', kept.join(' '));
        else
            item.button.removeAttribute('aria-describedby');
        if (item.button.hasAttribute('data-rabbit-mirror-inert-action-rescue'))
            item.button.setAttribute('aria-pressed', 'false');
        item.button.removeAttribute('data-rabbit-mirror-inert-action-rescue');
        item.button.removeAttribute('data-rabbit-mirror-inert-action-active');
        if (bind(item.button))
            wired += 1;
    }
    return wired;
}
