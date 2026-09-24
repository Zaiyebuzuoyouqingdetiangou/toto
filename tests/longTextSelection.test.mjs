import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/vmLoader.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const clone = value => JSON.parse(JSON.stringify(value));
async function fixture(overrides = {}) {
    const runtime = createRuntime(root);
    const { defaultSettings } = await runtime.load('src/settings.js');
    const picker = await runtime.load('src/picker.js');
    const storage = await runtime.load('src/storage.js');
    const presentation = await runtime.load('src/presentationMode.js');
    const external = await runtime.load('src/externalWorldBook/externalPool.js');
    const settings = { ...clone(defaultSettings), enabled: true, mode: 'all', userDirectivePriority: false,
        rabbitMirrorPresentationModes: Array(5).fill('longtext'), ...overrides };
    const context = { batchPlanningOnly: true, batchIdentity: { mesid: 2, swipeId: 0, sourceHash: 'body' } };
    return { runtime, picker, storage, presentation, external, settings, context };
}
const blankRecipe = () => ({ requestedPresentationMode: 'longtext', presentationMode: 'text', blankLongText: true,
    themeIds: [], formatIds: [], textIds: [] });

test('default longtext draws the same pool as the other faces', async () => {
    const f = await fixture();
    const result = f.picker.pickCombination(f.settings, 'long-default');
    assert.ok(result.combo.themeIds.length > 0);
    assert.ok(result.combo.formatIds.length > 0);
    assert.equal(result.combo.requestedPresentationMode, 'longtext');
    assert.equal(result.combo.presentationMode, 'text');
    assert.notEqual(result.combo.blankLongText, true);
    assert.equal(f.presentation.isBlankLongTextSelection(result.combo), false);
});

test('longtext does not invent a blank recipe when nothing can be drawn', async () => {
    const f = await fixture();
    const { THEMATIC_CATEGORIES } = await f.runtime.load('data/structured/thematicIndex.js');
    const { PRESENTATION_FORMATS } = await f.runtime.load('data/structured/presentationIndex.js');
    f.settings.blacklistedThemeIds = THEMATIC_CATEGORIES.map(item => item.id);
    f.settings.blacklistedFormatIds = PRESENTATION_FORMATS.map(item => item.id);
    assert.throws(() => f.picker.pickCombinationBatch(f.settings, 'empty-five', f.context, 5),
        error => error.reasonCode === 'BATCH_CANDIDATE_POOL_EXHAUSTED');
});

test('blank longtext exact resay needs the complete marker and does not become a custom directive', async () => {
    const f = await fixture({ longTextSource: 'mixed' });
    const result = f.picker.pickCombinationForMultifaceResay(f.settings, { faceIndex: 0, faces: [blankRecipe()] });
    assert.equal(result.combo.blankLongText, true);
    assert.deepEqual(clone(result.combo.formatIds), []);
    for (const invalid of [
        { ...blankRecipe(), requestedPresentationMode: 'text' },
        { ...blankRecipe(), presentationMode: 'html' },
        { ...blankRecipe(), blankLongText: false },
        { ...blankRecipe(), customDirective: true },
        { ...blankRecipe(), themeIds: undefined },
    ]) {
        assert.throws(() => f.picker.pickCombinationForMultifaceResay(f.settings, { faceIndex: 0, faces: [invalid] }));
        assert.equal(f.storage.createPendingComboBatchPlan([invalid, blankRecipe()], {
            chatKey: 'chat:test', generationScopeKey: 'scope', mesid: 2, swipeId: 0, sourceHash: 'body', settingsKey: 'key',
        }), null);
    }
});

test('longtext keeps drawing themes while an explicit text face still uses enabled text entries', async () => {
    const f = await fixture();
    const id = 'ext:longtext:text:one';
    f.external.setExternalPoolSnapshot([{ libraryId: 'longtext', enabled: true }], new Map([
        ['longtext', [{ externalId: id, classification: 'text', enabled: true, userConfirmed: true }]],
    ]));
    const longtext = f.picker.pickCombination(f.settings, 'long-ordinary').combo;
    assert.ok(longtext.themeIds.length > 0);
    assert.notDeepEqual(clone(longtext.textIds || []), [id]);
    f.settings.rabbitMirrorPresentationModes = ['text'];
    const combo = f.picker.pickCombination(f.settings, 'text-face').combo;
    assert.deepEqual(clone(combo.textIds), [id]);
    assert.equal(combo.presentationMode, 'text');
});

test('mixed longtext uses ordinary materials but remains text presentation', async () => {
    const f = await fixture({ longTextSource: 'mixed', externalWorldBookRandomEnabled: false });
    const combo = f.picker.pickCombination(f.settings, 'mixed').combo;
    assert.ok(combo.themeIds.length > 0);
    assert.ok(combo.formatIds.length > 0);
    assert.equal(combo.requestedPresentationMode, 'longtext');
    assert.equal(combo.presentationMode, 'text');
    assert.notEqual(combo.blankLongText, true);
    const batch = f.picker.pickCombinationBatch(f.settings, 'mixed-many', f.context, 3);
    assert.equal(batch.length, 3);
    assert.ok(batch.every(face => face.combo.presentationMode === 'text' && face.combo.formatIds.length));
});

test('retired longtext source no longer changes the frozen batch', async () => {
    const f = await fixture({ longTextSource: 'blank' });
    const blank = f.picker.pickCombinationBatch(f.settings, 'source-change', f.context, 2);
    const mixed = f.picker.pickCombinationBatch({ ...f.settings, longTextSource: 'mixed' }, 'source-change', f.context, 2);
    assert.equal(blank.batchPlan.identity.settingsKey, mixed.batchPlan.identity.settingsKey);
    assert.ok(blank.every(face => face.combo.formatIds.length));
    assert.ok(mixed.every(face => face.combo.formatIds.length));
});

test('diagnostic merge preserves legitimate blank recipes and ignores incomplete empty records', async () => {
    const f = await fixture();
    const { mergeRetrySelectionDiagnostic } = await f.runtime.load('src/missingFaceMerge.js');
    const merged = mergeRetrySelectionDiagnostic([], blankRecipe(), [0], 1);
    assert.equal(merged.faces[0].blankLongText, true);
    assert.equal(merged.faces[0].requestedPresentationMode, 'longtext');
    const invalid = mergeRetrySelectionDiagnostic([], { ...blankRecipe(), requestedPresentationMode: 'text' }, [0], 1);
    assert.equal(invalid.faces[0], null);
});

test('legacy auto selections ignore the new source setting', async () => {
    const a = await fixture({ rabbitMirrorPresentationModes: ['auto'], longTextSource: 'blank' });
    const b = await fixture({ rabbitMirrorPresentationModes: ['auto'], longTextSource: 'mixed' });
    assert.deepEqual(clone(a.picker.pickCombination(a.settings, 'legacy').combo), clone(b.picker.pickCombination(b.settings, 'legacy').combo));
});

test('mixed longtext keeps the ordinary auto material selection for the same random stream', async () => {
    const auto = await fixture({ rabbitMirrorPresentationModes: ['auto'], externalWorldBookRandomEnabled: false });
    const mixed = await fixture({ longTextSource: 'mixed', externalWorldBookRandomEnabled: false });
    const a = auto.picker.pickCombination(auto.settings, 'same-stream').combo;
    const b = mixed.picker.pickCombination(mixed.settings, 'same-stream').combo;
    assert.deepEqual(clone(b.themeIds), clone(a.themeIds));
    assert.deepEqual(clone(b.formatIds), clone(a.formatIds));
    assert.equal(b.presentationMode, 'text');
});

test('longtext with a directive still draws and restores the same selection', async () => {
    const f = await fixture({ userDirectivePriority: true });
    const context = { chat: [{ is_user: true, mes: '兔子镜：写今晚窗边的长篇故事' }] };
    const first = f.picker.pickCombination(f.settings, 'directive-first', context);
    assert.ok(first.directive);
    assert.notEqual(first.combo.blankLongText, true);
    const restored = f.picker.pickCombination(f.settings, 'directive-second', context);
    assert.deepEqual(clone(restored.combo.themeIds), clone(first.combo.themeIds));
    assert.deepEqual(clone(restored.combo.formatIds), clone(first.combo.formatIds));
    assert.notEqual(restored.combo.blankLongText, true);
});

test('the stored batch API keeps drawn longtext faces', async () => {
    const f = await fixture();
    const result = f.picker.pickCombinationBatch(f.settings, 'stored-long', { ...f.context, batchPlanningOnly: false }, 3);
    assert.equal(result.length, 3);
    assert.ok(result.every(face => face.combo.requestedPresentationMode === 'longtext' && face.combo.formatIds.length && face.combo.blankLongText !== true));
});

test('auto weight can choose long text without dropping the drawn materials', async () => {
    const f = await fixture({ rabbitMirrorPresentationModes: ['auto'], autoLongTextPercent: 100, longTextSource: 'mixed' });
    const result = f.picker.pickCombination(f.settings, 'auto-all-long');
    assert.equal(result.combo.requestedPresentationMode, 'longtext');
    assert.notEqual(result.combo.blankLongText, true);
    assert.ok(result.combo.themeIds.length);
});

test('auto weight zero keeps the legacy category presentation', async () => {
    const f = await fixture({ rabbitMirrorPresentationModes: ['auto'], autoLongTextPercent: 0 });
    const result = f.picker.pickCombination(f.settings, 'auto-zero');
    assert.notEqual(result.combo.requestedPresentationMode, 'longtext');
});

test('selected world book entries replace the builtin draw', async () => {
    const f = await fixture({
        rabbitMirrorPresentationModes: ['html'], lotterySource: 'worldbook',
        lotteryEntries: [{ id: 'book::1', book: 'book', uid: '1', title: '信', content: '写一封信' }],
    });
    const result = f.picker.pickCombination(f.settings, 'world-one');
    assert.equal(result.combo.worldBookEntryId, 'book::1');
    assert.equal(result.combo.worldBookTitle, '信');
    assert.deepEqual(clone(result.combo.themeIds), []);
    assert.equal(f.presentation.presentationModeFields(result.combo).worldBookEntryId, 'book::1');
});

test('two auto faces still include one long text when the weight is tiny', async () => {
    const f = await fixture({
        rabbitMirrorFaceCount: 2, rabbitMirrorPresentationModes: ['auto', 'auto'],
        autoLongTextPercent: 1, longTextSource: 'mixed',
    });
    const result = f.picker.pickCombinationBatch(f.settings, 'two-auto', f.context, 2);
    assert.ok(result.some(face => face.combo.requestedPresentationMode === 'longtext'));
});
