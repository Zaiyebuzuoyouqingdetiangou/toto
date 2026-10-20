// 收藏夹去重：图框提示、画面说明位置、交互状态让几个字不同的同一面也算重复；完全不同的面不动。
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
await page.evaluate(async query => { window.fav = await import('/src/theaterFavorites.js?' + query); }, query);
let checks = 0;
const face = (extra = '', state = '0') => `<details open><summary>【兔子镜：圣子寝殿门牌与内务单】</summary><div class="door"><p>拜月内坛 · 昭月殿 请勿打扰。内设玄铁三重锁，闭阁静修，金创药散止步，内有狼护。</p><p>司务总阁 · 侍候呈单：北境雪狼皮覆褥与止血清膏，点验 ${state} 次。</p><figure data-rm-draw-frame="1">${extra}</figure></div></details>`;
const row = (id, html, createdAt, title = '圣子寝殿门牌与内务单') => ({ id, html, createdAt, title, characterName: '碎影江湖', characterId: 'c1' });
const result = await page.evaluate(async rows => [...(await fav.findDuplicateTheaterFavorites(rows)).entries()], [
    row('a', face('<p data-rm-draw-prompt="1" hidden>银发少年</p>'), 1),
    row('b', face('<div data-rm-draw-status="1"><p>正在画……</p></div>') + '<div data-rm-draw-notes="1" hidden><p data-rm-draw-prompt="1">银发少年</p></div>', 2),
    row('c', face('', '1'), 3),
    row('d', face().replace('请勿打扰', '欢迎光临').replace('北境雪狼皮', '南疆蛇皮').replace('玄铁三重锁', '竹篱一道'), 4, '圣子寝殿门牌与内务单'),
    row('e', face(), 5, '别的标题'),
]);
const remap = new Map(result);
assert.equal(remap.get('b'), 'a'); checks++;   // 图框提示、画面说明位置不同：完全重复
assert.equal(remap.get('c'), 'a'); checks++;   // 只差一个计数字：同标题、几乎一样
assert.equal(remap.has('d'), false); checks++; // 同标题但内容不一样：不动
assert.equal(remap.get('e'), 'a'); checks++;   // 标题不同但内容完全一样：照旧算重复
assert.equal(remap.has('a'), false); checks++; // 最早那份留下
assert.deepEqual(pageErrors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
