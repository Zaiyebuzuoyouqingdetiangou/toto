import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { after } from 'node:test';
import vm from 'node:vm';
import { createRuntime } from './helpers/featureRuntime.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
let baseline = fileURLToPath(new URL('../../rabbitmirror-1.67.42-feasibility', import.meta.url));
if (process.env.RM_PARITY_FROM_GIT === '1' || !existsSync(join(baseline, 'manifest.json'))) {
    const baseCommit = 'ac3eed16ed8c00e68325f5c7c27add2d8c0685b2';
    baseline = mkdtempSync(join(tmpdir(), 'rabbitmirror-face-baseline-'));
    const temporaryBaseline = resolve(baseline);
    after(() => {
        assert.equal(dirname(temporaryBaseline), resolve(tmpdir()));
        assert.ok(temporaryBaseline.startsWith(join(resolve(tmpdir()), 'rabbitmirror-face-baseline-')));
        rmSync(temporaryBaseline, { recursive: true, force: true });
    });
    const paths = execFileSync('git', ['ls-tree', '-r', '--name-only', '-z', baseCommit, '--', 'src', 'data'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
    for (const path of paths) {
        const output = join(baseline, path);
        mkdirSync(dirname(output), { recursive: true });
        writeFileSync(output, execFileSync('git', ['show', `${baseCommit}:${path}`], { cwd: root, maxBuffer: 8 * 1024 * 1024 }));
    }
}
const copy = value => JSON.parse(JSON.stringify(value));

async function runtime(source = root) {
    const rt = createRuntime(source);
    const settingsModule = await rt.load('src/settings.js');
    return { ...rt, settingsModule, settings: { ...copy(settingsModule.defaultSettings), enabled: true,
        autoRabbitMirrorInjection: true, userDirectivePriority: false, rawPolicy: 'full', memoryScanEnabled: false } };
}

test('saved face rules are independent copies and never change presentation choices', async () => {
    const rt = await runtime();
    const rules = await rt.load('src/faceDrawRules.js');
    const first = rules.normalizeFaceDrawRule({ enabled: true, theme: { requiredIds: ['C.1'], mode: 'random' } });
    const presets = rules.normalizeFaceDrawPresets([{ id: 'letters', name: '信件', rule: first }]);
    const all = rules.normalizeFaceDrawRules([first, first]);
    all[0].theme.requiredIds.push('C.2');
    assert.deepEqual(copy(all[1].theme.requiredIds), ['C.1']);
    assert.deepEqual(copy(presets[0].rule.theme.requiredIds), ['C.1']);
    rt.settingsModule.updateSettings({ rabbitMirrorPresentationModes: ['longtext', 'html'], rabbitMirrorFaceDrawRules: all });
    assert.equal(rt.settingsModule.getSettings().rabbitMirrorPresentationModes[0], 'longtext');
    assert.equal(rt.settingsModule.getSettings().rabbitMirrorFaceDrawRules[0].enabled, true);
});

test('per-face external scopes opt into hydration without enabling unrelated global mixing', async () => {
    const rt = await runtime();
    const rules = await rt.load('src/faceDrawRules.js');
    const settings = { rabbitMirrorFaceCount: 2, externalWorldBookRandomEnabled: false, rabbitMirrorFaceDrawRules: [
        { enabled: true, theme: { mode: 'random', scope: 'selected', categoryIds: ['builtin:C'] } },
        { enabled: true, format: { requiredIds: ['ext:book:format:1'] } },
    ] };
    assert.equal(rules.faceDrawNeedsExternal(settings), true);
    settings.rabbitMirrorFaceCount = 1;
    assert.equal(rules.faceDrawNeedsExternal(settings), false);
    settings.rabbitMirrorFaceDrawRules[0].theme.scope = 'all';
    assert.equal(rules.faceDrawNeedsExternal(settings), true);
    assert.equal(settings.externalWorldBookRandomEnabled, false);
});

for (const type of ['normal', 'independent']) for (const count of [1, 2]) {
    test(`unconfigured ${type} ${count} face generation preserves original prompt and draw`, async () => {
        const rendered = [];
        for (const source of [baseline, root]) {
            const rt = await runtime(source);
            const module = await rt.load('src/promptBuilder.js');
            const plan = module.planRabbitMirrorPromptDetails({ ...rt.settings, rabbitMirrorFaceCount: count }, type, null,
                'generation:face-feature-parity', { batchIdentity: { mesid: 1, swipeId: 0, sourceHash: 'unchanged-body' } });
            const result = module.renderRabbitMirrorPromptPlan(plan);
            rendered.push({ prompt: result.prompt, lock: result.executionLock,
                selections: copy(plan.selections.map(({combo}) => ({themeIds:combo.themeIds, formatIds:combo.formatIds, textIds:combo.textIds}))) });
        }
        assert.deepEqual(rendered[1], rendered[0]);
    });
}

test('configured HTML with text materials includes the selected raw material and remains HTML', async () => {
    const rt = await runtime();
    const module = await rt.load('src/promptBuilder.js');
    const id = 'ext:feature:test:1';
    const combo = { themes: [], formats: [], themeIds: [], formatIds: [], texts: [{id,externalKind:'text'}], textIds:[id],
        presentationMode:'html', requestedPresentationMode:'html', faceDrawConfigured:true, samplingMode:'format_only' };
    const plan = module.planRabbitMirrorPromptDetails(rt.settings, 'independent', null, 'generation:pinned-text-material', {pinnedSelections:[{combo}]});
    assert.deepEqual(copy(plan.selectedExternalIds), [id]);
    const materials = new Map([[id,{externalId:id,classification:'text',localTitle:'远行故事',sourceTitle:'远行故事',
        sourceWorldBookName:'离线测试',rawContent:'两个人在雨后踏上远行。标记：原文材料-314159。',summary:'雨后的远行',enabled:true,userConfirmed:true}]]);
    const result = module.renderRabbitMirrorPromptPlan(plan, materials);
    assert.match(result.prompt, /原文材料-314159/);
    assert.match(result.prompt, /第 1 面｜HTML/);
    assert.equal(result.metadata.faces?.[0]?.faceDrawConfigured ?? result.metadata.faceDrawConfigured, true);
});

test('rotation state survives prompt metadata, recipe persistence, per-face lookup and displayed version stamp', async () => {
    const rt = await runtime();
    const { THEMATIC_CATEGORIES } = await rt.load('data/structured/thematicIndex.js');
    const { PRESENTATION_FORMATS } = await rt.load('data/structured/presentationIndex.js');
    const schema = await rt.load('src/faceDrawRules.js');
    const builder = await rt.load('src/promptBuilder.js');
    const recipes = await rt.load('src/blacklist.js');
    const themeIds = copy(THEMATIC_CATEGORIES.slice(0, 2).map(x => x.id));
    const formatId = PRESENTATION_FORMATS[0].id;
    const rule = schema.normalizeFaceDrawRule({ enabled: true,
        theme: { mode: 'sequence', scope: 'selected', itemIds: themeIds }, format: { requiredIds: [formatId] } });
    const plan = builder.planRabbitMirrorPromptDetails({ ...rt.settings, rabbitMirrorFaceCount: 2,
        rabbitMirrorFaceDrawRules: [rule, rule] }, 'independent', null, 'generation:metadata-state',
        { batchIdentity: { mesid: 2, swipeId: 0, sourceHash: 'metadata-test' } });
    const metadata = builder.renderRabbitMirrorPromptPlan(plan).metadata;
    assert.equal(metadata.faces.length, 2);
    const message = { mes: 'unchanged story body', swipe_id: 0 };
    assert.equal(recipes.recordRabbitMirrorRecipe({ chatKey: 'fixture', messageIndex: 2, message, metadata }), true);
    const source = readFileSync(new URL('../src/independentApi/mount.js', import.meta.url), 'utf8');
    const keys = source.slice(source.indexOf('const FACE_RECIPE_KEYS='), source.indexOf('function stampFaceRecipe('));
    const stamp = vm.runInNewContext(`${keys}\ncompactFaceRecipe`, { faceDrawMetadataFields: schema.faceDrawMetadataFields });
    for (const index of [0, 1]) {
        const recipe = recipes.getRabbitMirrorRecipe({ chatKey: 'fixture', messageIndex: 2, swipeId: 0, message, faceIndex: index, includeExternalOnly: true });
        assert.deepEqual(copy(recipe.faceDrawState), copy(plan.selections[index].combo.faceDrawState));
        assert.deepEqual(copy(stamp(recipe).faceDrawState), copy(recipe.faceDrawState));
        assert.equal(recipe.faceDrawState.steps[0].faceIndex, index);
    }
    const restored = stamp({ ...metadata.faces[0], themeIds: Array.from({length:16},(_,i)=>`external-${i}`) });
    assert.equal(restored.themeIds.length, 16);
    const malformed = schema.faceDrawMetadataFields({faceDrawConfigured:true,faceDrawState:{version:1,steps:[{kind:'theme',cursor:-1}]}});
    assert.equal(malformed.faceDrawConfigured,true);
    assert.equal(malformed.faceDrawState,undefined);
});
