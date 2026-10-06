// Recover only a complete, keyed duplicate radio group with existing CSS panels.
// No content, button meaning, or branch order is inferred from prose.
import { parseCheckedRulesFromText, resolveTargetsForCheckedRule } from './checkedStateRescue.js?rmv=1.65.5';
import { inputHasAssociatedLabel } from './fallbackRescue.js?rmv=1.65.5';
import { getRabbitMirrorLocalStyleElements } from './runtime.js?rmv=1.65.5';

export const RADIO_BRANCH_COUNT_ATTR = 'data-rabbit-mirror-radio-branch-count';
export const RADIO_BRANCH_CONTROL_ATTR = 'data-rm-radio-branch-control';
const states = new WeakMap();
const BASELINE_ATTR = 'data-rm-radio-branch-display-baseline';
const SEEDED_ATTR = 'data-rm-radio-branch-seeded-baseline';

function hasOwnedRoute(node) {
    return node.closest('[data-rm-ui]') || [...node.attributes].some(attr =>
        /^data-(?:rabbit-mirror|rm)-.*(?:program|self-mutation|rendered-|focus-within|change-pseudo|direct-id|named-function|script-timeline|pseudo-rescue)/.test(attr.name));
}

function identity(input) {
    const match = String(input.id || '').match(/^(.*[_-])([a-zA-Z]+)([1-9]\d{0,2})$/);
    return match ? { prefix: match[1], role: match[2], key: match[3] } : null;
}

function hiddenRadio(input) {
    return input?.type === 'radio' && !input.disabled && !input.form
        && /(?:^|;)\s*display\s*:\s*none\s*(?:!important)?\s*(?:;|$)/i.test(input.getAttribute('style') || '');
}

function groupIdentity(group) {
    const ids = group.map(identity);
    if (ids.some(id => !id) || new Set(ids.map(id => id.key)).size !== ids.length
        || ids.some(id => id.prefix !== ids[0].prefix || id.role !== ids[0].role)) return null;
    return ids;
}

export function findRadioBranchCandidates(root) {
    if (!root?.querySelectorAll || root.querySelector('script,[onclick],[onchange],[oninput]')) return [];
    const css = getRabbitMirrorLocalStyleElements(root).map(style => style.textContent || '').join('\n');
    // Complex authored state programs must keep their own semantics.
    if (/:has\(/i.test(css)) return [];
    const groups = new Map();
    const radios = [...root.querySelectorAll('input[type="radio"]')];
    if (radios.length > 64) return [];
    for (const input of radios) {
        if (!input.name) continue;
        if (!groups.has(input.name)) groups.set(input.name, []);
        groups.get(input.name).push(input);
    }
    const eligible = [...groups.values()].filter(group => group.length >= 2 && group.length <= 8
        && group.every(hiddenRadio) && groupIdentity(group));
    const proposals = [];
    for (const sources of eligible) {
        const labels = sources.map(input => input.closest('label'));
        const selectorHost = labels[0]?.parentElement;
        if (!selectorHost || sources.some((input, index) => !labels[index]
            || labels[index].parentElement !== selectorHost
            || labels[index].querySelectorAll('input,button,select,textarea').length !== 1
            || (labels[index].getAttribute('for') && labels[index].getAttribute('for') !== input.id)
            || hasOwnedRoute(input) || hasOwnedRoute(labels[index])
            || parseCheckedRulesFromText(root, input).length
            || css.includes(input.id))) continue;
        const sourceIds = groupIdentity(sources);
        if (sources.some(input => radios.filter(other => other.id === input.id).length !== 1)) continue;
        for (const targets of eligible) {
            if (targets === sources || targets.length !== sources.length || targets.some(input => inputHasAssociatedLabel(root, input))) continue;
            const parent = targets[0].parentElement;
            if (!parent || !parent.contains(selectorHost) || targets.some(input => input.parentElement !== parent
                || input.closest('details,toto') !== sources[0].closest('details,toto'))) continue;
            const targetIds = groupIdentity(targets);
            if (targetIds[0].prefix !== sourceIds[0].prefix || targetIds[0].role === sourceIds[0].role) continue;
            if (targets.some(input => radios.filter(other => other.id === input.id).length !== 1)
                || sources.filter(input => input.checked).length > 1 || targets.filter(input => input.checked).length > 1
                || (!sources.some(input => input.checked) && !targets.some(input => input.checked))) continue;
            const byKey = new Map(targetIds.map((id, index) => [id.key, targets[index]]));
            if (sourceIds.some(id => !byKey.has(id.key))) continue;
            const pairs = [];
            for (let index = 0; index < sources.length; index++) {
                const source = sources[index], target = byKey.get(sourceIds[index].key), panel = target.nextElementSibling;
                if (!panel?.matches('div,section,article,main,aside,figure') || hasOwnedRoute(target) || hasOwnedRoute(panel)
                    || String(panel.textContent || '').trim().length < 6 || panel.contains(selectorHost)) break;
                const rules = parseCheckedRulesFromText(root, target).filter(rule => rule.relation === '+'
                    && !rule.conditionSelector && !rule.pseudoElement
                    && rule.styleMap.length === 1 && rule.styleMap[0][0] === 'display'
                    && /^(?:block|flex|grid|inline-block)$/.test(rule.styleMap[0][1])
                    && resolveTargetsForCheckedRule(root, target, rule).length === 1
                    && resolveTargetsForCheckedRule(root, target, rule)[0] === panel);
                if (rules.length !== 1) break;
                pairs.push({ source, target, panel, display: rules[0].styleMap[0][1] });
            }
            if (pairs.length === sources.length && new Set(pairs.map(pair => pair.panel)).size === pairs.length)
                proposals.push({ sources, targets, pairs });
        }
    }
    // Never choose between competing entry or result groups.
    return proposals.filter(item => proposals.filter(other => other.sources === item.sources || other.targets === item.targets).length === 1);
}

export function radioBranchVerificationTargets(root, input) {
    const entry = states.get(root)?.entries.find(item => item.sources.includes(input));
    return entry ? entry.pairs.map(pair => pair.panel) : [];
}

export function applyRadioBranchState(root, input) {
    const entry = states.get(root)?.entries.find(item => item.sources.includes(input) || item.targets.includes(input));
    if (!entry) return false;
    let selected = entry.pairs.find(pair => pair.source.checked);
    if (!selected) {
        // A pre-existing reversible controller may retain an empty baseline in
        // its WeakMap. Preserve only the baseline this repair explicitly seeded.
        selected = entry.pairs.find(pair => pair.source.getAttribute(SEEDED_ATTR) === 'true');
        if (selected) selected.source.checked = true;
    }
    for (const pair of entry.pairs) {
        const active = pair === selected;
        pair.target.checked = active;
        pair.panel.style.setProperty('display', active ? pair.display : 'none', 'important');
        pair.lastDisplay = active ? pair.display : 'none';
        pair.source.setAttribute('aria-pressed', active ? 'true' : 'false');
        pair.target.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    return true;
}

export function installRadioBranchRepair(root) {
    const entries = findRadioBranchCandidates(root);
    let state = states.get(root);
    if (!state) {
        state = { entries: [], listener: event => applyRadioBranchState(root, event.target) };
        states.set(root, state);
    }
    root.removeEventListener('input', state.listener, false);
    root.removeEventListener('change', state.listener, false);
    const oldPairs = state.entries.flatMap(entry => entry.pairs);
    for (const pair of oldPairs) {
        if (entries.some(entry => entry.pairs.some(next => next.panel === pair.panel))) continue;
        // Release only the display value still owned by this repair. Preserve a
        // later author's/host's independent change to the same property.
        if (pair.panel.style.getPropertyValue('display') === pair.lastDisplay
            && pair.panel.style.getPropertyPriority('display') === 'important') {
            if (pair.originalDisplay) pair.panel.style.setProperty('display', pair.originalDisplay, pair.originalPriority);
            else pair.panel.style.removeProperty('display');
        }
        pair.panel.removeAttribute(BASELINE_ATTR);
    }
    for (const node of root.querySelectorAll(`[${RADIO_BRANCH_CONTROL_ATTR}]`)) node.removeAttribute(RADIO_BRANCH_CONTROL_ATTR);
    state.entries = entries;
    if (!entries.length) { root.removeAttribute(RADIO_BRANCH_COUNT_ATTR); return 0; }
    root.addEventListener('input', state.listener, false);
    root.addEventListener('change', state.listener, false);
    for (const entry of entries) {
        if (!entry.sources.some(input => input.checked)) {
            const active = entry.pairs.find(pair => pair.target.checked);
            if (active) for (const pair of entry.pairs) {
                pair.source.checked = pair === active;
                pair.source.setAttribute('data-rm-reversible-radio-initial-checked', pair === active ? 'true' : 'false');
                if (pair === active) pair.source.setAttribute(SEEDED_ATTR, 'true');
            }
        }
        for (const pair of entry.pairs) {
            const previous = oldPairs.find(old => old.panel === pair.panel);
            let saved = null;
            try { saved = JSON.parse(pair.panel.getAttribute(BASELINE_ATTR) || 'null'); } catch {}
            if (!Array.isArray(saved) || saved.length !== 2 || saved.some(value => typeof value !== 'string')) saved = null;
            pair.originalDisplay = previous ? previous.originalDisplay : saved ? saved[0] : pair.panel.style.getPropertyValue('display');
            pair.originalPriority = previous ? previous.originalPriority : saved ? saved[1] : pair.panel.style.getPropertyPriority('display');
            pair.panel.setAttribute(BASELINE_ATTR, JSON.stringify([pair.originalDisplay, pair.originalPriority]));
            pair.source.setAttribute(RADIO_BRANCH_CONTROL_ATTR, 'entry');
            pair.target.setAttribute(RADIO_BRANCH_CONTROL_ATTR, 'panel');
        }
        applyRadioBranchState(root, entry.sources[0]);
    }
    root.setAttribute(RADIO_BRANCH_COUNT_ATTR, String(entries.length));
    return entries.length;
}
