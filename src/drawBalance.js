import { THEMATIC_CATEGORIES } from '../data/structured/thematicIndex.js?rmv=2.15.1';
import { PRESENTATION_FORMATS } from '../data/structured/presentationIndex.js?rmv=2.15.1';
export const DEFAULT_COOLDOWN_FACES = 30;
export const NEAR_COOLDOWN_FACES = 10;
const CATCH_ALL_THEME_IDS = ['A.0', 'B.0', 'C.0', 'E.0', 'F.0', 'G.0'];
const emptySummary = item => !String(item?.summary || '').trim();
function hasChildEntries(list, item) {
    const id = String(item?.id || '');
    if (list.some(other => String(other.id).startsWith(`${id}.`)))
        return true;
    const parts = id.split('.');
    if (parts.length < 2 || !/^[a-z]{2,}$/i.test(parts[parts.length - 1]))
        return false;
    const base = parts.slice(0, -1).join('.');
    return list.some(other => new RegExp(`^${base.replace(/\./g, '\\.')}\\.\\d`).test(String(other.id)));
}
const emptyHeaders = list => list.filter(item => emptySummary(item) && hasChildEntries(list, item)).map(item => String(item.id));
export const RANDOM_SKIP_THEME_IDS = new Set([...CATCH_ALL_THEME_IDS, ...emptyHeaders(THEMATIC_CATEGORIES)]);
export const RANDOM_SKIP_FORMAT_IDS = new Set(emptyHeaders(PRESENTATION_FORMATS));
export function randomSkipIds(kind, explicitFavoriteIds = []) {
    const keep = explicitFavoriteIds instanceof Set ? explicitFavoriteIds : new Set(explicitFavoriteIds || []);
    return new Set([...(kind === 'theme' ? RANDOM_SKIP_THEME_IDS : RANDOM_SKIP_FORMAT_IDS)].filter(id => !keep.has(id)));
}
export const COOLDOWN_KEEP_SHARE = 1 / 3;
export function cooldownForPool(pool, need, recentIds = [], ages = {}, { skip = null, favorites = null, faces = DEFAULT_COOLDOWN_FACES } = {}) {
    const ageOf = id => {
        const value = Math.floor(Number(ages?.[id]));
        return value >= 1 ? value : 1;
    };
    const window = Math.max(1, Math.floor(Number(faces)) || DEFAULT_COOLDOWN_FACES);
    const reach = new Map();
    for (const raw of recentIds || []) {
        const id = String(raw || '');
        if (!id)
            continue;
        const age = ageOf(id);
        const limit = favorites?.has?.(id) ? Math.min(window, NEAR_COOLDOWN_FACES) : window;
        if (age <= limit)
            reach.set(id, Math.min(age, reach.get(id) ?? Infinity));
    }
    const skipSet = skip instanceof Set ? skip : new Set(skip || []);
    const items = Array.isArray(pool) ? pool : [];
    const wanted = Math.max(1, Math.floor(Number(need)) || 1);
    const freeCount = blocked => items.filter(item => !blocked.has(String(item?.id || ''))).length;
    const at = (w, withSkip) => {
        const recent = new Set([...reach].filter(([, age]) => age <= w).map(([id]) => id));
        return { blocked: withSkip ? new Set([...recent, ...skipSet]) : recent, recent, window: w };
    };
    const thresholds = count => {
        const roomy = Math.max(wanted, Math.ceil(count * COOLDOWN_KEEP_SHARE));
        return w => w === NEAR_COOLDOWN_FACES ? Math.max(wanted, Math.min(roomy, 3)) : roomy;
    };
    const withSkip = thresholds(items.filter(item => !skipSet.has(String(item?.id || ''))).length);
    const withoutSkip = thresholds(items.length);
    const oldest = Math.max(1, ...reach.values());
    const edge = Math.min(oldest, NEAR_COOLDOWN_FACES);
    for (let w = oldest; w >= edge; w -= 1) {
        const result = at(w, true);
        if (freeCount(result.blocked) >= withSkip(w))
            return result;
    }
    for (let w = edge; w >= 1; w -= 1) {
        const result = at(w, false);
        if (freeCount(result.blocked) >= withoutSkip(w))
            return result;
    }
    const last = at(1, false);
    if (freeCount(last.blocked) >= wanted)
        return last;
    return { blocked: new Set(), recent: new Set(), window: 0 };
}
export const REPORT_LIKE_FORMAT_IDS = new Set([
    '1.6', '1.7', '1.8', '1.15',
    '6.5.4.2', '6.5.4.3', '6.5.4.4', '8.8', '2.13',
    '1.16', '1.21', '1.3.4', '3.3', '3.3.2', '6.3.3', '6.2.7.a', '6.2.7.b', '1.23',
]);
export const REPORT_LIKE_WEIGHT = 0.5;
export function reportLikeFactor(id, explicitFavoriteIds = null) {
    const key = String(id || '');
    if (!REPORT_LIKE_FORMAT_IDS.has(key))
        return 1;
    return explicitFavoriteIds?.has?.(key) ? 1 : REPORT_LIKE_WEIGHT;
}
const THEME_CLUSTERS = Object.freeze({
    'E:symptom': Object.freeze(['E.6', 'E.7', 'E.13', 'E.14', 'E.15', 'E.16', 'E.17', 'E.18']),
});
const THEME_CLUSTER_BY_ID = new Map(Object.entries(THEME_CLUSTERS).flatMap(([key, ids]) => ids.map(id => [id, key])));
export function themeClusterKey(id) {
    return THEME_CLUSTER_BY_ID.get(String(id || '')) || '';
}
export function isThemeClusterKey(key) {
    return Object.prototype.hasOwnProperty.call(THEME_CLUSTERS, String(key || ''));
}
export function themeClusterMembers(key) {
    return isThemeClusterKey(key) ? [...THEME_CLUSTERS[key]] : [];
}
export function sameClusterThemeIds(ids) {
    const keys = new Set([...(ids || [])].map(themeClusterKey).filter(Boolean));
    return [...keys].flatMap(key => THEME_CLUSTERS[key]);
}
