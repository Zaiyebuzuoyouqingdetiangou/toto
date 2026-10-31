import { dropFaceSwipeStacksForCleanup } from './swipeVersions.js?rmv=2.3.9';
import { messageStampSeconds, stampSeconds } from './messageStamp.js?rmv=2.3.9';
import { mirrorImageCopyCovers, mirrorImageCopyOnMessage, mirrorImageMessageOwns, mirrorImageKeySlot, parseMirrorImageArchiveKey, mirrorImageDraftSuperseded, mirrorImageLocalCopyNames } from './imageStore.js?rmv=2.3.9';
const OUTPUTS = 'rabbit_mirror_independent_outputs_v1';
const HISTORY = 'rabbit_mirror_independent_history_v1';
const SWIPES = 'rabbit_mirror_face_swipes_v1';
const IMAGE_PREFIX = 'rabbitMirror:image:v1:images:';
const DRAFT_PREFIX = 'rabbitMirror:image:v1:draft:';
const OWNERS = 'rabbit_mirror_independent_outputs_v2';
const RECIPES = 'rabbit_mirror_theater:selection_recipes:v1';
const PARTIALS = 'rabbit_mirror_follow_partial_results_v1';
const CHAT_RECIPES = 'rabbit_mirror_follow_recipes_v1';
const CHAT_PARTIALS = 'rabbit_mirror_follow_partials_v1';
const chatOfKey = key => /^chat:/.test(String(key || '')) ? stripJsonl(String(key).slice(5)) : '';
const sameJson = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const RECIPE_PLACE_KEYS = new Set(['key', 'chatKey', 'messageIndex', 'swipeId', 'source', 'messageFingerprint', 'ts', 'stamp', 'stampS']);
const recipeBody = record => JSON.stringify(Object.fromEntries(Object.entries(record || {}).filter(([key]) => !RECIPE_PLACE_KEYS.has(key))));
function recipeCovered(file, record) {
    const saved = file.metadata?.[CHAT_RECIPES]?.[`${record.messageIndex}:${record.swipeId}`];
    if (!saved)
        return false;
    const stamp = messageStampSeconds(file.messages?.[record.messageIndex], record.swipeId);
    const savedStamp = Number.isInteger(saved.stampS) ? saved.stampS : stampSeconds(saved.stamp);
    return !!stamp && savedStamp === stamp && recipeBody(saved) === recipeBody(record);
}
function partialCovered(metadata, record) {
    const saved = metadata?.[CHAT_PARTIALS]?.[`${record.messageIndex}:${record.swipeId}`];
    return !!saved && saved.chatKey === record.chatKey && saved.sourceHash === record.sourceHash && saved.html === record.html
        && sameJson(saved.failedFaces, record.failedFaces) && sameJson(saved.textReplacementReceipts, record.textReplacementReceipts);
}
const store = () => { try {
    return globalThis.localStorage || null;
}
catch {
    return null;
} };
const readJson = key => { try {
    return JSON.parse(store()?.getItem(key) || 'null');
}
catch {
    return null;
} };
const bytesOf = (key, value) => (String(key).length + JSON.stringify(value ?? '').length) * 2;
const stripJsonl = name => String(name || '').replace(/\.jsonl$/i, '');
function parseSlot(slot) {
    const match = /^chat:(.+):(\d+):(\d+):[0-9a-z]+$/i.exec(String(slot || ''));
    return match ? { chat: match[1], index: Number(match[2]), swipe: Number(match[3]) } : null;
}
function parseSwipeBase(base) {
    const text = String(base || '');
    const withHash = /^chat:(.+):(\d+):(\d+):[0-9a-f]{8,64}$/i.exec(text);
    const match = withHash || /^chat:(.+):(\d+):(\d+)$/i.exec(text);
    return match ? { chat: match[1], index: Number(match[2]), swipe: Number(match[3]) } : null;
}
function currentChatId(ctx) {
    try {
        return stripJsonl(ctx?.getCurrentChatId?.() ?? ctx?.chatId ?? '');
    }
    catch {
        return '';
    }
}
async function post(ctx, url, body, signal) {
    const headers = new Headers(typeof ctx?.getRequestHeaders === 'function' ? await ctx.getRequestHeaders() : {});
    headers.set('Content-Type', 'application/json');
    const response = await fetch(url, { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify(body), signal });
    if (!response.ok)
        throw new Error(`HTTP ${response.status}`);
    return response.json();
}
async function locateChats(ctx, chatIds, signal) {
    const found = new Map();
    const wanted = new Set(chatIds);
    for (const group of Array.isArray(ctx?.groups) ? ctx.groups : []) {
        for (const id of Array.isArray(group?.chats) ? group.chats : [])
            if (wanted.has(stripJsonl(id)))
                found.set(stripJsonl(id), { group: group.id });
    }
    const characters = (Array.isArray(ctx?.characters) ? ctx.characters : []).filter(item => item?.avatar);
    const remaining = () => [...wanted].filter(id => !found.has(id));
    const likely = characters.filter(item => remaining().some(id => id.startsWith(`${item.name} - `)));
    for (const list of [likely, characters.filter(item => !likely.includes(item))]) {
        for (let at = 0; at < list.length; at += 4) {
            if (!remaining().length || signal?.aborted)
                break;
            const batch = list.slice(at, at + 4);
            const lists = await Promise.all(batch.map(character => post(ctx, '/api/characters/chats', { avatar_url: character.avatar, simple: true }, signal).catch(() => null)));
            batch.forEach((character, index) => {
                const chats = lists[index];
                if (!chats)
                    return;
                const names = (Array.isArray(chats) ? chats : Object.values(chats || {})).map(item => stripJsonl(item?.file_name));
                for (const id of wanted)
                    if (names.includes(id)) {
                        if (found.has(id) && found.get(id).character !== character)
                            found.set(id, { ambiguous: true });
                        else if (!found.has(id))
                            found.set(id, { character });
                    }
            });
        }
    }
    for (const [id, where] of found)
        if (where.ambiguous)
            found.delete(id);
    return found;
}
async function readChat(ctx, id, where, signal) {
    const lines = where.group
        ? await post(ctx, '/api/chats/group/get', { id }, signal)
        : await post(ctx, '/api/chats/get', { ch_name: where.character.name, file_name: id, avatar_url: where.character.avatar }, signal);
    if (!Array.isArray(lines))
        return null;
    const header = lines[0] && typeof lines[0] === 'object' && lines[0].chat_metadata ? lines[0] : null;
    return { metadata: header?.chat_metadata || {}, messages: header ? lines.slice(1) : lines };
}
const birthOf = record => String(record?.initialHtml || record?.html || '');
const receiptsOf = record => JSON.stringify([record?.textReplacementReceipt || null, record?.textReplacementReceipts || null, record?.initialTextReplacementReceipt || null]);
const NO_RECEIPTS = JSON.stringify([null, null, null]);
function sameVersion(local, saved) {
    if (!local || !saved || !local.html || String(local.html) !== String(saved.html || ''))
        return false;
    if (birthOf(local) !== birthOf(saved))
        return false;
    return receiptsOf(local) === NO_RECEIPTS || receiptsOf(local) === receiptsOf(saved);
}
function ownerHasRecord(owner, record) {
    if (!owner || owner.deleted === true)
        return false;
    if (sameVersion(record, owner))
        return true;
    return Object.values(owner.faceSwipes || {}).some(state => (Array.isArray(state?.versions) ? state.versions : []).some(version => sameVersion(record, version)));
}
function archiveCovered(messages, archive, record) {
    for (const msg of messages) {
        if (!msg || typeof msg !== 'object')
            continue;
        const swipes = new Set([Number.isInteger(msg.swipe_id) ? msg.swipe_id : 0, ...(Array.isArray(msg.swipe_info) ? msg.swipe_info.map((_, index) => index) : [])]);
        for (const swipe of swipes) {
            if (mirrorImageMessageOwns(msg, swipe, record) && mirrorImageCopyCovers(mirrorImageCopyOnMessage(msg, swipe, archive.entry), record))
                return true;
        }
    }
    return false;
}
function slotCopy(messages, slot) {
    const msg = messages[Number(slot.mes)], swipe = Number(slot.swipe);
    const copy = mirrorImageCopyOnMessage(msg, swipe, slot.entry);
    return copy ? { msg, swipe, copy } : null;
}
const stripChatPrefix = name => String(name || '').replace(/^chat:/, '');
export async function scanAllChatsForCleanup(ctx, { onProgress = null, signal = null } = {}) {
    const current = currentChatId(ctx);
    const local = { outputs: readJson(OUTPUTS) || {}, history: readJson(HISTORY)?.slots || {}, swipes: readJson(SWIPES)?.faces || {} };
    const byChat = new Map();
    const want = (chat, item) => { if (!chat || chat === current)
        return; if (!byChat.has(chat))
        byChat.set(chat, []); byChat.get(chat).push(item); };
    for (const [slot, record] of Object.entries(local.outputs)) {
        const p = parseSlot(slot);
        if (p)
            want(p.chat, { kind: 'output', slot, p, record });
    }
    for (const [slot, entries] of Object.entries(local.history)) {
        const p = parseSlot(slot);
        if (!p || !Array.isArray(entries))
            continue;
        const sorted = entries.slice().sort((a, b) => Number(a?.ts || 0) - Number(b?.ts || 0));
        sorted.slice(0, -1).forEach(entry => want(p.chat, { kind: 'history', slot, p, record: entry }));
    }
    for (const [key, state] of Object.entries(local.swipes)) {
        const [base, face] = key.split('\u0000');
        const p = parseSwipeBase(base);
        if (p)
            want(p.chat, { kind: 'swipe', key, p, face: Number(face) || 0, record: state });
    }
    for (const record of Array.isArray(readJson(RECIPES)) ? readJson(RECIPES) : []) {
        const chat = chatOfKey(record?.chatKey);
        if (chat)
            want(chat, { kind: 'recipe', key: `recipe:${record.key}`, record });
    }
    for (const record of Array.isArray(readJson(PARTIALS)) ? readJson(PARTIALS) : []) {
        const chat = chatOfKey(record?.chatKey);
        if (chat)
            want(chat, { kind: 'partial', key: `partial:${record.messageIndex}:${record.swipeId}`, record });
    }
    for (const name of imageStoreNames()) {
        let raw = null, record = null;
        try {
            raw = store()?.getItem(name) ?? null;
            record = JSON.parse(raw || 'null');
        }
        catch {
            continue;
        }
        if (!record || typeof record !== 'object')
            continue;
        const draft = name.startsWith(DRAFT_PREFIX);
        const key = name.slice(draft ? DRAFT_PREFIX.length : IMAGE_PREFIX.length);
        const archive = draft ? null : parseMirrorImageArchiveKey(key);
        if (archive) {
            const chat = stripJsonl(stripChatPrefix(record.owner?.chat));
            if (chat && record.current?.imageOwner?.token === archive.token)
                want(chat, { kind: 'image', key: name, raw, archive, record });
            continue;
        }
        const slot = mirrorImageKeySlot(key);
        if (!slot || !/^\d+$/.test(slot.mes) || !/^\d+$/.test(slot.swipe))
            continue;
        want(stripJsonl(stripChatPrefix(slot.chat)), { kind: draft ? 'image-draft' : 'image-slot', key: name, imageKey: key, raw, slot, record });
    }
    const result = { chats: byChat.size, checked: 0, unreadable: 0, freeable: 0, items: [] };
    const planned = new Set();
    const allImageNames = imageStoreNames();
    if (!byChat.size)
        return result;
    const places = await locateChats(ctx, [...byChat.keys()], signal);
    let done = 0;
    for (const [chat, items] of byChat) {
        if (signal?.aborted)
            break;
        onProgress?.({ done, total: byChat.size });
        done += 1;
        const where = places.get(chat);
        if (!where) {
            result.unreadable += 1;
            continue;
        }
        let file = null;
        try {
            file = await readChat(ctx, chat, where, signal);
        }
        catch {
            file = null;
        }
        if (!file) {
            result.unreadable += 1;
            continue;
        }
        result.checked += 1;
        const owners = file.metadata?.[OWNERS]?.owners || {};
        for (const item of [...items.filter(item => item.kind !== 'image-draft'), ...items.filter(item => item.kind === 'image-draft')]) {
            let ok = false;
            if (item.kind === 'output' || item.kind === 'history')
                ok = ownerHasRecord(owners[`${item.p.index}:${item.p.swipe}`], item.record);
            else if (item.kind === 'swipe') {
                const saved = owners[`${item.p.index}:${item.p.swipe}`]?.faceSwipes?.[String(item.face)];
                const savedVersions = Array.isArray(saved?.versions) ? saved.versions : [];
                const mine = Array.isArray(item.record?.versions) ? item.record.versions : [];
                ok = mine.length > 0 && mine.every(version => savedVersions.some(other => sameVersion(version, other)));
            }
            else if (item.kind === 'recipe')
                ok = recipeCovered(file, item.record);
            else if (item.kind === 'partial')
                ok = partialCovered(file.metadata, item.record);
            else if (item.kind === 'image')
                ok = archiveCovered(file.messages, item.archive, item.record);
            else if (item.kind === 'image-slot') {
                const found = slotCopy(file.messages, item.slot);
                ok = !!found && mirrorImageMessageOwns(found.msg, found.swipe, item.record) && mirrorImageCopyCovers(found.copy, item.record);
            }
            else if (item.kind === 'image-draft') {
                const found = slotCopy(file.messages, item.slot);
                ok = !!found && mirrorImageDraftSuperseded(item.record, found.copy)
                    && !mirrorImageLocalCopyNames(item.imageKey, found.copy.current.imageOwner?.token, item.slot.entry, planned, allImageNames).length;
            }
            if (!ok)
                continue;
            if (item.raw != null) {
                result.freeable += (item.key.length + item.raw.length) * 2;
                result.items.push({ kind: 'image', chat, key: item.key, signature: item.raw });
                planned.add(item.key);
                continue;
            }
            const bytes = bytesOf(item.slot || item.key, item.record);
            result.freeable += bytes;
            result.items.push({ kind: item.kind, chat, slot: item.slot, key: item.key, signature: JSON.stringify(item.record) });
        }
    }
    onProgress?.({ done: byChat.size, total: byChat.size });
    return result;
}
function imageStoreNames() {
    const out = [];
    const s = store();
    if (!s)
        return out;
    try {
        for (let i = 0; i < s.length; i += 1) {
            const key = s.key(i);
            if (key?.startsWith(IMAGE_PREFIX) || key?.startsWith(DRAFT_PREFIX))
                out.push(key);
        }
    }
    catch { }
    return out;
}
export function applyAllChatsCleanup(plan, ctx = null) {
    const s = store();
    if (!s || !plan?.items?.length)
        return 0;
    const current = currentChatId(ctx || (() => { try {
        return globalThis.SillyTavern?.getContext?.();
    }
    catch {
        return null;
    } })());
    plan = { ...plan, items: plan.items.filter(item => item.chat && item.chat !== current) };
    const before = rabbitBytes();
    const outputs = readJson(OUTPUTS) || {};
    const history = readJson(HISTORY) || { slots: {} };
    let outputsChanged = false, historyChanged = false;
    const swipeKeys = [];
    for (const item of plan.items) {
        if (item.kind === 'output' && JSON.stringify(outputs[item.slot]) === item.signature) {
            delete outputs[item.slot];
            outputsChanged = true;
        }
        else if (item.kind === 'history' && Array.isArray(history.slots?.[item.slot])) {
            const list = history.slots[item.slot];
            const at = list.findIndex(entry => JSON.stringify(entry) === item.signature);
            if (at >= 0 && list.length > 1) {
                list.splice(at, 1);
                historyChanged = true;
            }
        }
        else if (item.kind === 'swipe')
            swipeKeys.push(item.key);
        else if (item.kind === 'image') {
            try {
                if (s.getItem(item.key) === item.signature)
                    s.removeItem(item.key);
            }
            catch { }
        }
    }
    for (const [kind, name] of [['recipe', RECIPES], ['partial', PARTIALS]]) {
        const drop = new Set(plan.items.filter(item => item.kind === kind).map(item => item.signature));
        if (!drop.size)
            continue;
        const list = Array.isArray(readJson(name)) ? readJson(name) : null;
        if (!list)
            continue;
        const next = list.filter(entry => !drop.has(JSON.stringify(entry)));
        try {
            if (next.length !== list.length)
                s.setItem(name, JSON.stringify(next));
        }
        catch { }
    }
    try {
        if (outputsChanged)
            s.setItem(OUTPUTS, JSON.stringify(outputs));
    }
    catch { }
    try {
        if (historyChanged)
            s.setItem(HISTORY, JSON.stringify(history));
    }
    catch { }
    if (swipeKeys.length) {
        const faces = readJson(SWIPES)?.faces || {};
        const unchanged = swipeKeys.filter(key => plan.items.some(item => item.key === key && JSON.stringify(faces[key]) === item.signature));
        try {
            dropFaceSwipeStacksForCleanup(unchanged);
        }
        catch { }
    }
    return Math.max(0, before - rabbitBytes());
}
function rabbitBytes() {
    const s = store();
    let bytes = 0;
    if (!s)
        return 0;
    try {
        for (let i = 0; i < s.length; i += 1) {
            const key = s.key(i);
            if (/^rabbit_?mirror/i.test(String(key)))
                bytes += (String(key).length + String(s.getItem(key) || '').length) * 2;
        }
    }
    catch { }
    return bytes;
}
