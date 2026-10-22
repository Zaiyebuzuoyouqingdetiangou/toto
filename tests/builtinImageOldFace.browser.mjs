// 这次打开之前生成的面：插图记录找不到时不自动重画，只留「重新生图」；这次打开后生成的面照旧自动画。
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
    if (pathname === '/extensions.js') return res.end('const ctx = { chat: [], chatId: "c", getCurrentChatId: () => "c", characterId: 0, characters: [{ name: "测试" }], name2: "测试" }; export const extension_settings = { rabbit_mirror_theater: { builtinImageEnabled: true } }; export const getContext = () => ctx;');
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){}}; export const event_types = {};');
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    if (pathname.startsWith('/user/images/')) { res.setHeader('Content-Type', 'image/png'); return res.end(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')); }
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
await page.evaluate(async query => {
    localStorage.clear();
    const old = performance.timeOrigin - 60000;
    const chat = Array.from({ length: 16 }, (_, i) => ({ mes: '回复' + i, is_user: i % 2 === 1, swipe_id: 0 }));
    for (const i of [12, 14]) { chat[i].gen_started = new Date(old).toISOString(); chat[i].gen_finished = new Date(old).toISOString(); }
    chat.push({ mes: '多面', swipe_id: 0 }, { mes: '用户', is_user: true }, { mes: '多面2', swipe_id: 0 });
    const ctx = { chat, chatId: 'c', getCurrentChatId: () => 'c', chatMetadata: { rabbit_mirror_independent_outputs_v2: { owners: {
        '10:0': { html: '<details><summary>旧</summary>旧的面</details>', ts: old, sourceHash: 'a' },
        '12:0': { html: '<details><summary>新</summary>新的面</details>', ts: old, sourceHash: 'b' },
        '18:0': { html: '<details><summary>多面</summary>多面</details>', ts: Date.now(), sourceHash: 'c' },
    } }, other: 1 } };
    window.__ctx = ctx;
    window.SillyTavern = { getContext: () => ctx };
    window.__calls = 0;
    window.__release = [];
    window.STBaiBaiImage = {
        apiVersion: 1, capabilities: { globalApi: true, generate: true },
        getBackendStatus: () => ({ configured: true, supportsCharacters: false, backend: 'test' }),
        generate: () => { window.__calls += 1; const n = window.__calls; return new Promise(resolve => window.__release.push(() => resolve({ path: `/user/images/p${n}.png` }))); },
    };
    window.images = await import('/src/builtinImage.js?' + query);
    window.fresh = await import('/src/freshDrawSlots.js?' + query);
}, query);


const face = (mes, faceIndex = null) => `<details open${faceIndex === null ? '' : ` data-rabbit-mirror-face-index="${faceIndex}"`} data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="${mes}" data-rabbit-mirror-owner-swipe="0"><summary>第${mes}层</summary>
  <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>第${mes}层${faceIndex ?? ""}面的画面：雨夜里撑伞的少年站在石桥上</p></figure></details>`;
const mount = (mes, faces = null) => page.evaluate(([html, mes]) => {
    document.body.innerHTML = `<div id="chat"><div class="mes" mesid="${mes}"><div data-rabbit-mirror-external-source="true" data-rm-owner-chat="chat:c" data-rm-owner-mesid="${mes}" data-rm-owner-swipe="0">${html}</div></div></div>`;
    for (const details of document.querySelectorAll('details')) images.fillBuiltinImageFrames(details);
}, [faces ? faces.map(index => face(mes, index)).join('') : face(mes), mes]);
// 写在回复正文里的面：面上、外面都没有归属标记，只在那条消息里。
const mountInline = (mes, prompt) => page.evaluate(([mes, prompt]) => {
    document.body.innerHTML = `<div id="chat"><div class="mes" mesid="${mes}"><div class="mes_text"><toto data-rabbit-mirror="true"><details open><summary>正文里的面</summary>
      <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>${prompt}</p></figure></details></toto></div></div></div>`;
    for (const details of document.querySelectorAll('details')) images.fillBuiltinImageFrames(details);
}, [mes, prompt]);
const calls = () => page.evaluate(() => window.__calls);
const status = (n = 0) => page.evaluate(n => document.querySelectorAll('details')[n]?.querySelector('[data-rm-draw-status]')?.textContent || '', n);
let checks = 0;

// 1 以前生成的面（存档时间早于这次打开）：不自动画，留「重新生图」
await mount(10);
await page.waitForTimeout(200);
assert.equal(await calls(), 0); checks++;
assert.match(await status(), /不自动重画/); checks++;
const rerolled = await page.evaluate(() => { const button = [...document.querySelectorAll('[data-rm-draw-status] button')].find(node => node.textContent.includes('重新生图')); button?.click(); return !!button; });
assert.ok(rerolled, '留着重新生图按钮'); checks++;
await page.waitForTimeout(200);
assert.equal(await calls(), 1, '点了重新生图才画'); checks++;
await page.evaluate(async () => { for (const run of window.__release.splice(0)) run(); await new Promise(resolve => setTimeout(resolve, 50)); });

// 2 这次打开以后为这层发过生成（存档、回复时间都是旧的）：照旧自动画
await page.evaluate(() => fresh.markFreshDrawSlot('chat:c', 12, 0));
await mount(12);
await page.waitForTimeout(200);
assert.equal(await calls(), 2); checks++;
await page.evaluate(async () => { for (const run of window.__release.splice(0)) run(); await new Promise(resolve => setTimeout(resolve, 50)); });

// 3 没有兔子镜存档、写在回复正文里的面：按那条回复生成的时间算，早于这次打开就不画
await mountInline(14, '正文里的面：灯下翻书的少女');
await page.waitForTimeout(200);
assert.equal(await calls(), 2); checks++;
assert.match(await status(), /不自动重画/); checks++;

// 4 第 16 层：没有生成时间、也没有存档（不知道是什么时候的）：照旧自动画
await mount(16);
await page.waitForTimeout(200);
assert.equal(await calls(), 3); checks++;

// 5 存档时间被别的操作刷新过（重说、翻版本、找回都会改），没在这次打开后为它发过生成：仍不自动画
await mount(18);
await page.waitForTimeout(200);
assert.equal(await calls(), 3); checks++;
assert.match(await status(), /不自动重画/); checks++;

// 6 多面里只重说了第 2 面：只有第 2 面自动画，其他面不画
await page.evaluate(() => fresh.markFreshDrawSlot('chat:c', 18, 0, 1));
await mount(18, [0, 1, 2]);
await page.waitForTimeout(200);
assert.equal(await calls(), 4); checks++;
assert.match(await status(0), /不自动重画/); checks++;
assert.doesNotMatch(await status(1), /不自动重画/); checks++;
assert.match(await status(2), /不自动重画/); checks++;
await page.evaluate(async () => { for (const run of window.__release.splice(0)) run(); await new Promise(resolve => setTimeout(resolve, 50)); });

// 单面镜子（没有面序号）：按整条算，不当成第 1 面
assert.equal(await page.evaluate(() => fresh.isFreshDrawSlot('chat:c', 12, 0, 0)), true); checks++;
assert.equal(await page.evaluate(() => fresh.isFreshDrawSlot('chat:c', 18, 0, null)), false); checks++;

// 7 整条重新生成：这层所有面都自动画
await page.evaluate(() => fresh.markFreshDrawSlot('chat:c', 18, 0));
await mount(18, [0, 2]);
await page.waitForTimeout(200);
assert.equal(await calls(), 6); checks++;

// 8 旧面里图框套在模型写的折叠里：按最外层那一面的归属算，照样不自动画
await page.evaluate(() => {
    document.body.innerHTML = `<div id="chat"><div class="mes" mesid="10"><div data-rabbit-mirror-external-source="true" data-rm-owner-chat="chat:c" data-rm-owner-mesid="10" data-rm-owner-swipe="0"><details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="10" data-rabbit-mirror-owner-swipe="0"><summary>旧面</summary>
      <details open><summary>点开看</summary><figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>折叠里的画面：檐下躲雨的猫</p></figure></details></details></div></div></div>`;
    images.fillBuiltinImageFrames(document.querySelector('details'));
});
await page.waitForTimeout(200);
assert.equal(await calls(), 6); checks++;
assert.match(await page.evaluate(() => document.querySelector('[data-rm-draw-status]')?.textContent || ''), /不自动重画/); checks++;

// 9 这次打开以后才生成的回复，正文里的面：照旧自动画（酒馆记的生成时间是 Date）
await page.evaluate(() => { window.__ctx.chat[16].gen_started = new Date(); });
await mountInline(16, '正文里的面：新回复里的雨巷');
await page.waitForTimeout(200);
assert.equal(await calls(), 7); checks++;

assert.deepEqual(pageErrors, []); checks++;
await browser.close();
server.close();
console.log(`builtinImageOldFace: ${checks} checks passed`);
