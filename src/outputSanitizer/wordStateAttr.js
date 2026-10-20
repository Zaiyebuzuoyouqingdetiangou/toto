// 样式里写了「状态词」条件：[data-rm-mode="dim"] .画{filter:…}、[data-rm-mode="candle"] .画{…}，
// 却没有任何元素带着这个属性，也没有脚本去写它（脚本被拿掉了）：这几条样式永远不生效。
// 这里只负责把这类属性找出来、算出该写在哪一层；谁来写（滑杆按档位、按钮轮流切换）由调用方决定。

// 驱动自己会写的状态属性，不算「没人写」。
const DRIVER_STATE = /^data-rm-(?:ui|on|picked|index|done|active|match|seq|miss|count|value|step|show|part|fire|play|reverse|seek|reset|hold|toggle|pick|goto|prev|next|roll|end|code|knob|item|slot|page|cover|answer|stops|placed|paired|armed|swiped(?:-left|-right)?|peeking|seen|revealed|current|edge|feedback|bridged|program|dial[\w-]*|draw[\w-]*|mobile[\w-]*|polish[\w-]*|press|title[\w-]*|body[\w-]*|result[\w-]*)$/;

function styleRules(root) {
    const rules = [];
    const walk = list => {
        for (const rule of list || []) {
            if (typeof rule.selectorText === 'string' && rule.style) rules.push(rule);
            else if (rule.cssRules) walk(rule.cssRules);
        }
    };
    for (const node of root?.querySelectorAll?.('style') || []) { try { walk(node.sheet?.cssRules); } catch { /* 未解析 */ } }
    return rules;
}

/**
 * 找出「写了样式、却没人写」的状态词属性。
 * @returns {Map<string,{values:string[], targets:Element[]}>} 属性名 → 依样式出现顺序的词、能选中的目标元素
 */
export function findUnwrittenWordStates(root) {
    const found = new Map();
    if (!root?.querySelectorAll) return found;
    for (const rule of styleRules(root)) {
        for (const raw of String(rule.selectorText).split(',')) {
            // 去掉插件加的作用域前缀，再找状态词条件。
            const piece = raw.replace(/^\s*\[data-rabbit-mirror-css-scope=[^\]]*\]\s*/, '');
            const match = piece.match(/\[\s*(data-[\w-]+)\s*=\s*["']?([A-Za-z][\w-]*)["']?\s*\]\s+([^,]+)$/);
            if (!match || /^data-rabbit-/.test(match[1]) || DRIVER_STATE.test(match[1])) continue;
            const [, name, value, target] = match;
            if (/^(?:true|false|on|off|\d+)$/i.test(value)) continue;
            if (!found.has(name)) found.set(name, { values: [], selectors: new Set() });
            const info = found.get(name);
            if (!info.values.includes(value)) info.values.push(value);
            info.selectors.add(target.trim());
        }
    }
    for (const [name, info] of found) {
        // 已经有元素带着这个属性：模型自己管着（写死的初始值、或别的机关在写），不碰。
        // 插件自己写上去的（带 data-rm-word-state 记号）不算模型写的。
        let present = false;
        try { present = [...root.querySelectorAll(`[${name}]`)].some(node => !String(node.getAttribute('data-rm-word-state') || '').split(' ').includes(name)); } catch { present = true; }
        const targets = [];
        for (const selector of info.selectors) { try { targets.push(...root.querySelectorAll(selector)); } catch { /* 浏览器不认 */ } }
        if (present || info.values.length < 2 || !targets.length) { found.delete(name); continue; }
        found.set(name, { values: info.values, targets: [...new Set(targets)] });
    }
    return found;
}

// 从 from 往外找第一个同时包住 from 和全部目标的祖先（不越过 root）。
export function wordStateHost(root, from, targets) {
    for (let node = from?.parentElement; node; node = node === root ? null : node.parentElement) {
        if (targets.every(target => node.contains(target))) return node;
    }
    return null;
}

export function setWordState(host, name, value) {
    if (!host || !name) return;
    const marks = new Set(String(host.getAttribute('data-rm-word-state') || '').split(' ').filter(Boolean));
    marks.add(name);
    host.setAttribute('data-rm-word-state', [...marks].join(' '));
    if (value) host.setAttribute(name, value); else host.removeAttribute(name);
}
