// 本机存储满了时，最后一步腾地方只删「这一版确认另有可靠存档」的旧缓存；
// 聊天数据只写进内存、存盘还没跑完（或换聊天取消）时，不算已存进聊天文件。
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const server = createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    res.setHeader('Content-Type', 'text/javascript');
    if (pathname === '/extensions.js') return res.end('export const extension_settings = { rabbit_mirror_theater: {} }; export const getContext = () => window.SillyTavern?.getContext?.() || {}; export const renderExtensionTemplateAsync = async () => ""; export const extension_prompt_types = {};');
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){},emit(){}}; export const event_types = {}; export const getRequestHeaders = () => ({}); export const saveChatConditional = async () => {}; export const chat_metadata = {}; export const this_chid = 0; export const characters = []; export const substituteParams = s => s; export const main_api = ""; export const name1 = ""; export const name2 = "";');
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    const file = path.resolve(rootDir, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(rootDir + path.sep)) { res.statusCode = 403; return res.end(); }
    try { res.end(await readFile(file)); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));
await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
await page.goto(origin);
const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];

const result = await page.evaluate(async query => {
    const STORE_KEY = 'rabbit_mirror_independent_outputs_v1';
    // 按字符计的假本机存储：超过上限就拒写（和浏览器的容量不足一样抛错）。
    const data = new Map();
    const fake = {
        limit: Infinity,
        get length() { return data.size; },
        key(i) { return [...data.keys()][i] ?? null; },
        getItem(k) { return data.has(String(k)) ? data.get(String(k)) : null; },
        setItem(k, v) {
            k = String(k); v = String(v);
            const used = [...data].reduce((sum, [key, value]) => sum + (key === k ? 0 : key.length + value.length), 0);
            if (used + k.length + v.length > this.limit) throw new DOMException('simulated quota', 'QuotaExceededError');
            data.set(k, v);
        },
        removeItem(k) { data.delete(String(k)); },
        clear() { data.clear(); },
    };
    Object.defineProperty(window, 'localStorage', { configurable: true, value: fake });
    // 关掉版本存档（IndexedDB），只看聊天文件这一条路：提示要等聊天存盘确认后才收起。
    Object.defineProperty(window, 'indexedDB', { configurable: true, value: undefined });

    let saveCalls = 0; let releaseSave = null;
    const makeCtx = id => {
        const ctx = {
            chatId: id, chat: [{ is_user: true, mes: '字字字' }, { is_user: false, mes: '阿雪看着阿岩。', swipe_id: 0 }, { is_user: false, mes: '阿竹笑了。', swipe_id: 0 }],
            chatMetadata: { chat_id: id }, characterId: 0, characters: [{ name: '某教' }], name2: '某教',
            saveMetadataDebounced() {},
            saveMetadata() { saveCalls += 1; return new Promise(resolve => { releaseSave = resolve; }); },
        };
        return ctx;
    };
    let current = makeCtx('chat-a');
    window.SillyTavern = { getContext: () => current };
    const persistence = await import('/src/independentApi/persistence.js?' + query);
    const { chatKey } = await import('/src/independentApi/connection.js?' + query);
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    const big = (label, n = 60000) => `<details><summary>【兔子镜：${label}】</summary><p>${'字'.repeat(n)}</p></details>`;
    const rec = (label, ts, sourceHash) => ({ html: big(label), initialHtml: '', sourceHash, bodyHash: sourceHash, ts, runtime: 'test' });
    const slotFor = (ctx, index, sourceHash) => `${chatKey(ctx)}:${index}:0:${sourceHash}`;
    const out = {};

    // —— F1：容量不足 ——
    const quotaCase = (oldSlot, oldRecord, setup = () => {}) => {
        fake.clear(); fake.limit = Infinity;
        fake.setItem(STORE_KEY, JSON.stringify({ [oldSlot]: oldRecord }));
        setup();
        const before = fake.getItem(STORE_KEY);
        fake.limit = before.length + STORE_KEY.length + 1000; // 只够放一条
        const newSlot = slotFor(current, 2, 'h2');
        const ok = persistence.writeStore({ ...JSON.parse(before), [newSlot]: rec('阿竹', 2000, 'h2') });
        const after = JSON.parse(fake.getItem(STORE_KEY) || '{}');
        return { ok, oldKept: !!after[oldSlot], newSaved: !!after[newSlot], intact: fake.getItem(STORE_KEY) === before };
    };
    // 旧成品只在本机：一条都不能删，新的这次算没存上。
    out.unbacked = quotaCase(slotFor(current, 1, 'h1'), rec('阿雪', 1000, 'h1'));
    // 别的聊天的旧成品：这里确认不了，不能删。
    out.foreign = quotaCase('other-chat:1:0:h1', rec('阿岩', 1000, 'h1'));
    // 聊天文件里（读进来时就有、没在等存盘）确认有同一版：可以删本机这份。
    out.backed = quotaCase(slotFor(current, 1, 'h1'), rec('阿雪', 1000, 'h1'), () => {
        current.chatMetadata.rabbit_mirror_independent_outputs_v2 = { version: 2, owners: { '1:0': rec('阿雪', 1000, 'h1') } };
    });
    // 聊天数据里有同一版但只是刚写进内存（等存盘）：不能删。
    current = makeCtx('chat-b');
    const msg1 = current.chat[1];
    out.pendingBackup = quotaCase(slotFor(current, 1, 'h1'), rec('阿雪', 1000, 'h1'), () => {
        persistence.writePersistedOwner(current, 1, msg1, rec('阿雪', 1000, 'h1'));
    });

    // —— F3：等存盘 / 换聊天取消 / 存盘完成 ——
    fake.clear(); fake.limit = Infinity;
    current = makeCtx('chat-c');
    const ctxC = current; const msgC = ctxC.chat[1];
    const record = rec('阿雪', 3000, 'hc');
    const slotC = slotFor(ctxC, 1, 'hc');
    persistence.writePersistedOwner(ctxC, 1, msgC, record);
    const { showIndependentUnsavedOutput } = await import('/src/independentApi/mount.js?' + query);
    showIndependentUnsavedOutput(record, slotC);
    out.pendingSaved = persistence.savedInChatFile(ctxC, 1, msgC, record.html, 'hc');
    out.pendingWritten = persistence.writtenToChatMetadata(ctxC, 1, msgC, record.html, 'hc');
    out.noticeShown = !!document.querySelector('[data-rabbit-mirror-unsaved-output]');
    // 请求存盘后马上换聊天：请求作废，不算存上。
    persistence.requestSafeChatSave(ctxC, 1, msgC);
    current = makeCtx('chat-d');
    await wait(2800);
    out.switchSaveCalls = saveCalls;
    current = ctxC;
    out.afterSwitchSaved = persistence.savedInChatFile(ctxC, 1, msgC, record.html, 'hc');
    // 同一条聊天：存盘开始了但还没跑完，仍不算。
    persistence.requestSafeChatSave(ctxC, 1, msgC);
    await wait(2800);
    out.startedSaveCalls = saveCalls;
    out.duringSaveSaved = persistence.savedInChatFile(ctxC, 1, msgC, record.html, 'hc');
    out.duringSaveNotice = !!document.querySelector('[data-rabbit-mirror-unsaved-output]');
    releaseSave(); await wait(50);
    out.afterSaveSaved = persistence.savedInChatFile(ctxC, 1, msgC, record.html, 'hc');
    out.afterSaveNotice = !!document.querySelector('[data-rabbit-mirror-unsaved-output]');
    // 存盘确认以后，这一版的本机缓存在容量不足时就可以腾掉。
    out.confirmedEvictable = quotaCase(slotC, record).newSaved;
    return out;
}, query);
await browser.close(); server.close();
assert.deepEqual(pageErrors, []);
assert.deepEqual(result.unbacked, { ok: false, oldKept: true, newSaved: false, intact: true });
assert.deepEqual(result.foreign, { ok: false, oldKept: true, newSaved: false, intact: true });
assert.deepEqual(result.backed, { ok: true, oldKept: false, newSaved: true, intact: false });
assert.deepEqual(result.pendingBackup, { ok: false, oldKept: true, newSaved: false, intact: true });
assert.equal(result.pendingSaved, false);
assert.equal(result.pendingWritten, true);
assert.equal(result.noticeShown, true);
assert.equal(result.switchSaveCalls, 0);
assert.equal(result.afterSwitchSaved, false);
assert.equal(result.startedSaveCalls, 1);
assert.equal(result.duringSaveSaved, false);
assert.equal(result.duringSaveNotice, true);
assert.equal(result.afterSaveSaved, true);
assert.equal(result.afterSaveNotice, false);
assert.equal(result.confirmedEvictable, true);
console.log('independentPersistenceSafety ok');
