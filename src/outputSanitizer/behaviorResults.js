// Bind authored content to local behavior state; never invent feedback or execute expressions.
const results = new WeakMap();
const chooserStates = new WeakMap();
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
// 该显示的那块还被模型的样式藏着时，照模型自己的写法挂上 data-rm-active（只挂记号，不写内联样式：
// 表格行、列表项、窄屏故意藏起来的都按模型自己的样式来）。切走或交还时只撤自己挂的那个。
const FORCED_ACTIVE = 'data-rm-result-forced-active';
function revealAuthorHidden(node) {
    const view = node.ownerDocument?.defaultView;
    if (!view?.getComputedStyle || !node.isConnected) return;
    if (node.hasAttribute('data-rm-active') || view.getComputedStyle(node).display !== 'none') return;
    node.setAttribute('data-rm-active', 'true');
    node.setAttribute(FORCED_ACTIVE, 'true');
}

export function clearForcedActive(node) {
    if (node?.getAttribute?.(FORCED_ACTIVE) !== 'true') return;
    if (node.getAttribute('data-rm-active') === 'true') node.removeAttribute('data-rm-active');
    node.removeAttribute(FORCED_ACTIVE);
}

function visibility(node, saved, active, reveal = false) {
    const value = String(active);
    if (node.getAttribute('data-rm-result-active') !== value) node.setAttribute('data-rm-result-active', value);
    if (active) {
        if (node.hasAttribute('hidden')) node.removeAttribute('hidden');
        if (saved.display) {
            if (node.style.getPropertyValue('display') !== saved.display || node.style.getPropertyPriority('display') !== saved.priority) {
                node.style.setProperty('display', saved.display, saved.priority);
            }
        } else if (node.style.getPropertyValue('display')) node.style.removeProperty('display');
        if (reveal) revealAuthorHidden(node);
    } else {
        clearForcedActive(node);
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
    const raw = String(node?.getAttribute?.('data-rm-show') || '').trim();
    // 顺序口令：模型把整串答案原样写进显示条件（data-rm-answer="甲,乙,丙" 配 data-rm-show="甲,乙,丙"／"!甲,乙,丙"），
    // 意思是「按对了／还没按对」，不是三个键各算各的。
    const answer = String(showOwner(node)?.getAttribute?.('data-rm-answer') || '').replace(/\s+/g, '');
    if (answer && /[,，、]/.test(answer) && raw.replace(/^!/, '').replace(/\s+/g, '') === answer) return [raw.startsWith('!') ? '!match' : 'match'];
    return splitShowTokens(raw).map(normalizeShowToken).filter(Boolean);
}

// 显示条件按空格、逗号拆开；方括号、:not(...) 里面的空格逗号不拆（[data-rm-picked="a b"] 是一整个）。
export function splitShowTokens(raw) {
    return String(raw || '').match(/!?(?::not\((?:[^()]|\([^()]*\))*\)|\[[^\]]*\]|[^\s,，、])+/g) || [];
}

// 模型把显示条件写成 CSS 选择器的样子：[data-rm-match]、[data-rm-match="true"]、data-rm-done、:not([data-rm-match])、
// [data-rm-match="false"]、[data-rm-picked="甲"]（→ 甲）。意思就是那个状态词或键（或它的反面），按它认。别的照原样。
export function normalizeShowToken(token) {
    let text = String(token || '').trim();
    let negate = false;
    if (text.startsWith('!')) { negate = true; text = text.slice(1); }
    const not = text.match(/^:not\((.+)\)$/);
    if (not) { negate = !negate; text = not[1].trim(); }
    const attr = text.match(/^(\[)?\s*data-rm-([a-z][\w-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\s*(\])?$/i);
    if (attr && Boolean(attr[1]) === Boolean(attr[6])) {
        const name = attr[2];
        const value = attr[3] ?? attr[4] ?? attr[5];
        if (value === 'false') negate = !negate;
        const word = value && value !== 'true' && value !== 'false' ? value.trim() : name;
        return word ? `${negate ? '!' : ''}${word}` : '';
    }
    return text ? `${negate ? '!' : ''}${text}` : '';
}

// 翻页等驱动直接显隐某个节点，沿用同一套“记住原 display、隐藏时 display:none !important”的做法。
export function setBehaviorNodeVisible(node, active) {
    if (!node?.style) return false;
    const saved = results.get(node) || remember(node);
    const before = node.getAttribute('data-rm-result-active');
    visibility(node, saved, Boolean(active));
    return before !== String(Boolean(active));
}

// 模型把内容写在驱动容器外面（转盘在上、各格的说明在下面另一个框里），data-rm-show 不归任何容器管，永远不动。
// 这一面里只有一个驱动容器时，外面这些无主的内容归它管。
function orphanShows(group) {
    const face = group.closest?.('[data-rabbit-mirror-css-scope]') || group.closest?.('details');
    if (!face || face === group || group.parentElement?.closest?.('[data-rm-ui]')) return [];
    const groups = [...face.querySelectorAll('[data-rm-ui]')].filter(node => !node.parentElement?.closest?.('[data-rm-ui]'));
    if (groups.length !== 1 || groups[0] !== group) return [];
    return [...face.querySelectorAll('[data-rm-show]')].filter(node => !showOwner(node) && !node.matches('[data-rm-ui]') && node.style);
}

export function ownBehaviorShows(group) {
    if (!group?.querySelectorAll) return [];
    const own = [...group.querySelectorAll('[data-rm-show]')].filter(node => showOwner(node) === group && node.style);
    return own.concat(orphanShows(group));
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
    clearForcedActive(node);
    node.setAttribute('data-rm-show-author', 'true');
    return touched;
}

// 显示节点里装着选它自己的那个按钮（三张卡片各写 data-rm-show="自己的键"，卡片里又有选这个键的按钮）：
// 它是选项，不是结果。按「选中才显示」藏起来，选了一张，别的卡连同按钮一起没了，再也选不回来。
// 这种卡片一直显示，选中与否只照常同步状态（选中的那张挂 data-rm-active，模型的样式按它高亮）。
function selfChooser(node, group, positive) {
    if (!positive.length || !node.querySelectorAll) return false;
    // 只认「选这一个」的按钮（data-rm-pick）。开关不算：打开才显示的面板里放着自己的关闭开关，是关闭按钮，面板照样该藏。
    for (const control of node.querySelectorAll('[data-rm-pick]')) {
        const owner = control.closest('[data-rm-ui]');
        if (owner && owner !== group) continue;
        const key = String(control.getAttribute('data-rm-pick') || '').trim();
        if (key && positive.includes(key)) return true;
    }
    return false;
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
        if (selfChooser(node, group, positive)) {
            visibility(node, saved, true);
            // 选中的那张挂 data-rm-active（交还时由 clearForcedActive 撤掉）；没选中的撤掉，存档里带来的旧记号也撤。
            if (active) { node.setAttribute('data-rm-active', 'true'); node.setAttribute(FORCED_ACTIVE, 'true'); }
            else { node.removeAttribute('data-rm-active'); node.removeAttribute(FORCED_ACTIVE); }
            const was = chooserStates.get(node);
            chooserStates.set(node, active);
            if (onChange && was !== active) onChange(node, active);
            count++;
            continue;
        }
        const before = node.getAttribute('data-rm-result-active');
        visibility(node, saved, active, true);
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
