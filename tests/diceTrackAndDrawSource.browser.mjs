// 大富翁：掷骰子后棋子按点数往前走；诊断里写出每个图框的画面描述是模型写的还是插件补的。
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
await page.evaluate(async query => {
    window.dice = await import('/src/outputSanitizer/diceTrackRescue.js?' + query);
    window.diag = await import('/src/outputSanitizer/diagnostics.js?' + query);
}, query);
let checks = 0;
const run = (html, actions) => page.evaluate(async ({ html, actions }) => {
    document.body.innerHTML = html;
    const root = document.body.firstElementChild;
    const roll = root.querySelector('[data-rm-ui="roll"]');
    // 模拟驱动：每次点骰子按顺序换一个点数（真驱动随机），在救援之前登记。
    const seq = html.includes('data-no-driver') ? [] : [3, 4, 5, 2];
    let n = 0;
    const drive = event => { if (seq.length && event.target.closest('[data-rm-roll]')) roll.setAttribute('data-rm-picked', String(seq[n++ % seq.length])); };
    roll?.addEventListener('click', drive);
    roll?.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.target.matches('button')) drive(event); });
    const bound = dice.installDiceTrackRescue(root);
    const again = dice.installDiceTrackRescue(root);
    const out = [];
    const pos = () => [...root.querySelectorAll(`input[type=radio][name="${root.querySelector('input[type=radio]')?.name}"]`)].findIndex(input => input.checked);
    let changes = 0;
    root.addEventListener('change', () => changes++);
    out.push(pos());
    for (const act of actions) {
        if (act === 'click') root.querySelector('[data-rm-roll]').click();
        else root.querySelector('[data-rm-roll]').dispatchEvent(new KeyboardEvent('keydown', { key: act, bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 20));
        out.push(pos());
    }
    return { bound, again, out, changes };
}, { html, actions });

const cells = (count, name = 'pos', prefix = 'c') => Array.from({ length: count }, (_, i) => `<input type="radio" name="${name}" id="${prefix}${i}"${i === 0 ? ' checked' : ''}><label for="${prefix}${i}">格${i + 1}</label>`).join('');
const styleFor = (count, prefix = 'c') => `<style>${Array.from({ length: count }, (_, i) => `[id="${prefix}${i}"]:checked ~ .board .p${i}{display:block}`).join('')}</style>`;
const STYLE = styleFor(8);
const ROLL = '<div data-rm-ui="roll"><span data-rm-roll role="button" tabindex="0">掷骰子</span><b data-rm-show="1">一</b><b data-rm-show="2">二</b><b data-rm-show="3">三</b></div>';

// 1 掷 3、4、5、2：8 格的棋盘上走到 3、7、4（绕回来）、6
let r = await run(`<div>${STYLE}${cells(8)}<div class="board"></div>${ROLL}</div>`, ['click', 'click', 'click', 'click']);
assert.equal(r.bound, 1); checks++;
assert.equal(r.again, 0, '重复安装不重复接'); checks++;
assert.deepEqual(r.out, [0, 3, 7, 4, 6]); checks++;
assert.equal(r.changes, 4, '每走一步发一次 change，样式和别的修复跟着变'); checks++;

// 2 不是按钮的骰子用回车也能掷
r = await run(`<div>${STYLE}${cells(8)}${ROLL}</div>`, ['Enter', 'x']);
assert.deepEqual(r.out, [0, 3, 3], '回车走、别的键不走'); checks++;

// 3 骰子是真按钮：回车会自己发 click，不能走两次（这里只发 keydown，不该走）
r = await run(`<div>${STYLE}${cells(8)}${ROLL.replace('<span data-rm-roll role="button" tabindex="0">掷骰子</span>', '<button data-rm-roll>掷骰子</button>')}</div>`, ['Enter']);
assert.deepEqual(r.out, [0, 0]); checks++;

// 4 不认的：结果不是点数、格子少于 4 个、样式里没写格子的 :checked、两组格子分不清
const nope = [
    `<div>${STYLE}${cells(8)}${ROLL.replace(/data-rm-show="(\d)"/g, 'data-rm-show="k$1"')}</div>`,
    `<div>${styleFor(3)}${cells(3)}${ROLL}</div>`,
    `<div>${cells(8)}${ROLL}</div>`,
    // 样式里只在别处写了 :checked、id 只是子串（c1 碰上 #c10）：不算格子自己的选中样式
    `<div><style>#c10{color:red} .x:checked{color:blue}</style>${cells(8)}${ROLL}</div>`,
    // 5 个页签、名字看不出是格子：不当棋盘
    `<div>${styleFor(5, 't')}${cells(5, 'season', 't')}${ROLL}</div>`,
    // 两组都像棋盘：分不清
    `<div>${STYLE}${styleFor(8, 'd')}${cells(8)}${cells(8, 'pos2', 'd')}${ROLL}</div>`,
];
for (const html of nope) { r = await run(html, ['click']); assert.equal(r.bound, 0, html.slice(0, 80)); checks++; }

// 4b 名字看得出是格子位置的 5 格棋盘：认
r = await run(`<div>${styleFor(5, 't')}${cells(5, 'rm_pos', 't')}${ROLL}</div>`, ['click']);
assert.equal(r.bound, 1); checks++;
assert.deepEqual(r.out, [0, 3]); checks++;

// 4c 驱动没换点数（没接管、按钮被禁用）：模型写了初始点数，点了也不走
r = await run(`<div data-no-driver>${STYLE}${cells(8)}${ROLL.replace('data-rm-ui="roll"', 'data-rm-ui="roll" data-rm-picked="3"')}</div>`, ['click', 'click', 'Enter']);
assert.deepEqual(r.out, [0, 0, 0, 0]); checks++;

// 5 诊断：图框的画面描述来源
const lines = await page.evaluate(() => {
    document.body.innerHTML = '<details open><summary>【兔子镜：七彩】</summary><div><figure data-rm-draw-frame="1"><div data-rm-draw-notes="1" hidden><p data-rm-draw-prompt="1">案台上的红色账册，暖光照着</p></div><img data-rm-draw-result="1" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></figure><figure data-rm-draw-frame="2"></figure><figure data-rm-draw-frame="3"></figure><div data-rm-draw-notes="3" hidden><p data-rm-draw-prompt="3">雨夜的长街，灯笼一路排开</p></div></div></details>';
    return diag.diagnosticLayoutEvidence(document.body.firstElementChild);
});
const source = lines.find(line => line.startsWith('生图描述来源：'));
assert.ok(source, lines.join('\n')); checks++;
assert.match(source, /第1个=模型写的\(\d+字\)·已出图/); checks++;
assert.match(source, /第2个=插件补的\(标题\+旁边的字\)·未出图/); checks++;
assert.match(source, /第3个=模型写的\(\d+字\)·未出图/, '还没收进图框的同号画面说明也算模型写的'); checks++;

assert.deepEqual(pageErrors, []); checks++;
await browser.close(); server.close();
console.log(`diceTrackAndDrawSource: ${checks} checks passed`);
