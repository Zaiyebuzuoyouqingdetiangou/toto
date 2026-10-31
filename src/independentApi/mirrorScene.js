import { spritePaths } from '../pixelSprites.js?rmv=2.6.3';
const SVG_NS = 'http://www.w3.org/2000/svg';
export const SCENE_H = 30;
const BASE_W = 42;
const MIRROR_GAP = 14;
const MAX_MIRRORS = 5;
const COLORS = Object.freeze({
    k: ['ink', '#3a2e33'], g: ['gold', '#d9b25e'], G: ['gold-dk', '#a8843c'],
    r: ['fur', '#fdf8f4'], R: ['fur-dk', '#e7ddd7'], p: ['pink', '#f2a7ba'], b: ['blush', '#f7c6d1'], e: ['eye', '#2c2226'],
    T: ['stool-dk', '#ad8660'], W: ['wood-dk', '#94683f'], C: ['thread-dk', '#a35a6b'],
    a: ['glass', '#b9d3df'], A: ['glass-dk', '#86a9bd'], h: ['glass-hi', '#eef6f9'],
    Y: ['glow', '#f3d27a'], y: ['glow-hi', '#fff3c4'], o: ['twinkle', '#ffffff'], q: ['mark', '#2b2628'],
    D: ['hole', '#343947'], d: ['hole-dk', '#1f222b'], n: ['streak', '#6e6878'], m: ['hole-mark', '#4d4855'],
});
const BIG = '.....kk...k/....kpRk.kR/....kprk.kprk/....kprk.kprk/....kprk.kprk/....kprkkkprk/...kkrrrrrrrkk/..krrrrrrrrrrrk/.krrrrrrrrrrrRRk/.kreerrrrrrrrRRk/krrekrrrrrrrrRRk/kprrrrrrrrrrrRRk/.kbbrrrrrrrrRRk/..kkrrrrrrrRRkk/...krrrrrrrRRRk/..krrrrrrrrRRRRk/.krrrrrrrrrRRRRk/.krrrrrrrrrRRRRRk/.krrrrrrrrRRRRRkk/..kkrrrrrRRRRRkrk/....kkkkkkkkkkkk';
const SMALL = '...kk..kk/..kpk.kpRk/..kpk.kprk/..kprkkprk/.kkrrrrrrkk/krrrrrrrrrRk/kreerrrrrrRk/kreerrrrrRRk/kbbrrrrrrRRk/.kkrrrrrrRRRk/..krrrrrrRRRk/.krrrrrrRRRRk/.krrkrrRRRRkrk/..kkkkkkkkkk';
const JUMP = '..kk.kk/.kpk.kpk/.kpk.kpk/.kpkkkpk/.krrrrrkk/krerrrrrrkkk/kbbrrrrrrRRRkk/.kkrrrrrrrRRRRk/...kkrrrrrRRRRRkk/.....krrrrRRRRkrk/....krrk.kkkkkkk/....kkk';
const STAR = '.Y./YoY/.Y.';
const QUESTION = '.qq./...q/..q./..../..q.';
const BANG = 'q/q/q/./q';
const WATCH = '.kkk./kgggk/kgGkk/kgggk/.kkk.';
const CARD = 'kkkk/khCk/khhk/kChk/kkkk';
const rowsOf = sprite => String(sprite).split('/');
function rot90(sprite) {
    const rows = rowsOf(sprite);
    const w = Math.max(...rows.map(row => row.length));
    const padded = rows.map(row => row.padEnd(w, '.'));
    return Array.from({ length: w }, (_, x) => padded.map((_, y) => padded[padded.length - 1 - y][x]).join('')).join('/');
}
const SPIN = [BIG];
for (let turn = 0; turn < 3; turn += 1)
    SPIN.push(rot90(SPIN[SPIN.length - 1]));
function grid(width) { return Array.from({ length: SCENE_H }, () => Array(width).fill('.')); }
function put(cells, x, y, ch) {
    if (ch !== '.' && y >= 0 && y < cells.length && x >= 0 && x < cells[0].length)
        cells[y][x] = ch;
}
function blit(cells, sprite, x0, y0, flip = false) {
    rowsOf(sprite).forEach((row, y) => {
        const line = flip ? [...row.padEnd(Math.max(...rowsOf(sprite).map(item => item.length)), '.')].reverse().join('') : row;
        [...line].forEach((ch, x) => put(cells, x0 + x, y0 + y, ch));
    });
}
const spriteWidth = sprite => Math.max(...rowsOf(sprite).map(row => row.length));
const spriteHeight = sprite => rowsOf(sprite).length;
const MIRROR_CY = 7;
const MIRROR_RX = 4;
const MIRROR_RY = 5;
function mirror(cells, cx, { glow = false, crack = false } = {}) {
    const cy = MIRROR_CY, rx = MIRROR_RX, ry = MIRROR_RY;
    for (let y = cy - ry - 2; y <= cy + ry + 2; y += 1) {
        for (let x = cx - rx - 2; x <= cx + rx + 2; x += 1) {
            const outer = ((x - cx) / (rx + 1.5)) ** 2 + ((y - cy) / (ry + 1.5)) ** 2;
            const frame = ((x - cx) / (rx + 0.5)) ** 2 + ((y - cy) / (ry + 0.5)) ** 2;
            const glass = ((x - cx) / (rx - 0.6)) ** 2 + ((y - cy) / (ry - 0.6)) ** 2;
            if (glass <= 1)
                put(cells, x, y, glow ? (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 0.35 ? 'y' : 'Y') : 'a');
            else if (frame <= 1)
                put(cells, x, y, x < cx || y < cy ? 'g' : 'G');
            else if (outer <= 1)
                put(cells, x, y, 'k');
        }
    }
    if (!glow && !crack) {
        put(cells, cx - rx + 2, cy - ry + 2, 'h');
        put(cells, cx - rx + 2, cy - ry + 3, 'h');
        put(cells, cx - rx + 3, cy - ry + 2, 'h');
        put(cells, cx - rx + 2, cy - ry + 5, 'h');
        put(cells, cx + rx - 2, cy + ry - 3, 'A');
        put(cells, cx + rx - 3, cy + ry - 2, 'A');
    }
    if (crack) {
        for (const [dx, dy] of [[1, -ry + 1], [0, -ry + 2], [0, -ry + 3], [-1, -1], [0, 0], [1, 1], [0, 2], [0, 3], [-1, ry - 1], [-2, -1], [-3, -2], [2, 1], [3, 2], [2, -3], [3, -4]])
            put(cells, cx + dx, cy + dy, 'k');
        for (const [dx, dy] of [[-2, 1], [2, -1], [-1, -3]])
            put(cells, cx + dx, cy + dy, 'h');
    }
    put(cells, cx, cy - ry - 2, 'g');
    put(cells, cx - 1, cy - ry - 2, 'k');
    put(cells, cx + 1, cy - ry - 2, 'k');
}
function room(cells) {
    const width = cells[0].length;
    for (let x = 0; x < width; x += 1) {
        put(cells, x, 26, 'k');
        put(cells, x, 27, 'T');
        put(cells, x, 28, 'W');
        put(cells, x, 29, 'W');
    }
    for (let x = 0; x < width; x += 6)
        put(cells, x, 28, 'k');
}
export function clampMirrorCount(value) {
    const count = Math.round(Number(value));
    return Number.isFinite(count) && count >= 2 ? Math.min(MAX_MIRRORS, count) : 3;
}
export function sceneWidth(mirrors) { return Math.max(BASE_W, clampMirrorCount(mirrors) * MIRROR_GAP); }
function mirrorCenters(mirrors) {
    const count = clampMirrorCount(mirrors);
    const width = sceneWidth(count);
    return Array.from({ length: count }, (_, index) => Math.round(width * (index + 0.5) / count));
}
export function seekerX(mirrors, index) {
    const centers = mirrorCenters(mirrors);
    const cx = centers[Math.max(0, Math.min(centers.length - 1, index))];
    return Math.max(0, Math.min(sceneWidth(mirrors) - 14, cx - 6));
}
export function fallFrame(frame) {
    const cells = grid(BASE_W);
    const shift = frame % 4;
    for (let y = 0; y < SCENE_H; y += 1) {
        for (const x of [0, 1, 2, 3, 38, 39, 40, 41])
            put(cells, x, y, 'D');
        put(cells, 4, y, 'd');
        put(cells, 37, y, 'd');
        if ((y + shift) % 5 === 0)
            for (const x of [1, 2, 39, 40])
                put(cells, x, y, 'm');
    }
    for (const [x, y0] of [[8, 2], [31, 6], [12, 17], [29, 21], [34, 13], [7, 24]]) {
        const y = ((y0 - shift * 3) % SCENE_H + SCENE_H) % SCENE_H;
        for (let k = 0; k < 4; k += 1)
            put(cells, x, (y + k) % SCENE_H, 'n');
    }
    const spin = SPIN[shift];
    blit(cells, spin, 21 - Math.floor(spriteWidth(spin) / 2), 15 - Math.floor(spriteHeight(spin) / 2));
    blit(cells, WATCH, 31, ((24 - shift * 4) % 26 + 26) % 26);
    blit(cells, CARD, 6, ((14 - shift * 4) % 26 + 26) % 26);
    return cells;
}
export function searchBase(mirrors) {
    const cells = grid(sceneWidth(mirrors));
    room(cells);
    for (const cx of mirrorCenters(mirrors))
        mirror(cells, cx);
    return cells;
}
export function seekerFrame() {
    const cells = grid(14);
    blit(cells, SMALL, 0, 13);
    blit(cells, QUESTION, 10, 12);
    return cells;
}
export function foundFrame(mirrors, chosen, frame) {
    const count = clampMirrorCount(mirrors);
    const centers = mirrorCenters(count);
    const pick = Math.max(0, Math.min(count - 1, Number(chosen) || 0));
    const from = pick + 1 < count ? pick + 1 : pick - 1;
    const flip = pick > from;
    const cells = grid(sceneWidth(count));
    room(cells);
    centers.forEach((cx, index) => mirror(cells, cx, { glow: index === pick }));
    const cx = centers[pick];
    if (frame === 0) {
        const x = seekerX(count, from);
        blit(cells, SMALL, x, 13, flip);
        blit(cells, BANG, flip ? x + 2 : x + 11, 9);
        blit(cells, STAR, cx - 1, 0);
        blit(cells, STAR, cx + 5, 3);
        blit(cells, STAR, cx - 7, 4);
    }
    else if (frame === 1) {
        blit(cells, JUMP, Math.round((centers[from] + cx) / 2) - 8, 6, flip);
        blit(cells, STAR, cx - 6, 3);
        blit(cells, STAR, cx + 3, 0);
    }
    else if (frame === 2) {
        blit(cells, JUMP, flip ? cx - 13 : cx - 3, 4, flip);
        for (let y = 0; y < SCENE_H; y += 1) {
            for (let x = cx - 5; x <= cx + 5; x += 1) {
                if (((x - cx) / 3.4) ** 2 + ((y - MIRROR_CY) / 4.4) ** 2 <= 1)
                    put(cells, x, y, ((x - cx) / 4) ** 2 + ((y - MIRROR_CY) / 5) ** 2 < 0.35 ? 'y' : 'Y');
            }
        }
        put(cells, cx - 3, 5, 'o');
        put(cells, cx - 3, 9, 'o');
        put(cells, cx + 3, 3, 'o');
        blit(cells, STAR, cx - 8, 1);
    }
    else {
        for (const [dx, dy] of [[-6, 0], [6, 0], [0, -7], [0, 7], [-5, -4], [5, 4], [-5, 4], [5, -4], [-2, -1], [2, -1], [0, -3], [0, 2], [-1, 1], [1, 1]])
            put(cells, cx + dx, MIRROR_CY + dy, 'o');
        blit(cells, STAR, cx - 8, 0);
        blit(cells, STAR, cx + 5, 1);
        blit(cells, STAR, cx - 9, 13);
    }
    return cells;
}
export function failFrame(frame) {
    const cells = grid(BASE_W);
    room(cells);
    [7, 21, 35].forEach((cx, index) => mirror(cells, cx, { crack: index === 1 && frame === 1 }));
    if (frame === 0) {
        blit(cells, JUMP, 17, 5);
        put(cells, 15, 4, 'o');
        put(cells, 14, 6, 'o');
        put(cells, 15, 8, 'o');
    }
    else {
        blit(cells, SMALL, 15, 13);
        blit(cells, STAR, 14, 10);
        blit(cells, STAR, 19, 9);
        blit(cells, STAR, 24, 11);
    }
    return cells;
}
function svgOf(doc, width, className) {
    const svg = doc.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', `rm-gp-sprite ${className}`);
    svg.setAttribute('viewBox', `0 0 ${width} ${SCENE_H}`);
    svg.setAttribute('width', String(width * 2));
    svg.setAttribute('height', String(SCENE_H * 2));
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.setProperty('width', `${width * 2}px`, 'important');
    return svg;
}
function group(doc, parent, cells, className) {
    const node = doc.createElementNS(SVG_NS, 'g');
    if (className)
        node.setAttribute('class', className);
    const palette = new Map(Object.keys(COLORS).map(letter => [letter, letter]));
    for (const { color: letter, d } of spritePaths(cells.map(row => row.join('')), palette)) {
        const [name, fill] = COLORS[letter];
        const path = doc.createElementNS(SVG_NS, 'path');
        path.setAttribute('class', `rm-gp-px-${name}`);
        path.setAttribute('fill', fill);
        path.setAttribute('d', d);
        node.append(path);
    }
    parent.append(node);
    return node;
}
export function buildMirrorScene(doc, scene) {
    const stage = scene?.stage;
    if (stage === 'fall') {
        const svg = svgOf(doc, BASE_W, 'rm-gp-scene rm-gp-scene-fall');
        for (let frame = 0; frame < 4; frame += 1)
            group(doc, svg, fallFrame(frame), `rm-gp-fall rm-gp-fall-${frame}`);
        return svg;
    }
    const mirrors = clampMirrorCount(scene?.mirrors);
    if (stage === 'search') {
        const svg = svgOf(doc, sceneWidth(mirrors), 'rm-gp-scene rm-gp-scene-search');
        group(doc, svg, searchBase(mirrors), 'rm-gp-search-base');
        const seeker = group(doc, svg, seekerFrame(), 'rm-gp-seeker');
        seeker.setAttribute('transform', `translate(${seekerX(mirrors, 0)} 0)`);
        return svg;
    }
    if (stage === 'found') {
        const svg = svgOf(doc, sceneWidth(mirrors), 'rm-gp-scene rm-gp-scene-found');
        for (let frame = 0; frame < 4; frame += 1)
            group(doc, svg, foundFrame(mirrors, scene.chosen, frame), `rm-gp-found rm-gp-found-${frame}`);
        return svg;
    }
    return null;
}
export function buildFailedMirror(doc) {
    const svg = svgOf(doc, BASE_W, 'rm-gp-scene rm-gp-scene-fail');
    group(doc, svg, failFrame(0), 'rm-gp-fail rm-gp-fail-0');
    group(doc, svg, failFrame(1), 'rm-gp-fail rm-gp-fail-1');
    return svg;
}
export function sceneKey(scene) {
    if (!scene)
        return '';
    if (scene.stage === 'fall')
        return 'fall';
    if (scene.stage === 'search')
        return `search:${clampMirrorCount(scene.mirrors)}`;
    return `found:${clampMirrorCount(scene.mirrors)}:${Number(scene.chosen) || 0}`;
}
