// 已经净化、由浏览器重新输出过的多面存档：样式里漏一个右括号不再判整批不可恢复（浏览器照样显示）；
// 新出的模型输出照旧严格检查；越界标签照旧不放过。
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMultifaceOutput } from '../src/multifaceProtocol.js';

const face = (n, css) => `<toto data-rabbit-mirror="true" data-rm-face="${n}"><details><summary>第${n}面</summary><style>${css}</style><p>正文${n}</p></details></toto>`;

test('stored display tolerates an unbalanced brace inside a face style', () => {
    const html = [face(1, '.a{color:red}'), face(2, '@keyframes k{from{opacity:0} to{opacity:1}')].join('\n');
    assert.equal(parseMultifaceOutput(html, { expectedCount: 2 }).ok, false, 'fresh output stays strict');
    assert.equal(parseMultifaceOutput(html, { expectedCount: 2, storedDisplay: true }).ok, true);
    const extra = [face(1, '.a{color:red}}'), face(2, '.b{}')].join('\n');
    assert.equal(parseMultifaceOutput(extra, { expectedCount: 2, storedDisplay: true }).ok, true);
});

test('stored display still rejects face markup leaking into a style', () => {
    const html = [face(1, '.a{color:red} </details><details>'), face(2, '.b{}')].join('\n');
    assert.equal(parseMultifaceOutput(html, { expectedCount: 2, storedDisplay: true }).ok, false);
});
