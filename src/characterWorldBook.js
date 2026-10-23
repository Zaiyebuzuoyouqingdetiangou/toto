function text(value) { return typeof value === 'string' ? value : ''; }

// 世界书条目标题里的分类词：不当人名用。
const TITLE_NOISE = /^(?:角色|人物|人设|设定|主角|配角|男主|女主|NPC|npc|外貌|外观|长相|形象|资料|档案|简介|介绍|背景|世界观|关系|性格|服装|衣着|条目|常驻|蓝灯|绿灯|其他|补充|详细|基础|基本|地点|地图|规则|组织|势力|剧情|物品|道具|时间|事件)+$/;
// 写了长相的条目才是人物外貌资料。
// 皮肤、眼睛、痣疤、身材、脸这些单独成句的（「皮肤雪白」「眼睛浅粉」「眼下一颗泪痣」）也算。
// 「脸红了」「眼睛一亮」「那道疤是小时候留下的」这类剧情句不算：眼睛要带颜色，脸只认面容、五官这类说法。
// 「碧眼」这类只认不会是剧情的颜色（「白眼一翻」「红眼了」「黑眼圈」不算）；「眉眼弯弯地笑」「方脸的掌柜」这类不收。
const APPEARANCE_WORDS = /[金银蓝碧绿紫琥翠灰褐]眼(?![圈镜神眶角])|鹅蛋脸|瓜子脸|鼻梁高|高鼻梁|发色|头发|[长短直卷]发|发型|发丝|马尾|[黑白银金红棕灰紫蓝粉]发|瞳|眸|眼睛(?:是|呈|为)?(?:[^，,。；;]{0,3}色|[浅深淡暗乌漆]?[黑白银金红棕灰紫蓝粉绿褐赤青碧琥乌])|色的?[大圆细长]?眼睛|身高|身材|体型|身形|外貌|长相|容貌|相貌|五官|面容|肤色|皮肤|肌肤|白皙|痣|疤痕|伤疤|雀斑|胎记|纹身|刺青|hair|eyes|skin|complexion|mole|freckle|tattoo|birthmark/i;

// 只取资料明确声明的性别，不从名字、称谓、关系、喜好或服装推断。
// 保留跨性别/非二元等原文；同一来源的身份和出生登记说明不互相改写。
const GENDER_IDENTITY = '(?:(?:跨性别|跨性別)?(?:男性|女性|男人|女人|男孩子?|女孩子?)|非二元(?:性别|性別)?者?|无性别|性别流动|non[- ]?binary|agender|genderfluid|(?:trans(?:gender)?\\s+)?(?:male|female|man|woman|boy|girl))';
const SCAN_APPEARANCE_WORDS = new RegExp(`${APPEARANCE_WORDS.source}|${GENDER_IDENTITY}|性别|性別|\\bgender\\b`, 'i');
// 只认完整、肯定的本人声明，不在任意句中找「是女性」或删掉所有 female。
// 「她可能是女性」「她的哥哥是男性」「女性的制服」都保留原文，也不占本人性别项。
// 返回整段声明范围，让识别和冲突剥离共用同一边界；不确定的语法宁可不处理。
export function explicitGenderStatements(value, name = '') {
    const source = text(value);
    const named = text(name).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const zhSubject = `(?:${named ? `${named}|` : ''}他|她|本人|此人|该角色|該角色)`;
    const enSubject = `(?:${named ? `${named}|` : ''}he|she|they|I|the character)`;
    const identity = `(?:${GENDER_IDENTITY}|(?:性别|性別)\\s*[:：=]?\\s*(?:${GENDER_IDENTITY}|男|女)|gender(?:\\s+identity)?\\s*(?:[:=]|is)\\s*${GENDER_IDENTITY}|${zhSubject}\\s*(?:是|为|為)(?:一[位名个個])?\\s*${GENDER_IDENTITY}|${enSubject}\\s+(?:is|am|identifies\\s+as)\\s+(?:an?\\s+)?${GENDER_IDENTITY}${named ? `|${named}\\s*[:：]\\s*${GENDER_IDENTITY}` : ''})`;
    // 出生登记是原文背景，不单独声明当前身份；同一来源另有身份声明时一并保留。
    const birth = `(?:出生时(?:被)?(?:登记|指定|指派)为(?:男性|女性|男|女)|(?:${enSubject}\\s+was\\s+)?assigned\\s+(?:male|female)\\s+at\\s+birth)`;
    const boundary = '(^|[，,、。；;！!？?\\n]|\\.\\s+)[ \\t]*';
    const end = '(?=[ \\t]*(?:$|[，,、。；;！!？?\\n]|\\.(?:\\s|$)))';
    const spans = [];
    for (const [kind, pattern] of [['identity', identity], ['birth', birth]]) {
        const re = new RegExp(`${boundary}(${pattern})${end}`, 'gi');
        for (const match of source.matchAll(re)) {
            const start = match.index + match[0].length - match[2].length;
            spans.push({ start, end: start + match[2].length, kind });
        }
    }
    return spans.sort((a, b) => a.start - b.start);
}
export function isExplicitGenderStatement(value, name = '') {
    return explicitGenderStatements(value, name).some(span => span.kind === 'identity');
}

// 内置生图只要出场人物的外貌和衣着：条目里一个讲长相、身高、衣着、饰品的字眼都没有（规则、输出格式、地点、榜单这类），
// 即使关键词在正文里出现过也不带——不然里面给主模型的格式说明会被副 API 当范例照抄。
// 这里故意放宽：宁可多带一条，也不漏掉只写了衣着、身高或英文外貌的人物条目。
const PERSON_LOOKS_WORDS = /外貌|外表|外形|外观|外觀|样貌|樣貌|长相|長相|容貌|相貌|五官|个子|個子|身高|身材|体型|體型|体格|體格|\d{2,3}\s*(?:cm|CM|厘米|公分)|[发髮](?:色|型|丝|絲|梢|尾|髻|带|帶|饰|飾|圈|量)|[长短直卷黑白银金红棕灰紫蓝粉長捲銀紅藍][发髮]|头发|頭髮|刘海|劉海|马尾|馬尾|辫|辮|[肤膚]色|皮[肤膚]|[脸臉](?:型|蛋|庞|龐|颊|頰)|[圆圓方长長小尖]脸|[圆圓方长長小尖]臉|瓜子[脸臉]|鹅蛋[脸臉]|鵝蛋臉|娃娃[脸臉]|眼(?:睛|眸|瞳|尾|角|皮|镜|鏡)|[大小圆圓细細杏桃丹凤鳳]眼|眉|唇|鼻梁|鼻樑|痣|疤|胎记|胎記|纹身|紋身|刺青|面具|面纱|面紗|眼镜|眼鏡|上衣|衣服|衣着|衣著|衣裳|大衣|外衣|风衣|風衣|毛衣|睡衣|[裙袍衫裤褲靴鞋帽袜襪]|斗篷|披风|披風|西装|西裝|制服|铠|鎧|盔|甲胄|手套|项链|項鍊|耳环|耳環|戒指|手镯|手鐲|簪|首饰|首飾|饰品|飾品|发饰|髮飾|配饰|配飾|穿着|穿著|身穿|一身|戴着|戴著|佩戴/;
const PERSON_LOOKS_WORDS_EN = /\b(?:appearance|hair(?:ed|style)?|eyes?|eyed|skin|complexion|height|tall|petite|muscular|slender|scars?|tattoos?|freckles?|wears?|wearing|dressed|outfit|coat|cloak|dress|shirt|jacket|suit|uniform|armou?r|glasses|mask|gloves?|boots?)\b/i;
function describesLooks(content, names = []) {
    return APPEARANCE_WORDS.test(content) || PERSON_LOOKS_WORDS.test(content) || PERSON_LOOKS_WORDS_EN.test(content)
        || ['', ...names].some(name => isExplicitGenderStatement(content, name));
}

function currentCharacter(ctx) {
    return ctx?.characters?.[ctx.characterId] || ctx?.character || null;
}

function abortError() {
    const error = new Error('角色世界书读取已取消。');
    error.name = 'AbortError';
    return error;
}

function staleError() {
    const error = new Error('读取期间当前角色或其绑定世界书已变化，请在当前角色重新生成。');
    error.code = 'CHARACTER_WORLD_BOOK_STALE';
    return error;
}

function sourceRow(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/【/g, '\\u3010');
}

// These are explicit current-character bindings, not the global worldbook
// directory, the chat/persona book, or RabbitMirror's random selection library.
// SillyTavern world-info.js uses data.extensions.world and data.character_book.
export async function readCharacterWorldBookContext(ctx, {
    signal, assertCurrent = () => {}, maxChars = 8000, disabledBooks = [], focusText = '', onlyMentioned = false, filterContent = null,
} = {}) {
    if (!Number.isSafeInteger(maxChars) || maxChars < 0) throw new RangeError('角色世界书字符预算必须为非负整数。');
    const character = currentCharacter(ctx);
    const characterId = ctx?.characterId;
    const linkedName = text(character?.data?.extensions?.world).trim();
    const embedded = character?.data?.character_book ?? character?.character_book;
    const check = () => {
        if (signal?.aborted) throw abortError();
        assertCurrent();
        if (ctx?.characterId !== characterId || currentCharacter(ctx) !== character
            || text(character?.data?.extensions?.world).trim() !== linkedName
            || (character?.data?.character_book ?? character?.character_book) !== embedded) throw staleError();
        if (signal?.aborted) throw abortError();
    };
    check();
    const empty = (reason = '') => ({ text: '', bookNames: [], entryCount: 0, titles: [], truncated: false, reason });
    if (!character || (!linkedName && !embedded)) return empty('这张卡没有绑定世界书');
    const name = linkedName || text(embedded?.name).trim() || `${text(character.name).trim() || '当前角色'}的内嵌世界书`;
    const disabled = new Set((Array.isArray(disabledBooks) ? disabledBooks : [])
        .map(value => text(value).trim()).filter(Boolean));
    // A linked book is the live source; never fall back to its embedded stale
    // copy after a disable or read failure.
    if (disabled.has(name)) return empty(`世界书「${name}」在兔子镜设置里被关掉了`);
    let book = embedded;
    if (linkedName) {
        let getHeaders = ctx?.getRequestHeaders;
        if (typeof getHeaders !== 'function') {
            const host = await import('../../../../../script.js');
            check();
            getHeaders = host.getRequestHeaders;
        }
        if (typeof getHeaders !== 'function') throw new Error('宿主未提供角色世界书读取请求头。');
        const suppliedHeaders = await getHeaders.call(ctx);
        check();
        if (!suppliedHeaders || typeof suppliedHeaders !== 'object') throw new Error('宿主角色世界书读取请求头无效。');
        const headers = new Headers(suppliedHeaders);
        headers.set('Content-Type', 'application/json');
        const response = await fetch('/api/worldinfo/get', {
            method: 'POST', credentials: 'same-origin', headers, signal,
            body: JSON.stringify({ name: linkedName }),
        });
        check();
        if (!response.ok) throw new Error(`角色世界书“${name}”读取失败：HTTP ${response.status}。`);
        book = await response.json();
        check();
    }
    const entries = book?.entries;
    if (!entries || typeof entries !== 'object') throw new TypeError(`角色世界书“${name}”缺少有效 entries。`);
    const rows = [];
    let skippedNoLooks = 0;
    const focus = text(focusText);
    // 这一轮正文里出现过的名字（任一条目的关键词、标题里的人名）：大条目里按它们找人物那一段。
    const anchors = new Set();
    // 多人卡、开放世界卡：人物长相都写在世界书里，整本书往往比预算长，按书里的顺序截断时，
    // 这一轮出场的人物条目常被截掉。只调顺序、不筛条目：关键词或标题在这一轮正文里出现过的条目排在前面，其余照原顺序。
    const mentioned = entry => {
        mentioned.hits = [];
        if (!focus) return 0;
        const keys = [...(Array.isArray(entry.key) ? entry.key : []), ...(Array.isArray(entry.keys) ? entry.keys : [])]
            .map(value => text(value).trim()).filter(value => value && value.length <= 40 && !/^\/.*\/[a-z]*$/i.test(value));
        const title = (text(entry.comment) || text(entry.name) || text(entry.title)).trim();
        const hitKeys = keys.filter(key => focus.includes(key));
        hitKeys.forEach(key => anchors.add(key));
        mentioned.hits = [...hitKeys];
        let score = hitKeys.length;
        // 标题就是这个人名的也记进这一条自己的命中（长条目按预算截取时，这一条才认得出是这个人自己的条目）。
        if (title && title.length <= 20 && focus.includes(title)) { score += 1; anchors.add(title); mentioned.hits.push(title); }
        // 人物条目常常没写关键词（常驻条目），或标题写成「【人物】阿雪」「阿雪·外貌」：
        // 把标题按符号拆开，拆出来的人名在这一轮出现过也算提到。「人物、设定、外貌」这类分类词不算。
        else if (title && !score) {
            const pieces = title.split(/[\s【】\[\]()（）<>《》「」『』:：·・|｜/\\,，、\-—_+=#*]+/)
                .map(piece => piece.trim()).filter(piece => piece.length >= 2 && piece.length <= 8 && !TITLE_NOISE.test(piece));
            // 只认写了长相的条目（地点、规则这类标题碰巧和正文重字的不算），英文片段要整词对上。
            const looksLikePerson = describesLooks(text(entry.content), [...keys, ...pieces]);
            const hit = piece => /^[A-Za-z0-9 ]+$/.test(piece)
                ? piece.length >= 3 && new RegExp(`(?:^|[^A-Za-z0-9])${piece.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^A-Za-z0-9])`, 'i').test(focus)
                : focus.includes(piece);
            const hits = looksLikePerson ? pieces.filter(hit) : [];
            hits.forEach(piece => anchors.add(piece));
            mentioned.hits.push(...hits);
            if (hits.length) score += 1;
        }
        return score;
    };
    for (const entry of Object.values(entries)) {
        check();
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new TypeError(`角色世界书“${name}”包含无效条目。`);
        // Card-book entries use enabled; native world-info entries use disable.
        if (entry.enabled === false || entry.disable === true) continue;
        if (typeof entry.content !== 'string') throw new TypeError(`角色世界书“${name}”条目内容不是文本。`);
        if (!entry.content.trim()) continue;
        // 「跳过的标签」也管世界书：条目里写的同名标签块不发给副 API（不然模型照着抄回兔子镜）。
        const content = typeof filterContent === 'function' ? String(filterContent(entry.content) ?? '') : entry.content;
        if (!content.trim()) continue;
        const title = text(entry.comment) || text(entry.name) || text(entry.title);
        const score = mentioned({ ...entry, content });
        // 只要出场人物外貌（内置生图）时：没写长相、衣着的条目不带（见 PERSON_LOOKS_WORDS）。
        if (onlyMentioned && score > 0 && !describesLooks(content, [title, ...(mentioned.hits || [])])) { skippedNoLooks += 1; continue; }
        rows.push({ row: sourceRow({ book: name, title, content }), title, content, score, hits: mentioned.hits || [], order: rows.length });
    }
    // 只要这一轮提到的条目（内置生图写人物外貌用）：没提到的一条不带。
    if (onlyMentioned) rows.splice(0, rows.length, ...rows.filter(item => item.score > 0));
    rows.sort((a, b) => (b.score > 0) - (a.score > 0) || (a.score > 0 && b.score > 0 ? b.score - a.score : 0) || a.order - b.order);
    // 只要提到的条目、又超出预算时：先在每条里找「这一轮出现过的名字＋后面写着长相」的那几段
    // （一个势力条目里写了十几个 NPC，长相不在开头），找到的条目排前面，只留这几段；找不到的留开头。
    if (onlyMentioned && rows.reduce((sum, item) => sum + item.row.length + 1, 0) > maxChars) {
        const names = [...anchors].filter(value => value.length >= 2);
        // 段落的先后：这一条自己命中的名字在前（别的条目命中的「某城」这类地名排后面），名字后面越快写到长相越靠前。
        // 后面按额度截的时候从末尾截，最像这个人长相的那段留得住。
        const safe = (content, at) => (at > 0 && at < content.length && /[\uDC00-\uDFFF]/.test(content[at]) ? at - 1 : at);
        for (const item of rows) {
            const own = new Set(item.hits.filter(value => value.length >= 2));
            const spans = [];
            for (const anchor of [...own, ...names.filter(value => !own.has(value))]) {
                let from = 0;
                for (let found = 0; found < (own.has(anchor) ? 6 : 1); found += 1) {
                    const at = item.content.indexOf(anchor, from);
                    if (at < 0) break;
                    from = at + anchor.length;
                    const start = safe(item.content, Math.max(0, at - 10));
                    const end = safe(item.content, Math.min(item.content.length, at + 420));
                    const look = item.content.slice(at, end).search(SCAN_APPEARANCE_WORDS);
                    if (look >= 0) spans.push({ start, end, rank: (own.has(anchor) ? 0 : 10000) + look });
                }
            }
            // 标题就是这个人的长条目：长相常写在一大段身世后面，离名字很远。整条里写长相的那几处也各留一段（排在名字附近的那几段后面）。
            if ([...own].some(value => String(item.title || '').includes(value))) {
                const words = new RegExp(SCAN_APPEARANCE_WORDS.source, `${SCAN_APPEARANCE_WORDS.flags}g`);
                let match, count = 0;
                while ((match = words.exec(item.content)) && count < 6) {
                    const at = match.index;
                    if (spans.some(span => at >= span.start && at < span.end)) continue;
                    count += 1;
                    spans.push({ start: safe(item.content, Math.max(0, at - 60)), end: safe(item.content, Math.min(item.content.length, at + 240)), rank: 5000 + count });
                }
            }
            if (!spans.length) continue;
            spans.sort((a, b) => a.rank - b.rank);
            const merged = [];
            for (const span of spans) {
                const overlap = merged.find(other => span.start < other.end && span.end > other.start);
                if (overlap) { overlap.start = Math.min(overlap.start, span.start); overlap.end = Math.max(overlap.end, span.end); }
                else merged.push({ ...span });
            }
            const excerpt = merged.map(({ start, end }) => item.content.slice(start, end)).join('\n…\n');
            if (excerpt.length < item.content.length) {
                item.content = excerpt;
                item.row = sourceRow({ book: name, title: item.title, content: excerpt });
            }
            item.appearance = true;
        }
        rows.sort((a, b) => (b.appearance === true) - (a.appearance === true));
    }
    // 还超出预算时：每条都留开头一段，不让排在后面的人物整条被截掉。
    // 按转义后的实际长度截；条目太多、每条连 200 字都分不到时，只留前面几条。
    // 只有一条也要按条截（截成完整的一行 JSON）：不然落到最后整段硬截，截在 JSON 中间，后面摘长相时这一条解析不出来、拿到空的。
    if (onlyMentioned && rows.length >= 1 && rows.reduce((sum, item) => sum + item.row.length + 1, 0) > maxChars) {
        const keep = Math.max(1, Math.min(rows.length, Math.floor(maxChars / 220)));
        rows.splice(keep);
        const share = Math.floor(maxChars / rows.length) - 1;
        for (const item of rows) {
            if (item.row.length <= share) continue;
            let cut = Math.min(item.content.length, share);
            let row = '';
            while (cut > 0) {
                let content = item.content.slice(0, cut);
                if (/[\uD800-\uDBFF]$/.test(content)) content = content.slice(0, -1);
                row = sourceRow({ book: name, title: item.title, content: `${content}…（后略）` });
                if (row.length <= share) break;
                cut -= Math.max(1, Math.ceil((row.length - share) / 2));
            }
            if (cut > 0) item.row = row;
        }
        rows.splice(0, rows.length, ...rows.filter(item => item.row.length <= share));
    }
    const titles = rows.map(item => item.title);
    rows.splice(0, rows.length, ...rows.map(item => item.row));
    check();
    const fullText = rows.join('\n');
    if (fullText.length <= maxChars) return { text: fullText, bookNames: [name], entryCount: rows.length, titles: titles.filter(Boolean), truncated: false, ...(skippedNoLooks ? { skippedNoLooks } : {}) };
    const note = maxChars >= 15 ? '\n【角色世界书已按预算截断】' : '【已截断】';
    const marker = note.slice(0, maxChars);
    const contentBudget = Math.max(0, maxChars - marker.length);
    let prefix = fullText.slice(0, contentBudget);
    // Never leave half a UTF-16 surrogate in the material sent to the model.
    if (/[\uD800-\uDBFF]$/.test(prefix)) prefix = prefix.slice(0, -1);
    let used = 0;
    let entryCount = 0;
    for (const row of rows) {
        if (used >= prefix.length) break;
        entryCount += 1;
        used += row.length + 1;
    }
    return { text: prefix + marker, bookNames: [name], entryCount, titles: titles.slice(0, entryCount).filter(Boolean), truncated: true, ...(skippedNoLooks ? { skippedNoLooks } : {}) };
}

/**
 * 从世界书人物条目（readCharacterWorldBookContext 返回的 text，每行一条 JSON）里摘出某个人的长相那几句。
 * 先找标题就是这个人的条目（标题按符号拆开后有一段正好是这个名字），从正文开头摘；
 * 再在别的条目里找这个名字（名字后面紧跟标点、空白或结尾才算，「阿岩岩」「阿岩的妹妹」不算），往后摘写着长相的句子，
 * 摘到下一段（空行、下一个【小标题】）或同一画面里另一个人的名字为止。最多三句、两百字；找不到返回空串。
 */
// 分句：中文按句末标点；英文按「. ! ?（后面可跟引号括号）＋空格＋大写或引号」，Dr. Mr. 这类缩写不算句末。
const SENTENCE_SPLIT = /(?<=[。；;！!？?\n])|(?<!\b(?:Dr|Mr|Mrs|Ms|St|Jr|Sr|Prof|Mt|vs|etc)\.)(?<=[.!?]["'”’)]?)\s+(?=["'“‘(]?[A-Z])/;
// at 所在的英文句子从哪里开始（同 SENTENCE_SPLIT 的规则，Dr. 这类缩写不算句末）；没有就是 0。
function englishSentenceStart(content, at) {
    const re = new RegExp(SENTENCE_SPLIT.source.replace(/^\(\?<=\[[^\]]*\]\)\|/, ''), 'g');
    const head = content.slice(0, at);
    let start = 0, match;
    while ((match = re.exec(head))) { start = match.index + match[0].length; if (!match[0].length) re.lastIndex += 1; }
    return start;
}
// 英文条目里讲别人的那几句：一句以另一个人名开头（Bob is… / Bob has…），以及紧接着用 He / She / His / Her 开头的句子，是在讲他；
// 别的句子（没写人名、也不是代词开头的）照旧算这个人。这些句子不算这个人的长相（「先写 Alice，再写 Bob，His skin… a red mole」不能补给 Alice）。
// 只认「大写词＋is / has / was / wears…」这种明说主语的，长相词（Silver hair、Freckles）、地名后面接 is 的也可能被认成人名，
// 但它只影响这一句和紧跟的代词句，不会一路吞到底。
const EN_PRONOUN_START = /^["'“‘(]?(?:he|she|they|his|her|hers|their|him|them)\b/i;
const EN_NOT_NAME = /^(?:The|A|An|This|That|These|Those|There|Here|It|Its|When|While|After|Before|As|At|In|On|Of|With|And|But|Or|So|If|Then|Her|His|Their|She|He|They|Dr|Mr|Mrs|Ms|Sir|Lady|Lord|Long|Short|Silver|Black|White|Red|Blue|Green|Pale|Dark|Light|Golden|Brown|Pink|Purple|Freckles|Skin|Hair|Eyes)$/;
const EN_RELATION = /\b(?:her|his|their)\s+(?:brother|sister|friend|neighbou?r|father|mother|dad|mom|husband|wife|lover|rival|cousin|son|daughter|master|servant|teacher|student|boss|partner|uncle|aunt)\b/i;
function englishSentencesAboutOthers(content, who) {
    const result = new Set();
    const text = String(content || '');
    if (!/[A-Za-z]{3}/.test(text)) return result;
    const target = String(who || '').trim().toLowerCase();
    // 条目里写的是英文名、和标题的人名对不上（标题「阿雪」，正文「Alice is…」）：第一个明说主语、又不是「她的哥哥」这类关系句的人名算她自己。
    let alias = target && text.toLowerCase().includes(target) ? '' : null;
    let subject = 'self';
    const relatives = new Set();
    // 代词分男女：她自己用 she/her 时，在讲别人（他）以后又出现 She / Her 开头的句子，是回到她自己。
    // 她的性别从她自己那几句里的代词、或者「Bob is her friend」这种关系句里的 her / his 看出来。
    const genderOf = value => (/^["'“‘(]?(?:she|her|hers)\b/i.test(value) ? 'f' : /^["'“‘(]?(?:he|his|him)\b/i.test(value) ? 'm' : '');
    let selfGender = '', otherGender = '';
    for (const raw of text.split(SENTENCE_SPLIT)) {
        const sentence = raw.trim();
        if (!sentence) continue;
        const first = sentence.match(/^["'“‘(]?([A-Z][a-z]+)\b/)?.[1] || '';
        const named = !!first && !EN_NOT_NAME.test(first)
            && new RegExp(`^["'“‘(]?${first}(?:'s)?\\s+(?:is|was|has|had|wears|wore|looks|stands|sits|seems|appears)\\b`).test(sentence);
        // 在「X is her brother」里出现过的人名是别人，之后也不拿来当她自己。
        if (named && EN_RELATION.test(sentence)) relatives.add(first);
        if (named && alias === null && !relatives.has(first)) alias = first;
        const relation = sentence.match(/\b(her|his)\s+(?:brother|sister|friend|neighbou?r|father|mother|dad|mom|husband|wife|lover|rival|cousin|son|daughter|master|servant|teacher|student|boss|partner|uncle|aunt)\b/i);
        if (named && relation && !selfGender) selfGender = /^her$/i.test(relation[1]) ? 'f' : 'm';
        const pronoun = genderOf(sentence);
        if ((target && sentence.toLowerCase().includes(target)) || (alias && first === alias)) subject = 'self';
        else if (named) {
            subject = 'other';
            // 「Carol is her sister」：别人的性别从关系词看（sister、mother… 是她，brother、father… 是他）。
            otherGender = /\b(?:sister|mother|mom|wife|daughter|aunt|girlfriend|niece|grandmother|queen|princess|lady)\b/i.test(sentence) ? 'f'
                : /\b(?:brother|father|dad|husband|son|uncle|boyfriend|nephew|grandfather|king|prince|lord)\b/i.test(sentence) ? 'm' : '';
        }
        else if (!EN_PRONOUN_START.test(sentence)) subject = 'self';
        else if (subject === 'other' && pronoun) {
            // 只有知道别人的性别、而且和这个代词不一样时才算回到她自己；别人性别不明时宁可不算她的（少摘一句，不串人）。
            if (selfGender && pronoun === selfGender && otherGender && otherGender !== pronoun) subject = 'self';
            else if (!otherGender) otherGender = pronoun;
        }
        if (subject === 'self' && pronoun && !selfGender) selfGender = pronoun;
        if (subject === 'other') result.add(sentence);
    }
    return result;
}

// Already punctuated sentences retain their original joining style. A bare line
// needs its separator back, or declarations like “性别：男性\n黑发” become one clause.
function joinSentences(list) {
    return list.reduce((out, part) => {
        if (out && !/[。；;！!？?.]["'”’)]?$/.test(out)) return `${out}\n${part}`;
        return out && /[A-Za-z0-9.,!?"'”’)]$/.test(out) && /^["'“‘(]?[A-Za-z]/.test(part) ? `${out} ${part}` : out + part;
    }, '');
}

export function appearanceFromCast(castText, name, otherNames = []) {
    const who = text(name).trim();
    if (!who || who.length < 2) return '';
    const others = (Array.isArray(otherNames) ? otherNames : []).map(value => text(value).trim()).filter(value => value && value !== who && !who.includes(value));
    const rows = [];
    for (const line of text(castText).split('\n')) {
        try { const row = JSON.parse(line); if (row && typeof row.content === 'string') rows.push(row); } catch { /* 截断标记之类 */ }
    }
    const titleIsWho = row => text(row.title).trim() === who || text(row.title).split(/[\s【】\[\]()（）<>《》「」『』:：·・|｜/\\,，、\-—_+=#*]+/).some(piece => piece.trim() === who);
    let foreign = new Set();
    const pick = window => {
        // 英文按句号、问号、叹号加空格分句，不然一整段英文算一句，超过 600 字时末尾的肤色、痣被截掉。
        const sentences = window.split(SENTENCE_SPLIT).map(part => part.trim()).filter(Boolean);
        return joinSentences(sentences.filter(part => (APPEARANCE_WORDS.test(part) || explicitGenderStatements(part, who).length) && !foreign.has(part))).slice(0, 600);
    };
    // 别人的名字出现在哪里就截到哪里；窗口一开头就是别人（这一句在讲别人）截成空串，调用方跳过这一句接着找。
    const cutAtOthers = window => {
        let end = window.length;
        for (const other of others) { const at = window.indexOf(other); if (at >= 0) end = Math.min(end, at); }
        return window.slice(0, end);
    };
    const ownRows = rows.filter(titleIsWho);
    // 标题就是这个人的条目：长相常分散在几处（开头写发色眼睛，后面另起一段写身材、痣），几处都收，去重后合起来，最多 600 字。
    const collected = [];
    const collect = found => {
        for (const sentence of found.split(SENTENCE_SPLIT).map(part => part.trim()).filter(Boolean)) {
            if (!collected.includes(sentence) && collected.join('').length + sentence.length <= 600) collected.push(sentence);
        }
    };
    for (const row of ownRows) {
        collected.splice(0);
        // 标题就是这个人的条目（角色卡、Persona 也走这里）：长相常写在几百字的身份、背景后面，
        // 从写长相的地方往后摘，不只看开头。第一处写长相的句子是在讲别人（「乙：红发…」）时，接着找下一处。
        const content = row.content;
        foreign = englishSentencesAboutOthers(content, who);
        const words = new RegExp(SCAN_APPEARANCE_WORDS.source, `${SCAN_APPEARANCE_WORDS.flags}g`);
        let match, tries = 0, lastStart = -1;
        while ((match = words.exec(content)) && tries < 8) {
            const at = match.index;
            // 英文句子的开头（上一个「. 」「! 」「? 」之后）也算句首，不然整段英文都从开头摘，后面的长相摘不到。
            const start = Math.max(0, content.lastIndexOf('\n', at), Math.max(content.lastIndexOf('。', at), content.lastIndexOf('；', at)) + 1,
                englishSentenceStart(content, at));
            if (start === lastStart) continue;
            lastStart = start;
            tries += 1;
            const found = pick(cutAtOthers(content.slice(start, start + 360)));
            if (found) collect(found);
        }
        // 几本书里都有这个人的条目时，只用第一条摘得到长相的，不把两本书写法不同的长相拼在一起。
        if (collected.length) return joinSentences(collected);
    }
    // 名字后面紧跟标点、空白，或者「身穿、有一头、是、长着、戴着」这类直接接长相的字才算（「阿岩的妹妹」「阿岩岩」不算）。
    const boundary = /^(?:$|[\s：:，,、。；;】)）」』\-—·（(]|身|有|是|长|生|戴|穿|一头|头)/;
    for (const row of rows) {
        if (ownRows.includes(row)) continue;
        const content = row.content;
        foreign = englishSentencesAboutOthers(content, who);
        let tries = 0;
        for (let at = content.indexOf(who); at >= 0 && tries < 6; at = content.indexOf(who, at + who.length)) {
            if (!boundary.test(content.slice(at + who.length, at + who.length + 1))) continue;
            // 名字前面紧挨着汉字（「小甲」里的「甲」）不算这个人；「和甲」「是甲」「叫甲」这类连词、动词后面的还是这个人。
            if (at > 0 && /[\u3400-\u9fff]/.test(content[at - 1]) && /[\u3400-\u9fff]/.test(who[0]) && !/[和与及跟同是为给向对把让叫见称作当像似如有了着]/.test(content[at - 1])) continue;
            tries += 1;
            let window = content.slice(at, at + 360);
            window = window.slice(0, 1) + window.slice(1).split(/\n\s*\n|\n\s*【/)[0];
            const found = pick(cutAtOthers(window));
            if (found) return found;
        }
    }
    return '';
}
