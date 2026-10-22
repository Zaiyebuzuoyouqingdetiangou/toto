// 副 API 写出来的兔子镜里「跳过的标签」：挂上去之前拿掉；正文结构、属性、注释、svg、代码里的不碰。
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
    const pathname = new URL(req.url, 'http://localhost').pathname;
    res.setHeader('Content-Type', 'text/javascript');
    if (pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><meta charset="utf-8"><body>'); }
    const file = path.resolve(rootDir, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(rootDir + path.sep)) { res.statusCode = 403; return res.end(); }
    try { res.end(await readFile(file)); } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    await page.goto(origin);
    const out = await page.evaluate(async () => {
        const { stripExcludedTagsFromFaceOutput: strip } = await import('/src/independentApi/faceTagFilter.js');
        const skip = new Set(['签条', '日期', '时间', '天气', '地点', '评语', 'bgm', 'thinking', 'status', 'content', 'text', 'image', 'circle', 'font', 'center', 'div']);
        const run = html => strip(html, skip);
        return {
            statusBar: run('<details><summary>t</summary><div class="card">卡</div>\n<日期>某年九月<时间>深夜 23:45<天气>夜色<地点>某城<评语>一句话</details>'),
            leading: run('<thinking>想了很多</thinking><details><summary>t</summary><p>正文</p></details>'),
            leadingBar: run('<日期>某年<时间>深夜<details><summary>t</summary><p>正文</p></details>'),
            paired: run('<details><summary>t</summary><p>a</p><签条><日期>某年</日期><地点>某城</地点></签条><p>b</p></details>'),
            pairThenLone: run('<p>x</p>\n<日期>某年</日期><时间>深夜'),
            wrapper: run('<details><summary>标题</summary><content><p>全部正文</p></content></details>'),
            bgm: run('<details><summary>t</summary><p>正文</p><bgm>歌名</bgm><status>心情：开心</status></details>'),
            midSentence: run('<p>她在纸上写下<日期>三个字，然后合上本子。</p>'),
            escapedMention: run('<p>系统提示：请勿输出&lt;thinking&gt;内容，阿雪笑了。</p>'),
            fullwidth: run('<p>她在纸上写下＜日期＞三个字。</p>'),
            svg: run('<svg viewBox="0 0 10 10"><text x="1" y="5">好感度</text><circle r="2"></circle><image href="a.png"></image></svg>'),
            legacy: run('<center><font color="red">重要</font></center>'),
            pre: run('<pre>&lt;status&gt;示例&lt;/status&gt;</pre><code>&lt;日期&gt;x</code>'),
            attr: run('<div title="a>b <status>">阿雪</div><p>后面正文</p>'),
            comment: run('<!-- a > b <status> -->后面正文<p>x</p>'),
            heart: run('<p>爱你&lt;3 <status>心情：开心</status></p>'),
            untouched: run('<details><summary>标题</summary><div class="card">没有跳过的标签</div></details>'),
            divSkipped: run('<div class="card">卡</div>'),
            unclosedEnglish: strip('<mood>开心<location>学校<details><summary>t</summary><p>正文</p></details>', new Set(['mood', 'location'])),
            unclosedInside: run('<details><summary>t</summary><status>心情：开心\n<p>正文</p></details>'),
            closedCard: run('<status><div class="bar">好感度 80｜心情 开心</div></status><details><summary>t</summary><p>正文很长的一段正文内容</p></details>'),
            thinkingParagraph: run('<thinking><p>分析：用户想要甜文</p></thinking><details><summary>t</summary><p>正文很长的一段正文内容</p></details>'),
            afterInline: run('<p><span>阿雪写下</span>&lt;日期&gt;两个字，就去睡了。</p>'),
            afterBr: run('<p>正文<br><日期>某年<时间>深夜</p>'),
            mixedStatus: run('<details><summary>t</summary><status>心情：开心\n<p>正文很长很长</p><status><div class="bar">好感度 80</div></status></details>'),
            styleMention: run('<style>.x::after{content:"<status>"}</style><p>正文</p><status><div class="bar">好感度 80</div></status>'),
            selfClosing: run('<bgm/><p>正文</p><bgm><div>歌名：xx</div></bgm>'),
            longThinking: run('<details><summary>t</summary><thinking><p>' + '分析'.repeat(100) + '</p></thinking><p>短正文</p></details>'),
            wholeBodyWrapper: run('<details><summary>t</summary><content><p>全部正文在这里</p></content></details>'),
            englishMid: run('<p>请不要输出 <thinking> 之类的内容，阿雪笑了。</p>'),
            textareaMention: run('<details><summary>t</summary><textarea>示例 <status></textarea><status><div class="bar">好感度 80</div></status><p>正文</p></details>'),
            attrMention: run('<details><summary>t</summary><div data-tip="<status>">x</div><status><div class="bar">好感度 80</div></status></details>'),
            svgSame: run('<details><summary>t</summary><svg><status/></svg><status><div class="bar">好感度 80</div></status><p>正文</p></details>'),
            unclosedCode: run('<details><summary>t</summary><p>用 <code>x 写</p><status><div class="bar">好感度 80</div></status><p>正文</p></details>'),
        };
    });
    assert.equal(out.statusBar, '<details><summary>t</summary><div class="card">卡</div>\n</details>');
    assert.equal(out.leading, '<details><summary>t</summary><p>正文</p></details>');
    assert.equal(out.leadingBar, '<details><summary>t</summary><p>正文</p></details>');
    assert.equal(out.paired, '<details><summary>t</summary><p>a</p><p>b</p></details>');
    assert.equal(out.pairThenLone, '<p>x</p>\n');
    assert.equal(out.wrapper, '<details><summary>标题</summary><p>全部正文</p></details>');
    assert.equal(out.bgm, '<details><summary>t</summary><p>正文</p></details>');
    assert.equal(out.midSentence, '<p>她在纸上写下三个字，然后合上本子。</p>');
    assert.equal(out.escapedMention, '<p>系统提示：请勿输出内容，阿雪笑了。</p>');
    assert.equal(out.fullwidth, '<p>她在纸上写下＜日期＞三个字。</p>');
    assert.equal(out.svg, '<svg viewBox="0 0 10 10"><text x="1" y="5">好感度</text><circle r="2"></circle><image href="a.png"></image></svg>');
    assert.equal(out.legacy, '<center><font color="red">重要</font></center>');
    assert.equal(out.pre, '<pre>&lt;status&gt;示例&lt;/status&gt;</pre><code>&lt;日期&gt;x</code>');
    assert.equal(out.attr, '<div title="a>b <status>">阿雪</div><p>后面正文</p>');
    assert.equal(out.comment, '<!-- a > b <status> -->后面正文<p>x</p>');
    assert.equal(out.heart, '<p>爱你&lt;3 </p>');
    assert.equal(out.untouched, '<details><summary>标题</summary><div class="card">没有跳过的标签</div></details>');
    assert.equal(out.divSkipped, '<div class="card">卡</div>');
    assert.equal(out.unclosedEnglish, '<details><summary>t</summary><p>正文</p></details>');
    assert.equal(out.unclosedInside, '<details><summary>t</summary>\n<p>正文</p></details>');
    assert.equal(out.closedCard, '<details><summary>t</summary><p>正文很长的一段正文内容</p></details>');
    assert.equal(out.thinkingParagraph, '<details><summary>t</summary><p>正文很长的一段正文内容</p></details>');
    assert.equal(out.afterInline, '<p><span>阿雪写下</span>两个字，就去睡了。</p>');
    assert.equal(out.afterBr, '<p>正文<br></p>');
    assert.equal(out.mixedStatus, '<details><summary>t</summary>\n<p>正文很长很长</p></details>');
    assert.equal(out.styleMention, '<style>.x::after{content:"<status>"}</style><p>正文</p>');
    assert.equal(out.selfClosing, '<p>正文</p>');
    assert.equal(out.longThinking, '<details><summary>t</summary><p>短正文</p></details>');
    assert.equal(out.wholeBodyWrapper, '<details><summary>t</summary><p>全部正文在这里</p></details>');
    assert.equal(out.englishMid, '<p>请不要输出  之类的内容，阿雪笑了。</p>');
    assert.equal(out.textareaMention, '<details><summary>t</summary><textarea>示例 &lt;status&gt;</textarea><p>正文</p></details>');
    assert.equal(out.attrMention, '<details><summary>t</summary><div data-tip="&lt;status&gt;">x</div></details>');
    assert.equal(out.svgSame, '<details><summary>t</summary><svg><status></status></svg><p>正文</p></details>');
    assert.doesNotMatch(out.unclosedCode, /好感度/);
    assert.match(out.unclosedCode, /正文/);
    assert.deepEqual(errors, []);
    console.log('faceTagFilter ok');
} finally {
    await browser?.close();
    server.close();
}
