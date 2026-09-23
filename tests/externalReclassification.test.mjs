import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
async function modules() {
    const context = vm.createContext({ console, Date, Map, Set });
    const cache = new Map();
    function get(file) {
        if (!cache.has(file)) cache.set(file, new vm.SourceTextModule(readFileSync(file, 'utf8'), { context, identifier: file }));
        return cache.get(file);
    }
    const store = get(path.join(root, 'src/externalWorldBook/store.js'));
    await store.link((specifier, parent) => get(path.resolve(path.dirname(parent.identifier), specifier.split('?')[0])));
    await store.evaluate();
    return { store: store.namespace, pool: get(path.join(root, 'src/externalWorldBook/externalPool.js')).namespace };
}

// Durable transaction double: writes live in a private snapshot until complete;
// commit failure/abort leaves every store untouched. Browser IDB is checked by
// the integration workflow separately; production store/pool modules run here.
function database(initial, { failStore = '', failCommit = false, beforeCommit } = {}) {
    const durable = Object.fromEntries(Object.entries(initial).map(([name, rows]) => [name,
        new Map(rows.map(row => [row.storageKey || row.libraryId, structuredClone(row)]))]));
    let opened = 0;
    const transactions = [];
    const db = { close() {}, transaction(names, mode) {
        transactions.push({ names, mode });
        const working = Object.fromEntries(names.map(name => [name, new Map([...durable[name]].map(([key, row]) => [key, structuredClone(row)]))]));
        let pending = 0, finished = false, commitQueued = false;
        const tx = { error: null, abort() { if (finished) return; finished = true; queueMicrotask(() => tx.onabort?.()); }, objectStore(name) {
            const rows = working[name];
            const request = operation => {
                const req = {}; pending++;
                queueMicrotask(() => {
                    if (finished) return;
                    try { req.result = structuredClone(operation()); req.onsuccess?.(); }
                    catch (error) { req.error = error; tx.error = error; req.onerror?.(); tx.abort(); }
                    pending--; schedule();
                }); return req;
            };
            return { get: key => request(() => rows.get(key)), getAll: () => request(() => [...rows.values()]),
                put: row => request(() => { if (name === failStore) throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' }); rows.set(row.storageKey || row.libraryId, structuredClone(row)); }),
                index: field => ({ getAll: libraryId => request(() => [...rows.values()].filter(row => row.libraryId === libraryId)),
                    get: externalId => request(() => [...rows.values()].find(row => row.externalId === externalId)),
                    openCursor: libraryId => {
                        const req = {}, values = [...rows.values()].filter(row => row.libraryId === libraryId); let index = 0; pending++;
                        const deliver = () => queueMicrotask(() => {
                            req.result = index < values.length ? { value: structuredClone(values[index++]), continue: deliver } : null;
                            req.onsuccess?.(); if (!req.result) { pending--; schedule(); }
                        }); deliver(); return req;
                    },
                }),
            };
        } };
        function schedule() {
            if (commitQueued || finished) return;
            commitQueued = true;
            setImmediate(() => {
                commitQueued = false; if (finished || pending) return;
                beforeCommit?.();
                if (failCommit) { tx.error = new Error('commit failed'); tx.abort(); return; }
                finished = true;
                if (mode === 'readwrite') for (const name of names) durable[name] = working[name];
                tx.oncomplete?.();
            });
        }
        schedule(); return tx;
    } };
    return { durable, transactions, get opened() { return opened; }, indexedDBFactory: { open() {
        opened++; const request = {}; queueMicrotask(() => { request.result = db; request.onsuccess?.(); }); return request;
    } } };
}

async function fixture(options = {}) {
    const { store, pool } = await modules();
    const book = { sourceType: 'file', sourceId: 'mother.json', sourceName: '母本', entries: [] };
    const libraryId = store.externalLibraryIdForBook(book);
    const kinds = ['theme', 'format', 'text', 'auxiliary', 'pending', 'ignore', 'mixed'];
    const entries = kinds.map((classification, index) => {
        const row = { libraryId, storageKey: `${libraryId}\0id:${index}`, sourceEntryId: String(index), sourceEntryUid: index,
            sourceEntryIdentity: `uid:${index}:id:${index}`, classification, enabled: index !== 1, userConfirmed: index !== 4,
            rawContent: `原文\n  HTML <b>${index}</b>`, localTitle: `本地${index}`, sourceTitle: `来源${index}`, summary: `摘要${index}`,
            linkedAuxiliaryIds: ['preserve-link'], sourceKeywords: ['关键词'], createdAt: 10, updatedAt: 20, customField: 'preserve' };
        row.externalId = store.externalEntryId(libraryId, row, classification); return row;
    });
    const library = { libraryId, enabled: options.enabled !== false, entryCount: 7, themeCount: 1, formatCount: 1, textCount: 1,
        auxiliaryCount: 1, pendingCount: 2, ignoredCount: 1, updatedAt: 20, sourceHash: 'hash', displayName: '母本' };
    const other = { ...entries[0], libraryId: 'other', storageKey: 'other\0id:0', externalId: 'ext:other:theme:0' };
    const otherLibrary = { libraryId: 'other', enabled: true };
    const metadata = pool.externalPoolMetadataForLibrary(library, entries);
    pool.setExternalPoolSnapshot([library, otherLibrary], new Map([[libraryId, entries], ['other', [other]]]));
    const db = database({ libraries: [library, otherLibrary], entries: [...entries, other], poolMetadata: [metadata, pool.externalPoolMetadataForLibrary(otherLibrary, [other])] }, options);
    return { store, pool, db, libraryId, entries, library, other, options: { indexedDBFactory: db.indexedDBFactory, now: 100 } };
}
const plain = value => JSON.parse(JSON.stringify(value));
const dump = db => JSON.stringify(Object.fromEntries(Object.entries(db.durable).map(([name, rows]) => [name, [...rows]])));

test('all reclassifies only primary kinds, preserves content/toggles/links and atomically replaces counts and IDs', async () => {
    const f = await fixture(); const oldPool = f.pool.getExternalPoolSnapshot();
    const result = await f.store.reclassifyExternalLibraryEntries(f.libraryId, { all: true }, 'text', f.options);
    assert.deepEqual(plain(result), { selectedCount: 3, changedCount: 2 });
    for (const [index, old] of f.entries.entries()) {
        const row = f.db.durable.entries.get(old.storageKey);
        const expected = index < 2 ? { ...old, classification: 'text', externalId: f.store.externalEntryId(f.libraryId, old, 'text'), userConfirmed: true, updatedAt: 100 } : old;
        assert.deepEqual(plain(row), plain(expected));
    }
    assert.equal(f.db.durable.libraries.get(f.libraryId).themeCount, 0);
    assert.equal(f.db.durable.libraries.get(f.libraryId).formatCount, 0);
    assert.equal(f.db.durable.libraries.get(f.libraryId).textCount, 3);
    assert.equal(f.db.durable.libraries.get(f.libraryId).enabled, true);
    const metadata = f.db.durable.poolMetadata.get(f.libraryId);
    assert.equal(metadata.textIds.length, 2, 'disabled format stays disabled after conversion');
    assert.equal(metadata.themeIds.length, 0); assert.equal(metadata.formatIds.length, 0);
    assert.notEqual(f.pool.getExternalPoolSnapshot(), oldPool);
    assert.equal(f.pool.getExternalPoolSnapshot().textCount, 2);
    assert.equal(f.pool.getExternalPoolSnapshot().themeCount, 1, 'other library is preserved');
    assert.equal(JSON.stringify(f.pool.getExternalPoolSnapshot()).includes('原文'), false);
    assert.deepEqual(plain(f.db.transactions[0]), { names: ['libraries', 'entries', 'poolMetadata'], mode: 'readwrite' });
    assert.equal([...f.db.durable.entries.values()].some(row => row.externalId === f.entries[0].externalId), false, 'old recipe ID is not retained as alias');
});

test('all supports exclusions; explicit IDs deduplicate and disabled libraries remain disabled', async () => {
    const f = await fixture({ enabled: false });
    const result = await f.store.reclassifyExternalLibraryEntries(f.libraryId, { all: true, excludedIds: [f.entries[0].externalId] }, 'theme', f.options);
    assert.deepEqual(plain(result), { selectedCount: 2, changedCount: 2 });
    assert.deepEqual(f.db.durable.entries.get(f.entries[0].storageKey), f.entries[0]);
    assert.equal(f.db.durable.libraries.get(f.libraryId).enabled, false);
    assert.equal(f.pool.getExternalPoolSnapshot().textCount, 0);
    assert.equal(f.pool.getExternalPoolSnapshot().themeCount, 1, 'only the other enabled library participates');
    const id = f.db.durable.entries.get(f.entries[1].storageKey).externalId;
    assert.deepEqual(plain(await f.store.reclassifyExternalLibraryEntries(f.libraryId, { ids: [id, id] }, 'text', f.options)), { selectedCount: 1, changedCount: 1 });
    assert.equal(f.db.durable.entries.get(f.entries[1].storageKey).enabled, false);
});

test('unsupported, missing, stale or cross-library explicit/excluded IDs abort without mutation', async () => {
    for (const mode of ['ids', 'excludedIds']) for (const kind of ['auxiliary', 'pending', 'ignore', 'mixed', 'missing', 'other']) {
        const f = await fixture(); const before = dump(f.db), beforePool = f.pool.getExternalPoolSnapshot();
        const id = kind === 'other' ? f.other.externalId : kind === 'missing' ? 'ext:missing:text:0' : f.entries.find(row => row.classification === kind).externalId;
        const selection = mode === 'ids' ? { ids: [f.entries[0].externalId, id] } : { all: true, excludedIds: [id] };
        await assert.rejects(f.store.reclassifyExternalLibraryEntries(f.libraryId, selection, 'text', f.options));
        assert.equal(dump(f.db), before); assert.equal(f.pool.getExternalPoolSnapshot(), beforePool);
    }
});

test('write and final commit failure roll back every store and never publish the pool', async () => {
    for (const options of [{ failStore: 'entries' }, { failStore: 'libraries' }, { failStore: 'poolMetadata' }, { failCommit: true }]) {
        const f = await fixture(options); const before = dump(f.db), beforePool = f.pool.getExternalPoolSnapshot();
        await assert.rejects(f.store.reclassifyExternalLibraryEntries(f.libraryId, { all: true }, 'text', f.options));
        assert.equal(dump(f.db), before); assert.equal(f.pool.getExternalPoolSnapshot(), beforePool);
    }
});

test('choices expose reclassifiable separately from selectable without raw data', async () => {
    const f = await fixture();
    const choices = await f.store.listExternalLibraryEntryChoices(f.libraryId, f.options);
    assert.deepEqual(Array.from(choices.choices, row => row.reclassifiable), [true, true, true, false, false, false, false]);
    assert.equal(JSON.stringify(choices).includes('原文'), false);
});

test('live pool stays unchanged until durable commit, while same-category selection is a no-op', async () => {
    let f, beforePool, commits = 0;
    f = await fixture({ beforeCommit() { commits++; assert.equal(f.pool.getExternalPoolSnapshot(), beforePool); } });
    beforePool = f.pool.getExternalPoolSnapshot();
    await f.store.reclassifyExternalLibraryEntries(f.libraryId, { ids: [f.entries[0].externalId] }, 'format', f.options);
    assert.equal(commits, 1);
    const row = f.db.durable.entries.get(f.entries[0].storageKey);
    beforePool = f.pool.getExternalPoolSnapshot();
    const before = dump(f.db);
    assert.deepEqual(plain(await f.store.reclassifyExternalLibraryEntries(f.libraryId, { ids: [row.externalId] }, 'format', f.options)), { changedCount: 0, selectedCount: 1 });
    assert.equal(dump(f.db), before); assert.equal(f.pool.getExternalPoolSnapshot(), beforePool);
    await assert.rejects(f.store.reclassifyExternalLibraryEntries(f.libraryId, { ids: [f.entries[0].externalId] }, 'text', f.options), /已变化/);
    assert.equal(dump(f.db), before);
});

test('explicit confirmation enables selection eligibility without changing an entry toggle', async () => {
    const f = await fixture();
    const row = f.db.durable.entries.get(f.entries[0].storageKey);
    row.userConfirmed = false;
    const choices = await f.store.listExternalLibraryEntryChoices(f.libraryId, f.options);
    assert.equal(choices.choices[0].selectable, false);
    assert.equal(choices.choices[0].reclassifiable, true);
    const result = await f.store.reclassifyExternalLibraryEntries(f.libraryId, { ids: [row.externalId] }, 'theme', f.options);
    assert.deepEqual(plain(result), { changedCount: 1, selectedCount: 1 });
    assert.equal(f.db.durable.entries.get(row.storageKey).userConfirmed, true);
    assert.equal(f.db.durable.entries.get(row.storageKey).enabled, true);
});

test('invalid selection or target is rejected before opening storage, and empty selections are harmless', async () => {
    const f = await fixture();
    for (const [selection, kind] of [[{ all: true }, 'auxiliary'], [{ all: true, ids: [] }, 'text'], [{ ids: [' '] }, 'text'], [{ ids: [], excludedIds: [] }, 'text'], [null, 'text']]) {
        await assert.rejects(f.store.reclassifyExternalLibraryEntries(f.libraryId, selection, kind, f.options));
    }
    assert.equal(f.db.opened, 0);
    const before = dump(f.db), beforePool = f.pool.getExternalPoolSnapshot();
    assert.deepEqual(plain(await f.store.reclassifyExternalLibraryEntries(f.libraryId, { ids: [] }, 'text', f.options)), { selectedCount: 0, changedCount: 0 });
    assert.equal(dump(f.db), before); assert.equal(f.pool.getExternalPoolSnapshot(), beforePool);
});
