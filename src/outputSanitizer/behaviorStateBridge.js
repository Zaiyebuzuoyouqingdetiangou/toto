// 状态桥：驱动把状态写在区域（data-rm-ui）自己身上——开关的 data-rm-on、按住的 data-rm-active、翻页的 data-rm-index……
// 模型的 CSS 却常把状态条件写在别的位置：
//   [data-rm-ui="hold"] [data-rm-active="true"] .原图层   （状态在区域「里面」的某一层上）
//   [data-rm-on~="unsealed"] .抽屉                         （抽屉在开关区域「外面」，状态得在同时包着两者的那一层上）
//   [data-rm-ui="toggle"] .灯[data-rm-on~="on"]            （状态在里面那个元素自己身上）
// 以前这类写法一种认一次，碰到新变种又要改代码。这里统一处理：读本面 CSS，找出每条「状态条件」写在哪个位置、
// 管着哪些元素，算出 CSS 期望状态落在哪个元素（载体）上；驱动没写在那里的，状态一变就同步过去。
// 只同步驱动写在区域上的那几个状态属性，值原样照抄，不猜内容；载体上模型原本写的值保留，自己写的记在 data-rm-bridged 上，撤时只撤自己的。
import { behaviorStyleText, behaviorStyleStamp } from './behaviorStateMirror.js?rmv=1.73.5';

const GROUP = '[data-rm-ui]';
const CONTROLS = '[data-rm-step], [data-rm-pick], [data-rm-toggle], [data-rm-goto], [data-rm-item], [data-rm-card], [data-rm-end], [data-rm-code], [data-rm-fire], [data-rm-hold]';
const TOOL_CHROME = '[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-diagnostic-panel], [data-rm-mobile-controls]';
export const BRIDGED_ATTR = 'data-rm-bridged';

// 各类区域由驱动写在区域自己身上的状态属性（写在按钮、步骤、物件上的不在此列，那些另有镜像）。
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
// 空格分隔的词表（几个区域写同一个载体时合并）；data-rm-seq 是按下顺序、可以重复，原样照抄。
const TOKEN_ATTRS = new Set(['data-rm-on', 'data-rm-swiped-left', 'data-rm-swiped-right', 'data-rm-peeking']);
const ALL_ATTRS = new Set(Object.values(GROUP_STATE_ATTRS).flat());
const STATE_ATTR = /\[\s*(data-rm-(?:on|picked|index|angle-turned|active|match|seq|miss|done|swiped-left|swiped-right|peeking))\s*(?:([~|^$*]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\s*\]/g;
const PSEUDO = /::?[\w-]+(?:\([^()]*\))?/g;

// 把选择器拆成「复合选择器 + 它前面的组合符」；方括号和括号里的空格不算。
function tokenize(selector) {
    const parts = [];
    let depth = 0, current = '', combinator = '';
    for (const char of selector) {
        if (char === '[' || char === '(') depth += 1;
        if (char === ']' || char === ')') depth = Math.max(0, depth - 1);
        if (!depth && /[\s>+~]/.test(char)) {
            if (current) { parts.push({ compound: current, combinator }); current = ''; combinator = ''; }
            if (!/\s/.test(char)) combinator = char; else if (!combinator) combinator = ' ';
            continue;
        }
        current += char;
    }
    if (current) parts.push({ compound: current, combinator });
    return parts;
}
const join = (parts, lead = false) => parts.map((part, index) => {
    const combinator = index === 0 && !lead ? '' : (part.combinator === ' ' || !part.combinator ? ' ' : ` ${part.combinator} `);
    return `${combinator}${part.compound}`;
}).join('');
const clean = text => String(text || '').replace(PSEUDO, '').trim();

// 本面 CSS 里所有「状态条件写在某个位置」的规则，按 root 缓存（样式文本变了就重读）。
const ruleCache = new WeakMap();
export function stateEntries(root) {
    const text = behaviorStyleText(root);
    const cached = ruleCache.get(root);
    if (cached?.text === text) return cached.entries;
    const entries = [];
    for (const match of text.matchAll(/([^{}@;]+)\{/g)) {
        for (const raw of match[1].split(',')) {
            // :not([状态]) 当成状态条件本身看（CSS 期望的位置一样）；别的带括号的选择器不认。
            const selector = raw.replace(/:not\(\s*(\[[^\]]*\])\s*\)/g, '$1').trim();
            if (!selector || selector.includes('(')) continue;
            const parts = tokenize(selector);
            parts.forEach((part, index) => {
                // 记下 CSS 要的是哪个词（~="item1"、="2"）：词表属性只把这些词同步过去，别把区域上别的词也带到载体上（会误触载体下别的规则）。
                const attrs = [];
                for (const item of part.compound.matchAll(STATE_ATTR)) {
                    if (!ALL_ATTRS.has(item[1])) continue;
                    const value = item[2] === '~=' || item[2] === '=' ? String(item[3] ?? item[4] ?? item[5] ?? '').trim() : null;
                    attrs.push({ name: item[1], value: value || null });
                }
                if (!attrs.length) return;
                const base = clean(part.compound.replace(STATE_ATTR, ''));
                const head = parts.slice(0, index);
                const tail = parts.slice(index + 1);
                if ((!base || base === '*') && !tail.length) return; // 「某个在这个状态里的元素」自己：认不出是谁
                const carrierSelector = clean(head.length ? `${join(head)}${join([{ compound: base || '*', combinator: part.combinator }], true)}` : (base || '*'));
                const tailSelector = tail.length ? ` ${clean(join(tail, true))}` : ''; // 开头留一个空格：接在载体选择器、:scope 后面
                if (!carrierSelector || (tail.length && tailSelector.trim() === '')) return;
                entries.push({ attrs, carrierSelector, tailSelector, fullSelector: clean(`${carrierSelector}${tailSelector}`) });
            });
        }
    }
    ruleCache.set(root, { text, entries });
    return entries;
}

const matches = (node, selector) => { try { return node.matches(selector); } catch { return false; } };
const queryAll = (node, selector) => { try { return [...node.querySelectorAll(selector)]; } catch { return []; } };
function tailReaches(carrier, tailSelector, target) {
    if (!tailSelector) return carrier === target;
    return queryAll(carrier, `:scope${tailSelector}`).includes(target);
}
function faceScope(group, root) {
    let scope = group.closest('details') || null;
    if (!scope || !root.contains(scope)) return root;
    for (let outer = scope.parentElement?.closest?.('details'); outer && root.contains(outer); outer = outer.parentElement?.closest?.('details')) scope = outer;
    return scope;
}

// 这个区域的载体：[{ node, attr, inside }]。inside：载体在区域里面（由桥全权写），否则在区域外面（和模型原值、别的区域合写）。
const carrierCache = new WeakMap();
export function collectStateCarriers(root, group) {
    if (!root?.querySelectorAll || !group?.getAttribute) return [];
    const attrs = GROUP_STATE_ATTRS[group.getAttribute('data-rm-ui')] || [];
    if (!attrs.length) return []; // 拖放、揭示这些类型的状态不写在区域上，没有要桥的
    // 每次状态变化都会来（拖动时每个 pointermove 都算）：先比样式的廉价指纹，没变就直接用缓存，不重新拼样式文本。
    const stamp = behaviorStyleStamp(root);
    const cached = carrierCache.get(group);
    if (cached?.stamp === stamp) return cached.list;
    const text = behaviorStyleText(root);
    if (cached?.text === text) { cached.stamp = stamp; return cached.list; }
    const list = [];
    if (text.includes('data-rm-')) {
        const scope = faceScope(group, root);
        // 区域里的控件（按钮、步骤、物件…）：只包着其中一部分的那一层是「每一项自己的卡片」，状态由部件镜像（桥四）按项写，不归这里。
        const controls = [...group.querySelectorAll(CONTROLS)].filter(node => node.closest(GROUP) === group);
        const perItemCard = node => { const held = controls.filter(control => node.contains(control)); return held.length > 0 && held.length < controls.length; };
        // 别的区域里面的元素归那个区域管（包着本区域的外层区域除外）。
        const foreign = node => { const owner = node.closest(GROUP); return Boolean(owner && owner !== group && !owner.contains(group)); };
        const usable = node => node && node !== group && node.nodeType === 1 && !node.matches(GROUP) && !node.closest(TOOL_CHROME) && !foreign(node)
            && !node.matches('summary, button, input, select, textarea, [data-rm-hold], [data-rm-step], [data-rm-item], [data-rm-part], [data-rm-knob]')
            && !(group.contains(node) && perItemCard(node));
        // values：这个载体上这个属性 CSS 点名要的词；null 表示整个值照抄。
        const add = (node, attr, inside, value) => {
            if (!usable(node)) return;
            const have = list.find(item => item.node === node && item.attr === attr);
            if (!have) { list.push({ node, attr, inside, values: value === null ? null : new Set([value]) }); return; }
            if (have.values && value !== null) have.values.add(value); else have.values = null;
        };
        for (const entry of stateEntries(root)) {
            const wanted = entry.attrs.filter(item => attrs.includes(item.name));
            if (!wanted.length) continue;
            // 区域自己就在 CSS 写的位置上、管的内容也在区域里：标准写法，不用桥。
            if (matches(group, entry.carrierSelector) && (!entry.tailSelector || queryAll(group, `:scope${entry.tailSelector}`).length)) continue;
            const carriers = [];
            if (!entry.tailSelector) {
                // 状态写在被样式化的元素自己身上（.灯[data-rm-on~="on"]）：里面的全算；外面的只认全面唯一的那个。
                const candidates = queryAll(scope, entry.carrierSelector).filter(usable);
                const inside = candidates.filter(node => group.contains(node));
                if (inside.length) carriers.push(...inside.map(node => ({ node, inside: true })));
                else if (candidates.length === 1) carriers.push({ node: candidates[0], inside: false });
            } else {
                const targets = queryAll(scope, entry.fullSelector).filter(node => !node.closest(TOOL_CHROME)
                    && (!node.closest(GROUP) || node.closest(GROUP) === group || node.closest(GROUP).contains(group)));
                for (const target of targets) {
                    let picked = null;
                    for (let node = target.parentElement; node && node !== scope.parentElement; node = node.parentElement) {
                        if (node === group) { if (picked) break; continue; } // 区域自己不是载体（上面已经验过），继续往外找
                        const fits = matches(node, entry.carrierSelector) && tailReaches(node, entry.tailSelector, target);
                        if (group.contains(node)) { if (fits && usable(node)) picked = node; continue; } // 里面的取最靠近区域的那一层
                        if (node.contains(group)) { if (fits) { if (usable(node)) picked = node; break; } continue; } // 外面的取最低的那一层；是别的区域就不碰
                        // 既不在区域里也不包着区域：只是目标自己的外层，继续往上找公共祖先
                    }
                    // 载体既不在区域里也不包着区域（.面板[data-rm-picked="a"] .a，面板和选择区并排）：全面只有这一个能当载体时才认。
                    if (!picked) {
                        const lone = queryAll(scope, entry.carrierSelector).filter(node => usable(node) && !group.contains(node) && !node.contains(group));
                        if (lone.length === 1 && tailReaches(lone[0], entry.tailSelector, target)) picked = lone[0];
                    }
                    if (picked) carriers.push({ node: picked, inside: group.contains(picked) });
                }
            }
            for (const { node, inside } of carriers) for (const item of wanted) add(node, item.name, inside, item.value);
        }
    }
    carrierCache.set(group, { stamp, text, list });
    return list;
}

// —— 写入：载体上模型原本的值保留，自己写的记在 data-rm-bridged 上；几个区域写同一个载体时各记各的 ——
// 记号格式：`属性=自己写的|模型原值`（都经 encodeURIComponent；没有原值就没有「|」那段）。
// 存档带回来时按记号还原：词表属性去掉自己写的词，标量属性还是自己写的值就换回原值。
const owners = new WeakMap();    // node → Map<attr, Map<owner, value>>
const originals = new WeakMap(); // node → Map<attr, 模型原值（null 表示原本没有）>
const tokens = value => String(value ?? '').split(/\s+/).filter(Boolean);
const decode = text => { try { return decodeURIComponent(text); } catch { return ''; } };
function bridgedOf(node) {
    const map = new Map();
    for (const item of tokens(node.getAttribute(BRIDGED_ATTR))) {
        const at = item.indexOf('=');
        if (at <= 0) continue;
        const rest = item.slice(at + 1);
        const bar = rest.indexOf('|');
        map.set(item.slice(0, at), { mine: decode(bar >= 0 ? rest.slice(0, bar) : rest), orig: bar >= 0 ? decode(rest.slice(bar + 1)) : null });
    }
    return map;
}
function writeBridged(node, map) {
    const text = [...map].filter(([, item]) => item && item.mine !== '').map(([attr, item]) =>
        `${attr}=${encodeURIComponent(item.mine)}${item.orig === null ? '' : `|${encodeURIComponent(item.orig)}`}`).join(' ');
    if (text) node.setAttribute(BRIDGED_ATTR, text); else node.removeAttribute(BRIDGED_ATTR);
}
// 第一次碰到这个载体的这个属性时记下模型原值：现在的值去掉上次（存档带回来的记号）自己写的那份。
function originalOf(node, attr, bridged) {
    if (!originals.has(node)) originals.set(node, new Map());
    const map = originals.get(node);
    if (map.has(attr)) return map.get(attr);
    const current = node.getAttribute(attr);
    const mark = bridged.get(attr);
    let orig;
    if (TOKEN_ATTRS.has(attr)) {
        const mine = new Set(tokens(mark?.mine));
        const base = tokens(current).filter(token => !mine.has(token));
        orig = base.length ? base.join(' ') : null;
    } else orig = mark && current === mark.mine ? mark.orig : current;
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
        for (const value of contributions) for (const token of tokens(value)) if (!merged.includes(token)) merged.push(token);
        next = merged.length ? merged.join(' ') : null;
        mine = merged.filter(token => !base.includes(token)).join(' ');
    } else {
        next = contributions.length ? contributions[contributions.length - 1] : orig;
        mine = contributions.length && next !== orig ? next : '';
    }
    if (next === null) { if (current !== null) node.removeAttribute(attr); }
    else if (current !== next) node.setAttribute(attr, next);
    if (mine) bridged.set(attr, { mine, orig }); else bridged.delete(attr);
    writeBridged(node, bridged);
}

/**
 * 以某个「主人」（通常是区域元素）的名义把一个状态值写到载体上；value 为 null 表示撤回自己那份。
 * 方言表 css-state-word 写到外层的词也走这里，和状态桥同一本账，互不覆盖。
 */
export function setBridgedState(node, owner, attr, value) {
    if (!node?.setAttribute || !owner || !attr) return;
    if (!owners.has(node)) owners.set(node, new Map());
    const perNode = owners.get(node);
    if (!perNode.has(attr)) perNode.set(attr, new Map());
    const perAttr = perNode.get(attr);
    if (value === null || value === undefined) perAttr.delete(owner); else perAttr.set(owner, String(value));
    compose(node, attr);
}

/** 按区域当前状态同步所有载体；接线、每次状态变化后调用。返回写了几个载体。 */
export function syncStateCarriers(root, group) {
    let count = 0;
    for (const { node, attr, values } of collectStateCarriers(root, group)) {
        if (!node.isConnected) continue;
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

// 载体上没有任何活着的主人在写这个属性。
function unclaimed(node, attr) {
    const perAttr = owners.get(node)?.get(attr);
    return !perAttr || perAttr.size === 0;
}
// 存档带回来的记号、主人已经不在（区域退还给老修复器、或这一面重新接线时那个区域没接上）：按记号把自己写的撤掉。
export function unwindStaleBridges(scope) {
    let count = 0;
    for (const node of scope?.querySelectorAll?.(`[${BRIDGED_ATTR}]`) || []) {
        const bridged = bridgedOf(node);
        let changed = false;
        for (const [attr, mark] of bridged) {
            if (!unclaimed(node, attr)) continue;
            const current = node.getAttribute(attr);
            if (TOKEN_ATTRS.has(attr)) {
                const mine = new Set(tokens(mark.mine));
                const rest = tokens(current).filter(token => !mine.has(token));
                if (rest.length) node.setAttribute(attr, rest.join(' ')); else node.removeAttribute(attr);
            } else if (current === mark.mine) {
                if (mark.orig === null) node.removeAttribute(attr); else node.setAttribute(attr, mark.orig);
            }
            bridged.delete(attr);
            originals.get(node)?.delete(attr);
            changed = true;
        }
        if (changed) { writeBridged(node, bridged); count += 1; }
    }
    return count;
}

/** 区域退还（不再由驱动管）时撤掉自己写的那份；没接过线的区域（存档带回来的记号）也按记号撤。 */
export function releaseStateCarriers(root, group) {
    for (const { node, attr } of carrierCache.get(group)?.list || []) {
        owners.get(node)?.get(attr)?.delete(group);
        if (node.isConnected) compose(node, attr);
    }
    carrierCache.delete(group);
    try { unwindStaleBridges(faceScope(group, root)); } catch { /* 撤不掉就留着 */ }
}

/** 诊断用：这一面有没有用到状态桥（哪个区域、几个载体）。 */
export function describeStateCarriers(root) {
    const out = [];
    for (const group of root?.querySelectorAll?.(GROUP) || []) {
        const list = collectStateCarriers(root, group);
        if (list.length) out.push({ type: group.getAttribute('data-rm-ui'), carriers: list.length, inside: list.filter(item => item.inside).length });
    }
    return out;
}
