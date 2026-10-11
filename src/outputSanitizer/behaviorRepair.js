// 插件写法的按类修复：不认某一面、某一条，只认“这一类写法常见的写错方式”。
// 1. 类型名写成别名（flip、tabs、carousel、dial…）或漏了 rm 前缀 → 换成标准类型名；
// 2. 声明的类型和里面的部件对不上（写 toggle 却放了 data-rm-pick）→ 按部件认出真正的类型；
// 3. 容器只包住了画面、按钮写在容器外 → 把容器扩到同时包住两者的最近一层；
// 4. 写了部件却没写容器 → 在部件所在的最近一层补上容器。
// 只在本面局部里补标识：不新增内容、不猜目标、不碰含有勾选框／滑杆／内层折叠的区域（它们有各自的修复）。
const GROUP = '[data-rm-ui]';
const RECOVERED = 'data-rm-behavior-recovered';
// 已交给老修复器（接力）的区域，插件修复不再碰：不补标识、不认类型、不收编散落的部件。
const UI = '[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-diagnostic-panel], [data-rm-mobile-controls], [data-rm-released]';

export const BEHAVIOR_DRIVER_TYPES = Object.freeze(['effect', 'drag', 'adjust', 'reveal', 'view', 'input', 'draw', 'motion', 'hold', 'follow', 'reorder', 'accumulate',
    'toggle', 'pick', 'pager', 'roll', 'connect', 'turn', 'sequence']);
const KNOWN = new Set([...BEHAVIOR_DRIVER_TYPES, 'scroll']);

const SYNONYMS = Object.freeze({
    flip: 'toggle', switch: 'toggle', flipcard: 'toggle', 'flip-card': 'toggle', onoff: 'toggle', 翻面: 'toggle', 开关: 'toggle', 翻转: 'toggle',
    tabs: 'pick', tab: 'pick', choice: 'pick', choose: 'pick', select: 'pick', branch: 'pick', option: 'pick', options: 'pick', 分支: 'pick', 选择: 'pick', 切换: 'pick',
    pages: 'pager', page: 'pager', paging: 'pager', book: 'pager', carousel: 'pager', slides: 'pager', slideshow: 'pager', gallery: 'pager', 翻页: 'pager',
    random: 'roll', dice: 'roll', lottery: 'roll', gacha: 'roll', shuffle: 'roll', 抽签: 'roll', 抽取: 'roll', 随机: 'roll',
    link: 'connect', pair: 'connect', pairs: 'connect', line: 'connect', lines: 'connect', wire: 'connect', 连线: 'connect', 配对: 'connect',
    dial: 'turn', knob: 'turn', rotate: 'turn', rotary: 'turn', wheel: 'turn', spin: 'turn', 转盘: 'turn', 拨盘: 'turn', 旋转: 'turn',
    combo: 'sequence', lock: 'sequence', code: 'sequence', password: 'sequence', order: 'sequence', 密码: 'sequence', 顺序: 'sequence',
    slider: 'adjust', range: 'adjust', scratch: 'reveal', press: 'hold', 'long-press': 'hold', longpress: 'hold', counter: 'accumulate', collect: 'accumulate',
    sort: 'reorder', 'drag-drop': 'drag', dnd: 'drag', paint: 'draw', sketch: 'draw', spotlight: 'follow', flashlight: 'follow', zoom: 'view', animate: 'effect', trigger: 'effect',
});

// 模型常漏掉 rm 前缀的部件名。只在声明了驱动的容器里补，原属性保留。
const ALIASES = ['item', 'slot', 'reset', 'fire', 'part', 'step', 'hold', 'surface', 'cover', 'canvas', 'play', 'reverse', 'prev', 'next', 'answer',
    'toggle', 'pick', 'picked', 'page', 'goto', 'roll', 'end', 'knob', 'stops', 'code', 'show', 'loop'];

const own = (group, selector) => [...group.querySelectorAll(selector)].filter(node => node.closest(GROUP) === group);

function count(group, selector) {
    return own(group, selector).length;
}

// 各类型“这一类写法成立”的最低部件。
export function behaviorTypeFits(group, type) {
    switch (type) {
        case 'effect': case 'view': case 'motion': return count(group, '[data-rm-part]') > 0;
        case 'drag': case 'reorder': return count(group, '[data-rm-item]') > 0;
        case 'adjust': return count(group, 'input[type="range"]') > 0;
        case 'reveal': return count(group, '[data-rm-cover]') > 0;
        case 'input': return count(group, 'output') > 0;
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
        default: return false;
    }
}

// 按部件认类型：越专门的部件越先认。
const INFER_ORDER = ['turn', 'connect', 'roll', 'sequence', 'pager', 'pick', 'toggle', 'hold', 'accumulate', 'draw', 'reveal', 'follow'];
export function inferBehaviorType(group) {
    for (const type of INFER_ORDER) if (behaviorTypeFits(group, type)) return type;
    if (count(group, '[data-rm-part]') && count(group, '[data-rm-fire]')) return 'effect';
    if (count(group, '[data-rm-part]') && count(group, '[data-rm-play], [data-rm-reverse]')) return 'motion';
    if (count(group, '[data-rm-item]')) return count(group, '[data-rm-prev], [data-rm-next]') && !count(group, '[data-rm-slot]') ? 'reorder' : 'drag';
    if (count(group, 'input[type="range"]') === 1) return 'adjust';
    return '';
}

function canonical(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (KNOWN.has(raw)) return raw;
    return SYNONYMS[raw] || SYNONYMS[raw.replace(/[\s_]+/g, '-')] || '';
}

function applyAliases(group) {
    for (const name of ALIASES) {
        for (const node of [group, ...group.querySelectorAll(`[data-${name}]`)]) {
            if (!node.hasAttribute?.(`data-${name}`) || node.hasAttribute(`data-rm-${name}`)) continue;
            node.setAttribute(`data-rm-${name}`, node.getAttribute(`data-${name}`));
        }
    }
}

function mark(group, type, reason) {
    group.setAttribute('data-rm-ui', type);
    group.setAttribute(RECOVERED, reason);
}

// 容器只能放在本面局部：不是外层整面、不是标题、不跨到别的驱动，也不吞掉有自己修复路线的控件。
function safeContainer(root, node, allowed = null) {
    if (!node || node === root || !root.contains(node) || node.closest(UI)) return false;
    if (node.matches('toto, details, summary, body, html') || node.closest('summary')) return false;
    if (!node.closest('details')) return false;
    for (const inner of node.querySelectorAll('input[type="range"], input[type="checkbox"], input[type="radio"], details, label[for], [data-rm-ui], [data-rm-released]')) {
        if (allowed?.contains(inner)) continue;
        return false;
    }
    return true;
}

function commonAncestor(nodes) {
    const list = nodes.filter(Boolean);
    if (!list.length) return null;
    for (let node = list[0].parentElement; node; node = node.parentElement) {
        if (list.every(item => node.contains(item))) return node;
    }
    return null;
}

const orphan = (root, selector) => [...root.querySelectorAll(selector)].filter(node => !node.closest(GROUP) && !node.closest(UI));
const keysOf = (nodes, attr) => new Set(nodes.map(node => String(node.getAttribute(attr) || '').trim()).filter(Boolean));
function showTokens(node) {
    return String(node.getAttribute('data-rm-show') || '').split(/[\s,，、]+/).map(token => token.replace(/^!/, '')).filter(Boolean);
}

// 一类部件的“同伙”：选项对应的显示内容、翻页按钮等，容器要把它们一起包住。
function companions(root, type, markers) {
    if (type === 'pick') {
        const keys = keysOf(markers, 'data-rm-pick');
        return orphan(root, '[data-rm-show]').filter(node => showTokens(node).some(token => keys.has(token)));
    }
    if (type === 'roll') return orphan(root, '[data-rm-show]');
    if (type === 'pager') return orphan(root, '[data-rm-prev], [data-rm-next], [data-rm-goto]');
    if (type === 'toggle') {
        const keys = new Set(markers.map(node => String(node.getAttribute('data-rm-toggle') || '').trim() || 'on'));
        return orphan(root, '[data-rm-show]').filter(node => showTokens(node).some(token => keys.has(token)));
    }
    return [];
}

const ORPHAN_SETS = [
    ['connect', '[data-rm-end]', 2], ['roll', '[data-rm-roll]', 1], ['sequence', '[data-rm-code]', 1],
    ['pager', '[data-rm-page]', 2], ['pick', '[data-rm-pick]', 1], ['accumulate', '[data-rm-step]', 1],
];
const ORPHAN_SINGLES = [['turn', '[data-rm-knob]'], ['toggle', '[data-rm-toggle]'], ['hold', '[data-rm-hold]'], ['draw', 'svg[data-rm-canvas]']];

// 声明了却对不上的容器：部件若在容器外，把容器扩到同时包住两者的最近一层。
function expandDeclared(root, group) {
    for (const [type, selector, minimum] of [...ORPHAN_SETS, ...ORPHAN_SINGLES.map(([name, sel]) => [name, sel, 1])]) {
        const markers = orphan(root, selector);
        if (!markers.length) continue;
        const scope = commonAncestor([group, ...markers]);
        if (!scope || !safeContainer(root, scope, group)) continue;
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
        if (markers.length < minimum) continue;
        const scope = commonAncestor([...markers, ...companions(root, type, markers)]);
        if (!scope || !safeContainer(root, scope)) continue;
        mark(scope, type, 'orphan');
        made++;
    }
    for (const [type, selector] of ORPHAN_SINGLES) {
        for (const marker of orphan(root, selector)) {
            if (marker.closest(GROUP)) continue;
            const scope = commonAncestor([marker, ...companions(root, type, [marker])]);
            const container = scope === marker ? marker.parentElement : scope;
            if (!container || !safeContainer(root, container)) continue;
            mark(container, type, 'orphan');
            made++;
        }
    }
    return made;
}

export function repairBehaviorDeclarations(root) {
    if (!root?.querySelectorAll) return 0;
    let repaired = 0;
    for (const node of root.querySelectorAll('[data-ui]:not([data-rm-ui])')) {
        if (node.closest(UI)) continue;
        const type = canonical(node.getAttribute('data-ui'));
        if (type) node.setAttribute('data-rm-ui', type);
    }
    const declared = [...(root.matches?.(GROUP) ? [root] : []), ...root.querySelectorAll(GROUP)].filter(node => !node.closest(UI));
    for (const group of declared) applyAliases(group);
    for (const group of declared) {
        if (!group.isConnected && group !== root) continue;
        const written = String(group.getAttribute('data-rm-ui') || '');
        const type = canonical(written);
        if (type === 'scroll') continue;
        if (type && behaviorTypeFits(group, type)) {
            if (type !== written) { mark(group, type, 'type'); repaired++; }
            continue;
        }
        const inferred = inferBehaviorType(group);
        if (inferred) { mark(group, inferred, 'type'); repaired++; continue; }
        if (expandDeclared(root, group)) { repaired++; continue; }
        // 写了 toggle 却没标开关：整个容器就是开关。
        if (type === 'toggle' && type !== written) { mark(group, type, 'type'); repaired++; }
    }
    repaired += adoptOrphans(root);
    return repaired;
}
