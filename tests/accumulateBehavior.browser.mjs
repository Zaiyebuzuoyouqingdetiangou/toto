// Local browser test. Optional RM_BEHAVIOR_FIXTURE is a private exported face;
// its content is never written into this repository or sent to a provider.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const server = createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    const file = path.resolve(rootDir, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(rootDir + path.sep)) { res.statusCode = 403; return res.end(); }
    res.setHeader('Content-Type', 'text/javascript');
    try { res.end(await readFile(file)); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const fixture = `<details open><summary>累积显字</summary><style>
    .ink {opacity:.18;filter:blur(2px)}
    [data-rm-done="true"] .ink {opacity:1;filter:blur(0)}
    button {padding:12px;margin:4px}
    </style><section data-rm-ui="accumulate"><p class="ink">全部步骤完成后，原有文字清晰可读。</p>
    <nav><button data-rm-step>第一步</button><button data-rm-step>第二步</button><button data-rm-reset>复位</button></nav>
    </section></details>`;
let browser, checks = 0;
try {
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
    for (const width of [375, 1280]) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 500, hasTouch: width < 500 });
        const page = await context.newPage(), errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
        await page.goto(origin);
        await page.evaluate(async () => { window.behavior = await import('/src/outputSanitizer/behaviorInteractions.js'); });
        async function mount(html) {
            await page.evaluate(html => {
                document.body.innerHTML = html;
                for (const root of document.querySelectorAll('details')) behavior.installBehaviorInteractions(root);
            }, html);
        }
        async function press(selector) {
            const button = page.locator(selector);
            if (width < 500) await button.tap(); else await button.click();
        }
        const done = () => page.locator('[data-rm-ui]').first().getAttribute('data-rm-done');
        await mount(fixture);
        assert.equal(await done(), null); checks++;
        await press('button[data-rm-step]:nth-child(1)');
        assert.equal(await done(), null); checks++;
        await press('button[data-rm-step]:nth-child(2)');
        assert.equal(await done(), 'true'); checks++;
        assert.equal(await page.locator('.ink').evaluate(node => getComputedStyle(node).opacity), '1'); checks++;
        await press('button[data-rm-step]:nth-child(1)');
        assert.equal(await done(), null); checks++;
        await press('button[data-rm-reset]');
        assert.equal(await page.locator('[data-rm-ui]').evaluate(node => node.style.getPropertyValue('--rm-count')), '0'); checks++;
        assert.equal(await page.locator('button[data-rm-done="true"]').count(), 0); checks++;
        // Native keyboard activation follows the same local behavior path.
        await page.locator('button[data-rm-step]').first().focus(); await page.keyboard.press('Enter');
        await page.locator('button[data-rm-step]').nth(1).focus(); await page.keyboard.press('Space');
        assert.equal(await done(), 'true'); checks++;
        const exported = await page.locator('details').evaluate(node => node.outerHTML);
        await mount(exported);
        await page.evaluate(() => behavior.installBehaviorInteractions(document.querySelector('details')));
        await press('button[data-rm-step]:nth-child(1)');
        assert.equal(await done(), null, 'reload and repeated install do not double-toggle'); checks++;
        // A second face keeps its own progress and its original DOM/content.
        await mount(fixture + fixture);
        await page.locator('details').first().locator('button[data-rm-step]').first().click();
        assert.equal(await page.locator('details').nth(1).locator('[data-rm-ui]').evaluate(node => node.style.getPropertyValue('--rm-count')), '0'); checks++;
        await mount('<details open><style>.nested-ink{opacity:.18;filter:blur(2px)}[data-rm-done="true"] .nested-ink{opacity:1;filter:blur(0)}</style><div data-rm-ui="accumulate"><button data-rm-step>外层步骤</button><div data-rm-ui="accumulate"><p class="nested-ink">内层结果</p><button data-rm-step>内层步骤</button><button data-rm-reset>内层复位</button></div></div></details>');
        await page.locator('button').first().click();
        assert.equal(await done(), null, 'a container must not reveal unfinished nested behaviors'); checks++;
        assert.equal(await page.locator('[data-rm-ui]').first().evaluate(node => node.style.getPropertyValue('--rm-count')), '1', 'nested steps are not counted as outer steps'); checks++;
        assert.equal(await page.locator('[data-rm-ui]').nth(1).getAttribute('data-rm-done'), null); checks++;
        assert.equal(await page.locator('.nested-ink').evaluate(node => getComputedStyle(node).opacity), '0.18'); checks++;
        await press('button[data-rm-step]:text("内层步骤")');
        assert.equal(await page.locator('.nested-ink').evaluate(node => getComputedStyle(node).filter), 'blur(0px)'); checks++;
        await press('button[data-rm-reset]');
        assert.equal(await page.locator('.nested-ink').evaluate(node => getComputedStyle(node).opacity), '0.18'); checks++;
        if (process.env.RM_BEHAVIOR_FIXTURE) {
            await mount(await readFile(process.env.RM_BEHAVIOR_FIXTURE, 'utf8'));
            const originalText = await page.locator('details').textContent();
            const text = page.locator('p[class$="-rm-ink-block"]').first();
            await page.waitForFunction(() => getComputedStyle(document.querySelector('p[class$="-rm-ink-block"]')).opacity === '1');
            assert.equal(await text.evaluate(node => getComputedStyle(node).filter), 'blur(0px)'); checks++;
            await press('button[data-rm-reset]');
            await page.waitForFunction(() => getComputedStyle(document.querySelector('p[class$="-rm-ink-block"]')).opacity === '0.18'); checks++;
            await press('button[data-rm-step]');
            await page.waitForFunction(() => getComputedStyle(document.querySelector('p[class$="-rm-ink-block"]')).opacity === '1'); checks++;
            assert.equal(await page.locator('details').textContent(), originalText); checks++;
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'the supplied face stays within the viewport'); checks++;
            if (process.env.RM_BEHAVIOR_EVIDENCE) {
                await mkdir(process.env.RM_BEHAVIOR_EVIDENCE, { recursive: true });
                await page.screenshot({ path: path.join(process.env.RM_BEHAVIOR_EVIDENCE, `accumulate-${width}.png`), fullPage: true });
            }
        }
        assert.deepEqual(errors, []);
        await context.close();
    }
    console.log(JSON.stringify({ checks, widths: [375, 1280], privateFixture: Boolean(process.env.RM_BEHAVIOR_FIXTURE), pageErrors: 0 }));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
