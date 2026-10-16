// 本地浏览器测试：「按正文挑签」的选签理由和签号，跟随正文生成时被宿主去掉标签、字露在标题下面（133 面）。
// 显示时按原始消息认出来删掉；对不上的正文不动；标签还在时整个删。
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const server = createServer(async (req, res) => {
    const p = new URL(req.url, 'http://x').pathname;
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset=utf-8><body>'); }
    res.setHeader('Content-Type', 'text/javascript');
    try { res.end(await readFile(path.join(root, decodeURIComponent(p)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/`);
const think = '正文停在22:15酒店806房间，床头柜上摆着贺铁山的名片。选签1，以夹着硬纸名片的旅行手账映照两人的初印象反差。';
const out = await page.evaluate(async think => {
    const mod = await import('/src/outputSanitizer/atmosphereThinkLeak.js');
    const raw = `<toto data-rabbit-mirror="true"><details><summary>【兔子镜：午夜算盘】</summary><rm-think>${think}</rm-think><rm-ticket>1</rm-ticket>\n<style>.a{}</style><div class="a">名片正文</div></details></toto>`;
    const results = {};
    // 1. 宿主去掉了标签、字连在一起露在标题后面（和 133 面一样，后面跟着宿主生成的空段落）。
    document.body.innerHTML = `<details open><summary>【兔子镜：午夜算盘】</summary>${think}1<p data-rm-body-contained="true"></p><style>.a{}</style><div class="a">名片正文</div></details>`;
    results.leakRemoved = mod.hideLeakedAtmosphereThink(document.body, raw);
    results.afterLeak = document.querySelector('details').textContent;
    // 2. 宿主把引号、强调变成了行内标签：照样认得出。
    document.body.innerHTML = `<details open><summary>标题</summary>正文停在22:15酒店806房间，床头柜上摆着<em>贺铁山</em>的名片。选签1，以夹着硬纸名片的旅行手账映照两人的初印象反差。1<div>名片正文</div></details>`;
    results.inlineRemoved = mod.hideLeakedAtmosphereThink(document.body, raw);
    results.afterInline = document.querySelector('details').textContent;
    // 3. 标题后面是模型自己写的正文（和原文里的理由对不上）：不动。
    document.body.innerHTML = `<details open><summary>标题</summary>这是一段画面里的说明文字<div>名片正文</div></details>`;
    results.untouched = mod.hideLeakedAtmosphereThink(document.body, raw);
    results.afterUntouched = document.querySelector('details').textContent;
    // 4. 标签还在：整个删。
    document.body.innerHTML = `<details open><summary>标题</summary><rm-think>${think}</rm-think><rm-ticket>1</rm-ticket><div>名片正文</div></details>`;
    results.tagRemoved = mod.hideLeakedAtmosphereThink(document.body, raw);
    results.afterTag = document.querySelector('details').textContent;
    // 5. 原始消息里没有挑签：什么都不做。
    document.body.innerHTML = `<details open><summary>标题</summary>1<div>名片正文</div></details>`;
    results.noRaw = mod.hideLeakedAtmosphereThink(document.body, '<toto><details><summary>标题</summary>1<div>名片正文</div></details></toto>');
    // 6. 原文里有 &amp; 和 Markdown 强调，宿主显示成「&」和斜体；理由被包成一个段落：照样认得出。
    const raw2 = '<toto><details><summary>标题</summary><rm-think>贺老板 &amp; 林若昭，*初见*反差。</rm-think><rm-ticket>2</rm-ticket><div>名片正文</div></details></toto>';
    document.body.innerHTML = `<details open><summary>标题</summary><p>贺老板 &amp; 林若昭，<em>初见</em>反差。2</p><div>名片正文</div></details>`;
    results.paragraphRemoved = mod.hideLeakedAtmosphereThink(document.body, raw2);
    results.afterParagraph = document.querySelector('details').textContent;
    // 7. 标题后第一个段落是模型自己的正文：不动。
    document.body.innerHTML = `<details open><summary>标题</summary><p>名片正文第一段</p><div>名片正文</div></details>`;
    results.paragraphKept = mod.hideLeakedAtmosphereThink(document.body, raw2);
    return results;
}, think);
assert.equal(out.paragraphRemoved, 1);
assert.equal(out.afterParagraph, '标题名片正文');
assert.equal(out.paragraphKept, 0);
assert.equal(out.leakRemoved, 1);
assert.equal(out.afterLeak.replace(/\s/g, ''), '【兔子镜：午夜算盘】.a{}名片正文');
assert.equal(out.inlineRemoved, 1);
assert.equal(out.afterInline, '标题名片正文');
assert.equal(out.untouched, 0);
assert.equal(out.afterUntouched, '标题这是一段画面里的说明文字名片正文');
assert.ok(out.tagRemoved >= 2);
assert.equal(out.afterTag, '标题名片正文');
assert.equal(out.noRaw, 0);
assert.deepEqual(errors, []);
console.log(JSON.stringify({ atmosphereThinkLeak: 'ok' }));
await browser.close(); server.close();
