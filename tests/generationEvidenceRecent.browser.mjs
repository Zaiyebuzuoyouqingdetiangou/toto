// 生成取证平时自动保留最近 3 次（不用事先点「记录下一次」），手动钉住的那份不被顶掉；挂载层能按消息号补记挂没挂上。
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
    if (pathname === '/extensions.js') return res.end('const ctx = { chat: [], chatId: "c", getCurrentChatId: () => "c", characterId: 0, characters: [{ name: "测试" }], name2: "测试" }; export const extension_settings = { rabbit_mirror_theater: {} }; export const getContext = () => ctx; export const renderExtensionTemplateAsync = async () => ""; export const extension_prompt_types = {};');
    if (pathname === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){},emit(){}}; export const event_types = {}; export const getRequestHeaders = () => ({}); export const saveChatConditional = async () => {}; export const chat_metadata = {}; export const this_chid = 0; export const characters = []; export const substituteParams = s => s; export const main_api = ""; export const name1 = ""; export const name2 = "";');
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
const result = await page.evaluate(async query => {
    const ev = await import('/src/generationEvidence.js?' + query);
    const run = (mesid, ok = true) => {
        const h = ev.claimGenerationEvidence({ version: 'x', profile: 'p', owner: { mesid }, settings: {} });
        h.request({ a: 1 }); h.response({ text: '<toto>字</toto>', streamed: true });
        h.processed('<details><summary>字</summary>字</details>');
        ok ? h.finish({ phase: 'ready-to-mount' }) : h.fail('postprocess', { code: 'X' });
        return h;
    };
    const out = {};
    out.autoWithoutArm = !!run(1);
    out.state1 = ev.getGenerationEvidenceState().recentCount;
    run(2); run(3); run(4);
    const recent = JSON.parse(ev.exportRecentGenerationEvidence());
    out.recentMesids = recent.reports.map(r => r.context.owner.mesid);
    out.noted = ev.noteGenerationEvidenceMount(4, { outcome: 'not-mounted', reason: 'stale-owner' });
    out.latestMount = JSON.parse(ev.exportGenerationEvidence()).mount?.reason;
    // 手动钉住的那份不会被后面的自动记录顶掉
    ev.armGenerationEvidence(); run(10);
    run(11); run(12); run(13);
    out.pinnedShown = JSON.parse(ev.exportGenerationEvidence()).context.owner.mesid;
    out.pinnedKept = JSON.parse(ev.exportRecentGenerationEvidence()).reports.map(r => r.context.owner.mesid);
    ev.clearGenerationEvidence();
    out.cleared = ev.getGenerationEvidenceState().hasReport;
    return out;
}, query);
await browser.close(); server.close();
assert.deepEqual(pageErrors, []);
assert.equal(result.autoWithoutArm, true);
assert.equal(result.state1, 1);
assert.deepEqual(result.recentMesids, [4, 3, 2]);
assert.equal(result.noted, true);
assert.equal(result.latestMount, 'stale-owner');
assert.equal(result.pinnedShown, 10);
assert.deepEqual(result.pinnedKept, [13, 12, 10]);
assert.equal(result.cleared, false);
console.log('generationEvidenceRecent ok');
