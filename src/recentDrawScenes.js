import { getCurrentChatKey } from './storage.js?rmv=1.68.11';

// 内置生图：记下这个聊天最近几张真正去画的图画了什么动作（只记一小段英文短标签），
// 下次出镜面时提醒模型换个动作和构图。只在真的发出生图请求时记，读存档、重挂载不记。
const KEY = 'rabbit_mirror_recent_draw_scenes:v1';
const PER_CHAT = 4;
const MAX_CHATS = 12;
const COUNT_TAG = /^(?:\d+\s*(?:boys?|girls?|others?|people|persons?)|solo|duo|couple|multiple (?:boys|girls|people))$/i;

function clean(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }

function asciiShare(text) {
    const letters = text.replace(/[\s,，、.;:'"()\-]/g, '');
    if (!letters) return 0;
    return letters.replace(/[^\x20-\x7e]/g, '').length / letters.length;
}

// 先用图框里的英文短标签；没有时（NAI 4.5 的提示词本身就是标签）用提示词；都不是标签时取开头一小段。
// 人数标签和人物外貌标签去掉，剩下的前几个大多就是动作和场景。
export function drawSceneSummary(frame) {
    if (!frame?.querySelector) return '';
    const tagsNode = frame.querySelector('[data-rm-draw-tags]');
    const promptNode = frame.querySelector('[data-rm-draw-prompt]');
    const prompt = clean(promptNode?.textContent);
    const tagLine = clean(tagsNode?.textContent) || (asciiShare(prompt) > 0.85 && prompt.includes(',') ? prompt : '');
    if (!tagLine) return prompt.slice(0, 40);
    const appearance = new Set();
    for (const node of frame.querySelectorAll('[data-rm-draw-char-tags], [data-rm-draw-char]')) {
        for (const tag of clean(node.textContent).split(/[,，]/)) appearance.add(clean(tag).toLowerCase());
    }
    const tags = tagLine.split(/[,，]/).map(clean)
        .filter(tag => tag && !COUNT_TAG.test(tag) && !appearance.has(tag.toLowerCase()));
    const kept = [];
    for (const tag of tags.slice(0, 5)) {
        if ([...kept, tag].join(', ').length > 80) break;
        kept.push(tag);
    }
    return kept.join(', ');
}

function readAll() {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(KEY) || '{}');
        return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch { return {}; }
}

export function noteRecentDrawScene(frame) {
    try {
        const summary = drawSceneSummary(frame);
        if (summary.length < 3) return false;
        const chatKey = getCurrentChatKey();
        if (!chatKey) return false;
        const all = readAll();
        const list = (Array.isArray(all[chatKey]?.scenes) ? all[chatKey].scenes : []).filter(item => item !== summary);
        list.push(summary);
        all[chatKey] = { scenes: list.slice(-PER_CHAT), ts: Date.now() };
        const keys = Object.keys(all).sort((a, b) => (all[b]?.ts || 0) - (all[a]?.ts || 0));
        for (const key of keys.slice(MAX_CHATS)) delete all[key];
        globalThis.localStorage?.setItem(KEY, JSON.stringify(all));
        return true;
    } catch { return false; }
}

export function recentDrawScenes(limit = 3) {
    try {
        const chatKey = getCurrentChatKey();
        const list = readAll()[chatKey]?.scenes;
        return Array.isArray(list) ? list.filter(item => typeof item === 'string' && item).slice(-limit) : [];
    } catch { return []; }
}
