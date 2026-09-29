import assert from 'node:assert/strict';
import test from 'node:test';
import { PRESENTATION_FORMATS } from '../data/structured/presentationIndex.js';
import { expandShuffledOptions, resolvePresentationRaw } from '../data/raw/rawSegmentLookup.js';

test('option lists are expanded without markers and keep every option', () => {
    const text = '可以：⟪甲｜乙｜丙｜丁⟫……';
    for (let round = 0; round < 50; round += 1) {
        const out = expandShuffledOptions(text);
        assert.doesNotMatch(out, /[⟪⟫｜]/);
        const options = out.slice(3, -2).split('、').sort();
        assert.deepEqual(options, ['丁', '丙', '乙', '甲'].sort());
    }
});

test('marked presentation entries never leak markers into prompt raw text', () => {
    const marked = PRESENTATION_FORMATS.filter(item => String(item.raw || '').includes('⟪'));
    assert.ok(marked.length >= 10);
    for (const item of [...marked, PRESENTATION_FORMATS.find(item => item.id === '10.2')]) {
        assert.doesNotMatch(resolvePresentationRaw(item), /[⟪⟫｜]/, item.id);
    }
});

test('option order varies between lookups', () => {
    const item = PRESENTATION_FORMATS.find(entry => entry.id === '10.2.24');
    const seen = new Set();
    for (let round = 0; round < 60; round += 1) seen.add(resolvePresentationRaw(item));
    assert.ok(seen.size > 1);
});
