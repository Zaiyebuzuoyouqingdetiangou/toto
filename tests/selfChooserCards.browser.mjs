// 选项卡片自己写了「选中才显示」（data-rm-show="自己的键"），卡片里又是选它的按钮：卡片一直显示，选中的高亮；
// 下面的结果照旧只显示选中的那段。走真实的挂工具流程，也测存档里带着「已选第三张、前两张藏着」的样子挂回来。
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
        const card = (key, name, hidden) => `<div class="card" data-rm-show="${key}"${hidden ? ' style="display:none !important;" hidden data-rm-result-active="false" data-rm-result-display=""' : ''}><div>${name}</div><button class="btn" data-rm-pick="${key}">选${name}</button></div>`;
        const face = stored => `<style>.card{border:1px solid #333}.card[data-rm-active]{border-color:#a855f7}</style><div data-rm-ui="pick"${stored ? ' data-rm-picked="m3"' : ''}>
            <div class="grid">${card('m1', '阿雪', stored)}${card('m2', '阿岩', stored)}${card('m3', '阿竹', false)}</div>
            <div class="stage"><div data-rm-show="m1">阿雪的说法</div><div data-rm-show="m2">阿岩的说法</div><div data-rm-show="m3">阿竹的说法</div></div>
            <div class="votes"><span data-rm-pick="m1" role="button">投阿雪</span><span data-rm-pick="m2" role="button">投阿岩</span><span data-rm-pick="m3" role="button">投阿竹</span></div></div>`;
        const visible = n => getComputedStyle(n).display !== 'none' && !n.hidden;
        const read = d => ({
            cards: [...d.querySelectorAll('.card')].map(n => visible(n) ? 1 : 0).join(''),
            active: [...d.querySelectorAll('.card')].map(n => n.hasAttribute('data-rm-active') ? 1 : 0).join(''),
            stage: [...d.querySelectorAll('.stage > [data-rm-show]')].map(n => visible(n) ? 1 : 0).join(''),
        });
        const r = {};
        const d = await mount(face(false));
        r.start = read(d);
        d.querySelectorAll('.card .btn')[0].click(); await wait(80); r.pick1 = read(d);
        d.querySelectorAll('.card .btn')[1].click(); await wait(80); r.pick2 = read(d);
        d.querySelectorAll('.votes [role=button]')[2].click(); await wait(80); r.vote3 = read(d);
        const s = await mount(face(true));
        r.stored = read(s);
        s.querySelectorAll('.card .btn')[0].click(); await wait(80); r.storedPick1 = read(s);
        // 结果块里只是放了一个别的按钮（不是选它自己的键）：照旧按选中显隐
        const o = await mount(`<div data-rm-ui="pick"><button class="top" data-rm-pick="a">甲</button><button class="top" data-rm-pick="b">乙</button>
            <div class="res" data-rm-show="a">甲的结果<button data-rm-pick="b">换乙</button></div><div class="res" data-rm-show="b">乙的结果</div></div>`);
        o.querySelectorAll('.top')[0].click(); await wait(80);
        r.other = [...o.querySelectorAll('.res')].map(n => visible(n) ? 1 : 0).join('');
        return r;
    });
    console.log(JSON.stringify(out));
    let checks = 0;
    assert.equal(out.start.cards, '111'); checks++;
    assert.equal(out.pick1.cards, '111'); checks++;
    assert.equal(out.pick1.active, '100'); checks++;
    assert.equal(out.pick1.stage, '100'); checks++;
    assert.equal(out.pick2.cards, '111'); checks++;
    assert.equal(out.pick2.active, '010'); checks++;
    assert.equal(out.pick2.stage, '010'); checks++;
    assert.equal(out.vote3.active, '001'); checks++;
    assert.equal(out.vote3.stage, '001'); checks++;
    assert.equal(out.stored.cards, '111', '存档里藏着的选项卡挂回来也显示'); checks++;
    assert.equal(out.storedPick1.cards, '111'); checks++;
    assert.equal(out.storedPick1.active, '100'); checks++;
    assert.equal(out.storedPick1.stage, '100'); checks++;
    assert.equal(out.other, '10'); checks++;
    assert.deepEqual(errors, []); checks++;
    console.log(`selfChooserCards: ${checks} checks passed`);
} finally {
    await browser?.close();
    server.close();
}
