// 维修换节点（复制替换这一面）后，维修接过线的交互要照记号接回来，不能因为记号还在就当成已接好而跳过。
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
        window.choice = await import('/src/outputSanitizer/choiceRescue.js?' + query);
        window.rearm = await import('/src/outputSanitizer/idsAndRearm.js?' + query);
        window.chrome = await import('/src/outputSanitizer/toolsChrome.js?' + query);
    }, query);
    const result = await page.evaluate(() => {
        const out = {};
        const swap = d => { const c = d.cloneNode(true); d.replaceWith(c); return c; };
        // 1 填空选择：维修接上 → 维修换节点（复制替换）→ 不接回就点不动；按记号接回后照样能填
        const fill = `<details open><summary>t</summary><p>字字<span class="blank">____<small>选项 A/B</small></span>字</p><div>[A] 阿雪</div><div>[B] 阿岩</div></details>`;
        const filled = d => !!d.querySelector('[data-rm-fill-in-choice-filled="true"]') || /阿雪/.test(d.querySelector('[data-rm-fill-in-choice-blank]')?.textContent || '');
        document.body.innerHTML = fill;
        let d = document.querySelector('details');
        out.installed = choice.installFillInChoiceFallback(d) > 0;
        d.querySelector('[data-rm-fill-in-choice-option][data-rm-fill-in-choice-code="A"]').click();
        out.liveFills = filled(d);
        document.body.innerHTML = fill; d = document.querySelector('details'); choice.installFillInChoiceFallback(d);
        d = swap(d);
        d.querySelector('[data-rm-fill-in-choice-option][data-rm-fill-in-choice-code="A"]').click();
        out.cloneDeadWithout = filled(d);
        document.body.innerHTML = fill; d = document.querySelector('details'); choice.installFillInChoiceFallback(d);
        d = swap(d);
        out.unsavedSkipped = choice.rehydrateRabbitMirrorMaintenanceRepairs(d) === 0;
        out.rebound = choice.rehydrateRabbitMirrorMaintenanceRepairs(d, { cloned: true }) > 0;
        d.querySelector('[data-rm-fill-in-choice-option][data-rm-fill-in-choice-code="A"]').click();
        out.cloneFills = filled(d);
        // 2 跨容器勾选桥：复制后样式还在、同步监听丢了 → 再跑一次要重新接上
        const xc = `<details open><summary>t</summary><style>.sw:checked ~ .box .res{display:block}.res{display:none}</style><div class="ctl"><input type="checkbox" class="sw"></div><div class="box"><div class="res">阿竹</div></div></details>`;
        document.body.innerHTML = xc; d = document.querySelector('details'); chrome.bridgeCrossParentChecked(d);
        out.bridged = !!d.querySelector('style[data-rm-xchecked-bridge="2"]');
        d = swap(d); chrome.bridgeCrossParentChecked(d);
        const sw = d.querySelector('.sw'); sw.click();
        out.bridgeStyles = d.querySelectorAll('style[data-rm-xchecked-bridge]').length;
        out.cloneSync = d.hasAttribute('data-rm-xchecked-1');
        out.cloneShows = getComputedStyle(d.querySelector('.res')).display === 'block';
        // 3 「只有选中样式」兜底：复制后记号和提示留着、监听丢了 → 接回入口把它退回原样
        document.body.innerHTML = `<details open><summary>t</summary><div class="g" data-rabbit-mirror-selection-only-fallback="content-region" data-rabbit-mirror-selection-only-selected="b"><label><input type="radio" name="n">一</label><label><input type="radio" name="n" checked>二</label></div><div class="c" data-rabbit-mirror-selection-only-source="true" style="display:none !important">阿松</div><div data-rabbit-mirror-selection-only-placeholder="true">提示</div></details>`;
        d = document.querySelector('details');
        rearm.rearmRabbitMirrorSerializedInteractionRoot(d);
        out.selCleared = !d.querySelector('[data-rabbit-mirror-selection-only-fallback], [data-rabbit-mirror-selection-only-placeholder], [data-rabbit-mirror-selection-only-source]')
            && d.querySelector('.c').style.display === '' && !d.querySelector('.g').dataset.rabbitMirrorSelectionOnlySelected;
        return out;
    });
    assert.deepEqual(result, { installed: true, liveFills: true, cloneDeadWithout: false, unsavedSkipped: true, rebound: true, cloneFills: true,
        bridged: true, bridgeStyles: 1, cloneSync: true, cloneShows: true, selCleared: true });
    assert.deepEqual(errors, []);
    console.log('maintenanceCloneRebind ok');
} finally {
    await browser?.close();
    server.close();
}
