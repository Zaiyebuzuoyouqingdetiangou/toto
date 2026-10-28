const A = "hOS0CUdWGH9PE.iwTxv5Acaq8FM6sKXmkIz4pVr1DQJglRytf7ZnYeLjBuN2_3ob";
const K = 1541522343;
const R = [];
for (let i = 0; i < 64; i += 1) R[A.charCodeAt(i)] = i;
const cache = new Map();
const templates = new Map();
function decode(e) {
    const n = e.length;
    const units = Math.floor(n * 6 / 16);
    const codes = new Uint16Array(units);
    let s = (K ^ Math.imul(units, 0x9e3779b1)) >>> 0;
    if (!s) s = K;
    let acc = 0;
    let bits = 0;
    let low = -1;
    let u = 0;
    for (let i = 0; i < n && u < units; i += 1) {
        acc = ((acc << 6) | R[e.charCodeAt(i)]) & 0xffffff;
        bits += 6;
        if (bits < 8) continue;
        bits -= 8;
        const byte = (acc >>> bits) & 255;
        if (low < 0) { low = byte; continue; }
        s = (s ^ (s << 13)) >>> 0; s = (s ^ (s >>> 17)) >>> 0; s = (s ^ (s << 5)) >>> 0;
        codes[u] = ((low | (byte << 8)) ^ s) & 0xffff;
        u += 1;
        low = -1;
    }
    if (units <= 8192) return String.fromCharCode.apply(null, codes);
    let text = '';
    for (let k = 0; k < units; k += 8192) text += String.fromCharCode.apply(null, codes.subarray(k, k + 8192));
    return text;
}
export function rmT(e) {
    let v = cache.get(e);
    if (v === undefined) { v = decode(e); cache.set(e, v); }
    return v;
}
export function rmR(e, flags) {
    return new RegExp(rmT(e), flags);
}
export function rmTpl(cooked, raw) {
    const key = cooked.map(x => x === null ? '!' : x).join(',') + '|' + raw.join(',');
    let v = templates.get(key);
    if (!v) {
        v = cooked.map(x => x === null ? undefined : rmT(x));
        Object.defineProperty(v, 'raw', { value: Object.freeze(raw.map(rmT)) });
        Object.freeze(v);
        templates.set(key, v);
    }
    return v;
}
