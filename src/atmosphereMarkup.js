function tagScanner(input) {
    return {
        lastIndex: 0,
        exec() {
            while (this.lastIndex < input.length) {
                const start = input.indexOf('<', this.lastIndex);
                if (start < 0) {
                    this.lastIndex = input.length;
                    return null;
                }
                this.lastIndex = start + 1;
                const emit = end => {
                    this.lastIndex = end;
                    return { 0: input.slice(start, end), index: start };
                };
                if (input.startsWith('<!--', start)) {
                    const end = input.indexOf('-->', start + 4);
                    return emit(end < 0 ? input.length : end + 3);
                }
                if (input[start + 1] === '!') {
                    const end = input.indexOf('>', start + 2);
                    if (end < 0) {
                        this.lastIndex = input.length;
                        return null;
                    }
                    return emit(end + 1);
                }
                let cursor = start + 1;
                let quotedTagStart = -1;
                if (input[cursor] === '/')
                    cursor++;
                if (!/[a-z]/i.test(input[cursor] || ''))
                    continue;
                while (cursor < input.length && /[a-z0-9:-]/i.test(input[cursor]))
                    cursor++;
                while (cursor < input.length) {
                    if (input[cursor] === '>')
                        return emit(cursor + 1);
                    if (input[cursor] === '/' && input[cursor + 1] === '>')
                        return emit(cursor + 2);
                    const beforeSpace = cursor;
                    while (cursor < input.length && /\s/.test(input[cursor]))
                        cursor++;
                    if (cursor === beforeSpace)
                        break;
                    if (input[cursor] === '>')
                        return emit(cursor + 1);
                    if (input[cursor] === '/' && input[cursor + 1] === '>')
                        return emit(cursor + 2);
                    const attributeStart = cursor;
                    while (cursor < input.length && !/[\s<>"'=]/.test(input[cursor]))
                        cursor++;
                    if (cursor === attributeStart)
                        break;
                    const attributeEnd = cursor;
                    while (cursor < input.length && /\s/.test(input[cursor]))
                        cursor++;
                    if (input[cursor] !== '=') {
                        cursor = attributeEnd;
                        continue;
                    }
                    cursor++;
                    while (cursor < input.length && /\s/.test(input[cursor]))
                        cursor++;
                    const quote = input[cursor];
                    if (quote === '"' || quote === "'") {
                        const end = input.indexOf(quote, cursor + 1);
                        if (end < 0) {
                            const nextTag = input.indexOf('<', cursor + 1);
                            cursor = nextTag < 0 ? input.length : nextTag;
                            break;
                        }
                        if (quotedTagStart < 0) {
                            for (let offset = cursor + 1; offset < end; offset++) {
                                if (input[offset] === '<') {
                                    quotedTagStart = offset;
                                    break;
                                }
                            }
                        }
                        cursor = end + 1;
                    }
                    else {
                        const valueStart = cursor;
                        while (cursor < input.length && !/[\s<>]/.test(input[cursor]))
                            cursor++;
                        if (cursor === valueStart)
                            break;
                    }
                }
                this.lastIndex = quotedTagStart >= 0 ? quotedTagStart : Math.max(start + 1, cursor);
            }
            return null;
        },
    };
}
function bodyStart(input) {
    const tokens = tagScanner(input);
    const roots = [];
    const stack = [];
    const voidTags = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
    let match;
    while ((match = tokens.exec(input))) {
        const tag = /^<(\/)?([a-z][a-z0-9:-]*)/i.exec(match[0]);
        if (!tag)
            continue;
        const closing = !!tag[1], name = tag[2].toLowerCase();
        if (closing) {
            if (!stack.length && /^(rm-think|details|toto)$/.test(name))
                break;
            const index = stack[stack.length - 1]?.name === name ? stack.length - 1 : stack.map(item => item.name).lastIndexOf(name);
            if (index >= 0) {
                for (const item of stack.splice(index))
                    item.end = tokens.lastIndex;
            }
            continue;
        }
        const item = { name, start: match.index, end: tokens.lastIndex, explicit: false, style: name === 'style', blocks: 0 };
        if (!stack.length)
            roots.push(item);
        const root = stack[0] || item;
        const explicit = /^(button|input|select|textarea|svg|img|canvas|video|audio|table|figure)$/.test(name)
            || /\sdata-rm-(?:ui|show|pick|fire|part)\s*=/i.test(match[0]);
        root.explicit ||= explicit;
        root.style ||= name === 'style';
        root.blocks += /^(div|main|article|section|aside|header|footer)$/.test(name) ? 1 : 0;
        if (/^(style|script|textarea|title)$/.test(name)) {
            const end = new RegExp(`</${name}\\s*>`, 'gi');
            end.lastIndex = tokens.lastIndex;
            tokens.lastIndex = end.exec(input) ? end.lastIndex : input.length;
            item.end = tokens.lastIndex;
        }
        else if (!voidTags.has(name) && !/\/\s*>$/.test(match[0]))
            stack.push(item);
    }
    let index = roots.findIndex(item => item.explicit || (item.style && item.blocks >= 3));
    if (index < 0)
        return -1;
    while (index > 0 && roots[index - 1].name === 'style'
        && !input.slice(roots[index - 1].end, roots[index].start).trim())
        index--;
    return roots[index].start;
}
export function stripAtmosphereThinkMarkup(input) {
    const source = String(input || '');
    if (!/<\/?rm-think(?:[\s/>]|$)/i.test(source))
        return source;
    const tokens = tagScanner(source);
    const removals = [];
    let notes = [];
    let match;
    while ((match = tokens.exec(source))) {
        const tag = /^<(\/)?([a-z][a-z0-9:-]*)/i.exec(match[0]);
        if (!tag)
            continue;
        const closing = !!tag[1], name = tag[2].toLowerCase();
        if (name === 'rm-think') {
            if (!closing) {
                const parent = notes[notes.length - 1];
                let recover = parent ? parent.recover : -1;
                if (!parent || parent.body) {
                    const remaining = source.slice(tokens.lastIndex);
                    recover = bodyStart(remaining);
                }
                notes.push({ start: match.index, body: false, recover: parent && !parent.body ? recover : (recover < 0 ? -1 : tokens.lastIndex + recover) });
            }
            else {
                const note = notes.pop();
                removals.push([note && !note.body ? note.start : match.index, tokens.lastIndex]);
            }
            continue;
        }
        if (!closing || /^(details|toto)$/.test(name)) {
            for (const note of notes)
                if (!note.body && ((note.recover >= 0 && match.index >= note.recover) || closing)) {
                    removals.push([note.start, match.index]);
                    note.body = true;
                }
        }
        if (closing && /^(details|toto)$/.test(name))
            notes = [];
        if (!closing && /^(style|script|textarea|title)$/.test(name)) {
            const end = new RegExp(`</${name}\\s*>`, 'gi');
            end.lastIndex = tokens.lastIndex;
            const close = end.exec(source);
            tokens.lastIndex = close ? end.lastIndex : source.length;
        }
    }
    for (const note of notes)
        if (!note.body)
            removals.push([note.start, source.length]);
    removals.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    let output = '', cursor = 0;
    for (const [start, end] of removals) {
        if (end <= cursor)
            continue;
        output += source.slice(cursor, Math.max(cursor, start));
        cursor = end;
    }
    return output + source.slice(cursor);
}
export function removeAtmosphereNoteNodes(root) {
    let removed = 0;
    for (const node of [...root.querySelectorAll('rm-think, rm-ticket')].reverse()) {
        if (node.tagName.toLowerCase() === 'rm-think') {
            const markup = node.innerHTML;
            const start = bodyStart(markup);
            let offset = 0, firstBody = null;
            for (const child of node.childNodes) {
                if (child.nodeType === 1 && offset === start) {
                    firstBody = child;
                    break;
                }
                const box = node.ownerDocument.createElement('div');
                box.appendChild(child.cloneNode(true));
                offset += box.innerHTML.length;
            }
            if (firstBody) {
                let child = firstBody;
                while (child) {
                    const next = child.nextSibling;
                    node.parentNode.insertBefore(child, node);
                    child = next;
                }
            }
        }
        node.remove();
        removed += 1;
    }
    return removed;
}
