// 本地浏览器测试：模型用外层状态类写「按住」效果（.bare .lips{opacity:0}，原本靠脚本加类），
// 按住时兔子镜把这个类加到按住区域上，松开撤掉；页面上本来就有的类、管不到按住区域的类不碰。
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
const face = `<toto data-rabbit-mirror="true" style="display:block"><details open><summary>试妆镜</summary><style>
.lips{width:40px;height:12px;background:#a45;transition:opacity .2s}.bare .lips{opacity:0}
.night .sky{background:#000}.used .x{color:red}</style>
<div class="vanity" data-rm-ui="hold"><div class="lips"></div><button data-rm-hold>按住看素颜</button></div>
<div class="used"><span class="x">别的地方</span></div></details></toto>`;
let browser;
try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 400, height: 600 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin);
    await page.evaluate(async html => {
        document.body.innerHTML = html;
        (await import('/src/outputSanitizer/behaviorInteractions.js')).installBehaviorInteractions(document.querySelector('details'));
    }, face);
    const lips = () => page.evaluate(() => getComputedStyle(document.querySelector('.lips')).opacity);
    const box = await page.locator('[data-rm-hold]').boundingBox();
    await page.mouse.move(box.x + 5, box.y + 5); await page.mouse.down(); await page.waitForTimeout(350);
    assert.equal(await lips(), '0', 'holding adds the ancestor state class');
    // .night 管的 .sky 不在按住区域里、.used 页面上本来就有：都不加。
    assert.equal(await page.evaluate(() => document.querySelector('.vanity').className), 'vanity bare');
    await page.mouse.up(); await page.waitForTimeout(350);
    assert.equal(await lips(), '1', 'release removes it');
    assert.equal(await page.evaluate(() => document.querySelector('.vanity').className), 'vanity');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ hold: 'ok' }));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
