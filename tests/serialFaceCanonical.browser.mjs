// 逐面生成收进来的每一面先按多面存档的格式整理：details 外面多写了字、多包了一层、样式写在外面时，
// 只留那个 details（样式挪进去）重新包一层，整批照样存得下、挂得回来；实在整理不了的才当这一面失败。
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
    if (pathname === '/extensions.js') return res.end('const ctx = { chat: [], chatId: "c", getCurrentChatId: () => "c", characterId: 0, characters: [{ name: "测试" }], name2: "测试" }; export const extension_settings = { rabbit_mirror_theater: {} }; export const getContext = () => ctx; export const renderExtensionTemplateAsync = async () => ""; export const extension_prompt_types = {};');
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
    window.SillyTavern = { getContext: () => ({ chat: [], chatId: 'c' }) };
    const request = await import('/src/independentApi/request.js?' + query);
    const protocol = await import('/src/multifaceProtocol.js?' + query);
    const ok = html => !!html && protocol.parseMultifaceOutput(`${html.replace(/data-rm-face="\d+"/, 'data-rm-face="1"')}\n${protocol.createMultifaceFailureSlot(1)}`, { expectedCount: 2, storedDisplay: true }).ok;
    const details = n => `<details><summary>第${n}面</summary><p>正文${n}</p></details>`;
    return {
        plain: ok(request.canonicalSerialFace(details(1), 0)),
        outsideText: ok(request.canonicalSerialFace(`前言一句<toto>${details(2)}</toto>后记`, 1)),
        wrapped: ok(request.canonicalSerialFace(`<div class="wrap">${details(3)}</div>`, 2)),
        outsideStyle: ok(request.canonicalSerialFace(`<style>.x{color:red}</style>${details(4)}`, 3)),
        nested: ok(request.canonicalSerialFace(`<details><summary>五</summary><toto><p>里层</p></toto></details>`, 4)),
        nothing: request.canonicalSerialFace('<p>没有 details</p>', 0),
    };
}, query);
let checks = 0;
for (const name of ['plain', 'outsideText', 'wrapped', 'outsideStyle', 'nested']) { assert.equal(result[name], true, name); checks++; }
assert.equal(result.nothing, ''); checks++;
assert.deepEqual(pageErrors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
