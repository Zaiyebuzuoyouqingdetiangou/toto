import { recordTtSurface, ttSurfaceNow } from './ttSurfaceDiagnostics.js?rmv=1.65.4';
// Reserve scrollable space, not a decorative frame. No chat text, polling or model calls.
import { isRabbitMirrorManagedChatSurface, getRabbitMirrorMountedMessages, subscribeRabbitMirrorChatSurface } from './hostCompatibility.js?rmv=1.65.4';
let active = null;
export function composerOverlap(chat, composer, viewportBottom) {
    if (!chat || !composer || composer.width <= 0 || composer.height <= 0
        || composer.right <= chat.left || composer.left >= chat.right) return 0;
    const bottom = Math.min(chat.bottom, viewportBottom);
    if (composer.top >= bottom || composer.bottom <= chat.top) return 0;
    return Math.ceil(Math.max(0, bottom - Math.max(chat.top, composer.top)) + 12);
}
export function scheduleRabbitMirrorComposerClearance() { active?.schedule('external'); }
function externalFooterClearance(message) {
    const rect = message.getBoundingClientRect();
    let protrusion = 0;
    // Measure only the adjacent owner's footer geometry, never theme artwork/text.
    for (const pseudo of ['::before', '::after']) {
        const style = getComputedStyle(message, pseudo);
        if (!style.content || style.content === 'none' || style.content === 'normal'
            || style.display === 'none' || style.visibility === 'hidden' || style.position !== 'absolute') continue;
        if (/^-?[\d.]+px$/.test(style.bottom)) protrusion = Math.max(protrusion, -parseFloat(style.bottom));
    }
    for (const node of message.querySelectorAll('.swipe_left, .swipeRightBlock, .swipes-counter')) {
        const style = getComputedStyle(node), box = node.getBoundingClientRect();
        if (style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0)
            protrusion = Math.max(protrusion, box.bottom - rect.bottom);
    }
    return protrusion > 0 ? Math.ceil(protrusion + 6) : 0;
}
export function destroyRabbitMirrorComposerClearance() { active?.destroy(); active = null; }
export function initRabbitMirrorComposerClearance() {
    destroyRabbitMirrorComposerClearance();
    const chat = document.getElementById('chat');
    if (!chat) return;
    let frame = 0, stopped = false, spacer = null, lastHeight = 0;
    let observedForm = null, footerOwner = null, footerHeight = 0;
    let unsubscribeManaged = null, managedDebounce = 0, lastInset = -1, lastFormHeight = -1;
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(entries => {
        const entry = entries?.[0];
        const target = entry?.target;
        if (!target) return;
        if (target === chat) {
            if (!chatSurfaceOwnsChat()) schedule('resize-chat');
            return;
        }
        const next = Math.round(entry.contentRect?.height || 0);
        if (chatSurfaceOwnsChat() && lastFormHeight >= 0 && Math.abs(next - lastFormHeight) < 8) return;
        lastFormHeight = next;
        schedule('resize-form');
    }) : null;
    const viewport = window.visualViewport;
    function chatSurfaceOwnsChat() {
        return !!globalThis.__TAURITAVERN__ || isRabbitMirrorManagedChatSurface();
    }
    function lastVisibleMessage() {
        const mounted = chatSurfaceOwnsChat()
            ? getRabbitMirrorMountedMessages().filter(context => !context.signal.aborted && context.element.isConnected)
            : [];
        return mounted.find(context => context.element.matches('.last_mes'))?.element
            || chat.querySelector(':scope > .mes.last_mes');
    }
    function ensureManagedSubscription() {
        if (unsubscribeManaged || stopped || !isRabbitMirrorManagedChatSurface()) return;
        unsubscribeManaged = subscribeRabbitMirrorChatSurface({
            id: 'rabbitmirror/composer-clearance', didMount: onManagedMount,
            didCommitContent: () => { schedule('managed-commit'); },
        });
    }
    function measure() {
        frame = 0;
        const ttStart = ttSurfaceNow();
        if (stopped || !chat.isConnected) return;
        ensureManagedSubscription();
        const ownsChat = chatSurfaceOwnsChat();
        const lastMountedOwner = ownsChat ? lastVisibleMessage() : null;
        const owner = ownsChat ? null : chat.querySelector(':scope > .mes.last_mes:has(+ .rabbit-mirror-external-host[data-rm-source="independent"][data-rm-placement="external"]:not([hidden]))');
        if (footerOwner !== owner) {
            footerOwner?.style.removeProperty('--rm-external-footer-clearance');
            footerOwner = owner; footerHeight = 0;
        }
        if (owner) {
            const next = externalFooterClearance(owner);
            if (next !== footerHeight) {
                owner.style.setProperty('--rm-external-footer-clearance', `${next}px`);
                recordTtSurface('layout-write', { what: 'footer-var', changed: true, prev: footerHeight, next });
                footerHeight = next;
            }
        }
        const form = document.getElementById('send_form') || document.getElementById('form_sheld');
        if (observedForm !== form) {
            if (observedForm) resize?.unobserve(observedForm);
            observedForm = form;
            if (form) resize?.observe(form);
        }
        const hasMirror = ownsChat
            ? !!lastMountedOwner?.querySelector('toto, [data-rabbit-mirror-external-source="true"]')
            : !!chat.querySelector('toto, [data-rabbit-mirror-external-source="true"]');
        const formStyle = form && getComputedStyle(form);
        const shown = form && formStyle.display !== 'none' && formStyle.visibility !== 'hidden';
        const bottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
        const rawHeight = hasMirror && shown ? composerOverlap(chat.getBoundingClientRect(), form.getBoundingClientRect(), bottom) : 0;
        // 16px steps: iOS reports a slightly different overlap on each caret move.
        const height = ownsChat && rawHeight > 0 ? Math.ceil(rawHeight / 16) * 16 : rawHeight;
        // Virtualized #chat measures every .mes. A spacer inside that row is a flex
        // item: its flex-basis steals width, the mirror reflows, and the virtualizer
        // remeasures the whole viewport. iOS fires visualViewport scroll on each
        // caret move, so that write became per-keystroke layout. Keep the gap as
        // scrollport padding; item geometry stays untouched.
        if (ownsChat) {
            const previousHeight = lastHeight;
            applyManagedClearance(height);
            recordTtSurface('clearance-measure', { ms: ttStart ? performance.now() - ttStart : 0, managed: true, height, changed: height !== previousHeight });
            return;
        }
        if (!height) {
            if (spacer) {
                recordTtSurface('layout-write', { what: 'spacer-remove', changed: lastHeight !== 0, prev: lastHeight });
                spacer.remove(); spacer = null;
            }
            recordTtSurface('clearance-measure', { ms: ttStart ? performance.now() - ttStart : 0, managed: ownsChat, height: 0, changed: lastHeight !== 0 });
            lastHeight = 0;
            return;
        }
        const nearEnd = chat.scrollHeight - chat.clientHeight - chat.scrollTop < 4;
        const oldHeight = lastHeight;
        if (!spacer) {
            spacer = document.createElement('div');
            spacer.className = 'rabbit-mirror-composer-clearance';
            spacer.setAttribute('aria-hidden', 'true');
        }
        if (height !== lastHeight) {
            spacer.style.setProperty('--rm-composer-clearance', `${height}px`);
            recordTtSurface('layout-write', { what: 'clearance-var', changed: true, prev: lastHeight, next: height });
            lastHeight = height;
        }
        // Unmanaged SillyTavern only. TT never reaches here: a spacer inside .mes
        // changes the virtualizer's measured item size.
        if (chat.lastElementChild !== spacer) {
            recordTtSurface('layout-write', { what: 'spacer-append', changed: true, managed: false, height });
            chat.append(spacer);
        }
        recordTtSurface('clearance-measure', { ms: ttStart ? performance.now() - ttStart : 0, managed: ownsChat, height, changed: height !== oldHeight });
        if (!ownsChat && nearEnd && height > oldHeight) chat.scrollTop = chat.scrollHeight;
    }
    function clearManagedClearance() {
        if (spacer?.isConnected) { spacer.remove(); spacer = null; }
        chat.style.removeProperty('--rm-composer-clearance');
        chat.style.removeProperty('--rm-chat-padding-base');
        chat.removeAttribute('data-rm-tt-clearance');
    }
    function applyManagedClearance(height) {
        if (spacer?.isConnected) { spacer.remove(); spacer = null; }
        if (!height) {
            if (chat.hasAttribute('data-rm-tt-clearance') || lastHeight) {
                recordTtSurface('layout-write', { what: 'tt-padding-clear', changed: lastHeight !== 0, prev: lastHeight });
                clearManagedClearance();
                lastHeight = 0;
                notifyChatLayoutChanged();
            }
            return;
        }
        if (!chat.hasAttribute('data-rm-tt-clearance')) {
            // Read the theme padding once, before our own rule replaces it.
            const base = getComputedStyle(chat).paddingBottom || '0px';
            chat.style.setProperty('--rm-chat-padding-base', base);
            chat.setAttribute('data-rm-tt-clearance', 'true');
        }
        if (height !== lastHeight) {
            chat.style.setProperty('--rm-composer-clearance', `${height}px`);
            recordTtSurface('layout-write', { what: 'tt-padding', changed: true, prev: lastHeight, next: height });
            lastHeight = height;
            // TT only re-reads #chat padding on this event. One shot per real
            // clearance change, so the virtualizer's paddingEnd matches the CSS.
            notifyChatLayoutChanged();
        }
    }
    function notifyChatLayoutChanged() {
        try { window.dispatchEvent(new Event('sillytavern:chat-layout-changed')); } catch {}
    }
    function keyboardInset() {
        const vv = window.visualViewport;
        if (!vv) return 0;
        return Math.max(0, Math.round(window.innerHeight - vv.height - (vv.offsetTop || 0)));
    }
    function schedule(source) {
        const sourceName = typeof source === 'string' ? source : 'unknown';
        if (stopped) return;
        if (!chatSurfaceOwnsChat()) {
            recordTtSurface('clearance-schedule', { source: sourceName });
            if (!frame) frame = requestAnimationFrame(measure);
            return;
        }
        // Typing moves the visual viewport by a line or two and resizes it by a
        // few pixels. Measuring then forces layout of every mounted mirror, and
        // a padding write asks the virtualizer to remeasure them. Only a real
        // keyboard open/close (or the composer itself growing) may do that.
        if (sourceName === 'viewport-scroll' || sourceName === 'resize-chat' || sourceName === 'focusin' || sourceName === 'focusout') return;
        const inset = keyboardInset();
        const insetChanged = lastInset < 0 || Math.abs(inset - lastInset) >= 80;
        if (!insetChanged && sourceName !== 'init' && sourceName !== 'resize-form' && sourceName !== 'external' && sourceName !== 'managed-mount' && sourceName !== 'managed-unmount') return;
        recordTtSurface('clearance-schedule', { source: sourceName });
        if (managedDebounce) clearTimeout(managedDebounce);
        managedDebounce = setTimeout(() => {
            managedDebounce = 0;
            if (stopped) return;
            const settled = keyboardInset();
            const stillChanged = lastInset < 0 || Math.abs(settled - lastInset) >= 80;
            if (!stillChanged && sourceName !== 'init' && sourceName !== 'resize-form' && sourceName !== 'external' && sourceName !== 'managed-mount' && sourceName !== 'managed-unmount') return;
            lastInset = settled;
            if (!frame) frame = requestAnimationFrame(measure);
        }, 320);
    }
    const onManagedMount = context => {
        schedule('managed-mount');
        return () => {
            if (spacer && context.element.contains(spacer)) {
                spacer.remove(); spacer = null; lastHeight = 0;
            }
            schedule('managed-unmount');
        };
    };
    ensureManagedSubscription();
    const structure = !chatSurfaceOwnsChat() && typeof MutationObserver === 'function' ? new MutationObserver(records => {
        if (records.some(r => [...r.addedNodes, ...r.removedNodes].some(n => n !== spacer))) schedule('structure');
    }) : null;
    // 具名包装：事件 handler 直接传 schedule 会把 Event 当作 source，且
    // removeEventListener 必须引用同一函数对象。包装只为标注来源，不改变时序。
    const onWindowResize = () => schedule('window-resize');
    const onViewportResize = () => schedule('viewport-resize');
    const onViewportScroll = () => schedule('viewport-scroll');
    const onFocusIn = () => schedule('focusin');
    const onFocusOut = () => schedule('focusout');
    structure?.observe(chat, { childList: true });
    if (!chatSurfaceOwnsChat()) resize?.observe(chat);
    window.addEventListener('resize', onWindowResize, { passive: true });
    viewport?.addEventListener('resize', onViewportResize, { passive: true });
    viewport?.addEventListener('scroll', onViewportScroll, { passive: true });
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    active = { schedule, destroy() {
        stopped = true;
        unsubscribeManaged?.();
        if (managedDebounce) { clearTimeout(managedDebounce); managedDebounce = 0; }
        if (frame) cancelAnimationFrame(frame);
        structure?.disconnect(); resize?.disconnect(); spacer?.remove();
        clearManagedClearance();
        footerOwner?.style.removeProperty('--rm-external-footer-clearance');
        window.removeEventListener('resize', onWindowResize);
        viewport?.removeEventListener('resize', onViewportResize);
        viewport?.removeEventListener('scroll', onViewportScroll);
        document.removeEventListener('focusin', onFocusIn);
        document.removeEventListener('focusout', onFocusOut);
    } };
    schedule('init');
}
