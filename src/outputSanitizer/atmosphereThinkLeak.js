// 「按正文挑签」时模型在标题后面写 <rm-think>为什么选这张</rm-think><rm-ticket>1</rm-ticket>，兔子镜自己读。
// 跟随正文生成时，酒馆把认不出的标签去掉、里面的字留下，于是这段选签理由和签号露在画面最上面。
// 这里在显示时把它们拿掉：标签还在就整个删；标签已经被去掉、只剩字的，按原始消息里写的内容认出来再删。
// 只删紧跟在标题后面、和原文对得上的那几个字；对不上就不动，不会误删正文。

const THINK = /<rm-think(?:\s[^>]*)?>([\s\S]*?)<\/rm-think\s*>/gi;
const TICKET = /<rm-ticket(?:\s[^>]*)?>\s*(\d+)\s*<\/rm-ticket\s*>/gi;
const INLINE = /^(EM|STRONG|B|I|SPAN|Q|CODE|SMALL|U|MARK|FONT|RM-THINK|RM-TICKET)$/;

const squash = text => String(text || '').replace(/<[^>]+>/g, '').replace(/&[a-z]+;|&#\d+;/gi, '').replace(/[\s ​"'“”‘’「」『』]/g, '');

export function leakedAtmosphereTexts(raw) {
    const source = String(raw || '');
    const thinks = [...source.matchAll(THINK)].map(match => squash(match[1])).filter(Boolean);
    const tickets = [...source.matchAll(TICKET)].map(match => match[1]);
    const candidates = new Set();
    thinks.forEach((think, index) => {
        candidates.add(think);
        const ticket = tickets[index] ?? tickets[0];
        if (ticket) candidates.add(`${think}${ticket}`);
    });
    tickets.forEach(ticket => candidates.add(ticket));
    return candidates;
}

/** 在一面（或一条消息）里拿掉露出来的选签理由和签号；返回删了几处。 */
export function hideLeakedAtmosphereThink(root, raw) {
    if (!root?.querySelectorAll) return 0;
    let removed = 0;
    // 标签还在（没被酒馆去掉）：整个删。
    for (const node of root.querySelectorAll('rm-think, rm-ticket')) { node.remove(); removed += 1; }
    const candidates = leakedAtmosphereTexts(raw);
    if (!candidates.size) return removed;
    const faces = root.matches?.('details') ? [root] : [...root.querySelectorAll('details')];
    for (const details of faces) {
        const summary = details.querySelector(':scope > summary');
        if (!summary) continue;
        // 标题后面连着的一串文字和行内小标签，到第一个块级元素为止。
        const run = [];
        let text = '';
        for (let node = summary.nextSibling; node; node = node.nextSibling) {
            if (node.nodeType === 3) { run.push(node); text += node.textContent; continue; }
            if (node.nodeType === 1 && INLINE.test(node.tagName)) { run.push(node); text += node.textContent; continue; }
            if (node.nodeType === 8) continue;
            break;
        }
        const squashed = squash(text);
        if (!squashed || !candidates.has(squashed)) continue;
        run.forEach(node => node.remove());
        removed += 1;
    }
    return removed;
}
