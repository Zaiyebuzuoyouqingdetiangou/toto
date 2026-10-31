import { rmT as __rmT } from "./textTable.js?rmv=2.3.6";
import { getHostRequestHeaders } from './externalWorldBook/capabilities.js?rmv=2.3.6';
export const FAVORITE_BACKUP_INDEX_NAME = 'rabbitmirror-favorites.json';
const FORMAT = 'rabbitmirror-favorites';
const VERSION = 1;
const FILE_PREFIX = 'rabbitmirror-fav-';
const SAVE_DELAY_MS = 3000;
const STATUS_KEY = 'rabbit_mirror_favorite_server_backup:v1';
const PENDING_DELETE_KEY = 'rabbit_mirror_favorite_pending_delete:v1';
const RETRY_DELAYS_MS = [30000, 120000, 600000];
const PROGRESS_EVERY = 8;
let timer = 0;
let saving = null;
let retryCount = 0;
let lastStatus = null;
export class FavoriteServerBackupReadError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = 'FavoriteServerBackupReadError';
        this.readFailed = true;
        if (cause !== undefined)
            this.cause = cause;
    }
}
function readJson(key, fallback) {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(key) || 'null');
        return value ?? fallback;
    }
    catch {
        return fallback;
    }
}
function writeJson(key, value) {
    try {
        globalThis.localStorage?.setItem(key, JSON.stringify(value));
    }
    catch { }
}
function readPendingDeletes() {
    const value = readJson(PENDING_DELETE_KEY, null);
    return {
        favorites: Array.isArray(value?.favorites) ? value.favorites.map(String) : [],
        atlases: Array.isArray(value?.atlases) ? value.atlases.map(String) : [],
    };
}
function writePendingDeletes(value) {
    if (!value.favorites.length && !value.atlases.length) {
        try {
            globalThis.localStorage?.removeItem(PENDING_DELETE_KEY);
        }
        catch { }
        return;
    }
    writeJson(PENDING_DELETE_KEY, { favorites: [...new Set(value.favorites)], atlases: [...new Set(value.atlases)] });
}
function readStatus() {
    if (!lastStatus)
        lastStatus = readJson(STATUS_KEY, null);
    return lastStatus;
}
function writeStatus(status) {
    lastStatus = status;
    writeJson(STATUS_KEY, status);
    try {
        globalThis.dispatchEvent?.(new CustomEvent('rabbitmirror:favorite-backup', { detail: status }));
    }
    catch { }
}
export function getFavoriteServerBackupStatus() { return readStatus(); }
export function favoriteBackupFileName(id) {
    return `${FILE_PREFIX}${String(id || '').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 100)}.json`;
}
function signature(record) {
    return `${Number(record?.createdAt) || 0}:${String(record?.html || '').length}:${String(record?.title || '').length}`;
}
function base64Utf8(text) {
    const bytes = new TextEncoder().encode(String(text || ''));
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000)
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    return btoa(binary);
}
async function readServerJson(name, { fetchImpl = globalThis.fetch } = {}) {
    if (typeof fetchImpl !== 'function')
        throw new FavoriteServerBackupReadError(__rmT("VwH5IpljVoVC8OrRg.IQ00iUIgOL.T1O29E"));
    let response;
    try {
        response = await fetchImpl(`/user/files/${name}?t=${Date.now()}`, { cache: 'no-store', credentials: 'same-origin' });
    }
    catch (error) {
        throw new FavoriteServerBackupReadError(`${__rmT("pUCXpP7wdZrogjY3ggPgSWMmLpiQlrvriPi4nQXMDZljQ49x")}${String(error?.message || error || __rmT("cHhXcUwjS2T"))}${__rmT("7Z2rzT")}`, error);
    }
    if (response?.status === 404)
        return null;
    if (!response?.ok)
        throw new FavoriteServerBackupReadError(`${__rmT("wS6GI26cpzzUtLO685FfLrF.bamhSKDSurf")}${response?.status ?? __rmT("1iBmOyCU")}${__rmT("7Z2rzT")}`);
    let text;
    try {
        text = await response.text();
    }
    catch (error) {
        throw new FavoriteServerBackupReadError(__rmT("PFGoEosrcOY7AeKzDttYaAwTyTAzE1fWqhxce6q5rlUfnnl0YS_pzq5X"), error);
    }
    if (!text.trim())
        return null;
    if (!/^\s*[{﻿]/.test(text))
        return null;
    try {
        return JSON.parse(text.replace(/^﻿/, ''));
    }
    catch (error) {
        throw new FavoriteServerBackupReadError(__rmT("WCqj_pdbzTv04_KHQPWh4pSTN_f0zxUGC3cvvP7MiLKpv.jxjfsr7f"), error);
    }
}
export async function readFavoriteServerIndex({ fetchImpl } = {}) {
    const value = await readServerJson(FAVORITE_BACKUP_INDEX_NAME, { fetchImpl });
    if (!value)
        return null;
    if (value.format !== FORMAT || !Array.isArray(value.items))
        throw new FavoriteServerBackupReadError(__rmT("IGIyoqprctPPQ7ZxXyIykj4Iv7TXHM0xahTHSZj4rlUfnY8Ozk9yPq5X"));
    return {
        format: FORMAT, version: Number(value.version) || VERSION, savedAt: Number(value.savedAt) || 0,
        items: value.items.filter(item => item && typeof item.id === 'string' && typeof item.file === 'string')
            .map(item => ({ id: item.id, file: item.file, sig: String(item.sig || ''), createdAt: Number(item.createdAt) || 0, title: String(item.title || '') })),
        atlases: Array.isArray(value.atlases) ? value.atlases.filter(atlas => atlas && typeof atlas.id === 'string') : [],
    };
}
async function upload(name, text, { fetchImpl = globalThis.fetch, headerProvider = getHostRequestHeaders } = {}) {
    const headers = await headerProvider();
    if (!headers)
        throw new Error(__rmT("ntvm1Z7PkbZsNryA755FPUUqVQGMnZzKf7ospf"));
    const response = await fetchImpl('/api/files/upload', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data: base64Utf8(text) }),
    });
    if (!response.ok)
        throw new Error(`${__rmT("xDMpe4l5YXCOLF.OQi3Qtx1y")}${response.status}${__rmT("7Z2rzT")}`);
}
async function removeServerFile(name, { fetchImpl = globalThis.fetch, headerProvider = getHostRequestHeaders } = {}) {
    try {
        const headers = await headerProvider();
        if (!headers)
            return false;
        const response = await fetchImpl('/api/files/delete', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: `user/files/${name}` }),
        });
        return !!response?.ok;
    }
    catch {
        return false;
    }
}
async function localState() {
    const favorites = await import('./theaterFavorites.js?rmv=2.3.6');
    const atlases = await import('./favoriteAtlases.js?rmv=2.3.6');
    return { rows: await favorites.listTheaterFavorites(), atlases: await atlases.listFavoriteAtlases().catch(() => null) };
}
export function noteFavoriteBackupDeletes({ favorites = [], atlases = [] } = {}) {
    const pending = readPendingDeletes();
    writePendingDeletes({ favorites: [...pending.favorites, ...favorites.map(String)], atlases: [...pending.atlases, ...atlases.map(String)] });
    scheduleFavoriteServerBackup();
}
export function forgetFavoriteBackupDeletes(ids = []) {
    const drop = new Set(ids.map(String));
    if (!drop.size)
        return;
    const pending = readPendingDeletes();
    writePendingDeletes({ favorites: pending.favorites.filter(id => !drop.has(id)), atlases: pending.atlases });
}
export async function saveFavoriteServerBackup({ fetchImpl, headerProvider, local } = {}) {
    const deleted = readPendingDeletes();
    const { rows, atlases } = local || await localState();
    let server = null;
    try {
        server = await readFavoriteServerIndex({ fetchImpl });
    }
    catch (error) {
        const previous = readStatus();
        writeStatus({ ok: false, readFailed: true, failedAt: Date.now(), message: `${error.message}${__rmT("1WcDU6WPCq1z_9Z_Rpr1lAZ1Mgbb9yfcoF9oSka4I3K1laOk8JyVBGUsMPrmBvkC")}`,
            savedAt: previous?.savedAt || 0, ...(Number.isFinite(Number(previous?.localCount)) ? { localCount: Number(previous.localCount) } : {}) });
        throw error;
    }
    const goneFavorites = new Set(deleted.favorites);
    const goneAtlases = new Set(deleted.atlases);
    const serverItems = new Map((server?.items || []).map(item => [item.id, item]));
    const localIds = new Set(rows.map(row => row.id));
    let uploaded = 0;
    const items = [];
    let serverSavedAt = Number(server?.savedAt || 0);
    const rebase = async () => {
        try {
            const latest = await readFavoriteServerIndex({ fetchImpl });
            if (!latest || Number(latest.savedAt) === serverSavedAt)
                return;
            server = latest;
            serverSavedAt = Number(latest.savedAt);
            serverItems.clear();
            for (const item of latest.items)
                serverItems.set(item.id, item);
        }
        catch { }
    };
    const writeProgress = async () => {
        await rebase();
        const done = new Set(items.map(item => item.id));
        const rest = [...serverItems.values()].filter(item => !done.has(item.id));
        const savedAt = Date.now();
        await upload(FAVORITE_BACKUP_INDEX_NAME, JSON.stringify({ format: FORMAT, version: VERSION, savedAt, items: [...items, ...rest], atlases: server?.atlases || [] }), { fetchImpl, headerProvider });
        serverSavedAt = savedAt;
    };
    let sinceProgress = 0;
    for (const row of rows) {
        const file = favoriteBackupFileName(row.id);
        const sig = signature(row);
        const known = serverItems.get(row.id);
        if (!known || known.sig !== sig || known.file !== file) {
            await upload(file, JSON.stringify({ format: `${FORMAT}-item`, version: VERSION, record: row }), { fetchImpl, headerProvider });
            uploaded += 1;
            sinceProgress += 1;
        }
        items.push({ id: row.id, file, sig, createdAt: Number(row.createdAt) || 0, title: String(row.title || '').slice(0, 120) });
        if (sinceProgress >= PROGRESS_EVERY) {
            await writeProgress();
            sinceProgress = 0;
        }
    }
    await rebase();
    const kept = [...serverItems.values()].filter(item => !localIds.has(item.id) && !goneFavorites.has(item.id));
    const removed = [...serverItems.values()].filter(item => !localIds.has(item.id) && goneFavorites.has(item.id));
    const localAtlases = Array.isArray(atlases) ? atlases : null;
    const localAtlasIds = new Set((localAtlases || []).map(atlas => String(atlas.id)));
    const keptAtlases = (server?.atlases || []).filter(atlas => !localAtlasIds.has(atlas.id) && (!localAtlases || !goneAtlases.has(atlas.id)));
    const index = { format: FORMAT, version: VERSION, savedAt: Date.now(), items: [...items, ...kept], atlases: [...(localAtlases || []), ...keptAtlases] };
    await upload(FAVORITE_BACKUP_INDEX_NAME, JSON.stringify(index), { fetchImpl, headerProvider });
    for (const item of removed)
        await removeServerFile(item.file, { fetchImpl, headerProvider });
    const now = readPendingDeletes();
    writePendingDeletes({ favorites: now.favorites.filter(id => !goneFavorites.has(id)), atlases: localAtlases ? now.atlases.filter(id => !goneAtlases.has(id)) : now.atlases });
    retryCount = 0;
    const status = { ok: true, savedAt: index.savedAt, count: index.items.length, localCount: rows.length, uploaded, keptFromServer: kept.length };
    writeStatus(status);
    return status;
}
export function scheduleFavoriteServerBackup({ retry = false } = {}) {
    if (typeof document === 'undefined' || typeof globalThis.fetch !== 'function')
        return;
    if (!retry)
        retryCount = 0;
    if (timer)
        clearTimeout(timer);
    timer = setTimeout(() => {
        timer = 0;
        const run = async () => {
            try {
                await saveFavoriteServerBackup();
            }
            catch (error) {
                if (!error?.readFailed)
                    writeStatus({ ok: false, failedAt: Date.now(), message: String(error?.message || error || __rmT("xDMpe4l5YXCOLF.OQi3QtxEI")), savedAt: readStatus()?.savedAt || 0,
                        ...(Number.isFinite(Number(readStatus()?.localCount)) ? { localCount: Number(readStatus().localCount) } : {}) });
                console.warn(__rmT("kgRTYhcxXS2m4ONWwxNuOg_eeQb7JQvzO3QRKgCUr0IIaIv3a7SgAvixR72L8jq7Yyu_zk"), error);
                if (retryCount < RETRY_DELAYS_MS.length) {
                    const delay = RETRY_DELAYS_MS[retryCount++];
                    if (!timer)
                        timer = setTimeout(() => { timer = 0; scheduleFavoriteServerBackup({ retry: true }); }, Math.max(0, delay - SAVE_DELAY_MS));
                }
            }
        };
        const next = (saving || Promise.resolve()).then(run, run);
        saving = next;
        next.finally(() => { if (saving === next)
            saving = null; });
    }, SAVE_DELAY_MS);
}
export async function restoreFavoritesFromServerBackup({ fetchImpl } = {}) {
    const index = await readFavoriteServerIndex({ fetchImpl });
    if (!index || (!index.items.length && !index.atlases.length))
        return { restored: 0, atlases: 0, failed: 0, empty: true };
    const skip = readPendingDeletes();
    const { rows, atlases } = await localState();
    const have = new Set(rows.map(row => row.id));
    const records = [];
    let failed = 0;
    for (const item of index.items) {
        if (have.has(item.id) || skip.favorites.includes(item.id))
            continue;
        try {
            const value = await readServerJson(item.file, { fetchImpl });
            if (value?.record && typeof value.record === 'object')
                records.push(value.record);
            else
                failed += 1;
        }
        catch {
            failed += 1;
        }
    }
    const favorites = await import('./theaterFavorites.js?rmv=2.3.6');
    const restored = records.length ? await favorites.importTheaterFavoriteRecords(records) : 0;
    let atlasCount = 0;
    if (!Array.isArray(atlases))
        return { restored, atlases: 0, failed, empty: false };
    const haveAtlases = new Set(atlases.map(atlas => String(atlas.id)));
    const atlasModule = await import('./favoriteAtlases.js?rmv=2.3.6');
    const usable = atlas => typeof atlas?.name === 'string' && Array.isArray(atlas.slots)
        && atlas.slots.every(slot => slot && typeof slot.id === 'string' && typeof slot.label === 'string' && Array.isArray(slot.keywords));
    for (const atlas of index.atlases) {
        if (haveAtlases.has(atlas.id) || skip.atlases.includes(atlas.id) || !usable(atlas))
            continue;
        try {
            await atlasModule.saveFavoriteAtlas(atlas);
            atlasCount += 1;
        }
        catch { }
    }
    return { restored, atlases: atlasCount, failed, empty: false };
}
export async function countMissingFavoritesInServerBackup({ fetchImpl, rows } = {}) {
    let index = null;
    try {
        index = await readFavoriteServerIndex({ fetchImpl });
    }
    catch {
        return 0;
    }
    if (!index)
        return 0;
    const local = rows || (await localState()).rows;
    const have = new Set(local.map(row => row.id));
    const skip = new Set(readPendingDeletes().favorites);
    return index.items.filter(item => !have.has(item.id) && !skip.has(item.id)).length;
}
function canAutoRestore() {
    const pending = readPendingDeletes();
    if (pending.favorites.length || pending.atlases.length)
        return false;
    const status = readStatus();
    if (!status)
        return true;
    return status.ok === true && Number(status.localCount) > 0;
}
let startupChecked = false;
export async function checkFavoriteServerBackupOnStartup({ fetchImpl } = {}) {
    if (startupChecked)
        return null;
    startupChecked = true;
    try {
        const { rows } = await localState();
        if (rows.length) {
            const status = readStatus();
            if (!status?.ok || Number(status.localCount) !== rows.length)
                scheduleFavoriteServerBackup();
            return null;
        }
        let index = null;
        try {
            index = await readFavoriteServerIndex({ fetchImpl });
        }
        catch {
            return null;
        }
        if (!index?.items?.length && !index?.atlases?.length)
            return null;
        const skip = readPendingDeletes();
        const missingFavorites = index.items.filter(item => !skip.favorites.includes(item.id)).length;
        const { atlases: localAtlases } = await localState();
        const haveAtlases = new Set((Array.isArray(localAtlases) ? localAtlases : []).map(atlas => String(atlas.id)));
        const missingAtlases = Array.isArray(localAtlases) ? index.atlases.filter(atlas => !haveAtlases.has(atlas.id) && !skip.atlases.includes(atlas.id)).length : 0;
        if (!missingFavorites && !missingAtlases)
            return null;
        if (canAutoRestore()) {
            const result = await restoreFavoritesFromServerBackup({ fetchImpl });
            const parts = [result.restored ? `${result.restored}${__rmT("N_E05d4sZVs")}` : '', result.atlases ? `${__rmT("kRLrfUc6")}${result.atlases}${__rmT("2RWGjk")}` : ''].filter(Boolean);
            if (parts.length)
                globalThis.toastr?.success?.(`${__rmT("K.zPdZYAnPNRXu2N2V0NFwHZu0.4Fg4yyeE.y14vW0ncqlnYt_RxyEU.01klzi8wM7IUrRpl9Z2StG8ebnk2Jh")}${parts.join(__rmT("jvk"))}${__rmT("jzk")}`, __rmT("oNm9IIg2DbRuF.Ki"), { timeOut: 10000 });
            return { auto: true, result };
        }
        const what = [missingFavorites ? `${missingFavorites}${__rmT("N_E05d4sZVs")}` : '', missingAtlases ? `${__rmT("kRLrfUc6")}${missingAtlases}${__rmT("2RWGjk")}` : ''].filter(Boolean).join(__rmT("jvk"));
        globalThis.toastr?.info?.(`${__rmT("OpM4V1mv0YT6I4Fe8SyKI99mrT_60aF19RHSW2lB69.D.9VC7ApR_hfjJ6G")}${what}${__rmT("iZJnzQSXtgFlB72MLWr1QpHcUhqt2lOxr6fi3dQ12XoWqKSZ34KPIZe3a3G9uT")}`, __rmT("oNm9IIg2DbRuF.Ki"), { timeOut: 15000 });
        return { auto: false };
    }
    catch (error) {
        console.debug('[RabbitMirror] favorite backup startup check skipped', error);
        return null;
    }
}
