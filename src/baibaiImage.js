import { rmT as __rmT } from "./textTable.js?rmv=2.3.8";
import { chatu8Status, generateViaChatu8 } from './chatu8Image.js?rmv=2.3.8';
import { getSettings } from './settings.js?rmv=2.3.8';
import { getContext } from './independentApi/runtime.js?rmv=2.3.8';
import { getChatu8ImageCharacters } from './imageCharacterPresets.js?rmv=2.3.8';
import { buildSingleImagePrompt } from './imagePromptPayload.js?rmv=2.3.8';
function failure(code, message) { return Object.assign(new Error(message), { code }); }
function imageApi() {
    const api = globalThis.STBaiBaiImage;
    if (!api)
        throw failure('not_configured', __rmT("jMgxDE4lOAVAk5FWEz5aV5E2OnuU8LZVwXp_StwmXgdNOALlfAMMWi8ozBG"));
    if (api.apiVersion !== 1 || api.capabilities?.globalApi !== true || api.capabilities?.generate !== true || typeof api.generate !== 'function' || typeof api.getBackendStatus !== 'function') {
        throw failure('unsupported_api', __rmT("zyxwkJlLIjcV_VjkrqetvMQpWsTWjHmnK8AthL35Snu.4SA6vGU3ZdjGMVhI0YLakYQY3h"));
    }
    return api;
}
export function getImageBackendStatus() {
    try {
        if (getSettings().imageBackend === 'chatu8') {
            const status = chatu8Status();
            return { available: status.configured === true, configured: status.configured === true,
                backend: `st-chatu8:${status.mode || ''}`, supportsCharacters: false, reason: String(status.reason || '') };
        }
        const status = imageApi().getBackendStatus();
        return { available: true, configured: status.configured === true, backend: status.backend, model: status.model, supportsCharacters: status.supportsCharacters === true, reason: String(status.reason || '') };
    }
    catch (error) {
        return { available: false, configured: false, supportsCharacters: false, reason: error.message, code: error.code };
    }
}
export function getImageCharacters({ floor } = {}) {
    if (getSettings().imageBackend === 'chatu8')
        return getChatu8ImageCharacters(getContext());
    const api = imageApi();
    if (api.capabilities?.characterLibrary !== true || typeof api.getCharacters !== 'function')
        return [];
    const snapshot = api.getCharacters(Number.isSafeInteger(floor) && floor >= 0 ? { floor } : {});
    return Array.isArray(snapshot?.characters) ? snapshot.characters.map(person => ({
        name: String(person.name || ''), tag: String(person.tag || ''), nl: String(person.nl || ''),
    })) : [];
}
export async function generateMirrorImage(plan, { signal, onProgress, character, size, assertCurrent } = {}) {
    if (getSettings().imageBackend === 'chatu8')
        return generateViaChatu8(plan, { signal, size, assertCurrent });
    const api = imageApi();
    const status = api.getBackendStatus();
    if (!status.configured)
        throw failure('not_configured', status.reason || __rmT("7rJLdP.q_q99TmPgKAn6GeEjzpmeKOs2"));
    const characters = Array.isArray(plan?.characters) ? plan.characters.map(person => ({ name: String(person.name || ''), tag: String(person.tag || ''), nl: String(person.nl || '') })) : [];
    const prompt = status.supportsCharacters ? String(plan?.prompt || '').trim() : buildSingleImagePrompt(plan);
    const hasScene = [plan?.flatPrompt, plan?.nl, plan?.prompt].some(value => typeof value === 'string' && value.trim());
    if (!prompt || (!status.supportsCharacters && !hasScene))
        throw failure('invalid_args', __rmT("UJACPO2n3LvNwSW9.L4Kk.9XjHRG.zXHpqged.P.2f3BJqaFsuScwuOcu6pJYZkC"));
    if (typeof character !== 'string' || !character.trim())
        throw failure('invalid_args', __rmT("2d6uwi6D136dR2d0Ci4UzRmqUIx..eceDjhKU6nRME3u37pWq0QwBq5X"));
    const tagsOnly = plan?.promptFormat === 'nai45-tags';
    const nlText = tagsOnly ? '' : String(status.supportsCharacters ? plan?.nl || '' : prompt);
    const same = (a, b) => String(a || '').replace(/\s+/g, ' ').trim() === String(b || '').replace(/\s+/g, ' ').trim();
    const request = { prompt, nl: nlText && same(nlText, prompt) ? '' : nlText, save: true, character };
    const plannedMetadata = {
        prompt: String(plan?.prompt || ''), nl: String(plan?.nl || ''),
        flatPrompt: String(plan?.flatPrompt || ''), characters,
        promptFormat: plan?.promptFormat === 'nai45-tags' ? 'nai45-tags' : 'nai5-natural',
    };
    if (size === 'portrait' || size === 'landscape')
        request.size = size;
    if (status.supportsCharacters && characters.length)
        request.characters = characters.map(person => ({ ...person, nl: tagsOnly ? '' : person.nl }));
    if (signal?.aborted)
        throw failure('aborted', __rmT("lG.pz2TnT_Yo4if1"));
    if (typeof assertCurrent !== 'function' || assertCurrent() === false)
        throw failure('stale_owner', __rmT("GcgIrtz_fvATJTlacN1_jrXc9b9Z4HOBEKnR7PaZ55aMTvQX"));
    const result = await api.generate(request, { signal, onProgress });
    let path = typeof result?.path === 'string' && result.path ? result.path : null;
    let dataUrl = typeof result?.dataUrl === 'string' ? result.dataUrl : '';
    if (!path && !dataUrl)
        throw failure('invalid_result', __rmT("6HDqFtppNWzm_I.bG7cz98nEFuXGJNGOCBlldZgBFjkZZ7xIq8_"));
    if (path && /^https?:/i.test(path)) {
        try {
            const url = new URL(path, document.baseURI);
            if (url.origin === new URL(document.baseURI).origin)
                path = `${url.pathname}${url.search}`;
        }
        catch { }
    }
    return {
        url: path || dataUrl, path, dataUrl, prompt: request.prompt, provider: 'baibai-image',
        generatedAt: new Date().toISOString(),
        promptMetadata: { ...plannedMetadata, backend: result.backend, seed: result.seed, charactersApplied: result.charactersApplied, format: result.format, size: request.size },
    };
}
