import { sceneKit } from '../independentApi/mirrorScene.js?rmv=2.15.5';
const { BASE_W, grid, put, blit, mirror, room, svgOf, group, SMALL, STAR, QUESTION, BANG } = sceneKit;
export const MAINTENANCE_ART_PHASES = Object.freeze(['work', 'ok', 'found', 'unsure']);
export function maintenanceArtPhase(state = '') {
    if (state === 'healthy')
        return 'ok';
    if (state === 'repairable' || state === 'notice')
        return 'found';
    if (state === 'unknown')
        return 'unsure';
    return 'work';
}
const MIRROR_X = 12, MIRROR_Y = 18;
function standing(cells, options = {}) {
    mirror(cells, MIRROR_X, { ...options, cy: MIRROR_Y });
    put(cells, MIRROR_X - 3, 25, 'k');
    put(cells, MIRROR_X + 3, 25, 'k');
}
const WRENCH_UP = '.i.i/.iii/..i./..i./..i./..W.';
const WRENCH_DOWN = 'i...../ii..../.iiiiW/ii..../i.....';
const CHECK = '......vV/.....vV./vV..vV../.vVvV.../..vV....';
function workScene() {
    const base = grid(BASE_W);
    room(base);
    standing(base);
    blit(base, SMALL, 22, 13);
    const up = grid(BASE_W);
    blit(up, WRENCH_UP, 19, 11);
    const down = grid(BASE_W);
    blit(down, WRENCH_DOWN, 17, 15);
    for (const [x, y] of [[16, 13], [15, 15], [16, 18]])
        put(down, x, y, 'Y');
    put(down, 15, 13, 'o');
    return { base, frames: [up, down], seconds: 0.8 };
}
function okScene() {
    const base = grid(BASE_W);
    room(base);
    standing(base, { glow: true });
    blit(base, SMALL, 22, 13);
    blit(base, CHECK, 31, 6);
    const a = grid(BASE_W);
    blit(a, STAR, 4, 7);
    blit(a, STAR, 18, 4);
    const b = grid(BASE_W);
    blit(b, STAR, 5, 12);
    blit(b, STAR, 17, 9);
    return { base, frames: [a, b], seconds: 1.2 };
}
function foundScene() {
    const base = grid(BASE_W);
    room(base);
    standing(base, { crack: true });
    blit(base, SMALL, 22, 13);
    const bang = grid(BASE_W);
    blit(bang, BANG, 35, 7);
    return { base, frames: [bang, grid(BASE_W)], seconds: 1.2 };
}
function unsureScene() {
    const base = grid(BASE_W);
    room(base);
    standing(base, { unlit: true });
    blit(base, SMALL, 22, 13);
    const ask = grid(BASE_W);
    blit(ask, QUESTION, 35, 6);
    return { base, frames: [ask, grid(BASE_W)], seconds: 1.4 };
}
const SCENES = { work: workScene, ok: okScene, found: foundScene, unsure: unsureScene };
export function maintenanceArtCells(phase) { return (SCENES[phase] || SCENES.work)(); }
const templates = new WeakMap();
function template(doc, phase) {
    let byPhase = templates.get(doc);
    if (!byPhase) {
        byPhase = new Map();
        templates.set(doc, byPhase);
    }
    if (byPhase.has(phase))
        return byPhase.get(phase);
    const scene = maintenanceArtCells(phase);
    const svg = svgOf(doc, BASE_W, `rm-gp-scene rm-gp-scene-fix rm-gp-scene-fix-${phase}`);
    group(doc, svg, scene.base, 'rm-gp-err-base');
    const count = scene.frames.length;
    scene.frames.forEach((cells, index) => {
        const node = group(doc, svg, cells, `rm-gp-err-frame rm-gp-err-frame-${index}`);
        const delay = -(((count - index) % count) * scene.seconds / count);
        node.setAttribute('style', `animation:rm-gp-err-${count} ${scene.seconds}s steps(1,end) ${delay.toFixed(3)}s infinite`);
    });
    svg.setAttribute('data-rm-maintenance-art-scene', phase);
    byPhase.set(phase, svg);
    return svg;
}
export const MAINTENANCE_ART_CLASS = 'rabbit-mirror-maintenance-art';
export function syncMaintenanceArt(status, state, { dark = false } = {}) {
    if (!status?.parentNode)
        return null;
    const doc = status.ownerDocument;
    const phase = maintenanceArtPhase(state);
    let art = status.previousElementSibling?.classList?.contains(MAINTENANCE_ART_CLASS) ? status.previousElementSibling : null;
    if (!art) {
        art = doc.createElement('div');
        art.className = MAINTENANCE_ART_CLASS;
        art.setAttribute('aria-hidden', 'true');
        status.before(art);
    }
    if (dark)
        art.setAttribute('data-rm-gp-dark', 'true');
    else
        art.removeAttribute('data-rm-gp-dark');
    if (art.getAttribute('data-rm-maintenance-art-phase') !== phase) {
        art.setAttribute('data-rm-maintenance-art-phase', phase);
        art.replaceChildren(template(doc, phase).cloneNode(true));
    }
    return art;
}
