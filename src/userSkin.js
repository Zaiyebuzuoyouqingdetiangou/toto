// 用户美化：用户自己写或导入一段 CSS，改兔子镜的设置界面、工具弹窗和外置框（含外置标题框）。
// 只是一段样式，不跑脚本、不进提示词、不改模型写的画面；保存在这台设备上（和「主题与外观」的配色一样）。
// 兔子镜承诺下面 SKIN_HOOKS 里这些名字以后不改，美化照着写，更新了也不会失效。

import { getSettings, updateSettings } from './settings.js?rmv=1.72.0';

export const USER_SKIN_STORAGE_KEY = 'rabbit_mirror_user_skin_v1';
// 另存一份在酒馆的用户文件夹里（user/files，存在酒馆服务器上）：浏览器或宿主清掉网页数据、重启后本机那份没了，也能找回。
// 酒馆设置里只记一个小记号（文件名、指纹），不放整份 CSS：酒馆每次保存设置都整份上传，美化放在里面会拖慢每一次保存。
// 1.68.94～1.69.0 把整份 CSS 放在设置里；读到这种旧备份照样能找回，并顺手挪进文件、从设置里去掉。
export const USER_SKIN_FILE_NAME = 'rabbitmirror-user-skin.json';
const USER_SKIN_FILE_FORMAT = 'rabbitmirror-user-skin';
// 存不进文件时（宿主不让存文件）退回老办法：不太大的放进设置里。
const SERVER_COPY_MAX = 300_000;
const FILE_SAVE_DELAY_MS = 1500;
const STYLE_ID = 'rabbit-mirror-user-skin';
const MAX_CHARS = 1_500_000;
export const SKIN_HOOKS = Object.freeze([
    ['设置界面整体', '#rabbit_mirror_theater_settings'],
    ['设置窗口', '#rabbit_mirror_theater_settings .rh-ui-window'],
    ['设置顶栏', '#rabbit_mirror_theater_settings .rh-ui-head'],
    ['设置标签栏', '#rabbit_mirror_theater_settings .rh-ui-tabs'],
    ['设置内容区', '#rabbit_mirror_theater_settings .rh-ui-main'],
    ['工具弹窗（维修兔、挨打猫、重说等）', '[data-rm-skin="panel"]'],
    ['外置框（整块；框外的装饰挂在它的 ::before / ::after 上）', '.rabbit-mirror-external-shell[data-rm-placement="external"]'],
    ['外置框里的每一面', '.rabbit-mirror-external-shell[data-rm-placement="external"] > details[data-rabbit-mirror-external-details]'],
    ['外置标题框', '.rabbit-mirror-external-shell[data-rm-placement="external"] summary[data-rm-title-chrome]'],
    ['标题文字', '.rabbit-mirror-external-shell[data-rm-placement="external"] [data-rm-title-label]'],
    ['标题旁的兔子按钮', '.rabbit-mirror-external-shell[data-rm-placement="external"] [data-rm-tool-menu-button]'],
]);

export const SKIN_TOKENS = Object.freeze(['--rh-bg', '--rh-card', '--rh-text', '--rh-muted', '--rh-primary', '--rh-secondary', '--rh-border']);

function normalizeSkin(value) {
    return { enabled: value?.enabled === true, css: typeof value?.css === 'string' ? value.css.slice(0, MAX_CHARS) : '', name: typeof value?.name === 'string' ? value.name.slice(0, 80) : '' };
}

function serverCopy() {
    try { const value = getSettings()?.userSkin; return value && typeof value === 'object' ? value : null; } catch { return null; }
}

// 指纹：本机这份和酒馆里那份是不是同一版（开关、名字、内容都算）。
export function userSkinFingerprint(value) {
    const text = `${value?.enabled === true ? 1 : 0}|${value?.name || ''}|${value?.css || ''}`;
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return `${text.length.toString(36)}-${(h >>> 0).toString(36)}`;
}

function base64Utf8(text) {
    const bytes = new TextEncoder().encode(String(text || ''));
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    return btoa(binary);
}

async function hostHeaders() {
    try {
        const ctx = globalThis.SillyTavern?.getContext?.();
        if (typeof ctx?.getRequestHeaders === 'function') return ctx.getRequestHeaders();
    } catch { /* 换下面的办法 */ }
    try {
        const module = await import('../../../../../script.js');
        return typeof module?.getRequestHeaders === 'function' ? module.getRequestHeaders() : null;
    } catch { return null; }
}

async function uploadSkinFile(value) {
    const headers = await hostHeaders();
    if (!headers || typeof globalThis.fetch !== 'function') throw new Error('当前环境不能往酒馆里存文件。');
    const text = JSON.stringify({ format: USER_SKIN_FILE_FORMAT, version: 1, savedAt: Date.now(), ...normalizeSkin(value), editedAt: Number(value?.editedAt) || 0 });
    const response = await globalThis.fetch('/api/files/upload', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: USER_SKIN_FILE_NAME, data: base64Utf8(text) }),
    });
    if (!response.ok) throw new Error(`美化存进酒馆失败（${response.status}）。`);
}

/** 读酒馆里存的那份美化；确定没有返回 null，读失败（网络、服务器出错）抛错。 */
export async function readUserSkinFile() {
    if (typeof globalThis.fetch !== 'function') throw new Error('当前环境不能读酒馆文件。');
    const response = await globalThis.fetch(`/user/files/${USER_SKIN_FILE_NAME}?t=${Date.now()}`, { cache: 'no-store', credentials: 'same-origin' });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`读酒馆里的美化失败（${response.status}）。`);
    const text = await response.text();
    // 不是这份美化文件（有的宿主对不存在的文件返回首页 HTML）：说不准有没有，当读失败处理，不当成「酒馆里没有」。
    const notSkinFile = () => Object.assign(new Error('读回来的不是兔子镜美化文件。'), { notSkinFile: true });
    let data = null;
    try { data = JSON.parse(text); } catch { throw notSkinFile(); }
    if (data?.format !== USER_SKIN_FILE_FORMAT) throw notSkinFile();
    return { ...normalizeSkin(data), editedAt: Number(data.editedAt) || 0 };
}

// 同步规则（几台设备共用酒馆里那一份）：
// 以酒馆里那份文件为准。设置里的小记号只是为了让设置变小，不拿它做判断：酒馆保存设置是整份上传，
// 别的设备上还开着的页面随时可能把旧记号写回去。
// 每次打开页面先读一次酒馆文件（对账）。对完账之前什么都不传，设置界面也锁着不让改，免得拿本机的旧版去盖酒馆里的新版。
//   本机有没传上去的改动（dirty）：酒馆那份还是改动时的底版（synced）→ 传上去；
//                       酒馆那份已经被别的设备换过 → 换上酒馆的，本机这版另外留一份（UNSENT），设置里能一键换回来。
//   本机没改过：酒馆那份和本机不一样 → 换上酒馆的（别的设备存了新的）。
//   1.70 以前留下的本机美化（没有同步记号）：和酒馆那份一样就算对上；本机是空的就换上酒馆的；
//                       不一样就这台设备继续用自己的（pinned），不传也不被换掉，等用户在这台设备上存一次再一起同步。
//   酒馆里没有文件：本机有改动或有旧美化就传上去；设置里还有 1.69 以前整份存的旧备份、本机又是空的 → 用旧备份并挪进文件。
//   读不到（网络、服务器出错、读回来是个网页）：这次什么都不传、不换；设置界面放开，改的先只存在这台设备上，下次读到时再对。
//   本机是空的时，读到之前存空美化不存不传，免得清掉酒馆那份。
const UNSENT_KEY = `${USER_SKIN_STORAGE_KEY}_unsent`;
let backupTimer = 0;
let backupChain = null;
let backupValue = null;
// 本机存不下（隐私模式、存满了）时，这次打开页面用的那份。
let restoredValue = null;
// 本机存不下时这次页面上改的那份，是在哪一版上改的（和本机记录里的 synced 一个意思）；null 表示这次页面上没改过。
let pageEditBase = null;
// 本机是空的、还没确认酒馆里有没有：这时存一份空美化不存、不传，免得把酒馆那份清掉。
let restorePending = false;
// 和酒馆对账：idle 还没开始，syncing 正在读，failed 读失败（下次打开设置或刷新再试），done 对完了。
let syncState = 'idle';
// 这次对账遇到的冲突：'' 没有；stashed 换上了酒馆那份、本机那版另外留着；kept-local / kept-page 本机那份留着没传（留不下另一份）。
let lastConflict = '';
export function userSkinConflict() { return lastConflict; }
let syncing = null;

function setSyncState(state, detail = {}) {
    syncState = state;
    try { globalThis.dispatchEvent?.(new CustomEvent('rabbitmirror:user-skin-sync', { detail: { state, ...detail } })); } catch { /* 只是通知设置界面 */ }
}
export function userSkinSyncState() { return syncState; }

function readLocalRecord() {
    try { const value = JSON.parse(globalThis.localStorage?.getItem(USER_SKIN_STORAGE_KEY) || 'null'); return value && typeof value === 'object' ? value : null; } catch { return null; }
}
function writeLocalRecord(value, meta) {
    try { globalThis.localStorage.setItem(USER_SKIN_STORAGE_KEY, JSON.stringify({ ...normalizeSkin(value), ...meta })); return true; } catch { return false; }
}
function dropLocalRecord() {
    try { globalThis.localStorage?.removeItem(USER_SKIN_STORAGE_KEY); } catch { /* 删不掉就算了 */ }
}
/** 这台设备上次没传上去、对账时被酒馆里更新的那版换下来的美化；没有返回 null。 */
export function readUnsentUserSkin() {
    try { const value = JSON.parse(globalThis.localStorage?.getItem(UNSENT_KEY) || 'null'); return value && typeof value === 'object' ? normalizeSkin(value) : null; } catch { return null; }
}
export function dropUnsentUserSkin() {
    try { globalThis.localStorage?.removeItem(UNSENT_KEY); } catch { /* 删不掉就算了 */ }
}

function writeServerCopy(value) {
    // 存不进文件的宿主：老办法，不太大的整份放进设置里。
    // 酒馆里已经有文件记号（存文件这条路是通的，这次只是没传上）：不动它；本机留着改动下次再传。
    const server = serverCopy();
    if (server?.file) return;
    const next = value.css.length <= SERVER_COPY_MAX ? value : { ...value, css: '', tooLarge: true };
    // 设置里已经是这一份：不再整份保存一次设置。
    if (server && userSkinFingerprint(normalizeSkin(server)) === userSkinFingerprint(normalizeSkin(next)) && !!server.tooLarge === !!next.tooLarge) return;
    try { updateSettings({ userSkin: next }); } catch { /* 下次再说 */ }
}

async function runBackup() {
    const value = backupValue;
    backupValue = null;
    if (!value) return;
    const fingerprint = userSkinFingerprint(value);
    try {
        await uploadSkinFile(value);
        const server = serverCopy();
        if (!(server?.file && server.fingerprint === fingerprint)) updateSettings({ userSkin: { file: USER_SKIN_FILE_NAME, fingerprint, enabled: value.enabled, name: value.name, length: value.css.length, editedAt: Number(value.editedAt) || 0 } });
        // 本机这份就是刚传上去的（中途没再改）：记下已经对上了。
        const local = readLocalRecord();
        if (local && userSkinFingerprint(normalizeSkin(local)) === fingerprint) writeLocalRecord(local, { dirty: false, synced: fingerprint, editedAt: Number(local.editedAt) || 0 });
    } catch (error) {
        writeServerCopy(value);
        console.warn('[RabbitMirror] 美化没能存成酒馆文件', error);
    }
}

function startBackup() {
    const next = (backupChain || Promise.resolve()).then(runBackup, runBackup);
    backupChain = next;
    next.finally(() => { if (backupChain === next) backupChain = null; });
    return next;
}

/** 稍等一会儿把美化存进酒馆文件（打字时不会每停一下就传一次）。只在对完账以后调用。 */
function scheduleUserSkinBackup(value, delay = FILE_SAVE_DELAY_MS) {
    backupValue = { ...normalizeSkin(value), editedAt: Number(value?.editedAt) || 0 };
    if (backupTimer) globalThis.clearTimeout(backupTimer);
    backupTimer = globalThis.setTimeout(() => { backupTimer = 0; startBackup(); }, delay);
}

/** 等这次打开页面的对账和上传都做完（测试用）。 */
export async function flushUserSkinBackup() {
    if (syncing) await syncing;
    if (backupTimer) { globalThis.clearTimeout(backupTimer); backupTimer = 0; startBackup(); }
    while (backupChain) await backupChain;
}

function adopt(doc, file) {
    pageEditBase = null;
    const fingerprint = userSkinFingerprint(file);
    if (!writeLocalRecord(file, { dirty: false, synced: fingerprint, editedAt: Number(file.editedAt) || 0 })) dropLocalRecord();
    const value = normalizeSkin(file);
    restoredValue = value;
    applyUserSkin(doc, value);
}

function uploadLocal(record, value) {
    const editedAt = Number(record?.editedAt) || Date.now();
    if (record) writeLocalRecord(record, { dirty: true, editedAt, synced: String(record.synced ?? '') });
    scheduleUserSkinBackup({ ...value, editedAt }, 0);
}

// 和酒馆对一次账。
function syncWithTavern(doc) {
    if (syncState === 'done') return Promise.resolve();
    if (syncing) return syncing;
    if (!readLocalRecord() && !restoredValue) restorePending = true;
    setSyncState('syncing');
    const run = async () => {
        let file;
        try { file = await readUserSkinFile(); }
        catch (error) {
            // 读回来是个网页，而这台设备和设置里都什么美化都没有（从没用过）：当成酒馆里没有，不用每次都问。
            // 其他情况一律当读失败：不换、不传。
            if (error?.notSkinFile && !readLocalRecord() && !restoredValue && !serverCopy()) file = null;
            else { setSyncState('failed'); return; }
        }
        restorePending = false;
        const now = readLocalRecord();
        let conflict = false;
        if (!file) {
            if (now) {
                const value = normalizeSkin(now);
                // 1.70 以前留下的、或者没传上去的：酒馆里还没有，就传本机这份。
                if ((now.dirty || !('synced' in now)) && value.css) uploadLocal(now, value);
                else if (!('synced' in now)) writeLocalRecord(now, { dirty: false, synced: '' });
            } else if (restoredValue && pageEditBase !== null) {
                // 本机存不下时这次页面上改的那份：酒馆里没有文件，传上去。
                uploadLocal(null, restoredValue);
            } else {
                // 本机是空的、酒馆里没有文件：设置里还有 1.69 以前整份存的旧备份就用它，并挪进文件。
                const old = serverCopy();
                if (typeof old?.css === 'string' && old.css && !old.file) {
                    const value = { ...normalizeSkin(old), editedAt: 0 };
                    adopt(doc, value);
                    scheduleUserSkinBackup(value, 0);
                } else writeLocalRecord(normalizeSkin(null), { dirty: false, synced: '', editedAt: 0 });
            }
        } else {
            const fileFingerprint = userSkinFingerprint(file);
            // 设置里还是整份旧 CSS（1.69 以前的页面写回来的）：酒馆已经有文件了，换成小记号。
            const server = serverCopy();
            if (server && !server.file) { try { updateSettings({ userSkin: { file: USER_SKIN_FILE_NAME, fingerprint: fileFingerprint, enabled: file.enabled, name: file.name, length: file.css.length, editedAt: file.editedAt } }); } catch { /* 下次再说 */ } }
            if (!now) {
                if (restoredValue && pageEditBase !== null) {
                    // 本机存不下时这次页面上改的那份：酒馆那份还是改的时候的底版才传；被别的设备换过就不传，留在页面上，设置里说清楚。
                    if (pageEditBase === fileFingerprint) uploadLocal(null, restoredValue);
                    else conflict = 'kept-page';
                } else adopt(doc, file);
            } else {
                const value = normalizeSkin(now);
                const localFingerprint = userSkinFingerprint(value);
                if (localFingerprint === fileFingerprint) writeLocalRecord(now, { dirty: false, synced: fileFingerprint, editedAt: Math.max(Number(now.editedAt) || 0, file.editedAt) });
                else if (now.pinned) { /* 这台设备继续用自己的 */ }
                else if (!('synced' in now)) {
                    if (value.css.trim()) writeLocalRecord(now, { dirty: false, synced: fileFingerprint, pinned: true });
                    else adopt(doc, file);
                } else if (now.dirty && String(now.synced) === fileFingerprint) uploadLocal(now, value);
                else if (now.dirty && value.css.trim()) {
                    // 本机有没传上去的改动，可酒馆那份在那之后被别的设备换过：换上酒馆的，本机这版另外留一份，设置里能换回来。
                    // 留不下（本机存满了）：不换，先保留这台设备的、也不传，设置里说清楚，由用户决定。
                    let stashed = false;
                    try { globalThis.localStorage?.setItem(UNSENT_KEY, JSON.stringify(value)); stashed = true; } catch { /* 留不下 */ }
                    if (stashed) { conflict = 'stashed'; adopt(doc, file); }
                    else conflict = 'kept-local';
                } else adopt(doc, file);
            }
        }
        lastConflict = conflict || '';
        setSyncState('done', { conflict });
    };
    syncing = run().finally(() => { syncing = null; });
    return syncing;
}

/** 冲突时用户选「改用酒馆那份」：读酒馆文件换上，本机这份不要了。成功返回 true。 */
export async function useTavernUserSkin(doc = globalThis.document) {
    let file = null;
    try { file = await readUserSkinFile(); } catch { return false; }
    if (!file) return false;
    adopt(doc, file);
    restorePending = false;
    lastConflict = '';
    setSyncState('done', { conflict: '' });
    return true;
}

export function readUserSkin() {
    const local = readLocalRecord();
    // 和酒馆对账在后台做，读回来要换的话再换上；这里先照本机的显示。
    if (syncState === 'idle' || syncState === 'failed') void syncWithTavern(globalThis.document);
    if (local) return normalizeSkin(local);
    if (restoredValue) return restoredValue;
    return normalizeSkin(null);
}

/**
 * 保存。返回 'saved' 存好了（对完账的会传进酒馆）；'local' 只存在这台设备上（还没能和酒馆对账，读到时再对）；
 * 'page-only' 这台设备存不下，只在这个页面生效；'pending' 本机是空的、酒馆那份还没读到，这次的空美化不存。
 */
export function saveUserSkin(skin) {
    const value = { enabled: skin?.enabled === true, css: String(skin?.css || '').slice(0, MAX_CHARS), name: String(skin?.name || '').slice(0, 80) };
    applyUserSkin(globalThis.document, value);
    if (restorePending && !value.css.trim()) return 'pending';
    restorePending = false;
    const editedAt = Date.now();
    const before = readLocalRecord();
    // 底版：这次改动是在哪一版上改的。对账时酒馆那份还是这一版才传，被别的设备换过就按冲突处理，不会悄悄盖掉。
    const base = before ? String(before.synced ?? '') : (pageEditBase ?? '');
    const local = writeLocalRecord(value, { dirty: true, editedAt, synced: base });
    if (local) { restoredValue = null; pageEditBase = null; }
    else {
        pageEditBase = base;
        // 本机存不下（存满了、隐私模式）：本机的旧记录删掉（不然刷新后会拿旧的去盖酒馆里的新版），这次页面上照样用。
        dropLocalRecord();
        restoredValue = value;
        writeServerCopy(value);
    }
    // 对完账的才传；读失败时先只存本机（不在这里重试：重试会把正在打字的设置界面锁一下），下次打开设置或刷新时再对。
    if (syncState === 'done') { lastConflict = ''; scheduleUserSkinBackup({ ...value, editedAt }); }
    if (!local) return 'page-only';
    return syncState === 'done' ? 'saved' : 'local';
}

/** 把美化放进页面：一个 <style>，排在 head 最后，盖过兔子镜自己的样式；关着或为空就拿掉。 */
export function applyUserSkin(doc = globalThis.document, skin = readUserSkin()) {
    if (!doc?.head) return false;
    let style = doc.getElementById(STYLE_ID);
    const css = skin?.enabled ? String(skin.css || '') : '';
    if (!css.trim()) { style?.remove(); return false; }
    if (!style) { style = doc.createElement('style'); style.id = STYLE_ID; }
    style.textContent = layeredSkin(css);
    // 每次都挪到最后：后加载的兔子镜样式不会反过来盖住美化。
    doc.head.append(style);
    return true;
}

// 兔子镜自己的样式选择器很长（带 #chat 和好几个属性），美化照文档写短名字、加了 !important 也盖不过。
// 所以美化放两份：一份照常（不加 !important 的写法照常按先后和精确程度生效）；
// 一份放进单独的层（@layer）里——层里的 !important 盖过所有不在层里的 !important，美化写了 !important 就一定生效。
// 写在元素 style 属性里的 !important 仍然最大（比如标题旁兔子按钮自己的样式）。@import、@charset 只能放最前面，单独提出来。
// 网址里常有分号（字体链接的 wght@400;700），整个 url(...) 或引号里的地址当成一块，不在里面断开；
// 注释里的 @import 是用户关掉的，不提出来（注释先去掉再找）。@namespace 也只能放最前面。
const HOISTED = /@(?:import|charset|namespace)(?=[\s"'u])\s*(?:[\w-]+\s+)?(?:url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\)|"[^"]*"|'[^']*')[^;{}]*;/gi;
export function layeredSkin(css) {
    const source = String(css || '');
    // 找要提出来的规则时把注释换成同样长的空白（位置不变），在原文里按位置剪；原文的注释和字符串都不动，
    // 这样 content:"/*" 这种写法不会把后面的规则吃掉。
    const blanked = source.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, ' '));
    const head = [];
    const cuts = [];
    for (const match of blanked.matchAll(HOISTED)) { head.push(source.slice(match.index, match.index + match[0].length)); cuts.push([match.index, match.index + match[0].length]); }
    let body = source;
    for (const [start, end] of cuts.reverse()) body = body.slice(0, start) + body.slice(end);
    return `${head.join('\n')}${head.length ? '\n' : ''}${body}\n@layer rabbit-mirror-user-skin {\n${body}\n}`;
}

/** 停用兔子镜时拿掉美化（不删保存的内容）。 */
export function removeUserSkin(doc = globalThis.document) {
    doc?.getElementById?.(STYLE_ID)?.remove();
}

function skeleton() {
    const lines = ['/* 兔子镜美化：只写下面这些名字，兔子镜更新后也不会失效。', ' * 要盖过兔子镜自己的样式时加 !important（写在元素自己 style 里的 !important 盖不过）。', ' * 颜色变量（设置界面和工具弹窗用）：' + SKIN_TOKENS.join(' ') + ' */', ''];
    for (const [label, selector] of SKIN_HOOKS) lines.push(`/* ${label} */`, `${selector} {`, '}', '');
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

/** 「主题与外观」里的美化区：开关、文本框、导入文件、导出、插入可用名字、清空。 */
export function mountUserSkinControls(container, { listen = (node, event, fn) => node.addEventListener(event, fn) } = {}) {
    const doc = container?.ownerDocument;
    if (!doc) return null;
    const box = doc.createElement('div');
    box.className = 'rh-ui-user-skin';
    box.innerHTML = `<h3 style="margin:18px 0 6px;font-size:15px;">导入美化</h3>
<p class="rh-ui-user-skin-note" style="margin:0 0 8px;font-size:12px;line-height:1.55;opacity:.8;">用一段 CSS 改兔子镜的设置界面、工具弹窗和外置框（包括外置标题框）。不改兔子镜画面里面的内容，保存在这台设备上，也在酒馆里存一份（换设备或清了网页数据也能找回）。只导入你信任的美化。</p>
<label class="checkbox_label"><input id="rh_user_skin_enabled" type="checkbox"> 启用美化</label>
<textarea id="rh_user_skin_css" class="text_pole" rows="8" spellcheck="false" placeholder="把美化 CSS 粘贴在这里，或点「从文件导入」" style="width:100%;min-height:150px;font-family:ui-monospace,Consolas,monospace;font-size:12px;margin-top:6px;box-sizing:border-box;"></textarea>
<div class="flex-container" style="gap:7px;flex-wrap:wrap;margin-top:6px;">
<button type="button" class="menu_button" data-rh-skin="save">保存并应用</button>
<button type="button" class="menu_button" data-rh-skin="import">从文件导入</button>
<button type="button" class="menu_button" data-rh-skin="export">导出</button>
<button type="button" class="menu_button" data-rh-skin="skeleton">插入可用的名字</button>
<button type="button" class="menu_button" data-rh-skin="clear">清空</button>
</div>
<input type="file" accept=".css,.txt,text/css,text/plain" hidden data-rh-skin-file>
<div class="rh-ui-user-skin-status" role="status" aria-live="polite" style="font-size:12px;margin-top:6px;opacity:.85;"></div>
<div data-rh-skin-kept hidden style="font-size:12px;margin-top:6px;line-height:1.55;">别的设备在酒馆里存了新版，可这台设备改的这版还没传上去，本机又放不下另一份，所以先留着这台的、没有传。<div class="flex-container" style="gap:7px;flex-wrap:wrap;margin-top:4px;"><button type="button" class="menu_button" data-rh-skin="save">用这台的（传进酒馆）</button><button type="button" class="menu_button" data-rh-skin="take-tavern">改用酒馆那份</button></div></div>
<div data-rh-skin-unsent hidden style="font-size:12px;margin-top:6px;line-height:1.55;">这台设备上次改的美化没传进酒馆，后来别的设备又改过，现在用的是酒馆里那份。<button type="button" class="menu_button" data-rh-skin="unsent" style="margin-top:4px;">换回这台设备改的那版</button></div>
<details style="margin-top:8px;"><summary style="cursor:pointer;">美化能用的名字</summary><div style="font-size:12px;line-height:1.6;margin-top:6px;">${SKIN_HOOKS.map(([label, selector]) => `<div style="margin-bottom:6px;"><div>${label}</div><code style="overflow-wrap:anywhere;user-select:all;">${selector.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></div>`).join('')}<div>颜色变量：<code style="overflow-wrap:anywhere;">${SKIN_TOKENS.join(' ')}</code></div><div style="opacity:.8;margin-top:4px;">外置框还在生成时，兔子镜会临时用它的 ::before / ::after 显示进度。</div></div></details>`;
    container.append(box);
    const enabled = box.querySelector('#rh_user_skin_enabled');
    const area = box.querySelector('#rh_user_skin_css');
    const file = box.querySelector('[data-rh-skin-file]');
    const status = box.querySelector('.rh-ui-user-skin-status');
    const unsent = box.querySelector('[data-rh-skin-unsent]');
    const keptBox = box.querySelector('[data-rh-skin-kept]');
    // 「换回这台设备改的那版」也一起锁：对账没完时换回，会拿它去盖还没看到的新版。
    const controls = [enabled, area, ...box.querySelectorAll('[data-rh-skin]')];
    const view = doc.defaultView || globalThis;
    let current = readUserSkin();
    let typing = 0;
    let edited = false;
    const fill = value => { current = normalizeSkin(value); enabled.checked = current.enabled; area.value = current.css; };
    // 和酒馆对账没完之前锁着：免得在本机的旧版上改了一下，又传上去盖掉别的设备存的新版。
    const showSync = state => {
        const locked = state === 'syncing' || state === 'idle';
        for (const node of controls) node.disabled = locked;
        if (locked) status.textContent = '正在和酒馆里存的美化对一下……';
        else if (state === 'failed') status.textContent = '没能读到酒馆里存的美化（网络或服务器问题）。现在改的先只存在这台设备上，下次打开设置或刷新时再和酒馆对。';
        unsent.hidden = !readUnsentUserSkin();
        const kept = userSkinConflict();
        keptBox.hidden = locked || !(kept === 'kept-local' || kept === 'kept-page');
    };
    fill(current);
    showSync(userSkinSyncState());
    const onSync = event => {
        if (!box.isConnected) { view.removeEventListener?.('rabbitmirror:user-skin-sync', onSync); return; }
        const state = event.detail?.state;
        // 对完账：把对完以后的那份填进来（打开以后已经改过、正在打字的不盖）。
        if (state === 'done' && !(edited || typing)) { fill(readUserSkin()); status.textContent = event.detail?.conflict ? '' : '已和酒馆里存的美化对上。'; }
        showSync(state);
    };
    view.addEventListener?.('rabbitmirror:user-skin-sync', onSync);
    const commit = (message) => {
        view.clearTimeout(typing);
        typing = 0;
        current = { enabled: enabled.checked, css: area.value, name: current.name };
        const result = saveUserSkin(current);
        // 本机是空的、酒馆那份还没读到时点的开关、清空（内容是空的）：没存，不算改过，读到后照样填进来。
        if (result === 'pending') { status.textContent = '酒馆里存的美化还没读到，空的美化先不存，免得把酒馆那份清掉。'; return; }
        edited = true;
        if (result === 'saved') status.textContent = message;
        else if (result === 'local') status.textContent = `${message}（先存在这台设备上，能读到酒馆那份时再传进去。）`;
        else status.textContent = '美化已换上，但这台设备存不下（可能太大或浏览器不让存），正在往酒馆里存；万一没存上，刷新后会回到原来的样子。';
    };
    listen(enabled, 'change', () => commit(enabled.checked ? '美化已启用。' : '美化已关闭，内容还留着。'));
    // 改文本框就自动存（停手一会儿后），不点「保存」直接关掉、导出或刷新也不会丢。开着美化时顺便换上，边写边看。
    listen(area, 'input', () => {
        const view = doc.defaultView || globalThis;
        view.clearTimeout(typing);
        typing = view.setTimeout(() => commit(enabled.checked ? '已自动保存并换上。' : '已自动保存（美化还没启用）。'), 700);
    });
    listen(box, 'click', event => {
        const action = event.target?.closest?.('[data-rh-skin]')?.dataset.rhSkin;
        if (action === 'save') { if (!enabled.checked && area.value.trim()) enabled.checked = true; commit('美化已保存并应用。'); }
        if (action === 'import') file.click();
        if (action === 'export') { commit('已保存，并导出成文件。'); download(doc, `${current.name || '兔子镜美化'}.css`, area.value); }
        if (action === 'skeleton') { area.value = `${area.value.trim() ? `${area.value.trimEnd()}\n\n` : ''}${skeleton()}`; status.textContent = '已插入可用的名字，写好后点「保存并应用」。'; }
        if (action === 'clear') { area.value = ''; commit('美化已清空。'); }
        if (action === 'take-tavern') {
            for (const node of controls) node.disabled = true;
            void useTavernUserSkin(doc).then(ok => {
                if (ok) { fill(readUserSkin()); status.textContent = '已改用酒馆里存的那份。'; }
                else status.textContent = '没能读到酒馆里存的美化，这次没换。';
                edited = false;
                showSync(userSkinSyncState());
            });
        }
        if (action === 'save') keptBox.hidden = true;
        if (action === 'unsent') {
            const mine = readUnsentUserSkin();
            if (!mine) { unsent.hidden = true; return; }
            fill(mine);
            view.clearTimeout(typing); typing = 0;
            const result = saveUserSkin(mine);
            edited = true;
            dropUnsentUserSkin();
            unsent.hidden = true;
            status.textContent = result === 'saved' ? '已换回这台设备改的那版，并存进酒馆。' : result === 'local' ? '已换回这台设备改的那版（先存在这台设备上，能读到酒馆那份时再传进去）。' : '已换回，但这台设备存不下。';
        }
    });
    listen(file, 'change', async () => {
        const picked = file.files?.[0];
        file.value = '';
        if (!picked) return;
        if (picked.size > MAX_CHARS * 2) { status.textContent = '文件太大了，没有导入。'; return; }
        try {
            area.value = (await picked.text()).slice(0, MAX_CHARS);
            current.name = picked.name.replace(/\.(css|txt)$/i, '').slice(0, 80);
            enabled.checked = true;
            commit(`已导入「${picked.name}」并应用。`);
        } catch { status.textContent = '这个文件读不出来。'; }
    });
    return box;
}
