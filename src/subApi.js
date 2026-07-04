import { getSettings, updateSubApiSettings } from './settings.js';
import { buildStandaloneRabbitHolePrompt } from './promptBuilder.js';

let subApiInitialized = false;
let processing = false;
let lastProcessedSignature = '';
let initialLatestSignature = '';

function getContext() {
    try {
        return globalThis.SillyTavern?.getContext?.() || null;
    } catch {
        return null;
    }
}

function getChat() {
    return getContext()?.chat || [];
}

function getRoleName(message) {
    if (message?.is_user) return '用户';
    if (message?.name) return message.name;
    return 'AI';
}

function stripTotoBlocks(text) {
    return String(text || '').replace(/<toto\b[^>]*>[\s\S]*?<\/toto>\s*/gi, '').trim();
}

function getContextMessageCount(mode) {
    if (mode === 'current_plus_1') return 2;
    if (mode === 'current_plus_3') return 6;
    if (mode === 'current_plus_5') return 10;
    return 0;
}

function buildReferenceContext(chat, assistantIndex, mode) {
    const count = getContextMessageCount(mode);
    if (!count) return '';

    const before = chat.slice(0, assistantIndex).filter(m => typeof m?.mes === 'string' && m.mes.trim());
    const selected = before.slice(-count);
    return selected.map(m => `【${getRoleName(m)}】\n${stripTotoBlocks(m.mes)}`).join('\n\n');
}

function getLatestAssistantIndex() {
    const chat = getChat();
    for (let i = chat.length - 1; i >= 0; i--) {
        const message = chat[i];
        if (!message?.is_user && typeof message?.mes === 'string' && message.mes.trim()) return i;
    }
    return -1;
}

function safeJsonParse(text) {
    try { return JSON.parse(text); } catch { return null; }
}

function normalizeEndpoint(endpoint = '') {
    return String(endpoint || '').trim().replace(/\/+$/, '');
}

function stripKnownOpenAiPath(endpoint) {
    let url = normalizeEndpoint(endpoint);
    url = url.replace(/\/chat\/completions$/i, '');
    url = url.replace(/\/responses$/i, '');
    url = url.replace(/\/models$/i, '');
    return url;
}

function buildOpenAiChatUrl(endpoint) {
    const raw = normalizeEndpoint(endpoint);
    if (/\/chat\/completions$/i.test(raw)) return raw;
    const base = stripKnownOpenAiPath(raw);
    return `${base}/chat/completions`;
}

function buildOpenAiModelsUrl(endpoint) {
    const base = stripKnownOpenAiPath(endpoint);
    return `${base}/models`;
}

function buildAnthropicMessagesUrl(endpoint) {
    const raw = normalizeEndpoint(endpoint);
    if (/\/messages$/i.test(raw)) return raw;
    const base = raw.replace(/\/models$/i, '');
    return `${base}/messages`;
}

function buildAnthropicModelsUrl(endpoint) {
    const raw = normalizeEndpoint(endpoint).replace(/\/messages$/i, '').replace(/\/models$/i, '');
    return `${raw}/models`;
}

function buildGeminiModelsUrl(endpoint, apiKey) {
    const raw = normalizeEndpoint(endpoint || 'https://generativelanguage.googleapis.com/v1beta');
    const base = raw.replace(/\/models\/[^/]+:generateContent$/i, '').replace(/\/models$/i, '').replace(/\:generateContent$/i, '');
    const join = base.includes('?') ? '&' : '?';
    return `${base}/models${apiKey ? `${join}key=${encodeURIComponent(apiKey)}` : ''}`;
}

function buildGeminiGenerateUrl(endpoint, apiKey, model) {
    const raw = normalizeEndpoint(endpoint || 'https://generativelanguage.googleapis.com/v1beta');
    if (/\:generateContent$/i.test(raw)) {
        const join = raw.includes('?') ? '&' : '?';
        return `${raw}${apiKey ? `${join}key=${encodeURIComponent(apiKey)}` : ''}`;
    }
    const base = raw.replace(/\/models$/i, '').replace(/\/models\/[^/]+$/i, '');
    const safeModel = String(model || '').replace(/^models\//, '');
    const join = base.includes('?') ? '&' : '?';
    return `${base}/models/${encodeURIComponent(safeModel)}:generateContent${apiKey ? `${join}key=${encodeURIComponent(apiKey)}` : ''}`;
}

function extractTextFromResponse(apiType, data) {
    if (!data) return '';
    if (apiType === 'gemini') {
        return (data.candidates || [])
            .flatMap(c => c?.content?.parts || [])
            .map(p => p?.text || '')
            .join('\n')
            .trim();
    }
    if (apiType === 'anthropic') {
        if (Array.isArray(data.content)) return data.content.map(x => x?.text || '').join('\n').trim();
        return String(data.completion || data.text || '').trim();
    }
    return String(data.choices?.[0]?.message?.content || data.choices?.[0]?.text || data.output_text || data.content || '').trim();
}

function normalizeTotoOutput(text) {
    let output = String(text || '').trim();
    output = output.replace(/^```(?:html)?\s*/i, '').replace(/```$/i, '').trim();
    const toto = output.match(/<toto\b[^>]*>[\s\S]*?<\/toto>/i)?.[0];
    if (toto) return toto.trim();
    const details = output.match(/<details\b[^>]*>[\s\S]*?<\/details>/i)?.[0];
    if (details) return `<toto data-rabbit-hole="true" style="display:block;">\n${details.trim()}\n</toto>`;
    return `<toto data-rabbit-hole="true" style="display:block;">\n<details><summary>【兔子洞：副 API 小剧场】</summary>${output}</details>\n</toto>`;
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const text = await response.text();
    const data = safeJsonParse(text);
    if (!response.ok) {
        const message = data?.error?.message || data?.message || text || `${response.status} ${response.statusText}`;
        throw new Error(message);
    }
    return data ?? text;
}

export async function fetchSubApiModels(settings = getSettings()) {
    const sub = settings.subApi || {};
    const apiType = sub.apiType || 'openai';
    const endpoint = normalizeEndpoint(sub.endpoint);
    const apiKey = sub.apiKey || '';
    if (!endpoint && apiType !== 'gemini') throw new Error('请先填写副 API 地址');

    if (apiType === 'gemini') {
        const data = await fetchJson(buildGeminiModelsUrl(endpoint, apiKey), { method: 'GET' });
        return (data.models || []).map(m => m.name || m.id).filter(Boolean);
    }

    if (apiType === 'anthropic') {
        const data = await fetchJson(buildAnthropicModelsUrl(endpoint), {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'accept': 'application/json',
            },
        });
        return (data.data || data.models || []).map(m => m.id || m.name).filter(Boolean);
    }

    const data = await fetchJson(buildOpenAiModelsUrl(endpoint), {
        method: 'GET',
        headers: {
            'Authorization': apiKey ? `Bearer ${apiKey}` : '',
            'accept': 'application/json',
        },
    });
    return (data.data || data.models || []).map(m => m.id || m.name).filter(Boolean);
}

export async function callSubApi(prompt, settings = getSettings()) {
    const sub = settings.subApi || {};
    const apiType = sub.apiType || 'openai';
    const endpoint = normalizeEndpoint(sub.endpoint);
    const apiKey = sub.apiKey || '';
    const model = String(sub.model || '').trim();
    const temperature = Number(sub.temperature ?? 0.95);
    const maxTokens = Math.floor(Number(sub.maxTokens) || 16000);

    if (!model) throw new Error('请填写副 API 模型名');
    if (!endpoint && apiType !== 'gemini') throw new Error('请填写副 API 地址');

    if (apiType === 'gemini') {
        const data = await fetchJson(buildGeminiGenerateUrl(endpoint, apiKey, model), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature, maxOutputTokens: maxTokens },
            }),
        });
        return normalizeTotoOutput(extractTextFromResponse(apiType, data));
    }

    if (apiType === 'anthropic') {
        const data = await fetchJson(buildAnthropicMessagesUrl(endpoint), {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model,
                max_tokens: maxTokens,
                temperature,
                messages: [{ role: 'user', content: prompt }],
            }),
        });
        return normalizeTotoOutput(extractTextFromResponse(apiType, data));
    }

    const data = await fetchJson(buildOpenAiChatUrl(endpoint), {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'authorization': apiKey ? `Bearer ${apiKey}` : '',
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: maxTokens,
        }),
    });
    return normalizeTotoOutput(extractTextFromResponse(apiType, data));
}

function markMessageSaved() {
    const context = getContext();
    try { context?.saveChat?.(); } catch {}
    try { context?.saveChatConditional?.(); } catch {}
    try { globalThis.saveChatConditional?.(); } catch {}
}

function refreshChatView(index) {
    const context = getContext();
    try { context?.eventSource?.emit?.(context?.event_types?.MESSAGE_UPDATED, index); } catch {}
    try { context?.reloadCurrentChat?.(); } catch {}
}

export async function generateRabbitHoleForLatestMessage() {
    const settings = getSettings();
    if (!settings.enabled || settings.mode === 'off' || settings.generationMode !== 'sub_api') return;
    if (processing) return;

    const chat = getChat();
    const index = getLatestAssistantIndex();
    if (index < 0) return;

    const message = chat[index];
    if (!message?.mes || /<toto\b/i.test(message.mes) || /rabbit-hole-subapi-done/.test(message.mes)) return;

    const assistantText = stripTotoBlocks(message.mes);
    const signature = `${index}|${assistantText.slice(-500)}`;
    if (signature === initialLatestSignature) return;
    if (lastProcessedSignature === signature) return;

    const contextText = buildReferenceContext(chat, index, settings.subApi?.contextMode || 'current_plus_5');
    const prompt = buildStandaloneRabbitHolePrompt(settings, { assistantText, contextText }, 'sub_api');
    if (!prompt) return;

    processing = true;
    lastProcessedSignature = signature;
    try {
        const toto = await callSubApi(prompt, settings);
        if (!toto) throw new Error('副 API 未返回内容');
        message.mes = `${assistantText}\n\n<!-- rabbit-hole-subapi-done -->\n${toto}`;
        markMessageSaved();
        refreshChatView(index);
        if (settings.debug) console.debug('[RabbitHole] sub API appended toto to message', index);
    } catch (error) {
        console.warn('[RabbitHole] sub API generation failed:', error);
        toastr?.error?.(`兔子洞副 API 生成失败：${error.message || error}`);
        lastProcessedSignature = '';
    } finally {
        processing = false;
    }
}

export function initSubApiGenerator() {
    if (subApiInitialized) return;
    subApiInitialized = true;

    const context = getContext();
    const initialIndex = getLatestAssistantIndex();
    if (initialIndex >= 0) {
        const initialMessage = getChat()[initialIndex];
        initialLatestSignature = `${initialIndex}|${stripTotoBlocks(initialMessage?.mes || '').slice(-500)}`;
    }
    const eventSource = context?.eventSource;
    const eventTypes = context?.event_types || {};

    const handler = () => setTimeout(() => generateRabbitHoleForLatestMessage(), 250);
    const candidates = [
        eventTypes.MESSAGE_RECEIVED,
        eventTypes.MESSAGE_UPDATED,
        eventTypes.GENERATION_ENDED,
        eventTypes.GENERATION_STOPPED,
    ].filter(Boolean);

    if (eventSource?.on && candidates.length) {
        for (const eventName of [...new Set(candidates)]) {
            try { eventSource.on(eventName, handler); } catch {}
        }
    }

    // 兜底：部分环境事件名不同，使用轻量轮询检查新 assistant 消息。
    setInterval(() => {
        const settings = getSettings();
        if (settings.enabled && settings.generationMode === 'sub_api') handler();
    }, 3000);
}

export function saveFetchedModel(model) {
    updateSubApiSettings({ model });
}
