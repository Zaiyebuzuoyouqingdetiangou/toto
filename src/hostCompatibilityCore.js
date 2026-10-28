const PARTICIPANT_ID = 'rabbitmirror/message-runtime';
const SURFACES = new Set(['fullscreen-window', 'backdrop', 'free-window', 'viewport-host']);
function registrationFailureReason(error) {
    const message = typeof error?.message === 'string' ? error.message : '';
    if (message.includes('must register before the first projection'))
        return 'late-projection';
    if (message.includes('participant already registered'))
        return 'duplicate-participant';
    return 'host-rejected';
}
function toDisposer(value) {
    if (value === undefined || value === null)
        return null;
    if (typeof value === 'function')
        return value;
    if (typeof value?.then === 'function')
        throw new TypeError('RabbitMirror ChatSurface handlers must return synchronous cleanup');
    if (typeof value?.dispose === 'function')
        return () => value.dispose();
    throw new TypeError('RabbitMirror ChatSurface cleanup must be a function or disposable');
}
export function createRabbitMirrorHostCompatibility(hostGlobal = globalThis, diagnostics = {}) {
    let recordTtSurface = diagnostics.record || (() => { });
    let ttSurfaceNow = diagnostics.now || (() => 0);
    let disposed = false;
    let initialized = false;
    let managed = false;
    let ownershipDetermined = false;
    let earlyHostWatch = 0;
    let earlyHostWatchAttempts = 0;
    let registration = null;
    let status = Object.freeze({ host: 'sillytavern', managed: false, registered: false, protocolVersion: null, errorCode: '', projectionFallback: false });
    const subscriptions = new Map();
    const mounted = new Map();
    const visibleFallback = { observer: null, chatWaiter: null, chatPoll: 0, contentFrame: 0, pendingContent: new Set(), adopted: new Map() };
    function hostTimeout(fn, ms) {
        const schedule = hostGlobal.setTimeout?.bind(hostGlobal) || setTimeout;
        return schedule(fn, ms);
    }
    function hostClearTimeout(id) {
        if (!id)
            return;
        const clear = hostGlobal.clearTimeout?.bind(hostGlobal) || clearTimeout;
        clear(id);
    }
    function findChatRoot() {
        const doc = hostGlobal.document;
        return doc?.getElementById?.('chat') || doc?.querySelector?.('#chat') || null;
    }
    function reportFault(error) {
        status = Object.freeze({ ...status, errorCode: 'CHAT_SURFACE_CONSUMER_FAILED' });
        registration?.fault?.(error);
    }
    function disposeCallback(lease, id) {
        const dispose = lease.cleanups.get(id);
        lease.cleanups.delete(id);
        lease.delivered.delete(id);
        dispose?.();
    }
    function deliver(lease, subscription) {
        if (!lease.active || lease.context.signal.aborted || lease.delivered.has(subscription.id))
            return;
        const callback = subscription[lease.kind];
        if (typeof callback !== 'function')
            return;
        lease.delivered.add(subscription.id);
        const ttStart = ttSurfaceNow();
        const dispose = toDisposer(callback(lease.context));
        recordTtSurface('deliver', {
            sub: subscription.id, phase: lease.kind, mesid: lease.context.mesid,
            ms: ttStart ? performance.now() - ttStart : 0,
        });
        if (!lease.active || !subscriptions.has(subscription.id) || lease.context.signal.aborted)
            dispose?.();
        else if (dispose)
            lease.cleanups.set(subscription.id, dispose);
    }
    function openLease(kind, context) {
        if (disposed)
            return () => { };
        if (!context?.element || !context?.content || !Number.isInteger(context?.mesid)
            || typeof context?.signal?.addEventListener !== 'function') {
            throw new TypeError('RabbitMirror requires a valid TT ChatSurface mounted context');
        }
        if (context.signal.aborted)
            return () => { };
        let record = mounted.get(context.element);
        if (!record) {
            record = { didMount: null, didCommitContent: null };
            mounted.set(context.element, record);
        }
        record[kind]?.dispose();
        mounted.set(context.element, record);
        const lease = { kind, context, active: true, cleanups: new Map(), delivered: new Set(), dispose: null };
        const dispose = () => {
            if (!lease.active)
                return;
            recordTtSurface('lease-dispose', { mesid: context.mesid, phase: kind });
            lease.active = false;
            context.signal.removeEventListener('abort', dispose);
            let firstError = null;
            for (const id of [...lease.delivered]) {
                try {
                    disposeCallback(lease, id);
                }
                catch (error) {
                    firstError ??= error;
                }
            }
            if (record[kind] === lease)
                record[kind] = null;
            if (!record.didMount && !record.didCommitContent)
                mounted.delete(context.element);
            if (firstError)
                reportFault(firstError);
        };
        lease.dispose = dispose;
        record[kind] = lease;
        context.signal.addEventListener('abort', dispose, { once: true });
        try {
            for (const subscription of subscriptions.values())
                deliver(lease, subscription);
        }
        catch (error) {
            dispose();
            throw error;
        }
        return dispose;
    }
    function messageContent(element) {
        return element.querySelector?.('.mes_text') || element;
    }
    function messageId(element) {
        const id = Number(element?.getAttribute?.('mesid'));
        return Number.isInteger(id) ? id : NaN;
    }
    function mutationTargetIsAuxiliary(record) {
        const target = record.target?.nodeType === 1 ? record.target : record.target?.parentElement;
        return !!target?.closest?.('toto, [data-rabbit-mirror-external-source="true"], .rabbit-mirror-composer-clearance, [data-rabbit-mirror-tool-entry-host], [data-rm-image-region], [data-rm-image-portal], .rabbit-mirror-maintenance-toolbar');
    }
    function isHostMessageContentMutation(records) {
        return records.some(record => {
            if (record.type === 'attributes')
                return record.attributeName === 'mesid';
            if (record.type !== 'childList' || mutationTargetIsAuxiliary(record))
                return false;
            return [...(record.addedNodes || []), ...(record.removedNodes || [])].some(node => {
                if (!(node instanceof Element))
                    return true;
                return !node.matches?.('[data-rabbit-mirror-external-source="true"], .rabbit-mirror-composer-clearance, [data-rabbit-mirror-tool-entry-host], [data-rm-image-region], [data-rm-image-portal], .rabbit-mirror-maintenance-toolbar');
            });
        });
    }
    function dropVisibleLease(element) {
        const record = visibleFallback.adopted.get(element);
        if (!record)
            return;
        visibleFallback.adopted.delete(element);
        hostClearTimeout(record.commitTimer);
        record.contentObserver?.disconnect?.();
        try {
            record.mount.abort();
        }
        catch { }
        try {
            record.content.abort();
        }
        catch { }
    }
    function adoptVisibleMessage(element) {
        if (disposed || !managed || status.registered || !(element instanceof Element) || !element.matches?.('.mes'))
            return;
        const mesid = messageId(element);
        if (!Number.isInteger(mesid) || !element.isConnected)
            return;
        dropVisibleLease(element);
        const content = messageContent(element);
        const mount = new AbortController();
        openLease('didMount', { mesid, element, content, signal: mount.signal });
        const contentObserver = typeof MutationObserver === 'function'
            ? new MutationObserver(records => {
                if (disposed || status.registered)
                    return;
                const nextId = messageId(element);
                if (nextId !== mesid) {
                    adoptVisibleMessage(element);
                    return;
                }
                if (isHostMessageContentMutation(records))
                    queueVisibleContent(element);
            })
            : null;
        contentObserver?.observe(element, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['mesid'],
        });
        visibleFallback.adopted.set(element, { mount, content: null, contentObserver, commitTimer: 0 });
        queueVisibleContent(element);
    }
    function refreshVisibleContent(element) {
        const record = visibleFallback.adopted.get(element);
        if (!record || disposed || !element.isConnected)
            return;
        const mesid = messageId(element);
        if (!Number.isInteger(mesid))
            return;
        const content = messageContent(element);
        try {
            record.content?.abort();
        }
        catch { }
        const contentLease = new AbortController();
        openLease('didCommitContent', { mesid, element, content, signal: contentLease.signal });
        record.content = contentLease;
        record.contentNode = content;
    }
    function queueVisibleContent(element) {
        const record = visibleFallback.adopted.get(element);
        if (!record || disposed)
            return;
        hostClearTimeout(record.commitTimer);
        record.commitTimer = hostTimeout(() => {
            record.commitTimer = 0;
            refreshVisibleContent(element);
        }, 150);
    }
    function collectDirectMessages(root, node) {
        if (!(node instanceof Element))
            return [];
        if (node.matches?.('.mes') && node.parentElement === root)
            return [node];
        return [...(node.querySelectorAll?.(':scope > .mes, .mes') || [])].filter(el => el.parentElement === root);
    }
    function stopVisibleProjectionFallback() {
        visibleFallback.observer?.disconnect?.();
        visibleFallback.observer = null;
        visibleFallback.chatWaiter?.disconnect?.();
        visibleFallback.chatWaiter = null;
        hostClearTimeout(visibleFallback.chatPoll);
        visibleFallback.chatPoll = 0;
        if (visibleFallback.contentFrame && typeof hostGlobal.cancelAnimationFrame === 'function') {
            hostGlobal.cancelAnimationFrame(visibleFallback.contentFrame);
        }
        visibleFallback.contentFrame = 0;
        visibleFallback.pendingContent.clear();
        for (const element of [...visibleFallback.adopted.keys()])
            dropVisibleLease(element);
    }
    function attachVisibleProjectionFallback(chatRoot) {
        if (disposed || !managed || status.registered || visibleFallback.observer || !chatRoot?.isConnected)
            return;
        status = Object.freeze({ ...status, projectionFallback: true });
        for (const node of chatRoot.children || [])
            adoptVisibleMessage(node);
        if (typeof MutationObserver !== 'function')
            return;
        visibleFallback.observer = new MutationObserver(records => {
            if (disposed || status.registered)
                return;
            for (const record of records) {
                if (record.target !== chatRoot || record.type !== 'childList')
                    continue;
                for (const node of record.removedNodes || []) {
                    for (const element of collectDirectMessages(chatRoot, node))
                        dropVisibleLease(element);
                }
                for (const node of record.addedNodes || []) {
                    for (const element of collectDirectMessages(chatRoot, node))
                        adoptVisibleMessage(element);
                }
            }
        });
        visibleFallback.observer.observe(chatRoot, { childList: true });
        try {
            console.info('[RabbitMirror] ChatSurface late-projection fallback: visible-floor remount from cache; this is not a successful ChatSurface registration');
        }
        catch { }
    }
    function startVisibleProjectionFallback() {
        if (disposed || !managed || status.registered)
            return;
        const attachIfReady = () => {
            if (disposed || !managed || status.registered || visibleFallback.observer)
                return true;
            const chatRoot = findChatRoot();
            if (!chatRoot?.isConnected)
                return false;
            visibleFallback.chatWaiter?.disconnect?.();
            visibleFallback.chatWaiter = null;
            hostClearTimeout(visibleFallback.chatPoll);
            visibleFallback.chatPoll = 0;
            attachVisibleProjectionFallback(chatRoot);
            return true;
        };
        if (attachIfReady())
            return;
        const doc = hostGlobal.document;
        if (!visibleFallback.chatWaiter && typeof MutationObserver === 'function' && doc?.documentElement) {
            visibleFallback.chatWaiter = new MutationObserver(() => { attachIfReady(); });
            visibleFallback.chatWaiter.observe(doc.documentElement, { childList: true, subtree: true });
        }
        if (!visibleFallback.chatPoll) {
            let attempts = 0;
            const poll = () => {
                visibleFallback.chatPoll = 0;
                if (attachIfReady() || disposed || status.registered || ++attempts > 40)
                    return;
                visibleFallback.chatPoll = hostTimeout(poll, 250);
            };
            visibleFallback.chatPoll = hostTimeout(poll, 0);
        }
    }
    function scheduleEarlyHostWatch() {
        if (earlyHostWatch || disposed)
            return;
        const tick = () => {
            earlyHostWatch = 0;
            if (disposed || status.registered || status.errorCode || ownershipDetermined)
                return;
            if (++earlyHostWatchAttempts > 80)
                return;
            const api = hostGlobal?.__TAURITAVERN__?.api?.chatSurface;
            if (typeof api?.isManagedOwnershipRequired !== 'function') {
                scheduleEarlyHostWatch();
                return;
            }
            initialize();
        };
        earlyHostWatch = hostTimeout(tick, 50);
    }
    function initialize() {
        if (disposed)
            return status;
        const host = hostGlobal?.__TAURITAVERN__;
        if (initialized) {
            if (status.registered || status.errorCode || ownershipDetermined)
                return status;
            if (!host)
                return status;
            initialized = false;
        }
        initialized = true;
        const api = host?.api?.chatSurface;
        if (!host) {
            initialized = false;
            scheduleEarlyHostWatch();
            return status;
        }
        status = Object.freeze({ ...status, host: 'tauritavern', protocolVersion: api?.protocolVersion ?? null });
        if (typeof api?.isManagedOwnershipRequired !== 'function') {
            initialized = false;
            scheduleEarlyHostWatch();
            return status;
        }
        try {
            managed = api.isManagedOwnershipRequired() === true;
        }
        catch {
            managed = true;
            status = Object.freeze({ ...status, managed, errorCode: 'CHAT_SURFACE_OWNERSHIP_UNAVAILABLE' });
            startVisibleProjectionFallback();
            return status;
        }
        ownershipDetermined = true;
        status = Object.freeze({ ...status, managed });
        if (!managed)
            return status;
        if (api.protocolVersion !== 1 || typeof api.registerParticipant !== 'function') {
            status = Object.freeze({ ...status, errorCode: 'CHAT_SURFACE_PROTOCOL_UNSUPPORTED' });
            startVisibleProjectionFallback();
            return status;
        }
        try {
            registration = api.registerParticipant({
                id: PARTICIPANT_ID,
                protocolVersion: 1,
                didMount: context => openLease('didMount', context),
                didCommitContent: context => openLease('didCommitContent', context),
            });
            status = Object.freeze({ ...status, registered: true });
        }
        catch (error) {
            status = Object.freeze({ ...status, errorCode: 'CHAT_SURFACE_REGISTRATION_FAILED',
                registrationFailure: registrationFailureReason(error) });
            startVisibleProjectionFallback();
        }
        return status;
    }
    function subscribe(definition) {
        if (disposed)
            return () => { };
        initialize();
        if (!definition || typeof definition.id !== 'string' || !definition.id.trim()) {
            throw new TypeError('RabbitMirror ChatSurface consumer requires a stable id');
        }
        for (const kind of ['didMount', 'didCommitContent']) {
            if (definition[kind] !== undefined && typeof definition[kind] !== 'function') {
                throw new TypeError(`RabbitMirror ChatSurface ${kind} must be a function`);
            }
        }
        if (!managed)
            return () => { };
        if (subscriptions.has(definition.id))
            throw new Error(`Duplicate RabbitMirror ChatSurface consumer: ${definition.id}`);
        const subscription = { id: definition.id, didMount: definition.didMount, didCommitContent: definition.didCommitContent };
        subscriptions.set(subscription.id, subscription);
        let active = true;
        const unsubscribe = () => {
            if (!active)
                return;
            active = false;
            subscriptions.delete(subscription.id);
            let firstError = null;
            for (const record of mounted.values()) {
                for (const kind of ['didMount', 'didCommitContent']) {
                    if (!record[kind])
                        continue;
                    try {
                        disposeCallback(record[kind], subscription.id);
                    }
                    catch (error) {
                        firstError ??= error;
                    }
                }
            }
            if (firstError)
                reportFault(firstError);
        };
        try {
            for (const record of mounted.values()) {
                for (const kind of ['didMount', 'didCommitContent']) {
                    if (record[kind])
                        deliver(record[kind], subscription);
                }
            }
        }
        catch (error) {
            unsubscribe();
            reportFault(error);
            throw error;
        }
        return unsubscribe;
    }
    function dispose() {
        if (disposed)
            return;
        disposed = true;
        hostClearTimeout(earlyHostWatch);
        earlyHostWatch = 0;
        stopVisibleProjectionFallback();
        let firstError = null;
        for (const record of [...mounted.values()]) {
            for (const kind of ['didMount', 'didCommitContent']) {
                try {
                    record[kind]?.dispose();
                }
                catch (error) {
                    firstError ??= error;
                }
            }
        }
        subscriptions.clear();
        mounted.clear();
        recordTtSurface = () => { };
        ttSurfaceNow = () => 0;
        if (firstError)
            reportFault(firstError);
    }
    return Object.freeze({
        initialize,
        dispose,
        attachDiagnostics(next = {}) {
            if (disposed)
                return;
            recordTtSurface = typeof next.record === 'function' ? next.record : (() => { });
            ttSurfaceNow = typeof next.now === 'function' ? next.now : (() => 0);
        },
        isManaged: () => { initialize(); return managed; },
        getStatus: () => { initialize(); return status; },
        subscribe,
        getMountedMessages() {
            initialize();
            return [...mounted.values()].map(record => {
                const content = record.didCommitContent;
                const mount = record.didMount;
                const live = (content && !content.context.signal.aborted ? content : null)
                    || (mount && !mount.context.signal.aborted ? mount : null);
                return live?.context;
            }).filter(Boolean);
        },
        externalPlacementParent(message) {
            initialize();
            if (!message || (!managed && !hostGlobal?.__TAURITAVERN__))
                return null;
            const body = message.querySelector?.('.mes_text');
            if (body?.parentElement && message.contains(body.parentElement))
                return body.parentElement;
            const block = message.querySelector?.('.mes_block');
            if (block && message.contains(block))
                return block;
            return message;
        },
        applySurface(element, surface) {
            if (!SURFACES.has(surface))
                throw new TypeError('Unsupported RabbitMirror host surface');
            if (!hostGlobal?.__TAURITAVERN__?.api?.layout || typeof element?.setAttribute !== 'function')
                return false;
            element.setAttribute('data-tt-mobile-surface', surface);
            return true;
        },
    });
}
