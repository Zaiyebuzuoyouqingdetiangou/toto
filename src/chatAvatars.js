// Optional, local-only avatar consumer. Model markers describe a role, never an
// image URL, an owner, or permission to replace arbitrary artwork.
import { getSettings } from './settings.js?rmv=1.67.57';
import { getCurrentChatKey } from './storage.js?rmv=1.67.57';
import { getSanitizedRabbitMirrorFaceProof, markSanitizedRabbitMirrorFace, rabbitMirrorMultifaceSourceHash, rabbitMirrorMessageSourceHash } from './multifaceProof.js?rmv=1.67.57';
import { subscribeRabbitMirrorChatSurface } from './hostCompatibility.js?rmv=1.67.57';

const MARKERS = '[data-rm-avatar="char"], [data-rm-avatar="user"]';
const FACES = 'toto, details[data-rabbit-mirror-external-details]';
const trusted = new WeakSet();
const origins = new WeakMap();
let active = null;

function context() { try { return globalThis.SillyTavern?.getContext?.() || null; } catch { return null; } }
function currentOrigin() {
    const ctx = context();
    if (!ctx || ctx.groupId || !Array.isArray(ctx.chat)) return null;
    try { return { key: getCurrentChatKey(ctx.chat), character: String(ctx.characterId ?? ''), chat: ctx.chat }; }
    catch { return null; }
}
function sameOrigin(a, b) { return !!a && !!b && a.key === b.key && a.character === b.character && a.chat === b.chat; }
function boundOwnerIsCurrent(bound, origin, message, pair, root = null) {
    if (!bound || !sameOrigin(bound, origin) || (bound.message && bound.message !== message)
        || (bound.scope && pair && bound.scope !== pair.scope)) return false;
    const clone = bound.cloneSource;
    if (!clone) return true;
    return origin.chat[clone.index] === message && String(message?.mes || '') === clone.source
        && Number(message?.swipe_id || 0) === clone.swipe
        && (!root?.isConnected || root.closest('[data-rm-owner-chat]') === clone.host);
}
function imageUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    const url = value.trim();
    if (/^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z\d+/=\s]+$/i.test(url)) return url;
    try {
        const parsed = new URL(url, globalThis.location?.href);
        if (['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password) return parsed.href;
        if (parsed.protocol === 'blob:' && parsed.origin === globalThis.location?.origin) return parsed.href;
    } catch { /* A missing or unsupported image keeps the original avatar. */ }
    return '';
}
function currentPair() {
    try {
        const api = globalThis.HearttraceAvatars;
        if (api?.apiVersion !== 1 || typeof api.getCurrent !== 'function') return null;
        const pair = api.getCurrent();
        if (pair?.version !== 1 || typeof pair.scope !== 'string' || !pair.scope || pair.revision == null) return null;
        const char = imageUrl(pair.char?.url), user = imageUrl(pair.user?.url);
        return char || user ? { scope: pair.scope, revision: String(pair.revision), char, user } : null;
    } catch { return null; }
}

// Called by every formal prompt path, without initializing the DOM consumer or
// serializing the pair. Absent integration preserves previous prompt bytes.
export function rabbitMirrorAvatarPromptRule(settings) {
    if (settings?.enabled === false || settings?.mode === 'off') return '';
    const pair = currentPair();
    if (!pair) return '';
    const roles = [pair.char ? '当前角色用 data-rm-avatar="char"' : '', pair.user ? '当前用户用 data-rm-avatar="user"' : ''].filter(Boolean).join('；');
    return `\n【已有头像的本地显示】\n任何题材或场景中，若原设计本就含当前角色／用户的头像位置，${roles}，标在原头像 img 或头像容器上，保留原形状、尺寸及原有后备内容，由本地替换图片。不要额外增加头像框，不输出头像 URL、base64 或脚本；不要为这些头像创建 data-rm-draw-frame／生图占位。NPC、插画主体、照片内容、商品及装饰图片不得标成这两个头像。没有头像位置就不添加。\n`;
}

// Local sanitizer/host-render handoff. A model provenance attr is insufficient:
// the root must belong to the exact currently mounted native message source.
export function bindRabbitMirrorAvatarRoot(root) {
    if (!root?.querySelectorAll) return false;
    const origin = currentOrigin();
    if (!origin) return false;
    const previous = origins.get(root);
    if (previous && !sameOrigin(previous, origin)) return false;
    const message = rootOwner(root, origin);
    if (!message) return false;
    if (previous && !boundOwnerIsCurrent(previous, origin, message, currentPair(), root)) return false;
    trusted.add(root);
    if (!previous) origins.set(root, { ...origin, scope: currentPair()?.scope || '', message });
    active?.queue(root);
    return true;
}

function provenRoot(node) {
    let current = node?.nodeType === 1 ? node : node?.parentElement;
    while (current && current !== active?.chatRoot) {
        if (trusted.has(current) || getSanitizedRabbitMirrorFaceProof(current)) return current;
        current = current.parentElement;
    }
    return null;
}
function rootOwner(root, origin) {
    const chatRoot = active?.chatRoot || globalThis.document?.querySelector?.('#chat');
    if (!root?.isConnected || !chatRoot?.contains(root) || !origin) return null;
    if (root.closest('[data-rm-favorite="true"], [data-rm-theater-favorite-host], [data-rm-source="favorite"]')) return null;
    const host = root.closest('[data-rm-owner-chat]');
    const details = root.matches('details') ? root : root.querySelector('details');
    const ownerKey = host?.getAttribute('data-rm-owner-chat') || details?.getAttribute('data-rabbit-mirror-owner-chat');
    if (ownerKey && ownerKey !== origin.key) return null;
    let messageNode = root.closest('.mes[mesid]');
    while (messageNode && messageNode.parentElement !== chatRoot) messageNode = messageNode.parentElement?.closest('.mes[mesid]');
    const rawIndex = host?.getAttribute('data-rm-owner-mesid') ?? details?.getAttribute('data-rabbit-mirror-owner-mesid') ?? messageNode?.getAttribute('mesid');
    if (rawIndex == null || !/^\d+$/.test(rawIndex)) return null;
    const message = origin.chat[Number(rawIndex)];
    if (!message || message.is_user === true) return null;
    const bound = origins.get(root);
    if (bound?.cloneSource && !boundOwnerIsCurrent(bound, origin, message, currentPair(), root)) return null;
    const rawSwipe = host?.getAttribute('data-rm-owner-swipe') ?? details?.getAttribute('data-rabbit-mirror-owner-swipe');
    if (rawSwipe != null && Number(rawSwipe) !== Number(message.swipe_id || 0)) return null;
    if (host) {
        // Host ownership attrs are emitted locally only after sanitization.
        if (!getSanitizedRabbitMirrorFaceProof(root) && !getSanitizedRabbitMirrorFaceProof(details)) return null;
        const sourceHash = host.getAttribute('data-rm-source-hash');
        if (sourceHash && sourceHash !== rabbitMirrorMessageSourceHash(message)) return null;
    } else {
        if (!messageNode) return null;
        // A scoped DOM class or a nearby name is not evidence. The exact
        // assistant message must contain every explicitly requested role.
        const markers = [...(root.matches(MARKERS) ? [root] : []), ...root.querySelectorAll(MARKERS)];
        if (!markers.length) return null;
        for (const marker of markers) {
            const role = marker.getAttribute('data-rm-avatar');
            const pattern = new RegExp(`data-rm-avatar\\s*=\\s*(?:"${role}"|'${role}'|${role}(?=[\\s>/]))`, 'i');
            if (!pattern.test(String(message.mes || ''))) return null;
        }
    }
    return message;
}

export function isRabbitMirrorLinkedAvatarFrame(frame) {
    const marker = frame?.closest?.(MARKERS), root = provenRoot(marker), origin = currentOrigin(), pair = currentPair();
    if (!marker || !root || !pair || !pair[marker.getAttribute('data-rm-avatar')]) return false;
    const message = rootOwner(root, origin), bound = origins.get(root);
    return !!message && (!bound || boundOwnerIsCurrent(bound, origin, message, pair, root));
}

// Explicit draw actions may arrive before persisted local avatars finish
// loading. Await only the public local refresh, never an image/model request.
export async function prepareRabbitMirrorAvatarFrame(frame) {
    if (!frame?.closest?.(MARKERS)) return false;
    const before = currentOrigin();
    try {
        const api = globalThis.HearttraceAvatars;
        if (api?.apiVersion === 1 && typeof api.refresh === 'function') await api.refresh();
    } catch { /* Missing integration preserves the ordinary image action. */ }
    if (!sameOrigin(before, currentOrigin())) return true; // A stale draw action must not become a paid request.
    return isRabbitMirrorLinkedAvatarFrame(frame);
}

// Call immediately after cloneNode, before any clone-only snapshot filtering.
// Avatar URLs are local runtime projection, not new generated source content.
export function restoreRabbitMirrorAvatarClone(source, clone) {
    if (!source?.querySelectorAll || !clone?.querySelectorAll) return clone;
    active?.restoreClone(source, clone);
    for (const node of clone.querySelectorAll('[data-rm-avatar-rendered="true"]')) node.remove();
    // Maintenance/reset clone a verified live face and later mount that exact
    // local node. Carry its in-memory proof, never a serialized owner attribute.
    // Detached reset snapshots may be cloned again only for their original owner.
    if (source.matches?.(FACES) && clone.matches?.(FACES)) {
        const root = provenRoot(source), origin = currentOrigin(), pair = currentPair();
        const previous = origins.get(root);
        const message = root?.isConnected ? rootOwner(root, origin) : previous?.message;
        if (root && message && origin && (!previous || boundOwnerIsCurrent(previous, origin, message, pair, root))) {
            const cloneSource = previous?.cloneSource || { index: origin.chat.indexOf(message),
                source: String(message.mes || ''), swipe: Number(message.swipe_id || 0),
                host: root.closest('[data-rm-owner-chat]') };
            const proof = getSanitizedRabbitMirrorFaceProof(source) || getSanitizedRabbitMirrorFaceProof(root);
            if (proof) markSanitizedRabbitMirrorFace(clone, proof);
            trusted.add(clone);
            origins.set(clone, { ...origin, message, scope: previous?.scope || pair?.scope || '', cloneSource });
        }
    }
    return clone;
}
function captureAttribute(node, name) { return { name, value: node.getAttribute(name) }; }
function restoreAttribute(node, { name, value }) { if (value === null) node.removeAttribute(name); else node.setAttribute(name, value); }
function restorePosition(node, record) {
    if (!record.position) return;
    if (node.getAttribute('style') === record.appliedStyle) {
        restoreAttribute(node, { name: 'style', value: record.originalStyle });
    } else if (node.style.getPropertyValue('position') === 'relative') {
        // Preserve unrelated interactive style edits made while an avatar was on.
        if (record.position.value) node.style.setProperty('position', record.position.value, record.position.priority);
        else node.style.removeProperty('position');
        if (record.originalStyle === null && !node.getAttribute('style')) node.removeAttribute('style');
    }
}

export function destroyRabbitMirrorChatAvatars() {
    const previous = active;
    active = null;
    previous?.destroy();
}

export function initRabbitMirrorChatAvatars({ isActive = () => true } = {}) {
    destroyRabbitMirrorChatAvatars();
    if (!globalThis.document || !isActive()) return;
    const roots = new Set(), pending = new Set(), applied = new Map(), cleanups = [];
    let observer = null, unsubscribe = null, bridge = null, queued = false, scanTimer = 0, scanCursor = null;
    let stopped = false, pair = null, origin = null;
    const live = () => !stopped && active === runtime && isActive();
    function restore(node) {
        const record = applied.get(node);
        if (!record) return;
        record.overlay?.remove();
        for (const attr of record.attributes) restoreAttribute(node, attr);
        restorePosition(node, record);
        applied.delete(node);
    }
    function restoreRoot(root) { for (const [node, value] of applied) if (value.root === root) restore(node); }
    function restoreAll() { for (const node of [...applied.keys()]) restore(node); }
    function apply(node, root, url) {
        if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml' || ['SCRIPT', 'STYLE', 'TEMPLATE', 'INPUT'].includes(node.tagName)) return;
        const previous = applied.get(node);
        if (previous?.url === url && previous.root === root && (previous.overlay ? previous.overlay.parentNode === node : node.getAttribute('src') === url)) return;
        if (previous) restore(node);
        const record = { root, url, attributes: [] };
        if (node.tagName === 'IMG') {
            record.attributes = ['src', 'srcset', 'sizes', 'data-rm-avatar-rendered'].map(name => captureAttribute(node, name));
            if (node.hasAttribute('srcset')) node.setAttribute('srcset', '');
            if (node.hasAttribute('sizes')) node.setAttribute('sizes', '');
            node.setAttribute('src', url);
            node.setAttribute('data-rm-avatar-rendered', 'image');
        } else {
            const overlay = node.ownerDocument.createElement('img');
            overlay.setAttribute('data-rm-avatar-rendered', 'true');
            overlay.setAttribute('alt', ''); overlay.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('draggable', 'false');
            overlay.style.cssText = 'position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;min-width:0!important;min-height:0!important;object-fit:cover!important;border-radius:inherit!important;pointer-events:none!important;display:block!important;z-index:1!important;margin:0!important;padding:0!important;';
            overlay.src = url;
            if (globalThis.getComputedStyle?.(node)?.position === 'static' || !globalThis.getComputedStyle) {
                record.originalStyle = node.getAttribute('style');
                record.position = { value: node.style.getPropertyValue('position'), priority: node.style.getPropertyPriority('position') };
                node.style.setProperty('position', 'relative');
                record.appliedStyle = node.getAttribute('style');
            }
            record.overlay = overlay;
            node.append(overlay);
        }
        applied.set(node, record);
    }
    function render(root) {
        if (!live()) return;
        if (!root.isConnected) { restoreRoot(root); roots.delete(root); return; }
        if (!trusted.has(root) && !getSanitizedRabbitMirrorFaceProof(root)) return;
        const message = rootOwner(root, origin);
        let bound = origins.get(root);
        if (!bound && message) {
            bound = { ...origin, scope: pair?.scope || '', message };
            origins.set(root, bound);
        }
        if (!pair || !message || !boundOwnerIsCurrent(bound, origin, message, pair, root)) { restoreRoot(root); return; }
        if (!bound.message) bound.message = message;
        if (!bound.scope) bound.scope = pair.scope;
        const markers = [...(root.matches(MARKERS) ? [root] : []), ...root.querySelectorAll(MARKERS)];
        const seen = new Set();
        for (const node of markers) {
            if (provenRoot(node) !== root) continue;
            // Nested avatar markers never layer two different people together.
            const parent = node.parentElement?.closest(MARKERS);
            if (parent && root.contains(parent)) continue;
            const url = pair[node.getAttribute('data-rm-avatar')];
            if (url) { seen.add(node); apply(node, root, url); }
        }
        for (const [node, value] of applied) if (value.root === root && !seen.has(node)) restore(node);
    }
    function collect(node) {
        if (!node?.querySelectorAll) return;
        const containing = provenRoot(node);
        if (containing) queue(containing);
        for (const root of [...(node.matches?.(FACES) ? [node] : []), ...node.querySelectorAll(FACES)]) {
            if (trusted.has(root) || getSanitizedRabbitMirrorFaceProof(root)) queue(root);
        }
    }
    function queue(root) {
        if (!live() || !root) return;
        roots.add(root); pending.add(root);
        if (queued) return;
        queued = true;
        queueMicrotask(() => {
            queued = false;
            if (!live()) return;
            readState();
            const work = [...pending]; pending.clear();
            for (const item of work) render(item);
        });
    }
    function scanChunk() {
        scanTimer = 0;
        if (!live()) return;
        let count = 0;
        while (scanCursor && count++ < 12) { const node = scanCursor; scanCursor = node.nextElementSibling; collect(node); }
        if (scanCursor) scanTimer = setTimeout(scanChunk, 0);
    }
    function scanMounted() {
        if (scanTimer) clearTimeout(scanTimer);
        scanCursor = runtime.chatRoot?.firstElementChild || null;
        scanChunk();
    }
    function connectChat() {
        const root = document.querySelector('#chat');
        if (root === runtime.chatRoot) return;
        observer?.disconnect(); restoreAll(); roots.clear(); pending.clear();
        runtime.chatRoot = root;
        if (root && typeof MutationObserver === 'function') {
            observer = new MutationObserver(records => {
                if (!live()) return;
                for (const record of records) {
                    if (record.type === 'attributes') collect(record.target);
                    else {
                        const owner = provenRoot(record.target);
                        if (owner) queue(owner);
                        for (const node of record.addedNodes) collect(node);
                        if (record.removedNodes.length) for (const known of roots) if (!known.isConnected) { restoreRoot(known); roots.delete(known); }
                    }
                }
            });
            observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-rm-avatar', 'mesid', 'data-rm-owner-chat', 'data-rm-owner-swipe'] });
        }
        scanMounted();
    }
    function readState() {
        const nextOrigin = currentOrigin();
        let enabled = false;
        try { const settings = getSettings(); enabled = settings.enabled !== false && settings.mode !== 'off'; } catch {}
        const nextPair = enabled && isActive() ? currentPair() : null;
        if (!sameOrigin(origin, nextOrigin) || pair?.scope !== nextPair?.scope) restoreAll();
        origin = nextOrigin; pair = nextPair;
    }
    function sync() {
        if (!live()) return;
        const nextBridge = globalThis.HearttraceAvatars;
        if (bridge !== nextBridge) {
            try { unsubscribe?.(); } catch {}
            unsubscribe = null; bridge = nextBridge;
            try { if (bridge?.apiVersion === 1 && typeof bridge.subscribe === 'function') unsubscribe = bridge.subscribe(sync); } catch {}
        }
        readState(); connectChat();
        for (const root of roots) queue(root);
    }
    const runtime = { chatRoot: null, queue, restoreClone(source, clone) {
        const sources = [...(source.matches?.(MARKERS) ? [source] : []), ...source.querySelectorAll(MARKERS)];
        const copies = [...(clone.matches?.(MARKERS) ? [clone] : []), ...clone.querySelectorAll(MARKERS)];
        for (let index = 0; index < sources.length; index++) {
            const record = applied.get(sources[index]), copy = copies[index];
            if (!record || !copy) continue;
            for (const attr of record.attributes) restoreAttribute(copy, attr);
            restorePosition(copy, record);
        }
    }, destroy() {
        stopped = true; observer?.disconnect();
        if (scanTimer) clearTimeout(scanTimer);
        try { unsubscribe?.(); } catch {}
        for (const cleanup of cleanups) { try { cleanup(); } catch {} }
        restoreAll(); roots.clear(); pending.clear();
    } };
    active = runtime;
    const on = (target, type, handler, capture = false) => {
        target?.addEventListener?.(type, handler, capture);
        cleanups.push(() => target?.removeEventListener?.(type, handler, capture));
    };
    on(globalThis, 'hearttrace:avatars-ready', sync);
    on(globalThis, 'hearttrace:avatars-changed', sync);
    on(document, 'change', event => {
        if (event.target?.closest?.('#rabbit_mirror_theater_settings')) queueMicrotask(sync);
    });
    on(document, 'toggle', event => { if (runtime.chatRoot?.contains(event.target)) collect(event.target); }, true);
    try {
        const ctx = context(), source = ctx?.eventSource, types = ctx?.eventTypes || ctx?.event_types || {};
        for (const name of ['CHAT_CHANGED', 'CHAT_LOADED', 'SETTINGS_UPDATED']) {
            const type = types[name] || name.toLowerCase();
            source?.on?.(type, sync);
            cleanups.push(() => {
                if (typeof source?.removeListener === 'function') source.removeListener(type, sync);
                else source?.off?.(type, sync);
            });
        }
    } catch { /* DOM and bridge notifications remain available. */ }
    try {
        cleanups.push(subscribeRabbitMirrorChatSurface({ id: 'rabbit-mirror-chat-avatars',
            didMount: lease => { sync(); collect(lease.element); return () => { for (const root of roots) if (lease.element.contains(root)) restoreRoot(root); }; },
            didCommitContent: lease => { sync(); collect(lease.element); },
        }));
    } catch { /* Standard host observation is sufficient when managed surfaces are absent. */ }
    sync();
}
