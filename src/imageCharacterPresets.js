export function getChatu8ImageCharacters(context) {
    const presets = context?.extensionSettings?.['st-chatu8']?.characterPresets;
    if (!presets || typeof presets !== 'object' || Array.isArray(presets))
        return [];
    const characters = [];
    for (const preset of Object.values(presets)) {
        if (!preset || typeof preset !== 'object' || Array.isArray(preset))
            continue;
        const tag = [...new Set([preset.characterTraits, preset.facialFeatures]
                .filter(value => typeof value === 'string').map(value => value.trim()).filter(Boolean))].join(', ');
        if (!tag)
            continue;
        const names = new Set([preset.nameCN, preset.nameEN]
            .filter(value => typeof value === 'string').flatMap(value => value.split('|'))
            .map(value => value.trim()).filter(Boolean));
        for (const name of names)
            characters.push({ name, tag, nl: '' });
    }
    return characters;
}
