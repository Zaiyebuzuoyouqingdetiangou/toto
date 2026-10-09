export const FACE_SWIPE_MAX = 5;
export const FACE_SWIPE_FULL_MESSAGE = '已满五版，请先删一版再重说';
const STORE_KEY = 'rabbit_mirror_face_swipes_v1';
const STORE_SCHEMA = 1;
const STACK_LIMIT = 80;
const ENTRY_MAX_CHARS = 400 * 1024;

function hashText(text = '') {
    let h = 2166136261;
    for (const ch of String(text)) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
}

// Versions belong to the chat message swipe, not a source-hash snapshot.
// Resay remounts often change the fingerprint; hashed slots used to orphan
// the stack and re-seed the new HTML as 1/1.
export function faceSwipeStorageSlot(slot = '') {
    const text = String(slot || '');
    const match = text.match(/:(\d+):(\d+):([0-9a-f]{8,64})$/i);
    return match ? text.slice(0, -(match[3].length + 1)) : text;
}

export function faceSwipeKey(slot, faceIndex = 0) {
    const index = Number.isInteger(faceIndex) && faceIndex >= 0 ? faceIndex : 0;
    return `${faceSwipeStorageSlot(slot)}\u0000${index}`;
}

export function emptySwipeState() {
    return { versions: [], currentIndex: 0, touched: 0 };
}

export function normalizeSwipeEntry(value) {
    const html = String(value?.html || '').trim();
    if (!html || html.length > ENTRY_MAX_CHARS) return null;
    const initialHtml = String(value?.initialHtml || html).trim() || html;
    if (initialHtml.length > ENTRY_MAX_CHARS) return null;
    return {
        id: String(value?.id || hashText(html)),
        html,
        initialHtml,
        ts: Number(value?.ts || Date.now()) || Date.now(),
    };
}

export function normalizeSwipeState(value) {
    const versions = (Array.isArray(value?.versions) ? value.versions : [])
        .map(normalizeSwipeEntry)
        .filter(Boolean)
        .slice(0, FACE_SWIPE_MAX);
    if (!versions.length) return emptySwipeState();
    const currentIndex = Math.max(0, Math.min(versions.length - 1, Number(value?.currentIndex) || 0));
    return {
        versions,
        currentIndex,
        touched: Number(value?.touched || versions[currentIndex]?.ts || Date.now()) || Date.now(),
    };
}

export function currentSwipeEntry(state) {
    const normalized = normalizeSwipeState(state);
    return normalized.versions[normalized.currentIndex] || null;
}

export function canAppendSwipe(state) {
    return normalizeSwipeState(state).versions.length < FACE_SWIPE_MAX;
}

export function swipeFullMessage() {
    return FACE_SWIPE_FULL_MESSAGE;
}

// Title ‹ › at the ends mean 重说, not a dead control. Overlay prev remounts
// the last success; next at the last slot (or 1/1) pays for a new version.
export function fallbackFaceSwipeView() {
    return {
        count: 1,
        currentIndex: 0,
        overlay: false,
        label: '1/1',
        canPrev: false,
        canNext: false,
        canDelete: false,
        canResay: true,
        full: false,
    };
}

export function multifaceFacePagerView(faceCount, currentIndex, overlay = false) {
    const count = Math.max(1, Number(faceCount) || 1);
    const index = Math.max(0, Math.min(count - 1, Number(currentIndex) || 0));
    return {
        count,
        currentIndex: index,
        overlay: overlay === true,
        label: `${index + 1}/${count}`,
        canPrev: overlay === true || index > 0,
        canNext: index < count - 1,
        canDelete: false,
        canResay: true,
        full: false,
    };
}

export function faceSwipeBarIntent(view, action) {
    if (!view || !action) return { type: 'noop' };
    if (action === 'delete') return view.canDelete ? { type: 'delete' } : { type: 'noop' };
    if (action === 'prev') {
        if (view.overlay) return { type: 'select', index: view.currentIndex };
        if (view.currentIndex > 0) return { type: 'select', index: view.currentIndex - 1 };
        return view.canResay ? { type: 'resay' } : { type: 'noop' };
    }
    if (action === 'next') {
        if (view.canNext) return { type: 'select', index: view.currentIndex + 1 };
        return view.canResay ? { type: 'resay' } : { type: 'noop' };
    }
    return { type: 'noop' };
}

export function seedSwipeState(state, entry) {
    const normalized = normalizeSwipeState(state);
    if (normalized.versions.length) return { ok: true, seeded: false, state: normalized };
    const next = appendSuccessfulSwipe(normalized, entry);
    return next.ok ? { ok: true, seeded: true, state: next.state } : next;
}

export function appendSuccessfulSwipe(state, entry) {
    const normalized = normalizeSwipeState(state);
    const item = normalizeSwipeEntry(entry);
    if (!item) return { ok: false, reason: 'invalid' };
    if (normalized.versions.length >= FACE_SWIPE_MAX) {
        return { ok: false, reason: 'full', state: normalized, message: FACE_SWIPE_FULL_MESSAGE };
    }
    const versions = [...normalized.versions, item];
    return {
        ok: true,
        state: {
            versions,
            currentIndex: versions.length - 1,
            touched: Date.now(),
        },
    };
}

export function selectSwipeIndex(state, index) {
    const normalized = normalizeSwipeState(state);
    if (!normalized.versions.length) return { ok: false, reason: 'empty', state: normalized };
    const nextIndex = Math.max(0, Math.min(normalized.versions.length - 1, Number(index)));
    if (!Number.isInteger(nextIndex)) return { ok: false, reason: 'invalid', state: normalized };
    return {
        ok: true,
        state: { ...normalized, currentIndex: nextIndex, touched: Date.now() },
    };
}

export function deleteCurrentSwipe(state) {
    const normalized = normalizeSwipeState(state);
    if (normalized.versions.length <= 1) {
        return { ok: false, reason: 'last', state: normalized };
    }
    const removed = normalized.currentIndex;
    const versions = normalized.versions.filter((_, index) => index !== removed);
    const currentIndex = removed === 0 ? 0 : removed - 1;
    return {
        ok: true,
        state: {
            versions,
            currentIndex: Math.max(0, Math.min(versions.length - 1, currentIndex)),
            touched: Date.now(),
        },
    };
}

export function updateCurrentSwipeHtml(state, html) {
    const normalized = normalizeSwipeState(state);
    const current = normalized.versions[normalized.currentIndex];
    const nextHtml = String(html || '').trim();
    if (!current || !nextHtml || nextHtml.length > ENTRY_MAX_CHARS) {
        return { ok: false, reason: 'invalid', state: normalized };
    }
    const versions = normalized.versions.map((entry, index) => (
        index === normalized.currentIndex
            ? { ...entry, html: nextHtml, id: hashText(nextHtml), ts: Date.now() }
            : entry
    ));
    return { ok: true, state: { ...normalized, versions, touched: Date.now() } };
}

export function restoreCurrentSwipeInitial(state) {
    const normalized = normalizeSwipeState(state);
    const current = normalized.versions[normalized.currentIndex];
    if (!current?.initialHtml) return { ok: false, reason: 'empty', state: normalized };
    return updateCurrentSwipeHtml(normalized, current.initialHtml);
}

function emptyStore() {
    return { schema: STORE_SCHEMA, faces: {} };
}

let memoryStore = null;
const durableStacks = new Map();

function cloneStore(store) {
    return { schema: STORE_SCHEMA, faces: { ...(store?.faces || {}) } };
}

function readStore() {
    if (memoryStore) return cloneStore(memoryStore);
    try {
        const raw = JSON.parse(globalThis.localStorage?.getItem(STORE_KEY) || 'null');
        if (raw && typeof raw === 'object' && raw.faces && typeof raw.faces === 'object') {
            memoryStore = { schema: STORE_SCHEMA, faces: { ...raw.faces } };
            return cloneStore(memoryStore);
        }
    } catch {}
    memoryStore = emptyStore();
    return cloneStore(memoryStore);
}

export function resetFaceSwipeStoreForTests() {
    memoryStore = null;
    durableStacks.clear();
}

// Do not store identical birth/current HTML twice. Old rows remain readable.
export function compactSwipeState(value) {
    const state = normalizeSwipeState(value);
    return { ...state, versions: state.versions.map(entry => ({ ...entry,
        initialHtml: entry.initialHtml === entry.html ? '' : entry.initialHtml })) };
}

function stackSignature(value) { return JSON.stringify(compactSwipeState(value)); }
function backedUp(key, value) { return durableStacks.get(key) === stackSignature(value); }

function compactStore(store) {
    const next = emptyStore();
    const stacks = Object.entries(store.faces || {})
        .map(([key, value]) => [key, normalizeSwipeState(value)])
        .filter(([, state]) => state.versions.length)
        .sort((a, b) => Number(b[1].touched || 0) - Number(a[1].touched || 0));
    for (const [index, [key, state]] of stacks.entries()) {
        if (index < STACK_LIMIT || !backedUp(key, state)) next.faces[key] = compactSwipeState(state);
    }
    return next;
}

function writeLocalSnapshot(store) {
    try {
        const serialized = JSON.stringify(store);
        globalThis.localStorage?.setItem(STORE_KEY, serialized);
        return globalThis.localStorage?.getItem(STORE_KEY) === serialized;
    } catch { return false; }
}

function writeStore(store) {
    const compacted = compactStore(store);
    memoryStore = cloneStore(store);
    if (writeLocalSnapshot(compacted)) return true;
    // Only a transaction-confirmed archive permits cache eviction. A failed
    // local write must never silently remove the sole surviving paid versions.
    for (const key of Object.keys(compacted.faces).reverse()) {
        if (!backedUp(key, compacted.faces[key])) continue;
        delete compacted.faces[key];
        if (writeLocalSnapshot(compacted)) return true;
    }
    return false;
}

export function compactFaceSwipeStoreForQuota(limits = [40, 20, 10, 5, 1]) {
    const store = readStore();
    const stacks = Object.entries(store.faces || {})
        .map(([key, value]) => [key, normalizeSwipeState(value)])
        .filter(([, state]) => state.versions.length)
        .sort((a, b) => Number(b[1].touched || 0) - Number(a[1].touched || 0));
    for (const limit of (Array.isArray(limits) && limits.length ? limits : [40, 20, 10, 5, 1])) {
        if (stacks.length <= limit && limit !== 1) continue;
        const next = emptyStore();
        for (const [index, [key, state]] of stacks.entries()) {
            if (index < limit || !backedUp(key, state)) next.faces[key] = compactSwipeState(state);
        }
        if (writeLocalSnapshot(next)) return true;
    }
    return false;
}

function matchingSwipeKeys(store, slot, faceIndex = 0) {
    const suffix = `\u0000${Number.isInteger(faceIndex) && faceIndex >= 0 ? faceIndex : 0}`;
    const base = faceSwipeStorageSlot(slot);
    const preferred = `${base}${suffix}`;
    const keys = [];
    if (store.faces?.[preferred]) keys.push(preferred);
    for (const key of Object.keys(store.faces || {})) {
        if (key === preferred || !key.endsWith(suffix)) continue;
        const slotPart = key.slice(0, -suffix.length);
        const hash = slotPart.startsWith(`${base}:`) ? slotPart.slice(base.length + 1) : '';
        if (slotPart === base || /^[0-9a-f]{8,64}$/i.test(hash)) keys.push(key);
    }
    return keys;
}

export function readFaceSwipe(slot, faceIndex = 0) {
    const store = readStore();
    let best = emptySwipeState();
    for (const key of matchingSwipeKeys(store, slot, faceIndex)) {
        const state = normalizeSwipeState(store.faces[key]);
        if (
            state.versions.length && (!best.versions.length || Number(state.touched || 0) > Number(best.touched || 0)
            || (state.touched === best.touched && state.versions.length > best.versions.length))
        ) {
            best = state;
        }
    }
    return best;
}

export function writeFaceSwipe(slot, faceIndex, state) {
    const storageKey = faceSwipeKey(slot, faceIndex);
    const normalized = normalizeSwipeState(state);
    const store = readStore();
    for (const key of matchingSwipeKeys(store, slot, faceIndex)) {
        if (key !== storageKey) delete store.faces[key];
    }
    if (!normalized.versions.length) delete store.faces[storageKey];
    else store.faces[storageKey] = normalized;
    writeStore(store);
    return normalized;
}

export function mutateFaceSwipe(slot, faceIndex, mutator) {
    const current = readFaceSwipe(slot, faceIndex);
    const result = mutator(current);
    if (!result?.ok || !result.state) return result || { ok: false, reason: 'invalid', state: current };
    if (result.seeded === false) return { ...result, state: current, persisted: faceSwipeSnapshotStored(slot, { [faceIndex]: current }) };
    const state = writeFaceSwipe(slot, faceIndex, { ...result.state, touched: Math.max(Date.now(), current.touched + 1) });
    return { ...result, state, persisted: faceSwipeSnapshotStored(slot, { [faceIndex]: state }) };
}

export function snapshotFaceSwipes(slot) {
    const states = {};
    for (let index = 0; index < 5; index++) {
        const state = readFaceSwipe(slot, index);
        if (state.versions.length) states[index] = compactSwipeState(state);
    }
    return states;
}

export function faceSwipeSnapshotStored(slot, states = snapshotFaceSwipes(slot)) {
    try {
        const raw = JSON.parse(globalThis.localStorage?.getItem(STORE_KEY) || 'null');
        return Object.entries(states).every(([index, state]) =>
            stackSignature(raw?.faces?.[faceSwipeKey(slot, Number(index))]) === stackSignature(state));
    } catch { return false; }
}

export function restoreFaceSwipeSnapshot(slot, states) {
    for (let index = 0; index < 5; index++) {
        const incoming = normalizeSwipeState(states?.[index]);
        const current = readFaceSwipe(slot, index);
        if (incoming.versions.length && (!current.versions.length || incoming.touched > current.touched)) {
            writeFaceSwipe(slot, index, incoming);
        }
    }
}

// A per-message IndexedDB record keeps the current result and all face versions
// in one committed transaction. Read only the requested owner, never all chats.
const ARCHIVE_DB = 'rabbit_mirror_resay_history_v1';
const archiveLoads = new Map();
const archiveWrites = new Map();
const archiveSaved = new Map();

function archiveTransaction(mode, work, { readStatus = false, timeoutMs = 2500 } = {}) {
    if (!globalThis.indexedDB) return Promise.resolve(readStatus ? { ok: true, value: null } : null);
    return new Promise(resolve => {
        let db, tx, finished = false, value = null;
        const finish = (result, ok = false) => {
            if (finished) return; finished = true;
            clearTimeout(timer);
            try { db?.close(); } catch {}
            resolve(readStatus ? { ok, value: result } : result);
        };
        const timer = setTimeout(() => { try { tx?.abort(); } catch {} finish(null); }, timeoutMs);
        try {
            const request = globalThis.indexedDB.open(ARCHIVE_DB, 1);
            request.onupgradeneeded = () => {
                if (!request.result.objectStoreNames.contains('owners')) request.result.createObjectStore('owners', { keyPath: 'slot' });
            };
            request.onerror = request.onblocked = () => finish(null);
            request.onsuccess = () => {
                db = request.result;
                if (finished) { db.close(); return; }
                db.onversionchange = () => db.close();
                try {
                    tx = db.transaction('owners', mode);
                    tx.oncomplete = () => finish(value, true);
                    tx.onerror = tx.onabort = () => finish(null);
                    work(tx.objectStore('owners'), result => { value = result; });
                } catch { finish(null); }
            };
        } catch { finish(null); }
    });
}

export function faceSwipeArchiveLoaded(slot) {
    const state = faceSwipeArchiveReadState(slot);
    return state === 'ready' || state === 'error';
}

export function faceSwipeArchiveReadState(slot) {
    if (!globalThis.indexedDB) return 'ready';
    return archiveLoads.get(faceSwipeStorageSlot(slot))?.state || 'idle';
}

export function loadFaceSwipeArchive(slot, { retry = false } = {}) {
    const base = faceSwipeStorageSlot(slot);
    const previous = archiveLoads.get(base);
    // Passive synchronization is bounded. Only an explicit recovery action may
    // retry a settled failed/empty read; simultaneous recovery clicks share it.
    if (previous && (!previous.done || !retry)) return previous.done
        ? Promise.resolve(previous.state === 'ready' ? archiveSaved.get(base) || null : null)
        : previous.promise;
    const cachedBeforeRead = archiveSaved.get(base);
    const entry = { done: false, state: 'loading', promise: null };
    entry.promise = archiveTransaction('readonly', (store, done) => {
        const request = store.get(base); request.onsuccess = () => done(request.result || null);
    }, { readStatus: true, timeoutMs: retry ? 10000 : 2500 }).then(result => {
        entry.done = true;
        // A remap invalidates the whole read. Do not resurrect its previous slot.
        if (archiveLoads.get(base) !== entry) return null;
        if (!result.ok) { entry.state = 'error'; return null; }
        entry.state = 'ready';
        let row = result.value;
        // A newer committed local write (including a tombstone) wins over a
        // read that began before it. Recovery must never roll that write back.
        if (archiveSaved.get(base) !== cachedBeforeRead) row = archiveSaved.get(base) || null;
        if (!row) { archiveSaved.delete(base); return null; }
        if (row.slot !== base || row.schema !== 1) { entry.state = 'error'; return null; }
        archiveSaved.set(base, row);
        for (const [index, state] of Object.entries(row.states || {})) {
            if (/^[0-4]$/.test(index)) durableStacks.set(faceSwipeKey(base, Number(index)), stackSignature(state));
        }
        return row;
    }).catch(() => {
        entry.done = true;
        if (archiveLoads.get(base) === entry) entry.state = 'error';
        return null;
    });
    archiveLoads.set(base, entry);
    return entry.promise;
}

export function saveFaceSwipeArchive(slot, record) {
    const base = faceSwipeStorageSlot(slot);
    const savedRecord = { ...record }; delete savedRecord.faceSwipes;
    const row = { schema: 1, slot: base, record: savedRecord, states: record?.deleted ? {} : snapshotFaceSwipes(base) };
    const prior = archiveWrites.get(base);
    // Compare data, not model claims. Repeated passive syncs do not rewrite IDB.
    const signature = JSON.stringify(row);
    if (prior?.signature === signature) return prior.promise;
    const promise = archiveRemapGate.then(() => prior?.promise || loadFaceSwipeArchive(base)).then(async () => {
        if (JSON.stringify(archiveSaved.get(base)) === signature) return { saved: true, row };
        const readback = await archiveTransaction('readwrite', (store, done) => {
            store.put(row);
            const request = store.get(base); request.onsuccess = () => done(request.result);
        });
        const saved = !!readback && JSON.stringify(readback) === signature;
        if (saved) {
            archiveSaved.set(base, row);
            for (const [index, state] of Object.entries(row.states)) durableStacks.set(faceSwipeKey(base, Number(index)), stackSignature(state));
        }
        return { saved, row };
    });
    archiveWrites.set(base, { signature, promise });
    return promise;
}

// 楼层或 swipe 被删、楼层号前移时，把版本栈的楼层号一起改过来。
// mapSlot(slot) 返回新的 slot、原样的 slot，或 null（那层已删除）。一次读写，不逐条写入。
export function remapFaceSwipeSlots(mapSlot) {
    if (typeof mapSlot !== 'function') return false;
    const store = readStore();
    const next = { schema: STORE_SCHEMA, faces: {} };
    const moved = [];
    let changed = false;
    for (const [key, value] of Object.entries(store.faces || {})) {
        const split = key.lastIndexOf('\u0000');
        const slot = split >= 0 ? key.slice(0, split) : key;
        const suffix = split >= 0 ? key.slice(split) : '';
        const target = mapSlot(slot);
        if (target === slot) { if (!(key in next.faces)) next.faces[key] = value; continue; }
        changed = true;
        durableStacks.delete(key);
        if (target) moved.push([`${target}${suffix}`, value]);
    }
    for (const [key, value] of moved) { durableStacks.delete(key); next.faces[key] = value; }
    if (!changed) return false;
    memoryStore = null;
    return writeStore(next);
}

// 楼层号搬家进行中时返回它的 Promise；读存档的一方（不是写存档的一方）先等它，免得读到搬家前别的楼层的存档。
// 注意：不能让 loadFaceSwipeArchive 本身等它——搬家要先等手头的写入完成，而写入内部会调用读取，会互相等死。
export function faceSwipeArchiveRemapSettled() {
    return archiveRemapGate;
}

// 同样改 IndexedDB 里的版本存档。retargetRecord(record, newSlot) 用来改记录里的楼层号。
// 开始前先作废这个聊天的存档缓存，并让之后的读写排在搬家之后；只读出真的要搬的那几行。
let archiveRemapGate = Promise.resolve();
export function remapFaceSwipeArchive(prefix, mapSlot, retargetRecord = record => record) {
    if (typeof mapSlot !== 'function' || !prefix) return Promise.resolve(false);
    const range = typeof IDBKeyRange !== 'undefined' ? IDBKeyRange.bound(`${prefix}:`, `${prefix}:\uffff`) : null;
    if (!range) return Promise.resolve(false);
    const mine = `${prefix}:`;
    const pendingWrites = [];
    for (const cache of [archiveLoads, archiveSaved, archiveWrites]) {
        for (const key of [...cache.keys()]) {
            if (!String(key).startsWith(mine)) continue;
            if (cache === archiveWrites && cache.get(key)?.promise) pendingWrites.push(cache.get(key).promise);
            cache.delete(key);
        }
    }
    const run = archiveRemapGate.then(() => Promise.allSettled(pendingWrites)).then(() => archiveTransaction('readwrite', (store, done) => {
        const keysRequest = store.getAllKeys(range);
        keysRequest.onsuccess = () => {
            const moves = [];
            for (const key of Array.isArray(keysRequest.result) ? keysRequest.result : []) {
                const slot = String(key || '');
                const target = mapSlot(slot);
                if (target !== slot) moves.push({ slot, target });
            }
            if (!moves.length) { done(true); return; }
            const rows = new Map();
            let pending = moves.length;
            for (const { slot } of moves) {
                const get = store.get(slot);
                get.onsuccess = () => {
                    rows.set(slot, get.result || null);
                    pending -= 1;
                    if (pending) return;
                    // 全部读完再删、再写，链式前移（6→4、4→2）也不会互相覆盖。
                    for (const { slot: from } of moves) store.delete(from);
                    for (const { slot: from, target } of moves) {
                        const row = rows.get(from);
                        if (target && row) store.put({ ...row, slot: target, record: retargetRecord(row.record, target) });
                    }
                    done(true);
                };
            }
        };
    })).then(result => {
        for (const cache of [archiveLoads, archiveSaved, archiveWrites]) {
            for (const key of [...cache.keys()]) if (String(key).startsWith(mine)) cache.delete(key);
        }
        return result === true;
    });
    archiveRemapGate = run.catch(() => false);
    return run;
}
