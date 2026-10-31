import { rmT as __rmT } from "./textTable.js?rmv=2.3.4";
import { getContext } from './independentApi/runtime.js?rmv=2.3.4';
import { buildSingleImagePrompt } from './imagePromptPayload.js?rmv=2.3.4';
const SUPPORTED_MODES = new Set(['sd', 'novelai', 'comfyui', 'banana', 'runninghub']);
function failure(code, message, extra = {}) {
    const error = new Error(message);
    error.code = code;
    Object.assign(error, extra);
    return error;
}
export function chatu8Status() {
    const ctx = getContext();
    const settings = ctx?.extensionSettings?.['st-chatu8'];
    const events = ctx?.eventSource;
    if (!settings)
        return { configured: false, reason: __rmT("2ct8Jqn.mbqgP4.v3Jm4FPv12.FoMehDJ2W5KLZNoL8hx3onPNUHM61uyM9AMWoHtvtReCI6Y3Y") };
    if (!(settings.scriptEnabled === true || settings.scriptEnabled === 'true'))
        return { configured: false, reason: __rmT("gW_fWV1yso4YQm7htilnG2ES6O7Q08WYy9GsUcbJibHSZE0qPZApzq5X") };
    const mode = String(settings.mode || '').trim().toLowerCase();
    if (mode && !SUPPORTED_MODES.has(mode))
        return { configured: false, reason: `${__rmT("rDUfPD46JGWkDHr5SNmyLk")}${mode}${__rmT("Qkp8yYlkytyjkyf1")}` };
    if (typeof events?.on !== 'function' || typeof events?.emit !== 'function')
        return { configured: false, reason: __rmT("iARiaraTMb2qqxD8VF1PjVrn9bHB4QxW2l.qY4dS8lhYKSQX") };
    return { configured: true, mode: mode || __rmT("Up3hEk") };
}
function requestId() {
    let random = Math.random().toString(36).slice(2, 10);
    try {
        random = globalThis.crypto.randomUUID().slice(0, 12);
    }
    catch { }
    return `rabbit-mirror-${Date.now().toString(36)}-${random}`;
}
const CHATU8_WAIT_MS = 15 * 60 * 1000;
function waitForChatu8Image({ prompt, width, height, signal }) {
    const ctx = getContext();
    const events = ctx.eventSource;
    const id = requestId();
    return new Promise((resolve, reject) => {
        let done = false;
        let timer = null;
        const cleanup = () => {
            done = true;
            if (timer)
                clearTimeout(timer);
            try {
                (events.removeListener || events.off)?.call(events, 'generate-image-response', onResponse);
            }
            catch { }
            signal?.removeEventListener?.('abort', onAbort);
        };
        timer = setTimeout(() => { if (done)
            return; cleanup(); reject(failure('provider_error', __rmT("TjfBV1Z8pDM0RvSRnI7yscrjB5zLYp9vF7tNaGH1iXBb5muum0oqDg3o7ok9uT"))); }, CHATU8_WAIT_MS);
        const onResponse = data => {
            if (done || !data || data.id !== id)
                return;
            cleanup();
            if (data.cancelled) {
                reject(failure('aborted', __rmT("sLtnw8Kf31GivxPrDqY3iyl641U4aOs2")));
                return;
            }
            if (!data.success) {
                reject(failure('invalid_result', `${__rmT("Ft7XHvRIT9Z36xpeX43GZw5Oh_C")}${data.error ? `${__rmT("7ys")}${String(data.error)}` : ''}${__rmT("OLaPUKejSYCsa9_xvnFrnH6ZbNs")}`));
                return;
            }
            if (data.isVideo) {
                reject(failure('invalid_result', __rmT("LFRvT_Y01FRGfYidYzcM3VDrsHmxRikcQF3ydkP9sW82UIUbq8_")));
                return;
            }
            const image = String(data.imageData || '');
            if (!image) {
                reject(failure('invalid_result', __rmT("LFRvT_Y0NWzm_I.bG7cz98nEFuXGJNGOCBlldZgBFjkZZ7xIq8_")));
                return;
            }
            resolve(image);
        };
        const onAbort = () => { if (done)
            return; cleanup(); reject(failure('aborted', __rmT("lG.pz2TnT_Yo4if1"))); };
        if (signal?.aborted) {
            onAbort();
            return;
        }
        signal?.addEventListener?.('abort', onAbort, { once: true });
        events.on('generate-image-response', onResponse);
        const request = { id, prompt };
        if (Number(width) > 0 && Number(height) > 0) {
            request.width = Number(width);
            request.height = Number(height);
        }
        try {
            events.emit('generate-image-request', request);
        }
        catch (error) {
            cleanup();
            reject(failure('provider_error', `${__rmT("0_ZPArK5wHU.4EJdK_ubn0W8_DPocT")}${String(error?.message || error)}`));
        }
    });
}
async function blobUrlToDataUrl(url) {
    const blob = await (await fetch(url)).blob();
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}
function isForeignImageUrl(image) {
    try {
        const url = new URL(image, document.baseURI);
        if (!['http:', 'https:'].includes(url.protocol))
            return false;
        const here = new URL(document.baseURI);
        return url.origin !== here.origin;
    }
    catch {
        return false;
    }
}
export async function persistImage(image, { label = __rmT("OyY9PHpS") } = {}) {
    if (/^blob:/i.test(image)) {
        try {
            image = await blobUrlToDataUrl(image);
        }
        catch (error) {
            console.warn(`[RabbitMirror] ${label}${__rmT("XzoDIdVWbe5uIFSXNsPoGX5DuGJOnT")}`, error);
            return { path: null, dataUrl: '', saveFailed: true };
        }
    }
    let foreignUrl = '';
    if (isForeignImageUrl(image)) {
        foreignUrl = image;
        try {
            image = await blobUrlToDataUrl(image);
        }
        catch (error) {
            console.warn(`[RabbitMirror] ${label}${__rmT("pZS5hBwDWJWQkGUIR6erEKOWUv0ueDNGfVPIdI4YxHMZuHnAIarmWJ7PsmI8Ty5kmmbGgIdMUc67G3E8w039evfwOFfXzh")}`, error);
            try {
                globalThis.toastr?.warning?.(`${label}${__rmT("QrnFqRI2RRsdd1RWuHLeRr95OyUWQgRpYMA4kcbvWr4GoDSasrpOBJqmQmUjYtU231tVr1mYaOmN8nS8qAk")}`, __rmT("9.JSSv1i"));
            }
            catch { }
            return { path: image, dataUrl: '', remote: true };
        }
    }
    const match = /^data:image\/([a-z0-9.+-]+);base64,(.+)$/i.exec(image);
    if (!match) {
        try {
            const url = new URL(image, document.baseURI);
            if (['http:', 'https:'].includes(url.protocol))
                return { path: `${url.pathname}${url.search}`, dataUrl: '' };
        }
        catch { }
        return { path: image, dataUrl: '' };
    }
    const format = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    const ctx = getContext();
    const headers = typeof ctx?.getRequestHeaders === 'function' ? ctx.getRequestHeaders() : { 'Content-Type': 'application/json' };
    try {
        const response = await fetch('/api/images/upload', {
            method: 'POST',
            headers,
            body: JSON.stringify({ image: match[2], format, ch_name: __rmT("9.JSSv1i") }),
        });
        if (!response.ok)
            throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!result?.path)
            throw new Error(__rmT("T8yI.2h.H8I5QwoPNjczXk"));
        return { path: String(result.path), dataUrl: '' };
    }
    catch (error) {
        try {
            globalThis.toastr?.warning?.(`${label}${__rmT("RNXdhStvFAXLci8ExaqyVBy1t2A6o.H1lwnIWiVRuRHFIUxnMNMjbKLf6HhmuSkC")}`, __rmT("9.JSSv1i"));
        }
        catch { }
        console.warn(`[RabbitMirror] ${label}${__rmT("AM0KgulInsaWyEyM")}`, error);
        return { path: foreignUrl || null, dataUrl: image, saveFailed: true };
    }
}
function plainCharacters(list) {
    return (Array.isArray(list) ? list : []).filter(person => person && typeof person === 'object')
        .map(person => ({ name: String(person.name || ''), tag: String(person.tag || ''), nl: String(person.nl || '') }));
}
export function draftFromSavedImage(record) {
    if (!record || typeof record !== 'object')
        return null;
    const meta = record.promptMetadata && typeof record.promptMetadata === 'object' ? record.promptMetadata : {};
    const sent = String(record.prompt || '').trim();
    const prompt = String(meta.prompt || ''), nl = String(meta.nl || ''), flatPrompt = String(meta.flatPrompt || '');
    const promptFormat = meta.promptFormat === 'nai45-tags' ? 'nai45-tags' : meta.promptFormat ? 'nai5-natural' : undefined;
    const format = promptFormat ? { promptFormat } : {};
    if (Array.isArray(meta.characters)) {
        if (!(prompt.trim() || nl.trim() || flatPrompt.trim() || sent))
            return null;
        return { prompt: prompt || (flatPrompt.trim() || nl.trim() ? '' : sent), nl, flatPrompt, characters: plainCharacters(meta.characters), ...format };
    }
    if (!sent)
        return prompt.trim() || nl.trim() || flatPrompt.trim() ? { prompt, nl, flatPrompt, characters: [], ...format } : null;
    return { prompt: prompt || sent, nl, flatPrompt: sent, characters: [], ...format };
}
export async function generateViaChatu8(plan, { signal, size, assertCurrent } = {}) {
    const status = chatu8Status();
    if (!status.configured)
        throw failure('not_configured', status.reason);
    const prompt = buildSingleImagePrompt(plan);
    if (!prompt)
        throw failure('invalid_args', __rmT("_9PW67Dt9BEjosNqPvSrOk8eFuKZ6JB7MGav9LDB31FOHYRRq8_"));
    if (signal?.aborted)
        throw failure('aborted', __rmT("lG.pz2TnT_Yo4if1"));
    if (typeof assertCurrent === 'function' && assertCurrent() === false)
        throw failure('stale_owner', __rmT("GcgIrtz_fvATJTlacN1_jrXc9b9Z4HOBEKnR7PaZ55aMTvQX"));
    const dimensions = size === 'portrait' ? { width: 832, height: 1216 } : size === 'landscape' ? { width: 1216, height: 832 } : {};
    const image = await waitForChatu8Image({ prompt, signal, ...dimensions });
    const stored = await persistImage(image);
    return {
        url: stored.path || stored.dataUrl, path: stored.path, dataUrl: stored.dataUrl, prompt, provider: 'st-chatu8',
        generatedAt: new Date().toISOString(),
        promptMetadata: { prompt: String(plan?.prompt || ''), nl: String(plan?.nl || ''), flatPrompt: String(plan?.flatPrompt || ''),
            characters: plainCharacters(plan?.characters),
            promptFormat: plan?.promptFormat === 'nai45-tags' ? 'nai45-tags' : 'nai5-natural', backend: `st-chatu8:${status.mode}`, size, saveFailed: stored.saveFailed === true },
    };
}
