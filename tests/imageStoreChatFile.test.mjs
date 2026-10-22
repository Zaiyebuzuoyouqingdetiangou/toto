// 插图存档也写进当前聊天的聊天文件：本机这份没了（App 更新、清理数据）照样找得回来，本机满了也不算没存。
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
let limit = Infinity;
const used = () => [...store].reduce((sum, [key, value]) => sum + key.length + value.length, 0);
globalThis.localStorage = {
    get length() { return store.size; },
    key: index => [...store.keys()][index] ?? null,
    getItem: key => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
        const before = store.get(key);
        store.set(key, String(value));
        if (used() > limit) { if (before === undefined) store.delete(key); else store.set(key, before); throw Object.assign(new Error('full'), { name: 'QuotaExceededError' }); }
    },
    removeItem: key => { store.delete(key); },
};
let ctx;
const freshChat = () => { ctx = { chatId: 'chat-a', getCurrentChatId: () => 'chat-a', chat: [{ mes: '一' }, { mes: '二' }, { mes: '三' }], chatMetadata: { integrity: 'x' } }; };
globalThis.SillyTavern = { getContext: () => ctx };
const images = await import('../src/imageStore.js');
const record = n => ({ path: `/user/images/${n}.png`, generatedAt: `2026-10-22T00:00:0${n}Z`, prompt: '阿雪', promptMetadata: { seed: n } });

test('a saved picture lands in the chat file and survives a wiped local store', () => {
    store.clear(); limit = Infinity; freshChat();
    images.saveMirrorImage('builtin:chat:chat-a:2:0:0:h1', record(1));
    assert.ok(ctx.chatMetadata.rabbitMirrorImages['builtin:chat:chat-a:2:0:0:h1']);
    store.clear();
    assert.equal(images.loadMirrorImage('builtin:chat:chat-a:2:0:0:h1').path, '/user/images/1.png');
    assert.ok(store.size >= 1, 'read back into the local cache');
});

test('a full local store does not count as unsaved when the chat file took it', () => {
    store.clear(); freshChat(); limit = 10;
    assert.doesNotThrow(() => images.saveMirrorImage('builtin:chat-a:2:0:0:h2', record(2)));
    limit = Infinity;
    assert.equal(images.loadMirrorImage('builtin:chat-a:2:0:0:h2').path, '/user/images/2.png');
});

test('pictures of another chat, and data:-only pictures, stay local only', () => {
    store.clear(); limit = Infinity; freshChat();
    images.saveMirrorImage('builtin:chat:chat-b:1:0:0:h3', record(3));
    images.saveMirrorImage('builtin:chat-a:1:0:0:h4', { dataUrl: 'data:image/png;base64,AAAA', url: 'data:image/png;base64,AAAA' });
    assert.deepEqual(Object.keys(ctx.chatMetadata.rabbitMirrorImages || {}), []);
    limit = 10;
    assert.throws(() => images.saveMirrorImage('builtin:chat:chat-b:1:0:0:h5', record(5)));
    limit = Infinity;
});

test('keys only in the chat file are found by the compatibility lookups', () => {
    store.clear(); limit = Infinity; freshChat();
    ctx.chatMetadata.rabbitMirrorImages = { 'builtin:chat:chat-a::0:0:h6': { version: 1, current: record(6), history: [] } };
    assert.equal(images.findCompatibleBuiltinImageKey('builtin:chat:chat-a:2:0:0:h6'), 'builtin:chat:chat-a::0:0:h6');
    ctx.chatMetadata.rabbitMirrorImages = { 'builtin:chat:chat-a:2:0:3:h7': { version: 1, current: record(7), history: [] } };
    assert.equal(images.findShiftedBuiltinImageKey('builtin:chat:chat-a:2:0:1:h7'), 'builtin:chat:chat-a:2:0:3:h7');
});

test('pictures that were only local are copied into the chat file on first read', () => {
    store.clear(); limit = Infinity; freshChat();
    store.set('rabbitMirror:image:v1:images:builtin:chat-a:1:0:0:h8', JSON.stringify({ version: 1, current: record(8), history: [] }));
    store.set('rabbitMirror:image:v1:images:builtin:chat-z:1:0:0:h9', JSON.stringify({ version: 1, current: record(9), history: [] }));
    images.loadMirrorImage('builtin:chat-a:9:0:0:none');
    assert.deepEqual(Object.keys(ctx.chatMetadata.rabbitMirrorImages), ['builtin:chat-a:1:0:0:h8']);
});

test('deleting floors moves the chat-file copies too', () => {
    store.clear(); limit = Infinity; freshChat();
    images.saveMirrorImage('builtin:chat-a:2:0:0:hA', record(1));
    images.remapMirrorImageSlots('chat-a', (index, swipe) => (index === 2 ? `1:${swipe}` : `${index}:${swipe}`));
    assert.deepEqual(Object.keys(ctx.chatMetadata.rabbitMirrorImages), ['builtin:chat-a:1:0:0:hA']);
    images.removeMirrorImage('builtin:chat-a:1:0:0:hA');
    assert.deepEqual(Object.keys(ctx.chatMetadata.rabbitMirrorImages), []);
});

test('a full local store keeps a record that holds a data:-only version and still reports the failure', () => {
    store.clear(); limit = Infinity; freshChat();
    images.saveMirrorImage('builtin:chat-a:2:0:0:hD', { url: 'data:image/png;base64,QUFB', generatedAt: 't' });
    limit = used();
    assert.throws(() => images.saveMirrorImage('builtin:chat-a:2:0:0:hD', record(4)));
    limit = Infinity;
    assert.match(images.loadMirrorImage('builtin:chat-a:2:0:0:hD').url, /^data:/);
});

test('keys carried over by a branch or rename are read back from the chat file', () => {
    store.clear(); limit = Infinity; freshChat();
    ctx.chatMetadata.rabbitMirrorImages = { 'builtin:chat:old-name:2:0:0:h7': { version: 1, current: record(7), history: [] } };
    const found = images.findBuiltinImageKeyFromOtherChat('builtin:chat:chat-a:2:0:0:h7');
    assert.equal(found, 'builtin:chat:old-name:2:0:0:h7');
    assert.equal(images.loadMirrorImage(found).path, '/user/images/7.png');
});

test('a data:-only save drops the older chat-file picture of the same key', () => {
    store.clear(); limit = Infinity; freshChat();
    images.saveMirrorImage('builtin:chat-a:2:0:0:hE', record(5));
    images.saveMirrorImage('builtin:chat-a:2:0:0:hE', { url: 'data:image/png;base64,QUFB' });
    assert.equal(ctx.chatMetadata.rabbitMirrorImages['builtin:chat-a:2:0:0:hE'], undefined);
});

test('nothing is read from or written into the empty placeholder metadata of a chat still loading', () => {
    store.clear(); limit = Infinity; freshChat();
    ctx.chatMetadata = {};
    images.saveMirrorImage('builtin:chat-a:2:0:0:hF', record(6));
    assert.equal(ctx.chatMetadata.rabbitMirrorImages, undefined);
});
