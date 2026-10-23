// 每个形式最标志性的那条玩法：最近没给过时这一面先给它；刚给过就照常随机，不每面都给。
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = { getItem: key => store.has(key) ? store.get(key) : null, setItem: (key, value) => store.set(key, String(value)), removeItem: key => store.delete(key) };
const { drawUsageOffer } = await import('../src/interactionUsageOffer.js');
const { FORMAT_CORE_USAGES, FORMAT_USAGES } = await import('../data/raw/formatUsages.js');

test('every format has a signature usage that is in its own list', () => {
    for (const [id, list] of Object.entries(FORMAT_USAGES)) assert.ok(list.includes(FORMAT_CORE_USAGES[id]), id);
    assert.ok(FORMAT_USAGES['6.2.1'].includes('点对话框出下一句'));
});

test('signature comes first when not offered recently, then rotates out', () => {
    store.clear();
    const combo = { formats: [{ id: '6.2.1', title: '视觉小说', summary: '' }] };
    const first = drawUsageOffer(combo);
    assert.equal(first.usages[0], FORMAT_CORE_USAGES['6.2.1']);
    const second = drawUsageOffer(combo);
    assert.ok(!second.usages.includes(FORMAT_CORE_USAGES['6.2.1']), '刚给过，下一面不再先给');
});
