// 写法骨架：把一面兔子镜的文字全换成占位，只留结构、属性和 CSS。
// 用在诊断报告里：报告可以直接发给别人、也能直接当测试样本，不带聊天内容。
// 换掉的：所有文字节点、标题、alt／title 这类说明文字、图片和链接地址、
// 模型写的方案记录和画面提示词、聊天归属标记、CSS 里的 content 字符串和 url()。
// 留下的：标签、id、class、data-rm-* 这些写法标识、style 里的样式、<style> 里的规则。
const CONTENT_ATTRS = new Set(['alt', 'title', 'aria-label', 'aria-description', 'aria-roledescription', 'placeholder', 'srcset', 'poster', 'srcdoc']);
const CONTENT_ATTR_RE = /^(?:data-rm-vs|data-rm-draw-|data-rm-image|data-rabbit-mirror-(?:external-owner|owner-|labeled-checked-last|generic-probe)|data-rm-key$|data-rm-avatar)/;
const URL_ATTRS = new Set(['href', 'src', 'action', 'formaction', 'cite', 'data', 'xlink:href']);
// 插件自己挂在镜面里的工具（维修兔、反馈猫、工具栏、诊断面板）不是写法的一部分，骨架里去掉。
const TOOL_UI = '[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-diagnostic-panel], .rabbit-mirror-maintenance-menu, [data-rm-face-swipe-host], [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-rm-image-region], [data-rm-image-portal]';

export function maskFaceText(value) {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    return `字×${text.length}`;
}

function placeholderFor(text) {
    const trimmed = text.replace(/\s+/g, '');
    if (!trimmed) return text;
    const lead = /^\s*/.exec(text)[0];
    const tail = /\s*$/.exec(text)[0];
    return `${lead}${'字'.repeat(Math.max(1, Math.min(trimmed.length, 8)))}${tail}`;
}

function scrubUrl(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    if (/^#/.test(text)) return text; // 面内锚点是写法的一部分
    if (/^data:/i.test(text)) return 'data:…';
    const scheme = /^([a-z][a-z0-9+.-]*:)/i.exec(text);
    return scheme ? `${scheme[1]}…` : '…';
}

// CSS 里能带文字的地方清掉：注释、url()、声明值里的引号字符串（content、--label、字体名）。
// 选择器里的引号是键（[data-rm-show="甲"]），和属性里的键换成同一个代号，规则还能对上。
function scrubCss(text, keys = new Map()) {
    const source = String(text || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\(\s*(['"]?)[^)]*\1\s*\)/gi, 'url()');
    let out = '';
    let depth = 0;
    let inValue = false; // 进了声明块、见过冒号、还没到分号
    for (let index = 0; index < source.length; index += 1) {
        const char = source[index];
        if (char === '"' || char === "'") {
            let end = index + 1;
            while (end < source.length && source[end] !== char) end += source[end] === '\\' ? 2 : 1;
            const inner = source.slice(index + 1, end);
            if (inValue) out += `${char}${char}`;
            else out += `${char}${PLAIN_KEY.test(inner) ? inner : maskKeys(inner, keys)}${char}`;
            index = end;
            continue;
        }
        if (char === '{') { depth += 1; inValue = false; }
        else if (char === '}') { depth = Math.max(0, depth - 1); inValue = false; }
        else if (char === ':' && depth > 0) inValue = true;
        else if (char === ';') inValue = false;
        out += char;
    }
    return out;
}

function scrubStyleAttribute(value) {
    // 内联样式没有选择器，整段按声明值处理。
    return scrubCss(`{${value}}`).slice(1, -1);
}

// 写法里的「键」：data-rm-show="甲" 和 data-rm-pick="甲" 要对得上，所以同一个键在整面里换成同一个代号（k1、k2…）。
// 只换带中文或空格、长得像一句话的键；on、done、item0 这类英文短键照旧。
const KEY_ATTRS = new Set(['data-rm-show', 'data-rm-pick', 'data-rm-picked', 'data-rm-on', 'data-rm-toggle', 'data-rm-page', 'data-rm-goto', 'data-rm-item', 'data-rm-slot', 'data-rm-end', 'data-rm-code', 'data-rm-answer', 'data-rm-seq', 'data-rm-part', 'data-rm-step', 'data-rm-when', 'data-rm-cover', 'data-rm-state', 'data-rm-target', 'data-rm-card', 'data-rm-peek', 'data-rm-spoiler', 'data-rm-memory', 'data-rm-recall', 'data-rm-left', 'data-rm-right', 'data-rm-swiped-left', 'data-rm-swiped-right', 'data-rm-peeking']);
const PLAIN_KEY = /^!?[\w.-]{1,24}$/;
const STRUCTURAL_ATTRS = new Set(['id', 'class', 'for', 'name', 'type', 'min', 'max', 'step', 'open', 'hidden', 'checked', 'disabled', 'role', 'tabindex', 'aria-pressed', 'aria-expanded', 'aria-hidden', 'aria-controls', 'aria-live', 'aria-checked', 'aria-selected', 'lang', 'dir', 'width', 'height', 'viewbox', 'preserveaspectratio', 'd', 'points', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'fill', 'stroke', 'stroke-width', 'opacity', 'transform', 'colspan', 'rowspan', 'loop', 'autoplay', 'muted', 'controls', 'popover', 'popovertarget', 'inert', 'draggable', 'contenteditable', 'inputmode', 'maxlength', 'readonly', 'required', 'multiple', 'selected', 'start', 'reversed', 'scope', 'headers', 'datetime', 'dirname']);

function maskKeys(value, keys) {
    return String(value || '').split(/([\s,，、]+)/).map(token => {
        if (!token || /^[\s,，、]+$/.test(token)) return token;
        const negated = token.startsWith('!');
        const key = negated ? token.slice(1) : token;
        if (PLAIN_KEY.test(token)) return token;
        // 甲:left、甲:seen 这类带后缀的键：只换前半，后缀照留，和 data-rm-card="甲" 换出的代号对得上。
        const colon = key.indexOf(':');
        if (colon > 0 && PLAIN_KEY.test(key.slice(colon + 1))) {
            const head = key.slice(0, colon);
            if (!PLAIN_KEY.test(head) && !keys.has(head)) keys.set(head, `k${keys.size + 1}`);
            return `${negated ? '!' : ''}${keys.get(head) || head}${key.slice(colon)}`;
        }
        if (!keys.has(key)) keys.set(key, `k${keys.size + 1}`);
        return `${negated ? '!' : ''}${keys.get(key)}`;
    }).join('');
}

function scrubAttribute(element, name, value, keys) {
    const lower = name.toLowerCase();
    if (lower === 'style') return scrubStyleAttribute(value);
    if (URL_ATTRS.has(lower)) return scrubUrl(value);
    if (CONTENT_ATTRS.has(lower) || CONTENT_ATTR_RE.test(lower)) return value ? maskFaceText(value) : value;
    if (/^on[a-z]+$/i.test(lower)) return '';
    if (KEY_ATTRS.has(lower)) return maskKeys(value, keys);
    if (lower === 'value') {
        // 滑杆、单选的 value 是数值或短键，留着；文本框、下拉项的 value 可能是正文，只留长度。
        const tag = element.tagName.toLowerCase();
        const kind = String(element.getAttribute('type') || '').toLowerCase();
        const textual = tag === 'option' || tag === 'button' || (tag === 'input' && !['range', 'checkbox', 'radio', 'number', 'hidden'].includes(kind));
        return textual && !PLAIN_KEY.test(value) ? maskFaceText(value) : value;
    }
    if (lower.startsWith('data-rm-') || lower.startsWith('data-rabbit-mirror-') || STRUCTURAL_ATTRS.has(lower)) {
        return /[^\x20-\x7e]/.test(value) && !lower.startsWith('data-rabbit-mirror-') ? maskKeys(value, keys) : value;
    }
    // 别的属性（data-text、data-tip 这类）：短英文标记留着，其余只留长度。
    return PLAIN_KEY.test(value) ? value : maskFaceText(value);
}

function walk(node, keys) {
    for (const child of [...(node.content ? node.content.childNodes : node.childNodes)]) {
        if (child.nodeType === 3) {
            const parent = child.parentElement;
            const tag = parent?.tagName?.toLowerCase();
            if (tag === 'style') child.nodeValue = scrubCss(child.nodeValue, keys);
            else if (tag === 'script') child.nodeValue = '';
            else child.nodeValue = placeholderFor(child.nodeValue);
            continue;
        }
        if (child.nodeType === 8) { child.remove(); continue; }
        if (child.nodeType !== 1) continue;
        const element = child;
        const tag = element.tagName.toLowerCase();
        if (tag === 'script' || tag === 'iframe' || tag === 'object' || tag === 'embed') { element.remove(); continue; }
        if (element.matches?.(TOOL_UI)) { element.remove(); continue; }
        // 插件自己新建的整块样式（手机排版规则、维修补丁）只留一个标记，不占篇幅。
        // 模型自己写的 <style> 被修复器打过标记（比如 iOS 翻面兼容）的仍是模型的写法，照常保留。
        if (tag === 'style' && element.matches('[data-rabbit-mirror-mobile-layout-rescue], [data-rabbit-mirror-maintenance-patch], [data-rabbit-mirror-local-panel-layout]')) {
            element.textContent = '/* 插件补的样式，略 */';
            continue;
        }
        for (const attribute of [...element.attributes]) {
            // 模型在双引号属性里又写双引号时，后半截文字会被解析成一个个属性名，这些整个去掉。
            if (!/^[a-z][\w:.-]*$/i.test(attribute.name)) { element.removeAttribute(attribute.name); continue; }
            const next = scrubAttribute(element, attribute.name, attribute.value, keys);
            if (next === '' && /^on[a-z]+$/i.test(attribute.name)) element.removeAttribute(attribute.name);
            else if (next !== attribute.value) element.setAttribute(attribute.name, next);
        }
        if (tag === 'textarea' || tag === 'option') element.textContent = placeholderFor(element.textContent);
        else walk(element, keys);
    }
}

// 传 HTML 字符串或元素都行；返回骨架 HTML 字符串。解析在模板里进行，不会执行脚本或加载资源。
export function skeletonizeRabbitMirrorHtml(input) {
    if (typeof document === 'undefined') return '';
    let container;
    if (typeof input === 'string') {
        const template = document.createElement('template');
        template.innerHTML = input;
        container = template.content;
    } else if (input?.cloneNode) {
        const template = document.createElement('template');
        template.content.append(input.cloneNode(true));
        container = template.content;
    } else return '';
    walk(container, new Map());
    const wrapper = document.createElement('div');
    wrapper.append(container);
    return wrapper.innerHTML;
}

// 一面的写法骨架：{ source, rendered }，两段都已换成占位。
export function buildWritingSkeleton(rawSource, renderedClone) {
    return {
        source: skeletonizeRabbitMirrorHtml(String(rawSource || '')),
        rendered: renderedClone ? skeletonizeRabbitMirrorHtml(renderedClone) : '',
    };
}
