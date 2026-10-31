import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=2.3.6";
import { hashText } from '../independentApi/runtime.js?rmv=2.3.6';
import { RUNTIME_VERSION } from './runtime.js?rmv=2.3.6';
import { maskFaceText } from './writingSkeleton.js?rmv=2.3.6';
import { inspectBehaviorDialect } from './behaviorDialect.js?rmv=2.3.6';
export const REPAIR_SAMPLES_KEY = 'rabbit_mirror_repair_samples:v1';
export const REPAIR_SAMPLES_EVENT = 'rabbitmirror:repair-samples';
const MAX_ENTRIES = 40;
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_SKELETON_CHARS = 120000;
const PLUGIN_PLACEHOLDER = /rabbit-mirror-external-placeholder|rabbit-mirror-external-error-actions/;
function read() {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(REPAIR_SAMPLES_KEY) || 'null');
        if (!value || typeof value !== 'object' || !Array.isArray(value.entries))
            return { version: 1, entries: [] };
        return { ...value, entries: value.entries.filter(entry => !PLUGIN_PLACEHOLDER.test(String(entry?.rendered || ''))) };
    }
    catch {
        return { version: 1, entries: [] };
    }
}
function write(box) {
    const trimmed = { version: 1, entries: [...box.entries] };
    trimmed.entries.sort((a, b) => Number(b.at || 0) - Number(a.at || 0));
    trimmed.entries = trimmed.entries.slice(0, MAX_ENTRIES);
    let text = JSON.stringify(trimmed);
    while (text.length * 2 > MAX_BYTES && trimmed.entries.length > 1) {
        trimmed.entries.pop();
        text = JSON.stringify(trimmed);
    }
    try {
        globalThis.localStorage?.setItem(REPAIR_SAMPLES_KEY, text);
    }
    catch {
        return false;
    }
    try {
        globalThis.dispatchEvent?.(new CustomEvent(REPAIR_SAMPLES_EVENT, { detail: { count: trimmed.entries.length } }));
    }
    catch { }
    return true;
}
export function listRepairSamples() { return read().entries.slice().sort((a, b) => Number(b.at || 0) - Number(a.at || 0)); }
export function countRepairSamples() { return read().entries.length; }
export function removeRepairSamples(ids) {
    const drop = new Set((Array.isArray(ids) ? ids : [...(ids || [])]).map(String));
    if (!drop.size)
        return 0;
    const box = read();
    const kept = box.entries.filter(entry => !drop.has(String(entry?.id || '')));
    const removed = box.entries.length - kept.length;
    if (!removed)
        return 0;
    if (!kept.length) {
        clearRepairSamples();
        return removed;
    }
    return write({ ...box, entries: kept }) ? removed : 0;
}
export function clearRepairSamples() { try {
    globalThis.localStorage?.removeItem(REPAIR_SAMPLES_KEY);
}
catch { } try {
    globalThis.dispatchEvent?.(new CustomEvent(REPAIR_SAMPLES_EVENT, { detail: { count: 0 } }));
}
catch { } }
export function recordRepairSample(root, { trigger = 'patrol', reason = '', controls = [], skeleton = null } = {}) {
    if (!skeleton || (!skeleton.source && !skeleton.rendered))
        return null;
    if (PLUGIN_PLACEHOLDER.test(String(skeleton.rendered || '')))
        return null;
    const source = String(skeleton.source || '').slice(0, MAX_SKELETON_CHARS);
    const rendered = String(skeleton.rendered || '').slice(0, MAX_SKELETON_CHARS);
    const id = hashText(`${source}\u0000${rendered}`);
    const PLAIN = /^!?[\w.-]{1,24}$/;
    let dialect = null;
    try {
        const inspected = root ? inspectBehaviorDialect(root) : null;
        if (inspected)
            dialect = { declared: !!inspected.declared, dialects: inspected.dialects || [],
                unmatched: (inspected.unmatched || []).map(item => `${String(item?.type || '')}:${PLAIN.test(String(item?.token || '')) ? item.token : maskFaceText(item?.token)}`) };
    }
    catch {
        dialect = null;
    }
    const box = read();
    const existing = box.entries.find(entry => entry.id === id);
    const rawControls = (Array.isArray(controls) ? controls : []).map(name => String(name || '')).filter(Boolean);
    const maskedControls = rawControls.map(name => maskFaceText(name)).slice(0, 12);
    let maskedReason = String(reason || '');
    for (const name of [...rawControls].sort((a, b) => b.length - a.length))
        maskedReason = maskedReason.split(name).join(maskFaceText(name));
    maskedReason = maskedReason.replace(__rmR("NcAQ1QqemcUQ0Cf6k8D", "g"), match => __rmR("T.enM52FkWIMkhDwtgFOh0Ax", "").test(match) ? match : `${__rmT("YSk")}${maskFaceText(match.slice(1, -1))}${__rmT("Yvk")}`).slice(0, 400);
    const entry = {
        id, at: Date.now(), version: RUNTIME_VERSION, trigger,
        reason: maskedReason,
        controls: maskedControls, dialect, source, rendered,
        hits: (existing?.hits || 0) + 1, firstAt: existing?.firstAt || Date.now(),
    };
    box.entries = [entry, ...box.entries.filter(item => item.id !== id)];
    return write(box) ? entry : null;
}
function stamp(ts) { const n = Number(ts || 0); return n > 0 ? new Date(n).toISOString().replace('T', ' ').slice(0, 19) : '-'; }
export function buildRepairSamplesExport() {
    const entries = listRepairSamples();
    const head = [
        `${__rmT("vDfth4AqYzmDneV1yKW3vnCx")}${RUNTIME_VERSION} ${new Date().toISOString()}${__rmT("qGy4hec6")}${entries.length}${__rmT("2RddPk")}`,
        __rmT("Yw7dlOPEZo7o92FWqQHjYMZj4uvGWKBhe2F2zWjN531A.eroWEG.Ifj3JoVmUC0Q_pJ9g_Sp0xKgwotWlH9CutqpUDl"),
        '',
    ];
    const body = entries.map((entry, index) => [
        `${__rmT("XwQYmzL1HxNWJue0I4iAuatDLyBqDsgJVkEUpbTZH8x5eRpaawHVgkhfcg86ehDY")}${index + 1} / ${entries.length} ====================`,
        `${__rmT("MtTVhAI6")}${entry.id}${__rmT("N_EGFNDli.G")}${stamp(entry.at)}${__rmT("N_iLsWPXi.G")}${entry.version}${__rmT("N_E8zBbJi.G")}${{ interaction: __rmT("U30f1C7KOpr6tQJLTw_Pbz5Dt2XF_f"), auto: __rmT("BBZ0C8QYUdL7XMwMcpf7YsldQjhDx8Uc") }[entry.trigger] || __rmT("bsX3ZeV4JJL368A41OEf971.Msp")}${__rmT("N_wmMv2si.G")}${entry.hits}`,
        `${__rmT("gbcDLaop")}${entry.reason || '-'}`,
        entry.controls?.length ? `${__rmT("xhrbncog3OX56uOcVpA")}${entry.controls.join(__rmT("jvk"))}` : '',
        entry.dialect ? `${__rmT("7X2vLdop")}${entry.dialect.declared ? (entry.dialect.dialects.join(',') || __rmT("n9lBA_mDYPB")) : __rmT("0QJ5yQT.83htl0R2")}${entry.dialect.unmatched?.length ? `${__rmT("PDP.4OHJxuQStf")}${entry.dialect.unmatched.map(String).join(__rmT("jvk"))}` : ''}` : '',
        '',
        __rmT("trqz_Sz2sxrsVRO_Y6D"),
        entry.source || __rmT("KWTZ.jZp"), '',
        __rmT("yosLSZCAZ6OoVxO4lQo2HT"),
        entry.rendered || __rmT("KWTZ.jZp"), '',
    ].filter(line => line !== '').join('\n'));
    return [...head, ...body].join('\n');
}
