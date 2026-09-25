import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createRuntime } from './helpers/vmLoader.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = readFileSync(new URL('../src/independentApi/request.js', import.meta.url), 'utf8');
const callSource = source.slice(source.indexOf('export async function callIndependentApi('), source.indexOf('\nexport function externalOwnerMesid')).replace(/^export /, '');
const externalId = 'ext:source:text:one';

async function runRequest(overrides = {}, { stale = false, unavailable = false, fullRegistry = false, requestOptions = {} } = {}) {
    const runtime = createRuntime(root);
    const config = await runtime.load('src/settings.js');
    const presentation = await runtime.load('src/presentationMode.js');
    const prompt = await runtime.load('src/promptBuilder.js');
    const storage = await runtime.load('src/storage.js');
    const registryKey = 'rabbit_mirror_theater:pending_batch_registry:v3';
    if (fullRegistry) {
        for (let index = 0; index < 8; index++) {
            const old = storage.createPendingComboBatchPlan([
                { themeIds: ['old-theme'], formatIds: ['old-format'] },
                { themeIds: ['old-theme-2'], formatIds: ['old-format-2'] },
            ], { chatKey: 'old-chat', generationScopeKey: `old-scope-${index}`, mesid: 0, swipeId: 0, sourceHash: 'old-body', settingsKey: 'old-settings' });
            assert.equal(storage.markPendingBatchAttempt(old), true);
        }
    }
    const registryBefore = runtime.context.localStorage.getItem(registryKey);
    const pool = await runtime.load('src/externalWorldBook/externalPool.js');
    const settings = { ...JSON.parse(JSON.stringify(config.defaultSettings)), enabled: true, autoRabbitMirrorInjection: true,
        mode: 'all', rabbitMirrorFaceCount: 1, rabbitMirrorPresentationModes: ['longtext'], longTextSource: 'blank',
        externalWorldBookRandomEnabled: true, externalWorldBookMixMode: 'balanced', userDirectivePriority: false,
        independentReadCharacterWorldBook: false, independentApiBaseUrl: 'https://example.invalid', independentApiModel: 'local-test', ...overrides };
    const counters = { hydrate: 0, selectedRaw: 0, dispatch: 0 };
    const metadata = { hydrated: stale, enabledMetadataRebuildRequired: stale ? ['old-library'] : [] };
    const ctx = { chat: [{ is_user: false, mes: '这是已经完成并显示的有效助手正文。' }] };
    const sandbox = { Date, console, ...presentation, ...prompt,
        getSettings: () => settings, swipeId: () => 0, messageSourceFingerprint: () => 'body',
        createIndependentVisibleTextReader: () => message => ({ text: message.mes }), isRabbitMirrorEligibleAssistantMessage: () => true,
        captureIndependentPromptOwner: () => ({}), assertIndependentPromptOwner() {}, bindIndependentPromptBatch() {},
        getExternalPoolHydrationStatus: () => metadata,
        async hydrateExternalPoolMetadata() {
            counters.hydrate++;
            if (unavailable) throw Object.assign(new Error('database unavailable'), { code: 'WORLD_BOOK_STORAGE_UNAVAILABLE' });
            metadata.hydrated = true;
            pool.setExternalPoolSnapshot([{ libraryId: 'source', enabled: true }], new Map([['source', [
                { externalId, classification: 'text', enabled: true, userConfirmed: true },
            ]]]));
        },
        async getSelectedExternalEntries(ids) {
            counters.selectedRaw++;
            return new Map(ids.map(id => [id, { externalId: id, classification: 'text', enabled: true, userConfirmed: true,
                localTitle: '原文本条目', rawContent: '写一篇完整故事。', sourceKeywords: [] }]));
        },
        independentExternalPromptPreflightError: error => error, recentIndependentVisualGuard: () => '', manualRetryVisualGuard: () => '',
        configuredIndependentMaxRequestChars: () => 1000000, globalWorldInfoSnapshotFor: () => null, globalWorldInfoContextView: () => ({}),
        contextBundle: () => ({ text: ctx.chat[0].mes, targetVisibleChars: 20 }), recordRabbitMirrorIndependentPrompt() {},
        hashText: value => String(value), chatKey: () => 'chat:quota-parity', messageBaseSlotKey: () => 'slot', operationEpochForBase: () => 1,
        markPendingBatchAttempt: storage.markPendingBatchAttempt, releasePendingComboBatch: storage.releasePendingComboBatch,
        independentBatchPlanPreflightError: code => Object.assign(new Error(code), { code }),
        async requestIndependentCompletion(st, systemPrompt, userPrompt, options) {
            assert.equal(options.dispatchLease.consume(), true);
            counters.dispatch++;
            counters.diagnostic = options.diagnosticContext;
            counters.prompt = systemPrompt;
            throw Object.assign(new Error('Stopped at the mocked transport boundary'), { code: 'TEST_DISPATCH_CAPTURED' });
        },
    };
    vm.createContext(sandbox);
    vm.runInContext(callSource, sandbox);
    let error, dispatchedPlan;
    try { await sandbox.callIndependentApi(ctx, 0, ctx.chat[0], null, {
        dispatchLease: { consume: () => true }, onBatchPlan: plan => { dispatchedPlan = plan; }, ...requestOptions,
    }); }
    catch (caught) { error = caught; }
    if (fullRegistry) {
        assert.equal(runtime.context.localStorage.getItem(registryKey), registryBefore, 'do not change old registrations');
        if (dispatchedPlan && counters.dispatch) {
            assert.equal(storage.findPendingComboBatchPlan(dispatchedPlan.identity).batchId, dispatchedPlan.batchId);
            assert.equal(storage.releasePendingComboBatch(dispatchedPlan), true);
            assert.equal(runtime.context.localStorage.getItem(registryKey), registryBefore);
        }
    }
    return { ...counters, error };
}

test('longtext with enabled mother libraries still waits for a rebuilt index', async () => {
    for (const count of [1, 3]) {
        const result = await runRequest({ rabbitMirrorFaceCount: count, rabbitMirrorPresentationModes: Array(count).fill('longtext') }, { stale: true });
        assert.equal(result.error?.code, 'WORLD_BOOK_ENTRY_STATE_CONFLICT');
        assert.equal(result.error?.details?.reason, 'metadata-rebuild-required');
        assert.equal(result.dispatch, 0);
    }
});

test('longtext does not skip an unavailable mother-library database', async () => {
    const result = await runRequest({}, { unavailable: true });
    assert.equal(result.error?.code, 'WORLD_BOOK_STORAGE_UNAVAILABLE');
    assert.equal(result.dispatch, 0);
});

test('HTML siblings and mixed-source longtext retain the external index preflight', async () => {
    for (const overrides of [
        { rabbitMirrorFaceCount: 2, rabbitMirrorPresentationModes: ['longtext', 'html'] },
        { longTextSource: 'mixed' },
    ]) {
        const result = await runRequest(overrides, { stale: true });
        assert.equal(result.error?.code, 'WORLD_BOOK_ENTRY_STATE_CONFLICT');
        assert.equal(result.error?.details?.reason, 'metadata-rebuild-required');
        assert.equal(result.dispatch, 0);
    }
});

test('retired text mode follows longtext and does not force a mother-library read when the switch is off', async () => {
    const result = await runRequest({ externalWorldBookRandomEnabled: false, rabbitMirrorPresentationModes: ['text'] });
    assert.equal(result.error?.code, 'TEST_DISPATCH_CAPTURED');
    assert.equal(result.hydrate, 0);
    assert.equal(result.dispatch, 1);
    assert.equal(result.diagnostic.requestedPresentationMode, 'longtext');
});

test('exact external resay still hydrates its original recipe when current settings select blank longtext', async () => {
    const result = await runRequest({ externalWorldBookRandomEnabled: false }, { requestOptions: { multifaceResay: {
        faceIndex: 0, faces: [{ themeIds: [], formatIds: [], textIds: [externalId], requestedPresentationMode: 'text', presentationMode: 'text' }],
    } } });
    assert.equal(result.error?.code, 'TEST_DISPATCH_CAPTURED');
    assert.equal(result.hydrate, 1);
    assert.equal(result.selectedRaw, 1);
    assert.equal(result.dispatch, 1);
    assert.equal(result.diagnostic.requestedPresentationMode, 'text');
    assert.match(result.prompt, /可见文字和 HTML 都重新写/);
});

test('real multi-face request dispatches once even when the old shared registry already has eight entries', async () => {
    const result = await runRequest({ externalWorldBookRandomEnabled: false, rabbitMirrorFaceCount: 2,
        rabbitMirrorPresentationModes: ['longtext', 'longtext'] }, { fullRegistry: true });
    assert.equal(result.error?.code, 'TEST_DISPATCH_CAPTURED');
    assert.equal(result.dispatch, 1);
});
