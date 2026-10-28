import { rmR as __rmR } from "../textTable.js?rmv=1.99.8";
import { getRabbitMirrorLocalStyleElements } from './runtime.js?rmv=1.99.8';
const RESCUE_ATTR = 'data-rabbit-mirror-range-stage-rescue';
const STAGE_ATTR = 'data-rm-range-stage';
const states = new WeakMap();
const NUMBERED_CLASS_RE = /(?:^|[-_])(?:stage|step|phase|level|page|scene|part|chapter|round|layer|state|panel|slide|frame|card|leaf)[-_]?(\d{1,2})$/i;
function numberOf(element) {
    for (const name of element.classList || []) {
        const match = String(name).match(NUMBERED_CLASS_RE);
        if (match)
            return Number(match[1]);
    }
    return null;
}
function hiddenByDefault(element) {
    try {
        return getComputedStyle(element).display === 'none';
    }
    catch {
        return false;
    }
}
function findStages(input) {
    const min = Number(input.min === '' ? 0 : input.min);
    const max = Number(input.max === '' ? 100 : input.max);
    if (!Number.isInteger(min) || !Number.isInteger(max) || max - min < 1 || max - min > 12)
        return null;
    let container = input.parentElement;
    for (let depth = 0; container && depth < 4; depth += 1, container = container.parentElement) {
        if (container.matches?.('details, summary, body'))
            break;
        const byNumber = new Map();
        for (const element of container.querySelectorAll('*')) {
            if (element.contains(input))
                continue;
            const number = numberOf(element);
            if (number === null || number < min || number > max)
                continue;
            if (!byNumber.has(number))
                byNumber.set(number, []);
            byNumber.get(number).push(element);
        }
        if (byNumber.size < 2)
            continue;
        const groups = [...byNumber.values()];
        if (groups.some(list => list.length !== 1))
            return null;
        const stages = groups.map(list => list[0]);
        const parent = stages[0].parentElement;
        if (stages.some(stage => stage.parentElement !== parent))
            return null;
        if (!stages.some(hiddenByDefault))
            return null;
        return new Map(stages.map(stage => [numberOf(stage), stage]));
    }
    return null;
}
function naturalStageDisplays(stages) {
    const measured = new Map();
    for (const stage of stages.values()) {
        const inlineValue = stage.style.getPropertyValue('display');
        const inlinePriority = stage.style.getPropertyPriority('display');
        stage.style.removeProperty('display');
        let display = '';
        try {
            display = getComputedStyle(stage).display;
        }
        catch {
            display = '';
        }
        if (inlineValue)
            stage.style.setProperty('display', inlineValue, inlinePriority);
        measured.set(stage, display && display !== 'none' ? display : '');
    }
    const fallback = [...measured.values()].find(Boolean) || 'block';
    return new Map([...measured].map(([stage, display]) => [stage, display || fallback]));
}
function apply(state) {
    const value = Math.round(Number(state.input.value));
    for (const [number, stage] of state.stages) {
        if (number === value)
            stage.style.setProperty('display', state.shown?.get(stage) || 'block', 'important');
        else
            stage.style.setProperty('display', 'none', 'important');
        stage.setAttribute(STAGE_ATTR, number === value ? 'active' : 'idle');
    }
}
export function installRangeStageRescue(root) {
    if (!root?.querySelectorAll)
        return 0;
    let installed = 0;
    for (const input of root.querySelectorAll('input[type="range"]')) {
        if (states.has(input) || input.disabled || input.closest('[data-rm-ui]'))
            continue;
        if (input.hasAttribute('oninput') || input.hasAttribute('onchange') || input.hasAttribute('data-rm-state-group'))
            continue;
        const stages = findStages(input);
        if (!stages)
            continue;
        const state = { input, stages, shown: naturalStageDisplays(stages) };
        states.set(input, state);
        const update = () => apply(state);
        input.addEventListener('input', update);
        input.addEventListener('change', update);
        input.setAttribute(RESCUE_ATTR, String(stages.size));
        apply(state);
        installed += 1;
    }
    return installed;
}
const VALUE_ATTR_RESCUE = 'data-rabbit-mirror-range-value-attr-rescue';
const valueMirrors = new WeakSet();
function valueAttributeHeads(root) {
    const heads = [];
    for (const style of getRabbitMirrorLocalStyleElements(root)) {
        const css = String(style.textContent || '').replace(/\/\*[\s\S]*?\*\//g, '');
        const blockRe = /([^{}]+)\{[^{}]*\}/g;
        let match;
        while ((match = blockRe.exec(css))) {
            const selectorText = match[1];
            if (!/\[\s*value\s*[~|^$*]?=/i.test(selectorText))
                continue;
            const attrRe = /\[\s*value\s*[~|^$*]?=/gi;
            let attr;
            while ((attr = attrRe.exec(selectorText))) {
                let start = attr.index;
                while (start > 0 && !/[\s>+~(,]/.test(selectorText[start - 1]))
                    start -= 1;
                const head = selectorText.slice(start, attr.index).replace(/:checked\b/gi, '').trim();
                if (head && head !== '*' && !heads.includes(head))
                    heads.push(head);
            }
        }
    }
    return heads;
}
function headTargetsInput(head, input) {
    try {
        return input.matches(head);
    }
    catch {
        return false;
    }
}
export function installRangeValueAttributeMirror(root) {
    if (!root?.querySelectorAll)
        return 0;
    const ranges = [...root.querySelectorAll('input[type="range"]')]
        .filter(input => !valueMirrors.has(input) && !input.disabled && !input.hasAttribute('data-rm-state-group'));
    if (!ranges.length)
        return 0;
    const heads = valueAttributeHeads(root);
    if (!heads.length)
        return 0;
    let installed = 0;
    for (const input of ranges) {
        if (!heads.some(head => headTargetsInput(head, input)))
            continue;
        valueMirrors.add(input);
        const sync = () => {
            const value = String(input.value);
            if (input.getAttribute('value') !== value)
                input.setAttribute('value', value);
        };
        input.addEventListener('input', sync);
        input.addEventListener('change', sync);
        input.setAttribute(VALUE_ATTR_RESCUE, 'true');
        sync();
        installed += 1;
    }
    return installed;
}
const PROGRESS_ATTR = 'data-rabbit-mirror-range-progress-rescue';
const PROGRESS_ROW_ATTR = 'data-rm-range-progress-row';
const progressStates = new WeakMap();
function visibleRow(element) {
    try {
        const style = getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
    }
    catch {
        return false;
    }
}
function progressRowsFor(input, count) {
    let scope = input.parentElement;
    for (let depth = 0; scope && depth < 4; depth += 1, scope = scope.parentElement) {
        if (scope.matches?.('details, summary, body, toto'))
            break;
        const found = [];
        for (const container of scope.querySelectorAll('*')) {
            if (container.contains(input) || container.closest('[data-rm-ui]'))
                continue;
            const rows = [...container.children];
            if (rows.length !== count)
                continue;
            const signature = rows[0].tagName + '|' + String(rows[0].getAttribute('class') || '').trim();
            if (!String(rows[0].getAttribute('class') || '').trim())
                continue;
            if (rows.some(row => row.tagName + '|' + String(row.getAttribute('class') || '').trim() !== signature
                || String(row.textContent || '').replace(/\s+/g, '').length < 12
                || row.querySelector('input, button, select, textarea, label, details, summary, [role="button"]')
                || !visibleRow(row)))
                continue;
            found.push(rows);
        }
        if (found.length === 1)
            return found[0];
        if (found.length > 1)
            return null;
    }
    return null;
}
function applyProgress(state) {
    const value = Math.round(Number(state.input.value));
    state.rows.forEach((row, index) => {
        if (index <= value - state.min)
            row.style.removeProperty('display');
        else
            row.style.setProperty('display', 'none', 'important');
        row.setAttribute(PROGRESS_ROW_ATTR, index <= value - state.min ? 'shown' : 'waiting');
    });
}
export function installDisabledRangeProgressRescue(root) {
    if (!root?.querySelectorAll)
        return 0;
    let installed = 0;
    for (const input of root.querySelectorAll(`input[type="range"][disabled], input[type="range"][${PROGRESS_ATTR}]`)) {
        if (progressStates.has(input) || input.closest('[data-rm-ui]'))
            continue;
        if (input.hasAttribute('oninput') || input.hasAttribute('onchange'))
            continue;
        const min = Number(input.getAttribute('min') ?? 0);
        const max = Number(input.getAttribute('max') ?? 100);
        const step = Number(input.getAttribute('step') || 1);
        if (!Number.isInteger(min) || !Number.isInteger(max) || step !== 1)
            continue;
        const count = max - min + 1;
        if (count < 2 || count > 8)
            continue;
        let rows = null;
        if (input.hasAttribute(PROGRESS_ATTR)) {
            let scope = input.parentElement;
            for (let depth = 0; scope && depth < 4 && !rows; depth += 1, scope = scope.parentElement) {
                const marked = [...scope.querySelectorAll(`[${PROGRESS_ROW_ATTR}]`)];
                if (marked.length === count && marked.every(row => row.parentElement === marked[0].parentElement))
                    rows = marked;
            }
        }
        else
            rows = progressRowsFor(input, count);
        if (!rows)
            continue;
        const state = { input, rows, min };
        progressStates.set(input, state);
        input.disabled = false;
        input.removeAttribute('disabled');
        if (!input.hasAttribute(PROGRESS_ATTR)) {
            input.value = String(min);
            input.setAttribute('value', String(min));
        }
        const update = () => applyProgress(state);
        input.addEventListener('input', update);
        input.addEventListener('change', update);
        input.setAttribute(PROGRESS_ATTR, String(count));
        applyProgress(state);
        installed += 1;
    }
    return installed;
}
const LAYER_RESCUE_ATTR = 'data-rabbit-mirror-range-layer-rescue';
const LAYER_TARGET_ATTR = 'data-rm-range-layer';
const layerStates = new WeakMap();
const LAYER_NAME_RE = __rmR("goAxr0LhsBJC8WunyGxdPMs9wxVbH5cPJUEVJmL7ukxmzDejBdj5wpTpWXi3GXbU9s05ssTGeF_80dx8sQ3PWm8yK9y.GsCuwhpInRbjOiFFrQfQBapfrX_cehw8IC.YAZn_DmR8O8q3hEY8VUGajilJUewwYLajudYHw7xSBuueFP6gpgZ6TS7xBqHY5fwn7c5fIeoh3eGNqT2I4Xm1d5tUmE55Zsl14FeGIgefDDkMT3umkUHKYz7t", "i");
function passiveOverlay(node, input) {
    if (!node?.parentElement || node.contains(input) || node.closest('[data-rm-ui]'))
        return false;
    if (node.matches('input,button,label,summary,select,textarea,img,svg,figure,style,script,[data-rm-draw-frame]'))
        return false;
    const identity = `${node.getAttribute('id') || ''} ${node.getAttribute('class') || ''}`;
    if (!LAYER_NAME_RE.test(identity))
        return false;
    if (String(node.textContent || '').trim())
        return false;
    let css;
    try {
        css = getComputedStyle(node);
    }
    catch {
        return false;
    }
    if (css.position !== 'absolute' || css.pointerEvents !== 'none' || css.display === 'none')
        return false;
    const zero = value => /^0(?:\.0+)?px$/.test(String(value || ''));
    return ['top', 'right', 'bottom', 'left'].every(side => zero(css[side]));
}
function findLayerTarget(input) {
    let container = input.parentElement;
    for (let depth = 0; container && depth < 4; depth += 1, container = container.parentElement) {
        if (container.matches?.('details, summary, body'))
            break;
        if (container.querySelectorAll('input[type="range"]').length !== 1)
            return null;
        const layers = [...container.querySelectorAll('[class], [id]')].filter(node => passiveOverlay(node, input));
        if (layers.length > 1)
            return null;
        if (layers.length === 1)
            return layers[0];
    }
    return null;
}
function applyLayer(state) {
    const min = Number(state.input.min === '' ? 0 : state.input.min);
    const max = Number(state.input.max === '' ? 100 : state.input.max);
    const value = Number(state.input.value);
    const p = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
    state.target.style.setProperty('opacity', p.toFixed(3), 'important');
}
export function installOrphanRangeLayerRescue(root) {
    if (!root?.querySelectorAll || typeof getComputedStyle !== 'function')
        return 0;
    let installed = 0;
    for (const input of root.querySelectorAll('input[type="range"]')) {
        if (layerStates.has(input) || input.disabled || input.closest('[data-rm-ui]'))
            continue;
        if (input.hasAttribute('oninput') || input.hasAttribute('onchange') || states.has(input) || input.hasAttribute('data-rm-state-group'))
            continue;
        if ([...input.attributes].some(attr => /^data-rabbit-mirror-.*(?:rescue|program)/.test(attr.name) && attr.name !== LAYER_RESCUE_ATTR))
            continue;
        const marked = input.hasAttribute(LAYER_RESCUE_ATTR)
            ? [...root.querySelectorAll(`[${LAYER_TARGET_ATTR}]`)].find(node => node.getAttribute(LAYER_TARGET_ATTR) === input.getAttribute(LAYER_RESCUE_ATTR)) : null;
        const target = marked || findLayerTarget(input);
        if (!target)
            continue;
        const key = input.getAttribute(LAYER_RESCUE_ATTR) || `l${Math.random().toString(36).slice(2, 8)}`;
        input.setAttribute(LAYER_RESCUE_ATTR, key);
        target.setAttribute(LAYER_TARGET_ATTR, key);
        const state = { input, target };
        layerStates.set(input, state);
        const update = () => applyLayer(state);
        input.addEventListener('input', update);
        input.addEventListener('change', update);
        applyLayer(state);
        installed += 1;
    }
    return installed;
}
