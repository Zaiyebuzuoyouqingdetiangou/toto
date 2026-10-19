// 插件驱动的状态镜像：驱动只认 data-rm-* 状态，模型的 CSS 却常写成 .card.flipped、.tab.active、.panel.show。
// 读本面自己的 <style>，找出“某个类／id ＋ 状态类”的组合，驱动改变状态时把对应状态类同步加上或撤掉；
// 只撤自己加过的类，模型原本写在元素上的类一个不碰。也用来判断本面 CSS 有没有回应某个状态属性。
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

// 样式的廉价指纹（几个 style、总共多少字）：每次状态变化都要比一下有没有变，拼完整文本太贵。
export function behaviorStyleStamp(root) {
    const scope = root?.closest?.('toto') || root;
    let count = 0, length = 0;
    for (const node of scope?.querySelectorAll?.('style') || []) { count += 1; length += (node.textContent || '').length; }
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
        if (!pairs.has(base)) pairs.set(base, new Set());
        pairs.get(base).add(state);
    };
    for (const match of text.matchAll(/([^{}@;]+)\{/g)) {
        for (const selector of match[1].split(',')) {
            for (const compound of selector.replace(/\[[^\]]*\]/g, ' ').split(/[\s>+~]+/)) {
                const classes = [...compound.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(item => item[1]);
                const states = classes.filter(name => STATE_CLASSES.has(name.toLowerCase()));
                if (!states.length) continue;
                const bases = classes.filter(name => !STATE_CLASSES.has(name.toLowerCase())).map(name => `.${name}`);
                const id = /#([A-Za-z_][\w-]*)/.exec(compound)?.[1];
                if (id) bases.push(`#${id}`);
                for (const base of bases) for (const state of states) remember(base, state);
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

// 本面 CSS 是否写到了这些状态属性或类（任意一个即可）。
export function behaviorCssMentions(root, needles = []) {
    const { text } = indexFor(root);
    return needles.some(needle => needle && text.includes(needle));
}

function statesFor(root, node) {
    const { pairs } = indexFor(root);
    const found = new Set();
    for (const name of node.classList || []) for (const state of pairs.get(`.${name}`) || []) found.add(state);
    if (node.id) for (const state of pairs.get(`#${node.id}`) || []) found.add(state);
    return found;
}

export function hasBehaviorStateClasses(root, node) {
    return Boolean(node?.classList) && statesFor(root, node).size > 0;
}

// 加过的类记在 data-rm-mirrored 上（克隆、收藏后也认得哪些是自己加的）。
const MIRRORED_ATTR = 'data-rm-mirrored';
export function mirrorBehaviorState(root, node, on) {
    if (!node?.classList) return 0;
    const mine = new Set(String(node.getAttribute(MIRRORED_ATTR) || '').split(/\s+/).filter(Boolean));
    let count = 0;
    if (on) {
        for (const state of statesFor(root, node)) {
            if (node.classList.contains(state)) continue;
            node.classList.add(state);
            mine.add(state);
            count++;
        }
    } else {
        for (const state of mine) { node.classList.remove(state); count++; }
        mine.clear();
    }
    if (mine.size) node.setAttribute(MIRRORED_ATTR, [...mine].join(' '));
    else node.removeAttribute(MIRRORED_ATTR);
    return count;
}

// 克隆或重新接线前，本面样式可能已变（流式补全），丢掉旧索引重新读。
export function resetBehaviorStateIndex(root) {
    if (root) indexes.delete(root);
}

// 「按住」的另一种常见写法：模型用一个外层状态类控制里面的东西（.bare .lips{opacity:0}），
// 原本靠脚本在按住时给外层加上这个类，脚本被拿掉后按住就没反应。
// 找出这样的类：CSS 里只当作「外层」出现（后面还跟着里面的元素），页面上没有任何元素带着它，
// 而且它管的那些元素就在这个按住区域里。只有唯一一个时才认，按住时把它加到按住区域上，松开撤掉。
export function holdAncestorStateClass(root, group) {
    if (!root?.querySelector || !group?.querySelector) return '';
    const text = styleText(root);
    const found = new Set();
    for (const match of text.matchAll(/([^{}@;]+)\{/g)) {
        for (const selector of match[1].split(',')) {
            const parts = selector.replace(/\[[^\]]*\]/g, ' ').trim().split(/\s+/).filter(Boolean);
            for (let index = 0; index < parts.length - 1; index += 1) {
                const single = /^\.([A-Za-z_][\w-]*)$/.exec(parts[index]);
                if (!single) continue;
                const name = single[1];
                const inner = parts.slice(index + 1).join(' ');
                let present = true, governs = false;
                try { present = !!root.querySelector(`.${CSS.escape(name)}`); } catch { present = true; }
                if (present) continue;
                try { governs = !!group.querySelector(inner.replace(/::?[a-z-]+(\([^)]*\))?/gi, '') || '*'); } catch { governs = false; }
                if (governs) found.add(name);
            }
        }
    }
    return found.size === 1 ? [...found][0] : '';
}
