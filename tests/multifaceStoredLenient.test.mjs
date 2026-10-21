// 已经净化、由浏览器重新输出过的多面存档：样式里漏一个右括号不再判整批不可恢复（浏览器照样显示）；
// 新出的模型输出照旧严格检查；越界标签照旧不放过。
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMultifaceOutput } from '../src/multifaceProtocol.js';

const face = (n, css) => `<toto data-rabbit-mirror="true" data-rm-face="${n}"><details><summary>第${n}面</summary><style>${css}</style><p>正文${n}</p></details></toto>`;

test('stored display tolerates only an extra closing brace, never a missing one', () => {
    const extra = [face(1, '.a{color:red}}'), face(2, '.b{}')].join('\n');
    assert.equal(parseMultifaceOutput(extra, { expectedCount: 2 }).ok, false, 'fresh output stays strict');
    assert.equal(parseMultifaceOutput(extra, { expectedCount: 2, storedDisplay: true }).ok, true);
    // 漏写右括号：最后那条规则会作用到整个页面，存档里也不放过
    const missing = [face(1, '.a{color:red}'), face(2, '.b{} body{outline:7px solid red')].join('\n');
    assert.equal(parseMultifaceOutput(missing, { expectedCount: 2, storedDisplay: true }).ok, false);
});

test('stored display still rejects face markup leaking into a style', () => {
    const html = [face(1, '.a{color:red} </details><details>'), face(2, '.b{}')].join('\n');
    assert.equal(parseMultifaceOutput(html, { expectedCount: 2, storedDisplay: true }).ok, false);
});
