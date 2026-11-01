import { rmR as __rmR } from "../textTable.js?rmv=2.12.1";
import { buildFailedMirror, sceneKit } from './mirrorScene.js?rmv=2.12.1';
const { BASE_W, grid, put, blit, mirror, room, waitGround, svgOf, group, BIG, SMALL, STAR, QUESTION, BANG, WAIT_EYES, MIRROR_RX, MIRROR_RY } = sceneKit;
export const ERROR_SCENE_KINDS = Object.freeze(['network', 'auth', 'quota', 'busy', 'blocked', 'cut', 'garbled', 'local', 'rest', 'crash']);
const RULES = [
    ['rest', __rmR("kO6v35F68dSSgW3eJStAY.FxxjfmmPRh7iElmPa.4h7xFFm70CHGvYzXcXg8spmgFGfLHLYncUp0ECgxW1ASCO6jii7qt87aqg7tBU5Y9YDRmFLm5x4nH58jtJukOPw4GrqM7Kzb_FyqoYlyJJ_drgP9WqB", "")],
    ['blocked', __rmR("RkdzxBvEAjl9xW4TgCoOUsK9iLQQjuzUDc.aIhWEoQHWS58J6uLTmLjRN4YKxX7FoMjbK8UD69SAidjRpzs8BBkCpfsCIImrxes.RRvpFkh9LSdg9.ed20xmyRS5yuExHfAP71bKHqxrb2wldhLmEdUXwPEwmQfQTs28H2yC5Wwpj8FusSRZXMqw5EvBs3RhCHaXEuUL3.Rb5KELbO4ei8QlFT7C57qLSNcKUPmfbnleKs0fUmj92hw20PA", "i")],
    ['quota', __rmR("Fg_lDAfe.HkaRBKSUI_aWnSz9V9YWK50oS4HZ5yxYChINWR858ERuOMpaYrJlZC3pf3gTS3ZKQ6fMxCjJGlSPR27m9o6fRuhYU_HnJTEr76cpryvXPBOFAcvNh8RQwEurkPxeZawHP18Rj0tlJzMliklAkwH6evOsw0bzo7E7D5avbPNyOVAR.lHucVM54HpsL_O8K88eFCDPgsd3AO09dOrwq54qca_nDwdDfRtM_BHshVYfAobPAOUSXpSYpZCr21WFV6GpvwV_.KKdlOMNochbgFwCq8X0KGJbwfxkTTrS_cik1QSuv.idYEJC5hDwjkCDo_d8ZfVso6lT01jBWhdJ7hDh1AbMZizWcqSzlZsEiAAvAugoNtzsQDNGujzg1.txfBjSzKxgtEyLyWS61Nd", "i")],
    ['busy', __rmR("lPNvK4RWdKXvMM_WoHBG0Lbu2TvR0NyKBBkovIxth.Y0ZSegvFApEeaAfb83U5joBBDvt1DH1fTcBG.7vMCCESDuIAeBgdFKWMXjmNuJ_SAuq5qoF9p6Cb9.GsCrRjtO0HFBtfbGqp8644C5aSCCD8OEh7ycuNYciQn9G3ydIIvxK2Bt8bfGAqDKjUY", "i")],
    ['auth', __rmR("V_UmzU1j88vMAa6V6oo4W4w3tzlQsvugjqPk_vR8A7SzQFBDce0Bd.RMXYy7kvPjbMUCh1tZpxknhrbSn_P0aNBSGDzz3OSvkHdoN.JLUsRQ2owqFZ2Ce6WCXQaYLqT5zZzhy4U4_DbHDs0uSMpn61ngjbJEUCxPTzIIndopr__JQe3PnpZcPCwQLfIYdAQhwkQYw5QssfI3vgA6y6Wr0W0M05hjyY0D41_WBaiEf0jSFFrWlpnFtDxYyVK0NmyIRlE", "i")],
    ['local', __rmR("yVMvK6wtGUHT91m3.v2AwSRREigrxQFQYtDECXzaZ.8f.NTB563WdNXTiMnnw4Jnp2DDuf1NLNXYYyG3NWXhUJvg79PdjNzftgONMfy0cUYYMf", "")],
    ['cut', __rmR("2tqermnTy9iTqDXQcg3uKbmcFUys5kbqejBZ2UWqCOPVjya5X.ed74x1kkSRzTO01IhJoqt7Le1rO9jIkaRnjU_G5t7Npfsl.CRy2httOaQh2LLN7gxls53VJmqKYP5LvQgrFcrqVbh", "i")],
    ['network', __rmR("6CuKSY7FZMkYYzWpvJ5LI4H6ziZT.cSQ7p8K03z0D803W7jq6uDBqAxtreGL92dudbckrsUXx53ZT4.rbeTNIouwkw0f2J.CBB.wgrPmvNOalN1wc39R12uFzI5fbqsPx75XviFWyrSkmpwCDVG3.bytPFd7kz5Hc_4G_qhzlXqaXGmKs26eT5nvIgGoKj6GdCWZiRoN5d9z9h", "i")],
    ['garbled', __rmR("YRpVbb_kX8qxhI7zRQNT8bOfGa.bqyiKsiTiPMtry6QwrVrAjwpmcGwWB1fzmyD.jysA7wRxkk5DyBBkYtO.8j8uQTiQ3ZYB0MKbC_D.uYK30_aVFEfGCY0SaPv6iUFHFmN7.UwG4vQjNM3hCYK6LG3E1A4tk.F3c8bY52eVVvDuoHmZLRujxLnkZ1k", "")],
];
export function errorSceneKind(text = '') {
    const message = String(text || '');
    for (const [kind, pattern] of RULES)
        if (pattern.test(message))
            return kind;
    return 'crash';
}
const STAND_CY = 18;
function standingMirror(cells, cx, options = {}) {
    mirror(cells, cx, { ...options, cy: STAND_CY });
    put(cells, cx - 3, 25, 'k');
    put(cells, cx + 3, 25, 'k');
}
function inGlass(x, y, cx, cy = STAND_CY) {
    return ((x - cx) / (MIRROR_RX - 0.6)) ** 2 + ((y - cy) / (MIRROR_RY - 0.6)) ** 2 <= 1;
}
const CROSS = 'x.x/.x./x.x';
const PAW = 'kk./rrk/kk.';
const LOCK = '..kkk../.k...k./.k...k./kkkkkkk/kgggggk/kggkggk/kgggggk/kkkkkkk';
const KEY = '.kkk..../kgggkkkk/kg.gggggk/kgggk.kk./.kkk....';
const PURSE_DOWN = '...kkkkkk.../..kSSSSSSk../.kSssssssSk./kSsssssssSSk/kssssggsssSk/kssssssssssk/.kssssssssk./..kkSssSkk../....kggk..../...k.kk.k...';
const SPOOL = 'kkkkkkk/kTTTTTk/.kkWkk./..kWk../..kWk../.kkWkk./kTTTTTk/kkkkkkk';
const SUITCASE = '....kkkkk..../....k...k..../kkkkkkkkkkkkk/kffffffffffFk/kffffffffffFk/kkkkkkgkkkkkk/kffffffffffFk/kffffffffffFk/kFFFFFFFFFFFk/kkkkkkkkkkkkk';
const DROP = '.j./jjj/.j.';
const ZZ = 'qqqq/..q./.q../qqqq';
const Z = 'qqq/.q./qqq';
const BUBBLE = '..kkkkkkkk../.kllllllllk./kllllllllllk/.kllllllllk./..kkkkkkkk../...kk......./..k.........';
function networkScene() {
    const base = grid(BASE_W);
    room(base);
    standingMirror(base, 15, { unlit: true });
    blit(base, SMALL, 24, 13);
    const knock = () => { const cells = grid(BASE_W); blit(cells, PAW, 21, 18); for (const [x, y] of [[19, 14], [20, 13], [23, 14], [24, 13]])
        put(cells, x, y, 'q'); return cells; };
    const ask = grid(BASE_W);
    blit(ask, QUESTION, 37, 7);
    return { base, frames: [knock(), grid(BASE_W), knock(), ask], seconds: 2 };
}
function authScene() {
    const base = grid(BASE_W);
    room(base);
    standingMirror(base, 15);
    blit(base, SMALL, 28, 13);
    const frame = (shift, turned) => {
        const cells = grid(BASE_W);
        blit(cells, LOCK, 12 + shift, 15);
        blit(cells, KEY, 18, 18, true);
        if (turned) {
            blit(cells, CROSS, 19, 10);
            blit(cells, CROSS, 9, 9);
        }
        return cells;
    };
    return { base, frames: [frame(0, false), frame(-1, true), frame(0, false), frame(1, true)], seconds: 1.6 };
}
function quotaScene() {
    const base = grid(BASE_W);
    room(base);
    blit(base, SMALL, 24, 13);
    const frame = (dx, dust, drop) => {
        const cells = grid(BASE_W);
        blit(cells, PURSE_DOWN, 11 + dx, 9);
        for (const [x, y] of dust)
            put(cells, x, y, 'n');
        if (drop)
            blit(cells, DROP, 24, 9);
        return cells;
    };
    return { base, frames: [frame(0, [[16, 20]], false), frame(1, [[15, 22], [18, 21]], true), frame(0, [[16, 24], [19, 23]], false), frame(1, [[17, 21]], true)], seconds: 1.6 };
}
function hourglass(cells, fill) {
    const cx = 14, top = 12;
    for (let x = cx - 4; x <= cx + 4; x += 1) {
        put(cells, x, top, 'k');
        put(cells, x, top + 1, x === cx - 4 || x === cx + 4 ? 'k' : 'g');
        put(cells, x, top + 12, x === cx - 4 || x === cx + 4 ? 'k' : 'g');
        put(cells, x, top + 13, 'k');
    }
    const half = [3, 3, 2, 1, 0, 0, 1, 2, 3, 3];
    const topSand = Math.max(0, 4 - fill), bottomSand = Math.min(4, fill + 1);
    half.forEach((w, i) => {
        const y = top + 2 + i;
        put(cells, cx - 4, y, 'G');
        put(cells, cx + 4, y, 'G');
        put(cells, cx - w - 1, y, 'k');
        put(cells, cx + w + 1, y, 'k');
        for (let x = cx - w; x <= cx + w; x += 1) {
            const sandTop = i < 5 && i >= 5 - topSand;
            const sandBottom = i >= 5 && i >= 10 - bottomSand;
            put(cells, x, y, sandTop || sandBottom ? 'c' : 'a');
        }
    });
    put(cells, cx, top + 7 + (fill % 2), 'c');
}
function busyScene() {
    const base = grid(BASE_W);
    room(base);
    blit(base, SMALL, 24, 13);
    const frames = [0, 1, 2, 3].map(fill => {
        const cells = grid(BASE_W);
        hourglass(cells, fill);
        return cells;
    });
    for (const cells of frames)
        blit(cells, BUBBLE, 28, 4);
    frames.forEach((cells, index) => { for (let dot = 0; dot <= Math.min(index, 2); dot += 1)
        put(cells, 31 + dot * 2, 6, 'k'); });
    return { base, frames, seconds: 2.4 };
}
function blockedScene() {
    const base = grid(BASE_W);
    room(base);
    standingMirror(base, 15);
    for (let k = 0; k <= 8; k += 1) {
        const dx = Math.round(k * 6 / 8);
        for (const x of [15 - 3 + dx, 15 + 3 - dx]) {
            put(base, x, STAND_CY - 4 + k, 'x');
            put(base, x + 1, STAND_CY - 4 + k, 'X');
        }
    }
    blit(base, SMALL, 24, 13);
    const bang = grid(BASE_W);
    blit(bang, BANG, 37, 8);
    return { base, frames: [bang, grid(BASE_W)], seconds: 1.2 };
}
function cutScene() {
    const base = grid(BASE_W);
    room(base);
    for (let x = 0; x <= 24; x += 1) {
        put(base, x, 22, 'k');
        put(base, x, 23, 'l');
        put(base, x, 24, 'l');
        put(base, x, 25, 'k');
    }
    for (let x = 1; x <= 15; x += 1)
        if (x % 3 !== 2)
            put(base, x, 23, 'w');
    put(base, 16, 24, 'w');
    put(base, 17, 24, 'w');
    blit(base, SMALL, 27, 13);
    const a = grid(BASE_W);
    blit(a, SPOOL, 18, 14);
    blit(a, QUESTION, 26, 7);
    const b = grid(BASE_W);
    blit(b, SPOOL, 19, 14);
    return { base, frames: [a, b], seconds: 1.4 };
}
function garbledScene() {
    const base = grid(BASE_W);
    room(base);
    standingMirror(base, 15);
    blit(base, SMALL, 24, 13);
    const noise = ['x', 'c', 'w', 'i', 'h', 'Y', 'j', 'a', 'I', 'n'];
    const frames = [0, 1, 2].map(seed => {
        const cells = grid(BASE_W);
        for (let y = STAND_CY - 5; y <= STAND_CY + 5; y += 1) {
            for (let x = 10; x <= 20; x += 1) {
                if (!inGlass(x, y, 15))
                    continue;
                const band = Math.floor((x + seed * 3) / 2) * 7 + y * 3 + seed * 5;
                put(cells, x, y, noise[(band * 13 + (y % 2 ? seed : 0)) % noise.length]);
            }
        }
        if (seed !== 1)
            blit(cells, QUESTION, 37, 7);
        return cells;
    });
    return { base, frames, seconds: 0.9 };
}
function localScene() {
    const base = grid(BASE_W);
    waitGround(base);
    const frame = (push, drop) => {
        const cells = grid(BASE_W);
        blit(cells, SMALL, 9 + push, 10, true);
        blit(cells, SUITCASE, 23 + push, 14);
        if (drop)
            blit(cells, DROP, 7 + push, 8);
        return cells;
    };
    return { base, frames: [frame(0, false), frame(1, true), frame(0, false), frame(1, false)], seconds: 1.6 };
}
function restScene() {
    const base = grid(BASE_W);
    waitGround(base);
    blit(base, BIG, 4, 3, true);
    for (const [x, y] of WAIT_EYES)
        put(base, x, y, y === 13 ? 'k' : 'r');
    const frames = [[[22, 9]], [[24, 5], [21, 10]], [[27, 1], [24, 6], [21, 10]]].map(spots => {
        const cells = grid(BASE_W);
        spots.forEach(([x, y], index) => blit(cells, index === 0 && spots.length > 1 ? ZZ : Z, x, y));
        return cells;
    });
    return { base, frames, seconds: 2.7 };
}
const SCENES = { network: networkScene, auth: authScene, quota: quotaScene, busy: busyScene, blocked: blockedScene, cut: cutScene, garbled: garbledScene, local: localScene, rest: restScene };
export function errorSceneCells(kind) {
    return SCENES[kind]?.() || null;
}
const templates = new WeakMap();
function sceneTemplate(doc, kind) {
    let byKind = templates.get(doc);
    if (!byKind) {
        byKind = new Map();
        templates.set(doc, byKind);
    }
    if (byKind.has(kind))
        return byKind.get(kind);
    let svg;
    const scene = errorSceneCells(kind);
    if (!scene) {
        svg = buildFailedMirror(doc);
        const stars = [[[14, 10], [19, 9], [24, 11]], [[16, 8], [22, 10], [12, 12]]];
        stars.forEach((spots, index) => {
            const cells = grid(BASE_W);
            for (const [x, y] of spots)
                blit(cells, STAR, x, y);
            const node = group(doc, svg, cells, `rm-gp-err-stars rm-gp-err-stars-${index}`);
            node.setAttribute('style', `animation-delay:${1 + index * 0.4}s`);
        });
    }
    else {
        svg = svgOf(doc, BASE_W, `rm-gp-scene rm-gp-scene-err rm-gp-scene-err-${kind}`);
        group(doc, svg, scene.base, 'rm-gp-err-base');
        const count = scene.frames.length;
        scene.frames.forEach((cells, index) => {
            const node = group(doc, svg, cells, `rm-gp-err-frame rm-gp-err-frame-${index}`);
            const delay = -(((count - index) % count) * scene.seconds / count);
            node.setAttribute('style', `animation:rm-gp-err-${count} ${scene.seconds}s steps(1,end) ${delay.toFixed(3)}s infinite`);
        });
    }
    svg.setAttribute('data-rm-error-scene', kind);
    byKind.set(kind, svg);
    return svg;
}
export const ERROR_ART_PLAY_MS = 12000;
function play(art, playMs) {
    art.removeAttribute('data-rm-err-rest');
    clearTimeout(art.__rmErrRestTimer);
    art.__rmErrRestTimer = setTimeout(() => art.setAttribute('data-rm-err-rest', 'true'), playMs);
}
export function buildErrorArt(doc, { text = '', kind = errorSceneKind(text), dark = false, playMs = ERROR_ART_PLAY_MS } = {}) {
    const art = doc.createElement('div');
    art.className = 'rabbit-mirror-external-error-art';
    art.setAttribute('aria-hidden', 'true');
    art.setAttribute('data-rm-error-kind', kind);
    if (dark)
        art.setAttribute('data-rm-gp-dark', 'true');
    art.append(sceneTemplate(doc, ERROR_SCENE_KINDS.includes(kind) ? kind : 'crash').cloneNode(true));
    art.addEventListener('click', event => {
        if (!art.hasAttribute('data-rm-err-rest'))
            return;
        event.preventDefault();
        event.stopPropagation();
        const svg = art.querySelector('svg');
        if (svg)
            svg.replaceWith(svg.cloneNode(true));
        play(art, playMs);
    });
    play(art, playMs);
    return art;
}
