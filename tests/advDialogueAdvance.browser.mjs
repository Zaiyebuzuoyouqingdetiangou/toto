// 乙女游戏式对话框：整个对话框写成 data-rm-next，点一下推进下一句；走到最后一句停住。走真实的挂工具流程。
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
        const d = await mount(`<div data-rm-ui="pager"><div class="stage">立绘</div>
            <div class="box" data-rm-next role="button"><div data-rm-page>阿雪：第一句。</div><div data-rm-page>阿岩：第二句。</div><div data-rm-page>阿竹：第三句。</div><span>▼</span></div></div>`);
        const shown = () => [...d.querySelectorAll('[data-rm-page]')].map(n => getComputedStyle(n).display !== 'none' ? 1 : 0).join('');
        const r = { start: shown() };
        d.querySelector('.box').click(); await wait(60); r.one = shown();
        d.querySelector('.box').click(); await wait(60); r.two = shown();
        d.querySelector('.box').click(); await wait(60); r.end = shown();
        return r;
    });
    console.log(JSON.stringify(out));
    let checks = 0;
    assert.equal(out.start, '100'); checks++;
    assert.equal(out.one, '010'); checks++;
    assert.equal(out.two, '001'); checks++;
    assert.equal(out.end, '001'); checks++;
    assert.deepEqual(errors, []); checks++;
    console.log(`advDialogueAdvance: ${checks} checks passed`);
} finally {
    await browser?.close();
    server.close();
}
