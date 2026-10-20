// 多面镜子在归属（楼层、swipe）写上之前就开始画：图存在「楼层空」的键下，写上归属后要能找回，不再重画。
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
    get length() { return store.size; },
    key: index => [...store.keys()][index] ?? null,
    getItem: key => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)); },
    removeItem: key => { store.delete(key); },
};
const images = await import('../src/imageStore.js');

test('parse keeps colons in the chat name', () => {
    assert.deepEqual(images.parseBuiltinImageKey('builtin:角色 - 2026:10:20:12:0:1:abc'),
        { chat: '角色 - 2026:10:20', mes: '12', swipe: '0', index: '1', hash: 'abc' });
    assert.equal(images.parseBuiltinImageKey('other:x'), null);
});

test('keys match when one side has no floor yet', () => {
    assert.equal(images.builtinImageKeysCompatible('builtin:c:12:0:0:h', 'builtin:c:::0:h'), true);
    assert.equal(images.builtinImageKeysCompatible('builtin:c:12:0:0:h', 'builtin:c:12::0:h'), true);
    assert.equal(images.builtinImageKeysCompatible('builtin:c:12:0:0:h', 'builtin:c:13:0:0:h'), false);
    assert.equal(images.builtinImageKeysCompatible('builtin:c:12:0:0:h', 'builtin:c:12:1:0:h'), false);
    assert.equal(images.builtinImageKeysCompatible('builtin:c:12:0:0:h', 'builtin:c:12:0:1:h'), false);
    assert.equal(images.builtinImageKeysCompatible('builtin:c:12:0:0:h', 'builtin:c:12:0:0:g'), false);
    assert.equal(images.builtinImageKeysCompatible('builtin:c:12:0:0:h', 'builtin:d:12:0:0:h'), false);
    // 写上归属的那一面记「chat:聊天名」，没写上的直接是聊天名：同一个聊天
    assert.equal(images.builtinImageKeysCompatible('builtin:chat:角色 - 2026:12:0:0:h', 'builtin:角色 - 2026:::0:h'), true);
    assert.equal(images.builtinImageKeysCompatible('builtin:chat:a:12:0:0:h', 'builtin:b:::0:h'), false);
});

test('finds the saved picture under a compatible key, preferring the exact floor', () => {
    store.clear();
    images.saveMirrorImage('builtin:c:::0:h', { url: '/user/images/early.png' });
    assert.equal(images.findCompatibleBuiltinImageKey('builtin:c:12:0:0:h'), 'builtin:c:::0:h');
    images.saveMirrorImage('builtin:c:12:::0:h'.replace(':::', '::'), { url: '/user/images/half.png' });
    images.saveMirrorImage('builtin:c:13:0:0:h', { url: '/user/images/other-floor.png' });
    assert.equal(images.findCompatibleBuiltinImageKey('builtin:c:12:0:0:h'), 'builtin:c:12::0:h');
    assert.equal(images.findCompatibleBuiltinImageKey('builtin:c:12:0:0:zz'), '');
});
