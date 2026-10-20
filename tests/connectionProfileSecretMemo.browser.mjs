// 酒馆连接配置没存 Secret：在它被切到时记下当时用的 key 编号，之后按它发请求带上，正文换了配置也不会拿错 key。
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
    if (pathname === '/extensions.js') return res.end('export const extension_settings = {}; export const getContext = () => globalThis.__ctx || ({ chat: [], chatId: "t" }); export const renderExtensionTemplateAsync = async () => "";');
    if (pathname === '/secrets.js') return res.end('export const SECRET_KEYS = { CUSTOM: "api_key_custom" }; export const secret_state = globalThis.__secrets || {};');
    if (pathname === '/openai.js') return res.end('export const chat_completion_sources = { CUSTOM: "custom" }; export const proxies = [];');
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
    const handlers = {};
    globalThis.__secrets = { api_key_custom: [{ id: 'key-a', active: false }, { id: 'key-b', active: true }] };
    let active = 'key-a';
    globalThis.SillyTavern = { getContext: () => globalThis.__ctx };
    globalThis.__ctx = {
        chat: [], chatId: 't',
        extensionSettings: { connectionManager: { selectedProfile: 'A', profiles: [
            { id: 'A', name: 'A', mode: 'cc', api: 'custom', 'api-url': 'https://a.example/v1', model: 'm' },
            { id: 'B', name: 'B', mode: 'cc', api: 'custom', 'api-url': 'https://b.example/v1', model: 'n', 'secret-id': 'key-b' },
        ] } },
        SlashCommandParser: { commands: { 'secret-id': { callback: async () => active } } },
        eventSource: { on(name, fn) { (handlers[name] ||= []).push(fn); } },
        eventTypes: { CONNECTION_PROFILE_LOADED: 'cpl', SECRET_ROTATED: 'sr' },
        ConnectionManagerRequestService: {
            validateProfile: () => ({ selected: 'openai', source: 'custom' }),
            sendRequest(profile, overridePayload) { return { secret_id: profile['secret-id'], model: profile.model, ...overridePayload }; },
            getSupportedProfiles: () => [],
        },
    };
    window.fire = async (name, profile, key) => { if (profile) globalThis.__ctx.extensionSettings.connectionManager.selectedProfile = profile; if (key) active = key; for (const fn of handlers[name] || []) fn(); await new Promise(r => setTimeout(r, 450)); };
    window.conn = await import('/src/independentApi/connection.js?' + query);
}, query);
let checks = 0;
// 正文用着 A（A 没存 Secret，当前 key 是 key-a）：记下 A→key-a
assert.equal(await page.evaluate(() => conn.rememberActiveConnectionProfileSecret()), 'key-a'); checks++;
assert.equal(await page.evaluate(() => conn.connectionProfileSecretState('A')), 'remembered'); checks++;
assert.equal(await page.evaluate(() => conn.connectionProfileSecretState('B')), 'saved'); checks++;
// 正文切到 B（key-b）：A 记下的不变
await page.evaluate(() => { conn.installConnectionProfileSecretWatch(); });
await page.evaluate(() => fire('cpl', 'B', 'key-b'));
const runtime = await page.evaluate(async () => { const r = await conn.validatedIndependentConnectionProfile('A'); return r.fallbackSecretId; });
assert.equal(runtime, 'key-a'); checks++;
// 记下的 key 已经删掉了：不用
await page.evaluate(() => { globalThis.__secrets.api_key_custom = [{ id: 'key-b', active: true }]; });
assert.equal(await page.evaluate(async () => (await conn.validatedIndependentConnectionProfile('A')).fallbackSecretId), ''); checks++;
// 存了 Secret 的配置不记、不覆盖
assert.equal(await page.evaluate(async () => (await conn.validatedIndependentConnectionProfile('B')).fallbackSecretId), ''); checks++;
assert.equal(await page.evaluate(() => conn.connectionProfileSecretState('C')), ''); checks++;

assert.deepEqual(pageErrors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
