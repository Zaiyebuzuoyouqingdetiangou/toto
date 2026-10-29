import { rmR as __rmR } from "../textTable.js?rmv=1.99.15";
import { behaviorShowTokens, clearForcedActive, ownBehaviorShows, setBehaviorNodeVisible, updateBehaviorResults, updateBehaviorShows } from './behaviorResults.js?rmv=1.99.15';
import { hasMobileInteractionControl, usesMobileInteractionButtons } from './mobileInteractionControls.js?rmv=1.99.15';
import { installSiblingStateBridge } from './behaviorSiblingBridge.js?rmv=1.99.15';
import { TYPE_CONTROLS, behaviorOwnerGroup, ownBehaviorNodes } from './behaviorOwner.js?rmv=1.99.15';
import { behaviorTypeFits, repairBehaviorDeclarations } from './behaviorRepair.js?rmv=1.99.15';
import { behaviorCssMentions, behaviorStyleText, hasBehaviorStateClasses, isBehaviorStateClass, mirrorBehaviorState, holdAncestorStateClass, holdAncestorActiveHolders } from './behaviorStateMirror.js?rmv=1.99.15';
import { syncStateCarriers, releaseStateCarriers, unwindStaleBridges } from './behaviorStateBridge.js?rmv=1.99.15';
import { findUnwrittenWordStates, wordStateHost, setWordState } from './wordStateAttr.js?rmv=1.99.15';
import { applyRememberedBehaviorRelay, applyRememberedReversePatches } from './behaviorRelayMemory.js?rmv=1.99.15';
import { STEP_RANGE_TYPES, STEP_RANGE_PREFIXES, addDialectStateKeys, syncAuthorStatusAttrs, authorManagedShows, motionEqualizerAnimations, behaviorToggleKey, motionOutsideControls, remoteMotionGroup, remoteToggleGroup, remotePagerGroup, pagerOutsideControls, toggleCssBridges, setBridgedCssWord } from './behaviorDialect.js?rmv=1.99.15';
import { EXTRA_TYPES, EXTRA_CONTROLS, EXTRA_CONTROL_ATTRS, configureBehaviorExtras, configureCarryChatKey, extraTypeFits, prepareExtra, destroyExtra, extraAction, extraSync, extraKeys, extraReset, extraPointerDown, extraPointerMove, extraPointerUp, extraHoldStart, extraHoldEnd, applyCarriedState, saveCarriedState, recalledKeys, carryMemoryName } from './behaviorExtras.js?rmv=1.99.15';
export { behaviorToggleKey, motionOutsideControls };
const roots = new WeakMap();
const owners = new WeakMap();
const GROUP = '[data-rm-ui]';
const TYPES = new Set(['effect', 'drag', 'adjust', 'reveal', 'view', 'input', 'draw', 'motion', 'hold', 'follow', 'reorder', 'accumulate',
    'toggle', 'pick', 'pager', 'roll', 'connect', 'turn', 'sequence', ...EXTRA_TYPES]);
const EXTRA = new Set(EXTRA_TYPES);
const STATEFUL = new Set(['toggle', 'pick', 'pager', 'roll', 'connect', 'turn', 'sequence']);
const CONTROL_ATTRS = ['reset', 'fire', 'play', 'reverse', 'seek', 'prev', 'next', 'step', 'place', 'return', 'move', 'toggle', 'pick', 'goto', 'roll', 'end', 'code', 'knob', ...EXTRA_CONTROL_ATTRS];
const CONTROL_SELECTOR = CONTROL_ATTRS.map(name => `[data-rm-${name}]`).join(', ');
const RESERVED_KEYS = new Set(['changed', 'active', 'match', 'done', 'miss', 'on']);
const SVG_NS = 'http://www.w3.org/2000/svg';
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ownerGroup = behaviorOwnerGroup;
const own = ownBehaviorNodes;
const first = (group, selector) => own(group, selector)[0];
const isButton = node => node?.matches?.('button, input[type="button"]') && !node.disabled;
const isNative = node => Boolean(node?.matches?.('button, input, textarea, select, a[href], summary, label'));
const isControl = node => Boolean(node?.matches) && !node.disabled && node.getAttribute('aria-disabled') !== 'true'
    && !node.matches('input:not([type="button"]), textarea, select');
const mod = (value, size) => ((value % size) + size) % size;
const words = value => String(value || '').split(__rmR("yomYAOXSe3NI061Ham4.HT", "")).map(word => word.trim()).filter(Boolean);
function refreshResults(state) {
    if (STATEFUL.has(state.type))
        syncState(state);
    if (EXTRA.has(state.type)) {
        try {
            extraSync(state);
        }
        catch (error) {
            console.debug('[RabbitMirror] extra behavior sync failed:', error);
        }
    }
    if (state.changed && carryMemoryName(state.group)) {
        try {
            saveCarriedState(state);
        }
        catch { }
    }
    const range = state.type === 'motion' ? motionRange(state) : first(state.group, 'input[type="range"]');
    updateBehaviorResults(state.group, {
        changed: Boolean(state.changed), p: range ? rangeValue(range).p : (state.progress || 0),
        active: state.group.getAttribute('data-rm-active') === 'true',
        match: state.group.getAttribute('data-rm-match') === 'true',
        count: own(state.group, '[data-rm-step]').filter(node => node.getAttribute('data-rm-done') === 'true').length,
        order: own(state.group, '[data-rm-item]').map(node => node.getAttribute('data-rm-item')),
        placed: [...state.placed].filter(node => state.group.contains(node)).map(node => node.getAttribute('data-rm-item')),
    });
    const showCount = ownBehaviorShows(state.group).length;
    if (!state.authorShows || state.authorShowCount !== showCount) {
        state.authorShowCount = showCount;
        try {
            state.authorShows = authorManagedShows(state.root, state.group);
        }
        catch {
            state.authorShows = new Set();
        }
    }
    try {
        adoptDoneResult(state);
    }
    catch {
        state.doneAdopted = [];
    }
    const currentKeys = stateKeys(state);
    updateBehaviorShows(state.group, currentKeys, (node, active) => mirrorBehaviorState(state.root, node, active), state.authorShows);
    try {
        syncAuthorStatusAttrs(state, currentKeys);
    }
    catch (error) {
        console.debug('[RabbitMirror] author status sync failed:', error);
    }
    const adopted = adoptHiddenResult(state);
    if (adopted?.isConnected) {
        const active = state.type === 'hold' ? state.group.getAttribute('data-rm-active') === 'true' : (state.on?.size || 0) > 0;
        setBehaviorNodeVisible(adopted, active);
    }
    try {
        syncStateCarriers(state.root, state.group);
    }
    catch (error) {
        console.debug('[RabbitMirror] state bridge sync failed:', error);
    }
    applyStateOverrides(state);
}
function stateKeys(state) {
    const { group } = state;
    const keys = new Set();
    if (state.changed)
        keys.add('changed');
    for (const name of ['active', 'match', 'done', 'miss'])
        if (group.getAttribute(`data-rm-${name}`) === 'true')
            keys.add(name);
    for (const key of state.on || []) {
        keys.add(key);
        if (key === 'on')
            keys.add('true');
    }
    for (const node of state.placed || []) {
        if (!group.contains(node))
            continue;
        keys.add('placed');
        const key = String(node.getAttribute('data-rm-item') || '').trim();
        if (key)
            keys.add(key);
    }
    if (state.picked)
        keys.add(state.picked);
    if (state.type === 'pager' && state.pages?.length) {
        keys.add(String(state.index));
        const name = String(state.pages[state.index - 1]?.getAttribute('data-rm-page') || '').trim();
        if (name)
            keys.add(name);
    }
    if (state.type === 'turn' && state.stops)
        keys.add(String(state.stopIndex));
    if (state.type === 'accumulate')
        for (const node of own(group, '[data-rm-step]')) {
            const key = String(node.getAttribute('data-rm-step') || '').trim();
            if (key && node.getAttribute('data-rm-done') === 'true')
                keys.add(key);
        }
    if (state.type === 'reveal' && (state.progress || 0) >= 0.9)
        for (const key of ['reveal', 'revealed', 'done', 'full', 'open'])
            keys.add(key);
    for (const key of state.entered || [])
        keys.add(key);
    for (const [, , key] of state.pairs || [])
        keys.add(key);
    if (state.type === 'input' && group.getAttribute('data-rm-match') === 'true') {
        const answer = String(group.getAttribute('data-rm-answer') || '').trim();
        if (answer) {
            keys.add(answer);
            for (const word of words(answer))
                keys.add(word);
        }
    }
    if (EXTRA.has(state.type))
        extraKeys(state, keys);
    stepRangeKeys(state, keys);
    if (group.hasAttribute('data-rm-recall'))
        recalledKeys(group, keys);
    return addDialectStateKeys(state, keys);
}
function stepRangeKeys(state, keys) {
    if (!STEP_RANGE_TYPES.has(state.type))
        return;
    const range = state.type === 'motion' ? motionRange(state) : first(state.group, 'input[type="range"]');
    if (!range || range.step === 'any')
        return;
    const min = range.min === '' ? 0 : Number(range.min);
    const max = range.max === '' ? 100 : Number(range.max);
    const step = range.step === '' ? 1 : Number(range.step);
    if (![min, max, step].every(Number.isFinite) || !Number.isInteger(min) || !Number.isInteger(step) || step <= 0 || max - min > 20 * step)
        return;
    const value = Math.round(clamp(Number(range.value), min, max));
    if (!Number.isFinite(value))
        return;
    for (const prefix of STEP_RANGE_PREFIXES)
        keys.add(`${prefix}${value}`);
}
function rangeValue(input) {
    const min = input.min === '' ? 0 : finite(input.min);
    const max = Math.max(min, input.max === '' ? 100 : finite(input.max, 100));
    const value = clamp(finite(input.value, min), min, max);
    return { value, p: max > min ? (value - min) / (max - min) : 0 };
}
function saveStyle(state, node, property) {
    if (!state.styles.has(node))
        state.styles.set(node, new Map());
    const saved = state.styles.get(node);
    if (!saved.has(property))
        saved.set(property, [node.style.getPropertyValue(property), node.style.getPropertyPriority(property)]);
}
function style(state, node, property, value) {
    saveStyle(state, node, property);
    node.style.setProperty(property, value);
    if (node === state.group && property.startsWith('--rm-'))
        for (const user of varUsers(state, property)) {
            saveStyle(state, user, property);
            user.style.setProperty(property, value);
        }
}
function cssIndexBase(state, total) {
    const seen = new Set();
    for (const rule of localRules(state.root))
        for (const raw of rule.selectorText.split(',')) {
            const piece = raw.replace(/^\s*\[data-rabbit-mirror-css-scope=[^\]]*\]\s*/, '');
            const match = piece.match(/\[\s*data-rm-index\s*=\s*["']?(\d+)["']?\s*\]\s*([~+>]?)\s*([^]*)$/);
            if (!match)
                continue;
            const target = match[3].trim();
            const head = piece.slice(0, match.index);
            const compound = (head.match(/[^\s>+~]*$/)?.[0] || '').trim();
            if (!target)
                continue;
            try {
                if (compound && !state.group.matches(compound) && !state.group.parentElement?.closest(compound))
                    continue;
                if (!own(state.group, target).length)
                    continue;
            }
            catch {
                continue;
            }
            seen.add(Number(match[1]));
        }
    return seen.has(0) && !seen.has(total) ? 0 : 1;
}
function localRules(root) {
    const scope = root?.closest?.('toto') || root;
    const rules = [];
    const walk = list => {
        for (const rule of list || []) {
            if (typeof rule.selectorText === 'string' && rule.style)
                rules.push(rule);
            else if (rule.cssRules)
                walk(rule.cssRules);
        }
    };
    for (const node of scope?.querySelectorAll?.('style') || []) {
        try {
            walk(node.sheet?.cssRules);
        }
        catch { }
    }
    return rules;
}
const MAX_VAR_USERS = 40;
const VAR_WRITERS = Object.freeze({
    '--rm-p': ['reveal', 'adjust', 'turn'], '--rm-value': ['adjust'], '--rm-count': ['accumulate', 'connect', 'sequence'],
    '--rm-index': ['pager'], '--rm-pages': ['pager'], '--rm-angle': ['turn'], '--rm-x': ['follow'], '--rm-y': ['follow'],
});
const PSEUDO_STRIP = /::?[\w-]+(?:\([^()]*\))?/g;
function varUsers(state, property) {
    state.varUsers ||= new Map();
    if (state.varUsers.has(property))
        return state.varUsers.get(property);
    const list = [];
    state.varUsers.set(property, list);
    const { group } = state;
    const scope = group.closest('details') || state.root;
    if (!scope?.querySelectorAll)
        return list;
    const needle = new RegExp(`var\\(\\s*${property.replace(/-/g, '\\-')}\\s*[,)]`);
    const accept = node => {
        if (!node?.style || list.length >= MAX_VAR_USERS || list.includes(node))
            return;
        if (node === group || group.contains(node) || (node !== scope && !scope.contains(node)))
            return;
        if (node.closest(GROUP))
            return;
        const others = [...node.querySelectorAll(GROUP)].filter(other => other !== group && !group.contains(other));
        if (others.some(other => (VAR_WRITERS[property] || []).includes(other.getAttribute('data-rm-ui')) || ruleUsesVarInside(other)))
            return;
        list.push(node);
    };
    const usingRules = localRules(state.root).filter(rule => needle.test(rule.style.cssText));
    const ruleUsesVarInside = other => usingRules.some(rule => {
        const selector = rule.selectorText.replace(PSEUDO_STRIP, '').trim();
        if (!selector)
            return false;
        try {
            return other.matches(selector) || !!other.querySelector(selector);
        }
        catch {
            return false;
        }
    }) || [other, ...other.querySelectorAll('[style*="--rm-"]')].some(item => needle.test(item.getAttribute?.('style') || ''));
    for (const node of [scope, ...scope.querySelectorAll('[style*="--rm-"]')])
        if (needle.test(node.getAttribute?.('style') || ''))
            accept(node);
    for (const rule of localRules(state.root)) {
        if (!needle.test(rule.style.cssText))
            continue;
        const selector = rule.selectorText.replace(PSEUDO_STRIP, '').trim();
        if (!selector)
            continue;
        try {
            if (scope.matches(selector))
                accept(scope);
        }
        catch {
            continue;
        }
        try {
            for (const node of scope.querySelectorAll(selector))
                accept(node);
        }
        catch { }
    }
    return list;
}
const STATE_ATTR_NEEDLE = /\[\s*(?:data-rm-(?:on|active|picked|index|match|miss|done|seq|current|paired|armed|placed|angle-turned)|aria-pressed)\b/;
const STATE_ATTR_STRIP = /\[\s*(?:data-rm-(?:on|active|picked|index|match|miss|done|seq|current|paired|armed|placed|angle-turned)|aria-pressed)\b[^\]]*\]/g;
const OVERRIDE_SKIP_PROPERTY = /^(?:--rm-|touch-action$|cursor$|outline)/;
function stateRules(state) {
    if (state.stateRules)
        return state.stateRules;
    const { group } = state;
    const scope = group.closest('details') || state.root;
    const lone = scope?.querySelectorAll ? scope.querySelectorAll(GROUP).length <= 1 : true;
    const found = [];
    for (const rule of localRules(state.root)) {
        const text = rule.selectorText;
        const withoutStateNot = String(text || '').replace(/:not\(\s*(\[[^\]]*\])\s*\)/g, (match, attr) => STATE_ATTR_NEEDLE.test(attr) ? attr : match);
        if (!text || withoutStateNot.includes('(') || text.includes('::'))
            continue;
        let mine = false;
        for (const selector of withoutStateNot.split(','))
            for (const compound of compoundsOf(selector.trim())) {
                const hasAttr = STATE_ATTR_NEEDLE.test(compound);
                const classes = [...compound.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(match => match[1]).filter(isBehaviorStateClass);
                if (!hasAttr && !classes.length)
                    continue;
                let base = compound.replace(STATE_ATTR_STRIP, '');
                for (const name of classes)
                    base = base.replace(new RegExp(`\\.${name}(?![\\w-])`), '');
                base = base.trim();
                if (!base) {
                    if (hasAttr && lone)
                        mine = true;
                    continue;
                }
                try {
                    if (group.matches(base) || own(group, base).length)
                        mine = true;
                }
                catch { }
            }
        if (mine)
            found.push(rule);
    }
    state.stateRules = found;
    return found;
}
function applyStateOverrides(state) {
    const rules = stateRules(state);
    if (!rules.length)
        return;
    const scope = state.group.closest('details') || state.root;
    const matched = rule => { try {
        return [...scope.querySelectorAll(rule.selectorText)];
    }
    catch {
        return [];
    } };
    if (!state.ruleBaseline) {
        state.ruleBaseline = new Map(rules.map(rule => [rule, new Set(matched(rule))]));
        outsideStateLinks(state);
        state.ruleCopies = new Map();
        if (state.type === 'toggle') {
            const before = state.group.getAttribute('data-rm-on');
            if (before && before.trim())
                state.group.removeAttribute('data-rm-on');
            else
                state.group.setAttribute('data-rm-on', 'on');
            try {
                for (const rule of rules)
                    state.ruleCopies.set(rule, new Set(matched(rule)));
            }
            finally {
                if (before === null)
                    state.group.removeAttribute('data-rm-on');
                else
                    state.group.setAttribute('data-rm-on', before);
            }
        }
    }
    const wanted = new Map();
    const want = (node, property, value, priority = '') => {
        if (!wanted.has(node))
            wanted.set(node, new Map());
        wanted.get(node).set(property, [value, priority]);
    };
    for (const link of outsideStateLinks(state)) {
        let active = false;
        try {
            active = state.group.matches(link.chain);
        }
        catch {
            active = false;
        }
        if (!active || link.baseline)
            continue;
        for (const node of link.targets) {
            if (!node.isConnected || node.hasAttribute('data-rm-show') || node.hasAttribute('data-rm-result-active'))
                continue;
            for (let index = 0; index < link.rule.style.length; index += 1) {
                const property = link.rule.style[index];
                if (OVERRIDE_SKIP_PROPERTY.test(property))
                    continue;
                want(node, property, link.rule.style.getPropertyValue(property), link.rule.style.getPropertyPriority(property));
            }
        }
    }
    for (const rule of rules) {
        const baseline = state.ruleBaseline.get(rule);
        const now = new Set(matched(rule));
        const copies = state.ruleCopies?.get(rule);
        for (const node of new Set([...(baseline || []), ...(copies || [])])) {
            if (now.has(node) || !node.isConnected || !node.style || node.hasAttribute('data-rm-show') || node.hasAttribute('data-rm-result-active'))
                continue;
            for (let index = 0; index < rule.style.length; index += 1) {
                const property = rule.style[index];
                if (OVERRIDE_SKIP_PROPERTY.test(property) || rule.style.getPropertyPriority(property) === 'important')
                    continue;
                const saved = state.styles.get(node)?.get(property);
                const inline = saved ? saved[0] : node.style.getPropertyValue(property);
                const priority = saved ? saved[1] : node.style.getPropertyPriority(property);
                if (!inline || priority === 'important')
                    continue;
                if (inline.trim().toLowerCase() === String(rule.style.getPropertyValue(property)).trim().toLowerCase())
                    want(node, property, '');
            }
        }
        for (const node of now) {
            if (baseline?.has(node) || !node.style || node.hasAttribute('data-rm-show') || node.hasAttribute('data-rm-result-active'))
                continue;
            for (let index = 0; index < rule.style.length; index += 1) {
                const property = rule.style[index];
                if (OVERRIDE_SKIP_PROPERTY.test(property) || rule.style.getPropertyPriority(property) === 'important')
                    continue;
                const saved = state.styles.get(node)?.get(property);
                const inline = saved ? saved[0] : node.style.getPropertyValue(property);
                const priority = saved ? saved[1] : node.style.getPropertyPriority(property);
                if (!inline || priority === 'important')
                    continue;
                want(node, property, rule.style.getPropertyValue(property));
            }
        }
    }
    state.overrides ||= new Map();
    for (const [node, properties] of state.overrides)
        for (const property of [...properties]) {
            if (wanted.get(node)?.has(property))
                continue;
            unstyle(state, node, [property]);
            properties.delete(property);
        }
    for (const [node, properties] of wanted) {
        if (!state.overrides.has(node))
            state.overrides.set(node, new Set());
        for (const [property, [value, priority]] of properties) {
            if (value === '') {
                if (node.style.getPropertyValue(property)) {
                    saveStyle(state, node, property);
                    node.style.removeProperty(property);
                }
            }
            else if (node.style.getPropertyValue(property) !== value || node.style.getPropertyPriority(property) !== priority) {
                saveStyle(state, node, property);
                node.style.setProperty(property, value, priority);
            }
            state.overrides.get(node).add(property);
        }
    }
}
function outsideStateLinks(state) {
    if (state.outsideLinks)
        return state.outsideLinks;
    const links = [];
    state.outsideLinks = links;
    const { group } = state;
    const scope = group.closest('details') || state.root;
    if (!scope?.querySelectorAll)
        return links;
    for (const rule of stateRules(state)) {
        for (const part of rule.selectorText.split(',')) {
            const selector = part.trim();
            if (/[>+~]/.test(selector.replace(/\[[^\]]*\]/g, '')))
                continue;
            const compounds = compoundsOf(selector);
            for (let index = 0; index < compounds.length - 1; index += 1) {
                if (!STATE_ATTR_NEEDLE.test(compounds[index]))
                    continue;
                const chain = compounds.slice(0, index + 1).join(' ');
                const tail = compounds.slice(index + 1).join(' ');
                if (!/[.#][A-Za-z_]/.test(tail))
                    continue;
                let baseChain = compounds.slice(0, index).concat(compounds[index].replace(STATE_ATTR_STRIP, '') || '*').join(' ');
                try {
                    if (!group.matches(baseChain))
                        continue;
                }
                catch {
                    continue;
                }
                let targets = [];
                try {
                    targets = [...scope.querySelectorAll(tail)];
                }
                catch {
                    continue;
                }
                if (!targets.length || targets.length > 12 || targets.some(node => group.contains(node)))
                    continue;
                if (targets.some(node => node.closest(GROUP)))
                    continue;
                let baseline = false;
                try {
                    baseline = group.matches(chain);
                }
                catch {
                    baseline = false;
                }
                links.push({ rule, chain, targets, baseline });
                break;
            }
        }
    }
    return links;
}
const VERIFY_DELAY_MS = 260;
const VERIFY_MAX_NODES = 600;
const VERIFY_SKIP = '[data-rabbit-mirror-tool-entry-host],[data-rabbit-mirror-diagnostic-panel],.rabbit-mirror-maintenance-menu,[data-rm-face-swipe-host],[data-rm-image-region],[data-rm-mobile-controls],[data-rabbit-mirror-maintenance-rabbit],[data-rabbit-mirror-feedback-cat],svg[data-rm-lines]';
function pluginFingerprint(group) {
    const parts = [];
    let count = 0;
    for (const node of [group, ...group.querySelectorAll('*')]) {
        if (count++ > VERIFY_MAX_NODES)
            break;
        for (const attr of node.attributes || [])
            parts.push(attr.name, attr.value);
        parts.push('|');
    }
    return parts.join('\u0001');
}
function visibleState(scope, skip) {
    const view = scope?.ownerDocument?.defaultView;
    if (!view?.getComputedStyle || !scope.isConnected)
        return null;
    const origin = scope.getBoundingClientRect();
    const map = new Map();
    let count = 0;
    for (const node of [scope, ...scope.querySelectorAll('*')]) {
        if (count++ > VERIFY_MAX_NODES)
            break;
        if (node === skip || node.closest(VERIFY_SKIP) || node.hasAttribute(FEEDBACK_ATTR))
            continue;
        let css;
        try {
            css = view.getComputedStyle(node);
        }
        catch {
            continue;
        }
        const rect = node.getBoundingClientRect();
        const moving = css.animationName && css.animationName !== 'none';
        map.set(node, [css.display, css.visibility, moving ? '' : Number(css.opacity).toFixed(2), moving ? '' : `${css.transform}${css.rotate}${css.scale}${css.translate}`,
            css.clipPath, css.filter, css.backgroundColor, String(css.backgroundImage || '').slice(0, 240), css.color, css.fill, css.stroke, css.animationName,
            moving ? '' : `${Math.round(rect.width)},${Math.round(rect.height)},${Math.round(rect.left - origin.left)},${Math.round(rect.top - origin.top)}`,
            node.childElementCount ? '' : String(node.textContent || '').slice(0, 80)].join('\u0001'));
    }
    return map;
}
function sameLook(before, after) {
    if (before.size !== after.size)
        return false;
    for (const [node, value] of after)
        if (before.get(node) !== value)
            return false;
    return true;
}
function beginVerify(state, control, replay = false) {
    if (state.verified || state.verifying || !state.root?.isConnected)
        return null;
    if (control?.hasAttribute?.('data-rm-reset') || control?.getAttribute?.('aria-disabled') === 'true')
        return null;
    const scope = state.group.closest('details') || state.root;
    let before = null, plugin = '';
    try {
        before = visibleState(scope, control);
        plugin = pluginFingerprint(state.group);
    }
    catch {
        return null;
    }
    if (!before)
        return null;
    state.verifying = true;
    return () => setTimeout(() => {
        state.verifying = false;
        const { group, root } = state;
        if (!group.isConnected || !group.matches(GROUP))
            return;
        if (state.type === 'hold' && group.getAttribute('data-rm-active') !== 'true')
            return;
        if (pluginFingerprint(group) === plugin)
            return;
        let after = null;
        try {
            after = visibleState(scope, control);
        }
        catch {
            return;
        }
        if (!after)
            return;
        state.verified = true;
        if (sameLook(before, after))
            relayGroupLater(root, group, replay ? control : null);
    }, VERIFY_DELAY_MS);
}
const isTransition = animation => typeof animation?.transitionProperty === 'string'
    || (typeof CSSTransition !== 'undefined' && animation instanceof CSSTransition);
function animations(state) {
    if (state.type === 'motion' && !state.equalizerChecked) {
        state.equalizerChecked = true;
        if (!motionTargets(state).length) {
            try {
                motionEqualizerAnimations(state.group, own(state.group, '[data-rm-part]'));
            }
            catch { }
        }
    }
    const found = own(state.group, '[data-rm-part]').flatMap(part => part.getAnimations?.({ subtree: true }) || []);
    for (const animation of found) {
        if (isTransition(animation) || animation?.id === 'rm-motion')
            continue;
        const target = animation.effect?.target;
        if (target?.closest?.(GROUP) === state.group)
            state.animations.add(animation);
    }
    return [...state.animations].filter(animation => state.group.contains(animation.effect?.target));
}
function reveal(state, p) {
    const value = clamp(p, 0, 1);
    state.progress = value;
    style(state, state.group, '--rm-p', String(value));
    const down = state.group.getAttribute('data-rm-reveal-dir') === 'down';
    for (const cover of own(state.group, '[data-rm-cover]')) {
        if (cover.matches('input, button, label') || cover.querySelector('input[type="range"]')) {
            if (/^inset\(/.test(cover.style.getPropertyValue('clip-path')))
                cover.style.removeProperty('clip-path');
            continue;
        }
        style(state, cover, 'clip-path', down ? `inset(${value * 100}% 0 0 0)` : `inset(0 0 0 ${value * 100}%)`);
    }
    for (const node of own(state.group, '[data-rm-range-var]')) {
        const name = String(node.getAttribute('data-rm-range-var') || '');
        if (/^--[\w-]+$/.test(name))
            style(state, node, name, `${Math.round(value * 100)}%`);
    }
    const range = first(state.group, 'input[type="range"]');
    if (range) {
        const min = range.min === '' ? 0 : finite(range.min);
        const max = range.max === '' ? 100 : finite(range.max, 100);
        range.value = String(min + value * Math.max(0, max - min));
    }
}
function fireParts(state) {
    const parts = own(state.group, '[data-rm-part]');
    const css = behaviorCssMentions(state.root, ['data-rm-active']);
    let changed = false;
    state.firedParts ||= new Set();
    for (const part of parts) {
        if (!part.style)
            continue;
        const hidden = part.style.getPropertyValue('display') === 'none' && !part.hasAttribute('data-rm-result-active') && String(part.textContent || '').trim();
        if (hidden || state.firedParts.has(part)) {
            if (hidden) {
                setBehaviorNodeVisible(part, true);
                state.firedParts.add(part);
                changed = true;
            }
        }
        if (css && (state.firedParts.has(part) || !part.getAnimations?.().length)) {
            part.removeAttribute('data-rm-active');
            void part.offsetWidth;
            part.setAttribute('data-rm-active', 'true');
            changed = true;
        }
    }
    return changed;
}
function prepareKeyedParts(state) {
    state.keyedParts = new Map();
    const keys = new Set(own(state.group, '[data-rm-fire]').map(node => String(node.getAttribute('data-rm-fire') || '').trim()).filter(Boolean));
    if (!keys.size)
        return;
    if (localRules(state.root).some(rule => /data-rm-part/.test(rule.selectorText) && /data-rm-active/.test(rule.selectorText)))
        return;
    for (const part of own(state.group, '[data-rm-part]')) {
        const key = String(part.getAttribute('data-rm-part') || '').trim();
        if (!keys.has(key) || !part.style || String(part.textContent || '').trim().length < 4)
            continue;
        if (part.getAnimations?.().length || (getComputedStyle(part).animationName || 'none') !== 'none')
            continue;
        if (!state.keyedParts.has(key))
            state.keyedParts.set(key, []);
        state.keyedParts.get(key).push(part);
    }
    state.firedParts ||= new Set();
    for (const parts of state.keyedParts.values())
        for (const part of parts)
            if (!state.firedParts.has(part))
                setBehaviorNodeVisible(part, false);
}
function prepareStageAttr(state) {
    state.stageAttr = null;
    const range = first(state.group, 'input[type="range"]');
    if (!range)
        return;
    const min = range.min === '' ? 0 : finite(range.min), max = range.max === '' ? 100 : finite(range.max, 100);
    const step = range.step === '' ? 1 : finite(range.step, 1);
    if (!(step > 0) || Math.abs(step - Math.round(step)) > 1e-9 || max - min > 40)
        return;
    const found = new Map();
    for (const rule of localRules(state.root))
        for (const piece of rule.selectorText.split(',')) {
            const match = piece.match(/\[(data-(?!rm-|rabbit-)[\w-]+)\s*=\s*["']?(-?\d+)["']?\s*\]\s+(.+)$/);
            if (!match)
                continue;
            const value = Number(match[2]);
            if (value < min || value > max)
                continue;
            if (!found.has(match[1]))
                found.set(match[1], { values: new Set(), targets: new Set() });
            found.get(match[1]).values.add(value);
            found.get(match[1]).targets.add(match[3].trim());
        }
    let best = null;
    for (const [name, info] of found)
        if (info.values.size >= 2 && (!best || info.values.size > best[1].values.size))
            best = [name, info];
    if (!best)
        return;
    const [name, info] = best;
    const targets = [];
    for (const selector of info.targets) {
        try {
            targets.push(...state.root.querySelectorAll(selector));
        }
        catch { }
    }
    if (!targets.length)
        return;
    let host = null;
    for (let node = state.group; node && node !== state.root.parentElement; node = node.parentElement) {
        if (targets.some(target => node.contains(target))) {
            host = node;
            break;
        }
    }
    if (!host)
        return;
    state.stageAttr = name;
    state.stageHost = host;
}
function prepareWordStage(state) {
    state.wordStage = null;
    if (!first(state.group, 'input[type="range"]'))
        return;
    for (const [name, info] of findUnwrittenWordStates(state.root)) {
        const host = wordStateHost(state.root, state.group, info.targets);
        if (!host)
            continue;
        state.wordStage = { name, values: info.values, host };
        return;
    }
}
function syncWordStage(state, p) {
    const stage = state.wordStage;
    if (!stage?.host?.isConnected || !Number.isFinite(p))
        return;
    const index = Math.min(stage.values.length - 1, Math.max(0, Math.floor(p * stage.values.length)));
    setWordState(stage.host, stage.name, stage.values[index]);
}
function syncStageAttr(state, value) {
    if (!state.stageAttr || !Number.isFinite(value))
        return;
    state.stageHost.setAttribute(state.stageAttr, String(Math.round(value)));
}
const NUMBER_DRIVER_ATTRS = { accumulate: 'data-rm-count', pager: 'data-rm-index', turn: 'data-rm-index' };
const NUMBER_SKIP = /^data-rm-(?:done|step|ui|on|active|value|picked|match|seq|miss|swiped|peeking|show|part|fire|reset|goto|stops|answer|code|end|pick|knob|angle-turned|current)$/;
function numberRange(state) {
    const { group, type } = state;
    if (type === 'accumulate')
        return { min: 0, max: own(group, '[data-rm-step]').length };
    if (type === 'pager')
        return { min: 1, max: state.pages?.length || 0 };
    if (type === 'sequence')
        return { min: 0, max: Math.max(state.answer?.length || 0, own(group, '[data-rm-code]').length) };
    if (type === 'connect')
        return { min: 0, max: Math.floor(own(group, '[data-rm-end]').length / 2) };
    if (type === 'turn')
        return state.stops ? { min: 0, max: state.stops - 1 } : null;
    if (type === 'adjust') {
        const range = first(group, 'input[type="range"]');
        if (!range)
            return null;
        const step = range.step === '' ? 1 : finite(range.step, 1);
        if (!(step > 0) || Math.abs(step - Math.round(step)) > 1e-9)
            return null;
        const min = range.min === '' ? 0 : finite(range.min), max = range.max === '' ? 100 : finite(range.max, 100);
        return max - min <= 40 ? { min, max } : null;
    }
    return null;
}
function numberTargets(state, selector) {
    try {
        return [...state.group.querySelectorAll(selector)];
    }
    catch {
        return [];
    }
}
function prepareNumberMirror(state) {
    state.numberMirror = [];
    const bounds = numberRange(state);
    if (!bounds || !(bounds.max > bounds.min))
        return;
    const driverAttr = NUMBER_DRIVER_ATTRS[state.type];
    const attrs = new Map(), classes = new Map();
    const note = (map, key, value, entry) => {
        if (!map.has(key))
            map.set(key, { values: new Set(), rules: [] });
        map.get(key).values.add(value);
        map.get(key).rules.push(entry);
    };
    for (const rule of localRules(state.root))
        for (const piece of rule.selectorText.split(',')) {
            const attr = piece.match(/\[(data-(?!rabbit-)[\w-]+)\s*=\s*["']?(-?\d+)["']?\s*\]\s*([~+>]?)\s*([^~+>\s][^]*)$/);
            if (attr && attr[1] !== state.stageAttr && !NUMBER_SKIP.test(attr[1])) {
                note(attrs, attr[1], Number(attr[2]), { combinator: attr[3] || ' ', target: attr[4].trim() });
            }
            const cls = piece.match(/^(.*?)((?:^|[\s>+~])[^\s>+~]*?)\.([A-Za-z][\w-]*?[-_])(\d+)(?![\w-])([^\s>+~]*)\s*([~+>]?)\s*([^~+>\s][^]*)$/);
            if (cls) {
                const compound = (cls[2].replace(/^[\s>+~]+/, '') + cls[5]).replace(/:[\w-]+(?:\([^()]*\))?/g, '');
                let fits = false;
                try {
                    fits = !compound || state.group.matches(compound);
                }
                catch {
                    fits = false;
                }
                if (fits && (cls[6] || ' ') === ' ')
                    note(classes, cls[3], Number(cls[4]), { combinator: ' ', target: cls[7].trim() });
            }
        }
    const inRange = info => [...info.values].every(value => value >= bounds.min && value <= bounds.max) && info.values.size >= 1;
    for (const [name, info] of attrs) {
        if (!inRange(info))
            continue;
        const hosts = new Set();
        for (const { combinator, target } of info.rules)
            for (const node of numberTargets(state, target)) {
                if (combinator === '~' || combinator === '+') {
                    for (let sib = node.previousElementSibling; sib; sib = combinator === '+' ? null : sib.previousElementSibling)
                        if (!sib.matches(GROUP) && !sib.querySelector(GROUP))
                            hosts.add(sib);
                }
                else if (name !== driverAttr)
                    hosts.add(combinator === '>' ? node.parentElement : state.group);
            }
        hosts.delete(null);
        if (name === driverAttr)
            hosts.delete(state.group);
        if (!hosts.size)
            continue;
        const others = [...state.root.querySelectorAll(`[${name}]`)].filter(node => !hosts.has(node) && node !== state.group);
        if (others.length)
            continue;
        state.numberMirror.push({ kind: 'attr', name, hosts: new Map([...hosts].map(node => [node, node.getAttribute(name)])) });
    }
    for (const [prefix, info] of classes) {
        if (!inRange(info) || !info.rules.some(rule => numberTargets(state, rule.target).length))
            continue;
        const used = [...state.root.querySelectorAll(`[class*="${CSS.escape(prefix)}"]`)].some(node => node !== state.group
            && [...node.classList].some(name => name.startsWith(prefix) && /^\d+$/.test(name.slice(prefix.length))));
        if (used)
            continue;
        state.numberMirror.push({ kind: 'class', prefix, original: [...state.group.classList].filter(name => name.startsWith(prefix) && /^\d+$/.test(name.slice(prefix.length))) });
    }
}
function syncNumberMirror(state, value) {
    if (state.numberMirror === undefined)
        prepareNumberMirror(state);
    if (!state.numberMirror.length || !Number.isFinite(value))
        return;
    const text = String(Math.round(value));
    for (const mirror of state.numberMirror) {
        if (mirror.kind === 'attr') {
            for (const node of mirror.hosts.keys())
                if (node.isConnected && node.getAttribute(mirror.name) !== text)
                    node.setAttribute(mirror.name, text);
        }
        else {
            for (const name of [...state.group.classList])
                if (name.startsWith(mirror.prefix) && /^\d+$/.test(name.slice(mirror.prefix.length)))
                    state.group.classList.remove(name);
            state.group.classList.add(mirror.prefix + text);
        }
    }
}
function restoreNumberMirror(state) {
    if (!state?.numberMirror)
        return;
    for (const mirror of state.numberMirror) {
        if (mirror.kind === 'attr') {
            for (const [node, original] of mirror.hosts) {
                if (original === null)
                    node.removeAttribute(mirror.name);
                else
                    node.setAttribute(mirror.name, original);
            }
        }
        else {
            for (const name of [...state.group.classList])
                if (name.startsWith(mirror.prefix) && /^\d+$/.test(name.slice(mirror.prefix.length)))
                    state.group.classList.remove(name);
            for (const name of mirror.original)
                state.group.classList.add(name);
        }
    }
    state.numberMirror = undefined;
}
function fireKeyedParts(state, button) {
    const parts = state.keyedParts?.get(String(button.getAttribute('data-rm-fire') || '').trim());
    if (!parts?.length)
        return false;
    state.firedParts ||= new Set();
    for (const part of parts) {
        setBehaviorNodeVisible(part, true);
        state.firedParts.add(part);
    }
    return true;
}
function fireClassParts(state, button) {
    const key = String(button.getAttribute('data-rm-fire') || '').trim();
    if (!/^[\w-]+$/.test(key) || state.keyedParts?.has(key))
        return false;
    let changed = false;
    for (const rule of localRules(state.root)) {
        for (const part of String(rule.selectorText || '').split(',')) {
            if (!part.includes('data-rm-part'))
                continue;
            const compound = compoundsOf(part.trim()).find(item => item.includes('data-rm-part'));
            const name = (compound?.match(/\.([\w-]+)/g) || []).map(item => item.slice(1)).find(item => item === key || item.endsWith(`-${key}`));
            if (!name)
                continue;
            const bare = compound.replace(/\.[\w-]+/g, '').trim() || '[data-rm-part]';
            let targets = [];
            try {
                targets = own(state.group, '[data-rm-part]').filter(node => node.matches(bare));
            }
            catch {
                targets = [];
            }
            for (const node of targets) {
                node.classList.remove(name);
                void node.getBoundingClientRect();
                node.classList.add(name);
                const done = () => node.classList.remove(name);
                node.addEventListener('animationend', done, { once: true });
                setTimeout(done, 4000);
                changed = true;
            }
        }
    }
    return changed;
}
const PART_CLASS_ATTR = 'data-rm-part-class';
function adoptPartKeyClasses(state) {
    const parts = own(state.group, '[data-rm-part]').filter(part => !(part.getAnimations?.() || []).some(item => !isTransition(item)));
    if (!parts.length)
        return;
    const named = new Set();
    for (const rule of localRules(state.root)) {
        const animated = String(rule.style.getPropertyValue('animation-name') || rule.style.animationName || '').trim();
        if (!animated || animated === 'none')
            continue;
        for (const selector of String(rule.selectorText || '').split(',')) {
            const last = compoundsOf(selector.trim()).at(-1) || '';
            const match = /^\.([\w-]+)$/.exec(last);
            if (match)
                named.add(match[1]);
        }
    }
    if (!named.size)
        return;
    const scope = state.root?.closest?.('toto') || state.root;
    for (const part of parts) {
        const key = String(part.getAttribute('data-rm-part') || '').trim();
        if (!/^[\w-]{2,}$/.test(key))
            continue;
        const names = [...named].filter(item => item === key || item.endsWith(`-${key}`));
        const name = names.includes(key) ? key : names.length === 1 ? names[0] : '';
        if (!name || part.classList.contains(name))
            continue;
        try {
            const authored = [...(scope?.querySelectorAll?.(`.${CSS.escape(name)}`) || [])].some(node => node.getAttribute(PART_CLASS_ATTR) !== name);
            if (authored)
                continue;
        }
        catch {
            continue;
        }
        part.classList.add(name);
        part.setAttribute(PART_CLASS_ATTR, name);
    }
}
function fireAuthoredSet(state, button) {
    const word = String(button.getAttribute('data-rm-set') || '').trim();
    const key = String(button.getAttribute('data-rm-fire') || '').trim();
    if (!/^[\w:-]+$/.test(word) || !key || !word.startsWith(key + ':'))
        return false;
    if (own(state.group, '[data-rm-part]').filter(n => n.getAttribute('data-rm-part') === key).length !== 1)
        return false;
    if (!ownBehaviorShows(state.group).some(n => n.getAttribute('data-rm-show') === word))
        return false;
    if (!localRules(state.root).some(rule => String(rule.selectorText || '').includes('[data-rm-on~="' + word + '"]')))
        return false;
    if (!state.setWords) {
        state.setWords = new Set();
        state.setWordBaseline = state.group.getAttribute('data-rm-on');
    }
    state.setWords.add(word);
    state.on = new Set([...words(state.setWordBaseline || ''), ...state.setWords]);
    state.group.setAttribute('data-rm-on', [...state.on].join(' '));
    return true;
}
function resetFiredParts(state) {
    if (state.setWords) {
        state.setWords.clear();
        state.on = new Set(words(state.setWordBaseline || ''));
        if (state.setWordBaseline === null)
            state.group.removeAttribute('data-rm-on');
        else
            state.group.setAttribute('data-rm-on', state.setWordBaseline);
    }
    for (const part of own(state.group, '[data-rm-part][data-rm-active]'))
        part.removeAttribute('data-rm-active');
    for (const part of state.firedParts || [])
        if (part.isConnected)
            setBehaviorNodeVisible(part, false);
    state.firedParts?.clear();
}
const UP_STATE = /\[\s*(data-rm-(?:done|active|on))\s*(?:=\s*["']?([^"'\]]*)["']?)?\s*\]/;
function ancestorStateRules(state) {
    if (state.ancestorRules)
        return state.ancestorRules;
    const list = [], seen = new Set();
    state.ancestorRules = list;
    for (const rule of localRules(state.root)) {
        const text = rule.selectorText || '';
        if (!text.includes('data-rm-'))
            continue;
        for (const part of text.split(','))
            for (const compound of compoundsOf(part.trim())) {
                const match = UP_STATE.exec(compound);
                if (!match)
                    continue;
                const base = compound.replace(STATE_ATTR_STRIP, '').trim();
                if (!base || !/[.#][A-Za-z_]/.test(base) || base.includes('data-rm-') || base.includes('('))
                    continue;
                const value = match[2] === undefined ? 'true' : match[2].trim();
                if (value === 'false' || value === '')
                    continue;
                const id = `${match[1]}|${value}|${base}`;
                if (seen.has(id))
                    continue;
                seen.add(id);
                list.push({ attr: match[1], value, base });
            }
    }
    return list;
}
function mirrorStateUp(state, control, attr, controls) {
    const rules = ancestorStateRules(state).filter(rule => rule.attr === attr);
    if (!rules.length || !control?.parentElement)
        return;
    for (const { value, base } of rules) {
        try {
            if (control.matches(base))
                continue;
        }
        catch {
            continue;
        }
        let holder = null;
        for (let node = control.parentElement; node && node !== state.group; node = node.parentElement) {
            try {
                if (node.matches(base)) {
                    holder = node;
                    break;
                }
            }
            catch {
                break;
            }
        }
        if (!holder || !state.group.contains(holder))
            continue;
        state.upMirrors ||= new Map();
        if (!state.upMirrors.has(holder))
            state.upMirrors.set(holder, new Map());
        const saved = state.upMirrors.get(holder);
        if (!saved.has(attr))
            saved.set(attr, holder.getAttribute(attr));
        const on = [...holder.querySelectorAll(controls)].some(node => ownerGroup(node) === state.group && node.getAttribute(attr) === 'true');
        if (on) {
            if (holder.getAttribute(attr) !== value)
                holder.setAttribute(attr, value);
        }
        else {
            const original = saved.get(attr);
            if (original === null)
                holder.removeAttribute(attr);
            else if (holder.getAttribute(attr) !== original)
                holder.setAttribute(attr, original);
        }
    }
}
function restoreStateUp(state) {
    for (const [holder, saved] of state.upMirrors || [])
        for (const [attr, original] of saved) {
            if (original === null)
                holder.removeAttribute(attr);
            else
                holder.setAttribute(attr, original);
        }
    state.upMirrors?.clear();
}
function countSteps(state) {
    const steps = own(state.group, '[data-rm-step]');
    const completed = steps.filter(node => node.getAttribute('data-rm-done') === 'true').length;
    style(state, state.group, '--rm-count', String(completed));
    state.group.setAttribute('data-rm-count', String(completed));
    syncNumberMirror(state, completed);
    if (steps.length > 0 && completed === steps.length && !state.group.querySelector(GROUP))
        state.group.setAttribute('data-rm-done', 'true');
    else
        state.group.removeAttribute('data-rm-done');
    for (const step of steps) {
        const done = step.getAttribute('data-rm-done') === 'true';
        step.setAttribute('aria-pressed', String(done));
        mark(state, step, done, ['data-rm-done', 'aria-pressed']);
        mirrorStateUp(state, step, 'data-rm-done', '[data-rm-step]');
    }
}
function inputChange(state, input, userAction = false) {
    if (userAction)
        state.changed = true;
    const verify = userAction ? beginVerify(state, input) : null;
    const { group, type } = state;
    if (type === 'input' && input.matches('input:not([type]), input[type="text"], input[type="password"], textarea')) {
        for (const output of own(group, 'output'))
            output.textContent = input.value;
        if (group.hasAttribute('data-rm-answer'))
            group.setAttribute('data-rm-match', String(input.value.trim() === String(group.getAttribute('data-rm-answer')).trim()));
    }
    if (!input.matches('input[type="range"]')) {
        refreshResults(state);
        verify?.();
        return;
    }
    const { value, p } = rangeValue(input);
    if (type === 'adjust') {
        style(state, group, '--rm-p', String(p));
        style(state, group, '--rm-value', String(value));
        syncStageAttr(state, value);
        syncWordStage(state, p);
        syncNumberMirror(state, value);
    }
    else if (type === 'reveal')
        reveal(state, p);
    else if (type === 'view') {
        for (const part of own(group, '[data-rm-part]')) {
            style(state, part, 'transform-origin', '0 0');
            style(state, part, 'scale', String(clamp(value, 0.1, 10)));
        }
    }
    else if (type === 'motion') {
        const list = animations(state);
        for (const animation of list) {
            const timing = animation.effect?.getComputedTiming?.();
            const duration = finite(timing?.activeDuration, finite(timing?.duration));
            if (duration > 0)
                animation.currentTime = finite(animation.effect?.getTiming?.().delay) + p * duration;
            if (duration > 0 && animation.playState === 'running')
                animation.pause();
        }
        if (list.length)
            for (const button of [...own(group, '[data-rm-play]'), ...motionOutsideControls(group).buttons.filter(node => node.hasAttribute('data-rm-play'))])
                button.setAttribute('aria-pressed', 'true');
        if (!list.length) {
            if (state.motionReplay) {
                state.motionReplay.stop = true;
                state.motionReplay = null;
            }
            motionPositions(state, p, input);
        }
    }
    refreshResults(state);
    verify?.();
}
function validGroup(group, type) {
    return TYPES.has(type) && (type === 'toggle' || (EXTRA.has(type) ? extraTypeFits(group, type) : behaviorTypeFits(group, type)));
}
function enableControl(node) {
    if (!node?.setAttribute || isNative(node))
        return;
    if (!node.hasAttribute('role'))
        node.setAttribute('role', 'button');
    if (!node.hasAttribute('tabindex'))
        node.setAttribute('tabindex', '0');
    if (!node.style?.getPropertyValue('cursor'))
        node.style?.setProperty('cursor', 'pointer');
}
const PROGRAM_ATTR = 'data-rm-program';
const PROGRAM_SKIP = /^(?:data-rabbit-mirror|data-rm-(?:ui|on|active|picked|index|match|miss|done|seq|show|result|when|toggle|pick|hold|item|slot|part|page|released|feedback|mirrored))/;
function compoundsOf(selector) {
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
function clearProgramMark(group) {
    const mark = String(group?.getAttribute?.(PROGRAM_ATTR) || '');
    const at = mark.indexOf('=');
    if (at <= 0) {
        group?.removeAttribute?.(PROGRAM_ATTR);
        return;
    }
    const attr = mark.slice(0, at), value = mark.slice(at + 1);
    if (/^[\w-]+$/.test(attr) && group.getAttribute(attr) === value)
        group.removeAttribute(attr);
    group.removeAttribute(PROGRAM_ATTR);
}
function toggleAttributeProgram(state) {
    if (state.attrProgram !== undefined)
        return state.attrProgram;
    state.attrProgram = null;
    const { group } = state;
    const scope = group.closest('details') || state.root;
    const text = behaviorStyleText(state.root);
    for (const match of text.matchAll(/([^{}@;]+)\{/g)) {
        for (const selector of match[1].split(',')) {
            const compounds = compoundsOf(selector.trim());
            for (let index = 0; index < compounds.length - 1; index += 1) {
                const compound = compounds[index];
                const attr = /\[\s*([\w-]+)\s*=\s*["']?([^"'\]]+)["']?\s*\]/.exec(compound);
                if (!attr || PROGRAM_SKIP.test(attr[1]))
                    continue;
                const rest = compound.replace(/\[[^\]]*\]/g, '');
                const tokens = [...rest.matchAll(/([.#])([A-Za-z_][\w-]*)/g)];
                if (rest.replace(/([.#])([A-Za-z_][\w-]*)/g, '').trim())
                    continue;
                if (tokens.some(([, kind, name]) => kind === '.' ? !group.classList.contains(name) : group.id !== name))
                    continue;
                const value = attr[2].trim();
                let carried = [];
                try {
                    carried = [...scope.querySelectorAll(`[${attr[1]}="${CSS.escape(value)}"]`)];
                }
                catch {
                    continue;
                }
                const ownMark = group.getAttribute(PROGRAM_ATTR) === `${attr[1]}=${value}`;
                if (carried.some(node => node !== group || !ownMark))
                    continue;
                const tail = compounds.slice(index + 1).join(' ');
                let inside = false;
                try {
                    inside = !!group.querySelector(tail);
                }
                catch {
                    inside = false;
                }
                if (!inside)
                    continue;
                state.attrProgram = { attr: attr[1], value, original: ownMark ? null : group.getAttribute(attr[1]) };
                return state.attrProgram;
            }
        }
    }
    if (group.hasAttribute(PROGRAM_ATTR))
        clearProgramMark(group);
    return null;
}
function adoptHiddenResult(state) {
    if (state.adopted !== undefined)
        return state.adopted;
    state.adopted = null;
    const { group, type } = state;
    if (!['hold', 'toggle'].includes(type))
        return null;
    if (own(group, '[data-rm-show], [data-rm-result]').length)
        return null;
    if (type === 'toggle' && (toggleAttributeProgram(state) || behaviorCssMentions(state.root, ['data-rm-on'])))
        return null;
    if (type === 'hold' && behaviorCssMentions(state.root, ['data-rm-active']))
        return null;
    const details = group.closest('details');
    let anchor = group;
    for (let level = 0; level < 3 && anchor && anchor !== details; level += 1, anchor = anchor.parentElement) {
        for (let sibling = anchor.nextElementSibling; sibling; sibling = sibling.nextElementSibling) {
            if (sibling.matches?.(GROUP) || sibling.querySelector?.(GROUP))
                break;
            if (sibling.style?.getPropertyValue('display') === 'none' && String(sibling.textContent || '').trim()) {
                state.adopted = sibling;
                return sibling;
            }
        }
    }
    return null;
}
const DONE_RESULT_TYPES = new Set(['connect', 'accumulate', 'sequence']);
const DONE_RESULT_NAME = /(?:^|[-_\s])(?:feedback|fb|result|success|done|complete|completed|reward|unlock|unlocked|answer)(?:$|[-_\s\d])/i;
function adoptDoneResult(state) {
    if (state.doneAdopted !== undefined)
        return state.doneAdopted;
    state.doneAdopted = [];
    const { group, type } = state;
    if (!DONE_RESULT_TYPES.has(type) || own(group, '[data-rm-show], [data-rm-result]').length)
        return state.doneAdopted;
    const view = group.ownerDocument?.defaultView;
    if (!view?.getComputedStyle)
        return state.doneAdopted;
    for (const node of own(group, '[class], [id]')) {
        if (node === group || node.matches(GROUP) || node.querySelector('button, input, select, textarea, [data-rm-end], [data-rm-step], [data-rm-code]'))
            continue;
        const name = `${node.getAttribute('class') || ''} ${node.id || ''}`.replace(/\brmc-[a-z0-9]+-[a-z0-9]+-\d+-[a-z0-9]+-/gi, '');
        if (!DONE_RESULT_NAME.test(name) || !String(node.textContent || '').trim())
            continue;
        if (view.getComputedStyle(node).display !== 'none')
            continue;
        if (state.doneAdopted.some(other => other.contains(node)))
            continue;
        node.style.setProperty('display', node.matches('span, a, em, strong, b, i') ? 'inline-block' : 'block', 'important');
        node.setAttribute('data-rm-show', 'done');
        state.doneAdopted.push(node);
    }
    return state.doneAdopted;
}
function prepare(binding, group) {
    if (binding.groups.has(group))
        return binding.groups.get(group);
    const type = group.getAttribute('data-rm-ui');
    if (!validGroup(group, type))
        return null;
    if ((type === 'pager' || type === 'slide') && !group.hasAttribute('data-rm-index-base')) {
        const total = type === 'pager' ? ownPages(group).length : own(group, '[data-rm-item]').length;
        if (cssIndexBase({ group, root: binding.root }, total) === 0)
            group.setAttribute('data-rm-index-base', '0');
    }
    if (carryMemoryName(group)) {
        try {
            applyCarriedState(group);
        }
        catch { }
    }
    const state = { group, type, root: binding.root, styles: new Map(), positions: new Map(), orders: new Map(), animations: new Set(), strokes: new Set(), placed: new Set(), changed: false, progress: 0 };
    binding.groups.set(group, state);
    owners.set(group, binding);
    const items = own(group, '[data-rm-item]');
    const sandbox = Boolean(group.closest('[data-rm-quiet-feedback]'));
    if (!sandbox && type === 'drag')
        for (const item of items)
            clearStaleDragPosition(item);
    if (!sandbox && type === 'reorder')
        restoreStaleOrder(items);
    if (!sandbox && type === 'draw')
        for (const path of group.querySelectorAll('svg[data-rm-canvas] path'))
            if (isStaleStroke(path))
                path.remove();
    if (type === 'drag' || type === 'reorder')
        for (const item of items) {
            item.style.setProperty('touch-action', 'none');
            if (type === 'reorder' && !state.orders.has(item.parentElement))
                state.orders.set(item.parentElement, [...item.parentElement.children]);
        }
    if (type === 'draw')
        first(group, 'svg[data-rm-canvas]').style.setProperty('touch-action', 'none');
    if (type === 'follow' || type === 'hold' || (type === 'reveal' && !first(group, 'input[type="range"]'))) {
        const surface = first(group, type === 'hold' ? '[data-rm-hold]' : '[data-rm-surface]') || group;
        surface.style.setProperty('touch-action', 'none');
        if (type === 'hold')
            for (const node of own(group, '[data-rm-hold]')) {
                node.style.setProperty('user-select', 'none');
                node.style.setProperty('-webkit-user-select', 'none');
                node.style.setProperty('-webkit-touch-callout', 'none');
            }
    }
    clearStaleFeedback(group);
    for (const control of own(group, `${CONTROL_SELECTOR}, [data-rm-hold]`)) {
        if (type !== 'pager' && control.hasAttribute('data-rm-edge')
            && control.matches('[data-rm-prev], [data-rm-next], [data-rm-goto]')
            && control.closest(GROUP)?.getAttribute('data-rm-ui') === 'pick'
            && (control.hasAttribute('data-rm-reset') || (TYPE_CONTROLS[type] || []).some(name => control.hasAttribute(`data-rm-${name}`)))) {
            control.removeAttribute('data-rm-edge');
            control.removeAttribute('aria-disabled');
        }
        enableControl(control);
    }
    if (type === 'view')
        style(state, group, 'overflow', 'auto');
    if (type === 'effect') {
        try {
            adoptPartKeyClasses(state);
        }
        catch { }
    }
    if (type === 'effect')
        for (const animation of animations(state)) {
            animation.pause();
            animation.currentTime = 0;
        }
    if (type === 'effect')
        prepareKeyedParts(state);
    if (type === 'adjust') {
        prepareStageAttr(state);
        prepareWordStage(state);
    }
    if (group.hasAttribute('data-rm-answer'))
        for (const node of own(group, '[data-rm-match]')) {
            if (node !== group && !node.hasAttribute('data-rm-show') && !String(node.getAttribute('data-rm-match') || '').trim())
                node.setAttribute('data-rm-show', 'match');
        }
    if (type === 'input' && group.hasAttribute('data-rm-answer')) {
        const field = inputTextField(state);
        const answer = String(group.getAttribute('data-rm-answer')).trim();
        if (field && field.value.trim() !== answer) {
            if (group.getAttribute('data-rm-match') === 'true')
                group.removeAttribute('data-rm-match');
            for (const output of own(group, 'output'))
                if (answer && output.textContent.trim() === answer)
                    output.textContent = field.value;
        }
    }
    if (type === 'motion') {
        animations(state);
        prepareMotionSeek(state);
    }
    if (type === 'accumulate')
        countSteps(state);
    if (STATEFUL.has(type))
        prepareStateful(state);
    if (EXTRA.has(type)) {
        try {
            prepareExtra(state);
        }
        catch (error) {
            console.debug('[RabbitMirror] extra behavior prepare failed:', error);
        }
    }
    if (['adjust', 'view', 'reveal'].includes(type)) {
        const range = first(group, 'input[type="range"]');
        if (range && type === 'reveal' && own(group, '[data-rm-cover]').length && !group.closest('[data-rm-quiet-feedback]')) {
            const { value } = rangeValue(range);
            const max = range.max === '' ? 100 : finite(range.max, 100);
            if (value >= max)
                range.value = String(range.min === '' ? 0 : finite(range.min));
        }
        if (range)
            inputChange(state, range);
    }
    refreshResults(state);
    return state;
}
function stateFor(root, target) {
    const binding = roots.get(root);
    const control = target?.closest?.(`${CONTROL_SELECTOR}, [data-rm-hold]`);
    const owner = control && ownerGroup(control);
    const claimed = owner && (control.hasAttribute('data-rm-reset')
        || (TYPE_CONTROLS[owner.getAttribute('data-rm-ui')] || []).some(name => control.hasAttribute(`data-rm-${name}`)));
    const group = (claimed && owner) || remotePagerGroup(root, target) || owner || target?.closest?.(GROUP) || remoteToggleGroup(root, target) || remoteMotionGroup(root, target);
    return binding && group && root.contains(group) ? prepare(binding, group) : null;
}
const MOTION_NUMERIC = new Set(['left', 'right', 'top', 'bottom', 'width', 'height']);
const MOTION_VAR = /^(?:x|y|p|t|pos|position|left|top|offset|progress|dist|distance|shift|move|run|step|frame|angle|rot|rotate|deg|i)(?:[-_]?\d+|[-_][a-z]+)?$/i;
function motionTargets(state) {
    if (state.motionTargets)
        return state.motionTargets;
    const targets = [];
    for (const part of own(state.group, '[data-rm-part]')) {
        const inline = part.style;
        for (let index = 0; index < (inline?.length || 0); index += 1) {
            const property = inline[index];
            if (!property.startsWith('--') && !MOTION_NUMERIC.has(property))
                continue;
            if (property.startsWith('--rm-') || (property.startsWith('--') && !MOTION_VAR.test(property.slice(2))))
                continue;
            const saved = state.styles.get(part)?.get(property);
            const raw = String(saved ? saved[0] : inline.getPropertyValue(property)).trim();
            const match = raw.match(/^(-?\d*\.?\d+)(%|px)?$/);
            if (match && (property === 'width' || property === 'height') && match[2] !== '%')
                continue;
            if (match)
                targets.push({ node: part, property, base: Number(match[1]), unit: match[2] || '' });
        }
    }
    state.motionTargets = targets;
    return targets;
}
function motionStartOf(state, range) {
    if (state.motionStart !== undefined)
        return state.motionStart;
    let start = 1;
    if (range) {
        const min = range.min === '' ? 0 : finite(range.min);
        const max = Math.max(min, range.max === '' ? 100 : finite(range.max, 100));
        const authored = range.getAttribute('value');
        const value = authored === null || authored === '' ? (min + max) / 2 : clamp(finite(authored, min), min, max);
        start = max > min ? (value - min) / (max - min) : 1;
    }
    state.motionStart = start;
    return start;
}
function motionPositions(state, p, range = null) {
    const targets = motionTargets(state);
    if (!targets.length)
        return false;
    const start = motionStartOf(state, range);
    const factor = Math.min(4, start > 0.05 ? clamp(p, 0, 1) / start : 1 + clamp(p, 0, 1));
    for (const target of targets) {
        let value = target.base * factor;
        if (target.unit === '%')
            value = clamp(value, Math.min(0, target.base), Math.max(100, target.base));
        style(state, target.node, target.property, `${Math.round(value * 100) / 100}${target.unit}`);
    }
    return true;
}
function motionRange(state) {
    return first(state.group, 'input[type="range"]') || motionOutsideControls(state.group).ranges[0] || null;
}
function motionProgress(state, button) {
    if (!button.hasAttribute('data-rm-play') || motionTargets(state).length)
        return false;
    const range = motionRange(state);
    if (!range)
        return false;
    if (state.motionProgress) {
        state.motionProgress.stop = true;
        state.motionProgress = null;
        button.setAttribute('aria-pressed', 'false');
        return true;
    }
    const min = range.min === '' ? 0 : finite(range.min);
    const max = Math.max(min, range.max === '' ? 100 : finite(range.max, 100));
    if (finite(range.value, min) >= max)
        range.value = String(min);
    const run = { stop: false };
    state.motionProgress = run;
    button.setAttribute('aria-pressed', 'true');
    const view = state.group.ownerDocument?.defaultView || globalThis;
    const frame = typeof view.requestAnimationFrame === 'function' ? view.requestAnimationFrame.bind(view) : callback => setTimeout(() => callback(Date.now()), 16);
    const perMs = (max - min) / 30000;
    let last = null;
    let value = finite(range.value, min);
    const tick = now => {
        if (run.stop || !state.group.isConnected)
            return;
        if (last !== null)
            value = Math.min(max, value + (now - last) * perMs);
        last = now;
        range.value = String(value);
        inputChange(state, range);
        if (value < max)
            frame(tick);
        else {
            if (state.motionProgress === run)
                state.motionProgress = null;
            button.setAttribute('aria-pressed', 'false');
        }
    };
    frame(tick);
    return true;
}
function prepareMotionSeek(state) {
    const range = motionRange(state);
    if (!range)
        return;
    for (const play of own(state.group, '[data-rm-play]')) {
        const row = play.parentElement;
        if (!row)
            continue;
        const buttons = [...row.children].filter(node => node.matches?.('button') && node !== play);
        for (const button of buttons) {
            if ([...button.attributes].some(attr => /^data-rm-(?!press|polish)/.test(attr.name) || attr.name === 'popovertarget' || attr.name === 'commandfor'))
                continue;
            if (button.closest('[data-rm-mobile-controls]'))
                continue;
            const before = Boolean(button.compareDocumentPosition(play) & Node.DOCUMENT_POSITION_FOLLOWING);
            button.setAttribute('data-rm-seek', before ? '-1' : '1');
        }
    }
}
function motionSeek(state, button) {
    const range = motionRange(state);
    if (!range)
        return false;
    const min = range.min === '' ? 0 : finite(range.min);
    const max = Math.max(min, range.max === '' ? 100 : finite(range.max, 100));
    const direction = finite(button.getAttribute('data-rm-seek'), 1) < 0 ? -1 : 1;
    range.value = String(clamp(finite(range.value, min) + direction * (max - min) / 10, min, max));
    inputChange(state, range);
    return true;
}
function motionReplay(state, button) {
    if (!motionTargets(state).length)
        return false;
    const range = motionRange(state);
    if (state.motionReplay) {
        state.motionReplay.stop = true;
        state.motionReplay = null;
        button.setAttribute('aria-pressed', 'false');
        return true;
    }
    const reverse = button.hasAttribute('data-rm-reverse');
    const run = { stop: false };
    state.motionReplay = run;
    button.setAttribute('aria-pressed', 'true');
    const view = state.group.ownerDocument?.defaultView || globalThis;
    const frame = typeof view.requestAnimationFrame === 'function' ? view.requestAnimationFrame.bind(view) : callback => setTimeout(() => callback(Date.now()), 16);
    const duration = 2400;
    let begin = null;
    const tick = now => {
        if (run.stop || !state.group.isConnected)
            return;
        if (begin === null)
            begin = now;
        const t = clamp((now - begin) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - t, 2);
        const p = reverse ? 1 - eased : eased;
        if (range) {
            const min = range.min === '' ? 0 : finite(range.min);
            const max = Math.max(min, range.max === '' ? 100 : finite(range.max, 100));
            range.value = String(Math.round(min + p * (max - min)));
        }
        motionPositions(state, p, range);
        refreshResults(state);
        if (t < 1)
            frame(tick);
        else {
            if (state.motionReplay === run)
                state.motionReplay = null;
            button.setAttribute('aria-pressed', 'false');
        }
    };
    frame(tick);
    return true;
}
export function isBehaviorInteractionOwned(node) {
    const group = node?.closest?.(GROUP);
    return Boolean(group && owners.get(group)?.root.contains(group));
}
export function hasBehaviorInteractionControl(root, button) {
    if (!isButton(button))
        return false;
    if (hasMobileInteractionControl(root, button))
        return true;
    const state = stateFor(root, button);
    if (!state)
        return false;
    if (button.hasAttribute('data-rm-reset'))
        return true;
    const attrs = TYPE_CONTROLS;
    if (state.type === 'toggle' && !own(state.group, '[data-rm-toggle]').length
        && !button.hasAttribute('popovertarget') && !button.hasAttribute('commandfor'))
        return true;
    if (inputSubmitButton(state, button))
        return true;
    return (attrs[state.type] || []).some(attr => button.hasAttribute(`data-rm-${attr}`));
}
const INPUT_TEXT = 'input:not([type]), input[type="text"], input[type="password"], textarea';
function inputTextField(state, button = null) {
    const fields = own(state.group, INPUT_TEXT);
    if (button) {
        const before = fields.filter(field => field.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING);
        if (before.length)
            return before[before.length - 1];
    }
    return fields[0] || null;
}
const CLEAR_BUTTON_TEXT = __rmR("yXKcX2.PWRCxKTYBi0cLpGuzuM2vYRQKON8p0MGUiyxrbPbEnCaFZ.BFDK8wuS65qshd52qHxjsSfZ9x3q9I3rXaAR.2ej_ntRN19Z2N", "i");
function inputSubmitButton(state, button) {
    if (state?.type !== 'input' || ownerGroup(button) !== state.group || !inputTextField(state, button))
        return false;
    if (CLEAR_BUTTON_TEXT.test(String(button.textContent || button.value || '').trim()))
        return false;
    if (!state.group.hasAttribute('data-rm-answer') && !own(state.group, 'output').length)
        return false;
    if ([...button.attributes].some(attr => /^data-rm-/.test(attr.name) && !/^data-rm-(?:press|polish)/.test(attr.name)))
        return false;
    return !button.hasAttribute('popovertarget') && !button.hasAttribute('commandfor') && !button.hasAttribute('onclick');
}
function reset(state) {
    state.changed = false;
    state.placed.clear();
    for (const node of own(state.group, '[data-rm-placed]'))
        node.removeAttribute('data-rm-placed');
    for (const [node, properties] of state.styles)
        for (const [property, [value, priority]] of properties) {
            if (value)
                node.style.setProperty(property, value, priority);
            else
                node.style.removeProperty(property);
        }
    state.styles.clear();
    state.overrides?.clear();
    state.positions.clear();
    for (const node of own(state.group, `[${MOVED_ATTR}]`))
        node.removeAttribute(MOVED_ATTR);
    for (const [parent, order] of state.orders) {
        const present = [...parent.children].filter(node => order.includes(node));
        const original = order.filter(node => node.parentElement === parent);
        const slots = present.map(() => parent.ownerDocument.createComment('rm-order'));
        for (let i = 0; i < present.length; i++)
            parent.insertBefore(slots[i], present[i]);
        for (let i = 0; i < original.length; i++)
            slots[i].replaceWith(original[i]);
        for (const slot of slots)
            slot.remove();
    }
    for (const path of state.strokes)
        path.remove();
    state.strokes.clear();
    for (const input of own(state.group, 'input, textarea')) {
        if (input.matches('input[type="range"]'))
            input.value = input.defaultValue || (input.min === '' ? '0' : input.min);
        else if (state.type === 'input')
            input.value = '';
    }
    if (state.type === 'motion') {
        if (state.motionReplay) {
            state.motionReplay.stop = true;
            state.motionReplay = null;
        }
        if (state.motionProgress) {
            state.motionProgress.stop = true;
            state.motionProgress = null;
        }
        const remote = motionRange(state);
        if (remote && !state.group.contains(remote))
            remote.value = remote.defaultValue || (remote.min === '' ? '0' : remote.min);
        for (const button of [...own(state.group, '[data-rm-play], [data-rm-reverse]'), ...motionOutsideControls(state.group).buttons])
            button.setAttribute('aria-pressed', 'false');
    }
    if (state.type === 'input') {
        for (const output of own(state.group, 'output'))
            output.textContent = '';
        state.group.removeAttribute('data-rm-match');
    }
    if (state.type === 'reveal')
        reveal(state, 0);
    if (state.type === 'effect')
        resetFiredParts(state);
    if (state.type === 'view') {
        state.group.scrollLeft = 0;
        state.group.scrollTop = 0;
        style(state, state.group, 'overflow', 'auto');
    }
    if (state.type === 'hold') {
        setHoldActive(state, null, false);
        owners.get(state.group)?.holds.delete(state);
    }
    if (state.type === 'accumulate') {
        for (const step of own(state.group, '[data-rm-step]'))
            step.removeAttribute('data-rm-done');
        countSteps(state);
    }
    if (state.type === 'adjust' || state.type === 'view') {
        const range = first(state.group, 'input[type="range"]');
        if (range)
            inputChange(state, range);
    }
    if (STATEFUL.has(state.type))
        resetStateful(state);
    if (EXTRA.has(state.type)) {
        try {
            extraReset(state);
        }
        catch { }
    }
    refreshResults(state);
}
function action(state, button) {
    if (!state)
        return;
    if (button.hasAttribute('data-rm-reset')) {
        reset(state);
        return;
    }
    if (inputSubmitButton(state, button)) {
        inputChange(state, inputTextField(state, button), true);
        return;
    }
    const verify = beginVerify(state, button, true);
    if (state.type === 'drag') {
        const item = button.closest('[data-rm-item]');
        if (!item || item.closest(GROUP) !== state.group)
            return;
        const changed = dragButton(state, item, button);
        if (changed)
            state.changed = true;
    }
    else if (state.type === 'effect' && button.hasAttribute('data-rm-fire')) {
        const list = animations(state);
        for (const animation of list) {
            animation.currentTime = 0;
            animation.play();
        }
        if (list.length)
            state.changed = true;
        if (fireAuthoredSet(state, button))
            state.changed = true;
        if (fireKeyedParts(state, button))
            state.changed = true;
        if (fireClassParts(state, button))
            state.changed = true;
        if (fireParts(state))
            state.changed = true;
        if (ownBehaviorShows(state.group).length)
            state.changed = true;
    }
    else if (state.type === 'motion') {
        const list = animations(state);
        if (list.length)
            state.changed = true;
        else if (button.hasAttribute('data-rm-seek')) {
            if (motionSeek(state, button))
                state.changed = true;
            refreshResults(state);
            verify?.();
            return;
        }
        else if (motionReplay(state, button) || motionProgress(state, button)) {
            state.changed = true;
            refreshResults(state);
            verify?.();
            return;
        }
        if (button.hasAttribute('data-rm-play')) {
            const pause = list.some(animation => animation.playState === 'running');
            for (const animation of list)
                animation[pause ? 'pause' : 'play']();
            button.setAttribute('aria-pressed', String(pause));
        }
        else if (button.hasAttribute('data-rm-reverse'))
            for (const animation of list) {
                const rate = -(animation.playbackRate || 1);
                if (rate < 0 && finite(animation.currentTime) <= 0) {
                    const timing = animation.effect?.getComputedTiming?.();
                    animation.currentTime = finite(timing?.activeDuration, finite(timing?.duration));
                }
                if (animation.updatePlaybackRate)
                    animation.updatePlaybackRate(rate);
                else
                    animation.playbackRate = rate;
                animation.play();
            }
    }
    else if (state.type === 'accumulate' && button.hasAttribute('data-rm-step')) {
        const done = button.getAttribute('data-rm-done') === 'true';
        if (done)
            button.removeAttribute('data-rm-done');
        else
            button.setAttribute('data-rm-done', 'true');
        countSteps(state);
        state.changed = true;
    }
    else if (state.type === 'reorder') {
        const item = button.closest('[data-rm-item]');
        if (!item || item.closest(GROUP) !== state.group)
            return;
        const siblings = own(state.group, '[data-rm-item]').filter(node => node.parentElement === item.parentElement);
        const index = siblings.indexOf(item);
        if (button.hasAttribute('data-rm-prev') && index > 0) {
            item.parentElement.insertBefore(item, siblings[index - 1]);
            state.changed = true;
        }
        if (button.hasAttribute('data-rm-next') && index < siblings.length - 1) {
            item.parentElement.insertBefore(siblings[index + 1], item);
            state.changed = true;
        }
        button.focus?.({ preventScroll: true });
    }
    else if (STATEFUL.has(state.type)) {
        if (statefulAction(state, button))
            state.changed = true;
    }
    else if (EXTRA.has(state.type)) {
        if (extraAction(state, button))
            state.changed = true;
    }
    refreshResults(state);
    verify?.();
}
function unstyle(state, node, properties) {
    const saved = state.styles.get(node);
    for (const property of properties) {
        if (!saved?.has(property))
            continue;
        const [value, priority] = saved.get(property);
        if (value)
            node.style.setProperty(property, value, priority);
        else
            node.style.removeProperty(property);
        saved.delete(property);
    }
}
function mark(state, node, on, needles) {
    if (!node?.style)
        return;
    mirrorBehaviorState(state.root, node, on);
    const quiet = behaviorCssMentions(state.root, needles) || hasBehaviorStateClasses(state.root, node) || Boolean(state.group.closest('[data-rm-quiet-feedback]'));
    if (quiet)
        return;
    if (on) {
        style(state, node, 'outline', '2px solid currentColor');
        style(state, node, 'outline-offset', '2px');
        node.setAttribute(FEEDBACK_ATTR, '');
    }
    else {
        unstyle(state, node, ['outline', 'outline-offset']);
        node.removeAttribute(FEEDBACK_ATTR);
    }
}
const FEEDBACK_ATTR = 'data-rm-feedback';
function clearStaleFeedback(group) {
    for (const node of [group, ...group.querySelectorAll(`[${FEEDBACK_ATTR}]`)]) {
        if (!node.hasAttribute?.(FEEDBACK_ATTR))
            continue;
        node.style.removeProperty('outline');
        node.style.removeProperty('outline-offset');
        node.removeAttribute(FEEDBACK_ATTR);
    }
    for (const node of group.querySelectorAll('[data-rm-placed]')) {
        if (node.style.getPropertyValue('opacity') === '0.55')
            node.style.removeProperty('opacity');
        node.removeAttribute('data-rm-placed');
    }
}
function setFlag(node, name, on) {
    if (on) {
        if (node.getAttribute(name) !== 'true')
            node.setAttribute(name, 'true');
    }
    else if (node.hasAttribute(name))
        node.removeAttribute(name);
}
function rollOptions(state) {
    const keys = [];
    let elseBranch = false;
    for (const node of ownBehaviorShows(state.group)) {
        const tokens = behaviorShowTokens(node);
        if (tokens.length && tokens.every(token => token.startsWith('!')))
            elseBranch = true;
        for (const token of tokens) {
            if (token.startsWith('!') || RESERVED_KEYS.has(token) || keys.includes(token))
                continue;
            keys.push(token);
        }
    }
    if (elseBranch && keys.length === 1)
        keys.push('');
    return keys;
}
function randomBelow(limit) {
    try {
        const buffer = new Uint32Array(1);
        globalThis.crypto.getRandomValues(buffer);
        return buffer[0] % limit;
    }
    catch {
        return Math.floor(Math.random() * limit);
    }
}
const ownPages = group => [...group.querySelectorAll('[data-rm-page]')].filter(node => (node.matches(GROUP) ? node.parentElement?.closest(GROUP) : node.closest(GROUP)) === group);
function knobRotation(knob) {
    try {
        const value = knob.ownerDocument.defaultView?.getComputedStyle?.(knob)?.rotate;
        const match = /^(-?[\d.]+)deg$/.exec(String(value || '').trim());
        return match ? Number(match[1]) : 0;
    }
    catch {
        return 0;
    }
}
function prepareStateful(state) {
    const { group, type } = state;
    if (type === 'toggle') {
        state.on = new Set(words(group.getAttribute('data-rm-on')).map(behaviorToggleKey));
        try {
            const aliases = toggleCssBridges(state)?.aliases;
            if (aliases?.size) {
                const keys = new Set([...own(group, '[data-rm-toggle]'), group].filter(node => node.hasAttribute('data-rm-toggle')).map(node => behaviorToggleKey(node.getAttribute('data-rm-toggle'))));
                for (const alias of aliases)
                    if (!keys.has(alias))
                        state.on.delete(alias);
            }
        }
        catch { }
        if (!own(group, '[data-rm-toggle]').length) {
            enableControl(group);
            if (!group.hasAttribute('aria-pressed') && group.getAttribute('role') === 'button')
                group.setAttribute('aria-pressed', 'false');
        }
    }
    else if (type === 'pick' || type === 'roll') {
        state.picked = String(group.getAttribute('data-rm-picked') || '').trim();
    }
    else if (type === 'pager') {
        state.pages = ownPages(group);
        if (!group.hasAttribute('data-rm-index-base') && cssIndexBase(state, state.pages.length) === 0)
            group.setAttribute('data-rm-index-base', '0');
        state.indexBase = group.getAttribute('data-rm-index-base') === '0' ? 0 : 1;
        state.index = Math.min(Math.max(1, Math.round(finite(group.getAttribute('data-rm-index'), state.indexBase)) + 1 - state.indexBase), state.pages.length);
        state.loop = group.hasAttribute('data-rm-loop');
        if (!group.style.getPropertyValue('touch-action'))
            group.style.setProperty('touch-action', 'pan-y');
    }
    else if (type === 'connect') {
        for (const stale of own(group, 'svg[data-rm-lines]'))
            stale.remove();
        for (const end of own(group, '[data-rm-end]')) {
            end.removeAttribute('data-rm-paired');
            end.removeAttribute('data-rm-armed');
        }
        group.removeAttribute('data-rm-miss');
        group.removeAttribute('data-rm-done');
        state.pairs = [];
        state.paired = new Set();
        state.armed = null;
    }
    else if (type === 'turn') {
        state.knob = first(group, '[data-rm-knob]');
        state.knob.style.setProperty('touch-action', 'none');
        if (!state.knob.style.getPropertyValue('cursor') || state.knob.style.getPropertyValue('cursor') === 'pointer')
            state.knob.style.setProperty('cursor', 'grab');
        state.stops = Math.round(finite(group.getAttribute('data-rm-stops'), 0));
        if (state.stops < 2 || state.stops > 72)
            state.stops = 0;
        if (!state.knob.hasAttribute('data-rm-knob-base'))
            state.knob.setAttribute('data-rm-knob-base', String(knobRotation(state.knob)));
        state.baseRotation = finite(state.knob.getAttribute('data-rm-knob-base'), 0);
        state.angle = finite(group.getAttribute('data-rm-angle-turned'), 0);
        state.stopIndex = 0;
    }
    else if (type === 'sequence') {
        group.removeAttribute('data-rm-miss');
        group.removeAttribute('data-rm-match');
        group.removeAttribute('data-rm-done');
        for (const key of own(group, '[data-rm-code]'))
            key.removeAttribute('data-rm-done');
        state.entered = [];
        state.pressed = new Set();
        state.answer = words(group.getAttribute('data-rm-answer'));
    }
    state.initial = { on: new Set(state.on || []), picked: state.picked || '', index: state.index || 1 };
}
function resetStateful(state) {
    const { group, type, initial } = state;
    if (type === 'toggle')
        state.on = new Set(initial.on);
    if (type === 'pick' || type === 'roll')
        state.picked = initial.picked;
    if (type === 'pager')
        state.index = initial.index;
    if (type === 'connect') {
        state.lines?.remove();
        state.lines = null;
        state.pairs = [];
        state.paired = new Set();
        state.armed = null;
        group.removeAttribute('data-rm-miss');
    }
    if (type === 'turn') {
        state.angle = 0;
        state.stopIndex = 0;
    }
    if (type === 'sequence') {
        state.entered = [];
        state.pressed = new Set();
        group.removeAttribute('data-rm-miss');
    }
}
function stepTurn(state, direction) {
    const step = state.stops ? 360 / state.stops : 30;
    state.angle = Math.round((state.angle + direction * step) / step) * step;
}
function snapTurn(state) {
    if (!state.stops)
        return;
    const step = 360 / state.stops;
    state.angle = Math.round(state.angle / step) * step;
}
function statefulAction(state, control) {
    const { group, type } = state;
    if (type === 'toggle') {
        const remote = control.hasAttribute('data-rm-toggle') && !group.contains(control);
        const key = control.hasAttribute('data-rm-toggle') && !(remote && !own(group, '[data-rm-toggle]').length)
            ? behaviorToggleKey(control.getAttribute('data-rm-toggle')) : 'on';
        if (remote)
            (state.remotes ||= new Set()).add(control);
        if (state.on.has(key))
            state.on.delete(key);
        else
            state.on.add(key);
        return true;
    }
    if (type === 'pick' && control.hasAttribute('data-rm-pick')) {
        const key = String(control.getAttribute('data-rm-pick') || '').trim();
        if (!key || key === state.picked)
            return false;
        state.picked = key;
        return true;
    }
    if (type === 'roll' && control.hasAttribute('data-rm-roll')) {
        const options = rollOptions(state).filter(key => key !== state.picked);
        if (!options.length)
            return false;
        state.picked = options[randomBelow(options.length)];
        return true;
    }
    if (type === 'pager') {
        const total = state.pages.length;
        let next = state.index;
        if (control.hasAttribute('data-rm-goto'))
            next = Math.round(finite(control.getAttribute('data-rm-goto'), state.index - 1 + (state.indexBase ?? 1))) + 1 - (state.indexBase ?? 1);
        else if (control.hasAttribute('data-rm-next'))
            next = state.index + 1;
        else if (control.hasAttribute('data-rm-prev'))
            next = state.index - 1;
        return turnPage(state, next, total);
    }
    if (type === 'connect' && control.hasAttribute('data-rm-end')) {
        if (state.paired.has(control))
            return false;
        group.removeAttribute('data-rm-miss');
        if (!state.armed) {
            state.armed = control;
            return true;
        }
        if (state.armed === control) {
            state.armed = null;
            return true;
        }
        const armed = state.armed;
        state.armed = null;
        const key = String(armed.getAttribute('data-rm-end') || '').trim();
        if (key && key === String(control.getAttribute('data-rm-end') || '').trim()) {
            state.pairs.push([armed, control, key]);
            state.paired.add(armed);
            state.paired.add(control);
        }
        else
            group.setAttribute('data-rm-miss', 'true');
        return true;
    }
    if (type === 'turn' && control.hasAttribute('data-rm-knob')) {
        if (Date.now() < (state.suppressClickUntil || 0))
            return false;
        stepTurn(state, 1);
        return true;
    }
    if (type === 'sequence' && control.hasAttribute('data-rm-code')) {
        const key = String(control.getAttribute('data-rm-code') || '').trim();
        if (!key || group.getAttribute('data-rm-match') === 'true' || group.getAttribute('data-rm-done') === 'true')
            return false;
        group.removeAttribute('data-rm-miss');
        state.entered.push(key);
        state.pressed.add(control);
        if (state.answer.length && !state.entered.every((item, index) => state.answer[index] === item)) {
            state.entered = [];
            state.pressed = new Set();
            group.setAttribute('data-rm-miss', 'true');
        }
        return true;
    }
    return false;
}
function turnPage(state, next, total = state.pages.length) {
    if (!total)
        return false;
    const target = state.loop ? mod(next - 1, total) + 1 : Math.min(Math.max(1, next), total);
    if (target === state.index)
        return false;
    state.index = target;
    return true;
}
function linesLayer(state) {
    if (state.lines?.isConnected && state.group.contains(state.lines))
        return state.lines;
    const svg = state.group.ownerDocument.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('data-rm-lines', '');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:5;';
    try {
        if (state.group.ownerDocument.defaultView?.getComputedStyle?.(state.group)?.position === 'static')
            style(state, state.group, 'position', 'relative');
    }
    catch { }
    state.group.appendChild(svg);
    state.lines = svg;
    return svg;
}
function drawLines(state) {
    if (!state.pairs.length) {
        state.lines?.remove();
        state.lines = null;
        return;
    }
    const svg = linesLayer(state);
    while (svg.firstChild)
        svg.firstChild.remove();
    const box = state.group.getBoundingClientRect();
    const sx = box.width ? state.group.offsetWidth / box.width : 1;
    const sy = box.height ? state.group.offsetHeight / box.height : 1;
    const centre = node => {
        const rect = node.getBoundingClientRect();
        return [(rect.left + rect.width / 2 - box.left) * sx - state.group.clientLeft, (rect.top + rect.height / 2 - box.top) * sy - state.group.clientTop];
    };
    for (const [a, b, key] of state.pairs) {
        const [x1, y1] = centre(a), [x2, y2] = centre(b);
        const line = svg.ownerDocument.createElementNS(SVG_NS, 'line');
        for (const [name, value] of [['x1', x1], ['y1', y1], ['x2', x2], ['y2', y2]])
            line.setAttribute(name, value.toFixed(1));
        line.setAttribute('stroke', 'currentColor');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('data-rm-line', key);
        svg.appendChild(line);
    }
}
function syncState(state) {
    const { group, type } = state;
    if (type === 'toggle') {
        const tokens = [...state.on];
        const bridges = toggleCssBridges(state);
        const written = bridges && tokens.length ? [...new Set([...tokens, ...bridges.aliases])] : tokens;
        if (written.length)
            group.setAttribute('data-rm-on', written.join(' '));
        else
            group.removeAttribute('data-rm-on');
        if (bridges)
            for (const { node, word } of bridges.outside)
                setBridgedCssWord(node, group, word, tokens.length > 0);
        const controls = own(group, '[data-rm-toggle]');
        const single = new Set(controls.map(node => behaviorToggleKey(node.getAttribute('data-rm-toggle'))));
        const groupOn = single.size <= 1 ? tokens.length > 0 : false;
        mirrorBehaviorState(state.root, group, groupOn);
        if (!controls.length && group.getAttribute('role') === 'button')
            group.setAttribute('aria-pressed', String(groupOn));
        for (const remote of state.remotes || [])
            remote.setAttribute('aria-pressed', String(tokens.length > 0));
        const program = toggleAttributeProgram(state);
        if (program) {
            if (tokens.length > 0) {
                if (group.getAttribute(program.attr) !== program.value)
                    group.setAttribute(program.attr, program.value);
                group.setAttribute(PROGRAM_ATTR, `${program.attr}=${program.value}`);
            }
            else {
                if (program.original === null)
                    group.removeAttribute(program.attr);
                else if (group.getAttribute(program.attr) !== program.original)
                    group.setAttribute(program.attr, program.original);
                group.removeAttribute(PROGRAM_ATTR);
            }
        }
        if (single.size <= 1)
            for (const node of own(group, '[class]').slice(0, 40)) {
                if (!node.hasAttribute('data-rm-toggle') && !node.hasAttribute('data-rm-show'))
                    mirrorBehaviorState(state.root, node, groupOn);
            }
        for (const control of controls) {
            const on = state.on.has(behaviorToggleKey(control.getAttribute('data-rm-toggle')));
            control.setAttribute('aria-pressed', String(on));
            setFlag(control, 'data-rm-active', on);
            mark(state, control, on, ['data-rm-on', 'data-rm-active', 'aria-pressed', 'data-rm-show']);
            mirrorStateUp(state, control, 'data-rm-active', '[data-rm-toggle]');
        }
    }
    else if (type === 'pick' || type === 'roll') {
        if (state.picked)
            group.setAttribute('data-rm-picked', state.picked);
        else
            group.removeAttribute('data-rm-picked');
        const pickAttr = String(group.getAttribute('data-rm-pick-attr') || '');
        const validAttr = /^(?:data-(?!rm-|rabbit)[\w-]+|aria-[\w-]+)$/.test(pickAttr);
        if (validAttr && state.picked && group.getAttribute(pickAttr) !== state.picked)
            group.setAttribute(pickAttr, state.picked);
        for (const control of own(group, '[data-rm-pick]')) {
            const on = Boolean(state.picked) && String(control.getAttribute('data-rm-pick') || '').trim() === state.picked;
            control.setAttribute('aria-pressed', String(on));
            setFlag(control, 'data-rm-active', on);
            mark(state, control, on, ['data-rm-active', 'aria-pressed', 'data-rm-picked', validAttr ? pickAttr : '']);
            mirrorStateUp(state, control, 'data-rm-active', '[data-rm-pick]');
        }
    }
    else if (type === 'pager') {
        const total = state.pages.length;
        group.setAttribute('data-rm-index', String(state.index - 1 + (state.indexBase ?? 1)));
        style(state, group, '--rm-index', String(state.index));
        style(state, group, '--rm-pages', String(total));
        syncNumberMirror(state, state.index);
        state.pages.forEach((page, offset) => {
            const current = offset + 1 === state.index;
            setBehaviorNodeVisible(page, current);
            setFlag(page, 'data-rm-current', current);
            mirrorBehaviorState(state.root, page, current);
        });
        for (const control of [...own(group, '[data-rm-prev], [data-rm-next], [data-rm-goto]'), ...pagerOutsideControls(group)]) {
            if (control.hasAttribute('data-rm-goto')) {
                const on = Math.round(finite(control.getAttribute('data-rm-goto'), -1)) + 1 - (state.indexBase ?? 1) === state.index;
                control.setAttribute('aria-pressed', String(on));
                setFlag(control, 'data-rm-active', on);
                mark(state, control, on, ['data-rm-active', 'aria-pressed', 'data-rm-index']);
                continue;
            }
            const edge = !state.loop && (control.hasAttribute('data-rm-next') ? state.index >= total : state.index <= 1);
            if (edge) {
                control.setAttribute('aria-disabled', 'true');
                control.setAttribute('data-rm-edge', '');
            }
            else if (control.hasAttribute('data-rm-edge')) {
                control.removeAttribute('aria-disabled');
                control.removeAttribute('data-rm-edge');
            }
        }
    }
    else if (type === 'connect') {
        for (const end of own(group, '[data-rm-end]')) {
            setFlag(end, 'data-rm-paired', state.paired.has(end));
            setFlag(end, 'data-rm-armed', state.armed === end);
            mirrorBehaviorState(state.root, end, state.paired.has(end) || state.armed === end);
            if (!behaviorCssMentions(state.root, ['data-rm-armed'])) {
                if (state.armed === end) {
                    style(state, end, 'outline', '2px dashed currentColor');
                    style(state, end, 'outline-offset', '3px');
                    end.setAttribute(FEEDBACK_ATTR, '');
                }
                else {
                    unstyle(state, end, ['outline', 'outline-offset']);
                    end.removeAttribute(FEEDBACK_ATTR);
                }
            }
        }
        const counts = new Map();
        for (const end of own(group, '[data-rm-end]')) {
            const key = String(end.getAttribute('data-rm-end') || '').trim();
            if (key)
                counts.set(key, (counts.get(key) || 0) + 1);
        }
        const needed = [...counts.values()].filter(value => value > 1).reduce((sum, value) => sum + Math.floor(value / 2), 0);
        style(state, group, '--rm-count', String(state.pairs.length));
        syncNumberMirror(state, state.pairs.length);
        setFlag(group, 'data-rm-done', needed > 0 && state.pairs.length >= needed);
        drawLines(state);
    }
    else if (type === 'turn') {
        const angle = mod(state.angle, 360);
        if (state.stops)
            state.stopIndex = mod(Math.round(state.angle / (360 / state.stops)), state.stops);
        style(state, state.knob, 'rotate', `${(state.baseRotation + state.angle).toFixed(1)}deg`);
        if (state.angle)
            group.setAttribute('data-rm-angle-turned', state.angle.toFixed(1));
        else
            group.removeAttribute('data-rm-angle-turned');
        style(state, group, '--rm-angle', `${angle.toFixed(1)}deg`);
        style(state, group, '--rm-p', String((angle / 360).toFixed(4)));
        state.progress = angle / 360;
        if (state.stops)
            group.setAttribute('data-rm-index', String(state.stopIndex));
        else
            group.removeAttribute('data-rm-index');
        if (state.stops)
            syncNumberMirror(state, state.stopIndex);
        const answer = String(group.getAttribute('data-rm-answer') || '').trim();
        if (answer !== '' && state.stops)
            setFlag(group, 'data-rm-match', Number(answer) === state.stopIndex);
    }
    else if (type === 'sequence') {
        const keys = own(group, '[data-rm-code]');
        if (state.entered.length)
            group.setAttribute('data-rm-seq', state.entered.join(' '));
        else
            group.removeAttribute('data-rm-seq');
        style(state, group, '--rm-count', String(state.entered.length));
        syncNumberMirror(state, state.entered.length);
        if (state.answer.length)
            setFlag(group, 'data-rm-match', state.entered.length === state.answer.length && state.entered.every((item, index) => state.answer[index] === item));
        else
            setFlag(group, 'data-rm-done', keys.length > 0 && keys.every(key => state.pressed.has(key)));
        for (const key of keys) {
            const on = state.pressed.has(key);
            setFlag(key, 'data-rm-done', on);
            key.setAttribute('aria-pressed', String(on));
            mark(state, key, on, ['data-rm-done', 'aria-pressed', 'data-rm-seq']);
        }
    }
}
function startSwipe(binding, state, event) {
    binding.swipe = { state, id: event.pointerId, x: event.clientX, y: event.clientY };
}
function finishSwipe(binding, event, cancelled = false) {
    const swipe = binding.swipe;
    if (!swipe || (event.pointerId != null && swipe.id !== event.pointerId))
        return;
    binding.swipe = null;
    if (cancelled || !binding.root.contains(swipe.state.group))
        return;
    const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5)
        return;
    if (turnPage(swipe.state, swipe.state.index + (dx < 0 ? 1 : -1)))
        swipe.state.changed = true;
    refreshResults(swipe.state);
}
function pointerAngle(session, event) {
    return Math.atan2(event.clientY - session.cy, event.clientX - session.cx) * 180 / Math.PI;
}
function localPoint(surface, event) {
    const rect = surface.getBoundingClientRect();
    const sx = surface.clientWidth > 0 && rect.width > 0 ? surface.clientWidth / rect.width : 1;
    const sy = surface.clientHeight > 0 && rect.height > 0 ? surface.clientHeight / rect.height : 1;
    return { x: clamp(event.clientX - rect.left, 0, rect.width) * sx, y: clamp(event.clientY - rect.top, 0, rect.height) * sy, width: rect.width * sx, sx, sy };
}
const MOVED_ATTR = 'data-rm-moved';
const STROKE_ATTR = 'data-rm-stroke';
const ORDER_ATTR = 'data-rm-order-index';
function clearStaleDragPosition(item) {
    const value = item.style.getPropertyValue('translate');
    if (item.hasAttribute(MOVED_ATTR) || /^calc\([^)]*px\)\s+calc\([^)]*px\)$/i.test(value.trim()))
        item.style.removeProperty('translate');
    item.removeAttribute(MOVED_ATTR);
}
function isStaleStroke(path) {
    if (path.hasAttribute(STROKE_ATTR))
        return true;
    return path.getAttribute('fill') === 'none' && path.getAttribute('stroke') === 'currentColor'
        && path.getAttribute('stroke-width') === '2' && path.getAttribute('stroke-linecap') === 'round'
        && path.getAttribute('pointer-events') === 'none';
}
function restoreStaleOrder(items) {
    for (const parent of new Set(items.map(item => item.parentElement).filter(Boolean))) {
        const children = [...parent.children];
        const marked = children.filter(node => node.hasAttribute(ORDER_ATTR));
        if (!marked.length) {
            children.forEach((node, index) => node.setAttribute(ORDER_ATTR, String(index)));
            continue;
        }
        const sorted = [...marked].sort((a, b) => Number(a.getAttribute(ORDER_ATTR)) - Number(b.getAttribute(ORDER_ATTR)));
        if (sorted.every((node, index) => node === marked[index]))
            continue;
        const slots = marked.map(() => parent.ownerDocument.createComment('rm-order'));
        for (let i = 0; i < marked.length; i++)
            parent.insertBefore(slots[i], marked[i]);
        for (let i = 0; i < sorted.length; i++)
            slots[i].replaceWith(sorted[i]);
    }
}
function moveItem(state, item, x, y) {
    let position = state.positions.get(item);
    if (!position) {
        const raw = item.ownerDocument.defaultView?.getComputedStyle?.(item)?.translate || item.style.getPropertyValue('translate');
        const base = raw && raw !== 'none' ? raw.trim().split(/\s+/) : [];
        position = { x: 0, y: 0, base: [base[0] || '0px', base[1] || '0px'] };
        state.positions.set(item, position);
    }
    position.x = x;
    position.y = y;
    style(state, item, 'translate', `calc(${position.base[0]} + ${x}px) calc(${position.base[1]} + ${y}px)`);
    item.setAttribute(MOVED_ATTR, 'true');
}
function matchingSlot(state, item) {
    const key = item.getAttribute('data-rm-item');
    const slots = own(state.group, '[data-rm-slot]').filter(node => key && node.getAttribute('data-rm-slot') === key);
    return slots.length === 1 ? slots[0] : null;
}
function slotShowsOwnResult(slot, item) {
    const key = String(item.getAttribute('data-rm-item') || '').trim();
    return [...slot.querySelectorAll('[data-rm-show]')].some(node => behaviorShowTokens(node).some(token => token === key || token === 'placed'));
}
function restoreItemStyle(state, item, property) {
    if (property === 'translate')
        item.removeAttribute(MOVED_ATTR);
    const saved = state.styles.get(item)?.get(property);
    if (!saved)
        return;
    if (saved[0])
        item.style.setProperty(property, saved[0], saved[1] || '');
    else
        item.style.removeProperty(property);
    state.styles.get(item).delete(property);
}
function placeItem(state, item, slot) {
    if (slotShowsOwnResult(slot, item)) {
        restoreItemStyle(state, item, 'translate');
        state.positions.delete(item);
        style(state, item, 'opacity', '0.55');
        item.setAttribute('data-rm-placed', 'true');
        state.placed.add(item);
        state.changed = true;
        return;
    }
    const box = slot.getBoundingClientRect(), current = item.getBoundingClientRect();
    const groupBox = state.group.getBoundingClientRect();
    const sx = groupBox.width ? state.group.clientWidth / groupBox.width : 1;
    const sy = groupBox.height ? state.group.clientHeight / groupBox.height : 1;
    const position = state.positions.get(item) || { x: 0, y: 0 };
    moveItem(state, item, position.x + (box.left + box.width / 2 - current.left - current.width / 2) * sx, position.y + (box.top + box.height / 2 - current.top - current.height / 2) * sy);
    state.placed.add(item);
    state.changed = true;
}
function dragButton(state, item, button) {
    if (button.hasAttribute('data-rm-place')) {
        const slot = matchingSlot(state, item);
        if (!slot)
            return false;
        placeItem(state, item, slot);
        return true;
    }
    if (button.hasAttribute('data-rm-return')) {
        if (!state.positions.has(item) && !state.placed.has(item))
            return false;
        restoreItemStyle(state, item, 'translate');
        restoreItemStyle(state, item, 'opacity');
        item.removeAttribute('data-rm-placed');
        state.positions.delete(item);
        state.placed.delete(item);
        return true;
    }
    const delta = { left: [-20, 0], right: [20, 0], up: [0, -20], down: [0, 20] }[button.getAttribute('data-rm-move')];
    if (!delta)
        return false;
    const position = state.positions.get(item) || { x: 0, y: 0 };
    moveItem(state, item, position.x + delta[0], position.y + delta[1]);
    state.placed.delete(item);
    return true;
}
function drawPoint(session, event) {
    const svg = session.surface;
    const matrix = svg.getScreenCTM?.();
    let x, y;
    if (matrix && svg.createSVGPoint) {
        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        const local = point.matrixTransform(matrix.inverse());
        x = local.x;
        y = local.y;
    }
    else {
        const rect = svg.getBoundingClientRect(), view = svg.viewBox?.baseVal;
        x = (event.clientX - rect.left) / Math.max(1, rect.width) * (view?.width || rect.width) + (view?.x || 0);
        y = (event.clientY - rect.top) / Math.max(1, rect.height) * (view?.height || rect.height) + (view?.y || 0);
    }
    if (!Number.isFinite(x) || !Number.isFinite(y) || session.points >= 8000)
        return;
    session.pathData += `${session.points++ ? ' L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
    session.path.setAttribute('d', session.pathData);
}
function pointerMove(binding, event) {
    const session = binding.pointer;
    if (!session || session.id !== event.pointerId)
        return;
    const { state, surface, item } = session;
    if (!binding.root.contains(state.group)) {
        finishPointer(binding, event, true);
        return;
    }
    if (state.type === 'drag' || state.type === 'reorder') {
        moveItem(state, item, session.x + (event.clientX - session.startX) * session.sx, session.y + (event.clientY - session.startY) * session.sy);
        if (event.clientX !== session.startX || event.clientY !== session.startY) {
            state.changed = true;
            state.placed.delete(item);
            if (item.hasAttribute('data-rm-placed')) {
                restoreItemStyle(state, item, 'opacity');
                item.removeAttribute('data-rm-placed');
            }
        }
    }
    else if (state.type === 'draw') {
        drawPoint(session, event);
        if (session.points > 1)
            state.changed = true;
    }
    else if (state.type === 'reveal') {
        const point = localPoint(surface, event);
        reveal(state, point.x / Math.max(1, point.width));
        state.changed = true;
    }
    else if (state.type === 'follow') {
        const point = localPoint(surface, event);
        style(state, state.group, '--rm-x', `${point.x}px`);
        style(state, state.group, '--rm-y', `${point.y}px`);
        state.changed = true;
    }
    else if (state.type === 'swipe') {
        extraPointerMove(state, event, session);
        if (session.horizontal)
            state.changed = true;
    }
    else if (state.type === 'turn') {
        const angle = pointerAngle(session, event);
        const delta = mod(angle - session.last + 180, 360) - 180;
        session.last = angle;
        if (Number.isFinite(delta) && Math.hypot(event.clientX - session.cx, event.clientY - session.cy) > 4) {
            session.turned += Math.abs(delta);
            state.angle += delta;
            if (session.turned > 3)
                state.changed = true;
        }
    }
    refreshResults(state);
    if (event.cancelable)
        event.preventDefault();
}
function finishPointer(binding, event, cancelled = false) {
    const session = binding.pointer;
    if (!session || (event.pointerId != null && session.id !== event.pointerId))
        return;
    binding.pointer = null;
    const { state, item, surface } = session;
    if (state.type === 'hold') {
        setHoldActive(state, null, false);
        binding.holds.delete(state);
    }
    if (state.type === 'rhythm')
        extraHoldEnd(state);
    if (state.type === 'swipe') {
        if (extraPointerUp(state, event, session, cancelled))
            state.changed = true;
    }
    if (state.type === 'turn') {
        if (cancelled)
            state.angle = session.angleBefore;
        else if (session.turned > 3) {
            snapTurn(state);
            state.suppressClickUntil = Date.now() + 450;
        }
    }
    if (item && cancelled) {
        moveItem(state, item, session.x, session.y);
        state.changed = session.changedBefore;
        if (session.wasPlaced) {
            state.placed.add(item);
            const slot = matchingSlot(state, item);
            if (slot && slotShowsOwnResult(slot, item) && !item.hasAttribute('data-rm-placed')) {
                style(state, item, 'opacity', '0.55');
                item.setAttribute('data-rm-placed', 'true');
            }
        }
    }
    if (item && !cancelled && state.type === 'drag') {
        const slot = matchingSlot(state, item);
        if (slot) {
            const box = slot.getBoundingClientRect();
            if (event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom)
                placeItem(state, item, slot);
        }
    }
    if (item && state.type === 'reorder') {
        if (!cancelled) {
            const target = own(state.group, '[data-rm-item]').find(node => {
                if (node === item || node.parentElement !== item.parentElement)
                    return false;
                const rect = node.getBoundingClientRect();
                return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
            });
            if (target) {
                const box = target.getBoundingClientRect(), origin = session.box;
                const horizontal = Math.abs(box.left - origin.left) > Math.abs(box.top - origin.top);
                const after = horizontal ? event.clientX > box.left + box.width / 2 : event.clientY > box.top + box.height / 2;
                item.parentElement.insertBefore(item, after ? target.nextSibling : target);
                state.changed = true;
            }
        }
        moveItem(state, item, session.x, session.y);
    }
    refreshResults(state);
    try {
        surface.releasePointerCapture?.(session.id);
    }
    catch { }
}
const HOLD_CLASS_ATTR = 'data-rm-hold-class';
const HOLD_HOLDER_ATTR = 'data-rm-hold-holder';
function setHoldActive(state, button, on) {
    const needles = ['data-rm-active', 'data-rm-show'];
    if (state.ancestorClass === undefined) {
        try {
            state.ancestorClass = holdAncestorStateClass(state.root, state.group);
        }
        catch {
            state.ancestorClass = '';
        }
    }
    if (state.activeHolders === undefined) {
        try {
            state.activeHolders = holdAncestorActiveHolders(state.root, state.group);
        }
        catch {
            state.activeHolders = [];
        }
    }
    for (const holder of state.activeHolders) {
        if (on && !holder.hasAttribute('data-rm-active')) {
            holder.setAttribute('data-rm-active', 'true');
            holder.setAttribute(HOLD_HOLDER_ATTR, 'true');
        }
        else if (!on && holder.hasAttribute(HOLD_HOLDER_ATTR)) {
            holder.removeAttribute('data-rm-active');
            holder.removeAttribute(HOLD_HOLDER_ATTR);
        }
    }
    if (on) {
        state.group.setAttribute('data-rm-active', 'true');
        mirrorBehaviorState(state.root, state.group, true);
        if (state.ancestorClass && !state.group.classList.contains(state.ancestorClass)) {
            state.group.classList.add(state.ancestorClass);
            state.group.setAttribute(HOLD_CLASS_ATTR, state.ancestorClass);
        }
        if (button?.matches?.('[data-rm-hold]')) {
            button.setAttribute('data-rm-active', 'true');
            mark(state, button, true, needles);
        }
        return;
    }
    state.group.removeAttribute('data-rm-active');
    mirrorBehaviorState(state.root, state.group, false);
    const added = state.group.getAttribute(HOLD_CLASS_ATTR);
    if (added) {
        state.group.classList.remove(added);
        state.group.removeAttribute(HOLD_CLASS_ATTR);
    }
    for (const node of state.group.querySelectorAll('[data-rm-hold]')) {
        node.removeAttribute('data-rm-active');
        mark(state, node, false, needles);
    }
}
function pointerDown(binding, event) {
    if (binding.pointer || event.isPrimary === false || (event.button != null && event.button !== 0))
        return;
    const state = stateFor(binding.root, event.target);
    if (!state)
        return;
    const { group, type } = state;
    let item, surface;
    if (type === 'hold')
        surface = event.target.closest('[data-rm-hold]');
    else if (type === 'turn')
        surface = event.target.closest('[data-rm-knob]');
    else if (type === 'rhythm')
        surface = event.target.closest('[data-rm-charge]');
    else if (type === 'swipe')
        surface = event.target.closest('[data-rm-card]');
    else {
        if (event.target.closest('button, input, textarea, select, a'))
            return;
        if (type === 'pager') {
            const interactive = event.target.closest('label, summary, [role="button"], [data-rm-prev], [data-rm-next], [data-rm-goto]');
            if ((!interactive || !group.contains(interactive)) && state.pages.length > 1)
                startSwipe(binding, state, event);
            return;
        }
        if (type === 'drag' || type === 'reorder') {
            surface = item = event.target.closest('[data-rm-item]');
            if (event.pointerType === 'touch' && usesMobileInteractionButtons(binding.root, item))
                return;
        }
        else if (type === 'draw')
            surface = event.target.closest('svg[data-rm-canvas]');
        else if (type === 'follow')
            surface = event.target.closest('[data-rm-surface]');
        else if (type === 'reveal' && !first(group, 'input[type="range"]'))
            surface = first(group, '[data-rm-surface]') || group;
    }
    if (!surface || ownerGroup(surface) !== group || ((type === 'hold' || type === 'turn' || type === 'rhythm') && !isControl(surface)))
        return;
    const point = localPoint(group, event), position = state.positions.get(item);
    const session = { state, surface, item, changedBefore: state.changed, wasPlaced: state.placed.has(item), id: event.pointerId, startX: event.clientX, startY: event.clientY, x: position?.x || 0, y: position?.y || 0, sx: point.sx, sy: point.sy, box: item?.getBoundingClientRect() };
    binding.pointer = session;
    if (type === 'swipe' && !extraPointerDown(state, event, session)) {
        binding.pointer = null;
        return;
    }
    if (type === 'rhythm') {
        extraHoldStart(state, surface);
        state.changed = true;
        refreshResults(state);
    }
    if (type === 'draw') {
        session.path = surface.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
        session.path.setAttribute('fill', 'none');
        session.path.setAttribute('stroke', 'currentColor');
        session.path.setAttribute('stroke-width', '2');
        session.path.setAttribute('stroke-linecap', 'round');
        session.path.setAttribute('pointer-events', 'none');
        session.path.setAttribute(STROKE_ATTR, 'true');
        session.points = 0;
        session.pathData = '';
        state.strokes.add(session.path);
        surface.appendChild(session.path);
    }
    if (type === 'turn') {
        const rect = surface.getBoundingClientRect();
        session.cx = rect.left + rect.width / 2;
        session.cy = rect.top + rect.height / 2;
        session.last = pointerAngle(session, event);
        session.turned = 0;
        session.angleBefore = state.angle;
    }
    if (type === 'hold') {
        const verify = beginVerify(state, surface);
        setHoldActive(state, surface, true);
        binding.holds.add(state);
        state.changed = true;
        refreshResults(state);
        verify?.();
    }
    try {
        surface.setPointerCapture?.(event.pointerId);
    }
    catch { }
    pointerMove(binding, event);
}
const RELEASED_ATTR = 'data-rm-released';
const STATE_ATTRS = ['data-rm-on', 'data-rm-picked', 'data-rm-index', 'data-rm-active', 'data-rm-match', 'data-rm-miss', 'data-rm-done', 'data-rm-seq', 'data-rm-angle-turned',
    'data-rm-seconds', 'data-rm-swiped-left', 'data-rm-swiped-right', 'data-rm-peeking', 'data-rm-orientation', 'data-rm-scheme', 'data-rm-width', 'data-rm-pointer', 'data-rm-recalled'];
export function behaviorInlineBaselines(root) {
    const records = [];
    if (!root?.querySelectorAll)
        return records;
    const groups = [root, ...root.querySelectorAll(GROUP)].filter(node => node.matches?.(GROUP));
    for (const group of groups) {
        const state = owners.get(group)?.groups?.get(group);
        if (!state?.styles)
            continue;
        for (const [element, saved] of state.styles) {
            if (!element?.isConnected || !root.contains(element))
                continue;
            for (const [property, [value, priority]] of saved)
                records.push({ element, property, value, priority });
        }
    }
    return records;
}
export function releaseBehaviorGroup(root, group) {
    if (!group?.matches?.(GROUP))
        return false;
    const type = group.getAttribute('data-rm-ui');
    const binding = roots.get(root);
    const state = binding?.groups.get(group);
    if (state) {
        if (binding.pointer?.state === state)
            finishPointer(binding, {}, true);
        binding.holds.delete(state);
        binding.connects.delete(state);
        if (EXTRA.has(state.type))
            destroyExtra(state);
        try {
            reset(state);
        }
        catch (error) {
            console.debug('[RabbitMirror] release reset failed:', error);
        }
        binding.groups.delete(group);
    }
    owners.delete(group);
    for (const node of [group, ...group.querySelectorAll('*')]) {
        if (node !== group && node.matches?.(GROUP))
            continue;
        if (node.hasAttribute?.('data-rm-result-active')) {
            setBehaviorNodeVisible(node, true);
            node.removeAttribute('data-rm-result-active');
            node.removeAttribute('data-rm-result-display');
            node.removeAttribute('data-rm-result-display-priority');
        }
        clearForcedActive(node);
        if (node.hasAttribute?.('data-rm-mirrored'))
            mirrorBehaviorState(state?.root || root, node, false);
        if (node.hasAttribute?.(FEEDBACK_ATTR)) {
            node.style.removeProperty('outline');
            node.style.removeProperty('outline-offset');
            node.removeAttribute(FEEDBACK_ATTR);
        }
        for (const name of ['data-rm-current', 'data-rm-paired', 'data-rm-armed', 'data-rm-edge'])
            node.removeAttribute?.(name);
    }
    for (const svg of group.querySelectorAll('svg[data-rm-lines]'))
        svg.remove();
    if (state?.adopted?.isConnected) {
        const node = state.adopted;
        for (const name of ['data-rm-result-active', 'data-rm-result-display', 'data-rm-result-display-priority', 'hidden'])
            node.removeAttribute(name);
        node.style.setProperty('display', 'none');
    }
    for (const node of state?.doneAdopted || []) {
        if (!node?.isConnected)
            continue;
        for (const name of ['data-rm-show', 'data-rm-result-active', 'data-rm-result-display', 'data-rm-result-display-priority', 'hidden'])
            node.removeAttribute(name);
        node.style.removeProperty('display');
    }
    if (state)
        restoreStateUp(state);
    restoreNumberMirror(state);
    try {
        releaseStateCarriers(state?.root || root, group);
    }
    catch { }
    if (group.hasAttribute(PROGRAM_ATTR))
        clearProgramMark(group);
    if (state?.attrProgram) {
        if (state.attrProgram.original === null)
            group.removeAttribute(state.attrProgram.attr);
        else
            group.setAttribute(state.attrProgram.attr, state.attrProgram.original);
    }
    for (const name of STATE_ATTRS)
        group.removeAttribute(name);
    group.setAttribute(RELEASED_ATTR, type || 'unknown');
    group.removeAttribute('data-rm-ui');
    return true;
}
function genericControl(root, target) {
    const control = target?.closest?.(CONTROL_SELECTOR);
    if (!control || !isControl(control))
        return null;
    const state = stateFor(root, control);
    if (!state || ownerGroup(control) !== state.group)
        return null;
    if (!control.hasAttribute('data-rm-reset') && !(TYPE_CONTROLS[state.type] || []).some(name => control.hasAttribute(`data-rm-${name}`)))
        return null;
    return { state, control };
}
function containerToggle(root, target) {
    const state = stateFor(root, target);
    if (state?.type !== 'toggle' || own(state.group, '[data-rm-toggle]').length)
        return null;
    const interactive = target.closest?.('a[href], button, input, textarea, select, label, summary, [role="button"], [popover]');
    if (interactive && interactive !== state.group && state.group.contains(interactive))
        return null;
    return state;
}
const RELAY_CONTROL = 'button, [role="button"], label, summary, a, [data-rm-item], [data-rm-step]';
function looksLikeControl(target) {
    if (!target?.closest)
        return false;
    const node = target.closest(RELAY_CONTROL);
    if (node)
        return node;
    let cursor = '';
    try {
        cursor = target.ownerDocument?.defaultView?.getComputedStyle?.(target)?.cursor || '';
    }
    catch { }
    return cursor === 'pointer' ? target : false;
}
function scheduleOnDemandRelay(root, target) {
    const state = stateFor(root, target);
    if (!state || !looksLikeControl(target))
        return;
    if ((state.type === 'drag' || state.type === 'reorder') && target.closest?.('[data-rm-item]')
        && !target.closest?.('button, [role="button"]'))
        return;
    if (state.type === 'swipe' && target.closest?.('[data-rm-card]') && !target.closest?.('button, [role="button"]'))
        return;
    relayGroupLater(root, state.group, target.closest?.('button, [role="button"]') || null);
}
function relayGroupLater(root, group, control = null) {
    const run = () => {
        if (!group.isConnected || !root.isConnected)
            return;
        void import('./behaviorRelay.js?rmv=1.99.15').then(module => module.relayBehaviorGroupOnDemand(root, group, control)).catch(() => { });
    };
    const idle = globalThis.requestIdleCallback;
    if (typeof idle === 'function')
        idle(run, { timeout: 800 });
    else
        setTimeout(run, 120);
}
export function installBehaviorInteractions(root) {
    try {
        applyRememberedReversePatches(root);
    }
    catch { }
    try {
        repairBehaviorDeclarations(root);
    }
    catch (error) {
        console.debug('[RabbitMirror] behavior repair skipped:', error);
    }
    try {
        applyRememberedBehaviorRelay(root);
    }
    catch { }
    if (!root?.addEventListener)
        return 0;
    try {
        installSiblingStateBridge(root);
    }
    catch { }
    const existing = roots.get(root);
    const binding = existing || { root, groups: new WeakMap(), pointer: null, swipe: null, holds: new Set(), connects: new Set() };
    roots.set(root, binding);
    const groups = [...root.querySelectorAll(GROUP)];
    if (root.matches?.(GROUP))
        groups.unshift(root);
    const count = groups.filter(group => !binding.groups.has(group) && prepare(binding, group)).length;
    for (const group of groups) {
        const state = binding.groups.get(group);
        if (state?.type === 'connect')
            binding.connects.add(state);
    }
    try {
        unwindStaleBridges(root);
    }
    catch { }
    for (const group of groups)
        if (!binding.groups.has(group) && group.hasAttribute(PROGRAM_ATTR))
            clearProgramMark(group);
    if (existing)
        return count;
    root.addEventListener('input', event => { const state = stateFor(root, event.target); if (state)
        inputChange(state, event.target, true); });
    root.addEventListener('click', event => {
        const button = event.target.closest?.('button, input[type="button"]');
        if (button && hasMobileInteractionControl(root, button)
            && !button.matches('[data-rm-place], [data-rm-return], [data-rm-move], [data-rm-prev], [data-rm-next]'))
            return;
        if (hasBehaviorInteractionControl(root, button)) {
            const state = stateFor(root, button);
            if (state && button.hasAttribute('data-rm-reset') && binding.pointer?.state === state)
                finishPointer(binding, {}, true);
            if (!button.hasAttribute('popovertarget'))
                event.preventDefault();
            action(state, button);
            return;
        }
        if (button) {
            scheduleOnDemandRelay(root, button);
            return;
        }
        const found = genericControl(root, event.target);
        if (found) {
            if (found.control.matches('label') && event.target !== found.control && event.target.matches?.('input'))
                return;
            if (found.control.hasAttribute('data-rm-reset') && binding.pointer?.state === found.state)
                finishPointer(binding, {}, true);
            if (!found.control.matches('label'))
                event.preventDefault();
            action(found.state, found.control);
            return;
        }
        const toggle = containerToggle(root, event.target);
        if (toggle) {
            action(toggle, toggle.group);
            return;
        }
        scheduleOnDemandRelay(root, event.target);
    });
    root.addEventListener('pointerdown', event => pointerDown(binding, event));
    root.addEventListener('contextmenu', event => {
        const hold = event.target?.closest?.('[data-rm-hold]');
        if (hold && stateFor(root, hold)?.type === 'hold')
            event.preventDefault();
    });
    root.addEventListener('pointermove', event => pointerMove(binding, event));
    root.addEventListener('pointerup', event => { finishPointer(binding, event); finishSwipe(binding, event); });
    root.addEventListener('pointercancel', event => { finishPointer(binding, event, true); finishSwipe(binding, event, true); });
    root.addEventListener('lostpointercapture', event => finishPointer(binding, event, true));
    root.addEventListener('keydown', event => {
        const state = stateFor(root, event.target);
        if (state?.type === 'hold' && event.target.matches('[data-rm-hold]') && [' ', 'Enter'].includes(event.key)) {
            event.preventDefault();
            setHoldActive(state, event.target, true);
            binding.holds.add(state);
            state.changed = true;
            refreshResults(state);
        }
        else if (state?.type === 'turn' && event.target.matches('[data-rm-knob]') && /^Arrow(?:Up|Down|Left|Right)$/.test(event.key)) {
            event.preventDefault();
            stepTurn(state, /Up|Right/.test(event.key) ? 1 : -1);
            state.changed = true;
            refreshResults(state);
        }
        else if ([' ', 'Enter'].includes(event.key) && !isNative(event.target)) {
            const found = genericControl(root, event.target);
            const target = found?.control === event.target ? found : (containerToggle(root, event.target) && event.target.matches(GROUP) ? { state: stateFor(root, event.target), control: event.target } : null);
            if (target && !target.control.matches('[data-rm-hold]')) {
                event.preventDefault();
                action(target.state, target.control);
            }
        }
        if (event.key === 'Escape' && binding.pointer)
            finishPointer(binding, event, true);
    });
    const releaseHold = event => {
        const state = stateFor(root, event.target);
        if (state?.type === 'hold' && (event.type === 'focusout' || [' ', 'Enter'].includes(event.key))) {
            setHoldActive(state, null, false);
            binding.holds.delete(state);
            refreshResults(state);
        }
    };
    root.addEventListener('keyup', releaseHold);
    root.addEventListener('focusout', releaseHold);
    root.addEventListener('toggle', event => {
        const changed = event.target;
        if (!changed?.matches?.('details') || !root.contains(changed))
            return;
        if (changed.open) {
            for (const state of binding.connects)
                if (changed.contains(state.group) && root.contains(state.group))
                    drawLines(state);
            return;
        }
        if (binding.pointer && changed.contains(binding.pointer.state.group))
            finishPointer(binding, {}, true);
        for (const state of binding.holds) {
            if (!changed.contains(state.group))
                continue;
            setHoldActive(state, null, false);
            refreshResults(state);
            binding.holds.delete(state);
        }
    }, true);
    return count;
}
configureBehaviorExtras({ own, first, style, unstyle, setFlag, enableControl, refreshResults, finite, clamp, words, cssIndexBase });
let carryChatKeyReader = null;
configureCarryChatKey(() => carryChatKeyReader?.() || '');
import('../storage.js?rmv=1.99.15').then(module => { carryChatKeyReader = () => module.getCurrentChatKey?.() || ''; }).catch(() => { });
