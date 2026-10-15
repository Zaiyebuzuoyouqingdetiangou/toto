// 本地浏览器测试：母本库被宿主清空后，启动检查自动从酒馆备份补回；刚删过库时改成先问。
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
  if (p === '/') { res.setHeader('Content-Type','text/html'); return res.end('<!doctype html><meta charset=utf-8><body>'); }
  res.setHeader('Content-Type','text/javascript');
  try { res.end(await readFile(path.join(root, decodeURIComponent(p)))); } catch { res.statusCode=404; res.end(); }
});
await new Promise(r => server.listen(0,'127.0.0.1',r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const ctx = await browser.newContext(); const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.goto(origin);
const out = await page.evaluate(async () => {
  const store = await import('/src/externalWorldBook/store.js');
  const backup = await import('/src/externalWorldBook/backup.js');
  const sb = await import('/src/externalWorldBook/serverBackup.js');
  const toasts = [];
  window.toastr = { success:(t)=>{toasts.push(['success',t]); const d=document.createElement('div'); d.innerHTML='<div class="toast-message"></div>'; d.querySelector('.toast-message').textContent=t; document.body.append(d); return d;},
    info:(t)=>{toasts.push(['info',t]); const d=document.createElement('div'); d.innerHTML='<div class="toast-message"></div>'; document.body.append(d); return d;}, clear(){} };
  const book = { sourceType:'file', sourceId:'b1', sourceName:'测试母本', entries:[{sourceEntryId:'1', sourceEntryUid:'1', title:'花吐症', content:'吐花', contentHash:'h', originalOrder:0, primaryKeywords:[], secondaryKeywords:[]}] };
  const snap = store.prepareExternalLibrarySnapshot(book, [{ entryIdentity: (await import('/src/externalWorldBook/selectionState.js')).entryIdentity(book.entries[0]), classification:'theme' }], {});
  await store.saveExternalLibrarySnapshot(snap, { skipServerBackup:true });
  const text = (await backup.exportExternalLibraryBackup()).text;
  const fetchImpl = async () => new Response(text, { status:200 });
  // simulate host wipe
  await new Promise(r => { const q = indexedDB.deleteDatabase(store.EXTERNAL_WORLD_BOOK_DB_NAME); q.onsuccess=q.onerror=q.onblocked=r; });
  const before = (await store.listExternalLibraries()).length;
  const r1 = await sb.checkMotherLibraryServerBackupOnStartup({ fetchImpl });
  const after = (await store.listExternalLibraries()).length;
  return { before, after, r1, toasts, auto: sb.canAutoRestoreMotherLibraries() };
});
assert.equal(out.before, 0); assert.equal(out.after, 1); assert.equal(out.r1.auto, true);
assert.equal(out.toasts.length, 1); assert.equal(out.toasts[0][0], 'success');
// case 2: pending delete marker -> prompt instead
await page.close(); const page2 = await ctx.newPage(); await page2.goto(origin);
const out2 = await page2.evaluate(async () => {
  const store = await import('/src/externalWorldBook/store.js');
  const backup = await import('/src/externalWorldBook/backup.js');
  const sb = await import('/src/externalWorldBook/serverBackup.js');
  const toasts = [];
  window.toastr = { success:(t)=>{toasts.push(['success',t]);}, info:(t)=>{toasts.push(['info',t]); const d=document.createElement('div'); d.innerHTML='<div class="toast-message"></div>'; document.body.append(d); return d;}, clear(){} };
  const text = (await backup.exportExternalLibraryBackup()).text; // existing lib from page1 (same origin)
  await new Promise(r => { const q = indexedDB.deleteDatabase(store.EXTERNAL_WORLD_BOOK_DB_NAME); q.onsuccess=q.onerror=q.onblocked=r; });
  localStorage.setItem('rabbit_mirror_mother_library_pending_delete:v1', '1');
  const r = await sb.checkMotherLibraryServerBackupOnStartup({ fetchImpl: async () => new Response(text) });
  return { r, toasts, after: (await store.listExternalLibraries()).length };
});
assert.equal(out2.r.auto, false); assert.equal(out2.after, 0); assert.equal(out2.toasts[0][0], 'info');
console.log(JSON.stringify({ autoRestore: true, pendingDeletePrompts: true }));
assert.deepEqual(errors, []);
await browser.close(); server.close();
