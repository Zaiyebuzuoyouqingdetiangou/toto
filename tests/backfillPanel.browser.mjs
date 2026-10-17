// 设置里的「一键补上」：先问一句（多少层、多少面），确定后排队一层层补，进度、暂停、继续、停止、清掉记录都在原地；
// 不是独立 API 时直接说明补不了；扫描范围里都有了就说没有要补的。用真正的设置模板。
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

const server = createServer(async (req, res) => {
    const p = new URL(req.url, 'http://x').pathname;
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset=utf-8><body><div id="host"></div>'); }
    if (p === '/extensions.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end('export const extension_settings = {};'); }
    if (p === '/script.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end('export function saveSettingsDebounced() {}'); }
    res.setHeader('Content-Type', 'text/javascript');
    try { res.end(await readFile(path.join(root, decodeURIComponent(p)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(origin);
let checks = 0;

await page.evaluate(async () => {
    const template = await import('/src/ui/settingsTemplate.js');
    document.getElementById('host').innerHTML = template.buildRabbitMirrorSettingsDialogHtml();
    window.panel = await import('/src/ui/backfillPanel.js');
    window.calls = [];
    window.releases = [];
    window.mode = { ok: true };
    window.floors = [{ index: 12, mounted: true }, { index: 4, mounted: true }, { index: 30, mounted: true }, { index: 1, mounted: false }];
    window.listedReports = 0;
    window.chat = 'chat-A';
    window.mount = () => window.panel.mountBackfillControls({
        list: () => ({ floors: window.floors, text: `还没有兔子镜：${window.floors.map(f => '#' + f.index).join('、')}` }),
        afterList: () => { window.listedReports++; },
        generate: (floor, chat, token) => new Promise(resolve => { window.calls.push([floor, chat, token]); window.releases.push(resolve); }),
        floorToken: floor => `t${floor}`,
        busy: () => false,
        chatKey: () => window.chat,
        faceCount: () => 2,
        available: () => window.mode,
    });
    window.mount();
});
const visible = sel => page.evaluate(s => { const el = document.querySelector(s); return !!el && !el.hidden && !el.closest('[hidden]'); }, sel);
const text = sel => page.evaluate(s => document.querySelector(s)?.textContent || '', sel);
const B = name => `[data-rh-backfill="${name}"]`;
// 设置窗口在测试页里没打开（看不见），按钮直接点。
const press = sel => page.evaluate(s => document.querySelector(s).click(), sel);

assert.equal(await visible(B('start')), true); checks++;
assert.equal(await visible(B('confirm')), false); checks++;
assert.equal(await visible(B('pause')), false); checks++;

// 不是独立 API：说明，不弹确认。
await page.evaluate(() => { window.mode = { ok: false, message: '一键补楼层只能在「使用独立 API」时用' }; });
await press(B('start'));
assert.equal(await visible(B('confirm')), false); checks++;
assert.match(await text(B('status')), /只能在「使用独立 API」时用/); checks++;
await page.evaluate(() => { window.mode = { ok: true }; });

// 都有了：说没有要补的。
await page.evaluate(() => { window.floors = []; });
await press(B('start'));
assert.match(await text(B('status')), /没有要补的/); checks++;
// 只有还没加载到页面上的老楼层：照样排进来，补到时先加载。
await page.evaluate(() => { window.floors = [{ index: 1, mounted: false }, { index: 2, mounted: false }]; });
await press(B('start'));
assert.equal(await visible(B('confirm')), true); checks++;
assert.match(await text(B('confirm-text')), /要给 2 层回复.*其中 2 层是更早的回复，还没加载到页面上，补到时会先在聊天里把它们加载出来/); checks++;
await press(B('cancel'));
await page.evaluate(() => { window.floors = [{ index: 12, mounted: true }, { index: 4, mounted: true }, { index: 30, mounted: true }, { index: 1, mounted: false }]; });

// 先问一句：几层、每层几面、花钱提醒。取消就什么都不发。
await press(B('start'));
assert.equal(await visible(B('confirm')), true); checks++;
assert.match(await text(B('confirm-text')), /要给 4 层回复各生成一次兔子镜（每层 2 面）.*至少 4 次独立 API 请求/); checks++;
assert.match(await text(B('confirm-text')), /其中 1 层是更早的回复，还没加载到页面上，补到时会先在聊天里把它们加载出来/, 'unloaded floors are queued too, and the user is told'); checks++;
assert.ok(await page.evaluate(() => window.listedReports) >= 1, 'scan also hangs the cards / refreshes the report'); checks++;
await press(B('cancel'));
assert.equal(await visible(B('confirm')), false); checks++;
assert.deepEqual(await page.evaluate(() => window.calls), []); checks++;

// 问完以后换了聊天再点确定：不拿旧聊天的楼层号补，要求重新数。
await press(B('start'));
await page.evaluate(() => { window.chat = 'chat-B'; });
await press(B('go'));
assert.match(await text(B('status')), /聊天换了，刚才数的楼层不算数/); checks++;
assert.deepEqual(await page.evaluate(() => window.calls), []); checks++;
await page.evaluate(() => { window.chat = 'chat-A'; });

// 确定：从最早那层开始，一层一层来，带着开始时的聊天和这一层的身份。
await press(B('start'));
await press(B('go'));
await page.waitForFunction(() => window.calls.length === 1);
assert.deepEqual(await page.evaluate(() => window.calls), [[1, 'chat-A', 't1']]); checks++;
assert.equal(await visible(B('start')), false, 'start hidden while running'); checks++;
assert.equal(await visible(B('pause')), true); checks++;
assert.equal(await visible(B('stop')), true); checks++;
assert.match(await text(B('status')), /正在补第 1\/4 层（#1）/); checks++;

// 设置界面重画（换了一份 DOM）：进度接着显示，按钮照样能用。
await page.evaluate(async () => {
    const template = await import('/src/ui/settingsTemplate.js');
    document.getElementById('host').innerHTML = template.buildRabbitMirrorSettingsDialogHtml();
    window.mount();
});
assert.match(await text(B('status')), /正在补第 1\/4 层（#1）/, 'progress survives a settings re-render'); checks++;
assert.equal(await visible(B('pause')), true); checks++;

// 暂停：这一层照常收尾，下一层不发。
await press(B('pause'));
assert.equal(await visible(B('resume')), true); checks++;
await page.evaluate(() => window.releases[0]({ status: 'done' }));
await page.waitForFunction(() => /进度 1\/4/.test(document.querySelector('[data-rh-backfill="status"]').textContent));
await page.waitForTimeout(100);
assert.equal(await page.evaluate(() => window.calls.length), 1, 'paused: next floor not sent'); checks++;

// 继续：隔一会儿发下一层（这里是真的间隔，约 3 秒）。
await press(B('resume'));
await page.waitForFunction(() => window.calls.length === 2, null, { timeout: 8000 });
assert.deepEqual(await page.evaluate(() => window.calls[1]), [4, 'chat-A', 't4']); checks++;

// 停止：这一层收尾后不再发；显示结果和「清掉这次的记录」。
await press(B('stop'));
assert.match(await text(B('status')), /正在停下/); checks++;
await page.evaluate(() => window.releases[1]({ status: 'failed', message: '429' }));
await page.waitForFunction(() => /已停止/.test(document.querySelector('[data-rh-backfill="status"]').textContent));
assert.match(await text(B('status')), /已停止：补了 2\/4 层，成功 1 层，没成 1 层：#4/); checks++;
assert.equal(await page.evaluate(() => window.calls.length), 2); checks++;
assert.equal(await visible(B('clear')), true); checks++;
assert.equal(await visible(B('start')), true); checks++;
await press(B('clear'));
assert.equal(await visible(B('status')), false); checks++;
assert.equal(await visible(B('clear')), false); checks++;

// 停用兔子镜时停下。
await press(B('start'));
await press(B('go'));
await page.waitForFunction(() => window.calls.length === 3);
await page.evaluate(() => window.panel.stopBackfill());
assert.equal(await page.evaluate(() => window.panel.backfillSnapshot().status), 'stopping'); checks++;

assert.deepEqual(errors, []);
console.log(JSON.stringify({ checks }));
await browser.close(); server.close();
