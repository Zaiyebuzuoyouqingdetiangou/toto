// 扩展交互类型的小样本：滚动、时间、滑动手势、节奏连击、悬停窥视、文字遮蔽、环境感应、跨面继承。
// 文字全是占位。运行：node tests/behaviorExtras.browser.mjs（需要 Playwright；RM_BROWSER_CHANNEL 可指定 msedge 等）
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
    if (pathname === '/extensions.js') return res.end('export const extension_settings = {}; export const getContext = () => ({});');
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){}}; export const event_types = {};');
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body style="margin:0">'); }
    const file = path.resolve(rootDir, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(rootDir + path.sep)) { res.statusCode = 403; return res.end(); }
    try { res.end(await readFile(file)); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const SAMPLES = {
    slide: `<details open><summary>横滑</summary>
        <div data-rm-ui="slide"><div data-rm-track style="width:300px;"><div data-rm-item="a" style="width:300px;height:80px;">甲</div><div data-rm-item="b" style="width:300px;height:80px;">乙</div><div data-rm-item="c" style="width:300px;height:80px;">丙</div></div>
        <button data-rm-next>下一张</button><button data-rm-reset>复位</button><p data-rm-show="b">第二张的说明</p><p data-rm-show="done">看完了</p></div></details>`,
    timer: `<details open><summary>倒计时</summary>
        <div data-rm-ui="timer" data-rm-duration="0.6"><span data-rm-clock>0:00</span><p data-rm-at="0.2" data-rm-show="half">半路出现</p><p data-rm-show="done">到点</p></div></details>`,
    swipe: `<details open><summary>甩卡</summary>
        <div data-rm-ui="swipe" style="width:240px;">
          <div style="position:relative;height:160px;">
            <div data-rm-card="x" style="position:absolute;inset:0;background:#dde;">甲卡</div>
            <div data-rm-card="y" style="position:absolute;inset:0;background:#edd;">乙卡</div>
          </div>
          <button data-rm-left>不要</button><button data-rm-right>喜欢</button><button data-rm-reset>复位</button>
          <p data-rm-show="y:right">乙被喜欢</p><p data-rm-show="x:left">甲被丢掉</p><p data-rm-show="done">全部甩完</p></div></details>`,
    rhythm: `<details open><summary>节奏</summary>
        <div data-rm-ui="rhythm" data-rm-count="3" data-rm-window="5"><button data-rm-tap>点</button><p data-rm-show="done">点够了</p></div>
        <div data-rm-ui="rhythm" data-rm-duration="0.3"><button data-rm-charge>按住</button><p data-rm-show="done">充满了</p></div></details>`,
    peek: `<details open><summary>窥视</summary>
        <div data-rm-ui="peek"><span data-rm-peek="note">注释</span><p data-rm-show="note">注释内容</p></div></details>`,
    spoiler: `<details open><summary>遮蔽</summary>
        <div data-rm-ui="spoiler"><p>前面 <span data-rm-spoiler>秘密</span> 后面 <span data-rm-spoiler>另一个</span></p><p data-rm-show="done">全揭开</p></div></details>`,
    sense: `<details open><summary>环境</summary>
        <div data-rm-ui="sense"><p data-rm-show="portrait">竖屏</p><p data-rm-show="landscape">横屏</p><p data-rm-show="narrow">窄屏</p></div></details>`,
    carryA: `<details open><summary>第一面</summary><div data-rm-ui="pick" data-rm-memory="选择"><button data-rm-pick="a">甲</button><button data-rm-pick="b">乙</button><p data-rm-show="b">选了乙</p></div></details>`,
    carryB: `<details open><summary>第二面</summary><div data-rm-ui="toggle" data-rm-recall="选择"><button data-rm-toggle>开</button><p data-rm-show="b">上一面选了乙</p><p data-rm-show="remembered">有记录</p></div>
        <div data-rm-ui="pick" data-rm-memory="选择"><button data-rm-pick="a">甲</button><button data-rm-pick="b">乙</button><p data-rm-show="b">恢复成乙</p></div></details>`,
};

let browser;
let checks = 0;
try {
    browser = await chromium.launch({ headless: true, ...(process.env.RM_BROWSER_CHANNEL ? { channel: process.env.RM_BROWSER_CHANNEL } : {}) });
    const context = await browser.newContext({ viewport: { width: 400, height: 700 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    await page.goto(origin);
    const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
    await page.evaluate(async query => {
        window.behavior = await import('/src/outputSanitizer/behaviorInteractions.js?' + query);
        window.dialect = await import('/src/outputSanitizer/behaviorDialect.js?' + query);
        window.recovery = await import('/src/outputSanitizer/behaviorRecovery.js?' + query);
    }, query);
    const mount = html => page.evaluate(html => { document.body.innerHTML = html; for (const root of document.querySelectorAll('body > details')) behavior.installBehaviorInteractions(root); }, html);
    const shown = () => page.evaluate(() => [...document.querySelectorAll('[data-rm-show]')].filter(node => !node.closest('[hidden]') && getComputedStyle(node).display !== 'none').map(node => node.getAttribute('data-rm-show')));
    const healthy = async () => {
        const diag = await page.evaluate(() => dialect.inspectBehaviorDialect(document.querySelector('details')));
        const rec = await page.evaluate(() => recovery.inspectBehaviorRecovery(document.body));
        assert.deepEqual(diag.unmatched, [], JSON.stringify(diag)); assert.equal(rec.incomplete, 0); assert.equal(rec.unwired, 0); checks++;
    };

    // 1. 横滑
    await mount(SAMPLES.slide);
    assert.deepEqual(await shown(), []);
    await page.locator('button[data-rm-next]').click();
    await page.waitForTimeout(600);
    assert.ok((await shown()).includes('b'), '滑到第二张，第二张的说明出来'); checks++;
    await page.locator('button[data-rm-next]').click();
    await page.waitForTimeout(600);
    assert.ok((await shown()).includes('done'), '三张都看过'); checks++;
    await page.locator('button[data-rm-reset]').click();
    await page.waitForTimeout(600);
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('[data-rm-track]')).overflowX), 'auto', '复位后横滑排版还在'); checks++;
    assert.deepEqual(await shown(), [], '复位后回到第一张'); checks++;
    await healthy();

    // 2. 倒计时
    await mount(SAMPLES.timer);
    assert.deepEqual(await shown(), []);
    await page.waitForTimeout(350);
    assert.deepEqual(await shown(), ['half'], '0.2 秒后半路的内容出现'); checks++;
    await page.waitForTimeout(500);
    assert.ok((await shown()).includes('done'), '到点'); checks++;
    assert.equal(await page.evaluate(() => document.querySelector('[data-rm-clock]').textContent), '0:00'); checks++;
    await healthy();

    // 3. 甩卡：按钮 + 手势
    await mount(SAMPLES.swipe);
    await page.locator('button[data-rm-right]').click(); // 最上面的是甲（第一张）
    await page.waitForTimeout(50);
    assert.deepEqual(await page.evaluate(() => document.querySelector('[data-rm-ui=swipe]').getAttribute('data-rm-swiped-right')), 'x'); checks++;
    const card = page.locator('[data-rm-card="y"]');
    const box = await card.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    for (let step = 1; step <= 8; step += 1) await page.mouse.move(box.x + box.width / 2 + step * 20, box.y + box.height / 2 + step);
    await page.mouse.up();
    await page.waitForTimeout(100);
    const after = await shown();
    assert.ok(after.includes('y:right') && after.includes('done'), `乙卡右划甩出去：${after}`); checks++;
    await page.locator('button[data-rm-reset]').click();
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(() => document.querySelector('[data-rm-card="y"]').style.transform), '', '复位后手势甩出的卡回到作者原样'); checks++;
    assert.deepEqual(await shown(), []); checks++;
    await healthy();

    // 4. 节奏：连点与充能
    await mount(SAMPLES.rhythm);
    for (let i = 0; i < 3; i += 1) await page.locator('button[data-rm-tap]').click();
    assert.ok((await shown()).includes('done'), '三下点够'); checks++;
    const charge = page.locator('button[data-rm-charge]');
    const cbox = await charge.boundingBox();
    await page.mouse.move(cbox.x + 5, cbox.y + 5); await page.mouse.down();
    await page.waitForTimeout(450);
    await page.mouse.up();
    const p = await page.evaluate(() => document.querySelectorAll('[data-rm-ui=rhythm]')[1].style.getPropertyValue('--rm-p'));
    assert.equal(Number(p), 1, `按住 0.45 秒充满：${p}`);
    assert.equal((await shown()).filter(key => key === 'done').length, 2); checks++;
    await healthy();

    // 5. 窥视：悬停显示、移开隐藏、点按钉住
    await mount(SAMPLES.peek);
    await page.locator('[data-rm-peek]').hover();
    assert.deepEqual(await shown(), ['note'], '悬停显示'); checks++;
    await page.mouse.move(5, 5);
    assert.deepEqual(await shown(), [], '移开隐藏'); checks++;
    await page.locator('[data-rm-peek]').click();
    await page.mouse.move(5, 5);
    assert.deepEqual(await shown(), ['note'], '点按钉住'); checks++;
    await healthy();

    // 6. 遮蔽：默认黑条，点一下揭开，全揭开 done
    await mount(SAMPLES.spoiler);
    const spoilerColor = () => page.evaluate(() => getComputedStyle(document.querySelector('[data-rm-spoiler]')).color);
    assert.equal(await spoilerColor(), 'rgba(0, 0, 0, 0)', '默认文字透明'); checks++;
    const spans = page.locator('[data-rm-spoiler]');
    await spans.nth(0).click();
    await page.waitForTimeout(300); // 默认样式带 0.2 秒过渡
    assert.notEqual(await spoilerColor(), 'rgba(0, 0, 0, 0)', '点一下显出来'); checks++;
    await spans.nth(1).click();
    assert.ok((await shown()).includes('done')); checks++;
    await healthy();

    // 7. 环境感应：当前竖屏窄屏
    await mount(SAMPLES.sense);
    const sensed = await shown();
    assert.ok(sensed.includes('portrait') && sensed.includes('narrow') && !sensed.includes('landscape'), `竖屏窄屏：${sensed}`); checks++;
    await page.setViewportSize({ width: 900, height: 500 });
    await page.waitForTimeout(100);
    const turned = await shown();
    assert.ok(turned.includes('landscape') && !turned.includes('narrow'), `转成横屏宽屏：${turned}`); checks++;
    await page.setViewportSize({ width: 400, height: 700 });
    await healthy();

    // 8. 跨面继承：第一面选了乙，第二面恢复并能用 recall 显示
    await page.evaluate(() => localStorage.clear());
    await mount(SAMPLES.carryA);
    await page.locator('button[data-rm-pick="b"]').click();
    assert.deepEqual(await shown(), ['b']);
    await mount(SAMPLES.carryB);
    const carried = await shown();
    assert.ok(carried.includes('remembered') && carried.filter(key => key === 'b').length === 2, `第二面恢复：${carried}`); checks++;
    await healthy();

    assert.deepEqual(errors, []);
    console.log(`behaviorExtras browser checks passed: ${checks}`);
} finally {
    await browser?.close();
    server.close();
}
