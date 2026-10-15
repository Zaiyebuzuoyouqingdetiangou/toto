// 交给生图前把标签理一遍：人数和性别放最前、粘在一起的拆开、「1 girl」写成「1girl」、重复去掉；自然语言不动。
import test from 'node:test';
import assert from 'node:assert/strict';
import { tidyImageTags, tidyImagePayload } from '../src/imageTagTidy.js';

test('count tags are split out, normalised and moved to the front', () => {
    // 用户发来的难看那张：1girl 和 piggyback 粘在一起。
    assert.equal(tidyImageTags('1boy, 1girl piggyback, sunny ancient market hall, martial artist, smiling, fangs, broadsword, abacus, warm daylight, high pony tail'),
        '1boy, 1girl, piggyback, sunny ancient market hall, martial artist, smiling, fangs, broadsword, abacus, warm daylight, high pony tail');
    // 好看的两张本来就干净：不变。
    const good = '1boy, 1girl, couple, close-up, high ponytail, black and red hanfu, opulent treasury interior, whispering, tender expression, daylight, golden hour';
    assert.equal(tidyImageTags(good), good);
    // 角色栏里的「1 girl」写成「1girl」；人数标签不在开头的挪到开头。
    assert.equal(tidyImageTags('1 girl, long straight black hair, blunt bangs'), '1girl, long straight black hair, blunt bangs');
    assert.equal(tidyImageTags('close-up, bed, 1boy, 1girl, 1boy'), '1boy, 1girl, close-up, bed');
    assert.equal(tidyImageTags('2 girls, 1 boys'), '2girls, 1boy');
    assert.equal(tidyImageTags('6+boys, crowd'), '6+boys, crowd');
});

test('weights, natural language and look-alikes are left alone', () => {
    assert.equal(tidyImageTags('1.2::kiki_(re_6xxx)_, 1990s (style)'), '1.2::kiki_(re_6xxx)_, 1990s (style)');
    assert.equal(tidyImageTags('{1girl}, solo'), '{1girl}, solo');
    const english = '1boy, 1girl, young swordsman holding a girl wrapped in a soft cape against his chest inside an opulent treasure chamber, sunlight streaming through wooden lattice windows, the handsome youth with messy high ponytail leaning close to whisper into her ear';
    assert.equal(tidyImageTags(english), english, 'comma-joined English sentences are prose, not tags');
    const chinese = '日间，气派的古代商会大堂柜台前, 1girl 背着';
    assert.equal(tidyImageTags(chinese), chinese);
    assert.equal(tidyImageTags('girlfriend, boyish'), 'girlfriend, boyish');
});

test('payload: tag fields tidied, natural-language fields untouched', () => {
    const nl = '日间，气派的古代商会大堂柜台前，少年背着一位女子。';
    const out = tidyImagePayload({
        prompt: '1boy, 1girl piggyback, market', nl,
        flatPrompt: `1boy, 1girl piggyback, market\n${nl}\n方祁洛: 1boy, black hair`,
        characters: [{ name: '纪时卿', tag: '1 girl, long black hair', nl: '冷白肤色' }],
    });
    assert.equal(out.prompt, '1boy, 1girl, piggyback, market');
    assert.equal(out.nl, nl);
    assert.equal(out.flatPrompt.split('\n')[0], '1boy, 1girl, piggyback, market');
    assert.equal(out.flatPrompt.split('\n')[1], nl);
    assert.equal(out.characters[0].tag, '1girl, long black hair');
    assert.equal(out.characters[0].nl, '冷白肤色');
    const tags = tidyImagePayload({ prompt: 'bed, 1girl', flatPrompt: 'bed, 1girl, 1 boy', characters: [] }, { tagsOnly: true });
    assert.equal(tags.flatPrompt, '1girl, 1boy, bed');
});
