// 多面镜子来回翻看时不重画：画好的图在归属写上前后都能找回；同一张正在画时跟着那一次，不另发请求。
// 1.78.8 起只有确实成功的新输出才自动生图：每层放一条真回复，要自动画的那层先按真实流程拿到许可（markFreshDrawSlot）。
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
    if (pathname === '/extensions.js') return res.end('const ctx = { chat: [], chatId: "c", getCurrentChatId: () => "c", characterId: 0, characters: [{ name: "测试" }], name2: "测试" }; export const extension_settings = { rabbit_mirror_theater: { builtinImageEnabled: true } }; export const getContext = () => ctx;');
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){}}; export const event_types = {};');
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
    const ctx = { chat: Array.from({ length: 60 }, (_, i) => ({ mes: '回复' + i, swipe_id: 0, extra: {} })), chatId: 'c', getCurrentChatId: () => 'c', chatMetadata: { other: 1 } };
    window.SillyTavern = { getContext: () => ctx };
    window.__calls = 0;
    window.__release = [];
    window.STBaiBaiImage = {
        apiVersion: 1, capabilities: { globalApi: true, generate: true },
        getBackendStatus: () => ({ configured: true, supportsCharacters: false, backend: 'test' }),
        generate: () => { window.__calls += 1; const n = window.__calls; return new Promise(resolve => window.__release.push(() => resolve({ path: `/user/images/p${n}.png` }))); },
    };
    window.images = await import('/src/builtinImage.js?' + query);
    window.fresh = await import('/src/freshDrawSlots.js?' + query);
}, query);
const grant = (...floors) => page.evaluate(floors => { for (const mes of floors) fresh.markFreshDrawSlot('chat:c', mes, 0); }, floors);
// 切走聊天再切回来：酒馆重新读一份聊天（消息是新对象，带着存进聊天的附加数据）。
const reloadChat = () => page.evaluate(async () => {
    document.body.innerHTML = '';
    const ctx = window.SillyTavern.getContext();
    const saved = JSON.parse(JSON.stringify(ctx.chat));
    ctx.chat = [];
    const ext = await import('/extensions.js'); ext.getContext().chat = [];
    ctx.chat = saved;
});

const face = (n, stamped, mes = 12) => `<details open${stamped ? ` data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="${mes}" data-rabbit-mirror-owner-swipe="0"` : ''}><summary>第${n}面</summary>
  <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>第${n}面的画面：雨夜里撑伞的少年站在石桥上</p></figure></details>`;
const mountHost = (stamped, mes = 12) => page.evaluate(([html, mes]) => {
    document.body.innerHTML = `<div data-rabbit-mirror-external-source="true" data-rm-source="independent" data-rm-owner-chat="chat:c" data-rm-owner-mesid="${mes}" data-rm-owner-swipe="0">${html}</div>`;
    for (const details of document.querySelectorAll('details')) images.fillBuiltinImageFrames(details);
}, [[1, 2, 3].map(n => face(n, stamped, mes)).join(''), mes]);
const release = () => page.evaluate(async () => { for (const run of window.__release.splice(0)) run(); await new Promise(resolve => setTimeout(resolve, 50)); });
const painted = () => page.evaluate(() => [...document.querySelectorAll('[data-rm-draw-frame]')].map(frame => (frame.querySelector('img[data-rm-draw-result]')?.getAttribute('src') || '-').replace(location.origin, '')).join(' '));
const calls = () => page.evaluate(() => window.__calls);
let checks = 0;

// 1 外壳挂好、这一面还没写上归属时就开始画：键按外壳的归属算
await grant(12);
await mountHost(false);
await page.waitForTimeout(100);
assert.equal(await calls(), 3); checks++;
await release();
assert.equal(await painted(), '/user/images/p1.png /user/images/p2.png /user/images/p3.png'); checks++;

// 2 写上归属后重新挂（来回翻看、重挂载）：直接放回，不再画
await mountHost(true);
await page.waitForTimeout(150);
assert.equal(await calls(), 3); checks++;
assert.equal(await painted(), '/user/images/p1.png /user/images/p2.png /user/images/p3.png'); checks++;
assert.equal(await page.evaluate(() => images.listBuiltinImageFrames(document.querySelector('details')).map(item => item.versions.length).join(',')), '1'); checks++;

// 3 旧版本存在「楼层空」键下的图：写上归属后也找得回来，面板里也看得到
await page.evaluate(() => {
    const raw = {};
    for (let i = 0; i < localStorage.length; i += 1) raw[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
    localStorage.clear();
    for (const [name, value] of Object.entries(raw)) localStorage.setItem(name.replace(':builtin:chat:c:12:0:', ':builtin:c:::'), value);
});
await mountHost(true);
await page.waitForTimeout(150);
assert.equal(await calls(), 3); checks++;
assert.equal(await painted(), '/user/images/p1.png /user/images/p2.png /user/images/p3.png'); checks++;
assert.equal(await page.evaluate(() => images.listBuiltinImageFrames(document.querySelectorAll('details')[1]).map(item => item.versions.length).join(',')), '1'); checks++;

// 4 同一张正在画（这一面还没写上归属，键按外壳算）时写上归属重挂：跟着那一次，不另发请求
// （1.78.7 起请求要绑定原消息，连楼层都认不出的面不发请求，所以这里放在外壳里。）
await page.evaluate(() => localStorage.clear());
await grant(9);
await page.evaluate(html => {
    document.body.innerHTML = `<div data-rabbit-mirror-external-source="true" data-rm-source="independent" data-rm-owner-chat="chat:c" data-rm-owner-mesid="9" data-rm-owner-swipe="0">${html}</div>`;
    images.fillBuiltinImageFrames(document.querySelector('details'));
}, face(9, false, 9));
await page.waitForTimeout(80);
assert.equal(await calls(), 4); checks++;
await page.evaluate(html => {
    document.body.innerHTML = `<div data-rabbit-mirror-external-source="true" data-rm-source="independent" data-rm-owner-chat="chat:c" data-rm-owner-mesid="9" data-rm-owner-swipe="0">${html}</div>`;
    images.fillBuiltinImageFrames(document.querySelector('details'));
}, face(9, true, 9));
await page.waitForTimeout(80);
assert.equal(await calls(), 4); checks++;
await release();
assert.equal(await painted(), '/user/images/p4.png'); checks++;

// 5 已经发出去的请求还没画完时切走聊天、再切回来（酒馆换了一份聊天数组）：跟着那一次等结果、存下，不另发一次
await page.evaluate(() => localStorage.clear());
await grant(13);
await mountHost(true, 13);
await page.waitForTimeout(100);
assert.equal(await calls(), 7); checks++;
await reloadChat();
await mountHost(true, 13);
await page.waitForTimeout(150);
assert.equal(await calls(), 7); checks++;
await release();
assert.equal(await painted(), '/user/images/p5.png /user/images/p6.png /user/images/p7.png'); checks++;
await mountHost(true, 13);
await page.waitForTimeout(150);
assert.equal(await calls(), 7); checks++;

// 6 重新进聊天时这一面前面少了一个图框，序号挪了：同一楼层、同一段提示词的图照样找回，不重画
await page.evaluate(() => localStorage.clear());
await grant(20, 21);
const twoFrames = (withFirst, mes = 20) => `<details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="${mes}" data-rabbit-mirror-owner-swipe="0"><summary>两格</summary>
  ${withFirst ? '<figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>第一格：清晨的码头上海鸥落在缆桩</p></figure>' : ''}
  <figure data-rm-draw-frame="2"><p data-rm-draw-prompt="1" hidden>第二格：傍晚的码头上渔船靠岸卸货</p></figure></details>`;
const mountFace = html => page.evaluate(html => { document.body.innerHTML = html; images.fillBuiltinImageFrames(document.querySelector('details')); }, html);
await mountFace(twoFrames(true));
await page.waitForTimeout(100);
assert.equal(await calls(), 9); checks++;
await release();
await mountFace(twoFrames(false));
await page.waitForTimeout(150);
assert.equal(await calls(), 9); checks++;
assert.equal(await painted(), '/user/images/p9.png'); checks++;
// 前面那一格回来了：两格各找回自己的那张，不重画
await mountFace(twoFrames(true));
await page.waitForTimeout(150);
assert.equal(await calls(), 9); checks++;
assert.equal(await painted(), '/user/images/p8.png /user/images/p9.png'); checks++;

// 7 第二格的请求已经发出去、还没画完时切走聊天；回来时前面那一格不见了（序号挪了）：跟着那一次等，不另发
await page.evaluate(() => localStorage.clear());
await mountFace(twoFrames(true, 21));
await page.waitForTimeout(100);
assert.equal(await calls(), 11); checks++;
await reloadChat();
await mountFace(twoFrames(false, 21));
await page.waitForTimeout(150);
assert.equal(await calls(), 11); checks++;
await release();
assert.equal(await painted(), '/user/images/p11.png'); checks++;

// 8 旧版本被瘦过（本机存储满时只留图片地址）：翻回去那张沿用换下来那张的提示词，重画不用再构思
const shownPrompt = await page.evaluate(async query => {
    localStorage.clear();
    document.body.innerHTML = `<details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="30" data-rabbit-mirror-owner-swipe="0"><summary>一格</summary>
      <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>山顶的风车在晚霞里慢慢转</p></figure></details>`;
    const root = document.querySelector('details');
    const key = images.listBuiltinImageFrames(root)[0].key;
    const store = await import('/src/imageStore.js?' + query);
    const frame = root.querySelector('[data-rm-draw-frame]');
    const same = { path: '/user/images/old.png', generatedAt: '2026-10-21T01:00:00Z', prompt: 'p', promptMetadata: { prompt: 'windmill', nl: '风车', seed: 1 } };
    const edited = { path: '/user/images/edited.png', generatedAt: '2026-10-21T01:30:00Z', prompt: 'q', promptMetadata: { prompt: 'castle', nl: '城堡', seed: 3 } };
    // 两个旧版本存进去时会被瘦掉提示词，只留指纹
    store.replaceMirrorImageVersions(key, { path: '/user/images/new.png', generatedAt: '2026-10-21T02:00:00Z', prompt: 'p', promptMetadata: { prompt: 'windmill', nl: '风车', seed: 2 }, looksSources: { 阿雪: '建档' } }, [same, edited]);
    const slim = store.loadMirrorImage(key).history;
    const a = images.showBuiltinImageVersion(root, frame, 0);
    const first = [a.path, a.promptMetadata.prompt, a.promptMetadata.seed, a.looksSources?.阿雪, slim.every(entry => entry.slimmed && !entry.prompt)].join('|');
    // 改过提示词画的那张：指纹对不上，不借当前那张的
    const list = images.listBuiltinImageFrames(root)[0];
    const b = images.showBuiltinImageVersion(root, frame, list.versions.findIndex(entry => entry.path === '/user/images/edited.png'));
    return `${first}#${[b.path, b.promptMetadata?.prompt ?? '', b.prompt ?? ''].join('|')}`;
}, query);
assert.equal(shownPrompt, '/user/images/old.png|windmill|1|建档|true#/user/images/edited.png||'); checks++;

// 9 本机存储满了、插图存档一份也写不进去：画好的图这次打开页面里还放得回去，重新挂上不再画
await page.evaluate(() => {
    localStorage.clear();
    window.__realSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
        if (String(key).startsWith('rabbitMirror:image:') && window.__imageQuota === 'none') throw Object.assign(new Error('full'), { name: 'QuotaExceededError' });
        if (String(key).startsWith('rabbitMirror:image:') && window.__imageQuota === 'small' && String(value).length > 400) throw Object.assign(new Error('full'), { name: 'QuotaExceededError' });
        return window.__realSetItem.call(this, key, value);
    };
    window.__imageQuota = 'none';
});
const fullFace = text => `<details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="40" data-rabbit-mirror-owner-swipe="0"><summary>满</summary>
  <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>${text}</p></figure></details>`;
await grant(40, 41);
let base = await calls();
await mountFace(fullFace('长廊尽头一盏灯笼在风里摇晃，地上落着红绸'));
await page.waitForTimeout(100);
await release();
assert.equal(await calls(), base + 1); checks++;
await mountFace(fullFace('长廊尽头一盏灯笼在风里摇晃，地上落着红绸'));
await page.waitForTimeout(150);
assert.equal(await calls(), base + 1); checks++;
assert.equal(await painted(), `/user/images/p${base + 1}.png`); checks++;

// 10 提示词每次读出来都不一样又存不下：1.78.8 起同一成品的图框说明文字变了，仍是原来那张、原来那次请求，
// 不再换个键自动重画（以前还容许 10 分钟内自动画两次）；要新图得自己点重画。
for (const suffix of ['（二）', '（三）']) {
    await mountFace(fullFace('长廊尽头一盏灯笼在风里摇晃，地上落着红绸' + suffix));
    await page.waitForTimeout(150);
    await release();
    assert.equal(await calls(), base + 1, '说明文字变了也不另发请求'); checks++;
    assert.equal(await painted(), `/user/images/p${base + 1}.png`, '放回原来那张'); checks++;
}
await page.evaluate(() => { void images.rerollBuiltinImage(document.querySelector('details'), document.querySelector('[data-rm-draw-frame]')); });
await page.waitForTimeout(100);
assert.equal(await calls(), base + 2, '手动重画照样能用'); checks++;
await release();

// 11 整份存不下、只存地址存得下：刷新后图还在
await page.evaluate(() => { window.__imageQuota = 'small'; });
const smallFace = `<details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="41" data-rabbit-mirror-owner-swipe="0"><summary>小</summary>
  <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>${'雪夜里的山门前两行脚印延伸到石阶尽头'.repeat(12)}</p></figure></details>`;
base = await calls();
await mountFace(smallFace);
await page.waitForTimeout(100);
await release();
assert.equal(await calls(), base + 1); checks++;
// 有消息可存时插图记录跟着消息存进聊天（不占本机存储），刷新后从消息上读回。
assert.equal(await page.evaluate(() => Object.entries(window.SillyTavern.getContext().chat[41].extra?.rabbitMirrorImages || {}).map(([, value]) => value.current.path).join(',')), `/user/images/p${base + 1}.png`); checks++;
// 本机那份（存储满时只存得下地址）也在。
assert.equal(await page.evaluate(() => Object.keys(localStorage).filter(key => /:builtin:(chat:)?c:41:0:/.test(key)).map(key => JSON.parse(localStorage.getItem(key)).current.path).join(',')), `/user/images/p${base + 1}.png`); checks++;
await page.evaluate(() => { Storage.prototype.setItem = window.__realSetItem; window.__imageQuota = ''; });

// 11b 这次画过的一面，用户在面板里换回更早的一张：重新挂上时放用户选的那张
const pickedBack = await page.evaluate(async () => {
    const html = `<details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="41" data-rabbit-mirror-owner-swipe="0"><summary>小</summary>
      <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>${'雪夜里的山门前两行脚印延伸到石阶尽头'.repeat(12)}</p></figure></details>`;
    document.body.innerHTML = html;
    const root = document.querySelector('details');
    const key = images.listBuiltinImageFrames(root)[0].key;
    const store = await import('/src/imageStore.js?' + location.search.slice(1));
    const now = store.loadMirrorImage(key);
    store.replaceMirrorImageVersions(key, now, [{ path: '/user/images/older.png', generatedAt: '2026-01-01T00:00:00Z' }]);
    images.showBuiltinImageVersion(root, root.querySelector('[data-rm-draw-frame]'), 0);
    document.body.innerHTML = html;
    images.fillBuiltinImageFrames(document.querySelector('details'));
    await new Promise(resolve => setTimeout(resolve, 100));
    return document.querySelector('img[data-rm-draw-result]')?.getAttribute('src') || '';
});
assert.equal(pickedBack.replace(origin, ''), '/user/images/older.png'); checks++;

// 12 融合在回复里的镜面（键里没记楼层）：不同楼层各自自动画，不会挤在一个位置上被拦
base = await calls();
await grant(3, 5, 7);
await page.evaluate(() => {
    document.body.innerHTML = [3, 5, 7].map(n => `<div class="mes" mesid="${n}"><details open><summary>第${n}层</summary>
      <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>第${n}层的画面：渡口的船夫撑篙离岸</p></figure></details></div>`).join('');
    for (const details of document.querySelectorAll('details')) images.fillBuiltinImageFrames(details);
});
await page.waitForTimeout(150);
assert.equal(await calls(), base + 3); checks++;
await release();

// 13 存档里的图读不到（链接失效）：只留「重新生图」按钮，同一页面里再怎么重挂都不自动画；点按钮才画
base = await calls();
const deadFace = `<details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="50" data-rabbit-mirror-owner-swipe="0"><summary>失效</summary>
  <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>荒原上的烽火台在暮色里冒烟</p></figure></details>`;
await page.evaluate(async ([html, query]) => {
    localStorage.clear();
    document.body.innerHTML = html;
    const root = document.querySelector('details');
    const key = images.listBuiltinImageFrames(root)[0].key;
    const store = await import('/src/imageStore.js?' + query);
    store.saveMirrorImage(key, { path: '/missing/gone.png', generatedAt: '2026-10-21T00:00:00Z' });
}, [deadFace, query]);
for (let round = 0; round < 3; round += 1) { await mountFace(deadFace); await page.waitForTimeout(250); }
assert.equal(await calls(), base); checks++;
assert.match(await page.evaluate(() => document.querySelector('[data-rm-draw-status]')?.textContent || ''), /读不到了/); checks++;
await page.evaluate(() => [...document.querySelectorAll('[data-rm-draw-status] button')].find(button => button.textContent === '重新生图').click());
await page.waitForTimeout(100);
assert.equal(await calls(), base + 1); checks++;
await release();

// 14 存档在、地址却是这台设备认不出的：不当成没画过去自动画
base = await calls();
const oddFace = `<details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="51" data-rabbit-mirror-owner-swipe="0"><summary>别的壳</summary>
  <figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>井台边的老槐树下落了一地槐花</p></figure></details>`;
await page.evaluate(async ([html, query]) => {
    document.body.innerHTML = html;
    const root = document.querySelector('details');
    const key = images.listBuiltinImageFrames(root)[0].key;
    const store = await import('/src/imageStore.js?' + query);
    store.saveMirrorImage(key, { url: 'tauri://localhost/user/images/x.png', generatedAt: '2026-10-21T00:00:00Z' });
}, [oddFace, query]);
await mountFace(oddFace);
await page.waitForTimeout(200);
assert.equal(await calls(), base); checks++;
assert.match(await page.evaluate(() => document.querySelector('[data-rm-draw-status]')?.textContent || ''), /打不开/); checks++;

// 15 画面说明编号对不上（模型把模板的 "1" 复制给了两个图框）、段落被多包了一层：按先后配给图框，不丢
const notesFace = `<details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="52" data-rabbit-mirror-owner-swipe="0"><summary>三格</summary>
  <figure data-rm-draw-frame="1"></figure><figure data-rm-draw-frame="1"></figure><figure data-rm-draw-frame="1"></figure>
  <div data-rm-draw-notes="1" hidden><p data-rm-draw-prompt="1">第一格：渡口清晨</p></div>
  <div data-rm-draw-notes="3" hidden><p data-rm-draw-prompt="1">第三格：渡口夜里</p></div>
  <div data-rm-draw-notes="2" hidden><div><p data-rm-draw-prompt="1">第二格：渡口黄昏</p><p data-rm-draw-char="阿雪">红衣</p></div></div></details>`;
const adopted = await page.evaluate(html => {
    document.body.innerHTML = html;
    const root = document.querySelector('details');
    images.adoptDrawNotes(root);
    return [...root.querySelectorAll('[data-rm-draw-frame]')].map(frame => (frame.querySelector('[data-rm-draw-prompt]')?.textContent || '-') + '|' + (frame.querySelector('[data-rm-draw-char]')?.textContent || '-')).join(' ');
}, notesFace);
assert.equal(adopted, '第一格：渡口清晨|- 第二格：渡口黄昏|红衣 第三格：渡口夜里|-'); checks++;

assert.deepEqual(pageErrors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
