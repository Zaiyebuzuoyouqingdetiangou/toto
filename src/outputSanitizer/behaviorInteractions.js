import { updateBehaviorResults } from './behaviorResults.js?rmv=1.65.7';
import { hasMobileInteractionControl, usesMobileInteractionButtons } from './mobileInteractionControls.js?rmv=1.65.7';

// Declarative, face-local behaviors. No generated code, global targets or timers.
const roots = new WeakMap();
const owners = new WeakMap();
const GROUP = '[data-rm-ui]';
const TYPES = new Set(['effect', 'drag', 'adjust', 'reveal', 'view', 'input', 'draw', 'motion', 'hold', 'follow', 'reorder', 'accumulate']);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const own = (group, selector) => [...group.querySelectorAll(selector)].filter(node => node.closest(GROUP) === group);
const first = (group, selector) => own(group, selector)[0];
const isButton = node => node?.matches?.('button, input[type="button"]') && !node.disabled;

function refreshResults(state) {
    const range = first(state.group, 'input[type="range"]');
    updateBehaviorResults(state.group, {
        changed: Boolean(state.changed), p: range ? rangeValue(range).p : (state.progress || 0),
        active: state.group.getAttribute('data-rm-active') === 'true',
        match: state.group.getAttribute('data-rm-match') === 'true',
        count: own(state.group, 'button[data-rm-step]').filter(node => node.getAttribute('data-rm-done') === 'true').length,
        order: own(state.group, '[data-rm-item]').map(node => node.getAttribute('data-rm-item')),
        placed: [...state.placed].filter(node => state.group.contains(node)).map(node => node.getAttribute('data-rm-item')),
    });
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
    for (const cover of own(state.group, '[data-rm-cover]')) style(state, cover, 'clip-path', `inset(0 0 0 ${value * 100}%)`);
    const range = first(state.group, 'input[type="range"]');
    if (range) {
        const min = range.min === '' ? 0 : finite(range.min);
        const max = range.max === '' ? 100 : finite(range.max, 100);
        range.value = String(min + value * Math.max(0, max - min));
    }
}

function countSteps(state) {
    const steps = own(state.group, 'button[data-rm-step]');
    style(state, state.group, '--rm-count', String(steps.filter(node => node.getAttribute('data-rm-done') === 'true').length));
    for (const step of steps) step.setAttribute('aria-pressed', String(step.getAttribute('data-rm-done') === 'true'));
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
    const selectors = {
        effect: '[data-rm-part]', drag: '[data-rm-item]', adjust: 'input[type="range"]',
        reveal: '[data-rm-cover]', view: '[data-rm-part]', input: 'output', draw: 'svg[data-rm-canvas]',
        motion: '[data-rm-part]', hold: 'button[data-rm-hold]', follow: '[data-rm-surface]',
        reorder: '[data-rm-item]', accumulate: 'button[data-rm-step]',
    };
    return TYPES.has(type) && Boolean(first(group, selectors[type]));
}

function prepare(binding, group) {
    if (binding.groups.has(group)) return binding.groups.get(group);
    const type = group.getAttribute('data-rm-ui');
    if (!validGroup(group, type)) return null;
    const state = { group, type, styles: new Map(), positions: new Map(), orders: new Map(), animations: new Set(), strokes: new Set(), placed: new Set(), changed: false, progress: 0 };
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
    if (type === 'view') style(state, group, 'overflow', 'auto');
    if (type === 'effect') for (const animation of animations(state)) { animation.pause(); animation.currentTime = 0; }
    if (type === 'accumulate') countSteps(state);
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
    const attrs = { drag: ['place', 'return', 'move'], effect: ['fire'], motion: ['play', 'reverse'], hold: ['hold'], reorder: ['prev', 'next'], accumulate: ['step'] };
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
    if (state.type === 'hold') { state.group.removeAttribute('data-rm-active'); owners.get(state.group)?.holds.delete(state); }
    if (state.type === 'accumulate') {
        for (const step of own(state.group, 'button[data-rm-step]')) step.removeAttribute('data-rm-done');
        countSteps(state);
    }
    if (state.type === 'adjust' || state.type === 'view') {
        const range = first(state.group, 'input[type="range"]');
        if (range) inputChange(state, range);
    }
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
    }
    refreshResults(state);
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
    }
    refreshResults(state);
    if (event.cancelable) event.preventDefault();
}

function finishPointer(binding, event, cancelled = false) {
    const session = binding.pointer;
    if (!session || (event.pointerId != null && session.id !== event.pointerId)) return;
    binding.pointer = null;
    const { state, item, surface } = session;
    if (state.type === 'hold') { state.group.removeAttribute('data-rm-active'); binding.holds.delete(state); }
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

function pointerDown(binding, event) {
    if (binding.pointer || event.isPrimary === false || (event.button != null && event.button !== 0)) return;
    const state = stateFor(binding.root, event.target);
    if (!state) return;
    const { group, type } = state;
    let item, surface;
    if (type === 'hold') surface = event.target.closest('[data-rm-hold]');
    else {
        if (event.target.closest('button, input, textarea, select, a')) return;
        if (type === 'drag' || type === 'reorder') {
            surface = item = event.target.closest('[data-rm-item]');
            if (event.pointerType === 'touch' && usesMobileInteractionButtons(binding.root, item)) return;
        }
        else if (type === 'draw') surface = event.target.closest('svg[data-rm-canvas]');
        else if (type === 'follow') surface = event.target.closest('[data-rm-surface]');
        else if (type === 'reveal' && !first(group, 'input[type="range"]')) surface = first(group, '[data-rm-surface]') || group;
    }
    if (!surface || surface.closest(GROUP) !== group || (type === 'hold' && !isButton(surface))) return;
    const point = localPoint(group, event), position = state.positions.get(item);
    const session = { state, surface, item, changedBefore: state.changed, wasPlaced: state.placed.has(item), id: event.pointerId, startX: event.clientX, startY: event.clientY, x: position?.x || 0, y: position?.y || 0, sx: point.sx, sy: point.sy, box: item?.getBoundingClientRect() };
    binding.pointer = session;
    if (type === 'draw') {
        session.path = surface.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
        session.path.setAttribute('fill', 'none'); session.path.setAttribute('stroke', 'currentColor'); session.path.setAttribute('stroke-width', '2');
        session.path.setAttribute('stroke-linecap', 'round'); session.path.setAttribute('pointer-events', 'none');
        session.points = 0; session.pathData = ''; state.strokes.add(session.path); surface.appendChild(session.path);
    }
    if (type === 'hold') { group.setAttribute('data-rm-active', 'true'); binding.holds.add(state); state.changed = true; }
    try { surface.setPointerCapture?.(event.pointerId); } catch { /* Synthetic or no active pointer. */ }
    pointerMove(binding, event);
}

// 模型常把插件标识写漏 rm 前缀（data-item、data-ui="drag"）。只在声明了已知类型的局部里
// 补上标准标识，原属性保留；不猜测目标，不新增内容。
const BEHAVIOR_TYPES = new Set(['effect', 'drag', 'adjust', 'reveal', 'view', 'input', 'draw', 'motion', 'hold', 'follow', 'reorder', 'accumulate', 'scroll']);
const BEHAVIOR_ALIASES = ['item', 'slot', 'reset', 'fire', 'part', 'step', 'hold', 'surface', 'cover', 'canvas', 'play', 'reverse', 'prev', 'next', 'answer'];
function normalizeBehaviorAliases(root) {
    if (!root?.querySelectorAll) return;
    for (const node of root.querySelectorAll('[data-ui]:not([data-rm-ui])')) {
        const type = String(node.getAttribute('data-ui') || '').trim().toLowerCase();
        if (BEHAVIOR_TYPES.has(type)) node.setAttribute('data-rm-ui', type);
    }
    for (const group of root.querySelectorAll('[data-rm-ui]')) {
        for (const name of BEHAVIOR_ALIASES) {
            for (const node of [group, ...group.querySelectorAll(`[data-${name}]`)]) {
                if (!node.hasAttribute?.(`data-${name}`) || node.hasAttribute(`data-rm-${name}`)) continue;
                node.setAttribute(`data-rm-${name}`, node.getAttribute(`data-${name}`));
            }
        }
    }
}

export function installBehaviorInteractions(root) {
    try { normalizeBehaviorAliases(root); } catch { /* aliases are best effort */ }
    if (!root?.addEventListener) return 0;
    const existing = roots.get(root);
    const binding = existing || { root, groups: new WeakMap(), pointer: null, holds: new Set() };
    roots.set(root, binding);
    const groups = [...root.querySelectorAll(GROUP)];
    if (root.matches?.(GROUP)) groups.unshift(root);
    const count = groups.filter(group => !binding.groups.has(group) && prepare(binding, group)).length;
    if (existing) return count;
    root.addEventListener('input', event => { const state = stateFor(root, event.target); if (state) inputChange(state, event.target, true); });
    root.addEventListener('click', event => {
        const button = event.target.closest?.('button, input[type="button"]');
        if (!hasBehaviorInteractionControl(root, button)) return;
        const state = stateFor(root, button);
        if (state && button.hasAttribute('data-rm-reset') && binding.pointer?.state === state) finishPointer(binding, {}, true);
        event.preventDefault(); action(state, button);
    });
    root.addEventListener('pointerdown', event => pointerDown(binding, event));
    root.addEventListener('pointermove', event => pointerMove(binding, event));
    root.addEventListener('pointerup', event => finishPointer(binding, event));
    root.addEventListener('pointercancel', event => finishPointer(binding, event, true));
    root.addEventListener('lostpointercapture', event => finishPointer(binding, event, true));
    root.addEventListener('keydown', event => {
        const state = stateFor(root, event.target);
        if (state?.type === 'hold' && event.target.matches('button[data-rm-hold]') && [' ', 'Enter'].includes(event.key)) {
            event.preventDefault(); state.group.setAttribute('data-rm-active', 'true'); binding.holds.add(state); state.changed = true; refreshResults(state);
        }
        if (event.key === 'Escape' && binding.pointer) finishPointer(binding, event, true);
    });
    const releaseHold = event => {
        const state = stateFor(root, event.target);
        if (state?.type === 'hold' && (event.type === 'focusout' || [' ', 'Enter'].includes(event.key))) {
            state.group.removeAttribute('data-rm-active'); binding.holds.delete(state); refreshResults(state);
        }
    };
    root.addEventListener('keyup', releaseHold);
    root.addEventListener('focusout', releaseHold);
    root.addEventListener('toggle', event => {
        const closed = event.target;
        if (!closed?.matches?.('details') || closed.open || !root.contains(closed)) return;
        if (binding.pointer && closed.contains(binding.pointer.state.group)) finishPointer(binding, {}, true);
        for (const state of binding.holds) {
            if (!closed.contains(state.group)) continue;
            state.group.removeAttribute('data-rm-active'); refreshResults(state); binding.holds.delete(state);
        }
    }, true);
    return count;
}
