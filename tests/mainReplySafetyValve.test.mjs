import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { mainReplyAbnormalReason } from '../src/mainReplySafetyValve.js';

const story = '他收好书信，把窗边的花移到阳光下面。故事在平静的午后告一段落，等下次见面时再一起读那封信。'.repeat(5);
const completeStories = [
    ['preset leaves the content wrapper open', `<content>${story}`],
    ['unclosed details markup alone is not provider truncation evidence', `<details><summary>往事</summary>${story}`],
    ['self-closing custom tag is not an incomplete reply', `<content/>${story}`],
    ['comment mentions a tag', `<!-- example: <content> -->${story}`],
    ['script string mentions a tag', `<script>const name = '<content>';</script>${story}`],
    ['inline code mentions a tag', `${story}\n这里的标签名称是 \`<content>\`。`],
    ['literal fence marker is not provider truncation evidence', `${story}\n他在纸上记下代码块标记：\`\`\`。`],
    ['balanced wrappers remain supported', `<content><details><summary>往事</summary>${story}</details></content>`],
];
for (const [name, mes] of completeStories) test(name, () => {
    const message = { mes, extra: {} };
    assert.equal(mainReplyAbnormalReason(message), '');
    assert.equal(message.mes, mes, 'the main reply is never rewritten to repair punctuation');
});

test('early body fragments are not rejected for unclosed markup', () => {
    assert.equal(mainReplyAbnormalReason({ mes: '<content>窗前的信。' }, { partial: true }), '');
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
test('a completed automatic reply with a preset wrapper retains its exact final proof', () => {
    const message = { mes: `<content>${story}` }, ctx = { chat: [] }, notices = [];
    ctx.chat.push(message);
    const context = vm.createContext({ mainReplyAbnormalReason, getSettings: () => ({}), independentGenerationTiming: () => 'auto',
        notifySafetyValve: (...args) => notices.push(args), isRabbitMirrorEligibleAssistantMessage: () => true,
        messageBodyFingerprint: value => value.mes, INDEPENDENT_INTENT_OWNER: Symbol('owner') });
    install(context, 'independentSafetyValveTripped');
    install(context, 'deferredIndependentIntentHasFinalProof');
    const proof = { finalIndex: 0, completedAt: 2, terminalAt: 1, finalBodyHash: message.mes };
    assert.equal(context.deferredIndependentIntentHasFinalProof(proof, ctx, 0), true);
    assert.deepEqual(notices, []);
    assert.equal(context.deferredIndependentIntentHasFinalProof({ ...proof, finalBodyHash: 'different' }, ctx, 0), false);
    assert.equal(context.deferredIndependentIntentHasFinalProof({ ...proof, terminalAt: 0 }, ctx, 0), false);
    message.extra = { api_error: true };
    assert.equal(context.deferredIndependentIntentHasFinalProof(proof, ctx, 0), false);
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
