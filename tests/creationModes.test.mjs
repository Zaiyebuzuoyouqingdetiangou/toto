import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRuntime } from './helpers/vmLoader.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const clone = value => JSON.parse(JSON.stringify(value));

async function fixture(overrides = {}) {
    const runtime = createRuntime(root);
    const config = await runtime.load('src/settings.js');
    const prompt = await runtime.load('src/promptBuilder.js');
    const settings = { ...clone(config.defaultSettings), enabled: true, mode: 'all', userDirectivePriority: false,
        autoRabbitMirrorInjection: true, rabbitMirrorPresentationModes: ['longtext'], ...overrides };
    return { runtime, config, prompt, settings };
}

test('longtext renders the agreed length without HTML or the optional visual template', async () => {
    const f = await fixture({ visualPromptEditingEnabled: true, visualPrompt: 'UNWANTED_VISUAL_TEMPLATE' });
    const result = f.prompt.buildRabbitMirrorPromptDetails(f.settings, 'independent', null, 'long-drawn');
    assert.notEqual(result.metadata.blankLongText, true);
    assert.equal(result.metadata.requestedPresentationMode, 'longtext');
    assert.match(result.prompt, /不要使用 HTML/);
    assert.match(result.prompt, /3000–5000 字只是没有原条目篇幅要求时的参考/);
    assert.match(result.prompt, /写成一篇读得完的故事/);
    assert.match(result.executionLock, /正文不要使用 HTML/);
    assert.doesNotMatch(result.prompt, /UNWANTED_VISUAL_TEMPLATE/);
});

test('longtext keeps a drawn text original but forbids turning its HTML instruction into a page', async () => {
    const f = await fixture({ rawPolicy: 'compact', externalWorldBookRandomEnabled: true, externalWorldBookMixMode: 'external-only' });
    const { THEMATIC_CATEGORIES } = await f.runtime.load('data/structured/thematicIndex.js');
    const { PRESENTATION_FORMATS } = await f.runtime.load('data/structured/presentationIndex.js');
    f.settings.blacklistedThemeIds = THEMATIC_CATEGORIES.map(item => item.id);
    f.settings.blacklistedFormatIds = PRESENTATION_FORMATS.map(item => item.id);
    const pool = await f.runtime.load('src/externalWorldBook/externalPool.js');
    const id = 'ext:original:text:one';
    pool.setExternalPoolSnapshot([{ libraryId: 'original', enabled: true }], new Map([['original', [
        { externalId: id, classification: 'text', enabled: true, userConfirmed: true },
    ]]]));
    const raw = '写一封完整信件。'.repeat(40) + '正文只写800字，必须用HTML的details展示附言。';
    const materials = new Map([[id, { externalId: id, classification: 'text', enabled: true, userConfirmed: true,
        rawContent: raw, localTitle: '一封信', sourceWorldBookName: '原创测试', sourceKeywords: [] }]]);
    const plan = f.prompt.planRabbitMirrorPromptDetails(f.settings, 'independent', null, 'long-original');
    const result = f.prompt.renderRabbitMirrorPromptPlan(plan, materials);
    assert.ok(result.prompt.includes(raw));
    assert.match(result.prompt, /不要使用 HTML/);
    assert.match(result.prompt, /不要把条目里的按钮、页面骨架、第二状态或交互说明做成界面/);
    assert.equal(materials.get(id).rawContent, raw);
});

test('mixed longtext and HTML faces keep per-face rules and complete metadata', async () => {
    const f = await fixture({ rabbitMirrorFaceCount: 2, rabbitMirrorPresentationModes: ['longtext', 'html'] });
    const plan = f.prompt.planRabbitMirrorPromptDetails(f.settings, 'independent', null, 'mixed-long',
        { batchIdentity: { mesid: 0, swipeId: 0, sourceHash: 'source' } });
    const result = f.prompt.renderRabbitMirrorPromptPlan(plan);
    assert.equal(result.metadata.faces.length, 2);
    assert.equal(result.metadata.faces[0].requestedPresentationMode, 'longtext');
    assert.notEqual(result.metadata.faces[0].blankLongText, true);
    assert.equal(result.metadata.faces[1].presentationMode, 'html');
    assert.match(result.executionLock, /第 1 面：长文本/);
    assert.doesNotMatch(result.executionLock, /第 2 面：长文本/);
});

test('writing style saves, freezes per plan, and clears without changing saved originals', async () => {
    const f = await fixture();
    f.config.updateSettings({ writingStyle: '克制，短句和具体动作。', independentReadCharacterWorldBook: true, imageCompositionMode: 'auto' });
    assert.equal(f.config.getSettings().writingStyle, '克制，短句和具体动作。');
    assert.equal(f.config.getSettings().independentReadCharacterWorldBook, true);
    f.settings.writingStyle = f.config.getSettings().writingStyle;
    const plan = f.prompt.planRabbitMirrorPromptDetails(f.settings, 'independent', null, 'style-freeze');
    f.settings.writingStyle = '未保存的新值';
    const result = f.prompt.renderRabbitMirrorPromptPlan(plan);
    assert.equal(result.prompt.split('克制，短句和具体动作。').length - 1, 1);
    assert.doesNotMatch(result.prompt, /未保存的新值/);
    f.config.updateSettings({ writingStyle: '' });
    f.settings.writingStyle = f.config.getSettings().writingStyle;
    assert.doesNotMatch(f.prompt.buildRabbitMirrorPromptDetails(f.settings, 'normal', null, 'style-cleared').prompt, /本轮兔子镜文风/);
});

test('explicit text classifications are recognized without guessing that every report is text', async () => {
    const f = await fixture();
    const { classifyExternalWorldBookEntry: classify } = await f.runtime.load('src/externalWorldBook/classifier.js');
    const tagged = classify({ title: '独立故事', content: '分类：文本\n写一篇独立故事。' });
    assert.equal(tagged.suggestion, 'text');
    assert.equal(tagged.suggestedFinalClassification, 'text');
    assert.notEqual(classify({ title: '睡眠报告', content: '以统计报告界面呈现睡眠。' }).suggestion, 'text');
    assert.notEqual(classify({ title: '普通故事', content: '她说这段文本很好看。' }).suggestion, 'text');
});

test('new artwork selections have real mother instructions and unique IDs', async () => {
    const f = await fixture();
    const { PRESENTATION_FORMATS } = await f.runtime.load('data/structured/presentationIndex.js');
    const { resolveRawForItem } = await f.runtime.load('data/raw/rawSegmentLookup.js');
    assert.equal(new Set(PRESENTATION_FORMATS.map(item => item.id)).size, PRESENTATION_FORMATS.length);
    for (const id of ['5.1.1.7', '2.1.7.2']) {
        const item = PRESENTATION_FORMATS.find(item => item.id === id);
        const raw = resolveRawForItem(item, 'presentation');
        assert.match(raw, /SVG/);
        assert.match(raw, /固定/);
        assert.match(raw, /角色/);
    }
});

test('single saved longtext preserves the empty trusted recipe after chat-metadata compaction', async () => {
    const f = await fixture();
    const { presentationModeFields, isBlankLongTextSelection } = await f.runtime.load('src/presentationMode.js');
    const source = readFileSync(new URL('../src/independentApi/persistence.js', import.meta.url), 'utf8');
    const start = source.indexOf('function compactChatPersistedRecord(');
    const fn = source.slice(start, source.indexOf('\n}', start) + 2);
    const value = { html: '<details>body</details>', apiRequest: { themeIds: [], formatIds: [],
        requestedPresentationMode: 'longtext', presentationMode: 'text', blankLongText: true } };
    const context = vm.createContext({ presentationModeFields, independentRecordWithinBudget: () => true,
        normalizeHistoryEntry: value => value, compactExternalSourceNote: () => ({}), RUNTIME_VERSION: 'test', value });
    const countStart = source.indexOf('function compactDirectiveCounts(');
    const countFn = source.slice(countStart, source.indexOf('\n}', countStart) + 2);
    vm.runInContext(`${countFn}\n${fn}\nglobalThis.saved=compactChatPersistedRecord(value);`, context);
    assert.equal(isBlankLongTextSelection(context.saved.apiRequest), true);
    value.apiRequest.customRequestCount = 1;
    vm.runInContext('globalThis.saved=compactChatPersistedRecord(value);', context);
    assert.equal(context.saved.apiRequest.customRequestCount, 1);
    const picker = await f.runtime.load('src/picker.js');
    assert.throws(() => picker.pickCombinationForMultifaceResay(f.settings, { faceIndex: 0, faces: [context.saved.apiRequest] }),
        error => error.reasonCode === 'BATCH_RESAY_CUSTOM_RECIPE');
});
