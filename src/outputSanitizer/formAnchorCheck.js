import { rmT as __rmT } from "../textTable.js?rmv=2.6.2";
import { layoutRect } from '../faceZoomMetrics.js?rmv=2.6.2';
const CHROME = 'summary, style, script, template, [hidden], [data-rabbit-mirror-tool-entry-host], [data-rm-mobile-controls], [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-collapse-btn], [data-rm-draw-notes]';
const MAX_NODES = 900;
const MIN_PART = 196;
function transparent(color) {
    return !color || color === 'transparent' || /rgba\([^)]*,\s*0\s*\)$/.test(color);
}
function ownText(node) {
    let text = '';
    for (const child of node.childNodes)
        if (child.nodeType === 3)
            text += child.textContent;
    return text.replace(/\s+/g, '');
}
function painted(style, parentStyle) {
    if (style.backgroundImage && style.backgroundImage !== 'none')
        return true;
    if (!transparent(style.backgroundColor) && style.backgroundColor !== parentStyle?.backgroundColor)
        return true;
    const sides = ['Top', 'Right', 'Bottom', 'Left'].filter(side => (parseFloat(style[`border${side}Width`]) || 0) > 0
        && !/none|hidden/.test(style[`border${side}Style`] || '') && !transparent(style[`border${side}Color`]));
    return sides.length >= 2;
}
export function inspectFormAnchorTop(root) {
    const details = root?.matches?.('details') ? root : root?.querySelector?.('details');
    if (!details)
        return { status: 'none' };
    if (!details.open)
        return { status: 'closed' };
    const candidates = [...details.children].filter(node => !node.matches(CHROME) && !node.matches('input, label, button'));
    if (!candidates.length)
        return { status: 'none' };
    const body = candidates.find(node => { const r = layoutRect(node); return r.height >= 40 && r.width >= 40; });
    if (!body)
        return { status: 'closed' };
    const view = body.ownerDocument?.defaultView || globalThis;
    const box = layoutRect(body);
    const depth = Math.min(360, box.height / 2);
    const bottom = box.top + depth;
    let parts = 0, text = 0, frameArea = 0, seen = 0;
    const walk = node => {
        for (const child of node.children) {
            if (++seen > MAX_NODES)
                return;
            if (child.matches(CHROME))
                continue;
            const rect = layoutRect(child);
            if (!rect.width || !rect.height) {
                walk(child);
                continue;
            }
            if (rect.top >= bottom || rect.bottom <= box.top)
                continue;
            if (child.matches('[data-rm-draw-frame]')) {
                const visible = Math.max(0, Math.min(rect.bottom, bottom) - Math.max(rect.top, box.top));
                frameArea += Math.min(rect.width, box.width) * visible;
                continue;
            }
            let style;
            try {
                style = view.getComputedStyle(child);
            }
            catch {
                continue;
            }
            if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0)
                continue;
            text += ownText(child).length;
            if (child.matches('svg')) {
                if (rect.width * rect.height >= MIN_PART)
                    parts += 1;
                continue;
            }
            const area = rect.width * rect.height;
            const plate = rect.width >= box.width * 0.9 && rect.height >= depth * 0.5;
            if (!plate && area >= MIN_PART && !ownText(child).length) {
                let parentStyle = null;
                try {
                    parentStyle = view.getComputedStyle(child.parentElement);
                }
                catch {
                    parentStyle = null;
                }
                const round = parseFloat(style.borderTopLeftRadius) >= Math.min(rect.width, rect.height) * 0.4;
                if (painted(style, parentStyle) || (round && !transparent(style.backgroundColor)))
                    parts += 1;
            }
            walk(child);
        }
    };
    walk(body);
    const frameShare = Math.round(frameArea / Math.max(1, box.width * depth) * 100);
    return { status: 'measured', depth: Math.round(depth), parts, text, frameShare };
}
export function formAnchorTopDiagnostic(root) {
    const result = inspectFormAnchorTop(root);
    if (result.status === 'none')
        return __rmT("RM2ej0EqbYvmF0etd15Ad71fS686njFrLw19xktsjar.bh");
    if (result.status === 'closed')
        return __rmT("fM9U84tw_dvyb5Ngu27U_9pQvkjUpJBlYeiPUMRaz8PG0RO0q8_");
    const { depth, parts, text, frameShare } = result;
    const head = `${__rmT("QmGxzb2xgsU7xIeL5MZ5i0H6hC22WQY8nQE")}${depth}${__rmT("jJhiYlY7OBlYVFvFZ3XOjhCLNHqCJk")}${parts}${__rmT("7ac8YEs944KZFhFGgPD")}${frameShare}${__rmT("CWeVoHIONQOBTh")}${text}${__rmT("2RdnBk")}`;
    if (parts >= 2)
        return `${head}${__rmT("OLa.PUO1duW_a7pe2Oi.SMlqbNs")}`;
    if (frameShare >= 40)
        return `${head}${__rmT("sSqGQivTbZKHsW4SR2WMLnXy9bPNRCuYWSRFwjSxPXWHsvQX")}`;
    return `${head}${__rmT("nX6DO2bulOwd4U9Kybz_yxwvAzrd.vlGahvZLfwqU_gvHtt3ZZl_915X")}`;
}
function luminanceOf(color) {
    const parts = String(color || '').match(/[\d.]+/g);
    if (!parts || parts.length < 3)
        return null;
    const [r, g, b, a = 1] = parts.map(Number);
    if (a < 0.5)
        return null;
    const channel = value => { const v = value / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
export function inspectValueLayers(root) {
    const details = root?.matches?.('details') ? root : root?.querySelector?.('details');
    if (!details?.open)
        return { status: 'closed' };
    const view = details.ownerDocument?.defaultView || globalThis;
    let dark = 0, mid = 0, light = 0, seen = 0;
    const bands = new Array(10).fill(0);
    for (const node of details.querySelectorAll('*')) {
        if (++seen > MAX_NODES * 2)
            break;
        if (node.matches(CHROME) || node.closest('[data-rm-draw-frame]'))
            continue;
        const rect = layoutRect(node);
        const area = rect.width * rect.height;
        if (area < 3000)
            continue;
        let style;
        try {
            style = view.getComputedStyle(node);
        }
        catch {
            continue;
        }
        let value = luminanceOf(style.backgroundColor);
        if (value === null && style.backgroundImage && style.backgroundImage !== 'none')
            value = luminanceOf((style.backgroundImage.match(/rgba?\([^)]*\)/) || [])[0]);
        if (value === null)
            continue;
        if (value < 0.12)
            dark += area;
        else if (value < 0.5)
            mid += area;
        else
            light += area;
        bands[Math.min(9, Math.floor(value * 10))] += area;
    }
    const total = dark + mid + light;
    if (!total)
        return { status: 'none' };
    const share = value => Math.round(value / total * 100);
    return { status: 'measured', dark: share(dark), mid: share(mid), light: share(light), bands: bands.filter(value => value / total >= 0.1).length };
}
export function valueLayersDiagnostic(root) {
    const result = inspectValueLayers(root);
    if (result.status === 'closed')
        return __rmT("rs17RQsSg2l9wBwD4W_d5weaYEc5TsI8RSfFXwM7gG8");
    if (result.status === 'none')
        return __rmT("gFlKaLEdMWoyb5Ngu2f3C_PF6hgvl4fB6U5LZNRa6W53993aq8_");
    const { dark, mid, light, bands } = result;
    const head = `${__rmT("LFKRuatXFeomF0etd1v.GCwQgPQU9z79RQCwaOiYecotnh")}${dark}${__rmT("2lw7bqwjHKG")}${mid}${__rmT("2lw7bxtAHKG")}${light}${__rmT("PhY1thRNP2EbThjucaAv7EfVTjddm4AP")}${bands}${__rmT("2RWi3f")}`;
    const tiers = [dark, mid, light].filter(value => value >= 15).length;
    if (tiers >= 2 || bands >= 3)
        return `${head}${__rmT("o7IunI1Y.YogDSorO9mpUT")}`;
    return `${head}${__rmT("PD9HcVUJTURfUf")}${dark >= 85 ? __rmT("PqA") : light >= 85 ? __rmT("rqA") : __rmT("fDqp3f")}${__rmT("m6cnQgks9k29CAUQVmkPTIEI")}`;
}
