// 一排按钮配一排结果按顺序对上；兔子镜里面的折叠块不当成另一面（不挂第二只维修兔）。
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
    await page.evaluate(async query => {
        window.orphan = await import('/src/outputSanitizer/orphanStateWiring.js?' + query);
        window.rt = await import('/src/outputSanitizer/runtime.js?' + query);
    }, query);
    const result = await page.evaluate(() => {
        const out = {};
        const face = panels => `<style>.fb{display:none}.fb.on{display:block}.grp{display:flex}</style>
<div class="btn-group grp"><button class="b1">一</button><button class="b2">二</button></div>${panels}`;
        // 一排两个按钮、后面两块结果：第几个按钮开第几块
        document.body.innerHTML = face('<div class="fb p1">阿雪</div><div class="fb p2">阿岩</div>');
        for (const p of document.querySelectorAll('.fb')) orphan.attachOrphanStateToggle(p, 'on');
        document.querySelector('.b2').click();
        out.fresh = [...document.querySelectorAll('.fb')].map(p => p.classList.contains('on'));
        out.groupNotTrigger = !document.querySelector('.grp').hasAttribute('data-rm-orphan-state-trigger');
        // 旧存档：整排当一个开关、两块都开着 → 打开时撤掉，改成一一对上
        document.body.innerHTML = face('<div class="fb p1 on" data-rm-orphan-state-wired="on" data-rm-orphan-state-key="k1">阿雪</div><div class="fb p2 on" data-rm-orphan-state-wired="on" data-rm-orphan-state-key="k2">阿岩</div>')
            .replace('class="btn-group grp"', 'class="btn-group grp" data-rm-orphan-state-trigger="k1 k2" role="button" tabindex="0"');
        orphan.rearmOrphanStateWiring(document.body);
        document.querySelector('.b1').click();
        out.saved = [...document.querySelectorAll('.fb')].map(p => p.classList.contains('on'));
        out.savedGroupCleared = !document.querySelector('.grp').hasAttribute('data-rm-orphan-state-trigger') && !document.querySelector('.grp').hasAttribute('role');
        // 第一块默认开着：照样一一对上
        document.body.innerHTML = face('<div class="fb p1 on">阿雪</div><div class="fb p2">阿岩</div>');
        out.openFirst = [...document.querySelectorAll('.fb')].map(p => orphan.attachOrphanStateToggle(p, 'on'));
        document.querySelector('.b2').click();
        out.openFirstState = [...document.querySelectorAll('.fb')].map(p => p.classList.contains('on'));
        // 单个按钮后面两块（都藏着）：和以前一样一个按钮开两块
        document.body.innerHTML = `<style>.fb{display:none}.fb.on{display:block}</style><button class="a">开</button><div class="fb pa">阿竹</div><div class="fb pb">阿松</div>`;
        out.single = [...document.querySelectorAll('.fb')].map(p => orphan.attachOrphanStateToggle(p, 'on'));
                // 兔子镜里面又包一层带作用域的 div，里面的折叠块不算另一面
        document.body.innerHTML = `<details data-rabbit-mirror-css-scope="rmcss-a1"><summary>【兔子镜：甲】</summary><div data-rabbit-mirror-css-scope="rmcss-a1"><details class="inner"><summary>说明</summary></details></div></details>`;
        out.outer = rt.isRabbitMirrorDetails(document.querySelector('details'));
        out.inner = rt.isRabbitMirrorDetails(document.querySelector('.inner'));
        return out;
    });
    assert.deepEqual(result, { fresh: [false, true], groupNotTrigger: true, saved: [false, true], savedGroupCleared: true, openFirst: [true, true], openFirstState: [true, true], single: [true, true], outer: true, inner: false });
    assert.deepEqual(errors, []);
    console.log('multiButtonAndNested ok');
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
