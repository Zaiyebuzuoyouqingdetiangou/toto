// 一排「春 / 夏 / 秋 / 冬」页签：每个是 label 包着一个藏起来的单选，样式里却一条 :checked 都没写，
// 点了哪个都看不出选中了谁。这里只补「选中了哪个」的标记（给当前那个页签描一圈），不编内容。
// 只认：同名单选至少两个、全部藏起来（display:none / hidden）并各自包在 label 里；这一面的样式里没有任何 :checked / :has(。

const STYLE_ID = 'rabbit-mirror-radio-tab-mark-style';
const ON_ATTR = 'data-rm-tab-on';
const BOUND = new WeakSet();

function ensureStyle(doc) {
    if (doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `label[${ON_ATTR}="true"] > :not(input){outline:2px solid currentColor!important;outline-offset:2px!important;}label[${ON_ATTR}="true"]{font-weight:700;}`;
    (doc.head || doc.documentElement).append(style);
}

function faceStyleText(root) {
    return [...root.querySelectorAll('style')].map(node => node.textContent || '').join('\n');
}

function hiddenInput(input) {
    if (input.hidden) return true;
    try { return getComputedStyle(input).display === 'none' || input.style.display === 'none'; } catch { return false; }
}

export function installRadioTabMark(root) {
    if (!root?.querySelectorAll || typeof document === 'undefined') return 0;
    if (/:checked|:has\(/i.test(faceStyleText(root))) return 0;
    const groups = new Map();
    for (const input of root.querySelectorAll('input[type="radio"][name]')) {
        if (input.closest('[data-rm-ui]')) continue;
        const name = input.getAttribute('name');
        if (!groups.has(name)) groups.set(name, []);
        groups.get(name).push(input);
    }
    let count = 0;
    for (const inputs of groups.values()) {
        if (inputs.length < 2) continue;
        const labels = inputs.map(input => input.closest('label'));
        if (labels.some(label => !label) || !inputs.every(hiddenInput)) continue;
        ensureStyle(root.ownerDocument || document);
        const paint = () => inputs.forEach((input, index) => labels[index].setAttribute(ON_ATTR, String(input.checked)));
        for (const [index, input] of inputs.entries()) {
            if (BOUND.has(input)) continue;
            BOUND.add(input);
            input.addEventListener('change', paint);
            // 别的修复（可撤回单选）会直接改 checked、不发 change：点完再看一眼。
            labels[index].addEventListener('click', () => setTimeout(paint, 0));
        }
        paint();
        count += 1;
    }
    return count;
}
