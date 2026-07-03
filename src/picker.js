import { THEMATIC_CATEGORIES } from '../data/structured/thematicIndex.js';
import { PRESENTATION_FORMATS } from '../data/structured/presentationIndex.js';
import { getLastCombo, getRecentIds, setLastCombo } from './storage.js';

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

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function weightedThemeCount(settings) {
    const min = Number(settings.themesMin) || 1;
    const max = Number(settings.themesMax) || 3;
    const r = Math.random();
    const count = r < 0.75 ? 1 : r < 0.97 ? 2 : 3;
    return clamp(count, min, max);
}

function weightedFormatCount(settings) {
    const min = Number(settings.formatsMin) || 1;
    const max = Number(settings.formatsMax) || 2;
    const count = Math.random() < 0.85 ? 1 : 2;
    return clamp(count, min, max);
}


const DESIGN_CONSTRUCTS = [
    '分屏双栏', '纵向时间轴', '横向票根', '手机界面', '网格相册', '舞台分镜',
    '圆形仪表', '文件夹标签', '播放器界面', '地图坐标', '桌面小组件', '信纸便签',
    '棋盘格', '牌阵星图', '弹幕浮层', '购物票据', '直播面板', '游戏结算',
    '报刊版面', '霓虹招牌', '折叠抽屉', '层叠卡片'
];

const DESIGN_PALETTES = [
    '暖灯琥珀', '雾蓝银灰', '樱桃奶油', '雨夜霓虹', '旧纸焦糖', '月白墨黑',
    '薄荷玻璃', '玫瑰铜金', '深海孔雀', '黄昏橙紫', '森绿苔藓', '雪夜淡青',
    '莓果酒红', '鸢尾紫灰', '沙丘米金', '电光蓝粉', '烟熏茶色', '黑金剧院'
];

const DESIGN_ANCHORS = [
    '标题牌', '状态栏', '印章', '进度条', '牌面', '缩略图', '弹幕层', '票根',
    '便签', '相册格', '坐标轴', '菜单栏', '播放器', '章节条', '光斑', '剪影',
    '分隔线', '徽章', '时间码', '小地图', '仪表盘', '标签云'
];

function pickDesignSignature(recent = {}) {
    const usedIds = new Set(recent?.designIds || []);
    const usedConstructs = new Set(recent?.designConstructs || []);
    const usedPalettes = new Set(recent?.designPalettes || []);
    const usedAnchors = new Set(recent?.designAnchors || []);

    const constructs = DESIGN_CONSTRUCTS.filter(x => !usedConstructs.has(x));
    const palettes = DESIGN_PALETTES.filter(x => !usedPalettes.has(x));
    const anchors = DESIGN_ANCHORS.filter(x => !usedAnchors.has(x));

    const constructPool = constructs.length ? constructs : DESIGN_CONSTRUCTS;
    const palettePool = palettes.length ? palettes : DESIGN_PALETTES;
    const anchorPool = anchors.length ? anchors : DESIGN_ANCHORS;

    const attempts = [];
    for (const construct of shuffle(constructPool)) {
        for (const palette of shuffle(palettePool)) {
            for (const anchor of shuffle(anchorPool)) {
                const id = `${construct}|${palette}|${anchor}`;
                const concept = `${construct}；${palette}；${anchor}；根据本轮展现形式调整文本密度与阅读节奏`;
                attempts.push({ id, construct, palette, anchor, concept });
                if (!usedIds.has(id)) return { id, construct, palette, anchor, concept };
            }
        }
    }
    const fallback = attempts[0] || { id: 'fallback', construct: '自适应分区界面', palette: '柔和中性色', anchor: '标题牌' };
    return { ...fallback, concept: fallback.concept || `${fallback.construct}；${fallback.palette}；${fallback.anchor}；根据本轮展现形式调整文本密度与阅读节奏` };
}

function isRichPresentation(item) {
    const tags = new Set(item?.tags || []);
    const text = `${item?.id || ''} ${item?.title || ''} ${item?.summary || ''} ${item?.raw || ''}`;
    if ([...tags].some(tag => ['visual', 'digital', 'interactive', 'game', 'mysticism', 'media'].includes(tag))) return true;
    return /(界面|接口|面板|图|图表|时间轴|票据|相册|壁纸|直播|弹幕|游戏|抽卡|牌阵|星盘|命盘|黄历|符咒|视觉|可视化|Scenery|播放器|排行榜|审批|日历|Bingo|四格|分镜|海报|菜单|小组件|票根|坐标)/i.test(text);
}

function enrichFormatPool(pool, settings, count) {
    if (!settings?.richFormatBias) return pool;
    const rich = pool.filter(isRichPresentation);
    if (rich.length >= Math.min(count, 1)) {
        // 重复几次富版式候选，提高抽中概率，但不完全排除文学/信件等文本美学格式。
        return [...rich, ...rich, ...pool];
    }
    return pool;
}

function allowByMode(_item, mode) {
    if (mode === 'off') return false;
    return true;
}

function weightedSample(pool, count, recentIds = [], recentGroups = [], avoidRepeat = true) {
    const recent = new Set(recentIds || []);
    const groups = new Set(recentGroups || []);
    let candidates = [...pool];

    // 完全相同子项优先从候选池中移除；候选不足时才回退。
    if (avoidRepeat) {
        const filtered = candidates.filter(x => !recent.has(x.id));
        if (filtered.length >= count) candidates = filtered;
    }

    const selected = [];
    const used = new Set();
    while (selected.length < count && used.size < candidates.length) {
        const weighted = candidates
            .filter(item => !used.has(item.id))
            .map(item => {
                let weight = 1;
                // 最近 10 轮同父类不绝对禁止，只降权，让随机更丰富但不容易疲劳。
                if (avoidRepeat && groups.has(item.group)) weight *= 0.35;
                // 很久没出现的项目保留基础权重，避免总是抽到熟悉格式。
                return { item, weight };
            });
        const total = weighted.reduce((sum, x) => sum + x.weight, 0);
        let roll = Math.random() * total;
        let chosen = weighted[weighted.length - 1]?.item;
        for (const entry of weighted) {
            roll -= entry.weight;
            if (roll <= 0) {
                chosen = entry.item;
                break;
            }
        }
        if (!chosen) break;
        selected.push(chosen);
        used.add(chosen.id);
    }
    return selected.length ? selected : shuffle(candidates).slice(0, Math.max(1, Math.min(count, candidates.length)));
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
    if (!message || !/(兔子洞|小剧场)/.test(message)) return null;

    if (/((?:兔子洞|小剧场)\s*(关闭|关掉|不要|禁用|停止|off)|不要\s*(?:兔子洞|小剧场)|关闭\s*(?:兔子洞|小剧场)|本轮不(?:要|用)\s*(?:兔子洞|小剧场))/i.test(message)) {
        return { disabled: true, reason: '用户正文指令关闭本轮兔子洞' };
    }

    const themeTexts = extractAfterPatterns(message, [
        '(?:兔子洞|小剧场)(?:主题|元素|题材|theme)\s*[:：]\s*([^\n。；;]+)',
    ]);
    const formatTexts = extractAfterPatterns(message, [
        '(?:兔子洞|小剧场)(?:展现形式|展示形式|表现形式|格式|形式|format|ui|UI)\s*[:：]\s*([^\n。；;]+)',
    ]);
    const generalTexts = extractAfterPatterns(message, [
        '(?:兔子洞|小剧场)\s*[:：]\s*([^\n。；;]+)',
        '(?:兔子洞|小剧场)\s*(?:想看|想要|来|要|指定|换成)\s*([^\n。；;]+)',
        '(?:下一个|下次|这次|本轮)?\s*(?:兔子洞|小剧场)\s*(?:想看|想要|来|要|指定|换成)\s*([^\n。；;]+)',
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

function getVisualSceneryFormat() {
    return PRESENTATION_FORMATS.find(item => item.id === '10.2.2' || normalizeText(item.title) === normalizeText('Visual Scenery')) || null;
}

function applyDirectiveOrRandom({ settings, themePool, formatPool, themeCount, formatCount, last, recent }) {
    const directive = settings.userDirectivePriority ? parseUserDirective(getLastUserMessage()) : null;
    if (directive?.disabled) {
        return { disabled: true, directive };
    }

    const pickedThemes = weightedSample(themePool, themeCount, recent.themeIds, recent.themeGroups, settings.avoidRepeat);
    const weightedFormatPool = enrichFormatPool(formatPool, settings, formatCount);
    const pickedFormats = weightedSample(weightedFormatPool, formatCount, recent.formatIds, recent.formatGroups, settings.avoidRepeat);
    const visualSceneryFormat = getVisualSceneryFormat();
    const forcedFormats = settings.forceVisualScenery && visualSceneryFormat ? [visualSceneryFormat] : [];
    const directiveFormats = directive?.formats || [];
    const directiveWantsVisualScenery = directiveFormats.some(item => item?.id === '10.2.2');

    const formatOnly = settings.samplingMode === 'format_only';
    const themes = formatOnly
        ? []
        : uniqueById([...(directive?.themes || []), ...pickedThemes]).slice(0, Math.max(themeCount, directive?.themes?.length || 0));

    let formats;
    if (forcedFormats.length) {
        // Visual Scenery 动态模式开启时，展现形式锁定为 10.2.2；是否抽主题由抽取模式决定。
        formats = forcedFormats;
    } else if (directiveWantsVisualScenery) {
        // 用户正文明确指定 Visual Scenery 时，也让它成为本轮核心展现形式，避免被随机格式稀释。
        formats = uniqueById(directiveFormats);
    } else {
        formats = uniqueById([...directiveFormats, ...pickedFormats]).slice(0, Math.max(formatCount, directiveFormats.length));
    }

    return { themes, formats, directive, forcedFormats };
}

export function pickCombination(settings) {
    const last = getLastCombo();
    const recent = getRecentIds(settings.cooldownRounds || 10);
    const themeCount = weightedThemeCount(settings);
    const formatCount = weightedFormatCount(settings);

    let themePool = THEMATIC_CATEGORIES.filter(item => allowByMode(item, settings.mode));
    let formatPool = PRESENTATION_FORMATS.filter(item => allowByMode(item, settings.mode));

    if (!themePool.length) themePool = THEMATIC_CATEGORIES;
    if (!formatPool.length) formatPool = PRESENTATION_FORMATS;

    const result = applyDirectiveOrRandom({ settings, themePool, formatPool, themeCount, formatCount, last, recent });
    if (result.disabled) {
        return { disabled: true, directive: result.directive, combo: null, last };
    }

    const combo = {
        themes: result.themes,
        formats: result.formats,
        themeIds: result.themes.map(x => x.id),
        formatIds: result.formats.map(x => x.id),
        themeGroups: result.themes.map(x => x.group).filter(Boolean),
        formatGroups: result.formats.map(x => x.group).filter(Boolean),
        mode: settings.mode,
        samplingMode: settings.samplingMode || 'classic',
        directive: result.directive || null,
        forcedVisualScenery: !!settings.forceVisualScenery,
        cooldownRounds: settings.cooldownRounds || 10,
        design: pickDesignSignature(recent),
        recentUiBeautyConcepts: recent.designConcepts || [],
    };

    setLastCombo(combo);
    return { combo, last, directive: result.directive || null };
}
