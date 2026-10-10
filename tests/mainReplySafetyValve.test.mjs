import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { mainReplyAbnormalReason } from '../src/mainReplySafetyValve.js';

const story = '他收好书信，把窗边的花移到阳光下面。故事在平静的午后告一段落，等下次见面时再一起读那封信。'.repeat(5);
const completeStories = [
    ['self-closing custom tag is not an incomplete reply', `<content/>${story}`],
    ['comment mentions a tag', `<!-- example: <content> -->${story}`],
    ['script string mentions a tag', `<script>const name = '<content>';</script>${story}`],
    ['inline code mentions a tag', `${story}\n这里的标签名称是 \`<content>\`。`],
    ['literal fence marker is not provider truncation evidence', `${story}\n他在纸上记下代码块标记：\`\`\`。`],
    ['balanced wrappers remain supported', `<content><details><summary>往事</summary>${story}</details></content>`],
    ['quoted attribute tags do not count as wrappers', `<content><div title="<content> > <details>">${story}</div></content>`],
    ['a closed wrapper with a script example remains complete', `<content>${story}<script>const example = '<content><details>';</script></content>`],
    ['a closed wrapper with a CSS example remains complete', `<content>${story}<style>.hint::before{content:'<content>';}</style></content>`],
    ['textarea examples are not enclosing markup', `<content>${story}<textarea><content><details></textarea></content>`],
    ['HTML code examples are not enclosing markup', `<content>${story}<code>&lt;content&gt; and <details></code></content>`],
    ['closed Markdown examples are ignored', `<content>${story}\n\`\`\`html\n<content><details>\n\`\`\`\n</content>`],
    ['longer and tilde fences are paired by marker', `${story}\n\`\`\`\`html\n\`\`\`\n<content>\n\`\`\`\`\n~~~html\n<details>\n~~~~`],
    ['nested wrappers with attributes and uppercase closing tags are complete', `<CONTENT class="a > b"><details open><summary>信</summary><details>${story}</details></details></CONTENT >`],
    ['escaped tag text is not an opening tag', `&lt;content&gt;${story}&lt;details&gt;`],
    ['an inline fence mention cannot consume a later fenced block', `<content>${story} 他写下代码块标记：\`\`\`。\n\n\`\`\`html\n<details>只是代码例子\n\`\`\`\n</content>`],
    ['inline backticks cannot pair across separate paragraphs', `<content>${story} 他写下一个标记：\`。\n\n</content>\n\n另一个段落里也有标记：\`。`],
    ['inline code can still span adjacent nonblank lines', `<content>${story}\n标签示例是 \`<content>\n<details>\`。\n</content>`],
    // Keep the supplied reply's wrapper/calendar/footer structure without publishing private story text.
    ['closed story followed by custom status, summary, calendar and spaced footer close is complete', `<content>\r\n${story}\r\n</content>\r\n\r\n<wqd>状态|心情|记录</wqd>\r\n\r\n<摘要> ${story} </摘要>\r\n\r\n<日历>\r\n<月份>2026年7月</月份>\r\n\r\n| 周一 | 周二 | 周三 | 周四 | 周五 | 周六 | 周日 |\r\n| --- | --- | --- | --- | --- | --- | --- |\r\n| | | 1<br>五月十八 | 2<br>五月十九 | 3<br>五月二十 | 4<br>五月廿一 | 5<br>五月廿二 |\r\n\r\n<今日>2026年7月1日 星期三｜农历五月十八｜</今日>\r\n\r\n<事件>\r\n07月01日　清晨，准备出门。\r\n</事件>\r\n</日历>\r\n\r\n<p><span style="display:block; text-align:center; color:#999999; font-size:0.9em;">✦ 你永远是自由的盛夏 ✦</span></p >`],
];
for (const [name, mes] of completeStories) test(name, () => {
    const message = { mes, extra: {} };
    assert.equal(mainReplyAbnormalReason(message), '');
    assert.equal(message.mes, mes, 'the main reply is never rewritten to repair punctuation');
});

test('early body fragments are not rejected for unclosed markup', () => {
    assert.equal(mainReplyAbnormalReason({ mes: '<content>窗前的信。' }, { partial: true }), '');
});

for (const [name, mes, reason] of [
    ['unfinished content', `<content>${story}`, /<content>/],
    ['unfinished details', `<details><summary>往事</summary>${story}`, /<details>/],
    ['unfinished nested details', `<content><details>${story}<details>第二段</details></content>`, /<details>/],
    ['a closing example cannot close the actual content', `<content>${story}<script>const example = '</content>';</script>`, /<content>/],
    ['a closing comment cannot close the actual content', `<content>${story}<!-- </content> -->`, /<content>/],
    ['a preceding closing tag cannot close a later opening', `</content><content>${story}`, /<content>/],
    ['unfinished backtick block', `${story}\n\`\`\`html\n<div>还未写完`, /代码块/],
    ['wrong fence length', `${story}\n\`\`\`\`html\n<div>\n\`\`\``, /代码块/],
    ['unfinished tilde block', `${story}\n~~~html\n<div>还未写完`, /代码块/],
]) test(`${name} stops automatic generation without changing the reply`, () => {
    const message = { mes };
    assert.match(mainReplyAbnormalReason(message), reason);
    assert.equal(message.mes, mes);
});

test('existing empty, explicit host error and provider error checks remain in effect', () => {
    assert.match(mainReplyAbnormalReason({ mes: '' }), /未返回内容/);
    assert.match(mainReplyAbnormalReason({ mes: story, extra: { api_error: true } }), /宿主标记为错误/);
    assert.match(mainReplyAbnormalReason({ mes: 'Error 429: Too many requests. Please try again after the rate limit resets.' }), /接口报错/);
    assert.match(mainReplyAbnormalReason({ mes: '抱歉，我无法完成这个请求，因为当前内容不符合相关政策和规定，请换一个问题。' }), /拒答/);
});

const mount = readFileSync(new URL('../src/independentApi/mount.js', import.meta.url), 'utf8');
function install(context, name) {
    const match = mount.match(new RegExp(`^(?:export )?function ${name}\\([^]*?^}\\r?$`, 'm'));
    assert.ok(match, name);
    vm.runInContext(match[0].replace(/^export /, ''), context);
}
test('exact host completion proof does not judge content before the source-stability poll', () => {
    const message = { mes: `<content>${story}` }, ctx = { chat: [] }, notices = [];
    ctx.chat.push(message);
    const context = vm.createContext({ mainReplyAbnormalReason, getSettings: () => ({}), independentGenerationTiming: () => 'auto',
        notifySafetyValve: (...args) => notices.push(args), isRabbitMirrorEligibleAssistantMessage: () => true,
        messageBodyFingerprint: value => value.mes, INDEPENDENT_INTENT_OWNER: Symbol('owner') });
    install(context, 'deferredIndependentIntentHasFinalProof');
    const proof = { finalIndex: 0, completedAt: 2, terminalAt: 1, finalBodyHash: message.mes };
    assert.equal(context.deferredIndependentIntentHasFinalProof(proof, ctx, 0), true);
    assert.deepEqual(notices, []);
    assert.equal(context.deferredIndependentIntentHasFinalProof({ ...proof, finalBodyHash: 'different' }, ctx, 0), false);
    assert.equal(context.deferredIndependentIntentHasFinalProof({ ...proof, terminalAt: 0 }, ctx, 0), false);
    message.extra = { api_error: true };
    assert.equal(context.deferredIndependentIntentHasFinalProof(proof, ctx, 0), true, 'content checks belong to dispatch, not event attribution');
    assert.deepEqual(notices, []);
});

test('manual generation bypasses the automatic reply-content gate', async () => {
    const from = mount.indexOf('export async function generateFor(');
    const to = mount.indexOf(' if(!independentHistoryLoaded(', from);
    assert.ok(from >= 0 && to > from);
    const message = { mes: story, extra: { api_error: true } }, ctx = { chat: [message] };
    const context = vm.createContext({ mainReplyAbnormalReason, getContext: () => ctx,
        isRabbitMirrorEligibleAssistantMessage: () => true, observeMessageSourceRevision: () => ({}), recordKey: () => 'message',
        getSettings: () => ({ generationSource: 'independent' }), messageBaseSlotKey: () => 'base', runtimeMode: () => 'independent',
        independentGenerationTiming: () => 'auto', automaticIndependentTiming: () => true, notifySafetyValve() {} });
    vm.runInContext(mount.slice(from, to).replace(/^export /, '') + '\nreturn "past-content-gate";\n}', context);
    assert.equal(await context.generateFor(0, message, false), undefined);
    assert.equal(await context.generateFor(0, message, true), 'past-content-gate');
});

test('final automatic dispatch rejects incomplete tags; corrected text and manual retry pass', async () => {
    const from = mount.indexOf('export async function generateFor('), to = mount.indexOf(' if(!independentHistoryLoaded(', from);
    const message = { mes: `<content>${story}` }, ctx = { chat: [message] }, notices = [];
    const context = vm.createContext({ mainReplyAbnormalReason, getContext: () => ctx,
        isRabbitMirrorEligibleAssistantMessage: () => true, observeMessageSourceRevision: () => ({}), recordKey: () => 'message',
        getSettings: () => ({ generationSource: 'independent' }), messageBaseSlotKey: () => 'base', runtimeMode: () => 'independent',
        independentGenerationTiming: () => 'auto', automaticIndependentTiming: () => true, notifySafetyValve: (_msg, reason) => notices.push(reason) });
    vm.runInContext(mount.slice(from, to).replace(/^export /, '') + '\nreturn "past-content-gate";\n}', context);
    assert.equal(await context.generateFor(0, message, false), undefined, 'stop before history preparation or provider calls');
    assert.match(notices[0], /<content>/);
    assert.equal(await context.generateFor(0, message, true), 'past-content-gate');
    message.mes += '</content>';
    assert.equal(await context.generateFor(0, message, false), 'past-content-gate');
    assert.equal(notices.length, 1);
});

test('next-normal handoff waits for existing stability checks before evaluating incomplete markup', () => {
    const source = readFileSync(new URL('../src/independentApi/earlyBody.js', import.meta.url), 'utf8');
    const implementation = source.match(/^function finalizeAutomaticHostGeneration\([^]*?^}\r?$/m)?.[0];
    assert.ok(implementation);
    const message = { mes: `<content>${story}` }, ctx = { chat: [message] };
    const checked = [], activated = [];
    const context = vm.createContext({
        holdAbnormalAutomaticReply: (ctx, i) => { checked.push(ctx.chat[i].mes); return !!mainReplyAbnormalReason(ctx.chat[i]); },
        settleAutomaticHostGeneration: () => true, writeHostGenerationInProgress() {}, writeHostGenerationHintStartedAt() {},
        clearGenerationPlaceholderPoll() {}, finishGlobalWorldInfoCapture() {}, claimDeferredIndependentGenerationIntent() {},
        activateAuthorizedAutomaticGeneration: (...args) => { activated.push(args); return true; },
    });
    vm.runInContext(implementation, context);
    assert.equal(context.finalizeAutomaticHostGeneration(ctx, 0, 'host-next-normal', false, 100), true);
    assert.equal(checked.length, 0, 'do not cancel the previous reply based on its unfinished transient tail');
    assert.equal(activated[0][4], false, 'keep the existing downstream stability wait');
    message.mes += '</content>';
    assert.equal(context.finalizeAutomaticHostGeneration(ctx, 0, 'host-generation-finished', true), true);
    message.mes = `<content>${story}`;
    assert.equal(context.finalizeAutomaticHostGeneration(ctx, 0, 'host-generation-finished', true), false);
    assert.equal(activated.length, 2, 'a stable incomplete reply never becomes a generation task');
});
