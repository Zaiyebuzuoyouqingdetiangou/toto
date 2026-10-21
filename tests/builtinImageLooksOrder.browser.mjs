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
    document.body.innerHTML = `<div data-rabbit-mirror-external-source="true" data-rm-source="independent" data-rm-owner-chat="chat:c" data-rm-owner-mesid="12" data-rm-owner-swipe="0"><details open data-rabbit-mirror-owner-chat="chat:c" data-rabbit-mirror-owner-mesid="12" data-rabbit-mirror-owner-swipe="0"><summary>一面</summary><figure data-rm-draw-frame="1"><p data-rm-draw-prompt="1" hidden>石殿里三个人围着炭盆说话，暖光。</p>${chars}</figure></details></div>`;
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

assert.deepEqual(pageErrors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
