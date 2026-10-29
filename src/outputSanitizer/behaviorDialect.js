import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=1.100.0";
import { behaviorShowTokens, ownBehaviorShows } from './behaviorResults.js?rmv=1.100.0';
import { behaviorStyleText } from './behaviorStateMirror.js?rmv=1.100.0';
import { collectStateCarriers, setBridgedState } from './behaviorStateBridge.js?rmv=1.100.0';
import { ownBehaviorNodes, behaviorOwnerGroup, TYPE_CONTROLS } from './behaviorOwner.js?rmv=1.100.0';
export const BEHAVIOR_DIALECTS = Object.freeze([
    { id: 'accumulate-count', label: __rmT("H10CigIqluDrTxgJYjSdYCYRZ8j6sS3Z"), note: __rmT("uHFhda0S5YqWbNYqjVk.mNS.N7UM79S7VaASNJIc2lJq4qOGVNbA35OvdCFWezkC") },
    { id: 'rhythm-charge', label: __rmT("hZrUI4sNz.6TmbxwKewsqfpA8vr0AHzwzuE"), note: __rmT("h9yDCUjUH1zhYDO0L0wOu5mDVXu.DFPJQbnehJK.URhERyVw5uqA35OveNfLYZkC") },
    { id: 'remote-toggle', label: __rmT("gt_UkoxvF8NalAMmgy3Lo3wef8nZ_f"), note: __rmT("nPu5.LlLobnFQBaP6GIhPkxMqRFc_oyxbBs9Kqjb1u61u18yb2twCky8OJfbyBNUWUE") },
    { id: 'remote-motion', label: __rmT("ZymmzWHo88.CaQFNJ_j44bsdiBODmmrvHuYnaXEo"), note: __rmT("v6u0M.0DRkWBGq2An4.3brf8J3qDTrYGAbJtxJeshXlRbygEvlEr9cMWvpTHQWnk_rFTfMq6VDY1NefIO7Lh9bLu3JHYObtVpQ1mKtrTJCSo.k") },
    { id: 'motion-progress', label: __rmT("QdpcHk.b7MBrx5EBoqqje6CsJj46snyX"), note: __rmT("6Ec4z6J0CbTynewUDXBhi0NWVSYGjt1oNRkEOuq47FV8Avg.K2gUx28NMVobLfPioz0dJhdv.4bAcGfX0h3ZyxLK029RWEUhLxJytzykGW0TjA3el3sPa6Zw_tu94Ls8fTG1qao.1FT") },
    { id: 'motion-numeric', label: __rmT("OtH.Q3KzUCLy4wXFlsKrfajTRD1mjf"), note: __rmT("2CxPf_ddEk15RT7YEbmdfAITC22tMkVbRFDdezR9yzAhpeg6Wep5rc66l1yLK_f0EZlla9MQhwQDdZ.gpvSeOKJZOZgT_.yhITZjCbNpO8_ifCLSm_xk.OCe8ik") },
    { id: 'named-single-toggle', label: __rmT("oAnDP4WOYRyipNvFCRhLzOwvvPvaiy0xG9IHevZGc9YqJE3jmqxSKI4y"), note: __rmT("YGGO0aRLq9ftmM4h61sOZxeGMxZPUIs2") },
    { id: 'turn-prefixed-stops', label: __rmT("IeHbaRb.XKKSPcVa0RVrwsI8oRF1MYYDZ8WGKjrNBd8Ux3MnOVNsd8EPbsETFoeMfGQqUzKsj.Y"), note: __rmT("bf5.ux5WJly.vttyzRiNXXRibYS4vtJAAQggf7WvmceDmFyvVVM8un5eAgCkZNZUx5PNnqzp7CkvfIbD4JvOqR6IK5GsZUkeANA") },
    { id: 'motion-equalizer', label: __rmT("SNo7vOlHVp.MOizabTYiW0kQUiK1zKDxwj5VPJMFuj3sCmumFED"), note: __rmT("ImfKAUUNNkdBdViZbgyWJsM.XHtemAtquBQR9D4rDdV.4E7Z1b1D869KsLfs7JZLgtonlzuR1CJURcfpEpioXqH1hDPeTJBsTGXTVlX3SsfiBCa_jPGqzk1rbymopJ.eWfJOvT") },
    { id: 'effect-any-show', label: __rmT("_72lf02nRmacan6ycwnWc.3rVrMwmLoZID5kqlMOdvqhE3LvfV66unKBAgUdgiPscU1zV0wSQIhl4xy.dsWVw8JMRairP2TZ1OB"), note: __rmT("VmCFMreJBZBAhUmbdmiINK3ezKOvfGGhxp05_Y.alHcKOpqyEjz3TvQI0Z5lJJyM.NQpAU4X9NaEbBEWFnmZhpte2g1ITf9WbaTIYaeZc0oYkffPi419f2JFtb.p7RDr") },
    { id: 'before-words', label: __rmT("1hd6JxE5l5W7dqUVwwHYfUBi1PMn8oVQYwPQTWdtkGmKgee0aPbevl1HjvUQaYX0x5CtrCaRD.POlH.MWKGnxK2XXtdb49Mf33K2hSOxoqH74T"), note: __rmT("ONyEXRUjny6it79y80D.oay3VIzbxqhfMBcqFpuO._GC_EvyUGH7kWnikuRdQzDhHVdRqm154FPYbRQN0MUdRShSutvyL4qiCqBrzCe179s") },
    { id: 'answer-words', label: __rmT("4X554ql8vpAeGYhdLlYScEwk6DTSnUvmPQ0sHpTOAFnGbuLa3veA_PPnPZF6Nu0H6fEC9mFv0yQiucBuOUT1GzIJ9qeJWt9N"), note: __rmT("2khSg1zFNd6DAIf_uOQJMd8xvowZPVNs.bafP6WSo5GCvGzXLEPV8eZuQyrLoC4hpSMEHhXBKgOPj8n6voPiHcGFWlbOtqAXe9lY8lH2swB7BkAZJ3PSBxNufuLiWI3zEtcLVYFIB18ZNavyhihKFziZ.WPGEZH.XJsDcGMROLrCrPnv69FsrT") },
    { id: 'author-status-attr', label: __rmT("GlzrnGX52OAnQnj7IZSTIW9TzhhHVnoeZ381S7zXnLsQH6apbNArajIbbwfrRvS_pFgl_ieppVOP8xBKmE9IjT9zKdCrFYzwbCoPZTmh8i7_9bDwuMChMf"), note: __rmT("0L_z3e7_qTP9oIm7OSB71TDfes5ncPbQDcacMWHxbh6QH3zFTnyQ9OnD1Wl87bO07CxJzpoPQ1IgFvzBF0hXju_zZmdmxvo9lPGKt_W_lPQZBtrmJ3ngikxLZGcCibpz6E2oh1FNx675Hs284jOOp50BU_4yGu5fzsbWQd7wQ2Y_8v_fpmCbbB26XYTsK4LjQjxinAbwEYHap54fRgQ7DX1tnArecy3A11cFSEOX") },
    { id: 'range-as-cover', label: __rmT("iQPhoIwxraER6JJpMmvRCKGeDPAmbbxWprC9DEPQ42ZUkk"), note: __rmT("NWvr4uLwBK1sHqnvPu5ITEgsV4MwufrM_bjFo6UwdKkBgeFYbnDZt_Lpw._9uT") },
    { id: 'author-css-show', label: __rmT("u3YBJTAL2dhFOjgHlYbBoFONImAGbxC4IGXQH7KP4VjRjj2paDC.ZSLgbSHa63jRR.wrAk"), note: __rmT("tITcR2RudDNNBedQk8DKKFHzkqW5sX9GC_5pw3vGRjzxmk0ldVt62dK8TozV3101zamUtBBadUCON5BFcaDooGiWmDh4Q1u1JSPY4d7zQPk5ad8HDvcj4b2Z32Egp3BjmLb6YU_W6t9WfmFXDSOn1k") },
    { id: 'state-carrier', label: __rmT("GKe1lPTuXHNgOVPpg.EhV.vw_wpUcGbQbyZTTUyRJy_"), note: __rmT("e6jatHP69ab1maaW1fI84IyK0TbUOVgeVVkAdfbvNqP0NDeG6fz6LlM8hrPbZf1BsGvMayaMEdF.sQGIUwzbccfTT7I5UQZoA68wWyouo5eipemVeElDSjVNZFYjUhnTtE2QezPPGWECFLm3T_owDJaQYD5wMRY2Tbt3T01A0M8h59DRrSHs8tjcwT3zc206DKY4I60g82Ua96JyI2nLlLAi4LQzafZrtBSBq7CVyvsPgKyZJsV7H6cFtsbpxM6jb8hIjbS.9aVsRNMY6UcLN_hsi2fT5EydBW65_.MqRLrduwBzl4duxVo43Z7brR2a_uFSYYZdS8xdEqPv05_iMP4nOz1XCVKaPwEN7wBP.Amn10CoillvdFMOXx0J_S.C8P1JXcbcmfYplvfHuH3yiVU4.cN.U_Watk4U9EGBp9bI.X5iYP6KZYF8REa3WCz4PjFjVh") },
    { id: 'css-state-word', label: __rmT("epM6EvnrctHPl.HYrsJjzdq4n7nuNJ4qYGjfICoGM9YJJiSGQv_kiWZk"), note: __rmT("9P3zs.Z2tOqm.hlypDpW.A9pOVSmRCqXn9RzSNPsPDwNywseY2BMuHWfIovgbZvx8Zh9bYkJs9_mQJBaB4Plxp_jdjsuSIAyXc2kXao2CXJjvhaNNPFRIrZlFJTIen02AGMf2Tn.7mTlgBRFrnZ79OeDIfzDmlHVmVDdMQOVLPu.DyQUtQFxPtk9ksZrWgOU7VdjPH.hmDuo1aOmQVrJzaxjcDK3wRnvJ4A71VFGyVNHbkjJ2HD.I0v2PKAXheie_l3pKrTNNzlmB8rp37xWX3RqwMgXxYqPYfIJTCuk24DeewI5HOjUzo1VFl9T5_zBBnWdIk1uAo2OFzjQ_dBYC.lygOKmK4dAlt4hu3p2vozOYveAcqaF4zatfhYPFFhh1gEOAFyz") },
]);
const GROUP = '[data-rm-ui]';
const FACE_TOOL_UI = '[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-diagnostic-panel]';
const own = ownBehaviorNodes;
export const behaviorToggleKey = value => {
    const key = String(value ?? '').trim();
    return !key || /^(?:true|yes)$/i.test(key) ? 'on' : key;
};
export function faceScopeOf(node) {
    let scope = node?.closest?.('details') || null;
    for (let outer = scope?.parentElement?.closest?.('details'); outer; outer = outer.parentElement?.closest?.('details'))
        scope = outer;
    return scope || node?.parentElement || null;
}
export function remoteToggleGroup(root, target) {
    const control = target?.closest?.('[data-rm-toggle]');
    if (!control || control.closest(GROUP) || !root?.querySelectorAll)
        return null;
    const scope = control.closest('details') || root;
    const toggles = [...scope.querySelectorAll('[data-rm-ui="toggle"]')].filter(node => root.contains(node));
    return toggles.length === 1 ? toggles[0] : null;
}
export function motionOutsideControls(group) {
    const empty = { buttons: [], ranges: [] };
    if (group?.getAttribute?.('data-rm-ui') !== 'motion')
        return empty;
    const scope = faceScopeOf(group);
    if (!scope?.querySelectorAll)
        return empty;
    if ([...scope.querySelectorAll('[data-rm-ui="motion"]')].length !== 1)
        return empty;
    const taken = node => [...(node.attributes || [])].some(attribute => /^on[a-z]+$/i.test(attribute.name) || /^data-rabbit-mirror-.*(?:rescue|program)/.test(attribute.name))
        || node.closest('[data-rm-released], [data-rm-mobile-controls]');
    const outside = selector => [...scope.querySelectorAll(selector)].filter(node => !node.closest(GROUP) && !node.closest(FACE_TOOL_UI) && !taken(node));
    const buttons = own(group, '[data-rm-play], [data-rm-reverse]').length ? [] : outside('button[data-rm-play], button[data-rm-reverse]');
    const ranges = own(group, 'input[type="range"]').length ? [] : outside('input[type="range"]');
    return { buttons, ranges: ranges.length === 1 ? ranges : [] };
}
export function remoteMotionGroup(root, target) {
    const control = target?.closest?.('button[data-rm-play], button[data-rm-reverse], input[type="range"]');
    if (!control || control.closest(GROUP) || !root?.querySelectorAll)
        return null;
    const scope = faceScopeOf(control);
    const motions = scope ? [...scope.querySelectorAll('[data-rm-ui="motion"]')].filter(node => root.contains(node)) : [];
    if (motions.length !== 1)
        return null;
    const { buttons, ranges } = motionOutsideControls(motions[0]);
    return buttons.includes(control) || ranges.includes(control) ? motions[0] : null;
}
export function pagerOutsideControls(group) {
    if (group?.getAttribute?.('data-rm-ui') !== 'pager')
        return [];
    const scope = group.closest('details');
    if (!scope || [...scope.querySelectorAll('[data-rm-ui="pager"]')].filter(n => n.closest('details') === scope).length !== 1)
        return [];
    return [...scope.querySelectorAll('[data-rm-prev], [data-rm-next], [data-rm-goto]')].filter(node => {
        if (group.contains(node) || node.closest('details') !== scope || node.closest(FACE_TOOL_UI + ', [data-rm-released], [data-rm-mobile-controls]'))
            return false;
        const near = node.closest(GROUP);
        if (near && near.getAttribute('data-rm-ui') !== 'pick')
            return false;
        const owner = behaviorOwnerGroup(node);
        if (owner && (node.hasAttribute('data-rm-reset')
            || (TYPE_CONTROLS[owner.getAttribute('data-rm-ui')] || []).some(name => node.hasAttribute(`data-rm-${name}`))))
            return false;
        return ![...node.attributes].some(a => /^on[a-z]+$/i.test(a.name) || /^data-rabbit-mirror-.*(?:rescue|program)/.test(a.name));
    });
}
export function remotePagerGroup(root, target) {
    const control = target?.closest?.('[data-rm-prev], [data-rm-next], [data-rm-goto]');
    const scope = control?.closest('details');
    if (!scope || !root?.contains(control))
        return null;
    const pagers = [...scope.querySelectorAll('[data-rm-ui="pager"]')].filter(n => n.closest('details') === scope && root.contains(n));
    return pagers.length === 1 && pagerOutsideControls(pagers[0]).includes(control) ? pagers[0] : null;
}
const MOTION_NUMERIC = new Set(['left', 'right', 'top', 'bottom', 'width', 'height']);
export function motionNumericProperties(part) {
    const found = [];
    const inline = part?.style;
    for (let index = 0; index < (inline?.length || 0); index += 1) {
        const property = inline[index];
        if (property.startsWith('--rm-') || (!property.startsWith('--') && !MOTION_NUMERIC.has(property)))
            continue;
        if (/^(-?\d*\.?\d+)(%|px)?$/.test(String(inline.getPropertyValue(property)).trim()))
            found.push(property);
    }
    return found;
}
const equalized = new WeakSet();
export function motionEqualizerAnimations(group, parts) {
    if (!group || equalized.has(group))
        return 0;
    equalized.add(group);
    let count = 0;
    for (const part of parts || []) {
        const bars = [...part.children].filter(child => {
            const rect = child.getBoundingClientRect?.();
            return rect && rect.width > 0 && rect.width <= 14 && rect.height >= rect.width && !child.getAnimations?.().length;
        });
        if (bars.length < 3 || bars.length !== part.children.length || typeof bars[0].animate !== 'function')
            continue;
        bars.forEach((bar, index) => {
            const lift = 0.35 + ((index * 37) % 60) / 100;
            const animation = bar.animate([
                { transform: 'scaleY(1)' }, { transform: `scaleY(${(1 + lift).toFixed(2)})` }, { transform: `scaleY(${(1 - lift / 2).toFixed(2)})` },
            ], { duration: 900 + (index % 4) * 150, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
            bar.style.setProperty('transform-origin', 'bottom');
            animation.pause();
            animation.currentTime = 0;
            count += 1;
        });
    }
    if (count)
        group.setAttribute('data-rm-motion-equalizer', 'true');
    return count;
}
function prefixedNumbers(group) {
    const numbered = new Map();
    for (const node of ownBehaviorShows(group))
        for (const token of behaviorShowTokens(node)) {
            const match = /^!?([a-z_-]*[a-z_-])(\d{1,2})$/i.exec(token);
            if (!match)
                continue;
            const list = numbered.get(match[1]) || [];
            list.push(Number(match[2]));
            numbered.set(match[1], list);
        }
    return numbered;
}
function toggleNames(group, remotes = []) {
    return new Set([...own(group, '[data-rm-toggle]'), ...remotes].map(control => behaviorToggleKey(control.getAttribute('data-rm-toggle'))));
}
function remoteTogglesOf(group) {
    const scope = group.closest?.('details');
    if (!scope)
        return [];
    const toggles = [...scope.querySelectorAll('[data-rm-ui="toggle"]')];
    if (toggles.length !== 1 || toggles[0] !== group)
        return [];
    return [...scope.querySelectorAll('[data-rm-toggle]')].filter(node => !node.closest(GROUP));
}
const BEFORE_WORDS = new Set(['initial', 'init', 'before', 'idle', 'pending', 'original', 'unfired', 'unrevealed', 'hidden', 'covered',
    'locked', 'sealed', 'closed', 'waiting', 'unchanged']);
const DONE_WORDS = ['complete', 'completed', 'finish', 'finished', 'filled', 'cleared', 'accomplished'];
const MATCH_WORDS = ['answer', 'answered', 'correct', 'right', 'solved', 'unlocked', 'success', 'pass', 'passed', 'win'];
const MISS_WORDS = ['wrong', 'incorrect', 'error', 'fail', 'failed', 'mistake', 'lose'];
const tokensOf = group => new Set(ownBehaviorShows(group).flatMap(node => behaviorShowTokens(node)).map(token => token.replace(/^!/, '')).filter(Boolean));
const beforeTypes = new Set(['effect', 'reveal']);
function beforeStage(state) {
    if (state.type === 'effect')
        return !state.changed;
    if (state.type === 'reveal')
        return (state.progress || 0) < 0.9;
    return false;
}
export function addDialectStateKeys(state, keys) {
    const { group } = state;
    if (beforeTypes.has(state.type)) {
        const before = beforeStage(state);
        for (const token of tokensOf(group)) {
            if (BEFORE_WORDS.has(token.toLowerCase())) {
                if (before)
                    keys.add(token);
                else
                    keys.delete(token);
            }
        }
    }
    if (state.type === 'effect' && state.changed) {
        for (const node of ownBehaviorShows(group))
            for (const token of behaviorShowTokens(node)) {
                const key = token.replace(/^!/, '');
                if (key && !COMMON_KEYS.includes(key) && !BEFORE_WORDS.has(key.toLowerCase()))
                    keys.add(key);
            }
    }
    if (group?.hasAttribute?.('data-rm-answer')) {
        const words = group.getAttribute('data-rm-match') === 'true' ? MATCH_WORDS : group.getAttribute('data-rm-miss') === 'true' ? MISS_WORDS : [];
        for (const word of words)
            keys.add(word);
    }
    if (state.type === 'toggle' && state.on?.size && !keys.has('on')) {
        const named = toggleNames(group, state.remotes || []);
        if (named.size === 1 && !named.has('on') && state.on.has([...named][0])) {
            keys.add('on');
            keys.add('true');
        }
    }
    if (state.type === 'accumulate') {
        const steps = own(group, '[data-rm-step]');
        if (!steps.some(node => /^\d+$/.test(String(node.getAttribute('data-rm-step') || '').trim())))
            keys.add(String(steps.filter(node => node.getAttribute('data-rm-done') === 'true').length));
    }
    if (state.type === 'rhythm' && own(group, '[data-rm-charge]').length && state.chargeDone)
        keys.add('charge');
    if (state.type === 'turn' && state.stops) {
        for (const [prefix, numbers] of prefixedNumbers(group)) {
            const oneBased = Math.min(...numbers) === 1 && Math.max(...numbers) === state.stops;
            keys.add(`${prefix}${state.stopIndex + (oneBased ? 1 : 0)}`);
        }
    }
    if (keys.has('done'))
        for (const word of DONE_WORDS)
            keys.add(word);
    return keys;
}
const STATE_ATTR_NEEDLES = ['data-rm-index', 'data-rm-on', 'data-rm-picked', 'data-rm-active', 'data-rm-done', 'data-rm-match', 'data-rm-angle', 'data-rm-seq', '--rm-'];
const DISPLAY_RULE = /\b(?:display|visibility|opacity|max-height|height|clip-path|transform)\s*:/i;
const STATE_IN_SELECTOR = /data-rm-(?:index|on|picked|active|done|match|angle|seq|armed|turned)|--rm-/;
function cssShowsToken(text, token) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`([^{}]*\\[data-rm-show\\s*=\\s*(?:"${escaped}"|'${escaped}'|${escaped})\\s*\\][^{}]*)\\{([^}]*)\\}`, 'g');
    for (const match of text.matchAll(pattern))
        if (STATE_IN_SELECTOR.test(match[1]) && DISPLAY_RULE.test(match[2]))
            return true;
    return false;
}
export function authorManagedShows(root, group) {
    const managed = new Set();
    const reachable = reachableBehaviorKeys(group);
    if (!reachable)
        return managed;
    let text = null;
    for (const node of ownBehaviorShows(group)) {
        const tokens = behaviorShowTokens(node).map(token => token.replace(/^!/, '')).filter(Boolean);
        if (!tokens.length || tokens.some(token => reachable.has(token)))
            continue;
        if (text === null) {
            text = behaviorStyleText(root);
            if (!STATE_ATTR_NEEDLES.some(needle => text.includes(needle)))
                return managed;
        }
        if (tokens.some(token => cssShowsToken(text, token)))
            managed.add(node);
    }
    return managed;
}
const ON_RULE = /\[data-rm-on\s*[~*|^$]?=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+))\s*\]([^,{]*)/g;
const onWordCache = new WeakMap();
function cssOnWords(root) {
    const text = behaviorStyleText(root);
    const cached = onWordCache.get(root);
    if (cached?.text === text)
        return cached.words;
    const words = new Map();
    for (const match of text.matchAll(ON_RULE)) {
        const word = String(match[1] ?? match[2] ?? match[3] ?? '').trim();
        const rest = String(match[4] || '');
        if (!word || /\s/.test(word) || !/^\s*>?\s*[.#\[a-z*]/i.test(rest) || !/^\s/.test(rest) && !rest.startsWith('>'))
            continue;
        const selector = rest.replace(/::?[a-z-]+(?:\([^)]*\))?/gi, '').replace(/^\s*>?\s*/, '').trim();
        if (!selector || /^[+~]/.test(selector))
            continue;
        if (!words.has(word))
            words.set(word, new Set());
        words.get(word).add(selector);
    }
    onWordCache.set(root, { text, words });
    return words;
}
function cssWordTargets(root, selectors) {
    const out = [];
    for (const selector of selectors || []) {
        try {
            out.push(...root.querySelectorAll(selector));
        }
        catch { }
    }
    return out;
}
function toggleKeysOf(group, remotes = []) {
    const keys = toggleNames(group, remotes);
    if (group.hasAttribute('data-rm-toggle'))
        keys.add(behaviorToggleKey(group.getAttribute('data-rm-toggle')));
    if (!keys.size)
        keys.add('on');
    return keys;
}
function wordsNamedBy(group) {
    const named = new Set(behaviorShowTokens(group).map(token => token.replace(/^!/, '')).filter(Boolean));
    for (const key of toggleKeysOf(group))
        named.add(key);
    return named;
}
export function toggleCssBridges(state) {
    if (state.cssBridges !== undefined)
        return state.cssBridges;
    state.cssBridges = null;
    const { group, root } = state;
    if (group?.getAttribute?.('data-rm-ui') !== 'toggle' || !root?.querySelectorAll)
        return null;
    const words = cssOnWords(root);
    if (!words.size)
        return null;
    const keys = toggleKeysOf(group, state.remotes || []);
    if ([...keys].some(key => words.has(key)))
        return null;
    const scope = faceScopeOf(group) || root;
    const others = [...scope.querySelectorAll('[data-rm-ui="toggle"]')].filter(node => node !== group && root.contains(node));
    const claimed = new Set();
    for (const other of others)
        for (const word of wordsNamedBy(other))
            if (words.has(word))
                claimed.add(word);
    const result = { aliases: new Set(), outside: [] };
    for (const word of wordsNamedBy(group)) {
        if (!words.has(word))
            continue;
        const targets = cssWordTargets(root, words.get(word)).filter(node => node !== group);
        if (!targets.length)
            continue;
        if (targets.some(node => group.contains(node))) {
            result.aliases.add(word);
            continue;
        }
        let holder = group.parentElement;
        while (holder && holder !== root && !targets.every(node => holder.contains(node)))
            holder = holder.parentElement;
        if (!holder || !targets.every(node => holder.contains(node)) || holder.hasAttribute('data-rm-ui'))
            continue;
        result.outside.push({ node: holder, word });
    }
    if (!result.aliases.size && !result.outside.length) {
        const inside = [...words.keys()].filter(word => !claimed.has(word)
            && cssWordTargets(root, words.get(word)).some(node => node !== group && group.contains(node)));
        if (inside.length === 1)
            result.aliases.add(inside[0]);
    }
    state.cssBridges = result.aliases.size || result.outside.length ? result : null;
    return state.cssBridges;
}
const wordOwners = new WeakMap();
export function setBridgedCssWord(node, owner, word, on) {
    if (!node?.setAttribute || !owner)
        return;
    if (!wordOwners.has(owner))
        wordOwners.set(owner, { group: owner, channel: 'css-state-word' });
    setBridgedState(node, wordOwners.get(owner), 'data-rm-on', on ? word : null);
}
const STATUS_RULE = /\[(data-rm-(?:status|state))\s*[~*|^$]?=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+))\s*\]/g;
const statusCache = new WeakMap();
export function authorStatusWords(root) {
    const text = behaviorStyleText(root);
    const cached = statusCache.get(root);
    if (cached?.text === text)
        return cached.words;
    const words = new Map();
    const listAttrs = new Set();
    for (const match of text.matchAll(STATUS_RULE)) {
        const word = String(match[2] ?? match[3] ?? match[4] ?? '').trim();
        if (!word || /\s/.test(word))
            continue;
        if (!words.has(match[1]))
            words.set(match[1], new Set());
        words.get(match[1]).add(word);
        if (match[0].includes('~='))
            listAttrs.add(match[1]);
    }
    words.listAttrs = listAttrs;
    statusCache.set(root, { text, words });
    return words;
}
const statusOriginal = new WeakMap();
export function syncAuthorStatusAttrs(state, keys) {
    const { group, root } = state;
    if (!group?.setAttribute || !root)
        return;
    const words = authorStatusWords(root);
    if (!words.size)
        return;
    if (!statusOriginal.has(group))
        statusOriginal.set(group, Object.fromEntries([...words.keys()].map(name => [name, group.getAttribute(name)])));
    const original = statusOriginal.get(group);
    for (const [name, list] of words) {
        if (state.attrProgram?.attr === name || String(group.getAttribute('data-rm-program') || '').startsWith(`${name}=`))
            continue;
        const hit = [...list].filter(word => keys.has(word));
        const value = hit.length ? (words.listAttrs?.has(name) ? hit.join(' ') : hit[hit.length - 1]) : original[name];
        if (value === null || value === undefined) {
            if (group.hasAttribute(name))
                group.removeAttribute(name);
        }
        else if (group.getAttribute(name) !== value)
            group.setAttribute(name, value);
    }
}
const COMMON_KEYS = ['changed', 'active', 'match', 'done', 'miss', 'placed'];
const CONTROL_ATTRS = ['reset', 'fire', 'play', 'reverse', 'prev', 'next', 'step', 'place', 'return', 'move', 'toggle', 'pick', 'goto', 'roll', 'end', 'code', 'knob', 'seek', 'left', 'right', 'tap', 'charge', 'qte', 'peek', 'spoiler'];
const KNOWN_PART_ATTRS = new Set([...CONTROL_ATTRS, 'ui', 'part', 'show', 'item', 'slot', 'page', 'cover', 'canvas', 'surface', 'hold', 'result', 'when',
    'answer', 'stops', 'index', 'on', 'picked', 'active', 'done', 'match', 'miss', 'feedback', 'seq', 'armed', 'face', 'key', 'value', 'target',
    'card', 'at', 'clock', 'duration', 'memory', 'recall', 'axis', 'manual', 'window', 'count', 'zone', 'period', 'keep', 'sticky', 'swiped', 'swiped-left', 'swiped-right', 'seen', 'revealed', 'seconds']);
const RUNTIME_ATTR = /^data-rm-(?:[a-z-]*-(?:wired|active|done|verified|patched|rescued)$|orphan|mobile|result|draw|title|body|behavior|labeled|reveal|vs|angle|knob-base|released|image|avatar|face-|stage|hydrated|pseudo|touch|external|reversible|click|checked|exclusive|polish|press|texture|bingo|bridged|program)/;
const values = (group, attr) => own(group, `[${attr}]`).map(node => String(node.getAttribute(attr) || '').trim()).filter(Boolean);
export const STEP_RANGE_TYPES = new Set(['motion', 'adjust', 'reveal', 'view', 'follow']);
export const STEP_RANGE_PREFIXES = ['', 'p', 'step', 's', 'page', 'part', 'ch', 'chapter', 'seg', 'track'];
export function reachableBehaviorKeys(group) {
    const type = group?.getAttribute?.('data-rm-ui');
    const keys = new Set([...COMMON_KEYS, ...DONE_WORDS]);
    if (group?.hasAttribute?.('data-rm-recall'))
        return null;
    switch (type) {
        case 'roll': return null;
        case 'toggle': {
            const names = toggleNames(group, remoteTogglesOf(group));
            names.add('on');
            String(group.getAttribute('data-rm-on') || '').split(__rmR("yomYAOXSe3NI061Ham4.HT", "")).filter(Boolean).forEach(key => names.add(behaviorToggleKey(key)));
            names.forEach(key => keys.add(key));
            keys.add('true');
            break;
        }
        case 'pick':
            values(group, 'data-rm-pick').forEach(key => keys.add(key));
            break;
        case 'pager': {
            const pages = [...group.querySelectorAll('[data-rm-page]')].filter(node => (node.matches(GROUP) ? node.parentElement?.closest(GROUP) : node.closest(GROUP)) === group);
            pages.forEach((page, index) => { keys.add(String(index + 1)); const name = String(page.getAttribute('data-rm-page') || '').trim(); if (name)
                keys.add(name); });
            break;
        }
        case 'turn': {
            const stops = Math.round(Number(group.getAttribute('data-rm-stops')) || 0);
            if (stops >= 2 && stops <= 72) {
                for (let index = 0; index < stops; index += 1)
                    keys.add(String(index));
                for (const [prefix, numbers] of prefixedNumbers(group)) {
                    const oneBased = Math.min(...numbers) === 1 && Math.max(...numbers) === stops;
                    for (let index = 0; index < stops; index += 1)
                        keys.add(`${prefix}${index + (oneBased ? 1 : 0)}`);
                }
            }
            break;
        }
        case 'reveal':
            ['reveal', 'revealed', 'full', 'open'].forEach(key => keys.add(key));
            tokensOf(group).forEach(key => { if (BEFORE_WORDS.has(key.toLowerCase()))
                keys.add(key); });
            break;
        case 'slide': {
            const items = own(group, '[data-rm-item]');
            items.forEach((item, index) => { keys.add(String(index + 1)); const name = String(item.getAttribute('data-rm-item') || '').trim(); if (name) {
                keys.add(name);
                keys.add(`${name}:seen`);
            } });
            break;
        }
        case 'timer':
            own(group, '[data-rm-at][data-rm-show]').forEach(node => behaviorShowTokens(node).forEach(token => keys.add(token.replace(/^!/, ''))));
            keys.add('running');
            break;
        case 'swipe':
            ['left', 'right'].forEach(key => keys.add(key));
            values(group, 'data-rm-card').forEach(key => { keys.add(key); keys.add(`${key}:left`); keys.add(`${key}:right`); keys.add(`${key}:top`); });
            break;
        case 'peek':
            keys.add('peek');
            values(group, 'data-rm-peek').forEach(key => keys.add(key));
            break;
        case 'spoiler':
            keys.add('revealed');
            values(group, 'data-rm-spoiler').forEach(key => keys.add(key));
            break;
        case 'sense':
            ['landscape', 'portrait', 'dark', 'light', 'narrow', 'wide', 'touch', 'mouse'].forEach(key => keys.add(key));
            break;
        case 'rhythm':
            if (own(group, '[data-rm-charge]').length)
                keys.add('charge');
            break;
        case 'effect':
            for (const node of ownBehaviorShows(group))
                for (const token of behaviorShowTokens(node))
                    keys.add(token.replace(/^!/, ''));
            break;
        case 'sequence':
            values(group, 'data-rm-code').forEach(key => keys.add(key));
            break;
        case 'input': {
            const answer = String(group.getAttribute('data-rm-answer') || '').trim();
            if (answer) {
                keys.add(answer);
                answer.split(__rmR("yomYAOXSe3NI061Ham4.HT", "")).filter(Boolean).forEach(word => keys.add(word));
            }
            break;
        }
        case 'accumulate': {
            const names = values(group, 'data-rm-step');
            names.forEach(key => keys.add(key));
            if (!names.some(key => /^\d+$/.test(key)))
                for (let n = 0; n <= own(group, '[data-rm-step]').length; n += 1)
                    keys.add(String(n));
            break;
        }
        case 'connect':
            values(group, 'data-rm-end').forEach(key => keys.add(key));
            break;
        case 'drag':
        case 'reorder':
            values(group, 'data-rm-item').forEach(key => keys.add(key));
            break;
        default: break;
    }
    if (group.hasAttribute('data-rm-answer'))
        [...MATCH_WORDS, ...MISS_WORDS].forEach(key => keys.add(key));
    const range = STEP_RANGE_TYPES.has(type) ? (own(group, 'input[type="range"]')[0] || (type === 'motion' ? motionOutsideControls(group).ranges[0] : null)) : null;
    if (range && range.step !== 'any') {
        const min = range.min === '' ? 0 : Number(range.min);
        const max = range.max === '' ? 100 : Number(range.max);
        const step = range.step === '' || range.step === 'any' ? 1 : Number(range.step);
        if ([min, max, step].every(Number.isFinite) && Number.isInteger(min) && Number.isInteger(step) && step > 0 && max - min <= 20 * step) {
            for (let value = min; value <= max; value += step)
                for (const prefix of STEP_RANGE_PREFIXES)
                    keys.add(`${prefix}${value}`);
        }
    }
    return keys;
}
function controlName(node) {
    const attr = CONTROL_ATTRS.find(name => node.hasAttribute(`data-rm-${name}`));
    const length = String(node.textContent || '').replace(/\s+/g, ' ').trim().length;
    return `${attr ? `data-rm-${attr}` : node.tagName.toLowerCase()}${length ? `${__rmT("sPyUSMH6")}${length}${__rmT("Yvk")}` : ''}`;
}
function authoredAnimations(group) {
    return (group.getAnimations?.({ subtree: true }) || []).filter(animation => typeof animation?.transitionProperty !== 'string' && animation?.id !== 'rm-motion');
}
function motionCanMove(root, group) {
    try {
        if (typeof group.getAnimations === 'function' && authoredAnimations(group).length)
            return true;
    }
    catch { }
    if (own(group, '[data-rm-part]').some(part => motionNumericProperties(part).length))
        return true;
    try {
        if (!group.getClientRects().length)
            return null;
    }
    catch {
        return null;
    }
    return /@keyframes|animation(?:-name)?\s*:/i.test(behaviorStyleText(root));
}
export function inspectBehaviorDialect(root) {
    const result = { unmatched: [], orphans: [], unknown: [], staticMotion: 0, dialects: [] };
    if (!root?.querySelectorAll)
        return result;
    const used = new Set();
    const groups = [...root.querySelectorAll(GROUP)].filter(group => !group.closest(FACE_TOOL_UI));
    const bridged = new Set();
    for (const group of groups) {
        if (group.getAttribute('data-rm-ui') !== 'toggle')
            continue;
        const bridges = toggleCssBridges({ group, root, remotes: remoteTogglesOf(group) });
        if (!bridges)
            continue;
        used.add('css-state-word');
        for (const word of wordsNamedBy(group))
            bridged.add(word);
        for (const word of bridges.aliases)
            bridged.add(word);
        for (const { word } of bridges.outside)
            bridged.add(word);
    }
    for (const group of groups) {
        const type = group.getAttribute('data-rm-ui');
        const reachable = reachableBehaviorKeys(group);
        const managed = authorManagedShows(root, group);
        if (managed.size)
            used.add('author-css-show');
        if (reachable) {
            for (const node of ownBehaviorShows(group))
                for (const token of managed.has(node) ? [] : behaviorShowTokens(node)) {
                    const key = token.startsWith('!') ? token.slice(1) : token;
                    if (key && !reachable.has(key) && !bridged.has(key) && !result.unmatched.some(item => item.type === type && item.token === token))
                        result.unmatched.push({ type, token });
                }
        }
        if (type === 'toggle') {
            const named = toggleNames(group, remoteTogglesOf(group));
            const shows = ownBehaviorShows(group).flatMap(node => behaviorShowTokens(node)).map(token => token.replace(/^!/, ''));
            if (named.size === 1 && !named.has('on') && shows.includes('on'))
                used.add('named-single-toggle');
            if (remoteTogglesOf(group).length && !own(group, '[data-rm-toggle]').length)
                used.add('remote-toggle');
        }
        if (type === 'accumulate' && [...tokensOf(group)].some(key => /^\d+$/.test(key)) && !values(group, 'data-rm-step').some(key => /^\d+$/.test(key)))
            used.add('accumulate-count');
        if (type === 'rhythm' && tokensOf(group).has('charge') && own(group, '[data-rm-charge]').length)
            used.add('rhythm-charge');
        if (type === 'turn' && prefixedNumbers(group).size)
            used.add('turn-prefixed-stops');
        {
            const shown = tokensOf(group);
            if (beforeTypes.has(type) && [...shown].some(token => BEFORE_WORDS.has(token.toLowerCase())))
                used.add('before-words');
            if (group.hasAttribute('data-rm-answer') && [...MATCH_WORDS, ...MISS_WORDS].some(word => shown.has(word)))
                used.add('answer-words');
            if (authorStatusWords(root).size)
                used.add('author-status-attr');
        }
        try {
            if (collectStateCarriers(root, group).length)
                used.add('state-carrier');
        }
        catch { }
        if (type === 'effect' && ownBehaviorShows(group).some(node => behaviorShowTokens(node).some(token => !COMMON_KEYS.includes(token.replace(/^!/, '')))))
            used.add('effect-any-show');
        if (type === 'reveal' && own(group, '[data-rm-cover]').some(cover => cover.matches('input, button, label') || cover.querySelector('input[type="range"]')))
            used.add('range-as-cover');
        if (type === 'motion') {
            const adopted = motionOutsideControls(group);
            if (adopted.buttons.length || adopted.ranges.length)
                used.add('remote-motion');
            if (group.getAttribute('data-rm-motion-equalizer') === 'true')
                used.add('motion-equalizer');
            const canMove = motionCanMove(root, group);
            if (canMove === false && own(group, '[data-rm-play]').length && group.querySelector('input[type="range"]'))
                used.add('motion-progress');
            else if (canMove === false)
                result.staticMotion += 1;
            else if (own(group, '[data-rm-part]').some(part => motionNumericProperties(part).length)) {
                try {
                    if (!authoredAnimations(group).length)
                        used.add('motion-numeric');
                }
                catch { }
            }
        }
        const recognized = own(group, CONTROL_ATTRS.map(name => `[data-rm-${name}]`).join(', ')).length > 0;
        for (const button of recognized ? [] : own(group, 'button, [role="button"]')) {
            const odd = [...button.attributes].map(attribute => attribute.name)
                .filter(name => name.startsWith('data-rm-') && !RUNTIME_ATTR.test(name) && !KNOWN_PART_ATTRS.has(name.slice(8)));
            for (const name of odd)
                if (!result.unknown.includes(name))
                    result.unknown.push(name);
        }
    }
    const motions = groups.filter(group => group.getAttribute('data-rm-ui') === 'motion');
    const adoptedMotion = new Set(motions.flatMap(group => { const { buttons, ranges } = motionOutsideControls(group); return [...buttons, ...ranges]; }));
    for (const node of root.querySelectorAll(CONTROL_ATTRS.map(name => `[data-rm-${name}]`).join(', '))) {
        if (node.closest(GROUP) || node.closest(FACE_TOOL_UI) || adoptedMotion.has(node) || remotePagerGroup(root, node))
            continue;
        if (node.hasAttribute('data-rm-toggle') && remoteToggleGroup(root, node))
            continue;
        result.orphans.push(controlName(node));
    }
    result.dialects = BEHAVIOR_DIALECTS.map(item => item.id).filter(id => used.has(id));
    return result;
}
export function describeBehaviorDialect(report) {
    const parts = [];
    if (report.unmatched.length)
        parts.push(`${__rmT("jDdv9TqV0FOAJ6aj0g6dHT")}${report.unmatched.map(item => `${item.type}:${item.token}`).slice(0, 8).join(' ')}`);
    if (report.orphans.length)
        parts.push(`${__rmT("HlVF0.UIT9fixGE22zRueZPTjFs")}${report.orphans.slice(0, 6).join(' ')}`);
    if (report.unknown.length)
        parts.push(`${__rmT("UmpDn_eL2GBTkX5P2zyaP7GcjFs")}${report.unknown.slice(0, 6).join(' ')}`);
    if (report.staticMotion)
        parts.push(`${__rmT("6b_VDKBqZoMUtYcOq4xSj_VdIUbRWDhdnQE")}${report.staticMotion}${__rmT("2RCk7f")}`);
    return parts.join(__rmT("7os"));
}
export function dialectLabels(ids) {
    return ids.map(id => BEHAVIOR_DIALECTS.find(item => item.id === id)?.label || id);
}
