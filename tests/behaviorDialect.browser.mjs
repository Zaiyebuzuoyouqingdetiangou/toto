// 插件写法方言表的小样本回归。每个样本是照着真实出过问题的那一面「只留结构」重写的，
// 文字都是占位，不含任何聊天内容。改维修代码时跑这一份（几秒钟），不用跑整套镜面库。
// 运行：node tests/behaviorDialect.browser.mjs（需要 Playwright；RM_BROWSER_CHANNEL 可指定 msedge 等）
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
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    const file = path.resolve(rootDir, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(rootDir + path.sep)) { res.statusCode = 403; return res.end(); }
    try { res.end(await readFile(file)); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

// —— 样本（结构照原面，文字占位）——
const SAMPLES = {
    // 赛马直播盘：动画区域只包住跑道，播放钮和滑杆写在下面一排；马只靠 --pos 摆位置，没有动画。
    motionOutside: `<details open><summary>动画区域外的控件</summary>
        <style>.track{position:relative;height:60px}.runner{position:absolute;left:calc(10% + var(--pos,0%));transition:left .4s}</style>
        <div data-rm-ui="motion" class="track">
          <div class="runner" data-rm-part="a" style="--pos: 68%;">A</div>
          <div class="runner" data-rm-part="b" style="--pos: 24%;">B</div>
        </div>
        <div class="ctrl"><button data-rm-play>回放 / 暂停</button><input type="range" min="0" max="100" value="68"></div>
        </details>`,
    // 出蛋开关：唯一的开关起了名字 turn，显示内容写 on／!on。
    namedToggle: `<details open><summary>起了名字的唯一开关</summary>
        <div data-rm-ui="toggle">
          <button data-rm-toggle="turn"><span data-rm-show="!on">按下</span><span data-rm-show="on">已按下</span></button>
          <div data-rm-show="!on">静止</div><div data-rm-show="on">结果内容</div>
        </div></details>`,
    // 扭蛋机旋钮：3 档，内容标成 item0／item1／item2。
    turnPrefixed: `<details open><summary>前缀号码的旋钮档位</summary>
        <div data-rm-ui="turn" data-rm-stops="3" data-rm-index="0">
          <button data-rm-knob>扭</button>
          <div data-rm-show="item0">第一张</div><div data-rm-show="item1">第二张</div><div data-rm-show="item2">第三张</div>
        </div></details>`,
    // 同上，号码从 1 开始。
    turnOneBased: `<details open><summary>从 1 开始的档位号</summary>
        <div data-rm-ui="turn" data-rm-stops="3">
          <button data-rm-knob>扭</button>
          <div data-rm-show="stop1">一档</div><div data-rm-show="stop2">二档</div><div data-rm-show="stop3">三档</div>
        </div></details>`,
    // 扭蛋机的另一种写法：档位内容标成 card-a／card-b（不是号码），但模型自己写了 CSS 按 data-rm-index 显示。
    authorCss: `<details open><summary>模型自己的 CSS 管显示</summary>
        <style>.card[data-rm-show]{display:none}
        [data-rm-index="0"] .card[data-rm-show="card-a"]{display:block}
        [data-rm-index="1"] .card[data-rm-show="card-b"]{display:block}</style>
        <div data-rm-ui="turn" data-rm-stops="2" data-rm-index="0">
          <button data-rm-knob>扭</button>
          <div class="card" data-rm-show="card-a">甲卡</div><div class="card" data-rm-show="card-b">乙卡</div>
        </div></details>`,
    // 方言表也认不出的写法：诊断要点名，驱动不猜。
    unknownWriting: `<details open><summary>认不出的写法</summary>
        <div data-rm-ui="turn" data-rm-stops="2"><button data-rm-knob>扭</button><div data-rm-show="left">左</div><div data-rm-show="right">右</div></div>
        <div data-rm-ui="pick"><button data-rm-choose="a">甲</button><div data-rm-show="a">甲的内容</div></div>
        <button data-rm-fire>区域外的按钮</button>
        <div data-rm-ui="motion"><div data-rm-part="x">静止的部件</div><button data-rm-play>播放</button></div>
        </details>`,
    // 白昼／夜间告示：夜间内容原本内联 display:none，靠 #id:checked 规则切出来。
    checkedDayNight: `<details open><summary>白昼／夜间切换</summary>
        <style>#mode-chk{display:none}
        #mode-chk:checked ~ .paper .day{display:none !important}
        #mode-chk:checked ~ .paper .night{display:block !important}</style>
        <div class="wrap"><input type="checkbox" id="mode-chk"><div class="bar"><label for="mode-chk" class="btn">翻转查看</label></div>
        <div class="paper"><div class="day">白昼正文</div><div class="night" style="display:none;">夜间附注</div></div></div></details>`,
};

let browser;
let checks = 0;
try {
    browser = await chromium.launch({ headless: true, ...(process.env.RM_BROWSER_CHANNEL ? { channel: process.env.RM_BROWSER_CHANNEL } : {}) });
    const page = await browser.newPage();
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

    async function mount(html) {
        await page.evaluate(html => {
            document.body.innerHTML = html;
            for (const root of document.querySelectorAll('body > details')) behavior.installBehaviorInteractions(root);
        }, html);
    }
    const shown = () => page.evaluate(() => [...document.querySelectorAll('[data-rm-show]')]
        .filter(node => !node.closest('[hidden]') && getComputedStyle(node).display !== 'none')
        .map(node => node.getAttribute('data-rm-show')));
    const report = () => page.evaluate(() => dialect.inspectBehaviorDialect(document.querySelector('details')));
    const pos = () => page.evaluate(() => [...document.querySelectorAll('[data-rm-part]')].map(node => parseFloat(node.style.getPropertyValue('--pos'))));

    // 1. 动画区域外的播放钮、滑杆
    await mount(SAMPLES.motionOutside);
    assert.deepEqual(await pos(), [68, 24]);
    await page.locator('input[type=range]').fill('34');
    assert.deepEqual((await pos()).map(Math.round), [34, 12], '滑杆在作者写的初始值一半处，位置按比例减半'); checks++;
    await page.locator('input[type=range]').fill('68');
    assert.deepEqual((await pos()).map(Math.round), [68, 24], '拖回初始值就是原样'); checks++;
    await page.locator('button[data-rm-play]').click();
    await page.waitForTimeout(250);
    const midway = await pos();
    assert.ok(midway[0] < 68, '播放从起点开始'); checks++;
    await page.locator('button[data-rm-play]').click(); // 再按一次停下
    const stopped = await pos();
    await page.waitForTimeout(300);
    assert.deepEqual(await pos(), stopped, '再按一次就停住'); checks++;
    let diag = await report();
    assert.deepEqual(diag.unmatched, []); assert.deepEqual(diag.orphans, []);
    assert.ok(diag.dialects.includes('remote-motion') && diag.dialects.includes('motion-numeric')); checks++;
    const recovered = await page.evaluate(() => recovery.inspectBehaviorRecovery(document.body));
    assert.equal(recovered.incomplete, 0); assert.equal(recovered.unmappedRanges, 0); checks++;

    // 2. 起了名字的唯一开关
    await mount(SAMPLES.namedToggle);
    assert.deepEqual(await shown(), ['!on', '!on']);
    await page.locator('button[data-rm-toggle]').click();
    assert.deepEqual(await shown(), ['on', 'on'], '开关开着，on 的内容出来'); checks++;
    await page.locator('button[data-rm-toggle]').click();
    assert.deepEqual(await shown(), ['!on', '!on'], '再按一次复位'); checks++;
    diag = await report();
    assert.deepEqual(diag.unmatched, []); assert.ok(diag.dialects.includes('named-single-toggle')); checks++;

    // 3. 前缀号码的旋钮（0 开头、1 开头）
    for (const [sample, names] of [['turnPrefixed', ['item0', 'item1', 'item2']], ['turnOneBased', ['stop1', 'stop2', 'stop3']]]) {
        await mount(SAMPLES[sample]);
        assert.deepEqual(await shown(), [names[0]]);
        for (const expected of [names[1], names[2], names[0]]) {
            await page.locator('[data-rm-knob]').click();
            await page.waitForTimeout(80);
            assert.deepEqual(await shown(), [expected], `${sample} 转到 ${expected}`); checks++;
        }
        diag = await report();
        assert.deepEqual(diag.unmatched, []); assert.ok(diag.dialects.includes('turn-prefixed-stops')); checks++;
    }

    // 3b. 模型自己的 CSS 管显示：驱动让开
    await mount(SAMPLES.authorCss);
    assert.deepEqual(await shown(), ['card-a']);
    await page.locator('[data-rm-knob]').click();
    await page.waitForTimeout(80);
    assert.deepEqual(await shown(), ['card-b'], '驱动不强行藏，CSS 按 data-rm-index 显示乙卡'); checks++;
    await page.locator('[data-rm-knob]').click();
    await page.waitForTimeout(80);
    assert.deepEqual(await shown(), ['card-a']); checks++;
    diag = await report();
    assert.deepEqual(diag.unmatched, []); assert.ok(diag.dialects.includes('author-css-show')); checks++;
    assert.equal(await page.evaluate(() => document.querySelectorAll('[data-rm-show-author="true"]').length), 2); checks++;

    // 4. 认不出的写法：诊断点名
    await mount(SAMPLES.unknownWriting);
    diag = await report();
    assert.deepEqual(diag.unmatched.map(item => `${item.type}:${item.token}`).sort(), ['pick:a', 'turn:left', 'turn:right'], '选项按钮名写错，甲的内容也对不上');
    assert.ok(diag.unknown.includes('data-rm-choose'));
    assert.equal(diag.orphans.length, 1);
    assert.equal(diag.staticMotion, 1);
    assert.match(await page.evaluate(() => dialect.describeBehaviorDialect(dialect.inspectBehaviorDialect(document.querySelector('details')))), /显示条件对不上/); checks++;

    // 4b. 隐藏副本通用实测：旋钮转了、内容却一张没出来的，要点名「只有按钮变了」
    await page.evaluate(async query => {
        window.probe = await import('/src/outputSanitizer/maintenanceGenericProbe.js?' + query);
    }, query);
    await page.evaluate(html => { document.body.innerHTML = html; }, SAMPLES.unknownWriting);
    await page.evaluate(() => behavior.installBehaviorInteractions(document.querySelector('details')));
    let probed = await page.evaluate(() => probe.runMaintenanceGenericProbe(document.querySelector('details')));
    assert.ok(probed && probed.tested >= 2, JSON.stringify(probed));
    assert.ok(probed.feedbackOnly.some(name => /扭/.test(name)), `旋钮只转了自己：${JSON.stringify(probed)}`); checks++;
    assert.match(await page.evaluate(() => probe.describeGenericProbe(JSON.parse(document.querySelector('details').getAttribute('data-rabbit-mirror-generic-probe')))), /只有按钮自己变了/); checks++;
    // 写对了的扭蛋机：内容有变化，不点名
    await page.evaluate(html => { document.body.innerHTML = html; behavior.installBehaviorInteractions(document.querySelector('details')); }, SAMPLES.turnPrefixed);
    probed = await page.evaluate(() => probe.runMaintenanceGenericProbe(document.querySelector('details')));
    assert.deepEqual(probed.feedbackOnly, [], JSON.stringify(probed)); assert.deepEqual(probed.dead, []); checks++;
    await page.evaluate(html => { document.body.innerHTML = html; behavior.installBehaviorInteractions(document.querySelector('details')); }, SAMPLES.namedToggle);
    probed = await page.evaluate(() => probe.runMaintenanceGenericProbe(document.querySelector('details')));
    assert.deepEqual(probed.feedbackOnly, [], JSON.stringify(probed)); assert.deepEqual(probed.dead, []); checks++;

    // 5. 白昼／夜间切换：切到夜间后，维修兔隐藏副本切回白天要验证通过
    await page.evaluate(async query => {
        window.rescue = await import('/src/outputSanitizer/fallbackRescue.js?' + query);
    }, query);
    await page.evaluate(html => { document.body.innerHTML = html; rescue.installIntelligentInteractionRescue(document.querySelector('details')); }, SAMPLES.checkedDayNight);
    const dayNight = () => page.evaluate(() => ['.day', '.night'].map(selector => getComputedStyle(document.querySelector(selector)).display));
    assert.deepEqual(await dayNight(), ['block', 'none']);
    await page.locator('label').click();
    await page.waitForTimeout(200);
    assert.deepEqual(await dayNight(), ['none', 'block']); checks++;
    const probe = async () => page.evaluate(async () => {
        const root = document.querySelector('details');
        rescue.scheduleMaintenanceLabeledCheckedProbe(root, { events: [] });
        await new Promise(resolve => setTimeout(resolve, 600));
        return root.getAttribute('data-rabbit-mirror-labeled-checked-last') || '';
    });
    assert.match(await probe(), /:verified$/, '已切到夜间时，副本切回白天也能验证'); checks++;
    await page.locator('label').click();
    await page.waitForTimeout(200);
    assert.deepEqual(await dayNight(), ['block', 'none'], '真实控件切回白天'); checks++;
    assert.match(await probe(), /:verified$/); checks++;

    // 6. 写法骨架：文字全换成占位，标识和 CSS 留下，地址和模型写的记录去掉
    await page.evaluate(async query => { window.skeleton = await import('/src/outputSanitizer/writingSkeleton.js?' + query); }, query);
    const skeleton = await page.evaluate(() => skeleton.skeletonizeRabbitMirrorHtml(`<details open data-rm-vs='{"c":[["剧情方案",0.5]],"pick":0}'><summary>【兔子镜：某某某的告示】</summary>
        <style>.a{content:"秘密";background:url(https://example.com/x.png)} .b[data-rm-show="on"]{display:block}</style>
        <div data-rm-ui="toggle"><button data-rm-toggle="turn" title="按一下">按下去看</button><img src="https://example.com/pic.png" alt="两个人">
        <p data-rm-show="on">这是正文内容，很长很长。</p><p data-rm-draw-prompt="1" hidden>画面提示词</p><a href="#top">回到顶部</a></div>
        <div data-rabbit-mirror-tool-entry-host="true" style="padding:1px">维修兔</div></details>`));
    assert.ok(!/[\u4e00-\u9fff]/.test(skeleton.replace(/字/g, '')), `骨架里不能有占位以外的文字：${skeleton}`); checks++;
    assert.ok(/data-rm-toggle="turn"/.test(skeleton) && /data-rm-show="on"/.test(skeleton) && /\.b\[data-rm-show="on"\]\{display:block\}/.test(skeleton), '写法标识和 CSS 规则留着'); checks++;
    assert.ok(/data-rm-vs="字×\d+"/.test(skeleton) && /src="https:…"/.test(skeleton) && /href="#top"/.test(skeleton) && /content:""/.test(skeleton) && /url\(\)/.test(skeleton), `地址与记录已去掉：${skeleton}`); checks++;
    assert.ok(!/tool-entry-host/.test(skeleton), '插件工具不进骨架'); checks++;

    assert.deepEqual(errors, []);
    console.log(`behaviorDialect browser checks passed: ${checks}`);
} finally {
    await browser?.close();
    server.close();
}
