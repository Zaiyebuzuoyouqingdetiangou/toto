// 清理兔子镜本机存储：默认几类只清缓存和遗留；只在本机的要单独勾；收藏夹、设置、外观、母本库、API 配置一律不碰。
import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
    get length() { return store.size; }, key: i => [...store.keys()][i] ?? null,
    getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k),
};
const cleanup = await import('../src/storageCleanup.js');
const KEEP = ['rabbit_mirror_theater_favorites_v1', 'rabbit_mirror_settings_appearance_v1', 'rabbit_mirror_mother_library_server_backup:v1',
    'rabbit_mirror_independent_api_profiles_v1', 'rabbit_mirror_user_skin_v1', 'rabbit_mirror_world_info_books_v2', 'other_extension_key'];
function fill() {
    store.clear();
    for (const key of KEEP) store.set(key, 'x'.repeat(100));
    store.set('rabbit_mirror_repair_samples:v1', 'y'.repeat(4000));
    store.set('rabbit_mirror_independent_api_last_request_v2', 'y'.repeat(2000));
    store.set('rabbit_mirror_theater:last_combo:v9', 'y'.repeat(3000));
    store.set('rabbit_mirror_theater:pending_combo:v10', 'y'.repeat(300));
    store.set('rabbit_mirror_theater:last_combo:v11', '[{"ts":1}]');
    store.set('rabbit_mirror_theater:selection_recipes:v1', '[]');
    store.set('rabbit_mirror_theater:token_meter:independent:v1', '{}');
    store.set('rabbit_mirror_theater:pending_batch:v1', '{}');
    store.set('rabbit_mirror_theater:pending_batch_registry:v2', '{}');
}

test('defaults are the safe categories only', () => {
    fill();
    const items = cleanup.measureStorageCleanup();
    assert.deepEqual(items.filter(item => item.safe).map(item => item.id), ['covered', 'image-prompts', 'samples', 'diagnostics', 'legacy', 'prompt-meter']);
    assert.deepEqual(items.filter(item => !item.safe).map(item => item.id), ['history', 'recipes', 'follow-partial']);
    assert.ok(items.find(item => item.id === 'legacy').bytes > 6000);
});

test('safe cleanup removes samples, diagnostics and legacy keys but keeps current history and everything else', () => {
    fill();
    const result = cleanup.runStorageCleanup(cleanup.measureStorageCleanup().filter(item => item.safe).map(item => item.id));
    assert.ok(result.freed >= (4000 + 2000 + 3000 + 300) * 2);
    assert.equal(store.has('rabbit_mirror_theater:token_meter:independent:v1'), false, 'Prompt 估算属于可放心清的');
    for (const key of ['rabbit_mirror_repair_samples:v1', 'rabbit_mirror_independent_api_last_request_v2', 'rabbit_mirror_theater:last_combo:v9', 'rabbit_mirror_theater:pending_combo:v10']) assert.equal(store.has(key), false, key);
    for (const key of [...KEEP, 'rabbit_mirror_theater:last_combo:v11', 'rabbit_mirror_theater:selection_recipes:v1', 'rabbit_mirror_theater:pending_batch:v1', 'rabbit_mirror_theater:pending_batch_registry:v2']) assert.equal(store.has(key), true, key);
});

test('local-only categories go only when ticked, and never touch favourites or settings', () => {
    fill();
    store.set('rabbit_mirror_follow_partial_results_v1', '[]');
    cleanup.runStorageCleanup(['history', 'recipes', 'follow-partial']);
    for (const key of ['rabbit_mirror_theater:last_combo:v11', 'rabbit_mirror_theater:selection_recipes:v1', 'rabbit_mirror_follow_partial_results_v1']) assert.equal(store.has(key), false, key);
    for (const key of KEEP) assert.equal(store.has(key), true, key);
});

test('the image category says how much is old prompts and how much is pictures kept only here', () => {
    fill();
    store.set('rabbitMirror:image:v1:images:builtin:c:1:0:0:h', JSON.stringify({ version: 1, current: { url: 'data:image/png;base64,' + 'A'.repeat(5000) },
        history: [{ path: '/x.png', prompt: 'p'.repeat(3000), promptMetadata: { flatPrompt: 'q'.repeat(3000) } }] }));
    const detail = cleanup.measureStorageCleanup().find(item => item.id === 'image-prompts').detail;
    assert.match(detail, /旧提示词约 1\d?KB/);
    assert.match(detail, /只存在本机的整张图约 10KB/);
});
