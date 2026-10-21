// 本地浏览器测试：几类「控件没反应」的写法走完整的打开急救链（rearm + activate）后都能用：
// 原生弹窗类被写成 display:none、连点次数写在按钮上、按住套累积、单选分栏里套翻面卡、按住预览。
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
    const pathname = new URL(req.url, 'http://localhost').pathname;
    res.setHeader('Content-Type', 'text/javascript');
    if (pathname === '/extensions.js') return res.end('export const extension_settings = {};');
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced=()=>{}; export const setExtensionPrompt=()=>{}; export const extension_prompt_types={}; export const extension_prompt_roles={}; export const eventSource={on(){},removeListener(){}}; export const event_types={};');
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body>'); }
    const file = path.resolve(rootDir, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(rootDir + path.sep)) { res.statusCode = 403; return res.end(); }
    try { res.end(await readFile(file)); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const wrap = body => `<toto data-rabbit-mirror="true" style="display:block"><details open data-rabbit-mirror-css-scope="sc1"><summary>字字</summary>${body}</details></toto>`;
const faces = {
    popover: wrap(`<style>[data-rabbit-mirror-css-scope="sc1"] .pop{display:none;padding:8px}</style>
<button class="op" popovertarget="pp1">看</button><div id="pp1" popover class="pop">阿岩 字字字</div>`),
    rhythm: wrap(`<style>[data-rm-ui="rhythm"] .locked{display:none}[data-rm-ui="rhythm"] [data-rm-done="true"] ~ .locked{display:block}</style>
<div data-rm-ui="rhythm"><div><button class="tap" data-rm-tap data-rm-count="3" data-rm-window="5">字字</button><div class="locked">某教 字字</div></div></div>`),
    nested: wrap(`<style>.layer{opacity:0}.card{display:none}
[data-rm-ui="accumulate"] button:nth-of-type(1)[data-rm-done="true"] ~ .preview .l1{opacity:1}
[data-rm-ui="accumulate"] button:nth-of-type(1)[data-rm-done="true"] ~ .dock .c1{display:block}
[data-rm-ui="hold"][data-rm-active="true"] .layer{opacity:0 !important}</style>
<div data-rm-ui="hold"><div data-rm-ui="accumulate" data-rm-count="0"><div><div><button class="hb" data-rm-hold="true" type="button">按住</button><button data-rm-reset="true" type="button">重来</button></div>
<div class="preview"><div class="layer l1">字</div></div></div>
<div><button class="s1" data-rm-step="1" type="button">一</button><button data-rm-step="2" type="button">二</button></div>
<div class="dock"><div class="card c1">字字</div></div></div></div>`),
    tabs: wrap(`<style>input[type=radio]{display:none}.blk{display:none}
#tc1:checked ~ div #blk1{display:block !important}#tc2:checked ~ div #blk1{display:none !important}
#tc1:checked ~ div #blk2{display:none !important}#tc2:checked ~ div #blk2{display:block !important}
.inner{transition:transform .1s}[data-rm-ui="toggle"][data-rm-on~="on"] .inner{transform:rotateY(180deg)}</style>
<div class="stack"><input type="radio" name="cs" id="tc1" checked><input type="radio" name="cs" id="tc2">
<div><label for="tc1" class="t1">一</label><label for="tc2" class="t2">二</label></div>
<div><div id="blk1" class="blk b1"><div data-rm-ui="toggle"><div class="inner">阿雪</div><div class="f1" data-rm-toggle role="button" tabindex="0">翻</div></div></div>
<div id="blk2" class="blk b2"><div data-rm-ui="toggle"><div class="inner">阿岩</div><div class="f2" data-rm-toggle role="button" tabindex="0">翻</div></div></div></div></div>`),
    holdPreview: wrap(`<style>.preview{display:none}[data-rm-active="true"] .preview{display:block}</style>
<div data-rm-ui="hold"><button class="ht" data-rm-hold>按住</button><div class="preview" data-rm-show="active">字字字</div></div>`),
};
let browser;
try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 400, height: 900 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    await page.goto(origin);
    const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
    await page.evaluate(async query => { window.ids = await import('/src/outputSanitizer/idsAndRearm.js?' + query); }, query);
    const mount = html => page.evaluate(html => {
        document.body.innerHTML = html;
        const root = document.querySelector('details');
        ids.rearmRabbitMirrorSerializedInteractionRoot(root); ids.activateRabbitMirrorInteractionRescue(root);
    }, html);
    const seen = sel => page.evaluate(sel => { const n = document.querySelector(sel); if (!n) return 'missing'; const s = getComputedStyle(n); const r = n.getBoundingClientRect(); return s.display !== 'none' && Number(s.opacity) > 0.05 && r.height > 0; }, sel);
    const hold = async sel => { const box = await page.locator(sel).boundingBox(); await page.mouse.move(box.x + 4, box.y + 4); await page.mouse.down(); await page.waitForTimeout(250); };

    await mount(faces.popover);
    assert.equal(await seen('.pop'), false);
    await page.click('.op'); await page.waitForTimeout(150);
    assert.equal(await seen('.pop'), true, 'popover shows');

    await mount(faces.rhythm);
    for (let i = 0; i < 3; i += 1) { await page.click('.tap'); await page.waitForTimeout(50); }
    await page.waitForTimeout(100);
    assert.equal(await seen('.locked'), true, 'tap count from the button');

    await mount(faces.nested);
    await page.click('.s1'); await page.waitForTimeout(150);
    assert.equal(await seen('.c1'), true); assert.equal(await seen('.l1'), true);
    await hold('.hb'); assert.equal(await seen('.l1'), false, 'outer hold'); await page.mouse.up(); await page.waitForTimeout(250);
    assert.equal(await seen('.l1'), true);

    await mount(faces.tabs);
    assert.equal(await seen('.b1'), true); assert.equal(await seen('.b2'), false);
    await page.click('.t2'); await page.waitForTimeout(150);
    assert.equal(await seen('.b2'), true, 'second tab'); assert.equal(await seen('.b1'), false);
    await page.click('.f2'); await page.waitForTimeout(250);
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.querySelector('.b2 .inner')).transform), 'none', 'flip inside second tab');
    await page.click('.t1'); await page.waitForTimeout(150);
    assert.equal(await seen('.b1'), true, 'back to first tab');

    await mount(faces.holdPreview);
    assert.equal(await seen('.preview'), false);
    await hold('.ht'); assert.equal(await seen('.preview'), true, 'hold preview'); await page.mouse.up(); await page.waitForTimeout(250);
    assert.equal(await seen('.preview'), false);

    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ fullPipeline: 'ok' }));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
