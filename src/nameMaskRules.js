export const NAME_MASK_MAX_RULES = 50;
const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
export function normalizeNameMaskRulesWithin(value, limit) {
    const list = Array.isArray(value) ? value : [];
    const seen = new Set();
    const out = [];
    for (const item of list) {
        const find = clean(typeof item === 'string' ? item : item?.find).slice(0, 40);
        const replace = clean(typeof item === 'string' ? '' : item?.replace).slice(0, 40);
        if (!find || seen.has(find))
            continue;
        seen.add(find);
        out.push({ find, replace });
        if (out.length >= limit)
            break;
    }
    return out;
}
export function normalizeNameMaskRules(value) {
    return normalizeNameMaskRulesWithin(value, NAME_MASK_MAX_RULES);
}
export function normalizeNameMaskCardRules(value) {
    const out = {};
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return out;
    for (const [key, list] of Object.entries(value).slice(-200)) {
        const name = String(key || '').trim().slice(0, 300);
        const rules = normalizeNameMaskRules(list);
        if (name && rules.length)
            out[name] = rules;
    }
    return out;
}
