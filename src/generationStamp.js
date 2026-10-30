export const GENERATION_STAMP_ATTR = 'data-rm-generated';
const VERSION_RE = /^\d{1,3}(?:\.\d{1,4}){1,3}(?:-[\w.]{1,24})?$/;
const int = (value, max) => {
    const number = Math.round(Number(value));
    return Number.isFinite(number) && number >= 0 && number <= max ? number : null;
};
export function compactGenerationStamp(value) {
    if (!value || typeof value !== 'object')
        return null;
    const v = String(value.v || '').trim();
    const t = int(value.t, 4102444800000);
    if (!VERSION_RE.test(v) || !t)
        return null;
    const ms = int(value.ms, 6 * 3600000);
    const th = int(value.th, 6 * 3600000);
    const r = int(value.r, 50);
    const n = int(value.n, 12);
    return { v, t, ...(ms ? { ms } : {}), ...(th !== null && ms && th <= ms ? { th } : {}), ...(r ? { r } : {}), ...(n ? { n } : {}) };
}
const escapeAttr = text => String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unescapeAttr = text => String(text).replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const STAMP_IN_ATTRS = /\sdata-rm-generated\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;
function stampTag(attrs, value) {
    return `<details${String(attrs || '').replace(STAMP_IN_ATTRS, '')} ${GENERATION_STAMP_ATTR}="${value}">`;
}
export function stampGeneratedFaces(html, stamp) {
    const source = String(html || '');
    const compact = compactGenerationStamp(stamp);
    if (!compact || !/<details\b/i.test(source))
        return source;
    const value = escapeAttr(JSON.stringify(compact));
    let stamped = 0;
    const result = source.replace(/(<toto\b[^>]*>)((?:(?!<toto\b|<details\b)[\s\S])*)<details\b([^>]*)>/gi, (all, toto, between, attrs) => {
        stamped += 1;
        return `${toto}${between}${stampTag(attrs, value)}`;
    });
    if (stamped)
        return result;
    return source.replace(/<details\b([^>]*)>/i, (all, attrs) => stampTag(attrs, value));
}
export function readGenerationStamp(html) {
    const tag = String(html || '').match(/<details\b[^>]*>/i)?.[0] || '';
    const match = tag.match(/\sdata-rm-generated\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    if (!match)
        return null;
    try {
        return compactGenerationStamp(JSON.parse(unescapeAttr(match[1] ?? match[2] ?? '')));
    }
    catch {
        return null;
    }
}
