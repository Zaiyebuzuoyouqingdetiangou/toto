// 输入暗号区：显示条件写成 CSS 选择器样子（[data-rm-match]、:not(...)）也认；没写标记的「发送」按钮就是交卷键。
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
        window.behavior = await import('/src/outputSanitizer/behaviorInteractions.js?' + query);
    }, query);
    const result = await page.evaluate(() => {
        const out = {};
        // 输入暗号：显示条件写成 [data-rm-match]，旁边一个没写标记的「发送」按钮
        document.body.innerHTML = `<details open data-rabbit-mirror-css-scope="s1"><summary>t</summary>
<div data-rm-ui="input" data-rm-answer="字字"><input type="text" class="f"><button class="send">发送</button>
<div data-rm-show="[data-rm-match]" class="res">阿雪</div><div data-rm-show=':not([data-rm-match="true"])' class="hint">提示</div></div></details>`;
        const d = document.querySelector('details');
        behavior.installBehaviorInteractions(d);
        const shown = sel => getComputedStyle(document.querySelector(sel)).display !== 'none';
        out.before = [shown('.res'), shown('.hint')];
        out.sendKnown = behavior.hasBehaviorInteractionControl(d, document.querySelector('.send'));
        const field = document.querySelector('.f');
        field.value = '字字';
        document.querySelector('.send').click();
        out.after = [shown('.res'), shown('.hint')];
        field.value = '错';
        field.dispatchEvent(new Event('input', { bubbles: true }));
        out.wrong = [shown('.res'), shown('.hint')];
        // 两个框：交卷键核对它前面最近的那个；「清空」不算交卷键
        document.body.innerHTML = `<details open data-rabbit-mirror-css-scope="s2"><summary>t</summary>
<div data-rm-ui="input" data-rm-answer="对"><input type="text" class="name"><input type="text" class="ans"><button class="go">提交</button><button class="clr">清空</button>
<div data-rm-show='[data-rm-match = "true"]' class="ok">阿岩</div></div></details>`;
        const d2 = document.querySelector('details');
        behavior.installBehaviorInteractions(d2);
        document.querySelector('.name').value = '错';
        document.querySelector('.ans').value = '对';
        document.querySelector('.go').click();
        out.second = shown('.ok');
        out.clearKnown = behavior.hasBehaviorInteractionControl(d2, document.querySelector('.clr'));
        return out;
    });
    assert.deepEqual(result, { before: [false, true], sendKnown: true, after: [true, false], wrong: [false, true], second: true, clearKnown: false });
    const tokens = await page.evaluate(async query => {
        const results = await import('/src/outputSanitizer/behaviorResults.js?' + query);
        const node = document.createElement('div');
        node.setAttribute('data-rm-show', '[data-rm-picked="阿竹"] !data-rm-done :not([data-rm-match]) [data-rm-x="a b"] 甲');
        return results.behaviorShowTokens(node);
    }, query);
    assert.deepEqual(tokens, ['阿竹', '!done', '!match', 'a b', '甲']);
    assert.deepEqual(errors, []);
    console.log('inputShowSelector ok');
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
