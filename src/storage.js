import { rmT as __rmT } from "./textTable.js?rmv=2.1.9";
import { generationPaletteFields } from './paletteRecipes.js?rmv=2.1.9';
import { interactionRecipeFields } from './interactionRecipes.js?rmv=2.1.9';
import { COMPOSITION_LABELS, VISUAL_SKELETON_MAX_CHARS, recentDiversityRecords, observedOperationFamiliesFor } from './compositionFingerprint.js?rmv=2.1.9';
import { presentationModeFields, isBlankLongTextSelection } from './presentationMode.js?rmv=2.1.9';
import { parseAtmosphereTicketIndex } from './atmosphereChoice.js?rmv=2.1.9';
import { packBatchPlanText, unpackBatchPlanText } from './batchPlanCodec.js?rmv=2.1.9';
import { compactFaceSwipeStoreForQuota } from './swipeVersions.js?rmv=2.1.9';
import { slimMirrorImagesForQuota, dropMirrorImageCopiesSavedInChat } from './imageStore.js?rmv=2.1.9';
const STORAGE_KEY = 'rabbit_mirror_theater:last_combo:v11';
const PENDING_KEY = 'rabbit_mirror_theater:pending_combo:v11';
const MAX_STORED = 25;
const FACE_DRAW_CURSOR_KEY = 'rabbit_mirror_theater:face_draw_cursors:v1';
const ATTEMPT_STORAGE_KEY = 'rabbit_mirror_theater:generation_attempts:v1';
try {
    globalThis.localStorage?.removeItem?.(FACE_DRAW_CURSOR_KEY);
}
catch { }
const DIRECTIVE_PICK_STORAGE_KEY = 'rabbit_mirror_theater:directive_pick_cache:v1';
const MAX_ATTEMPTS_PER_CHAT = 20;
const MAX_DIRECTIVE_PICKS_PER_CHAT = 24;
const ATTEMPT_TTL_MS = 12 * 60 * 60 * 1000;
const DIRECTIVE_PICK_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const FORMAT_ELIGIBLE_MISS_STORAGE_KEY = 'rabbit_mirror_theater:format_eligible_misses:v1';
const FORMAT_ELIGIBLE_MISS_CAP = 320;
function faceDrawCursorIdentity(step) {
    if (!step || typeof step.chatKey !== 'string' || !step.chatKey || step.chatKey.length > 1024
        || !Number.isInteger(step.faceIndex) || step.faceIndex < 0 || step.faceIndex > 4
        || !['theme', 'format', 'text'].includes(step.kind) || !/^[a-f0-9]{32}$/.test(step.signature || ''))
        throw new Error('Invalid face draw cursor identity');
    return JSON.stringify([step.chatKey, step.faceIndex, step.kind]);
}
function parseFaceDrawCursors(raw) {
    if (raw === null)
        return {};
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !value.cursors || typeof value.cursors !== 'object' || Array.isArray(value.cursors)
        || Object.values(value.cursors).some(row => !row || !/^[a-f0-9]{32}$/.test(row.signature || '')
            || !Number.isSafeInteger(row.cursor) || row.cursor < 0 || !Number.isSafeInteger(row.epoch) || row.epoch < 1))
        throw new Error('Invalid face draw cursor storage');
    return value.cursors;
}
export function readFaceDrawCursorState(identity) {
    try {
        const row = parseFaceDrawCursors(localStorage.getItem(FACE_DRAW_CURSOR_KEY))[faceDrawCursorIdentity(identity)];
        return row?.signature === identity.signature ? { cursor: row.cursor, epoch: row.epoch }
            : { cursor: 0, epoch: (row?.epoch || 0) + 1 };
    }
    catch (cause) {
        const error = new Error(__rmT("3KfBRoh1Sg2md7pGuWDtzqOgxwQa7khQDBpgzF7PROH45pi6YkNPV49Jrf.a1BlKZ.VY3h"), { cause });
        error.code = 'MULTIFACE_PLAN_UNAVAILABLE';
        error.reasonCode = 'FACE_DRAW_CURSOR_UNAVAILABLE';
        error.requestCount = 0;
        throw error;
    }
}
export function readFaceDrawCursor(identity) { return readFaceDrawCursorState(identity).cursor; }
function faceDrawCursorChanges(combos) {
    const states = combos.flatMap(combo => combo?.faceDrawState ? [combo.faceDrawState] : []);
    if (!states.length)
        return [];
    const before = localStorage.getItem(FACE_DRAW_CURSOR_KEY);
    const cursors = parseFaceDrawCursors(before);
    for (const state of states) {
        if (state.version !== 1 || !Array.isArray(state.steps) || state.steps.length > 3)
            throw new Error('Invalid face draw state');
        for (const step of state.steps) {
            const key = faceDrawCursorIdentity(step);
            if (!Number.isSafeInteger(step.cursor) || step.cursor < 0 || !Number.isSafeInteger(step.next)
                || step.next < step.cursor || step.next - step.cursor > 16
                || !Number.isSafeInteger(step.epoch) || step.epoch < 1)
                throw new Error('Invalid face draw advance');
            const previous = cursors[key];
            if (previous && step.epoch < previous.epoch)
                continue;
            if (previous && step.epoch === previous.epoch && step.signature !== previous.signature)
                continue;
            cursors[key] = { signature: step.signature, epoch: step.epoch,
                cursor: previous?.signature === step.signature && previous.epoch === step.epoch ? Math.max(previous.cursor, step.next) : step.next };
        }
    }
    const after = JSON.stringify({ version: 1, cursors });
    return after === before ? [] : [{ key: FACE_DRAW_CURSOR_KEY, before, after }];
}
function normalizeFormatEligibleMisses(raw, validFormatIds = []) {
    const valid = new Set((validFormatIds || []).map(id => String(id || '').trim()).filter(Boolean));
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const normalized = {};
    for (const [rawId, rawValue] of Object.entries(source)) {
        const sourceId = String(rawId || '').trim();
        const id = sourceId === '6.2.1.2' ? '6.2.1.1.e' : sourceId;
        if (!id || (valid.size && !valid.has(id)))
            continue;
        const value = Number(rawValue);
        if (!Number.isFinite(value) || value < 0)
            continue;
        const misses = Math.min(FORMAT_ELIGIBLE_MISS_CAP, Math.floor(value));
        if (misses > 0)
            normalized[id] = Math.max(Number(normalized[id] || 0), misses);
    }
    return normalized;
}
function readFormatEligibleMissStore(validFormatIds = []) {
    try {
        return normalizeFormatEligibleMisses(JSON.parse(localStorage.getItem(FORMAT_ELIGIBLE_MISS_STORAGE_KEY) || '{}'), validFormatIds);
    }
    catch {
        return {};
    }
}
function writeFormatEligibleMissStore(value) {
    try {
        localStorage.setItem(FORMAT_ELIGIBLE_MISS_STORAGE_KEY, JSON.stringify(value || {}));
        return true;
    }
    catch (error) {
        console.warn('[RabbitMirror] Failed to store format fairness state:', error);
        return false;
    }
}
export function getFormatEligibleMisses(validFormatIds = []) {
    return readFormatEligibleMissStore(validFormatIds);
}
export function recordFormatEligibleMissRound({ eligibleIds = [], selectedIds = [], validFormatIds = [] } = {}) {
    const valid = new Set((validFormatIds || []).map(id => String(id || '').trim()).filter(Boolean));
    const eligible = [...new Set((eligibleIds || []).map(id => String(id || '').trim()).filter(id => id && (!valid.size || valid.has(id))))];
    if (!eligible.length)
        return false;
    const selected = new Set((selectedIds || []).map(id => String(id || '').trim()).filter(Boolean));
    const state = readFormatEligibleMissStore(validFormatIds);
    for (const id of eligible) {
        if (selected.has(id)) {
            delete state[id];
            continue;
        }
        const next = Math.min(FORMAT_ELIGIBLE_MISS_CAP, Number(state[id] || 0) + 1);
        state[id] = next;
    }
    return writeFormatEligibleMissStore(state);
}
export function resetFormatEligibleMisses(formatIds = []) {
    const targets = [...new Set((formatIds || []).map(id => String(id || '').trim()).filter(Boolean))];
    if (!targets.length)
        return false;
    const state = readFormatEligibleMissStore();
    let changed = false;
    for (const id of targets) {
        if (state[id] === undefined)
            continue;
        delete state[id];
        changed = true;
    }
    return changed ? writeFormatEligibleMissStore(state) : true;
}
const PENDING_SESSION_TOKEN = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const PENDING_MAX_AGE_MS = 12 * 60 * 60 * 1000;
function isStorageQuotaError(error) {
    if (!error)
        return false;
    const name = String(error.name || '');
    const code = Number(error.code);
    return name === 'QuotaExceededError'
        || name === 'NS_ERROR_DOM_QUOTA_REACHED'
        || code === 22
        || code === 1014;
}
function scopedBucketFullyExpired(bucket, ttlMs, now) {
    if (!Array.isArray(bucket))
        return true;
    if (!bucket.length)
        return true;
    return bucket.every(item => !item || now - Number(item.ts || 0) > ttlMs);
}
function reclaimOneExpiredForeignBucket(store, currentKey, ttlMs) {
    if (!store || typeof store !== 'object')
        return '';
    const now = Date.now();
    for (const key of Object.keys(store)) {
        if (key === currentKey)
            continue;
        if (!scopedBucketFullyExpired(store[key], ttlMs, now))
            continue;
        delete store[key];
        return key;
    }
    return '';
}
function dropOldestForeignBucket(store, currentKey) {
    if (!store || typeof store !== 'object')
        return false;
    let oldestKey = '';
    let oldestTs = Infinity;
    for (const key of Object.keys(store)) {
        if (key === currentKey)
            continue;
        const bucket = Array.isArray(store[key]) ? store[key] : [];
        let newest = 0;
        for (const item of bucket)
            newest = Math.max(newest, Number(item?.ts || 0));
        if (newest < oldestTs) {
            oldestTs = newest;
            oldestKey = key;
        }
    }
    if (!oldestKey)
        return false;
    delete store[oldestKey];
    return true;
}
function hashText(text) {
    let hash = 2166136261;
    for (const char of String(text || '')) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}
function firstNonEmpty(values) {
    for (const value of values) {
        if (value !== undefined && value !== null && String(value).trim())
            return String(value).trim();
    }
    return '';
}
function getContextSafe() {
    try {
        return globalThis.SillyTavern?.getContext?.() || {};
    }
    catch {
        return {};
    }
}
function resolveChat(chatOverride = null) {
    const context = getContextSafe();
    if (Array.isArray(context?.chat) && context.chat.length)
        return context.chat;
    if (Array.isArray(chatOverride) && chatOverride.some(item => typeof item?.is_user === 'boolean'))
        return chatOverride;
    if (Array.isArray(globalThis.chat))
        return globalThis.chat;
    return [];
}
export function getCurrentChatKey(chatOverride = null) {
    const context = getContextSafe();
    const chat = resolveChat(chatOverride);
    const metadata = context?.chatMetadata || globalThis.chat_metadata || {};
    const chatId = firstNonEmpty([
        context?.chatId,
        context?.chat_id,
        metadata?.chat_id,
        metadata?.file_name,
        metadata?.name,
    ]);
    const groupId = firstNonEmpty([context?.groupId, context?.group_id, globalThis.selected_group]);
    const characterId = firstNonEmpty([
        context?.characterId,
        context?.character_id,
        context?.character?.avatar,
        context?.characterName,
        globalThis.this_chid,
    ]);
    const firstMessage = chat[0] || {};
    const seed = firstNonEmpty([
        firstMessage?.send_date,
        firstMessage?.name,
        String(firstMessage?.mes || '').slice(0, 160),
        globalThis.location?.pathname,
    ]);
    return chatId
        ? `chat:${chatId}`
        : groupId
            ? `group:${groupId}:${hashText(seed)}`
            : characterId
                ? `character:${characterId}:${hashText(seed)}`
                : `fallback:${hashText(seed || 'unknown-chat')}`;
}
function readScopedStore(storageKey) {
    try {
        const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    }
    catch {
        return {};
    }
}
function writeScopedStore(storageKey, value, currentKey = '') {
    const store = value && typeof value === 'object' ? value : {};
    try {
        localStorage.setItem(storageKey, JSON.stringify(store));
        return true;
    }
    catch (error) {
        if (!isStorageQuotaError(error)) {
            console.warn('[RabbitMirror] Failed to store scoped generation state:', error);
            return false;
        }
        if (!dropOldestForeignBucket(store, currentKey)) {
            console.warn('[RabbitMirror] Scoped generation state over quota and nothing safe to drop:', error);
            return false;
        }
        try {
            localStorage.setItem(storageKey, JSON.stringify(store));
            return true;
        }
        catch (retryError) {
            console.warn('[RabbitMirror] Scoped generation state still over quota after reclaim:', retryError);
            return false;
        }
    }
}
function compactIdList(values, limit = 16) {
    return [...new Set((values || []).map(value => String(value || '').trim()).filter(Boolean))].slice(0, limit);
}
function incrementRecentHit(map, value) {
    const key = String(value || '').trim();
    if (!key)
        return;
    map.set(key, Number(map.get(key) || 0) + 1);
}
function recentHitObject(map) {
    return Object.fromEntries([...map.entries()].map(([key, count]) => [key, Math.max(1, Number(count) || 1)]));
}
export function getRecentGenerationAttemptIds(chatKey, limit = 10) {
    const key = String(chatKey || '').trim();
    if (!key)
        return { themeIds: [], formatIds: [], themeGroups: [], formatGroups: [], themeIdHits: {}, formatIdHits: {}, themeGroupHits: {}, formatGroupHits: {} };
    const store = readScopedStore(ATTEMPT_STORAGE_KEY);
    const now = Date.now();
    const items = Array.isArray(store[key])
        ? store[key].filter(item => item && now - Number(item.ts || 0) <= ATTEMPT_TTL_MS)
        : [];
    const recent = items.slice(-Math.max(1, Number(limit) || 10));
    const themeIds = new Set();
    const formatIds = new Set();
    const textIds = new Set();
    const textIdHits = new Map();
    const themeGroups = new Set();
    const formatGroups = new Set();
    const themeIdHits = new Map();
    const formatIdHits = new Map();
    const themeGroupHits = new Map();
    const formatGroupHits = new Map();
    for (const item of recent) {
        for (const id of new Set(item.themeIds || [])) {
            themeIds.add(id);
            incrementRecentHit(themeIdHits, id);
        }
        for (const id of new Set(item.formatIds || [])) {
            formatIds.add(id);
            incrementRecentHit(formatIdHits, id);
        }
        for (const id of new Set(item.textIds || [])) {
            textIds.add(id);
            incrementRecentHit(textIdHits, id);
        }
        for (const id of new Set(item.themeGroups || [])) {
            themeGroups.add(id);
            incrementRecentHit(themeGroupHits, id);
        }
        for (const id of new Set(item.formatGroups || [])) {
            formatGroups.add(id);
            incrementRecentHit(formatGroupHits, id);
        }
    }
    return {
        themeIds: [...themeIds],
        formatIds: [...formatIds],
        themeGroups: [...themeGroups],
        formatGroups: [...formatGroups],
        themeIdHits: recentHitObject(themeIdHits),
        formatIdHits: recentHitObject(formatIdHits),
        ...(textIds.size ? { textIds: [...textIds], textIdHits: recentHitObject(textIdHits) } : {}),
        themeGroupHits: recentHitObject(themeGroupHits),
        formatGroupHits: recentHitObject(formatGroupHits),
    };
}
export function recordGenerationAttempt(combo, { chatKey = '', attemptId = '', directiveScoped = false } = {}) {
    const key = String(chatKey || '').trim();
    const id = String(attemptId || '').trim();
    if (!key || !id || !combo)
        return false;
    const store = readScopedStore(ATTEMPT_STORAGE_KEY);
    const now = Date.now();
    const items = Array.isArray(store[key])
        ? store[key].filter(item => item && now - Number(item.ts || 0) <= ATTEMPT_TTL_MS)
        : [];
    if (items.some(item => item.attemptId === id))
        return false;
    items.push({
        attemptId: id,
        themeIds: compactIdList(combo.themeIds),
        formatIds: compactIdList(combo.formatIds),
        ...presentationModeFields(combo),
        themeGroups: compactIdList(combo.themeGroups),
        formatGroups: compactIdList(combo.formatGroups),
        directiveScoped: !!directiveScoped,
        ts: now,
    });
    store[key] = items.slice(-MAX_ATTEMPTS_PER_CHAT);
    reclaimOneExpiredForeignBucket(store, key, ATTEMPT_TTL_MS);
    return writeScopedStore(ATTEMPT_STORAGE_KEY, store, key);
}
export function getDirectiveScopedPick(chatKey, directiveScopeKey) {
    const chat = String(chatKey || '').trim();
    const scope = String(directiveScopeKey || '').trim();
    if (!chat || !scope)
        return null;
    const store = readScopedStore(DIRECTIVE_PICK_STORAGE_KEY);
    const now = Date.now();
    const items = Array.isArray(store[chat])
        ? store[chat].filter(item => item && now - Number(item.ts || 0) <= DIRECTIVE_PICK_TTL_MS)
        : [];
    const found = items.find(item => item.scopeKey === scope) || null;
    return found ? { ...found } : null;
}
export function setDirectiveScopedPick(chatKey, directiveScopeKey, combo) {
    const chat = String(chatKey || '').trim();
    const scope = String(directiveScopeKey || '').trim();
    if (!chat || !scope || !combo)
        return false;
    const store = readScopedStore(DIRECTIVE_PICK_STORAGE_KEY);
    const now = Date.now();
    const items = Array.isArray(store[chat])
        ? store[chat].filter(item => item && now - Number(item.ts || 0) <= DIRECTIVE_PICK_TTL_MS && item.scopeKey !== scope)
        : [];
    items.push({
        scopeKey: scope,
        themeIds: compactIdList(combo.themeIds),
        formatIds: compactIdList(combo.formatIds),
        ...presentationModeFields(combo),
        uiReviewFocus: Array.isArray(combo.uiReviewFocus) ? combo.uiReviewFocus.slice(0, 8) : [],
        ts: now,
    });
    store[chat] = items.slice(-MAX_DIRECTIVE_PICKS_PER_CHAT);
    reclaimOneExpiredForeignBucket(store, chat, DIRECTIVE_PICK_TTL_MS);
    return writeScopedStore(DIRECTIVE_PICK_STORAGE_KEY, store, chat);
}
function readHistory() {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (Array.isArray(raw))
            return raw;
        if (raw && typeof raw === 'object')
            return [raw];
        return [];
    }
    catch {
        return [];
    }
}
function signatureOf(combo) {
    return JSON.stringify({
        themeIds: combo?.themeIds || [],
        formatIds: combo?.formatIds || [],
        samplingMode: combo?.samplingMode || 'classic',
        forcedVisualScenery: !!combo?.forcedVisualScenery,
        ...presentationModeFields(combo),
    });
}
let chatRecentFacesProvider = null;
export function setChatRecentFacesProvider(provider) {
    chatRecentFacesProvider = typeof provider === 'function' ? provider : null;
}
const mainColorsOf = record => (Array.isArray(record?.paletteFingerprint?.mainColors) ? record.paletteFingerprint.mainColors : [])
    .map(value => String(value).toUpperCase()).join('/');
function sameRecord(local, chat) {
    if (chat.historyId && local?.historyId === chat.historyId)
        return true;
    const colors = mainColorsOf(chat);
    if (colors && colors === mainColorsOf(local)
        && (!(chat.formatIds || []).length || JSON.stringify(local?.formatIds || []) === JSON.stringify(chat.formatIds || [])))
        return true;
    if (Math.abs(Number(local?.ts || 0) - Number(chat.ts || 0)) >= 120000)
        return false;
    if (!(chat.formatIds || []).length && !(chat.themeIds || []).length)
        return true;
    return JSON.stringify(local?.formatIds || []) === JSON.stringify(chat.formatIds || [])
        && JSON.stringify(local?.themeIds || []) === JSON.stringify(chat.themeIds || []);
}
function readEffectiveHistory() {
    const local = readHistory();
    if (!chatRecentFacesProvider)
        return local;
    let fromChat = [];
    try {
        fromChat = chatRecentFacesProvider();
    }
    catch {
        fromChat = [];
    }
    if (!Array.isArray(fromChat) || !fromChat.length)
        return local;
    const newestLocal = local.reduce((max, record) => Math.max(max, Number(record?.ts) || 0), 0);
    const extra = fromChat.filter(item => item && Number(item.ts) > newestLocal && !local.some(record => sameRecord(record, item)));
    if (!extra.length)
        return local;
    return [...local, ...extra].map((item, order) => ({ item, order }))
        .sort((a, b) => (Number(a.item?.ts || 0) - Number(b.item?.ts || 0)) || (a.order - b.order))
        .map(entry => entry.item);
}
export function getComboHistory(limit = 10) {
    const history = readEffectiveHistory();
    return history.slice(-Math.max(0, Number(limit) || 10));
}
export function getRecentDiversityHistory(rounds = 5) {
    return recentDiversityRecords(readEffectiveHistory(), rounds);
}
export function getLastCombo() {
    const history = readHistory();
    return history[history.length - 1] || {};
}
export function getRecentIds(limit = 10) {
    const history = getComboHistory(limit);
    const themeIds = new Set();
    const formatIds = new Set();
    const textIds = new Set();
    const textIdHits = new Map();
    const themeGroups = new Set();
    const formatGroups = new Set();
    const themeIdHits = new Map();
    const formatIdHits = new Map();
    const themeGroupHits = new Map();
    const formatGroupHits = new Map();
    const uiReviewFocus = [];
    for (const combo of history) {
        for (const id of new Set(combo?.themeIds || [])) {
            themeIds.add(id);
            incrementRecentHit(themeIdHits, id);
        }
        for (const id of new Set(combo?.formatIds || [])) {
            formatIds.add(id);
            incrementRecentHit(formatIdHits, id);
        }
        for (const id of new Set(combo?.textIds || [])) {
            textIds.add(id);
            incrementRecentHit(textIdHits, id);
        }
        for (const id of new Set(combo?.themeGroups || [])) {
            themeGroups.add(id);
            incrementRecentHit(themeGroupHits, id);
        }
        for (const id of new Set(combo?.formatGroups || [])) {
            formatGroups.add(id);
            incrementRecentHit(formatGroupHits, id);
        }
        if (Array.isArray(combo?.uiReviewFocus) && combo.uiReviewFocus.length) {
            uiReviewFocus.push(combo.uiReviewFocus.join(__rmT("7os")));
        }
    }
    return {
        themeIds: [...themeIds],
        formatIds: [...formatIds],
        themeGroups: [...themeGroups],
        formatGroups: [...formatGroups],
        themeIdHits: recentHitObject(themeIdHits),
        formatIdHits: recentHitObject(formatIdHits),
        ...(textIds.size ? { textIds: [...textIds], textIdHits: recentHitObject(textIdHits) } : {}),
        themeGroupHits: recentHitObject(themeGroupHits),
        formatGroupHits: recentHitObject(formatGroupHits),
        uiReviewFocus: uiReviewFocus.slice(-limit),
    };
}
function historicalRiskFlags(item) {
    const flags = Array.isArray(item?.riskFlags) ? item.riskFlags : [];
    const objectStateChange = observedOperationFamiliesFor(item).includes('object_state_change');
    return objectStateChange
        ? flags.filter(flag => flag !== 'missing_interaction' && flag !== 'fake_interaction')
        : flags;
}
export function getRecentRiskFlags(limit = 3) {
    const history = getComboHistory(limit);
    const flags = [];
    for (const item of history) {
        flags.push(...historicalRiskFlags(item));
    }
    return [...new Set(flags)];
}
export function getRecentRiskFlagCounts(limit = 3) {
    const history = getComboHistory(limit);
    const counts = {};
    for (const item of history) {
        for (const flag of historicalRiskFlags(item)) {
            counts[flag] = (counts[flag] || 0) + 1;
        }
    }
    return counts;
}
export function getRecentPaletteFingerprints(limit = 3) {
    return getRecentDiversityHistory(limit)
        .map(item => item?.paletteFingerprint)
        .filter(item => item && typeof item === 'object' && Number(item.confidence || 0) >= 0.35);
}
function isDarkPaletteTrigger(fingerprint) {
    if (!fingerprint || typeof fingerprint !== 'object')
        return false;
    const confidence = Number(fingerprint.confidence || 0);
    const darkAreaRatio = Number(fingerprint.darkAreaRatio || 0);
    const averageLuminance = Number(fingerprint.averageLuminance ?? 255);
    return confidence >= 0.5
        && fingerprint.brightness === 'dark'
        && (darkAreaRatio >= 0.55 || averageLuminance <= 105);
}
const PALETTE_BRIGHTNESS_LABELS = { dark: __rmT("El5s..EU"), mid: __rmT("Asqs..EU"), light: __rmT("QOWs..EU") };
const PALETTE_TEMPERATURE_LABELS = { warm: __rmT("v1B"), cool: __rmT("MYp"), neutral: __rmT("Bub0LT") };
const PALETTE_SATURATION_LABELS = { low: __rmT("Elv4Zbpw"), medium: __rmT("Asa4Zbpw"), high: __rmT("QOd4Zbpw") };
const PALETTE_HUE_LABELS = {
    red: __rmT("mr8"), orange: __rmT("IqG"), yellow: __rmT("dG8"), green: __rmT("GL8"),
    cyan: __rmT("4D_"), blue: __rmT("hFf"), purple: __rmT("3LA"), pink: __rmT("caT"), neutral: __rmT("AsqeEkmF"),
};
export function paletteFamilyKey(fingerprint) {
    if (!fingerprint || typeof fingerprint !== 'object')
        return '';
    if (Number(fingerprint.confidence || 0) < 0.35)
        return '';
    const brightness = String(fingerprint.brightness || '').trim();
    if (!brightness)
        return '';
    const hueFamily = String(fingerprint.hueFamily || 'neutral').trim() || 'neutral';
    const temperature = String(fingerprint.temperature || 'neutral').trim() || 'neutral';
    const saturation = String(fingerprint.saturation || 'low').trim() || 'low';
    return `${brightness}|${hueFamily}|${temperature}|${saturation}`;
}
export function describePaletteFamily(fingerprint) {
    if (!fingerprint || typeof fingerprint !== 'object')
        return '';
    const brightness = PALETTE_BRIGHTNESS_LABELS[String(fingerprint.brightness || '')] || '';
    const temperature = PALETTE_TEMPERATURE_LABELS[String(fingerprint.temperature || '')] || '';
    const saturation = PALETTE_SATURATION_LABELS[String(fingerprint.saturation || '')] || '';
    const hue = PALETTE_HUE_LABELS[String(fingerprint.hueFamily || 'neutral')] || '';
    return [brightness, temperature, hue, saturation].filter(Boolean).join('');
}
export function getRecentPaletteCooldown(window = 3) {
    const span = Math.max(1, Number(window) || 3);
    const rounds = new Map();
    return getRecentDiversityHistory(span).slice().reverse().map((item, index) => {
        const round = item?.diversityRound || item?.batchId || `legacy:${index}`;
        if (!rounds.has(round))
            rounds.set(round, rounds.size);
        const roundsAgo = rounds.get(round), fingerprint = item?.paletteFingerprint;
        if (item?.presentationMode === 'text' || item?.pureOrder)
            return null;
        if (!fingerprint || Number(fingerprint.confidence || 0) < 0.35)
            return null;
        return { fingerprint, key: paletteFamilyKey(fingerprint), label: describePaletteFamily(fingerprint),
            roundsAgo, strength: Math.max(1, span - roundsAgo) };
    }).filter(item => item?.label);
}
const VISUAL_FAMILY_DIMENSION_LABELS = Object.freeze({
    layout_family: __rmT("_PFuFej1x8B"),
    operation_family: __rmT("EMjmvBl9ZKUF6dQG"),
    operation_families: __rmT("LM4SIDl9ZKUF6dQG"),
    surface_family: __rmT("VPkwkuB8rrWrIlMM"),
    contrast_family: __rmT("7McQFSjDbJB"),
    contour_family: __rmT("tNMR55hLeDf"),
    reading_family: __rmT("nVAUz6CYk8Y"),
    unit_family: __rmT("9DZx8ktJvHY"),
    space_family: __rmT("l6p9VBjWk6A"),
});
export function parseVisualFamilySkeleton(value = '') {
    const text = String(value || '').trim();
    if (!text)
        return {};
    const parsed = {};
    for (const part of text.split(__rmT("7os"))) {
        const match = part.match(/^\s*([a-z_]+)\s*:\s*(.+?)\s*$/i);
        if (!match)
            continue;
        const key = String(match[1] || '').trim();
        if (!Object.prototype.hasOwnProperty.call(VISUAL_FAMILY_DIMENSION_LABELS, key))
            continue;
        const valueText = String(match[2] || '').trim();
        if (key === 'operation_families') {
            const operations = observedOperationFamiliesFor({ visualSkeleton: `operation_families: ${valueText}` });
            if (operations.length)
                parsed[key] = operations.join(',');
            continue;
        }
        if (['layout_family', 'operation_family'].includes(key) && !Object.hasOwn(COMPOSITION_LABELS, valueText))
            continue;
        if (valueText)
            parsed[key] = valueText.slice(0, 120);
    }
    return parsed;
}
export function visualFamilyForCooldown(family = {}) {
    return Object.fromEntries(Object.entries(VISUAL_FAMILY_DIMENSION_LABELS)
        .filter(([key]) => !['space_family', 'contrast_family', 'operation_families'].includes(key) && family?.[key]
        && !(key === 'operation_family' && family[key] === 'object_state_change')
        && !(family.layout_family && ['reading_family', 'unit_family'].includes(key))
        && !(key === 'contour_family' && family[key] === 'contour: cutout_or_irregular_shape')
        && !(key === 'surface_family' && /^(?:surface:\s*)?(?:digital_dark_surface|gradient_or_light_surface|mixed_or_unspecified_surface)$/.test(family[key])))
        .map(([key]) => [key, family[key]]));
}
export function describeVisualFamilyDimensions(family = {}) {
    if (!family || typeof family !== 'object')
        return '';
    return Object.entries(VISUAL_FAMILY_DIMENSION_LABELS)
        .map(([key, label]) => family[key] ? `${label}=${key === 'operation_families'
        ? observedOperationFamiliesFor({ visualSkeleton: `operation_families: ${family[key]}` }).map(value => COMPOSITION_LABELS[value]).join(__rmT("jvk"))
        : COMPOSITION_LABELS[family[key]] || family[key]}` : '')
        .filter(Boolean)
        .join(__rmT("7os"));
}
export function getRecentVisualFamilyCooldown(window = 3) {
    const span = Math.max(1, Number(window) || 3);
    return getComboHistory(span)
        .slice()
        .reverse()
        .map((item, roundsAgo) => ({
        family: parseVisualFamilySkeleton(item?.visualSkeleton || ''),
        roundsAgo,
        strength: Math.max(1, span - roundsAgo),
    }))
        .filter(item => Object.keys(item.family).length);
}
export function getRecentStructuralCooldown(window = 5) {
    const found = new Map();
    for (const item of getRecentDiversityHistory(window)) {
        const family = visualFamilyForCooldown(parseVisualFamilySkeleton(item?.visualSkeleton || ''));
        const dimensions = [['layout_family', family.layout_family], ...observedOperationFamiliesFor(item)
                .filter(value => value !== 'object_state_change').map(value => ['operation_family', value])];
        for (const [key, value] of dimensions) {
            if (!value || !Object.hasOwn(COMPOSITION_LABELS, value))
                continue;
            const identity = `${key}:${value}`;
            const record = found.get(identity) || { key, value, label: COMPOSITION_LABELS[value], count: 0 };
            record.count++;
            found.set(identity, record);
        }
    }
    return [...found.values()];
}
export function getRepeatedVisualFamilyDimensions(window = 3, threshold = 2) {
    const span = Math.max(2, Number(window) || 3);
    const hits = Math.max(2, Number(threshold) || 2);
    const chronological = getComboHistory(span)
        .map(item => visualFamilyForCooldown(parseVisualFamilySkeleton(item?.visualSkeleton || '')))
        .filter(family => Object.keys(family).length);
    if (chronological.length < hits)
        return [];
    const latest = chronological[chronological.length - 1];
    const result = [];
    for (const [key, label] of Object.entries(VISUAL_FAMILY_DIMENSION_LABELS)) {
        const latestValue = latest[key];
        if (!latestValue)
            continue;
        let streak = 0;
        for (let index = chronological.length - 1; index >= 0; index -= 1) {
            if (chronological[index]?.[key] !== latestValue)
                break;
            streak += 1;
        }
        if (streak < hits)
            continue;
        result.push({ key, label, value: latestValue, streak, strength: Math.min(span, streak) });
    }
    return result;
}
export function getRepeatedPaletteFamily(window = 3, threshold = 2) {
    const span = Math.max(2, Number(window) || 3);
    const hits = Math.max(2, Number(threshold) || 2);
    const recent = getComboHistory(span)
        .map(item => item?.paletteFingerprint)
        .filter(item => item && typeof item === 'object');
    const keyed = recent.map(item => ({ item, key: paletteFamilyKey(item) })).filter(entry => entry.key);
    if (keyed.length < hits)
        return null;
    const latest = keyed[keyed.length - 1];
    const count = keyed.filter(entry => entry.key === latest.key).length;
    if (count < hits)
        return null;
    return {
        key: latest.key,
        count,
        window: keyed.length,
        label: describePaletteFamily(latest.item) || latest.key,
        fingerprint: latest.item,
    };
}
export function getActivePaletteCooldown(rounds = 5) {
    const cooldownRounds = Math.max(1, Number(rounds) || 5);
    const history = getRecentDiversityHistory(cooldownRounds);
    const completedRounds = new Map();
    for (let index = history.length - 1; index >= 0; index -= 1) {
        const record = history[index];
        const key = record?.diversityRound || record?.batchId || `legacy:${index}`;
        if (!completedRounds.has(key))
            completedRounds.set(key, null);
        if (!completedRounds.get(key) && record?.presentationMode !== 'text' && isDarkPaletteTrigger(record?.paletteFingerprint)) {
            completedRounds.set(key, record.paletteFingerprint);
        }
    }
    for (const [completedSinceTrigger, fingerprint] of [...completedRounds.values()].entries()) {
        if (!fingerprint)
            continue;
        return {
            active: true,
            remaining: cooldownRounds - completedSinceTrigger,
            completedSinceTrigger,
            fingerprint,
        };
    }
    return { active: false, remaining: 0 };
}
function normalizeInteractionFamily(value) {
    if (!value || typeof value !== 'object')
        return undefined;
    const id = String(value.id || '').trim();
    if (!id)
        return undefined;
    const observed = Array.isArray(value.observedRecipeIds)
        ? interactionRecipeFields({ interactionRecipeIds: value.observedRecipeIds }).interactionRecipeIds || [] : null;
    if (id === 'none' && !observed)
        return undefined;
    return {
        ...(observed ? { observedRecipeIds: observed } : {}),
        id: id.slice(0, 80),
        label: String(value.label || id).slice(0, 120),
        confidence: Math.max(0, Math.min(1, Number(value.confidence) || 0)),
        controlCount: Math.max(0, Math.min(99, Number(value.controlCount) || 0)),
        panelCount: Math.max(0, Math.min(99, Number(value.panelCount) || 0)),
    };
}
export function getRecentInteractionFamilies(limit = 5, { preserveEmpty = false } = {}) {
    const recent = getRecentDiversityHistory(limit).map((item, index) => {
        const observed = normalizeInteractionFamily(item?.interactionFamily);
        const operations = observedOperationFamiliesFor(item);
        const objectOnly = operations.includes('object_state_change')
            && !operations.some(value => value === 'text_panel_switch' || value === 'text_disclosure_stack');
        const value = objectOnly || observed?.id === 'none'
            ? null : observed || null;
        const diversityRound = item?.diversityRound || item?.batchId || `legacy:${index}`;
        return value ? { ...value, diversityRound } : preserveEmpty ? { diversityRound } : null;
    });
    return recent.filter(Boolean);
}
export function getRecentInteractionFamilyCounts(limit = 5) {
    const counts = {};
    for (const family of getRecentInteractionFamilies(limit)) {
        counts[family.id] = (counts[family.id] || 0) + 1;
    }
    return counts;
}
const PENDING_BATCH_KEY = 'rabbit_mirror_theater:pending_batch:v1';
const LEGACY_BATCH_REGISTRY_KEY = 'rabbit_mirror_theater:pending_batch_registry:v2';
const ACTIVE_BATCH_REGISTRY_KEY = 'rabbit_mirror_theater:pending_batch_registry:v3';
const ACTIVE_BATCH_REGISTRY_MAX = 8;
const ACTIVE_BATCH_REGISTRY_MAX_CHARS = 1024 * 1024;
const transientBatchRegistry = new Map();
let pendingBatchSequence = 0;
function normalizeBatchIdentity(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return null;
    const operation = value.kind === 'generation-operation';
    const stringLimits = operation
        ? { chatKey: 1024, generationScopeKey: 1024, operationId: 1024, generationType: 64, settingsKey: 8192 }
        : { chatKey: 1024, generationScopeKey: 1024, sourceHash: 512, settingsKey: 8192 };
    for (const [key, limit] of Object.entries(stringLimits)) {
        if (typeof value[key] !== 'string' || !value[key].trim() || value[key].length > limit)
            return null;
    }
    if (operation && typeof value.preview !== 'boolean')
        return null;
    if (operation)
        return {
            kind: 'generation-operation', chatKey: value.chatKey, generationScopeKey: value.generationScopeKey,
            operationId: value.operationId, generationType: value.generationType, settingsKey: value.settingsKey,
            preview: value.preview === true,
        };
    if (value.kind != null && value.kind !== 'final-body')
        return null;
    if (!Number.isSafeInteger(value.mesid) || value.mesid < 0 || !Number.isSafeInteger(value.swipeId) || value.swipeId < 0)
        return null;
    return {
        chatKey: value.chatKey,
        generationScopeKey: value.generationScopeKey,
        mesid: value.mesid,
        swipeId: value.swipeId,
        sourceHash: value.sourceHash,
        settingsKey: value.settingsKey,
    };
}
function batchMatchesExpected(batch, expected, requireCommitIdentity = false) {
    const identity = batch?.identity == null ? null : normalizeBatchIdentity(batch.identity);
    if (batch?.identity != null && !identity)
        return false;
    if (expected == null)
        return !requireCommitIdentity || !identity;
    if (!expected || typeof expected !== 'object' || Array.isArray(expected))
        return false;
    const hasBatchId = typeof expected.batchId === 'string' && !!expected.batchId;
    if (Object.prototype.hasOwnProperty.call(expected, 'batchId') && !hasBatchId)
        return false;
    if (hasBatchId && expected.batchId !== batch.batchId)
        return false;
    const wantedIdentity = expected.identity == null ? null : normalizeBatchIdentity(expected.identity);
    if (expected.identity != null && !wantedIdentity)
        return false;
    if (identity) {
        if (!wantedIdentity || Object.keys(identity).some(key => identity[key] !== wantedIdentity[key]))
            return false;
        if (requireCommitIdentity && !hasBatchId)
            return false;
    }
    else if (wantedIdentity)
        return false;
    return hasBatchId || !!wantedIdentity;
}
function validBatchCombo(combo) {
    if (!combo || typeof combo !== 'object' || Array.isArray(combo))
        return false;
    if (combo.presentationMode !== undefined && !['html', 'text'].includes(combo.presentationMode))
        return false;
    if (combo.requestedPresentationMode !== undefined && !['auto', 'html', 'text', 'longtext'].includes(combo.requestedPresentationMode))
        return false;
    if (combo.blankLongText !== undefined && !isBlankLongTextSelection(combo))
        return false;
    if (combo.textIds?.length && combo.presentationMode !== 'text'
        && !(combo.faceDrawConfigured === true && combo.presentationMode === 'html'))
        return false;
    for (const key of ['themeIds', 'formatIds', ...(combo.textIds !== undefined ? ['textIds'] : [])]) {
        if (!Array.isArray(combo[key]) || combo[key].length > 16)
            return false;
        for (let index = 0; index < combo[key].length; index += 1) {
            if (!Object.prototype.hasOwnProperty.call(combo[key], index))
                return false;
            const id = combo[key][index];
            if (typeof id !== 'string' || !id.trim())
                return false;
            if (key === 'textIds' && !id.startsWith('ext:'))
                return false;
            if (id.trimStart().startsWith('ext:')) {
                if (id !== id.trim() || id.length > 2048 || !/^ext:[A-Za-z0-9:._!~*'()-]+$/.test(id))
                    return false;
            }
            else if (id.length > 128)
                return false;
        }
        if (new Set(combo[key]).size !== combo[key].length)
            return false;
    }
    return combo.themeIds.length + combo.formatIds.length + (combo.textIds?.length || 0) > 0 || combo.customDirective === true || isBlankLongTextSelection(combo);
}
function removeBatchRawIfUnchanged(raw) {
    try {
        if (localStorage.getItem(PENDING_BATCH_KEY) !== raw)
            return false;
        localStorage.removeItem(PENDING_BATCH_KEY);
        return localStorage.getItem(PENDING_BATCH_KEY) === null;
    }
    catch {
        return false;
    }
}
function restoreOwnedStorageWrite(key, payload, previousRaw, batchId = '') {
    try {
        const current = localStorage.getItem(key);
        if (current === previousRaw)
            return true;
        if (typeof current !== 'string')
            return false;
        const ownPrefix = payload.startsWith(current) && current.length > 1
            && (!batchId || current.includes(JSON.stringify(batchId)));
        if (current !== payload && !ownPrefix)
            return false;
        if (localStorage.getItem(key) !== current)
            return false;
        if (previousRaw === null)
            localStorage.removeItem(key);
        else
            localStorage.setItem(key, previousRaw);
        return localStorage.getItem(key) === previousRaw;
    }
    catch {
        return false;
    }
}
function cloneSerializable(value) {
    try {
        return JSON.parse(JSON.stringify(value));
    }
    catch {
        return null;
    }
}
function validStringList(values, maxItems = 512) {
    if (!Array.isArray(values) || values.length > maxItems)
        return false;
    for (let index = 0; index < values.length; index += 1) {
        const value = values[index];
        if (!Object.prototype.hasOwnProperty.call(values, index) || typeof value !== 'string' || !value.trim())
            return false;
        if (value.trimStart().startsWith('ext:')) {
            if (value !== value.trim() || value.length > 2048 || !/^ext:[A-Za-z0-9:._!~*'()-]+$/.test(value))
                return false;
        }
        else if (value.length > 128)
            return false;
    }
    return true;
}
function normalizeLocalBatchPlan(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return null;
    const identity = normalizeBatchIdentity(value.identity);
    if (!identity || typeof value.batchId !== 'string' || !value.batchId.trim() || value.batchId.length > 256 ||
        !Number.isSafeInteger(value.requestedFaceCount) || value.requestedFaceCount < 2 || value.requestedFaceCount > 5 ||
        !Array.isArray(value.faces) || value.faces.length !== value.requestedFaceCount)
        return null;
    const seen = new Set();
    for (let index = 0; index < value.faces.length; index += 1)
        if (!Object.prototype.hasOwnProperty.call(value.faces, index))
            return null;
    const faces = value.faces.map((face, expectedIndex) => {
        if (!face || typeof face !== 'object' || Array.isArray(face) || face.faceIndex !== expectedIndex || seen.has(face.faceIndex) ||
            !validBatchCombo(face.combo))
            return null;
        seen.add(face.faceIndex);
        return { faceIndex: face.faceIndex, combo: cloneSerializable(face.combo) };
    });
    if (faces.some(face => !face))
        return null;
    const fairness = value.fairness && typeof value.fairness === 'object' && !Array.isArray(value.fairness) ? value.fairness : {};
    for (const key of ['eligibleFormatIds', 'selectedFormatIds', 'validFormatIds'])
        if (fairness[key] !== undefined && !validStringList(fairness[key]))
            return null;
    if (fairness.directiveScoped !== undefined && typeof fairness.directiveScoped !== 'boolean')
        return null;
    const eligibleFormatIds = [...new Set(fairness.eligibleFormatIds || [])];
    const selectedFormatIds = [...new Set(fairness.selectedFormatIds || [])];
    const validFormatIds = [...new Set(fairness.validFormatIds || [])];
    if (!validStringList(eligibleFormatIds) || !validStringList(selectedFormatIds) || !validStringList(validFormatIds))
        return null;
    return {
        kind: 'rabbit-mirror-multiface-plan', schemaVersion: 1, batchId: value.batchId,
        identity, requestedFaceCount: value.requestedFaceCount, faces,
        fairness: { eligibleFormatIds, selectedFormatIds, validFormatIds, directiveScoped: fairness.directiveScoped === true },
    };
}
function validFairnessId(value) {
    if (typeof value !== 'string' || !value.trim())
        return false;
    if (value.trimStart().startsWith('ext:'))
        return value === value.trim() && value.length <= 2048 && /^ext:[A-Za-z0-9:._!~*'()-]+$/.test(value);
    return value.length <= 128;
}
function sanitizeBatchFairness(fairness) {
    const source = fairness && typeof fairness === 'object' && !Array.isArray(fairness) ? fairness : {};
    const list = values => [...new Set((Array.isArray(values) ? values : []).filter(validFairnessId))].slice(0, 512);
    return {
        eligibleFormatIds: list(source.eligibleFormatIds),
        selectedFormatIds: list(source.selectedFormatIds),
        validFormatIds: list(source.validFormatIds),
        directiveScoped: source.directiveScoped === true,
    };
}
function explainBatchPlanRejection(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return 'BATCH_PLAN_INVALID';
    if (!normalizeBatchIdentity(value.identity))
        return 'BATCH_PLAN_IDENTITY_INVALID';
    if (typeof value.batchId !== 'string' || !value.batchId.trim() || value.batchId.length > 256)
        return 'BATCH_PLAN_ID_INVALID';
    if (!Number.isSafeInteger(value.requestedFaceCount) || value.requestedFaceCount < 2 || value.requestedFaceCount > 5
        || !Array.isArray(value.faces) || value.faces.length !== value.requestedFaceCount)
        return 'BATCH_PLAN_FACE_COUNT_INVALID';
    for (let index = 0; index < value.faces.length; index += 1) {
        const face = value.faces[index];
        if (!face || typeof face !== 'object' || face.faceIndex !== index || !validBatchCombo(face.combo))
            return 'BATCH_PLAN_FACE_INVALID';
    }
    const fairness = value.fairness && typeof value.fairness === 'object' && !Array.isArray(value.fairness) ? value.fairness : {};
    for (const key of ['eligibleFormatIds', 'selectedFormatIds', 'validFormatIds']) {
        if (fairness[key] !== undefined && !validStringList(fairness[key]))
            return 'BATCH_PLAN_FAIRNESS_INVALID';
    }
    if (fairness.directiveScoped !== undefined && typeof fairness.directiveScoped !== 'boolean')
        return 'BATCH_PLAN_FAIRNESS_INVALID';
    return 'BATCH_PLAN_INVALID';
}
function reportBatchRejection(options, code) {
    try {
        if (typeof options?.onRejected === 'function')
            options.onRejected(code);
    }
    catch { }
}
export function createPendingComboBatchPlan(combos = [], identity = null, fairness = {}, options = {}) {
    const reject = code => { reportBatchRejection(options, code); return null; };
    if (!Array.isArray(combos) || combos.length < 2 || combos.length > 5)
        return reject('BATCH_PLAN_INPUT_INVALID');
    const normalizedIdentity = normalizeBatchIdentity(identity);
    if (!normalizedIdentity)
        return reject('BATCH_PLAN_IDENTITY_INVALID');
    if (combos.some(combo => !validBatchCombo(combo))) {
        const duplicate = combos.some(combo => ['themeIds', 'formatIds', 'textIds'].some(key => Array.isArray(combo?.[key]) && new Set(combo[key]).size !== combo[key].length));
        return reject(duplicate ? 'BATCH_PLAN_DUPLICATE_ID' : 'BATCH_PLAN_COMBO_INVALID');
    }
    const candidate = normalizeLocalBatchPlan({
        batchId: `${PENDING_SESSION_TOKEN}:${Date.now().toString(36)}:${(++pendingBatchSequence).toString(36)}`,
        identity: normalizedIdentity,
        requestedFaceCount: combos.length,
        faces: combos.map((combo, faceIndex) => ({ faceIndex, combo })),
        fairness: sanitizeBatchFairness(fairness),
    });
    if (!candidate)
        return reject(explainBatchPlanRejection({
            batchId: `${PENDING_SESSION_TOKEN}:check`, identity: normalizedIdentity, requestedFaceCount: combos.length,
            faces: combos.map((combo, faceIndex) => ({ faceIndex, combo })), fairness: sanitizeBatchFairness(fairness),
        }));
    const payload = JSON.stringify(candidate);
    return payload.length <= 262144 ? cloneSerializable(candidate) : reject('BATCH_PLAN_TOO_LARGE');
}
function normalizeActiveBatchRecord(value, storageKey = ACTIVE_BATCH_REGISTRY_KEY) {
    let source = value?.plan;
    if (storageKey === ACTIVE_BATCH_REGISTRY_KEY) {
        const text = unpackBatchPlanText(value?.planPayload);
        if (text === null)
            return null;
        try {
            source = JSON.parse(text);
        }
        catch {
            return null;
        }
    }
    const plan = normalizeLocalBatchPlan(source);
    if (!plan || typeof value.registrySession !== 'string' || !value.registrySession ||
        !Number.isFinite(value.createdAt) || value.createdAt <= 0)
        return null;
    return { plan, registrySession: value.registrySession, createdAt: value.createdAt, storageKey, stored: value };
}
function readActiveBatchRegistry() {
    try {
        const rawByKey = {};
        const records = [];
        for (const key of [ACTIVE_BATCH_REGISTRY_KEY, LEGACY_BATCH_REGISTRY_KEY]) {
            const raw = localStorage.getItem(key);
            rawByKey[key] = raw;
            if (raw === null)
                continue;
            if (raw.length > ACTIVE_BATCH_REGISTRY_MAX_CHARS)
                return null;
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length > ACTIVE_BATCH_REGISTRY_MAX)
                return null;
            for (const value of parsed) {
                const record = normalizeActiveBatchRecord(value, key);
                if (record) {
                    records.push(record);
                    continue;
                }
                const createdAt = Number(value?.createdAt);
                if (!(Number.isFinite(createdAt) && createdAt > 0 && Date.now() - createdAt > FOREIGN_BATCH_RESERVATION_MS))
                    return null;
            }
        }
        return { raw: rawByKey[ACTIVE_BATCH_REGISTRY_KEY], rawByKey, records };
    }
    catch {
        return null;
    }
}
function registryWithoutRecord(registry, record) {
    return JSON.stringify(registry.records
        .filter(item => item.storageKey === record.storageKey && item !== record)
        .map(item => item.stored));
}
function activeBatchRecordIsFresh(record, now = Date.now()) {
    return !!record && record.createdAt <= now + 1000 && now - record.createdAt <= PENDING_MAX_AGE_MS;
}
function planMatchesExpected(plan, expected) {
    return !!plan && !!expected && expected.batchId === plan.batchId &&
        batchMatchesExpected({ batchId: plan.batchId, identity: plan.identity }, expected, true);
}
export function findPendingComboBatchPlan(identity) {
    const normalized = normalizeBatchIdentity(identity);
    if (!normalized)
        return null;
    const transient = [...transientBatchRegistry.values()].find(plan => batchMatchesExpected(plan, { identity: normalized }, false));
    if (transient)
        return cloneSerializable(transient);
    const registry = readActiveBatchRegistry();
    if (!registry)
        return null;
    const record = registry.records.find(item => activeBatchRecordIsFresh(item) && batchMatchesExpected({ batchId: item.plan.batchId, identity: item.plan.identity }, { identity: normalized }, false));
    return record ? cloneSerializable(record.plan) : null;
}
function expiredTransactionTime(at, now) {
    return Number.isFinite(at) && at > 0 && now - at > PENDING_MAX_AGE_MS;
}
const FOREIGN_BATCH_RESERVATION_MS = 30 * 60 * 1000;
function reclaimableBatchReservation(record, now) {
    if (expiredTransactionTime(record?.createdAt, now))
        return true;
    return record?.registrySession !== PENDING_SESSION_TOKEN
        && Number.isFinite(record?.createdAt) && now - record.createdAt > FOREIGN_BATCH_RESERVATION_MS;
}
function compactExpiredTransactionRaw(key, raw, now) {
    if (raw === null || raw.length > ACTIVE_BATCH_REGISTRY_MAX_CHARS)
        return raw;
    try {
        const data = JSON.parse(raw);
        let next = data;
        if (key === PENDING_KEY) {
            if (validBatchCombo(data) && typeof data.pendingSession === 'string' && data.pendingSession
                && data.signature === signatureOf(data) && expiredTransactionTime(data.pendingTs, now))
                return null;
        }
        else if (key === PENDING_BATCH_KEY) {
            if (data && typeof data.batchId === 'string' && data.batchId && typeof data.pendingSession === 'string' && data.pendingSession
                && expiredTransactionTime(data.pendingTs, now) && (data.identity == null || normalizeBatchIdentity(data.identity))
                && Array.isArray(data.faces) && data.faces.length >= 2 && data.faces.length <= 5
                && data.faces.every((face, index) => validBatchCombo(face) && face.batchId === data.batchId
                    && face.faceIndex === index && face.signature === signatureOf(face)
                    && (face.committed === undefined || typeof face.committed === 'boolean')))
                return null;
        }
        else if (key === ACTIVE_BATCH_REGISTRY_KEY || key === LEGACY_BATCH_REGISTRY_KEY) {
            if (!Array.isArray(data) || data.length > ACTIVE_BATCH_REGISTRY_MAX || data.some(row => !normalizeActiveBatchRecord(row, key)))
                return raw;
            next = data.filter(row => !expiredTransactionTime(row.createdAt, now));
        }
        else if (key === ATTEMPT_STORAGE_KEY) {
            if (!data || typeof data !== 'object' || Array.isArray(data))
                return raw;
            next = { ...data };
            for (const [bucket, rows] of Object.entries(data)) {
                if (!Array.isArray(rows))
                    continue;
                const kept = rows.filter(row => !(row && typeof row.attemptId === 'string' && row.attemptId
                    && validBatchCombo(row) && expiredTransactionTime(row.ts, now)));
                if (kept.length === rows.length)
                    continue;
                if (kept.length)
                    next[bucket] = kept;
                else
                    delete next[bucket];
            }
        }
        else
            return raw;
        const result = JSON.stringify(next);
        return result.length < raw.length ? result : raw;
    }
    catch {
        return raw;
    }
}
function reclaimExpiredTransactionsForQuota(changes) {
    const now = Date.now();
    const rebased = changes.map(change => ({ ...change }));
    try {
        if (rebased.some(change => localStorage.getItem(change.key) !== change.before))
            return null;
        for (const key of [PENDING_KEY, PENDING_BATCH_KEY, ACTIVE_BATCH_REGISTRY_KEY, LEGACY_BATCH_REGISTRY_KEY, ATTEMPT_STORAGE_KEY]) {
            const before = localStorage.getItem(key);
            const after = compactExpiredTransactionRaw(key, before, now);
            if (after === before)
                continue;
            const change = rebased.find(item => item.key === key);
            if ((change && change.before !== before) || localStorage.getItem(key) !== before)
                return null;
            try {
                if (after === null)
                    localStorage.removeItem(key);
                else
                    localStorage.setItem(key, after);
            }
            catch (error) {
                if (!isStorageQuotaError(error) || localStorage.getItem(key) !== before)
                    return null;
                continue;
            }
            if (localStorage.getItem(key) !== after)
                return null;
            if (change) {
                change.before = after;
                change.after = compactExpiredTransactionRaw(key, change.after, now);
            }
        }
        return rebased;
    }
    catch {
        return null;
    }
}
function compactIndependentOutputsForQuota(keep = 40, currentChatOnly = false) {
    void currentChatOnly;
    const compact = globalThis.__rabbitMirrorCompactCoveredOutputsForQuota;
    if (typeof compact !== 'function')
        return false;
    try {
        return compact(keep) === true;
    }
    catch {
        return false;
    }
}
const QUOTA_RECOVERY_STEPS = [
    () => { try {
        localStorage.removeItem('rabbit_mirror_repair_samples:v1');
    }
    catch { } },
    () => dropMirrorImageCopiesSavedInChat({ urgent: true }),
    () => slimMirrorImagesForQuota(),
    () => compactFaceSwipeStoreForQuota([40]),
    () => compactIndependentOutputsForQuota(40),
    () => { try {
        const trim = globalThis.__rabbitMirrorTrimHistoryForQuota;
        if (typeof trim === 'function')
            trim();
    }
    catch { } },
    () => { compactFaceSwipeStoreForQuota([20]); compactIndependentOutputsForQuota(20); },
    () => { compactFaceSwipeStoreForQuota([10]); compactIndependentOutputsForQuota(10); },
    () => { compactFaceSwipeStoreForQuota([5]); compactIndependentOutputsForQuota(10, true); },
];
const STORAGE_USAGE_CATEGORIES = [
    ['rabbitMirror:image:v1:', __rmT("VeMsVAWEoBT")],
    ['rabbit_mirror_independent_outputs_v1', __rmT("VeMsVAjdq8p")],
    ['rabbit_mirror_face_swipes_v1', __rmT("PZTIK5.0yQpNGf")],
    ['rabbit_mirror_independent_history_v1', __rmT("8vfuqCi7iuzJCf")],
    ['rabbit_mirror_theater:selection_recipes:v1', __rmT("KJdhXXBZAGY")],
    ['rabbit_mirror_follow_partial_results_v1', __rmT("sWlcvZAUCtl3zDZh")],
    ['rabbit_mirror', __rmT("8vfuqCi7ZuJi0k")],
    ['rabbitMirror', __rmT("8vfuqCi7ZuJi0k")],
];
function formatStorageBytes(bytes) {
    return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
}
export function describeRabbitMirrorStorageUsage() {
    try {
        const totals = new Map();
        let all = 0;
        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (key == null)
                continue;
            const bytes = (String(key).length + String(localStorage.getItem(key) || '').length) * 2;
            all += bytes;
            const label = STORAGE_USAGE_CATEGORIES.find(([prefix]) => String(key).startsWith(prefix))?.[1] || __rmT("Rb5YO_a2O40zTk3uLX8");
            totals.set(label, Number(totals.get(label) || 0) + bytes);
        }
        const top = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
            .map(([label, bytes]) => `${label} ${formatStorageBytes(bytes)}`).join(__rmT("jvk"));
        return top ? `${__rmT("EgJrGZ6t1bUye4FAwX6J54Cx")}${formatStorageBytes(all)}${__rmT("Df1N4rB6Vmrlyw5D")}${top}${__rmT("jzk")}` : '';
    }
    catch {
        return '';
    }
}
function writeOwnedTransaction(changes = [], options = {}, allowQuotaRecovery = false) {
    const completed = [];
    let rejection = 'BATCH_STORAGE_WRITE_FAILED';
    try {
        for (const change of changes) {
            if (localStorage.getItem(change.key) !== change.before) {
                rejection = 'BATCH_STORAGE_CHANGED';
                throw new Error('Concurrent storage change');
            }
            completed.push(change);
            localStorage.setItem(change.key, change.after);
            if (localStorage.getItem(change.key) !== change.after) {
                rejection = 'BATCH_STORAGE_READBACK_MISMATCH';
                throw new Error('Storage read-back mismatch');
            }
        }
        return true;
    }
    catch (error) {
        for (const change of completed.reverse()) {
            try {
                restoreOwnedStorageWrite(change.key, change.after, change.before);
            }
            catch { }
        }
        if (allowQuotaRecovery && isStorageQuotaError(error)) {
            let lastCode = 'BATCH_STORAGE_QUOTA_EXCEEDED';
            const silent = { ...options, onRejected: code => { lastCode = code; } };
            const pending = reclaimExpiredTransactionsForQuota(changes) || changes;
            if (writeOwnedTransaction(pending, silent, false))
                return true;
            for (const step of QUOTA_RECOVERY_STEPS) {
                if (lastCode !== 'BATCH_STORAGE_QUOTA_EXCEEDED')
                    break;
                try {
                    step();
                }
                catch { }
                if (writeOwnedTransaction(pending, silent, false))
                    return true;
            }
            reportBatchRejection(options, lastCode);
            return false;
        }
        reportBatchRejection(options, isStorageQuotaError(error) ? 'BATCH_STORAGE_QUOTA_EXCEEDED' : rejection);
        return false;
    }
}
function batchPityAgedPayload(plan, beforeRaw) {
    let state;
    try {
        const parsed = JSON.parse(beforeRaw || '{}');
        state = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    }
    catch {
        return null;
    }
    const valid = new Set(plan.fairness.validFormatIds);
    const normalized = normalizeFormatEligibleMisses(state, [...valid]);
    for (const id of plan.fairness.eligibleFormatIds) {
        if (!valid.has(id))
            return null;
        normalized[id] = Math.min(FORMAT_ELIGIBLE_MISS_CAP, Number(normalized[id] || 0) + 1);
    }
    return JSON.stringify(normalized);
}
function batchAttemptPayload(plan, beforeRaw, now) {
    let store;
    try {
        const parsed = JSON.parse(beforeRaw || '{}');
        store = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    }
    catch {
        store = {};
    }
    const key = plan.identity.chatKey;
    const items = Array.isArray(store[key])
        ? store[key].filter(item => item && now - Number(item.ts || 0) <= ATTEMPT_TTL_MS)
        : [];
    const attemptIds = plan.faces.map(face => `${plan.batchId}:${face.faceIndex}`);
    if (items.some(item => attemptIds.includes(item?.attemptId)))
        return null;
    for (const face of plan.faces) {
        const combo = face.combo;
        items.push({
            attemptId: `${plan.batchId}:${face.faceIndex}`,
            themeIds: compactIdList(combo.themeIds),
            formatIds: compactIdList(combo.formatIds),
            ...presentationModeFields(combo),
            themeGroups: compactIdList(combo.themeGroups),
            formatGroups: compactIdList(combo.formatGroups),
            directiveScoped: plan.fairness.directiveScoped === true,
            ts: now,
        });
    }
    store[key] = items.slice(-MAX_ATTEMPTS_PER_CHAT);
    reclaimOneExpiredForeignBucket(store, key, ATTEMPT_TTL_MS);
    return JSON.stringify(store);
}
export function markPendingBatchAttempt(planInput = null, options = {}) {
    const reject = code => { reportBatchRejection(options, code); return false; };
    const plan = normalizeLocalBatchPlan(planInput);
    if (!plan)
        return reject(explainBatchPlanRejection(planInput));
    if (plan.identity.preview === true)
        return reject('BATCH_PREVIEW_NOT_DISPATCHABLE');
    const transient = options.transient === true;
    if (transient && (plan.identity.kind === 'generation-operation' || !plan.identity.generationScopeKey.startsWith('independent:'))) {
        return reject('BATCH_PLAN_IDENTITY_INVALID');
    }
    const registry = transient ? null : readActiveBatchRegistry();
    if (!transient && !registry)
        return reject('BATCH_REGISTRY_UNREADABLE');
    const now = Date.now();
    const liveRecords = transient ? [...transientBatchRegistry.values()].map(plan => ({ plan }))
        : registry.records.filter(record => !reclaimableBatchReservation(record, now));
    const existing = liveRecords.find(record => record.plan.batchId === plan.batchId);
    if (existing)
        return JSON.stringify(existing.plan) === JSON.stringify(plan) || reject('BATCH_ID_CONFLICT');
    if (liveRecords.length >= ACTIVE_BATCH_REGISTRY_MAX)
        return reject('BATCH_REGISTRY_CAPACITY');
    const planPayload = packBatchPlanText(JSON.stringify(plan));
    if (!planPayload)
        return reject('BATCH_PLAN_TOO_LARGE');
    const record = { planPayload, registrySession: PENDING_SESSION_TOKEN, createdAt: now };
    const registryAfter = transient ? null : JSON.stringify([
        ...liveRecords.filter(item => item.storageKey === ACTIVE_BATCH_REGISTRY_KEY).map(item => item.stored), record,
    ]);
    if (registryAfter && registryAfter.length > ACTIVE_BATCH_REGISTRY_MAX_CHARS)
        return reject('BATCH_REGISTRY_TOO_LARGE');
    let pityBefore;
    let attemptBefore;
    try {
        pityBefore = localStorage.getItem(FORMAT_ELIGIBLE_MISS_STORAGE_KEY);
        attemptBefore = localStorage.getItem(ATTEMPT_STORAGE_KEY);
    }
    catch {
        return reject('BATCH_STORAGE_UNAVAILABLE');
    }
    const pityAfter = batchPityAgedPayload(plan, pityBefore);
    const attemptAfter = batchAttemptPayload(plan, attemptBefore, now);
    if (pityAfter === null) {
        let invalidState = false;
        try {
            JSON.parse(pityBefore || '{}');
        }
        catch {
            invalidState = true;
        }
        return reject(invalidState ? 'BATCH_FAIRNESS_STATE_INVALID' : 'BATCH_FAIRNESS_PLAN_MISMATCH');
    }
    if (attemptAfter === null)
        return reject('BATCH_ATTEMPT_ALREADY_RECORDED');
    const changes = transient ? [] : [{ key: ACTIVE_BATCH_REGISTRY_KEY, before: registry.raw, after: registryAfter }];
    if (pityAfter !== (pityBefore || '{}'))
        changes.push({ key: FORMAT_ELIGIBLE_MISS_STORAGE_KEY, before: pityBefore, after: pityAfter });
    if (attemptAfter !== (attemptBefore || '{}'))
        changes.push({ key: ATTEMPT_STORAGE_KEY, before: attemptBefore, after: attemptAfter });
    const shrinks = change => typeof change.before === 'string' && change.after.length < change.before.length;
    if (transient) {
        let failure = '';
        const quiet = { ...options, onRejected: code => { failure = code; } };
        const written = writeOwnedTransaction([...changes.filter(shrinks), ...changes.filter(change => !shrinks(change))], quiet, false);
        if (!written && !['BATCH_STORAGE_QUOTA_EXCEEDED', 'BATCH_STORAGE_WRITE_FAILED', 'BATCH_STORAGE_READBACK_MISMATCH'].includes(failure)) {
            reportBatchRejection(options, failure || 'BATCH_STORAGE_WRITE_FAILED');
            return false;
        }
        if (!written)
            console.warn(__rmT("JpL_lvYO9vVkGRTOzMVxbB._uddIh6RHnkz_ZurT5rjfLcbX28YnnheBe2HKXMCQl60U_l2Sk4JvpVXy1KqUmGFua.GhV_KB_gViM3jrcuEypCvPN88a4urk"), failure);
        transientBatchRegistry.set(plan.batchId, plan);
        return true;
    }
    return writeOwnedTransaction([...changes.filter(shrinks), ...changes.filter(change => !shrinks(change))], options, true);
}
function normalizeFaceScan(value, faceIndex) {
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
        (value.faceIndex !== undefined && value.faceIndex !== faceIndex))
        return null;
    return {
        visualSignature: String(value.visualSignature ?? value.signature ?? '').slice(0, 280),
        visualSkeleton: String(value.visualSkeleton ?? value.skeleton ?? '').slice(0, VISUAL_SKELETON_MAX_CHARS),
        riskFlags: Array.isArray(value.riskFlags) ? [...new Set(value.riskFlags.map(String))].slice(0, 8) : [],
        paletteFingerprint: value.paletteFingerprint && typeof value.paletteFingerprint === 'object' ? value.paletteFingerprint : null,
        interactionFamily: normalizeInteractionFamily(value.interactionFamily),
    };
}
function applyChosenAtmosphereTickets(plan, chosenTickets) {
    if (!Array.isArray(chosenTickets) || !plan?.faces)
        return;
    chosenTickets.forEach((choice, index) => {
        const combo = plan.faces[index]?.combo;
        const menu = combo?.atmosphereMenu;
        if (!combo || !Array.isArray(menu) || !Number.isInteger(choice) || choice < 0 || choice >= menu.length)
            return;
        const ticket = menu[choice];
        if (!Array.isArray(ticket?.themeIds) && !Array.isArray(ticket?.formatIds))
            return;
        combo.themeIds = (ticket.themeIds || []).filter(id => typeof id === 'string' && id);
        combo.formatIds = (ticket.formatIds || []).filter(id => typeof id === 'string' && id);
        combo.themeGroups = (ticket.themeGroups || []).filter(Boolean);
        combo.formatGroups = (ticket.formatGroups || []).filter(Boolean);
        delete combo.interactionRecipeId;
        delete combo.interactionRecipeIds;
        delete combo.paletteRecipeId;
        Object.assign(combo, interactionRecipeFields({ ...ticket, presentationMode: combo.presentationMode }), generationPaletteFields({ ...ticket, presentationMode: combo.presentationMode }));
        combo.atmosphereResolved = true;
    });
}
function attemptTicketPayload(beforeRaw, chatKey, rows) {
    const key = String(chatKey || '').trim();
    if (!key || !rows.length || beforeRaw === null)
        return beforeRaw;
    let store;
    try {
        const parsed = JSON.parse(beforeRaw);
        store = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    }
    catch {
        return beforeRaw;
    }
    if (!store || !Array.isArray(store[key]))
        return beforeRaw;
    let changed = false;
    const next = store[key].map(item => {
        const row = rows.find(candidate => candidate.attemptId === item?.attemptId);
        if (!row)
            return item;
        const updated = { ...item,
            themeIds: compactIdList(row.combo.themeIds), formatIds: compactIdList(row.combo.formatIds),
            themeGroups: compactIdList(row.combo.themeGroups), formatGroups: compactIdList(row.combo.formatGroups) };
        if (JSON.stringify(updated) !== JSON.stringify(item))
            changed = true;
        return updated;
    });
    return changed ? JSON.stringify({ ...store, [key]: next }) : beforeRaw;
}
function batchHistoryPayload(plan, scans, beforeRaw) {
    let history;
    try {
        const parsed = JSON.parse(beforeRaw === null ? '[]' : beforeRaw);
        history = Array.isArray(parsed) ? parsed : parsed && typeof parsed === 'object' ? [parsed] : null;
    }
    catch {
        return null;
    }
    if (!history)
        return null;
    const acceptedFaces = plan.faces.filter(face => scans[face.faceIndex]);
    const existing = acceptedFaces.filter(face => historyHasBatchFace(history, plan.batchId, face.faceIndex));
    if (existing.length)
        return existing.length === acceptedFaces.length ? beforeRaw : null;
    const now = Date.now();
    for (const face of acceptedFaces) {
        const scan = scans[face.faceIndex];
        const combo = face.combo;
        const accounting = compactHistoryCombo(combo);
        history.push({ ...accounting, signature: signatureOf(combo), ts: now, batchId: plan.batchId, faceIndex: face.faceIndex,
            visualSignature: scan.visualSignature || combo.visualSignature,
            visualSkeleton: scan.visualSkeleton || combo.visualSkeleton,
            riskFlags: scan.riskFlags, paletteFingerprint: scan.paletteFingerprint || undefined,
            interactionFamily: scan.interactionFamily, visualSignatureTs: now });
    }
    return JSON.stringify(history.slice(-MAX_STORED));
}
function batchPityCommittedPayload(plan, beforeRaw, scans) {
    let state;
    try {
        const parsed = JSON.parse(beforeRaw || '{}');
        state = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    }
    catch {
        return null;
    }
    const selected = new Set(plan.faces.filter(face => scans[face.faceIndex]).flatMap(face => face.combo.formatIds || []));
    const normalized = normalizeFormatEligibleMisses(state, plan.fairness.validFormatIds);
    for (const id of selected)
        delete normalized[id];
    return JSON.stringify(normalized);
}
export function commitPendingComboBatch(faceScans = [], expected = null) {
    if (!expected)
        return false;
    const transient = transientBatchRegistry.get(expected.batchId);
    if (transient && !planMatchesExpected(transient, expected))
        return false;
    const registry = transient ? null : readActiveBatchRegistry();
    const record = registry?.records.find(record => activeBatchRecordIsFresh(record) && planMatchesExpected(record.plan, expected));
    const plan = transient || record?.plan;
    if (!plan)
        return false;
    applyChosenAtmosphereTickets(plan, expected.chosenTickets);
    if (!Array.isArray(faceScans) || faceScans.length !== plan.requestedFaceCount)
        return false;
    for (let index = 0; index < faceScans.length; index += 1)
        if (!Object.hasOwn(faceScans, index))
            return false;
    const allowPartial = expected.partial === true;
    const scans = faceScans.map((value, index) => value === null && allowPartial ? null : normalizeFaceScan(value, index));
    if (!scans.some(Boolean) || scans.some((scan, index) => !scan && !(allowPartial && faceScans[index] === null)))
        return false;
    let historyBefore;
    let pityBefore;
    let attemptBefore = null;
    try {
        historyBefore = localStorage.getItem(STORAGE_KEY);
        pityBefore = localStorage.getItem(FORMAT_ELIGIBLE_MISS_STORAGE_KEY);
        attemptBefore = localStorage.getItem(ATTEMPT_STORAGE_KEY);
    }
    catch {
        return false;
    }
    const historyAfter = batchHistoryPayload(plan, scans, historyBefore);
    const pityAfter = batchPityCommittedPayload(plan, pityBefore, scans);
    if (historyAfter === null || pityAfter === null)
        return false;
    const changes = [];
    try {
        changes.push(...faceDrawCursorChanges(plan.faces.filter(face => scans[face.faceIndex]).map(face => face.combo)));
    }
    catch {
        return false;
    }
    if (historyAfter !== historyBefore)
        changes.push({ key: STORAGE_KEY, before: historyBefore, after: historyAfter });
    if (pityAfter !== (pityBefore || '{}'))
        changes.push({ key: FORMAT_ELIGIBLE_MISS_STORAGE_KEY, before: pityBefore, after: pityAfter });
    const ticketRows = plan.faces.filter(face => scans[face.faceIndex] && face.combo?.atmosphereResolved === true)
        .map(face => ({ attemptId: `${plan.batchId}:${face.faceIndex}`, combo: face.combo }));
    const attemptAfter = attemptTicketPayload(attemptBefore, plan.identity?.chatKey, ticketRows);
    if (typeof attemptAfter === 'string' && attemptAfter !== attemptBefore)
        changes.push({ key: ATTEMPT_STORAGE_KEY, before: attemptBefore, after: attemptAfter });
    if (record)
        changes.push({ key: record.storageKey, before: registry.rawByKey[record.storageKey], after: registryWithoutRecord(registry, record) });
    const shrinks = change => typeof change.before === 'string' && change.after.length < change.before.length;
    const written = writeOwnedTransaction([...changes.filter(shrinks), ...changes.filter(change => !shrinks(change))]);
    if (written && transient)
        transientBatchRegistry.delete(plan.batchId);
    return written;
}
export function releasePendingComboBatch(expected = null) {
    if (!expected || typeof expected !== 'object')
        return false;
    const transient = transientBatchRegistry.get(expected.batchId);
    if (transient) {
        if (!planMatchesExpected(transient, expected))
            return false;
        transientBatchRegistry.delete(transient.batchId);
        return true;
    }
    const registry = readActiveBatchRegistry();
    if (!registry)
        return false;
    const index = registry.records.findIndex(record => planMatchesExpected(record.plan, expected));
    if (index < 0)
        return true;
    const record = registry.records[index];
    const after = registryWithoutRecord(registry, record);
    return writeOwnedTransaction([{ key: record.storageKey, before: registry.rawByKey[record.storageKey], after }]);
}
export function setPendingComboBatch(combos = [], identity = null) {
    let payload = '';
    let batchId = '';
    let previousBatchRaw = null;
    let previousSingleRaw = null;
    let singleRemovalAttempted = false;
    try {
        if (!Array.isArray(combos) || combos.length < 1 || combos.length > 5)
            return '';
        for (let index = 0; index < combos.length; index += 1) {
            if (!Object.prototype.hasOwnProperty.call(combos, index) || !validBatchCombo(combos[index]))
                return '';
        }
        const faces = combos.slice();
        const normalizedIdentity = identity == null ? null : normalizeBatchIdentity(identity);
        if (identity != null && !normalizedIdentity)
            return '';
        if (faces.length === 1) {
            if (!normalizedIdentity)
                setPendingCombo(faces[0]);
            return '';
        }
        previousBatchRaw = localStorage.getItem(PENDING_BATCH_KEY);
        previousSingleRaw = localStorage.getItem(PENDING_KEY);
        batchId = `${PENDING_SESSION_TOKEN}:${Date.now().toString(36)}:${(++pendingBatchSequence).toString(36)}`;
        payload = JSON.stringify({
            batchId,
            pendingTs: Date.now(),
            pendingSession: PENDING_SESSION_TOKEN,
            ...(normalizedIdentity ? { identity: normalizedIdentity } : {}),
            faces: faces.map((combo, index) => {
                const { committed, ...uncommittedCombo } = combo;
                return { ...uncommittedCombo, batchId, faceIndex: index, signature: signatureOf(combo) };
            }),
        });
        localStorage.setItem(PENDING_BATCH_KEY, payload);
        if (localStorage.getItem(PENDING_BATCH_KEY) !== payload)
            throw new Error('Batch read-back mismatch');
        if (localStorage.getItem(PENDING_KEY) !== previousSingleRaw)
            throw new Error('Single pending changed during batch write');
        if (previousSingleRaw !== null) {
            singleRemovalAttempted = true;
            localStorage.removeItem(PENDING_KEY);
            if (localStorage.getItem(PENDING_KEY) !== null)
                throw new Error('Single pending removal failed');
        }
        if (localStorage.getItem(PENDING_BATCH_KEY) !== payload)
            throw new Error('Batch replaced during single transition');
        return batchId;
    }
    catch (error) {
        const rolledBackOwnBatch = payload && restoreOwnedStorageWrite(PENDING_BATCH_KEY, payload, previousBatchRaw, batchId);
        if (rolledBackOwnBatch && singleRemovalAttempted && previousSingleRaw !== null) {
            try {
                if (localStorage.getItem(PENDING_KEY) === null)
                    localStorage.setItem(PENDING_KEY, previousSingleRaw);
            }
            catch { }
        }
        console.warn('[RabbitMirror] Failed to store pending combo batch:', error);
        return '';
    }
}
export function readPendingComboBatch(expected = null) {
    let raw = null;
    try {
        raw = localStorage.getItem(PENDING_BATCH_KEY);
        if (!raw)
            return null;
        const batch = JSON.parse(raw);
        if (!batch || typeof batch !== 'object' || Array.isArray(batch))
            throw new Error('Invalid batch object');
        if (!batchMatchesExpected(batch, expected))
            return null;
        const validFaces = Array.isArray(batch.faces) && batch.faces.length >= 2 && batch.faces.length <= 5
            && batch.faces.every(face => validBatchCombo(face) && face.batchId === batch.batchId
                && face.signature === signatureOf(face)
                && Number.isSafeInteger(face.faceIndex) && face.faceIndex >= 0 && face.faceIndex < batch.faces.length
                && (face.committed === undefined || typeof face.committed === 'boolean'))
            && new Set(batch.faces.map(face => face.faceIndex)).size === batch.faces.length;
        const validIdentity = batch.identity == null || !!normalizeBatchIdentity(batch.identity);
        const at = batch.pendingTs;
        const now = Date.now();
        if (typeof batch.batchId !== 'string' || !batch.batchId || batch.batchId.length > 256
            || !validFaces || !validIdentity || batch.pendingSession !== PENDING_SESSION_TOKEN
            || !Number.isFinite(at) || at <= 0 || at > now + 1000 || now - at > PENDING_MAX_AGE_MS) {
            if (expected == null)
                removeBatchRawIfUnchanged(raw);
            return null;
        }
        return { ...batch, faces: batch.faces.slice().sort((a, b) => a.faceIndex - b.faceIndex) };
    }
    catch {
        if (expected == null && raw !== null)
            removeBatchRawIfUnchanged(raw);
        return null;
    }
}
export function commitPendingBatchFace(faceIndex = 0, visualSignature = '', visualSkeleton = '', riskFlags = [], paletteFingerprint = null, interactionFamily = null, expected = null) {
    if (!Number.isSafeInteger(faceIndex) || faceIndex < 0 || faceIndex > 4)
        return false;
    const batch = readPendingComboBatch(expected);
    if (!batch || !batchMatchesExpected(batch, expected, true))
        return false;
    const face = batch.faces.find(item => item.faceIndex === faceIndex);
    if (!face || (face.committed === true && historyHasBatchFace(readHistory(), batch.batchId, faceIndex)))
        return false;
    const written = commitComboToHistory(face, { visualSignature, visualSkeleton, riskFlags, paletteFingerprint, interactionFamily }, { batchId: batch.batchId, faceIndex });
    if (!written)
        return false;
    let markerRaw = null;
    let markerPayload = '';
    try {
        markerRaw = localStorage.getItem(PENDING_BATCH_KEY);
        if (!markerRaw)
            return true;
        const current = JSON.parse(markerRaw);
        if (current?.batchId !== batch.batchId || !batchMatchesExpected(current, expected, true))
            return true;
        const history = readHistory();
        const currentFace = current.faces?.find(item => item.faceIndex === faceIndex);
        if (!currentFace)
            return true;
        currentFace.committed = true;
        if (localStorage.getItem(PENDING_BATCH_KEY) !== markerRaw)
            return true;
        if (current.faces.every(item => item.committed === true && historyHasBatchFace(history, batch.batchId, item.faceIndex)))
            removeBatchRawIfUnchanged(markerRaw);
        else {
            markerPayload = JSON.stringify(current);
            localStorage.setItem(PENDING_BATCH_KEY, markerPayload);
            if (localStorage.getItem(PENDING_BATCH_KEY) !== markerPayload)
                throw new Error('Batch marker read-back mismatch');
        }
    }
    catch (error) {
        if (markerPayload)
            restoreOwnedStorageWrite(PENDING_BATCH_KEY, markerPayload, markerRaw, batch.batchId);
        console.warn('[RabbitMirror] Failed to persist batch face state:', error);
    }
    return true;
}
export function clearPendingCombo() {
    try {
        localStorage.removeItem(PENDING_KEY);
    }
    catch { }
}
export function clearPendingComboBatch(expected = null) {
    try {
        const raw = localStorage.getItem(PENDING_BATCH_KEY);
        if (raw === null)
            return false;
        if (expected != null && !batchMatchesExpected(JSON.parse(raw), expected, true))
            return false;
        return removeBatchRawIfUnchanged(raw);
    }
    catch {
        return false;
    }
}
const visualHistoryTargets = new WeakMap();
let visualHistorySequence = 0;
function historyReference(value) {
    if (typeof value?.historyId === 'string' && value.historyId)
        return { historyId: value.historyId };
    if (typeof value?.batchId === 'string' && value.batchId && Number.isInteger(value.faceIndex) && value.faceIndex >= 0 && value.faceIndex < 5) {
        return { batchId: value.batchId, faceIndex: value.faceIndex };
    }
    return null;
}
export function bindVisualHistoryTarget(node, reference) {
    if (!node || (typeof node !== 'object' && typeof node !== 'function'))
        return;
    const ref = historyReference(reference);
    if (ref)
        visualHistoryTargets.set(node, Object.freeze(ref));
    else
        visualHistoryTargets.delete(node);
}
export function visualHistoryTarget(node) {
    return visualHistoryTargets.get(node) || null;
}
function compactHistoryCombo(combo) {
    const { themes, formats, texts, atmosphereMenu, pendingSession, pendingTs, pendingScopeKey, pendingOrigin, pendingChatKey, pendingBaseline, worldBookExcerpt, recentUiReviewFocus, paletteReferenceIds, ...record } = combo || {};
    return record;
}
export function createVisualHistorySelection(combo, scopeKey = '') {
    if (!combo || typeof combo !== 'object')
        return null;
    const menu = Array.isArray(combo.atmosphereMenu) ? combo.atmosphereMenu.map(ticket => ({
        ...interactionRecipeFields({ ...ticket, presentationMode: combo.presentationMode }), ...generationPaletteFields({ ...ticket, presentationMode: combo.presentationMode }),
        themeIds: ticket.themeIds || [], formatIds: ticket.formatIds || [],
        themeGroups: ticket.themeGroups || [], formatGroups: ticket.formatGroups || [],
    })) : null;
    const frozenCombo = JSON.parse(JSON.stringify({ ...compactHistoryCombo(combo), ...(menu ? { atmosphereMenu: menu } : {}) }));
    const used = new Set(readHistory().map(item => item?.historyId));
    let historyId;
    do {
        historyId = `${PENDING_SESSION_TOKEN}:visual:${++visualHistorySequence}`;
    } while (used.has(historyId));
    return { ...frozenCombo, historyId,
        pendingScopeKey: String(scopeKey || ''), pendingChatKey: getCurrentChatKey(), signature: signatureOf(frozenCombo) };
}
export function resolveVisualHistorySelection(selection, choice) {
    if (!selection?.historyId)
        return null;
    const menu = selection.atmosphereMenu;
    if (!Array.isArray(menu) || menu.length < 2)
        return { ...selection };
    if (!Number.isInteger(choice) || choice < 0 || choice >= menu.length)
        return null;
    const ticket = menu[choice];
    const resolved = { ...selection, interactionRecipeId: undefined, interactionRecipeIds: undefined, paletteRecipeId: undefined, atmosphereResolved: true,
        ...interactionRecipeFields({ ...ticket, presentationMode: selection.presentationMode }), ...generationPaletteFields({ ...ticket, presentationMode: selection.presentationMode }),
        themeIds: [...(ticket.themeIds || [])], formatIds: [...(ticket.formatIds || [])],
        themeGroups: [...(ticket.themeGroups || [])], formatGroups: [...(ticket.formatGroups || [])] };
    resolved.signature = signatureOf(resolved);
    return resolved;
}
export function commitVisualHistorySelection(selection, scan = {}) {
    lastComboHistoryFailure = '';
    if (!selection?.historyId || (selection.atmosphereMenu?.length > 1 && selection.atmosphereResolved !== true))
        return false;
    const committed = commitComboToHistory(compactHistoryCombo(selection), normalizeFaceScan(scan, scan?.faceIndex) || {}, { historyId: selection.historyId });
    if (committed && selection.atmosphereResolved === true && selection.pendingScopeKey && selection.pendingChatKey) {
        try {
            const before = localStorage.getItem(ATTEMPT_STORAGE_KEY);
            const after = attemptTicketPayload(before, selection.pendingChatKey, [{ attemptId: String(selection.pendingScopeKey), combo: selection }]);
            if (typeof after === 'string' && after !== before && localStorage.getItem(ATTEMPT_STORAGE_KEY) === before)
                localStorage.setItem(ATTEMPT_STORAGE_KEY, after);
        }
        catch { }
    }
    if (committed && selection.pendingScopeKey) {
        try {
            const raw = localStorage.getItem(PENDING_KEY), pending = JSON.parse(raw || 'null');
            if (pending?.pendingScopeKey === selection.pendingScopeKey && pending.pendingSession === PENDING_SESSION_TOKEN && pending.pendingChatKey === selection.pendingChatKey && localStorage.getItem(PENDING_KEY) === raw)
                localStorage.removeItem(PENDING_KEY);
        }
        catch { }
    }
    return committed;
}
function followSourceKey(message, chat) {
    const index = Array.isArray(chat) ? chat.lastIndexOf(message) : -1;
    return hashText(`${getCurrentChatKey(chat)}|${index}|${message?.swipe_id ?? 0}|${message?.mes || ''}`);
}
export function commitFollowVisualHistory(message, chat, source, scan) {
    if (!message || message.is_user || !Array.isArray(chat) || !chat.includes(message))
        return null;
    const sourceKey = followSourceKey(message, chat);
    const existing = readHistory().find(item => item?.followSourceKey === sourceKey && item?.historyId);
    if (existing) {
        const ref = { historyId: existing.historyId };
        return updateLatestVisualSignature(scan?.signature || '', scan?.skeleton || '', scan?.riskFlags || [], scan?.paletteFingerprint, scan?.interactionFamily, ref) ? ref : null;
    }
    try {
        const raw = localStorage.getItem(PENDING_KEY), pending = JSON.parse(raw || 'null');
        if (!pending || pending.pendingOrigin === 'independent' || pending.pendingSession !== PENDING_SESSION_TOKEN ||
            Date.now() - Number(pending.pendingTs) > PENDING_MAX_AGE_MS || !Number.isFinite(Number(pending.pendingTs)) ||
            pending.pendingChatKey !== getCurrentChatKey(chat) || pending.pendingBaseline === sourceKey)
            return null;
        const choice = parseAtmosphereTicketIndex(source, pending.atmosphereMenu?.length || 0);
        const resolved = resolveVisualHistorySelection(pending, choice);
        if (!resolved)
            return null;
        resolved.followSourceKey = sourceKey;
        if (localStorage.getItem(PENDING_KEY) !== raw || !commitVisualHistorySelection(resolved, scan))
            return null;
        if (localStorage.getItem(PENDING_KEY) === raw)
            localStorage.removeItem(PENDING_KEY);
        return { historyId: resolved.historyId };
    }
    catch {
        return null;
    }
}
export function retargetSingleAttemptFormat(scopeKey = '', combo = null) {
    const id = String(scopeKey || '').trim();
    if (!id || !combo || !Array.isArray(combo.formatIds) || !combo.formatIds.length)
        return false;
    const formatIds = compactIdList(combo.formatIds), formatGroups = compactIdList(combo.formatGroups || []);
    let changed = false;
    try {
        const chatKey = getCurrentChatKey();
        const before = localStorage.getItem(ATTEMPT_STORAGE_KEY);
        const store = JSON.parse(before || '{}');
        const items = store && typeof store === 'object' && !Array.isArray(store) && Array.isArray(store[chatKey]) ? store[chatKey] : null;
        if (items?.some(item => item?.attemptId === id)) {
            store[chatKey] = items.map(item => item?.attemptId === id ? { ...item, formatIds, formatGroups } : item);
            if (localStorage.getItem(ATTEMPT_STORAGE_KEY) === before) {
                localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(store));
                changed = true;
            }
        }
    }
    catch { }
    try {
        const raw = localStorage.getItem(PENDING_KEY), pending = JSON.parse(raw || 'null');
        if (pending && pending.pendingScopeKey === id && pending.pendingSession === PENDING_SESSION_TOKEN) {
            const next = { ...pending, formatIds, formatGroups };
            next.signature = signatureOf(next);
            if (localStorage.getItem(PENDING_KEY) === raw) {
                localStorage.setItem(PENDING_KEY, JSON.stringify(next));
                changed = true;
            }
        }
    }
    catch { }
    return changed;
}
export function setPendingCombo(combo, scopeKey = '') {
    try {
        if (!combo)
            return;
        const pending = {
            ...createVisualHistorySelection(combo, scopeKey),
            pendingOrigin: String(scopeKey).startsWith('independent:') ? 'independent' : 'follow',
            pendingChatKey: getCurrentChatKey(),
            pendingBaseline: (() => { const chat = resolveChat(); const message = [...chat].reverse().find(item => !item?.is_user); return message ? followSourceKey(message, chat) : ''; })(),
            pendingTs: Date.now(),
            pendingSession: PENDING_SESSION_TOKEN,
        };
        localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    }
    catch (error) {
        console.warn('[RabbitMirror] Failed to store pending combo:', error);
    }
}
function historyHasBatchFace(history, batchId, faceIndex) {
    if (!batchId || !Number.isSafeInteger(faceIndex) || faceIndex < 0 || faceIndex > 4)
        return false;
    return (Array.isArray(history) ? history : []).some(item => item && item.batchId === batchId && item.faceIndex === faceIndex);
}
let lastComboHistoryFailure = '';
export function comboHistoryFailureCode() { return lastComboHistoryFailure; }
export function describeComboHistoryFailure() {
    if (!lastComboHistoryFailure)
        return '';
    if (lastComboHistoryFailure === 'BATCH_STORAGE_QUOTA_EXCEEDED')
        return `${__rmT("UqjM4_zMdRF5Luw4ByEaDpORUhqt2lOxmkYTokRmE.N.VfVVAhGtrH.NwRs9uT")}${describeRabbitMirrorStorageUsage()}`;
    if (lastComboHistoryFailure === 'BATCH_STORAGE_CHANGED')
        return __rmT("ljhKI2mvLFdvcC7EX5QpJfqD3OH.7Kr6J_ajgrjfFFtSWXM2OgG2MGdozBG");
    return `${__rmT("gSfEczu3rCFTtf")}${String(lastComboHistoryFailure).slice(0, 60)}${__rmT("7Z2rzT")}`;
}
function commitComboToHistory(combo, visual = {}, options = {}) {
    lastComboHistoryFailure = '';
    if (!combo || typeof combo !== 'object')
        return false;
    const { visualSignature = '', visualSkeleton = '', riskFlags = [], paletteFingerprint = null, interactionFamily = null } = visual || {};
    const batchId = String(options?.batchId || '');
    const faceIndex = options?.faceIndex;
    const historyId = String(options?.historyId || '');
    const hasDrawCursor = !!combo.faceDrawState;
    let previousHistoryRaw = null;
    let historyPayload = '';
    try {
        let history;
        if (batchId || historyId || hasDrawCursor) {
            if (batchId && (!Number.isSafeInteger(faceIndex) || faceIndex < 0 || faceIndex > 4))
                return false;
            previousHistoryRaw = localStorage.getItem(STORAGE_KEY);
            const parsed = JSON.parse(previousHistoryRaw === null ? '[]' : previousHistoryRaw);
            if (Array.isArray(parsed))
                history = parsed;
            else if (parsed && typeof parsed === 'object')
                history = [parsed];
            else
                throw new Error('Invalid batch history snapshot');
        }
        else {
            history = readHistory();
        }
        if (batchId && historyHasBatchFace(history, batchId, faceIndex))
            return true;
        if (historyId && history.some(item => item?.historyId === historyId))
            return true;
        const now = Date.now();
        const sig = combo.signature || signatureOf(combo);
        const last = history[history.length - 1];
        if (!batchId && !historyId && !hasDrawCursor && last?.signature === sig && now - Number(last?.ts || 0) < 120000) {
            if (visualSignature)
                last.visualSignature = String(visualSignature).slice(0, 280);
            if (visualSkeleton)
                last.visualSkeleton = String(visualSkeleton).slice(0, VISUAL_SKELETON_MAX_CHARS);
            if (Array.isArray(riskFlags) && riskFlags.length)
                last.riskFlags = [...new Set(riskFlags)].slice(0, 8);
            if (paletteFingerprint && typeof paletteFingerprint === 'object')
                last.paletteFingerprint = paletteFingerprint;
            const normalizedFamily = normalizeInteractionFamily(interactionFamily);
            if (normalizedFamily)
                last.interactionFamily = normalizedFamily;
            last.visualSignatureTs = now;
            const before = localStorage.getItem(STORAGE_KEY);
            return writeOwnedTransaction([{ key: STORAGE_KEY, before, after: JSON.stringify(history.slice(-MAX_STORED)) }], { onRejected: code => { lastComboHistoryFailure = code; } }, true);
        }
        history.push({
            ...combo,
            signature: sig,
            ts: now,
            ...(batchId ? { batchId, faceIndex: Number(faceIndex) } : {}),
            ...(historyId ? { historyId } : {}),
            visualSignature: visualSignature ? String(visualSignature).slice(0, 280) : combo.visualSignature,
            visualSkeleton: visualSkeleton ? String(visualSkeleton).slice(0, VISUAL_SKELETON_MAX_CHARS) : combo.visualSkeleton,
            riskFlags: Array.isArray(riskFlags) ? [...new Set(riskFlags)].slice(0, 8) : [],
            paletteFingerprint: paletteFingerprint && typeof paletteFingerprint === 'object' ? paletteFingerprint : undefined,
            interactionFamily: normalizeInteractionFamily(interactionFamily),
            visualSignatureTs: visualSignature || visualSkeleton || (Array.isArray(riskFlags) && riskFlags.length) || paletteFingerprint || normalizeInteractionFamily(interactionFamily) ? now : undefined,
        });
        if (hasDrawCursor) {
            historyPayload = JSON.stringify(history.slice(-MAX_STORED));
            const written = writeOwnedTransaction([
                { key: STORAGE_KEY, before: previousHistoryRaw, after: historyPayload },
                ...faceDrawCursorChanges([combo]),
            ], { onRejected: code => { lastComboHistoryFailure = code; } }, true);
            if (written)
                lastComboHistoryFailure = '';
            return written;
        }
        else if (batchId || historyId) {
            historyPayload = JSON.stringify(history.slice(-MAX_STORED));
            if (localStorage.getItem(STORAGE_KEY) !== previousHistoryRaw) {
                lastComboHistoryFailure = 'BATCH_STORAGE_CHANGED';
                return false;
            }
            if (!writeOwnedTransaction([{ key: STORAGE_KEY, before: previousHistoryRaw, after: historyPayload }], { onRejected: code => { lastComboHistoryFailure = code; } }, true))
                return false;
            const confirmedRaw = localStorage.getItem(STORAGE_KEY);
            if (confirmedRaw !== historyPayload || (batchId && !historyHasBatchFace(JSON.parse(confirmedRaw), batchId, faceIndex))) {
                throw new Error('Batch history read-back mismatch');
            }
        }
        else {
            const before = localStorage.getItem(STORAGE_KEY);
            if (!writeOwnedTransaction([{ key: STORAGE_KEY, before, after: JSON.stringify(history.slice(-MAX_STORED)) }], { onRejected: code => { lastComboHistoryFailure = code; } }, true))
                return false;
        }
        lastComboHistoryFailure = '';
        return true;
    }
    catch (error) {
        if ((batchId || historyId) && historyPayload)
            restoreOwnedStorageWrite(STORAGE_KEY, historyPayload, previousHistoryRaw);
        lastComboHistoryFailure = isStorageQuotaError(error) ? 'BATCH_STORAGE_QUOTA_EXCEEDED' : String(error?.message || 'unknown');
        console.warn('[RabbitMirror] Failed to write combo history:', error);
        return false;
    }
}
const RETRIED_FACE_HISTORY_FIELDS = ['themeIds', 'formatIds', 'themeGroups', 'formatGroups', 'samplingMode', 'pureOrder', 'forcedVisualScenery'];
export function commitRetriedFaceHistory(combo, scan = {}, { roundKey = '', faceIndex = 0, batchId = '' } = {}) {
    const batch = String(batchId || '').trim();
    const round = batch || String(roundKey || '').trim().slice(0, 240);
    if (!round || batch.length > 256 || !combo || typeof combo !== 'object' || !Number.isSafeInteger(faceIndex) || faceIndex < 0 || faceIndex > 4)
        return false;
    const record = { ...(batch ? {} : { diversityRound: round }), ...presentationModeFields(combo) };
    for (const key of RETRIED_FACE_HISTORY_FIELDS) {
        const value = combo[key];
        if (Array.isArray(value))
            record[key] = value.filter(item => typeof item === 'string' && item).slice(0, 12);
        else if (value !== undefined && value !== null && typeof value !== 'object')
            record[key] = value;
    }
    if (!record.themeIds?.length && !record.formatIds?.length && !record.pureOrder)
        return false;
    const value = scan && typeof scan === 'object' ? scan : {};
    return commitComboToHistory(record, {
        visualSignature: String(value.visualSignature ?? value.signature ?? ''),
        visualSkeleton: String(value.visualSkeleton ?? value.skeleton ?? ''),
        riskFlags: Array.isArray(value.riskFlags) ? value.riskFlags.map(String) : [],
        paletteFingerprint: value.paletteFingerprint && typeof value.paletteFingerprint === 'object' ? value.paletteFingerprint : null,
        interactionFamily: value.interactionFamily || null,
    }, batch ? { batchId: batch, faceIndex } : { historyId: `${round}:${faceIndex}` });
}
export function commitPendingCombo(visualSignature = '', visualSkeleton = '', riskFlags = [], paletteFingerprint = null, interactionFamily = null) {
    try {
        const raw = localStorage.getItem(PENDING_KEY);
        if (!raw)
            return;
        const pending = JSON.parse(raw);
        if (!pending || typeof pending !== 'object')
            return;
        const pendingSession = String(pending.pendingSession || '');
        const pendingAt = Number(pending.pendingTs);
        const staleSession = !!pendingSession && pendingSession !== PENDING_SESSION_TOKEN;
        const staleAge = !Number.isFinite(pendingAt) || Date.now() - pendingAt > PENDING_MAX_AGE_MS;
        if (staleSession || staleAge) {
            localStorage.removeItem(PENDING_KEY);
            return;
        }
        if (Array.isArray(pending.atmosphereMenu) && pending.atmosphereMenu.length > 1 && pending.atmosphereResolved !== true) {
            return false;
        }
        if (commitVisualHistorySelection(pending, { visualSignature, visualSkeleton, riskFlags, paletteFingerprint, interactionFamily })) {
            if (localStorage.getItem(PENDING_KEY) === raw)
                localStorage.removeItem(PENDING_KEY);
            return true;
        }
        return false;
    }
    catch (error) {
        console.warn('[RabbitMirror] Failed to commit pending combo:', error);
    }
}
export function retargetPendingAtmosphereFromHtml(html) {
    try {
        const raw = localStorage.getItem(PENDING_KEY);
        if (!raw)
            return false;
        const pending = JSON.parse(raw);
        const menu = pending?.atmosphereMenu;
        if (!Array.isArray(menu) || menu.length < 2)
            return false;
        const choice = parseAtmosphereTicketIndex(html, menu.length);
        if (choice == null)
            return false;
        return retargetPendingAtmosphereTicket(choice);
    }
    catch {
        return false;
    }
}
export function retargetPendingAtmosphereTicket(choice) {
    try {
        const raw = localStorage.getItem(PENDING_KEY);
        if (!raw)
            return false;
        const pending = JSON.parse(raw);
        const menu = pending?.atmosphereMenu;
        if (!pending || !Array.isArray(menu) || !Number.isInteger(choice) || choice < 0 || choice >= menu.length)
            return false;
        const ticket = menu[choice];
        pending.themeIds = (ticket.themeIds || []).filter(id => typeof id === 'string' && id);
        pending.formatIds = (ticket.formatIds || []).filter(id => typeof id === 'string' && id);
        pending.themeGroups = (ticket.themeGroups || []).filter(Boolean);
        pending.formatGroups = (ticket.formatGroups || []).filter(Boolean);
        delete pending.interactionRecipeId;
        delete pending.interactionRecipeIds;
        delete pending.paletteRecipeId;
        Object.assign(pending, interactionRecipeFields({ ...ticket, presentationMode: pending.presentationMode }), generationPaletteFields({ ...ticket, presentationMode: pending.presentationMode }));
        pending.atmosphereResolved = true;
        pending.signature = signatureOf(pending);
        const payload = JSON.stringify(pending);
        localStorage.setItem(PENDING_KEY, payload);
        return localStorage.getItem(PENDING_KEY) === payload;
    }
    catch {
        return false;
    }
}
export function setLastCombo(combo, scopeKey = '') {
    setPendingCombo(combo, scopeKey);
}
export function clearLastCombo() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PENDING_KEY);
        localStorage.removeItem(PENDING_BATCH_KEY);
        localStorage.removeItem(ATTEMPT_STORAGE_KEY);
        localStorage.removeItem(DIRECTIVE_PICK_STORAGE_KEY);
        localStorage.removeItem(FORMAT_ELIGIBLE_MISS_STORAGE_KEY);
        try {
            sessionStorage.removeItem('rabbit_mirror_theater:generation_snapshots:v1');
            sessionStorage.removeItem('rabbit_mirror_theater:active_generation_attempt:v1');
        }
        catch {
        }
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v3');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v4');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v5');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v6');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v7');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v8');
        localStorage.removeItem('rabbit_mirror_theater:pending_combo:v8');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v9');
        localStorage.removeItem('rabbit_mirror_theater:pending_combo:v9');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v10');
        localStorage.removeItem('rabbit_mirror_theater:pending_combo:v10');
    }
    catch { }
}
export function updateLatestVisualSignature(visualSignature, visualSkeleton = '', riskFlags = [], paletteFingerprint = null, interactionFamily = null, reference = null) {
    const ref = historyReference(reference);
    if (!ref)
        return false;
    let before = null, after = '';
    try {
        before = localStorage.getItem(STORAGE_KEY);
        const parsed = JSON.parse(before === null ? '[]' : before);
        const history = Array.isArray(parsed) ? parsed : parsed && typeof parsed === 'object' ? [parsed] : [];
        const entry = history.find(item => ref.historyId ? item?.historyId === ref.historyId : item?.batchId === ref.batchId && item?.faceIndex === ref.faceIndex);
        if (!entry)
            return false;
        if (visualSignature)
            entry.visualSignature = String(visualSignature).slice(0, 280);
        if (visualSkeleton)
            entry.visualSkeleton = String(visualSkeleton).slice(0, VISUAL_SKELETON_MAX_CHARS);
        if (Array.isArray(riskFlags))
            entry.riskFlags = [...new Set(riskFlags)].slice(0, 8);
        if (paletteFingerprint && typeof paletteFingerprint === 'object')
            entry.paletteFingerprint = paletteFingerprint;
        entry.interactionFamily = normalizeInteractionFamily(interactionFamily);
        entry.visualSignatureTs = Date.now();
        after = JSON.stringify(history.slice(-MAX_STORED));
        if (localStorage.getItem(STORAGE_KEY) !== before)
            return false;
        localStorage.setItem(STORAGE_KEY, after);
        if (localStorage.getItem(STORAGE_KEY) !== after)
            throw new Error('Visual history read-back mismatch');
        return true;
    }
    catch (error) {
        if (after)
            restoreOwnedStorageWrite(STORAGE_KEY, after, before);
        console.warn('[RabbitMirror] Failed to store owned visual signature:', error);
        return false;
    }
}
