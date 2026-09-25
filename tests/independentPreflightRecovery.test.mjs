import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');
const mount = read('independentApi/mount.js'), request = read('independentApi/request.js');
function between(source, start, end) {
    const from = source.indexOf(start), to = source.indexOf(end, from);
    assert.ok(from >= 0 && to > from, start);
    return source.slice(from, to);
}
function fn(source, name) {
    const match = source.match(new RegExp('^(?:export )?function ' + name + '\\([^]*?^}\\r?$', 'm'));
    assert.ok(match, name); return match[0].replace(/^export /, '');
}
function fixture(provider, max = 2) {
    let calls = 0, posts = 0;
    const errors = [], results = [], deadlines = [];
    const lease = { consumeCount: () => posts, release() {} };
    const flight = { controller: new AbortController(), expectedFaceCount: 1, missingIndexes: [], faceRecipes: [],
        automaticRerollCount: 0, retainedHtml: '', dispatchLease: lease };
    const sandbox = { console, Map, Set, Promise, AbortController, Error, Object, Date, flight,
        ctx: {}, index: 0, msg: { mes: 'A completed reply.' }, force: false, manualBodyOwner: null,
        multifaceResay: null, singlePresentationResay: null, earlyBodyOwner: null,
        slot: 'slot', runId: 1, flightKey: 'flight', stale: false, dispatchLease: lease, pending: new Map(),
        getSettings: () => ({}), swipeId: () => 0, document: { querySelector: () => null },
        normalizeIndependentContextExcludedTags: () => [],
        createIndependentRequestDeadline(controller, timeout) {
            deadlines.push(() => { controller.abort(); timeout(sandbox.stallTimeoutError()); });
            return { clear() {}, progress() {} };
        },
        recipesCoverMissing: () => false, stillCurrent: () => !flight.cancelled, captureRecipes() {},
        currentIdentityForFlight: () => ({}), settleSuccessfulIndependentResult: async result => { results.push(result); return result; },
        settleCancelledIndependentFlightUi() {}, settleIndependentFailure: error => errors.push(error),
        independentRerollMax: () => max, messageElement: () => null,
        mergeRetrySelectionDiagnostic: () => ({}), missingIndexesFromIndependentResult: result => result.missing || [],
        globalFlights: () => new Map(), queueMessageSync() {}, releasePendingComboBatch: () => true,
    };
    vm.createContext(sandbox);
    const connection = read('independentApi/connection.js');
    vm.runInContext(read('automaticReroll.js').replace(/^export /gm, '') + '\n' +
        ['independentContextExcludedTagSet', 'liveVisibleIndependentMessageText', 'canonicalVisibleMessageText', 'createIndependentVisibleTextReader']
            .map(name => fn(connection, name)).join('\n') + '\n' +
        between(request, 'export async function callIndependentApi(', '\nexport function externalOwnerMesid(')
            .replace('export ', '').replace('async function callIndependentApi', 'async function actualRequest'), sandbox);
    sandbox.callIndependentApi = async (...args) => {
        calls++;
        if (calls > 10) { flight.cancelled = true; throw Error('Regression guard: unbounded local retry'); }
        return provider({ call: calls, dispatch: () => { posts++; }, actualRequest: () => sandbox.actualRequest(...args) });
    };
    vm.runInContext(between(mount, 'function releaseIndependentFlightBatches(', '\nexport function abortFlight(') + '\n' +
        between(mount, ' const dispatchAttempt=()=>{', ' const settleSuccessfulIndependentResult=') + '\n' +
        between(mount, ' const independentDiagnostic=', ' const task=(async()=>{') + '\n' +
        between(mount, ' const task=(async()=>{', '\n flight.task=task;') + '\nglobalThis.done=task;', sandbox);
    return { done: sandbox.done, errors, results, deadlines, flight, calls: () => calls, posts: () => posts };
}

test('real visible-reader preflight stops once when the host has no rendered body', async () => {
    const h = fixture(x => x.actualRequest()); await h.done;
    assert.equal(h.calls(), 1); assert.equal(h.posts(), 0);
    assert.equal(h.errors.length, 1); assert.equal(h.errors[0].requestCount, 0);
    assert.match(h.errors[0].message, /标签过滤后为空/);
});

test('an unclassified local exception cannot enter a paid retry loop', async () => {
    const h = fixture(() => { throw Error('unexpected preparation exception'); }); await h.done;
    assert.equal(h.calls(), 1); assert.equal(h.posts(), 0); assert.equal(h.errors.length, 1);
});

test('preparation failure on a later attempt does not reuse the first paid request count', async () => {
    const h = fixture(x => { if (x.call === 1) x.dispatch(); throw Error(x.call === 1 ? 'network' : 'preparation'); });
    await h.done; assert.equal(h.calls(), 2); assert.equal(h.posts(), 1);
    assert.equal(h.errors[0].message, 'preparation');
});

test('actual paid network failures still get exactly the configured two retries', async () => {
    const h = fixture(x => { x.dispatch(); throw Error('network'); }); await h.done;
    assert.equal(h.calls(), 3); assert.equal(h.posts(), 3); assert.equal(h.errors.length, 1);
});

test('a paid retry can succeed and disabling retry still stops after the first request', async () => {
    const h = fixture(x => { x.dispatch(); if (x.call === 1) throw Error('network'); return { html: '<details>success</details>' }; });
    await h.done; assert.equal(h.calls(), 2); assert.equal(h.results.length, 1); assert.equal(h.errors.length, 0);
    const off = fixture(x => { x.dispatch(); throw Error('network'); }, 0); await off.done;
    assert.equal(off.posts(), 1); assert.equal(off.errors.length, 1);
});

test('an unpaid preparation stall stops with a local timeout instead of retrying', async () => {
    const h = fixture(() => new Promise(() => {})); h.deadlines[0]();
    for (let i = 0; i < 30; i++) await Promise.resolve();
    // If the regression starts a second hanging preparation, fail without awaiting it.
    assert.equal(h.calls(), 1); await h.done;
    assert.equal(h.posts(), 0); assert.equal(h.errors[0].requestCount, 0);
    assert.equal(h.errors[0].code, 'RABBIT_MIRROR_PREPARATION_TIMEOUT');
});

test('a stall after dispatch remains retryable', async () => {
    const h = fixture(x => { x.dispatch(); return x.call === 1 ? new Promise(() => {}) : { html: '<details>success</details>' }; });
    h.deadlines[0](); await h.done;
    assert.equal(h.posts(), 2); assert.equal(h.results.length, 1);
});
