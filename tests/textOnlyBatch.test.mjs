import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/vmLoader.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
async function fixture(mode, source, textCount = 3) {
    const runtime = createRuntime(root);
    const { defaultSettings } = await runtime.load('src/settings.js');
    const picker = await runtime.load('src/picker.js');
    const storage = await runtime.load('src/storage.js');
    const pool = await runtime.load('src/externalWorldBook/externalPool.js');
    const { THEMATIC_CATEGORIES } = await runtime.load('data/structured/thematicIndex.js');
    const { PRESENTATION_FORMATS } = await runtime.load('data/structured/presentationIndex.js');
    const settings = { ...JSON.parse(JSON.stringify(defaultSettings)), enabled: true, mode: 'all', userDirectivePriority: false,
        rabbitMirrorFaceCount: 3, rabbitMirrorPresentationModes: Array(5).fill(mode), longTextSource: source,
        externalWorldBookRandomEnabled: true, externalWorldBookMixMode: 'external-only',
        formatsMin: 2, formatsMax: 2,
        blacklistedThemeIds: THEMATIC_CATEGORIES.map(item => item.id),
        blacklistedFormatIds: PRESENTATION_FORMATS.map(item => item.id) };
    const texts = Array.from({ length: textCount }, (_, index) => ({ externalId: `ext:only:text:${index}`,
        classification: 'text', enabled: true, userConfirmed: true }));
    pool.setExternalPoolSnapshot([{ libraryId: 'only', enabled: true }], new Map([['only', [
        ...texts,
        { externalId: 'ext:only:text:off', classification: 'text', enabled: false, userConfirmed: true },
        { externalId: 'ext:only:text:pending', classification: 'text', enabled: true, userConfirmed: false },
        { externalId: 'ext:only:theme:off', classification: 'theme', enabled: false, userConfirmed: true },
        { externalId: 'ext:only:format:off', classification: 'format', enabled: false, userConfirmed: true },
    ]]]));
    const context = { batchPlanningOnly: true, batchIdentity: { mesid: 2, swipeId: 0, sourceHash: 'body' } };
    return { picker, storage, settings, context, ids: texts.map(item => item.externalId), pool };
}

for (const [mode, source] of [['auto', 'blank'], ['text', 'blank'], ['longtext', 'text'], ['longtext', 'mixed']]) {
    test(`${mode}/${source}: three enabled text entries form three faces without theme or format candidates`, async () => {
        const f = await fixture(mode, source);
        const batch = f.picker.pickCombinationBatch(f.settings, `only-text-${mode}-${source}`, f.context, 3);
        assert.equal(batch.length, 3);
        const selected = batch.flatMap(face => [...face.combo.textIds]);
        assert.equal(new Set(selected).size, 3);
        assert.deepEqual([...selected].sort(), [...f.ids].sort());
        for (const face of batch) {
            assert.equal(face.combo.themeIds.length, 0);
            assert.equal(face.combo.formatIds.length, 0);
            assert.equal(face.combo.textIds.length, 1);
            assert.equal(face.combo.presentationMode, 'text');
            assert.notEqual(face.combo.blankLongText, true);
        }
        assert.equal(f.storage.markPendingBatchAttempt(batch.batchPlan), true);
        const saved = f.storage.findPendingComboBatchPlan(batch.batchPlan.identity);
        assert.equal(saved.faces.length, 3);
        const resay = f.picker.pickCombinationForMultifaceResay(f.settings, { faceIndex: 1, faces: saved.faces.map(face => face.combo) });
        assert.deepEqual([...resay.combo.textIds], [...batch[1].combo.textIds]);
    });
}

for (const [mode, source] of [['auto', 'blank'], ['text', 'blank'], ['longtext', 'text'], ['longtext', 'mixed']]) {
    test(`${mode}/${source}: one enabled text can independently supply three faces without reviving disabled entries`, async () => {
        const f = await fixture(mode, source, 1);
        const batch = f.picker.pickCombinationBatch(f.settings, 'repeat-one', f.context, 3);
        assert.equal(batch.length, 3);
        assert.ok(batch.every(face => face.combo.textIds.length === 1 && face.combo.textIds[0] === f.ids[0]
            && face.combo.themeIds.length === 0 && face.combo.formatIds.length === 0));
        assert.equal(f.storage.markPendingBatchAttempt(batch.batchPlan), true);
    });
}

test('text-only selection exhausts distinct entries before repeating and respects explicit exclusions', async () => {
    const f = await fixture('longtext', 'mixed', 2);
    const batch = f.picker.pickCombinationBatch(f.settings, 'repeat-after-two', f.context, 3);
    assert.equal(new Set(batch.slice(0, 2).map(face => face.combo.textIds[0])).size, 2);
    assert.ok(f.ids.includes(batch[2].combo.textIds[0]));
    const excluded = f.picker.pickCombinationBatch(f.settings, 'one-excluded', { ...f.context, batchExcludedTextIds: [f.ids[1]] }, 3);
    assert.ok(excluded.every(face => face.combo.textIds[0] === f.ids[0]));
});

test('external-only text pool never falls back to builtin themes or formats', async () => {
    const f = await fixture('auto', 'blank', 1);
    f.settings.blacklistedThemeIds = [];
    f.settings.blacklistedFormatIds = [];
    const batch = f.picker.pickCombinationBatch(f.settings, 'no-builtin-fallback', f.context, 3);
    assert.ok(batch.every(face => face.combo.textIds[0] === f.ids[0] && !face.combo.themeIds.length && !face.combo.formatIds.length));
});

test('longtext does not stay blank when themes, formats and text entries are all unavailable', async () => {
    const f = await fixture('longtext', 'blank', 0);
    assert.throws(() => f.picker.pickCombinationBatch(f.settings, 'blank', f.context, 3),
        error => error.reasonCode === 'BATCH_CANDIDATE_POOL_EXHAUSTED');
});

test('text candidates do not silently substitute for an explicitly requested HTML sibling', async () => {
    const f = await fixture('longtext', 'text');
    f.settings.rabbitMirrorPresentationModes = ['longtext', 'html', 'longtext'];
    assert.throws(() => f.picker.pickCombinationBatch(f.settings, 'html-not-text', f.context, 3),
        error => error.reasonCode === 'BATCH_CANDIDATE_POOL_EXHAUSTED');
});

test('ordinary auto batches with complete theme and format pools keep their no-repeat policy', async () => {
    const f = await fixture('auto', 'blank', 1);
    f.pool.setExternalPoolSnapshot([{ libraryId: 'only', enabled: true }], new Map([['only', [
        { externalId: f.ids[0], classification: 'text', enabled: true, userConfirmed: true },
        { externalId: 'ext:only:theme:on', classification: 'theme', enabled: true, userConfirmed: true },
        { externalId: 'ext:only:format:on', classification: 'format', enabled: true, userConfirmed: true },
    ]]]));
    assert.throws(() => f.picker.pickCombinationBatch(f.settings, 'ordinary-no-repeat', f.context, 5),
        error => ['BATCH_CANDIDATE_POOL_EXHAUSTED', 'BATCH_SELECTION_INCOMPLETE'].includes(error.reasonCode));
});

test('stored batch API also fills text-only faces from the enabled pool', async () => {
    const f = await fixture('longtext', 'mixed', 1);
    const batch = f.picker.pickCombinationBatch(f.settings, 'stored-text-only', { ...f.context, batchPlanningOnly: false }, 3);
    assert.equal(batch.length, 3);
    assert.ok(batch.every(face => face.combo.textIds.length === 1 && face.combo.textIds[0] === f.ids[0]));
});
