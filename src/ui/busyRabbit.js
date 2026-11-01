import { buildSewingSprite } from '../independentApi/generationProgress.js?rmv=2.15.0';
const BUSY_ATTR = 'data-rm-busy-rabbit';
const SHEET_VAR = '--rm-busy-rabbit-sheet';
const ready = new WeakSet();
function ensureSheet(doc) {
    if (!doc?.documentElement || ready.has(doc))
        return;
    ready.add(doc);
    try {
        const sprite = buildSewingSprite(doc, 1);
        const [, , w, h] = String(sprite.getAttribute('viewBox') || '0 0 42 30').split(/\s+/).map(Number);
        const pick = name => sprite.querySelector(`.${name}`)?.outerHTML || '';
        const base = pick('rm-gp-base');
        const sheet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w * 2} ${h}" width="${w * 2}" height="${h}" shape-rendering="crispEdges">`
            + `<g>${base}${pick('rm-gp-frame-a')}</g><g transform="translate(${w} 0)">${base}${pick('rm-gp-frame-b')}</g></svg>`;
        doc.documentElement.style.setProperty(SHEET_VAR, `url("data:image/svg+xml,${encodeURIComponent(sheet)}")`);
    }
    catch {
        ready.delete(doc);
    }
}
export function setBusyRabbit(node, on) {
    const element = node?.jquery ? node[0] : node;
    if (!element?.setAttribute)
        return;
    if (on) {
        ensureSheet(element.ownerDocument);
        element.setAttribute(BUSY_ATTR, 'true');
    }
    else
        element.removeAttribute(BUSY_ATTR);
}
