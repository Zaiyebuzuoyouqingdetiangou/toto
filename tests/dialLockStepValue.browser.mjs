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

// 3 密码锁的几种写法
// 3a 写成类、密码连写、按钮是 ▲▼
await mount(`<details open><summary>t</summary><style>.drawer{display:none}.box.is-unlocked .drawer{display:block}</style>
<div class="box"><div class="col"><button type="button">▲</button><span id="x1">0</span><button type="button">▼</button></div>
<div class="col"><button type="button">▲</button><span id="x2">0</span><button type="button">▼</button></div>
<p>密码：92</p><div class="drawer">里面的东西</div></div></details>`);
await page.click('.col:nth-of-type(1) button:last-of-type');
await page.click('.col:nth-of-type(2) button:first-of-type'); await page.click('.col:nth-of-type(2) button:first-of-type');
assert.equal(await page.evaluate(() => document.getElementById('x1').textContent + document.getElementById('x2').textContent), '92'); checks++;
assert.equal(await shown('.drawer'), true); checks++;
// 3b 样式没写解锁状态，后面只有一块内联藏起来的内容；要按「开锁」
await mount(`<details open><summary>t</summary><div class="box"><div class="cols">
<div><button type="button">拨动</button><b id="y1">0</b></div><div><button type="button">拨动</button><b id="y2">0</b></div></div>
<p>提示：一、一</p><button type="button" id="go">开锁</button><div class="note" style="display:none">藏在暗格里的一封旧信。</div></div></details>`);
assert.match(await page.evaluate(() => document.querySelector('details').getAttribute('data-rm-dial-lock')), /lock:confirm/); checks++;
await page.click('.cols > div:nth-child(1) button');
await page.click('#go');
assert.equal(await shown('.note'), false); checks++;
await page.click('.cols > div:nth-child(2) button');
assert.equal(await shown('.note'), false); checks++;
await page.click('#go');
assert.equal(await shown('.note'), true); checks++;

// 4 同一类的数字状态：翻页写到兄弟上、按顺序输入、类名写法、模型拿来当编号的属性不碰
await mount(`<details open><summary>t</summary><style>.end{display:none}[data-pg="3"] ~ .end{display:block}</style>
 <div data-rm-ui="pager"><div class="pages" data-pg="1"><section data-rm-page>一</section><section data-rm-page>二</section><section data-rm-page>三</section></div>
 <button type="button" data-rm-next>下一页</button><p class="end">读完了</p></div></details>`);
assert.equal(await shown('.end'), false); checks++;
await page.click('[data-rm-next]'); await page.click('[data-rm-next]');
assert.equal(await shown('.end'), true); checks++;
await mount(`<details open><summary>t</summary><style>.lamp{display:none}.panel.lit-2 .lamp{display:block}</style>
 <div class="panel" data-rm-ui="sequence" data-rm-answer="a b"><button type="button" data-rm-code="a">甲</button><button type="button" data-rm-code="b">乙</button><i class="lamp">灯亮了</i><p data-rm-show="match">对了</p></div></details>`);
await page.click('[data-rm-code="a"]');
assert.equal(await shown('.lamp'), false); checks++;
await page.click('[data-rm-code="b"]');
assert.equal(await shown('.lamp'), true); checks++;
await mount(`<details open><summary>t</summary><style>[data-n="1"] .t{color:red}</style>
 <div data-rm-ui="accumulate"><div data-n="1"><span class="t">一</span></div><button type="button" data-rm-step="1">做</button></div></details>`);
await page.click('[data-rm-step="1"]');
assert.equal(await page.evaluate(() => document.querySelector('[data-rm-ui]').hasAttribute('data-n')), false); checks++;

// 5 误伤检查：数量加减（没有密码）不接；面上别处的 .menu.open 不当锁；开过的锁重新接管不会去开别的
await mount(`<details open><summary>t</summary><div><button type="button">−</button><span>1</span><button type="button">+</button></div>
 <div><button type="button">−</button><span>2</span><button type="button">+</button></div></details>`);
assert.equal(await page.evaluate(() => document.querySelector('details').hasAttribute('data-rm-dial-lock')), false); checks++;
await mount(`<details open><summary>t</summary><style>.menu .item{display:none}.menu.open .item{display:block}.box.unlocked .gift{display:block}.gift{display:none}</style>
 <nav class="menu"><p class="item">菜单项</p></nav>
 <div class="box"><div class="c"><button type="button">拨</button><i>0</i></div><div class="c"><button type="button">拨</button><i>0</i></div><p>提示：1 1</p><p class="gift">礼物</p></div></details>`);
await page.click('.c:nth-of-type(1) button'); await page.click('.c:nth-of-type(2) button');
assert.equal(await shown('.gift'), true); checks++;
assert.equal(await shown('.item'), false); checks++;
await page.evaluate(() => rescue.installIntelligentInteractionRescue(document.querySelector('details')));
assert.equal(await shown('.item'), false); checks++;

// 6 有声书：动画区域只有进度条和播放键，两边两个没写动作的按钮
await mount(`<details open><summary>t</summary><div data-rm-ui="motion"><input type="range" min="0" max="100" value="50">
 <div class="bar"><button type="button" id="back">⏮</button><button type="button" data-rm-play>▶</button><button type="button" id="fwd">⏭</button></div>
 <div data-rm-part style="display:none"></div></div></details>`);
const val = () => page.evaluate(() => Number(document.querySelector('input[type=range]').value));
assert.equal(await page.evaluate(() => document.getElementById('back').getAttribute('data-rm-seek') + document.getElementById('fwd').getAttribute('data-rm-seek')), '-11'); checks++;
await page.click('#fwd'); assert.equal(await val(), 60); checks++;
await page.click('#back'); await page.click('#back'); assert.equal(await val(), 40); checks++;
await page.click('[data-rm-play]'); await page.waitForTimeout(900);
assert.ok(await val() > 40); checks++;
await page.click('[data-rm-play]'); const paused = await val(); await page.waitForTimeout(400);
assert.equal(await val(), paused); checks++;

assert.deepEqual(pageErrors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
