import test from 'node:test';
import assert from 'node:assert/strict';

const store = {};
globalThis.localStorage = { getItem: key => store[key] ?? null, setItem: (key, value) => { store[key] = String(value); } };
const M = await import('../src/interactionMethods.js');

test('every driver belongs to exactly one big category', () => {
    const keys = Object.keys(M.DRIVER_METHODS);
    for (const key of keys) {
        const owners = Object.values(M.DRIVER_FAMILIES).filter(family => family.drivers.includes(key));
        assert.equal(owners.length, 1, key);
    }
});

test('an offer never holds two drivers of the same big category', () => {
    for (let round = 0; round < 400; round += 1) {
        for (const key of Object.keys(store)) delete store[key];
        const usages = round % 2 ? ['撕下联系电话', '贴上新的', '拖动进度'] : [];
        const offer = M.drawDriverOffer({ usages });
        const families = offer.map(M.driverFamilyOf);
        assert.equal(new Set(families).size, families.length, offer.join(','));
        assert.equal(offer.length, 3);
    }
});

test('format usages come first and the drag category is one slot', () => {
    for (const key of Object.keys(store)) delete store[key];
    const offer = M.drawDriverOffer({ usages: ['撕下联系电话', '贴上新的', '点开目录'] });
    assert.equal(offer[0], 'reveal');
    assert.ok(offer.includes('popup'));
    assert.ok(!offer.includes('drag'), '贴上新的 is the same drag category as 撕下, so it does not take a second slot');
});

test('random fill gives each big category a similar chance', () => {
    const counts = {};
    for (let round = 0; round < 3000; round += 1) {
        for (const key of Object.keys(store)) delete store[key];
        for (const key of M.drawDriverOffer({})) counts[M.driverFamilyOf(key)] = (counts[M.driverFamilyOf(key)] || 0) + 1;
    }
    const values = Object.values(counts);
    assert.equal(values.length, Object.keys(M.DRIVER_FAMILIES).length);
    assert.ok(Math.max(...values) / Math.min(...values) < 1.3, JSON.stringify(counts));
});
