import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createRuntime, createStore, FIXED_NOW } from './helpers/vmLoader.mjs';

// 1.68.2 避重修复：补发/重试补记、换口味按面计、近白近黑不算色族、文本面不触发深色冷却、
// 预约表自愈、按正文挑签与续篇记对、三处原本没发出去的提示接通。
const root = fileURLToPath(new URL('..', import.meta.url));
const HISTORY = 'rabbit_mirror_theater:last_combo:v11';
const ATTEMPTS = 'rabbit_mirror_theater:generation_attempts:v1';
const REGISTRY = 'rabbit_mirror_theater:pending_batch_registry:v3';
const copy = value => JSON.parse(JSON.stringify(value));

async function runtimeWith(entries = []) {
    const store = createStore(entries);
    const runtime = createRuntime(root, { store });
    return { store, runtime, storage: await runtime.load('src/storage.js') };
}

const htmlFace = (batchId, faceIndex, mechanisms = '', extra = {}) => ({
    themeIds: [`t-${batchId}-${faceIndex}`], formatIds: [`f-${batchId}-${faceIndex}`], presentationMode: 'html',
    batchId, faceIndex, ts: FIXED_NOW - 1000, visualSkeleton: mechanisms ? `mechanisms: ${mechanisms}` : '', ...extra,
});

test('retried follow faces are recorded once, grouped as one round', async () => {
    const { store, storage } = await runtimeWith();
    const combo = { themeIds: ['theme-a'], formatIds: ['format-a'], presentationMode: 'html', labels: { junk: true } };
    const scan = { signature: 'sig', skeleton: 'layout_family: scene_above_text', riskFlags: [], paletteFingerprint: { confidence: 0.9, brightness: 'light' }, interactionFamily: { id: 'flip_card_family', confidence: 1 } };
    assert.equal(storage.commitRetriedFaceHistory(combo, scan, { roundKey: 'follow-retry:c:3:0', faceIndex: 1 }), true);
    assert.equal(storage.commitRetriedFaceHistory(combo, scan, { roundKey: 'follow-retry:c:3:0', faceIndex: 1 }), true, 'idempotent');
    assert.equal(storage.commitRetriedFaceHistory(combo, scan, { roundKey: 'follow-retry:c:3:0', faceIndex: 2 }), true);
    const history = JSON.parse(store.getItem(HISTORY));
    assert.equal(history.length, 2);
    assert.ok(history.every(item => item.diversityRound === 'follow-retry:c:3:0' && item.visualSignature === 'sig'));
    assert.ok(history.every(item => !('labels' in item)), 'only accounting fields are stored');
    const families = storage.getRecentInteractionFamilies(5);
    assert.deepEqual([...new Set(families.map(item => item.diversityRound))], ['follow-retry:c:3:0']);
    assert.equal(storage.getRecentDiversityHistory(1).length, 2, 'both retried faces are one round');
    assert.equal(storage.commitRetriedFaceHistory({ presentationMode: 'html' }, scan, { roundKey: 'x', faceIndex: 0 }), false, 'no ids, no record');
});

test('long-text faces never start the dark cooldown or the recent palette lock', async () => {
    const dark = { confidence: 0.9, brightness: 'dark', darkAreaRatio: 0.8, averageLuminance: 40, hueFamily: 'blue', temperature: 'cool', saturation: 'low' };
    const { storage } = await runtimeWith([[HISTORY, JSON.stringify([
        { ...htmlFace('b1', 0), presentationMode: 'text', paletteFingerprint: dark },
    ])]]);
    assert.equal(storage.getActivePaletteCooldown(3).active, false);
    assert.equal(storage.getRecentPaletteCooldown(3).length, 0);
    const { storage: htmlStorage } = await runtimeWith([[HISTORY, JSON.stringify([{ ...htmlFace('b1', 0), paletteFingerprint: dark }])]]);
    assert.equal(htmlStorage.getActivePaletteCooldown(3).active, true, 'HTML dark faces still trigger');
});

test('near-white and near-black backgrounds are not treated as hue families', async () => {
    const { runtime } = await runtimeWith();
    const policy = await runtime.load('src/visualDiversityPolicy.js');
    const record = hex => ({ presentationMode: 'html', paletteFingerprint: { confidence: 0.9, mainColors: [hex], contentSurfaceColors: [] } });
    for (const hex of ['#FDFBF7', '#F7F9FC', '#12141C', '#F5F0E6']) assert.deepEqual([...policy.recentPaletteHueFamilies([record(hex)])], [], hex);
    assert.deepEqual([...policy.recentPaletteHueFamilies([record('#F3E9D2')])], ['orange'], 'cream still counts');
    assert.deepEqual([...policy.recentPaletteHueFamilies([record('#1E2433')])], ['blue'], 'navy still counts');
});

test('soft-tone family assignment names the real HTML face numbers in mixed batches', async () => {
    const { runtime } = await runtimeWith();
    const policy = await runtime.load('src/visualDiversityPolicy.js');
    const two = policy.softLightVisualGenerationRule({ visualToneMode: 'soft' }, { faceCount: 2, faceNumbers: [2, 3] });
    assert.match(two, /各面主色族：第 2 面.+第 3 面/);
    assert.doesNotMatch(two, /第 1 面/);
    const one = policy.softLightVisualGenerationRule({ visualToneMode: 'soft' }, { faceCount: 1, faceNumbers: [3] });
    assert.match(one, /主色族：第 3 面.+在这一色族里/);
    assert.match(policy.softLightVisualGenerationRule({ visualToneMode: 'soft' }, { faceCount: 1 }), /本面主色族/);
});

test('an unreadable registry row older than 30 minutes no longer locks multi-face dispatch', async () => {
    const plan = async storage => storage.createPendingComboBatchPlan(
        [{ themeIds: ['a'], formatIds: ['b'] }, { themeIds: ['c'], formatIds: ['d'] }],
        { chatKey: 'chat', generationScopeKey: 'follow:scope', mesid: 1, swipeId: 0, sourceHash: 'h', settingsKey: 's' },
        { eligibleFormatIds: [], selectedFormatIds: [], validFormatIds: [] });
    const stale = [{ planPayload: { encoding: 'unknown', data: 'x' }, registrySession: 'old', createdAt: FIXED_NOW - 31 * 60 * 1000 }];
    const { store, storage } = await runtimeWith([[REGISTRY, JSON.stringify(stale)]]);
    const value = await plan(storage);
    assert.equal(storage.markPendingBatchAttempt(value), true);
    const rows = JSON.parse(store.getItem(REGISTRY));
    assert.equal(rows.length, 1, 'the unreadable old row is cleaned on the next write');
    assert.equal(storage.releasePendingComboBatch({ batchId: value.batchId, identity: value.identity }), true);
});

test('reservations left by other page sessions are reclaimed after 30 minutes, not 12 hours', async () => {
    const first = await runtimeWith();
    const make = (index, at) => first.storage.createPendingComboBatchPlan(
        [{ themeIds: [`a${index}`], formatIds: ['b'] }, { themeIds: [`c${index}`], formatIds: ['d'] }],
        { chatKey: 'chat', generationScopeKey: `follow:${index}`, mesid: index, swipeId: 0, sourceHash: 'h', settingsKey: 's' },
        { eligibleFormatIds: [], selectedFormatIds: [], validFormatIds: [] });
    for (let index = 0; index < 8; index += 1) assert.equal(first.storage.markPendingBatchAttempt(make(index)), true);
    const rows = JSON.parse(first.store.getItem(REGISTRY));
    // The test VM has a fixed clock and seeded random, so mark the rows as another page explicitly.
    const aged = minutes => rows.map(row => ({ ...row, registrySession: 'closed-page', createdAt: FIXED_NOW - minutes * 60 * 1000 }));
    // A new page session (fresh module) sees eight rows written by the old session.
    const fresh = await runtimeWith([[REGISTRY, JSON.stringify(aged(10))]]);
    const codes = [];
    assert.equal(fresh.storage.markPendingBatchAttempt(make(20), { onRejected: code => codes.push(code) }), false);
    assert.deepEqual(codes, ['BATCH_REGISTRY_CAPACITY'], 'recent foreign rows may still be live');
    const old = await runtimeWith([[REGISTRY, JSON.stringify(aged(31))]]);
    const oldCodes = [];
    assert.equal(old.storage.markPendingBatchAttempt(make(21), { onRejected: code => oldCodes.push(code) }), true, oldCodes.join(','));
    assert.equal(JSON.parse(old.store.getItem(REGISTRY)).length, 1);
    // This page's own rows keep the 12-hour rule (the VM reuses the same session token).
    const own = await runtimeWith([[REGISTRY, JSON.stringify(rows.map(row => ({ ...row, createdAt: FIXED_NOW - 31 * 60 * 1000 })))]]);
    assert.equal(own.storage.markPendingBatchAttempt(make(22)), false);
});

test('atmosphere menus: the hard cooldown row is corrected to the ticket the model chose', async () => {
    const { store, storage } = await runtimeWith();
    const menu = [
        { themeIds: ['t-first'], formatIds: ['f-first'], themeGroups: ['g1'], formatGroups: ['h1'] },
        { themeIds: ['t-chosen'], formatIds: ['f-chosen'], themeGroups: ['g2'], formatGroups: ['h2'] },
    ];
    const combos = [
        { themeIds: ['t-first'], formatIds: ['f-first'], atmosphereMenu: copy(menu) },
        { themeIds: ['t-other'], formatIds: ['f-other'] },
    ];
    const plan = storage.createPendingComboBatchPlan(combos,
        { chatKey: 'chat', generationScopeKey: 'follow:menu', mesid: 1, swipeId: 0, sourceHash: 'h', settingsKey: 's' },
        { eligibleFormatIds: [], selectedFormatIds: [], validFormatIds: [] });
    assert.equal(storage.markPendingBatchAttempt(plan), true);
    const scans = [{ faceIndex: 0, signature: 'a' }, { faceIndex: 1, signature: 'b' }];
    assert.equal(storage.commitPendingComboBatch(scans, { batchId: plan.batchId, identity: plan.identity, chosenTickets: [1, null] }), true);
    const rows = JSON.parse(store.getItem(ATTEMPTS)).chat;
    const row = rows.find(item => item.attemptId === `${plan.batchId}:0`);
    assert.deepEqual(row.themeIds, ['t-chosen']);
    assert.deepEqual(row.formatIds, ['f-chosen']);
    assert.deepEqual(rows.find(item => item.attemptId === `${plan.batchId}:1`).themeIds, ['t-other']);
});

test('single-face selection commit also corrects its hard cooldown row', async () => {
    const { store, storage } = await runtimeWith();
    const chatKey = storage.getCurrentChatKey();
    const combo = { themeIds: ['t-first'], formatIds: ['f-first'], atmosphereMenu: [
        { themeIds: ['t-first'], formatIds: ['f-first'] }, { themeIds: ['t-chosen'], formatIds: ['f-chosen'] }] };
    assert.equal(storage.recordGenerationAttempt(combo, { chatKey, attemptId: 'independent:single' }), true);
    const selection = storage.createVisualHistorySelection(combo, 'independent:single');
    const resolved = storage.resolveVisualHistorySelection(selection, 1);
    assert.equal(storage.commitVisualHistorySelection(resolved, { signature: 's' }), true);
    const row = JSON.parse(store.getItem(ATTEMPTS))[chatKey].find(item => item.attemptId === 'independent:single');
    assert.deepEqual(row.themeIds, ['t-chosen']);
});

test('single-face sequel retargets the cooldown row and pending record to the format actually used', async () => {
    const { store, storage } = await runtimeWith();
    const chatKey = storage.getCurrentChatKey();
    const combo = { themeIds: ['t'], formatIds: ['f-drawn'], formatGroups: ['g-drawn'] };
    assert.equal(storage.recordGenerationAttempt(combo, { chatKey, attemptId: 'follow:seq' }), true);
    storage.setPendingCombo(combo, 'follow:seq');
    assert.equal(storage.retargetSingleAttemptFormat('follow:seq', { formatIds: ['f-sequel'], formatGroups: ['g-sequel'] }), true);
    const row = JSON.parse(store.getItem(ATTEMPTS))[chatKey][0];
    assert.deepEqual(row.formatIds, ['f-sequel']);
    const pending = JSON.parse(store.getItem('rabbit_mirror_theater:pending_combo:v3') || store.getItem([...store.values.keys()].find(key => /pending_combo/.test(key))));
    assert.deepEqual(pending.formatIds, ['f-sequel']);
    assert.equal(storage.retargetSingleAttemptFormat('other', { formatIds: ['x'] }), false, 'other generations are untouched');
});

test('interaction rotations count the last three HTML faces, not every face of three rounds', async () => {
    const rounds = [
        htmlFace('r1', 0, 'pick'), htmlFace('r1', 1, 'draw'), htmlFace('r1', 2, 'hold'),
        htmlFace('r2', 0, 'pick'), htmlFace('r2', 1, 'reorder'), htmlFace('r2', 2, 'accumulate'),
    ];
    const render = async history => {
        const { runtime } = await runtimeWith([[HISTORY, JSON.stringify(history)]]);
        const settingsModule = await runtime.load('src/settings.js');
        const prompt = await runtime.load('src/promptBuilder.js');
        const settings = { ...copy(settingsModule.defaultSettings), generationSource: 'independent', rabbitMirrorFaceCount: 1 };
        const plan = prompt.planRabbitMirrorPromptDetails(settings, 'independent', null, 'independent:rotation', {});
        return prompt.renderRabbitMirrorPromptPlan(plan, null, null, null).executionLock;
    };
    const first = await render(rounds);
    assert.doesNotMatch(first, /一排按钮切换不同内容|交互多是翻面、展开或切页/, 'one tab face per batch no longer triggers a rotation');
    assert.match(await render([...rounds, htmlFace('r3', 0, 'pick,draw'), htmlFace('r3', 1, 'pager,hold')]), /一排按钮切换不同内容/, 'two of the last three faces still rotate');
});

test('recent repeated interaction families now reach the batch rule', async () => {
    const { runtime } = await runtimeWith();
    const diversity = await runtime.load('src/batchInteractionDiversity.js');
    const recent = [
        { id: 'flip_card_family', diversityRound: 'a' }, { id: 'flip_card_family', diversityRound: 'a' },
        { id: 'tabbed_radio_family', diversityRound: 'a' }, { id: 'tabbed_radio_family', diversityRound: 'b' },
    ];
    const hints = diversity.planBatchInteractionDiversity(2, { enabled: true, recentFamilies: recent, presentationModes: ['html', 'html'] });
    assert.deepEqual([...hints[0].recentAvoidFamilyIds], ['tabbed_radio_family'], 'two faces in one round is not two rounds');
    const rule = diversity.buildBatchInteractionDiversityRule(hints.map(interactionDiversity => ({ presentationMode: 'html', interactionDiversity })), {});
    assert.match(rule, /近期多轮重复的交互家族：并列标签／多按钮切页/);
});

test('manual retry sends the previous version note and the palette short lock', async () => {
    const dark = { confidence: 0.9, brightness: 'dark', darkAreaRatio: 0.8, averageLuminance: 40, hueFamily: 'blue', temperature: 'cool', saturation: 'low', mainColors: ['#1E2433'], contentSurfaceColors: [] };
    const { runtime } = await runtimeWith([[HISTORY, JSON.stringify([{ ...htmlFace('p1', 0), paletteFingerprint: dark }])]]);
    const settingsModule = await runtime.load('src/settings.js');
    const prompt = await runtime.load('src/promptBuilder.js');
    const settings = { ...copy(settingsModule.defaultSettings), generationSource: 'independent', rabbitMirrorFaceCount: 1 };
    const plan = prompt.planRabbitMirrorPromptDetails(settings, 'independent', null, 'independent:manual', {});
    const source = () => ({ previousSkeleton: 'layout_family: scene_above_text', previousPalette: { confidence: 0.9, mainColors: ['#E8D5F0'], contentSurfaceColors: [] }, recent: [] });
    const lock = prompt.renderRabbitMirrorPromptPlan(plan, null, null, null, source).executionLock;
    assert.match(lock, /这次是重新生成：同一位置上一版布局与操作是「上方画面，下方文字」，主背景／主承载用的是「紫色族」/);
    assert.match(lock, /配色短锁：.*普通模式深色冷却剩余/);
    assert.doesNotMatch(lock.match(/配色短锁：[^\n]*/)?.[0] || '', /蓝/, 'hue already named by the short check is not repeated under another name');
    const plain = prompt.renderRabbitMirrorPromptPlan(prompt.planRabbitMirrorPromptDetails(settings, 'independent', null, 'independent:manual2', {}), null, null, null).executionLock;
    assert.doesNotMatch(plain, /这次是重新生成/);
});

test('follow retry helper records recovered faces from the metadata actually sent', async () => {
    const { store, runtime } = await runtimeWith();
    const settingsModule = await runtime.load('src/settings.js');
    const prompt = await runtime.load('src/promptBuilder.js');
    const helper = await runtime.load('src/followRetryHistory.js');
    const settings = { ...copy(settingsModule.defaultSettings), generationSource: 'follow', rabbitMirrorFaceCount: 2 };
    const plan = prompt.planRabbitMirrorPromptDetails(settings, 'independent', null, 'follow-reroll:test', {});
    const metadata = prompt.renderRabbitMirrorPromptPlan(plan, null, null, null).metadata;
    const combo = helper.followRetryCombo(metadata, 1, null);
    assert.ok(combo?.themeIds?.length || combo?.formatIds?.length, 'combo from sent metadata');
    assert.deepEqual([...combo.themeIds], [...plan.batchPlan.faces[1].combo.themeIds]);
    const html = '<toto data-rabbit-mirror="true" data-rm-face="1"><details><summary>一</summary></details></toto>\n'
        + '<toto data-rabbit-mirror="true" data-rm-face="2"><details><summary>二</summary><p>补回</p></details></toto>';
    const chat = [{ is_user: false, mes: html, swipe_id: 0 }];
    const scanned = [];
    const scanHtml = source => { scanned.push(source); return { signature: 'retry-sig', skeleton: '', riskFlags: [] }; };
    const recorded = await helper.recordFollowRetriedFaces({ chat, index: 0, message: chat[0], html, combos: { 1: combo }, scanHtml });
    assert.equal(scanned.length, 1);
    assert.match(scanned[0], /data-rm-face="2"[\s\S]*补回/);
    assert.equal(recorded, 1);
    const history = JSON.parse(store.getItem(HISTORY));
    assert.equal(history.length, 1);
    assert.equal(history[0].historyId.endsWith(':1'), true);
    assert.equal(history[0].visualSignature, 'retry-sig');
    assert.match(history[0].diversityRound, /^follow-retry:/);
    assert.equal(helper.followRetryCombo(null, 0, { themeIds: ['fallback'] }).themeIds[0], 'fallback');
});

test('follow retry faces join the original batch round when the partial result knows it', async () => {
    const { store, runtime } = await runtimeWith();
    const partial = await runtime.load('src/followPartialResults.js');
    const helper = await runtime.load('src/followRetryHistory.js');
    const storage = await runtime.load('src/storage.js');
    const proof = await runtime.load('src/multifaceProof.js');
    const protocol = await runtime.load('src/multifaceProtocol.js');
    const failed = protocol.createMultifaceFailureSlot(1, 'incomplete-face');
    const first = '<toto data-rabbit-mirror="true" data-rm-face="1"><details><summary>一</summary></details></toto>';
    const chat = [{ is_user: false, mes: '正文', swipe_id: 0 }];
    const owner = { chatKey: storage.getCurrentChatKey(chat), messageIndex: 0, swipeId: 0, sourceHash: proof.rabbitMirrorMultifaceSourceHash(chat[0].mes), message: chat[0] };
    assert.equal(partial.saveFollowPartialResult(chat, 0, owner, `${first}\n${failed}`, [{ faceIndex: 1, status: 'failed', code: 'incomplete-face' }], [], 'batch-origin'), true);
    assert.equal(partial.readFollowPartialResult(chat, 0).historyRound, 'batch-origin');
    const html = `${first}\n<toto data-rabbit-mirror="true" data-rm-face="2"><details><summary>二</summary><p>补回</p></details></toto>`;
    assert.ok(partial.saveFollowCompletedRetryResult(chat, 0, owner, html, []));
    assert.equal(partial.readFollowPartialResult(chat, 0).historyRound, 'batch-origin', 'kept after completion');
    const recorded = await helper.recordFollowRetriedFaces({ chat, index: 0, message: chat[0], html,
        combos: { 1: { themeIds: ['t'], formatIds: ['f'], presentationMode: 'html' } }, scanHtml: () => ({ signature: 's' }) });
    assert.equal(recorded, 1);
    const history = JSON.parse(store.getItem(HISTORY));
    assert.equal(history[0].batchId, 'batch-origin');
    assert.equal(history[0].faceIndex, 1);
    assert.equal('diversityRound' in history[0], false);
});

test('favorite x3 inside a large theme family appears more often than a single-item favorite at x1', async () => {
    const { runtime } = await runtimeWith();
    const settingsModule = await runtime.load('src/settings.js');
    const picker = await runtime.load('src/picker.js');
    const storage = await runtime.load('src/storage.js');
    const x1 = ['B.0', 'B.1', 'B.4'], x3 = ['A.2.1', 'A.1.1', 'B.7.1'];
    settingsModule.updateSettings({ favoriteThemeIds: [...x1, ...x3], rabbitMirrorFaceCount: 1,
        favoriteThemeMultipliers: Object.fromEntries([...x1.map(id => [id, 1]), ...x3.map(id => [id, 3])]) });
    const count = new Map();
    for (let index = 0; index < 700; index += 1) {
        const result = picker.pickCombination(settingsModule.getSettings(), `follow:fav-${index}`, {});
        for (const id of (result?.combo || result)?.themeIds || []) count.set(id, (count.get(id) || 0) + 1);
        storage.commitPendingCombo('', '', [], null, null);
    }
    const total = ids => ids.reduce((sum, id) => sum + (count.get(id) || 0), 0);
    assert.ok(total(x3) > total(x1) * 1.15, `x3 ${total(x3)} vs x1 ${total(x1)}`);
});
