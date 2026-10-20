// 千千结（ST-MyriadKnots）公开只读桥：扫描能认出来、同步读这一轮的前情与相关记忆、空快照时异步补读、核对聊天身份。
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntime, createStore } from './helpers/vmLoader.mjs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
async function setup(bridge, chatId = 'chat-a') {
    const runtime = createRuntime(root, { store: createStore() });
    runtime.context.document = { querySelectorAll: () => [] };
    runtime.context.setTimeout = setTimeout; runtime.context.clearTimeout = clearTimeout;
    runtime.context.SillyTavern = { getContext: () => ({ chatId, getCurrentChatId: () => chatId, chat: [] }) };
    runtime.context.qqj_v3_public_bridge_v1 = bridge;
    return runtime.load('src/memoryScanner.js');
}
const ready = { status: 'ready', identity: { hostChatId: 'chat-a', qqjChatId: 'u1' } };

test('scan lists 千千结 as a readable source', async () => {
    const scanner = await setup({ getStatus: () => ready, getPromptSnapshot: () => ({ status: 'empty' }) });
    const found = scanner.scanMemoryPlugins().find(item => item.id === scanner.QQJ_PROVIDER_ID);
    assert.ok(found); assert.equal(found.readable, true); assert.equal(found.status, '可读取');
});

test('sync read returns prequel and recall of the latest prepared turn', async () => {
    const scanner = await setup({ getStatus: () => ready, getPromptSnapshot: () => ({ ...ready, scope: 'latest-prepared', recall: { text: '钟楼下的守门约定' }, prequel: { text: '上一卷两人分开' } }) });
    const result = scanner.readMemoryProvider(scanner.QQJ_PROVIDER_ID);
    assert.match(result.text, /［前情］\n上一卷两人分开/);
    assert.match(result.text, /［相关记忆］\n钟楼下的守门约定/);
    const material = scanner.readSelectedMemoryForPrompt({ memoryScanEnabled: true, memoryProviderIds: [scanner.QQJ_PROVIDER_ID] });
    assert.deepEqual([...material.sources], ['千千结（长期记忆）']);
});

test('other chat, disabled and not-ready are refused', async () => {
    let scanner = await setup({ getStatus: () => ({ status: 'ready', identity: { hostChatId: 'chat-b' } }), getPromptSnapshot: () => ({}) });
    assert.throws(() => scanner.readMemoryProvider(scanner.QQJ_PROVIDER_ID), /不是当前聊天/);
    scanner = await setup({ getStatus: () => ({ status: 'disabled' }) });
    assert.throws(() => scanner.readMemoryProvider(scanner.QQJ_PROVIDER_ID), /已关闭/);
    scanner = await setup({ getStatus: () => ({ status: 'not-ready' }) });
    assert.throws(() => scanner.readMemoryProvider(scanner.QQJ_PROVIDER_ID), /还没准备好/);
});

test('empty snapshot falls back to async readMemory, also for independent generation', async () => {
    let reads = 0;
    const scanner = await setup({ getStatus: () => ready, getPromptSnapshot: () => ({ ...ready, status: 'empty' }),
        readMemory: async () => { reads += 1; return { ...ready, text: '第三楼：一起修好了旧地图' }; } });
    const settings = { memoryScanEnabled: true, memoryProviderIds: [scanner.QQJ_PROVIDER_ID, 'global:other'], memoryMaxChars: 2200 };
    const material = await scanner.prepareSelectedMemoryForPrompt(settings, { generationType: 'independent', hasSharedMemoryTheme: true });
    assert.equal(reads, 1);
    assert.match(material.text, /一起修好了旧地图/);
    assert.equal(material.errors.length, 0, 'independent still skips the other legacy plugin API');
    // 设置快照的键：独立生成只保留千千结
    assert.match(scanner.memoryRequestSettingsKey(settings, 'independent'), /qqj_v3_public_bridge_v1/);
    assert.doesNotMatch(scanner.memoryRequestSettingsKey(settings, 'independent'), /global:other/);
});
