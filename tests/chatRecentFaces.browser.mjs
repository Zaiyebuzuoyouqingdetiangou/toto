// 聊天里保存的兔子镜在本机现场扫成避重记录：颜色、形式编号来自这一面，原文不进记录。
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
    const p = new URL(req.url, 'http://x').pathname;
    res.setHeader('Content-Type', 'text/javascript');
    if (p === '/extensions.js') return res.end('export const extension_settings = {}; export const getContext = () => window.SillyTavern.getContext(); export const renderExtensionTemplateAsync = async () => "";');
    if (p === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){},emit(){}}; export const event_types = {}; export const getRequestHeaders = () => ({}); export const saveChatConditional = async () => {}; export const chat = []; export const chat_metadata = {};');
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    try { res.end(await readFile(path.join(rootDir, decodeURIComponent(p)))); } catch { res.statusCode = 404; res.end(''); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin);
    const q = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
    const result = await page.evaluate(async q => {
        const face = (bg, title) => `<details open><summary style="background:${bg};color:#eee">【兔子镜：${title}】</summary><div style="background:${bg};color:#f2e6d0;padding:16px;min-height:200px"><p>${'某城的夜色'.repeat(30)}</p><button type="button">翻页</button></div></details>`;
        const chatMetadata = { rabbit_mirror_independent_outputs_v2: { owners: {
            '4:0': { html: face('#2C2119', '旧书页'), ts: 1_800_000_000_000, apiRequest: { themeIds: [], formatIds: ['5.2.3.1'], presentationMode: 'html' } },
            '6:0': { html: face('#1F3A5C', '夜航图'), ts: 1_800_000_100_000, apiRequest: { themeIds: [], formatIds: ['1.14'], presentationMode: 'html' } },
            '8:0': { deleted: true, ts: 1_800_000_200_000 },
        } } };
        const chat = [{ is_user: true, mes: '去某城' }, { is_user: false, send_date: '2028-01-15T08:00:00Z', mes: `正文。<toto data-rabbit-mirror="true">${face('#5C1F3A', '跟随面')}</toto>` }];
        window.SillyTavern = { getContext: () => ({ chatMetadata, chat, chatId: 'chat-a', getCurrentChatId: () => 'chat-a' }) };
        localStorage.clear();
        localStorage.setItem('rabbit_mirror_theater:last_combo:v11', JSON.stringify([{ ts: 1000, formatIds: ['6.3.4'], themeIds: ['G.6.2'], paletteFingerprint: { mainColors: ['#F8EFF1'] } }]));
        await import('/src/independentApi/request.js?' + q);
        const storage = await import('/src/storage.js?' + q);
        const recent = storage.getRecentDiversityHistory(4);
        return recent.map(item => ({ formats: item.formatIds, colors: item.paletteFingerprint?.mainColors || [], fromChat: !!item.fromChat, hasHtml: JSON.stringify(item).includes('某城的夜色') }));
    }, q);
    assert.equal(result.length, 4);
    assert.deepEqual(result.map(item => item.formats[0]), ['6.3.4', '5.2.3.1', '1.14', undefined]);
    assert.ok(result[3].fromChat && result[3].colors.some(color => /^#5C1F3A$/i.test(color)), '跟随正文的面也扫到：' + JSON.stringify(result[3]));
    assert.ok(result[1].fromChat && result[2].fromChat);
    assert.ok(result[1].colors.length && result[2].colors.length, '聊天里的面扫出了主色');
    assert.ok(result[1].colors.some(color => /^#2C2119$/i.test(color)), JSON.stringify(result[1].colors));
    assert.ok(result.every(item => !item.hasHtml), '记录里没有兔子镜原文');
    assert.deepEqual(errors, []);
    console.log('chatRecentFaces browser: ok');
} finally { await browser?.close(); server.close(); }
