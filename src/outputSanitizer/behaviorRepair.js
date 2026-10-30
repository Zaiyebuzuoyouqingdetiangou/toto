import { rmT as __rmT } from "../textTable.js?rmv=2.1.7";
import { splitShowTokens, normalizeShowToken } from './behaviorResults.js?rmv=2.1.7';
import { ownBehaviorNodes } from './behaviorOwner.js?rmv=2.1.7';
const GROUP = '[data-rm-ui]';
const RECOVERED = 'data-rm-behavior-recovered';
const UI = '[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-diagnostic-panel], [data-rm-mobile-controls], [data-rm-released]';
export const BEHAVIOR_DRIVER_TYPES = Object.freeze(['effect', 'drag', 'adjust', 'reveal', 'view', 'input', 'draw', 'motion', 'hold', 'follow', 'reorder', 'accumulate',
    'toggle', 'pick', 'pager', 'roll', 'connect', 'turn', 'sequence', 'slide', 'timer', 'swipe', 'rhythm', 'peek', 'spoiler', 'sense']);
const KNOWN = new Set([...BEHAVIOR_DRIVER_TYPES, 'scroll']);
const SYNONYMS = Object.freeze({
    flip: 'toggle', switch: 'toggle', flipcard: 'toggle', 'flip-card': 'toggle', onoff: 'toggle', [__rmT(".MNdPk")]: 'toggle', [__rmT("nDNqNh")]: 'toggle', [__rmT(".MNG.k")]: 'toggle',
    tabs: 'pick', tab: 'pick', choice: 'pick', choose: 'pick', select: 'pick', branch: 'pick', option: 'pick', options: 'pick', [__rmT("ZGwPjh")]: 'pick', [__rmT("7YC.Lf")]: 'pick', [__rmT("Z8idLk")]: 'pick',
    pages: 'pager', page: 'pager', paging: 'pager', book: 'pager', carousel: 'pager', slides: 'pager', slideshow: 'pager', gallery: 'pager', [__rmT(".MNxGT")]: 'pager',
    random: 'roll', dice: 'roll', lottery: 'roll', gacha: 'roll', shuffle: 'roll', [__rmT("s2iMfk")]: 'roll', [__rmT("s2EZNk")]: 'roll', [__rmT("TAmXjk")]: 'roll',
    link: 'connect', pair: 'connect', pairs: 'connect', line: 'connect', lines: 'connect', wire: 'connect', [__rmT("CUu67f")]: 'connect', [__rmT("kYhKBk")]: 'connect',
    dial: 'turn', knob: 'turn', rotate: 'turn', rotary: 'turn', wheel: 'turn', spin: 'turn', [__rmT("DVB_nf")]: 'turn', [__rmT("HgE_nf")]: 'turn', [__rmT("O6vG.k")]: 'turn',
    combo: 'sequence', lock: 'sequence', code: 'sequence', password: 'sequence', order: 'sequence', [__rmT("SGgVfT")]: 'sequence', [__rmT("RCVguf")]: 'sequence',
    slider: 'adjust', range: 'adjust', scratch: 'reveal', press: 'hold', 'long-press': 'hold', longpress: 'hold', counter: 'accumulate', collect: 'accumulate',
    sort: 'reorder', 'drag-drop': 'drag', dnd: 'drag', paint: 'draw', sketch: 'draw', spotlight: 'follow', flashlight: 'follow', zoom: 'view', animate: 'effect', trigger: 'effect',
    swiper: 'slide', scroller: 'slide', marquee: 'slide', [__rmT("uPleef")]: 'slide', [__rmT("UP3ENf")]: 'slide',
    countdown: 'timer', [__rmT("6RRnL8Eo")]: 'timer', [__rmT("6eDvjh")]: 'timer',
    tinder: 'swipe', fling: 'swipe', [__rmT("uNvUNk")]: 'swipe', [__rmT("W23ENf")]: 'swipe',
    qte: 'rhythm', charge: 'rhythm', mash: 'rhythm', [__rmT("CUBmNh")]: 'rhythm', [__rmT("SVcbNf")]: 'rhythm',
    hover: 'peek', tooltip: 'peek', tip: 'peek', [__rmT("8gdBNT")]: 'peek', [__rmT("MNlzEh")]: 'peek',
    blackout: 'spoiler', redact: 'spoiler', censor: 'spoiler', [__rmT("J8wg9T")]: 'spoiler', [__rmT("5PfeHf")]: 'spoiler',
    environment: 'sense', [__rmT("8MH1BT")]: 'sense',
});
const ALIASES = ['item', 'slot', 'reset', 'fire', 'part', 'step', 'hold', 'surface', 'cover', 'canvas', 'play', 'reverse', 'prev', 'next', 'answer',
    'toggle', 'pick', 'picked', 'page', 'goto', 'roll', 'end', 'knob', 'stops', 'code', 'show', 'loop', 'tap', 'charge', 'qte', 'peek', 'spoiler', 'clock', 'duration', 'memory', 'recall'];
const own = ownBehaviorNodes;
function count(group, selector) {
    return own(group, selector).length;
}
export function behaviorTypeFits(group, type) {
    switch (type) {
        case 'effect': return count(group, '[data-rm-part]') > 0 || (count(group, '[data-rm-fire]') > 0 && count(group, '[data-rm-show]') > 0);
        case 'view':
        case 'motion': return count(group, '[data-rm-part]') > 0;
        case 'drag':
        case 'reorder': return count(group, '[data-rm-item]') > 0;
        case 'adjust': return count(group, 'input[type="range"]') > 0;
        case 'reveal': return count(group, '[data-rm-cover]') > 0;
        case 'input': return count(group, 'output') > 0
            || (group.hasAttribute('data-rm-answer') && count(group, 'input:not([type]), input[type="text"], input[type="search"], textarea') > 0);
        case 'draw': return count(group, 'svg[data-rm-canvas]') > 0;
        case 'hold': return count(group, '[data-rm-hold]') > 0;
        case 'follow': return count(group, '[data-rm-surface]') > 0;
        case 'accumulate': return count(group, '[data-rm-step]') > 0;
        case 'toggle': return count(group, '[data-rm-toggle]') > 0;
        case 'pick': return count(group, '[data-rm-pick]') > 0;
        case 'pager': return count(group, '[data-rm-page]') > 1;
        case 'roll': return count(group, '[data-rm-roll]') > 0;
        case 'connect': return count(group, '[data-rm-end]') > 1;
        case 'turn': return count(group, '[data-rm-knob]') > 0;
        case 'sequence': return count(group, '[data-rm-code]') > 0;
        case 'slide': return count(group, '[data-rm-item]') > 1;
        case 'timer':
        case 'sense': return true;
        case 'swipe': return count(group, '[data-rm-card]') > 0;
        case 'rhythm': return count(group, '[data-rm-tap], [data-rm-charge], [data-rm-qte]') > 0;
        case 'peek': return count(group, '[data-rm-peek]') > 0;
        case 'spoiler': return count(group, '[data-rm-spoiler]') > 0;
        default: return false;
    }
}
const INFER_ORDER = ['turn', 'connect', 'roll', 'sequence', 'swipe', 'rhythm', 'peek', 'spoiler', 'pager', 'pick', 'toggle', 'hold', 'accumulate', 'draw', 'reveal', 'follow'];
export function inferBehaviorType(group) {
    for (const type of INFER_ORDER)
        if (behaviorTypeFits(group, type))
            return type;
    if (count(group, '[data-rm-part]') && count(group, '[data-rm-fire]'))
        return 'effect';
    if (count(group, '[data-rm-part]') && count(group, '[data-rm-play], [data-rm-reverse]'))
        return 'motion';
    if (count(group, '[data-rm-item]'))
        return count(group, '[data-rm-prev], [data-rm-next]') && !count(group, '[data-rm-slot]') ? 'reorder' : 'drag';
    if (count(group, 'input[type="range"]') === 1)
        return 'adjust';
    return '';
}
function canonical(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (KNOWN.has(raw))
        return raw;
    return SYNONYMS[raw] || SYNONYMS[raw.replace(/[\s_]+/g, '-')] || '';
}
function applyAliases(group) {
    for (const name of ALIASES) {
        for (const node of [group, ...group.querySelectorAll(`[data-${name}]`)]) {
            if (!node.hasAttribute?.(`data-${name}`) || node.hasAttribute(`data-rm-${name}`))
                continue;
            node.setAttribute(`data-rm-${name}`, node.getAttribute(`data-${name}`));
        }
    }
}
function mark(group, type, reason) {
    group.setAttribute('data-rm-ui', type);
    group.setAttribute(RECOVERED, reason);
}
function safeContainer(root, node, allowed = null) {
    if (!node || node === root || !root.contains(node) || node.closest(UI))
        return false;
    if (node.matches('toto, details, summary, body, html') || node.closest('summary'))
        return false;
    if (!node.closest('details'))
        return false;
    for (const inner of node.querySelectorAll('input[type="range"], input[type="checkbox"], input[type="radio"], details, label[for], [data-rm-ui], [data-rm-released]')) {
        if (allowed?.contains(inner))
            continue;
        return false;
    }
    return true;
}
function commonAncestor(nodes) {
    const list = nodes.filter(Boolean);
    if (!list.length)
        return null;
    for (let node = list[0].parentElement; node; node = node.parentElement) {
        if (list.every(item => node.contains(item)))
            return node;
    }
    return null;
}
const orphan = (root, selector) => [...root.querySelectorAll(selector)].filter(node => !node.closest(GROUP) && !node.closest(UI));
const keysOf = (nodes, attr) => new Set(nodes.map(node => String(node.getAttribute(attr) || '').trim()).filter(Boolean));
function showTokens(node) {
    return splitShowTokens(node.getAttribute('data-rm-show') || '').map(normalizeShowToken).map(token => token.replace(/^!/, '')).filter(Boolean);
}
function companions(root, type, markers) {
    if (type === 'pick') {
        const keys = keysOf(markers, 'data-rm-pick');
        return orphan(root, '[data-rm-show]').filter(node => showTokens(node).some(token => keys.has(token)));
    }
    if (type === 'roll')
        return orphan(root, '[data-rm-show]');
    if (type === 'pager')
        return orphan(root, '[data-rm-prev], [data-rm-next], [data-rm-goto]');
    if (type === 'toggle') {
        const keys = new Set(markers.map(node => {
            const key = String(node.getAttribute('data-rm-toggle') || '').trim();
            return !key || /^(?:true|yes)$/i.test(key) ? 'on' : key;
        }));
        if (keys.has('on'))
            keys.add('true');
        return orphan(root, '[data-rm-show]').filter(node => showTokens(node).some(token => keys.has(token)));
    }
    return [];
}
const ORPHAN_SETS = [
    ['connect', '[data-rm-end]', 2], ['roll', '[data-rm-roll]', 1], ['sequence', '[data-rm-code]', 1],
    ['pager', '[data-rm-page]', 2], ['pick', '[data-rm-pick]', 1], ['accumulate', '[data-rm-step]', 1],
];
const ORPHAN_SINGLES = [['turn', '[data-rm-knob]'], ['toggle', '[data-rm-toggle]'], ['hold', '[data-rm-hold]'], ['draw', 'svg[data-rm-canvas]']];
function expandDeclared(root, group) {
    for (const [type, selector, minimum] of [...ORPHAN_SETS, ...ORPHAN_SINGLES.map(([name, sel]) => [name, sel, 1])]) {
        const markers = orphan(root, selector);
        if (!markers.length)
            continue;
        const scope = commonAncestor([group, ...markers]);
        if (!scope || !safeContainer(root, scope, group))
            continue;
        const original = group.getAttribute('data-rm-ui');
        group.removeAttribute('data-rm-ui');
        scope.setAttribute('data-rm-ui', type);
        if (behaviorTypeFits(scope, type) && count(scope, selector) >= minimum) {
            scope.setAttribute(RECOVERED, 'scope');
            return scope;
        }
        scope.removeAttribute('data-rm-ui');
        group.setAttribute('data-rm-ui', original);
    }
    return null;
}
function adoptOrphans(root) {
    let made = 0;
    for (const [type, selector, minimum] of ORPHAN_SETS) {
        const markers = orphan(root, selector);
        if (markers.length < minimum)
            continue;
        const scope = commonAncestor([...markers, ...companions(root, type, markers)]);
        if (!scope || !safeContainer(root, scope))
            continue;
        mark(scope, type, 'orphan');
        made++;
    }
    for (const [type, selector] of ORPHAN_SINGLES) {
        for (const marker of orphan(root, selector)) {
            if (marker.closest(GROUP))
                continue;
            const scope = commonAncestor([marker, ...companions(root, type, [marker])]);
            const container = scope === marker ? marker.parentElement : scope;
            if (!container || !safeContainer(root, container))
                continue;
            mark(container, type, 'orphan');
            made++;
        }
    }
    return made;
}
function inferPagerPages(root, group) {
    if (count(group, '[data-rm-page]'))
        return false;
    const scope = root?.closest?.('toto') || root;
    const found = new Map();
    const walk = list => {
        for (const rule of list || []) {
            if (rule.cssRules && typeof rule.selectorText !== 'string') {
                if (walk(rule.cssRules) === null)
                    return null;
                continue;
            }
            if (typeof rule.selectorText !== 'string')
                continue;
            for (const raw of rule.selectorText.split(',')) {
                const piece = raw.replace(/^\s*\[data-rabbit-mirror-css-scope=[^\]]*\]\s*/, '');
                const match = piece.match(/\[\s*data-rm-index\s*=\s*["']?(\d+)["']?\s*\]\s+([^\s>+~][^>+~]*)$/);
                if (!match)
                    continue;
                let nodes = [];
                try {
                    nodes = own(group, match[2].trim());
                }
                catch {
                    continue;
                }
                if (nodes.length !== 1)
                    continue;
                const n = Number(match[1]);
                if (found.has(n) && found.get(n) !== nodes[0])
                    return null;
                found.set(n, nodes[0]);
            }
        }
        return true;
    };
    for (const node of [...(scope?.querySelectorAll?.('style') || [])]) {
        let ok = true;
        try {
            ok = walk(node.sheet?.cssRules);
        }
        catch { }
        if (ok === null)
            return false;
    }
    const keys = [...found.keys()].sort((a, b) => a - b);
    if (keys.length < 2 || keys[0] > 1 || keys.some((key, i) => key !== keys[0] + i))
        return false;
    const pages = keys.map(key => found.get(key));
    if (new Set(pages).size !== pages.length)
        return false;
    if (pages.some(page => !page.textContent.trim() && !page.querySelector('img, svg, figure, canvas, video')))
        return false;
    if (own(group, '[data-rm-pick], [data-rm-toggle], [data-rm-roll], [data-rm-step], [data-rm-item], [data-rm-end], [data-rm-knob], [data-rm-code]').length)
        return false;
    pages.forEach(page => { page.setAttribute('data-rm-page', ''); page.setAttribute('data-rm-page-inferred', 'true'); });
    if (keys[0] === 0)
        group.setAttribute('data-rm-index-base', '0');
    return true;
}
function repairAuthoredSet(root) {
    let repaired = 0;
    for (const button of orphan(root, 'button[data-rm-fire][data-rm-set]')) {
        const word = String(button.getAttribute('data-rm-set') || '').trim();
        const key = String(button.getAttribute('data-rm-fire') || '').trim();
        if (!/^[\w:-]+$/.test(word) || !key || !word.startsWith(key + ':'))
            continue;
        const parts = orphan(root, '[data-rm-part]').filter(n => n.getAttribute('data-rm-part') === key);
        const targets = orphan(root, '[data-rm-show]').filter(n => n.getAttribute('data-rm-show') === word);
        if (parts.length !== 1 || !targets.length)
            continue;
        const css = [...root.querySelectorAll('style')].map(n => n.textContent || '').join('');
        if (!css.includes('[data-rm-on~="' + word + '"]'))
            continue;
        const scope = commonAncestor([button, ...parts, ...targets]);
        if (!scope || scope === root || scope.matches('details,toto,summary,body,html') || scope.closest(UI))
            continue;
        if (scope.querySelector('details,input,label[for]'))
            continue;
        if ([...scope.querySelectorAll(GROUP)].some(n => n.getAttribute('data-rm-ui') !== 'effect'))
            continue;
        mark(scope, 'effect', 'authored-set');
        repaired++;
    }
    return repaired;
}
function repairScatteredPick(root) {
    const controls = [...root.querySelectorAll('[data-rm-pick]')].filter(n => !n.closest(UI));
    const disposable = new Set([...root.querySelectorAll('[data-rm-ui="pick"]')].filter(n => {
        if (!n.matches('button[data-rm-pick], span, strong, b, em') || n.querySelector('div, p, section, article, input, details'))
            return false;
        return !own(n, '[data-rm-pick], [data-pick], [data-rm-show], [data-show], [data-rm-result][data-rm-when]').length;
    }));
    const markers = controls.filter(n => !n.closest(GROUP) || disposable.has(n.closest(GROUP)));
    const keys = keysOf(markers, 'data-rm-pick');
    if (keys.size < 2)
        return 0;
    const targets = orphan(root, '[data-rm-show]').filter(n => showTokens(n).some(k => keys.has(k)));
    if (new Set(targets.flatMap(showTokens).filter(k => keys.has(k))).size < 2)
        return 0;
    const scope = commonAncestor([...markers, ...targets]);
    if (!scope || scope === root || scope.matches('details,toto,summary,body,html') || !root.contains(scope))
        return 0;
    if (scope.querySelector('details,input[type="checkbox"],input[type="radio"],label[for]'))
        return 0;
    for (const n of disposable)
        if (scope.contains(n))
            n.removeAttribute('data-rm-ui');
    mark(scope, 'pick', 'scope');
    return 1;
}
const OTHER_CONTROL = /^data-rm-(?:toggle|roll|goto|prev|next|fire|step|end|knob|code|reset|play|reverse|seek|place|return|move|tap|charge|qte|peek|spoiler)$/;
function inferPickControls(group) {
    if (count(group, '[data-rm-pick]'))
        return false;
    const keys = [...new Set(own(group, '[data-rm-show]').flatMap(showTokens))];
    const buttons = own(group, 'button').filter(button => !button.closest('[data-rm-show]')
        && ![...button.attributes].some(attr => OTHER_CONTROL.test(attr.name)));
    if (keys.length < 2 || buttons.length !== keys.length)
        return false;
    buttons.forEach((button, index) => button.setAttribute('data-rm-pick', keys[index]));
    group.setAttribute(RECOVERED, 'controls');
    return true;
}
function unhideDeclaredGroups(root) {
    let fixed = 0;
    const plain = piece => {
        const last = piece.trim().split(/\s*[\s>+~]\s*/).pop() || '';
        return /\[\s*data-rm-ui\b/.test(last) && !/:|\[\s*data-(?!rm-ui\b)/.test(last);
    };
    const walk = list => {
        for (const rule of list || []) {
            if (rule.cssRules && typeof rule.selectorText !== 'string') {
                walk(rule.cssRules);
                continue;
            }
            if (typeof rule.selectorText !== 'string' || !rule.style)
                continue;
            if (String(rule.style.getPropertyValue('display')).trim().toLowerCase() !== 'none')
                continue;
            if (!rule.selectorText.split(',').every(plain))
                continue;
            rule.style.removeProperty('display');
            fixed++;
        }
    };
    for (const node of root.querySelectorAll('style')) {
        try {
            walk(node.sheet?.cssRules);
        }
        catch { }
    }
    return fixed;
}
function mergeNestedToggles(root) {
    let merged = 0;
    const tokens = group => new Set(own(group, '[data-rm-show]').map(node => String(node.getAttribute('data-rm-show') || '').replace(/^!/, '').trim()).filter(Boolean));
    const groups = [...(root.matches?.('[data-rm-ui="toggle"]') ? [root] : []), ...root.querySelectorAll('[data-rm-ui="toggle"]')];
    for (const outer of groups) {
        if (outer.getAttribute('data-rm-ui') !== 'toggle')
            continue;
        const mine = tokens(outer);
        if (!mine.size)
            continue;
        for (const inner of outer.querySelectorAll('[data-rm-ui="toggle"]')) {
            if (inner.parentElement?.closest('[data-rm-ui]') !== outer)
                continue;
            const shownBy = inner.closest('[data-rm-show]');
            if (shownBy && outer.contains(shownBy) && shownBy !== outer)
                continue;
            const theirs = tokens(inner);
            if (!theirs.size || [...theirs].some(token => !mine.has(token)))
                continue;
            inner.removeAttribute('data-rm-ui');
            inner.removeAttribute('data-ui');
            inner.removeAttribute('data-rm-on');
            if (!outer.hasAttribute(RECOVERED))
                outer.setAttribute(RECOVERED, 'merged-toggle');
            merged++;
        }
    }
    return merged;
}
export function repairBehaviorDeclarations(root) {
    if (!root?.querySelectorAll)
        return 0;
    let repaired = repairScatteredPick(root) + repairAuthoredSet(root) + unhideDeclaredGroups(root);
    for (const node of root.querySelectorAll('[data-ui]:not([data-rm-ui])')) {
        if (node.closest(UI))
            continue;
        const type = canonical(node.getAttribute('data-ui'));
        if (type)
            node.setAttribute('data-rm-ui', type);
    }
    const declared = [...(root.matches?.(GROUP) ? [root] : []), ...root.querySelectorAll(GROUP)].filter(node => !node.closest(UI));
    for (const group of declared)
        applyAliases(group);
    for (const group of declared) {
        if (!group.isConnected && group !== root)
            continue;
        const written = String(group.getAttribute('data-rm-ui') || '');
        const type = canonical(written);
        if (type === 'scroll')
            continue;
        if (type && behaviorTypeFits(group, type)) {
            if (type !== written) {
                mark(group, type, 'type');
                repaired++;
            }
            continue;
        }
        if (type === 'pick' && inferPickControls(group)) {
            if (type !== written)
                mark(group, type, 'type');
            repaired++;
            continue;
        }
        const inferred = inferBehaviorType(group);
        if (!inferred && type === 'pager' && inferPagerPages(root, group)) {
            if (type !== written)
                mark(group, type, 'type');
            repaired++;
            continue;
        }
        if (inferred) {
            mark(group, inferred, 'type');
            repaired++;
            continue;
        }
        if (expandDeclared(root, group)) {
            repaired++;
            continue;
        }
        if (type === 'toggle' && type !== written) {
            mark(group, type, 'type');
            repaired++;
        }
    }
    repaired += mergeNestedToggles(root);
    repaired += adoptOrphans(root);
    return repaired;
}
