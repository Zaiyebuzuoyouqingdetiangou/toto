// 测验：查看结果的按钮单独包在一行操作区里，结果卡紧跟在这一行后面（默认 display:none，靠被拿掉的脚本显示）。
// 点按钮显示结果；结果里的「重新测试」收起结果、清掉已选的选项。走真实的挂工具流程。
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
        const q = n => `<div class="q-group"><div class="q-title">${n}. 阿雪会怎么做？</div>${['A', 'B', 'C'].map(v => `<label class="q-option"><input type="radio" name="q${n}" value="${v}"><span class="opt-text">${v}. 字字字字字字</span></label>`).join('')}</div>`;
        const html = `<style>.q-option{display:flex;cursor:pointer}.q-option input{position:absolute;opacity:0}.result-card{display:none;padding:12px}.btn-submit{width:100%}</style>
            <div class="card"><h1 class="t">【某城测验】阿雪醒来以后</h1>${q(1)}${q(2)}
            <div class="q-actions"><button type="button" class="btn-submit" id="submitBtn">查看测试诊断报告</button></div>
            <div class="result-card" id="resultArea"><div class="res-title">【阿岩型】</div><div class="res-desc">字字字字字字字字字字字字字字字字字字字字字字字字字字</div><button type="button" class="btn-reset" id="resetBtn">重新测试</button></div></div>`;
        const d = await mount(html);
        const shown = () => getComputedStyle(d.querySelector('.result-card')).display !== 'none';
        const checked = () => [...d.querySelectorAll('input:checked')].length;
        const r = { start: shown() };
        d.querySelectorAll('.q-group')[0].querySelectorAll('input')[1].click(); d.querySelectorAll('.q-group')[1].querySelectorAll('input')[0].click(); await wait(50);
        r.picked = checked();
        d.querySelector('.btn-submit').click(); await wait(320); r.afterSubmit = shown();
        d.querySelector('.btn-reset').click(); await wait(320); r.afterReset = shown(); r.cleared = checked();
        d.querySelector('.btn-submit').click(); await wait(320); r.again = shown();
        return r;
    });
    console.log(JSON.stringify(out));
    let checks = 0;
    assert.equal(out.start, false); checks++;
    assert.equal(out.picked, 2); checks++;
    assert.equal(out.afterSubmit, true); checks++;
    assert.equal(out.afterReset, false); checks++;
    assert.equal(out.cleared, 0); checks++;
    assert.equal(out.again, true); checks++;
    assert.deepEqual(errors, []); checks++;
    console.log(`wrappedResultButton: ${checks} checks passed`);
} finally {
    await browser?.close();
    server.close();
}
