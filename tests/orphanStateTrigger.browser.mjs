// 「点了加个状态类」却没写触发器：主体默认藏着时，由它前面那个能点的东西来切换，不接在点不到的主体上。
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
    await page.evaluate(async query => { window.orphan = await import('/src/outputSanitizer/orphanStateWiring.js?' + query); }, query);
    const html = `<details open><summary>字</summary><style>.trig{cursor:pointer;color:blue}.panel{display:none}.panel.active{display:block}.card{transition:none}.card.flipped{color:red}</style>
<div class="script">字字字<span class="trig">点这里</span><div class="panel"><button class="inner">里面的按钮</button>阿雪 字字字</div></div>
<div class="card">阿岩</div></details>`;
    const result = await page.evaluate(html => {
        document.body.innerHTML = html;
        const panel = document.querySelector('.panel'), card = document.querySelector('.card'), trig = document.querySelector('.trig');
        const out = {};
        out.wiredPanel = orphan.attachOrphanStateToggle(panel, 'active');
        out.wiredCard = orphan.attachOrphanStateToggle(card, 'flipped');
        trig.click(); out.afterTrig = panel.classList.contains('active');
        document.querySelector('.inner').click(); out.innerKeeps = panel.classList.contains('active');
        trig.click(); out.afterSecond = panel.classList.contains('active');
        card.click(); out.card = card.classList.contains('flipped');
        // 存档还原：克隆一份重新接线（旧档里接在面板自己身上的也要改接到前面的触发处）
        const saved = document.body.innerHTML;
        document.body.innerHTML = saved;
        const panel2 = document.querySelector('.panel');
        panel2.setAttribute('role', 'button');
        out.rearmed = orphan.rearmOrphanStateWiring(document.body);
        document.querySelector('.trig').click(); out.afterRearm = panel2.classList.contains('active');
        out.panelRole = panel2.getAttribute('role');
        // 一个按钮后面跟着两块藏着的面板：两块都由它开
        document.body.innerHTML = `<style>.p2{display:none}.p2.open{display:block}</style><button class="b2">开</button><div class="p2 x">阿竹</div><div class="p2 y">某教</div>`;
        orphan.attachOrphanStateToggle(document.querySelector('.x'), 'open'); orphan.attachOrphanStateToggle(document.querySelector('.y'), 'open');
        document.querySelector('.b2').click();
        out.both = document.querySelector('.x').classList.contains('open') && document.querySelector('.y').classList.contains('open');
        // 存档时正开着（带着状态类）：照样接在前面的按钮上，关上以后还能再开
        document.body.innerHTML = `<style>.p3{display:none}.p3.open{display:block}</style><span class="t3-btn">开</span><div class="p3 open">阿雪</div>`;
        orphan.attachOrphanStateToggle(document.querySelector('.p3'), 'open');
        document.querySelector('.t3-btn').click(); document.querySelector('.t3-btn').click();
        out.savedOpen = document.querySelector('.p3').classList.contains('open');
        // 按钮包在前面那一块里（签筒和摇签按钮在一块，结果面板在后面）：由里面唯一的按钮来开
        document.body.innerHTML = `<style>.res{display:none}.res.active{display:block}.tube{cursor:pointer}</style><div class="area"><div class="tube">筒</div><button class="draw">摇签</button></div><div class="res">某教</div>`;
        orphan.attachOrphanStateToggle(document.querySelector('.res'), 'active');
        document.querySelector('.draw').click();
        out.innerBtn = document.querySelector('.res').classList.contains('active');
        // 反例：前面那块里唯一的按钮已经有别的用处（插件交互、弹窗），或藏在没展开的折叠里：不接
        for (const btn of ['<button data-rm-next>下一页</button>', '<button popovertarget="pp">弹</button>', '<details><summary>折</summary><button>摇</button></details>',
            '<button data-rabbit-mirror-button-adjacent-hidden-rescue="true">摇</button>', '<button aria-controls="r2x">摇</button><i id="r2x"></i>', '<button disabled>摇</button>',
            '<button>摇</button><button>停</button>', '<button>摇</button><button style="display:none">停</button>', '<button type="submit">摇</button>', '<button style="visibility:hidden">摇</button>', '<button aria-disabled="true">摇</button>', '<label><button>摇</button></label>', '<button>摇</button>' + '字'.repeat(90)]) {
            document.body.innerHTML = `<style>.r2{display:none}.r2.active{display:block}</style><div class="blk">${btn}</div><div class="r2">阿岩</div>`;
            if (orphan.attachOrphanStateToggle(document.querySelector('.r2'), 'active')) out.neg = (out.neg || '') + btn;
        }
        // 对照：同样的块，按钮是闲着的（包括只被「点了没反应」兜底标过的）就接上——证明上面的反例是被那些用处挡下来的
        for (const btn of ['<button>摇</button>', '<button data-rabbit-mirror-inert-action-rescue="true" data-rabbit-mirror-inert-action-active="false">摇</button>']) {
            document.body.innerHTML = `<style>.r2{display:none}.r2.active{display:block}</style><div class="blk">${btn}</div><div class="r2">阿岩</div>`;
            if (!orphan.attachOrphanStateToggle(document.querySelector('.r2'), 'active')) out.pos = (out.pos || '') + btn;
        }
        // 中间隔着 <style>，或块和面板之间夹一小段没按钮的提示字：照样找得到
        document.body.innerHTML = `<style>.r3{display:none}.r3.active{display:block}</style><div class="blk"><button class="b3">摇</button></div><style>.x{}</style><div class="r3">阿竹</div>`;
        if (!orphan.attachOrphanStateToggle(document.querySelector('.r3'), 'active')) out.pos = (out.pos || '') + 'style-between';
        document.body.innerHTML = `<style>.r4{display:none}.r4.active{display:block}</style><button class="b4">开</button><small>提示</small><div class="r4">阿松</div>`;
        if (!orphan.attachOrphanStateToggle(document.querySelector('.r4'), 'active')) out.pos = (out.pos || '') + 'skip-small';
        // 默认藏着、前面没有能点的：不接
        document.body.innerHTML = `<style>.lone{display:none}.lone.active{display:block}</style><p>${'字'.repeat(60)}</p><div class="lone">某教</div>`;
        out.lone = orphan.attachOrphanStateToggle(document.querySelector('.lone'), 'active');
        return out;
    }, html);
    assert.deepEqual(result, { wiredPanel: true, wiredCard: true, afterTrig: true, innerKeeps: true, afterSecond: false, card: true, rearmed: 2, afterRearm: true, panelRole: null, both: true, savedOpen: true, innerBtn: true, lone: false });
    // 收藏重开：收藏存的是 cloneNode 的 outerHTML，接线记号留着、监听丢了。经共用的 rearm 入口（rearmRabbitMirrorSerializedInteractionRoot）
    // 接回后点触发处照样能开关；收藏打开走的 ensureExternalTools（收藏不走工具栏链）也要接回。
    await page.evaluate(async query => {
        window.rearm = await import('/src/outputSanitizer/idsAndRearm.js?' + query);
        window.geometry = await import('/src/independentApi/geometry.js?' + query);
    }, query);
    const favorite = await page.evaluate(html => {
        const out = {};
        document.body.innerHTML = html;
        orphan.attachOrphanStateToggle(document.querySelector('.panel'), 'active');
        orphan.attachOrphanStateToggle(document.querySelector('.card'), 'flipped');
        const saved = document.querySelector('details').cloneNode(true).outerHTML;
        // 和 extractReadyDetails 一样：先在脱离文档的 template 里解析、rearm，再挂上去
        const template = document.createElement('template');
        template.innerHTML = saved;
        const details = template.content.querySelector('details');
        window.rearm.rearmRabbitMirrorSerializedInteractionRoot(details);
        document.body.replaceChildren(details);
        document.querySelector('.trig').click(); out.detached = document.querySelector('.panel').classList.contains('active');
        document.querySelector('.card').click(); out.detachedCard = document.querySelector('.card').classList.contains('flipped');
        // 再 rearm 一次不重复接（点一下只切一次）
        window.rearm.rearmRabbitMirrorSerializedInteractionRoot(document.body);
        document.querySelector('.trig').click(); out.noDouble = document.querySelector('.panel').classList.contains('active');
        // 收藏宿主：直接塞进 outerHTML（不经 rearm），由 ensureExternalTools 接回
        const host = document.createElement('div');
        host.dataset.rmSource = 'favorite'; host.dataset.rmFavorite = 'true'; host.dataset.rmState = 'ready'; host.dataset.rmPlacement = 'contained';
        host.innerHTML = saved;
        document.body.replaceChildren(host);
        try { window.geometry.ensureExternalTools(host); } catch (error) { out.ensureError = String(error?.message || error); }
        host.querySelector('.trig').click(); out.favorite = host.querySelector('.panel').classList.contains('active');
        host.querySelector('.card').click(); out.favoriteCard = host.querySelector('.card').classList.contains('flipped');
        return out;
    }, html);
    assert.deepEqual(favorite, { detached: true, detachedCard: true, noDouble: false, favorite: true, favoriteCard: true });
    assert.deepEqual(errors, []);
    console.log('orphanStateTrigger ok');
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
