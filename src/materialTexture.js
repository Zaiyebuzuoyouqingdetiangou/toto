import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.1.0";
import { layoutRect } from './faceZoomMetrics.js?rmv=2.1.0';
function getSettings() {
    try {
        return globalThis.SillyTavern?.getContext?.()?.extensionSettings?.rabbit_mirror_theater || {};
    }
    catch {
        return {};
    }
}
export const TEXTURE_ATTR = 'data-rm-texture';
const ON_ATTR = 'data-rm-texture-on';
const POS_ATTR = 'data-rm-texture-pos';
const SPREAD_ATTR = 'data-rm-texture-spread';
const SPREAD_DONE_ATTR = 'data-rm-texture-spread-done';
const STYLE_ID = 'rabbit-mirror-material-texture-style';
const RECENT_KEY = 'rabbitMirrorMaterialTextureRecent';
const RECENT_LIMIT = 6;
const GRAIN = { [__rmT("dr8")]: 0.9, [__rmT("_c8")]: 0.5, [__rmT("vLT")]: 0.2 };
const TILE = { [__rmT("dr8")]: 140, [__rmT("_c8")]: 170, [__rmT("vLT")]: 230 };
const DIRECTIONS = [__rmT("wWY"), __rmT("31G"), __rmT("SrG"), __rmT("TWY")];
const SHAPES = [__rmT("Fak"), __rmT("MJ_T7f"), __rmT("g2FK7f"), __rmT("q2vn2k")];
const GLOSS = [__rmT("WBaRNh"), __rmT("IG9RNh"), __rmT("8HodPk")];
const SHEEN_ATTR = 'data-rm-texture-sheen';
const FUZZ_ATTR = 'data-rm-texture-fuzz';
export function materialTextureEnabled(settings = getSettings()) {
    return settings?.materialTextureEnabled === true;
}
export function parseTextureDescriptor(text) {
    const words = String(text || '').split(__rmR("AkejT7kQhbY4jXrWFSy.5xHGXIZBU4BP", "")).map(word => word.trim()).filter(Boolean);
    const pick = (list, fallback) => words.find(word => list.includes(word)) || fallback;
    const known = new Set([...Object.keys(GRAIN), ...DIRECTIONS, ...SHAPES, ...Object.keys(RELIEF), ...GLOSS]);
    return {
        material: words.filter(word => !known.has(word)).join('').slice(0, 12),
        grain: pick(Object.keys(GRAIN), __rmT("_c8")),
        direction: pick(DIRECTIONS, __rmT("wWY")),
        shape: pick(SHAPES, __rmT("Fak")),
        strength: pick(Object.keys(RELIEF), __rmT("wqA")),
        gloss: pick(GLOSS, __rmT("WBaRNh")),
    };
}
export function textureDescriptorText(descriptor) {
    const value = descriptor || {};
    return [value.material, value.grain, value.direction, value.shape, value.strength, value.gloss].filter(Boolean).join(' ');
}
function materialName(descriptorText) {
    const value = parseTextureDescriptor(descriptorText);
    const look = [value.grain, value.direction, value.shape, value.strength, value.gloss].join(' ');
    return value.material ? `${value.material}${__rmT("eis")}${look}${__rmT("eXs")}` : look;
}
function hashSeed(text) {
    let hash = 2166136261;
    for (const char of String(text || ''))
        hash = Math.imul(hash ^ char.codePointAt(0), 16777619);
    return (hash >>> 0) % 997 + 1;
}
const RELIEF = { [__rmT("xDBUeh")]: [1.0, 0.65], [__rmT("wqA")]: [1.6, 0.85], [__rmT("fPmMjf")]: [2.6, 1.0] };
const SOFTEN = { [__rmT("MJ_T7f")]: 1.2, [__rmT("q2vn2k")]: 0.6, [__rmT("Fak")]: 0.25, [__rmT("g2FK7f")]: 0.3 };
function tileSvg({ size, fx, fy, octaves, seed, scale, blur, alpha = 1, shadowOnly = false }) {
    return `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>`
        + `<filter id='f' filterUnits='userSpaceOnUse' x='-${size}' y='-${size}' width='${size * 3}' height='${size * 3}' color-interpolation-filters='sRGB'>`
        + `<feTurbulence x='0' y='0' width='${size}' height='${size}' type='fractalNoise' baseFrequency='${fx.toFixed(3)} ${fy.toFixed(3)}' numOctaves='${octaves}' seed='${seed}' stitchTiles='stitch' result='n0'/>`
        + `<feTile in='n0' result='n'/>`
        + `<feColorMatrix in='n' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0' result='h0'/>`
        + (blur ? `<feGaussianBlur in='h0' stdDeviation='${blur}' result='h'/>` : `<feOffset in='h0' result='h'/>`)
        + `<feDiffuseLighting in='h' surfaceScale='${scale}' diffuseConstant='0.68' lighting-color='white'><feDistantLight azimuth='225' elevation='48'/></feDiffuseLighting>`
        + (shadowOnly ? `<feComponentTransfer><feFuncR type='linear' slope='2'/><feFuncG type='linear' slope='2'/><feFuncB type='linear' slope='2'/></feComponentTransfer>` : '')
        + `</filter><rect width='${size}' height='${size}' filter='url(%23f)'${alpha < 1 ? ` opacity='${alpha}'` : ''}/></svg>`;
}
function svgUrl(svg) {
    return `url("data:image/svg+xml,${svg.replace(/</g, '%3C').replace(/>/g, '%3E')}")`;
}
export function textureImage(descriptor, seedText = '', { shadowOnly = false } = {}) {
    const value = { ...parseTextureDescriptor(''), ...(descriptor || {}) };
    const base = GRAIN[value.grain] || GRAIN[__rmT("_c8")];
    const size = TILE[value.grain] || TILE[__rmT("_c8")];
    const [relief, opacity] = RELIEF[value.strength] || RELIEF[__rmT("wqA")];
    const scale = value.shape === __rmT("MJ_T7f") ? relief * 1.3 : value.shape === __rmT("q2vn2k") ? relief * 1.8 : relief;
    let fx = base, fy = base, octaves = 3;
    if (value.shape === __rmT("MJ_T7f")) {
        fx = fy = base * 0.55;
        octaves = 5;
    }
    if (value.shape === __rmT("q2vn2k")) {
        fx = fy = Math.max(base * 0.08, 0.03);
        octaves = 4;
    }
    const stretch = value.shape === __rmT("g2FK7f") ? 0.03 : value.shape === __rmT("MJ_T7f") ? 0.5 : 1;
    if (value.direction === __rmT("31G") || value.direction === __rmT("TWY"))
        fx *= stretch;
    if (value.direction === __rmT("SrG"))
        fy *= stretch;
    const minimum = 1.5 / size;
    fx = Math.max(fx, minimum);
    fy = Math.max(fy, minimum);
    const seed = hashSeed(`${textureDescriptorText(value)}|${seedText}`);
    const blur = SOFTEN[value.shape] || 0;
    const second = Math.round(size * 1.37);
    const minimum2 = 1.5 / second;
    const main = tileSvg({ size, fx, fy, octaves, seed, scale, blur, shadowOnly });
    const extra = tileSvg({ size: second, fx: Math.max(fx, minimum2), fy: Math.max(fy, minimum2), octaves, seed: (seed * 7 + 13) % 997 + 1, scale, blur, alpha: 0.5, shadowOnly });
    return { image: `${svgUrl(extra)}, ${svgUrl(main)}`, size: `${second}px, ${size}px`, opacity: String(opacity) };
}
function ensureStyle(doc) {
    if (!doc?.head || doc.getElementById(STYLE_ID))
        return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `[${ON_ATTR}]:not([${ON_ATTR}="svg"]){isolation:isolate}[${ON_ATTR}="svg"]{filter:var(--rm-texture-svg-filter)!important}`
        + `[${ON_ATTR}="before"]::before,[${ON_ATTR}="after"]::after{content:"";position:absolute;inset:0;border-radius:inherit;`
        + 'background-image:var(--rm-texture-image);background-size:var(--rm-texture-size);background-repeat:repeat;pointer-events:none;z-index:-1;'
        + 'mix-blend-mode:var(--rm-texture-blend,soft-light);opacity:var(--rm-texture-opacity,.6);'
        + 'box-shadow:inset 0 0 var(--rm-texture-ao,16px) rgba(0,0,0,.32),inset 1px 1px calc(var(--rm-texture-ao,16px) / 3) rgba(255,255,255,.28),'
        + 'inset var(--rm-texture-edge-size,0px) var(--rm-texture-edge-size,0px) 0 var(--rm-texture-edge-light,transparent),'
        + 'inset calc(var(--rm-texture-edge-size,0px) * -1) calc(var(--rm-texture-edge-size,0px) * -1) 0 var(--rm-texture-edge-shade,transparent)}'
        + `[${SHEEN_ATTR}="after"]::after,[${SHEEN_ATTR}="before"]::before{content:"";position:absolute;inset:0;border-radius:inherit;background:var(--rm-texture-sheen);pointer-events:none;z-index:-1}`
        + `[${FUZZ_ATTR}="after"]::after,[${FUZZ_ATTR}="before"]::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:-2;`
        + 'box-shadow:0 0 0 var(--rm-texture-fuzz,3px) var(--rm-texture-fuzz-color,transparent);filter:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'f\' x=\'-10%25\' y=\'-10%25\' width=\'120%25\' height=\'120%25\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' seed=\'7\'/%3E%3CfeDisplacementMap in=\'SourceGraphic\' scale=\'8\' xChannelSelector=\'R\' yChannelSelector=\'G\'/%3E%3C/filter%3E%3C/svg%3E#f")}';
    doc.head.append(style);
}
function pseudoFree(el, which) {
    try {
        const content = el.ownerDocument.defaultView.getComputedStyle(el, `::${which}`).content;
        return !content || content === 'none' || content === 'normal';
    }
    catch {
        return false;
    }
}
function remember(descriptorText, faceKey) {
    if (!descriptorText || !faceKey)
        return;
    try {
        const list = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]');
        if (Array.isArray(list) && list.some(row => row?.k === faceKey))
            return;
        const rows = Array.isArray(list) ? list.filter(Boolean) : [];
        rows.push({ k: faceKey, d: descriptorText });
        globalThis.localStorage?.setItem(RECENT_KEY, JSON.stringify(rows.slice(-RECENT_LIMIT)));
    }
    catch { }
}
export function recentMaterialTextures() {
    try {
        const list = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]');
        return Array.isArray(list) ? [...new Set(list.map(row => materialName(String(row?.d || ''))).filter(Boolean))].slice(-3) : [];
    }
    catch {
        return [];
    }
}
function luminanceOf(match) {
    const channel = value => { const v = Number(value) / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * channel(match[1]) + 0.7152 * channel(match[2]) + 0.0722 * channel(match[3]);
}
const RGB = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/g;
function alphaOf(match) {
    if (match[4] === undefined)
        return 1;
    return match[4].endsWith('%') ? Number.parseFloat(match[4]) / 100 : Number(match[4]);
}
function baseTone(el, view) {
    let style = null;
    try {
        style = (view || globalThis).getComputedStyle(el);
    }
    catch {
        return { opaque: false, luminance: 0 };
    }
    const rgbOf = match => [Number(match[1]), Number(match[2]), Number(match[3])];
    const solid = [...String(style?.backgroundColor || '').matchAll(RGB)][0];
    if (solid && alphaOf(solid) >= 0.5)
        return { opaque: alphaOf(solid) >= 0.85, luminance: luminanceOf(solid), rgb: rgbOf(solid) };
    const image = String(style?.backgroundImage || '');
    if (!/gradient\(/i.test(image) || /url\(/i.test(image))
        return { opaque: false, luminance: 0 };
    const stops = [...image.matchAll(RGB)];
    if (!stops.length)
        return { opaque: false, luminance: 0 };
    const opaque = stops.every(stop => alphaOf(stop) >= 0.85);
    const visible = stops.filter(stop => alphaOf(stop) >= 0.5);
    if (!visible.length)
        return { opaque: false, luminance: 0 };
    const rgb = [0, 1, 2].map(i => Math.round(visible.reduce((sum, stop) => sum + rgbOf(stop)[i], 0) / visible.length));
    return { opaque, luminance: visible.reduce((sum, stop) => sum + luminanceOf(stop), 0) / visible.length, rgb };
}
function edgeVars(el, view, tone) {
    let style;
    try {
        style = view.getComputedStyle(el);
    }
    catch {
        return null;
    }
    if (!tone?.rgb || /inset/.test(style.boxShadow || ''))
        return null;
    const rect = layoutRect(el);
    if (!rect.width || !rect.height)
        return null;
    const mix = (color, target, amount) => color.map((value, i) => Math.round(value + (target[i] - value) * amount));
    const light = tone.luminance > 0.6;
    const bright = mix(tone.rgb, [255, 255, 255], light ? 0.7 : 0.45);
    const dark = mix(tone.rgb, [0, 0, 0], light ? 0.18 : 0.35);
    return {
        size: `${Math.max(1, Math.min(3, Math.round(Math.min(rect.width, rect.height) * 0.008)))}px`,
        light: `rgba(${bright.join(',')},.55)`,
        shade: `rgba(${dark.join(',')},.45)`,
    };
}
function lightBase(el, view) {
    return baseTone(el, view).luminance > 0.72;
}
const SKIP_SPREAD = 'svg, img, canvas, video, picture, iframe, button, input, select, textarea, summary, '
    + '[data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-rabbit-mirror-recipe], [data-rabbit-mirror-tool-entry-host], [data-rm-image-region]';
function coveringPanels(el, view) {
    let box;
    try {
        box = el.getBoundingClientRect();
    }
    catch {
        return null;
    }
    const area = box.width * box.height;
    if (!area)
        return null;
    const panels = [];
    let covered = 0;
    let layer = [...el.children];
    for (let depth = 0; depth < 3 && layer.length; depth += 1) {
        const next = [];
        for (const child of layer) {
            if (child.matches?.(SKIP_SPREAD) || /^(STYLE|SCRIPT|TEMPLATE)$/i.test(child.tagName))
                continue;
            const rect = child.getBoundingClientRect();
            const width = Math.max(0, Math.min(rect.right, box.right) - Math.max(rect.left, box.left));
            const height = Math.max(0, Math.min(rect.bottom, box.bottom) - Math.max(rect.top, box.top));
            if (!width || !height)
                continue;
            if (baseTone(child, view).opaque) {
                covered += width * height;
                panels.push({ child, share: (width * height) / area });
            }
            else
                next.push(...child.children);
        }
        layer = next;
    }
    if (covered / area < 0.5)
        return [];
    return panels.filter(item => item.share >= 0.12).sort((a, b) => b.share - a.share).slice(0, 6).map(item => item.child);
}
function safeToLayer(el, view) {
    let style;
    try {
        style = view.getComputedStyle(el);
    }
    catch {
        return false;
    }
    const descendants = el.querySelectorAll('*');
    if (descendants.length > 400)
        return false;
    const floating = [...descendants].filter(child => { try {
        return /absolute|fixed|sticky/.test(view.getComputedStyle(child).position);
    }
    catch {
        return true;
    } });
    if (!floating.length)
        return true;
    if (style.position === 'static')
        return false;
    if (/hidden|clip/.test(`${style.overflowX} ${style.overflowY}`))
        return true;
    const box = el.getBoundingClientRect();
    return floating.every(child => {
        const rect = child.getBoundingClientRect();
        if (!rect.width && !rect.height)
            return false;
        return rect.left >= box.left - 1 && rect.top >= box.top - 1 && rect.right <= box.right + 1 && rect.bottom <= box.bottom + 1;
    });
}
function sheenVars(el, view, tone, descriptor, seedText) {
    if (descriptor.gloss !== __rmT("IG9RNh") && descriptor.gloss !== __rmT("8HodPk"))
        return null;
    if (!tone?.rgb)
        return null;
    let style;
    try {
        style = view.getComputedStyle(el);
    }
    catch {
        return null;
    }
    const rect = layoutRect(el);
    if (!rect.width || !rect.height)
        return null;
    const mix = (color, target, amount) => color.map((value, i) => Math.round(value + (target[i] - value) * amount));
    const L = tone.luminance;
    const hi = mix(tone.rgb, [255, 255, 255], L > 0.6 ? 0.85 : 0.65);
    const lo = mix(tone.rgb, [0, 0, 0], 0.3);
    let strength = L > 0.6 ? 0.5 : L > 0.3 ? 0.8 : 1;
    const text = [...String(style.color || '').matchAll(RGB)][0];
    if (text) {
        const lit = mix(tone.rgb, hi, 0.7 * strength);
        const lt = luminanceOf(text), ll = luminanceOf([null, ...lit]);
        const contrast = (Math.max(lt, ll) + 0.05) / (Math.min(lt, ll) + 0.05);
        if (contrast < 1.6)
            return null;
        if (contrast < 2.5)
            strength *= 0.5;
    }
    const seed = hashSeed(`${seedText}|sheen`);
    const angle = 150 + (seed % 26);
    const a = (value) => `rgba(${hi.join(',')},${Math.round(value * strength * 100) / 100})`;
    const d = (value) => `rgba(${lo.join(',')},${Math.round(value * strength * 100) / 100})`;
    if (descriptor.gloss === __rmT("IG9RNh")) {
        const x = 16 + (seed >> 2) % 16;
        return `radial-gradient(120% 90% at ${x}% 0%, ${a(0.5)} 0%, ${a(0.16)} 40%, ${a(0)} 65%), linear-gradient(${angle}deg, ${d(0)} 55%, ${d(0.2)} 100%)`;
    }
    const longest = Math.max(rect.width, rect.height);
    const width = Math.max(10, Math.min(28, Math.round(1800 / longest)));
    const start = 5 + (seed >> 4) % 12;
    return `linear-gradient(${angle}deg, ${a(0)} ${start}%, ${a(0.7)} ${start + 1}%, ${a(0.5)} ${start + width}%, ${a(0)} ${start + width + 1.5}%), `
        + `radial-gradient(60% 40% at 18% 8%, rgba(255,255,255,${Math.round(0.45 * strength * 100) / 100}), rgba(255,255,255,0) 70%), `
        + `linear-gradient(${angle}deg, ${d(0)} 50%, ${d(0.32)} 100%)`;
}
function fuzzVars(el, view, tone, descriptor) {
    if (descriptor.shape !== __rmT("MJ_T7f") || descriptor.gloss !== __rmT("WBaRNh") || !tone?.rgb)
        return null;
    let style;
    try {
        style = view.getComputedStyle(el);
    }
    catch {
        return null;
    }
    if (/hidden|clip|scroll|auto/.test(`${style.overflowX} ${style.overflowY}`))
        return null;
    const rect = layoutRect(el);
    if (!rect.width || !rect.height)
        return null;
    return { size: `${Math.max(3, Math.min(6, Math.round(Math.min(rect.width, rect.height) * 0.015)))}px`, color: `rgb(${tone.rgb.join(',')})` };
}
const SVG_NS = 'http://www.w3.org/2000/svg';
function isSvgElement(el) { return el?.namespaceURI === SVG_NS; }
const FUR = { [__rmT("dr8")]: [4, 1.1], [__rmT("_c8")]: [6.5, 0.8], [__rmT("vLT")]: [10, 0.6] };
export function svgTextureFilter(descriptor, seedText = '', { ratio = 1, minSide = 200 } = {}) {
    const value = { ...parseTextureDescriptor(''), ...(descriptor || {}) };
    const seed = hashSeed(`${textureDescriptorText(value)}|${seedText}|svg`);
    const unit = Math.max(0.05, Number(ratio) || 1);
    const user = px => Math.round(px / unit * 100) / 100;
    const freq = perPx => Math.round(perPx * unit * 10000) / 10000;
    const steps = [];
    let source = 'SourceGraphic';
    if (value.shape === __rmT("MJ_T7f") && value.gloss === __rmT("WBaRNh")) {
        const [length, edgeFreq] = FUR[value.grain] || FUR[__rmT("_c8")];
        const fur = Math.max(2, Math.min(length, minSide * 0.08));
        steps.push(`<feTurbulence type='fractalNoise' baseFrequency='${freq(edgeFreq)}' numOctaves='2' seed='${seed}' result='n'/>`, `<feDisplacementMap in='SourceGraphic' in2='n' scale='${user(fur)}' xChannelSelector='R' yChannelSelector='G' result='d0'/>`, `<feGaussianBlur in='d0' stdDeviation='${user(0.7)}' result='d'/>`);
        source = 'd';
    }
    const grainy = !(value.shape === __rmT("MJ_T7f") && value.strength === __rmT("xDBUeh"));
    if (grainy) {
        const base = GRAIN[value.grain] || GRAIN[__rmT("_c8")];
        let fx = base, fy = base, octaves = 3;
        if (value.shape === __rmT("MJ_T7f")) {
            fx = fy = base * 0.55;
            octaves = 5;
        }
        if (value.shape === __rmT("q2vn2k")) {
            fx = fy = Math.max(base * 0.08, 0.03);
            octaves = 4;
        }
        const stretch = value.shape === __rmT("g2FK7f") ? 0.03 : value.shape === __rmT("MJ_T7f") ? 0.5 : 1;
        if (value.direction === __rmT("31G") || value.direction === __rmT("TWY"))
            fx *= stretch;
        if (value.direction === __rmT("SrG"))
            fy *= stretch;
        const [relief] = RELIEF[value.strength] || RELIEF[__rmT("wqA")];
        const surface = value.shape === __rmT("MJ_T7f") ? relief * 1.3 : value.shape === __rmT("q2vn2k") ? relief * 1.8 : relief;
        const blur = SOFTEN[value.shape] || 0;
        steps.push(`<feTurbulence type='fractalNoise' baseFrequency='${freq(fx)} ${freq(fy)}' numOctaves='${octaves}' seed='${(seed * 7 + 13) % 997 + 1}' result='g'/>`, `<feColorMatrix in='g' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0' result='h0'/>`, blur ? `<feGaussianBlur in='h0' stdDeviation='${user(blur)}' result='h'/>` : `<feOffset in='h0' result='h'/>`, `<feDiffuseLighting in='h' surfaceScale='${Math.round(surface / Math.min(1, unit) * 100) / 100}' diffuseConstant='0.7' lighting-color='white' result='light'><feDistantLight azimuth='225' elevation='48'/></feDiffuseLighting>`, `<feBlend in='light' in2='${source}' mode='soft-light' result='lit'/>`, `<feComposite in='lit' in2='${source}' operator='in'/>`);
    }
    else if (source !== 'SourceGraphic') {
        steps.push(`<feMerge><feMergeNode in='${source}'/></feMerge>`);
    }
    if (!steps.length)
        return '';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg'><filter id='f' x='-15%' y='-15%' width='130%' height='130%' color-interpolation-filters='sRGB'>${steps.join('')}</filter></svg>`;
    return `url("data:image/svg+xml,${svg.replace(/%/g, '%25').replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E')}#f")`;
}
function laySvgTexture(el, descriptor, seedText, view) {
    let box = null;
    try {
        box = el.getBBox?.();
    }
    catch {
        box = null;
    }
    const rect = layoutRect(el);
    if (!box?.width || !box?.height || !rect?.width || !rect?.height)
        return false;
    const ratio = Math.max(rect.width / box.width, rect.height / box.height);
    const filter = svgTextureFilter(descriptor, seedText, { ratio, minSide: Math.min(rect.width, rect.height) });
    if (!filter)
        return false;
    let existing = '';
    try {
        existing = view.getComputedStyle(el).filter;
    }
    catch {
        existing = '';
    }
    el.style.setProperty('--rm-texture-svg-filter', existing && existing !== 'none' ? `${filter} ${existing}` : filter);
    el.setAttribute(ON_ATTR, 'svg');
    return true;
}
const SVG_WAITING = new WeakSet();
function laySvgTextureWhenVisible(el, descriptor, seedText, view) {
    if (laySvgTexture(el, descriptor, seedText, view))
        return true;
    let face = el.closest?.('details');
    while (face?.parentElement?.closest?.('details'))
        face = face.parentElement.closest('details');
    if (!face || SVG_WAITING.has(el))
        return false;
    SVG_WAITING.add(el);
    const retry = () => view.setTimeout(() => {
        if (!el.isConnected || el.hasAttribute(ON_ATTR) || !el.hasAttribute(TEXTURE_ATTR)) {
            face.removeEventListener('toggle', retry, true);
            SVG_WAITING.delete(el);
            return;
        }
        if (laySvgTexture(el, descriptor, seedText, view)) {
            face.removeEventListener('toggle', retry, true);
            SVG_WAITING.delete(el);
        }
    }, 60);
    face.addEventListener('toggle', retry, true);
    return false;
}
function layTexture(el, descriptor, seedText, view, { spread = false } = {}) {
    const tone = baseTone(el, view);
    const shadowOnly = tone.luminance > 0.72;
    const { image, size, opacity } = textureImage(descriptor, seedText, { shadowOnly });
    const which = pseudoFree(el, 'before') ? 'before' : pseudoFree(el, 'after') ? 'after' : '';
    if (!which)
        return false;
    let position = '';
    try {
        position = view.getComputedStyle(el).position;
    }
    catch {
        position = '';
    }
    if (spread && !safeToLayer(el, view))
        return false;
    if (!position || position === 'static') {
        el.style.position = 'relative';
        el.setAttribute(POS_ATTR, 'true');
    }
    el.style.setProperty('--rm-texture-image', image);
    el.style.setProperty('--rm-texture-size', size);
    const lightFactor = descriptor.shape === __rmT("g2FK7f") ? 0.3 : 0.42;
    el.style.setProperty('--rm-texture-opacity', shadowOnly ? String(Math.round(Number(opacity) * lightFactor * 100) / 100) : opacity);
    if (shadowOnly)
        el.style.setProperty('--rm-texture-blend', 'multiply');
    else
        el.style.removeProperty('--rm-texture-blend');
    let ao = 16;
    try {
        const rect = layoutRect(el);
        if (rect.width && rect.height)
            ao = Math.max(5, Math.min(22, Math.round(Math.min(rect.width, rect.height) * 0.14)));
    }
    catch { }
    el.style.setProperty('--rm-texture-ao', `${ao}px`);
    const edge = edgeVars(el, view, tone);
    for (const [key, value] of Object.entries(edge || {}))
        el.style.setProperty(`--rm-texture-edge-${key}`, value);
    const other = which === 'before' && pseudoFree(el, 'after') ? 'after' : '';
    const sheen = other ? sheenVars(el, view, tone, descriptor, seedText) : null;
    if (sheen) {
        el.style.setProperty('--rm-texture-sheen', sheen);
        el.setAttribute(SHEEN_ATTR, other);
    }
    const fuzz = other && !sheen ? fuzzVars(el, view, tone, descriptor) : null;
    if (fuzz) {
        el.style.setProperty('--rm-texture-fuzz', fuzz.size);
        el.style.setProperty('--rm-texture-fuzz-color', fuzz.color);
        el.setAttribute(FUZZ_ATTR, other);
    }
    el.setAttribute(ON_ATTR, which);
    if (spread)
        el.setAttribute(SPREAD_ATTR, 'true');
    return true;
}
function spreadTexture(el, descriptor, seedText, view) {
    if (el.hasAttribute(SPREAD_DONE_ATTR))
        return true;
    const panels = coveringPanels(el, view);
    if (panels === null)
        return false;
    el.setAttribute(SPREAD_DONE_ATTR, String(panels.length));
    panels.forEach(panel => {
        if (panel.hasAttribute(ON_ATTR) || panel.hasAttribute(TEXTURE_ATTR) || panel.querySelector(`[${TEXTURE_ATTR}]`))
            return;
        layTexture(panel, descriptor, seedText, view, { spread: true });
    });
    return true;
}
const WAITING = new WeakSet();
function spreadWhenVisible(el, descriptor, seedText, view) {
    if (spreadTexture(el, descriptor, seedText, view))
        return;
    let face = el.closest?.('details');
    while (face?.parentElement?.closest?.('details'))
        face = face.parentElement.closest('details');
    if (!face || WAITING.has(el))
        return;
    WAITING.add(el);
    const retry = () => {
        if (!el.isConnected || !el.hasAttribute(ON_ATTR)) {
            face.removeEventListener('toggle', retry, true);
            WAITING.delete(el);
            return;
        }
        view.setTimeout(() => { if (spreadTexture(el, descriptor, seedText, view)) {
            face.removeEventListener('toggle', retry, true);
            WAITING.delete(el);
        } }, 60);
    };
    face.addEventListener('toggle', retry, true);
}
export function applyMaterialTextures(root, settings = getSettings(), { record = true } = {}) {
    const scope = root?.querySelectorAll ? root : null;
    if (!scope)
        return 0;
    if (!materialTextureEnabled(settings)) {
        for (const el of scope.querySelectorAll(`[${ON_ATTR}]`)) {
            el.removeAttribute(ON_ATTR);
            el.style.removeProperty('--rm-texture-image');
            el.style.removeProperty('--rm-texture-size');
            el.style.removeProperty('--rm-texture-opacity');
            el.style.removeProperty('--rm-texture-ao');
            el.style.removeProperty('--rm-texture-blend');
            for (const key of ['size', 'light', 'shade'])
                el.style.removeProperty(`--rm-texture-edge-${key}`);
            for (const key of ['--rm-texture-sheen', '--rm-texture-fuzz', '--rm-texture-fuzz-color', '--rm-texture-svg-filter'])
                el.style.removeProperty(key);
            el.removeAttribute(SHEEN_ATTR);
            el.removeAttribute(FUZZ_ATTR);
            if (el.hasAttribute(POS_ATTR)) {
                el.style.removeProperty('position');
                el.removeAttribute(POS_ATTR);
            }
            el.removeAttribute(SPREAD_ATTR);
        }
        for (const el of scope.querySelectorAll(`[${SPREAD_DONE_ATTR}]`))
            el.removeAttribute(SPREAD_DONE_ATTR);
        return 0;
    }
    const nodes = [...scope.querySelectorAll(`[${TEXTURE_ATTR}]`)];
    if (scope.matches?.(`[${TEXTURE_ATTR}]`))
        nodes.unshift(scope);
    if (!nodes.length)
        return 0;
    const doc = scope.ownerDocument || scope;
    ensureStyle(doc);
    let applied = 0;
    const view = doc.defaultView || globalThis;
    nodes.forEach(el => {
        const descriptor = parseTextureDescriptor(el.getAttribute(TEXTURE_ATTR));
        const faceRoot = el.closest?.('[data-rabbit-mirror-css-scope]') || el.closest?.('details');
        const faceKey = faceRoot?.getAttribute?.('data-rabbit-mirror-css-scope') || '';
        const index = faceRoot ? [...faceRoot.querySelectorAll(`[${TEXTURE_ATTR}]`)].indexOf(el) : 0;
        if (el.hasAttribute(ON_ATTR)) {
            applied += 1;
            if (!el.hasAttribute(SPREAD_DONE_ATTR))
                spreadWhenVisible(el, descriptor, `${faceKey}|${index}`, view);
            return;
        }
        if (isSvgElement(el)) {
            if (!laySvgTextureWhenVisible(el, descriptor, `${faceKey}|${index}`, view))
                return;
            applied += 1;
            if (faceKey && record)
                remember(textureDescriptorText(descriptor), `${faceKey}|${index}`);
            return;
        }
        if (!layTexture(el, descriptor, `${faceKey}|${index}`, view))
            return;
        applied += 1;
        if (faceKey && record)
            remember(textureDescriptorText(descriptor), `${faceKey}|${index}`);
        spreadWhenVisible(el, descriptor, `${faceKey}|${index}`, view);
    });
    return applied;
}
export function materialTextureRule(settings = getSettings(), { follow = false } = {}) {
    if (!materialTextureEnabled(settings))
        return '';
    const recent = recentMaterialTextures();
    return `${__rmT("WU0uTfq6Eyn5k2RQPD8kM6a1Iv1UhUKrNPWnKerNfr8ux_XnxErBOr8V6NIYTmVTNfzJS23e_XY")}${TEXTURE_ATTR}${__rmT("t.vV3RGpcaBMjGEOOvMpd1XeuDCZgI6hoX9vHrxl7bd.bN6WSqCc_.CESqKul9VsUp7uv4kOzaqsR4Uj9h4uqhBXm9F8EZqi")}${follow ? __rmT("V_JWlqYcVoQIXcxXZTInnpuZfdXuWJqmMyA") : __rmT("Mqeu4FrzwwrKYJnGbY4pK7olRIJ4oo..t.RxeOUZ2n0NJQFVyv0lrsZ0Biiv4k")}${__rmT("UBElDPhRredGeLLPqhtP1qFnVK75X1PdFS.uxzvTdz6_W4s8TQk9N.Kb6rfQNC0d082zViyLGIqsvmAY6Uqq6oVc91QRQ9wwvA3kpKNcMfQxAw3Cn5ev67TuoaCor2PAF.JsHJjjB6k559wZKIFE1nGfOciTtFbwZHM84qwlxWeB5x3noQFw3TcGogC1wiLOWOdDEIhID3pFz.kTIqDtJE14Pdv1NGjxWHBMSpOUhlY.cevim.c_BxT8ajh_RoU3f1zCZKLgU4IfSjnQsHy0gcSe68fV5RHm82XiIO33.dTryBwQI9KZy_E07FiIF6Bly5bo3W6I9dowCWVAmU5wwYfsAQQ1f9IPFmIRB35l8LAmWtZphfgcaCTjWMcuMp4Sgxtv9zWjhvqaGmTmh3b8FOyq__D")}${recent.length ? `${__rmT("m1VN4S5utXR76t5D")}${recent.join(__rmT("7os"))}${__rmT(".XAuFuSwYOWTeIq4GLABxU3d59lDZcJNV6Z0o0V6GQds1MRWgzOQxhzSuos9uT")}` : ''}`;
}
