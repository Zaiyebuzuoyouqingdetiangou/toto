import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/vmLoader.mjs';
const copy = v => JSON.parse(JSON.stringify(v));
// 1.73.31：逐面点名主色族撤回，回到「近期配色强避重」：提示词里不再点名色族，各面不带 hueFamily。
test('hue family assignment is off: no per-face colour family is named', async () => {
    const runtime = createRuntime(fileURLToPath(new URL('..', import.meta.url)));
    const settingsModule = await runtime.load('src/settings.js');
    const settings = { ...copy(settingsModule.defaultSettings), generationSource: 'independent', rabbitMirrorFaceCount: 3, rawPolicy: 'full', userDirectivePriority: false };
    const prompt = await runtime.load('src/promptBuilder.js');
    const details = prompt.planRabbitMirrorPromptDetails(settings, 'independent', null, 'generation:hue:test', { batchIdentity: { mesid: 1, swipeId: 0, sourceHash: 'x' } });
    const plan = prompt.renderRabbitMirrorPromptPlan(details);
    assert.equal(plan.metadata.faces.map(f => f.hueFamily || '').join(','), ',,');
    assert.doesNotMatch(plan.prompt, /主色族：/);
    assert.doesNotMatch(plan.executionLock, /主色族已逐面点名/);
});
