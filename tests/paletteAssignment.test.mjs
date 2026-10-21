// 配色避重改成逐面点名色族：避开近三轮用过的，同一批各面互不相同；用户在视觉偏好里写了颜色就不点名。
import test from 'node:test';
import assert from 'node:assert/strict';
import { assignFaceHueFamilies, hueFamilyInstruction, userDirectsColor } from '../src/paletteAssignment.js';

test('each HTML face gets a distinct family not used in the last rounds; text faces get none', () => {
    const faces = [{ html: true }, { html: false }, { html: true }, { html: true }];
    for (let seed = 0; seed < 20; seed += 1) {
        let n = seed;
        const random = () => ((n = (n * 9301 + 49297) % 233280) / 233280);
        const out = assignFaceHueFamilies(faces, ['green', 'orange'], random);
        assert.equal(out[1], '');
        const picked = out.filter(Boolean);
        assert.equal(picked.length, 3);
        assert.equal(new Set(picked).size, 3, '同一批互不相同');
        assert.ok(!picked.includes('green') && !picked.includes('orange'), '避开近三轮');
    }
});

test('when more faces than fresh families, the oldest used family is reused last', () => {
    const faces = Array.from({ length: 5 }, () => ({ html: true }));
    const out = assignFaceHueFamilies(faces, ['green', 'orange', 'blue', 'purple', 'pink', 'red'], () => 0);
    assert.equal(new Set(out).size, 5);
    assert.ok(out.includes('cyan') && out.includes('yellow'));
});

test('instruction text and user color preference', () => {
    assert.match(hueFamilyInstruction('green'), /绿色族/);
    assert.equal(hueFamilyInstruction(''), '');
    assert.equal(userDirectsColor({ visualPromptEditingEnabled: true, visualPrompt: '整体偏暖色，米黄纸面' }), true);
    assert.equal(userDirectsColor({ visualPromptEditingEnabled: true, visualPrompt: '手绘线稿，留白多' }), false);
    assert.equal(userDirectsColor({ visualPromptEditingEnabled: false, visualPrompt: '偏暖色' }), false);
});
