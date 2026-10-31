import { getCurrentChatKey } from './storage.js?rmv=2.3.9';
import { parseMultifaceOutput, createMultifaceFailureSlot, MULTIFACE_FAILURE_ATTR } from './multifaceProtocol.js?rmv=2.3.9';
import { rabbitMirrorMultifaceSourceHash } from './multifaceProof.js?rmv=2.3.9';
import { createRabbitMirrorTextReplacementReceipt } from './replacementReceipt.js?rmv=2.3.9';
const KEY = 'rabbit_mirror_follow_partial_results_v1';
const MAX_CHARS = 768 * 1024;
const MAX_RECORDS = 120;
let cachedRaw = null;
let cachedRecords = [];
const validationCache = new WeakMap();
const sourceHashes = new WeakMap();
function records() {
    try {
        const raw = localStorage.getItem(KEY) || '[]';
        if (raw.length > MAX_CHARS * 2)
            return null;
        if (raw === cachedRaw)
            return cachedRecords;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length > MAX_RECORDS)
            return null;
        cachedRaw = raw;
        cachedRecords = parsed;
        return cachedRecords;
    }
    catch {
        return null;
    }
}
function owner(chat, index) {
    const message = Array.isArray(chat) ? chat[index] : null;
    if (!message || message.is_user || !Number.isInteger(index))
        return null;
    const source = String(message.mes || '');
    let cached = sourceHashes.get(message);
    if (cached?.source !== source) {
        cached = { source, hash: rabbitMirrorMultifaceSourceHash(source) };
        sourceHashes.set(message, cached);
    }
    return { chatKey: getCurrentChatKey(chat), messageIndex: index, swipeId: Number.isInteger(message.swipe_id) ? message.swipe_id : -1,
        sourceHash: cached.hash };
}
function sameOwner(left, right) {
    return !!left && !!right && ['chatKey', 'messageIndex', 'swipeId', 'sourceHash'].every(key => left[key] === right[key]);
}
export function followPartialResultOwnerKey(identity) {
    return JSON.stringify([identity?.chatKey, identity?.messageIndex, identity?.swipeId, identity?.sourceHash]);
}
export function followPartialResultFaceOwnerKey(identity, faceIndex) {
    return JSON.stringify([followPartialResultOwnerKey(identity), faceIndex]);
}
function valid(record) {
    if (!record || typeof record.html !== 'string' || record.html.length > MAX_CHARS || !Array.isArray(record.failedFaces))
        return false;
    if (validationCache.has(record))
        return validationCache.get(record);
    const parsed = parseMultifaceOutput(record.html);
    if (!parsed.ok || (!record.failedFaces.length && record.completedAfterRetry !== true) || record.failedFaces.length >= parsed.faces.length)
        return false;
    const seen = new Set();
    const accepted = record.failedFaces.every(failure => {
        if (!Number.isInteger(failure?.faceIndex) || failure.faceIndex < 0 || failure.faceIndex >= parsed.faces.length || seen.has(failure.faceIndex))
            return false;
        seen.add(failure.faceIndex);
        return parsed.faces[failure.faceIndex]?.html === createMultifaceFailureSlot(failure.faceIndex, failure.code);
    });
    validationCache.set(record, accepted);
    return accepted;
}
export function readFollowPartialResult(chat, index) {
    const expected = owner(chat, index);
    const local = [...(records() || [])].reverse().find(item => sameOwner(item, expected));
    const chatRecord = readChatRecord(expected);
    const localOk = valid(local), chatOk = valid(chatRecord);
    const record = localOk && chatOk ? (Number(chatRecord.ts || 0) > Number(local.ts || 0) ? chatRecord : local) : localOk ? local : chatRecord;
    return valid(record) ? { ...record, failedFaces: record.failedFaces.map(failure => ({ ...failure })),
        textReplacementReceipts: Array.isArray(record.textReplacementReceipts)
            ? record.textReplacementReceipts.map(receipt => receipt && typeof receipt === 'object' ? { ...receipt } : null) : [] } : null;
}
function boundedHistoryRound(value) {
    const text = typeof value === 'string' ? value.trim() : '';
    return text && text.length <= 256 ? text : '';
}
export function saveFollowPartialResult(chat, index, expectedOwner, html, failedFaces, appliedRules, historyRound = '') {
    const identity = owner(chat, index);
    if (!sameOwner(identity, expectedOwner) || chat[index] !== expectedOwner?.message)
        return false;
    const record = { ...identity, html, failedFaces, ts: Date.now() };
    if (boundedHistoryRound(historyRound))
        record.historyRound = boundedHistoryRound(historyRound);
    if (!valid(record))
        return false;
    if (Array.isArray(appliedRules))
        record.textReplacementReceipts = parseMultifaceOutput(html).faces.map(face => failedFaces.some(failure => failure.faceIndex === face.index) ? null
            : createRabbitMirrorTextReplacementReceipt(face.html, appliedRules, followPartialResultFaceOwnerKey(identity, face.index)));
    return persistRecord(record);
}
const CHAT_KEY = 'rabbit_mirror_follow_partials_v1';
const CHAT_MAX_CHARS = 1536 * 1024;
function chatMetadata() {
    try {
        const metadata = globalThis.SillyTavern?.getContext?.()?.chatMetadata || globalThis.chat_metadata;
        return metadata && typeof metadata === 'object' ? metadata : null;
    }
    catch {
        return null;
    }
}
function chatSlot(record) { return `${record.messageIndex}:${record.swipeId}`; }
function writeChatRecord(record) {
    const metadata = chatMetadata();
    if (!metadata)
        return false;
    if (record.chatKey !== getCurrentChatKey())
        return false;
    try {
        const store = metadata[CHAT_KEY] && typeof metadata[CHAT_KEY] === 'object' ? { ...metadata[CHAT_KEY] } : {};
        store[chatSlot(record)] = record;
        let size = JSON.stringify(store).length;
        const order = () => Object.entries(store).filter(([, value]) => value !== record)
            .sort(([, a], [, b]) => (a?.completedAfterRetry === true) - (b?.completedAfterRetry === true) || Number(a?.ts || 0) - Number(b?.ts || 0));
        while (size > CHAT_MAX_CHARS) {
            const victim = order()[0];
            if (!victim)
                break;
            delete store[victim[0]];
            size = JSON.stringify(store).length;
        }
        if (size > CHAT_MAX_CHARS)
            return false;
        metadata[CHAT_KEY] = store;
        return true;
    }
    catch {
        return false;
    }
}
function readChatRecord(expected) {
    const value = chatMetadata()?.[CHAT_KEY]?.[`${expected?.messageIndex}:${expected?.swipeId}`];
    return value && sameOwner(value, expected) ? value : null;
}
function persistRecord(record) {
    const inChat = writeChatRecord(record);
    return persistLocalRecord(record) || inChat;
}
function persistLocalRecord(record) {
    const identity = record;
    const previous = records();
    if (!previous)
        return false;
    let next = previous.filter(item => !sameOwner(item, identity)).concat(record);
    const oldestFirst = () => [...next].filter(item => item !== record).sort((a, b) => (a.chatKey === identity.chatKey) - (b.chatKey === identity.chatKey)
        || (a.completedAfterRetry === true) - (b.completedAfterRetry === true)
        || Number(a.ts || 0) - Number(b.ts || 0));
    let raw = JSON.stringify(next);
    while ((next.length > MAX_RECORDS || raw.length > MAX_CHARS * 2) && next.length > 1) {
        const victim = oldestFirst()[0];
        if (!victim)
            break;
        next = next.filter(item => item !== victim);
        raw = JSON.stringify(next);
    }
    if (next.length > MAX_RECORDS || raw.length > MAX_CHARS * 2)
        return false;
    try {
        localStorage.setItem(KEY, raw);
        if (localStorage.getItem(KEY) !== raw)
            return false;
        cachedRaw = raw;
        cachedRecords = next;
        return true;
    }
    catch {
        return false;
    }
}
export function replaceFollowPartialResultFace(chat, index, expectedOwner, { expectedHtml, faceIndex, html, appliedRules } = {}) {
    const identity = owner(chat, index);
    if (!sameOwner(identity, expectedOwner) || chat[index] !== expectedOwner?.message)
        return null;
    const current = readFollowPartialResult(chat, index);
    if (!current || current.html !== expectedHtml || !Number.isInteger(faceIndex)
        || !current.failedFaces.some(failure => failure.faceIndex === faceIndex))
        return null;
    const old = parseMultifaceOutput(current.html);
    const source = typeof html === 'string' ? html.trim() : '';
    const candidate = parseMultifaceOutput(source, { expectedCount: old.faces.length });
    if (candidate.faces.length !== 1 || candidate.faces[0]?.index !== faceIndex || candidate.faces[0]?.html !== source
        || candidate.errors.some(error => error.code !== 'face-count-mismatch')
        || source.includes(MULTIFACE_FAILURE_ATTR))
        return null;
    const merged = old.faces.map(face => face.index === faceIndex ? source : face.html).join('\n');
    if (!parseMultifaceOutput(merged, { expectedCount: old.faces.length }).ok)
        return null;
    const failedFaces = current.failedFaces.filter(failure => failure.faceIndex !== faceIndex);
    const record = { ...identity, html: merged, failedFaces, completedAfterRetry: failedFaces.length === 0, ts: Date.now() };
    if (boundedHistoryRound(current.historyRound))
        record.historyRound = boundedHistoryRound(current.historyRound);
    record.textReplacementReceipts = old.faces.map(face => face.index === faceIndex
        ? (Array.isArray(appliedRules) ? createRabbitMirrorTextReplacementReceipt(source, appliedRules, followPartialResultFaceOwnerKey(identity, faceIndex)) : null)
        : current.textReplacementReceipts?.[face.index] || null);
    if (!valid(record) || !persistRecord(record))
        return null;
    return readFollowPartialResult(chat, index);
}
export function saveFollowCompletedRetryResult(chat, index, expectedOwner, html, appliedRules) {
    const identity = owner(chat, index);
    if (!sameOwner(identity, expectedOwner) || chat[index] !== expectedOwner?.message)
        return null;
    const parsed = parseMultifaceOutput(String(html || ''));
    if (!parsed.ok || String(html || '').includes(MULTIFACE_FAILURE_ATTR))
        return null;
    const previousRound = boundedHistoryRound(readFollowPartialResult(chat, index)?.historyRound);
    const record = {
        ...identity,
        html: String(html || ''),
        failedFaces: [],
        completedAfterRetry: true,
        ts: Date.now(),
        textReplacementReceipts: parsed.faces.map(face => Array.isArray(appliedRules)
            ? createRabbitMirrorTextReplacementReceipt(face.html, appliedRules, followPartialResultFaceOwnerKey(identity, face.index))
            : null),
        ...(previousRound ? { historyRound: previousRound } : {}),
    };
    if (!valid(record) || !persistRecord(record))
        return null;
    return readFollowPartialResult(chat, index);
}
