import { rmR as __rmR } from "../textTable.js?rmv=2.1.2";
import { normalizeShowToken } from './behaviorResults.js?rmv=2.1.2';
import { toLayoutPx, insideDesktopZoomFace, faceZoomEvents, evaluateMediaForVirtualPhone } from '../faceZoomMetrics.js?rmv=2.1.2';
export const EXTRA_TYPES = Object.freeze(['slide', 'timer', 'swipe', 'rhythm', 'peek', 'spoiler', 'sense']);
export const EXTRA_CONTROLS = Object.freeze({
    slide: ['prev', 'next', 'goto'], timer: ['play'], swipe: ['left', 'right'], rhythm: ['tap', 'charge', 'qte'],
    peek: ['peek'], spoiler: ['spoiler'], sense: [],
});
export const EXTRA_CONTROL_ATTRS = Object.freeze(['left', 'right', 'tap', 'charge', 'qte', 'peek', 'spoiler']);
export const EXTRA_GESTURE_TYPES = Object.freeze(['swipe', 'slide']);
const GROUP = '[data-rm-ui]';
const SANDBOX = '[data-rm-quiet-feedback]';
let H = null;
export function configureBehaviorExtras(helpers) { H = helpers; }
const inSandbox = group => Boolean(group.closest?.(SANDBOX));
const seconds = (group, name, fallback) => { const value = Number(group.getAttribute(name)); return Number.isFinite(value) && value > 0 ? value : fallback; };
const controlSeconds = (group, control, name, fallback) => {
    if (group.hasAttribute(name))
        return seconds(group, name, fallback);
    for (const node of H.own(group, control))
        if (node.hasAttribute(name))
            return seconds(node, name, fallback);
    return fallback;
};
const nowMs = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
function frame(group, callback) {
    const view = group.ownerDocument?.defaultView || globalThis;
    return typeof view.requestAnimationFrame === 'function' ? view.requestAnimationFrame(callback) : setTimeout(() => callback(nowMs()), 16);
}
const SUSPENDED = 'data-rm-animation-suspended';
const AWAKE_EVENT = 'rabbitmirror:animation-awake';
function sleeping(group, idleToo = false) {
    for (let node = group, previous = null; node; previous = node, node = node.parentElement) {
        if (node.tagName === 'DETAILS' && !node.open && !(previous?.tagName === 'SUMMARY' && previous.parentElement === node))
            return true;
        const reason = node.getAttribute?.(SUSPENDED);
        if (reason !== null && reason !== undefined && (idleToo || reason !== 'idle'))
            return true;
    }
    return group.ownerDocument?.hidden === true;
}
const sleepers = new Set();
let sleepDoc = null;
function wakeSleepers() {
    for (const sleeper of [...sleepers]) {
        if (!alive(sleeper.state)) {
            sleepers.delete(sleeper);
            continue;
        }
        if (sleeping(sleeper.state.group, sleeper.idleToo))
            continue;
        sleepers.delete(sleeper);
        sleeper.resume();
    }
    if (!sleepers.size && sleepDoc) {
        sleepDoc.removeEventListener(AWAKE_EVENT, wakeSleepers, true);
        sleepDoc.removeEventListener('toggle', wakeSleepers, true);
        sleepDoc.removeEventListener('visibilitychange', wakeSleepers);
        sleepDoc = null;
    }
}
function sleepUntilVisible(state, resume, idleToo = false) {
    for (const sleeper of sleepers)
        if (!alive(sleeper.state))
            sleepers.delete(sleeper);
    sleepers.add({ state, resume, idleToo });
    const doc = state.group.ownerDocument;
    if (doc && !sleepDoc) {
        sleepDoc = doc;
        doc.addEventListener(AWAKE_EVENT, wakeSleepers, true);
        doc.addEventListener('toggle', wakeSleepers, true);
        doc.addEventListener('visibilitychange', wakeSleepers);
    }
}
export function extraTypeFits(group, type) {
    const count = selector => (H?.own ? H.own(group, selector) : [...group.querySelectorAll(selector)].filter(node => node.closest(GROUP) === group)).length;
    switch (type) {
        case 'slide': return count('[data-rm-item]') > 1;
        case 'timer': return true;
        case 'swipe': return count('[data-rm-card]') > 0;
        case 'rhythm': return count('[data-rm-tap], [data-rm-charge], [data-rm-qte]') > 0;
        case 'peek': return count('[data-rm-peek]') > 0;
        case 'spoiler': return count('[data-rm-spoiler]') > 0;
        case 'sense': return true;
        default: return false;
    }
}
const LIVE = new Set();
export function prepareExtra(state) {
    const { group, type } = state;
    for (const old of LIVE)
        if (!old.group.isConnected) {
            LIVE.delete(old);
            destroyExtra(old);
        }
    state.extra = { timers: new Set(), medias: [] };
    LIVE.add(state);
    if (type === 'slide')
        prepareSlide(state);
    if (type === 'timer')
        prepareTimer(state);
    if (type === 'swipe')
        prepareSwipe(state);
    if (type === 'rhythm')
        prepareRhythm(state);
    if (type === 'peek')
        preparePeek(state);
    if (type === 'spoiler')
        prepareSpoiler(state);
    if (type === 'sense')
        prepareSense(state);
    for (const control of H.own(group, EXTRA_CONTROL_ATTRS.map(name => `[data-rm-${name}]`).join(', ')))
        H.enableControl(control);
}
export function destroyExtra(state) {
    LIVE.delete(state);
    state.destroyed = true;
    state.running = false;
    state.charging = false;
    for (const stop of state.extra?.timers || []) {
        try {
            stop();
        }
        catch { }
    }
    for (const [media, listener] of state.extra?.medias || []) {
        try {
            media.removeEventListener('change', listener);
        }
        catch { }
    }
    state.extra = null;
}
function alive(state) {
    if (state.destroyed)
        return false;
    if (state.group.isConnected)
        return true;
    destroyExtra(state);
    return false;
}
function slideItems(state) { return H.own(state.group, '[data-rm-item]'); }
function slideTrack(state) {
    const items = slideItems(state);
    return H.first(state.group, '[data-rm-track]') || items[0]?.parentElement || state.group;
}
function prepareSlide(state) {
    const { group } = state;
    const vertical = group.getAttribute('data-rm-axis') === 'y';
    state.vertical = vertical;
    const track = slideTrack(state);
    state.track = track;
    slideLayout(state);
    state.seen = new Set();
    state.index = 1;
    const onScroll = () => { if (alive(state)) {
        measureSlide(state);
        H.refreshResults(state);
    } };
    track.addEventListener('scroll', onScroll, { passive: true });
    state.extra.timers.add(() => track.removeEventListener('scroll', onScroll));
    if (!group.hasAttribute('data-rm-index-base') && H.cssIndexBase?.(state, slideItems(state).length) === 0)
        group.setAttribute('data-rm-index-base', '0');
    state.indexBase = group.getAttribute('data-rm-index-base') === '0' ? 0 : 1;
    const restored = Number(group.getAttribute('data-rm-index')) + 1 - state.indexBase;
    if (group.hasAttribute('data-rm-recalled') && Number.isInteger(restored) && restored > 1)
        slideTo(state, restored - 1, false);
    measureSlide(state);
}
function slideLayout(state) {
    const { group, vertical } = state;
    const track = state.track || slideTrack(state);
    const view = group.ownerDocument.defaultView;
    const computed = view?.getComputedStyle?.(track);
    const overflow = vertical ? computed?.overflowY : computed?.overflowX;
    if (!/auto|scroll/.test(overflow || '')) {
        H.style(state, track, vertical ? 'overflow-y' : 'overflow-x', 'auto');
        if (!vertical && computed?.display !== 'flex' && computed?.display !== 'grid')
            H.style(state, track, 'display', 'flex');
        if (!String(computed?.scrollSnapType || '').includes(vertical ? 'y' : 'x'))
            H.style(state, track, 'scroll-snap-type', `${vertical ? 'y' : 'x'} mandatory`);
    }
    for (const item of slideItems(state)) {
        if (!item.style.getPropertyValue('scroll-snap-align') && !String(view?.getComputedStyle?.(item)?.scrollSnapAlign || 'none').replace('none', ''))
            H.style(state, item, 'scroll-snap-align', 'start');
        if (!vertical && !item.style.getPropertyValue('flex-shrink'))
            H.style(state, item, 'flex-shrink', '0');
    }
}
function measureSlide(state) {
    const track = state.track || slideTrack(state);
    const items = slideItems(state);
    if (!items.length)
        return;
    const box = track.getBoundingClientRect();
    const size = state.vertical ? box.height : box.width;
    const start = state.vertical ? box.top : box.left;
    let best = 0, bestDistance = Infinity;
    items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const itemStart = state.vertical ? rect.top : rect.left;
        const itemSize = state.vertical ? rect.height : rect.width;
        const distance = Math.abs(itemStart - start);
        if (distance < bestDistance) {
            bestDistance = distance;
            best = index;
        }
        const visible = Math.min(itemStart + itemSize, start + size) - Math.max(itemStart, start);
        if (size > 0 && itemSize > 0 && visible >= Math.min(itemSize, size) * 0.5)
            state.seen.add(item);
    });
    state.index = best + 1;
    const total = state.vertical ? track.scrollHeight - track.clientHeight : track.scrollWidth - track.clientWidth;
    const position = state.vertical ? track.scrollTop : track.scrollLeft;
    state.progress = total > 0 ? H.clamp(position / total, 0, 1) : 0;
}
function slideTo(state, index, smooth = true) {
    const items = slideItems(state);
    const target = items[H.clamp(index, 0, items.length - 1)];
    if (!target)
        return false;
    const track = state.track || slideTrack(state);
    const box = track.getBoundingClientRect(), rect = target.getBoundingClientRect();
    const left = toLayoutPx(track, rect.left - box.left) + track.scrollLeft, top = toLayoutPx(track, rect.top - box.top) + track.scrollTop;
    try {
        track.scrollTo({ left: state.vertical ? track.scrollLeft : left, top: state.vertical ? top : track.scrollTop, behavior: smooth ? 'smooth' : 'instant' });
    }
    catch {
        if (state.vertical)
            track.scrollTop = top;
        else
            track.scrollLeft = left;
    }
    state.index = items.indexOf(target) + 1;
    return true;
}
function slideAction(state, control) {
    if (control.hasAttribute('data-rm-goto'))
        return slideTo(state, Math.round(H.finite(control.getAttribute('data-rm-goto'), state.index)) - 1);
    if (control.hasAttribute('data-rm-next'))
        return slideTo(state, state.index);
    if (control.hasAttribute('data-rm-prev'))
        return slideTo(state, state.index - 2);
    return false;
}
function slideSync(state) {
    const { group } = state;
    const items = slideItems(state);
    group.setAttribute('data-rm-index', String(state.index - 1 + (state.indexBase ?? 1)));
    H.style(state, group, '--rm-index', String(state.index));
    H.style(state, group, '--rm-p', String(Number(state.progress || 0).toFixed(4)));
    for (const item of items) {
        H.setFlag(item, 'data-rm-seen', state.seen.has(item));
        H.setFlag(item, 'data-rm-active', items.indexOf(item) + 1 === state.index);
    }
    H.setFlag(group, 'data-rm-done', items.length > 0 && items.every(item => state.seen.has(item)));
}
function slideKeys(state, keys) {
    keys.add(String(state.index));
    const current = slideItems(state)[state.index - 1];
    const name = String(current?.getAttribute('data-rm-item') || '').trim();
    if (name)
        keys.add(name);
    for (const item of state.seen) {
        const key = String(item.getAttribute('data-rm-item') || '').trim();
        if (key)
            keys.add(`${key}:seen`);
    }
}
function prepareTimer(state) {
    const { group } = state;
    state.duration = seconds(group, 'data-rm-duration', 10);
    state.elapsed = 0;
    state.running = false;
    state.lastTick = 0;
    if (!group.hasAttribute('data-rm-manual') && !inSandbox(group))
        startTimer(state);
}
function startTimer(state) {
    if (state.running)
        return;
    state.running = true;
    state.lastTick = nowMs();
    const loop = state.timerLoop = (state.timerLoop || 0) + 1;
    const tick = now => {
        if (!alive(state) || !state.running || state.timerLoop !== loop)
            return;
        if (sleeping(state.group)) {
            sleepUntilVisible(state, () => { if (!state.running || state.timerLoop !== loop)
                return; state.lastTick = nowMs(); frame(state.group, tick); });
            return;
        }
        const gap = Math.max(0, now - state.lastTick);
        state.elapsed = Math.min(state.duration, state.elapsed + (gap > 1000 ? 16 : gap) / 1000);
        state.lastTick = now;
        const done = state.elapsed >= state.duration;
        if (done || now - (state.lastRefresh || 0) >= 100) {
            state.lastRefresh = now;
            H.refreshResults(state);
        }
        else
            H.style(state, state.group, '--rm-p', (state.duration > 0 ? H.clamp(state.elapsed / state.duration, 0, 1) : 1).toFixed(4));
        if (done) {
            state.running = false;
            return;
        }
        frame(state.group, tick);
    };
    frame(state.group, tick);
}
function timerAction(state, control) {
    if (!control.hasAttribute('data-rm-play'))
        return false;
    if (state.running)
        state.running = false;
    else if (state.elapsed < state.duration)
        startTimer(state);
    else {
        state.elapsed = 0;
        startTimer(state);
    }
    control.setAttribute('aria-pressed', String(state.running));
    return true;
}
function timerSync(state) {
    const { group } = state;
    const p = state.duration > 0 ? H.clamp(state.elapsed / state.duration, 0, 1) : 1;
    const remaining = Math.max(0, Math.ceil(state.duration - state.elapsed));
    state.progress = p;
    H.style(state, group, '--rm-p', p.toFixed(4));
    H.style(state, group, '--rm-seconds', String(remaining));
    H.style(state, group, '--rm-count', String(Math.floor(state.elapsed)));
    group.setAttribute('data-rm-seconds', String(remaining));
    H.setFlag(group, 'data-rm-done', state.elapsed >= state.duration);
    H.setFlag(group, 'data-rm-active', Boolean(state.running));
    for (const node of H.own(group, '[data-rm-at]'))
        H.setFlag(node, 'data-rm-done', state.elapsed >= seconds(node, 'data-rm-at', Infinity));
    for (const clock of H.own(group, '[data-rm-clock]')) {
        const minutes = Math.floor(remaining / 60), rest = remaining % 60;
        const text = `${minutes}:${String(rest).padStart(2, '0')}`;
        if (clock.textContent !== text)
            clock.textContent = text;
    }
}
function timerKeys(state, keys) {
    for (const node of H.own(state.group, '[data-rm-at]')) {
        const key = normalizeShowToken(String(node.getAttribute('data-rm-show') || '').trim());
        if (state.elapsed >= seconds(node, 'data-rm-at', Infinity) && key && !key.startsWith('!'))
            keys.add(key);
    }
    if (state.running)
        keys.add('running');
}
function timerReset(state) { state.elapsed = 0; state.running = false; if (!state.destroyed && !state.group.hasAttribute('data-rm-manual') && !inSandbox(state.group))
    startTimer(state); }
function cards(state) { return H.own(state.group, '[data-rm-card]'); }
function topCard(state) { return cards(state).find(card => !state.swiped.has(card)) || null; }
function prepareSwipe(state) {
    state.swiped = new Map();
    state.group.style.setProperty('touch-action', 'pan-y');
    for (const card of cards(state)) {
        card.style.setProperty('touch-action', 'pan-y');
        card.style.setProperty('user-select', 'none');
        card.style.setProperty('-webkit-user-select', 'none');
    }
}
function swipeCard(state, card, direction) {
    if (!card || state.swiped.has(card))
        return false;
    state.swiped.set(card, direction);
    card.setAttribute('data-rm-swiped', direction);
    const sign = direction === 'left' ? -1 : 1;
    H.style(state, card, 'transition', 'transform .35s ease, opacity .35s ease');
    H.style(state, card, 'transform', `translateX(${sign * 130}%) rotate(${sign * 14}deg)`);
    H.style(state, card, 'opacity', '0');
    H.style(state, card, 'pointer-events', 'none');
    return true;
}
function swipeAction(state, control) {
    const direction = control.hasAttribute('data-rm-left') ? 'left' : control.hasAttribute('data-rm-right') ? 'right' : '';
    return direction ? swipeCard(state, topCard(state), direction) : false;
}
export function extraPointerDown(state, event, session) {
    if (state.type !== 'swipe')
        return false;
    if (event.target.closest?.('button, input, textarea, select, a, [data-rm-left], [data-rm-right]'))
        return false;
    const card = event.target.closest?.('[data-rm-card]');
    if (!card || state.swiped.has(card) || card !== topCard(state))
        return false;
    session.card = card;
    session.cardTransform = card.style.getPropertyValue('transform');
    session.cardTransition = card.style.getPropertyValue('transition');
    H.style(state, card, 'transition', 'none');
    return true;
}
export function extraPointerMove(state, event, session) {
    if (state.type !== 'swipe' || !session.card)
        return;
    const dx = event.clientX - session.startX, dy = event.clientY - session.startY;
    session.dx = dx;
    if (!session.horizontal && Math.abs(dx) < 8)
        return;
    if (!session.horizontal && Math.abs(dy) > Math.abs(dx) * 1.2) {
        session.vertical = true;
        return;
    }
    if (session.vertical)
        return;
    session.horizontal = true;
    const move = dx * (Number.isFinite(session.sx) && session.sx > 0 ? session.sx : 1);
    H.style(state, session.card, 'transform', `translateX(${move}px) rotate(${(move / 18).toFixed(1)}deg)`);
    if (event.cancelable)
        event.preventDefault();
}
export function extraPointerUp(state, event, session, cancelled) {
    if (state.type !== 'swipe' || !session.card)
        return false;
    const card = session.card;
    const dx = session.dx || 0;
    const far = session.horizontal && !cancelled && Math.abs(dx) >= Math.max(64, card.getBoundingClientRect().width * 0.3);
    if (far) {
        H.style(state, card, 'transition', 'transform .35s ease, opacity .35s ease');
        swipeCard(state, card, dx < 0 ? 'left' : 'right');
        return true;
    }
    H.style(state, card, 'transition', 'transform .25s ease');
    if (session.cardTransform)
        H.style(state, card, 'transform', session.cardTransform);
    else
        H.style(state, card, 'transform', '');
    setTimeout(() => { if (session.cardTransition)
        H.style(state, card, 'transition', session.cardTransition);
    else
        H.style(state, card, 'transition', ''); }, 260);
    return false;
}
function swipeSync(state) {
    const { group } = state;
    const all = cards(state);
    const left = [], right = [];
    for (const [card, direction] of state.swiped) {
        const key = String(card.getAttribute('data-rm-card') || '').trim();
        (direction === 'left' ? left : right).push(key);
    }
    if (left.length)
        group.setAttribute('data-rm-swiped-left', left.join(' '));
    else
        group.removeAttribute('data-rm-swiped-left');
    if (right.length)
        group.setAttribute('data-rm-swiped-right', right.join(' '));
    else
        group.removeAttribute('data-rm-swiped-right');
    H.style(state, group, '--rm-count', String(state.swiped.size));
    H.style(state, group, '--rm-left', String(left.length));
    H.style(state, group, '--rm-right', String(right.length));
    const top = topCard(state);
    for (const card of all)
        H.setFlag(card, 'data-rm-active', card === top);
    H.setFlag(group, 'data-rm-done', all.length > 0 && all.every(card => state.swiped.has(card)));
}
function swipeKeys(state, keys) {
    let last = '';
    for (const [card, direction] of state.swiped) {
        const key = String(card.getAttribute('data-rm-card') || '').trim();
        if (key) {
            keys.add(`${key}:${direction}`);
            keys.add(key);
        }
        last = direction;
    }
    if (last)
        keys.add(last);
    const top = topCard(state);
    const current = String(top?.getAttribute('data-rm-card') || '').trim();
    if (current)
        keys.add(`${current}:top`);
}
function swipeReset(state) {
    for (const card of state.swiped.keys())
        card.removeAttribute('data-rm-swiped');
    state.swiped = new Map();
}
function prepareRhythm(state) {
    const { group } = state;
    state.charge = 0;
    state.charging = false;
    state.taps = [];
    state.tapCount = 0;
    state.qteP = 0;
    state.qteStopped = false;
    for (const node of H.own(group, '[data-rm-charge]')) {
        node.style.setProperty('user-select', 'none');
        node.style.setProperty('-webkit-user-select', 'none');
        node.style.setProperty('-webkit-touch-callout', 'none');
        node.style.setProperty('touch-action', 'none');
    }
    if (H.own(group, '[data-rm-qte]').length && !inSandbox(group))
        startQte(state);
}
function startQte(state) {
    const period = seconds(state.group, 'data-rm-period', 1.6) * 1000;
    let begin = nowMs();
    let last = begin;
    let pausedPhase = 0;
    const loop = state.qteLoop = (state.qteLoop || 0) + 1;
    const tick = now => {
        if (!alive(state) || state.qteStopped || state.qteLoop !== loop)
            return;
        if (sleeping(state.group, true)) {
            pausedPhase = (now - begin) % period;
            sleepUntilVisible(state, () => {
                if (state.qteStopped || state.qteLoop !== loop)
                    return;
                state.qteWakeP = state.qteP;
                state.qteWokeAt = nowMs();
                begin = nowMs() - pausedPhase;
                last = nowMs();
                frame(state.group, tick);
            }, true);
            return;
        }
        if (now - last > 1000)
            begin += now - last - 16;
        last = now;
        const phase = ((now - begin) % period) / period;
        state.qteP = phase < 0.5 ? phase * 2 : 2 - phase * 2;
        H.refreshResults(state);
        frame(state.group, tick);
    };
    frame(state.group, tick);
}
function qteZone(group) {
    const match = __rmR("n4CmHlUbKVPFxz9MkWjbghRRtB8GU5hB0MV6CA4.bGmWg7V0MgolvR2HBRu8a7Jnq4UlrhrRr.Phl.KMTiHbx85XTwdY4wofy3sWhGgXJhN8Ok", "").exec(String(group.getAttribute('data-rm-zone') || '0.4-0.6'));
    const a = match ? Number(match[1]) : 0.4, b = match ? Number(match[2]) : 0.6;
    return [Math.min(a, b), Math.max(a, b)];
}
function rhythmAction(state, control) {
    const { group } = state;
    if (control.hasAttribute('data-rm-tap')) {
        const now = nowMs();
        const windowMs = controlSeconds(group, '[data-rm-tap]', 'data-rm-window', 3) * 1000;
        state.taps = state.taps.filter(time => now - time <= windowMs);
        state.taps.push(now);
        state.tapCount = state.taps.length;
        if (state.tapCount >= Math.round(controlSeconds(group, '[data-rm-tap]', 'data-rm-count', 10)))
            state.tapDone = true;
        if (!state.tapWatch) {
            const watch = () => { if (!alive(state))
                return; const latest = nowMs(); const kept = state.taps.filter(time => latest - time <= windowMs); if (kept.length !== state.taps.length) {
                state.taps = kept;
                state.tapCount = state.tapDone ? state.tapCount : kept.length;
                H.refreshResults(state);
            } if (state.taps.length && !state.tapDone)
                setTimeout(watch, 200);
            else
                state.tapWatch = false; };
            state.tapWatch = true;
            setTimeout(watch, 200);
        }
        return true;
    }
    if (control.hasAttribute('data-rm-qte')) {
        if (group.getAttribute('data-rm-match') === 'true')
            return false;
        const [low, high] = qteZone(group);
        const recentlyWoken = state.qteWokeAt && nowMs() - state.qteWokeAt < 600;
        const p = recentlyWoken ? state.qteWakeP : state.qteP;
        state.qteWokeAt = 0;
        const hit = p >= low && p <= high;
        if (hit) {
            state.qteStopped = true;
            H.setFlag(group, 'data-rm-match', true);
            group.removeAttribute('data-rm-miss');
        }
        else {
            H.setFlag(group, 'data-rm-miss', true);
            setTimeout(() => { if (alive(state) && group.getAttribute('data-rm-match') !== 'true') {
                group.removeAttribute('data-rm-miss');
                H.refreshResults(state);
            } }, 600);
        }
        return true;
    }
    return false;
}
export function extraHoldStart(state, control) {
    if (state.type !== 'rhythm' || !control?.hasAttribute?.('data-rm-charge'))
        return false;
    if (state.charging)
        return true;
    state.charging = true;
    const duration = controlSeconds(state.group, '[data-rm-charge]', 'data-rm-duration', 2) * 1000;
    let last = nowMs();
    const tick = now => {
        if (!alive(state) || !state.charging)
            return;
        state.charge = H.clamp(state.charge + (now - last) / duration, 0, 1);
        last = now;
        const complete = state.charge >= 1;
        if (complete) {
            state.charging = false;
            state.chargeDone = true;
        }
        H.refreshResults(state);
        if (complete)
            return;
        frame(state.group, tick);
    };
    frame(state.group, tick);
    return true;
}
export function extraHoldEnd(state) {
    if (state.type !== 'rhythm' || !state.charging)
        return;
    state.charging = false;
    if (!state.chargeDone && !state.group.hasAttribute('data-rm-keep')) {
        let last = nowMs();
        const duration = controlSeconds(state.group, '[data-rm-charge]', 'data-rm-duration', 2) * 1000;
        const decay = now => {
            if (!alive(state) || state.charging)
                return;
            state.charge = H.clamp(state.charge - (now - last) / duration * 1.5, 0, 1);
            last = now;
            H.refreshResults(state);
            if (state.charge > 0)
                frame(state.group, decay);
        };
        frame(state.group, decay);
    }
    H.refreshResults(state);
}
function rhythmSync(state) {
    const { group } = state;
    const hasCharge = H.own(group, '[data-rm-charge]').length > 0;
    const hasTap = H.own(group, '[data-rm-tap]').length > 0;
    const hasQte = H.own(group, '[data-rm-qte]').length > 0;
    if (hasCharge) {
        state.progress = state.charge;
        H.style(state, group, '--rm-p', state.charge.toFixed(4));
        H.setFlag(group, 'data-rm-active', Boolean(state.charging));
        for (const node of H.own(group, '[data-rm-charge]'))
            H.setFlag(node, 'data-rm-active', Boolean(state.charging));
    }
    if (hasTap) {
        const target = Math.round(controlSeconds(group, '[data-rm-tap]', 'data-rm-count', 10));
        H.style(state, group, '--rm-count', String(state.tapCount));
        H.style(state, group, '--rm-p', H.clamp(state.tapCount / Math.max(1, target), 0, 1).toFixed(4));
        group.setAttribute('data-rm-count-now', String(state.tapCount));
    }
    if (hasQte) {
        H.style(state, group, '--rm-qte', state.qteP.toFixed(4));
        if (!hasCharge && !hasTap)
            H.style(state, group, '--rm-p', state.qteP.toFixed(4));
        const [low, high] = qteZone(group);
        H.style(state, group, '--rm-zone-start', low.toFixed(2));
        H.style(state, group, '--rm-zone-end', high.toFixed(2));
    }
    const done = (hasCharge && state.chargeDone) || (hasTap && state.tapDone);
    if (hasCharge || hasTap)
        H.setFlag(group, 'data-rm-done', Boolean(done));
    if (hasTap)
        for (const node of H.own(group, '[data-rm-tap]'))
            H.setFlag(node, 'data-rm-done', Boolean(state.tapDone));
    if (hasCharge)
        for (const node of H.own(group, '[data-rm-charge]'))
            H.setFlag(node, 'data-rm-done', Boolean(state.chargeDone));
}
function rhythmReset(state) {
    state.charge = 0;
    state.charging = false;
    state.chargeDone = false;
    state.taps = [];
    state.tapCount = 0;
    state.tapDone = false;
    state.group.removeAttribute('data-rm-match');
    state.group.removeAttribute('data-rm-miss');
    if (state.qteStopped) {
        state.qteStopped = false;
        if (H.own(state.group, '[data-rm-qte]').length && !inSandbox(state.group))
            startQte(state);
    }
}
function preparePeek(state) {
    const { group } = state;
    state.peeked = new Set();
    state.hovered = new Set();
    const key = node => String(node.getAttribute('data-rm-peek') || '').trim() || 'peek';
    for (const trigger of H.own(group, '[data-rm-peek]')) {
        const enter = event => { if (event.pointerType === 'touch')
            return; state.hovered.add(key(trigger)); H.refreshResults(state); };
        const leave = () => { if (state.hovered.delete(key(trigger)))
            H.refreshResults(state); };
        trigger.addEventListener('pointerenter', enter);
        trigger.addEventListener('pointerleave', leave);
        state.extra.timers.add(() => { trigger.removeEventListener('pointerenter', enter); trigger.removeEventListener('pointerleave', leave); });
    }
}
function peekAction(state, control) {
    if (!control.hasAttribute('data-rm-peek'))
        return false;
    const key = String(control.getAttribute('data-rm-peek') || '').trim() || 'peek';
    if (state.peeked.has(key))
        state.peeked.delete(key);
    else
        state.peeked.add(key);
    return true;
}
function peekSync(state) {
    const { group } = state;
    const active = new Set([...state.peeked, ...state.hovered]);
    for (const trigger of H.own(group, '[data-rm-peek]')) {
        const key = String(trigger.getAttribute('data-rm-peek') || '').trim() || 'peek';
        H.setFlag(trigger, 'data-rm-active', active.has(key));
        trigger.setAttribute('aria-pressed', String(state.peeked.has(key)));
    }
    H.setFlag(group, 'data-rm-active', active.size > 0);
    if (active.size)
        group.setAttribute('data-rm-peeking', [...active].join(' '));
    else
        group.removeAttribute('data-rm-peeking');
}
function peekKeys(state, keys) { for (const key of state.peeked)
    keys.add(key); for (const key of state.hovered)
    keys.add(key); if (state.peeked.size || state.hovered.size)
    keys.add('peek'); }
function peekReset(state) { state.peeked = new Set(); state.hovered = new Set(); }
const SPOILER_STYLE_ATTR = 'data-rm-spoiler-style';
const SPOILER_DEFAULT_CSS = '[data-rm-spoiler]{cursor:pointer;border-radius:3px;transition:background-color .2s,color .2s,-webkit-text-fill-color .2s;}'
    + '[data-rm-spoiler]:not([data-rm-revealed="true"]){background-color:currentColor;-webkit-text-fill-color:transparent;text-shadow:none;}'
    + '[data-rm-spoiler]:not([data-rm-revealed="true"]) *{-webkit-text-fill-color:transparent;text-shadow:none;}';
function repairSpoilerCoverCss(text, own = false) {
    return String(text || '').replace(/([^{}]*data-rm-spoiler[^{}]*)\{([^{}]*)\}/g, (rule, selector, body) => {
        if (!own && !/:not\(\s*\[\s*data-rm-revealed/i.test(selector))
            return rule;
        const paintsBar = /background(?:-color)?\s*:\s*currentColor/i.test(body);
        const childRule = /\*\s*$/.test(selector) && /^\s*color\s*:\s*transparent\s*;?\s*$/i.test(body);
        if (!paintsBar && !childRule)
            return rule;
        const next = body.replace(/(^|;)(\s*)color\s*:\s*transparent/gi, '$1$2-webkit-text-fill-color:transparent');
        return next === body ? rule : `${selector}{${next}}`;
    });
}
function prepareSpoiler(state) {
    const { group } = state;
    state.revealed = new Set(H.own(group, '[data-rm-spoiler][data-rm-revealed="true"]'));
    const doc = group.ownerDocument;
    const scope = group.closest('details') || state.root;
    if (!scope)
        return;
    let authored = false;
    for (const node of scope.querySelectorAll?.('style') || []) {
        const text = node.textContent || '';
        if (!/data-rm-spoiler|data-rm-revealed/.test(text))
            continue;
        if (!node.hasAttribute(SPOILER_STYLE_ATTR))
            authored = true;
        const fixed = repairSpoilerCoverCss(text, node.hasAttribute(SPOILER_STYLE_ATTR));
        if (fixed !== text)
            node.textContent = fixed;
    }
    if (!authored && !scope.querySelector(`style[${SPOILER_STYLE_ATTR}]`)) {
        const style = doc.createElement('style');
        style.setAttribute(SPOILER_STYLE_ATTR, 'true');
        style.textContent = SPOILER_DEFAULT_CSS;
        scope.prepend(style);
    }
}
function spoilerAction(state, control) {
    const span = control.closest?.('[data-rm-spoiler]');
    if (!span || !state.group.contains(span))
        return false;
    if (state.revealed.has(span)) {
        if (state.group.hasAttribute('data-rm-sticky'))
            return false;
        state.revealed.delete(span);
    }
    else
        state.revealed.add(span);
    return true;
}
function spoilerSync(state) {
    const { group } = state;
    const spans = H.own(group, '[data-rm-spoiler]');
    for (const span of spans) {
        const revealed = state.revealed.has(span);
        H.setFlag(span, 'data-rm-revealed', revealed);
        span.setAttribute('aria-pressed', String(revealed));
        try {
            const inlineColor = span.style.getPropertyValue('color'), inlineBackground = span.style.getPropertyValue('background-color');
            const clash = Boolean(inlineColor) && inlineColor === inlineBackground;
            if (revealed && clash) {
                H.style(state, span, 'background-color', 'transparent');
                H.style(state, span, 'color', 'inherit');
            }
            else if (!revealed) {
                H.unstyle?.(state, span, ['background-color', 'color']);
                if (span.style.getPropertyValue('color') === 'inherit' && span.style.getPropertyValue('background-color') === 'transparent') {
                    span.style.removeProperty('color');
                    span.style.removeProperty('background-color');
                }
            }
        }
        catch { }
    }
    H.style(state, group, '--rm-count', String(state.revealed.size));
    H.setFlag(group, 'data-rm-done', spans.length > 0 && spans.every(span => state.revealed.has(span)));
}
function spoilerKeys(state, keys) {
    for (const span of state.revealed) {
        const key = String(span.getAttribute('data-rm-spoiler') || '').trim();
        if (key)
            keys.add(key);
    }
    if (state.revealed.size)
        keys.add('revealed');
}
function spoilerReset(state) { state.revealed = new Set(); }
const SENSES = Object.freeze([
    ['(orientation: landscape)', 'data-rm-orientation', 'landscape', 'portrait'],
    ['(prefers-color-scheme: dark)', 'data-rm-scheme', 'dark', 'light'],
    ['(max-width: 640px)', 'data-rm-width', 'narrow', 'wide'],
    ['(pointer: coarse)', 'data-rm-pointer', 'touch', 'mouse'],
]);
const SCREEN_SENSES = new Set(['(orientation: landscape)', '(max-width: 640px)']);
function readSenses(state) {
    const view = state.group.ownerDocument?.defaultView;
    const zoomed = insideDesktopZoomFace(state.group);
    for (const [query, attribute, yes, no, media] of state.senseMedia || []) {
        const virtual = zoomed && SCREEN_SENSES.has(query) ? evaluateMediaForVirtualPhone(query, view) : null;
        state.senses.set(attribute, (virtual ?? media.matches) ? yes : no);
    }
}
function prepareSense(state) {
    const view = state.group.ownerDocument?.defaultView;
    state.senses = new Map();
    state.senseMedia = [];
    if (typeof view?.matchMedia !== 'function')
        return;
    const refresh = () => { readSenses(state); if (alive(state))
        H.refreshResults(state); };
    for (const [query, attribute, yes, no] of SENSES) {
        let media;
        try {
            media = view.matchMedia(query);
        }
        catch {
            continue;
        }
        state.senseMedia.push([query, attribute, yes, no, media]);
        try {
            media.addEventListener('change', refresh);
            state.extra.medias.push([media, refresh]);
        }
        catch { }
    }
    try {
        faceZoomEvents?.addEventListener('change', refresh);
        if (faceZoomEvents)
            state.extra.medias.push([faceZoomEvents, refresh]);
    }
    catch { }
    readSenses(state);
}
function senseSync(state) { for (const [attribute, value] of state.senses)
    state.group.setAttribute(attribute, value); }
function senseKeys(state, keys) { readSenses(state); for (const value of state.senses.values())
    keys.add(value); }
export function extraAction(state, control) {
    switch (state.type) {
        case 'slide': return slideAction(state, control);
        case 'timer': return timerAction(state, control);
        case 'swipe': return swipeAction(state, control);
        case 'rhythm': return rhythmAction(state, control);
        case 'peek': return peekAction(state, control);
        case 'spoiler': return spoilerAction(state, control);
        default: return false;
    }
}
export function extraSync(state) {
    switch (state.type) {
        case 'slide':
            slideSync(state);
            break;
        case 'timer':
            timerSync(state);
            break;
        case 'swipe':
            swipeSync(state);
            break;
        case 'rhythm':
            rhythmSync(state);
            break;
        case 'peek':
            peekSync(state);
            break;
        case 'spoiler':
            spoilerSync(state);
            break;
        case 'sense':
            senseSync(state);
            break;
        default: break;
    }
}
export function extraKeys(state, keys) {
    switch (state.type) {
        case 'slide':
            slideKeys(state, keys);
            break;
        case 'timer':
            timerKeys(state, keys);
            break;
        case 'swipe':
            swipeKeys(state, keys);
            break;
        case 'peek':
            peekKeys(state, keys);
            break;
        case 'spoiler':
            spoilerKeys(state, keys);
            break;
        case 'sense':
            senseKeys(state, keys);
            break;
        default: break;
    }
    return keys;
}
export function extraReset(state) {
    switch (state.type) {
        case 'slide':
            if (state.destroyed)
                break;
            slideLayout(state);
            state.seen = new Set();
            slideTo(state, 0, false);
            measureSlide(state);
            break;
        case 'timer':
            timerReset(state);
            break;
        case 'swipe':
            swipeReset(state);
            break;
        case 'rhythm':
            rhythmReset(state);
            break;
        case 'peek':
            peekReset(state);
            break;
        case 'spoiler':
            spoilerReset(state);
            break;
        default: break;
    }
}
const CARRY_KEY = 'rabbit_mirror_carry:v1';
const CARRY_MAX_CHATS = 20;
let chatKeyReader = null;
export function configureCarryChatKey(reader) { chatKeyReader = reader; }
function carryChat() {
    try {
        const key = chatKeyReader?.();
        if (key)
            return String(key);
    }
    catch { }
    return 'default';
}
const CARRY_SIGNATURES = new Map();
function carryRead() {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(CARRY_KEY) || '{}');
        return value && typeof value === 'object' ? value : {};
    }
    catch {
        return {};
    }
}
function carryWrite(all) {
    try {
        const keys = Object.keys(all).sort((a, b) => (all[b]?.ts || 0) - (all[a]?.ts || 0));
        for (const key of keys.slice(CARRY_MAX_CHATS))
            delete all[key];
        globalThis.localStorage?.setItem(CARRY_KEY, JSON.stringify(all));
    }
    catch { }
}
export function carryMemoryName(group) { return String(group?.getAttribute?.('data-rm-memory') || '').trim().slice(0, 40); }
export function applyCarriedState(group) {
    const name = carryMemoryName(group);
    if (!name || inSandbox(group))
        return false;
    const saved = carryRead()[carryChat()]?.[name];
    if (!saved || typeof saved !== 'object')
        return false;
    if (Array.isArray(saved.on))
        group.setAttribute('data-rm-on', saved.on.join(' '));
    if (typeof saved.picked === 'string' && saved.picked)
        group.setAttribute('data-rm-picked', saved.picked);
    if (Number.isInteger(saved.index))
        group.setAttribute('data-rm-index', String(group.getAttribute('data-rm-index-base') === '0' ? saved.index - 1 : saved.index));
    if (Array.isArray(saved.done)) {
        const steps = H?.own ? H.own(group, '[data-rm-step]') : [...group.querySelectorAll('[data-rm-step]')].filter(node => node.closest(GROUP) === group);
        steps.forEach((step, index) => { if (saved.done.includes(index))
            step.setAttribute('data-rm-done', 'true'); });
    }
    group.setAttribute('data-rm-recalled', 'true');
    return true;
}
export function saveCarriedState(state) {
    const { group, type } = state;
    const name = carryMemoryName(group);
    if (!name || inSandbox(group))
        return;
    const record = { type, ts: Date.now(), keys: [] };
    if (type === 'toggle') {
        record.on = [...(state.on || [])];
        record.keys = record.on;
    }
    else if (type === 'pick' || type === 'roll') {
        record.picked = state.picked || '';
        record.keys = record.picked ? [record.picked] : [];
    }
    else if (type === 'pager' || type === 'slide') {
        record.index = state.index;
        record.keys = [String(state.index)];
    }
    else if (type === 'accumulate') {
        const steps = H?.own ? H.own(group, '[data-rm-step]') : [...group.querySelectorAll('[data-rm-step]')].filter(node => node.closest(GROUP) === group);
        record.done = steps.map((step, index) => step.getAttribute('data-rm-done') === 'true' ? index : -1).filter(index => index >= 0);
        const pressed = steps.filter(step => step.getAttribute('data-rm-done') === 'true').map(step => String(step.getAttribute('data-rm-step') || '').trim()).filter(Boolean);
        record.keys = [...new Set([...pressed, ...(steps.length && record.done.length === steps.length ? ['done'] : [])])];
    }
    else if (type === 'swipe') {
        record.keys = [...(state.swiped || [])].map(([card, direction]) => `${String(card.getAttribute('data-rm-card') || '').trim()}:${direction}`);
    }
    else if (type === 'spoiler') {
        record.keys = state.revealed?.size ? ['revealed'] : [];
    }
    else
        return;
    if (group.getAttribute('data-rm-done') === 'true')
        record.keys = [...record.keys, 'done'];
    if (group.getAttribute('data-rm-match') === 'true')
        record.keys = [...record.keys, 'match'];
    const signature = JSON.stringify({ ...record, ts: 0 });
    const chat = carryChat();
    const signatureKey = `${chat}\u0000${name}`;
    if (CARRY_SIGNATURES.get(signatureKey) === signature)
        return;
    CARRY_SIGNATURES.set(signatureKey, signature);
    const all = carryRead();
    all[chat] = { ...(all[chat] || {}), [name]: record, ts: Date.now() };
    carryWrite(all);
}
export function recalledKeys(group, keys) {
    const name = String(group.getAttribute('data-rm-recall') || '').trim();
    if (!name)
        return keys;
    const saved = carryRead()[carryChat()]?.[name];
    if (!saved)
        return keys;
    keys.add('remembered');
    for (const key of saved.keys || [])
        if (typeof key === 'string' && key)
            keys.add(key);
    return keys;
}
