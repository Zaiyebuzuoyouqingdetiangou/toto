import { rmT as __rmT } from "./textTable.js?rmv=2.1.6";
import { listHostWorldBooks, readHostWorldBook } from './externalWorldBook/hostReader.js?rmv=2.1.6';
const MAX_MEMORY_CHARS = 6000;
const MAX_MEMORY_ENTRIES = 24;
const MAX_WORLD_BOOK_ID_CHARS = 1000;
export function normalizeMemoryWorldBookId(value) {
    return typeof value === 'string' && value.length <= MAX_WORLD_BOOK_ID_CHARS && !/[\u0000\r\n]/.test(value)
        ? value.trim() : '';
}
export function memoryWorldBookBindingEnabled(settings) {
    return settings?.memoryScanEnabled === true && settings?.memoryWorldBookEnabled === true
        && !!normalizeMemoryWorldBookId(settings.memoryWorldBookId);
}
export async function listMemoryWorldBooks(options = {}) {
    const books = await listHostWorldBooks(options);
    return books.map(book => ({ fileId: book.fileId, displayName: book.displayName }));
}
function limitChars(maxChars) {
    return Math.max(600, Math.min(MAX_MEMORY_CHARS, Math.floor(Number(maxChars) || 2200)));
}
export function extractMemoryWorldBookMaterial(book, maxChars = 2200, filterText = null) {
    const limit = limitChars(maxChars);
    const entries = Array.isArray(book?.entries) ? book.entries : [];
    const chunks = [];
    const seen = new Set();
    let usedChars = 0;
    let selectedEntries = 0;
    let omitted = false;
    for (const entry of entries) {
        if (entry?.disabled === true || typeof entry?.content !== 'string' || !entry.content)
            continue;
        if (selectedEntries >= MAX_MEMORY_ENTRIES || usedChars >= limit) {
            omitted = true;
            break;
        }
        const remaining = limit - usedChars - (chunks.length ? 2 : 0);
        if (remaining <= 0) {
            omitted = true;
            break;
        }
        const content = typeof filterText === 'function' ? String(filterText(entry.content) ?? '') : entry.content;
        const text = content.slice(0, remaining).trim();
        if (!text || seen.has(text))
            continue;
        seen.add(text);
        chunks.push(text);
        usedChars += text.length + (chunks.length > 1 ? 2 : 0);
        selectedEntries++;
        if (content.length > remaining) {
            omitted = true;
            break;
        }
    }
    return {
        providerId: `worldbook:${String(book?.sourceId || '')}`,
        providerName: `${__rmT("WjeskVhkLXtTgb5D")}${String(book?.sourceName || book?.sourceId || __rmT("qMRPD3fek30NVGIF")).slice(0, 100)}`,
        text: chunks.join('\n\n'),
        coverage: omitted ? { complete: false, reason: 'worldbook-material-limit' } : null,
        selectedEntries,
    };
}
export async function readBoundMemoryWorldBook(settings, maxChars = 2200, options = {}) {
    if (!memoryWorldBookBindingEnabled(settings))
        return null;
    const fileId = normalizeMemoryWorldBookId(settings.memoryWorldBookId);
    const book = await readHostWorldBook({ fileId }, options);
    return extractMemoryWorldBookMaterial(book, maxChars, options.filterText);
}
