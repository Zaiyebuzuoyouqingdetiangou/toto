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
}

export function refreshFacePagerPositions(scope, position) {
    cleanupFacePagers(scope);
    for (const host of scope?.querySelectorAll?.('summary > [data-rabbit-mirror-tool-entry-host]') || []) {
        placeFacePager(host.parentElement?.parentElement, host, position);
    }
}
