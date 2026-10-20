// Only move runtime controls; generated content and swipe handlers stay intact.
const footersByFace = new WeakMap();
const facesByFooter = new WeakMap();
const FOOTER = '[data-rm-face-swipe-host][data-rm-face-swipe-position="bottom"]';

function isFooter(node) {
    return node?.hasAttribute?.('data-rm-face-swipe-host')
        && node.getAttribute('data-rm-face-swipe-position') === 'bottom';
}

function faceFooters(details) {
    const nodes = [...(details?.querySelectorAll?.(':scope > [data-rm-face-swipe-host]') || [])];
    const saved = footersByFace.get(details);
    if (saved) nodes.push(saved);
    if (isFooter(details?.nextElementSibling)) nodes.push(details.nextElementSibling);
    return [...new Set(nodes)];
}

// Bottom controls are siblings, so closest('details') cannot find their face.
export function facePagerDetails(node) {
    const footer = node?.closest?.(FOOTER);
    if (!footer) return null;
    const previous = footer.previousElementSibling;
    const owner = facesByFooter.get(footer) || previous;
    return owner?.tagName === 'DETAILS' && owner === previous ? owner : null;
}

export function removeFacePager(details) {
    if (!details) return;
    faceFooters(details).forEach(footer => footer.remove());
    footersByFace.delete(details);
}

export function cleanupFacePagers(scope) {
    for (const footer of scope?.querySelectorAll?.(FOOTER) || []) {
        // A persisted legacy footer is migrated by placeFacePager below.
        if (footer.parentElement?.tagName === 'DETAILS') continue;
        if (!facePagerDetails(footer)) footer.remove();
    }
}

export function placeFacePager(details, titleHost, position = 'top') {
    if (details?.tagName !== 'DETAILS' || titleHost?.parentElement?.parentElement !== details) return;
    const footers = faceFooters(details);
    const bar = titleHost.querySelector(':scope > [data-rm-face-swipe-bar]')
        || footers.map(footer => footer.querySelector(':scope > [data-rm-face-swipe-bar]')).find(Boolean);
    if (!bar) { removeFacePager(details); return; }
    if (position !== 'bottom') {
        titleHost.prepend(bar);
        removeFacePager(details);
        return;
    }
    // Wait until a detached mirror is mounted; never lose its wired controls.
    if (!details.parentElement) return;
    const footer = footers[0] || details.ownerDocument.createElement('div');
    footer.setAttribute('data-rm-face-swipe-host', 'true');
    footer.setAttribute('data-rm-face-swipe-position', 'bottom');
    footer.className = 'rabbit-mirror-face-swipe-footer';
    footer.setAttribute('role', 'group');
    footer.setAttribute('aria-label', '兔子镜切页');
    if (footer.firstElementChild !== bar || footer.children.length !== 1) footer.replaceChildren(bar);
    if (details.nextElementSibling !== footer) details.after(footer);
    footersByFace.set(details, footer);
    facesByFooter.set(footer, details);
    footers.filter(node => node !== footer).forEach(node => node.remove());
    // 底部切页条跟着这一面的深浅走：深色的面用深色条，不然在深色画面下面挂一块大白条很扎眼。
    let tone = '';
    try { tone = faceTone(details); } catch { tone = ''; }
    if (tone) footer.setAttribute('data-rm-pager-tone', tone); else footer.removeAttribute?.('data-rm-pager-tone');
}

function parseColor(value) {
    const match = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/.exec(String(value || ''));
    if (!match) return null;
    let alpha = match[4] === undefined ? 1 : parseFloat(match[4]) / (String(match[4]).endsWith('%') ? 100 : 1);
    if (!(alpha > 0.5)) return null;
    return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function luminance([r, g, b]) {
    const channel = value => { const c = value / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

// 这一面的底色：面本身、标题栏、面里第一层铺了底色的块，依次找第一个不透明的；都找不到就不定（用默认浅色条）。
function faceTone(details) {
    const view = details?.ownerDocument?.defaultView;
    if (!view?.getComputedStyle) return '';
    const candidates = [details, details.querySelector(':scope > summary'),
        ...[...details.children].filter(node => node.tagName !== 'SUMMARY' && node.tagName !== 'STYLE').slice(0, 3),
        ...[...details.children].filter(node => node.tagName !== 'SUMMARY' && node.tagName !== 'STYLE').slice(0, 2).flatMap(node => [...node.children].slice(0, 2))];
    for (const node of candidates) {
        if (!node) continue;
        let color = null;
        try { color = parseColor(view.getComputedStyle(node).backgroundColor); } catch { color = null; }
        if (color) return luminance(color) < 0.2 ? 'dark' : 'light';
    }
    return '';
}

export function refreshFacePagerPositions(scope, position) {
    cleanupFacePagers(scope);
    for (const host of scope?.querySelectorAll?.('summary > [data-rabbit-mirror-tool-entry-host]') || []) {
        placeFacePager(host.parentElement?.parentElement, host, position);
    }
}
