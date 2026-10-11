// 插件修复与老修复器之间的接力（只在维修兔「修交互／全面维修」时运行）。
// 同一时间只有一边管：插件写法的区域先归插件；维修时在隔离副本里实测，插件区域里还有点了没反应的控件，
// 就在另一份副本里把这一块整块“退还”（撤掉插件接线、标识原样保留），让老修复器整套去修，再测一次。
// 退还后：原来能用的控件仍然能用，而且没反应的变少了（不算只加了“已点击”提示的那种），才在真实页面上照做；
// 否则保持插件接线不动。真实页面上的控件在确认之前一个不碰。
import { collectGenericProbeControls, openGenericProbeSandbox, probeGenericControls } from './maintenanceGenericProbe.js?rmv=1.67.67';
import { releaseBehaviorGroup } from './behaviorInteractions.js?rmv=1.67.67';
import { activateRabbitMirrorInteractionRescue, rearmRabbitMirrorSerializedInteractionRoot } from './idsAndRearm.js?rmv=1.67.67';
import { clearPersistedCheckedInlineArtifacts } from './checkedStateRescue.js?rmv=1.67.67';
import { INERT_ACTION_BUTTON_RESCUE_ATTR } from './diagnostics.js?rmv=1.67.67';
import { behaviorRelayFaceKey, behaviorRelayGroupIndex, rememberBehaviorRelay } from './behaviorRelayMemory.js?rmv=1.67.67';

export const BEHAVIOR_RELAY_ATTR = 'data-rabbit-mirror-behavior-relayed';
const GROUP_TAG = 'data-rm-relay-group';
const NODE_TAG = 'data-rm-relay-node';
const RELAY_BUDGET_MS = 1500;

function faceDetails(root) {
    return root?.matches?.('details') ? root : root?.querySelector?.('details');
}

// 本面里的插件区域（滚动容器不算），按文档顺序；真实页面和副本用同一个顺序对应。
function pluginGroups(details) {
    return [...(details?.querySelectorAll?.('[data-rm-ui]') || [])].filter(group => group.getAttribute('data-rm-ui') !== 'scroll');
}

// 只在副本里打编号：每个插件区域一个号，区域里每个元素一个号。两份副本克隆自同一时刻的真实页面，编号一一对应。
function tagClone(details) {
    pluginGroups(details).forEach((group, groupIndex) => {
        group.setAttribute(GROUP_TAG, String(groupIndex));
        [...group.querySelectorAll('*')].forEach((node, nodeIndex) => node.setAttribute(NODE_TAG, `${groupIndex}:${nodeIndex}`));
    });
}

// 每个区域里每个控件的实测结果：{ groupIndex: Map(nodeTag → { outcome, inert }) }
function measure(opened, started) {
    const controls = collectGenericProbeControls(opened).filter(control => control.element.closest(`[${GROUP_TAG}]`));
    const { outcomes } = probeGenericControls(opened.details, controls, started, RELAY_BUDGET_MS);
    const byGroup = new Map();
    for (const [control, outcome] of outcomes) {
        const tag = control.element.getAttribute(NODE_TAG);
        const group = control.element.closest(`[${GROUP_TAG}]`)?.getAttribute(GROUP_TAG);
        if (!tag || group == null || outcome === 'skip' || outcome === 'uncertain') continue;
        if (!byGroup.has(group)) byGroup.set(group, new Map());
        byGroup.get(group).set(tag, { outcome, inert: control.element.hasAttribute(INERT_ACTION_BUTTON_RESCUE_ATTR) });
    }
    return byGroup;
}

function improved(before, after) {
    if (!before || !after) return false;
    let deadBefore = 0, deadAfter = 0;
    for (const [tag, { outcome }] of before) {
        const now = after.get(tag);
        if (outcome === 'dead') {
            deadBefore += 1;
            // 退还后只是多了老修复器的“已点击”提示，不算真的修好。
            if (!now || now.outcome !== 'live' || now.inert) deadAfter += 1;
        } else if (outcome === 'live' && now?.outcome !== 'live') return false;
    }
    return deadBefore > 0 && deadAfter < deadBefore;
}

// 返回在真实页面上交给老修复器的区域数；副本建不起来或没有需要接力的区域时返回 0。
export function relayDeadBehaviorGroups(root) {
    const liveDetails = faceDetails(root);
    const liveGroups = pluginGroups(liveDetails);
    if (!liveGroups.length) return 0;
    const started = Date.now();
    let candidates = [];
    let before = null;
    const first = openGenericProbeSandbox(root, (toto, details) => tagClone(details));
    if (!first) return 0;
    try {
        before = measure(first, started);
        candidates = [...before].filter(([, nodes]) => [...nodes.values()].some(item => item.outcome === 'dead')).map(([group]) => group);
    } catch (error) {
        console.debug('[RabbitMirror] behavior relay probe failed:', error);
    } finally {
        try { first.sandbox.destroy(); } catch {}
    }
    if (!candidates.length || Date.now() - started > RELAY_BUDGET_MS) return 0;
    let accepted = [];
    const second = openGenericProbeSandbox(root, (toto, details) => {
        tagClone(details);
        for (const group of details.querySelectorAll(`[${GROUP_TAG}]`)) {
            if (candidates.includes(group.getAttribute(GROUP_TAG))) releaseBehaviorGroup(toto, group);
        }
    });
    if (!second) return 0;
    try {
        const after = measure(second, Date.now());
        accepted = candidates.filter(group => improved(before.get(group), after.get(group)));
    } catch (error) {
        console.debug('[RabbitMirror] behavior relay verify failed:', error);
    } finally {
        try { second.sandbox.destroy(); } catch {}
    }
    if (!accepted.length) return 0;
    const toto = root.closest?.('toto') || root;
    // 先按退还前的样子记下这一面的指纹（退还后类型名仍记在 data-rm-released 上，指纹不变）。
    const faceKey = behaviorRelayFaceKey(liveDetails);
    const memoryIndexes = accepted.map(index => behaviorRelayGroupIndex(liveDetails, liveGroups[Number(index)])).filter(index => index >= 0);
    let relayed = 0;
    for (const index of accepted) {
        const group = liveGroups[Number(index)];
        if (!group?.isConnected || !releaseBehaviorGroup(toto, group)) continue;
        // 和副本里验证过的做法一致：这一块换成一份干净的副本（去掉之前挂在里面元素上的旧监听和“已修过”标记，
        // 比如插件区域里被当成“没反应按钮”加上的已点击提示），再让老修复器整套接一遍。
        const fresh = group.cloneNode(true);
        try { rearmRabbitMirrorSerializedInteractionRoot(fresh); } catch {}
        try {
            const unchecked = [...fresh.querySelectorAll('input[type="checkbox"], input[type="radio"]')].filter(input => !input.hasAttribute('checked'));
            if (unchecked.length) clearPersistedCheckedInlineArtifacts(fresh, unchecked);
        } catch {}
        group.replaceWith(fresh);
        relayed += 1;
    }
    if (!relayed) return 0;
    rememberBehaviorRelay(faceKey, memoryIndexes);
    try { activateRabbitMirrorInteractionRescue(toto); } catch (error) { console.debug('[RabbitMirror] behavior relay rescue failed:', error); }
    root.setAttribute(BEHAVIOR_RELAY_ATTR, String((Number(root.getAttribute(BEHAVIOR_RELAY_ATTR)) || 0) + relayed));
    return relayed;
}
