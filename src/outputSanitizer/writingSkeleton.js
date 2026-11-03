// 写法骨架：把一面兔子镜的文字全换成占位，只留结构、属性和 CSS。
// 用在诊断报告里：报告可以直接发给别人、也能直接当测试样本，不带聊天内容。
// 换掉的：所有文字节点、标题、alt／title 这类说明文字、图片和链接地址、
// 模型写的方案记录和画面提示词、聊天归属标记、CSS 里的 content 字符串和 url()。
// 留下的：标签、id、class、data-rm-* 这些写法标识、style 里的样式、<style> 里的规则。
const CONTENT_ATTRS = new Set(['alt', 'title', 'aria-label', 'aria-description', 'aria-roledescription', 'placeholder', 'srcset', 'poster', 'srcdoc']);
// data-rm-self（2.3.0 模型自拟的形式和角度）也是模型写的字，可能带人名：一样换成占位。
// 复查（2.5.2）：面上盖的抽签记录 data-rm-face-recipe（开了每面抽签规则时里面有聊天文件名）、归属标记 data-rm-owner-*、
// 标题标签 data-rm-title-label 也整个只留长度。
const CONTENT_ATTR_RE = /^(?:data-rm-vs|data-rm-self(?:-think)?$|data-rm-face-recipe$|data-rm-owner-|data-rm-title-label$|data-rm-draw-|data-rm-image|data-rabbit-mirror-(?:external-owner|owner-|labeled-checked-last|generic-probe)|data-rm-key$|data-rm-avatar)/;
const URL_ATTRS = new Set(['href', 'src', 'action', 'formaction', 'cite', 'data', 'xlink:href']);
// 插件自己挂在镜面里的工具（维修兔、反馈猫、工具栏、诊断面板）不是写法的一部分，骨架里去掉。
const TOOL_UI = '[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-diagnostic-panel], .rabbit-mirror-maintenance-menu, [data-rm-face-swipe-host], [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-rm-image-region], [data-rm-image-portal]';

export function maskFaceText(value) {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    // 已经是占位的不再换（发样本前会按新规则再过一遍，长度信息不能被改掉）。
    if (/^字×\d+$/.test(text)) return text;
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
// 复查（2.5.2）：不带引号、带中文的名字（.小明的信、@keyframes 小明眨眼、--who: 小明、[data-x=小明]、font-family: 微软雅黑）
// 整个名字换成代号，和元素上同名的类名换出的代号一样，规则照样对得上。
const CSS_NAME_START = /[-\w\u0080-\uffff\\]/;
const CSS_NAME_CHAR = /[-\w\u0080-\uffff]/;
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
        if (CSS_NAME_START.test(char) && char !== '\\') {
            let end = index;
            while (end < source.length && CSS_NAME_CHAR.test(source[end])) end += 1;
            const name = source.slice(index, end);
            out += /[^\x00-\x7f]/.test(name) ? maskKeys(name, keys) : name;
            index = end - 1;
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

function scrubStyleAttribute(value, keys) {
    // 内联样式没有选择器，整段按声明值处理。用这一面同一套代号（--who: 小明 和 <style> 里换出的一样）。
    return scrubCss(`{${value}}`, keys).slice(1, -1);
}

// 写法里的「键」：data-rm-show="甲" 和 data-rm-pick="甲" 要对得上，所以同一个键在整面里换成同一个代号（k1、k2…）。
// 只换带中文或空格、长得像一句话的键；on、done、item0 这类英文短键照旧。
const KEY_ATTRS = new Set(['data-rm-show', 'data-rm-pick', 'data-rm-picked', 'data-rm-on', 'data-rm-toggle', 'data-rm-page', 'data-rm-goto', 'data-rm-item', 'data-rm-slot', 'data-rm-end', 'data-rm-code', 'data-rm-answer', 'data-rm-seq', 'data-rm-part', 'data-rm-step', 'data-rm-when', 'data-rm-cover', 'data-rm-state', 'data-rm-target', 'data-rm-card', 'data-rm-peek', 'data-rm-spoiler', 'data-rm-memory', 'data-rm-recall', 'data-rm-left', 'data-rm-right', 'data-rm-swiped-left', 'data-rm-swiped-right', 'data-rm-peeking']);
const PLAIN_KEY = /^!?[\w.-]{1,24}$/;
const STRUCTURAL_ATTRS = new Set(['id', 'class', 'for', 'name', 'type', 'min', 'max', 'step', 'open', 'hidden', 'checked', 'disabled', 'role', 'tabindex', 'aria-pressed', 'aria-expanded', 'aria-hidden', 'aria-controls', 'aria-live', 'aria-checked', 'aria-selected', 'lang', 'dir', 'width', 'height', 'viewbox', 'preserveaspectratio', 'd', 'points', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'fill', 'stroke', 'stroke-width', 'opacity', 'transform', 'colspan', 'rowspan', 'loop', 'autoplay', 'muted', 'controls', 'popover', 'popovertarget', 'inert', 'draggable', 'contenteditable', 'inputmode', 'maxlength', 'readonly', 'required', 'multiple', 'selected', 'start', 'reversed', 'scope', 'headers', 'datetime', 'dirname']);

// 新代号：从这一面里已经有的 k 几往后数（这一面本来就有叫 k1 的类名、或者是再过一遍的旧骨架时，不会撞上）。
function nextKeyCode(keys) {
    keys.counter = (keys.counter || 0) + 1;
    return `k${keys.counter}`;
}
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
            if (!PLAIN_KEY.test(head) && !keys.has(head)) keys.set(head, nextKeyCode(keys));
            return `${negated ? '!' : ''}${keys.get(head) || head}${key.slice(colon)}`;
        }
        if (!keys.has(key)) keys.set(key, nextKeyCode(keys));
        return `${negated ? '!' : ''}${keys.get(key)}`;
    }).join('');
}

// 本面 <style> 里引号中写到的值（骨架化之前先收好，<style> 走过之后已经换成代号了）。
function quotedInFaceCss(keys, value) {
    return !!keys.quotedCss?.has(value);
}
function collectQuotedCss(container) {
    const found = new Set();
    for (const style of container.querySelectorAll?.('style') || []) {
        for (const match of String(style.textContent || '').matchAll(/(["'])([^"'\n]{1,200})\1/g)) found.add(match[2]);
    }
    return found;
}

// 指向本面某个元素的属性（id 和引用它的 for、name、aria-controls……）：<style> 里用引号写到的长值会换成代号
// （净化后 #门:checked 写成 [id="很长的作用域-门"]:checked），元素上同一个值也要换成同一个代号，不然骨架拿去重放，
// 选中、展开的规则一条都对不上，凭空造出「没反应」。只换 <style> 里真写到的那几个值，其余照留。
const ID_REF_ATTRS = new Set(['id', 'for', 'name', 'form', 'list', 'headers', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-owns', 'aria-activedescendant', 'popovertarget', 'commandfor']);
function codedId(token, keys) {
    if (!token || PLAIN_KEY.test(token)) return token;
    // 带中文的一律换代号（和元素上带中文的 id 换法一样，也不把字留在骨架里）；英文长值只在 <style> 里写到时才换。
    return /[^\x20-\x7e]/.test(token) || quotedInFaceCss(keys, token) ? maskKeys(token, keys) : token;
}

function looksLikeEnglishSentence(value) {
    const text = String(value || '').trim();
    if (!/\s/.test(text) || /[#:;(){}=<>\/\\|]/.test(text)) return false;
    const tokens = text.split(/\s+/);
    if (tokens.length < 4) return false;
    return tokens.filter(token => /^[A-Za-z][A-Za-z'’-]*[,.!?]?$/.test(token)).length >= tokens.length * 0.75;
}

function scrubAttribute(element, name, value, keys) {
    const lower = name.toLowerCase();
    // 已经是占位的（再过一遍旧骨架时）原样留着。
    if (/^(?:字×\d+|字{1,8})$/.test(String(value || ''))) return value;
    if (lower === 'style') return scrubStyleAttribute(value, keys);
    if (lower === 'href' && /^#/.test(String(value || '').trim())) {
        const target = String(value).trim().slice(1);
        return `#${codedId(target, keys)}`;
    }
    if (URL_ATTRS.has(lower)) return scrubUrl(value);
    if (CONTENT_ATTRS.has(lower) || CONTENT_ATTR_RE.test(lower)) return value ? maskFaceText(value) : value;
    if (/^on[a-z]+$/i.test(lower)) return '';
    if (KEY_ATTRS.has(lower)) return maskKeys(value, keys);
    if (lower === 'value') {
        // 滑杆、单选的 value 是数值或短键，留着；文本框、下拉项的 value 可能是正文，只留长度。
        const tag = element.tagName.toLowerCase();
        const kind = String(element.getAttribute('type') || '').toLowerCase();
        const textual = tag === 'option' || tag === 'button' || (tag === 'input' && !['range', 'checkbox', 'radio', 'number', 'hidden'].includes(kind));
        // 文本框里预先填的字（哪怕只有一个英文词，比如名字）就是正文：一律只留长度。下拉项、按钮的 value 常常是键，英文短键照留。
        if (tag === 'input' && textual) return value ? maskFaceText(value) : value;
        if (textual) return PLAIN_KEY.test(value) ? value : maskFaceText(value);
        // 复查（2.5.2）：单选、多选、隐藏框和 <data>、<li> 的 value 也可能是正文：带空格的整句只留长度，
        // 带中文的短值换成代号（CSS 里 [value="甲"] 换出的代号一样，还对得上），英文短键和数字照留。
        if (!value || PLAIN_KEY.test(value) || /^-?\d+(?:\.\d+)?$/.test(value)) return value;
        return /\s/.test(value.trim()) ? maskFaceText(value) : maskKeys(value, keys);
    }
    // 标题那一族（title-display、title-part……）放的是标题原文，英文标题也是正文：一律只留长度。
    if (/^data-rabbit-mirror-title-/.test(lower)) return value && !/^(?:true|false|\d+)$/.test(value) ? maskFaceText(value) : value;
    if (lower.startsWith('data-rm-') || lower.startsWith('data-rabbit-mirror-') || STRUCTURAL_ATTRS.has(lower)) {
        // 插件自己写的属性里带中文的（标题原文 data-rabbit-mirror-title-display 这类）也是正文，只留长度。
        if (/[^\x20-\x7e]/.test(value)) return lower.startsWith('data-rabbit-mirror-') ? maskFaceText(value) : maskKeys(value, keys);
        // <style> 选择器里引号中的长值会换成代号（[data-rabbit-mirror-css-scope="k1"]）：元素上同一个值也要换成同一个代号，
        // 不然骨架拿去重放，样式一条都套不上，凭空造出「没样式、没反应」的假故障。
        // 只换真会出现在选择器里的：本面标识，和本面 <style> 里用引号写到的那个值。像素图、配色、保存的样式这类值不是键，照原样留。
        if (value && !PLAIN_KEY.test(value) && (lower === 'data-rabbit-mirror-css-scope' || (lower.startsWith('data-rm-') && quotedInFaceCss(keys, value)))) return maskKeys(value, keys);
        if (value && ID_REF_ATTRS.has(lower)) return value.split(/(\s+)/).map(token => (/^\s+$/.test(token) ? token : codedId(token, keys))).join('');
        // 复查（2.5.2）：插件写法属性里写成一整句英文的（四个词以上、几乎全是单词）是正文，只留长度。
        // 像素图、配色（h #3a2622）、存下的样式（transform: …）这类带符号的值不是句子，照留。
        if (lower.startsWith('data-') && !STRUCTURAL_ATTRS.has(lower) && looksLikeEnglishSentence(value)) return maskFaceText(value);
        return value;
    }
    // 别的属性（data-text、data-tip 这类）：短英文标记留着；不带空格的中文短值换成代号（CSS 里 [data-speaker=甲] 换出的一样，
    // 规则还对得上）；其余只留长度。
    if (PLAIN_KEY.test(value)) return value;
    if (value && !/\s/.test(value.trim()) && value.trim().length <= 24) return maskKeys(value.trim(), keys);
    return maskFaceText(value);
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
            // 复查（2.5.2）：溢出来的英文单词也会变成一个个空的属性名（say="" hello=""）：认不出的空属性一样去掉。
            if (!attribute.value && !knownAttributeName(attribute.name)) { element.removeAttribute(attribute.name); continue; }
            const next = scrubAttribute(element, attribute.name, attribute.value, keys);
            if (next === '' && /^on[a-z]+$/i.test(attribute.name)) element.removeAttribute(attribute.name);
            else if (next !== attribute.value) element.setAttribute(attribute.name, next);
        }
        if (tag === 'textarea' || tag === 'option') element.textContent = placeholderFor(element.textContent);
        else walk(element, keys);
    }
}

// 空值也正常的属性（布尔属性、data-*、aria-*、事件属性等）。别的空属性多半是属性里多写了引号、溢出来的词。
const BOOLEAN_ATTRS = new Set(['open', 'hidden', 'checked', 'disabled', 'selected', 'readonly', 'required', 'multiple', 'autoplay', 'loop', 'muted',
    'controls', 'playsinline', 'inert', 'reversed', 'novalidate', 'formnovalidate', 'async', 'defer', 'default', 'itemscope', 'allowfullscreen',
    'autofocus', 'nomodule', 'ismap', 'download', 'popover', 'contenteditable', 'draggable', 'spellcheck', 'translate', 'class', 'id', 'style',
    'value', 'name', 'for', 'type', 'title', 'alt', 'href', 'src', 'role', 'tabindex', 'lang', 'dir', 'slot', 'part']);
function knownAttributeName(name) {
    const lower = String(name || '').toLowerCase();
    return BOOLEAN_ATTRS.has(lower) || STRUCTURAL_ATTRS.has(lower) || CONTENT_ATTRS.has(lower) || URL_ATTRS.has(lower) || KEY_ATTRS.has(lower)
        || /^(?:data-|aria-|on[a-z]|xmlns|xlink:)/.test(lower);
}

// 最后再看一眼：占位（字、字×N）、省略号和兔子镜自己的那句注释以外，骨架里不该再有中文。漏网的一律换成「字」。
const PLUGIN_STYLE_NOTE = '/* 插件补的样式，略 */';
function scrubLeftoverText(html) {
    return String(html || '').split(PLUGIN_STYLE_NOTE)
        .map(part => part.replace(/[^\x00-\x7f字×…]+/g, match => '字'.repeat(Math.max(1, Math.min(match.length, 8)))))
        .join(PLUGIN_STYLE_NOTE);
}

// 传 HTML 字符串或元素都行；返回骨架 HTML 字符串。解析在模板里进行，不会执行脚本或加载资源。
// 已经是骨架的再过一遍也可以（发样本前按新规则补打码）：占位不变，代号接着往后编。
export function skeletonizeRabbitMirrorHtml(input) {
    if (typeof document === 'undefined') return '';
    let container;
    let raw = '';
    if (typeof input === 'string') {
        const template = document.createElement('template');
        template.innerHTML = input;
        container = template.content;
        raw = input;
    } else if (input?.cloneNode) {
        const template = document.createElement('template');
        template.content.append(input.cloneNode(true));
        container = template.content;
        raw = String(input.outerHTML || '');
    } else return '';
    const keys = new Map();
    keys.quotedCss = collectQuotedCss(container);
    keys.counter = 0;
    for (const match of raw.matchAll(/\bk(\d{1,6})\b/g)) keys.counter = Math.max(keys.counter, Number(match[1]));
    walk(container, keys);
    const wrapper = document.createElement('div');
    wrapper.append(container);
    return scrubLeftoverText(wrapper.innerHTML);
}

// 一面的写法骨架：{ source, rendered }，两段都已换成占位。
export function buildWritingSkeleton(rawSource, renderedClone) {
    return {
        source: skeletonizeRabbitMirrorHtml(String(rawSource || '')),
        rendered: renderedClone ? skeletonizeRabbitMirrorHtml(renderedClone) : '',
    };
}
