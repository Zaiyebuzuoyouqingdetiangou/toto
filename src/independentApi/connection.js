import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=1.99.20";
import { isRabbitMirrorManagedChatSurface, getRabbitMirrorMountedMessages } from '../hostCompatibility.js?rmv=1.99.20';
import { WORLD_INFO_BOOK_NAME_MAX_CHARS, getSettings, normalizeIndependentContextExcludedTags, updateSettings, } from '../settings.js?rmv=1.99.20';
import { fetchRabbitMirrorIndependentCompletion } from '../independentSecurityGuard.js?rmv=1.99.20';
import { buildIndependentAdvancedCarrier, applyIndependentAdvancedExclusions } from '../advancedRequestOptions.js?rmv=1.99.20';
import { describeBatchPlanFailure } from '../externalWorldBook/errors.js?rmv=1.99.20';
import { describeRabbitMirrorStorageUsage, getCurrentChatKey } from '../storage.js?rmv=1.99.20';
import { rememberIndependentTransportDiagnostic } from '../transportDiagnostics.js?rmv=1.99.20';
import { CONTEXT_TOTAL_BUDGET, CONTEXT_TRANSCRIPT_BUDGET, RUNTIME_VERSION, getContext, hashText, } from './runtime.js?rmv=1.99.20';
import { HOST_GENERATION_EVENT_HINT_MS, operationEpochForBase } from './flights.js?rmv=1.99.20';
import { OWNER_LOCK_STORE_KEY, apiProfileKey, historyEntriesForSlot, normalizedConfiguredTemperature, persistedOwnerForMessage, readApiProfileStore, readStore, writeApiProfileStore, writePersistedOwner, writeStore, } from './persistence.js?rmv=1.99.20';
import { hasExplicitSourceReplacementEvidence, independentStoredHtmlLightRestorable, independentStoredHtmlRestorable, } from './geometry.js?rmv=1.99.20';
import { activeIndependentFlightForBase, messageSourceRevisions, parseMessageIndexFromOwnerKey, passiveObservedIdentity, runtimeMode, showIndependentUnsavedOutput, } from './mount.js?rmv=1.99.20';
import { hostGenerationHintStartedAt, hostGenerationInProgress, writeHostGenerationHintStartedAt, writeHostGenerationInProgress, } from './lifecycle.js?rmv=1.99.20';
export const API_PROFILE_STORE_KEY = 'rabbit_mirror_independent_api_profiles_v1';
const API_REQUEST_DIAGNOSTIC_STORE_KEY = 'rabbit_mirror_independent_api_last_request_v2';
export const API_REQUEST_DIAGNOSTIC_EVENT = 'rabbitmirror:independent-api-diagnostic';
const WORLD_INFO_BOOK_CACHE_KEY = 'rabbit_mirror_world_info_books_v2';
const WORLD_INFO_BOOK_CACHE_LIMIT = 512;
export const WORLD_INFO_BOOKS_CHANGED_EVENT = 'rabbit-mirror-world-info-books-changed';
const INDEPENDENT_MODEL_LIST_TIMEOUT_MS = 30000;
const WORLD_INFO_BOOK_LIST_TIMEOUT_MS = 15000;
const API_PROFILE_SCHEMA = 2;
export const API_PROFILE_ORDER = [
    'chat_system_user_full',
    'chat_system_user_completion',
    'chat_system_user_no_temp_full',
    'chat_system_user_no_temp_completion',
    'chat_system_user_minimal',
    'chat_user_only_full',
    'chat_user_only_completion',
    'chat_user_only_no_temp_full',
    'chat_user_only_no_temp_completion',
    'chat_user_only_minimal',
    'chat_system_user_full_nostream',
    'chat_system_user_completion_nostream',
    'chat_system_user_no_temp_full_nostream',
    'chat_system_user_no_temp_completion_nostream',
    'chat_system_user_minimal_nostream',
    'chat_user_only_full_nostream',
    'chat_user_only_completion_nostream',
    'chat_user_only_no_temp_full_nostream',
    'chat_user_only_no_temp_completion_nostream',
    'chat_user_only_minimal_nostream',
    'chat_system_user_nostream',
    'chat_user_only_nostream',
];
const DEGRADED_PROFILE_RECHECK_MS = 6 * 60 * 60 * 1000;
const STREAM_COMPATIBILITY_SCHEMA = 1;
const STAGED_PROFILE_TTL_MS = 20 * 60 * 1000;
const STREAM_REFUSED_RECHECK_MS = 7 * 24 * 60 * 60 * 1000;
const STREAM_REFUSED_TWIN_TTL_MS = 2 * 60 * 60 * 1000;
export let hostModule = null;
export function writeHostModule(value) { hostModule = value; return value; }
let hostOpenAiModule = null;
let cachedSillyTavernVersion = '';
export const globalWorldInfoSnapshots = new Map();
export let activeGlobalWorldInfoCapture = null;
export function writeActiveGlobalWorldInfoCapture(value) { activeGlobalWorldInfoCapture = value; return value; }
const observedWorldInfoBooks = new Map();
let observedWorldInfoBookCacheLoaded = false;
const INDEPENDENT_VISIBLE_TEXT_CACHE_LIMIT = 12;
const GLOBAL_WORLD_INFO_SNAPSHOT_TTL_MS = 30 * 60 * 1000;
const GLOBAL_WORLD_INFO_SNAPSHOT_LIMIT = 96;
const GLOBAL_WORLD_INFO_CONTEXT_BUDGET = 6000;
const GLOBAL_WORLD_INFO_OWNER_GENERATION_TYPES = new Set(['normal', 'continue', 'swipe', 'regenerate']);
export let activeOwnerLockBatch = null;
export function writeActiveOwnerLockBatch(value) { activeOwnerLockBatch = value; return value; }
export let activeOwnerLockBatchDirty = false;
export function writeActiveOwnerLockBatchDirty(value) { activeOwnerLockBatchDirty = value; return value; }
export const INDEPENDENT_OWNER_OBSERVATION = Symbol.for('rabbitMirror.independentObservedOwner');
export const independentRecordContinuity = new WeakMap();
let independentRecordContinuitySequence = 0;
const HISTORICAL_RABBIT_MIRROR_BLOCK_RE = /<toto\b[^>]*>[\s\S]*?<\/toto\s*>/gi;
const INDEPENDENT_TAG_SCAN_MAX_MESSAGES = 500;
const INDEPENDENT_TAG_SCAN_MAX_NODES = 20000;
const INDEPENDENT_TAG_SCAN_MAX_TEXT_CHARS = 256000;
const INDEPENDENT_TAG_SCAN_MAX_UNIQUE_TAGS = 128;
const INDEPENDENT_TAG_SCAN_STANDARD_TAGS = new Set(`a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p picture pre progress q rp rt ruby s samp script search section select slot small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr`.split(' '));
const INDEPENDENT_TAG_SCAN_RESERVED_TAGS = new Set(['toto']);
const INDEPENDENT_TAG_SCAN_SKIP_SUBTREES = new Set(['toto', 'script', 'style', 'template', 'noscript', 'iframe', 'object', 'embed', 'svg', 'math']);
const INDEPENDENT_TAG_SCAN_SKIP_CODE_SUBTREES = new Set(['code', 'pre', 'textarea', 'kbd', 'samp']);
const INDEPENDENT_TAG_SCAN_BLOCKED_SELECTOR = 'toto, [data-rabbit-mirror-external-source], [data-rabbit-mirror-tool-entry-host], [data-rm-image-region], [data-rm-image-portal], [data-rabbit-mirror-ui-version], script, style, template, noscript, iframe, object, embed, svg, math, [hidden], [inert], [aria-hidden="true"], [aria-hidden="1"], .displayNone, .display-none, .hidden, .invisible, .sr-only, [class*="display-none"], [class*="display_none"]';
const INDEPENDENT_KNOWN_ENDPOINT_RE = /\/(?:chat\/completions|completions|responses|messages|embeddings|models)\/?$/i;
const ST_CUSTOM_STATUS_ENDPOINT = '/api/backends/chat-completions/status';
const ST_CUSTOM_GENERATE_ENDPOINT = '/api/backends/chat-completions/generate';
let lastIndependentModelListDiagnostic = null;
function profileUsesTemperature(profile = '') { return !/no_temp|minimal/i.test(String(profile || '')); }
export function profileUsesSystemMessage(profile = '') { return !/user_only/i.test(String(profile || '')); }
export function profileUsesStreaming(profile = '') { return !/nostream/i.test(String(profile || '')); }
export function profileTokenField(profile = '') {
    const value = String(profile || '');
    if (/completion/i.test(value))
        return 'max_completion_tokens';
    if (/full/i.test(value))
        return 'max_tokens';
    if (/minimal/i.test(value))
        return __rmT("cyf0hq5P");
    if (/nostream/i.test(value))
        return 'max_completion_tokens';
    return __rmT("cyf0hq5P");
}
function profileIsDegraded(profile = '') { return !profileUsesTemperature(profile) || !profileUsesSystemMessage(profile) || !profileUsesStreaming(profile); }
function profileOnlyDropsStreaming(profile = '') { return !profileUsesStreaming(profile) && profileUsesTemperature(profile) && profileUsesSystemMessage(profile); }
function degradedProfileRecheckMs(profile = '', streamRefused = false) {
    return streamRefused === true && profileOnlyDropsStreaming(profile) ? STREAM_REFUSED_RECHECK_MS : DEGRADED_PROFILE_RECHECK_MS;
}
export function getRememberedApiProfile(st) {
    const key = apiProfileKey(st);
    if (!key)
        return '';
    const record = readApiProfileStore()[key];
    if (!record || typeof record !== 'object' || Number(record.schema) !== API_PROFILE_SCHEMA)
        return '';
    if (Math.abs(Number(record.temperature) - normalizedConfiguredTemperature(st)) > 0.0001)
        return '';
    if (!profileUsesStreaming(record.profile) && Number(record.streamCompatibilitySchema) !== STREAM_COMPATIBILITY_SCHEMA)
        return '';
    const since = Number(record.compatibilitySince || record.ts || 0);
    if (profileIsDegraded(record.profile) && Date.now() - since >= degradedProfileRecheckMs(record.profile, record.streamRefused))
        return '';
    return API_PROFILE_ORDER.includes(String(record.profile || '')) ? String(record.profile || '') : '';
}
export function getStagedApiProfile(st, consume = false) {
    const key = apiProfileKey(st);
    if (!key)
        return '';
    const record = readApiProfileStore()[key];
    if (!record || typeof record !== 'object' || Number(record.schema) !== API_PROFILE_SCHEMA)
        return '';
    if (Math.abs(Number(record.temperature) - normalizedConfiguredTemperature(st)) > 0.0001) {
        clearStagedApiProfile(st);
        return '';
    }
    if (String(record.runtime || '') !== RUNTIME_VERSION || !Number(record.nextTs) || Date.now() - Number(record.nextTs) > STAGED_PROFILE_TTL_MS) {
        clearStagedApiProfile(st);
        return '';
    }
    const next = String(record.nextProfile || '');
    if (!API_PROFILE_ORDER.includes(next)) {
        clearStagedApiProfile(st);
        return '';
    }
    if (consume) {
        clearStagedApiProfile(st);
        if (record.nextStreamRefused === true && !profileUsesStreaming(next))
            noteStreamRefusedTwin(st, next);
    }
    return next;
}
function noteStreamRefusedTwin(st, profile = '') {
    const key = apiProfileKey(st);
    if (!key || !profile)
        return;
    const store = readApiProfileStore();
    const current = store[key] && typeof store[key] === 'object' ? store[key] : { schema: API_PROFILE_SCHEMA, temperature: normalizedConfiguredTemperature(st) };
    store[key] = { ...current, streamRefusedTwin: String(profile), streamRefusedTs: Date.now() };
    writeApiProfileStore(store);
}
export function stageNextApiProfile(st, nextProfile = '', reason = '', { streamRefused = false } = {}) {
    const key = apiProfileKey(st);
    const next = String(nextProfile || '');
    if (!key || !API_PROFILE_ORDER.includes(next))
        return '';
    const store = readApiProfileStore();
    const current = store[key] && typeof store[key] === 'object' ? store[key] : {};
    store[key] = {
        ...current,
        schema: API_PROFILE_SCHEMA,
        temperature: normalizedConfiguredTemperature(st),
        nextProfile: next,
        nextReason: String(reason || '').slice(0, 160),
        nextTs: Date.now(),
        runtime: RUNTIME_VERSION,
    };
    if (streamRefused === true)
        store[key].nextStreamRefused = true;
    else
        delete store[key].nextStreamRefused;
    writeApiProfileStore(store);
    return next;
}
function clearStagedApiProfile(st) {
    const key = apiProfileKey(st);
    if (!key)
        return;
    const store = readApiProfileStore();
    const current = store[key];
    if (!current || typeof current !== 'object' || (!current.nextProfile && !current.nextReason && !current.nextTs && !current.nextStreamRefused))
        return;
    const next = { ...current };
    delete next.nextProfile;
    delete next.nextReason;
    delete next.nextTs;
    delete next.nextStreamRefused;
    if (!next.profile)
        delete store[key];
    else
        store[key] = next;
    writeApiProfileStore(store);
}
export function forgetRememberedApiProfileIfMatches(st, profile = '') {
    const key = apiProfileKey(st);
    if (!key || !profile)
        return;
    const store = readApiProfileStore();
    const current = store[key];
    if (!current || typeof current !== 'object' || String(current.profile || '') !== String(profile || ''))
        return;
    const next = { ...current, profile: '', ts: Date.now(), runtime: RUNTIME_VERSION };
    store[key] = next;
    writeApiProfileStore(store);
}
export function rememberApiProfile(st, profile) {
    const key = apiProfileKey(st);
    if (!key || !profile)
        return;
    const store = readApiProfileStore();
    const current = store[key];
    const now = Date.now();
    const priorSince = Number(current?.compatibilitySince || current?.ts || 0);
    const same = current?.profile === String(profile) && Number(current.schema) === API_PROFILE_SCHEMA
        && Number(current.streamCompatibilitySchema) === STREAM_COMPATIBILITY_SCHEMA
        && Math.abs(Number(current.temperature) - normalizedConfiguredTemperature(st)) <= 0.0001;
    const refusedTwin = current?.streamRefusedTwin === String(profile) && now - Number(current?.streamRefusedTs || 0) < STREAM_REFUSED_TWIN_TTL_MS;
    const streamRefused = !profileUsesStreaming(profile) && (refusedTwin || (same && current?.streamRefused === true));
    const compatibilitySince = same && priorSince > 0 && now - priorSince < degradedProfileRecheckMs(profile, streamRefused) ? priorSince : now;
    store[key] = { schema: API_PROFILE_SCHEMA, profile: String(profile), temperature: normalizedConfiguredTemperature(st), ts: now,
        compatibilitySince, streamCompatibilitySchema: STREAM_COMPATIBILITY_SCHEMA, runtime: RUNTIME_VERSION, ...(streamRefused ? { streamRefused: true } : {}) };
    const entries = Object.entries(store).sort((a, b) => Number(b[1]?.ts || b[1]?.nextTs || b[1]?.streamRefusedTs || 0) - Number(a[1]?.ts || a[1]?.nextTs || a[1]?.streamRefusedTs || 0));
    writeApiProfileStore(Object.fromEntries(entries.slice(0, 80)));
}
function readOwnerLockStore() { try {
    const value = JSON.parse(localStorage.getItem(OWNER_LOCK_STORE_KEY) || '{}');
    return value && typeof value === 'object' ? value : {};
}
catch {
    return {};
} }
function writeOwnerLockStore(value) {
    try {
        const entries = Object.entries(value || {}).sort((a, b) => Number(b[1]?.ts || 0) - Number(a[1]?.ts || 0)).slice(0, 240);
        localStorage.setItem(OWNER_LOCK_STORE_KEY, JSON.stringify(Object.fromEntries(entries)));
    }
    catch { }
}
function ownerLockStoreForAccess() { return activeOwnerLockBatch || readOwnerLockStore(); }
export function withOwnerLockStoreBatch(run) {
    if (typeof run !== 'function')
        return undefined;
    if (activeOwnerLockBatch)
        return run();
    const store = readOwnerLockStore();
    activeOwnerLockBatch = store;
    activeOwnerLockBatchDirty = false;
    try {
        return run();
    }
    finally {
        const dirty = activeOwnerLockBatchDirty;
        activeOwnerLockBatch = null;
        activeOwnerLockBatchDirty = false;
        if (dirty)
            writeOwnerLockStore(store);
    }
}
export function ownerLockForBase(baseSlot = '') { const key = String(baseSlot || ''); return key ? ownerLockStoreForAccess()[key] || null : null; }
export function setOwnerLockForBase(baseSlot, slot, sourceHash = '') {
    const base = String(baseSlot || '');
    const exact = String(slot || '');
    if (!base || !exact)
        return;
    const store = ownerLockStoreForAccess();
    store[base] = { slot: exact, sourceHash: String(sourceHash || ''), ts: Date.now(), runtime: RUNTIME_VERSION };
    if (activeOwnerLockBatch)
        activeOwnerLockBatchDirty = true;
    else
        writeOwnerLockStore(store);
}
export function clearOwnerLockForBase(baseSlot = '') {
    const base = String(baseSlot || '');
    if (!base)
        return;
    const store = ownerLockStoreForAccess();
    if (!Object.prototype.hasOwnProperty.call(store, base))
        return;
    delete store[base];
    if (activeOwnerLockBatch)
        activeOwnerLockBatchDirty = true;
    else
        writeOwnerLockStore(store);
}
export function remapOwnerLockSlots(mapSlot) {
    if (typeof mapSlot !== 'function')
        return false;
    const store = readOwnerLockStore();
    const next = {};
    const moved = [];
    let changed = false;
    for (const [base, lock] of Object.entries(store)) {
        const target = mapSlot(base);
        const slot = lock && typeof lock === 'object' ? String(lock.slot || '') : '';
        const targetSlot = slot ? mapSlot(slot) : slot;
        if (target === base && targetSlot === slot) {
            if (!(base in next))
                next[base] = lock;
            continue;
        }
        changed = true;
        if (target && targetSlot)
            moved.push([target, { ...lock, slot: targetSlot }]);
    }
    for (const [base, lock] of moved)
        next[base] = lock;
    if (changed)
        writeOwnerLockStore(next);
    return changed;
}
export function lockedIndependentRecordForBase(baseSlot, store = readStore(), { lightweight = false } = {}) {
    const lock = ownerLockForBase(baseSlot);
    if (!lock?.slot)
        return null;
    const valid = html => lightweight ? independentStoredHtmlLightRestorable(html) : independentStoredHtmlRestorable(html);
    const saved = store?.[String(lock.slot || '')];
    if (saved?.html && valid(saved.html))
        return { record: saved, lock };
    const history = historyEntriesForSlot(String(lock.slot || '')).find(entry => entry?.html && valid(entry.html));
    if (history?.html)
        return { record: history, lock };
    if (!lightweight)
        clearOwnerLockForBase(baseSlot);
    return null;
}
let lastPublishedDiagnostic = null;
export function readLastIndependentApiRequestDiagnostic() {
    let stored = null;
    try {
        const value = JSON.parse(localStorage.getItem(API_REQUEST_DIAGNOSTIC_STORE_KEY) || 'null');
        stored = value && typeof value === 'object' ? value : null;
    }
    catch {
        stored = null;
    }
    if (lastPublishedDiagnostic && (!stored || Number(lastPublishedDiagnostic.ts || 0) >= Number(stored.ts || 0)))
        return lastPublishedDiagnostic;
    return stored;
}
export function publishIndependentApiRequestDiagnostic(value) {
    const diagnostic = { ...value, runtime: RUNTIME_VERSION, ts: Number(value?.ts || Date.now()) };
    if (diagnostic.transport) {
        diagnostic.transportRequestStamp = rememberIndependentTransportDiagnostic(diagnostic);
    }
    lastPublishedDiagnostic = diagnostic;
    try {
        localStorage.setItem(API_REQUEST_DIAGNOSTIC_STORE_KEY, JSON.stringify(diagnostic));
    }
    catch { }
    try {
        globalThis.dispatchEvent?.(new CustomEvent(API_REQUEST_DIAGNOSTIC_EVENT, { detail: diagnostic }));
    }
    catch { }
    return diagnostic;
}
export function getLastIndependentApiRequestDiagnostic() { return readLastIndependentApiRequestDiagnostic(); }
export function normalizeIndependentConnectionText(value, max = 1000) { return String(value ?? '').replace(/\r\n?/g, '\n').replace(/\u0000/g, '').trim().slice(0, max); }
function independentSemver(value = '') {
    const match = String(value || '').match(/(?:^|[^0-9])(\d+)\.(\d+)\.(\d+)(?:[^0-9]|$)/);
    return match ? match.slice(1, 4).map(Number) : null;
}
function independentSemverAtLeast(value, minimum = [1, 18, 0]) {
    const parsed = independentSemver(value);
    if (!parsed)
        return false;
    for (let index = 0; index < 3; index += 1) {
        if (parsed[index] > minimum[index])
            return true;
        if (parsed[index] < minimum[index])
            return false;
    }
    return true;
}
function independentConnectionManagerHasProfileSecrets(service) {
    if (typeof service?.sendRequest !== 'function')
        return false;
    try {
        const source = Function.prototype.toString.call(service.sendRequest);
        return /\bsecret_id\s*:/.test(source) && /profile\s*\[\s*['"]secret-id['"]\s*\]/.test(source);
    }
    catch {
        return false;
    }
}
function independentConnectionManagerSupportsRequestOverrides(service) {
    if (typeof service?.sendRequest !== 'function')
        return false;
    try {
        const source = Function.prototype.toString.call(service.sendRequest);
        const profileModelIndex = source.search(/\bmodel\s*:\s*profile(?:\.model|\s*\[\s*['"]model['"]\s*\])/);
        const overrideSpreadIndex = source.search(/\.\.\.\s*overridePayload\b/);
        return profileModelIndex >= 0 && overrideSpreadIndex > profileModelIndex;
    }
    catch {
        return false;
    }
}
async function readIndependentSillyTavernVersion() {
    if (cachedSillyTavernVersion)
        return cachedSillyTavernVersion;
    try {
        hostModule = hostModule || await import('../../../../../../script.js');
        const candidates = [hostModule?.displayVersion, hostModule?.CLIENT_VERSION];
        const known = candidates.find(value => independentSemver(value));
        if (known) {
            cachedSillyTavernVersion = String(known);
            return cachedSillyTavernVersion;
        }
    }
    catch { }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
        const response = await fetch('/version', { method: 'GET', credentials: 'same-origin', cache: 'no-cache', signal: controller.signal });
        const data = response.ok ? await response.json() : null;
        if (independentSemver(data?.pkgVersion)) {
            cachedSillyTavernVersion = String(data.pkgVersion);
            return cachedSillyTavernVersion;
        }
    }
    catch { }
    finally {
        clearTimeout(timeoutId);
    }
    return '';
}
export function independentConnectionProfilePreflightError(message, reason = 'profile-invalid', cause = null) {
    const error = new Error(String(message || __rmT("xAQ6LwVAjBwqL.O8oDAOijbqgRivokw8s9rkDnSCga6kTmkwgaBiFwC.HNrANRUBaGjb5wif9M5L5dfPkWj.DtZOIjDkkohQR7BLRf")));
    error.name = 'RabbitMirrorConnectionProfilePreflightError';
    error.code = 'RABBIT_MIRROR_CONNECTION_PROFILE_REJECTED';
    error.reason = String(reason || 'profile-invalid');
    if (cause && cause !== error) {
        try {
            error.cause = cause;
        }
        catch { }
    }
    return error;
}
async function assertIndependentConnectionProfileSupport(service) {
    const hasProfileSecrets = independentConnectionManagerHasProfileSecrets(service);
    const hasRequestOverrides = independentConnectionManagerSupportsRequestOverrides(service);
    if (hasProfileSecrets && hasRequestOverrides)
        return true;
    const version = await readIndependentSillyTavernVersion();
    if (independentSemverAtLeast(version) && (!hasProfileSecrets || !hasRequestOverrides)) {
        throw independentConnectionProfilePreflightError(__rmT("zAnC9_Im4ZKxmDed3Zq78azgy9tuCuFUXSfAep7duYuGiUaDHTxvTFGRgZL9OtZLjM_qcWBk5sWmveavyQmGkr18e3x5CbQK3h_PR3LhzlgFzJvzNyCbLesysP0QSIZIryHjk3c5u2PSsdMlYVwjq1yPZfbLzswh.yCmXSNGUqn7Sksisu7AI2zuzhKZfUs9mf6Jlv1rXVnIi0kvdCPgP7WtI64DtAnXB_qSVftDI73gMSpn9VtRy5LYXfBasHWTN0uTyVcFI3MUtWfmIxhPLGwl9cl1371271Zh9gyqoONzxVP30f5bIFqyTo1z23bN4j8HhGJ333QKwc90XE5.Nk"), 'connection-manager-capability');
    }
    throw independentConnectionProfilePreflightError(__rmT("_eFlrBh1HRawflxBLSmA0FCWiv6MlKcgocopL6OE5X8ugElJA5wuryq.zzpID5FAxXsbVCnv2PV82PuWnoEfHsEPve6l1aAHYFVNHeQrYifYPdltLs4EbJjFvt1pF0..bOG1xDNjqrw2q4Zkw3eCgBfoigBiwVzoCG_I5AUwaT.eGYUvoR26z4pDhYqoPxEzw0mQMRnIs55z3wBrLSAAc5wytx5XbutO"), 'sillytavern-version');
}
function independentConnectionManagerSettings(ctx = getContext()) {
    const manager = ctx?.extensionSettings?.connectionManager;
    if (!manager || !Array.isArray(manager.profiles))
        throw new Error(__rmT("XAPl4IT0ZgbiKg5hWTvM9bBVNB712yS1IbZj.eDdgXdS9_f5KxwWfW8AMx9Yr93vCsAzBRy5M.SJ0A7P0AC0CNyG0H6B3o0kWD0.tKRUw2i1jZnPATzoV8MK2SyMMavSx6jTKxOdjgYSMDh8POlARyk976YvMs8gvP1TC1RibPoZTdUOAa4_mymO"));
    if (Array.isArray(ctx?.extensionSettings?.disabledExtensions) && ctx.extensionSettings.disabledExtensions.includes('connection-manager'))
        throw new Error(__rmT("sx4Q3pKT5vlJl10MW7KIdwKDblYZmTcxTz9SFNNV0AaBUb5IXverwV6R6a2SntPtuuPHHvqM8yyRko_q4YBeBaB07pKfDpJnEnDi5C9_ZIbv0VdZwMBVt3HXt5fEZf"));
    return manager;
}
function rawIndependentConnectionProfile(profileId, ctx = getContext()) {
    const manager = independentConnectionManagerSettings(ctx);
    return manager.profiles.find(item => String(item?.id || '') === String(profileId || '')) || null;
}
async function hostSecretsModule() {
    try {
        return await import('../../../../../secrets.js');
    }
    catch {
        return null;
    }
}
async function secretKeyForSource(source) {
    const secrets = await hostSecretsModule();
    if (!secrets?.SECRET_KEYS)
        return null;
    try {
        hostOpenAiModule = hostOpenAiModule || await import('../../../../../openai.js');
        const sources = hostOpenAiModule?.chat_completion_sources || {};
        const name = Object.entries(sources).find(([, value]) => value === source)?.[0];
        return name && secrets.SECRET_KEYS[name] ? { secrets, key: secrets.SECRET_KEYS[name] } : null;
    }
    catch {
        return null;
    }
}
export async function rememberActiveConnectionProfileSecret(ctx = getContext()) {
    let manager = null;
    try {
        manager = independentConnectionManagerSettings(ctx);
    }
    catch {
        return '';
    }
    const activeId = normalizeIndependentConnectionText(manager.selectedProfile, 160);
    const profile = activeId ? manager.profiles.find(item => String(item?.id || '') === activeId) : null;
    if (!profile || normalizeIndependentConnectionText(profile['secret-id'], 240))
        return '';
    const secretId = await readCurrentIndependentSlashSetting('secret-id', ctx);
    if (!secretId || /^(?:none|null|undefined)$/i.test(secretId))
        return '';
    const memo = { ...(getSettings()?.independentConnectionSecretMemo || {}) };
    if (memo[activeId] === secretId)
        return secretId;
    delete memo[activeId];
    memo[activeId] = secretId;
    updateSettings({ independentConnectionSecretMemo: memo });
    return secretId;
}
async function rememberedConnectionProfileSecret(profileId, profile, source) {
    if (normalizeIndependentConnectionText(profile?.['secret-id'], 240))
        return '';
    const remembered = normalizeIndependentConnectionText(getSettings()?.independentConnectionSecretMemo?.[profileId], 240);
    if (!remembered)
        return '';
    const found = await secretKeyForSource(source);
    if (found) {
        const list = found.secrets.secret_state?.[found.key];
        if (Array.isArray(list) && !list.some(item => String(item?.id || '') === remembered))
            return '';
    }
    return remembered;
}
export function connectionProfileSecretState(profileId, ctx = getContext()) {
    const id = normalizeIndependentConnectionText(profileId, 160);
    if (!id)
        return '';
    let profile = null;
    try {
        profile = rawIndependentConnectionProfile(id, ctx);
    }
    catch {
        return '';
    }
    if (!profile)
        return '';
    if (normalizeIndependentConnectionText(profile['secret-id'], 240))
        return 'saved';
    return normalizeIndependentConnectionText(getSettings()?.independentConnectionSecretMemo?.[id], 240) ? 'remembered' : 'unknown';
}
let profileSecretWatchInstalled = false;
export function installConnectionProfileSecretWatch(ctx = getContext()) {
    if (profileSecretWatchInstalled)
        return;
    const source = ctx?.eventSource;
    const types = ctx?.eventTypes || ctx?.event_types;
    if (!source?.on || !types)
        return;
    profileSecretWatchInstalled = true;
    const remember = () => { setTimeout(() => { void rememberActiveConnectionProfileSecret().catch(() => { }); }, 300); };
    for (const name of ['CONNECTION_PROFILE_LOADED', 'CONNECTION_PROFILE_UPDATED', 'SECRET_ROTATED', 'SECRET_WRITTEN'])
        if (types[name])
            source.on(types[name], remember);
    remember();
}
export async function validatedIndependentConnectionProfile(profileId, ctx = getContext()) {
    const id = normalizeIndependentConnectionText(profileId, 160);
    if (!id)
        return null;
    let profile = null;
    try {
        profile = rawIndependentConnectionProfile(id, ctx);
    }
    catch (error) {
        throw independentConnectionProfilePreflightError(error?.message || error, 'connection-manager-unavailable', error);
    }
    if (!profile)
        throw independentConnectionProfilePreflightError(__rmT("6Ayfl_7AQ3rMfHW6tGjyyIzlu5K.NHd9n.mH_GwaeSD8qXFi_vS8qhcpNbl9uT"), 'profile-missing');
    const service = ctx?.ConnectionManagerRequestService;
    if (!service?.validateProfile || typeof service?.sendRequest !== 'function')
        throw independentConnectionProfilePreflightError(__rmT("2X0bF1.3QMwVbws3jbv63mcKeu9RcBQk_oBSbQ_98XYXyZXk3w1I1tHhpmcQuT84gHJCusGuXlzi7UDCTHCGAuBNTBdJRlRtk0h.6O5NqG1WuTbQY_KuF.eyaAFhrEc3hV8Jt2sJk0g4TpziUZfDlnsA3cHrVymao9lvItPfCIEb4gESg0m1.7x42hfj4GnIPJjTuCk0EwsMB0O_cg5sJJG.chW4Qh.XhoAsOgWNQFPhoGL7mw6dZRssgHufLGN8_CwNkxlhb9qpRPk5Giukq.YIgxcGZJJMqxsm4iziFpw.0WWzniam8mWplCHjU5FOMQckr_PUyVMRD1eIZhp_UoVvUZfCunmXdhf"), 'request-service-unavailable');
    try {
        await assertIndependentConnectionProfileSupport(service);
    }
    catch (error) {
        if (error?.code === 'RABBIT_MIRROR_CONNECTION_PROFILE_REJECTED')
            throw error;
        throw independentConnectionProfilePreflightError(error?.message || error, 'connection-manager-capability', error);
    }
    let apiMap = null;
    try {
        apiMap = service.validateProfile(profile);
    }
    catch (error) {
        throw independentConnectionProfilePreflightError(error?.message || error, 'profile-secret-or-transport-invalid', error);
    }
    if (apiMap?.selected !== 'openai' || !apiMap?.source)
        throw independentConnectionProfilePreflightError(__rmT("oUGfsgRS0qMpvSa7cYkkXaDvDslOV23hygs5sRVtnazeqRH5TilvHJr3hXh0p3jV9qNSZPGQWQPZJwlS1T5wL8BktTWHJRl8mUIQkCG1_2xpLz09VYDNy8iu023YjH7iala39LeeweiIcFMxRGyAo.f9lczw2ofXC0kVtBxFy0SFWU3ikahijSfrYrWj4Pe5ErB"), 'profile-not-chat-completion');
    installConnectionProfileSecretWatch(ctx);
    try {
        await rememberActiveConnectionProfileSecret(ctx);
    }
    catch { }
    const fallbackSecretId = await rememberedConnectionProfileSecret(id, profile, apiMap.source).catch(() => '');
    return { id, profile, apiMap, ctx, fallbackSecretId };
}
function independentConnectionFingerprint(profile) {
    const keys = ['mode', 'api', 'preset', 'api-url', 'model', 'proxy', 'prompt-post-processing', 'secret-id'];
    return JSON.stringify(keys.map(key => normalizeIndependentConnectionText(profile?.[key], 1000)));
}
function uniqueIndependentImportedProfileName(manager, base) {
    const names = new Set((manager?.profiles || []).map(item => String(item?.name || '')));
    if (!names.has(base))
        return base;
    let index = 2;
    while (names.has(`${base} ${index}`))
        index += 1;
    return `${base} ${index}`;
}
async function readCurrentIndependentSlashSetting(command, ctx = getContext()) {
    const callback = ctx?.SlashCommandParser?.commands?.[command]?.callback;
    if (typeof callback !== 'function')
        return '';
    try {
        return normalizeIndependentConnectionText(await callback({ quiet: 'true' }, ''), 1000);
    }
    catch (error) {
        console.warn(`[RabbitMirror] failed to read current SillyTavern setting: ${command}`, error);
        return '';
    }
}
export function getIndependentConnectionProfiles() {
    try {
        const ctx = getContext();
        const service = ctx?.ConnectionManagerRequestService;
        if (!service?.getSupportedProfiles || !independentConnectionManagerHasProfileSecrets(service))
            return [];
        const manager = independentConnectionManagerSettings(ctx);
        return service.getSupportedProfiles().map(item => {
            const id = normalizeIndependentConnectionText(item?.id, 160);
            const raw = manager.profiles.find(profile => String(profile?.id || '') === id);
            if (!id || !raw)
                return null;
            try {
                const map = service.validateProfile(raw);
                if (map?.selected !== 'openai' || !map?.source)
                    return null;
            }
            catch {
                return null;
            }
            return { id, name: normalizeIndependentConnectionText(item?.name, 180) || __rmT("W7DAA7Hf8Y53Gf"), model: normalizeIndependentConnectionText(item?.model, 240), api: normalizeIndependentConnectionText(item?.api, 120) };
        }).filter(Boolean);
    }
    catch {
        return [];
    }
}
export async function importCurrentSillyTavernConnection(options) {
    options = options || {};
    const assertStillCurrent = () => {
        if (typeof options?.isCurrent !== 'function')
            return;
        let current = false;
        try {
            current = options.isCurrent() !== false;
        }
        catch { }
        if (current)
            return;
        const error = new Error(__rmT("LmAlxv1hKUUy_ytkyYEzccu8tr09Yq23MgjCBbU9qhOIDvxYBiigIl96vIN5sMGFP3FY3h"));
        error.code = 'INDEPENDENT_CONNECTION_SELECTION_SUPERSEDED';
        throw error;
    };
    const ctx = getContext();
    const manager = independentConnectionManagerSettings(ctx);
    const service = ctx?.ConnectionManagerRequestService;
    if (!service?.validateProfile)
        throw new Error(__rmT("uPV76cMUHnu9_9czZkNXLomK6NE9w1nLBkf4JHaLWL_nloZow0Sx5DwN_ef8VEiMvpPzAC4ZBOh_.XKLkiap601sLAusMaZNqUkeXHmdI9u3FvlWIazEvXttZSAIyOLsZS08WSDSuvCojLfF"));
    await assertIndependentConnectionProfileSupport(service);
    assertStillCurrent();
    const selectedId = normalizeIndependentConnectionText(manager.selectedProfile, 160);
    if (selectedId) {
        try {
            const selected = await validatedIndependentConnectionProfile(selectedId, ctx);
            assertStillCurrent();
            const model = normalizeIndependentConnectionText(selected?.profile?.model, 240);
            const current = getSettings();
            const retainedModel = normalizeIndependentConnectionText(current?.independentConnectionProfileId, 160) === selectedId
                ? normalizeIndependentConnectionText(current?.independentApiModel, 240)
                : '';
            const selectedModel = retainedModel || model;
            updateSettings({ independentConnectionProfileId: selectedId, ...(selectedModel ? { independentApiModel: selectedModel } : {}) });
            return { id: selectedId, name: normalizeIndependentConnectionText(selected?.profile?.name, 180) || __rmT("rHZnAGhLDPC"), model: selectedModel, profileModel: model, created: false };
        }
        catch (error) {
            if (error?.code === 'INDEPENDENT_CONNECTION_SELECTION_SUPERSEDED')
                throw error;
        }
    }
    if (ctx?.mainApi !== 'openai')
        throw new Error(__rmT("uPV76vTA_Js8tImRhLjJVFZ2PJEbw1WL_TfuJHaLKkzEYOg760So5D1NNcfmVErMxY9Mg_dqa17N8lDB3GhKwfi.NOc1bd6D0VIAXHqdJ9BlFMrEDk50GFSf6UEbNJ4blaNyArLqzjInJrfF"));
    const commands = ['api', 'preset', 'api-url', 'model', 'proxy', 'prompt-post-processing', 'secret-id'];
    const profile = { id: typeof ctx?.uuidv4 === 'function' ? ctx.uuidv4() : `rabbitmirror-${Date.now()}-${Math.random().toString(16).slice(2)}`, mode: 'cc', exclude: [] };
    for (const command of commands) {
        const value = await readCurrentIndependentSlashSetting(command, ctx);
        assertStillCurrent();
        if (value || command === 'api-url')
            profile[command] = value;
    }
    if (!profile.api)
        throw new Error(__rmT("oKiBdePQZDp7DXg77gtNl3J.tLQu.KNGHhI.zw6grMSpr3qMQSyUcQxk5TsHP4xvuUFWS7Me0Wm.gnYZIhYFrh"));
    const apiMap = service.validateProfile(profile);
    if (apiMap?.selected !== 'openai' || !apiMap?.source)
        throw new Error(__rmT("IDeQr2HudLeylkXPkOuNYTxOU6RtXNhWG.VDENx3En0Eb6UyOr5Z8u6cE_W0clxQ71QmNdnxe7lOhX0WOo5CW.kRwOdmqtLgjG10c_0q4o6tYg_8BJT"));
    const fingerprint = independentConnectionFingerprint(profile);
    const existing = manager.profiles.find(item => independentConnectionFingerprint(item) === fingerprint);
    let target = existing;
    if (!target) {
        assertStillCurrent();
        const displayApi = normalizeIndependentConnectionText(profile.api, 80) || 'API';
        const displayModel = normalizeIndependentConnectionText(profile.model, 100);
        profile.name = uniqueIndependentImportedProfileName(manager, `${__rmT("oNm9IIg2RFBOBsBq")}${displayApi}${displayModel ? ` · ${displayModel}` : ''}`);
        manager.profiles.push(profile);
        target = profile;
        ctx?.saveSettingsDebounced?.();
    }
    assertStillCurrent();
    const id = normalizeIndependentConnectionText(target?.id, 160);
    const model = normalizeIndependentConnectionText(target?.model, 240);
    const current = getSettings();
    const retainedModel = normalizeIndependentConnectionText(current?.independentConnectionProfileId, 160) === id
        ? normalizeIndependentConnectionText(current?.independentApiModel, 240)
        : '';
    const selectedModel = retainedModel || model;
    updateSettings({ independentConnectionProfileId: id, ...(selectedModel ? { independentApiModel: selectedModel } : {}) });
    if (!existing) {
        try {
            await ctx?.eventSource?.emit?.(ctx?.eventTypes?.CONNECTION_PROFILE_CREATED, profile);
        }
        catch (error) {
            console.warn('[RabbitMirror] connection profile created event failed', error);
        }
    }
    return { id, name: normalizeIndependentConnectionText(target?.name, 180) || __rmT("l5Tz7FKk8Z_sX6zA9Kp"), model: selectedModel, profileModel: model, created: !existing };
}
function independentConnectionTransportFingerprint(profile) {
    const keys = ['mode', 'api', 'api-url', 'proxy', 'secret-id'];
    return JSON.stringify(keys.map(key => normalizeIndependentConnectionText(profile?.[key], 1000)));
}
function savedIndependentModelsForProfile(profileId, ctx = getContext()) {
    const id = normalizeIndependentConnectionText(profileId, 160);
    if (!id)
        return [];
    let manager = null;
    try {
        manager = independentConnectionManagerSettings(ctx);
    }
    catch {
        return [];
    }
    const selected = manager.profiles.find(item => String(item?.id || '') === id);
    if (!selected)
        return [];
    const fingerprint = independentConnectionTransportFingerprint(selected);
    const models = manager.profiles
        .filter(item => independentConnectionTransportFingerprint(item) === fingerprint)
        .map(item => normalizeIndependentConnectionText(item?.model, 240)).filter(Boolean);
    const own = normalizeIndependentConnectionText(selected?.model, 240);
    if (own)
        models.unshift(own);
    return [...new Set(models)];
}
export function getIndependentSavedModels() {
    const st = getSettings();
    return savedIndependentModelsForProfile(st?.independentConnectionProfileId, getContext());
}
function independentConnectionPayload(runtime, proxyPresets = []) {
    if (!runtime)
        return null;
    const { profile, apiMap } = runtime;
    const apiUrl = normalizeIndependentConnectionText(profile?.['api-url'], 2000);
    const payload = { chat_completion_source: apiMap.source, secret_id: normalizeIndependentConnectionText(profile?.['secret-id'], 240) || runtime.fallbackSecretId || undefined };
    if (apiUrl) {
        if (apiMap.source === 'custom')
            payload.custom_url = apiUrl;
        if (apiMap.source === 'vertexai')
            payload.vertexai_region = apiUrl;
        if (apiMap.source === 'zai')
            payload.zai_endpoint = apiUrl;
        if (apiMap.source === 'siliconflow')
            payload.siliconflow_endpoint = apiUrl;
        if (apiMap.source === 'minimax')
            payload.minimax_endpoint = apiUrl;
    }
    const proxyName = normalizeIndependentConnectionText(profile?.proxy, 240);
    if (apiMap.source !== 'custom' && proxyName && proxyName.toLowerCase() !== 'none') {
        const proxy = (Array.isArray(proxyPresets) ? proxyPresets : []).find(item => String(item?.name || '') === proxyName);
        if (!proxy)
            throw independentModelListError(`${__rmT("5klhfIrjx9inM6k62zRZSKPJ_Ms")}${proxyName}${__rmT("rQodRThZOBRMOQpNOymCwdLsytO7qxkDVEmKc9MlgG8")}`, 'MODEL_LIST_PROFILE_PROXY');
        const proxyUrl = normalizeIndependentConnectionText(proxy?.url, 2000);
        const proxyPassword = normalizeIndependentConnectionText(proxy?.password, 1000);
        if (proxyUrl)
            payload.reverse_proxy = proxyUrl;
        if (proxyPassword)
            payload.proxy_password = proxyPassword;
    }
    if (apiMap.source === 'custom') {
        payload.custom_include_headers = '';
        payload.custom_include_body = '';
        payload.custom_exclude_body = '';
    }
    return payload;
}
export async function independentConnectionProxyPresets() {
    try {
        hostOpenAiModule = hostOpenAiModule || await import('../../../../../openai.js');
        return Array.isArray(hostOpenAiModule?.proxies) ? hostOpenAiModule.proxies : [];
    }
    catch {
        return [];
    }
}
export function independentDiagnosticBase(st = getSettings()) {
    const id = normalizeIndependentConnectionText(st?.independentConnectionProfileId, 160);
    if (id) {
        const profile = getIndependentConnectionProfiles().find(item => item.id === id);
        return `sillytavern:${profile?.name || id}`;
    }
    return normalizeBase(st?.independentApiBaseUrl || '');
}
export function externalHostGenerationActivity() {
    const ctx = getContext();
    const weakFlags = [
        ctx?.isGenerating,
        ctx?.is_generating,
        ctx?.is_send_press,
        globalThis.is_send_press,
        globalThis.is_group_generating,
    ];
    const weak = weakFlags.some(value => value === true);
    let dom = false;
    try {
        dom = !!document.querySelector?.('#chat .mes.streaming, #chat .mes[data-is-streaming="true"], #chat .mes[is_generating="true"], #chat .mes[data-generating="true"]');
    }
    catch { }
    let moduleActive = false;
    try {
        moduleActive = hostModule?.is_send_press === true || hostModule?.isGenerating?.() === true;
    }
    catch { }
    return { active: dom || weak || moduleActive, weak, dom, moduleActive };
}
export function hostGenerationActivity() {
    const eventHint = !!(hostGenerationInProgress && hostGenerationHintStartedAt && Date.now() - hostGenerationHintStartedAt < HOST_GENERATION_EVENT_HINT_MS);
    if (eventHint)
        return { active: true, strong: true, weak: false, dom: false, moduleActive: false, eventHint: true };
    if (hostGenerationInProgress && !eventHint) {
        writeHostGenerationInProgress(false);
        writeHostGenerationHintStartedAt(0);
    }
    const external = externalHostGenerationActivity();
    return { active: external.active, strong: external.dom || external.moduleActive, weak: external.weak, dom: external.dom, moduleActive: external.moduleActive, eventHint: false };
}
export function hostGenerationLooksActive() { return hostGenerationActivity().active; }
export function legacyChatKey(ctx) { const meta = ctx?.chatMetadata || globalThis.chat_metadata || {}; return String(meta.chat_id || meta.chatId || meta.file_name || ctx?.characterId || ctx?.groupId || 'chat'); }
export function chatKey(ctx) { try {
    return String(getCurrentChatKey?.(Array.isArray(ctx?.chat) ? ctx.chat : null) || legacyChatKey(ctx));
}
catch {
    return legacyChatKey(ctx);
} }
export function swipeId(msg) { return Number(msg?.swipe_id ?? msg?.swipeId ?? 0) || 0; }
export function messageBaseSlotKey(ctx, index, msg) { return `${chatKey(ctx)}:${index}:${swipeId(msg)}`; }
export function messageSlotKey(ctx, index, msg) { return `${messageBaseSlotKey(ctx, index, msg)}:${messageSourceFingerprint(msg)}`; }
export function legacyMessageSourceFingerprints(msg) {
    const values = [
        hashText(`${String(msg?.mes || '')}
\u0000display_text\u0000
${visibleDisplayTextOf(msg)}`),
        messageBodyFingerprint(msg),
    ];
    return [...new Set(values.filter(Boolean))];
}
export function legacyMessageSlotKeys(ctx, index, msg) {
    const current = chatKey(ctx);
    const legacy = legacyChatKey(ctx);
    const bases = [...new Set([current, legacy].filter(Boolean).map(chat => `${chat}:${index}:${swipeId(msg)}`))];
    const currentSlot = messageSlotKey(ctx, index, msg);
    const aliases = [];
    for (const base of bases) {
        aliases.push(base);
        for (const sourceHash of legacyMessageSourceFingerprints(msg))
            aliases.push(`${base}:${sourceHash}`);
        if (base.startsWith(`${legacy}:`) && legacy !== current)
            aliases.push(`${base}:${messageSourceFingerprint(msg)}`);
    }
    return [...new Set(aliases.filter(key => key && key !== currentSlot))];
}
export function recordKey(ctx, index, msg) { return messageSlotKey(ctx, index, msg); }
export function baseSlotOf(slot = '') {
    const parsed = parseMessageIndexFromOwnerKey(slot);
    if (parsed?.sourceHash) {
        const suffix = `:${parsed.index}:${parsed.swipe}:${parsed.sourceHash}`;
        return String(slot).endsWith(suffix) ? String(slot).slice(0, -suffix.length) + `:${parsed.index}:${parsed.swipe}` : `${chatKey(getContext())}:${parsed.index}:${parsed.swipe}`;
    }
    return String(slot || '');
}
export function slotSearchKeys(slot = '', aliases = []) {
    const values = [String(slot || ''), ...(Array.isArray(aliases) ? aliases : [])].filter(Boolean);
    const expanded = [];
    for (const value of values) {
        expanded.push(value);
        const base = baseSlotOf(value);
        if (base)
            expanded.push(base);
    }
    return [...new Set(expanded)];
}
export function findSavedRecord(store, slot, aliases = []) {
    for (const candidate of slotSearchKeys(slot, aliases)) {
        const exact = store?.[candidate];
        if (exact?.html)
            return exact;
    }
    return null;
}
export function saveRecordForSlot(store, slot, value, { dropLegacy = true } = {}) {
    if (dropLegacy) {
        const base = baseSlotOf(slot);
        if (base && base !== slot)
            delete store[base];
    }
    store[slot] = value;
    return store;
}
function visibleChatMessageElement(index) {
    const root = document.querySelector('#chat');
    if (!root)
        return null;
    const wanted = String(index);
    for (const node of root.children || []) {
        if (node instanceof Element && node.matches?.('.mes') && node.getAttribute?.('mesid') === wanted && node.isConnected)
            return node;
    }
    return null;
}
export function messageElement(index) {
    if (isRabbitMirrorManagedChatSurface()) {
        const leased = getRabbitMirrorMountedMessages().find(context => context.mesid === Number(index) && !context.signal.aborted)?.element;
        if (leased?.isConnected)
            return leased;
        return visibleChatMessageElement(index);
    }
    return document.querySelector(`#chat .mes[mesid="${index}"], #chat [mesid="${index}"].mes, #chat [mesid="${index}"]`);
}
export function messageBody(el) { return el?.querySelector?.('.mes_text') || el; }
const HOST_SYSTEM_MESSAGE_TYPES = new Set(['help', 'welcome', 'empty', 'generic', 'narrator', 'comment', 'slash_commands', 'formatting', 'hotkeys', 'macros', 'welcome_prompt', 'assistant_note', 'assistant_message']);
export function isHostSystemMessage(message) {
    const type = message?.extra?.type;
    return typeof type === 'string' && HOST_SYSTEM_MESSAGE_TYPES.has(type);
}
export function isRabbitMirrorToolResultMessage(message) {
    const extra = message?.extra;
    return message?.is_system === true
        || extra?.isSmallSys === true
        || isHostSystemMessage(message)
        || !!(extra && Object.prototype.hasOwnProperty.call(extra, 'tool_invocations'));
}
export function isRabbitMirrorEligibleAssistantMessage(message) {
    return !!message
        && message.is_user !== true
        && !isRabbitMirrorToolResultMessage(message)
        && typeof message.mes === 'string';
}
export function assistantMessages(ctx) { const chat = Array.isArray(ctx.chat) ? ctx.chat : []; return chat.map((m, i) => ({ m, i })).filter(x => isRabbitMirrorEligibleAssistantMessage(x.m)); }
export function lastAssistantMessage(ctx) {
    const chat = Array.isArray(ctx?.chat) ? ctx.chat : [];
    for (let i = chat.length - 1; i >= 0; i--) {
        const m = chat[i];
        if (isRabbitMirrorEligibleAssistantMessage(m))
            return { m, i };
    }
    return null;
}
export function recentAssistantMessages(ctx, limit = 6) {
    const chat = Array.isArray(ctx?.chat) ? ctx.chat : [];
    const rows = [];
    const max = Math.max(1, Math.min(12, Number(limit) || 6));
    let examined = 0;
    for (let i = chat.length - 1; i >= 0 && rows.length < max && examined < max * 8; i--, examined++) {
        const m = chat[i];
        if (isRabbitMirrorEligibleAssistantMessage(m))
            rows.unshift({ m, i });
    }
    return rows;
}
export function messageBodyFingerprint(m) { return hashText(String(m?.mes || '')); }
export function messageReasoningFingerprint() { return ''; }
function visibleDisplayTextOf(m) { return typeof m?.extra?.display_text === 'string' ? m.extra.display_text : ''; }
export function messageDisplayFingerprint(m) { const value = visibleDisplayTextOf(m); return value && value !== String(m?.mes || '') ? hashText(value) : ''; }
export function messageSourceFingerprint(m) {
    return messageBodyFingerprint(m);
}
export function copyIndependentOwnerLineage(value) {
    if (!value || typeof value.id !== 'string' || !value.id || typeof value.chatKey !== 'string' || !value.chatKey
        || !Number.isInteger(value.mesid) || value.mesid < 0 || !Number.isInteger(value.swipe) || value.swipe < 0
        || typeof value.originSourceHash !== 'string' || !value.originSourceHash
        || typeof value.acceptedBodyHash !== 'string' || !value.acceptedBodyHash)
        return null;
    return { id: value.id, chatKey: value.chatKey, mesid: value.mesid, swipe: value.swipe,
        originSourceHash: value.originSourceHash, acceptedBodyHash: value.acceptedBodyHash, observedAt: Number(value.observedAt) || 0 };
}
export function independentLineageOriginSlot(record) {
    const lineage = copyIndependentOwnerLineage(record?.ownerLineage);
    if (!lineage || lineage.originSourceHash !== String(record?.sourceHash || record?.bodyHash || ''))
        return '';
    return `${lineage.chatKey}:${lineage.mesid}:${lineage.swipe}:${lineage.originSourceHash}`;
}
function independentLineageMatchesObserved(record, observed) {
    const lineage = copyIndependentOwnerLineage(record?.ownerLineage);
    const owner = observed?.[INDEPENDENT_OWNER_OBSERVATION] || observed;
    const ctx = owner?.ctx, msg = owner?.msg, index = owner?.index;
    if (!lineage || !independentLineageOriginSlot(record) || !ctx || ctx.chat?.[index] !== msg
        || lineage.chatKey !== chatKey(ctx) || lineage.mesid !== Number(index) || lineage.swipe !== swipeId(msg)
        || lineage.acceptedBodyHash !== String(observed?.bodyHash || observed?.sourceHash || ''))
        return false;
    const marker = msg?.extra?.rabbitMirrorOwnerLineage;
    return !marker || (marker.revoked !== true && marker.id === lineage.id && marker.swipe === lineage.swipe);
}
export function bindIndependentRecordContinuity(ctx, index, msg, record, store = null, { completed = false, commit = true } = {}) {
    if (!record?.html || ctx?.chat?.[index] !== msg)
        return false;
    const sourceHash = messageSourceFingerprint(msg);
    const original = String(record.sourceHash || record.bodyHash || '');
    const observed = { sourceHash, bodyHash: sourceHash, [INDEPENDENT_OWNER_OBSERVATION]: { ctx, index, msg } };
    if (!original || (original !== sourceHash && !independentLineageMatchesObserved(record, observed)))
        return false;
    const base = messageBaseSlotKey(ctx, index, msg);
    if (!completed && (hostGenerationLooksActive() || activeIndependentFlightForBase(base)
        || hasExplicitSourceReplacementEvidence(ctx, index, msg)))
        return false;
    let lineage = copyIndependentOwnerLineage(record.ownerLineage);
    const marker = msg.extra?.rabbitMirrorOwnerLineage;
    if (!completed && marker && (marker.revoked === true || (lineage && marker.id !== lineage.id)))
        return false;
    if (lineage && (lineage.chatKey !== chatKey(ctx) || lineage.mesid !== Number(index) || lineage.swipe !== swipeId(msg)
        || lineage.originSourceHash !== original))
        return false;
    const created = !lineage;
    if (!lineage)
        lineage = { id: `${Date.now().toString(36)}:${++independentRecordContinuitySequence}:${hashText(base + original)}`,
            chatKey: chatKey(ctx), mesid: Number(index), swipe: swipeId(msg), originSourceHash: original,
            acceptedBodyHash: sourceHash, observedAt: Date.now() };
    record.ownerLineage = lineage;
    if (!commit)
        return created;
    if (!msg.extra || typeof msg.extra !== 'object')
        msg.extra = {};
    msg.extra.rabbitMirrorOwnerLineage = { id: lineage.id, swipe: lineage.swipe };
    independentRecordContinuity.set(msg, { chat: ctx.chat, index: Number(index), base, epoch: operationEpochForBase(base),
        id: lineage.id, slot: independentLineageOriginSlot(record), acceptedBodyHash: lineage.acceptedBodyHash });
    if (created && store) {
        saveRecordForSlot(store, independentLineageOriginSlot(record), record, { dropLegacy: false });
        writePersistedOwner(ctx, index, msg, record, { overwrite: true });
    }
    return created;
}
export function updateIndependentRecordContinuity(ctx, index, msg, store) {
    const proof = independentRecordContinuity.get(msg);
    if (!proof || proof.chat !== ctx.chat || proof.index !== Number(index) || proof.base !== messageBaseSlotKey(ctx, index, msg)
        || proof.epoch !== operationEpochForBase(proof.base) || hostGenerationLooksActive()
        || activeIndependentFlightForBase(proof.base) || hasExplicitSourceReplacementEvidence(ctx, index, msg))
        return false;
    const metadata = persistedOwnerForMessage(ctx, index, msg);
    if (metadata?.deleted)
        return false;
    const record = store?.[proof.slot] || metadata;
    const lineage = copyIndependentOwnerLineage(record?.ownerLineage);
    const marker = msg.extra?.rabbitMirrorOwnerLineage;
    if (!record?.html || !lineage || lineage.id !== proof.id || independentLineageOriginSlot(record) !== proof.slot
        || lineage.acceptedBodyHash !== proof.acceptedBodyHash || !marker || marker.revoked === true
        || marker.id !== proof.id || marker.swipe !== swipeId(msg))
        return false;
    const bodyHash = messageSourceFingerprint(msg);
    if (bodyHash === lineage.acceptedBodyHash || !String(msg.mes || '').trim())
        return false;
    const next = { ...record, ownerLineage: { ...lineage, acceptedBodyHash: bodyHash, observedAt: Date.now() } };
    saveRecordForSlot(store, proof.slot, next, { dropLegacy: false });
    writePersistedOwner(ctx, index, msg, next, { overwrite: true });
    setOwnerLockForBase(proof.base, proof.slot, lineage.originSourceHash);
    proof.acceptedBodyHash = bodyHash;
    writeStore(store);
    const stored = readStore()?.[proof.slot];
    if (stored?.html !== next.html || stored?.ownerLineage?.acceptedBodyHash !== bodyHash)
        showIndependentUnsavedOutput(next, proof.slot);
    return true;
}
export function revokeIndependentRecordContinuity(ctx, index) {
    const msg = ctx?.chat?.[index];
    if (!msg)
        return;
    independentRecordContinuity.delete(msg);
    if (msg.extra?.rabbitMirrorOwnerLineage)
        msg.extra.rabbitMirrorOwnerLineage = { revoked: true, swipe: swipeId(msg) };
}
export function savedIndependentRecordForOwner(ctx, index, msg, store, observed = passiveObservedIdentity(ctx, index, msg)) {
    const persisted = persistedOwnerForMessage(ctx, index, msg);
    if (persisted?.deleted)
        return null;
    const locked = lockedIndependentRecordForBase(messageBaseSlotKey(ctx, index, msg), store)?.record;
    return [findSavedRecord(store, observed.slot, observed.legacySlots || []), locked, persisted]
        .filter(record => record?.html && savedRecordMatchesObserved(record, observed) && independentStoredHtmlRestorable(record.html))
        .sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0)
        || Number(b.ownerLineage?.observedAt || 0) - Number(a.ownerLineage?.observedAt || 0))[0] || null;
}
export function savedRecordMatchesObserved(saved, observed) {
    if (!saved?.html || !observed)
        return false;
    const observedBody = String(observed.bodyHash || observed.sourceHash || '');
    const savedSource = String(saved.sourceHash || '');
    if (savedSource && savedSource === String(observed.sourceHash || ''))
        return true;
    const savedBody = String(saved.bodyHash || '');
    if (savedBody && observedBody && savedBody === observedBody)
        return true;
    return !!(savedSource && observedBody && savedSource === observedBody) || independentLineageMatchesObserved(saved, observed);
}
export function observeMessageSourceRevision(ctx, index, msg) {
    const slot = messageSlotKey(ctx, index, msg);
    const sourceHash = messageSourceFingerprint(msg);
    const previous = messageSourceRevisions.get(slot);
    const revision = previous && previous.sourceHash === sourceHash ? previous.revision : Number(previous?.revision || 0) + 1;
    const value = { slot, sourceHash, bodyHash: messageBodyFingerprint(msg), displayHash: messageDisplayFingerprint(msg), reasoningHash: messageReasoningFingerprint(msg), legacySlots: legacyMessageSlotKeys(ctx, index, msg), revision, seenAt: Date.now(), [INDEPENDENT_OWNER_OBSERVATION]: { ctx, index, msg } };
    messageSourceRevisions.set(slot, value);
    if (messageSourceRevisions.size > 400) {
        const stale = [...messageSourceRevisions.entries()].sort((a, b) => Number(a[1]?.seenAt || 0) - Number(b[1]?.seenAt || 0)).slice(0, messageSourceRevisions.size - 320);
        for (const [key] of stale)
            messageSourceRevisions.delete(key);
    }
    return value;
}
function normalizeWorldInfoBookName(value = '') {
    const name = String(value || '').trim();
    return name && name.length <= WORLD_INFO_BOOK_NAME_MAX_CHARS ? name : '';
}
export function currentWorldInfoBookScope(ctx = getContext()) {
    const scope = String(chatKey(ctx) || '').trim();
    return scope && Array.isArray(ctx?.chat) ? scope : '';
}
function observedWorldInfoBookMapKey(scope = '', name = '') { return `${String(scope || '')}\u0000${String(name || '')}`; }
function trimObservedWorldInfoBookCache() {
    if (observedWorldInfoBooks.size <= WORLD_INFO_BOOK_CACHE_LIMIT)
        return;
    const stale = [...observedWorldInfoBooks.entries()]
        .sort((a, b) => Number(a[1]?.lastSeen || 0) - Number(b[1]?.lastSeen || 0))
        .slice(0, observedWorldInfoBooks.size - WORLD_INFO_BOOK_CACHE_LIMIT);
    for (const [key] of stale)
        observedWorldInfoBooks.delete(key);
}
function loadObservedWorldInfoBookCache() {
    if (observedWorldInfoBookCacheLoaded)
        return;
    observedWorldInfoBookCacheLoaded = true;
    try {
        const rows = JSON.parse(localStorage.getItem(WORLD_INFO_BOOK_CACHE_KEY) || '[]');
        if (!Array.isArray(rows))
            return;
        for (const row of rows.slice(0, WORLD_INFO_BOOK_CACHE_LIMIT)) {
            const scope = String(row?.scope || '').trim();
            const name = normalizeWorldInfoBookName(row?.name);
            if (!scope || !name)
                continue;
            const sources = new Set(Array.isArray(row?.sources) ? row.sources.map(value => String(value || '').trim()).filter(Boolean).slice(0, 4) : []);
            observedWorldInfoBooks.set(observedWorldInfoBookMapKey(scope, name), { scope, name, sources, lastSeen: Number(row?.lastSeen) || 0 });
        }
    }
    catch { }
}
function persistObservedWorldInfoBookCache() {
    try {
        const rows = [...observedWorldInfoBooks.values()]
            .sort((a, b) => Number(b.lastSeen || 0) - Number(a.lastSeen || 0))
            .slice(0, WORLD_INFO_BOOK_CACHE_LIMIT)
            .map(item => ({ scope: item.scope, name: item.name, sources: [...item.sources].slice(0, 4), lastSeen: Number(item.lastSeen) || 0 }));
        localStorage.setItem(WORLD_INFO_BOOK_CACHE_KEY, JSON.stringify(rows));
    }
    catch { }
}
export function dispatchWorldInfoBooksChanged(scope = currentWorldInfoBookScope()) {
    try {
        globalThis.dispatchEvent?.(new CustomEvent(WORLD_INFO_BOOKS_CHANGED_EVENT, { detail: { scope: String(scope || '') } }));
    }
    catch { }
}
function rememberObservedWorldInfoBook(nameValue, sourceName = '', scopeValue = currentWorldInfoBookScope()) {
    loadObservedWorldInfoBookCache();
    const scope = String(scopeValue || '').trim();
    const name = normalizeWorldInfoBookName(nameValue);
    if (!scope || !name)
        return false;
    const source = String(sourceName || '').trim();
    const key = observedWorldInfoBookMapKey(scope, name);
    const current = observedWorldInfoBooks.get(key) || { scope, name, sources: new Set(), lastSeen: 0 };
    const wasKnown = observedWorldInfoBooks.has(key);
    const hadSource = source ? current.sources.has(source) : true;
    if (source)
        current.sources.add(source);
    current.lastSeen = Date.now();
    observedWorldInfoBooks.set(key, current);
    trimObservedWorldInfoBookCache();
    return !wasKnown || !hadSource;
}
function observeWorldInfoBooksFromPayload(payload) {
    if (!payload || typeof payload !== 'object')
        return 0;
    const scope = currentWorldInfoBookScope();
    if (!scope)
        return 0;
    const sourceNames = ['globalLore', 'characterLore', 'chatLore', 'personaLore'];
    let changed = 0;
    for (const sourceName of sourceNames) {
        const rows = payload[sourceName];
        if (!Array.isArray(rows))
            continue;
        for (const entry of rows) {
            if (rememberObservedWorldInfoBook(entry?.world, sourceName, scope))
                changed += 1;
        }
    }
    if (changed) {
        persistObservedWorldInfoBookCache();
        dispatchWorldInfoBooksChanged(scope);
    }
    return changed;
}
export function getObservedWorldInfoBooks() {
    loadObservedWorldInfoBookCache();
    const scope = currentWorldInfoBookScope();
    if (!scope)
        return [];
    return [...observedWorldInfoBooks.values()]
        .filter(item => item.scope === scope)
        .map(item => ({ name: item.name, sources: [...item.sources], lastSeen: Number(item.lastSeen) || 0 }))
        .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
}
export async function fetchWorldInfoBooks() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WORLD_INFO_BOOK_LIST_TIMEOUT_MS);
    try {
        const response = await fetch('/api/worldinfo/list', {
            method: 'POST',
            credentials: 'same-origin',
            headers: await serverRequestHeaders(),
            body: '{}',
            signal: controller.signal,
        });
        let payload = null;
        try {
            payload = await response.json();
        }
        catch { }
        if (!response.ok)
            throw new Error(`${__rmT("ssLRrPJpKoWjqmVdgwSAlAtMSvzGPu61vsN_0Rc1")}${response.status || '?'}`);
        if (!Array.isArray(payload))
            throw new Error(__rmT("SR59PJUL3QPskIBDFT9sS6mepo_"));
        const books = new Map();
        for (const item of payload) {
            const id = normalizeWorldInfoBookName(item?.file_id ?? item?.name);
            if (!id)
                continue;
            const displayName = normalizeWorldInfoBookName(item?.name) || id;
            if (!books.has(id))
                books.set(id, { id, name: id, label: displayName });
        }
        return [...books.values()].sort((a, b) => String(a.label || a.id).localeCompare(String(b.label || b.id), 'zh-Hans-CN'));
    }
    catch (error) {
        if (controller.signal.aborted)
            throw new Error(__rmT("ssLRrPJpKoWjqmVdgwhkFFkZWZkjQEoKCuDI1Z0l"));
        throw error;
    }
    finally {
        clearTimeout(timeoutId);
    }
}
function globalWorldInfoBookEnabledForCapture(capture, worldValue = '') {
    const world = normalizeWorldInfoBookName(worldValue);
    if (!world)
        return false;
    return !capture?.disabledBooks?.has?.(world);
}
function globalWorldInfoEntryKey(entry) {
    const world = String(entry?.world || '').trim();
    const uid = entry?.uid;
    return world && uid !== undefined && uid !== null ? `${world}::${String(uid)}` : '';
}
function pruneGlobalWorldInfoSnapshots(now = Date.now()) {
    for (const [key, value] of globalWorldInfoSnapshots.entries()) {
        if (!value || now - Number(value.ts || 0) > GLOBAL_WORLD_INFO_SNAPSHOT_TTL_MS)
            globalWorldInfoSnapshots.delete(key);
    }
    if (globalWorldInfoSnapshots.size > GLOBAL_WORLD_INFO_SNAPSHOT_LIMIT) {
        const stale = [...globalWorldInfoSnapshots.entries()].sort((a, b) => Number(a[1]?.ts || 0) - Number(b[1]?.ts || 0)).slice(0, globalWorldInfoSnapshots.size - GLOBAL_WORLD_INFO_SNAPSHOT_LIMIT);
        for (const [key] of stale)
            globalWorldInfoSnapshots.delete(key);
    }
}
function globalWorldInfoSnapshotKey(ctx, index, msg) {
    const owner = chatKey(ctx);
    const source = messageSourceFingerprint(msg);
    return owner && Number.isInteger(Number(index)) && source ? `${owner}|${Number(index)}|${source}` : '';
}
export function beginGlobalWorldInfoCapture(ctx = getContext(), dryRun = false, generationType = '', generationOptions = null, preserveExisting = false) {
    const type = typeof generationType === 'string' ? generationType.trim().toLowerCase() : '';
    const optionsOk = generationOptions === undefined || generationOptions === null || typeof generationOptions === 'object';
    if (!type || !optionsOk || !GLOBAL_WORLD_INFO_OWNER_GENERATION_TYPES.has(type))
        return;
    const optionDryRun = generationOptions?.dryRun === true || generationOptions?.dry_run === true;
    if (dryRun === true || optionDryRun || type === 'quiet' || type === 'impersonate')
        return;
    if (runtimeMode() !== 'independent' || getSettings().independentReadGlobalWorldInfo !== true) {
        activeGlobalWorldInfoCapture = null;
        return;
    }
    const last = lastAssistantMessage(ctx);
    const owner = chatKey(ctx);
    const baseline = last ? `${last.i}:${messageSourceFingerprint(last.m)}` : '';
    const current = activeGlobalWorldInfoCapture;
    if (preserveExisting && current && current.chat === owner && current.baseline === baseline) {
        current.nestedStartCount = Number(current.nestedStartCount || 0) + 1;
        current.lastNestedStartAt = Date.now();
        return;
    }
    activeGlobalWorldInfoCapture = {
        chat: owner, startedAt: Date.now(), loadedKeys: new Set(), activated: [], sawEntriesLoaded: false, sawActivated: false,
        baseline, nestedStartCount: 0, lastNestedStartAt: 0,
        disabledBooks: new Set((getSettings().independentWorldInfoDisabledBooks || []).map(value => normalizeWorldInfoBookName(value)).filter(Boolean)),
        skippedDisabledBooks: new Set(),
    };
}
export function captureGlobalWorldInfoEntriesLoaded(payload) {
    if (!payload || typeof payload !== 'object')
        return;
    observeWorldInfoBooksFromPayload(payload);
    const capture = activeGlobalWorldInfoCapture;
    if (!capture || capture.chat !== chatKey(getContext()))
        return;
    const sourceNames = ['globalLore', 'characterLore', 'chatLore', 'personaLore'];
    let sawRecognizedArray = false;
    for (const sourceName of sourceNames) {
        const rows = payload[sourceName];
        if (!Array.isArray(rows))
            continue;
        sawRecognizedArray = true;
        for (const entry of rows) {
            const key = globalWorldInfoEntryKey(entry);
            if (key)
                capture.loadedKeys.add(key);
        }
    }
    if (!sawRecognizedArray)
        return;
    capture.sawEntriesLoaded = true;
}
export function captureActivatedGlobalWorldInfo(entries) {
    const capture = activeGlobalWorldInfoCapture;
    if (!capture || capture.chat !== chatKey(getContext()) || !capture.sawEntriesLoaded)
        return;
    if (!Array.isArray(entries))
        return;
    const rows = entries;
    const seen = new Set(capture.activated.map(item => item.key));
    for (const entry of rows) {
        const key = globalWorldInfoEntryKey(entry);
        if (!key || !capture.loadedKeys.has(key) || seen.has(key))
            continue;
        const world = String(entry?.world || '').trim();
        if (!globalWorldInfoBookEnabledForCapture(capture, world)) {
            if (world)
                capture.skippedDisabledBooks?.add?.(world);
            continue;
        }
        const content = String(entry?.content || '').trim();
        if (!content)
            continue;
        capture.activated.push({ key, content, world });
        seen.add(key);
    }
    capture.sawActivated = true;
}
export function finishGlobalWorldInfoCapture(ctx = getContext()) {
    const capture = activeGlobalWorldInfoCapture;
    if (!capture || capture.chat !== chatKey(ctx)) {
        activeGlobalWorldInfoCapture = null;
        return null;
    }
    const last = lastAssistantMessage(ctx);
    if (!last)
        return null;
    const identity = `${last.i}:${messageSourceFingerprint(last.m)}`;
    if (identity === capture.baseline)
        return null;
    activeGlobalWorldInfoCapture = null;
    const key = globalWorldInfoSnapshotKey(ctx, last.i, last.m);
    if (!key)
        return null;
    const contents = [];
    const seen = new Set();
    const books = new Set();
    for (const item of capture.activated) {
        const text = String(item?.content || '').trim();
        if (!text || seen.has(text))
            continue;
        seen.add(text);
        contents.push(text);
        const world = String(item?.world || '').trim();
        if (world)
            books.add(world);
    }
    const text = contents.join('\n\n');
    const snapshot = { text, entries: [...contents], entryCount: contents.length, chars: text.length, books: [...books], skippedDisabledBooks: [...(capture.skippedDisabledBooks || [])], ts: Date.now(), source: 'main-generation-activated-world-info' };
    pruneGlobalWorldInfoSnapshots(snapshot.ts);
    globalWorldInfoSnapshots.set(key, snapshot);
    pruneGlobalWorldInfoSnapshots(snapshot.ts);
    return snapshot;
}
export function globalWorldInfoSnapshotFor(ctx, index, msg) {
    if (getSettings().independentReadGlobalWorldInfo !== true)
        return null;
    pruneGlobalWorldInfoSnapshots();
    const key = globalWorldInfoSnapshotKey(ctx, index, msg);
    if (!key)
        return null;
    const value = globalWorldInfoSnapshots.get(key);
    if (!value)
        return null;
    if (Date.now() - Number(value.ts || 0) > GLOBAL_WORLD_INFO_SNAPSHOT_TTL_MS) {
        globalWorldInfoSnapshots.delete(key);
        return null;
    }
    return value;
}
export function safeJson(value, max = 24000) { try {
    const seen = new WeakSet();
    const t = JSON.stringify(value, (key, item) => { if (typeof item === 'function')
        return `[Function ${item.name || 'anonymous'}]`; if (item && typeof item === 'object') {
        if (seen.has(item))
            return '[Circular]';
        seen.add(item);
    } return item; }, 2);
    return t.length > max ? t.slice(0, max) + __rmT("QmM_bxeytbf6IPEq") : t;
}
catch {
    return '';
} }
function quoteIndependentContextHeaderLines(value = '') {
    return String(value || '').replace(__rmR("aoVelJ_TG6kk3XY2N89QFz2173Sxkj7xJfSZDso7sEfgBtHPOPuVA9cGYpS6XU7l18vL40rHPJNEmRHfyGSrjbMI0J6tLSfNb1DneKQPhPWFppZpTjfvOnf4VxsP1iU_CM7.pyuLVTRHSJgDv3F6vGfOBwDDDnXUlSmSvFC48cBeAlRx5_qDUF09GGOqMoZHMusf.nBa2to._KeO6eEwlumWZuIUq3Wdw861QH4qWWSSe53ZMoge6uHNgFtVIyR4Tfu1GthUEpTYUmw0cyhPqECLVZDkByQY9rgVl3Agep6QoaOflBIriFhOR5VmYmKEF5mU1FOMQa8", "gm"), line => JSON.stringify(line));
}
function neutralizeGlobalWorldInfoReservedMarkup(value = '') {
    return String(value || '').replace(/<\s*(\/?)\s*toto\b/gi, (_match, slash) => `${__rmT("fis")}${slash ? '/' : ''}toto`);
}
export function globalWorldInfoContextView(snapshot, maxChars = GLOBAL_WORLD_INFO_CONTEXT_BUDGET) {
    const excluded = independentContextExcludedTagSet();
    const allEntries = (Array.isArray(snapshot?.entries)
        ? snapshot.entries.map(item => String(item || '').trim()).filter(Boolean)
        : (String(snapshot?.text || '').trim() ? [String(snapshot.text).trim()] : []));
    const formatEntries = allEntries.filter(isOutputFormatInstruction).length;
    const rawEntries = allEntries.filter(item => !isOutputFormatInstruction(item)).map(item => stripExcludedTagsFromReference(item, excluded)).filter(Boolean);
    if (!rawEntries.length)
        return { block: '', includedEntries: 0, totalEntries: 0, chars: 0, truncated: false, formatEntriesSkipped: formatEntries };
    const budget = Math.max(1000, Number(maxChars) || GLOBAL_WORLD_INFO_CONTEXT_BUDGET);
    const parts = [];
    let used = 0;
    let included = 0;
    let truncatedCurrent = false;
    for (let i = 0; i < rawEntries.length; i += 1) {
        const content = quoteIndependentContextHeaderLines(neutralizeGlobalWorldInfoReservedMarkup(rawEntries[i])).trim();
        if (!content)
            continue;
        const prefix = `${__rmT("trcpYGXhUz3cMBIRgPD")}${i + 1}]\n`;
        const joiner = parts.length ? '\n\n' : '';
        const full = `${joiner}${prefix}${content}`;
        if (used + full.length <= budget) {
            parts.push(`${prefix}${content}`);
            used += full.length;
            included += 1;
            continue;
        }
        if (!parts.length) {
            const marker = __rmT("5bQtqpy1.W16nP8.3Y6wJ3iuqgq93uzBzf.upupZA8xiekIpgD4s.gKPv2ZMe1sY");
            const allowance = Math.max(0, budget - prefix.length - marker.length);
            parts.push(`${prefix}${content.slice(0, allowance)}${marker}`);
            used = parts[0].length;
            included = 1;
            truncatedCurrent = true;
        }
        break;
    }
    const omitted = Math.max(0, rawEntries.length - included);
    const note = [truncatedCurrent ? __rmT("5_qPSA9e1Vqc6sfLrhS2Hq12bNs") : '', omitted ? `${__rmT("SRJPWcc6")}${omitted}${__rmT("kbjgalCEHpMLV86fgAwcmoyoMz6Hp.BhUqIwEZE7Ya4C.n.Bq8_")}` : ''].filter(Boolean).join(' ');
    const body = parts.join('\n\n');
    const block = body ? `${__rmT("u_pmBepjac7kZbWiu1Eo.J.C_UTN4P6vXXQ0Iom4jNK1NxvmrCl5Y6MWBWk2MMMZpJLDVixBJXGxFkZ9h_siwfYu8pjNtACVMbw_07EQAO8h2pF8JabZBsAW7msB5m1_JYFophdBZKbRYQ5IGS5rjWSHxn3TOCBNUrp5_LmINIkKrBrofy7vdSTop3XqBC.TeQ_VUpmJgntNzReCXx6Hz7tM4pLog0mn6P0SZ1FMyWlQGAHzDRmOSsz5gPJl97c0")}${body}${note ? `\n${note}` : ''}` : '';
    return { block, includedEntries: included, totalEntries: rawEntries.length, chars: body.length, truncated: truncatedCurrent || omitted > 0, formatEntriesSkipped: formatEntries };
}
export function stripHistoricalRabbitMirrorBlocks(value = '') {
    const source = String(value || '');
    let filteredRabbitMirrorChars = 0;
    const text = source.replace(HISTORICAL_RABBIT_MIRROR_BLOCK_RE, match => {
        filteredRabbitMirrorChars += match.length;
        return '';
    });
    return { text: text.replace(/\n{3,}/g, '\n\n').trim(), filteredRabbitMirrorChars };
}
function decodeIndependentVisibleEntities(value = '') {
    const text = String(value || '');
    if (typeof document !== 'undefined' && document.createElement) {
        try {
            const textarea = document.createElement('textarea');
            textarea.innerHTML = text;
            return String(textarea.value || '');
        }
        catch { }
    }
    return text.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'");
}
const OUTPUT_FORMAT_WORDS_RE = __rmR("CRYg3WcdjtXh5ftak92O4NcysfuOUBHhDF_o6W.f4AEcsbHVZ.Mr8OxP.itYhMTlZcHhJSt3mSwGpZMRHvh8_D_3RClEpof9Ug2iu_WMxEL3WtEVRnUyNIueu8Ja.E_rGGEe8KzccKwHv83OUxvlU0GtMkgq31Sl8CMOI_TyXeI2b7RGxVBIz8Y1z1OSNyrDD3gbdHUmAq6MtAfBCFSwQtY4TAujwAQdD7ovlzBXJ9SNtLcSlBK9Uhpz8CpQVOF5GJEM_Rm9stwqZyEPkHP1A2shLtSHmn1RkW2KSlubpKTulk4no4TBWp4vQpAv1b0wbfNNCKCc1Eu0psxVvs60V0Cp4uDtt7InXF_N0bLpILvCBppBMMThvVQKv8mmsGmxYNkJ8aOQ3TrWXopmkeDs5C9XZtIAJ69Cuz00QSimGVfVmWe39Jq5_IXnRFBdv3KVk2TRF0ZkcnJM80DqZsVO4RPiCHc.k2E7II0vs2O2HatSJsrAEuAFshi9J3zQtrgT9iFLY5N_6Su6ZnI4306NJn61KRhQIPh9XEGcJWpF59gjGL4pRGtbb07mREPL5SAq4wtvnLRXqMT3u.VYMvTgutepXMjcVdXUOkPBYJ4uV4P6SOo24IRi9kDtnDmYksinpAR1HdHOo6YZDq9lmAutQO.XCCu86vWpdlVXcpWMZXIQJYad9E7PjjU4m4JeUKuE", "i");
const ST_MACRO_NAMES = new Set(['char', 'user', 'charifnotgroup', 'group', 'groupnotmuted', 'notchar', 'persona', 'original', 'description', 'personality', 'scenario', 'mesexamples', 'mesexamplesraw', 'charprompt', 'charjailbreak', 'charinstruction', 'charversion', 'char_version', 'systemprompt', 'random', 'pick', 'roll', 'time', 'date', 'weekday', 'isotime', 'isodate', 'datetimeformat', 'time_utc', 'timediff', 'idle_duration', 'lastmessage', 'lastmessageid', 'lastcharmessage', 'lastusermessage', 'lastswipeid', 'currentswipeid', 'firstincludedmessageid', 'input', 'newline', 'trim', 'noop', 'setvar', 'getvar', 'addvar', 'incvar', 'decvar', 'setglobalvar', 'getglobalvar', 'addglobalvar', 'incglobalvar', 'decglobalvar', 'var', 'globalvar', 'pipe', 'outlet', 'model', 'maxprompt', 'banned', 'comment', 'reverse', 'else', 'space', 'user_name', 'char_name']);
function isTemplatePlaceholder(inner) {
    const text = String(inner || '').trim();
    if (!text || /^[#\/!]/.test(text) || text.startsWith('//'))
        return false;
    const name = (text.match(/^[A-Za-z_][\w-]*/)?.[0] || '').toLowerCase();
    if (name && (ST_MACRO_NAMES.has(name) || /^(?:char|user)[_-]/.test(name)))
        return false;
    return true;
}
export function isOutputFormatInstruction(value = '') {
    const text = String(value || '');
    if (!OUTPUT_FORMAT_WORDS_RE.test(text))
        return false;
    const placeholders = [...text.matchAll(/\{\{([^{}\n]{1,40})\}\}/g)].filter(match => isTemplatePlaceholder(match[1])).length;
    const pairedTag = __rmR("LLKF7ljGVILGil.91Yr8wZ6ymQkrKKPuU2t_PvOKenGDvPdXjsPpWx9u.16Qodmh4z6mHUoBxGhHjF46OX9iHxpFOE3CE1ezTz03dMYphNnMpSuv4zLQr4pl6t4ZWIRzWwc9VjcIgj8EL5dyEyh.FrMZd19cE7R.MJKLcwJR2oM4uhHFYKekJT", "").test(text) || /<\s*status[ _-]?bar\b/i.test(text);
    const segments = (text.match(__rmR("BGVYhFxPx6_QBZDBJMxU2Nuzx4bJRKeKonXBMhi9M2c1bEvXpRwb.ZK3opERuh458_hQ5BjH6jsTf7ZxB1PY3zJaCREjenDngKNm97nN", "g")) || []).length;
    return placeholders >= 2 || pairedTag || segments >= 2;
}
const REFERENCE_TAG_TOKEN_RE = __rmR("pi5jk53VDySWcR7bsDy6Y7zeh2PM99th8.aWHOcA3yqiX9CLKaM_PTxC7ZhEonMEUkJomGPI5tvROJKzrbfNlFOee0Es5t2ikNoDrfGfUsy2ADlNAvpmsf0trrRZDaoHYjYHA3305tDO1XramOYHUUPmw6UmCl19U_fJxsI122BpRkowKdIqezbUnJHtbbjaK68.0mSVct4MxYpStFI0DhFXP1R537r8sAvpWZDBL7lJS_zWMCfKSoKCv01SL_po.0iW0Ij4_LE", "u");
export function stripExcludedTagsFromReference(value = '', excludedTags = independentContextExcludedTagSet()) {
    const original = String(value ?? '');
    const selected = excludedTags instanceof Set ? excludedTags : new Set(normalizeIndependentContextExcludedTags(excludedTags));
    if (!selected.size || !__rmR("61ecOfw6r_lUTh", "").test(original))
        return original;
    let source = decodeConfiguredIndependentTagTokens(original, selected);
    if (source.includes(__rmT("fis"))) {
        for (const tag of selected) {
            const escaped = String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            source = source.replace(new RegExp(`${__rmT("lV3XYgC7yODVB0PGk6hNJgar6KtiJk")}${escaped}${__rmT("VGpThXuPTP_QBfCB4JxA2B3zK0bWRKeKI0mQMOo9hPAkbP9X3KwEZSU3bY.tdYDlOEOP5BnHqqs4fnJxJqPD34iaCKEeejsn232J9e_U")}`, 'giu'), (_match, inner) => `<${inner}>`);
        }
    }
    const tokens = [];
    for (let cursor = source.indexOf('<'); cursor >= 0; cursor = source.indexOf('<', cursor + 1)) {
        const token = scanIndependentMarkupToken(source, cursor);
        if (!token || !token.name || !selected.has(token.name))
            continue;
        const tokenText = source.slice(cursor, token.end);
        if (!REFERENCE_TAG_TOKEN_RE.test(tokenText))
            continue;
        if ((tokenText.replace(/"[^"]*"|'[^']*'/g, '').match(/\s[^\s=\/>]+(?=\s|\/?>)(?!\s*=)/g) || []).length > 2)
            continue;
        tokens.push({ start: cursor, end: token.end, name: token.name, closing: token.closing, selfClosing: token.selfClosing });
        cursor = token.end - 1;
    }
    if (!tokens.length)
        return original;
    const ranges = [];
    const stacks = new Map();
    for (const token of tokens) {
        if (token.selfClosing) {
            ranges.push([token.start, token.end]);
            continue;
        }
        if (!stacks.has(token.name))
            stacks.set(token.name, []);
        const stack = stacks.get(token.name);
        if (!token.closing) {
            stack.push(token);
            continue;
        }
        const open = stack.pop();
        ranges.push(open ? [open.start, token.end] : [token.start, token.end]);
    }
    for (const stack of stacks.values())
        for (const open of stack)
            ranges.push([open.start, open.end]);
    ranges.sort((left, right) => left[0] - right[0] || right[1] - left[1]);
    let output = '';
    let position = 0;
    for (const [start, end] of ranges) {
        if (end <= position)
            continue;
        if (start > position)
            output += source.slice(position, start);
        position = Math.max(position, end);
    }
    return output + source.slice(position);
}
export function independentContextExcludedTagSet(settings = getSettings()) {
    return new Set(normalizeIndependentContextExcludedTags(settings?.independentContextExcludedTags));
}
function readIndependentMarkupName(source, start) {
    let cursor = start, count = 0;
    while (cursor < source.length && count < 64) {
        const char = String.fromCodePoint(source.codePointAt(cursor));
        if (!/[\p{L}\p{N}._:-]/u.test(char))
            break;
        cursor += char.length;
        count += 1;
    }
    const next = cursor < source.length ? String.fromCodePoint(source.codePointAt(cursor)) : '';
    const name = source.slice(start, cursor).toLowerCase();
    if (/[\p{L}\p{N}._:-]/u.test(next) || !/^[\p{L}][\p{L}\p{N}._:-]{0,63}$/u.test(name))
        return null;
    return { name, end: cursor };
}
function scanIndependentMarkupToken(source, start) {
    if (source.startsWith('<!--', start)) {
        const close = source.indexOf('-->', start + 4);
        return { end: close >= 0 ? close + 3 : source.length, name: '', closing: false, selfClosing: false };
    }
    let cursor = start + 1;
    if (source[cursor] === '!' || source[cursor] === '?') {
        const close = source.indexOf('>', cursor + 1);
        return close >= 0 ? { end: close + 1, name: '', closing: false, selfClosing: false } : null;
    }
    while (/\s/.test(source[cursor] || ''))
        cursor += 1;
    let closing = false;
    if (source[cursor] === '/') {
        closing = true;
        cursor += 1;
        while (/\s/.test(source[cursor] || ''))
            cursor += 1;
    }
    const parsedName = readIndependentMarkupName(source, cursor);
    if (!parsedName)
        return null;
    const { name } = parsedName;
    cursor = parsedName.end;
    let quote = '';
    const hardEnd = Math.min(source.length, start + 4096);
    for (; cursor < hardEnd; cursor += 1) {
        const char = source[cursor];
        if (quote) {
            if (char === quote)
                quote = '';
            continue;
        }
        if (char === '"' || char === "'") {
            quote = char;
            continue;
        }
        if (char === '>') {
            const before = source.slice(start, cursor).replace(/\s+$/, '');
            return { end: cursor + 1, name, closing, selfClosing: !closing && before.endsWith('/') };
        }
    }
    return null;
}
function decodeConfiguredIndependentTagTokens(value = '', selected = new Set()) {
    let source = String(value || '');
    const encodedLt = '&(?:amp;){0,3}(?:lt|#0*60|#x0*3c);';
    const encodedGt = '&(?:amp;){0,3}(?:gt|#0*62|#x0*3e);';
    for (const tag of selected) {
        const escaped = String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const token = new RegExp(`${encodedLt}(\\s*\\/?\\s*${escaped}(?![\\p{L}\\p{N}._:-])[\\s\\S]{0,4096}?)${encodedGt}`, 'giu');
        source = source.replace(token, (_match, inner) => `<${inner}>`);
    }
    return source;
}
function configuredIndependentTagPrefix(source, start, selected) {
    let cursor = start + 1;
    while (/\s/.test(source[cursor] || ''))
        cursor += 1;
    let closing = false;
    if (source[cursor] === '/') {
        closing = true;
        cursor += 1;
        while (/\s/.test(source[cursor] || ''))
            cursor += 1;
    }
    const parsedName = readIndependentMarkupName(source, cursor);
    if (!parsedName || !selected.has(parsedName.name))
        return null;
    const { name } = parsedName;
    return { name, closing };
}
function stripConfiguredIndependentTagBlocks(value = '', excludedTags = new Set()) {
    const selected = excludedTags instanceof Set ? excludedTags : new Set(normalizeIndependentContextExcludedTags(excludedTags));
    const source = decodeConfiguredIndependentTagTokens(value, selected);
    if (!selected.size || !source.includes('<'))
        return { text: source, filteredExcludedTagChars: 0, filteredExcludedTags: [] };
    const output = [];
    const blockedStack = [];
    const matched = new Set();
    let filteredExcludedTagChars = 0;
    for (let cursor = 0; cursor < source.length;) {
        if (source[cursor] !== '<') {
            const next = source.indexOf('<', cursor);
            const end = next >= 0 ? next : source.length;
            const chunk = source.slice(cursor, end);
            if (blockedStack.length)
                filteredExcludedTagChars += chunk.length;
            else
                output.push(chunk);
            cursor = end;
            continue;
        }
        const token = scanIndependentMarkupToken(source, cursor);
        if (!token) {
            const selectedPrefix = configuredIndependentTagPrefix(source, cursor, selected);
            if (selectedPrefix) {
                matched.add(selectedPrefix.name);
                filteredExcludedTagChars += source.length - cursor;
                break;
            }
            if (blockedStack.length)
                filteredExcludedTagChars += 1;
            else
                output.push('<');
            cursor += 1;
            continue;
        }
        const raw = source.slice(cursor, token.end);
        const isSelected = !!token.name && selected.has(token.name);
        if (isSelected) {
            matched.add(token.name);
            filteredExcludedTagChars += raw.length;
            if (token.closing) {
                if (blockedStack[blockedStack.length - 1] === token.name)
                    blockedStack.pop();
            }
            else if (!token.selfClosing)
                blockedStack.push(token.name);
        }
        else if (blockedStack.length)
            filteredExcludedTagChars += raw.length;
        else
            output.push(raw);
        cursor = token.end;
    }
    return { text: output.join(''), filteredExcludedTagChars, filteredExcludedTags: [...matched] };
}
function normalizedIndependentDiscoveredTagName(value = '') {
    const tag = normalizeIndependentContextExcludedTags([String(value || '')])[0] || '';
    if (!tag || INDEPENDENT_TAG_SCAN_STANDARD_TAGS.has(tag) || INDEPENDENT_TAG_SCAN_RESERVED_TAGS.has(tag))
        return '';
    return tag;
}
function recordIndependentDiscoveredTag(counts, name, maxUnique = INDEPENDENT_TAG_SCAN_MAX_UNIQUE_TAGS) {
    const tag = normalizedIndependentDiscoveredTagName(name);
    if (!tag)
        return { accepted: false, truncated: false };
    if (!counts.has(tag) && counts.size >= maxUnique)
        return { accepted: false, truncated: true };
    counts.set(tag, Number(counts.get(tag) || 0) + 1);
    return { accepted: true, truncated: false };
}
function decodeIndependentTagDiscoveryEntities(value = '') {
    return String(value || '')
        .replace(/&(?:amp;){0,3}(?:lt|#0*60|#x0*3c);/gi, '<')
        .replace(/&(?:amp;){0,3}(?:gt|#0*62|#x0*3e);/gi, '>');
}
function stripIndependentTagScanMarkdownCode(value = '') {
    const lines = String(value || '').split(/\r?\n/);
    const output = [];
    let fenceChar = '';
    let fenceLength = 0;
    for (const line of lines) {
        const fence = line.match(/^[ \t]{0,3}(`{3,}|~{3,})/);
        if (fenceChar) {
            if (fence && fence[1][0] === fenceChar && fence[1].length >= fenceLength) {
                fenceChar = '';
                fenceLength = 0;
            }
            output.push('');
            continue;
        }
        if (fence) {
            fenceChar = fence[1][0];
            fenceLength = fence[1].length;
            output.push('');
            continue;
        }
        let clean = '';
        for (let cursor = 0; cursor < line.length;) {
            if (line[cursor] !== '`') {
                clean += line[cursor];
                cursor += 1;
                continue;
            }
            let width = 1;
            while (line[cursor + width] === '`')
                width += 1;
            const marker = '`'.repeat(width);
            const close = line.indexOf(marker, cursor + width);
            if (close < 0) {
                clean += marker;
                cursor += width;
                continue;
            }
            clean += ' ';
            cursor = close + width;
        }
        output.push(clean);
    }
    return output.join('\n');
}
function discoverIndependentContextTagNamesInText(value = '', counts = new Map(), state = {}, options = {}) {
    const decoded = decodeIndependentTagDiscoveryEntities(value);
    const source = options?.markdown === true ? stripIndependentTagScanMarkdownCode(decoded) : decoded;
    const blockedStack = [];
    for (let cursor = 0; cursor < source.length;) {
        const start = source.indexOf('<', cursor);
        if (start < 0)
            break;
        const token = scanIndependentMarkupToken(source, start);
        if (!token) {
            cursor = start + 1;
            continue;
        }
        if (blockedStack.length) {
            if (token.closing && blockedStack[blockedStack.length - 1] === token.name)
                blockedStack.pop();
            else if (!token.closing && !token.selfClosing && INDEPENDENT_TAG_SCAN_SKIP_SUBTREES.has(token.name))
                blockedStack.push(token.name);
            cursor = token.end;
            continue;
        }
        if (INDEPENDENT_TAG_SCAN_SKIP_SUBTREES.has(token.name)) {
            if (!token.closing && !token.selfClosing)
                blockedStack.push(token.name);
            cursor = token.end;
            continue;
        }
        if (token.name && !token.closing) {
            const recorded = recordIndependentDiscoveredTag(counts, token.name);
            if (recorded.truncated)
                state.truncated = true;
        }
        cursor = token.end;
    }
    return counts;
}
function mergeIndependentTagScanCounts(target, candidate, state = {}) {
    for (const [name, count] of candidate || []) {
        const tag = normalizedIndependentDiscoveredTagName(name);
        if (!tag)
            continue;
        if (!target.has(tag) && target.size >= INDEPENDENT_TAG_SCAN_MAX_UNIQUE_TAGS) {
            state.truncated = true;
            continue;
        }
        target.set(tag, Math.max(Number(target.get(tag) || 0), Number(count || 0)));
    }
    return target;
}
function addIndependentTagScanCounts(target, candidate, state = {}) {
    for (const [name, count] of candidate || []) {
        const tag = normalizedIndependentDiscoveredTagName(name);
        if (!tag)
            continue;
        if (!target.has(tag) && target.size >= INDEPENDENT_TAG_SCAN_MAX_UNIQUE_TAGS) {
            state.truncated = true;
            continue;
        }
        target.set(tag, Number(target.get(tag) || 0) + Number(count || 0));
    }
    return target;
}
function discoverIndependentContextTagsFromMessage(message, state = {}, maxChars = INDEPENDENT_TAG_SCAN_MAX_TEXT_CHARS) {
    const representations = [];
    const display = typeof message?.extra?.display_text === 'string' ? String(message.extra.display_text) : '';
    const body = typeof message?.mes === 'string' ? String(message.mes) : '';
    if (display.trim())
        representations.push(display);
    if (body.trim() && body !== display)
        representations.push(body);
    const combined = new Map();
    let scannedTextChars = 0;
    for (const source of representations) {
        const remaining = Math.max(0, Number(maxChars || 0) - scannedTextChars);
        if (!remaining) {
            state.truncated = true;
            break;
        }
        const bounded = source.slice(0, remaining);
        scannedTextChars += bounded.length;
        if (bounded.length < source.length)
            state.truncated = true;
        const local = new Map();
        discoverIndependentContextTagNamesInText(bounded, local, state, { markdown: true });
        mergeIndependentTagScanCounts(combined, local, state);
    }
    return { counts: combined, scannedTextChars };
}
function independentTagScanHidden(node) {
    if (!node || node.nodeType !== 1)
        return false;
    const inline = String(node.getAttribute?.('style') || '');
    if (/(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden|content-visibility\s*:\s*hidden|opacity\s*:\s*0(?:\D|$))\b/i.test(inline))
        return true;
    if (typeof globalThis.getComputedStyle !== 'function')
        return false;
    try {
        const computed = globalThis.getComputedStyle(node);
        return String(computed?.display || '').toLowerCase() === 'none'
            || ['hidden', 'collapse'].includes(String(computed?.visibility || '').toLowerCase())
            || String(computed?.contentVisibility || '').toLowerCase() === 'hidden'
            || Number.parseFloat(String(computed?.opacity || '1')) === 0;
    }
    catch {
        return false;
    }
}
function independentTagScanAbortError(message = __rmT("BkYEuMSqtfPdA6OGO.s")) {
    try {
        return new DOMException(message, 'AbortError');
    }
    catch {
        const error = new Error(message);
        error.name = 'AbortError';
        return error;
    }
}
function yieldIndependentTagScanFrame() {
    return new Promise(resolve => {
        if (typeof globalThis.requestIdleCallback === 'function')
            globalThis.requestIdleCallback(() => resolve(), { timeout: 50 });
        else if (typeof globalThis.requestAnimationFrame === 'function')
            globalThis.requestAnimationFrame(() => resolve());
        else
            setTimeout(resolve, 0);
    });
}
export async function scanCurrentChatIndependentContextTags({ signal } = {}) {
    if (typeof document === 'undefined' || !document.querySelectorAll)
        return { available: false, tags: [], scannedMessages: 0, scannedNodes: 0, scannedTextChars: 0, truncated: false };
    const chatRoot = document.querySelector('#chat');
    const ctx = getContext();
    const chat = Array.isArray(ctx?.chat) ? ctx.chat : [];
    const ownerChat = chatKey(ctx);
    if (!chatRoot)
        return { available: false, tags: [], scannedMessages: 0, scannedNodes: 0, scannedTextChars: 0, truncated: false };
    const allBodies = [...chatRoot.querySelectorAll('.mes[mesid] .mes_text')].filter(body => {
        const owner = body?.closest?.('.mes[mesid]');
        return !!owner && owner.parentElement === chatRoot && owner.querySelector?.('.mes_text') === body;
    });
    const bodies = allBodies.slice(-INDEPENDENT_TAG_SCAN_MAX_MESSAGES);
    const counts = new Map();
    const state = { truncated: allBodies.length > bodies.length };
    const reasons = new Set();
    if (allBodies.length > bodies.length)
        reasons.add('messages');
    let scannedMessages = 0;
    let scannedNodes = 0;
    let scannedTextChars = 0;
    let workSinceYield = 0;
    let sliceStarted = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    const ensureCurrent = () => {
        if (signal?.aborted)
            throw independentTagScanAbortError();
        const current = getContext();
        if (document.querySelector('#chat') !== chatRoot || chatKey(current) !== ownerChat)
            throw independentTagScanAbortError(__rmT("uSOmz73lnCIRkLGja5tGie10K6pgZT"));
    };
    const maybeYield = async (force) => {
        const now = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
        if (!force && workSinceYield < 800 && now - sliceStarted < 6)
            return;
        await yieldIndependentTagScanFrame();
        ensureCurrent();
        workSinceYield = 0;
        sliceStarted = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    };
    outer: for (const bodyElement of bodies) {
        ensureCurrent();
        if (!bodyElement?.isConnected || bodyElement.closest?.('#chat') !== chatRoot)
            throw independentTagScanAbortError(__rmT("4vYj48stp3v2sn7oTTSnDHMmn6IO.F5RGmh"));
        const owner = bodyElement.closest?.('.mes[mesid]');
        const messageIndex = Number(owner?.getAttribute?.('mesid'));
        if (!Number.isInteger(messageIndex) || messageIndex < 0 || !chat[messageIndex])
            continue;
        let blockedByAncestor = false;
        for (let ancestor = bodyElement; ancestor && ancestor !== chatRoot; ancestor = ancestor.parentElement) {
            if (ancestor.matches?.(INDEPENDENT_TAG_SCAN_BLOCKED_SELECTOR) || independentTagScanHidden(ancestor)) {
                blockedByAncestor = true;
                break;
            }
        }
        if (blockedByAncestor)
            continue;
        const sourceScan = discoverIndependentContextTagsFromMessage(chat[messageIndex], state, Math.max(0, INDEPENDENT_TAG_SCAN_MAX_TEXT_CHARS - scannedTextChars));
        const messageCounts = sourceScan.counts;
        scannedTextChars += sourceScan.scannedTextChars;
        if (scannedTextChars >= INDEPENDENT_TAG_SCAN_MAX_TEXT_CHARS) {
            state.truncated = true;
            reasons.add('text');
        }
        const domCounts = new Map();
        const stack = [{ node: bodyElement, depth: 0, literalAllowed: true }];
        let stopAfterMessage = false;
        while (stack.length) {
            ensureCurrent();
            if (scannedNodes >= INDEPENDENT_TAG_SCAN_MAX_NODES) {
                state.truncated = true;
                reasons.add('nodes');
                stopAfterMessage = true;
                break;
            }
            const { node, depth, literalAllowed } = stack.pop();
            scannedNodes += 1;
            workSinceYield += 1;
            if (depth > 40) {
                state.truncated = true;
                reasons.add('depth');
                continue;
            }
            if (node?.nodeType === 3) {
                if (literalAllowed && scannedTextChars < INDEPENDENT_TAG_SCAN_MAX_TEXT_CHARS) {
                    const remaining = INDEPENDENT_TAG_SCAN_MAX_TEXT_CHARS - scannedTextChars;
                    const raw = String(node.nodeValue || '');
                    const text = raw.slice(0, remaining);
                    scannedTextChars += text.length;
                    if (text.length < raw.length) {
                        state.truncated = true;
                        reasons.add('text');
                    }
                    discoverIndependentContextTagNamesInText(text, domCounts, state);
                }
                await maybeYield(false);
                continue;
            }
            if (node?.nodeType !== 1) {
                await maybeYield(false);
                continue;
            }
            if (node !== bodyElement && (node.matches?.(INDEPENDENT_TAG_SCAN_BLOCKED_SELECTOR) || independentTagScanHidden(node))) {
                await maybeYield(false);
                continue;
            }
            const localName = String(node.localName || node.tagName || '').toLowerCase();
            if (INDEPENDENT_TAG_SCAN_SKIP_SUBTREES.has(localName) || INDEPENDENT_TAG_SCAN_SKIP_CODE_SUBTREES.has(localName)) {
                await maybeYield(false);
                continue;
            }
            if (node !== bodyElement && (!node.namespaceURI || node.namespaceURI === 'http://www.w3.org/1999/xhtml')) {
                const recorded = recordIndependentDiscoveredTag(domCounts, localName);
                if (recorded.truncated) {
                    state.truncated = true;
                    reasons.add('tags');
                }
            }
            let children = [...(node.childNodes || [])];
            if (String(node.tagName || '').toUpperCase() === 'DETAILS' && !node.open) {
                const summary = children.find(child => child?.nodeType === 1 && String(child.tagName || '').toUpperCase() === 'SUMMARY');
                children = summary ? [summary] : [];
            }
            for (let child = children.length - 1; child >= 0; child -= 1)
                stack.push({ node: children[child], depth: depth + 1, literalAllowed });
            await maybeYield(false);
        }
        mergeIndependentTagScanCounts(messageCounts, domCounts, state);
        addIndependentTagScanCounts(counts, messageCounts, state);
        scannedMessages += 1;
        if (scannedMessages % 20 === 0)
            await maybeYield(true);
        if (stopAfterMessage)
            break outer;
    }
    ensureCurrent();
    const tags = [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return { available: true, tags, scannedMessages, scannedNodes, scannedTextChars, truncated: state.truncated, reasons: [...reasons], currentChatMessageSources: true, currentRenderedOnly: false };
}
export function stripInvisibleIndependentContextMarkup(value = '', excludedTags = new Set()) {
    let source = String(value || '').replace(/<!--[\s\S]*?-->/g, ' ');
    for (let pass = 0; pass < 4; pass++) {
        const previous = source;
        const next = source
            .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
            .replace(/<([a-z][\w:-]*)\b(?=[^>]*(?:\shidden(?:\s|=|>)|\saria-hidden\s*=\s*["']?true\b|\sinert(?:\s|=|>)|\sstyle\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden|content-visibility\s*:\s*hidden)[^"']*["']))[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ');
        source = next;
        if (next === previous)
            break;
    }
    const decoded = decodeIndependentVisibleEntities(source).replace(/<!--[\s\S]*?-->/g, ' ');
    const configured = stripConfiguredIndependentTagBlocks(decoded, excludedTags);
    const text = configured.text.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<\/(?:p|div|li|section|article|blockquote|h[1-6]|tr)\s*>/gi, '\n').replace(/<[^>]*>/g, ' ')
        .replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    return { ...configured, text };
}
export function liveVisibleIndependentMessageText(index, excludedTags = new Set()) {
    if (typeof document === 'undefined' || !document.querySelector)
        return { available: false, text: '' };
    try {
        const body = document.querySelector(`#chat .mes[mesid="${Number(index)}"] .mes_text, #chat [mesid="${Number(index)}"].mes .mes_text`);
        if (!body)
            return { available: false, text: '' };
        const parts = [];
        const stack = [{ node: body, depth: 0 }];
        const filteredExcludedTags = new Set();
        let examined = 0;
        let chars = 0;
        let filteredExcludedTagChars = 0;
        let hiddenChars = 0;
        let frameCount = 0;
        let unreadableFrames = 0;
        const countHidden = node => { if (hiddenChars < 100000)
            hiddenChars += String(node?.textContent || '').trim().length; };
        const blockedSelector = 'toto, [data-rabbit-mirror-external-source], [data-rabbit-mirror-tool-entry-host], [data-rm-image-region], [data-rm-image-portal], script, style, template, noscript, [hidden], [inert], [aria-hidden="true"], [aria-hidden="1"], .displayNone, .display-none, .hidden, .invisible, .sr-only, [class*="display-none"], [class*="display_none"]';
        const blockTags = new Set(['BR', 'P', 'DIV', 'LI', 'SECTION', 'ARTICLE', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TR']);
        for (let ancestor = body, depth = 0; ancestor && depth < 5; ancestor = ancestor.parentElement, depth += 1) {
            if (ancestor.matches?.(blockedSelector))
                return { available: true, text: '' };
            const computed = typeof globalThis.getComputedStyle === 'function' ? globalThis.getComputedStyle(ancestor) : null;
            if (String(computed?.display || '').toLowerCase() === 'none' || ['hidden', 'collapse'].includes(String(computed?.visibility || '').toLowerCase()))
                return { available: true, text: '' };
        }
        let framesTried = false;
        const styleOf = node => { const view = node?.ownerDocument?.defaultView || globalThis; return typeof view?.getComputedStyle === 'function' ? view.getComputedStyle(node) : null; };
        for (;;) {
            while (stack.length && examined < 600 && chars < 8000) {
                const { node, depth } = stack.pop();
                examined += 1;
                if (depth > 32)
                    continue;
                if (node?.nodeType === 3) {
                    const text = String(node.nodeValue || '');
                    if (text) {
                        parts.push(text);
                        chars += text.length;
                    }
                    continue;
                }
                if (node?.nodeType !== 1)
                    continue;
                if (node.matches?.(blockedSelector))
                    continue;
                const localName = String(node.localName || node.tagName || '').toLowerCase();
                if (localName && excludedTags.has(localName)) {
                    filteredExcludedTags.add(localName);
                    filteredExcludedTagChars += String(node.textContent || '').length;
                    continue;
                }
                const inline = String(node.getAttribute?.('style') || '');
                if (/(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden|content-visibility\s*:\s*hidden|opacity\s*:\s*0(?:\D|$))\b/i.test(inline)) {
                    countHidden(node);
                    continue;
                }
                if (typeof globalThis.getComputedStyle === 'function') {
                    const computed = styleOf(node);
                    if (['none'].includes(String(computed?.display || '').toLowerCase())
                        || ['hidden', 'collapse'].includes(String(computed?.visibility || '').toLowerCase())
                        || String(computed?.contentVisibility || '').toLowerCase() === 'hidden'
                        || Number.parseFloat(String(computed?.opacity || '1')) === 0) {
                        countHidden(node);
                        continue;
                    }
                }
                if (node.tagName === 'BR') {
                    parts.push('\n');
                    continue;
                }
                let children = [...(node.childNodes || [])];
                if (node.tagName === 'DETAILS' && !node.open) {
                    const summary = children.find(child => child?.nodeType === 1 && child.tagName === 'SUMMARY');
                    children = summary ? [summary] : [];
                }
                if (blockTags.has(node.tagName) && parts.length)
                    parts.push('\n');
                for (let child = children.length - 1; child >= 0; child -= 1)
                    stack.push({ node: children[child], depth: depth + 1 });
            }
            if (framesTried || parts.join('').trim() || filteredExcludedTagChars > 0)
                break;
            framesTried = true;
            parts.length = 0;
            examined = 0;
            chars = 0;
            for (const frame of [...body.querySelectorAll('iframe')].reverse()) {
                if (frame.closest(blockedSelector))
                    continue;
                const frameStyle = styleOf(frame);
                if (String(frameStyle?.display || '').toLowerCase() === 'none' || ['hidden', 'collapse'].includes(String(frameStyle?.visibility || '').toLowerCase()))
                    continue;
                let inner = null;
                frameCount += 1;
                try {
                    inner = frame.contentDocument?.body || null;
                }
                catch {
                    inner = null;
                }
                if (inner)
                    stack.push({ node: inner, depth: 1 });
                else
                    unreadableFrames += 1;
            }
            if (!stack.length)
                break;
        }
        return { available: true, text: parts.join('').replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim(), filteredExcludedTagChars, filteredExcludedTags: [...filteredExcludedTags], hiddenChars, frameCount, unreadableFrames };
    }
    catch (error) {
        return { available: true, text: '', readError: String(error?.message || error || '').slice(0, 120) };
    }
}
export function explainEmptyIndependentVisibleBody(message, index, settings = getSettings()) {
    const excludedTags = independentContextExcludedTagSet(settings);
    const base = __rmT("zyxwkksN1ARdOBjaPW16897wGirwcKmUcPdxdQIzmfNt5Y9L98UlZW5GheOj0BlKZ.VY3h");
    const live = liveVisibleIndependentMessageText(index, excludedTags);
    if (!live.available)
        return `${base}${__rmT("Uqy.3KdAkATXZaf_Uf.yRGR2b7Sy2Rw4Zge_xag3cxQc4J8uXCfpCVHA.iUj5xpijPF7bnbfIVaLfgwSSt1jY2lyBtv67MLlDA7GHzvXGlkxPwLJHkrFY1fI1Rwzr7kcZrv32eAc")}`;
    if (live.readError)
        return `${base}${__rmT("cvytqXebzAFlzorRa.qbobhnrHqlcT")}${live.readError}${__rmT("EiqlUjov5fMKYn2bMrJNT0ORX5CuooVs3It4V2I2p_vClZinbnD2rGcpsT_9uT")}`;
    const swallowed = live.filteredExcludedTags || [];
    if (swallowed.length) {
        const unfiltered = liveVisibleIndependentMessageText(index, new Set());
        if (unfiltered.text) {
            const source = `${String(message?.mes || '')}
${String(message?.extra?.display_text || '')}`;
            const unclosed = swallowed.filter(name => {
                const open = new RegExp(`<${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[\\s>/])`, 'i');
                const close = new RegExp(`</${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*>`, 'i');
                return open.test(source) && !close.test(source);
            });
            const names = swallowed.map(name => `<${name}>`).join(__rmT("jvk"));
            const why = unclosed.length
                ? `${__rmT("K1rMpfTZaT_ZV_Bq")}${unclosed.map(name => `<${name}>`).join(__rmT("jvk"))}${__rmT("0oH9_5k6LyvzDMz1GoT_iku_P1CCa3u27h52vkufq7R0VgHg4chfHyubI_nMQWXalF8iZlBul81TNDWl6IVbh8pR.iPy6m2vD_Z0QeJsLI3PDarfcgd8fSQX8Rw3N1FYF1b54111QbMAvZ3Zf_C")}` : `${__rmT("pT0W3MzX3f5H1CuEgPD")}${names}${__rmT("uNYFtHDbLShgyX4vb.ybCxMF_NTLjj1O29E")}`;
            return `${base}${why}${__rmT("mDFxMniV8fLcNQgRko4i5qZABXU6l7gmRSUbjUc1uU.JgwqecsfC3f")}${names}${__rmT("N_.nAuED_cp")}${unclosed.length ? __rmT("cvR1S8zyI7h7sgFW6j1p5uUcBXJbpZ5vL4I4TXxRR16z1y8ZanxM4h") : __rmT("8ZAx5EvTrRkExmf8L9SkoYSMSdt2kEFiwPwbbNutv5EmDzdx")}${__rmT("jzk")}`;
        }
    }
    if (Number(live.unreadableFrames || 0) > 0)
        return `${base}${__rmT("d.TApF5kSy1Dr5dJFxM4w4bOrcnTlChxblO5KtWRK5uuesXGZqvaPs3RF_bSKe2w9Io_iamp2DD0y59oHalKNndzxJmE_VG8F9hZ9W4eRIgd1fqFHSTjW_dznTt9Tx2.fWZgWTDGNqSx__pL63HWeKkBu5l4C_0urkv5_Q2zPvI1FN.PJ_.vHB1.iG7_ZGdb4aQwROeI5RXVBdzsMuHGJrKs_EI41IFsH28")}`;
    if (Number(live.hiddenChars || 0) > 0)
        return `${base}${__rmT("a1u2iitgC3gRMkkdXY7QV0fiWEib1jSyvujKqGdkwBVSrwHTDe1CBGIPvM3ZLqJRwJqELQe5X3hatrPafdvYREb42cmDyRhCBm7Ll6gfoeaXhvyj3xBGnn6Qh.BVo32yi0bpugIlEpPwjljGd.Q1fPkvg0fAcdxQahp8AVXsKhMIeRX3LfioOAMs_KE9hEMyZ3GubAmRw_.APCb2G58T6T")}`;
    if (String(message?.mes || '').trim())
        return `${base}${__rmT("FG.QU9owxr2XOgGCdiV1qOJkcBfLsovyk_ZXoU.2DheWHCKsGy292OVZawg01LbjblwpDzyvEMd4MX49kq9zJVrFdCiLIG8n37ALRf")}`;
    return `${base}${__rmT("YGGg0vVeJBREvabvsYf3wOGymdFI8Os2")}`;
}
export function normalizedIndependentVisibleComparison(value = '') {
    return String(value || '').replace(/\s+/g, '');
}
function verifiedSourceTagFilteringForLiveText(message, liveUnfilteredText = '', excludedTags = new Set()) {
    if (!(excludedTags instanceof Set) || !excludedTags.size)
        return null;
    const display = typeof message?.extra?.display_text === 'string' ? String(message.extra.display_text) : '';
    const body = typeof message?.mes === 'string' ? String(message.mes) : '';
    const candidates = [];
    if (display.trim())
        candidates.push({ value: display, source: 'display' });
    if (body.trim() && body !== display)
        candidates.push({ value: body, source: 'mes' });
    const expected = normalizedIndependentVisibleComparison(liveUnfilteredText);
    for (const candidate of candidates) {
        const historical = stripHistoricalRabbitMirrorBlocks(candidate.value);
        const selected = stripInvisibleIndependentContextMarkup(historical.text, excludedTags);
        if (!selected.filteredExcludedTags.length)
            continue;
        const unfiltered = stripInvisibleIndependentContextMarkup(historical.text, new Set());
        if (normalizedIndependentVisibleComparison(unfiltered.text) !== expected)
            continue;
        return {
            text: String(selected.text || '').replace(/\s+/g, ' ').trim(),
            filteredRabbitMirrorChars: historical.filteredRabbitMirrorChars,
            filteredExcludedTagChars: selected.filteredExcludedTagChars,
            filteredExcludedTags: selected.filteredExcludedTags,
            source: `live-dom+verified-${candidate.source}-tags`,
        };
    }
    return null;
}
function verifiedUnicodeTagFilteringForLiveText(message, liveText = '', excludedTags = new Set()) {
    if (![...excludedTags].some(name => !/^[a-z]/i.test(name)))
        return null;
    const display = typeof message?.extra?.display_text === 'string' ? message.extra.display_text : '';
    const body = typeof message?.mes === 'string' ? message.mes : '';
    const expected = normalizedIndependentVisibleComparison(liveText);
    if (!expected)
        return null;
    for (const source of [...new Set([display, body])]) {
        if (!source || source.length > INDEPENDENT_TAG_SCAN_MAX_TEXT_CHARS)
            continue;
        const historical = stripHistoricalRabbitMirrorBlocks(source);
        let prefix = '\uE000RM_TAG_';
        for (let n = 0; n < 8 && (source.includes(prefix) || liveText.includes(prefix)); n += 1)
            prefix += 'X';
        if (source.includes(prefix) || liveText.includes(prefix))
            continue;
        const tokens = [];
        let needsRecovery = false;
        const mask = (visible, boundary = visible) => {
            const marker = `${prefix}${tokens.length}\uE001`;
            tokens.push({ marker, visible, boundary });
            return marker;
        };
        const encoded = /&(?:amp;){0,3}(?:lt|#0*60|#x0*3c);[\s\S]{0,4096}?&(?:amp;){0,3}(?:gt|#0*62|#x0*3e);/giy;
        const rawSource = historical.text, parts = [];
        let bounded = true;
        for (let cursor = 0; cursor < rawSource.length;) {
            if (tokens.length >= 1024) {
                bounded = false;
                break;
            }
            const lt = rawSource.indexOf('<', cursor), amp = rawSource.indexOf('&', cursor);
            const start = lt < 0 ? amp : amp < 0 ? lt : Math.min(lt, amp);
            if (start < 0) {
                parts.push(rawSource.slice(cursor));
                break;
            }
            parts.push(rawSource.slice(cursor, start));
            if (rawSource[start] === '&') {
                encoded.lastIndex = start;
                const match = encoded.exec(rawSource);
                if (match) {
                    parts.push(mask(decodeIndependentVisibleEntities(match[0])));
                    cursor = encoded.lastIndex;
                    continue;
                }
                parts.push('&');
                cursor = start + 1;
                continue;
            }
            const token = scanIndependentMarkupToken(rawSource, start);
            if (!token) {
                parts.push('<');
                cursor = start + 1;
                continue;
            }
            const raw = rawSource.slice(start, token.end);
            const unicode = !!token.name && !/^[a-z]/i.test(token.name);
            const selected = excludedTags.has(token.name);
            if (unicode || selected) {
                const visible = unicode && !token.closing ? decodeIndependentVisibleEntities(raw) : '';
                parts.push(mask(visible, selected ? raw : visible));
                if (unicode && selected)
                    needsRecovery = true;
            }
            else
                parts.push(raw);
            cursor = token.end;
        }
        if (!bounded)
            continue;
        if (!needsRecovery)
            continue;
        const projected = stripInvisibleIndependentContextMarkup(parts.join(''), new Set()).text;
        const markers = new RegExp(`${prefix}(\\d+)\\uE001`, 'g');
        const segments = [];
        let last = 0, match;
        while ((match = markers.exec(projected))) {
            segments.push({ visible: projected.slice(last, match.index), decoration: true });
            segments.push(tokens[Number(match[1])]);
            last = markers.lastIndex;
        }
        segments.push({ visible: projected.slice(last), decoration: true });
        for (const decorations of [false, true]) {
            let offset = 0, matches = true;
            const insertions = [];
            for (const segment of segments) {
                if (!segment.visible && segment.boundary)
                    insertions.push({ offset, text: segment.boundary });
                for (const char of segment.visible) {
                    if (/\s/.test(char))
                        continue;
                    if (expected.startsWith(char, offset)) {
                        offset += char.length;
                        continue;
                    }
                    if (decorations && segment.decoration && /^[*_~`#-]$/.test(char))
                        continue;
                    matches = false;
                    break;
                }
                if (!matches)
                    break;
            }
            if (!matches || offset !== expected.length)
                continue;
            const liveOffsets = [];
            let count = 0;
            for (let i = 0; i < liveText.length; i += 1)
                if (!/\s/.test(liveText[i]))
                    liveOffsets[count++] = i;
            liveOffsets[count] = liveText.length;
            const chunks = [];
            let cursor = 0;
            for (const insertion of insertions) {
                const endTag = /^<\s*\//.test(insertion.text);
                const boundary = endTag && insertion.offset > 0 ? liveOffsets[insertion.offset - 1] + 1 : liveOffsets[insertion.offset];
                const at = Math.max(cursor, boundary);
                chunks.push(liveText.slice(cursor, at), insertion.text);
                cursor = at;
            }
            chunks.push(liveText.slice(cursor));
            const filtered = stripConfiguredIndependentTagBlocks(chunks.join(''), excludedTags);
            return { ...filtered, text: filtered.text.replace(/\s+/g, ' ').trim(),
                filteredRabbitMirrorChars: historical.filteredRabbitMirrorChars, source: 'live-dom+verified-unicode-tags' };
        }
    }
    return null;
}
function sourceFallbackVisibleText(message, live, excludedTags) {
    if (live.readError || (live.filteredExcludedTags || []).length || Number(live.filteredExcludedTagChars || 0) > 0)
        return null;
    const hasDisplay = typeof message?.extra?.display_text === 'string' && String(message.extra.display_text).trim().length > 0;
    const source = hasDisplay ? message.extra.display_text : String(message?.mes || '');
    if (!source.trim())
        return null;
    const filtered = stripHistoricalRabbitMirrorBlocks(source);
    const visible = stripInvisibleIndependentContextMarkup(filtered.text, excludedTags);
    const text = String(visible.text || '').replace(/\s+/g, ' ').trim();
    if (!text)
        return null;
    return { text, filteredRabbitMirrorChars: filtered.filteredRabbitMirrorChars, filteredExcludedTagChars: visible.filteredExcludedTagChars, filteredExcludedTags: visible.filteredExcludedTags, source: hasDisplay ? 'source-fallback-display' : 'source-fallback-mes' };
}
export function canonicalVisibleMessageText(message, index, excludedTags = independentContextExcludedTagSet()) {
    const live = liveVisibleIndependentMessageText(index, excludedTags);
    if (live.available && !String(live.text || '').trim()) {
        const fallback = sourceFallbackVisibleText(message, live, excludedTags);
        if (fallback)
            return fallback;
    }
    if (live.available) {
        if (excludedTags.size && [...excludedTags].some(name => !/^[a-z]/i.test(name))) {
            const unfiltered = (live.filteredExcludedTags || []).length ? liveVisibleIndependentMessageText(index, new Set()) : live;
            const verified = unfiltered.available ? verifiedUnicodeTagFilteringForLiveText(message, unfiltered.text, excludedTags) : null;
            if (verified)
                return verified;
        }
        if (excludedTags.size && !(live.filteredExcludedTags || []).length) {
            const liveUnfiltered = liveVisibleIndependentMessageText(index, new Set());
            if (liveUnfiltered.available) {
                const verified = verifiedSourceTagFilteringForLiveText(message, liveUnfiltered.text, excludedTags);
                if (verified)
                    return verified;
            }
        }
        const configured = stripConfiguredIndependentTagBlocks(live.text, excludedTags);
        const filtered = stripHistoricalRabbitMirrorBlocks(configured.text);
        return { text: String(filtered.text || '').replace(/\s+/g, ' ').trim(), filteredRabbitMirrorChars: filtered.filteredRabbitMirrorChars, filteredExcludedTagChars: Number(live.filteredExcludedTagChars || 0) + configured.filteredExcludedTagChars, filteredExcludedTags: [...new Set([...(live.filteredExcludedTags || []), ...configured.filteredExcludedTags])], source: 'live-dom' };
    }
    if (typeof document !== 'undefined')
        return { text: '', filteredRabbitMirrorChars: 0, filteredExcludedTagChars: 0, filteredExcludedTags: [], source: 'not-rendered' };
    const hasDisplay = typeof message?.extra?.display_text === 'string' && String(message.extra.display_text).trim().length > 0;
    const source = hasDisplay ? message.extra.display_text : String(message?.mes || '');
    const filtered = stripHistoricalRabbitMirrorBlocks(source);
    const visible = stripInvisibleIndependentContextMarkup(filtered.text, excludedTags);
    return { text: visible.text, filteredRabbitMirrorChars: filtered.filteredRabbitMirrorChars, filteredExcludedTagChars: visible.filteredExcludedTagChars, filteredExcludedTags: visible.filteredExcludedTags, source: hasDisplay ? 'non-dom-display-test' : 'non-dom-mes-test' };
}
export function createIndependentVisibleTextReader(targetIndex, settings = getSettings()) {
    const excludedTags = independentContextExcludedTagSet(settings);
    const cache = new Map();
    const reader = (message, index) => {
        const key = Number(index);
        if (key !== Number(targetIndex) && cache.has(key))
            return cache.get(key);
        const result = canonicalVisibleMessageText(message, index, excludedTags);
        if (key !== Number(targetIndex)) {
            if (cache.size >= INDEPENDENT_VISIBLE_TEXT_CACHE_LIMIT)
                cache.delete(cache.keys().next().value);
            cache.set(key, result);
        }
        return result;
    };
    if (typeof document !== 'undefined' && document.querySelector) {
        try {
            const chatRoot = document.querySelector('#chat');
            const indexes = [];
            for (const owner of chatRoot?.querySelectorAll?.('.mes[mesid]') || []) {
                if (owner?.parentElement?.closest?.('.mes[mesid]'))
                    continue;
                const index = Number(owner.getAttribute?.('mesid'));
                if (Number.isInteger(index) && index >= 0 && index <= Number(targetIndex))
                    indexes.push(index);
            }
            reader.renderedIndexes = [...new Set(indexes)].sort((a, b) => b - a);
        }
        catch {
        }
    }
    return reader;
}
function* independentContextCandidateIndexes(targetIndex, renderedIndexes = null) {
    const numericTarget = Number(targetIndex);
    const upper = Number.isFinite(numericTarget) ? Math.max(-1, Math.floor(numericTarget)) : -1;
    if (Array.isArray(renderedIndexes)) {
        const normalized = [...new Set(renderedIndexes.map(Number).filter(index => Number.isInteger(index) && index >= 0 && index <= upper))].sort((a, b) => b - a);
        for (const index of normalized)
            yield index;
        return;
    }
    for (let index = upper; index >= 0; index -= 1)
        yield index;
}
function clipIndependentContextText(value = '', max = 0) {
    const text = String(value ?? '').replace(/\r\n?/g, '\n').trim();
    const limit = Math.max(0, Number(max) || 0);
    if (!limit || text.length <= limit)
        return text;
    const marker = __rmT("NyXis0oSteEYVu96JFL2HT");
    return `${text.slice(0, Math.max(0, limit - marker.length))}${marker}`;
}
function independentCharacterContext(char) {
    if (!char || typeof char !== 'object')
        return '';
    const data = char?.data && typeof char.data === 'object' ? char.data : {};
    const first = (...values) => values.map(value => stripExcludedTagsFromReference(String(value ?? '')).trim()).find(Boolean) || '';
    const view = {
        name: first(char.name, data.name),
        description: clipIndependentContextText(first(char.description, data.description), 2200),
        personality: clipIndependentContextText(first(char.personality, data.personality), 1100),
        scenario: clipIndependentContextText(first(char.scenario, data.scenario), 800),
    };
    for (const key of Object.keys(view))
        if (!view[key])
            delete view[key];
    return Object.keys(view).length ? safeJson(view, 4300) : '';
}
function independentPersonaContext(ctx) {
    const name = String(ctx?.name1 || globalThis.name1 || '').trim();
    const description = clipIndependentContextText(stripExcludedTagsFromReference(ctx?.powerUserSettings?.persona_description || globalThis.power_user?.persona_description || ctx?.personaDescription || ''), 2200);
    const view = { name, description };
    for (const key of Object.keys(view))
        if (!view[key])
            delete view[key];
    return Object.keys(view).length ? safeJson(view, 2500) : '';
}
const APPEARANCE_LINE_RE = __rmR("IDsZnr1i7CGBla_xpDLdTuFKd3QqM2taYby.4hN6CgWzlxeLvby70xUJbRR9OLiS86tVYB2RR5hdkGX1otpiY6iSpCDxbT4dUjDb6ttRn8GR1UAgPU_Zb_1JrzG0N0LxYlra78i6cyPD_THlsbuVbSTJz1E_VJfza7Z9xfP6QsZGDr5.mtl7JLFL58.bl52r7lE7asF0R.y6_ocGvkCUD57JYk0DLVJUEtcvQCuTtZK3BWyqYK6n84wxkqsVRQip8k69seFpof.VGYhe4FkNqGQOCUK9Ozq4B7qTaSwuIl9BTLbYxSstnCaIOGvVNXDKRF2cpCRT9U6llxJ7mODH4SWGWD3s6wPK", "i");
function appearanceBeyondClip(value, limit) {
    const text = String(value ?? '').replace(/\r\n?/g, '\n').trim();
    if (text.length <= limit)
        return '';
    const rest = text.slice(Math.max(0, limit - 120));
    const picked = [];
    let used = 0;
    for (const raw of rest.match(__rmR("8IJoNHP7JqrHRxxvn77jjwp4WU5xRsWCtBZNQBYFiU2ynUmAYdNQ.1meLGTjeT", "g")) || []) {
        const line = raw.replace(/\s+/g, ' ').trim();
        if (!line || line.length < 4 || !APPEARANCE_LINE_RE.test(line))
            continue;
        const clipped = line.slice(0, 220);
        if (used + clipped.length > 600)
            break;
        picked.push(clipped);
        used += clipped.length;
    }
    return picked.join(' ');
}
function builtinImageAppearanceBlock(ctx, char, settings) {
    if (settings?.builtinImageEnabled !== true)
        return '';
    const llmReady = settings.imageLlmEnabled === true
        && !!(String(settings.imageLlmProfileId || '').trim() || String(settings.imageLlmBaseUrl || '').trim())
        && !!String(settings.imageLlmModel || '').trim();
    if (llmReady)
        return '';
    const rows = [];
    if (char && settings.independentReadCharacterCardSummary !== false) {
        const data = char?.data && typeof char.data === 'object' ? char.data : {};
        const description = [char.description, data.description].map(value => stripExcludedTagsFromReference(String(value ?? '')).trim()).find(Boolean) || '';
        const lines = appearanceBeyondClip(description, 2200);
        if (lines)
            rows.push(`${String(char.name || data.name || __rmT("WUzaif")).trim()}${__rmT("7ys")}${lines}`);
    }
    if (settings.independentReadPersonaSummary !== false) {
        const lines = appearanceBeyondClip(stripExcludedTagsFromReference(ctx?.powerUserSettings?.persona_description || globalThis.power_user?.persona_description || ctx?.personaDescription || ''), 2200);
        if (lines)
            rows.push(`${String(ctx?.name1 || globalThis.name1 || 'Persona').trim()}${__rmT("7ys")}${lines}`);
    }
    return rows.length ? `${__rmT("OTCPW8kDWbyZcZu.695HCt.3sRfd9G91UzlBLA42CDSK74hF.Jvth2.cLWoeWn2iUdE")}${safeJson(rows, 1400)}` : '';
}
export function contextBundle(ctx, targetIndex, globalWorldInfoSnapshot = null, preparedGlobalWorldInfoView = null, budgetOverride = CONTEXT_TOTAL_BUDGET, readVisible = null) {
    const chat = Array.isArray(ctx.chat) ? ctx.chat : [];
    const char = ctx.characters?.[ctx.characterId] || ctx.character || null;
    const settings = getSettings();
    const charJson = settings?.independentReadCharacterCardSummary === false ? '' : independentCharacterContext(char);
    const personaJson = settings?.independentReadPersonaSummary === false ? '' : independentPersonaContext(ctx);
    const globalView = preparedGlobalWorldInfoView || globalWorldInfoContextView(globalWorldInfoSnapshot);
    const capturedWorldInfoBlock = clipIndependentContextText(String(globalView?.block || ''), GLOBAL_WORLD_INFO_CONTEXT_BUDGET + 500);
    const referenceParts = [];
    if (charJson)
        referenceParts.push(`${__rmT("09gcOGQJEY1dzCE5E4pTnlay3us")}${charJson}`);
    if (personaJson)
        referenceParts.push(`${__rmT("Iu_e4ukEgROzc7onuGSlfb0Oz9OZ.yv1G3rctLWwQP8")}${personaJson}`);
    const appearanceJson = builtinImageAppearanceBlock(ctx, char, settings);
    if (appearanceJson)
        referenceParts.push(appearanceJson);
    const referenceBlock = referenceParts.length ? `\n\n${referenceParts.join('\n\n')}` : '';
    const fixedSuffix = `${referenceBlock}${capturedWorldInfoBlock}`;
    const transcriptHeader = __rmT("tQhV4MO4kFDryqu8f03rfa200otyJk");
    const configuredLayers = Number(settings?.independentContextMaxLayers);
    const maxLayers = Math.max(1, Math.min(200, Number.isFinite(configuredLayers) ? Math.round(configuredLayers) : 20));
    const requested = Math.round(Number(budgetOverride));
    const totalBudget = Math.max(1, Math.min(CONTEXT_TOTAL_BUDGET, Number.isFinite(requested) && requested > 0 ? requested : CONTEXT_TOTAL_BUDGET));
    const transcriptBudget = Math.max(4000, Math.min(CONTEXT_TRANSCRIPT_BUDGET, totalBudget - fixedSuffix.length - transcriptHeader.length - 512));
    const visibleReader = typeof readVisible === 'function' ? readVisible : createIndependentVisibleTextReader(targetIndex);
    const rows = [];
    const filteredExcludedTags = new Set();
    let selectionUsed = 0;
    let includedLayers = 0;
    let filteredRabbitMirrorChars = 0;
    let filteredExcludedTagChars = 0;
    let targetVisibleChars = 0;
    const contextStart = Math.min(targetIndex, chat.length - 1);
    for (const real of independentContextCandidateIndexes(contextStart, visibleReader.renderedIndexes)) {
        if (includedLayers >= maxLayers)
            break;
        if (selectionUsed >= transcriptBudget)
            break;
        const m = chat[real];
        if (!m || (m.is_user !== true && !isRabbitMirrorEligibleAssistantMessage(m)))
            continue;
        const role = m.is_user ? 'USER' : 'ASSISTANT';
        const filtered = visibleReader(m, real);
        const body = filtered.text;
        const filteredSelectionChars = Math.max(0, Number(filtered.filteredExcludedTagChars || 0));
        filteredRabbitMirrorChars += filtered.filteredRabbitMirrorChars;
        filteredExcludedTagChars += filteredSelectionChars;
        for (const tag of filtered.filteredExcludedTags || [])
            filteredExcludedTags.add(tag);
        if (real === Number(targetIndex))
            targetVisibleChars = body.length;
        if (!body) {
            selectionUsed += filteredSelectionChars;
            continue;
        }
        let row = `[${real} ${role}]\n${quoteIndependentContextHeaderLines(body)}`;
        if (row.length > 8000)
            row = `${row.slice(0, 4000)}${__rmT("hfY.8nhQ5HMDx_quNpOqiVsMa7n0.I_P")}${row.slice(-4000)}`;
        const rowSelectionChars = row.length + filteredSelectionChars;
        if (rows.length && selectionUsed + rowSelectionChars > transcriptBudget)
            break;
        if (!rows.length && row.length > transcriptBudget)
            row = clipIndependentContextText(row, transcriptBudget);
        rows.unshift(row);
        selectionUsed += rowSelectionChars;
        includedLayers += 1;
    }
    const transcript = rows.join('\n\n');
    const bundle = `${transcriptHeader}${transcript}${fixedSuffix}`;
    const text = bundle.length > totalBudget ? `${bundle.slice(0, Math.floor(totalBudget * 0.62))}${__rmT("nMYB3P3CWt3S8d.GXIY9.9SsM1ylA.rtuHE")}${bundle.slice(-Math.floor(totalBudget * 0.37))}`.slice(0, totalBudget) : bundle;
    return {
        text,
        layers: includedLayers,
        maxLayers,
        filteredRabbitMirrorChars,
        filteredExcludedTagChars,
        filteredExcludedTags: [...filteredExcludedTags],
        targetVisibleChars,
        transcriptChars: transcript.length,
        referenceContextChars: referenceBlock.length,
        worldInfoContextChars: capturedWorldInfoBlock.length,
    };
}
function stripKnownEndpointPath(url = '') {
    const source = String(url || '').trim();
    if (!source)
        return '';
    try {
        const parsed = new URL(source);
        let pathname = String(parsed.pathname || '').replace(/\/+$/, '');
        for (let i = 0; i < 3; i += 1) {
            const next = pathname.replace(INDEPENDENT_KNOWN_ENDPOINT_RE, '');
            if (next === pathname)
                break;
            pathname = next.replace(/\/+$/, '');
        }
        parsed.pathname = pathname || '/';
        parsed.hash = '';
        return parsed.toString().replace(/\/(?=\?|$)/, '');
    }
    catch {
        const [beforeHash] = source.split('#', 1);
        const queryIndex = beforeHash.indexOf('?');
        let pathPart = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
        const query = queryIndex >= 0 ? beforeHash.slice(queryIndex) : '';
        for (let i = 0; i < 3; i += 1) {
            const next = pathPart.replace(INDEPENDENT_KNOWN_ENDPOINT_RE, '');
            if (next === pathPart)
                break;
            pathPart = next.replace(/\/+$/, '');
        }
        return `${pathPart}${query}`;
    }
}
export function normalizeBase(url) {
    const raw = String(url || '').trim();
    if (!raw)
        return '';
    const hostPart = raw.split('/')[0];
    const numeric = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$/.test(hostPart) || /^\[[0-9a-f:]+\](?::\d+)?$/i.test(hostPart);
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `${numeric ? 'http' : 'https'}://${raw}`;
    return stripKnownEndpointPath(withScheme);
}
function independentBaseHasExplicitVersion(base = '') {
    const normalized = normalizeBase(base);
    if (!normalized)
        return false;
    try {
        const pathname = new URL(normalized).pathname.replace(/\/+$/, '');
        const tail = pathname.split('/').filter(Boolean).pop() || '';
        return /^v\d+(?:(?:alpha|beta)\d*)?$/i.test(tail);
    }
    catch {
        const pathOnly = normalized.replace(/^https?:\/\/[^/]+/i, '').replace(/\/+$/, '');
        const tail = pathOnly.split('/').filter(Boolean).pop() || '';
        return /^v\d+(?:(?:alpha|beta)\d*)?$/i.test(tail);
    }
}
export function endpoint(base, path) {
    const b = normalizeBase(base);
    if (!b)
        return '';
    const suffix = String(path || '').startsWith('/') ? String(path || '') : `/${String(path || '')}`;
    try {
        const parsed = new URL(b);
        const pathname = String(parsed.pathname || '').replace(/\/+$/, '');
        parsed.pathname = `${pathname}${independentBaseHasExplicitVersion(b) ? '' : '/v1'}${suffix}`.replace(/\/{2,}/g, '/');
        parsed.hash = '';
        return parsed.toString();
    }
    catch {
        const queryIndex = b.indexOf('?');
        const pathPart = queryIndex >= 0 ? b.slice(0, queryIndex) : b;
        const query = queryIndex >= 0 ? b.slice(queryIndex) : '';
        return `${pathPart.replace(/\/+$/, '')}${independentBaseHasExplicitVersion(b) ? '' : '/v1'}${suffix}${query}`;
    }
}
export function headers(settings) { const h = { 'Content-Type': 'application/json' }; if (!settings?.independentConnectionProfileId && settings.independentApiKey)
    h.Authorization = `Bearer ${settings.independentApiKey}`; return h; }
function isNumericHost(url = '') { try {
    const host = new URL(url).hostname;
    return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) || /^\[[0-9a-f:]+\]$/i.test(host);
}
catch {
    return false;
} }
function directBlockedHint(url = '') {
    try {
        const target = new URL(url, location.href);
        if (location.protocol === 'https:' && target.protocol === 'http:')
            return __rmT("fLBiKi0yLlyiSc6t7WLKgh.R78F1U5_BFc8LqpW.B8mpgjQ0C6oyPG0H3SUxa79nm5UrrUWGpBrAu2Y.COYX9W.qK9m9fo_r_PZl6md9Oe_UqT");
        if (isNumericHost(target.href) && target.protocol === 'https:')
            return __rmT("hSFvwhWgRgDWlk42AkwEICgtaW8y1LHhTyPUpSXr1TwNdXNa.q93DgET4k1s0zqH_ZnH67ZI");
    }
    catch { }
    return __rmT("SQXO3j473YeW9YhcrnwJux1DRXuuDm6MMDIXjK3TvmyZJPHRhGK4iCH6uu007mv2");
}
async function serverRequestHeaders() {
    try {
        const fn = hostModule?.getRequestHeaders || globalThis.SillyTavern?.getContext?.()?.getRequestHeaders;
        if (typeof fn === 'function')
            return { ...fn(), 'Content-Type': 'application/json' };
        const mod = hostModule || await import('../../../../../../script.js');
        hostModule = mod;
        return { ...(mod?.getRequestHeaders?.() || {}), 'Content-Type': 'application/json' };
    }
    catch {
        return { 'Content-Type': 'application/json' };
    }
}
function customHeaderYaml(options = {}) {
    const raw = options?.headers && typeof options.headers === 'object' ? options.headers : {};
    const headers = {};
    for (const [key, value] of Object.entries(raw)) {
        if (value === undefined || value === null || String(value) === '')
            continue;
        if (String(key).toLowerCase() === 'content-type')
            continue;
        headers[String(key)] = String(value);
    }
    return JSON.stringify(headers);
}
function customApiBaseFromUrl(url = '') {
    return normalizeBase(url);
}
export function independentLocalPreflightFailure(error) {
    const localCodes = new Set([
        'RABBIT_MIRROR_CONTEXT_BOUNDARY_REJECTED',
        'RABBIT_MIRROR_REQUEST_TOO_LARGE',
        'RABBIT_MIRROR_DISPATCH_LEASE_REJECTED',
        'RABBIT_MIRROR_BATCH_PLAN_REJECTED',
        'RABBIT_MIRROR_CONNECTION_PROFILE_REJECTED',
        'RABBIT_MIRROR_ADVANCED_OPTIONS_REJECTED',
        'RABBIT_MIRROR_EXTERNAL_PREFLIGHT_REJECTED',
        'RABBIT_MIRROR_EXTERNAL_MATERIAL_MISSING',
        'RABBIT_MIRROR_EXTERNAL_MATERIAL_INVALID',
        'RABBIT_MIRROR_APPEARANCE_STALE',
        'RABBIT_MIRROR_MEMORY_STALE',
        'RABBIT_MIRROR_APPEARANCE_MISSING',
        'RABBIT_MIRROR_APPEARANCE_INVALID',
        'RABBIT_MIRROR_APPEARANCE_STORAGE_UNAVAILABLE',
        'RABBIT_MIRROR_APPEARANCE_STORAGE_FAILED',
        'RABBIT_MIRROR_APPEARANCE_STORAGE_BLOCKED',
        'RABBIT_MIRROR_APPEARANCE_MODULE_UNAVAILABLE',
        'MULTIFACE_PLAN_UNAVAILABLE',
        'WORLD_BOOK_NOT_FOUND',
        'WORLD_BOOK_ENTRY_STATE_CONFLICT',
        'WORLD_BOOK_ENTRY_CONTENT_INVALID',
        'WORLD_BOOK_READ_FAILED',
        'WORLD_BOOK_STORAGE_UNAVAILABLE',
        'WORLD_BOOK_STORAGE_QUOTA',
        'WORLD_BOOK_STORAGE_WRITE_FAILED',
        'WORLD_BOOK_SCHEMA_UNSUPPORTED',
    ]);
    const seen = new Set();
    let cursor = error;
    for (let depth = 0; cursor && depth < 4 && !seen.has(cursor); depth += 1) {
        seen.add(cursor);
        if (localCodes.has(String(cursor?.code || '')))
            return cursor;
        cursor = cursor?.cause;
    }
    return null;
}
export function independentBatchPlanPreflightError(reasonCode) {
    const reason = describeBatchPlanFailure(reasonCode);
    const usage = reason.code === 'BATCH_STORAGE_QUOTA_EXCEEDED' ? describeRabbitMirrorStorageUsage() : '';
    const error = new Error(`${__rmT("og297uEHy69WVsiwRWw_Lk")}${reason.message}${usage ? ` ${usage}` : ''}${__rmT("4bFTcylPSleaRb5D")}${reason.code}${__rmT("OvH5wp4QmxbqYLom84YiqOEI")}`);
    error.name = 'RabbitMirrorBatchPlanPreflightError';
    error.code = 'RABBIT_MIRROR_BATCH_PLAN_REJECTED';
    error.reasonCode = reason.code;
    return error;
}
export async function fetchIndependentUrl(url, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const st = options.settings && typeof options.settings === 'object' ? options.settings : getSettings();
    const connectionId = normalizeIndependentConnectionText(st?.independentConnectionProfileId, 160);
    const connectionRuntime = connectionId ? await validatedIndependentConnectionProfile(connectionId) : null;
    const proxyPresets = connectionRuntime && connectionRuntime.apiMap.source !== 'custom' ? await independentConnectionProxyPresets() : [];
    const connectionPayload = connectionRuntime ? independentConnectionPayload(connectionRuntime, proxyPresets) : null;
    const customUrl = connectionRuntime ? '' : customApiBaseFromUrl(url);
    if (!connectionRuntime && !customUrl)
        throw new Error(__rmT("TR93JEY7zIQmBSmG4ghebM17bgNlnf"));
    const requestHeaders = await serverRequestHeaders();
    const custom_include_headers = customHeaderYaml(options);
    try {
        if (connectionRuntime && method === 'GET' && /\/models(?:\?|$)/i.test(String(url))) {
            return await fetch(ST_CUSTOM_STATUS_ENDPOINT, { method: 'POST', credentials: 'same-origin', headers: requestHeaders, signal: options.signal, cache: 'no-cache', body: JSON.stringify(connectionPayload) });
        }
        if (connectionRuntime && method === 'POST' && /\/chat\/completions(?:\?|$)/i.test(String(url))) {
            let remoteBody = {};
            try {
                remoteBody = typeof options.body === 'string' ? JSON.parse(options.body) : ({ ...options.body });
            }
            catch { }
            const advancedCarrier = options.advancedOptions ? buildIndependentAdvancedCarrier(options.advancedOptions, { source: connectionRuntime.apiMap?.source, apiFormat: connectionRuntime.profile?.['custom-api-format'] }) : null;
            if (options.advancedOptions?.excludedParams?.length)
                remoteBody = applyIndependentAdvancedExclusions(remoteBody, options.advancedOptions);
            options.assertAdvancedCurrent?.();
            return await fetchRabbitMirrorIndependentCompletion(ST_CUSTOM_GENERATE_ENDPOINT, {
                method: 'POST', credentials: 'same-origin', headers: requestHeaders, signal: options.signal,
                body: JSON.stringify({ ...remoteBody, ...connectionPayload,
                    custom_prompt_post_processing: connectionRuntime.profile?.['prompt-post-processing'], use_sysprompt: true,
                    ...advancedCarrier, stream: remoteBody.stream !== false }), rabbitMirrorDispatchLease: options.dispatchLease, rabbitMirrorRequestObserver: options.onEvidenceRequest,
            });
        }
        if (method === 'GET' && /\/models(?:\?|$)/i.test(String(url))) {
            return await fetch(ST_CUSTOM_STATUS_ENDPOINT, {
                method: 'POST',
                credentials: 'same-origin',
                headers: requestHeaders,
                signal: options.signal,
                cache: 'no-cache',
                body: JSON.stringify({
                    chat_completion_source: 'custom',
                    custom_url: customUrl,
                    custom_include_headers,
                }),
            });
        }
        if (method === 'POST' && /\/chat\/completions(?:\?|$)/i.test(String(url))) {
            let remoteBody = {};
            try {
                remoteBody = typeof options.body === 'string' ? JSON.parse(options.body) : ({ ...options.body });
            }
            catch { }
            const advancedCarrier = options.advancedOptions ? buildIndependentAdvancedCarrier(options.advancedOptions, { source: 'custom' }) : null;
            if (options.advancedOptions?.excludedParams?.length)
                remoteBody = applyIndependentAdvancedExclusions(remoteBody, options.advancedOptions);
            const body = {
                ...remoteBody,
                chat_completion_source: 'custom',
                custom_url: customUrl,
                custom_include_headers,
                custom_include_body: '',
                custom_exclude_body: '',
                ...advancedCarrier,
                stream: remoteBody.stream !== false,
            };
            options.assertAdvancedCurrent?.();
            return await fetchRabbitMirrorIndependentCompletion(ST_CUSTOM_GENERATE_ENDPOINT, {
                method: 'POST',
                credentials: 'same-origin',
                headers: requestHeaders,
                signal: options.signal,
                body: JSON.stringify(body),
                rabbitMirrorDispatchLease: options.dispatchLease, rabbitMirrorRequestObserver: options.onEvidenceRequest,
            });
        }
        return new Response(JSON.stringify({ error: { message: __rmT("tbGP9kBNMBvJTuiA37j2AtK5LNzP.1pmcyfmvWwNOlTtyr.Kjm3tVcGkj.ixRxw6Bxeku1VoQlZ9Y.7tbdeiDpBqSx6o8vKKLT9ncuYn5Yw97RTuKhnhm2t6P8IDMTY855y7tXetKnm5oh") } }), {
            status: 404,
            headers: { 'content-type': 'application/json' },
        });
    }
    catch (error) {
        if (options.signal?.aborted || error?.name === 'AbortError')
            throw error;
        if (independentLocalPreflightFailure(error))
            throw error;
        throw new Error(`${__rmT("GY.lFYjgp2Dyl1n2RjaMIdmtm18A17HhVPiP2BVbLYLIz86G1OKGngETdIFpN9_lJzw.zDgC")}${error?.message || error}`);
    }
}
function independentModelListError(message, code = 'MODEL_LIST_UNAVAILABLE') {
    const error = new Error(String(message || __rmT("7hbuZKZ1dipuTDVGQE_")));
    error.code = code;
    return error;
}
function compactIndependentPayloadError(payload) {
    if (!payload || typeof payload !== 'object')
        return '';
    const candidates = [
        typeof payload.error === 'string' ? payload.error : '',
        payload.error?.message,
        payload.message,
        payload.detail,
        typeof payload.data?.error === 'string' ? payload.data.error : '',
        payload.data?.error?.message,
        payload.data?.message,
        payload.data?.detail,
        typeof payload.data?.data?.error === 'string' ? payload.data.data.error : '',
        payload.data?.data?.error?.message,
        payload.data?.data?.message,
    ];
    return candidates.map(value => String(value || '').trim()).find(Boolean)?.slice(0, 220) || '';
}
function independentPayloadHasError(payload) {
    if (!payload || typeof payload !== 'object')
        return false;
    if (payload.error === true)
        return true;
    if (typeof payload.error === 'string' && payload.error.trim())
        return true;
    if (payload.error && typeof payload.error === 'object' && !Array.isArray(payload.error))
        return true;
    return false;
}
function independentModelId(value) {
    if (typeof value === 'string')
        return value.trim();
    if (!value || typeof value !== 'object')
        return '';
    const candidate = value.id ?? value.model ?? value.model_id ?? value.name ?? value.slug ?? '';
    return String(candidate || '').trim();
}
function extractIndependentModelList(payload) {
    const queues = [];
    const push = (value) => { if (Array.isArray(value))
        queues.push(value); };
    push(payload);
    if (payload && typeof payload === 'object') {
        push(payload.data);
        push(payload.models);
        push(payload.items);
        push(payload.result);
        push(payload.results);
        const nested = payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data) ? payload.data : null;
        if (nested) {
            push(nested.data);
            push(nested.models);
            push(nested.items);
            push(nested.result);
            push(nested.results);
        }
    }
    const ids = [];
    for (const list of queues) {
        for (const item of list) {
            const id = independentModelId(item);
            if (id)
                ids.push(id);
        }
        if (ids.length)
            break;
    }
    return [...new Set(ids)].sort((a, b) => a.localeCompare(b));
}
async function readIndependentResponsePayload(response) {
    const raw = await response.text().catch(() => '');
    if (!raw)
        return { raw: '', json: null };
    try {
        return { raw, json: JSON.parse(raw) };
    }
    catch {
        return { raw, json: null };
    }
}
function publishIndependentModelListDiagnostic(value = {}) {
    lastIndependentModelListDiagnostic = { ...value, ts: Date.now() };
    return lastIndependentModelListDiagnostic;
}
export function getLastIndependentModelListDiagnostic() { return lastIndependentModelListDiagnostic ? { ...lastIndependentModelListDiagnostic } : null; }
function independentModelListSettings(options) {
    options = options || {};
    const current = getSettings();
    const mode = String(options?.mode || 'active').trim().toLowerCase();
    if (mode === 'profile') {
        return {
            ...current,
            independentConnectionProfileId: normalizeIndependentConnectionText(options.profileId ?? current.independentConnectionProfileId, 160),
        };
    }
    if (mode === 'manual') {
        return {
            ...current,
            independentConnectionProfileId: '',
            independentApiBaseUrl: String(options.baseUrl ?? current.independentApiBaseUrl ?? '').trim(),
            independentApiKey: String(options.apiKey ?? current.independentApiKey ?? ''),
        };
    }
    return current;
}
export async function fetchIndependentModels(options) {
    options = options || {};
    const perfEnd = globalThis.__rabbitMirrorPerfDiag?.begin?.('independent.fetchModels', {}, 0);
    const requestedMode = String(options?.mode || 'active').trim().toLowerCase();
    const st = independentModelListSettings(options);
    const connectionId = normalizeIndependentConnectionText(st.independentConnectionProfileId, 160);
    if (requestedMode === 'profile' && !connectionId)
        throw independentModelListError(__rmT("gn5uPMpleCBt6_1skpIeyIwtbzT0X_AFkQCa30N_oV_3CwiPge.SjKly6DKwKjQvIcFWSZLeTjKF_DJ35auoJh"), 'MODEL_LIST_PROFILE_CONFIG');
    const savedModels = connectionId ? savedIndependentModelsForProfile(connectionId, getContext()) : [];
    if (connectionId)
        await validatedIndependentConnectionProfile(connectionId);
    const url = connectionId ? '/models' : endpoint(st.independentApiBaseUrl, '/models');
    if (!url)
        throw independentModelListError(requestedMode === 'manual' ? __rmT("ESFaI8_s4XhS5C7bKewoqnCAvv1xAEb8glT") : __rmT("5LjjcgtCGTSyxatZSJgVObtXlaU.cHgExa1i.l88wzqM50IvLYAXyeWtez.OL0nHGO..mE1BXNsbyGhR"), 'MODEL_LIST_CONFIG');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), INDEPENDENT_MODEL_LIST_TIMEOUT_MS);
    try {
        const r = await fetchIndependentUrl(url, { method: 'GET', headers: connectionId ? {} : headers(st), signal: controller.signal, settings: st });
        const payload = await readIndependentResponsePayload(r);
        if (!r.ok) {
            const detail = compactIndependentPayloadError(payload.json) || String(payload.raw || '').trim().slice(0, 180);
            throw independentModelListError(`${__rmT("tEUFrQxJMS7rP3xBK09yEEY7CkEaVwtBFcdoDf")}${r.status}${detail ? ` · ${detail}` : ''}`, 'MODEL_LIST_HTTP');
        }
        if (independentPayloadHasError(payload.json)) {
            const detail = compactIndependentPayloadError(payload.json);
            throw independentModelListError(`${__rmT("wmh.0.OJzAkxMsC5tRHwCsYPCIf")}${detail ? `${__rmT("7ys")}${detail}` : ''}`, 'MODEL_LIST_UPSTREAM');
        }
        const models = extractIndependentModelList(payload.json);
        if (!models.length)
            throw independentModelListError(__rmT("ngpgp0QxToFzqd8FVSIzfRSJPrQjyGXkd7uL7LJiEX1wmY0r"), 'MODEL_LIST_EMPTY');
        publishIndependentModelListDiagnostic({ mode: 'remote', count: models.length, error: '' });
        perfEnd?.({ result: 'remote', count: models.length });
        return models;
    }
    catch (error) {
        const finalError = controller.signal.aborted
            ? independentModelListError(__rmT("kQsOM48GGF7m37d4XEu6_iyo5LzeuFIi9jiGRVqYgHHRCkQKwKT"), 'MODEL_LIST_TIMEOUT')
            : error;
        if (connectionId && savedModels.length) {
            publishIndependentModelListDiagnostic({ mode: 'saved-fallback', count: savedModels.length, error: String(finalError?.message || finalError) });
            perfEnd?.({ result: 'saved-fallback', count: savedModels.length, code: String(finalError?.code || '') });
            return savedModels;
        }
        perfEnd?.({ result: 'failed', code: String(finalError?.code || '') });
        publishIndependentModelListDiagnostic({ mode: 'failed', count: 0, error: String(finalError?.message || finalError) });
        throw finalError;
    }
    finally {
        clearTimeout(timeoutId);
    }
}
export async function testIndependentConnection() {
    const st = getSettings();
    const manualModel = String(st.independentApiModel || '').trim();
    try {
        const models = await fetchIndependentModels();
        const diagnostic = getLastIndependentModelListDiagnostic();
        if (diagnostic?.mode === 'saved-fallback')
            return { ok: true, verified: false, modelListAvailable: false, models, manualModel, error: diagnostic.error || __rmT("P3_zY54uKlsX6rTeIyalssVeDihsxXMn.N0Tw9aOCZqGE3avfV66unKBiDUwgiqsOV19V06SZvho4Tz.WsWNwKJMvSf1ooBpLlG"), code: 'MODEL_LIST_SAVED_FALLBACK' };
        return { ok: true, verified: true, modelListAvailable: true, models, manualModel, error: '' };
    }
    catch (error) {
        return { ok: false, verified: false, modelListAvailable: false, models: [], manualModel, error: String(error?.message || error || __rmT("f8Y4OjwTpeFRrtiA.MW0Jh")), code: String(error?.code || '') };
    }
}
