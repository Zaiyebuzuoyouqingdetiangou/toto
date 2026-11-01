import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.9.1";
import { getSettings, updateSettings } from './settings.js?rmv=2.9.1';
import { RUNTIME_VERSION } from './outputSanitizer/runtime.js?rmv=2.9.1';
const runningVersion = () => RUNTIME_VERSION;
export const SAMPLE_RELAY_URL = 'https://samples.zaiyebuzuoyouqingdetiangou.com/';
const SENT_KEY = 'rabbit_mirror_repair_samples_sent:v1';
const REJECTED_KEY = 'rabbit_mirror_repair_samples_rejected:v1';
const STATUS_KEY = 'rabbit_mirror_repair_samples_upload_status:v1';
const OFF_KEY = 'rabbit_mirror_repair_samples_upload_off:v1';
const ASKED_KEY = 'rabbit_mirror_repair_samples_upload_asked:v1';
const MAX_SENT = 300;
const TIMEOUT_MS = 20000;
let running = null;
export function sampleUploadAvailable(url = SAMPLE_RELAY_URL) {
    return /^https:\/\/[^\s/]+\/?[^\s]*$/.test(String(url || ''));
}
function turnedOffElsewhere(settings) {
    let offAt = 0;
    try {
        offAt = Number(globalThis.localStorage?.getItem(OFF_KEY) || 0);
    }
    catch {
        offAt = 0;
    }
    return offAt > 0 && offAt >= (Number(settings?.repairSampleUploadSince) || 0);
}
export function sampleUploadEnabled(settings = getSettings(), url = SAMPLE_RELAY_URL) {
    return sampleUploadAvailable(url) && settings?.repairSampleUpload === true && !turnedOffElsewhere(settings);
}
export function sampleUploadSwitchPatch(enabled) {
    const now = Date.now();
    try {
        if (enabled)
            globalThis.localStorage?.removeItem(OFF_KEY);
        else
            globalThis.localStorage?.setItem(OFF_KEY, String(now));
    }
    catch { }
    return { repairSampleUpload: enabled === true, repairSampleUploadSince: enabled ? now : 0 };
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
function remember(key, id) {
    const list = readList(key).filter(item => item !== id);
    list.push(id);
    try {
        globalThis.localStorage?.setItem(key, JSON.stringify(list.slice(-MAX_SENT)));
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
export function uploadIdOf(entry) {
    const id = String(entry?.id || '').replace(/[^a-z0-9]/gi, '').slice(0, 40);
    const version = String(entry?.version || '').replace(/[^0-9.]/g, '').replace(/\./g, '_').slice(0, 20) || '0';
    return id ? `${id}-v${version}` : '';
}
const PLUGIN_STYLE_NOTE = __rmT("lJtBnMEBYlK1NtisfxL_eKzxctf1B8bBWed7Df");
export function skeletonLooksClean(text) {
    return !__rmR("wGib280JdPiteThpcNwuNOFqH.XrPua_Zl29PJI1", "").test(String(text || '').split(PLUGIN_STYLE_NOTE).join(''));
}
export function uploadPayload(entry, resanitize = null) {
    const clean = value => {
        const text = String(value || '');
        if (!text || typeof resanitize !== 'function')
            return text;
        try {
            return String(resanitize(text) || '');
        }
        catch {
            return '';
        }
    };
    return {
        id: uploadIdOf(entry), version: String(entry?.version || ''), trigger: String(entry?.trigger || 'patrol'),
        reason: String(entry?.reason || ''), controls: Array.isArray(entry?.controls) ? entry.controls.map(String) : [],
        dialect: entry?.dialect && typeof entry.dialect === 'object' ? entry.dialect : null,
        hits: Number(entry?.hits) || 1, at: Number(entry?.at) || Date.now(),
        source: clean(entry?.source), rendered: clean(entry?.rendered),
        sentVersion: String(runningVersion() || ''),
    };
}
async function postOne(payload, { fetchImpl, url }) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = setTimeout(() => { try {
        controller?.abort();
    }
    catch { } }, TIMEOUT_MS);
    try {
        const response = await fetchImpl(url, {
            method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            ...(controller ? { signal: controller.signal } : {}),
        });
        let result = null;
        try {
            result = await response.json();
        }
        catch {
            result = null;
        }
        if (response.ok && result?.ok === true)
            return 'sent';
        if ([400, 413, 415, 422].includes(Number(response.status)))
            return 'rejected';
        return 'retry';
    }
    finally {
        clearTimeout(timer);
    }
}
export function uploadPendingRepairSamples({ force = false, limit = 10, fetchImpl = globalThis.fetch?.bind(globalThis), url = SAMPLE_RELAY_URL, listSamples, removeSamples, resanitize } = {}) {
    if (running)
        return running;
    if (!sampleUploadAvailable(url) || typeof fetchImpl !== 'function')
        return Promise.resolve({ sent: 0, pending: 0, skipped: 'unavailable' });
    if (!force && !sampleUploadEnabled(getSettings(), url))
        return Promise.resolve({ sent: 0, pending: 0, skipped: 'off' });
    running = (async () => {
        const box = listSamples && removeSamples ? null : await import('./outputSanitizer/repairSamples.js?rmv=2.9.1');
        const list = listSamples ? await listSamples() : box.listRepairSamples();
        let reclean = resanitize;
        if (typeof reclean !== 'function') {
            try {
                reclean = (await import('./outputSanitizer/writingSkeleton.js?rmv=2.9.1')).skeletonizeRabbitMirrorHtml;
            }
            catch {
                reclean = null;
            }
        }
        if (typeof reclean !== 'function')
            return { sent: 0, pending: 0, skipped: 'no-sanitizer' };
        const drop = ids => { try {
            if (ids.length)
                (removeSamples || box?.removeRepairSamples)?.(ids);
        }
        catch { } };
        const sent = sentSampleIds();
        const rejected = new Set(readList(REJECTED_KEY));
        const legacyVersion = value => { const [a = 0, b = 0, c = 0] = String(value || '').split('.').map(part => parseInt(part, 10) || 0); return a < 2 || (a === 2 && (b < 5 || (b === 5 && c < 2))); };
        const alreadySent = entry => sent.has(uploadIdOf(entry)) || (sent.has(String(entry.id)) && legacyVersion(entry.version));
        drop(list.filter(entry => entry?.id && alreadySent(entry)).map(entry => entry.id));
        const since = Number(getSettings()?.repairSampleUploadSince) || 0;
        const pending = list.filter(entry => entry?.id && !alreadySent(entry) && !rejected.has(uploadIdOf(entry))
            && (force || !since || Number(entry.at || 0) >= since));
        const delivered = [];
        let count = 0, skippedCount = 0, stopped = false;
        for (const entry of pending.slice(0, Math.max(1, limit))) {
            if (!force && !sampleUploadEnabled(getSettings(), url)) {
                stopped = true;
                break;
            }
            const payload = uploadPayload(entry, reclean);
            const uploadId = payload.id;
            if (!uploadId || (!payload.source && !payload.rendered) || !skeletonLooksClean(payload.source) || !skeletonLooksClean(payload.rendered)) {
                remember(REJECTED_KEY, uploadId || String(entry.id));
                skippedCount += 1;
                continue;
            }
            let outcome = 'retry';
            try {
                outcome = await postOne(payload, { fetchImpl, url });
            }
            catch {
                outcome = 'retry';
            }
            if (outcome === 'rejected') {
                remember(REJECTED_KEY, uploadId);
                skippedCount += 1;
                continue;
            }
            if (outcome !== 'sent') {
                const status = { at: Date.now(), ok: false, sent: count, pending: pending.length - count - skippedCount, total: sent.size + count };
                drop(delivered);
                writeUploadStatus(status);
                return status;
            }
            remember(SENT_KEY, uploadId);
            delivered.push(entry.id);
            count += 1;
        }
        drop(delivered);
        const status = { at: Date.now(), ok: true, sent: count, pending: Math.max(0, pending.length - count - skippedCount), total: sent.size + count, ...(skippedCount ? { skipped: skippedCount } : {}), ...(stopped ? { stopped: true } : {}) };
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
        globalThis.addEventListener?.('rabbitmirror:repair-samples', event => {
            if (sampleUploadEnabled()) {
                later();
                return;
            }
            if (Number(event?.detail?.count) > 0)
                askToUploadOnce();
        });
    }
    catch { }
    later(20000);
}
export function sampleUploadAskPending(settings = getSettings()) {
    if (!sampleUploadAvailable() || settings?.repairSampleUpload === true)
        return false;
    try {
        const storage = globalThis.localStorage;
        if (storage?.getItem(ASKED_KEY) || storage?.getItem(OFF_KEY))
            return false;
    }
    catch {
        return false;
    }
    return true;
}
const ASK_ID = 'rabbit-mirror-sample-upload-ask';
export function askToUploadOnce(doc = globalThis.document) {
    if (!doc?.body || !sampleUploadAskPending() || doc.getElementById(ASK_ID))
        return null;
    const card = doc.createElement('div');
    card.id = ASK_ID;
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', __rmT("zGTr0XJkQFoJmT6BMCiNeXf6jL9uaxSP"));
    card.style.cssText = [
        'position:fixed', 'left:50%', 'transform:translateX(-50%)', 'bottom:calc(env(safe-area-inset-bottom, 0px) + 96px)',
        'z-index:2147483000', 'box-sizing:border-box', 'width:min(420px, calc(100vw - 24px))', 'max-height:calc(100vh - 140px)', 'overflow:auto',
        'padding:14px 16px', 'border-radius:14px', 'border:1px solid var(--SmartThemeBorderColor, #cfd6de)',
        'background:var(--SmartThemeBlurTintColor, #fff)', 'color:var(--SmartThemeBodyColor, #222)',
        'box-shadow:0 8px 28px rgba(0,0,0,.22)', 'font-size:14px', 'line-height:1.6', 'backdrop-filter:blur(8px)',
    ].join(';');
    const title = doc.createElement('div');
    title.style.cssText = 'font-weight:700;margin-bottom:6px;';
    title.textContent = __rmT("ckPwW_2XMsNssMYM9UftfbXGHYwNm93pwT9wNEov2yoGK152");
    const text = doc.createElement('div');
    text.textContent = __rmT("RPqf2RX2lOCnKvo.a721flxbP4ed8D9P3WSO1vPIsovLI2ycPO8z9zTWXewGBdJLpewlHHa95qkR8jrz29gEyw6K6D3NGkiN3KQbBijEyE8PRQUkYZEFqZhRiyQSaGIhXHjv5cXUitGcsMV8evrffiz48mIy66Jp6.GJUMuPERZzNkHwBtWojD26ADzxKJjC_RgJy32xqvD.g._SWjNc4ord1DRmQueWYq5FVEOX");
    const row = doc.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:10px;';
    const button = (label, primary) => {
        const node = doc.createElement('button');
        node.type = 'button';
        node.className = 'menu_button';
        node.textContent = label;
        node.style.cssText = `margin:0;padding:6px 14px;min-height:36px;${primary ? 'font-weight:700;' : ''}`;
        return node;
    };
    const no = button(__rmT("ssqNHbEc"), false);
    const yes = button(__rmT("dQh1mhPLhUG"), true);
    const close = () => card.remove();
    const remember = () => { try {
        globalThis.localStorage?.setItem(ASKED_KEY, String(Date.now()));
    }
    catch { } };
    no.addEventListener('click', () => { remember(); close(); });
    yes.addEventListener('click', () => {
        remember();
        close();
        updateSettings(sampleUploadSwitchPatch(true));
        try {
            const box = doc.getElementById('rh_repair_upload');
            if (box)
                box.checked = true;
        }
        catch { }
        void uploadPendingRepairSamples({ force: true }).then(result => {
            if (result?.ok === false)
                globalThis.toastr?.warning?.(__rmT("4AovcJxb1KgDfVK4Zu4ncGmBXkeJEgRpbqMOzn_ixhMIEd6QDutebp4BE7RYZS9Nj3lqEL6ektKNm.cOqAk"));
            else
                globalThis.toastr?.success?.(__rmT("oe0pw5IPPNPUDY0V41zqG4djHH0WrI5Y"));
        }).catch(() => { });
    });
    row.append(no, yes);
    card.append(title, text, row);
    doc.body.append(card);
    return card;
}
