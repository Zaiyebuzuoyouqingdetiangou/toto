// 按正文挑签：几张签还没选时，真实用法和写法清单不能按签 1 的形式给（以前这样给，模型几乎总选签 1）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/vmLoader.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

test('atmosphere menu faces get no ticket-1-specific usages or usage-matched drivers', async () => {
    const runtime = createRuntime(root);
    const sm = await runtime.load('src/settings.js');
    const prompt = await runtime.load('src/promptBuilder.js');
    const base = { ...JSON.parse(JSON.stringify(sm.defaultSettings)), generationSource: 'follow', rabbitMirrorFaceCount: 1 };
    let menus = 0;
    for (let i = 0; i < 6; i += 1) {
        const text = prompt.buildRabbitMirrorPrompt({ ...base, lotteryMethod: 'atmosphere', atmosphereStoryPercent: 100 }, 'follow', null, `atm:${i}`,
            { batchIdentity: { mesid: 20 + i, swipeId: 0, sourceHash: `a${i}` } });
        if (!/按正文挑签/.test(text)) continue;
        menus += 1;
        assert.doesNotMatch(text, /真实用法（抽完形式后随机提供/, 'no real-usage line tied to ticket 1');
        assert.doesNotMatch(text, /（用于「/, 'driver offer is not matched to ticket 1 usages');
    }
    if (!menus) return; // 这几次都没抽出多张签时不判
    // 普通抽签照常有真实用法。
    const plain = prompt.buildRabbitMirrorPrompt(base, 'follow', null, 'plain:1', { batchIdentity: { mesid: 40, swipeId: 0, sourceHash: 'p' } });
    if (/<toto/.test(plain) && !/按正文挑签/.test(plain)) assert.match(plain, /真实用法（抽完形式后随机提供/);
});
