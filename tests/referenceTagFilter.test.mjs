// 「跳过的标签」也管角色卡、Persona、世界书这些资料；内置生图只带写了长相的出场人物条目。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readCharacterWorldBookContext } from '../src/characterWorldBook.js';

const source = readFileSync(new URL('../src/independentApi/connection.js', import.meta.url), 'utf8');
const fn = name => {
    const at = source.search(new RegExp(`^(?:export )?function ${name}\\(`, 'm'));
    return source.slice(at, source.indexOf('\n}\n', at) + 3).replace(/^export /, '');
};
const tokenRe = source.match(/^const REFERENCE_TAG_TOKEN_RE=.*$/m)[0];
const strip = new Function('normalizeIndependentContextExcludedTags', [tokenRe, fn('readIndependentMarkupName'), fn('scanIndependentMarkupToken'),
    fn('decodeConfiguredIndependentTagTokens'), fn('stripExcludedTagsFromReference').replace('=independentContextExcludedTagSet()', ''),
    'return stripExcludedTagsFromReference;'].join('\n'))(value => value);
const excluded = new Set(['context', '状态栏']);

test('paired blocks of a skipped tag are removed from reference material', () => {
    assert.equal(strip('外貌：长发。<context>## 【公告栏】标题\n内容</context>后面还在', excluded), '外貌：长发。后面还在');
    assert.equal(strip('&lt;context&gt;范例&lt;/context&gt;留下', excluded), '留下');
    assert.equal(strip('&amp;lt;context&amp;gt;范例&amp;lt;/context&amp;gt;留下', excluded), '留下');
    assert.equal(strip('＜context＞范例＜/context＞留下', excluded), '留下');
    assert.equal(strip('<Context class="a">范例</Context>留', excluded), '留');
    assert.equal(strip('<状态栏>血量</状态栏>阿雪', excluded), '阿雪');
});

test('a lone mention only loses the tag itself, never text around it', () => {
    assert.equal(strip('正文写在 <context> 里，阿雪长发黑眸', excluded), '正文写在  里，阿雪长发黑眸');
    assert.equal(strip('<context>未闭合 后面的字', excluded), '未闭合 后面的字');
    // 前面一句提到、后面才是真正的范例块：只删范例块，中间的设定留着
    assert.equal(strip('正文写在 <context> 里。阿雪长发黑眸。<context>范例</context>尾', excluded), '正文写在  里。阿雪长发黑眸。尾');
    assert.equal(strip('<context/>阿雪长发黑眸。<context>范例</context>尾', excluded), '阿雪长发黑眸。尾');
    // 没写完的标签不往后吞
    assert.equal(strip('用 <context 包住。阿雪身高165 >_< 结束', excluded), '用 <context 包住。阿雪身高165 >_< 结束');
});

test('same-name nesting is removed as a whole', () => {
    assert.equal(strip('<context>外<context>内</context>外层后半</context>尾', excluded), '尾');
    assert.equal(strip('<context>1<context>2<context>3</context>x</context>y</context>z', excluded), 'z');
});

test('untouched text stays byte-for-byte, including indentation around a removed block', () => {
    for (const text of ['<contextual>不动</contextual>', '没有标签 &lt;b&gt; 原样', '  前后空白保留\n\n\n']) {
        assert.equal(strip(text, excluded), text);
    }
    assert.equal(strip('<context>x</context>', new Set()), '<context>x</context>');
    assert.equal(strip('name: 阿雪\n  hair: black\n    eyes: red\n<context>x</context>', excluded), 'name: 阿雪\n  hair: black\n    eyes: red\n');
});

test('many unclosed tags stay fast', () => {
    const big = '<context>阿雪。'.repeat(40000);
    const started = Date.now();
    assert.equal(strip(big, excluded), '阿雪。'.repeat(40000));
    assert.ok(Date.now() - started < 1500);
});

const embedded = entries => ({ characterId: 0, characters: [{ name: '甲', data: { character_book: { name: '书', entries } } }] });

test('image cast leaves out mentioned entries that describe no looks (format, rules, notice boards)', async () => {
    const ctx = embedded([
        { comment: '公告栏格式', key: ['公告栏'], content: '每轮末尾输出 <context>## 【公告栏】标题</context> 格式的帖子。', enabled: true },
        { comment: '阿雪', key: ['阿雪'], content: '阿雪：黑色长发，浅粉色眼睛，眼尾一颗泪痣。', enabled: true },
    ]);
    const cast = await readCharacterWorldBookContext(ctx, { focusText: '公告栏上说阿雪来了', onlyMentioned: true, maxChars: 3000 });
    assert.equal(cast.entryCount, 1);
    assert.match(cast.text, /阿雪/);
    assert.doesNotMatch(cast.text, /公告栏/);
});

test('filterContent runs before an entry is scored and sent', async () => {
    const ctx = embedded([
        { comment: '阿岩', key: ['阿岩'], content: '阿岩：短发，深色皮肤。<context>## 范例帖</context>', enabled: true },
    ]);
    const all = await readCharacterWorldBookContext(ctx, { filterContent: value => strip(value, excluded) });
    assert.equal(all.entryCount, 1);
    assert.doesNotMatch(all.text, /范例帖|context/);
    assert.match(all.text, /深色皮肤/);
    // 整条只有被跳过的标签块：这条不发。
    const only = await readCharacterWorldBookContext(embedded([{ comment: '规则', content: '<context>只有范例</context>', enabled: true }]), { filterContent: value => strip(value, excluded) });
    assert.equal(only.entryCount, 0);
});

test('image cast keeps person entries that only describe clothes, height, or looks in English / traditional script', async () => {
    const people = [
        '阿岩：常穿黑色风衣，戴银框眼镜，左手戴着皮手套。',
        '阿岩，个子很高，一米八五，肩宽腿长，总是一身西装。',
        '阿岩 男 25岁 180cm 西装 金丝眼镜',
        'Appearance: tall and lean, wears a long black coat, a scar across his left cheek.',
        '阿岩：黑色短髮，皮膚黝黑，個子很高。',
        '【外观】阿岩：银色面具，深灰斗篷，样貌清秀。',
        '阿岩圆脸，大眼，双眼皮，娃娃脸。',
    ];
    for (const content of people) {
        const cast = await readCharacterWorldBookContext(embedded([{ comment: '阿岩', key: ['阿岩'], content, enabled: true }]), { focusText: '阿岩来了', onlyMentioned: true, maxChars: 3000 });
        assert.equal(cast.entryCount, 1, content);
    }
    const rule = await readCharacterWorldBookContext(embedded([{ comment: '公告栏格式', key: ['公告栏'], content: '每轮末尾输出一段公告栏帖子，标题用两个井号。', enabled: true }]), { focusText: '公告栏', onlyMentioned: true, maxChars: 3000 });
    assert.deepEqual([rule.entryCount, rule.skippedNoLooks], [0, 1]);
});

test('every reference source sent to the side API goes through the tag filter', () => {
    const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    for (const name of ['independentCharacterContext', 'independentPersonaContext', 'builtinImageAppearanceBlock', 'globalWorldInfoContextView']) {
        assert.match(fn(name), /stripExcludedTagsFromReference/, name);
    }
    const request = read('src/independentApi/request.js');
    assert.match(request, /readCharacterWorldBookContext\(ctx,\{[^}]*filterContent:/);
    assert.match(request, /prepareSelectedMemoryForPrompt\([^;]*filterText:value=>stripExcludedTagsFromReference/);
    const mount = read('src/independentApi/mount.js');
    assert.match(mount, /readCharacterWorldBookContext\(getContext\(\),\{[^}]*filterContent:/);
    assert.match(mount.slice(mount.indexOf('function mirrorImageReferenceSnapshot')), /^[\s\S]{0,600}stripExcludedTagsFromReference/);
    const image = read('src/builtinImage.js');
    assert.match(image, /filterContent: value => connection\.stripExcludedTagsFromReference/);
    assert.match(image, /nl: cleanRef\(/);
});

test('the shared face preparer runs the output filter and keys its cache on the skip list', () => {
    const geometry = readFileSync(new URL('../src/independentApi/geometry.js', import.meta.url), 'utf8');
    const body = geometry.slice(geometry.indexOf('export function prepareIndependentReadyHtml'));
    assert.match(body.slice(0, 5000), /stripExcludedTagsFromFaceOutput\(sanitizeIndependentReadyFragment\(prepared,textAlreadyFiltered\),excludedTags,globalThis\.document,prepared\)/);
    assert.match(body.slice(0, 1200), /JSON\.stringify\(\[\.\.\.excludedTags\]\)/);
});

test('an English sentence that merely mentions a skipped tag is not swallowed', () => {
    const english = new Set(['thinking']);
    assert.equal(strip('Wrap reasoning in <thinking and then answer > Alice has black hair.', english), 'Wrap reasoning in <thinking and then answer > Alice has black hair.');
    assert.equal(strip('<thinking hidden data-x="1">x</thinking>keep', english), 'keep');
});

test('memory world book entries are filtered before the budget cuts them', async () => {
    const { extractMemoryWorldBookMaterial } = await import('../src/memoryWorldBook.js');
    const book = { entries: [{ content: '第1天：阿雪来了。<context>' + '秘密'.repeat(300) + '</context>第2天：去看海。' }] };
    const material = extractMemoryWorldBookMaterial(book, 600, value => strip(value, excluded));
    assert.doesNotMatch(material.text, /秘密/);
    assert.match(material.text, /第2天/);
});

test('world book entries that teach the main model a status-bar format are recognised', () => {
    const isFormat = new Function(`${source.match(/^const OUTPUT_FORMAT_WORDS_RE=.*$/m)[0]}\n${source.match(/^const ST_MACRO_NAMES=.*$/m)[0]}\n${fn('isTemplatePlaceholder')}\n${fn('isOutputFormatInstruction')}\nreturn isOutputFormatInstruction;`)();
    assert.equal(isFormat('<status bar>\n日期:{{日期}}\n- Each tag on its own line\n</status bar>'), true);
    assert.equal(isFormat('Output format:\n[地点: 某处] [时间: 夜]'), true);
    assert.equal(isFormat('【阿雪】黑色长发，浅粉色眼睛，标签：冷淡、寡言。'), false);
    assert.equal(isFormat('某城是一座古都，城中有十二坊。'), false);
    assert.equal(isFormat('{{char}}是{{user}}的师兄，{{char}}常在某城出没。'), false);
    assert.equal(isFormat('每轮回复末尾附上：[日期: {{日期}}] | [地点: {{地点}}]'), true);
    for (const plain of ['城里有一家叫 Status Bar 的酒馆，老板是阿松。', '终端会以 output format 为 JSON 返回结果。', '{{description}} 与 {{personality}} 都写在卡里，{{var::mood}} 影响 {{var::hp}}。', '{{#if x}}阿雪{{/if}}{{else}}阿岩', '{{char_version}} {{user_name}} 某城。']) assert.equal(isFormat(plain), false, plain);
    assert.match(fn('globalWorldInfoContextView'), /filter\(item=>!isOutputFormatInstruction\(item\)\)/);
});
