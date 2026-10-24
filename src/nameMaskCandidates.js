// 截图打码「找名字」：在本机翻当前角色卡、群聊成员、聊天署名和角色卡绑定的世界书、聊天绑定的世界书，
// 列出可能是名字的词给用户勾选。不调用模型、不花 token；世界书只读条目的关键词和标题，不读正文内容。

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
    const response = await fetch('/api/worldinfo/get', { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify({ name }) });
    return response.ok ? response.json() : null;
}

/**
 * 找候选名字。返回 [{ name, from }]，已经在名单里的不再列出。
 * 世界书读不到（没绑定、网络错）就跳过那一处，不报错。
 */
export async function findNameMaskCandidates(ctx, { exclude = [], fetchBook = fetchWorldBook } = {}) {
    const found = new Map();
    const skip = new Set((exclude || []).map(clean).filter(Boolean));
    const add = (value, from) => {
        for (const name of nameLikeParts(value)) if (!skip.has(name) && !found.has(name)) found.set(name, from);
    };
    add(ctx?.name1, 'user');
    const character = ctx?.characters?.[ctx?.characterId];
    add(character?.name || ctx?.name2, '角色卡');
    const group = (Array.isArray(ctx?.groups) ? ctx.groups : []).find(item => String(item?.id) === clean(ctx?.groupId ?? ctx?.group_id));
    for (const member of Array.isArray(group?.members) ? group.members : []) {
        const card = (Array.isArray(ctx?.characters) ? ctx.characters : []).find(item => item?.avatar === member);
        add(card?.name, '群聊成员');
    }
    for (const msg of Array.isArray(ctx?.chat) ? ctx.chat : []) if (!msg?.is_system) add(msg?.name, '聊天署名');
    const books = [];
    const embedded = character?.data?.character_book ?? character?.character_book;
    const linked = clean(character?.data?.extensions?.world);
    try { if (linked) books.push(await fetchBook(ctx, linked)); else if (embedded) books.push(embedded); } catch { /* 读不到就跳过 */ }
    const chatBook = clean(ctx?.chatMetadata?.world_info);
    try { if (chatBook && chatBook !== linked) books.push(await fetchBook(ctx, chatBook)); } catch { /* 读不到就跳过 */ }
    for (const book of books) {
        for (const entry of entriesOf(book)) {
            if (entry?.disable === true) continue;
            add(entry?.comment || entry?.name || entry?.title, '世界书标题');
            for (const key of [...(Array.isArray(entry?.key) ? entry.key : []), ...(Array.isArray(entry?.keys) ? entry.keys : [])]) add(key, '世界书关键词');
        }
    }
    return [...found].map(([name, from]) => ({ name, from })).slice(0, 80);
}
