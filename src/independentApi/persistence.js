import { rmT as __rmT } from "../textTable.js?rmv=2.11.0";
import { noteRabbitMirrorChatSave } from '../lagCheck.js?rmv=2.11.0';
import { presentationModeFields } from '../presentationMode.js?rmv=2.11.0';
import { atmosphereSelectionFields } from '../atmosphereChoice.js?rmv=2.11.0';
import { independentAdvancedOptionsSignature } from '../advancedRequestOptions.js?rmv=2.11.0';
import { refreshRabbitMirrorToolsInScope } from '../outputSanitizer.js?rmv=2.11.0';
import { FACE_SWIPE_FULL_MESSAGE, FACE_SWIPE_MAX, canAppendSwipe, selectSwipeIndex, deleteCurrentSwipe, restoreCurrentSwipeInitial, currentSwipeEntry, readFaceSwipe, mutateFaceSwipe, multifaceFacePagerView, snapshotFaceSwipes, compactSwipeState, restoreFaceSwipeSnapshot, faceSwipeSnapshotStored, loadFaceSwipeArchive, saveFaceSwipeArchive, faceSwipeArchiveReadState, faceSwipeArchiveRecordStored, faceSwipeArchiveWritePending, remapFaceSwipeSlots, remapFaceSwipeArchive, faceSwipeArchiveRemapSettled, faceSwipeStorageSlot, saveHistoryArchive, loadHistoryArchive, dropHistoryArchive, dropLegacyFaceSwipeKeys, } from '../swipeVersions.js?rmv=2.11.0';
import { RUNTIME_VERSION, byteLength, getContext, hashText } from './runtime.js?rmv=2.11.0';
import { remapMirrorImageSlots, slimMirrorImagesForQuota, dropMirrorImageCopiesSavedInChat } from '../imageStore.js?rmv=2.11.0';
import { clearEphemeralFaceFailure, hasEphemeralFaceFailure, independentSwipeDetails, independentSwipeFaceIndex, mergeFaceDetailsIntoHtml, independentSwipeSlot, seedIndependentFaceSwipesFromIdentity, writeIndependentOwnerHtml, } from './faceSwipe.js?rmv=2.11.0';
import { API_PROFILE_STORE_KEY, assistantMessages, chatKey, clearOwnerLockForBase, copyIndependentOwnerLineage, lockedIndependentRecordForBase, messageBaseSlotKey, normalizeBase, normalizeIndependentConnectionText, observeMessageSourceRevision, saveRecordForSlot, savedRecordMatchesObserved, savedIndependentRecordForOwner, sameIndependentRecordVersion, setOwnerLockForBase, swipeId, remapOwnerLockSlots, hostGenerationLooksActive, legacyChatKey, messageSourceFingerprint, } from './connection.js?rmv=2.11.0';
import { stampExternalDetailsOwnership, restampExternalHostsAfterMessageDeletion } from './request.js?rmv=2.11.0';
import { copyIndependentReplacementReceipt, ensureExternalTools, extractReadyDetails, independentStoredHtmlRestorable, interactionStatePollutionScore, markExternalDetails, normalizeSavedInteractionRecord, recoverSavedRecord, replaceExternalMultifaceFace, } from './geometry.js?rmv=2.11.0';
import { clearSavedIndependentOutputNotices, externalFaceDetails, resolveIndependentActionIdentity, scheduleIndependentReadyPostprocess, showMultifaceFace, showIndependentUnsavedOutput, clearIndependentHistorySaveNotice } from './mount.js?rmv=2.11.0';
import { messageRecordSwipes, readMessageRecord, writeMessageRecord } from './messageRecords.js?rmv=2.11.0';
const STORE_KEY = 'rabbit_mirror_independent_outputs_v1';
export const INTERACTION_STATE_MIGRATION_KEY = 'rabbit_mirror_independent_interaction_state_migration_securityfix2_v2';
export const OWNER_LOCK_STORE_KEY = 'rabbit_mirror_independent_owner_locks_v1';
const HISTORY_STORE_KEY = 'rabbit_mirror_independent_history_v1';
const CHAT_OUTPUT_METADATA_KEY = 'rabbit_mirror_independent_outputs_v2';
const CHAT_OUTPUT_METADATA_SCHEMA = 2;
export const HISTORY_PANEL_ATTR = 'data-rabbit-mirror-history-panel';
const OUTPUT_STORE_BUDGET_BYTES = 800000;
const OUTPUT_STORE_CEILING_BYTES = 1600000;
const HISTORY_STORE_BUDGET_BYTES = 500000;
const HISTORY_STORE_CEILING_BYTES = 1750000;
export const INDEPENDENT_HTML_BUDGET_BYTES = 512 * 1024;
export const INDEPENDENT_RECORD_BUDGET_BYTES = 640 * 1024;
export const INDEPENDENT_RAW_MARKUP_BUDGET_CHARS = 768 * 1024;
export const INDEPENDENT_MAX_TAGS = 4200;
export const INDEPENDENT_MAX_APPROX_DEPTH = 72;
export const INDEPENDENT_MAX_ATTRIBUTES = 12000;
export const INDEPENDENT_MAX_CSS_CHARS = 160000;
export const INDEPENDENT_MAX_CSS_RULES = 1400;
export const INDEPENDENT_MAX_DATA_URI_CHARS = 192000;
let storageWarningShown = false;
const UNSAVED_SHELF_KEY = 'rabbit_mirror_unsaved_shelf_v1';
const UNSAVED_SHELF_MAX = 4;
const LOCAL_TO_ARCHIVE_MIGRATION_KEY = 'rabbit_mirror_local_to_archive_migrated_v1';
const MEMORY_OUTPUT_LIMIT = 160;
export function independentRecordWithinBudget(value) {
    if (!value?.html)
        return false;
    const html = String(value.html || '');
    const initial = String(value.initialHtml || '');
    if (html.length * 3 <= INDEPENDENT_HTML_BUDGET_BYTES && initial.length * 3 <= INDEPENDENT_HTML_BUDGET_BYTES
        && (html.length + initial.length) * 3 <= INDEPENDENT_RECORD_BUDGET_BYTES)
        return true;
    return byteLength(html) <= INDEPENDENT_HTML_BUDGET_BYTES
        && byteLength(initial) <= INDEPENDENT_HTML_BUDGET_BYTES
        && byteLength(html) + byteLength(initial) <= INDEPENDENT_RECORD_BUDGET_BYTES;
}
function warnStorageTrimmed() {
    if (storageWarningShown)
        return;
    storageWarningShown = true;
    console.warn(__rmT("IQ5q058uq1rsAnX88swVz1WN3ySlViCfVvZWp95FpsHHW30EPcQRszbgt7npRCiMz1.onxwRsggm5Ij5gI.1E5wNwCbusXa7Jsh3k3EkBz7sbqwL85NkuyV2_40W_.Dr"));
}
const STORED_JSON_INVALID = Symbol('rabbitMirror.invalidStoredJson');
const storedJsonParses = new Map();
function parseStoredJson(storageKey, raw) {
    const entry = storedJsonParses.get(storageKey);
    if (entry && entry.raw === raw) {
        const value = entry.ref ? entry.ref.deref() : entry.value;
        if (value !== undefined)
            return value;
    }
    let value;
    try {
        value = JSON.parse(raw);
    }
    catch {
        value = STORED_JSON_INVALID;
    }
    const weak = typeof WeakRef === 'function' && !!value && typeof value === 'object';
    storedJsonParses.set(storageKey, { raw, ref: weak ? new WeakRef(value) : null, value: weak ? undefined : value });
    return value;
}
function copyStoredEntry(item) { return item && typeof item === 'object' && !Array.isArray(item) ? { ...item } : item; }
function copyStoredSlots(slots) {
    if (Array.isArray(slots))
        return slots.map(copyStoredEntry);
    const out = { ...slots };
    for (const key of Object.keys(out)) {
        const value = out[key];
        out[key] = Array.isArray(value) ? value.map(copyStoredEntry) : copyStoredEntry(value);
    }
    return out;
}
function legacyOutputStore() {
    try {
        const v = parseStoredJson(STORE_KEY, localStorage.getItem(STORE_KEY) || '{}');
        if (v === STORED_JSON_INVALID || !v || typeof v !== 'object' || Array.isArray(v))
            return {};
        return v;
    }
    catch {
        return {};
    }
}
const memoryOutputs = new Map();
const OUTPUT_TOMBSTONE = Symbol('rabbitMirror.removedOutput');
function readUnsavedShelf() {
    const out = new Map();
    try {
        const raw = globalThis.sessionStorage?.getItem(UNSAVED_SHELF_KEY) || '';
        if (!raw)
            return out;
        const parsed = parseStoredJson(UNSAVED_SHELF_KEY, raw);
        if (parsed === STORED_JSON_INVALID)
            return out;
        for (const [slot, record] of Object.entries(parsed && typeof parsed === 'object' ? parsed : {}))
            if (record?.html)
                out.set(slot, record);
    }
    catch { }
    return out;
}
function writeUnsavedShelf(map) {
    try {
        if (!map.size) {
            globalThis.sessionStorage?.removeItem(UNSAVED_SHELF_KEY);
            return true;
        }
        globalThis.sessionStorage?.setItem(UNSAVED_SHELF_KEY, JSON.stringify(Object.fromEntries(map)));
        return true;
    }
    catch {
        return false;
    }
}
function shelfPut(slot, record) {
    if (!slot || !record?.html)
        return false;
    const shelf = readUnsavedShelf();
    const current = { ...record };
    delete current.faceSwipes;
    shelf.delete(slot);
    shelf.set(slot, current);
    while (shelf.size > UNSAVED_SHELF_MAX)
        shelf.delete(shelf.keys().next().value);
    if (writeUnsavedShelf(shelf))
        return true;
    while (shelf.size > 1) {
        shelf.delete(shelf.keys().next().value);
        if (writeUnsavedShelf(shelf))
            return true;
    }
    return false;
}
function shelfDrop(match) {
    const shelf = readUnsavedShelf();
    if (!shelf.size)
        return;
    let changed = false;
    for (const [slot, record] of shelf) {
        if (typeof match === 'function' ? match(slot, record) : slot === match) {
            shelf.delete(slot);
            changed = true;
        }
    }
    if (changed)
        writeUnsavedShelf(shelf);
}
function putOwn(out, key, item) {
    Object.defineProperty(out, key, { value: item, writable: true, enumerable: true, configurable: true });
}
export function readStore() {
    const out = {};
    try {
        for (const [key, item] of Object.entries(legacyOutputStore()))
            if (item && typeof item === 'object')
                putOwn(out, key, item);
    }
    catch { }
    try {
        for (const [key, item] of readUnsavedShelf())
            if (!Object.hasOwn(out, key) || Number(item.ts || 0) > Number(out[key].ts || 0))
                putOwn(out, key, item);
    }
    catch { }
    for (const [key, item] of memoryOutputs) {
        if (item === OUTPUT_TOMBSTONE)
            delete out[key];
        else
            putOwn(out, key, item);
    }
    for (const key of Object.keys(out))
        putOwn(out, key, copyStoredEntry(out[key]));
    return out;
}
try {
    globalThis.__rabbitMirrorReadOutputStore = readStore;
}
catch { }
function parseSlotKey(slot) {
    const match = /^(.+):(\d+):(\d+):([0-9a-z]+)$/.exec(String(slot || ''));
    return match ? { chat: match[1], index: Number(match[2]), swipe: Number(match[3]), sourceHash: match[4] } : null;
}
function messageForOwner(ctx, index, msg) {
    const real = Array.isArray(ctx?.chat) ? ctx.chat[Number(index)] : null;
    if (msg && typeof msg === 'object' && typeof msg.mes === 'string') {
        if (real && real !== msg && typeof real === 'object' && real.mes === msg.mes && swipeId(real) === swipeId(msg))
            return real;
        return msg;
    }
    return real && typeof real === 'object' ? real : (msg && typeof msg === 'object' ? msg : null);
}
function legacyOwnerRaw(ctx, index, swipe) {
    const key = chatOwnerKey(index, swipe);
    if (!key)
        return null;
    const raw = chatMetadataObject(ctx)?.[CHAT_OUTPUT_METADATA_KEY]?.owners?.[key];
    return raw && typeof raw === 'object' ? raw : null;
}
function swipeBodyFingerprint(msg, swipe) {
    const current = swipeId(msg);
    if (Number(swipe) === current)
        return messageSourceFingerprint(msg);
    if (Array.isArray(msg?.swipes) && typeof msg.swipes[swipe] === 'string')
        return hashText(msg.swipes[swipe]);
    return '';
}
function recordFitsMessage(record, msg, swipe = swipeId(msg), { cell = false } = {}) {
    if (!record || typeof record !== 'object' || !msg)
        return false;
    const body = swipeBodyFingerprint(msg, swipe);
    if (record.deleted === true) {
        const hash = String(record.sourceHash || '');
        return hash ? hash === body : !cell;
    }
    if (String(record.sourceHash || '') === body || String(record.bodyHash || '') === body)
        return true;
    const lineage = copyIndependentOwnerLineage(record.ownerLineage);
    const marker = Number(swipe) === swipeId(msg) ? msg?.extra?.rabbitMirrorOwnerLineage : null;
    return !!lineage && lineage.acceptedBodyHash === body && (!marker || (marker.revoked !== true && marker.id === lineage.id));
}
function inheritedCell(real, swipe, cell) {
    if (!cell || typeof cell !== 'object')
        return false;
    const index = Number(swipe);
    if (recordFitsMessage(cell, real, index, { cell: true }))
        return false;
    const sourceHash = String(cell.sourceHash || '');
    const same = other => cell.deleted === true
        ? other?.deleted === true && String(other.sourceHash || '') === sourceHash
        : other?.deleted !== true && other?.html === cell.html && String(other?.sourceHash || '') === sourceHash;
    return messageRecordSwipes(real).some(other => other.swipe !== index && same(other.value)
        && (other.swipe < index || recordFitsMessage(other.value, real, other.swipe, { cell: true })));
}
function swipeUnmaterialized(real, swipe) {
    if (!real || !Array.isArray(real.swipes) || !real.swipes.length)
        return false;
    const index = Number(swipe);
    return index === swipeId(real) && index > 0 && index >= real.swipes.length;
}
function swipePending(real, swipe) {
    if (!swipeUnmaterialized(real, swipe))
        return false;
    try {
        return hostGenerationLooksActive();
    }
    catch {
        return true;
    }
}
export function dropInheritedCellForNewSwipe(ctx, index) {
    const real = Array.isArray(ctx?.chat) ? ctx.chat[Number(index)] : null;
    if (!real || typeof real !== 'object' || real.is_user)
        return false;
    if (!swipeUnmaterialized(real, swipeId(real)))
        return false;
    const cell = real.extra?.rabbitMirror;
    if (cell === undefined)
        return false;
    const previous = swipeId(real) - 1;
    if (!Array.isArray(real.swipe_info))
        real.swipe_info = real.swipes.map(() => ({ send_date: real.send_date, gen_started: real.gen_started, gen_finished: real.gen_finished, extra: {} }));
    const info = real.swipe_info[previous];
    if (!info || typeof info !== 'object') {
        real.swipe_info[previous] = { send_date: real.send_date, gen_started: real.gen_started, gen_finished: real.gen_finished, extra: (() => { try {
                return structuredClone(real.extra || {});
            }
            catch {
                return JSON.parse(JSON.stringify(real.extra || {}));
            } })() };
    }
    else {
        if (!info.extra || typeof info.extra !== 'object')
            info.extra = {};
        if (info.extra.rabbitMirror === undefined)
            info.extra.rabbitMirror = (() => { try {
                return structuredClone(cell);
            }
            catch {
                return JSON.parse(JSON.stringify(cell));
            } })();
    }
    if (JSON.stringify(real.swipe_info[previous].extra?.rabbitMirror) !== JSON.stringify(cell))
        return false;
    delete real.extra.rabbitMirror;
    return true;
}
function runtimeBefore(runtime, target) {
    const parse = value => String(value || '').trim().split('.').map(part => parseInt(part, 10));
    const a = parse(runtime), b = parse(target);
    if (!a.length || a.some(part => !Number.isFinite(part)))
        return true;
    for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
        const x = a[i] || 0, y = b[i] || 0;
        if (x !== y)
            return x < y;
    }
    return false;
}
const MESSAGE_CELL_RUNTIME = '2.10.0';
function deletedMarkerOf(raw, fallbackHash = '') {
    return { deleted: true, ts: Number(raw?.ts || 0), runtime: String(raw?.runtime || RUNTIME_VERSION), sourceHash: String(raw?.sourceHash || fallbackHash || '') };
}
function markLegacyOwnerDeleted(ctx, index, swipe, marker) {
    const metadata = chatMetadataObject(ctx);
    const key = chatOwnerKey(index, swipe);
    if (!metadata || !key)
        return false;
    let state = metadata[CHAT_OUTPUT_METADATA_KEY];
    if (!state || typeof state !== 'object' || !state.owners || typeof state.owners !== 'object')
        state = emptyChatOutputMetadata();
    if (state.owners[key]?.deleted === true)
        return false;
    state.version = CHAT_OUTPUT_METADATA_SCHEMA;
    state.owners[key] = deletedMarkerOf(marker);
    metadata[CHAT_OUTPUT_METADATA_KEY] = state;
    return true;
}
function retargetCellLineage(ctx, real, index, swipe, cell) {
    const lineage = cell?.ownerLineage;
    if (!lineage || typeof lineage !== 'object' || cell.deleted === true)
        return cell;
    let key = '';
    try {
        key = chatKey(ctx);
    }
    catch {
        key = '';
    }
    if (lineage.mesid === Number(index) && lineage.swipe === Number(swipe) && (!key || lineage.chatKey === key))
        return cell;
    const next = { ...cell, ownerLineage: { ...lineage, mesid: Number(index), swipe: Number(swipe), ...(key ? { chatKey: key } : {}) } };
    writeMessageRecord(real, swipe, next);
    return next;
}
function ownerCell(ctx, index, swipe, msg = null) {
    const real = messageForOwner(ctx, index, msg);
    if (swipePending(real, swipe)) {
        try {
            dropInheritedCellForNewSwipe(ctx, index);
        }
        catch { }
        return null;
    }
    let cell = real ? readMessageRecord(real, swipe) : undefined;
    if (cell !== undefined && inheritedCell(real, swipe, cell)) {
        writeMessageRecord(real, swipe, null);
        cell = undefined;
    }
    const legacy = legacyOwnerRaw(ctx, index, swipe);
    const legacyNewer = !!legacy && !!real && !!cell && typeof cell === 'object' && runtimeBefore(legacy.runtime, MESSAGE_CELL_RUNTIME)
        && Number(legacy.ts || 0) > Number(cell.ts || 0) && recordFitsMessage(legacy, real, swipe);
    if (cell !== undefined && !legacyNewer)
        return cell && typeof cell === 'object' ? { value: retargetCellLineage(ctx, real, index, swipe, cell), source: 'message' } : null;
    if (!legacy)
        return null;
    if (real && recordFitsMessage(legacy, real, swipe)) {
        const value = legacy.deleted === true ? deletedMarkerOf(legacy, swipeBodyFingerprint(real, swipe)) : compactChatPersistedRecord(legacy);
        if (value && writeMessageRecord(real, swipe, value))
            return { value: retargetCellLineage(ctx, real, index, swipe, value), source: 'message' };
    }
    return { value: legacy, source: 'legacy' };
}
function rawOwnerForKey(ctx, index, swipe) {
    const cell = ownerCell(ctx, index, swipe);
    if (!cell)
        return null;
    return cell.value.deleted === true ? { deleted: true } : cell.value;
}
function cacheCoverage(ctx, slot, record) {
    const parsed = parseSlotKey(slot);
    if (!parsed || !Array.isArray(ctx?.chat))
        return 'foreign';
    let mine = false;
    try {
        mine = parsed.chat === chatKey(ctx) || parsed.chat === legacyChatKey(ctx);
    }
    catch {
        mine = false;
    }
    if (!mine)
        return 'foreign';
    const owner = rawOwnerForKey(ctx, parsed.index, parsed.swipe);
    if (!owner)
        return 'unconfirmed';
    if (owner.deleted)
        return 'covered';
    if (!chatOwnerConfirmedInFile(ctx, chatOwnerKey(parsed.index, parsed.swipe), owner))
        return 'unconfirmed';
    if (String(owner.html || '') === String(record?.html || ''))
        return 'covered';
    if (String(owner.sourceHash || '') === String(record?.sourceHash || parsed.sourceHash) && Number(owner.ts || 0) >= Number(record?.ts || 0))
        return 'covered';
    return 'unconfirmed';
}
function outputVersionBackedUp(ctx, slot, record) {
    const html = String(record?.html || '');
    if (!html)
        return false;
    const parsed = parseSlotKey(slot);
    if (!parsed)
        return false;
    if (faceSwipeArchiveRecordStored(`${parsed.chat}:${parsed.index}:${parsed.swipe}`, record))
        return true;
    if (cacheCoverage(ctx, slot, record) !== 'covered')
        return false;
    const owner = rawOwnerForKey(ctx, parsed.index, parsed.swipe);
    return owner?.deleted === true || String(owner?.html || '') === html;
}
function compactOutputStore(value) {
    const entries = Object.entries(value && typeof value === 'object' ? value : {}).sort((a, b) => Number(b[1]?.ts || 0) - Number(a[1]?.ts || 0));
    const next = {};
    let ctx = null;
    try {
        ctx = getContext();
    }
    catch {
        ctx = null;
    }
    const classified = entries.map(([key, item]) => ({ key, item, backed: outputVersionBackedUp(ctx, key, item) }));
    let used = 2, count = 0;
    for (const { key, item, backed } of [...classified.filter(entry => !entry.backed), ...classified.filter(entry => entry.backed)]) {
        if (!independentRecordWithinBudget(item)) {
            if (backed)
                continue;
            return null;
        }
        const current = { ...item };
        delete current.faceSwipes;
        const cost = byteLength(JSON.stringify(key)) + byteLength(JSON.stringify(current)) + 2;
        if (backed && (count >= 120 || used + cost > OUTPUT_STORE_BUDGET_BYTES))
            continue;
        if (count >= 120 || used + cost > OUTPUT_STORE_CEILING_BYTES)
            return null;
        next[key] = current;
        used += cost;
        count += 1;
    }
    return next;
}
function compactCoveredOutputsForQuota(keep = 40) {
    let ctx = null;
    try {
        ctx = getContext();
    }
    catch {
        ctx = null;
    }
    let parsed;
    try {
        parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    }
    catch {
        return false;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
        return false;
    const entries = Object.entries(parsed).sort((a, b) => Number(b[1]?.ts || 0) - Number(a[1]?.ts || 0));
    const next = {};
    let spare = 0;
    let removed = 0;
    for (const [key, item] of entries) {
        if (!outputVersionBackedUp(ctx, key, item)) {
            next[key] = item;
            continue;
        }
        if (spare < Math.max(0, Number(keep) || 0)) {
            next[key] = item;
            spare += 1;
            continue;
        }
        removed += 1;
    }
    if (!removed)
        return false;
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
        return true;
    }
    catch {
        return false;
    }
}
globalThis.__rabbitMirrorCompactCoveredOutputsForQuota = compactCoveredOutputsForQuota;
function coveredStorageStats() {
    let ctx = null;
    try {
        ctx = getContext();
    }
    catch {
        ctx = null;
    }
    const stats = { freeable: 0, otherChats: 0, otherChatCount: 0, unconfirmed: 0 };
    const chats = new Set();
    const current = (() => { try {
        return String(chatKey(ctx) || '');
    }
    catch {
        return '';
    } })();
    const visit = (slot, item) => {
        const bytes = (String(slot).length + JSON.stringify(item || '').length) * 2;
        if (outputVersionBackedUp(ctx, slot, item)) {
            stats.freeable += bytes;
            return;
        }
        const parsed = parseSlotKey(slot);
        let other = false;
        try {
            other = !!(parsed && current && parsed.chat !== current && parsed.chat !== legacyChatKey(ctx));
        }
        catch {
            other = false;
        }
        if (other) {
            stats.otherChats += bytes;
            chats.add(parsed.chat);
            return;
        }
        stats.unconfirmed += bytes;
    };
    try {
        const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
        for (const [slot, item] of Object.entries(parsed && typeof parsed === 'object' ? parsed : {}))
            visit(slot, item);
    }
    catch { }
    try {
        for (const [slot, entries] of Object.entries(legacyHistoryStore().slots || {}))
            for (const entry of (Array.isArray(entries) ? entries : []))
                visit(slot, entry);
    }
    catch { }
    stats.otherChatCount = chats.size;
    return stats;
}
try {
    globalThis.__rabbitMirrorCoveredStorageStats = coveredStorageStats;
}
catch { }
function trimHistoryForQuota() {
    let history;
    try {
        history = legacyHistoryStore();
    }
    catch {
        return false;
    }
    let ctx = null;
    try {
        ctx = getContext();
    }
    catch {
        ctx = null;
    }
    let removed = 0;
    const keep = emptyHistoryStore();
    for (const [slot, entries] of Object.entries(history.slots || {})) {
        const list = (Array.isArray(entries) ? entries : []).slice().sort((a, b) => Number(a?.ts || 0) - Number(b?.ts || 0));
        if (!list.length)
            continue;
        keep.slots[slot] = list.filter((entry, index) => {
            if (index === list.length - 1 || !outputVersionBackedUp(ctx, slot, entry))
                return true;
            removed += 1;
            return false;
        });
    }
    if (!removed)
        return false;
    try {
        localStorage.setItem(HISTORY_STORE_KEY, JSON.stringify(keep));
        warnStorageTrimmed();
        return true;
    }
    catch {
        return false;
    }
}
try {
    globalThis.__rabbitMirrorTrimHistoryForQuota = trimHistoryForQuota;
}
catch { }
function freeHistoryRoomFor(serialized) {
    let history;
    try {
        history = legacyHistoryStore();
    }
    catch {
        return false;
    }
    let ctx = null;
    try {
        ctx = getContext();
    }
    catch {
        ctx = null;
    }
    const flattened = [];
    for (const [slot, entries] of Object.entries(history.slots || {}))
        for (const entry of (Array.isArray(entries) ? entries : []))
            flattened.push({ slot, entry });
    const evictable = flattened.filter(({ slot, entry }) => outputVersionBackedUp(ctx, slot, entry)).sort((a, b) => Number(a.entry?.ts || 0) - Number(b.entry?.ts || 0));
    for (const candidate of evictable) {
        flattened.splice(flattened.indexOf(candidate), 1);
        const retry = emptyHistoryStore();
        for (const { slot, entry } of flattened)
            (retry.slots[slot] || (retry.slots[slot] = [])).push(entry);
        for (const list of Object.values(retry.slots))
            list.sort((a, b) => Number(a?.ts || 0) - Number(b?.ts || 0));
        try {
            if (flattened.length)
                localStorage.setItem(HISTORY_STORE_KEY, JSON.stringify(retry));
            else
                localStorage.removeItem(HISTORY_STORE_KEY);
        }
        catch {
            continue;
        }
        try {
            localStorage.setItem(STORE_KEY, serialized);
            warnStorageTrimmed();
            return true;
        }
        catch { }
    }
    return false;
}
export function writeStore(v) {
    const current = readStore();
    const next = v && typeof v === 'object' && !Array.isArray(v) ? v : {};
    for (const [key, item] of Object.entries(next))
        if (item && typeof item === 'object')
            memoryOutputs.set(key, { ...item });
    for (const key of Object.keys(current))
        if (!Object.prototype.hasOwnProperty.call(next, key))
            memoryOutputs.set(key, OUTPUT_TOMBSTONE);
    if (memoryOutputs.size > MEMORY_OUTPUT_LIMIT)
        trimMemoryOutputs();
    return true;
}
function trimMemoryOutputs() {
    let hidden = null;
    try {
        const shelf = readUnsavedShelf();
        const legacy = legacyOutputStore();
        hidden = key => shelf.has(key) || Object.prototype.hasOwnProperty.call(legacy, key);
    }
    catch {
        hidden = null;
    }
    if (hidden)
        for (const [key, item] of [...memoryOutputs])
            if (item === OUTPUT_TOMBSTONE && !hidden(key))
                memoryOutputs.delete(key);
    const entries = [...memoryOutputs].filter(([, item]) => item !== OUTPUT_TOMBSTONE).sort((a, b) => Number(a[1]?.ts || 0) - Number(b[1]?.ts || 0));
    for (const [key, item] of entries) {
        if (memoryOutputs.size <= MEMORY_OUTPUT_LIMIT)
            break;
        if (independentRecordDurable(key, item))
            memoryOutputs.delete(key);
    }
}
function legacyOutputHas(slot, record) {
    try {
        const local = legacyOutputStore()[slot];
        return !!local?.html && String(local.html) === String(record?.html || '') && String(local.sourceHash || '') === String(record?.sourceHash || '');
    }
    catch {
        return false;
    }
}
export function independentRecordDurable(slot, record) {
    if (!record?.html)
        return false;
    const parsed = parseSlotKey(slot);
    const base = parsed ? `${parsed.chat}:${parsed.index}:${parsed.swipe}` : faceSwipeStorageSlot(String(slot || ''));
    if (base && faceSwipeArchiveRecordStored(base, record))
        return true;
    if (legacyOutputHas(slot, record))
        return true;
    if (parsed) {
        let ctx = null;
        try {
            ctx = getContext();
        }
        catch {
            ctx = null;
        }
        let mine = false;
        try {
            mine = !!ctx && (parsed.chat === chatKey(ctx) || parsed.chat === legacyChatKey(ctx));
        }
        catch {
            mine = false;
        }
        const msg = mine ? ctx.chat?.[parsed.index] : null;
        if (msg && swipeId(msg) === parsed.swipe && savedInChatFile(ctx, parsed.index, msg, record.html, String(record.sourceHash || '')))
            return true;
    }
    return false;
}
function persistOutputFallback(slot, record) {
    if (!slot || !record?.html)
        return false;
    let legacy = {};
    try {
        const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
            legacy = parsed;
    }
    catch {
        legacy = {};
    }
    const current = { ...record };
    delete current.faceSwipes;
    legacy[slot] = current;
    return writeLocalOutputs(legacy);
}
function dropLegacyOutputs(match) {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
            return false;
        let changed = false;
        for (const slot of Object.keys(parsed))
            if (match(slot)) {
                delete parsed[slot];
                changed = true;
            }
        if (changed)
            localStorage.setItem(STORE_KEY, JSON.stringify(parsed));
        return changed;
    }
    catch {
        return false;
    }
}
function writeLocalOutputs(v) {
    const compacted = compactOutputStore(v);
    if (!compacted) {
        warnStorageTrimmed();
        return false;
    }
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(compacted));
        try {
            clearSavedIndependentOutputNotices();
        }
        catch { }
        return true;
    }
    catch {
        for (const reclaim of [() => dropMirrorImageCopiesSavedInChat({ urgent: true }) > 0, () => slimMirrorImagesForQuota()]) {
            try {
                if (reclaim()) {
                    localStorage.setItem(STORE_KEY, JSON.stringify(compacted));
                    try {
                        clearSavedIndependentOutputNotices();
                    }
                    catch { }
                    return true;
                }
            }
            catch { }
        }
        if (freeHistoryRoomFor(JSON.stringify(compacted))) {
            try {
                clearSavedIndependentOutputNotices();
            }
            catch { }
            return true;
        }
        let ctx = null;
        try {
            ctx = getContext();
        }
        catch {
            ctx = null;
        }
        const kept = { ...compacted };
        const evictable = Object.entries(compacted).filter(([key, item]) => outputVersionBackedUp(ctx, key, item))
            .sort((a, b) => Number(a[1]?.ts || 0) - Number(b[1]?.ts || 0));
        for (const [key] of evictable) {
            delete kept[key];
            try {
                localStorage.setItem(STORE_KEY, JSON.stringify(kept));
                try {
                    clearSavedIndependentOutputNotices();
                }
                catch { }
                warnStorageTrimmed();
                return true;
            }
            catch { }
        }
        warnStorageTrimmed();
        return false;
    }
}
function emptyHistoryStore() { return { version: 1, slots: {} }; }
function legacyHistoryStore() {
    try {
        const parsed = parseStoredJson(HISTORY_STORE_KEY, localStorage.getItem(HISTORY_STORE_KEY) || 'null');
        if (parsed !== STORED_JSON_INVALID && parsed && typeof parsed === 'object' && parsed.slots && typeof parsed.slots === 'object')
            return parsed;
    }
    catch { }
    return emptyHistoryStore();
}
const memoryHistory = new Map();
export function readHistoryStore() {
    const legacy = legacyHistoryStore();
    const slots = { ...(legacy.slots || {}) };
    for (const [slot, entries] of memoryHistory) {
        if (entries.length)
            putOwn(slots, slot, entries);
        else
            delete slots[slot];
    }
    return { version: 1, slots: copyStoredSlots(slots) };
}
function dropLegacyHistory(match) {
    try {
        const parsed = JSON.parse(localStorage.getItem(HISTORY_STORE_KEY) || 'null');
        if (!parsed?.slots || typeof parsed.slots !== 'object')
            return false;
        let changed = false;
        for (const slot of Object.keys(parsed.slots))
            if (match(slot)) {
                delete parsed.slots[slot];
                changed = true;
            }
        if (changed)
            localStorage.setItem(HISTORY_STORE_KEY, JSON.stringify(parsed));
        return changed;
    }
    catch {
        return false;
    }
}
function compactHistoryStore(value) {
    const normalized = value && typeof value === 'object' ? value : emptyHistoryStore();
    const flattened = [];
    for (const [slot, entries] of Object.entries(normalized.slots || {})) {
        for (const entry of (Array.isArray(entries) ? entries : []).slice(-10))
            if (independentRecordWithinBudget(entry))
                flattened.push({ slot, entry });
    }
    flattened.sort((a, b) => Number(b.entry?.ts || 0) - Number(a.entry?.ts || 0));
    const next = emptyHistoryStore();
    let ctx = null;
    try {
        ctx = getContext();
    }
    catch {
        ctx = null;
    }
    let outputs = null;
    const outputHtmlFor = slot => { if (!outputs) {
        try {
            outputs = readStore();
        }
        catch {
            outputs = {};
        }
    } return String(outputs?.[slot]?.html || ''); };
    const newestForSlot = new Map();
    for (const { slot, entry } of flattened)
        if (!newestForSlot.has(slot))
            newestForSlot.set(slot, entry);
    let used = byteLength(JSON.stringify(next));
    for (const { slot, entry } of flattened.slice(0, 70)) {
        const list = next.slots[slot] || (next.slots[slot] = []);
        if (list.length >= 10)
            continue;
        const cost = byteLength(JSON.stringify(entry)) + (list.length ? 1 : byteLength(JSON.stringify(slot)) + 4);
        if (used + cost > HISTORY_STORE_BUDGET_BYTES) {
            const covered = outputHtmlFor(slot) === String(entry.html || '') || cacheCoverage(ctx, slot, entry) === 'covered';
            const protect = !covered && newestForSlot.get(slot) === entry;
            if (!protect || used + cost > HISTORY_STORE_CEILING_BYTES) {
                if (!list.length)
                    delete next.slots[slot];
                if (protect)
                    warnStorageTrimmed();
                continue;
            }
        }
        list.push(entry);
        used += cost;
    }
    for (const list of Object.values(next.slots))
        list.sort((a, b) => Number(a?.ts || 0) - Number(b?.ts || 0));
    return next;
}
function writeHistoryStore(value) {
    const current = readHistoryStore();
    const next = value && typeof value === 'object' && value.slots && typeof value.slots === 'object' ? value.slots : {};
    for (const [slot, entries] of Object.entries(next))
        memoryHistory.set(slot, (Array.isArray(entries) ? entries : []).map(copyStoredEntry));
    for (const slot of Object.keys(current.slots || {}))
        if (!Object.prototype.hasOwnProperty.call(next, slot))
            memoryHistory.set(slot, []);
    return true;
}
export function normalizeHistoryEntry(value) {
    if (!independentRecordWithinBudget(value))
        return null;
    const html = String(value.html || '');
    return {
        id: String(value.id || hashText(html)), html, initialHtml: String(value.initialHtml || ''), sourceHash: String(value.sourceHash || ''),
        bodyHash: String(value.bodyHash || ''), displayHash: String(value.displayHash || ''), reasoningHash: String(value.reasoningHash || ''),
        ts: Number(value.ts || Date.now()), model: String(value.model || ''), runtime: String(value.runtime || RUNTIME_VERSION),
        apiRequest: value.apiRequest && typeof value.apiRequest === 'object' ? { ...value.apiRequest } : null,
        executionLockChars: Number(value.executionLockChars || 0),
        paletteFingerprint: value.paletteFingerprint && typeof value.paletteFingerprint === 'object' ? { ...value.paletteFingerprint } : null,
        textReplacementReceipt: copyIndependentReplacementReceipt(value.textReplacementReceipt),
        textReplacementReceipts: Array.isArray(value.textReplacementReceipts) ? value.textReplacementReceipts.slice(0, 5).map(copyIndependentReplacementReceipt) : null,
        initialTextReplacementReceipt: copyIndependentReplacementReceipt(value.initialTextReplacementReceipt),
        ownerLineage: copyIndependentOwnerLineage(value.ownerLineage),
    };
}
export function appendHistoryEntry(slot, value) {
    const entry = normalizeHistoryEntry(value);
    if (!slot || !entry)
        return null;
    const store = readHistoryStore();
    const list = Array.isArray(store.slots[slot]) ? store.slots[slot] : [];
    const deduped = list.filter(item => String(item?.id || '') !== entry.id);
    deduped.push(entry);
    store.slots[slot] = deduped.slice(-10);
    const flattened = [];
    for (const [key, entries] of Object.entries(store.slots))
        for (const item of entries)
            flattened.push({ key, item });
    flattened.sort((a, b) => Number(b.item?.ts || 0) - Number(a.item?.ts || 0));
    const allowed = new Set(flattened.slice(0, 70).map(({ key, item }) => `${key}\u0000${item?.id || ''}`));
    for (const [key, entries] of Object.entries(store.slots)) {
        store.slots[key] = entries.filter(item => allowed.has(`${key}\u0000${item?.id || ''}`));
        if (!store.slots[key].length)
            delete store.slots[key];
    }
    writeHistoryStore(store);
    const kept = store.slots[slot] || [entry];
    void Promise.resolve().then(() => saveHistoryArchive(slot, kept)).then(ok => { if (!ok)
        persistHistoryFallback(slot, kept); }).catch(() => { persistHistoryFallback(slot, kept); });
    return entry;
}
function persistHistoryFallback(slot, entries) {
    try {
        const legacy = legacyHistoryStore();
        const next = { version: 1, slots: { ...(legacy.slots || {}) } };
        putOwn(next.slots, slot, (Array.isArray(entries) ? entries : []).map(copyStoredEntry));
        const compacted = compactHistoryStore(next);
        if (!compacted?.slots?.[slot]?.length)
            return false;
        localStorage.setItem(HISTORY_STORE_KEY, JSON.stringify(compacted));
        return true;
    }
    catch {
        return false;
    }
}
export function historyEntriesForSlot(slot) {
    const list = readHistoryStore().slots?.[slot];
    return (Array.isArray(list) ? list : []).map(normalizeHistoryEntry).filter(Boolean).sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0));
}
export async function loadArchivedHistoryEntries(slots = []) {
    const wanted = [...new Set((Array.isArray(slots) ? slots : []).map(String).filter(Boolean))];
    if (!wanted.length)
        return false;
    let changed = false;
    const loaded = await Promise.all(wanted.map(slot => Promise.resolve().then(() => loadHistoryArchive(slot)).catch(() => null)));
    for (const [position, slot] of wanted.entries()) {
        const rows = loaded[position];
        if (!Array.isArray(rows) || !rows.length)
            continue;
        const current = historyEntriesForSlot(slot);
        const ids = new Set(current.map(entry => entry.id));
        const extra = rows.map(normalizeHistoryEntry).filter(entry => entry && !ids.has(entry.id));
        if (!extra.length)
            continue;
        const merged = [...current, ...extra].sort((a, b) => Number(a.ts || 0) - Number(b.ts || 0)).slice(-10);
        memoryHistory.set(slot, merged);
        changed = true;
    }
    return changed;
}
function remountIndependentFaceFromHtml(identity, html, faceIndex) {
    const host = identity?.host;
    if (!host?.isConnected)
        return false;
    host.dataset.rmFaceRemountEpoch = String((Number(host.dataset.rmFaceRemountEpoch) || 0) + 1);
    const faces = externalFaceDetails(host);
    if (faces.length > 1) {
        if (!replaceExternalMultifaceFace(host, identity.key, 'independent', html, faceIndex, true))
            return false;
    }
    else {
        const replacement = extractReadyDetails(html, true);
        const current = host.querySelector?.(':scope > details');
        if (!replacement || !current)
            return false;
        const wasOpen = current.hasAttribute('open');
        markExternalDetails(replacement, identity.key, 'independent');
        if (wasOpen)
            replacement.setAttribute('open', '');
        else
            replacement.removeAttribute('open');
        current.replaceWith(replacement);
        host.__rabbitMirrorIndependentSource = html;
        host.dataset.rmState = 'ready';
    }
    stampExternalDetailsOwnership(host);
    ensureExternalTools(host);
    scheduleIndependentReadyPostprocess(host, identity.key, html);
    try {
        refreshRabbitMirrorToolsInScope(host);
    }
    catch { }
    return true;
}
function commitIndependentFaceVersion(identity, mutator) {
    if (!identity)
        return { ok: false, reason: 'missing' };
    const faceIndex = independentSwipeFaceIndex(identity);
    const slot = independentSwipeSlot(identity);
    const previous = readFaceSwipe(slot, faceIndex);
    const result = mutator(previous);
    if (!result?.ok)
        return result;
    const entry = currentSwipeEntry(result.state);
    const existing = savedIndependentRecordForOwner(identity.ctx, identity.index, identity.msg, readStore());
    const merged = mergeFaceDetailsIntoHtml(existing?.html || identity.host?.__rabbitMirrorIndependentSource || entry.html, faceIndex, entry.html);
    if (!merged || !independentRecordWithinBudget({ ...existing, html: merged }))
        return { ok: false, reason: 'persist', state: previous };
    if (!remountIndependentFaceFromHtml(identity, merged, faceIndex))
        return { ok: false, reason: 'mount', state: previous };
    const committed = mutateFaceSwipe(slot, faceIndex, () => result);
    writeIndependentOwnerHtml(identity, merged);
    try {
        refreshRabbitMirrorToolsInScope(identity.host);
    }
    catch { }
    return committed;
}
export function independentFaceSwipeView(root, owner = {}) {
    const identity = resolveIndependentActionIdentity(root, owner);
    if (!identity || identity.host?.dataset?.rmState === 'error')
        return null;
    const faces = externalFaceDetails(identity.host);
    if (faces.length > 1) {
        const currentIndex = showMultifaceFace(identity.host, identity.host.dataset.rmFaceView);
        return multifaceFacePagerView(faces.length, currentIndex, hasEphemeralFaceFailure(faces[currentIndex]));
    }
    seedIndependentFaceSwipesFromIdentity(identity);
    const details = independentSwipeDetails(identity);
    const overlay = hasEphemeralFaceFailure(details);
    const state = readFaceSwipe(independentSwipeSlot(identity), independentSwipeFaceIndex(identity));
    if (!state.versions.length && !overlay)
        return null;
    const count = state.versions.length;
    const currentIndex = state.currentIndex;
    const full = count >= FACE_SWIPE_MAX;
    return {
        count, currentIndex, overlay,
        label: `${currentIndex + 1}/${count || 1}`,
        canPrev: overlay || currentIndex > 0,
        canNext: currentIndex < count - 1,
        canDelete: count > 1 && !overlay,
        canResay: overlay || !full,
        full,
    };
}
export function canIndependentFaceResay(root, owner = {}) {
    const identity = resolveIndependentActionIdentity(root, owner, { allowPassiveErrorRetry: true, allowEditedSource: true });
    if (!identity)
        return { ok: false, reason: 'missing' };
    seedIndependentFaceSwipesFromIdentity(identity);
    if (hasEphemeralFaceFailure(independentSwipeDetails(identity)))
        return { ok: true, retry: true };
    const state = readFaceSwipe(independentSwipeSlot(identity), independentSwipeFaceIndex(identity));
    if (!canAppendSwipe(state))
        return { ok: false, reason: 'full', message: FACE_SWIPE_FULL_MESSAGE };
    return { ok: true };
}
export function applyIndependentFaceSwipe(root, index, owner = {}) {
    const identity = resolveIndependentActionIdentity(root, owner);
    if (!identity)
        return false;
    const faces = externalFaceDetails(identity.host);
    if (faces.length > 1) {
        const current = Number(identity.host.dataset.rmFaceView) || 0;
        const details = faces[showMultifaceFace(identity.host, index)];
        if (hasEphemeralFaceFailure(details) && Number(index) === current)
            clearEphemeralFaceFailure(details);
        try {
            refreshRabbitMirrorToolsInScope(identity.host);
        }
        catch { }
        return true;
    }
    seedIndependentFaceSwipesFromIdentity(identity);
    const details = independentSwipeDetails(identity);
    if (hasEphemeralFaceFailure(details) && Number(index) === readFaceSwipe(independentSwipeSlot(identity), independentSwipeFaceIndex(identity)).currentIndex) {
        clearEphemeralFaceFailure(details);
        const existing = savedIndependentRecordForOwner(identity.ctx, identity.index, identity.msg, readStore());
        if (existing?.html)
            remountIndependentFaceFromHtml(identity, existing.html, independentSwipeFaceIndex(identity));
        return true;
    }
    const result = commitIndependentFaceVersion(identity, state => selectSwipeIndex(state, index));
    return !!result?.ok;
}
export function deleteIndependentFaceSwipe(root, owner = {}) {
    const identity = resolveIndependentActionIdentity(root, owner);
    if (!identity)
        return false;
    seedIndependentFaceSwipesFromIdentity(identity);
    const result = commitIndependentFaceVersion(identity, deleteCurrentSwipe);
    if (!result?.ok) {
        if (result?.reason === 'last')
            globalThis.toastr?.info?.(__rmT("3l1tSsKLJ69B3v_iV3L7UM2pbNs"));
        return false;
    }
    globalThis.toastr?.success?.(`${__rmT("2lXrSMiyiCoYxdDZFJPSdH1EjFs")}${result.state.currentIndex + 1}/${result.state.versions.length}`);
    return true;
}
export function restoreIndependentFaceSwipeInitial(root) {
    const identity = resolveIndependentActionIdentity(root);
    if (!identity)
        return false;
    seedIndependentFaceSwipesFromIdentity(identity);
    const result = commitIndependentFaceVersion(identity, restoreCurrentSwipeInitial);
    if (!result?.ok)
        return false;
    globalThis.toastr?.success?.(__rmT("r8XJDoiWgX9glmpUY9AojLNn.L3y4lcKSnrTHlXfWtO98ZQX"));
    return true;
}
export function hasIndependentSwipeInitial(root) {
    const identity = resolveIndependentActionIdentity(root);
    if (!identity)
        return false;
    seedIndependentFaceSwipesFromIdentity(identity);
    return !!currentSwipeEntry(readFaceSwipe(independentSwipeSlot(identity), independentSwipeFaceIndex(identity)))?.initialHtml;
}
function emptyChatOutputMetadata() { return { version: CHAT_OUTPUT_METADATA_SCHEMA, owners: {} }; }
const MOVED_OWNER_LIMIT = 40;
function chatMetadataObject(ctx = getContext()) {
    const value = ctx?.chatMetadata || globalThis.chat_metadata;
    return value && typeof value === 'object' ? value : null;
}
function compactExternalSourceNote(metadata) {
    const externalSources = [...new Set((Array.isArray(metadata?.externalSources) ? metadata.externalSources : []).filter(name => typeof name === 'string').slice(0, 24).map(name => name.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200)).filter(Boolean))];
    return metadata?.hasExternalReferences === true || externalSources.length ? { hasExternalReferences: true, externalSources } : {};
}
function compactDirectiveCounts(metadata) {
    return Object.fromEntries(['customThemeCount', 'customFormatCount', 'customRequestCount'].filter(key => Number(metadata?.[key]) > 0)
        .map(key => [key, Math.min(1000, Math.max(1, Math.floor(Number(metadata[key]))))]));
}
function compactChatPersistedRecord(value) {
    if (!independentRecordWithinBudget(value))
        return null;
    const record = normalizeHistoryEntry(value);
    if (!record?.html)
        return null;
    const initialHtml = String(value.initialHtml || record.initialHtml || '');
    const diagnostic = value?.apiRequest && typeof value.apiRequest === 'object' ? value.apiRequest : null;
    const faces = Array.isArray(diagnostic?.faces) && diagnostic.faces.length >= 2 && diagnostic.faces.length <= 5
        ? diagnostic.faces.map((face, faceIndex) => ({ faceIndex, samplingMode: String(face?.samplingMode || ''), themeIds: Array.isArray(face?.themeIds) ? face.themeIds.map(String).slice(0, 12) : [], formatIds: Array.isArray(face?.formatIds) ? face.formatIds.map(String).slice(0, 12) : [], themeLabels: Array.isArray(face?.themeLabels) ? face.themeLabels.map(String).slice(0, 12) : [], formatLabels: Array.isArray(face?.formatLabels) ? face.formatLabels.map(String).slice(0, 12) : [], forcedVisualScenery: face?.forcedVisualScenery === true, ...compactExternalSourceNote(face), ...presentationModeFields(face), ...compactDirectiveCounts(face), ...atmosphereSelectionFields(face) }))
        : null;
    return {
        ...(value.faceSwipes ? { faceSwipes: Object.fromEntries(Object.entries(value.faceSwipes).filter(([key]) => /^[0-4]$/.test(key)).map(([key, state]) => [key, compactSwipeState(state)])) } : {}),
        html: String(record.html || ''), initialHtml: initialHtml && initialHtml !== String(record.html || '') ? initialHtml : '', sourceHash: String(record.sourceHash || ''), bodyHash: String(record.bodyHash || ''),
        displayHash: String(record.displayHash || ''), reasoningHash: String(record.reasoningHash || ''), ts: Number(record.ts || Date.now()),
        model: String(record.model || ''), runtime: String(record.runtime || RUNTIME_VERSION), executionLockChars: Number(record.executionLockChars || 0),
        paletteFingerprint: record.paletteFingerprint && typeof record.paletteFingerprint === 'object' ? { ...record.paletteFingerprint } : null,
        repairedByMaintenance: !!value?.repairedByMaintenance,
        textReplacementReceipt: record.textReplacementReceipt,
        textReplacementReceipts: record.textReplacementReceipts,
        initialTextReplacementReceipt: record.initialTextReplacementReceipt,
        ownerLineage: record.ownerLineage,
        ...(faces ? { apiRequest: { faceCount: faces.length, faces, ...compactExternalSourceNote(diagnostic),
                ...(diagnostic.partial === true ? { partial: true, failedFaces: (Array.isArray(diagnostic.failedFaces) ? diagnostic.failedFaces : [])
                        .filter(face => Number.isInteger(face?.faceIndex) && face.faceIndex >= 0 && face.faceIndex < faces.length)
                        .slice(0, 5).map(face => ({ faceIndex: face.faceIndex, status: 'failed', code: String(face.code || 'incomplete-face').replace(/[^a-z0-9-]/gi, '').slice(0, 80) })) } : {}),
            } } : diagnostic?.hasExternalReferences || diagnostic?.presentationMode || Array.isArray(diagnostic?.formatIds) || diagnostic?.visualSceneryCombination === true ? { apiRequest: { ...compactExternalSourceNote(diagnostic), ...presentationModeFields(diagnostic), ...compactDirectiveCounts(diagnostic), ...atmosphereSelectionFields(diagnostic),
                ...(Array.isArray(diagnostic?.themeIds) && Array.isArray(diagnostic?.formatIds) ? {
                    samplingMode: String(diagnostic.samplingMode || ''),
                    themeIds: Array.isArray(diagnostic.themeIds) ? diagnostic.themeIds.map(String).slice(0, 12) : [],
                    formatIds: Array.isArray(diagnostic.formatIds) ? diagnostic.formatIds.map(String).slice(0, 12) : [],
                    themeLabels: Array.isArray(diagnostic.themeLabels) ? diagnostic.themeLabels.map(String).slice(0, 12) : [],
                    formatLabels: Array.isArray(diagnostic.formatLabels) ? diagnostic.formatLabels.map(String).slice(0, 12) : [],
                    forcedVisualScenery: diagnostic.forcedVisualScenery === true,
                } : {}),
            } } : {}),
    };
}
function normalizeChatOutputMetadata(value) {
    const next = emptyChatOutputMetadata();
    const owners = value && typeof value === 'object' && value.owners && typeof value.owners === 'object' ? value.owners : {};
    for (const [key, raw] of Object.entries(owners)) {
        if (!/^\d+:\d+$/.test(String(key || '')) || !raw || typeof raw !== 'object')
            continue;
        if (raw.deleted === true) {
            next.owners[key] = { deleted: true, ts: Number(raw.ts || 0), runtime: String(raw.runtime || RUNTIME_VERSION), sourceHash: String(raw.sourceHash || '') };
            continue;
        }
        const record = compactChatPersistedRecord(raw);
        if (record)
            next.owners[key] = record;
    }
    const moved = value && typeof value === 'object' && value.moved && typeof value.moved === 'object' ? value.moved : {};
    const keep = Object.entries(moved).filter(([hash, raw]) => /^[0-9a-z]{1,64}$/i.test(hash) && raw && typeof raw === 'object' && raw.deleted !== true)
        .map(([hash, raw]) => [hash, compactChatPersistedRecord(raw)]).filter(([, record]) => record?.html)
        .sort((a, b) => Number(b[1].ts || 0) - Number(a[1].ts || 0)).slice(0, MOVED_OWNER_LIMIT);
    if (keep.length)
        next.moved = Object.fromEntries(keep);
    const epoch = Math.floor(Number(value?.remapEpoch) || 0);
    if (epoch > 0)
        next.remapEpoch = epoch;
    return next;
}
function readChatOutputMetadata(ctx = getContext()) {
    const metadata = chatMetadataObject(ctx);
    if (!metadata)
        return emptyChatOutputMetadata();
    return normalizeChatOutputMetadata(metadata[CHAT_OUTPUT_METADATA_KEY]);
}
function saveChatOutputMetadata(ctx = getContext()) {
    const metadata = chatMetadataObject(ctx);
    if (!metadata)
        return false;
    return true;
}
const chatSaveStates = new WeakMap();
function chatSaveState(metadata, create = false) {
    if (!metadata || typeof metadata !== 'object')
        return null;
    let state = chatSaveStates.get(metadata);
    if (!state && create) {
        state = { pending: new Map(), allGen: 0, savedGen: 0 };
        chatSaveStates.set(metadata, state);
    }
    return state || null;
}
function markChatOwnerPending(ctx, ownerKey, record = null, slot = '') {
    const state = chatSaveState(chatMetadataObject(ctx), true);
    if (!state || !ownerKey)
        return;
    state.pending.set(ownerKey, { html: String(record?.html || ''), record: record && typeof record === 'object' ? record : null, slot: String(slot || '') });
}
function markAllChatOwnersPending(ctx) {
    const state = chatSaveState(chatMetadataObject(ctx), true);
    if (state)
        state.allGen += 1;
}
function chatOwnerPending(ctx, ownerKey) {
    const state = chatSaveState(chatMetadataObject(ctx));
    return !!state && (state.allGen !== state.savedGen || state.pending.has(ownerKey));
}
function chatOwnerConfirmedInFile(ctx, ownerKey, owner) {
    const parsed = parseChatOwnerKey(ownerKey);
    if (!parsed)
        return false;
    const copies = [];
    const real = messageForOwner(ctx, parsed.index, null);
    const cell = real ? readMessageRecord(real, parsed.swipe) : undefined;
    if (cell && typeof cell === 'object')
        copies.push(cell);
    const legacy = legacyOwnerRaw(ctx, parsed.index, parsed.swipe);
    if (legacy)
        copies.push(legacy);
    if (!copies.length)
        return false;
    if (owner && !copies.some(raw => raw === owner || String(raw.html || '') === String(owner.html || '')))
        return false;
    return !chatOwnerPending(ctx, ownerKey);
}
function confirmChatSave(request, snapshot) {
    let live = null;
    try {
        live = getContext();
    }
    catch {
        live = null;
    }
    if (!live || live.chat !== request.chat || chatMetadataObject(live) !== request.metadata || chatKey(live) !== request.key)
        return false;
    const state = chatSaveState(request.metadata);
    if (!state || !snapshot)
        return false;
    const saved = {};
    for (const [key, entry] of snapshot.pending) {
        if (state.pending.get(key) !== entry)
            continue;
        state.pending.delete(key);
        if (entry.record?.html && entry.slot)
            saved[entry.slot] = entry.record;
    }
    if (state.allGen === snapshot.allGen)
        state.savedGen = snapshot.allGen;
    if (Object.keys(saved).length) {
        try {
            shelfDrop(slot => Object.prototype.hasOwnProperty.call(saved, slot));
        }
        catch { }
        try {
            clearSavedIndependentOutputNotices({ ...readStore(), ...saved });
        }
        catch { }
    }
    return true;
}
export function independentHistoryDurable(base, states) {
    if (faceSwipeSnapshotStored(base, states))
        return true;
    const match = /^(.+):(\d+):(\d+)$/.exec(String(base || ''));
    if (!match)
        return false;
    let ctx = null;
    try {
        ctx = getContext();
    }
    catch {
        ctx = null;
    }
    let mine = false;
    try {
        mine = !!ctx && (match[1] === chatKey(ctx) || match[1] === legacyChatKey(ctx));
    }
    catch {
        mine = false;
    }
    if (!mine)
        return false;
    const index = Number(match[2]), swipe = Number(match[3]);
    const copies = fileCopiesForOwner(ctx, index, { swipe_id: swipe });
    if (!copies.length || copies[0].deleted === true || chatOwnerPending(ctx, chatOwnerKey(index, swipe)))
        return false;
    const want = Object.entries(states || {}).map(([face, state]) => [face, JSON.stringify(compactSwipeState(state))]);
    return copies.some(raw => want.every(([face, signature]) => JSON.stringify(compactSwipeState(raw.faceSwipes?.[face])) === signature));
}
export async function migrateLocalStoresToArchive() {
    if (!globalThis.indexedDB || typeof localStorage === 'undefined')
        return false;
    try {
        if (localStorage.getItem(LOCAL_TO_ARCHIVE_MIGRATION_KEY) === '1')
            return false;
    }
    catch {
        return false;
    }
    let complete = true;
    try {
        for (const [slot, record] of Object.entries(legacyOutputStore())) {
            const parsed = parseSlotKey(slot);
            if (!parsed || !record?.html || !independentRecordWithinBudget(record))
                continue;
            const base = `${parsed.chat}:${parsed.index}:${parsed.swipe}`;
            let row = null;
            try {
                row = await loadFaceSwipeArchive(base);
            }
            catch {
                row = null;
            }
            if (row || faceSwipeArchiveReadState(base) !== 'ready') {
                if (!row && faceSwipeArchiveReadState(base) !== 'ready')
                    complete = false;
                continue;
            }
            let outcome = null;
            try {
                outcome = await saveFaceSwipeArchive(base, { ...record, sourceHash: String(record.sourceHash || parsed.sourceHash || '') });
            }
            catch {
                outcome = null;
            }
            if (!outcome?.saved)
                complete = false;
        }
        for (const [slot, entries] of Object.entries(legacyHistoryStore().slots || {})) {
            const list = (Array.isArray(entries) ? entries : []).map(normalizeHistoryEntry).filter(Boolean);
            if (!list.length)
                continue;
            let ok = false;
            try {
                ok = await saveHistoryArchive(slot, list);
            }
            catch {
                ok = false;
            }
            if (!ok)
                complete = false;
        }
    }
    catch {
        complete = false;
    }
    if (complete) {
        try {
            localStorage.setItem(LOCAL_TO_ARCHIVE_MIGRATION_KEY, '1');
        }
        catch { }
    }
    return complete;
}
const SAFE_SAVE_DELAY_MS = 2500;
const SAFE_SAVE_RETRY_MS = 4000;
const SAFE_SAVE_GIVE_UP_MS = 30 * 60 * 1000;
const SAFE_SAVE_SLOW_AFTER_MS = 120000;
const SAFE_SAVE_SLOW_RETRY_MS = 10000;
let safeSaveTimer = null;
let safeSaveRequest = null;
export function requestSafeChatSave(ctx, index, msg, reason = '') {
    if (!['saveChat', 'saveMetadata', 'saveMetadataDebounced'].some(name => typeof ctx?.[name] === 'function') || !Array.isArray(ctx?.chat) || !ctx.chat.length)
        return false;
    const metadata = chatMetadataObject(ctx);
    if (!metadata || ctx.chat[Number(index)] !== msg)
        return false;
    const pendingReasons = safeSaveRequest && safeSaveRequest.chat === ctx.chat ? safeSaveRequest.reasons || [] : [];
    const reasons = [...new Set([...pendingReasons, String(reason || '')].filter(Boolean))].slice(-6);
    const request = { chat: ctx.chat, metadata, key: chatKey(ctx), length: ctx.chat.length, index: Number(index), msg, since: Date.now(), reason: String(reason || ''), reasons };
    safeSaveRequest = request;
    if (safeSaveTimer)
        clearTimeout(safeSaveTimer);
    safeSaveTimer = setTimeout(runSafeChatSave, SAFE_SAVE_DELAY_MS);
    return true;
}
function runSafeChatSave() {
    safeSaveTimer = null;
    const request = safeSaveRequest;
    if (!request)
        return;
    let live = null;
    try {
        live = getContext();
    }
    catch {
        live = null;
    }
    const sameChat = !!live && live.chat === request.chat && chatMetadataObject(live) === request.metadata && chatKey(live) === request.key;
    const loaded = sameChat && live.chat.length >= request.length && live.chat[request.index] === request.msg;
    if (!sameChat || !loaded) {
        safeSaveRequest = null;
        return;
    }
    let generating = true;
    try {
        generating = hostGenerationLooksActive();
    }
    catch {
        generating = true;
    }
    if (generating) {
        const waited = Date.now() - request.since;
        if (waited < SAFE_SAVE_GIVE_UP_MS)
            safeSaveTimer = setTimeout(runSafeChatSave, waited < SAFE_SAVE_SLOW_AFTER_MS ? SAFE_SAVE_RETRY_MS : SAFE_SAVE_SLOW_RETRY_MS);
        else
            safeSaveRequest = null;
        return;
    }
    safeSaveRequest = null;
    const state = chatSaveState(request.metadata);
    const snapshot = state ? { pending: new Map(state.pending), allGen: state.allGen } : null;
    let saving = null;
    try {
        try {
            noteRabbitMirrorChatSave(request.reasons?.length ? request.reasons.join(__rmT("jvk")) : (request.reason || __rmT("ni2SEPTw")));
        }
        catch { }
        if (typeof live.saveChat === 'function')
            saving = live.saveChat();
        else if (typeof live.saveMetadata === 'function')
            saving = live.saveMetadata();
        else
            live.saveMetadataDebounced();
    }
    catch (error) {
        console.debug(__rmT("0ntRcB.fj8nRJx729d5YYO5uuIJ1Sxz9LaHIHc3rSe6M3XJ4qG22xaqQJxoXtq536xKktt8AZRsrEf"), error);
        return;
    }
    if (saving && typeof saving.then === 'function') {
        Promise.resolve(saving).then(() => confirmChatSave(request, snapshot), error => console.debug(__rmT("W9_mcaMXA_XkYyfBxstcFbBe.VbPkXejy7nOV5aNOc4oL4UWFVYN7muXPWIExP7Cjb2QybVEqqLjOXhhlTy6imfi6FA.zh"), error));
    }
}
function chatOwnerKey(index, swipe = 0) {
    const i = Number(index), s = Number(swipe);
    return Number.isInteger(i) && i >= 0 && Number.isInteger(s) && s >= 0 ? `${i}:${s}` : '';
}
function parseChatOwnerKey(value = '') {
    const match = String(value || '').match(/^(\d+):(\d+)$/);
    if (!match)
        return null;
    return { index: Number(match[1]), swipe: Number(match[2]) };
}
export function persistedOwnerForMessage(ctx, index, msg) {
    const swipe = swipeId(msg);
    const key = chatOwnerKey(index, swipe);
    if (!key)
        return null;
    const cell = ownerCell(ctx, index, swipe, msg);
    if (!cell)
        return null;
    if (cell.value.deleted === true)
        return deletedMarkerOf(cell.value);
    return compactChatPersistedRecord(cell.value);
}
export function chatMovedOwners(ctx) {
    const moved = readChatOutputMetadata(ctx)?.moved || {};
    return Object.entries(moved).map(([hash, record]) => ({ hash, record })).filter(entry => entry.record?.html);
}
export function saveMovedOwner(ctx, record) {
    const metadata = chatMetadataObject(ctx);
    if (!metadata)
        return false;
    const hash = String(record?.sourceHash || record?.bodyHash || '').trim();
    const compact = compactChatPersistedRecord(record);
    if (!/^[0-9a-z]{1,64}$/i.test(hash) || !compact?.html)
        return false;
    let state = metadata[CHAT_OUTPUT_METADATA_KEY];
    if (!state || typeof state !== 'object' || !state.owners || typeof state.owners !== 'object')
        state = emptyChatOutputMetadata();
    const moved = { ...(state.moved && typeof state.moved === 'object' ? state.moved : {}), [hash]: compact };
    state.moved = Object.fromEntries(Object.entries(moved).sort((a, b) => Number(b[1]?.ts || 0) - Number(a[1]?.ts || 0)).slice(0, MOVED_OWNER_LIMIT));
    if (!state.moved[hash])
        return false;
    state.version = CHAT_OUTPUT_METADATA_SCHEMA;
    metadata[CHAT_OUTPUT_METADATA_KEY] = state;
    saveChatOutputMetadata(ctx);
    return true;
}
export function dropMovedOwner(ctx, hash) {
    const metadata = chatMetadataObject(ctx);
    const state = metadata?.[CHAT_OUTPUT_METADATA_KEY];
    if (!state?.moved?.[hash])
        return false;
    delete state.moved[hash];
    saveChatOutputMetadata(ctx);
    return true;
}
export function chatPersistedOwnerKeys(ctx) {
    const keys = new Set(Object.keys(chatMetadataObject(ctx)?.[CHAT_OUTPUT_METADATA_KEY]?.owners || {}));
    for (const { m, i } of assistantMessages(ctx))
        for (const { swipe } of messageRecordSwipes(m))
            keys.add(chatOwnerKey(i, swipe));
    return [...keys].map(parseChatOwnerKey).filter(Boolean);
}
export function chatPersistedOwnerEntries(ctx) {
    const entries = [];
    for (const parsed of chatPersistedOwnerKeys(ctx)) {
        const record = persistedOwnerForMessage(ctx, parsed.index, { swipe_id: parsed.swipe });
        if (record && !record.deleted && record.html)
            entries.push({ ...parsed, record });
    }
    return entries;
}
export function earliestMirrorEvidenceFloor(ctx, store = null) {
    const chat = Array.isArray(ctx?.chat) ? ctx.chat : null;
    if (!chat)
        return -1;
    let first = Infinity;
    const note = value => { const i = Number(value); if (Number.isInteger(i) && i >= 0 && i < first)
        first = i; };
    for (let i = 0; i < chat.length && i < first; i += 1) {
        const msg = chat[i];
        const extras = [msg?.extra, ...(Array.isArray(msg?.swipe_info) ? msg.swipe_info.map(info => info?.extra) : [])];
        if (extras.some(extra => extra && typeof extra === 'object' && extra.rabbitMirrorOwnerLineage))
            note(i);
    }
    const owners = chatMetadataObject(ctx)?.[CHAT_OUTPUT_METADATA_KEY]?.owners;
    for (const key of Object.keys(owners && typeof owners === 'object' ? owners : {}))
        note(parseChatOwnerKey(key)?.index);
    for (let i = 0; i < chat.length && i < first; i += 1)
        if (messageRecordSwipes(chat[i]).length)
            note(i);
    const prefix = `${chatKey(ctx)}:`;
    for (const slot of Object.keys(store && typeof store === 'object' ? store : {}))
        if (slot.startsWith(prefix))
            note(String(slot.slice(prefix.length)).split(':')[0]);
    return first === Infinity ? -1 : first;
}
export function floorMirrorEvidence(ctx, index, msg, store = null) {
    if (!msg)
        return false;
    const extras = [msg.extra, ...(Array.isArray(msg.swipe_info) ? msg.swipe_info.map(info => info?.extra) : [])];
    if (extras.some(extra => extra && typeof extra === 'object' && extra.rabbitMirrorOwnerLineage && extra.rabbitMirrorOwnerLineage.revoked !== true))
        return true;
    const persisted = persistedOwnerForMessage(ctx, index, msg);
    if (persisted?.deleted)
        return false;
    if (persisted?.html)
        return true;
    const prefix = `${chatKey(ctx)}:${Number(index)}:${swipeId(msg)}:`;
    return Object.keys(store && typeof store === 'object' ? store : {}).some(slot => slot.startsWith(prefix));
}
const historyHydrations = new WeakMap();
function historyLoadsFor(ctx) {
    if (!Array.isArray(ctx?.chat))
        return new Map();
    let loads = historyHydrations.get(ctx.chat);
    if (!loads) {
        loads = new Map();
        historyHydrations.set(ctx.chat, loads);
    }
    return loads;
}
export function independentHistoryLoaded(ctx, index, msg) {
    const state = independentHistoryReadState(ctx, index, msg);
    return state === 'ready' || state === 'error';
}
export function independentHistoryReadState(ctx, index, msg) {
    if (!globalThis.indexedDB)
        return 'ready';
    return historyLoadsFor(ctx).get(messageBaseSlotKey(ctx, index, msg))?.state || 'idle';
}
export function restoreIndependentHistory(ctx, index, msg, { retry = false } = {}) {
    const base = messageBaseSlotKey(ctx, index, msg), loads = historyLoadsFor(ctx);
    const previous = loads.get(base);
    if (previous && (!previous.done || !retry))
        return previous.promise;
    const entry = { done: false, state: 'loading', promise: null };
    loads.set(base, entry);
    const observed = observeMessageSourceRevision(ctx, index, msg);
    entry.promise = faceSwipeArchiveRemapSettled().then(() => loadFaceSwipeArchive(base, { retry })).then(row => {
        entry.state = faceSwipeArchiveReadState(base) === 'error' ? 'error' : 'ready';
        if (loads.get(base) !== entry)
            return;
        const live = getContext();
        if (live.chat !== ctx.chat || live.chat?.[index] !== msg || messageBaseSlotKey(live, index, msg) !== base
            || observeMessageSourceRevision(live, index, msg).sourceHash !== observed.sourceHash)
            return;
        const current = persistedOwnerForMessage(ctx, index, msg);
        if (current?.deleted)
            return;
        if (row?.record?.deleted) {
            const tombHash = String(row.record.sourceHash || '');
            if (tombHash && (tombHash === observed.sourceHash || tombHash === observed.bodyHash)
                && (!current || Number(row.record.ts) >= Number(current.ts)))
                writePersistedOwner(ctx, index, msg, row.record);
            return;
        }
        if (current?.faceSwipes && savedRecordMatchesObserved(current, observed))
            restoreFaceSwipeSnapshot(base, current.faceSwipes);
        if (!row?.record?.html || !savedRecordMatchesObserved(row.record, observed))
            return;
        const stored = savedIndependentRecordForOwner(ctx, index, msg, readStore(), observed);
        const archiveTime = Number(row.record.ts || 0), storedTime = Number(stored?.ts || 0);
        if (!stored || archiveTime > storedTime || (archiveTime === storedTime
            && Number(row.record.ownerLineage?.observedAt || 0) >= Number(stored.ownerLineage?.observedAt || 0))) {
            restoreFaceSwipeSnapshot(base, row.states);
            const restored = compactChatPersistedRecord({ ...row.record, faceSwipes: snapshotFaceSwipes(base) });
            if (!restored)
                return;
            writePersistedOwner(ctx, index, msg, restored);
            const store = readStore();
            saveRecordForSlot(store, observed.slot, restored);
            writeStore(store);
        }
    }).catch(() => { entry.state = 'error'; }).finally(() => { entry.done = true; });
    return entry.promise;
}
export function writePersistedOwner(ctx, index, msg, value, { overwrite = true, swipe } = {}) {
    const ownerSwipe = Number.isInteger(swipe) && swipe >= 0 ? swipe : swipeId(msg);
    const ownerKey = chatOwnerKey(index, ownerSwipe);
    if (!ownerKey)
        return false;
    const real = messageForOwner(ctx, index, msg);
    if (!real)
        return false;
    if (swipePending(real, ownerSwipe))
        return false;
    const current = ownerCell(ctx, index, ownerSwipe, real);
    const existingCell = current?.source === 'message' ? current.value : undefined;
    const existing = current?.value || null;
    if (!overwrite && existing)
        return false;
    const base = `${chatKey(ctx)}:${index}:${ownerSwipe}`;
    let next = null;
    if (value?.deleted === true)
        next = { deleted: true, ts: Number(value.ts || Date.now()), runtime: RUNTIME_VERSION, sourceHash: String(value.sourceHash || swipeBodyFingerprint(real, ownerSwipe) || existing?.sourceHash || existing?.bodyHash || '') };
    else {
        if (value.faceSwipes || existing?.faceSwipes)
            restoreFaceSwipeSnapshot(base, value.faceSwipes || existing.faceSwipes);
        next = compactChatPersistedRecord({ ...value, faceSwipes: snapshotFaceSwipes(base) });
    }
    if (!next)
        return false;
    const savedSlot = chatPersistenceSlot(ctx, index, ownerSwipe, next);
    const unchanged = !!existingCell && typeof existingCell === 'object' && JSON.stringify(existingCell) === JSON.stringify(next);
    if (!next.deleted && savedSlot && !unchanged)
        shelfPut(savedSlot, next);
    else if (next.deleted)
        shelfDrop(slot => slot.startsWith(`${base}:`) || slot === base);
    void saveFaceSwipeArchive(base, next).then(({ saved, row }) => {
        if (saved) {
            if (savedSlot)
                shelfDrop(savedSlot);
            clearSavedIndependentOutputNotices({ ...readStore(), [savedSlot]: row.record });
            clearIndependentHistorySaveNotice(savedSlot, row.states);
            return;
        }
        if (next.deleted)
            return;
        const inFile = savedInChatFile(ctx, index, real, next.html, String(next.sourceHash || ''));
        if (!inFile) {
            if (savedSlot && persistOutputFallback(savedSlot, next))
                clearSavedIndependentOutputNotices();
            else
                showIndependentUnsavedOutput(next, savedSlot);
        }
        if (!inFile && Object.values(row.states || {}).some(state => state.versions?.length > 1))
            showIndependentUnsavedOutput(next, savedSlot, { history: row.states, historySlot: base });
    }).catch(() => { });
    if (unchanged)
        return false;
    if (!writeMessageRecord(real, ownerSwipe, next)) {
        if (next.deleted && markLegacyOwnerDeleted(ctx, index, ownerSwipe, next)) {
            markChatOwnerPending(ctx, ownerKey, null, savedSlot);
            return true;
        }
        return false;
    }
    if (next.deleted)
        markLegacyOwnerDeleted(ctx, index, ownerSwipe, next);
    markChatOwnerPending(ctx, ownerKey, next.deleted ? null : value, savedSlot);
    return true;
}
function swipeCachePrefixes(ctx, index, swipe) {
    const prefixes = [];
    try {
        prefixes.push(`${chatKey(ctx)}:${index}:${swipe}`);
    }
    catch { }
    try {
        const legacy = legacyChatKey(ctx);
        if (legacy)
            prefixes.push(`${legacy}:${index}:${swipe}`);
    }
    catch { }
    return [...new Set(prefixes.filter(Boolean))];
}
function slotBelongsToSwipe(slot, prefixes) {
    const text = String(slot || '');
    return prefixes.some(prefix => text === prefix || text.startsWith(`${prefix}:`));
}
export function deleteChatSwipeTheater(ctx, index, swipe) {
    const msg = Array.isArray(ctx?.chat) ? ctx.chat[index] : null;
    if (!msg || msg.is_user === true)
        return { ok: false, reason: 'missing' };
    const swipeIndex = Number(swipe);
    if (!Number.isInteger(swipeIndex) || swipeIndex < 0)
        return { ok: false, reason: 'swipe' };
    const prefixes = swipeCachePrefixes(ctx, index, swipeIndex);
    const historySlots = new Set();
    try {
        const owner = rawOwnerForKey(ctx, index, swipeIndex);
        const slot = owner && !owner.deleted ? chatPersistenceSlot(ctx, index, swipeIndex, owner) : '';
        if (slot)
            historySlots.add(slot);
    }
    catch { }
    try {
        const store = readStore();
        let changed = false;
        for (const slot of Object.keys(store))
            if (slotBelongsToSwipe(slot, prefixes)) {
                historySlots.add(slot);
                delete store[slot];
                changed = true;
            }
        if (changed)
            writeStore(store);
    }
    catch (error) {
        console.warn(__rmT("0ntRcB.fj8nRJx729d5YYO5uuIJ1Sxz9LaHIHc3rH1Nf.nzf8BXPpggc9hKUATnLjOrD4x8XUTlrEf"), error);
    }
    try {
        const history = readHistoryStore();
        let changed = false;
        for (const slot of Object.keys(history.slots || {}))
            if (slotBelongsToSwipe(slot, prefixes)) {
                historySlots.add(slot);
                delete history.slots[slot];
                changed = true;
            }
        if (changed)
            writeHistoryStore(history);
    }
    catch (error) {
        console.warn(__rmT("0ntRcB.fj8nRJx729d5YYO5uuIJ1Sxz9LaHIHc3rH1Nf.nzf8BXPpggc9hmtFs5SZZ9AV78XUTlrEf"), error);
    }
    try {
        for (const slot of Object.keys(legacyHistoryStore().slots || {}))
            if (slotBelongsToSwipe(slot, prefixes))
                historySlots.add(slot);
    }
    catch { }
    for (const slot of historySlots) {
        try {
            void dropHistoryArchive(slot).catch(() => false);
        }
        catch { }
    }
    try {
        remapFaceSwipeSlots(slot => slotBelongsToSwipe(slot, prefixes) ? null : slot);
    }
    catch (error) {
        console.warn(__rmT("UnX0nRLVcQzumShYaRVSwKc82KFBM7GDygWrKZLNgnTxYX4tTT7bf6kq3HecTFFrf7LxWhiQZ7G"), error);
    }
    try {
        dropLegacyOutputs(slot => slotBelongsToSwipe(slot, prefixes));
    }
    catch { }
    try {
        dropLegacyHistory(slot => slotBelongsToSwipe(slot, prefixes));
    }
    catch { }
    try {
        dropLegacyFaceSwipeKeys(slot => slotBelongsToSwipe(slot, prefixes));
    }
    catch { }
    for (const prefix of prefixes) {
        try {
            clearOwnerLockForBase(prefix);
        }
        catch { }
    }
    const written = writePersistedOwner(ctx, index, msg, { deleted: true }, { overwrite: true, swipe: swipeIndex });
    const marked = rawOwnerForKey(ctx, index, swipeIndex)?.deleted === true;
    if (!written && !marked)
        return { ok: false, reason: 'save' };
    requestSafeChatSave(ctx, index, msg);
    return { ok: true, swipe: swipeIndex, current: swipeId(msg) === swipeIndex };
}
function fileCopiesForOwner(ctx, index, msg) {
    const swipe = swipeId(msg);
    const copies = [];
    const real = messageForOwner(ctx, index, msg);
    const cell = real && Array.isArray(ctx?.chat) && ctx.chat[Number(index)] === real ? readMessageRecord(real, swipe) : undefined;
    if (cell && typeof cell === 'object')
        copies.push(cell);
    const legacy = legacyOwnerRaw(ctx, index, swipe);
    if (legacy)
        copies.push(legacy);
    return copies;
}
export function savedInChatFile(ctx, index, msg, html, sourceHash = '') {
    const key = chatOwnerKey(index, swipeId(msg));
    if (!key || !html)
        return false;
    if (typeof ctx?.saveMetadataDebounced !== 'function')
        return false;
    const copies = fileCopiesForOwner(ctx, index, msg);
    if (!copies.length || copies[0].deleted === true)
        return false;
    if (chatOwnerPending(ctx, key))
        return false;
    return copies.some(raw => raw.deleted !== true && String(raw.html || '') === String(html) && (!sourceHash || String(raw.sourceHash || '') === String(sourceHash)));
}
export function chatOwnerHasRecordVersion(ctx, index, msg, record) {
    const key = chatOwnerKey(index, swipeId(msg));
    if (!key || !record?.html)
        return false;
    const copies = fileCopiesForOwner(ctx, index, msg);
    if (!copies.length || copies[0].deleted === true)
        return false;
    return sameIndependentRecordVersion(copies[0], record);
}
const ARCHIVE_RETRY_MS = 3 * 60 * 1000;
const archiveRetryAt = new Map();
export function persistedOwnerUpToDate(ctx, index, msg, record) {
    if (!chatOwnerHasRecordVersion(ctx, index, msg, record))
        return false;
    if (!globalThis.indexedDB)
        return true;
    const base = messageBaseSlotKey(ctx, index, msg);
    if (faceSwipeArchiveRecordStored(base, record) || faceSwipeArchiveWritePending(base))
        return true;
    const now = Date.now();
    if (now - (archiveRetryAt.get(base) || 0) < ARCHIVE_RETRY_MS)
        return true;
    archiveRetryAt.delete(base);
    archiveRetryAt.set(base, now);
    while (archiveRetryAt.size > 400)
        archiveRetryAt.delete(archiveRetryAt.keys().next().value);
    return false;
}
export function writtenToChatMetadata(ctx, index, msg, html, sourceHash = '') {
    const key = chatOwnerKey(index, swipeId(msg));
    if (!key || !html)
        return false;
    if (typeof ctx?.saveMetadataDebounced !== 'function')
        return false;
    const copies = fileCopiesForOwner(ctx, index, msg);
    if (!copies.length || copies[0].deleted === true)
        return false;
    return copies.some(raw => raw.deleted !== true && String(raw.html || '') === String(html) && (!sourceHash || String(raw.sourceHash || '') === String(sourceHash)));
}
export function chatPersistenceSlot(ctx, index, swipe, record) {
    const sourceHash = String(record?.sourceHash || record?.bodyHash || '').trim();
    return sourceHash ? `${chatKey(ctx)}:${Number(index)}:${Number(swipe)}:${sourceHash}` : '';
}
function mergeChatOutputsIntoLocalStore(ctx, store) {
    let storeChanged = false;
    let metadataChanged = false;
    for (const owner of chatPersistedOwnerKeys(ctx)) {
        const ownerKey = chatOwnerKey(owner.index, owner.swipe);
        const raw = rawOwnerForKey(ctx, owner.index, owner.swipe);
        if (!raw)
            continue;
        const base = `${chatKey(ctx)}:${owner.index}:${owner.swipe}`;
        if (raw?.deleted === true) {
            clearOwnerLockForBase(base);
            continue;
        }
        let record = compactChatPersistedRecord(raw);
        if (!record?.html || !independentStoredHtmlRestorable(record.html))
            continue;
        const slot = chatPersistenceSlot(ctx, owner.index, owner.swipe, record);
        if (!slot)
            continue;
        if (!record.initialHtml && interactionStatePollutionScore(record.html) > 0)
            record = normalizeSavedInteractionRecord(record, slot);
        const existing = store?.[slot];
        const existingReady = existing?.html && independentStoredHtmlRestorable(existing.html) ? compactChatPersistedRecord(existing) : null;
        const localIsNewer = !!existingReady && (Number(existingReady.ts || 0) > Number(record.ts || 0)
            || (Number(existingReady.ts || 0) === Number(record.ts || 0)
                && Number(existingReady.ownerLineage?.observedAt || 0) > Number(record.ownerLineage?.observedAt || 0)));
        if (localIsNewer) {
            if (String(existingReady.html || '') !== String(record.html || '') || JSON.stringify(existingReady.ownerLineage) !== JSON.stringify(record.ownerLineage)) {
                const real = messageForOwner(ctx, owner.index, null);
                if (real && writeMessageRecord(real, owner.swipe, existingReady)) {
                    metadataChanged = true;
                    markChatOwnerPending(ctx, ownerKey);
                }
            }
        }
        else if (!existingReady || String(existingReady.html || '') !== String(record.html || '') || JSON.stringify(existingReady.ownerLineage) !== JSON.stringify(record.ownerLineage)) {
            saveRecordForSlot(store, slot, record, { dropLegacy: false });
            storeChanged = true;
        }
        setOwnerLockForBase(base, slot, String((localIsNewer ? existingReady : record)?.sourceHash || (localIsNewer ? existingReady : record)?.bodyHash || ''));
    }
    return { storeChanged, metadataChanged };
}
function migrateLegacyLocalOutputsToChatMetadata(ctx, store) {
    if (!Array.isArray(ctx?.chat))
        return { metadataChanged: false, storeChanged: false };
    let metadataChanged = false;
    let storeChanged = false;
    for (const { m, i } of assistantMessages(ctx)) {
        const ownerKey = chatOwnerKey(i, swipeId(m));
        if (!ownerKey)
            continue;
        const cell = ownerCell(ctx, i, swipeId(m), m);
        if (cell && cell.source !== 'legacy')
            continue;
        if (swipePending(m, swipeId(m)))
            continue;
        const observed = observeMessageSourceRevision(ctx, i, m);
        const base = messageBaseSlotKey(ctx, i, m);
        const locked = lockedIndependentRecordForBase(base, store);
        let record = locked?.record?.html && savedRecordMatchesObserved(locked.record, observed) ? locked.record : null;
        if (!record?.html) {
            const recovered = recoverSavedRecord(store, observed.slot, observed);
            if (recovered.storeChanged)
                storeChanged = true;
            record = recovered.saved || null;
        }
        const compact = compactChatPersistedRecord(record);
        if (!compact?.html || !independentStoredHtmlRestorable(compact.html) || !savedRecordMatchesObserved(compact, observed))
            continue;
        if (writeMessageRecord(m, swipeId(m), compact)) {
            metadataChanged = true;
            markChatOwnerPending(ctx, ownerKey);
        }
    }
    return { metadataChanged, storeChanged };
}
export function synchronizeIndependentChatPersistence(ctx, store) {
    const imported = mergeChatOutputsIntoLocalStore(ctx, store);
    const migrated = migrateLegacyLocalOutputsToChatMetadata(ctx, store);
    if (imported.metadataChanged || migrated.metadataChanged) {
        try {
            const last = ctx.chat.length - 1;
            if (last >= 0)
                requestSafeChatSave(ctx, last, ctx.chat[last], __rmT("HEHMRKKaXuUMtfRhK53w9l0br6Bvuh"));
        }
        catch { }
    }
    return {
        storeChanged: !!(imported.storeChanged || migrated.storeChanged),
        metadataChanged: !!(imported.metadataChanged || migrated.metadataChanged),
    };
}
function independentContextChatMetadata(ctx) {
    const source = ctx?.chatMetadata || globalThis.chat_metadata || null;
    if (!source || typeof source !== 'object')
        return source;
    const copy = { ...source };
    delete copy[CHAT_OUTPUT_METADATA_KEY];
    return copy;
}
export function migrateLegacyDeletedRecords() {
    const store = readStore();
    let changed = false;
    for (const [key, value] of Object.entries(store)) {
        if (!value?.deleted)
            continue;
        if (value?.html) {
            const next = { ...value };
            delete next.deleted;
            store[key] = next;
        }
        else
            delete store[key];
        changed = true;
    }
    if (changed)
        writeStore(store);
}
export function readApiProfileStore() { try {
    const v = JSON.parse(localStorage.getItem(API_PROFILE_STORE_KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
}
catch {
    return {};
} }
export function writeApiProfileStore(v) { try {
    localStorage.setItem(API_PROFILE_STORE_KEY, JSON.stringify(v));
}
catch { } }
export function apiProfileKey(st) { const connectionId = normalizeIndependentConnectionText(st?.independentConnectionProfileId, 160); const transport = connectionId ? `st:${connectionId}` : normalizeBase(st?.independentApiBaseUrl || ''); const advanced = st?.independentAdvancedEnabled === true ? independentAdvancedOptionsSignature(st) : ''; return `${transport}|${String(st?.independentApiModel || '')}${advanced ? `|advanced:${advanced}` : ''}`; }
export function normalizedConfiguredTemperature(st) { const value = Number(st?.independentApiTemperature); return Number.isFinite(value) ? Math.max(0, Math.min(2, value)) : 0.8; }
const chatOrderSnapshots = new WeakMap();
export function rememberChatMessageOrder(ctx = getContext()) {
    const chat = Array.isArray(ctx?.chat) ? ctx.chat : null;
    if (!chat)
        return;
    chatOrderSnapshots.set(chat, { key: chatKey(ctx), refs: chat.slice() });
}
function messageDeletionMapper(ctx) {
    const chat = ctx.chat;
    const snapshot = chatOrderSnapshots.get(chat);
    if (!snapshot || snapshot.key !== chatKey(ctx))
        return null;
    if (!chat.length)
        return null;
    const now = new Map(chat.map((msg, index) => [msg, index]));
    const removedAt = snapshot.refs.map((ref, index) => now.has(ref) ? -1 : index).filter(index => index >= 0);
    if (removedAt.length && removedAt[removedAt.length - 1] - removedAt[0] + 1 !== removedAt.length)
        return null;
    let last = -1;
    for (const ref of snapshot.refs) {
        if (!now.has(ref))
            continue;
        const index = now.get(ref);
        if (index <= last)
            return null;
        last = index;
    }
    const known = new Set(snapshot.refs);
    let unknownSeen = false;
    for (const msg of chat) {
        if (!known.has(msg))
            unknownSeen = true;
        else if (unknownSeen)
            return null;
    }
    if (unknownSeen && snapshot.refs.some(ref => !now.has(ref)))
        return null;
    const oldLength = snapshot.refs.length;
    return (index, swipe) => {
        if (index >= oldLength)
            return `${index}:${swipe}`;
        const next = now.get(snapshot.refs[index]);
        return next === undefined ? null : `${next}:${swipe}`;
    };
}
function swipeDeletionMapper(ctx, messageId, deletedSwipe) {
    const msg = ctx.chat?.[messageId];
    if (!msg || !Number.isInteger(messageId) || !Number.isInteger(deletedSwipe) || deletedSwipe < 0)
        return null;
    return (index, swipe) => index !== messageId ? `${index}:${swipe}`
        : swipe === deletedSwipe ? null : swipe > deletedSwipe ? `${index}:${swipe - 1}` : `${index}:${swipe}`;
}
function retargetOwnerRecord(raw, targetKey) {
    if (!raw || typeof raw !== 'object' || raw.deleted === true)
        return raw;
    const [index, swipe] = String(targetKey).split(':').map(Number);
    const lineage = copyIndependentOwnerLineage(raw.ownerLineage);
    return lineage ? { ...raw, ownerLineage: { ...lineage, mesid: index, swipe } } : raw;
}
function remapOwnerMap(owners, mapper) {
    const next = {};
    let changed = false;
    const kept = [];
    const moved = [];
    for (const [ownerKey, raw] of Object.entries(owners || {})) {
        const match = /^(\d+):(\d+)$/.exec(ownerKey);
        if (!match) {
            kept.push([ownerKey, raw]);
            continue;
        }
        const target = mapper(Number(match[1]), Number(match[2]));
        if (target === ownerKey) {
            kept.push([ownerKey, raw]);
            continue;
        }
        changed = true;
        if (target)
            moved.push([target, retargetOwnerRecord(raw, target)]);
    }
    for (const [ownerKey, raw] of kept)
        next[ownerKey] = raw;
    for (const [ownerKey, raw] of moved) {
        if (Object.prototype.hasOwnProperty.call(next, ownerKey))
            return null;
        next[ownerKey] = raw;
    }
    return { next, changed };
}
function remapSlotKeyedObject(object, mapSlot, retarget = value => value) {
    const next = {};
    const moved = [];
    let changed = false;
    for (const [slot, value] of Object.entries(object || {})) {
        const target = mapSlot(slot);
        if (target === slot) {
            if (!Object.prototype.hasOwnProperty.call(next, slot))
                next[slot] = value;
            continue;
        }
        changed = true;
        if (target)
            moved.push([target, retarget(value, target)]);
    }
    for (const [slot, value] of moved)
        next[slot] = value;
    return { next, changed };
}
export function reconcileIndependentChatOwners(ctx = getContext(), options = {}) {
    const result = { changed: false, settled: Promise.resolve() };
    try {
        const chat = Array.isArray(ctx?.chat) ? ctx.chat : null;
        if (!chat)
            return result;
        const mapper = options.kind === 'swipe'
            ? swipeDeletionMapper(ctx, Number(options.messageId), Number(options.swipeId))
            : messageDeletionMapper(ctx);
        if (!mapper) {
            rememberChatMessageOrder(ctx);
            return result;
        }
        const key = chatKey(ctx);
        const mapSlot = slot => {
            const text = String(slot || '');
            if (!text.startsWith(`${key}:`))
                return text;
            const match = /^(\d+):(\d+)(:[^:]*)?$/.exec(text.slice(key.length + 1));
            if (!match)
                return text;
            const target = mapper(Number(match[1]), Number(match[2]));
            return target === null ? null : `${key}:${target}${match[3] || ''}`;
        };
        const metadata = chatMetadataObject(ctx);
        const state = metadata?.[CHAT_OUTPUT_METADATA_KEY];
        const ownersPlan = state && typeof state === 'object' && state.owners && typeof state.owners === 'object' ? remapOwnerMap(state.owners, mapper) : { next: null, changed: false };
        if (ownersPlan === null) {
            console.warn(__rmT("kfw6L7U6T2_c5C8abbNvvjwTuLR3XiF6nXsH24LQGlv_qVJpnlLfcwqj1lRAWli4CXML6IauQ5J0Ss1jyFG72M9PWAT"));
            rememberChatMessageOrder(ctx);
            return result;
        }
        if (ownersPlan.changed) {
            state.owners = ownersPlan.next;
            result.changed = true;
            markAllChatOwnersPending(ctx);
        }
        const bumpEpoch = () => {
            if (!state || typeof state !== 'object')
                return;
            state.remapEpoch = Math.floor(Number(state.remapEpoch) || 0) + 1;
            metadata[CHAT_OUTPUT_METADATA_KEY] = state;
            saveChatOutputMetadata(ctx);
            writeLocalRemapEpoch(key, state.remapEpoch);
        };
        const ownerKeyOfSlot = slot => { const match = /:(\d+):(\d+)(?::[^:]*)?$/.exec(String(slot || '')); return match ? `${match[1]}:${match[2]}` : ''; };
        const retargetValue = (value, slot) => { const ownerKey = ownerKeyOfSlot(slot); return ownerKey ? retargetOwnerRecord(value, ownerKey) : value; };
        const retargetList = (list, slot) => Array.isArray(list) ? list.map(entry => retargetValue(entry, slot)) : list;
        try {
            const plan = remapSlotKeyedObject(readStore(), mapSlot, retargetValue);
            if (plan.changed) {
                writeStore(plan.next);
                result.changed = true;
            }
        }
        catch (error) {
            console.warn(__rmT("WtD6m1d1XI28J_V0nnwpu5bDVXu8DF4JLT.VpopZzfyAIbKQwMrI3KK4AGsvw40P"), error);
        }
        try {
            const history = readHistoryStore();
            const plan = remapSlotKeyedObject(history.slots, mapSlot, retargetList);
            if (plan.changed) {
                writeHistoryStore({ ...history, slots: plan.next });
                result.changed = true;
            }
        }
        catch (error) {
            console.warn(__rmT("WtD6m1d1XI28J_V0nnwpu5bDVXu8DF4JLT.VpopZ1RXsIcvKE9LI3KK4AGsvw40P"), error);
        }
        try {
            if (remapOwnerLockSlots(mapSlot))
                result.changed = true;
        }
        catch (error) {
            console.warn(__rmT("8IJZNwWOYG6TRqZRrIfVGN_4EV5.RmwCuDZ_QN_QsmNPpUXoS0cOr1rlDhpv9k"), error);
        }
        try {
            if (remapFaceSwipeSlots(mapSlot))
                result.changed = true;
        }
        catch (error) {
            console.warn(__rmT("8IJZNwWOYG6TRqZRrIfVGN_4EV5.RmwCuDZ_QN_QM3wuJeu0S0cOr1rlDhpv9k"), error);
        }
        try {
            remapMirrorImageSlots(key, mapper, { kind: options.kind, messageId: options.messageId });
        }
        catch (error) {
            console.warn(__rmT("svWP_vSjDlUhjjh56VUA_lKkgAh21GboqBtzAcXQRNXNOaQBpj8cnJjEpYY"), error);
        }
        if (options.kind === 'swipe') {
            const msg = chat[Number(options.messageId)];
            const extras = new Set([msg?.extra, ...(Array.isArray(msg?.swipe_info) ? msg.swipe_info.map(info => info?.extra) : [])].filter(Boolean));
            for (const extra of extras) {
                const marker = extra?.rabbitMirrorOwnerLineage;
                if (!marker || marker.revoked === true || !Number.isInteger(marker.swipe))
                    continue;
                const target = mapper(Number(options.messageId), marker.swipe);
                if (target)
                    marker.swipe = Number(target.split(':')[1]);
            }
        }
        historyLoadsFor(ctx).clear();
        result.settled = remapFaceSwipeArchive(key, mapSlot, (record, slot) => {
            const match = /:(\d+):(\d+)$/.exec(String(slot || ''));
            return match ? retargetOwnerRecord(record, `${match[1]}:${match[2]}`) : record;
        }).catch(error => { console.warn(__rmT("WtD6m1d1XI28J_V0nnwpu5bDVXu8DF4JLT.VpopZAwFSl67.OQJI3KK4AGsvw40P"), error); });
        if (options.kind !== 'swipe') {
            try {
                result.hostsRestamped = restampExternalHostsAfterMessageDeletion(mapSlot);
            }
            catch (error) {
                console.warn(__rmT("svWP_vSjDlUhjjh56VUA_lKkgAh21GboqBtzAcXQsuLjSLQBpj8cnJjEpYY"), error);
            }
        }
        if (result.changed) {
            bumpEpoch();
            try {
                const last = ctx.chat.length - 1;
                if (last >= 0)
                    requestSafeChatSave(ctx, last, ctx.chat[last], __rmT("4N5rRhTZr_QwyIVC"));
            }
            catch { }
            console.info(`${__rmT("4wdDkYzSH05U09YYKGt1XqLovoxUJCDQQkM3GxiYOd0gak")}${options.kind === 'swipe' ? ' swipe' : __rmT("lgzruT")}${__rmT("Zm1lzaBrTihFK6zBgkzw0KU7mCSn0h4s29E")}`);
        }
    }
    catch (error) {
        console.warn(__rmT("8IJZNwWOYG6TRqZRrIfVGN_4EV5.RmwCuDZ_QN_Qhbi7aVIbS0cOr1rlDhpv9k"), error);
    }
    finally {
        rememberChatMessageOrder(ctx);
    }
    return result;
}
const OWNER_REMAP_EPOCH_KEY = 'rabbit_mirror_owner_remap_epoch_v1';
function readLocalRemapEpochs() { try {
    const value = JSON.parse(localStorage.getItem(OWNER_REMAP_EPOCH_KEY) || '{}');
    return value && typeof value === 'object' ? value : {};
}
catch {
    return {};
} }
function writeLocalRemapEpoch(key, epoch) {
    try {
        const all = readLocalRemapEpochs();
        all[key] = Math.floor(Number(epoch) || 0);
        localStorage.setItem(OWNER_REMAP_EPOCH_KEY, JSON.stringify(all));
    }
    catch { }
}
export function checkOwnerRemapEpoch(ctx = getContext()) {
    try {
        const metadata = chatMetadataObject(ctx);
        if (!metadata || !Array.isArray(ctx?.chat))
            return false;
        const key = chatKey(ctx);
        const fileEpoch = Math.floor(Number(metadata[CHAT_OUTPUT_METADATA_KEY]?.remapEpoch) || 0);
        const localEpoch = Math.floor(Number(readLocalRemapEpochs()[key]) || 0);
        if (fileEpoch === localEpoch)
            return false;
        const prefix = `${key}:`;
        const dropChat = slot => String(slot || '').startsWith(prefix) && /^\d+:\d+(?::[^:]*)?$/.test(String(slot).slice(prefix.length)) ? null : slot;
        try {
            remapFaceSwipeSlots(dropChat);
        }
        catch { }
        try {
            remapOwnerLockSlots(dropChat);
        }
        catch { }
        void remapFaceSwipeArchive(key, dropChat).catch(() => { });
        historyLoadsFor(ctx).clear();
        writeLocalRemapEpoch(key, fileEpoch);
        console.info(__rmT("Ki9u1cO_T63AbYqxIHDyqahAGkQoQUBDvBvHP9gDiO3rRLdNGpsA4R.wk_Dq82K7lBvf3UoqJJqMNQmtx2TqMS8cE7P3xUmJoX8r6w4gTFRzs3M6QYtB0kxtr_jW.68MBpmfADGYSiB6RDc6f_C"));
        return true;
    }
    catch (error) {
        console.warn(__rmT("WtD6m1d1XI28J_V0nnwpu5bDVXu8DF4JLT.VpopZBKoFIsc3UFX87lcqAGsvw40P"), error);
        return false;
    }
}
