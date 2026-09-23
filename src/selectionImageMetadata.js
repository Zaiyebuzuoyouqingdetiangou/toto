export function isExternalSelectionId(id) {
    return typeof id === 'string' && id.length <= 2048 && /^ext:[A-Za-z0-9:._!~*'()-]+$/.test(id);
}

// Keep only bounded display material belonging to an actually selected format.
// Imported raw content and arbitrary descriptor fields never enter recipes.
export function compactFormatDescriptors(metadata) {
    const selected = new Set(Array.isArray(metadata?.formatIds) ? metadata.formatIds : []);
    const seen = new Set();
    const result = [];
    const text = (value, limit) => typeof value === 'string' ? value.slice(0, limit) : '';
    for (const item of Array.isArray(metadata?.formatDescriptors) ? metadata.formatDescriptors : []) {
        const id = item?.id;
        if (typeof id !== 'string' || !id || id.length > 2048 || !selected.has(id) || seen.has(id)) continue;
        seen.add(id);
        result.push({ id, title: text(item.title, 160), summary: text(item.summary, 210),
            tags: (Array.isArray(item.tags) ? item.tags : []).slice(0, 4).map(tag => text(tag, 64)).filter(Boolean) });
        if (result.length >= 8) break;
    }
    return result;
}
