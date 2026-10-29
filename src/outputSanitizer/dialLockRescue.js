import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=1.99.12";
const BOUND_ATTR = 'data-rm-dial-lock';
const WHEEL_ATTR = 'data-rm-dial-wheel';
const OPEN_ATTR = 'data-rm-dial-open';
const BOUND = new WeakSet();
const CN = __rmT("NkZdUARLNGutqP8iOfZvS6bwD.p");
const DIGIT = `[0-9${CN}]`;
const OPEN_WORD = /^(?:unlocked|unlock|open|opened|solved|success|succeeded|done|true|win|cleared|revealed)$/i;
function faceRules(root) {
    const rules = [];
    const walk = list => {
        for (const rule of list || []) {
            if (typeof rule.selectorText === 'string' && rule.style)
                rules.push(rule);
            else if (rule.cssRules)
                walk(rule.cssRules);
        }
    };
    for (const node of root.querySelectorAll('style')) {
        try {
            walk(node.sheet?.cssRules);
        }
        catch { }
    }
    return rules;
}
function hasOwnAction(control) {
    if (control.tagName === 'LABEL') {
        const id = control.getAttribute('for');
        if (!id)
            return true;
        return Boolean(control.ownerDocument.getElementById(id) || control.querySelector('input, select, textarea'));
    }
    if (control.disabled || control.hasAttribute('popovertarget') || control.hasAttribute('commandfor'))
        return true;
    if (control.closest('a[href], form, label'))
        return true;
    if ([...control.attributes].some(attr => /^data-rm-(?!polish|press|dial|select)/.test(attr.name) || /^data-rabbit-mirror-.*(?:rescue|wired|fallback)/.test(attr.name)))
        return true;
    return /^(?:submit|reset)$/i.test(control.getAttribute('type') || '');
}
function digitLeaves(column) {
    return [...column.querySelectorAll('*')].filter(node => !node.children.length && /^\s*\d\s*$/.test(node.textContent || '') && !node.closest('label, button'));
}
function findColumns(root) {
    const columns = [];
    const seen = new Set();
    for (const control of root.querySelectorAll('label[for], button, [role="button"]')) {
        if (control.closest('[data-rm-ui]') || hasOwnAction(control))
            continue;
        if (!__rmR("C2dviM97AY2ErgyTutpEGRVLh0wMI7Dur6qukVjJNzsOMERBBCxNXcvqoM3hp6LuoVqJGQru4dv4s0C6D0jIHXZE9aHh9FMTo4m0R.uznznjaPhv", "i").test(control.textContent || ''))
            continue;
        for (let column = control.parentElement; column && column !== root; column = column.parentElement) {
            const wheels = digitLeaves(column);
            if (!wheels.length)
                continue;
            if (wheels.length === 1) {
                if (!seen.has(column)) {
                    seen.add(column);
                    columns.push({ column, wheel: wheels[0], controls: [] });
                }
                columns.find(item => item.column === column).controls.push(control);
            }
            break;
        }
    }
    return columns.filter(item => item.controls.length <= 2);
}
function toNumber(char) {
    const index = CN.indexOf(char);
    return index >= 0 ? index : Number(char);
}
function findCode(root, count, wheels) {
    const pattern = new RegExp(`(?:^|[^0-9${CN}])(${DIGIT}${__rmT("hzdr_qyj1EUxjnE5Tcdy_VcTbaOV1ifOPPyTAvyQvET8Aoh4ivcBVbROD2G")}${DIGIT}){${count - 1}})(?![0-9${CN}])`);
    const texts = [];
    const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        if (!parent || wheels.some(wheel => wheel === parent) || parent.closest('[hidden], style, script, [data-rm-draw-frame]'))
            continue;
        texts.push(String(node.textContent || ''));
    }
    const ordered = [...texts.filter(text => __rmR("VFVnOLZ1jpa2Y370mazfRzgDG6aw.8tJvU0sj6AZXBTOeDhahwGpgpkfS.uFleBY", "i").test(text)), ...texts];
    for (const text of ordered) {
        const match = text.match(pattern);
        if (match)
            return [...match[1].replace(__rmR("n9_BYicXD3hPcBfVVlu54FMwwmMWX91LXw.bFZL7_28", "g"), '')].map(toNumber);
    }
    const tight = new RegExp(`${__rmT("JKvB3gI0WdkhQaI3OTiU8gPTE8BPbTzmzslqlplO7s3HlFia8jlLz9WnwzFdNuWHMTEE9F3zCiQvuAAuTeT6GVFJfwG_8k87")}${CN}]{0,8}?(${DIGIT}{${count}})(?![0-9${CN}])`, 'i');
    for (const text of texts) {
        const match = text.match(tight);
        if (match)
            return [...match[1]].map(toNumber);
    }
    return null;
}
const TARGET_ATTR = 'data-rm-dial-target';
const LOCK_DEPTH = 4;
const WRONG_TEXT = __rmR("Qx75hsGUByTHBb7QGS3p2_E206PPRatEW2nDMCM9P6cebwdXn3iFZO.3nYETu0t5vlhW52qHAWs9fnLx2q9L31oah..reLYnlKNJ9ZbN", "i");
function lockScope(root, columns) {
    let scope = columns[0].column.parentElement;
    while (scope && scope !== root && !columns.every(item => scope.contains(item.column)))
        scope = scope.parentElement;
    return scope || root;
}
function nearScope(node, scope, root) {
    if (!node.contains(scope) || !root.contains(node) || node.closest('[data-rm-ui]'))
        return false;
    let depth = 0;
    for (let up = scope; up && up !== node; up = up.parentElement)
        depth += 1;
    return depth <= LOCK_DEPTH;
}
function findLock(root, scope) {
    for (const rule of faceRules(root)) {
        for (const piece of rule.selectorText.split(',')) {
            for (const match of piece.matchAll(/\[(data-(?!rabbit-|rm-(?:ui|on|done|active|count|index|picked)\b)[\w-]+)\s*=\s*["']?([\w-]+)["']?\s*\]/g)) {
                if (!OPEN_WORD.test(match[2]))
                    continue;
                const carrier = [...root.querySelectorAll(`[${match[1]}]`)].find(node => node.getAttribute(match[1]) !== match[2] && nearScope(node, scope, root));
                if (carrier)
                    return { carrier, attr: match[1], value: match[2] };
            }
        }
    }
    for (const rule of faceRules(root)) {
        for (const piece of rule.selectorText.split(',')) {
            for (const compound of piece.split(/\s*[\s>+~]\s*/)) {
                const names = (compound.match(/\.[\w-]+/g) || []).map(name => name.slice(1));
                const open = names.find(name => OPEN_WORD.test(name.replace(/^(?:is|has|state|rm)[-_]/i, '')));
                if (!open)
                    continue;
                const bare = compound.replace(new RegExp(`\\.${open}(?![\\w-])`), '').replace(/:[\w-]+(?:\([^()]*\))?/g, '').trim();
                if (!bare)
                    continue;
                let carrier = null;
                try {
                    carrier = [...root.querySelectorAll(bare)].find(node => !node.classList.contains(open) && nearScope(node, scope, root));
                }
                catch {
                    carrier = null;
                }
                if (carrier)
                    return { carrier, className: open };
            }
        }
    }
    return null;
}
function findHiddenReward(root, columns, scope) {
    const last = columns[columns.length - 1].column;
    let box = scope;
    for (let level = 0; box && level < 3; level += 1, box = box === root ? null : box.parentElement) {
        const hidden = [...box.children].find(node => (last.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) && !node.contains(last)
            && !node.matches('style, script, template, [data-rm-ui]') && !node.querySelector('[data-rm-ui]')
            && (node.hidden || getComputedStyle(node).display === 'none')
            && String(node.textContent || '').trim().length >= 8 && !WRONG_TEXT.test(String(node.textContent || '').slice(0, 40)));
        if (hidden)
            return { reward: hidden };
    }
    return null;
}
function savedLock(root) {
    const carrier = root.querySelector(`[${TARGET_ATTR}]`);
    if (!carrier)
        return undefined;
    const mark = carrier.getAttribute(TARGET_ATTR) || '';
    let match = mark.match(/^attr:(data-[\w-]+)=([\w-]+)$/);
    if (match)
        return { carrier, attr: match[1], value: match[2] };
    match = mark.match(/^class:([\w-]+)$/);
    if (match)
        return { carrier, className: match[1] };
    if (mark === 'reward')
        return { reward: carrier };
    return null;
}
function rememberLock(lock) {
    if (lock.attr)
        lock.carrier.setAttribute(TARGET_ATTR, `attr:${lock.attr}=${lock.value}`);
    else if (lock.className)
        lock.carrier.setAttribute(TARGET_ATTR, `class:${lock.className}`);
    else
        lock.reward.setAttribute(TARGET_ATTR, 'reward');
}
function isOpen(lock) {
    if (lock.attr)
        return lock.carrier.getAttribute(lock.attr) === lock.value;
    if (lock.className)
        return lock.carrier.classList.contains(lock.className);
    return lock.reward.hasAttribute(OPEN_ATTR);
}
function openLock(lock) {
    if (lock.attr) {
        if (!lock.carrier.hasAttribute(OPEN_ATTR))
            lock.carrier.setAttribute(OPEN_ATTR, lock.carrier.getAttribute(lock.attr) || '');
        lock.carrier.setAttribute(lock.attr, lock.value);
    }
    else if (lock.className) {
        lock.carrier.classList.add(lock.className);
        lock.carrier.setAttribute(OPEN_ATTR, lock.className);
    }
    else {
        lock.reward.hidden = false;
        lock.reward.style.setProperty('display', 'block', 'important');
        lock.reward.setAttribute(OPEN_ATTR, 'reward');
    }
}
function findConfirm(lock, columns, scope) {
    const region = lock.carrier || lock.reward.parentElement || scope;
    return [...region.querySelectorAll('button, [role="button"]')].find(button => !columns.some(item => item.controls.includes(button))
        && !button.closest('[data-rm-ui]') && !hasOwnAction(button)
        && __rmR("3TYIGHg5DX3v72bv8hFAWLO0gFhyhVGnZ.OEG.ctydz8qgH5qotcKFtpCuaWyt7fU1BHTK9_UQPv3uKa4k57ybubgTdl3xu4McIDoGzlg2v5wdDaNqDKAvSVCKf74RHiKsaN9L3eGUw3c6JxJBysoEG9DczF2oYXdnk1tB.F20h2pupRB05R4AQDVm5GW6BldcB", "i").test(button.textContent || '')) || null;
}
function ensureStyle(doc) {
    if (doc.getElementById('rabbit-mirror-dial-lock-style'))
        return;
    const style = doc.createElement('style');
    style.id = 'rabbit-mirror-dial-lock-style';
    style.textContent = `[${BOUND_ATTR}] label[${WHEEL_ATTR}],[${BOUND_ATTR}] [${WHEEL_ATTR}]{cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:manipulation;}`;
    (doc.head || doc.documentElement).append(style);
}
export function installDialLockRescue(root) {
    if (!root?.querySelectorAll || typeof document === 'undefined')
        return 0;
    const columns = findColumns(root);
    if (columns.length < 2 || columns.length > 8)
        return 0;
    const wheels = columns.map(item => item.wheel);
    const code = findCode(root, columns.length, wheels);
    if (!code)
        return 0;
    const scope = lockScope(root, columns);
    let lock = savedLock(root);
    if (lock === undefined) {
        lock = findLock(root, scope) || findHiddenReward(root, columns, scope);
        if (lock)
            rememberLock(lock);
    }
    const confirm = lock ? findConfirm(lock, columns, scope) : null;
    ensureStyle(root.ownerDocument || document);
    root.setAttribute(BOUND_ATTR, `${columns.length}:code${lock ? ':lock' : ''}${confirm ? ':confirm' : ''}`);
    const matches = () => wheels.every((wheel, index) => Number(String(wheel.textContent).trim()) === code[index]);
    const check = () => { if (lock && matches())
        openLock(lock); };
    for (const { wheel, controls } of columns) {
        for (const control of controls) {
            control.setAttribute(WHEEL_ATTR, '');
            if (BOUND.has(control))
                continue;
            BOUND.add(control);
            if (control.tagName === 'LABEL') {
                control.setAttribute('role', 'button');
                control.tabIndex = 0;
            }
            const back = __rmR("7JRlN0_KpBa0IlDAMdtatMtiAAYoVdSQvcdXEf", "").test(control.textContent || '');
            const turn = event => {
                event.preventDefault();
                if (lock && isOpen(lock))
                    return;
                const value = Number(String(wheel.textContent).trim()) || 0;
                wheel.textContent = String((value + (back ? 9 : 1)) % 10);
                if (!confirm)
                    check();
            };
            control.addEventListener('click', turn);
            if (control.tagName === 'LABEL')
                control.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ')
                    turn(event); });
        }
    }
    if (confirm && !BOUND.has(confirm)) {
        BOUND.add(confirm);
        confirm.setAttribute(WHEEL_ATTR, 'confirm');
        confirm.addEventListener('click', event => {
            event.preventDefault();
            if (matches()) {
                openLock(lock);
                return;
            }
            for (const wheel of wheels) {
                wheel.style.setProperty('outline', '2px solid #c0392b');
                setTimeout(() => wheel.style.removeProperty('outline'), 600);
            }
        });
    }
    if (!confirm)
        check();
    return columns.length;
}
