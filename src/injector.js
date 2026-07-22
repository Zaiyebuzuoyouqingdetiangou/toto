import { setExtensionPrompt, extension_prompt_types, extension_prompt_roles } from '../../../../../script.js';
import { MODULE_NAME, getSettings } from './settings.js?rmv=0.33.55';
import { buildRabbitMirrorPrompt } from './promptBuilder.js?rmv=0.33.55';
import { buildFeedbackCatPrompt, clearFeedbackCatExtensionPrompt, getActiveFeedbackForCurrentChat, markFeedbackCatInjected } from './feedbackCat.js?rmv=0.33.55';

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
    const feedbackPrompt = activeFeedback ? buildFeedbackCatPrompt(activeFeedback) : '';
    // 反馈直接追加在 RabbitMirror 主隐藏 Prompt 的最末尾，避免独立 Prompt 在模型侧被降权。
    // 未选择反馈时不追加任何字符，基础 Prompt 保持逐字不变。
    clearFeedbackCatExtensionPrompt();
    const basePrompt = buildRabbitMirrorPrompt(settings, type, null);
    if (!basePrompt) {
        clearRabbitMirrorPrompt();
        return;
    }
    const prompt = feedbackPrompt
        ? `${basePrompt}

${feedbackPrompt}

【挨打猫最终执行检查】
本轮输出兔子镜前，必须再次核对并落实上述用户反馈；若反馈涉及可见文字语言，逐项检查 summary、标题、按钮、标签、状态、提示、角标、占位文字与装饰词，不得残留不必要外语。`
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
