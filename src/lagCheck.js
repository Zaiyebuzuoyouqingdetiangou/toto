import { rmT as __rmT } from "./textTable.js?rmv=2.5.0";
const DEFAULT_SECONDS = 60;
const SAVE_RE = /\/api\/chats\/(?:group\/)?save\b/i;
const ownSaves = [];
export function noteRabbitMirrorChatSave(reason = '') {
    ownSaves.push({ at: Date.now(), reason: String(reason || '').slice(0, 40) });
    if (ownSaves.length > 200)
        ownSaves.splice(0, ownSaves.length - 200);
    try {
        globalThis.console?.debug?.(`${__rmT("8IJZNwWOYG6TRqZRrIfVGN_4EV5.RmwCuDZ_QN_QeSJWqKSZPSWypkHeg.Yh9k")}${reason || __rmT("ni2SEPTw")}${__rmT("eXs")}`);
    }
    catch { }
}
export function rabbitMirrorChatSavesSince(since) {
    return ownSaves.filter(item => item.at >= since);
}
export function lagOwnerOf(url, origin = globalThis.location?.origin || '') {
    const text = String(url || '');
    if (!text)
        return { key: 'unknown', label: __rmT("BsLoaBc1N7DkBC2GQssGuOwjX27Y7h") };
    let path = text;
    try {
        const parsed = new URL(text, origin || undefined);
        path = decodeURIComponent(parsed.pathname);
        if (origin && parsed.origin !== origin)
            return { key: `ext:${parsed.host}`, label: `${__rmT("GZvOVfaVpM7Ttf")}${parsed.host}${__rmT("eXs")}` };
    }
    catch { }
    const third = path.match(/\/scripts\/extensions\/third-party\/([^/?#]+)/);
    if (third)
        return { key: `plugin:${third[1]}`, label: third[1], plugin: third[1] };
    const builtIn = path.match(/\/scripts\/extensions\/([^/?#]+)/);
    if (builtIn)
        return { key: `builtin:${builtIn[1]}`, label: `${__rmT("Rb5YOZUYc43K64.WVpA")}${builtIn[1]}` };
    return { key: 'host', label: __rmT("rcHBrjPXcQY") };
}
export function lagCheckSupport() {
    const types = globalThis.PerformanceObserver?.supportedEntryTypes || [];
    return { perPlugin: types.includes('long-animation-frame'), total: types.includes('long-animation-frame') || types.includes('longtask') };
}
let running = null;
export function lagCheckRunning() { return !!running; }
export function startLagCheck({ seconds = DEFAULT_SECONDS, onTick, ownFolder = '' } = {}) {
    if (running)
        return running.promise;
    const support = lagCheckSupport();
    const started = Date.now();
    const startedPerf = globalThis.performance?.now?.() || 0;
    const owners = new Map();
    const result = { seconds, perPlugin: support.perPlugin, supported: support.total, longFrames: 0, blockingMs: 0, longMs: 0, owners: [], saves: { count: 0, ms: 0, fromRabbitMirror: 0, reasons: [] }, ownFolder };
    const observers = [];
    const watch = (type, handle) => {
        try {
            const observer = new PerformanceObserver(list => { for (const entry of list.getEntries())
                handle(entry); });
            observer.observe({ type, buffered: false });
            observers.push(observer);
            return true;
        }
        catch {
            return false;
        }
    };
    if (support.perPlugin) {
        watch('long-animation-frame', entry => {
            result.longFrames += 1;
            result.longMs += Number(entry.duration) || 0;
            result.blockingMs += Number(entry.blockingDuration) || 0;
            for (const script of entry.scripts || []) {
                const owner = lagOwnerOf(script.sourceURL || script.sourceLocation || '');
                const row = owners.get(owner.key) || { ...owner, ms: 0, count: 0 };
                row.ms += Number(script.duration) || 0;
                row.count += 1;
                owners.set(owner.key, row);
            }
        });
    }
    else if (support.total) {
        watch('longtask', entry => {
            result.longFrames += 1;
            result.longMs += Number(entry.duration) || 0;
            result.blockingMs += Math.max(0, (Number(entry.duration) || 0) - 50);
        });
    }
    watch('resource', entry => {
        if (!SAVE_RE.test(String(entry.name || '')))
            return;
        if (Number(entry.startTime) < startedPerf)
            return;
        result.saves.count += 1;
        result.saves.ms += Number(entry.duration) || 0;
    });
    let timer = 0, tick = 0, finishNow = null;
    const promise = new Promise(resolve => {
        const finish = () => {
            clearInterval(tick);
            clearTimeout(timer);
            for (const observer of observers) {
                try {
                    observer.disconnect();
                }
                catch { }
            }
            const own = rabbitMirrorChatSavesSince(started);
            result.saves.fromRabbitMirror = own.length;
            result.saves.reasons = [...new Set(own.map(item => item.reason).filter(Boolean))];
            result.owners = [...owners.values()].sort((a, b) => b.ms - a.ms);
            result.endedAt = Date.now();
            running = null;
            resolve(result);
        };
        let left = seconds;
        try {
            onTick?.(left);
        }
        catch { }
        tick = setInterval(() => { left -= 1; try {
            onTick?.(Math.max(0, left));
        }
        catch { } }, 1000);
        timer = setTimeout(finish, seconds * 1000);
        finishNow = finish;
    });
    running = { promise, stop: () => finishNow?.() };
    return promise;
}
export function stopLagCheck() { running?.stop?.(); }
const ms = value => (value >= 1000 ? `${(value / 1000).toFixed(1)}${__rmT("2RCLfh")}` : `${Math.round(value)}${__rmT("qGluiMsz")}`);
export function describeLagCheck(result) {
    if (!result)
        return '';
    const lines = [`${__rmT("k65qZGB0Wgrj0TIZAMmdHT")}${result.seconds}${__rmT("2RCLfh")}`];
    if (!result.supported) {
        lines.push(__rmT("MENt8FGjgLiDfcOivIXje41LsPi1N6x2Ny1xc8spX3Bdoaycx5G79FUVZpO.SogU6QB4XxcilfeBxk0HrCNscGVNDM0hKTGU.8RBXhzXk0J8f3Tcdmql9n8bdH6eaBoq_6WyLzzYyfZFQ1.Pn6yZi7Klg5kDBF5waNwQ9KpkTbtszzc6qP8HzxW2LeTi2K1Ud3Xtof"));
        return lines.join('\n');
    }
    lines.push(result.longFrames
        ? `${__rmT("N0ifayHg5oyFa7iFkyvgtXPiMk.zVCv5uZzqqh")}${result.longFrames}${__rmT("4bM2RpJx1sDqMlBq")}${ms(result.longMs)}${__rmT("nhNEYk5EaAwCFocq5_T5SXbti.xpZ1HZAWhaxEsIkpZtnh")}${ms(result.blockingMs)}${__rmT("jzk")}` : __rmT("JsZf0.XiSZ_z9pQlK71VBLi_Tnr3C0JblG2l3LikwEPhzXwGuxKGnpPgrb_qU8f5uiPIoHGP"));
    if (result.perPlugin && result.owners.length) {
        lines.push(__rmT("ORSyDVzsVRMdI5n6mtXwQD6WU8AxDpvQOuXQTio8"));
        for (const row of result.owners.slice(0, 12)) {
            const own = result.ownFolder && row.plugin === result.ownFolder;
            lines.push(`  ${own ? `${__rmT("1u9yaTGl0vY")}${row.label}${__rmT("eXs")}` : row.label}${__rmT("7ys")}${ms(row.ms)}${__rmT("eis")}${row.count}${__rmT("qGR1iqZp")}`);
        }
        if (!result.owners.some(row => result.ownFolder && row.plugin === result.ownFolder))
            lines.push(__rmT("tMtZnKKQAwb.E8nguhXSLzLmN1OJf_NgvlVvEk"));
    }
    else if (!result.perPlugin && result.longFrames) {
        lines.push(__rmT("6rpas51DtPKPQzE7mj0syYaBs5Fffxop1A9joFgTjenH1JavN12TmIoMV0op3e0AP7SMg3FuQYK1T.6jLBKE.fvw_ZfO0DjE0VIaX9jdpNu4F5EWIa4mv60tZSAjyOZsjv0PWdES4d_TlrfF"));
    }
    lines.push(result.saves.count
        ? `${__rmT("bassxOBej7NmyEBq")}${result.saves.count}${__rmT("4bM2RpJx1sDqMlBq")}${ms(result.saves.ms)}${__rmT("OLqfSyQLRFWpAq2c1K659e0DjFs")}${result.saves.fromRabbitMirror}${__rmT("2RWUYk")}${result.saves.reasons.length ? `${__rmT("eis")}${result.saves.reasons.join(__rmT("jvk"))}${__rmT("eXs")}` : ''}${__rmT("jzk")}` : `${__rmT("KZb0yxRAwB3KsXIx03fEn6W3cUt._f")}${result.saves.fromRabbitMirror ? `${__rmT("NO4_h55FQYRMXmJcfjmdHT")}${result.saves.fromRabbitMirror}${__rmT("wHJ1EEtW0Q.HztgwTkD0HElG3dk")}` : ''}${__rmT("jzk")}`);
    lines.push(__rmT("uFhUu6_oK6GO.VW5L.8IKiXZD24mg6Uck.b5G1w4LHr9f8UacnUdwaUDUtPBQHA5oTxg5.yvS2YWAdUpprW.mF9UX2pJxxpvaXALRf"));
    return lines.join('\n');
}
function ownFolderFromUrl(url) {
    try {
        return decodeURIComponent(new URL(url).pathname).match(/\/scripts\/extensions\/third-party\/([^/?#]+)/)?.[1] || '';
    }
    catch {
        return '';
    }
}
export function mountLagCheck(block, { ownFolder = ownFolderFromUrl(import.meta.url) } = {}) {
    if (!block || block.__rabbitMirrorLagCheck)
        return;
    block.__rabbitMirrorLagCheck = true;
    const start = block.querySelector('#rh_lag_check_start');
    const copy = block.querySelector('#rh_lag_check_copy');
    const status = block.querySelector('#rh_lag_check_status');
    const output = block.querySelector('#rh_lag_check_result');
    let lastText = '';
    const support = lagCheckSupport();
    if (status && !support.total)
        status.textContent = __rmT("_u9Pp1RyA56wG.aiDaKBFERL3xvIFK0BbTw064OcGoyg5CQh0a8gR4pAxO9oriUvAEc1BRd55.Sz0AKPTYd1FsMGwQ6j3omkdG0MtsOUUpnDmgAbKMO_M33.exY2xNo9R2g9CRsfp6YtMD88i7l8RtC9Z6eKM8sgvP18C1ui36oLTSFOwz6UComO");
    else if (status && !support.perPlugin)
        status.textContent = __rmT("1Wc4EUb9YHmvbADTxgEF6rLGVg3P_1dplcQ3jsq.WRF4rOuWvQvZokQol2jObvkC");
    start?.addEventListener('click', async (event) => {
        event.preventDefault();
        if (lagCheckRunning()) {
            stopLagCheck();
            return;
        }
        start.textContent = __rmT("dNSnAGjWagA");
        if (copy)
            copy.hidden = true;
        if (output)
            output.textContent = '';
        globalThis.toastr?.info?.(__rmT("_aG_tV4oy5q7d6q0bD9rbKBiPfeFMr0W0RIG5ZR.zKNe1opRrXLhXtigNjDVajSnW5UrrwwA7yHjnJG3CgFPSry3HDzfffgr32OTKZJkWrro.k"));
        const result = await startLagCheck({ ownFolder, onTick: left => { if (status)
                status.textContent = `${__rmT("m6Fq0RpHhzskDCkt55pV84Cx")}${left}${__rmT("xBEnV.2M4oONrY.e__h68fhDWZz1qtJucY2UcbKq")}`; } });
        start.textContent = __rmT("WD9Yh.pHhzsrkUkwQ6FlEE.D");
        lastText = describeLagCheck(result);
        if (status)
            status.textContent = __rmT("Im8_aH.biBcStf");
        if (output)
            output.textContent = lastText;
        if (copy)
            copy.hidden = false;
        const own = result.owners.find(row => row.plugin && row.plugin === ownFolder);
        globalThis.toastr?.success?.(`${__rmT("bwzRcaruusEKbBFLqu5oH6cFieh.LNXlV.JoDf")}${ms(result.longMs)}${result.perPlugin ? `${__rmT("Df1i4O8eZTtallBq")}${ms(own?.ms || 0)}` : ''}${__rmT("s1w42iXcPE5PeTSl31cv0LZTPW6DtIHh3Povfs8RManhzxMkEW0qVFPix_I.2Ck4KX3f1uGP")}`, __rmT("9.JSSv1i"), { timeOut: 12000 });
    });
    copy?.addEventListener('click', async (event) => {
        event.preventDefault();
        try {
            await globalThis.navigator?.clipboard?.writeText?.(lastText);
            globalThis.toastr?.success?.(__rmT("2lXPhtUJkHwPpl4O4nQSiA4ubNs"));
        }
        catch {
            globalThis.toastr?.warning?.(__rmT("7y_s6Kdncyd59lXtEsC.yrmWwQVWvQa_CHmMqwKq"));
        }
    });
}
