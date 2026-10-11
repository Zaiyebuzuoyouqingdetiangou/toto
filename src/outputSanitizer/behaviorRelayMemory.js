// 接力结果的记忆：某一面里哪几块插件区域已经交给老修复器。按这一面插件区域的类型和文字认面，
// 存在本机；重新打开、刷新、换页回来时，接插件之前先把这几块标成“已交给老修复器”，不用再点一次维修。
const KEY = 'rabbitMirrorBehaviorRelay';
const LIMIT = 300;

function hash(text) {
    let h = 0;
    for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
}

function pluginGroups(root) {
    const scope = root?.matches?.('details') ? root : root?.querySelector?.('details') || root;
    return [...(scope?.querySelectorAll?.('[data-rm-ui], [data-rm-released]') || [])]
        .filter(group => (group.getAttribute('data-rm-ui') || group.getAttribute('data-rm-released')) !== 'scroll');
}

// 某一块在“认面顺序”里的序号（含已交给老修复器的块），记忆按这个序号存。
export function behaviorRelayGroupIndex(root, group) {
    return pluginGroups(root).indexOf(group);
}

// 只取模型写的文字：跳过插件和修复器后来加进去的东西（手机按钮条、“已记录”提示、连线层、工具按钮），
// 这样刚打开时算的指纹和维修后算的一样。
const RUNTIME = '[data-rm-mobile-controls], [role="status"][aria-live], svg[data-rm-lines], [data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-inert-action-status]';
function authoredText(group) {
    let text = '';
    const walk = node => {
        for (const child of node.childNodes || []) {
            if (child.nodeType === 3) text += child.nodeValue || '';
            else if (child.nodeType === 1 && !child.matches?.(RUNTIME)) walk(child);
            if (text.length > 600) return;
        }
    };
    walk(group);
    return text.replace(/\s+/g, '').slice(0, 300);
}

// 认面的指纹：各块的类型加文字（不含工具按钮），和块的先后顺序。
export function behaviorRelayFaceKey(root) {
    const groups = pluginGroups(root);
    if (!groups.length) return '';
    return hash(groups.map(group => `${group.getAttribute('data-rm-ui') || group.getAttribute('data-rm-released')}:${authoredText(group)}`).join('|'));
}

function read() {
    try { const value = JSON.parse(globalThis.localStorage?.getItem(KEY) || '{}'); return value && typeof value === 'object' ? value : {}; } catch { return {}; }
}

export function rememberBehaviorRelay(key, indexes) {
    if (!key || !indexes?.length) return;
    try {
        const store = read();
        store[key] = [...new Set([...(store[key] || []), ...indexes.map(Number)])].filter(Number.isInteger);
        const keys = Object.keys(store);
        for (const old of keys.slice(0, Math.max(0, keys.length - LIMIT))) delete store[old];
        globalThis.localStorage?.setItem(KEY, JSON.stringify(store));
    } catch { /* 本机存不了就只对当前画面生效 */ }
}

// 在接插件之前调用：记过的块直接标成已交给老修复器（只改标识，此时还没有任何监听，不用换节点）。
export function applyRememberedBehaviorRelay(root) {
    const key = behaviorRelayFaceKey(root);
    if (!key) return 0;
    const indexes = read()[key];
    if (!Array.isArray(indexes) || !indexes.length) return 0;
    const groups = pluginGroups(root);
    let applied = 0;
    for (const index of indexes) {
        const group = groups[index];
        if (!group?.hasAttribute('data-rm-ui')) continue;
        group.setAttribute('data-rm-released', group.getAttribute('data-rm-ui') || 'unknown');
        group.removeAttribute('data-rm-ui');
        applied += 1;
    }
    return applied;
}

// ——— 反向接力的记忆：手写区域里哪几块改由插件接管、各个部件写什么标识 ———
const REVERSE_KEY = 'rabbitMirrorBehaviorReverse';
const SKIP = `${RUNTIME}, style, script, template, [data-rabbit-mirror-diagnostic-panel], .rabbit-mirror-maintenance-menu, [data-rm-face-swipe-host], [data-rm-image-region], [data-rm-image-portal], [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat]`;

// 模型写的元素（按文档顺序），跳过标题栏和插件、修复器后来加进去的东西；刚打开时和维修后数出来的一致。
export function authoredElements(details) {
    const list = [];
    const walk = node => {
        for (const child of node.children || []) {
            if (child.matches?.(SKIP) || (node === details && child.matches?.('summary'))) continue;
            list.push(child);
            walk(child);
        }
    };
    if (details) walk(details);
    return list;
}

export function elementSignature(node) {
    if (!node) return '';
    const first = String(node.getAttribute?.('class') || '').split(/\s+/).filter(Boolean)[0] || '';
    return `${node.tagName}.${first}`;
}

export function behaviorFaceTextKey(details) {
    const nodes = authoredElements(details);
    if (!nodes.length) return '';
    // 按结构认面：每个元素的标签和第一个类名。标题栏、修复器改过的文字都不影响它。
    return hash(nodes.map(elementSignature).join(','));
}

function readReverse() {
    try { const value = JSON.parse(globalThis.localStorage?.getItem(REVERSE_KEY) || '{}'); return value && typeof value === 'object' ? value : {}; } catch { return {}; }
}

export function rememberReversePatches(key, patches) {
    if (!key || !patches?.length) return;
    try {
        const store = readReverse();
        store[key] = patches;
        const keys = Object.keys(store);
        for (const old of keys.slice(0, Math.max(0, keys.length - LIMIT))) delete store[old];
        globalThis.localStorage?.setItem(REVERSE_KEY, JSON.stringify(store));
    } catch { /* 本机存不了就只对当前画面生效 */ }
}

// 打开时、接插件之前：记过的块按记录写上插件标识。每个部件都要和记录时同一种元素才写，对不上就整块跳过。
export function applyRememberedReversePatches(root) {
    const details = root?.matches?.('details') ? root : root?.querySelector?.('details');
    if (!details) return 0;
    const key = behaviorFaceTextKey(details);
    const patches = key ? readReverse()[key] : null;
    if (!Array.isArray(patches) || !patches.length) return 0;
    const nodes = authoredElements(details);
    let applied = 0;
    for (const patch of patches) {
        const group = nodes[patch.group];
        if (!group || group.hasAttribute('data-rm-ui') || !Array.isArray(patch.sig)) continue;
        if (!patch.sig.every(([index, signature]) => elementSignature(nodes[index]) === signature)) continue;
        applyReversePatch(nodes, patch);
        applied += 1;
    }
    return applied;
}

// 把一条反向接力记录写到元素上。多选一时，模型写死在按钮和面板上的“选中”类（active、current、show…）先拿掉，
// 改由插件按当前选中项加上，免得两个按钮同时亮。
const AUTHORED_STATE = /^(?:is-)?(?:active|current|show|shown|open|selected|on|checked)$/;
export function applyReversePatch(nodes, patch) {
    const group = nodes[patch.group];
    if (!group) return false;
    group.setAttribute('data-rm-ui', patch.type);
    group.setAttribute('data-rm-behavior-recovered', 'reverse');
    if (patch.type === 'pick') {
        for (const index of [...patch.controls, ...patch.panels]) {
            const node = nodes[index];
            for (const name of [...(node?.classList || [])]) if (AUTHORED_STATE.test(name)) node.classList.remove(name);
        }
        patch.controls.forEach((index, order) => nodes[index]?.setAttribute('data-rm-pick', String(order + 1)));
        patch.panels.forEach((index, order) => nodes[index]?.setAttribute('data-rm-show', String(order + 1)));
        if (patch.picked >= 0) group.setAttribute('data-rm-picked', String(patch.picked + 1));
    } else for (const index of patch.controls) nodes[index]?.setAttribute('data-rm-toggle', '');
    return true;
}
