import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=1.99.13";
const CONTENT_ATTRS = new Set(['alt', 'title', 'aria-label', 'aria-description', 'aria-roledescription', 'placeholder', 'srcset', 'poster', 'srcdoc']);
const CONTENT_ATTR_RE = /^(?:data-rm-vs|data-rm-draw-|data-rm-image|data-rabbit-mirror-(?:external-owner|owner-|labeled-checked-last|generic-probe)|data-rm-key$|data-rm-avatar)/;
const URL_ATTRS = new Set(['href', 'src', 'action', 'formaction', 'cite', 'data', 'xlink:href']);
const TOOL_UI = '[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-diagnostic-panel], .rabbit-mirror-maintenance-menu, [data-rm-face-swipe-host], [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-rm-image-region], [data-rm-image-portal]';
export function maskFaceText(value) {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (!text)
        return '';
    return `${__rmT("r8DnyT")}${text.length}`;
}
function placeholderFor(text) {
    const trimmed = text.replace(/\s+/g, '');
    if (!trimmed)
        return text;
    const lead = /^\s*/.exec(text)[0];
    const tail = /\s*$/.exec(text)[0];
    return `${lead}${__rmT("zYE").repeat(Math.max(1, Math.min(trimmed.length, 8)))}${tail}`;
}
function scrubUrl(value) {
    const text = String(value || '').trim();
    if (!text)
        return '';
    if (/^#/.test(text))
        return text;
    if (/^data:/i.test(text))
        return 'data:…';
    const scheme = /^([a-z][a-z0-9+.-]*:)/i.exec(text);
    return scheme ? `${scheme[1]}…` : '…';
}
function scrubCss(text, keys = new Map()) {
    const source = String(text || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\(\s*(['"]?)[^)]*\1\s*\)/gi, 'url()');
    let out = '';
    let depth = 0;
    let inValue = false;
    for (let index = 0; index < source.length; index += 1) {
        const char = source[index];
        if (char === '"' || char === "'") {
            let end = index + 1;
            while (end < source.length && source[end] !== char)
                end += source[end] === '\\' ? 2 : 1;
            const inner = source.slice(index + 1, end);
            if (inValue)
                out += `${char}${char}`;
            else
                out += `${char}${PLAIN_KEY.test(inner) ? inner : maskKeys(inner, keys)}${char}`;
            index = end;
            continue;
        }
        if (char === '{') {
            depth += 1;
            inValue = false;
        }
        else if (char === '}') {
            depth = Math.max(0, depth - 1);
            inValue = false;
        }
        else if (char === ':' && depth > 0)
            inValue = true;
        else if (char === ';')
            inValue = false;
        out += char;
    }
    return out;
}
function scrubStyleAttribute(value) {
    return scrubCss(`{${value}}`).slice(1, -1);
}
const KEY_ATTRS = new Set(['data-rm-show', 'data-rm-pick', 'data-rm-picked', 'data-rm-on', 'data-rm-toggle', 'data-rm-page', 'data-rm-goto', 'data-rm-item', 'data-rm-slot', 'data-rm-end', 'data-rm-code', 'data-rm-answer', 'data-rm-seq', 'data-rm-part', 'data-rm-step', 'data-rm-when', 'data-rm-cover', 'data-rm-state', 'data-rm-target', 'data-rm-card', 'data-rm-peek', 'data-rm-spoiler', 'data-rm-memory', 'data-rm-recall', 'data-rm-left', 'data-rm-right', 'data-rm-swiped-left', 'data-rm-swiped-right', 'data-rm-peeking']);
const PLAIN_KEY = /^!?[\w.-]{1,24}$/;
const STRUCTURAL_ATTRS = new Set(['id', 'class', 'for', 'name', 'type', 'min', 'max', 'step', 'open', 'hidden', 'checked', 'disabled', 'role', 'tabindex', 'aria-pressed', 'aria-expanded', 'aria-hidden', 'aria-controls', 'aria-live', 'aria-checked', 'aria-selected', 'lang', 'dir', 'width', 'height', 'viewbox', 'preserveaspectratio', 'd', 'points', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'fill', 'stroke', 'stroke-width', 'opacity', 'transform', 'colspan', 'rowspan', 'loop', 'autoplay', 'muted', 'controls', 'popover', 'popovertarget', 'inert', 'draggable', 'contenteditable', 'inputmode', 'maxlength', 'readonly', 'required', 'multiple', 'selected', 'start', 'reversed', 'scope', 'headers', 'datetime', 'dirname']);
function maskKeys(value, keys) {
    return String(value || '').split(__rmR(".HgKaulBplS8SzNbMLjExboXeHs", "")).map(token => {
        if (!token || __rmR("TQgKaulBplS8SzNbMLjExboXLFs", "").test(token))
            return token;
        const negated = token.startsWith('!');
        const key = negated ? token.slice(1) : token;
        if (PLAIN_KEY.test(token))
            return token;
        const colon = key.indexOf(':');
        if (colon > 0 && PLAIN_KEY.test(key.slice(colon + 1))) {
            const head = key.slice(0, colon);
            if (!PLAIN_KEY.test(head) && !keys.has(head))
                keys.set(head, `k${keys.size + 1}`);
            return `${negated ? '!' : ''}${keys.get(head) || head}${key.slice(colon)}`;
        }
        if (!keys.has(key))
            keys.set(key, `k${keys.size + 1}`);
        return `${negated ? '!' : ''}${keys.get(key)}`;
    }).join('');
}
function quotedInFaceCss(keys, value) {
    return !!keys.quotedCss?.has(value);
}
function collectQuotedCss(container) {
    const found = new Set();
    for (const style of container.querySelectorAll?.('style') || []) {
        for (const match of String(style.textContent || '').matchAll(/(["'])([^"'\n]{1,200})\1/g))
            found.add(match[2]);
    }
    return found;
}
function scrubAttribute(element, name, value, keys) {
    const lower = name.toLowerCase();
    if (lower === 'style')
        return scrubStyleAttribute(value);
    if (URL_ATTRS.has(lower))
        return scrubUrl(value);
    if (CONTENT_ATTRS.has(lower) || CONTENT_ATTR_RE.test(lower))
        return value ? maskFaceText(value) : value;
    if (/^on[a-z]+$/i.test(lower))
        return '';
    if (KEY_ATTRS.has(lower))
        return maskKeys(value, keys);
    if (lower === 'value') {
        const tag = element.tagName.toLowerCase();
        const kind = String(element.getAttribute('type') || '').toLowerCase();
        const textual = tag === 'option' || tag === 'button' || (tag === 'input' && !['range', 'checkbox', 'radio', 'number', 'hidden'].includes(kind));
        return textual && !PLAIN_KEY.test(value) ? maskFaceText(value) : value;
    }
    if (/^data-rabbit-mirror-title-/.test(lower))
        return value && !/^(?:true|false|\d+)$/.test(value) ? maskFaceText(value) : value;
    if (lower.startsWith('data-rm-') || lower.startsWith('data-rabbit-mirror-') || STRUCTURAL_ATTRS.has(lower)) {
        if (/[^\x20-\x7e]/.test(value))
            return lower.startsWith('data-rabbit-mirror-') ? maskFaceText(value) : maskKeys(value, keys);
        if (value && !PLAIN_KEY.test(value) && (lower === 'data-rabbit-mirror-css-scope' || (lower.startsWith('data-rm-') && quotedInFaceCss(keys, value))))
            return maskKeys(value, keys);
        return value;
    }
    return PLAIN_KEY.test(value) ? value : maskFaceText(value);
}
function walk(node, keys) {
    for (const child of [...(node.content ? node.content.childNodes : node.childNodes)]) {
        if (child.nodeType === 3) {
            const parent = child.parentElement;
            const tag = parent?.tagName?.toLowerCase();
            if (tag === 'style')
                child.nodeValue = scrubCss(child.nodeValue, keys);
            else if (tag === 'script')
                child.nodeValue = '';
            else
                child.nodeValue = placeholderFor(child.nodeValue);
            continue;
        }
        if (child.nodeType === 8) {
            child.remove();
            continue;
        }
        if (child.nodeType !== 1)
            continue;
        const element = child;
        const tag = element.tagName.toLowerCase();
        if (tag === 'script' || tag === 'iframe' || tag === 'object' || tag === 'embed') {
            element.remove();
            continue;
        }
        if (element.matches?.(TOOL_UI)) {
            element.remove();
            continue;
        }
        if (tag === 'style' && element.matches('[data-rabbit-mirror-mobile-layout-rescue], [data-rabbit-mirror-maintenance-patch], [data-rabbit-mirror-local-panel-layout]')) {
            element.textContent = __rmT("lJtBnMEBYlK1NtisfxL_eKzxctf1B8bBWed7Df");
            continue;
        }
        for (const attribute of [...element.attributes]) {
            if (!/^[a-z][\w:.-]*$/i.test(attribute.name)) {
                element.removeAttribute(attribute.name);
                continue;
            }
            const next = scrubAttribute(element, attribute.name, attribute.value, keys);
            if (next === '' && /^on[a-z]+$/i.test(attribute.name))
                element.removeAttribute(attribute.name);
            else if (next !== attribute.value)
                element.setAttribute(attribute.name, next);
        }
        if (tag === 'textarea' || tag === 'option')
            element.textContent = placeholderFor(element.textContent);
        else
            walk(element, keys);
    }
}
export function skeletonizeRabbitMirrorHtml(input) {
    if (typeof document === 'undefined')
        return '';
    let container;
    if (typeof input === 'string') {
        const template = document.createElement('template');
        template.innerHTML = input;
        container = template.content;
    }
    else if (input?.cloneNode) {
        const template = document.createElement('template');
        template.content.append(input.cloneNode(true));
        container = template.content;
    }
    else
        return '';
    const keys = new Map();
    keys.quotedCss = collectQuotedCss(container);
    walk(container, keys);
    const wrapper = document.createElement('div');
    wrapper.append(container);
    return wrapper.innerHTML;
}
export function buildWritingSkeleton(rawSource, renderedClone) {
    return {
        source: skeletonizeRabbitMirrorHtml(String(rawSource || '')),
        rendered: renderedClone ? skeletonizeRabbitMirrorHtml(renderedClone) : '',
    };
}
