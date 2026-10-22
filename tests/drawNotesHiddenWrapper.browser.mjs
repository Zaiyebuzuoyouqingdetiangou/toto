// 画面说明被模型单独包进一个隐藏折叠（<details hidden>）时，也要搬回外面那一面的图框里，不能让图框拿标题凑提示词。
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
    const image = await import('/src/builtinImage.js?' + query);
    document.body.innerHTML = `<toto><details open><summary>【兔子镜：字字】</summary>
      <div class="tab"><figure data-rm-draw-frame="1"></figure></div><div class="tab"><figure data-rm-draw-frame="2"></figure></div>
      <details hidden><summary>生图元数据</summary>
        <div data-rm-draw-notes="1" hidden><p data-rm-draw-prompt="1">阿雪坐在窗边</p></div>
        <div data-rm-draw-notes="2" hidden><p data-rm-draw-prompt="2">阿岩站在门口</p></div>
      </details></details></toto>`;
    const moved = image.adoptDrawNotes(document.querySelector('toto'));
    const frames = [...document.querySelectorAll('[data-rm-draw-frame]')];
    return { moved, p1: frames[0].querySelector('[data-rm-draw-prompt]')?.textContent, p2: frames[1].querySelector('[data-rm-draw-prompt]')?.textContent,
        left: document.querySelectorAll('[data-rm-draw-notes]').length };
}, query);
await browser.close(); server.close();
assert.deepEqual(pageErrors, []);
assert.deepEqual(result, { moved: 2, p1: '阿雪坐在窗边', p2: '阿岩站在门口', left: 0 });
console.log('drawNotesHiddenWrapper ok');
