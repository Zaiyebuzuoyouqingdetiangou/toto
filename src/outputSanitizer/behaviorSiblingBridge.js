// 兄弟选择器桥：模型常写「按钮[data-rm-done="true"] ~ .结果」，可按钮外面又包了一层（按钮在一排按钮的 div 里，
// 结果是那个 div 的兄弟），这条规则在页面上永远对不上——按钮变了色，画面却不动。
// 这里读本面 CSS，找出「带插件状态的复合选择器 + ~ / +」的规则；页面上这个元素没有对得上的兄弟、它的某一层外壳有时，
// 补一条同样内容的规则：把那个复合选择器换成 :has(…)，状态写在里面的按钮上时外壳就当它的替身去配兄弟。
// 只补「原规则在这一面结构上根本配不上」的，原写法能配上的不碰；补的规则单独放在一个标了记号的 style 里，可整块撤掉。
const BRIDGE_ATTR = 'data-rm-sibling-bridge';
const STATE = /\[\s*data-rm-(?:done|active|on|picked|match|miss|changed|peeking|count|index|seq)\b[^\]]*\]/g;
const PSEUDO = /::?[\w-]+(?:\([^()]*\))?/g;

function topLevelRules(text) {
    const rules = [];
    let depth = 0, start = 0, selector = '';
    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (char === '{') {
            if (depth === 0) { selector = text.slice(start, index); start = index + 1; }
            depth += 1;
        } else if (char === '}') {
            depth -= 1;
            if (depth === 0) { rules.push({ selector: selector.trim(), body: text.slice(start, index) }); start = index + 1; }
            if (depth < 0) { depth = 0; start = index + 1; }
        } else if (char === ';' && depth === 0) start = index + 1;
    }
    return rules.filter(rule => rule.selector && !rule.selector.startsWith('@') && !/[{}]/.test(rule.body));
}
// 拆成 [{ compound, combinator }]；方括号、圆括号里的空格和符号不算。
function tokenize(selector) {
    const parts = [];
    let depth = 0, current = '', combinator = '';
    for (const char of selector) {
        if (char === '[' || char === '(') depth += 1;
        if (char === ']' || char === ')') depth = Math.max(0, depth - 1);
        if (!depth && /[\s>+~]/.test(char)) {
            if (current) { parts.push({ compound: current, combinator }); current = ''; combinator = ''; }
            if (!/\s/.test(char)) combinator = char; else if (!combinator) combinator = ' ';
            continue;
        }
        current += char;
    }
    if (current) parts.push({ compound: current, combinator });
    return parts;
}
const join = parts => parts.map((part, index) => `${index ? (part.combinator === ' ' || !part.combinator ? ' ' : ` ${part.combinator} `) : ''}${part.compound}`).join('');
const queryAll = (node, selector) => { try { return [...node.querySelectorAll(selector)]; } catch { return []; } };
const matches = (node, selector) => { try { return node.matches(selector); } catch { return false; } };
const siblingFits = (node, combinator, selector) => {
    if (combinator === '+') return Boolean(node.nextElementSibling && matches(node.nextElementSibling, selector));
    for (let next = node.nextElementSibling; next; next = next.nextElementSibling) if (matches(next, selector)) return true;
    return false;
};

// 一条选择器要补的替身写法；不需要（或认不出）时返回 null。
function bridgeSelector(selector, scope) {
    if (selector.includes(':has(')) return null;
    const parts = tokenize(selector);
    for (let index = 0; index < parts.length - 1; index += 1) {
        const next = parts[index + 1];
        if (next.combinator !== '~' && next.combinator !== '+') continue;
        const part = parts[index];
        if (!part.compound.match(STATE)) continue;
        const plain = parts.slice(0, index + 1).map(item => ({ ...item, compound: item.compound.replace(STATE, '').replace(PSEUDO, '') || '*' }));
        const nextPlain = next.compound.replace(STATE, '').replace(PSEUDO, '') || '*';
        const subjects = queryAll(scope, join(plain));
        if (!subjects.length || subjects.some(node => siblingFits(node, next.combinator, nextPlain))) continue; // 原写法能配上
        // 往外找一层外壳有对得上的兄弟（不出这一面）。
        const wrapped = subjects.some(node => { for (let up = node.parentElement; up && scope.contains(up) && up !== scope; up = up.parentElement) if (siblingFits(up, next.combinator, nextPlain)) return true; return false; });
        const head = parts.slice(0, index);
        const out = [];
        if (wrapped) {
            const replaced = { compound: `:has(${part.compound})`, combinator: part.combinator === '>' || part.combinator === '+' || part.combinator === '~' ? ' ' : part.combinator };
            out.push(join([...head, replaced, ...parts.slice(index + 1)]));
        }
        // 外壳配不上（结果写在更前面、或隔了好几层）——也可能「配上的外壳」其实属于别的按钮：
        // 再补一种：状态元素和结果都在前面那层容器（通常是 [data-rm-ui] 区域）里就算，
        // 那层带上 :has(状态元素)，~／+ 换成「里面的」。
        if (head.length && part.combinator === ' ') {
            const containers = queryAll(scope, join(plain.slice(0, index)));
            if (containers.some(node => queryAll(node, nextPlain).length)) {
                const holder = head[head.length - 1];
                out.push(join([...head.slice(0, -1), { ...holder, compound: `${holder.compound}:has(${part.compound})` }, { ...next, combinator: ' ' }, ...parts.slice(index + 2)]));
            }
        }
        return out.length ? out : null;
    }
    return null;
}

export function installSiblingStateBridge(root) {
    const scope = root?.closest?.('toto') || root;
    if (!scope?.querySelectorAll) return 0;
    const styles = queryAll(scope, `style:not([${BRIDGE_ATTR}])`);
    let added = 0;
    for (const style of styles) {
        const text = String(style.textContent || '');
        if (!/data-rm-/.test(text) || !/[~+]/.test(text)) continue;
        const extra = [];
        for (const rule of topLevelRules(text.replace(/\/\*[\s\S]*?\*\//g, ''))) {
            const selectors = rule.selector.split(',').map(item => item.trim()).filter(Boolean);
            const bridged = selectors.flatMap(item => bridgeSelector(item, scope) || []);
            if (bridged.length) extra.push(`${bridged.join(',')}{${rule.body}}`);
        }
        const existing = style.nextElementSibling?.matches?.(`style[${BRIDGE_ATTR}]`) ? style.nextElementSibling : null;
        if (!extra.length) { existing?.remove(); continue; }
        const css = extra.join('\n');
        if (existing) { if (existing.textContent !== css) existing.textContent = css; }
        else {
            const node = style.ownerDocument.createElement('style');
            node.setAttribute(BRIDGE_ATTR, 'true');
            node.textContent = css;
            style.after(node);
        }
        added += extra.length;
    }
    return added;
}
