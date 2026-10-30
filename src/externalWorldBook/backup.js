import { rmT as __rmT } from "../textTable.js?rmv=2.1.1";
import { ExternalWorldBookError } from './errors.js?rmv=2.1.1';
import { externalEntryId, externalEntryStableIdentity, externalLibraryIdForBook, openExternalLibraryDatabase } from './store.js?rmv=2.1.1';
import { EXTERNAL_POOL_METADATA_VERSION, externalPoolMetadataForLibrary, upsertExternalPoolLibraries } from './externalPool.js?rmv=2.1.1';
export const EXTERNAL_BACKUP_FORMAT = 'RabbitMirror.ExternalLibraries';
export const EXTERNAL_BACKUP_VERSION = 1;
export const EXTERNAL_BACKUP_MAX_BYTES = 32 * 1024 * 1024;
export const EXTERNAL_BACKUP_MAX_LIBRARIES = 1000;
export const EXTERNAL_BACKUP_MAX_ENTRIES = 25000;
const KINDS = ['theme', 'format', 'text', 'auxiliary', 'ignore', 'pending', 'mixed'];
const LIBRARY_FIELDS = ['schemaVersion', 'libraryId', 'displayName', 'sourceType', 'sourceTransport', 'sourceWorldBookId', 'sourceWorldBookName', 'sourceHash', 'enabled', 'entryCount', 'themeCount', 'formatCount', 'textCount', 'auxiliaryCount', 'pendingCount', 'ignoredCount', 'createdAt', 'updatedAt', 'poolMetadataVersion'];
const ENTRY_FIELDS = ['storageKey', 'libraryId', 'externalId', 'sourceEntryIdentity', 'sourceEntryId', 'sourceEntryUid', 'sourceTitle', 'sourceKeywords', 'classification', 'suggestion', 'classificationConfidence', 'userConfirmed', 'localTitle', 'summary', 'rawContent', 'contentHash', 'enabled', 'aliases', 'linkedAuxiliaryIds', 'sourceDisabled', 'sourceConstant', 'sourceSelective', 'originalOrder', 'createdAt', 'updatedAt'];
function invalid(message = __rmT("IWaZOumS2VOQevTpR1YVtz9._87zY3y.QpYq3lIxhjtwyye7b9E3b3Ro.Hdp2vkC")) {
    return new ExternalWorldBookError('WORLD_BOOK_BACKUP_INVALID', message);
}
function tooLarge() { return new ExternalWorldBookError('WORLD_BOOK_FILE_TOO_LARGE', __rmT("iVfcTCV6LTSSskhmENGdsblB6NqDXUYujgagk12JbZsfMPQGyCTpXxzqyN_wpmjXOTtSCg5Dnr5RsU_6HOIthdNQRAXf6f7iZlIQH_A1SjLbSX_z")); }
function object(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function fields(value, names) {
    if (!object(value) || Object.keys(value).some(key => !names.includes(key)))
        throw invalid();
    return Object.fromEntries(names.filter(key => Object.hasOwn(value, key)).map(key => [key, Array.isArray(value[key]) ? [...value[key]] : value[key]]));
}
function str(value, max, nonempty = false) {
    if (typeof value !== 'string' || value.length > max || (nonempty && !value.trim()))
        throw invalid();
}
function strings(value, count, max) {
    if (!Array.isArray(value) || value.length > count)
        throw invalid();
    value.forEach(item => str(item, max));
}
function number(value) { if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER)
    throw invalid(); }
function flag(value) { if (typeof value !== 'boolean')
    throw invalid(); }
function byteLength(value) { return new TextEncoder().encode(value).byteLength; }
export function validateExternalLibraryBackup(raw) {
    fields(raw, ['format', 'version', 'exportedAt', 'libraries']);
    if (raw.format !== EXTERNAL_BACKUP_FORMAT || raw.version !== EXTERNAL_BACKUP_VERSION || !Array.isArray(raw.libraries))
        throw invalid();
    number(raw.exportedAt);
    if (raw.libraries.length > EXTERNAL_BACKUP_MAX_LIBRARIES)
        throw tooLarge();
    let total = 0, estimatedChars = 0;
    const libraryIds = new Set(), externalIds = new Set(), storageKeys = new Set();
    const snapshots = raw.libraries.map(snapshot => {
        fields(snapshot, ['library', 'entries']);
        const library = fields(snapshot.library, LIBRARY_FIELDS);
        if (library.schemaVersion !== 1 || !Array.isArray(snapshot.entries))
            throw invalid();
        for (const name of ['libraryId', 'displayName', 'sourceType', 'sourceTransport', 'sourceWorldBookId', 'sourceWorldBookName', 'sourceHash'])
            str(library[name], 1000, name === 'libraryId');
        flag(library.enabled);
        for (const name of ['entryCount', 'themeCount', 'formatCount', 'auxiliaryCount', 'pendingCount', 'ignoredCount', 'createdAt', 'updatedAt'])
            number(library[name]);
        if (library.textCount !== undefined)
            number(library.textCount);
        if (library.poolMetadataVersion !== undefined && library.poolMetadataVersion !== EXTERNAL_POOL_METADATA_VERSION)
            throw invalid();
        if (library.libraryId !== externalLibraryIdForBook({ sourceType: library.sourceType, sourceId: library.sourceWorldBookId }))
            throw invalid();
        if (libraryIds.has(library.libraryId))
            throw invalid(__rmT("lsnoWJMiSm5vB_OgPSxs3_3ohvbQfvTbugWQ67xf4ZzFNBJ8Rj7nEx1nTiChwss1K5qx8QGP"));
        libraryIds.add(library.libraryId);
        total += snapshot.entries.length;
        if (total > EXTERNAL_BACKUP_MAX_ENTRIES)
            throw tooLarge();
        const counts = { theme: 0, format: 0, text: 0, auxiliary: 0, ignore: 0, pending: 0 };
        const entries = snapshot.entries.map(value => {
            const row = fields(value, ENTRY_FIELDS);
            if (!KINDS.includes(row.classification))
                throw invalid();
            for (const name of ['storageKey', 'libraryId', 'externalId', 'sourceEntryIdentity', 'sourceEntryId', 'sourceTitle', 'localTitle', 'contentHash'])
                str(row[name], 2048);
            if (row.sourceEntryUid !== null)
                str(row.sourceEntryUid, 1000);
            str(row.rawContent, 1000000);
            str(row.summary, 1200);
            strings(row.sourceKeywords, 256, 512);
            strings(row.aliases, 128, 1000);
            strings(row.linkedAuxiliaryIds, 128, 2048);
            if (row.suggestion !== undefined && !KINDS.includes(row.suggestion))
                throw invalid();
            if (row.classificationConfidence !== undefined && !['high', 'medium', 'low'].includes(row.classificationConfidence))
                throw invalid();
            for (const name of ['userConfirmed', 'enabled', 'sourceDisabled', 'sourceConstant', 'sourceSelective'])
                flag(row[name]);
            number(row.createdAt);
            number(row.updatedAt);
            if (row.originalOrder !== null && !Number.isFinite(row.originalOrder))
                throw invalid();
            if ((row.enabled && (!row.userConfirmed || !['theme', 'format', 'text', 'auxiliary'].includes(row.classification)))
                || (row.classification === 'pending' && row.userConfirmed))
                throw invalid();
            const stable = externalEntryStableIdentity(row);
            if (row.libraryId !== library.libraryId || row.sourceEntryIdentity !== stable || row.storageKey !== `${library.libraryId}\u0000${stable}`
                || row.externalId !== externalEntryId(library.libraryId, row, row.classification))
                throw invalid();
            if (externalIds.has(row.externalId) || storageKeys.has(row.storageKey))
                throw invalid(__rmT("46kJRnthfRFXPMdpeGzb51WHpD3g0H.XjluEHhUUm5lOGQ2xXkB1bca.T8hAcSVmBxHiSI3OY3Y"));
            externalIds.add(row.externalId);
            storageKeys.add(row.storageKey);
            counts[Object.hasOwn(counts, row.classification) ? row.classification : 'pending']++;
            estimatedChars += JSON.stringify(row).length;
            if (estimatedChars > EXTERNAL_BACKUP_MAX_BYTES)
                throw tooLarge();
            return row;
        });
        if (library.entryCount !== entries.length || library.themeCount !== counts.theme || library.formatCount !== counts.format
            || (library.textCount || 0) !== counts.text || library.auxiliaryCount !== counts.auxiliary || library.ignoredCount !== counts.ignore || library.pendingCount !== counts.pending)
            throw invalid();
        return { library, entries };
    });
    const byId = new Map(snapshots.flatMap(snapshot => snapshot.entries.map(row => [row.externalId, row])));
    for (const snapshot of snapshots)
        for (const row of snapshot.entries) {
            if (row.linkedAuxiliaryIds.some(id => !byId.has(id) || byId.get(id).classification !== 'auxiliary'))
                throw invalid();
        }
    const result = { format: EXTERNAL_BACKUP_FORMAT, version: EXTERNAL_BACKUP_VERSION, exportedAt: raw.exportedAt, libraries: snapshots };
    if (byteLength(JSON.stringify(result)) > EXTERNAL_BACKUP_MAX_BYTES)
        throw tooLarge();
    return result;
}
export function parseExternalLibraryBackup(text) {
    if (typeof text !== 'string')
        throw invalid();
    if (text.length > EXTERNAL_BACKUP_MAX_BYTES || byteLength(text) > EXTERNAL_BACKUP_MAX_BYTES)
        throw tooLarge();
    let raw;
    try {
        raw = JSON.parse(text.replace(/^\uFEFF/, ''));
    }
    catch {
        throw invalid(__rmT("d87ZDVO6M2_p5dha7m2bvbJeThml_xp_QOIFDhmrzwvWJ7y1loO1OLNpm6zQ5fnFwxp_tzvf7I9kbPqsyBF3wF9UWAT"));
    }
    return validateExternalLibraryBackup(raw);
}
export async function readExternalLibraryBackupFile(file) {
    if (!file || !/\.json$/i.test(String(file.name || '')))
        throw invalid(__rmT("yc3BoLxEavwVlcxFq2wWp53RHfYNp5LjkUDkGeGLmh0Sf8nSJIGr7f"));
    if (Number(file.size) > EXTERNAL_BACKUP_MAX_BYTES)
        throw tooLarge();
    if (typeof file.text !== 'function')
        throw invalid(__rmT("7whgkQDnxVVMhFgaTofpvCrvwZbyXhADkEv5ABM7gG8"));
    return parseExternalLibraryBackup(await file.text());
}
function transactionDone(transaction) {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onabort = transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed'));
    });
}
function storageError(error) {
    if (error instanceof ExternalWorldBookError)
        return error;
    return new ExternalWorldBookError(error?.name === 'QuotaExceededError' ? 'WORLD_BOOK_STORAGE_QUOTA' : 'WORLD_BOOK_STORAGE_WRITE_FAILED', __rmT("d87ZDVD_gXx1PzwQQu1oGGiO_0g3Hcs.F8VwC8PNSbWip67kQEIR8h5Lvz2fPsxTZL3RYs.FK5t4d5qkCFEdhfdMWAT"));
}
export async function exportExternalLibraryBackup(options = {}) {
    const db = await openExternalLibraryDatabase(options);
    try {
        const tx = db.transaction(['libraries', 'entries'], 'readonly');
        const done = transactionDone(tx);
        done.catch(() => { });
        const read = request => new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
        const [libraries, entries] = await Promise.all([read(tx.objectStore('libraries').getAll()), read(tx.objectStore('entries').getAll()), done]);
        const grouped = new Map(libraries.map(library => [library.libraryId, { library, entries: [] }]));
        for (const row of entries) {
            if (!grouped.has(row.libraryId))
                throw invalid(__rmT("tIk0zdaDvyqjNT3C2QFKjDrsvSdycRATq0l_ATDsBwHDHgkmWaDcbtSRYdvbBuHeWLIJ2yPUmGRtHyhxS5X1BdGu"));
            grouped.get(row.libraryId).entries.push(row);
        }
        const backup = validateExternalLibraryBackup({ format: EXTERNAL_BACKUP_FORMAT, version: EXTERNAL_BACKUP_VERSION, exportedAt: Date.now(), libraries: [...grouped.values()] });
        return { text: JSON.stringify(backup), libraryCount: libraries.length, entryCount: entries.length };
    }
    finally {
        try {
            db.close();
        }
        catch { }
    }
}
export async function importExternalLibraryBackup(raw, options = {}) {
    const backup = validateExternalLibraryBackup(raw);
    const db = await openExternalLibraryDatabase(options);
    let tx, failure;
    try {
        tx = db.transaction(['libraries', 'entries', 'poolMetadata'], 'readwrite');
        const done = transactionDone(tx);
        done.catch(() => { });
        const libraries = tx.objectStore('libraries'), entries = tx.objectStore('entries'), metadata = tx.objectStore('poolMetadata');
        let imported = [], skipped = [];
        const abort = error => { failure = error; try {
            tx.abort();
        }
        catch { } };
        const list = libraries.getAll();
        list.onsuccess = () => {
            try {
                const existing = new Set(list.result.map(item => item.libraryId));
                imported = backup.libraries.filter(item => !existing.has(item.library.libraryId));
                skipped = backup.libraries.filter(item => existing.has(item.library.libraryId));
                const rows = imported.flatMap(item => item.entries);
                const write = () => {
                    if (failure)
                        return;
                    for (const item of imported) {
                        libraries.put({ ...item.library, poolMetadataVersion: EXTERNAL_POOL_METADATA_VERSION });
                        metadata.put(externalPoolMetadataForLibrary(item.library, item.entries));
                        for (const row of item.entries)
                            entries.put(row);
                    }
                };
                let remaining = rows.length;
                if (!remaining)
                    write();
                for (const row of rows) {
                    const request = entries.get(row.storageKey);
                    request.onsuccess = () => {
                        if (request.result !== undefined) {
                            abort(invalid(__rmT("RlrLUOmQb89TDN2CrWuJcTjX1fjWT3WWVe68kz44rOU5qrp97Jn5k.RPmyc_Hj8utJp36.p_okW8VL6lr0AFrh")));
                            return;
                        }
                        if (--remaining === 0) {
                            try {
                                write();
                            }
                            catch (error) {
                                abort(error);
                            }
                        }
                    };
                }
            }
            catch (error) {
                abort(error);
            }
        };
        await done;
        if (failure)
            throw failure;
        upsertExternalPoolLibraries(imported);
        if (imported.length && !options.indexedDBFactory && options.skipServerBackup !== true) {
            void import('./serverBackup.js?rmv=2.1.1').then(module => module.scheduleMotherLibraryServerBackup()).catch(() => { });
        }
        return { importedLibraries: imported.length, importedEntries: imported.reduce((sum, item) => sum + item.entries.length, 0), skippedLibraries: skipped.length };
    }
    catch (error) {
        try {
            tx?.abort();
        }
        catch { }
        throw storageError(failure || error);
    }
    finally {
        try {
            db.close();
        }
        catch { }
    }
}
