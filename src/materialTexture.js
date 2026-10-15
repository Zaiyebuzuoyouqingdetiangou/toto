// 材质纹理（实验性，默认关闭）。
// 模型在某个元素上写 data-rm-texture="粗细 方向 形状 浓淡"，兔子镜按描述现场生成一层很淡的明暗纹理，
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
const STYLE_ID = 'rabbit-mirror-material-texture-style';
const RECENT_KEY = 'rabbitMirrorMaterialTextureRecent';
const RECENT_LIMIT = 6;

const GRAIN = { 细: 1.1, 中: 0.6, 粗: 0.22 };
const TILE = { 细: 140, 中: 170, 粗: 230 };
// 浓淡按设计资料的经验值调过：大面积噪点超过约 10% 就像脏了。纹理只铺在一件东西上，可以比整面背景稍重，
// 但「明显」以前偏重（皮革一类发脏），整体收到原来的六成左右。
const STRENGTH = { 很淡: [0.17, 0.06], 淡: [0.27, 0.1], 明显: [0.38, 0.16] };
const DIRECTIONS = ['无', '横', '竖', '斜'];
const SHAPES = ['点', '纤维', '条纹', '斑块'];

export function materialTextureEnabled(settings = getSettings()) {
    return settings?.materialTextureEnabled === true;
}

/** 「细 横 条纹 淡」→ { grain, direction, shape, strength }；认不出的词用默认值，顺序不限。 */
export function parseTextureDescriptor(text) {
    const words = String(text || '').split(/[\s,，、;；/|]+/).map(word => word.trim()).filter(Boolean);
    const pick = (list, fallback) => words.find(word => list.includes(word)) || fallback;
    return {
        grain: pick(Object.keys(GRAIN), '中'),
        direction: pick(DIRECTIONS, '无'),
        shape: pick(SHAPES, '点'),
        strength: pick(Object.keys(STRENGTH), '淡'),
    };
}

export function textureDescriptorText(descriptor) {
    const value = descriptor || {};
    return [value.grain, value.direction, value.shape, value.strength].filter(Boolean).join(' ');
}

function hashSeed(text) {
    let hash = 2166136261;
    for (const char of String(text || '')) hash = Math.imul(hash ^ char.codePointAt(0), 16777619);
    return (hash >>> 0) % 997 + 1;
}

/** 生成一块可平铺的纹理：浅色和深色两层灰度颗粒，叠在任何底色上都只改变明暗、不改颜色。 */
export function textureImage(descriptor, seedText = '') {
    const value = { ...parseTextureDescriptor(''), ...(descriptor || {}) };
    const base = GRAIN[value.grain] || GRAIN.中;
    const size = TILE[value.grain] || TILE.中;
    const [light, dark] = STRENGTH[value.strength] || STRENGTH.淡;
    // 形状：点＝少层颗粒；纤维＝多层细碎；条纹＝一个方向拉得很长；斑块＝低频成团。
    let fx = base, fy = base, octaves = 2, kind = 'fractalNoise';
    if (value.shape === '纤维') octaves = 4;
    if (value.shape === '斑块') { fx = fy = base * 0.06; octaves = 4; }
    if (value.shape === '条纹') { octaves = 2; }
    const stretch = value.shape === '条纹' ? 0.02 : value.shape === '纤维' ? 0.55 : 1;
    if (value.direction === '横' || value.direction === '斜') fx *= stretch;
    if (value.direction === '竖') fy *= stretch;
    // 拉得太长时一块纹理里连一个完整起伏都没有，平铺就会出现接缝：每块至少留一个半起伏。
    const minimum = 1.5 / size;
    fx = Math.max(fx, minimum); fy = Math.max(fy, minimum);
    const seed = hashSeed(`${textureDescriptorText(value)}|${seedText}`);
    const rotate = value.direction === '斜' ? ` transform='rotate(35 ${size / 2} ${size / 2})'` : '';
    const layer = (fill, alpha, offset, id) => `<filter id='${id}' x='0' y='0' width='100%' height='100%'><feTurbulence type='${kind}' baseFrequency='${fx.toFixed(3)} ${fy.toFixed(3)}' numOctaves='${octaves}' seed='${seed + offset}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='${alpha}'/></feComponentTransfer></filter><rect ${rotate ? "x='-50%' y='-50%' width='200%' height='200%'" : "width='100%' height='100%'"} fill='${fill}' filter='url(%23${id})'${rotate}/>`;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>${layer('%23fff', `0 0 ${light}`, 0, 'l')}${layer('%23000', `0 ${dark} 0`, 11, 'd')}</svg>`;
    return { image: `url("data:image/svg+xml,${svg.replace(/</g, '%3C').replace(/>/g, '%3E')}")`, size: `${size}px` };
}

function ensureStyle(doc) {
    if (!doc?.head || doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    // 纹理放在元素自己的 ::before（或 ::after）里，排在底色之上、内容之下；不改模型写的背景。
    style.textContent = `[${ON_ATTR}]{isolation:isolate}`
        + `[${ON_ATTR}="before"]::before,[${ON_ATTR}="after"]::after{content:"";position:absolute;inset:0;border-radius:inherit;`
        + 'background-image:var(--rm-texture-image);background-size:var(--rm-texture-size);background-repeat:repeat;pointer-events:none;z-index:-1}';
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
        return Array.isArray(list) ? [...new Set(list.map(row => String(row?.d || '')).filter(Boolean))].slice(-3) : [];
    } catch { return []; }
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
            if (el.hasAttribute(POS_ATTR)) { el.style.removeProperty('position'); el.removeAttribute(POS_ATTR); }
        }
        return 0;
    }
    const nodes = [...scope.querySelectorAll(`[${TEXTURE_ATTR}]`)];
    if (scope.matches?.(`[${TEXTURE_ATTR}]`)) nodes.unshift(scope);
    if (!nodes.length) return 0;
    const doc = scope.ownerDocument || scope;
    ensureStyle(doc);
    let applied = 0;
    nodes.forEach((el, index) => {
        if (el.hasAttribute(ON_ATTR)) { applied += 1; return; }
        const descriptor = parseTextureDescriptor(el.getAttribute(TEXTURE_ATTR));
        const faceKey = el.closest?.('details')?.getAttribute?.('data-rabbit-mirror-css-scope') || '';
        const { image, size } = textureImage(descriptor, `${faceKey}|${index}`);
        const which = pseudoFree(el, 'before') ? 'before' : pseudoFree(el, 'after') ? 'after' : '';
        if (!which) return; // 模型自己两个伪元素都用了：不抢，宁可不铺。
        const view = doc.defaultView || globalThis;
        let position = '';
        try { position = view.getComputedStyle(el).position; } catch { position = ''; }
        if (!position || position === 'static') { el.style.position = 'relative'; el.setAttribute(POS_ATTR, 'true'); }
        el.style.setProperty('--rm-texture-image', image);
        el.style.setProperty('--rm-texture-size', size);
        el.setAttribute(ON_ATTR, which);
        applied += 1;
        if (faceKey) remember(textureDescriptorText(descriptor), `${faceKey}|${index}`);
    });
    return applied;
}

/** 给模型的一小段规则；只在开关打开时发，打开时每面都要写一处。 */
export function materialTextureRule(settings = getSettings()) {
    if (!materialTextureEnabled(settings)) return '';
    const recent = recentMaterialTextures();
    // 开关是用户主动打开的：每个 HTML 面都写一处，不给「不加」的退路（以前写「可选」，模型几乎都跳过）。
    // 防模板化靠两点：质感从这一面的实物推出来；近几面用过的提醒换一种。不列举材质名，免得模型只在列出的几种里挑。
    return `材质纹理（已开启）：每个 HTML 面都在一个元素上写 ${TEXTURE_ATTR}="粗细 方向 形状 浓淡"，兔子镜会按描述叠一层很淡的纹理：粗细写细／中／粗，方向写无／横／竖／斜，形状写点／纤维／条纹／斑块，浓淡写很淡／淡／明显。写在这一面最像实物的主体或承载面上，质感从它在现实里是什么做的推出来；一面只写一处，不写在整面最外层背景上；底色、边缘、光泽和厚度仍由你写。${recent.length ? `近几面用过：${recent.join('；')}，这一面换一种。` : ''}`;
}
