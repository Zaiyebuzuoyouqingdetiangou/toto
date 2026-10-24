// 1.83.0 之后的三处回归：
// 1 图框挪过位置、在挪开时手动重画过，旧的超时请求晚回来，再挪回原位：显示后来手动画的那张，不退回旧图；面板翻版本也对着同一组图。
// 2 面板打开以后，这一层换成了别的回复：旧面板不能再切换（改到新回复的插图）。
// 3 旧分支里认不出版本的那张：面板里的「再画一张」和图框里的「重新生图」一样能用，画好存进这个分支。
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
    if (pathname === '/extensions.js') return res.end('export const extension_settings = { rabbit_mirror_theater: { builtinImageEnabled: true } }; export const getContext = () => window.SillyTavern.getContext();');
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){}}; export const event_types = {}; export const saveChatConditional = async () => {};');
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    if (pathname.startsWith('/user/images/')) { res.setHeader('Content-Type', 'image/png'); return res.end(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')); }
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
    localStorage.clear();
    // 时钟可以往前拨（模拟请求发出去十几分钟没回音）。
    window.__skew = 0;
    const realNow = Date.now.bind(Date);
    Date.now = () => realNow() + window.__skew;
    const chat = Array.from({ length: 14 }, (_, i) => ({ mes: '某城的回复' + i, is_user: i % 2 === 1, swipe_id: 0, extra: {} }));
    const ctx = { chat, chatId: 'c', getCurrentChatId: () => ctx.chatId, characterId: 0, characters: [{ name: '阿雪' }], name2: '阿雪', chatMetadata: { integrity: 'main' } };
    window.__ctx = ctx;
    window.SillyTavern = { getContext: () => ctx };
    window.__calls = 0;
    window.__release = [];
    window.STBaiBaiImage = {
        apiVersion: 1, capabilities: { globalApi: true, generate: true },
        getBackendStatus: () => ({ configured: true, supportsCharacters: false, backend: 'test' }),
        generate: () => { window.__calls += 1; const n = window.__calls; return new Promise(resolve => window.__release.push({ n, run: () => resolve({ path: `/user/images/p${n}.png`, generatedAt: new Date(Date.now()).toISOString() }) })); },
    };
    // 面板的保存目标：和 mount.js 的 prepareImageTarget 一样，楼层上换成了别的消息、聊天换了就不再算当前。
    window.__rabbitMirrorIndependentActionsV1 = { prepareImageTarget: root => {
        const owner = root.closest('details') || root;
        const mes = Number(owner.dataset.rabbitMirrorOwnerMesid), chatId = ctx.chatId, msg = ctx.chat[mes];
        if (!msg) return null;
        return { title: '测试面', assertCurrent: () => { if (ctx.chatId !== chatId || ctx.chat[mes] !== msg || !root.isConnected) throw new Error('这面兔子镜的聊天、分支或内容已变化'); return true; } };
    } };
    window.images = await import('/src/builtinImage.js?' + query);
    window.imageUi = await import('/src/imageUi.js?' + query);
    window.fresh = await import('/src/freshDrawSlots.js?' + query);
}, query);

// 图框挪位：前面可以多插一个别的图框。
const movedFace = (mes, inserted) => `<details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="${mes}" data-rabbit-mirror-owner-swipe="0"><summary>阿雪和阿岩</summary>
  ${inserted ? '<figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>插进来的一格：阿竹在某城的城门口牵马</p></figure>' : ''}
  <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>原来那一格：阿雪和阿岩在某城的雨夜屋檐下躲雨</p></figure></details>`;
const mount = html => page.evaluate(html => {
    document.body.innerHTML = `<div id="chat">${html}</div>`;
    images.fillBuiltinImageFrames(document.querySelector('details'));
}, html);
const lastFrameSrc = () => page.evaluate(() => {
    const frames = document.querySelectorAll('[data-rm-draw-frame]');
    return (frames[frames.length - 1]?.querySelector('img[data-rm-draw-result]')?.getAttribute('src') || '-').replace(location.origin, '');
});
const releaseAll = () => page.evaluate(async () => { for (const item of window.__release.splice(0)) item.run(); await new Promise(resolve => setTimeout(resolve, 80)); });
const releaseCall = n => page.evaluate(async n => {
    const index = window.__release.findIndex(item => item.n === n);
    if (index < 0) return;
    window.__release.splice(index, 1)[0].run();
    await new Promise(resolve => setTimeout(resolve, 80));
}, n);
const calls = () => page.evaluate(() => window.__calls);
const clickReroll = () => page.evaluate(() => {
    const frames = document.querySelectorAll('[data-rm-draw-frame]');
    const button = [...frames[frames.length - 1].querySelectorAll('[data-rm-draw-status] button, button')].find(node => /重新生图|重画/.test(node.textContent));
    if (!button) return false;
    button.click();
    return true;
});
const reroll = () => page.evaluate(() => {
    const frames = document.querySelectorAll('[data-rm-draw-frame]');
    // 不等结果：调用方自己放行请求。
    void images.rerollBuiltinImage(document.querySelector('details'), frames[frames.length - 1]).catch(error => { window.__rerollError = String(error?.message || error); });
});
let checks = 0;

// ---------- 1 挪位重画 + 旧请求晚回来 + 挪回原位 ----------
// 新回复成功后拿到生图许可，原来那一格自动画出第一张（p1）。
await page.evaluate(() => fresh.markFreshDrawSlot('chat:c', 2, 0));
await mount(movedFace(2, false));
await page.waitForTimeout(150);
assert.equal(await calls(), 1, '新回复的图框自动画了一次'); checks++;
await releaseAll();
assert.equal(await lastFrameSrc(), '/user/images/p1.png'); checks++;
// 在原位手动重画（p2），请求发出去一直没回音。
await reroll();
await page.waitForTimeout(150);
assert.equal(await calls(), 2); checks++;
// 前面插进了一格，原来那一格挪到了第二个位置；那次请求超过 10 分钟没回音，当作卡死。
await page.evaluate(() => { window.__skew = 11 * 60 * 1000; });
await mount(movedFace(2, true));
await page.waitForTimeout(150);
await releaseCall(3);
assert.equal(await lastFrameSrc(), '/user/images/p1.png', '挪位后还是原来那张'); checks++;
// 挪开的位置上手动再画一张（p4），画好了。
const before = await calls();
await reroll();
await page.waitForTimeout(150);
assert.equal(await calls(), before + 1); checks++;
const manualN = await calls();
await releaseCall(manualN);
assert.equal(await lastFrameSrc(), `/user/images/p${manualN}.png`, '镜面换成了手动画的那张'); checks++;
// 那次卡住的旧请求（p2）这时才回来。
await releaseCall(2);
// 插进来的那一格又没了，原来那一格回到第一个位置：仍是手动画的那张。
await mount(movedFace(2, false));
await page.waitForTimeout(200);
assert.equal(await lastFrameSrc(), `/user/images/p${manualN}.png`, '挪回原位仍显示后来手动画的那张'); checks++;
// 面板里看到的也是这一组：当前那张是手动画的，翻到上一张再翻回来，镜面跟着换，换的是同一组里的图。
const panel = await page.evaluate(() => {
    const root = document.querySelector('details');
    const item = images.listBuiltinImageFrames(root)[0];
    const shown = item.versions[item.current]?.path;
    const all = item.versions.map(entry => entry.path).join(',');
    const frame = root.querySelector('[data-rm-draw-frame]');
    const back = images.showBuiltinImageVersion(root, frame, item.current - 1);
    const after = images.listBuiltinImageFrames(root)[0];
    return { shown, all, back: back.path, now: after.versions[after.current]?.path, total: after.versions.length, frame: frame.querySelector('img[data-rm-draw-result]')?.getAttribute('src')?.replace(location.origin, '') };
});
assert.equal(panel.shown, `/user/images/p${manualN}.png`); checks++;
assert.match(panel.all, /p1\.png/, '原来那张留在历史里'); checks++;
assert.equal(panel.back, panel.now, '翻版本改的就是面板看到的那一组'); checks++;
assert.equal(panel.frame, panel.back); checks++;
// 同一面里两格写着同一段提示词：各自留着自己的图，不互相认领、不互相删。
await page.evaluate(() => { window.__skew = 0; fresh.markFreshDrawSlot('chat:c', 4, 0); });
const twin = `<details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="4" data-rabbit-mirror-owner-swipe="0"><summary>两格同画面</summary>
  <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>阿竹在某城的桥头吹笛</p></figure>
  <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>阿竹在某城的桥头吹笛</p></figure></details>`;
const twinBase = await calls();
await mount(twin);
await page.waitForTimeout(150);
assert.equal(await calls(), twinBase + 2); checks++;
await releaseAll();
// 第二格再画一张：它的 shownAt 更晚，第一格也不能因此认成第二格的图。
await page.evaluate(() => { const frames = document.querySelectorAll('[data-rm-draw-frame]'); void images.rerollBuiltinImage(document.querySelector('details'), frames[1]); });
await page.waitForTimeout(150);
await releaseAll();
await mount(twin);
await page.waitForTimeout(150);
const twinSrc = await page.evaluate(() => [...document.querySelectorAll('[data-rm-draw-frame]')].map(frame => (frame.querySelector('img[data-rm-draw-result]')?.getAttribute('src') || '-').replace(location.origin, '')).join(' '));
assert.equal(twinSrc, `/user/images/p${twinBase + 1}.png /user/images/p${twinBase + 3}.png`, '两格各是各的'); checks++;
assert.equal(await page.evaluate(() => images.listBuiltinImageFrames(document.querySelector('details')).map(item => item.versions.length).join(',')), '1,2'); checks++;

// ---------- 2 面板打开后这一层换成了别的回复 ----------
await page.evaluate(async query => {
    const store = await import('/src/imageStore.js?' + query);
    document.body.innerHTML = `<div id="chat"><details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="6" data-rabbit-mirror-owner-swipe="0"><summary>阿岩</summary>
      <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>阿岩在某城的集市上挑灯笼</p></figure></details></div>`;
    const root = document.querySelector('details');
    const key = images.listBuiltinImageFrames(root)[0].key;
    store.replaceMirrorImageVersions(key, { path: '/user/images/old-b.png', generatedAt: '2026-10-20T02:00:00Z' }, [{ path: '/user/images/old-a.png', generatedAt: '2026-10-20T01:00:00Z' }]);
    imageUi.openMirrorImagePanel(root);
    window.__panelKey = key;
}, query);
const prevButton = () => page.locator('[data-rm-builtin-image-panel] button[aria-label="上一张"]');
assert.equal(await prevButton().isDisabled(), false, '本来能翻上一张'); checks++;
// 删楼／重新生成：第 6 层换成了另一条回复，它也有自己的两张图。
await page.evaluate(async query => {
    const store = await import('/src/imageStore.js?' + query);
    window.__ctx.chat[6] = { mes: '某城的另一条回复', swipe_id: 0, extra: {} };
    store.replaceMirrorImageVersions(window.__panelKey, { path: '/user/images/new-b.png', generatedAt: '2026-10-22T02:00:00Z' }, [{ path: '/user/images/new-a.png', generatedAt: '2026-10-22T01:00:00Z' }]);
}, query);
await page.evaluate(() => document.querySelector('[data-rm-builtin-image-panel] [role="tab"], [data-rm-builtin-image-panel] button[data-rm-builtin-action="edit"]')?.click());
await page.waitForTimeout(50);
assert.equal(await prevButton().isDisabled(), true, '旧面板不再能切图'); checks++;
// 就算按钮状态没来得及刷新，点下去也不改新回复的插图。
await page.evaluate(() => { const button = document.querySelector('[data-rm-builtin-image-panel] button[aria-label="上一张"]'); button.disabled = false; button.click(); });
await page.waitForTimeout(50);
const afterStep = await page.evaluate(async query => {
    const store = await import('/src/imageStore.js?' + query);
    return store.loadMirrorImage(window.__panelKey)?.path;
}, query);
assert.equal(afterStep, '/user/images/new-b.png', '新回复的插图没被旧面板改掉'); checks++;
await page.evaluate(() => imageUi.closeMirrorImagePanel());

// ---------- 3 旧分支里认不出版本的那张 ----------
await page.evaluate(() => fresh.markFreshDrawSlot('chat:c', 8, 0));
const branchFace = `<details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="8" data-rabbit-mirror-owner-swipe="0"><summary>阿竹</summary>
  <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>阿竹在某城的渡口送别</p></figure></details>`;
const branchBase = await calls();
await mount(branchFace);
await page.waitForTimeout(150);
await releaseAll();
assert.equal(await calls(), branchBase + 1); checks++;
// 开分支：聊天换了名字和身份，消息照抄过来；旧版分支没记下版本，消息上也没有那张图的副本。
await page.evaluate(() => {
    const ctx = window.__ctx;
    ctx.chat = JSON.parse(JSON.stringify(ctx.chat));
    ctx.chatId = 'c-branch';
    ctx.chatMetadata = { integrity: 'branch' };
    const extra = ctx.chat[8].extra;
    delete extra.rabbitMirrorImages;
    delete extra.rabbitMirrorImageOwner.archiveVersions;
    delete extra.rabbitMirrorImageOwner.archiveHistoryVersions;
});
const branchHtml = branchFace.replaceAll('chat:c"', 'chat:c-branch"');
await mount(branchHtml);
await page.waitForTimeout(150);
assert.equal(await calls(), branchBase + 1, '认不出版本时不自动补画'); checks++;
const item = await page.evaluate(() => { const list = images.listBuiltinImageFrames(document.querySelector('details')); return { broken: list[0].broken, code: list[0].brokenCode }; });
assert.deepEqual(item, { broken: true, code: 'image_version_unconfirmed' }); checks++;
await page.evaluate(() => imageUi.openMirrorImagePanel(document.querySelector('details')));
const roll = page.locator('[data-rm-builtin-image-panel] button[data-rm-builtin-action="reroll"]');
assert.equal(await roll.isDisabled(), false, '面板里的再画一张能用'); checks++;
assert.match(await page.locator('[data-rm-builtin-image-panel]').textContent(), /认不出是哪一版/); checks++;
await roll.click();
await page.waitForTimeout(150);
assert.equal(await calls(), branchBase + 2, '点了才画'); checks++;
await releaseAll();
await page.waitForTimeout(100);
const branchShown = await page.evaluate(() => { const list = images.listBuiltinImageFrames(document.querySelector('details')); return list[0].broken ? 'broken' : list[0].versions[list[0].current]?.path; });
assert.equal(branchShown, `/user/images/p${branchBase + 2}.png`, '新画的存进了这个分支'); checks++;
await page.evaluate(() => imageUi.closeMirrorImagePanel());

assert.deepEqual(pageErrors, []); checks++;
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
