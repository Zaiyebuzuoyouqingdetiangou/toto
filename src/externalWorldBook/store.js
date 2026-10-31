import { rmT as __rmT } from "../textTable.js?rmv=2.5.3";
import { EXTERNAL_WORLD_BOOK_CLASSIFICATION } from './classifier.js?rmv=2.5.3';
import { EXTERNAL_WORLD_BOOK_ERROR_CODES, ExternalWorldBookError } from './errors.js?rmv=2.5.3';
import { entryIdentity } from './selectionState.js?rmv=2.5.3';
import { EXTERNAL_POOL_METADATA_VERSION, externalPoolMetadataForLibrary, getExternalPoolRevision, getExternalPoolSnapshot, removeExternalPoolLibrary, setExternalPoolMetadataSnapshot, upsertExternalPoolLibrary, validExternalPoolMetadata } from './externalPool.js?rmv=2.5.3';
export const EXTERNAL_WORLD_BOOK_DB_NAME = 'rabbitmirror_external_worldbooks';
export const EXTERNAL_WORLD_BOOK_DB_VERSION = 2;
export const EXTERNAL_WORLD_BOOK_LIBRARY_SCHEMA_VERSION = 1;
const STORE_LIBRARIES = 'libraries';
const STORE_ENTRIES = 'entries';
const STORE_POOL_METADATA = 'poolMetadata';
const INDEX_ENTRIES_BY_LIBRARY = 'byLibrary';
const INDEX_ENTRIES_BY_EXTERNAL_ID = 'byExternalId';
let hydrationFactory = null;
let hydrationPromise = null;
let hydratedRevision = -1;
let hydrationStatus = Object.freeze({ hydrated: false, metadataRebuildRequired: Object.freeze([]), enabledMetadataRebuildRequired: Object.freeze([]) });
export function getExternalPoolHydrationStatus() { return hydrationStatus; }
function noteLibraryChanged(options = {}, detail = {}) {
    if (options?.indexedDBFactory || options?.skipServerBackup === true)
        return;
    void import('./serverBackup.js?rmv=2.5.3')
        .then(module => module.scheduleMotherLibraryServerBackup(detail))
        .catch(() => { });
}
function invalidateMetadataHydration() {
    hydratedRevision = -1;
    hydrationStatus = Object.freeze({ hydrated: false, metadataRebuildRequired: Object.freeze([]), enabledMetadataRebuildRequired: Object.freeze([]) });
}
function metadataRebuildError(libraryId) {
    return new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.ENTRY_STATE_CONFLICT, __rmT("NuXlyEBe.q91GDSCsAtDmXw1qeZtWuBShcbuiE.M1s2eTHSBl6Lrw2gCrAKCSWjfDF_GvZkwSEXTz_wDZzZxsPHrcI7l_fcEqjxzh_Y3CCeWIMmIFGaFRFVhyTGEZf"), { reason: 'metadata-rebuild-required', libraryId });
}
function hashText(text = '') {
    let h = 2166136261;
    for (const ch of String(text)) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
}
function safeIdentityPart(value, maxChars = 96) {
    const text = String(value ?? '').trim();
    const encoded = encodeURIComponent(text).replace(/%/g, '_');
    return encoded.slice(0, maxChars) || 'unknown';
}
export function externalLibraryIdForBook(book) {
    const sourceType = String(book?.sourceType || 'unknown').trim() || 'unknown';
    const sourceId = String(book?.sourceId || book?.sourceName || 'unknown').trim() || 'unknown';
    return `extlib:${safeIdentityPart(sourceType, 20)}:${hashText(`${sourceType}\u0000${sourceId}`)}:${safeIdentityPart(sourceId)}`;
}
export function externalEntryStableIdentity(entry) {
    const sourceId = String(entry?.sourceEntryId ?? '');
    if (entry?.sourceEntryUid !== null && entry?.sourceEntryUid !== undefined && String(entry.sourceEntryUid) !== '') {
        return `uid:${String(entry.sourceEntryUid)}:id:${sourceId}`;
    }
    return `id:${sourceId}`;
}
function externalEntryKind(classification) {
    if (classification === EXTERNAL_WORLD_BOOK_CLASSIFICATION.THEME)
        return 'theme';
    if (classification === EXTERNAL_WORLD_BOOK_CLASSIFICATION.FORMAT)
        return 'format';
    if (classification === EXTERNAL_WORLD_BOOK_CLASSIFICATION.TEXT)
        return 'text';
    if (classification === EXTERNAL_WORLD_BOOK_CLASSIFICATION.AUXILIARY)
        return 'aux';
    return 'entry';
}
export function externalEntryId(libraryId, entry, classification) {
    const stable = externalEntryStableIdentity(entry);
    return `ext:${libraryId}:${externalEntryKind(classification)}:${hashText(stable)}:${safeIdentityPart(stable, 72)}`;
}
function sourceEntryMap(book) {
    return new Map((Array.isArray(book?.entries) ? book.entries : []).map(entry => [entryIdentity(entry), entry]));
}
export function prepareExternalLibrarySnapshot(book, draft, options = {}) {
    if (!book || typeof book !== 'object')
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.STORAGE_WRITE_FAILED, __rmT("JdCzHGxN_gHjXanOvqHoGzldvrr0aOs2"));
    const libraryId = externalLibraryIdForBook(book);
    const now = Number(options.now ?? Date.now());
    const sourceByIdentity = sourceEntryMap(book);
    const storedEntries = [];
    for (const item of Array.isArray(draft) ? draft : []) {
        const source = sourceByIdentity.get(item.entryIdentity);
        if (!source)
            continue;
        const classification = Object.values(EXTERNAL_WORLD_BOOK_CLASSIFICATION).includes(item.classification)
            ? item.classification
            : EXTERNAL_WORLD_BOOK_CLASSIFICATION.PENDING;
        const stableIdentity = externalEntryStableIdentity(source);
        const externalId = externalEntryId(libraryId, source, classification);
        storedEntries.push({
            storageKey: `${libraryId}\u0000${stableIdentity}`,
            libraryId,
            externalId,
            sourceEntryIdentity: stableIdentity,
            sourceEntryId: source.sourceEntryId,
            sourceEntryUid: source.sourceEntryUid,
            sourceTitle: source.title,
            sourceKeywords: [...new Set([...(source.primaryKeywords || []), ...(source.secondaryKeywords || [])])],
            classification,
            suggestion: item.suggestion,
            classificationConfidence: item.confidence,
            userConfirmed: classification !== EXTERNAL_WORLD_BOOK_CLASSIFICATION.PENDING,
            localTitle: String(item.localTitle || source.title || '').trim().slice(0, 1000),
            summary: String(item.summary || '').replace(/\r\n?/g, '\n').trim().slice(0, 1200),
            rawContent: String(source.content || ''),
            contentHash: String(source.contentHash || ''),
            enabled: [
                EXTERNAL_WORLD_BOOK_CLASSIFICATION.THEME,
                EXTERNAL_WORLD_BOOK_CLASSIFICATION.FORMAT,
                EXTERNAL_WORLD_BOOK_CLASSIFICATION.TEXT,
                EXTERNAL_WORLD_BOOK_CLASSIFICATION.AUXILIARY,
            ].includes(classification),
            aliases: [],
            linkedAuxiliaryIds: [],
            sourceDisabled: source.disabled === true,
            sourceConstant: source.constant === true,
            sourceSelective: source.selective === true,
            originalOrder: source.originalOrder,
            createdAt: now,
            updatedAt: now,
        });
    }
    const counts = storedEntries.reduce((acc, entry) => {
        if (entry.classification === EXTERNAL_WORLD_BOOK_CLASSIFICATION.THEME)
            acc.theme += 1;
        else if (entry.classification === EXTERNAL_WORLD_BOOK_CLASSIFICATION.FORMAT)
            acc.format += 1;
        else if (entry.classification === EXTERNAL_WORLD_BOOK_CLASSIFICATION.TEXT)
            acc.text += 1;
        else if (entry.classification === EXTERNAL_WORLD_BOOK_CLASSIFICATION.AUXILIARY)
            acc.auxiliary += 1;
        else if (entry.classification === EXTERNAL_WORLD_BOOK_CLASSIFICATION.IGNORE)
            acc.ignored += 1;
        else
            acc.pending += 1;
        return acc;
    }, { theme: 0, format: 0, text: 0, auxiliary: 0, ignored: 0, pending: 0 });
    return {
        library: {
            schemaVersion: EXTERNAL_WORLD_BOOK_LIBRARY_SCHEMA_VERSION,
            libraryId,
            displayName: String(book.sourceName || __rmT("IFW1zAlNk30NVGIF")).trim().slice(0, 1000),
            sourceType: String(book.sourceType || ''),
            sourceTransport: String(book.sourceTransport || ''),
            sourceWorldBookId: String(book.sourceId || ''),
            sourceWorldBookName: String(book.sourceName || ''),
            sourceHash: String(book.sourceHash || ''),
            enabled: options.enabled === true,
            entryCount: storedEntries.length,
            themeCount: counts.theme,
            formatCount: counts.format,
            ...(counts.text ? { textCount: counts.text } : {}),
            auxiliaryCount: counts.auxiliary,
            pendingCount: counts.pending,
            ignoredCount: counts.ignored,
            createdAt: now,
            updatedAt: now,
        },
        entries: storedEntries,
    };
}
function requestPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
    });
}
function transactionPromise(transaction) {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed'));
        transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'));
    });
}
function wrapStorageError(error, fallbackMessage = __rmT("We50Yje18BIH6E5T6jniNFA8.Yqhr7s2")) {
    if (error instanceof ExternalWorldBookError)
        return error;
    const name = String(error?.name || '');
    if (name === 'QuotaExceededError') {
        return new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.STORAGE_QUOTA, __rmT("K1sD8mzq1ydSBpjLxpfva59L5xDEiHh2tyl_N.KZoz2YQYOZdmNkIfvhB_D9uT"));
    }
    return new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.STORAGE_WRITE_FAILED, fallbackMessage, { causeName: name || 'Error' });
}
export async function openExternalLibraryDatabase(options = {}) {
    const factory = options.indexedDBFactory || globalThis.indexedDB;
    if (!factory || typeof factory.open !== 'function') {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.STORAGE_UNAVAILABLE, __rmT("PCYTXgIfcT7JUcuKCNfKV2xZHbxgacEGTzAmLyUK.wpg8b3QZwjrkFIu0mdlNta241_.V8AgRK92adMCqAk"));
    }
    return new Promise((resolve, reject) => {
        let request;
        let settled = false;
        const rejectOpen = error => { if (!settled) {
            settled = true;
            reject(error);
        } };
        try {
            request = factory.open(EXTERNAL_WORLD_BOOK_DB_NAME, EXTERNAL_WORLD_BOOK_DB_VERSION);
        }
        catch (error) {
            rejectOpen(wrapStorageError(error, __rmT("Io8Yk8oG8iZH4.zY6ijQ1TkFw20fXP9SsNebAwKq")));
            return;
        }
        request.onupgradeneeded = () => {
            if (settled) {
                try {
                    request.transaction?.abort();
                }
                catch { }
                return;
            }
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_LIBRARIES))
                db.createObjectStore(STORE_LIBRARIES, { keyPath: 'libraryId' });
            if (!db.objectStoreNames.contains(STORE_POOL_METADATA))
                db.createObjectStore(STORE_POOL_METADATA, { keyPath: 'libraryId' });
            if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
                const entries = db.createObjectStore(STORE_ENTRIES, { keyPath: 'storageKey' });
                entries.createIndex(INDEX_ENTRIES_BY_LIBRARY, 'libraryId', { unique: false });
                entries.createIndex(INDEX_ENTRIES_BY_EXTERNAL_ID, 'externalId', { unique: true });
            }
            else {
                const tx = request.transaction;
                const entries = tx.objectStore(STORE_ENTRIES);
                if (!entries.indexNames.contains(INDEX_ENTRIES_BY_LIBRARY))
                    entries.createIndex(INDEX_ENTRIES_BY_LIBRARY, 'libraryId', { unique: false });
                if (!entries.indexNames.contains(INDEX_ENTRIES_BY_EXTERNAL_ID))
                    entries.createIndex(INDEX_ENTRIES_BY_EXTERNAL_ID, 'externalId', { unique: true });
            }
        };
        request.onsuccess = () => {
            const db = request.result;
            if (settled) {
                try {
                    db.close();
                }
                catch { }
                return;
            }
            settled = true;
            db.onversionchange = () => { try {
                db.close();
            }
            catch { } };
            resolve(db);
        };
        request.onerror = () => rejectOpen(wrapStorageError(request.error, __rmT("Io8Yk8oG8iZH4.zY6ijQ1TkFw20fXP9SsNebAwKq")));
        request.onblocked = () => rejectOpen(new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.STORAGE_UNAVAILABLE, __rmT("IS665oSB0bXkbQIf1J.nujvIqfrlaIE7oYZBqKAq3fWLNzGKYUUAAhIH9V6qHeebI_nw3Pp5AdM3fyszREEsSdGu")));
    });
}
async function entryKeysForLibrary(store, libraryId, options = {}) {
    const keyRangeFactory = options.keyRangeFactory || globalThis.IDBKeyRange;
    if (store.index && keyRangeFactory?.only) {
        const index = store.index(INDEX_ENTRIES_BY_LIBRARY);
        if (index?.getAllKeys)
            return requestPromise(index.getAllKeys(keyRangeFactory.only(libraryId)));
    }
    if (typeof store.getAll === 'function') {
        const rows = await requestPromise(store.getAll());
        return (Array.isArray(rows) ? rows : []).filter(row => row?.libraryId === libraryId).map(row => row.storageKey);
    }
    return [];
}
export async function saveExternalLibrarySnapshot(snapshot, options = {}) {
    const db = await openExternalLibraryDatabase(options);
    try {
        const transaction = db.transaction([STORE_LIBRARIES, STORE_ENTRIES, STORE_POOL_METADATA], 'readwrite');
        const libraries = transaction.objectStore(STORE_LIBRARIES);
        const entries = transaction.objectStore(STORE_ENTRIES);
        const libraryId = String(snapshot?.library?.libraryId || '');
        if (!libraryId)
            throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.STORAGE_WRITE_FAILED, __rmT("m8EkAbzTYsAAsEEYz8lC4xjd5kjNNnEgAAZhl5Pp_2N_PvQX"));
        const existing = await requestPromise(libraries.get(libraryId));
        const keys = await entryKeysForLibrary(entries, libraryId, options);
        for (const key of keys)
            entries.delete(key);
        const library = {
            ...snapshot.library,
            enabled: existing ? existing.enabled === true : snapshot.library.enabled === true,
            createdAt: existing?.createdAt ?? snapshot.library.createdAt,
            updatedAt: Date.now(),
            poolMetadataVersion: EXTERNAL_POOL_METADATA_VERSION,
        };
        libraries.put(library);
        transaction.objectStore(STORE_POOL_METADATA).put(externalPoolMetadataForLibrary(library, snapshot.entries || []));
        for (const entry of snapshot.entries || []) {
            entries.put({ ...entry, createdAt: existing?.createdAt ?? entry.createdAt, updatedAt: Date.now() });
        }
        await transactionPromise(transaction);
        upsertExternalPoolLibrary(library, snapshot.entries || []);
        invalidateMetadataHydration();
        noteLibraryChanged(options);
        return library;
    }
    catch (error) {
        try {
            db.close();
        }
        catch { }
        throw wrapStorageError(error);
    }
    finally {
        try {
            db.close();
        }
        catch { }
    }
}
export async function listExternalLibraries(options = {}) {
    const db = await openExternalLibraryDatabase(options);
    try {
        const transaction = db.transaction([STORE_LIBRARIES], 'readonly');
        const rows = await requestPromise(transaction.objectStore(STORE_LIBRARIES).getAll());
        await transactionPromise(transaction);
        return (Array.isArray(rows) ? rows : []).sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
    }
    finally {
        try {
            db.close();
        }
        catch { }
    }
}
export async function getExternalLibraryEntries(libraryId, options = {}) {
    const db = await openExternalLibraryDatabase(options);
    try {
        const transaction = db.transaction([STORE_ENTRIES], 'readonly');
        const store = transaction.objectStore(STORE_ENTRIES);
        const keyRangeFactory = options.keyRangeFactory || globalThis.IDBKeyRange;
        let rows;
        if (store.index && keyRangeFactory?.only)
            rows = await requestPromise(store.index(INDEX_ENTRIES_BY_LIBRARY).getAll(keyRangeFactory.only(libraryId)));
        else
            rows = (await requestPromise(store.getAll())).filter(row => row?.libraryId === libraryId);
        await transactionPromise(transaction);
        return Array.isArray(rows) ? rows : [];
    }
    finally {
        try {
            db.close();
        }
        catch { }
    }
}
function externalEntryChoice(row) {
    return {
        externalId: String(row.externalId || ''),
        title: String(row.localTitle || row.sourceTitle || __rmT("W7DAA7Hfj9ZL.k")).slice(0, 1000),
        classification: String(row.classification || ''),
        enabled: row.enabled === true,
        selectable: row.userConfirmed === true && ['theme', 'format', 'text'].includes(row.classification),
        reclassifiable: ['theme', 'format', 'text'].includes(row.classification),
    };
}
export async function listExternalLibraryEntryChoices(libraryId, options = {}) {
    if (typeof libraryId !== 'string' || !libraryId.trim() || libraryId !== libraryId.trim() || libraryId.length > 1024) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.ENTRY_STATE_CONFLICT, __rmT("hQd0azk3hqCvBfJ6YvTwGKjOznyXdgAhBYqt9L49ECHdd_c5q8_"));
    }
    const pageSize = Math.max(1, Math.min(50, Math.floor(Number(options.pageSize) || 50)));
    const offset = Math.max(0, Math.min(25000, Math.floor(Number(options.offset) || 0)));
    const query = String(options.query || '').trim().slice(0, 200).toLocaleLowerCase('zh-Hans-CN');
    const db = await openExternalLibraryDatabase(options);
    try {
        const transaction = db.transaction([STORE_ENTRIES], 'readonly');
        const done = transactionPromise(transaction);
        done.catch(() => { });
        const result = await new Promise((resolve, reject) => {
            const request = transaction.objectStore(STORE_ENTRIES).index(INDEX_ENTRIES_BY_LIBRARY).openCursor(libraryId);
            const choices = [];
            let matched = 0;
            request.onerror = () => reject(request.error || new Error('Entry choices read failed'));
            request.onsuccess = () => {
                const cursor = request.result;
                if (!cursor) {
                    resolve({ choices, hasNext: false, offset });
                    return;
                }
                const row = cursor.value;
                if (row?.libraryId === libraryId) {
                    const choice = externalEntryChoice(row);
                    if (!query || choice.title.toLocaleLowerCase('zh-Hans-CN').includes(query)) {
                        if (matched++ >= offset)
                            choices.push(choice);
                        if (choices.length > pageSize) {
                            choices.pop();
                            resolve({ choices, hasNext: true, offset });
                            return;
                        }
                    }
                }
                cursor.continue();
            };
        });
        await done;
        return result;
    }
    catch (error) {
        throw wrapStorageError(error, __rmT("ZpxE16D_UQP2A0cYzToKIE_WE5FXnDIL.1x.09grwFbOhzQB5pP9LPCpzBG"));
    }
    finally {
        try {
            db.close();
        }
        catch { }
    }
}
export async function listExternalLibraryTitleIndex(options = {}) {
    const db = await openExternalLibraryDatabase(options);
    try {
        const head = db.transaction([STORE_LIBRARIES, STORE_POOL_METADATA], 'readonly');
        const headDone = transactionPromise(head);
        const [libraries, metadata] = await Promise.all([
            requestPromise(head.objectStore(STORE_LIBRARIES).getAll()),
            requestPromise(head.objectStore(STORE_POOL_METADATA).getAll()),
            headDone,
        ]);
        const byLibrary = new Map((metadata || []).map(record => [record?.libraryId, record]));
        const result = [];
        for (const library of (libraries || []).filter(item => item?.enabled === true)) {
            const record = byLibrary.get(library.libraryId);
            if (validExternalPoolMetadata(record, library.libraryId) && record.titles && typeof record.titles === 'object') {
                const entries = [];
                for (const [classification, ids] of [['theme', record.themeIds], ['format', record.formatIds], ['text', record.textIds || []]]) {
                    for (const externalId of ids)
                        entries.push({ externalId, classification, title: String(record.titles[externalId] || externalId) });
                }
                result.push({ library, entries });
                continue;
            }
            const transaction = db.transaction([STORE_ENTRIES], 'readonly');
            const done = transactionPromise(transaction);
            done.catch(() => { });
            const entries = await new Promise((resolve, reject) => {
                const rows = [];
                const request = transaction.objectStore(STORE_ENTRIES).index(INDEX_ENTRIES_BY_LIBRARY).openCursor(library.libraryId);
                request.onerror = () => reject(request.error || new Error('Entry title read failed'));
                request.onsuccess = () => {
                    const cursor = request.result;
                    if (!cursor) {
                        resolve(rows);
                        return;
                    }
                    const choice = externalEntryChoice(cursor.value || {});
                    if (cursor.value?.libraryId === library.libraryId && choice.enabled && choice.selectable) {
                        rows.push({ externalId: choice.externalId, classification: choice.classification, title: choice.title.slice(0, 80) });
                    }
                    cursor.continue();
                };
            });
            await done;
            result.push({ library, entries });
        }
        return result;
    }
    catch (error) {
        throw wrapStorageError(error, __rmT("TuImAKgx1YXhn9rw6IeZSF2IFuKjydAODcCOdO2Z6WTg0L3Dq8_"));
    }
    finally {
        try {
            db.close();
        }
        catch { }
    }
}
export async function setExternalLibraryEntryEnabled(libraryId, externalId, enabled, options = {}) {
    const db = await openExternalLibraryDatabase(options);
    let transaction;
    let done;
    try {
        transaction = db.transaction([STORE_LIBRARIES, STORE_ENTRIES, STORE_POOL_METADATA], 'readwrite');
        done = transactionPromise(transaction);
        done.catch(() => { });
        const libraries = transaction.objectStore(STORE_LIBRARIES);
        const entries = transaction.objectStore(STORE_ENTRIES);
        const metadataStore = transaction.objectStore(STORE_POOL_METADATA);
        const [library, row, metadata] = await Promise.all([
            requestPromise(libraries.get(libraryId)),
            requestPromise(entries.index(INDEX_ENTRIES_BY_EXTERNAL_ID).get(externalId)),
            requestPromise(metadataStore.get(libraryId)),
        ]);
        if (!library || !row || row.libraryId !== libraryId || row.externalId !== externalId) {
            throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.NOT_FOUND, __rmT("vYFjI2wJn83NI0UC00EAtwh_ATNTC_ZFtRapgVjizBR3.rIREaJI74CMzBG"));
        }
        if (!validExternalPoolMetadata(metadata, libraryId))
            throw metadataRebuildError(libraryId);
        if (!externalEntryChoice(row).selectable || !externalId.startsWith(`ext:${libraryId}:${row.classification}:`)) {
            throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.ENTRY_STATE_CONFLICT, __rmT("EVShtGGd5_m57NRklPOWY7tkf0XbSolClP48yQgEPtd4RPy4YRzucvYY2itDhmo28LHYWVaexkGVw2qs7gQt9sN7WAT"));
        }
        const now = Date.now();
        const next = { ...row, enabled: enabled === true, updatedAt: now };
        const field = row.classification === 'theme' ? 'themeIds' : row.classification === 'text' ? 'textIds' : 'formatIds';
        const ids = (metadata[field] || []).filter(id => id !== externalId);
        if (next.enabled)
            ids.push(externalId);
        const nextMetadata = { ...metadata, enabled: library.enabled === true, [field]: ids };
        if (metadata.titles && typeof metadata.titles === 'object') {
            nextMetadata.titles = { ...metadata.titles };
            if (next.enabled)
                nextMetadata.titles[externalId] = externalEntryChoice(next).title.slice(0, 80);
            else
                delete nextMetadata.titles[externalId];
        }
        const nextLibrary = { ...library, updatedAt: now };
        entries.put(next);
        metadataStore.put(nextMetadata);
        libraries.put(nextLibrary);
        await done;
        upsertExternalPoolLibrary(nextLibrary, [
            ...nextMetadata.themeIds.map(id => ({ externalId: id, classification: 'theme', enabled: true, userConfirmed: true })),
            ...nextMetadata.formatIds.map(id => ({ externalId: id, classification: 'format', enabled: true, userConfirmed: true })),
            ...(nextMetadata.textIds || []).map(id => ({ externalId: id, classification: 'text', enabled: true, userConfirmed: true })),
        ]);
        invalidateMetadataHydration();
        noteLibraryChanged(options);
        return externalEntryChoice(next);
    }
    catch (error) {
        try {
            transaction?.abort();
        }
        catch { }
        if (done)
            await done.catch(() => { });
        throw wrapStorageError(error, __rmT("HHL1Si2eC8NTnWYEBLzVdJU491bb9yfc.Uh73C74DK3kriLd4HSUBvU56H0tBSkC"));
    }
    finally {
        try {
            db.close();
        }
        catch { }
    }
}
export async function reclassifyExternalLibraryEntries(libraryId, selection, classification, options = {}) {
    const conflict = message => new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.ENTRY_STATE_CONFLICT, message);
    if (typeof libraryId !== 'string' || !libraryId.trim() || libraryId !== libraryId.trim() || libraryId.length > 1024) {
        throw conflict(__rmT("hQd0azk3hqCvBfJ6YvTwGKjOznyXdgAhBYqt9L49ECHdd_c5q8_"));
    }
    if (!['theme', 'format', 'text'].includes(classification)) {
        throw conflict(__rmT("rMDwEyTz7wOVoVDXqTXS1ycIeYteKWMNb4NEcIYuSqwSf2SH9PP9ycKwOfNWXTbY.nA_Vp8kjthobh"));
    }
    const all = selection?.all === true;
    if (!selection || typeof selection !== 'object' || Array.isArray(selection)
        || (selection.all !== undefined && typeof selection.all !== 'boolean')
        || (all ? selection.ids !== undefined : !Array.isArray(selection.ids) || selection.excludedIds !== undefined)) {
        throw conflict(__rmT("nQWQXWr4ti0snFW64jydcsgsc46PYhoMb.jD.u5aSs82kL3iSz04IzrvMbG9uT"));
    }
    const requestedIds = all ? (selection.excludedIds ?? []) : selection.ids;
    if (!Array.isArray(requestedIds) || requestedIds.some(id => typeof id !== 'string' || !id || id !== id.trim() || id.length > 2048)) {
        throw conflict(__rmT("924OABous_FpTTB8VFplLMvJww9Z493pSvpHb7NgL3pLaZQX"));
    }
    const ids = new Set(requestedIds);
    const db = await openExternalLibraryDatabase(options);
    let transaction;
    let done;
    try {
        transaction = db.transaction([STORE_LIBRARIES, STORE_ENTRIES, STORE_POOL_METADATA], 'readwrite');
        done = transactionPromise(transaction);
        done.catch(() => { });
        const libraries = transaction.objectStore(STORE_LIBRARIES);
        const entries = transaction.objectStore(STORE_ENTRIES);
        const metadataStore = transaction.objectStore(STORE_POOL_METADATA);
        const [library, rows] = await Promise.all([
            requestPromise(libraries.get(libraryId)),
            requestPromise(entries.index(INDEX_ENTRIES_BY_LIBRARY).getAll(libraryId)),
        ]);
        if (!library)
            throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.NOT_FOUND, __rmT("VeRK0HRj8feBkvvgEP6w16FctR1QtfFGB0LK6Sx5ZANj4rghlzDr7f"));
        if (!Array.isArray(rows) || rows.some(row => !row || row.libraryId !== libraryId)) {
            throw conflict(__rmT("TuImAA_z2F3wdyyq6IY8SMgFpINXdQGQUYa3PUn1Ce7hCX3aq8_"));
        }
        const byId = new Map(rows.map(row => [row.externalId, row]));
        for (const id of ids) {
            const row = byId.get(id);
            if (!row || !externalEntryChoice(row).reclassifiable) {
                throw conflict(__rmT("f6MiFyEpG1jGksfyeTyU9liXJ8rsB9YT8bsIXSU4939SrT0Ui8ZWVKyIHVJR1sNW6avXqoZK4rCPRBUsmT8DJk8owaE8_4YO"));
            }
        }
        const now = Number(options.now ?? Date.now());
        let selectedCount = 0;
        const changed = [];
        const nextRows = rows.map(row => {
            if (!externalEntryChoice(row).reclassifiable || (all ? ids.has(row.externalId) : !ids.has(row.externalId)))
                return row;
            selectedCount++;
            const externalId = externalEntryId(libraryId, row, classification);
            if (row.classification === classification && row.userConfirmed === true && row.externalId === externalId)
                return row;
            const next = { ...row, classification, externalId, userConfirmed: true, updatedAt: now };
            changed.push(next);
            return next;
        });
        if (!changed.length) {
            await done;
            return { changedCount: 0, selectedCount };
        }
        const counts = { themeCount: 0, formatCount: 0, textCount: 0, auxiliaryCount: 0, pendingCount: 0, ignoredCount: 0 };
        for (const row of nextRows) {
            const field = ({ theme: 'themeCount', format: 'formatCount', text: 'textCount', auxiliary: 'auxiliaryCount', ignore: 'ignoredCount' })[row.classification] || 'pendingCount';
            counts[field]++;
        }
        const nextLibrary = { ...library, ...counts, entryCount: nextRows.length, poolMetadataVersion: EXTERNAL_POOL_METADATA_VERSION, updatedAt: now };
        const metadata = externalPoolMetadataForLibrary(nextLibrary, nextRows);
        for (const row of changed)
            entries.put(row);
        libraries.put(nextLibrary);
        metadataStore.put(metadata);
        await done;
        upsertExternalPoolLibrary(nextLibrary, [
            ...metadata.themeIds.map(externalId => ({ externalId, classification: 'theme', enabled: true, userConfirmed: true })),
            ...metadata.formatIds.map(externalId => ({ externalId, classification: 'format', enabled: true, userConfirmed: true })),
            ...(metadata.textIds || []).map(externalId => ({ externalId, classification: 'text', enabled: true, userConfirmed: true })),
        ]);
        invalidateMetadataHydration();
        noteLibraryChanged(options);
        return { changedCount: changed.length, selectedCount };
    }
    catch (error) {
        try {
            transaction?.abort();
        }
        catch { }
        if (done)
            await done.catch(() => { });
        throw wrapStorageError(error, __rmT("zdtud76e8L9TnWYEBLzZdlr2ID1Ceb6MgcU02YcruRF1xVHpFH9UBvU56H0tBSkC"));
    }
    finally {
        try {
            db.close();
        }
        catch { }
    }
}
export async function setExternalLibraryEnabled(libraryId, enabled, options = {}) {
    const db = await openExternalLibraryDatabase(options);
    try {
        const transaction = db.transaction([STORE_LIBRARIES, STORE_POOL_METADATA], 'readwrite');
        const store = transaction.objectStore(STORE_LIBRARIES);
        const metadataStore = transaction.objectStore(STORE_POOL_METADATA);
        const [current, metadata] = await Promise.all([requestPromise(store.get(libraryId)), requestPromise(metadataStore.get(libraryId))]);
        if (!current)
            throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.NOT_FOUND, __rmT("2sQkRRTauyZA867LYZaQODrCUrX3HF1O29E"));
        if (enabled === true && !validExternalPoolMetadata(metadata, libraryId))
            throw metadataRebuildError(libraryId);
        const next = { ...current, enabled: enabled === true, updatedAt: Date.now() };
        store.put(next);
        if (validExternalPoolMetadata(metadata, libraryId))
            metadataStore.put({ ...metadata, enabled: next.enabled });
        await transactionPromise(transaction);
        const entries = validExternalPoolMetadata(metadata, libraryId) ? [
            ...(metadata?.themeIds || []).map(externalId => ({ externalId, classification: 'theme', enabled: true, userConfirmed: true })),
            ...(metadata?.formatIds || []).map(externalId => ({ externalId, classification: 'format', enabled: true, userConfirmed: true })),
            ...(metadata?.textIds || []).map(externalId => ({ externalId, classification: 'text', enabled: true, userConfirmed: true })),
        ] : [];
        upsertExternalPoolLibrary(next, entries);
        invalidateMetadataHydration();
        noteLibraryChanged(options);
        return next;
    }
    catch (error) {
        throw wrapStorageError(error, __rmT("msBWDqKXlEdWbqNCAZqWZPdhKcKJBxr9.0dspf"));
    }
    finally {
        try {
            db.close();
        }
        catch { }
    }
}
export async function deleteExternalLibrary(libraryId, options = {}) {
    const db = await openExternalLibraryDatabase(options);
    try {
        const transaction = db.transaction([STORE_LIBRARIES, STORE_ENTRIES, STORE_POOL_METADATA], 'readwrite');
        const libraries = transaction.objectStore(STORE_LIBRARIES);
        const entries = transaction.objectStore(STORE_ENTRIES);
        const keys = await entryKeysForLibrary(entries, libraryId, options);
        for (const key of keys)
            entries.delete(key);
        libraries.delete(libraryId);
        transaction.objectStore(STORE_POOL_METADATA).delete(libraryId);
        await transactionPromise(transaction);
        removeExternalPoolLibrary(libraryId);
        invalidateMetadataHydration();
        noteLibraryChanged(options, { deletedLibraryIds: [String(libraryId)] });
        return true;
    }
    catch (error) {
        throw wrapStorageError(error, __rmT("msBWDM.JF09WbqNCAZqWZPdhKrxZfBLUGhNspf"));
    }
    finally {
        try {
            db.close();
        }
        catch { }
    }
}
export async function getSelectedExternalEntries(ids = [], options = {}) {
    if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.ENTRY_STATE_CONFLICT, __rmT("Ym5LxGA4olKQPJYRCeimqjFdM9Cx.6mJ29E"), { reason: 'selected-ids-invalid' });
    }
    const selected = [...new Set(ids.filter(id => id.startsWith('ext:')))];
    if (!selected.length)
        return new Map();
    if (selected.some(id => id !== id.trim() || id.length > 2048)) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.ENTRY_STATE_CONFLICT, __rmT("ywrXTD7aHaftBSmGNghVJk10cg2rrk"), { reason: 'selected-id-invalid' });
    }
    const db = await openExternalLibraryDatabase(options);
    try {
        const transaction = db.transaction([STORE_ENTRIES, STORE_LIBRARIES], 'readonly');
        const done = transactionPromise(transaction);
        done.catch(() => { });
        const index = transaction.objectStore(STORE_ENTRIES).index(INDEX_ENTRIES_BY_EXTERNAL_ID);
        const libraries = transaction.objectStore(STORE_LIBRARIES);
        const libraryRequests = new Map();
        const reads = selected.map(id => new Promise((resolve, reject) => {
            const request = index.get(id);
            request.onerror = () => reject(request.error || new Error('Selected external entry read failed'));
            request.onsuccess = () => {
                const row = request.result;
                if (!row?.libraryId) {
                    resolve({ id, row, library: null });
                    return;
                }
                try {
                    if (!libraryRequests.has(row.libraryId))
                        libraryRequests.set(row.libraryId, requestPromise(libraries.get(row.libraryId)));
                    libraryRequests.get(row.libraryId).then(library => resolve({ id, row, library }), reject);
                }
                catch (error) {
                    reject(error);
                }
            };
        }));
        const [pairs] = await Promise.all([Promise.all(reads), done]);
        const materials = new Map();
        for (const { id, row, library } of pairs) {
            if (!row || row.externalId !== id || !library) {
                throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.NOT_FOUND, __rmT("K.4m_7TheuqrzPWNmPDK5x5200spX_b5PU_RSeW6o3SI5sW6J0kRGJHkWs4mCq8770WumA1q7tMqDSBl1hfFrh"), { reason: 'selected-entry-missing', externalId: id });
            }
            const kind = row.classification;
            if (row.enabled !== true || row.userConfirmed !== true || library.enabled !== true
                || !['theme', 'format', 'text'].includes(kind) || !id.startsWith(`ext:${row.libraryId}:${kind}:`)) {
                throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.ENTRY_STATE_CONFLICT, __rmT("XUnxLU_vplGPjLEzRw58RuiwFpXHacbbtThNKfTMlU2cfXMbdNOQVVg4.QFpXSnXHtgOzoga4XTobh"), { reason: 'selected-entry-ineligible', externalId: id });
            }
            if (typeof row.rawContent !== 'string' || !row.rawContent.trim()) {
                throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.ENTRY_CONTENT_INVALID, __rmT("o1Nd2f4cb_QuREc.mhuMyNgbm4TS.ngIYu2PXfWdGX959a4MpXaTUW5X"), { reason: 'selected-entry-raw-missing', externalId: id });
            }
            materials.set(id, { ...row, sourceWorldBookName: String(library.sourceWorldBookName || library.displayName || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200) });
        }
        return materials;
    }
    catch (error) {
        if (error instanceof ExternalWorldBookError)
            throw error;
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.READ_FAILED, __rmT("ggdpOjMVLZdF4aF0WDDT443R_.lQXWnTHS7Dj0UxqG_T1Umjw4sr7f"), { reason: 'selected-entry-read-failed', causeName: String(error?.name || 'Error') });
    }
    finally {
        try {
            db.close();
        }
        catch { }
    }
}
export function hydrateExternalPoolMetadata(options = {}) {
    const factory = options.indexedDBFactory || globalThis.indexedDB;
    if (hydrationFactory !== factory) {
        hydrationFactory = factory;
        hydrationPromise = null;
        invalidateMetadataHydration();
    }
    if (hydrationPromise)
        return hydrationPromise;
    if (options.force !== true && hydratedRevision === getExternalPoolRevision())
        return Promise.resolve(getExternalPoolSnapshot());
    const revision = getExternalPoolRevision();
    const pending = (async () => {
        const db = await openExternalLibraryDatabase(options);
        try {
            const transaction = db.transaction([STORE_LIBRARIES, STORE_POOL_METADATA], 'readonly');
            const done = transactionPromise(transaction);
            const [libraries, metadata] = await Promise.all([
                requestPromise(transaction.objectStore(STORE_LIBRARIES).getAll()),
                requestPromise(transaction.objectStore(STORE_POOL_METADATA).getAll()),
                done,
            ]);
            if (!Array.isArray(libraries) || !Array.isArray(metadata))
                throw new Error('Invalid external pool metadata');
            if (hydrationFactory !== factory || revision !== getExternalPoolRevision())
                return getExternalPoolSnapshot();
            const byLibrary = new Map(metadata.map(record => [record?.libraryId, record]));
            const missing = libraries.filter(library => !validExternalPoolMetadata(byLibrary.get(library?.libraryId), library?.libraryId)).map(library => String(library.libraryId));
            const result = setExternalPoolMetadataSnapshot(libraries, metadata);
            hydratedRevision = getExternalPoolRevision();
            const enabledMissing = libraries.filter(library => library.enabled === true && missing.includes(String(library.libraryId))).map(library => String(library.libraryId));
            hydrationStatus = Object.freeze({ hydrated: true, metadataRebuildRequired: Object.freeze(missing), enabledMetadataRebuildRequired: Object.freeze(enabledMissing) });
            return result;
        }
        finally {
            try {
                db.close();
            }
            catch { }
        }
    })().finally(() => { if (hydrationPromise === pending)
        hydrationPromise = null; });
    hydrationPromise = pending;
    return pending;
}
export async function rebuildExternalPoolMetadata(libraryId, options = {}) {
    const db = await openExternalLibraryDatabase(options);
    try {
        const transaction = db.transaction([STORE_LIBRARIES, STORE_ENTRIES, STORE_POOL_METADATA], 'readwrite');
        const done = transactionPromise(transaction);
        done.catch(() => { });
        const libraries = transaction.objectStore(STORE_LIBRARIES);
        const metadataStore = transaction.objectStore(STORE_POOL_METADATA);
        const libraryRead = requestPromise(libraries.get(libraryId));
        const rowsRead = requestPromise(transaction.objectStore(STORE_ENTRIES).index(INDEX_ENTRIES_BY_LIBRARY).getAll(libraryId));
        const [library, rows] = await Promise.all([libraryRead, rowsRead]);
        if (!library)
            throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.NOT_FOUND, __rmT("R_Zlg2.Jh0ETPcyUtnaQfE9xj1cAnAKDQkospf"));
        if (!Array.isArray(rows))
            throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.READ_FAILED, __rmT("msBWDqznetKYPBO.gml8Bn9hVu9BZDLUGhNspf"));
        const metadata = externalPoolMetadataForLibrary(library, rows);
        metadataStore.put(metadata);
        libraries.put({ ...library, poolMetadataVersion: EXTERNAL_POOL_METADATA_VERSION, updatedAt: Date.now() });
        await done;
        upsertExternalPoolLibrary(library, rows);
        invalidateMetadataHydration();
        return metadata;
    }
    catch (error) {
        throw wrapStorageError(error, __rmT("ggdpOYSb3ZZ4loOsEPFd5jv97wbARfFGcTVNxWuKRaqGQzteiEDr7f"));
    }
    finally {
        try {
            db.close();
        }
        catch { }
    }
}
