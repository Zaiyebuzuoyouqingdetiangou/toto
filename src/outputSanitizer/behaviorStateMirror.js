// 插件驱动的状态镜像：驱动只认 data-rm-* 状态，模型的 CSS 却常写成 .card.flipped、.tab.active、.panel.show。
// 读本面自己的 <style>，找出“某个类／id ＋ 状态类”的组合，驱动改变状态时把对应状态类同步加上或撤掉；
// 只撤自己加过的类，模型原本写在元素上的类一个不碰。也用来判断本面 CSS 有没有回应某个状态属性。
const STATE_CLASSES = new Set([
    'active', 'on', 'open', 'opened', 'flipped', 'flip', 'is-flipped', 'show', 'shown', 'visible', 'selected', 'checked',
    'current', 'done', 'revealed', 'lit', 'pressed', 'is-active', 'is-open', 'is-on', 'is-selected', 'is-current', 'expanded',
    'playing', 'matched', 'paired', 'correct', 'unlocked', 'solved', 'chosen', 'picked', 'turned', 'lifted', 'glow', 'reveal',
]);
const indexes = new WeakMap();

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
