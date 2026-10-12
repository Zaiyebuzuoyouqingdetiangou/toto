// 写法骨架：把一面兔子镜的文字全换成占位，只留结构、属性和 CSS。
// 用在诊断报告里：报告可以直接发给别人、也能直接当测试样本，不带聊天内容。
// 换掉的：所有文字节点、标题、alt／title 这类说明文字、图片和链接地址、
// 模型写的方案记录和画面提示词、聊天归属标记、CSS 里的 content 字符串和 url()。
// 留下的：标签、id、class、data-rm-* 这些写法标识、style 里的样式、<style> 里的规则。
const CONTENT_ATTRS = new Set(['alt', 'title', 'aria-label', 'aria-description', 'aria-roledescription', 'placeholder', 'srcset', 'poster', 'srcdoc']);
const CONTENT_ATTR_RE = /^(?:data-rm-vs|data-rm-draw-|data-rm-image|data-rabbit-mirror-(?:external-owner|owner-|labeled-checked-last)|data-rm-key$|data-rm-avatar)/;
const URL_ATTRS = new Set(['href', 'src', 'action', 'formaction', 'cite', 'data', 'xlink:href']);
const FIXED_KEYS = /^(?:[\w.-]+)$/;
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

function scrubCss(text) {
    return String(text || '')
        .replace(/url\(\s*(['"]?)[^)]*\1\s*\)/gi, 'url()')
        .replace(/(content\s*:\s*)(['"])(?:\\.|(?!\2)[^\\])*\2/gi, (match, lead, quote) => `${lead}${quote}${quote}`)
        .replace(/(@import\s+)(['"])[^'"]*\2/gi, '$1$2$2');
}

function scrubStyleAttribute(value) {
    return scrubCss(value);
}

function scrubAttribute(element, name, value) {
    const lower = name.toLowerCase();
    if (lower === 'style') return scrubStyleAttribute(value);
    if (URL_ATTRS.has(lower)) return scrubUrl(value);
    if (CONTENT_ATTRS.has(lower) || CONTENT_ATTR_RE.test(lower)) return value ? maskFaceText(value) : value;
    if (/^on[a-z]+$/i.test(lower)) return '';
    // 写法标识（data-rm-*、id、class、for、name、value）照原样留；别的长值只留个长度。
    if (lower.startsWith('data-rm-') || lower.startsWith('data-rabbit-mirror-') || ['id', 'class', 'for', 'name', 'type', 'value', 'min', 'max', 'step', 'open', 'hidden', 'checked', 'disabled', 'role', 'tabindex', 'aria-pressed', 'aria-expanded', 'aria-hidden', 'aria-controls', 'aria-live', 'aria-checked', 'aria-selected', 'lang', 'dir', 'width', 'height', 'viewbox', 'preserveaspectratio', 'd', 'points', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'fill', 'stroke', 'stroke-width', 'opacity', 'transform', 'colspan', 'rowspan', 'loop', 'autoplay', 'muted', 'controls', 'popover', 'popovertarget', 'inert'].includes(lower)) return value;
    if (value.length > 40 && !FIXED_KEYS.test(value)) return maskFaceText(value);
    return value;
}

function walk(node) {
    for (const child of [...node.childNodes]) {
        if (child.nodeType === 3) {
            const parent = child.parentElement;
            const tag = parent?.tagName?.toLowerCase();
            if (tag === 'style') child.nodeValue = scrubCss(child.nodeValue);
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
        // 插件后来补进去的整块样式（手机排版规则等）只留一个标记，不占篇幅。
        if (tag === 'style' && [...element.attributes].some(attribute => attribute.name.startsWith('data-rabbit-mirror-'))) {
            element.textContent = '/* 插件补的样式，略 */';
            continue;
        }
        for (const attribute of [...element.attributes]) {
            // 模型在双引号属性里又写双引号时，后半截文字会被解析成一个个属性名，这些整个去掉。
            if (!/^[a-z][\w:.-]*$/i.test(attribute.name)) { element.removeAttribute(attribute.name); continue; }
            const next = scrubAttribute(element, attribute.name, attribute.value);
            if (next === '' && /^on[a-z]+$/i.test(attribute.name)) element.removeAttribute(attribute.name);
            else if (next !== attribute.value) element.setAttribute(attribute.name, next);
        }
        if (tag === 'textarea' || tag === 'option') element.textContent = placeholderFor(element.textContent);
        else walk(element);
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
    walk(container);
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
