// 字母像素画：模型用字母写的小人、小猫，兔子镜画成像素方块。
// 净化后照样保留（模型不能冒充「已画好」）；在像素场景里按格子定位、跟着场景缩放；改了字母就重画、没改不重复画；
// 不在场景里按每格 4px；颜色只认十六进制和颜色名；同一行同色的格子合成一段。
// 设了 PIXEL_DEMO_OUT 时把示范场景截一张图（给人看效果用）。
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
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body style="margin:0;background:#000">'); }
    try { res.end(await readFile(path.join(rootDir, decodeURIComponent(p)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(origin);
const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
await page.evaluate(async q => {
    window.markup = await import('/src/outputSanitizer/markup.js?' + q);
    window.px = await import('/src/pixelSprites.js?' + q);
}, query);
let checks = 0;

// 模型照「像素小屋」的写法写的一面（背景 SVG + 字母小人）。
const GIRL = '..hhhh../.hhhhhh./hhsssshh/hseesseh/.ssppss./..pppp../.pppppp./ppPppPpp/.pppppp./.pp..pp.';
const BOY = '..hhhhh./.hhhhhhh/.hssssh./.seesse./..ssss../.gggggg./gggggggg/gbgggbgg/.bbbbbb./.bb..bb.';
const CAT = 'k.....kk/kk...kkk/.kkkkkkk/.kkkkkkk/.k.k.k.k';
const PAL = 'h #3a2622 s #f6d2bb e #2a1a1a p #f3a7b9 P #e48aa2 b #5a6fa8 g #e9e6ef';
const face = `<toto data-rabbit-mirror="true"><details open><summary>【兔子镜：像素小屋】</summary>
<div class="room" data-rm-pixel-scene="160x90" style="width:800px;">
<svg viewBox="0 0 160 90" shape-rendering="crispEdges" style="display:block;width:100%">
<path fill="#e9c9b8" d="M0 0h160v62h-160z"/><path fill="#7a4a33" d="M0 0h160v6h-160z"/>
<path fill="#b9774a" d="M0 62h160v20h-160z"/><path fill="#5e3624" d="M0 82h160v8h-160z"/>
<path fill="#6b3f2a" d="M60 12h36v30h-36z"/><path fill="#3b2a5a" d="M62 14h32v6h-32z"/><path fill="#b8506a" d="M62 20h32v6h-32z"/><path fill="#f2a24a" d="M62 26h32v6h-32z"/><path fill="#4b3a63" d="M62 32h32v8h-32z"/>
<path fill="#f2b9c6" d="M54 70h52v8h-52z"/><path fill="#ec9fb3" d="M9 50h35v9h-35z"/><path fill="#9a6040" d="M120 26h26v40h-26z"/>
</svg>
<i data-rm-sprite="${GIRL}" data-rm-palette="${PAL}" data-rm-at="66,57" data-rm-sprite-done="假的"></i>
<i data-rm-sprite="${BOY}" data-rm-palette="${PAL}" data-rm-at="90,57"></i>
<i class="cat" data-rm-sprite="${CAT}" data-rm-palette="k #1d1820 x rgb(1,2,3) y 12345" data-rm-at="80,63"></i>
</div>
<p>独立小物件：<i class="loose" data-rm-sprite=".r.r./rrrrr/.rrr./..r.." data-rm-palette="r:#ef7d95"></i></p>
</details></toto>`;
const sanitized = await page.evaluate(html => {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    window.markup.sanitizeRabbitMirrorUntrustedTemplate(tpl);
    return tpl.innerHTML;
}, face);
assert.match(sanitized, /data-rm-sprite="\.\.hhhh\.\.\/\.hhhhhh\./, 'sprite letters survive sanitizing'); checks++;
assert.match(sanitized, /data-rm-pixel-scene="160x90"/); checks++;
assert.match(sanitized, /data-rm-at="66,57"/); checks++;
assert.doesNotMatch(sanitized, /data-rm-sprite-done/, 'the model cannot mark a sprite as already drawn'); checks++;

await page.evaluate(html => { document.body.innerHTML = html; }, sanitized);
const drawn = await page.evaluate(() => window.px.applyPixelSprites(document.body));
assert.equal(drawn, 4); checks++;
const info = await page.evaluate(() => {
    const scene = document.querySelector('.room').getBoundingClientRect();
    const [girl, boy] = document.querySelectorAll('.room > i');
    const g = girl.getBoundingClientRect();
    const loose = document.querySelector('.loose').getBoundingClientRect();
    return {
        girlLeft: g.left - scene.left, girlTop: g.top - scene.top, girlWidth: g.width, girlHeight: g.height,
        paths: girl.querySelectorAll('svg path').length, boyPaths: boy.querySelectorAll('svg path').length,
        catColors: [...document.querySelector('.cat').querySelectorAll('path')].map(p => p.getAttribute('fill')),
        looseWidth: loose.width, rendering: getComputedStyle(document.querySelector('.room')).imageRendering,
        scenePosition: getComputedStyle(document.querySelector('.room')).position,
        firstRow: girl.querySelector('path[fill="#3a2622"]').getAttribute('d').startsWith('M2 0h4v1h-4z'),
    };
});
// 800px 宽的场景是 160 格：一格 5px；第 66 格在 330px，第 57 格在 285px；8 格宽的小人 40px、10 行高 50px。
assert.equal(info.girlLeft, 330); checks++;
assert.equal(info.girlTop, 285); checks++;
assert.equal(info.girlWidth, 40); checks++;
assert.equal(Math.round(info.girlHeight), 50); checks++;
assert.equal(info.firstRow, true, 'same-colour cells in a row are merged into one run'); checks++;
assert.equal(info.paths, 5, 'one path per colour'); checks++;
assert.deepEqual(info.catColors, ['#1d1820'], 'a palette value that is not a colour is ignored'); checks++;
assert.equal(info.looseWidth, 20, 'outside a scene one cell is 4px'); checks++;
assert.equal(info.rendering, 'pixelated'); checks++;
assert.equal(info.scenePosition, 'relative'); checks++;

// 场景缩小（手机上）：小人跟着按比例缩。
const small = await page.evaluate(() => {
    document.querySelector('.room').style.width = '320px';
    const scene = document.querySelector('.room').getBoundingClientRect();
    const g = document.querySelector('.room > i').getBoundingClientRect();
    return { left: g.left - scene.left, width: g.width };
});
assert.equal(small.left, 132); checks++;
assert.equal(small.width, 16); checks++;

// 再画一次：没改的不重画（还是同一个 svg）；改了字母的重画。
const again = await page.evaluate(() => {
    const girl = document.querySelector('.room > i');
    const before = girl.querySelector('svg');
    window.px.applyPixelSprites(document.body);
    const same = girl.querySelector('svg') === before;
    girl.setAttribute('data-rm-sprite', 'pp/pp');
    window.px.applyPixelSprites(document.body);
    return { same, svgs: girl.querySelectorAll('svg').length, viewBox: girl.querySelector('svg').getAttribute('viewBox') };
});
assert.equal(again.same, true); checks++;
assert.equal(again.svgs, 1); checks++;
assert.equal(again.viewBox, '0 0 2 2'); checks++;

// 模型自己写的 CSS 总能盖过兔子镜的默认值：点了换位置、藏起来都生效。
const override = await page.evaluate(() => {
    document.querySelector('.room').style.width = '800px';
    document.head.insertAdjacentHTML('beforeend', '<style id="model-css">.room .moved{left:70%} .room .gone{display:none}</style>');
    const [girl, boy] = document.querySelectorAll('.room > i');
    girl.classList.add('moved'); boy.classList.add('gone');
    const scene = document.querySelector('.room').getBoundingClientRect();
    const result = { left: girl.getBoundingClientRect().left - scene.left, hidden: getComputedStyle(boy).display, inlineDisplay: girl.style.display };
    girl.classList.remove('moved'); boy.classList.remove('gone');
    return result;
});
assert.equal(override.left, 560, 'model left rule wins'); checks++;
assert.equal(override.hidden, 'none', 'model display:none wins'); checks++;
assert.equal(override.inlineDisplay, '', 'no inline display written'); checks++;

// 场景容器里多了一段对白（高度变了）：小人不往下漂，还在原来那一格。
const drift = await page.evaluate(() => {
    const room = document.querySelector('.room');
    room.insertAdjacentHTML('beforeend', '<p class="talk" style="height:200px;margin:0">对白</p>');
    const scene = room.getBoundingClientRect();
    const g = room.querySelector('i').getBoundingClientRect();
    room.querySelector('.talk').remove();
    return g.top - scene.top;
});
assert.equal(drift, 285, 'y stays on its cell (57 x 5px) when the scene grows'); checks++;

// 格数没写对：按背景 SVG 的 viewBox 算；颜色名要是浏览器认得的。
const fallback = await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', '<div id="s2" data-rm-pixel-scene="大概" style="width:400px"><svg viewBox="0 0 40 20" style="display:block;width:100%"></svg><i data-rm-sprite="ab/ba" data-rm-palette="a pink b hair" data-rm-at="10,5"></i></div>');
    window.px.applyPixelSprites(document.getElementById('s2'));
    const scene = document.getElementById('s2').getBoundingClientRect();
    const sprite = document.querySelector('#s2 i');
    const r = sprite.getBoundingClientRect();
    return { left: r.left - scene.left, top: r.top - scene.top, width: r.width, fills: [...sprite.querySelectorAll('path')].map(p => p.getAttribute('fill')) };
});
assert.deepEqual(fallback, { left: 100, top: 50, width: 20, fills: ['pink'] }); checks++;

// 模型常写的 *{margin:0} 重置不让小人贴到顶上；场景有内边距时扣掉内边距再按格子分。
const resets = await page.evaluate(() => {
    document.head.insertAdjacentHTML('beforeend', '<style>[data-rabbit-mirror-css-scope] *, body *{margin:0}</style>');
    const room = document.querySelector('.room');
    const top = room.querySelector('i').getBoundingClientRect().top - room.getBoundingClientRect().top;
    document.body.insertAdjacentHTML('beforeend', '<div id="s3" data-rm-pixel-scene="40x20" style="width:400px;padding:20px;box-sizing:content-box"><svg viewBox="0 0 40 20" style="display:block;width:100%"></svg><i data-rm-sprite="aa/aa" data-rm-palette="a #123456" data-rm-at="10,5"></i></div>');
    window.px.applyPixelSprites(document.getElementById('s3'));
    const scene = document.getElementById('s3').getBoundingClientRect();
    const r = document.querySelector('#s3 i').getBoundingClientRect();
    return { top, left: r.left - scene.left, y: r.top - scene.top, width: r.width };
});
// 400px 内容宽 / 40 格 = 一格 10px；第 10 格在内容区 100px，加 20px 内边距 = 120；第 5 行 50 + 20 = 70；2 格宽 20px。
assert.deepEqual(resets, { top: 285, left: 120, y: 70, width: 20 }); checks++;

// 写坏的：没有颜色、没有字母时保持原样，不报错。
const broken = await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', '<i id="b1" data-rm-sprite="aa/aa" data-rm-palette=""></i><i id="b2" data-rm-sprite="" data-rm-palette="a #fff"></i>');
    window.px.applyPixelSprites(document.body);
    return [document.querySelector('#b1').children.length, document.querySelector('#b2').children.length];
});
assert.deepEqual(broken, [0, 0]); checks++;

if (process.env.PIXEL_DEMO_OUT) {
    await page.evaluate(() => { document.querySelector('.room').style.width = '800px'; document.querySelector('.room > i').setAttribute('data-rm-sprite', '..hhhh../.hhhhhh./hhsssshh/hseesseh/.ssppss./..pppp../.pppppp./ppPppPpp/.pppppp./.pp..pp.'); window.px.applyPixelSprites(document.body); });
    await page.locator('.room').screenshot({ path: process.env.PIXEL_DEMO_OUT });
}

assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
