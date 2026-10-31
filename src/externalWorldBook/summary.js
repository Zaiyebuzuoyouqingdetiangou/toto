import { rmT as __rmT } from "../textTable.js?rmv=2.3.1";
const SUMMARY_MAX_CHARS = 240;
const LEGACY_SUMMARY_SCAN_CHARS = 12000;
function plainBody(value) {
    return String(value || '')
        .replace(/<[^>]{0,200}>/g, ' ')
        .replace(/\{\{[^}]{0,120}\}\}/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function normalized(value) {
    return String(value || '').normalize('NFKC').toLocaleLowerCase('zh-Hans-CN');
}
function metadataPrefix(title, keywords) {
    return [title, keywords.length ? `${__rmT("yHPTVuEZWZY")}${keywords.join(' / ')}` : ''].filter(Boolean).join(__rmT("kis"));
}
export function buildExternalEntrySummary(entry) {
    const content = plainBody(entry?.content);
    if (content)
        return content.slice(0, SUMMARY_MAX_CHARS);
    const title = String(entry?.title || '').trim();
    const keywords = [...new Set([...(entry?.primaryKeywords || []), ...(entry?.secondaryKeywords || [])])].slice(0, 5);
    return metadataPrefix(title, keywords).slice(0, SUMMARY_MAX_CHARS);
}
export function externalSummaryForSending(record, summaryMax = 210) {
    const saved = typeof record?.summary === 'string' ? record.summary : '';
    const limit = Math.max(1, Math.min(SUMMARY_MAX_CHARS, Number(summaryMax) || 210));
    if (!saved || saved.length > 1200 || typeof record?.sourceTitle !== 'string' || record.sourceTitle.length > 1000
        || typeof record?.rawContent !== 'string' || !Array.isArray(record?.sourceKeywords)
        || record.sourceKeywords.length > 256 || record.sourceKeywords.some(keyword => typeof keyword !== 'string' || keyword.length > 512))
        return saved;
    const title = record.sourceTitle.trim();
    const keywords = [...new Set(record.sourceKeywords)].slice(0, 5);
    const prefix = metadataPrefix(title, keywords);
    if (prefix.replace(/\s+/g, ' ').trim().length + 1 < limit - 1)
        return saved;
    const raw = record.rawContent;
    const body = plainBody(raw.slice(0, LEGACY_SUMMARY_SCAN_CHARS));
    if (!body)
        return saved;
    if (raw.length > LEGACY_SUMMARY_SCAN_CHARS
        && body.length < Math.max(SUMMARY_MAX_CHARS, normalized(title).length) + 512)
        return saved;
    const legacy = [prefix, normalized(body) !== normalized(title) ? body : ''].filter(Boolean)
        .join(__rmT("kis")).slice(0, SUMMARY_MAX_CHARS).replace(/\r\n?/g, '\n').trim();
    if (saved !== legacy)
        return saved;
    return body.slice(0, SUMMARY_MAX_CHARS);
}
