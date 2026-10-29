import { rmR as __rmR } from "./textTable.js?rmv=1.99.18";
import { CORE_USAGES, USAGE_CATEGORIES, USAGE_FORMAT_OVERRIDES, USAGE_GROUP_FALLBACK } from '../data/raw/interactionUsages.js?rmv=1.99.18';
import { FORMAT_USAGES, FORMAT_CORE_USAGES } from '../data/raw/formatUsages.js?rmv=1.99.18';
import { driversForUsage, REVEAL_DRIVERS, OFFER_LIMITS_187 } from './interactionMethods.js?rmv=1.99.18';
const OFFER_SIZE = 3;
const RECENT_KEY = 'rabbitMirrorUsageRecent';
const RECENT_LIMIT = 45;
function randomIndex(limit) {
    try {
        const buffer = new Uint32Array(1);
        globalThis.crypto.getRandomValues(buffer);
        return buffer[0] % limit;
    }
    catch {
        return Math.floor(Math.random() * limit);
    }
}
function shuffled(list) {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const other = randomIndex(index + 1);
        [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
}
export function usageCategoriesForCombo(combo) {
    const formats = [...(combo?.formats || []), ...(combo?.texts || [])];
    const overridden = [...new Set(formats.flatMap(item => USAGE_FORMAT_OVERRIDES[String(item?.id || '')] || []))].filter(key => USAGE_CATEGORIES[key]);
    if (overridden.length)
        return overridden.slice(0, 2);
    const text = formats.map(item => `${item?.title || ''} ${item?.summary || ''}`).join(' ');
    const scored = Object.entries(USAGE_CATEGORIES)
        .map(([key, category]) => [key, category.keywords.filter(word => text.includes(word)).length])
        .filter(([, score]) => score > 0)
        .sort((a, b) => b[1] - a[1]);
    if (scored.length)
        return scored.filter(([, score]) => score === scored[0][1]).slice(0, 2).map(([key]) => key);
    const group = String(formats[0]?.group || '');
    return USAGE_GROUP_FALLBACK[group] || ['space'];
}
export function normalizeUsageOffer(value) {
    if (!value || typeof value !== 'object' || !Array.isArray(value.usages))
        return null;
    const usages = value.usages.filter(item => typeof item === 'string' && item.length <= 16).slice(0, OFFER_SIZE);
    const labels = Array.isArray(value.labels) ? value.labels.filter(item => typeof item === 'string').slice(0, 2) : [];
    return usages.length ? Object.freeze({ labels: Object.freeze(labels), usages: Object.freeze(usages) }) : null;
}
function comboText(combo) {
    return [...(combo?.formats || []), ...(combo?.texts || [])].map(item => `${item?.title || ''} ${item?.summary || ''}`).join(' ');
}
const FLIP_OPEN_USAGE = __rmR("PaMA8i0gYRyOfDOLVEUWjE5JiCtoSU1c9wlauknqxNjhLE0qGW5GCqLF", "");
const SLIDE_USAGE = __rmR("KFbLwmhY.xx.drdykA.qdrAJhdIzI_xiCa4BvTb92pduTH3t3oY", "");
const HOLD_USAGE = __rmR("nluxruICMZxh5FkRq40b9d7MwpZ.Aw6lgyT", "");
export function drawUsageOffer(combo, { avoidFlip = false, avoidSlide = false } = {}) {
    const keys = usageCategoriesForCombo(combo);
    const avoided = item => (avoidFlip && FLIP_OPEN_USAGE.test(item)) || (avoidSlide && SLIDE_USAGE.test(item));
    const allUsages = [...new Set(keys.flatMap(key => USAGE_CATEGORIES[key]?.usages || []))].filter(item => !HOLD_USAGE.test(item));
    const nonFlip = allUsages.filter(item => !avoided(item));
    const pool = (avoidFlip || avoidSlide) && nonFlip.length >= 3 ? nonFlip : allUsages;
    if (!pool.length)
        return null;
    let recent = [];
    try {
        recent = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]');
    }
    catch {
        recent = [];
    }
    const text = comboText(combo);
    const formatAll = [...new Set([...(combo?.formats || []), ...(combo?.texts || [])].flatMap(item => FORMAT_USAGES[String(item?.id || '')] || []))].filter(item => !HOLD_USAGE.test(item));
    const coreAll = (formatAll.length ? formatAll : [...new Set(CORE_USAGES.filter(entry => entry.keywords.some(word => text.includes(word))).flatMap(entry => entry.usages))]).filter(item => !HOLD_USAGE.test(item));
    const coreCount = formatAll.length >= OFFER_SIZE ? OFFER_SIZE : formatAll.length ? formatAll.length : 1;
    const coreNonFlip = coreAll.filter(item => !avoided(item));
    const corePool = (avoidFlip || avoidSlide) && coreNonFlip.length ? coreNonFlip : coreAll;
    const coreFresh = corePool.filter(item => !recent.includes(item));
    let core = corePool.length ? shuffled(coreFresh.length >= coreCount ? coreFresh : corePool).slice(0, coreCount) : [];
    const signature = [...(combo?.formats || []), ...(combo?.texts || [])].map(item => FORMAT_CORE_USAGES[String(item?.id || '')]).find(Boolean);
    if (signature && corePool.includes(signature) && !recent.includes(signature))
        core = [signature, ...core.filter(item => item !== signature)].slice(0, Math.max(1, coreCount));
    const rest = pool.filter(item => !core.includes(item));
    const fresh = rest.filter(item => !recent.includes(item));
    const source = fresh.length >= OFFER_SIZE - core.length ? fresh : rest;
    let usages = [...core, ...shuffled(source).slice(0, OFFER_SIZE - core.length)];
    if (OFFER_LIMITS_187)
        usages = limitRevealUsages(usages, { signature, candidates: (formatAll.length ? formatAll : pool).filter(item => !avoided(item)), recent });
    try {
        globalThis.localStorage?.setItem(RECENT_KEY, JSON.stringify([...recent.filter(item => !usages.includes(item)), ...usages].slice(-RECENT_LIMIT)));
    }
    catch { }
    return Object.freeze({ labels: Object.freeze(keys.map(key => USAGE_CATEGORIES[key].label)), usages: Object.freeze(usages) });
}
const RETIRED = new Set(['hold']);
function firstDriver(usage) { return driversForUsage(usage).find(key => !RETIRED.has(key)) || ''; }
export function isRevealUsage(usage) {
    const first = firstDriver(usage);
    return !!first && REVEAL_DRIVERS.has(first);
}
function isObjectUsage(usage) {
    const all = driversForUsage(usage);
    return all.length > 0 && !RETIRED.has(all[0]) && !REVEAL_DRIVERS.has(all[0]);
}
function limitRevealUsages(usages, { signature = '', candidates = [], recent = [] } = {}) {
    const out = [...usages];
    const reveal = out.filter(item => item !== signature && isRevealUsage(item));
    const allowed = out.some(item => item === signature && isRevealUsage(item)) ? 0 : 1;
    const spares = [...new Set(candidates)].filter(item => !out.includes(item) && isObjectUsage(item));
    const ordered = [...shuffled(spares.filter(item => !recent.includes(item))), ...shuffled(spares.filter(item => recent.includes(item)))];
    for (const item of reveal.slice(allowed)) {
        const spare = ordered.shift();
        if (!spare)
            break;
        out[out.indexOf(item)] = spare;
    }
    return out;
}
export function signatureUsageForCombo(combo) {
    return [...(combo?.formats || []), ...(combo?.texts || [])].map(item => FORMAT_CORE_USAGES[String(item?.id || '')]).find(Boolean) || '';
}
export function relatedUsagesForCombo(combo) {
    return [...new Set(usageCategoriesForCombo(combo).flatMap(key => USAGE_CATEGORIES[key]?.usages || []))];
}
