import { rmT as __rmT } from "./textTable.js?rmv=2.6.3";
import { applyAtmosphereNotes, compactAtmosphereMenu } from './atmosphereChoice.js?rmv=2.6.3';
import { faceDrawMetadataFields } from './faceDrawRules.js?rmv=2.6.3';
import { presentationModeFields, isBlankLongTextSelection } from './presentationMode.js?rmv=2.6.3';
import { compactFormatDescriptors, isExternalSelectionId } from './selectionImageMetadata.js?rmv=2.6.3';
import { getSettings, updateSettings } from './settings.js?rmv=2.6.3';
import { getCurrentChatKey, resetFormatEligibleMisses } from './storage.js?rmv=2.6.3';
import { messageStampSeconds, stampSeconds } from './messageStamp.js?rmv=2.6.3';
import { THEMATIC_CATEGORIES } from '../data/structured/thematicIndex.js?rmv=2.6.3';
import { PRESENTATION_FORMATS } from '../data/structured/presentationIndex.js?rmv=2.6.3';
export const BLACKLIST_CHANGED_EVENT = 'rabbitmirror:blacklist-changed';
export const RECIPE_RECORDED_EVENT = 'rabbitmirror:recipe-recorded';
const RECIPE_STORAGE_KEY = 'rabbit_mirror_theater:selection_recipes:v1';
const MAX_RECIPE_RECORDS = 600;
const MAX_BLACKLIST_IDS = 512;
export const FAVORITE_MULTIPLIER_DEFAULT = 3;
export const FAVORITE_MULTIPLIER_MIN = 1;
export const FAVORITE_MULTIPLIER_MAX = 50;
let recipeRecordsCacheRaw = null;
let recipeRecordsCache = null;
const THEME_BY_ID = new Map(THEMATIC_CATEGORIES.map(item => [String(item?.id || ''), item]));
const FORMAT_BY_ID = new Map(PRESENTATION_FORMATS.map(item => [String(item?.id || ''), item]));
const LEGACY_AMBIGUOUS_FORMAT_ID = '1.3.3';
export const LEGACY_FORMAT_ID_ALIASES = Object.freeze({ '5.1.1.7': '10.2.10', '11.2.1': '2.1.12' });
export function canonicalFormatId(id) {
    const value = String(id || '').trim();
    if (FORMAT_BY_ID.has(value))
        return value;
    return Object.prototype.hasOwnProperty.call(LEGACY_FORMAT_ID_ALIASES, value) ? LEGACY_FORMAT_ID_ALIASES[value] : value;
}
const LEGACY_AMBIGUOUS_FORMAT_TARGET_IDS = ['1.3.3.platform', '1.3.3.review'];
const LEGACY_AMBIGUOUS_FORMAT_RECIPE_ITEM = Object.freeze({
    id: LEGACY_AMBIGUOUS_FORMAT_ID,
    group: '1',
    title: __rmT("le2jHsHf4DZIJAF2srv9YWAd7aAEsj1CwnfAAhfB31bYDx4lH.ce5t82eIaLv0QyPON_RxYA.RTeEf"),
    kind: 'format',
    ambiguous: true,
});
function compactIds(values) {
    return [...new Set((Array.isArray(values) ? values : [])
            .map(value => String(value || '').trim())
            .filter(Boolean))]
        .slice(0, MAX_BLACKLIST_IDS);
}
function hashRecipeText(text) {
    let hash = 2166136261;
    for (const char of String(text || '')) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}
function recipeMessageFingerprint(message, swipeId = -1) {
    if (!message || typeof message !== 'object')
        return '';
    const swipe = Number(swipeId);
    const source = Number.isInteger(swipe) && swipe >= 0 && typeof message?.swipes?.[swipe] === 'string'
        ? message.swipes[swipe]
        : typeof message?.mes === 'string'
            ? message.mes
            : '';
    const stable = String(message?.send_date ?? message?.mesid ?? '');
    if (!source && !stable)
        return '';
    return hashRecipeText(`${stable}|${source}`);
}
function normalizeKind(kind) {
    return kind === 'format' ? 'format' : 'theme';
}
function canonicalBlacklistIds(kind, values) {
    const normalized = normalizeKind(kind);
    const source = normalized === 'format' ? compactIds(compactIds(values).map(canonicalFormatId)) : compactIds(values);
    if (normalized !== 'format' || !source.includes(LEGACY_AMBIGUOUS_FORMAT_ID))
        return source;
    const expanded = [];
    for (const id of source) {
        if (id === LEGACY_AMBIGUOUS_FORMAT_ID)
            expanded.push(...LEGACY_AMBIGUOUS_FORMAT_TARGET_IDS);
        else
            expanded.push(id);
    }
    return compactIds(expanded);
}
function blacklistTargetIds(kind, id) {
    const normalized = normalizeKind(kind);
    const value = String(id || '').trim();
    if (!value)
        return [];
    if (normalized === 'format' && value === LEGACY_AMBIGUOUS_FORMAT_ID)
        return [...LEGACY_AMBIGUOUS_FORMAT_TARGET_IDS];
    return [value];
}
function settingKeyForKind(kind) {
    return normalizeKind(kind) === 'format' ? 'blacklistedFormatIds' : 'blacklistedThemeIds';
}
function favoriteSettingKeyForKind(kind) {
    return normalizeKind(kind) === 'format' ? 'favoriteFormatIds' : 'favoriteThemeIds';
}
function favoriteMultiplierSettingKeyForKind(kind) {
    return normalizeKind(kind) === 'format' ? 'favoriteFormatMultipliers' : 'favoriteThemeMultipliers';
}
function normalizeFavoriteMultiplier(value) {
    const empty = value == null || (typeof value === 'string' && !value.trim());
    const parsed = empty ? NaN : Number(value);
    const bounded = Math.max(FAVORITE_MULTIPLIER_MIN, Math.min(FAVORITE_MULTIPLIER_MAX, Number.isFinite(parsed) ? parsed : FAVORITE_MULTIPLIER_DEFAULT));
    return Math.round(bounded * 2) / 2;
}
function favoriteMultiplierMap(kind, settings = getSettings()) {
    const normalized = normalizeKind(kind);
    const key = favoriteMultiplierSettingKeyForKind(normalized);
    const source = settings?.[key] && typeof settings[key] === 'object' && !Array.isArray(settings[key]) ? settings[key] : {};
    return source;
}
function itemMapForKind(kind) {
    return normalizeKind(kind) === 'format' ? FORMAT_BY_ID : THEME_BY_ID;
}
function dispatchBlacklistChanged(detail = {}) {
    try {
        globalThis.dispatchEvent?.(new CustomEvent(BLACKLIST_CHANGED_EVENT, { detail }));
    }
    catch {
    }
}
export function getBlacklistState() {
    const settings = getSettings();
    const themeIds = canonicalBlacklistIds('theme', settings.blacklistedThemeIds);
    const formatIds = canonicalBlacklistIds('format', settings.blacklistedFormatIds);
    return {
        enabled: settings.blacklistEnabled !== false,
        themeIds,
        formatIds,
        themeSet: new Set(themeIds),
        formatSet: new Set(formatIds),
    };
}
export function getFavoritesState(settings = getSettings()) {
    const blockedThemes = new Set(canonicalBlacklistIds('theme', settings.blacklistedThemeIds));
    const blockedFormats = new Set(canonicalBlacklistIds('format', settings.blacklistedFormatIds));
    const themeIds = canonicalBlacklistIds('theme', settings.favoriteThemeIds).filter(id => !blockedThemes.has(id));
    const formatIds = canonicalBlacklistIds('format', settings.favoriteFormatIds).filter(id => !blockedFormats.has(id));
    const themeSource = favoriteMultiplierMap('theme', settings);
    const formatSource = favoriteMultiplierMap('format', settings);
    const themeMultipliers = Object.fromEntries(themeIds.map(id => [id, normalizeFavoriteMultiplier(themeSource[id])]));
    const formatMultipliers = Object.fromEntries(formatIds.map(id => [id, normalizeFavoriteMultiplier(formatSource[id])]));
    return {
        themeIds,
        formatIds,
        themeSet: new Set(themeIds),
        formatSet: new Set(formatIds),
        themeMultipliers,
        formatMultipliers,
    };
}
export function getFavoriteMultiplier(kind, id, settings = getSettings()) {
    const normalized = normalizeKind(kind);
    const targets = blacklistTargetIds(normalized, id);
    if (!targets.length)
        return FAVORITE_MULTIPLIER_DEFAULT;
    const source = favoriteMultiplierMap(normalized, settings);
    const values = targets.map(target => normalizeFavoriteMultiplier(source[target]));
    return values.length ? Math.max(...values) : FAVORITE_MULTIPLIER_DEFAULT;
}
export function setFavoriteMultiplier(kind, id, value) {
    const normalized = normalizeKind(kind);
    const targets = blacklistTargetIds(normalized, id);
    if (!targets.length || !targets.every(target => isFavorited(normalized, target)))
        return null;
    const settings = getSettings();
    const key = favoriteMultiplierSettingKeyForKind(normalized);
    const current = { ...favoriteMultiplierMap(normalized, settings) };
    const multiplier = normalizeFavoriteMultiplier(value);
    for (const target of targets)
        current[target] = multiplier;
    updateSettings({ [key]: current });
    dispatchBlacklistChanged({ action: 'favorite-multiplier', kind: normalized, id: String(id || '').trim(), ids: targets, multiplier });
    return multiplier;
}
export function favoriteEntries(kind) {
    const normalized = normalizeKind(kind);
    const state = getFavoritesState();
    const ids = normalized === 'format' ? state.formatIds : state.themeIds;
    const map = itemMapForKind(normalized);
    return ids.map(id => {
        const item = map.get(id);
        return {
            id,
            kind: normalized,
            title: String(item?.title || id),
            group: String(item?.group || ''),
            multiplier: getFavoriteMultiplier(normalized, id),
        };
    });
}
export function selectionCatalogEntries(kind) {
    const normalized = normalizeKind(kind);
    const source = normalized === 'format' ? PRESENTATION_FORMATS : THEMATIC_CATEGORIES;
    return source.map(item => ({
        id: String(item?.id || ''),
        kind: normalized,
        title: String(item?.title || item?.id || ''),
        summary: String(item?.summary || ''),
        group: String(item?.group || ''),
    })).filter(item => item.id);
}
export function isFavorited(kind, id) {
    const value = String(id || '').trim();
    if (!value)
        return false;
    const state = getFavoritesState();
    const normalized = normalizeKind(kind);
    if (normalized === 'format' && value === LEGACY_AMBIGUOUS_FORMAT_ID) {
        return LEGACY_AMBIGUOUS_FORMAT_TARGET_IDS.every(targetId => state.formatSet.has(targetId));
    }
    return normalized === 'format' ? state.formatSet.has(value) : state.themeSet.has(value);
}
export function blacklistEntries(kind) {
    const normalized = normalizeKind(kind);
    const state = getBlacklistState();
    const ids = normalized === 'format' ? state.formatIds : state.themeIds;
    const map = itemMapForKind(normalized);
    return ids.map(id => {
        const item = map.get(id);
        return {
            id,
            kind: normalized,
            title: String(item?.title || id),
            group: String(item?.group || ''),
        };
    });
}
export function isBlacklisted(kind, id) {
    const value = String(id || '').trim();
    if (!value)
        return false;
    const state = getBlacklistState();
    const normalized = normalizeKind(kind);
    if (normalized === 'format' && value === LEGACY_AMBIGUOUS_FORMAT_ID) {
        return LEGACY_AMBIGUOUS_FORMAT_TARGET_IDS.every(targetId => state.formatSet.has(targetId));
    }
    return normalized === 'format' ? state.formatSet.has(value) : state.themeSet.has(value);
}
export function setBlacklistEnabled(enabled) {
    updateSettings({ blacklistEnabled: !!enabled });
    dispatchBlacklistChanged({ action: 'enabled', enabled: !!enabled });
    return !!enabled;
}
export function addBlacklistItem(kind, id) {
    const normalized = normalizeKind(kind);
    const targets = blacklistTargetIds(normalized, id);
    const map = itemMapForKind(normalized);
    if (!targets.length || targets.some(value => !map.has(value)))
        return false;
    const settings = getSettings();
    const key = settingKeyForKind(normalized);
    const favoriteKey = favoriteSettingKeyForKind(normalized);
    const multiplierKey = favoriteMultiplierSettingKeyForKind(normalized);
    const before = canonicalBlacklistIds(normalized, settings[key]);
    const beforeFavorites = canonicalBlacklistIds(normalized, settings[favoriteKey]);
    const beforeMultipliers = { ...favoriteMultiplierMap(normalized, settings) };
    const next = canonicalBlacklistIds(normalized, [...before, ...targets]);
    if (targets.some(value => !next.includes(value)))
        return false;
    const targetSet = new Set(targets);
    const nextFavorites = beforeFavorites.filter(value => !targetSet.has(value));
    const nextMultipliers = { ...beforeMultipliers };
    for (const target of targets)
        delete nextMultipliers[target];
    if (next.length === before.length && nextFavorites.length === beforeFavorites.length)
        return false;
    updateSettings({ [key]: next, [favoriteKey]: nextFavorites, [multiplierKey]: nextMultipliers });
    dispatchBlacklistChanged({ action: 'add', kind: normalized, id: String(id || '').trim(), ids: targets });
    return next.length !== before.length;
}
export function removeBlacklistItem(kind, id) {
    const normalized = normalizeKind(kind);
    const targets = blacklistTargetIds(normalized, id);
    if (!targets.length)
        return false;
    const settings = getSettings();
    const key = settingKeyForKind(normalized);
    const before = canonicalBlacklistIds(normalized, settings[key]);
    const blockedTargets = new Set(targets);
    const next = before.filter(item => !blockedTargets.has(item));
    if (next.length === before.length)
        return false;
    updateSettings({ [key]: next });
    if (normalized === 'format')
        resetFormatEligibleMisses(targets);
    dispatchBlacklistChanged({ action: 'remove', kind: normalized, id: String(id || '').trim(), ids: targets });
    return true;
}
export function toggleBlacklistItem(kind, id) {
    if (isBlacklisted(kind, id)) {
        removeBlacklistItem(kind, id);
        return isBlacklisted(kind, id);
    }
    addBlacklistItem(kind, id);
    return isBlacklisted(kind, id);
}
export function addFavoriteItem(kind, id) {
    const normalized = normalizeKind(kind);
    const targets = blacklistTargetIds(normalized, id);
    const map = itemMapForKind(normalized);
    if (!targets.length || targets.some(value => !map.has(value)))
        return false;
    const settings = getSettings();
    const favoriteKey = favoriteSettingKeyForKind(normalized);
    const blacklistKey = settingKeyForKind(normalized);
    const before = canonicalBlacklistIds(normalized, settings[favoriteKey]);
    const beforeBlocked = canonicalBlacklistIds(normalized, settings[blacklistKey]);
    const next = canonicalBlacklistIds(normalized, [...before, ...targets]);
    if (targets.some(value => !next.includes(value)))
        return false;
    const targetSet = new Set(targets);
    const nextBlocked = beforeBlocked.filter(value => !targetSet.has(value));
    if (next.length === before.length && nextBlocked.length === beforeBlocked.length)
        return false;
    updateSettings({ [favoriteKey]: next, [blacklistKey]: nextBlocked });
    if (normalized === 'format' && nextBlocked.length !== beforeBlocked.length)
        resetFormatEligibleMisses(targets);
    if (nextBlocked.length !== beforeBlocked.length)
        dispatchBlacklistChanged({ action: 'remove-conflict', kind: normalized, id: String(id || '').trim(), ids: targets });
    return next.length !== before.length;
}
export function removeFavoriteItem(kind, id) {
    const normalized = normalizeKind(kind);
    const targets = blacklistTargetIds(normalized, id);
    if (!targets.length)
        return false;
    const settings = getSettings();
    const key = favoriteSettingKeyForKind(normalized);
    const multiplierKey = favoriteMultiplierSettingKeyForKind(normalized);
    const before = canonicalBlacklistIds(normalized, settings[key]);
    const targetSet = new Set(targets);
    const next = before.filter(value => !targetSet.has(value));
    if (next.length === before.length)
        return false;
    const nextMultipliers = { ...favoriteMultiplierMap(normalized, settings) };
    for (const target of targets)
        delete nextMultipliers[target];
    updateSettings({ [key]: next, [multiplierKey]: nextMultipliers });
    return true;
}
export function toggleFavoriteItem(kind, id) {
    if (isFavorited(kind, id)) {
        removeFavoriteItem(kind, id);
        return isFavorited(kind, id);
    }
    addFavoriteItem(kind, id);
    return isFavorited(kind, id);
}
export function clearFavorites(kind = 'all') {
    const normalized = String(kind || 'all');
    const patch = {};
    if (normalized === 'all' || normalized === 'theme') {
        patch.favoriteThemeIds = [];
        patch.favoriteThemeMultipliers = {};
    }
    if (normalized === 'all' || normalized === 'format') {
        patch.favoriteFormatIds = [];
        patch.favoriteFormatMultipliers = {};
    }
    if (!Object.keys(patch).length)
        return false;
    updateSettings(patch);
    return true;
}
export function clearBlacklist(kind = 'all') {
    const normalized = String(kind || 'all');
    const patch = {};
    const settings = getSettings();
    const clearedFormatIds = normalized === 'all' || normalized === 'format'
        ? canonicalBlacklistIds('format', settings.blacklistedFormatIds)
        : [];
    if (normalized === 'all' || normalized === 'theme')
        patch.blacklistedThemeIds = [];
    if (normalized === 'all' || normalized === 'format')
        patch.blacklistedFormatIds = [];
    if (!Object.keys(patch).length)
        return false;
    updateSettings(patch);
    if (clearedFormatIds.length)
        resetFormatEligibleMisses(clearedFormatIds);
    dispatchBlacklistChanged({ action: 'clear', kind: normalized });
    return true;
}
export function filterRandomThemePool(pool, settings = getSettings()) {
    const items = Array.isArray(pool) ? pool : [];
    if (settings?.blacklistEnabled === false)
        return [...items];
    const blocked = new Set(canonicalBlacklistIds('theme', settings?.blacklistedThemeIds));
    return blocked.size ? items.filter(item => !blocked.has(String(item?.id || ''))) : [...items];
}
export function filterRandomFormatPool(pool, settings = getSettings()) {
    const items = Array.isArray(pool) ? pool : [];
    if (settings?.blacklistEnabled === false)
        return [...items];
    const blocked = new Set(canonicalBlacklistIds('format', settings?.blacklistedFormatIds));
    return blocked.size ? items.filter(item => !blocked.has(String(item?.id || ''))) : [...items];
}
function compactDirectiveCounts(metadata) {
    return Object.fromEntries(['customThemeCount', 'customFormatCount', 'customRequestCount']
        .filter(key => Number(metadata?.[key]) > 0)
        .map(key => [key, Math.min(1000, Math.max(1, Math.floor(Number(metadata[key]))))]));
}
function atmosphereChoiceValue(value, menuLength) {
    return Number.isInteger(value) && value >= 0 && value < menuLength ? value : null;
}
function compactSelectionMetadata(metadata = {}, allowFaces = true) {
    const themeIds = compactIds(metadata?.themeIds).filter(id => THEME_BY_ID.has(id) || isExternalSelectionId(id));
    const formatIds = compactIds(compactIds(metadata?.formatIds).map(canonicalFormatId)).filter(id => FORMAT_BY_ID.has(id) || isExternalSelectionId(id));
    const formatDescriptors = compactFormatDescriptors({ ...metadata, formatIds });
    const alignedLabels = (ids, sourceIds, labels) => ids.map(id => {
        const index = Array.isArray(sourceIds) ? sourceIds.indexOf(id) : -1;
        const label = labels?.[index];
        return typeof label === 'string' ? label.slice(0, 2209) : '';
    });
    const formatLabels = alignedLabels(formatIds, metadata?.formatIds, metadata?.formatLabels);
    const themeLabels = alignedLabels(themeIds, metadata?.themeIds, metadata?.themeLabels);
    const faces = allowFaces && Array.isArray(metadata?.faces) && metadata.faces.length >= 2 && metadata.faces.length <= 5
        ? metadata.faces.map(face => compactSelectionMetadata(face, false)) : null;
    const externalSources = [...new Set((Array.isArray(metadata?.externalSources) ? metadata.externalSources : [])
            .filter(name => typeof name === 'string').slice(0, 24)
            .map(name => name.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200)).filter(Boolean))];
    const hasExternalReferences = metadata?.hasExternalReferences === true || externalSources.length > 0
        || [...themeIds, ...formatIds].some(isExternalSelectionId);
    const atmosphereMenu = compactAtmosphereMenu(metadata?.atmosphereMenu);
    const atmosphereReason = String(metadata?.atmosphereReason || '').replace(/\s+/g, ' ').trim().slice(0, 300);
    const atmosphereChoice = atmosphereChoiceValue(metadata?.atmosphereChoice, atmosphereMenu?.length || 0);
    const unDrawn = metadata?.samplingMode === 'self_invent' || metadata?.pureOrderFace === true || metadata?.userDirectiveApplied === true;
    if (!themeIds.length && !formatIds.length && !hasExternalReferences && !metadata?.textIds?.length
        && !isBlankLongTextSelection(metadata) && !metadata?.worldBookEntryId && !faces?.some(Boolean) && !unDrawn)
        return null;
    return {
        themeIds,
        formatIds,
        ...(atmosphereMenu ? { atmosphereMenu } : {}),
        ...(atmosphereReason ? { atmosphereReason } : {}),
        ...(atmosphereChoice != null ? { atmosphereChoice } : {}),
        ...(themeLabels.some(Boolean) ? { themeLabels } : {}),
        ...(formatLabels.some(Boolean) ? { formatLabels } : {}),
        ...(formatDescriptors.length ? { formatDescriptors } : {}),
        ...(hasExternalReferences ? { hasExternalReferences: true, externalSources } : {}),
        ...presentationModeFields(metadata),
        ...faceDrawMetadataFields(metadata),
        ...compactDirectiveCounts(metadata),
        samplingMode: String(metadata?.samplingMode || 'classic'),
        ...(metadata?.samplingMode === 'self_invent' && ['classic', 'pair', 'format'].includes(metadata?.selfInventScope) ? { selfInventScope: metadata.selfInventScope } : {}),
        ...(metadata?.pureOrderFace === true ? { pureOrderFace: true } : {}),
        userDirectiveApplied: !!metadata?.userDirectiveApplied,
        forcedVisualScenery: !!metadata?.forcedVisualScenery || !!metadata?.visualSceneryMode,
        ...(faces ? { faces } : {}),
    };
}
function readRecipeRecords() {
    try {
        const raw = localStorage.getItem(RECIPE_STORAGE_KEY) || '[]';
        if (raw === recipeRecordsCacheRaw && Array.isArray(recipeRecordsCache))
            return recipeRecordsCache;
        const parsed = JSON.parse(raw);
        const normalized = Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'object') : [];
        recipeRecordsCacheRaw = raw;
        recipeRecordsCache = normalized;
        return normalized;
    }
    catch {
        recipeRecordsCacheRaw = null;
        recipeRecordsCache = null;
        return [];
    }
}
function writeRecipeRecords(records) {
    try {
        const normalized = (records || []).slice(-MAX_RECIPE_RECORDS);
        const raw = JSON.stringify(normalized);
        localStorage.setItem(RECIPE_STORAGE_KEY, raw);
        recipeRecordsCacheRaw = raw;
        recipeRecordsCache = normalized;
        return true;
    }
    catch (error) {
        console.warn(__rmT("Zq3IjumLG89pl.YqLtxik1wStVX3EcxrGlv50WFEwbtJOtPUgqtufNXFAppZ5TKHwt0UwQmMZJYzexlgr0nhmUDH"), error);
        if (!recipeWriteWarned) {
            recipeWriteWarned = true;
            try {
                globalThis.toastr?.warning?.(__rmT("tU8RJT_KGzVOnvtUxxd.3ef41qp6sVFmEmP8T8NXqTKd_RGR9pOydFS61Sd2YS4E05WAyTdRG8b5BKeMd87qEXow59JEdc0dtgOIFNdU9VNo.k"));
            }
            catch { }
        }
        return false;
    }
}
let recipeWriteWarned = false;
function recipeRecordKey(chatKey, messageIndex, swipeId) {
    return `${String(chatKey || '')}|m:${Number(messageIndex)}|s:${Number(swipeId)}`;
}
function normalizeSwipeId(message, fallback = 0) {
    if (Number.isInteger(message?.swipe_id) && message.swipe_id >= 0)
        return message.swipe_id;
    const value = Number(fallback);
    return Number.isInteger(value) && value >= 0 ? value : 0;
}
const CHAT_RECIPE_METADATA_KEY = 'rabbit_mirror_follow_recipes_v1';
const MAX_CHAT_RECIPES = 400;
function liveChatMetadata() {
    try {
        const metadata = globalThis.SillyTavern?.getContext?.()?.chatMetadata || globalThis.chat_metadata;
        return metadata && typeof metadata === 'object' ? metadata : null;
    }
    catch {
        return null;
    }
}
function writeChatRecipe(index, swipe, message, compact, chatKey = '') {
    const metadata = liveChatMetadata();
    if (!metadata)
        return false;
    try {
        const store = metadata[CHAT_RECIPE_METADATA_KEY] && typeof metadata[CHAT_RECIPE_METADATA_KEY] === 'object' ? metadata[CHAT_RECIPE_METADATA_KEY] : {};
        const current = String(getCurrentChatKey() || '');
        if (chatKey && current && chatKey !== current)
            return false;
        const stamp = messageStampSeconds(message, swipe);
        if (!stamp)
            return false;
        store[`${index}:${swipe}`] = { ...compact, stampS: stamp, ts: Date.now() };
        const keys = Object.keys(store);
        if (keys.length > MAX_CHAT_RECIPES) {
            keys.sort((a, b) => Number(store[a]?.ts || 0) - Number(store[b]?.ts || 0)).slice(0, keys.length - MAX_CHAT_RECIPES).forEach(key => delete store[key]);
        }
        metadata[CHAT_RECIPE_METADATA_KEY] = store;
        return true;
    }
    catch {
        return false;
    }
}
function readChatRecipe(index, swipe, message) {
    const record = liveChatMetadata()?.[CHAT_RECIPE_METADATA_KEY]?.[`${index}:${swipe}`];
    if (!record || typeof record !== 'object')
        return null;
    const stamp = messageStampSeconds(message, swipe);
    const saved = Number.isInteger(record.stampS) ? record.stampS : stampSeconds(record.stamp);
    if (!stamp || !saved || saved !== stamp)
        return null;
    return record;
}
export function recordRabbitMirrorRecipe({ chat = null, chatKey = '', messageIndex = -1, swipeId = 0, message = null, metadata = null, source = '' } = {}) {
    const compact = compactSelectionMetadata(applyAtmosphereNotes(metadata, message?.mes || ''));
    const index = Number(messageIndex);
    if (!compact || !Number.isInteger(index) || index < 0)
        return false;
    const resolvedChatKey = String(chatKey || getCurrentChatKey(Array.isArray(chat) ? chat : null) || '').trim();
    if (!resolvedChatKey)
        return false;
    const resolvedSwipe = normalizeSwipeId(message, swipeId);
    const messageFingerprint = recipeMessageFingerprint(message, resolvedSwipe);
    const key = recipeRecordKey(resolvedChatKey, index, resolvedSwipe);
    const existingRecords = readRecipeRecords();
    const existing = [...existingRecords].reverse().find(item => item?.key === key) || null;
    const sourceText = String(source || '');
    const unchanged = existing
        && JSON.stringify(existing.themeIds || []) === JSON.stringify(compact.themeIds)
        && JSON.stringify(existing.formatIds || []) === JSON.stringify(compact.formatIds)
        && JSON.stringify(existing.themeLabels || []) === JSON.stringify(compact.themeLabels || [])
        && JSON.stringify(existing.formatLabels || []) === JSON.stringify(compact.formatLabels || [])
        && JSON.stringify(existing.formatDescriptors || []) === JSON.stringify(compact.formatDescriptors || [])
        && JSON.stringify(presentationModeFields(existing)) === JSON.stringify(presentationModeFields(compact))
        && JSON.stringify(faceDrawMetadataFields(existing)) === JSON.stringify(faceDrawMetadataFields(compact))
        && JSON.stringify(compactDirectiveCounts(existing)) === JSON.stringify(compactDirectiveCounts(compact))
        && JSON.stringify(existing.externalSources || []) === JSON.stringify(compact.externalSources || [])
        && !!existing.hasExternalReferences === !!compact.hasExternalReferences
        && String(existing.samplingMode || '') === compact.samplingMode
        && !!existing.userDirectiveApplied === compact.userDirectiveApplied
        && !!existing.forcedVisualScenery === compact.forcedVisualScenery
        && String(existing.atmosphereReason || '') === String(compact.atmosphereReason || '')
        && atmosphereChoiceValue(existing.atmosphereChoice, (existing.atmosphereMenu || []).length) === atmosphereChoiceValue(compact.atmosphereChoice, (compact.atmosphereMenu || []).length)
        && JSON.stringify(existing.atmosphereMenu || null) === JSON.stringify(compact.atmosphereMenu || null)
        && String(existing.source || '') === sourceText
        && String(existing.messageFingerprint || '') === messageFingerprint;
    const facesUnchanged = JSON.stringify(existing?.faces || null) === JSON.stringify(compact.faces || null);
    const inChat = writeChatRecipe(index, resolvedSwipe, message, compact, resolvedChatKey);
    if (unchanged && facesUnchanged)
        return true;
    const records = existingRecords.filter(item => item?.key !== key);
    records.push({
        key,
        chatKey: resolvedChatKey,
        messageIndex: index,
        swipeId: resolvedSwipe,
        source: sourceText,
        messageFingerprint,
        ...compact,
        ts: Date.now(),
    });
    const written = writeRecipeRecords(records) || inChat;
    if (written) {
        try {
            globalThis.dispatchEvent?.(new CustomEvent(RECIPE_RECORDED_EVENT, { detail: { chatKey: resolvedChatKey, messageIndex: index, swipeId: resolvedSwipe } }));
        }
        catch { }
    }
    return written;
}
function recipeView(record, faceIndex, includeExternalOnly) {
    if (!record || typeof record !== 'object')
        return null;
    if (!Array.isArray(record.faces))
        return decorateRecipe(record, includeExternalOnly);
    if (!Number.isInteger(faceIndex) || faceIndex < 0 || faceIndex >= record.faces.length)
        return null;
    const face = compactSelectionMetadata(record.faces[faceIndex], false);
    const { requestedPresentationMode, presentationMode, blankLongText, textIds, textLabels, themeLabels, formatDescriptors, formatLabels, customThemeCount, customFormatCount, customRequestCount, faceDrawConfigured, faceDrawState, ...batchRecord } = record;
    return face ? decorateRecipe({ ...batchRecord, hasExternalReferences: false, externalSources: [], ...face, faceIndex }, includeExternalOnly) : null;
}
export function recipeFromSelectionMetadata(metadata, { faceIndex = null, includeExternalOnly = false } = {}) {
    const compact = compactSelectionMetadata(metadata);
    return compact ? recipeView(compact, faceIndex, includeExternalOnly) : null;
}
export function getRabbitMirrorRecipe({ chatKey = '', messageIndex = -1, swipeId = -1, message = null, faceIndex = null, includeExternalOnly = false } = {}) {
    const faceRecipe = record => recipeView(record, faceIndex, includeExternalOnly);
    const resolvedChatKey = String(chatKey || '').trim();
    const index = Number(messageIndex);
    if (!resolvedChatKey || !Number.isInteger(index) || index < 0)
        return null;
    const swipe = Number(swipeId);
    const records = readRecipeRecords();
    if (Number.isInteger(swipe) && swipe >= 0) {
        const exactKey = recipeRecordKey(resolvedChatKey, index, swipe);
        const exact = [...records].reverse().find(item => item?.key === exactKey);
        const currentFingerprint = recipeMessageFingerprint(message, swipe);
        const localOk = exact && !(exact.messageFingerprint && currentFingerprint && exact.messageFingerprint !== currentFingerprint);
        const saved = readChatRecipe(index, swipe, message);
        if (saved && (!localOk || Number(saved.ts || 0) > Number(exact.ts || 0)))
            return recipeFromSelectionMetadata(saved, { faceIndex, includeExternalOnly });
        return localOk ? faceRecipe(exact) : null;
    }
    const fallback = [...records].reverse().find(item => item?.chatKey === resolvedChatKey && Number(item?.messageIndex) === index);
    if (!fallback)
        return null;
    const currentFingerprint = recipeMessageFingerprint(message, Number(fallback?.swipeId));
    if (fallback.messageFingerprint && currentFingerprint && fallback.messageFingerprint !== currentFingerprint)
        return null;
    return faceRecipe(fallback);
}
function decorateRecipe(record, includeExternalOnly = false) {
    const themes = compactIds(record?.themeIds).map(id => {
        const item = THEME_BY_ID.get(id);
        return item ? { id, title: String(item.title || id), group: String(item.group || ''), kind: 'theme' } : null;
    }).filter(Boolean);
    const formats = compactIds(record?.formatIds).map(id => {
        const item = FORMAT_BY_ID.get(id);
        if (item)
            return { id, title: String(item.title || id), group: String(item.group || ''), kind: 'format' };
        if (id === LEGACY_AMBIGUOUS_FORMAT_ID)
            return { ...LEGACY_AMBIGUOUS_FORMAT_RECIPE_ITEM };
        return null;
    }).filter(Boolean);
    const textIds = compactIds(record?.textIds);
    if (!themes.length && !formats.length && !(includeExternalOnly && (record.hasExternalReferences || isBlankLongTextSelection(record) || textIds.length || record.worldBookEntryId)))
        return null;
    return {
        ...record,
        ...(!includeExternalOnly ? { themeIds: themes.map(item => item.id), formatIds: formats.map(item => item.id) } : {}),
        themes,
        formats,
    };
}
export function blacklistPoolStats() {
    const state = getBlacklistState();
    const themeBlocked = state.themeIds.filter(id => THEME_BY_ID.has(id)).length;
    const formatBlocked = state.formatIds.filter(id => FORMAT_BY_ID.has(id)).length;
    return {
        themeTotal: THEMATIC_CATEGORIES.length,
        formatTotal: PRESENTATION_FORMATS.length,
        themeBlocked,
        formatBlocked,
        themePoolEmpty: state.enabled && themeBlocked >= THEMATIC_CATEGORIES.length,
        formatPoolEmpty: state.enabled && formatBlocked >= PRESENTATION_FORMATS.length,
    };
}
