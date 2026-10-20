// 状态桥：模型的 CSS 把状态条件写在区域之外／之内的别处时，驱动把区域上的状态同步到那一层。
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
    const p = new URL(req.url, 'http://x').pathname;
    res.setHeader('Content-Type', 'text/javascript');
    if (p === '/extensions.js') return res.end('export const extension_settings = {}; export const getContext = () => ({});');
    if (p === '/script.js') return res.end('export const saveSettingsDebounced=()=>{};export const setExtensionPrompt=()=>{};export const extension_prompt_types={};export const extension_prompt_roles={};export const eventSource={on(){},removeListener(){}};export const event_types={};');
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    try { res.end(await readFile(path.join(rootDir, decodeURIComponent(p)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.goto(`${origin}/`);
const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
await page.evaluate(async query => {
    window.__behavior = await import(`/src/outputSanitizer/behaviorInteractions.js?${query}`);
    window.__bridge = await import(`/src/outputSanitizer/behaviorStateBridge.js?${query}`);
}, query);
const mount = html => page.evaluate(html => {
    document.body.innerHTML = html;
    const details = document.querySelector('details');
    window.__behavior.installBehaviorInteractions(details);
    return details.outerHTML.length;
}, html);
const attr = (sel, name) => page.evaluate(([sel, name]) => document.querySelector(sel)?.getAttribute(name), [sel, name]);
const vis = sel => page.evaluate(sel => [...document.querySelectorAll(sel)].map(n => (n.getBoundingClientRect().height > 0 && getComputedStyle(n).visibility !== 'hidden' ? 'V' : '.')).join(''), sel);
const wait = () => page.waitForTimeout(120);
let checks = 0;

// 1 按住：状态要在区域里面那一层上（捏脸的原图层）
await mount(`<details open data-rabbit-mirror-css-scope="s1"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s1"] [data-rm-ui="hold"] [data-rm-active="true"] .orig{opacity:1;visibility:visible}[data-rabbit-mirror-css-scope="s1"] .orig{opacity:0;visibility:hidden}</style>
  <div data-rm-ui="hold"><svg width="80" height="40"><g class="orig"><rect width="80" height="40"></rect></g></svg><div><button type="button" data-rm-hold>按住</button></div></div></details>`);
const orig = () => page.evaluate(() => getComputedStyle(document.querySelector('.orig')).visibility);
assert.equal(await orig(), 'hidden'); checks++;
let box = await page.locator('[data-rm-hold]').boundingBox();
await page.mouse.move(box.x + 5, box.y + 5); await page.mouse.down(); await wait();
assert.equal(await orig(), 'visible'); checks++;
assert.equal(await attr('svg', 'data-rm-bridged'), 'data-rm-active=true'); checks++;
await page.mouse.up(); await wait();
assert.equal(await orig(), 'hidden'); checks++;
assert.equal(await attr('svg', 'data-rm-bridged'), null); checks++;

// 2 开关：键和 CSS 的词一样，内容却在区域外面 → 写到同时包着两者的那一层；模型原本写在那一层的词保留
await mount(`<details open data-rabbit-mirror-css-scope="s2"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s2"] .drawer{display:none}[data-rabbit-mirror-css-scope="s2"] [data-rm-on~="open"] .drawer{display:block}</style>
  <div class="wrap" data-rm-on="theme"><div data-rm-ui="toggle" data-rm-toggle="open"><button type="button" data-rm-toggle="open">拉开</button></div><div class="drawer">抽屉里的信</div></div></details>`);
assert.equal(await vis('.drawer'), '.'); checks++;
await page.locator('button').click(); await wait();
assert.equal(await vis('.drawer'), 'V'); checks++;
assert.equal(await attr('.wrap', 'data-rm-on'), 'theme open'); checks++;
await page.locator('button').click(); await wait();
assert.equal(await vis('.drawer'), '.'); checks++;
assert.equal(await attr('.wrap', 'data-rm-on'), 'theme'); checks++;

// 3 两个开关写同一个外层：各记各的词，关一个只撤自己的
await mount(`<details open data-rabbit-mirror-css-scope="s3"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s3"] .a,[data-rabbit-mirror-css-scope="s3"] .b{display:none}[data-rabbit-mirror-css-scope="s3"] [data-rm-on~="a"] .a{display:block}[data-rabbit-mirror-css-scope="s3"] [data-rm-on~="b"] .b{display:block}</style>
  <div class="wrap"><div data-rm-ui="toggle" data-rm-toggle="a"><button type="button" data-rm-toggle="a" id="ta">A</button></div><div data-rm-ui="toggle" data-rm-toggle="b"><button type="button" data-rm-toggle="b" id="tb">B</button></div><p class="a">甲</p><p class="b">乙</p></div></details>`);
await page.locator('#ta').click(); await page.locator('#tb').click(); await wait();
assert.equal(await vis('.a, .b'), 'VV'); checks++;
assert.equal(await attr('.wrap', 'data-rm-on'), 'a b'); checks++;
await page.locator('#ta').click(); await wait();
assert.equal(await vis('.a, .b'), '.V'); checks++;
assert.equal(await attr('.wrap', 'data-rm-on'), 'b'); checks++;

// 4 状态写在被样式化的元素自己身上（区域里的灯）
await mount(`<details open data-rabbit-mirror-css-scope="s4"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s4"] .lamp{opacity:.2}[data-rabbit-mirror-css-scope="s4"] [data-rm-ui="toggle"] .lamp[data-rm-on~="on"]{opacity:1}</style>
  <div data-rm-ui="toggle"><span class="lamp">●</span><button type="button" data-rm-toggle>开灯</button></div></details>`);
const lamp = () => page.evaluate(() => getComputedStyle(document.querySelector('.lamp')).opacity);
assert.equal(await lamp(), '0.2'); checks++;
await page.locator('button').click(); await wait();
assert.equal(await lamp(), '1'); checks++;

// 5 旋钮：档位条件写在区域里面那一层
await mount(`<details open data-rabbit-mirror-css-scope="s5"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s5"] .log{display:none}[data-rabbit-mirror-css-scope="s5"] [data-rm-ui="turn"] .logs[data-rm-index="1"] .l1,[data-rabbit-mirror-css-scope="s5"] [data-rm-ui="turn"] .logs[data-rm-index="0"] .l0{display:block}</style>
  <div data-rm-ui="turn" data-rm-stops="3"><div data-rm-knob style="width:40px;height:40px">旋</div><div class="logs"><p class="log l0">第一档</p><p class="log l1">第二档</p></div></div></details>`);
assert.equal(await vis('.log'), 'V.'); checks++;
await page.locator('[data-rm-knob]').focus(); await page.keyboard.press('ArrowRight'); await wait();
assert.equal(await vis('.log'), '.V'); checks++;

// 6 选择：面板和选择区并排，面板是全面唯一的载体
await mount(`<details open data-rabbit-mirror-css-scope="s6"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s6"] .face{display:none}[data-rabbit-mirror-css-scope="s6"] .sheet[data-rm-picked="smile"] .smile,[data-rabbit-mirror-css-scope="s6"] .sheet[data-rm-picked="cry"] .cry{display:block}</style>
  <div class="sheet"><p class="face smile">笑</p><p class="face cry">哭</p></div><div data-rm-ui="pick"><button type="button" data-rm-pick="smile">笑</button><button type="button" data-rm-pick="cry">哭</button></div></details>`);
assert.equal(await vis('.face'), '..'); checks++;
await page.locator('[data-rm-pick="cry"]').click(); await wait();
assert.equal(await vis('.face'), '.V'); checks++;
await page.locator('[data-rm-pick="smile"]').click(); await wait();
assert.equal(await vis('.face'), 'V.'); checks++;

// 7 存档带回来的桥痕迹：开关是关的，载体上上次写的词要撤掉；模型自己写的词留着
await mount(`<details open data-rabbit-mirror-css-scope="s7"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s7"] .drawer{display:none}[data-rabbit-mirror-css-scope="s7"] [data-rm-on~="open"] .drawer{display:block}</style>
  <div class="wrap" data-rm-on="theme open" data-rm-bridged="data-rm-on=open"><div data-rm-ui="toggle" data-rm-toggle="open"><button type="button" data-rm-toggle="open">拉开</button></div><div class="drawer">抽屉里的信</div></div></details>`);
assert.equal(await vis('.drawer'), '.'); checks++;
assert.equal(await attr('.wrap', 'data-rm-on'), 'theme'); checks++;

// 8 标准写法不动：状态写在区域上、内容在区域里，载体为空
await mount(`<details open data-rabbit-mirror-css-scope="s8"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s8"] [data-rm-on~="on"] .x{color:red}</style>
  <div data-rm-ui="toggle"><button type="button" data-rm-toggle>开</button><p class="x">内容</p></div></details>`);
assert.equal(await page.evaluate(() => window.__bridge.describeStateCarriers(document.querySelector('details')).length), 0); checks++;

// 9 别的区域里面的灯不归我管：点 A，B 里的灯不能亮
await mount(`<details open data-rabbit-mirror-css-scope="s9"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s9"] .lamp{opacity:.2}[data-rabbit-mirror-css-scope="s9"] .lamp[data-rm-on~="on"]{opacity:1}</style>
  <div data-rm-ui="toggle" id="A"><button type="button" data-rm-toggle>A</button></div><div data-rm-ui="toggle" id="B"><span class="lamp">●</span><button type="button" data-rm-toggle>B</button></div></details>`);
await page.locator('#A button').click(); await wait();
assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.lamp')).opacity), '0.2'); checks++;
assert.equal(await attr('.lamp', 'data-rm-on'), null); checks++;

// 10 状态桥和方言表 css-state-word 写同一个外层：各记各的，关一个只撤自己的
await mount(`<details open data-rabbit-mirror-css-scope="s10"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s10"] .d1,[data-rabbit-mirror-css-scope="s10"] .d2{display:none}[data-rabbit-mirror-css-scope="s10"] [data-rm-on~="open"] .d1{display:block}[data-rabbit-mirror-css-scope="s10"] [data-rm-on~="unsealed"] .d2{display:block}</style>
  <div class="wrap"><div data-rm-ui="toggle" data-rm-toggle="open" id="A"><button type="button" data-rm-toggle="open">开</button></div><button type="button" data-rm-ui="toggle" data-rm-toggle="" data-rm-show="!unsealed" id="B">封</button><p class="d1">甲</p><p class="d2">乙</p></div></details>`);
await page.locator('#A button').click(); await page.locator('#B').click(); await wait();
assert.equal(await vis('.d1, .d2'), 'VV'); checks++;
await page.locator('#A button').click(); await wait();
assert.equal(await vis('.d1, .d2'), '.V'); checks++;
await page.locator('#B').click(); await wait();
assert.equal(await vis('.d1, .d2'), '..'); checks++;
assert.equal(await attr('.wrap', 'data-rm-on'), null); checks++;

// 11 模型写在载体上的原值：退还后还原
await mount(`<details open data-rabbit-mirror-css-scope="s11"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s11"] .face{display:none}[data-rabbit-mirror-css-scope="s11"] .sheet[data-rm-picked="a"] .a,[data-rabbit-mirror-css-scope="s11"] .sheet[data-rm-picked="b"] .b{display:block}</style>
  <div class="sheet" data-rm-picked="a"><p class="face a">甲</p><p class="face b">乙</p></div><div data-rm-ui="pick"><button type="button" data-rm-pick="a">甲</button><button type="button" data-rm-pick="b">乙</button></div></details>`);
assert.equal(await vis('.face'), 'V.'); checks++;
await page.locator('[data-rm-pick="b"]').click(); await wait();
assert.equal(await vis('.face'), '.V'); checks++;
assert.equal(await attr('.sheet', 'data-rm-bridged'), 'data-rm-picked=b|a'); checks++;
await page.evaluate(() => { const root = document.querySelector('details'); window.__behavior.releaseBehaviorGroup(root, root.querySelector('[data-rm-ui="pick"]')); });
assert.equal(await attr('.sheet', 'data-rm-picked'), 'a'); checks++;
assert.equal(await attr('.sheet', 'data-rm-bridged'), null); checks++;

// 12 区域里的载体上模型自己写的词留着
await mount(`<details open data-rabbit-mirror-css-scope="s12"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s12"] [data-rm-ui="toggle"] .lamp[data-rm-on~="on"]{opacity:1}</style>
  <div data-rm-ui="toggle"><span class="lamp" data-rm-on="warm">●</span><button type="button" data-rm-toggle>开灯</button></div></details>`);
await page.locator('button').click(); await wait();
assert.equal(await attr('.lamp', 'data-rm-on'), 'warm on'); checks++;
await page.locator('button').click(); await wait();
assert.equal(await attr('.lamp', 'data-rm-on'), 'warm'); checks++;

// 13 存档带回来的记号，主人这次没接上线（类型认不出）：按记号撤掉
await mount(`<details open data-rabbit-mirror-css-scope="s13"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s13"] .drawer{display:none}[data-rabbit-mirror-css-scope="s13"] [data-rm-on~="open"] .drawer{display:block}</style>
  <div class="wrap" data-rm-on="theme open" data-rm-bridged="data-rm-on=open"><div data-rm-ui="nonsense"><button type="button">拉开</button></div><div class="drawer">抽屉里的信</div></div></details>`);
assert.equal(await attr('.wrap', 'data-rm-on'), 'theme'); checks++;
assert.equal(await attr('.wrap', 'data-rm-bridged'), null); checks++;

// 14 只把 CSS 点名的词写到载体上：区域上别的词（on）不能带到外层，否则外层下别的开关的内容会被误触
await mount(`<details open data-rabbit-mirror-css-scope="s14"><summary>t</summary><style>[data-rabbit-mirror-css-scope="s14"] .panel,[data-rabbit-mirror-css-scope="s14"] .c{display:none}[data-rabbit-mirror-css-scope="s14"] [data-rm-on~="x"] .panel{display:block}[data-rabbit-mirror-css-scope="s14"] [data-rm-on~="on"] .c{display:block}</style>
  <div class="wrap"><div data-rm-ui="toggle" id="A"><button type="button" data-rm-toggle="x">开面板</button><button type="button" data-rm-toggle="on">开灯</button></div><p class="panel">面板</p><div data-rm-ui="toggle" id="B"><button type="button" data-rm-toggle>另一个</button><p class="c">另一个的内容</p></div></div></details>`);
await page.locator('[data-rm-toggle="x"]').click(); await page.locator('[data-rm-toggle="on"]').click(); await wait();
assert.equal(await vis('.panel, .c'), 'V.'); checks++;
assert.equal(await attr('.wrap', 'data-rm-on'), 'x'); checks++;

assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
