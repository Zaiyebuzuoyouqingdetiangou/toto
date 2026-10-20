// 多面镜子来回翻看时不重画：画好的图在归属写上前后都能找回；同一张正在画时跟着那一次，不另发请求。
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
    const ctx = { chat: [], chatId: 'c', getCurrentChatId: () => 'c' };
    window.SillyTavern = { getContext: () => ctx };
    window.__calls = 0;
    window.__release = [];
    window.STBaiBaiImage = {
        apiVersion: 1, capabilities: { globalApi: true, generate: true },
        getBackendStatus: () => ({ configured: true, supportsCharacters: false, backend: 'test' }),
        generate: () => { window.__calls += 1; const n = window.__calls; return new Promise(resolve => window.__release.push(() => resolve({ path: `/user/images/p${n}.png` }))); },
    };
    window.images = await import('/src/builtinImage.js?' + query);
}, query);

const face = (n, stamped) => `<details open${stamped ? ' data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="12" data-rabbit-mirror-owner-swipe="0"' : ''}><summary>第${n}面</summary>
  <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>第${n}面的画面：雨夜里撑伞的少年站在石桥上</p></figure></details>`;
const mountHost = stamped => page.evaluate(html => {
    document.body.innerHTML = `<div data-rabbit-mirror-external-source="true" data-rm-source="independent" data-rm-owner-chat="chat:c" data-rm-owner-mesid="12" data-rm-owner-swipe="0">${html}</div>`;
    for (const details of document.querySelectorAll('details')) images.fillBuiltinImageFrames(details);
}, [1, 2, 3].map(n => face(n, stamped)).join(''));
const release = () => page.evaluate(async () => { for (const run of window.__release.splice(0)) run(); await new Promise(resolve => setTimeout(resolve, 50)); });
const painted = () => page.evaluate(() => [...document.querySelectorAll('[data-rm-draw-frame]')].map(frame => (frame.querySelector('img[data-rm-draw-result]')?.getAttribute('src') || '-').replace(location.origin, '')).join(' '));
const calls = () => page.evaluate(() => window.__calls);
let checks = 0;

// 1 外壳挂好、这一面还没写上归属时就开始画：键按外壳的归属算
await mountHost(false);
await page.waitForTimeout(100);
assert.equal(await calls(), 3); checks++;
await release();
assert.equal(await painted(), '/user/images/p1.png /user/images/p2.png /user/images/p3.png'); checks++;

// 2 写上归属后重新挂（来回翻看、重挂载）：直接放回，不再画
await mountHost(true);
await page.waitForTimeout(150);
assert.equal(await calls(), 3); checks++;
assert.equal(await painted(), '/user/images/p1.png /user/images/p2.png /user/images/p3.png'); checks++;
assert.equal(await page.evaluate(() => images.listBuiltinImageFrames(document.querySelector('details')).map(item => item.versions.length).join(',')), '1'); checks++;

// 3 旧版本存在「楼层空」键下的图：写上归属后也找得回来，面板里也看得到
await page.evaluate(() => {
    const raw = {};
    for (let i = 0; i < localStorage.length; i += 1) raw[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
    localStorage.clear();
    for (const [name, value] of Object.entries(raw)) localStorage.setItem(name.replace(':builtin:chat:c:12:0:', ':builtin:c:::'), value);
});
await mountHost(true);
await page.waitForTimeout(150);
assert.equal(await calls(), 3); checks++;
assert.equal(await painted(), '/user/images/p1.png /user/images/p2.png /user/images/p3.png'); checks++;
assert.equal(await page.evaluate(() => images.listBuiltinImageFrames(document.querySelectorAll('details')[1]).map(item => item.versions.length).join(',')), '1'); checks++;

// 4 同一张正在画（键还没记楼层）时重挂：跟着那一次，不另发请求
await page.evaluate(() => localStorage.clear());
await page.evaluate(html => {
    document.body.innerHTML = html;
    images.fillBuiltinImageFrames(document.querySelector('details'));
}, face(9, false));
await page.waitForTimeout(80);
assert.equal(await calls(), 4); checks++;
await page.evaluate(html => {
    document.body.innerHTML = html;
    images.fillBuiltinImageFrames(document.querySelector('details'));
}, face(9, true));
await page.waitForTimeout(80);
assert.equal(await calls(), 4); checks++;
await release();
assert.equal(await painted(), '/user/images/p4.png'); checks++;

assert.deepEqual(pageErrors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
