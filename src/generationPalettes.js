import { COLOR_FAMILIES } from '../data/structured/generationPaletteIndex.js?rmv=1.62.37';
import { COLOR_SCALES } from '../data/structured/generationColorScales.js?rmv=1.62.37';

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
    const readingSurfaces = [surface[0], surface[2], surface[3], surface[4]];
    // These are reference-token pairings, not a scanner or an acceptance gate on model output.
    const text = readableInk(readingSurfaces, [surface[11], '#111111', '#FFFFFF']);
    const muted = readableInk(readingSurfaces, [surface[10], text]);
    const roles = Object.freeze({ background: surface[0], surface: surface[2], hover: surface[3], selected: surface[4],
        text, muted, border: surface[6], accent: scale[8], accentHover: scale[9],
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

export function selectGenerationPalettes(faceContexts, settings = {}, { darkCooldown = false } = {}) {
    const active = (faceContexts || []).filter(face => !face.textPresentation && !face.combo?.pureOrder);
    if (!active.length) return [];
    const candidates = active.flatMap(face => face.atmosphereFaces || [face]);
    const material = candidates.flatMap(face => [...(face.combo?.themes || []), ...(face.combo?.formats || [])])
        .map(item => `${item.title || ''} ${item.summary || ''}`).join(' ');
    // The body is not guessed locally. The model still chooses using its actual current body.
    const seed = candidates.map(face => `${face.combo?.interactionRecipeId || ''}:${(face.combo?.formatIds || []).join(',')}:${(face.combo?.themeIds || []).join(',')}`).join('|');
    let hash = 2166136261;
    for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    const offset = (hash >>> 0) % COLOR_FAMILIES.length;
    const ranked = COLOR_FAMILIES.map((item, index) => ({ item,
        score: item.fit.filter(word => material.includes(word)).length,
        order: (index + offset) % COLOR_FAMILIES.length,
    })).sort((a, b) => b.score - a.score || a.order - b.order);
    return ranked.slice(0, 8).map(({ item }, index) => {
        const variant = ((hash >>> 0) + index * 13) >>> 0;
        const support = item.companions[variant % item.companions.length];
        const surface = [item.id, item.neutral, 'gray'][Math.floor(variant / 3) % 3];
        const dark = settings.darkVisualMode === true || (!darkCooldown && index >= 6);
        return composeGenerationPalette(item.id, support, dark ? 'dark' : 'light', surface);
    });
}

export function buildGenerationPaletteRule(palettes, faceContexts) {
    if (!palettes?.length) return '';
    const numbers = (faceContexts || []).flatMap((face, index) => !face.textPresentation && !face.combo?.pureOrder ? [index + 1] : []);
    return `生成配色参考【仅 HTML 第 ${numbers.join('、')} 面；深浅色阶组合，不是固定皮肤】：
按实际正文氛围与选中形式材质选用或调整；以下各行依次为背景／承载面／正文／次要文字／强调底＋其配字／陪衬底＋其配字。文字配对仅适用于对应实色底；改色、透明叠加或纹理后仍须保持普通文字对比至少 4.5:1。强调色用于物件与局部，明暗和冷暖围绕主体建立层次。
${palettes.map(item => { const p = item.roles; return `${item.id}「${item.title}」${item.brightness === 'dark' ? '深调' : '浅调'}·${item.mood}：${p.background}／${p.surface}／${p.text}／${p.muted}／${p.accent}+${p.onAccent}／${p.companion}+${p.onCompanion}`; }).join('\n')}
用户明确配色与原媒介材质优先；深色模式、五轮深色冷却及近期配色避重照常执行。可在同类色阶内延伸，不限于列出的组合。`;
}
