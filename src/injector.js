import { setExtensionPrompt, extension_prompt_types, extension_prompt_roles } from '../../../../../script.js';
import { MODULE_NAME, getSettings } from './settings.js?rmv=0.33.44';
import { buildRabbitMirrorPrompt } from './promptBuilder.js?rmv=0.33.44';
import { clearFeedbackCatExtensionPrompt, getActiveFeedbackForCurrentChat, markFeedbackCatInjected, syncFeedbackCatExtensionPrompt } from './feedbackCat.js?rmv=0.33.44';

const INJECT_KEY = `${MODULE_NAME}:auto_injection`;

export function clearRabbitMirrorPrompt() {
    clearFeedbackCatExtensionPrompt();
    try {
        setExtensionPrompt(INJECT_KEY, '', extension_prompt_types.IN_CHAT, 0, false, extension_prompt_roles.SYSTEM);
    } catch (error) {
        console.warn('[RabbitMirror] Failed to clear extension prompt:', error);
    }
}

export async function rabbitMirrorGenerateInterceptor(_chat, _contextSize, _abort, type) {
    const settings = getSettings();

    const skipQuiet = settings.skipQuiet && type === 'quiet';
    const skipImpersonate = settings.skipImpersonate && type === 'impersonate';

    if (!settings.enabled || !settings.autoRabbitMirrorInjection || settings.mode === 'off' || skipQuiet || skipImpersonate) {
        clearRabbitMirrorPrompt();
        return;
    }

    const activeFeedback = settings.feedbackCatEnabled !== false ? getActiveFeedbackForCurrentChat(_chat) : null;
    const feedbackSync = activeFeedback
        ? syncFeedbackCatExtensionPrompt(activeFeedback)
        : { ok: clearFeedbackCatExtensionPrompt(), prompt: '', promptHash: '', chars: 0 };
    const prompt = buildRabbitMirrorPrompt(settings, type, null);
    if (!prompt) {
        clearRabbitMirrorPrompt();
        return;
    }
    const role = settings.role === 'user' ? extension_prompt_roles.USER : settings.role === 'assistant' ? extension_prompt_roles.ASSISTANT : extension_prompt_roles.SYSTEM;

    setExtensionPrompt(
        INJECT_KEY,
        prompt,
        extension_prompt_types.IN_CHAT,
        Number(settings.depth) || 0,
        false,
        role,
    );
    if (activeFeedback && feedbackSync.ok) markFeedbackCatInjected(activeFeedback, type, feedbackSync.prompt);
}
