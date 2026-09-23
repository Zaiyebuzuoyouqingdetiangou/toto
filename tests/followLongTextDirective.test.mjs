import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRuntime, createStore } from './helpers/vmLoader.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const blank = { themeIds: [], formatIds: [], textIds: [], requestedPresentationMode: 'longtext', presentationMode: 'text', blankLongText: true };

test('follow generation snapshot and saved recipe retain custom counts and block silent blank resay', async () => {
    const runtime = createRuntime(root);
    runtime.context.sessionStorage = createStore();
    const guard = await runtime.load('src/generationGuard.js');
    const blacklist = await runtime.load('src/blacklist.js');
    const picker = await runtime.load('src/picker.js');
    const { defaultSettings } = await runtime.load('src/settings.js');
    const chat = [{ is_user: true, mes: '兔子镜：写窗边的夜晚，800字。' }];
    guard.beginRabbitMirrorGenerationAttempt(chat, 'longtext-directive');
    assert.equal(guard.attachRabbitMirrorGenerationSelection({ ...blank, customThemeCount: 2, customFormatCount: 1, customRequestCount: 1 }), true);
    const message = { is_user: false, swipe_id: 0, mes: '<toto><details><summary>【兔子镜：窗边夜晚】</summary><p>这是一段已经生成并保存的故事。</p></details></toto>' };
    chat.push(message);
    assert.equal(guard.captureRabbitMirrorGenerationSnapshots(chat), 1);
    const snapshot = guard.getRabbitMirrorGenerationSnapshot(message, chat, 1);
    const recipe = blacklist.getRabbitMirrorRecipe({ chatKey: 'chat:quota-parity', messageIndex: 1, swipeId: 0, message, includeExternalOnly: true });
    assert.ok(recipe);
    for (const value of [snapshot.selectionMetadata, recipe]) {
        assert.equal(value.blankLongText, true);
        assert.equal(value.customThemeCount, 2);
        assert.equal(value.customFormatCount, 1);
        assert.equal(value.customRequestCount, 1);
        assert.equal(value.rawDirective, undefined);
        assert.throws(() => picker.pickCombinationForMultifaceResay(defaultSettings, { faceIndex: 0, faces: [value] }), error => error.reasonCode === 'BATCH_RESAY_CUSTOM_RECIPE');
    }
});

test('same saved recipe refreshes changed counts and never lends a parent count to a sibling face', async () => {
    const runtime = createRuntime(root);
    const { recordRabbitMirrorRecipe, getRabbitMirrorRecipe } = await runtime.load('src/blacklist.js');
    const args = { chatKey: 'same', messageIndex: 1, swipeId: 0 };
    assert.equal(recordRabbitMirrorRecipe({ ...args, metadata: blank }), true);
    assert.equal(recordRabbitMirrorRecipe({ ...args, metadata: { ...blank, customRequestCount: 1 } }), true);
    assert.equal(getRabbitMirrorRecipe({ ...args, includeExternalOnly: true }).customRequestCount, 1);
    assert.equal(recordRabbitMirrorRecipe({ ...args, metadata: { ...blank, customRequestCount: 1,
        faces: [{ ...blank, customRequestCount: 1 }, blank] } }), true);
    assert.equal(getRabbitMirrorRecipe({ ...args, faceIndex: 0, includeExternalOnly: true }).customRequestCount, 1);
    assert.equal(getRabbitMirrorRecipe({ ...args, faceIndex: 1, includeExternalOnly: true }).customRequestCount, undefined);
});
