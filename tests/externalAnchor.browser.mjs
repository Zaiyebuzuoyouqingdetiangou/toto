// 外置兔子镜挂在消息的哪一层：正文画了气泡就进正文；整条消息画成卡片就在正文下面（卡片里）；选了「外面」就挂在 .mes 后面。
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
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/style.css"><body style="margin:0"><div id="sheld"><div id="chat" style="width:420px"></div></div>'); }
    if (pathname === '/style.css') { res.setHeader('Content-Type', 'text/css'); try { return res.end(await readFile(path.join(rootDir, 'style.css'))); } catch { res.statusCode = 404; return res.end(); } }
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
    globalThis.SillyTavern = { getContext: () => ({ chat: [{ mes: 'x' }, { mes: 'y' }], chatId: 't', characterId: 0, characters: [{ name: 'c' }] }) };
    window.geo = await import('/src/independentApi/geometry.js?' + query);
    window.anchorMod = await import('/src/independentApi/externalAnchor.js?' + query);
    window.settings = await import('/src/settings.js?' + query);
    window.early = await import('/src/independentApi/earlyBody.js?' + query);
}, query);
let checks = 0;
const FACE = '<details data-rabbit-mirror-external-details="true" open><summary>【兔子镜：t】</summary><div style="padding:8px">正文里的兔子镜，内容足够长可以看得见宽度。</div></details>';
const build = (css, setting) => page.evaluate(({ css, setting, FACE }) => {
    document.getElementById('beauty')?.remove();
    const style = document.createElement('style'); style.id = 'beauty'; style.textContent = css; document.head.append(style);
    const chat = document.getElementById('chat');
    chat.innerHTML = `<div class="mes" mesid="0" style="display:flex;padding:10px"><div class="avatar" style="width:40px"></div><div class="mes_block" style="flex:1;min-width:0"><div class="ch_name">名字</div><div class="mes_text"><p>她把信折好，放进了抽屉。这一段正文要写得长一点，占满一行。</p></div></div></div>
      <div class="mes last_mes" mesid="1" style="display:flex;padding:10px"><div class="avatar" style="width:40px"></div><div class="mes_block" style="flex:1;min-width:0"><div class="ch_name">名字</div><div class="mes_text"><p>第二条正文。这一段也写长一点，让它有宽度可以量。</p></div></div></div>`;
    settings.updateSettings({ independentExternalAnchor: setting, generationSource: 'independent', independentDisplayMode: 'external' });
    const el = chat.querySelector('.mes[mesid="1"]');
    const host = document.createElement('div');
    host.setAttribute('data-rabbit-mirror-external-source', 'true');
    host.dataset.rmSource = 'independent'; host.dataset.rmState = 'ready'; host.dataset.rmKey = 'k1';
    host.innerHTML = FACE;
    geo.placeExternalHost(el, host, 'k1', 'independent');
    const where = host.parentElement.classList.contains('mes_text') ? 'body' : host.parentElement.classList.contains('mes_block') ? 'message' : host.parentElement.id === 'chat' ? 'outside' : '?';
    const bodyRect = el.querySelector('.mes_text').getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    return { where, anchor: host.dataset.rmExternalAnchor, afterBody: host.previousElementSibling?.classList.contains('mes_text') || false,
        widthDiff: Math.round(hostRect.width - bodyRect.width), left: Math.round(hostRect.left - bodyRect.left), hostWidth: Math.round(hostRect.width) };
}, { css, setting, FACE });

// 1 气泡画在正文上 → 进正文
let r = await build('.mes_text{background:#fff;border-radius:12px;padding:12px}', 'auto');
assert.equal(r.where, 'body'); checks++;
assert.equal(r.anchor, 'body'); checks++;
assert.ok(r.hostWidth > 200 && Math.abs(r.widthDiff) <= 26, JSON.stringify(r)); checks++; // 铺满正文内容区（差的是 padding）
// 2 整条消息画成卡片 → 正文下面、还在消息里
r = await build('.mes{background:#eef;border:1px solid #88a;border-radius:16px}', 'auto');
assert.equal(r.where, 'message'); checks++;
assert.equal(r.afterBody, true); checks++;
assert.equal(r.left, 0); checks++;
assert.equal(r.widthDiff, 0); checks++;
// 3 没有美化 → 也在消息里
r = await build('', 'auto');
assert.equal(r.where, 'message'); checks++;
// 4 正文被藏起来了 → 不进正文
r = await build('.mes_text{background:#fff;display:none}', 'auto');
assert.equal(r.where, 'message'); checks++;
r = await build('.mes_text{background:#fff;display:none}', 'body');
assert.equal(r.where, 'message'); checks++;
// 5 手动：一律进正文 / 整条消息外面
r = await build('', 'body');
assert.equal(r.where, 'body'); checks++;
r = await build('.mes_text{background:#fff}', 'outside');
assert.equal(r.where, 'outside'); checks++;
assert.equal(r.anchor, 'outside'); checks++;
// 6 换了设置再放一次：同一个壳挪位置，不另造一个
const moved = await page.evaluate(() => {
    const host = document.querySelector('[data-rabbit-mirror-external-source]');
    settings.updateSettings({ independentExternalAnchor: 'auto' });
    geo.placeExternalHost(document.querySelector('.mes[mesid="1"]'), host, 'k1', 'independent');
    return { count: document.querySelectorAll('[data-rabbit-mirror-external-source]').length, where: host.parentElement.className, anchor: host.dataset.rmExternalAnchor };
});
assert.equal(moved.count, 1); checks++;
assert.equal(moved.where, 'mes_text'); checks++;
// 7 判断函数本身：阴影、边框也算气泡；透明底不算
const paints = await page.evaluate(() => {
    const probe = css => { const n = document.createElement('div'); n.style.cssText = css; document.body.append(n); const v = anchorMod.paintsBubble(n); n.remove(); return v; };
    return [probe('background:transparent'), probe('box-shadow:0 2px 8px rgba(0,0,0,.2)'), probe('border:1px solid rgba(0,0,0,.3)'), probe('border:1px solid transparent'), probe('background:rgba(255,255,255,0.01)'), probe('background:color-mix(in srgb, #fff 50%, transparent 50%)'), probe('background:color-mix(in srgb, transparent, transparent)')];
});
assert.deepEqual(paints, [false, true, true, false, false, true, false]); checks++;

// 8 正在编辑（正文里是编辑框）：先放正文下面；编辑完自动挪进正文
await build('.mes_text{background:#fff;border-radius:12px;padding:12px}', 'auto');
const editing = await page.evaluate(FACE => {
    const el = document.querySelector('.mes[mesid="1"]');
    // 酒馆进编辑时整个重写正文：原来挂在正文里的壳一起没了，插件会按存档重新挂一个
    el.querySelector('.mes_text').innerHTML = '<textarea id="curEditTextarea">编辑中</textarea>';
    const host = document.createElement('div');
    host.setAttribute('data-rabbit-mirror-external-source', 'true');
    host.dataset.rmSource = 'independent'; host.dataset.rmState = 'ready'; host.dataset.rmKey = 'k1';
    host.innerHTML = FACE;
    geo.placeExternalHost(el, host, 'k1', 'independent');
    return host.parentElement.className;
}, FACE);
assert.equal(editing, 'mes_block'); checks++;
await page.evaluate(() => { document.querySelector('.mes[mesid="1"] .mes_text').innerHTML = '<p>编辑完了的正文，写得长一些好量宽度。</p>'; });
await page.waitForTimeout(1200);
assert.equal(await page.evaluate(() => document.querySelector('[data-rabbit-mirror-external-source]').parentElement.className), 'mes_text'); checks++;
assert.equal(await page.evaluate(() => document.querySelectorAll('[data-rabbit-mirror-external-source]').length), 1); checks++;
// 9 最后一层正在流式输出：先放正文下面；输出结束自动挪进正文
await build('.mes_text{background:#fff;border-radius:12px;padding:12px}', 'auto');
const streaming = await page.evaluate(() => {
    const el = document.querySelector('.mes[mesid="1"]');
    el.classList.add('streaming');
    const host = document.querySelector('[data-rabbit-mirror-external-source]');
    geo.placeExternalHost(el, host, 'k1', 'independent');
    return host.parentElement.className;
});
assert.equal(streaming, 'mes_block'); checks++;
await page.evaluate(() => document.querySelector('.mes[mesid="1"]').classList.remove('streaming'));
await page.waitForTimeout(1200);
assert.equal(await page.evaluate(() => document.querySelector('[data-rabbit-mirror-external-source]').parentElement.className), 'mes_text'); checks++;
// 10 设置是「外面」时，忙不忙都不会等着挪进正文
await build('.mes_text{background:#fff}', 'outside');
await page.evaluate(() => { const el = document.querySelector('.mes[mesid="1"]'); el.classList.add('streaming'); geo.placeExternalHost(el, document.querySelector('[data-rabbit-mirror-external-source]'), 'k1', 'independent'); el.classList.remove('streaming'); });
await page.waitForTimeout(1000);
assert.equal(await page.evaluate(() => document.querySelector('[data-rabbit-mirror-external-source]').parentElement.id), 'chat'); checks++;

// 11 酒馆整段重写正文（swipe／翻译／编辑）把挂在正文里的壳扔掉：按移除记录原样挂回去，不另造一份；插件自己只移除壳时不挂回
await build('.mes_text{background:#fff;border-radius:12px;padding:12px}', 'auto');
const readopt = await page.evaluate(() => {
    const el = document.querySelector('.mes[mesid="1"]');
    const body = el.querySelector('.mes_text');
    const host = body.querySelector('[data-rabbit-mirror-external-source]');
    host.querySelector('details').dataset.touched = 'yes';
    const removed = [...body.childNodes];
    body.innerHTML = '<p>翻译后的正文，重新写过一遍，长度足够。</p>';
    const count = early.readoptDetachedExternalHosts([{ target: body, removedNodes: removed, addedNodes: [] }]);
    const again = document.querySelector('[data-rabbit-mirror-external-source]');
    return { count, same: again === host, where: again?.parentElement?.className, touched: again?.querySelector('details')?.dataset.touched, total: document.querySelectorAll('[data-rabbit-mirror-external-source]').length };
});
assert.deepEqual(readopt, { count: 1, same: true, where: 'mes_text', touched: 'yes', total: 1 }); checks++;
const own = await page.evaluate(() => {
    const el = document.querySelector('.mes[mesid="1"]');
    const body = el.querySelector('.mes_text');
    const host = body.querySelector('[data-rabbit-mirror-external-source]');
    host.remove();
    const count = early.readoptDetachedExternalHosts([{ target: body, removedNodes: [host], addedNodes: [] }]);
    return { count, total: document.querySelectorAll('[data-rabbit-mirror-external-source]').length };
});
assert.deepEqual(own, { count: 0, total: 0 }); checks++;

assert.deepEqual(pageErrors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
