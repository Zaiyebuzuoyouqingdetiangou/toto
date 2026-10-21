// 本机存储满了：插图存档先把旧版本里的长提示词瘦下来再写，图一张不删；当前那张的提示词不动。
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
const images = await import('../src/imageStore.js');

const long = 'x'.repeat(3000);
const record = n => ({ path: `/user/images/${n}.png`, generatedAt: `2026-10-21T00:00:0${n}Z`, prompt: long,
    promptMetadata: { prompt: long, flatPrompt: long, nl: long, characters: [{ name: '阿雪', nl: long }], seed: n, promptFormat: 'nai5-natural' } });

test('a full storage slims old versions and the write goes through; no picture is lost', () => {
    store.clear(); limit = Infinity;
    for (let n = 1; n <= 4; n += 1) images.saveMirrorImage('builtin:c:1:0:0:h', record(n));
    images.saveMirrorImage('builtin:c:2:0:0:h', record(5));
    limit = used() + 1000;
    const saved = images.saveMirrorImage('builtin:c:3:0:0:h', record(6));
    assert.equal(saved.path, '/user/images/6.png');
    const first = images.loadMirrorImage('builtin:c:1:0:0:h');
    assert.equal(first.path, '/user/images/4.png');
    assert.equal(first.promptMetadata.flatPrompt, long);
    assert.deepEqual(first.history.map(entry => entry.path), ['/user/images/1.png', '/user/images/2.png', '/user/images/3.png']);
    assert.equal(first.history[0].promptMetadata.seed, 1);
    assert.equal(first.history[0].promptMetadata.flatPrompt, undefined);
    assert.equal(first.history[0].prompt, undefined);
});

test('nothing to slim: the original error comes back and the old record stays', () => {
    store.clear(); limit = Infinity;
    images.saveMirrorImage('builtin:c:1:0:0:h', record(1));
    limit = used() + 10;
    assert.throws(() => images.saveMirrorImage('builtin:c:9:0:0:h', record(9)), /full/);
    assert.equal(images.loadMirrorImage('builtin:c:1:0:0:h').path, '/user/images/1.png');
    assert.equal(images.loadMirrorImage('builtin:c:9:0:0:h'), null);
});
