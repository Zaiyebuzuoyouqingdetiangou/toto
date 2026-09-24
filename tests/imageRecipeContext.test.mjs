import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/vmLoader.mjs';
import { mergeRetrySelectionDiagnostic } from '../src/missingFaceMerge.js';
import { compactFormatDescriptors } from '../src/selectionImageMetadata.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const plain = value => JSON.parse(JSON.stringify(value));
const extId = 'ext:album:format:1';
const externalRecipe = () => ({ themeIds: [], formatIds: [extId], formatLabels: [`${extId} 相册`],
    formatDescriptors: [{ id: extId, title: '相册', summary: '照片有依据地组成相册', tags: ['album'], rawContent: '不得复制原始库正文' }],
    hasExternalReferences: true, externalSources: ['形式库'], presentationMode: 'html', requestedPresentationMode: 'html' });
const blank = () => ({ themeIds: [], formatIds: [], presentationMode: 'text', requestedPresentationMode: 'longtext', blankLongText: true });
async function fixture() {
    const runtime = createRuntime(root);
    const api = await runtime.load('src/blacklist.js');
    const builtins = await runtime.load('data/structured/presentationIndex.js');
    const message = { mes: '<toto><details><summary>成品</summary>内容</details></toto>', swipe_id: 0 };
    const owner = { chatKey: 'image-context-fixture', messageIndex: 0, swipeId: 0, message };
    return { api, owner, builtin: builtins.PRESENTATION_FORMATS[0].id };
}

test('follow external formats survive recipe storage but require explicit opt-in', async () => {
    const { api, owner } = await fixture();
    assert.equal(api.recordRabbitMirrorRecipe({ ...owner, metadata: externalRecipe() }), true);
    assert.equal(api.getRabbitMirrorRecipe(owner), null, 'ordinary favorite/blacklist lookup stays builtin-only');
    const result = api.getRabbitMirrorRecipe({ ...owner, includeExternalOnly: true });
    assert.deepEqual(Array.from(result.formatIds), [extId]);
    assert.deepEqual(Array.from(result.formatLabels), [`${extId} 相册`]);
    assert.equal(result.formatDescriptors[0].title, '相册');
    assert.equal(result.formatDescriptors[0].summary, '照片有依据地组成相册');
    assert.equal(result.formatDescriptors[0].rawContent, undefined);
    assert.equal(result.formats.length, 0, 'an external item must not become a builtin favorite');
});

test('mixed records keep builtin favorite IDs while opt-in sees aligned external IDs and labels', async () => {
    const { api, owner, builtin } = await fixture();
    const metadata = externalRecipe();
    metadata.formatIds.push(builtin);
    metadata.formatLabels.push(`${builtin} 内置形式`);
    api.recordRabbitMirrorRecipe({ ...owner, metadata });
    const ordinary = api.getRabbitMirrorRecipe(owner);
    assert.deepEqual(Array.from(ordinary.formatIds), [builtin]);
    assert.deepEqual(Array.from(ordinary.formats, item => item.id), [builtin]);
    const image = api.getRabbitMirrorRecipe({ ...owner, includeExternalOnly: true });
    assert.deepEqual(Array.from(image.formatIds), [extId, builtin]);
    assert.deepEqual(Array.from(image.formatLabels), [`${extId} 相册`, `${builtin} 内置形式`]);
});

test('blank longtext and a batch beginning with it retain explicit per-face presentation', async () => {
    const { api, owner } = await fixture();
    assert.equal(api.recordRabbitMirrorRecipe({ ...owner, metadata: blank() }), true);
    assert.equal(api.getRabbitMirrorRecipe(owner), null);
    assert.equal(api.getRabbitMirrorRecipe({ ...owner, includeExternalOnly: true }).blankLongText, true);
    assert.equal(api.recordRabbitMirrorRecipe({ ...owner, metadata: { ...blank(), faces: [blank(), externalRecipe()] } }), true);
    const left = api.getRabbitMirrorRecipe({ ...owner, faceIndex: 0, includeExternalOnly: true });
    const right = api.getRabbitMirrorRecipe({ ...owner, faceIndex: 1, includeExternalOnly: true });
    assert.equal(left.requestedPresentationMode, 'longtext');
    assert.equal(left.blankLongText, true);
    assert.equal(right.presentationMode, 'html');
    assert.equal(right.blankLongText, undefined, 'batch parent mode must not leak to a sibling');
    assert.equal(right.formatDescriptors[0].title, '相册');
});

test('missing-face retry preserves bounded descriptors only in the mapped target slot', () => {
    const first = { ...externalRecipe(), faceIndex: 0 };
    const target = { ...externalRecipe(), faceIndex: 1 };
    const before = JSON.stringify([first, target]);
    const incoming = externalRecipe();
    incoming.formatDescriptors[0].title = '更新相册';
    const merged = mergeRetrySelectionDiagnostic([first, target], incoming, [1], 2, []);
    assert.deepEqual(merged.faces[0], first);
    assert.equal(merged.faces[1].formatDescriptors[0].title, '更新相册');
    assert.equal(merged.faces[1].formatDescriptors[0].rawContent, undefined);
    assert.equal(merged.faces[1].faceIndex, 1);
    assert.equal(JSON.stringify([first, target]), before);
    const fresh = mergeRetrySelectionDiagnostic(merged.faces, { themeIds: ['new-theme'], formatIds: [] }, [1], 2, []);
    assert.equal(fresh.faces[1].formatDescriptors, undefined, 'a fresh selection cannot inherit old forms');
});

test('descriptor copying is bounded, selected-ID scoped, detached, and never copies arbitrary material', () => {
    const formats = Array.from({ length: 12 }, (_, i) => `ext:test:format:${i}`);
    const source = { formatIds: formats, formatDescriptors: [
        { id: 'not-selected', title: '伪造' },
        ...formats.map(id => ({ id, title: 'T'.repeat(180), summary: 'S'.repeat(250), tags: ['t'.repeat(80), 'a', 'b', 'c', 'd'], instruction: 'discard' })),
    ] };
    const result = compactFormatDescriptors(source);
    assert.equal(result.length, 8);
    assert.equal(result[0].id, formats[0]);
    assert.equal(result[0].title.length, 160);
    assert.equal(result[0].summary.length, 210);
    assert.equal(result[0].tags.length, 4);
    assert.equal(result[0].tags[0].length, 64);
    assert.equal(result[0].instruction, undefined);
    result[0].tags.push('new');
    assert.equal(source.formatDescriptors[1].tags.length, 5);
});

test('a saved mirror diagnostic still lists its theme and format without a recipe ledger row', async () => {
    const { api, builtin } = await fixture();
    const view = api.recipeFromSelectionMetadata({
        themeIds: ['A.1'],
        formatIds: [builtin],
        themeLabels: ['A.1 官能色情'],
        formatLabels: [`${builtin} 内置形式`],
        samplingMode: 'classic',
    }, { faceIndex: 0, includeExternalOnly: true });
    assert.equal(view.themes[0].id, 'A.1');
    assert.equal(view.themes[0].kind, 'theme');
    assert.equal(view.formats[0].id, builtin);
    assert.equal(view.formats[0].kind, 'format');
});

test('same-ID metadata changes persist, malformed external IDs never gain a recipe', async () => {
    const { api, owner } = await fixture();
    const metadata = externalRecipe();
    api.recordRabbitMirrorRecipe({ ...owner, metadata });
    metadata.formatDescriptors[0].title = '新的可信名称';
    metadata.formatLabels[0] = `${extId} 新的可信名称`;
    api.recordRabbitMirrorRecipe({ ...owner, metadata });
    const result = plain(api.getRabbitMirrorRecipe({ ...owner, includeExternalOnly: true }));
    assert.equal(result.formatDescriptors[0].title, '新的可信名称');
    assert.equal(result.formatLabels[0], `${extId} 新的可信名称`);
    assert.equal(api.recordRabbitMirrorRecipe({ ...owner, metadata: { themeIds: [], formatIds: ['ext:<unsafe>'] } }), false);
});
