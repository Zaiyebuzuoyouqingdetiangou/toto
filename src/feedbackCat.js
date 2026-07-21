import { setExtensionPrompt, extension_prompt_types, extension_prompt_roles, eventSource, event_types } from '../../../../../script.js';

const FEEDBACK_STORAGE_KEY = 'rabbit_mirror_theater:feedback_cat:v1';
const FEEDBACK_PENDING_KEY = 'rabbit_mirror_theater:feedback_cat_pending:v2';
const FEEDBACK_METADATA_KEY = 'rabbit_mirror_theater_feedback_cat_v2';
const FEEDBACK_PROMPT_KEY = 'rabbit_mirror_theater:feedback_cat_prompt';
const RUNTIME_VERSION = '0.33.38';
const VALID_ROUNDS = new Set([1, 3, 10]);
const VALID_TYPES = new Set(['color', 'structure', 'overall', 'interaction', 'language', 'custom']);

export const FEEDBACK_CAT_TYPES = Object.freeze({
    color: '配色不喜欢',
    structure: '结构太模板',
    overall: '整体不好看',
    interaction: '交互太简单',
    language: '一直说外语',
    custom: '我要亲自骂',
});

function clone(value) {
    if (!value || typeof value !== 'object') return value;
    try {
        return typeof structuredClone === 'function'
            ? structuredClone(value)
            : JSON.parse(JSON.stringify(value));
    } catch {
        return { ...value };
    }
}

function hashText(text) {
    let hash = 2166136261;
    for (const char of String(text || '')) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

function getContextSafe() {
    try {
        return globalThis.SillyTavern?.getContext?.() || {};
    } catch {
        return {};
    }
}

function firstNonEmpty(values) {
    for (const value of values) {
        if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
    }
    return '';
}

function getCurrentFeedbackChatIdentity(chatOverride = null) {
    const context = getContextSafe();
    const chat = Array.isArray(chatOverride)
        ? chatOverride
        : Array.isArray(context?.chat)
            ? context.chat
            : Array.isArray(globalThis.chat)
                ? globalThis.chat
                : [];
    const metadata = context?.chatMetadata || globalThis.chat_metadata || {};
    const chatId = firstNonEmpty([
        context?.chatId,
        context?.chat_id,
        metadata?.chat_id,
        metadata?.file_name,
        metadata?.name,
    ]);
    const groupId = firstNonEmpty([context?.groupId, context?.group_id, globalThis.selected_group]);
    const characterId = firstNonEmpty([
        context?.characterId,
        context?.character_id,
        context?.character?.avatar,
        context?.characterName,
        globalThis.this_chid,
    ]);
    const firstMessage = chat[0] || {};
    const seed = firstNonEmpty([
        firstMessage?.send_date,
        firstMessage?.name,
        String(firstMessage?.mes || '').slice(0, 160),
        globalThis.location?.pathname,
    ]);
    const key = chatId
        ? `chat:${chatId}`
        : groupId
            ? `group:${groupId}:${hashText(seed)}`
            : characterId
                ? `character:${characterId}:${hashText(seed)}`
                : `fallback:${hashText(seed || 'unknown-chat')}`;
    return { key, chat, chatId, groupId, characterId, context, metadata };
}

function emptyState() {
    return { version: 2, active: null, lastReceipt: null };
}

function readLegacyStore() {
    try {
        const parsed = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '{}');
        if (parsed && typeof parsed === 'object' && parsed.chats && typeof parsed.chats === 'object') return parsed;
    } catch {
        // Fall through to a fresh legacy store.
    }
    return { version: 1, chats: {} };
}

function writeLegacyStore(store) {
    try {
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(store));
        return true;
    } catch (error) {
        console.warn('[RabbitMirror] Failed to store feedback cat fallback state:', error);
        return false;
    }
}

function saveMetadataSoon(context) {
    try {
        const result = context?.saveMetadata?.();
        if (result && typeof result.catch === 'function') {
            result.catch(error => console.warn('[RabbitMirror] Failed to save feedback cat chat metadata:', error));
        }
    } catch (error) {
        console.warn('[RabbitMirror] Failed to save feedback cat chat metadata:', error);
    }
}

function normalizeState(value) {
    if (!value || typeof value !== 'object') return emptyState();
    return {
        version: 2,
        active: value.active && typeof value.active === 'object' ? clone(value.active) : null,
        lastReceipt: value.lastReceipt && typeof value.lastReceipt === 'object' ? clone(value.lastReceipt) : null,
    };
}

function readCurrentState(chatOverride = null) {
    const identity = getCurrentFeedbackChatIdentity(chatOverride);
    const metadataState = identity.metadata?.[FEEDBACK_METADATA_KEY];
    if (metadataState && typeof metadataState === 'object') {
        return { state: normalizeState(metadataState), identity, source: 'chatMetadata' };
    }

    const legacy = readLegacyStore();
    const oldRecord = legacy.chats[identity.key];
    const state = emptyState();
    if (oldRecord && typeof oldRecord === 'object') {
        state.active = clone(oldRecord);
        if (identity.metadata && typeof identity.metadata === 'object') {
            identity.metadata[FEEDBACK_METADATA_KEY] = clone(state);
            saveMetadataSoon(identity.context);
        }
    }
    return { state, identity, source: oldRecord ? 'localStorage-migrated' : 'empty' };
}

function writeCurrentState(state, chatOverride = null) {
    const identity = getCurrentFeedbackChatIdentity(chatOverride);
    const normalized = normalizeState(state);
    let metadataWritten = false;
    if (identity.metadata && typeof identity.metadata === 'object') {
        identity.metadata[FEEDBACK_METADATA_KEY] = clone(normalized);
        saveMetadataSoon(identity.context);
        metadataWritten = true;
    }

    const legacy = readLegacyStore();
    if (normalized.active) legacy.chats[identity.key] = clone(normalized.active);
    else delete legacy.chats[identity.key];
    const fallbackWritten = writeLegacyStore(legacy);
    return { identity, metadataWritten, fallbackWritten };
}

function sanitizeCustomFeedback(value, maxLength = 400) {
    let text = String(value ?? '');
    if (typeof text.normalize === 'function') text = text.normalize('NFC');
    return text
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .replace(/\r\n?/g, '\n')
        .trim()
        .slice(0, Math.max(1, Number(maxLength) || 400));
}

function sanitizeFingerprint(value) {
    if (!value || typeof value !== 'object') return null;
    const palette = value.paletteFingerprint && typeof value.paletteFingerprint === 'object'
        ? {
            brightness: String(value.paletteFingerprint.brightness || '').slice(0, 16),
            hueFamily: String(value.paletteFingerprint.hueFamily || '').slice(0, 16),
            saturation: String(value.paletteFingerprint.saturation || '').slice(0, 16),
            temperature: String(value.paletteFingerprint.temperature || '').slice(0, 16),
            confidence: Number(value.paletteFingerprint.confidence || 0),
        }
        : null;
    const riskFlags = Array.isArray(value.riskFlags)
        ? value.riskFlags.map(item => String(item || '').slice(0, 48)).filter(Boolean).slice(0, 12)
        : [];
    const signature = String(value.signature || '').replace(/\s+/g, ' ').trim().slice(0, 260);
    const skeleton = String(value.skeleton || '').replace(/\s+/g, ' ').trim().slice(0, 340);
    if (!palette && !riskFlags.length && !signature && !skeleton) return null;
    return { paletteFingerprint: palette, riskFlags, signature, skeleton };
}

function paletteSummary(fingerprint) {
    const palette = fingerprint?.paletteFingerprint;
    if (!palette) return '';
    const brightnessMap = { dark: '低明度', mid: '中明度', light: '高明度' };
    const saturationMap = { low: '低彩度', medium: '中彩度', high: '高彩度' };
    const temperatureMap = { warm: '偏暖', cool: '偏冷', neutral: '冷暖中性' };
    const hueMap = {
        neutral: '中性色', red: '红色家族', orange: '橙色家族', yellow: '黄色家族',
        green: '绿色家族', cyan: '青色家族', blue: '蓝色家族', purple: '紫色家族', pink: '粉色家族',
    };
    const parts = [
        brightnessMap[palette.brightness] || '',
        saturationMap[palette.saturation] || '',
        hueMap[palette.hueFamily] || '',
        temperatureMap[palette.temperature] || '',
    ].filter(Boolean);
    return parts.join('、');
}

function fingerprintContext(feedback, type) {
    const fingerprint = feedback?.sourceFingerprint;
    if (!fingerprint) return '';
    if (type === 'color') {
        const summary = paletteSummary(fingerprint);
        return summary ? `\n插件从被反馈作品的最终渲染结果中提取到的配色摘要：${summary}。` : '';
    }
    if (type === 'structure') {
        return fingerprint.skeleton ? `\n插件从被反馈作品中提取到的结构摘要：${fingerprint.skeleton}` : '';
    }
    if (type === 'interaction') {
        const flags = fingerprint.riskFlags || [];
        return flags.length ? `\n插件从被反馈作品中检测到的交互/结构风险：${flags.join('、')}。` : '';
    }
    if (type === 'overall') {
        const parts = [paletteSummary(fingerprint), fingerprint.skeleton].filter(Boolean);
        return parts.length ? `\n插件从被反馈作品中提取到的粗略视觉摘要：${parts.join('；')}` : '';
    }
    return '';
}

export function getActiveFeedbackForCurrentChat(chatOverride = null) {
    const { state, identity, source } = readCurrentState(chatOverride);
    const record = state.active;
    if (!record || !VALID_TYPES.has(record.type) || Number(record.remainingRounds || 0) <= 0) return null;
    return clone({ ...record, chatKey: identity.key, storageSource: source });
}

export function getFeedbackCatLastReceiptForCurrentChat(chatOverride = null) {
    const { state, identity } = readCurrentState(chatOverride);
    return state.lastReceipt ? clone({ ...state.lastReceipt, chatKey: identity.key }) : null;
}

export function setActiveFeedbackForCurrentChat({
    type,
    customText = '',
    rounds = 1,
    sourceMessageId = -1,
    sourceSwipeId = -1,
    sourceFingerprint = null,
} = {}) {
    const normalizedType = String(type || '');
    const normalizedRounds = Number(rounds);
    if (!VALID_TYPES.has(normalizedType)) throw new Error('未知的挨打猫反馈类型');
    if (!VALID_ROUNDS.has(normalizedRounds)) throw new Error('未知的挨打猫影响范围');
    const cleanedCustomText = normalizedType === 'custom' ? sanitizeCustomFeedback(customText) : '';
    if (normalizedType === 'custom' && !cleanedCustomText) throw new Error('请先输入反馈内容');

    const { state, identity } = readCurrentState();
    const now = Date.now();
    const record = {
        id: `rmfc-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        type: normalizedType,
        label: FEEDBACK_CAT_TYPES[normalizedType],
        customText: cleanedCustomText,
        totalRounds: normalizedRounds,
        remainingRounds: normalizedRounds,
        sourceMessageId: Number.isInteger(Number(sourceMessageId)) ? Number(sourceMessageId) : -1,
        sourceSwipeId: Number.isInteger(Number(sourceSwipeId)) ? Number(sourceSwipeId) : -1,
        sourceFingerprint: sanitizeFingerprint(sourceFingerprint),
        delivery: {
            status: 'waiting',
            savedAt: now,
            runtimeVersion: RUNTIME_VERSION,
            storage: identity.metadata && typeof identity.metadata === 'object' ? 'chatMetadata+fallback' : 'localStorage-fallback',
        },
        createdAt: now,
        updatedAt: now,
    };
    state.active = record;
    writeCurrentState(state);
    syncFeedbackCatExtensionPrompt(record);
    try { localStorage.removeItem(FEEDBACK_PENDING_KEY); } catch {}
    return clone({ ...record, chatKey: identity.key });
}

export function clearActiveFeedbackForCurrentChat() {
    const { state } = readCurrentState();
    state.active = null;
    writeCurrentState(state);
    clearFeedbackCatExtensionPrompt();
    try { localStorage.removeItem(FEEDBACK_PENDING_KEY); } catch {}
}

function presetFeedbackInstruction(feedback) {
    const type = feedback?.type;
    const source = fingerprintContext(feedback, type);
    if (type === 'color') {
        return `用户不满意被反馈兔子镜的配色。本轮须重新推导主承载面、文字、强调、边界与光影之间的完整色彩关系；不得回落到相近的明度、彩度、色相倾向和强调逻辑，不得只替换背景颜色，也不得机械固定成另一套替代色系。${source}`;
    }
    if (type === 'structure') {
        return `用户认为被反馈兔子镜的视觉结构过于模板化。本轮须从当前展现形式本体重新组织空间、层级、边界与信息关系；不得沿用相近的居中容器、卡片分区、规则网格或装饰骨架，也不得机械改用另一套固定模板。${source}`;
    }
    if (type === 'overall') {
        return `用户不满意被反馈兔子镜的整体审美。本轮须依据自身展现形式重新推导材质、空间、光源、布局、配色、细节与视觉主次；不得沿用相近的整体视觉语法，也不得仅通过换色、换装饰或局部微调敷衍处理。${source}`;
    }
    if (type === 'interaction') {
        return `用户认为被反馈兔子镜的交互过于简单。本轮仅在展现形式本身适合交互时增强交互：建立真实目标、明确操作、可识别且可保持的状态变化、与操作对应的反馈，以及继续推进、组合、切换或返回的可能；不得只增加无意义按钮、装饰性点击或一次性显隐，也不得为了交互破坏展现形式本体。${source}`;
    }
    if (type === 'language') {
        return '用户不满意兔子镜反复出现不必要的外语。本轮所有面向用户可见的标题、按钮、标签、状态、提示、说明与装饰文字均须使用当前对话的主要语言；正文原有外语、必要专有名词以及 HTML/CSS 的标签、属性、class、id 和代码标识不受此限制。';
    }
    return '';
}

export function buildFeedbackCatPrompt(feedback) {
    if (!feedback || !VALID_TYPES.has(feedback.type) || Number(feedback.remainingRounds || 0) <= 0) return '';
    if (feedback.type === 'custom') {
        const original = sanitizeCustomFeedback(feedback.customText);
        if (!original) return '';
        return String.raw`【挨打猫·用户明确美化要求｜本轮最终兔子镜必须清晰落实】
用户原话：${JSON.stringify(original)}
这条原话是用户直接提出的兔子镜视觉或交互要求。最终可见的兔子镜必须让用户能够明确看出该要求已经落实；不得只在分析或思考中提及，不得省略，不得弱化成难以察觉的小装饰，也不得把反馈原话、“挨打猫”或执行说明直接显示在聊天正文或兔子镜成品中。
仅落实原话中与兔子镜的视觉、排版、材质、配色、动效、可见文字或交互直接相关的要求；不得擅自概括、改写、扩写或替换为固定风格，不得添加用户没有提出的示例。
保留本轮展现形式的功能本体，并在适合该媒介的材质、空间、光源、配色、构图、动效、可见文字或交互中清晰实现用户原话。随机主题细节、默认配色惯性与通用模板在不影响正文含义、可读性、必要功能和输出格式时，应让位于这条用户明确要求。
无需解释反馈，直接体现在最终兔子镜中。`;
    }
    const instruction = presetFeedbackInstruction(feedback);
    if (!instruction) return '';
    return String.raw`【挨打猫·用户明确反馈｜本轮最终兔子镜必须清晰落实】
${instruction}
最终可见的兔子镜必须明显落实这项反馈，不得只在分析或思考中提及，也不得把反馈说明直接显示在聊天正文或兔子镜成品中。反馈只调整其明确涉及的视觉或交互关系，不得改变正文含义、必要功能与输出格式；无需解释反馈，直接落实。`;
}

export function syncFeedbackCatExtensionPrompt(feedback = getActiveFeedbackForCurrentChat()) {
    const prompt = buildFeedbackCatPrompt(feedback);
    try {
        setExtensionPrompt(
            FEEDBACK_PROMPT_KEY,
            prompt,
            extension_prompt_types.IN_CHAT,
            0,
            false,
            extension_prompt_roles.SYSTEM,
        );
        return { ok: true, prompt, promptHash: hashText(prompt), chars: prompt.length };
    } catch (error) {
        console.warn('[RabbitMirror] Failed to sync feedback cat extension prompt:', error);
        return { ok: false, prompt: '', promptHash: '', chars: 0, error };
    }
}

export function clearFeedbackCatExtensionPrompt() {
    try {
        setExtensionPrompt(
            FEEDBACK_PROMPT_KEY,
            '',
            extension_prompt_types.IN_CHAT,
            0,
            false,
            extension_prompt_roles.SYSTEM,
        );
        return true;
    } catch (error) {
        console.warn('[RabbitMirror] Failed to clear feedback cat extension prompt:', error);
        return false;
    }
}

function latestAssistantSnapshot(chat) {
    if (!Array.isArray(chat)) return { hash: '', index: -1, swipeId: -1, swipeCount: 0 };
    for (let index = chat.length - 1; index >= 0; index -= 1) {
        const message = chat[index];
        if (!message?.is_user && typeof message?.mes === 'string') {
            return {
                hash: hashText(message.mes),
                index,
                swipeId: Number.isInteger(message?.swipe_id) ? message.swipe_id : -1,
                swipeCount: Array.isArray(message?.swipes) ? message.swipes.length : 0,
            };
        }
    }
    return { hash: '', index: -1, swipeId: -1, swipeCount: 0 };
}

export function markFeedbackCatInjected(feedback, generationType = 'normal', feedbackPrompt = '') {
    if (!feedback?.id) return false;
    const { state, identity } = readCurrentState();
    const record = state.active;
    if (!record || record.id !== feedback.id) return false;
    if (feedback.chatKey && feedback.chatKey !== identity.key) return false;

    const previous = latestAssistantSnapshot(identity.chat);
    const now = Date.now();
    const prompt = feedbackPrompt || buildFeedbackCatPrompt(feedback);
    const pending = {
        feedbackId: feedback.id,
        chatKey: identity.key,
        injectedAt: now,
        generationType: String(generationType || 'normal'),
        previousChatLength: identity.chat.length,
        previousAssistantHash: previous.hash,
        previousAssistantIndex: previous.index,
        previousSwipeId: previous.swipeId,
        previousSwipeCount: previous.swipeCount,
        remainingAtInjection: Number(feedback.remainingRounds || 0),
        feedbackPromptHash: hashText(prompt),
        feedbackTextHash: hashText(feedback.type === 'custom' ? feedback.customText : feedback.type),
        feedbackTextLength: feedback.type === 'custom' ? String(feedback.customText || '').length : 0,
        runtimeVersion: RUNTIME_VERSION,
    };

    record.delivery = {
        ...(record.delivery || {}),
        status: 'injected',
        injectedAt: now,
        generationType: pending.generationType,
        feedbackPromptHash: pending.feedbackPromptHash,
        feedbackTextHash: pending.feedbackTextHash,
        feedbackTextLength: pending.feedbackTextLength,
        runtimeVersion: RUNTIME_VERSION,
        interceptorRead: true,
        extensionPromptWritten: true,
    };
    record.updatedAt = now;
    state.active = record;
    state.lastReceipt = clone({ ...record.delivery, feedbackId: record.id, type: record.type, label: record.label, remainingRounds: record.remainingRounds });
    writeCurrentState(state);

    try {
        localStorage.setItem(FEEDBACK_PENDING_KEY, JSON.stringify(pending));
        return true;
    } catch (error) {
        console.warn('[RabbitMirror] Failed to mark feedback cat injection:', error);
        return false;
    }
}

export function consumeInjectedFeedbackForSuccessfulRabbitMirror(message) {
    if (!message || message?.is_user || typeof message?.mes !== 'string') return null;
    let pending = null;
    try {
        pending = JSON.parse(localStorage.getItem(FEEDBACK_PENDING_KEY) || 'null');
    } catch {
        pending = null;
    }
    if (!pending?.feedbackId || Date.now() - Number(pending.injectedAt || 0) > 30 * 60 * 1000) return null;

    const { state, identity } = readCurrentState();
    if (pending.chatKey !== identity.key) return null;
    const outputHash = hashText(message.mes);
    const messageIndex = Array.isArray(identity.chat) ? identity.chat.lastIndexOf(message) : -1;
    const currentSwipeId = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
    const currentSwipeCount = Array.isArray(message?.swipes) ? message.swipes.length : 0;
    const outputChanged = !!outputHash && (
        outputHash !== pending.previousAssistantHash
        || identity.chat.length > Number(pending.previousChatLength || 0)
        || (messageIndex >= 0 && messageIndex !== Number(pending.previousAssistantIndex ?? -1))
        || currentSwipeId !== Number(pending.previousSwipeId ?? -1)
        || currentSwipeCount !== Number(pending.previousSwipeCount || 0)
    );
    if (!outputChanged) return null;

    const record = state.active;
    if (!record || record.id !== pending.feedbackId) {
        try { localStorage.removeItem(FEEDBACK_PENDING_KEY); } catch {}
        return null;
    }

    const now = Date.now();
    const remaining = Math.max(0, Number(record.remainingRounds || 0) - 1);
    const receipt = {
        ...(record.delivery || {}),
        status: 'consumed',
        consumedAt: now,
        feedbackId: record.id,
        type: record.type,
        label: record.label,
        remainingRounds: remaining,
        runtimeVersion: RUNTIME_VERSION,
        successfulRabbitMirrorDetected: true,
    };
    state.lastReceipt = receipt;

    let result;
    if (remaining > 0) {
        record.remainingRounds = remaining;
        record.updatedAt = now;
        record.delivery = {
            ...receipt,
            status: 'waiting',
            waitingSince: now,
            previousConsumedAt: now,
        };
        state.active = record;
        result = { consumed: true, cleared: false, remainingRounds: remaining, record: clone(record), receipt: clone(receipt) };
        writeCurrentState(state);
        syncFeedbackCatExtensionPrompt(record);
    } else {
        state.active = null;
        result = { consumed: true, cleared: true, remainingRounds: 0, record: clone(record), receipt: clone(receipt) };
        writeCurrentState(state);
        clearFeedbackCatExtensionPrompt();
    }
    try { localStorage.removeItem(FEEDBACK_PENDING_KEY); } catch {}
    return result;
}

function deliveryStatusLabel(delivery) {
    if (delivery?.status === 'injected') return '本轮已由生成拦截器读取并写入隐藏 Prompt';
    if (delivery?.status === 'consumed') return '已随成功生成消耗';
    return '等待下一次正式生成';
}

export function feedbackCatStatusText(feedback) {
    if (!feedback) return '当前没有生效中的反馈';
    const label = feedback.type === 'custom'
        ? `我要亲自骂：${String(feedback.customText || '').replace(/\s+/g, ' ').slice(0, 42)}`
        : FEEDBACK_CAT_TYPES[feedback.type] || feedback.label || '自定义反馈';
    return `${label}｜剩余 ${Number(feedback.remainingRounds || 0)} 轮｜${deliveryStatusLabel(feedback.delivery)}`;
}

export function feedbackCatReceiptText(receipt) {
    if (!receipt) return '';
    const label = FEEDBACK_CAT_TYPES[receipt.type] || receipt.label || '反馈';
    const time = Number(receipt.consumedAt || receipt.injectedAt || 0);
    const timeText = time ? new Date(time).toLocaleTimeString() : '';
    return `${label}｜${deliveryStatusLabel(receipt)}${timeText ? `｜${timeText}` : ''}`;
}


let feedbackCatChatChangedHandler = null;
let feedbackCatEnabledReader = () => true;

export function initFeedbackCatPromptSync(enabledReader = () => true) {
    feedbackCatEnabledReader = typeof enabledReader === 'function' ? enabledReader : () => true;
    if (feedbackCatChatChangedHandler) return;
    feedbackCatChatChangedHandler = () => {
        setTimeout(() => {
            if (feedbackCatEnabledReader()) syncFeedbackCatExtensionPrompt(getActiveFeedbackForCurrentChat());
            else clearFeedbackCatExtensionPrompt();
        }, 0);
    };
    if (eventSource?.on && event_types?.CHAT_CHANGED) {
        eventSource.on(event_types.CHAT_CHANGED, feedbackCatChatChangedHandler);
    }
    if (feedbackCatEnabledReader()) syncFeedbackCatExtensionPrompt(getActiveFeedbackForCurrentChat());
    else clearFeedbackCatExtensionPrompt();
}

export function destroyFeedbackCatPromptSync() {
    if (feedbackCatChatChangedHandler && eventSource?.off && event_types?.CHAT_CHANGED) {
        try { eventSource.off(event_types.CHAT_CHANGED, feedbackCatChatChangedHandler); } catch {}
    }
    feedbackCatChatChangedHandler = null;
    clearFeedbackCatExtensionPrompt();
}

export function clearAllFeedbackCatState() {
    clearFeedbackCatExtensionPrompt();
    const { identity } = readCurrentState();
    if (identity.metadata && typeof identity.metadata === 'object') {
        delete identity.metadata[FEEDBACK_METADATA_KEY];
        saveMetadataSoon(identity.context);
    }
    try {
        localStorage.removeItem(FEEDBACK_STORAGE_KEY);
        localStorage.removeItem(FEEDBACK_PENDING_KEY);
    } catch {}
}
