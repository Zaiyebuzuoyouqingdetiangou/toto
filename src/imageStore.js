import { rmT as __rmT } from "./textTable.js?rmv=1.100.0";
const PREFIX = 'rabbitMirror:image:v1:';
export const MIRROR_IMAGE_PROMPTS_CLEARED_EVENT = 'rabbitmirror:image-prompts-cleared';
let promptCleanupRevision = 0;
export function mirrorImagePromptCleanupRevision() { return promptCleanupRevision; }
const EXTRA_KEY = 'rabbitMirrorImages';
const OWNER_KEY = 'rabbitMirrorImageOwner';
const REMOVED_KEY = 'rabbitMirrorImagesRemoved';
let ownerSequence = 0;
function imageSource(msg, swipe) { return String(Number(msg?.swipe_id || 0) === swipe ? msg?.mes ?? '' : msg?.swipes?.[swipe] ?? ''); }
function imageSourceHash(text) { let hash = 2166136261; for (const char of String(text))
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619); return (hash >>> 0).toString(36); }
function normalizedImageSource(text) { return String(text ?? '').replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trim(); }
function sourceHashOf(text) { return imageSourceHash(normalizedImageSource(text)); }
function sourceHashMatches(hash, text) { return typeof hash === 'string' && !!hash && (hash === sourceHashOf(text) || hash === imageSourceHash(text)); }
function sameImageSource(left, right) { return left === right || normalizedImageSource(left) === normalizedImageSource(right); }
export function mirrorImageOwnerSourceKey(owner) { return typeof owner?.source === 'string' ? sourceHashOf(owner.source) : String(owner?.sourceHash || ''); }
function sourceHashCandidates(text) { return [...new Set([sourceHashOf(text), imageSourceHash(text)])]; }
const LEGACY_META_KEY = 'rabbitMirrorImages';
function storageKey(key, kind) {
    if (typeof key !== 'string' || !key)
        throw new TypeError(__rmT("MmpIDIhO3A449X0DQRPxQmdu8RFFRyjoKm.GD7HDgG8"));
    return `${PREFIX}${kind}:${key}`;
}
function liveContext() {
    try {
        return globalThis.SillyTavern?.getContext?.() || null;
    }
    catch {
        return null;
    }
}
function stripChat(value) { return String(value ?? '').replace(/^chat:/, ''); }
function currentChatName(ctx) { return stripChat(ctx?.getCurrentChatId?.() ?? ctx?.chatId ?? ''); }
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
    if (marker?.id !== token)
        return;
    const version = current ? imageSourceHash(imageIdentity(current)) : '';
    const historyVersions = Array.isArray(history) ? history.slice(-4).map(item => imageSourceHash(imageIdentity(item))) : null;
    if (inheritedArchiveScope(marker, entry) === scope && (!version || marker.archiveVersions?.[entry] === version)
        && (!historyVersions || JSON.stringify(marker.archiveHistoryVersions?.[entry]) === JSON.stringify(historyVersions)))
        return;
    if (inheritedArchiveScope(marker, entry) !== scope)
        (marker.archiveScopes ||= {})[entry] = scope;
    if (version)
        (marker.archiveVersions ||= {})[entry] = version;
    if (historyVersions)
        (marker.archiveHistoryVersions ||= {})[entry] = historyVersions;
    keyNamesGen += 1;
    if (Number.isInteger(mes))
        requestChatSave(mes);
}
function imageRemoved(target) {
    return !!target && swipeExtras(target.msg, target.swipe).some(extra => extra?.[REMOVED_KEY]?.[target.entry] === true);
}
function clearImageRemoved(target) {
    for (const extra of swipeExtras(target.msg, target.swipe).filter(Boolean))
        if (extra[REMOVED_KEY]?.[target.entry] === true) {
            delete extra[REMOVED_KEY][target.entry];
            touchMessage(target.msg);
            keyNamesGen += 1;
        }
}
function chatReady(ctx) {
    const metadata = ctx?.chatMetadata;
    if (!metadata || typeof metadata !== 'object' || !Array.isArray(ctx?.chat) || !ctx.chat.length)
        return false;
    return Object.keys(metadata).some(name => name !== LEGACY_META_KEY);
}
function slotOfKey(key) {
    const text = String(key || '');
    if (text.startsWith('builtin:')) {
        const parsed = parseBuiltinImageKey(text);
        if (!parsed)
            return null;
        return { chat: parsed.chat, mes: parsed.mes, swipe: parsed.swipe, entry: `${parsed.index}:${parsed.hash}` };
    }
    if (text.startsWith('[')) {
        try {
            const parts = JSON.parse(text);
            if (!Array.isArray(parts))
                return null;
            return { chat: String(parts[0] ?? ''), mes: String(parts[1] ?? ''), swipe: String(parts[2] ?? ''), entry: `manual:${JSON.stringify(parts.slice(3))}` };
        }
        catch {
            return null;
        }
    }
    return null;
}
function swipeExtras(msg, swipe) {
    const current = Number.isInteger(msg.swipe_id) ? msg.swipe_id : 0;
    if (swipe === current)
        return [msg.extra && typeof msg.extra === 'object' ? msg.extra : null];
    const info = Array.isArray(msg.swipe_info) ? msg.swipe_info[swipe] : null;
    return [info && typeof info === 'object' && info.extra && typeof info.extra === 'object' ? info.extra : null];
}
function ownEntry(value, swipe) {
    return !!value && typeof value === 'object' && (value.swipe === undefined || Number(value.swipe) === swipe);
}
function pruneCopied(store, swipe) {
    let pruned = false;
    for (const [entry, value] of Object.entries(store))
        if (value && typeof value === 'object' && value.swipe !== undefined && Number(value.swipe) !== swipe) {
            delete store[entry];
            pruned = true;
        }
    return pruned;
}
export function mirrorImageChatLoading(key) {
    const ctx = liveContext();
    if (chatReady(ctx) || !Array.isArray(ctx?.chat) || !ctx.chat.length)
        return false;
    const slot = slotOfKey(key);
    const current = currentChatName(ctx);
    return !!slot && !!current && stripChat(slot.chat) === current;
}
function messageSlot(key, create = false) {
    const ctx = liveContext();
    if (!chatReady(ctx))
        return null;
    const slot = slotOfKey(key);
    if (!slot || !/^\d+$/.test(slot.mes) || !/^\d+$/.test(slot.swipe))
        return null;
    const current = currentChatName(ctx);
    if (!current || stripChat(slot.chat) !== current)
        return null;
    const mes = Number(slot.mes), swipe = Number(slot.swipe);
    const msg = ctx.chat[mes];
    if (!msg || typeof msg !== 'object')
        return null;
    const currentSwipe = Number.isInteger(msg.swipe_id) ? msg.swipe_id : 0;
    const hasInfo = Array.isArray(msg.swipe_info) && msg.swipe_info[swipe] && typeof msg.swipe_info[swipe] === 'object';
    if (swipe !== currentSwipe && !hasInfo)
        return null;
    if (create) {
        if (swipe === currentSwipe && (!msg.extra || typeof msg.extra !== 'object'))
            msg.extra = {};
        if (swipe !== currentSwipe && (!msg.swipe_info[swipe].extra || typeof msg.swipe_info[swipe].extra !== 'object'))
            msg.swipe_info[swipe].extra = {};
    }
    const extras = swipeExtras(msg, swipe).filter(Boolean);
    const stores = [];
    for (const extra of extras) {
        let store = extra[EXTRA_KEY];
        if (!store || typeof store !== 'object' || Array.isArray(store)) {
            if (!create)
                continue;
            store = {};
            extra[EXTRA_KEY] = store;
        }
        stores.push(store);
    }
    if (!stores.length && !extras.some(extra => extra[OWNER_KEY]?.id))
        return null;
    return { ctx, mes, msg, swipe, entry: slot.entry, stores };
}
function chatCopy(value) {
    if (!value || typeof value !== 'object')
        return null;
    const light = entry => {
        if (!entry || typeof entry !== 'object')
            return entry;
        const { dataUrl, ...rest } = entry;
        const url = String(rest.path || rest.url || '');
        if (!url || url.startsWith('data:'))
            return null;
        return rest;
    };
    const current = light(value.current);
    if (!current)
        return null;
    return { version: 1, current, history: (Array.isArray(value.history) ? value.history : []).map(light).filter(Boolean) };
}
let saveTimer = 0;
let saveRequest = null;
const touchedMessages = new WeakSet();
let touchGen = 0;
function touchMessage(msg) { if (msg && typeof msg === 'object' && !touchedMessages.has(msg)) {
    touchedMessages.add(msg);
    touchGen += 1;
} }
function liveChatSaveContext(request) {
    const ctx = liveContext();
    return request && chatReady(ctx) && ctx.chat === request.chat && ctx.chatMetadata === request.metadata
        && currentChatName(ctx) === request.name && ctx.chat[request.mes] === request.msg ? ctx : null;
}
function requestChatSave(mes) {
    const ctx = liveContext();
    if (Number.isInteger(mes))
        touchMessage(ctx?.chat?.[mes]);
    if (!chatReady(ctx) || !Number.isInteger(mes) || !ctx.chat[mes])
        return;
    const name = currentChatName(ctx);
    if (!name)
        return;
    saveRequest = { chat: ctx.chat, metadata: ctx.chatMetadata, name, mes, msg: ctx.chat[mes] };
    if (saveTimer)
        return;
    saveTimer = setTimeout(() => {
        saveTimer = 0;
        const request = saveRequest;
        saveRequest = null;
        if (!liveChatSaveContext(request))
            return;
        import('./independentApi/persistence.js?rmv=1.100.0')
            .then(module => {
            const live = liveChatSaveContext(request);
            if (live)
                module.requestSafeChatSave?.(live, request.mes, request.msg);
        })
            .catch(() => { });
    }, 1500);
}
function writeMessageImage(key, value) {
    const copy = chatCopy(value);
    if (!copy) {
        const existing = messageSlot(key);
        if (existing && existing.stores.some(store => Object.prototype.hasOwnProperty.call(store, existing.entry))) {
            existing.stores.forEach(store => { delete store[existing.entry]; });
            requestChatSave(existing.mes);
        }
        return false;
    }
    const target = messageSlot(key, true);
    if (!target)
        return false;
    clearImageRemoved(target);
    target.stores.forEach(store => { pruneCopied(store, target.swipe); store[target.entry] = { ...structuredCloneSafe(copy), swipe: target.swipe }; });
    keyNamesGen += 1;
    requestChatSave(target.mes);
    return true;
}
function structuredCloneSafe(value) {
    try {
        return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
    }
    catch {
        return JSON.parse(JSON.stringify(value));
    }
}
function readMessageImage(key) {
    const target = messageSlot(key);
    if (!target || imageRemoved(target))
        return null;
    let current = null;
    for (const store of target.stores) {
        const value = store[target.entry];
        if (ownEntry(value, target.swipe) && recordMatchesMessage(value, target.msg, target.swipe, false)) {
            const { swipe, ...record } = value;
            current = record;
            break;
        }
    }
    for (const extra of swipeExtras(target.msg, target.swipe).filter(Boolean)) {
        const token = extra[OWNER_KEY];
        if (!token?.id || Number(token.swipe) !== target.swipe)
            continue;
        try {
            const scope = archiveScope(target.ctx);
            const scopedKey = ownerArchiveKey(token.id, scope, target.entry);
            const readArchive = name => {
                const text = globalThis.localStorage.getItem(storageKey(name, 'images'));
                if (text === null)
                    return null;
                const value = JSON.parse(text);
                if (!value || value.version !== 1 || !value.current || !Array.isArray(value.history) || value.current.imageOwner?.token !== token.id)
                    throw new TypeError(__rmT("9CotCyjllXnOJR7Pkt7Qk7gcQS2dOu_OmN1sXuw68b8Mf0Pck5RYhj5X"));
                return value;
            };
            let retained = readArchive(scopedKey);
            if (!retained && !current)
                for (const hash of sourceHashCandidates(imageSource(target.msg, target.swipe))) {
                    retained = readArchive(ownerArchiveKey(token.id, scope, target.entry, hash));
                    if (retained)
                        break;
                }
            let scoped = !!retained;
            if (!retained) {
                const fromScope = inheritedArchiveScope(token, target.entry);
                const inherited = fromScope && fromScope !== scope
                    ? readArchive(ownerArchiveKey(token.id, fromScope, target.entry)) : null;
                let legacy = !inherited ? readArchive(`owner:${token.id}:${target.entry}`) : null;
                if (!inherited && !legacy && !current)
                    for (const hash of sourceHashCandidates(imageSource(target.msg, target.swipe))) {
                        legacy = readArchive(`owner:${token.id}:retired:${hash}:${target.entry}`);
                        if (legacy)
                            break;
                    }
                let source = inherited || legacy;
                if (source?.current?.imageOwner?.token === token.id) {
                    const sourceVersions = [...source.history, source.current];
                    const sameLegacyChat = !inherited && (!source.owner?.scope || source.owner.scope === scope)
                        && stripChat(source.owner?.chat) === currentChatName(target.ctx);
                    const version = token.archiveVersions?.[target.entry];
                    if (!current && !sameLegacyChat && !version) {
                        throw Object.assign(new TypeError(__rmT("h8ZQIHsojopfwkKO4MnfPkdS6nquWTYR3ucBzmjEebJLlwO2iL18cWnb5KhACQoaxd7YWRyOB78vwt_DqPzXCfrSWAT")), { code: 'image_version_unconfirmed' });
                    }
                    if (!current && !sameLegacyChat && version && imageSourceHash(imageIdentity(source.current)) !== version) {
                        const chosen = source.history.find(item => imageSourceHash(imageIdentity(item)) === version);
                        if (!chosen)
                            throw new TypeError(__rmT("8armaCqsviK_IfnJCCVwocrBLkF4.yiXxapJSXsDtyTXalimmuGlVlxOwSjk2valvaFgPcMLQmUG1sH9"));
                        source = { ...source, current: chosen, history: imageHistory([...source.history, source.current], chosen) };
                    }
                    retained = source;
                    if (!sameLegacyChat) {
                        const selected = current?.current || source.current;
                        const historyVersions = token.archiveHistoryVersions?.[target.entry];
                        const available = [...sourceVersions, ...(current?.history || [])];
                        const history = Array.isArray(historyVersions)
                            ? historyVersions.map(version => available.find(item => imageSourceHash(imageIdentity(item)) === version)).filter(Boolean)
                            : current?.history || [];
                        retained = { ...source, ...(current || {}), current: selected, history: imageHistory(history, selected) };
                    }
                    retained = { ...retained, owner: { ...source.owner, chat: currentChatName(target.ctx), scope } };
                    try {
                        globalThis.localStorage.setItem(storageKey(scopedKey, 'images'), JSON.stringify(retained));
                        scoped = true;
                    }
                    catch { }
                }
            }
            if (retained?.current?.imageOwner?.token !== token.id)
                continue;
            if (current)
                retained = withMessageVersions(retained, current);
            if (scoped)
                rememberArchiveScope(extra, token.id, target.entry, scope, target.mes, retained.current, retained.history);
            if (JSON.stringify(chatCopy(current)) !== JSON.stringify(chatCopy(retained))) {
                const copy = chatCopy(retained);
                if (copy) {
                    const store = extra[EXTRA_KEY] ||= {};
                    store[target.entry] = { ...copy, swipe: target.swipe };
                    requestChatSave(target.mes);
                }
            }
            return retained;
        }
        catch (error) {
            if (!current)
                throw error;
        }
    }
    return current;
}
function recordMatchesMessage(value, msg, swipe, matchSource = true) {
    const owner = value?.current?.imageOwner;
    if (!owner)
        return true;
    return swipeExtras(msg, swipe).some(extra => extra?.[OWNER_KEY]?.id === owner.token && Number(extra?.[OWNER_KEY]?.swipe) === swipe)
        && (!matchSource || sourceHashMatches(owner.source, imageSource(msg, swipe)));
}
function imageIdentity(entry) { return JSON.stringify([entry?.path || entry?.url || entry?.dataUrl, entry?.generatedAt || '', entry?.promptMetadata?.seed ?? null]); }
function withMessageVersions(archive, message) {
    const known = new Set([archive.current, ...(Array.isArray(archive.history) ? archive.history : [])].filter(Boolean).map(imageIdentity));
    const older = [...(Array.isArray(message?.history) ? message.history : []), message?.current]
        .filter(entry => entry && typeof entry === 'object' && !known.has(imageIdentity(entry)));
    return older.length ? { ...archive, history: imageHistory([...older, ...(Array.isArray(archive.history) ? archive.history : [])], archive.current) } : archive;
}
function imageHistory(entries, current) {
    const seen = new Set([imageIdentity(current)]), result = [];
    for (const entry of [...entries].reverse()) {
        const id = imageIdentity(entry);
        if (seen.has(id))
            continue;
        seen.add(id);
        result.unshift(slimEntry(entry));
    }
    return result.slice(-4);
}
export function captureMirrorImageOwner(key) {
    const target = messageSlot(key, true);
    if (!target)
        return null;
    let extra = swipeExtras(target.msg, target.swipe).find(Boolean);
    let token = extra[OWNER_KEY];
    const sourceHash = sourceHashOf(imageSource(target.msg, target.swipe));
    if (!token?.id || Number(token.swipe) !== target.swipe) {
        const infos = Array.isArray(target.msg.swipe_info) ? target.msg.swipe_info : [];
        if (token?.id && Number(token.swipe) !== target.swipe && infos.some((info, index) => index !== target.swipe && info?.extra === extra)) {
            const old = extra;
            extra = structuredCloneSafe(extra);
            if (Number(target.msg.swipe_id || 0) === target.swipe)
                target.msg.extra = extra;
            if (infos[target.swipe]?.extra === old)
                infos[target.swipe].extra = extra;
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
    if (!owner || !chatReady(ctx) || currentChatName(ctx) !== owner.chat || (owner.scope && archiveScope(ctx) !== owner.scope))
        return null;
    const matches = [];
    ctx.chat.forEach((msg, mes) => {
        const swipes = new Set([Number(msg?.swipe_id || 0), ...(Array.isArray(msg?.swipe_info) ? msg.swipe_info.map((_, index) => index) : [])]);
        for (const swipe of swipes)
            for (const extra of swipeExtras(msg, swipe).filter(Boolean)) {
                const sourceMatches = !matchSource || (typeof owner.source === 'string' ? sameImageSource(imageSource(msg, swipe), owner.source)
                    : sourceHashMatches(owner.sourceHash, imageSource(msg, swipe)));
                if (extra[OWNER_KEY]?.id === owner.token && Number(extra[OWNER_KEY]?.swipe) === swipe && sourceMatches)
                    matches.push({ ctx, msg, mes, swipe, extra });
            }
    });
    const exact = matches.filter(target => target.msg === owner.message);
    return exact.length === 1 ? exact[0] : matches.length === 1 ? matches[0] : null;
}
export function mirrorImageOwnerReceipt(owner) {
    if (!owner?.token || !owner.entry || !owner.chat || typeof owner.source !== 'string')
        return null;
    return { chat: owner.chat, token: owner.token, entry: owner.entry, sourceHash: sourceHashOf(owner.source), ...(owner.scope ? { scope: owner.scope } : {}) };
}
export function mirrorImageOwnerMatchesKey(owner, key, { matchEntry = true } = {}) {
    const slot = slotOfKey(key), target = ownedTarget(owner);
    return !!slot && !!target && stripChat(slot.chat) === owner.chat && Number(slot.mes) === target.mes && Number(slot.swipe) === target.swipe && (!matchEntry || slot.entry === owner.entry);
}
function markMessageCopySaved(error) {
    try {
        Object.defineProperty(error, 'messageCopySaved', { value: true, configurable: true });
    }
    catch { }
    return error;
}
export function saveMirrorImageForOwner(key, record, owner, { preserveCurrent = false } = {}) {
    if (!owner?.message || !owner.extra || typeof owner.source !== 'string')
        throw new TypeError(__rmT("imRFQIwwcRenAmc7ZhOYOyVu6Yr40NW529E"));
    const target = ownedTarget(owner);
    const changedSource = !target && (ownedTarget(owner, { matchSource: false }) || !sameImageSource(imageSource(owner.message, owner.swipe), owner.source));
    const scope = owner.scope || `chat:${owner.chat}`;
    const retainedKey = ownerArchiveKey(owner.token, scope, owner.entry, changedSource ? sourceHashOf(owner.source) : '');
    record = { ...record, imageOwner: { token: owner.token, source: sourceHashOf(owner.source) } };
    let previous = loadMirrorImage(retainedKey);
    const candidate = target?.extra[EXTRA_KEY]?.[owner.entry];
    const messagePrevious = target && ownEntry(candidate, target.swipe) && recordMatchesMessage(candidate, target.msg, target.swipe, false) ? candidate : null;
    const captured = !target ? owner.extra?.[EXTRA_KEY]?.[owner.entry] : null;
    const capturedPrevious = captured && ownEntry(captured, owner.swipe) && captured.current?.imageOwner?.token === owner.token ? captured : null;
    const fromMessage = messagePrevious || capturedPrevious;
    if (!previous && fromMessage)
        previous = { ...fromMessage.current, history: fromMessage.history || [] };
    const keepCurrent = preserveCurrent && previous?.imageOwner?.token === owner.token;
    if (!keepCurrent)
        record = { ...record, shownAt: preserveCurrent ? 0 : Date.now() };
    const history = imageHistory(previous ? [...previous.history, keepCurrent ? record : storedRecord(previous)] : [], keepCurrent ? previous : record);
    if (keepCurrent)
        record = storedRecord(previous);
    const retained = { ...storedRecord(record), history };
    const archive = { version: 1, current: storedRecord(retained), history: retained.history,
        owner: { chat: owner.chat, message: owner.originalMes, swipe: owner.swipe, source: sourceHashOf(owner.source), scope } };
    let archiveError = null;
    try {
        write(retainedKey, 'images', archive);
    }
    catch (error) {
        archiveError = error;
    }
    if (target) {
        if (!archiveError)
            rememberArchiveScope(target.extra, owner.token, owner.entry, scope, target.mes, archive.current, archive.history);
        if (!chatCopy(archive)) {
            if (archiveError)
                throw archiveError;
            if (target.extra[EXTRA_KEY])
                delete target.extra[EXTRA_KEY][owner.entry];
            clearImageRemoved({ ...target, entry: owner.entry });
            requestChatSave(target.mes);
            return retained;
        }
        const parsed = parseBuiltinImageKey(key);
        const manual = !parsed ? JSON.parse(key) : null;
        const liveKey = parsed ? `builtin:${owner.chat}:${target.mes}:${target.swipe}:${parsed.index}:${parsed.hash}`
            : JSON.stringify([manual[0], target.mes, target.swipe, ...manual.slice(3)]);
        const history = keepCurrent ? retained.history : imageHistory([...(retained.history || []), ...(messagePrevious?.history || []), ...(messagePrevious?.current ? [messagePrevious.current] : [])], record);
        const result = replaceMirrorImageVersions(liveKey, record, history, { keepShownAt: preserveCurrent });
        if (archiveError)
            throw markMessageCopySaved(archiveError);
        return result;
    }
    if (sameImageSource(imageSource(owner.message, owner.swipe), owner.source) && owner.extra[OWNER_KEY]?.id === owner.token) {
        touchMessage(owner.message);
        if (!archiveError)
            rememberArchiveScope(owner.extra, owner.token, owner.entry, scope, null, archive.current, archive.history);
        const store = owner.extra[EXTRA_KEY] ||= {};
        const copy = chatCopy(archive);
        if (copy) {
            store[owner.entry] = { ...copy, swipe: owner.swipe };
            if (archiveError)
                throw markMessageCopySaved(archiveError);
        }
    }
    if (archiveError)
        throw archiveError;
    return retained;
}
function removeMessageImage(key) {
    const target = messageSlot(key);
    if (!target)
        return;
    let removed = false;
    for (const store of target.stores)
        if (Object.prototype.hasOwnProperty.call(store, target.entry)) {
            delete store[target.entry];
            removed = true;
        }
    if (removed) {
        keyNamesGen += 1;
        requestChatSave(target.mes);
    }
}
const borrowed = new Map();
function borrowKey(chat, mes, swipe) { return `${stripChat(chat)}|${mes}|${swipe}`; }
export function lendMirrorImages(chat, mes, swipe, entries) {
    if (!entries || typeof entries !== 'object')
        return;
    borrowed.set(borrowKey(chat, mes, swipe), entries);
    if (borrowed.size > 200)
        borrowed.delete(borrowed.keys().next().value);
}
function readBorrowed(key) {
    const slot = slotOfKey(key);
    if (!slot)
        return null;
    const value = borrowed.get(borrowKey(slot.chat, slot.mes, slot.swipe))?.[slot.entry];
    return value && typeof value === 'object' ? value : null;
}
function favoriteLight(value) {
    const light = entry => entry && typeof entry === 'object' ? Object.fromEntries(Object.entries({
        url: entry.url, path: entry.path, generatedAt: entry.generatedAt, builtinImageFit: entry.builtinImageFit, provider: entry.provider,
    }).filter(([, item]) => item !== undefined && item !== null && item !== '')) : null;
    const current = light(value?.current);
    return current && (current.path || current.url) && !String(current.path || current.url).startsWith('data:') ? { version: 1, current, history: [] } : null;
}
export function mirrorImagesForSlot(mes, swipe, chatKey = '') {
    const ctx = liveContext();
    if (!chatReady(ctx))
        return null;
    const current = currentChatName(ctx);
    if (chatKey && stripChat(chatKey) !== current)
        return null;
    const msg = ctx.chat?.[Number(mes)];
    if (!msg)
        return null;
    const out = {};
    for (const extra of swipeExtras(msg, Number(swipe)).filter(Boolean)) {
        const store = extra[EXTRA_KEY];
        if (store && typeof store === 'object')
            for (const [entry, value] of Object.entries(store)) {
                if (out[entry] || !ownEntry(value, Number(swipe)))
                    continue;
                const light = favoriteLight(value);
                if (light)
                    out[entry] = light;
            }
    }
    for (const name of localImageNames()) {
        const slot = slotOfKey(name.slice(`${PREFIX}images:`.length));
        if (!slot || stripChat(slot.chat) !== current || slot.mes !== String(mes) || slot.swipe !== String(swipe) || out[slot.entry])
            continue;
        try {
            const light = favoriteLight(JSON.parse(globalThis.localStorage.getItem(name)));
            if (light)
                out[slot.entry] = light;
        }
        catch { }
    }
    if (!Object.keys(out).length)
        return null;
    while (JSON.stringify(out).length > 32768 && Object.keys(out).length)
        delete out[Object.keys(out).pop()];
    return Object.keys(out).length ? out : null;
}
function localImageNames() {
    const head = `${PREFIX}images:`;
    const names = [];
    const storage = globalThis.localStorage;
    try {
        if (storage)
            for (let i = 0; i < storage.length; i += 1) {
                const name = storage.key(i);
                if (name?.startsWith(head))
                    names.push(name);
            }
    }
    catch { }
    return names;
}
const migratedChats = new WeakSet();
function migrateIntoMessages() {
    const ctx = liveContext();
    if (!chatReady(ctx) || migratedChats.has(ctx.chatMetadata) || !currentChatName(ctx))
        return;
    migratedChats.add(ctx.chatMetadata);
    try {
        dropMirrorImageCopiesSavedInChat();
    }
    catch { }
    let moved = 0, lastMes = -1;
    const adopt = (key, value) => {
        const copy = chatCopy(value);
        if (!copy)
            return false;
        const target = messageSlot(key, true);
        if (!target)
            return false;
        if (imageRemoved(target))
            return false;
        if (!recordMatchesMessage(value, target.msg, target.swipe))
            return false;
        if (target.stores.some(store => ownEntry(store[target.entry], target.swipe)))
            return true;
        target.stores.forEach(store => { pruneCopied(store, target.swipe); store[target.entry] = { ...structuredCloneSafe(copy), swipe: target.swipe }; });
        touchMessage(target.msg);
        moved += 1;
        lastMes = target.mes;
        return true;
    };
    const legacy = ctx.chatMetadata[LEGACY_META_KEY];
    if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) {
        for (const [key, value] of Object.entries(legacy))
            if (adopt(key, value))
                delete legacy[key];
        if (!Object.keys(legacy).length)
            delete ctx.chatMetadata[LEGACY_META_KEY];
    }
    const head = `${PREFIX}images:`;
    const currentName = currentChatName(ctx);
    for (const name of localImageNames()) {
        const key = name.slice(head.length);
        const slot = slotOfKey(key);
        if (!slot || stripChat(slot.chat) !== currentName)
            continue;
        let value = null;
        try {
            value = JSON.parse(globalThis.localStorage.getItem(name));
        }
        catch {
            value = null;
        }
        if (value)
            adopt(key, value);
    }
    if (moved) {
        keyNamesGen += 1;
        requestChatSave(lastMes);
    }
}
let keyNamesGen = 0;
const keyNamesCache = new WeakMap();
function messageKeyNames(ctx) {
    const signature = `${ctx.chat.length}|${keyNamesGen}|${currentChatName(ctx)}|${ctx.chat.reduce((sum, msg, index) => sum + (Number.isInteger(msg?.swipe_id) ? msg.swipe_id * (index + 1) : 0), 0)}`;
    const cached = keyNamesCache.get(ctx.chat);
    if (cached?.signature === signature)
        return cached.names;
    const names = [];
    const head = `${PREFIX}images:`;
    const chat = currentChatName(ctx);
    ctx.chat.forEach((msg, mes) => {
        if (!msg || typeof msg !== 'object')
            return;
        const swipes = new Set([Number.isInteger(msg.swipe_id) ? msg.swipe_id : 0]);
        if (Array.isArray(msg.swipe_info))
            msg.swipe_info.forEach((_, index) => swipes.add(index));
        for (const swipe of swipes)
            for (const extra of swipeExtras(msg, swipe).filter(Boolean)) {
                const store = extra[EXTRA_KEY];
                const entries = new Set();
                if (store && typeof store === 'object') {
                    for (const [entry, value] of Object.entries(store))
                        if (!entry.startsWith('manual:') && ownEntry(value, swipe))
                            entries.add(entry);
                }
                const marker = extra[OWNER_KEY];
                if (marker?.id && Number(marker.swipe) === swipe) {
                    for (const [entry, version] of Object.entries(marker.archiveVersions || {})) {
                        const parsed = parseBuiltinImageKey(`builtin:${chat}:${mes}:${swipe}:${entry}`);
                        if (typeof version === 'string' && version && parsed?.hash && parseBuiltinFrameIndex(parsed.index))
                            entries.add(entry);
                    }
                }
                for (const entry of entries)
                    if (extra[REMOVED_KEY]?.[entry] !== true)
                        names.push(`${head}builtin:${chat}:${mes}:${swipe}:${entry}`);
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
        for (const name of messageKeyNames(ctx))
            names.add(name);
        const legacy = ctx.chatMetadata?.[LEGACY_META_KEY];
        if (legacy && typeof legacy === 'object' && !Array.isArray(legacy))
            for (const key of Object.keys(legacy))
                names.add(head + key);
    }
    for (const [slot, entries] of borrowed) {
        const parts = slot.split('|'), swipe = parts.pop(), mes = parts.pop(), chat = parts.join('|');
        for (const entry of Object.keys(entries))
            if (!entry.startsWith('manual:'))
                names.add(`${head}builtin:${chat}:${mes}:${swipe}:${entry}`);
    }
    return [...names];
}
function read(key, kind) {
    if (kind !== 'images') {
        const text = globalThis.localStorage.getItem(storageKey(key, kind));
        return text == null ? null : JSON.parse(text);
    }
    migrateIntoMessages();
    if (imageRemoved(messageSlot(key)))
        return null;
    const fromMessage = readMessageImage(key);
    if (fromMessage)
        return preserveClearedImagePrompts(key, fromMessage);
    const text = globalThis.localStorage.getItem(storageKey(key, kind));
    if (text != null) {
        const value = JSON.parse(text);
        const slot = slotOfKey(key), ctx = liveContext();
        if (value?.current?.imageOwner && slot && stripChat(slot.chat) === currentChatName(ctx)) {
            const msg = ctx?.chat?.[Number(slot.mes)];
            if (!msg || !recordMatchesMessage(value, msg, Number(slot.swipe)))
                return null;
        }
        if (chatCopy(value))
            writeMessageImage(key, value);
        return value;
    }
    const legacy = liveContext()?.chatMetadata?.[LEGACY_META_KEY]?.[key];
    if (legacy && typeof legacy === 'object') {
        writeMessageImage(key, legacy);
        return legacy;
    }
    return readBorrowed(key);
}
function write(key, kind, value) {
    if (kind === 'images')
        value = preserveClearedImagePrompts(key, value);
    if (kind === 'images' && writeMessageImage(key, value)) {
        const name = storageKey(key, kind);
        let keepOld = false;
        try {
            const old = JSON.parse(globalThis.localStorage.getItem(name) || 'null');
            const dataOnly = entry => entry && typeof entry === 'object' && !entry.path && /^data:/.test(String(entry.url || entry.dataUrl || ''));
            keepOld = !!old && (dataOnly(old.current) || (Array.isArray(old.history) && old.history.some(dataOnly)));
        }
        catch {
            keepOld = false;
        }
        if (!keepOld) {
            const light = chatCopy(value);
            const tiny = entry => entry && typeof entry === 'object' ? slimEntry(entry) : entry;
            const shown = light?.current?.shownAt ? { ...tiny(light.current), shownAt: light.current.shownAt } : tiny(light?.current);
            try {
                if (light)
                    globalThis.localStorage.setItem(name, JSON.stringify({ ...light, current: shown, history: light.history.map(tiny) }));
            }
            catch {
                try {
                    if (light)
                        globalThis.localStorage.setItem(name, JSON.stringify({ ...light, current: tiny(light.current), history: [] }));
                }
                catch { }
            }
        }
        return;
    }
    const name = storageKey(key, kind), text = JSON.stringify(value);
    try {
        globalThis.localStorage.setItem(name, text);
    }
    catch (error) {
        let freed = false;
        try {
            freed = dropMirrorImageCopiesSavedInChat({ urgent: true }) > 0;
        }
        catch {
            freed = false;
        }
        if (!slimMirrorImagesForQuota() && !freed)
            throw error;
        globalThis.localStorage.setItem(name, text);
    }
}
export function imagePromptFingerprint(entry) {
    if (!entry || typeof entry !== 'object')
        return '';
    if (entry.slimmed === true)
        return String(entry.promptHash || '');
    const meta = entry.promptMetadata && typeof entry.promptMetadata === 'object' ? entry.promptMetadata : {};
    const text = JSON.stringify([String(meta.prompt || ''), String(meta.nl || ''), String(meta.flatPrompt || ''), String(entry.prompt || ''), meta.promptFormat || '']);
    if (text === JSON.stringify(['', '', '', '', '']))
        return '';
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(36);
}
function slimEntry(entry) {
    if (!entry || typeof entry !== 'object')
        return entry;
    if (entry.slimmed === true)
        return { ...entry };
    if (entry.editedPrompt === true) {
        const { dataUrl: ignored, ...rest } = entry;
        return entry.path ? rest : { ...entry };
    }
    const promptHash = imagePromptFingerprint(entry);
    const meta = entry.promptMetadata && typeof entry.promptMetadata === 'object' ? entry.promptMetadata : {};
    const out = { url: entry.url, path: entry.path, generatedAt: entry.generatedAt, provider: entry.provider, builtinImageFit: entry.builtinImageFit, looksSources: entry.looksSources, imageOwner: entry.imageOwner };
    if (!entry.path && entry.dataUrl && entry.dataUrl !== entry.url)
        out.dataUrl = entry.dataUrl;
    const slimMeta = { seed: meta.seed, promptFormat: meta.promptFormat, size: meta.size };
    out.promptMetadata = Object.fromEntries(Object.entries(slimMeta).filter(([, value]) => value !== undefined));
    out.slimmed = true;
    if (promptHash)
        out.promptHash = promptHash;
    return Object.fromEntries(Object.entries(out).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}
let migrated = false;
function migrateOldImageRecords() {
    if (migrated)
        return;
    migrated = true;
    try {
        slimMirrorImagesForQuota();
    }
    catch { }
}
let slimmedClean = false;
export function resetMirrorImageSlimFlag() { slimmedClean = false; }
export function slimMirrorImagesForQuota() {
    const storage = globalThis.localStorage;
    if (!storage || slimmedClean)
        return false;
    const head = `${PREFIX}images:`;
    const names = [];
    try {
        for (let i = 0; i < storage.length; i += 1) {
            const name = storage.key(i);
            if (name?.startsWith(head))
                names.push(name);
        }
    }
    catch {
        return false;
    }
    let freed = false;
    for (const name of names) {
        try {
            const raw = storage.getItem(name);
            const data = raw ? JSON.parse(raw) : null;
            if (!data || data.version !== 1 || !data.current || !Array.isArray(data.history))
                continue;
            const current = { ...data.current };
            if (current.path)
                delete current.dataUrl;
            const next = JSON.stringify({ ...data, current, history: data.history.map(slimEntry) });
            if (next.length >= raw.length)
                continue;
            storage.setItem(name, next);
            freed = true;
        }
        catch { }
    }
    slimmedClean = true;
    return freed;
}
function clearImagePromptEntry(entry) {
    if (!entry || typeof entry !== 'object')
        return entry;
    const out = { ...entry, slimmed: true, promptsCleared: true };
    const hash = imagePromptFingerprint(entry);
    if (hash)
        out.promptHash = hash;
    delete out.prompt;
    const meta = entry.promptMetadata && typeof entry.promptMetadata === 'object' ? entry.promptMetadata : {};
    out.promptMetadata = Object.fromEntries(['seed', 'promptFormat', 'size', 'backend', 'format', 'charactersApplied']
        .filter(name => meta[name] !== undefined).map(name => [name, meta[name]]));
    return out;
}
function clearRecordPrompts(value) {
    if (!value || value.version !== 1 || !value.current || !Array.isArray(value.history))
        return null;
    return { ...value, current: clearImagePromptEntry(value.current), history: value.history.map(clearImagePromptEntry) };
}
function recordHasImagePrompts(value) {
    return [value?.current, ...(Array.isArray(value?.history) ? value.history : [])].some(entry => {
        const meta = entry?.promptMetadata || {};
        return !!String(entry?.prompt || meta.prompt || meta.nl || meta.flatPrompt || '').trim()
            || Array.isArray(meta.characters) && meta.characters.length > 0;
    });
}
function preserveClearedImagePrompts(key, value) {
    if (!value?.current)
        return value;
    const names = new Set([storageKey(key, 'images')]);
    const slot = slotOfKey(key), token = value.current.imageOwner?.token;
    if (slot && token) {
        const target = messageSlot(key);
        names.add(storageKey(ownerArchiveKey(token, target ? archiveScope(target.ctx) : `chat:${stripChat(slot.chat)}`, slot.entry), 'images'));
    }
    const cleared = new Set();
    for (const name of names)
        try {
            const saved = JSON.parse(globalThis.localStorage?.getItem(name) || 'null');
            for (const entry of [saved?.current, ...(Array.isArray(saved?.history) ? saved.history : [])])
                if (entry?.promptsCleared === true)
                    cleared.add(imageIdentity(entry));
        }
        catch { }
    if (!cleared.size)
        return value;
    const clean = entry => cleared.has(imageIdentity(entry)) ? clearImagePromptEntry(entry) : entry;
    return { ...value, current: clean(value.current), history: (Array.isArray(value.history) ? value.history : []).map(clean) };
}
export function measureAllMirrorImagePromptCleanup() {
    let bytes = 0;
    for (const name of localImageNames())
        try {
            const raw = globalThis.localStorage.getItem(name);
            const next = clearRecordPrompts(JSON.parse(raw));
            if (next)
                bytes += Math.max(0, raw.length - JSON.stringify(next).length) * 2;
        }
        catch { }
    const store = globalThis.localStorage;
    try {
        for (let i = 0; i < store.length; i += 1) {
            const name = store.key(i);
            if (name?.startsWith(`${PREFIX}draft:`))
                bytes += (name.length + String(store.getItem(name) || '').length) * 2;
        }
    }
    catch { }
    return bytes;
}
export function clearAllMirrorImagePrompts() {
    const result = { updated: 0, failed: 0, drafts: 0 };
    const store = globalThis.localStorage;
    if (!store)
        return { ...result, failed: 1 };
    for (const name of localImageNames())
        try {
            const raw = store.getItem(name), data = JSON.parse(raw);
            const cleaned = clearRecordPrompts(data);
            if (!cleaned) {
                result.failed += 1;
                continue;
            }
            const next = JSON.stringify(cleaned);
            if (next.length >= raw.length && !recordHasImagePrompts(data))
                continue;
            store.setItem(name, next);
            if (store.getItem(name) !== next) {
                result.failed += 1;
                continue;
            }
            result.updated += 1;
        }
        catch {
            result.failed += 1;
        }
    const drafts = [];
    try {
        for (let i = 0; i < store.length; i += 1) {
            const name = store.key(i);
            if (name?.startsWith(`${PREFIX}draft:`))
                drafts.push(name);
        }
    }
    catch {
        result.failed += 1;
    }
    for (const name of drafts)
        try {
            store.removeItem(name);
            if (store.getItem(name) == null)
                result.drafts += 1;
            else
                result.failed += 1;
        }
        catch {
            result.failed += 1;
        }
    promptCleanupRevision += 1;
    try {
        globalThis.dispatchEvent?.(new CustomEvent(MIRROR_IMAGE_PROMPTS_CLEARED_EVENT));
    }
    catch { }
    return result;
}
const imageVersions = value => [value?.current, ...(Array.isArray(value?.history) ? value.history : [])].filter(entry => entry && typeof entry === 'object');
const fileAddressOf = entry => { const url = String(entry?.path || entry?.url || ''); return url && !url.startsWith('data:') ? url : ''; };
function hasPromptText(entry) {
    const meta = entry?.promptMetadata && typeof entry.promptMetadata === 'object' ? entry.promptMetadata : {};
    return !!String(entry?.prompt || meta.prompt || meta.nl || meta.flatPrompt || '').trim();
}
export function mirrorImageCopyCovers(copy, local) {
    if (!local || local.version !== 1 || !local.current || !Array.isArray(local.history) || !copy?.current)
        return false;
    const mine = imageVersions(local);
    if (mine.some(entry => !fileAddressOf(entry)))
        return false;
    if (imageIdentity(local.current) !== imageIdentity(copy.current))
        return false;
    const have = new Set(imageVersions(copy).map(fileAddressOf).filter(Boolean));
    if (!mine.every(entry => have.has(fileAddressOf(entry))))
        return false;
    const words = imagePromptFingerprint(local.current);
    if (words && words !== imagePromptFingerprint(copy.current))
        return false;
    const cleared = new Set(mine.filter(entry => entry.promptsCleared === true).map(imageIdentity));
    return !cleared.size || !imageVersions(copy).some(entry => cleared.has(imageIdentity(entry)) && entry.promptsCleared !== true);
}
export function mirrorImageCopyOnMessage(msg, swipe, entry) {
    if (!msg || typeof msg !== 'object' || !Number.isInteger(swipe) || swipe < 0 || !entry)
        return null;
    const shown = Number.isInteger(msg.swipe_id) ? msg.swipe_id : 0;
    if (swipe !== shown && !(Array.isArray(msg.swipe_info) && msg.swipe_info[swipe] && typeof msg.swipe_info[swipe] === 'object'))
        return null;
    for (const extra of swipeExtras(msg, swipe).filter(Boolean)) {
        if (extra[REMOVED_KEY]?.[entry] === true)
            return null;
        const value = extra[EXTRA_KEY]?.[entry];
        if (ownEntry(value, swipe) && value.current && typeof value.current === 'object')
            return value;
    }
    return null;
}
export function mirrorImageMessageOwns(msg, swipe, local) {
    return !!msg && typeof msg === 'object' && recordMatchesMessage(local, msg, swipe, false);
}
export function mirrorImageKeySlot(key) { return slotOfKey(key); }
export function parseMirrorImageArchiveKey(key) {
    const match = /^owner:([^:]+):(.*)$/.exec(String(key || ''));
    if (!match)
        return null;
    let rest = match[2], scope = null;
    const scoped = /^scope:([^:]*):/.exec(rest);
    if (scoped) {
        try {
            scope = decodeURIComponent(scoped[1]);
        }
        catch {
            return null;
        }
        rest = rest.slice(scoped[0].length);
    }
    const retired = /^retired:([^:]+):/.exec(rest);
    if (retired)
        rest = rest.slice(retired[0].length);
    return rest ? { token: match[1], scope, entry: rest, retired: !!retired } : null;
}
export function mirrorImageDraftSuperseded(draft, copy) {
    const at = Date.parse(String(copy?.current?.generatedAt || ''));
    return !!draft && typeof draft === 'object' && Number.isFinite(at) && Number(draft.updatedAt || 0) < at
        && copy.current.promptsCleared !== true && hasPromptText(copy.current);
}
export function mirrorImageLocalCopyNames(key, token, entry, except = new Set(), allNames = null) {
    const names = [];
    const storage = globalThis.localStorage;
    const own = storageKey(key, 'images'), archives = token ? `${PREFIX}images:owner:${token}:` : '';
    const matches = name => name && !except.has(name)
        && (name === own || (archives && name.startsWith(archives) && parseMirrorImageArchiveKey(name.slice(`${PREFIX}images:`.length))?.entry === entry));
    try {
        if (Array.isArray(allNames)) {
            for (const name of allNames)
                if (matches(name))
                    names.push(name);
        }
        else
            for (let i = 0; i < storage.length; i += 1) {
                const name = storage.key(i);
                if (matches(name))
                    names.push(name);
            }
    }
    catch {
        names.push(own);
    }
    return names;
}
const SAVED_COPY_GRACE_MS = 24 * 60 * 60 * 1000;
function newestStamp(value) {
    const stamps = [];
    for (const entry of [value?.current, ...(Array.isArray(value?.history) ? value.history : [])]) {
        if (!entry || typeof entry !== 'object')
            continue;
        stamps.push(Number(entry.shownAt) || 0, Date.parse(String(entry.generatedAt || '')) || 0);
    }
    stamps.push(Number(value?.updatedAt) || 0);
    return Math.max(0, ...stamps);
}
const chatIdentities = new WeakMap();
let chatIdentitySequence = 0;
function chatIdentity(chat) {
    if (!chat || typeof chat !== 'object')
        return 0;
    if (!chatIdentities.has(chat))
        chatIdentities.set(chat, ++chatIdentitySequence);
    return chatIdentities.get(chat);
}
let savedCopiesCleanSignature = '';
export function dropMirrorImageCopiesSavedInChat({ dryRun = false, urgent = false } = {}) {
    const storage = globalThis.localStorage, ctx = liveContext();
    if (!storage || !chatReady(ctx))
        return 0;
    const chatName = currentChatName(ctx), scope = archiveScope(ctx);
    if (!chatName)
        return 0;
    const signatureNow = () => { let length = 0; try {
        length = storage.length;
    }
    catch {
        length = -1;
    } return [chatName, scope, chatIdentity(ctx.chat), ctx.chat.length, length, keyNamesGen, touchGen, urgent ? 1 : 0].join('|'); };
    if (!dryRun && signatureNow() === savedCopiesCleanSignature)
        return 0;
    const now = Date.now();
    const settled = value => urgent || now - newestStamp(value) >= SAVED_COPY_GRACE_MS;
    const holders = new Map();
    ctx.chat.forEach(msg => {
        if (!msg || typeof msg !== 'object' || touchedMessages.has(msg))
            return;
        const swipes = new Set([Number.isInteger(msg.swipe_id) ? msg.swipe_id : 0, ...(Array.isArray(msg.swipe_info) ? msg.swipe_info.map((_, index) => index) : [])]);
        for (const swipe of swipes)
            for (const extra of swipeExtras(msg, swipe).filter(Boolean)) {
                const id = extra[OWNER_KEY]?.id;
                if (!id || Number(extra[OWNER_KEY].swipe) !== swipe)
                    continue;
                if (!holders.has(id))
                    holders.set(id, []);
                holders.get(id).push({ msg, swipe });
            }
    });
    const savedForKey = key => {
        const slot = slotOfKey(key);
        if (!slot || stripChat(slot.chat) !== chatName || !/^\d+$/.test(slot.mes) || !/^\d+$/.test(slot.swipe))
            return null;
        const msg = ctx.chat[Number(slot.mes)];
        if (!msg || typeof msg !== 'object' || touchedMessages.has(msg))
            return null;
        const copy = mirrorImageCopyOnMessage(msg, Number(slot.swipe), slot.entry);
        return copy ? { msg, swipe: Number(slot.swipe), entry: slot.entry, copy } : null;
    };
    const readJson = name => { try {
        return JSON.parse(storage.getItem(name) || 'null');
    }
    catch {
        return null;
    } };
    const names = [];
    try {
        for (let i = 0; i < storage.length; i += 1) {
            const name = storage.key(i);
            if (name?.startsWith(PREFIX))
                names.push(name);
        }
    }
    catch {
        return 0;
    }
    const imagesHead = `${PREFIX}images:`, draftHead = `${PREFIX}draft:`;
    const drop = new Set();
    for (const name of names) {
        if (!name.startsWith(imagesHead))
            continue;
        const key = name.slice(imagesHead.length);
        if (key.startsWith('owner:')) {
            const parsed = parseMirrorImageArchiveKey(key);
            if (!parsed || (parsed.scope !== null && parsed.scope !== scope))
                continue;
            const local = readJson(name);
            if (local?.current?.imageOwner?.token !== parsed.token)
                continue;
            if (stripChat(local.owner?.chat) !== chatName || (local.owner?.scope && local.owner.scope !== scope))
                continue;
            if (!settled(local))
                continue;
            const covered = (holders.get(parsed.token) || []).some(({ msg, swipe }) => mirrorImageCopyCovers(mirrorImageCopyOnMessage(msg, swipe, parsed.entry), local));
            if (covered)
                drop.add(name);
            continue;
        }
        const found = savedForKey(key);
        if (!found)
            continue;
        const local = readJson(name);
        if (local && settled(local) && mirrorImageMessageOwns(found.msg, found.swipe, local) && mirrorImageCopyCovers(found.copy, local))
            drop.add(name);
    }
    for (const name of names) {
        if (!name.startsWith(draftHead))
            continue;
        const key = name.slice(draftHead.length);
        const found = savedForKey(key);
        const draft = found ? readJson(name) : null;
        if (!found || !settled(draft) || !mirrorImageDraftSuperseded(draft, found.copy))
            continue;
        if (mirrorImageLocalCopyNames(key, found.copy.current.imageOwner?.token, found.entry, drop, names).length)
            continue;
        drop.add(name);
    }
    let bytes = 0;
    for (const name of drop) {
        let size = 0;
        try {
            size = (name.length + String(storage.getItem(name) || '').length) * 2;
        }
        catch {
            continue;
        }
        if (dryRun) {
            bytes += size;
            continue;
        }
        try {
            storage.removeItem(name);
            if (storage.getItem(name) == null)
                bytes += size;
        }
        catch { }
    }
    if (!dryRun && bytes)
        keyNamesGen += 1;
    if (!dryRun)
        savedCopiesCleanSignature = signatureNow();
    return bytes;
}
function storedRecord(record) {
    if (!record || typeof record !== 'object')
        throw new TypeError(__rmT("H9HyOXkPz4KXLoQuMohPTIEI"));
    const { history: ignoredHistory, ...copy } = record;
    const url = copy.path || copy.url || copy.dataUrl;
    if (typeof url !== 'string' || !url)
        throw new TypeError(__rmT("Aw87DC7Kf1jkl2iW3yyOj.17qDnrrk"));
    copy.url = url;
    if (copy.path)
        delete copy.dataUrl;
    else if (copy.dataUrl && copy.dataUrl === copy.url)
        delete copy.dataUrl;
    return copy;
}
export function removeMirrorImage(key, { keepSlotOf = '' } = {}) {
    if (!keepSlotOf) {
        const slot = slotOfKey(key), target = messageSlot(key), tokens = new Set();
        if (slot) {
            for (const extra of target ? swipeExtras(target.msg, target.swipe).filter(Boolean) : []) {
                const token = extra[OWNER_KEY];
                if (token?.id && Number(token.swipe) === target.swipe)
                    tokens.add(token.id);
                (extra[REMOVED_KEY] ||= {})[slot.entry] = true;
                keyNamesGen += 1;
            }
            if (target)
                requestChatSave(target.mes);
            try {
                const value = JSON.parse(globalThis.localStorage.getItem(storageKey(key, 'images')) || 'null');
                if (value?.current?.imageOwner?.token)
                    tokens.add(value.current.imageOwner.token);
            }
            catch { }
            for (const token of tokens)
                try {
                    const scope = target ? archiveScope(target.ctx) : `chat:${stripChat(slot.chat)}`;
                    const retiredPrefix = storageKey(`${ownerArchiveKey(token, scope, '')}retired:`, 'images');
                    const retired = [];
                    for (let index = 0; index < globalThis.localStorage.length; index += 1) {
                        const name = globalThis.localStorage.key(index);
                        if (name?.startsWith(retiredPrefix) && name.endsWith(`:${slot.entry}`))
                            retired.push(name);
                    }
                    globalThis.localStorage.removeItem(storageKey(ownerArchiveKey(token, scope, slot.entry), 'images'));
                    for (const name of retired)
                        globalThis.localStorage.removeItem(name);
                }
                catch { }
        }
    }
    try {
        globalThis.localStorage.removeItem(storageKey(key, 'images'));
    }
    catch { }
    const a = slotOfKey(key), b = keepSlotOf ? slotOfKey(keepSlotOf) : null;
    const sameSlot = a && b && stripChat(a.chat) === stripChat(b.chat) && a.mes === b.mes && a.swipe === b.swipe && a.entry === b.entry;
    if (!sameSlot)
        try {
            removeMessageImage(key);
        }
        catch { }
    try {
        const legacy = liveContext()?.chatMetadata?.[LEGACY_META_KEY];
        if (legacy && typeof legacy === 'object')
            delete legacy[key];
    }
    catch { }
}
export function loadMirrorImage(key) {
    const data = read(key, 'images');
    if (data == null)
        return null;
    if (data.version !== 1 || !data.current || !Array.isArray(data.history))
        throw new TypeError(__rmT("V8Zwl6MUbRIict8AXPP7B6K.0UoAU.uBMOXxL6ruFbdOaSQX"));
    return { ...data.current, history: data.history };
}
export function saveMirrorImage(key, record) {
    const previous = loadMirrorImage(key);
    const current = { ...storedRecord(record), shownAt: Date.now() };
    migrateOldImageRecords();
    const history = (previous ? [...previous.history, storedRecord(previous)] : [])
        .slice(-4)
        .filter((entry, index, list) => index === list.length - 1 || !String(entry?.url || '').startsWith('data:'))
        .map((entry, index, list) => {
        if (index === list.length - 1 || !entry || typeof entry !== 'object')
            return entry;
        const { dataUrl: ignoredDataUrl, ...rest } = entry;
        return rest;
    })
        .map(slimEntry);
    write(key, 'images', { version: 1, current, history });
    slimmedClean = false;
    return { ...current, history };
}
export function findBuiltinImageKeyFromOtherChat(_key) {
    return '';
}
export function parseBuiltinImageKey(key) {
    const parts = String(key || '').split(':');
    if (parts[0] !== 'builtin' || parts.length < 6)
        return null;
    return { chat: parts.slice(1, -4).join(':'), mes: parts[parts.length - 4], swipe: parts[parts.length - 3], index: parts[parts.length - 2], hash: parts[parts.length - 1] };
}
export function parseBuiltinFrameIndex(value) {
    const match = /^f(\d+)\.(\d+)$/.exec(String(value));
    return match ? { face: Number(match[1]), frame: Number(match[2]), legacy: false }
        : /^\d+$/.test(String(value)) ? { face: null, frame: Number(value), legacy: true } : null;
}
export function findUnambiguousBuiltinImageKey(key, { legacyOnly = false } = {}) {
    const wanted = parseBuiltinImageKey(key);
    if (!wanted || !/^\d+$/.test(wanted.mes) || !/^\d+$/.test(wanted.swipe))
        return '';
    const matches = new Map(), head = `${PREFIX}images:`;
    for (const name of imageKeyNames()) {
        const candidate = name.slice(head.length), other = parseBuiltinImageKey(candidate);
        if (!other || !sameChat(wanted.chat, other.chat) || wanted.mes !== other.mes || wanted.swipe !== other.swipe || wanted.hash !== other.hash)
            continue;
        if (legacyOnly && !parseBuiltinFrameIndex(other.index)?.legacy)
            continue;
        try {
            if (loadMirrorImage(candidate))
                matches.set(`${other.index}:${other.hash}`, candidate);
        }
        catch { }
    }
    return matches.size === 1 ? matches.values().next().value : '';
}
const sameChat = (a, b) => String(a).replace(/^chat:/, '') === String(b).replace(/^chat:/, '');
export function builtinImageKeysCompatible(a, b) {
    const x = parseBuiltinImageKey(a), y = parseBuiltinImageKey(b);
    if (!x || !y || !sameChat(x.chat, y.chat) || x.index !== y.index || x.hash !== y.hash || !x.hash)
        return false;
    const frame = parseBuiltinFrameIndex(x.index);
    const same = (u, v) => u === v || (frame?.legacy && (u === '' || v === ''));
    return same(x.mes, y.mes) && same(x.swipe, y.swipe);
}
export function findCompatibleBuiltinImageKey(key) {
    const storage = globalThis.localStorage;
    const wanted = parseBuiltinImageKey(key);
    if (!storage || !wanted || !wanted.hash)
        return '';
    const imagesPrefix = `${PREFIX}images:`;
    const head = `${imagesPrefix}builtin:`;
    const suffix = `:${wanted.index}:${wanted.hash}`;
    const own = storageKey(key, 'images');
    let best = '', bestScore = -1;
    try {
        for (const name of imageKeyNames()) {
            if (!name || name === own || !name.startsWith(head) || !name.endsWith(suffix))
                continue;
            const candidate = name.slice(imagesPrefix.length);
            if (!builtinImageKeysCompatible(key, candidate))
                continue;
            const other = parseBuiltinImageKey(candidate);
            const score = (other.mes === wanted.mes ? 4 : 0) + (other.swipe === wanted.swipe ? 2 : 0) + (other.chat === wanted.chat ? 1 : 0);
            if (score > bestScore) {
                best = candidate;
                bestScore = score;
            }
        }
    }
    catch { }
    return best;
}
export function builtinImageKeysShifted(a, b) {
    const x = parseBuiltinImageKey(a), y = parseBuiltinImageKey(b);
    if (!x || !y || !x.hash || x.hash !== y.hash || x.index === y.index)
        return false;
    const xi = parseBuiltinFrameIndex(x.index), yi = parseBuiltinFrameIndex(y.index);
    if (!xi || !yi || xi.legacy !== yi.legacy || xi.face !== yi.face)
        return false;
    if (x.mes === '' || x.swipe === '' || x.mes !== y.mes || x.swipe !== y.swipe)
        return false;
    return sameChat(x.chat, y.chat);
}
function builtinKeyForOwnedArchive(name, target) {
    if (!target)
        return '';
    for (const extra of swipeExtras(target.msg, target.swipe).filter(Boolean)) {
        const marker = extra[OWNER_KEY];
        if (!marker?.id || Number(marker.swipe) !== target.swipe)
            continue;
        const prefix = `${PREFIX}images:owner:${marker.id}:`;
        if (!name.startsWith(prefix))
            continue;
        let entry = name.slice(prefix.length), scope = '';
        const scoped = /^scope:([^:]+):/.exec(entry);
        if (scoped) {
            scope = scoped[1];
            entry = entry.slice(scoped[0].length);
        }
        const retired = /^retired:([^:]+):/.exec(entry);
        if (retired) {
            if (!sourceHashMatches(retired[1], imageSource(target.msg, target.swipe)))
                continue;
            entry = entry.slice(retired[0].length);
        }
        if (scope && scope !== encodeURIComponent(archiveScope(target.ctx)) && scope !== encodeURIComponent(inheritedArchiveScope(marker, entry)))
            continue;
        if (extra[REMOVED_KEY]?.[entry] === true)
            continue;
        return `builtin:${currentChatName(target.ctx)}:${target.mes}:${target.swipe}:${entry}`;
    }
    return '';
}
export function findShiftedBuiltinImageKey(key, claimed = null) {
    const storage = globalThis.localStorage;
    const wanted = parseBuiltinImageKey(key);
    if (!storage || !wanted || !wanted.hash || wanted.mes === '' || wanted.swipe === '')
        return '';
    const imagesPrefix = `${PREFIX}images:`;
    const head = `${imagesPrefix}builtin:`;
    const suffix = `:${wanted.mes}:${wanted.swipe}:`;
    const target = messageSlot(key);
    let best = '', bestShownAt = -1, bestDistance = Infinity;
    let claimedSet = null;
    const taken = () => claimedSet || (claimedSet = (typeof claimed === 'function' ? claimed() : claimed) || new Set());
    try {
        for (const name of imageKeyNames()) {
            if (!name || !name.endsWith(`:${wanted.hash}`))
                continue;
            const candidate = name.startsWith(head) ? name.slice(imagesPrefix.length) : builtinKeyForOwnedArchive(name, target);
            if (!candidate.includes(suffix))
                continue;
            const other = parseBuiltinImageKey(candidate);
            if (!other || !builtinImageKeysShifted(key, candidate))
                continue;
            if ([...taken()].some(key => builtinImageKeysCompatible(key, candidate)))
                continue;
            const distance = Math.abs(parseBuiltinFrameIndex(other.index)?.frame - parseBuiltinFrameIndex(wanted.index)?.frame);
            let shownAt = 0;
            try {
                const at = Number(loadMirrorImage(candidate)?.shownAt);
                if (Number.isFinite(at) && at > 0)
                    shownAt = at;
            }
            catch { }
            if (Number.isFinite(distance) && (shownAt > bestShownAt || shownAt === bestShownAt && distance < bestDistance)) {
                best = candidate;
                bestShownAt = shownAt;
                bestDistance = distance;
            }
        }
    }
    catch { }
    return best;
}
export function replaceMirrorImageVersions(key, current, history, { keepShownAt = false } = {}) {
    migrateOldImageRecords();
    const value = { version: 1, current: keepShownAt ? storedRecord(current) : { ...storedRecord(current), shownAt: Date.now() }, history: (Array.isArray(history) ? history : []).filter(entry => entry && typeof entry === 'object').map(slimEntry) };
    const slot = slotOfKey(key), token = value.current.imageOwner?.token, target = messageSlot(key);
    let archiveKey = '', archive = null;
    if (slot && token) {
        archiveKey = ownerArchiveKey(token, target ? archiveScope(target.ctx) : `chat:${stripChat(slot.chat)}`, slot.entry);
        try {
            archive = JSON.parse(globalThis.localStorage.getItem(storageKey(archiveKey, 'images')) || 'null');
        }
        catch { }
        if (!archive && target) {
            readMessageImage(key);
            try {
                archive = JSON.parse(globalThis.localStorage.getItem(storageKey(archiveKey, 'images')) || 'null');
            }
            catch { }
        }
    }
    if (archive?.owner && !chatCopy(value)) {
        write(archiveKey, 'images', { ...value, owner: archive.owner });
        removeMessageImage(key);
        if (target)
            clearImageRemoved(target);
        try {
            globalThis.localStorage.removeItem(storageKey(key, 'images'));
        }
        catch { }
    }
    else {
        write(key, 'images', value);
        if (archive?.owner) {
            try {
                write(archiveKey, 'images', { ...value, owner: archive.owner });
            }
            catch (error) {
                throw chatCopy(value) && messageSlot(key) ? markMessageCopySaved(error) : error;
            }
        }
    }
    if (archive?.owner && target)
        for (const extra of swipeExtras(target.msg, target.swipe).filter(Boolean))
            rememberArchiveScope(extra, token, slot.entry, archiveScope(target.ctx), target.mes, value.current, value.history);
    slimmedClean = false;
    return { ...value.current, history: value.history };
}
export function loadMirrorImageDraft(key) { return read(key, 'draft'); }
export function saveMirrorImageDraft(key, draft) {
    if (!draft || typeof draft !== 'object' || Array.isArray(draft))
        throw new TypeError(__rmT("ml.EJZSNkQpfrJyqevkJnO03memrrk"));
    write(key, 'draft', draft);
    return draft;
}
export function remapMirrorImageSlots(chat, mapper, options = {}) {
    const storage = globalThis.localStorage;
    if (!storage || typeof chat !== 'string' || !chat || typeof mapper !== 'function')
        return 0;
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
                    if (!value || seen.has(value) || !Number.isInteger(Number(value.swipe)))
                        continue;
                    seen.add(value);
                    const moved = target(mes, Number(value.swipe));
                    if (moved && value.swipe !== moved[1]) {
                        value.swipe = moved[1];
                        changed = true;
                    }
                }
            }
            if (changed) {
                keyNamesGen += 1;
                requestChatSave(mes);
            }
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
            try {
                parts = JSON.parse(key);
            }
            catch {
                return '';
            }
            if (!Array.isArray(parts) || parts[0] !== chat || !Number.isInteger(parts[1]) || !Number.isInteger(parts[2]))
                return '';
            const moved = target(parts[1], parts[2]);
            return moved ? JSON.stringify([parts[0], moved[0], moved[1], ...parts.slice(3)]) : `retired:${key}`;
        }
        return '';
    };
    const moves = [];
    for (let i = 0; i < storage.length; i += 1) {
        const full = storage.key(i);
        if (!full || !full.startsWith(PREFIX))
            continue;
        const rest = full.slice(PREFIX.length);
        const colon = rest.indexOf(':');
        if (colon < 0)
            continue;
        const kind = rest.slice(0, colon), key = rest.slice(colon + 1);
        if (kind !== 'images' && kind !== 'draft')
            continue;
        const next = nextKeyFor(key);
        if (next && next !== key)
            moves.push({ from: full, to: `${PREFIX}${kind}:${next}` });
    }
    if (!moves.length)
        return 0;
    const count = new Map();
    for (const move of moves)
        count.set(move.to, (count.get(move.to) || 0) + 1);
    let plan = moves.filter(move => count.get(move.to) === 1);
    for (let changed = true; changed;) {
        const leaving = new Set(plan.map(move => move.from));
        const kept = plan.filter(move => storage.getItem(move.to) == null || leaving.has(move.to));
        changed = kept.length !== plan.length;
        plan = kept;
    }
    const values = plan.map(move => ({ ...move, value: storage.getItem(move.from) })).filter(move => move.value != null);
    for (const move of values)
        storage.removeItem(move.from);
    let moved = 0;
    for (const move of values) {
        try {
            storage.setItem(move.to, move.value);
            moved += 1;
        }
        catch {
            try {
                storage.setItem(move.from, move.value);
            }
            catch { }
        }
    }
    return moved;
}
