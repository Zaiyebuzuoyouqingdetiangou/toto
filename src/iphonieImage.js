import { rmT as __rmT } from "./textTable.js?rmv=2.9.1";
import { buildSingleImagePrompt } from './imagePromptPayload.js?rmv=2.9.1';
import { persistImage } from './chatu8Image.js?rmv=2.9.1';
function failure(code, message, extra = {}) {
    return Object.assign(new Error(message), { code }, extra);
}
function phoneApi() {
    const api = globalThis.stIphonie;
    if (!api)
        return null;
    if (!(Number(api.apiVersion) >= 1) || typeof api.draw !== 'function' || typeof api.drawStatus !== 'function')
        return null;
    return api;
}
export function iphonieStatus() {
    const api = phoneApi();
    if (!globalThis.stIphonie)
        return { configured: false, reason: __rmT("3cXLESG83idbojD1UfM0RjAd77JOScJ9frHlHxKrMvZNDc2l8KaBipOwLyGIF2b9SmEmIfk5dwEobh") };
    if (!api)
        return { configured: false, reason: __rmT("Dhohox6wRtGnaNjxklZ5TqQwYCuqT7L97NliMpwz1jMJnCfFP5vjyfkMMX6AZ4yuUky1VdmSzvOr4Ad.vsdBwKJMkfdP71_gANA") };
    let status = null;
    try {
        status = api.drawStatus();
    }
    catch (error) {
        return { configured: false, reason: `${__rmT("_D8r0cR2G9UpT.PTLeeinEEXyHXPMTbY")}${String(error?.message || error)}` };
    }
    if (!status?.ready)
        return { configured: false, reason: String(status?.missing || __rmT("FGM0DKvudsMJThsKTUzUBs3.aVvTUUxYbz4pYBLbWZgxYzQX")) };
    return { configured: true, engine: String(status.engine || ''), style: String(status.style || ''), free: status.free };
}
function characterNames(plan) {
    const names = [];
    for (const person of Array.isArray(plan?.characters) ? plan.characters : []) {
        const name = String(person?.name || '').trim();
        if (name && !names.includes(name))
            names.push(name);
    }
    return names.slice(0, 8);
}
const clean = value => typeof value === 'string' ? value.trim() : '';
export function phoneScenePrompt(plan = {}) {
    const tags = clean(plan?.prompt), nl = clean(plan?.nl);
    const scene = plan?.promptFormat === 'nai45-tags' ? tags || nl : [...new Set([tags, nl].filter(Boolean))].join('\n');
    return scene || buildSingleImagePrompt({ ...plan, characters: [] });
}
function plainCharacters(list) {
    return (Array.isArray(list) ? list : []).filter(person => person && typeof person === 'object')
        .map(person => ({ name: String(person.name || ''), tag: String(person.tag || ''), nl: String(person.nl || '') }));
}
async function blobToDataUrl(blob) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}
function sitePath(url) {
    const text = String(url || '');
    if (!text)
        return '';
    try {
        const parsed = new URL(text, document.baseURI);
        if (parsed.origin === new URL(document.baseURI).origin)
            return `${parsed.pathname}${parsed.search}`;
    }
    catch { }
    return text;
}
export async function generateViaIphonie(plan, { signal, size, assertCurrent, onProgress } = {}) {
    const status = iphonieStatus();
    if (!status.configured)
        throw failure('not_configured', status.reason);
    const api = phoneApi();
    const prompt = phoneScenePrompt(plan);
    if (!prompt)
        throw failure('invalid_args', __rmT("_9PW67Dt9BEjosNqPvSrOk8eFuKZ6JB7MGav9LDB31FOHYRRq8_"));
    if (signal?.aborted)
        throw failure('aborted', __rmT("lG.pz2TnT_Yo4if1"));
    if (typeof assertCurrent === 'function' && assertCurrent() === false)
        throw failure('stale_owner', __rmT("GcgIrtz_fvATJTlacN1_jrXc9b9Z4HOBEKnR7PaZ55aMTvQX"));
    const names = characterNames(plan);
    const request = { prompt, from: __rmT("9.JSSv1i"), ask: true, ...(names.length ? { characters: names } : {}) };
    if (size === 'portrait' || size === 'landscape')
        request.size = size;
    if (signal)
        request.signal = signal;
    try {
        onProgress?.({ phase: 'queued' });
    }
    catch { }
    let picture;
    try {
        picture = await api.draw(request);
    }
    catch (error) {
        if (error?.cancelled || signal?.aborted)
            throw failure('aborted', __rmT("lG.pz2TnT_Yo4if1"));
        if (error?.code === 'PAID')
            throw failure('paid_declined', __rmT("BHqhRLNqEf_0.NTuBy.1mBeOX4EsHvcP.X0DfiUxIZgFEBopYhAqQAdvttC9uT"));
        if (error?.code === 'NOT_READY')
            throw failure('not_configured', String(error?.message || __rmT("Dmf3l.Ka5Lnq1QSXK4op7VsR8BPrrk")));
        if (error?.code === 'NO_PROMPT')
            throw failure('invalid_args', __rmT("_9PW67Dt9BEjosNqPvSrOk8eFuKZ6JB7MGav9LDB31FOHYRRq8_"));
        throw failure('provider_error', `${__rmT("Dmf3l.KaM18dIea3tRPsHs1uBGjocT")}${String(error?.message || error)}${__rmT("OLaPUKejSYCsa9_xvnFrnH6ZbNs")}`);
    }
    let path = sitePath(picture?.url);
    let dataUrl = '';
    let saveFailed = false;
    if (!path) {
        if (!(picture?.blob instanceof Blob))
            throw failure('invalid_result', __rmT("g9WOq7l3NWzm_I.bG7cz98nEFuXGJNGOCBlldZgBFjkZZ7xIq8_"));
        try {
            onProgress?.({ phase: 'saving' });
        }
        catch { }
        const stored = await persistImage(await blobToDataUrl(picture.blob), { label: __rmT("s3XFEC__") });
        path = stored.path || '';
        dataUrl = stored.dataUrl || '';
        saveFailed = stored.saveFailed === true;
        if (!path && !dataUrl)
            throw failure('invalid_result', __rmT("HqjvpjtTo2xmIQeVuhXB1Vwkhk_x7blOgRh2HBbmNFaGfpyl6AP3d9kXzBG"));
    }
    return {
        url: path || dataUrl, path: path || null, dataUrl, prompt, provider: 'st-iphonie',
        generatedAt: new Date().toISOString(),
        promptMetadata: {
            prompt: String(plan?.prompt || ''), nl: String(plan?.nl || ''), flatPrompt: String(plan?.flatPrompt || ''),
            characters: plainCharacters(plan?.characters),
            promptFormat: plan?.promptFormat === 'nai45-tags' ? 'nai45-tags' : 'nai5-natural',
            backend: `st-iphonie:${String(picture?.engine || status.engine || '')}`,
            ...(picture?.model ? { model: String(picture.model) } : {}),
            ...(Number.isFinite(Number(picture?.seed)) ? { seed: Number(picture.seed) } : {}),
            ...(picture?.photoId != null ? { photoId: String(picture.photoId) } : {}),
            size, ...(saveFailed ? { saveFailed: true } : {}),
        },
    };
}
