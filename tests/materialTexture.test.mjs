import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTextureDescriptor, textureImage, materialTextureRule } from '../src/materialTexture.js';

test('descriptor words are read in any order and fall back to defaults', () => {
    assert.deepEqual(parseTextureDescriptor('淡 条纹 横 细'), { grain: '细', direction: '横', shape: '条纹', strength: '淡' });
    assert.deepEqual(parseTextureDescriptor('看不懂的词'), { grain: '中', direction: '无', shape: '点', strength: '淡' });
});

test('textures are generated, small, and vary with the seed', () => {
    const a = textureImage(parseTextureDescriptor('中 无 纤维 淡'), 'face-a');
    const b = textureImage(parseTextureDescriptor('中 无 纤维 淡'), 'face-b');
    assert.match(a.image, /^url\("data:image\/svg\+xml,/);
    assert.ok(a.image.length < 1400, `texture is ${a.image.length} chars`);
    assert.notEqual(a.image, b.image);
    assert.equal(a.size, '170px');
});

test('the prompt rule is only sent when the switch is on', () => {
    assert.equal(materialTextureRule({ materialTextureEnabled: false }), '');
    assert.equal(materialTextureRule({}), '');
    const rule = materialTextureRule({ materialTextureEnabled: true });
    assert.match(rule, /data-rm-texture="粗细 方向 形状 浓淡"/);
    assert.ok(rule.length < 320, `rule is ${rule.length} chars`);
    // 开关打开就每面写一处，不再给「不加」的退路。
    assert.match(rule, /每个 HTML 面/);
    assert.doesNotMatch(rule, /可选|不加/);
    // 不列举材质名（纸、布、木……），免得模型只在这几种里挑。
    assert.doesNotMatch(rule, /纸|布|木|毛绒|金属/);
});
