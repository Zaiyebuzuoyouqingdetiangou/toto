// Optional RM_EXPORT_REPORT points to a private diagnostic report. Its HTML is
// tested in memory only; neither the report nor its text is written to the repo.
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
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced=()=>{};export const setExtensionPrompt=()=>{};export const extension_prompt_types={};export const extension_prompt_roles={};export const eventSource={on(){},removeListener(){}};export const event_types={};');
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    const file = path.resolve(rootDir, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(rootDir + path.sep)) { res.statusCode = 403; return res.end(); }
    try { res.end(await readFile(file)); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
let browser, checks = 0;
const failures = [];
try {
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    await page.goto(origin);
    await page.evaluate(async query => {
        window.exportsApi = await import('/src/outputSanitizer/diagnostics.js?' + query);
        window.exportMarkup = await import('/src/outputSanitizer/markup.js?' + query);
        window.animations = await import('/src/runtimeAnimationState.js?' + query);
        window.downloadBlob = null;
        URL.createObjectURL = blob => { window.downloadBlob = blob; return 'blob:export-test'; };
        HTMLAnchorElement.prototype.click = function () {};
        Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.copiedHtml = text; } }, configurable: true });
        window.runExport = async ({ html, selector = 'details', chrome = '', copy = false }) => {
            document.body.innerHTML = html;
            const root = document.querySelector(selector), details = root.matches('details') ? root : root.querySelector(':scope > details');
            if (chrome) details.insertAdjacentHTML('beforeend', chrome);
            const input = details.querySelector('input[name="author-input"]'); if (input) input.value = 'live input';
            const checkbox = details.querySelector('input[type="checkbox"]'); if (checkbox) checkbox.checked = true;
            const textarea = details.querySelector('textarea[name="author-text"]'); if (textarea) textarea.value = 'live note';
            const moving = details.querySelector('.moving');
            if (moving) { animations.rememberRuntimeAnimationStyle(moving); moving.style.animationPlayState = 'paused'; }
            const panel = document.createElement('div');
            panel.innerHTML = '<button>export</button><p data-rm-copy-html-status></p>'; document.body.appendChild(panel);
            const before = root.outerHTML;
            const liveBudget = exportMarkup.validateRabbitMirrorTemplateStructuralBudget({ content: { childNodes: [details] } });
            window.downloadBlob = null; window.copiedHtml = '';
            if (copy) await exportsApi.copyRabbitMirrorCurrentFaceHtml(root, panel.querySelector('button'), panel);
            else exportsApi.downloadRabbitMirrorCurrentFaceHtml(root, panel.querySelector('button'), panel);
            const output = copy ? window.copiedHtml : window.downloadBlob ? await window.downloadBlob.text() : '';
            return { output, status: panel.querySelector('p').textContent, unchanged: root.outerHTML === before, liveBudget };
        };
    }, query);
    const base = `<details open><summary>兔子镜：导出回归</summary><style>.moving{color:#345}.authored{font-size:18px}</style><p class="authored">完整正文；正文末尾标记。</p><input name="author-input" value="original"><input type="checkbox"><textarea name="author-text">original note</textarea><div class="moving">动画原样</div></details>`;
    const chrome = `<section data-rabbit-mirror-interaction-diagnostic><input value="do not export">${'<i>tool only</i>'.repeat(4300)}</section>`;
    const runExport = options => window.runExport(options);
    async function check(name, run) {
        try { await run(); checks++; }
        catch (error) { failures.push(`${name}: ${error.message}`); }
    }
    for (const width of [375, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        for (const copy of [false, true]) await check(`${width} ${copy ? 'copy' : 'download'} excludes tool-only budget`, async () => {
            const result = await page.evaluate(runExport, { html: base, chrome, copy });
            assert.equal(result.liveBudget, false, 'fixture must exceed the unchanged live structural budget');
            assert.ok(result.output.length > 0, 'a small authored face must export despite an excluded diagnostic subtree');
            assert.ok(result.output.includes('正文末尾标记。') && result.output.includes('live input') && result.output.includes('live note'));
            assert.ok(!result.output.includes('tool only') && !result.output.includes('do not export'));
            assert.ok(!result.output.includes('animation-play-state: paused'), 'runtime pause must not leak into export');
            assert.equal(result.unchanged, true);
        });
        await check(`${width} tool inputs before authored controls cannot shift copied values`, async () => {
            const html = base.replace('<p class="authored">', '<aside data-rabbit-mirror-maintenance-menu><input value="tool password"></aside><p class="authored">');
            const result = await page.evaluate(runExport, { html });
            assert.ok(result.output.includes('value="live input"') && result.output.includes('live note'));
            assert.ok(!result.output.includes('tool password')); assert.equal(result.unchanged, true);
        });
        await check(`${width} wrapper styles retained without adjacent face or prose`, async () => {
            const html = `<toto data-rabbit-mirror="true"><style>.wrapper-style{color:#345}</style>${base}<p>neighbor prose secret</p><details><summary>兔子镜：邻面</summary><p>neighbor face secret</p></details></toto>`;
            const result = await page.evaluate(runExport, { html, selector: 'toto' });
            assert.ok(result.output.includes('.wrapper-style') && result.output.includes('正文末尾标记。'));
            assert.ok(!result.output.includes('neighbor prose secret') && !result.output.includes('neighbor face secret'));
            assert.equal(result.unchanged, true);
        });
        await check(`${width} authored dangerous code remains sanitized`, async () => {
            const html = base.replace('</details>', '<script>window.__untrustedExport=true</script><a href="javascript:alert(1)" onclick="alert(2)">safe label</a><iframe srcdoc="unsafe"></iframe></details>');
            const result = await page.evaluate(runExport, { html });
            assert.ok(result.output.includes('safe label') && result.output.includes('正文末尾标记。'));
            assert.ok(!/<script|<iframe|javascript:|\bonclick=/i.test(result.output));
            assert.equal(result.unchanged, true);
        });
        for (const [name, content] of [
            ['nodes', '<i>authored</i>'.repeat(4300)],
            ['depth', '<div>'.repeat(74) + 'deep' + '</div>'.repeat(74)],
            ['css', '<style>' + '.safe{color:#345}'.repeat(1500) + '</style>'],
            ['data-uri', '<img src="data:image/png;base64,' + 'a'.repeat(193000) + '">'],
            ['source-chars', '<p>' + 'x'.repeat(786433) + '</p>'],
        ]) await check(`${width} genuine authored ${name} overflow still fails closed`, async () => {
            const result = await page.evaluate(runExport, { html: base.replace('</details>', content + '</details>') });
            assert.equal(result.output, '', 'oversized authored content must not be silently truncated or exported');
            assert.equal(result.unchanged, true);
        });
    }
    if (process.env.RM_EXPORT_REPORT) {
        const report = await readFile(process.env.RM_EXPORT_REPORT, 'utf8');
        const rendered = report.split('[实际渲染代码]')[1]?.trim();
        assert.ok(rendered?.startsWith('<'), 'private report must contain rendered HTML');
        await check('private rendered face keeps the same exported body with excluded tool chrome', async () => {
            const baseline = await page.evaluate(runExport, { html: rendered });
            const withTools = await page.evaluate(runExport, { html: rendered, chrome });
            assert.ok(baseline.output.length > 0);
            assert.ok(withTools.output === baseline.output, 'excluding UI must preserve the exact sanitized face, without exposing private text in assertions');
            assert.ok(baseline.unchanged && withTools.unchanged);
        });
    }
    assert.deepEqual(pageErrors, []);
    console.log(JSON.stringify({ checks, widths: [375, 1280], privateFixture: Boolean(process.env.RM_EXPORT_REPORT), failures }));
    if (failures.length) process.exitCode = 1;
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
