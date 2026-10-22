// 模型照脚本写法做的播放器（脚本被拿掉了）：一列曲目里一条带 .active、上一首／下一首、播放键配 [data-playing="true"] 的样式。
// 点曲目亮那条，上一首／下一首按顺序挪，「正在播放」那行跟着换名字；播放键切换 data-playing。走真实的挂工具流程。
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
        const track = (n, name, on) => `<div class="tr${on ? ' active' : ''}"><div class="head"><span class="num">0${n}</span><span class="tr-name">${name}</span></div><div class="note">为什么放这首：字字字</div></div>`;
        const html = `<style>.app{background:#111}.app[data-playing="true"] .disc{animation:spin 8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
            .btn{cursor:pointer;width:36px;height:36px}.tr{cursor:pointer;padding:8px}.tr.active{border:1px solid #4c9}.tr.active .tr-name{color:#4c9}</style>
            <div class="app" id="app" data-playing="false" data-index="0"><div class="disc">碟</div>
            <div class="now"><div class="song-title" id="t">1. 阿雪的歌</div><div class="meta">字字</div></div>
            <div class="controls"><div class="btn" id="aPrev">❮</div><div class="btn btn-play" id="aToggle">▶</div><div class="btn" id="aNext">❯</div></div>
            <div class="list">${track(1, '阿雪的歌', true)}${track(2, '阿岩的歌')}${track(3, '阿竹的歌')}${track(4, '阿松的歌')}</div></div>`;
        const d = await mount(html);
        const state = () => ({
            lit: [...d.querySelectorAll('.tr')].map((n, i) => n.className.includes('active') ? i : -1).filter(i => i >= 0).join(','),
            title: d.querySelector('.song-title').textContent,
            playing: d.querySelector('[id$="app"], .app').getAttribute('data-playing'),
            play: d.querySelector('.btn-play').textContent,
        });
        const r = { start: state() };
        d.querySelectorAll('.tr')[2].click(); await wait(50); r.pick3 = state();
        d.querySelector('.btn:not(.btn-play):last-child').click(); await wait(50); r.next = state();
        d.querySelector('.btn:not(.btn-play):last-child').click(); await wait(50); r.wrap = state();
        d.querySelector('.btn:first-child').click(); await wait(50); r.prev = state();
        d.querySelector('.btn-play').click(); await wait(50); r.play = state();
        d.querySelector('.btn-play').click(); await wait(50); r.pause = state();
        // 选项卡：.tab.active 只是高亮、内容块内联藏着；旁边一个「下一页」。点选项卡、点下一页都要换内容。
        const t = await mount(`<style>.tab{cursor:pointer}.tab.active{color:red}</style><div class="tabs"><span class="tab active">一</span><span class="tab">二</span><span class="tab">三</span></div>
            <div class="panel">阿雪的第一页内容字字字</div><div class="panel" style="display:none">阿岩的第二页内容字字字</div><div class="panel" style="display:none">阿竹的第三页内容字字字</div>
            <span class="ctl next" style="cursor:pointer">下一页</span>`);
        await wait(120);
        const panels = () => [...t.querySelectorAll('.panel')].map(n => getComputedStyle(n).display !== 'none' ? 1 : 0).join('');
        const tabs = () => [...t.querySelectorAll('.tab')].map(n => n.classList.contains('active') ? 1 : 0).join('');
        t.querySelectorAll('.tab')[1].click(); await wait(80); r.tabClick = panels() + '/' + tabs();
        t.querySelector('.next').click(); await wait(80); r.tabNext = panels() + '/' + tabs();
        // 两列都有高亮、只有一对上一首／下一首：只给一列接，点一次只挪一格
        const two = await mount(`<style>.a,.b{cursor:pointer}.a.on{color:red}.b.on{color:blue}</style><div class="np"><span class="np-name">甲一</span></div>
            <div><div class="a on"><span class="x-name">甲一</span></div><div class="a"><span class="x-name">甲二</span></div></div>
            <div><div class="b on">乙一字</div><div class="b">乙二字</div></div><button class="btn-next">❯</button>`);
        two.querySelector('.btn-next').click(); await wait(50);
        r.twoLists = [...two.querySelectorAll('.a, .b')].map(n => n.classList.contains('on') ? 1 : 0).join('');
        // 「正在播放」那行带图标：只换名字那段字，图标留着
        const icon = await mount(`<style>.it{cursor:pointer}.it.cur{color:red}</style><div class="now"><i class="ico">♪</i> 阿松的歌</div>
            <div><div class="it cur"><span class="it-title">阿松的歌</span></div><div class="it"><span class="it-title">阿雪的歌</span></div></div>`);
        icon.querySelectorAll('.it')[1].click(); await wait(50);
        r.icon = !!icon.querySelector('.now .ico') && icon.querySelector('.now').textContent.includes('阿雪的歌');
        // 常驻动画（均衡器）＋播放开关：播放键只切 data-playing，不被「暂停全部动画」那套同时接走
        const eq = await mount(`<style>@keyframes b{to{height:2px}}.bar{display:inline-block;width:3px;height:9px;animation:b 1s infinite}.pl[data-playing="true"] .disc{color:red}.pbtn{cursor:pointer}</style>
            <div class="pl" data-playing="false"><div class="disc">碟</div><span class="bar"></span><span class="bar"></span><div class="pbtn btn-play">▶</div><p>${'字'.repeat(40)}</p></div>`);
        await wait(150);
        eq.querySelector('.pbtn').click(); await wait(80);
        r.eq = `${eq.querySelector('.pl').getAttribute('data-playing')}/${eq.querySelector('.pbtn').textContent}/${eq.querySelector('[data-rm-playback]')?.getAttribute('data-rm-playback') || '-'}`;
        return r;
    });
    console.log(JSON.stringify(out));
    let checks = 0;
    assert.equal(out.start.lit, '0'); checks++;
    assert.equal(out.pick3.lit, '2'); checks++;
    assert.equal(out.pick3.title, '3. 阿竹的歌'); checks++;
    assert.equal(out.next.lit, '3'); checks++;
    assert.equal(out.next.title, '4. 阿松的歌'); checks++;
    assert.equal(out.wrap.lit, '0', '最后一首再往下回到第一首'); checks++;
    assert.equal(out.prev.lit, '3'); checks++;
    assert.equal(out.play.playing, 'true'); checks++;
    assert.equal(out.play.play, '❚❚'); checks++;
    assert.equal(out.pause.playing, 'false'); checks++;
    assert.equal(out.pause.play, '▶'); checks++;
    assert.equal(out.tabClick, '010/010', '点选项卡换内容'); checks++;
    assert.equal(out.tabNext, '001/001', '下一页也换内容'); checks++;
    assert.equal(out.twoLists, '0110', '一对按钮只挪一列'); checks++;
    assert.equal(out.icon, true); checks++;
    assert.match(out.eq, /^true\/❚❚\/(?:-|playing)$/); checks++;
    assert.deepEqual(errors, []); checks++;
    console.log(`scriptlessPlayer: ${checks} checks passed`);
} finally {
    await browser?.close();
    server.close();
}
