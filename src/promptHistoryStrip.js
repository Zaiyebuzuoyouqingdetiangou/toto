// 发送前去掉聊天记录里的旧兔子镜：和「不发送兔子镜」正则做同一件事，但不依赖用户去配正则。
// 只动聊天记录里模型写过的旧 <toto>…</toto>；本轮兔子镜的注入说明（里面也写着 <toto> 外壳示例）
// 和近输出短锁原样保留。跟随正文时，本轮要求模型写新兔子镜的注入不受影响，模型照常写。
import { eventSource, event_types } from '../../../../../script.js';

const BLOCK_RE = /<toto\b[^>]*>[\s\S]*?<\/toto>\s*/gi;
// 兔子镜自己写进提示词的段落：里面的 <toto> 是格式示例，不是旧镜面，绝不能删。
const PROTECTED = [['<兔子镜自动注入>', '</兔子镜自动注入>'], ['<兔子镜近输出短锁', '</兔子镜近输出短锁>']];

function nextProtected(text, from) {
    let best = null;
    for (const [open, close] of PROTECTED) {
        const start = text.indexOf(open, from);
        if (start >= 0 && (!best || start < best.start)) best = { start, open, close };
    }
    return best;
}

export function stripRabbitMirrorHistoryBlocks(text) {
    if (typeof text !== 'string' || !/<toto\b/i.test(text)) return text;
    let output = '';
    let index = 0;
    while (index < text.length) {
        const region = nextProtected(text, index);
        if (!region) { output += text.slice(index).replace(BLOCK_RE, ''); break; }
        output += text.slice(index, region.start).replace(BLOCK_RE, '');
        const end = text.indexOf(region.close, region.start);
        if (end < 0) { output += text.slice(region.start); break; }
        output += text.slice(region.start, end + region.close.length);
        index = end + region.close.length;
    }
    return output;
}

function stripMessageContent(message) {
    if (!message || typeof message !== 'object') return 0;
    if (typeof message.content === 'string') {
        const next = stripRabbitMirrorHistoryBlocks(message.content);
        if (next !== message.content) { message.content = next; return 1; }
        return 0;
    }
    if (Array.isArray(message.content)) {
        let changed = 0;
        for (const part of message.content) {
            if (part && part.type === 'text' && typeof part.text === 'string') {
                const next = stripRabbitMirrorHistoryBlocks(part.text);
                if (next !== part.text) { part.text = next; changed += 1; }
            }
        }
        return changed;
    }
    return 0;
}

// 聊天补全：只处理模型写过的消息（assistant），和正则「AI 输出、仅提示词」的范围一致。
export function stripChatCompletionHistory(chat) {
    if (!Array.isArray(chat)) return 0;
    let changed = 0;
    for (const message of chat) if (message?.role === 'assistant') changed += stripMessageContent(message);
    return changed;
}

let enabledReader = () => true;
let chatHandler = null;
let textHandler = null;

export function initPromptHistoryStrip(isEnabled = () => true) {
    enabledReader = typeof isEnabled === 'function' ? isEnabled : () => true;
    if (chatHandler || textHandler || !eventSource?.on || !event_types) return;
    chatHandler = data => {
        try { if (enabledReader()) stripChatCompletionHistory(data?.chat); }
        catch (error) { console.warn('[RabbitMirror] 发送前去掉旧兔子镜失败（聊天补全），本轮照常发送', error); }
    };
    textHandler = data => {
        try { if (enabledReader() && data && typeof data.prompt === 'string') data.prompt = stripRabbitMirrorHistoryBlocks(data.prompt); }
        catch (error) { console.warn('[RabbitMirror] 发送前去掉旧兔子镜失败（文本补全），本轮照常发送', error); }
    };
    if (event_types.CHAT_COMPLETION_PROMPT_READY) eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, chatHandler);
    if (event_types.GENERATE_AFTER_COMBINE_PROMPTS) eventSource.on(event_types.GENERATE_AFTER_COMBINE_PROMPTS, textHandler);
}

export function destroyPromptHistoryStrip() {
    const remove = (eventSource?.removeListener || eventSource?.off)?.bind(eventSource);
    if (remove) {
        if (chatHandler && event_types?.CHAT_COMPLETION_PROMPT_READY) remove(event_types.CHAT_COMPLETION_PROMPT_READY, chatHandler);
        if (textHandler && event_types?.GENERATE_AFTER_COMBINE_PROMPTS) remove(event_types.GENERATE_AFTER_COMBINE_PROMPTS, textHandler);
    }
    chatHandler = null;
    textHandler = null;
}
