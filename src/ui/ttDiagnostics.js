import { rmT as __rmT } from "../textTable.js?rmv=2.5.4";
import { startTtSurfaceDiagnostics, stopTtSurfaceDiagnostics, isTtSurfaceDiagnosticsActive, buildTtSurfaceReport, recordTtSurface, registerTtSurfaceCleanup, nextTtSurfaceClickSeq } from '../ttSurfaceDiagnostics.js?rmv=2.5.4';
import { getRabbitMirrorHostCompatibilityStatus } from '../hostCompatibility.js?rmv=2.5.4';
import { RUNTIME_VERSION, isCurrentRuntime } from './runtime.js?rmv=2.5.4';
import { rabbitMirrorChatTapTarget } from '../outputSanitizer/ttTapTarget.js?rmv=2.5.4';
let retainedTtDiagnosticReport = '';
function captureTtDiagnosticInputs(chatRoot, session) {
    if (!chatRoot?.addEventListener)
        return;
    let root = chatRoot;
    let nodeIds = new WeakMap();
    let nextNodeId = 0;
    const pending = new Map();
    const recent = new Map();
    const bound = (map, key, value) => {
        map.delete(key);
        map.set(key, value);
        if (map.size > 24)
            map.delete(map.keys().next().value);
    };
    const nodeId = node => {
        if (!nodeIds.has(node))
            nodeIds.set(node, ++nextNodeId);
        return nodeIds.get(node);
    };
    const handler = event => {
        if (!isTtSurfaceDiagnosticsActive() || !root)
            return;
        const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement;
        const tap = rabbitMirrorChatTapTarget(event.type === 'toggle'
            ? target?.querySelector?.(':scope > summary') : target);
        if (!tap || !root.contains(tap.details))
            return;
        const details = tap.details;
        const id = nodeId(tap.receipt);
        const pointer = Number.isFinite(event.pointerId) ? event.pointerId : -1;
        let previous = pending.get(pointer);
        let seq;
        if (event.type === 'pointerdown') {
            seq = nextTtSurfaceClickSeq();
            bound(pending, pointer, { seq, node: id });
            previous = null;
        }
        else if (event.type === 'toggle') {
            seq = recent.get(id) || 0;
        }
        else {
            seq = previous?.seq || recent.get(id) || nextTtSurfaceClickSeq();
        }
        if (event.type === 'click' || event.type === 'pointercancel')
            pending.delete(pointer);
        if (seq)
            bound(recent, id, seq);
        const messageId = Number(details.closest('.mes')?.getAttribute('mesid'));
        session.inputEvents += 1;
        recordTtSurface(event.type, {
            seq, node: id, mesid: Number.isInteger(messageId) ? messageId : -1,
            pointerId: Number.isFinite(event.pointerId) ? event.pointerId : undefined,
            pointerType: typeof event.pointerType === 'string' ? event.pointerType : undefined,
            detail: Number.isFinite(event.detail) ? event.detail : undefined,
            eventTime: Number.isFinite(event.timeStamp) ? event.timeStamp : undefined,
            phase: 'capture-before-default', targetKind: tap.kind,
            open: tap.disclosure ? !!tap.disclosure.open : undefined, connected: !!details.isConnected,
            sameDetails: previous ? previous.node === id : undefined,
            defaultPrevented: !!event.defaultPrevented,
        });
    };
    const events = ['pointerdown', 'pointerup', 'pointercancel', 'click', 'toggle'];
    registerTtSurfaceCleanup(() => {
        for (const type of events)
            root?.removeEventListener(type, handler, true);
        pending.clear();
        recent.clear();
        nodeIds = new WeakMap();
        root = null;
    });
    for (const type of events)
        root.addEventListener(type, handler, { capture: true, passive: true });
}
function bindTtDiagnosticTap(button, activate, isAlive) {
    let gesture = null;
    let suppressClick = null;
    const now = () => performance.now();
    const isTouch = event => event.pointerType === 'touch' || event.pointerType === 'pen';
    const usable = () => isAlive() && button.isConnected && !button.disabled;
    const clearGesture = event => {
        if (gesture && gesture.id === event.pointerId) {
            suppressClick = { at: now(), id: gesture.id };
            gesture = null;
        }
    };
    const onDown = event => {
        if (!isTouch(event) || !usable())
            return;
        if (event.isPrimary === false) {
            if (gesture)
                suppressClick = { at: now(), id: gesture.id };
            gesture = null;
            return;
        }
        if (event.button !== 0)
            return;
        suppressClick = null;
        gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, at: now(), moved: false };
    };
    const onMove = event => {
        if (!gesture || gesture.id !== event.pointerId)
            return;
        if (Math.abs(event.clientX - gesture.x) > 12 || Math.abs(event.clientY - gesture.y) > 12)
            gesture.moved = true;
    };
    const onUp = event => {
        if (!isTouch(event) || !gesture || gesture.id !== event.pointerId)
            return;
        const tap = gesture;
        gesture = null;
        suppressClick = { at: now(), id: tap.id };
        if (!usable() || event.isPrimary === false || tap.moved || now() - tap.at > 900
            || Math.abs(event.clientX - tap.x) > 12 || Math.abs(event.clientY - tap.y) > 12)
            return;
        activate('pointerup');
    };
    const onClick = event => {
        if (!usable())
            return;
        if (event.detail !== 0 && suppressClick && now() - suppressClick.at < 1000
            && (!(event.pointerId > 0) || event.pointerId === suppressClick.id))
            return;
        suppressClick = null;
        gesture = null;
        activate('click');
    };
    const handlers = { pointerdown: onDown, pointermove: onMove, pointerup: onUp,
        pointercancel: clearGesture, lostpointercapture: clearGesture, click: onClick };
    for (const [type, handler] of Object.entries(handlers)) {
        button.addEventListener(type, handler, { capture: true, passive: true });
    }
    return () => {
        for (const [type, handler] of Object.entries(handlers))
            button.removeEventListener(type, handler, true);
        gesture = null;
        suppressClick = null;
    };
}
function ttDiagnosticHostNote(state) {
    if (state?.managed === true && state?.registered === true)
        return __rmT("e9_iYPxXoROIcfonuGSufb2OIMOL.yv1zXOEc.dCgG8");
    if (state?.projectionFallback === true)
        return __rmT("GcFY3euTSu4JTFV4ro1szodRX.3tZg3FF_HQwu2gR7eLKYu3.LDRG28__1_LFFOB4ZyVALDNBmK.S9vF6x0xbhcw71QF7KKeECMNpKp7RPuxA8vLZgZE.ZErP1utw5ezcx_NbPRZdaaIOk9EpzJ08cHnI5_utywRPdHzDEObwDh1XNxi8FavO5qtChi7Vkn6gybn9Kc4XsA");
    if (state?.registrationFailure === 'late-projection')
        return __rmT("mpn7ILzaIi.Zb5SlbcAc5DDVjD7U2Ja1s8QwgVRRxkLzU68zP0r7NeFPBAtqFnEwFVSh6c0bpGUAK_h8XP2yTitxeiFRQ43gUboV_e5UX4lSGl2Vq_Xr5T3Ut76fTSMjGDNcCJA4Jb9zHwe1CASQBHuQDC9fHNcVx3_UvMEg0XZX0Lko006euimO");
    if (state?.registrationFailure === 'duplicate-participant')
        return __rmT("CN_FcvXX_MoHt2cJbUJcwI.0Ch2QLR2zGqhT7huUyUEvn63bxY3zYhVXTofqvJxRVTprDwcGUAdgH1YcXyabSynTdQDcxf");
    if (state?.registrationFailure === 'host-rejected')
        return __rmT("cNHurYYvnZQJguybuSShICrTZTOY3CZeLR8YSfJXnLK1HM9plJq4.BsyIhEfuhmnX_VbQl8nrkCJw1WzCG77qx2OmTJt29WAXIHwJIMxCBNyKDYxqDD0if");
    return __rmT("tbGP9kxK1XXrCRoA3Ij4Ale5LNzM.1pmTi7xvO0NNuAk7mjsU9x5LBc0a8hMuVooIqu6dFlfHH_zTq2umoxM7gU05Cs5mPCt3LPsJE3Ew7o_Q8MLQBmNG.ycDhklWiFaJez_9LnNkMozZh");
}
function installTtDiagnosticEntry() {
    try {
        globalThis.__rabbitMirrorTtDiagnosticUiCleanup?.();
    }
    catch { }
    globalThis.__rabbitMirrorTtDiagnosticUiCleanup = null;
    const panel = document.getElementById('rabbit_mirror_theater_settings');
    if (!panel)
        return;
    const start = $(panel.querySelector('#rh_tt_diag_start'));
    const copy = $(panel.querySelector('#rh_tt_diag_copy'));
    const statusText = $(panel.querySelector('#rh_tt_diag_status'));
    const output = $(panel.querySelector('#rh_tt_diag_output'));
    if (!start.length || !copy.length || !statusText.length || !output.length)
        return;
    const hostState = getRabbitMirrorHostCompatibilityStatus();
    const isTt = !!globalThis.__TAURITAVERN__ || hostState?.host === 'tauritavern';
    for (const button of [start[0], copy[0]]) {
        button.hidden = !isTt;
        button.style.setProperty('display', isTt ? 'inline-flex' : 'none', 'important');
    }
    if (!isTt) {
        statusText.hide();
        output.hide();
        return;
    }
    let disposed = false;
    let session = null;
    const inputCleanups = [];
    const isAlive = () => !disposed && isCurrentRuntime() && panel.isConnected
        && document.getElementById('rabbit_mirror_theater_settings') === panel;
    const hostNote = ttDiagnosticHostNote(hostState);
    const notify = (kind, text) => { try {
        globalThis.toastr?.[kind]?.(text);
    }
    catch { } };
    const setStatus = text => { if (!disposed)
        statusText.text(text).show(); };
    const report = () => {
        if (!session)
            return retainedTtDiagnosticReport;
        const elapsed = Math.max(0, (session.endedAt ?? performance.now()) - session.startedAt);
        const head = [
            __rmT("6xJYNP0OXhYmYW0_0A3Zjws46Vv9R6PCDGnFQNGQcNdIn0Eg1L2SZ5gebGT2eT"),
            `diagnostic-start +0ms | managed=${session.host.managed} | registered=${session.host.registered} | protocolVersion=${session.host.protocolVersion ?? __rmT("ssA3hcYy")}`,
            `${__rmT("ASZ9cPKLB8xVTh")}${session.activation} | chatRootFound=${session.chatRootFound} | pointerEvents=${session.pointerEvents}${__rmT("fimAACvSMUWGDnij_g6dHT")}${session.inputEvents}${__rmT("2RdUjk")}`,
            session.host.managed && session.host.registered ? '' : __rmT("3bEk64HDWWr5Ano8X_wHz1bNBXSNV9BfQSZZpiqFZMAJvwLq3fgMGcdXFAKiHcTgiuYcGEmKig4HbNWmZnxIEK4HwWjjASEOU.ArgopTYoSYbalneo0v3W72JveoiKDr"),
            session.endedAt !== null ? `diagnostic-stop +${elapsed.toFixed(0)}ms | ${session.stopReason || __rmT("xSWXkPUIJqCFkROW1yHpnF10UHaYwh")}` : __rmT("A7KnbRC9CfDsaNd9vzf"),
            session.host.errorCode ? `${__rmT("zzFvvMVat9RStf")}${session.host.errorCode}` : '',
            session.host.registrationFailure ? `${__rmT("jxWVcDOjqFeStf")}${session.host.registrationFailure} | ${ttDiagnosticHostNote(session.host)}` : '',
            __rmT("d8JL89WCglK5qe0vcqahYP.aATYAE29m.k20JflO2mUWmCyBcPIuWSPR8EdW_gISOCPoPj9VzZI0F_H9"),
        ].filter(Boolean).join('\n');
        return head + '\n\n' + (session.engineStarted ? buildTtSurfaceReport({ version: RUNTIME_VERSION, ...session.host }) : __rmT("LfRhnXFvRQXX65Gz3TooCjnEbNs"));
    };
    const renderStopped = () => {
        if (!session)
            return;
        session.endedAt = performance.now();
        retainedTtDiagnosticReport = report();
        if (disposed)
            return;
        start.text(__rmT("1mTFV9EBc95UQP8A4ohrL._7Mh.ZVGbBuZzqqh")).prop('disabled', false);
        copy.prop('disabled', false);
        setStatus(__rmT("4hwKLeO6Nn5M9KePaGShPO8tEhVUPWldk8UyV7Ua2sqcpa9zPd1rMZj0.wFWWsrqNesfgZNKK5t4dcmD0BBjUwMYWAT"));
        output.val(retainedTtDiagnosticReport).show();
        if (session.stopReason !== __rmT("ZJKu4rpNwsZYtRFH"))
            notify('success', __rmT("h0tgc_HfKTsznGsr47grRjCdEqzmq8qqKzeVAdvF_MKRYsZ3dwa_1Wgz0ap3.r9x2Wy4ADDzPM8obh"));
    };
    const startDiagnostic = activation => {
        if (!isAlive())
            return;
        if (isTtSurfaceDiagnosticsActive()) {
            if (session)
                session.stopReason = __rmT("k9UaAGjWagA");
            stopTtSurfaceDiagnostics();
            return;
        }
        try {
            const state = getRabbitMirrorHostCompatibilityStatus();
            const chatRoot = document.getElementById('chat');
            session = {
                startedAt: performance.now(), endedAt: null, inputEvents: 0, engineStarted: false, activation,
                chatRootFound: !!chatRoot, pointerEvents: typeof globalThis.PointerEvent === 'function',
                host: { managed: state?.managed === true, registered: state?.registered === true,
                    protocolVersion: Number.isFinite(state?.protocolVersion) ? state.protocolVersion : null,
                    errorCode: String(state?.errorCode || '').slice(0, 48),
                    registrationFailure: ['late-projection', 'duplicate-participant', 'host-rejected'].includes(state?.registrationFailure) ? state.registrationFailure : '' },
            };
            retainedTtDiagnosticReport = '';
            output.val('').hide();
            startTtSurfaceDiagnostics({ onStateChange: active => {
                    if (active) {
                        session.engineStarted = true;
                        recordTtSurface('diagnostic-start', { managed: session.host.managed, registered: session.host.registered, protocolVersion: session.host.protocolVersion });
                    }
                    else
                        renderStopped();
                } });
            captureTtDiagnosticInputs(chatRoot, session);
            start.text(__rmT("y9vqQE2XZ6hrwRVPAVZHNWpuUTLDNLCgB4A8EiiLuyNNxzdx")).prop('disabled', false);
            copy.prop('disabled', false);
            setStatus(chatRoot ? `${__rmT("4hwKLeO6Nn5M9KePzNCACIGt_0gl9LsAlgu12Ixah98tTL9cTOtu4Cg6GpmiddPFP7VmBx5vXkYbw5bkq9ut_L3EWAT")}${ttDiagnosticHostNote(session.host)}` : __rmT("h0tgc_HfKTsznGsrq0RZzqCdYVqb6k1DrnOLQc8bpc8j_zf5_euJvz1IFoVh6n4UhXgFti0a3Ihobh"));
            notify('info', __rmT("d0XUnQZVbI.Ld6RQPD6CFPS1MUYzwUYDogdPKZLNqxbfUygJVzLmoi8kp9OzJN74skaRSZF2Y3Y"));
        }
        catch {
            if (session)
                session.stopReason = __rmT("ZJKu4rpNwsZYtRFH");
            try {
                stopTtSurfaceDiagnostics();
            }
            catch { }
            if (session) {
                session.endedAt = performance.now();
                retainedTtDiagnosticReport = report();
            }
            start.text(__rmT("1mTFV9EBc95UQP8A4ohrL._7Mh.ZVGbBuZzqqh")).prop('disabled', false);
            copy.prop('disabled', false);
            output.val(retainedTtDiagnosticReport || __rmT("w3Jsf_2XcntmaufMXBTPLKrAUVv3FpjAdzlQwkKlmv_XyZQX")).show();
            setStatus(__rmT("CN_FcvXXoY7tRNQlrFrQwg9Bv9OPjPfx_Lqu7w6QNgJKeBtArPUt7_HS2KvT4i0k4zcRaJU9p9HwC4G2.IPV0jCMMclcxf"));
            notify('error', __rmT("kIr_8Hajdh3TQbVn3bA0krtK2OpmV9BOaMPrekmdklksovw6oxF1G15X"));
        }
    };
    const copyDiagnostic = async () => {
        if (!isAlive())
            return;
        if (isTtSurfaceDiagnosticsActive()) {
            if (session)
                session.stopReason = __rmT("iSxmccHL6gAWHf");
            stopTtSurfaceDiagnostics();
        }
        const text = report();
        if (!text) {
            setStatus(__rmT("k0hTC9hULRlLbti4RSJLDcmDafI48FRj_B.oQs5E6kuwEHjAhTDOjmlyABshK32FS0E99Z1gGvNwkTYDym8Frh"));
            notify('warning', __rmT("XjGgAvk3Mx5SVFwfjA.a3d66LTgwl6v70DWEd9mL4ADwZbRDq8_"));
            return;
        }
        output.val(text).show();
        try {
            if (typeof navigator.clipboard?.writeText !== 'function')
                throw new Error('clipboard-unavailable');
            await navigator.clipboard.writeText(text);
            if (isAlive()) {
                setStatus(__rmT("vRYgaArS1miguF7vri3N8IEI"));
                notify('success', __rmT("HC5Vi8wV_DvQfDsARHuBjSZHHAR1MfJ9GmyzIdJGaJYMJ9aGmW51bKyP"));
            }
        }
        catch {
            if (!isAlive())
                return;
            const textarea = output[0];
            let copied = false;
            try {
                textarea?.focus?.({ preventScroll: true });
                textarea?.select?.();
                textarea?.setSelectionRange?.(0, text.length);
                copied = document.execCommand?.('copy') === true;
            }
            catch { }
            setStatus(copied ? __rmT("vRYgaArS1miguF7vri3N8IEI") : __rmT("EnJJkrpGPWZqNLmVepnyoq.q2lR73_qC5NE_zaMiYsz1tSMJlivJgTztGkUX1jWwtiKY3h"));
            notify(copied ? 'success' : 'warning', copied ? __rmT("HC5Vi8wV_DvQfDsARHuBjSZHHAR1MfJ9GmyzIdJGaJYMJ9aGmW51bKyP") : __rmT("QUqFi8OjiZSm4xzywPD7wYZTrxmGz76usnbaTcKzXaH9pf6oMkBr7f"));
        }
    };
    start.off('.rmTtDiag');
    copy.off('.rmTtDiag');
    inputCleanups.push(bindTtDiagnosticTap(start[0], startDiagnostic, isAlive));
    inputCleanups.push(bindTtDiagnosticTap(copy[0], copyDiagnostic, isAlive));
    start.text(__rmT("1mTFV9EBc95UQP8A4ohrL._7Mh.ZVGbBuZzqqh")).prop('disabled', false);
    copy.prop('disabled', false);
    setStatus(`${__rmT("EBie2mnJOXH_IRugKbJaNCuqQ.mkPnSNPHGdswKq")}${hostNote}` + (retainedTtDiagnosticReport ? __rmT("wRL.OP5.0kYEnp3pE.TdFOEI") : __rmT("3Ir4hIjVYRtvVRehAfb3vrvHKpl4Mjr9IDPsXfWdNtu8fptmJb3td15X")));
    if (retainedTtDiagnosticReport)
        output.val(retainedTtDiagnosticReport).show();
    const cleanup = () => {
        if (disposed)
            return;
        disposed = true;
        if (session)
            session.stopReason = __rmT("CqjYDkD63f1ilQi8");
        try {
            stopTtSurfaceDiagnostics();
        }
        catch { }
        for (const dispose of inputCleanups.splice(0))
            dispose();
        start.off('.rmTtDiag');
        copy.off('.rmTtDiag');
        if (globalThis.__rabbitMirrorTtDiagnosticUiCleanup === cleanup)
            globalThis.__rabbitMirrorTtDiagnosticUiCleanup = null;
    };
    globalThis.__rabbitMirrorTtDiagnosticUiCleanup = cleanup;
}
export { installTtDiagnosticEntry };
