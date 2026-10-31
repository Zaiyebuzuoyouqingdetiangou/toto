import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.3.9";
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
    if (saved)
        nodes.push(saved);
    if (isFooter(details?.nextElementSibling))
        nodes.push(details.nextElementSibling);
    return [...new Set(nodes)];
}
export function facePagerDetails(node) {
    const footer = node?.closest?.(FOOTER);
    if (!footer)
        return null;
    const previous = footer.previousElementSibling;
    const owner = facesByFooter.get(footer) || previous;
    return owner?.tagName === 'DETAILS' && owner === previous ? owner : null;
}
export function removeFacePager(details) {
    if (!details)
        return;
    faceFooters(details).forEach(footer => footer.remove());
    footersByFace.delete(details);
}
export function cleanupFacePagers(scope) {
    for (const footer of scope?.querySelectorAll?.(FOOTER) || []) {
        if (footer.parentElement?.tagName === 'DETAILS')
            continue;
        if (!facePagerDetails(footer))
            footer.remove();
    }
}
export function placeFacePager(details, titleHost, position = 'top') {
    if (details?.tagName !== 'DETAILS' || titleHost?.parentElement?.parentElement !== details)
        return;
    const footers = faceFooters(details);
    const bar = titleHost.querySelector(':scope > [data-rm-face-swipe-bar]')
        || footers.map(footer => footer.querySelector(':scope > [data-rm-face-swipe-bar]')).find(Boolean);
    if (!bar) {
        removeFacePager(details);
        return;
    }
    if (position !== 'bottom') {
        titleHost.prepend(bar);
        removeFacePager(details);
        return;
    }
    if (!details.parentElement)
        return;
    const footer = footers[0] || details.ownerDocument.createElement('div');
    footer.setAttribute('data-rm-face-swipe-host', 'true');
    footer.setAttribute('data-rm-face-swipe-position', 'bottom');
    footer.className = 'rabbit-mirror-face-swipe-footer';
    footer.setAttribute('role', 'group');
    footer.setAttribute('aria-label', __rmT("8vfuqCi7yQpRLh"));
    if (footer.firstElementChild !== bar || footer.children.length !== 1)
        footer.replaceChildren(bar);
    if (details.nextElementSibling !== footer)
        details.after(footer);
    footersByFace.set(details, footer);
    facesByFooter.set(footer, details);
    footers.filter(node => node !== footer).forEach(node => node.remove());
    let tone = '';
    try {
        tone = faceTone(details);
    }
    catch {
        tone = '';
    }
    if (tone)
        footer.setAttribute('data-rm-pager-tone', tone);
    else
        footer.removeAttribute?.('data-rm-pager-tone');
}
function parseColor(value) {
    const match = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/.exec(String(value || ''));
    if (!match)
        return null;
    let alpha = match[4] === undefined ? 1 : parseFloat(match[4]) / (String(match[4]).endsWith('%') ? 100 : 1);
    if (!(alpha > 0.5))
        return null;
    return [Number(match[1]), Number(match[2]), Number(match[3])];
}
function luminance([r, g, b]) {
    const channel = value => { const c = value / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
function faceTone(details) {
    const view = details?.ownerDocument?.defaultView;
    if (!view?.getComputedStyle)
        return '';
    const candidates = [details, details.querySelector(':scope > summary'),
        ...[...details.children].filter(node => node.tagName !== 'SUMMARY' && node.tagName !== 'STYLE').slice(0, 3),
        ...[...details.children].filter(node => node.tagName !== 'SUMMARY' && node.tagName !== 'STYLE').slice(0, 2).flatMap(node => [...node.children].slice(0, 2))];
    for (const node of candidates) {
        if (!node)
            continue;
        let color = null;
        try {
            color = parseColor(view.getComputedStyle(node).backgroundColor);
        }
        catch {
            color = null;
        }
        if (color)
            return luminance(color) < 0.2 ? 'dark' : 'light';
    }
    return '';
}
export function refreshFacePagerPositions(scope, position) {
    cleanupFacePagers(scope);
    for (const host of scope?.querySelectorAll?.('summary > [data-rabbit-mirror-tool-entry-host]') || []) {
        placeFacePager(host.parentElement?.parentElement, host, position);
    }
}
const COLLAPSE = '[data-rm-face-swipe-host][data-rm-face-swipe-position="collapse"]';
const collapseByFace = new WeakMap();
const HOST_COLLAPSE = '.details-collapse-btn, [data-collapse-btn]';
const COLLAPSE_TEXT = __rmR("aRvc4x5cGWZDRF.xgKGSuHHeVQebXeJO4QD3ek.9NvqnWhz1A0fWZvob3vGdqw6OGcvy7FXAiQeqWm3AELbTcnB3EjNBEchMcdzVC591R_dkftv_GnFHXriVxRk", "");
const RUNTIME_UI = '[data-rabbit-mirror-tool-entry-host], [data-rm-face-swipe-host], [data-rm-image-region], [data-rm-image-portal], '
    + '[data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-rabbit-mirror-resay], [data-rabbit-mirror-interaction-diagnostic], '
    + '[data-rabbit-mirror-reference-note], [data-rabbit-mirror-source-truncation-notice], [popover]';
function looksLikeCollapse(node) {
    if (!node || node.nodeType !== 1 || node.matches?.(COLLAPSE))
        return false;
    if (node.matches?.(HOST_COLLAPSE))
        return true;
    if ((node.children?.length || 0) > 2)
        return false;
    return COLLAPSE_TEXT.test(String(node.textContent || '').replace(/\s+/g, ''));
}
function displayed(node) {
    try {
        return node.ownerDocument.defaultView.getComputedStyle(node).display !== 'none';
    }
    catch {
        return true;
    }
}
export function hasOtherBottomCollapse(details) {
    try {
        if (details.querySelector(`:scope > :is(${HOST_COLLAPSE})`))
            return true;
        for (let node = details.lastElementChild; node; node = node.previousElementSibling) {
            if (node.matches('summary'))
                break;
            if (node.matches('style, script, template, link, meta') || node.matches(RUNTIME_UI) || !displayed(node))
                continue;
            if (looksLikeCollapse(node))
                return true;
            break;
        }
        for (let node = details.nextElementSibling; node; node = node.nextElementSibling) {
            if (node.matches(COLLAPSE) || node.matches(FOOTER) || node.matches('style, script, template') || !displayed(node))
                continue;
            return looksLikeCollapse(node);
        }
    }
    catch { }
    return false;
}
function syncCollapse(details, button) {
    const yieldTo = details.isConnected && hasOtherBottomCollapse(details);
    if (yieldTo)
        button.setAttribute('data-rm-collapse-yield', 'true');
    else
        button.removeAttribute('data-rm-collapse-yield');
    const hidden = !details.open || !details.isConnected || yieldTo;
    if (button.hidden !== hidden)
        button.hidden = hidden;
    let summary = null;
    try {
        summary = details.querySelector(':scope > summary');
    }
    catch {
        summary = null;
    }
    if (summary && details.ownerDocument?.defaultView) {
        const style = details.ownerDocument.defaultView.getComputedStyle(summary);
        const color = style.color || '';
        if (color && button.style.getPropertyValue('--rm-collapse-color') !== color)
            button.style.setProperty('--rm-collapse-color', color);
    }
}
export function placeBottomCollapse(details) {
    if (details?.tagName !== 'DETAILS' || !details.parentElement)
        return;
    const doc = details.ownerDocument;
    let button = collapseByFace.get(details);
    if (!button || !button.isConnected) {
        button = doc.createElement('button');
        button.type = 'button';
        button.className = 'rabbit-mirror-bottom-collapse';
        button.setAttribute('data-rm-face-swipe-host', 'true');
        button.setAttribute('data-rm-face-swipe-position', 'collapse');
        button.setAttribute('aria-label', __rmT("h7kXzlMgt8ANef"));
        const arrow = doc.createElement('span');
        arrow.className = 'rabbit-mirror-bottom-collapse-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        button.append(arrow, doc.createTextNode(__rmT("oPv5.h")));
        button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            const face = collapseByFace.get(button) || null;
            if (!face)
                return;
            face.open = false;
            const summary = face.querySelector(':scope > summary');
            try {
                (summary || face).scrollIntoView({ block: 'nearest' });
            }
            catch { }
        });
        details.addEventListener('toggle', () => { const own = collapseByFace.get(details); if (own)
            syncCollapse(details, own); });
        collapseByFace.set(details, button);
        collapseByFace.set(button, details);
    }
    let anchor = details;
    const next = details.nextElementSibling;
    if (next && next !== button && next.matches?.(FOOTER))
        anchor = next;
    if (anchor.nextElementSibling !== button)
        anchor.after(button);
    details.parentElement.querySelectorAll(`:scope > ${COLLAPSE}`).forEach(node => { if (node !== button && collapseByFace.get(node) === details)
        node.remove(); });
    syncCollapse(details, button);
}
export function removeBottomCollapse(details) {
    const button = details && collapseByFace.get(details);
    if (button) {
        button.remove();
        collapseByFace.delete(details);
    }
}
export function cleanupBottomCollapses(scope) {
    for (const node of scope?.querySelectorAll?.(COLLAPSE) || []) {
        const face = collapseByFace.get(node);
        if (!face || !face.isConnected || face.parentElement !== node.parentElement)
            node.remove();
    }
}
