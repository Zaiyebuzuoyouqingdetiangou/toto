// 本地浏览器测试：用户美化（主题与外观里导入的 CSS）。
// 保存后换上、排在 head 最后；关掉拿掉、内容留着；刷新后照样换上；从文件导入；外置框和工具弹窗认得这些名字。
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
let savedSettings = '{}';
const server = createServer(async (req, res) => {
    const p = new URL(req.url, 'http://x').pathname;
    // 带上兔子镜真正的 style.css：美化要盖得过它那些很长的 !important 选择器。
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset=utf-8><link rel="stylesheet" href="/style.css"><body><div id="chat"></div>'); }
    // 假的酒馆：扩展设置存在这个「服务器」里，跟浏览器本地存储分开（用来试本地存储被清掉后能不能找回）。
    if (p === '/save') { let body = ''; for await (const c of req) body += c; savedSettings = body; return res.end('ok'); }
    if (p === '/extensions.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(`export const extension_settings = ${savedSettings};`); }
    if (p === '/script.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(`import { extension_settings } from '/extensions.js'; export function saveSettingsDebounced() { fetch('/save', { method: 'POST', body: JSON.stringify(extension_settings) }); }`); }
    res.setHeader('Content-Type', p.endsWith('.css') ? 'text/css' : 'text/javascript');
    try { res.end(await readFile(path.join(root, decodeURIComponent(p)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const ctx = await browser.newContext();
const errors = [];
let page = await ctx.newPage();
page.on('pageerror', e => errors.push(e.message));
await page.goto(origin);
let checks = 0;
const CSS = `.rabbit-mirror-external-shell[data-rm-placement="external"]::before{content:"✿" !important}
.rabbit-mirror-external-shell[data-rm-placement="external"]{background:rgb(1, 2, 3) !important}
.rabbit-mirror-external-shell[data-rm-placement="external"] summary[data-rm-title-chrome]{color:rgb(4, 5, 6) !important}
[data-rm-skin="panel"]{border-top:3px solid rgb(7, 8, 9) !important}
@import url("data:text/css;charset=utf-8,.panel{outline-color:rgb(10, 11, 12)}");
/* 关掉的：@import url("data:text/css,.panel{word-spacing:9px}"); */
.panel::after{content:"/*"} .panel{text-indent:4px} .panel::before{content:"*/"}
.panel{letter-spacing:3px}`;
const state = () => page.evaluate(() => {
    const shell = document.querySelector('.rabbit-mirror-external-shell');
    const style = document.getElementById('rabbit-mirror-user-skin');
    return {
        present: !!style, last: document.head.lastElementChild === style,
        before: getComputedStyle(shell, '::before').content, bg: getComputedStyle(shell).backgroundColor,
        title: getComputedStyle(shell.querySelector('summary')).color,
        panel: getComputedStyle(document.querySelector('.panel')).borderTopColor,
        spacing: getComputedStyle(document.querySelector('.panel')).letterSpacing,
        imported: getComputedStyle(document.querySelector('.panel')).outlineColor,
        commented: getComputedStyle(document.querySelector('.panel')).wordSpacing,
        indent: getComputedStyle(document.querySelector('.panel')).textIndent,
    };
});
await page.evaluate(async () => {
    document.getElementById('chat').innerHTML = `<div class="rabbit-mirror-external-shell" data-rm-placement="external" data-rm-source="independent"><details data-rabbit-mirror-external-details="true" open><summary data-rm-title-chrome="true" style="color:rgb(200,0,0)"><span data-rm-title-label="true">【兔子镜：测试】</span></summary><p>正文</p></details></div><div class="panel"></div><section id="appearance"></section>`;
    window.skin = await import('/src/userSkin.js');
    const menu = await import('/src/mirrorToolMenu.js');
    menu.themeMirrorToolPanel(document.querySelector('.panel'));
    window.skin.mountUserSkinControls(document.getElementById('appearance'));
});
let s = await state();
assert.equal(s.present, false, 'nothing until the user saves something'); checks++;
assert.equal(await page.getAttribute('.panel', 'data-rm-skin'), 'panel', 'tool panels carry the documented hook'); checks++;
// 粘贴、保存并应用：自动打开开关，换上，排在最后。
await page.fill('#rh_user_skin_css', CSS);
await page.click('[data-rh-skin="save"]');
s = await state();
assert.equal(await page.isChecked('#rh_user_skin_enabled'), true); checks++;
assert.ok(s.present && s.last, 'skin style is the last thing in head'); checks++;
assert.equal(s.before, '"✿"', 'frame decoration via ::before'); checks++;
assert.equal(s.bg, 'rgb(1, 2, 3)', 'short documented selector + !important beats the extension\'s long #chat … !important rule'); checks++;
assert.equal(s.title, 'rgb(4, 5, 6)', 'external title bar, over the inline color'); checks++;
assert.equal(s.panel, 'rgb(7, 8, 9)', 'tool panel'); checks++;
assert.equal(s.spacing, '3px', 'plain declarations without !important still apply'); checks++;
assert.equal(s.imported, 'rgb(10, 11, 12)', '@import with a semicolon inside the URL is hoisted whole and still works'); checks++;
assert.equal(s.commented, '0px', 'an @import inside a comment stays off'); checks++;
assert.equal(s.indent, '4px', 'a "/*" inside a string does not swallow the following rules'); checks++;
// 关掉：拿掉样式，内容还在。
await page.click('#rh_user_skin_enabled');
s = await state();
assert.equal(s.present, false); checks++;
assert.equal(await page.inputValue('#rh_user_skin_css'), CSS, 'turning off keeps the text'); checks++;
await page.click('#rh_user_skin_enabled');
assert.equal((await state()).present, true); checks++;
// 插入可用的名字：追加在后面，不覆盖。
await page.click('[data-rh-skin="skeleton"]');
const text = await page.inputValue('#rh_user_skin_css');
assert.ok(text.startsWith(CSS) && text.includes('[data-rm-skin="panel"] {') && text.includes('summary[data-rm-title-chrome] {')); checks++;
// 刷新页面：开页时（initRabbitMirrorUI 里那一句）照样换上。
page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(origin);
await page.evaluate(async () => {
    document.getElementById('chat').innerHTML = `<div class="rabbit-mirror-external-shell" data-rm-placement="external" data-rm-source="independent"><details data-rabbit-mirror-external-details="true" open><summary data-rm-title-chrome="true">标题</summary></details></div><div class="panel" data-rm-skin="panel"></div><section id="appearance"></section>`;
    window.skin = await import('/src/userSkin.js');
    window.skin.applyUserSkin();
});
s = await state();
assert.equal(s.present, true); checks++;
assert.equal(s.before, '"✿"', 'saved skin survives a reload'); checks++;
// 从文件导入：读文件、记名字、打开、换上；导出用的就是这个名字。
await page.evaluate(() => window.skin.mountUserSkinControls(document.getElementById('appearance')));
await page.setInputFiles('[data-rh-skin-file]', { name: '春日花框.css', mimeType: 'text/css', buffer: Buffer.from('.rabbit-mirror-external-shell[data-rm-placement="external"]::before{content:"❀" !important}') });
await page.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"❀"');
assert.match(await page.textContent('.rh-ui-user-skin-status'), /春日花框/); checks++;
assert.equal(await page.evaluate(() => window.skin.readUserSkin().name), '春日花框'); checks++;
// 清空：拿掉。
await page.click('[data-rh-skin="clear"]');
assert.equal((await state()).present, false); checks++;
assert.equal(await page.evaluate(() => window.skin.readUserSkin().css), ''); checks++;
// 只在框里打字、不点保存，过一会儿就自动存好；刷新后还在（开着时还顺手换上）。
const reopen = async () => {
    page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin);
    await page.evaluate(async () => {
        document.getElementById('chat').innerHTML = `<div class="rabbit-mirror-external-shell" data-rm-placement="external"><details open><summary data-rm-title-chrome="true">标题</summary></details></div><div class="panel"></div><section id="appearance"></section>`;
        window.skin = await import('/src/userSkin.js');
        window.skin.applyUserSkin();
        window.skin.mountUserSkinControls(document.getElementById('appearance'));
    });
};
const BEFORE = (c) => `.rabbit-mirror-external-shell[data-rm-placement="external"]::before{content:"${c}" !important}`;
await page.check('#rh_user_skin_enabled');
await page.fill('#rh_user_skin_css', BEFORE('☘'));
await page.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"☘"');
await reopen();
assert.equal(await page.inputValue('#rh_user_skin_css'), BEFORE('☘'), 'typed text is kept without pressing save'); checks++;
assert.equal((await state()).before, '"☘"', 'and is applied after reload'); checks++;
// 打完字马上点导出：导出那一下也存。
await page.fill('#rh_user_skin_css', BEFORE('✦'));
const dl = page.waitForEvent('download');
await page.click('[data-rh-skin="export"]');
await dl;
await reopen();
assert.equal(await page.inputValue('#rh_user_skin_css'), BEFORE('✦'), 'export also saves'); checks++;
// 本地存储被清掉（宿主清网页数据）：从酒馆设置里那份找回，并补回本地。
await page.waitForTimeout(300);
await page.evaluate(() => localStorage.clear());
await reopen();
assert.equal((await state()).before, '"✦"', 'skin comes back from the extension settings copy when local storage was wiped'); checks++;
assert.ok(await page.evaluate(() => !!localStorage.getItem('rabbit_mirror_user_skin_v1')), 'local copy restored'); checks++;
// 老版本只存在本机的美化：开页时补一份到酒馆设置里，之后本机被清也能找回。
await page.evaluate(() => { localStorage.setItem('rabbit_mirror_user_skin_v1', JSON.stringify({ enabled: true, css: '.rabbit-mirror-external-shell[data-rm-placement="external"]::before{content:"✧" !important}', name: '' })); });
await page.evaluate(async () => { const set = await import('/src/settings.js?rmv=1.68.99'); set.updateSettings({ userSkin: null }); });
await page.waitForTimeout(300);
await reopen();
await page.waitForTimeout(300);
await page.evaluate(() => localStorage.clear());
await reopen();
assert.equal((await state()).before, '"✧"', 'a local-only skin from older versions gets backed up on load'); checks++;
assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
