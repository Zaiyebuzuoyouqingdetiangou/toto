// 智绘姬公开源码的角色预设：characterPresets[id]，姓名在 nameCN/nameEN，别名以 | 分隔。
// Schema verified against damoshen123/st-chatu8 index.js blob
// 6827bc26f36885cd406d13a04b054eaefa9b2de4 (defaultCharacterSettings / findBestCharacterMatch).
// Its matcher can fall back to all presets; this read-only adapter does not infer
// an enabled/current-chat identity or emit its fuzzy $...$ replacement tokens.
export function getChatu8ImageCharacters(context) {
    const presets = context?.extensionSettings?.['st-chatu8']?.characterPresets;
    if (!presets || typeof presets !== 'object' || Array.isArray(presets)) return [];
    const characters = [];
    for (const preset of Object.values(presets)) {
        if (!preset || typeof preset !== 'object' || Array.isArray(preset)) continue;
        // Only the shared trait/front-face evidence. Back/body/outfit variants
        // describe alternative views or clothes and must not be merged blindly.
        const tag = [...new Set([preset.characterTraits, preset.facialFeatures]
            .filter(value => typeof value === 'string').map(value => value.trim()).filter(Boolean))].join(', ');
        if (!tag) continue;
        const names = new Set([preset.nameCN, preset.nameEN]
            .filter(value => typeof value === 'string').flatMap(value => value.split('|'))
            .map(value => value.trim()).filter(Boolean));
        // Deduplicate aliases only within one preset. Keep cross-preset duplicates
        // so imagePlan's unique-name filter rejects ambiguous identities.
        for (const name of names) characters.push({ name, tag, nl: '' });
    }
    return characters;
}
