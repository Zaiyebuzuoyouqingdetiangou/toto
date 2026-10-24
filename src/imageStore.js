const PREFIX = 'rabbitMirror:image:v1:';
// 插图记录存在它所在的那条消息上（消息的附加数据里，跟着那一个 swipe 走），跟聊天记录一起存进聊天文件：
// 删楼层、删 swipe、开分支、群聊都跟着消息走；App 更新、清理数据、换设备都不丢；也不占本机存储。
// 只记看图要的（图片地址、时间、种子、提示词），整张图的 data: 不放进聊天记录。
// 本机存储只在这几种时候还用：图只有 data:（没能存成文件）、键还没记上楼层、或不是当前聊天（收藏夹另带一份）。
const EXTRA_KEY = 'rabbitMirrorImages';
const OWNER_KEY = 'rabbitMirrorImageOwner';
const REMOVED_KEY = 'rabbitMirrorImagesRemoved';
let ownerSequence = 0;
function imageSource(msg, swipe) { return String(Number(msg?.swipe_id || 0) === swipe ? msg?.mes ?? '' : msg?.swipes?.[swipe] ?? ''); }
function imageSourceHash(text) { let hash = 2166136261; for (const char of String(text)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619); return (hash >>> 0).toString(36); }
// 1.77.0 放在聊天信息里的那一格：读到就搬到对应的消息上。
const LEGACY_META_KEY = 'rabbitMirrorImages';

function storageKey(key, kind) {
    if (typeof key !== 'string' || !key) throw new TypeError('图片必须绑定到明确的聊天与镜面。');
    return `${PREFIX}${kind}:${key}`;
}

function liveContext() {
    try { return globalThis.SillyTavern?.getContext?.() || null; } catch { return null; }
}
function stripChat(value) { return String(value ?? '').replace(/^chat:/, ''); }
function currentChatName(ctx) { return stripChat(ctx?.getCurrentChatId?.() ?? ctx?.chatId ?? ''); }
// Host branches copy message extras, including our token. Their integrity is
// new, while a rename keeps it; an archive must belong to that chat as well.
function archiveScope(ctx) {
    const integrity = ctx?.chatMetadata?.integrity;
    return typeof integrity === 'string' && integrity ? `integrity:${integrity}` : `chat:${currentChatName(ctx)}`;
}
function ownerArchiveKey(token, scope, entry, source = '') {
    return `owner:${token}:scope:${encodeURIComponent(scope)}:${source ? `retired:${source}:` : ''}${entry}`;
}
function inheritedArchiveScope(token, entry) { return token.archiveScopes?.[entry] || token.archiveScope || ''; }
function rememberArchiveScope(extra, token, entry, scope, mes = null, current = null, history = null) {
    const marker = extra?.[OWNER_KEY];
    if (marker?.id !== token) return;
    const version = current ? imageSourceHash(imageIdentity(current)) : '';
    const historyVersions = Array.isArray(history) ? history.slice(-4).map(item => imageSourceHash(imageIdentity(item))) : null;
    if (inheritedArchiveScope(marker, entry) === scope && (!version || marker.archiveVersions?.[entry] === version)
        && (!historyVersions || JSON.stringify(marker.archiveHistoryVersions?.[entry]) === JSON.stringify(historyVersions))) return;
    if (inheritedArchiveScope(marker, entry) !== scope) (marker.archiveScopes ||= {})[entry] = scope;
    if (version) (marker.archiveVersions ||= {})[entry] = version;
    if (historyVersions) (marker.archiveHistoryVersions ||= {})[entry] = historyVersions;
    keyNamesGen += 1;
    if (Number.isInteger(mes)) requestChatSave(mes);
}
function imageRemoved(target) {
    return !!target && swipeExtras(target.msg, target.swipe).some(extra => extra?.[REMOVED_KEY]?.[target.entry] === true);
}
function clearImageRemoved(target) {
    for (const extra of swipeExtras(target.msg, target.swipe).filter(Boolean)) if (extra[REMOVED_KEY]?.[target.entry] === true) {
        delete extra[REMOVED_KEY][target.entry];
        keyNamesGen += 1;
    }
}
// 聊天加载完整（群聊加载中途会先放一个空的聊天信息，那时不读不写）。
function chatReady(ctx) {
    const metadata = ctx?.chatMetadata;
    if (!metadata || typeof metadata !== 'object' || !Array.isArray(ctx?.chat) || !ctx.chat.length) return false;
    return Object.keys(metadata).some(name => name !== LEGACY_META_KEY);
}
// 键 → 哪个聊天、哪一层、哪个 swipe、消息里那一格的名字。
// 内置生图 builtin:聊天:楼层:swipe:序号:哈希；手动生图是 JSON 数组 [聊天, 楼层, swipe, …]。
function slotOfKey(key) {
    const text = String(key || '');
    if (text.startsWith('builtin:')) {
        const parsed = parseBuiltinImageKey(text);
        if (!parsed) return null;
        return { chat: parsed.chat, mes: parsed.mes, swipe: parsed.swipe, entry: `${parsed.index}:${parsed.hash}` };
    }
    if (text.startsWith('[')) {
        try {
            const parts = JSON.parse(text);
            if (!Array.isArray(parts)) return null;
            return { chat: String(parts[0] ?? ''), mes: String(parts[1] ?? ''), swipe: String(parts[2] ?? ''), entry: `manual:${JSON.stringify(parts.slice(3))}` };
        } catch { return null; }
    }
    return null;
}
// 那个 swipe 的附加数据：正显示着的 swipe 用消息本身的；别的 swipe 用它自己存着的那份（切过去时酒馆会换上）。
// 只写一处：正显示着的 swipe 写消息本身（酒馆切走时会存回那个 swipe）；别的 swipe 写它自己那份。
function swipeExtras(msg, swipe) {
    const current = Number.isInteger(msg.swipe_id) ? msg.swipe_id : 0;
    if (swipe === current) return [msg.extra && typeof msg.extra === 'object' ? msg.extra : null];
    const info = Array.isArray(msg.swipe_info) ? msg.swipe_info[swipe] : null;
    return [info && typeof info === 'object' && info.extra && typeof info.extra === 'object' ? info.extra : null];
}
// 每条记录记着自己是哪个 swipe 的：右滑出新 swipe 时酒馆会把上一个 swipe 的附加数据整份抄过去，
// 抄过来的那些不是这个 swipe 的图，读的时候不认，写的时候顺手清掉。
function ownEntry(value, swipe) {
    return !!value && typeof value === 'object' && (value.swipe === undefined || Number(value.swipe) === swipe);
}
function pruneCopied(store, swipe) {
    let pruned = false;
    for (const [entry, value] of Object.entries(store)) if (value && typeof value === 'object' && value.swipe !== undefined && Number(value.swipe) !== swipe) { delete store[entry]; pruned = true; }
    return pruned;
}
// 这个键是当前聊天的、聊天却还没加载完整（消息上的插图记录读不到）：这时读到「没有」不算数，调用方要等一等再读。
export function mirrorImageChatLoading(key) {
    const ctx = liveContext();
    // 消息已经到了、聊天信息还是空的才算「加载中」；没有消息的聊天（新开、测试环境）不等。
    if (chatReady(ctx) || !Array.isArray(ctx?.chat) || !ctx.chat.length) return false;
    const slot = slotOfKey(key);
    const current = currentChatName(ctx);
    return !!slot && !!current && stripChat(slot.chat) === current;
}
// 当前聊天里这个键对应的消息格子。create 时没有就建。键不是当前聊天、楼层没记上或消息不在时返回 null。
function messageSlot(key, create = false) {
    const ctx = liveContext();
    if (!chatReady(ctx)) return null;
    const slot = slotOfKey(key);
    if (!slot || !/^\d+$/.test(slot.mes) || !/^\d+$/.test(slot.swipe)) return null;
    const current = currentChatName(ctx);
    if (!current || stripChat(slot.chat) !== current) return null;
    const mes = Number(slot.mes), swipe = Number(slot.swipe);
    const msg = ctx.chat[mes];
    if (!msg || typeof msg !== 'object') return null;
    const currentSwipe = Number.isInteger(msg.swipe_id) ? msg.swipe_id : 0;
    const hasInfo = Array.isArray(msg.swipe_info) && msg.swipe_info[swipe] && typeof msg.swipe_info[swipe] === 'object';
    if (swipe !== currentSwipe && !hasInfo) return null;
    if (create) {
        if (swipe === currentSwipe && (!msg.extra || typeof msg.extra !== 'object')) msg.extra = {};
        if (swipe !== currentSwipe && (!msg.swipe_info[swipe].extra || typeof msg.swipe_info[swipe].extra !== 'object')) msg.swipe_info[swipe].extra = {};
    }
    const extras = swipeExtras(msg, swipe).filter(Boolean);
    const stores = [];
    for (const extra of extras) {
        let store = extra[EXTRA_KEY];
        if (!store || typeof store !== 'object' || Array.isArray(store)) {
            if (!create) continue;
            store = {};
            extra[EXTRA_KEY] = store;
        }
        stores.push(store);
    }
    if (!stores.length && !extras.some(extra => extra[OWNER_KEY]?.id)) return null;
    return { ctx, mes, msg, swipe, entry: slot.entry, stores };
}
// 聊天记录里那份：去掉有地址时多余的 data: 副本；只有 data: 的整张图不放（太大），这时返回 null。
function chatCopy(value) {
    if (!value || typeof value !== 'object') return null;
    const light = entry => {
        if (!entry || typeof entry !== 'object') return entry;
        const { dataUrl, ...rest } = entry;
        const url = String(rest.path || rest.url || '');
        if (!url || url.startsWith('data:')) return null;
        return rest;
    };
    const current = light(value.current);
    if (!current) return null;
    return { version: 1, current, history: (Array.isArray(value.history) ? value.history : []).map(light).filter(Boolean) };
}
// 请酒馆找个安全的时候把聊天存一次。合并同一时段的写入，但保存目标始终是写入时的聊天与消息。
// 切换／重新加载后不保存已卸载的旧聊天，也不拿当前聊天冒充；本机副本继续兜底。
let saveTimer = 0;
let saveRequest = null;
function liveChatSaveContext(request) {
    const ctx = liveContext();
    return request && chatReady(ctx) && ctx.chat === request.chat && ctx.chatMetadata === request.metadata
        && currentChatName(ctx) === request.name && ctx.chat[request.mes] === request.msg ? ctx : null;
}
function requestChatSave(mes) {
    const ctx = liveContext();
    if (!chatReady(ctx) || !Number.isInteger(mes) || !ctx.chat[mes]) return;
    const name = currentChatName(ctx);
    if (!name) return;
    saveRequest = { chat: ctx.chat, metadata: ctx.chatMetadata, name, mes, msg: ctx.chat[mes] };
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
        saveTimer = 0;
        const request = saveRequest;
        saveRequest = null;
        if (!liveChatSaveContext(request)) return;
        import('./independentApi/persistence.js?rmv=1.82.1')
            .then(module => {
                // 动态模块加载期间也可能切聊天；取得接口后再核对一次。
                const live = liveChatSaveContext(request);
                if (live) module.requestSafeChatSave?.(live, request.mes, request.msg);
            })
            .catch(() => { /* 存不上就等酒馆下次自己存 */ });
    }, 1500);
}
function writeMessageImage(key, value) {
    const copy = chatCopy(value);
    if (!copy) {
        // 这次是只有 data: 的图（不放进聊天记录）：消息上同一格的旧图删掉，免得以后读回旧的那张。
        const existing = messageSlot(key);
        if (existing && existing.stores.some(store => Object.prototype.hasOwnProperty.call(store, existing.entry))) {
            existing.stores.forEach(store => { delete store[existing.entry]; });
            requestChatSave(existing.mes);
        }
        return false;
    }
    const target = messageSlot(key, true);
    if (!target) return false;
    clearImageRemoved(target);
    target.stores.forEach(store => { pruneCopied(store, target.swipe); store[target.entry] = { ...structuredCloneSafe(copy), swipe: target.swipe }; });
    keyNamesGen += 1;
    requestChatSave(target.mes);
    return true;
}
function structuredCloneSafe(value) {
    try { return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)); } catch { return JSON.parse(JSON.stringify(value)); }
}
function readMessageImage(key) {
    const target = messageSlot(key);
    if (!target || imageRemoved(target)) return null;
    let current = null;
    for (const store of target.stores) {
        const value = store[target.entry];
        if (ownEntry(value, target.swipe) && recordMatchesMessage(value, target.msg, target.swipe, false)) { const { swipe, ...record } = value; current = record; break; }
    }
    // The owner archive also records explicit version selections. It is the
    // authoritative local completion when a server snapshot still has old art.
    for (const extra of swipeExtras(target.msg, target.swipe).filter(Boolean)) {
        const token = extra[OWNER_KEY];
        if (!token?.id || Number(token.swipe) !== target.swipe) continue;
        try {
            const scope = archiveScope(target.ctx);
            const scopedKey = ownerArchiveKey(token.id, scope, target.entry);
            const readArchive = name => {
                const text = globalThis.localStorage.getItem(storageKey(name, 'images'));
                if (text === null) return null;
                const value = JSON.parse(text);
                if (!value || value.version !== 1 || !value.current || !Array.isArray(value.history) || value.current.imageOwner?.token !== token.id)
                    throw new TypeError('图片存档格式或归属无法识别，原存档已保留。');
                return value;
            };
            let retained = readArchive(scopedKey);
            // A completion whose source changed while it was in flight is kept
            // separately. It may restore only its exact source and an empty slot.
            if (!retained && !current) retained = readArchive(ownerArchiveKey(token.id, scope, target.entry, imageSourceHash(imageSource(target.msg, target.swipe))));
            let scoped = !!retained;
            if (!retained) {
                // Inherit a copied message's existing art once. A different
                // branch's later completion must not supersede its snapshot.
                const fromScope = inheritedArchiveScope(token, target.entry);
                const inherited = fromScope && fromScope !== scope
                    ? readArchive(ownerArchiveKey(token.id, fromScope, target.entry)) : null;
                let legacy = !inherited ? readArchive(`owner:${token.id}:${target.entry}`) : null;
                if (!inherited && !legacy && !current) legacy = readArchive(`owner:${token.id}:retired:${imageSourceHash(imageSource(target.msg, target.swipe))}:${target.entry}`);
                let source = inherited || legacy;
                if (source?.current?.imageOwner?.token === token.id) {
                    const sourceVersions = [...source.history, source.current];
                    const sameLegacyChat = !inherited && (!source.owner?.scope || source.owner.scope === scope)
                        && stripChat(source.owner?.chat) === currentChatName(target.ctx);
                    // A checkpoint may first open after its parent redrew.
                    // Its small saved version stamp identifies the inherited
                    // data-only result without copying base64 into the chat.
                    const version = token.archiveVersions?.[target.entry];
                    if (!current && !sameLegacyChat && !version) {
                        throw Object.assign(new TypeError('这张旧图片在分支创建时的版本无法确认，原存档已保留；可手动重新生图。'), { code: 'image_version_unconfirmed' });
                    }
                    if (!current && !sameLegacyChat && version && imageSourceHash(imageIdentity(source.current)) !== version) {
                        const chosen = source.history.find(item => imageSourceHash(imageIdentity(item)) === version);
                        if (!chosen) throw new TypeError('这张图片原有版本暂未找到，已有存档已保留，没有改用其他图片。');
                        source = { ...source, current: chosen, history: imageHistory([...source.history, source.current], chosen) };
                    }
                    retained = source;
                    if (!sameLegacyChat) {
                        const selected = current?.current || source.current;
                        const historyVersions = token.archiveHistoryVersions?.[target.entry];
                        const available = [...sourceVersions, ...(current?.history || [])];
                        // A copied checkpoint carries only small version stamps.
                        // Parent selections can reorder history, so neither its
                        // current order nor its later drawings belong here.
                        const history = Array.isArray(historyVersions)
                            ? historyVersions.map(version => available.find(item => imageSourceHash(imageIdentity(item)) === version)).filter(Boolean)
                            : current?.history || [];
                        retained = { ...source, ...(current || {}), current: selected, history: imageHistory(history, selected) };
                    }
                    retained = { ...retained, owner: { ...source.owner, chat: currentChatName(target.ctx), scope } };
                    // A failed local safety copy must not hide an already
                    // readable image. The original archive is never changed.
                    try { globalThis.localStorage.setItem(storageKey(scopedKey, 'images'), JSON.stringify(retained)); scoped = true; } catch { /* Return the readable inherited image. */ }
                }
            }
            if (retained?.current?.imageOwner?.token !== token.id) continue;
            if (scoped) rememberArchiveScope(extra, token.id, target.entry, scope, target.mes, retained.current, retained.history);
            if (JSON.stringify(chatCopy(current)) !== JSON.stringify(chatCopy(retained))) {
                const copy = chatCopy(retained);
                if (copy) {
                    const store = extra[EXTRA_KEY] ||= {};
                    store[target.entry] = { ...copy, swipe: target.swipe };
                    requestChatSave(target.mes);
                }
            }
            return retained;
        } catch (error) {
            // With no readable message copy this is a broken paid archive,
            // not evidence that the frame has never been drawn.
            if (!current) throw error;
        }
    }
    return current;
}

function recordMatchesMessage(value, msg, swipe, matchSource = true) {
    const owner = value?.current?.imageOwner;
    if (!owner) return true; // Legacy records already carried by their message.
    return swipeExtras(msg, swipe).some(extra => extra?.[OWNER_KEY]?.id === owner.token && Number(extra?.[OWNER_KEY]?.swipe) === swipe)
        && (!matchSource || owner.source === imageSourceHash(imageSource(msg, swipe)));
}

function imageIdentity(entry) { return JSON.stringify([entry?.path || entry?.url || entry?.dataUrl, entry?.generatedAt || '', entry?.promptMetadata?.seed ?? null]); }
function imageHistory(entries, current) {
    const seen = new Set([imageIdentity(current)]), result = [];
    for (const entry of [...entries].reverse()) { const id = imageIdentity(entry); if (seen.has(id)) continue; seen.add(id); result.unshift(slimEntry(entry)); }
    return result.slice(-4);
}

/** Capture before dispatch; never re-resolve a completed request by floor alone. */
export function captureMirrorImageOwner(key) {
    const target = messageSlot(key, true);
    if (!target) return null;
    let extra = swipeExtras(target.msg, target.swipe).find(Boolean);
    let token = extra[OWNER_KEY];
    const sourceHash = imageSourceHash(imageSource(target.msg, target.swipe));
    if (!token?.id || Number(token.swipe) !== target.swipe) {
        // Some host versions temporarily alias a newly copied swipe's extra to
        // the old swipe. Give only the new swipe a copy before changing tokens.
        const infos = Array.isArray(target.msg.swipe_info) ? target.msg.swipe_info : [];
        if (token?.id && Number(token.swipe) !== target.swipe && infos.some((info, index) => index !== target.swipe && info?.extra === extra)) {
            const old = extra; extra = structuredCloneSafe(extra);
            if (Number(target.msg.swipe_id || 0) === target.swipe) target.msg.extra = extra;
            if (infos[target.swipe]?.extra === old) infos[target.swipe].extra = extra;
        }
        token = { id: `${Date.now().toString(36)}-${(++ownerSequence).toString(36)}-${Math.random().toString(36).slice(2)}`, swipe: target.swipe, source: sourceHash, archiveScope: archiveScope(target.ctx) };
        extra[OWNER_KEY] = token;
        requestChatSave(target.mes);
    }
    return { chat: currentChatName(target.ctx), message: target.msg, entry: target.entry,
        token: token.id, source: imageSource(target.msg, target.swipe), swipe: target.swipe, scope: archiveScope(target.ctx),
        extra, originalMes: target.mes };
}

function ownedTarget(owner, { matchSource = true } = {}) {
    const ctx = liveContext();
    if (!owner || !chatReady(ctx) || currentChatName(ctx) !== owner.chat || (owner.scope && archiveScope(ctx) !== owner.scope)) return null;
    const matches = [];
    ctx.chat.forEach((msg, mes) => {
        const swipes = new Set([Number(msg?.swipe_id || 0), ...(Array.isArray(msg?.swipe_info) ? msg.swipe_info.map((_, index) => index) : [])]);
        for (const swipe of swipes) for (const extra of swipeExtras(msg, swipe).filter(Boolean)) {
            const sourceMatches = !matchSource || (typeof owner.source === 'string' ? imageSource(msg, swipe) === owner.source
                : typeof owner.sourceHash === 'string' && imageSourceHash(imageSource(msg, swipe)) === owner.sourceHash);
            if (extra[OWNER_KEY]?.id === owner.token && Number(extra[OWNER_KEY]?.swipe) === swipe && sourceMatches) matches.push({ ctx, msg, mes, swipe, extra });
        }
    });
    const exact = matches.filter(target => target.msg === owner.message);
    return exact.length === 1 ? exact[0] : matches.length === 1 ? matches[0] : null;
}

// Small read-only receipt for locally saved drafts; do not serialize a whole
// message or its source body into every draft. Paid saves require the full owner.
export function mirrorImageOwnerReceipt(owner) {
    if (!owner?.token || !owner.entry || !owner.chat || typeof owner.source !== 'string') return null;
    return { chat: owner.chat, token: owner.token, entry: owner.entry, sourceHash: imageSourceHash(owner.source), ...(owner.scope ? { scope: owner.scope } : {}) };
}

export function mirrorImageOwnerMatchesKey(owner, key, { matchEntry = true } = {}) {
    const slot = slotOfKey(key), target = ownedTarget(owner);
    return !!slot && !!target && stripChat(slot.chat) === owner.chat && Number(slot.mes) === target.mes && Number(slot.swipe) === target.swipe && (!matchEntry || slot.entry === owner.entry);
}

/** Preserve every completed paid result under an owner token, including deleted
 * or unloaded owners. The archive is never part of numeric/legacy key lookup. */
function markMessageCopySaved(error) {
    try { Object.defineProperty(error, 'messageCopySaved', { value: true, configurable: true }); } catch { /* 冻结的错误对象：调用方按没存处理 */ }
    return error;
}

export function saveMirrorImageForOwner(key, record, owner, { preserveCurrent = false } = {}) {
    if (!owner?.message || !owner.extra || typeof owner.source !== 'string') throw new TypeError('图片请求缺少原始消息归属。');
    const target = ownedTarget(owner);
    const changedSource = !target && (ownedTarget(owner, { matchSource: false }) || imageSource(owner.message, owner.swipe) !== owner.source);
    const scope = owner.scope || `chat:${owner.chat}`;
    const retainedKey = ownerArchiveKey(owner.token, scope, owner.entry, changedSource ? imageSourceHash(owner.source) : '');
    record = { ...record, imageOwner: { token: owner.token, source: imageSourceHash(owner.source) } };
    // Refuse to overwrite an unreadable paid archive. The caller retains the
    // new completion in its session and can report that durable saving failed.
    let previous = loadMirrorImage(retainedKey);
    const candidate = target?.extra[EXTRA_KEY]?.[owner.entry];
    const messagePrevious = target && ownEntry(candidate, target.swipe) && recordMatchesMessage(candidate, target.msg, target.swipe, false) ? candidate : null;
    if (!previous && preserveCurrent && messagePrevious) previous = { ...messagePrevious.current, history: messagePrevious.history || [] };
    const keepCurrent = preserveCurrent && previous?.imageOwner?.token === owner.token;
    // 被后来的请求替代、却在原图框位置第一次存下的旧结果，并没有换上镜面。
    // 留存它，但不把返回时间当显示时间，避免挪回原位或冷启动时抢过新图。
    if (!keepCurrent) record = { ...record, shownAt: preserveCurrent ? 0 : Date.now() };
    const history = imageHistory(previous ? [...previous.history, keepCurrent ? record : storedRecord(previous)] : [], keepCurrent ? previous : record);
    if (keepCurrent) record = storedRecord(previous);
    const retained = { ...storedRecord(record), history };
    const archive = { version: 1, current: storedRecord(retained), history: retained.history,
        owner: { chat: owner.chat, message: owner.originalMes, swipe: owner.swipe, source: imageSourceHash(owner.source), scope } };
    let archiveError = null;
    try { write(retainedKey, 'images', archive); } catch (error) { archiveError = error; }
    if (target) {
        if (!archiveError) rememberArchiveScope(target.extra, owner.token, owner.entry, scope, target.mes, archive.current, archive.history);
        if (!chatCopy(archive)) {
            // data: payloads live once, under the owner archive. An older file
            // record must not mask the newly completed data-only image.
            if (archiveError) throw archiveError;
            if (target.extra[EXTRA_KEY]) delete target.extra[EXTRA_KEY][owner.entry];
            clearImageRemoved({ ...target, entry: owner.entry });
            requestChatSave(target.mes);
            return retained;
        }
        const parsed = parseBuiltinImageKey(key);
        const manual = !parsed ? JSON.parse(key) : null;
        const liveKey = parsed ? `builtin:${owner.chat}:${target.mes}:${target.swipe}:${parsed.index}:${parsed.hash}`
            : JSON.stringify([manual[0], target.mes, target.swipe, ...manual.slice(3)]);
        // Use the owner's existing versions, never an old local numeric occupant.
        const history = keepCurrent ? retained.history : imageHistory([...(retained.history || []), ...(messagePrevious?.history || []), ...(messagePrevious?.current ? [messagePrevious.current] : [])], record);
        const result = replaceMirrorImageVersions(liveKey, record, history, { keepShownAt: preserveCurrent });
        // A chat save is only queued, not an acknowledgement of durable disk
        // storage. Preserve the caller's session/unsaved warning if both local
        // safety writes failed, even though the live message has the picture.
        // 消息上已经写好了完整记录：告诉调用方，别再拿「最小那份」去盖掉它（提示词、长相来源会跟着丢）。
        if (archiveError) throw markMessageCopySaved(archiveError);
        return result;
    }
    // The original object can be reinserted/recovered during this session. Do
    // not alter it after its content or swipe has changed into another output.
    if (imageSource(owner.message, owner.swipe) === owner.source && owner.extra[OWNER_KEY]?.id === owner.token) {
        if (!archiveError) rememberArchiveScope(owner.extra, owner.token, owner.entry, scope, null, archive.current, archive.history);
        const store = owner.extra[EXTRA_KEY] ||= {};
        const copy = chatCopy(archive);
        if (copy) { store[owner.entry] = { ...copy, swipe: owner.swipe }; if (archiveError) throw markMessageCopySaved(archiveError); }
    }
    if (archiveError) throw archiveError;
    return retained;
}

function removeMessageImage(key) {
    const target = messageSlot(key);
    if (!target) return;
    let removed = false;
    for (const store of target.stores) if (Object.prototype.hasOwnProperty.call(store, target.entry)) { delete store[target.entry]; removed = true; }
    if (removed) { keyNamesGen += 1; requestChatSave(target.mes); }
}
// 收藏夹里别的聊天的面：收藏时把那一面的插图记录一并存进收藏，打开收藏时登记在这里（只在这次打开页面里有效）。
const borrowed = new Map();
function borrowKey(chat, mes, swipe) { return `${stripChat(chat)}|${mes}|${swipe}`; }
export function lendMirrorImages(chat, mes, swipe, entries) {
    if (!entries || typeof entries !== 'object') return;
    borrowed.set(borrowKey(chat, mes, swipe), entries);
    if (borrowed.size > 200) borrowed.delete(borrowed.keys().next().value);
}
function readBorrowed(key) {
    const slot = slotOfKey(key);
    if (!slot) return null;
    const value = borrowed.get(borrowKey(slot.chat, slot.mes, slot.swipe))?.[slot.entry];
    return value && typeof value === 'object' ? value : null;
}
// 收藏一面时：这一面在当前聊天里的插图记录（只要看图要的那份），存进收藏。
// 收藏里只带看图要的（地址、时间、尺寸方式、渠道），不带提示词；整份不超过 32KB。
function favoriteLight(value) {
    const light = entry => entry && typeof entry === 'object' ? Object.fromEntries(Object.entries({
        url: entry.url, path: entry.path, generatedAt: entry.generatedAt, builtinImageFit: entry.builtinImageFit, provider: entry.provider,
    }).filter(([, item]) => item !== undefined && item !== null && item !== '')) : null;
    const current = light(value?.current);
    return current && (current.path || current.url) && !String(current.path || current.url).startsWith('data:') ? { version: 1, current, history: [] } : null;
}
export function mirrorImagesForSlot(mes, swipe, chatKey = '') {
    const ctx = liveContext();
    if (!chatReady(ctx)) return null;
    const current = currentChatName(ctx);
    if (chatKey && stripChat(chatKey) !== current) return null;
    const msg = ctx.chat?.[Number(mes)];
    if (!msg) return null;
    const out = {};
    for (const extra of swipeExtras(msg, Number(swipe)).filter(Boolean)) {
        const store = extra[EXTRA_KEY];
        if (store && typeof store === 'object') for (const [entry, value] of Object.entries(store)) {
            if (out[entry] || !ownEntry(value, Number(swipe))) continue;
            const light = favoriteLight(value);
            if (light) out[entry] = light;
        }
    }
    // 本机里还没搬过去的旧记录也带上。
    for (const name of localImageNames()) {
        const slot = slotOfKey(name.slice(`${PREFIX}images:`.length));
        if (!slot || stripChat(slot.chat) !== current || slot.mes !== String(mes) || slot.swipe !== String(swipe) || out[slot.entry]) continue;
        try { const light = favoriteLight(JSON.parse(globalThis.localStorage.getItem(name))); if (light) out[slot.entry] = light; } catch { /* 读不到就不带 */ }
    }
    if (!Object.keys(out).length) return null;
    while (JSON.stringify(out).length > 32768 && Object.keys(out).length) delete out[Object.keys(out).pop()];
    return Object.keys(out).length ? out : null;
}
function localImageNames() {
    const head = `${PREFIX}images:`;
    const names = [];
    const storage = globalThis.localStorage;
    try { if (storage) for (let i = 0; i < storage.length; i += 1) { const name = storage.key(i); if (name?.startsWith(head)) names.push(name); } } catch { /* 读不到就当没有 */ }
    return names;
}
// 以前存在本机、或 1.77.0 放在聊天信息里的插图记录：打开聊天后第一次读写时，搬到对应的消息上（消息上已经有的不覆盖）。
// 本机那份先留着（聊天存盘之前它是唯一的一份），以后不再往本机写新的。
const migratedChats = new WeakSet();
function migrateIntoMessages() {
    const ctx = liveContext();
    if (!chatReady(ctx) || migratedChats.has(ctx.chatMetadata) || !currentChatName(ctx)) return;
    migratedChats.add(ctx.chatMetadata);
    let moved = 0, lastMes = -1;
    const adopt = (key, value) => {
        const copy = chatCopy(value);
        if (!copy) return false;
        const target = messageSlot(key, true);
        if (!target) return false;
        if (imageRemoved(target)) return false;
        if (!recordMatchesMessage(value, target.msg, target.swipe)) return false;
        if (target.stores.some(store => ownEntry(store[target.entry], target.swipe))) return true;
        target.stores.forEach(store => { pruneCopied(store, target.swipe); store[target.entry] = { ...structuredCloneSafe(copy), swipe: target.swipe }; });
        moved += 1; lastMes = target.mes;
        return true;
    };
    const legacy = ctx.chatMetadata[LEGACY_META_KEY];
    if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) {
        for (const [key, value] of Object.entries(legacy)) if (adopt(key, value)) delete legacy[key];
        if (!Object.keys(legacy).length) delete ctx.chatMetadata[LEGACY_META_KEY];
    }
    const head = `${PREFIX}images:`;
    const currentName = currentChatName(ctx);
    for (const name of localImageNames()) {
        const key = name.slice(head.length);
        const slot = slotOfKey(key);
        // 先按键里的聊天名挑出这个聊天的，再解析（data: 整图很大，别的聊天的不读）。
        if (!slot || stripChat(slot.chat) !== currentName) continue;
        let value = null;
        try { value = JSON.parse(globalThis.localStorage.getItem(name)); } catch { value = null; }
        if (value) adopt(key, value);
    }
    if (moved) { keyNamesGen += 1; requestChatSave(lastMes); }
}
// 存档里所有插图的键：本机的、当前聊天各消息上的、还没搬走的聊天信息里的。
// 消息上的键按「这个聊天数组、条数、各消息正显示的 swipe、本插件写过几次」记一份，没变就不再整条聊天扫一遍。
let keyNamesGen = 0;
const keyNamesCache = new WeakMap();
function messageKeyNames(ctx) {
    const signature = `${ctx.chat.length}|${keyNamesGen}|${currentChatName(ctx)}|${ctx.chat.reduce((sum, msg, index) => sum + (Number.isInteger(msg?.swipe_id) ? msg.swipe_id * (index + 1) : 0), 0)}`;
    const cached = keyNamesCache.get(ctx.chat);
    if (cached?.signature === signature) return cached.names;
    const names = [];
    const head = `${PREFIX}images:`;
    const chat = currentChatName(ctx);
    ctx.chat.forEach((msg, mes) => {
        if (!msg || typeof msg !== 'object') return;
        const swipes = new Set([Number.isInteger(msg.swipe_id) ? msg.swipe_id : 0]);
        if (Array.isArray(msg.swipe_info)) msg.swipe_info.forEach((_, index) => swipes.add(index));
        for (const swipe of swipes) for (const extra of swipeExtras(msg, swipe).filter(Boolean)) {
            const store = extra[EXTRA_KEY];
            const entries = new Set();
            if (store && typeof store === 'object') {
                for (const [entry, value] of Object.entries(store)) if (!entry.startsWith('manual:') && ownEntry(value, swipe)) entries.add(entry);
            }
            // Data-only images have no message copy. Their small version index
            // still belongs to this message token and swipe, and resolves through
            // readMessageImage's scoped archive checks without scanning payloads.
            const marker = extra[OWNER_KEY];
            if (marker?.id && Number(marker.swipe) === swipe) {
                for (const [entry, version] of Object.entries(marker.archiveVersions || {})) {
                    const parsed = parseBuiltinImageKey(`builtin:${chat}:${mes}:${swipe}:${entry}`);
                    if (typeof version === 'string' && version && parsed?.hash && parseBuiltinFrameIndex(parsed.index)) entries.add(entry);
                }
            }
            for (const entry of entries) if (extra[REMOVED_KEY]?.[entry] !== true) names.push(`${head}builtin:${chat}:${mes}:${swipe}:${entry}`);
        }
    });
    keyNamesCache.set(ctx.chat, { signature, names });
    return names;
}
function imageKeyNames() {
    const head = `${PREFIX}images:`;
    const names = new Set(localImageNames());
    const ctx = liveContext();
    if (chatReady(ctx)) {
        for (const name of messageKeyNames(ctx)) names.add(name);
        const legacy = ctx.chatMetadata?.[LEGACY_META_KEY];
        if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) for (const key of Object.keys(legacy)) names.add(head + key);
    }
    for (const [slot, entries] of borrowed) {
        const parts = slot.split('|'), swipe = parts.pop(), mes = parts.pop(), chat = parts.join('|');
        for (const entry of Object.keys(entries)) if (!entry.startsWith('manual:')) names.add(`${head}builtin:${chat}:${mes}:${swipe}:${entry}`);
    }
    return [...names];
}

function read(key, kind) {
    if (kind !== 'images') {
        const text = globalThis.localStorage.getItem(storageKey(key, kind));
        return text == null ? null : JSON.parse(text);
    }
    migrateIntoMessages();
    if (imageRemoved(messageSlot(key))) return null;
    const fromMessage = readMessageImage(key);
    if (fromMessage) return fromMessage;
    const text = globalThis.localStorage.getItem(storageKey(key, kind));
    if (text != null) {
        const value = JSON.parse(text);
        const slot = slotOfKey(key), ctx = liveContext();
        if (value?.current?.imageOwner && slot && stripChat(slot.chat) === currentChatName(ctx)) {
            const msg = ctx?.chat?.[Number(slot.mes)];
            if (!msg || !recordMatchesMessage(value, msg, Number(slot.swipe))) return null;
        }
        // 本机还有、消息上没有（楼层后来才记上）：搬到消息上。
        if (chatCopy(value)) writeMessageImage(key, value);
        return value;
    }
    const legacy = liveContext()?.chatMetadata?.[LEGACY_META_KEY]?.[key];
    if (legacy && typeof legacy === 'object') { writeMessageImage(key, legacy); return legacy; }
    return readBorrowed(key);
}

function write(key, kind, value) {
    // 插图写在消息上（跟聊天记录一起存）。本机另留一份很小的（只有地址、时间这些，不含整张图），
    // 防的是聊天还没存盘就关了 App；写不进去（本机满了）也不要紧。本机旧记录里有只存在本机的 data: 整图版本时，那份原样留着。
    if (kind === 'images' && writeMessageImage(key, value)) {
        const name = storageKey(key, kind);
        let keepOld = false;
        try {
            const old = JSON.parse(globalThis.localStorage.getItem(name) || 'null');
            const dataOnly = entry => entry && typeof entry === 'object' && !entry.path && /^data:/.test(String(entry.url || entry.dataUrl || ''));
            keepOld = !!old && (dataOnly(old.current) || (Array.isArray(old.history) && old.history.some(dataOnly)));
        } catch { keepOld = false; }
        if (!keepOld) {
            const light = chatCopy(value);
            try { globalThis.localStorage.setItem(name, JSON.stringify(light)); }
            catch {
                // 本机快满：本机这份退到只留看图要的（地址、时间、种子），消息上的完整记录不动。
                const tiny = entry => entry && typeof entry === 'object' ? slimEntry(entry) : entry;
                try { if (light) globalThis.localStorage.setItem(name, JSON.stringify({ ...light, current: tiny(light.current), history: [] })); } catch { /* 本机满了就只靠聊天记录 */ }
            }
        }
        return;
    }
    // A single atomic setItem: a quota/error leaves the entire old record intact.
    const name = storageKey(key, kind), text = JSON.stringify(value);
    try { globalThis.localStorage.setItem(name, text); }
    catch (error) {
        // 本机存储满了：先把各张图旧版本里的长提示词瘦下来（图本身一张不删），腾出地方再写一次。
        if (!slimMirrorImagesForQuota()) throw error;
        globalThis.localStorage.setItem(name, text);
    }
}

// 旧版本（翻回去看的那几张）只留看图要用的：地址、时间、种子、格式；长提示词、人物外貌不留（没有文件路径、
// 只有 data: 的那张保留图本身）。当前那张不动（重画沿用它的提示词）；翻回旧版本时沿用换下来那张的提示词（builtinImage.js）。
// 一张图用的那段提示词的指纹：旧版本瘦掉提示词后留着它，翻回去时只在和当前那张一样时才借用。
export function imagePromptFingerprint(entry) {
    if (!entry || typeof entry !== 'object') return '';
    if (entry.slimmed === true) return String(entry.promptHash || '');
    const meta = entry.promptMetadata && typeof entry.promptMetadata === 'object' ? entry.promptMetadata : {};
    const text = JSON.stringify([String(meta.prompt || ''), String(meta.nl || ''), String(meta.flatPrompt || ''), String(entry.prompt || ''), meta.promptFormat || '']);
    if (text === JSON.stringify(['', '', '', '', ''])) return '';
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 0x01000193) >>> 0; }
    return hash.toString(36);
}

function slimEntry(entry) {
    if (!entry || typeof entry !== 'object') return entry;
    if (entry.slimmed === true) return { ...entry };
    // 用户自己改过提示词画的那张：提示词留着（只有这一类留，占不了多少），翻回去重画照它的来。
    if (entry.editedPrompt === true) { const { dataUrl: ignored, ...rest } = entry; return entry.path ? rest : { ...entry }; }
    const promptHash = imagePromptFingerprint(entry);
    const meta = entry.promptMetadata && typeof entry.promptMetadata === 'object' ? entry.promptMetadata : {};
    const out = { url: entry.url, path: entry.path, generatedAt: entry.generatedAt, provider: entry.provider, builtinImageFit: entry.builtinImageFit, looksSources: entry.looksSources, imageOwner: entry.imageOwner };
    if (!entry.path && entry.dataUrl && entry.dataUrl !== entry.url) out.dataUrl = entry.dataUrl;
    const slimMeta = { seed: meta.seed, promptFormat: meta.promptFormat, size: meta.size };
    out.promptMetadata = Object.fromEntries(Object.entries(slimMeta).filter(([, value]) => value !== undefined));
    out.slimmed = true;
    if (promptHash) out.promptHash = promptHash;
    return Object.fromEntries(Object.entries(out).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}

/** 本机存储满了时给插图存档瘦身：只瘦旧版本、去掉已有文件路径的 data: 副本，不删任何一张图。腾出了地方返回 true。 */
// 以前的旧版本都带着整套提示词：这次打开页面后第一次存图时，把所有存档的旧版本瘦一遍（只一次）。
let migrated = false;
function migrateOldImageRecords() {
    if (migrated) return;
    migrated = true;
    try { slimMirrorImagesForQuota(); } catch { /* 瘦不了就照旧 */ }
}

// 瘦过一遍、之后没再存新图：再瘦也腾不出地方，不再把几百份存档逐条解析一遍。
let slimmedClean = false;
// 设置里手动清理时，不管这次打开页面后有没有瘦过，都再瘦一遍。
export function resetMirrorImageSlimFlag() { slimmedClean = false; }
export function slimMirrorImagesForQuota() {
    const storage = globalThis.localStorage;
    if (!storage || slimmedClean) return false;
    const head = `${PREFIX}images:`;
    const names = [];
    try { for (let i = 0; i < storage.length; i += 1) { const name = storage.key(i); if (name?.startsWith(head)) names.push(name); } } catch { return false; }
    let freed = false;
    for (const name of names) {
        try {
            const raw = storage.getItem(name);
            const data = raw ? JSON.parse(raw) : null;
            if (!data || data.version !== 1 || !data.current || !Array.isArray(data.history)) continue;
            const current = { ...data.current };
            if (current.path) delete current.dataUrl;
            const next = JSON.stringify({ ...data, current, history: data.history.map(slimEntry) });
            if (next.length >= raw.length) continue;
            storage.setItem(name, next);
            freed = true;
        } catch { /* 这一份瘦不了就跳过 */ }
    }
    slimmedClean = true;
    return freed;
}

function storedRecord(record) {
    if (!record || typeof record !== 'object') throw new TypeError('缺少要保存的图片。');
    const { history: ignoredHistory, ...copy } = record;
    const url = copy.path || copy.url || copy.dataUrl;
    if (typeof url !== 'string' || !url) throw new TypeError('图片没有可保存的地址。');
    copy.url = url;
    // Durable provider files do not require duplicating their large base64 payload.
    if (copy.path) delete copy.dataUrl;
    // 只有 data: 的图：url 和 dataUrl 是同一串 base64，只存一份（不然一张图占两倍本机空间）。
    else if (copy.dataUrl && copy.dataUrl === copy.url) delete copy.dataUrl;
    return copy;
}

/** 删掉一份插图存档（搬到新键以后清旧键用）。不存在也不报错。 */
export function removeMirrorImage(key, { keepSlotOf = '' } = {}) {
    if (!keepSlotOf) {
        // Explicit deletion must also remove the matching retained completion,
        // or the next read would restore the image just removed. Key migration
        // uses keepSlotOf and preserves that paid safety archive.
        const slot = slotOfKey(key), target = messageSlot(key), tokens = new Set();
        if (slot) {
            for (const extra of target ? swipeExtras(target.msg, target.swipe).filter(Boolean) : []) {
                const token = extra[OWNER_KEY];
                if (token?.id && Number(token.swipe) === target.swipe) tokens.add(token.id);
                (extra[REMOVED_KEY] ||= {})[slot.entry] = true;
                keyNamesGen += 1;
            }
            if (target) requestChatSave(target.mes);
            try {
                const value = JSON.parse(globalThis.localStorage.getItem(storageKey(key, 'images')) || 'null');
                if (value?.current?.imageOwner?.token) tokens.add(value.current.imageOwner.token);
            } catch { /* Preserve unreadable archives. */ }
            for (const token of tokens) try {
                const scope = target ? archiveScope(target.ctx) : `chat:${stripChat(slot.chat)}`;
                const retiredPrefix = storageKey(`${ownerArchiveKey(token, scope, '')}retired:`, 'images');
                const retired = [];
                for (let index = 0; index < globalThis.localStorage.length; index += 1) {
                    const name = globalThis.localStorage.key(index);
                    if (name?.startsWith(retiredPrefix) && name.endsWith(`:${slot.entry}`)) retired.push(name);
                }
                globalThis.localStorage.removeItem(storageKey(ownerArchiveKey(token, scope, slot.entry), 'images'));
                for (const name of retired) globalThis.localStorage.removeItem(name);
            } catch { /* Keep the paid result if removal failed. */ }
        }
    }
    try { globalThis.localStorage.removeItem(storageKey(key, 'images')); } catch { /* 删不掉就留着 */ }
    // 旧键和新键指向消息上同一格（只是聊天名写法不同）：刚写进去的就是这一格，不能删。
    const a = slotOfKey(key), b = keepSlotOf ? slotOfKey(keepSlotOf) : null;
    const sameSlot = a && b && stripChat(a.chat) === stripChat(b.chat) && a.mes === b.mes && a.swipe === b.swipe && a.entry === b.entry;
    if (!sameSlot) try { removeMessageImage(key); } catch { /* 消息上那份删不掉就留着 */ }
    try { const legacy = liveContext()?.chatMetadata?.[LEGACY_META_KEY]; if (legacy && typeof legacy === 'object') delete legacy[key]; } catch { /* 旧格子删不掉就留着 */ }
}

export function loadMirrorImage(key) {
    const data = read(key, 'images');
    if (data == null) return null;
    if (data.version !== 1 || !data.current || !Array.isArray(data.history)) throw new TypeError('图片存档格式无法识别，原存档已保留。');
    return { ...data.current, history: data.history };
}

export function saveMirrorImage(key, record) {
    const previous = loadMirrorImage(key);
    const current = { ...storedRecord(record), shownAt: Date.now() };
    // 旧版本只留最近 4 张；整张图存在本机（data:）的旧版本只留最近一张，免得重画几次就把本机空间占满。
    // 提示词只给当前那张留一份：旧版本只记图片地址、时间和种子（图本身在柏宝绘图库／酒馆上）。
    migrateOldImageRecords();
    const history = (previous ? [...previous.history, storedRecord(previous)] : [])
        .slice(-4)
        .filter((entry, index, list) => index === list.length - 1 || !String(entry?.url || '').startsWith('data:'))
        .map((entry, index, list) => {
            if (index === list.length - 1 || !entry || typeof entry !== 'object') return entry;
            const { dataUrl: ignoredDataUrl, ...rest } = entry;
            return rest;
        })
        .map(slimEntry);
    write(key, 'images', { version: 1, current, history });
    slimmedClean = false;
    return { ...current, history };
}

// 仅凭楼层／swipe／图框／提示词相同，不能证明两个聊天是分支或改名关系。
// 没有可信的跨聊天身份链时不借图；保留此入口供旧调用方使用。
// 消息自己携带的图片、同聊天兼容键和收藏显式 lend 仍分别走原来的恢复路径。
export function findBuiltinImageKeyFromOtherChat(_key) {
    return '';
}

// 内置生图的键：builtin:聊天:楼层:swipe:图框序号:提示词哈希。聊天名里可能带冒号，从后往前拆。
export function parseBuiltinImageKey(key) {
    const parts = String(key || '').split(':');
    if (parts[0] !== 'builtin' || parts.length < 6) return null;
    return { chat: parts.slice(1, -4).join(':'), mes: parts[parts.length - 4], swipe: parts[parts.length - 3], index: parts[parts.length - 2], hash: parts[parts.length - 1] };
}
export function parseBuiltinFrameIndex(value) {
    const match = /^f(\d+)\.(\d+)$/.exec(String(value));
    return match ? { face: Number(match[1]), frame: Number(match[2]), legacy: false }
        : /^\d+$/.test(String(value)) ? { face: null, frame: Number(value), legacy: true } : null;
}
// Explicit caller-proven legacy migration or a favorite lacking its old face
// ordinal. Never treats missing message/swipe as a wildcard, never picks first
// among multiple possible frames, and never deletes the source record.
export function findUnambiguousBuiltinImageKey(key, { legacyOnly = false } = {}) {
    const wanted = parseBuiltinImageKey(key);
    if (!wanted || !/^\d+$/.test(wanted.mes) || !/^\d+$/.test(wanted.swipe)) return '';
    const matches = new Map(), head = `${PREFIX}images:`;
    for (const name of imageKeyNames()) {
        const candidate = name.slice(head.length), other = parseBuiltinImageKey(candidate);
        if (!other || !sameChat(wanted.chat, other.chat) || wanted.mes !== other.mes || wanted.swipe !== other.swipe || wanted.hash !== other.hash) continue;
        if (legacyOnly && !parseBuiltinFrameIndex(other.index)?.legacy) continue;
        try { if (loadMirrorImage(candidate)) matches.set(`${other.index}:${other.hash}`, candidate); } catch { /* Preserve unreadable source. */ }
    }
    return matches.size === 1 ? matches.values().next().value : '';
}

// 两个键指的是不是同一张图：同一聊天、同一图框、同一段提示词；楼层和 swipe 一样，或其中一边当时还没记上（空）。
// 多面镜子在归属写上之前就开始画，画好的图存在「楼层空」的键下，写上归属后再找就对不上，于是又画一遍。
// 聊天名有两种写法：写上归属的那一面记的是「chat:聊天名」，没写上的直接用酒馆给的聊天名，指的是同一个聊天。
const sameChat = (a, b) => String(a).replace(/^chat:/, '') === String(b).replace(/^chat:/, '');
export function builtinImageKeysCompatible(a, b) {
    const x = parseBuiltinImageKey(a), y = parseBuiltinImageKey(b);
    if (!x || !y || !sameChat(x.chat, y.chat) || x.index !== y.index || x.hash !== y.hash || !x.hash) return false;
    const frame = parseBuiltinFrameIndex(x.index);
    const same = (u, v) => u === v || (frame?.legacy && (u === '' || v === ''));
    return same(x.mes, y.mes) && same(x.swipe, y.swipe);
}

// 同一张图存在另一个兼容的键下（见上）：优先楼层、swipe 都对得上的，再退到当时没记楼层的。只读。
export function findCompatibleBuiltinImageKey(key) {
    const storage = globalThis.localStorage;
    const wanted = parseBuiltinImageKey(key);
    if (!storage || !wanted || !wanted.hash) return '';
    const imagesPrefix = `${PREFIX}images:`;
    const head = `${imagesPrefix}builtin:`;
    const suffix = `:${wanted.index}:${wanted.hash}`;
    const own = storageKey(key, 'images');
    let best = '', bestScore = -1;
    try {
        for (const name of imageKeyNames()) {
            if (!name || name === own || !name.startsWith(head) || !name.endsWith(suffix)) continue;
            const candidate = name.slice(imagesPrefix.length);
            if (!builtinImageKeysCompatible(key, candidate)) continue;
            const other = parseBuiltinImageKey(candidate);
            const score = (other.mes === wanted.mes ? 4 : 0) + (other.swipe === wanted.swipe ? 2 : 0) + (other.chat === wanted.chat ? 1 : 0);
            if (score > bestScore) { best = candidate; bestScore = score; }
        }
    } catch { /* 读不到就当没有 */ }
    return best;
}

// 两个键是不是「同一张图、只是图框序号挪了」：同一聊天、同一楼层、同一 swipe（都记上了）、同一段提示词，序号不同。
export function builtinImageKeysShifted(a, b) {
    const x = parseBuiltinImageKey(a), y = parseBuiltinImageKey(b);
    if (!x || !y || !x.hash || x.hash !== y.hash || x.index === y.index) return false;
    const xi = parseBuiltinFrameIndex(x.index), yi = parseBuiltinFrameIndex(y.index);
    if (!xi || !yi || xi.legacy !== yi.legacy || xi.face !== yi.face) return false;
    if (x.mes === '' || x.swipe === '' || x.mes !== y.mes || x.swipe !== y.swipe) return false;
    return sameChat(x.chat, y.chat);
}

function builtinKeyForOwnedArchive(name, target) {
    if (!target) return '';
    for (const extra of swipeExtras(target.msg, target.swipe).filter(Boolean)) {
        const marker = extra[OWNER_KEY];
        if (!marker?.id || Number(marker.swipe) !== target.swipe) continue;
        const prefix = `${PREFIX}images:owner:${marker.id}:`;
        if (!name.startsWith(prefix)) continue;
        let entry = name.slice(prefix.length), scope = '';
        const scoped = /^scope:([^:]+):/.exec(entry);
        if (scoped) { scope = scoped[1]; entry = entry.slice(scoped[0].length); }
        const retired = /^retired:([^:]+):/.exec(entry);
        if (retired) {
            if (retired[1] !== imageSourceHash(imageSource(target.msg, target.swipe))) continue;
            entry = entry.slice(retired[0].length);
        }
        if (scope && scope !== encodeURIComponent(archiveScope(target.ctx)) && scope !== encodeURIComponent(inheritedArchiveScope(marker, entry))) continue;
        if (extra[REMOVED_KEY]?.[entry] === true) continue;
        // Only names are inspected here. Reading the candidate still validates
        // ownership and the inherited version, including unconfirmed old forks.
        return `builtin:${currentChatName(target.ctx)}:${target.mes}:${target.swipe}:${entry}`;
    }
    return '';
}

// 同一聊天、同一楼层、同一 swipe、同一段提示词，图框序号却不同：这一面重新挂上时结构被整理过，序号挪了，图还是那一张。
// 楼层和 swipe 都得是记上了的（空的不算，免得认到别的楼层去）；claimed 里的键（这一面别的图框自己的）不拿；
// 有好几个时优先最后换上镜面的那张；旧记录没时间或时间相同时才按序号距离。只读。
export function findShiftedBuiltinImageKey(key, claimed = null) {
    const storage = globalThis.localStorage;
    const wanted = parseBuiltinImageKey(key);
    if (!storage || !wanted || !wanted.hash || wanted.mes === '' || wanted.swipe === '') return '';
    const imagesPrefix = `${PREFIX}images:`;
    const head = `${imagesPrefix}builtin:`;
    const suffix = `:${wanted.mes}:${wanted.swipe}:`;
    const target = messageSlot(key);
    let best = '', bestShownAt = -1, bestDistance = Infinity;
    // claimed 可以是一个集合，也可以是算出集合的函数（真找到候选时才算，平常命中自己的键时不花这份工夫）。
    let claimedSet = null;
    const taken = () => claimedSet || (claimedSet = (typeof claimed === 'function' ? claimed() : claimed) || new Set());
    try {
        for (const name of imageKeyNames()) {
            if (!name || !name.endsWith(`:${wanted.hash}`)) continue;
            const candidate = name.startsWith(head) ? name.slice(imagesPrefix.length) : builtinKeyForOwnedArchive(name, target);
            if (!candidate.includes(suffix)) continue;
            const other = parseBuiltinImageKey(candidate);
            if (!other || !builtinImageKeysShifted(key, candidate)) continue;
            if ([...taken()].some(key => builtinImageKeysCompatible(key, candidate))) continue;
            const distance = Math.abs(parseBuiltinFrameIndex(other.index)?.frame - parseBuiltinFrameIndex(wanted.index)?.frame);
            let shownAt = 0;
            try { const at = Number(loadMirrorImage(candidate)?.shownAt); if (Number.isFinite(at) && at > 0) shownAt = at; } catch { /* 仍保留旧存档的不可读提示。 */ }
            if (Number.isFinite(distance) && (shownAt > bestShownAt || shownAt === bestShownAt && distance < bestDistance)) {
                best = candidate; bestShownAt = shownAt; bestDistance = distance;
            }
        }
    } catch { /* 读不到就当没有 */ }
    return best;
}

// 换成历史里的另一张显示：选中的那张当当前，其余按原来的先后留在历史里。不发请求。
// keepShownAt：晚回来的旧请求只进历史、当前那张没换——不改它换上镜面的时间，免得挪过位置的图框认回旧图。
export function replaceMirrorImageVersions(key, current, history, { keepShownAt = false } = {}) {
    migrateOldImageRecords();
    const value = { version: 1, current: keepShownAt ? storedRecord(current) : { ...storedRecord(current), shownAt: Date.now() }, history: (Array.isArray(history) ? history : []).filter(entry => entry && typeof entry === 'object').map(slimEntry) };
    const slot = slotOfKey(key), token = value.current.imageOwner?.token, target = messageSlot(key);
    let archiveKey = '', archive = null;
    if (slot && token) {
        archiveKey = ownerArchiveKey(token, target ? archiveScope(target.ctx) : `chat:${stripChat(slot.chat)}`, slot.entry);
        try { archive = JSON.parse(globalThis.localStorage.getItem(storageKey(archiveKey, 'images')) || 'null'); } catch { /* Preserve invalid archive. */ }
        if (!archive && target) {
            // Version selection can be the first write in a newly opened branch.
            readMessageImage(key);
            try { archive = JSON.parse(globalThis.localStorage.getItem(storageKey(archiveKey, 'images')) || 'null'); } catch { /* Preserve invalid archive. */ }
        }
    }
    if (archive?.owner && !chatCopy(value)) {
        write(archiveKey, 'images', { ...value, owner: archive.owner });
        removeMessageImage(key);
        if (target) clearImageRemoved(target);
        try { globalThis.localStorage.removeItem(storageKey(key, 'images')); } catch { /* Retain an older safety copy. */ }
    } else {
        write(key, 'images', value);
        // 消息上那份已经写好；只是本机的归属存档写不下时，标出来，调用方别再用精简版去盖。
        if (archive?.owner) {
            try { write(archiveKey, 'images', { ...value, owner: archive.owner }); }
            catch (error) { throw chatCopy(value) && messageSlot(key) ? markMessageCopySaved(error) : error; }
        }
    }
    if (archive?.owner && target) for (const extra of swipeExtras(target.msg, target.swipe).filter(Boolean))
        rememberArchiveScope(extra, token, slot.entry, archiveScope(target.ctx), target.mes, value.current, value.history);
    slimmedClean = false;
    return { ...value.current, history: value.history };
}

export function loadMirrorImageDraft(key) { return read(key, 'draft'); }

export function saveMirrorImageDraft(key, draft) {
    if (!draft || typeof draft !== 'object' || Array.isArray(draft)) throw new TypeError('提示词草稿必须是对象。');
    write(key, 'draft', draft);
    return draft;
}

// 删楼层／删 swipe 后，把这个聊天的插图存档（内置生图与手动生图，含提示词草稿）搬到新楼层号。
// mapper(楼层, swipe) 返回 "新楼层:新swipe"，被删掉的返回 null：那几层的图原样留在本机，不删。
// 目标位置已经有别的存档时不覆盖，那一张留在原处。
export function remapMirrorImageSlots(chat, mapper, options = {}) {
    const storage = globalThis.localStorage;
    if (!storage || typeof chat !== 'string' || !chat || typeof mapper !== 'function') return 0;
    const target = (index, swipe) => {
        const value = mapper(index, swipe);
        const match = /^(\d+):(\d+)$/.exec(String(value ?? ''));
        return match ? [Number(match[1]), Number(match[2])] : null;
    };
    if (options.kind === 'swipe') {
        const ctx = liveContext(), mes = Number(options.messageId), msg = ctx?.chat?.[mes];
        if (stripChat(chat) === currentChatName(ctx) && msg) {
            const extras = new Set([msg.extra, ...(msg.swipe_info || []).map(info => info?.extra)].filter(Boolean));
            let changed = false;
            const seen = new Set();
            for (const extra of extras) {
                const values = [extra[OWNER_KEY], ...Object.values(extra[EXTRA_KEY] || {})];
                for (const value of values) {
                    if (!value || seen.has(value) || !Number.isInteger(Number(value.swipe))) continue;
                    seen.add(value);
                    const moved = target(mes, Number(value.swipe));
                    if (moved && value.swipe !== moved[1]) { value.swipe = moved[1]; changed = true; }
                }
            }
            if (changed) { keyNamesGen += 1; requestChatSave(mes); }
        }
    }
    const nextKeyFor = key => {
        const parsed = parseBuiltinImageKey(key);
        if (parsed && sameChat(parsed.chat, chat) && /^\d+$/.test(parsed.mes) && /^\d+$/.test(parsed.swipe)) {
            const moved = target(Number(parsed.mes), Number(parsed.swipe));
            return moved ? `builtin:${parsed.chat}:${moved[0]}:${moved[1]}:${parsed.index}:${parsed.hash}` : `retired:${key}`;
        }
        if (key.startsWith('[')) {
            let parts;
            try { parts = JSON.parse(key); } catch { return ''; }
            if (!Array.isArray(parts) || parts[0] !== chat || !Number.isInteger(parts[1]) || !Number.isInteger(parts[2])) return '';
            const moved = target(parts[1], parts[2]);
            return moved ? JSON.stringify([parts[0], moved[0], moved[1], ...parts.slice(3)]) : `retired:${key}`;
        }
        return '';
    };
    // 消息上的插图记录跟着消息、swipe 走，不用搬；这里只搬本机里的旧记录。
    const moves = [];
    for (let i = 0; i < storage.length; i += 1) {
        const full = storage.key(i);
        if (!full || !full.startsWith(PREFIX)) continue;
        const rest = full.slice(PREFIX.length);
        const colon = rest.indexOf(':');
        if (colon < 0) continue;
        const kind = rest.slice(0, colon), key = rest.slice(colon + 1);
        if (kind !== 'images' && kind !== 'draft') continue;
        const next = nextKeyFor(key);
        if (next && next !== key) moves.push({ from: full, to: `${PREFIX}${kind}:${next}` });
    }
    if (!moves.length) return 0;
    // 两张图搬到同一个位置时都不搬；目标被一个不搬走的存档占着时也不搬。反复筛到稳定为止。
    const count = new Map();
    for (const move of moves) count.set(move.to, (count.get(move.to) || 0) + 1);
    let plan = moves.filter(move => count.get(move.to) === 1);
    for (let changed = true; changed;) {
        const leaving = new Set(plan.map(move => move.from));
        const kept = plan.filter(move => storage.getItem(move.to) == null || leaving.has(move.to));
        changed = kept.length !== plan.length;
        plan = kept;
    }
    const values = plan.map(move => ({ ...move, value: storage.getItem(move.from) })).filter(move => move.value != null);
    for (const move of values) storage.removeItem(move.from);
    let moved = 0;
    for (const move of values) {
        try { storage.setItem(move.to, move.value); moved += 1; }
        catch { try { storage.setItem(move.from, move.value); } catch { /* 原位也写不回时只能放弃这一张 */ } }
    }
    return moved;
}
