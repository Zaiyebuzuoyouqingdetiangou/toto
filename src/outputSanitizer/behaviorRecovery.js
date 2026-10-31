import { rmR as __rmR } from "../textTable.js?rmv=2.2.0";
import { isBehaviorInteractionOwned } from './behaviorInteractions.js?rmv=2.2.0';
import { motionOutsideControls } from './behaviorDialect.js?rmv=2.2.0';
import { behaviorTypeFits } from './behaviorRepair.js?rmv=2.2.0';
const GROUP = '[data-rm-ui]';
const RECOVERED = 'data-rm-behavior-recovered';
const UI = '[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-diagnostic-panel]';
const own = (group, selector) => [...group.querySelectorAll(selector)].filter(node => node.closest(GROUP) === group);
const groups = root => [...(root.matches?.(GROUP) ? [root] : []), ...root.querySelectorAll(GROUP)]
    .filter(node => !node.closest(UI) && node.getAttribute('data-rm-ui') !== 'scroll');
function inlineValue(node, property) {
    const value = node.style?.getPropertyValue?.(property);
    if (value)
        return value.trim().toLowerCase();
    return String(node.getAttribute?.('style') || '').match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'i'))?.[1]?.trim().toLowerCase() || '';
}
function computedFullCover(node) {
    if (typeof getComputedStyle !== 'function' || !node?.isConnected)
        return null;
    try {
        const css = getComputedStyle(node);
        if (css.position !== 'absolute')
            return null;
        const zero = value => /^0(?:\.0+)?px$/.test(String(value || ''));
        const full = ['top', 'right', 'bottom', 'left'].every(side => zero(css[side]));
        return { full, clip: /clip-path|all/.test(String(css.transitionProperty || '')), passive: css.pointerEvents === 'none' };
    }
    catch {
        return null;
    }
}
function looksLikeCover(node) {
    if (!node?.parentElement || node.matches('input,button,label,summary,img,svg,script,style'))
        return false;
    const identity = `${node.getAttribute('id') || ''} ${node.getAttribute('class') || ''}`;
    if (!__rmR("F0mynDMVaFzNm0DYxKVnwK38_.F_M7kDygWWKLNNor8WxuinxeBlVzOZ4m.nD3.oRjaIdFuMoiY", "i").test(identity) || node.parentElement.children.length <= 1)
        return false;
    const absolute = inlineValue(node, 'position') === 'absolute';
    const full = inlineValue(node, 'width') === '100%' && inlineValue(node, 'height') === '100%';
    const clip = /clip-path/.test(inlineValue(node, 'transition'));
    if (absolute && full && (clip || inlineValue(node, 'pointer-events') === 'none'))
        return true;
    const computed = computedFullCover(node);
    return Boolean(computed?.full && (computed.clip || computed.passive));
}
function markProgressVariables(group, target) {
    for (let node = target.parentElement; node && node !== group.parentElement; node = node.parentElement) {
        const declared = String(node.getAttribute?.('style') || '').match(/(?:^|;)\s*(--[\w-]+)\s*:\s*-?[\d.]+%\s*(?:;|$)/);
        if (!declared)
            continue;
        node.setAttribute('data-rm-range-var', declared[1]);
        const name = declared[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const scope = group.closest?.('details') || group;
        const css = [...scope.querySelectorAll('style')].map(sheet => sheet.textContent || '').join('\n');
        if (new RegExp(`to bottom[^;{}]*var\\(\\s*${name}\\s*\\)`).test(css))
            group.setAttribute('data-rm-reveal-dir', 'down');
        return;
    }
}
function authoredHandler(input) {
    return input.hasAttribute('oninput') || input.hasAttribute('onchange')
        || [...(input.attributes || [])].some(attr => /^data-rabbit-mirror-.*(?:rescue|program)/.test(attr.name));
}
function explicitCover(root, input) {
    const reference = ['aria-controls', 'data-target', 'data-rm-target'].find(name => input.hasAttribute(name));
    if (!reference)
        return { declared: false, target: null };
    const id = String(input.getAttribute(reference) || '').trim().replace(/^#/, '');
    if (!/^[\w:-]+$/.test(id))
        return { declared: true, target: null };
    const matches = [...root.querySelectorAll('[id]')].filter(node => node.id === id);
    return { declared: true, target: matches.length === 1 && looksLikeCover(matches[0]) ? matches[0] : null };
}
export function findBehaviorRecoveryCandidates(root) {
    if (!root?.querySelectorAll)
        return [];
    const candidates = [];
    for (const input of root.querySelectorAll('input[type="range"]')) {
        if (input.disabled || input.closest(GROUP) || input.closest(UI) || authoredHandler(input))
            continue;
        const explicit = explicitCover(root, input);
        if (explicit.declared && !explicit.target)
            continue;
        let group = input.parentElement;
        for (let depth = 0; group && group !== root && depth < 4; depth++, group = group.parentElement) {
            if (group.matches('details,body,html') || group.closest(GROUP))
                break;
            if (group.querySelectorAll('input[type="range"]').length !== 1)
                break;
            const covers = explicit.declared
                ? (group.contains(explicit.target) ? [explicit.target] : [])
                : [...group.querySelectorAll('[id], [class]')].filter(looksLikeCover);
            if (covers.length > 1)
                break;
            if (covers.length !== 1)
                continue;
            const target = covers[0];
            if (target.closest(GROUP) || target.contains(input) || (!explicit.declared && target.parentElement.contains(input)))
                break;
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
        markProgressVariables(group, target);
        count++;
    }
    return count;
}
export function inspectBehaviorRecovery(root) {
    const result = { declared: 0, wired: 0, recovered: 0, classRepaired: 0, candidates: 0, incomplete: 0, unwired: 0, unmappedRanges: 0, types: [] };
    if (!root?.querySelectorAll)
        return result;
    const requirements = {
        effect: ['[data-rm-part], [data-rm-show]', 'button[data-rm-fire]'], drag: ['[data-rm-item]'],
        adjust: ['input[type="range"]'], reveal: ['[data-rm-cover]'], view: ['[data-rm-part]', 'input[type="range"]'],
        input: ['input:not([type]), input[type="text"], input[type="password"], textarea', 'output'],
        draw: ['svg[data-rm-canvas]'], motion: ['[data-rm-part]', 'button[data-rm-play], button[data-rm-reverse], input[type="range"]'],
        hold: ['[data-rm-hold]'], follow: ['[data-rm-surface]'], reorder: ['[data-rm-item]'], accumulate: ['[data-rm-step]'],
        toggle: [], pick: ['[data-rm-pick]'], pager: ['[data-rm-page]'], roll: ['[data-rm-roll]', '[data-rm-show]'],
        connect: ['[data-rm-end]'], turn: ['[data-rm-knob]'], sequence: ['[data-rm-code]'],
        slide: ['[data-rm-item]'], timer: [], swipe: ['[data-rm-card]'], rhythm: ['[data-rm-tap], [data-rm-charge], [data-rm-qte]'],
        peek: ['[data-rm-peek]'], spoiler: ['[data-rm-spoiler]'], sense: [],
    };
    const adoptedRanges = new Set();
    for (const group of groups(root)) {
        const type = group.getAttribute('data-rm-ui');
        const adopted = type === 'motion' ? motionOutsideControls(group) : null;
        adopted?.ranges.forEach(range => adoptedRanges.add(range));
        const hasOwn = selector => own(group, selector).length
            || (adopted && selector.includes('data-rm-play') && (adopted.buttons.length || adopted.ranges.length));
        result.declared++;
        if (!result.types.includes(type))
            result.types.push(type);
        if (group.hasAttribute(RECOVERED))
            result.recovered++;
        if (['type', 'scope', 'orphan'].includes(group.getAttribute(RECOVERED)))
            result.classRepaired++;
        if (isBehaviorInteractionOwned(group))
            result.wired++;
        else
            result.unwired++;
        if (!requirements[type] || requirements[type].some(selector => !hasOwn(selector))
            || (type === 'reorder' && own(group, '[data-rm-item]').length < 2)
            || (['pager', 'connect'].includes(type) && !behaviorTypeFits(group, type)))
            result.incomplete++;
    }
    result.candidates = findBehaviorRecoveryCandidates(root).length;
    result.unmappedRanges = [...root.querySelectorAll('input[type="range"]')].filter(input => !input.closest(GROUP) && !input.closest(UI) && !adoptedRanges.has(input) && !authoredHandler(input)).length;
    return result;
}
