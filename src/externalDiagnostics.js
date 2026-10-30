import { rmT as __rmT } from "./textTable.js?rmv=2.1.0";
import { sanitizeExternalTransportSummary as sanitizeTransportSummary, getRecentIndependentTransportDiagnostics, clearRecentIndependentTransportDiagnostics } from './transportDiagnostics.js?rmv=2.1.0';
const DIAG_VERSION = '1.5.53-ttperfdiag1';
const MAX_ENTRIES = 1800;
const STALL_INTERVAL_MS = 1000;
const STALL_THRESHOLD_MS = 250;
const CHAT_SAMPLE_DELAYS = [0, 500, 2000];
const MAINTENANCE_WINDOW_MS = 10000;
const moduleUrl = (() => { try {
    return new URL(import.meta.url, globalThis.location?.href || 'http://localhost/');
}
catch {
    return null;
} })();
const rabbitMirrorRootPath = (() => {
    try {
        const path = String(moduleUrl?.pathname || '');
        const marker = '/src/';
        const index = path.lastIndexOf(marker);
        return index >= 0 ? path.slice(0, index + 1) : '';
    }
    catch {
        return '';
    }
})();
let entries = [];
let startedAt = 0;
let sequence = 0;
let cleanup = [];
let hostEventCleanup = [];
let hostEventInstallTimer = 0;
let chatObserver = null;
let firstTextObservers = new Map();
let chatSampleTimers = new Set();
let activeSend = null;
let sendSequence = 0;
let maintenanceSequence = 0;
let maintenanceWindows = [];
let initialized = false;
let transportRows = [];
const HOST_WORK_NAMES = new Map([
    ['independent.syncMessages', __rmT("T9c6c0DWe_PAkX.i")],
    ['independent.ensureExternalUi', __rmT("3g2dPumMo6jTm6MjENQaTh")],
    ['independent.refreshExistingExternalDetails', __rmT("qMy5yIg23frOleuZ")],
    ['independent.reconcileVisibleMirrorDuplicates', __rmT("_4AAxMOoQaAOgJ.FDorW9U0aMg2zjk")],
    ['independent.viewportMessageIndices', __rmT("T9c6c0DWe_GlyJ.8")],
    ['maintenance.installScope', __rmT("_LwBvJEnBloYkQi8")],
]);
let hostWorkRows = new Map();
let hostWorkEpoch = 0;
let hostWorkToken = null;
function hostWorkSnapshot() {
    return [...hostWorkRows.values()].map(row => ({ ...row }));
}
function beginHostWork(name, token) {
    if (!initialized || token !== hostWorkToken || !HOST_WORK_NAMES.has(name))
        return null;
    const epoch = hostWorkEpoch;
    const start = now();
    let ended = false;
    return () => {
        if (ended || !initialized || token !== hostWorkToken || epoch !== hostWorkEpoch)
            return;
        ended = true;
        const finish = now();
        const ms = Math.max(0, finish - start);
        const row = hostWorkRows.get(name) || { name, count: 0, totalMs: 0, maxMs: 0, peakStartMs: 0, peakEndMs: 0 };
        row.count += 1;
        row.totalMs += ms;
        if (row.count === 1 || ms > row.maxMs) {
            row.maxMs = ms;
            row.peakStartMs = Math.max(0, start - startedAt);
            row.peakEndMs = Math.max(0, finish - startedAt);
        }
        hostWorkRows.set(name, row);
    };
}
export function sanitizeExternalTransportSummary(value) {
    return sanitizeTransportSummary(value);
}
function installTransportMetadataListener() {
    if (typeof globalThis.addEventListener !== 'function')
        return;
    const listener = event => {
        if (!initialized)
            return;
        const summary = sanitizeExternalTransportSummary(event?.detail?.transport);
        if (!summary)
            return;
        const stamp = Number(event?.detail?.transportRequestStamp ?? event?.detail?.ts);
        const ts = Number.isFinite(stamp) && stamp > 0 ? stamp : Date.now();
        const existing = transportRows.find(row => row.ts === ts);
        if (existing)
            existing.summary = summary;
        else
            transportRows.push({ ts, summary });
        if (transportRows.length > 12)
            transportRows.splice(0, transportRows.length - 12);
    };
    globalThis.addEventListener('rabbitmirror:independent-api-diagnostic', listener);
    cleanup.push(() => globalThis.removeEventListener?.('rabbitmirror:independent-api-diagnostic', listener));
}
function now() {
    try {
        return performance.now();
    }
    catch {
        return Date.now();
    }
}
function wallNow() {
    try {
        return new Date().toISOString();
    }
    catch {
        return '';
    }
}
function safeString(value, max = 180) {
    const text = String(value ?? '').replace(/[\r\n\t]+/g, ' ').trim();
    return text.length > max ? `${text.slice(0, Math.max(0, max - 3))}...` : text;
}
const SAFE_META_KEYS = new Set([
    'path', 'owner', 'initiator', 'startT', 'ttfbMs', 'downloadMs', 'decodedKB', 'transferKB', 'status', 'category',
    'container', 'blockingMs', 'externalScript', 'externalScriptMs', 'externalFn', 'rabbitMirrorScriptMs', 'rabbitMirrorOnly',
    'event', 'interactionId', 'inputDelay', 'processingMs', 'sendId', 'mesid', 'messages', 'role', 'sampleId',
    'reason', 'delay', 'users', 'assistants', 'source', 'windowId', 'action', 'eventCount', 'readyState', 'version',
    'rabbitMirrorRootPath', 'domContentLoadedMs', 'loadMs', 'responseMs',
]);
function safeMeta(meta = {}) {
    const out = {};
    if (!meta || typeof meta !== 'object')
        return out;
    for (const [key, raw] of Object.entries(meta)) {
        if (!SAFE_META_KEYS.has(key))
            continue;
        if (raw === undefined || raw === null)
            continue;
        if (typeof raw === 'number' && Number.isFinite(raw))
            out[key] = Math.round(raw * 10) / 10;
        else if (typeof raw === 'boolean')
            out[key] = raw;
        else if (typeof raw === 'string')
            out[key] = ['path', 'container', 'externalScript', 'rabbitMirrorRootPath'].includes(key)
                ? redactReportPath(raw)
                : safeString(raw, 200);
    }
    return out;
}
function push(kind, name, ms = 0, meta = {}, explicitT = null) {
    if (!startedAt)
        startedAt = now();
    const entry = {
        id: ++sequence,
        t: Math.round((explicitT == null ? now() - startedAt : explicitT) * 10) / 10,
        kind: safeString(kind || 'event', 40),
        name: safeString(name || '', 120),
        ms: Math.round((Number(ms) || 0) * 10) / 10,
        ...safeMeta(meta),
    };
    entries.push(entry);
    if (entries.length > MAX_ENTRIES)
        entries.splice(0, entries.length - MAX_ENTRIES);
    return entry;
}
function mark(name, meta = {}) { return push('mark', name, 0, meta); }
function sensitivePathSegment(segment = '') {
    let text = String(segment || '');
    try {
        text = decodeURIComponent(text);
    }
    catch { }
    if (/^(?:bearer|token|access[_-]?token|api[_-]?key|secret|session|authorization|password|passwd|signature|signed|sig)[=:._\s-]/i.test(text))
        return true;
    if (/^(?:sk|pk|rk|ghp|gho|github_pat|xox[abprs])[-_][A-Za-z0-9_-]{8,}$/i.test(text))
        return true;
    if (/^[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}$/.test(text))
        return true;
    if (/^[0-9a-f]{16,}$/i.test(text) || /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(text))
        return true;
    if (/^[A-Za-z0-9_-]{16,}={0,2}$/.test(text) && /[A-Za-z]/.test(text) && /[0-9_-]/.test(text))
        return true;
    return false;
}
function redactDiagnosticPathname(path = '/') {
    const clean = String(path || '/').split(/[?#]/, 1)[0] || '/';
    const parts = clean.split('/').map(part => sensitivePathSegment(part) ? '[redacted]' : safeString(part, 72));
    const result = parts.join('/').replace(/\/{2,}/g, '/');
    return (result.startsWith('/') ? result : `/${result}`).slice(0, 240) || '/';
}
function pathOf(input) {
    let raw = '';
    try {
        raw = typeof input === 'string' ? input : (input?.name || input?.url || String(input || ''));
        const parsed = new URL(raw, globalThis.location?.href || 'http://localhost/');
        if (!/^https?:$/i.test(parsed.protocol))
            return '/';
        return redactDiagnosticPathname(parsed.pathname || '/');
    }
    catch {
        const clean = String(raw || '').split(/[?#]/, 1)[0];
        const absolute = /^(?:[a-z][a-z0-9+.-]*:)?\/\/[^/]*(\/.*)?$/i.exec(clean);
        if (absolute)
            return redactDiagnosticPathname(String(absolute[1] || '/'));
        if (/^[a-z][a-z0-9+.-]*:/i.test(clean))
            return '/';
        return redactDiagnosticPathname(clean);
    }
}
function redactReportPath(value = '') {
    const text = String(value || '');
    if (!text || /^(?:window|iframe|frame|embed|object|unknown)$/.test(text))
        return text;
    return redactDiagnosticPathname(text);
}
function isRabbitMirrorPath(path = '') {
    const text = String(path || '');
    if (rabbitMirrorRootPath && text.startsWith(rabbitMirrorRootPath))
        return true;
    return /\/scripts\/extensions\/third-party\/(?:tototest|toto)(?:\/|$)/i.test(text)
        || /rabbit[-_]?mirror|rabbit_mirror/i.test(text);
}
function resourceOwner(path = '') {
    const text = String(path || '');
    if (isRabbitMirrorPath(text))
        return 'rabbitmirror';
    if (/\/scripts\/extensions\/third-party\//i.test(text))
        return 'other-extension';
    if (/^\/(?:script\.js|scripts\/)/i.test(text))
        return 'sillytavern-core';
    if (/^\/api\//i.test(text))
        return 'sillytavern-api';
    return 'other';
}
function classifyApi(path = '') {
    const text = String(path || '');
    if (text === '/api/chats/get')
        return 'chat.get';
    if (text === '/api/characters/chats' || text === '/api/groups/get')
        return 'chat.list';
    if (/\/api\/chats\/(?:save|group\/save)/.test(text))
        return 'chat.save';
    if (text === '/api/settings/save')
        return 'settings.save';
    if (text.includes('/api/tokenizers/'))
        return 'tokenizer';
    if (text === '/api/backends/chat-completions/generate' || text === '/api/generate' || /\/generate$/.test(text))
        return 'generate';
    if (/\/models(?:\/|$)/.test(text) || text.includes('/status'))
        return 'models/status';
    if (text.includes('/api/'))
        return 'api.other';
    return '';
}
function resourceMeta(item) {
    const path = pathOf(item.name);
    const requestStart = Number(item.requestStart || item.startTime || 0);
    const responseStart = Number(item.responseStart || 0);
    const responseEnd = Number(item.responseEnd || (item.startTime + item.duration) || 0);
    return {
        path,
        owner: resourceOwner(path),
        initiator: safeString(item.initiatorType || '', 40),
        startT: Number(item.startTime || 0) - startedAt,
        ttfbMs: responseStart > requestStart ? responseStart - requestStart : 0,
        downloadMs: responseEnd > responseStart && responseStart > 0 ? responseEnd - responseStart : 0,
        decodedKB: Math.round(Number(item.decodedBodySize || 0) / 102.4) / 10,
        transferKB: Math.round(Number(item.transferSize || 0) / 102.4) / 10,
        status: Number(item.responseStatus || 0),
    };
}
function installResourceObserver() {
    if (typeof PerformanceObserver !== 'function')
        return;
    const supported = PerformanceObserver.supportedEntryTypes || [];
    if (!supported.includes('resource'))
        return;
    const seen = new Set();
    const observer = new PerformanceObserver(list => {
        for (const item of list.getEntries()) {
            const meta = resourceMeta(item);
            const key = `${item.name}|${item.startTime}|${item.duration}`;
            if (seen.has(key))
                continue;
            seen.add(key);
            const apiCategory = classifyApi(meta.path);
            if (apiCategory) {
                push('network', 'external.network', item.duration, { ...meta, category: apiCategory }, meta.startT);
                continue;
            }
            const scriptLike = item.initiatorType === 'script' || /\.(?:m?js|css)(?:$|[?#])/i.test(String(item.name || ''));
            if (!scriptLike || Number(item.duration || 0) < 10)
                continue;
            push('resource', 'external.resource', item.duration, meta, meta.startT);
        }
    });
    observer.observe({ type: 'resource', buffered: true });
    cleanup.push(() => observer.disconnect());
}
function installPerformanceObservers() {
    let hasNativeLongTask = false;
    try {
        if (typeof PerformanceObserver === 'function') {
            const supported = PerformanceObserver.supportedEntryTypes || [];
            if (supported.includes('longtask')) {
                const observer = new PerformanceObserver(list => {
                    for (const item of list.getEntries()) {
                        const attribution = Array.isArray(item.attribution) ? item.attribution[0] : null;
                        const containerType = String(attribution?.containerType || '').trim().toLowerCase();
                        const container = attribution?.containerSrc
                            ? pathOf(attribution.containerSrc)
                            : /^(?:window|iframe|frame|embed|object)$/.test(containerType) ? containerType : 'unknown';
                        push('longtask', 'external.longtask', item.duration, {
                            container,
                        }, Number(item.startTime || 0) - startedAt);
                    }
                });
                observer.observe({ type: 'longtask', buffered: true });
                hasNativeLongTask = true;
                cleanup.push(() => observer.disconnect());
            }
            if (supported.includes('long-animation-frame')) {
                const observer = new PerformanceObserver(list => {
                    for (const item of list.getEntries()) {
                        if (Number(item.duration || 0) < 50)
                            continue;
                        const scripts = Array.isArray(item.scripts) ? item.scripts : [];
                        const ranked = scripts
                            .map(script => ({
                            ms: Number(script?.duration || 0),
                            path: script?.sourceURL ? pathOf(script.sourceURL) : '',
                            fn: safeString(script?.sourceFunctionName || script?.invoker || '', 120),
                        }))
                            .sort((a, b) => b.ms - a.ms);
                        const external = ranked.find(row => row.path && !isRabbitMirrorPath(row.path)) || null;
                        const rabbit = ranked.find(row => row.path && isRabbitMirrorPath(row.path)) || null;
                        push('loaf', 'external.longAnimationFrame', item.duration, {
                            blockingMs: Number(item.blockingDuration || 0),
                            externalScript: external?.path || '',
                            externalScriptMs: external?.ms || 0,
                            externalFn: external?.fn || '',
                            rabbitMirrorScriptMs: rabbit?.ms || 0,
                            rabbitMirrorOnly: !external && !!rabbit,
                        }, Number(item.startTime || 0) - startedAt);
                    }
                });
                observer.observe({ type: 'long-animation-frame', buffered: true });
                cleanup.push(() => observer.disconnect());
            }
            if (supported.includes('event')) {
                const observer = new PerformanceObserver(list => {
                    for (const item of list.getEntries()) {
                        if (Number(item.duration || 0) < 100)
                            continue;
                        const inputDelay = Math.max(0, Number(item.processingStart || 0) - Number(item.startTime || 0));
                        const processingMs = Math.max(0, Number(item.processingEnd || 0) - Number(item.processingStart || 0));
                        push('interaction', 'external.slowEvent', item.duration, {
                            event: safeString(item.name || '', 40), interactionId: Number(item.interactionId || 0), inputDelay, processingMs,
                        }, Number(item.startTime || 0) - startedAt);
                    }
                });
                observer.observe({ type: 'event', buffered: true, durationThreshold: 100 });
                cleanup.push(() => observer.disconnect());
            }
        }
    }
    catch (error) {
        mark('externalDiag.performanceObserverUnavailable', { error: safeString(error?.message || error) });
    }
    if (!hasNativeLongTask) {
        let expected = now() + STALL_INTERVAL_MS;
        const timer = setInterval(() => {
            const current = now();
            const lag = current - expected;
            expected = current + STALL_INTERVAL_MS;
            if (lag >= STALL_THRESHOLD_MS)
                push('stall', 'external.eventLoopStall', lag);
        }, STALL_INTERVAL_MS);
        cleanup.push(() => clearInterval(timer));
    }
}
function roleFromMessageNode(node) {
    if (!node?.matches?.('.mes, [mesid]'))
        return 'unknown';
    const isUser = node.getAttribute?.('is_user');
    if (isUser === 'true' || isUser === '1' || node.classList?.contains('user_mes'))
        return 'user';
    if (isUser === 'false' || isUser === '0' || node.classList?.contains('assistant_mes'))
        return 'assistant';
    try {
        const mesid = Number(node.getAttribute?.('mesid'));
        const chat = globalThis.SillyTavern?.getContext?.()?.chat;
        if (Number.isInteger(mesid) && Array.isArray(chat) && chat[mesid])
            return chat[mesid].is_user ? 'user' : 'assistant';
    }
    catch { }
    return 'unknown';
}
function observeAssistantFirstText(messageNode) {
    if (!messageNode?.isConnected || firstTextObservers.has(messageNode))
        return;
    const target = messageNode.querySelector?.('.mes_text') || messageNode;
    const mesid = safeString(messageNode.getAttribute?.('mesid') || '', 40);
    const markMutation = () => {
        mark('host.assistantFirstDomMutation', { sendId: activeSend?.id || '', mesid });
        try {
            firstTextObservers.get(messageNode)?.disconnect?.();
        }
        catch { }
        firstTextObservers.delete(messageNode);
        return true;
    };
    if (Number(target?.childNodes?.length || 0) > 0) {
        markMutation();
        return;
    }
    if (typeof MutationObserver !== 'function')
        return;
    const observer = new MutationObserver(records => { if (records?.length)
        markMutation(); });
    observer.observe(target, { childList: true, subtree: true, characterData: true });
    firstTextObservers.set(messageNode, observer);
}
function observeChatRoot() {
    const chat = document.querySelector?.('#chat');
    if (!chat || typeof MutationObserver !== 'function')
        return false;
    if (chatObserver)
        return true;
    mark('host.chatRootAvailable', { messages: [...(chat.children || [])].filter(node => node?.matches?.('.mes[mesid], [mesid].mes')).length });
    chatObserver = new MutationObserver(records => {
        for (const record of records) {
            for (const node of record.addedNodes || []) {
                if (node?.nodeType !== 1 || !node.matches?.('.mes[mesid], [mesid].mes'))
                    continue;
                const role = roleFromMessageNode(node);
                const mesid = safeString(node.getAttribute?.('mesid') || '', 40);
                mark('host.chatMessageAdded', { role, mesid, sendId: activeSend?.id || '' });
                if (role === 'user')
                    mark('host.userMessageVisible', { sendId: activeSend?.id || '', mesid });
                if (role === 'assistant')
                    observeAssistantFirstText(node);
            }
        }
    });
    chatObserver.observe(chat, { childList: true, subtree: false });
    cleanup.push(() => { try {
        chatObserver?.disconnect?.();
    }
    catch { } chatObserver = null; });
    return true;
}
function installChatObserverRetry() {
    if (observeChatRoot())
        return;
    let attempts = 0;
    const timer = setInterval(() => {
        attempts += 1;
        if (observeChatRoot() || attempts >= 40)
            clearInterval(timer);
    }, 250);
    cleanup.push(() => clearInterval(timer));
}
function countChatMessages() {
    const chat = document.querySelector?.('#chat');
    if (!chat)
        return { messages: 0, users: 0, assistants: 0 };
    return { messages: Number(chat.childElementCount || 0), users: -1, assistants: -1 };
}
function scheduleChatSamples(reason = 'unknown') {
    for (const timer of chatSampleTimers)
        clearTimeout(timer);
    chatSampleTimers.clear();
    const sampleId = `${safeString(reason, 40)}:${++sequence}`;
    for (const delay of CHAT_SAMPLE_DELAYS) {
        const timer = setTimeout(() => {
            chatSampleTimers.delete(timer);
            mark('host.chatRenderSample', { sampleId, reason, delay, ...countChatMessages() });
        }, delay);
        chatSampleTimers.add(timer);
    }
}
function startSendIntent(source = 'unknown') {
    activeSend = { id: `s${++sendSequence}`, startedT: now() - startedAt, source };
    mark('host.sendIntent', { sendId: activeSend.id, source });
}
function installSendIntentListeners() {
    const click = event => {
        if (event?.isTrusted === false)
            return;
        if (event.target?.closest?.('#send_but, #send_button, [data-send-button]'))
            startSendIntent('button');
    };
    const keydown = event => {
        if (event?.isTrusted === false || event.key !== 'Enter' || event.shiftKey)
            return;
        if (event.target?.matches?.('#send_textarea, textarea#send_textarea'))
            startSendIntent('enter');
    };
    document.addEventListener('click', click, true);
    document.addEventListener('keydown', keydown, true);
    cleanup.push(() => document.removeEventListener('click', click, true));
    cleanup.push(() => document.removeEventListener('keydown', keydown, true));
}
function maintenanceSource(node) {
    const host = node?.closest?.('[data-rabbit-mirror-external-source="true"]');
    return host?.getAttribute?.('data-rm-source') === 'independent' ? 'independent' : 'follow';
}
function startMaintenanceWindow(target, action = 'maintenance') {
    const row = {
        id: `m${++maintenanceSequence}`,
        source: maintenanceSource(target),
        action: safeString(action || 'maintenance', 80),
        startT: now() - startedAt,
        endT: now() - startedAt + MAINTENANCE_WINDOW_MS,
    };
    maintenanceWindows.push(row);
    if (maintenanceWindows.length > 12)
        maintenanceWindows.splice(0, maintenanceWindows.length - 12);
    mark('host.maintenanceIntent', { windowId: row.id, source: row.source, action: row.action });
}
function installMaintenanceIntentListeners() {
    const handler = event => {
        if (event?.isTrusted === false)
            return;
        const actionNode = event.target?.closest?.('[data-rm-maintenance-action]');
        const rabbit = event.target?.closest?.('[data-rm-maintenance-rabbit]');
        if (actionNode)
            startMaintenanceWindow(actionNode, actionNode.getAttribute?.('data-rm-maintenance-action') || 'action');
        else if (rabbit)
            startMaintenanceWindow(rabbit, 'open-menu');
    };
    document.addEventListener('click', handler, true);
    cleanup.push(() => document.removeEventListener('click', handler, true));
}
function clearHostEvents() {
    for (const item of hostEventCleanup.splice(0)) {
        try {
            item.es?.off?.(item.event, item.handler);
        }
        catch { }
    }
}
function installHostEvents() {
    let ctx;
    try {
        ctx = globalThis.SillyTavern?.getContext?.();
    }
    catch {
        ctx = null;
    }
    const es = ctx?.eventSource;
    const et = ctx?.eventTypes || ctx?.event_types || {};
    if (!es?.on || !et || !Object.keys(et).length)
        return false;
    clearHostEvents();
    const bind = (event, name, handler = null) => {
        if (!event)
            return;
        const fn = (...args) => {
            mark(name, { sendId: activeSend?.id || '' });
            try {
                handler?.(...args);
            }
            catch { }
        };
        es.on(event, fn);
        hostEventCleanup.push({ es, event, handler: fn });
    };
    bind(et.CHAT_CHANGED, 'host.CHAT_CHANGED', () => scheduleChatSamples('CHAT_CHANGED'));
    bind(et.MESSAGE_SENT, 'host.MESSAGE_SENT');
    bind(et.GENERATION_STARTED, 'host.GENERATION_STARTED');
    bind(et.MESSAGE_RECEIVED, 'host.MESSAGE_RECEIVED');
    bind(et.CHARACTER_MESSAGE_RENDERED, 'host.CHARACTER_MESSAGE_RENDERED');
    bind(et.MESSAGE_UPDATED, 'host.MESSAGE_UPDATED');
    bind(et.GENERATION_ENDED, 'host.GENERATION_ENDED', () => { activeSend = null; });
    bind(et.GENERATION_STOPPED, 'host.GENERATION_STOPPED', () => { activeSend = null; });
    bind(et.MESSAGE_SWIPED, 'host.MESSAGE_SWIPED');
    mark('externalDiag.hostEventsInstalled', { eventCount: hostEventCleanup.length });
    return true;
}
function installHostEventsRetry() {
    let attempts = 0;
    const tryInstall = () => {
        attempts += 1;
        if (installHostEvents() || attempts >= 40) {
            if (hostEventInstallTimer)
                clearInterval(hostEventInstallTimer);
            hostEventInstallTimer = 0;
        }
    };
    tryInstall();
    if (!hostEventCleanup.length)
        hostEventInstallTimer = setInterval(tryInstall, 250);
    cleanup.push(() => { if (hostEventInstallTimer)
        clearInterval(hostEventInstallTimer); hostEventInstallTimer = 0; clearHostEvents(); });
}
function installLifecycleMarks() {
    mark('host.documentState', { readyState: document?.readyState || '' });
    const dom = () => mark('host.DOMContentLoaded');
    const load = () => { mark('host.load'); scheduleChatSamples('window.load'); };
    document.addEventListener('DOMContentLoaded', dom, { once: true });
    window.addEventListener('load', load, { once: true });
    cleanup.push(() => document.removeEventListener('DOMContentLoaded', dom));
    cleanup.push(() => window.removeEventListener('load', load));
    scheduleChatSamples('externalDiag.init');
}
function delta(a, b) {
    if (!a || !b)
        return null;
    return Math.round((Number(b.t || 0) - Number(a.t || 0)) * 10) / 10;
}
function firstAfter(snapshot, index, names, beforeName = 'host.sendIntent') {
    const wanted = new Set(Array.isArray(names) ? names : [names]);
    for (let i = index + 1; i < snapshot.length; i += 1) {
        const row = snapshot[i];
        if (row.name === beforeName)
            break;
        if (wanted.has(row.name))
            return row;
    }
    return null;
}
function networkAfter(snapshot, startT, category, endT = Infinity) {
    return snapshot
        .filter(row => row.name === 'external.network' && row.category === category && Number(row.t) >= Number(startT) && Number(row.t) <= Number(endT))
        .sort((a, b) => Number(a.t) - Number(b.t))[0] || null;
}
function externalLoafInWindow(snapshot, startT, endT) {
    return snapshot
        .filter(row => row.name === 'external.longAnimationFrame' && Number(row.t) >= startT && Number(row.t) <= endT && row.externalScript)
        .sort((a, b) => Number(b.ms) - Number(a.ms));
}
function buildSendRows(snapshot) {
    const rows = [];
    snapshot.forEach((item, index) => {
        if (item.name !== 'host.sendIntent')
            return;
        const nextIntent = snapshot.slice(index + 1).find(row => row.name === 'host.sendIntent');
        const endT = nextIntent ? Number(nextIntent.t) : Infinity;
        const messageSent = firstAfter(snapshot, index, 'host.MESSAGE_SENT');
        const userDom = firstAfter(snapshot, index, 'host.userMessageVisible');
        const generationStarted = firstAfter(snapshot, index, 'host.GENERATION_STARTED');
        const firstText = firstAfter(snapshot, index, 'host.assistantFirstDomMutation');
        const ended = firstAfter(snapshot, index, ['host.GENERATION_ENDED', 'host.GENERATION_STOPPED']);
        const generateNet = networkAfter(snapshot, Number(item.t), 'generate', Math.min(endT, Number(ended?.t ?? Infinity)));
        const loaf = externalLoafInWindow(snapshot, Number(item.t), Number(firstText?.t ?? ended?.t ?? item.t + 15000))[0] || null;
        rows.push({
            sendId: item.sendId || '', source: item.source || '',
            intentToMessageSent: delta(item, messageSent),
            intentToUserDom: delta(item, userDom),
            intentToGenerationStarted: delta(item, generationStarted),
            intentToGenerateRequest: generateNet ? Math.round((Number(generateNet.t) - Number(item.t)) * 10) / 10 : null,
            generateTtfbMs: generateNet?.ttfbMs || null,
            intentToFirstText: delta(item, firstText),
            intentToEnd: delta(item, ended),
            externalBlockScript: loaf?.externalScript || '',
            externalBlockMs: loaf?.ms || 0,
        });
    });
    return rows.slice(-8);
}
function maintenanceWindowRows(snapshot) {
    return maintenanceWindows.slice(-8).map(win => {
        const externalLoaf = externalLoafInWindow(snapshot, win.startT, win.endT);
        const slowNetwork = snapshot
            .filter(row => row.name === 'external.network' && row.t >= win.startT && row.t <= win.endT && row.ms >= 1000)
            .sort((a, b) => b.ms - a.ms);
        const stalls = snapshot
            .filter(row => (row.name === 'external.eventLoopStall' || row.name === 'external.longtask') && row.t >= win.startT && row.t <= win.endT)
            .sort((a, b) => b.ms - a.ms);
        const rabbitOnlyLoaf = snapshot
            .filter(row => row.name === 'external.longAnimationFrame' && row.t >= win.startT && row.t <= win.endT && row.rabbitMirrorOnly)
            .sort((a, b) => b.ms - a.ms)[0] || null;
        return {
            ...win,
            maxExternalLoaf: externalLoaf[0] || null,
            maxStall: stalls[0] || null,
            slowNetwork: slowNetwork.slice(0, 3),
            rabbitOnlyLoaf,
        };
    });
}
function topExternalResources(snapshot) {
    return snapshot
        .filter(row => row.name === 'external.resource' && row.owner !== 'rabbitmirror')
        .sort((a, b) => Number(b.ms) - Number(a.ms));
}
function automatedFindings(snapshot, sendRows, maintenanceRows) {
    const findings = [];
    const stall = snapshot.filter(row => row.name === 'external.eventLoopStall' || row.name === 'external.longtask').sort((a, b) => b.ms - a.ms)[0];
    if (stall)
        findings.push(stall.name === 'external.eventLoopStall'
            ? `${__rmT("qdNsfUR2QPwF6CPD_UzcwQla_CGNr5AP")}${Math.round(stall.ms)}${__rmT(".6bSmP9KYPffDAmeQWkPXN1SuilUAQRjSA6PKWtkbTN2kdtcUK7DQJ.Nzs1fC0BsahK16Rt0v7cnXtT3eflFrh")}` : `${__rmT("vmp7LwKJLDBPKSpNUsIJSqqEjFs")}${Math.round(stall.ms)}${__rmT("Fhe8Tj0aOFQ3mT4I6j1IBLBWWHjHsxs2")}`);
    const interaction = snapshot.filter(row => row.name === 'external.slowEvent').sort((a, b) => b.ms - a.ms)[0];
    if (interaction)
        findings.push(`${__rmT("JMHM5EnjHKG")}${interaction.event || 'event'}${__rmT("OSHwSLPEcn81N2F7DoT385Cx")}${Math.round(interaction.ms)}${__rmT("sFgea_tWVudFxPWw0ff0HElGjFs")}${Math.round(interaction.inputDelay || 0)}${__rmT("4Xm6AdaZsHO6tPZkhDndHT")}${Math.round(interaction.processingMs || 0)}${__rmT("xZWJ_cQGn8bmqjKfm4J3X5T2chNbYyv19b3ShhmEOFXVwmRZ4PAnUjBpzBG")}`);
    const resources = topExternalResources(snapshot);
    if (resources[0]?.ms >= 500)
        findings.push(`${__rmT("SGvqZA6abZQS0muIVKCyATty")}${resources[0].path} ${Math.round(resources[0].ms)}${__rmT("C8yIA1Lp")}${resources[0].owner}${__rmT("7Z2rzT")}`);
    const externalLoaf = snapshot.filter(row => row.name === 'external.longAnimationFrame' && row.externalScript).sort((a, b) => b.ms - a.ms)[0];
    if (externalLoaf?.ms >= 500)
        findings.push(`${__rmT("SGvqZqE0X7_rCWuRNz.g6kty")}${externalLoaf.externalScript}${__rmT("7nnFqSClHKG")}${Math.round(externalLoaf.ms)}${__rmT("s3YEaac35mpJun7TKX0J54Cx")}${Math.round(externalLoaf.externalScriptMs || 0)}${__rmT("C8yIA1Kg")}`);
    const rabbitOnly = snapshot.filter(row => row.name === 'external.longAnimationFrame' && row.rabbitMirrorOnly).sort((a, b) => b.ms - a.ms)[0];
    if (!externalLoaf && rabbitOnly?.ms >= 500)
        findings.push(`${__rmT("1JOHka2gHKG")}${Math.round(rabbitOnly.ms)}${__rmT("l7FBX1s_7jDC11gRy4qPupH.AZgNsBu.WyPys_diyEU7_h_aSpGReVvgxBTqQEBssUdadBVGnAVkiUqZ7a49PCuF1nnZsfp.ViGqerDkGBBSMXVbsZXmHc4hdl7SJaIKmrAzeFSdoJPgScPdkCUopYx7ZxY")}`);
    const chatSamples = snapshot.filter(row => row.name === 'host.chatRenderSample');
    const blank = chatSamples.find(row => Number(row.delay) >= 3000 && Number(row.messages) === 0);
    if (blank) {
        const get = snapshot.filter(row => row.name === 'external.network' && ['chat.get', 'chat.list'].includes(row.category) && row.ms >= 1000).sort((a, b) => b.ms - a.ms)[0];
        if (get)
            findings.push(`${__rmT("uqMnI.CAKlLXRlBq")}${blank.delay}${__rmT("_9yInMEBnXJgNy7yqQvWNszQucIuLVInKnLoDf")}${get.category}${__rmT("N_waKN4sHKG")}${Math.round(get.ms)}${__rmT("4Xm6Ad73g32u_t2uxt4dHT")}${Math.round(get.ttfbMs || 0)}${__rmT("Qli.hVKdOoG")}`);
        else
            findings.push(`${__rmT("uqMnI.CAKlLXRlBq")}${blank.delay}${__rmT("Fh2wZ4x7AGwwooLO7AMwYG4A97FU9zo_T2k1u2_OHgdLmlTnGv_fnH_HPNjSqc1h.6NyG7OTE.W9bMohN22bhxR4qlIj8HzPZcyiVY19N.pQJ825kWvmOzuYDG_hHT3r0s6KBbsm0.n0pn9a.L4qsimHku8969rsPSp")}`);
    }
    for (const row of sendRows) {
        if ((row.intentToMessageSent ?? 0) >= 1000 || (row.intentToGenerateRequest ?? 0) >= 1500) {
            if (row.externalBlockScript)
                findings.push(`${__rmT("gK45fVc6")}${row.sendId}${__rmT("RN3iIZPcnPn4OG0zL39WrPXa_w12QRBrc3DtDSN1RCp")}${row.externalBlockScript}${__rmT("i8HQ8dS7rQcBTh")}${Math.round(row.externalBlockMs)}${__rmT("C8yIA1Kg")}`);
            else
                findings.push(`${__rmT("gK45fVc6")}${row.sendId}${__rmT("wHJy00SnDN7VaKkxHf3iZhgfjFs")}${Math.round(row.intentToGenerateRequest ?? row.intentToMessageSent)}${__rmT("Y8VshsiYqmOmIS.1UmGDtXT2f9oR.GDNYsIk0t2Mm2cHbwMX7.iHZh.33AEvuSP5qshW522HCjmOrWgmvSWUFzrabF7m4wv1bPVDQAw9")}`);
        }
        if ((row.generateTtfbMs ?? 0) >= 3000)
            findings.push(`${__rmT("gK45fVc6")}${row.sendId}${__rmT("9TLt.qxswub8JMg6mZtSlrVGTOZ1U4AP")}${Math.round(row.generateTtfbMs)}${__rmT("RPR7YWoyfNUcWWWcsVOe4fKryoJgbTfQ.26IHaRADhpJJvXJEX_SZSrtNfGba5qR0oQY3h")}`);
    }
    for (const row of maintenanceRows) {
        if (row.maxExternalLoaf?.ms >= 500)
            findings.push(`${__rmT("w2YT5TgDHKG")}${row.id}${__rmT("eis")}${row.source}${__rmT("jku0_3P5vdh4XyTYE8yMX5voNuLZov1afV_GlvpeSUatnh")}${row.maxExternalLoaf.externalScript}${__rmT("N_wXpp26HKG")}${Math.round(row.maxExternalLoaf.ms)}${__rmT("ytdHkfrSiMdhARbPLTvf.gYeHsviL9.1KaDRsJmJix9.bh")}`);
        else if (row.maxStall?.ms >= 500)
            findings.push(`${__rmT("w2YT5TgDHKG")}${row.id}${__rmT("eis")}${row.source}${__rmT("jku0_3P5vdh4XyTYE8yMX5voNuLZoxu1Mj4gafkzXrJtnh")}${Math.round(row.maxStall.ms)}${__rmT("ORJ2foGILb_3AnWS_GdUBqzIb1.zyVKZL.nDEdX0NiCBXZQX")}`);
        else if (row.rabbitOnlyLoaf?.ms >= 500)
            findings.push(`${__rmT("w2YT5TgDHKG")}${row.id}${__rmT("eis")}${row.source}${__rmT("0vlCbKSCUSIjfYh18a3sp1Awki4XS0CykEC_T3D6sgqSB38lVrm9TpfJldY85OBmAaTPm2f6FQeo0XKzs4BdfoNffbc3OKQwHHXmP2zkhAgA9EvkHsD_942i8ik")}`);
    }
    const slowNetwork = snapshot.filter(row => row.name === 'external.network' && row.ms >= 3000).sort((a, b) => b.ms - a.ms).slice(0, 4);
    if (slowNetwork.length)
        findings.push(`${__rmT("C9LIpZTw7iUJ1b5D")}${slowNetwork.map(row => `${row.category} ${Math.round(row.ms)}ms`).join(__rmT("7os"))}${__rmT("jzk")}`);
    return [...new Set(findings)].slice(0, 12);
}
function report() {
    const snapshot = entries.map(row => ({
        ...row,
        ...(row.path ? { path: redactReportPath(row.path) } : {}),
        ...(row.container ? { container: redactReportPath(row.container) } : {}),
        ...(row.externalScript ? { externalScript: redactReportPath(row.externalScript) } : {}),
    })).sort((a, b) => Number(a.t) - Number(b.t));
    const sendRows = buildSendRows(snapshot);
    const maintenanceRows = maintenanceWindowRows(snapshot);
    const findings = automatedFindings(snapshot, sendRows, maintenanceRows);
    const resources = topExternalResources(snapshot).slice(0, 20);
    const externalLoaf = snapshot.filter(row => row.name === 'external.longAnimationFrame' && row.externalScript).sort((a, b) => b.ms - a.ms).slice(0, 15);
    const rabbitOnlyLoaf = snapshot.filter(row => row.name === 'external.longAnimationFrame' && row.rabbitMirrorOnly).sort((a, b) => b.ms - a.ms).slice(0, 8);
    const networks = snapshot.filter(row => row.name === 'external.network').sort((a, b) => b.ms - a.ms).slice(0, 24);
    const stalls = snapshot.filter(row => row.name === 'external.eventLoopStall' || row.name === 'external.longtask').sort((a, b) => b.ms - a.ms).slice(0, 15);
    const slowEvents = snapshot.filter(row => row.name === 'external.slowEvent').sort((a, b) => b.ms - a.ms).slice(0, 12);
    const samples = snapshot.filter(row => row.name === 'host.chatRenderSample').slice(-36);
    const lines = [];
    lines.push(`${__rmT("xnCZXayIsNoufwWUS_8QsTAPUDqVQdbYYjkrmYDBMDUzNWriE2W3wBHlJq.LMB96wrE")}${DIAG_VERSION}`);
    lines.push(`${__rmT("lGi9t2hP8TyEBsBq")}${wallNow()}`);
    lines.push(__rmT("Rj7tJNKG_hTW1qF30lw6nlZMDoE1UA.A5jMt3A8E4EcQManriSKXDN7Lro0xE7ikxfgfvgX6F1118d4jh1PJI1WKUdFG.rf5B6k7FRTCkwbTHmr5yAy0dXtNmYbRIu5E1.Mfgi3OmUUR4pXvWpjadisC3axhrlZWATKtyYTxUOMuA5MkvMwusXOcX9aw00VnjSIcN9EKNTP7sQDH"));
    lines.push(__rmT("k8.Ypg73d9c8gcMa87o2GlzGlrRrtmfdctCtUWYrur2Gg9keXtWxDxbNUBxNoSoeQqDD1xLnZYgmVA79Dr_CXMAKqi2XCW5VCitrhNiFProsopGxBJT"));
    lines.push(__rmT("tjTJuhR_h2_2lmdXJECQjvO.ELdPf5h8M8vrPiqD4Hh_oc_NSzu3LMkKnQEqE5toJyLPJUF86pNzHRqtBG.ZnQCjdkhEcm2vD_7bOfMm0fzfPDjoB02a4VTLw9k1d6mm_roCh2Otijlj7.h_f_C"));
    lines.push('');
    lines.push(__rmT("_.XoS8fvCc_UDdyWt1wjUT"));
    if (findings.length)
        findings.forEach((text, index) => lines.push(`${index + 1}. ${text}`));
    else
        lines.push(__rmT("BcPG_Ho1U7RKNWw6Til236FkjyjdM00THgmPrBWmsVGohsVvrlVK3p6ZssmPr_D42amHQAVWu9I3QmFM8tvm_0iwJQ6YMLFMw1ccCn.0W2YGC5SZEqdfYpPSg4S9cd9mr6A"));
    lines.push('');
    lines.push(__rmT("_.XoS8fveGDUDw7YVH6jUT"));
    if (resources.length)
        resources.forEach(row => lines.push(`- ${row.owner} ${row.path}: ${row.ms}ms decoded=${row.decodedKB || 0}KB transfer=${row.transferKB || 0}KB`));
    else
        lines.push(__rmT("a3jzRAxxHSNh4CMWXxNFOJAeIH_Wjij21ADTKRlUbcLOjL2paDUoZh5G0RjW8sfKjoQY3h"));
    lines.push('');
    lines.push(__rmT("09JThzoDoYd86cjc5Tw0d05G29s"));
    if (externalLoaf.length)
        externalLoaf.forEach(row => lines.push(`- t+${row.t}ms frame=${row.ms}ms blocking=${row.blockingMs || 0}ms script=${row.externalScript} scriptMs=${row.externalScriptMs || 0} fn=${row.externalFn || ''}`));
    else
        lines.push(__rmT("q160SlLqR8MP9Ym6zKXOMCiGGGAyIWMO2015G1w4x70kTXTwldBwFwh.6JruNRQBC8eZ9AmsKm.iWf96DZbjE1YimSCQYJ7OqDTLRf"));
    if (rabbitOnlyLoaf.length) {
        lines.push(__rmT("YW_OHy1jxmNhr3VTfuXDBm.3d7SRoIAP9tm_RY424Jm5djJikMTI0YIZAJClIZ8OHdE"));
        rabbitOnlyLoaf.forEach(row => lines.push(`- t+${row.t}ms frame=${row.ms}ms rabbitMirrorScriptMs=${row.rabbitMirrorScriptMs || 0}${__rmT("uNLE3sxCBnDL8s78YkHqnfVUbgYXj5ACTb8")}`));
    }
    lines.push('');
    lines.push(__rmT("tQO.1UHwfdhtBCWG4gO1ZYjD4Hqerk"));
    if (stalls.length)
        stalls.forEach(row => lines.push(`- t+${row.t}ms ${row.name}: ${row.ms}ms${row.container ? ` container=${row.container}` : ''}`));
    else
        lines.push(__rmT("3dvDlUD_p5TzC73ChPhQO6SwiI4uHV6AJ8cY2VdQ6FMLZ0wf8u8rOeXpx643lGcGLBov8Moh.5tehmDfIGy.utaPWAT"));
    if (slowEvents.length)
        slowEvents.forEach(row => lines.push(`- event ${row.event}: ${row.ms}ms inputDelay=${row.inputDelay || 0}ms processing=${row.processingMs || 0}ms`));
    lines.push('');
    lines.push(__rmT("7zr_EXql4IdmDRu.rLCutnpdA_tV0VUep6a6uJ5M_v6AnKbtJiCpzamX"));
    lines.push(__rmT("eeM.yOEXPj_JLxOaTLGmrdB.10GqPrEU6jo2wlfQT40xNG9eGPABPo8bFYqHUdIQfJ1y4Rhi53UorruUUIevRX33s4pb_OHEqjvEiDPmWHTrcAt_s6.es_.0j4CEZf"));
    const hostWork = hostWorkSnapshot().sort((a, b) => b.maxMs - a.maxMs);
    if (!hostWork.length)
        lines.push(__rmT("3Kf4yYBLJJqDYYmcpHUtvORxo.S8cm6lVQx8btVAxljN41Lbcx5GVqzW0TXjMrlam.OY3h"));
    for (const row of hostWork)
        lines.push(`- ${HOST_WORK_NAMES.get(row.name)} [${row.name}${__rmT("_tMkjaFyRwqdI.Eq")}${row.count}${__rmT("UqevFfzpvNuVTh")}${row.totalMs.toFixed(1)}${__rmT("ft6QjaFyVm1Ak.Eq")}${row.maxMs.toFixed(1)}${__rmT("sFgeaosBBMmaM2ANzTNlxNSXeQs")}${row.peakStartMs.toFixed(1)}${__rmT("kys")}${row.peakEndMs.toFixed(1)}ms`);
    lines.push('');
    lines.push(__rmT("_.mzYCj669xiDqe7XqmjUT"));
    if (samples.length)
        samples.forEach(row => lines.push(`- ${row.reason} +${row.delay}ms: messages=${row.messages}, user=${row.users}, assistant=${row.assistants}`));
    else
        lines.push(__rmT("zLtPHzdQOJTwGJZjCSt6lIeGf8jvmIs2"));
    lines.push('');
    lines.push(__rmT("iIUGDph1BEdfb4p52KQ61Duk5aUQ19WoFGymAXCfEQ3EgS7BqLRrZBdorGG"));
    if (sendRows.length) {
        sendRows.forEach(row => lines.push(`- ${row.sendId}(${row.source}): click→MESSAGE_SENT=${row.intentToMessageSent ?? '?'}ms; click→userDOM=${row.intentToUserDom ?? '?'}ms; click→GEN_START=${row.intentToGenerationStarted ?? '?'}ms; click→generateRequest=${row.intentToGenerateRequest ?? '?'}ms; generateTTFB=${row.generateTtfbMs ?? '?'}ms; click→firstDOM=${row.intentToFirstText ?? '?'}ms; click→end=${row.intentToEnd ?? '?'}ms; externalBlock=${row.externalBlockScript || '-'} ${row.externalBlockMs || 0}ms`));
    }
    else
        lines.push(__rmT("N_DCrn1w0ye4vcvrhkZw06OWh6VFhJwh29E"));
    lines.push('');
    lines.push(__rmT("euLI43_9.PUrPlTROz74GaUn8pkdL2j4bNE"));
    if (networks.length)
        networks.forEach(row => lines.push(`- ${row.category} ${row.path}: total=${row.ms}ms TTFB=${row.ttfbMs || 0}ms download=${row.downloadMs || 0}ms status=${row.status || '?'}`));
    else
        lines.push(__rmT("cFsMuzqaeVJW0ilY88tMXqLodXxrebVqpGRf5BEbsaL.bh"));
    lines.push('');
    lines.push(__rmT("l_er5oDkMx5qVFmfRCi_mf6JN0MVJztO_mcOOo5B.1MgGebZ5D_"));
    const yesNo = value => value === true ? __rmT("_jB") : value === false ? __rmT("opf") : __rmT("cyZ_9RWT");
    if (!transportRows.length)
        lines.push(__rmT("wq7od_KaIMB0foDCaXSSvKJRB.iLo4085M1QDjbPAiVfZteTYuUjOrcTOsRTyPCahtsCezyvd2fKAMsT8CQ9JzeqjjHHT469XXkLRf"));
    else
        lines.push(__rmT("3O2UuaOrwgUkRMKiGSGsr0tnVk6HawxH4T45ZurTKc3V7aGzQdJCPoxp7VqeQ4SWIafEL3nZNnkm5eCUSRjs5MVhsnsgt.cBZxT1kMkf5dFCgNdMgB8wCDUt"));
    for (const row of transportRows) {
        const item = sanitizeExternalTransportSummary(row.summary);
        if (!item)
            continue;
        lines.push(`- HTTP=${item.status ?? __rmT("ssA3hcYy")}; Content-Type=${item.contentType ?? __rmT("ssA3hcYy")}${__rmT("jrcv1Vay.mmqImF_l6D")}${item.parserFormat}${__rmT("HKemamjsmfL4BeIJfyjilzfx")}${item.receivedBytes ?? __rmT("ssA3hcYy")}${item.receivedBytes == null ? '' : item.receivedBytesExact ? __rmT("fn7hm40O0SY") : __rmT("fnni5s1S0SY")}${__rmT("g93dY.AuxJBvc7rno8S7fotOkNO3.gS1a2e06cMCp28")}${item.contentChars ?? __rmT("ssA3hcYy")}; finish_reason=${item.finishReason}${__rmT("jrcv1JzXv0b1s4V_l6D")}${yesNo(item.endedNormally)}${__rmT("jrcv1Iyaw5iFMvKLl6D")}${yesNo(item.prematureClose)}${__rmT("jrcv1IzPPfM.MaVCl6D")}${item.termination}${__rmT("jrcv1tJlcX7wsCeHl6D")}${item.failureCategory}`);
    }
    lines.push(__rmT("uIDWgMYb8GVAZqcegOCsZ3n5299sEX3fPYHmAQBBaCsgRZjn1rUfcJ_MX0uQFkcATNN_GpshBFeAefZmpzVYsNpVKRMOKvfUhGRXX0dXQlaDcHh1i2ROGKWMMl.llNSDbDgZUKdUdzPxSte1e37n5qIlJ0IkBm9OeEFqco.WFH.0hTkcu06h2WF764K4tj2yCKXtof"));
    lines.push('');
    lines.push(__rmT("7_Cibsm.CrAXm03V0R_y0fzXP2jmiONbzVuja301ix9Xbh"));
    if (maintenanceRows.length) {
        for (const row of maintenanceRows) {
            lines.push(`- ${row.id} source=${row.source} action=${row.action}:`);
            if (row.maxExternalLoaf)
                lines.push(`  externalLongFrame=${row.maxExternalLoaf.ms}ms script=${row.maxExternalLoaf.externalScript} scriptMs=${row.maxExternalLoaf.externalScriptMs || 0}`);
            else
                lines.push(__rmT("dxghNwqOZD6dRqSR1OfdGNs4PU5nRmwCoDZdQ_pQAMdYn0lgVdNPZa9vYiXbck"));
            if (row.maxStall)
                lines.push(`  maxMainThreadStall=${row.maxStall.ms}ms`);
            if (row.slowNetwork.length)
                row.slowNetwork.forEach(net => lines.push(`  slowNetwork=${net.category} ${net.ms}ms TTFB=${net.ttfbMs || 0}ms`));
            if (row.rabbitOnlyLoaf)
                lines.push(`  rabbitMirrorInternalLongFrame=${row.rabbitOnlyLoaf.ms}${__rmT("ytdHkfrSeOaW0CUVNORC2GfrnrbxofestUsXRKfu2gpzJT")}`);
        }
    }
    else
        lines.push(__rmT("klKl15SNYA8VI3XBcXW7ehmQvDgrrk"));
    return lines.join('\n');
}
function status() {
    const snapshot = entries;
    return {
        version: DIAG_VERSION,
        entries: snapshot.length,
        externalResources: snapshot.filter(row => row.name === 'external.resource' && row.owner !== 'rabbitmirror').length,
        externalLoaf: snapshot.filter(row => row.name === 'external.longAnimationFrame' && row.externalScript).length,
        stalls: snapshot.filter(row => row.name === 'external.eventLoopStall' || row.name === 'external.longtask').length,
        network: snapshot.filter(row => row.name === 'external.network').length,
        maintenanceWindows: maintenanceWindows.length,
    };
}
function reset(reason = 'manual') {
    hostWorkEpoch += 1;
    hostWorkRows.clear();
    entries = [];
    if (reason !== 'user-start')
        clearRecentIndependentTransportDiagnostics();
    transportRows = getRecentIndependentTransportDiagnostics();
    sequence = 0;
    startedAt = now();
    activeSend = null;
    maintenanceWindows = [];
    mark('externalDiag.reset', { reason });
    try {
        for (const item of performance.getEntriesByType?.('resource') || []) {
            const meta = resourceMeta(item);
            const apiCategory = classifyApi(meta.path);
            if (apiCategory)
                push('network', 'external.network', item.duration, { ...meta, category: apiCategory }, meta.startT);
            else if ((item.initiatorType === 'script' || /\.(?:m?js|css)(?:$|[?#])/i.test(String(item.name || ''))) && Number(item.duration || 0) >= 10)
                push('resource', 'external.resource', item.duration, meta, meta.startT);
        }
    }
    catch { }
    scheduleChatSamples('externalDiag.reset');
    return status();
}
export function initRabbitMirrorExternalDiagnostics() {
    if (initialized)
        return globalThis.__rabbitMirrorExternalDiag;
    initialized = true;
    hostWorkEpoch += 1;
    hostWorkRows.clear();
    const token = {};
    hostWorkToken = token;
    startedAt = now();
    entries = [];
    transportRows = getRecentIndependentTransportDiagnostics();
    cleanup = [];
    maintenanceWindows = [];
    const api = {
        version: DIAG_VERSION,
        beginHostWork: name => beginHostWork(name, token),
        hostWork: hostWorkSnapshot,
        mark: (name, meta = {}) => name === 'externalDiag.userEnabled'
            ? mark(name, { readyState: safeString(meta?.readyState || '', 32) })
            : mark('externalDiag.externalMark'),
        dump: () => entries.map(row => ({ ...row })),
        report,
        status,
        reset,
    };
    globalThis.__rabbitMirrorExternalDiag = api;
    globalThis.rabbitMirrorExternalDiagnosticReport = report;
    installTransportMetadataListener();
    installResourceObserver();
    installPerformanceObservers();
    installLifecycleMarks();
    installSendIntentListeners();
    installMaintenanceIntentListeners();
    installChatObserverRetry();
    installHostEventsRetry();
    try {
        const nav = performance.getEntriesByType?.('navigation')?.[0];
        if (nav) {
            push('navigation', 'host.navigation', Number(nav.duration || 0), {
                domContentLoadedMs: Number(nav.domContentLoadedEventEnd || 0),
                loadMs: Number(nav.loadEventEnd || 0),
                responseMs: Number(nav.responseEnd || 0),
            }, -startedAt);
        }
    }
    catch { }
    mark('externalDiag.init', { version: DIAG_VERSION, rabbitMirrorRootPath });
    return api;
}
export function destroyRabbitMirrorExternalDiagnostics() {
    hostWorkToken = null;
    hostWorkEpoch += 1;
    hostWorkRows.clear();
    for (const timer of chatSampleTimers)
        clearTimeout(timer);
    chatSampleTimers.clear();
    for (const observer of firstTextObservers.values()) {
        try {
            observer.disconnect();
        }
        catch { }
    }
    firstTextObservers.clear();
    for (const fn of cleanup.splice(0)) {
        try {
            fn();
        }
        catch { }
    }
    clearHostEvents();
    if (globalThis.__rabbitMirrorExternalDiag?.version === DIAG_VERSION)
        delete globalThis.__rabbitMirrorExternalDiag;
    try {
        delete globalThis.rabbitMirrorExternalDiagnosticReport;
    }
    catch { }
    initialized = false;
}
