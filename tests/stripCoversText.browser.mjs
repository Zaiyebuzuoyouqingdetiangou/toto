// 贴着上下边的台标、底部字幕条（绝对定位、不透明底色）压住了正文的字（走近科学之神都红线疑云）：
// 给所在的框在那一边补出空位，字往里让。只压着图、半透明水印、整块遮层都不动；切到别的内容时重新量。
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
const page = await browser.newPage({ viewport: { width: 400, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(origin);
const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
await page.evaluate(async q => { window.polish = await import('/src/outputSanitizer/readabilityPolish.js?' + q); }, query);
const text = '正文的字'.repeat(30);
const screen = (inner, extra = '') => `<details open><summary>t</summary><div id="s" style="position:relative;padding:10px;background:#000;color:#fff;font-size:14px">
  <span id="badge" style="position:absolute;top:8px;left:10px;background:#c33;padding:2px 6px;font-size:12px">神都卫视 · 走近修真</span>
  ${inner}
  <div id="sub" style="position:absolute;bottom:8px;left:10px;right:10px;background:rgba(0,0,0,.85);padding:6px;font-size:12px">【当事人口述】字幕一行字幕一行字幕一行</div>${extra}</div></details>`;
const room = () => page.evaluate(() => {
    const s = document.getElementById('s');
    const covered = id => { const a = document.getElementById(id).getBoundingClientRect(); const r = document.createRange(); r.selectNodeContents(document.getElementById('body')?.firstChild || document.body); return [...r.getClientRects()].some(b => Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) >= 2 && Math.min(a.right, b.right) - Math.max(a.left, b.left) >= 2); };
    return { top: s.hasAttribute('data-rm-polish-room-top'), bottom: s.hasAttribute('data-rm-polish-room-bottom'), badge: document.getElementById('body') ? covered('badge') : null, sub: document.getElementById('body') ? covered('sub') : null };
});
const run = html => page.evaluate(html => { document.body.innerHTML = html; polish.polishReadability(document.querySelector('details')); }, html);
let checks = 0;
await run(screen(`<div id="body">${text}</div>`));
assert.deepEqual(await room(), { top: true, bottom: true, badge: false, sub: false }); checks++;
// 只压着图：不动。
await run(screen('<div style="height:220px;background:linear-gradient(#345,#123)"></div>'));
assert.deepEqual(await room(), { top: false, bottom: false, badge: null, sub: null }); checks++;
// 换成图以后重新量：空位撤掉。
await run(screen(`<div id="body">${text}</div>`));
await page.evaluate(() => { document.getElementById('body').remove(); const d = document.createElement('div'); d.style.cssText = 'height:220px;background:#234'; document.getElementById('s').prepend(d); polish.polishReadability(document.querySelector('details')); });
assert.deepEqual(await room(), { top: false, bottom: false, badge: null, sub: null }); checks++;
// 半透明的水印条、盖住整块的遮层：不动。
await run(`<details open><summary>t</summary><div id="s" style="position:relative;padding:10px"><div id="body">${text}</div>
  <div style="position:absolute;bottom:8px;left:0;right:0;background:rgba(0,0,0,.2)">水印水印水印</div>
  <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:#888">刮开这里</div></div></details>`);
assert.deepEqual(await page.evaluate(() => document.getElementById('s').hasAttribute('data-rm-polish-room-bottom') || document.getElementById('s').hasAttribute('data-rm-polish-room-top')), false); checks++;
assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
