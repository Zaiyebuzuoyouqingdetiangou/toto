import { rmT as __rmT } from "./textTable.js?rmv=2.3.8";
import { getSettings, updateSettings } from './settings.js?rmv=2.3.8';
import { getContext } from './independentApi/runtime.js?rmv=2.3.8';
import { fetchIndependentModels, getIndependentConnectionProfiles, normalizeIndependentConnectionText, validatedIndependentConnectionProfile } from './independentApi/connection.js?rmv=2.3.8';
export function imageLlmConfigured(settings = getSettings()) {
    return settings?.imageLlmEnabled === true
        && !!(String(settings.imageLlmProfileId || '').trim() || String(settings.imageLlmBaseUrl || '').trim())
        && !!String(settings.imageLlmModel || '').trim();
}
export function imageLlmSettings(settings = getSettings()) {
    if (!imageLlmConfigured(settings))
        return settings;
    const profileId = String(settings.imageLlmProfileId || '').trim();
    return {
        ...settings,
        independentConnectionProfileId: profileId,
        independentApiBaseUrl: profileId ? '' : String(settings.imageLlmBaseUrl || '').trim(),
        independentApiKey: profileId ? '' : String(settings.imageLlmKey || ''),
        independentApiModel: String(settings.imageLlmModel || '').trim(),
        independentApiTemperature: Number.isFinite(Number(settings.imageLlmTemperature)) ? Number(settings.imageLlmTemperature) : 0.8,
        independentApiMaxTokens: Number(settings.imageLlmMaxTokens) > 0 ? Number(settings.imageLlmMaxTokens) : 4096,
        independentAdvancedEnabled: false,
        independentExtraParams: '',
        independentExcludedParams: [],
    };
}
export function imageLlmStatusText(settings = getSettings()) {
    if (settings?.imageLlmEnabled !== true)
        return __rmT("yOksz3N0aqL.YI7Ul8W3eSyjDfqtEqQrhEvW0WFEe_QB02qUypI0AWJ5.jkV73cBzfdvic48WN1mdu_DFzmFBaGu");
    if (!imageLlmConfigured(settings))
        return __rmT("trgorQ5TidXKEud2U96xlIp2z6TghmFbYYNxCChgBxpGWJn3MfZGLwCXL8FZ8FDOz1qfxa_pY3Y");
    return String(settings.imageLlmProfileId || '').trim()
        ? `${__rmT("5klhfIrjx9iASQchvVLfPcbHjFs")}${settings.imageLlmModel}` : `${__rmT("cbkySaH6hQiASQchvVLfPcbHjFs")}${settings.imageLlmModel}`;
}
export async function importCurrentConnectionForImageLlm() {
    const ctx = getContext();
    const manager = ctx?.extensionSettings?.connectionManager || {};
    const selectedId = normalizeIndependentConnectionText(manager.selectedProfile, 160);
    if (!selectedId)
        throw new Error(__rmT("Vk6XFKiwkmU0EttiEv_jix94EUy45rSf1zmw8_Nd07Pjjya5XKeO7rK1ykShzxe01xhzoa57Ycr5oLOJN5QpzLdFgaaTu6N4uvz1Vjd6MHmTPydtpwQ9NsvvrEvHQvnJFJo1aze51FT"));
    const selected = await validatedIndependentConnectionProfile(selectedId, ctx);
    const model = normalizeIndependentConnectionText(selected?.profile?.model, 240);
    const current = getSettings();
    updateSettings({
        imageLlmEnabled: true,
        imageLlmProfileId: selectedId,
        imageLlmModel: String(current.imageLlmProfileId || '') === selectedId && current.imageLlmModel ? current.imageLlmModel : model,
    });
    return { id: selectedId, name: normalizeIndependentConnectionText(selected?.profile?.name, 180) || __rmT("rHZnAGhLDPC"), model };
}
export function listImageLlmProfiles() {
    try {
        return getIndependentConnectionProfiles();
    }
    catch {
        return [];
    }
}
export async function selectImageLlmProfile(profileId) {
    const id = normalizeIndependentConnectionText(profileId, 160);
    if (!id)
        return null;
    const selected = await validatedIndependentConnectionProfile(id, getContext());
    const model = normalizeIndependentConnectionText(selected?.profile?.model, 240);
    const current = getSettings();
    updateSettings({
        imageLlmEnabled: true,
        imageLlmProfileId: id,
        imageLlmModel: String(current.imageLlmProfileId || '') === id && current.imageLlmModel ? current.imageLlmModel : model,
    });
    return { id, name: normalizeIndependentConnectionText(selected?.profile?.name, 180) || __rmT("rcHBrBhLDPC"), model };
}
export async function fetchImageLlmModels() {
    const settings = getSettings();
    const profileId = String(settings.imageLlmProfileId || '').trim();
    const result = profileId
        ? await fetchIndependentModels({ mode: 'profile', profileId })
        : await fetchIndependentModels({ mode: 'manual', baseUrl: settings.imageLlmBaseUrl, apiKey: settings.imageLlmKey });
    const list = Array.isArray(result) ? result : Array.isArray(result?.models) ? result.models : [];
    return list.map(item => (typeof item === 'string' ? item : String(item?.id || item?.name || ''))).filter(Boolean);
}
