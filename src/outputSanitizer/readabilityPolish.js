import { rmR as __rmR } from "../textTable.js?rmv=1.99.13";
const POLISH_ATTR = 'data-rm-polish';
const FONT_ATTR = 'data-rm-polish-font';
const LINE_ATTR = 'data-rm-polish-line';
const PAD_ATTR = 'data-rm-polish-pad';
const TAP_ATTR = 'data-rm-polish-tap';
const SCROLL_ATTR = 'data-rm-polish-scroll';
const ROOM_TOP_ATTR = 'data-rm-polish-room-top';
const ROOM_BOTTOM_ATTR = 'data-rm-polish-room-bottom';
const STYLE_ID = 'rabbit-mirror-readability-polish-style';
const SEEN = new WeakSet();
let STATES = new WeakMap();
const BINDINGS = new WeakMap();
const REFERENCES = new Set();
const PENDING = new Set();
const DOCUMENTS = new Map();
let generation = 0;
const MAX_ELEMENTS = 600;
const MAX_BOXES = 24;
const LIMIT = Symbol('readability work budget');
const TOTO_CHROME = 'summary, [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-rabbit-mirror-recipe], '
    + '[data-rabbit-mirror-resay], [data-rabbit-mirror-tool-entry-host], [data-rm-face-swipe-host], [data-rm-image-region], [data-rm-image-portal], '
    + '[data-rabbit-mirror-maintenance-menu], [data-rabbit-mirror-feedback-cat-menu], [data-rabbit-mirror-recipe-menu], [data-rabbit-mirror-interaction-diagnostic]';
const TAPPABLE = 'button, [role="button"], label[for], input[type="button"], input[type="submit"], [data-rm-step], [data-rm-pick], [data-rm-toggle], [data-rm-hold], [data-rm-spoiler]';
function ensureStyle(doc) {
    if (!doc?.head)
        return;
    let style = doc.getElementById(STYLE_ID);
    if (style?.getAttribute('data-rm-polish-revision') === '2')
        return;
    style ||= doc.createElement('style');
    style.id = STYLE_ID;
    style.setAttribute('data-rm-polish-revision', '2');
    style.textContent = [
        `details[${POLISH_ATTR}]{line-break:strict;text-autospace:normal}`,
        `[${FONT_ATTR}]{font-size:12px!important}`,
        `[${LINE_ATTR}]{line-height:1.6!important}`,
        `[${PAD_ATTR}]{padding-left:8px!important;padding-right:8px!important}`,
        `[${SCROLL_ATTR}]{overflow-y:auto!important;overscroll-behavior-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y pinch-zoom!important}`,
        `[${ROOM_TOP_ATTR}]{padding-top:var(--rm-room-top)!important}`,
        `[${ROOM_BOTTOM_ATTR}]{padding-bottom:var(--rm-room-bottom)!important}`,
        `[${TAP_ATTR}]::after{content:"";position:absolute;inset:calc(var(--rm-tap-grow,6px) * -1);pointer-events:auto}`,
    ].join('');
    doc.head.append(style);
}
function view(node) { return node.ownerDocument?.defaultView || globalThis; }
function css(node, pseudo) { try {
    return view(node).getComputedStyle(node, pseudo);
}
catch {
    return null;
} }
function faceOf(root) { return root?.matches?.('details') ? root : root?.querySelector?.('details'); }
function canMeasure(face) { return !!face?.isConnected && face.open && !face.ownerDocument?.hidden; }
function snapshot(node) {
    if (node.nodeType === 3)
        return node.data;
    const parts = [node.childNodes.length];
    for (const attr of node.attributes || []) {
        if (attr.name.startsWith('data-rm-polish'))
            continue;
        if (attr.name !== 'style') {
            parts.push(attr.name, attr.value);
            continue;
        }
        for (let index = 0; index < node.style.length; index++) {
            const name = node.style.item(index);
            if (/^--rm-(?:room-top|room-bottom|tap-grow)$/.test(name))
                continue;
            if (name === 'position' && node.hasAttribute('data-rm-polish-pos') && node.style.position === 'relative')
                continue;
            parts.push(name, node.style.getPropertyValue(name), node.style.getPropertyPriority(name));
        }
    }
    if (/^(INPUT|TEXTAREA|SELECT|OPTION)$/.test(node.tagName))
        parts.push(node.value, node.checked, node.selected, node.indeterminate);
    if (node.hasAttribute('popover')) {
        try {
            parts.push(node.matches(':popover-open'));
        }
        catch { }
    }
    return JSON.stringify(parts);
}
function stateFor(face) {
    let state = STATES.get(face);
    if (!state) {
        state = { walker: null, records: new WeakMap(), revision: 0, rootSnapshot: null, width: null, hash: null,
            focused: null, strips: new Map(), boxes: new Map(), pendingBoxes: new Set(),
            coverage: new WeakMap(), explicit: false, geometryChanged: false };
        STATES.set(face, state);
    }
    return state;
}
function rememberStrip(state, strip, box) {
    const previous = state.strips.get(strip);
    if (previous && previous !== box) {
        state.boxes.get(previous)?.delete(strip);
        state.pendingBoxes.add(previous);
        state.strips.delete(strip);
    }
    if (!box)
        return;
    state.strips.set(strip, box);
    if (!state.boxes.has(box))
        state.boxes.set(box, new Set());
    state.boxes.get(box).add(strip);
    state.pendingBoxes.add(box);
}
function directText(node) {
    let text = '';
    for (const child of node.childNodes)
        if (child.nodeType === 3)
            text += child.textContent;
    return text.replace(/\s+/g, '');
}
function transparent(color) { return !color || /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/i.test(color); }
function lineCount(node) {
    const style = css(node);
    const size = parseFloat(style?.fontSize) || 14;
    const line = style?.lineHeight === 'normal' ? size * 1.3 : (parseFloat(style?.lineHeight) || size * 1.3);
    return Math.max(1, Math.round(node.getBoundingClientRect().height / line));
}
function tryFix(node, attr, value = '', short = false) {
    const watch = [node, node.parentElement, node.parentElement?.parentElement].filter(Boolean);
    const before = watch.map(el => [el.scrollWidth - el.clientWidth, el.scrollHeight - el.clientHeight]);
    let siblings = [];
    if (short && node.parentElement) {
        if (node.parentElement.children.length <= 64)
            siblings = [...node.parentElement.children].filter(el => el !== node);
        else if (/flex|grid|table/.test(css(node.parentElement)?.display || ''))
            return false;
    }
    const siblingHeights = siblings.map(el => el.getBoundingClientRect().height);
    const lines = short ? lineCount(node) : 0;
    node.setAttribute(attr, value || 'true');
    if (short && (lineCount(node) > lines || siblings.some((el, index) => el.getBoundingClientRect().height > siblingHeights[index] + 1))) {
        node.removeAttribute(attr);
        return false;
    }
    const broke = watch.some((el, index) => {
        const style = css(el);
        const clips = style && /(hidden|clip|auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`);
        const grewX = el.scrollWidth - el.clientWidth > Math.max(1, before[index][0] + 1);
        const grewY = clips && el.scrollHeight - el.clientHeight > Math.max(1, before[index][1] + 1);
        return grewX || grewY;
    });
    if (broke) {
        node.removeAttribute(attr);
        return false;
    }
    return true;
}
function polishText(node, phone) {
    const text = directText(node);
    if (!text)
        return;
    const style = css(node);
    if (!style || style.display === 'none' || style.visibility === 'hidden')
        return;
    const size = parseFloat(style.fontSize) || 0;
    if (phone && size > 0 && size < 12 && text.length >= 3 && !node.closest('svg'))
        tryFix(node, FONT_ATTR, '', text.length < 30);
    const cjk = (text.match(__rmR("61eQEnGpTVTUTh", "g")) || []).length;
    if (cjk >= 24 && style.display !== 'inline') {
        const line = style.lineHeight === 'normal' ? 1.3 : (parseFloat(style.lineHeight) || 0) / (parseFloat(css(node).fontSize) || 1);
        if (line > 0 && line < 1.45)
            tryFix(node, LINE_ATTR);
    }
    if (style.display !== 'inline' && text.length >= 4) {
        const own = !transparent(style.backgroundColor) || (style.backgroundImage && style.backgroundImage !== 'none');
        const parent = css(node.parentElement);
        const differs = !parent || style.backgroundColor !== parent.backgroundColor || (style.backgroundImage && style.backgroundImage !== 'none');
        const pad = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
        if (own && differs && pad < 4 && node.getBoundingClientRect().width >= 60)
            tryFix(node, PAD_ATTR);
    }
}
function polishTap(node) {
    if (node.hasAttribute(TAP_ATTR) || node.disabled)
        return;
    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height)
        return;
    const small = Math.min(rect.width, rect.height);
    if (small >= 28)
        return;
    const after = css(node, '::after');
    if (after && after.content && after.content !== 'none' && after.content !== 'normal')
        return;
    const style = css(node);
    if (style?.position === 'static') {
        const walker = node.ownerDocument.createTreeWalker(node, 1);
        let checked = 0;
        for (let child = walker.nextNode(); child; child = walker.nextNode()) {
            if (++checked > 64 || /absolute|fixed/.test(css(child)?.position || ''))
                return;
        }
        node.style.position = 'relative';
        node.setAttribute('data-rm-polish-pos', 'true');
    }
    node.style.setProperty('--rm-tap-grow', `${Math.min(6, Math.ceil((32 - small) / 2))}px`);
    node.setAttribute(TAP_ATTR, 'true');
}
const NOT_A_STRIP = 'label, button, input, select, textarea, a[href], [role="button"], [data-rm-cover], [data-rm-ui], [data-rm-card], [data-rm-spoiler], [data-rm-peek], figure, img, svg, canvas, video';
function opaque(style) {
    if (style.backgroundImage && style.backgroundImage !== 'none')
        return true;
    const match = String(style.backgroundColor || '').match(/rgba?\(([^)]+)\)/);
    if (!match)
        return false;
    const parts = match[1].split(',').map(part => parseFloat(part));
    return parts.length < 4 || parts[3] >= 0.5;
}
function overlaps(a, b) {
    return Math.min(a.right, b.right) - Math.max(a.left, b.left) >= 4 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) >= 2;
}
function spend(budget) { if (--budget.left < 0)
    throw LIMIT; }
function coversFlowText(strip, box, budget, state, area, outer) {
    const doc = box.ownerDocument;
    const geometry = [area.top, area.right, area.bottom, area.left, outer.top, outer.right, outer.bottom, outer.left].join(',');
    let scan = state.coverage.get(strip);
    if (!scan || scan.box !== box || scan.geometry !== geometry
        || (state.explicit && scan.result !== undefined && scan.run !== state.revision)) {
        scan = { box, geometry, walker: doc.createTreeWalker(box, 4), range: doc.createRange(),
            text: null, ancestor: null, rects: null, index: 0, result: undefined, run: state.revision };
        state.coverage.set(strip, scan);
    }
    if (scan.result !== undefined)
        return scan.result;
    outer: while (true) {
        if (!scan.text) {
            spend(budget);
            scan.text = scan.walker.nextNode();
            if (!scan.text) {
                scan.result = false;
                return false;
            }
            if (!scan.text.data.trim() || strip.contains(scan.text)) {
                scan.text = null;
                continue;
            }
            scan.ancestor = scan.text.parentElement;
            scan.rects = null;
        }
        while (scan.ancestor && scan.ancestor !== box) {
            spend(budget);
            const element = scan.ancestor;
            scan.ancestor = element.parentElement;
            if (/absolute|fixed/.test(css(element)?.position || '')) {
                scan.text = null;
                continue outer;
            }
        }
        if (!scan.rects) {
            spend(budget);
            scan.range.selectNodeContents(scan.text);
            scan.rects = scan.range.getClientRects();
            scan.index = 0;
        }
        while (scan.index < scan.rects.length) {
            spend(budget);
            if (overlaps(scan.rects[scan.index++], area)) {
                scan.result = true;
                return true;
            }
        }
        scan.text = null;
        scan.rects = null;
    }
}
function reserveRoomForStrips(face, state) {
    const budget = { left: MAX_ELEMENTS };
    let checked = 0;
    for (const box of state.pendingBoxes) {
        if (++checked > MAX_BOXES)
            break;
        state.pendingBoxes.delete(box);
        const strips = state.boxes.get(box);
        if (!face.contains(box)) {
            for (const strip of strips || []) {
                if (state.strips.get(strip) === box)
                    state.strips.delete(strip);
                state.coverage.delete(strip);
            }
            state.boxes.delete(box);
            continue;
        }
        const previous = [box.getAttribute(ROOM_TOP_ATTR), box.getAttribute(ROOM_BOTTOM_ATTR)];
        const room = { top: 0, bottom: 0 };
        box.removeAttribute(ROOM_TOP_ATTR);
        box.removeAttribute(ROOM_BOTTOM_ATTR);
        try {
            for (const strip of strips || []) {
                spend(budget);
                if (!face.contains(strip)) {
                    strips.delete(strip);
                    state.strips.delete(strip);
                    continue;
                }
                const style = css(strip);
                if (style?.position !== 'absolute' || style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.5)
                    continue;
                const walker = face.ownerDocument.createTreeWalker(strip, 5);
                let protectedContent = false, textLength = 0;
                for (let child = walker.nextNode(); child; child = walker.nextNode()) {
                    spend(budget);
                    if (child.nodeType === 1 && child.matches(NOT_A_STRIP)) {
                        protectedContent = true;
                        break;
                    }
                    if (child.nodeType === 3)
                        textLength += child.data.trim().length;
                }
                if (protectedContent || textLength < 2 || !opaque(style) || strip.offsetParent !== box)
                    continue;
                const rect = strip.getBoundingClientRect(), outer = box.getBoundingClientRect();
                if (!rect.height || !outer.height || rect.height > outer.height * 0.4)
                    continue;
                const boxStyle = css(box);
                const inner = { top: outer.top + (parseFloat(boxStyle.borderTopWidth) || 0), bottom: outer.bottom - (parseFloat(boxStyle.borderBottomWidth) || 0) };
                const top = rect.top + rect.height / 2 < inner.top + (inner.bottom - inner.top) / 2;
                if (top ? rect.top - inner.top > 40 : inner.bottom - rect.bottom > 40)
                    continue;
                if (!coversFlowText(strip, box, budget, state, rect, outer))
                    continue;
                const amount = Math.ceil(top ? rect.bottom - inner.top + 6 : inner.bottom - rect.top + 6);
                if (top)
                    room.top = Math.max(room.top, amount);
                else
                    room.bottom = Math.max(room.bottom, amount);
            }
        }
        catch (error) {
            [ROOM_TOP_ATTR, ROOM_BOTTOM_ATTR].forEach((attr, index) => {
                if (previous[index] !== null)
                    box.setAttribute(attr, previous[index]);
            });
            if (error === LIMIT) {
                state.pendingBoxes.add(box);
                break;
            }
            continue;
        }
        const style = css(box);
        const clips = /(hidden|clip)/.test(`${style.overflowX} ${style.overflowY}`);
        const before = box.scrollHeight - box.clientHeight;
        for (const [side, attr] of [['top', ROOM_TOP_ATTR], ['bottom', ROOM_BOTTOM_ATTR]]) {
            const current = parseFloat(side === 'top' ? style.paddingTop : style.paddingBottom) || 0;
            if (room[side] <= current)
                continue;
            box.style.setProperty(`--rm-room-${side}`, `${room[side]}px`);
            box.setAttribute(attr, 'true');
        }
        if (clips && box.scrollHeight - box.clientHeight > Math.max(1, before + 1)) {
            box.removeAttribute(ROOM_TOP_ATTR);
            box.removeAttribute(ROOM_BOTTOM_ATTR);
            continue;
        }
        if (!strips?.size && !box.hasAttribute(ROOM_TOP_ATTR) && !box.hasAttribute(ROOM_BOTTOM_ATTR))
            state.boxes.delete(box);
    }
}
export function polishReadability(root) {
    return runPolish(faceOf(root), true);
}
const READING_GESTURE = 'svg, canvas, [data-rm-surface], [data-rm-canvas], [data-rm-knob], '
    + '[data-rm-ui="draw"], [data-rm-ui="drag"], [data-rm-ui="reorder"], [data-rm-ui="swipe"]';
function polishReadingScroll(node, style, budget, record, revision) {
    const pending = record.scrollScan;
    delete record.scrollScan;
    if (node.hasAttribute(SCROLL_ATTR) || !node.firstChild
        || !/^(DIV|SECTION|ARTICLE|MAIN|ASIDE|P|BLOCKQUOTE|PRE|UL|OL|LI|DL|DD|TD)$/.test(node.tagName)
        || node.closest(READING_GESTURE))
        return;
    if (!style || !/^(hidden|clip)$/.test(style.overflowY)
        || /^(absolute|fixed)$/.test(style.position) || style.visibility !== 'visible' || Number(style.opacity) === 0
        || (style.transform && style.transform !== 'none')
        || (style.perspective && style.perspective !== 'none')
        || (style.animationName && style.animationName !== 'none')
        || (style.aspectRatio && style.aspectRatio !== 'auto')
        || (style.scrollSnapType && style.scrollSnapType !== 'none'))
        return;
    if (node.clientWidth < 100 || node.clientHeight < 48 || node.scrollHeight <= node.clientHeight + 6)
        return;
    if (budget.candidates <= 0 || budget.nodes <= 0) {
        if (pending)
            record.scrollScan = pending;
        return 'defer';
    }
    budget.candidates--;
    const box = node.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0)
        return;
    const resume = pending && pending.revision === revision && node.contains(pending.current);
    let current = resume ? pending.current : node.firstChild, visited = 0;
    let text = resume ? pending.text : 0, outside = resume ? pending.outside : false;
    while (current && visited < 96 && budget.nodes > 0) {
        visited++;
        budget.nodes--;
        let descend = true;
        if (current.nodeType === 1) {
            const s = css(current);
            descend = !!s && !current.matches('style, script, template, details:not([open]), [hidden], [inert], [aria-hidden="true"], ' + TOTO_CHROME + ', ' + READING_GESTURE)
                && s.display !== 'none' && s.visibility === 'visible' && Number(s.opacity) !== 0
                && !/^(absolute|fixed)$/.test(s.position)
                && (!s.transform || s.transform === 'none')
                && (!s.aspectRatio || s.aspectRatio === 'auto')
                && (!s.scrollSnapType || s.scrollSnapType === 'none')
                && (!s.animationName || s.animationName === 'none')
                && !(/^(auto|scroll)$/.test(s.overflowY) && current.scrollHeight > current.clientHeight + 6)
                && !(/^(hidden|clip)$/.test(s.overflowY) && current.clientHeight < 2);
        }
        else if (current.nodeType === 3 && current.data.trim()) {
            text += Math.min(80, current.data.trim().length);
            if (!outside) {
                const range = node.ownerDocument.createRange();
                range.selectNodeContents(current);
                const rect = range.getBoundingClientRect();
                outside = rect.width > 0 && rect.height > 0 && rect.bottom > box.bottom + 4;
            }
            if (text >= 40 && outside) {
                node.setAttribute(SCROLL_ATTR, 'true');
                return;
            }
        }
        if (descend && current.firstChild) {
            current = current.firstChild;
            continue;
        }
        while (current && current !== node && !current.nextSibling)
            current = current.parentNode;
        current = current && current !== node ? current.nextSibling : null;
    }
    if (current) {
        record.scrollScan = { current, text, outside, revision };
        return 'defer';
    }
}
function runPolish(face, explicit = false) {
    if (!canMeasure(face))
        return 0;
    const state = stateFor(face);
    ensureStyle(face.ownerDocument);
    if (!face.hasAttribute(POLISH_ATTR))
        face.setAttribute(POLISH_ATTR, 'true');
    const phone = (view(face).innerWidth || 1024) <= 520;
    const rootSnapshot = snapshot(face), width = view(face).innerWidth;
    const activeElement = face.ownerDocument.activeElement;
    const focused = face.contains(activeElement) ? activeElement : null;
    const hash = face.ownerDocument.location?.hash || '';
    let contentChanged = state.geometryChanged || state.rootSnapshot !== rootSnapshot || state.width !== width || state.focused !== focused || state.hash !== hash;
    let changed = explicit || contentChanged;
    state.geometryChanged = false;
    state.explicit = explicit;
    state.rootSnapshot = rootSnapshot;
    state.width = width;
    state.focused = focused;
    state.hash = hash;
    if (!state.walker || !face.contains(state.walker.currentNode))
        state.walker = face.ownerDocument.createTreeWalker(face, 5);
    const batch = [];
    let fresh = false;
    for (let inspected = 0; inspected < MAX_ELEMENTS; inspected++) {
        const node = state.walker.nextNode();
        if (!node) {
            state.walker = null;
            break;
        }
        const element = node.nodeType === 1 ? node : node.parentElement;
        if (element?.closest(TOTO_CHROME))
            continue;
        const next = snapshot(node), previous = state.records.get(node);
        if (previous && previous.snapshot !== next) {
            changed = true;
            contentChanged = true;
        }
        if (!previous)
            fresh = true;
        const record = previous || { revision: -1 };
        record.snapshot = next;
        state.records.set(node, record);
        if (node.nodeType === 1 && !element?.closest('svg'))
            batch.push([node, record]);
    }
    if (changed)
        state.revision++;
    if (contentChanged || fresh) {
        state.coverage = new WeakMap();
        state.readingRevision = (state.readingRevision || 0) + 1;
    }
    if (changed || fresh)
        for (const box of state.boxes.keys())
            state.pendingBoxes.add(box);
    let count = 0;
    const scrollBudget = { candidates: 12, nodes: 192 };
    for (const [node, record] of batch) {
        if (record.revision === state.revision)
            continue;
        record.revision = state.revision;
        try {
            if (!SEEN.has(node) && !/^(STYLE|SCRIPT|SVG|IMG|BR|INPUT|TEXTAREA|SELECT)$/i.test(node.tagName)) {
                const rect = node.getBoundingClientRect();
                if (rect.width && rect.height) {
                    SEEN.add(node);
                    count++;
                    polishText(node, phone);
                    if (node.matches(TAPPABLE))
                        polishTap(node);
                }
            }
            let box = null;
            const nodeStyle = !node.matches(NOT_A_STRIP) && !/^(STYLE|SCRIPT|BR)$/.test(node.tagName) ? css(node) : null;
            if (polishReadingScroll(node, nodeStyle, scrollBudget, record, state.readingRevision) === 'defer')
                record.revision = -1;
            if (nodeStyle?.position === 'absolute') {
                const parent = node.offsetParent;
                if (parent && parent !== face && face.contains(parent) && !parent.closest(TOTO_CHROME))
                    box = parent;
            }
            rememberStrip(state, node, box);
            if ((node.hasAttribute(ROOM_TOP_ATTR) || node.hasAttribute(ROOM_BOTTOM_ATTR)) && !state.boxes.has(node)) {
                state.boxes.set(node, new Set());
                state.pendingBoxes.add(node);
            }
        }
        catch { }
    }
    try {
        reserveRoomForStrips(face, state);
    }
    catch { }
    return count;
}
export function installReadabilityPolish(root) {
    const face = faceOf(root);
    if (!face?.isConnected)
        return;
    const existing = BINDINGS.get(face);
    if (existing?.generation === generation)
        return;
    if (existing)
        disposeReadabilityPolish(face);
    const win = view(face), doc = face.ownerDocument;
    const binding = { face, timer: 0, pending: true, disposed: false, generation, later: null, cancel: null,
        reference: typeof WeakRef === 'function' ? new WeakRef(face) : null };
    const cancel = () => { if (binding.timer)
        win.clearTimeout(binding.timer); binding.timer = 0; PENDING.delete(binding); };
    const run = () => {
        binding.timer = 0;
        PENDING.delete(binding);
        if (binding.disposed)
            return;
        if (binding.generation !== generation) {
            disposeReadabilityPolish(face);
            return;
        }
        if (!face.isConnected) {
            disposeReadabilityPolish(face);
            return;
        }
        if (!canMeasure(face))
            return;
        binding.pending = false;
        try {
            runPolish(face);
        }
        catch { }
    };
    const later = event => {
        if (binding.disposed)
            return;
        if (binding.generation !== generation) {
            disposeReadabilityPolish(face);
            return;
        }
        if (event?.type === 'load')
            stateFor(face).geometryChanged = true;
        cancel();
        binding.pending = true;
        if (canMeasure(face)) {
            binding.timer = win.setTimeout(run, 350);
            PENDING.add(binding);
        }
    };
    binding.later = later;
    binding.cancel = cancel;
    BINDINGS.set(face, binding);
    for (const type of ['click', 'toggle', 'input', 'change', 'load'])
        face.addEventListener(type, later, true);
    const documentBinding = documentBindingFor(doc);
    if (binding.reference) {
        documentBinding.faces.add(binding.reference);
        REFERENCES.add(binding.reference);
    }
    else
        documentBinding.fallback = true;
    run();
}
function documentBindingFor(doc) {
    let entry = DOCUMENTS.get(doc);
    if (entry)
        return entry;
    entry = { faces: new Set(), fallback: false, changed: null };
    entry.changed = () => {
        for (const item of registeredBindings(doc)) {
            if (doc.hidden)
                item.cancel();
            else if (item.pending)
                item.later();
        }
        pruneReadabilityPolish();
    };
    DOCUMENTS.set(doc, entry);
    doc.addEventListener('visibilitychange', entry.changed);
    return entry;
}
function registeredBindings(doc = null) {
    const found = new Set();
    for (const reference of REFERENCES) {
        const face = reference.deref();
        if (!face) {
            REFERENCES.delete(reference);
            continue;
        }
        const binding = BINDINGS.get(face);
        if (binding && (!doc || face.ownerDocument === doc))
            found.add(binding);
    }
    for (const [owner, entry] of DOCUMENTS) {
        if ((doc && owner !== doc) || !entry.fallback)
            continue;
        for (const face of owner.querySelectorAll('details')) {
            const binding = BINDINGS.get(face);
            if (binding)
                found.add(binding);
        }
    }
    for (const binding of PENDING)
        if (!doc || binding.face.ownerDocument === doc)
            found.add(binding);
    return found;
}
export function disposeReadabilityPolish(root) {
    const face = faceOf(root), binding = BINDINGS.get(face);
    if (face)
        STATES.delete(face);
    if (!binding)
        return;
    binding.disposed = true;
    binding.cancel();
    BINDINGS.delete(face);
    for (const type of ['click', 'toggle', 'input', 'change', 'load'])
        face.removeEventListener(type, binding.later, true);
    const doc = face.ownerDocument, documentBinding = DOCUMENTS.get(doc);
    if (binding.reference) {
        documentBinding?.faces.delete(binding.reference);
        REFERENCES.delete(binding.reference);
    }
    if (documentBinding && !documentBinding.faces.size && !documentBinding.fallback) {
        doc.removeEventListener('visibilitychange', documentBinding.changed);
        DOCUMENTS.delete(doc);
    }
}
export function pruneReadabilityPolish() {
    for (const binding of registeredBindings())
        if (!binding.face.isConnected)
            disposeReadabilityPolish(binding.face);
    for (const [doc, entry] of DOCUMENTS) {
        for (const reference of entry.faces)
            if (!reference.deref())
                entry.faces.delete(reference);
        if (!entry.faces.size && !entry.fallback) {
            doc.removeEventListener('visibilitychange', entry.changed);
            DOCUMENTS.delete(doc);
        }
    }
}
export function destroyReadabilityPolish() {
    for (const binding of registeredBindings())
        disposeReadabilityPolish(binding.face);
    generation++;
    STATES = new WeakMap();
    for (const [doc, entry] of DOCUMENTS)
        doc.removeEventListener('visibilitychange', entry.changed);
    DOCUMENTS.clear();
    REFERENCES.clear();
}
