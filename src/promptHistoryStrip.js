import { rmT as __rmT } from "./textTable.js?rmv=2.6.0";
import { eventSource, event_types } from '../../../../../script.js';
const BLOCK_RE = /<toto\b[^>]*>[\s\S]*?<\/toto>\s*/gi;
const PROTECTED = [[__rmT("GRYgS01FSojlhsFKmKDQ8v_x"), __rmT("GHJQau.QlFtD1_4Ofk3u92Wwfus")], [__rmT("GRYgS01FSojq0bLh6oXIx7SC"), __rmT("pJOFYgVkrYU5K63Ww5bbof5xWY2MJk")]];
function nextProtected(text, from) {
    let best = null;
    for (const [open, close] of PROTECTED) {
        const start = text.indexOf(open, from);
        if (start >= 0 && (!best || start < best.start))
            best = { start, open, close };
    }
    return best;
}
export function stripRabbitMirrorHistoryBlocks(text) {
    if (typeof text !== 'string' || !/<toto\b/i.test(text))
        return text;
    let output = '';
    let index = 0;
    while (index < text.length) {
        const region = nextProtected(text, index);
        if (!region) {
            output += text.slice(index).replace(BLOCK_RE, '');
            break;
        }
        output += text.slice(index, region.start).replace(BLOCK_RE, '');
        const end = text.indexOf(region.close, region.start);
        if (end < 0) {
            output += text.slice(region.start);
            break;
        }
        output += text.slice(region.start, end + region.close.length);
        index = end + region.close.length;
    }
    return output;
}
function stripMessageContent(message) {
    if (!message || typeof message !== 'object')
        return 0;
    if (typeof message.content === 'string') {
        const next = stripRabbitMirrorHistoryBlocks(message.content);
        if (next !== message.content) {
            message.content = next;
            return 1;
        }
        return 0;
    }
    if (Array.isArray(message.content)) {
        let changed = 0;
        for (const part of message.content) {
            if (part && part.type === 'text' && typeof part.text === 'string') {
                const next = stripRabbitMirrorHistoryBlocks(part.text);
                if (next !== part.text) {
                    part.text = next;
                    changed += 1;
                }
            }
        }
        return changed;
    }
    return 0;
}
export function stripChatCompletionHistory(chat) {
    if (!Array.isArray(chat))
        return 0;
    let changed = 0;
    for (const message of chat)
        if (message?.role === 'assistant')
            changed += stripMessageContent(message);
    return changed;
}
let enabledReader = () => true;
let chatHandler = null;
let textHandler = null;
export function initPromptHistoryStrip(isEnabled = () => true) {
    enabledReader = typeof isEnabled === 'function' ? isEnabled : () => true;
    if (chatHandler || textHandler || !eventSource?.on || !event_types)
        return;
    chatHandler = data => {
        try {
            if (enabledReader())
                stripChatCompletionHistory(data?.chat);
        }
        catch (error) {
            console.warn(__rmT("uBV3hMuPX6_qB7kBkMxc2uRza4bURsVKy0mHMOd94y866.PECBOlJuY83xG4tfIdSFVTfRkLXmKqrzTF_vw.STQQ0PxQadeSNGhvXCOJ"), error);
        }
    };
    textHandler = data => {
        try {
            if (enabledReader() && data && typeof data.prompt === 'string')
                data.prompt = stripRabbitMirrorHistoryBlocks(data.prompt);
        }
        catch (error) {
            console.warn(__rmT("uBV3hMuPX6_qB7kBkMxc2uRza4bURsVKy0mHMOd94y866.PECBOlJuY83xG4tfIdSFVTfRkLROHvQSTF_vw.STQQ0PxQadeSNGhvXCOJ"), error);
        }
    };
    if (event_types.CHAT_COMPLETION_PROMPT_READY)
        eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, chatHandler);
    if (event_types.GENERATE_AFTER_COMBINE_PROMPTS)
        eventSource.on(event_types.GENERATE_AFTER_COMBINE_PROMPTS, textHandler);
}
export function destroyPromptHistoryStrip() {
    const remove = (eventSource?.removeListener || eventSource?.off)?.bind(eventSource);
    if (remove) {
        if (chatHandler && event_types?.CHAT_COMPLETION_PROMPT_READY)
            remove(event_types.CHAT_COMPLETION_PROMPT_READY, chatHandler);
        if (textHandler && event_types?.GENERATE_AFTER_COMBINE_PROMPTS)
            remove(event_types.GENERATE_AFTER_COMBINE_PROMPTS, textHandler);
    }
    chatHandler = null;
    textHandler = null;
}
