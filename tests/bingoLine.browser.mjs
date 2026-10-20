// Bingo 卡只写了「点一格盖章」、没写连成一线的反应（洛阳远亲认亲实录）：连成一线时描红那几格、盖一枚「连成一线」。
// 不是方阵、格里有单选、或归新交互驱动管的，都不接。
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
await page.evaluate(async q => { window.bingo = await import('/src/outputSanitizer/bingoLineRescue.js?' + q); }, query);
const cell = (on, extra = '') => `<label class="c"><input type="checkbox"${on ? ' checked' : ''}>${extra}<span class="s">章</span></label>`;
const face = (cells, cols = 3, attrs = '', title = 'Bingo') => `<details open><summary>${title}</summary><style>.b{display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px}.c{display:block;min-height:40px;border:1px solid #ccc}.c input{position:absolute;opacity:0;width:0;height:0}</style>
<div class="b"${attrs}>${cells.join('')}</div></details>`;
const mount = html => page.evaluate(html => { document.body.innerHTML = html; return bingo.installBingoLineRescue(document.querySelector('details')); }, html);
const state = () => page.evaluate(() => ({
    lines: document.querySelector('.b').getAttribute('data-rm-bingo-lines'),
    marked: [...document.querySelectorAll('.c')].map((c, i) => c.getAttribute('data-rm-bingo-line') ? i : -1).filter(i => i >= 0),
    seal: document.querySelector('[data-rm-bingo-seal]')?.textContent || null,
}));
let checks = 0;
assert.equal(await mount(face([1, 0, 0, 0, 1, 0, 0, 0, 1].map(on => cell(on)))), 1); checks++;
assert.deepEqual(await state(), { lines: '1', marked: [0, 4, 8], seal: null }); checks++;      // 打开时已经连上：描红，不盖新印
await page.locator('.c').nth(0).click(); await page.waitForTimeout(150);
assert.deepEqual(await state(), { lines: null, marked: [], seal: null }); checks++;
await page.locator('.c').nth(0).click(); await page.waitForTimeout(150);
assert.deepEqual(await state(), { lines: '1', marked: [0, 4, 8], seal: '连成一线' }); checks++;
await page.locator('.c').nth(1).click(); await page.locator('.c').nth(2).click(); await page.waitForTimeout(150);
assert.deepEqual(await state(), { lines: '2', marked: [0, 1, 2, 4, 8], seal: '连成两线' }); checks++;
// 印不挡格子：盖着印也能点中间那格。
await page.locator('.c').nth(4).click(); await page.waitForTimeout(150);
assert.equal((await state()).lines, '1'); checks++;
// 不接：8 格不成方阵、格里有单选、归驱动管。
assert.equal(await mount(face(Array.from({ length: 8 }, () => cell(0)), 3)), 0); checks++;
assert.equal(await mount(face(Array.from({ length: 9 }, (_, i) => i ? cell(0) : cell(0, '<input type="radio" name="r">')))), 0); checks++;
assert.equal(await mount(face(Array.from({ length: 9 }, () => cell(0)), 3, ' data-rm-ui="pick"')), 0); checks++;
// 看不出是 Bingo 的普通勾选清单：不接。
assert.equal(await mount(face(Array.from({ length: 9 }, () => cell(0)), 3, '', '待办')), 0); checks++;
// 列数和格数对不上（9 格排成 4 列）：不接。
assert.equal(await mount(face(Array.from({ length: 9 }, () => cell(0)), 4)), 0); checks++;
assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
