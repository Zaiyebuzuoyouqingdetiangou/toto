// 兔子亮了点开想看更新公告，结果直接更新、刷新了。
// ① 「确认更新」要等更新公告显示出来、再过一小会儿才能点：点「有更新」那一下不会落到它身上。
// ② 酒馆里的文件已经是新版时，不再自己刷新页面，只提示「点这里刷新」。
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const BASE = '/scripts/extensions/third-party/toto';
let localVersion = null;
const server = createServer(async (req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset=utf-8><body><div id="row"></div>'); }
    if (p.startsWith(BASE + '/')) {
        const rel = p.slice(BASE.length + 1);
        if (rel === 'manifest.json' && localVersion) { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ version: localVersion })); }
        res.setHeader('Content-Type', rel.endsWith('.json') ? 'application/json' : rel.endsWith('.md') ? 'text/plain' : 'text/javascript');
        try { return res.end(await readFile(path.join(root, rel))); } catch { res.statusCode = 404; return res.end(); }
    }
    if (p === '/script.js' || p === '/scripts/extensions.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end('export const extension_settings={}; export function saveSettingsDebounced(){}; export function getRequestHeaders(){ return {}; }'); }
    res.statusCode = 404; res.end();
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.route('https://**/*', route => {
    const url = route.request().url();
    if (url.endsWith('manifest.json') || url.includes('manifest.json?')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ version: '9.9.9' }) });
    if (url.includes('README.md')) return route.fulfill({ status: 200, contentType: 'text/plain', body: '# 兔子镜\n\n## 9.9.9 测试版\n\n- 这一版的更新内容\n' });
    return route.fulfill({ status: 404, body: '' });
});
await page.goto(origin);
let checks = 0;
await page.evaluate(async base => {
    window.__rabbitMirrorRuntimeVersion = '1.70.2';
    window.updates = 0; window.reloads = 0; window.toasts = [];
    window.updateExtension = async () => { window.updates++; return { ok: true }; };
    window.triggerSlash = cmd => { if (cmd === '/reload-page') window.reloads++; };
    window.toastr = { info: (msg, title, opts) => window.toasts.push({ msg, opts }), success() {}, warning() {}, error() {} };
    window.menu = await import(`${base}/src/mirrorUpdateMenu.js`);
    window.updater = await import(`${base}/src/extensionUpdater.js`);
    window.menu.mountSettingsUpdateChrome(document.getElementById('row'));
}, BASE);
await page.waitForFunction(() => document.querySelector('[data-rm-settings-update]')?.dataset.rmSettingsMode === 'update');
// 点「有更新」，紧接着同一处又点了一下（手机上那一下落到弹出来的按钮上）。
await page.evaluate(() => { document.querySelector('[data-rm-settings-update]').click(); document.querySelector('[data-rm-update-sheet-apply]')?.click(); });
await page.waitForTimeout(150);
assert.equal(await page.evaluate(() => window.updates), 0, 'no update before the changelog is shown'); checks++;
await page.waitForFunction(() => /这一版的更新内容/.test(document.querySelector('[data-rm-update-sheet-body]')?.textContent || ''));
assert.ok(true, 'changelog shown'); checks++;
await page.evaluate(() => document.querySelector('[data-rm-update-sheet-apply]').click());
await page.waitForTimeout(100);
assert.equal(await page.evaluate(() => window.updates), 0, 'a tap right as the changelog appears is ignored'); checks++;
await page.waitForTimeout(700);
await page.evaluate(() => document.querySelector('[data-rm-update-sheet-apply]').click());
await page.waitForFunction(() => window.updates === 1);
await page.waitForTimeout(1000);
assert.equal(await page.evaluate(() => window.reloads), 1, 'after confirming, update and refresh as before'); checks++;
// 酒馆里的文件已经是新版（别的设备更新过）：不自己刷新，只提示。
localVersion = '9.9.9';
await page.evaluate(() => { window.reloads = 0; window.toasts = []; sessionStorage.clear(); });
const bumped = await page.evaluate(() => window.updater.checkRabbitMirrorManifestBump());
assert.equal(bumped, true); checks++;
await page.waitForTimeout(1000);
assert.equal(await page.evaluate(() => window.reloads), 0, 'no automatic refresh'); checks++;
const toast = await page.evaluate(() => window.toasts.map(t => ({ msg: t.msg, sticky: t.opts?.timeOut === 0, click: typeof t.opts?.onclick === 'function' })));
assert.equal(toast.length, 1); checks++;
assert.match(toast[0].msg, /已经更新到 9\.9\.9.*点这里刷新/); checks++;
assert.ok(toast[0].sticky && toast[0].click); checks++;
await page.evaluate(() => window.toasts[0].opts.onclick());
await page.waitForTimeout(100);
assert.equal(await page.evaluate(() => window.reloads), 1, 'tapping the notice refreshes'); checks++;
assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
