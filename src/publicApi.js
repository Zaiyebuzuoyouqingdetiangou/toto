import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.1.5";
import { createRabbitMirrorPublicAPI } from './publicApiCore.js?rmv=2.1.5';
import { getSettings, updateSettings } from './settings.js?rmv=2.1.5';
import { buildScriptUserPrompt } from './publicApiPrompt.js?rmv=2.1.5';
export function installRabbitMirrorPublicAPI(isActive, target = globalThis) {
    const connection = () => import('./independentApi/connection.js?rmv=2.1.5');
    const captureContext = () => {
        const identity = ctx => String(ctx?.getCurrentChatId?.() ?? ctx?.chatId ?? ctx?.chatMetadata?.chat_id ?? '') + ':' + String(ctx?.characterId ?? '') + ':' + String(ctx?.groupId ?? '');
        const context = target.SillyTavern?.getContext?.();
        const chat = context?.chat;
        const chatId = identity(context);
        return () => {
            const current = target.SillyTavern?.getContext?.();
            if (current?.chat !== chat || identity(current) !== chatId)
                throw Object.assign(new Error(__rmT("VS.iQsDuXpAeOx4TCENcT2M8NVbptTpLZ3kqyVz9gG8")), { code: 'SETTINGS_CHANGED' });
        };
    };
    const handle = createRabbitMirrorPublicAPI({
        isActive, getSettings, updateSettings, captureContext,
        notify(detail) { target.dispatchEvent(new CustomEvent('rabbitmirror:api-settings-changed', { detail })); },
        async listProfiles() { return (await connection()).getIndependentConnectionProfiles().map(p => ({ id: String(p.id || ''), name: String(p.name || '') })); },
        async listModels() { return (await connection()).fetchIndependentModels(); },
        async listProviders() {
            return (await import('./memoryScanner.js?rmv=2.1.5')).scanMemoryPlugins().map(p => ({ id: p.id, name: p.name, readable: p.readable === true, selectedAllowed: p.selectedAllowed === true }));
        },
        async listWorldBooks() { return (await import('./memoryWorldBook.js?rmv=2.1.5')).listMemoryWorldBooks(); },
        async readMemory(settings) {
            const assertContext = captureContext();
            const module = await import('./memoryScanner.js?rmv=2.1.5');
            const material = await module.prepareSelectedMemoryForPrompt(settings, { hasSharedMemoryTheme: true, generationType: 'script', maxChars: settings.memoryMaxChars });
            assertContext();
            return material;
        },
        async complete(settings, system, prompt, options) {
            const runtime = await import('./independentApi/request.js?rmv=2.1.5');
            options.assertAdvancedCurrent();
            if (__rmR("BL0VJZM57uOM8YWtfvRJXbdTfQS.s7NF83a48Nt5gJnAlKgOLe6gyhBJxs3lLXLvHL16LeHS5YZcWdW0uQg.JuwBf0otfbAjXHA", "").test(system + prompt) || __rmR(".TejTYTQCwe2s24lh2uWwM2WbCYG8xvX", "").test(system + prompt))
                throw Object.assign(new Error(__rmT("jclAiDI3HzFDQcduHu29vbVjqfL.1xgmXRUbjiJ3LUwS4r4ELnpr7f")), { code: 'INVALID_ARGUMENT' });
            const userPrompt = buildScriptUserPrompt(prompt);
            if (system.length + userPrompt.length > settings.independentMaxRequestChars)
                throw Object.assign(new Error(__rmT("4vu9RY6xNBdohBYBei7r5.iY8ZjAyFw_qsMTgyXCgG8")), { code: 'REQUEST_TOO_LARGE' });
            return runtime.requestIndependentCompletion(settings, system, userPrompt, options);
        },
    });
    target.RabbitMirrorAPI = handle.api;
    target.dispatchEvent(new CustomEvent('rabbitmirror:api-ready', { detail: { version: handle.api.version } }));
    return () => { handle.dispose(); if (target.RabbitMirrorAPI === handle.api)
        delete target.RabbitMirrorAPI; };
}
