import { behaviorShowTokens, ownBehaviorShows } from './behaviorResults.js?rmv=1.68.11';
import { behaviorStyleText } from './behaviorStateMirror.js?rmv=1.68.11';

// 插件写法「方言表」：模型写的插件交互，意思对、写法和标准不一样的那些情况，集中在这里认。
// 每一条只做三件事：怎么认出来、按什么标准写法去理解、诊断里怎么说。不新增内容、不猜目标。
// 类型名、部件名写错、容器包错这类「结构」问题在 behaviorRepair.js；这里管的是结构对了、意思还对不上的。
// 新加一条：在 BEHAVIOR_DIALECTS 里登记，再把认法写成下面的一个函数，由驱动或诊断调用。
export const BEHAVIOR_DIALECTS = Object.freeze([
    { id: 'remote-toggle', label: '开关按钮写在开关区域外', note: '这一面只有一个开关区域时，区域外的开关按钮归它管。' },
    { id: 'remote-motion', label: '播放钮、进度滑杆写在动画区域外', note: '这一面只有一个动画区域、区域里没写这类控件时，区域外的归它管；滑杆只认唯一的一个。' },
    { id: 'motion-numeric', label: '动画区域没写真正的动画', note: '部件只用 --pos、left 这类数值摆好了位置：滑杆按比例前进后退，播放钮从起点放一遍。' },
    { id: 'named-single-toggle', label: '唯一的开关起了名字，内容却写 on／!on', note: '这个开关开着就算 on。' },
    { id: 'turn-prefixed-stops', label: '旋钮档位写成 item0、stop1 这种「名字＋号码」', note: '同一名字的号码对上当前档位；号码从 1 起、最大正好是档位数时按第几档算。' },
    { id: 'author-css-show', label: '显示条件认不出，但模型自己写了 CSS 按状态管显隐', note: '驱动不再强行藏这些内容，交给模型的 CSS 按 data-rm-index、data-rm-on 这些状态显示。' },
]);

const GROUP = '[data-rm-ui]';
const FACE_TOOL_UI = '[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-diagnostic-panel]';
const own = (group, selector) => [...group.querySelectorAll(selector)].filter(node => node.closest(GROUP) === group);

// 开关的键：不写、或写成 true／yes 这类“是否开关”的布尔值时，一律当默认键 on（模型常写 data-rm-toggle="true"）。
export const behaviorToggleKey = value => {
    const key = String(value ?? '').trim();
    return !key || /^(?:true|yes)$/i.test(key) ? 'on' : key;
};

// 一面的范围：最外层的 details（一面兔子镜），没有时用父节点。
export function faceScopeOf(node) {
    let scope = node?.closest?.('details') || null;
    for (let outer = scope?.parentElement?.closest?.('details'); outer; outer = outer.parentElement?.closest?.('details')) scope = outer;
    return scope || node?.parentElement || null;
}

// —— remote-toggle ——
export function remoteToggleGroup(root, target) {
    const control = target?.closest?.('[data-rm-toggle]');
    if (!control || control.closest(GROUP) || !root?.querySelectorAll) return null;
    const scope = control.closest('details') || root;
    const toggles = [...scope.querySelectorAll('[data-rm-ui="toggle"]')].filter(node => root.contains(node));
    return toggles.length === 1 ? toggles[0] : null;
}

// —— remote-motion ——
export function motionOutsideControls(group) {
    const empty = { buttons: [], ranges: [] };
    if (group?.getAttribute?.('data-rm-ui') !== 'motion') return empty;
    const scope = faceScopeOf(group);
    if (!scope?.querySelectorAll) return empty;
    if ([...scope.querySelectorAll('[data-rm-ui="motion"]')].length !== 1) return empty;
    // 已经有人管的不收：模型自己写了 oninput 的、老修复器接管过的（带 rescue／program 标记或在已退还区域里）。
    const taken = node => [...(node.attributes || [])].some(attribute => /^on[a-z]+$/i.test(attribute.name) || /^data-rabbit-mirror-.*(?:rescue|program)/.test(attribute.name))
        || node.closest('[data-rm-released], [data-rm-mobile-controls]');
    const outside = selector => [...scope.querySelectorAll(selector)].filter(node => !node.closest(GROUP) && !node.closest(FACE_TOOL_UI) && !taken(node));
    const buttons = own(group, '[data-rm-play], [data-rm-reverse]').length ? [] : outside('button[data-rm-play], button[data-rm-reverse]');
    const ranges = own(group, 'input[type="range"]').length ? [] : outside('input[type="range"]');
    return { buttons, ranges: ranges.length === 1 ? ranges : [] };
}

export function remoteMotionGroup(root, target) {
    const control = target?.closest?.('button[data-rm-play], button[data-rm-reverse], input[type="range"]');
    if (!control || control.closest(GROUP) || !root?.querySelectorAll) return null;
    const scope = faceScopeOf(control);
    const motions = scope ? [...scope.querySelectorAll('[data-rm-ui="motion"]')].filter(node => root.contains(node)) : [];
    if (motions.length !== 1) return null;
    const { buttons, ranges } = motionOutsideControls(motions[0]);
    return buttons.includes(control) || ranges.includes(control) ? motions[0] : null;
}

// —— motion-numeric（静态认法；回放本身在驱动里）——
const MOTION_NUMERIC = new Set(['left', 'right', 'top', 'bottom', 'width', 'height']);
export function motionNumericProperties(part) {
    const found = [];
    const inline = part?.style;
    for (let index = 0; index < (inline?.length || 0); index += 1) {
        const property = inline[index];
        if (property.startsWith('--rm-') || (!property.startsWith('--') && !MOTION_NUMERIC.has(property))) continue;
        if (/^(-?\d*\.?\d+)(%|px)?$/.test(String(inline.getPropertyValue(property)).trim())) found.push(property);
    }
    return found;
}

// 同一前缀的号码：{ item: [0,1,2] }
function prefixedNumbers(group) {
    const numbered = new Map();
    for (const node of ownBehaviorShows(group)) for (const token of behaviorShowTokens(node)) {
        const match = /^!?([a-z_-]*[a-z_-])(\d{1,2})$/i.exec(token);
        if (!match) continue;
        const list = numbered.get(match[1]) || [];
        list.push(Number(match[2]));
        numbered.set(match[1], list);
    }
    return numbered;
}

function toggleNames(group, remotes = []) {
    return new Set([...own(group, '[data-rm-toggle]'), ...remotes].map(control => behaviorToggleKey(control.getAttribute('data-rm-toggle'))));
}

function remoteTogglesOf(group) {
    const scope = group.closest?.('details');
    if (!scope) return [];
    const toggles = [...scope.querySelectorAll('[data-rm-ui="toggle"]')];
    if (toggles.length !== 1 || toggles[0] !== group) return [];
    return [...scope.querySelectorAll('[data-rm-toggle]')].filter(node => !node.closest(GROUP));
}

// 驱动算显示状态时调用：按方言表补上的状态键。keys 是驱动已经算好的键，直接往里加。
export function addDialectStateKeys(state, keys) {
    const { group } = state;
    if (state.type === 'toggle' && state.on?.size && !keys.has('on')) {
        const named = toggleNames(group, state.remotes || []);
        if (named.size === 1 && !named.has('on') && state.on.has([...named][0])) { keys.add('on'); keys.add('true'); }
    }
    if (state.type === 'turn' && state.stops) {
        for (const [prefix, numbers] of prefixedNumbers(group)) {
            const oneBased = Math.min(...numbers) === 1 && Math.max(...numbers) === state.stops;
            keys.add(`${prefix}${state.stopIndex + (oneBased ? 1 : 0)}`);
        }
    }
    return keys;
}

// —— author-css-show ——
// 驱动写到容器上的状态属性；模型的 CSS 只要按其中任意一个来写显隐，状态一变 CSS 就能跟上。
const STATE_ATTR_NEEDLES = ['data-rm-index', 'data-rm-on', 'data-rm-picked', 'data-rm-active', 'data-rm-done', 'data-rm-match', 'data-rm-angle', 'data-rm-seq', '--rm-'];
const DISPLAY_RULE = /\b(?:display|visibility|opacity|max-height|height|clip-path|transform)\s*:/i;
function cssShowsToken(text, token) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\[data-rm-show\\s*=\\s*(?:"${escaped}"|'${escaped}'|${escaped})\\s*\\][^{}]*\\{([^}]*)\\}`, 'g');
    for (const match of text.matchAll(pattern)) if (DISPLAY_RULE.test(match[1])) return true;
    return false;
}
// 这个容器里：显示条件全都对不上、但模型的 CSS 按状态管着它显隐的那些节点。
export function authorManagedShows(root, group) {
    const managed = new Set();
    const reachable = reachableBehaviorKeys(group);
    if (!reachable) return managed;
    let text = null;
    for (const node of ownBehaviorShows(group)) {
        const tokens = behaviorShowTokens(node).map(token => token.replace(/^!/, '')).filter(Boolean);
        if (!tokens.length || tokens.some(token => reachable.has(token))) continue;
        if (text === null) {
            text = behaviorStyleText(root);
            if (!STATE_ATTR_NEEDLES.some(needle => text.includes(needle))) return managed;
        }
        if (tokens.some(token => cssShowsToken(text, token))) managed.add(node);
    }
    return managed;
}

// ——— 诊断：哪些写法对不上（静态检查，不点真实控件）———

const COMMON_KEYS = ['changed', 'active', 'match', 'done', 'miss', 'placed'];
const CONTROL_ATTRS = ['reset', 'fire', 'play', 'reverse', 'prev', 'next', 'step', 'place', 'return', 'move', 'toggle', 'pick', 'goto', 'roll', 'end', 'code', 'knob'];
const KNOWN_PART_ATTRS = new Set([...CONTROL_ATTRS, 'ui', 'part', 'show', 'item', 'slot', 'page', 'cover', 'canvas', 'surface', 'hold', 'result', 'when',
    'answer', 'stops', 'index', 'on', 'picked', 'active', 'done', 'match', 'miss', 'feedback', 'seq', 'armed', 'face', 'key', 'value', 'target']);
const RUNTIME_ATTR = /^data-rm-(?:[a-z-]*-(?:wired|active|done|verified|patched|rescued)$|orphan|mobile|result|draw|title|body|behavior|labeled|reveal|vs|angle|knob-base|released|image|avatar|face-|stage|hydrated|pseudo|touch|external|reversible|click|checked|exclusive)/;

const values = (group, attr) => own(group, `[${attr}]`).map(node => String(node.getAttribute(attr) || '').trim()).filter(Boolean);

// 某个容器按它的类型「可能出现」的状态键；不确定的类型返回 null（不报）。
export function reachableBehaviorKeys(group) {
    const type = group?.getAttribute?.('data-rm-ui');
    const keys = new Set(COMMON_KEYS);
    switch (type) {
        case 'roll': return null; // 掷骰子从显示内容里挑键，所有键都可能出现
        case 'toggle': {
            const names = toggleNames(group, remoteTogglesOf(group));
            names.add('on');
            String(group.getAttribute('data-rm-on') || '').split(/[\s,，、]+/).filter(Boolean).forEach(key => names.add(behaviorToggleKey(key)));
            names.forEach(key => keys.add(key));
            keys.add('true');
            break;
        }
        case 'pick': values(group, 'data-rm-pick').forEach(key => keys.add(key)); break;
        case 'pager': {
            const pages = [...group.querySelectorAll('[data-rm-page]')].filter(node =>
                (node.matches(GROUP) ? node.parentElement?.closest(GROUP) : node.closest(GROUP)) === group);
            pages.forEach((page, index) => { keys.add(String(index + 1)); const name = String(page.getAttribute('data-rm-page') || '').trim(); if (name) keys.add(name); });
            break;
        }
        case 'turn': {
            const stops = Math.round(Number(group.getAttribute('data-rm-stops')) || 0);
            if (stops >= 2 && stops <= 72) {
                for (let index = 0; index < stops; index += 1) keys.add(String(index));
                for (const [prefix, numbers] of prefixedNumbers(group)) {
                    const oneBased = Math.min(...numbers) === 1 && Math.max(...numbers) === stops;
                    for (let index = 0; index < stops; index += 1) keys.add(`${prefix}${index + (oneBased ? 1 : 0)}`);
                }
            }
            break;
        }
        case 'reveal': ['reveal', 'revealed', 'full', 'open'].forEach(key => keys.add(key)); break;
        case 'sequence': values(group, 'data-rm-code').forEach(key => keys.add(key)); break;
        case 'connect': values(group, 'data-rm-end').forEach(key => keys.add(key)); break;
        case 'drag': case 'reorder': values(group, 'data-rm-item').forEach(key => keys.add(key)); break;
        default: break;
    }
    return keys;
}

function controlName(node) {
    const attr = CONTROL_ATTRS.find(name => node.hasAttribute(`data-rm-${name}`));
    const text = String(node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 12);
    return `${attr ? `data-rm-${attr}` : node.tagName.toLowerCase()}${text ? `「${text}」` : ''}`;
}

// 模型写的动画（不算位置改变时浏览器自动补的过渡）。
function authoredAnimations(group) {
    return (group.getAnimations?.({ subtree: true }) || []).filter(animation => typeof animation?.transitionProperty !== 'string');
}

function motionCanMove(group) {
    try {
        if (typeof group.getAnimations === 'function' && authoredAnimations(group).length) return true;
    } catch { /* 量不到时按下面的数值判断 */ }
    return own(group, '[data-rm-part]').some(part => motionNumericProperties(part).length);
}

// 返回：
//   unmatched  显示条件永远对不上的 [{ type, token }]（!键 也算：它会一直成立）
//   orphans    写在所有区域外、也没被方言表收编的部件
//   unknown    区域里的按钮带着不认识的 data-rm-* 标识（多半是部件名写错）
//   staticMotion  动画区域里没有任何能动的东西
//   dialects   这一面实际用上的方言条目 id
export function inspectBehaviorDialect(root) {
    const result = { unmatched: [], orphans: [], unknown: [], staticMotion: 0, dialects: [] };
    if (!root?.querySelectorAll) return result;
    const used = new Set();
    const groups = [...root.querySelectorAll(GROUP)].filter(group => !group.closest(FACE_TOOL_UI));
    for (const group of groups) {
        const type = group.getAttribute('data-rm-ui');
        const reachable = reachableBehaviorKeys(group);
        const managed = authorManagedShows(root, group);
        if (managed.size) used.add('author-css-show');
        if (reachable) {
            for (const node of ownBehaviorShows(group)) for (const token of managed.has(node) ? [] : behaviorShowTokens(node)) {
                const key = token.startsWith('!') ? token.slice(1) : token;
                if (key && !reachable.has(key) && !result.unmatched.some(item => item.type === type && item.token === token)) result.unmatched.push({ type, token });
            }
        }
        if (type === 'toggle') {
            const named = toggleNames(group, remoteTogglesOf(group));
            const shows = ownBehaviorShows(group).flatMap(node => behaviorShowTokens(node)).map(token => token.replace(/^!/, ''));
            if (named.size === 1 && !named.has('on') && shows.includes('on')) used.add('named-single-toggle');
            if (remoteTogglesOf(group).length && !own(group, '[data-rm-toggle]').length) used.add('remote-toggle');
        }
        if (type === 'turn' && prefixedNumbers(group).size) used.add('turn-prefixed-stops');
        if (type === 'motion') {
            const adopted = motionOutsideControls(group);
            if (adopted.buttons.length || adopted.ranges.length) used.add('remote-motion');
            if (!motionCanMove(group)) result.staticMotion += 1;
            else if (own(group, '[data-rm-part]').some(part => motionNumericProperties(part).length)) {
                try { if (!authoredAnimations(group).length) used.add('motion-numeric'); } catch {}
            }
        }
        // 按钮上不认识的标识：只在这个区域一个认识的控件都没有时才报（有认识的控件时，多出来的标识多半是装饰）。
        const recognized = own(group, CONTROL_ATTRS.map(name => `[data-rm-${name}]`).join(', ')).length > 0;
        for (const button of recognized ? [] : own(group, 'button, [role="button"]')) {
            const odd = [...button.attributes].map(attribute => attribute.name)
                .filter(name => name.startsWith('data-rm-') && !RUNTIME_ATTR.test(name) && !KNOWN_PART_ATTRS.has(name.slice(8)));
            for (const name of odd) if (!result.unknown.includes(name)) result.unknown.push(name);
        }
    }
    const motions = groups.filter(group => group.getAttribute('data-rm-ui') === 'motion');
    const adoptedMotion = new Set(motions.flatMap(group => { const { buttons, ranges } = motionOutsideControls(group); return [...buttons, ...ranges]; }));
    for (const node of root.querySelectorAll(CONTROL_ATTRS.map(name => `[data-rm-${name}]`).join(', '))) {
        if (node.closest(GROUP) || node.closest(FACE_TOOL_UI) || adoptedMotion.has(node)) continue;
        if (node.hasAttribute('data-rm-toggle') && remoteToggleGroup(root, node)) continue;
        result.orphans.push(controlName(node));
    }
    result.dialects = BEHAVIOR_DIALECTS.map(item => item.id).filter(id => used.has(id));
    return result;
}

export function describeBehaviorDialect(report) {
    const parts = [];
    if (report.unmatched.length) parts.push(`显示条件对不上 ${report.unmatched.map(item => `${item.type}:${item.token}`).slice(0, 8).join(' ')}`);
    if (report.orphans.length) parts.push(`区域外没人管的部件 ${report.orphans.slice(0, 6).join(' ')}`);
    if (report.unknown.length) parts.push(`按钮上不认识的标识 ${report.unknown.slice(0, 6).join(' ')}`);
    if (report.staticMotion) parts.push(`动画区域里没有能动的东西 ${report.staticMotion} 组`);
    return parts.join('；');
}

export function dialectLabels(ids) {
    return ids.map(id => BEHAVIOR_DIALECTS.find(item => item.id === id)?.label || id);
}

