// 插图记录存在那条消息（那一个 swipe）的附加数据里，跟聊天记录一起存；本机存储只做兜底。
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
const freshChat = () => {
    ctx = { chatId: 'chat-a', getCurrentChatId: () => 'chat-a', chatMetadata: { integrity: 'x' }, chat: [
        { mes: '一', extra: {} },
        { mes: '二', extra: {} },
        { mes: '三', swipe_id: 0, swipes: ['甲', '乙'], extra: {}, swipe_info: [{ extra: {} }, { extra: {} }] },
    ] };
};
globalThis.SillyTavern = { getContext: () => ctx };
const images = await import('../src/imageStore.js');
const record = n => ({ path: `/user/images/${n}.png`, generatedAt: `2026-10-23T00:00:0${n}Z`, prompt: '阿雪', promptMetadata: { seed: n } });
const imgs = (extra) => extra?.rabbitMirrorImages || {};

test('a picture is kept on its message and swipe, not in local storage', () => {
    store.clear(); limit = Infinity; freshChat();
    images.saveMirrorImage('builtin:chat:chat-a:2:0:0:h1', record(1));
    assert.equal(imgs(ctx.chat[2].extra)['0:h1'].current.path, '/user/images/1.png');
    // 本机只留一份很小的（防聊天还没存盘就关了 App），没有整张图
    assert.ok(![...store.values()].some(value => value.includes('data:')));
    store.clear();
    assert.equal(images.loadMirrorImage('builtin:chat:chat-a:2:0:0:h1').path, '/user/images/1.png');
});

test('a picture of another swipe lives in that swipe and comes along when the host swaps swipes', () => {
    store.clear(); limit = Infinity; freshChat();
    images.saveMirrorImage('builtin:chat-a:2:1:0:h2', record(2));
    assert.equal(imgs(ctx.chat[2].extra)['0:h2'], undefined);
    assert.ok(imgs(ctx.chat[2].swipe_info[1].extra)['0:h2']);
    // 酒馆切到 swipe 1：把那个 swipe 的附加数据换到消息上
    ctx.chat[2].swipe_id = 1; ctx.chat[2].extra = structuredClone(ctx.chat[2].swipe_info[1].extra);
    assert.equal(images.loadMirrorImage('builtin:chat-a:2:1:0:h2').path, '/user/images/2.png');
});

test('other chats, unknown floors and data:-only pictures fall back to local storage', () => {
    store.clear(); limit = Infinity; freshChat();
    images.saveMirrorImage('builtin:chat:chat-b:1:0:0:h3', record(3));
    images.saveMirrorImage('builtin:chat-a::0:0:h4', record(4));
    images.saveMirrorImage('builtin:chat-a:1:0:0:h5', { url: 'data:image/png;base64,QUFB' });
    assert.equal(store.size, 3);
    assert.deepEqual(Object.keys(imgs(ctx.chat[1].extra)), []);
    limit = 10;
    assert.throws(() => images.saveMirrorImage('builtin:chat:chat-b:1:0:0:h6', record(6)));
    limit = Infinity;
});

test('a data:-only save drops the older picture of the same slot on the message', () => {
    store.clear(); limit = Infinity; freshChat();
    images.saveMirrorImage('builtin:chat-a:1:0:0:h7', record(7));
    images.saveMirrorImage('builtin:chat-a:1:0:0:h7', { url: 'data:image/png;base64,QUFB' });
    assert.equal(imgs(ctx.chat[1].extra)['0:h7'], undefined);
    assert.match(images.loadMirrorImage('builtin:chat-a:1:0:0:h7').url, /^data:/);
});

test('old local records and the 1.77.0 chat-info copies move onto their messages', () => {
    store.clear(); limit = Infinity; freshChat();
    store.set('rabbitMirror:image:v1:images:builtin:chat-a:1:0:0:h8', JSON.stringify({ version: 1, current: record(8), history: [] }));
    store.set('rabbitMirror:image:v1:images:builtin:chat-z:1:0:0:h9', JSON.stringify({ version: 1, current: record(9), history: [] }));
    ctx.chatMetadata.rabbitMirrorImages = { 'builtin:chat:chat-a:0:0:1:hA': { version: 1, current: record(5), history: [] } };
    images.loadMirrorImage('builtin:chat-a:9:0:0:none');
    assert.ok(imgs(ctx.chat[1].extra)['0:h8']);
    assert.ok(imgs(ctx.chat[0].extra)['1:hA']);
    assert.equal(ctx.chatMetadata.rabbitMirrorImages, undefined);
});

test('lookups for floor-less or shifted keys find pictures kept on messages', () => {
    store.clear(); limit = Infinity; freshChat();
    images.saveMirrorImage('builtin:chat-a:2:0:3:hB', record(3));
    assert.equal(images.findShiftedBuiltinImageKey('builtin:chat-a:2:0:1:hB'), 'builtin:chat-a:2:0:3:hB');
    assert.equal(images.findCompatibleBuiltinImageKey('builtin:chat-a::0:3:hB'), 'builtin:chat-a:2:0:3:hB');
});

test('a favourite carries the pictures of its face and lends them when opened from another chat', () => {
    store.clear(); limit = Infinity; freshChat();
    images.saveMirrorImage('builtin:chat:chat-a:2:0:0:hC', record(4));
    const carried = images.mirrorImagesForSlot(2, 0);
    assert.ok(carried['0:hC']);
    assert.equal(carried['0:hC'].current.prompt, undefined, 'favourites carry only what is needed to show the picture');
    store.clear();
    ctx = { chatId: 'chat-z', getCurrentChatId: () => 'chat-z', chatMetadata: { integrity: 'y' }, chat: [{ mes: 'x', extra: {} }] };
    assert.equal(images.loadMirrorImage('builtin:chat:chat-a:2:0:0:hC'), null);
    images.lendMirrorImages('chat:chat-a', 2, 0, carried);
    assert.equal(images.loadMirrorImage('builtin:chat:chat-a:2:0:0:hC').path, '/user/images/4.png');
});

test('nothing is written onto messages while a chat is still loading', () => {
    store.clear(); limit = Infinity; freshChat();
    ctx.chatMetadata = {};
    images.saveMirrorImage('builtin:chat-a:1:0:0:hD', record(6));
    assert.deepEqual(imgs(ctx.chat[1].extra), {});
    assert.equal(store.size, 1);
});

test('a new swipe that copied the previous swipe data does not show or keep the old pictures', () => {
    store.clear(); limit = Infinity; freshChat();
    images.saveMirrorImage('builtin:chat-a:1:0:0:hE', record(1));
    // 酒馆右滑出新 swipe：把当前附加数据整份抄给新 swipe
    ctx.chat[1].swipe_info = [{ extra: structuredClone(ctx.chat[1].extra) }, { extra: structuredClone(ctx.chat[1].extra) }];
    ctx.chat[1].swipe_id = 1; ctx.chat[1].extra = structuredClone(ctx.chat[1].swipe_info[1].extra);
    store.clear();
    assert.equal(images.loadMirrorImage('builtin:chat-a:1:1:0:hE'), null);
    images.saveMirrorImage('builtin:chat-a:1:1:0:hF', record(2));
    assert.deepEqual(Object.keys(imgs(ctx.chat[1].extra)), ['0:hF']);
});
