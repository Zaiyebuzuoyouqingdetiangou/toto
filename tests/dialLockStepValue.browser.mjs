// 密码箱转轮 + 累积区域把完成步数写到样式要的 data-xxx="N" 上。
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
    if (pathname === '/extensions.js') return res.end('export const extension_settings = {}; export const getContext = () => ({ chat: [], chatId: "t" });');
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){}}; export const event_types = {};');
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    const file = path.resolve(rootDir, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(rootDir + path.sep)) { res.statusCode = 403; return res.end(); }
    try { res.end(await readFile(file)); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));
await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
await page.goto(origin);
const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
await page.evaluate(async query => {
    window.rescue = await import('/src/outputSanitizer/fallbackRescue.js?' + query);
    window.behavior = await import('/src/outputSanitizer/behaviorInteractions.js?' + query);
}, query);
const mount = html => page.evaluate(html => {
    document.body.innerHTML = html;
    const root = document.querySelector('details');
    behavior.installBehaviorInteractions(root);
    rescue.installIntelligentInteractionRescue(root);
}, html);
const shown = sel => page.evaluate(sel => { const n = document.querySelector(sel); return !!n && n.getBoundingClientRect().height > 0; }, sel);
let checks = 0;

// 1 密码箱
const LOCK = `<details open><summary>t</summary><style>.drawer{display:none}[data-st="unlocked"] .drawer{display:block}</style>
<div id="box" data-st="locked"><div class="dials">
 <div class="col"><div>天</div><label for="a_step">拨动 ▴</label><div class="w" id="w1">0</div></div>
 <div class="col"><div>地</div><label for="b_step">拨动 ▴</label><div class="w" id="w2">0</div></div></div>
 <p>提示：二 · 1</p><div class="drawer">暗格里的信</div></div></details>`;
await mount(LOCK);
assert.equal(await page.evaluate(() => document.querySelector('details').getAttribute('data-rm-dial-lock')), '2:code:lock'); checks++;
for (let i = 0; i < 2; i++) await page.click('label[for="a_step"]');
assert.equal(await shown('.drawer'), false); checks++;
await page.click('label[for="b_step"]');
assert.equal(await page.evaluate(() => document.getElementById('w1').textContent + document.getElementById('w2').textContent), '21'); checks++;
assert.equal(await page.evaluate(() => document.getElementById('box').getAttribute('data-st')), 'unlocked'); checks++;
assert.equal(await shown('.drawer'), true); checks++;
// 存档里已经对上：重新装上直接是开的
await mount(LOCK.replace('id="w1">0', 'id="w1">2').replace('id="w2">0', 'id="w2">1'));
assert.equal(await shown('.drawer'), true); checks++;
// 输入框还在的 label 不接
await mount(LOCK.replace('<p>', '<input id="a_step" type="checkbox"><input id="b_step" type="checkbox"><p>'));
assert.equal(await page.evaluate(() => document.querySelector('details').hasAttribute('data-rm-dial-lock')), false); checks++;

// 2 累积：data-rm-step-val 写到区域上（后代规则）和前面的兄弟上（~ 规则）
await mount(`<details open><summary>t</summary><style>.p{display:none}[data-rm-step-val="0"] .p0,[data-rm-step-val="1"] .p1,[data-rm-step-val="2"] .p2{display:block}
 .card{display:none}[data-rm-step-val="2"] ~ .card{display:block}</style>
 <div data-rm-ui="accumulate"><div class="pot"><i class="p p0">种子</i><i class="p p1">芽</i><i class="p p2">花</i></div>
 <div class="bar"><button type="button" data-rm-step="1">埋种</button><button type="button" data-rm-step="2">浇水</button><button type="button" data-rm-reset>重来</button></div>
 <div class="card">花开了</div></div></details>`);
assert.equal(await shown('.p0'), true); checks++;
await page.click('[data-rm-step="1"]');
assert.equal(await shown('.p1'), true); checks++;
assert.equal(await shown('.card'), false); checks++;
await page.click('[data-rm-step="2"]');
assert.equal(await shown('.p2'), true); checks++;
assert.equal(await shown('.card'), true); checks++;
await page.click('[data-rm-reset]');
assert.equal(await shown('.p0'), true); checks++;
assert.equal(await shown('.card'), false); checks++;

assert.deepEqual(pageErrors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
