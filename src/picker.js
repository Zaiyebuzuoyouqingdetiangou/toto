import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.5.2";
import { usesModelOriginalColors } from './visualDesign.js?rmv=2.5.2';
import { faceDrawRule, hasFaceDrawRules, normalizeFaceDrawRules } from './faceDrawRules.js?rmv=2.5.2';
import { drawFaceRule, faceDrawFingerprint } from './faceDrawEngine.js?rmv=2.5.2';
import { attachPaletteRecipes } from './paletteRecipes.js?rmv=2.5.2';
import { THEMATIC_CATEGORIES } from '../data/structured/thematicIndex.js?rmv=2.5.2';
import { PRESENTATION_FORMATS } from '../data/structured/presentationIndex.js?rmv=2.5.2';
import { getCurrentChatKey, getDirectiveScopedPick, getFormatEligibleMisses, getLastCombo, getRecentGenerationAttemptIds, getRecentIds, getRecentInteractionFamilies, getRecentDiversityHistory, getActivePaletteCooldown, recordGenerationAttempt, recordFormatEligibleMissRound, setDirectiveScopedPick, setLastCombo, setPendingComboBatch, readPendingComboBatch, clearPendingComboBatch, clearPendingCombo, createPendingComboBatchPlan, findPendingComboBatchPlan, readFaceDrawCursorState, } from './storage.js?rmv=2.5.2';
import { canonicalFormatId, filterRandomFormatPool, filterRandomThemePool, getFavoritesState } from './blacklist.js?rmv=2.5.2';
import { COLLECTION_ONLY, withCollectionTaste } from './continuationCache.js?rmv=2.5.2';
import { describeBatchPlanFailure } from './externalWorldBook/errors.js?rmv=2.5.2';
import { isDocumentFormat } from './documentFormats.js?rmv=2.5.2';
import { requestedPresentationMode, presentationModeFields, visualSceneryCombinationEnabled, visualSceneryEnabled, isBlankLongTextSelection } from './presentationMode.js?rmv=2.5.2';
import { planBatchInteractionDiversity } from './batchInteractionDiversity.js?rmv=2.5.2';
import { chooseExternalSource, externalPoolActive, externalPoolHasAvailable, externalPoolItem, getExternalPoolSelectionKey, getExternalPoolSnapshot, pickExternalItems, sourceMixModeIsExternalOnly, } from './externalWorldBook/externalPool.js?rmv=2.5.2';
function randomUnit() {
    try {
        const cryptoApi = globalThis.crypto;
        if (cryptoApi?.getRandomValues) {
            const value = new Uint32Array(1);
            cryptoApi.getRandomValues(value);
            return value[0] / 0x100000000;
        }
    }
    catch {
    }
    return Math.random();
}
function randomInt(min, max) {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return Math.floor(randomUnit() * (high - low + 1)) + low;
}
function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(randomUnit() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function weightedThemeCount(settings) {
    if (settings?.singlePairSampling === true)
        return 1;
    const min = Number(settings.themesMin) || 1;
    const max = Number(settings.themesMax) || 3;
    const r = randomUnit();
    const count = r < 0.75 ? 1 : r < 0.97 ? 2 : 3;
    return clamp(count, min, max);
}
function weightedFormatCount(settings) {
    if (settings?.singlePairSampling === true)
        return 1;
    const min = Number(settings.formatsMin) || 1;
    const max = Number(settings.formatsMax) || 2;
    const count = randomUnit() < 0.85 ? 1 : 2;
    return clamp(count, min, max);
}
const UI_REVIEW_FOCUS = [
    __rmT("l01S2MrJmnuHkncAp3l"),
    __rmT("KnouYSFoQTjZqTI49yT"),
    __rmT("_adh5aB63Ej7pbIC"),
    __rmT("CeVFmW8YdgE"),
    __rmT("F9XPnStX_h8GnJzdq0o3q6Kw"),
    __rmT("jzyYUfH_Mtv.mdI3BlG"),
    __rmT("FBPbSNPFq8SkVqMjXqXeMk"),
    __rmT("9HiLy412XirtK.i5"),
    __rmT("BwiHUvxB30B3MovFfoE"),
    __rmT("LeAwf.01aSsGn1c48XhKMxVU"),
    __rmT("gq6MYr1VaDZOVKFLWuTvsf"),
    __rmT("Yd6q4whsVwNuzmIC"),
    __rmT("Yd6q4iEEj_gqltIC"),
    __rmT("8AYZShmp5X41nfUt3ZCncfKS"),
    __rmT("neHkwVzSFjID0NZdzRmj83Zh")
];
function pickUiReviewFocus(count = 4) {
    const n = Math.max(3, Math.min(Number(count) || 4, UI_REVIEW_FOCUS.length));
    const mustHave = [__rmT("l01S2MrJmnuHkncAp3l"), __rmT("KnouYSFoQTjZqTI49yT"), __rmT("neHkwVzSFjID0NZdzRmj83Zh")];
    const rest = UI_REVIEW_FOCUS.filter(x => !mustHave.includes(x));
    return [...mustHave, ...shuffle(rest).slice(0, Math.max(0, n - mustHave.length))];
}
let cachedPick = null;
function normalizeGenerationScopeKey(value) {
    return String(value || '').trim();
}
function hashText(text) {
    let hash = 2166136261;
    for (const char of String(text || '')) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}
function compactUnique(values) {
    return [...new Set((values || []).map(value => String(value || '').trim()).filter(Boolean))];
}
function mergeRecentHitMaps(base = {}, attempts = {}) {
    const result = {};
    for (const source of [base, attempts]) {
        for (const [key, raw] of Object.entries(source || {})) {
            const count = Math.max(0, Math.floor(Number(raw) || 0));
            if (key && count)
                result[key] = Math.max(Number(result[key] || 0), count);
        }
    }
    return result;
}
function mergeRecent(base, attempts) {
    return {
        themeIds: compactUnique([...(base?.themeIds || []), ...(attempts?.themeIds || [])]),
        formatIds: compactUnique([...(base?.formatIds || []), ...(attempts?.formatIds || [])]),
        themeGroups: compactUnique([...(base?.themeGroups || []), ...(attempts?.themeGroups || [])]),
        formatGroups: compactUnique([...(base?.formatGroups || []), ...(attempts?.formatGroups || [])]),
        themeIdHits: mergeRecentHitMaps(base?.themeIdHits, attempts?.themeIdHits),
        formatIdHits: mergeRecentHitMaps(base?.formatIdHits, attempts?.formatIdHits),
        ...((base?.textIds?.length || attempts?.textIds?.length) ? {
            textIds: compactUnique([...(base?.textIds || []), ...(attempts?.textIds || [])]),
            textIdHits: mergeRecentHitMaps(base?.textIdHits, attempts?.textIdHits),
        } : {}),
        themeGroupHits: mergeRecentHitMaps(base?.themeGroupHits, attempts?.themeGroupHits),
        formatGroupHits: mergeRecentHitMaps(base?.formatGroupHits, attempts?.formatGroupHits),
        uiReviewFocus: Array.isArray(base?.uiReviewFocus) ? [...base.uiReviewFocus] : [],
    };
}
function allowByMode(_item, mode) {
    if (mode === 'off')
        return false;
    return true;
}
function fairnessFactor(eligibleMisses) {
    const misses = Math.max(0, Math.floor(Number(eligibleMisses) || 0));
    if (misses >= 320)
        return 2.00;
    if (misses >= 220)
        return 1.70;
    if (misses >= 140)
        return 1.45;
    if (misses >= 80)
        return 1.25;
    if (misses >= 40)
        return 1.10;
    return 1.00;
}
function favoriteMultiplierFor(id, favoriteIds, multiplierMap = {}) {
    if (!(favoriteIds instanceof Set ? favoriteIds : new Set(favoriteIds || [])).has(id))
        return 1;
    const raw = multiplierMap?.[id];
    const empty = raw == null || (typeof raw === 'string' && !raw.trim());
    const parsed = empty ? NaN : Number(raw);
    if (!Number.isFinite(parsed))
        return 3;
    return Math.max(1, Math.min(50, parsed));
}
function favoriteThemeFamilyFactor(items, favorites, multiplierMap = {}) {
    let maxMultiplier = 1;
    for (const item of items || []) {
        if (!favorites.has(item.id))
            continue;
        maxMultiplier = Math.max(maxMultiplier, favoriteMultiplierFor(item.id, favorites, multiplierMap));
    }
    if (maxMultiplier <= 1)
        return 1;
    return Math.min(6, 1 + (maxMultiplier - 1) * 0.75);
}
function recentDiversityFactor(hitCount, firstPenalty = 0.35, floor = 0.12) {
    const hits = Math.max(0, Math.floor(Number(hitCount) || 0));
    if (!hits)
        return 1;
    const first = Math.max(0.01, Math.min(1, Number(firstPenalty) || 0.35));
    const minimum = Math.max(0.01, Math.min(first, Number(floor) || 0.12));
    return Math.max(minimum, first * Math.pow(0.72, hits - 1));
}
function formatFamilyKey(itemOrId) {
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId?.id;
    const parts = String(id || '').split('.').filter(Boolean);
    if (parts.length >= 2)
        return `${parts[0]}.${parts[1]}`;
    return String(id || 'unknown');
}
function recentFamilyHits(idHits = {}, familyKey = value => String(value || '')) {
    const result = {};
    for (const [id, raw] of Object.entries(idHits || {})) {
        const family = familyKey(id);
        const count = Math.max(0, Math.floor(Number(raw) || 0));
        if (family && count)
            result[family] = Number(result[family] || 0) + count;
    }
    return result;
}
function familySizeMap(items, familyKey) {
    const counts = new Map();
    for (const item of items || []) {
        const key = familyKey(item);
        counts.set(key, Number(counts.get(key) || 0) + 1);
    }
    return counts;
}
function immediateFamilySet(values) {
    return new Set((Array.isArray(values) ? values : []).map(value => String(value || '')).filter(Boolean));
}
const HIERARCHY_EXPONENT = 0.8;
const PARENT_ITEM_FACTOR = 0.35;
const SAME_GROUP_IN_DRAW_FACTOR = 0.3;
function hierarchyBaseWeights(items, familyKey) {
    const list = Array.isArray(items) ? items : [];
    const ids = list.map(item => String(item?.id || ''));
    const parentIds = new Set();
    for (const id of ids) {
        const parts = id.split('.');
        for (let cut = parts.length - 1; cut >= 1; cut -= 1)
            parentIds.add(parts.slice(0, cut).join('.'));
    }
    const groups = new Map();
    for (const item of list) {
        const group = String(item?.group || '?');
        const family = familyKey(item);
        if (!groups.has(group))
            groups.set(group, new Map());
        const families = groups.get(group);
        if (!families.has(family))
            families.set(family, []);
        families.get(family).push(item);
    }
    const itemWeights = new Map();
    const familyWeights = new Map();
    for (const families of groups.values()) {
        const groupSize = [...families.values()].reduce((sum, members) => sum + members.length, 0);
        const groupWeight = Math.pow(Math.max(1, groupSize), HIERARCHY_EXPONENT);
        const familyRaw = [...families.entries()].map(([key, members]) => [key, members, Math.pow(Math.max(1, members.length), HIERARCHY_EXPONENT)]);
        const familyTotal = familyRaw.reduce((sum, entry) => sum + entry[2], 0) || 1;
        for (const [key, members, raw] of familyRaw) {
            const familyWeight = groupWeight * raw / familyTotal;
            familyWeights.set(key, familyWeight);
            const leafRaw = members.map(item => [item, parentIds.has(String(item?.id || '')) ? PARENT_ITEM_FACTOR : 1]);
            const leafTotal = leafRaw.reduce((sum, entry) => sum + entry[1], 0) || 1;
            for (const [item, leaf] of leafRaw)
                itemWeights.set(item.id, familyWeight * leaf / leafTotal);
        }
    }
    return { itemWeights, familyWeights };
}
const DOCUMENT_FORMAT_IDS = new Set(PRESENTATION_FORMATS.filter(isDocumentFormat).map(item => item.id));
export function isDocumentFormatId(id) { return DOCUMENT_FORMAT_IDS.has(String(id || '')); }
let batchDocumentHits = 0;
function recentDocumentFaceHits(limit = 3) {
    try {
        return Math.min(limit, batchDocumentHits + getRecentDiversityHistory(limit).filter(item => item?.presentationMode !== 'text').slice(-limit)
            .filter(item => Array.isArray(item?.formatIds) && item.formatIds.some(isDocumentFormatId)).length);
    }
    catch {
        return batchDocumentHits;
    }
}
function weightedSample(pool, count, recentIds = [], recentGroups = [], avoidRepeat = true, hardExcludedIds = [], favoriteIds = [], eligibleMisses = {}, favoriteMultipliers = {}, recentGroupHitMap = {}, recentFamilyHitMap = {}, immediateFamilyKeys = [], groupCooldownEnabled = true) {
    const recent = new Set(recentIds || []);
    const groups = new Set(recentGroups || []);
    const hardExcluded = new Set(hardExcludedIds || []);
    const favorites = new Set(favoriteIds || []);
    let candidates = [...pool];
    if (hardExcluded.size) {
        const filtered = candidates.filter(x => !hardExcluded.has(x.id));
        if (filtered.length >= count)
            candidates = filtered;
    }
    if (avoidRepeat) {
        const filtered = candidates.filter(x => !recent.has(x.id));
        if (filtered.length >= count)
            candidates = filtered;
    }
    const immediateFamilies = avoidRepeat ? immediateFamilySet(immediateFamilyKeys) : new Set();
    const selected = [];
    const used = new Set();
    const usedFamilies = new Set();
    const usedGroups = new Set();
    const documentHits = avoidRepeat ? recentDocumentFaceHits() : 0;
    const groupSizes = new Map();
    for (const item of pool)
        groupSizes.set(String(item?.group || ''), (groupSizes.get(String(item?.group || '')) || 0) + 1);
    const groupWindow = Object.values(recentGroupHitMap || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
    const groupExcess = group => {
        const key = String(group || '');
        const hits = Number(recentGroupHitMap?.[key] || (groups.has(key) ? 1 : 0));
        if (!groupWindow || !pool.length)
            return hits;
        return Math.max(0, hits - Math.floor((groupSizes.get(key) || 0) / pool.length * groupWindow));
    };
    while (selected.length < count && used.size < candidates.length) {
        let available = candidates.filter(item => !used.has(item.id));
        if (avoidRepeat) {
            const freshIds = available.filter(item => !recent.has(item.id) && !hardExcluded.has(item.id));
            if (freshIds.length)
                available = freshIds;
        }
        const freshDifferentFamilies = available.filter(item => {
            const family = formatFamilyKey(item);
            return !immediateFamilies.has(family) && !usedFamilies.has(family);
        });
        if (freshDifferentFamilies.length) {
            available = freshDifferentFamilies;
        }
        else {
            const differentFamilies = available.filter(item => !usedFamilies.has(formatFamilyKey(item)));
            if (differentFamilies.length)
                available = differentFamilies;
        }
        const weighted = available
            .map(item => {
            let weight = 1;
            const groupHits = groupExcess(item.group);
            if (avoidRepeat && groupHits)
                weight *= recentDiversityFactor(groupHits, groupCooldownEnabled ? 0.35 : 0.7, groupCooldownEnabled ? 0.12 : 0.4);
            if (DOCUMENT_FORMAT_IDS.has(item.id)) {
                if (avoidRepeat && documentHits)
                    weight *= recentDiversityFactor(documentHits, 0.5, 0.15);
                if (selected.some(chosen => DOCUMENT_FORMAT_IDS.has(chosen.id)))
                    weight *= 0.3;
            }
            if (usedGroups.has(String(item.group || '')))
                weight *= SAME_GROUP_IN_DRAW_FACTOR;
            const familyHits = Number(recentFamilyHitMap?.[formatFamilyKey(item)] || 0);
            if (avoidRepeat && familyHits)
                weight *= recentDiversityFactor(familyHits, 0.28);
            if (favorites.has(item.id))
                weight *= favoriteMultiplierFor(item.id, favorites, favoriteMultipliers);
            weight *= fairnessFactor(eligibleMisses?.[item.id]);
            return { item, weight };
        });
        const total = weighted.reduce((sum, x) => sum + x.weight, 0);
        let roll = randomUnit() * total;
        let chosen = weighted[weighted.length - 1]?.item;
        for (const entry of weighted) {
            roll -= entry.weight;
            if (roll <= 0) {
                chosen = entry.item;
                break;
            }
        }
        if (!chosen)
            break;
        selected.push(chosen);
        used.add(chosen.id);
        usedFamilies.add(formatFamilyKey(chosen));
        usedGroups.add(String(chosen.group || ''));
    }
    const finalSelected = selected.length
        ? selected
        : shuffle(candidates).slice(0, Math.max(1, Math.min(count, candidates.length)));
    return {
        selected: finalSelected,
        eligibleIds: candidates.map(item => String(item?.id || '')).filter(Boolean),
    };
}
function themeFamilyKey(itemOrId) {
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId?.id;
    const parts = String(id || '').split('.').filter(Boolean);
    if (parts.length >= 2)
        return `${parts[0]}.${parts[1]}`;
    return String(id || 'unknown');
}
function pickWeightedEntry(entries, getWeight) {
    if (!entries.length)
        return null;
    const weighted = entries.map(entry => ({
        entry,
        weight: Math.max(0.0001, Number(getWeight(entry)) || 0.0001),
    }));
    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let roll = randomUnit() * total;
    for (const item of weighted) {
        roll -= item.weight;
        if (roll <= 0)
            return item.entry;
    }
    return weighted[weighted.length - 1]?.entry || null;
}
function themeFamilyBaseWeight(itemCount) {
    return Math.pow(Math.max(1, Number(itemCount) || 1), 0.6);
}
function weightedThemeSample(pool, count, recentIds = [], recentGroups = [], avoidRepeat = true, hardExcludedIds = [], favoriteIds = [], favoriteMultipliers = {}, recentGroupHitMap = {}, recentFamilyHitMap = {}, immediateFamilyKeys = []) {
    const recent = new Set(recentIds || []);
    const recentGroupSet = new Set(recentGroups || []);
    const recentFamilySet = new Set((recentIds || []).map(themeFamilyKey));
    const hardExcluded = new Set(hardExcludedIds || []);
    const favorites = new Set(favoriteIds || []);
    let workingPool = [...pool];
    if (hardExcluded.size) {
        const filtered = workingPool.filter(item => !hardExcluded.has(item.id));
        if (filtered.length >= Math.max(1, Number(count) || 1))
            workingPool = filtered;
    }
    if (avoidRepeat && recent.size) {
        const filtered = workingPool.filter(item => !recent.has(item.id));
        if (filtered.length >= Math.max(1, Number(count) || 1))
            workingPool = filtered;
    }
    const immediateFamilies = avoidRepeat ? immediateFamilySet(immediateFamilyKeys) : new Set();
    const families = new Map();
    for (const item of workingPool) {
        const key = themeFamilyKey(item);
        if (!families.has(key))
            families.set(key, { key, group: item.group, items: [] });
        families.get(key).items.push(item);
    }
    const familyList = [...families.values()];
    const { itemWeights: themeItemWeights, familyWeights: themeFamilyWeights } = hierarchyBaseWeights(workingPool, themeFamilyKey);
    const familyWeightTotal = [...themeFamilyWeights.values()].reduce((sum, weight) => sum + weight, 0) || 1;
    const groupWeightTotal = new Map();
    for (const entry of familyList) {
        const key = String(entry.group || '');
        groupWeightTotal.set(key, (groupWeightTotal.get(key) || 0) + (Number(themeFamilyWeights.get(entry.key)) || 0));
    }
    const recentWindow = Math.max(recent.size, Object.values(recentGroupHitMap || {}).reduce((sum, value) => sum + (Number(value) || 0), 0));
    const excessHits = (hits, share) => Math.max(0, hits - Math.floor(share * recentWindow));
    const groupExcess = group => {
        const key = String(group || '');
        const hits = Number(recentGroupHitMap?.[key] || (recentGroupSet.has(key) ? 1 : 0));
        return excessHits(hits, (groupWeightTotal.get(key) || 0) / familyWeightTotal);
    };
    const familyExcess = entry => {
        const hits = Number(recentFamilyHitMap?.[entry.key] || (recentFamilySet.has(entry.key) ? 1 : 0));
        return excessHits(hits, (Number(themeFamilyWeights.get(entry.key)) || 0) / familyWeightTotal);
    };
    const selected = [];
    const usedFamilies = new Set();
    const usedGroups = new Set();
    const targetCount = Math.max(0, Math.min(Number(count) || 0, familyList.length));
    const familyItemStage = family => {
        let itemCandidates = [...family.items];
        if (avoidRepeat) {
            const freshItems = itemCandidates.filter(item => !recent.has(item.id));
            if (freshItems.length)
                itemCandidates = freshItems;
        }
        const baseWeight = item => (Number(themeItemWeights.get(item.id)) || 1) * (!avoidRepeat || !recent.has(item.id) ? 1 : 0.12);
        const favoriteWeight = item => baseWeight(item) * (favorites.has(item.id) ? favoriteMultiplierFor(item.id, favorites, favoriteMultipliers) : 1);
        return { itemCandidates, baseWeight, favoriteWeight };
    };
    while (selected.length < targetCount) {
        let availableFamilies = familyList.filter(family => !usedFamilies.has(family.key));
        if (!availableFamilies.length)
            break;
        if (avoidRepeat) {
            const freshIds = availableFamilies.filter(family => family.items.some(item => !recent.has(item.id) && !hardExcluded.has(item.id)));
            if (freshIds.length)
                availableFamilies = freshIds;
            const minHits = Math.min(...availableFamilies.map(familyExcess));
            availableFamilies = availableFamilies.filter(family => familyExcess(family) === minHits);
        }
        const freshFamilies = availableFamilies.filter(family => !immediateFamilies.has(family.key));
        if (freshFamilies.length)
            availableFamilies = freshFamilies;
        const plans = new Map(availableFamilies.map(entry => {
            const base = Number(themeFamilyWeights.get(entry.key)) || themeFamilyBaseWeight(entry.items.length);
            let weight = base;
            if (usedGroups.has(String(entry.group || '')))
                weight *= SAME_GROUP_IN_DRAW_FACTOR;
            const groupHits = groupExcess(entry.group);
            const familyHits = familyExcess(entry);
            if (avoidRepeat && groupHits)
                weight *= recentDiversityFactor(groupHits, 0.35);
            if (avoidRepeat && familyHits)
                weight *= recentDiversityFactor(familyHits, 0.25);
            const { itemCandidates, baseWeight } = familyItemStage(entry);
            const itemTotal = itemCandidates.reduce((sum, item) => sum + baseWeight(item), 0) || 1;
            return [entry, { base, weight, itemCandidates, natural: item => weight * baseWeight(item) / itemTotal }];
        }));
        const candidateCount = [...plans.values()].reduce((sum, plan) => sum + plan.itemCandidates.length, 0) || 1;
        const averageItem = [...plans.values()].reduce((sum, plan) => sum + plan.base, 0) / candidateCount;
        const itemWeight = (plan, item) => {
            const natural = plan.natural(item);
            if (!favorites.has(item.id))
                return natural;
            const multiplier = favoriteMultiplierFor(item.id, favorites, favoriteMultipliers);
            const cooled = plan.base > 0 ? plan.weight / plan.base : 1;
            return multiplier * Math.max(natural, averageItem * cooled);
        };
        const family = pickWeightedEntry(availableFamilies, entry => {
            const plan = plans.get(entry);
            return plan.itemCandidates.reduce((sum, item) => sum + itemWeight(plan, item), 0) || plan.weight;
        });
        if (!family)
            break;
        usedFamilies.add(family.key);
        usedGroups.add(String(family.group || ''));
        const plan = plans.get(family);
        const chosen = pickWeightedEntry(plan.itemCandidates, item => itemWeight(plan, item));
        if (chosen)
            selected.push(chosen);
    }
    if (selected.length)
        return selected;
    return shuffle(workingPool).slice(0, Math.max(1, Math.min(count, workingPool.length)));
}
function sourceAwareThemeSample({ settings, pool, count, recentIds, recentIdHits, recentGroups, avoidRepeat, hardExcludedIds, favoriteIds, favoriteMultipliers, recentGroupHitMap, recentFamilyHitMap, immediateFamilyKeys, externalHardExcludedIds = [] }) {
    if (!externalPoolActive(settings, 'theme')) {
        return weightedThemeSample(pool, count, recentIds, recentGroups, avoidRepeat, hardExcludedIds, favoriteIds, favoriteMultipliers, recentGroupHitMap, recentFamilyHitMap, immediateFamilyKeys);
    }
    const target = Math.max(0, Number(count) || 0);
    const sourceKinds = [];
    const builtinAvailable = pool.length > 0;
    for (let index = 0; index < target; index += 1) {
        sourceKinds.push(chooseExternalSource(settings, 'theme', randomUnit, builtinAvailable) ? 'external' : 'builtin');
    }
    const builtinCount = sourceKinds.filter(kind => kind === 'builtin').length;
    const externalCount = sourceKinds.length - builtinCount;
    let builtins = builtinCount
        ? weightedThemeSample(pool, builtinCount, recentIds, recentGroups, avoidRepeat, hardExcludedIds, favoriteIds, favoriteMultipliers, recentGroupHitMap, recentFamilyHitMap, immediateFamilyKeys)
        : [];
    let externals = externalCount
        ? pickExternalItems(settings, 'theme', externalCount, {
            randomUnit,
            recentIds,
            recentIdHits,
            hardExcludedIds: externalHardExcludedIds,
            preferredExcludedIds: hardExcludedIds,
            avoidRepeat,
        })
        : [];
    if (externals.length < externalCount && !sourceMixModeIsExternalOnly(settings)) {
        const deficit = externalCount - externals.length;
        const extraHard = [...hardExcludedIds, ...builtins.map(item => item.id)];
        builtins = [...builtins, ...weightedThemeSample(pool, deficit, recentIds, recentGroups, avoidRepeat, extraHard, favoriteIds, favoriteMultipliers, recentGroupHitMap, recentFamilyHitMap, immediateFamilyKeys)];
    }
    if (builtins.length < builtinCount) {
        const deficit = builtinCount - builtins.length;
        externals = [...externals, ...pickExternalItems(settings, 'theme', deficit, {
                randomUnit,
                recentIds,
                recentIdHits,
                hardExcludedIds: [...externalHardExcludedIds, ...externals.map(item => item.id)],
                preferredExcludedIds: hardExcludedIds,
                avoidRepeat,
            })];
    }
    const builtinQueue = [...builtins];
    const externalQueue = [...externals];
    const selected = [];
    for (const kind of sourceKinds) {
        const next = kind === 'external' ? externalQueue.shift() : builtinQueue.shift();
        if (next)
            selected.push(next);
    }
    selected.push(...builtinQueue, ...externalQueue);
    return uniqueById(selected).slice(0, target);
}
function sourceAwareFormatSample({ settings, pool, count, recentIds, recentIdHits, recentGroups, avoidRepeat, hardExcludedIds, favoriteIds, eligibleMisses, favoriteMultipliers, recentGroupHitMap, recentFamilyHitMap, immediateFamilyKeys, groupCooldownEnabled, externalHardExcludedIds = [], presentationKind = 'format' }) {
    if (!externalPoolActive(settings, presentationKind)) {
        return weightedSample(pool, count, recentIds, recentGroups, avoidRepeat, hardExcludedIds, favoriteIds, eligibleMisses, favoriteMultipliers, recentGroupHitMap, recentFamilyHitMap, immediateFamilyKeys, groupCooldownEnabled);
    }
    const target = Math.max(0, Number(count) || 0);
    const sourceKinds = [];
    const builtinAvailable = pool.length > 0;
    for (let index = 0; index < target; index += 1) {
        sourceKinds.push(chooseExternalSource(settings, presentationKind, randomUnit, builtinAvailable) ? 'external' : 'builtin');
    }
    const builtinCount = sourceKinds.filter(kind => kind === 'builtin').length;
    const externalCount = sourceKinds.length - builtinCount;
    let builtinSample = builtinCount
        ? weightedSample(pool, builtinCount, recentIds, recentGroups, avoidRepeat, hardExcludedIds, favoriteIds, eligibleMisses, favoriteMultipliers, recentGroupHitMap, recentFamilyHitMap, immediateFamilyKeys, groupCooldownEnabled)
        : { selected: [], eligibleIds: [] };
    let externals = externalCount
        ? pickExternalItems(settings, presentationKind, externalCount, {
            randomUnit,
            recentIds,
            recentIdHits,
            hardExcludedIds: externalHardExcludedIds,
            preferredExcludedIds: hardExcludedIds,
            avoidRepeat,
        })
        : [];
    if (externals.length < externalCount && !sourceMixModeIsExternalOnly(settings)) {
        const deficit = externalCount - externals.length;
        const extraHard = [...hardExcludedIds, ...builtinSample.selected.map(item => item.id)];
        const extra = weightedSample(pool, deficit, recentIds, recentGroups, avoidRepeat, extraHard, favoriteIds, eligibleMisses, favoriteMultipliers, recentGroupHitMap, recentFamilyHitMap, immediateFamilyKeys, groupCooldownEnabled);
        builtinSample = { selected: [...builtinSample.selected, ...extra.selected], eligibleIds: [...new Set([...builtinSample.eligibleIds, ...extra.eligibleIds])] };
    }
    if (builtinSample.selected.length < builtinCount) {
        const deficit = builtinCount - builtinSample.selected.length;
        externals = [...externals, ...pickExternalItems(settings, presentationKind, deficit, {
                randomUnit,
                recentIds,
                recentIdHits,
                hardExcludedIds: [...externalHardExcludedIds, ...externals.map(item => item.id)],
                preferredExcludedIds: hardExcludedIds,
                avoidRepeat,
            })];
    }
    const builtinQueue = [...builtinSample.selected];
    const externalQueue = [...externals];
    const selected = [];
    for (const kind of sourceKinds) {
        const next = kind === 'external' ? externalQueue.shift() : builtinQueue.shift();
        if (next)
            selected.push(next);
    }
    selected.push(...builtinQueue, ...externalQueue);
    return {
        selected: uniqueById(selected).slice(0, target),
        eligibleIds: builtinSample.eligibleIds,
    };
}
function randomCandidateAvailable(settings, kind, builtinPool, usedIds = new Set()) {
    const builtinAvailable = builtinPool.some(item => !usedIds.has(item.id));
    if (!externalPoolActive(settings, kind))
        return builtinAvailable;
    const externalAvailable = externalPoolHasAvailable(kind, [...usedIds]);
    if (sourceMixModeIsExternalOnly(settings))
        return externalAvailable;
    return builtinAvailable || externalAvailable;
}
function usesStandaloneTextPool(settings, directive, themePool, formatPool, faceIndex = 0, excludedThemes = [], excludedFormats = []) {
    const mode = requestedPresentationMode(settings, faceIndex);
    if (mode === 'text')
        return true;
    if (!(mode === 'auto' || mode === 'longtext') || !externalPoolActive(settings, 'text'))
        return false;
    if (directive?.hasThemeRequest || directive?.hasFormatRequest)
        return false;
    const available = (kind, pool, excluded) => sourceMixModeIsExternalOnly(settings)
        ? externalPoolHasAvailable(kind, excluded)
        : randomCandidateAvailable(settings, kind, pool, new Set(excluded));
    const hasTheme = settings.samplingMode === 'format_only' || available('theme', themePool, excludedThemes);
    const hasFormat = (settings.forceVisualScenery && !visualSceneryCombinationEnabled(settings)) || available('format', formatPool, excludedFormats);
    return !hasTheme || !hasFormat;
}
function batchUsesStandaloneTextPool(settings, snapshot, faceIndex) {
    return usesStandaloneTextPool(settings, snapshot.directive, snapshot.themePool, snapshot.formatPool, faceIndex, snapshot.exclusions.themeIds, snapshot.exclusions.formatIds);
}
function renewStandaloneTextCycle(settings, snapshot, faceIndex, usedTextIds) {
    const excluded = snapshot.exclusions.textIds || [];
    if (!batchUsesStandaloneTextPool(settings, snapshot, faceIndex)
        || externalPoolHasAvailable('text', [...usedTextIds]) || !externalPoolHasAvailable('text', excluded))
        return;
    usedTextIds.clear();
    excluded.forEach(id => usedTextIds.add(id));
}
function getCurrentTurnUserMessage(chatOverride = null) {
    try {
        const context = globalThis.SillyTavern?.getContext?.() || {};
        const overrideUsable = Array.isArray(chatOverride) && chatOverride.some(item => typeof item?.is_user === 'boolean');
        const chat = Array.isArray(context?.chat) && context.chat.length
            ? context.chat
            : overrideUsable
                ? chatOverride
                : Array.isArray(globalThis.chat)
                    ? globalThis.chat
                    : [];
        for (let index = chat.length - 1; index >= 0; index -= 1) {
            const message = chat[index];
            if (!message || typeof message.mes !== 'string' || message.is_system || !message.is_user)
                continue;
            const text = message.mes.trim();
            if (!text)
                return null;
            const stablePart = String(message.mesid ?? message.send_date ?? index);
            return {
                text: message.mes,
                index,
                key: `${stablePart}:${hashText(message.mes)}`,
            };
        }
        return null;
    }
    catch (_error) {
        return null;
    }
}
function normalizeText(value) {
    return String(value || '')
        .toLowerCase()
        .replace(__rmR("vIRqk36OboWYv938J6cbSYjqr3igo4j80U6hqWXCNr6EsMAbYcuyc9Y.cU6ANgzWcDYKdxjsdkfGWnd6pvogEIhiAzUVYRcIFGxQIf", "g"), '');
}
function splitDirectiveText(text) {
    return String(text || '')
        .replace(/\s+/g, ' ')
        .split(__rmR("3MOKYy6iZzD4BdGjV6hXc6ars.yuJk", ""))
        .map(x => x.trim())
        .filter(Boolean);
}
function uniqueDirectiveTexts(items, limit = 8, maxChars = 700) {
    const seen = new Set();
    const result = [];
    for (const value of items || []) {
        const text = String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxChars);
        if (!text)
            continue;
        const key = normalizeText(text);
        if (!key || seen.has(key))
            continue;
        seen.add(key);
        result.push(text);
        if (result.length >= limit)
            break;
    }
    return result;
}
function itemHaystack(item) {
    return normalizeText([
        item.id,
        item.title,
        ...(Array.isArray(item.aliases) ? item.aliases : []),
        item.summary,
        item.raw,
        ...(item.tags || []),
    ].join(' '));
}
function matchOne(pool, query) {
    const explicitId = String(query || '').trim().match(__rmR("RLM9OEU2C59sJCxUspJdeiAedQQZL0aCup.267apLRT6bQZ8X5ZyLugfv1gWnVtLDL3iG._oqq37KE3EHUOWjEhnSGCz7XNvOwaP.uStxBt2M0WSBqr4KxELkGDXDo4.lBkbI6gJMYqq6ObU381IksmD0ErPDVnJwawpxW63Ga54lf", "i"))?.[1];
    if (explicitId) {
        const exact = pool.find(item => String(item.id).toLowerCase() === explicitId.toLowerCase());
        if (exact)
            return exact;
        if (/^(?:\d+|[A-Za-z])(?:\.[A-Za-z0-9]+)+$/.test(explicitId))
            return null;
    }
    const q = normalizeText(query);
    if (!q)
        return null;
    let best = null;
    let bestScore = 0;
    for (const item of pool) {
        const id = normalizeText(item.id);
        const title = normalizeText(item.title);
        const aliases = Array.isArray(item.aliases) ? item.aliases.map(normalizeText).filter(Boolean) : [];
        const summary = normalizeText(item.summary);
        const raw = normalizeText(item.raw);
        const haystack = itemHaystack(item);
        let score = 0;
        if (id === q)
            score = 100;
        else if (title === q)
            score = 95;
        else if (aliases.includes(q))
            score = 94;
        else if (id.includes(q) || q.includes(id))
            score = Math.max(score, 80);
        else if (title.includes(q) || q.includes(title))
            score = Math.max(score, 75);
        else if (summary.includes(q))
            score = Math.max(score, 55);
        else if (raw.includes(q))
            score = Math.max(score, 50);
        else if (haystack.includes(q))
            score = Math.max(score, 40);
        if (score > bestScore) {
            best = item;
            bestScore = score;
        }
    }
    return bestScore >= 40 ? best : null;
}
function uniqueById(items) {
    const seen = new Set();
    const result = [];
    for (const item of items) {
        if (!item || seen.has(item.id))
            continue;
        seen.add(item.id);
        result.push(item);
    }
    return result;
}
function extractAfterPatterns(message, patterns) {
    const results = [];
    for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'ig');
        let match;
        while ((match = regex.exec(message)) !== null) {
            const value = (match[1] || '').trim();
            if (value)
                results.push(value);
        }
    }
    return results;
}
function cleanDirectiveBlock(value, maxChars = 3000) {
    return String(value || '')
        .replace(/\r\n?/g, '\n')
        .replace(/[ \t]+$/gm, '')
        .trim()
        .slice(0, maxChars);
}
function findExplicitDirectiveStart(message) {
    const patterns = [
        __rmR("RqkAx7LWsvlOUR.l2GBtlR6c4kE8z2pRFgeCNrdx1G8hH7.GuU38PyPxcGWUILt_BHMTaQCmabzvAc3FrL6marZ2w88HUKpbW40JXd8Sg.ZUW6VoIZLND6x5.2cALagWUApe9QmguVwPAv3DZ4octnof9hnJ6OMUFHrCu0nkv_7skCZ45Osu8wnjDcPkZtM2zb6cW24bUggH40f27V7YHvyW_4gR74VDOzvZE6JnOtMc81IhZEKmQlgluwELJUoGVHLbvCGTYyBVwfFRR4J.S11_93kId74qib0AsQ5uELezkROzdCLxlfpW8OtSMH2AwySZ2bTBse3exh", "igm"),
        __rmR("PXVflD_T0gIs3KB2f69BJxp8LKSAkn57jc9VGsbDvUfX66Ckj3lmWIs6Y0A6dLA8LBvoYe165zNWOubkzkoLRUtCaNM0IYVDCb.2cYZ5GPWunvtLywcmIqcf_1ifUxsXwtEd1iKLokRfSJtDCR8sv.YOybDkDe0ISNNvPJnnAhnNpNFwc8tzMojyaTSYvvFa5uXW6SXh3HjZgvTzMzQ6lBvk17sJTH2DsqCUb3GKyYL02uGCGM59dRBYLaTmZGYl07h2.59ipqQkoIMriWfasHHT0nQ6kxUwCfzGkoRE3p8ss07fWXIW5lTOXc14a.KECUxk7QeMQa8", "igm"),
        __rmR("gQLiEswefbKlifn5RuHZiiRFIfojJAuh21eARLERPBzkgYy4437NJQw31u6EfF9KKsWqVxRbDsNWFT9lE5HiHn_gt9v.mT8E6EY2854wcZkpyFORRlg9j9rfpP0GmKDzuHmdD5bZtKQLBX5FXuloPok1V5aNwNmt1PEV.PAV3gjEg_B7N1FxxoZ6SON7K1KTBJeB0grsk32PJtGvkSst6oZLivHiO4f1ijOXWKjmQK4PqoX_xDeDcbuqEwB_R9afbD7ioa1l6i1jYvGazU3fKC.Tr98nUHSsvSwzi6qaLqXLUFEFU3hbw1M1jh3BJaSJd3E_3QMf3iJXlMLR6OjEf3Yp1SkpIzfL_dzaij9TH4lPG4Fjp52FHf", "igm"),
    ];
    let earliest = null;
    for (const pattern of patterns) {
        pattern.lastIndex = 0;
        const match = pattern.exec(message);
        if (!match)
            continue;
        const index = match.index + String(match[1] || '').length;
        if (earliest === null || index < earliest)
            earliest = index;
    }
    return earliest;
}
function extractRabbitMirrorDirective(message) {
    const source = String(message || '');
    if (!source || !__rmR(".RYgS01FSoeNkdU5_yxLFnkx", "").test(source))
        return '';
    const start = findExplicitDirectiveStart(source);
    if (start === null)
        return '';
    let block = source.slice(start);
    const stopMatch = __rmR("n0CRHyubPeP6xVMMLjjtg0TdUy.PUTRJgEpEC8Mn5m15bm84563r.CLj6JIjLv4xicBNrwEpRV09Yype8iG0xXtX.mdE49Xfy.shhEwXrwWIOk", "i").exec(block);
    if (stopMatch)
        block = block.slice(0, stopMatch.index);
    return cleanDirectiveBlock(block);
}
function extractDisableDirective(message) {
    const source = String(message || '');
    const patterns = [
        __rmR("YPN8KI.WCRmyMmAWZ9Bf_hfdphvN0BxzNDIMvrUtKKYEZhoAcFAQEeMABkVoUcKD4DhhEqTHHBRhz_375JCDEShukAYMgWUK5Jmpm_Bpd9f7qAvfi.fGCo2s2UTjRLrTNbc3tNN7O0ES4I705YQGDM3EOOtEubpc_IXZ5YI8nOM7B4apPl7UaRWvRSE", "im"),
        __rmR("rAW6PNUMwiJsVnEhrCTRFpKMPzlD8tg6LxMa0ixjSPIcovzcw5Hr9sxV4ChqSb0U6mVR3kOiiDGBPAjHuCugGD.NLNSXKAfUMBlfX0qwLF2GJX.BdoK79dpwENFXY.5h2l5qafWaSUXuQ.a_z37UWPBwp4I.gLKdv9iHFuxcWbRZ_ZYyF687LxvTfVxO26aP.gJCZf", "im"),
    ];
    for (const pattern of patterns) {
        const match = pattern.exec(source);
        if (!match)
            continue;
        const start = match.index + String(match[1] || '').length;
        return cleanDirectiveBlock(source.slice(start), 700);
    }
    return '';
}
function parseUserDirective(currentTurn) {
    const message = String(currentTurn?.text || '');
    if (!message)
        return null;
    const disableDirective = extractDisableDirective(message);
    if (disableDirective) {
        return {
            disabled: true,
            reason: __rmT("23kQRlk4X4uWvGQceRg3E7HU26ZVhMbAlk8"),
            rawDirective: disableDirective,
            messageKey: currentTurn?.key || '',
        };
    }
    const rawDirective = extractRabbitMirrorDirective(message);
    if (!rawDirective)
        return null;
    const themeTexts = extractAfterPatterns(rawDirective, [
        __rmT("KGPpPkDKL34D02QE6Xk9pbLw7ggaELzFgfK8FMVqVFAwNvdjt3Rmi9FxDaY_VRxHWqOf2HG0tZeCenOLyOkhHLTDctjR4xVwR.AVNGnMQ6gk1kgDJseW2fsQNU6_3jlp4cdJXT"),
        __rmT("CxtVVDf6Prg94p3zStoWO21Uq44kVnnGmI2bUjC8YREv6Iu9TBolFvoMLYciJ.JAi2W6uAbQ4AUBcB8NwoKL_.CNwahUvPQ2DB4BOg5z4rSNQEWxYF8xbZ_xCF10GNvx7xqJ0YSfh.oh2yGWeWP.pxyfyV_SDiXaotj8GHFT"),
    ]);
    const formatTexts = extractAfterPatterns(rawDirective, [
        __rmT("hILXjhB0nX2jP8xc0T5lK_ejl.lB2JL1Ztn4.Z3Mtw2QCZfmGa8aNr7RvCjA72evUYjjpKgECBob0x_46OumCB5q8l1J3omkUD0MtsxUmgiX54NY9wskWgPEV1b2W.qFD.z0KqVdNgeaMt51UOlgRy_9IgecMmEg.g1OC1xipGbGtneOMazVmln7"),
        __rmT("mDwCCUAQrkLskjdlE.liXqR7vcHsSzjtkZeSsDw5eN6Ym5i5GQ__x2XHR4Z6vz2JHexDRTmivBwHGrC7VBjrxiz0zucam.aqW9Hs7ps.nqFc6jJK7IkhR5QUOjNVcbvo7S9dgxkOX0rs1i0H1YRdtQf3yZFcP9y4dvL3EFOaoy_z.aEHklq4kzh1v3Zihx0lxEx_NNWZwzJDlRFNcMQ0n8ALydl"),
    ]);
    const generalTexts = extractAfterPatterns(rawDirective, [
        __rmT("sPoimH.zgDDZQmlLNSQnKQjm70Yh.syGKfks3SM_ge3H2_SPVV.vj8AyPBK2KYQvocFuSeLU.BkC_gN3SrBZJh"),
        __rmT("3I8YXrY_2PunrZJWkWJPeoLahvluGGhv465YG6jmeuDqFX6jPcH998ylLze3bAwg7RJN3oID7LTKWsvEDcV995NrAKG6vD7aay75uAF2cLBOHRubbO65TDSLFm7cs8yOOac4D.npbwEqgMMYssJi3rHOBzY"),
        __rmT("HtEsjJKGLYg.awUaAli0kG57loivrIlbFj6zpVN0fEApMc2rvIsS_VGBn89o6Y6Oa07pcJw.Arlb5U1MH5n1oKN4HFpUtIFS._DHmw3ntm3nx5CMuAtIUVIgjDpSS.0oKyzznYK7idHOevHz6Co1T69guLcOUaSC9robqYwnZjwQgp4yrSkWG4BCn4qEXAsx_xzNMqFvh106CgCu"),
        __rmT("HgQmkf5sMkAtbp5uxbTbCsTsQtYDfRTmzde7kOR2pY9jmVGtbY1_RHS2bufeTQ_S3PiHWf5HbDYv8KJWw3gtmFCCYLidTZ_oip8Su3FDF5dVo2.847Yws4ahdhNmPuFltpNF6rz8SiVJ7TDM9UgT6NWg04v_zNsPsBeTCuGlQ6kQBS6qBKQbTXjBKP3hMeoKXcbzevXg9j0ayf3ZcMqvMbabM4qa4O287L_tAoNGw1rAhdRctMWhViheYX9fv5MI8L9INxiJjA_HY5vftqkue6ZWVgTtwk"),
    ]).filter(x => !__rmR("BDpWhmTUkZsHBnHQeKVp2LgNXU4PRmEOXp5L.n2cG2cwD9q1ZDnJVfF3Zst0VnME.u_H5oZIwSkSfZwiVzjR3VJaA3EReeCnNR2FeOnN", "").test(x));
    const themeQueries = uniqueDirectiveTexts(splitDirectiveText(themeTexts.join(__rmT("jvk"))));
    const formatQueries = uniqueDirectiveTexts(splitDirectiveText(formatTexts.join(__rmT("jvk"))));
    const generalQueries = uniqueDirectiveTexts(splitDirectiveText(generalTexts.join(__rmT("jvk"))));
    const themes = [];
    const formats = [];
    const customThemes = [];
    const customFormats = [];
    const customRequests = [];
    let hasThemeRequest = themeQueries.length > 0;
    let hasFormatRequest = formatQueries.length > 0;
    for (const query of themeQueries) {
        const matched = matchOne(THEMATIC_CATEGORIES, query);
        if (matched)
            themes.push(matched);
        else
            customThemes.push(query);
    }
    for (const query of formatQueries) {
        const matched = matchOne(PRESENTATION_FORMATS, query);
        if (matched)
            formats.push(matched);
        else
            customFormats.push(query);
    }
    for (const query of generalQueries) {
        const format = matchOne(PRESENTATION_FORMATS, query);
        const theme = matchOne(THEMATIC_CATEGORIES, query);
        if (format) {
            formats.push(format);
            hasFormatRequest = true;
        }
        if (theme) {
            themes.push(theme);
            hasThemeRequest = true;
        }
        if (!format && !theme) {
            customRequests.push(query);
            hasThemeRequest = true;
            hasFormatRequest = true;
        }
    }
    const uniqueThemes = uniqueById(themes);
    const uniqueFormats = uniqueById(formats);
    const uniqueCustomThemes = uniqueDirectiveTexts(customThemes);
    const uniqueCustomFormats = uniqueDirectiveTexts(customFormats);
    const uniqueCustomRequests = uniqueDirectiveTexts(customRequests);
    return {
        disabled: false,
        themes: uniqueThemes,
        formats: uniqueFormats,
        customThemes: uniqueCustomThemes,
        customFormats: uniqueCustomFormats,
        customRequests: uniqueCustomRequests,
        hasThemeRequest,
        hasFormatRequest,
        source: __rmT("iGaUpayOToFbF3Cog2alBONrSpEs1A3.q4vrBOybuzRIqm5R"),
        rawDirective,
        messageKey: currentTurn?.key || '',
    };
}
function getVisualSceneryFormat() {
    return PRESENTATION_FORMATS.find(item => item.id === '10.2.2' || normalizeText(item.title) === normalizeText('Visual Scenery')) || null;
}
function autoLongTextBucket(scopeKey, faceIndex) {
    let hash = 2166136261;
    for (const char of `${scopeKey}|auto-form|${faceIndex}`) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) % 100;
}
function lotteryBucket(scopeKey, faceIndex) {
    let hash = 2166136261;
    for (const char of `${scopeKey}|lottery|${faceIndex}`) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) % 100;
}
function faceCountOf(settings) {
    const count = Number(settings?.rabbitMirrorFaceCount);
    return Number.isInteger(count) && count >= 2 && count <= 5 ? count : 1;
}
function autoFaceResolvesLongText(settings, faceIndex, scopeKey) {
    const requested = requestedPresentationMode(settings, faceIndex);
    if (requested === 'longtext')
        return true;
    if (requested !== 'auto')
        return false;
    const percent = Math.max(0, Math.min(100, Math.round(Number(settings?.autoLongTextPercent) || 0)));
    if (percent <= 0)
        return false;
    if (percent >= 100)
        return true;
    const count = faceCountOf(settings);
    const autoIndexes = [];
    for (let index = 0; index < count; index += 1) {
        if (requestedPresentationMode(settings, index) === 'auto')
            autoIndexes.push(index);
    }
    const explicitLongText = Array.from({ length: count }, (_, index) => requestedPresentationMode(settings, index)).includes('longtext');
    const hashed = autoIndexes.some(index => autoLongTextBucket(scopeKey, index) < percent);
    if ((count === 2 || count === 3) && !explicitLongText && !hashed && faceIndex === autoIndexes[0])
        return true;
    return autoLongTextBucket(scopeKey, faceIndex) < percent;
}
function usesWorldBookLottery(settings, faceIndex, scopeKey) {
    const source = ['builtin', 'worldbook', 'both'].includes(settings?.lotterySource) ? settings.lotterySource : 'builtin';
    if (source === 'worldbook')
        return true;
    if (source !== 'both')
        return false;
    const builtinPercent = Math.max(0, Math.min(100, Math.round(Number(settings?.lotteryBuiltinPercent) || 0)));
    return lotteryBucket(scopeKey, faceIndex) >= builtinPercent;
}
function worldBookLotteryResult(settings, faceIndex, scopeKey, longText) {
    const entries = Array.isArray(settings?.lotteryEntries) ? settings.lotteryEntries.filter(item => item?.id) : [];
    if (!entries.length) {
        throw multiFacePlanningError(__rmT("Ge7wcsKFHRBJlv40OutJcisBsYMdZT3XhliTmsxIj1F2oH8LNSwN0ZxD1sYa3hbt9nXqsuqzltCRPa._Kqo7KVZFyv0f87bRoehFdEjTFMX8.i_z"), 'LOTTERY_WORLD_BOOK_EMPTY');
    }
    const recent = Array.isArray(settings?.__lotteryRecentIds) ? settings.__lotteryRecentIds : [];
    const fresh = entries.filter(item => !recent.includes(item.id));
    const pool = fresh.length ? fresh : entries;
    const entry = pool[lotteryBucket(scopeKey, faceIndex) % pool.length];
    return {
        themes: [], formats: [], texts: [], directive: null, forcedFormats: [],
        requestedPresentationMode: longText ? 'longtext' : 'html',
        presentationMode: longText ? 'text' : 'html',
        worldBookEntryId: entry.id,
        worldBookTitle: entry.title || entry.uid,
        worldBookExcerpt: entry.content || '',
        formatFairnessEligibleIds: [], formatFairnessSelectedIds: [],
    };
}
function themeItemIsIf(item) {
    return Array.isArray(item?.tags) && item.tags.some(tag => String(tag || '').trim().toLowerCase() === 'if');
}
function cooledPool(pool, blockedIds) {
    const blocked = new Set((blockedIds || []).filter(Boolean));
    const fresh = (pool || []).filter(item => item?.id && !blocked.has(item.id));
    return fresh.length ? fresh : (pool || []).filter(item => item?.id);
}
function atmosphereMenuLine(item, summaryLimit = 0) {
    const summary = String(item?.summary || '').replace(/\s+/g, ' ').trim();
    const body = summaryLimit > 0 ? summary.slice(0, summaryLimit) : summary;
    const head = `${item?.id || ''} ${item?.title || __rmT("cyZtO1kw")}`.trim();
    return body ? `${head}${__rmT("7ys")}${body}` : head;
}
function compactAtmosphereTicket(themes, formats) {
    const listed = items => (items || []).filter(item => item?.id);
    const themesListed = listed(themes);
    const formatsListed = listed(formats);
    return {
        themeIds: themesListed.map(item => item.id),
        formatIds: formatsListed.map(item => item.id),
        themeGroups: themesListed.map(item => item.group).filter(Boolean),
        formatGroups: formatsListed.map(item => item.group).filter(Boolean),
        themeLines: themesListed.map(item => atmosphereMenuLine(item, 80)),
        formatLines: formatsListed.map(item => atmosphereMenuLine(item, 80)),
        themeFullLines: themesListed.map(item => atmosphereMenuLine(item)),
        formatFullLines: formatsListed.map(item => atmosphereMenuLine(item)),
    };
}
function atmosphereStoryPercent(settings) {
    const value = Number(settings?.atmosphereStoryPercent);
    return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 70;
}
function comboHeldIds(combo, key) {
    const menu = combo?.atmosphereMenu;
    if (Array.isArray(menu) && menu.length)
        return [...new Set(menu.flatMap(ticket => Array.isArray(ticket?.[key]) ? ticket[key] : []))];
    return Array.isArray(combo?.[key]) ? combo[key] : [];
}
function drawAtmosphereBundle(args) {
    const { settings, themePool, formatPool, faceIndex, presentationScopeKey, formalRecent, hardRecent } = args;
    const formatOnly = settings.samplingMode === 'format_only';
    const story = formatOnly || lotteryBucket(presentationScopeKey || 'atmosphere', faceIndex) < atmosphereStoryPercent(settings);
    const blockedThemes = [...(formalRecent?.themeIds || []), ...(hardRecent?.themeIds || [])];
    const blockedFormats = [...(formalRecent?.formatIds || []), ...(hardRecent?.formatIds || [])];
    const drawTicket = (themes, formats, usedThemeIds = [], usedFormatIds = []) => applyDirectiveOrRandom({
        ...args, themePool: themes, formatPool: formats, directive: null, lotteryMethodBypass: true,
        externalExcludedThemeIds: [...(args.externalExcludedThemeIds || []), ...usedThemeIds],
        externalExcludedFormatIds: [...(args.externalExcludedFormatIds || []), ...usedFormatIds],
    });
    if (!story) {
        const ifPool = cooledPool((themePool || []).filter(themeItemIsIf), blockedThemes);
        if (!ifPool.length)
            return null;
        const ticket = drawTicket(ifPool, cooledPool(formatPool, blockedFormats));
        if (!ticket || ticket.disabled || ticket.texts?.length || ticket.worldBookEntryId || !ticket.themes?.length)
            return null;
        return { ...ticket, atmosphereBucket: 'if' };
    }
    const storyThemes = cooledPool((themePool || []).filter(item => formatOnly || !themeItemIsIf(item)), blockedThemes);
    let storyFormats = cooledPool(formatPool, blockedFormats);
    const collectionOnly = args.favoriteFormatMultipliers?.[COLLECTION_ONLY];
    const favoriteFormats = new Set((args.favoriteFormatIds || []).filter(id => !collectionOnly?.has?.(id)));
    const nonDocumentFormats = storyFormats.filter(item => !isDocumentFormatId(item.id) || favoriteFormats.has(item.id));
    if (settings.avoidRepeat !== false && recentDocumentFaceHits() >= 1 && nonDocumentFormats.length >= 8)
        storyFormats = nonDocumentFormats;
    let documentTicket = false;
    const usedThemes = new Set();
    const usedFormats = new Set();
    const usedTickets = new Set();
    const tickets = [];
    for (let index = 0; index < 4; index += 1) {
        const themesLeft = storyThemes.filter(item => !usedThemes.has(item.id));
        const formatsLeft = storyFormats.filter(item => !usedFormats.has(item.id) && !(documentTicket && isDocumentFormatId(item.id)));
        const themeExclusions = new Set([...(args.externalExcludedThemeIds || []), ...usedThemes]);
        const formatExclusions = new Set([...(args.externalExcludedFormatIds || []), ...usedFormats]);
        if (!formatOnly && !randomCandidateAvailable(settings, 'theme', themesLeft, themeExclusions))
            break;
        const needsVariableFormat = !settings.forceVisualScenery || visualSceneryCombinationEnabled(settings);
        if (needsVariableFormat && !randomCandidateAvailable(settings, 'format', formatsLeft, formatExclusions))
            break;
        const ticket = drawTicket(formatOnly ? storyThemes : themesLeft, formatsLeft, [...usedThemes], [...usedFormats]);
        if (!ticket || ticket.disabled || ticket.texts?.length || ticket.worldBookEntryId)
            break;
        const themeIds = (ticket.themes || []).map(item => item.id).filter(Boolean);
        const allFormatIds = (ticket.formats || []).map(item => item.id).filter(Boolean);
        const fixedFormatIds = new Set((ticket.forcedFormats || []).map(item => item.id));
        const formatIds = allFormatIds.filter(id => !fixedFormatIds.has(id));
        const signature = JSON.stringify([themeIds, allFormatIds]);
        if ((!formatOnly && !themeIds.length) || !allFormatIds.length || usedTickets.has(signature))
            break;
        if (themeIds.some(id => usedThemes.has(id)) || formatIds.some(id => usedFormats.has(id)))
            break;
        tickets.push(ticket);
        if (formatIds.some(isDocumentFormatId))
            documentTicket = true;
        usedTickets.add(signature);
        themeIds.forEach(id => usedThemes.add(id));
        formatIds.forEach(id => usedFormats.add(id));
    }
    if (!tickets.length)
        return null;
    const menu = tickets.length > 1 ? tickets.map(ticket => compactAtmosphereTicket(ticket.themes || [], ticket.formats || [])) : null;
    return { ...tickets[0], atmosphereBucket: 'story', ...(menu ? { atmosphereMenu: menu } : {}) };
}
function applyDirectiveOrRandom({ settings, directive, themePool, formatPool, themeCount, formatCount, recent, formalRecent, hardRecent, previousThemeFamilyKeys = [], previousFormatFamilyKeys = [], favoriteThemeIds, favoriteFormatIds, favoriteThemeMultipliers, favoriteFormatMultipliers, formatEligibleMisses, externalExcludedThemeIds = [], externalExcludedFormatIds = [], externalExcludedTextIds = [], faceIndex = 0, standaloneTextPool = null, presentationScopeKey = '', lotteryMethodBypass = false }) {
    if (directive?.disabled)
        return { disabled: true, directive };
    const requestedMode = requestedPresentationMode(settings, faceIndex);
    const autoLongText = requestedMode === 'auto' && autoFaceResolvesLongText(settings, faceIndex, presentationScopeKey);
    const longText = requestedMode === 'longtext' || autoLongText;
    if (!lotteryMethodBypass && usesWorldBookLottery(settings, faceIndex, presentationScopeKey)) {
        return { ...worldBookLotteryResult(settings, faceIndex, presentationScopeKey, longText), directive };
    }
    const standaloneText = standaloneTextPool ?? usesStandaloneTextPool(settings, directive, themePool, formatPool, faceIndex, externalExcludedThemeIds, externalExcludedFormatIds);
    const textSettings = { ...settings, externalWorldBookRandomEnabled: true, externalWorldBookMixMode: 'external-only' };
    if (!lotteryMethodBypass && standaloneText && settings.mode !== 'off') {
        const texts = pickExternalItems(textSettings, 'text', 1, {
            randomUnit, hardExcludedIds: externalExcludedTextIds, avoidRepeat: settings.avoidRepeat,
            recentIds: recent.textIds || [], recentIdHits: recent.textIdHits || {},
            preferredExcludedIds: hardRecent.textIds || [],
        });
        if (texts.length)
            return { themes: [], formats: [], texts, directive, forcedFormats: [],
                requestedPresentationMode: requestedMode, presentationMode: 'text',
                formatFairnessEligibleIds: [], formatFairnessSelectedIds: [] };
        if (longText)
            throw multiFacePlanningError(__rmT("G7Ksv77NPya7Efr9gGJOyMd5FWqoh7qUGWThiQeddLoORCLZR3ipqx9ypdLyBPyLktlNy.KLyYJ0DaSHjqD5TyUoi9Z19x4MdDIm4_X38_Zug1zwe98nlZ3oGtgdF3dtu0LOvT"), 'BATCH_CANDIDATE_POOL_EXHAUSTED');
    }
    if (!lotteryMethodBypass && settings.lotteryMethod === 'atmosphere' && !directive?.hasThemeRequest && !directive?.hasFormatRequest) {
        const drawn = drawAtmosphereBundle({
            settings, directive, themePool, formatPool, themeCount, formatCount, recent, formalRecent, hardRecent,
            previousThemeFamilyKeys, previousFormatFamilyKeys, favoriteThemeIds, favoriteFormatIds,
            favoriteThemeMultipliers, favoriteFormatMultipliers, formatEligibleMisses, externalExcludedThemeIds,
            externalExcludedFormatIds, externalExcludedTextIds, faceIndex, standaloneTextPool, presentationScopeKey,
        });
        if (drawn)
            return { ...drawn, directive };
    }
    if (requestedMode === 'text')
        settings = { ...settings, forceVisualScenery: false, visualSceneryCombination: false };
    const combineVisual = visualSceneryCombinationEnabled(settings);
    if (combineVisual)
        formatPool = formatPool.filter(item => item.id !== '10.2.2');
    const includeAutoText = (requestedMode === 'auto' || longText) && externalPoolActive(settings, 'text');
    const themeFamilyHitMap = recentFamilyHits(recent.themeIdHits, themeFamilyKey);
    const formatFamilyHitMap = recentFamilyHits(formalRecent?.formatIdHits, formatFamilyKey);
    const pickedThemes = directive?.hasThemeRequest
        ? []
        : sourceAwareThemeSample({
            settings,
            pool: themePool,
            count: themeCount,
            recentIds: recent.themeIds,
            recentIdHits: recent.themeIdHits,
            recentGroups: recent.themeGroups,
            avoidRepeat: settings.avoidRepeat,
            hardExcludedIds: hardRecent.themeIds,
            favoriteIds: favoriteThemeIds,
            favoriteMultipliers: favoriteThemeMultipliers,
            recentGroupHitMap: recent.themeGroupHits,
            recentFamilyHitMap: themeFamilyHitMap,
            immediateFamilyKeys: previousThemeFamilyKeys,
            externalHardExcludedIds: externalExcludedThemeIds,
        });
    const formatOnly = settings.samplingMode === 'format_only';
    const themes = formatOnly
        ? []
        : uniqueById([...(directive?.themes || []), ...pickedThemes]).slice(0, Math.max(themeCount, directive?.themes?.length || 0));
    const formatGroupCooldownEnabled = themes.some(item => Array.isArray(item?.tags) && item.tags.some(tag => String(tag || '').trim().toLowerCase() === 'if'));
    const formatSample = directive?.hasFormatRequest
        ? { selected: [], eligibleIds: [] }
        : settings.forceVisualScenery && !combineVisual && !includeAutoText
            ? weightedSample(formatPool, formatCount, recent.formatIds, formalRecent?.formatGroups || [], settings.avoidRepeat, hardRecent.formatIds, favoriteFormatIds, formatEligibleMisses, favoriteFormatMultipliers, formalRecent?.formatGroupHits || {}, formatFamilyHitMap, previousFormatFamilyKeys, formatGroupCooldownEnabled)
            : sourceAwareFormatSample({
                settings,
                pool: formatPool,
                count: formatCount,
                recentIds: includeAutoText ? [...recent.formatIds, ...(recent.textIds || [])] : recent.formatIds,
                recentIdHits: includeAutoText ? { ...recent.formatIdHits, ...(recent.textIdHits || {}) } : recent.formatIdHits,
                recentGroups: formalRecent?.formatGroups || [],
                avoidRepeat: settings.avoidRepeat,
                hardExcludedIds: includeAutoText ? [...hardRecent.formatIds, ...(hardRecent.textIds || [])] : hardRecent.formatIds,
                favoriteIds: favoriteFormatIds,
                eligibleMisses: formatEligibleMisses,
                favoriteMultipliers: favoriteFormatMultipliers,
                recentGroupHitMap: formalRecent?.formatGroupHits || {},
                recentFamilyHitMap: formatFamilyHitMap,
                immediateFamilyKeys: previousFormatFamilyKeys,
                groupCooldownEnabled: formatGroupCooldownEnabled,
                externalHardExcludedIds: [...externalExcludedFormatIds, ...externalExcludedTextIds],
                presentationKind: includeAutoText ? 'presentation' : 'format',
            });
    const texts = formatSample.selected.filter(item => item.externalKind === 'text');
    const pickedFormats = formatSample.selected.filter(item => item.externalKind !== 'text');
    const isText = requestedMode === 'text' || longText || texts.length > 0;
    const visualSceneryFormat = getVisualSceneryFormat();
    const forcedFormats = !isText && visualSceneryEnabled(settings) && visualSceneryFormat ? [visualSceneryFormat] : [];
    const directiveFormats = directive?.formats || [];
    const directiveWantsVisualScenery = directiveFormats.some(item => item?.id === '10.2.2');
    let formats;
    if (forcedFormats.length) {
        formats = combineVisual
            ? uniqueById([...forcedFormats, ...directiveFormats.filter(item => item.id !== '10.2.2'), ...pickedFormats])
            : forcedFormats;
    }
    else if (directiveWantsVisualScenery) {
        formats = uniqueById(directiveFormats);
    }
    else {
        formats = uniqueById([...directiveFormats, ...pickedFormats]).slice(0, Math.max(formatCount, directiveFormats.length));
    }
    const formatFairnessEligibleIds = settings.forceVisualScenery && !combineVisual ? [] : formatSample.eligibleIds;
    const formatFairnessSelectedIds = settings.forceVisualScenery && !combineVisual ? [] : pickedFormats.map(item => item.id);
    return { themes, formats, directive, forcedFormats, formatFairnessEligibleIds, formatFairnessSelectedIds,
        ...(combineVisual && !isText ? { visualSceneryCombination: true } : {}),
        ...(requestedMode !== 'auto' || isText ? { requestedPresentationMode: autoLongText ? 'longtext' : requestedMode, presentationMode: isText ? 'text' : 'html' } : {}),
        ...(texts.length ? { texts } : {}) };
}
function comboFromSelection(result, settings, recent, uiReviewFocus = null) {
    const combo = {
        themes: result.themes,
        formats: result.formats,
        themeIds: result.themes.map(x => x.id),
        formatIds: result.formats.map(x => x.id),
        themeGroups: result.themes.map(x => x.group).filter(Boolean),
        themeFamilies: result.themes.map(themeFamilyKey).filter(Boolean),
        formatGroups: result.formats.map(x => x.group).filter(Boolean),
        mode: settings.mode,
        ...(result.faceDrawConfigured ? { faceDrawConfigured: true } : {}),
        ...(result.faceDrawState ? { faceDrawState: result.faceDrawState } : {}),
        samplingMode: settings.samplingMode || 'classic',
        forcedVisualScenery: result.presentationMode !== 'text' && visualSceneryEnabled(settings),
        ...presentationModeFields(result),
        ...(result.texts?.length ? { texts: result.texts, textIds: result.texts.map(item => item.id) } : {}),
        cooldownRounds: settings.cooldownRounds || 10,
        ...(result.worldBookEntryId ? {
            worldBookEntryId: result.worldBookEntryId,
            worldBookTitle: result.worldBookTitle || '',
            worldBookExcerpt: result.worldBookExcerpt || '',
        } : {}),
        uiReviewFocus: Array.isArray(uiReviewFocus) && uiReviewFocus.length ? [...uiReviewFocus] : pickUiReviewFocus(5),
        recentUiReviewFocus: recent.uiReviewFocus || [],
        ...(result.pureOrder ? { pureOrder: true } : {}),
        ...(result.atmosphereBucket ? { atmosphereBucket: result.atmosphereBucket } : {}),
        ...(Array.isArray(result.atmosphereMenu) && result.atmosphereMenu.length > 1 ? { atmosphereMenu: result.atmosphereMenu } : {}),
    };
    if (combo.presentationMode === 'text' || combo.pureOrder)
        return combo;
    const previous = result.previousVariation ? [result.previousVariation] : [];
    if (previous.length) {
        delete combo.interactionRecipeId;
        delete combo.interactionRecipeIds;
        delete combo.paletteRecipeId;
        if (combo.atmosphereMenu)
            combo.atmosphereMenu = combo.atmosphereMenu.map(ticket => {
                const next = { ...ticket };
                delete next.interactionRecipeId;
                delete next.interactionRecipeIds;
                delete next.paletteRecipeId;
                return next;
            });
    }
    if (usesModelOriginalColors(settings))
        return combo;
    return attachPaletteRecipes(combo, { randomUnit, recent: [...getRecentDiversityHistory(3), ...previous],
        darkOnly: settings.darkVisualMode === true, darkCooldown: settings.darkVisualMode !== true && getActivePaletteCooldown(3).active });
}
function rehydrateDirectiveCombo(cached, settings, recent) {
    if (!cached)
        return null;
    const themes = (cached.themeIds || [])
        .map(id => id.startsWith('ext:') ? (externalPoolHasAvailable('theme') && getExternalPoolSnapshot().themesByLibrary.some(library => library.ids.includes(id)) ? externalPoolItem(id, 'theme') : null) : THEMATIC_CATEGORIES.find(item => item.id === id))
        .filter(Boolean);
    const formats = (cached.formatIds || [])
        .map(id => id.startsWith('ext:') ? (getExternalPoolSnapshot().formatsByLibrary.some(library => library.ids.includes(id)) ? externalPoolItem(id, 'format') : null) : PRESENTATION_FORMATS.find(item => item.id === id))
        .filter(Boolean);
    if (themes.length !== (cached.themeIds || []).length || formats.length !== (cached.formatIds || []).length)
        return null;
    const texts = (cached.textIds || []).map(id => getExternalPoolSnapshot().textsByLibrary.some(library => library.ids.includes(id)) ? externalPoolItem(id, 'text') : null);
    if (texts.some(item => !item))
        return null;
    return comboFromSelection({ themes, formats, ...(texts.length ? { texts } : {}),
        ...(isBlankLongTextSelection(cached) ? { themeIds: [], formatIds: [], textIds: [] } : {}),
        ...presentationModeFields(cached), previousVariation: cached }, settings, recent, cached.uiReviewFocus);
}
function directiveRandomPreferenceScopeKey(settings) {
    const blockedThemes = compactUnique(settings?.blacklistedThemeIds || []).sort().join(',');
    const blockedFormats = compactUnique(settings?.blacklistedFormatIds || []).sort().join(',');
    const favoriteThemeIds = compactUnique(settings?.favoriteThemeIds || []).sort();
    const favoriteFormatIds = compactUnique(settings?.favoriteFormatIds || []).sort();
    const themeMultiplierMap = settings?.favoriteThemeMultipliers && typeof settings.favoriteThemeMultipliers === 'object' ? settings.favoriteThemeMultipliers : {};
    const formatMultiplierMap = settings?.favoriteFormatMultipliers && typeof settings.favoriteFormatMultipliers === 'object' ? settings.favoriteFormatMultipliers : {};
    const favoriteThemes = favoriteThemeIds.map(id => `${id}:${Number(themeMultiplierMap[id]) || 3}`).join(',');
    const favoriteFormats = favoriteFormatIds.map(id => `${id}:${Number(formatMultiplierMap[id]) || 3}`).join(',');
    const blacklistState = settings?.blacklistEnabled === false ? 'off' : 'on';
    return `random-pref:b=${blacklistState}:bt=${hashText(blockedThemes)}:bf=${hashText(blockedFormats)}:ft=${hashText(favoriteThemes)}:ff=${hashText(favoriteFormats)}`;
}
function directiveScopeKey(directive, settings) {
    if (!directive?.rawDirective || !directive?.messageKey)
        return '';
    const config = [
        settings.samplingMode || 'classic',
        visualSceneryEnabled(settings) ? 'visual' : 'normal',
        ...(visualSceneryCombinationEnabled(settings) ? ['visual-combination'] : []),
        settings.themesMin,
        settings.themesMax,
        settings.singlePairSampling === true,
        settings.formatsMin,
        settings.formatsMax,
        settings.externalWorldBookRandomEnabled === true ? 'external-on' : 'external-off',
        String(settings.externalWorldBookMixMode || 'builtin-only'),
        directiveRandomPreferenceScopeKey(settings),
        ...(requestedPresentationMode(settings) !== 'auto' ? [`presentation:${requestedPresentationMode(settings)}`] : []),
        ...((requestedPresentationMode(settings) === 'text' ||
            (settings.externalWorldBookRandomEnabled === true && settings.externalWorldBookMixMode !== 'builtin-only'))
            ? [`external-pool:${getExternalPoolSelectionKey()}`] : []),
    ].join('|');
    return hashText(`${directive.messageKey}|${directive.rawDirective}|${config}`);
}
let cachedBatchPlan = null;
const cachedLiveBatchPlans = new Map();
function cloneBatchPlan(value) {
    return JSON.parse(JSON.stringify(value));
}
function batchFacesMatch(pending, faces, batchId) {
    if (!pending || !Array.isArray(pending.faces) || pending.faces.length !== faces.length)
        return false;
    return faces.every((face, faceIndex) => {
        const combo = face.combo;
        const stored = pending.faces[faceIndex];
        const signature = JSON.stringify({
            themeIds: combo.themeIds || [], formatIds: combo.formatIds || [],
            samplingMode: combo.samplingMode || 'classic', forcedVisualScenery: !!combo.forcedVisualScenery,
            ...presentationModeFields(combo),
        });
        return stored?.batchId === batchId && stored.faceIndex === faceIndex && stored.signature === signature &&
            JSON.stringify(stored.themeIds) === JSON.stringify(combo.themeIds) &&
            JSON.stringify(stored.formatIds) === JSON.stringify(combo.formatIds);
    });
}
function batchRandomSettingsKey(settings, total, favorites, exclusions, directive = null) {
    const sortedIds = values => compactUnique(Array.isArray(values) ? values : []).sort();
    const key = JSON.stringify({
        faceCount: total,
        ...(hasFaceDrawRules(settings) ? {
            faceDrawRules: faceDrawFingerprint(normalizeFaceDrawRules(settings.rabbitMirrorFaceDrawRules).slice(0, total)),
            faceDrawPool: getExternalPoolSelectionKey(),
        } : {}),
        ...(Array.from({ length: total }, (_, index) => requestedPresentationMode(settings, index)).some(mode => mode !== 'auto')
            ? { presentationModes: Array.from({ length: total }, (_, index) => requestedPresentationMode(settings, index)) } : {}),
        ...(Array.from({ length: total }, (_, index) => requestedPresentationMode(settings, index)).includes('auto') && Number(settings.autoLongTextPercent) > 0
            ? { autoLongTextPercent: Math.max(0, Math.min(100, Math.round(Number(settings.autoLongTextPercent) || 0))) } : {}),
        ...(settings.lotterySource && settings.lotterySource !== 'builtin' ? {
            lotterySource: settings.lotterySource,
            lotteryBuiltinPercent: Math.max(0, Math.min(100, Math.round(Number(settings.lotteryBuiltinPercent) || 0))),
            lotteryEntryIds: (Array.isArray(settings.lotteryEntries) ? settings.lotteryEntries : []).map(item => item.id),
        } : {}),
        mode: settings.mode,
        samplingMode: settings.samplingMode || 'classic',
        themesMin: settings.themesMin,
        themesMax: settings.themesMax,
        singlePairSampling: settings.singlePairSampling === true,
        formatsMin: settings.formatsMin,
        formatsMax: settings.formatsMax,
        avoidRepeat: settings.avoidRepeat,
        cooldownRounds: settings.cooldownRounds || 10,
        ...(settings.lotteryMethod === 'atmosphere' ? {
            lotteryMethod: 'atmosphere',
            atmosphereStoryPercent: atmosphereStoryPercent(settings),
        } : {}),
        userDirectivePriority: !!settings.userDirectivePriority,
        forceVisualScenery: !!settings.forceVisualScenery,
        ...(visualSceneryCombinationEnabled(settings) ? { visualSceneryCombination: true } : {}),
        externalWorldBookRandomEnabled: settings.externalWorldBookRandomEnabled === true,
        externalWorldBookMixMode: String(settings.externalWorldBookMixMode || 'builtin-only'),
        blacklistEnabled: settings.blacklistEnabled !== false,
        blacklistedThemeIds: sortedIds(settings.blacklistedThemeIds),
        blacklistedFormatIds: sortedIds(settings.blacklistedFormatIds),
        favoriteThemes: [...favorites.themeIds].sort().map(id => [id, favorites.themeMultipliers[id]]),
        favoriteFormats: [...favorites.formatIds].sort().map(id => [id, favorites.formatMultipliers[id]]),
        excludedThemeIds: exclusions.themeIds,
        excludedFormatIds: exclusions.formatIds,
        ...(exclusions.textIds?.length ? { excludedTextIds: exclusions.textIds } : {}),
        directive: directive ? {
            rawDirective: directive.rawDirective,
            disabled: !!directive.disabled,
            themeIds: (directive.themes || []).map(item => item.id),
            formatIds: (directive.formats || []).map(item => item.id),
        } : null,
    });
    return key.length <= 8192 ? key : '';
}
function batchPlanningIdentity(settings, generationScopeKey, generationContext, total, onRejected = null) {
    const reject = reason => { if (onRejected)
        onRejected(reason); return null; };
    const source = generationContext?.batchIdentity;
    const operation = generationContext?.batchPlanningOnly === true ? generationContext?.batchOperation : null;
    const boundedString = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
    if (!boundedString(generationScopeKey, 1024))
        return reject('BATCH_PLAN_IDENTITY_INVALID');
    if (operation) {
        if (!boundedString(operation.operationId, 1024) || !boundedString(operation.generationType, 64))
            return reject('BATCH_PLAN_IDENTITY_INVALID');
    }
    else if (!source || !Number.isSafeInteger(source.mesid) || source.mesid < 0 ||
        !Number.isSafeInteger(source.swipeId) || source.swipeId < 0 || !boundedString(source.sourceHash, 512))
        return reject('BATCH_PLAN_IDENTITY_INVALID');
    const chatKey = getCurrentChatKey(generationContext?.chat || null);
    if (!boundedString(chatKey, 1024))
        return reject('BATCH_PLAN_IDENTITY_INVALID');
    const favorites = getFavoritesState(settings);
    const exclusions = {
        themeIds: compactUnique(Array.isArray(generationContext?.batchExcludedThemeIds) ? generationContext.batchExcludedThemeIds : []).sort(),
        formatIds: compactUnique(Array.isArray(generationContext?.batchExcludedFormatIds) ? generationContext.batchExcludedFormatIds : []).sort(),
        textIds: compactUnique(Array.isArray(generationContext?.batchExcludedTextIds) ? generationContext.batchExcludedTextIds : []).sort(),
    };
    if (!batchRandomSettingsKey(settings, total, favorites, exclusions))
        return reject('BATCH_SETTINGS_TOO_LARGE');
    const currentTurn = settings.userDirectivePriority ? getCurrentTurnUserMessage(generationContext?.chat || null) : null;
    const directive = currentTurn ? parseUserDirective(currentTurn) : null;
    const settingsKey = batchRandomSettingsKey(settings, total, favorites, exclusions, directive);
    return {
        identity: operation
            ? { kind: 'generation-operation', chatKey, generationScopeKey, operationId: operation.operationId,
                generationType: operation.generationType, preview: operation.preview === true, settingsKey }
            : { chatKey, generationScopeKey, mesid: source.mesid, swipeId: source.swipeId, sourceHash: source.sourceHash, settingsKey },
        favorites,
        exclusions,
        directive,
        signatureTooLarge: !settingsKey,
    };
}
function batchPickSnapshot(settings, generationContext, planning) {
    const formalRecent = getRecentIds(settings.cooldownRounds || 10);
    const attemptRecent = getRecentGenerationAttemptIds(planning.identity.chatKey, settings.cooldownRounds || 10);
    const validFormatIds = PRESENTATION_FORMATS.map(item => String(item?.id || '')).filter(Boolean);
    const excludedThemes = new Set(planning.exclusions.themeIds);
    const excludedFormats = new Set(planning.exclusions.formatIds);
    return {
        last: getLastCombo(),
        chatKey: planning.identity.chatKey,
        formalRecent,
        attemptRecent,
        recent: mergeRecent(formalRecent, attemptRecent),
        directive: planning.directive,
        favorites: planning.favorites,
        exclusions: planning.exclusions,
        validFormatIds,
        formatEligibleMisses: getFormatEligibleMisses(validFormatIds),
        themePool: filterRandomThemePool(THEMATIC_CATEGORIES.filter(item => allowByMode(item, settings.mode)), settings).filter(item => !excludedThemes.has(item.id)),
        formatPool: filterRandomFormatPool(PRESENTATION_FORMATS.filter(item => allowByMode(item, settings.mode)), settings).filter(item => !excludedFormats.has(item.id)),
    };
}
function planBatchFace(settings, snapshot, usedThemeIds, usedFormatIds, counts = null, faceIndex = 0, usedTextIds = new Set(), presentationScopeKey = '') {
    const saved = batchDocumentHits;
    batchDocumentHits = [...usedFormatIds].some(isDocumentFormatId) ? 1 : 0;
    try {
        return planBatchFaceCore(settings, snapshot, usedThemeIds, usedFormatIds, counts, faceIndex, usedTextIds, presentationScopeKey);
    }
    finally {
        batchDocumentHits = saved;
    }
}
function planBatchFaceCore(settings, snapshot, usedThemeIds, usedFormatIds, counts = null, faceIndex = 0, usedTextIds = new Set(), presentationScopeKey = '') {
    const configured = configuredFaceSelection(settings, snapshot.directive, faceIndex, snapshot.chatKey, presentationScopeKey, snapshot.recent);
    if (configured)
        return { result: configured.result, payload: { combo: configured.combo, last: snapshot.last, directive: null } };
    const themePool = snapshot.themePool.filter(item => !usedThemeIds.has(item.id));
    const formatPool = snapshot.formatPool.filter(item => !usedFormatIds.has(item.id));
    const themeCount = counts ? counts.themeCount : weightedThemeCount(settings);
    const formatCount = counts ? counts.formatCount : weightedFormatCount(settings);
    const tastedFavorites = withCollectionTaste({ ...snapshot.favorites, formatSet: new Set(snapshot.favorites.formatIds || []) }, settings, canonicalFormatId);
    const result = applyDirectiveOrRandom({
        settings,
        directive: snapshot.directive,
        themePool,
        formatPool,
        themeCount,
        formatCount,
        recent: snapshot.recent,
        formalRecent: snapshot.formalRecent,
        hardRecent: {
            themeIds: [...(snapshot.attemptRecent.themeIds || []), ...snapshot.exclusions.themeIds],
            formatIds: [...(snapshot.attemptRecent.formatIds || []), ...snapshot.exclusions.formatIds],
            textIds: snapshot.attemptRecent.textIds || [],
        },
        previousThemeFamilyKeys: (snapshot.last?.themeIds || []).map(themeFamilyKey),
        previousFormatFamilyKeys: (snapshot.last?.formatIds || []).map(formatFamilyKey),
        favoriteThemeIds: snapshot.favorites.themeIds,
        favoriteFormatIds: tastedFavorites.formatIds,
        favoriteThemeMultipliers: snapshot.favorites.themeMultipliers,
        favoriteFormatMultipliers: tastedFavorites.formatMultipliers,
        formatEligibleMisses: snapshot.formatEligibleMisses,
        externalExcludedThemeIds: [...snapshot.exclusions.themeIds, ...usedThemeIds],
        externalExcludedFormatIds: [...snapshot.exclusions.formatIds, ...usedFormatIds],
        externalExcludedTextIds: [...(snapshot.exclusions.textIds || []), ...usedTextIds],
        faceIndex,
        standaloneTextPool: batchUsesStandaloneTextPool(settings, snapshot, faceIndex),
        presentationScopeKey,
    });
    return { result, payload: { combo: comboFromSelection(result, settings, snapshot.recent), last: snapshot.last, directive: snapshot.directive || null } };
}
function configuredFaceSelection(settings, directive, faceIndex, chatKey, scopeKey, recent, previous = null, presentationIndex = faceIndex) {
    const rule = settings.mode === 'off' || directive ? null : faceDrawRule(settings, faceIndex);
    if (!rule)
        return null;
    const requested = requestedPresentationMode(settings, presentationIndex);
    const longText = requested === 'longtext' || (requested === 'auto' && autoFaceResolvesLongText(settings, presentationIndex, scopeKey));
    const result = drawFaceRule({ rule, faceIndex, chatKey,
        builtinThemes: filterRandomThemePool(THEMATIC_CATEGORIES.filter(item => allowByMode(item, settings.mode)), settings),
        builtinFormats: filterRandomFormatPool(PRESENTATION_FORMATS.filter(item => allowByMode(item, settings.mode)), settings),
        externalSnapshot: getExternalPoolSnapshot(),
        blockedThemeIds: settings.blacklistEnabled === false ? [] : settings.blacklistedThemeIds || [],
        blockedFormatIds: settings.blacklistEnabled === false ? [] : settings.blacklistedFormatIds || [],
        randomUnit, readCursor: readFaceDrawCursorState,
        requestedMode: longText ? 'longtext' : requested, presentationMode: longText ? 'text' : 'html',
    });
    const effectiveSettings = { ...settings, forceVisualScenery: false, visualSceneryCombination: false,
        samplingMode: result.themes.length ? 'classic' : 'format_only' };
    return { result, combo: comboFromSelection({ ...result, ...(previous ? { previousVariation: previous } : {}) }, effectiveSettings, recent) };
}
function finalizeBatchFallback(first, snapshot, scopeKey, identityKey, chatKey, directiveCacheKey = '') {
    if (first.result.formatFairnessEligibleIds?.length) {
        recordFormatEligibleMissRound({
            eligibleIds: first.result.formatFairnessEligibleIds,
            selectedIds: first.result.formatFairnessSelectedIds,
            validFormatIds: snapshot.validFormatIds,
        });
    }
    if (snapshot.directive && directiveCacheKey)
        setDirectiveScopedPick(chatKey, directiveCacheKey, first.payload.combo);
    setLastCombo(first.payload.combo, scopeKey);
    recordGenerationAttempt(first.payload.combo, { chatKey, attemptId: scopeKey, directiveScoped: !!snapshot.directive });
    cachedPick = { scopeKey, payload: cloneBatchPlan(first.payload), batchFallbackKey: identityKey };
    return [cloneBatchPlan(first.payload)];
}
function batchPrioritySingle(settings, snapshot, scopeKey, identityKey, chatKey) {
    const counts = { themeCount: weightedThemeCount(settings), formatCount: weightedFormatCount(settings) };
    if (snapshot.directive?.disabled) {
        const payload = { disabled: true, directive: snapshot.directive, combo: null, last: snapshot.last };
        cachedPick = { scopeKey, payload: cloneBatchPlan(payload), batchFallbackKey: identityKey };
        return [cloneBatchPlan(payload)];
    }
    const directiveCacheKey = directiveScopeKey(snapshot.directive, settings);
    const cachedCombo = snapshot.directive && directiveCacheKey
        ? rehydrateDirectiveCombo(getDirectiveScopedPick(chatKey, directiveCacheKey), settings, snapshot.recent)
        : null;
    if (cachedCombo) {
        const payload = { combo: cachedCombo, last: snapshot.last, directive: snapshot.directive };
        setLastCombo(cachedCombo, scopeKey);
        recordGenerationAttempt(cachedCombo, { chatKey, attemptId: scopeKey, directiveScoped: true });
        cachedPick = { scopeKey, payload: cloneBatchPlan(payload), batchFallbackKey: identityKey };
        return [cloneBatchPlan(payload)];
    }
    const first = planBatchFace(settings, snapshot, new Set(), new Set(), counts);
    return finalizeBatchFallback(first, snapshot, scopeKey, identityKey, chatKey, directiveCacheKey);
}
function batchSinglePath(settings, generationScopeKey, generationContext, identityKey = '') {
    const scopeKey = normalizeGenerationScopeKey(generationScopeKey);
    if (cachedPick?.scopeKey === scopeKey && (identityKey || cachedPick.batchFallbackKey) && cachedPick.batchFallbackKey !== identityKey)
        cachedPick = null;
    const single = pickCombination(settings, generationScopeKey, generationContext);
    if (identityKey && cachedPick?.scopeKey === scopeKey)
        cachedPick.batchFallbackKey = identityKey;
    return [cloneBatchPlan(single)];
}
function multiFacePlanningError(message, reasonCode = 'BATCH_PLAN_INVALID') {
    const reason = describeBatchPlanFailure(reasonCode);
    const error = new Error(`${message}${__rmT("4bFTcylPSleaRb5D")}${reason.code}${__rmT("jzk")}`);
    error.code = 'MULTIFACE_PLAN_UNAVAILABLE';
    error.reasonCode = reason.code;
    return error;
}
function liveBatchResult(plan, directive) {
    const faces = plan.faces.map(face => ({ combo: cloneBatchPlan(face.combo), last: null, directive: cloneBatchPlan(directive || null), batchId: plan.batchId, faceIndex: face.faceIndex }));
    Object.defineProperty(faces, 'batchPlan', { value: cloneBatchPlan(plan), enumerable: false });
    return faces;
}
function addBatchInteractionDiversity(combos, settings) {
    if (combos.length < 2 || combos.length > 5)
        return;
    if (combos.some(combo => combo.presentationMode !== 'text' && !combo.pureOrder)) {
        const usedIds = [], usedGroups = [], recent = getRecentDiversityHistory(3);
        const darkOnly = settings.darkVisualMode === true, darkCooldown = !darkOnly && getActivePaletteCooldown(3).active;
        for (const combo of combos)
            if (!usesModelOriginalColors(settings))
                attachPaletteRecipes(combo, { randomUnit, recent, usedIds, usedGroups, darkOnly, darkCooldown, rerollUsed: true });
    }
    const hints = planBatchInteractionDiversity(combos.length, {
        enabled: true, recentFamilies: getRecentInteractionFamilies(5, { preserveEmpty: true }),
        presentationModes: combos.map(combo => combo.presentationMode || 'html'),
    });
    if (hints)
        combos.forEach((combo, index) => { if (hints[index])
            combo.interactionDiversity = hints[index]; });
}
function pickLiveCombinationBatch(settings, planning, faceCount, planningReason = 'BATCH_PLAN_IDENTITY_INVALID') {
    if (!planning || planning.signatureTooLarge)
        throw multiFacePlanningError(__rmT("qm8tfgg_uu5BgFxpi9nThI.0M0z8NQYSLqBjdo4YTZmOBveHya1sUFQtqtfcTvyTbwuLEkZpmU4V9fsQ3ZifnR69KNGcxf"), planning?.signatureTooLarge ? 'BATCH_SETTINGS_TOO_LARGE' : planningReason);
    if (planning.directive?.disabled)
        return [{ disabled: true, combo: null, directive: planning.directive, last: null }];
    const identityKey = JSON.stringify(planning.identity);
    const cached = cachedLiveBatchPlans.get(identityKey) || findPendingComboBatchPlan(planning.identity);
    if (cached)
        return liveBatchResult(cached, planning.directive);
    const snapshot = batchPickSnapshot(settings, null, planning);
    const usedThemeIds = new Set();
    const usedFormatIds = new Set();
    const usedTextIds = new Set(snapshot.exclusions.textIds || []);
    const fixedThemes = new Set((snapshot.directive?.themes || []).map(item => item.id));
    const fixedFormats = new Set((snapshot.directive?.formats || []).map(item => item.id));
    if (visualSceneryEnabled(settings))
        fixedFormats.add('10.2.2');
    const needsRandomThemes = settings.samplingMode !== 'format_only' && !snapshot.directive?.hasThemeRequest;
    const needsRandomFormats = (!settings.forceVisualScenery || visualSceneryCombinationEnabled(settings)) && !snapshot.directive?.hasFormatRequest;
    const results = [];
    for (let faceIndex = 0; faceIndex < faceCount; faceIndex += 1) {
        const configured = !snapshot.directive && !!faceDrawRule(settings, faceIndex);
        renewStandaloneTextCycle(settings, snapshot, faceIndex, usedTextIds);
        const requestedMode = requestedPresentationMode(settings, faceIndex);
        const worldBookFace = usesWorldBookLottery(settings, faceIndex, identityKey);
        const textAvailable = requestedMode !== 'html' && (requestedMode === 'text' || externalPoolActive(settings, 'text'))
            && externalPoolHasAvailable('text', [...usedTextIds]);
        if (!configured && !worldBookFace && !textAvailable && ((needsRandomThemes && !randomCandidateAvailable(settings, 'theme', snapshot.themePool, usedThemeIds)) ||
            (needsRandomFormats && !randomCandidateAvailable(settings, 'format', snapshot.formatPool, usedFormatIds)))) {
            throw multiFacePlanningError(`${__rmT("bm_2kwxIfDQt4didW5jkuU5CZG4CJk")}${faceCount}${__rmT("K0tKfi_ol3kPjbgRFkE_ksvz4oAzk1TdjfmRyjGZAjbSfec2KPS3ir0q0hHnMInLWvIDvK0EsyDobh")}`, 'BATCH_CANDIDATE_POOL_EXHAUSTED');
        }
        const selected = planBatchFace(settings, snapshot, usedThemeIds, usedFormatIds, null, faceIndex, usedTextIds, identityKey);
        const combo = selected.payload.combo;
        if (!configured && !isBlankLongTextSelection(combo) && !combo.textIds?.length && !combo.worldBookEntryId && ((needsRandomThemes && !combo.themeIds.length) || (needsRandomFormats && !combo.formatIds.length))) {
            throw multiFacePlanningError(__rmT("MIQ1_HZH9XV3e6opuzKkjjM9zh0eSTk1dWH3Si1vrxPtelYjoqOHQ6ws8oUSEinT6wdJMuGP"), 'BATCH_SELECTION_INCOMPLETE');
        }
        if (!isBlankLongTextSelection(combo) && !combo.themeIds.length && !combo.formatIds.length && snapshot.directive)
            combo.customDirective = true;
        if (!configured) {
            for (const id of comboHeldIds(combo, 'themeIds'))
                if (!fixedThemes.has(id))
                    usedThemeIds.add(id);
            for (const id of comboHeldIds(combo, 'formatIds'))
                if (!fixedFormats.has(id))
                    usedFormatIds.add(id);
            (combo.textIds || []).forEach(id => usedTextIds.add(id));
        }
        results.push(selected);
    }
    addBatchInteractionDiversity(results.map(result => result.payload.combo), settings);
    let planRejection = 'BATCH_PLAN_INVALID';
    const plan = createPendingComboBatchPlan(results.map(result => result.payload.combo), planning.identity, {
        eligibleFormatIds: [...new Set(results.flatMap(result => result.result.formatFairnessEligibleIds || []))],
        selectedFormatIds: [...new Set(results.flatMap(result => result.result.formatFairnessSelectedIds || []))],
        validFormatIds: snapshot.validFormatIds,
        directiveScoped: !!snapshot.directive,
    }, { onRejected: code => { planRejection = code; } });
    if (!plan)
        throw multiFacePlanningError(__rmT("cGY5bSZVWZOc43Lk9g.cpAUUPm4MUnWTNnUQmnKxBew4AmflW4hr7f"), planRejection);
    cachedLiveBatchPlans.set(identityKey, cloneBatchPlan(plan));
    if (cachedLiveBatchPlans.size > 8)
        cachedLiveBatchPlans.delete(cachedLiveBatchPlans.keys().next().value);
    return liveBatchResult(plan, snapshot.directive);
}
export function pickSelfInventSelection(settings, faceIndex = 0, generationContext = null, generationScopeKey = '') {
    if (settings?.userDirectivePriority) {
        const currentTurn = getCurrentTurnUserMessage(generationContext?.chat || null);
        const directive = currentTurn ? parseUserDirective(currentTurn) : null;
        if (directive && (directive.disabled || directive.themes?.length || directive.formats?.length || directive.customThemes?.length
            || directive.customFormats?.length || directive.customRequests?.length))
            return null;
    }
    const longText = autoFaceResolvesLongText(settings, faceIndex, normalizeGenerationScopeKey(generationScopeKey));
    const combo = comboFromSelection({
        themes: [], formats: [],
        ...(longText ? { requestedPresentationMode: 'longtext', presentationMode: 'text', blankLongText: true, themeIds: [], formatIds: [], textIds: [] } : { presentationMode: 'html' }),
    }, { ...settings, samplingMode: longText ? (settings.samplingMode || 'classic') : 'self_invent', forceVisualScenery: false, visualSceneryCombination: false }, getRecentIds(settings.cooldownRounds || 10));
    combo.forcedVisualScenery = false;
    try {
        clearPendingCombo();
    }
    catch { }
    if (!longText) {
        combo.selfInvent = true;
        combo.samplingMode = 'self_invent';
        combo.selfInventScope = settings.samplingMode === 'format_only' ? 'format' : settings.singlePairSampling === true ? 'pair' : 'classic';
    }
    else
        combo.blankLongText = true;
    return { combo, directive: null, last: getLastCombo() };
}
export function buildPureOrderSelection(settings, order) {
    const form = order?.presentationOverride === 'html' ? 'html' : order?.presentationOverride === 'longtext' ? 'longtext' : '';
    const text = String(order?.orderText || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ').trim().slice(0, 2000);
    if (form !== 'html' && form !== 'longtext') {
        throw multiFacePlanningError(__rmT("jnL_UbeDm4EmBZUgw7mEICgtaW8j1juhEXPn_QrBmS4E2lYjoqOHQ6ws8oUSEinT6wdJMuGP"), 'PURE_ORDER_FORM');
    }
    if (!text)
        throw multiFacePlanningError(__rmT("VrxFrC7SlICnwGn_uc97gEFRGlE2f7e.ey0Na9.ihlgwpW7EG0Lja63o7ok9uT"), 'PURE_ORDER_EMPTY');
    const directive = {
        disabled: false, themes: [], formats: [], customThemes: [], customFormats: [],
        customRequests: [text], hasThemeRequest: true, hasFormatRequest: true,
        source: __rmT("oiZK4POMOPyCff"), rawDirective: text, messageKey: 'resay-pure-order', pureOrder: true,
    };
    const combo = comboFromSelection({
        themes: [], formats: [], pureOrder: true,
        requestedPresentationMode: form,
        presentationMode: form === 'longtext' ? 'text' : 'html',
    }, { ...settings, forceVisualScenery: false, visualSceneryCombination: false }, { uiReviewFocus: [] });
    combo.customDirective = true;
    combo.pureOrder = true;
    return { combo, directive, last: null };
}
export function pickCombinationForMultifaceResay(settings, resay, generationScopeKey = '', generationContext = null) {
    settings = { ...settings, avoidRepeat: true };
    if (!resay || !Number.isSafeInteger(resay.faceIndex) || resay.faceIndex < 0 ||
        !Array.isArray(resay.faces) || resay.faceIndex >= resay.faces.length || resay.faces.length > 5) {
        throw multiFacePlanningError(__rmT("CjLXzJS5Ef3bH9qG_aVBTAHcUhqt2lOx3ItNa9.ihlgwpW7EG0Lja63o7ok9uT"), 'BATCH_RESAY_FACE_MISSING');
    }
    const face = resay.faces[resay.faceIndex];
    if (!resay.preserveVariation && !resay.preserveSelection && !resay.userPicked) {
        const faceIndex = Number(settings.rabbitMirrorFaceCount) === 1 ? 0 : resay.faceIndex;
        if (['html', 'longtext'].includes(resay.presentationOverride)) {
            const modes = [...(settings.rabbitMirrorPresentationModes || [])];
            modes[faceIndex] = resay.presentationOverride;
            settings = { ...settings, rabbitMirrorPresentationModes: modes };
        }
        return pickCombination(settings, generationScopeKey, { ...(generationContext || {}),
            previousVariation: face, faceIndex, faceDrawIndex: resay.faceIndex });
    }
    if (Number(face?.customThemeCount || 0) > 0 || Number(face?.customFormatCount || 0) > 0 || Number(face?.customRequestCount || 0) > 0) {
        throw multiFacePlanningError(__rmT("6hitwOnhelT4aL1ldwqWchyO.pv1czSEfe6_fZwwpq5CQw40enwaI9EKIyLQ3oi.bR887Yf3A9yvW.bDscUIqB2b2hUkeK_lANA"), 'BATCH_RESAY_CUSTOM_RECIPE');
    }
    const externalSnapshot = getExternalPoolSnapshot();
    const resolveIds = (ids, pool, kind) => {
        if (!Array.isArray(ids) || ids.length > 16)
            throw multiFacePlanningError(__rmT("w92DJQfB1YsrWQ9t_hYTHPb6sHXGJYqiDHeseewwHW0EYENcq8_"), 'BATCH_RESAY_RECIPE_INCOMPLETE');
        const externalLibraries = kind === 'text' ? externalSnapshot.textsByLibrary : kind === 'format' ? externalSnapshot.formatsByLibrary : externalSnapshot.themesByLibrary;
        const selected = ids.map(id => {
            if (typeof id !== 'string' || !id.startsWith('ext:')) {
                const wanted = kind === 'format' ? canonicalFormatId(id) : id;
                return pool.find(item => item.id === wanted);
            }
            if (!externalLibraries.some(library => library.ids.includes(id)))
                return null;
            return externalPoolItem(id, kind);
        });
        if (selected.some(item => !item))
            throw multiFacePlanningError(__rmT("RqP2F42BNPvrJqIY3SK9gXEZYkNrn_zPGqvZWBDQwUisnaKUOp8RO70FzBG"), 'BATCH_RESAY_ENTRY_UNAVAILABLE');
        return selected;
    };
    const themes = resolveIds(face?.themeIds, THEMATIC_CATEGORIES, 'theme');
    const formats = resolveIds(face?.formatIds, PRESENTATION_FORMATS, 'format');
    const texts = resolveIds(face?.textIds || [], [], 'text');
    if (!themes.length && !formats.length && !texts.length && !isBlankLongTextSelection(face) && !face?.worldBookEntryId)
        throw multiFacePlanningError(__rmT("RqP2F1tGYFj.4Ox9EzvppWkn6_lsfblOLkOZfEmE6UvREXKdWAs2BQk4zBG"), 'BATCH_RESAY_RECIPE_INCOMPLETE');
    const selectedSettings = { ...settings, samplingMode: face.samplingMode || settings.samplingMode, forceVisualScenery: face.forcedVisualScenery === true, visualSceneryCombination: face.visualSceneryCombination === true };
    return { combo: comboFromSelection({ themes, formats, ...(texts.length ? { texts } : {}), ...(face.faceDrawConfigured === true ? { faceDrawConfigured: true, ...(face.faceDrawState ? { faceDrawState: cloneBatchPlan(face.faceDrawState) } : {}) } : {}), ...(isBlankLongTextSelection(face) ? { themeIds: [], formatIds: [], textIds: [] } : {}), ...presentationModeFields(face), ...(resay.preserveVariation ? {} : { previousVariation: face }),
            ...(resay.presentationOverride === 'html' ? { presentationMode: 'html', requestedPresentationMode: 'html', blankLongText: false }
                : resay.presentationOverride === 'longtext' ? { presentationMode: 'text', requestedPresentationMode: 'longtext' } : {}) }, selectedSettings, getRecentIds(settings.cooldownRounds || 10)), directive: null, last: null };
}
export function pickCombinationBatch(settings, generationScopeKey = '', generationContext = null, faceCount = 1) {
    settings = { ...settings, avoidRepeat: true };
    if (!Number.isSafeInteger(faceCount) || faceCount < 2 || faceCount > 5)
        return [pickCombination(settings, generationScopeKey, generationContext)];
    let planningRejection = 'BATCH_PLAN_IDENTITY_INVALID';
    const planning = batchPlanningIdentity(settings, generationScopeKey, generationContext, faceCount, code => { planningRejection = code; });
    if (generationContext?.batchPlanningOnly === true)
        return pickLiveCombinationBatch(settings, planning, faceCount, planningRejection);
    if (!planning)
        return batchSinglePath(settings, generationScopeKey, generationContext);
    const { identity } = planning;
    const identityKey = planning.signatureTooLarge ? '' : JSON.stringify(identity);
    const scopeKey = normalizeGenerationScopeKey(generationScopeKey);
    if (identityKey && cachedPick?.scopeKey === scopeKey && cachedPick.batchFallbackKey === identityKey)
        return [cloneBatchPlan(cachedPick.payload)];
    if (identityKey && cachedBatchPlan?.identityKey === identityKey && batchFacesMatch(readPendingComboBatch({ batchId: cachedBatchPlan.batchId, identity }), cachedBatchPlan.faces, cachedBatchPlan.batchId))
        return cloneBatchPlan(cachedBatchPlan.faces);
    cachedBatchPlan = null;
    const snapshot = batchPickSnapshot(settings, generationContext, planning);
    const hasPresentationSelection = Array.from({ length: faceCount }, (_, index) => requestedPresentationMode(settings, index))
        .some(mode => mode !== 'auto') || externalPoolActive(settings, 'text') || visualSceneryCombinationEnabled(settings) || hasFaceDrawRules(settings);
    if (planning.signatureTooLarge || (!hasPresentationSelection && (snapshot.directive || settings.forceVisualScenery))) {
        return batchPrioritySingle(settings, snapshot, scopeKey, identityKey, identity.chatKey);
    }
    const first = planBatchFace(settings, snapshot, new Set(), new Set());
    const faces = [first.payload];
    const usedThemeIds = new Set(first.payload.combo.faceDrawConfigured ? [] : comboHeldIds(first.payload.combo, 'themeIds'));
    const usedFormatIds = new Set(first.payload.combo.faceDrawConfigured ? [] : comboHeldIds(first.payload.combo, 'formatIds'));
    const usedTextIds = new Set([...(snapshot.exclusions.textIds || []), ...(first.payload.combo.faceDrawConfigured ? [] : first.payload.combo.textIds || [])]);
    const wantsThemes = settings.samplingMode !== 'format_only';
    if (first.payload.combo.faceDrawConfigured || isBlankLongTextSelection(first.payload.combo) || first.payload.combo.textIds?.length || (usedFormatIds.size && (!wantsThemes || usedThemeIds.size))) {
        for (let index = 1; index < faceCount; index += 1) {
            renewStandaloneTextCycle(settings, snapshot, index, usedTextIds);
            const mode = requestedPresentationMode(settings, index);
            const configured = !snapshot.directive && !!faceDrawRule(settings, index);
            const textAvailable = mode !== 'html' && (mode === 'text' || externalPoolActive(settings, 'text')) && externalPoolHasAvailable('text', [...usedTextIds]);
            if (!configured && !textAvailable && (!randomCandidateAvailable(settings, 'format', snapshot.formatPool, usedFormatIds) ||
                (wantsThemes && !randomCandidateAvailable(settings, 'theme', snapshot.themePool, usedThemeIds))))
                break;
            const next = planBatchFace(settings, snapshot, usedThemeIds, usedFormatIds, null, index, usedTextIds);
            if (!configured && !isBlankLongTextSelection(next.payload.combo) && !next.payload.combo.textIds?.length && (!next.payload.combo.formatIds.length || (wantsThemes && !next.payload.combo.themeIds.length)))
                break;
            faces.push(next.payload);
            if (!configured) {
                comboHeldIds(next.payload.combo, 'themeIds').forEach(id => usedThemeIds.add(id));
                comboHeldIds(next.payload.combo, 'formatIds').forEach(id => usedFormatIds.add(id));
                (next.payload.combo.textIds || []).forEach(id => usedTextIds.add(id));
            }
        }
    }
    if (faces.length < 2)
        return finalizeBatchFallback(first, snapshot, scopeKey, identityKey, identity.chatKey);
    addBatchInteractionDiversity(faces.map(face => face.combo), settings);
    const batchId = setPendingComboBatch(faces.map(item => item.combo), identity);
    if (!batchId || !batchFacesMatch(readPendingComboBatch({ batchId, identity }), faces, batchId)) {
        if (batchId)
            clearPendingComboBatch({ batchId, identity });
        console.warn('[RabbitMirror] Pending combo batch storage failed; preserving the selected first face.');
        return finalizeBatchFallback(first, snapshot, scopeKey, identityKey, identity.chatKey);
    }
    const completeFaces = faces.map((face, faceIndex) => ({ ...face, batchId, faceIndex }));
    cachedBatchPlan = { identityKey, batchId, faces: cloneBatchPlan(completeFaces) };
    return cloneBatchPlan(completeFaces);
}
export function pickCombination(settings, generationScopeKey = '', generationContext = null) {
    settings = { ...settings, avoidRepeat: true };
    const scopeKey = normalizeGenerationScopeKey(generationScopeKey);
    if (scopeKey && cachedPick?.scopeKey === scopeKey)
        return cachedPick.payload;
    const chatOverride = generationContext?.chat || null;
    const chatKey = getCurrentChatKey(chatOverride);
    const currentTurn = settings.userDirectivePriority ? getCurrentTurnUserMessage(chatOverride) : null;
    const directive = currentTurn ? parseUserDirective(currentTurn) : null;
    const last = getLastCombo();
    const formalRecent = getRecentIds(settings.cooldownRounds || 10);
    const attemptRecent = getRecentGenerationAttemptIds(chatKey, settings.cooldownRounds || 10);
    const previous = generationContext?.previousVariation;
    const recent = mergeRecent(mergeRecent(formalRecent, attemptRecent), previous || {});
    const batchExcludedThemeIds = Array.isArray(generationContext?.batchExcludedThemeIds)
        ? generationContext.batchExcludedThemeIds.map(value => String(value || '')).filter(Boolean)
        : [];
    const batchExcludedFormatIds = Array.isArray(generationContext?.batchExcludedFormatIds)
        ? generationContext.batchExcludedFormatIds.map(value => String(value || '')).filter(Boolean)
        : [];
    const hardRecent = {
        themeIds: [...(attemptRecent.themeIds || []), ...batchExcludedThemeIds, ...(previous?.themeIds || [])],
        formatIds: [...(attemptRecent.formatIds || []), ...batchExcludedFormatIds, ...(previous?.formatIds || [])],
        textIds: [...(attemptRecent.textIds || []), ...(previous?.textIds || [])],
    };
    const favorites = withCollectionTaste(getFavoritesState(settings), settings, canonicalFormatId);
    const validFormatIds = PRESENTATION_FORMATS.map(item => String(item?.id || '')).filter(Boolean);
    const formatEligibleMisses = getFormatEligibleMisses(validFormatIds);
    const themeCount = weightedThemeCount(settings);
    const formatCount = weightedFormatCount(settings);
    let themePool = filterRandomThemePool(THEMATIC_CATEGORIES.filter(item => allowByMode(item, settings.mode)), settings);
    let formatPool = filterRandomFormatPool(PRESENTATION_FORMATS.filter(item => allowByMode(item, settings.mode)), settings);
    if (previous) {
        const freshPool = (pool, ids, family, count) => {
            const held = new Set(ids || []), families = new Set([...held].map(family));
            const freshFamily = pool.filter(item => !families.has(family(item)));
            const freshId = pool.filter(item => !held.has(item.id));
            return freshFamily.length >= count ? freshFamily : freshId.length ? freshId : pool;
        };
        themePool = freshPool(themePool, previous.themeIds, themeFamilyKey, themeCount);
        formatPool = freshPool(formatPool, previous.formatIds, formatFamilyKey, formatCount);
    }
    if (directive?.disabled) {
        const payload = { disabled: true, directive, combo: null, last };
        if (scopeKey)
            cachedPick = { scopeKey, payload };
        return payload;
    }
    const directiveCacheKey = directiveScopeKey(directive, settings);
    const presentationIndex = Number.isSafeInteger(generationContext?.faceIndex) ? generationContext.faceIndex : 0;
    const configuredIndex = [generationContext?.faceDrawIndex, generationContext?.multifaceResay?.faceIndex,
        generationContext?.serialFaceIndex, presentationIndex].find(index => Number.isSafeInteger(index) && index >= 0 && index < 5);
    const configured = configuredFaceSelection(settings, directive, configuredIndex, chatKey, scopeKey, recent, previous, presentationIndex);
    let combo = configured?.combo || null;
    if (directive && directiveCacheKey && !previous) {
        combo = rehydrateDirectiveCombo(getDirectiveScopedPick(chatKey, directiveCacheKey), settings, recent);
    }
    if (!combo) {
        const result = applyDirectiveOrRandom({
            settings,
            directive,
            themePool,
            formatPool,
            themeCount,
            formatCount,
            recent,
            formalRecent,
            hardRecent,
            previousThemeFamilyKeys: (previous?.themeIds || last?.themeIds || []).map(themeFamilyKey),
            previousFormatFamilyKeys: (previous?.formatIds || last?.formatIds || []).map(formatFamilyKey),
            favoriteThemeIds: favorites.themeIds,
            favoriteFormatIds: favorites.formatIds,
            favoriteThemeMultipliers: favorites.themeMultipliers,
            favoriteFormatMultipliers: favorites.formatMultipliers,
            formatEligibleMisses,
            externalExcludedTextIds: generationContext?.batchExcludedTextIds || [],
            faceIndex: Number.isSafeInteger(generationContext?.faceIndex) ? generationContext.faceIndex : 0,
            presentationScopeKey: scopeKey,
        });
        combo = comboFromSelection({ ...result, ...(previous ? { previousVariation: previous } : {}) }, settings, recent);
        if (result.formatFairnessEligibleIds?.length) {
            recordFormatEligibleMissRound({
                eligibleIds: result.formatFairnessEligibleIds,
                selectedIds: result.formatFairnessSelectedIds,
                validFormatIds,
            });
        }
        if (directive && directiveCacheKey)
            setDirectiveScopedPick(chatKey, directiveCacheKey, combo);
    }
    setLastCombo(combo, scopeKey);
    recordGenerationAttempt(combo, {
        chatKey,
        attemptId: scopeKey || `fallback:${Date.now().toString(36)}:${randomUnit().toString(36).slice(2, 8)}`,
        directiveScoped: !!directive,
    });
    const payload = { combo, last, directive: directive || null };
    if (scopeKey)
        cachedPick = { scopeKey, payload };
    return payload;
}
