// 出图前每个人的长相按固定顺序取：建档角色 → 角色卡／Persona → 世界书 → 模型写的；前面有的，后面写得不一样的发色瞳色去掉。
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
    const ctx = { chat: [], chatId: 'c', getCurrentChatId: () => 'c' };
    window.SillyTavern = { getContext: () => ctx };
    window.__calls = 0;
    window.__release = [];
    window.__sent = [];
    window.STBaiBaiImage = {
        apiVersion: 1, capabilities: { globalApi: true, generate: true, characterLibrary: true },
        getBackendStatus: () => ({ configured: true, supportsCharacters: true, backend: 'test' }),
        getCharacters: () => ({ characters: [{ name: '阿岩', tag: '1boy, long silver hair, big red eyes', nl: '' }] }),
        generate: request => { window.__calls += 1; const n = window.__calls; window.__sent.push(request); return Promise.resolve({ path: `/user/images/p${n}.png` }); },
    };
    ctx.characterId = 0; ctx.name2 = '阿雪'; ctx.name1 = '阿竹';
    // 角色卡用 {{char}}／{{user}} 写，长相放在一段背景后面，还提到了 Persona 的发色：都得处理好
    const card = '{{char}}是山门的大师姐，' + '往事很多。'.repeat(60) + '\n【外貌】{{char}}：黑色长直发，绿色眼睛，性格温和。{{user}}则是一头金发。';
    ctx.characters = [{ name: '阿雪', description: card, data: { description: card, extensions: {} } }];
    ctx.powerUserSettings = { persona_description: '{{user}}是个金发碧眼的少女，{{char}}是她的师姐。' };
    window.images = await import('/src/builtinImage.js?' + query);
}, query);

let checks = 0;
const draw = chars => page.evaluate(async chars => {
    window.__sent.length = 0;
    // 每次画一个新楼层：同一位置 10 分钟内只自动画两次（见 AUTO_DRAW_LIMIT）
    const mes = 12 + (window.__drawSeq || 0);
    document.body.innerHTML = `<div data-rabbit-mirror-external-source="true" data-rm-source="independent" data-rm-owner-chat="chat:c" data-rm-owner-mesid="${mes}" data-rm-owner-swipe="0"><details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="${mes}" data-rabbit-mirror-owner-swipe="0"><summary>一面</summary><figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>石殿里三个人围着炭盆说话，暖光。（${window.__drawSeq = (window.__drawSeq || 0) + 1}）</p>${chars}</figure></details></div>`;
    localStorage.clear();
    images.fillBuiltinImageFrames(document.querySelector('details'));
    for (let i = 0; i < 40 && !window.__sent.length; i += 1) await new Promise(r => setTimeout(r, 50));
    await new Promise(r => setTimeout(r, 80));
    const key = Object.keys(localStorage).find(name => name.includes('images:builtin'));
    const record = key ? JSON.parse(localStorage.getItem(key)) : null;
    return { request: window.__sent[0] || null, sources: record?.current?.looksSources || null };
}, chars);

const r = await draw(`<p data-rm-draw-char="阿岩" hidden>黑发青年，穿玄色劲装，神情冷峻</p><p data-rm-draw-char-tags="阿岩" hidden>1boy, short black hair, golden eyes, hair ornament, dark robe</p>
<p data-rm-draw-char="阿雪" hidden>棕色短发的少女，裹着狐裘</p><p data-rm-draw-char="阿竹" hidden>红色长发，蓝眼睛，穿绿裙</p>`);
assert.ok(r.request, '发出了生图请求'); checks++;
const person = name => (r.request.characters || []).find(item => item.name === name) || {};
// 建档角色：silver hair 为准，模型写的「黑发」「black hair」去掉，衣着留着
assert.match(person('阿岩').tag, /long silver hair/); checks++;
assert.doesNotMatch(person('阿岩').tag, /black hair|golden eyes/, '建档写了 long silver hair、big red eyes 这种带长短的写法，模型写的发色瞳色照样去掉'); checks++;
assert.match(person('阿岩').tag, /dark robe/); checks++;
assert.match(person('阿岩').tag, /hair ornament/, '发饰不是发色，留着'); checks++;
assert.doesNotMatch(person('阿岩').nl, /黑发/); checks++;
assert.match(person('阿岩').nl, /玄色劲装/); checks++;
// 角色卡：单人卡的长相写在角色卡里，模型写的「棕色短发」换成卡里的「黑色长直发」
assert.match(person('阿雪').nl, /黑色长直发/); checks++;
assert.doesNotMatch(person('阿雪').nl, /\{\{|金发/, '宏换成了名字；Persona 的发色不算进角色'); checks++;
assert.doesNotMatch(person('阿雪').nl, /棕色短发/); checks++;
assert.match(person('阿雪').nl, /狐裘/); checks++;
// Persona：金发碧眼为准
assert.match(person('阿竹').nl, /金发碧眼/); checks++;
assert.doesNotMatch(person('阿竹').nl, /红色长发|蓝眼睛|\{\{/); checks++;
assert.match(person('阿竹').nl, /绿裙/); checks++;
assert.deepEqual(r.sources, { 阿岩: '建档', 阿雪: '人设', 阿竹: '人设' }); checks++;

// 色表外的颜色（auburn／hazel、亚麻色／茶色）也算发色瞳色：模型写的黑发金瞳照样去掉，不两种发色一起发
await page.evaluate(() => { window.STBaiBaiImage.getCharacters = () => ({ characters: [{ name: '阿岩', tag: '1boy, auburn hair, hazel eyes', nl: '' }, { name: '阿松', tag: '', nl: '亚麻色的长发，茶色眼睛' }] }); });
const c = await draw(`<p data-rm-draw-char="阿岩" hidden>黑发青年</p><p data-rm-draw-char-tags="阿岩" hidden>1boy, black hair, golden eyes, dark robe</p><p data-rm-draw-char="阿松" hidden>黑色短发的少女，蓝眼睛，穿白裙</p>`);
const who = name => (c.request.characters || []).find(item => item.name === name) || {};
assert.match(who('阿岩').tag, /auburn hair, hazel eyes/); checks++;
assert.doesNotMatch(who('阿岩').tag, /black hair|golden eyes/); checks++;
assert.match(who('阿松').nl, /亚麻色的长发，茶色眼睛/); checks++;
assert.doesNotMatch(who('阿松').nl, /黑色短发|蓝眼睛/); checks++;
assert.match(who('阿松').nl, /白裙/); checks++;

// 模型给名字加了后缀、同一个人写了两条：按建档认出是同一个人，只发一条
const d = await draw(`<p data-rm-draw-char="阿岩（青年）" hidden>穿玄色劲装</p><p data-rm-draw-char="阿岩（青年）" hidden>又写了一遍</p>`);
assert.equal((d.request.characters || []).filter(item => /阿岩/.test(item.name)).length, 1, '不重复'); checks++;
assert.match((d.request.characters || [])[0].tag, /auburn hair/); checks++;

// 角色卡第一处写长相的句子是在讲别人（关系栏）：接着往后找，这个人自己的长相照样摘到
await page.evaluate(() => {
    const card = '{{char}}是山门的大师姐。\n【关系】阿竹：{{char}}的师妹，红色长发。\n【外貌】{{char}}：黑色长直发，绿色眼睛。';
    const ctx = window.SillyTavern.getContext();
    ctx.characters = [{ name: '阿雪', description: card, data: { description: card, extensions: {} } }];
});
const e = await draw(`<p data-rm-draw-char="阿雪" hidden>棕色短发的少女</p>`);
assert.match((e.request.characters || [])[0].nl, /黑色长直发/); checks++;
assert.doesNotMatch((e.request.characters || [])[0].nl, /红色长发|棕色短发/); checks++;

// 档里写了常穿的衣服（A），这一面写了这一幕换的衣服（B）：档里的衣着不再发，只留长相；这一面没写衣着时照用档里的
await page.evaluate(() => { window.STBaiBaiImage.getCharacters = () => ({ characters: [{ name: '阿岩', tag: '1boy, auburn hair, hazel eyes, white robe, boots', nl: '赤褐色头发，榛色眼睛，穿白色长袍' }] }); });
const f = await draw(`<p data-rm-draw-char="阿岩" hidden>披着黑色斗篷</p><p data-rm-draw-char-tags="阿岩" hidden>1boy, black cloak</p>`);
const f1 = (f.request.characters || [])[0] || {};
assert.match(f1.tag, /auburn hair, hazel eyes/); checks++;
assert.match(f1.tag, /black cloak/); checks++;
assert.doesNotMatch(f1.tag, /white robe|boots/, '档里的衣着不发'); checks++;
assert.match(f1.nl, /赤褐色头发/); checks++;
assert.match(f1.nl, /黑色斗篷/); checks++;
assert.doesNotMatch(f1.nl, /白色长袍/); checks++;
const g = await draw(`<p data-rm-draw-char="阿岩" hidden>神情冷峻</p><p data-rm-draw-char-tags="阿岩" hidden>1boy, serious</p>`);
assert.match(((g.request.characters || [])[0] || {}).tag, /white robe/, '这一面没写衣着：用档里的'); checks++;

// 发型也一样：档里束发（high ponytail），这一面披发：档里的发型不发，头发长短、发色照旧以档为准
await page.evaluate(() => { window.STBaiBaiImage.getCharacters = () => ({ characters: [{ name: '阿岩', tag: '1boy, long hair, auburn hair, high ponytail', nl: '赤褐色长发，高高束起马尾' }] }); });
const m = await draw(`<p data-rm-draw-char="阿岩" hidden>披着一头长发，散发着酒气</p><p data-rm-draw-char-tags="阿岩" hidden>1boy, hair down</p>`);
const m1 = (m.request.characters || [])[0] || {};
assert.match(m1.tag, /long hair/); checks++;
assert.match(m1.tag, /auburn hair/); checks++;
assert.match(m1.tag, /hair down/); checks++;
assert.doesNotMatch(m1.tag, /ponytail/, '档里的束发不发'); checks++;
assert.doesNotMatch(m1.nl, /马尾/); checks++;
assert.match(m1.nl, /赤褐色长发/); checks++;
const n = await draw(`<p data-rm-draw-char="阿岩" hidden>散发着酒气</p><p data-rm-draw-char-tags="阿岩" hidden>1boy, drunk</p>`);
assert.match(((n.request.characters || [])[0] || {}).tag, /high ponytail/, '这一面没写发型（「散发着」不是披发）：用档里的'); checks++;

// 发型和发色写在同一句（「高马尾的黑发」）：只去掉发型，发色留着；「披着一头长发」只说长短不算发型；braided belt 不算发型
await page.evaluate(() => { window.STBaiBaiImage.getCharacters = () => ({ characters: [{ name: '阿岩', tag: '1boy, black hair, ponytail, braided belt', nl: '高马尾的黑发，束起腰带' }] }); });
const q = await draw(`<p data-rm-draw-char="阿岩" hidden>头发披散</p><p data-rm-draw-char-tags="阿岩" hidden>1boy, hair down</p>`);
const q1 = (q.request.characters || [])[0] || {};
assert.match(q1.nl, /黑发/, '同一句里的发色留着'); checks++;
assert.doesNotMatch(q1.nl, /马尾/); checks++;
assert.match(q1.nl, /腰带/, '束起腰带不是发型'); checks++;
assert.match(q1.tag, /braided belt/); checks++;
assert.doesNotMatch(q1.tag, /ponytail/); checks++;
await page.evaluate(() => { window.STBaiBaiImage.getCharacters = () => ({ characters: [{ name: '阿岩', tag: '1boy, white dress', nl: '白裙配碧眼，高马尾的长发' }] }); });
const w = await draw(`<p data-rm-draw-char="阿岩" hidden>换了黑色劲装，头发散乱</p><p data-rm-draw-char-tags="阿岩" hidden>1boy, black clothes</p>`);
const w1 = ((w.request.characters || [])[0] || {}).nl || '';
assert.match(w1, /碧眼/, '衣着那一句里的瞳色留着'); checks++;
assert.match(w1, /长发/, '发型那一句里的长短留着'); checks++;
assert.doesNotMatch(w1, /白裙|马尾/); checks++;
await page.evaluate(() => { window.STBaiBaiImage.getCharacters = () => ({ characters: [{ name: '阿岩', tag: '1boy, black hair, ponytail', nl: '黑发，高马尾' }] }); });
const v = await draw(`<p data-rm-draw-char="阿岩" hidden>挽着他出发，扎发带</p><p data-rm-draw-char-tags="阿岩" hidden>1boy, walking</p>`);
assert.match(((v.request.characters || [])[0] || {}).nl || '', /马尾/, '挽着他出发、扎发带不算写了发型'); checks++;
await page.evaluate(() => { window.STBaiBaiImage.getCharacters = () => ({ characters: [{ name: '阿岩', tag: '1boy, black hair, ponytail, braided belt', nl: '高马尾的黑发，束起腰带' }] }); });
const u = await draw(`<p data-rm-draw-char="阿岩" hidden>披着一头长发，浑身散发冷意</p><p data-rm-draw-char-tags="阿岩" hidden>1boy, cold</p>`);
assert.match(((u.request.characters || [])[0] || {}).tag, /ponytail/, '只写了长短、散发冷意：不算写了发型'); checks++;
await page.evaluate(() => { window.STBaiBaiImage.getCharacters = () => ({ characters: [{ name: '阿岩', tag: '1boy, auburn hair, hazel eyes, white robe, boots', nl: '赤褐色头发，榛色眼睛，穿白色长袍' }] }); });

// 千千结的人物档案：排在角色卡之后、世界书之前；按名字或别名认人
await page.evaluate(() => {
    window.STBaiBaiImage.getCharacters = () => ({ characters: [] });
    globalThis.qqj_v3_public_bridge_v1 = { getPeopleSnapshot: () => ({ status: 'ready', people: { status: 'ready', items: [
        { entityId: 'e1', displayName: '阿松', aliases: ['松儿'], profile: { name: '阿松', hair: '灰色短发', eyes: '琥珀色眼睛', clothingStyle: '常穿蓝布衫' } },
        { entityId: 'e2', displayName: '阿雪', aliases: [], profile: { name: '阿雪', hair: '紫色长发' } },
    ] } }) };
});
const mk = await draw(`<p data-rm-draw-char="松儿" hidden>黑发少年，披着斗篷</p><p data-rm-draw-char="阿雪" hidden>棕色短发的少女</p>`);
const mkp = name => (mk.request.characters || []).find(item => item.name === name) || {};
assert.match(mkp('松儿').nl, /灰色短发/, '别名认人'); checks++;
assert.doesNotMatch(mkp('松儿').nl, /黑发|蓝布衫/, '模型写的发色去掉；写了衣着，档里的衣着不发'); checks++;
assert.match(mkp('松儿').nl, /斗篷/); checks++;
assert.match(mkp('阿雪').nl, /黑色长直发/, '角色卡排在千千结前面'); checks++;
assert.doesNotMatch(mkp('阿雪').nl, /紫色长发/); checks++;
assert.equal(mk.sources?.['松儿'], '千千结'); checks++;
await page.evaluate(async () => { const ext = await import('/extensions.js'); Object.assign(ext.extension_settings.rabbit_mirror_theater, { imageLooksMyriad: false }); });
const mk2 = await draw(`<p data-rm-draw-char="松儿" hidden>黑发少年</p>`);
assert.doesNotMatch(JSON.stringify(mk2.request.characters || []), /灰色短发/, '勾掉千千结就不用'); checks++;
await page.evaluate(async () => { const ext = await import('/extensions.js'); Object.assign(ext.extension_settings.rabbit_mirror_theater, { imageLooksMyriad: true }); delete globalThis.qqj_v3_public_bridge_v1;
    window.STBaiBaiImage.getCharacters = () => ({ characters: [{ name: '阿岩', tag: '1boy, auburn hair, hazel eyes, white robe, boots', nl: '赤褐色头发，榛色眼睛，穿白色长袍' }] }); });

// 设置里勾掉外貌来源：不用建档、不用兔子镜写的
await page.evaluate(async query => { const ext = await import('/extensions.js'); Object.assign(ext.extension_settings.rabbit_mirror_theater, { imageLooksLibrary: false }); }, query);
const h = await draw(`<p data-rm-draw-char="阿岩" hidden>披着黑色斗篷</p><p data-rm-draw-char-tags="阿岩" hidden>1boy, black cloak</p>`);
assert.doesNotMatch(JSON.stringify(h.request.characters || []), /auburn hair|赤褐色/, '建档勾掉了就不用'); checks++;
assert.match(JSON.stringify(h.request.characters || []), /black cloak/); checks++;
await page.evaluate(async () => { const ext = await import('/extensions.js'); Object.assign(ext.extension_settings.rabbit_mirror_theater, { imageLooksLibrary: true, imageLooksModel: false }); });
const k = await draw(`<p data-rm-draw-char="阿岩" hidden>披着黑色斗篷</p><p data-rm-draw-char-tags="阿岩" hidden>1boy, black cloak</p>`);
assert.doesNotMatch(JSON.stringify(k.request.characters || []), /black cloak|黑色斗篷/, '兔子镜写的勾掉了就不用'); checks++;
assert.match(JSON.stringify(k.request.characters || []), /auburn hair/); checks++;
await page.evaluate(async () => { const ext = await import('/extensions.js'); Object.assign(ext.extension_settings.rabbit_mirror_theater, { imageLooksModel: true }); });

assert.deepEqual(pageErrors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
