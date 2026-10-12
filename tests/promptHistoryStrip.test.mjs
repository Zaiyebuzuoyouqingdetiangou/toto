import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createRuntime, createStore } from './helpers/vmLoader.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const old = '<toto data-rabbit-mirror="true"><details><summary>【兔子镜：旧的】</summary><div>旧内容</div></details></toto>\n';
const injection = '<兔子镜自动注入>\n  - 固定外壳：<toto data-rabbit-mirror="true" style="display:block;"><details><summary>【兔子镜：中文短标题】</summary>内部 HTML</details></toto>\n直接输出唯一完整 <toto>...</toto>，闭合后结束。\n</兔子镜自动注入>';

async function load() {
    const runtime = createRuntime(root, { store: createStore() });
    return { strip: await runtime.load('src/promptHistoryStrip.js') };
}

test('old mirrors are removed but the injected instructions keep their <toto> examples', async () => {
    const { strip } = await load();
    const text = `正文一。\n${old}正文二。\n${injection}\n正文三${old}`;
    const result = strip.stripRabbitMirrorHistoryBlocks(text);
    assert.doesNotMatch(result, /旧内容/);
    assert.ok(result.includes(injection), 'injection block untouched');
    assert.match(result, /正文一。[\s\S]*正文二。[\s\S]*正文三/);
    assert.equal(strip.stripRabbitMirrorHistoryBlocks('没有镜面'), '没有镜面');
});

test('chat completion: only assistant history is cleaned; system/user and an assistant-role injection stay', async () => {
    const { strip } = await load();
    const chat = [
        { role: 'system', content: injection },
        { role: 'user', content: `我贴一段：${old}` },
        { role: 'assistant', content: `回复正文${old}` },
        { role: 'assistant', content: [{ type: 'text', text: `多模态${old}` }, { type: 'image_url', image_url: { url: 'x' } }] },
        { role: 'assistant', content: injection },
    ];
    assert.equal(strip.stripChatCompletionHistory(chat), 2);
    assert.equal(chat[0].content, injection);
    assert.match(chat[1].content, /旧内容/, 'user text untouched (same as the regex: AI output only)');
    assert.equal(chat[2].content, '回复正文');
    assert.equal(chat[3].content[0].text, '多模态');
    assert.equal(chat[4].content, injection, 'assistant-role injection kept');
});

test('events: enabled setting strips before sending, disabled leaves the prompt alone', async () => {
    const runtime = createRuntime(root, { store: createStore() });
    const strip = await runtime.load('src/promptHistoryStrip.js');
    const { eventSource, event_types } = await runtime.load('tests/helpers/hostEvents.mjs');
    let enabled = true;
    strip.initPromptHistoryStrip(() => enabled);
    const chat = { chat: [{ role: 'assistant', content: `a${old}` }] };
    const text = { prompt: `b${old}${injection}` };
    await eventSource.emit(event_types.CHAT_COMPLETION_PROMPT_READY, chat);
    await eventSource.emit(event_types.GENERATE_AFTER_COMBINE_PROMPTS, text);
    assert.equal(chat.chat[0].content, 'a');
    assert.equal(text.prompt, `b${injection}`);
    enabled = false;
    const kept = { chat: [{ role: 'assistant', content: `c${old}` }] };
    await eventSource.emit(event_types.CHAT_COMPLETION_PROMPT_READY, kept);
    assert.match(kept.chat[0].content, /旧内容/);
    strip.destroyPromptHistoryStrip();
    enabled = true;
    const after = { chat: [{ role: 'assistant', content: `d${old}` }] };
    await eventSource.emit(event_types.CHAT_COMPLETION_PROMPT_READY, after);
    assert.match(after.chat[0].content, /旧内容/, 'no listener after destroy');
});
