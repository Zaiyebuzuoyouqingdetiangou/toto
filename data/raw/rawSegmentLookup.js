import { rmT as __rmT, rmR as __rmR } from "../../src/textTable.js?rmv=2.3.7";
import { RAW_THEMATIC_CATEGORIES } from './rawThematicCategories.js?rmv=2.3.7';
import { RAW_PRESENTATION_FORMATS } from './rawPresentationFormats.js?rmv=2.3.7';
function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function leadingSpaces(line) {
    const match = line.match(/^\s*/);
    return match ? match[0].length : 0;
}
function isBulletLike(line) {
    return /^\s*(?:[-*]|\d+[.)])\s+/.test(line);
}
function isHeading(line) {
    return /^\s*#{1,6}\s+/.test(line);
}
function hasIdMarker(line, id) {
    if (!id)
        return false;
    const escaped = escapeRegExp(id);
    const patterns = [
        new RegExp(`\\*\\*\\s*${escaped}${__rmT("5BwX2X6JwPwleAfpGMibUexqdZ4DPub18s2G0R71")}`),
        new RegExp(`\\*\\*\\s*[·•]?${escaped}${__rmT("5BwX2X6JwPwleAfpGMibUexqdZ4DPub18s2G0R71")}`),
        new RegExp(`(?:^|\\s)${escaped}${__rmT("5BwX2X6JwPwleAfpGMibUexqdZ4DPub18s2G0R71")}`),
    ];
    return patterns.some(pattern => pattern.test(line));
}
function hasTitleMarker(line, title) {
    if (!title)
        return false;
    const normalizedTitle = String(title).replace(/\s+/g, '').toLowerCase();
    const normalizedLine = String(line).replace(/\s+/g, '').toLowerCase();
    return normalizedTitle.length >= 2 && normalizedLine.includes(normalizedTitle);
}
function findStartLine(lines, item) {
    let index = lines.findIndex(line => hasIdMarker(line, item.id));
    if (index >= 0)
        return index;
    index = lines.findIndex(line => isBulletLike(line) && hasTitleMarker(line, item.title));
    if (index >= 0)
        return index;
    return lines.findIndex(line => line.trim() && hasTitleMarker(line, item.title));
}
function collectSegment(lines, startIndex) {
    if (startIndex < 0)
        return '';
    const startLine = lines[startIndex];
    const baseIndent = leadingSpaces(startLine);
    const segment = [startLine];
    for (let i = startIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed) {
            segment.push(line);
            continue;
        }
        const indent = leadingSpaces(line);
        const startsNewSiblingOrParent = indent <= baseIndent && (isBulletLike(line) || isHeading(line));
        if (startsNewSiblingOrParent)
            break;
        segment.push(line);
    }
    return segment.join('\n').trim();
}
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
export function expandShuffledOptions(text) {
    return String(text || '').replace(/⟪([^⟫]+)⟫/g, (_, body) => {
        const options = body.split(__rmT("kis")).map(part => part.trim()).filter(Boolean);
        for (let index = options.length - 1; index > 0; index -= 1) {
            const swap = randomIndex(index + 1);
            [options[index], options[swap]] = [options[swap], options[index]];
        }
        return options.join(__rmT("jvk"));
    });
}
function findRawSegment(rawText, item) {
    const lines = String(rawText || '').split(/\r?\n/);
    const start = findStartLine(lines, item);
    const segment = collectSegment(lines, start);
    return expandShuffledOptions(segment || item.raw || `${__rmT("nSk")}${item.id} ${item.title}${__rmT("nvk")}${item.summary || ''}`);
}
export function resolveThemeRaw(item) {
    return findRawSegment(RAW_THEMATIC_CATEGORIES, item);
}
export function resolvePresentationRaw(item) {
    return findRawSegment(RAW_PRESENTATION_FORMATS, item);
}
export function resolveRawForItem(item, kind) {
    if (kind === 'theme')
        return resolveThemeRaw(item);
    if (kind === 'presentation')
        return resolvePresentationRaw(item);
    return item.raw || `${__rmT("nSk")}${item.id} ${item.title}${__rmT("nvk")}${item.summary || ''}`;
}
const RAW_SNIPPET_CACHE = new Map();
function normalizeComparable(text) {
    return String(text || '')
        .replace(/\{\{\s*(?:user|char)\s*\}\}/gi, token => token.toLowerCase())
        .replace(__rmR("W9_xcqvXd_XKYyABClyrF_leMcoRDFUq_7ZdMkuUK.46mPfg6TQE1RATGqk1UmwkJLRCnvk_cEZ4KjFiX10lq4U7Hwu9Kf", "g"), '')
        .toLowerCase();
}
function cleanSegmentLine(line) {
    return String(line || '')
        .replace(/^\s*#{1,6}\s+/, '')
        .replace(/^\s*(?:[-*]|\d+[.)])\s+/, '')
        .replace(/\*\*/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
function removeOwnMarker(line, item) {
    let value = cleanSegmentLine(line);
    const id = String(item?.id || '').trim();
    const title = String(item?.title || '').trim();
    if (id)
        value = value.replace(new RegExp(`^${escapeRegExp(id)}\\s*`), '');
    if (title)
        value = value.replace(new RegExp(`^${escapeRegExp(title)}\\s*`), '');
    return value.replace(__rmR("rMeUe.uC0pBcPlpRTjilmnfA9ZrRAGZw7HE", ""), '').trim();
}
function truncateAtBoundary(text, maxChars) {
    const raw = String(text || '').trim();
    const limit = Math.max(0, Number(maxChars) || 0);
    if (!limit || !raw)
        return '';
    if (raw.length <= limit)
        return raw;
    const slice = raw.slice(0, Math.max(1, limit - 1));
    const boundary = Math.max(slice.lastIndexOf(__rmT("7os")), slice.lastIndexOf(__rmT("jzk")), slice.lastIndexOf(__rmT("jXs")), slice.lastIndexOf(__rmT("fos")), slice.lastIndexOf('\n'));
    const safe = boundary >= Math.floor(limit * 0.55) ? slice.slice(0, boundary + 1) : slice;
    return `${safe.trim()}…`;
}
export function resolveRawSnippetForItem(item, kind, maxChars = 320) {
    const limit = Math.max(0, Number(maxChars) || 0);
    if (!item || !limit)
        return '';
    const cacheKey = `${kind || 'unknown'}:${item.id || item.title || '?'}:${limit}`;
    if (RAW_SNIPPET_CACHE.has(cacheKey))
        return RAW_SNIPPET_CACHE.get(cacheKey);
    const rawSegment = resolveRawForItem(item, kind);
    const rawLines = String(rawSegment || '').split(/\r?\n/).filter(line => line.trim());
    const summaryComparable = normalizeComparable(item.summary || '');
    const rawComparable = normalizeComparable(item.raw || '');
    const seen = new Set();
    const supplements = [];
    rawLines.forEach((line, index) => {
        const cleaned = index === 0 ? removeOwnMarker(line, item) : cleanSegmentLine(line);
        if (!cleaned)
            return;
        const comparable = normalizeComparable(cleaned);
        if (!comparable || seen.has(comparable))
            return;
        seen.add(comparable);
        if (index === 0 && (comparable === summaryComparable
            || comparable === rawComparable
            || (summaryComparable && comparable.includes(summaryComparable) && comparable.length <= summaryComparable.length + 10)))
            return;
        if (summaryComparable && comparable === summaryComparable)
            return;
        supplements.push(cleaned);
    });
    const snippet = truncateAtBoundary(supplements.join(__rmT("7os")), limit);
    RAW_SNIPPET_CACHE.set(cacheKey, snippet);
    return snippet;
}
