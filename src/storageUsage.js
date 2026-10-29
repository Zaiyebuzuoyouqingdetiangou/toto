import { rmT as __rmT } from "./textTable.js?rmv=1.99.17";
const MB = 1024 * 1024;
function sizeOf(key, value) {
    return (String(key || '').length + String(value || '').length) * 2;
}
function groupOf(key) {
    if (key.startsWith('rabbitMirror:image:'))
        return __rmT("8vfuqCi76NzrUk");
    if (/^rabbit_?mirror|^rabbitMirror|^rh_/i.test(key))
        return __rmT("RP6BSnkqN27lQgMjy1iGak");
    return '';
}
export function localStorageUsage() {
    const storage = globalThis.localStorage;
    if (!storage)
        return null;
    const groups = new Map();
    const others = [];
    let total = 0, images = 0;
    for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key == null)
            continue;
        let value = '';
        try {
            value = storage.getItem(key) || '';
        }
        catch {
            value = '';
        }
        const bytes = sizeOf(key, value);
        total += bytes;
        const group = groupOf(key);
        if (group) {
            groups.set(group, (groups.get(group) || 0) + bytes);
            if (group === __rmT("8vfuqCi76NzrUk") && key.startsWith('rabbitMirror:image:v1:images:'))
                images += 1;
        }
        else
            others.push({ key, bytes });
    }
    others.sort((a, b) => b.bytes - a.bytes);
    return { total, groups, images, otherTotal: others.reduce((sum, item) => sum + item.bytes, 0), others };
}
const mb = bytes => `${(bytes / MB).toFixed(bytes >= MB ? 1 : 2)}MB`;
export function describeLocalStorageUsage() {
    let usage = null;
    try {
        usage = localStorageUsage();
    }
    catch {
        usage = null;
    }
    if (!usage)
        return __rmT("ucFZUe1TX7__unFAwXFpxKNh");
    const parts = [];
    const pictures = usage.groups.get(__rmT("8vfuqCi76NzrUk")) || 0;
    const mirrors = usage.groups.get(__rmT("RP6BSnkqN27lQgMjy1iGak")) || 0;
    if (pictures)
        parts.push(`${__rmT("oNm9IIg2xbeGR_Bq")}${mb(pictures)}${__rmT("eis")}${usage.images}${__rmT("qGltWWZp")}`);
    if (mirrors)
        parts.push(`${__rmT("vDfth4Aqx7gWedOO9nYz5nCx")}${mb(mirrors)}`);
    if (usage.otherTotal) {
        const top = usage.others.slice(0, 2).filter(item => item.bytes >= 0.05 * MB).map(item => `${item.key.slice(0, 32)} ${mb(item.bytes)}`);
        parts.push(`${__rmT("VgFoWg6I0FhIQyQDkrWdHT")}${mb(usage.otherTotal)}${top.length ? `${__rmT("fnnoFq1kWZY")}${top.join(__rmT("jvk"))}${__rmT("eXs")}` : ''}`);
    }
    const hint = pictures >= 0.5 * MB ? __rmT("JjxXTkLjA06ZAHQlFrUA650fd3lFHZfSj5bjGhEg8cbj.y7vgxEK3jsdCyg1KTFG5p8TTbRHPKPiDl6VAoWute0ubF_lDvI3HsBj0w6VHAgNrQ1kS.g1h9ckVS0gBZiAd6SolXoXhFF1F75evw6Q1wQ1lxnCAKaajvkagf") : '';
    return `${__rmT("nGSv.nnFABumguSEDD6dHT")}${mb(usage.total)}${__rmT("7ys")}${parts.join(__rmT("Yis")) || __rmT("wWY")}${hint}`;
}
