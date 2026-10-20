// 材质纹理开关打开时，规则真的进了发给模型的提示词（以前漏在设置名单外，规则从没发出去）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/vmLoader.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

test('material texture rule reaches the built prompt only when the switch is on', async () => {
    const runtime = createRuntime(root);
    const settingsModule = await runtime.load('src/settings.js');
    const prompt = await runtime.load('src/promptBuilder.js');
    const base = { ...JSON.parse(JSON.stringify(settingsModule.defaultSettings)), generationSource: 'independent', rabbitMirrorFaceCount: 1 };
    const build = (extra, key) => prompt.buildRabbitMirrorPrompt({ ...base, ...extra }, 'independent', null, `texture:${key}`,
        { batchIdentity: { mesid: 1, swipeId: 0, sourceHash: key } });
    const on = build({ materialTextureEnabled: true }, 'on');
    const off = build({ materialTextureEnabled: false }, 'off');
    if (!/<toto/.test(on)) return; // 这次抽签没有 HTML 面时不判
    assert.match(on, /data-rm-texture="材料 粗细 方向 形状 浓淡 光泽"/);
    assert.doesNotMatch(off, /data-rm-texture/);
});
