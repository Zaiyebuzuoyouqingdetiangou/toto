import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=2.3.3";
import { openGenericProbeSandbox, collectGenericProbeControls, probeGenericControls } from './maintenanceGenericProbe.js?rmv=2.3.3';
export const VS_STEP_ATTR = 'data-vs-step';
const CHECK_BUDGET_MS = 600;
const results = new WeakMap();
const seenKeys = new Map();
let noticeHook = null;
function faceDetails(root) {
    if (!root)
        return null;
    if (root.matches?.('details'))
        return root;
    return root.querySelector?.(':scope > details') || root.querySelector?.('details') || null;
}
function stepTokens(element) {
    return String(element?.getAttribute?.(VS_STEP_ATTR) || '').split(__rmR("trAy1g4eqdCB_nl6Q2D", "")).filter(Boolean);
}
function stepMarkers(details, step) {
    return [...(details?.querySelectorAll?.(`[${VS_STEP_ATTR}]`) || [])].filter(node => stepTokens(node).includes(String(step)));
}
export function readVsPlan(details) {
    let raw = '';
    try {
        raw = details?.getAttribute?.('data-rm-vs')
            || details?.querySelector?.(':scope > :not(summary)[data-rm-vs], :scope > * > [data-rm-vs]')?.getAttribute?.('data-rm-vs') || '';
    }
    catch {
        raw = '';
    }
    if (!raw || raw.length > 8192)
        return null;
    let record;
    try {
        record = JSON.parse(raw);
    }
    catch {
        return null;
    }
    const pick = Number(record?.pick);
    if (!Number.isInteger(pick) || pick < 1 || pick > 5)
        return null;
    const methods = Array.isArray(record?.m) && Array.isArray(record.m[pick - 1]) ? record.m[pick - 1] : [];
    const label = value => String(value ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 12);
    return { pick, labels: methods.slice(0, 3).map(label) };
}
function controlsForMarkers(controls, markers) {
    if (!markers.length)
        return [];
    return controls.filter(({ element }) => markers.some(marker => marker === element || marker.contains(element) || element.contains(marker)
        || (element.matches?.('label[for]') && marker.matches?.('input') && marker.id && element.getAttribute('for') === marker.id)));
}
function shown(element) {
    try {
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden')
            return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 2 && rect.height > 2;
    }
    catch {
        return false;
    }
}
function probeOne(opened, control, started) {
    const details = opened.details;
    const checks = [...details.querySelectorAll('input[type="checkbox"], input[type="radio"]')];
    const checkedBefore = checks.map(input => input.checked);
    let observer = null;
    try {
        observer = new MutationObserver(() => { });
        observer.observe(details, { subtree: true, attributes: true, childList: true, characterData: true });
    }
    catch {
        observer = null;
    }
    let outcome;
    try {
        outcome = probeGenericControls(details, [control], started, CHECK_BUDGET_MS * 4).outcomes.get(control);
    }
    finally {
        const records = observer ? observer.takeRecords() : [];
        try {
            observer?.disconnect();
        }
        catch { }
        if (outcome === 'dead' && (records.length || checks.some((input, index) => input.checked !== checkedBefore[index])))
            outcome = 'uncertain';
    }
    return outcome;
}
function runStep(opened, step, started, previousOk, previousControls) {
    const markers = stepMarkers(opened.details, step);
    if (!markers.length)
        return { status: 'unmarked', controls: [] };
    const candidates = controlsForMarkers(collectGenericProbeControls(opened), markers);
    if (!candidates.length) {
        return { status: markers.some(shown) || !previousOk ? 'unsure' : 'missing', controls: [] };
    }
    let sawDead = false, sawUnsure = false;
    for (const control of candidates) {
        if (Date.now() - started > CHECK_BUDGET_MS)
            return { status: 'timeout', controls: candidates };
        const outcome = probeOne(opened, control, started);
        if (outcome === 'live')
            return { status: 'ok', controls: candidates };
        if (outcome === 'dead' && !previousControls.some(item => item.element === control.element))
            sawDead = true;
        else
            sawUnsure = true;
    }
    return { status: sawDead && !sawUnsure ? 'dead' : 'unsure', controls: candidates };
}
export function checkVsImplementation(root) {
    const details = faceDetails(root);
    if (!details?.isConnected)
        return null;
    const plan = readVsPlan(details);
    const marked = details.querySelector?.(`[${VS_STEP_ATTR}]`);
    if (!plan || !marked)
        return { status: 'unmarked', pick: plan?.pick || null, steps: [] };
    const opened = openGenericProbeSandbox(details);
    if (!opened)
        return null;
    const started = Date.now();
    try {
        const lastStep = Math.max(1, ...[1, 2, 3].filter(step => stepMarkers(details, step).length));
        const steps = Array.from({ length: lastStep }, (_, index) => index + 1).map(step => ({ step, label: plan.labels[step - 1] || '', status: 'unmarked' }));
        let previousOk = true, previousControls = [];
        for (const entry of steps) {
            const outcome = runStep(opened, entry.step, started, previousOk, previousControls);
            entry.status = outcome.status;
            previousOk = entry.status === 'ok';
            previousControls = outcome.controls;
        }
        const status = steps.some(entry => entry.status === 'missing' || entry.status === 'dead') ? 'problem'
            : steps.every(entry => entry.status === 'ok' || entry.status === 'unmarked') ? 'ok' : 'unsure';
        return { status, pick: plan.pick, steps };
    }
    catch (error) {
        console.debug('[RabbitMirror] vs implementation check failed:', error);
        return null;
    }
    finally {
        try {
            opened.sandbox.destroy();
        }
        catch { }
    }
}
export function describeVsImplementationProblem(result) {
    if (result?.status !== 'problem')
        return '';
    const parts = result.steps.filter(entry => entry.status === 'missing' || entry.status === 'dead').map(entry => {
        const name = `${__rmT("BJgCyT")}${entry.step}${__rmT("2RdOYk")}${entry.label ? `${__rmT("YSk")}${entry.label}${__rmT("Yvk")}` : ''}`;
        return entry.status === 'missing' ? `${name}${__rmT("d6aUSijYto4fnl341.dL8MUz")}` : `${name}${__rmT("Y2p4Urma6hepU_341.dA8fKS")}`;
    });
    return `${__rmT("YGHHeEQUDNFWsoWAcgy2bPpotjrRm4AP")}${result.pick}${__rmT("qGyGhrop")}${parts.join(__rmT("7os"))}`;
}
export function vsImplementationCheckDiagnostic(root) {
    const details = faceDetails(root);
    const result = results.get(details);
    const unmarked = __rmT("FwW.FaJ3DzPdiNm00n77OqQRH8nFbGQpkps4Z7SWiKixLW2F4ma.GxNXwYsFHa0ASmuGg28SuJcHBE_UDvefibuxoqg15sdVUtuwKp8_1R7owhfPRQKbFe32_O6BoRDr");
    if (!result && details?.hasAttribute?.('data-rm-vs') && !details.querySelector?.(`[${VS_STEP_ATTR}]`))
        return unmarked;
    if (!result)
        return __rmT("ylKV_eSak7iwyXvJjR_MSYEWsGoIrSmKcDei3.qyg44ZTGgdJljZhhXhE87WNI1y5XV8mLkzo7BvSF.dO4egySnRL0aJSnn12vxiABaVS9HpTuDUazf0if");
    if (result.status === 'unmarked')
        return unmarked;
    const labels = { ok: __rmT("0kkPpOF0FFIiCf"), dead: __rmT("P8wYWLgaf9twFxrcj9tfKk"), missing: __rmT("d6aUSijYto4fnl341.dL8MUz"), unmarked: __rmT("62j4YT"), unsure: __rmT(".o6mWPE9"), timeout: __rmT("aF.yvClkzlsq4McN") };
    return [`${__rmT("8a6OlYjmtoxwH.F.kfCedOd1mmtu.JCElJV_yxZFnb9CIeJp0iEVpwnj43ToWCBrCUXgMIShUt_6unRd3zGBh2o_wjT")}${result.pick}${__rmT("Yis")}${result.status === 'ok' ? __rmT("eCC4.k") : result.status === 'problem' ? __rmT("2hP5_tF724JfXk.f9Sh") : __rmT(".o6mWPE9")}`, ...result.steps.map(entry => `${__rmT("N_wXh1PSHKG")}${entry.step}${__rmT("qGyjicc6")}${labels[entry.status] || entry.status}`)].join('\n');
}
export function getVsImplementationCheck(root) {
    return results.get(faceDetails(root)) || null;
}
export function setVsImplementationNoticeHook(hook) { noticeHook = typeof hook === 'function' ? hook : null; }
function faceKey(details) {
    const text = `${details.getAttribute?.('data-rm-vs') || ''}|${details.querySelectorAll?.(`[${VS_STEP_ATTR}]`).length}|${String(details.textContent || '').length}`;
    let h = 0;
    for (let i = 0; i < text.length; i += 1)
        h = (h * 31 + text.charCodeAt(i)) | 0;
    return String(h);
}
function streaming() {
    try {
        if (globalThis.is_send_press === true)
            return true;
        if (document.querySelector('#chat .mes.streaming, #chat .mes[data-is-streaming="true"], #chat .mes[is_generating="true"], #chat .mes[data-generating="true"]'))
            return true;
        const stop = document.getElementById('mes_stop');
        if (stop && getComputedStyle(stop).display !== 'none')
            return true;
    }
    catch { }
    return false;
}
function messageOf(details) {
    const inside = details.closest?.('.mes');
    if (inside)
        return inside;
    for (let node = details; node && node !== document.body; node = node.parentElement) {
        const previous = node.previousElementSibling;
        if (previous?.matches?.('.mes'))
            return previous;
    }
    return null;
}
function inLatestMessage(details) {
    try {
        return !!messageOf(details)?.classList.contains('last_mes');
    }
    catch {
        return false;
    }
}
function runWhenIdle(details) {
    const go = () => {
        if (!details.isConnected || results.has(details))
            return;
        if (streaming()) {
            setTimeout(() => runWhenIdle(details), 1500);
            return;
        }
        if (details.__rabbitMirrorVsTouched)
            return;
        const key = faceKey(details);
        if (seenKeys.has(key)) {
            results.set(details, seenKeys.get(key));
            return;
        }
        const result = checkVsImplementation(details);
        if (!result)
            return;
        results.set(details, result);
        seenKeys.set(key, result);
        if (seenKeys.size > 300)
            seenKeys.delete(seenKeys.keys().next().value);
        if (result.status === 'problem') {
            const text = describeVsImplementationProblem(result);
            try {
                if (noticeHook)
                    noticeHook(details, result, text);
                else
                    globalThis.toastr?.info?.(`${text}${__rmT("aD36PB8C9gI8INRs.AFe55ssPnpZZr5DZFVlQHPttTz91b_s5zqCk.IbLfxeH9YzJa8JYeRD0WmZ87sLPUBFrh")}`, __rmT("9.JSSv1i"), { timeOut: 9000 });
            }
            catch { }
        }
    };
    const idle = globalThis.requestIdleCallback;
    if (typeof idle === 'function')
        idle(go, { timeout: 2500 });
    else
        setTimeout(go, 400);
}
export function armVsImplementationCheck(root) {
    const details = faceDetails(root);
    if (!details || details.__rabbitMirrorVsCheckArmed)
        return false;
    if (!details.querySelector?.(`[${VS_STEP_ATTR}]`) || !readVsPlan(details))
        return false;
    details.__rabbitMirrorVsCheckArmed = true;
    const summary = details.querySelector?.(':scope > summary');
    const onTouch = event => {
        if (summary?.contains(event.target))
            return;
        details.__rabbitMirrorVsTouched = true;
        details.removeEventListener('pointerdown', onTouch, true);
    };
    details.addEventListener('pointerdown', onTouch, true);
    if (details.open && inLatestMessage(details)) {
        runWhenIdle(details);
        return true;
    }
    if (!summary)
        return false;
    const onClick = event => {
        if (event.target?.closest?.('button, [role="button"], [data-rabbit-mirror-tool-entry-host]') && event.target.closest('summary') === summary
            && event.target !== summary)
            return;
        setTimeout(() => {
            if (!details.open)
                return;
            summary.removeEventListener('click', onClick);
            runWhenIdle(details);
        }, 0);
    };
    summary.addEventListener('click', onClick);
    return true;
}
