import { setExtensionPrompt, extension_prompt_types, extension_prompt_roles } from '../../../../../script.js';
import { MODULE_NAME, getSettings } from './settings.js?rmv=0.33.73';
import { buildRabbitMirrorPrompt } from './promptBuilder.js?rmv=0.33.73';
import { buildFeedbackCatFinalCheck, buildFeedbackCatPrompt, clearFeedbackCatExtensionPrompt, getActiveFeedbackForCurrentChat, markFeedbackCatInjected } from './feedbackCat.js?rmv=0.33.73';

const INJECT_KEY = `${MODULE_NAME}:auto_injection`;

let generationInvocationSequence = 0;

function createGenerationScopeKey(type) {
    generationInvocationSequence += 1;
    const generationType = String(type || 'normal').replace(/[^a-z0-9_-]+/gi, '-');
    return `${generationType}:${Date.now().toString(36)}:${generationInvocationSequence.toString(36)}`;
}

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
    const feedbackPrompt = activeFeedback ? buildFeedbackCatPrompt(activeFeedback) : '';
    // 反馈直接追加在 RabbitMirror 主隐藏 Prompt 的最末尾，避免独立 Prompt 在模型侧被降权。
    // 未选择反馈时不追加任何字符，基础 Prompt 保持逐字不变。
    clearFeedbackCatExtensionPrompt();
    const generationScopeKey = createGenerationScopeKey(type);
    const basePrompt = buildRabbitMirrorPrompt(settings, type, null, generationScopeKey);
    if (!basePrompt) {
        clearRabbitMirrorPrompt();
        return;
    }
    const feedbackFinalCheck = activeFeedback ? buildFeedbackCatFinalCheck(activeFeedback) : '';
    const prompt = feedbackPrompt
        ? `${basePrompt}

${feedbackPrompt}${feedbackFinalCheck ? `

${feedbackFinalCheck}` : ''}`
        : basePrompt;
    const role = settings.role === 'user' ? extension_prompt_roles.USER : settings.role === 'assistant' ? extension_prompt_roles.ASSISTANT : extension_prompt_roles.SYSTEM;

    setExtensionPrompt(
        INJECT_KEY,
        prompt,
        extension_prompt_types.IN_CHAT,
        Number(settings.depth) || 0,
        false,
        role,
    );
    if (activeFeedback && feedbackPrompt) markFeedbackCatInjected(activeFeedback, type, feedbackPrompt);
}
