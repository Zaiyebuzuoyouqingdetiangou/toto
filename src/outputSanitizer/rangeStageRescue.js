// 滑杆分段显示：模型常写一个 min=1 max=4 的滑杆，再写 stage-1…stage-4 四段默认隐藏的内容，
// 用 `:has(input[value="2"]:checked)` 之类的规则去切换。滑杆没有 checked 状态，这种规则永远不生效，
// 拖动滑杆什么也不变。这里只在“编号段落与滑杆取值一一对应、且这些段落默认是隐藏的”时接上：
// 滑到几就显示第几段，其余段落收起。不写任何新内容，不执行模型脚本。
import { getRabbitMirrorLocalStyleElements } from './runtime.js?rmv=1.67.33';
const RESCUE_ATTR = 'data-rabbit-mirror-range-stage-rescue';
const STAGE_ATTR = 'data-rm-range-stage';
const states = new WeakMap();
const NUMBERED_CLASS_RE = /(?:^|[-_])(?:stage|step|phase|level|page|scene|part|chapter|round|layer|state|panel|slide|frame|card|leaf)[-_]?(\d{1,2})$/i;

function numberOf(element) {
    for (const name of element.classList || []) {
        const match = String(name).match(NUMBERED_CLASS_RE);
        if (match) return Number(match[1]);
    }
    return null;
}

function hiddenByDefault(element) {
    try { return getComputedStyle(element).display === 'none'; } catch { return false; }
}

function findStages(input) {
    const min = Number(input.min === '' ? 0 : input.min);
    const max = Number(input.max === '' ? 100 : input.max);
    if (!Number.isInteger(min) || !Number.isInteger(max) || max - min < 1 || max - min > 12) return null;
    let container = input.parentElement;
    for (let depth = 0; container && depth < 4; depth += 1, container = container.parentElement) {
        if (container.matches?.('details, summary, body')) break;
        const byNumber = new Map();
        for (const element of container.querySelectorAll('*')) {
            if (element.contains(input)) continue;
            const number = numberOf(element);
            if (number === null || number < min || number > max) continue;
            if (!byNumber.has(number)) byNumber.set(number, []);
            byNumber.get(number).push(element);
        }
        if (byNumber.size < 2) continue;
        // 每个编号只能有一段，而且都在同一个父层里，才算是“分段”而不是碰巧带数字的类名。
        const groups = [...byNumber.values()];
        if (groups.some(list => list.length !== 1)) return null;
        const stages = groups.map(list => list[0]);
        const parent = stages[0].parentElement;
        if (stages.some(stage => stage.parentElement !== parent)) return null;
        // 至少有一段默认隐藏，说明本来就是要靠操作切换出来的。
        if (!stages.some(hiddenByDefault)) return null;
        return new Map(stages.map(stage => [numberOf(stage), stage]));
    }
    return null;
}

function apply(state) {
    const value = Math.round(Number(state.input.value));
    for (const [number, stage] of state.stages) {
        if (number === value) stage.style.setProperty('display', 'block', 'important');
        else stage.style.setProperty('display', 'none', 'important');
        stage.setAttribute(STAGE_ATTR, number === value ? 'active' : 'idle');
    }
}

export function installRangeStageRescue(root) {
    if (!root?.querySelectorAll) return 0;
    let installed = 0;
    for (const input of root.querySelectorAll('input[type="range"]')) {
        if (states.has(input) || input.disabled || input.closest('[data-rm-ui]')) continue;
        if (input.hasAttribute('oninput') || input.hasAttribute('onchange')) continue;
        const stages = findStages(input);
        if (!stages) continue;
        const state = { input, stages };
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

// 另一种常见写法：`.box:has(#slider[value="2"]) .t1 { display:none }`。
// CSS 里的 [value="2"] 读的是 HTML 属性，拖动滑杆只改“当前值”不改属性，所以规则永远停在初始那一档。
// 只有本面自己的样式确实用 [value=…] 指向这根滑杆时，才在拖动时把当前值同步回属性，
// 让模型原本写好的规则自己生效；不改任何样式，不猜目标。
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
            if (!/\[\s*value\s*[~|^$*]?=/i.test(selectorText)) continue;
            const attrRe = /\[\s*value\s*[~|^$*]?=/gi;
            let attr;
            while ((attr = attrRe.exec(selectorText))) {
                let start = attr.index;
                while (start > 0 && !/[\s>+~(,]/.test(selectorText[start - 1])) start -= 1;
                const head = selectorText.slice(start, attr.index).replace(/:checked\b/gi, '').trim();
                if (head && head !== '*' && !heads.includes(head)) heads.push(head);
            }
        }
    }
    return heads;
}

function headTargetsInput(head, input) {
    try { return input.matches(head); } catch { return false; }
}

export function installRangeValueAttributeMirror(root) {
    if (!root?.querySelectorAll) return 0;
    const ranges = [...root.querySelectorAll('input[type="range"]')]
        .filter(input => !valueMirrors.has(input) && !input.disabled);
    if (!ranges.length) return 0;
    const heads = valueAttributeHeads(root);
    if (!heads.length) return 0;
    let installed = 0;
    for (const input of ranges) {
        if (!heads.some(head => headTargetsInput(head, input))) continue;
        valueMirrors.add(input);
        const sync = () => {
            const value = String(input.value);
            if (input.getAttribute('value') !== value) input.setAttribute('value', value);
        };
        input.addEventListener('input', sync);
        input.addEventListener('change', sync);
        input.setAttribute(VALUE_ATTR_RESCUE, 'true');
        sync();
        installed += 1;
    }
    return installed;
}
