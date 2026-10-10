// 生图 LLM：专门用来“写画面提示词”的独立文字模型连接，和兔子镜副 API 分开配置。
// 只替换连接与模型（酒馆 Connection Profile 或手动 OpenAI 兼容接口），请求方式沿用副 API 的同一套传输。
import { getSettings, updateSettings } from './settings.js?rmv=1.67.42-face-atlas-test2';
import { getContext } from './independentApi/runtime.js?rmv=1.67.42-face-atlas-test2';
import { fetchIndependentModels, getIndependentConnectionProfiles, normalizeIndependentConnectionText, validatedIndependentConnectionProfile } from './independentApi/connection.js?rmv=1.67.42-face-atlas-test2';

export function imageLlmConfigured(settings = getSettings()) {
    return settings?.imageLlmEnabled === true
        && !!(String(settings.imageLlmProfileId || '').trim() || String(settings.imageLlmBaseUrl || '').trim())
        && !!String(settings.imageLlmModel || '').trim();
}

// 生图 LLM 已配置时，返回把连接与模型换成生图 LLM 的设置副本；否则原样返回（沿用副 API）。
export function imageLlmSettings(settings = getSettings()) {
    if (!imageLlmConfigured(settings)) return settings;
    const profileId = String(settings.imageLlmProfileId || '').trim();
    return {
        ...settings,
        independentConnectionProfileId: profileId,
        independentApiBaseUrl: profileId ? '' : String(settings.imageLlmBaseUrl || '').trim(),
        independentApiKey: profileId ? '' : String(settings.imageLlmKey || ''),
        independentApiModel: String(settings.imageLlmModel || '').trim(),
        independentApiTemperature: Number.isFinite(Number(settings.imageLlmTemperature)) ? Number(settings.imageLlmTemperature) : 0.8,
        independentApiMaxTokens: Number(settings.imageLlmMaxTokens) > 0 ? Number(settings.imageLlmMaxTokens) : 4096,
        // 副 API 的高级参数（推理强度、排除参数等）不带到生图 LLM。
        independentAdvancedEnabled: false,
        independentExtraParams: '',
        independentExcludedParams: [],
    };
}

export function imageLlmStatusText(settings = getSettings()) {
    if (settings?.imageLlmEnabled !== true) return '未启用：手动生图由副 API 单独请求；内置生图随小剧场一并生成。';
    if (!imageLlmConfigured(settings)) return '已启用，但还缺连接或模型；未配置好之前仍沿用副 API。';
    return String(settings.imageLlmProfileId || '').trim()
        ? `酒馆连接 · 模型 ${settings.imageLlmModel}`
        : `手动接口 · 模型 ${settings.imageLlmModel}`;
}

// 一键配置：使用酒馆当前选中的 Connection Profile（不保存 Key）。
export async function importCurrentConnectionForImageLlm() {
    const ctx = getContext();
    const manager = ctx?.extensionSettings?.connectionManager || {};
    const selectedId = normalizeIndependentConnectionText(manager.selectedProfile, 160);
    if (!selectedId) throw new Error('酒馆当前没有选中的 Connection Profile；请先在酒馆的连接管理里选一个，或改用手动填写。');
    const selected = await validatedIndependentConnectionProfile(selectedId, ctx);
    const model = normalizeIndependentConnectionText(selected?.profile?.model, 240);
    const current = getSettings();
    updateSettings({
        imageLlmEnabled: true,
        imageLlmProfileId: selectedId,
        imageLlmModel: String(current.imageLlmProfileId || '') === selectedId && current.imageLlmModel ? current.imageLlmModel : model,
    });
    return { id: selectedId, name: normalizeIndependentConnectionText(selected?.profile?.name, 180) || '当前连接', model };
}

// 和副 API 的“连接配置”一样：列出酒馆里所有可复用的 Chat Completion 连接。
export function listImageLlmProfiles() {
    try { return getIndependentConnectionProfiles(); } catch { return []; }
}

export async function selectImageLlmProfile(profileId) {
    const id = normalizeIndependentConnectionText(profileId, 160);
    if (!id) return null;
    const selected = await validatedIndependentConnectionProfile(id, getContext());
    const model = normalizeIndependentConnectionText(selected?.profile?.model, 240);
    const current = getSettings();
    updateSettings({
        imageLlmEnabled: true,
        imageLlmProfileId: id,
        imageLlmModel: String(current.imageLlmProfileId || '') === id && current.imageLlmModel ? current.imageLlmModel : model,
    });
    return { id, name: normalizeIndependentConnectionText(selected?.profile?.name, 180) || '酒馆连接', model };
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
