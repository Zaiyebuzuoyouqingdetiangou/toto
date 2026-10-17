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
    // 冥婚岁甲封囊（1.70.1 实测）：铜筒整块是开关，开关名写成了选择器 .rk-seal-trigger，CSS 却按 [data-rm-on~="unsealed"] 打开托盘；
    // 托盘里三个查看按钮各自是开关、名字留空，却在显示条件里写 !item1…，CSS 按外层 [data-rm-on~="item1"] 显示对应详情。
    cssStateWord: `<details open><summary>开关名和模型 CSS 对不上</summary>
        <style>.tray{max-height:0;opacity:0;overflow:hidden}
        [data-rm-on~="unsealed"] .tray{max-height:650px;opacity:1}
        [data-rm-on~="unsealed"] .seal-status::after{content:"已破"}
        .inspect{display:none}
        [data-rm-on~="item1"] .item1-detail{display:block}
        [data-rm-on~="item2"] .item2-detail{display:block}</style>
        <div class="cap"><div class="brass" data-rm-ui="toggle" data-rm-toggle=".rk-seal-trigger" role="button" tabindex="0">
          <div class="seal rk-seal-trigger seal-status">按破封印</div>
          <div class="tray">
            <div class="row"><button type="button" class="tab" data-rm-ui="toggle" data-rm-toggle="" data-rm-show="!item1">看一</button><button type="button" class="tab" data-rm-ui="toggle" data-rm-toggle="" data-rm-show="!item2">看二</button></div>
            <div class="inspect item1-detail">详情一</div><div class="inspect item2-detail">详情二</div>
          </div>
        </div></div></details>`,
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
    // AO3 字号滑杆：调节区域只包住滑杆，正文在外面用 var(--rm-p) 算字号；正文里还夹着一张翻面卡（别的插件区域）。
    varOutside: `<details open><summary>区域外用变量</summary>
        <style>.body{font-size:calc(10px + 10px * var(--rm-p, 0))}</style>
        <div data-rm-ui="adjust" style="--rm-p: 0;"><input type="range" min="0" max="1" step="0.1" value="0"></div>
        <div class="body"><p>正文</p><div data-rm-ui="toggle"><div data-rm-toggle="true" role="button">翻面卡</div></div></div>
        </details>`,
    // 问卷朱批：揭示区域把 data-rm-cover 写在滑杆自己身上；盖章效果的显示条件写成 effect。
    rangeCoverEffect: `<details open><summary>滑杆当遮罩、效果用词</summary>
        <div data-rm-ui="reveal"><input type="range" min="0" max="100" value="0" data-rm-cover="1" style="clip-path: inset(0px 0px 0px 82%);"><div data-rm-show="done">朱批</div></div>
        <div data-rm-ui="effect"><button data-rm-fire="1">盖章</button><div data-rm-part="1" data-rm-show="effect">印</div><div data-rm-show="!effect">未盖</div></div>
        </details>`,
    // 音轨回放：动画区域里只有一排静态波形细条，部件高度写死像素。
    equalizer: `<details open><summary>音轨波形</summary>
        <div data-rm-ui="motion"><button data-rm-play>播放／暂停</button><input type="range" min="0" max="100" value="35">
        <div data-rm-part style="display:flex;gap:6px;align-items:flex-end;height:36px;">${[14, 28, 20, 32, 16].map(h => `<span style="display:inline-block;width:4px;height:${h}px;background:#cb2;"></span>`).join('')}</div></div>
        </details>`,
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

    // 0. 开关写的状态名和模型自己的 CSS 对不上（css-state-word）
    await mount(SAMPLES.cssStateWord);
    const opened = () => page.evaluate(() => getComputedStyle(document.querySelector('.tray')).opacity === '1');
    const detail = n => page.evaluate(n => getComputedStyle(document.querySelector(`.item${n}-detail`)).display !== 'none', n);
    assert.equal(await opened(), false); checks++;
    await page.click('.seal');
    assert.equal(await opened(), true, 'the seal opens the tray via the CSS word unsealed'); checks++;
    await page.click('.tab >> nth=0');
    assert.equal(await detail(1), true, 'tab 1 shows its detail via item1 on the shared container'); checks++;
    assert.equal(await detail(2), false); checks++;
    assert.equal(await opened(), true, 'tapping a tab inside does not close the tray'); checks++;
    await page.click('.tab >> nth=1');
    assert.equal(await detail(2), true); checks++;
    await page.click('.tab >> nth=0');
    assert.equal(await detail(1), false, 'tap again hides it'); checks++;
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('.tab')].every(node => getComputedStyle(node).display !== 'none')), true, 'the tab buttons stay visible'); checks++;
    const cssReport = await report();
    assert.deepEqual(cssReport.unmatched, [], 'no longer reported as unmatched'); checks++;
    assert.ok(cssReport.dialects.includes('css-state-word')); checks++;
    await page.click('.seal');
    assert.equal(await opened(), false, 'tap the seal again closes the tray'); checks++;

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

    // 3c. 区域外用变量：滑杆一动，外面正文的字号跟着变（里面夹着的翻面卡不影响）
    await mount(SAMPLES.varOutside);
    const fontSize = () => page.evaluate(() => getComputedStyle(document.querySelector('.body')).fontSize);
    assert.equal(await fontSize(), '10px');
    await page.locator('input[type=range]').fill('1');
    assert.equal(await fontSize(), '20px', '区域外用 var(--rm-p) 的正文跟着滑杆变'); checks++;

    // 3d. 滑杆当遮罩、效果用词
    await mount(SAMPLES.rangeCoverEffect);
    const clip = () => page.evaluate(() => getComputedStyle(document.querySelector('input[type=range]')).clipPath);
    assert.equal(await clip(), 'none', '存档里留下的自我裁切去掉'); checks++;
    await page.locator('input[type=range]').fill('100');
    assert.equal(await clip(), 'none', '拖到底滑杆自己不被裁掉');
    assert.ok((await shown()).includes('done'), '拖到底朱批出来'); checks++;
    assert.ok((await shown()).includes('!effect') && !(await shown()).includes('effect'));
    await page.locator('[data-rm-fire]').click();
    assert.ok((await shown()).includes('effect') && !(await shown()).includes('!effect'), '按下盖章，写成 effect 的印出来'); checks++;
    diag = await report();
    assert.deepEqual(diag.unmatched, []); assert.ok(diag.dialects.includes('effect-any-show') && diag.dialects.includes('range-as-cover')); checks++;

    // 3e. 音轨波形：部件高度不被放大；播放让细条起伏，滑杆拨到对应位置
    await mount(SAMPLES.equalizer);
    const bar = () => page.evaluate(() => ({ height: document.querySelector('[data-rm-part]').style.height, tf: getComputedStyle(document.querySelectorAll('[data-rm-part] span')[3]).transform }));
    assert.equal((await bar()).tf, 'matrix(1, 0, 0, 1, 0, 0)');
    await page.locator('input[type=range]').fill('100');
    let now = await bar();
    assert.equal(now.height, '36px', '写死像素的部件高度不被按比例撑大'); checks++;
    assert.notEqual(now.tf, 'matrix(1, 0, 0, 1, 0, 0)', '拨到最右，细条停在起伏的另一端'); checks++;
    await page.locator('input[type=range]').fill('0');
    await page.locator('[data-rm-play]').click();
    await page.waitForTimeout(300);
    assert.notEqual((await bar()).tf, 'matrix(1, 0, 0, 1, 0, 0)', '按播放细条开始起伏'); checks++;
    diag = await report();
    assert.ok(diag.dialects.includes('motion-equalizer') && diag.staticMotion === 0); checks++;

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
    // 滑杆只裁了自己（遮罩写在滑杆上的老毛病）不算画面有反应
    await page.evaluate(html => { document.body.innerHTML = html; }, `<details open><summary>x</summary><div data-rm-ui="adjust"><input type="range" min="0" max="1" step="0.1" value="0" oninput="this.style.clipPath='inset(0 0 0 '+(this.value*100)+'%)'"></div><p>正文</p></details>`);
    probed = await page.evaluate(() => probe.runMaintenanceGenericProbe(document.querySelector('details')));
    assert.deepEqual(probed.dead, ['滑杆'], `只动了滑杆自己：${JSON.stringify(probed)}`); checks++;
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
        <style>[data-rm-picked="某人"] [data-rm-show="某人"]{display:block} .x{--label:"秘密标签"}</style>
        <div data-rm-ui="pick"><button data-rm-pick="某人">选他</button><div data-rm-show="某人 !另一人">内容</div><input type="text" value="她说的话"><input type="range" value="40"></div>
        <template><p>模板里的正文</p></template>
        <div data-rabbit-mirror-tool-entry-host="true" style="padding:1px">维修兔</div></details>`));
    assert.ok(!/[\u4e00-\u9fff]/.test(skeleton.replace(/字/g, '')), `骨架里不能有占位以外的文字：${skeleton}`); checks++;
    assert.ok(/data-rm-toggle="turn"/.test(skeleton) && /data-rm-show="on"/.test(skeleton) && /\.b\[data-rm-show="on"\]\{display:block\}/.test(skeleton), '写法标识和 CSS 规则留着'); checks++;
    assert.ok(/data-rm-vs="字×\d+"/.test(skeleton) && /src="https:…"/.test(skeleton) && /href="#top"/.test(skeleton) && /content:""/.test(skeleton) && /url\(\)/.test(skeleton), `地址与记录已去掉：${skeleton}`); checks++;
    assert.ok(!/tool-entry-host/.test(skeleton), '插件工具不进骨架'); checks++;
    assert.ok(/data-rm-pick="k1"/.test(skeleton) && /data-rm-show="k1 !k2"/.test(skeleton) && /\[data-rm-picked="k1"\] \[data-rm-show="k1"\]\{display:block\}/.test(skeleton), `中文键换成统一代号：${skeleton}`); checks++;
    assert.ok(/--label:""/.test(skeleton) && /type="text" value="字×4"/.test(skeleton) && /type="range" value="40"/.test(skeleton), `声明值字符串和文本框的值清掉，滑杆的值留着：${skeleton}`); checks++;

    // 7. 双引号里再写双引号的 data-rm-vs：解析前转义回去能读到记录；已解析的 DOM 里零碎属性名要去掉
    const broken = `<toto data-rabbit-mirror="true"><details open data-rm-vs="{"c":[["方案一的剧情",0.5],["方案二",0.3],["方案三",0.2]],"m":[["点按","切换"],["按住","翻面"],["拖动","点亮"]],"pick":1}"><summary>【兔子镜：测试】</summary><p>字</p></details></toto>`;
    const quoteCheck = await page.evaluate(async ({ broken, query }) => {
        const sampling = await import('/src/interactionSampling.js?' + query);
        const markup = await import('/src/outputSanitizer/markup.js?' + query);
        const repaired = document.createElement('template');
        repaired.innerHTML = sampling.repairDesignCandidateAttributeQuotes(broken);
        const parsed = document.createElement('template');
        parsed.innerHTML = broken;
        const junkBefore = [...parsed.content.querySelector('details').attributes].map(a => a.name).filter(n => !/^[a-z_:][\w:.-]*$/i.test(n)).length;
        markup.stripMalformedAttributeNames(parsed.content);
        const junkAfter = [...parsed.content.querySelector('details').attributes].map(a => a.name).filter(n => !/^[a-z_:][\w:.-]*$/i.test(n)).length;
        return { diag: sampling.interactionSamplingDiagnostic(parsed.content.querySelector('details'), repaired.content.querySelector('details')), junkBefore, junkAfter,
            leak: /方案一/.test(parsed.content.querySelector('details').outerHTML) };
    }, { broken, query });
    assert.match(quoteCheck.diag, /模型自报 3 项，选中=1/, quoteCheck.diag); checks++;
    assert.ok(quoteCheck.junkBefore > 0 && quoteCheck.junkAfter === 0 && !quoteCheck.leak, JSON.stringify(quoteCheck)); checks++;

    assert.deepEqual(errors, []);
    console.log(`behaviorDialect browser checks passed: ${checks}`);
} finally {
    await browser?.close();
    server.close();
}
