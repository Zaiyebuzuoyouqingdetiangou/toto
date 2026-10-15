// 整体设计方案轮换：最近两面用过方案 2（整个媒介一起切换）时，这一面不再指定方案 2。
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawDesignCandidate } from '../src/interactionSampling.js';

test('avoided design picks are never drawn while others remain', () => {
    for (let i = 0; i < 300; i++) {
        assert.equal(drawDesignCandidate({ slots: 2, avoid: [2] }), 1);
        assert.notEqual(drawDesignCandidate({ slots: 3, avoid: [2] }), 2);
    }
    // 全被避开时照常从全部里抽。
    const seen = new Set();
    for (let i = 0; i < 300; i++) seen.add(drawDesignCandidate({ slots: 2, avoid: [1, 2] }));
    assert.deepEqual([...seen].sort(), [1, 2]);
    assert.equal(drawDesignCandidate({ slots: 1, avoid: [1] }), 1);
});

test('ledger remembers which design was implemented', async () => {
    const store = new Map();
    globalThis.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, String(value)), removeItem: key => store.delete(key) };
    const { recordInteractionMethods, recentDesignPicks } = await import('../src/interactionMethodLedger.js');
    const face = (pick, key) => ({ getAttribute: name => name === 'data-rm-vs' ? JSON.stringify({ c: [['a', .3], ['b', .4], ['c', .3]], m: [['点按', '拖动'], ['整幕切换', '切换'], ['按住', '刮开']], pick })
        : name === 'data-rabbit-mirror-owner-key' ? key : null, querySelector: () => null });
    recordInteractionMethods(face(2, 'k1'));
    recordInteractionMethods(face(1, 'k2'));
    assert.deepEqual(recentDesignPicks(2), [2, 1]);
    delete globalThis.localStorage;
});
