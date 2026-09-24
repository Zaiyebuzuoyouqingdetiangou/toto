import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 单面重说必须重新随机抽取。
//
// 回归背景：resayIndependentMirror 曾在上一轮诊断含 presentationMode 或
// visualSceneryCombination 时，把单面诊断当作 multifaceResay 传下去；该路径会
// 调用 pickCombinationForMultifaceResay 按原 themeIds/formatIds 精确复原，
// 于是开启呈现模式或动态视觉组合后，重说永远抽到同一组合。
//
// 本测试直接执行生产源码 src/independentApi/mount.js 中 resayIndependentMirror
// 的真实函数体，用受控替身捕获它传给 generateFor 的参数。

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = readFileSync(resolve(ROOT, 'src/independentApi/mount.js'), 'utf-8');

function extractFunction(source, name) {
    const start = source.indexOf(`function ${name}(`);
    assert.notEqual(start, -1, `${name} 必须存在于生产源码`);
    let paren = 0, bodyStart = -1;
    for (let i = start; i < source.length; i += 1) {
        const ch = source[i];
        if (ch === '(') paren += 1;
        else if (ch === ')') paren -= 1;
        else if (ch === '{' && paren === 0) { bodyStart = i; break; }
    }
    let depth = 0;
    for (let i = bodyStart; i < source.length; i += 1) {
        if (source[i] === '{') depth += 1;
        else if (source[i] === '}') { depth -= 1; if (!depth) return source.slice(start, i + 1); }
    }
    throw new Error(`无法提取 ${name}`);
}

const BODY = extractFunction(SOURCE, 'resayIndependentMirror');

// generateFor(index, msg, force, sourceAware, multifaceResay, earlyBodyOwner, manualBodyOwner, singlePresentationResay, quickStartOwner)
const MULTIFACE_ARG = 4;
const SINGLE_PRESENTATION_ARG = 7;

function runResay({ diagnostic, faceIndex = -1, mountedCount = 0, options, generationSource = 'independent' } = {}) {
    const calls = [];
    const toasts = [];
    const deps = {
        getSettings: () => ({ generationSource }),
        resolveIndependentActionIdentity: () => ({ ctx: {}, index: 7, msg: { mes: 'x' }, slot: 's', faceIndex, host: {} }),
        canIndependentFaceResay: () => ({ ok: true }),
        FACE_SWIPE_FULL_MESSAGE: '',
        savedIndependentRecordForOwner: () => ({ html: '<toto></toto>', apiRequest: diagnostic }),
        readStore: () => ({}),
        externalFaceDetails: () => Array.from({ length: mountedCount }, () => ({ hasAttribute: () => false })),
        MULTIFACE_FAILURE_ATTR: 'data-rm-face-failure',
        hasEphemeralFaceFailure: () => false,
        isBlankLongTextSelection: () => false,
        generateFor: (...args) => { calls.push(args); },
    };
    const names = Object.keys(deps);
    const fn = new Function(...names, `${BODY}\nreturn resayIndependentMirror;`)(...names.map(n => deps[n]));
    const saved = globalThis.toastr;
    globalThis.toastr = { info: m => toasts.push(m), error: m => toasts.push(m), warning: m => toasts.push(m) };
    try { fn({}, {}, options); } finally { globalThis.toastr = saved; }
    return { calls, toasts };
}

test('single-face resay with a presentation mode record draws a fresh random combo', () => {
    const { calls } = runResay({ diagnostic: { presentationMode: 'text', themeIds: ['A.1'], formatIds: ['1.1'] } });
    assert.equal(calls.length, 1, '必须恰好调用一次 generateFor');
    assert.equal(calls[0][MULTIFACE_ARG], null, '单面重说不得走 multifaceResay 精确复原');
    assert.equal(calls[0][SINGLE_PRESENTATION_ARG], null, '单面重说不得携带上一轮抽签记录');
});

test('single-face resay with visual scenery combination also draws fresh', () => {
    const { calls } = runResay({ diagnostic: { visualSceneryCombination: true, themeIds: ['B.2'], formatIds: ['10.2.2'] } });
    assert.equal(calls[0][MULTIFACE_ARG], null);
    assert.equal(calls[0][SINGLE_PRESENTATION_ARG], null);
});

test('plain single-face resay stays a fresh random draw', () => {
    const { calls } = runResay({ diagnostic: { themeIds: ['C.3'], formatIds: ['2.1'] } });
    assert.equal(calls[0][MULTIFACE_ARG], null);
    assert.equal(calls[0][SINGLE_PRESENTATION_ARG], null);
});

test('multiface per-face resay keeps its exact-restore semantics unchanged', () => {
    const faces = [{ themeIds: ['A.1'], formatIds: ['1.1'] }, { themeIds: ['B.2'], formatIds: ['2.2'] }];
    const { calls } = runResay({ diagnostic: { faces }, faceIndex: 1, mountedCount: 2 });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][MULTIFACE_ARG].faceIndex, 1);
    assert.equal(calls[0][MULTIFACE_ARG].faces, faces, '多面重说这一面仍须携带原逐面记录');
    assert.equal(calls[0][MULTIFACE_ARG].freshSelection, false);
    assert.equal(calls[0][SINGLE_PRESENTATION_ARG], null);
});

test('single-face original resay restores the saved recipe without entering batch merge', () => {
    const diagnostic = { themeIds: ['C.3'], formatIds: ['2.1'] };
    const { calls } = runResay({ diagnostic, options: { mode: 'original' } });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][MULTIFACE_ARG], null, '原选题的单面记录不得走多面合并');
    assert.equal(calls[0][SINGLE_PRESENTATION_ARG].singleFaceRecipe, true);
    assert.equal(calls[0][SINGLE_PRESENTATION_ARG].freshSelection, false);
    assert.equal(calls[0][SINGLE_PRESENTATION_ARG].faces[0], diagnostic);
    assert.equal(calls[0][9], '');
});

test('single-face fresh resay stays a new draw and carries only this note', () => {
    const { calls } = runResay({
        diagnostic: { themeIds: ['C.3'], formatIds: ['2.1'] },
        options: { mode: 'fresh', note: '  要信纸\u0000不要仪表盘  ' },
    });
    assert.equal(calls[0][MULTIFACE_ARG], null);
    assert.equal(calls[0][SINGLE_PRESENTATION_ARG], null);
    assert.equal(calls[0][9], '要信纸 不要仪表盘');
});

test('multiface fresh resay redraws the selected face and keeps the other records', () => {
    const faces = [{ themeIds: ['A.1'], formatIds: ['1.1'] }, { themeIds: ['B.2'], formatIds: ['2.2'] }];
    const { calls } = runResay({ diagnostic: { faces }, faceIndex: 1, mountedCount: 2, options: { mode: 'fresh' } });
    assert.equal(calls[0][MULTIFACE_ARG].faceIndex, 1);
    assert.equal(calls[0][MULTIFACE_ARG].faces, faces);
    assert.equal(calls[0][MULTIFACE_ARG].freshSelection, true);
    assert.equal(calls[0][MULTIFACE_ARG].retryFailedFace, true);
    assert.equal(calls[0][SINGLE_PRESENTATION_ARG], null);
});

test('multiface original resay keeps exact restore', () => {
    const faces = [{ themeIds: ['A.1'], formatIds: ['1.1'] }, { themeIds: ['B.2'], formatIds: ['2.2'] }];
    const { calls } = runResay({ diagnostic: { faces }, faceIndex: 1, mountedCount: 2, options: { mode: 'original' } });
    assert.equal(calls[0][MULTIFACE_ARG].freshSelection, false);
    assert.equal(calls[0][MULTIFACE_ARG].retryFailedFace, false);
    assert.equal(calls[0][SINGLE_PRESENTATION_ARG], null);
});

test('original resay without a saved recipe does not send', () => {
    const { calls, toasts } = runResay({ diagnostic: {}, options: { mode: 'original' } });
    assert.equal(calls.length, 0);
    assert.ok(toasts.some(message => String(message).includes('未发送请求')));
});

test('follow mode refuses a fresh redraw before any request', () => {
    const { calls, toasts } = runResay({ diagnostic: {}, options: { mode: 'fresh' }, generationSource: 'follow' });
    assert.equal(calls.length, 0);
    assert.ok(toasts.some(message => String(message).includes('不能在这里重新抽一张')));
});

test('multiface resay without a trusted face record still refuses to send', () => {
    const { calls, toasts } = runResay({ diagnostic: { faces: [] }, faceIndex: 2, mountedCount: 3 });
    assert.equal(calls.length, 0, '缺少逐面记录时不得发送请求');
    assert.ok(toasts.some(m => String(m).includes('未发送请求')));
});

test('no module is imported under two different cache keys', () => {
    const files = [];
    const walk = dir => {
        for (const name of readdirSync(dir)) {
            if (name === 'tests' || name === 'node_modules' || name.startsWith('.')) continue;
            const full = join(dir, name);
            if (statSync(full).isDirectory()) walk(full);
            else if (name.endsWith('.js')) files.push(full);
        }
    };
    walk(ROOT);
    const keys = new Map();
    const pattern = /(?:from\s+|import\s*\(\s*)['"](\.[^'"?]+)(?:\?rmv=([\w.\-]+))?['"]/g;
    for (const file of files) {
        const rel = relative(ROOT, file);
        for (const match of readFileSync(file, 'utf-8').matchAll(pattern)) {
            const target = normalize(join(dirname(rel), match[1])).split('\\').join('/');
            if (!keys.has(target)) keys.set(target, new Set());
            keys.get(target).add(match[2] || '(none)');
        }
    }
    const conflicts = [...keys].filter(([, set]) => set.size > 1).map(([target, set]) => `${target}: ${[...set].join(' / ')}`);
    assert.deepEqual(conflicts, [], '同一模块被多种 ?rmv 引用会产生两个模块实例，重复下载与解析');
});
