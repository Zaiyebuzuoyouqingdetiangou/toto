// 画面说明写在一面最后：被审核截断在画面说明里时救回正文、去掉没写完的图框；图框按编号收回画面说明。
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
await page.evaluate(async query => {
    window.req = await import('/src/independentApi/request.js?' + query);
    window.img = await import('/src/builtinImage.js?' + query);
}, query);
let checks = 0;
const HEAD = '<toto data-rabbit-mirror="true"><details open><summary>【兔子镜：七彩】</summary><div class="body"><figure data-rm-draw-frame="1" style="aspect-ratio:4/3"></figure><p>七色证言一：红色的那一页写着昨夜的账。</p><figure data-rm-draw-frame="2"></figure><p>结尾的话。</p></div>';
const NOTE1 = '<div data-rm-draw-notes="1" hidden><p data-rm-draw-prompt="1">案台上的红色账册，暖光</p><p data-rm-draw-char="刑玦">黑发高马尾</p></div>';
const salvage = text => page.evaluate(text => req.salvageCutDrawNotes(text), text);

// 1 截在第二块画面说明里：第一张图保留，第二个图框去掉，正文都在
let out = await salvage(HEAD + NOTE1 + '<div data-rm-draw-notes="2" hidden><p data-rm-draw-prompt="2">少女雪白广袖，肌肤白如');
assert.match(out, /七色证言一/); checks++;
assert.match(out, /data-rm-draw-frame="1"/); checks++;
assert.doesNotMatch(out, /data-rm-draw-frame="2"/); checks++;
assert.match(out, /data-rm-draw-notes="1"/); checks++;
assert.doesNotMatch(out, /data-rm-draw-notes="2"/); checks++;
assert.match(out, /<\/details><\/toto>$/); checks++;
// 2 画面说明写完了，只差半个结尾标签
out = await salvage(HEAD + NOTE1 + '</deta');
assert.match(out, /data-rm-draw-notes="1"[\s\S]*<\/details><\/toto>$/); checks++;
// 3 截在正文里（还没写到画面说明）：不救
assert.equal(await salvage(HEAD.slice(0, 160)), ''); checks++;
// 4 画面说明后面又写了正文、没写完：不救
assert.equal(await salvage(HEAD + NOTE1 + '<p>又写了一段正文还没'), ''); checks++;
// 5 完整的回复不动
assert.equal(await salvage(HEAD + NOTE1 + '</details></toto>'), ''); checks++;

// 6 图框按编号收回画面说明（同一面里），读得到提示词和人物
const adopted = await page.evaluate(html => {
    document.body.innerHTML = html;
    const root = document.body;
    img.adoptDrawNotes(root);
    const frame = root.querySelector('[data-rm-draw-frame="1"]');
    return { prompt: frame.querySelector('[data-rm-draw-prompt]')?.textContent, hidden: frame.querySelector('[data-rm-draw-prompt]')?.hidden,
        order: [...frame.children].map(node => node.getAttribute('data-rm-draw-prompt') ? 'p' : node.getAttribute('data-rm-draw-char') ? 'c' : '?').join(''),
        notesLeft: root.querySelectorAll('[data-rm-draw-notes]').length, frames: img.listBuiltinImageFrames(root).length };
}, HEAD.replace('<toto data-rabbit-mirror="true">', '') + NOTE1 + '</details>');
assert.equal(adopted.prompt, '案台上的红色账册，暖光'); checks++;
assert.equal(adopted.hidden, true); checks++;
assert.equal(adopted.order, 'pc'); checks++;
assert.equal(adopted.notesLeft, 0); checks++;
assert.equal(adopted.frames, 1); checks++;

// 7 只少了结尾标签、或写了说明却没放图框：救回来，但不算丢图（不弹「先不配图」）
const detail = text => page.evaluate(text => req.salvageCutDrawNotesDetail(text), text);
assert.equal((await detail(HEAD + NOTE1 + '</deta')).droppedFrames, 0); checks++;
assert.equal((await detail(HEAD.replace(/<figure[^>]*><\/figure>/g, '') + NOTE1 + '<div data-rm-draw-notes="2" hidden><p data-rm-draw-prompt="2">没写')).droppedFrames, 0); checks++;
assert.equal((await detail(HEAD + NOTE1 + '<div data-rm-draw-notes="2" hidden><p data-rm-draw-prompt="2">没写')).droppedFrames, 1); checks++;

// 8 画面说明只是漏了 </div>、后面写了 </details>：图框留着、不算丢图
let d8 = await detail(HEAD + '<div data-rm-draw-notes="1" hidden><p data-rm-draw-prompt="1">案台上的红色账册，暖光</p></details>');
assert.equal(d8.droppedFrames, 0); checks++;
assert.match(d8.html, /data-rm-draw-frame="1"[\s\S]*data-rm-draw-notes="1"[\s\S]*<\/div><\/details>/); checks++;
// 9 截在画面描述中间，但已经写了 20 字以上：补齐留着，图照画
d8 = await detail(HEAD + NOTE1 + '<div data-rm-draw-notes="2" hidden><p data-rm-draw-prompt="2">昏暗的地牢石壁边，一个蒙着眼的白衣少女蜷坐在稻草堆上，银发少年单膝蹲在她面前用镰刀背轻');
assert.equal(d8.droppedFrames, 0); checks++;
assert.match(d8.html, /data-rm-draw-frame="2"/); checks++;
assert.match(d8.html, /镰刀背轻<\/p><\/div><\/details><\/toto>$/); checks++;

assert.deepEqual(pageErrors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
