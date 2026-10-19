// 一批实际遇到的面（1.70.9）：
// 1 累积：按过 data-rm-step="p1" 后 data-rm-show="p1" 出现（血柳旧照）。
// 2 顺序口令：data-rm-show 原样写整串答案「k2,k3,k4」／「!k2,k3,k4」＝按对了／还没按对（楚门）。
// 3 一排没写动作的按钮 + 同样多块只显示第一块的内容：按顺序接成分页（神都舆图）。
// 4 一个类名的几个单选 + 同样多块结果，`.trigger:checked + .tab-con` 隔着 label 对不上：按顺序一一对上（榻前辩证）；旧版桥换掉。
// 5 累积按钮同时写了 popovertarget：记一笔，弹窗也照常弹出。
// 6 开关：两个场景都写了内联 display:none，靠状态规则藏其中一个：开着、关着都各显示一个（雨夜坐标）。
// 7 效果：data-rm-fire="窗帘" 对 data-rm-part="窗帘" 的文字，先收着，按哪个出哪段（像素相遇）。
// 8 效果：data-rm-fire="spinning" 给 [data-rm-part="compass"].xx-spinning 挂类播动画；答对才出现的小徽章写成空 data-rm-match（灵犀连理印）。
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const server = createServer(async (req, res) => {
    const p = new URL(req.url, 'http://x').pathname;
    res.setHeader('Content-Type', 'text/javascript');
    if (p === '/extensions.js') return res.end('export const extension_settings = {}; export const getContext = () => ({});');
    if (p === '/script.js') return res.end('export const saveSettingsDebounced=()=>{};export const setExtensionPrompt=()=>{};export const extension_prompt_types={};export const extension_prompt_roles={};export const eventSource={on(){},removeListener(){}};export const event_types={};');
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    try { res.end(await readFile(path.join(rootDir, decodeURIComponent(p)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(origin);
const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
await page.evaluate(async q => {
    window.behavior = await import('/src/outputSanitizer/behaviorInteractions.js?' + q);
    window.rescue = await import('/src/outputSanitizer/fallbackRescue.js?' + q);
    window.chrome = await import('/src/outputSanitizer/toolsChrome.js?' + q);
}, query);
const mount = html => page.evaluate(html => {
    document.body.innerHTML = html;
    const d = document.querySelector('details');
    behavior.installBehaviorInteractions(d); rescue.installIntelligentInteractionRescue(d); chrome.bridgeCrossParentChecked(d);
}, html);
const vis = sel => page.evaluate(sel => [...document.querySelectorAll(sel)].map(n => (n.getBoundingClientRect().height > 0 ? 'V' : '.')).join(''), sel);
const wait = () => page.waitForTimeout(150);
let checks = 0;

// 1
await mount(`<details open data-rabbit-mirror-css-scope="s1"><summary>t</summary><div data-rm-ui="accumulate"><button data-rm-reset>回滚</button>
  <button data-rm-step="p1">一</button><button data-rm-step="p2">二</button><div data-rm-show="p1">甲的说明文字</div><div data-rm-show="p2">乙的说明文字</div></div></details>`);
assert.equal(await vis('[data-rm-show]'), '..'); checks++;
await page.locator('[data-rm-step="p1"]').click(); await wait();
assert.equal(await vis('[data-rm-show]'), 'V.'); checks++;
await page.locator('[data-rm-step="p2"]').click(); await wait();
assert.equal(await vis('[data-rm-show]'), 'VV'); checks++;

// 2
await mount(`<details open><summary>t</summary><div data-rm-ui="sequence" data-rm-answer="k2,k3,k4">
  <span data-rm-show="!k2,k3,k4">未解锁</span><span data-rm-show="k2,k3,k4">已解锁</span>
  <button data-rm-code="k2">二</button><button data-rm-code="k3">三</button><button data-rm-code="k4">四</button></div></details>`);
assert.equal(await vis('[data-rm-show]'), 'V.'); checks++;
for (const k of ['k2', 'k3', 'k4']) { await page.locator(`[data-rm-code="${k}"]`).click(); await wait(); }
assert.equal(await vis('[data-rm-show]'), '.V'); checks++;

// 3
await mount(`<details open><summary>t</summary><div><div class="tabs"><button>第一站</button><button>第二站</button><button>第三站</button></div>
  <div class="c" style="display:block;">第一站的内容在这里</div><div class="c" style="display:none;">第二站的内容在这里</div><div class="c" style="display:none;">第三站的内容在这里</div></div></details>`);
assert.equal(await vis('.c'), 'V..'); checks++;
await page.locator('.tabs button').nth(2).click(); await wait();
assert.equal(await vis('.c'), '..V'); checks++;
await page.locator('.tabs button').nth(0).click(); await wait();
assert.equal(await vis('.c'), 'V..'); checks++;
// 按钮自带动作（弹窗）的不接。
await mount(`<details open><summary>t</summary><div><div class="tabs"><button popovertarget="p">一</button><button>二</button></div>
  <div class="c" style="display:block;">第一块内容</div><div class="c" style="display:none;">第二块内容</div></div><div id="p" popover>弹</div></details>`);
await page.locator('.tabs button').nth(1).click(); await wait();
assert.equal(await vis('.c'), 'V.'); checks++;

// 4 + 5
const evidence = bridge => `<details open data-rabbit-mirror-css-scope="s4"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s4"] .con{display:none}[data-rabbit-mirror-css-scope="s4"] .trig:checked + .con{display:block !important}</style>
  <div data-rm-ui="accumulate"><button data-rm-step popovertarget="pp">查看</button><div id="pp" popover>证物说明</div></div>
  <div><input type="radio" name="ev" id="e1" class="trig" style="display:none"><label for="e1">出示一</label>
  <input type="radio" name="ev" id="e2" class="trig" style="display:none"><label for="e2">出示二</label>
  <div class="con">第一份结果</div><div class="con">第二份结果</div></div>${bridge}</details>`;
await mount(evidence('<style data-rm-xchecked-bridge="true">[data-rabbit-mirror-css-scope="s4"][data-rm-xchecked-1] .con{display:block;}</style>'));
assert.equal(await vis('.con'), '..'); checks++;
await page.locator('label[for="e1"]').click(); await wait();
assert.equal(await vis('.con'), 'V.'); checks++;
await page.locator('label[for="e2"]').click(); await wait();
assert.equal(await vis('.con'), '.V'); checks++;
assert.equal(await page.evaluate(() => document.querySelectorAll('style[data-rm-xchecked-bridge]').length), 1); checks++;
await page.locator('[data-rm-step]').click(); await wait();
assert.deepEqual(await page.evaluate(() => [document.getElementById('pp').matches(':popover-open'), document.querySelector('[data-rm-step]').getAttribute('data-rm-done')]), [true, 'true']); checks++;

// 6
const scenes = on => `<details open data-rabbit-mirror-css-scope="s6"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s6"] .box[data-rm-on~="on"] .storm{display:none;}[data-rabbit-mirror-css-scope="s6"] .box:not([data-rm-on~="on"]) .freeze{display:none;}</style>
  <div class="box" data-rm-ui="toggle"${on ? ' data-rm-on="on"' : ''}><button data-rm-toggle>切换</button><div class="storm" style="display: none;">暴雨的场景内容</div><div class="freeze" style="display:none;">凝滞的场景内容</div></div></details>`;
const sc = () => vis('.storm, .freeze');
await mount(scenes(true));
assert.equal(await sc(), '.V'); checks++;
await page.locator('[data-rm-toggle]').click(); await wait();
assert.equal(await sc(), 'V.'); checks++;
await page.locator('[data-rm-toggle]').click(); await wait();
assert.equal(await sc(), '.V'); checks++;

// 7
await mount(`<details open><summary>t</summary><div data-rm-ui="effect"><button data-rm-fire="curtain">拉开窗帘</button><button data-rm-fire="cat">摸摸小猫</button>
  <div data-rm-part="curtain">阳光从竹帘缝隙倾泻而入</div><div data-rm-part="cat">小花猫发出舒服的咕噜声</div></div></details>`);
assert.equal(await vis('[data-rm-part]'), '..'); checks++;
await page.locator('[data-rm-fire="cat"]').click(); await wait();
assert.equal(await vis('[data-rm-part]'), '.V'); checks++;
await page.locator('[data-rm-fire="curtain"]').click(); await wait();
assert.equal(await vis('[data-rm-part]'), 'VV'); checks++;

// 8
await mount(`<details open data-rabbit-mirror-css-scope="s8"><summary>t</summary><style>@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}[data-rabbit-mirror-css-scope="s8"] [data-rm-part="compass"].x-spinning{animation:spin .6s}</style>
  <div data-rm-ui="effect"><svg data-rm-part="compass" width="20" height="20"></svg><button data-rm-fire="spinning">校准</button></div>
  <div data-rm-ui="input" data-rm-answer="想你"><input type="text"><output></output><span data-rm-match style="display:none">心悸触发</span></div></details>`);
await page.locator('[data-rm-fire]').click(); await page.waitForTimeout(50);
assert.equal(await page.evaluate(() => document.querySelector('[data-rm-part]').classList.contains('x-spinning')), true); checks++;
assert.equal(await vis('span[data-rm-match]'), '.'); checks++;
await page.locator('input[type=text]').fill('想你'); await wait();
assert.equal(await vis('span[data-rm-match]'), 'V'); checks++;

// 9 天空色谱：整数档滑杆 + 样式里的 [data-stage="N"] 祖先条件
await mount(`<details open data-rabbit-mirror-css-scope="s9"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s9"] .card{display:none}[data-rabbit-mirror-css-scope="s9"] [data-stage="0"] .c0,[data-rabbit-mirror-css-scope="s9"] [data-stage="1"] .c1,[data-rabbit-mirror-css-scope="s9"] [data-stage="2"] .c2{display:block}</style>
  <div data-rm-ui="adjust"><input type="range" min="0" max="2" step="1" value="1"><div class="win"><div class="card c0">卯正鱼肚灰</div><div class="card c1">辰时天光亮</div><div class="card c2">午后日头高</div></div></div></details>`);
assert.equal(await vis('.card'), '.V.'); checks++;
await page.locator('input[type=range]').evaluate(el => { el.value = '2'; el.dispatchEvent(new Event('input', { bubbles: true })); }); await wait();
assert.equal(await vis('.card'), '..V'); checks++;

assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
