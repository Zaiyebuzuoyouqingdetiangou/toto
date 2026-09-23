// Only move runtime controls; generated content and the swipe handlers stay intact.
export function placeFacePager(details, titleHost, position = 'top') {
    if (details?.tagName !== 'DETAILS' || titleHost?.parentElement?.parentElement !== details) return;
    const footers = [...details.querySelectorAll(':scope > [data-rm-face-swipe-host]')];
    const bar = titleHost.querySelector(':scope > [data-rm-face-swipe-bar]')
        || footers.map(footer => footer.querySelector(':scope > [data-rm-face-swipe-bar]')).find(Boolean);
    if (!bar) { footers.forEach(footer => footer.remove()); return; }
    if (position !== 'bottom') {
        titleHost.prepend(bar);
        footers.forEach(footer => footer.remove());
        return;
    }
    const footer = footers[0] || details.ownerDocument.createElement('div');
    footer.setAttribute('data-rm-face-swipe-host', 'true');
    footer.setAttribute('data-rm-face-swipe-position', 'bottom');
    footer.className = 'rabbit-mirror-face-swipe-footer';
    footer.setAttribute('role', 'group');
    footer.setAttribute('aria-label', '兔子镜切页');
    footer.replaceChildren(bar);
    if (details.lastElementChild !== footer) details.append(footer);
    footers.slice(1).forEach(node => node.remove());
}

export function refreshFacePagerPositions(scope, position) {
    for (const host of scope?.querySelectorAll?.('summary > [data-rabbit-mirror-tool-entry-host]') || []) {
        placeFacePager(host.parentElement?.parentElement, host, position);
    }
}
