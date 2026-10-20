// 转盘写在上面，各格的说明写在下面另一个框里（不在 data-rm-ui 里面）：以前转了也不换（码头神龛六道有轮图）。
// 这一面只有一个驱动容器时，外面无主的 data-rm-show 归它管；有两个容器时不乱认。
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
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    try { res.end(await readFile(path.join(rootDir, decodeURIComponent(p)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(origin);
const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
await page.evaluate(async q => { window.behavior = await import('/src/outputSanitizer/behaviorInteractions.js?' + q); }, query);
const shows = n => Array.from({ length: n }, (_, i) => `<div data-rm-show="${i}"${i ? ' style="display:none;"' : ''}>格${i}</div>`).join('');
const face = (extra = '') => `<details open data-rabbit-mirror-css-scope="s1"><summary>t</summary><div>
  <div data-rm-ui="turn" data-rm-stops="6" style="width:200px;height:200px;position:relative"><div data-rm-knob role="button" style="width:60px;height:60px">转</div></div>
  ${extra}<div class="log">${shows(6)}</div></div></details>`;
const visible = () => page.evaluate(() => [...document.querySelectorAll('.log [data-rm-show]')].filter(n => getComputedStyle(n).display !== 'none').map(n => n.getAttribute('data-rm-show')));
let checks = 0;
await page.evaluate(html => { document.body.innerHTML = html; behavior.installBehaviorInteractions(document.querySelector('details')); }, face());
assert.deepEqual(await visible(), ['0']); checks++;
await page.locator('[data-rm-knob]').click();
assert.deepEqual(await visible(), ['1']); checks++;
await page.locator('[data-rm-knob]').click();
assert.deepEqual(await visible(), ['2']); checks++;
// 两个驱动容器：不知道归谁，原样不动。
await page.evaluate(html => { document.body.innerHTML = html; behavior.installBehaviorInteractions(document.querySelector('details')); },
    face('<div data-rm-ui="toggle"><button data-rm-toggle>开</button></div>'));
await page.locator('[data-rm-knob]').click();
assert.deepEqual(await visible(), ['0']); checks++;
assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
