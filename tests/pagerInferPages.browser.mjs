// 翻页区没标 data-rm-page、页靠模型自己的 [data-rm-index="0"] .第一页 CSS 显示：按 CSS 认出页，页码照模型从 0 数。
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
    const repair = await import('/src/outputSanitizer/behaviorRepair.js?' + q);
    const driver = await import('/src/outputSanitizer/behaviorInteractions.js?' + q);
    const run = async (html, clicks) => {
        document.body.innerHTML = html;
        const root = document.body.firstElementChild;
        const repaired = repair.repairBehaviorDeclarations(root);
        driver.installBehaviorInteractions(root);
        const group = root.querySelector('[data-rm-ui="pager"]');
        const shown = () => [...root.querySelectorAll('.pg')].map(n => getComputedStyle(n).display === 'none' ? '.' : 'V').join('');
        const out = [`${group.getAttribute('data-rm-index')}:${shown()}`];
        for (const sel of clicks) {
            [...root.querySelectorAll(sel)].find(b => b.getBoundingClientRect().height)?.click();
            await new Promise(r => setTimeout(r, 30));
            out.push(`${group.getAttribute('data-rm-index')}:${shown()}`);
        }
        return { repaired, out, base: group.getAttribute('data-rm-index-base') };
    };
    const pages = (from) => [0, 1, 2].map(i => `<div class="pg p${i + from}">页${i}<button data-rm-prev>上</button><button data-rm-next>下</button></div>`).join('');
    const css = from => `<style>.pg{display:none}${[0, 1, 2].map(i => `[data-rm-index="${i + from}"] .p${i + from}{display:block}`).join('')}</style>`;
    return {
        zero: await run(`<div>${css(0)}<div data-rm-ui="pager" data-rm-index="0">${pages(0)}</div></div>`, ['[data-rm-next]', '[data-rm-next]', '[data-rm-prev]']),
        one: await run(`<div>${css(1)}<div data-rm-ui="pager" data-rm-index="1">${pages(1)}</div></div>`, ['[data-rm-next]']),
        // 一个编号对上两个元素：不认
        goto: await run(`<div>${css(0)}<div data-rm-ui="pager" data-rm-index="0">${pages(0)}<button data-rm-goto="2" class="g">末页</button><button data-rm-goto="0" class="g0">首页</button></div></div>`, ['.g', '.g0']),
        // 写成 carousel、里面放的却是 data-rm-pick：仍按选择区，不当翻页
        carousel: await (async () => { document.body.innerHTML = `<div>${css(0)}<div data-rm-ui="carousel"><button data-rm-pick="a">甲</button><div class="pg p0" data-rm-show="a">页</div><div class="pg p1">页</div></div></div>`; repair.repairBehaviorDeclarations(document.body.firstElementChild); return document.querySelector('[data-rm-ui]').getAttribute('data-rm-ui'); })(),
        // 只点亮指示点（空圆点）的规则：不当页
        dots: await (async () => { document.body.innerHTML = `<div><style>[data-rm-index="0"] .d0,[data-rm-index="1"] .d1{opacity:1}</style><div data-rm-ui="pager" data-rm-index="0"><i class="d0"></i><i class="d1"></i><button data-rm-next>下</button></div></div>`; return repair.repairBehaviorDeclarations(document.body.firstElementChild); })(),
        // 页标了 data-rm-page，但装饰（页码圆点）的 CSS 从 0 数：页码也照 0 数写，圆点跟着对上
        marked: await (async () => {
            document.body.innerHTML = `<div><style>.dot{opacity:.2}[data-rm-index="0"] .d0,[data-rm-index="1"] .d1,[data-rm-index="2"] .d2{opacity:1}</style><div data-rm-ui="pager"><div data-rm-page class="pg">一<button data-rm-next>下</button></div><div data-rm-page class="pg">二<button data-rm-next>下</button></div><div data-rm-page class="pg">三</div><i class="dot d0">·</i><i class="dot d1">·</i><i class="dot d2">·</i></div></div>`;
            const root = document.body.firstElementChild; repair.repairBehaviorDeclarations(root); driver.installBehaviorInteractions(root);
            const lit = () => [...root.querySelectorAll('.dot')].map(n => getComputedStyle(n).opacity === '1' ? 'o' : '.').join('');
            const out = [lit()];
            [...root.querySelectorAll('[data-rm-next]')].find(b => b.getBoundingClientRect().height)?.click();
            await new Promise(r => setTimeout(r, 30)); out.push(lit());
            return out;
        })(),
        // 同一面里的转盘按 0 数（.dial[data-rm-index="0"]），翻页自己按 1 数写跳页按钮：翻页不能被带成从 0 数
        dial: await (async () => {
            document.body.innerHTML = `<div><style>.dial[data-rm-index="0"] .pg{color:red}.dial[data-rm-index="1"] .pg{color:blue}</style><div class="dial" data-rm-ui="turn" data-rm-stops="2"><span data-rm-knob>钮</span></div><div data-rm-ui="pager"><div data-rm-page class="pg">一</div><div data-rm-page class="pg">二</div><div data-rm-page class="pg">三</div><button data-rm-goto="1" class="g1">1</button><button data-rm-goto="3" class="g3">3</button></div></div>`;
            const root = document.body.firstElementChild; repair.repairBehaviorDeclarations(root); driver.installBehaviorInteractions(root);
            const pager = root.querySelector('[data-rm-ui="pager"]');
            const shown = () => [...pager.querySelectorAll('.pg')].map(n => getComputedStyle(n).display === 'none' ? '.' : 'V').join('');
            const out = [pager.getAttribute('data-rm-index-base')];
            root.querySelector('.g3').click(); await new Promise(r => setTimeout(r, 30)); out.push(shown());
            root.querySelector('.g1').click(); await new Promise(r => setTimeout(r, 30)); out.push(shown());
            return out;
        })(),
        // 跨面继承：页标了 data-rm-page、只有圆点按 0 数，上次停在第 2 页，重新打开还在第 2 页
        carry: await (async () => {
            const html = `<div><style>[data-rm-index="0"] .d0,[data-rm-index="1"] .d1,[data-rm-index="2"] .d2{opacity:1}</style><div data-rm-ui="pager" data-rm-memory="翻页记忆"><div data-rm-page class="pg">一<button data-rm-next>下</button></div><div data-rm-page class="pg">二</div><div data-rm-page class="pg">三</div><i class="d0">·</i><i class="d1">·</i><i class="d2">·</i></div></div>`;
            document.body.innerHTML = html;
            let root = document.body.firstElementChild; repair.repairBehaviorDeclarations(root); driver.installBehaviorInteractions(root);
            root.querySelector('[data-rm-next]').click(); await new Promise(r => setTimeout(r, 80));
            document.body.innerHTML = html;
            root = document.body.firstElementChild; repair.repairBehaviorDeclarations(root); driver.installBehaviorInteractions(root);
            await new Promise(r => setTimeout(r, 30));
            return [...root.querySelectorAll('.pg')].map(n => getComputedStyle(n).display === 'none' ? '.' : 'V').join('');
        })(),
        ambiguous: await run(`<div><style>.pg{display:none}[data-rm-index="0"] .pg{display:block}[data-rm-index="1"] .p1{display:block}</style><div data-rm-ui="pager" data-rm-index="0">${pages(0)}</div></div>`, []),
    };
}, query);
let checks = 0;
assert.equal(result.zero.base, '0'); checks++;
assert.deepEqual(result.zero.out, ['0:V..', '1:.V.', '2:..V', '1:.V.']); checks++;
assert.equal(result.one.base, null); checks++;
assert.deepEqual(result.one.out, ['1:V..', '2:.V.']); checks++;
assert.equal(result.ambiguous.repaired, 0); checks++;
assert.deepEqual(result.goto.out, ['0:V..', '2:..V', '0:V..'], '跳页按钮也按 0 数'); checks++;
assert.notEqual(result.carousel, 'pager'); checks++;
assert.equal(result.dots, 0); checks++;
assert.deepEqual(result.carry, '.V.', '跨面继承回到上次那一页，不多翻一页'); checks++;
assert.deepEqual(result.dial, [null, '..V', 'V..'], '别的转盘按 0 数不影响这个翻页'); checks++;
assert.deepEqual(result.marked, ['o..', '.o.'], '标了页、只有装饰按 0 数时也对得上'); checks++;
assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
