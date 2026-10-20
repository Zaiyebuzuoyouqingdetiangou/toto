import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRuntime, createStore } from './helpers/vmLoader.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const REGISTRY = 'rabbit_mirror_theater:pending_batch_registry:v3';
const LEGACY = 'rabbit_mirror_theater:pending_batch_registry:v2';
const ATTEMPTS = 'rabbit_mirror_theater:generation_attempts:v1';
const FAIRNESS = 'rabbit_mirror_theater:format_eligible_misses:v1';
let pageSequence = 0;
async function page(store = createStore()) {
    const runtime = createRuntime(root, { store });
    const pageId = ++pageSequence;
    runtime.context.Math.random = () => pageId / 10000;
    const api = await runtime.load('src/storage.js');
    let sequence = 0;
    const plan = () => api.createPendingComboBatchPlan([
        { themeIds: ['theme-1'], formatIds: ['format-1'] },
        { themeIds: ['theme-2'], formatIds: ['format-2'] },
    ], { chatKey: `chat-${pageId}`, generationScopeKey: `independent:${pageId}:${++sequence}`, mesid: 0, swipeId: 0, sourceHash: 'body', settingsKey: 'same-settings' },
    { eligibleFormatIds: ['format-1', 'format-2'], selectedFormatIds: ['format-1', 'format-2'], validFormatIds: ['format-1', 'format-2'] });
    return { api, store, plan };
}
const register = (api, plan, options = {}) => api.markPendingBatchAttempt(plan, { ...options, transient: true });
const scans = plan => plan.faces.map(({ faceIndex }) => ({ faceIndex, visualSignature: `face-${faceIndex}` }));

test('eight fresh legacy reservations do not block independent registration or get deleted', async () => {
    const owner = await page();
    for (let i = 0; i < 8; i++) assert.equal(owner.api.markPendingBatchAttempt(owner.plan()), true);
    owner.store.setItem('user:artwork', 'saved content');
    const old = owner.store.getItem(REGISTRY);
    const current = await page(owner.store), plan = current.plan();
    assert.equal(register(current.api, plan), true);
    assert.equal(current.store.getItem(REGISTRY), old);
    assert.deepEqual(current.api.findPendingComboBatchPlan(plan.identity), plan);
    assert.equal(current.api.commitPendingComboBatch(scans(plan), plan), true);
    assert.equal(current.store.getItem(REGISTRY), old);
    assert.equal(current.store.getItem('user:artwork'), 'saved content');
});

test('unreadable old registries do not block transient mark, find, commit or release', async () => {
    const h = await page(createStore([[REGISTRY, '{broken'], [LEGACY, 'foreign malformed record']]));
    const a = h.plan(), b = h.plan();
    assert.equal(register(h.api, a), true);
    assert.equal(register(h.api, b), true);
    assert.equal(h.api.findPendingComboBatchPlan(a.identity).batchId, a.batchId);
    assert.equal(h.api.commitPendingComboBatch(scans(a), a), true);
    assert.equal(h.api.releasePendingComboBatch(b), true);
    assert.equal(h.store.getItem(REGISTRY), '{broken');
    assert.equal(h.store.getItem(LEGACY), 'foreign malformed record');
});

test('refresh starts with no transient reservations and retains saved content and accounting', async () => {
    const first = await page(createStore([['user:artwork', 'saved']]));
    const plan = first.plan(); assert.equal(register(first.api, plan), true);
    const attempts = first.store.getItem(ATTEMPTS);
    assert.equal(first.store.getItem(REGISTRY), null);
    const refreshed = await page(first.store);
    assert.equal(refreshed.api.findPendingComboBatchPlan(plan.identity), null);
    assert.equal(refreshed.store.getItem(ATTEMPTS), attempts);
    assert.equal(refreshed.store.getItem('user:artwork'), 'saved');
    assert.equal(register(refreshed.api, refreshed.plan()), true);
});

test('pages share accounting but cannot find or release each others transient reservations', async () => {
    const one = await page(), two = await page(one.store);
    const a = one.plan(), b = two.plan();
    assert.equal(register(one.api, a), true); assert.equal(register(two.api, b), true);
    assert.equal(two.api.findPendingComboBatchPlan(a.identity), null);
    two.api.releasePendingComboBatch(a);
    assert.equal(one.api.findPendingComboBatchPlan(a.identity).batchId, a.batchId);
    assert.equal(one.api.commitPendingComboBatch(scans(a), a), true);
    assert.equal(two.api.commitPendingComboBatch(scans(b), b), true);
});

test('only eight actually active reservations in this page count toward capacity', async () => {
    const h = await page(), plans = Array.from({ length: 9 }, () => h.plan());
    for (const p of plans.slice(0, 8)) assert.equal(register(h.api, p), true);
    const reasons = [];
    assert.equal(register(h.api, plans[8], { onRejected: code => reasons.push(code) }), false);
    assert.deepEqual(reasons, ['BATCH_REGISTRY_CAPACITY']);
    assert.equal(h.api.releasePendingComboBatch(plans[0]), true);
    assert.equal(register(h.api, plans[8]), true);
    assert.equal(h.store.getItem(REGISTRY), null);
});

test('failed accounting write rolls back and never creates an in-memory reservation', async () => {
    const h = await page(), plan = h.plan(), original = h.store.setItem;
    h.store.setItem = function (key, value) { if (key === ATTEMPTS) throw new Error('storage denied'); return original.call(this, key, value); };
    const reasons = [];
    assert.equal(register(h.api, plan, { onRejected: code => reasons.push(code) }), false);
    assert.equal(h.api.findPendingComboBatchPlan(plan.identity), null);
    assert.equal(h.store.getItem(FAIRNESS), null);
    assert.equal(h.store.getItem(REGISTRY), null);
    assert.deepEqual(reasons, ['BATCH_STORAGE_WRITE_FAILED']);
    h.store.setItem = original;
    assert.equal(register(h.api, plan), true);
});

test('commit failure retains its reservation; success and release cannot replay the paid attempt', async () => {
    const h = await page(), plan = h.plan(); assert.equal(register(h.api, plan), true);
    const original = h.store.setItem;
    h.store.setItem = () => { throw new Error('storage denied'); };
    assert.equal(h.api.commitPendingComboBatch(scans(plan), plan), false);
    assert.equal(h.api.findPendingComboBatchPlan(plan.identity).batchId, plan.batchId);
    h.store.setItem = original;
    assert.equal(h.api.commitPendingComboBatch(scans(plan), plan), true);
    const reasons = [];
    assert.equal(register(h.api, plan, { onRejected: code => reasons.push(code) }), false);
    assert.deepEqual(reasons, ['BATCH_ATTEMPT_ALREADY_RECORDED']);
    assert.equal(h.api.findPendingComboBatchPlan(plan.identity), null);
});

test('wrong identities cannot release or commit and callers cannot mutate stored plans', async () => {
    const h = await page(), plan = h.plan(); assert.equal(register(h.api, plan), true);
    const saved = h.api.findPendingComboBatchPlan(plan.identity);
    saved.faces[0].combo.themeIds[0] = 'tampered';
    assert.equal(h.api.findPendingComboBatchPlan(plan.identity).faces[0].combo.themeIds[0], 'theme-1');
    const wrong = { ...plan, identity: { ...plan.identity, sourceHash: 'other' } };
    assert.equal(h.api.commitPendingComboBatch(scans(plan), wrong), false);
    h.api.releasePendingComboBatch(wrong);
    assert.equal(h.api.findPendingComboBatchPlan(plan.identity).batchId, plan.batchId);
    assert.equal(h.api.commitPendingComboBatch([scans(plan)[0], null], { ...plan, partial: true }), true);
});

test('follow operations cannot opt into transient registration; persistent path stays available', async () => {
    const h = await page(), plan = h.plan();
    plan.identity = { kind: 'generation-operation', chatKey: 'follow-chat', generationScopeKey: 'follow:1', operationId: 'follow:1', generationType: 'normal', settingsKey: 'same-settings', preview: false };
    const reasons = [];
    assert.equal(register(h.api, plan, { onRejected: code => reasons.push(code) }), false);
    assert.deepEqual(reasons, ['BATCH_PLAN_IDENTITY_INVALID']);
    assert.equal(h.api.markPendingBatchAttempt(plan), true);
    assert.equal(h.api.findPendingComboBatchPlan(plan.identity).batchId, plan.batchId);
});
