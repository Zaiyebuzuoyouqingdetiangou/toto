// 方言表：「还没揭开／还没按」写成 initial、hidden；「答对」写成 answer；CSS 按 data-rm-status 写状态，这几类都要按意思认。
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
const wrap = body => `<toto data-rabbit-mirror="true" style="display:block"><details open data-rabbit-mirror-css-scope="sc1"><summary>字字</summary>${body}</details></toto>`;
const faces = {
    // 一次性效果：initial 按之前显示、按过藏起来；changed 按过才显示；CSS 按 data-rm-status 写状态
    effect: wrap(`<style>[data-rm-show="changed"]{display:none}[data-rm-status="changed"] [data-rm-show="changed"]{display:block}[data-rm-status="changed"] .fill{width:98%}.fill{width:25%;height:4px;background:red}</style>
<div data-rm-ui="effect"><span class="ini" data-rm-show="initial">阿雪</span><span class="chg" data-rm-show="changed">阿岩</span><div class="fill"></div><button class="fire" data-rm-fire type="button">按</button></div>`),
    // 揭示：data-rm-show="hidden" 揭开前显示、揭开后藏
    reveal: wrap(`<div data-rm-ui="reveal"><input class="rg" type="range" min="0" max="100" value="0"><div data-rm-cover="true">盖</div>
<div class="before" data-rm-show="hidden">阿竹</div><div class="after" data-rm-show="done">某教</div></div>`),
    // 输入答案：answer／!answer
    input: wrap(`<div data-rm-ui="input" data-rm-answer="字"><input class="ip" type="text"><div class="hint" data-rm-show="!answer">提示</div><div class="ok" data-rm-show="answer" style="display:none">答对</div></div>`),
    // 连线：结果写成 class 带 feedback、被 CSS 藏着、没写 data-rm-show
    connect: wrap(`<style>.fbk{display:none}</style><div data-rm-ui="connect"><div class="e1" data-rm-end="a" role="button" tabindex="0">阿雪</div><div class="e2" data-rm-end="b" role="button" tabindex="0">阿岩</div>
<div class="e3" data-rm-end="b" role="button" tabindex="0">阿竹</div><div class="e4" data-rm-end="a" role="button" tabindex="0">某教</div><div class="rmc-x1-y2-1-z3-feedback fbk">连好了</div></div>`),
};
let browser;
try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 400, height: 900 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    await page.goto(origin);
    const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
    await page.evaluate(async query => { window.ids = await import('/src/outputSanitizer/idsAndRearm.js?' + query); }, query);
    const mount = html => page.evaluate(html => {
        document.body.innerHTML = html;
        const root = document.querySelector('details');
        ids.rearmRabbitMirrorSerializedInteractionRoot(root); ids.activateRabbitMirrorInteractionRescue(root);
    }, html);
    const seen = sel => page.evaluate(sel => { const n = document.querySelector(sel); if (!n) return 'missing'; const s = getComputedStyle(n); const r = n.getBoundingClientRect(); return s.display !== 'none' && Number(s.opacity) > 0.05 && r.height > 0; }, sel);

    await mount(faces.effect); await page.waitForTimeout(100);
    assert.equal(await seen('.ini'), true, 'initial shows before fire');
    assert.equal(await seen('.chg'), false, 'changed hidden before fire');
    await page.click('.fire'); await page.waitForTimeout(150);
    assert.equal(await seen('.chg'), true, 'changed after fire');
    assert.equal(await seen('.ini'), false, 'initial hides after fire');
    assert.ok(await page.evaluate(() => document.querySelector('.fill').getBoundingClientRect().width > 300), 'status attr drives author CSS');

    await mount(faces.reveal); await page.waitForTimeout(100);
    assert.equal(await seen('.before'), true, 'hidden-word shows before reveal');
    assert.equal(await seen('.after'), false);
    await page.evaluate(() => { const r = document.querySelector('.rg'); r.value = '100'; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.waitForTimeout(200);
    assert.equal(await seen('.after'), true, 'revealed');
    assert.equal(await seen('.before'), false, 'hidden-word gone after reveal');

    await mount(faces.input); await page.waitForTimeout(100);
    assert.equal(await seen('.hint'), true); assert.equal(await seen('.ok'), false);
    await page.fill('.ip', '字'); await page.waitForTimeout(150);
    assert.equal(await seen('.ok'), true, 'answer word'); assert.equal(await seen('.hint'), false);

    await mount(faces.connect); await page.waitForTimeout(100);
    const fb = '.fbk';
    assert.equal(await seen(fb), false, 'feedback hidden at start');
    for (const sel of ['.e1', '.e4', '.e2', '.e3']) { await page.click(sel); await page.waitForTimeout(80); }
    await page.waitForTimeout(150);
    assert.equal(await seen(fb), true, 'feedback after all pairs');

    assert.deepEqual(errors, []);
    console.log('behaviorDialectWords ok');
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
