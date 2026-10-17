// 正文生成失败后酒馆把那条回复删了：它留下的「生成失败」「旧镜面待恢复」卡要拿掉，不能往下一条上叠（朋友 1.69.0 上叠了六张）。
// 回复还在聊天里、只是暂时不在页面上（TT）的照旧留着；画好的兔子镜不动；同一层只留一张没画好的卡。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/independentApi/geometry.js', import.meta.url), 'utf8')
    .match(/export function pruneOrphanIndependentPlaceholderHosts\(\)\{[^]*?\r?\n\}/)?.[0];

function host({ owner, key = '', state = 'error', ready = false, chat = 'C', source = 'independent' }) {
    const node = { dataset: { rmSource: source, rmOwnerChat: chat, rmOwnerMesid: String(owner), rmKey: key, rmState: state }, ready, removed: false };
    node.remove = () => { node.removed = true; };
    return node;
}

function run(chat, hosts) {
    assert.ok(source, 'function found');
    const ctx = { chat, key: 'C' };
    const sandbox = {
        getContext: () => ctx,
        chatKey: c => c.key,
        allExternalHosts: () => hosts.filter(h => !h.removed),
        readyDetailsFromHost: h => h.ready,
        isRabbitMirrorEligibleAssistantMessage: m => !!m && !m.is_user,
        recordKey: (c, i, m) => `C:${i}:0:${m.fp}`,
    };
    vm.createContext(sandbox);
    vm.runInContext(source.replace('export ', ''), sandbox);
    return sandbox.pruneOrphanIndependentPlaceholderHosts();
}

const ai = fp => ({ is_user: false, fp });
const user = { is_user: true, fp: 'u' };

test('cards left by replies the tavern deleted are removed; cards for replies still in the chat stay', () => {
    const chat = [user, ai('a'), user, ai('b')]; // 正文生成失败：#4、#5 被删了，聊天只剩 0～3
    const hosts = [
        host({ owner: 4, key: 'C:4:0:x1' }), host({ owner: 4, key: 'C:4:0:x2' }), host({ owner: 4, key: 'C:4:0:x3', state: 'missing' }),
        host({ owner: 5, key: 'C:5:0:x4' }),
        host({ owner: 3, key: 'C:3:0:b', state: 'error' }), // 这条回复还在（TT 暂时移出页面）
        host({ owner: 1, key: 'C:1:0:a', state: 'ready', ready: true }),
    ];
    assert.equal(run(chat, hosts), 4);
    assert.deepEqual(hosts.map(h => h.removed), [true, true, true, true, false, false]);
});

test('same floor number now holds a different reply: the old reply\'s unfinished cards go, a loading one for the new reply stays', () => {
    const chat = [user, ai('new')];
    const hosts = [
        host({ owner: 1, key: 'C:1:0:old1' }), host({ owner: 1, key: 'C:1:0:old2', state: 'missing' }),
        host({ owner: 1, key: 'C:1:0:new', state: 'loading' }),
    ];
    run(chat, hosts);
    assert.deepEqual(hosts.map(h => h.removed), [true, true, false]);
});

test('a floor that is now a user message drops its cards; ready mirrors and other chats/sources are never touched', () => {
    const chat = [user, ai('a'), user];
    const hosts = [
        host({ owner: 2, key: 'C:2:0:z' }),
        host({ owner: 2, key: 'C:2:0:z', ready: true, state: 'ready' }),
        host({ owner: 9, key: 'X:9:0:z', chat: 'X' }),
        host({ owner: 9, key: 'C:9:0:z', source: 'follow' }),
    ];
    run(chat, hosts);
    assert.deepEqual(hosts.map(h => h.removed), [true, false, false, false]);
});

test('at most one unfinished card per floor: keep the last one that matches the reply', () => {
    const chat = [user, ai('a')];
    const hosts = [host({ owner: 1, key: 'C:1:0:a' }), host({ owner: 1, key: 'C:1:0:a', state: 'missing' }), host({ owner: 1, key: '' })];
    run(chat, hosts);
    assert.deepEqual(hosts.map(h => h.removed), [true, true, false]);
});
