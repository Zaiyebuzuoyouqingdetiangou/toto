import { rmT as __rmT } from "./textTable.js?rmv=2.6.0";
const MAX_ENTRIES = 1200;
const AUTO_STOP_MS = 20000;
const MAX_TEXT = 48;
let enabled = false;
let entries = [];
let startedAt = 0;
let autoStopTimer = 0;
let stoppedAt = 0;
let cleanup = [];
let clickSeq = 0;
let onStateChange = null;
const shortText = value => String(value ?? '').slice(0, MAX_TEXT);
const round2 = value => Math.round(Number(value || 0) * 100) / 100;
export function isTtSurfaceDiagnosticsActive() {
    return enabled;
}
export function ttSurfaceDiagnosticsHasReport() {
    return entries.length > 0;
}
export function recordTtSurface(kind, meta) {
    if (!enabled)
        return;
    const row = { t: round2(performance.now() - startedAt), kind: shortText(kind) };
    if (meta) {
        for (const key of Object.keys(meta)) {
            const value = meta[key];
            if (value === undefined || value === null)
                continue;
            if (typeof value === 'number')
                row[key] = Number.isFinite(value) ? round2(value) : 0;
            else if (typeof value === 'boolean')
                row[key] = value;
            else
                row[key] = shortText(value);
        }
    }
    entries.push(row);
    if (entries.length >= MAX_ENTRIES)
        stopTtSurfaceDiagnostics();
}
export function ttSurfaceNow() {
    return enabled ? performance.now() : 0;
}
export function nextTtSurfaceClickSeq() {
    if (!enabled)
        return 0;
    clickSeq += 1;
    return clickSeq;
}
export function registerTtSurfaceCleanup(dispose) {
    if (typeof dispose === 'function')
        cleanup.push(dispose);
}
export function startTtSurfaceDiagnostics(options = {}) {
    stopTtSurfaceDiagnostics();
    entries = [];
    clickSeq = 0;
    stoppedAt = 0;
    startedAt = performance.now();
    enabled = true;
    onStateChange = typeof options.onStateChange === 'function' ? options.onStateChange : null;
    autoStopTimer = setTimeout(() => { autoStopTimer = 0; stopTtSurfaceDiagnostics(); }, AUTO_STOP_MS);
    onStateChange?.(true);
    return true;
}
export function stopTtSurfaceDiagnostics() {
    if (autoStopTimer) {
        clearTimeout(autoStopTimer);
        autoStopTimer = 0;
    }
    if (!enabled) {
        cleanup = [];
        return false;
    }
    enabled = false;
    stoppedAt = performance.now();
    for (const dispose of cleanup) {
        try {
            dispose();
        }
        catch { }
    }
    cleanup = [];
    const notify = onStateChange;
    onStateChange = null;
    notify?.(false);
    return true;
}
function group(kinds) {
    const rows = new Map();
    for (const entry of entries) {
        if (!kinds.includes(entry.kind))
            continue;
        const key = entry.sub ? `${entry.sub}/${entry.kind2 || entry.kind}` : (entry.source || entry.what || entry.kind);
        const row = rows.get(key) || { key, n: 0, total: 0, max: 0, changed: 0 };
        row.n += 1;
        row.total += Number(entry.ms || 0);
        row.max = Math.max(row.max, Number(entry.ms || 0));
        if (entry.changed === true)
            row.changed += 1;
        rows.set(key, row);
    }
    return [...rows.values()].sort((a, b) => b.n - a.n);
}
export function buildTtSurfaceReport(context = {}) {
    const duration = ((stoppedAt || performance.now()) - startedAt) / 1000;
    const lines = [];
    lines.push(__rmT("Ny6XO3r96Fa9eWd.U5l91J1XkrUZc9WEMFMEcPQw7g_oEV1Sf3YOBuyoNCd6z1gHhO.omiqBXNmUFdYm"));
    lines.push(`${__rmT(".w1o.cc6")}${shortText(context.version || '')}${__rmT("4b6rjaFy8btHKEBq")}${duration.toFixed(1)}${__rmT("Vrcv1gmeAddCIn.CgPD")}${entries.length}${__rmT("2RdUjk")}`);
    lines.push(`managed=${context.managed === true} protocolVersion=${shortText(context.protocolVersion ?? '')} registered=${context.registered === true}`);
    lines.push(entries.length >= MAX_ENTRIES ? __rmT("WsNIHPsyEMbIfPmUKlFfscsPOX9hNpezG7R3Kw2BNNxt6f8AlPg_wB3yoFMPzhiFUuf") : '');
    lines.push('', __rmT("7zrQ8Hajl8vvfgBAuHuAj0XHGARIM7J9iwyeIdLGvMY8J9NGwjxGKrmX"));
    const schedules = group(['clearance-schedule']);
    lines.push(__rmT("4bMNjM01xEj5I1uu").padEnd(26) + __rmT("22JAjh"));
    for (const row of schedules)
        lines.push(`  ${row.key.padEnd(24)}${row.n}`);
    const measures = group(['clearance-measure']);
    for (const row of measures) {
        lines.push(`${__rmT("tMtZnXBBFM5fQiAAEdtut6PiXk.zVGN5x5voDf")}${row.n}${__rmT("N_wXhrqFHKG")}${row.total.toFixed(1)}${__rmT("zdAO1yteAdCYMYUSgPD")}${row.max.toFixed(2)}${__rmT("ft6QjaFyRF27RlBq")}${(row.total / Math.max(1, row.n)).toFixed(3)}ms`);
        lines.push(`${__rmT("v3gDfBwXoPh5wDQP2KKa4x5dOfYdlhv3SvpJBQ.oWi0zPTIy")}${row.changed} / ${row.n}`);
    }
    lines.push('', __rmT("XoJ9f_2XjghMwQIP2.Kj4T5dcTjoNZhgAYZqlatptifHm4VX"));
    const delivers = new Map();
    for (const entry of entries) {
        if (entry.kind !== 'deliver')
            continue;
        const key = `${entry.sub}/${entry.phase}`;
        const row = delivers.get(key) || { key, n: 0, total: 0, max: 0 };
        row.n += 1;
        row.total += Number(entry.ms || 0);
        row.max = Math.max(row.max, Number(entry.ms || 0));
        delivers.set(key, row);
    }
    lines.push(__rmT("fiXGAE8HbpzDsQmuEru55k").padEnd(44) + __rmT("xyzxzwnJTPibeTRCUNwaNCuqE3mkP_9hiQXO0DF1"));
    for (const row of [...delivers.values()].sort((a, b) => b.n - a.n)) {
        lines.push(`  ${row.key.padEnd(42)}${String(row.n).padEnd(7)}${row.total.toFixed(1).padEnd(7)}${row.max.toFixed(2)}`);
    }
    const leaseDispose = entries.filter(e => e.kind === 'lease-dispose').length;
    const leaseAbort = entries.filter(e => e.kind === 'lease-abort').length;
    lines.push(`  lease-dispose ${leaseDispose} | lease-abort ${leaseAbort}`);
    for (const row of group(['install'])) {
        lines.push(`  install ${row.key.padEnd(34)}${__rmT("qXSz.ec6")}${row.n}${__rmT("N_wXhrqFHKG")}${row.total.toFixed(1)}${__rmT("zdAO1yteAdCYMYUSgPD")}${row.max.toFixed(2)}ms`);
    }
    lines.push('', __rmT("_.mgACvSTJuaDYNszN6jUT"));
    lines.push(__rmT("H.vK4v9LjXYeGetlpMrIp3YO5.1wETYyihgna5D6Rva_VS0Qj2KNVIIht1i6KNUE6UTCQYmWKQeOXHF1GTbZdcdghGWs1b7bxa4NK1hfO8on7VrqTmNgGbYy8ik"));
    lines.push(__rmT("Ceh2WUqqh7EqxGNOsOTe5lf6HrJTIG5AE4CiuI4EOm0BK_Q2KFjXUFvNqcbRibxF5l3CSL8rfSbBK1Kz3.kykUSWZuWU2qwaRkxrfesN18ySzV0pwQEYtprkt.SwyBGxPhca7rmKGjxtb2nldTLaEWRXdPErmJ8QU_NTHBzCOjw7j8euwSlYWuaTfNWBGNvb1l8Ul7Y50QAGdAHGKjJfao950APPnZdVp3XT1Y9gpcZOS2azCQubpyJsm8A"));
    lines.push(__rmT("dxtNVlA6Wntge5wjl2dZUxTsZTJN7pOGayCMrWDCMpl.64C6St9nFKfSJZPUGjjJaoaXucPQIYCBc2TNiisB_GlNvLO6vHEol8ka4NnzzTi97gimhNfX0TF.vu6_TatnYWsdId6tHzSVDPOpzIchW1qomOUvwawC0uuXx6ek"));
    const inputKinds = ['pointerdown', 'pointerup', 'pointercancel', 'click', 'toggle', 'summary-activate',
        'tt-fast-toggle', 'tt-fast-control', 'tt-delayed-click-suppressed', 'fallback-toggle', 'intent-restore'];
    let inputCount = 0;
    for (const row of entries) {
        if (!row.seq && !inputKinds.includes(row.kind))
            continue;
        inputCount += 1;
        const extra = ['seq', 'pointerId', 'pointerType', 'detail', 'eventTime', 'phase', 'node', 'mesid',
            'faceIndex', 'targetKind', 'open', 'sameDetails', 'connected', 'defaultPrevented', 'suppressed', 'match', 'ms']
            .filter(key => row[key] !== undefined)
            .map(key => `${key}=${row[key]}`).join(',');
        lines.push(`  +${row.t.toFixed(0)}ms ${row.kind}${extra ? `(${extra})` : ''}`);
    }
    if (!inputCount)
        lines.push(__rmT("9TYPTLwahuDivsPT2N002TYMtLfXx7nY"));
    lines.push('', __rmT("J.62Ouy90Ey4zHnswaQZgREI.v_T0myuJbwxEuBJLy37nxyVwYc4yzBj5OPHz10HhO.pmibBPJK22_rU"));
    const writes = group(['layout-write']);
    if (!writes.length)
        lines.push(__rmT("9TYPTLwahuDivsPT2N002TYM1YLhx7nY"));
    for (const row of writes) {
        lines.push(`  ${row.key.padEnd(34)}${__rmT("qXSz.ec6")}${row.n}${__rmT("4JOaYQRkuVxbIc98EiRhw0WeSG4CJk")}${row.changed}`);
    }
    lines.push('', __rmT("09g0aosBtFCIcCmGM7.jnkq.29s"));
    for (const kind of ['tt-fast-toggle', 'tt-fast-control', 'tt-delayed-click-suppressed', 'fallback-toggle', 'intent-restore']) {
        lines.push(`  ${kind.padEnd(20)}${entries.filter(e => e.kind === kind).length}${__rmT("2RWUYk")}`);
    }
    return lines.filter(line => line !== undefined).join('\n');
}
export function __ttSurfaceTestHooks() {
    return { entries: () => entries.map(row => ({ ...row })), maxEntries: MAX_ENTRIES, autoStopMs: AUTO_STOP_MS };
}
