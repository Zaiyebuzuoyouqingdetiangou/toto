import { GENERATION_PALETTE_INDEX, PALETTE_GROUP_LABELS } from '../data/structured/generationPaletteIndex.js?rmv=1.62.53';
const BY_ID = new Map(GENERATION_PALETTE_INDEX.map(item => [item.id, item]));

export function paletteRecipeFor(source) {
    if (source?.presentationMode === 'text' || source?.pureOrder) return null;
    return BY_ID.get(source?.paletteRecipeId) || null;
}
export function generationPaletteFields(source) {
    const recipe = paletteRecipeFor(source);
    return recipe ? { paletteRecipeId: recipe.id } : {};
}
export function observedPaletteGroup(record) {
    const p = record?.paletteFingerprint;
    if (!p || Number(p.confidence || 0) < .35 || !p.brightness) return '';
    const hue = p.hueFamily || 'neutral';
    const paleWarm = Number.isFinite(p.averageChroma) && p.averageChroma <= .25 && Number(p.averageLuminance) >= 210;
    if (['light', 'mid'].includes(p.brightness) && (p.saturation === 'low' || paleWarm) && p.temperature === 'warm'
        && ['neutral', 'yellow', 'orange'].includes(hue)) return 'warm_neutral';
    if (hue === 'neutral') return p.brightness === 'dark' ? 'dark_neutral' : 'cool_neutral';
    return Object.hasOwn(PALETTE_GROUP_LABELS, hue) ? hue : '';
}
export function recentPaletteGroups(recent = []) {
    return [...new Set(recent.flatMap(record => {
        const planned = paletteRecipeFor(record);
        // Selected plan and observed output stay distinct in history; either may
        // identify a family worth avoiding. Unknown scans are not invented results.
        return [planned?.colorGroup, planned?.surfaceGroup, observedPaletteGroup(record)].filter(Boolean);
    }))];
}
export function paletteGroupLabels(recent = []) {
    return recentPaletteGroups(recent).map(group => PALETTE_GROUP_LABELS[group]);
}
export function selectPaletteRecipe(combo, { randomUnit = Math.random, recent = [], usedIds = [], usedGroups = [], darkOnly = false, darkCooldown = false } = {}) {
    if (!combo || combo.presentationMode === 'text' || combo.pureOrder) return null;
    const blocked = new Set(recentPaletteGroups(recent)), used = new Set(usedIds), inBatch = new Set(usedGroups);
    let pool = GENERATION_PALETTE_INDEX.filter(item => darkOnly ? item.brightness === 'dark' : !darkCooldown || item.brightness === 'light');
    const fresh = pool.filter(item => !used.has(item.id));
    if (fresh.length) pool = fresh;
    const hitCount = item => Number(blocked.has(item.colorGroup)) + Number(blocked.has(item.surfaceGroup));
    const minHits = Math.min(...pool.map(hitCount));
    pool = pool.filter(item => hitCount(item) === minHits);
    const batchHits = item => Number(inBatch.has(item.colorGroup)) + Number(inBatch.has(item.surfaceGroup));
    const minBatchHits = Math.min(...pool.map(batchHits));
    pool = pool.filter(item => batchHits(item) === minBatchHits);
    const material = (combo.formats || []).map(item => `${item.title || ''} ${item.summary || ''}`).join(' ');
    const atmosphere = (combo.themes || []).map(item => `${item.title || ''} ${item.summary || ''}`).join(' ');
    const weights = pool.map(item => (1 + item.fit.filter(word => material.includes(word)).length * 3
        + item.fit.filter(word => atmosphere.includes(word)).length)
        * (!darkOnly && !darkCooldown && item.brightness === 'light' ? 8 : 1));
    const raw = Number(randomUnit()), roll = Number.isFinite(raw) ? Math.max(0, Math.min(.999999999, raw)) : 0;
    let cursor = roll * weights.reduce((sum, n) => sum + n, 0);
    return pool.find((_item, index) => (cursor -= weights[index]) < 0) || pool[pool.length - 1] || null;
}
export function attachPaletteRecipes(combo, options = {}) {
    if (!combo || combo.presentationMode === 'text' || combo.pureOrder) return combo;
    const usedIds = options.usedIds || [], usedGroups = options.usedGroups || [];
    const menu = combo.atmosphereMenu?.length > 1;
    const targets = menu ? combo.atmosphereMenu : [combo];
    for (const target of targets) {
        const source = menu ? { ...combo, ...target, formats: (target.formatFullLines || target.formatLines || []).map(title => ({ title })),
            themes: (target.themeFullLines || target.themeLines || []).map(title => ({ title })) } : combo;
        const existing = paletteRecipeFor(source);
        const modeMatches = existing && (!options.darkOnly || existing.brightness === 'dark')
            && (options.darkOnly || !options.darkCooldown || existing.brightness === 'light');
        const repeatInBatch = options.rerollUsed && existing && (usedIds.includes(existing.id)
            || usedGroups.includes(existing.colorGroup) || usedGroups.includes(existing.surfaceGroup));
        const modeVariant = existing && !modeMatches ? BY_ID.get(existing.id.replace(/-(?:light|dark)$/, options.darkOnly ? '-dark' : '-light')) : null;
        const held = !repeatInBatch ? (modeMatches ? existing : modeVariant) : null;
        const chosen = held || selectPaletteRecipe(source, { ...options, usedIds, usedGroups });
        if (!chosen) continue;
        target.paletteRecipeId = chosen.id;
        usedIds.push(chosen.id); usedGroups.push(chosen.colorGroup, chosen.surfaceGroup);
    }
    if (menu) delete combo.paletteRecipeId;
    return combo;
}
