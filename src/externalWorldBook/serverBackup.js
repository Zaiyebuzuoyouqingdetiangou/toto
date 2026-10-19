// 母本库的「酒馆备份」：在酒馆自己的用户文件夹（user/files）里存一份整库迁移文件。
// 本地数据库被清掉（例如宿主更新时清了网页数据）以后，可以从这份备份一键恢复。
// 只在导入、启用、改分类、删除等用户操作之后才写；启动时不打开本地库，除非用户开着母本库抽签。
// 不经过模型，不发到酒馆以外的地方。
import { getHostRequestHeaders } from './capabilities.js?rmv=1.70.11';
import { exportExternalLibraryBackup, importExternalLibraryBackup, parseExternalLibraryBackup, validateExternalLibraryBackup, EXTERNAL_BACKUP_FORMAT, EXTERNAL_BACKUP_VERSION, EXTERNAL_BACKUP_MAX_BYTES } from './backup.js?rmv=1.70.11';
import { listExternalLibraries } from './store.js?rmv=1.70.11';

export const MOTHER_LIBRARY_SERVER_BACKUP_NAME = 'rabbitmirror-mother-libraries.json';
const SAVE_DELAY_MS = 2500;
const STATUS_KEY = 'rabbit_mirror_mother_library_server_backup:v1';
// 在本机删了、但还没存进酒馆备份的库编号，记在本机：刷新页面也不丢。
// 下次保存时把它们从酒馆备份里一起去掉；没存上之前不自动恢复，恢复时也跳过它们，免得把刚删的库又补回来。
const PENDING_DELETE_KEY = 'rabbit_mirror_mother_library_pending_delete:v1';

function readPendingDeletes() {
    try {
        const raw = globalThis.localStorage?.getItem(PENDING_DELETE_KEY);
        if (!raw) return { ids: [], unknown: false };
        const value = JSON.parse(raw);
        // 旧版只记了一个时间：知道删过、不知道删了哪本。
        return Array.isArray(value) ? { ids: value.map(String), unknown: false } : { ids: [], unknown: true };
    } catch { return { ids: [], unknown: true }; }
}
function writePendingDeletes(ids) {
    try {
        if (ids.length) globalThis.localStorage?.setItem(PENDING_DELETE_KEY, JSON.stringify([...new Set(ids)]));
        else globalThis.localStorage?.removeItem(PENDING_DELETE_KEY);
    } catch { /* ignore */ }
}

let timer = 0;
let saving = null;
let pendingDeleted = new Set(readPendingDeletes().ids);
let lastStatus = null;

function readStatus() {
    if (lastStatus) return lastStatus;
    try { lastStatus = JSON.parse(globalThis.localStorage?.getItem(STATUS_KEY) || 'null'); } catch { lastStatus = null; }
    return lastStatus;
}
function writeStatus(status) {
    lastStatus = status;
    try { globalThis.localStorage?.setItem(STATUS_KEY, JSON.stringify(status)); } catch { /* 只是显示用 */ }
    try { globalThis.dispatchEvent?.(new CustomEvent('rabbitmirror:mother-library-backup', { detail: status })); } catch { /* ignore */ }
}
export function getMotherLibraryServerBackupStatus() { return readStatus(); }

function backupUrl() { return `/user/files/${MOTHER_LIBRARY_SERVER_BACKUP_NAME}`; }

function base64Utf8(text) {
    const bytes = new TextEncoder().encode(String(text || ''));
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    return btoa(binary);
}

/** 读酒馆里的备份；没有备份返回 null，读不到（宿主不支持、网络问题）抛错。 */
export async function readMotherLibraryServerBackup({ fetchImpl = globalThis.fetch } = {}) {
    if (typeof fetchImpl !== 'function') throw new Error('当前环境不能读取酒馆文件。');
    const response = await fetchImpl(`${backupUrl()}?t=${Date.now()}`, { cache: 'no-store', credentials: 'same-origin' });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`读取酒馆备份失败（${response.status}）。`);
    const text = await response.text();
    if (!text.trim()) return null;
    // 有的宿主对不存在的文件返回首页 HTML：不是 JSON 就当没有备份。
    if (!/^\s*[{﻿]/.test(text)) return null;
    return parseExternalLibraryBackup(text);
}

async function uploadBackup(backup, { fetchImpl = globalThis.fetch, headerProvider = getHostRequestHeaders } = {}) {
    const text = JSON.stringify(backup);
    if (text.length > EXTERNAL_BACKUP_MAX_BYTES) throw new Error('母本库太大（超过 32 MiB），这次没有存进酒馆备份；可以用「一键导出」手动保存。');
    const headers = await headerProvider();
    if (!headers) throw new Error('当前环境不能往酒馆里存文件。');
    const response = await fetchImpl('/api/files/upload', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: MOTHER_LIBRARY_SERVER_BACKUP_NAME, data: base64Utf8(text) }),
    });
    if (!response.ok) throw new Error(`存进酒馆备份失败（${response.status}）。`);
}

/**
 * 把本机的母本库存进酒馆备份。合并规则：本机有的以本机为准；酒馆备份里有、本机没有的库保留
 * （另一台设备导入的、或本机数据被清掉还没恢复的），除非是在本机上明确删除的。
 * 所以本机被清空后先导入新库，也不会把酒馆里的旧库覆盖掉。
 */
export async function saveMotherLibraryServerBackup({ deletedLibraryIds = [], fetchImpl, headerProvider } = {}) {
    const deleted = new Set([...pendingDeleted, ...deletedLibraryIds].map(String));
    const local = validateExternalLibraryBackup(JSON.parse((await exportExternalLibraryBackup()).text));
    let server = null;
    try { server = await readMotherLibraryServerBackup({ fetchImpl }); } catch { server = null; }
    const localIds = new Set(local.libraries.map(item => item.library.libraryId));
    const kept = (server?.libraries || []).filter(item => !localIds.has(item.library.libraryId) && !deleted.has(item.library.libraryId));
    const merged = validateExternalLibraryBackup({ format: EXTERNAL_BACKUP_FORMAT, version: EXTERNAL_BACKUP_VERSION, exportedAt: Date.now(),
        libraries: [...local.libraries, ...kept] });
    await uploadBackup(merged, { fetchImpl, headerProvider });
    for (const id of deleted) pendingDeleted.delete(id);
    // 这次已经从备份里去掉的不再记；保存期间又删的留着下次。
    writePendingDeletes(readPendingDeletes().ids.filter(id => !deleted.has(id) || pendingDeleted.has(id)));
    // localCount：存的时候本机有几本。之后本机变空时，靠它分辨「被宿主清掉了」还是「自己删光的」。
    const status = { ok: true, savedAt: merged.exportedAt, libraryCount: merged.libraries.length, localCount: local.libraries.length,
        entryCount: merged.libraries.reduce((sum, item) => sum + item.entries.length, 0), keptFromServer: kept.length };
    writeStatus(status);
    return status;
}

/** 本地库发生用户操作后调用：稍等一会儿合并成一次保存，失败只记状态，不打扰正在做的事。 */
export function scheduleMotherLibraryServerBackup({ deletedLibraryIds = [] } = {}) {
    for (const id of deletedLibraryIds) pendingDeleted.add(String(id));
    if (deletedLibraryIds.length) writePendingDeletes([...readPendingDeletes().ids, ...deletedLibraryIds.map(String)]);
    if (typeof document === 'undefined' || typeof globalThis.fetch !== 'function') return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
        timer = 0;
        const run = async () => {
            try { await saveMotherLibraryServerBackup(); }
            catch (error) {
                writeStatus({ ok: false, failedAt: Date.now(), message: String(error?.message || error || '存进酒馆备份失败。'), savedAt: readStatus()?.savedAt || 0 });
                console.warn('[RabbitMirror] 母本库酒馆备份没有存上', error);
            }
        };
        saving = (saving || Promise.resolve()).then(run, run).finally(() => { saving = null; });
    }, SAVE_DELAY_MS);
}

/** 从酒馆备份恢复：只补本机没有的库，本机已有的保留不动（和导入迁移文件一样）。 */
export async function restoreMotherLibrariesFromServerBackup({ fetchImpl } = {}) {
    const read = await readMotherLibraryServerBackup({ fetchImpl });
    // 本机刚删、还没从备份里去掉的库，不补回来。
    const skip = new Set([...pendingDeleted, ...readPendingDeletes().ids]);
    const backup = read ? { ...read, libraries: read.libraries.filter(item => !skip.has(String(item.library.libraryId))) } : null;
    if (!backup || !backup.libraries.length) return { importedLibraries: 0, importedEntries: 0, skippedLibraries: 0, empty: true };
    return importExternalLibraryBackup(backup, { skipServerBackup: true });
}

/** 本机一本库都没有、酒馆备份里有：返回备份概况，用来提示一键恢复；否则返回 null。 */
export async function findRestorableMotherLibraryBackup({ fetchImpl } = {}) {
    const local = await listExternalLibraries();
    if (local.length) return null;
    let backup = null;
    try { backup = await readMotherLibraryServerBackup({ fetchImpl }); } catch { return null; }
    if (!backup?.libraries?.length) return null;
    return { libraryCount: backup.libraries.length, entryCount: backup.libraries.reduce((sum, item) => sum + item.entries.length, 0),
        exportedAt: backup.exportedAt, names: backup.libraries.slice(0, 3).map(item => String(item.library.displayName || '')).filter(Boolean) };
}

let startupChecked = false;

/** 能不能不问就自动恢复：上次存备份失败过、或者本机刚删过库还没存进备份，都改成先问。 */
/**
 * 能不能不问就自动恢复。本机的记录也一起没了（宿主清掉了网页数据、或是新设备）时自动；
 * 记录还在时，只有「上次存备份时本机明明有库」才算被清掉了，自动补回。
 * 上次存备份失败、刚删过库还没存上、上次存的时候本机就是空的（自己删光的，或别的设备的库）都改成先问。
 */
export function canAutoRestoreMotherLibraries() {
    const pending = readPendingDeletes();
    if (pending.unknown || pending.ids.length || pendingDeleted.size) return false;
    const status = readStatus();
    if (!status) return true;
    return status.ok === true && Number(status.localCount) > 0;
}

function startupToast(kind, text, buttons = []) {
    const toast = globalThis.toastr?.[kind]?.(text, '兔子镜母本库', buttons.length
        ? { timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false }
        : { timeOut: 8000, closeButton: true });
    const node = toast?.[0] || toast;
    const body = node?.querySelector?.('.toast-message') || node;
    if (!body?.append || !buttons.length) return { toast, body: null, buttons: [] };
    const doc = body.ownerDocument;
    const row = doc.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;';
    const made = buttons.map(label => {
        const button = doc.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.style.cssText = 'min-height:36px;padding:4px 12px;border-radius:8px;border:1px solid currentColor;background:transparent;color:inherit;font:inherit;cursor:pointer;';
        row.append(button);
        return button;
    });
    body.append(row);
    return { toast, body, buttons: made };
}

function restoredText(result) {
    return `已恢复 ${result.importedLibraries} 本、${result.importedEntries} 条${result.skippedLibraries ? `；本机已有的 ${result.skippedLibraries} 本没动` : ''}。抽签总开关没有改。`;
}

function announceRestored(result) {
    try { globalThis.dispatchEvent?.(new CustomEvent('rabbitmirror:mother-library-restored', { detail: result })); } catch { /* ignore */ }
}

/**
 * 启动后（只在开着母本库抽签时）看一次：本机母本库空了、酒馆里有备份——
 * 平常直接自动补回来（只补本机没有的库），弹一句告诉用户；
 * 上次存备份失败过或刚删过库时，改成弹提示让用户自己点「恢复」。
 */
export async function checkMotherLibraryServerBackupOnStartup({ open, fetchImpl } = {}) {
    if (startupChecked) return;
    startupChecked = true;
    try {
        const found = await findRestorableMotherLibraryBackup({ fetchImpl });
        if (!found) return;
        const openLibrary = () => { try { open?.(); } catch { /* ignore */ } };
        if (canAutoRestoreMotherLibraries()) {
            try {
                const result = await restoreMotherLibrariesFromServerBackup({ fetchImpl });
                if (result.empty || !result.importedLibraries) return;
                announceRestored(result);
                const { toast, buttons: [look] } = startupToast('success',
                    `本机的母本库没有了（多半是宿主清掉了网页数据），已自动从酒馆备份恢复：${restoredText(result)}`, ['去母本库看看']);
                look?.addEventListener('click', event => { event.stopPropagation(); try { globalThis.toastr?.clear?.(toast); } catch { /* ignore */ } openLibrary(); });
                return { auto: true, result };
            } catch (error) {
                console.warn('[RabbitMirror] 母本库自动恢复没有成功，改成提示手动恢复', error);
            }
        }
        const text = `本机的母本库是空的，但酒馆里有一份备份（${found.libraryCount} 本、${found.entryCount} 条）。`;
        // 提示里直接放「恢复」：点了才恢复（只补本机没有的库，已有的不动），不用再去设置里找。
        const { toast, body, buttons: [restore, look] } = startupToast('info', text, ['恢复', '去母本库看看']);
        if (!body) return;
        const line = body.ownerDocument.createElement('div');
        line.style.cssText = 'margin-top:6px;';
        body.append(line);
        const close = () => { try { globalThis.toastr?.clear?.(toast); } catch { /* ignore */ } };
        look.addEventListener('click', event => { event.stopPropagation(); close(); openLibrary(); });
        restore.addEventListener('click', async event => {
            event.stopPropagation();
            restore.disabled = true; look.disabled = true;
            line.textContent = '正在从酒馆备份恢复……';
            try {
                const result = await restoreMotherLibrariesFromServerBackup({ fetchImpl });
                line.textContent = result.empty ? '酒馆里的备份是空的，没有可恢复的库。' : restoredText(result);
                restore.remove(); look.disabled = false;
                announceRestored(result);
            } catch (error) {
                line.textContent = `没有恢复：${String(error?.message || error || '原因不明')}。本机现有的库没有改动，可以再点一次。`;
                restore.disabled = false; look.disabled = false;
            }
        });
        return { auto: false };
    } catch (error) { console.debug('[RabbitMirror] mother library backup startup check skipped', error); }
}
