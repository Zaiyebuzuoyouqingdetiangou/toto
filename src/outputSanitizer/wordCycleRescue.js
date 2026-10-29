import { rmR as __rmR } from "../textTable.js?rmv=1.99.11";
import { findUnwrittenWordStates, wordStateHost, setWordState } from './wordStateAttr.js?rmv=1.99.11';
const BOUND_ATTR = 'data-rm-word-cycle';
const BOUND = new WeakSet();
const SWITCH_WORDS = __rmR("OwOwoOCv3vgclrW7Qpw5uVLTsU.zVLieFg5yaxSXgXRrxgyppvVSS1Kbz9EYuSz_LwZ0JFOAo0M3O78Ko9XTIhZzihlCiCXww4jgJTbhbQEfQO3Xwe74Mh", "");
function hasOwnAction(button) {
    if (button.disabled || button.closest('[data-rm-ui]'))
        return true;
    if (button.hasAttribute('popovertarget') || button.hasAttribute('commandfor') || button.closest('a[href], form, label'))
        return true;
    if ([...button.attributes].some(attr => /^data-rm-(?!press|polish|mobile|select)/.test(attr.name) || /^data-rabbit-mirror-.*(?:rescue|wired|fallback)/.test(attr.name)))
        return true;
    return /^(?:submit|reset)$/i.test(button.getAttribute('type') || '');
}
export function installWordCycleRescue(root) {
    if (!root?.querySelectorAll)
        return 0;
    const states = findUnwrittenWordStates(root);
    if (!states.size)
        return 0;
    let count = 0;
    for (const button of root.querySelectorAll('button, [role="button"]')) {
        if (BOUND.has(button) || hasOwnAction(button) || !SWITCH_WORDS.test(button.textContent || ''))
            continue;
        const fits = [...states].map(([name, info]) => ({ name, info, host: wordStateHost(root, button, info.targets) })).filter(item => item.host);
        if (fits.length !== 1)
            continue;
        const { name, info, host } = fits[0];
        BOUND.add(button);
        button.setAttribute(BOUND_ATTR, name);
        button.addEventListener('click', event => {
            event.preventDefault();
            const current = host.getAttribute(name);
            const next = info.values[(info.values.indexOf(current) + 1) % info.values.length];
            setWordState(host, name, next);
            button.setAttribute('aria-pressed', String(next !== info.values[0]));
        });
        count += 1;
    }
    if (count)
        root.setAttribute(BOUND_ATTR, String(count));
    return count;
}
