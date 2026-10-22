import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// 本机存储满了（writeStore 失败）、这一版已写进内存里的聊天数据但聊天还没存盘确认时：
// 正文编辑后的重说换绑、维修保存都要接着走，同时留着「尚未保存」提示。
function sourceFunction(file, name) {
    const source = readFileSync(new URL(`../src/independentApi/${file}.js`, import.meta.url), 'utf8');
    const match = source.match(new RegExp(`^(?:export )?function ${name}\\([^]*?^}\\r?$`, 'm'));
    assert.ok(match, `${name} exists`);
    return match[0].replace(/^export /, '');
}

function sandboxFor(overrides = {}) {
    const notices = [];
    const locks = [];
    const metadata = {};
    const sandbox = {
        console, Set, Map, Date, Number, String, JSON, Math, Object, Array,
        notices, locks, metadata,
        RUNTIME_VERSION: 'test', SOURCE_ATTR: 'data-rabbit-mirror-external-source', MAINTENANCE_PERSISTED_LAYOUT_ATTR: 'data-test-layout',
        hostGenerationLooksActive: () => false,
        getSettings: () => ({}),
        readStore: () => ({}), writeStore: () => false,
        saveRecordForSlot: (store, slot, record) => { store[slot] = record; },
        writePersistedOwner: (_ctx, _i, _msg, record) => { metadata.owner = record; return true; },
        persistedOwnerForMessage: () => metadata.owner || null,
        requestSafeChatSave: () => true,
        // 已写进聊天数据、等存盘：写进了，但还没确认存进聊天文件。
        writtenToChatMetadata: (_ctx, _i, _msg, html) => String(metadata.owner?.html || '') === String(html),
        savedInChatFile: () => false,
        showIndependentUnsavedOutput: (record, slot) => notices.push({ html: record.html, slot }),
        setOwnerLockForBase: (base, slot, sourceHash) => locks.push({ base, slot, sourceHash }),
        describeLocalStorageUsage: () => '',
        ...overrides,
    };
    return sandbox;
}

test('正文编辑后重说：本机存满、聊天数据等存盘时照样换绑到新正文，并留着未保存提示', () => {
    const msg = { mes: '阿雪看着阿岩。', swipe_id: 0 };
    const ctx = { chat: [{ mes: '字字字' }, msg] };
    const details = { dataset: { rabbitMirrorOwnerKey: 'old', rabbitMirrorExternalOwner: 'old', rabbitMirrorOwnerSourceHash: 'old' } };
    const host = { isConnected: true, dataset: { rmKey: 'c:1:0:old', rmSourceHash: 'old' }, querySelectorAll: () => [details] };
    const sandbox = sandboxFor({
        persistedOwnerForMessage: () => sandbox.metadata.owner || { html: '<details><summary>【兔子镜：某教】</summary><p>字</p></details>', sourceHash: 'old', ts: 1 },
        independentStoredHtmlRestorable: html => !!html,
        readyRecordFromHost: () => null, passiveObservedIdentity: () => ({}),
        messageSourceFingerprint: () => 'new', messageSlotKey: () => 'c:1:0:new',
    });
    vm.runInNewContext(`${sourceFunction('mount', 'adoptEditedIndependentMirror')}; globalThis.adopt = adoptEditedIndependentMirror;`, sandbox);
    const ok = sandbox.adopt({ ctx, index: 1, msg, host, editedSource: true, baseSlot: 'c:1:0' });
    assert.equal(ok, true);
    assert.equal(host.dataset.rmKey, 'c:1:0:new');
    assert.equal(host.dataset.rmSourceHash, 'new');
    assert.equal(details.dataset.rabbitMirrorOwnerSourceHash, 'new');
    assert.deepEqual(sandbox.locks, [{ base: 'c:1:0', slot: 'c:1:0:new', sourceHash: 'new' }]);
    assert.equal(sandbox.notices.length, 1);
    assert.equal(sandbox.notices[0].slot, 'c:1:0:new');
});

test('正文编辑后重说：聊天数据也没写上时仍按失败处理', () => {
    const msg = { mes: '阿竹笑了。', swipe_id: 0 };
    const ctx = { chat: [msg] };
    const host = { isConnected: true, dataset: { rmKey: 'c:0:0:old' }, querySelectorAll: () => [] };
    const sandbox = sandboxFor({
        persistedOwnerForMessage: () => ({ html: '<details><summary>【兔子镜：某教】</summary><p>字</p></details>', sourceHash: 'old', ts: 1 }),
        writtenToChatMetadata: () => false,
        independentStoredHtmlRestorable: html => !!html,
        readyRecordFromHost: () => null, passiveObservedIdentity: () => ({}),
        messageSourceFingerprint: () => 'new', messageSlotKey: () => 'c:0:0:new',
    });
    vm.runInNewContext(`${sourceFunction('mount', 'adoptEditedIndependentMirror')}; globalThis.adopt = adoptEditedIndependentMirror;`, sandbox);
    assert.equal(sandbox.adopt({ ctx, index: 0, msg, host, editedSource: true, baseSlot: 'c:0:0' }), false);
    assert.equal(host.dataset.rmKey, 'c:0:0:old');
    assert.deepEqual(sandbox.locks, []);
});

test('维修保存：本机存满、聊天数据等存盘时不报保存失败，并留着未保存提示', () => {
    const html = '<details><summary>【兔子镜：某教】</summary><p>阿雪修好了</p></details>';
    const msg = { mes: '阿岩回来了。', swipe_id: 0 };
    const ctx = { chat: [msg] };
    const clone = { setAttribute() {}, querySelectorAll: () => [], outerHTML: html };
    const details = { setAttribute() {}, querySelector: () => null, cloneNode: () => clone };
    const host = { isConnected: true, hidden: true, matches: () => true, dataset: { rmState: 'ready', rmSourceHash: 'sh' } };
    const identity = { ctx, index: 0, msg, slot: 'c:0:0:sh', baseSlot: 'c:0:0', sourceHash: 'sh', bodyHash: 'sh', legacySlots: [] };
    let lock = null;
    const sandbox = sandboxFor({
        messageIndexForExternalHost: () => 0, currentGenerationIdentity: () => identity,
        externalFaceDetails: () => [details], readyDetailsFromHost: () => details, usableReadyDetails: () => true,
        restoreRuntimeAnimationClone: (_d, c) => c, stripEphemeralFailureArtifacts() {}, serializeExternalFaceDetails: () => html,
        savedIndependentRecordForOwner: () => null, independentLineageOriginSlot: () => '', initialHtmlForRecord: () => '',
        scrubIndependentInteractionState: value => value, independentStoredHtmlRestorable: value => !!value,
        independentPaletteFingerprintFromHtml: () => null, independentRecordWithinBudget: () => true,
        bindIndependentRecordContinuity() {}, sealIndependentTextReplacementRecord() {},
        clearExternalHostFreshSourceState() {}, scheduleExternalShellTint() {},
        findSavedRecord: () => null,
        writePersistedOwner: (_ctx, _i, _msg, record) => { sandbox.metadata.owner = { ...record, sourceHash: 'sh' }; return true; },
        setOwnerLockForBase: (base, slot, sourceHash) => { lock = { slot, sourceHash }; },
        ownerLockForBase: () => lock,
    });
    vm.runInNewContext(`${sourceFunction('mount', 'persistIndependentRepairFromEvent')}; globalThis.persist = persistIndependentRepairFromEvent;`, sandbox);
    const detail = { host, root: details };
    const ok = sandbox.persist({ detail });
    assert.equal(detail.persistenceReason, '');
    assert.equal(ok, true);
    assert.equal(detail.persisted, true);
    assert.equal(sandbox.notices.length, 1);
    assert.equal(sandbox.notices[0].slot, 'c:0:0:sh');
});
