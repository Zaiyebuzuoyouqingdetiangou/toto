import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=2.6.3";
import { spritePaths } from '../pixelSprites.js?rmv=2.6.3';
import { interactionDisplayKeys, interactionDisplayName } from '../interactionMethods.js?rmv=2.6.3';
import { parseSelfInvented } from '../interactionMethodLedger.js?rmv=2.6.3';
import { buildMirrorScene, clampMirrorCount, sceneKey, seekerX } from './mirrorScene.js?rmv=2.6.3';
export const GENERATION_PROGRESS_ATTR = 'data-rabbit-mirror-generation-progress';
export const GENERATION_PROGRESS_MINI_ATTR = 'data-rabbit-mirror-generation-progress-mini';
const CARD_CLASS = 'rabbit-mirror-generation-progress';
const MINI_CLASS = 'rabbit-mirror-generation-progress-mini';
const PLACEHOLDER_SELECTOR = ':scope > details.rabbit-mirror-external-placeholder';
const RESAY_STATUS_SELECTOR = ':scope > [data-rabbit-mirror-resay-status="true"]';
const MAX_LINES = 5;
const isPinnedLine = line => line.key === 'self' || line.key === 'ticket' || (line.key === 'think' && line.state === 'note');
function progressPicks(face, state, menuIndex) {
    const picks = [];
    if (!face)
        return picks;
    if (face.self?.form)
        picks.push(`${__rmT("7hbuZvUYk5ZycoOckGD")}${shortText(face.self.form, 24)}${__rmT("Yvk")}${face.self.theme ? `${__rmT("4bF.jaFygRhyXXG1")}${shortText(face.self.theme, 24)}${__rmT("Yvk")}` : ''}`);
    if (face.ticket) {
        const label = (state.faceMenuLabels?.[menuIndex] || [])[face.ticket - 1];
        picks.push(`${__rmT("LJ055WPSHKG")}${face.ticket}${__rmT("qGtZ0Tlk")}${label ? `${__rmT("YSk")}${shortText(label, 12)}${__rmT("Yvk")}` : ''}`);
    }
    if (face.think)
        picks.push(`${__rmT("8Xl3jLop")}${face.think}`);
    return picks;
}
const DEFAULT_FACE_CHARS = 12000;
const MIN_FACE_CHARS = 4000;
const MAX_FACE_CHARS = 40000;
const STORED_TO_RAW = 0.75;
const SPRITE_W = 42;
const SPRITE_H = 30;
const NEEDLE_X = 3;
const SPRITE_COMMON = '..............................kk...k/.............................kpRk.kR/.............................kprk.kprk/.............................kprk.kprk/.............................kprk.kprk/.............................kprkkkprk/..........kkk...............kkrrrrrrrkk/.........kcCck.............krrrrrrrrrrrk/...ccccccccCck............krrrrrrrrrrrRRk/...c......kSk.............kreerrrrrrrrRRk/...ckkkkkkkkkkkkkkkkkkkk.krrekrrrrrrrrRRk/..kmnnnnnnnnnnnnnnnmk..skkprrrrrrrrrrrRRk/.kmmgmmmgmmmgmmmmmmmk.kSk.kbbrrrrrrrrRRk/.kmmmmmmmmmmmmmmmmmmks..k..kkrrrrrrrRRkk/.kmmmmkkkkkkkkkkkkmmmkkkkk..krrrrrrrRRRk/.kmmmk...........kmmmkrrrk.krrrrrrrrRRRRk/..kmk............kmgkrrrRkkrrrrrrrrrRRRRk/..k.k............kmmkkkkk.krrrrrrrrrRRRRRk/.km.mmmmmmgggggmmmmmmmmmk.krrrrrrrrRRRRRkk/.kk.kkkkkkkkkkkkkkkkkkkkk..kkrrrrrRRRRRkrk/kwwwwwwwwwwwwwwwwwwwwwwwwk...kkkkkkkkkkkk/kWWWWWWWWWWWWWWWWWWWWkkkWkkkkkkkkkkkkkkkk/...iI...........iI........ttttttttttttttt/...iI...........iI........TTTTTTTTTTTTTTT/...iIiiiiiiiiiiiiI..........T.........T/...iI...........iI..........T.........T/...iI...........iI..........T.........T/...iI...........iI..........TTTTTTTTTTT/...iI...........iI..........T.........T/..kkkkk........kkkkk........T.........T';
const SPRITE_FRAME_A = '..................................k/....................................k//////////.....................sS/.....................S/......................Ss////...S/...s/...s///......................krrk/......................krRk/.....................krrRk/...................krrrRk/...........kkkkkkk.kkkkkk/...........SSSSSSSkSSSSSSS/...........kkkkkk..kkkkkkk/';
const SPRITE_FRAME_B = '....................................k/....................................Rk//////////.....................Ss/.....................s/......................sS////...s/...m/...k///......................krrk/....................krrrRk/....................kkkkkk/.................kkkkkkkkk/..........kkkkkkSSSSSSSSSk/..........SSSSSSkkkkkkkkk/..........kkkkkk/';
const SPRITE_BUBBLE = '..kkkkkkk/.krrrrrrrk/krrrrrrrrrk/.krrrrrrrk/..kkkkkkkrk/........kk';
const BUBBLE_AT = [14, 0];
const BUBBLE_DOTS = [[3, 2], [5, 2], [7, 2]];
const SPRITE_SPARKLE = '..g/..g/ggsgg/..g/..g';
const SPARKLE_AT = [0, 3];
const SPRITE_COLORS = Object.freeze({
    k: ['ink', '#3a2e33'], m: ['body', '#4d4855'], n: ['body-hi', '#6e6878'], g: ['gold', '#d9b25e'],
    s: ['steel', '#d7dbe2'], S: ['steel-dk', '#9ba1ab'], w: ['wood', '#c4956a'], W: ['wood-dk', '#94683f'],
    i: ['iron', '#4b4a55'], I: ['iron-hi', '#77768a'], r: ['fur', '#fdf8f4'], R: ['fur-dk', '#e7ddd7'],
    p: ['pink', '#f2a7ba'], b: ['blush', '#f7c6d1'], e: ['eye', '#2c2226'], t: ['stool', '#dcb68c'],
    T: ['stool-dk', '#ad8660'], c: ['thread', '#c97a8a'], C: ['thread-dk', '#a35a6b'],
});
const SVG_NS = 'http://www.w3.org/2000/svg';
function spriteRows(value) { return String(value || '').split('/'); }
function appendSpriteGroup(doc, parent, encoded, className, [ox, oy] = [0, 0]) {
    const group = doc.createElementNS(SVG_NS, 'g');
    if (className)
        group.setAttribute('class', className);
    if (ox || oy)
        group.setAttribute('transform', `translate(${ox} ${oy})`);
    const rows = spriteRows(encoded);
    const palette = new Map(Object.keys(SPRITE_COLORS).map(letter => [letter, letter]));
    for (const { color: letter, d } of spritePaths(rows, palette)) {
        const [name, fill] = SPRITE_COLORS[letter];
        const path = doc.createElementNS(SVG_NS, 'path');
        path.setAttribute('class', `rm-gp-px-${name}`);
        path.setAttribute('fill', fill);
        path.setAttribute('d', d);
        group.append(path);
    }
    parent.append(group);
    return group;
}
export function buildSewingSprite(doc, scale = 2) {
    const svg = doc.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'rm-gp-sprite');
    svg.setAttribute('viewBox', `0 0 ${SPRITE_W} ${SPRITE_H}`);
    svg.setAttribute('width', String(SPRITE_W * scale));
    svg.setAttribute('height', String(SPRITE_H * scale));
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    appendSpriteGroup(doc, svg, SPRITE_COMMON, 'rm-gp-base');
    appendSpriteGroup(doc, svg, SPRITE_FRAME_A, 'rm-gp-frame-a');
    appendSpriteGroup(doc, svg, SPRITE_FRAME_B, 'rm-gp-frame-b');
    const bubble = appendSpriteGroup(doc, svg, SPRITE_BUBBLE, 'rm-gp-bubble', BUBBLE_AT);
    BUBBLE_DOTS.forEach(([x, y], index) => {
        const dot = doc.createElementNS(SVG_NS, 'rect');
        dot.setAttribute('class', `rm-gp-dot rm-gp-dot-${index + 1}`);
        dot.setAttribute('x', String(x));
        dot.setAttribute('y', String(y));
        dot.setAttribute('width', '1');
        dot.setAttribute('height', '1');
        dot.setAttribute('fill', SPRITE_COLORS.k[1]);
        bubble.append(dot);
    });
    appendSpriteGroup(doc, svg, SPRITE_SPARKLE, 'rm-gp-sparkle', SPARKLE_AT);
    return svg;
}
function newFace(startAt = 0) {
    return { startAt, summaryAt: -1, title: '', styleAt: -1, palette: null, threadHint: '', keyframes: 0, uis: [], details: 0, ticket: 0, closed: false, selfAt: -1, self: null, think: '' };
}
function newRequest() {
    return { sentAt: 0, headersAt: 0, firstTextAt: 0, completeAt: 0, chars: 0, text: '', frames: 0, textBase: null, parse: { pos: 0, faces: [newFace(0)] } };
}
function clampFaceCount(value, fallback = 1) {
    const count = Number(value);
    return Number.isInteger(count) && count >= 1 ? Math.min(count, 12) : fallback;
}
export function createProgressState({ faceCount = 1, expectedFaceChars = 0, now = Date.now() } = {}) {
    const perFace = Number(expectedFaceChars);
    return {
        startedAt: now,
        faceCount: clampFaceCount(faceCount),
        attemptFaceCount: clampFaceCount(faceCount),
        expectedFaceChars: Number.isFinite(perFace) && perFace > 0 ? Math.min(MAX_FACE_CHARS, Math.max(MIN_FACE_CHARS, perFace)) : DEFAULT_FACE_CHARS,
        retry: 0,
        drawText: '',
        faceMenuLabels: [],
        facePicks: [],
        sceneFoundAt: 0,
        sceneChosen: -1,
        sceneDone: false,
        serial: null,
        accepted: new Map(),
        request: newRequest(),
        finishingAt: 0,
        shown: 0,
    };
}
const labelTitle = label => String(label || '').split(__rmT("7ys"))[0].replace(/^\S+\s+(?=\S)/, '').replace(/\s+/g, ' ').trim();
function shortText(value, limit) {
    const chars = [...String(value || '').replace(/\s+/g, ' ').trim()];
    return chars.length > limit ? `${chars.slice(0, limit - 1).join('')}…` : chars.join('');
}
export function noteProgressSelection(state, diagnostic) {
    if (!state || !diagnostic || typeof diagnostic !== 'object')
        return;
    const faces = Array.isArray(diagnostic.faces) ? diagnostic.faces : [];
    state.faceMenuLabels = (faces.length ? faces : [diagnostic]).map(face => (Array.isArray(face?.atmosphereMenu) && face.atmosphereMenu.length > 1
        ? face.atmosphereMenu.map(ticket => labelTitle((Array.isArray(ticket?.formatLines) ? ticket.formatLines : [])[0]))
        : []));
    state.facePicks = (faces.length ? faces : [diagnostic]).map(face => Number(face?.designCandidatePick ?? (faces.length ? 0 : diagnostic.designCandidatePick)) || 0);
    if (faces.length > 1) {
        state.drawText = `${__rmT("X39tSec6")}${faces.length}${__rmT("N_isVKgwXNp")}`;
        return;
    }
    const menu = state.faceMenuLabels[0] || [];
    if (menu.length > 1) {
        state.drawText = `${__rmT("htSWhcc6")}${menu.length}${__rmT("wHJrOEtWJPyc89pq8n2ZPUw22wT")}`;
        return;
    }
    const face = faces[0] || diagnostic;
    if ((face?.samplingMode || diagnostic.samplingMode) === 'self_invent') {
        state.drawText = __rmT("WzGXrD65dmbY5HQaaNnLHCOozjB6YT2vWmE");
        return;
    }
    const titles = list => (Array.isArray(list) ? list : []).map(labelTitle).filter(Boolean);
    const formats = titles(face?.formatLabels ?? diagnostic.formatLabels);
    const themes = titles(face?.themeLabels ?? diagnostic.themeLabels);
    if (formats.length > 1 || themes.length > 2) {
        state.drawText = __rmT("nHJ0a34jXNp");
        return;
    }
    const parts = [...formats, ...themes].map(title => `${__rmT("YSk")}${shortText(title, 12)}${__rmT("Yvk")}`);
    state.drawText = parts.length ? `${__rmT("l9gPjf")}${parts.join('×')}` : '';
}
export function noteProgressAttempt(state, { retry = 0, faceCount } = {}, now = Date.now()) {
    if (!state)
        return;
    const count = Number(retry);
    state.retry = Number.isInteger(count) && count > 0 ? count : 0;
    if (state.retry) {
        state.request = newRequest();
        state.serial = null;
        state.accepted = new Map();
        state.finishingAt = 0;
        state.shown = 0;
        state.attemptStartedAt = now;
        state.firstSentAt = 0;
        state.firstTextAt = 0;
    }
    state.attemptFaceCount = clampFaceCount(faceCount, state.faceCount);
}
export function noteProgressEvent(state, kind, detail, now = Date.now()) {
    if (!state)
        return;
    let request = state.request;
    if (kind === 'serial-face-start') {
        const index = Number(detail?.faceIndex);
        if (!Number.isInteger(index) || index < 0)
            return;
        state.serial = { index, count: clampFaceCount(detail?.faceCount, state.attemptFaceCount) };
        state.request = newRequest();
        return;
    }
    if (kind === 'request-sent') {
        if (request.sentAt)
            state.request = request = newRequest();
        request.sentAt = now;
        if (!state.firstSentAt)
            state.firstSentAt = now;
        return;
    }
    if (!request.sentAt)
        request.sentAt = now;
    if (kind === 'response-headers') {
        if (!request.headersAt)
            request.headersAt = now;
        return;
    }
    if (kind === 'response-frame' || kind === 'response-chunk') {
        if (!request.headersAt)
            request.headersAt = now;
        if (kind === 'response-frame')
            request.frames += 1;
        if (typeof detail === 'string') {
            if (detail.length < request.chars)
                request.parse = { pos: 0, faces: [newFace(0)] };
            request.text = detail;
            request.chars = detail.length;
            if (detail.length && !request.firstTextAt)
                request.firstTextAt = now;
            if (detail.length && !state.firstTextAt)
                state.firstTextAt = now;
        }
        return;
    }
    if (kind === 'response-complete' || kind === 'connection-manager-complete') {
        if (!request.headersAt)
            request.headersAt = now;
        if (!request.completeAt)
            request.completeAt = now;
    }
}
export function noteProgressSerialAccepted(state, partial) {
    if (!state || !partial)
        return;
    const count = clampFaceCount(partial.faceCount, state.attemptFaceCount);
    const missing = new Set(Array.isArray(partial.missing) ? partial.missing.map(Number) : []);
    for (let index = 0; index < count; index += 1) {
        if (missing.has(index) || state.accepted.has(index))
            continue;
        const current = state.serial?.index === index;
        const title = current ? (parseRequestText(state.request).faces[0]?.title || '') : '';
        if (current && state.request.chars > 0)
            rememberFaceChars(state.request.chars);
        state.accepted.set(index, title);
    }
}
export function progressTiming(state, now = Date.now()) {
    if (!state)
        return null;
    const end = state.finishingAt || now;
    const totalMs = Math.max(0, Math.round(end - state.startedAt));
    const thinkMs = state.firstSentAt && state.firstTextAt ? Math.max(0, Math.round(state.firstTextAt - state.firstSentAt)) : null;
    return totalMs > 0 ? { totalMs, ...(thinkMs !== null ? { thinkMs } : {}), ...(state.retry ? { retries: state.retry } : {}) } : null;
}
export function noteProgressFinishing(state, now = Date.now()) {
    if (!state || state.finishingAt)
        return;
    state.finishingAt = now;
    if (!state.serial && state.request.chars > 0)
        rememberFaceChars(state.request.chars / Math.max(1, state.attemptFaceCount));
}
const MARKER_SOURCE = String.raw `<summary(?=[\s>])|<\/summary\s*>|<style(?=[\s>])|<\/style\s*>|<details(?=[\s>])|\bdata-rm-ui\s*=\s*["']?([a-z][a-z-]{1,20})(?=["'\s>])|\bpopovertarget\s*=|<rm-ticket\b[^>]{0,40}>\s*(\d{1,2})(?=\D)|<\/toto\s*>|\bdata-rm-self\s*=`;
function decodeEntities(text) {
    return String(text || '').replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,8});/gi, (all, code) => {
        const lower = code.toLowerCase();
        if (lower[0] === '#') {
            const value = lower[1] === 'x' ? parseInt(lower.slice(2), 16) : parseInt(lower.slice(1), 10);
            return Number.isFinite(value) && value > 0 && value < 0x110000 ? String.fromCodePoint(value) : '';
        }
        return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[lower] ?? all;
    });
}
export function titleFromSummary(fragment) {
    const source = String(fragment || '');
    const close = source.indexOf('>');
    const inner = close >= 0 ? source.slice(close + 1) : '';
    const parts = inner.replace(/<(style|script|svg)\b[\s\S]*?<\/\1\s*>/gi, '<i>').split(/<[^>]*>/)
        .map(part => decodeEntities(part).replace(/\s+/g, ' ').trim()).filter(Boolean);
    return shortText(parts.join(' · '), 26);
}
function hexRgb(hex) {
    let value = hex.toLowerCase();
    if (value.length === 3 || value.length === 4)
        value = [...value.slice(0, 3)].map(char => char + char).join('') + (value.length === 4 ? value[3] + value[3] : '');
    const alpha = value.length === 8 ? parseInt(value.slice(6, 8), 16) / 255 : 1;
    if (alpha < 0.35)
        return null;
    return [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16));
}
function funcRgb(name, args) {
    const parts = String(args || '').replace(/\//g, ' ').split(/[\s,]+/).filter(Boolean);
    if (parts.length < 3)
        return null;
    const alphaText = parts[3];
    if (alphaText !== undefined) {
        const alpha = alphaText.endsWith('%') ? parseFloat(alphaText) / 100 : parseFloat(alphaText);
        if (Number.isFinite(alpha) && alpha < 0.35)
            return null;
    }
    const num = text => parseFloat(text);
    if (/^rgb/i.test(name)) {
        const channel = text => (text.endsWith('%') ? num(text) * 2.55 : num(text));
        const rgb = parts.slice(0, 3).map(channel);
        return rgb.every(Number.isFinite) ? rgb.map(value => Math.max(0, Math.min(255, Math.round(value)))) : null;
    }
    const h = ((num(parts[0]) % 360) + 360) % 360, s = num(parts[1]) / 100, l = num(parts[2]) / 100;
    if (![h, s, l].every(Number.isFinite))
        return null;
    const a = s * Math.min(l, 1 - l);
    const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    return [f(0), f(8), f(4)].map(value => Math.max(0, Math.min(255, Math.round(value * 255))));
}
const toHex = rgb => `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`;
function hsl([r, g, b]) {
    const R = r / 255, G = g / 255, B = b / 255;
    const max = Math.max(R, G, B), min = Math.min(R, G, B);
    const l = (max + min) / 2;
    const d = max - min;
    const s = d === 0 ? 0 : (l > 0.5 ? d / (2 - max - min) : d / (max + min));
    let h = 0;
    if (d)
        h = max === R ? 60 * (((G - B) / d) % 6) : max === G ? 60 * ((B - R) / d + 2) : 60 * ((R - G) / d + 4);
    return { h: (h + 360) % 360, s, l };
}
function rgbFromHsl(h, s, l) {
    const a = s * Math.min(l, 1 - l);
    const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    return [f(0), f(8), f(4)].map(value => Math.max(0, Math.min(255, Math.round(value * 255))));
}
export function paletteFromSource(source) {
    const weighted = [];
    const re = /#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![0-9a-z_-])|\b(rgba?|hsla?)\(\s*([^()]{3,80})\)/gi;
    let match;
    let scanned = 0;
    while ((match = re.exec(String(source || ''))) && scanned < 400) {
        scanned += 1;
        const rgb = match[1] ? hexRgb(match[1]) : funcRgb(match[2], match[3]);
        if (!rgb)
            continue;
        const near = weighted.find(item => Math.hypot(item.rgb[0] - rgb[0], item.rgb[1] - rgb[1], item.rgb[2] - rgb[2]) < 26);
        if (near)
            near.weight += 1;
        else
            weighted.push({ rgb, weight: 1 });
    }
    const colors = weighted.map(item => item.rgb);
    let thread = null;
    const bins = new Map();
    for (const item of weighted) {
        const { h, s, l } = hsl(item.rgb);
        if (s < 0.15 || l < 0.08 || l > 0.92)
            continue;
        const bin = Math.round(h / 30) % 12;
        const entry = bins.get(bin) || { weight: 0, best: null };
        entry.weight += item.weight;
        if (!entry.best || item.weight + s > entry.best.weight + entry.best.s)
            entry.best = { ...item, h, s, l };
        bins.set(bin, entry);
    }
    let top = null;
    for (const entry of bins.values())
        if (!top || entry.weight > top.weight || (entry.weight === top.weight && entry.best.s > top.best.s))
            top = entry;
    if (top) {
        const { h, s, l } = top.best;
        thread = rgbFromHsl(h, Math.min(0.85, Math.max(0.35, s)), Math.min(0.62, Math.max(0.42, l)));
    }
    if (!thread) {
        let distance = Infinity;
        for (const rgb of colors) {
            const { l } = hsl(rgb);
            if (l < 0.15 || l > 0.85)
                continue;
            if (Math.abs(l - 0.45) < distance) {
                distance = Math.abs(l - 0.45);
                thread = rgb;
            }
        }
    }
    return { colors: colors.slice(0, 6).map(toHex), count: colors.length, thread: thread ? toHex(thread) : '' };
}
function addUi(face, key) {
    if (!face.uis.includes(key) && face.uis.length < 12)
        face.uis.push(key);
}
function readSelfInvented(face, text) {
    const attr = text.slice(face.selfAt, face.selfAt + 900).match(/^data-rm-self\s*=\s*(["'])([\s\S]*?)\1/);
    if (!attr)
        return;
    face.selfAt = -1;
    try {
        face.self = parseSelfInvented(decodeEntities(attr[2]));
    }
    catch {
        face.self = null;
    }
}
export function parseRequestText(request) {
    const parse = request.parse;
    const text = request.text;
    if (!text || parse.pos >= text.length)
        return parse;
    const re = new RegExp(MARKER_SOURCE, 'gi');
    re.lastIndex = parse.pos;
    let face = parse.faces[parse.faces.length - 1];
    let match;
    while ((match = re.exec(text))) {
        const token = match[0].slice(0, 9).toLowerCase();
        if (token.startsWith('<summary')) {
            if (face.summaryAt < 0)
                face.summaryAt = match.index;
        }
        else if (token.startsWith('</summary')) {
            if (!face.title && face.summaryAt >= 0)
                face.title = titleFromSummary(text.slice(face.summaryAt, match.index));
            if (!face.palette && !face.threadHint)
                face.threadHint = paletteFromSource(text.slice(face.startAt, match.index)).thread;
        }
        else if (token.startsWith('<style'))
            face.styleAt = match.index;
        else if (token.startsWith('</style')) {
            if (face.styleAt >= 0) {
                face.keyframes += (text.slice(face.styleAt, match.index).match(/@(?:-webkit-)?keyframes\b/gi) || []).length;
                if (!face.palette)
                    face.palette = paletteFromSource(text.slice(face.startAt, match.index));
                face.styleAt = -1;
            }
        }
        else if (token.startsWith('<details')) {
            face.details += 1;
            if (face.details > 1)
                addUi(face, 'fold');
        }
        else if (match[1])
            addUi(face, match[1].toLowerCase());
        else if (token.startsWith('popovert'))
            addUi(face, 'popup');
        else if (match[2]) {
            if (!face.ticket)
                face.ticket = Number(match[2]);
        }
        else if (token.startsWith('data-rm-s')) {
            if (face.selfAt < 0 && !face.self)
                face.selfAt = match.index;
        }
        else if (token.startsWith('</toto')) {
            if (!face.palette) {
                const whole = paletteFromSource(text.slice(face.startAt, match.index));
                if (whole.count)
                    face.palette = whole;
            }
            face.closed = true;
            if (parse.faces.length < 13) {
                face = newFace(re.lastIndex);
                parse.faces.push(face);
            }
        }
        parse.pos = re.lastIndex;
    }
    for (const item of parse.faces) {
        if (item.selfAt >= 0 && !item.self)
            readSelfInvented(item, text);
        if (!item.think && item.summaryAt >= 0 && text.length - item.startAt < 16000) {
            const think = text.slice(item.startAt, item.startAt + 8000).match(/<rm-think(?:\s[^>]*)?>([\s\S]*?)<\/rm-think\s*>/i);
            if (think)
                item.think = decodeEntities(think[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 300);
        }
    }
    if (face && !face.palette && !face.threadHint && text.length - face.startAt > 3000) {
        face.threadHint = paletteFromSource(text.slice(face.startAt, face.startAt + 6000)).thread;
    }
    parse.pos = Math.max(parse.pos, text.length - 96);
    return parse;
}
const ease = value => 1 - Math.exp(-Math.max(0, value));
const seconds = ms => `${Math.max(0, Math.round(ms / 1000))}${__rmT("2RCLfh")}`;
const formatCount = value => Math.round(value).toLocaleString('en-US');
function elapsedLabel(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
function uiNames(keys, source = '') {
    const names = [];
    for (const key of interactionDisplayKeys(keys, source)) {
        const name = interactionDisplayName(key);
        if (name && !names.includes(name))
            names.push(name);
    }
    return names;
}
function requestFraction(request, now, expectedChars, closedRatio) {
    if (request.completeAt)
        return 1;
    if (!request.sentAt)
        return 0;
    const waiting = 0.03 + 0.5 * ease(((request.headersAt || now) - request.sentAt) / 40000);
    if (!request.headersAt)
        return waiting;
    const thinking = at => Math.max(waiting, waiting + (0.25 - waiting) * ease((at - request.headersAt) / 25000));
    if (!request.firstTextAt)
        return thinking(now);
    if (request.textBase === null)
        request.textBase = thinking(request.firstTextAt);
    const ratio = Math.max(request.chars / Math.max(1, expectedChars), closedRatio);
    const shaped = ratio <= 0.85 ? ratio : 0.85 + 0.15 * ease((ratio - 0.85) / 0.3);
    return request.textBase + (0.97 - request.textBase) * Math.min(1, shaped);
}
const FALL_MS = 3600;
const HOP_MS = 1000;
const FOUND_WAIT_MS = 3000;
const FOUND_MS = 2100;
function mirrorSceneOf(state, request, parse, thread, now) {
    if (state.sceneDone)
        return null;
    const menu = state.faceMenuLabels?.[0] || [];
    const menuFace = menu.length > 1;
    const mirrors = clampMirrorCount(menuFace ? menu.length : 3);
    const searching = () => ({ stage: 'search', mirrors, at: Math.max(0, Math.floor((now - state.startedAt - FALL_MS) / HOP_MS)) % mirrors });
    const writing = state.firstTextAt || request.firstTextAt || request.completeAt || state.finishingAt || state.accepted.size;
    if (!writing)
        return now - state.startedAt < FALL_MS ? { stage: 'fall' } : searching();
    if (!state.sceneFoundAt) {
        const ticket = menuFace ? Math.round(Number(parse.faces[0]?.ticket)) || 0 : 0;
        const waited = now - (state.firstTextAt || request.firstTextAt || now);
        const known = (!menuFace || ticket > 0) && !!thread;
        if (!known && waited < FOUND_WAIT_MS && !request.completeAt && !state.finishingAt)
            return searching();
        const pick = Math.round(Number(state.facePicks?.[0])) || 0;
        const chosen = ticket > 0 ? ticket - 1 : !menuFace && pick > 0 ? pick - 1 : Math.floor((mirrors - 1) / 2);
        state.sceneChosen = Math.max(0, Math.min(mirrors - 1, chosen));
        state.sceneFoundAt = now;
    }
    if (now - state.sceneFoundAt < FOUND_MS)
        return { stage: 'found', mirrors, chosen: state.sceneChosen };
    state.sceneDone = true;
    return null;
}
const doneLine = (key, text, extra = {}) => ({ key, state: 'done', text, ...extra });
const activeLine = (key, text) => ({ key, state: 'active', text });
export function progressView(state, now = Date.now()) {
    const request = state.request;
    const parse = parseRequestText(request);
    const serial = state.serial;
    const facesInRequest = serial ? 1 : state.attemptFaceCount;
    const closed = parse.faces.filter(face => face.closed);
    const current = facesInRequest === 1 ? parse.faces[0] : parse.faces[parse.faces.length - 1];
    const fraction = requestFraction(request, now, state.expectedFaceChars * facesInRequest, facesInRequest > 1 ? closed.length / facesInRequest : 0);
    let overall;
    if (serial) {
        const count = serial.count || state.attemptFaceCount;
        const done = state.accepted.size;
        overall = 0.02 + 0.93 * Math.min(1, (done + (state.accepted.has(serial.index) ? 0 : fraction)) / count);
    }
    else
        overall = 0.02 + 0.93 * fraction;
    if (state.finishingAt)
        overall = Math.max(overall, 0.95 + 0.04 * ease((now - state.finishingAt) / 2500));
    state.shown = Math.max(state.shown, Math.min(0.99, overall));
    const lines = [];
    const started = request.sentAt || serial || state.accepted.size || state.retry;
    lines.push(started
        ? doneLine('prep', `${__rmT("nt8AqIcJRDqmHT")}${state.drawText ? `${__rmT("Yis")}${state.drawText}` : ''}`)
        : activeLine('prep', __rmT("nsRXIxMNfcTCgyrRgBhS_j00iwtSzk")));
    if (state.retry)
        lines.push({ key: 'retry', state: 'note', text: `${__rmT("BJgCyT")}${state.retry}${__rmT("4bM2RJntws72s0ys")}` });
    if (serial) {
        for (const [index, title] of [...state.accepted].sort((a, b) => a[0] - b[0])) {
            lines.push(doneLine(`face-${index}`, `${__rmT("BJgCyT")}${index + 1}${__rmT("2RddPk")}${title ? `${__rmT("YSk")}${title}${__rmT("Yvk")}` : ''}${__rmT("8mvtSbEc")}`));
        }
    }
    else if (facesInRequest > 1) {
        closed.slice(0, facesInRequest).forEach((face, index) => lines.push(doneLine(`face-${index}`, `${__rmT("BJgCyT")}${index + 1}${__rmT("2RddPk")}${face.title ? `${__rmT("YSk")}${face.title}${__rmT("Yvk")}` : ''}${__rmT("8mvtSbEc")}`)));
    }
    const faceNo = serial ? serial.index + 1 : Math.min(closed.length + 1, facesInRequest);
    const prefix = serial || facesInRequest > 1 ? `${__rmT("BJgCyT")}${faceNo}${__rmT("2RddPk")}` : '';
    const currentDone = serial ? state.accepted.has(serial.index) : (facesInRequest > 1 && closed.length >= facesInRequest);
    let phase = 'preparing';
    if (request.sentAt && currentDone) {
        phase = request.completeAt || serial ? 'sewn' : 'sewing';
        if (!serial && !request.completeAt)
            lines.push(activeLine('tail', `${facesInRequest}${__rmT("tMyfa1NDrmAKb7OMvF5S7tMpYcxY_xSdCjdBkf")}`));
    }
    else if (request.sentAt) {
        if (!request.headersAt && !request.completeAt) {
            phase = 'waiting';
            const waited = now - request.sentAt;
            lines.push(activeLine('wait', `${prefix ? `${prefix}${__rmT("7ys")}` : ''}${waited < 8000 ? __rmT("mhFG6Fxnd9k.Cf") : __rmT("NJVecq6yjGY")}…… ${seconds(waited)}`));
        }
        else if (!request.firstTextAt && !request.completeAt) {
            phase = 'thinking';
            lines.push(activeLine('think', `${prefix ? `${prefix}${__rmT("7ys")}` : ''}${__rmT("f8Y4OYncm2rfpQ2FGR4dHT")}${seconds(now - request.headersAt)}`));
        }
        else {
            phase = request.completeAt ? 'sewn' : 'sewing';
            if (request.firstTextAt) {
                const thought = request.firstTextAt - request.headersAt;
                lines.push(doneLine('thought', `${__rmT("5N548zwkkuf")}${thought >= 3000 ? `${__rmT("fnf.8R4jHKG")}${seconds(thought)}${__rmT("eXs")}` : ''}`));
            }
            if (current.self?.form) {
                lines.push(doneLine('self', `${__rmT("7hbuZvUYk5ZycoOckGD")}${shortText(current.self.form, 24)}${__rmT("Yvk")}${current.self.theme ? `${__rmT("4bF.jaFygRhyXXG1")}${shortText(current.self.theme, 24)}${__rmT("Yvk")}` : ''}`));
            }
            if (current.think)
                lines.push({ key: 'think', state: 'note', mark: '✎', text: `${__rmT("8Xl3jLop")}${current.think}` });
            if (current.title)
                lines.push(doneLine('title', `${__rmT("TthAqIIEHc.Ash")}${current.title}${__rmT("Yvk")}`));
            if (current.ticket) {
                const label = (state.faceMenuLabels[serial ? serial.index : faceNo - 1] || [])[current.ticket - 1];
                lines.push(doneLine('ticket', `${__rmT("LJ055WPSHKG")}${current.ticket}${__rmT("qGtZ0Tlk")}${label ? `${__rmT("YSk")}${shortText(label, 12)}${__rmT("Yvk")}` : ''}`));
            }
            if (current.palette?.count) {
                lines.push(doneLine('palette', __rmT("IV90a_GIKeh"), {
                    swatches: current.palette.colors,
                    tail: `${__rmT("tB0CyT")}${current.palette.count}${__rmT("2Rdaif")}${current.keyframes ? `${__rmT("jvk")}${current.keyframes}${__rmT("Uqjs6OOBUFV4.T")}` : ''}`,
                }));
            }
            const names = uiNames(current.uis, current.uis.some(key => ['toggle', 'rhythm', 'slide'].includes(key)) ? request.text.slice(current.startAt) : '');
            if (names.length)
                lines.push(doneLine('ui', `${__rmT("_wc4v8eJUFVStf")}${names.slice(0, 4).join(__rmT("jvk"))}${names.length > 4 ? __rmT("2RdRfk") : ''}`));
            if (request.completeAt && serial)
                lines.push(activeLine('check', `${prefix}${__rmT("9toLSAUL25bq8TDqJ4cYGw9oL2s")}`));
            else if (request.completeAt)
                lines.push(doneLine('sewn', `${prefix}${__rmT("lDpaIp8Hr_JLgLM0")}`));
            else
                lines.push(activeLine('sew', `${__rmT("Wo0NOakp")}${prefix}${__rmT("kBft.AvS5.N._pJpd8mdHT")}${formatCount(request.chars)}${__rmT("2RUlPT")}`));
        }
    }
    if (state.finishingAt) {
        phase = 'finishing';
        lines.push(activeLine('finish', __rmT("AX6mls8cD.RNl4CAVinh8d31eV_6DGI1.Hm9PR.W")));
    }
    const thread = current.palette?.thread || current.threadHint
        || parse.faces.find(face => face.palette?.thread)?.palette.thread || parse.faces.find(face => face.threadHint)?.threadHint || '';
    const pinned = lines.filter(isPinnedLine).slice(-2);
    const rolling = lines.filter(line => !isPinnedLine(line));
    return {
        percent: Math.round(state.shown * 100),
        fraction: state.shown,
        elapsed: elapsedLabel(now - state.startedAt),
        phase,
        thread,
        lines: [...pinned, ...rolling.slice(-(MAX_LINES - pinned.length))],
        picks: progressPicks(current, state, serial ? serial.index : faceNo - 1),
        scene: mirrorSceneOf(state, request, parse, thread, now),
    };
}
const recentFaceChars = [];
function rememberFaceChars(chars) {
    const value = Math.round(Number(chars));
    if (!Number.isFinite(value) || value < 800)
        return;
    recentFaceChars.push(value);
    while (recentFaceChars.length > 8)
        recentFaceChars.shift();
}
const median = values => { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)]; };
export function estimateFaceChars(doc = globalThis.document) {
    if (recentFaceChars.length)
        return median(recentFaceChars);
    const sizes = [];
    try {
        const hosts = [...(doc?.querySelectorAll?.('#chat [data-rabbit-mirror-external-source="true"][data-rm-source="independent"]') || [])].slice(-8);
        for (const host of hosts) {
            const source = host.__rabbitMirrorIndependentSource;
            if (typeof source !== 'string' || source.length < 1500)
                continue;
            const faces = Math.max(1, (source.match(/<toto\b[^>]*\bdata-rm-face\s*=/gi) || []).length);
            sizes.push(source.length / faces * STORED_TO_RAW);
        }
    }
    catch { }
    return sizes.length ? median(sizes) : DEFAULT_FACE_CHARS;
}
function makeElement(doc, tag, className, attrs = {}) {
    const node = doc.createElement(tag);
    if (className)
        node.className = className;
    for (const [name, value] of Object.entries(attrs))
        node.setAttribute(name, value);
    return node;
}
function buildCard(doc) {
    const card = makeElement(doc, 'div', CARD_CLASS, { [GENERATION_PROGRESS_ATTR]: 'true' });
    const meta = makeElement(doc, 'div', 'rm-gp-meta');
    meta.append(makeElement(doc, 'span', 'rm-gp-pct'), makeElement(doc, 'span', 'rm-gp-time'));
    const stage = makeElement(doc, 'div', 'rm-gp-stage', { role: 'progressbar', 'aria-label': __rmT("l5Tz7FKk67Tp6gLA9yT"), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' });
    const cloth = makeElement(doc, 'div', 'rm-gp-cloth');
    cloth.append(makeElement(doc, 'div', 'rm-gp-sewn'));
    const rider = makeElement(doc, 'div', 'rm-gp-rider');
    rider.append(buildSewingSprite(doc, 2));
    stage.append(cloth, rider);
    const log = makeElement(doc, 'ul', 'rm-gp-log');
    card.append(meta, stage, log);
    return card;
}
function buildMini(doc) {
    const mini = makeElement(doc, 'span', MINI_CLASS, { [GENERATION_PROGRESS_MINI_ATTR]: 'true', 'aria-hidden': 'true' });
    const art = makeElement(doc, 'span', 'rm-gp-mini-art');
    art.append(buildSewingSprite(doc, 1));
    const side = makeElement(doc, 'span', 'rm-gp-mini-side');
    const bar = makeElement(doc, 'span', 'rm-gp-mini-bar', { role: 'progressbar', 'aria-label': __rmT("l5Tz7FKktm0hI2LA9yT"), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' });
    bar.append(makeElement(doc, 'span', 'rm-gp-mini-fill'));
    side.append(bar, makeElement(doc, 'span', 'rm-gp-mini-text'));
    mini.append(art, side);
    return mini;
}
function setText(node, text) {
    if (node && node.textContent !== text)
        node.textContent = text;
}
const MARKS = { done: '✓', active: '•', note: '↻' };
function updateLine(doc, li, line) {
    if (li.dataset.state !== line.state)
        li.dataset.state = line.state;
    let mark = li.querySelector(':scope > .rm-gp-mark');
    let text = li.querySelector(':scope > .rm-gp-text');
    if (!mark) {
        mark = makeElement(doc, 'span', 'rm-gp-mark', { 'aria-hidden': 'true' });
        li.append(mark);
    }
    if (!text) {
        text = makeElement(doc, 'span', 'rm-gp-text');
        li.append(text);
    }
    setText(mark, line.mark || MARKS[line.state] || '•');
    setText(text, line.text);
    let swatches = li.querySelector(':scope > .rm-gp-swatches');
    const colors = Array.isArray(line.swatches) ? line.swatches : [];
    if (colors.length) {
        if (!swatches) {
            swatches = makeElement(doc, 'span', 'rm-gp-swatches', { 'aria-hidden': 'true' });
            li.append(swatches);
        }
        const signature = colors.join(',');
        if (swatches.dataset.colors !== signature) {
            swatches.dataset.colors = signature;
            swatches.replaceChildren(...colors.map(color => {
                const chip = makeElement(doc, 'span', 'rm-gp-swatch');
                chip.style.setProperty('background', color);
                return chip;
            }));
        }
    }
    else
        swatches?.remove();
    let tail = li.querySelector(':scope > .rm-gp-tail');
    if (line.tail) {
        if (!tail) {
            tail = makeElement(doc, 'span', 'rm-gp-tail');
            li.append(tail);
        }
        setText(tail, line.tail);
    }
    else
        tail?.remove();
}
function updateLog(doc, list, lines) {
    const existing = new Map([...list.children].map(li => [li.dataset.key, li]));
    let cursor = list.firstElementChild;
    for (const line of lines) {
        let li = existing.get(line.key);
        if (li)
            existing.delete(line.key);
        else {
            li = makeElement(doc, 'li', 'rm-gp-line');
            li.dataset.key = line.key;
        }
        updateLine(doc, li, line);
        if (li === cursor)
            cursor = cursor.nextElementSibling;
        else
            list.insertBefore(li, cursor);
    }
    for (const li of existing.values())
        li.remove();
}
function syncMirrorScene(doc, card, scene) {
    const stage = card.querySelector('.rm-gp-stage');
    if (!stage)
        return;
    let svg = stage.querySelector(':scope > svg.rm-gp-scene');
    const key = sceneKey(scene);
    if (!key) {
        svg?.remove();
        if (card.hasAttribute('data-rm-gp-scene'))
            card.removeAttribute('data-rm-gp-scene');
        return;
    }
    if (!svg || svg.getAttribute('data-rm-gp-scene-key') !== key) {
        const next = buildMirrorScene(doc, scene);
        if (!next)
            return;
        next.setAttribute('data-rm-gp-scene-key', key);
        if (svg)
            svg.replaceWith(next);
        else
            stage.append(next);
        svg = next;
    }
    if (scene.stage === 'search') {
        const seeker = svg.querySelector(':scope > .rm-gp-seeker');
        const transform = `translate(${seekerX(scene.mirrors, scene.at)} 0)`;
        if (seeker && seeker.getAttribute('transform') !== transform)
            seeker.setAttribute('transform', transform);
    }
    if (card.dataset.rmGpScene !== scene.stage)
        card.dataset.rmGpScene = scene.stage;
}
function applyCommon(node, view) {
    const value = view.fraction.toFixed(3);
    if (node.style.getPropertyValue('--rm-gp-p') !== value)
        node.style.setProperty('--rm-gp-p', value);
    if (view.thread) {
        if (node.style.getPropertyValue('--rm-gp-thread') !== view.thread)
            node.style.setProperty('--rm-gp-thread', view.thread);
    }
    else
        node.style.removeProperty('--rm-gp-thread');
    if (node.dataset.rmGpPhase !== view.phase)
        node.dataset.rmGpPhase = view.phase;
}
const OWNER_ATTR = 'data-rm-gp-owner';
const ownedByNewer = (node, owner) => Number(node?.getAttribute?.(OWNER_ATTR)) > Number(owner || 0);
export function renderProgressCard(host, view, doc = host?.ownerDocument, owner = 0, dark = false) {
    const placeholder = host?.querySelector?.(PLACEHOLDER_SELECTOR);
    if (!placeholder || !doc)
        return null;
    let card = host.querySelector(`:scope > [${GENERATION_PROGRESS_ATTR}]`);
    if (ownedByNewer(card, owner))
        return null;
    if (!card)
        card = buildCard(doc);
    if (owner)
        card.setAttribute(OWNER_ATTR, String(owner));
    if (dark)
        card.setAttribute('data-rm-gp-dark', 'true');
    else
        card.removeAttribute('data-rm-gp-dark');
    if (card.previousElementSibling !== placeholder)
        placeholder.after(card);
    if (view.phase !== 'preparing') {
        const label = placeholder.querySelector(':scope > summary [data-rabbit-mirror-external-summary-label]');
        if (label && __rmR("QE8LkZGcCoIaabxw9ewLHixP8YHL.qwAbtC", "").test(label.textContent || ''))
            label.textContent = __rmT("eue9I6TmvSx5Y8Kdmfvk91ULPamqs.rtbNE");
    }
    const theme = placeholder.dataset.rmPlaceholderTheme || 'host';
    if (card.dataset.rmPlaceholderTheme !== theme)
        card.dataset.rmPlaceholderTheme = theme;
    applyCommon(card, view);
    setText(card.querySelector('.rm-gp-pct'), `${view.percent}%`);
    setText(card.querySelector('.rm-gp-time'), view.elapsed);
    const stage = card.querySelector('.rm-gp-stage');
    if (stage && stage.getAttribute('aria-valuenow') !== String(view.percent))
        stage.setAttribute('aria-valuenow', String(view.percent));
    syncMirrorScene(doc, card, view.scene);
    updateLog(doc, card.querySelector('.rm-gp-log'), view.lines);
    return card;
}
export function renderProgressMini(status, view, doc = status?.ownerDocument, owner = 0, dark = false) {
    if (!status || !doc)
        return null;
    let mini = status.querySelector(`:scope > [${GENERATION_PROGRESS_MINI_ATTR}]`);
    if (ownedByNewer(mini, owner))
        return null;
    if (!mini) {
        mini = buildMini(doc);
        status.append(mini);
    }
    if (owner)
        mini.setAttribute(OWNER_ATTR, String(owner));
    if (dark)
        mini.setAttribute('data-rm-gp-dark', 'true');
    else
        mini.removeAttribute('data-rm-gp-dark');
    applyCommon(mini, view);
    const bar = mini.querySelector('.rm-gp-mini-bar');
    if (bar && bar.getAttribute('aria-valuenow') !== String(view.percent))
        bar.setAttribute('aria-valuenow', String(view.percent));
    const last = view.lines[view.lines.length - 1];
    setText(mini.querySelector('.rm-gp-mini-text'), `${view.percent}% · ${last?.text || ''}`);
    const picks = Array.isArray(view.picks) ? view.picks
        : view.lines.filter(isPinnedLine).map(line => line.text);
    let note = mini.querySelector(':scope > .rm-gp-mini-note');
    if (!note && picks.length) {
        note = makeElement(doc, 'span', 'rm-gp-mini-note');
        mini.append(note);
    }
    if (note) {
        setText(note, picks.join('\n'));
        if (note.hidden !== !picks.length)
            note.hidden = !picks.length;
    }
    return mini;
}
export function removeGenerationProgress(host, owner = 0) {
    if (!host?.querySelectorAll)
        return;
    host.querySelectorAll(`:scope > [${GENERATION_PROGRESS_ATTR}], :scope > [data-rabbit-mirror-resay-status="true"] > [${GENERATION_PROGRESS_MINI_ATTR}]`).forEach(node => {
        if (!owner || node.getAttribute(OWNER_ATTR) === String(owner))
            node.remove();
    });
}
export function dropGenerationProgressUnlessLoading(host) {
    if (!host?.querySelector)
        return;
    if (host.dataset?.rmState === 'loading' && host.querySelector(PLACEHOLDER_SELECTOR))
        return;
    host.querySelector(`:scope > [${GENERATION_PROGRESS_ATTR}]`)?.remove();
}
let controllerSequence = 0;
const IDLE_TICKS_BEFORE_DORMANT = 90;
export function startGenerationProgress({ getHost, faceCount = 1, dark = false, doc = globalThis.document, clock = () => Date.now() } = {}) {
    const owner = ++controllerSequence;
    const state = createProgressState({ faceCount, expectedFaceChars: estimateFaceChars(doc), now: clock() });
    let timer = 0;
    let stopped = false;
    let lastRenderAt = 0;
    let lastHost = null;
    let idleTicks = 0;
    let observer = null;
    let observed = null;
    let kick = () => { };
    const watchVisibility = node => {
        if (observed === node)
            return;
        observer?.disconnect();
        observer = null;
        observed = node;
        const View = doc?.defaultView?.IntersectionObserver;
        if (!node || typeof View !== 'function')
            return;
        observer = new View(entries => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    if (entry.target.hasAttribute('data-rm-gp-offscreen')) {
                        entry.target.removeAttribute('data-rm-gp-offscreen');
                        kick();
                    }
                }
                else
                    entry.target.setAttribute('data-rm-gp-offscreen', 'true');
            }
        });
        observer.observe(node);
    };
    const findHost = () => { try {
        return getHost?.() || null;
    }
    catch {
        return null;
    } };
    const render = () => {
        lastRenderAt = clock();
        const host = findHost();
        if (lastHost && lastHost !== host)
            removeGenerationProgress(lastHost, owner);
        lastHost = host;
        if (!host?.isConnected) {
            watchVisibility(null);
            return false;
        }
        const placed = host.querySelector(`:scope > [${GENERATION_PROGRESS_ATTR}]`) || host.querySelector(RESAY_STATUS_SELECTOR)?.querySelector(`:scope > [${GENERATION_PROGRESS_MINI_ATTR}]`);
        if (placed && placed === observed && placed.getAttribute('data-rm-gp-offscreen') === 'true' && Number(placed.getAttribute(OWNER_ATTR)) === owner)
            return true;
        const view = progressView(state, clock());
        let node = null;
        if (host.dataset?.rmState === 'loading' && host.querySelector(PLACEHOLDER_SELECTOR)) {
            const mini = host.querySelector(RESAY_STATUS_SELECTOR)?.querySelector(`:scope > [${GENERATION_PROGRESS_MINI_ATTR}]`);
            if (mini && !ownedByNewer(mini, owner))
                mini.remove();
            node = renderProgressCard(host, view, doc, owner, dark);
        }
        else {
            const card = host.querySelector(`:scope > [${GENERATION_PROGRESS_ATTR}]`);
            if (card && !ownedByNewer(card, owner))
                card.remove();
            const status = host.querySelector(RESAY_STATUS_SELECTOR);
            if (status)
                node = renderProgressMini(status, view, doc, owner, dark);
        }
        watchVisibility(node);
        return !!node;
    };
    const tick = () => {
        timer = 0;
        if (stopped)
            return;
        let drew = true;
        if (!doc?.hidden) {
            try {
                drew = render();
            }
            catch (error) {
                console.debug('[RabbitMirror] generation progress skipped:', error);
            }
        }
        idleTicks = drew ? 0 : idleTicks + 1;
        if (idleTicks >= IDLE_TICKS_BEFORE_DORMANT)
            return;
        const writing = state.request.firstTextAt && !state.request.completeAt;
        timer = setTimeout(tick, writing ? 450 : 1000);
    };
    kick = () => {
        if (stopped)
            return;
        idleTicks = 0;
        const wait = Math.max(30, 250 - (clock() - lastRenderAt));
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(tick, wait);
    };
    kick();
    const guard = fn => (...args) => { if (stopped)
        return; try {
        fn(...args);
    }
    catch (error) {
        console.debug('[RabbitMirror] generation progress note skipped:', error);
    } };
    return {
        state,
        owner,
        note: guard((kind, detail) => {
            const wasWriting = !!state.request.firstTextAt;
            noteProgressEvent(state, kind, detail, clock());
            if ((kind !== 'response-chunk' && kind !== 'response-frame') || (!wasWriting && state.request.firstTextAt) || (!timer && idleTicks))
                kick();
        }),
        selection: guard(diagnostic => { noteProgressSelection(state, diagnostic); kick(); }),
        attempt: guard(info => { noteProgressAttempt(state, info, clock()); kick(); }),
        serialAccepted: guard(partial => { noteProgressSerialAccepted(state, partial); kick(); }),
        finishing: guard(() => { noteProgressFinishing(state, clock()); kick(); }),
        timing: () => { try {
            return progressTiming(state, clock());
        }
        catch {
            return null;
        } },
        stop() {
            if (stopped)
                return;
            stopped = true;
            if (timer)
                clearTimeout(timer);
            timer = 0;
            observer?.disconnect();
            observer = null;
            observed = null;
            for (const node of new Set([lastHost, findHost()]))
                removeGenerationProgress(node, owner);
            lastHost = null;
            state.request.text = '';
        },
    };
}
