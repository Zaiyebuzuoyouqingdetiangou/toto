// 本地浏览器测试：存母本库酒馆备份前读酒馆备份。
// 只有「确定没有」（404）才新建；读失败（5xx、网络错误、JSON 损坏）一律不上传，
// 免得只拿本机的库把酒馆里别的设备存的库盖掉；待删记号留着，下次重试时再删。
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

async function scenario(fn, arg) {
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin);
    await page.evaluate(() => {
        window.__lib = async (ids) => {
            const store = await import('/src/externalWorldBook/store.js');
            const sel = await import('/src/externalWorldBook/selectionState.js');
            for (const id of ids) {
                const book = { sourceType: 'file', sourceId: id, sourceName: '母本' + id, entries: [{ sourceEntryId: '1', sourceEntryUid: '1', title: '阿雪的条目', content: '内容' + id, contentHash: 'h' + id, originalOrder: 0, primaryKeywords: [], secondaryKeywords: [] }] };
                const snap = store.prepareExternalLibrarySnapshot(book, [{ entryIdentity: sel.entryIdentity(book.entries[0]), classification: 'theme' }], {});
                await store.saveExternalLibrarySnapshot(snap, { skipServerBackup: true });
            }
        };
        window.__wipeDb = async () => { const store = await import('/src/externalWorldBook/store.js'); await new Promise(r => { const q = indexedDB.deleteDatabase(store.EXTERNAL_WORLD_BOOK_DB_NAME); q.onsuccess = q.onerror = q.onblocked = r; }); };
        window.__export = async () => (await (await import('/src/externalWorldBook/backup.js')).exportExternalLibraryBackup()).text;
        // read：'404' | '503' | 'network' | 'corrupt' | 备份文本
        window.__save = async ({ read, deletedLibraryIds = [] }) => {
            const sb = await import('/src/externalWorldBook/serverBackup.js');
            const uploads = [];
            const fetchImpl = async (url, init) => {
                if (String(url).includes('/api/files/upload')) { uploads.push(JSON.parse(decodeURIComponent(escape(atob(JSON.parse(init.body).data))))); return new Response('{}'); }
                if (read === '404') return new Response('not found', { status: 404 });
                if (read === '503') return new Response('busy', { status: 503 });
                if (read === 'network') throw new TypeError('Failed to fetch');
                if (read === 'corrupt') return new Response('{"format":"RabbitMirror.ExternalLibraries","libraries":[{"libr');
                return new Response(read);
            };
            let error = null, status = null;
            try { status = await sb.saveMotherLibraryServerBackup({ deletedLibraryIds, fetchImpl, headerProvider: async () => ({}) }); }
            catch (e) { error = { message: String(e?.message || e), readFailed: e?.readFailed === true }; }
            return { error, status, uploads: uploads.map(u => u.libraries.map(item => item.library.displayName).sort()),
                pending: JSON.parse(localStorage.getItem('rabbit_mirror_mother_library_pending_delete:v1') || 'null'),
                stored: JSON.parse(localStorage.getItem('rabbit_mirror_mother_library_server_backup:v1') || 'null') };
        };
    });
    const result = await page.evaluate(fn, arg);
    await page.close();
    return result;
}

// 酒馆备份里原有 A、B（别的设备存的）；本机只有 C。
const serverText = await scenario(async () => { localStorage.clear(); await window.__wipeDb(); await window.__lib(['A', 'B']); return window.__export(); });
const ids = JSON.parse(serverText).libraries.map(item => item.library.libraryId);
const idA = ids.find(id => id.endsWith(':A'));
assert.ok(idA);
const fresh = (read, extra = {}) => scenario(async ({ read, extra }) => {
    localStorage.clear(); await window.__wipeDb(); await window.__lib(['C']);
    return window.__save({ read, ...extra });
}, { read, extra });

// 1. 404：确定没有备份，新建一份（只有本机的库）。
let r = await fresh('404');
assert.equal(r.error, null); assert.deepEqual(r.uploads, [['母本C']]); assert.equal(r.status.ok, true);

// 2-4. 503 / 网络错误 / JSON 损坏：不上传，抛读失败，状态记下失败。
for (const read of ['503', 'network', 'corrupt']) {
    r = await fresh(read);
    assert.deepEqual(r.uploads, [], `${read}: must not overwrite the tavern backup`);
    assert.equal(r.error?.readFailed, true, `${read}: read failure is reported`);
    assert.equal(r.stored?.ok, false); assert.equal(r.stored?.readFailed, true);
}

// 5. 正常合并：酒馆里原有的 A、B 保留，加上本机的 C。
r = await fresh(serverText);
assert.equal(r.error, null); assert.deepEqual(r.uploads, [['母本A', '母本B', '母本C']]); assert.equal(r.status.keptFromServer, 2);

// 6. 删了 A，第一次读失败：不上传，待删记号留在本机（刷新也在）；
//    重开页面后重试读到备份：A 被去掉，B、C 保留，记号清掉。
r = await fresh('503', { deletedLibraryIds: [idA] });
assert.deepEqual(r.uploads, []); assert.deepEqual(r.pending, [idA], 'pending delete survives the failed attempt');
r = await scenario(async ({ text }) => window.__save({ read: text }), { text: serverText });
assert.equal(r.error, null); assert.deepEqual(r.uploads, [['母本B', '母本C']], 'pending delete applied on retry');
assert.equal(r.pending, null); assert.equal(r.status.ok, true);

// 7. 同一页面里：先网络错误、再成功，待删记号同样带到重试。
r = await scenario(async ({ text, idA }) => {
    localStorage.clear(); await window.__wipeDb(); await window.__lib(['C']);
    const first = await window.__save({ read: 'network', deletedLibraryIds: [idA] });
    const second = await window.__save({ read: text });
    return { first, second };
}, { text: serverText, idA });
assert.deepEqual(r.first.uploads, []); assert.deepEqual(r.first.pending, [idA]);
assert.deepEqual(r.second.uploads, [['母本B', '母本C']]); assert.equal(r.second.pending, null);

assert.deepEqual(errors, []);
console.log(JSON.stringify({ scenarios: 7 }));
await browser.close(); server.close();
