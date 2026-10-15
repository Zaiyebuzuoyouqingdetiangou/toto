// 本地浏览器测试：
// 1. 单选组加了镜面前缀后，样式里的 input[name="hair"] 也跟着改名，「选哪项就变样子」能生效；
//    别的控件还在用同一个原名时不改；^= 这类部分匹配不动；重复处理不会套两层前缀。
// 2. 写了纹理的底板大半被自己有底色的板子盖住时，同一种纹理也铺到这些板子上；
//    厚度亮暗边从各自底色算，模型自己写了 inset 边的让开；渐变浅底也按浅底处理；板子里有伸出去的弹出物、或这一面还收着时不乱铺；关掉开关全部撤掉。
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
    if (p === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){}}; export const event_types = {};');
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    try { res.end(await readFile(path.join(rootDir, decodeURIComponent(p)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 400, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(origin);
const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
await page.evaluate(async q => {
    window.san = await import('/src/outputSanitizer.js?' + q);
    window.mt = await import('/src/materialTexture.js?' + q);
}, query);
let checks = 0;

// ---------- 1. 单选组改名后样式同步 ----------
const radioFace = `<details open><summary>捏脸</summary>
<style>
.gen{--hair:#111}
.gen:has(input[name="hair"][value="long"]:checked){--hair:#c00}
.gen:has(input[name='hair'][value="snow"]:checked){--hair:#eee}
.gen:has(input[name=mark][value="on"]:checked) .tip{display:block}
.tip{display:none}
.gen [name^="hair"]{outline:0}
.note[name="memo"]{color:rgb(1,2,3)}
</style>
<div class="gen">
<label><input type="radio" name="hair" value="short" checked style="display:none">短</label>
<label><input type="radio" name="hair" value="long" style="display:none">长</label>
<label><input type="radio" name="hair" value="snow" style="display:none">白</label>
<label><input type="radio" name="mark" value="off" checked style="display:none">无</label>
<label><input type="radio" name="mark" value="on" style="display:none">有</label>
<input type="radio" name="memo" value="a"><input type="radio" name="memo" value="b"><textarea name="memo"></textarea>
<p class="tip">印记显现</p>
</div></details>`;
const radio = await page.evaluate(async html => {
    document.body.innerHTML = html;
    const d = document.querySelector('details');
    san.isolateRabbitMirrorInteractionIds(d);
    try { san.refreshRabbitMirrorToolsInScope(d); } catch { /* 只测改名 */ }
    const hair = () => getComputedStyle(d.querySelector('.gen')).getPropertyValue('--hair').trim();
    const tipShown = () => getComputedStyle(d.querySelector('.tip')).display !== 'none';
    const pick = v => { [...d.querySelectorAll('input[type=radio]')].find(i => i.value === v).closest('label').click(); };
    const out = { names: [...new Set([...d.querySelectorAll('input[type=radio]')].map(i => i.name))], start: hair() };
    pick('long'); await new Promise(r => setTimeout(r, 200)); out.long = hair();
    pick('snow'); await new Promise(r => setTimeout(r, 200)); out.snow = hair();
    pick('on'); await new Promise(r => setTimeout(r, 200)); out.tip = tipShown();
    // 再处理一遍（比如重新渲染时）：不会给样式里的名字再套一层前缀
    san.isolateRabbitMirrorInteractionIds(d);
    out.css = d.querySelector('style').textContent;
    return out;
}, radioFace);
const hairName = radio.names.find(n => n.endsWith('hair'));
assert.notEqual(hairName, 'hair', 'radio names are scoped'); checks++;
assert.equal(radio.start, '#111');
assert.equal(radio.long, '#c00', 'double-quoted [name] selector follows the scoped name'); checks++;
assert.equal(radio.snow, '#eee', 'single-quoted [name] selector follows the scoped name'); checks++;
assert.equal(radio.tip, true, 'unquoted [name] selector follows the scoped name'); checks++;
assert.ok(radio.css.includes('[name^="hair"]'), 'partial-match selectors stay as written'); checks++;
assert.ok(radio.css.includes('.note[name="memo"]'), 'a name still used by another control is left alone'); checks++;
assert.equal(radio.css.split(hairName).length - 1, 2, 'no double prefix after a second pass'); checks++;
assert.ok(!radio.css.includes(`${hairName.slice(0, -4)}${hairName}`)); checks++;

// ---------- 2. 纹理铺到盖住底板的板子上 ----------
const panel = (bg, extra = '', inner = '') => `<section style="background:${bg};padding:20px;min-height:140px;border-radius:12px;${extra}">板子里的字${inner}</section>`;
const textureFace = (panels, open = true) => `<details ${open ? 'open' : ''} data-rabbit-mirror-css-scope="t1"><summary>纹理</summary>
<div data-rm-texture="中 竖 纤维 淡" style="padding:12px;display:flex;flex-direction:column;gap:10px;background:linear-gradient(145deg,rgb(210,224,238),rgb(185,204,223))">
<div class="wrap" style="display:flex;flex-direction:column;gap:10px">${panels}</div></div></details>`;
async function texture(html, { toggle = false } = {}) {
    return page.evaluate(async ({ html, toggle }) => {
        document.body.innerHTML = html;
        const d = document.querySelector('details');
        const n = mt.applyMaterialTextures(d, { materialTextureEnabled: true });
        if (toggle) { d.open = true; await new Promise(r => setTimeout(r, 250)); }
        const base = d.querySelector('[data-rm-texture]');
        const sections = [...d.querySelectorAll('section')].map(s => ({ on: s.getAttribute('data-rm-texture-on'), blend: s.style.getPropertyValue('--rm-texture-blend'), pos: s.style.position, edge: s.style.getPropertyValue('--rm-texture-edge-light'), edgeSize: s.style.getPropertyValue('--rm-texture-edge-size') }));
        return { n, baseBlend: base.style.getPropertyValue('--rm-texture-blend'), done: base.getAttribute('data-rm-texture-spread-done'), sections };
    }, { html, toggle });
}
// 两块不透明的板子（一块很浅的纯色、一块中等的渐变）盖住了大半：两块都铺上，浅的用正片叠底。
let t = await texture(textureFace(panel('#eef4fa') + panel('linear-gradient(#8aa,#799)')));
assert.equal(t.n, 1, 'only the authored element counts as written'); checks++;
assert.deepEqual(t.sections.map(s => s.on), ['before', 'before'], 'covering panels get the same texture'); checks++;
assert.deepEqual(t.sections.map(s => s.blend), ['multiply', ''], 'light panel uses shadow-only, mid-tone panel soft-light'); checks++;
assert.equal(t.done, '2'); checks++;
// 厚度的亮边从各自的底色算：两块颜色不同的板子，亮边颜色不同；粗细按大小算出来。
assert.ok(t.sections[0].edge && t.sections[1].edge && t.sections[0].edge !== t.sections[1].edge, 'edge light derives from each panel\'s own color'); checks++;
assert.match(t.sections[0].edgeSize, /^[123]px$/); checks++;
// 模型自己写了 inset 亮暗边的板子：兔子镜不再描边（让开），纹理照铺。
t = await texture(textureFace(panel('#eef4fa', 'box-shadow:inset 2px 2px 0 #fff,inset -2px -2px 0 #889') + panel('#eef4fa')));
assert.deepEqual(t.sections.map(s => s.on), ['before', 'before']); checks++;
assert.equal(t.sections[0].edge, '', 'panel with its own inset bevel keeps it'); checks++;
assert.notEqual(t.sections[1].edge, ''); checks++;
// 浅色渐变底（没有纯色底）也按浅底处理。
t = await page.evaluate(() => {
    document.body.innerHTML = '<details open><summary>x</summary><div data-rm-texture="细 无 点 淡" style="height:120px;background:linear-gradient(#fbfcff,#eef2f8)">字</div></details>';
    mt.applyMaterialTextures(document.querySelector('details'), { materialTextureEnabled: true });
    return document.querySelector('[data-rm-texture]').style.getPropertyValue('--rm-texture-blend');
});
assert.equal(t, 'multiply', 'light gradient base counts as a light base'); checks++;
// 板子是半透明的（看得见底板）：不算盖住，不铺。
t = await texture(textureFace(panel('rgba(255,255,255,.3)') + panel('rgba(255,255,255,.3)')));
assert.deepEqual(t.sections.map(s => s.on), [null, null], 'translucent panels do not count as covering'); checks++;
// 板子里有收着的弹出框（量不出会伸到哪）：这一块不铺，另一块照铺。
const popup = '<div style="position:absolute;display:none;top:100%;left:0;z-index:5">弹出</div>';
t = await texture(textureFace(panel('#eef4fa', 'position:relative', popup) + panel('#eef4fa')));
assert.deepEqual(t.sections.map(s => s.on), [null, 'before'], 'panel with a hidden popup is skipped'); checks++;
// 有定位的板子里有一个在板子里面、看得见的绝对定位物（比如叠在画上的另一张图）：照铺，不改它的定位。
const overlay = '<span style="position:absolute;inset:4px auto auto 4px;width:20px;height:20px">角</span>';
t = await texture(textureFace(panel('#eef4fa', 'position:relative', overlay) + panel('#eef4fa')));
assert.deepEqual(t.sections.map(s => s.on), ['before', 'before'], 'contained overlay inside a positioned panel is fine'); checks++;
assert.equal(t.sections[0].pos, 'relative'); checks++;
// 没定位的板子里有绝对定位的东西：加定位会让它换参照，不铺。
t = await texture(textureFace(panel('#eef4fa', '', overlay) + panel('#eef4fa')));
assert.deepEqual(t.sections.map(s => s.on), [null, 'before'], 'static panel with absolute child is skipped'); checks++;
// 这一面还收着：先不铺板子，展开后补上。
t = await texture(textureFace(panel('#eef4fa') + panel('#eef4fa'), false), { toggle: true });
assert.deepEqual(t.sections.map(s => s.on), ['before', 'before'], 'spread happens after the face is opened'); checks++;
// 关掉开关：底板和板子上的纹理、定位、记号全撤掉。
const off = await page.evaluate(() => {
    const d = document.querySelector('details');
    mt.applyMaterialTextures(d, { materialTextureEnabled: false });
    return d.querySelectorAll('[data-rm-texture-on], [data-rm-texture-spread], [data-rm-texture-spread-done], [data-rm-texture-pos]').length
        + [...d.querySelectorAll('*')].filter(el => el.style.getPropertyValue('--rm-texture-image') || el.style.getPropertyValue('--rm-texture-edge-light')).length;
});
assert.equal(off, 0, 'switching off removes spread textures too'); checks++;

assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
