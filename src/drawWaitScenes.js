import { rmR as __rmR } from "./textTable.js?rmv=2.15.0";
import { sceneKit } from './independentApi/mirrorScene.js?rmv=2.15.0';
const { BASE_W, grid, put, blit, room, svgOf, group, SMALL } = sceneKit;
export const DRAW_WAIT_PHASES = Object.freeze(['think', 'queue', 'paint', 'save']);
export function drawWaitPhase(text = '') {
    const value = String(text || '');
    if (__rmR("Bo5_4M0Joy4z4hRxd05FNPg8n8W2aJOfnMjaKn4l", "").test(value))
        return 'think';
    if (__rmR("Dsv9Sckc", "").test(value))
        return 'save';
    if (__rmR("QwqphUkc", "").test(value))
        return 'paint';
    return 'queue';
}
const CANVAS = { x: 4, y: 5, w: 15, h: 12 };
function easel(cells, { blank = true } = {}) {
    const { x, y, w, h } = CANVAS;
    for (let i = 0; i <= 9; i += 1) {
        put(cells, x + 2 - Math.floor(i / 3), y + h + i, 'W');
        put(cells, x + w - 3 + Math.floor(i / 3), y + h + i, 'W');
        put(cells, x + Math.floor(w / 2), y + h + i, 'T');
    }
    for (let i = x - 1; i <= x + w; i += 1) {
        put(cells, i, y + h, 'W');
        put(cells, i, y + h + 1, 'T');
    }
    for (let yy = y; yy < y + h; yy += 1) {
        for (let xx = x; xx < x + w; xx += 1) {
            const edge = yy === y || yy === y + h - 1 || xx === x || xx === x + w - 1;
            put(cells, xx, yy, edge ? 'k' : blank ? 'l' : 'l');
        }
    }
    put(cells, x + Math.floor(w / 2), y - 1, 'W');
    put(cells, x + Math.floor(w / 2), y - 2, 'W');
}
function painting(cells, step) {
    const { x, y, w, h } = CANVAS;
    const inside = (xx, yy) => xx > x && xx < x + w - 1 && yy > y && yy < y + h - 1;
    const paint = (xx, yy, ch) => { if (inside(xx, yy))
        put(cells, xx, yy, ch); };
    if (step >= 1)
        for (let yy = y + 1; yy <= y + 4; yy += 1)
            for (let xx = x + 1; xx < x + w - 1; xx += 1)
                if ((xx + yy) % 7 !== 0)
                    paint(xx, yy, 'j');
    if (step >= 2)
        for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [2, 1], [1, 2]])
            paint(x + w - 5 + dx, y + 2 + dy, 'c');
    if (step >= 3) {
        for (let xx = x + 1; xx < x + w - 1; xx += 1) {
            const top = y + 6 + Math.abs(((xx - x) % 8) - 4) - 2;
            for (let yy = top; yy < y + h - 1; yy += 1)
                paint(xx, yy, yy >= y + h - 4 ? 'v' : 'I');
        }
    }
    if (step >= 4)
        for (const [dx, dy] of [[3, 9], [7, 8], [11, 9]]) {
            paint(x + dx, y + dy, 'x');
            paint(x + dx, y + dy + 1, 'V');
        }
}
function brush(cells, tipX, tipY, color = 'x') {
    for (let i = 0; i < 4; i += 1)
        put(cells, tipX + 1 + i, tipY + 1 + i, i === 3 ? 'k' : 'W');
    put(cells, tipX, tipY, color);
}
const BUBBLE_W = 17, BUBBLE_H = 11;
function thoughtBubble(cells, x0, y0) {
    const cx = x0 + BUBBLE_W / 2 - 0.5, cy = y0 + BUBBLE_H / 2 - 0.5;
    for (let y = y0; y < y0 + BUBBLE_H; y += 1) {
        for (let x = x0; x < x0 + BUBBLE_W; x += 1) {
            const d = ((x - cx) / (BUBBLE_W / 2)) ** 2 + ((y - cy) / (BUBBLE_H / 2)) ** 2;
            if (d <= 0.78)
                put(cells, x, y, 'l');
            else if (d <= 1.02)
                put(cells, x, y, 'k');
        }
    }
}
function sketch(cells, x0, y0, step) {
    if (step >= 1)
        for (const [dx, dy] of [[11, 2], [12, 2], [10, 3], [11, 3], [12, 3], [13, 3], [11, 4], [12, 4]])
            put(cells, x0 + dx, y0 + dy, 'c');
    if (step >= 2)
        for (let dx = 3; dx <= 13; dx += 1) {
            const top = 7 - Math.max(0, 2 - Math.abs(dx - 6));
            for (let dy = top; dy <= 8; dy += 1)
                put(cells, x0 + dx, y0 + dy, dy === top ? 'k' : 'I');
        }
    if (step >= 3) {
        for (const dy of [5, 6, 7])
            put(cells, x0 + 10, y0 + dy, 'W');
        for (const [dx, dy] of [[9, 4], [10, 4], [11, 4], [10, 3]])
            put(cells, x0 + dx, y0 + dy, 'v');
    }
}
function thinkScene() {
    const base = grid(BASE_W);
    room(base);
    const rabbitX = 6;
    blit(base, SMALL, rabbitX, 13, true);
    put(base, rabbitX + 15, 11, 'k');
    put(base, rabbitX + 17, 8, 'k');
    put(base, rabbitX + 18, 8, 'k');
    const bx = 22, by = 0;
    thoughtBubble(base, bx, by);
    const frames = [1, 2, 3, 0].map(step => { const cells = grid(BASE_W); sketch(cells, bx, by, step); return cells; });
    return { base, frames, seconds: 3.2 };
}
function queueScene() {
    const base = grid(BASE_W);
    room(base);
    easel(base, { blank: true });
    const frames = [0, 1, 2, 3].map(index => {
        const cells = grid(BASE_W);
        const hop = index % 2 === 1 ? 1 : 0;
        blit(cells, SMALL, 25, 13 - hop);
        brush(cells, 22, 18 - hop, 'j');
        for (let dot = 0; dot < Math.min(index, 3); dot += 1)
            put(cells, 31 + dot * 2, 9, 'q');
        return cells;
    });
    return { base, frames, seconds: 2.4 };
}
function paintScene() {
    const base = grid(BASE_W);
    room(base);
    easel(base, { blank: true });
    blit(base, SMALL, 24, 13);
    const colors = ['j', 'c', 'I', 'x'];
    const frames = [1, 2, 3, 4].map((step, index) => {
        const cells = grid(BASE_W);
        painting(cells, step);
        brush(cells, 18, index % 2 ? 11 : 14, colors[index]);
        return cells;
    });
    return { base, frames, seconds: 2.4 };
}
function saveScene() {
    const base = grid(BASE_W);
    room(base);
    easel(base, { blank: true });
    painting(base, 4);
    blit(base, SMALL, 24, 13);
    const { x, y, w, h } = CANVAS;
    const cloth = (cells, upTo) => { for (let yy = y; yy < y + h; yy += 1)
        for (let xx = x; xx < Math.min(x + w, upTo); xx += 1)
            put(cells, xx, yy, (xx + yy) % 4 === 0 ? 'I' : 'i'); };
    const covered = grid(BASE_W);
    cloth(covered, x + w);
    const half = grid(BASE_W);
    cloth(half, x + 7);
    const shown = grid(BASE_W);
    for (const [dx, dy] of [[-2, -2], [w + 1, 0], [w + 2, h - 3], [-2, h - 1]])
        put(shown, x + dx, y + dy, 'o');
    for (const [dx, dy] of [[0, 0], [1, 1], [-1, 1], [0, 2], [0, 1]])
        put(shown, x + w + 2 + dx, y - 3 + dy, 'Y');
    return { base, frames: [covered, half, shown, shown], seconds: 2 };
}
const SCENES = { think: thinkScene, queue: queueScene, paint: paintScene, save: saveScene };
export function drawWaitCells(phase) { return (SCENES[phase] || SCENES.queue)(); }
const templates = new WeakMap();
function template(doc, phase) {
    let byPhase = templates.get(doc);
    if (!byPhase) {
        byPhase = new Map();
        templates.set(doc, byPhase);
    }
    if (byPhase.has(phase))
        return byPhase.get(phase);
    const scene = drawWaitCells(phase);
    const svg = svgOf(doc, BASE_W, `rm-gp-scene rm-gp-scene-draw rm-gp-scene-draw-${phase}`);
    group(doc, svg, scene.base, 'rm-gp-err-base');
    const count = scene.frames.length;
    scene.frames.forEach((cells, index) => {
        const node = group(doc, svg, cells, `rm-gp-err-frame rm-gp-err-frame-${index}`);
        const delay = -(((count - index) % count) * scene.seconds / count);
        node.setAttribute('style', `animation:rm-gp-err-${count} ${scene.seconds}s steps(1,end) ${delay.toFixed(3)}s infinite`);
    });
    svg.setAttribute('data-rm-draw-wait-scene', phase);
    svg.style.removeProperty('width');
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    byPhase.set(phase, svg);
    return svg;
}
const observers = new WeakMap();
function watch(art) {
    const doc = art.ownerDocument, View = doc?.defaultView?.IntersectionObserver;
    if (typeof View !== 'function')
        return;
    let observer = observers.get(doc);
    if (!observer) {
        observer = new View(entries => {
            for (const entry of entries) {
                if (!entry.target.isConnected) {
                    observer.unobserve(entry.target);
                    continue;
                }
                if (entry.isIntersecting)
                    entry.target.removeAttribute('data-rm-offscreen');
                else
                    entry.target.setAttribute('data-rm-offscreen', 'true');
            }
        });
        observers.set(doc, observer);
    }
    observer.observe(art);
}
export const DRAW_WAIT_ART_CLASS = 'rabbit-mirror-draw-wait-art';
export function buildDrawWaitArt(doc, phase, { dark = false } = {}) {
    const art = doc.createElement('div');
    art.className = DRAW_WAIT_ART_CLASS;
    art.setAttribute('aria-hidden', 'true');
    art.setAttribute('data-rm-draw-wait-phase', DRAW_WAIT_PHASES.includes(phase) ? phase : 'queue');
    if (dark)
        art.setAttribute('data-rm-gp-dark', 'true');
    art.append(template(doc, art.getAttribute('data-rm-draw-wait-phase')).cloneNode(true));
    watch(art);
    return art;
}
export function syncDrawWaitArt(art, phase) {
    const next = DRAW_WAIT_PHASES.includes(phase) ? phase : 'queue';
    if (!art || art.getAttribute('data-rm-draw-wait-phase') === next)
        return art;
    art.setAttribute('data-rm-draw-wait-phase', next);
    art.querySelector('svg')?.replaceWith(template(art.ownerDocument, next).cloneNode(true));
    return art;
}
