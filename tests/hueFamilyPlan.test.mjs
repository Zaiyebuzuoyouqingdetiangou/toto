import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/vmLoader.mjs';
const copy = v => JSON.parse(JSON.stringify(v));
// 逐面点名色族：同一批互不相同；逐面串行时子请求照父计划点名的来、序号写本批的序号。
test('hue families: distinct within a batch and carried into serial child requests', async () => {
    const runtime = createRuntime(fileURLToPath(new URL('..', import.meta.url)));
    const settingsModule = await runtime.load('src/settings.js');
    const settings = { ...copy(settingsModule.defaultSettings), generationSource: 'independent', rabbitMirrorFaceCount: 3, rawPolicy: 'full', userDirectivePriority: false };
    const prompt = await runtime.load('src/promptBuilder.js');
    const details = prompt.planRabbitMirrorPromptDetails(settings, 'independent', null, 'generation:hue:test', { batchIdentity: { mesid: 1, swipeId: 0, sourceHash: 'x' } });
    const plan = { ...prompt.renderRabbitMirrorPromptPlan(details), selections: details.selections };
    const hues = plan.metadata.faces.map(f => f.hueFamily || '');
    assert.ok(hues.filter(Boolean).length >= 2);
    assert.equal(new Set(hues.filter(Boolean)).size, hues.filter(Boolean).length);
    // serial child pinned
    const child = prompt.renderRabbitMirrorPromptPlan(prompt.planRabbitMirrorPromptDetails(settings, 'independent', null, 'generation:hue:test', { pinnedSelections: [plan.selections[1]], serialFaceIndex: 1, serialFaceCount: 3 }));
    assert.equal(child.metadata.hueFamily || child.metadata.faces?.[0]?.hueFamily, hues[1]);
    assert.match(child.executionLock, /第2面/);
    assert.equal((plan.prompt.match(/主色族：/g) || []).length, 3, '每面一句，不重复');
});
