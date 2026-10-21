// 请求结束后壳子还停在「正在生成中」：不能一直留着。成品存下了却没挂上、或成品过不了存档后恢复的检查，都换成终态说明。
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const mount = readFileSync(new URL('../src/independentApi/mount.js', import.meta.url), 'utf8');
const reroll = readFileSync(new URL('../src/automaticReroll.js', import.meta.url), 'utf8');
function install(context, name) {
    const match = mount.match(new RegExp(`^(?:export )?function ${name}\\([^]*?^}\\r?$`, 'm'));
    assert.ok(match, name);
    vm.runInContext(match[0].replace(/^export /, ''), context);
}
class Element {
    constructor(tag) { this.tagName = tag.toUpperCase(); this.dataset = {}; this.children = []; this.isConnected = true; this.text = ''; }
    append(...nodes) { for (const node of nodes) { node.parentElement = this; this.children.push(node); } }
    querySelector(selector) { return selector === ':scope > details' ? this.children.find(child => child.tagName === 'DETAILS') || null : null; }
}

test('a flight whose host is still loading after success gets a terminal shell and the result is offered for download', () => {
    const host = new Element('div'); host.dataset = { rmState: 'loading', rmSource: 'independent', rmKey: 'k' };
    const details = new Element('details'); host.append(details);
    const calls = { summary: [], body: [], unsaved: [] };
    const sandbox = {
        messageElement: () => null, externalHosts: () => [],
        setPlaceholderSummary: (node, text) => calls.summary.push(text),
        renderExternalErrorBody: (node, text) => calls.body.push(text),
        showIndependentUnsavedOutput: (record, slot, options) => calls.unsaved.push({ record, slot, options }),
    };
    const context = vm.createContext(sandbox);
    install(context, 'settleStuckLoadingHost');
    const flight = { loadingHost: host, index: 3, key: 'k' };
    assert.equal(vm.runInContext('settleStuckLoadingHost', context)(flight, { html: '<details></details>' }, 'slot'), true);
    assert.equal(host.dataset.rmState, 'error');
    assert.match(calls.summary[0], /生成完了，但没能挂上/);
    assert.match(calls.body[0], /不会自动重发/);
    assert.equal(calls.unsaved[0].slot, 'slot');
    assert.equal(calls.unsaved[0].options, undefined, '已存档的单面不是「尚未合并到多面镜」');
    // 已经是 ready 的壳子不动
    host.dataset.rmState = 'ready';
    assert.equal(vm.runInContext('settleStuckLoadingHost', context)(flight, null), false);
});

test('the finally fallback no longer depends on uiSettled, and the accept step checks restorability', () => {
    assert.match(mount, /if\(!settleCancelledIndependentFlightUi\(flight,flight\.cancelReason\|\|'request-ended-without-terminal-ui'\)\) settleStuckLoadingHost\(flight,flight\.completedFaceRecord\|\|null\)/);
    assert.match(mount, /if\(!independentStoredHtmlRestorable\(completed\.html\) \|\| !prepareStoredIndependentRecordHtml\(completed,settledSlot\)\)/);
    assert.match(mount, /code:'RABBIT_MIRROR_STORED_UNRESTORABLE',requestCount:1/);
    assert.match(mount, /flight\.persisted=true;/);
    assert.match(mount, /if\(flight\.persisted\) return false;/);
    assert.match(reroll, /STORED_UNRESTORABLE\)/);
    assert.doesNotMatch(reroll, /STORED_UNRESTORABLE\|MARKUP_/, '结构超限仍按原来的规则自动补发');
    // 成品过不了恢复检查时：占位壳换成失败说明，不标成 ready
    assert.match(mount, /const keptReady=!!\(liveHost && liveHost\.dataset\?\.rmState!=='loading'/);
    assert.match(mount, /else if\(liveEl\) ensureExternalUi\(liveEl,failedKey,failureMessage,'error','independent',failedHash\);/);
});
