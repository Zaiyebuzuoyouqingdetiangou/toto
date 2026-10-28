const STATE_CLASSES = new Set([
    'active', 'on', 'open', 'opened', 'flipped', 'flip', 'is-flipped', 'show', 'shown', 'visible', 'selected', 'checked',
    'current', 'done', 'revealed', 'lit', 'pressed', 'is-active', 'is-open', 'is-on', 'is-selected', 'is-current', 'expanded',
    'playing', 'matched', 'paired', 'correct', 'unlocked', 'solved', 'chosen', 'picked', 'turned', 'lifted', 'glow', 'reveal',
]);
const indexes = new WeakMap();
export const isBehaviorStateClass = name => STATE_CLASSES.has(String(name || '').toLowerCase());
export function behaviorStyleText(root) {
    return styleText(root);
}
export function behaviorStyleStamp(root) {
    const scope = root?.closest?.('toto') || root;
    let count = 0, length = 0;
    for (const node of scope?.querySelectorAll?.('style') || []) {
        count += 1;
        length += (node.textContent || '').length;
    }
    return `${count}:${length}`;
}
function styleText(root) {
    const scope = root?.closest?.('toto') || root;
    return [...(scope?.querySelectorAll?.('style') || [])].map(node => String(node.textContent || '')).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
}
function buildIndex(root) {
    const text = styleText(root);
    const pairs = new Map();
    const remember = (base, state) => {
        if (!pairs.has(base))
            pairs.set(base, new Set());
        pairs.get(base).add(state);
    };
    for (const match of text.matchAll(/([^{}@;]+)\{/g)) {
        for (const selector of match[1].split(',')) {
            for (const compound of selector.replace(/\[[^\]]*\]/g, ' ').split(/[\s>+~]+/)) {
                const classes = [...compound.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(item => item[1]);
                const states = classes.filter(name => STATE_CLASSES.has(name.toLowerCase()));
                if (!states.length)
                    continue;
                const bases = classes.filter(name => !STATE_CLASSES.has(name.toLowerCase())).map(name => `.${name}`);
                const id = /#([A-Za-z_][\w-]*)/.exec(compound)?.[1];
                if (id)
                    bases.push(`#${id}`);
                for (const base of bases)
                    for (const state of states)
                        remember(base, state);
            }
        }
    }
    const index = { text, pairs };
    indexes.set(root, index);
    return index;
}
function indexFor(root) {
    return indexes.get(root) || buildIndex(root);
}
export function behaviorCssMentions(root, needles = []) {
    const { text } = indexFor(root);
    return needles.some(needle => needle && text.includes(needle));
}
function statesFor(root, node) {
    const { pairs } = indexFor(root);
    const found = new Set();
    for (const name of node.classList || [])
        for (const state of pairs.get(`.${name}`) || [])
            found.add(state);
    if (node.id)
        for (const state of pairs.get(`#${node.id}`) || [])
            found.add(state);
    return found;
}
export function hasBehaviorStateClasses(root, node) {
    return Boolean(node?.classList) && statesFor(root, node).size > 0;
}
const MIRRORED_ATTR = 'data-rm-mirrored';
export function mirrorBehaviorState(root, node, on) {
    if (!node?.classList)
        return 0;
    const mine = new Set(String(node.getAttribute(MIRRORED_ATTR) || '').split(/\s+/).filter(Boolean));
    let count = 0;
    if (on) {
        for (const state of statesFor(root, node)) {
            if (node.classList.contains(state))
                continue;
            node.classList.add(state);
            mine.add(state);
            count++;
        }
    }
    else {
        for (const state of mine) {
            node.classList.remove(state);
            count++;
        }
        mine.clear();
    }
    if (mine.size)
        node.setAttribute(MIRRORED_ATTR, [...mine].join(' '));
    else
        node.removeAttribute(MIRRORED_ATTR);
    return count;
}
export function resetBehaviorStateIndex(root) {
    if (root)
        indexes.delete(root);
}
export function holdAncestorStateClass(root, group) {
    if (!root?.querySelector || !group?.querySelector)
        return '';
    const text = styleText(root);
    const found = new Set();
    for (const match of text.matchAll(/([^{}@;]+)\{/g)) {
        for (const selector of match[1].split(',')) {
            const parts = selector.replace(/\[[^\]]*\]/g, ' ').trim().split(/\s+/).filter(Boolean);
            for (let index = 0; index < parts.length - 1; index += 1) {
                const single = /^\.([A-Za-z_][\w-]*)$/.exec(parts[index]);
                if (!single)
                    continue;
                const name = single[1];
                const inner = parts.slice(index + 1).join(' ');
                let present = true, governs = false;
                try {
                    present = !!root.querySelector(`.${CSS.escape(name)}`);
                }
                catch {
                    present = true;
                }
                if (present)
                    continue;
                try {
                    governs = !!group.querySelector(inner.replace(/::?[a-z-]+(\([^)]*\))?/gi, '') || '*');
                }
                catch {
                    governs = false;
                }
                if (governs)
                    found.add(name);
            }
        }
    }
    return found.size === 1 ? [...found][0] : '';
}
const ACTIVE_ATTR_SELECTOR = /\[\s*data-rm-active\s*(?:=\s*(?:"true"|'true'|true))?\s*\]/g;
function selectorCompounds(selector) {
    const out = [];
    let depth = 0, current = '';
    for (const char of selector) {
        if (char === '[' || char === '(')
            depth += 1;
        else if (char === ']' || char === ')')
            depth = Math.max(0, depth - 1);
        if (!depth && /[\s>+~]/.test(char)) {
            if (current)
                out.push(current);
            current = '';
            continue;
        }
        current += char;
    }
    if (current)
        out.push(current);
    return out;
}
export function holdAncestorActiveHolders(root, group) {
    if (!root?.querySelector || !group?.parentElement)
        return [];
    const text = styleText(root);
    if (!/data-rm-active/.test(text))
        return [];
    const bases = new Set();
    for (const match of text.matchAll(/([^{}@;]+)\{/g)) {
        for (const selector of match[1].split(',')) {
            if (!selector.includes('data-rm-active'))
                continue;
            for (const compound of selectorCompounds(selector.trim())) {
                ACTIVE_ATTR_SELECTOR.lastIndex = 0;
                if (!ACTIVE_ATTR_SELECTOR.test(compound))
                    continue;
                const base = compound.replace(ACTIVE_ATTR_SELECTOR, '').replace(/::?[a-z-]+(\([^)]*\))?/gi, '');
                if (/[.#]/.test(base))
                    bases.add(base);
            }
        }
    }
    if (!bases.size)
        return [];
    const holders = [];
    const stop = root.closest?.('toto') || root;
    for (let node = group.parentElement; node && node !== stop.parentElement; node = node.parentElement) {
        if (node.getAttribute?.('data-rm-ui') === 'hold')
            continue;
        for (const base of bases) {
            let hit = false;
            try {
                hit = node.matches(base);
            }
            catch {
                hit = false;
            }
            if (hit) {
                holders.push(node);
                break;
            }
        }
        if (node === stop)
            break;
    }
    return holders;
}
