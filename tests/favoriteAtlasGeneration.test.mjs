import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAtlasDraftPrompt, parseAtlasDraftResponse, createFavoriteAtlasDraftGenerator } from '../src/favoriteAtlasGeneration.js';
import { buildFavoriteAtlas, setAtlasSelection } from '../src/favoriteAtlases.js';
import { createRabbitMirrorPublicAPI } from '../src/publicApiCore.js';

const catalog = {
    theme: [{ title: '日常', items: [{ id: 'C.1', title: '小动物' }, { id: 'C.2', title: '屏蔽项', blocked: true }] }],
    format: [{ title: '游戏', items: [{ id: '6.1', title: '塔罗抽卡', summary: '一套塔罗牌' }] }],
    text: [{ title: '纯文本', items: [{ id: 'text-secret', title: '不相关私有正文' }] }], warnings: [],
};
const response = (slots = [{ label: '愚者', keywords: ['The Fool', '0号愚者牌'] }]) => JSON.stringify({ relatedIds: ['6.1'], slots });

test('name and enabled theme/format catalog are data, without chat, favorites, raw entries, or disabled entries', () => {
    const input = structuredClone(catalog);
    input.format[0].items[0].rawContent = 'private raw body';
    const prompt = buildAtlasDraftPrompt('塔罗牌图鉴', input);
    assert.match(prompt.systemPrompt, /资料.*不是指令/);
    assert.match(prompt.prompt, /塔罗牌图鉴/);
    assert.match(prompt.prompt, /塔罗抽卡/);
    assert.doesNotMatch(prompt.prompt, /private raw body|屏蔽项|不相关私有正文/);
    assert.throws(() => buildAtlasDraftPrompt('', catalog), /名称/);
    assert.throws(() => buildAtlasDraftPrompt('塔罗', { ...catalog, warnings: ['目录失败'] }), /目录/);
});

test('accepts collection members derived from one related format, including an entire 78-card set', () => {
    const slots = Array.from({ length: 78 }, (_, i) => ({ label: `牌 ${i + 1}`, keywords: [`Card ${i + 1}`] }));
    const draft = parseAtlasDraftResponse('```json\n' + response(slots) + '\n```', catalog);
    assert.equal(draft.slots.length, 78);
    assert.deepEqual(draft.slots[0], { label: '牌 1', keywords: ['牌 1', 'Card 1'] });
    assert.deepEqual(draft.relatedEntries, [{ id: '6.1', title: '塔罗抽卡', kind: 'format' }]);
});

test('rejects incomplete, unrelated, duplicate and delimiter-corrupted drafts without partial application', () => {
    for (const text of [
        '{"slots":[', JSON.stringify({ relatedIds: ['missing'], slots: [{ label: '猫', keywords: [] }] }),
        JSON.stringify({ relatedIds: [], slots: [{ label: '猫', keywords: [] }] }),
        response([{ label: '猫', keywords: [] }, { label: '猫', keywords: [] }]),
        response([{ label: '猫|狗', keywords: [] }]), response([{ label: '猫', keywords: ['cat\ndog'] }]),
        response([]), response([{ label: '猫', keywords: 'cat' }]),
    ]) assert.throws(() => parseAtlasDraftResponse(text, catalog));
});

test('one click uses the existing configured API once, without memory or manual retry', async () => {
    const calls = [];
    const generate = createFavoriteAtlasDraftGenerator({ readCatalog: async () => catalog, getApi: () => ({ generate: async options => { calls.push(options); return { text: response(), requestCount: 1 }; } }) });
    const draft = await generate('塔罗牌图鉴');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].includeMemory, false);
    assert.equal(calls[0].manualRetry, false);
    assert.equal(draft.slots[0].label, '愚者');
});

test('concurrent clicks are refused; a failed or malformed response is never retried automatically', async () => {
    let release, calls = 0;
    const generate = createFavoriteAtlasDraftGenerator({ readCatalog: async () => catalog, getApi: () => ({ generate: async () => { calls++; return new Promise(resolve => { release = resolve; }); } }) });
    const first = generate('塔罗');
    await Promise.resolve(); await Promise.resolve();
    await assert.rejects(generate('塔罗'), /进行中/);
    release({ text: '{' });
    await assert.rejects(first, /完整/);
    assert.equal(calls, 1);
    const failed = createFavoriteAtlasDraftGenerator({ readCatalog: async () => catalog, getApi: () => ({ generate: async () => { calls++; throw new Error('transport failed'); } }) });
    await assert.rejects(failed('塔罗'), /transport failed/);
    assert.equal(calls, 2);
});

test('invalid name, unreadable catalog and missing API cause zero generation calls', async () => {
    let calls = 0;
    const getApi = () => ({ generate: async () => { calls++; return { text: response() }; } });
    await assert.rejects(createFavoriteAtlasDraftGenerator({ readCatalog: async () => catalog, getApi })(' '), /名称/);
    await assert.rejects(createFavoriteAtlasDraftGenerator({ readCatalog: async () => ({ ...catalog, warnings: ['未读取'] }), getApi })('塔罗'), /目录/);
    await assert.rejects(createFavoriteAtlasDraftGenerator({ readCatalog: async () => catalog, getApi: () => null })('塔罗'), /副 API|接口/);
    assert.equal(calls, 0);
});

test('draft generation is storage-free; later explicit save preserves existing IDs and manual associations', () => {
    const atlas = buildFavoriteAtlas({ name: '旧图鉴', slotsText: '愚者 | old alias' });
    const old = setAtlasSelection(atlas, atlas.slots[0].id, ['original-favorite']);
    const before = structuredClone(old);
    const draft = parseAtlasDraftResponse(response(), catalog);
    assert.deepEqual(old, before);
    const saved = buildFavoriteAtlas({ name: '塔罗牌图鉴', slotsText: draft.slots.map(slot => [slot.label, ...slot.keywords].join(' | ')).join('\n'), previous: old });
    assert.equal(saved.id, old.id);
    assert.equal(saved.slots[0].id, old.slots[0].id);
    assert.deepEqual(saved.selections, old.selections);
});

test('cancelled catalog reads send nothing; cancelled requests reject late results and can generate again', async () => {
    let catalogReady, responseReady, calls = 0, stops = 0;
    const generator = createFavoriteAtlasDraftGenerator({
        readCatalog: () => new Promise(resolve => { catalogReady = resolve; }),
        getApi: () => ({ generate: async () => { calls++; return new Promise(resolve => { responseReady = resolve; }); }, stop: () => { stops++; } }),
    });
    const reading = generator('塔罗');
    assert.equal(generator.cancel(), true);
    catalogReady(catalog);
    await assert.rejects(reading, error => error.code === 'ABORTED');
    assert.equal(calls, 0); assert.equal(stops, 0);
    const requesting = generator('塔罗');
    catalogReady(catalog);
    await Promise.resolve(); await Promise.resolve();
    assert.equal(calls, 1);
    generator.cancel();
    responseReady({ text: response() });
    await assert.rejects(requesting, error => error.code === 'ABORTED');
    assert.equal(stops, 1);
    assert.equal(generator.cancel(), false);
    const fresh = generator('新的塔罗');
    catalogReady(catalog); await Promise.resolve(); await Promise.resolve();
    responseReady({ text: response() });
    assert.equal((await fresh).slots[0].label, '愚者');
    assert.equal(calls, 2);
});

test('a busy shared API is not taken over or stopped by draft cancellation', async () => {
    let calls = 0, stops = 0;
    const generator = createFavoriteAtlasDraftGenerator({ readCatalog: async () => catalog, getApi: () => ({ getStatus: () => ({ busy: true }), generate: () => { calls++; }, stop: () => { stops++; } }) });
    await assert.rejects(generator('塔罗'), /进行中/);
    generator.cancel();
    assert.equal(calls, 0); assert.equal(stops, 0);
});

test('real public API integration keeps one dispatch lease and does not require automatic independent generation', async () => {
    const settings = { enabled: false, generationMode: 'follow', independentConnectionProfileId: 'configured-profile', independentMaxRequestChars: 2000000 };
    let requests = 0, contextReads = 0, memoryReads = 0;
    const { api } = createRabbitMirrorPublicAPI({
        isActive: () => true, getSettings: () => settings,
        captureContext: () => { contextReads++; }, readMemory: () => { memoryReads++; },
        complete: async (actualSettings, system, prompt, options) => {
            assert.equal(actualSettings.enabled, false);
            assert.equal(options.manualRetry, false);
            assert.equal(options.dispatchLease.consume(), true);
            assert.equal(options.dispatchLease.consume(), false);
            requests++;
            return { response: { ok: true }, result: { text: response() } };
        },
    });
    const generate = createFavoriteAtlasDraftGenerator({ readCatalog: async () => catalog, getApi: () => api });
    const draft = await generate('塔罗牌');
    assert.equal(draft.slots[0].label, '愚者');
    assert.equal(requests, 1); assert.equal(contextReads, 0); assert.equal(memoryReads, 0);
    assert.equal(api.getStatus().busy, false);
});
