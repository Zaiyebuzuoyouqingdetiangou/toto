// 材质纹理（实验性，默认关闭）。
// 模型在某个元素上写 data-rm-texture="材料 粗细 方向 形状 浓淡"，兔子镜按描述现场生成一层很淡的明暗纹理，
// 叠在它自己的底色上、文字下面。不放任何图片：纹理是浏览器按几个数字算出来的，颜色仍是模型写的底色。
// 关着时什么都不做；打开后也只在模型自己写了描述的地方出现。
// 不直接引入 settings.js（它依赖酒馆宿主模块）：开关直接读兔子镜存在酒馆里的那份设置。
function getSettings() {
    try { return globalThis.SillyTavern?.getContext?.()?.extensionSettings?.rabbit_mirror_theater || {}; }
    catch { return {}; }
}

export const TEXTURE_ATTR = 'data-rm-texture';
const ON_ATTR = 'data-rm-texture-on';
const POS_ATTR = 'data-rm-texture-pos';
const SPREAD_ATTR = 'data-rm-texture-spread';
const SPREAD_DONE_ATTR = 'data-rm-texture-spread-done';
const STYLE_ID = 'rabbit-mirror-material-texture-style';
const RECENT_KEY = 'rabbitMirrorMaterialTextureRecent';
const RECENT_LIMIT = 6;

const GRAIN = { 细: 0.9, 中: 0.5, 粗: 0.2 };
const TILE = { 细: 140, 中: 170, 粗: 230 };
const DIRECTIONS = ['无', '横', '竖', '斜'];
const SHAPES = ['点', '纤维', '条纹', '斑块'];

export function materialTextureEnabled(settings = getSettings()) {
    return settings?.materialTextureEnabled === true;
}

/** 「旧宣纸 细 横 条纹 淡」→ { material, grain, direction, shape, strength }；认不出的词用默认值，顺序不限。
 *  材料是模型自己写的词（这东西在现实里是什么做的），不查表、不参与画纹理，只用来记「近几面用过什么」。 */
export function parseTextureDescriptor(text) {
    const words = String(text || '').split(/[\s,，、;；/|]+/).map(word => word.trim()).filter(Boolean);
    const pick = (list, fallback) => words.find(word => list.includes(word)) || fallback;
    const known = new Set([...Object.keys(GRAIN), ...DIRECTIONS, ...SHAPES, ...Object.keys(RELIEF)]);
    return {
        material: words.filter(word => !known.has(word)).join('').slice(0, 12),
        grain: pick(Object.keys(GRAIN), '中'),
        direction: pick(DIRECTIONS, '无'),
        shape: pick(SHAPES, '点'),
        strength: pick(Object.keys(RELIEF), '淡'),
    };
}

export function textureDescriptorText(descriptor) {
    const value = descriptor || {};
    return [value.material, value.grain, value.direction, value.shape, value.strength].filter(Boolean).join(' ');
}

/** 「近几面用过」只提材料名；没写材料名的旧记录退回提整条描述。 */
function materialName(descriptorText) {
    const value = parseTextureDescriptor(descriptorText);
    return value.material || [value.grain, value.direction, value.shape, value.strength].join(' ');
}

function hashSeed(text) {
    let hash = 2166136261;
    for (const char of String(text || '')) hash = Math.imul(hash ^ char.codePointAt(0), 16777619);
    return (hash >>> 0) % 997 + 1;
}

// 起伏高度（surfaceScale）和整层叠加强度。按设计资料：纸约 2，粗墙约 20；这里只做物件表面，取得很低。
// 叠加强度以前压得太轻（0.45／0.62／0.8，浅底再乘 0.38），用户的反馈是「看不见」；现在提到能看见的程度。
const RELIEF = { 很淡: [1.0, 0.65], 淡: [1.6, 0.85], 明显: [2.6, 1.0] };
// 先把高度图揉软一点再打光：纤维（毛毡、绒布）最软，斑块（皮面、石面）次之，点和条纹只去掉锯齿。
const SOFTEN = { 纤维: 0.9, 斑块: 0.6, 点: 0.25, 条纹: 0.3 };

function tileSvg({ size, fx, fy, octaves, seed, scale, blur, alpha = 1, shadowOnly = false }) {
    // 无缝：在一块里生成可平铺的噪点，用 feTile 在四周铺一圈再揉软、打光，只露出中间那块；
    // 边上的光照也「看得到隔壁」，拼起来没有接缝。光从左上来（azimuth 225），和规则里的光源方向一致。
    return `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>`
        + `<filter id='f' filterUnits='userSpaceOnUse' x='-${size}' y='-${size}' width='${size * 3}' height='${size * 3}' color-interpolation-filters='sRGB'>`
        + `<feTurbulence x='0' y='0' width='${size}' height='${size}' type='fractalNoise' baseFrequency='${fx.toFixed(3)} ${fy.toFixed(3)}' numOctaves='${octaves}' seed='${seed}' stitchTiles='stitch' result='n0'/>`
        + `<feTile in='n0' result='n'/>`
        + `<feColorMatrix in='n' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0' result='h0'/>`
        + (blur ? `<feGaussianBlur in='h0' stdDeviation='${blur}' result='h'/>` : `<feOffset in='h0' result='h'/>`)
        + `<feDiffuseLighting in='h' surfaceScale='${scale}' diffuseConstant='0.68' lighting-color='white'><feDistantLight azimuth='225' elevation='48'/></feDiffuseLighting>`
        // 很浅的底色：平的地方提到纯白，只留下凹处的暗面，用「正片叠底」压上去（浅底上亮面本来就看不出来）。
        + (shadowOnly ? `<feComponentTransfer><feFuncR type='linear' slope='2'/><feFuncG type='linear' slope='2'/><feFuncB type='linear' slope='2'/></feComponentTransfer>` : '')
        + `</filter><rect width='${size}' height='${size}' filter='url(%23f)'${alpha < 1 ? ` opacity='${alpha}'` : ''}/></svg>`;
}

function svgUrl(svg) {
    return `url("data:image/svg+xml,${svg.replace(/</g, '%3C').replace(/>/g, '%3E')}")`;
}

/**
 * 生成可平铺的材质纹理：把噪点当成表面的高低起伏，从左上打光，得到真的凹凸明暗（纸的起伏、皮面颗粒、木纹）。
 * 用 soft-light 叠在元素自己的底色上：平的地方是中灰，不改颜色，只改明暗。
 * 两层大小不同的纹理叠在一起，重复的位置错开，大面积时也看不出是一块块拼的。
 */
export function textureImage(descriptor, seedText = '', { shadowOnly = false } = {}) {
    const value = { ...parseTextureDescriptor(''), ...(descriptor || {}) };
    const base = GRAIN[value.grain] || GRAIN.中;
    const size = TILE[value.grain] || TILE.中;
    const [scale, opacity] = RELIEF[value.strength] || RELIEF.淡;
    // 形状：点＝少层颗粒；纤维＝多层细碎；条纹＝一个方向拉得很长；斑块＝低频成团。
    let fx = base, fy = base, octaves = 3;
    if (value.shape === '纤维') octaves = 5;
    if (value.shape === '斑块') { fx = fy = base * 0.08; octaves = 4; }
    const stretch = value.shape === '条纹' ? 0.03 : value.shape === '纤维' ? 0.5 : 1;
    // 斜：打了光的纹理不能旋转（会出接缝，光的方向也会跟着转），按横向处理。
    if (value.direction === '横' || value.direction === '斜') fx *= stretch;
    if (value.direction === '竖') fy *= stretch;
    // 拉得太长时一块纹理里连一个完整起伏都没有，平铺就会出现接缝：每块至少留一个半起伏。
    const minimum = 1.5 / size;
    fx = Math.max(fx, minimum); fy = Math.max(fy, minimum);
    const seed = hashSeed(`${textureDescriptorText(value)}|${seedText}`);
    const blur = SOFTEN[value.shape] || 0;
    const second = Math.round(size * 1.37);
    const minimum2 = 1.5 / second;
    const main = tileSvg({ size, fx, fy, octaves, seed, scale, blur, shadowOnly });
    const extra = tileSvg({ size: second, fx: Math.max(fx, minimum2), fy: Math.max(fy, minimum2), octaves, seed: (seed * 7 + 13) % 997 + 1, scale, blur, alpha: 0.5, shadowOnly });
    return { image: `${svgUrl(extra)}, ${svgUrl(main)}`, size: `${second}px, ${size}px`, opacity: String(opacity) };
}

function ensureStyle(doc) {
    if (!doc?.head || doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    // 纹理放在元素自己的 ::before（或 ::after）里，排在底色之上、内容之下；不改模型写的背景。
    style.textContent = `[${ON_ATTR}]{isolation:isolate}`
        + `[${ON_ATTR}="before"]::before,[${ON_ATTR}="after"]::after{content:"";position:absolute;inset:0;border-radius:inherit;`
        + 'background-image:var(--rm-texture-image);background-size:var(--rm-texture-size);background-repeat:repeat;pointer-events:none;z-index:-1;'
        // soft-light：中灰不改底色，亮处提亮、暗处压暗。边缘一圈很淡的暗影（东西有厚度、转角背光），
        // 左上边缘一点亮（光从左上来）；大小按元素尺寸算，小按钮不会整块变暗。
        + 'mix-blend-mode:var(--rm-texture-blend,soft-light);opacity:var(--rm-texture-opacity,.6);'
        // 再描一道亮边、一道暗边表示厚度：颜色和粗细从元素自己算（--rm-texture-edge-*），没算出来时退回原来那道很淡的白边。
        + 'box-shadow:inset 0 0 var(--rm-texture-ao,16px) rgba(0,0,0,.32),inset 1px 1px calc(var(--rm-texture-ao,16px) / 3) rgba(255,255,255,.28),'
        + 'inset var(--rm-texture-edge-size,0px) var(--rm-texture-edge-size,0px) 0 var(--rm-texture-edge-light,transparent),'
        + 'inset calc(var(--rm-texture-edge-size,0px) * -1) calc(var(--rm-texture-edge-size,0px) * -1) 0 var(--rm-texture-edge-shade,transparent)}';
    doc.head.append(style);
}

function pseudoFree(el, which) {
    try { const content = el.ownerDocument.defaultView.getComputedStyle(el, `::${which}`).content; return !content || content === 'none' || content === 'normal'; }
    catch { return false; }
}

function remember(descriptorText, faceKey) {
    if (!descriptorText || !faceKey) return;
    try {
        const list = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]');
        if (Array.isArray(list) && list.some(row => row?.k === faceKey)) return;
        const rows = Array.isArray(list) ? list.filter(Boolean) : [];
        rows.push({ k: faceKey, d: descriptorText });
        globalThis.localStorage?.setItem(RECENT_KEY, JSON.stringify(rows.slice(-RECENT_LIMIT)));
    } catch { /* 只用来提醒换花样，记不住也没关系 */ }
}

export function recentMaterialTextures() {
    try {
        const list = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]');
        return Array.isArray(list) ? [...new Set(list.map(row => materialName(String(row?.d || ''))).filter(Boolean))].slice(-3) : [];
    } catch { return []; }
}

function luminanceOf(match) {
    const channel = value => { const v = Number(value) / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * channel(match[1]) + 0.7152 * channel(match[2]) + 0.0722 * channel(match[3]);
}

const RGB = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/g;
function alphaOf(match) {
    if (match[4] === undefined) return 1;
    return match[4].endsWith('%') ? Number.parseFloat(match[4]) / 100 : Number(match[4]);
}

// 这块东西自己的底色：先看纯色；纯色是透明的，就看渐变里的几个颜色（取平均）。
// 返回 { opaque, luminance }；看不出来（图片底、没有底色）时 opaque=false。
function baseTone(el, view) {
    let style = null;
    try { style = (view || globalThis).getComputedStyle(el); } catch { return { opaque: false, luminance: 0 }; }
    const rgbOf = match => [Number(match[1]), Number(match[2]), Number(match[3])];
    const solid = [...String(style?.backgroundColor || '').matchAll(RGB)][0];
    if (solid && alphaOf(solid) >= 0.5) return { opaque: alphaOf(solid) >= 0.85, luminance: luminanceOf(solid), rgb: rgbOf(solid) };
    const image = String(style?.backgroundImage || '');
    if (!/gradient\(/i.test(image) || /url\(/i.test(image)) return { opaque: false, luminance: 0 };
    const stops = [...image.matchAll(RGB)];
    if (!stops.length) return { opaque: false, luminance: 0 };
    const opaque = stops.every(stop => alphaOf(stop) >= 0.85);
    const visible = stops.filter(stop => alphaOf(stop) >= 0.5);
    if (!visible.length) return { opaque: false, luminance: 0 };
    const rgb = [0, 1, 2].map(i => Math.round(visible.reduce((sum, stop) => sum + rgbOf(stop)[i], 0) / visible.length));
    return { opaque, luminance: visible.reduce((sum, stop) => sum + luminanceOf(stop), 0) / visible.length, rgb };
}

// 厚度：用它自己的颜色描一道亮边（左上，受光）和一道暗边（右下，背光），粗细按它的大小。
// 不用固定的白和黑，两块底色不同的东西描出来就不一样。模型自己写了 inset 亮暗边的，让开不碰。
function edgeVars(el, view, tone) {
    let style;
    try { style = view.getComputedStyle(el); } catch { return null; }
    if (!tone?.rgb || /inset/.test(style.boxShadow || '')) return null;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
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

// 写了纹理的那块，大半被里面自己有底色的板子盖住时（比如整面底板上压着几块卡片），
// 纹理只能从缝里露出来，几乎看不到。这时把同一种纹理也铺到这几块大板子上（各自铺在自己的内容下面），
// 小按钮、图片、画出来的图都不铺。量不出大小（这一面还收着）就先不铺，等展开再说。
const SKIP_SPREAD = 'svg, img, canvas, video, picture, iframe, button, input, select, textarea, summary, '
    + '[data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-rabbit-mirror-recipe], [data-rabbit-mirror-tool-entry-host], [data-rm-image-region]';
function coveringPanels(el, view) {
    let box;
    try { box = el.getBoundingClientRect(); } catch { return null; }
    const area = box.width * box.height;
    if (!area) return null;
    const panels = [];
    let covered = 0;
    let layer = [...el.children];
    for (let depth = 0; depth < 3 && layer.length; depth += 1) {
        const next = [];
        for (const child of layer) {
            if (child.matches?.(SKIP_SPREAD) || /^(STYLE|SCRIPT|TEMPLATE)$/i.test(child.tagName)) continue;
            const rect = child.getBoundingClientRect();
            const width = Math.max(0, Math.min(rect.right, box.right) - Math.max(rect.left, box.left));
            const height = Math.max(0, Math.min(rect.bottom, box.bottom) - Math.max(rect.top, box.top));
            if (!width || !height) continue;
            if (baseTone(child, view).opaque) { covered += width * height; panels.push({ child, share: (width * height) / area }); }
            else next.push(...child.children);
        }
        layer = next;
    }
    if (covered / area < 0.5) return [];
    return panels.filter(item => item.share >= 0.12).sort((a, b) => b.share - a.share).slice(0, 6).map(item => item.child);
}

// 铺到盖住它的板子上时更小心：板子里有绝对定位的东西（弹出的小框、角标），
// 板子原来没定位的，加了定位它们会换参照；板子单独成层后，伸出板子外的弹出物会被旁边的板子压住。
// 所以：没定位的板子里有这类东西就不铺；有定位的板子，这类东西都看得见、都在板子里面（或板子本来就裁掉外面）才铺。
function safeToLayer(el, view) {
    let style;
    try { style = view.getComputedStyle(el); } catch { return false; }
    const floating = [...el.querySelectorAll('*')].filter(child => { try { return /absolute|fixed|sticky/.test(view.getComputedStyle(child).position); } catch { return true; } });
    if (!floating.length) return true;
    if (style.position === 'static') return false;
    if (/hidden|clip/.test(`${style.overflowX} ${style.overflowY}`)) return true;
    const box = el.getBoundingClientRect();
    return floating.every(child => {
        const rect = child.getBoundingClientRect();
        if (!rect.width && !rect.height) return false; // 现在收着的弹出物：量不出会伸到哪
        return rect.left >= box.left - 1 && rect.top >= box.top - 1 && rect.right <= box.right + 1 && rect.bottom <= box.bottom + 1;
    });
}

// 在一个元素自己的 ::before/::after 里铺纹理（排在内容下面）。铺上了返回 true。
function layTexture(el, descriptor, seedText, view, { spread = false } = {}) {
    // 底色很浅（接近白）时叠加看不出来：改成只压暗面的正片叠底。
    const tone = baseTone(el, view);
    const shadowOnly = tone.luminance > 0.72;
    const { image, size, opacity } = textureImage(descriptor, seedText, { shadowOnly });
    const which = pseudoFree(el, 'before') ? 'before' : pseudoFree(el, 'after') ? 'after' : '';
    if (!which) return false; // 模型自己两个伪元素都用了：不抢，宁可不铺。
    let position = '';
    try { position = view.getComputedStyle(el).position; } catch { position = ''; }
    if (spread && !safeToLayer(el, view)) return false;
    if (!position || position === 'static') {
        el.style.position = 'relative';
        el.setAttribute(POS_ATTR, 'true');
    }
    el.style.setProperty('--rm-texture-image', image);
    el.style.setProperty('--rm-texture-size', size);
    // 正片叠底比柔光重：浅底上用六成左右的力度。
    el.style.setProperty('--rm-texture-opacity', shadowOnly ? String(Math.round(Number(opacity) * 0.6 * 100) / 100) : opacity);
    if (shadowOnly) el.style.setProperty('--rm-texture-blend', 'multiply'); else el.style.removeProperty('--rm-texture-blend');
    let ao = 16;
    try { const rect = el.getBoundingClientRect(); if (rect.width && rect.height) ao = Math.max(5, Math.min(22, Math.round(Math.min(rect.width, rect.height) * 0.14))); } catch { /* 用默认 */ }
    el.style.setProperty('--rm-texture-ao', `${ao}px`);
    const edge = edgeVars(el, view, tone);
    for (const [key, value] of Object.entries(edge || {})) el.style.setProperty(`--rm-texture-edge-${key}`, value);
    el.setAttribute(ON_ATTR, which);
    if (spread) el.setAttribute(SPREAD_ATTR, 'true');
    return true;
}

function spreadTexture(el, descriptor, seedText, view) {
    if (el.hasAttribute(SPREAD_DONE_ATTR)) return true;
    const panels = coveringPanels(el, view);
    if (panels === null) return false; // 量不出大小
    el.setAttribute(SPREAD_DONE_ATTR, String(panels.length));
    panels.forEach(panel => {
        if (panel.hasAttribute(ON_ATTR) || panel.querySelector(`[${TEXTURE_ATTR}]`)) return;
        layTexture(panel, descriptor, seedText, view, { spread: true });
    });
    return true;
}

const WAITING = new WeakSet();
function spreadWhenVisible(el, descriptor, seedText, view) {
    if (spreadTexture(el, descriptor, seedText, view)) return;
    const face = el.closest?.('details');
    if (!face || WAITING.has(el)) return;
    WAITING.add(el);
    const retry = () => {
        if (!el.isConnected || !el.hasAttribute(ON_ATTR)) { face.removeEventListener('toggle', retry); WAITING.delete(el); return; }
        view.setTimeout(() => { if (spreadTexture(el, descriptor, seedText, view)) { face.removeEventListener('toggle', retry); WAITING.delete(el); } }, 60);
    };
    face.addEventListener('toggle', retry);
}

/** 给一面（或一个文档）里写了描述的元素铺上纹理。关着时把以前铺过的撤掉。返回铺上的个数。 */
export function applyMaterialTextures(root, settings = getSettings()) {
    const scope = root?.querySelectorAll ? root : null;
    if (!scope) return 0;
    if (!materialTextureEnabled(settings)) {
        // 关掉开关：撤掉纹理，也撤掉当时为它加的定位和变量，回到模型原来的样子。
        for (const el of scope.querySelectorAll(`[${ON_ATTR}]`)) {
            el.removeAttribute(ON_ATTR);
            el.style.removeProperty('--rm-texture-image');
            el.style.removeProperty('--rm-texture-size');
            el.style.removeProperty('--rm-texture-opacity');
            el.style.removeProperty('--rm-texture-ao');
            el.style.removeProperty('--rm-texture-blend');
            for (const key of ['size', 'light', 'shade']) el.style.removeProperty(`--rm-texture-edge-${key}`);
            if (el.hasAttribute(POS_ATTR)) { el.style.removeProperty('position'); el.removeAttribute(POS_ATTR); }
            el.removeAttribute(SPREAD_ATTR);
        }
        for (const el of scope.querySelectorAll(`[${SPREAD_DONE_ATTR}]`)) el.removeAttribute(SPREAD_DONE_ATTR);
        return 0;
    }
    const nodes = [...scope.querySelectorAll(`[${TEXTURE_ATTR}]`)];
    if (scope.matches?.(`[${TEXTURE_ATTR}]`)) nodes.unshift(scope);
    if (!nodes.length) return 0;
    const doc = scope.ownerDocument || scope;
    ensureStyle(doc);
    let applied = 0;
    const view = doc.defaultView || globalThis;
    nodes.forEach((el, index) => {
        const descriptor = parseTextureDescriptor(el.getAttribute(TEXTURE_ATTR));
        const faceKey = el.closest?.('details')?.getAttribute?.('data-rabbit-mirror-css-scope') || '';
        if (el.hasAttribute(ON_ATTR)) {
            applied += 1;
            if (!el.hasAttribute(SPREAD_DONE_ATTR)) spreadWhenVisible(el, descriptor, `${faceKey}|${index}`, view);
            return;
        }
        if (!layTexture(el, descriptor, `${faceKey}|${index}`, view)) return;
        applied += 1;
        if (faceKey) remember(textureDescriptorText(descriptor), `${faceKey}|${index}`);
        spreadWhenVisible(el, descriptor, `${faceKey}|${index}`, view);
    });
    return applied;
}

/** 给模型的一小段规则；只在开关打开时发，打开时每面都要写一处。 */
export function materialTextureRule(settings = getSettings()) {
    if (!materialTextureEnabled(settings)) return '';
    const recent = recentMaterialTextures();
    // 开关是用户主动打开的：每个 HTML 面都写一处，不给「不加」的退路（以前写「可选」，模型几乎都跳过）。
    // 防模板化靠两点：质感从这一面的实物推出来；近几面用过的提醒换一种。不列举材质名，免得模型只在列出的几种里挑。
    // 第一个词是材料名：先决定这东西是什么做的，再填粗细方向，免得只填表、不想材料。
    return `材质纹理（已开启）：每个 HTML 面都在一个元素上写 ${TEXTURE_ATTR}="材料 粗细 方向 形状 浓淡"，兔子镜会按描述叠一层纹理：材料写它在现实里是什么做的（一两个词，你自己定），粗细写细／中／粗，方向写无／横／竖／斜，形状写点／纤维／条纹／斑块，浓淡写很淡／淡／明显。写在这一面最像实物的主体或承载面上；一面只写一处，不写在整面最外层背景上；底色、边缘、光泽和厚度仍由你写。${recent.length ? `近几面用过：${recent.join('；')}，这一面换一种材料。` : ''}`;
}
