import { buildSewingSprite } from '../independentApi/generationProgress.js?rmv=2.15.2';
const BUSY_ATTR = 'data-rm-busy-rabbit';
export const BUSY_RABBIT_CLASS = 'rm-busy-rabbit';
function rabbitBefore(element) {
    const previous = element.previousElementSibling;
    return previous?.classList?.contains(BUSY_RABBIT_CLASS) ? previous : null;
}
function layoutFor(element) {
    try {
        const view = element.ownerDocument?.defaultView;
        const parent = element.parentElement ? view?.getComputedStyle?.(element.parentElement) : null;
        if (parent && /flex|grid/.test(parent.display))
            return 'row';
        const style = view?.getComputedStyle?.(element);
        if (!style || /^inline/.test(style.display))
            return 'row';
        return style.textAlign === 'center' ? 'center' : 'float';
    }
    catch {
        return 'row';
    }
}
export function setBusyRabbit(node, on) {
    const element = node?.jquery ? node[0] : node;
    if (!element?.setAttribute)
        return;
    const existing = rabbitBefore(element);
    if (!on) {
        element.removeAttribute(BUSY_ATTR);
        existing?.remove();
        return;
    }
    element.setAttribute(BUSY_ATTR, 'true');
    if (existing || !element.parentNode)
        return;
    const doc = element.ownerDocument;
    try {
        const rabbit = doc.createElement('span');
        rabbit.className = BUSY_RABBIT_CLASS;
        rabbit.setAttribute('data-rm-gp-phase', 'sewing');
        rabbit.setAttribute('data-rm-busy-layout', layoutFor(element));
        rabbit.setAttribute('aria-hidden', 'true');
        rabbit.append(buildSewingSprite(doc, 1));
        element.before(rabbit);
    }
    catch { }
}
