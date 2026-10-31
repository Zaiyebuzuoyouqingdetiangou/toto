import { layoutRect } from '../faceZoomMetrics.js?rmv=2.6.0';
const KIND_ATTR = 'data-rm-press';
const PRESSING_ATTR = 'data-rm-pressing';
const RELEASING_ATTR = 'data-rm-press-release';
const SHADOW_VAR = '--rm-press-shadow';
const SINK_VAR = '--rm-press-sink';
const STYLE_ID = 'rabbit-mirror-press-feedback-style';
const BOUND = new WeakSet();
const ACTIVE_CSS_CACHE = new WeakMap();
const CANDIDATE = 'button, [role="button"], label, input[type="button"], input[type="submit"], input[type="reset"], [data-rm-step], [data-rm-reset], [data-rm-spoiler], [data-rm-toggle]';
const TOTO_CHROME = [
    'summary', '[data-rabbit-mirror-maintenance-rabbit]', '[data-rabbit-mirror-feedback-cat]', '[data-rabbit-mirror-recipe]',
    '[data-rabbit-mirror-resay]', '[data-rabbit-mirror-tool-entry-host]', '[data-rm-face-swipe-host]', '[data-rm-image-region]',
    '[data-rm-image-portal]', '[data-rabbit-mirror-maintenance-menu]', '[data-rabbit-mirror-feedback-cat-menu]',
    '[data-rabbit-mirror-recipe-menu]', '[data-rabbit-mirror-interaction-diagnostic]',
].join(',');
function ensureStyle(doc) {
    if (!doc?.head || doc.getElementById(STYLE_ID))
        return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    const press = 'transition:transform .07s ease-out,box-shadow .07s ease-out,filter .07s ease-out,opacity .07s ease-out!important;';
    const release = 'transition:transform .16s ease-out,box-shadow .16s ease-out,filter .16s ease-out,opacity .16s ease-out!important;';
    style.textContent = [
        `[${PRESSING_ATTR}]{${press}}`,
        `[${RELEASING_ATTR}]{${release}}`,
        `[${KIND_ATTR}="raised"][${PRESSING_ATTR}]{transform:translateY(var(${SINK_VAR},1px))!important;box-shadow:var(${SHADOW_VAR})!important;filter:brightness(.97)!important}`,
        `[${KIND_ATTR}="flat"][${PRESSING_ATTR}]{transform:scale(.97)!important;filter:brightness(.94)!important}`,
        `[${KIND_ATTR}="knob"][${PRESSING_ATTR}]{transform:scale(.92)!important;filter:brightness(.94)!important}`,
        `[${KIND_ATTR}="tint"][${PRESSING_ATTR}]{filter:brightness(.93)!important}`,
        `[${KIND_ATTR}="ink"][${PRESSING_ATTR}]{opacity:.62!important}`,
        `@media (prefers-reduced-motion:reduce){[${PRESSING_ATTR}]{transform:none!important}}`,
    ].join('');
    doc.head.append(style);
}
function splitTopLevel(text) {
    const parts = [];
    let depth = 0, start = 0;
    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (char === '(')
            depth += 1;
        else if (char === ')')
            depth = Math.max(0, depth - 1);
        else if (char === ',' && depth === 0) {
            parts.push(text.slice(start, index).trim());
            start = index + 1;
        }
    }
    parts.push(text.slice(start).trim());
    return parts.filter(Boolean);
}
export function pressedShadow(computedShadow) {
    const text = String(computedShadow || '').trim();
    let maxDrop = 0;
    const out = [];
    if (text && text !== 'none') {
        for (const part of splitTopLevel(text)) {
            if (/\binset\b/.test(part)) {
                out.push(part);
                continue;
            }
            const color = (part.match(/rgba?\([^)]*\)/i) || [''])[0];
            if (!color)
                return null;
            const numbers = part.replace(color, ' ').match(/-?\d*\.?\d+px|\b0\b/g) || [];
            const [x = 0, y = 0, blur = 0, spread = 0] = numbers.map(value => parseFloat(value) || 0);
            if (blur <= 1)
                maxDrop = Math.max(maxDrop, y);
            out.push(`${color} ${(x * 0.3).toFixed(1)}px ${(y * 0.3).toFixed(1)}px ${(blur * 0.5).toFixed(1)}px ${spread}px`.trim());
        }
    }
    out.push('inset 0 1px 2px rgba(0,0,0,.16)');
    const sink = Math.max(1, Math.min(3, Math.round(maxDrop * 0.6)));
    return { shadow: out.join(', '), sink: `${sink}px` };
}
function hasOuterShadow(shadow) {
    const text = String(shadow || '');
    return !!text && text !== 'none' && splitTopLevel(text).some(part => !/\binset\b/.test(part));
}
function transparentColor(color) {
    return !color || /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/i.test(color);
}
function authorActiveSelectors(face) {
    if (ACTIVE_CSS_CACHE.has(face))
        return ACTIVE_CSS_CACHE.get(face);
    const selectors = [];
    for (const style of face.querySelectorAll('style')) {
        if (style.id === STYLE_ID)
            continue;
        const css = String(style.textContent || '').replace(/\/\*[\s\S]*?\*\//g, '');
        for (const match of css.matchAll(/([^{}@]+)\{/g)) {
            for (const selector of match[1].split(',')) {
                if (!/:active\b/.test(selector))
                    continue;
                const base = selector.split(/:active\b/)[0].trim();
                if (base)
                    selectors.push(base);
            }
        }
    }
    ACTIVE_CSS_CACHE.set(face, selectors);
    return selectors;
}
function hasAuthorActive(el, face) {
    for (const selector of authorActiveSelectors(face)) {
        try {
            if (el.matches(selector) || el.closest(selector))
                return true;
        }
        catch { }
    }
    return false;
}
export function pressKindFor(el, face) {
    const view = el.ownerDocument?.defaultView || globalThis;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true')
        return '';
    if (face && hasAuthorActive(el, face))
        return '';
    let style;
    try {
        style = view.getComputedStyle(el);
    }
    catch {
        return '';
    }
    if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none')
        return '';
    const screen = el.getBoundingClientRect();
    const rect = layoutRect(el);
    if (!rect.width || !rect.height)
        return '';
    const viewportHeight = view.innerHeight || 800;
    if (screen.height > viewportHeight * 0.45 || rect.height > 320)
        return '';
    const filled = !transparentColor(style.backgroundColor) || (style.backgroundImage && style.backgroundImage !== 'none');
    const bordered = ['Top', 'Right', 'Bottom', 'Left'].some(side => parseFloat(style[`border${side}Width`]) > 0 && !transparentColor(style[`border${side}Color`]));
    const outer = hasOuterShadow(style.boxShadow);
    if (style.display === 'inline' || (!filled && !bordered && !outer))
        return 'ink';
    const ownFilter = style.filter && style.filter !== 'none';
    if (style.transform && style.transform !== 'none')
        return ownFilter ? '' : 'tint';
    if (ownFilter)
        return '';
    if (outer)
        return 'raised';
    const radius = parseFloat(style.borderTopLeftRadius) || 0;
    if (rect.width <= 64 && rect.height <= 64 && radius >= Math.min(rect.width, rect.height) / 2 - 1)
        return 'knob';
    return 'flat';
}
function pointerCursor(node) {
    try {
        return (node.ownerDocument.defaultView || globalThis).getComputedStyle(node).cursor === 'pointer';
    }
    catch {
        return false;
    }
}
function findPressable(target, face) {
    const start = target?.nodeType === 1 ? target : target?.parentElement;
    if (!start || !face.contains(start) || start.closest?.(TOTO_CHROME))
        return null;
    const candidate = start.closest?.(CANDIDATE);
    if (candidate && face.contains(candidate) && candidate !== face)
        return candidate;
    if (!pointerCursor(start))
        return null;
    let node = start;
    while (node.parentElement && node.parentElement !== face && face.contains(node.parentElement) && pointerCursor(node.parentElement))
        node = node.parentElement;
    if (node === face)
        return null;
    const view = node.ownerDocument.defaultView || globalThis;
    if (layoutRect(node).height > 320 || node.getBoundingClientRect().height > (view.innerHeight || 800) * 0.45)
        return null;
    return node;
}
function hasOwnTransition(el) {
    try {
        const durations = String((el.ownerDocument.defaultView || globalThis).getComputedStyle(el).transitionDuration || '0s');
        return durations.split(',').some(value => parseFloat(value) > 0);
    }
    catch {
        return false;
    }
}
function press(el, face) {
    const kind = pressKindFor(el, face);
    if (!kind)
        return null;
    el.removeAttribute(RELEASING_ATTR);
    if (hasOwnTransition(el))
        el.setAttribute('data-rm-press-own-transition', 'true');
    else
        el.removeAttribute('data-rm-press-own-transition');
    el.setAttribute(KIND_ATTR, kind);
    if (kind === 'raised') {
        let shadow = '';
        try {
            shadow = (el.ownerDocument.defaultView || globalThis).getComputedStyle(el).boxShadow;
        }
        catch {
            shadow = '';
        }
        const pressed = pressedShadow(shadow);
        if (pressed) {
            el.style.setProperty(SHADOW_VAR, pressed.shadow);
            el.style.setProperty(SINK_VAR, pressed.sink);
        }
        else
            el.setAttribute(KIND_ATTR, 'flat');
    }
    el.removeAttribute(RELEASING_ATTR);
    el.setAttribute(PRESSING_ATTR, 'true');
    return el;
}
function release(el) {
    if (!el?.hasAttribute?.(PRESSING_ATTR))
        return;
    el.removeAttribute(PRESSING_ATTR);
    if (!el.hasAttribute('data-rm-press-own-transition'))
        el.setAttribute(RELEASING_ATTR, 'true');
    const view = el.ownerDocument?.defaultView || globalThis;
    view.setTimeout(() => {
        if (el.hasAttribute(PRESSING_ATTR))
            return;
        el.removeAttribute(RELEASING_ATTR);
        el.removeAttribute('data-rm-press-own-transition');
        el.style.removeProperty(SHADOW_VAR);
        el.style.removeProperty(SINK_VAR);
        if (!el.getAttribute('style')?.trim())
            el.removeAttribute('style');
    }, 200);
}
export function installPressFeedback(root) {
    const face = root?.matches?.('details') ? root : root?.querySelector?.('details');
    if (!face || BOUND.has(face))
        return;
    BOUND.add(face);
    const doc = face.ownerDocument;
    ensureStyle(doc);
    let current = null, startX = 0, startY = 0, box = null, captured = null;
    const end = () => {
        if (captured) {
            try {
                captured.el.releasePointerCapture(captured.id);
            }
            catch { }
            captured = null;
        }
        if (current)
            release(current);
        current = null;
        box = null;
    };
    face.addEventListener('pointerdown', event => {
        if (event.button > 0)
            return;
        end();
        const el = findPressable(event.target, face);
        if (!el)
            return;
        box = el.getBoundingClientRect();
        current = press(el, face);
        if (!current) {
            box = null;
            return;
        }
        startX = event.clientX;
        startY = event.clientY;
        if (event.pointerType === 'mouse') {
            try {
                el.setPointerCapture(event.pointerId);
                captured = { el, id: event.pointerId };
            }
            catch {
                captured = null;
            }
        }
    }, true);
    face.addEventListener('pointermove', event => {
        if (!current)
            return;
        if (event.pointerType !== 'mouse') {
            if (Math.hypot(event.clientX - startX, event.clientY - startY) > 10)
                end();
            return;
        }
        if (box && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom))
            end();
    }, true);
    face.addEventListener('focusout', event => { if (current && event.target === current)
        end(); }, true);
    for (const type of ['pointerup', 'pointercancel'])
        face.addEventListener(type, end, true);
    face.addEventListener('pointerleave', event => {
        if (event.target === face || (event.target === current && !captured))
            end();
    }, true);
    face.addEventListener('keydown', event => {
        if ((event.key !== 'Enter' && event.key !== ' ') || event.repeat)
            return;
        const el = findPressable(event.target, face);
        if (el && el === event.target) {
            end();
            current = press(el, face);
        }
    }, true);
    face.addEventListener('keyup', end, true);
}
