import { diagnosticIsInternalUiNode } from './diagnostics.js?rmv=2.1.10';
import { ensureNestedDetailsPopupRescueStyle } from './fallbackRescue.js?rmv=2.1.10';
import { restoreRabbitMirrorAvatarClone } from '../chatAvatars.js?rmv=2.1.10';
import { hashInteractionSignature } from './runtime.js?rmv=2.1.10';
import { NESTED_DETAILS_POPUP_RESCUE_ATTR, NESTED_DETAILS_POPUP_CONTENT_ATTR, NESTED_DETAILS_POPUP_HOST_ATTR, NESTED_DETAILS_POPUP_COUNT_ATTR, } from './checkedStateRescue.js?rmv=2.1.10';
const SAFE_VALUES = Object.freeze({
    'height': ['auto'], 'max-height': ['none'], 'min-width': ['0', '0px'],
    'width': ['100%'], 'max-width': ['100%'], 'box-sizing': ['border-box'],
    'overflow': ['visible'], 'overflow-x': ['visible'], 'overflow-y': ['visible'],
    'overflow-wrap': ['anywhere'], 'word-break': ['break-word'], 'text-overflow': ['clip'],
    'white-space': ['normal', 'pre-wrap'], 'line-height': ['1.35'], 'display': ['block'],
    '-webkit-line-clamp': ['unset'], 'line-clamp': ['unset'], '-webkit-box-orient': ['initial'],
});
const popupMarkers = () => [NESTED_DETAILS_POPUP_RESCUE_ATTR, NESTED_DETAILS_POPUP_CONTENT_ATTR, NESTED_DETAILS_POPUP_HOST_ATTR];
const scopedId = value => String(value || '').replace(/^rm-[a-z0-9]+-[a-z0-9]+-[a-z0-9]{5}-/i, '');
const anchor = root => root?.matches?.('details') ? root : root?.querySelector?.(':scope > details') || root?.querySelector?.('details');
const contentChildren = node => [...(node?.children || [])].filter(child => !/^(STYLE|SCRIPT|TEMPLATE)$/i.test(child.tagName || '') && !diagnosticIsInternalUiNode(child)
    && !child.closest?.('[data-rabbit-mirror-tool-entry-host]'));
function identity(node) {
    const id = scopedId(node.getAttribute?.('id'));
    if (id)
        return `${node.tagName}|${id}`;
    const clone = node.cloneNode(true);
    restoreRabbitMirrorAvatarClone(node, clone);
    for (const child of clone.querySelectorAll?.('*') || []) {
        if (/^(STYLE|SCRIPT|TEMPLATE|BUTTON|SUMMARY|INPUT|SELECT|TEXTAREA)$/i.test(child.tagName || '') || diagnosticIsInternalUiNode(child)
            || child.closest?.('[data-rabbit-mirror-tool-entry-host]'))
            child.remove();
    }
    return hashInteractionSignature([node.tagName, String(clone.textContent || '').replace(/\s+/g, ' ').trim()].join('|'));
}
function revealPathLookup(base) {
    const identities = new WeakMap(), families = new WeakMap();
    const readIdentity = node => {
        if (!identities.has(node)) {
            try {
                identities.set(node, identity(node));
            }
            catch {
                identities.set(node, null);
            }
        }
        return identities.get(node);
    };
    const familyKey = (tag, id) => `${tag}|${id}`;
    const childrenOf = parent => {
        if (!families.has(parent)) {
            const children = contentChildren(parent), groups = new Map();
            for (const child of children) {
                const key = familyKey(child.tagName, scopedId(child.getAttribute?.('id')));
                if (!groups.has(key))
                    groups.set(key, { nodes: [], identities: null });
                groups.get(key).nodes.push(child);
            }
            families.set(parent, { children, groups });
        }
        return families.get(parent);
    };
    const resolve = (path, recordingNode = null) => {
        let node = base;
        const verified = [];
        for (const part of path) {
            const { children, groups } = childrenOf(node);
            const candidate = children[part.index];
            if (!candidate || candidate.tagName !== part.tag || scopedId(candidate.getAttribute?.('id')) !== part.id)
                return null;
            const family = groups.get(familyKey(part.tag, part.id));
            if (part.id) {
                if (family.nodes.length !== 1)
                    return null;
                verified.push({ ...part });
            }
            else {
                if (!family.identities) {
                    family.identities = new Map();
                    for (const sibling of family.nodes) {
                        const key = readIdentity(sibling);
                        family.identities.set(key, (family.identities.get(key) || 0) + 1);
                    }
                }
                const key = readIdentity(candidate);
                if (!key || family.identities.has(null) || family.identities.get(key) !== 1
                    || (!recordingNode && part.identity !== key))
                    return null;
                verified.push({ ...part, identity: key });
            }
            node = candidate;
        }
        return recordingNode && node !== recordingNode ? null : { node, path: verified };
    };
    return { readIdentity, resolve };
}
export function captureMaintenanceRevealBaseline(root) {
    const base = anchor(root);
    if (!base)
        return null;
    const stack = [{ node: base, path: [] }], entries = [];
    while (stack.length) {
        const { node, path } = stack.pop();
        if (entries.length >= 2200 || path.length > 64)
            return null;
        entries.push({ node, path,
            styles: Object.fromEntries(Object.keys(SAFE_VALUES).map(key => [key,
                [node.style?.getPropertyValue(key) || '', node.style?.getPropertyPriority(key) || '']])),
            markers: Object.fromEntries(popupMarkers().map(key => [key, node.getAttribute?.(key)])),
        });
        const children = contentChildren(node);
        for (let index = children.length - 1; index >= 0; index--) {
            const child = children[index];
            stack.push({ node: child, path: [...path, { index, tag: child.tagName, id: scopedId(child.getAttribute?.('id')) }] });
        }
    }
    return { base, entries };
}
export function collectMaintenanceRevealPatches(baseline) {
    if (!baseline?.base?.isConnected)
        return [];
    const patches = [];
    const lookup = revealPathLookup(baseline.base);
    for (const { node, path, styles: before, markers: beforeMarkers } of baseline.entries) {
        if (!node.isConnected || !baseline.base.contains(node))
            continue;
        const styles = {};
        if (path.length)
            for (const [key, allowed] of Object.entries(SAFE_VALUES)) {
                const value = node.style?.getPropertyValue(key) || '';
                const priority = node.style?.getPropertyPriority(key) || '';
                if (allowed.includes(value) && priority === 'important'
                    && (value !== before[key][0] || priority !== before[key][1]))
                    styles[key] = value;
            }
        const markers = popupMarkers().filter(key => beforeMarkers[key] !== 'true' && node.getAttribute?.(key) === 'true');
        if (!Object.keys(styles).length && !markers.length)
            continue;
        try {
            const match = lookup.resolve(path, node);
            if (!match)
                continue;
            const key = lookup.readIdentity(node);
            if (key)
                patches.push({ path: match.path, identity: key, styles, markers });
        }
        catch { }
    }
    return patches;
}
export function mergeMaintenanceRevealPatches(previous = [], additions = []) {
    const merged = new Map();
    for (const patch of [...previous, ...additions]) {
        const key = JSON.stringify(patch.path.map(({ index, tag, id }) => ({ index, tag, id })));
        const old = merged.get(key);
        const sameIdentity = old?.identity === patch.identity
            && old.path.every((part, index) => part.identity === patch.path[index].identity);
        merged.set(key, { ...patch, path: patch.path.map(part => ({ ...part })),
            styles: { ...(sameIdentity ? old.styles : {}), ...patch.styles },
            markers: [...new Set([...(sameIdentity ? old.markers : []), ...patch.markers])],
        });
    }
    return [...merged.values()];
}
export function replayMaintenanceRevealPatches(root, patches = []) {
    const base = anchor(root);
    if (!base)
        return 0;
    const lookup = revealPathLookup(base);
    let repaired = 0, popup = false;
    for (const patch of patches) {
        const node = lookup.resolve(patch.path)?.node;
        if (!node?.isConnected || !base.contains(node))
            continue;
        if (lookup.readIdentity(node) !== patch.identity)
            continue;
        let changed = false;
        for (const [key, value] of Object.entries(patch.styles)) {
            if (!patch.path.length || !SAFE_VALUES[key]?.includes(value))
                continue;
            if (node.style.getPropertyValue(key) !== value || node.style.getPropertyPriority(key) !== 'important') {
                node.style.setProperty(key, value, 'important');
                changed = true;
            }
        }
        for (const key of patch.markers)
            if (popupMarkers().includes(key)) {
                if (node.getAttribute(key) !== 'true') {
                    node.setAttribute(key, 'true');
                    changed = true;
                }
                popup = true;
            }
        if (changed)
            repaired++;
    }
    if (popup) {
        ensureNestedDetailsPopupRescueStyle(base);
        base.setAttribute(NESTED_DETAILS_POPUP_COUNT_ATTR, String(base.querySelectorAll(`[${NESTED_DETAILS_POPUP_RESCUE_ATTR}="true"]`).length));
    }
    return repaired;
}
