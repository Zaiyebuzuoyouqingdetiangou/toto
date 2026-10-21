// 外置模式下模型给整面写的外框挪到标题下面的正文那一块；只在外置壳里画，不进存档，插件清掉的衬底不刷回来。
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
    if (pathname === '/extensions.js') return res.end('export const extension_settings = {}; export const getContext = () => ({ chat: [], chatId: "t" }); export const renderExtensionTemplateAsync = async () => "";');
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){},emit(){}}; export const event_types = {}; export const chat_metadata = {}; export const saveChatDebounced = () => {}; export const getRequestHeaders = () => ({}); export const substituteParams = s => s; export const this_chid = 0; export const characters = []; export const name1 = "u"; export const name2 = "c";');
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/style.css"><body><div id="chat"></div>'); }
    if (pathname.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
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
await page.evaluate(async query => {
    window.ff = await import('/src/independentApi/faceFrame.js?' + query);
}, query);
let checks = 0;
const run = (inner, { placement = 'external', after } = {}) => page.evaluate(({ inner, placement, after }) => {
    const chat = document.getElementById('chat');
    chat.innerHTML = `<div class="rabbit-mirror-external-shell" data-rm-source="independent" data-rm-placement="${placement}">${inner}</div>`;
    const host = chat.firstElementChild;
    const carried = ff.carryExternalFaceFrames(host);
    if (after === 'neutralize') host.querySelector('details > div').style.setProperty('background', 'transparent', 'important');
    if (after === 'clear') ff.clearFaceFrame(host.querySelector('details'));
    const body = [...host.querySelector('details').children].find(node => node.tagName === 'DIV');
    const cs = getComputedStyle(body);
    const d = getComputedStyle(host.querySelector('details'));
    return { carried, bg: cs.backgroundColor, border: cs.borderTopWidth + ' ' + cs.borderTopColor, radius: cs.borderTopLeftRadius, shadow: cs.boxShadow, detailsBg: d.backgroundColor, mark: body.getAttribute('data-rm-face-frame-body') };
}, { inner, placement, after });
const FACE = body => `<details data-rabbit-mirror-external-details="true" open style="background:#F9F6FC;border:1px solid #D8CEE8;border-radius:18px;box-shadow:0 8px 24px rgba(108,91,140,0.08)"><summary>【兔子镜：清谈会】</summary>${body}</details>`;

// 1 外框挪到正文：底色、边、圆角、阴影都在正文上，details 自己仍然没有框
let r = await run(FACE('<div style="padding:16px">正文</div>'));
assert.equal(r.carried, 1); checks++;
assert.equal(r.bg, 'rgb(249, 246, 252)'); checks++;
assert.equal(r.border, '1px rgb(216, 206, 232)'); checks++;
assert.equal(r.radius, '18px'); checks++;
assert.match(r.shadow, /rgba\(108, 91, 140, 0\.08\)/); checks++;
assert.equal(r.detailsBg, 'rgba(0, 0, 0, 0)', '标题条外面不再套一层框'); checks++;

// 2 正文自己画了底色：底色不补，边框照补
r = await run(FACE('<div style="background:#123456">正文</div>'));
assert.equal(r.bg, 'rgb(18, 52, 86)'); checks++;
assert.equal(r.mark.split(' ').includes('bg'), false); checks++;
assert.equal(r.border, '1px rgb(216, 206, 232)'); checks++;

// 3 插件用 !important 清掉的整宽衬底不被刷回来
r = await run(FACE('<div>正文</div>'), { after: 'neutralize' });
assert.equal(r.bg, 'rgba(0, 0, 0, 0)'); checks++;

// 4 外框写在 class 里、还带过渡：照样量得到
r = await run('<style>.f{background:rgb(10,20,30);border:2px solid rgb(1,2,3);transition:all .4s}</style>' + FACE('<div>正文</div>').replace('style="', 'class="f" data-x="').replace(/data-x="[^"]*"/, ''));
assert.equal(r.carried, 1); checks++;
assert.equal(r.bg, 'rgb(10, 20, 30)'); checks++;

// 5 正文分成好几块：不知道框哪一块，不挪
r = await run(FACE('<div>引子</div><div>主体</div>'));
assert.equal(r.carried, 0); checks++;

// 6 不在外置壳里（内嵌、收藏、存档）不画；清掉标记后也不画
r = await run(FACE('<div>正文</div>'), { placement: 'inline' });
assert.equal(r.bg, 'rgba(0, 0, 0, 0)'); checks++;
r = await run(FACE('<div>正文</div>'), { after: 'clear' });
assert.equal(r.bg, 'rgba(0, 0, 0, 0)'); checks++;
assert.equal(r.mark, null); checks++;

// 7 模型没写外框：什么都不做
r = await run('<details data-rabbit-mirror-external-details="true" open><summary>t</summary><div>正文</div></details>');
assert.equal(r.carried, 0); checks++;

// 8 正文在原外框里缩进一圈（margin:16px）：去掉左右缩进，和标题一样宽；宽屏居中的窄面（左右很宽）不动
const flush = await page.evaluate(() => {
    const chat = document.getElementById('chat');
    chat.style.width = '400px';
    const make = margin => `<div class="rabbit-mirror-external-shell" data-rm-source="independent" data-rm-placement="external"><details data-rabbit-mirror-external-details="true" open style="background:#cde;border-radius:20px"><summary>标题</summary><div class="b" style="margin:${margin};background:#eef">正文</div></details></div>`;
    const out = {};
    for (const [key, margin] of [['inset', '16px'], ['center', '0 120px'], ['oneSide', '0 0 0 16px'], ['fixedCard', '0 auto;width:360px']]) {
        chat.innerHTML = make(margin);
        const host = chat.firstElementChild;
        ff.carryExternalFaceFrames(host);
        const body = host.querySelector('.b'), summary = host.querySelector('summary');
        out[key] = { flush: body.getAttribute('data-rm-face-flush'), same: Math.abs(body.getBoundingClientRect().width - summary.getBoundingClientRect().width) < 1, top: getComputedStyle(body).marginTop };
    }
    // 收起着挂上去：先不量，展开时量
    chat.innerHTML = make('16px').replace(' open ', ' ');
    const host = chat.firstElementChild;
    ff.carryExternalFaceFrames(host);
    const body = host.querySelector('.b');
    out.collapsed = body.getAttribute('data-rm-face-flush');
    host.querySelector('details').open = true;
    return new Promise(resolve => setTimeout(() => { out.opened = body.getAttribute('data-rm-face-flush'); resolve(out); }, 50));
});

assert.equal(flush.opened, 'true', '展开时再量'); checks++;
assert.deepEqual(flush.inset, { flush: 'true', same: true, top: '16px' }, '左右缩进去掉、上下不动'); checks++;
assert.equal(flush.center.flush, null); checks++;
assert.equal(flush.oneSide.flush, null); checks++;
assert.equal(flush.fixedCard.flush, null, '写死宽度、margin:auto 居中的卡片不挤到左边'); checks++;

assert.deepEqual(pageErrors, []); checks++;
await browser.close(); server.close();
console.log(`faceFrame: ${checks} checks passed`);
