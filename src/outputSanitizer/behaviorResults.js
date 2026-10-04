// Bind authored content to local behavior state; never invent feedback or execute expressions.
const results = new WeakMap();
const DISPLAY = new Set(['', 'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid',
    'flow-root', 'contents', 'list-item', 'table', 'inline-table', 'table-row', 'table-cell', 'table-caption',
    'table-row-group', 'table-header-group', 'table-footer-group', 'table-column', 'table-column-group',
    'block flow', 'inline flow', 'block flow-root', 'inline flow-root', 'block flex', 'inline flex',
    'block grid', 'inline grid', 'inherit', 'initial', 'unset', 'revert', 'revert-layer']);

function condition(text) {
    if (['changed', 'match', 'active'].includes(text)) return { key: text };
    const numeric = /^(p|count)\s*(>=|<=|==|=|>|<)\s*(-?(?:\d+(?:\.\d*)?|\.\d+))$/.exec(text);
    if (numeric) {
        const [, key, op, raw] = numeric, value = Number(raw);
        if (!Number.isFinite(value) || value < 0 || (key === 'p' ? value > 1 : !Number.isInteger(value))) return null;
        return { key, op, value };
    }
    const list = /^(order|placed)\s*=\s*(.+)$/.exec(text);
    if (!list) return null;
    const keys = list[2].split(',').map(key => key.trim());
    return keys.every(Boolean) ? { key: list[1], keys } : null;
}

function matches(rule, values) {
    const actual = values?.[rule.key];
    if (rule.keys) {
        if (!Array.isArray(actual) || !actual.every(key => typeof key === 'string')) return false;
        return rule.key === 'order'
            ? actual.length === rule.keys.length && rule.keys.every((key, index) => actual[index] === key)
            : rule.keys.every(key => actual.includes(key));
    }
    if (!rule.op) return actual === true;
    if (!Number.isFinite(actual)) return false;
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
    // A saved face can contain our inline display:none. Recover only a plain display value,
    // not arbitrary styles or executable data, before taking ownership in this new DOM.
    const originalDisplay = copiedHidden && persisted !== null && DISPLAY.has(persisted)
        ? persisted : display === 'none' ? '' : display;
    const priority = copiedHidden ? node.getAttribute('data-rm-result-display-priority') : node.style.getPropertyPriority('display');
    const originalPriority = originalDisplay && priority === 'important' ? 'important' : '';
    node.setAttribute('data-rm-result-display', DISPLAY.has(originalDisplay) ? originalDisplay : '');
    if (originalPriority) node.setAttribute('data-rm-result-display-priority', originalPriority);
    else node.removeAttribute('data-rm-result-display-priority');
    const saved = { display: originalDisplay, priority: originalPriority };
    results.set(node, saved);
    return saved;
}

function visibility(node, saved, active) {
    const value = String(active);
    if (node.getAttribute('data-rm-result-active') !== value) node.setAttribute('data-rm-result-active', value);
    if (active) {
        if (node.hasAttribute('hidden')) node.removeAttribute('hidden');
        if (saved.display) {
            if (node.style.getPropertyValue('display') !== saved.display || node.style.getPropertyPriority('display') !== saved.priority) {
                node.style.setProperty('display', saved.display, saved.priority);
            }
        } else if (node.style.getPropertyValue('display')) node.style.removeProperty('display');
    } else {
        if (!node.hasAttribute('hidden')) node.setAttribute('hidden', '');
        if (node.style.getPropertyValue('display') !== 'none' || node.style.getPropertyPriority('display') !== 'important') {
            node.style.setProperty('display', 'none', 'important');
        }
    }
}

export function updateBehaviorResults(group, values = {}) {
    if (!group?.querySelectorAll) return 0;
    let count = 0;
    for (const node of group.querySelectorAll('[data-rm-result][data-rm-when]')) {
        if (node.closest('[data-rm-ui]') !== group || !node.style) continue;
        const rule = condition((node.getAttribute('data-rm-when') || '').trim());
        if (!rule) continue;
        const saved = results.get(node) || remember(node);
        visibility(node, saved, matches(rule, values));
        count++;
    }
    return count;
}
