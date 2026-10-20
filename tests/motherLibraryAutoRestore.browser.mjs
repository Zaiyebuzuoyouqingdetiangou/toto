// 本地浏览器测试：母本库被宿主清空后，启动检查自动从酒馆备份补回；
// 刚删过库还没存上、上次存的时候本机就是空的（自己删光或别的设备的库）、上次存备份失败时改成先问；
// 刚删的库刷新页面后也记得，下次保存会从酒馆备份里去掉，恢复时也不补回来。
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const server = createServer(async (req, res) => {
    const p = new URL(req.url, 'http://x').pathname;
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset=utf-8><body>'); }
    res.setHeader('Content-Type', 'text/javascript');
    try { res.end(await readFile(path.join(root, decodeURIComponent(p)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const ctx = await browser.newContext();
const errors = [];

// 每个场景开一个新页面（模块重新加载，就像重开酒馆）；同一个 context 共用本机存储。
async function scenario(fn, arg) {
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin);
    await page.evaluate(() => {
        window.__toasts = [];
        const make = kind => text => { window.__toasts.push([kind, text]); const d = document.createElement('div'); d.innerHTML = '<div class="toast-message"></div>'; document.body.append(d); return d; };
        window.toastr = { success: make('success'), info: make('info'), clear() {} };
        window.__lib = async (ids) => {
            const store = await import('/src/externalWorldBook/store.js');
            const sel = await import('/src/externalWorldBook/selectionState.js');
            for (const id of ids) {
                const book = { sourceType: 'file', sourceId: id, sourceName: '母本' + id, entries: [{ sourceEntryId: '1', sourceEntryUid: '1', title: '条目', content: '内容' + id, contentHash: 'h' + id, originalOrder: 0, primaryKeywords: [], secondaryKeywords: [] }] };
                const snap = store.prepareExternalLibrarySnapshot(book, [{ entryIdentity: sel.entryIdentity(book.entries[0]), classification: 'theme' }], {});
                await store.saveExternalLibrarySnapshot(snap, { skipServerBackup: true });
            }
        };
        window.__wipeDb = async () => { const store = await import('/src/externalWorldBook/store.js'); await new Promise(r => { const q = indexedDB.deleteDatabase(store.EXTERNAL_WORLD_BOOK_DB_NAME); q.onsuccess = q.onerror = q.onblocked = r; }); };
        window.__names = async () => (await (await import('/src/externalWorldBook/store.js')).listExternalLibraries()).map(l => l.displayName).sort();
        window.__export = async () => (await (await import('/src/externalWorldBook/backup.js')).exportExternalLibraryBackup()).text;
    });
    const result = await page.evaluate(fn, arg);
    await page.close();
    return result;
}

// 准备酒馆备份：两本库 A、B。
const backupText = await scenario(async () => { localStorage.clear(); await window.__wipeDb(); await window.__lib(['A', 'B']); return window.__export(); });
const startup = (localStorageEntries) => scenario(async ({ text, entries }) => {
    localStorage.clear();
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
    await window.__wipeDb();
    const sb = await import('/src/externalWorldBook/serverBackup.js');
    const r = await sb.checkMotherLibraryServerBackupOnStartup({ fetchImpl: async () => new Response(text) });
    return { auto: r?.auto ?? null, names: await window.__names(), toasts: window.__toasts.map(t => t[0]) };
}, { text: backupText, entries: localStorageEntries });

const STATUS = 'rabbit_mirror_mother_library_server_backup:v1', PENDING = 'rabbit_mirror_mother_library_pending_delete:v1';
const idOf = name => `extlib:file:`; // 只用来拼前缀，真正的编号从备份里取
const ids = JSON.parse(backupText).libraries.map(item => item.library.libraryId);
const idA = ids.find(id => id.endsWith(':A')), idB = ids.find(id => id.endsWith(':B'));
assert.ok(idA && idB && idOf('A'));

// 1. 宿主把网页数据整个清了（本机记录也没了）：自动补回。
let r = await startup({});
assert.equal(r.auto, true); assert.deepEqual(r.names, ['母本A', '母本B']); assert.deepEqual(r.toasts, ['success']);
// 2. 只有数据库被清、本机记录还在，上次存的时候本机有库：自动补回。
r = await startup({ [STATUS]: JSON.stringify({ ok: true, localCount: 2 }) });
assert.equal(r.auto, true); assert.deepEqual(r.names, ['母本A', '母本B']);
// 3. 上次存的时候本机就是空的（自己删光了，或备份里是别的设备的库）：先问，不自动导入。
r = await startup({ [STATUS]: JSON.stringify({ ok: true, localCount: 0 }) });
assert.equal(r.auto, false); assert.deepEqual(r.names, []); assert.deepEqual(r.toasts, ['info']);
// 4. 旧版记录（没有 localCount）：保守，先问。
r = await startup({ [STATUS]: JSON.stringify({ ok: true, libraryCount: 2 }) });
assert.equal(r.auto, false); assert.deepEqual(r.names, []);
// 5. 上次存备份失败：先问。
r = await startup({ [STATUS]: JSON.stringify({ ok: false }) });
assert.equal(r.auto, false);
// 6. 旧版的「删过」记号（只有时间）：先问。
r = await startup({ [PENDING]: '1' });
assert.equal(r.auto, false); assert.deepEqual(r.names, []);
// 7. 刚删了 A 还没存上：先问；手动点恢复时只补 B，不把 A 补回来。
const manual = await scenario(async ({ text, pending, idA }) => {
    localStorage.clear(); localStorage.setItem(pending, JSON.stringify([idA]));
    await window.__wipeDb();
    const sb = await import('/src/externalWorldBook/serverBackup.js');
    const auto = sb.canAutoRestoreMotherLibraries();
    await sb.restoreMotherLibrariesFromServerBackup({ fetchImpl: async () => new Response(text) });
    return { auto, names: await window.__names() };
}, { text: backupText, pending: PENDING, idA });
assert.equal(manual.auto, false); assert.deepEqual(manual.names, ['母本B']);
// 8. 删了 A、没存上就刷新了页面：下次保存（哪怕和删除无关）也会把 A 从酒馆备份里去掉，记号随后清掉。
const saved = await scenario(async ({ text, pending, idA, status }) => {
    localStorage.clear(); localStorage.setItem(pending, JSON.stringify([idA]));
    await window.__wipeDb(); await window.__lib(['B']);
    const sb = await import('/src/externalWorldBook/serverBackup.js');
    let uploaded = null;
    const fetchImpl = async (url, init) => {
        if (String(url).includes('/api/files/upload')) { uploaded = JSON.parse(decodeURIComponent(escape(atob(JSON.parse(init.body).data)))); return new Response('{}'); }
        return new Response(text);
    };
    await sb.saveMotherLibraryServerBackup({ fetchImpl, headerProvider: async () => ({}) });
    return { uploadedNames: uploaded.libraries.map(item => item.library.displayName).sort(), pendingLeft: localStorage.getItem(pending), status: JSON.parse(localStorage.getItem(status)) };
}, { text: backupText, pending: PENDING, idA, status: STATUS });
assert.deepEqual(saved.uploadedNames, ['母本B'], 'A stays deleted in the tavern backup');
assert.equal(saved.pendingLeft, null); assert.equal(saved.status.localCount, 1);

assert.deepEqual(errors, []);
console.log(JSON.stringify({ scenarios: 8 }));
await browser.close(); server.close();
