import { chatu8Status, generateViaChatu8 } from './chatu8Image.js?rmv=1.67.42-face-atlas-test3';
import { getSettings } from './settings.js?rmv=1.67.42-face-atlas-test3';
import { getContext } from './independentApi/runtime.js?rmv=1.67.42-face-atlas-test3';
import { getChatu8ImageCharacters } from './imageCharacterPresets.js?rmv=1.67.42-face-atlas-test3';
import { buildSingleImagePrompt } from './imagePromptPayload.js?rmv=1.67.42-face-atlas-test3';
function failure(code, message) { return Object.assign(new Error(message), { code }); }

function imageApi() {
    const api = globalThis.STBaiBaiImage;
    if (!api) throw failure('not_configured', '请先安装并启用柏宝绘，完成它的生图连接设置。');
    if (api.apiVersion !== 1 || api.capabilities?.globalApi !== true || api.capabilities?.generate !== true || typeof api.generate !== 'function' || typeof api.getBackendStatus !== 'function') {
        throw failure('unsupported_api', '当前柏宝绘未提供兼容的公开生图接口（API v1）。');
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
    } catch (error) {
        return { available: false, configured: false, supportsCharacters: false, reason: error.message, code: error.code };
    }
}

export function getImageCharacters({ floor } = {}) {
    if (getSettings().imageBackend === 'chatu8') return getChatu8ImageCharacters(getContext());
    const api = imageApi();
    if (api.capabilities?.characterLibrary !== true || typeof api.getCharacters !== 'function') return [];
    const snapshot = api.getCharacters(Number.isSafeInteger(floor) && floor >= 0 ? { floor } : {});
    return Array.isArray(snapshot?.characters) ? snapshot.characters.map(person => ({
        name: String(person.name || ''), tag: String(person.tag || ''), nl: String(person.nl || ''),
    })) : [];
}

export async function generateMirrorImage(plan, { signal, onProgress, character, size, assertCurrent } = {}) {
    // 生图渠道选了智绘姬时，交给智绘姬；否则沿用柏宝绘。
    if (getSettings().imageBackend === 'chatu8') return generateViaChatu8(plan, { signal, size, assertCurrent });
    const api = imageApi();
    const status = api.getBackendStatus();
    if (!status.configured) throw failure('not_configured', status.reason || '柏宝绘连接尚未配置完成。');
    const characters = Array.isArray(plan?.characters) ? plan.characters.map(person => ({ name: String(person.name || ''), tag: String(person.tag || ''), nl: String(person.nl || '') })) : [];
    const prompt = status.supportsCharacters ? String(plan?.prompt || '').trim() : buildSingleImagePrompt(plan);
    const hasScene = [plan?.flatPrompt, plan?.nl, plan?.prompt].some(value => typeof value === 'string' && value.trim());
    if (!prompt || (!status.supportsCharacters && !hasScene)) throw failure('invalid_args', '当前后端需要完整的画面提示词；请编辑或重新构思。');
    // Capture an explicit group: never let a queued provider request choose a later chat.
    if (typeof character !== 'string' || !character.trim()) throw failure('invalid_args', '缺少当前画面的图库归属，请重新打开这一面。');
    const tagsOnly = plan?.promptFormat === 'nai45-tags';
    // 单提示词后端的自然语言字段也使用已绑定外貌的完整画面。
    const request = { prompt, nl: tagsOnly ? '' : String(status.supportsCharacters ? plan?.nl || '' : prompt), save: true, character };
    const plannedMetadata = {
        prompt: String(plan?.prompt || ''), nl: String(plan?.nl || ''),
        flatPrompt: String(plan?.flatPrompt || ''), characters,
        promptFormat: plan?.promptFormat === 'nai45-tags' ? 'nai45-tags' : 'nai5-natural',
    };
    if (size === 'portrait' || size === 'landscape') request.size = size;
    if (status.supportsCharacters && characters.length) request.characters = characters.map(person => ({ ...person, nl: tagsOnly ? '' : person.nl }));
    if (signal?.aborted) throw failure('aborted', '生图已取消。');
    if (typeof assertCurrent !== 'function' || assertCurrent() === false) throw failure('stale_owner', '聊天或镜面已经变化，未发送生图请求。');
    // Exactly one public call. Provider-internal queue and retries remain its responsibility.
    const result = await api.generate(request, { signal, onProgress });
    const path = typeof result?.path === 'string' && result.path ? result.path : null;
    const dataUrl = typeof result?.dataUrl === 'string' ? result.dataUrl : '';
    if (!path && !dataUrl) throw failure('invalid_result', '柏宝绘没有返回图片；不会自动再次请求。');
    return {
        url: path || dataUrl, path, dataUrl, prompt: request.prompt, provider: 'baibai-image',
        generatedAt: new Date().toISOString(),
        promptMetadata: { ...plannedMetadata, backend: result.backend, seed: result.seed, charactersApplied: result.charactersApplied, format: result.format, size: request.size },
    };
}
