// 维修兔流程里三处衔接：手动巡逻的结论交给自动维修；提前退出时结果面板不再一直「正在处理」；复测没测完不算修好。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const inspect = readFileSync(new URL('../src/outputSanitizer/maintenanceInspect.js', import.meta.url), 'utf8');
const chrome = readFileSync(new URL('../src/outputSanitizer/toolsChrome.js', import.meta.url), 'utf8');
const between = (source, from, to) => source.slice(source.indexOf(from), source.indexOf(to, source.indexOf(from)));

test('patrol dead counts are keyed on the face details, whichever node the caller passes', () => {
    const code = between(inspect, 'const maintenancePatrolDeadCounts', 'function maintenancePatrolDeadFinding');
    const context = vm.createContext({});
    vm.runInContext(`${code}\nglobalThis.T = { maintenancePatrolDeadCount, setMaintenancePatrolDeadCount };`, context);
    const details = { matches: sel => sel === 'details' };
    const host = { matches: () => false, querySelector: () => details };
    context.T.setMaintenancePatrolDeadCount(host, 2);
    assert.equal(context.T.maintenancePatrolDeadCount(details), 2);
    context.T.setMaintenancePatrolDeadCount(details, 0);
    assert.equal(context.T.maintenancePatrolDeadCount(host), 0);
});

test('manual patrol hands its dead-control count to automatic repair; a timed-out probe never clears it', () => {
    const patrol = between(inspect, 'export function patrolMaintenanceRabbit(', 'function findLiveMaintenanceRoot(');
    assert.match(patrol, /patrolDeadToRecord = deadCount/);
    assert.match(patrol, /maintenanceRepairOriginIsCurrent\(origin\)\) \{\s*if \(patrolDeadToRecord >= 0\) setMaintenancePatrolDeadCount\(root, patrolDeadToRecord\)/);
    const plan = between(inspect, 'function runMaintenanceAutomaticRepairPlan(', 'const initialPlan = maintenanceRepairModesForFindings(initialFindings);');
    assert.match(plan, /runMaintenanceGenericProbe\(root/);
    assert.match(patrol, /if \(deadCount \|\| \(!probe\.truncated && !probe\.uncertain\)\)/);
    assert.match(inspect, /if \(dead\.length \|\| \(!probe\.truncated && !probe\.uncertain\)\) setMaintenancePatrolDeadCount/);
    assert.match(inspect, /不能确定控件都正常/);
    const finalize = between(inspect, '巡逻测出过没反应的控件：修完在隐藏副本里再实测一遍', '// 先用维修前');
    assert.match(finalize, /found > 0 \|\| \(!probe\.truncated && !probe\.uncertain\)/);
});

test('result panel stops waiting: no new state means not executed; a replaced button is found again', () => {
    const code = between(chrome, "const MAINTENANCE_PANEL_WAITING", 'function watchMaintenanceResultPanel(');
    const status = { isConnected: true, textContent: '正在处理当前镜面…', setAttribute() {} };
    const make = attrs => ({ isConnected: true, getAttribute: name => attrs[name] });
    const oldAttrs = { state: 'idle', reason: '旧结论', stamp: '3' };
    const button = make(oldAttrs);
    let others = [];
    const context = vm.createContext({ maintenanceResultPanel: { status, button, context: { index: 3 } }, MAINTENANCE_STATE_ATTR: 'state', MAINTENANCE_REASON_ATTR: 'reason', MAINTENANCE_STATE_STAMP_ATTR: 'stamp',
        MAINTENANCE_RABBIT_ATTR: 'rabbit', MAINTENANCE_STATES: { idle: 'idle', checking: 'checking', unknown: 'unknown' }, maintenanceMenuProblemText: (s, r) => r,
        mergeMaintenanceProblemAndRecommendation: text => text, document: { querySelectorAll: () => others }, maintenanceButtonBelongsToPanel: (f, b) => b.mine, maintenancePanelFaceStillCurrent: () => true, closeMaintenanceRabbitMenu() {},
        getRenderedMessageElement: () => ({ querySelectorAll: () => others }) });
    vm.runInContext(`${code}\nglobalThis.settle = settleMaintenanceResultPanel;`, context);
    // 戳记没变：这次根本没执行（哪怕按钮正显示着别的维修的「正在维修」）。
    oldAttrs.state = 'checking';
    assert.equal(context.settle(button, 3), true);
    assert.match(status.textContent, /这次没有执行/);
    // 执行了、还在进行中：继续等；做完了：写它的结论（哪怕和上次一字不差）。
    status.textContent = '正在处理当前镜面…';
    oldAttrs.stamp = '4';
    assert.equal(context.settle(button, 3), false);
    oldAttrs.state = 'idle';
    assert.equal(context.settle(button, 3), true);
    assert.equal(status.textContent, '旧结论');
    // 维修换了节点：原来的按钮不在页面上了，找这一面现在的按钮。
    status.textContent = '正在处理当前镜面…';
    button.isConnected = false;
    const fresh = { ...make({ state: 'healthy', reason: '修好了', stamp: '1' }), mine: true };
    others = [{ ...make({}), mine: false }, fresh];
    assert.equal(context.settle(button, 3), true);
    assert.equal(status.textContent, '修好了');
});

test('result panel no longer belongs to the face after its version is switched (remount epoch changes)', () => {
    const code = between(chrome, 'function maintenancePanelFaceStillCurrent(', 'export function updateMaintenanceRabbitMenuState(');
    const context = vm.createContext({ maintenanceResultContext: () => ({ index: 1 }) });
    vm.runInContext(`${code}\nglobalThis.check = maintenancePanelFaceStillCurrent;`, context);
    const host = { isConnected: true, dataset: { rmKey: 'k', rmSourceHash: 'h', rmFaceRemountEpoch: '2' } };
    const feedback = { root: {}, context: { index: 1 }, face: { source: 'independent', host }, ownerKey: 'k', sourceHash: 'h', remountEpoch: '2' };
    assert.equal(context.check(feedback), true);
    host.dataset.rmFaceRemountEpoch = '3';
    assert.equal(context.check(feedback), false);
});
