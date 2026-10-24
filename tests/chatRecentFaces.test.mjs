// 本机避重记录停在很早以前（存储满写不进去）时，聊天里实际保存的兔子镜扫出来的记录按时间补进近期记录；
// 本机已经有的那一面不重复；没有提供者时照旧只读本机。
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
    get length() { return store.size; }, key: i => [...store.keys()][i] ?? null,
    getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k),
};
const storage = await import('../src/storage.js');
const KEY = 'rabbit_mirror_theater:last_combo:v11';
const old = (n, color) => ({ ts: n * 1000, formatIds: [`6.${n}`], themeIds: [], paletteFingerprint: { mainColors: [color] }, historyId: `h${n}` });

test('stale local history is completed by faces saved in the chat, newest last', () => {
    store.set(KEY, JSON.stringify([old(1, '#F8EFF1'), old(2, '#FAF3F6'), old(3, '#F4ECE6')]));
    storage.setChatRecentFacesProvider(() => [
        { ts: 9_000_000, formatIds: ['5.2.3.1'], themeIds: [], paletteFingerprint: { mainColors: ['#433429'] }, diversityRound: 'chat:a' },
        { ts: 9_100_000, formatIds: ['1.14'], themeIds: [], paletteFingerprint: { mainColors: ['#3A271C'] }, diversityRound: 'chat:b' },
    ]);
    const recent = storage.getRecentDiversityHistory(3);
    assert.deepEqual(recent.map(item => item.paletteFingerprint.mainColors[0]), ['#F4ECE6', '#433429', '#3A271C']);
    assert.equal(storage.getComboHistory(10).length, 5);
    assert.equal(JSON.parse(store.get(KEY)).length, 3, '只读合并，不写回本机');
});

test('a face already recorded locally is not counted twice', () => {
    store.set(KEY, JSON.stringify([old(1, '#F8EFF1'), { ts: 9_000_500, formatIds: ['5.2.3.1'], themeIds: [], paletteFingerprint: { mainColors: ['#433429'] } }]));
    storage.setChatRecentFacesProvider(() => [{ ts: 9_000_000, formatIds: ['5.2.3.1'], themeIds: [], paletteFingerprint: { mainColors: ['#433429'] }, diversityRound: 'chat:a' }]);
    assert.equal(storage.getComboHistory(10).length, 2);
});

test('a provider failure or no provider leaves local history as is', () => {
    store.set(KEY, JSON.stringify([old(1, '#F8EFF1')]));
    storage.setChatRecentFacesProvider(() => { throw new Error('boom'); });
    assert.equal(storage.getComboHistory(10).length, 1);
    storage.setChatRecentFacesProvider(null);
    assert.equal(storage.getRecentDiversityHistory(5).length, 1);
});
