// 模型写到 <style> 中途重来、又从头写了一整面：丢掉没写完的第一遍，留下重写的那一遍；正常的面不动。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/outputSanitizer/markup.js', import.meta.url), 'utf8');
const start = source.indexOf('const RESTART_TAG_RE');
const end = source.indexOf('export function repairMalformedRabbitMirrorMarkup');
const context = vm.createContext({});
vm.runInContext(`${source.slice(start, end).replace(/^export /gm, '')}\nthis.cut = cutRestartedMirrorAttempts;`, context);
const cut = context.cut;

test('restarted toto inside a style keeps the complete second attempt', () => {
    const first = '<toto data-rabbit-mirror="true"><details open><summary>阿雪</summary><style>.a{color:red}.node[data-';
    const second = '<toto data-rabbit-mirror="true"><details open><summary>阿雪</summary><style>.b{color:blue}</style><div data-rm-ui="pick"><button data-rm-pick="x">字字</button></div></details></toto>';
    assert.equal(cut(`前言\n${first}${second}\n后记`), `前言\n${second}\n后记`);
});

test('restarted details inside a style (no toto in the restart) keeps the outer toto', () => {
    const html = '<toto data-rabbit-mirror="true"><details><summary>甲</summary><style>.a{x:1}.b[data-<details><summary>乙</summary><style>.c{y:2}</style><p>字字字</p></details></toto>';
    assert.equal(cut(html), '<toto data-rabbit-mirror="true"><details><summary>乙</summary><style>.c{y:2}</style><p>字字字</p></details></toto>');
});

test('independent inner without toto', () => {
    const html = '<details><summary>甲</summary><style>.a{x:1}.b[data-<details open><summary>乙</summary><style>.c{}</style><p>字</p></details>';
    assert.equal(cut(html), '<details open><summary>乙</summary><style>.c{}</style><p>字</p></details>');
});

test('normal faces and earlier complete faces are untouched', () => {
    const ok = '<toto><details><summary>甲</summary><style>.a{content:"<b>"}</style><p>字</p></details></toto>';
    assert.equal(cut(ok), ok);
    const twoFaces = `${ok}\n<toto><details><summary>乙</summary><style>.a{}.x[data-<toto><details><summary>丙</summary><style>.z{}</style></details></toto>`;
    assert.equal(cut(twoFaces), `${ok}\n<toto><details><summary>丙</summary><style>.z{}</style></details></toto>`);
});
