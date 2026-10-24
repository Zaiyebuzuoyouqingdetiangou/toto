// 设置页「统计所有聊天 / 清理所有聊天已确认的」：本机缓存里属于别的聊天的那些，
// 逐个去服务器读那个聊天文件核对——聊天文件里确实有同一份成品、同一组版本、同一张图，本机这份才算可删。
// 读不到、对不上、不知道是哪个聊天的，一律不动。当前打开的聊天交给「已存进聊天的镜面缓存」那一类处理。
// 只读聊天文件，不改聊天文件，不调用模型。
import { dropFaceSwipeStacksForCleanup } from './swipeVersions.js?rmv=1.83.2';

const OUTPUTS = 'rabbit_mirror_independent_outputs_v1';
const HISTORY = 'rabbit_mirror_independent_history_v1';
const SWIPES = 'rabbit_mirror_face_swipes_v1';
const IMAGE_PREFIX = 'rabbitMirror:image:v1:images:';
const OWNERS = 'rabbit_mirror_independent_outputs_v2';
const IMAGE_EXTRA = 'rabbitMirrorImages';
const IMAGE_OWNER = 'rabbitMirrorImageOwner';

const store = () => { try { return globalThis.localStorage || null; } catch { return null; } };
const readJson = key => { try { return JSON.parse(store()?.getItem(key) || 'null'); } catch { return null; } };
const bytesOf = (key, value) => (String(key).length + JSON.stringify(value ?? '').length) * 2;
const stripJsonl = name => String(name || '').replace(/\.jsonl$/i, '');

// 镜面缓存、历史备份的位置键：chat:<聊天>:楼层:swipe:指纹；多版本切换：chat:<聊天>:楼层:swipe[:指纹]\0面号。
function parseSlot(slot) {
    const match = /^chat:(.+):(\d+):(\d+):[0-9a-z]+$/i.exec(String(slot || ''));
    return match ? { chat: match[1], index: Number(match[2]), swipe: Number(match[3]) } : null;
}
// 多版本切换的键没有指纹段（见 faceSwipeStorageSlot），旧数据可能带十六进制指纹。
function parseSwipeBase(base) {
    const text = String(base || '');
    const withHash = /^chat:(.+):(\d+):(\d+):[0-9a-f]{8,64}$/i.exec(text);
    const match = withHash || /^chat:(.+):(\d+):(\d+)$/i.exec(text);
    return match ? { chat: match[1], index: Number(match[2]), swipe: Number(match[3]) } : null;
}

function currentChatId(ctx) {
    try { return stripJsonl(ctx?.getCurrentChatId?.() ?? ctx?.chatId ?? ''); } catch { return ''; }
}

async function post(ctx, url, body, signal) {
    const headers = new Headers(typeof ctx?.getRequestHeaders === 'function' ? await ctx.getRequestHeaders() : {});
    headers.set('Content-Type', 'application/json');
    const response = await fetch(url, { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify(body), signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

/** 聊天名 → 去哪读：群聊按群里的聊天列表认；单人按角色的聊天列表认（先试名字对得上的角色）。 */
async function locateChats(ctx, chatIds, signal) {
    const found = new Map();
    const wanted = new Set(chatIds);
    for (const group of Array.isArray(ctx?.groups) ? ctx.groups : []) {
        for (const id of Array.isArray(group?.chats) ? group.chats : []) if (wanted.has(stripJsonl(id))) found.set(stripJsonl(id), { group: group.id });
    }
    const characters = (Array.isArray(ctx?.characters) ? ctx.characters : []).filter(item => item?.avatar);
    const remaining = () => [...wanted].filter(id => !found.has(id));
    const likely = characters.filter(item => remaining().some(id => id.startsWith(`${item.name} - `)));
    for (const list of [likely, characters.filter(item => !likely.includes(item))]) {
        // 同时最多问 4 个角色的聊天列表；第一轮（名字对得上的）找齐了就不再翻其余角色。
        for (let at = 0; at < list.length; at += 4) {
            if (!remaining().length || signal?.aborted) break;
            const batch = list.slice(at, at + 4);
            const lists = await Promise.all(batch.map(character => post(ctx, '/api/characters/chats', { avatar_url: character.avatar, simple: true }, signal).catch(() => null)));
            batch.forEach((character, index) => {
            const chats = lists[index]; if (!chats) return;
            const names = (Array.isArray(chats) ? chats : Object.values(chats || {})).map(item => stripJsonl(item?.file_name));
            for (const id of wanted) if (names.includes(id)) {
                // 两个角色有同名聊天文件：分不清是哪一个，算读不到。
                if (found.has(id) && found.get(id).character !== character) found.set(id, { ambiguous: true });
                else if (!found.has(id)) found.set(id, { character });
            }
            });
        }
    }
    for (const [id, where] of found) if (where.ambiguous) found.delete(id);
    return found;
}

async function readChat(ctx, id, where, signal) {
    const lines = where.group
        ? await post(ctx, '/api/chats/group/get', { id }, signal)
        : await post(ctx, '/api/chats/get', { ch_name: where.character.name, file_name: id, avatar_url: where.character.avatar }, signal);
    if (!Array.isArray(lines)) return null;
    const header = lines[0] && typeof lines[0] === 'object' && lines[0].chat_metadata ? lines[0] : null;
    return { metadata: header?.chat_metadata || {}, messages: header ? lines.slice(1) : lines };
}

// 本机这份和聊天文件里那份是不是同一份：成品 html、原始版本（和 html 一样时存成空）都要对上；
// 本机有文字替换回执、聊天文件里没有的不算。楼层被删过的标记不算「有」（楼层号可能已经错位）。
const birthOf = record => String(record?.initialHtml || record?.html || '');
const receiptsOf = record => JSON.stringify([record?.textReplacementReceipt || null, record?.textReplacementReceipts || null, record?.initialTextReplacementReceipt || null]);
const NO_RECEIPTS = JSON.stringify([null, null, null]);
function sameVersion(local, saved) {
    if (!local || !saved || !local.html || String(local.html) !== String(saved.html || '')) return false;
    if (birthOf(local) !== birthOf(saved)) return false;
    return receiptsOf(local) === NO_RECEIPTS || receiptsOf(local) === receiptsOf(saved);
}
function ownerHasRecord(owner, record) {
    if (!owner || owner.deleted === true) return false;
    if (sameVersion(record, owner)) return true;
    return Object.values(owner.faceSwipes || {}).some(state => (Array.isArray(state?.versions) ? state.versions : []).some(version => sameVersion(record, version)));
}

function imageCopyMatches(messages, token, entry, archive) {
    const want = [archive?.current, ...(Array.isArray(archive?.history) ? archive.history : [])]
        .filter(Boolean).map(item => String(item.path || item.url || ''));
    // 只在本机的整张图（data:）聊天文件里本来就没有，不能删。
    if (!want.length || want.some(url => !url || url.startsWith('data:'))) return false;
    for (const msg of messages) {
        const extras = [msg?.extra, ...(Array.isArray(msg?.swipe_info) ? msg.swipe_info.map(info => info?.extra) : [])].filter(Boolean);
        for (const extra of extras) {
            if (extra?.[IMAGE_OWNER]?.id !== token) continue;
            const copy = extra?.[IMAGE_EXTRA]?.[entry];
            const have = new Set([copy?.current, ...(Array.isArray(copy?.history) ? copy.history : [])].filter(Boolean).map(item => String(item.path || item.url || '')));
            if (want.every(url => have.has(url))) return true;
        }
    }
    return false;
}

/**
 * 统计所有别的聊天：返回 { chats, checked, unreadable, freeable, items }。
 * items 是可删的条目（带原样内容，删之前再核对一次没被改过）。
 */
export async function scanAllChatsForCleanup(ctx, { onProgress = null, signal = null } = {}) {
    const current = currentChatId(ctx);
    const local = { outputs: readJson(OUTPUTS) || {}, history: readJson(HISTORY)?.slots || {}, swipes: readJson(SWIPES)?.faces || {} };
    const byChat = new Map();
    const want = (chat, item) => { if (!chat || chat === current) return; if (!byChat.has(chat)) byChat.set(chat, []); byChat.get(chat).push(item); };
    for (const [slot, record] of Object.entries(local.outputs)) { const p = parseSlot(slot); if (p) want(p.chat, { kind: 'output', slot, p, record }); }
    for (const [slot, entries] of Object.entries(local.history)) {
        const p = parseSlot(slot); if (!p || !Array.isArray(entries)) continue;
        // 每个位置最新那份留着，和当前聊天的规则一样。
        const sorted = entries.slice().sort((a, b) => Number(a?.ts || 0) - Number(b?.ts || 0));
        sorted.slice(0, -1).forEach(entry => want(p.chat, { kind: 'history', slot, p, record: entry }));
    }
    for (const [key, state] of Object.entries(local.swipes)) {
        const [base, face] = key.split('\u0000');
        const p = parseSwipeBase(base); if (p) want(p.chat, { kind: 'swipe', key, p, face: Number(face) || 0, record: state });
    }
    for (const key of Object.keys(readAllImageKeys())) {
        const archive = readJson(key);
        const match = /^rabbitMirror:image:v1:images:owner:([^:]+):scope:[^:]*:(?:retired:[^:]+:)?(.+)$/.exec(key);
        const chat = stripJsonl(archive?.owner?.chat || '');
        if (match && chat) want(chat, { kind: 'image', key, token: match[1], entry: match[2], record: archive });
    }
    const result = { chats: byChat.size, checked: 0, unreadable: 0, freeable: 0, items: [] };
    if (!byChat.size) return result;
    const places = await locateChats(ctx, [...byChat.keys()], signal);
    let done = 0;
    for (const [chat, items] of byChat) {
        if (signal?.aborted) break;
        onProgress?.({ done, total: byChat.size });
        done += 1;
        const where = places.get(chat);
        if (!where) { result.unreadable += 1; continue; }
        let file = null;
        try { file = await readChat(ctx, chat, where, signal); } catch { file = null; }
        if (!file) { result.unreadable += 1; continue; }
        result.checked += 1;
        const owners = file.metadata?.[OWNERS]?.owners || {};
        for (const item of items) {
            let ok = false;
            if (item.kind === 'output' || item.kind === 'history') ok = ownerHasRecord(owners[`${item.p.index}:${item.p.swipe}`], item.record);
            else if (item.kind === 'swipe') {
                const saved = owners[`${item.p.index}:${item.p.swipe}`]?.faceSwipes?.[String(item.face)];
                const savedVersions = Array.isArray(saved?.versions) ? saved.versions : [];
                const mine = Array.isArray(item.record?.versions) ? item.record.versions : [];
                ok = mine.length > 0 && mine.every(version => savedVersions.some(other => sameVersion(version, other)));
            } else if (item.kind === 'image') ok = imageCopyMatches(file.messages, item.token, item.entry, item.record);
            if (!ok) continue;
            const bytes = item.kind === 'image' ? bytesOf(item.key, item.record) : bytesOf(item.slot || item.key, item.record);
            result.freeable += bytes;
            result.items.push({ kind: item.kind, chat, slot: item.slot, key: item.key, signature: JSON.stringify(item.record) });
        }
    }
    onProgress?.({ done: byChat.size, total: byChat.size });
    return result;
}

function readAllImageKeys() {
    const out = {};
    const s = store(); if (!s) return out;
    try { for (let i = 0; i < s.length; i += 1) { const key = s.key(i); if (key?.startsWith(`${IMAGE_PREFIX}owner:`)) out[key] = true; } } catch { /* 读不到就当没有 */ }
    return out;
}

/** 按统计结果删；每一条删之前再核对本机这份和统计时一模一样，变过的不删。返回删掉的字节数。 */
export function applyAllChatsCleanup(plan, ctx = null) {
    const s = store(); if (!s || !plan?.items?.length) return 0;
    // 统计后切进了其中某个聊天：那个聊天正在用，它的条目这次不删。
    const current = currentChatId(ctx || (() => { try { return globalThis.SillyTavern?.getContext?.(); } catch { return null; } })());
    plan = { ...plan, items: plan.items.filter(item => item.chat && item.chat !== current) };
    const before = rabbitBytes();
    const outputs = readJson(OUTPUTS) || {};
    const history = readJson(HISTORY) || { slots: {} };
    let outputsChanged = false, historyChanged = false;
    const swipeKeys = [];
    for (const item of plan.items) {
        if (item.kind === 'output' && JSON.stringify(outputs[item.slot]) === item.signature) { delete outputs[item.slot]; outputsChanged = true; }
        else if (item.kind === 'history' && Array.isArray(history.slots?.[item.slot])) {
            const list = history.slots[item.slot];
            const at = list.findIndex(entry => JSON.stringify(entry) === item.signature);
            if (at >= 0 && list.length > 1) { list.splice(at, 1); historyChanged = true; }
        } else if (item.kind === 'swipe') swipeKeys.push(item.key);
        else if (item.kind === 'image') { try { if (s.getItem(item.key) === item.signature) s.removeItem(item.key); } catch { /* 跳过 */ } }
    }
    try { if (outputsChanged) s.setItem(OUTPUTS, JSON.stringify(outputs)); } catch { /* 写不回就不动 */ }
    try { if (historyChanged) s.setItem(HISTORY, JSON.stringify(history)); } catch { /* 写不回就不动 */ }
    if (swipeKeys.length) {
        const faces = readJson(SWIPES)?.faces || {};
        const unchanged = swipeKeys.filter(key => plan.items.some(item => item.key === key && JSON.stringify(faces[key]) === item.signature));
        try { dropFaceSwipeStacksForCleanup(unchanged); } catch { /* 跳过 */ }
    }
    return Math.max(0, before - rabbitBytes());
}

function rabbitBytes() {
    const s = store(); let bytes = 0;
    if (!s) return 0;
    try { for (let i = 0; i < s.length; i += 1) { const key = s.key(i); if (/^rabbit_?mirror/i.test(String(key))) bytes += (String(key).length + String(s.getItem(key) || '').length) * 2; } } catch { /* 跳过 */ }
    return bytes;
}
