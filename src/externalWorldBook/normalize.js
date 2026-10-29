import { rmT as __rmT } from "../textTable.js?rmv=1.99.13";
import { EXTERNAL_WORLD_BOOK_MAX_ENTRIES, EXTERNAL_WORLD_BOOK_PREVIEW_CHARS, EXTERNAL_WORLD_BOOK_SCHEMA_VERSION, EXTERNAL_WORLD_BOOK_SEARCH_CONTENT_CHARS, normalizeWorldBookEntry, normalizeWorldBookString, resolveEntriesContainer, } from './schema.js?rmv=1.99.13';
import { EXTERNAL_WORLD_BOOK_ERROR_CODES, ExternalWorldBookError } from './errors.js?rmv=1.99.13';
function hashText(text = '') {
    let h = 2166136261;
    for (const ch of String(text)) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
}
function normalizedSearchText(value) {
    return String(value ?? '')
        .normalize?.('NFKC')
        ?.toLocaleLowerCase?.('zh-Hans-CN')
        ?? String(value ?? '').toLowerCase();
}
function attachDerivedFields(entry) {
    const lightweight = [
        entry.title,
        entry.comment,
        ...entry.primaryKeywords,
        ...entry.secondaryKeywords,
        entry.content.slice(0, EXTERNAL_WORLD_BOOK_SEARCH_CONTENT_CHARS),
        entry.sourceEntryUid ?? '',
        entry.sourceEntryId,
    ].join('\n');
    return {
        ...entry,
        previewText: entry.content.slice(0, EXTERNAL_WORLD_BOOK_PREVIEW_CHARS),
        searchText: normalizedSearchText(lightweight),
        contentHash: hashText(`${entry.content}\n${entry.primaryKeywords.join('\u0001')}\n${entry.secondaryKeywords.join('\u0001')}`),
    };
}
function normalizeWorldBook(raw, source) {
    const rows = resolveEntriesContainer(raw);
    if (rows.length > EXTERNAL_WORLD_BOOK_MAX_ENTRIES) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.SCHEMA_UNSUPPORTED, `${__rmT("_ZloNNL2CT6MXIFogPD")}${rows.length}${__rmT("wHD0ekSjlQbua9l6hkZ6S8TGjFs")}${EXTERNAL_WORLD_BOOK_MAX_ENTRIES}${__rmT("jzk")}`, { entryCount: rows.length });
    }
    const entries = rows.map(row => attachDerivedFields(normalizeWorldBookEntry(row.entry, row)));
    const sourceName = normalizeWorldBookString(source.sourceName || raw?.name || source.sourceId || __rmT("IFW1zAlNk30NVGIF"), 1000).trim() || __rmT("IFW1zAlNk30NVGIF");
    const sourceId = normalizeWorldBookString(source.sourceId || sourceName, 1000).trim() || sourceName;
    const sourceHash = hashText(`${sourceId}\n${entries.map(item => `${item.sourceEntryUid ?? ''}:${item.sourceEntryId}:${item.contentHash}`).join('\n')}`);
    return {
        schemaVersion: EXTERNAL_WORLD_BOOK_SCHEMA_VERSION,
        sourceType: source.sourceType,
        sourceTransport: source.sourceTransport,
        sourceId,
        sourceName,
        sourceHash,
        entryCount: entries.length,
        entries,
    };
}
export function normalizeHostWorldBook(rawHostData, options = {}) {
    return normalizeWorldBook(rawHostData, {
        sourceType: 'host',
        sourceTransport: String(options.sourceTransport || 'endpoint'),
        sourceId: options.sourceId,
        sourceName: options.sourceName,
    });
}
export function normalizeFileWorldBook(rawFileData, options = {}) {
    return normalizeWorldBook(rawFileData, {
        sourceType: 'file',
        sourceTransport: 'file',
        sourceId: options.sourceId || options.fileFingerprint || options.fileName,
        sourceName: options.sourceName || rawFileData?.name || options.fileName,
    });
}
export function searchNormalizedWorldBookEntries(book, query = '', options = {}) {
    const entries = Array.isArray(book?.entries) ? book.entries : [];
    const rawQuery = String(query ?? '').trim();
    if (!rawQuery)
        return entries;
    const needle = normalizedSearchText(rawQuery);
    const fullContent = options.fullContent === true;
    return entries.filter(entry => {
        if (String(entry.searchText || '').includes(needle))
            return true;
        return fullContent && normalizedSearchText(entry.content).includes(needle);
    });
}
