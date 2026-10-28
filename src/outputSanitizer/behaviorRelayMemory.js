const KEY = 'rabbitMirrorBehaviorRelay';
const LIMIT = 300;
function hash(text) {
    let h = 0;
    for (let i = 0; i < text.length; i += 1)
        h = (h * 31 + text.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
}
function pluginGroups(root) {
    const scope = root?.matches?.('details') ? root : root?.querySelector?.('details') || root;
    return [...(scope?.querySelectorAll?.('[data-rm-ui], [data-rm-released]') || [])]
        .filter(group => (group.getAttribute('data-rm-ui') || group.getAttribute('data-rm-released')) !== 'scroll');
}
export function behaviorRelayGroupIndex(root, group) {
    return pluginGroups(root).indexOf(group);
}
const RUNTIME = '[data-rm-mobile-controls], [role="status"][aria-live], svg[data-rm-lines], [data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-inert-action-status]';
function authoredText(group) {
    let text = '';
    const walk = node => {
        for (const child of node.childNodes || []) {
            if (child.nodeType === 3)
                text += child.nodeValue || '';
            else if (child.nodeType === 1 && !child.matches?.(RUNTIME))
                walk(child);
            if (text.length > 600)
                return;
        }
    };
    walk(group);
    return text.replace(/\s+/g, '').slice(0, 300);
}
export function behaviorRelayFaceKey(root) {
    const groups = pluginGroups(root);
    if (!groups.length)
        return '';
    return hash(groups.map(group => `${group.getAttribute('data-rm-ui') || group.getAttribute('data-rm-released')}:${authoredText(group)}`).join('|'));
}
function read() {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(KEY) || '{}');
        return value && typeof value === 'object' ? value : {};
    }
    catch {
        return {};
    }
}
export function rememberBehaviorRelay(key, indexes) {
    if (!key || !indexes?.length)
        return;
    try {
        const store = read();
        store[key] = [...new Set([...(store[key] || []), ...indexes.map(Number)])].filter(Number.isInteger);
        const keys = Object.keys(store);
        for (const old of keys.slice(0, Math.max(0, keys.length - LIMIT)))
            delete store[old];
        globalThis.localStorage?.setItem(KEY, JSON.stringify(store));
    }
    catch { }
}
export function applyRememberedBehaviorRelay(root) {
    const key = behaviorRelayFaceKey(root);
    if (!key)
        return 0;
    const indexes = read()[key];
    if (!Array.isArray(indexes) || !indexes.length)
        return 0;
    const groups = pluginGroups(root);
    let applied = 0;
    for (const index of indexes) {
        const group = groups[index];
        if (!group?.hasAttribute('data-rm-ui'))
            continue;
        group.setAttribute('data-rm-released', group.getAttribute('data-rm-ui') || 'unknown');
        group.removeAttribute('data-rm-ui');
        applied += 1;
    }
    return applied;
}
const REVERSE_KEY = 'rabbitMirrorBehaviorReverse';
const SKIP = `${RUNTIME}, style, script, template, [data-rabbit-mirror-diagnostic-panel], .rabbit-mirror-maintenance-menu, [data-rm-face-swipe-host], [data-rm-image-region], [data-rm-image-portal], [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat]`;
export function authoredElements(details) {
    const list = [];
    const walk = node => {
        for (const child of node.children || []) {
            if (child.matches?.(SKIP) || (node === details && child.matches?.('summary')))
                continue;
            list.push(child);
            walk(child);
        }
    };
    if (details)
        walk(details);
    return list;
}
export function elementSignature(node) {
    if (!node)
        return '';
    const first = String(node.getAttribute?.('class') || '').split(/\s+/).filter(Boolean)[0] || '';
    return `${node.tagName}.${first}`;
}
export function behaviorFaceTextKey(details) {
    const nodes = authoredElements(details);
    if (!nodes.length)
        return '';
    return hash(nodes.map(elementSignature).join(','));
}
function readReverse() {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(REVERSE_KEY) || '{}');
        return value && typeof value === 'object' ? value : {};
    }
    catch {
        return {};
    }
}
export function rememberReversePatches(key, patches) {
    if (!key || !patches?.length)
        return;
    try {
        const store = readReverse();
        store[key] = patches;
        const keys = Object.keys(store);
        for (const old of keys.slice(0, Math.max(0, keys.length - LIMIT)))
            delete store[old];
        globalThis.localStorage?.setItem(REVERSE_KEY, JSON.stringify(store));
    }
    catch { }
}
export function applyRememberedReversePatches(root) {
    const details = root?.matches?.('details') ? root : root?.querySelector?.('details');
    if (!details)
        return 0;
    const key = behaviorFaceTextKey(details);
    const patches = key ? readReverse()[key] : null;
    if (!Array.isArray(patches) || !patches.length)
        return 0;
    const nodes = authoredElements(details);
    let applied = 0;
    for (const patch of patches) {
        const group = nodes[patch.group];
        if (!group || group.hasAttribute('data-rm-ui') || !Array.isArray(patch.sig))
            continue;
        if (!patch.sig.every(([index, signature]) => elementSignature(nodes[index]) === signature))
            continue;
        applyReversePatch(nodes, patch);
        applied += 1;
    }
    return applied;
}
const AUTHORED_STATE = /^(?:is-)?(?:active|current|show|shown|open|selected|on|checked)$/;
export function applyReversePatch(nodes, patch) {
    const group = nodes[patch.group];
    if (!group)
        return false;
    group.setAttribute('data-rm-ui', patch.type);
    group.setAttribute('data-rm-behavior-recovered', 'reverse');
    if (patch.type === 'pick') {
        for (const index of [...patch.controls, ...patch.panels]) {
            const node = nodes[index];
            for (const name of [...(node?.classList || [])])
                if (AUTHORED_STATE.test(name))
                    node.classList.remove(name);
        }
        const key = order => Array.isArray(patch.keys) ? String(patch.keys[order]) : String(order + 1);
        patch.controls.forEach((index, order) => nodes[index]?.setAttribute('data-rm-pick', key(order)));
        patch.panels.forEach((index, order) => nodes[index]?.setAttribute('data-rm-show', key(order)));
        if (patch.attr)
            group.setAttribute('data-rm-pick-attr', patch.attr);
        if (patch.picked >= 0)
            group.setAttribute('data-rm-picked', key(patch.picked));
    }
    else
        for (const index of patch.controls)
            nodes[index]?.setAttribute('data-rm-toggle', '');
    return true;
}
