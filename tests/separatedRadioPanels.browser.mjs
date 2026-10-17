// Run with PLAYWRIGHT_MODULE pointing to an existing Playwright installation.
// All host/network dependencies stay local; no model or user session is used.
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
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){}}; export const event_types = {};');
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    const file = path.resolve(rootDir, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(rootDir + path.sep)) { res.statusCode = 403; return res.end(); }
    try { res.end(await readFile(file)); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
    // 有 Edge 用 Edge，没装就用 Playwright 自带的 Chromium。
    browser = await chromium.launch({ headless: true, channel: process.env.RM_BROWSER_CHANNEL || 'msedge' }).catch(() => chromium.launch({ headless: true }));
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    await page.goto(origin);
    const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
    await page.evaluate(async query => {
        window.checked = await import('/src/outputSanitizer/checkedStateRescue.js?' + query);
        window.rescue = await import('/src/outputSanitizer/fallbackRescue.js?' + query);
        window.inspect = await import('/src/outputSanitizer/maintenanceInspect.js?' + query);
    }, query);
    const fixture = (values = ['1', '47', '142'], order = values) => `<details open><summary>Example</summary>
        <style>.sample-input:checked + .sample-card {display:block !important}</style>
        <div><nav>${values.map((value, i) => `<label><input class="sample-input" type="radio" name="sample" value="${value}" ${i === 2 ? 'checked' : ''} style="display:none"><span>第${value}次</span></label>`).join('')}</nav>
        <div class="panels">${order.map(value => `<article class="sample-card" style="display:${value === '142' ? 'block' : 'none'}"><header>周目 ${value.padStart(3, '0')} 记录</header><p>Original story for this choice remains unchanged.</p></article>`).join('')}</div></div></details>`;
    let checks = 0;
    async function checkMapping(html, expected) {
        await page.evaluate(html => { document.body.innerHTML = html; }, html);
        const mapped = await page.evaluate(() => {
            const root = document.querySelector('details');
            return [...root.querySelectorAll('input')].map(input => checked.parseCheckedRulesFromText(root, input)
                .flatMap(rule => checked.resolveTargetsForCheckedRule(root, input, rule)).length);
        });
        assert.deepEqual(mapped, expected); checks++;
    }
    await checkMapping(fixture(), [1, 1, 1]);
    // Reordered panels must be paired by their authored keys, never DOM position.
    for (const width of [375, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await checkMapping(fixture(undefined, ['47', '142', '1']), [1, 1, 1]);
        const originalText = await page.locator('.sample-card').allTextContents();
        await page.evaluate(() => rescue.installIntelligentInteractionRescue(document.querySelector('details')));
        for (const value of ['1', '47', '142', '1', '142']) {
            await page.locator('label').filter({ has: page.locator(`input[value="${value}"]`) }).click();
            await page.waitForTimeout(300);
            const visible = await page.locator('.sample-card:visible header').allTextContents();
            assert.deepEqual(visible, [`周目 ${value.padStart(3, '0')} 记录`]); checks++;
        }
        assert.deepEqual(await page.locator('.sample-card').allTextContents(), originalText);
        // Repeated installation and a persisted HTML reload must still switch.
        await page.evaluate(() => {
            rescue.installIntelligentInteractionRescue(document.querySelector('details'));
            document.body.innerHTML = document.body.innerHTML;
            rescue.installIntelligentInteractionRescue(document.querySelector('details'));
        });
        await page.locator('label').filter({ has: page.locator('input[value="47"]') }).click();
        await page.waitForTimeout(300);
        assert.deepEqual(await page.locator('.sample-card:visible header').allTextContents(), ['周目 047 记录']); checks++;
        const depth = await page.evaluate(() => inspect.maintenanceCheckedInteractionDepth(document.querySelector('details')));
        assert.equal(depth.unresolvedCheckedRuleCount, 0);
        assert.equal(depth.meaningfulCheckedRuleCount, 3); checks++;
        const beforeProbe = await page.locator('input:checked').getAttribute('value');
        const scheduled = await page.evaluate(() => {
            window.probe = { events: [] };
            return rescue.scheduleMaintenanceLabeledCheckedProbe(document.querySelector('details'), window.probe);
        });
        assert.equal(scheduled, 1);
        await page.waitForTimeout(360);
        const events = await page.evaluate(() => window.probe.events);
        assert.ok(events.some(event => /observed .*matched=true/.test(event)), events.join('\n'));
        assert.equal(await page.locator('input:checked').getAttribute('value'), beforeProbe); checks++;
    }
    await checkMapping(fixture().replace('周目 047', '周目 001'), [0, 0, 0]);
    await checkMapping(fixture().replace('value="47"', 'value="1"'), [0, 0, 0]);
    await checkMapping(fixture().replace('周目 047', '周目 999'), [0, 0, 0]);
    await checkMapping(fixture().replace('第47次', '没有编号'), [0, 0, 0]);
    await checkMapping(fixture().replace('name="sample" value="47"', 'name="other" value="47"'), [0, 0, 0]);
    await checkMapping(fixture().replaceAll('type="radio"', 'type="checkbox"'), [0, 0, 0]);
    await checkMapping(fixture().replace('</nav>', '</nav><div>Unrelated region</div>'), [0, 0, 0]);
    await checkMapping(fixture().replace('value="47"', 'disabled value="47"'), [0, 0, 0]);
    await checkMapping(fixture().replace('周目 047', '周目 047 另有 2'), [0, 0, 0]);
    await checkMapping(fixture().replace('<article class="sample-card"', '<article class="unrelated-card"'), [0, 0, 0]);
    // A working native sibling selector keeps its own target; no detached route.
    const native = '<details open><style>.sample-input:checked + .sample-card{display:block}</style><label><input type="radio" name="native" class="sample-input" value="1"><article class="sample-card"><header>周目 001</header><p>Native result content.</p></article></label></details>';
    await checkMapping(native, [1]);
    assert.equal(await page.evaluate(() => checked.findCrossParentCheckedRuleFallbackCandidates(document.querySelector('details')).length), 0); checks++;
    if (process.env.RABBIT_MIRROR_LOCAL_REPORT) {
        // Private supplied source is read on demand, never stored in this repo.
        const report = await readFile(process.env.RABBIT_MIRROR_LOCAL_REPORT, 'utf8');
        const html = report.split('[原始兔子镜源码]')[1]?.split(/\r?\n/).find(line => line.startsWith('<details'));
        assert.ok(html?.endsWith('</details>'));
        await checkMapping(html, [1, 1, 1]);
        await page.evaluate(() => { const root = document.querySelector('details'); root.open = true; rescue.installIntelligentInteractionRescue(root); });
        for (const value of ['1', '47', '142', '1']) {
            await page.locator('label').filter({ has: page.locator(`input[value="${value}"]`) }).click();
            await page.waitForTimeout(300);
            const result = await page.evaluate(() => {
                const root = document.querySelector('details');
                const input = root.querySelector('input:checked');
                const rule = checked.parseCheckedRulesFromText(root, input)[0];
                const target = checked.resolveTargetsForCheckedRule(root, input, rule)[0];
                const panels = [...root.querySelectorAll(rule.targetSelector)];
                return { active: panels.filter(panel => getComputedStyle(panel).display !== 'none').length,
                    correct: !!target && getComputedStyle(target).display !== 'none' };
            });
            assert.deepEqual(result, { active: 1, correct: true }); checks++;
        }
    }
    // 同名的两套单选（茶摊铜镜换影仪）：上面带 id 的隐藏单选给 CSS 用，胶囊里各放一个同名、没 id 的单选。
    // 点胶囊要真的换到上面那个状态（发色、对白跟着变），胶囊自己也高亮；再点别的照样换。
    const twin = `<details open><summary>同名两套单选</summary>
        <style>.talk{display:none}.pill{background:#fff}
        input[type="radio"]:checked + .pill{background:rgb(191, 107, 40)}
        #hair-black:checked ~ * .hair{fill:rgb(30, 27, 24)}
        #hair-frost:checked ~ * .hair{fill:rgb(230, 236, 242)}
        #hair-chestnut:checked ~ * .hair{fill:rgb(84, 51, 36)}
        #hair-black:checked ~ * #talk-black{display:block}
        #hair-frost:checked ~ * #talk-frost{display:block}
        #hair-chestnut:checked ~ * #talk-chestnut{display:block}
        #eye-pink:checked ~ * .iris{fill:rgb(237, 163, 181)}
        #eye-ice:checked ~ * .iris{fill:rgb(151, 191, 212)}</style>
        <input type="radio" name="hair" id="hair-black" style="display:none;" checked>
        <input type="radio" name="hair" id="hair-frost" style="display:none;">
        <input type="radio" name="hair" id="hair-chestnut" style="display:none;">
        <input type="radio" name="eye" id="eye-pink" style="display:none;" checked>
        <input type="radio" name="eye" id="eye-ice" style="display:none;">
        <div class="wrap">
          <svg viewBox="0 0 10 10" width="40"><rect class="hair" width="10" height="5"></rect><circle class="iris" cx="5" cy="8" r="2"></circle></svg>
          <div id="talk-black" class="talk">黑发台词</div><div id="talk-frost" class="talk">白发台词</div><div id="talk-chestnut" class="talk">栗发台词</div>
          <div class="opts">
            <label><input type="radio" name="hair" style="display:none;"><span class="pill">黑</span></label>
            <label><input type="radio" name="hair" style="display:none;"><span class="pill">白</span></label>
            <label><input type="radio" name="hair" style="display:none;"><span class="pill">栗</span></label>
            <label><input type="radio" name="eye" style="display:none;"><span class="pill">粉</span></label>
            <label><input type="radio" name="eye" style="display:none;"><span class="pill">冰</span></label>
          </div>
        </div></details>`;
    await page.evaluate(html => { document.body.innerHTML = html; rescue.installIntelligentInteractionRescue(document.querySelector('details')); }, twin);
    await page.waitForTimeout(200);
    const look = () => page.evaluate(() => ({
        hair: getComputedStyle(document.querySelector('.hair')).fill,
        iris: getComputedStyle(document.querySelector('.iris')).fill,
        talk: [...document.querySelectorAll('.talk')].filter(n => getComputedStyle(n).display !== 'none').map(n => n.textContent),
        pills: [...document.querySelectorAll('.pill')].map(n => getComputedStyle(n).backgroundColor === 'rgb(191, 107, 40)'),
    }));
    let seen = await look();
    assert.equal(seen.hair, 'rgb(30, 27, 24)', 'starts on the authored default'); checks++;
    assert.deepEqual(seen.talk, ['黑发台词']); checks++;
    assert.deepEqual(seen.pills, [true, false, false, true, false], 'the default pills are highlighted'); checks++;
    await page.locator('label').filter({ hasText: '白' }).click();
    await page.waitForTimeout(300);
    seen = await look();
    assert.equal(seen.hair, 'rgb(230, 236, 242)', 'tapping a pill really switches the state the CSS uses'); checks++;
    assert.deepEqual(seen.talk, ['白发台词']); checks++;
    assert.deepEqual(seen.pills, [false, true, false, true, false]); checks++;
    await page.locator('label').filter({ hasText: '冰' }).click();
    await page.waitForTimeout(300);
    seen = await look();
    assert.equal(seen.iris, 'rgb(151, 191, 212)'); checks++;
    assert.equal(seen.hair, 'rgb(230, 236, 242)', 'other groups keep their choice'); checks++;
    await page.locator('label').filter({ hasText: '栗' }).click();
    await page.waitForTimeout(300);
    seen = await look();
    assert.equal(seen.hair, 'rgb(84, 51, 36)'); checks++;
    assert.deepEqual(seen.talk, ['栗发台词']); checks++;
    assert.deepEqual(pageErrors, []);
    console.log(JSON.stringify({ checks, browser: browser.version(), network: 'loopback only', result: 'passed' }));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
