import test from 'node:test';
import assert from 'node:assert/strict';
import * as missingFaceApi from '../src/missingFaceMerge.js';
import { parseMultifaceOutput } from '../src/multifaceProtocol.js';
import {
    mergeMissingIndependentFaces,
    missingIndexesFromIndependentResult,
    recipesCoverMissing,
    remapRetryFaceIndexes,
} from '../src/missingFaceMerge.js';

function faceHtml(index, title, body, failed = false) {
    const inner = failed
        ? `<details data-rabbit-mirror-face-failure="incomplete-face"><summary>【兔子镜：第 ${index + 1} 面未完成】</summary><p>未完成</p></details>`
        : `<details><summary>${title}</summary><p>${body}</p></details>`;
    return `<toto data-rabbit-mirror="true" data-rm-face="${index + 1}">${inner}</toto>`;
}

test('recipesCoverMissing requires every missing index', () => {
    assert.equal(recipesCoverMissing([{ id: 1 }, { id: 2 }], [1]), true);
    assert.equal(recipesCoverMissing([{ id: 1 }], [1]), false);
    assert.equal(recipesCoverMissing([], [0]), false);
});

test('remapRetryFaceIndexes maps local retry faces onto the original missing slots', () => {
    assert.deepEqual(
        remapRetryFaceIndexes([{ faceIndex: 0, code: 'empty' }, { faceIndex: 1, code: 'bad' }], [1, 3]),
        [{ faceIndex: 1, code: 'empty' }, { faceIndex: 3, code: 'bad' }],
    );
});

test('missing indexes come from failedFaces or leftover failure slots', () => {
    assert.deepEqual(missingIndexesFromIndependentResult({ failedFaces: [{ faceIndex: 1 }] }, 3), [1]);
    const previous = [faceHtml(0, '一面', '甲'), faceHtml(1, '二面', '乙', true)].join('\n');
    assert.deepEqual(missingIndexesFromIndependentResult({ html: previous }, 2), [1]);
    assert.deepEqual(missingIndexesFromIndependentResult({ html: '' }, 2), [0, 1]);
});

test('merge only replaces the missing faces from the retry payload', () => {
    const previous = [faceHtml(0, '一面', '甲'), faceHtml(1, '二面', '乙', true), faceHtml(2, '三面', '丙', true)].join('\n');
    const incoming = [faceHtml(0, '新二', '新乙'), faceHtml(1, '新三', '新丙', true)].join('\n');
    const merged = mergeMissingIndependentFaces(previous, 3, [1, 2], { html: incoming, failedFaces: [{ faceIndex: 1, code: 'incomplete-face' }] });
    assert.equal(merged.completedFaces, 2);
    assert.deepEqual(merged.failedFaces.map(face => face.faceIndex), [2]);
    assert.match(merged.html, /新乙/);
    assert.match(merged.html, /data-rm-face="1"/);
    assert.match(merged.html, /data-rm-face="3"/);
});

test('a single missing face accepts sanitized bare details or one strict local frame', () => {
    const first = faceHtml(0, '保留一', '甲');
    const last = faceHtml(2, '保留三', '丙');
    const previous = [first, faceHtml(1, '未完成', '', true), last].join('\n');
    const details = '<details><summary>新二</summary><p>新的第二面</p></details>';
    for (const html of [details, faceHtml(0, '新二', '新的第二面')]) {
        const merged = mergeMissingIndependentFaces(previous, 3, [1], { html });
        assert.equal(merged.completedFaces, 3);
        assert.deepEqual(merged.failedFaces, []);
        const parsed = parseMultifaceOutput(merged.html, { expectedCount: 3 });
        assert.equal(parsed.ok, true);
        assert.equal(parsed.faces[0].html, first);
        assert.equal(parsed.faces[2].html, last);
        assert.match(parsed.faces[1].details, /新的第二面/);
    }
});

test('single-face retry rejects extra roots, malformed suffixes, wrong ordinals, failure cards and over-budget content', () => {
    const previous = [faceHtml(0, '保留', '甲'), faceHtml(1, '失败', '', true)].join('\n');
    const valid = faceHtml(0, '新二', '乙');
    const bare = '<details><summary>新二</summary><p>乙</p></details>';
    for (const html of [
        valid + faceHtml(1, '额外', '不应加入'), valid + '<broken>', valid + '额外正文',
        bare + '<details><summary>额外</summary><p>不应加入</p></details>',
        faceHtml(2, '错误序号', '乙'), faceHtml(0, '失败', '', true),
        '<details><summary>未闭合</summary><p>乙',
        faceHtml(0, '超预算', 'x'.repeat(524289)),
    ]) {
        const merged = mergeMissingIndependentFaces(previous, 2, [1], { html });
        assert.equal(merged.html, previous);
        assert.deepEqual(merged.failedFaces.map(face => face.faceIndex), [1]);
    }
});

test('transport-declared failure preserves the old slot even when HTML looks complete', () => {
    const previous = [faceHtml(0, '保留', '甲'), faceHtml(1, '失败', '', true)].join('\n');
    const merged = mergeMissingIndependentFaces(previous, 2, [1], {
        html: faceHtml(0, '看似完整', '乙'), failedFaces: [{ faceIndex: 0, code: 'transport-error' }],
    });
    assert.equal(merged.html, previous);
    assert.equal(merged.failedFaces[0].code, 'transport-error');
});

const recipe = index => ({ faceIndex: index, themeIds: [`theme-${index}`], formatIds: [`format-${index}`],
    presentationMode: 'html', formatLabels: [`原面${index}`], customRequestCount: 0 });

test('single flat retry diagnostic retains every recipe and updates only the mapped original face', () => {
    const previous = [recipe(0), recipe(1), recipe(2)];
    const before = JSON.stringify(previous);
    const incoming = { themeIds: ['theme-1'], formatIds: ['format-1'], model: 'test-model', formatLabels: ['重说二'] };
    const result = missingFaceApi.mergeRetrySelectionDiagnostic(previous, incoming, [1], 3, []);
    assert.equal(result.faceCount, 3);
    assert.equal(result.completedFaces, 3);
    assert.equal(result.partial, false);
    assert.deepEqual(result.faces[0], previous[0]);
    assert.deepEqual(result.faces[2], previous[2]);
    assert.deepEqual(result.faces[1].formatLabels, ['重说二']);
    assert.equal(result.faces[1].faceIndex, 1);
    assert.equal(result.faces[1].model, undefined, 'transport envelope is not a face recipe');
    assert.equal(result.model, 'test-model');
    assert.equal(JSON.stringify(previous), before);
    assert.equal(incoming.faces, undefined);
});

test('subset retry diagnostics map local indices to original slots and retain failure provenance', () => {
    const previous = Array.from({ length: 5 }, (_, index) => recipe(index));
    const incoming = { faces: [
        { ...recipe(0), themeIds: ['theme-1'], formatIds: ['format-1'], formatLabels: ['新二'] },
        { ...recipe(1), themeIds: ['theme-4'], formatIds: ['format-4'], formatLabels: ['新五'] },
    ] };
    const failed = [{ faceIndex: 4, status: 'failed', code: 'incomplete-face' }];
    const result = missingFaceApi.mergeRetrySelectionDiagnostic(previous, incoming, [1, 4], 5, failed);
    assert.deepEqual(result.faces.map(face => face.faceIndex), [0, 1, 2, 3, 4]);
    assert.deepEqual(result.faces[1].formatLabels, ['新二']);
    assert.deepEqual(result.faces[4].formatLabels, ['新五']);
    assert.deepEqual(result.faces[3], previous[3]);
    assert.deepEqual(result.failedFaces, failed);
    assert.equal(result.partial, true);
    assert.equal(result.completedFaces, 4);
});

test('transport failures keep trusted recipes; absent recipes stay absent', () => {
    const previous = [recipe(0), recipe(1), recipe(2)];
    const result = missingFaceApi.mergeRetrySelectionDiagnostic(previous, { semanticFailure: 'network' }, [1], 3,
        [{ faceIndex: 1, status: 'failed', code: 'network' }]);
    assert.deepEqual(result.faces, previous);
    const absent = missingFaceApi.mergeRetrySelectionDiagnostic([], { semanticFailure: 'network' }, [1], 3, []);
    assert.ok(absent.faces.every(face => !face));
    assert.equal(recipesCoverMissing(absent.faces, [1]), false);
});

test('an explicit new selection cannot inherit stale text or external-source flags', () => {
    const previous = [recipe(0), { ...recipe(1), presentationMode: 'text', textIds: ['ext:old:text:1'],
        textLabels: ['旧文本'], hasExternalReferences: true, externalSources: ['旧库'], customRequestCount: 1 }];
    const result = missingFaceApi.mergeRetrySelectionDiagnostic(previous,
        { themeIds: ['new-theme'], formatIds: ['new-format'], formatLabels: ['新形式'] }, [1], 2);
    assert.equal(result.faces[1].textIds, undefined);
    assert.equal(result.faces[1].presentationMode, undefined);
    assert.equal(result.faces[1].hasExternalReferences, undefined);
    assert.equal(result.faces[1].customRequestCount, undefined);
    assert.deepEqual(result.faces[0], previous[0]);
});
