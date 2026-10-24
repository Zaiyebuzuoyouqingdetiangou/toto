// 人名打码：user 名显示成小美、角色名显示成小帅；自己填的名单一起换；输入框和代码不动；关掉恢复原样；之后新出现的字也会换。
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
    if (p === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    try { res.end(await readFile(path.join(rootDir, decodeURIComponent(p)))); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin);
    const result = await page.evaluate(async () => {
        const mask = await import('/src/nameMask.js');
        document.body.innerHTML = `<div id="chat"><div class="mes"><span class="name_text">阿雪</span><p id="a">阿雪看着阿岩，阿岩儿笑了。某城下雨。</p>
            <textarea id="t">阿雪</textarea><code id="c">阿岩</code></div></div>`;
        const ctx = { name1: '阿雪', name2: '阿岩', chat: [{ is_user: true, name: '阿雪' }, { is_user: false, name: '阿岩' }, { is_user: false, name: '阿竹' }] };
        const on = mask.toggleNameMask({ ctx, extra: [{ find: '某城', replace: '某地' }, { find: '阿岩儿', replace: '' }] });
        const masked = { name: document.querySelector('.name_text').textContent, p: document.querySelector('#a').textContent,
            t: document.querySelector('#t').value, c: document.querySelector('#c').textContent };
        const late = document.createElement('p'); late.id = 'late'; late.textContent = '阿竹来了'; document.querySelector('#chat').append(late);
        await new Promise(r => setTimeout(r, 20));
        const lateMasked = document.querySelector('#late').textContent;
        // 流式接上新字：关掉时还原得回原名
        const stream = document.createElement('p'); stream.id = 's'; stream.textContent = '阿雪说'; document.querySelector('#chat').append(stream);
        await new Promise(r => setTimeout(r, 20));
        stream.firstChild.data += '：阿岩快来';
        await new Promise(r => setTimeout(r, 20));
        const streamMasked = stream.textContent;
        // 复制出来要存的那份换回原名
        const clone = document.querySelector('#a').cloneNode(true);
        mask.unmaskNameMaskClone(clone, document.querySelector('#a'));
        const cloneText = clone.textContent;
        // 名字拆在两个标签里
        const split = document.createElement('p'); split.id = 'split'; split.innerHTML = '<b>阿</b>雪和<i>阿岩</i>儿'; document.querySelector('#chat').append(split);
        await new Promise(r => setTimeout(r, 20));
        const splitMasked = split.textContent;
        const splitClone = mask.unmaskNameMaskClone(split.cloneNode(true), split).innerHTML;
        // 复制品被过滤过、和原件对不上：拆开的半个名字不进反查，空节点不会被写成「雪」
        // 1.81.1 起：对不上原件就停下并报错，不按代称猜原名。
        const filtered = split.cloneNode(true); filtered.querySelector('i').remove(); filtered.append(document.createTextNode(''));
        let filteredHtml = '';
        try { filteredHtml = mask.unmaskNameMaskClone(filtered, split).innerHTML; } catch (error) { filteredHtml = 'refused:' + String(error.message || error); }
        // 被清空的那段被宿主整体重写：当新字处理，不把旧的「雪」带回来
        const wipe = document.createElement('p'); wipe.innerHTML = '<b>阿</b>雪'; document.querySelector('#chat').append(wipe);
        await new Promise(r => setTimeout(r, 20));
        wipe.lastChild.data = '下雨了';
        await new Promise(r => setTimeout(r, 20));
        const wipeMasked = wipe.textContent;
        // 两段原文打码后一模一样：按节点对应还原，不串名
        const twin = document.createElement('div'); twin.id = 'twin'; twin.innerHTML = '<p>阿岩儿</p><p>阿岩</p>'; document.querySelector('#chat').append(twin);
        await new Promise(r => setTimeout(r, 20));
        const twinMasked = twin.textContent;
        const twinClone = mask.unmaskNameMaskClone(twin.cloneNode(true), twin).innerHTML;
        const off = mask.toggleNameMask({ ctx });
        const wipeRestored = wipe.innerHTML;
        const splitRestored = split.innerHTML, twinRestored = twin.innerHTML;
        const one = mask.buildNameMaskRules({ name1: '我', name2: 'Al', chat: [] });
        const oneText = mask.maskText('我看见 Al 和 Also。', one);
        return { filteredHtml, wipeMasked, wipeRestored, splitMasked, splitClone, twinMasked, twinClone, splitRestored, twinRestored, oneText, on, off, masked, lateMasked, streamMasked, cloneText, streamRestored: document.querySelector('#s').textContent, restored: document.querySelector('#a').textContent, lateRestored: document.querySelector('#late').textContent, active: mask.isNameMaskActive() };
    });
    assert.equal(result.on.active, true);
    assert.equal(result.masked.name, '小美');
    assert.equal(result.masked.p, '小美看着小帅，小帅笑了。某地下雨。', '长名字先换；右边留空换成小帅');
    assert.equal(result.masked.t, '阿雪', '输入框不动');
    assert.equal(result.masked.c, '阿岩', '代码不动');
    assert.equal(result.lateMasked, '小帅2来了', '后来出现的字也会换；第二个角色是小帅2');
    assert.equal(result.off.turnedOff, true);
    assert.equal(result.active, false);
    assert.equal(result.restored, '阿雪看着阿岩，阿岩儿笑了。某城下雨。');
    assert.equal(result.lateRestored, '阿竹来了');
    assert.equal(result.streamMasked, '小美说：小帅快来');
    assert.equal(result.streamRestored, '阿雪说：阿岩快来');
    assert.equal(result.cloneText, '阿雪看着阿岩，阿岩儿笑了。某城下雨。', '要存的复制品是原名');
    assert.equal(result.oneText, '我看见 小帅 和 Also。', '一个字的名字不自动换；英文名按整词换');
    assert.match(result.filteredHtml, /^refused:/, '对不上原件的复制品不猜原名，直接拒绝');
    assert.equal(result.wipeMasked, '阿下雨了', '名字被宿主改掉了：剩下的半个字不再当名字');
    assert.equal(result.wipeRestored, '<b>阿</b>下雨了');
    assert.equal(result.splitMasked, '小美和小帅', '拆在标签里的名字也换（阿岩儿是自填的一条）');
    assert.equal(result.splitClone, '<b>阿</b>雪和<i>阿岩</i>儿');
    assert.equal(result.splitRestored, '<b>阿</b>雪和<i>阿岩</i>儿');
    assert.equal(result.twinMasked, '小帅小帅', '两段原文不同、打码后都是小帅');
    assert.equal(result.twinClone, '<p>阿岩儿</p><p>阿岩</p>', '按节点还原，不串名');
    assert.equal(result.twinRestored, '<p>阿岩儿</p><p>阿岩</p>');
    assert.deepEqual(errors, []);
    console.log('nameMask browser: ok');
} finally { await browser?.close(); server.close(); }
