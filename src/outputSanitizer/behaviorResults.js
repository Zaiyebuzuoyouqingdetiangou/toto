import { rmR as __rmR } from "../textTable.js?rmv=2.5.1";
const results = new WeakMap();
const chooserStates = new WeakMap();
const DISPLAY = new Set(['', 'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid',
    'flow-root', 'contents', 'list-item', 'table', 'inline-table', 'table-row', 'table-cell', 'table-caption',
    'table-row-group', 'table-header-group', 'table-footer-group', 'table-column', 'table-column-group',
    'block flow', 'inline flow', 'block flow-root', 'inline flow-root', 'block flex', 'inline flex',
    'block grid', 'inline grid', 'inherit', 'initial', 'unset', 'revert', 'revert-layer']);
function condition(text) {
    if (['changed', 'match', 'active'].includes(text))
        return { key: text };
    const numeric = /^(p|count)\s*(>=|<=|==|=|>|<)\s*(-?(?:\d+(?:\.\d*)?|\.\d+))$/.exec(text);
    if (numeric) {
        const [, key, op, raw] = numeric, value = Number(raw);
        if (!Number.isFinite(value) || value < 0 || (key === 'p' ? value > 1 : !Number.isInteger(value)))
            return null;
        return { key, op, value };
    }
    const list = /^(order|placed)\s*=\s*(.+)$/.exec(text);
    if (!list)
        return null;
    const keys = list[2].split(',').map(key => key.trim());
    return keys.every(Boolean) ? { key: list[1], keys } : null;
}
function matches(rule, values) {
    const actual = values?.[rule.key];
    if (rule.keys) {
        if (!Array.isArray(actual) || !actual.every(key => typeof key === 'string'))
            return false;
        return rule.key === 'order'
            ? actual.length === rule.keys.length && rule.keys.every((key, index) => actual[index] === key)
            : rule.keys.every(key => actual.includes(key));
    }
    if (!rule.op)
        return actual === true;
    if (!Number.isFinite(actual))
        return false;
    switch (rule.op) {
        case '>': return actual > rule.value;
        case '>=': return actual >= rule.value;
        case '<': return actual < rule.value;
        case '<=': return actual <= rule.value;
        default: return actual === rule.value;
    }
}
function remember(node) {
    const display = node.style.getPropertyValue('display');
    const persisted = node.getAttribute('data-rm-result-display');
    const copiedHidden = node.getAttribute('data-rm-result-active') === 'false' && display === 'none';
    const originalDisplay = copiedHidden && persisted !== null && DISPLAY.has(persisted)
        ? persisted : display === 'none' ? '' : display;
    const priority = copiedHidden ? node.getAttribute('data-rm-result-display-priority') : node.style.getPropertyPriority('display');
    const originalPriority = originalDisplay && priority === 'important' ? 'important' : '';
    node.setAttribute('data-rm-result-display', DISPLAY.has(originalDisplay) ? originalDisplay : '');
    if (originalPriority)
        node.setAttribute('data-rm-result-display-priority', originalPriority);
    else
        node.removeAttribute('data-rm-result-display-priority');
    const saved = { display: originalDisplay, priority: originalPriority };
    results.set(node, saved);
    return saved;
}
const FORCED_ACTIVE = 'data-rm-result-forced-active';
function revealAuthorHidden(node) {
    const view = node.ownerDocument?.defaultView;
    if (!view?.getComputedStyle || !node.isConnected)
        return;
    if (node.hasAttribute('data-rm-active') || view.getComputedStyle(node).display !== 'none')
        return;
    node.setAttribute('data-rm-active', 'true');
    node.setAttribute(FORCED_ACTIVE, 'true');
}
export function clearForcedActive(node) {
    if (node?.getAttribute?.(FORCED_ACTIVE) !== 'true')
        return;
    if (node.getAttribute('data-rm-active') === 'true')
        node.removeAttribute('data-rm-active');
    node.removeAttribute(FORCED_ACTIVE);
}
function visibility(node, saved, active, reveal = false) {
    const value = String(active);
    if (node.getAttribute('data-rm-result-active') !== value)
        node.setAttribute('data-rm-result-active', value);
    if (active) {
        if (node.hasAttribute('hidden'))
            node.removeAttribute('hidden');
        if (saved.display) {
            if (node.style.getPropertyValue('display') !== saved.display || node.style.getPropertyPriority('display') !== saved.priority) {
                node.style.setProperty('display', saved.display, saved.priority);
            }
        }
        else if (node.style.getPropertyValue('display'))
            node.style.removeProperty('display');
        if (reveal)
            revealAuthorHidden(node);
    }
    else {
        clearForcedActive(node);
        if (!node.hasAttribute('hidden'))
            node.setAttribute('hidden', '');
        if (node.style.getPropertyValue('display') !== 'none' || node.style.getPropertyPriority('display') !== 'important') {
            node.style.setProperty('display', 'none', 'important');
        }
    }
}
const CHOOSER_SELECTOR = '[data-rm-pick], [data-rm-goto]';
function chooserKeys(group) {
    const keys = new Set();
    for (const control of group.querySelectorAll?.(CHOOSER_SELECTOR) || []) {
        if (control.closest('[data-rm-ui]') !== group)
            continue;
        for (const name of ['data-rm-pick', 'data-rm-goto']) {
            for (const key of String(control.getAttribute(name) || '').split(/\s+/))
                if (key)
                    keys.add(key);
        }
    }
    return keys;
}
function showOwner(node) {
    const near = node.matches?.('[data-rm-ui]') ? node.parentElement?.closest?.('[data-rm-ui]') : node.closest?.('[data-rm-ui]');
    if (!near || !near.parentElement?.closest?.('[data-rm-ui]'))
        return near;
    const nearKeys = chooserKeys(near);
    if (!nearKeys.size)
        return near;
    const tokens = splitShowTokens(node.getAttribute?.('data-rm-show') || '').map(normalizeShowToken).map(token => token.replace(/^!/, '')).filter(Boolean);
    if (!tokens.length || tokens.some(token => nearKeys.has(token)))
        return near;
    for (let up = near.parentElement?.closest?.('[data-rm-ui]'); up; up = up.parentElement?.closest?.('[data-rm-ui]')) {
        const keys = chooserKeys(up);
        if (keys.size && tokens.every(token => keys.has(token)))
            return up;
    }
    return near;
}
export function behaviorShowTokens(node) {
    const raw = String(node?.getAttribute?.('data-rm-show') || '').trim();
    const answer = String(showOwner(node)?.getAttribute?.('data-rm-answer') || '').replace(/\s+/g, '');
    if (answer && __rmR("61eUO7w6twlUTh", "").test(answer) && raw.replace(/^!/, '').replace(/\s+/g, '') === answer)
        return [raw.startsWith('!') ? '!match' : 'match'];
    return splitShowTokens(raw).map(normalizeShowToken).filter(Boolean);
}
export function splitShowTokens(raw) {
    return String(raw || '').match(__rmR("2DNSuFBjJ.oNtSsIGhogo1YlaSOS9lFjzGDWTM2z8z_3Sh1lOUtY2dI8vo4jVT217aX.tNsaAeUfNaAFCaDuoPMWi8h2QpK1zZ9ytUFzr6kNaUDHQzcF4_2ZQgEmpoBjhL37qoIHeWoWpFABleVMgk", "g")) || [];
}
export function normalizeShowToken(token) {
    let text = String(token || '').trim();
    let negate = false;
    if (text.startsWith('!')) {
        negate = true;
        text = text.slice(1);
    }
    const not = text.match(/^:not\((.+)\)$/);
    if (not) {
        negate = !negate;
        text = not[1].trim();
    }
    const attr = text.match(/^(\[)?\s*data-rm-([a-z][\w-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\s*(\])?$/i);
    if (attr && Boolean(attr[1]) === Boolean(attr[6])) {
        const name = attr[2];
        const value = attr[3] ?? attr[4] ?? attr[5];
        if (value === 'false')
            negate = !negate;
        const word = value && value !== 'true' && value !== 'false' ? value.trim() : name;
        return word ? `${negate ? '!' : ''}${word}` : '';
    }
    return text ? `${negate ? '!' : ''}${text}` : '';
}
export function setBehaviorNodeVisible(node, active) {
    if (!node?.style)
        return false;
    const saved = results.get(node) || remember(node);
    const before = node.getAttribute('data-rm-result-active');
    visibility(node, saved, Boolean(active));
    return before !== String(Boolean(active));
}
function orphanShows(group) {
    const face = group.closest?.('[data-rabbit-mirror-css-scope]') || group.closest?.('details');
    if (!face || face === group || group.parentElement?.closest?.('[data-rm-ui]'))
        return [];
    const groups = [...face.querySelectorAll('[data-rm-ui]')].filter(node => !node.parentElement?.closest?.('[data-rm-ui]'));
    if (groups.length !== 1 || groups[0] !== group)
        return [];
    return [...face.querySelectorAll('[data-rm-show]')].filter(node => !showOwner(node) && !node.matches('[data-rm-ui]') && node.style);
}
export function ownBehaviorShows(group) {
    if (!group?.querySelectorAll)
        return [];
    const own = [...group.querySelectorAll('[data-rm-show]')].filter(node => showOwner(node) === group && node.style);
    return own.concat(orphanShows(group));
}
export function releaseBehaviorShow(node) {
    if (!node?.style)
        return false;
    const touched = results.has(node) || node.hasAttribute('data-rm-result-active');
    if (touched) {
        const saved = results.get(node) || remember(node);
        visibility(node, saved, true);
        node.removeAttribute('data-rm-result-active');
    }
    clearForcedActive(node);
    node.setAttribute('data-rm-show-author', 'true');
    return touched;
}
function selfChooser(node, group, positive) {
    if (!positive.length || !node.querySelectorAll)
        return false;
    for (const control of node.querySelectorAll('[data-rm-pick]')) {
        const owner = control.closest('[data-rm-ui]');
        if (owner && owner !== group)
            continue;
        const key = String(control.getAttribute('data-rm-pick') || '').trim();
        if (key && positive.includes(key))
            return true;
    }
    return false;
}
export function updateBehaviorShows(group, keys = new Set(), onChange = null, released = null) {
    let count = 0;
    for (const node of ownBehaviorShows(group)) {
        if (released?.has(node)) {
            if (node.getAttribute('data-rm-show-author') !== 'true')
                releaseBehaviorShow(node);
            continue;
        }
        const tokens = behaviorShowTokens(node);
        if (!tokens.length)
            continue;
        const positive = tokens.filter(token => !token.startsWith('!'));
        const negative = tokens.filter(token => token.startsWith('!')).map(token => token.slice(1)).filter(Boolean);
        const active = (!positive.length || positive.some(token => keys.has(token))) && negative.every(token => !keys.has(token));
        const saved = results.get(node) || remember(node);
        if (selfChooser(node, group, positive)) {
            visibility(node, saved, true);
            if (active) {
                node.setAttribute('data-rm-active', 'true');
                node.setAttribute(FORCED_ACTIVE, 'true');
            }
            else {
                node.removeAttribute('data-rm-active');
                node.removeAttribute(FORCED_ACTIVE);
            }
            const was = chooserStates.get(node);
            chooserStates.set(node, active);
            if (onChange && was !== active)
                onChange(node, active);
            count++;
            continue;
        }
        const before = node.getAttribute('data-rm-result-active');
        visibility(node, saved, active, true);
        if (onChange && before !== String(active))
            onChange(node, active);
        count++;
    }
    return count;
}
export function updateBehaviorResults(group, values = {}) {
    if (!group?.querySelectorAll)
        return 0;
    let count = 0;
    for (const node of group.querySelectorAll('[data-rm-result][data-rm-when]')) {
        if (node.closest('[data-rm-ui]') !== group || !node.style)
            continue;
        const rule = condition((node.getAttribute('data-rm-when') || '').trim());
        if (!rule)
            continue;
        const saved = results.get(node) || remember(node);
        visibility(node, saved, matches(rule, values));
        count++;
    }
    return count;
}
