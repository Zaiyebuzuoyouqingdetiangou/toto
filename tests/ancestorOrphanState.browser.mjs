// 状态类写在外层卡片上、管里面的分析块（.卡片.expanded .分析），卡片里一个「展开」按钮：按钮开关卡片的这个类。
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
    await page.evaluate(async query => { window.chrome = await import('/src/outputSanitizer/toolsChrome.js?' + query); }, query);
    const result = await page.evaluate(async () => {
        document.body.innerHTML = `<details open data-rabbit-mirror-css-scope="rmcss-t1"><summary>t</summary><style>
.card{border:1px solid}.card.active{border-color:blue}.an{display:none}.card.expanded .an{display:block}</style>
<div class="card active" id="c1"><div class="hd"><span>甲</span><button class="tg1">展开</button></div><div class="ds">阿雪</div><div class="an">阿岩</div></div>
<div class="card" id="c2"><div class="hd"><span>乙</span><button class="tg2">展开</button></div><div class="ds">阿竹</div><div class="an">阿松</div></div></details>`;
        const d = document.querySelector('details');
        const wired = chrome.wireOrphanStateClasses(d);
        const shown = sel => getComputedStyle(document.querySelector(sel)).display !== 'none';
        const before = [shown('#c1 .an'), shown('#c2 .an')];
        document.querySelector('.tg2').click();
        const afterTwo = [shown('#c1 .an'), shown('#c2 .an')];
        document.querySelector('.tg1').click();
        document.querySelector('.tg2').click();
        const afterAll = [shown('#c1 .an'), shown('#c2 .an')];
        const main = { wired: wired >= 2, before, afterTwo, afterAll, stillActive: document.querySelector('#c1').classList.contains('active') };
        // 反例：外层自己藏着（弹窗）、两个按钮、按钮已有插件交互、几乎整面——都不接
        const negative = html => {
            document.body.innerHTML = `<details open data-rabbit-mirror-css-scope="rmcss-t2"><summary>t</summary>${html}<p>${'字'.repeat(40)}</p></details>`;
            return chrome.wireOrphanStateClasses(document.querySelector('details'));
        };
        main.negatives = [
            negative('<style>.md{display:none}.md.open{display:flex}.x{display:none}.md.open .x{display:block}</style><div class="md"><button>关</button><div class="x">阿雪</div></div>'),
            negative('<style>.cd .x{display:none}.cd.expanded .x{display:block}</style><div class="cd"><button>一</button><button>二</button><div class="x">阿岩</div></div>'),
            negative('<style>.cd .x{display:none}.cd.expanded .x{display:block}</style><div class="cd"><button data-rm-next>下一页</button><div class="x">阿竹</div></div>'),
        ];
        // 一面先折叠着（量不出来）、后来展开：展开后照样接上，不被「试过不行」挡住
        document.body.innerHTML = `<details data-rabbit-mirror-css-scope="rmcss-t3"><summary>t</summary><style>.cd .x{display:none}.cd.expanded .x{display:block}</style><div class="cd"><button class="go">展开</button><div class="x">阿松</div></div><p>${'字'.repeat(40)}</p></details>`;
        const folded = document.querySelector('details');
        main.closedFirst = chrome.wireOrphanStateClasses(folded);
        folded.open = true;
        await new Promise(resolve => setTimeout(resolve, 50));
        document.querySelector('.go').click();
        main.openedLater = getComputedStyle(document.querySelector('.cd .x')).display !== 'none';
        return main;
    });
    assert.deepEqual(result, { wired: true, before: [false, false], afterTwo: [false, true], afterAll: [true, false], stillActive: true, negatives: [0, 0, 0], closedFirst: 0, openedLater: true });
    assert.deepEqual(errors, []);
    console.log('ancestorOrphanState ok');
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
