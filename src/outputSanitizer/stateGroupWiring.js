// 两类「CSS 写了状态、却没人去切」的写法（模型没写脚本）：
//   1. 一组互斥的卡片（.卡片{display:none} .卡片.active{display:block}，默认一张带着 active），
//      旁边一排数目相同的可点的东西（按钮，或 cursor:pointer 的圆点、标签），或者一根滑杆：
//      点第几个就只亮第几张；滑杆按值所在的那一段亮对应那张（0–360 六张就是每 60 一张）。
//   2. 动画状态（.骰子.rolling{animation:…}）：旁边一个闲着的按钮，按一下让它们动一会儿（不常驻、不无限晃）。
//   3. 一列可点的条目，其中一条带着高亮状态（歌单 .曲目.active、目录、选项卡）：点哪条亮哪条；
//      旁边的「上一首／下一首」（❮ ❯）按顺序挪；显示「正在播放」的那行字跟着换成选中那条的名字。
//   4. 开关属性（.播放器[data-playing="true"] 写了样式，元素上默认 data-playing="false"）：
//      旁边一个闲着的播放／暂停按钮，按一下切换（▶ 和 ❚❚ 跟着换）。
// 都只在能一一对上时才接，对不上不猜；接过的元素记在 WeakSet 里，复制出来的新节点重新接。
import { innerButtonIsFree } from './orphanStateWiring.js?rmv=1.79.5';

const GROUP_ATTR = 'data-rm-state-group';
const PULSE_ATTR = 'data-rm-pulse-trigger';
const SELECT_ATTR = 'data-rm-select-item';
const STEP_ATTR = 'data-rm-select-step';
const FLAG_ATTR = 'data-rm-flag-toggle';
const WIRED = new WeakSet();
const PULSE_STATE = /(?:^|-)(?:rolling|spinning|rotating|tossing|shuffling)$/i;
// 按钮的字得像「掷、摇、转、抽、洗」这类，别的按钮（下一步、提交）不拿来让东西动。
const PULSE_BUTTON = /[掷擲摇搖转轉抽洗投甩丢丟旋]|roll|spin|toss|shuffle|draw/i;

function view(node) { return node.ownerDocument?.defaultView || globalThis; }
function css(node) { try { return view(node).getComputedStyle(node); } catch { return null; } }
function shown(node) { const style = css(node); return !!style && style.display !== 'none' && style.visibility !== 'hidden'; }
function selectorFor(base) { return '.' + base.split('.').map(name => CSS.escape(name)).join('.'); }
// 自己定义了手形光标的才算（子元素继承来的不算，只取最外层那个）。
function clickable(node) {
    if (node.matches('button, [role="button"]')) return true;
    if (css(node)?.cursor !== 'pointer') return false;
    const parent = node.parentElement;
    return !parent || css(parent)?.cursor !== 'pointer';
}
const FAILED = new WeakMap();
function hiddenWithout(node, state) {
    const had = node.classList.contains(state);
    if (had) node.classList.remove(state);
    const hidden = !shown(node);
    if (had) node.classList.add(state);
    return hidden;
}

function select(targets, state, index) {
    targets.forEach((target, at) => target.classList.toggle(state, at === index));
}

function wireExclusiveGroup(root, base, state, skip) {
    let targets;
    try { targets = [...root.querySelectorAll(selectorFor(base))]; } catch { return 0; }
    if (targets.length < 2 || targets.length > 12 || targets.some(target => WIRED.has(target) || skip(target))) return 0;
    // 状态类只出现在这组卡片上，最多一张带着；摘掉状态类后每张都藏着（真正的「只亮一张」）。
    let withState = [];
    try { withState = [...root.querySelectorAll('.' + CSS.escape(state))]; } catch { return 0; }
    const extra = withState.filter(node => !targets.includes(node));
    if (withState.length - extra.length > 1) return 0;
    if (!targets.every(target => hiddenWithout(target, state))) return 0;
    const inTargets = node => targets.some(target => target.contains(node));
    let wired = 0;
    // 一排可点的东西：同一个类、个数和卡片一样、不在卡片里。
    const groups = new Map();
    for (const node of root.querySelectorAll('*')) {
        if (inTargets(node) || node.closest('summary, label, [data-rabbit-mirror-tool-entry-host]') || !clickable(node) || !shown(node)) continue;
        if (node.matches('input, select, textarea, a, details')) continue;
        // 按去掉状态类以后的整串类名分组（「active dot」和「dot」算一组）。
        const key = [...node.classList].find(name => name !== state) || '';
        if (!key) continue;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(node);
    }
    const matching = [...groups.values()].filter(list => list.length === targets.length && list.every(node => !list.some(other => other !== node && other.contains(node))));
    // 带状态类的别的东西只能是这排圆点自己（轮播里亮着的那个点）。
    if (extra.some(node => !(matching.length === 1 && matching[0].includes(node)))) return 0;
    if (matching.length === 1 && matching[0].every(node => innerButtonIsFree(node))) {
        const dots = matching[0];
        matching[0].forEach((node, index) => {
            node.setAttribute(GROUP_ATTR, state);
            if (!node.matches('button')) { node.setAttribute('role', 'button'); node.setAttribute('tabindex', '0'); }
            const pick = event => {
                if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault?.();
                select(targets, state, index);
                if (extra.length) select(dots, state, index);
            };
            node.addEventListener('click', pick);
            node.addEventListener('keydown', pick);
        });
        wired += 1;
    }
    // 一根没人管的滑杆：按值落在第几段亮第几张。
    const ranges = [...root.querySelectorAll('input[type="range"]')].filter(input => !inTargets(input) && !input.closest('label, [data-rabbit-mirror-tool-entry-host]'));
    // 至少三张卡才拿滑杆来分段（两张太容易碰巧对上）；别的滑杆修复已经接过的不抢。
    if (ranges.length === 1 && targets.length >= 3) {
        const range = ranges[0];
        const busy = [...range.attributes].some(attr => /^(?:on\w+|list)$/.test(attr.name)
            || (/^data-rm-/.test(attr.name) && !/^data-rm-(?:press|polish[\w-]*|body-contained|state-group)$/.test(attr.name))
            || /^data-rabbit-mirror-range/.test(attr.name));
        if (!busy) {
            const min = Number(range.min || 0); const max = Number(range.max || 100);
            if (Number.isFinite(min) && Number.isFinite(max) && max > min) {
                range.setAttribute(GROUP_ATTR, state);
                const follow = () => {
                    const ratio = (Number(range.value) - min) / (max - min);
                    select(targets, state, Math.max(0, Math.min(targets.length - 1, Math.floor(ratio * targets.length))));
                };
                range.addEventListener('input', follow);
                range.addEventListener('change', follow);
                wired += 1;
            }
        }
    }
    if (wired) targets.forEach(target => WIRED.add(target));
    return wired;
}

// ——— 3. 一列条目里亮着一条 ———
const PREV_TEXT = /^(?:[❮‹«◀◁◄⏮←<]|上一[首曲页张个条]?|前一[首曲页张个条]?|prev(?:ious)?|back)$/i;
const NEXT_TEXT = /^(?:[❯›»►⏭→>]|下一[首曲页张个条]?|后一[首曲页张个条]?|next|forward)$/i;
const PREV_NAME = /(?:^|[\s_-])prev(?:ious)?(?=$|[\s_\d-])|[a-z]Prev(?:ious)?(?![a-z])/i;
const NEXT_NAME = /(?:^|[\s_-])next(?=$|[\s_\d-])|[a-z]Next(?![a-z])/i;
// 接过的上一首／下一首：一对按钮只给一列接（同一面里有两列高亮时不各挪一格）。按节点记，克隆出来的新节点重新接。
const STEPPERS = new WeakSet();
function nameOf(node) { return `${node.id || ''} ${[...node.classList].join(' ')} ${node.getAttribute('aria-label') || ''}`; }
function stepDirection(node) {
    const text = String(node.textContent || '').replace(/\s+/g, '');
    if (PREV_TEXT.test(text) || PREV_NAME.test(nameOf(node))) return -1;
    if (NEXT_TEXT.test(text) || NEXT_NAME.test(nameOf(node))) return 1;
    return 0;
}
// 条目的名字：条目里类名带 name／title 的那块字；没有就不跟着换「正在播放」。
function itemName(item) {
    const named = [...item.querySelectorAll('*')].find(node => [...node.classList].some(name => /(?:^|-)(?:name|title)$/i.test(name)));
    return String(named?.textContent || '').trim();
}
// 「正在播放」那一行里装着名字的那个文字节点（只换这一段字，旁边的图标、子元素不动）。
function nameTextNode(display, name) {
    const walker = display.ownerDocument.createTreeWalker(display, 4);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) if (String(node.nodeValue || '').includes(name)) return node;
    return null;
}
function wireSelectionList(root, base, state, skip) {
    let items;
    try { items = [...root.querySelectorAll(selectorFor(base))]; } catch { return 0; }
    if (items.length < 2 || items.length > 30 || items.some(item => WIRED.has(item) || skip(item))) return 0;
    const parent = items[0].parentElement;
    if (!items.every(item => item.parentElement === parent)) return 0;
    const lit = items.filter(item => item.classList.contains(state));
    if (lit.length !== 1) return 0;
    // 状态类只是高亮：摘掉以后还看得见（会藏起来的是第 1 类「只亮一张」，不归这里）。
    if (items.some(item => hiddenWithout(item, state) || !shown(item))) return 0;
    // 条目自己已经被别的修复接成按钮（选项卡、圆点）：点条目照它们的来，这里只接上一首／下一首，挪的时候点那一条。
    const owned = items.every(item => item.hasAttribute(GROUP_ATTR) || item.hasAttribute('data-rm-sibling-tab'));
    if (!owned && !items.every(item => clickable(item) && innerButtonIsFree(item) && !item.querySelector('button, a, input, select, textarea, [role="button"]'))) return 0;
    const startIndex = items.indexOf(lit[0]);
    let current = startIndex;
    // 「正在播放」那行：条目外面、字里含着亮着那条的名字、字不长的那一块（取最里层）。
    const startName = itemName(lit[0]);
    let display = null;
    if (startName && !owned) {
        const candidates = [...root.querySelectorAll('*')].filter(node => !items.some(item => item.contains(node) || node.contains(item))
            && !node.closest('summary, style, script, [data-rabbit-mirror-tool-entry-host]')
            && String(node.textContent || '').includes(startName) && String(node.textContent || '').trim().length <= startName.length + 12
            && ![...node.children].some(child => String(child.textContent || '').includes(startName)));
        if (candidates.length === 1) display = candidates[0];
    }
    const textNode = display ? nameTextNode(display, startName) : null;
    const startText = textNode ? String(textNode.nodeValue || '') : '';
    // 上一首／下一首：这一面里闲着的、各只有一个，还没给别的列接过。
    const steppers = [...root.querySelectorAll('button, [role="button"], *')].filter(node => !STEPPERS.has(node) && !items.some(item => item.contains(node))
        && !node.closest('summary, [data-rabbit-mirror-tool-entry-host]') && (node.matches('button, [role="button"]') || clickable(node))
        && innerButtonIsFree(node) && !node.querySelector('button, [role="button"]') && !node.hasAttribute(GROUP_ATTR) && stepDirection(node) !== 0);
    const prev = steppers.filter(node => stepDirection(node) < 0);
    const next = steppers.filter(node => stepDirection(node) > 0);
    const stepPairs = [[prev, -1], [next, 1]].filter(([list]) => list.length === 1);
    // 只有「当前位置」高亮、旁边没有上一首／下一首，也没有跟着换的那行字：可能只是静态的导航标记，不接。
    if (!stepPairs.length && !textNode) return 0;
    const select = index => {
        current = (index + items.length) % items.length;
        items.forEach((item, at) => item.classList.toggle(state, at === current));
        if (textNode) {
            const name = itemName(items[current]);
            if (name) {
                let text = startText.replace(startName, name);
                // 「1. 名字」这类前面的序号也跟着换。
                const number = /^(\s*)(\d+)(?=\s*[.、:：\s])/.exec(startText);
                if (number && Number(number[2]) === startIndex + 1) text = text.replace(/^(\s*)\d+/, `$1${current + 1}`);
                textNode.nodeValue = text;
            }
        }
    };
    if (!owned) {
        items.forEach((item, index) => {
            item.setAttribute(SELECT_ATTR, state);
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            const pick = event => {
                if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
                if (event.type === 'keydown') event.preventDefault?.();
                select(index);
            };
            item.addEventListener('click', pick);
            item.addEventListener('keydown', pick);
        });
    }
    for (const [list, delta] of stepPairs) {
        const button = list[0];
        STEPPERS.add(button);
        button.setAttribute(STEP_ATTR, String(delta));
        if (!button.matches('button')) { button.setAttribute('role', 'button'); button.setAttribute('tabindex', '0'); }
        const move = event => {
            if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault?.();
            // 点要去的那一条：条目上接着的处理（换页、换内容、上面的高亮）都照常走。
            const at = items.findIndex(item => item.classList.contains(state));
            items[((at < 0 ? current : at) + delta + items.length) % items.length].click();
        };
        button.addEventListener('click', move);
        button.addEventListener('keydown', move);
    }
    items.forEach(item => WIRED.add(item));
    return 1;
}

// ——— 4. 开关属性 ———
const PLAY_TEXT = /^(?:[▶►▷⏯⏵⏸❚‖|]+|❚❚|播放|暂停|play|pause)$/i;
const PLAY_NAME = /play|pause|toggle/i;
function flagRules(root) {
    const flags = new Map();
    for (const style of root.querySelectorAll('style')) {
        const text = String(style.textContent || '');
        for (const match of text.matchAll(/\[\s*(data-[\w-]+)\s*=\s*["']?(true|false)["']?\s*\]/gi)) {
            const name = match[1].toLowerCase();
            if (/^data-(?:rm|rabbit-mirror)-/.test(name)) continue;
            flags.set(name, true);
        }
    }
    return flags;
}
function wireFlagToggles(root, skip) {
    let wired = 0;
    for (const name of flagRules(root).keys()) {
        let hosts;
        try { hosts = [...root.querySelectorAll(`[${name}]`)].filter(node => /^(?:true|false)$/i.test(node.getAttribute(name) || '')); } catch { continue; }
        if (hosts.length !== 1 || WIRED.has(hosts[0]) || skip(hosts[0])) continue;
        const host = hosts[0];
        const buttons = [...host.querySelectorAll('button, [role="button"], *')].filter(node => (node.matches('button, [role="button"]') || clickable(node))
            && !node.querySelector('button, [role="button"]') && innerButtonIsFree(node)
            && (PLAY_TEXT.test(String(node.textContent || '').replace(/\s+/g, '')) || PLAY_NAME.test(nameOf(node)))
            && !node.hasAttribute(STEP_ATTR) && !node.hasAttribute(SELECT_ATTR));
        if (buttons.length !== 1) continue;
        const button = buttons[0];
        // 名字得对得上：属性是 playing／play 这类，按钮就得是播放键；别的开关属性（open、on）按钮名字里也得有。
        const word = name.replace(/^data-/, '').replace(/-/g, '');
        if (!/play/i.test(word) && !new RegExp(word, 'i').test(nameOf(button))) continue;
        button.setAttribute(FLAG_ATTR, name);
        if (!button.matches('button')) { button.setAttribute('role', 'button'); button.setAttribute('tabindex', '0'); }
        const symbol = String(button.textContent || '').trim();
        const flip = event => {
            if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault?.();
            const on = String(host.getAttribute(name)).toLowerCase() !== 'true';
            host.setAttribute(name, on ? 'true' : 'false');
            // 按钮上只有一个播放／暂停符号时跟着换。
            if (/^[▶►▷⏵]$/.test(symbol)) button.textContent = on ? '❚❚' : symbol;
            else if (/^(?:⏸|❚❚)$/.test(symbol)) button.textContent = on ? symbol : '▶';
        };
        button.addEventListener('click', flip);
        button.addEventListener('keydown', flip);
        WIRED.add(host);
        wired += 1;
    }
    return wired;
}

function hasAnimationRule(root, base, state) {
    const compound = selectorFor(base) + '.' + CSS.escape(state);
    for (const style of root.querySelectorAll('style')) {
        const text = String(style.textContent || '');
        for (const match of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
            if (/animation(?:-name)?\s*:/.test(match[2]) && match[1].split(',').some(selector => selector.trim().split(/[\s>+~]+/).pop()?.replace(/\\/g, '') === compound.replace(/\\/g, ''))) return true;
        }
    }
    return false;
}

function wirePulse(root, base, state, skip) {
    let targets;
    try { targets = [...root.querySelectorAll(selectorFor(base))]; } catch { return 0; }
    if (!targets.length || targets.length > 6 || targets.some(target => WIRED.has(target) || skip(target) || target.classList.contains(state))) return 0;
    if (!hasAnimationRule(root, base, state)) return 0;
    // 往外最多找三层，找到一层里正好一个闲着的按钮（不在骰子里）。
    let scope = targets[0].parentElement;
    while (scope && !targets.every(target => scope.contains(target))) scope = scope.parentElement;
    for (let level = 0; scope && level < 3; level += 1, scope = scope.parentElement) {
        if (scope === root.parentElement) break;
        const buttons = [...scope.querySelectorAll('button, [role="button"]')].filter(button => !targets.some(target => target.contains(button)) && shown(button) && button.getClientRects().length);
        if (!buttons.length) continue;
        if (buttons.length !== 1 || !innerButtonIsFree(buttons[0])) return 0;
        const button = buttons[0];
        if (!PULSE_BUTTON.test(String(button.textContent || '')) || button.hasAttribute('data-rm-orphan-state-trigger') || button.hasAttribute(GROUP_ATTR)) return 0;
        button.setAttribute(PULSE_ATTR, state);
        let timer = 0;
        button.addEventListener('click', () => {
            targets.forEach(target => target.classList.add(state));
            clearTimeout(timer);
            timer = setTimeout(() => targets.forEach(target => target.classList.remove(state)), 900);
        });
        targets.forEach(target => WIRED.add(target));
        return 1;
    }
    return 0;
}

const EXCLUSIVE_STATE = /(?:^|-)(?:active|current|cur|playing|selected|show|shown|visible|on|open|opened|chosen|picked|highlighted|focused)$/i;
function statePairs(root) {
    const pairs = new Map();
    for (const style of root.querySelectorAll('style')) {
        const text = String(style.textContent || '').replace(/\{[^{}]*\}/g, '{}');
        for (const selector of text.split(/[{},]/)) {
            const tail = selector.trim().split(/[\s>+~]+/).pop() || '';
            if (/[:[]/.test(tail)) continue;
            const classes = [...tail.matchAll(/\.([\w-]+)/g)].map(match => match[1]);
            if (classes.length < 2) continue;
            const state = classes[classes.length - 1];
            if (!PULSE_STATE.test(state) && !EXCLUSIVE_STATE.test(state)) continue;
            const base = classes.slice(0, -1).join('.');
            if (!pairs.has(base)) pairs.set(base, new Set());
            pairs.get(base).add(state);
        }
    }
    return pairs;
}

// skip(target)：别的接线已经管着的（孤立状态开关接过的）不再接。
export function wireStateGroups(root, skip = () => false) {
    if (!root?.querySelectorAll) return 0;
    // 这一面样式和节点数都没变、上次什么都没接上：不再重算一遍。
    const key = `${[...root.querySelectorAll('style')].reduce((sum, style) => sum + String(style.textContent || '').length, 0)}:${root.getElementsByTagName('*').length}`;
    if (FAILED.get(root) === key) return 0;
    const pairs = statePairs(root);
    let wired = 0;
    for (const [base, states] of pairs) {
        for (const state of states) {
            try {
                wired += PULSE_STATE.test(state) ? wirePulse(root, base, state, skip)
                    : (wireExclusiveGroup(root, base, state, skip) || wireSelectionList(root, base, state, skip));
            } catch { /* 对不上就不接 */ }
        }
    }
    try { wired += wireFlagToggles(root, skip); } catch { /* 对不上就不接 */ }
    if (!wired) FAILED.set(root, key); else FAILED.delete(root);
    return wired;
}
