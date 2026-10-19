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
// 假的酒馆用户文件夹（user/files）。
const files = new Map();
let uploads = 0;
const server = createServer(async (req, res) => {
    const p = new URL(req.url, 'http://x').pathname;
    // 带上兔子镜真正的 style.css：美化要盖得过它那些很长的 !important 选择器。
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset=utf-8><link rel="stylesheet" href="/style.css"><body><div id="chat"></div>'); }
    // 假的酒馆：扩展设置存在这个「服务器」里，跟浏览器本地存储分开（用来试本地存储被清掉后能不能找回）。
    if (p === '/save') { let body = ''; for await (const c of req) body += c; savedSettings = body; return res.end('ok'); }
    if (p === '/api/files/upload') { let body = ''; for await (const c of req) body += c; const { name, data } = JSON.parse(body); files.set(name, Buffer.from(data, 'base64').toString('utf8')); uploads++; res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ path: `/user/files/${name}` })); }
    if (p.startsWith('/user/files/')) { const text = files.get(decodeURIComponent(p.slice('/user/files/'.length))); if (text == null) { res.statusCode = 404; return res.end(); } res.setHeader('Content-Type', 'application/json'); return res.end(text); }
    if (p === '/extensions.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(`export const extension_settings = ${savedSettings};`); }
    if (p === '/script.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(`import { extension_settings } from '/extensions.js'; export function saveSettingsDebounced() { fetch('/save', { method: 'POST', body: JSON.stringify(extension_settings) }); } export function getRequestHeaders() { return { 'X-CSRF-Token': 'test' }; }`); }
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
await page.close();
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
    // 像刷新一样：旧页面关掉（它还没来得及传的那次就丢了，新页面开页时会补）。
    await page.close();
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
// 本地存储被清掉（宿主清网页数据）：从酒馆里存的那份文件找回，并补回本地。
const flush = () => page.evaluate(() => window.skin.flushUserSkinBackup());
const serverSkin = () => JSON.parse(savedSettings || '{}')?.rabbit_mirror_theater?.userSkin ?? Object.values(JSON.parse(savedSettings || '{}')).find(v => v && typeof v === 'object' && 'userSkin' in v)?.userSkin;
await flush();
await page.waitForTimeout(300);
assert.ok(JSON.parse(files.get('rabbitmirror-user-skin.json') || '{}').css === BEFORE('✦'), 'skin is saved as a file in the tavern'); checks++;
assert.ok(serverSkin()?.file && !('css' in serverSkin()), 'tavern settings keep only a small marker, not the whole CSS'); checks++;
await page.evaluate(() => localStorage.clear());
await reopen();
await page.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"✦"');
assert.equal((await state()).before, '"✦"', 'skin comes back from the tavern file when local storage was wiped'); checks++;
assert.ok(await page.evaluate(() => !!localStorage.getItem('rabbit_mirror_user_skin_v1')), 'local copy restored'); checks++;
assert.equal(await page.inputValue('#rh_user_skin_css'), BEFORE('✦'), 'open settings panel is filled in once the file arrives'); checks++;
// 打字时不是每停一下就传一次：连着改几次，只传最后一版。
const before = uploads;
for (const c of ['1', '2', '3']) { await page.fill('#rh_user_skin_css', BEFORE(c)); await page.waitForTimeout(800); }
await flush();
assert.equal(uploads - before, 1, 'quick edits are uploaded once'); checks++;
assert.equal(JSON.parse(files.get('rabbitmirror-user-skin.json')).css, BEFORE('3')); checks++;
// 1.68.94～1.69.0 的旧备份：整份 CSS 在设置里、没有文件。本机被清后照样找回，并挪进文件、从设置里去掉。
files.clear();
await page.evaluate(async css => { const set = await import('/src/settings.js?rmv=1.71.3'); set.updateSettings({ userSkin: { enabled: true, css, name: '' } }); localStorage.clear(); }, BEFORE('✧'));
await page.waitForTimeout(300);
await reopen();
await page.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"✧"');
assert.equal((await state()).before, '"✧"', 'old in-settings backup still restores'); checks++;
await flush();
await page.waitForTimeout(300);
assert.equal(JSON.parse(files.get('rabbitmirror-user-skin.json') || '{}').css, BEFORE('✧'), 'old backup is moved into the file'); checks++;
assert.ok(serverSkin()?.file && !('css' in serverSkin()), 'and the CSS is removed from the settings'); checks++;
// 老版本只存在本机的美化：开页时补一份进酒馆文件，之后本机被清也能找回。
files.clear();
await page.evaluate(() => { localStorage.setItem('rabbit_mirror_user_skin_v1', JSON.stringify({ enabled: true, css: '.rabbit-mirror-external-shell[data-rm-placement="external"]::before{content:"✩" !important}', name: '' })); });
await page.evaluate(async () => { const set = await import('/src/settings.js?rmv=1.71.3'); set.updateSettings({ userSkin: null }); });
await page.waitForTimeout(300);
await reopen();
await flush();
await page.waitForTimeout(300);
await page.evaluate(() => localStorage.clear());
await reopen();
await page.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"✩"');
assert.ok(true, 'a local-only skin from older versions gets backed up on load'); checks++;
// 这次没传上（服务器一时出错）、但酒馆里已经有文件记号：记号不动（免得盖掉别的设备的），本机留着改动，下次开页再传。
await page.evaluate(() => { window.fetchBackup = window.fetch; window.fetch = (url, init) => String(url).includes('/api/files/upload') ? Promise.resolve(new Response('no', { status: 503 })) : window.fetchBackup(url, init); });
await page.fill('#rh_user_skin_css', BEFORE('✪'));
await page.waitForTimeout(800);
await flush();
await page.waitForTimeout(300);
assert.ok(serverSkin()?.file && !('css' in serverSkin()), 'a failed upload does not replace the shared file marker'); checks++;
assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('rabbit_mirror_user_skin_v1')).dirty), true, 'the edit stays marked unsent'); checks++;
await page.evaluate(() => { window.fetch = window.fetchBackup; });
await page.close(); page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(origin);
await page.evaluate(async () => { window.skin = await import('/src/userSkin.js'); window.skin.readUserSkin(); await window.skin.flushUserSkinBackup(); });
assert.equal(JSON.parse(files.get('rabbitmirror-user-skin.json')).css, BEFORE('✪'), 'the unsent edit is uploaded on the next load'); checks++;
// 宿主根本不让存文件（没有文件记号）：退回老办法，放进设置里。
await page.evaluate(async () => { const set = await import('/src/settings.js?rmv=1.71.3'); set.updateSettings({ userSkin: null }); });
await reopen();
await page.evaluate(() => { window.fetchBackup = window.fetch; window.fetch = (url, init) => String(url).includes('/api/files/upload') ? Promise.resolve(new Response('no', { status: 403 })) : window.fetchBackup(url, init); });
await page.fill('#rh_user_skin_css', BEFORE('✫'));
await page.waitForTimeout(800);
await flush();
await page.waitForTimeout(300);
assert.equal(serverSkin()?.css, BEFORE('✫'), 'falls back to keeping the CSS in settings when files cannot be saved at all'); checks++;
await page.evaluate(() => { window.fetch = window.fetchBackup; });
await page.evaluate(() => window.skin.saveUserSkin({ enabled: true, css: document.querySelector('#rh_user_skin_css').value, name: '' }));
await flush();
await page.waitForTimeout(300);

// ── 几台设备共用酒馆里那一份（复查补的）──
const openOn = async (context, { failRead = false } = {}) => {
    const p = await context.newPage(); p.on('pageerror', e => errors.push(e.message));
    if (failRead) await p.route('**/user/files/**', route => route.fulfill({ status: 500, body: 'boom' }));
    await p.goto(origin);
    await p.evaluate(async () => {
        document.getElementById('chat').innerHTML = `<div class="rabbit-mirror-external-shell" data-rm-placement="external"><details open><summary data-rm-title-chrome="true">标题</summary></details></div><div class="panel"></div><section id="appearance"></section>`;
        window.skin = await import('/src/userSkin.js');
        window.skin.applyUserSkin();
        window.skin.mountUserSkinControls(document.getElementById('appearance'));
    });
    return p;
};
const before$ = p => p.evaluate(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content);
// 电脑 A 存了 X。
await page.close();
page = await openOn(ctx);
await page.check('#rh_user_skin_enabled');
await page.fill('#rh_user_skin_css', BEFORE('A1'));
await page.waitForTimeout(800);
await flush();
await page.waitForTimeout(300);
// 手机 B（另一份本机存储）第一次打开：从酒馆拿到 X。
const phone = await browser.newContext();
let b = await openOn(phone);
await b.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"A1"');
assert.equal(await b.inputValue('#rh_user_skin_css'), BEFORE('A1'), 'second device gets the skin'); checks++;
// A 又存了新的 X2；B 只是刷新，不改：B 换成 X2，而且不往酒馆传。
await page.fill('#rh_user_skin_css', BEFORE('A2'));
await page.waitForTimeout(800);
await flush();
await page.waitForTimeout(300);
let uploadsBefore = uploads;
await b.close(); b = await openOn(phone);
await b.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"A2"');
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(uploads, uploadsBefore, 'just opening a page on another device never uploads'); checks++;
assert.equal(JSON.parse(files.get('rabbitmirror-user-skin.json')).css, BEFORE('A2')); checks++;
// B 上改了 → 传上去；A 刷新后换成 B 的。
await b.fill('#rh_user_skin_css', BEFORE('B1'));
await b.waitForTimeout(800);
await b.evaluate(() => window.skin.flushUserSkinBackup());
await b.waitForTimeout(300);
await page.close(); page = await openOn(ctx);
await page.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"B1"');
assert.equal(await before$(page), '"B1"', 'the device that saved last wins'); checks++;
// 1.70 以前留在本机的旧美化（没有同步记号）：打开页面不传、不覆盖酒馆那份，本机照旧显示自己的。
await b.evaluate(css => localStorage.setItem('rabbit_mirror_user_skin_v1', JSON.stringify({ enabled: true, css, name: '' })), BEFORE('old'));
uploadsBefore = uploads;
await b.close(); b = await openOn(phone);
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(await before$(b), '"old"'); checks++;
assert.equal(uploads, uploadsBefore, 'a pre-1.70 local skin does not overwrite the tavern copy'); checks++;
assert.equal(JSON.parse(files.get('rabbitmirror-user-skin.json')).css, BEFORE('B1')); checks++;
// 本机被清、读酒馆文件失败：用户点「清空」或开关，不会把酒馆那份清掉；网好了再打开照样找回。
await b.evaluate(() => localStorage.clear());
await b.close(); b = await openOn(phone, { failRead: true });
await b.waitForTimeout(300);
uploadsBefore = uploads;
await b.click('[data-rh-skin="clear"]');
await b.click('#rh_user_skin_enabled');
await b.waitForTimeout(800);
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(uploads, uploadsBefore, 'an empty save while the tavern copy could not be read is not uploaded'); checks++;
assert.equal(JSON.parse(files.get('rabbitmirror-user-skin.json')).css, BEFORE('B1')); checks++;
await b.close(); b = await openOn(phone);
await b.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"B1"');
assert.ok(true, 'restored once the file can be read again'); checks++;
// 第二轮复查补的：
// ① 设置里的记号晚一步（别的页面写回了旧记号）、文件已经是新版：本机被清后照样以文件为准找回。
await page.evaluate(async () => { const set = await import('/src/settings.js?rmv=1.71.3'); set.updateSettings({ userSkin: { ...set.getSettings().userSkin, fingerprint: 'stale' } }); });
await page.waitForTimeout(300);
await b.evaluate(() => localStorage.clear());
await b.close(); b = await openOn(phone);
await b.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"B1"');
assert.ok(true, 'a stale marker does not stop restoring from the file'); checks++;
// 读回来的不是 JSON（宿主返回首页）：当读失败，点清空不往酒馆传。
await b.evaluate(() => localStorage.clear());
await b.close();
b = await phone.newPage(); b.on('pageerror', e => errors.push(e.message));
await b.route('**/user/files/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>home</title>' }));
await b.goto(origin);
await b.evaluate(async () => { document.getElementById('chat').innerHTML = `<div class="rabbit-mirror-external-shell" data-rm-placement="external"><details open><summary>标题</summary></details></div><section id="appearance"></section>`; window.skin = await import('/src/userSkin.js'); window.skin.applyUserSkin(); window.skin.mountUserSkinControls(document.getElementById('appearance')); });
await b.waitForTimeout(300);
uploadsBefore = uploads;
await b.click('[data-rh-skin="clear"]');
await b.waitForTimeout(800);
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(uploads, uploadsBefore, 'a non-JSON answer counts as a failed read, so clearing is not uploaded'); checks++;
await b.close(); b = await openOn(phone);
await b.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"B1"');
// ② B 上有一份很早以前没传上去的改动；A 后来存了新的：B 打开时换上 A 的，不拿旧改动盖掉。
await b.evaluate(css => { const r = JSON.parse(localStorage.getItem('rabbit_mirror_user_skin_v1')); localStorage.setItem('rabbit_mirror_user_skin_v1', JSON.stringify({ ...r, css, dirty: true, editedAt: 1000 })); }, BEFORE('stale-edit'));
await page.fill('#rh_user_skin_css', BEFORE('A3'));
await page.waitForTimeout(800);
await flush();
await page.waitForTimeout(300);
uploadsBefore = uploads;
await b.close(); b = await openOn(phone);
await b.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"A3"');
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(uploads, uploadsBefore, 'an old unsent edit does not overwrite a newer save from another device'); checks++;
assert.equal(JSON.parse(files.get('rabbitmirror-user-skin.json')).css, BEFORE('A3')); checks++;
// ③ 本机存满了：本机那份旧记录删掉，不会刷新后拿旧的去盖酒馆里的新版。
await b.evaluate(() => { const real = Storage.prototype.setItem; window.realSetItem = real; Storage.prototype.setItem = function (k, v) { if (String(v).includes('BIG')) throw new DOMException('full', 'QuotaExceededError'); return real.call(this, k, v); }; });
await b.fill('#rh_user_skin_css', BEFORE('BIG'));
await b.waitForTimeout(800);
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(await b.evaluate(() => localStorage.getItem('rabbit_mirror_user_skin_v1')), null, 'the old local record is removed when the new one does not fit'); checks++;
assert.equal(JSON.parse(files.get('rabbitmirror-user-skin.json')).css, BEFORE('BIG')); checks++;
await b.close(); b = await openOn(phone);
await b.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"BIG"');
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(JSON.parse(files.get('rabbitmirror-user-skin.json')).css, BEFORE('BIG'), 'after reload the bigger skin is still the tavern copy'); checks++;
// ④ 1.70 以前本机独有的美化：别的设备以后再存，这台也不被换掉；在这台上存一次后才正常同步。
await b.evaluate(css => localStorage.setItem('rabbit_mirror_user_skin_v1', JSON.stringify({ enabled: true, css, name: '' })), BEFORE('mine'));
await b.close(); b = await openOn(phone);
await page.fill('#rh_user_skin_css', BEFORE('A4'));
await page.waitForTimeout(800);
await flush();
await page.waitForTimeout(300);
await b.close(); b = await openOn(phone);
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(await before$(b), '"mine"', 'a pre-1.70 local-only skin is kept on that device even after other devices save'); checks++;
await b.fill('#rh_user_skin_css', BEFORE('mine2'));
await b.waitForTimeout(800);
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(JSON.parse(files.get('rabbitmirror-user-skin.json')).css, BEFORE('mine2'), 'saving on that device rejoins syncing'); checks++;
// 第三轮复核补的：
// ① 网慢、文件还没读回来时点了开关（空的，不存）；读回来后设置界面填上酒馆那份，再点开关也不会把酒馆那份清掉。
await b.evaluate(() => localStorage.clear());
await b.close();
b = await phone.newPage(); b.on('pageerror', e => errors.push(e.message));
let releaseRead;
await b.route('**/user/files/**', async route => { await new Promise(r => { releaseRead = r; }); await route.continue(); });
await b.goto(origin);
await b.evaluate(async () => { document.getElementById('chat').innerHTML = `<div class="rabbit-mirror-external-shell" data-rm-placement="external"><details open><summary>标题</summary></details></div><section id="appearance"></section>`; window.skin = await import('/src/userSkin.js'); window.skin.applyUserSkin(); window.skin.mountUserSkinControls(document.getElementById('appearance')); });
await b.waitForFunction(() => document.querySelector('#rh_user_skin_enabled').disabled);
assert.ok(await b.evaluate(() => document.querySelector('#rh_user_skin_css').disabled && document.querySelector('[data-rh-skin="clear"]').disabled), 'panel is locked until the tavern copy is read'); checks++;
assert.match(await b.textContent('.rh-ui-user-skin-status'), /正在和酒馆里存的美化对一下/); checks++;
const tavernCss = JSON.parse(files.get('rabbitmirror-user-skin.json')).css;
releaseRead();
await b.waitForFunction(css => document.querySelector('#rh_user_skin_css').value === css && !document.querySelector('#rh_user_skin_enabled').disabled, tavernCss);
uploadsBefore = uploads;
await b.click('#rh_user_skin_enabled');
await b.waitForTimeout(300);
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(JSON.parse(files.get('rabbitmirror-user-skin.json')).css, tavernCss, 'toggling after the restore keeps the tavern CSS'); checks++;
// ② 别的页面把设置里的记号写回旧的：本机照样以酒馆文件为准，换上新版；很早没传上去的旧改动也不会盖掉新版。
await b.evaluate(() => { const r = JSON.parse(localStorage.getItem('rabbit_mirror_user_skin_v1')); localStorage.setItem('rabbit_mirror_user_skin_v1', JSON.stringify({ ...r, css: '.stale{}', dirty: true, editedAt: 5 })); });
const staleFp = await b.evaluate(() => { const r = JSON.parse(localStorage.getItem('rabbit_mirror_user_skin_v1')); return window.skin.userSkinFingerprint(r); });
await page.fill('#rh_user_skin_css', BEFORE('A5'));
await page.waitForTimeout(800);
await flush();
await page.waitForTimeout(300);
await page.evaluate(async fp => { const set = await import('/src/settings.js?rmv=1.71.3'); set.updateSettings({ userSkin: { ...set.getSettings().userSkin, fingerprint: fp } }); }, staleFp);
await page.waitForTimeout(300);
uploadsBefore = uploads;
await b.close(); b = await openOn(phone);
await b.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"A5"');
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(uploads, uploadsBefore, 'a stale marker plus an old unsent edit does not overwrite the newer file'); checks++;
assert.equal(JSON.parse(files.get('rabbitmirror-user-skin.json')).css, BEFORE('A5')); checks++;
// ③ 还开着的 1.69 旧页面把整份旧 CSS 写回设置：酒馆已经有文件，就不拿旧 CSS 去盖文件。
await page.evaluate(async css => { const set = await import('/src/settings.js?rmv=1.71.3'); set.updateSettings({ userSkin: { enabled: true, css, name: '' } }); }, BEFORE('v169'));
await page.waitForTimeout(300);
await b.evaluate(() => localStorage.clear());
uploadsBefore = uploads;
await b.close(); b = await openOn(phone);
await b.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"A5"');
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(uploads, uploadsBefore, 'old full CSS in settings is not migrated over an existing file'); checks++;
assert.equal(JSON.parse(files.get('rabbitmirror-user-skin.json')).css, BEFORE('A5')); checks++;
await b.waitForTimeout(300);
assert.ok(serverSkin()?.file && !('css' in serverSkin()), 'and the settings are shrunk back to the marker'); checks++;
// 第四轮复核补的：本机是旧版 X（已对上过），酒馆里是别的设备存的新版。
const tavernNow = () => JSON.parse(files.get('rabbitmirror-user-skin.json')).css;
await page.fill('#rh_user_skin_css', BEFORE('Y'));
await page.waitForTimeout(800);
await flush();
await page.waitForTimeout(300);
await b.evaluate(css => { const r = JSON.parse(localStorage.getItem('rabbit_mirror_user_skin_v1')); localStorage.setItem('rabbit_mirror_user_skin_v1', JSON.stringify({ ...r, css, dirty: false, synced: 'old-x' })); }, BEFORE('X'));
// ① 读得慢：读回来之前设置界面锁着，点不了；读回来后换上新版，不会把旧版传上去。
await b.close();
b = await phone.newPage(); b.on('pageerror', e => errors.push(e.message));
let release2;
await b.route('**/user/files/**', async route => { await new Promise(r => { release2 = r; }); await route.continue(); });
await b.goto(origin);
await b.evaluate(async () => { document.getElementById('chat').innerHTML = `<div class="rabbit-mirror-external-shell" data-rm-placement="external"><details open><summary>标题</summary></details></div><section id="appearance"></section>`; window.skin = await import('/src/userSkin.js'); window.skin.applyUserSkin(); window.skin.mountUserSkinControls(document.getElementById('appearance')); });
await b.waitForFunction(() => document.querySelector('#rh_user_skin_enabled').disabled);
uploadsBefore = uploads;
await b.evaluate(() => { document.querySelector('[data-rh-skin="clear"]').click(); document.querySelector('[data-rh-skin="export"]').click(); });
await b.waitForTimeout(1800);
assert.equal(uploads, uploadsBefore, 'nothing is uploaded before the tavern copy is read'); checks++;
release2();
await b.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"Y"');
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(tavernNow(), BEFORE('Y')); checks++;
assert.equal(await b.inputValue('#rh_user_skin_css'), BEFORE('Y'), 'panel shows the tavern version after reconciling'); checks++;
// ② 读失败：界面放开，改的只存在这台设备上，不传；下次能读到时，酒馆那份已被别的设备换过 → 换上酒馆的，本机这版留着，能一键换回。
await b.close();
b = await openOn(phone, { failRead: true });
await b.waitForFunction(() => !document.querySelector('#rh_user_skin_enabled').disabled);
assert.match(await b.textContent('.rh-ui-user-skin-status'), /没能读到酒馆里存的美化/); checks++;
uploadsBefore = uploads;
await b.fill('#rh_user_skin_css', BEFORE('offline'));
await b.waitForTimeout(2000);
assert.equal(uploads, uploadsBefore, 'edits made while the tavern copy cannot be read are kept local only'); checks++;
assert.match(await b.textContent('.rh-ui-user-skin-status'), /先存在这台设备上，能读到酒馆那份时再传进去/); checks++;
await page.fill('#rh_user_skin_css', BEFORE('Z'));
await page.waitForTimeout(800);
await flush();
await page.waitForTimeout(300);
await b.close(); b = await openOn(phone);
await b.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"Z"');
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(tavernNow(), BEFORE('Z'), 'the offline edit does not overwrite a newer save from another device'); checks++;
await b.waitForFunction(() => !document.querySelector('[data-rh-skin-unsent]').hidden);
await b.click('[data-rh-skin="unsent"]');
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(await before$(b), '"offline"'); checks++;
assert.equal(tavernNow(), BEFORE('offline'), 'the user can bring back the version made on this device'); checks++;
// ③ 读失败、本机的旧编辑底版没变：下次能读到时照常传上去。
await b.close(); b = await openOn(phone, { failRead: true });
await b.waitForFunction(() => !document.querySelector('#rh_user_skin_enabled').disabled);
await b.fill('#rh_user_skin_css', BEFORE('offline2'));
await b.waitForTimeout(900);
await b.close(); b = await openOn(phone);
await b.evaluate(() => window.skin.flushUserSkinBackup());
assert.equal(tavernNow(), BEFORE('offline2'), 'an offline edit on an unchanged base is uploaded once the tavern can be read'); checks++;
// ④ 1.70 以前留下的空美化记录：不锁在这台设备上，换上酒馆那份。
await b.evaluate(() => localStorage.setItem('rabbit_mirror_user_skin_v1', JSON.stringify({ enabled: false, css: '', name: '' })));
await b.close(); b = await openOn(phone);
await b.waitForFunction(() => getComputedStyle(document.querySelector('.rabbit-mirror-external-shell'), '::before').content === '"offline2"');
assert.ok(true, 'an empty pre-1.70 record takes the tavern copy'); checks++;
// 第五轮（专项复核）补的：
// ① 「换回这台设备改的那版」对账期间也锁着。
await b.evaluate(css => localStorage.setItem('rabbit_mirror_user_skin_v1_unsent', JSON.stringify({ enabled: true, css, name: '' })), BEFORE('stash'));
await b.close();
b = await phone.newPage(); b.on('pageerror', e => errors.push(e.message));
let release3;
await b.route('**/user/files/**', async route => { await new Promise(r => { release3 = r; }); await route.continue(); });
await b.goto(origin);
await b.evaluate(async () => { document.getElementById('chat').innerHTML = `<div class="rabbit-mirror-external-shell" data-rm-placement="external"><details open><summary>标题</summary></details></div><section id="appearance"></section>`; window.skin = await import('/src/userSkin.js'); window.skin.applyUserSkin(); window.skin.mountUserSkinControls(document.getElementById('appearance')); });
await b.waitForFunction(() => document.querySelector('#rh_user_skin_enabled').disabled);
assert.equal(await b.evaluate(() => document.querySelector('[data-rh-skin="unsent"]').disabled), true, 'the bring-back button is locked while reconciling'); checks++;
release3();
await b.waitForFunction(() => !document.querySelector('[data-rh-skin="unsent"]').disabled);
await b.evaluate(() => localStorage.removeItem('rabbit_mirror_user_skin_v1_unsent'));
// ② 冲突时本机放不下另外那份：不换成酒馆的、也不传，留着这台的；「改用酒馆那份」能换过去。
await b.evaluate(css => { const r = JSON.parse(localStorage.getItem('rabbit_mirror_user_skin_v1')); localStorage.setItem('rabbit_mirror_user_skin_v1', JSON.stringify({ ...r, css, dirty: true, editedAt: Date.now(), synced: 'some-old-base' })); }, BEFORE('kept'));
await b.close();
b = await phone.newPage(); b.on('pageerror', e => errors.push(e.message));
await b.addInitScript(() => { const real = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (String(k).endsWith('_unsent')) throw new DOMException('full', 'QuotaExceededError'); return real.call(this, k, v); }; });
await b.goto(origin);
await b.evaluate(async () => { document.getElementById('chat').innerHTML = `<div class="rabbit-mirror-external-shell" data-rm-placement="external"><details open><summary>标题</summary></details></div><section id="appearance"></section>`; window.skin = await import('/src/userSkin.js'); window.skin.applyUserSkin(); window.skin.mountUserSkinControls(document.getElementById('appearance')); });
uploadsBefore = uploads;
const tavernBefore = tavernNow();
await b.evaluate(() => window.skin.flushUserSkinBackup());
await b.waitForFunction(() => !document.querySelector('[data-rh-skin-kept]').hidden);
assert.equal(await before$(b), '"kept"', 'the local edit is kept when it cannot be stashed'); checks++;
assert.equal(uploads, uploadsBefore, 'and nothing is uploaded'); checks++;
assert.equal(tavernNow(), tavernBefore); checks++;
await b.click('[data-rh-skin="take-tavern"]');
await b.waitForFunction(css => document.querySelector('#rh_user_skin_css').value === css, tavernBefore);
assert.equal(await b.evaluate(() => JSON.parse(localStorage.getItem('rabbit_mirror_user_skin_v1')).css), tavernBefore, '"use the tavern copy" switches over'); checks++;
assert.equal(await b.evaluate(() => document.querySelector('[data-rh-skin-kept]').hidden), true); checks++;
await phone.close();
// 宿主对不存在的文件回首页网页、设置里也没有记号（从没存过美化的设备）：当成没有，记一笔，不会每次打开都去问。
const fresh = await browser.newContext();
await page.evaluate(async () => { const set = await import('/src/settings.js?rmv=1.71.3'); set.updateSettings({ userSkin: null }); });
await page.waitForTimeout(300);
let reads = 0;
let f = await fresh.newPage(); f.on('pageerror', e => errors.push(e.message));
await f.route('**/user/files/**', route => { reads++; route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>home</title>' }); });
await f.goto(origin);
await f.evaluate(async () => { window.skin = await import('/src/userSkin.js'); window.skin.readUserSkin(); await window.skin.flushUserSkinBackup(); window.skin.readUserSkin(); await window.skin.flushUserSkinBackup(); });
assert.equal(reads, 1, 'a device that never had a skin asks the tavern only once'); checks++;
assert.ok(await f.evaluate(() => !!localStorage.getItem('rabbit_mirror_user_skin_v1')), 'and remembers there is nothing to restore'); checks++;
await fresh.close();
assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
