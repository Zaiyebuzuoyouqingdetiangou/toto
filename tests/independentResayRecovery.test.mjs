import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Exercise the real host-facing functions with a fixed owner and in-memory DOM
// boundary. No network, host chat save, or user data is used.
function sourceFunction(file, name) {
    const source = readFileSync(new URL(`../src/independentApi/${file}.js`, import.meta.url), 'utf8');
    const match = source.match(new RegExp(`^(?:export )?function ${name}\\([^]*?^}`, 'm'));
    assert.ok(match, `${name} exists`);
    return match[0].replace(/^export /, '');
}

function harness({ local, metadata, flight = null } = {}) {
    const observed = { slot: 'chat:0:0:body', sourceHash: 'body', bodyHash: 'body', revision: 1 };
    const message = { mes: 'unchanged main reply', swipe_id: 0 };
    const ctx = { chat: [message] };
    const store = local ? { [observed.slot]: local } : {};
    const host = { dataset: { rmState: 'ready', rmSourceHash: 'body' }, querySelector: () => ({}) };
    const paints = [];
    const sandbox = {
        console, Set, Map, Date, Number, String,
        currentRuntime: () => true, syncRunning: false,
        writeSyncRunning: value => { sandbox.syncRunning = value; },
        getContext: () => ctx, getSettings: () => ({}), runtimeMode: () => 'independent',
        readStore: () => store, writeStore: () => true,
        synchronizeIndependentChatPersistence: () => { throw new Error('targeted sync must stay targeted'); },
        consumeIndependentDisplayModeChange: () => false, hostGenerationLooksActive: () => false,
        isRabbitMirrorEligibleAssistantMessage: () => true,
        assistantMessages: () => [{ m: message, i: 0 }],
        assistantRowsInScanRange: rows => rows, normalizeMissingShellScanRange: () => 1,
        messageElement: () => ({}), restoreFollowMirrorFromMessageSource() {},
        externalHosts: () => [host], restoreFollowInline() {},
        updateIndependentRecordContinuity: () => false,
        observeMessageSourceRevision: () => observed, passiveObservedIdentity: () => observed,
        recordKey: () => observed.slot, messageBaseSlotKey: () => 'chat:0:0',
        persistedOwnerForMessage: () => metadata,
        writePersistedOwner: (_ctx, _i, _msg, record) => { metadata = record; return true; },
        cancelSupersededFlightsForBase() {}, cancelFlightsForSlot() {},
        activeIndependentFlightForBase: () => flight,
        independentStoredHtmlRestorable: html => !!html && html !== 'invalid',
        clearOwnerLockForBase() {}, setOwnerLockForBase() {},
        chatPersistenceSlot: () => observed.slot, swipeId: () => 0,
        saveRecordForSlot: (target, slot, record) => { target[slot] = record; },
        lockedIndependentRecordForBase: () => local ? { record: local, lock: { slot: observed.slot } } : null,
        findSavedRecord: value => value[observed.slot],
        recoverSavedRecord: () => ({ saved: null, storeChanged: false }),
        independentLineageMatchesObserved: () => false,
        collapseDuplicateIdentityHosts: () => host,
        usableReadyDetails: () => true,
        mountedIndependentReadyHostMatchesObserved: () => true,
        suppressesAutomaticGeneration: () => false, hasExistingFollowRabbitMirror: () => false,
        quickWaitingCandidate: () => false, isMissingShellTargetFloor: () => true,
        hasScheduledIndependentGeneration: () => false,
        readyDetailsFromHost: () => ({}), pending: new Map(), manualBodyOwnerCurrent: () => true,
        bindIndependentRecordContinuity: () => false,
        ensureExternalUi: (_el, _key, html, state) => {
            paints.push({ html, state });
            if (state === 'ready') host.html = html;
            else host.dataset.rmPending = 'true';
            return host;
        },
        rebuildCollapsedReadyHost() {},
        clearExternalHostFreshSourceState: () => { delete host.dataset.rmPending; },
        removeIndependentInlineDuplicates() {},
    };
    const context = vm.createContext(sandbox);
    for (const [file, name] of [
        ['connection', 'savedRecordMatchesObserved'],
        ['connection', 'savedIndependentRecordForOwner'],
        ['earlyBody', 'syncMessagesCore'],
    ]) vm.runInContext(sourceFunction(file, name), context);
    return { context, observed, ctx, message, store, host, paints, metadata: () => metadata };
}

const record = (html, ts, extra = {}) => ({ html, ts, sourceHash: 'body', ...extra });

test('owner lookup prefers newer metadata when quota leaves an older local copy', () => {
    const h = harness({ local: record('old', 1), metadata: record('new', 2) });
    assert.equal(h.context.savedIndependentRecordForOwner(h.ctx, 0, h.message, h.store).html, 'new');
});

test('owner lookup preserves newer local output and rejects a foreign source', () => {
    const h = harness({ local: record('new', 2), metadata: record('foreign', 3, { sourceHash: 'other' }) });
    assert.equal(h.context.savedIndependentRecordForOwner(h.ctx, 0, h.message, h.store).html, 'new');
});

test('explicit deletion still overrides a newer local record', () => {
    const h = harness({ local: record('new', 2), metadata: { deleted: true, ts: 1 } });
    assert.equal(h.context.savedIndependentRecordForOwner(h.ctx, 0, h.message, h.store), null);
});

test('targeted sync retains newer local content and heals stale metadata', () => {
    const h = harness({ local: record('new', 2), metadata: record('old', 1) });
    h.context.syncMessagesCore(new Set([0]));
    assert.equal(h.host.html, 'new');
    assert.equal(h.metadata().html, 'new');
});

test('targeted sync retains newer metadata after a failed local write', () => {
    const h = harness({ local: record('old', 1), metadata: record('new', 2) });
    h.context.syncMessagesCore(new Set([0]));
    assert.equal(h.host.html, 'new');
    assert.equal(h.store[h.observed.slot].html, 'new');
});

test('a settled manual request never re-enters the busy state during sync', () => {
    const flight = { manual: true, sourceHash: 'body', revision: 1, uiSettled: true };
    const h = harness({ local: record('new', 2), metadata: record('new', 2), flight });
    h.context.syncMessagesCore(new Set([0]));
    assert.equal(h.host.dataset.rmPending, undefined);
    assert.equal(h.paints.some(paint => paint.state === 'loading'), false);
});

test('an unfinished manual request still displays its busy state', () => {
    const flight = { manual: true, sourceHash: 'body', revision: 1, uiSettled: false };
    const h = harness({ local: record('old', 1), metadata: record('old', 1), flight });
    h.context.syncMessagesCore(new Set([0]));
    assert.equal(h.host.dataset.rmPending, 'true');
});

test('resay settlement clears busy UI without changing neighboring faces; generic replacement preserves busy state', () => {
    const oldFace = { isConnected: true, hasAttribute: () => true, replaceWith(next) { faces[1] = next; } };
    const faces = [{ name: 'left' }, oldFace, { name: 'right' }];
    const replacement = { setAttribute() {}, removeAttribute() {} };
    let statusRemoved = false;
    const host = {
        isConnected: true, dataset: { rmPending: 'true' }, classList: { toggle() {} },
        removeAttribute(name) { if (name === 'aria-busy') this.busy = false; }, busy: true,
        querySelector: () => ({ remove() { statusRemoved = true; } }),
    };
    const context = vm.createContext({
        externalFaceDetails: () => faces,
        parseMultifaceOutput: () => ({ ok: true, faces: [{ inner: 'left' }, { inner: 'new' }, { inner: 'right' }] }),
        usableReadyDetails: () => true, extractReadyDetails: () => replacement,
        markExternalDetails() {}, showMultifaceFace() {}, stampExternalDetailsOwnership() {},
        markSanitizedRabbitMirrorFace() {}, externalFacePresentation: () => ({}),
    });
    vm.runInContext(sourceFunction('geometry', 'clearIndependentResayStatus'), context);
    vm.runInContext(sourceFunction('geometry', 'replaceExternalMultifaceFace'), context);
    assert.equal(context.replaceExternalMultifaceFace(host, 'owner', 'independent', 'merged', 1), true);
    assert.equal(faces[1], replacement);
    assert.equal(faces[0].name, 'left');
    assert.equal(faces[2].name, 'right');
    assert.equal(host.dataset.rmPending, 'true', 'generic version restore must not settle an active request');
    const mount = readFileSync(new URL('../src/independentApi/mount.js', import.meta.url), 'utf8');
    const settledReplacement = mount.match(/if\(replacedOne\)\{([^]*?)\r?\n    \}else\{/);
    assert.ok(settledReplacement, 'successful in-place settlement branch exists');
    Object.assign(context, {
        liveHost: host, settledSourceHash: 'body', completed: {}, settledKey: 'owner', html: 'merged',
        markMountedFaceProofs() {}, scheduleExternalShellTint() {}, ensureExternalTools() {},
        scheduleIndependentReadyPostprocess() {},
    });
    vm.runInContext(settledReplacement[1], context);
    assert.equal(host.dataset.rmPending, undefined);
    assert.equal(host.busy, false);
    assert.equal(statusRemoved, true);
});
