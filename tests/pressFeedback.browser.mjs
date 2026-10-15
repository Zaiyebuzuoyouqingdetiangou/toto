// 本地浏览器测试：按下手感按外观分类，按住出现、松手撤掉；模型自己写了 :active 的、禁用的、标题栏不碰。
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
const face = `<details open><summary id="title" style="cursor:pointer">标题</summary><style>.own:active{transform:scale(.8)}</style>
<div style="padding:12px;font-size:16px">
<button id="raised" style="background:#e9b;border:0;padding:10px 16px;box-shadow:0 4px 0 #a35,0 6px 12px rgba(0,0,0,.2)">凸起键</button>
<button id="flat" style="background:#cde;border:1px solid #89a;padding:10px 16px">平按钮</button>
<button id="knob" style="width:40px;height:40px;border-radius:50%;background:#bbb;border:0"></button>
<label id="ink" style="cursor:pointer">纯文字选项</label>
<button id="own" class="own" style="background:#eee;border:0;padding:10px">自带按下</button>
<button id="tilted" style="background:#ffd;border:0;padding:10px;transform:rotate(-4deg)">歪着的卡</button>
<button id="off" disabled style="background:#eee;border:0;padding:10px">禁用</button>
<div id="card" style="cursor:pointer;background:#fff;border:1px solid #ccc;padding:10px"><b id="inner">整张可点的卡片</b></div>
<button id="nested" style="background:#cde;border:0;padding:14px 30px"><span id="nestedText" style="padding:2px">里面有小字</span></button>
<button id="flip" style="background:#fdd;border:0;padding:10px;transition:transform .6s ease">会翻面的牌</button>
<label id="huge" style="display:block;height:600px;background:#eef">整面都包进一个 label</label>
</div></details>`;
let browser, checks = 0;
try {
    browser = await chromium.launch();
    for (const width of [375, 1280]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        await page.goto(origin);
        await page.evaluate(async html => {
            document.body.innerHTML = html;
            const module = await import('/src/outputSanitizer/pressFeedback.js');
            module.installPressFeedback(document.querySelector('details'));
            module.installPressFeedback(document.querySelector('details')); // 重复安装不重复绑定
        }, face);
        const state = id => page.evaluate(id => { const el = document.getElementById(id); const s = getComputedStyle(el);
            return { kind: el.getAttribute('data-rm-press'), pressing: el.hasAttribute('data-rm-pressing'), transform: s.transform, shadow: s.boxShadow, filter: s.filter, opacity: s.opacity }; }, id);
        async function hold(id) {
            const box = await page.locator('#' + id).boundingBox();
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down(); await page.waitForTimeout(140);
            const during = await state(id);
            await page.mouse.up(); await page.waitForTimeout(260);
            return { during, after: await state(id) };
        }
        let r = await hold('raised');
        assert.equal(r.during.kind, 'raised'); assert.equal(r.during.transform, 'matrix(1, 0, 0, 1, 0, 2)', 'solid 4px base sinks 2px');
        assert.match(r.during.shadow, /inset/); assert.equal(r.after.pressing, false); assert.equal(r.after.transform, 'none'); checks += 4;
        assert.match(r.after.shadow, /0px 4px 0px/, 'original shadow back after release'); checks++;
        r = await hold('flat'); assert.equal(r.during.kind, 'flat'); assert.match(r.during.transform, /^matrix\(0\.97/); assert.equal(r.after.transform, 'none'); checks += 3;
        r = await hold('knob'); assert.equal(r.during.kind, 'knob'); assert.match(r.during.transform, /^matrix\(0\.92/); checks += 2;
        r = await hold('ink'); assert.equal(r.during.kind, 'ink'); assert.equal(r.during.opacity, '0.62'); assert.equal(r.after.opacity, '1'); checks += 3;
        r = await hold('own'); assert.equal(r.during.kind, null, 'author :active wins'); checks++;
        r = await hold('tilted'); assert.equal(r.during.kind, 'tint'); assert.match(r.during.transform, /^matrix\(0\.99/, 'own rotation kept'); checks += 2;
        r = await hold('off'); assert.equal(r.during.kind, null); checks++;
        r = await hold('inner'); assert.equal(await page.getAttribute('#card', 'data-rm-press'), 'flat', 'cursor:pointer card found from its text'); checks++;
        r = await hold('title'); assert.equal(r.during.kind, null, 'title bar untouched'); checks++;
        await page.evaluate(() => { document.querySelector('details').open = true; }); // 点标题会收起这一面，重新打开
        // 按住后鼠标移出按钮就松开。
        const box = await page.locator('#flat').boundingBox();
        await page.mouse.move(box.x + 10, box.y + 10); await page.mouse.down();
        await page.mouse.move(box.x + 10, box.y + 80, { steps: 4 });
        assert.equal((await state('flat')).pressing, false); await page.mouse.up(); checks++;
        // 按住按钮、在按钮里的小字和按钮边缘之间移动：手还按着，不能松开。
        const nb = await page.locator('#nestedText').boundingBox();
        await page.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2); await page.mouse.down();
        await page.mouse.move(nb.x - 6, nb.y + nb.height / 2, { steps: 2 }); await page.waitForTimeout(100);
        assert.equal((await state('nested')).pressing, true, 'leaving an inner span keeps the press'); checks++;
        await page.mouse.up(); await page.waitForTimeout(260);
        assert.equal((await state('nested')).pressing, false); checks++;
        // 自己写了过渡的（翻牌）：松手后不套兔子镜的回弹，模型的 0.6 秒照旧。
        const fb = await page.locator('#flip').boundingBox();
        await page.mouse.move(fb.x + 5, fb.y + 5); await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
        assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById('flip')).transitionDuration), '0.6s'); checks++;
        await page.waitForTimeout(260);
        // 手指按下后一滑（在滚动）就松开。
        const touchReleased = await page.evaluate(() => {
            const el = document.getElementById('flat'); const r = el.getBoundingClientRect();
            const opts = (y) => ({ bubbles: true, composed: true, pointerType: 'touch', isPrimary: true, clientX: r.x + 10, clientY: y, button: 0 });
            el.dispatchEvent(new PointerEvent('pointerdown', opts(r.y + 10)));
            const pressed = el.hasAttribute('data-rm-pressing');
            el.dispatchEvent(new PointerEvent('pointermove', opts(r.y + 40)));
            const after = el.hasAttribute('data-rm-pressing');
            el.dispatchEvent(new PointerEvent('pointerup', opts(r.y + 40)));
            return [pressed, after];
        });
        assert.deepEqual(touchReleased, [true, false]); checks++;
        await page.waitForTimeout(260);
        // 整面包进一个 label 的：不加。
        r = await hold('huge'); assert.equal(r.during.kind, null, 'whole-face label gets no press'); checks++;
        // 模型自己写的 data-rm-pressing 不会被当成兔子镜的状态（清洗器会去掉，这里只确认样式只认兔子镜加的属性组合）。
        assert.deepEqual(errors, []);
        await page.close();
    }
    console.log(JSON.stringify({ checks, widths: [375, 1280] }));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
