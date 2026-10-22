// 一格一格走的滑杆（有声书进度 1–3）配 data-rm-show="p1/p2/p3"：拖到第几格显示第几段字幕。
// 动画状态（骰子 .rolling）配一个按钮，按一下动一会儿。走真实的挂工具流程。
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
    if (p === '/extensions.js') return res.end('export const extension_settings = {}; export const getContext = () => ({});');
    if (p === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){}}; export const event_types = {};');
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    try { res.end(await readFile(path.join(rootDir, decodeURIComponent(p)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 440, height: 900 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin);
    const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
    await page.evaluate(async q => {
        window.__q = q; window.san = await import('/src/outputSanitizer.js?' + q);
        window.tc = await import('/src/outputSanitizer/toolsChrome.js?' + q);
        const rt = await import('/src/ui/runtime.js?' + q);
        window.__rabbitMirrorRuntimeVersion = rt.RUNTIME_VERSION;
        window.mount = async html => {
            document.body.innerHTML = `<div id="chat"><div class="mes" mesid="1"><div class="mes_text"><details open data-rabbit-mirror-css-scope="rmcss-t1"><summary>t</summary>${html}<p>${'字'.repeat(80)}</p></details></div></div></div>`;
            const d = document.querySelector('details');
            san.isolateRabbitMirrorInteractionIds(d);
            tc.installMaintenanceRabbitsInScope(document.querySelector('#chat'));
            await new Promise(r => setTimeout(r, 300));
            return d;
        };
        window.wait = ms => new Promise(r => setTimeout(r, ms));
    }, query);
    const out = await page.evaluate(async () => {
        const d = await mount(`<style>.cap{color:#ccc}</style><div class="player" data-rm-ui="motion">
            <div data-rm-show="p1">阿雪的第一段</div><div data-rm-show="p2">阿岩的第二段</div><div data-rm-show="step3">阿竹的第三段</div>
            <input type="range" min="1" max="3" step="1" value="1" data-rm-part="progress">
            <button type="button" data-rm-play="toggle">播放</button></div>`);
        const shown = () => [...d.querySelectorAll('[data-rm-show]')].map(n => getComputedStyle(n).display !== 'none' ? 1 : 0).join('');
        const r = { start: shown() };
        const range = d.querySelector('input[type=range]');
        range.value = 2; range.dispatchEvent(new Event('input', { bubbles: true })); await wait(50); r.two = shown();
        range.value = 3; range.dispatchEvent(new Event('input', { bubbles: true })); await wait(50); r.three = shown();
        const { inspectBehaviorDialect } = await import('/src/outputSanitizer/behaviorDialect.js?' + window.__q).catch(() => ({}));
        r.unmatched = inspectBehaviorDialect ? inspectBehaviorDialect(d).unmatched.length : -1;
        // 选项区域里另有一根滑杆：格号不当状态，没选的不会冒出来
        const d2 = await mount(`<div data-rm-ui="pick"><button data-rm-pick="s1">一</button><button data-rm-pick="s2">二</button><button data-rm-pick="s3">三</button>
            <input type="range" min="1" max="5" value="3"><div data-rm-show="s1">阿雪</div><div data-rm-show="s2">阿岩</div><div data-rm-show="s3">阿竹</div></div>`);
        r.pickStart = [...d2.querySelectorAll('[data-rm-show]')].map(n => getComputedStyle(n).display !== 'none' ? 1 : 0).join('');
        return r;
    });
    assert.equal(out.start, '100');
    assert.equal(out.two, '010');
    assert.equal(out.three, '001');
    assert.equal(out.unmatched, 0);
    assert.equal(out.pickStart, '000');
    assert.deepEqual(errors, []);
    console.log('stepRangeShow ok');
} finally {
    await browser?.close();
    server.close();
}
