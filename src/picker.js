import { THEMATIC_CATEGORIES } from '../data/structured/thematicIndex.js';
import { PRESENTATION_FORMATS } from '../data/structured/presentationIndex.js';
import { getLastCombo, setLastCombo } from './storage.js';

function randomInt(min, max) {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return Math.floor(Math.random() * (high - low + 1)) + low;
}

function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function allowByMode(_item, mode) {
    if (mode === 'off') return false;
    return true;
}

function pickMany(pool, count, lastIds = [], avoidRepeat = true) {
    const last = new Set(lastIds || []);
    let candidates = pool;
    if (avoidRepeat) {
        const filtered = candidates.filter(x => !last.has(x.id));
        if (filtered.length >= count) candidates = filtered;
    }
    return shuffle(candidates).slice(0, Math.max(1, Math.min(count, candidates.length)));
}

function getLastUserMessage() {
    try {
        const context = SillyTavern?.getContext?.();
        const chat = context?.chat || [];
        const lastUser = [...chat].reverse().find(m => m?.is_user && typeof m?.mes === 'string');
        return lastUser?.mes || '';
    } catch (_error) {
        return '';
    }
}

function normalizeText(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[\s`*_【】\[\]（）()「」『』:：,，.。;；/\\|+\-—_]/g, '');
}

function splitDirectiveText(text) {
    return String(text || '')
        .replace(/\s+/g, ' ')
        .split(/[+＋、,，;；\n]/)
        .map(x => x.trim())
        .filter(Boolean);
}

function itemHaystack(item) {
    return normalizeText([
        item.id,
        item.title,
        item.summary,
        item.raw,
        ...(item.tags || []),
    ].join(' '));
}

function matchOne(pool, query) {
    const q = normalizeText(query);
    if (!q) return null;

    let best = null;
    let bestScore = 0;
    for (const item of pool) {
        const id = normalizeText(item.id);
        const title = normalizeText(item.title);
        const summary = normalizeText(item.summary);
        const raw = normalizeText(item.raw);
        const haystack = itemHaystack(item);

        let score = 0;
        if (id === q) score = 100;
        else if (title === q) score = 95;
        else if (id.includes(q) || q.includes(id)) score = Math.max(score, 80);
        else if (title.includes(q) || q.includes(title)) score = Math.max(score, 75);
        else if (summary.includes(q)) score = Math.max(score, 55);
        else if (raw.includes(q)) score = Math.max(score, 50);
        else if (haystack.includes(q)) score = Math.max(score, 40);

        if (score > bestScore) {
            best = item;
            bestScore = score;
        }
    }
    return bestScore >= 40 ? best : null;
}

function uniqueById(items) {
    const seen = new Set();
    const result = [];
    for (const item of items) {
        if (!item || seen.has(item.id)) continue;
        seen.add(item.id);
        result.push(item);
    }
    return result;
}

function extractAfterPatterns(message, patterns) {
    const results = [];
    for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'ig');
        let match;
        while ((match = regex.exec(message)) !== null) {
            const value = (match[1] || '').trim();
            if (value) results.push(value);
        }
    }
    return results;
}

function parseUserDirective(message) {
    if (!message || !/兔子洞/.test(message)) return null;

    if (/(兔子洞\s*(关闭|关掉|不要|禁用|停止|off)|不要\s*兔子洞|关闭\s*兔子洞|本轮不(?:要|用)\s*兔子洞)/i.test(message)) {
        return { disabled: true, reason: '用户正文指令关闭本轮兔子洞' };
    }

    const themeTexts = extractAfterPatterns(message, [
        '兔子洞(?:主题|元素|题材|theme)\s*[:：]\s*([^\n。；;]+)',
    ]);
    const formatTexts = extractAfterPatterns(message, [
        '兔子洞(?:展现形式|展示形式|表现形式|格式|形式|format|ui|UI)\s*[:：]\s*([^\n。；;]+)',
    ]);
    const generalTexts = extractAfterPatterns(message, [
        '兔子洞\s*[:：]\s*([^\n。；;]+)',
    ]).filter(x => !/^(主题|元素|题材|展现形式|展示形式|表现形式|格式|形式)\s*[:：]/.test(x));

    const themeQueries = splitDirectiveText(themeTexts.join('、'));
    const formatQueries = splitDirectiveText(formatTexts.join('、'));
    const generalQueries = splitDirectiveText(generalTexts.join('、'));

    const themes = [];
    const formats = [];

    for (const query of themeQueries) {
        const matched = matchOne(THEMATIC_CATEGORIES, query);
        if (matched) themes.push(matched);
    }
    for (const query of formatQueries) {
        const matched = matchOne(PRESENTATION_FORMATS, query);
        if (matched) formats.push(matched);
    }
    for (const query of generalQueries) {
        const format = matchOne(PRESENTATION_FORMATS, query);
        const theme = matchOne(THEMATIC_CATEGORIES, query);
        // 一般“兔子洞：xxx”里，像法甜剖面图/短信体更常是展现形式；两边都能匹配时都保留。
        if (format) formats.push(format);
        if (theme) themes.push(theme);
    }

    const uniqueThemes = uniqueById(themes);
    const uniqueFormats = uniqueById(formats);
    if (!uniqueThemes.length && !uniqueFormats.length) return null;

    return {
        disabled: false,
        themes: uniqueThemes,
        formats: uniqueFormats,
        source: '最后一条用户消息中的兔子洞正文指令',
        raw: message,
    };
}

function applyDirectiveOrRandom({ settings, themePool, formatPool, themeCount, formatCount, last }) {
    const directive = settings.userDirectivePriority ? parseUserDirective(getLastUserMessage()) : null;
    if (directive?.disabled) {
        return { disabled: true, directive };
    }

    const pickedThemes = pickMany(themePool, themeCount, last.themeIds, settings.avoidRepeat);
    const pickedFormats = pickMany(formatPool, formatCount, last.formatIds, settings.avoidRepeat);

    const themes = uniqueById([...(directive?.themes || []), ...pickedThemes]).slice(0, Math.max(themeCount, directive?.themes?.length || 0));
    const formats = uniqueById([...(directive?.formats || []), ...pickedFormats]).slice(0, Math.max(formatCount, directive?.formats?.length || 0));

    return { themes, formats, directive };
}

export function pickCombination(settings) {
    const last = getLastCombo();
    const themeCount = randomInt(settings.themesMin, settings.themesMax);
    const formatCount = randomInt(settings.formatsMin, settings.formatsMax);

    let themePool = THEMATIC_CATEGORIES.filter(item => allowByMode(item, settings.mode));
    let formatPool = PRESENTATION_FORMATS.filter(item => allowByMode(item, settings.mode));

    if (!themePool.length) themePool = THEMATIC_CATEGORIES;
    if (!formatPool.length) formatPool = PRESENTATION_FORMATS;

    const result = applyDirectiveOrRandom({ settings, themePool, formatPool, themeCount, formatCount, last });
    if (result.disabled) {
        return { disabled: true, directive: result.directive, combo: null, last };
    }

    const combo = {
        themes: result.themes,
        formats: result.formats,
        themeIds: result.themes.map(x => x.id),
        formatIds: result.formats.map(x => x.id),
        mode: settings.mode,
        directive: result.directive || null,
    };

    setLastCombo(combo);
    return { combo, last, directive: result.directive || null };
}
