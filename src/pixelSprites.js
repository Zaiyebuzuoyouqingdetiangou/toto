import { rmR as __rmR } from "./textTable.js?rmv=2.5.3";
const SPRITE_ATTR = 'data-rm-sprite';
const PALETTE_ATTR = 'data-rm-palette';
const AT_ATTR = 'data-rm-at';
const SCENE_ATTR = 'data-rm-pixel-scene';
const SIZE_ATTR = 'data-rm-pixel-size';
export const SPRITE_DONE_ATTR = 'data-rm-sprite-done';
const MAX_SIDE = 96;
const MAX_SPRITES = 60;
const HEX_RE = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const NAME_RE = /^[a-z]{3,20}$/i;
const SVG_NS = 'http://www.w3.org/2000/svg';
export function parseSpriteRows(value) {
    const rows = String(value || '').split(/[\/\n\r]+/).map(row => row.trim()).filter(Boolean).slice(0, MAX_SIDE)
        .map(row => [...row].slice(0, MAX_SIDE).join(''));
    return rows;
}
function isColor(value) {
    if (HEX_RE.test(value))
        return true;
    if (!NAME_RE.test(value))
        return false;
    try {
        return !!globalThis.CSS?.supports?.('color', value);
    }
    catch {
        return false;
    }
}
export function parsePalette(value) {
    const palette = new Map();
    const re = /([^\s.\/,;:=#])\s*[:=]?\s*(#[0-9a-fA-F]{3,8}\b|[A-Za-z]{3,20}\b)/g;
    for (const match of String(value || '').matchAll(re)) {
        const [, key, color] = match;
        if (palette.size >= 32)
            break;
        if (!palette.has(key) && isColor(color))
            palette.set(key, color);
    }
    return palette;
}
export function spritePaths(rows, palette) {
    const byColor = new Map();
    rows.forEach((row, y) => {
        const cells = [...row];
        let x = 0;
        while (x < cells.length) {
            const key = cells[x];
            const color = palette.get(key);
            if (!color) {
                x += 1;
                continue;
            }
            let end = x + 1;
            while (end < cells.length && cells[end] === key)
                end += 1;
            const list = byColor.get(color) || [];
            list.push(`M${x} ${y}h${end - x}v1h-${end - x}z`);
            byColor.set(color, list);
            x = end;
        }
    });
    return [...byColor].map(([color, parts]) => ({ color, d: parts.join('') }));
}
function sceneSize(scene) {
    const match = String(scene?.getAttribute?.(SCENE_ATTR) || '').match(/(\d{1,4})\s*[x×*,]\s*(\d{1,4})/);
    let w = match ? Number(match[1]) : 0, h = match ? Number(match[2]) : 0;
    if (!(w > 0 && h > 0)) {
        const box = String(scene?.querySelector?.(':scope > svg[viewBox]')?.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
        if (box.length === 4) {
            w = box[2];
            h = box[3];
        }
    }
    return w > 0 && h > 0 && w <= 1024 && h <= 1024 ? { w, h } : null;
}
const STYLE_ID = 'rabbit-mirror-pixel-sprites';
const SCENE_SPRITE_ATTR = 'data-rm-scene-sprite';
const STYLE_TEXT = `:where([${SPRITE_DONE_ATTR}]){line-height:0;font-style:normal}`
    + `:where([${SPRITE_DONE_ATTR}]:not([${SCENE_SPRITE_ATTR}])){display:inline-block}`
    + `:where([${SPRITE_DONE_ATTR}][${SCENE_SPRITE_ATTR}]){position:absolute;left:var(--rm-sx,0);top:0;width:var(--rm-sw,auto)}`
    + `:where([${SPRITE_DONE_ATTR}])>svg{display:block;height:auto;overflow:visible}`
    + `:where([${SPRITE_DONE_ATTR}][${SCENE_SPRITE_ATTR}])>svg{width:100%}`
    + `:where([${SCENE_ATTR}]){image-rendering:pixelated}`;
function ensureStyle(doc) {
    if (!doc?.head || doc.getElementById(STYLE_ID))
        return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = STYLE_TEXT;
    doc.head.append(style);
}
function renderSprite(el, doc) {
    const rows = parseSpriteRows(el.getAttribute(SPRITE_ATTR));
    const palette = parsePalette(el.getAttribute(PALETTE_ATTR));
    if (!rows.length || !palette.size)
        return false;
    const cols = Math.max(...rows.map(row => [...row].length));
    const scene = el.closest?.(`[${SCENE_ATTR}]`);
    const size = scene ? sceneSize(scene) : null;
    const at = String(el.getAttribute(AT_ATTR) || '').match(__rmR("P.vT4x5cx1ZqRTQY.tXHfxeTwP2ha4VbRHQPe1F9QvqfWWL1W0fUZAybBZG_7ReEPVxgQZtW.FePX._h.LbWceY36q228w3bULznKkffusCV5F0ZMJUHXriVv3k", ""));
    const px = Math.min(16, Math.max(1, Number(el.getAttribute(SIZE_ATTR)) || 4));
    const key = [el.getAttribute(SPRITE_ATTR), el.getAttribute(PALETTE_ATTR), el.getAttribute(AT_ATTR), size ? `${size.w}x${size.h}` : px].join('|');
    const mark = `${key.length}:${hash(key)}`;
    if (el.getAttribute(SPRITE_DONE_ATTR) === mark && el.querySelector?.(':scope > svg'))
        return true;
    const svg = doc.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${cols} ${rows.length}`);
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('aria-hidden', 'true');
    for (const { color, d } of spritePaths(rows, palette)) {
        const path = doc.createElementNS(SVG_NS, 'path');
        path.setAttribute('fill', color);
        path.setAttribute('d', d);
        svg.append(path);
    }
    el.replaceChildren(svg);
    if (size) {
        el.setAttribute(SCENE_SPRITE_ATTR, '');
        if (at)
            for (const name of ['left', 'top'])
                el.style.removeProperty(name);
        const sceneStyle = doc.defaultView?.getComputedStyle?.(scene);
        const pad = side => Math.max(0, parseFloat(sceneStyle?.[`padding${side}`]) || 0);
        const pl = pad('Left'), pr = pad('Right'), pt = pad('Top');
        const inner = `(100% - ${pl + pr}px)`;
        const x = at ? Number(at[1]) : 0, y = at ? Number(at[2]) : 0;
        el.style.setProperty('--rm-sw', `calc(${inner} * ${cols / size.w})`);
        el.style.setProperty('--rm-sx', `calc(${pl}px + ${inner} * ${x / size.w})`);
        el.style.setProperty('margin-top', `calc(${pt}px + ${inner} * ${y / size.w})`);
        const computed = sceneStyle?.position || scene.style?.position || '';
        if (!computed || computed === 'static')
            scene.style.setProperty('position', 'relative');
    }
    else {
        el.removeAttribute(SCENE_SPRITE_ATTR);
        for (const name of ['--rm-sw', '--rm-sx', '--rm-sy', 'margin-top'])
            el.style.removeProperty(name);
        svg.style.setProperty('width', `${cols * px}px`);
        svg.style.setProperty('height', `${rows.length * px}px`);
    }
    el.setAttribute(SPRITE_DONE_ATTR, mark);
    return true;
}
function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
}
function faceOf(el, scope) {
    const scoped = el.closest?.('[data-rabbit-mirror-css-scope]');
    if (scoped)
        return scoped;
    let face = null;
    for (let node = el.closest?.('details'); node; node = node.parentElement?.closest?.('details'))
        face = node;
    return face || scope;
}
export function applyPixelSprites(root) {
    const scope = root?.querySelectorAll ? root : null;
    if (!scope)
        return 0;
    const nodes = [...scope.querySelectorAll(`[${SPRITE_ATTR}]`)];
    if (scope.matches?.(`[${SPRITE_ATTR}]`))
        nodes.unshift(scope);
    if (!nodes.length)
        return 0;
    const doc = scope.ownerDocument || scope;
    ensureStyle(doc);
    let drawn = 0;
    const perFace = new Map();
    for (const el of nodes) {
        const face = faceOf(el, scope);
        const count = perFace.get(face) || 0;
        if (count >= MAX_SPRITES)
            continue;
        perFace.set(face, count + 1);
        try {
            if (renderSprite(el, doc))
                drawn += 1;
        }
        catch { }
    }
    return drawn;
}
