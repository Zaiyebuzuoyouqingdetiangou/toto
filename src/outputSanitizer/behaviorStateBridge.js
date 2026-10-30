import { behaviorStyleText, behaviorStyleStamp } from './behaviorStateMirror.js?rmv=2.0.2';
const GROUP = '[data-rm-ui]';
const CONTROLS = '[data-rm-step], [data-rm-pick], [data-rm-toggle], [data-rm-goto], [data-rm-item], [data-rm-card], [data-rm-end], [data-rm-code], [data-rm-fire], [data-rm-hold]';
const TOOL_CHROME = '[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-diagnostic-panel], [data-rm-mobile-controls]';
export const BRIDGED_ATTR = 'data-rm-bridged';
const GROUP_STATE_ATTRS = Object.freeze({
    toggle: ['data-rm-on'],
    pick: ['data-rm-picked'], roll: ['data-rm-picked'],
    pager: ['data-rm-index'], slide: ['data-rm-index'], turn: ['data-rm-index', 'data-rm-angle-turned'],
    hold: ['data-rm-active'],
    input: ['data-rm-match'],
    sequence: ['data-rm-seq', 'data-rm-match', 'data-rm-miss', 'data-rm-done'],
    connect: ['data-rm-done', 'data-rm-miss'],
    accumulate: ['data-rm-done'],
    swipe: ['data-rm-swiped-left', 'data-rm-swiped-right'],
    peek: ['data-rm-peeking'],
});
const TOKEN_ATTRS = new Set(['data-rm-on', 'data-rm-swiped-left', 'data-rm-swiped-right', 'data-rm-peeking']);
const ALL_ATTRS = new Set(Object.values(GROUP_STATE_ATTRS).flat());
const STATE_ATTR = /\[\s*(data-rm-(?:on|picked|index|angle-turned|active|match|seq|miss|done|swiped-left|swiped-right|peeking))\s*(?:([~|^$*]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\s*\]/g;
const PSEUDO = /::?[\w-]+(?:\([^()]*\))?/g;
function tokenize(selector) {
    const parts = [];
    let depth = 0, current = '', combinator = '';
    for (const char of selector) {
        if (char === '[' || char === '(')
            depth += 1;
        if (char === ']' || char === ')')
            depth = Math.max(0, depth - 1);
        if (!depth && /[\s>+~]/.test(char)) {
            if (current) {
                parts.push({ compound: current, combinator });
                current = '';
                combinator = '';
            }
            if (!/\s/.test(char))
                combinator = char;
            else if (!combinator)
                combinator = ' ';
            continue;
        }
        current += char;
    }
    if (current)
        parts.push({ compound: current, combinator });
    return parts;
}
const join = (parts, lead = false) => parts.map((part, index) => {
    const combinator = index === 0 && !lead ? '' : (part.combinator === ' ' || !part.combinator ? ' ' : ` ${part.combinator} `);
    return `${combinator}${part.compound}`;
}).join('');
const clean = text => String(text || '').replace(PSEUDO, '').trim();
const ruleCache = new WeakMap();
export function stateEntries(root) {
    const text = behaviorStyleText(root);
    const cached = ruleCache.get(root);
    if (cached?.text === text)
        return cached.entries;
    const entries = [];
    for (const match of text.matchAll(/([^{}@;]+)\{/g)) {
        for (const raw of match[1].split(',')) {
            const selector = raw.replace(/:not\(\s*(\[[^\]]*\])\s*\)/g, '$1').trim();
            if (!selector || selector.includes('('))
                continue;
            const parts = tokenize(selector);
            parts.forEach((part, index) => {
                const attrs = [];
                for (const item of part.compound.matchAll(STATE_ATTR)) {
                    if (!ALL_ATTRS.has(item[1]))
                        continue;
                    const value = item[2] === '~=' || item[2] === '=' ? String(item[3] ?? item[4] ?? item[5] ?? '').trim() : null;
                    attrs.push({ name: item[1], value: value || null });
                }
                if (!attrs.length)
                    return;
                const base = clean(part.compound.replace(STATE_ATTR, ''));
                const head = parts.slice(0, index);
                const tail = parts.slice(index + 1);
                if ((!base || base === '*') && !tail.length)
                    return;
                const carrierSelector = clean(head.length ? `${join(head)}${join([{ compound: base || '*', combinator: part.combinator }], true)}` : (base || '*'));
                const tailSelector = tail.length ? ` ${clean(join(tail, true))}` : '';
                if (!carrierSelector || (tail.length && tailSelector.trim() === ''))
                    return;
                entries.push({ attrs, carrierSelector, tailSelector, fullSelector: clean(`${carrierSelector}${tailSelector}`) });
            });
        }
    }
    ruleCache.set(root, { text, entries });
    return entries;
}
const matches = (node, selector) => { try {
    return node.matches(selector);
}
catch {
    return false;
} };
const queryAll = (node, selector) => { try {
    return [...node.querySelectorAll(selector)];
}
catch {
    return [];
} };
function tailReaches(carrier, tailSelector, target) {
    if (!tailSelector)
        return carrier === target;
    return queryAll(carrier, `:scope${tailSelector}`).includes(target);
}
function faceScope(group, root) {
    let scope = group.closest('details') || null;
    if (!scope || !root.contains(scope))
        return root;
    for (let outer = scope.parentElement?.closest?.('details'); outer && root.contains(outer); outer = outer.parentElement?.closest?.('details'))
        scope = outer;
    return scope;
}
const carrierCache = new WeakMap();
export function collectStateCarriers(root, group) {
    if (!root?.querySelectorAll || !group?.getAttribute)
        return [];
    const attrs = GROUP_STATE_ATTRS[group.getAttribute('data-rm-ui')] || [];
    if (!attrs.length)
        return [];
    const stamp = behaviorStyleStamp(root);
    const cached = carrierCache.get(group);
    if (cached?.stamp === stamp)
        return cached.list;
    const text = behaviorStyleText(root);
    if (cached?.text === text) {
        cached.stamp = stamp;
        return cached.list;
    }
    const list = [];
    if (text.includes('data-rm-')) {
        const scope = faceScope(group, root);
        const controls = [...group.querySelectorAll(CONTROLS)].filter(node => node.closest(GROUP) === group);
        const perItemCard = node => { const held = controls.filter(control => node.contains(control)); return held.length > 0 && held.length < controls.length; };
        const foreign = node => { const owner = node.closest(GROUP); return Boolean(owner && owner !== group && !owner.contains(group)); };
        const usable = node => node && node !== group && node.nodeType === 1 && !node.matches(GROUP) && !node.closest(TOOL_CHROME) && !foreign(node)
            && !node.matches('summary, button, input, select, textarea, [data-rm-hold], [data-rm-step], [data-rm-item], [data-rm-part], [data-rm-knob]')
            && !(group.contains(node) && perItemCard(node));
        const add = (node, attr, inside, value) => {
            if (!usable(node))
                return;
            const have = list.find(item => item.node === node && item.attr === attr);
            if (!have) {
                list.push({ node, attr, inside, values: value === null ? null : new Set([value]) });
                return;
            }
            if (have.values && value !== null)
                have.values.add(value);
            else
                have.values = null;
        };
        for (const entry of stateEntries(root)) {
            const wanted = entry.attrs.filter(item => attrs.includes(item.name));
            if (!wanted.length)
                continue;
            if (matches(group, entry.carrierSelector) && (!entry.tailSelector || queryAll(group, `:scope${entry.tailSelector}`).length))
                continue;
            const carriers = [];
            if (!entry.tailSelector) {
                const candidates = queryAll(scope, entry.carrierSelector).filter(usable);
                const inside = candidates.filter(node => group.contains(node));
                if (inside.length)
                    carriers.push(...inside.map(node => ({ node, inside: true })));
                else if (candidates.length === 1)
                    carriers.push({ node: candidates[0], inside: false });
            }
            else {
                const targets = queryAll(scope, entry.fullSelector).filter(node => !node.closest(TOOL_CHROME)
                    && (!node.closest(GROUP) || node.closest(GROUP) === group || node.closest(GROUP).contains(group)));
                for (const target of targets) {
                    let picked = null;
                    for (let node = target.parentElement; node && node !== scope.parentElement; node = node.parentElement) {
                        if (node === group) {
                            if (picked)
                                break;
                            continue;
                        }
                        const fits = matches(node, entry.carrierSelector) && tailReaches(node, entry.tailSelector, target);
                        if (group.contains(node)) {
                            if (fits && usable(node))
                                picked = node;
                            continue;
                        }
                        if (node.contains(group)) {
                            if (fits) {
                                if (usable(node))
                                    picked = node;
                                break;
                            }
                            continue;
                        }
                    }
                    if (!picked) {
                        const lone = queryAll(scope, entry.carrierSelector).filter(node => usable(node) && !group.contains(node) && !node.contains(group));
                        if (lone.length === 1 && tailReaches(lone[0], entry.tailSelector, target))
                            picked = lone[0];
                    }
                    if (picked)
                        carriers.push({ node: picked, inside: group.contains(picked) });
                }
            }
            for (const { node, inside } of carriers)
                for (const item of wanted)
                    add(node, item.name, inside, item.value);
        }
    }
    carrierCache.set(group, { stamp, text, list });
    return list;
}
const owners = new WeakMap();
const originals = new WeakMap();
const tokens = value => String(value ?? '').split(/\s+/).filter(Boolean);
const decode = text => { try {
    return decodeURIComponent(text);
}
catch {
    return '';
} };
function bridgedOf(node) {
    const map = new Map();
    for (const item of tokens(node.getAttribute(BRIDGED_ATTR))) {
        const at = item.indexOf('=');
        if (at <= 0)
            continue;
        const rest = item.slice(at + 1);
        const bar = rest.indexOf('|');
        map.set(item.slice(0, at), { mine: decode(bar >= 0 ? rest.slice(0, bar) : rest), orig: bar >= 0 ? decode(rest.slice(bar + 1)) : null });
    }
    return map;
}
function writeBridged(node, map) {
    const text = [...map].filter(([, item]) => item && item.mine !== '').map(([attr, item]) => `${attr}=${encodeURIComponent(item.mine)}${item.orig === null ? '' : `|${encodeURIComponent(item.orig)}`}`).join(' ');
    if (text)
        node.setAttribute(BRIDGED_ATTR, text);
    else
        node.removeAttribute(BRIDGED_ATTR);
}
function originalOf(node, attr, bridged) {
    if (!originals.has(node))
        originals.set(node, new Map());
    const map = originals.get(node);
    if (map.has(attr))
        return map.get(attr);
    const current = node.getAttribute(attr);
    const mark = bridged.get(attr);
    let orig;
    if (TOKEN_ATTRS.has(attr)) {
        const mine = new Set(tokens(mark?.mine));
        const base = tokens(current).filter(token => !mine.has(token));
        orig = base.length ? base.join(' ') : null;
    }
    else
        orig = mark && current === mark.mine ? mark.orig : current;
    map.set(attr, orig);
    return orig;
}
function compose(node, attr) {
    const perAttr = owners.get(node)?.get(attr);
    const contributions = [...(perAttr?.values() || [])].filter(value => value !== null && value !== undefined);
    const bridged = bridgedOf(node);
    const orig = originalOf(node, attr, bridged);
    const current = node.getAttribute(attr);
    let next, mine;
    if (TOKEN_ATTRS.has(attr)) {
        const base = tokens(orig);
        const merged = [...base];
        for (const value of contributions)
            for (const token of tokens(value))
                if (!merged.includes(token))
                    merged.push(token);
        next = merged.length ? merged.join(' ') : null;
        mine = merged.filter(token => !base.includes(token)).join(' ');
    }
    else {
        next = contributions.length ? contributions[contributions.length - 1] : orig;
        mine = contributions.length && next !== orig ? next : '';
    }
    if (next === null) {
        if (current !== null)
            node.removeAttribute(attr);
    }
    else if (current !== next)
        node.setAttribute(attr, next);
    if (mine)
        bridged.set(attr, { mine, orig });
    else
        bridged.delete(attr);
    writeBridged(node, bridged);
}
export function setBridgedState(node, owner, attr, value) {
    if (!node?.setAttribute || !owner || !attr)
        return;
    if (!owners.has(node))
        owners.set(node, new Map());
    const perNode = owners.get(node);
    if (!perNode.has(attr))
        perNode.set(attr, new Map());
    const perAttr = perNode.get(attr);
    if (value === null || value === undefined)
        perAttr.delete(owner);
    else
        perAttr.set(owner, String(value));
    compose(node, attr);
}
export function syncStateCarriers(root, group) {
    let count = 0;
    for (const { node, attr, values } of collectStateCarriers(root, group)) {
        if (!node.isConnected)
            continue;
        let value = group.getAttribute(attr);
        if (value !== null && values && TOKEN_ATTRS.has(attr)) {
            const picked = tokens(value).filter(token => values.has(token));
            value = picked.length ? picked.join(' ') : null;
        }
        setBridgedState(node, group, attr, value);
        count += 1;
    }
    return count;
}
function unclaimed(node, attr) {
    const perAttr = owners.get(node)?.get(attr);
    return !perAttr || perAttr.size === 0;
}
export function unwindStaleBridges(scope) {
    let count = 0;
    for (const node of scope?.querySelectorAll?.(`[${BRIDGED_ATTR}]`) || []) {
        const bridged = bridgedOf(node);
        let changed = false;
        for (const [attr, mark] of bridged) {
            if (!unclaimed(node, attr))
                continue;
            const current = node.getAttribute(attr);
            if (TOKEN_ATTRS.has(attr)) {
                const mine = new Set(tokens(mark.mine));
                const rest = tokens(current).filter(token => !mine.has(token));
                if (rest.length)
                    node.setAttribute(attr, rest.join(' '));
                else
                    node.removeAttribute(attr);
            }
            else if (current === mark.mine) {
                if (mark.orig === null)
                    node.removeAttribute(attr);
                else
                    node.setAttribute(attr, mark.orig);
            }
            bridged.delete(attr);
            originals.get(node)?.delete(attr);
            changed = true;
        }
        if (changed) {
            writeBridged(node, bridged);
            count += 1;
        }
    }
    return count;
}
export function releaseStateCarriers(root, group) {
    for (const { node, attr } of carrierCache.get(group)?.list || []) {
        owners.get(node)?.get(attr)?.delete(group);
        if (node.isConnected)
            compose(node, attr);
    }
    carrierCache.delete(group);
    try {
        unwindStaleBridges(faceScope(group, root));
    }
    catch { }
}
export function describeStateCarriers(root) {
    const out = [];
    for (const group of root?.querySelectorAll?.(GROUP) || []) {
        const list = collectStateCarriers(root, group);
        if (list.length)
            out.push({ type: group.getAttribute('data-rm-ui'), carriers: list.length, inside: list.filter(item => item.inside).length });
    }
    return out;
}
