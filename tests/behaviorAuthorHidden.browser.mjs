// 模型把分页写成 .页{display:none} .页[data-rm-active]{display:block}，再用驱动按 data-rm-show 切换（实际遇到过：点哪一页都是空的）。
// 驱动显示一页时照模型的写法挂上 data-rm-active（只挂记号，不写内联样式：表格行、窄屏故意藏的都按模型自己的样式）；
// 切走或交还时撤掉自己挂的，不动模型自己写的。
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
const result = await page.evaluate(async q => {
    const br = await import('/src/outputSanitizer/behaviorResults.js?' + q);
    document.body.innerHTML = `<style>.tab{display:none}.tab[data-rm-active]{display:block}.bare{display:none}tr.row{display:none}tr.row[data-rm-active]{display:table-row}</style>
<div data-rm-ui="pick"><div class="tab" id="a" data-rm-show="a">甲</div><div class="tab" id="b" data-rm-show="b">乙</div>
<div class="bare" id="c" data-rm-show="c">丙</div><div class="tab" id="own" data-rm-active="true" data-rm-show="own">模型自己标的</div><div id="plain" data-rm-show="plain">普通</div><table><tbody><tr class="row" id="r" data-rm-show="r"><td>行</td></tr></tbody></table></div>`;
    const group = document.querySelector('[data-rm-ui]');
    const d = id => getComputedStyle(document.getElementById(id)).display;
    const out = {};
    br.updateBehaviorShows(group, new Set(['a', 'c', 'plain', 'r']));
    out.first = { a: d('a'), b: d('b'), c: d('c'), plain: d('plain'), plainInline: document.getElementById('plain').style.display, aActive: document.getElementById('a').getAttribute('data-rm-active'), r: d('r') };
    br.updateBehaviorShows(group, new Set(['b', 'own']));
    out.second = { a: d('a'), b: d('b'), c: d('c'), own: d('own'), aActive: document.getElementById('a').hasAttribute('data-rm-active') };
    br.updateBehaviorShows(group, new Set(['a']));
    out.third = { a: d('a'), own: d('own'), ownActive: document.getElementById('own').getAttribute('data-rm-active'), cInline: document.getElementById('c').style.getPropertyValue('display') };
    // 交还给模型自己的 CSS：撤掉自己挂的记号，模型的默认隐藏重新生效。
    br.releaseBehaviorShow(document.getElementById('a'));
    out.released = { a: d('a'), aActive: document.getElementById('a').hasAttribute('data-rm-active'), marker: document.getElementById('a').hasAttribute('data-rm-result-forced-active') };
    // 翻页等直接显隐的驱动不走这一套。
    const pg = document.createElement('div'); pg.className = 'tab'; document.body.append(pg);
    br.setBehaviorNodeVisible(pg, true);
    out.direct = pg.hasAttribute('data-rm-active');
    return out;
}, query);
let checks = 0;
assert.deepEqual(result.first, { a: 'block', b: 'none', c: 'none', plain: 'block', plainInline: '', aActive: 'true', r: 'table-row' }); checks++;
assert.deepEqual(result.second, { a: 'none', b: 'block', c: 'none', own: 'block', aActive: false }); checks++;
assert.deepEqual(result.third, { a: 'block', own: 'none', ownActive: 'true', cInline: 'none' }); checks++;
assert.deepEqual(result.released, { a: 'none', aActive: false, marker: false }); checks++;
assert.equal(result.direct, false); checks++;
assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
