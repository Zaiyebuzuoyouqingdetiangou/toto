import { behaviorShowTokens, ownBehaviorShows, setBehaviorNodeVisible, updateBehaviorResults, updateBehaviorShows } from './behaviorResults.js?rmv=1.67.70';
import { hasMobileInteractionControl, usesMobileInteractionButtons } from './mobileInteractionControls.js?rmv=1.67.70';
import { behaviorTypeFits, repairBehaviorDeclarations } from './behaviorRepair.js?rmv=1.67.70';
import { behaviorCssMentions, hasBehaviorStateClasses, mirrorBehaviorState } from './behaviorStateMirror.js?rmv=1.67.70';
import { applyRememberedBehaviorRelay, applyRememberedReversePatches } from './behaviorRelayMemory.js?rmv=1.67.70';

// Declarative, face-local behaviors. No generated code, global targets or timers.
const roots = new WeakMap();
const owners = new WeakMap();
const GROUP = '[data-rm-ui]';
const TYPES = new Set(['effect', 'drag', 'adjust', 'reveal', 'view', 'input', 'draw', 'motion', 'hold', 'follow', 'reorder', 'accumulate',
    'toggle', 'pick', 'pager', 'roll', 'connect', 'turn', 'sequence']);
// 这几类的状态由驱动统一同步到容器、被操作的部件和 data-rm-show 内容上。
const STATEFUL = new Set(['toggle', 'pick', 'pager', 'roll', 'connect', 'turn', 'sequence']);
// 可以点的部件：不限于 button，div、span、svg 元素写上这些标识也能用（补上 role 与键盘操作）。
const CONTROL_ATTRS = ['reset', 'fire', 'play', 'reverse', 'prev', 'next', 'step', 'place', 'return', 'move', 'toggle', 'pick', 'goto', 'roll', 'end', 'code', 'knob'];
const CONTROL_SELECTOR = CONTROL_ATTRS.map(name => `[data-rm-${name}]`).join(', ');
// 每类驱动认哪些部件；不属于本类的标识（比如拖动区里碰巧写了 data-key）不接管它的点击。
const TYPE_CONTROLS = Object.freeze({ drag: ['place', 'return', 'move'], effect: ['fire'], motion: ['play', 'reverse'], hold: ['hold'], reorder: ['prev', 'next'], accumulate: ['step'],
    toggle: ['toggle'], pick: ['pick'], pager: ['prev', 'next', 'goto'], roll: ['roll'], connect: ['end'], turn: ['knob'], sequence: ['code'] });
const RESERVED_KEYS = new Set(['changed', 'active', 'match', 'done', 'miss', 'on']);
const SVG_NS = 'http://www.w3.org/2000/svg';
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const own = (group, selector) => [...group.querySelectorAll(selector)].filter(node => node.closest(GROUP) === group);
const first = (group, selector) => own(group, selector)[0];
const isButton = node => node?.matches?.('button, input[type="button"]') && !node.disabled;
const isNative = node => Boolean(node?.matches?.('button, input, textarea, select, a[href], summary, label'));
const isControl = node => Boolean(node?.matches) && !node.disabled && node.getAttribute('aria-disabled') !== 'true'
    && !node.matches('input:not([type="button"]), textarea, select');
const mod = (value, size) => ((value % size) + size) % size;
const words = value => String(value || '').split(/[\s,，、]+/).map(word => word.trim()).filter(Boolean);
// 开关的键：不写、或写成 true／yes 这类“是否开关”的布尔值时，一律当默认键 on（模型常写 data-rm-toggle="true"）。
export const behaviorToggleKey = value => {
    const key = String(value ?? '').trim();
    return !key || /^(?:true|yes)$/i.test(key) ? 'on' : key;
};

function refreshResults(state) {
    if (STATEFUL.has(state.type)) syncState(state);
    const range = first(state.group, 'input[type="range"]');
    updateBehaviorResults(state.group, {
        changed: Boolean(state.changed), p: range ? rangeValue(range).p : (state.progress || 0),
        active: state.group.getAttribute('data-rm-active') === 'true',
        match: state.group.getAttribute('data-rm-match') === 'true',
        count: own(state.group, '[data-rm-step]').filter(node => node.getAttribute('data-rm-done') === 'true').length,
        order: own(state.group, '[data-rm-item]').map(node => node.getAttribute('data-rm-item')),
        placed: [...state.placed].filter(node => state.group.contains(node)).map(node => node.getAttribute('data-rm-item')),
    });
    updateBehaviorShows(state.group, stateKeys(state), (node, active) => mirrorBehaviorState(state.root, node, active));
}

// data-rm-show 能用的键：通用状态词，加上各类驱动当前的键（开着的词、选中的键、当前页、格号、按过的键、连上的键）。
function stateKeys(state) {
    const { group } = state;
    const keys = new Set();
    if (state.changed) keys.add('changed');
    for (const name of ['active', 'match', 'done', 'miss']) if (group.getAttribute(`data-rm-${name}`) === 'true') keys.add(name);
    for (const key of state.on || []) { keys.add(key); if (key === 'on') keys.add('true'); }
    if (state.picked) keys.add(state.picked);
    if (state.type === 'pager' && state.pages?.length) {
        keys.add(String(state.index));
        const name = String(state.pages[state.index - 1]?.getAttribute('data-rm-page') || '').trim();
        if (name) keys.add(name);
    }
    if (state.type === 'turn' && state.stops) keys.add(String(state.stopIndex));
    for (const key of state.entered || []) keys.add(key);
    for (const [, , key] of state.pairs || []) keys.add(key);
    return keys;
}

function rangeValue(input) {
    const min = input.min === '' ? 0 : finite(input.min);
    const max = Math.max(min, input.max === '' ? 100 : finite(input.max, 100));
    const value = clamp(finite(input.value, min), min, max);
    return { value, p: max > min ? (value - min) / (max - min) : 0 };
}

function saveStyle(state, node, property) {
    if (!state.styles.has(node)) state.styles.set(node, new Map());
    const saved = state.styles.get(node);
    if (!saved.has(property)) saved.set(property, [node.style.getPropertyValue(property), node.style.getPropertyPriority(property)]);
}

function style(state, node, property, value) {
    saveStyle(state, node, property);
    node.style.setProperty(property, value);
}

function animations(state) {
    const found = own(state.group, '[data-rm-part]').flatMap(part => part.getAnimations?.({ subtree: true }) || []);
    for (const animation of found) {
        const target = animation.effect?.target;
        if (target?.closest?.(GROUP) === state.group) state.animations.add(animation);
    }
    return [...state.animations].filter(animation => state.group.contains(animation.effect?.target));
}

function reveal(state, p) {
    const value = clamp(p, 0, 1);
    state.progress = value;
    style(state, state.group, '--rm-p', String(value));
    const down = state.group.getAttribute('data-rm-reveal-dir') === 'down';
    for (const cover of own(state.group, '[data-rm-cover]')) style(state, cover, 'clip-path', down ? `inset(${value * 100}% 0 0 0)` : `inset(0 0 0 ${value * 100}%)`);
    for (const node of own(state.group, '[data-rm-range-var]')) {
        const name = String(node.getAttribute('data-rm-range-var') || '');
        if (/^--[\w-]+$/.test(name)) style(state, node, name, `${Math.round(value * 100)}%`);
    }
    const range = first(state.group, 'input[type="range"]');
    if (range) {
        const min = range.min === '' ? 0 : finite(range.min);
        const max = range.max === '' ? 100 : finite(range.max, 100);
        range.value = String(min + value * Math.max(0, max - min));
    }
}

function countSteps(state) {
    const steps = own(state.group, '[data-rm-step]');
    const completed = steps.filter(node => node.getAttribute('data-rm-done') === 'true').length;
    style(state, state.group, '--rm-count', String(completed));
    // A leaf group's result may be a sibling of its buttons. Mirror completion
    // onto their common group so authored descendant CSS can reveal that result.
    // Containers with nested behaviors retain button/count state only: marking
    // their ancestor done would also reveal an unfinished nested result via CSS.
    if (steps.length > 0 && completed === steps.length && !state.group.querySelector(GROUP)) state.group.setAttribute('data-rm-done', 'true');
    else state.group.removeAttribute('data-rm-done');
    for (const step of steps) {
        const done = step.getAttribute('data-rm-done') === 'true';
        step.setAttribute('aria-pressed', String(done));
        mark(state, step, done, ['data-rm-done', 'aria-pressed']);
    }
}

function inputChange(state, input, userAction = false) {
    if (userAction) state.changed = true;
    const { group, type } = state;
    if (type === 'input' && input.matches('input:not([type]), input[type="text"], input[type="password"], textarea')) {
        for (const output of own(group, 'output')) output.textContent = input.value;
        if (group.hasAttribute('data-rm-answer')) group.setAttribute('data-rm-match', String(input.value === group.getAttribute('data-rm-answer')));
    }
    if (!input.matches('input[type="range"]')) { refreshResults(state); return; }
    const { value, p } = rangeValue(input);
    if (type === 'adjust') {
        style(state, group, '--rm-p', String(p));
        style(state, group, '--rm-value', String(value));
    } else if (type === 'reveal') reveal(state, p);
    else if (type === 'view') {
        for (const part of own(group, '[data-rm-part]')) {
            style(state, part, 'transform-origin', '0 0');
            style(state, part, 'scale', String(clamp(value, 0.1, 10)));
        }
    } else if (type === 'motion') {
        for (const animation of animations(state)) {
            const timing = animation.effect?.getComputedTiming?.();
            const duration = finite(timing?.activeDuration, finite(timing?.duration));
            if (duration > 0) animation.currentTime = finite(animation.effect?.getTiming?.().delay) + p * duration;
        }
    }
    refreshResults(state);
}

function validGroup(group, type) {
    // 写了 toggle 却没标开关部件时，整个容器就是开关。
    return TYPES.has(type) && (type === 'toggle' || behaviorTypeFits(group, type));
}

// 非 button 的部件补上按钮语义：能聚焦、读屏认得、鼠标是手形。只补缺的，不改模型写好的。
function enableControl(node) {
    if (!node?.setAttribute || isNative(node)) return;
    if (!node.hasAttribute('role')) node.setAttribute('role', 'button');
    if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '0');
    if (!node.style?.getPropertyValue('cursor')) node.style?.setProperty('cursor', 'pointer');
}

function prepare(binding, group) {
    if (binding.groups.has(group)) return binding.groups.get(group);
    const type = group.getAttribute('data-rm-ui');
    if (!validGroup(group, type)) return null;
    const state = { group, type, root: binding.root, styles: new Map(), positions: new Map(), orders: new Map(), animations: new Set(), strokes: new Set(), placed: new Set(), changed: false, progress: 0 };
    binding.groups.set(group, state);
    owners.set(group, binding);
    const items = own(group, '[data-rm-item]');
    if (type === 'drag' || type === 'reorder') for (const item of items) {
        item.style.setProperty('touch-action', 'none');
        if (type === 'reorder' && !state.orders.has(item.parentElement)) state.orders.set(item.parentElement, [...item.parentElement.children]);
    }
    if (type === 'draw') first(group, 'svg[data-rm-canvas]').style.setProperty('touch-action', 'none');
    if (type === 'follow' || type === 'hold' || (type === 'reveal' && !first(group, 'input[type="range"]'))) {
        const surface = first(group, type === 'hold' ? '[data-rm-hold]' : '[data-rm-surface]') || group;
        surface.style.setProperty('touch-action', 'none');
    }
    clearStaleFeedback(group);
    for (const control of own(group, `${CONTROL_SELECTOR}, [data-rm-hold]`)) enableControl(control);
    if (type === 'view') style(state, group, 'overflow', 'auto');
    if (type === 'effect') for (const animation of animations(state)) { animation.pause(); animation.currentTime = 0; }
    if (type === 'accumulate') countSteps(state);
    if (STATEFUL.has(type)) prepareStateful(state);
    if (['adjust', 'view', 'reveal'].includes(type)) {
        const range = first(group, 'input[type="range"]');
        if (range) inputChange(state, range);
    }
    refreshResults(state);
    return state;
}

function stateFor(root, target) {
    const binding = roots.get(root);
    const group = target?.closest?.(GROUP);
    return binding && group && root.contains(group) ? prepare(binding, group) : null;
}

export function isBehaviorInteractionOwned(node) {
    const group = node?.closest?.(GROUP);
    return Boolean(group && owners.get(group)?.root.contains(group));
}

// The old inert-button repair must not attach an unrelated acknowledgement to
// a button which this live driver actually owns. Serializable markers alone
// are deliberately insufficient; cloned faces need their own listeners.
export function hasBehaviorInteractionControl(root, button) {
    if (!isButton(button)) return false;
    if (hasMobileInteractionControl(root, button)) return true;
    const state = stateFor(root, button);
    if (!state) return false;
    if (button.hasAttribute('data-rm-reset')) return true;
    const attrs = TYPE_CONTROLS;
    // 整个容器当开关的 toggle：容器里没另写开关时，里面的按钮也归它管（点了就翻）。
    if (state.type === 'toggle' && !own(state.group, '[data-rm-toggle]').length
        && !button.hasAttribute('popovertarget') && !button.hasAttribute('commandfor')) return true;
    return (attrs[state.type] || []).some(attr => button.hasAttribute(`data-rm-${attr}`));
}

function reset(state) {
    state.changed = false;
    state.placed.clear();
    for (const [node, properties] of state.styles) for (const [property, [value, priority]] of properties) {
        if (value) node.style.setProperty(property, value, priority);
        else node.style.removeProperty(property);
    }
    state.styles.clear();
    state.positions.clear();
    for (const [parent, order] of state.orders) {
        // Restore the original layout slots, retaining new children and all nodes/listeners.
        const present = [...parent.children].filter(node => order.includes(node));
        const original = order.filter(node => node.parentElement === parent);
        const slots = present.map(() => parent.ownerDocument.createComment('rm-order'));
        for (let i = 0; i < present.length; i++) parent.insertBefore(slots[i], present[i]);
        for (let i = 0; i < original.length; i++) slots[i].replaceWith(original[i]);
        for (const slot of slots) slot.remove();
    }
    for (const path of state.strokes) path.remove();
    state.strokes.clear();
    for (const input of own(state.group, 'input, textarea')) {
        if (input.matches('input[type="range"]')) input.value = input.defaultValue || (input.min === '' ? '0' : input.min);
        else if (state.type === 'input') input.value = '';
    }
    if (state.type === 'input') {
        for (const output of own(state.group, 'output')) output.textContent = '';
        state.group.removeAttribute('data-rm-match');
    }
    if (state.type === 'reveal') reveal(state, 0);
    if (state.type === 'view') { state.group.scrollLeft = 0; state.group.scrollTop = 0; style(state, state.group, 'overflow', 'auto'); }
    if (state.type === 'hold') { setHoldActive(state, null, false); owners.get(state.group)?.holds.delete(state); }
    if (state.type === 'accumulate') {
        for (const step of own(state.group, '[data-rm-step]')) step.removeAttribute('data-rm-done');
        countSteps(state);
    }
    if (state.type === 'adjust' || state.type === 'view') {
        const range = first(state.group, 'input[type="range"]');
        if (range) inputChange(state, range);
    }
    if (STATEFUL.has(state.type)) resetStateful(state);
    refreshResults(state);
}

function action(state, button) {
    if (!state) return; // Mobile arrows/range buttons have their own local listener.
    if (button.hasAttribute('data-rm-reset')) { reset(state); return; }
    if (state.type === 'drag') {
        const item = button.closest('[data-rm-item]');
        if (!item || item.closest(GROUP) !== state.group) return;
        const changed = dragButton(state, item, button);
        if (changed) state.changed = true;
    } else if (state.type === 'effect' && button.hasAttribute('data-rm-fire')) {
        const list = animations(state);
        for (const animation of list) { animation.currentTime = 0; animation.play(); }
        if (list.length) state.changed = true;
    } else if (state.type === 'motion') {
        const list = animations(state);
        if (list.length) state.changed = true;
        if (button.hasAttribute('data-rm-play')) {
            const pause = list.some(animation => animation.playState === 'running');
            for (const animation of list) animation[pause ? 'pause' : 'play']();
            button.setAttribute('aria-pressed', String(pause));
        } else if (button.hasAttribute('data-rm-reverse')) for (const animation of list) {
            const rate = -(animation.playbackRate || 1);
            // reverse() cannot seek to the end of an infinite CSS animation.
            // Reverse from its current time, or from one cycle when at zero.
            if (rate < 0 && finite(animation.currentTime) <= 0) {
                const timing = animation.effect?.getComputedTiming?.();
                animation.currentTime = finite(timing?.activeDuration, finite(timing?.duration));
            }
            if (animation.updatePlaybackRate) animation.updatePlaybackRate(rate);
            else animation.playbackRate = rate;
            animation.play();
        }
    } else if (state.type === 'accumulate' && button.hasAttribute('data-rm-step')) {
        const done = button.getAttribute('data-rm-done') === 'true';
        if (done) button.removeAttribute('data-rm-done');
        else button.setAttribute('data-rm-done', 'true');
        countSteps(state);
        state.changed = true;
    } else if (state.type === 'reorder') {
        const item = button.closest('[data-rm-item]');
        if (!item || item.closest(GROUP) !== state.group) return;
        const siblings = own(state.group, '[data-rm-item]').filter(node => node.parentElement === item.parentElement);
        const index = siblings.indexOf(item);
        if (button.hasAttribute('data-rm-prev') && index > 0) { item.parentElement.insertBefore(item, siblings[index - 1]); state.changed = true; }
        if (button.hasAttribute('data-rm-next') && index < siblings.length - 1) { item.parentElement.insertBefore(siblings[index + 1], item); state.changed = true; }
        button.focus?.({ preventScroll: true });
    } else if (STATEFUL.has(state.type)) {
        if (statefulAction(state, button)) state.changed = true;
    }
    refreshResults(state);
}

// ——— 状态类驱动：toggle 开关／翻面、pick 多选一、pager 翻页、roll 随机抽取、connect 连线、turn 拨盘、sequence 顺序解锁 ———

function unstyle(state, node, properties) {
    const saved = state.styles.get(node);
    for (const property of properties) {
        if (!saved?.has(property)) continue;
        const [value, priority] = saved.get(property);
        if (value) node.style.setProperty(property, value, priority);
        else node.style.removeProperty(property);
        saved.delete(property);
    }
}

// 被操作的部件进入／离开某状态：同步模型 CSS 里对应的状态类；本面 CSS 对这个状态毫无回应时，
// 给一圈当前色描边当最低限度的反馈，免得“点了没反应”。
function mark(state, node, on, needles) {
    if (!node?.style) return;
    mirrorBehaviorState(state.root, node, on);
    const quiet = behaviorCssMentions(state.root, needles) || hasBehaviorStateClasses(state.root, node);
    if (quiet) return;
    if (on) {
        style(state, node, 'outline', '2px solid currentColor'); style(state, node, 'outline-offset', '2px');
        node.setAttribute(FEEDBACK_ATTR, '');
    } else {
        unstyle(state, node, ['outline', 'outline-offset']);
        node.removeAttribute(FEEDBACK_ATTR);
    }
}

// 克隆、收藏或重新接线后，上一次留下的兜底描边已不对应当前状态，先清掉再按状态重画。
const FEEDBACK_ATTR = 'data-rm-feedback';
function clearStaleFeedback(group) {
    for (const node of [group, ...group.querySelectorAll(`[${FEEDBACK_ATTR}]`)]) {
        if (!node.hasAttribute?.(FEEDBACK_ATTR)) continue;
        node.style.removeProperty('outline'); node.style.removeProperty('outline-offset');
        node.removeAttribute(FEEDBACK_ATTR);
    }
}

function setFlag(node, name, on) {
    if (on) { if (node.getAttribute(name) !== 'true') node.setAttribute(name, 'true'); }
    else if (node.hasAttribute(name)) node.removeAttribute(name);
}

function rollOptions(state) {
    const keys = [];
    for (const node of ownBehaviorShows(state.group)) for (const token of behaviorShowTokens(node)) {
        if (token.startsWith('!') || RESERVED_KEYS.has(token) || keys.includes(token)) continue;
        keys.push(token);
    }
    return keys;
}

function randomBelow(limit) {
    try {
        const buffer = new Uint32Array(1);
        globalThis.crypto.getRandomValues(buffer);
        return buffer[0] % limit;
    } catch { return Math.floor(Math.random() * limit); }
}

const ownPages = group => [...group.querySelectorAll('[data-rm-page]')].filter(node =>
    (node.matches(GROUP) ? node.parentElement?.closest(GROUP) : node.closest(GROUP)) === group);

function knobRotation(knob) {
    try {
        const value = knob.ownerDocument.defaultView?.getComputedStyle?.(knob)?.rotate;
        const match = /^(-?[\d.]+)deg$/.exec(String(value || '').trim());
        return match ? Number(match[1]) : 0;
    } catch { return 0; }
}

function prepareStateful(state) {
    const { group, type } = state;
    if (type === 'toggle') {
        state.on = new Set(words(group.getAttribute('data-rm-on')).map(behaviorToggleKey));
        if (!own(group, '[data-rm-toggle]').length) {
            enableControl(group);
            if (!group.hasAttribute('aria-pressed') && group.getAttribute('role') === 'button') group.setAttribute('aria-pressed', 'false');
        }
    } else if (type === 'pick' || type === 'roll') {
        state.picked = String(group.getAttribute('data-rm-picked') || '').trim();
    } else if (type === 'pager') {
        state.pages = ownPages(group);
        state.index = Math.min(Math.max(1, Math.round(finite(group.getAttribute('data-rm-index'), 1))), state.pages.length);
        state.loop = group.hasAttribute('data-rm-loop');
        if (!group.style.getPropertyValue('touch-action')) group.style.setProperty('touch-action', 'pan-y');
    } else if (type === 'connect') {
        for (const stale of own(group, 'svg[data-rm-lines]')) stale.remove();
        for (const end of own(group, '[data-rm-end]')) { end.removeAttribute('data-rm-paired'); end.removeAttribute('data-rm-armed'); }
        group.removeAttribute('data-rm-miss'); group.removeAttribute('data-rm-done');
        state.pairs = []; state.paired = new Set(); state.armed = null;
    } else if (type === 'turn') {
        state.knob = first(group, '[data-rm-knob]');
        state.knob.style.setProperty('touch-action', 'none');
        if (!state.knob.style.getPropertyValue('cursor') || state.knob.style.getPropertyValue('cursor') === 'pointer') state.knob.style.setProperty('cursor', 'grab');
        state.stops = Math.round(finite(group.getAttribute('data-rm-stops'), 0));
        if (state.stops < 2 || state.stops > 72) state.stops = 0;
        // 第一次接线时记下转钮原本的角度；克隆后内联的 rotate 已是转过的角度，按记下的原值算。
        if (!state.knob.hasAttribute('data-rm-knob-base')) state.knob.setAttribute('data-rm-knob-base', String(knobRotation(state.knob)));
        state.baseRotation = finite(state.knob.getAttribute('data-rm-knob-base'), 0);
        state.angle = finite(group.getAttribute('data-rm-angle-turned'), 0);
        state.stopIndex = 0;
    } else if (type === 'sequence') {
        group.removeAttribute('data-rm-miss'); group.removeAttribute('data-rm-match'); group.removeAttribute('data-rm-done');
        for (const key of own(group, '[data-rm-code]')) key.removeAttribute('data-rm-done');
        state.entered = []; state.pressed = new Set();
        state.answer = words(group.getAttribute('data-rm-answer'));
    }
    state.initial = { on: new Set(state.on || []), picked: state.picked || '', index: state.index || 1 };
}

function resetStateful(state) {
    const { group, type, initial } = state;
    if (type === 'toggle') state.on = new Set(initial.on);
    if (type === 'pick' || type === 'roll') state.picked = initial.picked;
    if (type === 'pager') state.index = initial.index;
    if (type === 'connect') {
        state.lines?.remove(); state.lines = null;
        state.pairs = []; state.paired = new Set(); state.armed = null;
        group.removeAttribute('data-rm-miss');
    }
    if (type === 'turn') { state.angle = 0; state.stopIndex = 0; }
    if (type === 'sequence') { state.entered = []; state.pressed = new Set(); group.removeAttribute('data-rm-miss'); }
}

function stepTurn(state, direction) {
    const step = state.stops ? 360 / state.stops : 30;
    state.angle = Math.round((state.angle + direction * step) / step) * step;
}

function snapTurn(state) {
    if (!state.stops) return;
    const step = 360 / state.stops;
    state.angle = Math.round(state.angle / step) * step;
}

// 点了某个部件：返回是否真的改变了状态。
function statefulAction(state, control) {
    const { group, type } = state;
    if (type === 'toggle') {
        const key = control.hasAttribute('data-rm-toggle') ? behaviorToggleKey(control.getAttribute('data-rm-toggle')) : 'on';
        if (state.on.has(key)) state.on.delete(key); else state.on.add(key);
        return true;
    }
    if (type === 'pick' && control.hasAttribute('data-rm-pick')) {
        const key = String(control.getAttribute('data-rm-pick') || '').trim();
        if (!key || key === state.picked) return false;
        state.picked = key;
        return true;
    }
    if (type === 'roll' && control.hasAttribute('data-rm-roll')) {
        const options = rollOptions(state).filter(key => key !== state.picked);
        if (!options.length) return false;
        state.picked = options[randomBelow(options.length)];
        return true;
    }
    if (type === 'pager') {
        const total = state.pages.length;
        let next = state.index;
        if (control.hasAttribute('data-rm-goto')) next = Math.round(finite(control.getAttribute('data-rm-goto'), state.index));
        else if (control.hasAttribute('data-rm-next')) next = state.index + 1;
        else if (control.hasAttribute('data-rm-prev')) next = state.index - 1;
        return turnPage(state, next, total);
    }
    if (type === 'connect' && control.hasAttribute('data-rm-end')) {
        if (state.paired.has(control)) return false;
        group.removeAttribute('data-rm-miss');
        if (!state.armed) { state.armed = control; return true; }
        if (state.armed === control) { state.armed = null; return true; }
        const armed = state.armed;
        state.armed = null;
        const key = String(armed.getAttribute('data-rm-end') || '').trim();
        if (key && key === String(control.getAttribute('data-rm-end') || '').trim()) {
            state.pairs.push([armed, control, key]); state.paired.add(armed); state.paired.add(control);
        } else group.setAttribute('data-rm-miss', 'true');
        return true;
    }
    if (type === 'turn' && control.hasAttribute('data-rm-knob')) {
        if (Date.now() < (state.suppressClickUntil || 0)) return false;
        stepTurn(state, 1);
        return true;
    }
    if (type === 'sequence' && control.hasAttribute('data-rm-code')) {
        const key = String(control.getAttribute('data-rm-code') || '').trim();
        if (!key || group.getAttribute('data-rm-match') === 'true' || group.getAttribute('data-rm-done') === 'true') return false;
        group.removeAttribute('data-rm-miss');
        state.entered.push(key); state.pressed.add(control);
        if (state.answer.length && !state.entered.every((item, index) => state.answer[index] === item)) {
            state.entered = []; state.pressed = new Set();
            group.setAttribute('data-rm-miss', 'true');
        }
        return true;
    }
    return false;
}

function turnPage(state, next, total = state.pages.length) {
    if (!total) return false;
    const target = state.loop ? mod(next - 1, total) + 1 : Math.min(Math.max(1, next), total);
    if (target === state.index) return false;
    state.index = target;
    return true;
}

function linesLayer(state) {
    if (state.lines?.isConnected && state.group.contains(state.lines)) return state.lines;
    const svg = state.group.ownerDocument.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('data-rm-lines', '');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:5;';
    try {
        if (state.group.ownerDocument.defaultView?.getComputedStyle?.(state.group)?.position === 'static') style(state, state.group, 'position', 'relative');
    } catch { /* 读不到样式就按原样 */ }
    state.group.appendChild(svg);
    state.lines = svg;
    return svg;
}

function drawLines(state) {
    if (!state.pairs.length) { state.lines?.remove(); state.lines = null; return; }
    const svg = linesLayer(state);
    while (svg.firstChild) svg.firstChild.remove();
    const box = state.group.getBoundingClientRect();
    const sx = box.width ? state.group.offsetWidth / box.width : 1;
    const sy = box.height ? state.group.offsetHeight / box.height : 1;
    const centre = node => {
        const rect = node.getBoundingClientRect();
        return [(rect.left + rect.width / 2 - box.left) * sx - state.group.clientLeft, (rect.top + rect.height / 2 - box.top) * sy - state.group.clientTop];
    };
    for (const [a, b, key] of state.pairs) {
        const [x1, y1] = centre(a), [x2, y2] = centre(b);
        const line = svg.ownerDocument.createElementNS(SVG_NS, 'line');
        for (const [name, value] of [['x1', x1], ['y1', y1], ['x2', x2], ['y2', y2]]) line.setAttribute(name, value.toFixed(1));
        line.setAttribute('stroke', 'currentColor'); line.setAttribute('stroke-width', '2'); line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('data-rm-line', key);
        svg.appendChild(line);
    }
}

// 把驱动状态写到容器、部件与显示内容上。
function syncState(state) {
    const { group, type } = state;
    if (type === 'toggle') {
        const tokens = [...state.on];
        if (tokens.length) group.setAttribute('data-rm-on', tokens.join(' ')); else group.removeAttribute('data-rm-on');
        const controls = own(group, '[data-rm-toggle]');
        const single = new Set(controls.map(node => behaviorToggleKey(node.getAttribute('data-rm-toggle'))));
        const groupOn = single.size <= 1 ? tokens.length > 0 : false;
        mirrorBehaviorState(state.root, group, groupOn);
        if (!controls.length && group.getAttribute('role') === 'button') group.setAttribute('aria-pressed', String(groupOn));
        // 只有一个开关时，CSS 里写成 .inner.flipped 之类的子元素也跟着变。
        if (single.size <= 1) for (const node of own(group, '[class]').slice(0, 40)) {
            if (!node.hasAttribute('data-rm-toggle') && !node.hasAttribute('data-rm-show')) mirrorBehaviorState(state.root, node, groupOn);
        }
        for (const control of controls) {
            const on = state.on.has(behaviorToggleKey(control.getAttribute('data-rm-toggle')));
            control.setAttribute('aria-pressed', String(on));
            setFlag(control, 'data-rm-active', on);
            mark(state, control, on, ['data-rm-on', 'data-rm-active', 'aria-pressed', 'data-rm-show']);
        }
    } else if (type === 'pick' || type === 'roll') {
        if (state.picked) group.setAttribute('data-rm-picked', state.picked); else group.removeAttribute('data-rm-picked');
        // 模型的样式按容器上的某个属性值切换（如 .sheet[data-scale="2"] …）时，选中的键同步写进这个属性。
        const pickAttr = String(group.getAttribute('data-rm-pick-attr') || '');
        const validAttr = /^(?:data-(?!rm-|rabbit)[\w-]+|aria-[\w-]+)$/.test(pickAttr);
        if (validAttr && state.picked && group.getAttribute(pickAttr) !== state.picked) group.setAttribute(pickAttr, state.picked);
        for (const control of own(group, '[data-rm-pick]')) {
            const on = Boolean(state.picked) && String(control.getAttribute('data-rm-pick') || '').trim() === state.picked;
            control.setAttribute('aria-pressed', String(on));
            setFlag(control, 'data-rm-active', on);
            mark(state, control, on, ['data-rm-active', 'aria-pressed', 'data-rm-picked', validAttr ? pickAttr : '']);
        }
    } else if (type === 'pager') {
        const total = state.pages.length;
        group.setAttribute('data-rm-index', String(state.index));
        style(state, group, '--rm-index', String(state.index));
        style(state, group, '--rm-pages', String(total));
        state.pages.forEach((page, offset) => {
            const current = offset + 1 === state.index;
            setBehaviorNodeVisible(page, current);
            setFlag(page, 'data-rm-current', current);
            mirrorBehaviorState(state.root, page, current);
        });
        for (const control of own(group, '[data-rm-prev], [data-rm-next], [data-rm-goto]')) {
            if (control.hasAttribute('data-rm-goto')) {
                const on = Math.round(finite(control.getAttribute('data-rm-goto'), 0)) === state.index;
                control.setAttribute('aria-pressed', String(on));
                setFlag(control, 'data-rm-active', on);
                mark(state, control, on, ['data-rm-active', 'aria-pressed', 'data-rm-index']);
                continue;
            }
            // 到头时只标 aria-disabled／data-rm-edge，不用 disabled（不让按钮变灰看不清，也合“不写 disabled”）。
            const edge = !state.loop && (control.hasAttribute('data-rm-next') ? state.index >= total : state.index <= 1);
            if (edge) { control.setAttribute('aria-disabled', 'true'); control.setAttribute('data-rm-edge', ''); }
            else if (control.hasAttribute('data-rm-edge')) { control.removeAttribute('aria-disabled'); control.removeAttribute('data-rm-edge'); }
        }
    } else if (type === 'connect') {
        for (const end of own(group, '[data-rm-end]')) {
            setFlag(end, 'data-rm-paired', state.paired.has(end));
            setFlag(end, 'data-rm-armed', state.armed === end);
            mirrorBehaviorState(state.root, end, state.paired.has(end) || state.armed === end);
            if (!behaviorCssMentions(state.root, ['data-rm-armed'])) {
                if (state.armed === end) { style(state, end, 'outline', '2px dashed currentColor'); style(state, end, 'outline-offset', '3px'); end.setAttribute(FEEDBACK_ATTR, ''); }
                else { unstyle(state, end, ['outline', 'outline-offset']); end.removeAttribute(FEEDBACK_ATTR); }
            }
        }
        const counts = new Map();
        for (const end of own(group, '[data-rm-end]')) {
            const key = String(end.getAttribute('data-rm-end') || '').trim();
            if (key) counts.set(key, (counts.get(key) || 0) + 1);
        }
        const needed = [...counts.values()].filter(value => value > 1).reduce((sum, value) => sum + Math.floor(value / 2), 0);
        style(state, group, '--rm-count', String(state.pairs.length));
        setFlag(group, 'data-rm-done', needed > 0 && state.pairs.length >= needed);
        drawLines(state);
    } else if (type === 'turn') {
        const angle = mod(state.angle, 360);
        if (state.stops) state.stopIndex = mod(Math.round(state.angle / (360 / state.stops)), state.stops);
        style(state, state.knob, 'rotate', `${(state.baseRotation + state.angle).toFixed(1)}deg`);
        if (state.angle) group.setAttribute('data-rm-angle-turned', state.angle.toFixed(1)); else group.removeAttribute('data-rm-angle-turned');
        style(state, group, '--rm-angle', `${angle.toFixed(1)}deg`);
        style(state, group, '--rm-p', String((angle / 360).toFixed(4)));
        state.progress = angle / 360;
        if (state.stops) group.setAttribute('data-rm-index', String(state.stopIndex)); else group.removeAttribute('data-rm-index');
        const answer = String(group.getAttribute('data-rm-answer') || '').trim();
        if (answer !== '' && state.stops) setFlag(group, 'data-rm-match', Number(answer) === state.stopIndex);
    } else if (type === 'sequence') {
        const keys = own(group, '[data-rm-code]');
        if (state.entered.length) group.setAttribute('data-rm-seq', state.entered.join(' ')); else group.removeAttribute('data-rm-seq');
        style(state, group, '--rm-count', String(state.entered.length));
        if (state.answer.length) setFlag(group, 'data-rm-match', state.entered.length === state.answer.length && state.entered.every((item, index) => state.answer[index] === item));
        else setFlag(group, 'data-rm-done', keys.length > 0 && keys.every(key => state.pressed.has(key)));
        for (const key of keys) {
            const on = state.pressed.has(key);
            setFlag(key, 'data-rm-done', on);
            key.setAttribute('aria-pressed', String(on));
            mark(state, key, on, ['data-rm-done', 'aria-pressed', 'data-rm-seq']);
        }
    }
}

// 横划翻页：只记起点，不抢指针、不拦滚动；松手时横向位移够大才翻。
function startSwipe(binding, state, event) {
    binding.swipe = { state, id: event.pointerId, x: event.clientX, y: event.clientY };
}

function finishSwipe(binding, event, cancelled = false) {
    const swipe = binding.swipe;
    if (!swipe || (event.pointerId != null && swipe.id !== event.pointerId)) return;
    binding.swipe = null;
    if (cancelled || !binding.root.contains(swipe.state.group)) return;
    const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (turnPage(swipe.state, swipe.state.index + (dx < 0 ? 1 : -1))) swipe.state.changed = true;
    refreshResults(swipe.state);
}

function pointerAngle(session, event) {
    return Math.atan2(event.clientY - session.cy, event.clientX - session.cx) * 180 / Math.PI;
}


function localPoint(surface, event) {
    const rect = surface.getBoundingClientRect();
    const sx = surface.clientWidth > 0 && rect.width > 0 ? surface.clientWidth / rect.width : 1;
    const sy = surface.clientHeight > 0 && rect.height > 0 ? surface.clientHeight / rect.height : 1;
    return { x: clamp(event.clientX - rect.left, 0, rect.width) * sx, y: clamp(event.clientY - rect.top, 0, rect.height) * sy, width: rect.width * sx, sx, sy };
}

function moveItem(state, item, x, y) {
    let position = state.positions.get(item);
    if (!position) {
        const raw = item.ownerDocument.defaultView?.getComputedStyle?.(item)?.translate || item.style.getPropertyValue('translate');
        const base = raw && raw !== 'none' ? raw.trim().split(/\s+/) : [];
        position = { x: 0, y: 0, base: [base[0] || '0px', base[1] || '0px'] };
        state.positions.set(item, position);
    }
    position.x = x; position.y = y;
    style(state, item, 'translate', `calc(${position.base[0]} + ${x}px) calc(${position.base[1]} + ${y}px)`);
}

function matchingSlot(state, item) {
    const key = item.getAttribute('data-rm-item');
    const slots = own(state.group, '[data-rm-slot]').filter(node => key && node.getAttribute('data-rm-slot') === key);
    return slots.length === 1 ? slots[0] : null;
}

function placeItem(state, item, slot) {
    const box = slot.getBoundingClientRect(), current = item.getBoundingClientRect();
    const groupBox = state.group.getBoundingClientRect();
    const sx = groupBox.width ? state.group.clientWidth / groupBox.width : 1;
    const sy = groupBox.height ? state.group.clientHeight / groupBox.height : 1;
    const position = state.positions.get(item) || { x: 0, y: 0 };
    moveItem(state, item, position.x + (box.left + box.width / 2 - current.left - current.width / 2) * sx,
        position.y + (box.top + box.height / 2 - current.top - current.height / 2) * sy);
    state.placed.add(item);
    state.changed = true;
}

function dragButton(state, item, button) {
    if (button.hasAttribute('data-rm-place')) {
        const slot = matchingSlot(state, item);
        if (!slot) return false;
        placeItem(state, item, slot);
        return true;
    }
    if (button.hasAttribute('data-rm-return')) {
        if (!state.positions.has(item)) return false;
        const saved = state.styles.get(item)?.get('translate');
        if (saved?.[0]) item.style.setProperty('translate', ...saved);
        else item.style.removeProperty('translate');
        state.styles.get(item)?.delete('translate'); state.positions.delete(item); state.placed.delete(item);
        return true;
    }
    const delta = { left: [-20, 0], right: [20, 0], up: [0, -20], down: [0, 20] }[button.getAttribute('data-rm-move')];
    if (!delta) return false;
    const position = state.positions.get(item) || { x: 0, y: 0 };
    moveItem(state, item, position.x + delta[0], position.y + delta[1]);
    state.placed.delete(item);
    return true;
}

function drawPoint(session, event) {
    const svg = session.surface;
    const matrix = svg.getScreenCTM?.();
    let x, y;
    if (matrix && svg.createSVGPoint) {
        const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
        const local = point.matrixTransform(matrix.inverse()); x = local.x; y = local.y;
    } else {
        const rect = svg.getBoundingClientRect(), view = svg.viewBox?.baseVal;
        x = (event.clientX - rect.left) / Math.max(1, rect.width) * (view?.width || rect.width) + (view?.x || 0);
        y = (event.clientY - rect.top) / Math.max(1, rect.height) * (view?.height || rect.height) + (view?.y || 0);
    }
    if (!Number.isFinite(x) || !Number.isFinite(y) || session.points >= 8000) return;
    session.pathData += `${session.points++ ? ' L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
    session.path.setAttribute('d', session.pathData);
}

function pointerMove(binding, event) {
    const session = binding.pointer;
    if (!session || session.id !== event.pointerId) return;
    const { state, surface, item } = session;
    if (!binding.root.contains(state.group)) { finishPointer(binding, event, true); return; }
    if (state.type === 'drag' || state.type === 'reorder') {
        moveItem(state, item, session.x + (event.clientX - session.startX) * session.sx, session.y + (event.clientY - session.startY) * session.sy);
        if (event.clientX !== session.startX || event.clientY !== session.startY) { state.changed = true; state.placed.delete(item); }
    } else if (state.type === 'draw') { drawPoint(session, event); if (session.points > 1) state.changed = true; }
    else if (state.type === 'reveal') {
        const point = localPoint(surface, event); reveal(state, point.x / Math.max(1, point.width)); state.changed = true;
    } else if (state.type === 'follow') {
        const point = localPoint(surface, event);
        style(state, state.group, '--rm-x', `${point.x}px`); style(state, state.group, '--rm-y', `${point.y}px`); state.changed = true;
    } else if (state.type === 'turn') {
        const angle = pointerAngle(session, event);
        const delta = mod(angle - session.last + 180, 360) - 180;
        session.last = angle;
        if (Number.isFinite(delta) && Math.hypot(event.clientX - session.cx, event.clientY - session.cy) > 4) {
            session.turned += Math.abs(delta);
            state.angle += delta;
            if (session.turned > 3) state.changed = true;
        }
    }
    refreshResults(state);
    if (event.cancelable) event.preventDefault();
}

function finishPointer(binding, event, cancelled = false) {
    const session = binding.pointer;
    if (!session || (event.pointerId != null && session.id !== event.pointerId)) return;
    binding.pointer = null;
    const { state, item, surface } = session;
    if (state.type === 'hold') { setHoldActive(state, null, false); binding.holds.delete(state); }
    if (state.type === 'turn') {
        if (cancelled) state.angle = session.angleBefore;
        else if (session.turned > 3) {
            snapTurn(state);
            // 拖转后浏览器还会补发一次 click，别把它当成“点按前进一格”。
            state.suppressClickUntil = Date.now() + 450;
        }
    }
    if (item && cancelled) {
        moveItem(state, item, session.x, session.y);
        state.changed = session.changedBefore;
        if (session.wasPlaced) state.placed.add(item);
    }
    if (item && !cancelled && state.type === 'drag') {
        const slot = matchingSlot(state, item);
        if (slot) {
            const box = slot.getBoundingClientRect();
            if (event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom) placeItem(state, item, slot);
        }
    }
    if (item && state.type === 'reorder') {
        if (!cancelled) {
            const target = own(state.group, '[data-rm-item]').find(node => {
                if (node === item || node.parentElement !== item.parentElement) return false;
                const rect = node.getBoundingClientRect();
                return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
            });
            if (target) {
                const box = target.getBoundingClientRect(), origin = session.box;
                const horizontal = Math.abs(box.left - origin.left) > Math.abs(box.top - origin.top);
                const after = horizontal ? event.clientX > box.left + box.width / 2 : event.clientY > box.top + box.height / 2;
                item.parentElement.insertBefore(item, after ? target.nextSibling : target);
                state.changed = true;
            }
        }
        moveItem(state, item, session.x, session.y);
    }
    refreshResults(state);
    try { surface.releasePointerCapture?.(session.id); } catch { /* Already released by the browser. */ }
}

// 按住时，外层 data-rm-ui="hold" 容器和按下的那个按钮都带 data-rm-active="true"：
// 模型写 [data-rm-ui="hold"][data-rm-active] … 或 button[data-rm-hold][data-rm-active] ~ … 都能生效；松开时两处一起撤掉。
function setHoldActive(state, button, on) {
    const needles = ['data-rm-active', 'data-rm-show'];
    if (on) {
        state.group.setAttribute('data-rm-active', 'true');
        mirrorBehaviorState(state.root, state.group, true);
        if (button?.matches?.('[data-rm-hold]')) { button.setAttribute('data-rm-active', 'true'); mark(state, button, true, needles); }
        return;
    }
    state.group.removeAttribute('data-rm-active');
    mirrorBehaviorState(state.root, state.group, false);
    for (const node of state.group.querySelectorAll('[data-rm-hold]')) {
        node.removeAttribute('data-rm-active');
        mark(state, node, false, needles);
    }
}

function pointerDown(binding, event) {
    if (binding.pointer || event.isPrimary === false || (event.button != null && event.button !== 0)) return;
    const state = stateFor(binding.root, event.target);
    if (!state) return;
    const { group, type } = state;
    let item, surface;
    if (type === 'hold') surface = event.target.closest('[data-rm-hold]');
    else if (type === 'turn') surface = event.target.closest('[data-rm-knob]');
    else {
        if (event.target.closest('button, input, textarea, select, a')) return;
        if (type === 'pager') {
            const interactive = event.target.closest('label, summary, [role="button"], [data-rm-prev], [data-rm-next], [data-rm-goto]');
            if ((!interactive || !group.contains(interactive)) && state.pages.length > 1) startSwipe(binding, state, event);
            return;
        }
        if (type === 'drag' || type === 'reorder') {
            surface = item = event.target.closest('[data-rm-item]');
            if (event.pointerType === 'touch' && usesMobileInteractionButtons(binding.root, item)) return;
        }
        else if (type === 'draw') surface = event.target.closest('svg[data-rm-canvas]');
        else if (type === 'follow') surface = event.target.closest('[data-rm-surface]');
        else if (type === 'reveal' && !first(group, 'input[type="range"]')) surface = first(group, '[data-rm-surface]') || group;
    }
    if (!surface || surface.closest(GROUP) !== group || ((type === 'hold' || type === 'turn') && !isControl(surface))) return;
    const point = localPoint(group, event), position = state.positions.get(item);
    const session = { state, surface, item, changedBefore: state.changed, wasPlaced: state.placed.has(item), id: event.pointerId, startX: event.clientX, startY: event.clientY, x: position?.x || 0, y: position?.y || 0, sx: point.sx, sy: point.sy, box: item?.getBoundingClientRect() };
    binding.pointer = session;
    if (type === 'draw') {
        session.path = surface.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
        session.path.setAttribute('fill', 'none'); session.path.setAttribute('stroke', 'currentColor'); session.path.setAttribute('stroke-width', '2');
        session.path.setAttribute('stroke-linecap', 'round'); session.path.setAttribute('pointer-events', 'none');
        session.points = 0; session.pathData = ''; state.strokes.add(session.path); surface.appendChild(session.path);
    }
    if (type === 'turn') {
        const rect = surface.getBoundingClientRect();
        session.cx = rect.left + rect.width / 2; session.cy = rect.top + rect.height / 2;
        session.last = pointerAngle(session, event); session.turned = 0; session.angleBefore = state.angle;
    }
    if (type === 'hold') { setHoldActive(state, surface, true); binding.holds.add(state); state.changed = true; }
    try { surface.setPointerCapture?.(event.pointerId); } catch { /* Synthetic or no active pointer. */ }
    pointerMove(binding, event);
}

// 接力：插件修复修不好的这一块整块退还给老修复器。先把驱动对它做过的事全部撤掉（状态、内联样式、
// 同步上的类、兜底描边、显隐、连线），再去掉 data-rm-ui，留下 data-rm-released 记号，之后打开、克隆都不再接插件。
const RELEASED_ATTR = 'data-rm-released';
const STATE_ATTRS = ['data-rm-on', 'data-rm-picked', 'data-rm-index', 'data-rm-active', 'data-rm-match', 'data-rm-miss', 'data-rm-done', 'data-rm-seq', 'data-rm-angle-turned'];
export function releaseBehaviorGroup(root, group) {
    if (!group?.matches?.(GROUP)) return false;
    const type = group.getAttribute('data-rm-ui');
    const binding = roots.get(root);
    const state = binding?.groups.get(group);
    if (state) {
        if (binding.pointer?.state === state) finishPointer(binding, {}, true);
        binding.holds.delete(state); binding.connects.delete(state);
        try { reset(state); } catch (error) { console.debug('[RabbitMirror] release reset failed:', error); }
        binding.groups.delete(group);
    }
    owners.delete(group);
    for (const node of [group, ...group.querySelectorAll('*')]) {
        if (node !== group && node.matches?.(GROUP)) continue;
        if (node.hasAttribute?.('data-rm-result-active')) {
            setBehaviorNodeVisible(node, true);
            node.removeAttribute('data-rm-result-active'); node.removeAttribute('data-rm-result-display'); node.removeAttribute('data-rm-result-display-priority');
        }
        if (node.hasAttribute?.('data-rm-mirrored')) mirrorBehaviorState(state?.root || root, node, false);
        if (node.hasAttribute?.(FEEDBACK_ATTR)) { node.style.removeProperty('outline'); node.style.removeProperty('outline-offset'); node.removeAttribute(FEEDBACK_ATTR); }
        for (const name of ['data-rm-current', 'data-rm-paired', 'data-rm-armed', 'data-rm-edge']) node.removeAttribute?.(name);
    }
    for (const svg of group.querySelectorAll('svg[data-rm-lines]')) svg.remove();
    for (const name of STATE_ATTRS) group.removeAttribute(name);
    group.setAttribute(RELEASED_ATTR, type || 'unknown');
    group.removeAttribute('data-rm-ui');
    return true;
}

// 写错的插件标识（类型别名、漏 rm 前缀、类型与部件对不上、容器没包住按钮、只写部件没写容器）
// 由 behaviorRepair 按类补齐；这里只负责接线。
function genericControl(root, target) {
    const control = target?.closest?.(CONTROL_SELECTOR);
    if (!control || !isControl(control)) return null;
    const state = stateFor(root, control);
    if (!state || control.closest(GROUP) !== state.group) return null;
    if (!control.hasAttribute('data-rm-reset') && !(TYPE_CONTROLS[state.type] || []).some(name => control.hasAttribute(`data-rm-${name}`))) return null;
    return { state, control };
}

// 整个容器当开关的 toggle：点到容器里任何非控件处都翻。
function containerToggle(root, target) {
    const state = stateFor(root, target);
    if (state?.type !== 'toggle' || own(state.group, '[data-rm-toggle]').length) return null;
    const interactive = target.closest?.('a[href], button, input, textarea, select, label, summary, [role="button"], [popover]');
    if (interactive && interactive !== state.group && state.group.contains(interactive)) return null;
    return state;
}

export function installBehaviorInteractions(root) {
    // 维修兔以前确认过“老修复器修不好、插件能接”的手写块，打开时先写上插件标识（反向接力）。
    try { applyRememberedReversePatches(root); } catch { /* 记忆读不到就照常 */ }
    try { repairBehaviorDeclarations(root); } catch (error) { console.debug('[RabbitMirror] behavior repair skipped:', error); }
    // 维修兔以前确认过“插件修不好、老修复器能修”的块，打开时直接交给老修复器。
    try { applyRememberedBehaviorRelay(root); } catch { /* 记忆读不到就照常接插件 */ }
    if (!root?.addEventListener) return 0;
    const existing = roots.get(root);
    const binding = existing || { root, groups: new WeakMap(), pointer: null, swipe: null, holds: new Set(), connects: new Set() };
    roots.set(root, binding);
    const groups = [...root.querySelectorAll(GROUP)];
    if (root.matches?.(GROUP)) groups.unshift(root);
    const count = groups.filter(group => !binding.groups.has(group) && prepare(binding, group)).length;
    for (const group of groups) { const state = binding.groups.get(group); if (state?.type === 'connect') binding.connects.add(state); }
    if (existing) return count;
    root.addEventListener('input', event => { const state = stateFor(root, event.target); if (state) inputChange(state, event.target, true); });
    root.addEventListener('click', event => {
        const button = event.target.closest?.('button, input[type="button"]');
        if (hasBehaviorInteractionControl(root, button)) {
            const state = stateFor(root, button);
            if (state && button.hasAttribute('data-rm-reset') && binding.pointer?.state === state) finishPointer(binding, {}, true);
            event.preventDefault(); action(state, button);
            return;
        }
        if (button) return;
        const found = genericControl(root, event.target);
        if (found) {
            // label 被点时浏览器会再替它点一次里面的输入框；那一次不算第二下。
            if (found.control.matches('label') && event.target !== found.control && event.target.matches?.('input')) return;
            if (found.control.hasAttribute('data-rm-reset') && binding.pointer?.state === found.state) finishPointer(binding, {}, true);
            if (!found.control.matches('label')) event.preventDefault();
            action(found.state, found.control);
            return;
        }
        const toggle = containerToggle(root, event.target);
        if (toggle) action(toggle, toggle.group);
    });
    root.addEventListener('pointerdown', event => pointerDown(binding, event));
    root.addEventListener('pointermove', event => pointerMove(binding, event));
    root.addEventListener('pointerup', event => { finishPointer(binding, event); finishSwipe(binding, event); });
    root.addEventListener('pointercancel', event => { finishPointer(binding, event, true); finishSwipe(binding, event, true); });
    root.addEventListener('lostpointercapture', event => finishPointer(binding, event, true));
    root.addEventListener('keydown', event => {
        const state = stateFor(root, event.target);
        if (state?.type === 'hold' && event.target.matches('[data-rm-hold]') && [' ', 'Enter'].includes(event.key)) {
            event.preventDefault(); setHoldActive(state, event.target, true); binding.holds.add(state); state.changed = true; refreshResults(state);
        } else if (state?.type === 'turn' && event.target.matches('[data-rm-knob]') && /^Arrow(?:Up|Down|Left|Right)$/.test(event.key)) {
            event.preventDefault(); stepTurn(state, /Up|Right/.test(event.key) ? 1 : -1); state.changed = true; refreshResults(state);
        } else if ([' ', 'Enter'].includes(event.key) && !isNative(event.target)) {
            // 非 button 的部件也能用键盘操作。
            const found = genericControl(root, event.target);
            const target = found?.control === event.target ? found : (containerToggle(root, event.target) && event.target.matches(GROUP) ? { state: stateFor(root, event.target), control: event.target } : null);
            if (target && !target.control.matches('[data-rm-hold]')) { event.preventDefault(); action(target.state, target.control); }
        }
        if (event.key === 'Escape' && binding.pointer) finishPointer(binding, event, true);
    });
    const releaseHold = event => {
        const state = stateFor(root, event.target);
        if (state?.type === 'hold' && (event.type === 'focusout' || [' ', 'Enter'].includes(event.key))) {
            setHoldActive(state, null, false); binding.holds.delete(state); refreshResults(state);
        }
    };
    root.addEventListener('keyup', releaseHold);
    root.addEventListener('focusout', releaseHold);
    root.addEventListener('toggle', event => {
        const changed = event.target;
        if (!changed?.matches?.('details') || !root.contains(changed)) return;
        if (changed.open) {
            // 连线按位置画；折叠时量不到位置，展开后重画一次。
            for (const state of binding.connects) if (changed.contains(state.group) && root.contains(state.group)) drawLines(state);
            return;
        }
        if (binding.pointer && changed.contains(binding.pointer.state.group)) finishPointer(binding, {}, true);
        for (const state of binding.holds) {
            if (!changed.contains(state.group)) continue;
            setHoldActive(state, null, false); refreshResults(state); binding.holds.delete(state);
        }
    }, true);
    return count;
}
