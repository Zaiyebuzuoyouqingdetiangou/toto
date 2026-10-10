// Exercise real rescue listeners with local host stubs; no private text is stored.
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
const fixture = `<details open><summary>选择内容</summary><style>
input{display:none}.panel{display:none}label{display:inline-block;padding:16px;margin:4px}
#first:checked ~ .panels .first,#second:checked ~ .panels .second,#third:checked ~ .panels .third{display:block}
</style><input type="radio" name="scene" id="first" checked><input type="radio" name="scene" id="second"><input type="radio" name="scene" id="third">
<div class="panels"><p class="panel first">第一段原创示例内容。</p><p class="panel second">第二段原创示例内容。</p><p class="panel third">第三段原创示例内容。</p></div>
<nav><label for="second">选择二</label><label for="third">选择三</label><label for="first">重置</label></nav></details>`;
let browser, checks = 0;
try {
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
    for (const width of [375, 1280]) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 500, hasTouch: width < 500 });
        const page = await context.newPage(), errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
        await page.goto(origin);
        const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
        await page.evaluate(async query => { window.ids = await import('/src/outputSanitizer/idsAndRearm.js?' + query); }, query);
        async function mount(html) {
            await page.evaluate(html => {
                document.body.innerHTML = html;
                const root = document.querySelector('details'); root.open = true;
                ids.rearmRabbitMirrorSerializedInteractionRoot(root); ids.activateRabbitMirrorInteractionRescue(root);
                window.changes = [];
                root.addEventListener('change', () => changes.push([...root.querySelectorAll('input')].findIndex(input => input.checked)));
            }, html);
        }
        async function press(index) {
            if (width < 500) await page.locator('label').nth(index).tap(); else await page.locator('label').nth(index).click();
        }
        const selected = () => page.evaluate(() => [...document.querySelectorAll('input')].findIndex(input => input.checked));
        await mount(fixture);
        await press(0); await page.waitForTimeout(300);
        await page.evaluate(() => { changes.length = 0; });
        await press(0); await page.waitForTimeout(300);
        assert.equal(await selected(), 1); checks++;
        assert.deepEqual(await page.evaluate(() => changes), [], 'an explicit reset means repeated selection must not transiently reset'); checks++;
        await press(1); await press(2); await page.waitForTimeout(300);
        assert.equal(await selected(), 0, 'the authored reset still works'); checks++;
        // Consecutive actions in one host task expose older zero-delay corrections.
        await page.evaluate(() => { changes.length = 0; const labels = document.querySelectorAll('label'); labels[0].click(); labels[1].click(); });
        await page.waitForTimeout(300);
        assert.equal(await selected(), 2); checks++;
        assert.deepEqual(await page.evaluate(() => changes), [1, 2], 'an earlier click cannot reclaim the group after the next click'); checks++;
        // Without a reachable reset, retain the existing tap-again return route.
        await mount(fixture.replace('<label for="first">重置</label>', ''));
        await press(0); await page.waitForTimeout(300); await press(0); await page.waitForTimeout(300);
        assert.equal(await selected(), 0, 'the return fallback is not immediately undone by the generic listener'); checks++;
        await mount(fixture.replace('<label for="first">重置</label>', '<label hidden for="first">隐藏重置</label>'));
        await press(0); await press(0); await page.waitForTimeout(300);
        assert.equal(await selected(), 0, 'a hidden reset does not disable the return fallback'); checks++;
        // A late native rollback with no newer intent still receives correction.
        await mount(fixture);
        await page.evaluate(() => { document.querySelector('label').click(); document.querySelectorAll('input').forEach(input => { input.checked = false; }); });
        await page.waitForTimeout(300);
        assert.equal(await selected(), 1); checks++;
        if (process.env.RM_RADIO_REPORT) {
            const report = await readFile(process.env.RM_RADIO_REPORT, 'utf8');
            for (const marker of ['[用于本面诊断的源代码（沿用当前面匹配，可能经过规范化）]', '[实际渲染代码]']) {
                const html = report.split(marker)[1]?.split(/\r?\n/).find(line => line.startsWith('<details'));
                assert.ok(html); await mount(html);
                const originalText = await page.locator('details').textContent();
                for (const [label, expected] of [[0, 1], [1, 2], [2, 0], [0, 1], [0, 1]]) {
                    await press(label); await page.waitForTimeout(300);
                    assert.equal(await selected(), expected); checks++;
                    assert.equal(await page.locator('[class*="rm-phase-"]').evaluateAll(nodes => nodes.filter(n => getComputedStyle(n).display !== 'none').length), 1); checks++;
                }
                assert.equal(await page.locator('details').textContent(), originalText); checks++;
                await page.evaluate(() => { changes.length = 0; const labels = document.querySelectorAll('label'); labels[1].click(); labels[2].click(); });
                await page.waitForTimeout(300);
                assert.deepEqual(await page.evaluate(() => changes), [2, 0]); checks++;
            }
        }
        assert.deepEqual(errors, []);
        await context.close();
    }
    console.log(JSON.stringify({ checks, widths: [375, 1280], privateFixture: Boolean(process.env.RM_RADIO_REPORT), pageErrors: 0 }));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
