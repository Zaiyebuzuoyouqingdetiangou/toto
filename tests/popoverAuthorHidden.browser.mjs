// 本地浏览器测试：模型给原生弹窗（popover）的类写了 display:none，按按钮打开后也要看得见，关上恢复；
// 模型自己写了 :popover-open 显示方式的不动。
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
let browser;
try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 400, height: 600 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin);
    await page.evaluate(async () => {
        document.body.innerHTML = `<toto data-rabbit-mirror="true" style="display:block"><details open data-rabbit-mirror-css-scope="s1"><summary>节点</summary><style>
[data-rabbit-mirror-css-scope="s1"] .pop{display:none;padding:8px;background:#123}
[data-rabbit-mirror-css-scope="s1"] .flex:popover-open{display:flex}</style>
<button class="open1" popovertarget="p1">看</button><div id="p1" popover class="pop">阿岩的秘密 字字字<button class="close1" popovertarget="p1" popovertargetaction="hide">关</button></div>
<button class="open2" popovertarget="p2">看二</button><div id="p2" popover class="pop flex">字字</div></details></toto>`;
        (await import('/src/outputSanitizer/nativePopoverFallback.js')).installNativePopoverFallback(document.querySelector('toto'));
    });
    const shown = sel => page.evaluate(sel => { const n = document.querySelector(sel); return getComputedStyle(n).display !== 'none' && n.getBoundingClientRect().height > 0; }, sel);
    assert.equal(await shown('#p1'), false);
    await page.click('.open1'); await page.waitForTimeout(150);
    assert.equal(await shown('#p1'), true, 'author display:none popover is visible when open');
    await page.click('.close1'); await page.waitForTimeout(150);
    assert.equal(await shown('#p1'), false);
    assert.equal(await page.evaluate(() => document.querySelector('#p1').style.display), '', 'inline display removed on close');
    await page.click('.open2'); await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#p2')).display), 'flex', "model's own open display kept");
    await page.click('.open2'); await page.waitForTimeout(100);
    // 脚本 click() 打开时同步就看得见（隐藏副本实测不等下一轮）。
    assert.equal(await page.evaluate(() => { document.querySelector('.open1').click(); const n = document.querySelector('#p1'); return getComputedStyle(n).display; }), 'block');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ popoverAuthorHidden: 'ok' }));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
