// 跟随正文：兔子镜提示词最前面要有正文隔离（不规定思考步骤，只要求抽到的东西不写进正文）；副 API 不需要。
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/vmLoader.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

test('follow prompt opens with the main-reply firewall; independent prompt does not', async () => {
    const runtime = createRuntime(root);
    const sm = await runtime.load('src/settings.js');
    const prompt = await runtime.load('src/promptBuilder.js');
    const base = { ...JSON.parse(JSON.stringify(sm.defaultSettings)), rabbitMirrorFaceCount: 1 };
    const follow = prompt.buildRabbitMirrorPrompt({ ...base, generationSource: 'follow' }, 'follow', null, 'fw:1', { batchIdentity: { mesid: 3, swipeId: 0, sourceHash: 'f' } });
    const open = follow.indexOf('<兔子镜自动注入>');
    assert.ok(open >= 0);
    const firewall = follow.indexOf('【正文隔离·最高优先】');
    assert.ok(firewall > open && firewall - open < 40, '隔离紧跟在开头');
    assert.match(follow, /只能出现在兔子镜 <toto> 里面/);
    assert.doesNotMatch(follow, /先后两段|第一段|第二段/, '不规定思考步骤');
    const independent = prompt.buildRabbitMirrorPrompt({ ...base, generationSource: 'independent' }, 'independent', null, 'fw:2', { batchIdentity: { mesid: 4, swipeId: 0, sourceHash: 'i' } });
    assert.doesNotMatch(independent, /正文隔离/);
});
