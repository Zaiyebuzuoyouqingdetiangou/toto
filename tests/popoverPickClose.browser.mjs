// 弹窗里选一个单选项（读档选档位）：选完弹窗收起，能看到选了以后的变化；弹窗里的复选框不收。走真实的挂工具流程。
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
        const d = await mount(`<style>#s1,#s2{display:none}.a,.b{padding:4px}.b{display:none}#s2:checked~.stage .a{display:none}#s2:checked~.stage .b{display:block}
            .pop{position:absolute;inset:0;margin:auto;width:90%;height:85%;background:#111;display:flex;flex-direction:column}.slot{cursor:pointer}</style>
            <div class="vp" style="position:relative"><input type="radio" name="g" id="s1" checked><input type="radio" name="g" id="s2">
            <button class="open" popovertarget="pp">读取档案</button><div class="stage"><div class="a">阿雪的第一段</div><div class="b">阿岩的第二段</div></div>
            <div id="pp" popover class="pop"><button popovertarget="pp" popovertargetaction="hide">关闭</button>
            <label for="s1" class="slot">档位一</label><label for="s2" class="slot">档位二</label><label><input type="checkbox" class="cb">记住</label></div></div>`);
        const pop = d.querySelector('[popover]');
        const open = () => { try { return pop.matches(':popover-open'); } catch { return getComputedStyle(pop).display !== 'none'; } };
        const r = {};
        d.querySelector('.open').click(); await wait(50); r.opened = open();
        d.querySelector('.cb').click(); await wait(250); r.afterCheckbox = open();
        d.querySelectorAll('.slot')[1].click(); await wait(250);
        r.afterPick = open();
        r.second = getComputedStyle(d.querySelector('.b')).display !== 'none';
        // 弹窗里自己的分页（单选也在弹窗里）：点了不收
        const t = await mount(`<style>.p{display:none}#q1:checked~.p1,#q2:checked~.p2{display:block}</style><button class="o" popovertarget="tp">打开</button>
            <div id="tp" popover><input type="radio" name="t" id="q1" checked><input type="radio" name="t" id="q2"><label for="q1">一</label><label for="q2" class="l2">二</label>
            <div class="p p1">阿竹的一页</div><div class="p p2">阿松的二页</div></div>`);
        const tp = t.querySelector('[popover]');
        t.querySelector('.o').click(); await wait(50); t.querySelector('.l2').click(); await wait(250);
        r.inner = tp.matches(':popover-open');
        return r;
    });
    console.log(JSON.stringify(out));
    let checks = 0;
    assert.equal(out.opened, true); checks++;
    assert.equal(out.afterCheckbox, true, '复选框不收'); checks++;
    assert.equal(out.afterPick, false, '选了档位就收起'); checks++;
    assert.equal(out.second, true, '能看到第二段'); checks++;
    assert.equal(out.inner, true, '弹窗里自己的分页不收'); checks++;
    assert.deepEqual(errors, []); checks++;
    console.log(`popoverPickClose: ${checks} checks passed`);
} finally {
    await browser?.close();
    server.close();
}
