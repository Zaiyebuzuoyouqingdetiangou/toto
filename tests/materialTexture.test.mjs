import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTextureDescriptor, textureImage, materialTextureRule } from '../src/materialTexture.js';

test('descriptor words are read in any order and fall back to defaults', () => {
    assert.deepEqual(parseTextureDescriptor('淡 条纹 横 细'), { material: '', grain: '细', direction: '横', shape: '条纹', strength: '淡', gloss: '哑光' });
    // 认不出的词就是材料名（模型自己写的）；画纹理不看它，只用来记「近几面用过什么」。
    assert.deepEqual(parseTextureDescriptor('旧宣纸 细 横 条纹 淡'), { material: '旧宣纸', grain: '细', direction: '横', shape: '条纹', strength: '淡', gloss: '哑光' });
    assert.deepEqual(parseTextureDescriptor('看不懂的词'), { material: '看不懂的词', grain: '中', direction: '无', shape: '点', strength: '淡', gloss: '哑光' });
});

test('textures are generated, small, and vary with the seed', () => {
    const a = textureImage(parseTextureDescriptor('中 无 纤维 淡'), 'face-a');
    const b = textureImage(parseTextureDescriptor('中 无 纤维 淡'), 'face-b');
    assert.match(a.image, /^url\("data:image\/svg\+xml,/);
    assert.ok(a.image.length < 4000, `texture is ${a.image.length} chars`);
    assert.notEqual(a.image, b.image);
    // 两层大小不同的纹理叠在一起，重复的位置错开。
    assert.equal(a.size, '233px, 170px');
    // 打光：光从左上来，和规则里写的方向一致；不旋转（旋转会出接缝）。
    assert.match(a.image, /feDiffuseLighting/);
    assert.match(a.image, /azimuth='225'/);
    assert.doesNotMatch(textureImage(parseTextureDescriptor('中 斜 条纹 淡'), 'x').image, /rotate/);
});

test('the prompt rule is only sent when the switch is on', () => {
    assert.equal(materialTextureRule({ materialTextureEnabled: false }), '');
    assert.equal(materialTextureRule({}), '');
    const rule = materialTextureRule({ materialTextureEnabled: true });
    assert.match(rule, /data-rm-texture="材料 粗细 方向 形状 浓淡 光泽"/);
    assert.ok(rule.length < 360, `rule is ${rule.length} chars`);
    // 开关打开就每面写一处，不再给「不加」的退路。
    assert.match(rule, /每个 HTML 面/);
    assert.doesNotMatch(rule, /可选|不加/);
    // 不列举材质名（纸、布、木……），免得模型只在这几种里挑。
    assert.doesNotMatch(rule, /纸|布|木|毛绒|金属/);
});

test('very light bases get a shadow-only texture', () => {
    const normal = textureImage(parseTextureDescriptor('中 无 纤维 淡'), 'x');
    const light = textureImage(parseTextureDescriptor('中 无 纤维 淡'), 'x', { shadowOnly: true });
    assert.doesNotMatch(normal.image, /feComponentTransfer/);
    assert.match(light.image, /feComponentTransfer/);
});
