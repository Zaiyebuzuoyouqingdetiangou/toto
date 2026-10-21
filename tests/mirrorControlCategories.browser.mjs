// 本地浏览器测试：几类「控件没反应」的写法——
// 1) 连点：次数/窗口写在按钮自己身上，CSS 用 按钮[data-rm-done] ~ 结果 揭示；
// 2) 累积套在按住里：按住按钮写在内层累积区域里，外层按住也要接上；累积步骤按钮各自带 data-rm-done，重来清零。
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
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    res.setHeader('Content-Type', 'text/javascript');
    try { res.end(await readFile(path.join(rootDir, decodeURIComponent(pathname)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const mount = (page, html) => page.evaluate(async html => {
    document.body.innerHTML = html;
    (await import('/src/outputSanitizer/behaviorInteractions.js')).installBehaviorInteractions(document.querySelector('details'));
}, html);
const visible = (page, sel) => page.evaluate(sel => { const n = document.querySelector(sel); const s = getComputedStyle(n); return s.display !== 'none' && s.opacity !== '0'; }, sel);
let browser;
try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 400, height: 700 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin);

    // 1) 连点：data-rm-count / data-rm-window 写在按钮上。
    await mount(page, `<toto data-rabbit-mirror="true" style="display:block"><details open><summary>连点</summary><style>
[data-rm-ui="rhythm"] .locked{display:none}
[data-rm-ui="rhythm"] [data-rm-done="true"] ~ .locked{display:block}
[data-rm-ui="rhythm"] [data-rm-done="true"]{display:none}</style>
<div class="core" data-rm-ui="rhythm"><div class="zone"><button class="tap" data-rm-tap data-rm-count="3" data-rm-window="5">字字字</button><div class="locked">阿雪的回答</div></div></div></details></toto>`);
    assert.equal(await visible(page, '.locked'), false);
    for (let i = 0; i < 3; i += 1) { await page.click('.tap'); await page.waitForTimeout(60); }
    await page.waitForTimeout(150);
    assert.equal(await visible(page, '.locked'), true, 'three taps on the button-declared count reveal the locked view');
    assert.equal(await page.evaluate(() => document.querySelector('.core').getAttribute('data-rm-done')), 'true');

    // 2) 外层按住包着内层累积，按住按钮在内层里；步骤按钮包在一排 div 里，CSS 却写 按钮[done] ~ 结果。
    await mount(page, `<toto data-rabbit-mirror="true" style="display:block"><details open><summary>试妆</summary><style>
.layer{opacity:0}.card{display:none}
.steps .s[data-rm-done="true"]{color:red}
[data-rm-ui="accumulate"] button:nth-of-type(1)[data-rm-done="true"] ~ .preview .l1{opacity:1}
[data-rm-ui="accumulate"] button:nth-of-type(2)[data-rm-done="true"] ~ .preview .l2{opacity:1}
[data-rm-ui="accumulate"] button:nth-of-type(1)[data-rm-done="true"] ~ .dock .c1{display:block}
[data-rm-ui="hold"][data-rm-active="true"] .layer{opacity:0 !important}</style>
<div data-rm-ui="hold"><div data-rm-ui="accumulate" data-rm-count="0"><div class="case"><div class="bar"><div>字字</div><div><button class="holdbtn" data-rm-hold="true" type="button">按住</button><button class="reset" data-rm-reset="true" type="button">重来</button></div></div>
<div class="preview"><div class="layer l1">层一</div><div class="layer l2">层二</div></div></div>
<div class="steps"><button class="s s1" data-rm-step="1" type="button">一</button><button class="s s2" data-rm-step="2" type="button">二</button></div>
<div class="dock"><div class="card c1">某教</div></div>
<div data-rm-show="done" class="fin">字字字</div></div></div></details></toto>`);
    assert.equal(await visible(page, '.fin'), false);
    await page.click('.s1'); await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.querySelector('.s1').getAttribute('data-rm-done')), 'true', 'step button marks itself done');
    assert.equal(await visible(page, '.c1'), true, 'wrapped step button still reaches the later sibling card');
    assert.equal(await visible(page, '.l1'), true, 'wrapped step button reaches the earlier preview layer');
    assert.equal(await visible(page, '.l2'), false);
    const box = await page.locator('.holdbtn').boundingBox();
    await page.mouse.move(box.x + 5, box.y + 5); await page.mouse.down(); await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => document.querySelector('[data-rm-ui="hold"]').getAttribute('data-rm-active')), 'true', 'outer hold wired to the hold button inside the nested group');
    assert.equal(await visible(page, '.l1'), false);
    await page.mouse.up(); await page.waitForTimeout(300);
    assert.equal(await visible(page, '.l1'), true);
    await page.click('.s2'); await page.waitForTimeout(150);
    assert.equal(await visible(page, '.fin'), true, 'all steps done shows done result');
    await page.click('.reset'); await page.waitForTimeout(150);
    assert.equal(await visible(page, '.fin'), false, 'reset clears');
    assert.equal(await visible(page, '.c1'), false);
    assert.equal(await page.evaluate(() => document.querySelector('.s1').getAttribute('data-rm-done')), null);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ rhythmTap: 'ok', nestedHoldAccumulate: 'ok' }));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
