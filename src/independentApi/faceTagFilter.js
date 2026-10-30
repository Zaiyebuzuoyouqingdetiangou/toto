import { rmR as __rmR } from "../textTable.js?rmv=2.1.6";
const KNOWN_TAGS = new Set(`a abbr acronym address area article aside audio b base basefont bdi bdo big blink blockquote body br button canvas caption center cite code col colgroup data datalist dd del details dfn dialog dir div dl dt em embed fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark marquee menu meta meter nav nobr noscript object ol optgroup option output p param picture plaintext pre progress q rb rp rt rtc ruby s samp script search section select slot small source span strike strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track tt u ul var video wbr xmp
svg g defs symbol use image text tspan textpath path rect circle ellipse line polyline polygon marker pattern mask clippath filter lineargradient radialgradient stop foreignobject desc metadata switch view animate animatemotion animatetransform set mpath
feblend fecolormatrix fecomponenttransfer fecomposite feconvolvematrix fediffuselighting fedisplacementmap fedistantlight fedropshadow feflood fefunca fefuncb fefuncg fefuncr fegaussianblur feimage femerge femergenode femorphology feoffset fepointlight fespecularlighting fespotlight fetile feturbulence
math mi mn mo ms mtext mspace mrow mfrac msqrt mroot mstyle merror mpadded mphantom msub msup msubsup munder mover munderover mtable mtr mtd semantics annotation
toto`.split(/\s+/).filter(Boolean));
const SKIP_INSIDE = 'svg,math,pre,code,textarea,script,style,template,noscript,xmp,plaintext';
const STRUCTURE = 'p,div,section,article,aside,header,footer,main,nav,figure,table,ul,ol,dl,details,blockquote,h1,h2,h3,h4,h5,h6,img,picture,video,audio,canvas,svg,iframe,form,button,input,select,textarea,label,hr';
function escapeRe(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function filterText(text, names, nodeStartsLine = true) {
    if (!text.includes('<'))
        return text;
    const re = new RegExp(`<\\s*(\\/?)\\s*(${names.map(escapeRe).join('|')})(?![\\p{L}\\p{N}._:-])\\s*(\\/?)\\s*>`, 'giu');
    const tokens = [...text.matchAll(re)].map(match => ({ start: match.index, end: match.index + match[0].length, name: match[2].toLowerCase(), closing: match[1] === '/', selfClosing: match[3] === '/' }));
    if (!tokens.length)
        return text;
    const ranges = [];
    const stacks = new Map();
    const lone = [];
    for (const token of tokens) {
        if (token.selfClosing) {
            ranges.push([token.start, token.end]);
            continue;
        }
        if (!stacks.has(token.name))
            stacks.set(token.name, []);
        const stack = stacks.get(token.name);
        if (!token.closing) {
            stack.push(token);
            continue;
        }
        const open = stack.pop();
        if (open)
            ranges.push([open.start, token.end]);
        else
            ranges.push([token.start, token.end]);
    }
    for (const stack of stacks.values())
        lone.push(...stack);
    lone.sort((left, right) => left.start - right.start);
    const paired = ranges.slice();
    const blankBefore = (from, to) => {
        for (let index = from; index < to; index += 1) {
            if (/\s/.test(text[index]))
                continue;
            if (paired.some(([start, end]) => index >= start && index < end))
                continue;
            return false;
        }
        return true;
    };
    let chainEnd = -1;
    for (const open of lone) {
        const lineStart = text.lastIndexOf('\n', open.start - 1) + 1;
        const firstLineNotStart = lineStart === 0 && !nodeStartsLine && chainEnd < 0;
        const atLineStart = !firstLineNotStart && blankBefore(Math.max(lineStart, chainEnd), open.start);
        if (!atLineStart) {
            ranges.push([open.start, open.end]);
            continue;
        }
        let end = text.length;
        const nextLt = text.indexOf('<', open.end);
        if (nextLt >= 0)
            end = Math.min(end, nextLt);
        const nextLine = text.indexOf('\n', open.end);
        if (nextLine >= 0)
            end = Math.min(end, nextLine);
        ranges.push([open.start, end]);
        chainEnd = end;
    }
    ranges.sort((left, right) => left[0] - right[0] || right[1] - left[1]);
    let output = '';
    let position = 0;
    for (const [start, end] of ranges) {
        if (end <= position)
            continue;
        if (start > position)
            output += text.slice(position, start);
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
            if (previous.nodeType === 3)
                return /\n\s*$/.test(previous.nodeValue) || (!previous.nodeValue.trim() && startsLine(previous));
            if (previous.nodeType === 8) {
                current = previous;
                continue;
            }
            return previous.nodeType === 1 && (previous.localName === 'br' || !INLINE.has(previous.localName));
        }
        const parent = current.parentNode;
        if (!parent || parent.nodeType !== 1 || !INLINE.has(parent.localName))
            return true;
        current = parent;
    }
    return true;
}
const STATUS_SEGMENT = __rmR("BGVYhFxPx6_QBZDBJMxU2Nuzx4bJRKeKonXBMhi9M2c1bEvXpRwb.ZK3opERuh458_hQ5BjH6jsTf7ZxB1PY3zJaC3EjenDngKNm97nN", "g");
function looksLikeStatusBar(text) {
    const segments = String(text || '').match(STATUS_SEGMENT) || [];
    if (segments.length < 2)
        return false;
    const covered = segments.join('').replace(/\s+/g, '').length;
    return covered >= String(text).replace(__rmR("yomYAOXSI3270Fmuam4.HT", "g"), '').length * 0.7;
}
const designed = node => node.nodeType === 1 && [...node.attributes].some(attr => /^(?:class|style|id|data-)/.test(attr.name));
const plainPiece = node => node.nodeType === 3 || (node.nodeType === 1 && node.localName !== 'summary' && node.localName !== 'style'
    && !designed(node) && !node.matches?.(STRUCTURE) && !node.querySelector?.(STRUCTURE));
function stripCopiedStatusBars(root) {
    let changed = false;
    root.normalize?.();
    const faces = [...root.querySelectorAll('details')].filter(face => !face.parentElement?.closest?.('details'));
    for (const face of faces) {
        const faceText = [...face.childNodes].filter(node => !(node.nodeType === 1 && node.localName === 'summary')).reduce((sum, node) => sum + String(node.textContent || '').replace(/\s+/g, '').length, 0);
        const layers = [face, ...[...face.children].filter(child => Object.prototype.toString.call(child) === '[object HTMLUnknownElement]' && child.querySelector(STRUCTURE))];
        for (const layer of layers) {
            const runs = [];
            let run = [];
            for (const node of [...layer.childNodes]) {
                if (plainPiece(node))
                    run.push(node);
                else {
                    if (run.length)
                        runs.push(run);
                    run = [];
                }
            }
            if (run.length)
                runs.push(run);
            for (const pieces of runs) {
                const text = pieces.map(node => node.textContent || '').join('\n');
                if (!looksLikeStatusBar(text))
                    continue;
                const own = String(text).replace(/\s+/g, '').length;
                if (faceText - own < Math.max(30, own * 0.5))
                    continue;
                pieces.forEach(node => node.remove());
                changed = true;
            }
        }
    }
    return changed;
}
export function stripExcludedTagsFromFaceOutput(value = '', excludedTags = new Set(), doc = globalThis.document, sourceForClosing = null) {
    const source = String(value ?? '');
    const names = [...(excludedTags || [])].map(name => String(name).toLowerCase()).filter(name => name && !KNOWN_TAGS.has(name));
    if (!source.includes('<') || !doc?.createElement)
        return source;
    if (!names.length) {
        if ((source.replace(/<[^>]*>/g, ' ').match(STATUS_SEGMENT) || []).length < 2)
            return source;
        const template = doc.createElement('template');
        template.innerHTML = source;
        return stripCopiedStatusBars(template.content) ? template.innerHTML : source;
    }
    const original = String(sourceForClosing ?? source)
        .replace(/<(style|script|textarea|pre|code|svg|math|xmp|template|noscript|object|embed|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ');
    const pairedByName = new Map(names.map(name => [name, []]));
    const stacks = new Map(names.map(name => [name, []]));
    const anyTag = /<\s*(\/?)\s*([\p{L}][\p{L}\p{N}._:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gu;
    for (const match of original.matchAll(anyTag)) {
        const name = match[2].toLowerCase();
        if (!pairedByName.has(name))
            continue;
        if (match[1] === '/') {
            const open = stacks.get(name).pop();
            if (open)
                open.paired = true;
            continue;
        }
        const entry = { paired: false };
        pairedByName.get(name).push(entry);
        if (!/\/\s*$/.test(match[3]))
            stacks.get(name).push(entry);
    }
    for (const [name, list] of pairedByName)
        pairedByName.set(name, list.map(entry => entry.paired));
    const template = doc.createElement('template');
    template.innerHTML = source;
    const root = template.content;
    let changed = false;
    const skipped = node => !!node.parentElement?.closest?.(SKIP_INSIDE);
    const skippedElement = element => !!element.parentElement?.closest?.('svg,math,template,script,style,noscript');
    const elements = [...root.querySelectorAll('*')].filter(element => names.includes(element.localName) && !skippedElement(element));
    const seen = new Map();
    const paired = new Map();
    for (const element of elements) {
        const index = seen.get(element.localName) || 0;
        seen.set(element.localName, index + 1);
        const list = pairedByName.get(element.localName) || [];
        paired.set(element, index < list.length ? list[index] : true);
    }
    const faceBody = element => {
        const face = element.parentElement?.closest?.('details');
        if (!face)
            return String(root.textContent || '').replace(/\s+/g, '').length;
        let total = 0;
        for (const child of face.childNodes)
            if (!(child.nodeType === 1 && child.localName === 'summary'))
                total += String(child.textContent || '').replace(/\s+/g, '').length;
        return total;
    };
    for (const element of elements.reverse()) {
        if (!root.contains(element))
            continue;
        if (!paired.get(element)) {
            if (startsLine(element)) {
                for (const child of [...element.childNodes]) {
                    if (child.nodeType === 3) {
                        const at = child.nodeValue.indexOf('\n');
                        if (at >= 0) {
                            child.nodeValue = child.nodeValue.slice(at);
                            break;
                        }
                        child.remove();
                        continue;
                    }
                    if (child.nodeType === 1 && (child.localName === 'br' || !INLINE.has(child.localName) || child.querySelector(STRUCTURE)))
                        break;
                    child.remove();
                }
            }
            element.replaceWith(...element.childNodes);
        }
        else if (element.querySelector('details')) {
            element.replaceWith(...element.childNodes);
        }
        else {
            const own = String(element.textContent || '').replace(/\s+/g, '').length;
            if (own > 0 && own >= faceBody(element) && element.querySelector(STRUCTURE))
                element.replaceWith(...element.childNodes);
            else
                element.remove();
        }
        changed = true;
    }
    const comments = doc.createTreeWalker(root, 128);
    const restored = [];
    for (let node = comments.nextNode(); node; node = comments.nextNode()) {
        const data = String(node.nodeValue || '').trim();
        if (data && names.includes(data.toLowerCase()) && !skipped(node))
            restored.push(node);
    }
    for (const node of restored)
        node.replaceWith(doc.createTextNode(`</${String(node.nodeValue).trim()}>`));
    if (restored.length) {
        root.normalize();
        changed = true;
    }
    const walker = doc.createTreeWalker(root, 4);
    const texts = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode())
        if (node.nodeValue.includes('<') && !skipped(node))
            texts.push(node);
    for (const node of texts) {
        const next = filterText(node.nodeValue, names, startsLine(node));
        if (next !== node.nodeValue) {
            node.nodeValue = next;
            changed = true;
        }
    }
    if (stripCopiedStatusBars(root))
        changed = true;
    return changed ? template.innerHTML : source;
}
