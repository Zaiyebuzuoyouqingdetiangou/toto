// 内置生图人物外貌：换衣服只去衣着那几个词、来源按项补、标签合并只去冲突的词、摘取不过窄、长条目不截坏、生图 LLM 漏写标签不丢人。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { readCharacterWorldBookContext, appearanceFromCast } from '../src/characterWorldBook.js';
import { parseImagePlan } from '../src/imagePlan.js';

const src = readFileSync(new URL('../src/builtinImage.js', import.meta.url), 'utf8');
const chunk = src.slice(src.indexOf('const TAG_HUE'), src.indexOf('function storageKey'))
    + src.slice(src.indexOf('// 衣着、发型：这一幕穿什么'), src.indexOf('async function withCardAppearance'));
const context = vm.createContext({});
vm.runInContext(`${chunk}\nglobalThis.T = { withoutSceneText, mergeTagLists, fillLooksFrom, SCENE_KINDS };`, context);
const { withoutSceneText, mergeTagLists, fillLooksFrom, SCENE_KINDS } = context.T;
const clothing = [SCENE_KINDS.find(kind => kind.name === 'clothing')];
const hairstyle = [SCENE_KINDS.find(kind => kind.name === 'hairstyle')];

test('scene clothing removes only the clothing words, not the skin and mole in the same sentence', () => {
    assert.equal(withoutSceneText('穿白裙、雪白皮肤、眼下红痣', clothing), '雪白皮肤、眼下红痣');
    assert.equal(withoutSceneText('身穿白裙雪白皮肤眼下红痣', clothing), '雪白皮肤眼下红痣');
    assert.match(withoutSceneText('白裙衬得皮肤雪白，眼下红痣', clothing), /皮肤雪白.*眼下红痣/);
    assert.equal(withoutSceneText('肤色白皙，常穿黑色劲装。', clothing), '肤色白皙');
    const english = withoutSceneText('She wears a white dress. Snow-white skin and a red mole under the eye.', clothing);
    assert.match(english, /Snow-white skin/);
    assert.match(english, /red mole/);
    assert.doesNotMatch(english, /dress/);
    assert.equal(withoutSceneText('Black hair, wearing a white dress with pale skin.', clothing), 'Black hair, pale skin.');
    assert.equal(withoutSceneText('黑色长发常束成马尾，粉色眼睛', hairstyle), '黑色长发，粉色眼睛');
    assert.equal(withoutSceneText('扎着高马尾，眼下泪痣', hairstyle), '眼下泪痣');
});

test('clothing removal does not eat colour, skin or verb words right before the garment', () => {
    assert.equal(withoutSceneText('肌肤雪白白裙', clothing), '肌肤雪白');
    assert.equal(withoutSceneText('黑发红裙', clothing), '黑发');
    assert.equal(withoutSceneText('金发碧眼白衬衫', clothing), '金发碧眼');
    assert.equal(withoutSceneText('皮肤白皙身形纤长青衫', clothing), '皮肤白皙身形纤长');
    for (const [input, output] of [['黑发深红长裙', '黑发'], ['碧眼浅蓝色长裙', '碧眼'], ['黑发红白长裙', '黑发'], ['黑发大红长裙', '黑发'], ['金发纯白长裙', '金发'], ['银发月白长衫', '银发'], ['眸色浅蓝白裙', '眸色浅蓝'], ['金发白色的长裙', '金发'], ['眼睛碧绿白裙', '眼睛碧绿'], ['头发乌黑长裙', '头发乌黑'], ['眼眸湛蓝长裙', '眼眸湛蓝'], ['瞳孔金黄红裙', '瞳孔金黄'], ['发丝银白黑袍', '发丝银白'], ['蓝眸深红长裙', '蓝眸']]) {
        assert.equal(withoutSceneText(input, clothing), output, input);
    }
    assert.match(withoutSceneText('眼睛是浅蓝色的长裙', clothing), /浅蓝色/);
    assert.match(withoutSceneText('皮肤白皙身形纤长青衫', clothing), /身形纤长/);
    assert.doesNotMatch(withoutSceneText('看着白裙，黑发', clothing), /^看$|，看|看，/);
    assert.match(withoutSceneText('穿着白裙与同袍并肩', clothing), /同袍/);
    const english = withoutSceneText('Silver hair, blue eyes, wearing a black coat', clothing);
    assert.equal(english, 'Silver hair, blue eyes');
});

test('looks are filled per field: card hair only does not stop the world book filling eyes, skin and mole', () => {
    const person = { name: '阿雪', text: '蓝色眼睛，穿着红衣在雪中回眸', modelTag: 'blue eyes, red dress' };
    fillLooksFrom(person, '黑发。', '人设');
    assert.deepEqual([...person.looksFields], ['hair']);
    fillLooksFrom(person, '阿雪：一头银色长发，浅粉色的眼睛，皮肤雪白，眼下一颗泪痣。常穿白裙。', '世界书');
    assert.match(person.text, /浅粉色的眼睛/);
    assert.match(person.text, /皮肤雪白/);
    assert.match(person.text, /泪痣/);
    // 发色以靠前的角色卡为准，世界书写的银发不再补；模型写错的蓝眼睛被世界书的粉眼睛顶掉；这一幕的红衣照留。
    assert.doesNotMatch(person.text, /银色/);
    assert.doesNotMatch(person.text, /蓝色眼睛/);
    assert.match(person.text, /红衣/);
    assert.doesNotMatch(person.text, /白裙/);
    assert.equal(person.modelTag, 'red dress');
    assert.equal(person.looksSource, '人设＋世界书');
});

test('a later source that only repeats already-filled fields changes nothing', () => {
    const person = { name: '阿岩', text: '', modelTag: '', looksFields: ['hair', 'eye'], looksSource: '建档' };
    assert.equal(fillLooksFrom(person, '红发，金色眼睛。', '世界书'), false);
    assert.equal(person.looksSource, '建档');
});

test('sentences that are not looks are not added, and plot sentences do not claim a field', () => {
    const person = { name: '阿竹', text: '', modelTag: '', looksFields: ['hair'], looksSource: '建档' };
    fillLooksFrom(person, '黑发，性格温柔，眼睛一亮，她脸红了，眼睛浅粉色。', '世界书');
    assert.doesNotMatch(person.text, /性格|一亮|脸红/);
    assert.match(person.text, /眼睛浅粉色/);
    assert.ok(person.looksFields.includes('eye'));
});

test('a library person with hair and eyes still gets missing skin and marks, but nothing that repeats hair or eyes', () => {
    const person = { name: '阿岩', text: 'black hair, red eyes', modelTag: '', looksFields: ['hair', 'eye'], looksSource: '建档' };
    fillLooksFrom(person, '银发，金色眼睛，背景复杂。', '世界书');
    assert.equal(person.text, 'black hair, red eyes');
    fillLooksFrom(person, '左眼下一颗泪痣。', '世界书');
    assert.match(person.text, /泪痣/);
});

test('tag merge keeps the non-conflicting words of a tag', () => {
    assert.equal(mergeTagLists('black hair', 'long straight black hair, red dress'), 'black hair, long straight hair, red dress');
    assert.equal(mergeTagLists('black hair, long hair', 'very long white hair'), 'black hair, long hair');
    assert.equal(mergeTagLists('pink eyes', 'big blue eyes'), 'pink eyes, big eyes');
    assert.equal(mergeTagLists('pink eyes', 'heterochromia, (blue eyes:1.2)'), 'pink eyes');
});

test('appearance extraction collects standalone skin, eye and mole sentences beyond three sentences', () => {
    const cast = JSON.stringify({ book: '书', title: '阿竹', content: '阿竹是城南书铺的少东家。黑发。眼睛浅粉。皮肤雪白。身材纤瘦。左眼下有一颗泪痣。平时爱看书。' });
    const looks = appearanceFromCast(cast, '阿竹');
    for (const word of ['黑发', '眼睛浅粉', '皮肤雪白', '身材纤瘦', '泪痣']) assert.match(looks, new RegExp(word));
    assert.doesNotMatch(looks, /爱看书/);
    const prose = JSON.stringify({ book: '书', title: '阿竹', content: '阿竹皮肤白皙。那天她脸红了。眼睛一亮。' });
    assert.doesNotMatch(appearanceFromCast(prose, '阿竹'), /脸红|一亮/);
    // 两本书里都有这个人的条目：只用第一条，不把两种写法拼在一起。
    const two = [JSON.stringify({ book: '甲', title: '阿松', content: '阿松：黑发。' }), JSON.stringify({ book: '乙', title: '阿松', content: '阿松：白发。' })].join('\n');
    assert.equal(appearanceFromCast(two, '阿松'), '阿松：黑发。');
});

test('one oversized world-book entry is trimmed to a valid JSON row, so its looks can still be read', async t => {
    t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected network'); });
    const content = '阿松：' + '旧事'.repeat(3000) + '阿松生得高挑，墨绿色眼睛，皮肤偏白。' + '往事'.repeat(3000);
    const book = { name: '书', entries: [{ content, enabled: true, comment: '阿松', keys: ['阿松'] }] };
    const ctx = { characterId: 0, characters: [{ name: '甲', data: { character_book: book } }] };
    const cast = await readCharacterWorldBookContext(ctx, { focusText: '阿松', onlyMentioned: true, maxChars: 4000 });
    const rows = cast.text.split('\n').filter(line => line.startsWith('{'));
    assert.ok(rows.length >= 1);
    for (const line of rows) assert.doesNotThrow(() => JSON.parse(line));
    assert.match(appearanceFromCast(cast.text, '阿松'), /墨绿色眼睛/);
});

test('image LLM plan keeps a person with natural-language looks but no English tag (NAI 5 only)', () => {
    const plan = parseImagePlan(JSON.stringify({ prompt: '2girls', characters: [{ name: '阿雪', tag: '', nl: '黑发，浅粉色眼睛' }, { name: '阿岩', tag: 'red hair' }], promptFormat: 'nai5-natural' }));
    assert.deepEqual(plan.characters.map(person => person.name), ['阿雪', '阿岩']);
    const tagsPlan = parseImagePlan(JSON.stringify({ prompt: '2girls', characters: [{ name: '阿雪', tag: '', nl: '黑发' }, { name: '阿岩', tag: 'red hair' }], promptFormat: 'nai45-tags' }));
    assert.deepEqual(tagsPlan.characters.map(person => person.name), ['阿岩']);
    // 模型没回报写法时，按这次请求的写法判断。
    const echoless = parseImagePlan(JSON.stringify({ prompt: '2girls', characters: [{ name: '阿雪', tag: '', nl: '黑发' }] }), { promptFormat: 'nai45-tags' });
    assert.deepEqual(echoless.characters, []);
});
