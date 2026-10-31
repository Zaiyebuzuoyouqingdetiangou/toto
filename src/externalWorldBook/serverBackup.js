import { rmT as __rmT } from "../textTable.js?rmv=2.1.11";
import { getHostRequestHeaders } from './capabilities.js?rmv=2.1.11';
import { exportExternalLibraryBackup, importExternalLibraryBackup, parseExternalLibraryBackup, validateExternalLibraryBackup, EXTERNAL_BACKUP_FORMAT, EXTERNAL_BACKUP_VERSION, EXTERNAL_BACKUP_MAX_BYTES } from './backup.js?rmv=2.1.11';
import { listExternalLibraries } from './store.js?rmv=2.1.11';
export const MOTHER_LIBRARY_SERVER_BACKUP_NAME = 'rabbitmirror-mother-libraries.json';
const SAVE_DELAY_MS = 2500;
const STATUS_KEY = 'rabbit_mirror_mother_library_server_backup:v1';
const PENDING_DELETE_KEY = 'rabbit_mirror_mother_library_pending_delete:v1';
function readPendingDeletes() {
    try {
        const raw = globalThis.localStorage?.getItem(PENDING_DELETE_KEY);
        if (!raw)
            return { ids: [], unknown: false };
        const value = JSON.parse(raw);
        return Array.isArray(value) ? { ids: value.map(String), unknown: false } : { ids: [], unknown: true };
    }
    catch {
        return { ids: [], unknown: true };
    }
}
function writePendingDeletes(ids) {
    try {
        if (ids.length)
            globalThis.localStorage?.setItem(PENDING_DELETE_KEY, JSON.stringify([...new Set(ids)]));
        else
            globalThis.localStorage?.removeItem(PENDING_DELETE_KEY);
    }
    catch { }
}
let timer = 0;
const RETRY_DELAYS_MS = [30000, 120000, 600000];
let retryCount = 0;
let saving = null;
let pendingDeleted = new Set(readPendingDeletes().ids);
let lastStatus = null;
function readStatus() {
    if (lastStatus)
        return lastStatus;
    try {
        lastStatus = JSON.parse(globalThis.localStorage?.getItem(STATUS_KEY) || 'null');
    }
    catch {
        lastStatus = null;
    }
    return lastStatus;
}
function writeStatus(status) {
    lastStatus = status;
    try {
        globalThis.localStorage?.setItem(STATUS_KEY, JSON.stringify(status));
    }
    catch { }
    try {
        globalThis.dispatchEvent?.(new CustomEvent('rabbitmirror:mother-library-backup', { detail: status }));
    }
    catch { }
}
export function getMotherLibraryServerBackupStatus() { return readStatus(); }
function backupUrl() { return `/user/files/${MOTHER_LIBRARY_SERVER_BACKUP_NAME}`; }
function base64Utf8(text) {
    const bytes = new TextEncoder().encode(String(text || ''));
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000)
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    return btoa(binary);
}
export class MotherLibraryServerBackupReadError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = 'MotherLibraryServerBackupReadError';
        this.readFailed = true;
        if (cause !== undefined)
            this.cause = cause;
    }
}
export async function readMotherLibraryServerBackup({ fetchImpl = globalThis.fetch } = {}) {
    if (typeof fetchImpl !== 'function')
        throw new MotherLibraryServerBackupReadError(__rmT("VwH5IpljVoVC8OrRg.IQ00iUIgOL.T1O29E"));
    let response;
    try {
        response = await fetchImpl(`${backupUrl()}?t=${Date.now()}`, { cache: 'no-store', credentials: 'same-origin' });
    }
    catch (error) {
        throw new MotherLibraryServerBackupReadError(`${__rmT("FzhC1RdQI4LabaRMK09yE._7SjZXNgFRLRJCqh")}${String(error?.message || error || __rmT("cHhXcUwjS2T"))}${__rmT("7Z2rzT")}`, error);
    }
    if (response?.status === 404)
        return null;
    if (!response?.ok)
        throw new MotherLibraryServerBackupReadError(`${__rmT("ucMQS4l5YXCOLF.OQi3Qtx1y")}${response?.status ?? __rmT("1iBmOyCU")}${__rmT("7Z2rzT")}`);
    let text;
    try {
        text = await response.text();
    }
    catch (error) {
        throw new MotherLibraryServerBackupReadError(__rmT("PWDlYWl5f9Lkc5VNEK9w3O7OtPai_BxUjaC6JgbtPsL.bh"), error);
    }
    if (!text.trim())
        return null;
    if (!/^\s*[{\uFEFF]/.test(text))
        return null;
    try {
        return parseExternalLibraryBackup(text);
    }
    catch (error) {
        throw new MotherLibraryServerBackupReadError(`${__rmT("V5Z85v4cpEXCxsI97hLBOQ7MoNP_W4jyurf")}${String(error?.message || error || __rmT("3Nt7qcwjbGp"))}${__rmT("Uaa9QONjf9lcFzl12.xWEcmUbNs")}`, error);
    }
}
async function uploadBackup(backup, { fetchImpl = globalThis.fetch, headerProvider = getHostRequestHeaders } = {}) {
    const text = JSON.stringify(backup);
    if (text.length > EXTERNAL_BACKUP_MAX_BYTES)
        throw new Error(__rmT(".g4SqVekOxskQl3twjvQgKUL00wvIYBuD6qzk1WJ13IoVLPjJSoeUvWfYb5YWDEDCEnCXn4j3FlfGB3cwde5EU21y3GRAbbkjhX09aTv5LiSho_z"));
    const headers = await headerProvider();
    if (!headers)
        throw new Error(__rmT("ntvm1Z7PkbZsNryA755FPUUqVQGMnZzKf7ospf"));
    const response = await fetchImpl('/api/files/upload', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: MOTHER_LIBRARY_SERVER_BACKUP_NAME, data: base64Utf8(text) }),
    });
    if (!response.ok)
        throw new Error(`${__rmT("xDMpe4l5YXCOLF.OQi3Qtx1y")}${response.status}${__rmT("7Z2rzT")}`);
}
export async function saveMotherLibraryServerBackup({ deletedLibraryIds = [], fetchImpl, headerProvider } = {}) {
    const extra = deletedLibraryIds.map(String);
    for (const id of extra)
        pendingDeleted.add(id);
    if (extra.length)
        writePendingDeletes([...readPendingDeletes().ids, ...extra]);
    const deleted = new Set([...pendingDeleted, ...readPendingDeletes().ids, ...extra]);
    const local = validateExternalLibraryBackup(JSON.parse((await exportExternalLibraryBackup()).text));
    let server = null;
    try {
        server = await readMotherLibraryServerBackup({ fetchImpl });
    }
    catch (error) {
        const failure = error?.readFailed ? error : new MotherLibraryServerBackupReadError(String(error?.message || error || __rmT("ucMQS4l5YXCOLF.OQi3QtxEI")), error);
        const previous = readStatus();
        writeStatus({ ok: false, readFailed: true, failedAt: Date.now(), message: `${failure.message}${__rmT("1WcDU6WPCq1z_9Z_Rpr1lAZ1Mgbb9yfcoF9oSka4I3K1laOk8JyVBGUsMPrmBvkC")}`,
            savedAt: previous?.savedAt || 0, ...(previous && Number.isFinite(Number(previous.localCount)) ? { localCount: Number(previous.localCount) } : {}) });
        throw failure;
    }
    const localIds = new Set(local.libraries.map(item => item.library.libraryId));
    const kept = (server?.libraries || []).filter(item => !localIds.has(item.library.libraryId) && !deleted.has(item.library.libraryId));
    const merged = validateExternalLibraryBackup({ format: EXTERNAL_BACKUP_FORMAT, version: EXTERNAL_BACKUP_VERSION, exportedAt: Date.now(),
        libraries: [...local.libraries, ...kept] });
    await uploadBackup(merged, { fetchImpl, headerProvider });
    for (const id of deleted)
        pendingDeleted.delete(id);
    writePendingDeletes(readPendingDeletes().ids.filter(id => !deleted.has(id) || pendingDeleted.has(id)));
    retryCount = 0;
    const status = { ok: true, savedAt: merged.exportedAt, libraryCount: merged.libraries.length, localCount: local.libraries.length,
        entryCount: merged.libraries.reduce((sum, item) => sum + item.entries.length, 0), keptFromServer: kept.length };
    writeStatus(status);
    return status;
}
export function scheduleMotherLibraryServerBackup({ deletedLibraryIds = [] } = {}) {
    for (const id of deletedLibraryIds)
        pendingDeleted.add(String(id));
    if (deletedLibraryIds.length)
        writePendingDeletes([...readPendingDeletes().ids, ...deletedLibraryIds.map(String)]);
    if (typeof document === 'undefined' || typeof globalThis.fetch !== 'function')
        return;
    if (timer)
        clearTimeout(timer);
    timer = setTimeout(() => {
        timer = 0;
        const run = async () => {
            try {
                await saveMotherLibraryServerBackup();
            }
            catch (error) {
                if (!error?.readFailed)
                    writeStatus({ ok: false, failedAt: Date.now(), message: String(error?.message || error || __rmT("xDMpe4l5YXCOLF.OQi3QtxEI")), savedAt: readStatus()?.savedAt || 0 });
                console.warn(__rmT("kgRTYhcxXS2m4ONWwxNuOg_eeQb7JQvzO3QRKgCU8nMSyPNNa7SgAvixR72L8jq7Yyu_zk"), error);
                if (error?.readFailed && retryCount < RETRY_DELAYS_MS.length) {
                    const delay = RETRY_DELAYS_MS[retryCount++];
                    if (!timer)
                        timer = setTimeout(() => { timer = 0; scheduleMotherLibraryServerBackup(); }, Math.max(0, delay - SAVE_DELAY_MS));
                }
            }
        };
        const next = (saving || Promise.resolve()).then(run, run);
        saving = next;
        next.finally(() => { if (saving === next)
            saving = null; });
    }, SAVE_DELAY_MS);
}
export async function restoreMotherLibrariesFromServerBackup({ fetchImpl } = {}) {
    const read = await readMotherLibraryServerBackup({ fetchImpl });
    const skip = new Set([...pendingDeleted, ...readPendingDeletes().ids]);
    const backup = read ? { ...read, libraries: read.libraries.filter(item => !skip.has(String(item.library.libraryId))) } : null;
    if (!backup || !backup.libraries.length)
        return { importedLibraries: 0, importedEntries: 0, skippedLibraries: 0, empty: true };
    return importExternalLibraryBackup(backup, { skipServerBackup: true });
}
export async function findRestorableMotherLibraryBackup({ fetchImpl } = {}) {
    const local = await listExternalLibraries();
    if (local.length)
        return null;
    let backup = null;
    try {
        backup = await readMotherLibraryServerBackup({ fetchImpl });
    }
    catch {
        return null;
    }
    if (!backup?.libraries?.length)
        return null;
    return { libraryCount: backup.libraries.length, entryCount: backup.libraries.reduce((sum, item) => sum + item.entries.length, 0),
        exportedAt: backup.exportedAt, names: backup.libraries.slice(0, 3).map(item => String(item.library.displayName || '')).filter(Boolean) };
}
let startupChecked = false;
export function canAutoRestoreMotherLibraries() {
    const pending = readPendingDeletes();
    if (pending.unknown || pending.ids.length || pendingDeleted.size)
        return false;
    const status = readStatus();
    if (!status)
        return true;
    return status.ok === true && Number(status.localCount) > 0;
}
function startupToast(kind, text, buttons = []) {
    const toast = globalThis.toastr?.[kind]?.(text, __rmT("oNm9IIg2awaMI1eH"), buttons.length
        ? { timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false }
        : { timeOut: 8000, closeButton: true });
    const node = toast?.[0] || toast;
    const body = node?.querySelector?.('.toast-message') || node;
    if (!body?.append || !buttons.length)
        return { toast, body: null, buttons: [] };
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
    return `${__rmT("iFNs8VwkHKG")}${result.importedLibraries}${__rmT("qGto.qxg")}${result.importedEntries}${__rmT("2RdUjk")}${result.skippedLibraries ? `${__rmT("bQQXomdvk4f3MoHRgPD")}${result.skippedLibraries}${__rmT("N_wvFmbcg8h")}` : ''}${__rmT("WJD2i6V0LJSYccCxZnd8Gij2bNs")}`;
}
function announceRestored(result) {
    try {
        globalThis.dispatchEvent?.(new CustomEvent('rabbitmirror:mother-library-restored', { detail: result }));
    }
    catch { }
}
export async function checkMotherLibraryServerBackupOnStartup({ open, fetchImpl } = {}) {
    if (startupChecked)
        return;
    startupChecked = true;
    try {
        const found = await findRestorableMotherLibraryBackup({ fetchImpl });
        if (!found)
            return;
        const openLibrary = () => { try {
            open?.();
        }
        catch { } };
        if (canAutoRestoreMotherLibraries()) {
            try {
                const result = await restoreMotherLibrariesFromServerBackup({ fetchImpl });
                if (result.empty || !result.importedLibraries)
                    return;
                announceRestored(result);
                const { toast, buttons: [look] } = startupToast('success', `${__rmT("M_IjEDwDb9nyRxFrp9XxhOU259S4LEkpu1D4nz2YvgFXBOFVwpAqODxe5yTxNy0ks5MW5GzxpjLRuJtqGvVECCEIiHs.zh")}${restoredText(result)}`, [__rmT("U9cqRrDHOlS3Vyck")]);
                look?.addEventListener('click', event => { event.stopPropagation(); try {
                    globalThis.toastr?.clear?.(toast);
                }
                catch { } openLibrary(); });
                return { auto: true, result };
            }
            catch (error) {
                console.warn(__rmT("W9_mcaMXA_XkYyfBxstcFbBe.VbPkXejy7nOV5aNkgw2uh.eI6t9nHFfPKNuXXcBpf1Z1Zf_FU6tUmYRWh1NwGp5cNBMPk"), error);
            }
        }
        const text = `${__rmT("8g.P0hV8fOrF4Fyv4GuWy43RN1LWQY_r5EiblIxxEpBm4fnoDxGlSh")}${found.libraryCount}${__rmT("qGto.qxg")}${found.entryCount}${__rmT("N_imFcKdOoG")}`;
        const { toast, body, buttons: [restore, look] } = startupToast('info', text, [__rmT("gPWQBh"), __rmT("U9cqRrDHOlS3Vyck")]);
        if (!body)
            return;
        const line = body.ownerDocument.createElement('div');
        line.style.cssText = 'margin-top:6px;';
        body.append(line);
        const close = () => { try {
            globalThis.toastr?.clear?.(toast);
        }
        catch { } };
        look.addEventListener('click', event => { event.stopPropagation(); close(); openLibrary(); });
        restore.addEventListener('click', async (event) => {
            event.stopPropagation();
            restore.disabled = true;
            look.disabled = true;
            line.textContent = __rmT("nsRXIv.br8yHXarxAbu1Zy5biwtSzk");
            try {
                const result = await restoreMotherLibrariesFromServerBackup({ fetchImpl });
                line.textContent = result.empty ? __rmT("iARiazHwdsFeFfTUR2UX3baf9bGuIYIEj7oTYAM3wlIPsZQX") : restoredText(result);
                restore.remove();
                look.disabled = false;
                announceRestored(result);
            }
            catch (error) {
                line.textContent = `${__rmT("VOUk8WeClHHStf")}${String(error?.message || error || __rmT("cHhXcUwjS2T"))}${__rmT("DsLraIl3oaXm_pid6IY3C_PFxTYRR2v7UVVIOZgBbLwU01Krq8_")}`;
                restore.disabled = false;
                look.disabled = false;
            }
        });
        return { auto: false };
    }
    catch (error) {
        console.debug('[RabbitMirror] mother library backup startup check skipped', error);
    }
}
