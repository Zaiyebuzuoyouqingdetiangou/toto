// 底部切页条跟着面的深浅：深色的面用深色条，浅色的面照旧白条。
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
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/style.css"><body><div id="chat"></div>'); }
    res.setHeader('Content-Type', pathname.endsWith('.css') ? 'text/css' : 'text/javascript');
    try { res.end(await readFile(path.join(rootDir, decodeURIComponent(pathname)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/`);
const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
const run = (bg, summaryBg = '') => page.evaluate(async ({ query, bg, summaryBg }) => {
    const { placeFacePager } = await import(`/src/facePagerPlacement.js?${query}`);
    const chat = document.getElementById('chat');
    chat.innerHTML = `<details open style="${bg ? `background:${bg}` : ''}"><summary style="${summaryBg ? `background:${summaryBg}` : ''}">标题<span data-rabbit-mirror-tool-entry-host><span class="rabbit-mirror-face-swipe-bar" data-rm-face-swipe-bar><button>‹</button><span data-rm-face-swipe-label>1/2</span><button>›</button></span></span></summary><div>正文</div></details>`;
    const details = chat.querySelector('details');
    placeFacePager(details, details.querySelector('[data-rabbit-mirror-tool-entry-host]'), 'bottom');
    const footer = details.nextElementSibling;
    return [footer?.getAttribute('data-rm-pager-tone') || '', getComputedStyle(footer.querySelector('.rabbit-mirror-face-swipe-bar')).backgroundColor].join('|');
}, { query, bg, summaryBg });
let checks = 0;
assert.equal(await run('#14181c'), 'dark|rgb(36, 38, 43)'); checks++;
assert.equal(await run('', '#1d1a17'), 'dark|rgb(36, 38, 43)'); checks++;
assert.equal(await run('#f5efe3'), 'light|rgb(255, 255, 255)'); checks++;
assert.equal(await run(''), '|rgb(255, 255, 255)'); checks++;
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
