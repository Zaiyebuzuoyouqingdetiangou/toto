import { rmT as __rmT, rmTpl as __rmTpl } from "./textTable.js?rmv=2.3.1";
import { setExtensionPrompt, extension_prompt_types, extension_prompt_roles, eventSource, event_types } from '../../../../../script.js';
const FEEDBACK_STORAGE_KEY = 'rabbit_mirror_theater:feedback_cat:v1';
const FEEDBACK_PENDING_KEY = 'rabbit_mirror_theater:feedback_cat_pending:v2';
const FEEDBACK_METADATA_KEY = 'rabbit_mirror_theater_feedback_cat_v2';
const FEEDBACK_PROMPT_KEY = 'rabbit_mirror_theater:feedback_cat_prompt';
const RUNTIME_VERSION = '1.4.30.17';
const VALID_ROUNDS = new Set([1, 3, 10]);
const VALID_TYPES = new Set(['color', 'structure', 'overall', 'interaction', 'language', 'custom']);
export const FEEDBACK_CAT_TYPES = Object.freeze({
    color: __rmT("Xif6IxHJGFuN9f"),
    structure: __rmT("ukwR80c319C1Hf"),
    overall: __rmT("TxkNvOHJfHH5.f"),
    interaction: __rmT("p5w2v5c3w6h.Cf"),
    language: __rmT(".5iKsXytJu9eZf"),
    custom: __rmT("HObD4JeJcYgMLk"),
});
function normalizeFeedbackTypes(value) {
    const source = Array.isArray(value?.types)
        ? value.types
        : Array.isArray(value)
            ? value
            : value?.type
                ? [value.type]
                : typeof value === 'string'
                    ? [value]
                    : [];
    return [...new Set(source.map(item => String(item || '')).filter(item => VALID_TYPES.has(item)))];
}
function feedbackTypeLabels(value) {
    return normalizeFeedbackTypes(value).map(type => FEEDBACK_CAT_TYPES[type] || type);
}
function clone(value) {
    if (!value || typeof value !== 'object')
        return value;
    try {
        return typeof structuredClone === 'function'
            ? structuredClone(value)
            : JSON.parse(JSON.stringify(value));
    }
    catch {
        return { ...value };
    }
}
function hashText(text) {
    let hash = 2166136261;
    for (const char of String(text || '')) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}
function getContextSafe() {
    try {
        return globalThis.SillyTavern?.getContext?.() || {};
    }
    catch {
        return {};
    }
}
function firstNonEmpty(values) {
    for (const value of values) {
        if (value !== undefined && value !== null && String(value).trim())
            return String(value).trim();
    }
    return '';
}
function getCurrentFeedbackChatIdentity(chatOverride = null) {
    const context = getContextSafe();
    const chat = Array.isArray(chatOverride)
        ? chatOverride
        : Array.isArray(context?.chat)
            ? context.chat
            : Array.isArray(globalThis.chat)
                ? globalThis.chat
                : [];
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
    const key = chatId
        ? `chat:${chatId}`
        : groupId
            ? `group:${groupId}:${hashText(seed)}`
            : characterId
                ? `character:${characterId}:${hashText(seed)}`
                : `fallback:${hashText(seed || 'unknown-chat')}`;
    return { key, chat, chatId, groupId, characterId, context, metadata };
}
function emptyState() {
    return { version: 2, active: null, lastReceipt: null };
}
function readLegacyStore() {
    try {
        const parsed = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '{}');
        if (parsed && typeof parsed === 'object' && parsed.chats && typeof parsed.chats === 'object')
            return parsed;
    }
    catch {
    }
    return { version: 1, chats: {} };
}
function writeLegacyStore(store) {
    try {
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(store));
        return true;
    }
    catch (error) {
        console.warn('[RabbitMirror] Failed to store feedback cat fallback state:', error);
        return false;
    }
}
function saveMetadataSoon(context) {
    return !!context;
}
function normalizeState(value) {
    if (!value || typeof value !== 'object')
        return emptyState();
    return {
        version: 2,
        active: value.active && typeof value.active === 'object' ? clone(value.active) : null,
        lastReceipt: value.lastReceipt && typeof value.lastReceipt === 'object' ? clone(value.lastReceipt) : null,
    };
}
function readCurrentState(chatOverride = null) {
    const identity = getCurrentFeedbackChatIdentity(chatOverride);
    const metadataState = identity.metadata?.[FEEDBACK_METADATA_KEY];
    if (metadataState && typeof metadataState === 'object') {
        return { state: normalizeState(metadataState), identity, source: 'chatMetadata' };
    }
    const legacy = readLegacyStore();
    const oldRecord = legacy.chats[identity.key];
    const state = emptyState();
    if (oldRecord && typeof oldRecord === 'object') {
        state.active = clone(oldRecord);
        if (identity.metadata && typeof identity.metadata === 'object') {
            identity.metadata[FEEDBACK_METADATA_KEY] = clone(state);
            saveMetadataSoon(identity.context);
        }
    }
    return { state, identity, source: oldRecord ? 'localStorage-migrated' : 'empty' };
}
function writeCurrentState(state, chatOverride = null) {
    const identity = getCurrentFeedbackChatIdentity(chatOverride);
    const normalized = normalizeState(state);
    let metadataWritten = false;
    if (identity.metadata && typeof identity.metadata === 'object') {
        identity.metadata[FEEDBACK_METADATA_KEY] = clone(normalized);
        saveMetadataSoon(identity.context);
        metadataWritten = true;
    }
    const legacy = readLegacyStore();
    if (normalized.active)
        legacy.chats[identity.key] = clone(normalized.active);
    else
        delete legacy.chats[identity.key];
    const fallbackWritten = writeLegacyStore(legacy);
    return { identity, metadataWritten, fallbackWritten };
}
function sanitizeCustomFeedback(value, maxLength = 400) {
    let text = String(value ?? '');
    if (typeof text.normalize === 'function')
        text = text.normalize('NFC');
    return text
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .replace(/\r\n?/g, '\n')
        .trim()
        .slice(0, Math.max(1, Number(maxLength) || 400));
}
function sanitizeFingerprint(value) {
    if (!value || typeof value !== 'object')
        return null;
    const palette = value.paletteFingerprint && typeof value.paletteFingerprint === 'object'
        ? {
            brightness: String(value.paletteFingerprint.brightness || '').slice(0, 16),
            hueFamily: String(value.paletteFingerprint.hueFamily || '').slice(0, 16),
            saturation: String(value.paletteFingerprint.saturation || '').slice(0, 16),
            temperature: String(value.paletteFingerprint.temperature || '').slice(0, 16),
            confidence: Number(value.paletteFingerprint.confidence || 0),
        }
        : null;
    const riskFlags = Array.isArray(value.riskFlags)
        ? value.riskFlags.map(item => String(item || '').slice(0, 48)).filter(Boolean).slice(0, 12)
        : [];
    const signature = String(value.signature || '').replace(/\s+/g, ' ').trim().slice(0, 260);
    const skeleton = String(value.skeleton || '').replace(/\s+/g, ' ').trim().slice(0, 340);
    if (!palette && !riskFlags.length && !signature && !skeleton)
        return null;
    return { paletteFingerprint: palette, riskFlags, signature, skeleton };
}
function paletteSummary(fingerprint) {
    const palette = fingerprint?.paletteFingerprint;
    if (!palette)
        return '';
    const brightnessMap = { dark: __rmT("El5s..EU"), mid: __rmT("Asqs..EU"), light: __rmT("QOWs..EU") };
    const saturationMap = { low: __rmT("Elv20KEU"), medium: __rmT("Asa20KEU"), high: __rmT("QOd20KEU") };
    const temperatureMap = { warm: __rmT("k8UZjf"), cool: __rmT("k8U5Nh"), neutral: __rmT("mHHDFWwjGgG") };
    const hueMap = {
        neutral: __rmT("AsqeEkmF"), red: __rmT("M6LEki4zZgs"), orange: __rmT("pJrEki4zZgs"), yellow: __rmT("0eLEki4zZgs"),
        green: __rmT(".PLEki4zZgs"), cyan: __rmT("rcvEki4zZgs"), blue: __rmT("UpXEki4zZgs"), purple: __rmT("BPNEki4zZgs"), pink: __rmT("TgoEki4zZgs"),
    };
    const parts = [
        brightnessMap[palette.brightness] || '',
        saturationMap[palette.saturation] || '',
        hueMap[palette.hueFamily] || '',
        temperatureMap[palette.temperature] || '',
    ].filter(Boolean);
    return parts.join(__rmT("jvk"));
}
function feedbackSourceSummary(feedback, types) {
    const fingerprint = feedback?.sourceFingerprint;
    if (!fingerprint)
        return '';
    const lines = [];
    if (types.some(type => type === 'color' || type === 'overall')) {
        const palette = paletteSummary(fingerprint);
        if (palette)
            lines.push(`${__rmT("Xif6IAKhwCHStf")}${palette}${__rmT("jzk")}`);
    }
    if (types.some(type => type === 'structure' || type === 'overall') && fingerprint.skeleton) {
        lines.push(`${__rmT("ukwR8CKhwCHStf")}${fingerprint.skeleton}`);
    }
    if (types.includes('interaction') && Array.isArray(fingerprint.riskFlags) && fingerprint.riskFlags.length) {
        lines.push(`${__rmT("x9pNWrR399hQVqFI6a2_Lk")}${fingerprint.riskFlags.join(__rmT("jvk"))}${__rmT("jzk")}`);
    }
    return lines.length
        ? `${__rmT("euxq6JUj_4KcLuwP1cgY7KryhH6X_YFieAGH3eX1GsHAOV4YAerEs3qT0TVnTs3KGkdRBX1NFMqJ2omX1.Uj0dj35L8Xs5TOb.aNtI_R7mR0uxGrThNTeVxLR7p6qRGa")}${lines.map(line => `- ${line}`).join('\n')}` : '';
}
export function getActiveFeedbackForCurrentChat(chatOverride = null) {
    const { state, identity, source } = readCurrentState(chatOverride);
    const record = state.active;
    if (!record || !normalizeFeedbackTypes(record).length || Number(record.remainingRounds || 0) <= 0)
        return null;
    return clone({ ...record, chatKey: identity.key, storageSource: source });
}
export function getFeedbackCatLastReceiptForCurrentChat(chatOverride = null) {
    const { state, identity } = readCurrentState(chatOverride);
    return state.lastReceipt ? clone({ ...state.lastReceipt, chatKey: identity.key }) : null;
}
export function setActiveFeedbackForCurrentChat({ type, types = null, customText = '', rounds = 1, sourceMessageId = -1, sourceSwipeId = -1, sourceFingerprint = null, } = {}) {
    const normalizedTypes = normalizeFeedbackTypes(Array.isArray(types) ? types : [type]);
    const normalizedRounds = Number(rounds);
    if (!normalizedTypes.length)
        throw new Error(__rmT("qvU14yvIG1kwgIKTIR.aZEPcYBIlEf"));
    if (!VALID_ROUNDS.has(normalizedRounds))
        throw new Error(__rmT(".te4PC.iZMw1MhpndfHsC3sKSsC"));
    const cleanedCustomText = normalizedTypes.includes('custom') ? sanitizeCustomFeedback(customText) : '';
    if (normalizedTypes.includes('custom') && !cleanedCustomText)
        throw new Error(__rmT("N7WiSVvjIHWSabTiQfBFjVWwxEf"));
    const { state, identity } = readCurrentState();
    const now = Date.now();
    const record = {
        id: `rmfc-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        type: normalizedTypes[0],
        types: normalizedTypes,
        label: feedbackTypeLabels(normalizedTypes).join(__rmT("eos")),
        customText: cleanedCustomText,
        totalRounds: normalizedRounds,
        remainingRounds: normalizedRounds,
        sourceMessageId: Number.isInteger(Number(sourceMessageId)) ? Number(sourceMessageId) : -1,
        sourceSwipeId: Number.isInteger(Number(sourceSwipeId)) ? Number(sourceSwipeId) : -1,
        sourceFingerprint: sanitizeFingerprint(sourceFingerprint),
        delivery: {
            status: 'waiting',
            savedAt: now,
            runtimeVersion: RUNTIME_VERSION,
            storage: identity.metadata && typeof identity.metadata === 'object' ? 'chatMetadata+fallback' : 'localStorage-fallback',
        },
        createdAt: now,
        updatedAt: now,
    };
    state.active = record;
    writeCurrentState(state);
    syncFeedbackCatExtensionPrompt(record);
    try {
        localStorage.removeItem(FEEDBACK_PENDING_KEY);
    }
    catch { }
    return clone({ ...record, chatKey: identity.key });
}
export function clearActiveFeedbackForCurrentChat() {
    const { state } = readCurrentState();
    state.active = null;
    writeCurrentState(state);
    clearFeedbackCatExtensionPrompt();
    try {
        localStorage.removeItem(FEEDBACK_PENDING_KEY);
    }
    catch { }
}
function presetFeedbackInstruction(type) {
    if (type === 'color') {
        return __rmT("uq2ZQS5ITSJxeG59TtZO8mN.Wq9FTVNBEzW5q.msyg1WRF.JrrK0O_KB2ASotqmePaocPqAmcrLnO4pf8YCKEqbQYicAODC5PUZ5ceVVIYCTCWIHOpFHUuYeLvkP8AIAN.3IsqFsjDx1Zbz0sBb1loZNcZhzjZDeN2unyrIG7Xjt51dcqs9m9ZK0cfU4NNn7_C3sY.8vmtSNKLug6iypJP3Or9F86TvZ25vNPhCM323sTFv2xB7_FKJVu1QDnePOvHHifh");
    }
    if (type === 'structure') {
        return __rmT("guhFoJEPHsxiNEDkcxekmGRx0DZ.Au6SC3JMe74aaGyR7EhKokJg65AA58v1gteKz82YPtcMulwOmLDWSshSXRKI75QMxdVWVWslRUKz6KFo7VQqVU1eURcktYeTZYhAqWetj8d1sllwqfuYnZXdJVyV3Zqt4n5ui58CMaUZB_e6URZueib_sGm81ZOFEU96y4Fd0elFG_4bi18XlNr0c_9MiJEIb8uSJ14ZTECoC6o_k0kC1eu5NkKm");
    }
    if (type === 'overall') {
        return __rmT("2WvVk_p7HINDzaINIGeCRoe11NJiaTsXYAqGyzmGYJl4ngWh5iizeXiAKW.S8ANP9AFGICoC0XGxg38wMFnyLEQ02JNn9nYpE1LCm.EoGfN0C1bUIcRWOOMNXnpKN0vmA.qbWyyfJPZQrLlo_ifRILzydngs_Sezmc0S.T3DgI_7tS6pZyNUTHSwUbM_VGI_0rqaNei84wajCpGdRWQEBzsN9YOe7mkodOTaG1t01x57688I86_");
    }
    if (type === 'interaction') {
        return __rmT("4.4kwVZDamJLZiTiy4UGDhpUBpeUhIOTNv0BSr.oA.SE9bXl6jV9LwMjepfT6zTrHvvjJPBIunidPfrw_ND.QPfAsll2Sy_f7p6O47tnPuKlzr74PWF8yqMq3njvDYQxr5f0LlhtZQXXN94b7gc5jIpNrRIiw6AmW4xdHklOPXJW23mNlKtO0.cYUAOAo_j.vj1aoXCXUI9Bu3AK2uDfSsZEcGJCHAbe8Xu24xqOvjLA6yJblciuq2r9Y06xyejVAZ2iY5xnGmLXdc5.rS.0WztQGfHJzdsCLE4ygg_vmWjPYx3rTzZzMDz5WNioSC5bFGPn5cvF468PJflN2W8NxLF9Z9E");
    }
    if (type === 'language') {
        return __rmT("CU6sb1VR39R7F2AoiKjK9RSA8U.rUI4cUI3VjAAPUwJXNQtBYA.PPmJTIaVtmgRJAwP6XY0otnSjSnHuJdY_cmgwFhf8gd4BiKcNRm2cqnlUntbQzVwCrfS7a.yJH1td5hrMPIhOedkv_UZa6QG7EkPQ2Ohcwd68W_4E8JLI.gbmO1KQJcvnV9MXqXKUc1uYRkKl4PtBM1VMRhKTQqC2SR600Gz3kxyKrVRwnoe4pNMojtq0jf.Nf59_HnWB2IJ23Dw1_T2R_RizdKJ4CuhowZgZIrcrZkb4HkOLLb2b1sy67jO2iAO6WKQDOaH2UFLMAivmF9o17fZ_6C6uBje.r_xXoYlb0lf8WdCAO0aqfUPC9kM6NWEPlymieTVRXE3SicfvEhz9Naigvq6mvfgaWc5C.Q9vCc6sg0w9ixk5eX4EZkZPSwqMJH10UNaYGOxy9hZfK81rXtyxSjSOEgeVYXH7kxZ1UvFWgwNEJprCijjstvbV88tkJQu1ErxpqWFasOToWCqHPr01VnKR2V_hTpCCnnCJImBF1.OupZ8dRxxbX8U8cr9TujVP");
    }
    return '';
}
export function buildFeedbackCatPrompt(feedback) {
    const types = normalizeFeedbackTypes(feedback);
    if (!feedback || !types.length || Number(feedback.remainingRounds || 0) <= 0)
        return '';
    const instructions = [];
    for (const type of types) {
        if (type === 'custom')
            continue;
        const instruction = presetFeedbackInstruction(type);
        if (instruction)
            instructions.push(instruction);
    }
    if (types.includes('custom')) {
        const original = sanitizeCustomFeedback(feedback.customText);
        if (!original)
            return '';
        instructions.push(`${__rmT("nxOUb9u3.5Sgq2yTVpA")}${JSON.stringify(original)}${__rmT("78uBJBynS85L25OtTCdTJeVjaPqyqS4omkE_saXOKUYAiWSPsKMHjW1HCaJRQmzeQT9V47cUy.zg4ORSPkzjR14Huw6z7XExDj.7ZD1gI3x_QfQWdjghNjVnl3WKfJFcDhVkwwBWGR8sokMkQ4Un1k")}`);
    }
    if (!instructions.length)
        return '';
    const labels = feedbackTypeLabels(types).join(__rmT("eos"));
    const sourceSummary = feedbackSourceSummary(feedback, types);
    return String.raw(__rmTpl(["7_WvBWgk6AsT0i7O.oV8HOYycFZxe1Qi756JGsWQPM9cEf", "kovEyHAxhLhNprjVwlIOx6cGjBGvZ6nId_WzmayAS39prh0UqH95XerU899jlSMjpdxgetk._G1WJnUjC_fnsTApo98RS4YO", "eIk", "9UDERs1y0VwYes4oqSjDWTRicLgTWez7A2TjJVC3663LDSCS9J3K2Rs0hjDLcEzY5HyT1gyyaSolcOFxxPOXKdRJIO8fqFVpJCWsJrdypTpUSkJ9K50ecxq0xWEZsQ_gMfzPowgnIKNsVB0MMlCINYXWMfGJSlnqxzLyu8pC62ZNrZNX4d7thcA0GtLWPiO7kMk5DRIVlB3nyhH.NKXm1iiZawIfOnfrLdX7JOoW06EF_p.gr3nRVrEj7.SmBLbMsqW7Ps7XEqNEZuBdH1mtRggQnr9.fkkx781gnTrHG_Jly5ySic0YJTjVgpg.REnrtun933zvQwDfTn1qBYPlSTRSgZIcVDeXRArBTu96Z9eSww5W"], ["7_WvBWgk6AsT0i7O.oV8HOYycFZxe1Qi756JGsWQPM9cEf", "kovEyHAxhLhNprjVwlIOx6cGjBGvZ6nId_WzmayAS39prh0UqH95XerU899jlSMjpdxgetk._G1WJnUjC_fnsTApo98RS4YO", "eIk", "9UDERs1y0VwYes4oqSjDWTRicLgTWez7A2TjJVC3663LDSCS9J3K2Rs0hjDLcEzY5HyT1gyyaSolcOFxxPOXKdRJIO8fqFVpJCWsJrdypTpUSkJ9K50ecxq0xWEZsQ_gMfzPowgnIKNsVB0MMlCINYXWMfGJSlnqxzLyu8pC62ZNrZNX4d7thcA0GtLWPiO7kMk5DRIVlB3nyhH.NKXm1iiZawIfOnfrLdX7JOoW06EF_p.gr3nRVrEj7.SmBLbMsqW7Ps7XEqNEZuBdH1mtRggQnr9.fkkx781gnTrHG_Jly5ySic0YJTjVgpg.REnrtun933zvQwDfTn1qBYPlSTRSgZIcVDeXRArBTu96Z9eSww5W"]), labels, sourceSummary, instructions.map((item, index) => `${index + 1}. ${item}`).join('\n'));
}
export function buildFeedbackCatFinalCheck(feedback) {
    const types = normalizeFeedbackTypes(feedback);
    if (!feedback || !types.length || Number(feedback.remainingRounds || 0) <= 0)
        return '';
    const labels = feedbackTypeLabels(types).join(__rmT("eos"));
    return String.raw(__rmTpl(["euYLR2srw_PR8074L_rHi1hpSzp00m8m3df", "jNTakJeDsvtyfZsh2H4wo79Yw8qGNjV4b.EIjDvq70e4Ud4ZMVpAgQTce5rjTpGgsModB9PpFgQqwg5KBqUNWaq7ij2wxbrJj.A5Ij8Pcis791nLlTuVoVV2SO6p7RDr"], ["euYLR2srw_PR8074L_rHi1hpSzp00m8m3df", "jNTakJeDsvtyfZsh2H4wo79Yw8qGNjV4b.EIjDvq70e4Ud4ZMVpAgQTce5rjTpGgsModB9PpFgQqwg5KBqUNWaq7ij2wxbrJj.A5Ij8Pcis791nLlTuVoVV2SO6p7RDr"]), labels);
}
export function syncFeedbackCatExtensionPrompt(feedback = getActiveFeedbackForCurrentChat()) {
    globalThis.__rabbitMirrorPerfDiag?.mark?.('feedbackCat.promptSync', { active: !!feedback });
    const prompt = buildFeedbackCatPrompt(feedback);
    try {
        setExtensionPrompt(FEEDBACK_PROMPT_KEY, prompt, extension_prompt_types.IN_CHAT, 0, false, extension_prompt_roles.SYSTEM);
        return { ok: true, prompt, promptHash: hashText(prompt), chars: prompt.length };
    }
    catch (error) {
        console.warn('[RabbitMirror] Failed to sync feedback cat extension prompt:', error);
        return { ok: false, prompt: '', promptHash: '', chars: 0, error };
    }
}
export function clearFeedbackCatExtensionPrompt() {
    globalThis.__rabbitMirrorPerfDiag?.mark?.('feedbackCat.promptClear');
    try {
        setExtensionPrompt(FEEDBACK_PROMPT_KEY, '', extension_prompt_types.IN_CHAT, 0, false, extension_prompt_roles.SYSTEM);
        return true;
    }
    catch (error) {
        console.warn('[RabbitMirror] Failed to clear feedback cat extension prompt:', error);
        return false;
    }
}
function latestAssistantSnapshot(chat) {
    if (!Array.isArray(chat))
        return { hash: '', index: -1, swipeId: -1, swipeCount: 0 };
    for (let index = chat.length - 1; index >= 0; index -= 1) {
        const message = chat[index];
        if (!message?.is_user && typeof message?.mes === 'string') {
            return {
                hash: hashText(message.mes),
                index,
                swipeId: Number.isInteger(message?.swipe_id) ? message.swipe_id : -1,
                swipeCount: Array.isArray(message?.swipes) ? message.swipes.length : 0,
            };
        }
    }
    return { hash: '', index: -1, swipeId: -1, swipeCount: 0 };
}
export function markFeedbackCatInjected(feedback, generationType = 'normal', feedbackPrompt = '') {
    if (!feedback?.id)
        return false;
    const { state, identity } = readCurrentState();
    const record = state.active;
    if (!record || record.id !== feedback.id)
        return false;
    if (feedback.chatKey && feedback.chatKey !== identity.key)
        return false;
    const previous = latestAssistantSnapshot(identity.chat);
    const now = Date.now();
    const prompt = feedbackPrompt || buildFeedbackCatPrompt(feedback);
    const pending = {
        feedbackId: feedback.id,
        chatKey: identity.key,
        injectedAt: now,
        generationType: String(generationType || 'normal'),
        previousChatLength: identity.chat.length,
        previousAssistantHash: previous.hash,
        previousAssistantIndex: previous.index,
        previousSwipeId: previous.swipeId,
        previousSwipeCount: previous.swipeCount,
        remainingAtInjection: Number(feedback.remainingRounds || 0),
        feedbackPromptHash: hashText(prompt),
        feedbackTextHash: hashText(`${normalizeFeedbackTypes(feedback).join(',')}|${feedback.customText || ''}`),
        feedbackTextLength: String(feedback.customText || '').length,
        runtimeVersion: RUNTIME_VERSION,
    };
    record.delivery = {
        ...(record.delivery || {}),
        status: 'injected',
        injectedAt: now,
        generationType: pending.generationType,
        feedbackPromptHash: pending.feedbackPromptHash,
        feedbackTextHash: pending.feedbackTextHash,
        feedbackTextLength: pending.feedbackTextLength,
        runtimeVersion: RUNTIME_VERSION,
        interceptorRead: true,
        mainPromptAppended: true,
        complianceReason: '',
        foreignWords: [],
        checkedAt: 0,
    };
    record.updatedAt = now;
    state.active = record;
    state.lastReceipt = clone({ ...record.delivery, feedbackId: record.id, type: record.type, types: normalizeFeedbackTypes(record), label: record.label, remainingRounds: record.remainingRounds });
    writeCurrentState(state);
    try {
        localStorage.setItem(FEEDBACK_PENDING_KEY, JSON.stringify(pending));
        return true;
    }
    catch (error) {
        console.warn('[RabbitMirror] Failed to mark feedback cat injection:', error);
        return false;
    }
}
const LANGUAGE_VISIBLE_WORD_ALLOWLIST = new Set([
    'AI', 'API', 'HTML', 'CSS', 'SVG', 'URL', 'QR', 'ID', 'CHAR', 'USER',
]);
function extractRabbitMirrorVisibleText(source) {
    const html = String(source || '');
    const match = html.match(/<toto\b[^>]*>[\s\S]*?<\/toto>/i);
    if (!match)
        return '';
    const fragment = match[0]
        .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
        .replace(/https?:\/\/[^\s<>'\"]+/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z0-9#]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return fragment;
}
export function auditLanguageFeedbackCompliance(source) {
    const visible = extractRabbitMirrorVisibleText(source);
    if (!visible)
        return { compliant: false, foreignWords: [], reason: __rmT("IEXPAIMNWAV6l5N5_zqJovktr6Nn_T") };
    const words = visible.match(/\b[A-Za-z][A-Za-z0-9_-]{1,}\b/g) || [];
    const foreignWords = [...new Set(words.filter(word => !LANGUAGE_VISIBLE_WORD_ALLOWLIST.has(word.toUpperCase())))].slice(0, 12);
    return {
        compliant: foreignWords.length === 0,
        foreignWords,
        reason: foreignWords.length ? `${__rmT("YuibEvPtFZgQYNodkooIyfty")}${foreignWords.join(__rmT("jvk"))}` : '',
    };
}
export function auditVisibleLanguageBalanceText(text) {
    const visible = String(text || '')
        .replace(/https?:\/\/[^\s<>'"]+/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!visible) {
        return { foreignDominant: false, hanChars: 0, latinLetters: 0, foreignWordCount: 0, foreignWords: [], reason: '' };
    }
    const hanChars = (visible.match(/[\u3400-\u9fff]/g) || []).length;
    const latinLetters = (visible.match(/[A-Za-z]/g) || []).length;
    const words = visible.match(/\b[A-Za-z][A-Za-z0-9_-]{1,}\b/g) || [];
    const meaningfulWords = words.filter(word => !LANGUAGE_VISIBLE_WORD_ALLOWLIST.has(word.toUpperCase()));
    const foreignWords = [...new Set(meaningfulWords)].slice(0, 12);
    const nearlyNoChinese = hanChars <= 4 && meaningfulWords.length >= 5 && latinLetters >= 32;
    const overwhelminglyEnglish = meaningfulWords.length >= 10
        && latinLetters >= 80
        && latinLetters >= Math.max(80, hanChars * 6);
    const foreignDominant = nearlyNoChinese || overwhelminglyEnglish;
    return {
        foreignDominant,
        hanChars,
        latinLetters,
        foreignWordCount: meaningfulWords.length,
        foreignWords,
        reason: foreignDominant
            ? `${__rmT("i9G2SJ210VZQMtQvusc6ouw6hNDEuzjaoAI1xd5thprZnh")}${hanChars}${__rmT("DfVgq_CPflc2zREq")}${latinLetters}${__rmT("i898IFIOsChT8k")}${meaningfulWords.length}${__rmT("eXs")}` : '',
    };
}
export function auditRabbitMirrorLanguageBalance(source) {
    return auditVisibleLanguageBalanceText(extractRabbitMirrorVisibleText(source));
}
export function consumeInjectedFeedbackForSuccessfulRabbitMirror(message) {
    if (!message || message?.is_user || typeof message?.mes !== 'string')
        return null;
    let pending = null;
    try {
        pending = JSON.parse(localStorage.getItem(FEEDBACK_PENDING_KEY) || 'null');
    }
    catch {
        pending = null;
    }
    if (!pending?.feedbackId || Date.now() - Number(pending.injectedAt || 0) > 30 * 60 * 1000)
        return null;
    const { state, identity } = readCurrentState();
    if (pending.chatKey !== identity.key)
        return null;
    const outputHash = hashText(message.mes);
    const messageIndex = Array.isArray(identity.chat) ? identity.chat.lastIndexOf(message) : -1;
    const currentSwipeId = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
    const currentSwipeCount = Array.isArray(message?.swipes) ? message.swipes.length : 0;
    const outputChanged = !!outputHash && (outputHash !== pending.previousAssistantHash
        || identity.chat.length > Number(pending.previousChatLength || 0)
        || (messageIndex >= 0 && messageIndex !== Number(pending.previousAssistantIndex ?? -1))
        || currentSwipeId !== Number(pending.previousSwipeId ?? -1)
        || currentSwipeCount !== Number(pending.previousSwipeCount || 0));
    if (!outputChanged)
        return null;
    const record = state.active;
    if (!record || record.id !== pending.feedbackId) {
        try {
            localStorage.removeItem(FEEDBACK_PENDING_KEY);
        }
        catch { }
        return null;
    }
    const now = Date.now();
    if (normalizeFeedbackTypes(record).includes('language')) {
        const audit = auditLanguageFeedbackCompliance(message.mes);
        if (!audit.compliant) {
            record.updatedAt = now;
            record.delivery = {
                ...(record.delivery || {}),
                status: 'not_applied',
                checkedAt: now,
                complianceReason: audit.reason,
                foreignWords: audit.foreignWords,
                runtimeVersion: RUNTIME_VERSION,
                successfulRabbitMirrorDetected: true,
            };
            state.active = record;
            state.lastReceipt = clone({
                ...record.delivery,
                feedbackId: record.id,
                type: record.type,
                types: normalizeFeedbackTypes(record),
                label: record.label,
                remainingRounds: record.remainingRounds,
            });
            writeCurrentState(state);
            syncFeedbackCatExtensionPrompt(record);
            try {
                localStorage.removeItem(FEEDBACK_PENDING_KEY);
            }
            catch { }
            return {
                consumed: false,
                cleared: false,
                remainingRounds: Number(record.remainingRounds || 0),
                record: clone(record),
                receipt: clone(state.lastReceipt),
                complianceFailed: true,
            };
        }
    }
    const remaining = Math.max(0, Number(record.remainingRounds || 0) - 1);
    const receipt = {
        ...(record.delivery || {}),
        status: 'consumed',
        consumedAt: now,
        feedbackId: record.id,
        type: record.type,
        types: normalizeFeedbackTypes(record),
        label: record.label,
        remainingRounds: remaining,
        runtimeVersion: RUNTIME_VERSION,
        successfulRabbitMirrorDetected: true,
    };
    state.lastReceipt = receipt;
    let result;
    if (remaining > 0) {
        record.remainingRounds = remaining;
        record.updatedAt = now;
        record.delivery = {
            ...receipt,
            status: 'waiting',
            waitingSince: now,
            previousConsumedAt: now,
        };
        state.active = record;
        result = { consumed: true, cleared: false, remainingRounds: remaining, record: clone(record), receipt: clone(receipt) };
        writeCurrentState(state);
        syncFeedbackCatExtensionPrompt(record);
    }
    else {
        state.active = null;
        result = { consumed: true, cleared: true, remainingRounds: 0, record: clone(record), receipt: clone(receipt) };
        writeCurrentState(state);
        clearFeedbackCatExtensionPrompt();
    }
    try {
        localStorage.removeItem(FEEDBACK_PENDING_KEY);
    }
    catch { }
    return result;
}
export function consumeInjectedFeedbackForSuccessfulIndependentRabbitMirror(html, feedbackId = '') {
    const source = String(html || '').trim();
    if (!source)
        return null;
    let pending = null;
    try {
        pending = JSON.parse(localStorage.getItem(FEEDBACK_PENDING_KEY) || 'null');
    }
    catch {
        pending = null;
    }
    if (!pending?.feedbackId || Date.now() - Number(pending.injectedAt || 0) > 30 * 60 * 1000)
        return null;
    if (feedbackId && pending.feedbackId !== feedbackId)
        return null;
    if (String(pending.generationType || '') !== 'independent')
        return null;
    const { state, identity } = readCurrentState();
    if (pending.chatKey !== identity.key)
        return null;
    const record = state.active;
    if (!record || record.id !== pending.feedbackId) {
        try {
            localStorage.removeItem(FEEDBACK_PENDING_KEY);
        }
        catch { }
        return null;
    }
    const now = Date.now();
    if (normalizeFeedbackTypes(record).includes('language')) {
        const audit = auditLanguageFeedbackCompliance(source);
        if (!audit.compliant) {
            record.updatedAt = now;
            record.delivery = {
                ...(record.delivery || {}),
                status: 'not_applied',
                checkedAt: now,
                complianceReason: audit.reason,
                foreignWords: audit.foreignWords,
                runtimeVersion: RUNTIME_VERSION,
                successfulRabbitMirrorDetected: true,
                independentApi: true,
            };
            state.active = record;
            state.lastReceipt = clone({
                ...record.delivery,
                feedbackId: record.id,
                type: record.type,
                types: normalizeFeedbackTypes(record),
                label: record.label,
                remainingRounds: record.remainingRounds,
            });
            writeCurrentState(state);
            syncFeedbackCatExtensionPrompt(record);
            try {
                localStorage.removeItem(FEEDBACK_PENDING_KEY);
            }
            catch { }
            return {
                consumed: false,
                cleared: false,
                remainingRounds: Number(record.remainingRounds || 0),
                record: clone(record),
                receipt: clone(state.lastReceipt),
                complianceFailed: true,
            };
        }
    }
    const remaining = Math.max(0, Number(record.remainingRounds || 0) - 1);
    const receipt = {
        ...(record.delivery || {}),
        status: 'consumed',
        consumedAt: now,
        feedbackId: record.id,
        type: record.type,
        types: normalizeFeedbackTypes(record),
        label: record.label,
        remainingRounds: remaining,
        runtimeVersion: RUNTIME_VERSION,
        successfulRabbitMirrorDetected: true,
        independentApi: true,
    };
    state.lastReceipt = receipt;
    let result;
    if (remaining > 0) {
        record.remainingRounds = remaining;
        record.updatedAt = now;
        record.delivery = {
            ...receipt,
            status: 'waiting',
            waitingSince: now,
            previousConsumedAt: now,
        };
        state.active = record;
        result = { consumed: true, cleared: false, remainingRounds: remaining, record: clone(record), receipt: clone(receipt) };
        writeCurrentState(state);
        syncFeedbackCatExtensionPrompt(record);
    }
    else {
        state.active = null;
        result = { consumed: true, cleared: true, remainingRounds: 0, record: clone(record), receipt: clone(receipt) };
        writeCurrentState(state);
        clearFeedbackCatExtensionPrompt();
    }
    try {
        localStorage.removeItem(FEEDBACK_PENDING_KEY);
    }
    catch { }
    return result;
}
function deliveryStatusLabel(delivery) {
    if (delivery?.status === 'injected')
        return __rmT("o1Nd2YmJ9T_gpMc9Mxd64156COQ0EhAm7dYmhvZGMNYPJ9oGEqxKKkPy");
    if (delivery?.status === 'consumed')
        return __rmT("CgD1715kFGZZINz64Hq7QT");
    if (delivery?.status === 'not_applied')
        return `${__rmT("nXEXrDgPwRFYJ1QLaN7Z0ir.uessPzPhRo8")}${delivery?.complianceReason ? `${__rmT("7ys")}${delivery.complianceReason}` : ''}`;
    return __rmT("cN6NOrPEcn81NfepryV5xTUn");
}
export function feedbackCatStatusText(feedback) {
    if (!feedback)
        return __rmT("5_qPSaFAN9XgmLDVx7EcEx1.KTB");
    const types = normalizeFeedbackTypes(feedback);
    const labels = feedbackTypeLabels(types);
    const customIndex = types.indexOf('custom');
    if (customIndex >= 0 && feedback.customText)
        labels[customIndex] = `${__rmT("SRDCWdop")}${String(feedback.customText || '').replace(/\s+/g, ' ').slice(0, 42)}`;
    const label = labels.join(__rmT("eos")) || feedback.label || __rmT("jbnnqUFJsH4TLT");
    return `${label}${__rmT("VnZqAhmLHKG")}${Number(feedback.remainingRounds || 0)}${__rmT("qGy_jvrp")}${deliveryStatusLabel(feedback.delivery)}`;
}
export function feedbackCatReceiptText(receipt) {
    if (!receipt)
        return '';
    const label = feedbackTypeLabels(receipt).join(__rmT("eos")) || receipt.label || __rmT("hBHlGh");
    const time = Number(receipt.consumedAt || receipt.injectedAt || 0);
    const timeText = time ? new Date(time).toLocaleTimeString() : '';
    return `${label}${__rmT("kis")}${deliveryStatusLabel(receipt)}${timeText ? `${__rmT("kis")}${timeText}` : ''}`;
}
let feedbackCatChatChangedHandler = null;
let feedbackCatEnabledReader = () => true;
export function initFeedbackCatPromptSync(enabledReader = () => true) {
    feedbackCatEnabledReader = typeof enabledReader === 'function' ? enabledReader : () => true;
    if (feedbackCatChatChangedHandler)
        return;
    feedbackCatChatChangedHandler = () => {
        setTimeout(() => {
            if (feedbackCatEnabledReader())
                syncFeedbackCatExtensionPrompt(getActiveFeedbackForCurrentChat());
            else
                clearFeedbackCatExtensionPrompt();
        }, 0);
    };
    if (eventSource?.on && event_types?.CHAT_CHANGED) {
        eventSource.on(event_types.CHAT_CHANGED, feedbackCatChatChangedHandler);
    }
    if (feedbackCatEnabledReader())
        syncFeedbackCatExtensionPrompt(getActiveFeedbackForCurrentChat());
    else
        clearFeedbackCatExtensionPrompt();
}
export function destroyFeedbackCatPromptSync() {
    if (feedbackCatChatChangedHandler && event_types?.CHAT_CHANGED) {
        const remove = eventSource?.removeListener || eventSource?.off;
        try {
            remove?.call(eventSource, event_types.CHAT_CHANGED, feedbackCatChatChangedHandler);
        }
        catch { }
    }
    feedbackCatChatChangedHandler = null;
    clearFeedbackCatExtensionPrompt();
}
export function clearAllFeedbackCatState() {
    clearFeedbackCatExtensionPrompt();
    const { identity } = readCurrentState();
    if (identity.metadata && typeof identity.metadata === 'object') {
        delete identity.metadata[FEEDBACK_METADATA_KEY];
        saveMetadataSoon(identity.context);
    }
    try {
        localStorage.removeItem(FEEDBACK_STORAGE_KEY);
        localStorage.removeItem(FEEDBACK_PENDING_KEY);
    }
    catch { }
}
