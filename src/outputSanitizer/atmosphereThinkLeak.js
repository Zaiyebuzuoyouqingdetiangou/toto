import { removeAtmosphereNoteNodes } from '../atmosphereMarkup.js?rmv=2.6.0';
const THINK = /<rm-think(?:\s[^>]*)?>([\s\S]*?)<\/rm-think\s*>/gi;
const TICKET = /<rm-ticket(?:\s[^>]*)?>\s*(\d+)\s*<\/rm-ticket\s*>/gi;
const INLINE = /^(EM|STRONG|B|I|SPAN|Q|CODE|SMALL|U|MARK|FONT|RM-THINK|RM-TICKET)$/;
function decodeEntities(text) {
    const value = String(text || '');
    if (!/&[#a-z0-9]+;/i.test(value) || typeof document === 'undefined')
        return value;
    const box = document.createElement('textarea');
    box.innerHTML = value;
    return box.value;
}
const squash = text => decodeEntities(String(text || '').replace(/<[^>]+>/g, '')).replace(/[\s\u00a0\u200b"'\u201c\u201d\u2018\u2019\u300c\u300d\u300e\u300f*_~`#]/g, '');
export function leakedAtmosphereTexts(raw) {
    const source = String(raw || '');
    const thinks = [...source.matchAll(THINK)].map(match => squash(match[1])).filter(Boolean);
    const tickets = [...source.matchAll(TICKET)].map(match => match[1]);
    const candidates = new Set();
    thinks.forEach((think, index) => {
        candidates.add(think);
        const ticket = tickets[index] ?? tickets[0];
        if (ticket)
            candidates.add(`${think}${ticket}`);
    });
    tickets.forEach(ticket => candidates.add(ticket));
    return candidates;
}
export function hideLeakedAtmosphereThink(root, raw) {
    if (!root?.querySelectorAll)
        return 0;
    let removed = removeAtmosphereNoteNodes(root);
    const candidates = leakedAtmosphereTexts(raw);
    if (!candidates.size)
        return removed;
    const faces = root.matches?.('details') ? [root] : [...root.querySelectorAll('details')];
    for (const details of faces) {
        const summary = details.querySelector(':scope > summary');
        if (!summary)
            continue;
        const run = [];
        let text = '';
        for (let node = summary.nextSibling; node; node = node.nextSibling) {
            if (node.nodeType === 3) {
                run.push(node);
                text += node.textContent;
                continue;
            }
            if (node.nodeType === 1 && INLINE.test(node.tagName)) {
                run.push(node);
                text += node.textContent;
                continue;
            }
            if (node.nodeType === 8)
                continue;
            break;
        }
        const squashed = squash(text);
        if (squashed && candidates.has(squashed)) {
            run.forEach(node => node.remove());
            removed += 1;
            continue;
        }
        if (!squashed) {
            const first = summary.nextElementSibling;
            if (first?.tagName === 'P' && candidates.has(squash(first.textContent))) {
                first.remove();
                removed += 1;
            }
        }
    }
    return removed;
}
