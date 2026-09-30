import { GENERATION_PALETTES } from '../data/structured/generationPaletteIndex.js?rmv=1.62.36';

export function selectGenerationPalettes(faceContexts, settings = {}, { darkCooldown = false } = {}) {
    const active = (faceContexts || []).filter(face => !face.textPresentation && !face.combo?.pureOrder);
    if (!active.length) return [];
    const material = active.flatMap(face => face.atmosphereFaces || [face])
        .flatMap(face => [...(face.combo?.themes || []), ...(face.combo?.formats || [])])
        .map(item => `${item.title || ''} ${item.summary || ''}`).join(' ');
    const darkOnly = settings.darkVisualMode === true;
    // No semantic guesses about hidden/current body: the model chooses by actual body.
    // Rank form affinities, rotate the remaining families by local selection IDs.
    const seed = active.flatMap(face => face.atmosphereFaces || [face])
        .map(face => `${face.combo?.interactionRecipeId || ''}:${(face.combo?.formatIds || []).join(',')}`).join('|');
    let hash = 2166136261;
    for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    const families = GENERATION_PALETTES.filter(item => item.brightness === (darkOnly ? 'dark' : 'light'));
    const offset = (hash >>> 0) % families.length;
    const ranked = families.map((item, index) => ({ item,
        score: item.fit.split('|').filter(word => material.includes(word)).length,
        order: (index + offset) % families.length,
    })).sort((a, b) => b.score - a.score || a.order - b.order);
    const chosen = ranked.slice(0, 8).map(entry => entry.item);
    // Ordinary mode may still use a dark reference when not cooling down. Only
    // two references are dark so the menu doesn't recreate an all-dark default.
    if (!darkOnly && !darkCooldown) for (const index of [6, 7]) {
        chosen[index] = GENERATION_PALETTES.find(item => item.family === chosen[index].family && item.brightness === 'dark');
    }
    return chosen;
}

export function buildGenerationPaletteRule(palettes, faceContexts) {
    if (!palettes?.length) return '';
    const numbers = (faceContexts || []).flatMap((face, index) => !face.textPresentation && !face.combo?.pureOrder ? [index + 1] : []);
    return `生成配色参考【仅 HTML 第 ${numbers.join('、')} 面；是参考，不是固定皮肤】：
先按实际最新正文的情绪、时代、天气和选中形式的材质，选择贴合的色彩关系；下面每行依次为背景／主要承载／正文／强调／陪衬。可以调整色相与明度，保留可读对比及背景、主体、阅读面之间的层次，不平均铺满所有颜色，不把高饱和强调色涂满大底。
${palettes.map(item => `${item.id}「${item.title}」${item.brightness === 'dark' ? '深调' : '浅调'}·${item.mood}：${item.colors.join('／')}`).join('\n')}
正文色用于所列背景和承载面；强调／陪衬用于物件、边缘与局部，不直接替代正文色。材质受光和阴影从主体颜色推导，有色暗部与亮部保持联系。用户明确配色、原媒介材质、深色模式和正在执行的五轮深色冷却优先于这些参考；冷却时大底与阅读面采用中高明度。近期具体配色避重仍执行；不以灰黑底冒充“高级”，也不把所有氛围统一成米白。`;
}
