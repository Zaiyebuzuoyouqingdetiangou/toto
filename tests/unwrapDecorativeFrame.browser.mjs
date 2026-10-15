// 本地浏览器测试：本体外那层垫底面板（有底色＋内边距、里面只装着本体）要被去掉；
// 本体隔着一层透明包装（限宽居中的 div）时也要认出来；信纸、并排卡片、动态场景不能误伤。
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const source = await readFile(new URL('../src/outputSanitizer/toolsChrome.js', import.meta.url), 'utf8');
const code = source.slice(source.indexOf('const FRAME_UNWRAPPED_ATTR'), source.indexOf('// 本体里 position:absolute; inset:0'));
assert.ok(code.includes('function unwrapDecorativeFrame'), 'frame unwrapping code found');
const panel = inner => `<details open><summary>标题</summary><div style="background:linear-gradient(#f9f1f4,#f4e8ee);padding:20px 16px;box-shadow:0 6px 18px #0002">${inner}</div></details>`;
const cases = {
    transparentWrapper: [true, panel('<style>.w{max-width:440px;margin:0 auto}</style><div class="w"><input type="checkbox" style="display:none"><div style="background:#ead7e1;border:2px solid #d6bac9;height:300px">匣子</div><div>翻找痕迹 · 重合匣盖</div></div>')],
    directBody: [true, panel('<div style="background:#fff;height:200px">本体</div>')],
    letterPaper: [false, panel('<p>第一段信</p><p>第二段信</p>')],
    paperWithText: [false, panel(`<div><p>信的抬头</p><p>${'很长的正文'.repeat(60)}</p></div>`)],
    twoCards: [false, panel('<div><div style="background:#fff;height:120px">卡一</div><div style="background:#fff;height:120px">卡二</div></div>')],
    // 本体自己的外壳：手机黑边框、木相框里隔着透明包装是屏幕、画——外壳和里面差得远，不能去。
    phoneMockup: [false, '<details open><summary>标题</summary><div style="background:#111;padding:14px;border-radius:36px"><div style="max-width:300px;margin:auto"><div style="background:#fff;height:400px;border-radius:24px">屏幕</div></div></div></details>'],
    pictureFrame: [false, '<details open><summary>标题</summary><div style="background:linear-gradient(#7a4a2a,#5a3418);padding:18px"><div style="max-width:320px;margin:auto"><div style="background:#f3ead8;height:240px">画</div></div></div></details>'],
    // 深色底上的玻璃卡：卡片是半透明的，靠外面的深底才看得清字。
    glassOnDark: [false, '<details open><summary>标题</summary><div style="background:#1b1d2b;padding:18px;color:#fff"><div><div style="background:rgba(255,255,255,.06);height:240px;border:1px solid rgba(255,255,255,.2)">玻璃卡</div></div></div></details>'],
    glassDirect: [false, '<details open><summary>标题</summary><div style="background:#1b1d2b;padding:18px;color:#fff"><div style="background:rgba(255,255,255,.06);height:240px">玻璃卡</div></div></details>'],
    scenery: [false, '<details open><summary>标题</summary><div data-rm-visual-scenery="true" style="background:#fde;padding:20px"><div style="background:#fff;height:200px">景</div></div></details>'],
};
const html = '<!doctype html><meta charset="utf-8"><body>' + Object.entries(cases).map(([id, [, face]]) => `<section id="${id}">${face}</section>`).join('')
    + `<script>${code};window.run=()=>Object.fromEntries([...document.querySelectorAll('section')].map(s=>{unwrapDecorativeFrame(s);return [s.id,!!s.querySelector('[data-rm-unwrapped-frame]')];}));</script>`;
const browser = await chromium.launch();
try {
    for (const width of [375, 1280]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        await page.setContent(html);
        const result = await page.evaluate(() => window.run());
        for (const [id, [expected]] of Object.entries(cases)) assert.equal(result[id], expected, `${width}px ${id}`);
        const panelStyle = await page.evaluate(() => { const el = document.querySelector('#transparentWrapper details > div'); const s = getComputedStyle(el); return [s.backgroundImage, s.paddingTop, s.boxShadow]; });
        assert.deepEqual(panelStyle, ['none', '0px', 'none']);
        // 收着的一面：量不出高度，先不动；打开后再看一次就去掉。
        const collapsed = await page.evaluate(() => {
            const holder = document.createElement('section');
            holder.innerHTML = document.querySelector('#transparentWrapper').innerHTML.replace(/<details open(="")?/, '<details');
            document.body.append(holder);
            const details = holder.querySelector('details');
            details.querySelector('[data-rm-unwrapped-frame]')?.removeAttribute('data-rm-unwrapped-frame');
            details.querySelector(':scope > div').setAttribute('style', 'background:linear-gradient(#f9f1f4,#f4e8ee);padding:20px 16px');
            unwrapDecorativeFrame(holder);
            const before = !!holder.querySelector('[data-rm-unwrapped-frame]');
            details.open = true;
            return new Promise(resolve => setTimeout(() => resolve([before, !!holder.querySelector('[data-rm-unwrapped-frame]')]), 50));
        });
        // Chromium 收着时也量得出高度，会直接去掉；老的 iPhone 浏览器量不出时，靠打开后再看一次。两种都要最后去掉。
        assert.equal(collapsed[1], true);
        assert.deepEqual(errors, []);
        await page.close();
    }
    console.log(JSON.stringify({ cases: Object.keys(cases).length, widths: [375, 1280] }));
} finally { await browser.close(); }
