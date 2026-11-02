import { rmT as __rmT } from "./textTable.js?rmv=2.15.2";
import { buildSingleImagePrompt } from './imagePromptPayload.js?rmv=2.15.2';
import { persistImage } from './chatu8Image.js?rmv=2.15.2';
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
        return { configured: false, reason: __rmT("GPzipAGgIL8941e3le4ldJWTrKc2gIdmTEnuxherPrwob2yaLxeX_Gjn.vFdNutHFTEc9mNKKxqP61VDBfoUJ1BYjN8uUnYO") };
    if (!api)
        return { configured: false, reason: __rmT("1NthNmgGK5GcDDxFZqhtBY_qnzgm3sW5WppqR60T7JJScZpWz2m3qWv.EiuisSa4H_PRbbeBjTKMRhNIpgm_lUK.Mo6FaHq24Y5GCse0hDF4s.9Mc1GYzq.WV9QifGEr_uwuhcAc") };
    let status = null;
    try {
        status = api.drawStatus();
    }
    catch (error) {
        return { configured: false, reason: `${__rmT("aWMWs7CGGO5rVMbfppwZmN9odaz9ymElfLYhwjbqyCc2ZnIZxAh")}${String(error?.message || error)}` };
    }
    if (!status?.ready)
        return { configured: false, reason: String(status?.missing || __rmT("m0C4XadImJoofinUG_FwP57QqyGiYla90v2DJTwC.YTXZqNir6AGU6.ypJkFKS8OWUE")) };
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
            throw failure('paid_declined', __rmT("8armaCqs4I7vcgTFcET91JtXrdUZcPjEGHM3ciC5gKeWcFHvdePA4_WF_nV.hxhLyHf_UZdAAlhYrlH9"));
        if (error?.code === 'NOT_READY')
            throw failure('not_configured', String(error?.message || __rmT("hRJBfB6X_ghswQOPbKsgY5JpWaDs1FVcnIDJwyJGO0aVKSQX")));
        if (error?.code === 'NO_PROMPT')
            throw failure('invalid_args', __rmT("_9PW67Dt9BEjosNqPvSrOk8eFuKZ6JB7MGav9LDB31FOHYRRq8_"));
        throw failure('provider_error', `${__rmT("hRJBfB6X_ghswQOPbKsgY5JpWaDuIYIESn1zYuHgryCrXn9x")}${String(error?.message || error)}${__rmT("OLaPUKejSYCsa9_xvnFrnH6ZbNs")}`);
    }
    let path = sitePath(picture?.url);
    let dataUrl = '';
    let saveFailed = false;
    if (!path) {
        if (!(picture?.blob instanceof Blob))
            throw failure('invalid_result', __rmT("lPRZYh7xKv254ONWPO22aQeq1tkz7tPUDcqyGd35NvoeGSSJC_2Wv8ZM7fULFGlKZ.VY3h"));
        try {
            onProgress?.({ phase: 'saving' });
        }
        catch { }
        const stored = await persistImage(await blobToDataUrl(picture.blob), { label: __rmT("KFgLaN_B4l0MSpRh0eLXdub_7bh") });
        path = stored.path || '';
        dataUrl = stored.dataUrl || '';
        saveFailed = stored.saveFailed === true;
        if (!path && !dataUrl)
            throw failure('invalid_result', __rmT("w5twcBQfYGnIJx72iavL40M6g1jymhg5P75Ss3B9oNfH2rojWZDZ1l4dexbVFbDhUwxktt2GC.pobh"));
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
