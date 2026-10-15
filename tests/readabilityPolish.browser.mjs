// 本地浏览器测试：读得舒服的几项当场修——字太小、中文行距太挤、字贴边、按钮太小；改了会撑破框的撤回；兔子镜自己的标题不碰。
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
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body style="margin:0">'); }
    res.setHeader('Content-Type', 'text/javascript');
    try { res.end(await readFile(path.join(rootDir, decodeURIComponent(pathname)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const para = '他今天又来了，带着一束花和一封信，站在门口等了很久很久，才终于敲门。';
const face = `<details open><summary style="font-size:10px">标题很小也不碰它</summary><div style="padding:12px">
<p id="tiny" style="font-size:10px">这是一行很小的说明文字</p>
<span id="icon" style="font-size:10px">✕</span>
<div style="width:60px;height:14px;overflow:hidden"><span id="boxed" style="font-size:10px;white-space:nowrap">塞得刚好的小字标签</span></div>
<p id="tight" style="font-size:14px;line-height:1.2">${para}</p>
<div style="height:40px;overflow:hidden"><p id="tightBox" style="font-size:14px;line-height:1.2;margin:0">${para}</p></div>
<div id="chip" style="background:#e9d;padding:0;width:200px">贴着边的有底色文字</div>
<button id="dot" style="width:16px;height:16px;padding:0;border-radius:50%;border:0;background:#888"></button>
</div></details>`;
let browser;
try {
    browser = await chromium.launch();
    for (const width of [375, 1280]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = []; page.on('pageerror', e => errors.push(e.message));
        await page.goto(origin);
        await page.evaluate(async html => {
            document.body.innerHTML = html;
            (await import('/src/outputSanitizer/readabilityPolish.js')).installReadabilityPolish(document.querySelector('details'));
        }, face);
        const fs = id => page.evaluate(id => getComputedStyle(document.getElementById(id)).fontSize, id);
        const lh = id => page.evaluate(id => { const s = getComputedStyle(document.getElementById(id)); return parseFloat(s.lineHeight) / parseFloat(s.fontSize); }, id);
        if (width < 500) {
            assert.equal(await fs('tiny'), '12px', 'small body text grows on phones');
            assert.equal(await fs('icon'), '10px', 'one-character marks stay');
            assert.equal(await fs('boxed'), '10px', 'growing would overflow the fixed box, so it is undone');
        } else {
            assert.equal(await fs('tiny'), '10px', 'desktop text size untouched');
        }
        assert.ok(Math.abs(await lh('tight') - 1.6) < 0.01, 'tight Chinese paragraph opens up');
        // 固定高度、会裁掉的框：放大行距后放得下就放大，放不下就保持原样——无论如何不能被裁掉。
        assert.ok(await page.evaluate(() => { const box = document.getElementById('tightBox').parentElement; return box.scrollHeight <= box.clientHeight; }), 'fixed clipped box never overflows');
        if (width < 500) assert.ok(Math.abs(await lh('tightBox') - 1.2) < 0.01, 'two lines would not fit, so it stays');
        assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById('chip')).paddingLeft), '8px');
        assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('summary')).fontSize), '10px', 'title chrome untouched');
        assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('details')).lineBreak), 'strict');
        // 小圆点：在它外面 4px 处点，也算点到它。
        const clicked = await page.evaluate(() => new Promise(resolve => {
            const dot = document.getElementById('dot'); const r = dot.getBoundingClientRect();
            dot.addEventListener('click', () => resolve(true), { once: true });
            document.elementFromPoint(r.right + 4, r.top + r.height / 2)?.click();
            setTimeout(() => resolve(false), 100);
        }));
        assert.equal(clicked, true, 'tap area of a tiny button grows');
        assert.equal(await page.evaluate(() => { const r = document.getElementById('dot').getBoundingClientRect(); return [r.width, r.height].join(); }), '16,16', 'its look stays the same');
        assert.deepEqual(errors, []);
        await page.close();
    }
    console.log(JSON.stringify({ readability: 'ok', widths: [375, 1280] }));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
