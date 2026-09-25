import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRuntime, createStore } from './helpers/vmLoader.mjs';
import { mergeMissingIndependentFaces, mergeRetrySelectionDiagnostic, recipesCoverMissing, missingIndexesFromIndependentResult } from '../src/missingFaceMerge.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = readFileSync(new URL('../src/independentApi/mount.js', import.meta.url), 'utf8');
const REGISTRY = 'rabbit_mirror_theater:pending_batch_registry:v3';
function between(start, end) {
    const from = source.indexOf(start), to = source.indexOf(end, from);
    assert.ok(from >= 0 && to > from, `runtime seam: ${start}`);
    return source.slice(from, to);
}
const dispatch = between(' const dispatchAttempt=()=>{', ' const settleSuccessfulIndependentResult=');
const reroll = between(' const beginAutomaticReroll=', ' const task=(async()=>{');
const task = between(' const task=(async()=>{', '\n flight.task=task;');
const abort = between('export function abortFlight(', '\nexport function cancelFlightsForSlot(').replace('export ', '');
const release = source.includes('function releaseIndependentFlightBatches(')
    ? between('function releaseIndependentFlightBatches(', '\nexport function abortFlight(') : '';

async function harness(provider, max = 0, { realMerge = false, failReleaseOnce = false } = {}) {
    const store = createStore([['other:content', 'preserve']]);
    const runtime = createRuntime(root, { store });
    const storage = await runtime.load('src/storage.js');
    let sequence = 0, calls = 0;
    const plan = (count = 2) => storage.createPendingComboBatchPlan(
        Array.from({ length: count }, (_, i) => ({ themeIds: [`theme-${i}`], formatIds: [`format-${i}`] })),
        { chatKey: 'test-chat', generationScopeKey: `scope-${++sequence}`, mesid: 0, swipeId: 0, sourceHash: 'body', settingsKey: 'settings' },
        { eligibleFormatIds: [], selectedFormatIds: [], validFormatIds: [] });
    const foreign = plan();
    assert.equal(storage.markPendingBatchAttempt(foreign), true);
    const foreignRaw = JSON.parse(store.getItem(REGISTRY))[0];
    const flight = { batchPlan: null, controller: new AbortController(), expectedFaceCount: 2, missingIndexes: [], faceRecipes: [], automaticRerollCount: 0, retainedHtml: '', dispatchLease: { release() {} } };
    const failures = [], events = [], results = [];
    let releaseCalls = 0;
    const sandbox = {
        console, Map, Set, Promise, AbortController, Error, Object, queueMicrotask,
        ctx: {}, index: 0, msg: {}, force: false, manualBodyOwner: null, generationScopeKey: 'scope',
        multifaceResay: null, singlePresentationResay: null, earlyBodyOwner: null,
        slot: 'slot', runId: 'run', flightKey: 'flight', stale: false, flight,
        dispatchLease: flight.dispatchLease, pending: new Map(),
        getSettings: () => ({}), configuredAutomaticRerollIdleMs: () => 90000,
        createIndependentRequestDeadline: (_controller, timeout) => { events.push(timeout); return { clear() {}, progress() {} }; },
        isAutomaticRerollStall: error => error.code === 'stall',
        recipesCoverMissing: realMerge ? recipesCoverMissing : () => false, stillCurrent: () => !flight.cancelled,
        callIndependentApi: async (_ctx, _index, _msg, signal, options) => {
            calls++;
            return provider({ calls, plan, storage, signal, options, flight, store });
        },
        releasePendingComboBatch: value => {
            releaseCalls++;
            if (failReleaseOnce && releaseCalls === 1) return false;
            return storage.releasePendingComboBatch(value);
        },
        captureRecipes() { if (realMerge) flight.faceRecipes = [{ themeIds: ['theme-0'] }, { themeIds: ['theme-1'] }]; },
        currentIdentityForFlight: () => ({}),
        mergeMissingIndependentFaces, mergeRetrySelectionDiagnostic,
        settleSuccessfulIndependentResult: async result => {
            if (result.batchPlan) {
                assert.equal(storage.commitPendingComboBatch(result.batchPlan.faces.map((_, faceIndex) => ({ faceIndex })), result.batchPlan), true, 'reservation survives until successful commit');
            }
            results.push(result); return result;
        },
        settleCancelledIndependentFlightUi: () => { flight.uiSettled = true; },
        settleIndependentFailure: error => failures.push(error),
        canReroll: () => calls <= max && !flight.cancelled && !flight.timedOut,
        messageElement: () => null, independentRerollMax: () => max,
        missingIndexesFromIndependentResult: realMerge ? missingIndexesFromIndependentResult : result => result.missing || [],
        globalFlights: () => new Map(), queueMessageSync() {},
    };
    const context = vm.createContext(sandbox);
    const done = vm.runInContext(`(async()=>{${release}${abort}\nglobalThis.cancel=()=>abortFlight(flight);${dispatch}${reroll}${task}\nreturn await task;})()`, context);
    return { done, flight, failures, events, results, cancel: () => context.cancel(), calls: () => calls, releaseCalls: () => releaseCalls, store, storage, plan,
        assertReleased() { assert.deepEqual(JSON.parse(store.getItem(REGISTRY)), [foreignRaw]); assert.equal(store.getItem('other:content'), 'preserve'); } };
}
function reserve(h, count = 2) {
    const p = h.plan(count); assert.ok(p);
    h.options.onBatchPlan(p);
    assert.equal(h.storage.markPendingBatchAttempt(p), true, 'request must not hit retained registry capacity');
    return p;
}

test('failed multi-face request followed by single-face retry releases the first reservation', async () => {
    const h = await harness(x => {
        if (x.calls === 1) { reserve(x); throw new Error('network'); }
        x.options.onBatchPlan(null); return { html: '<details>single-face retry</details>', missing: [] };
    }, 1);
    await h.done;
    assert.equal(h.calls(), 2); assert.equal(h.failures.length, 0); h.assertReleased();
});

test('more than eight serial failures/retries do not consume eight slots', async () => {
    const h = await harness(x => { reserve(x); throw new Error('network'); }, 11);
    await h.done;
    assert.equal(h.calls(), 12); assert.equal(h.failures[0]?.message, 'network'); h.assertReleased();
});

test('success keeps the reservation through commit and releases only its own slot', async () => {
    const h = await harness(x => ({ batchPlan: reserve(x), missing: [] }));
    await h.done; assert.equal(h.failures.length, 0); h.assertReleased();
});

test('cancel settles locally even if provider ignores AbortSignal', async () => {
    const h = await harness(x => { reserve(x); return new Promise(() => {}); });
    h.cancel();
    const result = await Promise.race([h.done.then(() => 'settled'), new Promise(resolve => setTimeout(() => resolve('hung'), 30))]);
    assert.equal(result, 'settled'); assert.equal(h.calls(), 1); h.assertReleased();
});

test('idle timeout then retry cannot be overwritten by the old provider callback', async () => {
    let old, finish;
    const h = await harness(x => {
        if (x.calls === 1) { reserve(x); old = x; return new Promise(() => {}); }
        const p = reserve(x);
        assert.throws(() => old.options.onBatchPlan(old.plan()), { name: 'AbortError' });
        assert.equal(x.flight.batchPlan, p);
        return new Promise(resolve => { finish = () => resolve({ batchPlan: p }); });
    }, 1);
    h.events[0](Object.assign(new Error('idle'), { code: 'stall' }));
    for (let i = 0; i < 12 && !finish; i++) await Promise.resolve();
    assert.ok(finish, 'retry reached provider'); finish(); await h.done;
    assert.equal(h.failures.length, 0); h.assertReleased();
});

test('absolute timeout releases a hung provider without retrying', async () => {
    const h = await harness(x => { reserve(x); return new Promise(() => {}); }, 2);
    h.events[0](new Error('absolute timeout'));
    await h.done;
    assert.equal(h.calls(), 1); h.assertReleased();
});

test('partial two-face result merges the single missing face and preserves the ready face', async () => {
    const first = '<toto data-rabbit-mirror="true" data-rm-face="1"><details><summary>保留一面</summary><p>原有内容</p></details></toto>';
    const failed = '<toto data-rabbit-mirror="true" data-rm-face="2"><details data-rabbit-mirror-face-failure="incomplete-face"><summary>第2面未完成</summary></details></toto>';
    const h = await harness(x => {
        if (x.calls === 1) return { batchPlan: reserve(x), html: first + failed, failedFaces: [{ faceIndex: 1 }], completedFaces: 1 };
        assert.deepEqual([...x.options.missingFaceRetry.indexes], [1]);
        x.options.onBatchPlan(null);
        return { html: '<details><summary>新二面</summary><p>补齐内容</p></details>' };
    }, 1, { realMerge: true });
    await h.done;
    assert.equal(h.failures.length, 0); assert.equal(h.calls(), 2);
    assert.ok(h.results[0].html.includes(first));
    assert.match(h.results[0].html, /补齐内容/);
    assert.equal(h.results[0].completedFaces, 2); h.assertReleased();
});

test('a failed release is retried at the flight cleanup boundary with the same identity', async () => {
    const h = await harness(x => { reserve(x); throw new Error('network'); }, 0, { failReleaseOnce: true });
    await h.done;
    assert.equal(h.releaseCalls(), 2); h.assertReleased();
});

test('cancel during preparation rejects a late plan before it can be registered', async () => {
    let captured;
    const h = await harness(x => { captured = x; return new Promise(() => {}); });
    h.cancel(); await h.done;
    assert.throws(() => captured.options.onBatchPlan(captured.plan()), { name: 'AbortError' });
    assert.equal(captured.options.isPromptOwnerCurrent(), false); h.assertReleased();
});
