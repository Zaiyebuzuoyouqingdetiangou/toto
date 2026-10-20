import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/featureRuntime.mjs';
import { isBlankLongTextSelection } from '../src/presentationMode.js';
import { faceDrawMetadataFields } from '../src/faceDrawRules.js';

const mount = readFileSync(new URL('../src/independentApi/mount.js', import.meta.url), 'utf8');
const recipe = { themeIds: ['C.1'], formatIds: ['1.1.1'], presentationMode: 'html' };
function fixture(faces, shown = recipe, faceIndex = 1) {
    const calls = [], errors = [], notices = [];
    const details = [0, 1].map(index => ({ hasAttribute: () => false,
        getAttribute: name => index === faceIndex && shown && name === 'data-rm-face-recipe' ? JSON.stringify(shown) : null }));
    const saved = { html: 'unchanged old two-face content', apiRequest: { faces } };
    const identity = { ctx: {}, msg: { mes: '<content>已经写完的正文。' }, index: 12, faceIndex, host: {} };
    const context = vm.createContext({ isBlankLongTextSelection, faceDrawMetadataFields,
        FACE_RECIPE_ATTR: 'data-rm-face-recipe',
        FACE_RECIPE_KEYS: ['themeIds', 'formatIds', 'textIds', 'blankLongText', 'worldBookEntryId', 'presentationMode'],
        getSettings: () => ({ generationSource: 'independent' }), resolveIndependentActionIdentity: () => identity,
        canIndependentFaceResay: () => ({ ok: true }), readStore: () => ({}), savedIndependentRecordForOwner: () => saved,
        externalFaceDetails: () => details, hasEphemeralFaceFailure: () => false, MULTIFACE_FAILURE_ATTR: 'failed',
        generateFor: (...args) => calls.push(args),
        toastr: { error: value => errors.push(value), warning: value => errors.push(value), info: value => notices.push(value) },
    });
    for (const name of ['compactFaceRecipe', 'displayedFaceRecipe', 'resayIndependentMirror']) {
        const source = mount.match(new RegExp(`^(?:export )?function ${name}\\([^]*?^}\\r?$`, 'm'))?.[0];
        assert.ok(source, name); vm.runInContext(source.replace(/^export /, ''), context);
    }
    return { calls, errors, notices, saved, click: mode => context.resayIndependentMirror(details[faceIndex], {}, { mode }) };
}

for (const faces of [[], [{ themeIds: ['unrelated-old-row'] }]]) {
    test(`old two-face mirror reuses its displayed recipe despite ${faces.length} saved diagnostic rows`, () => {
        const h = fixture(faces), before = JSON.stringify(h.saved);
        assert.equal(h.click('original'), true);
        assert.equal(h.calls.length, 1);
        const [index, , force, , selection] = h.calls[0];
        assert.equal(index, 12); assert.equal(force, true);
        assert.equal(selection.faceIndex, 1); assert.equal(selection.faces.length, 2);
        assert.deepEqual(Array.from(selection.faces[1].themeIds), recipe.themeIds);
        assert.deepEqual(Array.from(selection.faces[1].formatIds), recipe.formatIds);
        assert.equal(selection.faces[0], null, 'do not invent or misassign a missing neighboring recipe');
        assert.equal(selection.preserveSelection, true); assert.equal(selection.freshSelection, false);
        assert.equal(JSON.stringify(h.saved), before, 'reading a recipe must not rewrite history');
        assert.deepEqual(h.errors, []);
    });
}

test('switching back to an older displayed version uses its recipe while keeping known neighbors', () => {
    const neighbor = { themeIds: ['C.2'], formatIds: ['1.1.2'] };
    const h = fixture([neighbor, { themeIds: ['C.3'], formatIds: ['1.1.3'] }]);
    h.click('original');
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0][4].faces[0], neighbor);
    assert.deepEqual(Array.from(h.calls[0][4].faces[1].themeIds), recipe.themeIds);
});

test('missing original selection still allows an explicit fresh retry of only the chosen face', () => {
    const h = fixture([], null); h.click('fresh');
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0][2], true);
    assert.equal(h.calls[0][4].faceIndex, 1);
    assert.equal(h.calls[0][4].freshSelection, true);
    assert.deepEqual(h.errors, []);
});

test('unknown original selection is not fabricated and the message offers an actionable retry', () => {
    const h = fixture([], null); h.click('original');
    assert.equal(h.calls.length, 0);
    assert.equal(h.errors.length, 1);
    assert.match(h.errors[0], /重新抽一张/);
});

test('recovered legacy recipe passes the real one-face prompt planner with the same selection', async () => {
    const h = fixture([]); h.click('original');
    assert.equal(h.calls.length, 1);
    const rt = createRuntime(fileURLToPath(new URL('..', import.meta.url)));
    const config = await rt.load('src/settings.js'), prompt = await rt.load('src/promptBuilder.js');
    const settings = { ...JSON.parse(JSON.stringify(config.defaultSettings)), enabled: true, autoRabbitMirrorInjection: true, userDirectivePriority: false,
        rabbitMirrorFaceCount: 1, rabbitMirrorPresentationModes: ['html'], externalWorldBookRandomEnabled: false };
    const plan = prompt.planRabbitMirrorPromptDetails(settings, 'independent', null, 'legacy-manual-retry', {
        multifaceResay: h.calls[0][4],
    });
    assert.equal(plan.selections.length, 1);
    assert.deepEqual(Array.from(plan.selections[0].combo.themeIds), recipe.themeIds);
    assert.deepEqual(Array.from(plan.selections[0].combo.formatIds), recipe.formatIds);
    assert.equal(plan.batchPlan, null, 'a legacy face retry must not redraw the complete batch');
});

test('partial diagnostics keep the selected faces known missing custom requirements', async () => {
    const h = fixture([{ ...recipe, customThemeCount: 1, customFormatCount: 1, customRequestCount: 1 }], recipe, 0);
    h.click('original');
    assert.equal(h.calls.length, 1);
    const selection = h.calls[0][4];
    for (const key of ['customThemeCount', 'customFormatCount', 'customRequestCount']) assert.equal(selection.faces[0][key], 1);
    assert.equal(selection.faces[1], null);
    const rt = createRuntime(fileURLToPath(new URL('..', import.meta.url)));
    const config = await rt.load('src/settings.js'), prompt = await rt.load('src/promptBuilder.js');
    const settings = { ...JSON.parse(JSON.stringify(config.defaultSettings)), enabled: true, autoRabbitMirrorInjection: true,
        userDirectivePriority: false, rabbitMirrorFaceCount: 1, rabbitMirrorPresentationModes: ['html'] };
    assert.throws(() => prompt.planRabbitMirrorPromptDetails(settings, 'independent', null, 'legacy-custom-retry', {
        multifaceResay: selection,
    }), error => error.reasonCode === 'BATCH_RESAY_CUSTOM_RECIPE', 'must not silently drop a known custom request');
});
