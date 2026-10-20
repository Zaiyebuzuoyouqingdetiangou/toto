// 自动巡逻：安全修复做完后在隐藏副本里把每个控件试一遍，按了没反应的自动记进待修样本箱。
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const server = createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    res.setHeader('Content-Type', 'text/javascript');
    if (pathname === '/extensions.js') return res.end('export const extension_settings = {}; export const getContext = () => ({ chat: [], chatId: "t" });');
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){}}; export const event_types = {};');
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    const file = path.resolve(rootDir, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(rootDir + path.sep)) { res.statusCode = 403; return res.end(); }
    try { res.end(await readFile(file)); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));
await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
await page.goto(origin);
const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
await page.evaluate(async query => {
    const ext = await import('/extensions.js');
    ext.extension_settings.rabbit_mirror_theater = { maintenanceRabbitEnabled: true, maintenanceRabbitAutoSafeEnabled: true, maintenanceRabbitAutoSafeConsent: true };
    window.inspect = await import('/src/outputSanitizer/maintenanceInspect.js?' + query);
    window.rescue = await import('/src/outputSanitizer/fallbackRescue.js?' + query);
    window.behavior = await import('/src/outputSanitizer/behaviorInteractions.js?' + query);
    window.samples = await import('/src/outputSanitizer/repairSamples.js?' + query);
    window.samples.clearRepairSamples();
}, query);

const mount = async html => page.evaluate(html => {
    document.body.innerHTML = html;
    const root = document.querySelector('details');
    behavior.installBehaviorInteractions(root);
    rescue.installIntelligentInteractionRescue(root);
    const button = document.createElement('button');
    button.setAttribute('data-rabbit-mirror-maintenance-rabbit', 'true');
    root.querySelector('summary').append(button);
    const result = inspect.runMaintenanceSafeAutomaticRepairs(root, button);
    return result && !result.skipped && Number.isInteger(result.repaired) ? 'ran' : 'skipped';
}, html);
const settle = async () => {
    for (let i = 0; i < 40; i += 1) {
        const state = await page.evaluate(() => document.querySelector('details')?.getAttribute('data-rabbit-mirror-auto-probe'));
        if (state && state !== 'pending') return state;
        await page.waitForTimeout(100);
    }
    return 'timeout';
};
let checks = 0;

// 1 一个能动的开关 + 一根没接任何东西的滑杆：滑杆按了没反应 → 记样本、按钮上写明
assert.equal(await mount(`<details open><summary>t</summary><div data-rm-ui="toggle"><button type="button" data-rm-toggle>翻面</button><p data-rm-show="on">背面的字</p></div>
  <input type="range" min="0" max="100" value="100"><p>拖动滑杆看进度</p></details>`), 'ran'); checks++;
assert.equal(await settle(), 'done'); checks++;
assert.equal(await page.evaluate(() => samples.countRepairSamples()), 1); checks++;
assert.equal(await page.evaluate(() => samples.listRepairSamples()[0].trigger), 'auto'); checks++;
assert.match(await page.evaluate(() => document.querySelector('[data-rabbit-mirror-maintenance-rabbit]').getAttribute('data-rabbit-mirror-maintenance-reason') || ''), /自动巡逻.*样本箱/); checks++;
// 同一面不会重复跑
assert.equal(await page.evaluate(() => { const root = document.querySelector('details'); return inspect.runMaintenanceSafeAutomaticRepairs(root, root.querySelector('[data-rabbit-mirror-maintenance-rabbit]')) ? root.getAttribute('data-rabbit-mirror-auto-probe') : 'skipped'; }), 'done'); checks++;
assert.equal(await page.evaluate(() => samples.countRepairSamples()), 1); checks++;

// 2 全部控件都有反应：不记样本
await page.evaluate(() => samples.clearRepairSamples());
assert.equal(await mount(`<details open><summary>t</summary><div data-rm-ui="toggle"><button type="button" data-rm-toggle>翻面</button><p data-rm-show="on">背面的字</p></div>
  <div data-rm-ui="pick"><button type="button" data-rm-pick="a">甲</button><button type="button" data-rm-pick="b">乙</button><p data-rm-show="a">甲的结果</p><p data-rm-show="b">乙的结果</p></div></details>`), 'ran'); checks++;
assert.equal(await settle(), 'done'); checks++;
assert.equal(await page.evaluate(() => samples.countRepairSamples()), 0); checks++;

// 3 开关关掉就不跑
await page.evaluate(async () => { const ext = await import('/extensions.js'); ext.extension_settings.rabbit_mirror_theater.maintenanceRabbitAutoSafeEnabled = false; });
await mount(`<details open><summary>t</summary><input type="range" min="0" max="100" value="100"><p>拖动滑杆看进度</p></details>`);
for (let i = 0; i < 40; i += 1) {
    if ((await page.evaluate(() => document.querySelector('details').getAttribute('data-rabbit-mirror-auto-probe'))) !== 'pending') break;
    await page.waitForTimeout(100);
}
assert.equal(await page.evaluate(() => document.querySelector('details').getAttribute('data-rabbit-mirror-auto-probe')), null); checks++;
assert.equal(await page.evaluate(() => samples.countRepairSamples()), 0); checks++;

// 4 插件自己的「生成失败」占位面：不巡逻、不记样本
await page.evaluate(async () => { const ext = await import('/extensions.js'); ext.extension_settings.rabbit_mirror_theater.maintenanceRabbitAutoSafeEnabled = true; samples.clearRepairSamples(); });
await mount(`<details open class="rabbit-mirror-external-placeholder"><summary>t</summary><div class="rabbit-mirror-external-placeholder-body"><div class="rabbit-mirror-external-error-actions"><button type="button">找回旧兔子镜</button><button type="button">重新生成</button></div></div></details>`);
await page.waitForTimeout(800);
assert.equal(await page.evaluate(() => samples.countRepairSamples()), 0); checks++;

assert.deepEqual(pageErrors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
