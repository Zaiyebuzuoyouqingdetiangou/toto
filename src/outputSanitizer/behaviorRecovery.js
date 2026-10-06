// Recover only a source-authored, unambiguous local control/cover relationship.
// Never invent a target, result text, generated script or page-global listener.
import { isBehaviorInteractionOwned } from './behaviorInteractions.js?rmv=1.62.103';

const GROUP = '[data-rm-ui]';
const RECOVERED = 'data-rm-behavior-recovered';
const UI = '[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-diagnostic-panel]';
const own = (group, selector) => [...group.querySelectorAll(selector)].filter(node => node.closest(GROUP) === group);
const groups = root => [...(root.matches?.(GROUP) ? [root] : []), ...root.querySelectorAll(GROUP)]
    .filter(node => !node.closest(UI) && node.getAttribute('data-rm-ui') !== 'scroll');

function inlineValue(node, property) {
    const value = node.style?.getPropertyValue?.(property);
    if (value) return value.trim().toLowerCase();
    return String(node.getAttribute?.('style') || '').match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'i'))?.[1]?.trim().toLowerCase() || '';
}

function looksLikeCover(node) {
    if (!node?.parentElement || node.matches('input,button,label,summary,img,svg,script,style')) return false;
    const identity = `${node.getAttribute('id') || ''} ${node.getAttribute('class') || ''}`;
    const absolute = inlineValue(node, 'position') === 'absolute';
    const full = inlineValue(node, 'width') === '100%' && inlineValue(node, 'height') === '100%';
    const clip = /clip-path/.test(inlineValue(node, 'transition'));
    return /(?:mask|cover|curtain|遮罩|封纸)/i.test(identity) && absolute && full
        && (clip || inlineValue(node, 'pointer-events') === 'none')
        && node.parentElement.children.length > 1;
}

function authoredHandler(input) {
    return input.hasAttribute('oninput') || input.hasAttribute('onchange')
        || [...(input.attributes || [])].some(attr => /^data-rabbit-mirror-.*(?:rescue|program)/.test(attr.name));
}

function explicitCover(root, input) {
    const reference = ['aria-controls', 'data-target', 'data-rm-target'].find(name => input.hasAttribute(name));
    if (!reference) return { declared: false, target: null };
    const id = String(input.getAttribute(reference) || '').trim().replace(/^#/, '');
    if (!/^[\w:-]+$/.test(id)) return { declared: true, target: null };
    const matches = [...root.querySelectorAll('[id]')].filter(node => node.id === id);
    return { declared: true, target: matches.length === 1 && looksLikeCover(matches[0]) ? matches[0] : null };
}

export function findBehaviorRecoveryCandidates(root) {
    if (!root?.querySelectorAll) return [];
    const candidates = [];
    for (const input of root.querySelectorAll('input[type="range"]')) {
        if (input.disabled || input.closest(GROUP) || input.closest(UI) || authoredHandler(input)) continue;
        const explicit = explicitCover(root, input);
        if (explicit.declared && !explicit.target) continue;
        let group = input.parentElement;
        // Stay inside the nearest local card. Never assign the outer mirror or a
        // far-away mask merely because the rest of the page contains no others.
        for (let depth = 0; group && group !== root && depth < 4; depth++, group = group.parentElement) {
            if (group.matches('details,body,html') || group.closest(GROUP)) break;
            if (group.querySelectorAll('input[type="range"]').length !== 1) break;
            const covers = explicit.declared
                ? (group.contains(explicit.target) ? [explicit.target] : [])
                : [...group.querySelectorAll('[id], [class]')].filter(looksLikeCover);
            if (covers.length > 1) break;
            if (covers.length !== 1) continue;
            const target = covers[0];
            if (target.closest(GROUP) || target.contains(input) || (!explicit.declared && target.parentElement.contains(input))) break;
            candidates.push({ group, input, target });
            break;
        }
    }
    return candidates;
}

export function recoverBehaviorInteractions(root) {
    let count = 0;
    for (const { group, target } of findBehaviorRecoveryCandidates(root)) {
        group.setAttribute('data-rm-ui', 'reveal');
        group.setAttribute(RECOVERED, 'range-cover');
        target.setAttribute('data-rm-cover', '');
        count++;
    }
    return count;
}

// These are structural/listener facts, not a claim that the drawing, outcome or
// native browser rendering has been observed. WeakMap ownership ignores stale
// serialized markers and makes detached clones report unwired until activated.
export function inspectBehaviorRecovery(root) {
    const result = { declared: 0, wired: 0, recovered: 0, candidates: 0, incomplete: 0, unwired: 0, unmappedRanges: 0, types: [] };
    if (!root?.querySelectorAll) return result;
    const requirements = {
        effect: ['[data-rm-part]', 'button[data-rm-fire]'], drag: ['[data-rm-item]'],
        adjust: ['input[type="range"]'], reveal: ['[data-rm-cover]'], view: ['[data-rm-part]', 'input[type="range"]'],
        input: ['input:not([type]), input[type="text"], input[type="password"], textarea', 'output'],
        draw: ['svg[data-rm-canvas]'], motion: ['[data-rm-part]', 'button[data-rm-play], button[data-rm-reverse], input[type="range"]'],
        hold: ['button[data-rm-hold]'], follow: ['[data-rm-surface]'], reorder: ['[data-rm-item]'], accumulate: ['button[data-rm-step]'],
    };
    for (const group of groups(root)) {
        const type = group.getAttribute('data-rm-ui');
        result.declared++;
        if (!result.types.includes(type)) result.types.push(type);
        if (group.hasAttribute(RECOVERED)) result.recovered++;
        if (isBehaviorInteractionOwned(group)) result.wired++;
        else result.unwired++;
        if (!requirements[type] || requirements[type].some(selector => !own(group, selector).length)
            || (type === 'reorder' && own(group, '[data-rm-item]').length < 2)) result.incomplete++;
    }
    result.candidates = findBehaviorRecoveryCandidates(root).length;
    result.unmappedRanges = [...root.querySelectorAll('input[type="range"]')].filter(input =>
        !input.closest(GROUP) && !input.closest(UI) && !authoredHandler(input)).length;
    return result;
}
