import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createRuntime } from './helpers/vmLoader.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const oldId = 'ext:filter-fixture:text:original';
const remainingId = 'ext:filter-fixture:text:remaining';
const clone = value => JSON.parse(JSON.stringify(value));

async function fixture() {
    const runtime = createRuntime(root);
    const { defaultSettings } = await runtime.load('src/settings.js');
    const pool = await runtime.load('src/externalWorldBook/externalPool.js');
    const picker = await runtime.load('src/picker.js');
    const prompt = await runtime.load('src/promptBuilder.js');
    const errors = await runtime.load('src/externalWorldBook/errors.js');
    const settings = { ...clone(defaultSettings), enabled: true, autoRabbitMirrorInjection: true,
        userDirectivePriority: false, rabbitMirrorFaceCount: 1,
        externalWorldBookRandomEnabled: true, externalWorldBookMixMode: 'external-only',
        rabbitMirrorPresentationModes: ['text', 'text', 'text', 'text', 'text'] };
    function enable(ids) {
        pool.setExternalPoolSnapshot([{ libraryId: 'filter-fixture', enabled: true }],
            new Map([['filter-fixture', [oldId, remainingId].map(externalId => ({
                externalId, classification: 'text', enabled: ids.includes(externalId), userConfirmed: true,
            }))]]));
    }
    const face = { themeIds: [], formatIds: [], textIds: [oldId],
        requestedPresentationMode: 'text', presentationMode: 'text' };
    return { runtime, picker, prompt, errors, settings, enable, face };
}

test('filtered original resay gives an actionable fixed reason and never silently selects the remaining entry', async () => {
    const f = await fixture();
    f.enable([remainingId]);
    const before = [...f.runtime.store.values];
    assert.throws(() => f.prompt.planRabbitMirrorPromptDetails(f.settings, 'independent', null, 'filtered-resay', {
        multifaceResay: { faceIndex: 0, faces: [f.face] },
    }), error => {
        assert.equal(error.code, 'MULTIFACE_PLAN_UNAVAILABLE');
        assert.equal(error.reasonCode, 'BATCH_RESAY_ENTRY_UNAVAILABLE');
        const visible = f.errors.describeExternalWorldBookPreflightFailure(error);
        assert.match(visible.message, /停用|取消勾选/);
        assert.match(visible.message, /重新启用/);
        assert.match(visible.message, /重新抽取/);
        assert.ok(!visible.message.includes(oldId));
        return true;
    });
    assert.deepEqual([...f.runtime.store.values], before, 'rejected resay performs no persistence or accounting writes');
});

test('one enabled text entry can create one fresh face; original re-enable permits exact resay', async () => {
    const f = await fixture();
    f.enable([remainingId]);
    const fresh = f.prompt.planRabbitMirrorPromptDetails(f.settings, 'independent', null, 'one-entry-fresh');
    assert.deepEqual(clone(fresh.selectedExternalIds), [remainingId]);
    assert.equal(fresh.selections.length, 1);
    f.enable([oldId, remainingId]);
    const resay = f.picker.pickCombinationForMultifaceResay(f.settings, { faceIndex: 0, faces: [f.face] });
    assert.deepEqual(clone(resay.combo.textIds), [oldId]);
});

test('one eligible format cannot silently duplicate itself across two requested faces', async () => {
    const f = await fixture();
    const pool = await f.runtime.load('src/externalWorldBook/externalPool.js');
    pool.setExternalPoolSnapshot([{ libraryId: 'filter-fixture', enabled: true }], new Map([
        ['filter-fixture', [{ externalId: 'ext:filter-fixture:format:remaining', classification: 'format', enabled: true, userConfirmed: true }]],
    ]));
    const settings = { ...f.settings, rabbitMirrorFaceCount: 2, samplingMode: 'format_only',
        rabbitMirrorPresentationModes: ['html', 'html', 'html', 'html', 'html'] };
    const single = f.prompt.planRabbitMirrorPromptDetails({ ...settings, rabbitMirrorFaceCount: 1 },
        'independent', null, 'one-face-one-format');
    assert.deepEqual(clone(single.selections[0].combo.formatIds), ['ext:filter-fixture:format:remaining']);
    assert.throws(() => f.prompt.planRabbitMirrorPromptDetails(settings, 'independent', null, 'two-faces-one-entry'),
        error => error.reasonCode === 'BATCH_CANDIDATE_POOL_EXHAUSTED');
});

test('missing original recipe and custom requests have distinct fixed diagnoses', async () => {
    const f = await fixture();
    f.enable([oldId]);
    for (const [resay, reason] of [
        [{ faceIndex: 2, faces: [f.face] }, 'BATCH_RESAY_FACE_MISSING'],
        [{ faceIndex: 0, faces: [{ ...f.face, themeIds: undefined }] }, 'BATCH_RESAY_RECIPE_INCOMPLETE'],
        [{ faceIndex: 0, faces: [{ ...f.face, customRequestCount: 1 }] }, 'BATCH_RESAY_CUSTOM_RECIPE'],
        [{ faceIndex: 0, faces: [{ themeIds: [], formatIds: [], textIds: [] }] }, 'BATCH_RESAY_RECIPE_INCOMPLETE'],
    ]) {
        assert.throws(() => f.picker.pickCombinationForMultifaceResay(f.settings, resay), error => {
            assert.equal(error.reasonCode, reason);
            assert.equal(f.errors.describeExternalWorldBookPreflightFailure(error).reasonCode, reason);
            return true;
        });
    }
});

test('preflight diagnostics never echo untrusted source content', async () => {
    const f = await fixture();
    const visible = f.errors.describeExternalWorldBookPreflightFailure({
        code: 'MULTIFACE_PLAN_UNAVAILABLE', reasonCode: 'BATCH_RESAY_ENTRY_UNAVAILABLE',
        message: 'PRIVATE_SOURCE_BODY', details: 'PRIVATE_ENTRY_NAME',
    });
    assert.ok(!visible.message.includes('PRIVATE_'));
    assert.equal(visible.reasonCode, 'BATCH_RESAY_ENTRY_UNAVAILABLE');
});
