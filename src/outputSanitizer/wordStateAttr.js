const DRIVER_STATE = /^data-rm-(?:ui|on|picked|index|done|active|match|seq|miss|count|value|step|show|part|fire|play|reverse|seek|reset|hold|toggle|pick|goto|prev|next|roll|end|code|knob|item|slot|page|cover|answer|stops|placed|paired|armed|swiped(?:-left|-right)?|peeking|seen|revealed|current|edge|feedback|bridged|program|dial[\w-]*|draw[\w-]*|mobile[\w-]*|polish[\w-]*|press|title[\w-]*|body[\w-]*|result[\w-]*)$/;
function styleRules(root) {
    const rules = [];
    const walk = list => {
        for (const rule of list || []) {
            if (typeof rule.selectorText === 'string' && rule.style)
                rules.push(rule);
            else if (rule.cssRules)
                walk(rule.cssRules);
        }
    };
    for (const node of root?.querySelectorAll?.('style') || []) {
        try {
            walk(node.sheet?.cssRules);
        }
        catch { }
    }
    return rules;
}
export function findUnwrittenWordStates(root) {
    const found = new Map();
    if (!root?.querySelectorAll)
        return found;
    for (const rule of styleRules(root)) {
        for (const raw of String(rule.selectorText).split(',')) {
            const piece = raw.replace(/^\s*\[data-rabbit-mirror-css-scope=[^\]]*\]\s*/, '');
            const match = piece.match(/\[\s*(data-[\w-]+)\s*=\s*["']?([A-Za-z][\w-]*)["']?\s*\]\s+([^,]+)$/);
            if (!match || /^data-rabbit-/.test(match[1]) || DRIVER_STATE.test(match[1]))
                continue;
            const [, name, value, target] = match;
            if (/^(?:true|false|on|off|\d+)$/i.test(value))
                continue;
            if (!found.has(name))
                found.set(name, { values: [], selectors: new Set() });
            const info = found.get(name);
            if (!info.values.includes(value))
                info.values.push(value);
            info.selectors.add(target.trim());
        }
    }
    for (const [name, info] of found) {
        let present = false;
        try {
            present = [...root.querySelectorAll(`[${name}]`)].some(node => !String(node.getAttribute('data-rm-word-state') || '').split(' ').includes(name));
        }
        catch {
            present = true;
        }
        const targets = [];
        for (const selector of info.selectors) {
            try {
                targets.push(...root.querySelectorAll(selector));
            }
            catch { }
        }
        if (present || info.values.length < 2 || !targets.length) {
            found.delete(name);
            continue;
        }
        found.set(name, { values: info.values, targets: [...new Set(targets)] });
    }
    return found;
}
export function wordStateHost(root, from, targets) {
    for (let node = from?.parentElement; node; node = node === root ? null : node.parentElement) {
        if (targets.every(target => node.contains(target)))
            return node;
    }
    return null;
}
export function setWordState(host, name, value) {
    if (!host || !name)
        return;
    const marks = new Set(String(host.getAttribute('data-rm-word-state') || '').split(' ').filter(Boolean));
    marks.add(name);
    host.setAttribute('data-rm-word-state', [...marks].join(' '));
    if (value)
        host.setAttribute(name, value);
    else
        host.removeAttribute(name);
}
