// 副 API 写出来的兔子镜里出现玩家「跳过的标签」（照着预设、破限词抄来的状态栏、思维链、包正文的外壳）：
// 挂上去之前按 DOM 处理，不在字符串上硬切，属性、注释、样式里的东西天然碰不到。
//   - 真元素（<thinking>、<bgm>、<content> 这类 ASCII 标签名）：里面只有字的（思维链、状态条）整块拿掉；
//     里面装着段落、卡片、图片这类正文结构的，只去掉这一层外壳，正文留着（不然整面被删空）。
//   - 文字里的标签（中文标签名浏览器不当元素，<日期>某年<时间>深夜 会原样显示成字）：
//     成对的整块拿掉；一行开头起的一串开标签（状态栏写法）连同每个标签后面那段字一起拿掉，到下一个标签或换行为止；
//     句子中间提到的只拿掉标签本身。全角＜＞是模型自己写的字，不碰。
//   - 标准 HTML / SVG / MathML 标签名、兔子镜外壳不当跳过标签；svg、math、pre、code、textarea、script、style 里面不碰。
// 什么都没拿掉时原样返回原字符串。

const KNOWN_TAGS = new Set(`a abbr acronym address area article aside audio b base basefont bdi bdo big blink blockquote body br button canvas caption center cite code col colgroup data datalist dd del details dfn dialog dir div dl dt em embed fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark marquee menu meta meter nav nobr noscript object ol optgroup option output p param picture plaintext pre progress q rb rp rt rtc ruby s samp script search section select slot small source span strike strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track tt u ul var video wbr xmp
svg g defs symbol use image text tspan textpath path rect circle ellipse line polyline polygon marker pattern mask clippath filter lineargradient radialgradient stop foreignobject desc metadata switch view animate animatemotion animatetransform set mpath
feblend fecolormatrix fecomponenttransfer fecomposite feconvolvematrix fediffuselighting fedisplacementmap fedistantlight fedropshadow feflood fefunca fefuncb fefuncg fefuncr fegaussianblur feimage femerge femergenode femorphology feoffset fepointlight fespecularlighting fespotlight fetile feturbulence
math mi mn mo ms mtext mspace mrow mfrac msqrt mroot mstyle merror mpadded mphantom msub msup msubsup munder mover munderover mtable mtr mtd semantics annotation
toto`.split(/\s+/).filter(Boolean));
const SKIP_INSIDE = 'svg,math,pre,code,textarea,script,style,template,noscript,xmp,plaintext';
const STRUCTURE = 'p,div,section,article,aside,header,footer,main,nav,figure,table,ul,ol,dl,details,blockquote,h1,h2,h3,h4,h5,h6,img,picture,video,audio,canvas,svg,iframe,form,button,input,select,textarea,label,hr';

function escapeRe(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function filterText(text, names, nodeStartsLine = true) {
    if (!text.includes('<')) return text;
    const re = new RegExp(`<\\s*(\\/?)\\s*(${names.map(escapeRe).join('|')})(?![\\p{L}\\p{N}._:-])\\s*(\\/?)\\s*>`, 'giu');
    const tokens = [...text.matchAll(re)].map(match => ({ start: match.index, end: match.index + match[0].length, name: match[2].toLowerCase(), closing: match[1] === '/', selfClosing: match[3] === '/' }));
    if (!tokens.length) return text;
    const ranges = []; const stacks = new Map(); const lone = [];
    for (const token of tokens) {
        if (token.selfClosing) { ranges.push([token.start, token.end]); continue; }
        if (!stacks.has(token.name)) stacks.set(token.name, []);
        const stack = stacks.get(token.name);
        if (!token.closing) { stack.push(token); continue; }
        const open = stack.pop();
        if (open) ranges.push([open.start, token.end]); else ranges.push([token.start, token.end]);
    }
    for (const stack of stacks.values()) lone.push(...stack);
    lone.sort((left, right) => left.start - right.start);
    // 落单开标签：从行首起（或紧接着上一段被拿掉的状态栏）才连后面的字一起拿掉；句子中间的只拿掉标签。
    const paired = ranges.slice();
    const blankBefore = (from, to) => {
        for (let index = from; index < to; index += 1) {
            if (/\s/.test(text[index])) continue;
            if (paired.some(([start, end]) => index >= start && index < end)) continue;
            return false;
        }
        return true;
    };
    let chainEnd = -1;
    for (const open of lone) {
        const lineStart = text.lastIndexOf('\n', open.start - 1) + 1;
        // 这段字的开头不一定是一行的开头（前面紧挨着 <span>…</span> 这类行内元素）：那时第一行只认接在状态栏后面的。
        const firstLineNotStart = lineStart === 0 && !nodeStartsLine && chainEnd < 0;
        const atLineStart = !firstLineNotStart && blankBefore(Math.max(lineStart, chainEnd), open.start);
        if (!atLineStart) { ranges.push([open.start, open.end]); continue; }
        let end = text.length;
        const nextLt = text.indexOf('<', open.end); if (nextLt >= 0) end = Math.min(end, nextLt);
        const nextLine = text.indexOf('\n', open.end); if (nextLine >= 0) end = Math.min(end, nextLine);
        ranges.push([open.start, end]);
        chainEnd = end;
    }
    ranges.sort((left, right) => left[0] - right[0] || right[1] - left[1]);
    let output = ''; let position = 0;
    for (const [start, end] of ranges) {
        if (end <= position) continue;
        if (start > position) output += text.slice(position, start);
        position = Math.max(position, end);
    }
    return output + text.slice(position);
}

const INLINE = new Set('a abbr b bdi bdo big cite code data del dfn em font i ins kbd label mark q s samp small span strike strong sub sup time tt u var'.split(' '));
function startsLine(node) {
    let current = node;
    while (current) {
        const previous = current.previousSibling;
        if (previous) {
            if (previous.nodeType === 3) return /\n\s*$/.test(previous.nodeValue) || (!previous.nodeValue.trim() && startsLine(previous));
            if (previous.nodeType === 8) { current = previous; continue; }
            return previous.nodeType === 1 && (previous.localName === 'br' || !INLINE.has(previous.localName));
        }
        const parent = current.parentNode;
        if (!parent || parent.nodeType !== 1 || !INLINE.has(parent.localName)) return true;
        current = parent;
    }
    return true;
}

// sourceForClosing：模型原文（净化之前）。浏览器会给没关上的标签自动补关标签，只有原文里数得出来它关没关。
export function stripExcludedTagsFromFaceOutput(value = '', excludedTags = new Set(), doc = globalThis.document, sourceForClosing = null) {
    const source = String(value ?? '');
    const names = [...(excludedTags || [])].map(name => String(name).toLowerCase()).filter(name => name && !KNOWN_TAGS.has(name));
    if (!names.length || !source.includes('<') || !doc?.createElement) return source;
    // 原文里每个跳过标签按出现顺序配对：第 k 个开标签有没有关上，对应 DOM 里同名的第 k 个元素。
    // 样式、脚本、注释里的不算；自闭合写法（<bgm/>）浏览器照样当开标签，记成没关上。
    const original = String(sourceForClosing ?? source)
        .replace(/<(style|script|textarea|pre|code|svg|math|xmp|template|noscript|object|embed|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ');
    const pairedByName = new Map(names.map(name => [name, []]));
    const stacks = new Map(names.map(name => [name, []]));
    // 逐个读标签（属性值连同引号一起读掉，属性里写的标签不会单独算一次）。
    const anyTag = /<\s*(\/?)\s*([\p{L}][\p{L}\p{N}._:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gu;
    for (const match of original.matchAll(anyTag)) {
        const name = match[2].toLowerCase();
        if (!pairedByName.has(name)) continue;
        if (match[1] === '/') { const open = stacks.get(name).pop(); if (open) open.paired = true; continue; }
        const entry = { paired: false };
        pairedByName.get(name).push(entry);
        if (!/\/\s*$/.test(match[3])) stacks.get(name).push(entry);
    }
    for (const [name, list] of pairedByName) pairedByName.set(name, list.map(entry => entry.paired));
    const template = doc.createElement('template');
    template.innerHTML = source;
    const root = template.content;
    let changed = false;
    const skipped = node => !!node.parentElement?.closest?.(SKIP_INSIDE);
    // 真元素：先按文档顺序记下每个是不是原文里成对写的，再从里往外处理。
    // 元素只在 svg、math、模板这些不是网页正文的地方跳过；code 没关上时浏览器会把后面整面装进去，里面的跳过标签照样处理。
    const skippedElement = element => !!element.parentElement?.closest?.('svg,math,template,script,style,noscript');
    const elements = [...root.querySelectorAll('*')].filter(element => names.includes(element.localName) && !skippedElement(element));
    const seen = new Map();
    const paired = new Map();
    for (const element of elements) {
        const index = seen.get(element.localName) || 0;
        seen.set(element.localName, index + 1);
        const list = pairedByName.get(element.localName) || [];
        // 原文里数不到（净化改过结构）时按成对处理。
        paired.set(element, index < list.length ? list[index] : true);
    }
    const faceBody = element => {
        const face = element.parentElement?.closest?.('details');
        if (!face) return String(root.textContent || '').replace(/\s+/g, '').length;
        let total = 0;
        for (const child of face.childNodes) if (!(child.nodeType === 1 && child.localName === 'summary')) total += String(child.textContent || '').replace(/\s+/g, '').length;
        return total;
    };
    for (const element of elements.reverse()) {
        if (!root.contains(element)) continue;
        if (!paired.get(element)) {
            // 原文里只写了开标签：浏览器把后面的内容都装了进去。在一行开头（状态栏写法）才拿掉它后面跟着的那段字
            // （到换行或第一个块为止）；句子中间提到的只去掉标签。其余放回原处。
            if (startsLine(element)) {
                for (const child of [...element.childNodes]) {
                    if (child.nodeType === 3) {
                        const at = child.nodeValue.indexOf('\n');
                        if (at >= 0) { child.nodeValue = child.nodeValue.slice(at); break; }
                        child.remove(); continue;
                    }
                    if (child.nodeType === 1 && (child.localName === 'br' || !INLINE.has(child.localName) || child.querySelector(STRUCTURE))) break;
                    child.remove();
                }
            }
            element.replaceWith(...element.childNodes);
        } else if (element.querySelector('details')) {
            // 成对写、却包着整面折叠：是外壳，只去外壳。
            element.replaceWith(...element.childNodes);
        } else {
            // 成对写的（思维链、状态卡、歌名）：整块拿掉。拿掉后这一面一个字都不剩，说明它包的就是正文，那就只去外壳。
            const own = String(element.textContent || '').replace(/\s+/g, '').length;
            if (own > 0 && own >= faceBody(element) && element.querySelector(STRUCTURE)) element.replaceWith(...element.childNodes);
            else element.remove();
        }
        changed = true;
    }
    // 中文标签名的关标签（</日期>）浏览器会读成注释 <!--日期-->：认出来还原成字，和前面的开标签一起按文字处理。
    const comments = doc.createTreeWalker(root, 128);
    const restored = [];
    for (let node = comments.nextNode(); node; node = comments.nextNode()) {
        const data = String(node.nodeValue || '').trim();
        if (data && names.includes(data.toLowerCase()) && !skipped(node)) restored.push(node);
    }
    for (const node of restored) node.replaceWith(doc.createTextNode(`</${String(node.nodeValue).trim()}>`));
    if (restored.length) { root.normalize(); changed = true; }
    const walker = doc.createTreeWalker(root, 4);
    const texts = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) if (node.nodeValue.includes('<') && !skipped(node)) texts.push(node);
    for (const node of texts) {
        const next = filterText(node.nodeValue, names, startsLine(node));
        if (next !== node.nodeValue) { node.nodeValue = next; changed = true; }
    }
    return changed ? template.innerHTML : source;
}
