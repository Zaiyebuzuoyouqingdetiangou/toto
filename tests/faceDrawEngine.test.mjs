import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const plain = value => JSON.parse(JSON.stringify(value));

class MemoryStorage {
    rows = new Map(); fail = '';
    getItem(key) { return this.rows.get(key) ?? null; }
    setItem(key, value) {
        if (this.fail && key.includes(this.fail)) throw Object.assign(new Error('storage unavailable'), { name: 'QuotaExceededError' });
        this.rows.set(key, String(value));
    }
    removeItem(key) { this.rows.delete(key); }
    key(index) { return [...this.rows.keys()][index] ?? null; }
    get length() { return this.rows.size; }
}

async function harness() {
    const localStorage = new MemoryStorage(), modules = new Map();
    const host = { chatId: 'fixture-chat', chat: [{ is_user: true, mes: '继续故事', name: 'user' }] };
    const math = Object.create(Math); math.random = () => 0;
    const context = vm.createContext({ console: { ...console, warn() {} }, Math: math, Date, Uint32Array,
        localStorage, sessionStorage: new MemoryStorage(), structuredClone, setTimeout, clearTimeout,
        SillyTavern: { getContext: () => host }, location: { pathname: '/' },
    });
    const extensionSettings = {};
    async function getModule(filename) {
        filename = path.resolve(filename.split('?')[0]);
        if (modules.has(filename)) return modules.get(filename);
        let module;
        if (!filename.startsWith(root + path.sep)) {
            const exports = filename.endsWith('extensions.js') ? { extension_settings: extensionSettings }
                : filename.endsWith('script.js') ? { saveSettingsDebounced() {} } : null;
            assert.ok(exports, `Unexpected host dependency: ${filename}`);
            module = new vm.SyntheticModule(Object.keys(exports), function () {
                for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
            }, { context, identifier: filename });
        } else module = new vm.SourceTextModule(fs.readFileSync(filename, 'utf8'), { context, identifier: filename });
        modules.set(filename, module); return module;
    }
    const linker = (specifier, referencing) => getModule(path.resolve(path.dirname(referencing.identifier), specifier));
    async function load(relative) {
        const module = await getModule(path.join(root, relative));
        if (module.status === 'unlinked') await module.link(linker);
        if (module.status === 'linked') await module.evaluate();
        return module.namespace;
    }
    const picker = await load('src/picker.js'), storage = await load('src/storage.js');
    const schema = await load('src/faceDrawRules.js'), pool = await load('src/externalWorldBook/externalPool.js');
    const { defaultSettings } = await load('src/settings.js');
    const { THEMATIC_CATEGORIES } = await load('data/structured/thematicIndex.js');
    const { PRESENTATION_FORMATS } = await load('data/structured/presentationIndex.js');
    const themes = plain(THEMATIC_CATEGORIES.filter(item => item.group === 'C').slice(0, 4));
    const formats = plain(PRESENTATION_FORMATS.filter(item => item.id !== '10.2.2').slice(0, 4));
    const base = plain(defaultSettings);
    const settings = (rules, extra = {}) => ({ ...base, enabled: true, autoRabbitMirrorInjection: true,
        rabbitMirrorFaceCount: rules.length || 1, rabbitMirrorFaceDrawRules: schema.normalizeFaceDrawRules(rules),
        rabbitMirrorPresentationModes: ['html', 'html', 'html', 'html', 'html'], ...extra });
    const rule = (theme = {}, format = {}, text = {}) => schema.normalizeFaceDrawRule({ enabled: true, theme, format, text });
    const batch = (st, scope = 'independent:batch', legacy = false) => picker.pickCombinationBatch(st, scope,
        { batchIdentity: { mesid: 0, swipeId: 0, sourceHash: 'fixture-hash' }, ...(legacy ? {} : { batchPlanningOnly: true }) }, st.rabbitMirrorFaceCount);
    const commit = combo => {
        const selected = storage.createVisualHistorySelection(combo);
        return { selected, ok: storage.commitVisualHistorySelection(selected, {}) };
    };
    return { picker, storage, schema, pool, themes, formats, settings, rule, batch, commit, localStorage, host, load };
}

test('each face uses its own pool and residents may repeat across faces', async () => {
    const h = await harness();
    const same = h.themes[0].id;
    const st = h.settings(h.formats.slice(0, 3).map(item => h.rule({ requiredIds: [same] },
        { mode: 'random', scope: 'selected', itemIds: [item.id], min: 1, max: 1 })));
    const faces = h.batch(st);
    assert.deepEqual(plain(faces.map(face => face.combo.themeIds)), [[same], [same], [same]]);
    assert.deepEqual(plain(faces.map(face => face.combo.formatIds)), h.formats.slice(0, 3).map(item => [item.id]));
    assert.equal(faces.batchPlan.faces.length, 3);
});

test('residents are excluded from random additions, and format-only requires no theme', async () => {
    const h = await harness();
    const st = h.settings([h.rule({}, { requiredIds: [h.formats[0].id], mode: 'random', scope: 'selected',
        itemIds: [h.formats[0].id, h.formats[1].id], min: 1, max: 1 })]);
    const result = h.picker.pickCombination(st, 'scope');
    assert.deepEqual(plain(result.combo.themeIds), []);
    assert.deepEqual(plain(result.combo.formatIds), h.formats.slice(0, 2).map(item => item.id));
    assert.equal(result.combo.samplingMode, 'format_only');
});

test('category scopes expand only their category and explicit items can extend it', async () => {
    const h = await harness();
    const st = h.settings([h.rule({ mode: 'random', scope: 'selected', categoryIds: ['builtin:C'],
        itemIds: [], min: 1, max: 1 }, { requiredIds: [h.formats[0].id] })]);
    for (let i = 0; i < 8; i += 1) {
        assert.ok(h.picker.pickCombination(st, `category:${i}`).combo.themes.every(item => item.group === 'C'));
    }
});

test('configured scope overrides global worldbook, scenery, atmosphere and format-only switches', async () => {
    const h = await harness();
    const st = h.settings([h.rule({ requiredIds: [h.themes[0].id] }, { requiredIds: [h.formats[0].id] })],
        { lotterySource: 'worldbook', lotteryMethod: 'atmosphere', forceVisualScenery: true,
            visualSceneryCombination: true, samplingMode: 'format_only' });
    const { combo } = h.picker.pickCombination(st, 'overrides');
    assert.deepEqual(plain(combo.themeIds), [h.themes[0].id]);
    assert.deepEqual(plain(combo.formatIds), [h.formats[0].id]);
    assert.equal(combo.forcedVisualScenery, false);
    assert.equal(combo.atmosphereMenu, undefined);
    assert.equal(combo.worldBookEntryId, undefined);
});

test('enabled external libraries participate with global mix off and text preserves selected presentation', async () => {
    const h = await harness();
    const ext = 'ext:fixture:text:one';
    h.pool.setExternalPoolSnapshot([{ libraryId: 'fixture', enabled: true }], { fixture:
        [{ externalId: ext, classification: 'text', enabled: true, userConfirmed: true }] });
    const r = h.rule({ requiredIds: [h.themes[0].id] }, {}, { requiredIds: [ext] });
    const st = h.settings([r, r], { externalWorldBookRandomEnabled: false, externalWorldBookMixMode: 'builtin-only',
        rabbitMirrorPresentationModes: ['html', 'longtext', 'html', 'html', 'html'] });
    const faces = h.batch(st, 'independent:mixed');
    assert.deepEqual(plain(faces.map(face => face.combo.textIds)), [[ext], [ext]]);
    assert.deepEqual(plain(faces.map(face => face.combo.presentationMode)), ['html', 'text']);
    assert.ok(faces.batchPlan);
    h.pool.clearExternalPoolSnapshot();
    assert.throws(() => h.picker.pickCombination(st, 'disabled'), error => error.reasonCode === 'FACE_DRAW_REQUIRED_UNAVAILABLE');
});

test('required blacklist conflict and empty selected pool report preflight without global fallback', async () => {
    const h = await harness();
    const r = h.rule({ requiredIds: [h.themes[0].id] }, { requiredIds: [h.formats[0].id] });
    assert.throws(() => h.picker.pickCombination(h.settings([r], { blacklistedThemeIds: [h.themes[0].id], blacklistEnabled: true }), 'blocked'),
        error => error.reasonCode === 'FACE_DRAW_REQUIRED_UNAVAILABLE' && error.requestCount === 0);
    const empty = h.rule({}, { mode: 'random', scope: 'selected', itemIds: ['missing'], min: 1, max: 1 });
    assert.throws(() => h.picker.pickCombination(h.settings([empty]), 'empty'), error => error.reasonCode === 'FACE_DRAW_POOL_EXHAUSTED');
});

test('sequence advances only after success, preserves frozen retries, wraps and remains chat-local', async () => {
    const h = await harness();
    const st = h.settings([h.rule({}, { mode: 'sequence', scope: 'selected', itemIds: h.formats.slice(0, 2).map(item => item.id), min: 1, max: 1 })]);
    const first = h.picker.pickCombination(st, 'sequence:first');
    assert.equal(first.combo.formatIds[0], h.formats[0].id);
    assert.equal(h.storage.readFaceDrawCursor(first.combo.faceDrawState.steps[0]), 0);
    assert.equal(h.picker.pickCombination(st, 'sequence:first'), first);
    const { selected, ok } = h.commit(first.combo); assert.equal(ok, true);
    assert.equal(h.storage.commitVisualHistorySelection(selected, {}), true);
    assert.equal(h.storage.readFaceDrawCursor(first.combo.faceDrawState.steps[0]), 1);
    const second = h.picker.pickCombination(st, 'sequence:second');
    assert.equal(second.combo.formatIds[0], h.formats[1].id);
    assert.equal(h.commit(second.combo).ok, true);
    assert.equal(h.picker.pickCombination(st, 'sequence:third').combo.formatIds[0], h.formats[0].id);
    h.host.chatId = 'other-chat';
    assert.equal(h.picker.pickCombination(st, 'sequence:other').combo.formatIds[0], h.formats[0].id);
});

test('sequence advances by actual additions and lasts beyond rolling history retention', async () => {
    const h = await harness();
    const st = h.settings([h.rule({}, { mode: 'sequence', scope: 'selected', itemIds: h.formats.map(item => item.id), min: 2, max: 2 })]);
    let identity;
    for (let i = 0; i < 30; i += 1) {
        const { combo } = h.picker.pickCombination(st, `many:${i}`);
        identity = combo.faceDrawState.steps[0];
        assert.deepEqual(plain(combo.formatIds), i % 2 ? h.formats.slice(2).map(item => item.id) : h.formats.slice(0, 2).map(item => item.id));
        assert.equal(h.commit(combo).ok, true);
    }
    assert.equal(h.storage.getComboHistory(100).length, 25);
    assert.equal(h.storage.readFaceDrawCursor(identity), 60);
});

test('failed cursor storage write rolls history back and the identical result can be committed later', async () => {
    const h = await harness();
    const st = h.settings([h.rule({}, { mode: 'sequence', scope: 'selected', itemIds: h.formats.map(item => item.id), min: 1, max: 1 })]);
    const { combo } = h.picker.pickCombination(st, 'quota');
    const selected = h.storage.createVisualHistorySelection(combo);
    h.localStorage.fail = 'face_draw_cursors';
    assert.equal(h.storage.commitVisualHistorySelection(selected, {}), false);
    assert.equal(h.storage.getComboHistory(100).length, 0);
    assert.equal(h.storage.readFaceDrawCursor(combo.faceDrawState.steps[0]), 0);
    h.localStorage.fail = '';
    assert.equal(h.storage.commitVisualHistorySelection(selected, {}), true);
    assert.equal(h.storage.readFaceDrawCursor(combo.faceDrawState.steps[0]), 1);
});

test('partial batch advances successful faces only and replayed selection does not advance again', async () => {
    const h = await harness();
    const r = h.rule({}, { mode: 'sequence', scope: 'selected', itemIds: h.formats.map(item => item.id), min: 1, max: 1 });
    const st = h.settings([r, r]);
    const faces = h.batch(st, 'independent:partial'), plan = faces.batchPlan;
    assert.equal(h.storage.markPendingBatchAttempt(plan, { transient: true }), true);
    assert.equal(h.storage.commitPendingComboBatch([{}, null], { batchId: plan.batchId, identity: plan.identity, partial: true }), true);
    assert.equal(h.storage.readFaceDrawCursor(faces[0].combo.faceDrawState.steps[0]), 1);
    assert.equal(h.storage.readFaceDrawCursor(faces[1].combo.faceDrawState.steps[0]), 0);
    const restored = h.picker.pickCombinationForMultifaceResay(st, { faceIndex: 0, faces: faces.map(face => face.combo), preserveSelection: true });
    assert.deepEqual(plain(restored.combo.faceDrawState), plain(faces[0].combo.faceDrawState));
    assert.equal(h.commit(restored.combo).ok, true);
    assert.equal(h.storage.readFaceDrawCursor(faces[0].combo.faceDrawState.steps[0]), 1);
});

test('legacy batch path supports identical resident items and serial frozen selections', async () => {
    const h = await harness();
    const r = h.rule({ requiredIds: [h.themes[0].id] }, { requiredIds: [h.formats[0].id] });
    const st = h.settings([r, r]);
    const faces = h.batch(st, 'legacy:batch', true);
    assert.equal(faces.length, 2);
    assert.deepEqual(plain(faces[0].combo.themeIds), plain(faces[1].combo.themeIds));
    assert.equal(h.storage.readPendingComboBatch()?.batchId, faces[0].batchId);
});

test('unconfigured settings do not read or write draw cursors and explicit directives retain precedence', async () => {
    const h = await harness();
    const st = h.settings([]);
    h.picker.pickCombination(st, 'ordinary');
    assert.ok(![...h.localStorage.rows.keys()].some(key => key.includes('face_draw_cursors')));
    const configured = h.settings([h.rule({}, { requiredIds: [h.formats[0].id] })], { userDirectivePriority: true });
    h.host.chat[0].mes = '关闭兔子镜';
    const result = h.picker.pickCombination(configured, 'directive');
    assert.equal(result.disabled, true);
});

test('redrawing original face 2 uses its own rule and cursor with collapsed presentation settings', async () => {
    const h = await harness();
    const st = h.settings([h.rule({}, { requiredIds: [h.formats[0].id] }),
        h.rule({}, { mode: 'sequence', scope: 'selected', itemIds: h.formats.slice(1, 3).map(item => item.id), min: 1, max: 1 })]);
    const before = h.batch(st, 'independent:old');
    const collapsed = { ...st, rabbitMirrorFaceCount: 1, rabbitMirrorPresentationModes: ['longtext'] };
    const redrawn = h.picker.pickCombinationForMultifaceResay(collapsed,
        { faceIndex: 1, faces: before.map(face => face.combo) }, 'redraw:face2');
    assert.equal(redrawn.combo.formatIds[0], h.formats[1].id);
    assert.equal(redrawn.combo.presentationMode, 'text');
    assert.equal(redrawn.combo.faceDrawState.steps[0].faceIndex, 1);
    assert.equal(h.commit(redrawn.combo).ok, true);
    const next = h.picker.pickCombination(collapsed, 'serial:face2', { serialFaceIndex: 1 });
    assert.equal(next.combo.formatIds[0], h.formats[2].id);
    assert.equal(next.combo.faceDrawState.steps[0].faceIndex, 1);
});

test('text-only configured faces work in HTML and longtext without unrelated theme/format availability', async () => {
    const h = await harness(), ext = 'ext:fixture:text:solo';
    h.pool.setExternalPoolSnapshot([{ libraryId: 'fixture', enabled: true }], { fixture:
        [{ externalId: ext, classification: 'text', enabled: true, userConfirmed: true }] });
    const r = h.rule({}, {}, { mode: 'sequence', scope: 'selected', categoryIds: ['external:fixture'], min: 1, max: 1 });
    const st = h.settings([r, r], { rabbitMirrorPresentationModes: ['html', 'longtext'] });
    const faces = h.batch(st, 'independent:text-only');
    assert.deepEqual(plain(faces.map(face => [face.combo.themeIds, face.combo.formatIds, face.combo.textIds])),
        [[[], [], [ext]], [[], [], [ext]]]);
    assert.deepEqual(plain(faces.map(face => face.combo.presentationMode)), ['html', 'text']);
});

test('successful restored selection stays idempotent and old epoch cannot overwrite changed settings', async () => {
    const h = await harness();
    const lane = ids => ({ mode: 'sequence', scope: 'selected', itemIds: ids, min: 1, max: 1 });
    const st = h.settings([h.rule({}, lane(h.formats.slice(0, 2).map(item => item.id)))]);
    const first = h.picker.pickCombination(st, 'epoch:first').combo;
    assert.equal(h.commit(first).ok, true);
    const changed = h.settings([h.rule({}, lane(h.formats.slice(2, 4).map(item => item.id)))]);
    const newer = h.picker.pickCombination(changed, 'epoch:newer').combo;
    assert.equal(h.commit(newer).ok, true);
    const restored = h.picker.pickCombinationForMultifaceResay(st, { faceIndex: 0, faces: [first], preserveSelection: true });
    assert.equal(h.commit(restored.combo).ok, true);
    assert.equal(h.storage.readFaceDrawCursor(newer.faceDrawState.steps[0]), 1);
    assert.equal(h.picker.pickCombination(changed, 'epoch:next').combo.formatIds[0], h.formats[3].id);
    const rows = [...h.localStorage.rows.entries()].filter(([key]) => key.includes('face_draw_cursors'));
    assert.equal(Object.keys(JSON.parse(rows[0][1]).cursors).length, 1, 'one slot per chat/face/lane, not every edited signature');
});

test('failed face exact continuation advances once when it eventually succeeds', async () => {
    const h = await harness();
    const r = h.rule({}, { mode: 'sequence', scope: 'selected', itemIds: h.formats.slice(0, 2).map(item => item.id), min: 1, max: 1 });
    const st = h.settings([r, r]), faces = h.batch(st, 'independent:continuation'), plan = faces.batchPlan;
    assert.equal(h.storage.markPendingBatchAttempt(plan, { transient: true }), true);
    assert.equal(h.storage.commitPendingComboBatch([{}, null], { batchId: plan.batchId, identity: plan.identity, partial: true }), true);
    const restored = h.picker.pickCombinationForMultifaceResay(st, { faceIndex: 1, faces: faces.map(face => face.combo), preserveVariation: true });
    assert.equal(h.storage.readFaceDrawCursor(restored.combo.faceDrawState.steps[0]), 0);
    assert.equal(h.commit(restored.combo).ok, true);
    assert.equal(h.commit(restored.combo).ok, true);
    assert.equal(h.storage.readFaceDrawCursor(restored.combo.faceDrawState.steps[0]), 1);
});

test('batch transaction failure rolls back all cursor and history updates', async () => {
    const h = await harness();
    const r = h.rule({}, { mode: 'sequence', scope: 'selected', itemIds: h.formats.map(item => item.id), min: 1, max: 1 });
    const faces = h.batch(h.settings([r, r]), 'independent:rollback'), plan = faces.batchPlan;
    assert.equal(h.storage.markPendingBatchAttempt(plan, { transient: true }), true);
    h.localStorage.fail = 'last_combo';
    const expected = { batchId: plan.batchId, identity: plan.identity };
    assert.equal(h.storage.commitPendingComboBatch([{}, {}], expected), false);
    assert.equal(h.storage.getComboHistory(100).length, 0);
    assert.deepEqual(plain(faces.map(face => h.storage.readFaceDrawCursor(face.combo.faceDrawState.steps[0]))), [0, 0]);
    h.localStorage.fail = '';
    assert.equal(h.storage.commitPendingComboBatch([{}, {}], expected), true);
    assert.deepEqual(plain(faces.map(face => h.storage.readFaceDrawCursor(face.combo.faceDrawState.steps[0]))), [1, 1]);
});

test('concurrent frozen draws from same cursor advance by max once, never rewind newer commits', async () => {
    const h = await harness();
    const st = h.settings([h.rule({}, { mode: 'sequence', scope: 'selected', itemIds: h.formats.map(item => item.id), min: 1, max: 1 })]);
    const first = h.picker.pickCombination(st, 'concurrent:one').combo;
    const second = h.picker.pickCombination(st, 'concurrent:two').combo;
    assert.deepEqual(plain(first.faceDrawState), plain(second.faceDrawState));
    assert.equal(h.commit(first).ok, true);
    const third = h.picker.pickCombination(st, 'concurrent:three').combo;
    assert.equal(h.commit(third).ok, true);
    assert.equal(h.commit(second).ok, true);
    assert.equal(h.storage.readFaceDrawCursor(first.faceDrawState.steps[0]), 2);
});

test('external ordering remains stable when library metadata load order changes and blacklisted text is unavailable', async () => {
    const h = await harness(), a = 'ext:a:text:one', b = 'ext:b:text:one';
    const entries = { a: [{ externalId: a, classification: 'text', enabled: true, userConfirmed: true }],
        b: [{ externalId: b, classification: 'text', enabled: true, userConfirmed: true }] };
    h.pool.setExternalPoolSnapshot([{ libraryId: 'b', enabled: true }, { libraryId: 'a', enabled: true }], entries);
    const st = h.settings([h.rule({}, {}, { mode: 'sequence', scope: 'all', min: 1, max: 1 })]);
    const first = h.picker.pickCombination(st, 'external:one').combo;
    assert.equal(first.textIds[0], a); assert.equal(h.commit(first).ok, true);
    h.pool.setExternalPoolSnapshot([{ libraryId: 'a', enabled: true }, { libraryId: 'b', enabled: true }], entries);
    assert.equal(h.picker.pickCombination(st, 'external:two').combo.textIds[0], b);
    const blocked = h.settings([h.rule({}, {}, { requiredIds: [a] })], { blacklistEnabled: true, blacklistedFormatIds: [a] });
    assert.throws(() => h.picker.pickCombination(blocked, 'external:blocked'), error => error.reasonCode === 'FACE_DRAW_REQUIRED_UNAVAILABLE');
});

test('empty configured longtext is allowed; random optional additions never repeat resident IDs', async () => {
    const h = await harness();
    const blank = h.picker.pickCombination(h.settings([h.rule()], { rabbitMirrorPresentationModes: ['longtext'] }), 'blank').combo;
    assert.equal(blank.blankLongText, true);
    const st = h.settings([h.rule({}, { requiredIds: [h.formats[0].id], mode: 'random', scope: 'selected',
        itemIds: h.formats.slice(0, 2).map(item => item.id), min: 0, max: 3 })]);
    assert.deepEqual(plain(h.picker.pickCombination(st, 'optional').combo.formatIds), [h.formats[0].id]);
});
