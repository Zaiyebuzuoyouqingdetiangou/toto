// Touch-host alternatives and authored gallery dots stay inside the face;
// no document listeners or polling.
const bindings = new WeakMap();
const controlOwners = new WeakMap();
const GROUP = '[data-rm-ui]';
const BAR = 'data-rm-mobile-controls';
const ACTION = 'data-rm-mobile-action';
const numeric = (value, fallback) => value !== '' && Number.isFinite(Number(value)) ? Number(value) : fallback;
const own = (group, selector) => [...group.querySelectorAll(selector)].filter(node => node.closest(GROUP) === group);

function touchHost(root) {
    const view = root.ownerDocument?.defaultView, nav = view?.navigator;
    if (nav?.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod/i.test(nav?.userAgent || '')) return true;
    if (nav?.platform === 'MacIntel' && nav.maxTouchPoints > 1) return true;
    return Boolean(view?.matchMedia?.('(pointer: coarse)').matches && view?.matchMedia?.('(hover: none)').matches);
}

function after(node) {
    const children = [...(node.parentElement?.children || [])];
    return children[children.indexOf(node) + 1] || null;
}

const BAR_FOR = 'data-rm-mobile-for';
const BAR_LABEL = { scroll: '左右浏览', range: '逐步调节' };
const STRUCTURAL_SELECTOR = /[+~]|:(?:nth-(?:last-)?child|nth-(?:last-)?of-type|first-child|last-child|only-child|empty)\b|:has\(/;
const PLACE_CLIMB = 4;

// 控件在本面里的序号（滑杆按滑杆数，其它不数我们自己加的按钮条），只用于认回“往上放了几层”的那种按钮条。
function controlOrdinal(binding, target, kind) {
    if (kind === 'range') return [...binding.root.querySelectorAll('input[type="range"]')].indexOf(target);
    // 标题栏里的工具按钮、我们自己加的按钮条都不数，序号才不会随插件按钮的增减而变。
    return [...binding.root.querySelectorAll('*')].filter(node => !node.closest(`[${BAR}], summary`)).indexOf(target);
}

// 紧跟在 node 后面的那一串按钮条（同一行两根滑杆都往外放时，会排成一串）。
function barRunAfter(node) {
    const run = [];
    for (let next = after(node); next && (next.hasAttribute(BAR) || barMatches(next, 'range') || barMatches(next, 'scroll')); next = after(next)) run.push(next);
    return run;
}

function barMatches(node, kind) {
    if (!node) return false;
    if (node.getAttribute(BAR) === kind) return true;
    // 保存再打开后个别面上这个属性丢了，只剩 role/aria-label；认回来并补上属性，免得再加一条。
    if (node.tagName === 'SPAN' && node.getAttribute('role') === 'group' && node.getAttribute('aria-label') === BAR_LABEL[kind]) {
        node.setAttribute(BAR, kind);
        return true;
    }
    return false;
}

// 本面样式里会被“多出一个兄弟”影响的选择器：`#r + .fill`、`:nth-child`、`:last-child`、`:has(> input)` 等。
function structuralSelectors(binding) {
    if (binding.structural) return binding.structural;
    const out = [];
    for (const style of binding.root.querySelectorAll('style')) {
        const css = String(style.textContent || '').replace(/\/\*[\s\S]*?\*\//g, '');
        for (const [, head] of css.matchAll(/([^{}]+)\{[^{}]*\}/g)) for (const selector of head.split(',')) {
            const text = selector.trim();
            if (!text || !STRUCTURAL_SELECTOR.test(text)) continue;
            try { binding.root.querySelector(text); out.push(text); } catch { /* 解析不了的选择器 */ }
        }
    }
    binding.structural = out;
    return out;
}

function matchedSet(root, selectors) {
    const set = new Set();
    for (const selector of selectors) { try { for (const node of root.querySelectorAll(selector)) set.add(node); } catch {} }
    return set;
}

function layoutSensitive(parent) {
    let style;
    try { style = parent.ownerDocument.defaultView.getComputedStyle(parent); } catch { return false; }
    return (/grid/.test(style.display) && style.gridTemplateColumns !== 'none')
        || (/flex/.test(style.display) && /^row/.test(style.flexDirection));
}

// 把按钮条放在目标后面；如果放进去会改变本面结构选择器的命中、或者挤进固定列数的网格／横向 flex 行，
// 就往上一层放（最多四层）。四层内都放不下就不加这组按钮。
function placeAfter(binding, target, bar) {
    const root = binding.root;
    const selectors = structuralSelectors(binding);
    const before = selectors.length ? matchedSet(root, selectors) : null;
    let anchor = target;
    for (let depth = 0; anchor && anchor !== root && anchor.parentElement; depth += 1, anchor = anchor.parentElement) {
        if (depth >= PLACE_CLIMB) break;
        const parent = anchor.parentElement;
        // 已经有别的按钮条排在这里时接在它们后面，不插到前面去，各自的位置才稳定。
        const slot = depth > 0 ? (barRunAfter(anchor).pop() || anchor) : anchor;
        if (parent === root || parent.matches('summary')) { parent.insertBefore(bar, slot.nextSibling); return depth; }
        if (layoutSensitive(parent)) continue;
        parent.insertBefore(bar, slot.nextSibling);
        if (!before) return depth;
        const after = matchedSet(root, selectors);
        if (after.size === before.size && [...after].every(node => before.has(node))) return depth;
        bar.remove();
    }
    return -1;
}

// 紧跟在控件后面的那条直接认；往上放过的那条带着控件序号，序号对得上才认（别把同一行里别的滑杆的条认成自己的）。
function findBar(binding, target, kind) {
    let ordinal = null;
    let anchor = target;
    for (let depth = 0; anchor && anchor !== binding.root && depth <= PLACE_CLIMB; depth += 1, anchor = anchor.parentElement) {
        const run = depth === 0 ? [after(anchor)].filter(Boolean) : barRunAfter(anchor);
        for (const candidate of run) {
            if (!barMatches(candidate, kind)) continue;
            const owner = candidate.getAttribute(BAR_FOR);
            if (owner === null) { if (depth === 0) return candidate; continue; }
            if (ordinal === null) ordinal = controlOrdinal(binding, target, kind);
            if (Number(owner) === ordinal) return candidate;
        }
    }
    return null;
}

function toolbar(binding, target, kind, inside = false) {
    let bar = inside ? [...target.children].find(node => node.getAttribute(BAR) === kind) : findBar(binding, target, kind);
    if (!bar && binding.reuseOnly) return null;
    if (!bar) {
        bar = target.ownerDocument.createElement('span');
        bar.setAttribute(BAR, kind);
        bar.setAttribute('role', 'group');
        bar.setAttribute('aria-label', BAR_LABEL[kind] || '点按操作');
        bar.style.setProperty('display', 'inline-flex');
        bar.style.setProperty('flex-wrap', 'wrap');
        bar.style.setProperty('align-items', 'center');
        bar.style.setProperty('gap', '6px');
        bar.style.setProperty('margin', '4px 0');
        if (inside) target.appendChild(bar);
        else {
            const depth = placeAfter(binding, target, bar);
            if (depth < 0) return null;
            if (depth > 0) bar.setAttribute(BAR_FOR, String(controlOrdinal(binding, target, kind)));
        }
    }
    binding.surfaces.add(bar);
    return bar;
}

function control(binding, bar, name, label, text, target, action, driverAttribute, allowCreate = false) {
    let button = [...bar.querySelectorAll('button')].find(node => node.getAttribute(ACTION) === name);
    // 保存后动作标记丢了的旧按钮，按无障碍标签认回来并补上标记，不另加一个。
    if (!button) {
        button = [...bar.querySelectorAll('button')].find(node => !node.hasAttribute(ACTION) && node.getAttribute('aria-label') === label) || null;
        if (button) button.setAttribute(ACTION, name);
    }
    if (!button && binding.reuseOnly && !allowCreate) return null;
    if (!button) {
        button = bar.ownerDocument.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute(ACTION, name);
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
        button.textContent = text;
        for (const [key, value] of Object.entries({ font: 'inherit', color: 'inherit', background: 'transparent', border: '1px solid currentColor', 'border-radius': '6px', 'min-width': '36px', 'min-height': '36px', padding: '3px 8px', cursor: 'pointer', 'touch-action': 'manipulation' })) button.style.setProperty(key, value);
        if (driverAttribute) button.setAttribute(driverAttribute[0], driverAttribute[1]);
        bar.appendChild(button);
    }
    controlOwners.set(button, binding);
    binding.actions.set(button, { target, action });
    return button;
}

function horizontalCandidate(node) {
    if (node.closest(`[${BAR}]`) || node.matches('input, textarea, select, svg, style, script')) return false;
    const view = node.ownerDocument?.defaultView;
    let computed;
    try { computed = view?.getComputedStyle?.(node); } catch { /* A detached host may have no computed style. */ }
    const inline = node.style.getPropertyValue('overflow-x') || node.style.getPropertyValue('overflow').split(/\s+/)[0];
    const overflow = computed?.overflowX || inline;
    return /^(auto|scroll)$/.test(overflow) || node.getAttribute('data-rm-ui') === 'scroll';
}

// An authored snap gallery can contain an apparent pager made only of empty
// decorative spans. Bind those exact dots to its existing slides on all hosts;
// do not infer pages from ordinary overflowing text or invent new content.
function galleryControls(binding, target) {
    if (binding.root.contains(binding.scrolls.get(target)?.bar)
        && binding.scrolls.get(target).kind === 'gallery') return false;
    const view = target.ownerDocument?.defaultView;
    let computed;
    try { computed = view?.getComputedStyle?.(target); } catch { return false; }
    if (!/^x\b/.test(computed?.scrollSnapType || '') || computed.display !== 'flex'
        || computed.flexDirection !== 'row' || computed.direction === 'rtl'
        || target.clientWidth <= 0 || target.scrollWidth <= target.clientWidth + 2) return false;
    const slides = [...target.children].filter(node => !node.matches('style, script, template'));
    if (slides.length < 2 || !slides.every(node => {
        const style = view.getComputedStyle(node);
        const width = parseFloat(style.width) || 0;
        return /\bstart\b/.test(style.scrollSnapAlign || '')
            && width >= target.clientWidth * 0.8 && width <= target.clientWidth * 1.2;
    })) return false;
    const oldBar = after(target)?.getAttribute(BAR) === 'scroll' ? after(target) : null;
    const bar = oldBar ? after(oldBar) : after(target);
    if (!bar || !bar.matches('div, nav, span') || bar.children.length !== slides.length) return false;
    const restored = bar.getAttribute(BAR) === 'gallery';
    const markers = [...bar.children].map(node => restored && node.matches(`button[${ACTION}]`)
        && node.children.length === 1 ? node.children[0] : node);
    const appearances = [];
    for (const marker of markers) {
        if (!marker.matches('span, i') || marker.children.length || String(marker.textContent || '').trim()
            || marker.matches('[role], [tabindex], [onclick], [popovertarget]')) return false;
        const style = view.getComputedStyle(marker);
        const width = parseFloat(style.width) || 0, height = parseFloat(style.height) || 0;
        if (width <= 0 || width > 24 || height <= 0 || height > 12) return false;
        appearances.push({ width: `${width}px`, height: `${height}px`, background: style.backgroundColor,
            radius: style.borderRadius });
    }
    // The widest authored dot denotes the selected photo. Preserve its palette
    // and shape, including when a serialized gallery was saved on another page.
    const restoredIndex = restored ? [...bar.children].findIndex(node => node.getAttribute('aria-pressed') === 'true') : -1;
    const activeIndex = restoredIndex >= 0 ? restoredIndex : appearances.reduce((best, item, index) =>
        parseFloat(item.width) > parseFloat(appearances[best].width) ? index : best, 0);
    const active = appearances[activeIndex], inactive = appearances.find((_, index) => index !== activeIndex);
    bar.setAttribute(BAR, 'gallery');
    const buttons = markers.map((marker, index) => {
        const button = control(binding, bar, `gallery-${index}`, `查看第 ${index + 1} 张照片`, '', target, () => {
            const box = target.getBoundingClientRect(), slide = slides[index].getBoundingClientRect();
            const scale = target.offsetWidth > 0 ? box.width / target.offsetWidth : 1;
            if (!(scale > 0)) return;
            const left = numeric(target.scrollLeft, 0) + (slide.left - box.left) / scale - (target.clientLeft || 0);
            try {
                if (typeof target.scrollTo !== 'function') throw new Error('scrollTo unavailable');
                target.scrollTo({ left, top: target.scrollTop, behavior: 'auto' });
            } catch { target.scrollLeft = left; }
        }, undefined, true);
        for (const [key, value] of Object.entries({ display: 'inline-flex', 'align-items': 'center',
            'justify-content': 'center', border: '0', background: 'transparent', padding: '6px',
            'min-width': '36px', 'min-height': '32px', 'box-sizing': 'border-box' })) button.style.setProperty(key, value);
        marker.style.setProperty('display', 'block');
        marker.style.setProperty('height', appearances[index].height);
        marker.style.setProperty('border-radius', appearances[index].radius);
        if (marker.parentElement !== button) button.appendChild(marker);
        return button;
    });
    if (oldBar) {
        oldBar.remove();
        if (target.style.getPropertyValue('touch-action') === 'pan-y pinch-zoom') target.style.removeProperty('touch-action');
    }
    binding.scrolls.set(target, { kind: 'gallery', bar, buttons, markers, slides, active, inactive });
    binding.surfaces.add(bar);
    binding.surfaces.add(target);
    return true;
}

function scrollControls(binding, target) {
    if (!target.parentElement || binding.root.contains(binding.scrolls.get(target)?.bar)) return false;
    const bar = toolbar(binding, target, 'scroll');
    if (!bar) return false;
    const move = direction => {
        const distance = Math.max(1, target.clientWidth * 0.85) * direction;
        if (typeof target.scrollBy === 'function') target.scrollBy({ left: distance, behavior: 'smooth' });
        else target.scrollLeft = Math.max(0, Math.min(Math.max(0, target.scrollWidth - target.clientWidth), numeric(target.scrollLeft, 0) + distance));
    };
    const previous = control(binding, bar, 'scroll-prev', '向左浏览', '←', target, () => move(-1));
    const next = control(binding, bar, 'scroll-next', '向右浏览', '→', target, () => move(1));
    if (!previous || !next) return false;
    binding.scrolls.set(target, { bar, previous, next });
    binding.surfaces.add(target);
    if (binding.reuseOnly) return true;
    // Retain native vertical browsing and pinch zoom; horizontal navigation has buttons.
    target.style.setProperty('touch-action', 'pan-y pinch-zoom', 'important');
    return true;
}

function rangeLimits(input) {
    const min = numeric(input.getAttribute('min') || '', 0);
    const max = Math.max(min, numeric(input.getAttribute('max') || '', 100));
    return { min, max };
}

function stepRange(input, direction) {
    if (input.disabled) return;
    const { min, max } = rangeLimits(input), before = input.value;
    const any = input.getAttribute('step') === 'any';
    const method = direction > 0 ? 'stepUp' : 'stepDown';
    const authoredStep = numeric(input.getAttribute('step') || '', 1);
    // 0～1、步长 0.01 这类滑杆点一下只动 1%，按钮等于没用；超过 20 格时按约 1/20 的整数倍步长走。
    const coarse = !any && authoredStep > 0 && (max - min) / authoredStep > 20
        ? Math.ceil(((max - min) / 20) / authoredStep - 1e-9) * authoredStep : 0;
    let native = false;
    if (!any && typeof input[method] === 'function') {
        try { input[method](coarse ? Math.round(coarse / authoredStep) : 1); native = true; } catch { /* Old WebViews can omit numeric stepping. */ }
    }
    if (!native) {
        const authored = coarse || authoredStep;
        const step = any ? (max - min) / 20 : authored > 0 ? authored : 1;
        const current = numeric(input.value, min);
        const base = input.hasAttribute('min') ? min : numeric(input.getAttribute('value') || '', 0);
        const units = (current - base) / step;
        const next = any ? current + direction * step : base + (direction > 0 ? Math.floor(units + 1e-9) + 1 : Math.ceil(units - 1e-9) - 1) * step;
        input.value = String(Number(Math.max(min, Math.min(max, next)).toPrecision(12)));
    }
    if (input.value === before) return;
    const EventClass = input.ownerDocument.defaultView?.Event;
    if (!EventClass) return;
    input.dispatchEvent(new EventClass('input', { bubbles: true }));
    input.dispatchEvent(new EventClass('change', { bubbles: true }));
}

function rangeControls(binding, target) {
    if (!target.parentElement || binding.root.contains(binding.ranges.get(target)?.bar)) return false;
    const bar = toolbar(binding, target, 'range');
    if (!bar) return false;
    const less = control(binding, bar, 'range-less', '减少', '−', target, () => stepRange(target, -1));
    const more = control(binding, bar, 'range-more', '增加', '＋', target, () => stepRange(target, 1));
    if (!less || !more) return false;
    binding.ranges.set(target, { bar, less, more });
    binding.surfaces.add(target);
    return true;
}

function itemControls(binding, group) {
    const type = group.getAttribute('data-rm-ui');
    if (binding.reuseOnly || (type !== 'reorder' && type !== 'drag')) return 0;
    let added = 0;
    for (const item of own(group, '[data-rm-item]')) {
        if (item.contains(binding.items.get(item)) || item.namespaceURI && item.namespaceURI !== 'http://www.w3.org/1999/xhtml' || item.matches('input, button, textarea, select, img')) continue;
        binding.surfaces.add(item);
        const bar = toolbar(binding, item, type, true);
        binding.items.set(item, bar);
        const add = (name, label, text, attribute, value = '') => control(binding, bar, name, label, text, item, null, [attribute, value]);
        if (type === 'reorder') {
            if (!item.querySelector('[data-rm-prev]')) add('reorder-prev', '移到前面', '←', 'data-rm-prev');
            if (!item.querySelector('[data-rm-next]')) add('reorder-next', '移到后面', '→', 'data-rm-next');
        } else {
            const key = item.getAttribute('data-rm-item');
            const slots = own(group, '[data-rm-slot]').filter(slot => key && slot.getAttribute('data-rm-slot') === key);
            if (slots.length === 1) {
                add('drag-place', '放入对应位置', '放入', 'data-rm-place');
                add('drag-return', '放回原位', '放回', 'data-rm-return');
            } else for (const [direction, text, label] of [['left', '←', '向左移动'], ['right', '→', '向右移动'], ['up', '↑', '向上移动'], ['down', '↓', '向下移动']]) add(`drag-${direction}`, label, text, 'data-rm-move', direction);
        }
        // Buttons replace the need to begin a drag while reading on a phone.
        item.style.setProperty('touch-action', 'pan-y pinch-zoom', 'important');
        added++;
    }
    return added;
}

function sync(binding) {
    for (const [target, state] of binding.scrolls) {
        if (!binding.root.contains(target)) { binding.scrolls.delete(target); continue; }
        const { bar, previous, next } = state;
        if (state.kind === 'gallery') {
            const left = target.getBoundingClientRect().left;
            const selected = state.slides.reduce((best, slide, index) =>
                Math.abs(slide.getBoundingClientRect().left - left) < Math.abs(state.slides[best].getBoundingClientRect().left - left) ? index : best, 0);
            state.buttons.forEach((button, index) => {
                button.setAttribute('aria-pressed', String(index === selected));
                const appearance = index === selected ? state.active : state.inactive;
                state.markers[index].style.setProperty('width', appearance.width);
                state.markers[index].style.setProperty('background-color', appearance.background);
            });
            continue;
        }
        const overflow = target.scrollWidth > target.clientWidth + 2;
        bar.style.setProperty('display', overflow ? 'inline-flex' : 'none');
        previous.disabled = !overflow || numeric(target.scrollLeft, 0) <= 1;
        next.disabled = !overflow || numeric(target.scrollLeft, 0) >= target.scrollWidth - target.clientWidth - 1;
    }
    for (const [target, { less, more }] of binding.ranges) {
        if (!binding.root.contains(target)) { binding.ranges.delete(target); continue; }
        const { min, max } = rangeLimits(target), value = numeric(target.value, min);
        less.disabled = target.disabled || value <= min;
        more.disabled = target.disabled || value >= max;
    }
}

export function hasMobileInteractionControl(root, button) {
    const binding = controlOwners.get(button);
    return Boolean(binding && binding.root === root && root.contains(button));
}

export function usesMobileInteractionButtons(root, item) {
    return Boolean(bindings.get(root)?.items.has(item) && root.contains(item));
}

export function installMobileInteractionControls(root) {
    if (!root?.addEventListener) return 0;
    // 手机上生成并保存过的面，换到电脑打开时会带着这些 −／＋、←／→ 按钮。
    // 电脑上不新增按钮，但已经存在的要接上，不能留一排点了没反应的按钮。
    const touch = touchHost(root);
    const galleryHint = [...root.querySelectorAll('style')].some(node => /scroll-snap-type\s*:\s*x\b/i.test(node.textContent || ''))
        || !!root.querySelector('[style*="scroll-snap-type"]');
    // 按钮条外层的标记可能在保存后丢了，只认按钮自己的动作标记。
    if (!touch && !galleryHint && !root.querySelector(`button[${ACTION}], span[role="group"][aria-label="${BAR_LABEL.range}"] button, span[role="group"][aria-label="${BAR_LABEL.scroll}"] button`)) return 0;
    let binding = bindings.get(root);
    if (binding) binding.reuseOnly = binding.reuseOnly && !touch;
    if (!binding) {
        binding = { root, reuseOnly: !touch, structural: null, surfaces: new WeakSet(), actions: new WeakMap(), scrolls: new Map(), ranges: new Map(), items: new WeakMap() };
        bindings.set(root, binding);
        root.addEventListener('click', event => {
            // The face driver is installed first and resets values without emitting input.
            // Refresh both range limits and view-scroll arrows after that same local click.
            const reset = event.target.closest?.('button[data-rm-reset], input[type="button"][data-rm-reset]');
            if (reset && root.contains(reset)) sync(binding);
            const button = event.target.closest?.(`button[${ACTION}]`), entry = button && binding.actions.get(button);
            if (!entry || !root.contains(entry.target) || button.disabled || !entry.action) return;
            event.preventDefault(); entry.action(); sync(binding);
        });
        const isolateGesture = event => {
            for (let node = event.target; node && node !== root; node = node.parentElement) if (binding.surfaces.has(node)) {
                event.stopPropagation(); return;
            }
        };
        // stopPropagation does not cancel the browser's native vertical scrolling.
        for (const type of ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'swiped-left', 'swiped-right']) root.addEventListener(type, isolateGesture, { passive: true });
        root.addEventListener('scroll', () => sync(binding), { capture: true, passive: true });
        root.addEventListener('input', () => sync(binding));
        root.addEventListener('change', () => sync(binding));
        root.addEventListener('toggle', () => {
            // A detached or collapsed snapshot has no measurable slide widths.
            // Retry only on opening this face, never by polling old chat history.
            if (galleryHint && root.isConnected && (root.matches('details') ? root.open : root.querySelector('details')?.open)) {
                for (const node of root.querySelectorAll('[style], [class], [data-rm-ui]')) if (horizontalCandidate(node)) galleryControls(binding, node);
            }
            sync(binding);
        }, true);
    }
    let added = 0;
    // Only a bounded local rescan on mount/repair, never document-wide observation.
    for (const node of root.querySelectorAll('[style], [class], [data-rm-ui]')) if (horizontalCandidate(node)) {
        if (galleryControls(binding, node)) added++;
        else added += Number(scrollControls(binding, node));
    }
    for (const input of root.querySelectorAll('input[type="range"]')) added += Number(rangeControls(binding, input));
    const groups = [...root.querySelectorAll(GROUP)];
    if (root.matches?.(GROUP)) groups.unshift(root);
    for (const group of groups) {
        added += itemControls(binding, group);
        for (const surface of own(group, '[data-rm-surface], [data-rm-hold], svg[data-rm-canvas]')) binding.surfaces.add(surface);
    }
    sync(binding);
    return added;
}
