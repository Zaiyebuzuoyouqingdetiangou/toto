// 「统计所有聊天」：读别的聊天文件核对，聊天文件里有同一份的本机缓存才删；对不上、读不到、当前聊天的不动。
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
    get length() { return store.size; }, key: i => [...store.keys()][i] ?? null,
    getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k),
};
const files = {
    '阿岩 - 2026-01-01@10h00m00s': [{ chat_metadata: { rabbit_mirror_independent_outputs_v2: { owners: {
        '3:0': { html: '<details>甲</details>', faceSwipes: { 0: { versions: [{ html: '<details>甲旧</details>' }, { html: '<details>甲</details>' }] } } },
        '5:0': { html: '<details>乙新</details>' },
    } } } }, { mes: 'x', extra: { rabbitMirrorImageOwner: { id: 'tok1' }, rabbitMirrorImages: { '0:h': { current: { path: '/a.png' }, history: [{ path: '/b.png' }] } } } }],
};
const calls = [];
globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body); calls.push([url, body]);
    if (url === '/api/characters/chats') return { ok: true, json: async () => body.avatar_url === 'ayan.png' ? [{ file_name: '阿岩 - 2026-01-01@10h00m00s.jsonl' }] : [] };
    if (url === '/api/chats/get') return { ok: true, json: async () => files[body.file_name] };
    return { ok: false, status: 404, json: async () => null };
};
const mod = await import('../src/storageCleanupAllChats.js');
const ctx = { chatId: '阿竹 - 2026-02-02@10h00m00s', getRequestHeaders: () => ({}), characters: [{ name: '阿竹', avatar: 'azhu.png' }, { name: '阿岩', avatar: 'ayan.png' }], groups: [] };
const A = 'chat:阿岩 - 2026-01-01@10h00m00s';

function fill() {
    store.clear();
    store.set('rabbit_mirror_independent_outputs_v1', JSON.stringify({
        [`${A}:3:0:abc`]: { html: '<details>甲</details>', ts: 1 },
        [`${A}:5:0:abc`]: { html: '<details>乙旧</details>', ts: 1 },
        ['chat:阿竹 - 2026-02-02@10h00m00s:1:0:abc']: { html: '<details>丙</details>', ts: 1 },
        ['chat:不存在的聊天:1:0:abc']: { html: '<details>丁</details>', ts: 1 },
    }));
    store.set('rabbit_mirror_independent_history_v1', JSON.stringify({ slots: { [`${A}:3:0:abc`]: [{ html: '<details>甲旧</details>', ts: 1 }, { html: '<details>甲</details>', ts: 2 }] } }));
    store.set('rabbit_mirror_face_swipes_v1', JSON.stringify({ schema: 1, faces: { [`${A}:3:0\u00000`]: { versions: [{ html: '<details>甲旧</details>' }, { html: '<details>甲</details>' }] } } }));
    store.set('rabbitMirror:image:v1:images:owner:tok1:scope:chat%3Ax:0:h', JSON.stringify({ version: 1, current: { path: '/a.png' }, history: [{ path: '/b.png' }], owner: { chat: '阿岩 - 2026-01-01@10h00m00s' } }));
    store.set('rabbitMirror:image:v1:images:owner:tok2:scope:chat%3Ax:0:h', JSON.stringify({ version: 1, current: { url: 'data:image/png;base64,AAAA' }, history: [], owner: { chat: '阿岩 - 2026-01-01@10h00m00s' } }));
}

test('only copies the other chat file really holds are planned; current chat and unknown chats are left alone', async () => {
    fill();
    const plan = await mod.scanAllChatsForCleanup(ctx);
    assert.equal(plan.chats, 2);
    assert.equal(plan.checked, 1);
    assert.equal(plan.unreadable, 1);
    const kinds = plan.items.map(item => `${item.kind}:${item.slot || item.key}`).sort();
    assert.deepEqual(kinds, [
        `history:${A}:3:0:abc`, `image:rabbitMirror:image:v1:images:owner:tok1:scope:chat%3Ax:0:h`, `output:${A}:3:0:abc`, `swipe:${A}:3:0\u00000`,
    ].sort());
    assert.ok(plan.freeable > 0);
});

test('applying removes exactly those, and keeps the newest history entry, data-only pictures and unmatched records', async () => {
    fill();
    const plan = await mod.scanAllChatsForCleanup(ctx);
    const freed = mod.applyAllChatsCleanup(plan);
    assert.ok(freed > 0);
    const outputs = JSON.parse(store.get('rabbit_mirror_independent_outputs_v1'));
    assert.deepEqual(Object.keys(outputs).sort(), [`${A}:5:0:abc`, 'chat:阿竹 - 2026-02-02@10h00m00s:1:0:abc', 'chat:不存在的聊天:1:0:abc'].sort());
    assert.equal(JSON.parse(store.get('rabbit_mirror_independent_history_v1')).slots[`${A}:3:0:abc`].length, 1);
    assert.equal(store.has('rabbitMirror:image:v1:images:owner:tok1:scope:chat%3Ax:0:h'), false);
    assert.equal(store.has('rabbitMirror:image:v1:images:owner:tok2:scope:chat%3Ax:0:h'), true);
    assert.deepEqual(Object.keys(JSON.parse(store.get('rabbit_mirror_face_swipes_v1')).faces), []);
});

test('a record changed after the scan is not removed', async () => {
    fill();
    const plan = await mod.scanAllChatsForCleanup(ctx);
    const outputs = JSON.parse(store.get('rabbit_mirror_independent_outputs_v1'));
    outputs[`${A}:3:0:abc`].html = '<details>甲改</details>';
    store.set('rabbit_mirror_independent_outputs_v1', JSON.stringify(outputs));
    mod.applyAllChatsCleanup(plan);
    assert.ok(JSON.parse(store.get('rabbit_mirror_independent_outputs_v1'))[`${A}:3:0:abc`]);
});

test('a deleted-floor marker, a different original version, or switching into that chat all keep the local copy', async () => {
    fill();
    files['阿岩 - 2026-01-01@10h00m00s'][0].chat_metadata.rabbit_mirror_independent_outputs_v2.owners['7:0'] = { deleted: true };
    const outputs = JSON.parse(store.get('rabbit_mirror_independent_outputs_v1'));
    outputs[`${A}:7:0:abc`] = { html: '<details>戊</details>', ts: 1 };
    outputs[`${A}:3:0:abc`].initialHtml = '<details>甲最初</details>';
    store.set('rabbit_mirror_independent_outputs_v1', JSON.stringify(outputs));
    const plan = await mod.scanAllChatsForCleanup(ctx);
    const slots = plan.items.filter(item => item.kind === 'output').map(item => item.slot);
    assert.deepEqual(slots, [], '删过楼层的标记、原始版本对不上的都不删');
    fill();
    const again = await mod.scanAllChatsForCleanup(ctx);
    assert.ok(again.items.length > 0);
    mod.applyAllChatsCleanup(again, { ...ctx, chatId: '阿岩 - 2026-01-01@10h00m00s' });
    assert.ok(JSON.parse(store.get('rabbit_mirror_independent_outputs_v1'))[`${A}:3:0:abc`], '统计后切进了这个聊天：不删');
    delete files['阿岩 - 2026-01-01@10h00m00s'][0].chat_metadata.rabbit_mirror_independent_outputs_v2.owners['7:0'];
});
