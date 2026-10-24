import { behaviorShowTokens, ownBehaviorShows } from './behaviorResults.js?rmv=1.79.5';
import { behaviorStyleText } from './behaviorStateMirror.js?rmv=1.79.5';
import { collectStateCarriers, setBridgedState } from './behaviorStateBridge.js?rmv=1.79.5';
import { ownBehaviorNodes } from './behaviorOwner.js?rmv=1.79.5';

// 插件写法「方言表」：模型写的插件交互，意思对、写法和标准不一样的那些情况，集中在这里认。
// 每一条只做三件事：怎么认出来、按什么标准写法去理解、诊断里怎么说。不新增内容、不猜目标。
// 类型名、部件名写错、容器包错这类「结构」问题在 behaviorRepair.js；这里管的是结构对了、意思还对不上的。
// 新加一条：在 BEHAVIOR_DIALECTS 里登记，再把认法写成下面的一个函数，由驱动或诊断调用。
export const BEHAVIOR_DIALECTS = Object.freeze([
    { id: 'remote-toggle', label: '开关按钮写在开关区域外', note: '这一面只有一个开关区域时，区域外的开关按钮归它管。' },
    { id: 'remote-motion', label: '播放钮、进度滑杆写在动画区域外', note: '这一面只有一个动画区域、区域里没写这类控件时，区域外的归它管；滑杆只认唯一的一个。' },
    { id: 'motion-progress', label: '播放器只有进度条和播放键', note: '动画区域里没写会动的部件：播放让进度条自己往前走、再按暂停；播放键两边没写动作的按钮按位置当快退／快进。' },
    { id: 'motion-numeric', label: '动画区域没写真正的动画', note: '部件只用 --pos、left 这类数值摆好了位置：滑杆按比例前进后退，播放钮从起点放一遍。' },
    { id: 'named-single-toggle', label: '唯一的开关起了名字，内容却写 on／!on', note: '这个开关开着就算 on。' },
    { id: 'turn-prefixed-stops', label: '旋钮档位写成 item0、stop1 这种「名字＋号码」', note: '同一名字的号码对上当前档位；号码从 1 起、最大正好是档位数时按第几档算。' },
    { id: 'motion-equalizer', label: '动画区域里是一排音轨波形细条、没写动画', note: '给细条补一段可暂停的上下起伏：播放钮开始和暂停，进度滑杆拨到对应位置。只动细条的纵向缩放，不改内容。' },
    { id: 'effect-any-show', label: '一次性效果区域的显示条件写成 effect、fired、stamp 这类词', note: '效果区域只有「按过」和「没按过」两种状态：按过以后，写什么词的内容都显示，「!词」的内容藏起来。' },
    { id: 'before-words', label: '「还没揭开／还没按」的内容写成 initial、hidden、before 这类词', note: '揭示区域没揭到底、一次性效果还没按时，这类词算当前状态；揭开或按过以后就不算了。' },
    { id: 'answer-words', label: '「答对了／答错了」写成 answer、correct、wrong 这类词', note: '有标准答案的区域：答对时 answer、correct、right 这类词算当前状态，答错时 wrong、incorrect 这类词算。' },
    { id: 'author-status-attr', label: '模型自己的 CSS 按 data-rm-status、data-rm-state 写状态', note: '区域上照 CSS 里写到的词，把当前状态里有的那个写到区域的 data-rm-status／data-rm-state 上（只写 CSS 里出现过的词，没有就恢复原来的值）。' },
    { id: 'range-as-cover', label: '揭示区域把遮罩标识写在滑杆自己身上', note: '滑杆不当遮罩裁掉，拖到底照常显示揭开后的内容。' },
    { id: 'author-css-show', label: '显示条件认不出，但模型自己写了 CSS 按状态管显隐', note: '驱动不再强行藏这些内容，交给模型的 CSS 按 data-rm-index、data-rm-on 这些状态显示。' },
    { id: 'state-carrier', label: '状态条件写在区域之外或之内的别处', note: '模型的 CSS 把 [data-rm-on~="词"]、[data-rm-active="true"]、[data-rm-index="2"] 这些状态条件写在了区域里面的某一层、或区域外面同时包着开关和内容的那一层上，驱动只写在区域自己身上。按 CSS 写的位置把区域上的状态同步过去（值原样照抄，不猜内容）；几个区域写同一层时各记各的。' },
    { id: 'css-state-word', label: '开关写的状态名和模型自己的 CSS 对不上', note: '模型的 CSS 写了 [data-rm-on~="词"] 管哪些内容：开关写了 CSS 里没有的名字（比如写成选择器），而区域里只有一个没被别的开关认领的 CSS 状态词，就按这个词；开关在显示条件里点了某个 CSS 状态词、它管的内容却在开关外面，就把这个词写到同时包着开关和内容的那一层上。' },
]);

const GROUP = '[data-rm-ui]';
const FACE_TOOL_UI = '[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-diagnostic-panel]';
const own = ownBehaviorNodes;

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

// —— motion-equalizer ——
// 部件里至少 3 个并排的细条（宽不超过 14px、比宽高）且都没有自己的动画：给每根补一段循环的 scaleY 起伏，先暂停在开头。
// 起伏高度按条的序号错开（不随机），刷新后一样；动画挂在细条上，驱动当作模型写的动画来暂停、播放和拨进度。
const equalized = new WeakSet();
export function motionEqualizerAnimations(group, parts) {
    if (!group || equalized.has(group)) return 0;
    equalized.add(group);
    let count = 0;
    for (const part of parts || []) {
        const bars = [...part.children].filter(child => {
            const rect = child.getBoundingClientRect?.();
            return rect && rect.width > 0 && rect.width <= 14 && rect.height >= rect.width && !child.getAnimations?.().length;
        });
        if (bars.length < 3 || bars.length !== part.children.length || typeof bars[0].animate !== 'function') continue;
        bars.forEach((bar, index) => {
            const lift = 0.35 + ((index * 37) % 60) / 100;
            // 来回往复（alternate）：拨到进度最右时停在最低处，不会和开头一模一样。
            const animation = bar.animate([
                { transform: 'scaleY(1)' }, { transform: `scaleY(${(1 + lift).toFixed(2)})` }, { transform: `scaleY(${(1 - lift / 2).toFixed(2)})` },
            ], { duration: 900 + (index % 4) * 150, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
            bar.style.setProperty('transform-origin', 'bottom');
            animation.pause();
            animation.currentTime = 0;
            count += 1;
        });
    }
    if (count) group.setAttribute('data-rm-motion-equalizer', 'true');
    return count;
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

// 「还没揭开／还没按过」的词：模型常拿它们写初始状态才显示的内容（data-rm-show="initial"、"hidden"）。
// 只收意思明确的；off、ready、start 这类按了以后也可能用的词不收。
const BEFORE_WORDS = new Set(['initial', 'init', 'before', 'idle', 'pending', 'original', 'unfired', 'unrevealed', 'hidden', 'covered',
    'locked', 'sealed', 'closed', 'waiting', 'unchanged']);
// 有标准答案的区域：答对／答错的说法。
const MATCH_WORDS = ['answer', 'answered', 'correct', 'right', 'solved', 'unlocked', 'success', 'pass', 'passed', 'win'];
const MISS_WORDS = ['wrong', 'incorrect', 'error', 'fail', 'failed', 'mistake', 'lose'];
const tokensOf = group => new Set(ownBehaviorShows(group).flatMap(node => behaviorShowTokens(node)).map(token => token.replace(/^!/, '')).filter(Boolean));
const beforeTypes = new Set(['effect', 'reveal']);
function beforeStage(state) {
    if (state.type === 'effect') return !state.changed;
    if (state.type === 'reveal') return (state.progress || 0) < 0.9;
    return false;
}

// 驱动算显示状态时调用：按方言表补上的状态键。keys 是驱动已经算好的键，直接往里加。
export function addDialectStateKeys(state, keys) {
    const { group } = state;
    if (beforeTypes.has(state.type)) {
        const before = beforeStage(state);
        for (const token of tokensOf(group)) {
            if (BEFORE_WORDS.has(token.toLowerCase())) { if (before) keys.add(token); else keys.delete(token); }
        }
    }
    if (state.type === 'effect' && state.changed) {
        for (const node of ownBehaviorShows(group)) for (const token of behaviorShowTokens(node)) {
            const key = token.replace(/^!/, '');
            if (key && !COMMON_KEYS.includes(key) && !BEFORE_WORDS.has(key.toLowerCase())) keys.add(key);
        }
    }
    if (group?.hasAttribute?.('data-rm-answer')) {
        // 不只是显示条件：模型的样式按 data-rm-status="unlocked" 这类词写时也要对得上，所以整组都算。
        const words = group.getAttribute('data-rm-match') === 'true' ? MATCH_WORDS : group.getAttribute('data-rm-miss') === 'true' ? MISS_WORDS : [];
        for (const word of words) keys.add(word);
    }
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
const STATE_IN_SELECTOR = /data-rm-(?:index|on|picked|active|done|match|angle|seq|armed|turned)|--rm-/;
// 这条规则的选择器里必须带着驱动写的状态属性（[data-rm-index="1"] … [data-rm-show="x"]），
// 否则只是给这个节点上色，不能说明模型的 CSS 在管它什么时候显示。
function cssShowsToken(text, token) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`([^{}]*\\[data-rm-show\\s*=\\s*(?:"${escaped}"|'${escaped}'|${escaped})\\s*\\][^{}]*)\\{([^}]*)\\}`, 'g');
    for (const match of text.matchAll(pattern)) if (STATE_IN_SELECTOR.test(match[1]) && DISPLAY_RULE.test(match[2])) return true;
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

// —— css-state-word ——
// 模型的 CSS 里写的 [data-rm-on~="词"] 后代选择器：词 → 它管的那些后代选择器。
const ON_RULE = /\[data-rm-on\s*[~*|^$]?=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+))\s*\]([^,{]*)/g;
const onWordCache = new WeakMap();
function cssOnWords(root) {
    const text = behaviorStyleText(root);
    const cached = onWordCache.get(root);
    if (cached?.text === text) return cached.words;
    const words = new Map();
    for (const match of text.matchAll(ON_RULE)) {
        const word = String(match[1] ?? match[2] ?? match[3] ?? '').trim();
        const rest = String(match[4] || '');
        // 只认「状态写在外层、管里面的东西」：[data-rm-on~="x"] .child、[data-rm-on~="x"] > .child。
        // 紧贴着写的（[data-rm-on~="x"].self）是给开关自己换样子，兄弟选择器（+ ~）管的不在里面，都不算。
        if (!word || /\s/.test(word) || !/^\s*>?\s*[.#\[a-z*]/i.test(rest) || !/^\s/.test(rest) && !rest.startsWith('>')) continue;
        const selector = rest.replace(/::?[a-z-]+(?:\([^)]*\))?/gi, '').replace(/^\s*>?\s*/, '').trim();
        if (!selector || /^[+~]/.test(selector)) continue;
        if (!words.has(word)) words.set(word, new Set());
        words.get(word).add(selector);
    }
    onWordCache.set(root, { text, words });
    return words;
}
function cssWordTargets(root, selectors) {
    const out = [];
    for (const selector of selectors || []) {
        try { out.push(...root.querySelectorAll(selector)); } catch { /* 选择器写坏了就不算 */ }
    }
    return out;
}
// 这个开关写哪些键：自己身上写的 data-rm-toggle、里面开关部件写的；都没有就是默认的 on。
function toggleKeysOf(group, remotes = []) {
    const keys = toggleNames(group, remotes);
    if (group.hasAttribute('data-rm-toggle')) keys.add(behaviorToggleKey(group.getAttribute('data-rm-toggle')));
    if (!keys.size) keys.add('on');
    return keys;
}
// 这个开关自己「点名」的词：写在它自己的显示条件里的、它写的键。
function wordsNamedBy(group) {
    const named = new Set(behaviorShowTokens(group).map(token => token.replace(/^!/, '')).filter(Boolean));
    for (const key of toggleKeysOf(group)) named.add(key);
    return named;
}
// 返回 null（写法本来就对、或认不出来），或 { aliases: 开着时一并写到开关上的词, outside: [{ node, word }] 开着时写到外层的词 }。
export function toggleCssBridges(state) {
    if (state.cssBridges !== undefined) return state.cssBridges;
    state.cssBridges = null;
    const { group, root } = state;
    if (group?.getAttribute?.('data-rm-ui') !== 'toggle' || !root?.querySelectorAll) return null;
    const words = cssOnWords(root);
    if (!words.size) return null;
    const keys = toggleKeysOf(group, state.remotes || []);
    if ([...keys].some(key => words.has(key))) return null; // 开关写的就是 CSS 里的词：标准写法，不用管
    const scope = faceScopeOf(group) || root;
    const others = [...scope.querySelectorAll('[data-rm-ui="toggle"]')].filter(node => node !== group && root.contains(node));
    const claimed = new Set();
    for (const other of others) for (const word of wordsNamedBy(other)) if (words.has(word)) claimed.add(word);
    const result = { aliases: new Set(), outside: [] };
    // 开关在显示条件里点了 CSS 里的某个词：它管的内容在开关里面就直接写在开关上，在外面就写到同时包着两者的那一层。
    for (const word of wordsNamedBy(group)) {
        if (!words.has(word)) continue;
        const targets = cssWordTargets(root, words.get(word)).filter(node => node !== group);
        if (!targets.length) continue;
        if (targets.some(node => group.contains(node))) { result.aliases.add(word); continue; }
        let holder = group.parentElement;
        while (holder && holder !== root && !targets.every(node => holder.contains(node))) holder = holder.parentElement;
        // 那一层本身是别的交互区域时，它的状态由驱动管，写上去会被盖掉：不写。
        if (!holder || !targets.every(node => holder.contains(node)) || holder.hasAttribute('data-rm-ui')) continue;
        result.outside.push({ node: holder, word });
    }
    // 开关写了 CSS 里没有的名字（比如写成选择器 .rk-seal-trigger）：区域里只有一个没被别的开关认领的 CSS 词，就是它。
    if (!result.aliases.size && !result.outside.length) {
        const inside = [...words.keys()].filter(word => !claimed.has(word)
            && cssWordTargets(root, words.get(word)).some(node => node !== group && group.contains(node)));
        if (inside.length === 1) result.aliases.add(inside[0]);
    }
    state.cssBridges = result.aliases.size || result.outside.length ? result : null;
    return state.cssBridges;
}
// 开着时把词写到外层；几个开关写同一层时各记各的，关掉只撤自己那个。模型原来写在那一层上的状态保留。
// 和状态桥（behaviorStateBridge）记同一本账：同一层可能既有桥写的词、又有这里写的词，分开记会互相抹掉。
// 这里的主人用区域对应的一个独立对象，免得和桥以区域本身为主人写的那份混成一条。
const wordOwners = new WeakMap();
export function setBridgedCssWord(node, owner, word, on) {
    if (!node?.setAttribute || !owner) return;
    if (!wordOwners.has(owner)) wordOwners.set(owner, { group: owner, channel: 'css-state-word' });
    setBridgedState(node, wordOwners.get(owner), 'data-rm-on', on ? word : null);
}

// —— author-status-attr ——
// 模型的 CSS 写了 [data-rm-status="词"]／[data-rm-state~="词"] 这类驱动从来不写的状态属性：属性名 → CSS 里出现过的词。
const STATUS_RULE = /\[(data-rm-(?:status|state))\s*[~*|^$]?=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+))\s*\]/g;
const statusCache = new WeakMap();
export function authorStatusWords(root) {
    const text = behaviorStyleText(root);
    const cached = statusCache.get(root);
    if (cached?.text === text) return cached.words;
    const words = new Map();
    const listAttrs = new Set();
    for (const match of text.matchAll(STATUS_RULE)) {
        const word = String(match[2] ?? match[3] ?? match[4] ?? '').trim();
        if (!word || /\s/.test(word)) continue;
        if (!words.has(match[1])) words.set(match[1], new Set());
        words.get(match[1]).add(word);
        if (match[0].includes('~=')) listAttrs.add(match[1]);
    }
    words.listAttrs = listAttrs;
    statusCache.set(root, { text, words });
    return words;
}
// 按当前状态键把 CSS 里出现过的词写到区域上；一个都不在当前状态里时恢复区域原来写的值。
const statusOriginal = new WeakMap();
export function syncAuthorStatusAttrs(state, keys) {
    const { group, root } = state;
    if (!group?.setAttribute || !root) return;
    const words = authorStatusWords(root);
    if (!words.size) return;
    if (!statusOriginal.has(group)) statusOriginal.set(group, Object.fromEntries([...words.keys()].map(name => [name, group.getAttribute(name)])));
    const original = statusOriginal.get(group);
    for (const [name, list] of words) {
        // 开关的「属性程序」（开着时写 data-rm-state="reverse" 这类）已经在管这个属性：不插手。
        if (state.attrProgram?.attr === name || String(group.getAttribute('data-rm-program') || '').startsWith(`${name}=`)) continue;
        const hit = [...list].filter(word => keys.has(word));
        // [属性~="词"] 认空格分开的多个词；[属性="词"] 要整值相等，只写一个（取 CSS 里最后写到的那个命中词）。
        const value = hit.length ? (words.listAttrs?.has(name) ? hit.join(' ') : hit[hit.length - 1]) : original[name];
        if (value === null || value === undefined) { if (group.hasAttribute(name)) group.removeAttribute(name); }
        else if (group.getAttribute(name) !== value) group.setAttribute(name, value);
    }
}

// ——— 诊断：哪些写法对不上（静态检查，不点真实控件）———

const COMMON_KEYS = ['changed', 'active', 'match', 'done', 'miss', 'placed'];
const CONTROL_ATTRS = ['reset', 'fire', 'play', 'reverse', 'prev', 'next', 'step', 'place', 'return', 'move', 'toggle', 'pick', 'goto', 'roll', 'end', 'code', 'knob', 'seek', 'left', 'right', 'tap', 'charge', 'qte', 'peek', 'spoiler'];
const KNOWN_PART_ATTRS = new Set([...CONTROL_ATTRS, 'ui', 'part', 'show', 'item', 'slot', 'page', 'cover', 'canvas', 'surface', 'hold', 'result', 'when',
    'answer', 'stops', 'index', 'on', 'picked', 'active', 'done', 'match', 'miss', 'feedback', 'seq', 'armed', 'face', 'key', 'value', 'target',
    'card', 'at', 'clock', 'duration', 'memory', 'recall', 'axis', 'manual', 'window', 'count', 'zone', 'period', 'keep', 'sticky', 'swiped', 'swiped-left', 'swiped-right', 'seen', 'revealed', 'seconds']);
const RUNTIME_ATTR = /^data-rm-(?:[a-z-]*-(?:wired|active|done|verified|patched|rescued)$|orphan|mobile|result|draw|title|body|behavior|labeled|reveal|vs|angle|knob-base|released|image|avatar|face-|stage|hydrated|pseudo|touch|external|reversible|click|checked|exclusive|polish|press|texture|bingo|bridged|program)/;

const values = (group, attr) => own(group, `[${attr}]`).map(node => String(node.getAttribute(attr) || '').trim()).filter(Boolean);

// 一格一格走的滑杆：当前格号（加这些前缀）也算状态。只给本身没有别的键来源的类型（动画、调节、揭示、缩放、跟随），
// 选项、翻页、拖放这些已经有自己的键，滑杆格号混进去会让不该出现的内容出现。
export const STEP_RANGE_TYPES = new Set(['motion', 'adjust', 'reveal', 'view', 'follow']);
export const STEP_RANGE_PREFIXES = ['', 'p', 'step', 's', 'page', 'part', 'ch', 'chapter', 'seg', 'track'];

// 某个容器按它的类型「可能出现」的状态键；不确定的类型返回 null（不报）。
export function reachableBehaviorKeys(group) {
    const type = group?.getAttribute?.('data-rm-ui');
    const keys = new Set(COMMON_KEYS);
    if (group?.hasAttribute?.('data-rm-recall')) return null; // 另一面记下的键也算，静态看不出有哪些
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
        case 'reveal': ['reveal', 'revealed', 'full', 'open'].forEach(key => keys.add(key)); tokensOf(group).forEach(key => { if (BEFORE_WORDS.has(key.toLowerCase())) keys.add(key); }); break;
        case 'slide': {
            const items = own(group, '[data-rm-item]');
            items.forEach((item, index) => { keys.add(String(index + 1)); const name = String(item.getAttribute('data-rm-item') || '').trim(); if (name) { keys.add(name); keys.add(`${name}:seen`); } });
            break;
        }
        case 'timer': own(group, '[data-rm-at][data-rm-show]').forEach(node => behaviorShowTokens(node).forEach(token => keys.add(token.replace(/^!/, '')))); keys.add('running'); break;
        case 'swipe': ['left', 'right'].forEach(key => keys.add(key)); values(group, 'data-rm-card').forEach(key => { keys.add(key); keys.add(`${key}:left`); keys.add(`${key}:right`); keys.add(`${key}:top`); }); break;
        case 'peek': keys.add('peek'); values(group, 'data-rm-peek').forEach(key => keys.add(key)); break;
        case 'spoiler': keys.add('revealed'); values(group, 'data-rm-spoiler').forEach(key => keys.add(key)); break;
        case 'sense': ['landscape', 'portrait', 'dark', 'light', 'narrow', 'wide', 'touch', 'mouse'].forEach(key => keys.add(key)); break;
        case 'rhythm': break;
        case 'effect': for (const node of ownBehaviorShows(group)) for (const token of behaviorShowTokens(node)) keys.add(token.replace(/^!/, '')); break;
        case 'sequence': values(group, 'data-rm-code').forEach(key => keys.add(key)); break;
        case 'accumulate': values(group, 'data-rm-step').forEach(key => keys.add(key)); break;
        case 'connect': values(group, 'data-rm-end').forEach(key => keys.add(key)); break;
        case 'drag': case 'reorder': values(group, 'data-rm-item').forEach(key => keys.add(key)); break;
        default: break;
    }
    if (group.hasAttribute('data-rm-answer')) [...MATCH_WORDS, ...MISS_WORDS].forEach(key => keys.add(key));
    // 一格一格走的滑杆：每一格的号（"2"、"p2"、"step2"……）都可能出现（见 behaviorInteractions.js stepRangeKeys）。
    const range = STEP_RANGE_TYPES.has(type) ? (own(group, 'input[type="range"]')[0] || (type === 'motion' ? motionOutsideControls(group).ranges[0] : null)) : null;
    if (range && range.step !== 'any') {
        const min = range.min === '' ? 0 : Number(range.min);
        const max = range.max === '' ? 100 : Number(range.max);
        const step = range.step === '' || range.step === 'any' ? 1 : Number(range.step);
        if ([min, max, step].every(Number.isFinite) && Number.isInteger(min) && Number.isInteger(step) && step > 0 && max - min <= 20 * step) {
            for (let value = min; value <= max; value += step) for (const prefix of STEP_RANGE_PREFIXES) keys.add(`${prefix}${value}`);
        }
    }
    return keys;
}

// 诊断里只写部件标识和文字长度，不带按钮上的字。
function controlName(node) {
    const attr = CONTROL_ATTRS.find(name => node.hasAttribute(`data-rm-${name}`));
    const length = String(node.textContent || '').replace(/\s+/g, ' ').trim().length;
    return `${attr ? `data-rm-${attr}` : node.tagName.toLowerCase()}${length ? `「字×${length}」` : ''}`;
}

// 模型写的动画（不算位置改变时浏览器自动补的过渡）。
function authoredAnimations(group) {
    return (group.getAnimations?.({ subtree: true }) || []).filter(animation => typeof animation?.transitionProperty !== 'string');
}

// 返回 null 表示现在量不到（区域藏着：折叠的 details、没翻到的那一页），不下结论。
function motionCanMove(root, group) {
    try {
        if (typeof group.getAnimations === 'function' && authoredAnimations(group).length) return true;
    } catch { /* 量不到时按下面的数值判断 */ }
    if (own(group, '[data-rm-part]').some(part => motionNumericProperties(part).length)) return true;
    try { if (!group.getClientRects().length) return null; } catch { return null; }
    // 没在跑的动画 getAnimations 看不到（比如 paused、或等按钮才加的类）：样式表里有关键帧就不算静态。
    return /@keyframes|animation(?:-name)?\s*:/i.test(behaviorStyleText(root));
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
    // 方言表按模型自己的 CSS 接上的词：这些显示条件不算对不上。
    const bridged = new Set();
    for (const group of groups) {
        if (group.getAttribute('data-rm-ui') !== 'toggle') continue;
        const bridges = toggleCssBridges({ group, root, remotes: remoteTogglesOf(group) });
        if (!bridges) continue;
        used.add('css-state-word');
        for (const word of wordsNamedBy(group)) bridged.add(word);
        for (const word of bridges.aliases) bridged.add(word);
        for (const { word } of bridges.outside) bridged.add(word);
    }
    for (const group of groups) {
        const type = group.getAttribute('data-rm-ui');
        const reachable = reachableBehaviorKeys(group);
        const managed = authorManagedShows(root, group);
        if (managed.size) used.add('author-css-show');
        if (reachable) {
            for (const node of ownBehaviorShows(group)) for (const token of managed.has(node) ? [] : behaviorShowTokens(node)) {
                const key = token.startsWith('!') ? token.slice(1) : token;
                if (key && !reachable.has(key) && !bridged.has(key) && !result.unmatched.some(item => item.type === type && item.token === token)) result.unmatched.push({ type, token });
            }
        }
        if (type === 'toggle') {
            const named = toggleNames(group, remoteTogglesOf(group));
            const shows = ownBehaviorShows(group).flatMap(node => behaviorShowTokens(node)).map(token => token.replace(/^!/, ''));
            if (named.size === 1 && !named.has('on') && shows.includes('on')) used.add('named-single-toggle');
            if (remoteTogglesOf(group).length && !own(group, '[data-rm-toggle]').length) used.add('remote-toggle');
        }
        if (type === 'turn' && prefixedNumbers(group).size) used.add('turn-prefixed-stops');
        {
            const shown = tokensOf(group);
            if (beforeTypes.has(type) && [...shown].some(token => BEFORE_WORDS.has(token.toLowerCase()))) used.add('before-words');
            if (group.hasAttribute('data-rm-answer') && [...MATCH_WORDS, ...MISS_WORDS].some(word => shown.has(word))) used.add('answer-words');
            if (authorStatusWords(root).size) used.add('author-status-attr');
        }
        try { if (collectStateCarriers(root, group).length) used.add('state-carrier'); } catch { /* 认不出就不报 */ }
        if (type === 'effect' && ownBehaviorShows(group).some(node => behaviorShowTokens(node).some(token => !COMMON_KEYS.includes(token.replace(/^!/, ''))))) used.add('effect-any-show');
        if (type === 'reveal' && own(group, '[data-rm-cover]').some(cover => cover.matches('input, button, label') || cover.querySelector('input[type="range"]'))) used.add('range-as-cover');
        if (type === 'motion') {
            const adopted = motionOutsideControls(group);
            if (adopted.buttons.length || adopted.ranges.length) used.add('remote-motion');
            if (group.getAttribute('data-rm-motion-equalizer') === 'true') used.add('motion-equalizer');
            const canMove = motionCanMove(root, group);
            if (canMove === false && own(group, '[data-rm-play]').length && group.querySelector('input[type="range"]')) used.add('motion-progress');
            else if (canMove === false) result.staticMotion += 1;
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

