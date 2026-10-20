// 美化把整段正文画进读不到的内嵌页面、或页面上一个字也看不见：改读消息原文（跳过的标签照样跳过）。
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
    if (pathname === '/extensions.js') return res.end('export const extension_settings = {}; export const getContext = () => ({ chat: [], chatId: "t" }); export const renderExtensionTemplateAsync = async () => "";');
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){},emit(){}}; export const event_types = {}; export const chat_metadata = {}; export const saveChatDebounced = () => {}; export const getRequestHeaders = () => ({}); export const substituteParams = s => s; export const this_chid = 0; export const characters = []; export const name1 = "u"; export const name2 = "c";');
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
await page.evaluate(async query => { window.conn = await import('/src/independentApi/connection.js?' + query); }, query);
const read = (bodyHtml, mes, excluded = []) => page.evaluate(async ({ bodyHtml, mes, excluded }) => {
    document.body.innerHTML = `<div id="chat"><div class="mes" mesid="0"><div class="mes_block"><div class="mes_text">${bodyHtml}</div></div></div></div>`;
    await new Promise(resolve => setTimeout(resolve, 150));
    const result = conn.canonicalVisibleMessageText({ mes }, 0, new Set(excluded));
    return { text: result.text, source: result.source };
}, { bodyHtml, mes, excluded });
let checks = 0;
const MES = '<status>好感 80</status>她把信折好，放进了抽屉。<think>想一想</think>';

// 1 整段画进不让外面读的内嵌页面
let r = await read('<iframe sandbox="allow-scripts" srcdoc="<p>她把信折好</p>"></iframe>', MES, ['think']);
assert.equal(r.source, 'source-fallback-mes'); checks++;
assert.match(r.text, /她把信折好，放进了抽屉/); checks++;
assert.doesNotMatch(r.text, /想一想/); checks++;
// 2 页面上一个看得见的字也没有（正文藏起来、只画了一张卡片）
r = await read('<div style="display:none">她把信折好，放进了抽屉。</div><div class="card"></div>', MES);
assert.equal(r.source, 'source-fallback-mes'); checks++;
// 3 页面上读得到字：照旧读页面
r = await read('<p>页面上的字</p>', MES);
assert.equal(r.source, 'live-dom'); checks++;
assert.equal(r.text, '页面上的字'); checks++;
// 4 是「跳过指定标签」把整段吞掉的：不改读原文（交给原来的说明）
r = await read('<story>她把信折好</story>', '<story>她把信折好</story>', ['story']);
assert.equal(r.text, ''); checks++;

assert.deepEqual(pageErrors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
