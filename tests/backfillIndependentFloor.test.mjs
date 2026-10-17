// 一键补楼层每一层怎么补：和缺壳卡「重新生成」走同一条 generateFor（手动、按当前设置抽签），
// 已经有兔子镜的不补，换了聊天、关了生成就整队停，生成完看存档判断成没成，失败时带上那一层的失败原因。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const mountSource = readFileSync(new URL('../src/independentApi/mount.js', import.meta.url), 'utf8');
const source = [/export function independentBackfillFloorToken\([^]*?\r?\n}/, /export async function backfillIndependentFloor\([^]*?\r?\n}/]
    .map(pattern => mountSource.match(pattern)?.[0]).join('\n');

function fixture({ chat = 'A', settings = {}, mode = 'independent', eligible = true, body = true, savedBefore = false, savedAfter = true,
    follow = false, generate = null, stop = null, switchChatDuringGenerate = false, rendered = true, revealable = true, revealSwitchesChat = false, abnormal = '', text = '这是一段足够长的正文' } = {}) {
    assert.ok(source);
    const calls = [];
    let currentChat = chat;
    let saved = savedBefore;
    let shown = rendered;
    const reveals = [];
    const message = { is_user: false, mes: body ? text : '', send_date: 'd1' };
    const ctx = () => ({ key: currentChat, chat: [message] });
    const sandbox = {
        getContext: ctx,
        currentRuntime: () => true,
        runtimeMode: () => mode,
        chatKey: c => c.key,
        getSettings: () => ({ enabled: true, autoRabbitMirrorInjection: true, ...settings }),
        independentGenerationTiming: st => st.timing || 'manual',
        isRabbitMirrorEligibleAssistantMessage: () => eligible,
        hasUsableAssistantBody: m => !!m?.mes,
        hasExistingFollowRabbitMirror: () => follow,
        savedIndependentRecordForOwner: () => (saved ? { html: '<details>镜</details>' } : null),
        independentStoredHtmlRestorable: () => true,
        readStore: () => ({}),
        passiveObservedIdentity: () => ({ slot: 's', sourceHash: 'h' }),
        automaticFailureStopFor: () => stop,
        isMissingShellStop: s => s?.code === 'missing-external-shell',
        messageElement: () => (shown ? {} : null),
        revealBackfillFloor: async id => { reveals.push(id); if (revealSwitchesChat) currentChat = 'B'; if (revealable) shown = true; },
        mainReplyAbnormalReason: () => abnormal,
        generateFor: async (...args) => {
            calls.push(args);
            if (switchChatDuringGenerate) currentChat = 'B';
            if (generate) return generate();
            saved = savedAfter;
        },
    };
    const context = vm.createContext(sandbox);
    vm.runInContext(source.replaceAll('export ', ''), context);
    return { run: (index = 0, options = { chat: 'A' }) => context.backfillIndependentFloor(index, options), token: index => context.independentBackfillFloorToken(index), message, calls, reveals };
}

test('generates like the card retry: forced, fresh selection, no resay recipe, empty note', async () => {
    const h = fixture();
    assert.deepEqual({ ...(await h.run()) }, { status: 'done' });
    assert.equal(h.calls.length, 1);
    const [index, msg, force, sourceAware, multiface, early, manualOwner, single, quick, note] = h.calls[0];
    assert.equal(index, 0); assert.equal(msg.mes, '这是一段足够长的正文');
    assert.equal(force, true); assert.equal(sourceAware, true);
    assert.equal(multiface, null); assert.equal(early, null); assert.equal(manualOwner, null); assert.equal(single, null); assert.equal(quick, null);
    assert.equal(note, '');
});

test('floors that already have a mirror are skipped without a request', async () => {
    for (const h of [fixture({ savedBefore: true }), fixture({ follow: true })]) {
        const result = await h.run();
        assert.equal(result.status, 'skipped');
        assert.equal(h.calls.length, 0);
    }
});

test('not a usable reply → skipped', async () => {
    for (const h of [fixture({ eligible: false }), fixture({ body: false })]) {
        assert.equal((await h.run()).status, 'skipped');
        assert.equal(h.calls.length, 0);
    }
    assert.equal((await fixture().run(-1)).status, 'skipped');
});

test('another chat, generation off or follow mode stops the whole queue', async () => {
    const cases = [
        [fixture({ chat: 'B' }), /聊天已经换了/],
        [fixture({ settings: { timing: 'off' } }), /已关闭/],
        [fixture({ settings: { enabled: false } }), /已关闭/],
        [fixture({ settings: { autoRabbitMirrorInjection: false } }), /已关闭/],
        [fixture({ mode: 'follow' }), /不是独立 API/],
    ];
    for (const [h, reason] of cases) {
        const result = await h.run();
        assert.equal(result.status, 'stopped');
        assert.match(result.message, reason);
        assert.equal(h.calls.length, 0);
    }
});

test('chat switched while generating → stopped, not counted as failure', async () => {
    const h = fixture({ switchChatDuringGenerate: true });
    assert.equal((await h.run()).status, 'stopped');
});

test('nothing saved after generating → failed with that floor\'s own failure reason', async () => {
    const withReason = fixture({ savedAfter: false, stop: { message: 'HTTP 429：请求太频繁' } });
    assert.deepEqual({ ...(await withReason.run()) }, { status: 'failed', message: 'HTTP 429：请求太频繁' });
    // 扫描时挂上的缺壳卡说明不是这次失败的原因。
    const shellOnly = fixture({ savedAfter: false, stop: { code: 'missing-external-shell', message: '暂未找到与这条回复对应的已保存兔子镜' } });
    assert.match((await shellOnly.run()).message, /没有生成出兔子镜/);
    const plain = fixture({ savedAfter: false });
    assert.match((await plain.run()).message, /没有生成出兔子镜/);
    const thrown = fixture({ generate: () => { throw new Error('网络断了'); } });
    assert.deepEqual({ ...(await thrown.run()) }, { status: 'failed', message: '网络断了' });
});

test('older floors not on the page are loaded first, then generated; if they cannot be loaded they are skipped', async () => {
    const loads = fixture({ rendered: false });
    assert.deepEqual({ ...(await loads.run()) }, { status: 'done' });
    assert.deepEqual(loads.reveals, [0]); assert.equal(loads.calls.length, 1);
    const onPage = fixture();
    await onPage.run();
    assert.deepEqual(onPage.reveals, [], 'floors already on the page are not reloaded');
    const stuck = fixture({ rendered: false, revealable: false });
    const r0 = await stuck.run();
    assert.equal(r0.status, 'skipped'); assert.match(r0.message, /没能把这一层加载到页面上/); assert.equal(stuck.calls.length, 0);
    const switched = fixture({ rendered: false, revealSwitchesChat: true });
    assert.equal((await switched.run()).status, 'stopped'); assert.equal(switched.calls.length, 0);
});

test('odd short replies and moved floors are skipped with a reason, no request', async () => {
    const odd = fixture({ abnormal: 'too-short' });
    const r2 = await odd.run();
    assert.equal(r2.status, 'skipped'); assert.equal(r2.message, 'too-short，要补请单独点卡');
    const moved = fixture();
    const token = moved.token(0);
    assert.ok(token.startsWith('d1|'));
    moved.message.mes = '删楼后挪上来的另一条回复';
    const r3 = await moved.run(0, { chat: 'A', token });
    assert.equal(r3.status, 'skipped'); assert.match(r3.message, /楼层变了/);
    for (const h of [odd, moved]) assert.equal(h.calls.length, 0);
    // 身份没变：照常补。
    const same = fixture();
    assert.equal((await same.run(0, { chat: 'A', token: same.token(0) })).status, 'done');
});
