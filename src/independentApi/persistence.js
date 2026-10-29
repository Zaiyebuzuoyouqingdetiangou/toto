import { rmT as __rmT } from "../textTable.js?rmv=1.99.21";
import { presentationModeFields } from '../presentationMode.js?rmv=1.99.21';
import { atmosphereSelectionFields } from '../atmosphereChoice.js?rmv=1.99.21';
import { independentAdvancedOptionsSignature } from '../advancedRequestOptions.js?rmv=1.99.21';
import { refreshRabbitMirrorToolsInScope } from '../outputSanitizer.js?rmv=1.99.21';
import { FACE_SWIPE_FULL_MESSAGE, FACE_SWIPE_MAX, canAppendSwipe, selectSwipeIndex, deleteCurrentSwipe, restoreCurrentSwipeInitial, currentSwipeEntry, readFaceSwipe, mutateFaceSwipe, multifaceFacePagerView, snapshotFaceSwipes, compactSwipeState, restoreFaceSwipeSnapshot, faceSwipeSnapshotStored, loadFaceSwipeArchive, saveFaceSwipeArchive, faceSwipeArchiveReadState, faceSwipeArchiveRecordStored, remapFaceSwipeSlots, remapFaceSwipeArchive, faceSwipeArchiveRemapSettled, } from '../swipeVersions.js?rmv=1.99.21';
import { RUNTIME_VERSION, byteLength, getContext, hashText } from './runtime.js?rmv=1.99.21';
import { remapMirrorImageSlots, slimMirrorImagesForQuota, dropMirrorImageCopiesSavedInChat } from '../imageStore.js?rmv=1.99.21';
import { clearEphemeralFaceFailure, hasEphemeralFaceFailure, independentSwipeDetails, independentSwipeFaceIndex, mergeFaceDetailsIntoHtml, independentSwipeSlot, seedIndependentFaceSwipesFromIdentity, writeIndependentOwnerHtml, } from './faceSwipe.js?rmv=1.99.21';
import { API_PROFILE_STORE_KEY, assistantMessages, chatKey, clearOwnerLockForBase, copyIndependentOwnerLineage, lockedIndependentRecordForBase, messageBaseSlotKey, normalizeBase, normalizeIndependentConnectionText, observeMessageSourceRevision, saveRecordForSlot, savedRecordMatchesObserved, savedIndependentRecordForOwner, setOwnerLockForBase, swipeId, remapOwnerLockSlots, hostGenerationLooksActive, legacyChatKey, } from './connection.js?rmv=1.99.21';
import { stampExternalDetailsOwnership, restampExternalHostsAfterMessageDeletion } from './request.js?rmv=1.99.21';
import { copyIndependentReplacementReceipt, ensureExternalTools, extractReadyDetails, independentStoredHtmlRestorable, interactionStatePollutionScore, markExternalDetails, normalizeSavedInteractionRecord, recoverSavedRecord, replaceExternalMultifaceFace, } from './geometry.js?rmv=1.99.21';
import { clearSavedIndependentOutputNotices, externalFaceDetails, resolveIndependentActionIdentity, scheduleIndependentReadyPostprocess, showMultifaceFace, showIndependentUnsavedOutput, clearIndependentHistorySaveNotice } from './mount.js?rmv=1.99.21';
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
const sessionChatOwners = new WeakMap();
function sessionOwners(ctx, create = false) {
    const chat = ctx?.chat;
    if (!Array.isArray(chat))
        return null;
    const key = chatKey(ctx);
    let entry = sessionChatOwners.get(chat);
    if (entry?.key !== key) {
        if (!create)
            return null;
        entry = { key, owners: {} };
        sessionChatOwners.set(chat, entry);
    }
    return entry.owners;
}
export function independentRecordWithinBudget(value) {
    if (!value?.html)
        return false;
    const html = String(value.html || '');
    const initial = String(value.initialHtml || '');
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
export function readStore() { try {
    const v = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
}
catch {
    return {};
} }
function parseSlotKey(slot) {
    const match = /^(.+):(\d+):(\d+):([0-9a-z]+)$/.exec(String(slot || ''));
    return match ? { chat: match[1], index: Number(match[2]), swipe: Number(match[3]), sourceHash: match[4] } : null;
}
function rawOwnerForKey(ctx, index, swipe) {
    const key = chatOwnerKey(index, swipe);
    if (!key)
        return null;
    const raw = chatMetadataObject(ctx)?.[CHAT_OUTPUT_METADATA_KEY]?.owners?.[key];
    const session = sessionOwners(ctx)?.[key];
    if (raw?.deleted === true || session?.deleted === true)
        return { deleted: true };
    const newest = session && (!raw || Number(session.ts || 0) >= Number(raw.ts || 0)) ? session : raw;
    return newest && typeof newest === 'object' ? newest : null;
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
        for (const [slot, entries] of Object.entries(readHistoryStore().slots || {}))
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
        history = readHistoryStore();
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
        history = readHistoryStore();
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
export function readHistoryStore() {
    try {
        const parsed = JSON.parse(localStorage.getItem(HISTORY_STORE_KEY) || 'null');
        if (parsed && typeof parsed === 'object' && parsed.slots && typeof parsed.slots === 'object')
            return parsed;
    }
    catch { }
    return emptyHistoryStore();
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
    const compacted = compactHistoryStore(value);
    try {
        localStorage.setItem(HISTORY_STORE_KEY, JSON.stringify(compacted));
        return true;
    }
    catch {
        const flattened = [];
        for (const [slot, entries] of Object.entries(compacted.slots || {}))
            for (const entry of entries)
                flattened.push({ slot, entry });
        flattened.sort((a, b) => Number(b.entry?.ts || 0) - Number(a.entry?.ts || 0));
        while (flattened.length > 1) {
            flattened.pop();
            const retry = emptyHistoryStore();
            for (const { slot, entry } of flattened)
                (retry.slots[slot] || (retry.slots[slot] = [])).push(entry);
            try {
                localStorage.setItem(HISTORY_STORE_KEY, JSON.stringify(retry));
                warnStorageTrimmed();
                return true;
            }
            catch { }
        }
        warnStorageTrimmed();
        return false;
    }
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
    return entry;
}
export function historyEntriesForSlot(slot) {
    const list = readHistoryStore().slots?.[slot];
    return (Array.isArray(list) ? list : []).map(normalizeHistoryEntry).filter(Boolean).sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0));
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
    if (!ownerKey)
        return false;
    const raw = chatMetadataObject(ctx)?.[CHAT_OUTPUT_METADATA_KEY]?.owners?.[ownerKey];
    if (!raw || (owner && raw !== owner && String(raw.html || '') !== String(owner.html || '')))
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
            clearSavedIndependentOutputNotices({ ...readStore(), ...saved });
        }
        catch { }
    }
    return true;
}
const SAFE_SAVE_DELAY_MS = 2500;
const SAFE_SAVE_RETRY_MS = 4000;
const SAFE_SAVE_GIVE_UP_MS = 30 * 60 * 1000;
const SAFE_SAVE_SLOW_AFTER_MS = 120000;
const SAFE_SAVE_SLOW_RETRY_MS = 10000;
let safeSaveTimer = null;
let safeSaveRequest = null;
export function requestSafeChatSave(ctx, index, msg) {
    if (!['saveChat', 'saveMetadata', 'saveMetadataDebounced'].some(name => typeof ctx?.[name] === 'function') || !Array.isArray(ctx?.chat) || !ctx.chat.length)
        return false;
    const metadata = chatMetadataObject(ctx);
    if (!metadata || ctx.chat[Number(index)] !== msg)
        return false;
    const request = { chat: ctx.chat, metadata, key: chatKey(ctx), length: ctx.chat.length, index: Number(index), msg, since: Date.now() };
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
    const key = chatOwnerKey(index, swipeId(msg));
    if (!key)
        return null;
    const metadata = chatMetadataObject(ctx);
    const raw = metadata?.[CHAT_OUTPUT_METADATA_KEY]?.owners?.[key];
    const session = sessionOwners(ctx)?.[key];
    if (raw?.deleted === true || session?.deleted === true) {
        const removed = raw?.deleted === true ? raw : session;
        return { deleted: true, ts: Number(removed.ts || 0), runtime: String(removed.runtime || RUNTIME_VERSION), sourceHash: String(removed.sourceHash || '') };
    }
    const newest = session && (!raw || Number(session.ts || 0) > Number(raw.ts || 0)
        || (Number(session.ts || 0) === Number(raw.ts || 0)
            && Number(session.ownerLineage?.observedAt || 0) >= Number(raw.ownerLineage?.observedAt || 0))) ? session : raw;
    return newest && typeof newest === 'object' ? compactChatPersistedRecord(newest) : null;
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
export function chatPersistedOwnerEntries(ctx) {
    const keys = new Set([
        ...Object.keys(chatMetadataObject(ctx)?.[CHAT_OUTPUT_METADATA_KEY]?.owners || {}),
        ...Object.keys(sessionOwners(ctx) || {}),
    ]);
    const entries = [];
    for (const key of keys) {
        const parsed = parseChatOwnerKey(key);
        if (!parsed)
            continue;
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
    for (const key of Object.keys(sessionOwners(ctx) || {}))
        note(parseChatOwnerKey(key)?.index);
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
export function writePersistedOwner(ctx, index, msg, value, { overwrite = true } = {}) {
    const metadata = chatMetadataObject(ctx);
    const ownerKey = chatOwnerKey(index, swipeId(msg));
    if (!ownerKey)
        return false;
    const session = sessionOwners(ctx, true);
    let state = metadata?.[CHAT_OUTPUT_METADATA_KEY];
    if (!state || typeof state !== 'object' || !state.owners || typeof state.owners !== 'object')
        state = emptyChatOutputMetadata();
    const existing = session?.[ownerKey] || state.owners?.[ownerKey];
    if (!overwrite && existing)
        return false;
    let next = null;
    if (value?.deleted === true)
        next = { deleted: true, ts: Number(value.ts || Date.now()), runtime: RUNTIME_VERSION, sourceHash: String(value.sourceHash || existing?.sourceHash || existing?.bodyHash || '') };
    else {
        const base = messageBaseSlotKey(ctx, index, msg);
        if (value.faceSwipes || existing?.faceSwipes)
            restoreFaceSwipeSnapshot(base, value.faceSwipes || existing.faceSwipes);
        next = compactChatPersistedRecord({ ...value, faceSwipes: snapshotFaceSwipes(base) });
    }
    if (!next)
        return false;
    if (session)
        session[ownerKey] = next;
    const base = messageBaseSlotKey(ctx, index, msg);
    const savedSlot = chatPersistenceSlot(ctx, index, swipeId(msg), next);
    void saveFaceSwipeArchive(base, next).then(({ saved, row }) => {
        if (saved)
            clearSavedIndependentOutputNotices({ ...readStore(), [savedSlot]: row.record });
        if (saved || faceSwipeSnapshotStored(base, row.states))
            clearIndependentHistorySaveNotice(savedSlot, row.states);
        else if (Object.values(row.states).some(state => state.versions?.length > 1))
            showIndependentUnsavedOutput(next, savedSlot, { history: row.states, historySlot: base });
    }).catch(() => { });
    if (!metadata)
        return !!session;
    if (state.owners?.[ownerKey] && JSON.stringify(state.owners[ownerKey]) === JSON.stringify(next))
        return false;
    state.version = CHAT_OUTPUT_METADATA_SCHEMA;
    state.owners[ownerKey] = next;
    metadata[CHAT_OUTPUT_METADATA_KEY] = state;
    markChatOwnerPending(ctx, ownerKey, next.deleted ? null : value, savedSlot);
    saveChatOutputMetadata(ctx);
    return true;
}
export function savedInChatFile(ctx, index, msg, html, sourceHash = '') {
    const key = chatOwnerKey(index, swipeId(msg));
    if (!key || !html)
        return false;
    if (typeof ctx?.saveMetadataDebounced !== 'function')
        return false;
    const raw = chatMetadataObject(ctx)?.[CHAT_OUTPUT_METADATA_KEY]?.owners?.[key];
    if (!raw || raw.deleted === true || String(raw.html || '') !== String(html))
        return false;
    if (chatOwnerPending(ctx, key))
        return false;
    return !sourceHash || String(raw.sourceHash || '') === String(sourceHash);
}
export function writtenToChatMetadata(ctx, index, msg, html, sourceHash = '') {
    const key = chatOwnerKey(index, swipeId(msg));
    if (!key || !html)
        return false;
    if (typeof ctx?.saveMetadataDebounced !== 'function')
        return false;
    const raw = chatMetadataObject(ctx)?.[CHAT_OUTPUT_METADATA_KEY]?.owners?.[key];
    if (!raw || raw.deleted === true || String(raw.html || '') !== String(html))
        return false;
    return !sourceHash || String(raw.sourceHash || '') === String(sourceHash);
}
export function chatPersistenceSlot(ctx, index, swipe, record) {
    const sourceHash = String(record?.sourceHash || record?.bodyHash || '').trim();
    return sourceHash ? `${chatKey(ctx)}:${Number(index)}:${Number(swipe)}:${sourceHash}` : '';
}
function mergeChatOutputsIntoLocalStore(ctx, store) {
    const state = readChatOutputMetadata(ctx);
    const metadata = chatMetadataObject(ctx);
    let storeChanged = false;
    let metadataChanged = false;
    for (const [ownerKey, raw] of Object.entries(state.owners || {})) {
        const owner = parseChatOwnerKey(ownerKey);
        if (!owner)
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
                state.owners[ownerKey] = existingReady;
                metadataChanged = true;
                markChatOwnerPending(ctx, ownerKey);
            }
        }
        else if (!existingReady || String(existingReady.html || '') !== String(record.html || '') || JSON.stringify(existingReady.ownerLineage) !== JSON.stringify(record.ownerLineage)) {
            saveRecordForSlot(store, slot, record, { dropLegacy: false });
            storeChanged = true;
        }
        setOwnerLockForBase(base, slot, String((localIsNewer ? existingReady : record)?.sourceHash || (localIsNewer ? existingReady : record)?.bodyHash || ''));
    }
    if (metadataChanged && metadata) {
        metadata[CHAT_OUTPUT_METADATA_KEY] = state;
        saveChatOutputMetadata(ctx);
    }
    return { storeChanged, metadataChanged };
}
function migrateLegacyLocalOutputsToChatMetadata(ctx, store) {
    const metadata = chatMetadataObject(ctx);
    if (!metadata)
        return { metadataChanged: false, storeChanged: false };
    const state = readChatOutputMetadata(ctx);
    let metadataChanged = false;
    let storeChanged = false;
    for (const { m, i } of assistantMessages(ctx)) {
        const ownerKey = chatOwnerKey(i, swipeId(m));
        if (!ownerKey || Object.prototype.hasOwnProperty.call(state.owners, ownerKey))
            continue;
        const observed = observeMessageSourceRevision(ctx, i, m);
        const base = messageBaseSlotKey(ctx, i, m);
        const locked = lockedIndependentRecordForBase(base, store);
        let record = locked?.record || null;
        if (!record?.html) {
            const recovered = recoverSavedRecord(store, observed.slot, observed);
            if (recovered.storeChanged)
                storeChanged = true;
            record = recovered.saved || null;
        }
        const compact = compactChatPersistedRecord(record);
        if (!compact?.html || !independentStoredHtmlRestorable(compact.html))
            continue;
        state.owners[ownerKey] = compact;
        metadataChanged = true;
        markChatOwnerPending(ctx, ownerKey);
    }
    if (metadataChanged) {
        metadata[CHAT_OUTPUT_METADATA_KEY] = state;
        saveChatOutputMetadata(ctx);
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
                requestSafeChatSave(ctx, last, ctx.chat[last]);
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
        const session = sessionOwners(ctx);
        const sessionPlan = session ? remapOwnerMap(session, mapper) : { next: null, changed: false };
        if (ownersPlan === null || sessionPlan === null) {
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
        if (sessionPlan.changed) {
            for (const ownerKey of Object.keys(session))
                delete session[ownerKey];
            Object.assign(session, sessionPlan.next);
            result.changed = true;
        }
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
                    requestSafeChatSave(ctx, last, ctx.chat[last]);
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
