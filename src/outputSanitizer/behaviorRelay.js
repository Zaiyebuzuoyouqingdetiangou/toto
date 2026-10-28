import { collectGenericProbeControls, openGenericProbeSandbox, probeGenericControls } from './maintenanceGenericProbe.js?rmv=1.99.7';
import { releaseBehaviorGroup } from './behaviorInteractions.js?rmv=1.99.7';
import { activateRabbitMirrorInteractionRescue, rearmRabbitMirrorSerializedInteractionRoot } from './idsAndRearm.js?rmv=1.99.7';
import { clearPersistedCheckedInlineArtifacts } from './checkedStateRescue.js?rmv=1.99.7';
import { INERT_ACTION_BUTTON_RESCUE_ATTR } from './diagnostics.js?rmv=1.99.7';
import { behaviorRelayFaceKey, behaviorRelayGroupIndex, rememberBehaviorRelay } from './behaviorRelayMemory.js?rmv=1.99.7';
import { assertNameMaskRestorable, prepareNameMaskReplacement } from '../nameMask.js?rmv=1.99.7';
export const BEHAVIOR_RELAY_ATTR = 'data-rabbit-mirror-behavior-relayed';
const GROUP_TAG = 'data-rm-relay-group';
const NODE_TAG = 'data-rm-relay-node';
const RELAY_BUDGET_MS = 1500;
const REPLAY_ATTR = 'data-rm-relay-replay';
function faceDetails(root) {
    return root?.matches?.('details') ? root : root?.querySelector?.('details');
}
function pluginGroups(details) {
    return [...(details?.querySelectorAll?.('[data-rm-ui]') || [])].filter(group => group.getAttribute('data-rm-ui') !== 'scroll');
}
function tagClone(details) {
    details.setAttribute('data-rm-quiet-feedback', '');
    pluginGroups(details).forEach((group, groupIndex) => {
        group.setAttribute(GROUP_TAG, String(groupIndex));
        [...group.querySelectorAll('*')].forEach((node, nodeIndex) => node.setAttribute(NODE_TAG, `${groupIndex}:${nodeIndex}`));
    });
}
function measure(opened, started, only = null) {
    const controls = collectGenericProbeControls(opened).filter(control => {
        const group = control.element.closest(`[${GROUP_TAG}]`);
        return group && (!only || only.includes(group.getAttribute(GROUP_TAG)));
    });
    const { outcomes } = probeGenericControls(opened.details, controls, started, RELAY_BUDGET_MS);
    const byGroup = new Map();
    for (const [control, outcome] of outcomes) {
        const tag = control.element.getAttribute(NODE_TAG);
        const group = control.element.closest(`[${GROUP_TAG}]`)?.getAttribute(GROUP_TAG);
        if (!tag || group == null || outcome === 'skip' || outcome === 'uncertain')
            continue;
        if (!byGroup.has(group))
            byGroup.set(group, new Map());
        byGroup.get(group).set(tag, { outcome, inert: control.element.hasAttribute(INERT_ACTION_BUTTON_RESCUE_ATTR) });
    }
    return byGroup;
}
function improved(before, after) {
    if (!before || !after)
        return false;
    let deadBefore = 0, deadAfter = 0;
    for (const [tag, { outcome }] of before) {
        const now = after.get(tag);
        if (outcome === 'dead') {
            deadBefore += 1;
            if (!now || now.outcome !== 'live' || now.inert)
                deadAfter += 1;
        }
        else if (outcome === 'live' && now?.outcome !== 'live')
            return false;
    }
    return deadBefore > 0 && deadAfter < deadBefore;
}
export function relayDeadBehaviorGroups(root, { onlyGroup = null, replayIndex = -1 } = {}) {
    const liveDetails = faceDetails(root);
    const liveGroups = pluginGroups(liveDetails);
    if (!liveGroups.length)
        return 0;
    const only = onlyGroup ? [String(liveGroups.indexOf(onlyGroup))] : null;
    if (only && only[0] === '-1')
        return 0;
    const started = Date.now();
    let candidates = [];
    let before = null;
    const first = openGenericProbeSandbox(root, (toto, details) => tagClone(details));
    if (!first)
        return 0;
    try {
        before = measure(first, started, only);
        candidates = [...before].filter(([, nodes]) => [...nodes.values()].some(item => item.outcome === 'dead')).map(([group]) => group);
    }
    catch (error) {
        console.debug('[RabbitMirror] behavior relay probe failed:', error);
    }
    finally {
        try {
            first.sandbox.destroy();
        }
        catch { }
    }
    if (!candidates.length || Date.now() - started > RELAY_BUDGET_MS)
        return 0;
    let accepted = [];
    const second = openGenericProbeSandbox(root, (toto, details) => {
        tagClone(details);
        for (const group of details.querySelectorAll(`[${GROUP_TAG}]`)) {
            if (candidates.includes(group.getAttribute(GROUP_TAG)))
                releaseBehaviorGroup(toto, group);
        }
    });
    if (!second)
        return 0;
    try {
        const after = measure(second, Date.now(), only);
        accepted = candidates.filter(group => improved(before.get(group), after.get(group)));
    }
    catch (error) {
        console.debug('[RabbitMirror] behavior relay verify failed:', error);
    }
    finally {
        try {
            second.sandbox.destroy();
        }
        catch { }
    }
    if (!accepted.length)
        return 0;
    for (const index of accepted)
        assertNameMaskRestorable(liveGroups[Number(index)]);
    const toto = root.closest?.('toto') || root;
    const faceKey = behaviorRelayFaceKey(liveDetails);
    const memoryIndexes = accepted.map(index => behaviorRelayGroupIndex(liveDetails, liveGroups[Number(index)])).filter(index => index >= 0);
    let relayed = 0;
    for (const index of accepted) {
        const group = liveGroups[Number(index)];
        if (!group?.isConnected || !releaseBehaviorGroup(toto, group))
            continue;
        const fresh = group.cloneNode(true);
        const commitNameMaskReplacement = prepareNameMaskReplacement(fresh, group);
        if (onlyGroup && replayIndex >= 0)
            fresh.querySelectorAll('*')[replayIndex]?.setAttribute(REPLAY_ATTR, '');
        try {
            rearmRabbitMirrorSerializedInteractionRoot(fresh);
        }
        catch { }
        try {
            const unchecked = [...fresh.querySelectorAll('input[type="checkbox"], input[type="radio"]')].filter(input => !input.hasAttribute('checked'));
            if (unchecked.length)
                clearPersistedCheckedInlineArtifacts(fresh, unchecked);
        }
        catch { }
        group.replaceWith(fresh);
        commitNameMaskReplacement();
        relayed += 1;
    }
    if (!relayed)
        return 0;
    rememberBehaviorRelay(faceKey, memoryIndexes);
    try {
        activateRabbitMirrorInteractionRescue(toto);
    }
    catch (error) {
        console.debug('[RabbitMirror] behavior relay rescue failed:', error);
    }
    root.setAttribute(BEHAVIOR_RELAY_ATTR, String((Number(root.getAttribute(BEHAVIOR_RELAY_ATTR)) || 0) + relayed));
    return relayed;
}
const tried = new WeakSet();
export function relayBehaviorGroupOnDemand(root, group, control = null) {
    if (!group?.isConnected || tried.has(group) || group.hasAttribute('data-rm-released'))
        return 0;
    tried.add(group);
    const replayIndex = control && group.contains(control) && control !== group ? [...group.querySelectorAll('*')].indexOf(control) : -1;
    let relayed = 0;
    try {
        relayed = relayDeadBehaviorGroups(root, { onlyGroup: group, replayIndex });
    }
    catch (error) {
        console.debug('[RabbitMirror] on-demand behavior relay failed:', error);
        return 0;
    }
    const twin = root.querySelector?.(`[${REPLAY_ATTR}]`);
    twin?.removeAttribute(REPLAY_ATTR);
    if (relayed && twin?.isConnected && twin.matches('button:not([disabled]), [role="button"]')) {
        try {
            twin.click();
        }
        catch { }
    }
    return relayed;
}
