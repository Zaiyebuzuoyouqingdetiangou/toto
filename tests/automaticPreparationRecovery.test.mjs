import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const sources = Object.fromEntries(['earlyBody', 'mount', 'geometry', 'flights', 'missingRetryShell'].map(name =>
    [name, readFileSync(new URL(`../src/independentApi/${name}.js`, import.meta.url), 'utf8')]));
function install(context, file, name, optional = false) {
    const match = sources[file].match(new RegExp(`^(?:export )?function ${name}\\([^\\r\\n]*}\\r?$`, 'm'))
        || sources[file].match(new RegExp(`^(?:export )?function ${name}\\([^]*?^}\\r?$`, 'm'));
    if (optional && !match) return;
    assert.ok(match, name);
    vm.runInContext(match[0].replace(/^export /, ''), context);
}
function clock() {
    let now = 10000, sequence = 0;
    const timers = new Map();
    return { Date: { now: () => now },
        setTimeout(fn, delay) { const id = ++sequence; timers.set(id, { fn, at: now + delay }); return id; },
        clearTimeout(id) { timers.delete(id); },
        advance(ms) {
            const end = now + ms; let steps = 0;
            while (true) {
                const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
                if (!next || next[1].at > end) break;
                assert.ok(++steps < 100, 'bounded scheduled work');
                now = next[1].at; timers.delete(next[0]); next[1].fn();
            }
            now = end;
        },
    };
}
function harness() {
    const time = clock(), message = { mes: 'final body', swipe_id: 0 }, ctx = { chat: [message] };
    const ownerSymbol = Symbol('owner');
    const authorization = { token: message.mes, [ownerSymbol]: { chat: ctx.chat, message, index: 0, swipe: 0, epoch: 1, terminalEnded: true } };
    const cutover = { authorized: new Map([[0, authorization]]), activeHostGeneration: null };
    const failures = new Map(), polls = new Map(), paints = [];
    const element = { isConnected: true };
    let host, dispatched = 0, consumed = false, epoch = 1;
    const identity = () => ({ ctx, msg: ctx.chat[0], baseSlot: 'chat:0:0', slot: `chat:0:0:${ctx.chat[0].mes}`,
        key: `chat:0:0:${ctx.chat[0].mes}`, sourceHash: ctx.chat[0].mes, bodyHash: ctx.chat[0].mes, revision: ctx.chat[0].mes === 'final body' ? 1 : 2 });
    const paint = (_el, key, html, state, _source, sourceHash) => {
        host ??= { isConnected: true, dataset: {}, querySelector: () => ({}), remove() { host = null; } };
        Object.assign(host.dataset, { rmState: state, rmSource: 'independent', rmKey: key, rmSourceHash: sourceHash });
        if (state === 'error') delete host.dataset.rmReplyGenerationPlaceholder;
        paints.push({ state, html }); return host;
    };
    paint(element, identity().slot, 'waiting', 'loading', 'independent', message.mes);
    const sandbox = {
        console, Set, Map, Date: time.Date, setTimeout: time.setTimeout, clearTimeout: time.clearTimeout,
        getContext: () => ctx, getSettings: () => ({ independentGenerationTiming: 'auto' }),
        chatKey: () => 'chat', currentRuntime: () => true, runtimeMode: () => 'independent',
        automaticIndependentTiming: () => true, automaticGenerationCutovers: new Map([['chat', cutover]]),
        INDEPENDENT_INTENT_OWNER: ownerSymbol, automaticCutoverVersionToken: msg => msg.mes, swipeId: msg => msg.swipe_id,
        isRabbitMirrorEligibleAssistantMessage: msg => !!msg && !msg.is_user, messageBaseSlotKey: () => 'chat:0:0',
        currentGenerationIdentity: identity, observeMessageSourceRevision: identity, passiveObservedIdentity: identity,
        recordKey: () => identity().slot, messageElement: () => element,
        generationPolls: polls, pending: new Map(), automaticFailureStops: failures,
        operationEpochForBase: () => epoch, automaticDispatchAlreadyConsumed: () => consumed,
        activeIndependentFlightForBase: () => null, hasExistingFollowRabbitMirror: () => false,
        automaticHostGenerationRenderMatches: () => false, externalHostGenerationActivity: () => ({ active: false }),
        hostGenerationLooksActive: () => false, hostGenerationActivity: () => ({ strong: false, weak: false }),
        flightIdentity: (slot, hash) => `${slot}/${hash}`, baseSlotOf: () => 'chat:0:0', AUTOMATIC_FAILURE_STOP_LIMIT: 320,
        SOURCE_STABLE_WAIT_MS: 1400, FINAL_RENDER_SOURCE_STABLE_WAIT_MS: 520, FINAL_RENDER_POLL_INTERVAL_MS: 120,
        FINAL_RENDER_CONFIRMATION_TTL_MS: 5000, ACTIVE_GENERATION_WAIT_MS: 600000, OWNER_REATTACH_WAIT_MS: 60000,
        GENERATION_PLACEHOLDER_POLL_INTERVAL_MS: 760, WEAK_GENERATION_FLAG_GRACE_MS: 30000, WEAK_GENERATION_SOURCE_STABLE_WAIT_MS: 4500,
        exactIndependentReadyForIdentity: () => null, cancelSupersededFlightsForBase() {}, cancelFlightsForSlot() {},
        generateFor() { dispatched++; consumed = true; },
        renderAutomaticFailureStop: (_index, live, error) => paint(element, live.slot, error.message, 'error', 'independent', live.sourceHash),
        ensureExternalUi: paint,
        ensureReplyGenerationPlaceholder: (el, key, sourceHash) => paint(el, key, 'waiting', 'loading', 'independent', sourceHash),
        syncRunning: false, writeSyncRunning: value => { sandbox.syncRunning = value; },
        readStore: () => ({}), writeStore() {}, consumeIndependentDisplayModeChange: () => false,
        assistantMessages: () => [{ m: ctx.chat[0], i: 0 }], assistantRowsInScanRange: rows => rows,
        normalizeMissingShellScanRange: () => 10, restoreFollowMirrorFromMessageSource() {},
        externalHosts: () => host ? [host] : [], updateIndependentRecordContinuity: () => false,
        persistedOwnerForMessage: () => null, savedIndependentRecordForOwner: () => null,
        lockedIndependentRecordForBase: () => null, recoverSavedRecord: () => ({ saved: null, storeChanged: false }),
        findSavedRecord: () => null, collapseDuplicateIdentityHosts: () => host,
        mountedIndependentReadyHostMatchesObserved: () => false, mountedIndependentReadyHostSharesStableOwner: () => false,
        passiveIndependentFailureForIdentity: () => null, restorePassiveIndependentFailure: () => null,
        readyDetailsFromHost: () => null, usableReadyDetails: () => false,
        independentStoredHtmlRestorable: () => false, placeExternalHost() {}, refreshExistingExternalDetails() {},
        removeIndependentInlineDuplicates() {}, independentGenerationTiming: () => 'auto',
        MISSING_INDEPENDENT_RETRY_SHELL_MESSAGE: 'missing-external-shell',
    };
    const context = vm.createContext(sandbox);
    for (const [file, names] of Object.entries({
        earlyBody: ['suppressesAutomaticGeneration', 'syncMessagesCore', 'restoreMissingIndependentRetryOnElement'],
        mount: ['generationPollKey', 'generationWaitPollDelay', 'refreshUnpaidAutomaticAuthorization', 'scheduleMessageGeneration'],
        geometry: ['quickWaitingCandidate'],
        flights: ['automaticFailureKey', 'automaticFailureStopFor', 'markAutomaticFailureStop'],
        missingRetryShell: ['shouldRestoreMissingIndependentRetryShell', 'hasUsableAssistantBody', 'isMissingShellTargetFloor'],
    })) for (const name of names) install(context, file, name);
    install(context, 'earlyBody', 'hasScheduledIndependentGeneration', true);
    return { context, time, ctx, message, cutover, polls, failures, paints, element, identity,
        host: () => host, dispatches: () => dispatched,
        removeHost() { host = null; },
        start() { context.scheduleMessageGeneration(0, 200, true, true, true); assert.equal(polls.size, 1); },
        sync() { context.syncMessagesCore(new Set([0])); },
        restore() { context.restoreMissingIndependentRetryOnElement(element, 0); },
        error() { paint(element, identity().slot, 'old terminal card', 'error', 'independent', ctx.chat[0].mes); },
        fail() { context.markAutomaticFailureStop(identity().slot, identity().sourceHash, 'network', { baseSlot: 'chat:0:0', operationEpoch: epoch, message: 'network' }); },
        changeEpoch() { epoch++; },
    };
}

for (const entry of ['sync', 'restore']) {
    test(`${entry}: a body postprocess before the generation poll does not create a terminal failure`, () => {
        const h = harness(); h.start(); h.message.mes += ' postprocessed';
        h[entry]();
        assert.equal(h.failures.size, 0);
        assert.equal(h.paints.some(p => p.state === 'error'), false);
        assert.equal(h.host()?.dataset.rmState, 'loading');
        h.time.advance(2000);
        assert.equal(h.dispatches(), 1); assert.equal(h.polls.size, 0);
        h.time.advance(2000); assert.equal(h.dispatches(), 1);
    });
    test(`${entry}: historical missing output with no queued job still gets a retry card without dispatch`, () => {
        const h = harness(); h.cutover.authorized.clear(); h[entry]();
        assert.equal(h.failures.size, 1); assert.equal(h.host().dataset.rmState, 'error');
        h.time.advance(2000); assert.equal(h.dispatches(), 0);
    });
    test(`${entry}: a cancelled preparation does not suppress missing-output recovery`, () => {
        const h = harness(); h.start(); h.message.mes += ' changed'; h.polls.get('chat:0').cancelled = true;
        h[entry](); assert.equal(h.failures.size, 1);
        h.time.advance(2000); assert.equal(h.dispatches(), 0);
    });
}

test('a pre-existing terminal failure is retained and never turned into an automatic retry', () => {
    const h = harness(); h.start(); h.message.mes += ' changed'; h.fail(); h.error();
    const before = h.context.automaticFailureStopFor(h.identity().slot, h.identity().sourceHash);
    h.sync(); h.restore(); h.time.advance(2000);
    assert.equal(h.dispatches(), 0);
    assert.equal(h.context.automaticFailureStopFor(h.identity().slot, h.identity().sourceHash), before);
});

test('managed remount of an existing error shell cannot poison a still-queued preparation', () => {
    const h = harness(); h.start(); h.message.mes += ' changed'; h.error(); h.restore();
    assert.equal(h.failures.size, 0);
    h.time.advance(2000); assert.equal(h.dispatches(), 1);
});

test('replaced message or operation never receives a request from the old queued preparation', () => {
    for (const replace of [h => { h.ctx.chat[0] = { mes: 'another message', swipe_id: 0 }; }, h => { h.changeEpoch(); h.message.mes += ' newer operation'; }]) {
        const h = harness(); h.start(); replace(h); h.sync(); h.time.advance(2000);
        assert.equal(h.dispatches(), 0); assert.equal(h.polls.size, 0);
    }
});

test('a queued preparation remounts its loading shell without starting a second job', () => {
    const h = harness(); h.start(); h.message.mes += ' changed'; h.removeHost(); h.sync();
    assert.equal(h.host().dataset.rmState, 'loading'); assert.equal(h.polls.size, 1);
    h.time.advance(2000); assert.equal(h.dispatches(), 1);
});

test('a poll from another chat or floor cannot hide this floors missing-output card', () => {
    for (const key of ['other-chat:0', 'chat:1']) {
        const h = harness(); h.cutover.authorized.clear(); h.polls.set(key, { cancelled: false }); h.sync();
        assert.equal(h.host().dataset.rmState, 'error'); assert.equal(h.failures.size, 1);
    }
});

function lazyHarness(state = 'error') {
    const time = clock(), listeners = new Map();
    const message = { mes: 'unchanged body', swipe_id: 0 }, ctx = { chat: [message] };
    const textRoot = {}, element = { querySelector: () => textRoot }, face = {}, actions = {};
    let retry = { isConnected: true }, cat = { isConnected: true }, synchronizations = 0;
    const host = { isConnected: true, hidden: false, dataset: { rmSource: 'independent', rmState: state, rmKey: 'key', rmSourceHash: 'body' },
        querySelector(selector) { return selector.includes('error-retry') ? retry : selector.includes('error-cat') ? cat : null; },
        querySelectorAll(selector) { return selector.includes('error-retry') ? [actions, retry, cat].filter(Boolean) : []; },
    };
    const chat = { addEventListener: (event, fn) => listeners.set(event, fn) };
    const context = vm.createContext({ Date: time.Date, setTimeout: time.setTimeout, clearTimeout: time.clearTimeout,
        runtimeConfigSequence: 1, STARTUP_SYNC_IMMEDIATE_MESSAGES: 4, currentRuntime: () => true,
        clearStartupHistoryLazySync() {}, isRabbitMirrorManagedChatSurface: () => false,
        document: { querySelector: () => chat }, getContext: () => ctx,
        messageElement: () => element, isRabbitMirrorEligibleAssistantMessage: () => true,
        viewportMessageIndices: () => [0], externalHosts: () => [host], externalFaceDetails: () => [face],
        chatKey: () => 'chat', swipeId: msg => msg.swipe_id,
        writeStartupHistoryFallbackRoot() {}, writeStartupHistoryFallbackHandler() {},
        syncMessageBatch() { synchronizations++; retry ??= { isConnected: true }; cat ??= { isConnected: true }; host.hidden = false; },
    });
    for (const name of ['restoredHistoryProbeState', 'sameRestoredHistoryProbe', 'installStartupHistoryLazySync']) install(context, 'earlyBody', name);
    context.installStartupHistoryLazySync(); time.advance(80);
    return { host, message, count: () => synchronizations,
        event(name = 'pointerdown') { listeners.get(name)(); time.advance(80); },
        removeRetry() { retry = null; }, replaceCat() { cat = { isConnected: true }; },
    };
}

test('100 passive interactions with a stable error card do not rescan the archive 100 times', () => {
    const h = lazyHarness(); assert.equal(h.count(), 1);
    for (let i = 0; i < 100; i++) h.event(['scroll', 'pointerdown', 'focusin'][i % 3]);
    assert.equal(h.count(), 1);
});

test('error retry controls removed or replaced still trigger recovery', () => {
    const h = lazyHarness(); h.removeRetry(); h.event(); assert.equal(h.count(), 2);
    h.event(); assert.equal(h.count(), 2);
    h.replaceCat(); h.event(); assert.equal(h.count(), 3);
    h.event(); assert.equal(h.count(), 3);
});

test('body, swipe, owner stamp or state changes invalidate the passive error cache', () => {
    const h = lazyHarness(); let expected = 1;
    for (const change of [() => { h.message.mes += ' updated'; }, () => { h.message.swipe_id++; },
        () => { h.host.dataset.rmKey = 'other-owner'; }, () => { h.host.dataset.rmSourceHash = 'other-body'; },
        () => { h.host.hidden = true; }, () => { h.host.dataset.rmState = 'loading'; }]) {
        change(); h.event(); assert.equal(h.count(), ++expected);
    }
    h.event(); assert.equal(h.count(), ++expected, 'loading never caches as a settled error');
});

test('ready cards retain existing passive caching and loading remains recoverable', () => {
    const h = lazyHarness('ready'); h.event(); assert.equal(h.count(), 1);
    h.host.dataset.rmState = 'loading'; h.event(); h.event(); assert.equal(h.count(), 3);
});
