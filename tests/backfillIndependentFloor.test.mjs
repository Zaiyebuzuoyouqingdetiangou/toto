// 一键补楼层每一层怎么补：和缺壳卡「重新生成」走同一条 generateFor（手动、按当前设置抽签），
// 已经有兔子镜的不补，换了聊天、关了生成就整队停，生成完看存档判断成没成，失败时带上那一层的失败原因。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const mountSource = readFileSync(new URL('../src/independentApi/mount.js', import.meta.url), 'utf8');
const source = [/export function independentBackfillFloorToken\([^]*?\r?\n}/, /export async function prepareIndependentBackfillFloor\([^]*?\r?\n}/, /export async function backfillIndependentFloor\([^]*?\r?\n}/]
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

        mainReplyAbnormalReason: () => abnormal,
        automaticMainReplySafetyOptions: () => ({}),
        generateFor: async (...args) => {
            calls.push(args);
            if (switchChatDuringGenerate) currentChat = 'B';
            if (generate) return generate();
            saved = savedAfter;
        },
    };
    const context = vm.createContext(sandbox);
    // 准备那一步动态加载快拍模块的「加载更早的楼层」：测试里换成假的，记下调用。
    const runnable = source.replaceAll('export ', '').replace(/const snapshot=await import\([^)]*\);/, 'const snapshot=globalThis.snapshot;');
    context.snapshot = { revealChatFloor: async (id, { keepGoing } = {}) => {
        reveals.push(id);
        if (revealSwitchesChat) currentChat = 'B';
        if (keepGoing && !keepGoing()) return null;
        if (revealable) shown = true;
        return shown ? {} : null;
    } };
    vm.runInContext(runnable, context);
    return { run: (index = 0, options = { chat: 'A' }) => context.backfillIndependentFloor(index, options), prepare: (index = 0, options = { chat: 'A' }) => context.prepareIndependentBackfillFloor(index, options), setSaved: value => { saved = value; }, token: index => context.independentBackfillFloorToken(index), message, calls, reveals };
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

test('prepare loads an older floor onto the page; generating still skips a floor that could not be loaded', async () => {
    const loads = fixture({ rendered: false });
    await loads.prepare();
    assert.deepEqual(loads.reveals, [0]);
    assert.deepEqual({ ...(await loads.run()) }, { status: 'done' });
    const onPage = fixture();
    await onPage.prepare();
    assert.deepEqual(onPage.reveals, [], 'floors already on the page are not reloaded');
    const otherChat = fixture({ rendered: false });
    await otherChat.prepare(0, { chat: 'B' });
    assert.deepEqual(otherChat.reveals, [], 'nothing is loaded in a different chat');
    // 生成那一步反正会跳过的楼层不先加载：已经有兔子镜、正文像出错的、生成关了。
    for (const options of [{ savedBefore: true }, { abnormal: 'too-short' }, { settings: { timing: 'off' } }, { mode: 'follow' }]) {
        const skip = fixture({ rendered: false, ...options });
        await skip.prepare();
        assert.deepEqual(skip.reveals, [], `not loaded: ${JSON.stringify(options)}`);
    }
    // 楼层身份变了（中途删过楼层）：不先加载。
    const movedFloor = fixture({ rendered: false });
    const oldToken = movedFloor.token(0);
    movedFloor.message.mes = '删楼后挪上来的另一条回复';
    await movedFloor.prepare(0, { chat: 'A', token: oldToken });
    assert.deepEqual(movedFloor.reveals, []);
    // 已经有兔子镜的老楼层：生成那一步说「已经有兔子镜了」，不是「没能加载」。
    const hasOne = fixture({ rendered: false, savedBefore: true });
    assert.match((await hasOne.run()).message, /已经有兔子镜了/);
    // 暂停、停止：keepGoing 变假，不再往上加载。
    const paused = fixture({ rendered: false });
    let asked = 0;
    const original = paused.prepare;
    await original(0, { chat: 'A', keepGoing: () => { asked++; return false; } });
    assert.ok(asked >= 1);
    assert.equal(await paused.run().then(r => r.status), 'skipped', 'not loaded because the queue was paused');
    const stuck = fixture({ rendered: false, revealable: false });
    await stuck.prepare();
    const r0 = await stuck.run();
    assert.equal(r0.status, 'skipped'); assert.match(r0.message, /没能把这一层加载到页面上/); assert.equal(stuck.calls.length, 0);
    // 加载途中换了聊天：不再往上加载；生成那一步发现换了聊天，整队停，不发请求。
    const switched = fixture({ rendered: false, revealSwitchesChat: true });
    await switched.prepare();
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
