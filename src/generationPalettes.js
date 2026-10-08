import { paletteRecipeFor } from './paletteRecipes.js?rmv=1.67.36';
import { COLOR_FAMILIES } from '../data/structured/generationPaletteIndex.js?rmv=1.67.36';
import { COLOR_SCALES } from '../data/structured/generationColorScales.js?rmv=1.67.36';

const BY_ID = new Map(COLOR_FAMILIES.map(item => [item.id, item]));

function luminance(hex) {
    const [r, g, b] = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255)
        .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * r + .7152 * g + .0722 * b;
}

function readableInk(backgrounds, candidates) {
    const contrasts = candidates.map(ink => ({ ink, ratio: Math.min(...backgrounds.map(background => {
        const a = luminance(ink), b = luminance(background);
        return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    })) }));
    return (contrasts.find(item => item.ratio >= 4.5) || contrasts.sort((a, b) => b.ratio - a.ratio)[0]).ink;
}

export function composeGenerationPalette(familyId, companionId, brightness = 'light', surfaceId = familyId) {
    const family = BY_ID.get(familyId), companion = BY_ID.get(companionId), surfaceFamily = BY_ID.get(surfaceId);
    if (!family || !companion || !surfaceFamily) return null;
    const mode = brightness === 'dark' ? 'dark' : 'light';
    const scale = COLOR_SCALES[familyId][mode], support = COLOR_SCALES[companionId][mode], surface = COLOR_SCALES[surfaceId][mode];
    // Background carries the family hue so the scene reads as coloured, not a
    // neutral grey or near-black sheet; the reading surface stays a separate,
    // quieter layer of the surface family. Dark tiers use a mid-dark step so
    // the hue survives instead of collapsing into step-1 black.
    const background = mode === 'light' ? scale[2] : scale[3];
    const readingSurfaces = mode === 'light' ? [surface[1], surface[3], surface[4]] : [surface[1], surface[2], surface[3]];
    // These are reference-token pairings, not a scanner or an acceptance gate on model output.
    const text = readableInk([readingSurfaces[0], background], [surface[11], '#111111', '#FFFFFF']);
    const muted = readableInk([readingSurfaces[0]], [surface[10], text]);
    const roles = Object.freeze({ background, surface: readingSurfaces[0], hover: readingSurfaces[1], selected: readingSurfaces[2],
        text, muted, border: surface[6], accent: scale[8], accentHover: scale[9],
        objectSurface: scale[5], onObject: readableInk([scale[5]], [scale[11], '#111111', '#FFFFFF']),
        objectHover: scale[6], onObjectHover: readableInk([scale[6]], [scale[11], '#111111', '#FFFFFF']),
        onAccent: readableInk([scale[8]], ['#FFFFFF', '#111111', '#000000']),
        onAccentHover: readableInk([scale[9]], ['#FFFFFF', '#111111', '#000000']),
        companion: support[8], onCompanion: readableInk([support[8]], ['#FFFFFF', '#111111', '#000000']),
    });
    return Object.freeze({ id: `radix-${familyId}-${surfaceId}-${companionId}-${mode}`, family: familyId,
        surfaceFamily: surfaceId, companionFamily: companionId, brightness: mode,
        title: `${family.title}·${surfaceFamily.title}底·${companion.title}点色`, mood: family.mood,
        roles, scale, colors: Object.freeze([roles.background, roles.surface, text, roles.accent, roles.companion]),
    });
}

export function selectGenerationPalettes(faceContexts) {
    const selected = new Map();
    for (const face of faceContexts || []) {
        if (face.textPresentation || face.combo?.pureOrder) continue;
        for (const candidate of face.atmosphereFaces || [face]) {
            const index = paletteRecipeFor(candidate.combo);
            if (!index || selected.has(index.id)) continue;
            const detail = composeGenerationPalette(index.family, index.companionFamily, index.brightness, index.surfaceFamily);
            if (detail) selected.set(index.id, Object.freeze({ ...detail, code: index.code }));
        }
    }
    return [...selected.values()];
}

export function buildGenerationPaletteRule(palettes, faceContexts) {
    if (!palettes?.length) return '';
    const available = new Set(palettes.map(item => item.id));
    const assignments = (faceContexts || []).flatMap((face, i) => face.textPresentation || face.combo?.pureOrder ? []
        : (face.atmosphereFaces || [face]).flatMap((candidate, k) => { const p = paletteRecipeFor(candidate.combo);
            return p && available.has(p.id) ? [`第 ${i + 1} 面${face.atmosphereFaces ? `／选签 ${k + 1}` : ''}：${p.code}`] : []; })).join('；');
    if (!assignments) return '';
    const numbers = (faceContexts || []).flatMap((face, index) => !face.textPresentation && !face.combo?.pureOrder
        && (face.atmosphereFaces || [face]).some(candidate => available.has(paletteRecipeFor(candidate.combo)?.id)) ? [index + 1] : []);
    const sceneFaces = (faceContexts || []).flatMap((face, index) => !face.textPresentation && !face.combo?.pureOrder
        && (face.atmosphereFaces || [face]).some(candidate => candidate.visualSceneryMode) ? [index + 1] : []);
    const sceneNote = sceneFaces.length ? `\n动态视觉（第 ${sceneFaces.join('、')} 面）：色阶用于实际绘制的画面本体及其动画，形体、明暗与层次都由它画出；不直接铺成界面底色和卡片。` : '';
    return `生成配色参考【仅 HTML 第 ${numbers.join('、')} 面；深浅色阶组合，不是固定皮肤】：
${assignments}。配色仅随上述选中签执行，未列出的面／签使用其配色兜底。先按展现形式分清场地、媒介材质、主体部件、内容区域和操作状态，再依正文氛围映射色彩，不把各种媒介套成同一背景卡片。以下依次为背景／承载面／正文／次要文字／主体色面＋配字／强调底＋配字／陪衬底＋配字；背景带本组色相，承载面与之分层，不把整面压成同一块灰或近黑。主体色面用于该形式可辨认的主要物件或结构；纸面、照片等固有内容保持其材质。文字配对仅适用于对应实色底；改色、透明叠加或纹理后仍须保持普通文字对比至少 4.5:1，可在已抽色阶内延伸。
${palettes.map(item => { const p = item.roles; return `${item.code}「${item.title}」${item.brightness === 'dark' ? '深调' : '浅调'}·${item.mood}：${p.background}／${p.surface}／${p.text}／${p.muted}／${p.objectSurface}+${p.onObject}／${p.accent}+${p.onAccent}／${p.companion}+${p.onCompanion}`; }).join('\n')}${sceneNote}`;
}

export function buildPostGenerationColorRule(palettes, faceContexts) {
    if (!palettes?.length) return '';
    const available = new Set(palettes.map(item => item.id));
    const assignments = (faceContexts || []).flatMap((face, i) => face.textPresentation || face.combo?.pureOrder ? []
        : (face.atmosphereFaces || [face]).flatMap((candidate, k) => {
            const p = paletteRecipeFor(candidate.combo);
            return p && available.has(p.id) ? [`第 ${i+1} 面${face.atmosphereFaces ? `／选中签 ${k+1}` : ''}：data-rm-palette="${p.code}"`] : [];
        }));
    if (!assignments.length) return '';
    return `生成后换色【仅下列 HTML 面／选中签；普通、动态、组合共用】：
${assignments.join('；')}。把对应标记写在本面外层 details。
先按正文氛围和展现形式自然构造原色、材质、光影与交互；插件在完成后才应用配色签，原色保留。可换颜色在本面 CSS 根节点声明原始默认值（十六进制或 rgb/rgba）：--rmc-bg 背景、--rmc-surface 承载、--rmc-ink 正文、--rmc-muted 次字、--rmc-border 边缘、--rmc-object 主体、--rmc-on-object 主体配字、--rmc-accent 强调、--rmc-on-accent 配字、--rmc-companion 陪衬、--rmc-on-companion 配字、--rmc-highlight 高光、--rmc-shadow 阴影；按需使用 var()，不必凑齐。
透明颜色用对应 -rgb 变量（三个逗号分隔的 RGB 数值），透明度留在 rgba()；同角色不同明暗可另加 -1、-2 等后缀，保留原有色阶差。变量仅声明一次，各状态共用，状态差异用不同色阶。渐变位置、透明度、纹理、阴影尺寸和动画照常构造；血、雪、肤色、金属等有具体含义的固有色直接保留，不接换色变量。用户明确指定的颜色同样保留。不把换色标记或变量名显示给用户。`;
}
