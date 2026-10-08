// 抽完展现形式后，按形式所属的媒介大类从真实用法索引里强随机抽 3 项，避开近期给过的用法。
// 只有这 3 项进入 Prompt；索引本身不发送。由出题计划冻结，重说与逐面子请求沿用同一份。
import { CORE_USAGES, USAGE_CATEGORIES, USAGE_FORMAT_OVERRIDES, USAGE_GROUP_FALLBACK } from '../data/raw/interactionUsages.js?rmv=1.67.24';

const OFFER_SIZE = 3;
const RECENT_KEY = 'rabbitMirrorUsageRecent';
const RECENT_LIMIT = 45;

function randomIndex(limit) {
    try {
        const buffer = new Uint32Array(1);
        globalThis.crypto.getRandomValues(buffer);
        return buffer[0] % limit;
    } catch {
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
    if (overridden.length) return overridden.slice(0, 2);
    const text = formats.map(item => `${item?.title || ''} ${item?.summary || ''}`).join(' ');
    const scored = Object.entries(USAGE_CATEGORIES)
        .map(([key, category]) => [key, category.keywords.filter(word => text.includes(word)).length])
        .filter(([, score]) => score > 0)
        .sort((a, b) => b[1] - a[1]);
    // 只取命中最多的一类；并列第一时两类都取，避免弱命中把不相干的用法带进来。
    if (scored.length) return scored.filter(([, score]) => score === scored[0][1]).slice(0, 2).map(([key]) => key);
    const group = String(formats[0]?.group || '');
    return USAGE_GROUP_FALLBACK[group] || ['space'];
}

export function normalizeUsageOffer(value) {
    if (!value || typeof value !== 'object' || !Array.isArray(value.usages)) return null;
    const usages = value.usages.filter(item => typeof item === 'string' && item.length <= 16).slice(0, OFFER_SIZE);
    const labels = Array.isArray(value.labels) ? value.labels.filter(item => typeof item === 'string').slice(0, 2) : [];
    return usages.length ? Object.freeze({ labels: Object.freeze(labels), usages: Object.freeze(usages) }) : null;
}

function comboText(combo) {
    return [...(combo?.formats || []), ...(combo?.texts || [])].map(item => `${item?.title || ''} ${item?.summary || ''}`).join(' ');
}

const FLIP_OPEN_USAGE = /翻|展开|打开|掀|揭开|拆开/;

export function drawUsageOffer(combo, { avoidFlip = false } = {}) {
    const keys = usageCategoriesForCombo(combo);
    const allUsages = [...new Set(keys.flatMap(key => USAGE_CATEGORIES[key]?.usages || []))];
    // 近期总是翻面／展开时，这一面不再提供翻、开、揭一类的用法（除非整类都是这种）。
    const nonFlip = allUsages.filter(item => !FLIP_OPEN_USAGE.test(item));
    const pool = avoidFlip && nonFlip.length >= 3 ? nonFlip : allUsages;
    if (!pool.length) return null;
    let recent = [];
    try { recent = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]'); } catch { recent = []; }
    const text = comboText(combo);
    // 形式自带核心玩法时，先从核心用法里取 1 个（同样随机、避开近期）。
    const coreAll = [...new Set(CORE_USAGES.filter(entry => entry.keywords.some(word => text.includes(word))).flatMap(entry => entry.usages))];
    const coreNonFlip = coreAll.filter(item => !FLIP_OPEN_USAGE.test(item));
    const corePool = avoidFlip && coreNonFlip.length ? coreNonFlip : coreAll;
    const coreFresh = corePool.filter(item => !recent.includes(item));
    const core = corePool.length ? shuffled(coreFresh.length ? coreFresh : corePool).slice(0, 1) : [];
    const rest = pool.filter(item => !core.includes(item));
    const fresh = rest.filter(item => !recent.includes(item));
    const source = fresh.length >= OFFER_SIZE - core.length ? fresh : rest;
    const usages = [...core, ...shuffled(source).slice(0, OFFER_SIZE - core.length)];
    try { globalThis.localStorage?.setItem(RECENT_KEY, JSON.stringify([...recent.filter(item => !usages.includes(item)), ...usages].slice(-RECENT_LIMIT))); } catch { /* best effort */ }
    return Object.freeze({ labels: Object.freeze(keys.map(key => USAGE_CATEGORIES[key].label)), usages: Object.freeze(usages) });
}
