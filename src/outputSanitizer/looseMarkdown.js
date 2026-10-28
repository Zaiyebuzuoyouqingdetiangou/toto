const SKIP_PARENT = /^(SUMMARY|STYLE|SCRIPT|TEMPLATE|PRE|CODE|TEXTAREA|OPTION|TITLE|NOSCRIPT)$/;
const HEADING = /^[ \t]*(#{1,6})[ \t]+(\S.*?)(?:[ \t]+#+)?[ \t]*$/;
const BOLD = /(?<![A-Za-z0-9*])\*\*(?=\S)([^*\n]{1,120}?)(?<=\S)\*\*(?![A-Za-z0-9*])/g;
const INLINE_PREV = /^(A|SPAN|B|I|EM|STRONG|U|S|SMALL|SUP|SUB|MARK|CODE|IMG|LABEL|BUTTON|INPUT|FONT|ABBR|CITE|Q)$/;
function bodyParents(details) {
    const parents = [details];
    for (const child of details.children) {
        if (Object.prototype.toString.call(child) !== '[object HTMLUnknownElement]')
            continue;
        if (child.hidden || child.hasAttribute('data-rabbit-mirror-maintenance-rabbit'))
            continue;
        parents.push(child);
    }
    return parents;
}
function appendInline(doc, parent, text) {
    let last = 0;
    let made = false;
    BOLD.lastIndex = 0;
    let match;
    while ((match = BOLD.exec(text))) {
        if (match.index > last)
            parent.append(doc.createTextNode(text.slice(last, match.index)));
        const bold = doc.createElement('b');
        bold.textContent = match[1];
        parent.append(bold);
        made = true;
        last = match.index + match[0].length;
    }
    if (last < text.length)
        parent.append(doc.createTextNode(text.slice(last)));
    return made;
}
export function tidyLooseMarkdown(root) {
    if (!root?.querySelectorAll)
        return 0;
    const faces = root.matches?.('details') ? [root] : [...root.querySelectorAll('details')];
    const doc = root.ownerDocument || document;
    let changed = 0;
    for (const details of faces) {
        if (!details.hasAttribute('data-rabbit-mirror-css-scope') && !details.hasAttribute('data-rm-title-chrome') && !details.querySelector(':scope > summary[data-rm-title-chrome]'))
            continue;
        for (const parent of bodyParents(details)) {
            for (const node of [...parent.childNodes]) {
                if (node.nodeType !== 3)
                    continue;
                const text = node.textContent || '';
                if (!/(^|\n)[ \t]*#{1,6}[ \t]+\S|\*\*\S/.test(text))
                    continue;
                const fragment = doc.createDocumentFragment();
                const lines = text.split('\n');
                let plain = [];
                let produced = false;
                const prev = node.previousSibling;
                const midLine = !!prev && (prev.nodeType === 3 || (prev.nodeType === 1 && INLINE_PREV.test(prev.tagName)));
                const flush = () => {
                    if (!plain.length)
                        return;
                    produced = appendInline(doc, fragment, plain.join('\n')) || produced;
                    plain = [];
                };
                for (let i = 0; i < lines.length; i += 1) {
                    const line = lines[i];
                    const heading = i === 0 && midLine ? null : line.match(HEADING);
                    if (heading) {
                        flush();
                        const block = doc.createElement('div');
                        block.setAttribute('data-rm-md-heading', String(heading[1].length));
                        block.style.cssText = 'font-weight:700;margin:0.4em 0;';
                        appendInline(doc, block, heading[2]);
                        fragment.append(block);
                        produced = true;
                    }
                    else
                        plain.push(line);
                }
                flush();
                if (!produced)
                    continue;
                node.replaceWith(fragment);
                changed += 1;
            }
        }
    }
    return changed;
}
