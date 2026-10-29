import { collectGenericProbeControls, openGenericProbeSandbox, probeGenericControls } from './maintenanceGenericProbe.js?rmv=1.99.14';
import { installBehaviorInteractions } from './behaviorInteractions.js?rmv=1.99.14';
import { behaviorStyleText, hasBehaviorStateClasses } from './behaviorStateMirror.js?rmv=1.99.14';
import { rearmRabbitMirrorSerializedInteractionRoot } from './idsAndRearm.js?rmv=1.99.14';
import { INERT_ACTION_BUTTON_RESCUE_ATTR } from './diagnostics.js?rmv=1.99.14';
import { applyReversePatch, authoredElements, behaviorFaceTextKey, elementSignature, rememberReversePatches } from './behaviorRelayMemory.js?rmv=1.99.14';
import { assertNameMaskRestorable, prepareNameMaskReplacement } from '../nameMask.js?rmv=1.99.14';
export const BEHAVIOR_REVERSE_ATTR = 'data-rabbit-mirror-behavior-reverse-relayed';
const NODE_TAG = 'data-rm-rev-node';
const BUDGET_MS = 1500;
const BLOCKING = 'input[type="checkbox"], input[type="radio"], input[type="range"], details, label[for], [data-rm-released]';
function faceDetails(root) {
    return root?.matches?.('details') ? root : root?.querySelector?.('details');
}
function tagClone(details) {
    authoredElements(details).forEach((node, index) => node.setAttribute(NODE_TAG, String(index)));
}
function measure(opened, started, handwrittenOnly = true) {
    const controls = collectGenericProbeControls(opened).filter(control => !handwrittenOnly || !control.element.closest('[data-rm-ui]'));
    const { outcomes } = probeGenericControls(opened.details, controls, started, BUDGET_MS);
    const result = new Map();
    for (const [control, outcome] of outcomes) {
        const tag = control.element.getAttribute(NODE_TAG);
        if (tag == null || outcome === 'skip' || outcome === 'uncertain')
            continue;
        result.set(tag, { outcome, kind: control.kind, inert: control.element.hasAttribute(INERT_ACTION_BUTTON_RESCUE_ATTR) });
    }
    return result;
}
function safeGroup(details, group) {
    if (!group || group === details || !details.contains(group) || group.matches('summary, details, toto') || group.closest('summary'))
        return false;
    if (group.closest('[data-rm-ui], [data-rm-released]'))
        return false;
    return !group.querySelector(BLOCKING);
}
function commonAncestor(nodes) {
    for (let node = nodes[0]?.parentElement; node; node = node.parentElement)
        if (nodes.every(item => node.contains(item)))
            return node;
    return null;
}
const firstClass = node => String(node?.getAttribute?.('class') || '').split(/\s+/).filter(Boolean)[0] || '';
const isControlLike = node => node.matches?.('button, [role="button"], a[href]') || false;
const PROGRAM_ATTR = /^(?:data-(?!rm-|rabbit)[\w-]+|aria-[\w-]+)$/;
function splitCompounds(selector) {
    const parts = [];
    let depth = 0, current = '';
    for (const char of selector) {
        if (char === '[')
            depth += 1;
        if (char === ']')
            depth = Math.max(0, depth - 1);
        if (!depth && /[\s>+~]/.test(char)) {
            if (current)
                parts.push(current);
            current = '';
            continue;
        }
        current += char;
    }
    if (current)
        parts.push(current);
    return parts;
}
function attributePrograms(toto) {
    const text = behaviorStyleText(toto);
    const programs = [];
    for (const match of text.matchAll(/([^{}@;]+)\{/g)) {
        for (const selector of match[1].split(',')) {
            const compounds = splitCompounds(selector.trim());
            compounds.forEach((compound, index) => {
                const holder = [...compound.matchAll(/([.#])([A-Za-z_][\w-]*)/g)].map(item => `${item[1]}${item[2]}`);
                if (!holder.length || index === compounds.length - 1)
                    return;
                for (const attrMatch of compound.matchAll(/\[\s*([\w-]+)\s*=\s*["']?([^"'\]]+)["']?\s*\]/g)) {
                    if (!PROGRAM_ATTR.test(attrMatch[1]))
                        continue;
                    const targets = compounds.slice(index + 1).flatMap(part => [...part.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(item => item[1]));
                    programs.push({ holder, attr: attrMatch[1], value: attrMatch[2].trim(), targets });
                }
            });
        }
    }
    return programs;
}
const matchesTokens = (node, tokens) => tokens.every(token => token[0] === '#' ? node.id === token.slice(1) : node.classList?.contains(token.slice(1)));
function inferAttributePrograms(toto, details, deadNodes, claimed) {
    const programs = attributePrograms(toto);
    if (!programs.length)
        return [];
    const groups = new Map();
    for (const control of deadNodes) {
        if (claimed.has(control) || control.matches('label, input, summary'))
            continue;
        for (const program of programs) {
            if (!program.targets.some(name => control.classList?.contains(name)))
                continue;
            let holder = control.parentElement;
            while (holder && holder !== details && !matchesTokens(holder, program.holder))
                holder = holder.parentElement;
            if (!holder || holder === details || !details.contains(holder))
                continue;
            const key = `${program.attr}`;
            if (!groups.has(holder))
                groups.set(holder, new Map());
            const byAttr = groups.get(holder);
            if (!byAttr.has(key))
                byAttr.set(key, new Map());
            const values = byAttr.get(key);
            if (![...values.values()].includes(program.value) && !values.has(control))
                values.set(control, program.value);
            break;
        }
    }
    const patches = [];
    for (const [holder, byAttr] of groups) {
        for (const [attr, values] of byAttr) {
            if (values.size < 2 || !safeGroup(details, holder))
                continue;
            const controls = [...values.keys()];
            const keys = controls.map(control => values.get(control));
            const current = String(holder.getAttribute(attr) || '');
            patches.push({ type: 'pick', group: holder, controls, panels: [], keys, attr, picked: keys.indexOf(current) });
            controls.forEach(control => claimed.add(control));
        }
    }
    return patches;
}
function infer(toto, details, deadNodes) {
    const claimed = new Set();
    const patches = inferAttributePrograms(toto, details, deadNodes, claimed);
    for (const control of deadNodes) {
        if (claimed.has(control) || control.matches('label, input, summary') || control.closest('[data-rm-ui], [data-rm-released]'))
            continue;
        const parent = control.parentElement;
        const siblings = parent ? [...parent.children].filter(node => node.tagName === control.tagName && firstClass(node) === firstClass(control)) : [];
        if (siblings.length >= 2) {
            let found = null;
            for (let scope = parent.parentElement, depth = 0; scope && depth < 3 && !found && details.contains(scope) && scope !== details.parentElement; scope = scope.parentElement, depth++) {
                const byClass = new Map();
                for (const node of scope.querySelectorAll('[class]')) {
                    if (siblings.some(item => item.contains(node) || node.contains(item)) || node.querySelector('button, [role="button"]'))
                        continue;
                    if (!hasBehaviorStateClasses(toto, node))
                        continue;
                    const key = firstClass(node);
                    if (!key)
                        continue;
                    if (!byClass.has(key))
                        byClass.set(key, []);
                    byClass.get(key).push(node);
                }
                const panels = [...byClass.values()].find(list => list.length === siblings.length);
                if (panels)
                    found = panels;
            }
            const group = found && commonAncestor([...siblings, ...found]);
            if (found && safeGroup(details, group)) {
                const authored = found.findIndex(node => String(node.getAttribute('class') || '').split(/\s+/).some(name => /^(?:is-)?(?:active|current|show|shown|open|selected|on)$/.test(name)));
                let picked = authored;
                if (picked < 0) {
                    const visible = found.map(node => { try {
                        const s = getComputedStyle(node);
                        return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0.05;
                    }
                    catch {
                        return true;
                    } });
                    picked = visible.filter(Boolean).length === 1 ? visible.indexOf(true) : 0;
                }
                patches.push({ type: 'pick', group, controls: siblings, panels: found, picked });
                siblings.forEach(node => claimed.add(node));
                continue;
            }
        }
        let group = null;
        for (let node = control, depth = 0; node && depth < 5 && node !== details; node = node.parentElement, depth++) {
            if (hasBehaviorStateClasses(toto, node)) {
                group = node;
                break;
            }
        }
        if (!group) {
            for (let node = control.nextElementSibling, step = 0; node && step < 3; node = node.nextElementSibling, step++) {
                if (isControlLike(node))
                    break;
                if (hasBehaviorStateClasses(toto, node) || [...node.querySelectorAll('[class]')].some(child => hasBehaviorStateClasses(toto, child))) {
                    group = control.parentElement;
                    break;
                }
            }
        }
        if (!safeGroup(details, group))
            continue;
        const existing = patches.find(patch => patch.type === 'toggle' && patch.group === group);
        if (existing)
            existing.controls.push(control);
        else
            patches.push({ type: 'toggle', group, controls: [control], panels: [], picked: -1 });
        claimed.add(control);
    }
    return patches.filter(patch => !patches.some(other => other !== patch && patch.group.contains(other.group) && patch.group !== other.group));
}
function score(before, after) {
    let deadBefore = 0, deadAfter = 0;
    for (const [tag, { outcome }] of before) {
        const now = after.get(tag);
        if (outcome === 'dead') {
            deadBefore += 1;
            if (!now || now.outcome !== 'live' || now.inert)
                deadAfter += 1;
        }
        else if (outcome === 'live' && now?.outcome !== 'live')
            return null;
    }
    return { deadBefore, deadAfter };
}
export function reverseRelayDeadHandwrittenControls(root) {
    const details = faceDetails(root);
    if (!details)
        return 0;
    const toto = root.closest?.('toto') || root;
    const started = Date.now();
    const first = openGenericProbeSandbox(root, (clone, cloneDetails) => tagClone(cloneDetails));
    if (!first)
        return 0;
    let before = null;
    try {
        before = measure(first, started);
    }
    catch (error) {
        console.debug('[RabbitMirror] reverse relay probe failed:', error);
    }
    finally {
        try {
            first.sandbox.destroy();
        }
        catch { }
    }
    if (!before || Date.now() - started > BUDGET_MS)
        return 0;
    const liveNodes = authoredElements(details);
    const dead = [...before].filter(([, item]) => item.outcome === 'dead' && item.kind !== 'label' && item.kind !== 'input' && item.kind !== 'range')
        .map(([tag]) => liveNodes[Number(tag)]).filter(Boolean);
    if (!dead.length)
        return 0;
    const inferred = infer(toto, details, dead);
    if (!inferred.length)
        return 0;
    const indexOf = node => liveNodes.indexOf(node);
    const patches = inferred.map(patch => ({ type: patch.type, group: indexOf(patch.group), controls: patch.controls.map(indexOf), panels: patch.panels.map(indexOf), picked: patch.picked,
        ...(patch.keys ? { keys: patch.keys, attr: patch.attr } : {}) }))
        .filter(patch => patch.group >= 0 && patch.controls.every(index => index >= 0) && patch.panels.every(index => index >= 0));
    if (!patches.length)
        return 0;
    const second = openGenericProbeSandbox(root, (clone, cloneDetails) => {
        tagClone(cloneDetails);
        const nodes = authoredElements(cloneDetails);
        for (const patch of patches)
            applyReversePatch(nodes, patch);
    });
    if (!second)
        return 0;
    let verdict = null;
    try {
        verdict = score(before, measure(second, Date.now(), false));
    }
    catch (error) {
        console.debug('[RabbitMirror] reverse relay verify failed:', error);
    }
    finally {
        try {
            second.sandbox.destroy();
        }
        catch { }
    }
    if (!verdict || verdict.deadAfter >= verdict.deadBefore)
        return 0;
    for (const patch of patches)
        assertNameMaskRestorable(liveNodes[patch.group]);
    const signatures = patches.map(patch => ({
        ...patch,
        sig: [patch.group, ...patch.controls, ...patch.panels].map(index => [index, elementSignature(liveNodes[index])]),
    }));
    const faceKey = behaviorFaceTextKey(details);
    let applied = 0;
    for (const patch of patches) {
        const group = liveNodes[patch.group];
        if (!group?.isConnected)
            continue;
        const fresh = group.cloneNode(true);
        const commitNameMaskReplacement = prepareNameMaskReplacement(fresh, group);
        try {
            rearmRabbitMirrorSerializedInteractionRoot(fresh);
        }
        catch { }
        group.replaceWith(fresh);
        commitNameMaskReplacement();
        applied += 1;
    }
    if (!applied)
        return 0;
    const nodes = authoredElements(details);
    for (const patch of patches)
        applyReversePatch(nodes, patch);
    try {
        installBehaviorInteractions(toto);
    }
    catch (error) {
        console.debug('[RabbitMirror] reverse relay wiring failed:', error);
    }
    rememberReversePatches(faceKey, signatures);
    root.setAttribute(BEHAVIOR_REVERSE_ATTR, String((Number(root.getAttribute(BEHAVIOR_REVERSE_ATTR)) || 0) + applied));
    return applied;
}
