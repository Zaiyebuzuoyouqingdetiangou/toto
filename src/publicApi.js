import { createRabbitMirrorPublicAPI } from './publicApiCore.js?rmv=1.6.9';
import { getSettings, updateSettings } from './settings.js?rmv=1.6.9';
import { buildScriptUserPrompt } from './publicApiPrompt.js?rmv=script-api2';

// Preserve the lightweight startup graph; host/network modules load only on use.
export function installRabbitMirrorPublicAPI(isActive, target = globalThis) {
    const connection = () => import('./independentApi/connection.js?rmv=1.6.9');
    const captureContext = () => {
        const identity = ctx => String(ctx?.getCurrentChatId?.() ?? ctx?.chatId ?? ctx?.chatMetadata?.chat_id ?? '') + ':' + String(ctx?.characterId ?? '') + ':' + String(ctx?.groupId ?? '');
        const context = target.SillyTavern?.getContext?.();
        const chat = context?.chat;
        const chatId = identity(context);
        return () => {
            const current = target.SillyTavern?.getContext?.();
            if (current?.chat !== chat || identity(current) !== chatId) throw Object.assign(new Error('调用期间切换了聊天，请重新调用。'), { code: 'SETTINGS_CHANGED' });
        };
    };
    const handle = createRabbitMirrorPublicAPI({
        isActive, getSettings, updateSettings, captureContext,
        notify(detail) { target.dispatchEvent(new CustomEvent('rabbitmirror:api-settings-changed', { detail })); },
        async listProfiles() { return (await connection()).getIndependentConnectionProfiles().map(p => ({ id: String(p.id || ''), name: String(p.name || '') })); },
        async listModels() { return (await connection()).fetchIndependentModels(); },
        async listProviders() {
            return (await import('./memoryScanner.js?rmv=1.5.53-cn-boundary1')).scanMemoryPlugins().map(p => ({ id: p.id, name: p.name, readable: p.readable === true, selectedAllowed: p.selectedAllowed === true }));
        },
        async listWorldBooks() { return (await import('./memoryWorldBook.js?rmv=1.5.53-cn-boundary1')).listMemoryWorldBooks(); },
        async readMemory(settings) {
            const assertContext = captureContext();
            const module = await import('./memoryScanner.js?rmv=1.5.53-cn-boundary1');
            // Explicit script action includes the user's selected providers and bound book.
            // It does not alter the existing automatic independent-generation policy.
            const material = await module.prepareSelectedMemoryForPrompt(settings, { hasSharedMemoryTheme: true, generationType: 'script', maxChars: settings.memoryMaxChars });
            assertContext();
            return material;
        },
        async complete(settings, system, prompt, options) {
            const runtime = await import('./independentApi/request.js?rmv=1.6.9');
            options.assertAdvancedCurrent();
            if (/【(?:当前聊天逐轮正文|当前角色卡|当前世界书、作者注释与实际扩展提示)/.test(system + prompt) || /<\/?兔子镜近输出短锁/.test(system + prompt)) throw Object.assign(new Error('输入包含保留的请求边界标记，请只传正文。'), { code: 'INVALID_ARGUMENT' });
            const userPrompt = buildScriptUserPrompt(prompt);
            if (system.length + userPrompt.length > settings.independentMaxRequestChars) throw Object.assign(new Error('脚本输入和请求边界超过字符预算。'), { code: 'REQUEST_TOO_LARGE' });
            return runtime.requestIndependentCompletion(settings, system, userPrompt, options);
        },
    });
    target.RabbitMirrorAPI = handle.api;
    target.dispatchEvent(new CustomEvent('rabbitmirror:api-ready', { detail: { version: handle.api.version } }));
    return () => { handle.dispose(); if (target.RabbitMirrorAPI === handle.api) delete target.RabbitMirrorAPI; };
}
