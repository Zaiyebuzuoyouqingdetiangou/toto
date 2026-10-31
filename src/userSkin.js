import { rmT as __rmT } from "./textTable.js?rmv=2.3.7";
import { getSettings, updateSettings } from './settings.js?rmv=2.3.7';
export const USER_SKIN_STORAGE_KEY = 'rabbit_mirror_user_skin_v1';
export const USER_SKIN_FILE_NAME = 'rabbitmirror-user-skin.json';
const USER_SKIN_FILE_FORMAT = 'rabbitmirror-user-skin';
const SERVER_COPY_MAX = 300000;
const FILE_SAVE_DELAY_MS = 1500;
const STYLE_ID = 'rabbit-mirror-user-skin';
const MAX_CHARS = 1500000;
export const SKIN_HOOKS = Object.freeze([
    [__rmT("CqjYDkD63f1SIPe8"), '#rabbit_mirror_theater_settings'],
    [__rmT("KAzTms10uDC"), '#rabbit_mirror_theater_settings .rh-ui-window'],
    [__rmT("KAzTmvkISgD"), '#rabbit_mirror_theater_settings .rh-ui-head'],
    [__rmT("zb8WXOIEf2Oq9h"), '#rabbit_mirror_theater_settings .rh-ui-tabs'],
    [__rmT("zb8WXHQeOHOzCf"), '#rabbit_mirror_theater_settings .rh-ui-main'],
    [__rmT("EJZ.YI0KYANt_nO92l5o9OaiC8KpZkuMe58RlEsb6ArdEf"), '[data-rm-skin="panel"]'],
    [__rmT("OYHVbiiQV7NJPMswD1DDAfXix9AZsIOOOlgI3.nmx70kTFGwuaB0FwG.99rqNlFBW8Yb9T1sGmEKWeX6gSo7Ep_iMZCNYyUOEsD3Xh"), '.rabbit-mirror-external-shell[data-rm-placement="external"]'],
    [__rmT("3g2dPZPJ.Y_QIWXvOPMClk"), '.rabbit-mirror-external-shell[data-rm-placement="external"] > details[data-rabbit-mirror-external-details]'],
    [__rmT("GZTWXOIEHcEX9h"), '.rabbit-mirror-external-shell[data-rm-placement="external"] summary[data-rm-title-chrome]'],
    [__rmT("n9RrrR1sADp"), '.rabbit-mirror-external-shell[data-rm-placement="external"] [data-rm-title-label]'],
    [__rmT("uB_fZ9q1mN4uDozz0FRGlT"), '.rabbit-mirror-external-shell[data-rm-placement="external"] [data-rm-tool-menu-button]'],
]);
export const SKIN_TOKENS = Object.freeze(['--rh-bg', '--rh-card', '--rh-text', '--rh-muted', '--rh-primary', '--rh-secondary', '--rh-border']);
function normalizeSkin(value) {
    return { enabled: value?.enabled === true, css: typeof value?.css === 'string' ? value.css.slice(0, MAX_CHARS) : '', name: typeof value?.name === 'string' ? value.name.slice(0, 80) : '' };
}
function serverCopy() {
    try {
        const value = getSettings()?.userSkin;
        return value && typeof value === 'object' ? value : null;
    }
    catch {
        return null;
    }
}
export function userSkinFingerprint(value) {
    const text = `${value?.enabled === true ? 1 : 0}|${value?.name || ''}|${value?.css || ''}`;
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return `${text.length.toString(36)}-${(h >>> 0).toString(36)}`;
}
function base64Utf8(text) {
    const bytes = new TextEncoder().encode(String(text || ''));
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000)
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    return btoa(binary);
}
async function hostHeaders() {
    try {
        const ctx = globalThis.SillyTavern?.getContext?.();
        if (typeof ctx?.getRequestHeaders === 'function')
            return ctx.getRequestHeaders();
    }
    catch { }
    try {
        const module = await import('../../../../../script.js');
        return typeof module?.getRequestHeaders === 'function' ? module.getRequestHeaders() : null;
    }
    catch {
        return null;
    }
}
async function uploadSkinFile(value) {
    const headers = await hostHeaders();
    if (!headers || typeof globalThis.fetch !== 'function')
        throw new Error(__rmT("ntvm1Z7PkbZsNryA755FPUUqVQGMnZzKf7ospf"));
    const text = JSON.stringify({ format: USER_SKIN_FILE_FORMAT, version: 1, savedAt: Date.now(), ...normalizeSkin(value), editedAt: Number(value?.editedAt) || 0 });
    const response = await globalThis.fetch('/api/files/upload', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: USER_SKIN_FILE_NAME, data: base64Utf8(text) }),
    });
    if (!response.ok)
        throw new Error(`${__rmT("p9HQS4WF4wKACXzaQi3Qtx1y")}${response.status}${__rmT("7Z2rzT")}`);
}
export async function readUserSkinFile() {
    if (typeof globalThis.fetch !== 'function')
        throw new Error(__rmT("aVHrCsxMg9Az6OAjQ90CG2txkqp5aOs2"));
    const response = await globalThis.fetch(`/user/files/${USER_SKIN_FILE_NAME}?t=${Date.now()}`, { cache: 'no-store', credentials: 'same-origin' });
    if (response.status === 404)
        return null;
    if (!response.ok)
        throw new Error(`${__rmT("u7WAZpdIPcCfm9fbmhNkWtC53ak")}${response.status}${__rmT("7Z2rzT")}`);
    const text = await response.text();
    const notSkinFile = () => Object.assign(new Error(__rmT("FzhEroFmI.9sNgVZC5g6uDR6eW7A7ZzKf7ospf")), { notSkinFile: true });
    let data = null;
    try {
        data = JSON.parse(text);
    }
    catch {
        throw notSkinFile();
    }
    if (data?.format !== USER_SKIN_FILE_FORMAT)
        throw notSkinFile();
    return { ...normalizeSkin(data), editedAt: Number(data.editedAt) || 0 };
}
const UNSENT_KEY = `${USER_SKIN_STORAGE_KEY}_unsent`;
let backupTimer = 0;
let backupChain = null;
let backupValue = null;
let restoredValue = null;
let pageEditBase = null;
let restorePending = false;
let syncState = 'idle';
let lastConflict = '';
export function userSkinConflict() { return lastConflict; }
let syncing = null;
function setSyncState(state, detail = {}) {
    syncState = state;
    try {
        globalThis.dispatchEvent?.(new CustomEvent('rabbitmirror:user-skin-sync', { detail: { state, ...detail } }));
    }
    catch { }
}
export function userSkinSyncState() { return syncState; }
function readLocalRecord() {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(USER_SKIN_STORAGE_KEY) || 'null');
        return value && typeof value === 'object' ? value : null;
    }
    catch {
        return null;
    }
}
function writeLocalRecord(value, meta) {
    try {
        globalThis.localStorage.setItem(USER_SKIN_STORAGE_KEY, JSON.stringify({ ...normalizeSkin(value), ...meta }));
        return true;
    }
    catch {
        return false;
    }
}
function dropLocalRecord() {
    try {
        globalThis.localStorage?.removeItem(USER_SKIN_STORAGE_KEY);
    }
    catch { }
}
export function readUnsentUserSkin() {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(UNSENT_KEY) || 'null');
        return value && typeof value === 'object' ? normalizeSkin(value) : null;
    }
    catch {
        return null;
    }
}
export function dropUnsentUserSkin() {
    try {
        globalThis.localStorage?.removeItem(UNSENT_KEY);
    }
    catch { }
}
function writeServerCopy(value) {
    const server = serverCopy();
    if (server?.file)
        return;
    const next = value.css.length <= SERVER_COPY_MAX ? value : { ...value, css: '', tooLarge: true };
    if (server && userSkinFingerprint(normalizeSkin(server)) === userSkinFingerprint(normalizeSkin(next)) && !!server.tooLarge === !!next.tooLarge)
        return;
    try {
        updateSettings({ userSkin: next });
    }
    catch { }
}
async function runBackup() {
    const value = backupValue;
    backupValue = null;
    if (!value)
        return;
    const fingerprint = userSkinFingerprint(value);
    try {
        await uploadSkinFile(value);
        const server = serverCopy();
        if (!(server?.file && server.fingerprint === fingerprint))
            updateSettings({ userSkin: { file: USER_SKIN_FILE_NAME, fingerprint, enabled: value.enabled, name: value.name, length: value.css.length, editedAt: Number(value.editedAt) || 0 } });
        const local = readLocalRecord();
        if (local && userSkinFingerprint(normalizeSkin(local)) === fingerprint)
            writeLocalRecord(local, { dirty: false, synced: fingerprint, editedAt: Number(local.editedAt) || 0 });
    }
    catch (error) {
        writeServerCopy(value);
        console.warn(__rmT("54COXazIsNoZfinUEl8.sxBPUDqBQWPYkqIRHD9DO2Oef3sKsaJX9gcyOrGNXMz6NSY"), error);
    }
}
function startBackup() {
    const next = (backupChain || Promise.resolve()).then(runBackup, runBackup);
    backupChain = next;
    next.finally(() => { if (backupChain === next)
        backupChain = null; });
    return next;
}
function scheduleUserSkinBackup(value, delay = FILE_SAVE_DELAY_MS) {
    backupValue = { ...normalizeSkin(value), editedAt: Number(value?.editedAt) || 0 };
    if (backupTimer)
        globalThis.clearTimeout(backupTimer);
    backupTimer = globalThis.setTimeout(() => { backupTimer = 0; startBackup(); }, delay);
}
export async function flushUserSkinBackup() {
    if (syncing)
        await syncing;
    if (backupTimer) {
        globalThis.clearTimeout(backupTimer);
        backupTimer = 0;
        startBackup();
    }
    while (backupChain)
        await backupChain;
}
function adopt(doc, file) {
    pageEditBase = null;
    const fingerprint = userSkinFingerprint(file);
    if (!writeLocalRecord(file, { dirty: false, synced: fingerprint, editedAt: Number(file.editedAt) || 0 }))
        dropLocalRecord();
    const value = normalizeSkin(file);
    restoredValue = value;
    applyUserSkin(doc, value);
}
function uploadLocal(record, value) {
    const editedAt = Number(record?.editedAt) || Date.now();
    if (record)
        writeLocalRecord(record, { dirty: true, editedAt, synced: String(record.synced ?? '') });
    scheduleUserSkinBackup({ ...value, editedAt }, 0);
}
function syncWithTavern(doc) {
    if (syncState === 'done')
        return Promise.resolve();
    if (syncing)
        return syncing;
    if (!readLocalRecord() && !restoredValue)
        restorePending = true;
    setSyncState('syncing');
    const run = async () => {
        let file;
        try {
            file = await readUserSkinFile();
        }
        catch (error) {
            if (error?.notSkinFile && !readLocalRecord() && !restoredValue && !serverCopy())
                file = null;
            else {
                setSyncState('failed');
                return;
            }
        }
        restorePending = false;
        const now = readLocalRecord();
        let conflict = false;
        if (!file) {
            if (now) {
                const value = normalizeSkin(now);
                if ((now.dirty || !('synced' in now)) && value.css)
                    uploadLocal(now, value);
                else if (!('synced' in now))
                    writeLocalRecord(now, { dirty: false, synced: '' });
            }
            else if (restoredValue && pageEditBase !== null) {
                uploadLocal(null, restoredValue);
            }
            else {
                const old = serverCopy();
                if (typeof old?.css === 'string' && old.css && !old.file) {
                    const value = { ...normalizeSkin(old), editedAt: 0 };
                    adopt(doc, value);
                    scheduleUserSkinBackup(value, 0);
                }
                else
                    writeLocalRecord(normalizeSkin(null), { dirty: false, synced: '', editedAt: 0 });
            }
        }
        else {
            const fileFingerprint = userSkinFingerprint(file);
            const server = serverCopy();
            if (server && !server.file) {
                try {
                    updateSettings({ userSkin: { file: USER_SKIN_FILE_NAME, fingerprint: fileFingerprint, enabled: file.enabled, name: file.name, length: file.css.length, editedAt: file.editedAt } });
                }
                catch { }
            }
            if (!now) {
                if (restoredValue && pageEditBase !== null) {
                    if (pageEditBase === fileFingerprint)
                        uploadLocal(null, restoredValue);
                    else
                        conflict = 'kept-page';
                }
                else
                    adopt(doc, file);
            }
            else {
                const value = normalizeSkin(now);
                const localFingerprint = userSkinFingerprint(value);
                if (localFingerprint === fileFingerprint)
                    writeLocalRecord(now, { dirty: false, synced: fileFingerprint, editedAt: Math.max(Number(now.editedAt) || 0, file.editedAt) });
                else if (now.pinned) { }
                else if (!('synced' in now)) {
                    if (value.css.trim())
                        writeLocalRecord(now, { dirty: false, synced: fileFingerprint, pinned: true });
                    else
                        adopt(doc, file);
                }
                else if (now.dirty && String(now.synced) === fileFingerprint)
                    uploadLocal(now, value);
                else if (now.dirty && value.css.trim()) {
                    let stashed = false;
                    try {
                        globalThis.localStorage?.setItem(UNSENT_KEY, JSON.stringify(value));
                        stashed = true;
                    }
                    catch { }
                    if (stashed) {
                        conflict = 'stashed';
                        adopt(doc, file);
                    }
                    else
                        conflict = 'kept-local';
                }
                else
                    adopt(doc, file);
            }
        }
        lastConflict = conflict || '';
        setSyncState('done', { conflict });
    };
    syncing = run().finally(() => { syncing = null; });
    return syncing;
}
export async function useTavernUserSkin(doc = globalThis.document) {
    let file = null;
    try {
        file = await readUserSkinFile();
    }
    catch {
        return false;
    }
    if (!file)
        return false;
    adopt(doc, file);
    restorePending = false;
    lastConflict = '';
    setSyncState('done', { conflict: '' });
    return true;
}
export function readUserSkin() {
    const local = readLocalRecord();
    if (syncState === 'idle' || syncState === 'failed')
        void syncWithTavern(globalThis.document);
    if (local)
        return normalizeSkin(local);
    if (restoredValue)
        return restoredValue;
    return normalizeSkin(null);
}
export function saveUserSkin(skin) {
    const value = { enabled: skin?.enabled === true, css: String(skin?.css || '').slice(0, MAX_CHARS), name: String(skin?.name || '').slice(0, 80) };
    applyUserSkin(globalThis.document, value);
    if (restorePending && !value.css.trim())
        return 'pending';
    restorePending = false;
    const editedAt = Date.now();
    const before = readLocalRecord();
    const base = before ? String(before.synced ?? '') : (pageEditBase ?? '');
    const local = writeLocalRecord(value, { dirty: true, editedAt, synced: base });
    if (local) {
        restoredValue = null;
        pageEditBase = null;
    }
    else {
        pageEditBase = base;
        dropLocalRecord();
        restoredValue = value;
        writeServerCopy(value);
    }
    if (syncState === 'done') {
        lastConflict = '';
        scheduleUserSkinBackup({ ...value, editedAt });
    }
    if (!local)
        return 'page-only';
    return syncState === 'done' ? 'saved' : 'local';
}
export function applyUserSkin(doc = globalThis.document, skin = readUserSkin()) {
    if (!doc?.head)
        return false;
    let style = doc.getElementById(STYLE_ID);
    const css = skin?.enabled ? String(skin.css || '') : '';
    if (!css.trim()) {
        style?.remove();
        return false;
    }
    if (!style) {
        style = doc.createElement('style');
        style.id = STYLE_ID;
    }
    style.textContent = layeredSkin(css);
    doc.head.append(style);
    return true;
}
const HOISTED = /@(?:import|charset|namespace)(?=[\s"'u])\s*(?:[\w-]+\s+)?(?:url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\)|"[^"]*"|'[^']*')[^;{}]*;/gi;
export function layeredSkin(css) {
    const source = String(css || '');
    const blanked = source.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, ' '));
    const head = [];
    const cuts = [];
    for (const match of blanked.matchAll(HOISTED)) {
        head.push(source.slice(match.index, match.index + match[0].length));
        cuts.push([match.index, match.index + match[0].length]);
    }
    let body = source;
    for (const [start, end] of cuts.reverse())
        body = body.slice(0, start) + body.slice(end);
    return `${head.join('\n')}${head.length ? '\n' : ''}${body}\n@layer rabbit-mirror-user-skin {\n${body}\n}`;
}
export function removeUserSkin(doc = globalThis.document) {
    doc?.getElementById?.(STYLE_ID)?.remove();
}
function skeleton() {
    const lines = [__rmT("VoMcOuy9a_vn4ep8epxensCId49COKzS9fCOLjAONolJM5Y33DfVyHTgMvKF279KwVYTEQJjMtuWzlH9"), __rmT("HJYhLJmltmbdbBxSnpYYB3HGBNLb_I2M.TfPUDwtLzx1OY4fxsa2sjT1K.xl_TTaZT65ijvfnJkXiigXD3Zq4t7c.eAN0KkFR.K_e5G7CL0zmSzArVVyyQXuXcgb80Jb6JjkcJhSmklv3nPWZoqQ4P1tOYSzmAs0"), __rmT("6Rx6MNYypXgWM.Sm6WpewfaTzwL.1q_kxkNamrQ1Se3eyZwvcMEoSh") + SKIN_TOKENS.join(' ') + ' */', ''];
    for (const [label, selector] of SKIN_HOOKS)
        lines.push(`/* ${label} */`, `${selector} {`, '}', '');
    return lines.join('\n');
}
function download(doc, name, text) {
    const blob = new Blob([text], { type: 'text/css' });
    const link = doc.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    doc.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
}
export function mountUserSkinControls(container, { listen = (node, event, fn) => node.addEventListener(event, fn) } = {}) {
    const doc = container?.ownerDocument;
    if (!doc)
        return null;
    const box = doc.createElement('div');
    box.className = 'rh-ui-user-skin';
    box.innerHTML = `${__rmT("wvqTYhtmQg9EGG12.pqfle4YpgMTcpLZxDwmj3lKLydhCaB_KOEadk1IN2oGsdAAoqyfsTxFf7bsRDx1O3Wt8p3OnoPcVP4QfWdUrEBIDpIxcfKRhzD5FEBXjuIdjkHRM9DhRSN3mq7pMxMTXWCbBvSCf3ccpPlIAoKKBozIpvD1MBsk8GOkP6c5_0YGoom4Y_cR1MF_upyID6A5gEaRjN8FuXouSOFKtsQ0ADUXRdWuO8CFXLjchVovQ0tPj_QR44AfNy8StVTndOFJQkomOCEwf4KIwxhY7EPd2fE4Ymj6GRiTNbYRvwr5F_Y3u16uDZkfXzWnvzyIsdsWU7TAAHXDnfCtkDMVpm3cdEBKg7ItKtVKJ7eaHv2hijaHBWINO4yFtYlT3cqUKIa6bSQukWjDz9Rej3bYXtmvwe03iIngFaPW5AXqqKg72Q.gTy_e67OM6z0GSrFEERFgTryPkpw7XTjixR2mC47cGLB7cfk0KzAcPp9Vz1BxgHYvJkhYpA_iM_ZCMVKxsEGWbhMJYBmw2Wuv88ovvZ5dNnDbQUC4kznKhX_ouYfgSJHLHyhX9dMtxLCwi_DIgQFHezat5SfEyWoc48fxS.TD__EH__G5FfKj8eDFyqOIDxFdOx8uWlKyT.X89hl_IG9isdjonUn7lCiUBbP1A5vk4gZKxkfFFijmbn4mjkzrDm6wLsUsFpoQ6HvcEbL9dWis3P.czVA5AOKAsm7wkv1ifhROrdgiRzl2fnQ6Z5Yn1ShYALdH6zkOdsG0zg4Q3NxS4gF8WYE6ewIgxw_4CHUfk04kxwH8QPxXbFy5a4NhtIlaecN0h.RNGZcQCnftmAnt0a.kS73frQyMcQCSECXD1SIk_ZqkUZxRDBT0wKfD_sbflHfuCjYQGwTPqA0H_KoNPuuvSBBOlGwr6HDqROkjWkX7KdQtjrbEMy7rlYJoKNNURjOccHrJutMzsh04.8ct2xBUDFKgcfR15lrTEyoOPRKY60DmkPEtRQyxgbVGxPBJWju3rzvurk89cZQh8RZeUC.ILC8t0LByn5bkmkwVypbXVcPSw2OWs61qOCJUSEWVGpYuAdxauv8OgmBjVwFuy8tXfjA2z0p0urNStmikpxEx8cTfazIOAz7MaEMjbegD9QLTkG3Yph9CU3KHcrjc2ViVsSQPTWY_gdXOZLIqahiTr4c9mw.xVnjWQ2TDk_mhD8lE42jGdkvICPogfF0dqCc2i8nHxl1apMGM87QIsy_RlyhU9ceNqRZidtZ8o9jarcHYRTl_F38OgQdMSqFbbfgR.9B2KYQAlVhQWsIU_7ES6N.D_k.rBxmX2a4PlF5pMshx3fwfDRNCKyxVyZjeDU95FG_QQ17A5xcddw3mPemyEP9VJbNTlQ0i_oL3hkF4gifZpNIgzYKtSX9OoM.la8ZfNm_uTXMCOrmJ.kUKfTpBvxj9azuTsSxDxkpZY.XVPVjiBSifSsA98RuJtP9GbTpY7hlfpGQS3KQqSYWjS1QUJ_rFaWj6GOsWTJwFgCriPU87z.w2nijn2IE.U2pixTGg.r_Z9Ah0GKSW4VLA_C0mwOtLIVx.R_2HK5SjzkmecpwahEszZsxPE7KGmxc0Asydua_55IRHZG3NIbvzAM7f10B3zYlRbRyfbPNRXeKjj_lKh5RvTANWRq91ROKrrRvKzozQ4UwuThl.0zZzHNIQ.DfhNI_gN4QFdwUiZeC6PDF2QV_RyriPwxBChptiaBxXEvcwot_klilHuxhX6NFk5pyvqAAs950b6uAFc64gJEtxZwH1hLzaCi8AR3aGr0XY_ltRvWlDi7qjC6PknfhyIvAHODnmGr3y4tknnQCJwZUa_tVPLjBnkyypelSxn8eYqpDQiFcdCO9RN1z7VWzyX21JETLERX235kKJMnnsA7sDLmqIEpNqss7RCperUtbiDnNE06zsMKz_Q1Pn1aJy77QN6Atwjp7DvlPbee6pLzRNHDuW77FmT3marfbyTgiKJJxrsmQGxQTShOh98u2wtuC8UrUNzDMJGm02EGGEO7_zFiRPIFjBQGO3K8g9Jun6dbD3M5QBscDDi8NwwZeb25rtRO3bLMXCouYreYdG2Uuo2EUjCFheFRVAGllvFjM8HU.wW2qf9SW8vaTg.7lirz.w8lv7YUcdXGfokVEwiFSnhhjx_tm4oYpiiOtu7rTFLRSTRYOmDCKKgdmtUGoN1q61Bn3ZXbtauBeY7N74zZbUEwkBVmDSejTVIT1DffHGfjfLNI7WLZM30Vd13ufzoQvLekLEDV_U0xAAN2rPN5tcAiSVDl1fMwFsBoSUqmKaYzs4n.Vz5oZ6_47ABGw20OqwFt7etmmdUb5gkQ8NXvvRArp2JbBMk8BJJPDcqX98sE1G5NzhuxcxrZ75UFV8BIBUJQGYoejMAj8yog3BQG0V9kiSgB_UzD6YVbpGiOnrYJMciPtpn7ZfakTvzAPTp5jlcVVacnM9H5oV03ZX4ZMBS1sLlqsrFv1HiOO9_A9tVjxeN4ZXveQkaioCwbpRh9bdNH.hXm5eOyDjpXAAv1E5o1Dtb.B5gadx3ePrRfAuowngaA06Ul9bd85boIljsiZFj4KDRJBabop_6EFql_TdQAWd78p97WRobh3uqnSzSiICphDxGEOuFK3sf7e8Au2rvniDkSL0b3bokajz7PW_wtkVE4OqhkR5Q9h6GNqQwdTIystzeP_4BUP0bELGxORXqT52Gj.K58agIm0q7hwNv6Mon7DJFOFu4SgYH1Wfk596b4Y_LbwHRfAYiYGG_L0Yu3qMfz.KIq.w5dPzVUHQ6PmhU5tJRerVSFx0tq67srj0ATe9Ci9f4mXfvpxOP2Eh.th22IzlikOJZ.Q2UlT.PTz9R9w_8teD1xyq0_29ZMjRDjMJOvG4Vf7XejHGtoGCWF7rjVOPvsEbFubnaiZH774Xa2YpGh7qG6.WfO1xRsqUlr8Vscj85URTw.czoGNHOZkSh3xmSkN4gHA0HYRJeOQmU7ZY1NkHG0lYxwNdPaHIL.VW5MNdiLXODPNOkfjR3fNNm7NUmOQFzg_aB6nmBnUGW6l51xqrzq43k_3TMWJwbyzfyQx61kG3UZoWPGX4SLNFmZ7P.2q3D.lf1vpe5PSCBtY5xJxEYZMSRIy9vXzZOywS2GeYSIBEhVZ_OhTHwFY2ljiCmnn0.Zaa1RMzvYWJmdJuXH0svE50wIcas4AIxkgNKIz9Uxar5gFxGQWpej0hkXo.IdgyPTUw_jKY8xaKIM98b1yujGlWGIPVnXqMyApGNMmKqhjXbmxua28HzQ_bWlQWF_H54nyZXIsN5w.iIJ6f0EIjfpsG9P7sFg32yv9BFTYxPaRVAtSLJW5mJ0oZ6NragdcwyTZ0pxLEoEiZCnKS7nspcq7CdD7fbMH6O8uKsVEWa0dsfN5H9mdwUce8hi8bIDH663RJicWzsc9.VHxUuEr5zrBvVxXq2oQOfMWF418bHYGx0jIpvkpdpTDJKG273hd9.Nr7cpeyWOe1ZF9SUf66FdDkl3pGpFtNQLGi6uJGA5vyaxUOaPD8wIKEE5cLGzExF1OH91Bwp9BKFkp5mwZ2WfFLJIUsLWx1Tib2uUg0e3kpHhsXtux.E4662imyF_vQWOsPTaFYeG3I9D7MvxTaUdpSbyn_uO8bl.dC7wQBJBUOoh2RptulKwyGUV0SIqLzUmR317IGu6Ke2jlds8vzx0eBNxR00qQy5cmcY6PJEGmX0phFr0rWBFdUR2MkRWpYvqSK2YCbA_KYY_bGEEKmBBM3NzWxwbV3Z6yfSRhS8N.hckxpMvy13ZLdoHY7bwWGUQPU6ye3.xS2YeZCaReQ.rtgf6LWvWwfqpC_aRz.xcn4LPRzUmNbReDopjzT_NKMb5U_GIwUBNjR3p7Y5NjbtM.iWrz8I0zytAgd0jN1UPGDF6Yn7hR1V72RbbsPLtz9UINH7yJNJggQNmmANDaQ2fIAWQOagk64QQNc.AYKD_lnsM237Cih0e5EkOUUrnEKQrcmT32eYDgmDsNl9qfzPpz7x0KpecsYUD39tH.H4.rRhbIyySExzp4PCGRdzSXWsx23CFM3fJ_v.mJSo4groJ8uJkiOL9GyfiQPPx0fv2DXPamPP8t2s7u.Uk6DIWPvsLzwcrfPK.cSke03RvvplJuk8OfVsXDU8Mr554NsoGDUiLnnkGqRSw.AnguoKS9EQmnkDivsSXJC5F47l3JCqjd_oLZULKxj34KmoX8VM2fvrWHRghX8pJvbjV8ucRG2Gw3Sy1U4tQ_9h4rVf15yfr5SLZkhRUakE88P7xpNuBaiXGl_NxIjg_R4tC4Cigd_B2YfaOtx04HlA_QBYMwBE3a_pusix_pUNy3UTTWrjVIbYlWm1T3asstLflL.VwlRZQTMDMlB.S_6NI4O6.3DakNR5jm_Vt0Q_jga9M8By6pXhJGQxhsb4Ojz5MUj.2tgop77yWoQSX2WPwaMSbNJqUTuTef6esed2_mllahWD1zj9XKILO6yWQ0dNYGjPXTOSH8P29Nwp6CW7SDxJTVHXwH_Lld69S8_WUTJLRLhXSR7KOHWw8YUa4Kfrxih7deHcsHJ_mrcKGuk0zoWd.0PD4hdJQ.ovU1SuCZygGQYuZKxccJy0Chsp1r72LtO4XjogEgpGFAV1uIN2OTg3DFWzScYWXf6pT6sc_lsgf6Hqksj3ws_c5qHFCtD_uiB94elZW7Ih1yFKfJQHCASvW_FK48g3TjTznuGsRzmMvRxrCvtm6AFrecX_NFZZPH5xrg7oKkdiDlIyhfpmjXCRlceaPWs6HEb2drpbXIUy7ZhHdTPCAjmFPNhqTAY9h8Zzyu.EAvxfdHM4ocPKgQKu.bYmaSOjuInMspL.IK.TxaKkWLVG0APKpkLjqlHkvjHNvtekLz_DdzdLG7EulyXRO5MoIKF03UTGNOuGn9gsWZr2wfqLxea4pMCjKrhHUJwEcUvJAN6FFxUo9I12I7RveoMsW4kzZ7858yG5n7vCXvAnIh0f6VdLTzvf2R.HjTc4z0tBd8Inpf6S.0uPwZF0BmBwtQ2_dqJTnjGrMKfd.K_itfdkThsT0w3IpE3O5OkhvODNRx3zGGodLlb2DyYzEUkkKKQnh.833dv1o8nUyqQZO5SkneGkxROPWUtC_X0bMyCK32xjQeuSuQg_yg0TqM9LqB_vflu_24vHD6r4Og_X4b5tvPZden0l9MS6s5kbwYDEzbwIoxnZBnW3WrtfAhe9k_BdvSsoDGCY3VxYEPL5j.R78LPFiltquC_GCb9ptMCuk2hn0p2.TR4y7geWNG0q30urukdVbv1BVN1cKBsBBtevofAdYHlPhRArN2v4VFkDyhD85oMCB66Sud7mu5aHWRaENI4cIlY5RFSf7ufAtsEL9j4fbjgTCRxKrHw9zyJe_RrrBU_ubGs8glmmEA6BLhLQHIpEwdXOQUqvHmZAERjPKPeinXA09cTbBW4Ucpcq9hiFT")}${SKIN_HOOKS.map(([label, selector]) => `<div style="margin-bottom:6px;"><div>${label}</div><code style="overflow-wrap:anywhere;user-select:all;">${selector.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></div>`).join('')}${__rmT("BF5I05Buv11hA_GhFYUfLKKg1IbzViYfzSZopiWF1MA9vwZqbhgTGcaXiYsHHvWA5bB.g2iw4XyDlvdEVCUMABay8vroHA4oZuREBvHZBP5iloO3LrkOrOhs_jB4DX8a")}${SKIN_TOKENS.join(' ')}${__rmT("U3tcdiraifvrOn9DPgs6laawDnpdKPRPKAk2ypV61hAJ.m22nc2avmPThPLZ5SfvjFTLU4p1dtf_ek1z42OJdny9dKlYuVeje2baLg2sMYOSzwJ2RypJxWQD3G13Kz_OdyRWKunQa_Ao_sGr4pAzByl6LpNK5l2cLpS4rOIiUNnlLzUwETwJ3sPCCBUg7pK0Ti2a1Weq5hcnlkAiIZDSlTya4qkw4vtSkStTGU0k7cDESrw9qPTCdl5z4BmGWneKzlT4VZ82uwSFbcgvHXQiz0iqVogJhS355Jhw4jD3XgKIB3D7YxcBuFyx3h_")}`;
    container.append(box);
    const enabled = box.querySelector('#rh_user_skin_enabled');
    const area = box.querySelector('#rh_user_skin_css');
    const file = box.querySelector('[data-rh-skin-file]');
    const status = box.querySelector('.rh-ui-user-skin-status');
    const unsent = box.querySelector('[data-rh-skin-unsent]');
    const keptBox = box.querySelector('[data-rh-skin-kept]');
    const controls = [enabled, area, ...box.querySelectorAll('[data-rh-skin]')];
    const view = doc.defaultView || globalThis;
    let current = readUserSkin();
    let typing = 0;
    let edited = false;
    const fill = value => { current = normalizeSkin(value); enabled.checked = current.enabled; area.value = current.css; };
    const showSync = state => {
        const locked = state === 'syncing' || state === 'idle';
        for (const node of controls)
            node.disabled = locked;
        if (locked)
            status.textContent = __rmT("Oi4HyVSoEzGF5wZeGtkI1yhDO8TuKE9QUD09PR.W");
        else if (state === 'failed')
            status.textContent = __rmT("FmyVmWR6bwdfnjTf3SuSPO941z5LWTKwDcI3W6jp8qAz4i5UoCzjqpN8N0OSoVDAf1qw4YSkqkgTq2oLXiv_4BL0P9AXjan5vfA1IZv.QUV1.8oXg.F7xd9cc_TlkXts1d79rYeF1FT");
        unsent.hidden = !readUnsentUserSkin();
        const kept = userSkinConflict();
        keptBox.hidden = locked || !(kept === 'kept-local' || kept === 'kept-page');
    };
    fill(current);
    showSync(userSkinSyncState());
    const onSync = event => {
        if (!box.isConnected) {
            view.removeEventListener?.('rabbitmirror:user-skin-sync', onSync);
            return;
        }
        const state = event.detail?.state;
        if (state === 'done' && !(edited || typing)) {
            fill(readUserSkin());
            status.textContent = event.detail?.conflict ? '' : __rmT("oeS1UnrBJa54l20lLeY8nvl6bYmtaOs2");
        }
        showSync(state);
    };
    view.addEventListener?.('rabbitmirror:user-skin-sync', onSync);
    const commit = (message) => {
        view.clearTimeout(typing);
        typing = 0;
        current = { enabled: enabled.checked, css: area.value, name: current.name };
        const result = saveUserSkin(current);
        if (result === 'pending') {
            status.textContent = __rmT("N1su11s6c_u1DDtZ5rz2CqJZSoDROR_nEo7sGrhf_ife8nZEoDFuWGqtSIu4NCu8uBJo2WLLqlrd4EH9");
            return;
        }
        edited = true;
        if (result === 'saved')
            status.textContent = message;
        else if (result === 'local')
            status.textContent = `${message}${__rmT("5TAOPY4_ECV4HUhTO6zytUZrN7WqGT7IreUJhpogy7v5rOHnN9.BBmybLDYekZwP")}`;
        else
            status.textContent = __rmT("iFpJ6G58UVYQtlaKBCCocCiilSI2FYdR1AHdugeHLVlXAULDiL1CP9iqcKAXfJtAkE1iSZk.ko_7qy_I56JqbKUUK.34EIHU9x8c.rvJymAd9ePBenQwPHd2_rJl2p4iHqwPX_KYlApPIdfF");
    };
    listen(enabled, 'change', () => commit(enabled.checked ? __rmT("G8rE4gTnylJXVif1") : __rmT("IjG3CHVYq9nSRoxGL1DtNXqWqLrV8xs2")));
    listen(area, 'input', () => {
        const view = doc.defaultView || globalThis;
        view.clearTimeout(typing);
        typing = view.setTimeout(() => commit(enabled.checked ? __rmT("2GScLEWTz4KXL7Ix33cdmIEI") : __rmT("6b8B5SRJjXtHbu2gZ7vK2k3OoL3RfGX.w9Nspf")), 700);
    });
    listen(box, 'click', event => {
        const action = event.target?.closest?.('[data-rh-skin]')?.dataset.rhSkin;
        if (action === 'save') {
            if (!enabled.checked && area.value.trim())
                enabled.checked = true;
            commit(__rmT("p9HQSQtmz4KXL7IxhXIpxxEI"));
        }
        if (action === 'import')
            file.click();
        if (action === 'export') {
            commit(__rmT("qwLg16cJ7ocutQ95ciCcZd20NHqrrk"));
            download(doc, `${current.name || __rmT("8vfuqCi7E2xiCf")}.css`, area.value);
        }
        if (action === 'skeleton') {
            area.value = `${area.value.trim() ? `${area.value.trimEnd()}\n\n` : ''}${skeleton()}`;
            status.textContent = __rmT("HCTNh30rwKmcReKzrsQlIYILjxQyEVmX28tsR.WW8b8w3V5aKhCkx15X");
        }
        if (action === 'clear') {
            area.value = '';
            commit(__rmT("G8rE4gTnpw0Erof1"));
        }
        if (action === 'take-tavern') {
            for (const node of controls)
                node.disabled = true;
            void useTavernUserSkin(doc).then(ok => {
                if (ok) {
                    fill(readUserSkin());
                    status.textContent = __rmT("qwewR_cCr8yHXMHF3yyOjCDLBuqrrk");
                }
                else
                    status.textContent = __rmT("KQYWh3GHKr6e1A9RnOgZGQ0GRulIoZ1a081OvQP8xVd.bh");
                edited = false;
                showSync(userSkinSyncState());
            });
        }
        if (action === 'save')
            keptBox.hidden = true;
        if (action === 'unsent') {
            const mine = readUnsentUserSkin();
            if (!mine) {
                unsent.hidden = true;
                return;
            }
            fill(mine);
            view.clearTimeout(typing);
            typing = 0;
            const result = saveUserSkin(mine);
            edited = true;
            dropUnsentUserSkin();
            unsent.hidden = true;
            status.textContent = result === 'saved' ? __rmT("r8XJD0SGx0oS6Amh1BBKNwafIHjTrAjAxI9JNQOgNS3XRSQX") : result === 'local' ? __rmT("RmGt.R1GNCkZk5yn.Q9IhI.0u_b7_BJGkAjCn4jRVVs1YSNkMd.DYw4tjTm41R7.YmggcG.5DWYHCJhmO43JYFDvw0Ccxf") : __rmT(".mO_RnDvdCBw85LzQfhOedF.aWP_Wt5O29E");
        }
    });
    listen(file, 'change', async () => {
        const picked = file.files?.[0];
        file.value = '';
        if (!picked)
            return;
        if (picked.size > MAX_CHARS * 2) {
            status.textContent = __rmT("9sah1EKD2CiHgrGj03fEnxq3XBgrrk");
            return;
        }
        try {
            area.value = (await picked.text()).slice(0, MAX_CHARS);
            current.name = picked.name.replace(/\.(css|txt)$/i, '').slice(0, 80);
            enabled.checked = true;
            commit(`${__rmT("iFBSa5tDSXG")}${picked.name}${__rmT("iCYma8RNV6uMsh")}`);
        }
        catch {
            status.textContent = __rmT("7eHcUo21D563SL.O6osQc7EI");
        }
    });
    return box;
}
