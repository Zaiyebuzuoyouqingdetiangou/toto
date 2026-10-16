// 字母像素画：模型用一行行字母画人物、小动物和小物件，兔子镜画成整齐的像素方块。
//
//   <div data-rm-pixel-scene="160x90"> … 背景 SVG（viewBox 同尺寸）…
//     <i data-rm-sprite="..hh../.hssh./.rrrr." data-rm-palette="h #3a2622 s #f6d2bb r #e06a86" data-rm-at="66,57"></i>
//   </div>
//
// 每个字母是一格，「.」是透明，「/」换行；data-rm-palette 写字母对应的颜色；
// 在像素场景里时 data-rm-at 是左上角落在第几格（x,y），大小按场景的格子算，和背景对得齐；
// 不在场景里时按 data-rm-pixel-size（默认 4px）一格。模型写在 <i> 上的 class、style、动画都照常生效。
// 只画方块，不执行任何东西；颜色只认十六进制和颜色名。

const SPRITE_ATTR = 'data-rm-sprite';
const PALETTE_ATTR = 'data-rm-palette';
const AT_ATTR = 'data-rm-at';
const SCENE_ATTR = 'data-rm-pixel-scene';
const SIZE_ATTR = 'data-rm-pixel-size';
// 画好后记下画的是哪一版（字母、颜色、位置都算进去）；改了就重画，没改就不动。
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
    if (HEX_RE.test(value)) return true;
    if (!NAME_RE.test(value)) return false;
    // 颜色名要浏览器认得（red、pink…）；hair、rgb 这种不算。
    try { return !!globalThis.CSS?.supports?.('color', value); } catch { return false; }
}

export function parsePalette(value) {
    const palette = new Map();
    // 「h #3a2622」「h:#3a2622」「h=#3a2622」都认；逗号、分号、空格分开都行。
    const re = /([^\s.\/,;:=#])\s*[:=]?\s*(#[0-9a-fA-F]{3,8}\b|[A-Za-z]{3,20}\b)/g;
    for (const match of String(value || '').matchAll(re)) {
        const [, key, color] = match;
        if (palette.size >= 32) break;
        if (!palette.has(key) && isColor(color)) palette.set(key, color);
    }
    return palette;
}

/** 字母图 → 按颜色合并好的 path（同一行连在一起的同色格子合成一段）。 */
export function spritePaths(rows, palette) {
    const byColor = new Map();
    rows.forEach((row, y) => {
        const cells = [...row];
        let x = 0;
        while (x < cells.length) {
            const key = cells[x];
            const color = palette.get(key);
            if (!color) { x += 1; continue; }
            let end = x + 1;
            while (end < cells.length && cells[end] === key) end += 1;
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
    // 格数写错或没写：按场景里背景 SVG 的 viewBox 算。
    if (!(w > 0 && h > 0)) {
        const box = String(scene?.querySelector?.(':scope > svg[viewBox]')?.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
        if (box.length === 4) { w = box[2]; h = box[3]; }
    }
    return w > 0 && h > 0 && w <= 1024 && h <= 1024 ? { w, h } : null;
}

// 位置和大小只写成变量，真正的规则放在零优先级的 :where() 里：
// 模型自己写的 left/top/width/display（点了换位置、藏起来、显出来）总能盖过兔子镜的默认值。
// 上边距用 margin-top 的百分比（按场景宽度算），场景里多了别的东西、高度变了，小人也不会往下漂。
const STYLE_ID = 'rabbit-mirror-pixel-sprites';
const SCENE_SPRITE_ATTR = 'data-rm-scene-sprite';
const STYLE_TEXT = `:where([${SPRITE_DONE_ATTR}]){line-height:0;font-style:normal}`
    + `:where([${SPRITE_DONE_ATTR}]:not([${SCENE_SPRITE_ATTR}])){display:inline-block}`
    + `:where([${SPRITE_DONE_ATTR}][${SCENE_SPRITE_ATTR}]){position:absolute;left:var(--rm-sx,0);top:0;width:var(--rm-sw,auto)}`
    + `:where([${SPRITE_DONE_ATTR}])>svg{display:block;height:auto;overflow:visible}`
    + `:where([${SPRITE_DONE_ATTR}][${SCENE_SPRITE_ATTR}])>svg{width:100%}`
    + `:where([${SCENE_ATTR}]){image-rendering:pixelated}`;

function ensureStyle(doc) {
    if (!doc?.head || doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = STYLE_TEXT;
    doc.head.append(style);
}

function renderSprite(el, doc) {
    const rows = parseSpriteRows(el.getAttribute(SPRITE_ATTR));
    const palette = parsePalette(el.getAttribute(PALETTE_ATTR));
    if (!rows.length || !palette.size) return false;
    const cols = Math.max(...rows.map(row => [...row].length));
    const scene = el.closest?.(`[${SCENE_ATTR}]`);
    const size = scene ? sceneSize(scene) : null;
    const at = String(el.getAttribute(AT_ATTR) || '').match(/(-?\d+(?:\.\d+)?)\s*[,，\s]\s*(-?\d+(?:\.\d+)?)/);
    const px = Math.min(16, Math.max(1, Number(el.getAttribute(SIZE_ATTR)) || 4));
    const key = [el.getAttribute(SPRITE_ATTR), el.getAttribute(PALETTE_ATTR), el.getAttribute(AT_ATTR), size ? `${size.w}x${size.h}` : px].join('|');
    const mark = `${key.length}:${hash(key)}`;
    if (el.getAttribute(SPRITE_DONE_ATTR) === mark && el.querySelector?.(':scope > svg')) return true;
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
        // 在像素场景里：宽度和位置按场景的格子算，背景放大缩小时一起跟着变。
        el.setAttribute(SCENE_SPRITE_ATTR, '');
        // 百分比按场景的内边距盒算：场景自己有内边距时，扣掉它再按格子分，和背景图对齐。
        const sceneStyle = doc.defaultView?.getComputedStyle?.(scene);
        const pad = side => Math.max(0, parseFloat(sceneStyle?.[`padding${side}`]) || 0);
        const pl = pad('Left'), pr = pad('Right'), pt = pad('Top');
        const inner = `(100% - ${pl + pr}px)`;
        const x = at ? Number(at[1]) : 0, y = at ? Number(at[2]) : 0;
        el.style.setProperty('--rm-sw', `calc(${inner} * ${cols / size.w})`);
        el.style.setProperty('--rm-sx', `calc(${pl}px + ${inner} * ${x / size.w})`);
        // 上边距直接写在元素上（margin 的百分比按宽度算，场景多了对白也不漂）；
        // 模型常写的 *{margin:0} 这类重置盖不掉它。
        el.style.setProperty('margin-top', `calc(${pt}px + ${inner} * ${y / size.w})`);
        // 场景本身没定位时补一个，小人才会落在场景里，不飘到外面。
        const computed = sceneStyle?.position || scene.style?.position || '';
        if (!computed || computed === 'static') scene.style.setProperty('position', 'relative');
    } else {
        el.removeAttribute(SCENE_SPRITE_ATTR);
        for (const name of ['--rm-sw', '--rm-sx', '--rm-sy', 'margin-top']) el.style.removeProperty(name);
        // 这个 svg 是兔子镜自己生成的：大小直接写死，模型的 svg{width:100%} 也撑不大它。
        svg.style.setProperty('width', `${cols * px}px`);
        svg.style.setProperty('height', `${rows.length * px}px`);
    }
    el.setAttribute(SPRITE_DONE_ATTR, mark);
    return true;
}

function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
}

function faceOf(el, scope) {
    const scoped = el.closest?.('[data-rabbit-mirror-css-scope]');
    if (scoped) return scoped;
    let face = null;
    for (let node = el.closest?.('details'); node; node = node.parentElement?.closest?.('details')) face = node;
    return face || scope;
}

/** 把一面（或整个聊天）里的字母像素画都画出来。返回画了几处。 */
export function applyPixelSprites(root) {
    const scope = root?.querySelectorAll ? root : null;
    if (!scope) return 0;
    const nodes = [...scope.querySelectorAll(`[${SPRITE_ATTR}]`)];
    if (scope.matches?.(`[${SPRITE_ATTR}]`)) nodes.unshift(scope);
    if (!nodes.length) return 0;
    const doc = scope.ownerDocument || scope;
    ensureStyle(doc);
    let drawn = 0;
    // 每一面最多画这么多处（按最外层那一面算，套几层也绕不过），防止写坏的超长内容拖慢页面。
    const perFace = new Map();
    for (const el of nodes) {
        const face = faceOf(el, scope);
        const count = perFace.get(face) || 0;
        if (count >= MAX_SPRITES) continue;
        perFace.set(face, count + 1);
        try { if (renderSprite(el, doc)) drawn += 1; } catch { /* 这一处画不出来就保持原样 */ }
    }
    return drawn;
}
