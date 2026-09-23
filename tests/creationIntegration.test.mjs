import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createRuntime } from './helpers/vmLoader.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const source = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('settings UI saves and clears style and persists all new choices through real settings', async () => {
    const runtime = createRuntime(root);
    const config = await runtime.load('src/settings.js');
    const nodes = new Map();
    const $ = id => {
        if (!nodes.has(id)) nodes.set(id, { value: '', handlers: {}, val(value) { if (!arguments.length) return this.value; this.value = value; return this; },
            prop(key, value) { this[key] = value; return this; }, on(type, handler) { this.handlers[type] = handler; return this; }, text(value) { this.message = value; return this; } });
        return nodes.get(id);
    };
    const ui = source('src/ui.js');
    vm.runInNewContext(ui.slice(ui.indexOf("    $('#rh_writing_style').val"), ui.indexOf("    $('#rh_behavior_rule_status').text", ui.indexOf("    $('#rh_writing_style').val"))),
        { $, settings: config.getSettings(), updateSettings: config.updateSettings, refreshRabbitMirrorGenerationMode() {} });
    $('#rh_writing_style').val('用具体动作表达感情');
    $('#rh_writing_style_save').handlers.click();
    assert.equal(config.getSettings().writingStyle, '用具体动作表达感情');
    $('#rh_long_text_source').handlers.change({ target: { value: 'mixed' } });
    $('#rh_image_composition').handlers.change({ target: { value: 'auto' } });
    $('#rh_character_world_book').handlers.change({ target: { checked: true } });
    assert.equal(config.getSettings().longTextSource, 'mixed');
    assert.equal(config.getSettings().imageCompositionMode, 'auto');
    assert.equal(config.getSettings().independentReadCharacterWorldBook, true);
    $('#rh_writing_style_clear').handlers.click();
    assert.equal(config.getSettings().writingStyle, '');
    assert.equal($('#rh_writing_style').val(), '');
});

test('changing the next image composition preserves an existing draft; editing scene invalidates it', () => {
    const ui = source('src/imageUi.js');
    let handler;
    const inputs = { flatPrompt: { value: 'existing complete image prompt' } };
    const composition = {}, size = {}, format = {}, status = {};
    vm.runInNewContext(ui.slice(ui.indexOf("    fields.addEventListener('input'"), ui.indexOf('    function fit()', ui.indexOf("    fields.addEventListener('input'"))),
        { fields: { addEventListener(type, callback) { handler = callback; } }, inputs, composition, size, format, status, updatePreview() {}, renderState() {} });
    handler({ target: composition });
    assert.equal(inputs.flatPrompt.value, 'existing complete image prompt');
    handler({ target: {} });
    assert.equal(inputs.flatPrompt.value, '');
});

test('image material snapshots detect in-place character and persona edits and respect read switches', () => {
    const mount = source('src/independentApi/mount.js');
    const sandbox = {};
    vm.runInNewContext(mount.slice(mount.indexOf('function mirrorImageReferenceSnapshot('), mount.indexOf('function prepareMirrorImageTarget(')), sandbox);
    const ctx = { characterId: 0, characters: [{ name: '角色', data: { description: '旧描述' } }], name1: '用户甲', powerUserSettings: { persona_description: '旧人设' } };
    const snapshot = settings => JSON.stringify(sandbox.mirrorImageReferenceSnapshot(ctx, settings));
    const before = snapshot({});
    ctx.powerUserSettings.persona_description = '新人设';
    assert.notEqual(snapshot({}), before);
    const next = snapshot({});
    ctx.characters[0].data.description = '新角色描述';
    assert.notEqual(snapshot({}), next);
    assert.doesNotMatch(snapshot({ independentReadCharacterCardSummary: false, independentReadPersonaSummary: false }), /新角色描述|新人设/);
});

test('asynchronous creation rejects changed style, source, worldbook switch, binding or role', () => {
    const request = source('src/independentApi/request.js');
    const functions = request.slice(request.indexOf('function independentCreationSettingsKey('), request.indexOf('async function loadIndependentAppearanceReference('));
    for (const change of [
        (st) => { st.writingStyle = '新文风'; },
        (st) => { st.longTextSource = 'mixed'; },
        (st) => { st.independentReadCharacterWorldBook = false; },
        (st, ctx) => { ctx.characters[0].data.extensions.world = '另一本'; },
        (st, ctx) => { ctx.characterId = 1; },
        (st) => { st.independentWorldInfoDisabledBooks.push('主书'); },
    ]) {
        const st = { independentReadCharacterWorldBook: true, independentWorldInfoDisabledBooks: [] };
        const msg = { mes: '正文' }, ctx = { chat: [msg], characterId: 0, characters: [{ data: { extensions: { world: '主书' } } }] };
        const sandbox = { getSettings: () => st, getContext: () => ctx, messageBaseSlotKey: () => 'slot', chatKey: () => 'chat', swipeId: () => 0,
            messageSourceFingerprint: () => 'source', operationEpochForBase: () => 0, independentGenerationTiming: () => 'after', automaticIndependentTiming: () => true,
            independentPromptOwnerPreflightError: () => new Error('stale owner'), independentPromptBatchSignature: () => '' };
        vm.runInNewContext(functions, sandbox);
        const owner = sandbox.captureIndependentPromptOwner(ctx, 0, msg, null, { manualRetry: true }, 'scope');
        assert.doesNotThrow(() => sandbox.assertIndependentPromptOwner(owner));
        change(st, ctx);
        assert.throws(() => sandbox.assertIndependentPromptOwner(owner), /stale owner/);
    }
});
