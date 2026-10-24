// 截图打码「找名字」：在本机翻当前角色卡（名字和设定）、群聊成员、聊天署名，以及这个聊天用到的世界书
// （角色卡绑定的、聊天绑定的、本聊天已触发过的其他世界书）的标题、关键词和条目内容，列出可能是名字的词给用户勾选。
// 不调用模型、不花 token，读到的内容只在本机用来找名字。

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();

/** 当前角色卡（群聊按群）的名单钥匙；没有打开角色时为空。 */
export function nameMaskCardKey(ctx) {
    const group = clean(ctx?.groupId ?? ctx?.group_id);
    if (group) return `group:${group}`;
    const character = ctx?.characters?.[ctx?.characterId];
    const avatar = clean(character?.avatar);
    return avatar ? `card:${avatar}` : '';
}

export function nameMaskCardLabel(ctx) {
    const group = clean(ctx?.groupId ?? ctx?.group_id);
    if (group) {
        const found = (Array.isArray(ctx?.groups) ? ctx.groups : []).find(item => String(item?.id) === group);
        return `群聊：${clean(found?.name) || group}`;
    }
    const character = ctx?.characters?.[ctx?.characterId];
    return clean(character?.name || ctx?.name2) || '';
}

// 词像不像名字：2–12 个字、不是正则、不带句读；标题里「人物：阿雪」「【阿雪】」这种取名字那段。
export function nameLikeParts(value) {
    let textValue = clean(value);
    if (!textValue || /^\/.*\/[a-z]*$/i.test(textValue)) return [];
    // 带句号、问号的是一句话，不是名字。
    if (/[。！？!?…\n]/.test(textValue)) return [];
    textValue = textValue.replace(/^[【\[（(<《「『]+|[】\]）)>》」』]+$/g, '');
    const afterColon = textValue.split(/[:：]/).pop();
    return afterColon.split(/[\/／、,，|｜;；]/).map(clean)
        .map(part => part.replace(/^[【\[（(<《「『]+|[】\]）)>》」』]+$/g, ''))
        .filter(part => part.length >= 2 && part.length <= (/[\u3400-\u9fff]/.test(part) ? 8 : 24) && !/[。！？!?…\n"“”]/.test(part) && !/^\d+$/.test(part));
}

function entriesOf(book) {
    const entries = book?.entries;
    if (Array.isArray(entries)) return entries;
    return entries && typeof entries === 'object' ? Object.values(entries) : [];
}

async function fetchWorldBook(ctx, name) {
    if (!name) return null;
    let getHeaders = ctx?.getRequestHeaders;
    if (typeof getHeaders !== 'function') return null;
    const headers = new Headers(await getHeaders.call(ctx));
    headers.set('Content-Type', 'application/json');
    // 一本书卡住不拖住整个按钮：8 秒没回就跳过这本。
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch('/api/worldinfo/get', { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify({ name }), signal: controller.signal });
        return response.ok ? await response.json() : null;
    } finally { clearTimeout(timer); }
}

// 条目内容里常见的人名写法：
//   「姓名：X」「name: X」「绰号：X、Y」「背景人物：X、Y」，括号里的「字X」「号X」「又名X」；
//   一行开头「X（身份）」「X：……」「X — 身份」「X，男，二十五岁」「【X】」「### X」，加粗的「**X**」也算。
// 一行开头那几种容易把「外貌：」「性格：」这类栏目名当成名字，FIELD_WORDS 里的跳过。
const FIELD_WORDS = new Set(('外貌 性格 身份 年龄 简介 背景 关系 身高 体重 喜好 特点 能力 武功 武学 功法 职位 地位 势力 爱好 习惯 说话 语气 口头禅 经历 过往 现状 备注 设定 特征 衣着 服饰 穿着 武器 兵器 其他 重要 主要 人物 角色 性别 种族 阵营 位置 地点 住处 描述 说明 目标 秘密 弱点 优点 缺点 外表 外形 体型 发色 瞳色 声音 气质 状态 生日 出身 家庭 家世 立场 态度 动机 剧情 事件 时间 名字 姓名 称号 外号 别名 昵称 绰号 本名 化名 头衔 官职 门派 所属 成员 首领 代表 资料 信息 档案 概述 总览 介绍 补充 注意 规则 要求 禁止 示例 举例 例如 世界观 地理 历史 物品 道具 技能 等级 境界 实力 财富 人际 好感 评价 印象 外观 容貌 长相 五官 面容 身材 发型 眼睛 标签 类型 分类 作用 效果 内容 结构 特殊 关键 核心 原因 结果 后果 用途 角色名 人物名 背景人物 相关人物').split(' '));
const FIELD_LIST = [...FIELD_WORDS];
// 栏目名：本身在表里；四个字以上的再看是不是以表里的词开头或结尾（「人物设定」「主要势力」）。
// 两三个字的只认完全相同，免得「李重要」这种真名被吞。
const fieldLike = name => FIELD_WORDS.has(name) || (name.length >= 4 && FIELD_LIST.some(word => name.endsWith(word) || name.startsWith(word)));
const HAN = '[\\u4e00-\\u9fa5][\\u4e00-\\u9fa5·]{1,5}';
const NAME_FIELD = /(?:姓名|名字|本名|真名|化名|假名|名号|称号|外号|绰号|别名|昵称|雅号|道号|法号|艺名|代号|角色名|人物名|name|id)\s*[：:]\s*([^\n。；;]{1,60})/gi;
const PEOPLE_FIELD = /(?:人物|角色|npc|成员|人员|配角|主角|手下|亲信|下属)\s*[：:]\s*([^\n。；;]{1,80})/gi;
const ALIAS_IN_PAREN = /[（(][^）)\n]{0,30}?(?:字|号|又名|人称|别称|外号|绰号)\s*[：:]?\s*([\u4e00-\u9fa5]{2,6})/g;
const HEADING_NAME = new RegExp(`^\\s*#{1,6}\\s*(${HAN})\\s*$`, 'gm');
const BRACKET_NAME = new RegExp(`^[\\s>*\\-•·]*[【\\[]\\s*(${HAN})\\s*[】\\]]`, 'gm');
const LINE_NAME = new RegExp(`^[\\s>*\\-•·]*[「『]?(${HAN})[」』]?\\s*(?:[（(：:｜|]|\\s+[-—]{1,2}|[，,]\\s*(?:男|女|\\d|[一二三四五六七八九十廿]+岁))`, 'gm');

export function namesFromText(value) {
    // 加粗、斜体的星号和下划线先去掉，「- **X**：」就和「- X：」一样认。
    const text = String(value ?? '').slice(0, 200000).replace(/\*{1,3}|_{2,3}/g, '');
    const out = [];
    for (const match of text.matchAll(NAME_FIELD)) out.push(...nameLikeParts(match[1].replace(/[（(].*$/, '')));
    for (const match of text.matchAll(PEOPLE_FIELD)) out.push(...nameLikeParts(match[1].replace(/[（(][^）)]*[）)]/g, '')));
    for (const match of text.matchAll(ALIAS_IN_PAREN)) out.push(match[1]);
    for (const pattern of [HEADING_NAME, BRACKET_NAME, LINE_NAME]) for (const match of text.matchAll(pattern)) out.push(match[1]);
    return out.filter(name => name.length >= 2 && name.length <= 8 && !fieldLike(name));
}

/**
 * 找候选名字。返回 [{ name, from, mentions }]，已经在名单里的不再列出。
 * 来源：user、角色卡（名字和设定里写到的人名）、群聊成员、聊天署名、这个聊天用到的世界书（角色卡绑定的、聊天绑定的、
 * 以及传进来的 extraBooks，比如本轮激活过的全局世界书）的标题、关键词和条目内容里写到的人名。
 * 按在当前聊天正文里出现的次数排序，出现过的排前面。世界书读不到就跳过那一本，不报错。
 */
export async function findNameMaskCandidates(ctx, { exclude = [], fetchBook = fetchWorldBook, extraBooks = [], limit = 150 } = {}) {
    const found = new Map();
    const skip = new Set((exclude || []).map(clean).filter(Boolean));
    const addName = (name, from) => { if (name && !skip.has(name) && !found.has(name)) found.set(name, from); };
    const add = (value, from) => { for (const name of nameLikeParts(value)) addName(name, from); };
    const addFromText = (value, from) => { for (const name of namesFromText(value)) addName(name, from); };
    add(ctx?.name1, 'user');
    const character = ctx?.characters?.[ctx?.characterId];
    add(character?.name || ctx?.name2, '角色卡');
    const group = (Array.isArray(ctx?.groups) ? ctx.groups : []).find(item => String(item?.id) === clean(ctx?.groupId ?? ctx?.group_id));
    for (const member of Array.isArray(group?.members) ? group.members : []) {
        const card = (Array.isArray(ctx?.characters) ? ctx.characters : []).find(item => item?.avatar === member);
        add(card?.name, '群聊成员');
    }
    for (const msg of Array.isArray(ctx?.chat) ? ctx.chat : []) if (!msg?.is_system) add(msg?.name, '聊天署名');
    const data = character?.data || character || {};
    for (const field of ['description', 'personality', 'scenario', 'first_mes', 'mes_example']) addFromText(data?.[field] ?? character?.[field], '角色卡设定');
    const names = [];
    const embedded = character?.data?.character_book ?? character?.character_book;
    const linked = clean(character?.data?.extensions?.world);
    for (const name of [linked, clean(ctx?.chatMetadata?.world_info), ...(Array.isArray(extraBooks) ? extraBooks.map(clean) : [])]) if (name && !names.includes(name)) names.push(name);
    // 几本书同时读，读不到的跳过；角色卡没绑定外部世界书时用卡里内嵌的那本。
    const settled = await Promise.allSettled(names.slice(0, 20).map(name => fetchBook(ctx, name)));
    const books = settled.filter(item => item.status === 'fulfilled' && item.value).map(item => item.value);
    if (!linked && embedded) books.unshift(embedded);
    let budget = 3_000_000;
    for (const book of books) {
        for (const entry of entriesOf(book)) {
            if (entry?.disable === true || entry?.enabled === false) continue;
            add(entry?.comment || entry?.name || entry?.title, '世界书标题');
            for (const key of [...(Array.isArray(entry?.key) ? entry.key : []), ...(Array.isArray(entry?.keys) ? entry.keys : [])]) add(key, '世界书关键词');
            const content = String(entry?.content || '');
            if (budget > 0) { addFromText(content.slice(0, budget), '世界书内容'); budget -= content.length; }
        }
    }
    // 在聊天正文里出现过几次：真正登场的人排前面，世界书里的杂词（标签、梗）沉到后面。
    const chatText = (Array.isArray(ctx?.chat) ? ctx.chat : []).filter(msg => !msg?.is_system).map(msg => String(msg?.mes || '')).join('\n').slice(-400_000);
    const count = name => { let n = 0; for (let at = chatText.indexOf(name); at >= 0 && n < 999; at = chatText.indexOf(name, at + name.length)) n += 1; return n; };
    const fixed = new Set(['user', '角色卡', '群聊成员', '聊天署名']);
    // 先按来源和出现顺序截到 600 个再数次数，大世界书提出几千个词时不卡界面。
    return [...found].slice(0, 600).map(([name, from], order) => ({ name, from, mentions: count(name), order }))
        .sort((a, b) => (fixed.has(b.from) - fixed.has(a.from)) || (b.mentions - a.mentions) || (a.order - b.order))
        .slice(0, limit).map(({ name, from, mentions }) => ({ name, from, mentions }));
}
