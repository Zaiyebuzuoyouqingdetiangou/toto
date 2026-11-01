import { sceneKit } from './mirrorScene.js?rmv=2.15.0';
const { BASE_W, grid, put, blit, mirror, room, svgOf, group, SMALL, STAR } = sceneKit;
export const SMALL_SCENES = Object.freeze(['manual', 'cat', 'album']);
function manualScene() {
    const base = grid(BASE_W);
    room(base);
    mirror(base, 13, { cy: 18 });
    put(base, 10, 25, 'k');
    put(base, 16, 25, 'k');
    blit(base, SMALL, 24, 13);
    blit(base, STAR, 18, 6);
    put(base, 6, 9, 'o');
    return { base, frames: [], seconds: 0 };
}
const CAT = '..k......k.../.kIk....kIk../.kIIkkkkIIk../.kIIIIIIIIk../kIcIIIIcIIIk./kIkIIIIkIIIk./kIIIIpIIIIIk./.kIIIIIIIIk../..kIIIIIIIIk./.kIIIIIIIIIIk/.kIIIIIIIIIIk/.kIIIIIIIIIIIk/..kkkkkkkkkkIk/............kk';
function catScene() {
    const base = grid(BASE_W);
    room(base);
    for (let y = 18; y <= 25; y += 1)
        for (let x = 3; x <= 20; x += 1)
            put(base, x, y, y === 18 || y === 25 || x === 3 || x === 20 || x === 11 || x === 12 ? 'k' : 'l');
    blit(base, CAT, 22, 12);
    put(base, 21, 22, 'k');
    put(base, 21, 21, 'I');
    put(base, 21, 20, 'k');
    const lines = [[[5, 20], [6, 20], [7, 20], [8, 20], [9, 20]], [[5, 22], [6, 22], [7, 22], [8, 22]], [[14, 20], [15, 20], [16, 20], [17, 20], [18, 20]]];
    const frames = [1, 2, 3].map(count => {
        const cells = grid(BASE_W);
        for (const line of lines.slice(0, count))
            for (const [x, y] of line)
                put(cells, x, y, 'q');
        const tip = lines[count - 1].at(-1);
        for (let i = 1; i <= 3; i += 1)
            put(cells, tip[0] + i, tip[1] - i, i === 1 ? 'k' : 'c');
        return cells;
    });
    return { base, frames, seconds: 1.5 };
}
function albumScene() {
    const base = grid(BASE_W);
    room(base);
    for (let y = 20; y <= 25; y += 1)
        for (let x = 3; x <= 21; x += 1)
            put(base, x, y, y === 25 ? 'F' : (x === 3 || x === 21 || y === 20) ? 'k' : x === 12 ? 'k' : 'l');
    for (let y = 21; y <= 23; y += 1)
        for (let x = 5; x <= 9; x += 1)
            put(base, x, y, y === 23 ? 'v' : 'j');
    for (let y = 21; y <= 23; y += 1)
        for (let x = 15; x <= 19; x += 1)
            put(base, x, y, y === 21 ? 'c' : 'a');
    blit(base, SMALL, 25, 13);
    const page = points => {
        const cells = grid(BASE_W);
        const filled = new Set(points.map(([x, y]) => `${x},${y}`));
        for (const [x, y] of points)
            for (const [dx, dy] of [[0, -1], [0, 1], [1, 0], [-1, 0]])
                if (!filled.has(`${x + dx},${y + dy}`))
                    put(cells, x + dx, y + dy, 'k');
        for (const [x, y] of points)
            put(cells, x, y, 'l');
        return cells;
    };
    const slope = (fromX, toX) => { const out = []; const steps = Math.abs(toX - fromX); for (let i = 0; i <= steps; i += 1) {
        const x = fromX + Math.sign(toX - fromX) * i;
        const y = 19 - Math.round(i * 0.7);
        out.push([x, y], [x, y + 1]);
    } return out; };
    const upright = [];
    for (let y = 11; y <= 19; y += 1)
        upright.push([12, y], [13, y]);
    return { base, frames: [page(slope(13, 20)), page(upright), page(slope(11, 4))], seconds: 1.2 };
}
const SCENES = { manual: manualScene, cat: catScene, album: albumScene };
export function smallSceneCells(kind) { return (SCENES[kind] || SCENES.manual)(); }
const templates = new WeakMap();
function template(doc, kind) {
    let byKind = templates.get(doc);
    if (!byKind) {
        byKind = new Map();
        templates.set(doc, byKind);
    }
    if (byKind.has(kind))
        return byKind.get(kind);
    const scene = smallSceneCells(kind);
    const svg = svgOf(doc, BASE_W, `rm-gp-scene rm-gp-scene-small rm-gp-scene-small-${kind}`);
    group(doc, svg, scene.base, 'rm-gp-err-base');
    const count = scene.frames.length;
    scene.frames.forEach((cells, index) => {
        const node = group(doc, svg, cells, `rm-gp-err-frame rm-gp-err-frame-${index}`);
        const delay = -(((count - index) % count) * scene.seconds / count);
        node.setAttribute('style', `animation:rm-gp-err-${count} ${scene.seconds}s steps(1,end) ${delay.toFixed(3)}s infinite`);
    });
    svg.setAttribute('data-rm-small-scene', kind);
    byKind.set(kind, svg);
    return svg;
}
export const SMALL_ART_CLASS = 'rabbit-mirror-small-art';
export function buildSmallArt(doc, kind, { dark = false } = {}) {
    const art = doc.createElement('div');
    art.className = `${SMALL_ART_CLASS} ${SMALL_ART_CLASS}-${SMALL_SCENES.includes(kind) ? kind : 'manual'}`;
    art.setAttribute('aria-hidden', 'true');
    art.setAttribute('data-rm-small-art', SMALL_SCENES.includes(kind) ? kind : 'manual');
    if (dark)
        art.setAttribute('data-rm-gp-dark', 'true');
    art.append(template(doc, art.getAttribute('data-rm-small-art')).cloneNode(true));
    return art;
}
