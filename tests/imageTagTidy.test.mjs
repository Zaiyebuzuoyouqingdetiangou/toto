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
    // 所有格不拆；跨逗号的权重组整行不动；粘着的几个人数标签都拆出来。
    assert.equal(tidyImageTags("1 girl's hand, close-up"), "1 girl's hand, close-up");
    assert.equal(tidyImageTags('1.2::red hair, 1 girl, smile::, park'), '1.2::red hair, 1 girl, smile::, park');
    assert.equal(tidyImageTags('park, 1boy 1girl piggyback'), '1boy, 1girl, park, piggyback');
    // 单提示词里的人物行：名字留在最前面。
    assert.equal(tidyImageTags('Alice: long hair, 1 girl, smile'), 'Alice: 1girl, long hair, smile');
});

test('payload: tag fields tidied, natural-language fields untouched', () => {
    const nl = '日间，气派的古代商会大堂柜台前，少年背着一位女子。';
    const out = tidyImagePayload({
        prompt: '1boy, 1girl piggyback, market', nl,
        flatPrompt: `1boy, 1girl piggyback, market\n${nl}\n阿岩: 1boy, black hair`,
        characters: [{ name: '阿雪', tag: '1 girl, long black hair', nl: '冷白肤色' }],
    }, { promptIsTags: true, flatTagLines: 'first' });
    assert.equal(out.prompt, '1boy, 1girl, piggyback, market');
    assert.equal(out.nl, nl);
    assert.equal(out.flatPrompt.split('\n')[0], '1boy, 1girl, piggyback, market');
    assert.equal(out.flatPrompt.split('\n')[1], nl);
    assert.equal(out.characters[0].tag, '1girl, long black hair');
    assert.equal(out.characters[0].nl, '冷白肤色');
    const tags = tidyImagePayload({ prompt: 'bed, 1girl', flatPrompt: 'bed, 1girl, 1 boy', characters: [] }, { flatTagLines: 'all' });
    assert.equal(tags.flatPrompt, '1girl, 1boy, bed');
});

test('payload: each person line is tidied on its own, natural language is never tidied', () => {
    // 标签写法的单提示词：两个人都长发，第二个人的 long hair 不能被当成重复删掉。
    const flat = 'park, bench, sunset\nAlice: 1girl, long hair, smile\nBob: 1boy, long hair, smile';
    assert.equal(tidyImagePayload({ prompt: 'park', flatPrompt: flat, characters: [] }, { flatTagLines: 'all' }).flatPrompt, flat);
    // 生图 LLM 的 NAI 5 画面描述、没写标签行时退回的自然语言：不动。
    const prose = 'Night, rain, 1 girl under an umbrella, neon reflections\nShe looks back at Bob';
    const kept = tidyImagePayload({ prompt: prose, flatPrompt: prose, characters: [] }, { promptIsTags: false, flatTagLines: 'none' });
    assert.equal(kept.prompt, prose);
    assert.equal(kept.flatPrompt, prose);
});

test('a leading weight group with a space after the colon is not mistaken for a name label', async () => {
    const { tidyImageTags } = await import('../src/imageTagTidy.js');
    assert.equal(tidyImageTags('(red hair: 1.2), 1girl, smile'), '1girl, (red hair: 1.2), smile');
});

test('a name label with a parenthesised suffix is still a name label', async () => {
    const { tidyImageTags } = await import('../src/imageTagTidy.js');
    assert.equal(tidyImageTags('Alice (young): long hair, 1girl, red eyes'), 'Alice (young): 1girl, long hair, red eyes');
});
