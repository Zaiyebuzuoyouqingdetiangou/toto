// 三种「样式写了状态、没人去切」的写法：点卡片本身切换（透明的下层显出来）；一排可点的圆点或一根滑杆切一组互斥卡片；
// 动画状态（骰子 .rolling）配一个按钮，按一下动一会儿。走真实的挂工具流程。
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
    if (p === '/extensions.js') return res.end('export const extension_settings = {}; export const getContext = () => ({});');
    if (p === '/script.js') return res.end('export const saveSettingsDebounced = () => {}; export const setExtensionPrompt = () => {}; export const extension_prompt_types = {}; export const extension_prompt_roles = {}; export const eventSource = {on(){},removeListener(){}}; export const event_types = {};');
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    try { res.end(await readFile(path.join(rootDir, decodeURIComponent(p)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 440, height: 900 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin);
    const query = JSON.parse(await readFile(path.join(rootDir, 'manifest.json'), 'utf8')).js.split('?')[1];
    await page.evaluate(async q => {
        window.san = await import('/src/outputSanitizer.js?' + q);
        window.tc = await import('/src/outputSanitizer/toolsChrome.js?' + q);
        const rt = await import('/src/ui/runtime.js?' + q);
        window.__rabbitMirrorRuntimeVersion = rt.RUNTIME_VERSION;
        window.mount = async html => {
            document.body.innerHTML = `<div id="chat"><div class="mes" mesid="1"><div class="mes_text"><details open data-rabbit-mirror-css-scope="rmcss-t1"><summary>t</summary>${html}<p>${'字'.repeat(80)}</p></details></div></div></div>`;
            const d = document.querySelector('details');
            san.isolateRabbitMirrorInteractionIds(d);
            tc.installMaintenanceRabbitsInScope(document.querySelector('#chat'));
            await new Promise(r => setTimeout(r, 300));
            return d;
        };
        window.wait = ms => new Promise(r => setTimeout(r, ms));
    }, query);
    const out = await page.evaluate(async () => {
        const r = {};
        const by = (d, text) => [...d.querySelectorAll('*')].find(n => n.textContent === text);
        // 1. 点纸本身：下层「真字」从透明变出来，再点还原
        let d = await mount(`<style>.paper{cursor:pointer;position:relative}.under{position:absolute;inset:0;opacity:0;transition:opacity .8s}.paper.burned .under{opacity:1}</style><div class="paper"><div class="top">阿雪的表层字</div><div class="under">阿岩的真字</div></div>`);
        const paper = d.querySelector('.paper');
        const under = by(d, '阿岩的真字');
        r.startOpacity = getComputedStyle(under).opacity;
        paper.click(); r.once = paper.classList.contains('burned');
        paper.click(); r.twice = paper.classList.contains('burned');
        // 2. 一排圆点（不是按钮）配一组互斥卡片，外加一根滑杆
        d = await mount(`<style>.dot{cursor:pointer;display:inline-block;width:20px;height:20px}.card{display:none}.card.active{display:block}</style>
            <div class="row"><div class="dot">一</div><div class="dot">二</div><div class="dot">三</div><div class="dot">四</div></div>
            <div class="card active">阿雪</div><div class="card">阿岩</div><div class="card">阿竹</div><div class="card">阿松</div>
            <input type="range" min="0" max="360" value="0">`);
        const shown = () => [...d.querySelectorAll('.card')].map(c => getComputedStyle(c).display !== 'none' ? 1 : 0).join('');
        r.groupStart = shown();
        d.querySelectorAll('.dot')[2].click(); r.afterDot3 = shown();
        const range = d.querySelector('input[type=range]');
        range.value = 200; range.dispatchEvent(new Event('input', { bubbles: true })); r.slider200 = shown();
        range.value = 360; range.dispatchEvent(new Event('input', { bubbles: true })); r.slider360 = shown();
        // 3. 骰子 .rolling 有动画：按钮按一下动一会儿，然后停
        d = await mount(`<style>@keyframes shake{from{transform:rotate(0)}to{transform:rotate(8deg)}}.cube{width:40px;height:40px}.cube.rolling{animation:shake .4s infinite}</style>
            <div class="stage"><div class="cube">甲</div><div class="cube">乙</div><button class="go">掷骰</button></div>`);
        d.querySelector('.go').click();
        r.rollingNow = [...d.querySelectorAll('.cube')].every(c => c.classList.contains('rolling'));
        await wait(1100);
        r.rollingLater = [...d.querySelectorAll('.cube')].some(c => c.classList.contains('rolling'));
        // 反例：圆点和卡片数目对不上不接；两个按钮不猜
        d = await mount(`<style>.dot{cursor:pointer;display:inline-block;width:20px;height:20px}.card{display:none}.card.active{display:block}</style>
            <div class="dot">一</div><div class="dot">二</div><div class="dot">三</div>
            <div class="card active">阿雪</div><div class="card">阿岩</div><div class="card">阿竹</div><div class="card">阿松</div>`);
        d.querySelectorAll('.dot')[2].click();
        r.mismatch = [...d.querySelectorAll('.card')].map(c => getComputedStyle(c).display !== 'none' ? 1 : 0).join('');
        d = await mount(`<style>.cube.rolling{animation:shake .4s infinite}</style><div class="stage"><div class="cube">甲</div><button>一</button><button>二</button></div>`);
        d.querySelectorAll('button')[0].click();
        r.twoButtons = d.querySelector('.cube').classList.contains('rolling');
        // 克隆后滑杆照样接回
        d = await mount(`<style>.card{display:none}.card.active{display:block}</style><div class="card active">阿雪</div><div class="card">阿岩</div><div class="card">阿竹</div><div class="card">阿松</div><input type="range" min="0" max="360" value="0">`);
        const copy = d.cloneNode(true); d.replaceWith(copy); tc.wireOrphanStateClasses(copy);
        const cr = copy.querySelector('input[type=range]'); cr.value = 300; cr.dispatchEvent(new Event('input', { bubbles: true }));
        r.cloneAttrs = [...cr.attributes].map(a => a.name).join(','); r.clone = [...copy.querySelectorAll('.card')].map(c => getComputedStyle(c).display !== 'none' ? 1 : 0).join('');
        // 圆点里有带类名的子元素、圆点自己也带 active（轮播）
        d = await mount(`<style>.dot{cursor:pointer;display:inline-block}.dot.active{color:red}.s{display:none}.s.active{display:block}</style><div class="dot active"><span class="n">1</span></div><div class="dot"><span class="n">2</span></div><div class="dot"><span class="n">3</span></div><div class="s active">阿雪</div><div class="s">阿岩</div><div class="s">阿竹</div>`);
        d.querySelectorAll('.dot')[1].click();
        r.carousel = [...d.querySelectorAll('.s')].map(c => getComputedStyle(c).display !== 'none' ? 1 : 0).join('') + [...d.querySelectorAll('.dot')].map(c => c.classList.contains('active') ? 1 : 0).join('');
        // label 里的音量滑杆不拿来分段；「下一步」按钮不拿来晃
        d = await mount(`<style>.note{display:none}.note.show{display:block}.cube.rolling{animation:shake .4s infinite}</style><label>音量<input type="range"></label><div class="note show">甲</div><div class="note">乙</div><div class="note">丙</div><div class="stage"><div class="cube">甲</div><button>下一步</button></div>`);
        const vol = d.querySelector('input[type=range]'); vol.value = 90; vol.dispatchEvent(new Event('input', { bubbles: true }));
        r.volume = [...d.querySelectorAll('.note')].map(c => getComputedStyle(c).display !== 'none' ? 1 : 0).join('');
        d.querySelector('button').click(); r.nextShakes = d.querySelector('.cube').classList.contains('rolling');
        return r;
    });
    assert.equal(out.startOpacity, '0', '量的时候不留下半透明的闪烁');
    assert.equal(out.once, true);
    assert.equal(out.twice, false);
    assert.equal(out.groupStart, '1000');
    assert.equal(out.afterDot3, '0010');
    assert.equal(out.slider200, '0010');
    assert.equal(out.slider360, '0001');
    assert.equal(out.rollingNow, true);
    assert.equal(out.rollingLater, false);
    assert.equal(out.mismatch, '1000');
    assert.equal(out.twoButtons, false);
    assert.equal(out.clone, '0001', out.cloneAttrs);
    assert.equal(out.carousel, '010010');
    assert.equal(out.volume, '100');
    assert.equal(out.nextShakes, false);
    assert.deepEqual(errors, []);
    console.log('stateGroupWiring ok');
} finally {
    await browser?.close();
    server.close();
}
