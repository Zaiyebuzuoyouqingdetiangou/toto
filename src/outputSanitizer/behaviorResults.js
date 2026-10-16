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

// 模型常这样写分页：.页{display:none} .页[data-rm-active]{display:block}，再用驱动按 data-rm-show 切换。
// 驱动只撤掉自己加的隐藏，模型那条默认隐藏还在，切到哪一页都是空的。
// 该显示的那块还被模型的样式藏着时：先照模型自己的写法挂上 data-rm-active；还藏着就直接显示出来。
const FORCED_ACTIVE = 'data-rm-result-forced-active';
function revealAuthorHidden(node) {
    const view = node.ownerDocument?.defaultView;
    if (!view?.getComputedStyle || !node.isConnected) return;
    if (view.getComputedStyle(node).display !== 'none') return;
    if (!node.hasAttribute('data-rm-active')) { node.setAttribute('data-rm-active', 'true'); node.setAttribute(FORCED_ACTIVE, 'true'); }
    if (view.getComputedStyle(node).display === 'none') node.style.setProperty('display', 'block', 'important');
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
        revealAuthorHidden(node);
    } else {
        if (node.getAttribute(FORCED_ACTIVE) === 'true') { node.removeAttribute('data-rm-active'); node.removeAttribute(FORCED_ACTIVE); }
        if (!node.hasAttribute('hidden')) node.setAttribute('hidden', '');
        if (node.style.getPropertyValue('display') !== 'none' || node.style.getPropertyPriority('display') !== 'important') {
            node.style.setProperty('display', 'none', 'important');
        }
    }
}

// data-rm-show="键"：容器当前状态里含这个键时显示；"!键" 表示不含时显示；可写多个，空格或逗号分隔。
// 键来自驱动状态（on 词、选中的键、当前页、格号、changed／active／done／match），由驱动传入。
// 显示节点本身也是驱动容器时，它归外层容器管。
function showOwner(node) {
    return node.matches?.('[data-rm-ui]') ? node.parentElement?.closest?.('[data-rm-ui]') : node.closest?.('[data-rm-ui]');
}

export function behaviorShowTokens(node) {
    return String(node?.getAttribute?.('data-rm-show') || '').split(/[\s,，、]+/).map(token => token.trim()).filter(Boolean);
}

// 翻页等驱动直接显隐某个节点，沿用同一套“记住原 display、隐藏时 display:none !important”的做法。
export function setBehaviorNodeVisible(node, active) {
    if (!node?.style) return false;
    const saved = results.get(node) || remember(node);
    const before = node.getAttribute('data-rm-result-active');
    visibility(node, saved, Boolean(active));
    return before !== String(Boolean(active));
}

export function ownBehaviorShows(group) {
    if (!group?.querySelectorAll) return [];
    return [...group.querySelectorAll('[data-rm-show]')].filter(node => showOwner(node) === group && node.style);
}

// 交还给模型自己的 CSS 管的显示节点：撤掉驱动加的隐藏（恢复原 display、去掉 hidden），以后不再管它。
export function releaseBehaviorShow(node) {
    if (!node?.style) return false;
    // 驱动从没管过它（没有记录、也没有存档里带来的隐藏标记）：一个字都不动，模型写的内联样式照旧。
    const touched = results.has(node) || node.hasAttribute('data-rm-result-active');
    if (touched) {
        const saved = results.get(node) || remember(node);
        visibility(node, saved, true);
        node.removeAttribute('data-rm-result-active');
    }
    node.setAttribute('data-rm-show-author', 'true');
    return touched;
}

export function updateBehaviorShows(group, keys = new Set(), onChange = null, released = null) {
    let count = 0;
    for (const node of ownBehaviorShows(group)) {
        if (released?.has(node)) { if (node.getAttribute('data-rm-show-author') !== 'true') releaseBehaviorShow(node); continue; }
        const tokens = behaviorShowTokens(node);
        if (!tokens.length) continue;
        const positive = tokens.filter(token => !token.startsWith('!'));
        const negative = tokens.filter(token => token.startsWith('!')).map(token => token.slice(1)).filter(Boolean);
        const active = (!positive.length || positive.some(token => keys.has(token))) && negative.every(token => !keys.has(token));
        const saved = results.get(node) || remember(node);
        const before = node.getAttribute('data-rm-result-active');
        visibility(node, saved, active);
        if (onChange && before !== String(active)) onChange(node, active);
        count++;
    }
    return count;
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
