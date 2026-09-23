import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createRuntime } from './helpers/vmLoader.mjs';
import { isBlankLongTextSelection } from '../src/presentationMode.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const mount = () => readFileSync(new URL('../src/independentApi/mount.js', import.meta.url), 'utf8');

function clickFixture({ failed = true, faces = [], overlay = false } = {}) {
    const calls = [], errors = [];
    const details = [{ hasAttribute: () => false }, { hasAttribute: () => failed }];
    const identity = { ctx: {}, msg: {}, index: 0, faceIndex: 1, host: {}, baseSlot: 'owner' };
    const sandbox = {
        isBlankLongTextSelection,
        getSettings: () => ({ generationSource: 'independent' }),
        resolveIndependentActionIdentity: () => identity,
        canIndependentFaceResay: () => ({ ok: true }),
        savedIndependentRecordForOwner: () => ({ html: 'old batch', apiRequest: { faces } }),
        readStore: () => ({}), externalFaceDetails: () => details,
        hasEphemeralFaceFailure: () => overlay,
        MULTIFACE_FAILURE_ATTR: 'data-rabbit-mirror-face-failure',
        generateFor: (...args) => calls.push(args),
        toastr: { error: text => errors.push(text), warning() {}, info() {} },
    };
    const context = vm.createContext(sandbox);
    const source = mount().match(/export function resayIndependentMirror\([^]*?\r?\n}/)?.[0];
    assert.ok(source);
    vm.runInContext(source.replace('export ', ''), context);
    return { click: () => context.resayIndependentMirror(details[1]), calls, errors };
}

test('legacy failed face without recipe dispatches only its targeted manual retry', () => {
    const h = clickFixture();
    assert.equal(h.click(), true);
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0][4].faceIndex, 1);
    assert.equal(h.calls[0][4].freshSelection, true);
    assert.equal(h.calls[0][4].retryFailedFace, true);
    assert.equal(h.errors.length, 0);
});

test('failed overlay with incomplete recipe can retry; successful unknown recipe does not silently redraw', () => {
    const overlay = clickFixture({ failed: false, overlay: true, faces: [null, null] });
    overlay.click();
    assert.equal(overlay.calls.length, 1);
    assert.equal(overlay.calls[0][4].freshSelection, true);
    const success = clickFixture({ failed: false });
    success.click();
    assert.equal(success.calls.length, 0);
    assert.equal(success.errors.length, 1);
});

test('retry with known face recipe still targets that exact original face', () => {
    const faces = [{ themeIds: [], formatIds: ['1.1'] }, { themeIds: [], formatIds: ['1.2'] }];
    const h = clickFixture({ faces });
    h.click();
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0][4].faceIndex, 1);
    assert.equal(h.calls[0][4].faces, faces);
    assert.equal(h.calls[0][4].freshSelection, false);
});

test('mounted old content retains trusted recipe metadata before and after face replacement', () => {
    const source = mount();
    const previousLine = source.match(/ const previousReadyRecord=[^]*?;\r?\n if\(multifaceResay\)/)?.[0].split(/;\r?\n if/)[0];
    assert.ok(previousLine);
    const apiRequest = { faces: [{ themeIds: ['a'] }, { themeIds: ['b'] }] };
    const context = vm.createContext({ mountedReady: { html: 'live old content' }, saved: { html: 'saved old content', apiRequest }, independentStoredHtmlRestorable: () => true });
    vm.runInContext(`${previousLine}; globalThis.record = previousReadyRecord;`, context);
    assert.equal(context.record.html, 'live old content');
    assert.equal(context.record.apiRequest, apiRequest);
});

test('one-face resay evaluates a one-face response even when its surrounding batch has two faces', () => {
    const source = mount().match(/ const expectedFaceCount=\(\(\)=>\{[^]*?\r?\n \}\)\(\);/)?.[0];
    assert.ok(source);
    const context = vm.createContext({ multifaceResay: { faceIndex: 1 }, previousReadyRecord: {}, st: { rabbitMirrorFaceCount: 5 }, parseMultifaceOutput: () => ({ ok: true, faces: [{}, {}] }) });
    vm.runInContext(`${source}\nglobalThis.count=expectedFaceCount;`, context);
    assert.equal(context.count, 1);
});

test('repeated successful replacements retain recipes and report remaining legacy failed slots', async () => {
    const runtime = createRuntime(root);
    const { missingIndexesFromIndependentResult } = await runtime.load('src/missingFaceMerge.js');
    const { createMultifaceFailureSlot } = await runtime.load('src/multifaceProtocol.js');
    const source = mount();
    const block = source.slice(source.indexOf('    const oldDiagnostic=mergeRecord?.apiRequest'), source.indexOf('\n   }', source.indexOf('    const oldDiagnostic=mergeRecord?.apiRequest')));
    assert.ok(block.includes('result.requestDiagnostic='));
    const left = { themeIds: ['theme-left'], formatIds: ['format-left'] };
    const right = { themeIds: ['theme-right'], formatIds: ['format-right'] };
    const next = { themeIds: ['theme-new'], formatIds: ['format-new'] };
    const readyFace = index => `<toto data-rabbit-mirror="true" data-rm-face="${index + 1}"><details><summary>Ready</summary><p>Body</p></details></toto>`;
    const context = vm.createContext({ missingIndexesFromIndependentResult, html: readyFace(0) + readyFace(1), mergeRecord: { apiRequest: { faces: [left, right] } }, previousBatch: { faces: [{ index: 0 }, { index: 1 }] }, faceIndex: 1, result: { requestDiagnostic: next } });
    vm.runInContext(`{${block}}`, context);
    assert.equal(context.result.requestDiagnostic.faces[0], left);
    assert.deepEqual(Array.from(context.result.requestDiagnostic.faces[1].themeIds), ['theme-new']);
    context.mergeRecord = { apiRequest: context.result.requestDiagnostic };
    context.result = { requestDiagnostic: { themeIds: ['again'], formatIds: [] } };
    vm.runInContext(`{${block}}`, context);
    assert.equal(context.result.requestDiagnostic.faces[0], left);
    assert.deepEqual(Array.from(context.result.requestDiagnostic.faces[1].themeIds), ['again']);
    context.mergeRecord = {};
    context.result = { requestDiagnostic: next };
    vm.runInContext(`{${block}}`, context);
    assert.equal(context.result.requestDiagnostic.faces[0], null, 'unknown neighbor recipe must not be invented');
    assert.deepEqual(Array.from(context.result.requestDiagnostic.faces[1].themeIds), ['theme-new']);
    context.html = createMultifaceFailureSlot(0, 'incomplete-face') + readyFace(1);
    vm.runInContext(`{${block}}`, context);
    assert.equal(context.result.requestDiagnostic.partial, true);
    assert.equal(context.result.requestDiagnostic.completedFaces, 1);
    assert.deepEqual(Array.from(context.result.requestDiagnostic.failedFaces, face => face.faceIndex), [0]);
});

test('selection freezes before transport and survives an error without a diagnostic', async () => {
    const runtime = createRuntime(root);
    const { mergeRetrySelectionDiagnostic, recipesCoverMissing } = await runtime.load('src/missingFaceMerge.js');
    const source = mount();
    const dispatch = source.slice(source.indexOf(' const dispatchAttempt=()=>{'), source.indexOf(' const settleSuccessfulIndependentResult='));
    const capture = source.slice(source.indexOf(' const captureRecipes='), source.indexOf(' const independentDiagnostic='));
    const recipe = { themeIds: [], formatIds: [], textIds: ['ext:retry-fixture:text:remaining'], presentationMode: 'text' };
    const flight = { controller: new AbortController(), faceRecipes: [], missingIndexes: [], expectedFaceCount: 1, automaticRerollCount: 0 };
    const calls = [];
    const context = vm.createContext({ flight, mergeRetrySelectionDiagnostic, recipesCoverMissing, ctx: {}, index: 0, msg: {}, force: true,
        manualBodyOwner: null, slot: 'slot', dispatchLease: {}, multifaceResay: { faceIndex: 1, faces: [], freshSelection: true, retryFailedFace: true },
        singlePresentationResay: null, earlyBodyOwner: null, stillCurrent: () => true, getSettings: () => ({}),
        configuredAutomaticRerollIdleMs: () => 1000, createIndependentRequestDeadline: () => ({ clear() {} }),
        callIndependentApi: async (...args) => {
            const options = args[4]; calls.push(options);
            options.onRequestSelection(recipe);
            throw new Error('response was truncated');
        },
    });
    vm.runInContext(`${capture}\n${dispatch}\nglobalThis.dispatch=dispatchAttempt;`, context);
    await assert.rejects(context.dispatch(), /truncated/);
    assert.deepEqual(Array.from(flight.faceRecipes[0].textIds), recipe.textIds);
    flight.automaticRerollCount = 1; flight.missingIndexes = [0];
    await assert.rejects(context.dispatch(), /truncated/);
    assert.equal(calls[1].multifaceResay, null, 'automatic attempt cannot carry fresh-selection authorization');
    assert.deepEqual(Array.from(calls[1].missingFaceRetry.faces[0].textIds), recipe.textIds);
    flight.faceRecipes = [];
    assert.throws(() => context.dispatch(), error => error.requestCount === 0);
    assert.equal(calls.length, 2, 'missing recipe cannot trigger another random request');

    const request = readFileSync(new URL('../src/independentApi/request.js', import.meta.url), 'utf8');
    const publish = request.slice(request.indexOf(' const batchPlan=details.batchPlan||null;'), request.indexOf(' const originalLease=requestOptions.dispatchLease;', request.indexOf(' const batchPlan=details.batchPlan||null;')));
    const order = [];
    vm.runInNewContext(publish, { details: {}, requestSelectionDiagnostic: recipe, promptOwner: {},
        assertIndependentPromptOwner: () => order.push('owner'), requestOptions: { onBatchPlan: () => order.push('plan'),
            onRequestSelection: value => { assert.equal(value, recipe); order.push('selection'); } } });
    assert.deepEqual(order, ['plan', 'owner', 'selection']);
});

test('explicit missing-recipe failed-face retry plans one fresh filtered selection', async () => {
    const runtime = createRuntime(root);
    const settingsModule = await runtime.load('src/settings.js');
    const pool = await runtime.load('src/externalWorldBook/externalPool.js');
    const prompt = await runtime.load('src/promptBuilder.js');
    const id = 'ext:retry-fixture:text:remaining';
    pool.setExternalPoolSnapshot([{ libraryId: 'retry-fixture', enabled: true }], new Map([['retry-fixture', [{ externalId: id, classification: 'text', enabled: true, userConfirmed: true }]]]));
    const settings = { ...JSON.parse(JSON.stringify(settingsModule.defaultSettings)), enabled: true, autoRabbitMirrorInjection: true,
        userDirectivePriority: false, rabbitMirrorFaceCount: 1, externalWorldBookRandomEnabled: true,
        externalWorldBookMixMode: 'external-only', rabbitMirrorPresentationModes: ['text'] };
    const plan = prompt.planRabbitMirrorPromptDetails(settings, 'independent', null, 'manual-failed-retry', {
        multifaceResay: { faceIndex: 1, faces: [], retryFailedFace: true, freshSelection: true },
    });
    assert.deepEqual(Array.from(plan.selectedExternalIds), [id]);
    assert.equal(plan.batchPlan, null);
    const disabledRecipe = { themeIds: [], formatIds: [], textIds: ['ext:retry-fixture:text:disabled'], presentationMode: 'text' };
    const retryPlan = prompt.planRabbitMirrorPromptDetails(settings, 'independent', null, 'manual-filtered-retry', {
        multifaceResay: { faceIndex: 1, faces: [null, disabledRecipe], retryFailedFace: true },
    });
    assert.deepEqual(Array.from(retryPlan.selectedExternalIds), [id], 'manual failed retry respects the remaining enabled pool');
    assert.throws(() => prompt.planRabbitMirrorPromptDetails(settings, 'independent', null, 'ordinary-resay', {
        multifaceResay: { faceIndex: 1, faces: [null, disabledRecipe] },
    }), error => error.reasonCode === 'BATCH_RESAY_ENTRY_UNAVAILABLE');
});
