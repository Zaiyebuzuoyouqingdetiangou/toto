import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/featureRuntime.mjs';

const rt = createRuntime(fileURLToPath(new URL('..', import.meta.url)));
const { serialPaletteExecutionReminder: reminder } = await rt.load('src/serialPaletteContext.js');
const target = { presentationMode: 'html', faceIndex: 2, faceCount: 3 };
const observation = (faceIndex = 0, palette = {}) => ({ faceIndex, presentationMode: 'html',
    paletteFingerprint: { confidence: .8, mainColors: ['#123a70'], contentSurfaceColors: ['#6e2856'], ...palette } });

test('serial color context names actual main and carrier colors using the existing hue classifier', () => {
    const value = reminder([observation()], target);
    assert.match(value, /第1面：主背景#123a70，主承载#6e2856，蓝／粉色族/);
    assert.match(value, /不是本面配色模板/);
    assert.match(value, /用户明确配色、原条目要求与形式固有材质优先/);
});

test('unknown colors, low confidence, text, pure-order, and own-face observations are not promoted into facts', () => {
    assert.equal(reminder([
        observation(0, { confidence: .1 }),
        observation(1, { mainColors: ['invalid'], contentSurfaceColors: ['<script>'] }),
        observation(2),
        { ...observation(0), presentationMode: 'text' },
        { ...observation(1), pureOrder: true },
    ], target), '');
    assert.equal(reminder([{ ...observation(0), faceIndex: -1 }], target), '');
    assert.equal(reminder([observation(8)], target), '');
    assert.equal(reminder([observation()], { ...target, presentationMode: 'text' }), '');
    assert.equal(reminder([observation()], { ...target, pureOrder: true }), '');
    assert.equal(reminder([observation()], { ...target, faceCount: 1, faceIndex: 0 }), '');
});

test('serial observations do not quote generated prose, titles, accents, or forged family names', () => {
    const item = { ...observation(0, { mainColors: ['#123a70', '#ff0000'], contentSurfaceColors: ['#6e2856', '#ffffff'], hueFamily: 'INJECT' }),
        title: 'PRIVATE TITLE', html: '<script>PRIVATE CONTENT</script>' };
    const value = reminder([item], target);
    assert.doesNotMatch(value, /PRIVATE|script|INJECT|#ff0000|#ffffff/);
    assert.match(value, /#123a70/);
    assert.match(value, /#6e2856/);
});

test('context is bounded to real sibling faces and observes the current visual tone setting', () => {
    const many = Array.from({ length: 5000 }, (_, i) => observation(i % 5));
    const value = reminder(many, { ...target, faceIndex: 4, faceCount: 5 }, { darkVisualMode: true });
    assert.equal((value.match(/第\d面：/g) || []).length, 4);
    assert.ok(value.length < 500);
    assert.match(value, /保持深色模式/);
    assert.match(reminder([observation()], target, { visualToneMode: 'soft' }), /保持柔和浅色模式/);
    assert.doesNotMatch(reminder([observation()], target, { darkVisualMode: true, visualToneMode: 'soft' }), /保持柔和浅色模式/);
});

test('lower-confidence surfaces and duplicate face observations cannot expand the known palette', () => {
    const value = reminder([observation(0, { confidence: .4 }), observation(0, { mainColors: ['#ffffff'] })], target);
    assert.match(value, /#123a70/);
    assert.doesNotMatch(value, /#6e2856|#ffffff/);
    assert.equal((value.match(/第1面/g) || []).length, 1);
});
