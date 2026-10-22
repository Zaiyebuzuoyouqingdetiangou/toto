// 模型漏写外层 <details><summary>、直接把本体写在 <toto> 里时：补上外壳（标题取本体的标题行，样式作用域跟着搬），抄进来的状态栏去掉。
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const server = createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    res.setHeader('Content-Type', 'text/javascript');
    if (pathname === '/extensions.js') return res.end('const ctx = { chat: [], chatId: "c", getCurrentChatId: () => "c", characterId: 0, characters: [{ name: "测试" }], name2: "测试" }; export const extension_settings = { rabbit_mirror_theater: {} }; export const getContext = () => ctx; export const renderExtensionTemplateAsync = async () => ""; export const extension_prompt_types = {};');
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){},emit(){}}; export const event_types = {}; export const getRequestHeaders = () => ({}); export const saveChatConditional = async () => {}; export const chat_metadata = {}; export const this_chid = 0; export const characters = []; export const substituteParams = s => s; export const main_api = ""; export const name1 = ""; export const name2 = "";');
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    const file = path.resolve(rootDir, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(rootDir + path.sep)) { res.statusCode = 403; return res.end(); }
    try { res.end(await readFile(file)); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));
await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
await page.goto(origin);
const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
const result = await page.evaluate(async query => {
    window.SillyTavern = { getContext: () => ({ chat: [], chatId: 'c' }) };
    const request = await import('/src/independentApi/request.js?' + query);
    const body = '<style>.st{color:red}</style><div class="st"><div class="card-title">🔥 字字字的十二种反应</div><div>阿雪：字字字字字字字字字字字字</div><div>阿岩：字字字字字字字字字字字字</div></div>';
    const bare = request.extractMirrorInner(`<toto data-rabbit-mirror="true">\n${body}\n<status bar><日期>某日</日期></status bar>\n</toto>`);
    const doc = new DOMParser().parseFromString(`<toto>${bare}</toto>`, 'text/html');
    const det = doc.querySelector('toto > details');
    return {
        wrapped: !!det && !!det.querySelector(':scope > summary'),
        summary: det?.querySelector(':scope > summary')?.textContent || '',
        scopeMoved: /^<details[^>]*data-rabbit-mirror-css-scope="/.test(bare),
        noStatus: !/status|某日/.test(bare),
        kept: /阿雪/.test(bare) && /阿岩/.test(bare),
        h2Title: request.extractMirrorInner('<toto><div class="pg"><h2>阿竹的一天</h2></div><p>字字字字字字字字字字字字字字字字字字字字字</p></toto>').includes('【兔子镜：阿竹的一天】'),
        normal: (html => (html.match(/<details/g) || []).length === 1 && /^<details[^>]*><summary>【兔子镜：某教】<\/summary><p>正文<\/p><\/details>$/.test(html))(request.extractMirrorInner('<toto><details><summary>【兔子镜：某教】</summary><p>正文</p></details></toto>')),
        prose: !/<details/.test(request.extractMirrorInner('<toto><p>字字字字字字字字字字字字字字字字字字字字字字字字字字字字字字</p></toto>')),
        completeWins: /【兔子镜：某教】/.test(request.extractMirrorInner(`<toto>${body}</toto><toto><details><summary>【兔子镜：某教】</summary><p>正文</p></details></toto>`)),
        fullKeepsStatus: /status-bar/.test(request.extractMirrorInner('<toto><details><summary>【兔子镜：某教】</summary><div class="phone"><status-bar>字字</status-bar><p>正文</p></div></details></toto>')),
        movedScope: /^<details data-rabbit-mirror-css-scope="sx1">/.test(request.extractMirrorInner(`<toto data-rabbit-mirror-css-scope="sx1">${body}</toto>`)),
        tiny: !/<details/.test(request.extractMirrorInner('<toto><p>字</p></toto>')),
    };
}, query);
await browser.close(); server.close();
assert.deepEqual(pageErrors, []);
assert.equal(result.wrapped, true);
assert.equal(result.summary, '【兔子镜：字字字的十二种反应】');
assert.equal(result.scopeMoved, true);
assert.equal(result.noStatus, true);
assert.equal(result.kept, true);
assert.equal(result.h2Title, true);
assert.equal(result.normal, true);
assert.equal(result.tiny, true);
assert.equal(result.prose, true);
assert.equal(result.completeWins, true);
assert.equal(result.fullKeepsStatus, true);
assert.equal(result.movedScope, true);
console.log('missingMirrorShell ok');
