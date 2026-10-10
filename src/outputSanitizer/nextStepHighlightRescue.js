// 「按 1 亮 2」：模型常把一排单选按钮写成“下一步提示”——选中第 1 项时去点亮第 2 个按钮，
// 选中第 2 项时点亮第 3 个……于是按下去的那个按钮不亮，旁边的亮了，看起来像点错、点了没反应。
// 只在一组单选里每一项都恰好点亮另一项、没有任何一项点亮自己时，把高亮改回“按下的那个按钮自己”。
// 只改本面样式里这几条选择器的目标，不改颜色、不改内容。
import { getRabbitMirrorLocalStyleElements } from './runtime.js?rmv=1.67.48';
import { splitCssSelectorList } from './markup.js?rmv=1.67.48';

const RESCUE_ATTR = 'data-rabbit-mirror-next-step-highlight-rescue';
const PAIR_RE = /(?:#([\w-]+)|\[\s*id\s*=\s*["']?([\w-]+)["']?\s*\])\s*:checked\s*~\s*([^{}]*?)label\[\s*for\s*=\s*["']?([\w-]+)["']?\s*\]\s*$/;

function parsePair(selector) {
    const match = String(selector || '').trim().match(PAIR_RE);
    if (!match) return null;
    return { from: match[1] || match[2], to: match[4] };
}

function radioGroups(root) {
    const groups = new Map();
    for (const input of root.querySelectorAll('input[type="radio"][id][name]')) {
        if (input.disabled) continue;
        if (!groups.has(input.name)) groups.set(input.name, []);
        groups.get(input.name).push(input.id);
    }
    return groups;
}

function stripImportant(value) {
    return String(value || '').replace(/\s*!important\s*$/i, '').trim();
}

// 旧版兜底可能已经把“点亮下一项”的样式写成内联 !important 留在了下一项按钮上；改目标时一并撤掉这些完全相同的声明。
function clearStaleInline(root, id, declarations) {
    const label = [...root.querySelectorAll('label[for]')].find(node => node.getAttribute('for') === id);
    if (!label?.style) return;
    const probe = document.createElement('span');
    for (const declaration of String(declarations || '').split(';')) {
        const colon = declaration.indexOf(':');
        if (colon < 0) continue;
        const property = declaration.slice(0, colon).trim().toLowerCase();
        const value = stripImportant(declaration.slice(colon + 1));
        if (!property || !value || label.style.getPropertyPriority(property) !== 'important') continue;
        probe.style.setProperty(property, value);
        const expected = probe.style.getPropertyValue(property);
        probe.style.removeProperty(property);
        if (expected && label.style.getPropertyValue(property) === expected) label.style.removeProperty(property);
    }
}

export function installNextStepHighlightRescue(root) {
    if (!root?.querySelectorAll || !globalThis.document) return 0;
    const groups = radioGroups(root);
    if (!groups.size) return 0;
    const memberGroup = new Map();
    for (const [name, ids] of groups) for (const id of ids) memberGroup.set(id, name);
    const styles = getRabbitMirrorLocalStyleElements(root);
    // 先收集每组的“选中谁 → 点亮谁”，并记下是否已经有“点亮自己”的规则。
    const mapping = new Map();
    const selfLit = new Set();
    const blockRe = /([^{}]+)\{([^{}]*)\}/g;
    for (const style of styles) {
        const css = String(style.textContent || '');
        let match;
        while ((match = blockRe.exec(css))) {
            for (const selector of splitCssSelectorList(match[1])) {
                const pair = parsePair(selector);
                if (!pair || !memberGroup.has(pair.from) || memberGroup.get(pair.to) !== memberGroup.get(pair.from)) continue;
                if (pair.from === pair.to) { selfLit.add(memberGroup.get(pair.from)); continue; }
                const targets = mapping.get(pair.from) || new Set();
                targets.add(pair.to);
                mapping.set(pair.from, targets);
            }
        }
    }
    const shifted = new Set();
    for (const [name, ids] of groups) {
        if (ids.length < 2 || ids.length > 6 || selfLit.has(name)) continue;
        if (!ids.every(id => mapping.get(id)?.size === 1)) continue;
        const targets = ids.map(id => [...mapping.get(id)][0]);
        // 每一项点亮另一项，且被点亮的正好是这一组的每一项各一次（一个轮转），才算“提示下一步”的写法。
        if (new Set(targets).size !== ids.length || targets.some(target => !ids.includes(target))) continue;
        if (!ids.every(id => [...root.querySelectorAll('label[for]')].some(label => label.getAttribute('for') === id))) continue;
        shifted.add(name);
    }
    if (!shifted.size) return 0;
    let rewritten = 0;
    for (const style of styles) {
        const css = String(style.textContent || '');
        const next = css.replace(blockRe, (block, selectorText, declarations) => {
            const parts = splitCssSelectorList(selectorText);
            let changed = false;
            const updated = parts.map(selector => {
                const pair = parsePair(selector);
                if (!pair || pair.from === pair.to || !shifted.has(memberGroup.get(pair.from))) return selector;
                if (memberGroup.get(pair.to) !== memberGroup.get(pair.from)) return selector;
                changed = true;
                clearStaleInline(root, pair.to, declarations);
                const at = selector.lastIndexOf('label[');
                return `${selector.slice(0, at)}label[for="${pair.from}"]`;
            });
            if (!changed) return block;
            rewritten += 1;
            const leading = selectorText.match(/^\s*/)[0];
            return `${leading}${updated.map(part => part.trim()).join(', ')} {${declarations}}`;
        });
        if (next !== css) style.textContent = next;
    }
    if (rewritten) root.setAttribute(RESCUE_ATTR, String(shifted.size));
    return rewritten;
}
