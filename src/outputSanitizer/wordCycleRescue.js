// 「拉动锦绦（拨换昼夜室光）」这类按钮：没写任何动作，样式里却写好了 [data-rm-mode="dim"] .画、[data-rm-mode="candle"] .画，
// 模型原本用脚本在两种状态之间切换，脚本被拿掉了，按了没反应。
// 只认很确定的：按钮没写别的动作；字面是「切换／拨换／拉动／调／开关／昼夜／明暗／模式」这类；
// 样式里有一个没人写的状态词属性，按钮和它管着的画在同一块里。按一下换下一个词，轮着来。
import { findUnwrittenWordStates, wordStateHost, setWordState } from './wordStateAttr.js?rmv=1.83.0';

const BOUND_ATTR = 'data-rm-word-cycle';
const BOUND = new WeakSet();
const SWITCH_WORDS = /切换|拨换|换成|变换|拉动|调换|调光|开关|昼夜|明暗|日夜|模式|状态|翻转|转换/;

function hasOwnAction(button) {
    if (button.disabled || button.closest('[data-rm-ui]')) return true;
    if (button.hasAttribute('popovertarget') || button.hasAttribute('commandfor') || button.closest('a[href], form, label')) return true;
    if ([...button.attributes].some(attr => /^data-rm-(?!press|polish|mobile|select)/.test(attr.name) || /^data-rabbit-mirror-.*(?:rescue|wired|fallback)/.test(attr.name))) return true;
    return /^(?:submit|reset)$/i.test(button.getAttribute('type') || '');
}

export function installWordCycleRescue(root) {
    if (!root?.querySelectorAll) return 0;
    const states = findUnwrittenWordStates(root);
    if (!states.size) return 0;
    let count = 0;
    for (const button of root.querySelectorAll('button, [role="button"]')) {
        if (BOUND.has(button) || hasOwnAction(button) || !SWITCH_WORDS.test(button.textContent || '')) continue;
        // 只认一个属性：按钮所在的这一块里只有它管着的画，才知道该切哪个。
        const fits = [...states].map(([name, info]) => ({ name, info, host: wordStateHost(root, button, info.targets) })).filter(item => item.host);
        if (fits.length !== 1) continue;
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
    if (count) root.setAttribute(BOUND_ATTR, String(count));
    return count;
}
