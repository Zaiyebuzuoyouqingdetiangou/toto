// 卡片外面游离的 Markdown（## 标题、**重点**）不再原样露出；画面说明搬走后留下的空折叠一并收掉。
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
    res.setHeader('Content-Type', 'text/javascript');
    if (pathname === '/extensions.js') return res.end('export const extension_settings = {};');
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced=()=>{}; export const setExtensionPrompt=()=>{}; export const extension_prompt_types={}; export const extension_prompt_roles={}; export const eventSource={on(){},removeListener(){}}; export const event_types={};');
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body>'); }
    const file = path.resolve(rootDir, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(rootDir + path.sep)) { res.statusCode = 403; return res.end(); }
    try { res.end(await readFile(file)); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 400, height: 900 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    await page.goto(origin);
    const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
    await page.evaluate(async query => { window.chrome = await import('/src/outputSanitizer/toolsChrome.js?' + query); }, query);
    const out = await page.evaluate(async query => {
        window.SillyTavern = { getContext: () => ({ chat: [], chatId: 'c' }) };
        const image = await import('/src/builtinImage.js?' + query);
        const md = await import('/src/outputSanitizer/looseMarkdown.js?' + query);
        const r = {};
        // 1. 卡片外的 ## 标题和 **重点**
        document.body.innerHTML = `<details open data-rabbit-mirror-css-scope="rmcss-t1"><summary data-rm-title-chrome="true">【兔子镜：字】</summary><context>## 阿雪的热榜 **阿岩**
<div class="card">## 卡里的 **不动**</div></context></details>`;
        const d = document.querySelector('details');
        r.changed = md.tidyLooseMarkdown(d);
        const ctx = d.querySelector('context');
        r.heading = ctx.querySelector('[data-rm-md-heading]')?.textContent;
        r.cardKept = ctx.querySelector('.card').textContent;
        r.outsideHash = (ctx.textContent.replace(ctx.querySelector('.card').textContent, '')).includes('#');
        r.again = md.tidyLooseMarkdown(d);
        // 2. 多行：普通文字里夹着标题和加粗
        document.body.innerHTML = `<details open data-rabbit-mirror-css-scope="rmcss-t2"><summary data-rm-title-chrome="true">t</summary><context>前面一句
### 小标题
后面 **重点** 一句<div>x</div></context></details>`;
        md.tidyLooseMarkdown(document.querySelector('details'));
        const c2 = document.querySelector('context');
        r.multi = { headings: c2.querySelectorAll('[data-rm-md-heading]').length, bold: c2.querySelectorAll('b').length, hasStar: c2.textContent.includes('**'), hasHash: c2.textContent.includes('#') };
        // 3. 代码里的 # 和 ** 不动；不是 # 开头的（#标签、C#）不动
        document.body.innerHTML = `<details open data-rabbit-mirror-css-scope="rmcss-t3"><summary data-rm-title-chrome="true">t</summary><pre>## 代码 **x**</pre><context>#神都八卦 和 C# 都留着</context></details>`;
        const n3 = md.tidyLooseMarkdown(document.querySelector('details'));
        r.keep = { n3, pre: document.querySelector('pre').textContent, tag: document.querySelector('context').textContent };
        // 4. 画面说明包在看得见的折叠里：搬走后空折叠收掉
        document.body.innerHTML = `<toto><details open data-rabbit-mirror-css-scope="rmcss-t4"><summary data-rm-title-chrome="true">【兔子镜：字】</summary><div class="card"><figure data-rm-draw-frame="1"></figure></div><details><summary>画面说明与画风配置</summary><div data-rm-draw-notes="1" hidden><p data-rm-draw-prompt="1">阿雪坐在窗边</p></div></details></details></toto>`;
        const moved = image.adoptDrawNotes(document.querySelector('toto'));
        r.shell = { moved, inner: document.querySelectorAll('details').length, prompt: document.querySelector('figure [data-rm-draw-prompt]')?.textContent };
        // 5. 折叠里除了说明还有别的字：折叠留着
        document.body.innerHTML = `<toto><details open data-rabbit-mirror-css-scope="rmcss-t5"><summary data-rm-title-chrome="true">【兔子镜：字】</summary><figure data-rm-draw-frame="1"></figure><details><summary>备注</summary><p>阿竹的话</p><div data-rm-draw-notes="1" hidden><p data-rm-draw-prompt="1">阿松</p></div></details></details></toto>`;
        image.adoptDrawNotes(document.querySelector('toto'));
        r.keepShell = document.querySelectorAll('details').length;
        // 6. 评审补的几种
        const run = html => { document.body.innerHTML = `<details open data-rabbit-mirror-css-scope="rmcss-t6"><summary data-rm-title-chrome="true">t</summary>${html}</details>`; const d6 = document.querySelector('details'); const n = md.tidyLooseMarkdown(d6); return { n, d6 }; };
        r.hashEnd = run('<context>## 学习 C#</context>').d6.querySelector('[data-rm-md-heading]')?.textContent;
        r.cardDirect = run('<div class="card">## 卡 **粗**</div><div data-rm-draw-notes hidden>画风：**水彩**</div>').d6.innerHTML.includes('data-rm-md-heading') || run('<div class="card">## 卡 **粗**</div><div data-rm-draw-notes hidden>画风：**水彩**</div>').d6.querySelectorAll('b').length;
        { const { n, d6 } = run('<context>**未闭合 的话</context>'); const before = d6.querySelector('context').firstChild; md.tidyLooseMarkdown(d6); r.unpaired = { n, same: d6.querySelector('context').firstChild === before }; }
        r.power = run('<context>x**2 + y**2 = 5</context>').d6.querySelector('context').innerHTML;
        r.badOrder = run('<context>**未配对 事项，然后 **加粗** 结尾</context>').d6.querySelector('context').innerHTML;
        r.midline = run('<context><a href="#">链</a> # 3 号房</context>').d6.querySelectorAll('[data-rm-md-heading]').length;
        document.body.innerHTML = `<toto><details open data-rabbit-mirror-css-scope="rmcss-t7"><summary data-rm-title-chrome="true">【兔子镜：字】</summary><figure data-rm-draw-frame="1"></figure><details><summary>外</summary><details><summary>内</summary><div data-rm-draw-notes="1" hidden><p data-rm-draw-prompt="1">阿雪</p></div></details></details></details></toto>`;
        image.adoptDrawNotes(document.querySelector('toto'));
        r.nested = document.querySelectorAll('details').length;
        return r;
    }, query);
    assert.equal(out.hashEnd, '学习 C#');
    assert.equal(out.cardDirect, 0);
    assert.deepEqual(out.unpaired, { n: 0, same: true });
    assert.equal(out.power, 'x**2 + y**2 = 5');
    assert.equal(out.badOrder.includes('<b>加粗</b>'), true);
    assert.equal(out.midline, 0);
    assert.equal(out.nested, 1);
    assert.equal(out.changed, 1);
    assert.equal(out.heading, '阿雪的热榜 **阿岩**'.replace('**阿岩**', '阿岩'));
    assert.equal(out.cardKept, '## 卡里的 **不动**');
    assert.equal(out.outsideHash, false);
    assert.equal(out.again, 0);
    assert.deepEqual(out.multi, { headings: 1, bold: 1, hasStar: false, hasHash: false });
    assert.deepEqual(out.keep, { n3: 0, pre: '## 代码 **x**', tag: '#神都八卦 和 C# 都留着' });
    assert.deepEqual(out.shell, { moved: 1, inner: 1, prompt: '阿雪坐在窗边' });
    assert.equal(out.keepShell, 2);
    assert.deepEqual(errors, []);
    console.log('looseMarkdownAndNotesShell ok');
} finally {
    await browser?.close();
    server.close();
}
