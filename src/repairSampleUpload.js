import { getSettings } from './settings.js?rmv=2.3.9';
import { RUNTIME_VERSION } from './outputSanitizer/runtime.js?rmv=2.3.9';
const runningVersion = () => RUNTIME_VERSION;
export const SAMPLE_RELAY_URL = 'https://samples.zaiyebuzuoyouqingdetiangou.com/';
const SENT_KEY = 'rabbit_mirror_repair_samples_sent:v1';
const STATUS_KEY = 'rabbit_mirror_repair_samples_upload_status:v1';
const MAX_SENT = 300;
const TIMEOUT_MS = 20000;
let running = null;
export function sampleUploadAvailable(url = SAMPLE_RELAY_URL) {
    return /^https:\/\/[^\s/]+\/?[^\s]*$/.test(String(url || ''));
}
export function sampleUploadEnabled(settings = getSettings(), url = SAMPLE_RELAY_URL) {
    return sampleUploadAvailable(url) && settings?.repairSampleUpload === true;
}
function readList(key) {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(key) || '[]');
        return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
    }
    catch {
        return [];
    }
}
export function sentSampleIds() { return new Set(readList(SENT_KEY)); }
function rememberSent(id) {
    const list = readList(SENT_KEY).filter(item => item !== id);
    list.push(id);
    try {
        globalThis.localStorage?.setItem(SENT_KEY, JSON.stringify(list.slice(-MAX_SENT)));
    }
    catch { }
}
export function readUploadStatus() {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(STATUS_KEY) || 'null');
        return value && typeof value === 'object' ? value : null;
    }
    catch {
        return null;
    }
}
function writeUploadStatus(status) {
    try {
        globalThis.localStorage?.setItem(STATUS_KEY, JSON.stringify(status));
    }
    catch { }
    try {
        globalThis.dispatchEvent?.(new CustomEvent('rabbitmirror:repair-samples-upload', { detail: status }));
    }
    catch { }
}
export function uploadPayload(entry) {
    return {
        id: String(entry?.id || ''), version: String(entry?.version || ''), trigger: String(entry?.trigger || 'patrol'),
        reason: String(entry?.reason || ''), controls: Array.isArray(entry?.controls) ? entry.controls.map(String) : [],
        dialect: entry?.dialect && typeof entry.dialect === 'object' ? entry.dialect : null,
        hits: Number(entry?.hits) || 1, at: Number(entry?.at) || Date.now(),
        source: String(entry?.source || ''), rendered: String(entry?.rendered || ''),
        sentVersion: String(runningVersion() || ''),
    };
}
async function postOne(entry, { fetchImpl, url }) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = setTimeout(() => { try {
        controller?.abort();
    }
    catch { } }, TIMEOUT_MS);
    try {
        const response = await fetchImpl(url, {
            method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(uploadPayload(entry)),
            ...(controller ? { signal: controller.signal } : {}),
        });
        let result = null;
        try {
            result = await response.json();
        }
        catch {
            result = null;
        }
        return response.ok && result?.ok === true;
    }
    finally {
        clearTimeout(timer);
    }
}
export function uploadPendingRepairSamples({ force = false, limit = 10, fetchImpl = globalThis.fetch?.bind(globalThis), url = SAMPLE_RELAY_URL, listSamples, removeSamples } = {}) {
    if (running)
        return running;
    if (!sampleUploadAvailable(url) || typeof fetchImpl !== 'function')
        return Promise.resolve({ sent: 0, pending: 0, skipped: 'unavailable' });
    if (!force && getSettings()?.repairSampleUpload !== true)
        return Promise.resolve({ sent: 0, pending: 0, skipped: 'off' });
    running = (async () => {
        const box = listSamples ? null : await import('./outputSanitizer/repairSamples.js?rmv=2.3.9');
        const list = listSamples ? await listSamples() : box.listRepairSamples();
        const delivered = [];
        const dropDelivered = () => { try {
            if (delivered.length)
                (removeSamples || box?.removeRepairSamples)?.(delivered);
        }
        catch { } };
        const sent = sentSampleIds();
        const pending = list.filter(entry => entry?.id && !sent.has(entry.id));
        let count = 0;
        for (const entry of pending.slice(0, Math.max(1, limit))) {
            let ok = false;
            try {
                ok = await postOne(entry, { fetchImpl, url });
            }
            catch {
                ok = false;
            }
            if (!ok) {
                const status = { at: Date.now(), ok: false, sent: count, pending: pending.length - count, total: sent.size + count };
                dropDelivered();
                writeUploadStatus(status);
                return status;
            }
            rememberSent(entry.id);
            delivered.push(entry.id);
            count += 1;
        }
        dropDelivered();
        const status = { at: Date.now(), ok: true, sent: count, pending: pending.length - count, total: sent.size + count };
        if (count || force)
            writeUploadStatus(status);
        return status;
    })().finally(() => { running = null; });
    return running;
}
let watching = false;
export function watchRepairSampleUploads() {
    if (watching)
        return;
    watching = true;
    let timer = 0;
    const later = (ms = 4000) => {
        clearTimeout(timer);
        timer = setTimeout(() => { if (sampleUploadEnabled())
            void uploadPendingRepairSamples(); }, ms);
    };
    try {
        globalThis.addEventListener?.('rabbitmirror:repair-samples', () => later());
    }
    catch { }
    later(20000);
}
