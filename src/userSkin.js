// 用户美化：用户自己写或导入一段 CSS，改兔子镜的设置界面、工具弹窗和外置框（含外置标题框）。
// 只是一段样式，不跑脚本、不进提示词、不改模型写的画面；保存在这台设备上（和「主题与外观」的配色一样）。
// 兔子镜承诺下面 SKIN_HOOKS 里这些名字以后不改，美化照着写，更新了也不会失效。

import { getSettings, updateSettings } from './settings.js?rmv=1.70.0';

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
// 本机记下「上次和酒馆对上的是哪一版」（synced）、「有没有还没传上去的改动」（dirty）和「这份是什么时候改的」（editedAt）。
//   本机有没传上去的改动：酒馆那份自从上次对上以后没变过，或者比本机这次改动还早 → 传上去；
//                       别的设备在本机这次改动之后又存过 → 本机这份作废，换上酒馆那份（最后改的说了算）。
//   本机没改过、酒馆那份换了（别的设备存了新的）→ 换上酒馆那份。
//   1.70 以前留下的本机美化（没有这些记号）：和酒馆那份一样就算对上；不一样就这台设备继续用自己的（pinned），
//                       不传、也不被别的设备的改动换掉，等用户在这台设备上存一次再正常同步。
// 只是打开页面不会拿本机的旧美化盖掉别的设备存的。
let backupTimer = 0;
let backupChain = null;
let backupValue = null;
let scheduledFingerprint = '';
// 本机存不下（隐私模式、存满了）时，这次打开页面用的那份。
let restoredValue = null;
// 这次打开页面后用户自己存过：从酒馆读回来的不能再盖掉它（本机存不下时也算数）。
let savedSinceLoad = false;
// 本机是空的、还没确认酒馆里有没有：这时存一份空美化不存、不传，免得把酒馆那份清掉。
let restorePending = false;

function readLocalRecord() {
    try { const value = JSON.parse(globalThis.localStorage?.getItem(USER_SKIN_STORAGE_KEY) || 'null'); return value && typeof value === 'object' ? value : null; } catch { return null; }
}
function writeLocalRecord(value, meta) {
    try { globalThis.localStorage.setItem(USER_SKIN_STORAGE_KEY, JSON.stringify({ ...normalizeSkin(value), ...meta })); return true; } catch { return false; }
}
function dropLocalRecord() {
    try { globalThis.localStorage?.removeItem(USER_SKIN_STORAGE_KEY); } catch { /* 删不掉就算了 */ }
}

function writeServerCopy(value) {
    // 存不进文件时的老办法：不太大的整份放进设置里。
    // 酒馆里已经有文件记号（存文件这条路是通的，这次只是没传上）：不动它，免得盖掉别的设备留的记号；本机留着改动下次再传。
    if (serverCopy()?.file) return;
    try { updateSettings({ userSkin: value.css.length <= SERVER_COPY_MAX ? value : { ...value, css: '', tooLarge: true } }); } catch { /* 下次再说 */ }
}

async function runBackup() {
    const job = backupValue;
    backupValue = null;
    if (!job) return;
    const { value, fromServer } = job;
    const fingerprint = userSkinFingerprint(value);
    try {
        await uploadSkinFile(value);
        updateSettings({ userSkin: { file: USER_SKIN_FILE_NAME, fingerprint, enabled: value.enabled, name: value.name, length: value.css.length, editedAt: Number(value.editedAt) || 0, savedAt: Date.now() } });
        // 本机这份就是刚传上去的（中途没再改）：记下已经对上了。
        const local = readLocalRecord();
        if (local && userSkinFingerprint(normalizeSkin(local)) === fingerprint) writeLocalRecord(local, { dirty: false, synced: fingerprint, editedAt: Number(local.editedAt) || 0 });
    } catch (error) {
        // 挪旧备份时传不上：设置里那份原样留着，下次再挪。
        if (!fromServer) writeServerCopy(value);
        console.warn('[RabbitMirror] 美化没能存成酒馆文件', error);
    }
}

function startBackup() {
    const next = (backupChain || Promise.resolve()).then(runBackup, runBackup);
    backupChain = next;
    next.finally(() => { if (backupChain === next) backupChain = null; });
    return next;
}

/** 稍等一会儿把美化存进酒馆文件（打字时不会每停一下就传一次）；存好后设置里只留记号。 */
function scheduleUserSkinBackup(value, { fromServer = false } = {}) {
    const normalized = { ...normalizeSkin(value), editedAt: Number(value?.editedAt) || 0 };
    backupValue = { value: normalized, fromServer };
    scheduledFingerprint = userSkinFingerprint(normalized);
    if (backupTimer) globalThis.clearTimeout(backupTimer);
    backupTimer = globalThis.setTimeout(() => { backupTimer = 0; startBackup(); }, FILE_SAVE_DELAY_MS);
}

/** 马上把等着的那次存掉（测试用）。 */
export async function flushUserSkinBackup() {
    if (backupTimer) { globalThis.clearTimeout(backupTimer); backupTimer = 0; startBackup(); }
    while (backupChain) await backupChain;
    if (restoring) await restoring;
}

let restoring = null;
// 把酒馆里那份读回来换上。酒馆文件就是最后传上去的那一版，设置里的记号可能晚一步（别的页面整份保存设置时写回了旧记号），
// 所以以文件为准，不拿记号卡它。
function restoreFromFile(doc) {
    if (restoring) return restoring;
    const before = readLocalRecord();
    const beforeFingerprint = before ? userSkinFingerprint(normalizeSkin(before)) : '';
    restoring = readUserSkinFile().then(file => {
        restorePending = false;
        if (savedSinceLoad) return null;
        const now = readLocalRecord();
        const nowFingerprint = now ? userSkinFingerprint(normalizeSkin(now)) : '';
        // 读文件的这一会儿本机变了（用户存了新的、别的标签页改了）：不盖掉。
        if (nowFingerprint !== beforeFingerprint || (now?.dirty && !before?.dirty)) return null;
        if (!file) {
            // 酒馆里确实没有：本机空着就记一笔，下次开页不用再问。
            if (!now) writeLocalRecord(normalizeSkin(null), { dirty: false, synced: '', editedAt: 0 });
            return null;
        }
        const fingerprint = userSkinFingerprint(file);
        if (fingerprint === nowFingerprint) { writeLocalRecord(file, { dirty: false, synced: fingerprint, editedAt: file.editedAt }); return null; }
        // 本机有没传上去的改动、而且比酒馆那份改得晚：留本机的，交给上传。
        if (now?.dirty && (Number(now.editedAt) || 0) >= file.editedAt) return null;
        if (!writeLocalRecord(file, { dirty: false, synced: fingerprint, editedAt: file.editedAt })) dropLocalRecord();
        const value = normalizeSkin(file);
        restoredValue = value;
        applyUserSkin(doc, value);
        try { globalThis.dispatchEvent?.(new CustomEvent('rabbitmirror:user-skin-restored', { detail: value })); } catch { /* 只是通知设置界面 */ }
        return value;
    }, error => {
        // 设置里根本没有记号（从没存过美化）、宿主对不存在的文件回了一个网页：就当酒馆里没有，记一笔，下次不再问。
        if (error?.notSkinFile && !serverCopy()?.file) {
            restorePending = false;
            if (!readLocalRecord() && !savedSinceLoad) writeLocalRecord(normalizeSkin(null), { dirty: false, synced: '', editedAt: 0 });
            return null;
        }
        // 读失败（网络、服务器出错、有记号却读回来不是这个文件）：这次不换，下次打开设置或刷新页面再试；期间存空美化照样不存不传。
        restoring = null;
        return null;
    });
    return restoring;
}

export function readUserSkin() {
    const local = readLocalRecord();
    const remote = serverCopy();
    if (local) {
        const value = normalizeSkin(local);
        const fingerprint = userSkinFingerprint(value);
        const remoteChanged = !!(remote?.file && remote.fingerprint && remote.fingerprint !== local.synced);
        if (local.pinned) {
            // 1.70 以前留下、和酒馆不一样的：这台设备继续用自己的，不传也不换，等用户在这里存一次。
        } else if (local.dirty) {
            // 上次改了还没传上去。酒馆那份这期间被别的设备换过：比一比谁改得晚，酒馆的晚就换上酒馆的，本机的晚才传。
            if (remoteChanged) void restoreFromFile(globalThis.document);
            if (fingerprint !== scheduledFingerprint && !(remoteChanged && (Number(remote.editedAt) || 0) > (Number(local.editedAt) || 0))) scheduleUserSkinBackup({ ...value, editedAt: local.editedAt });
        } else if (!('synced' in local)) {
            // 1.70 以前留下的：和酒馆那份一样就算对上；不一样就这台设备继续用自己的。旧备份（整份在设置里）挪进文件；酒馆里什么都没有就传本机这份。
            if (remote?.file) writeLocalRecord(local, fingerprint === remote.fingerprint ? { dirty: false, synced: fingerprint } : { dirty: false, synced: String(remote.fingerprint || ''), pinned: true });
            else if (typeof remote?.css === 'string' && remote.css) {
                const old = normalizeSkin(remote);
                const oldFingerprint = userSkinFingerprint(old);
                writeLocalRecord(local, oldFingerprint === fingerprint ? { dirty: false, synced: oldFingerprint } : { dirty: false, synced: oldFingerprint, pinned: true });
                if (oldFingerprint !== scheduledFingerprint) scheduleUserSkinBackup(old, { fromServer: true });
            } else if (value.css && fingerprint !== scheduledFingerprint) {
                const editedAt = Date.now();
                writeLocalRecord(local, { dirty: true, editedAt });
                scheduleUserSkinBackup({ ...value, editedAt });
            }
        } else if (remoteChanged) {
            // 别的设备存了新的：拿过来换上（读回来之前先照本机的显示）。
            void restoreFromFile(globalThis.document);
        }
        return value;
    }
    if (restoredValue) return restoredValue;
    // 旧备份（整份 CSS 在设置里），或存文件失败时退回的那份：找回、补回本机，没有文件的再挪进文件。
    if (typeof remote?.css === 'string' && remote.css && !remote.file) {
        const value = normalizeSkin(remote);
        const fingerprint = userSkinFingerprint(value);
        if (!writeLocalRecord(value, { dirty: false, synced: fingerprint })) restoredValue = value;
        if (fingerprint !== scheduledFingerprint) scheduleUserSkinBackup(value, { fromServer: true });
        return value;
    }
    // 本机是空的：去酒馆读那份文件（设置里没有记号也读一次，比如点过「恢复默认设置」把记号清了）。读到了再换上，开页那一下先不显示美化。
    restorePending = true;
    void restoreFromFile(globalThis.document);
    return normalizeSkin(null);
}

/** 保存；存不下（太大、隐私模式）返回 false，但当前页面照样换上。 */
export function saveUserSkin(skin) {
    const value = { enabled: skin?.enabled === true, css: String(skin?.css || '').slice(0, MAX_CHARS), name: String(skin?.name || '').slice(0, 80) };
    applyUserSkin(globalThis.document, value);
    // 本机是空的、酒馆那份还没读回来（或读失败了），而这次存的是空的：多半是用户以为美化丢了在点开关、点清空。
    // 只在这个页面上生效，不存、不往酒馆传，免得把酒馆里那份清掉；读回来后照样换上。
    if (restorePending && !value.css.trim()) return true;
    savedSinceLoad = true;
    restorePending = false;
    restoredValue = null;
    const editedAt = Date.now();
    const before = readLocalRecord();
    const local = writeLocalRecord(value, { dirty: true, editedAt, synced: before?.synced ?? String(serverCopy()?.fingerprint || '') });
    scheduleUserSkinBackup({ ...value, editedAt });
    if (local) return true;
    // 本机存不下（存满了、隐私模式）：本机的旧记录删掉（不然刷新后会拿旧的去盖酒馆里的新版），
    // 这次页面上照样用；酒馆那份传上去以后，刷新能找回。存不进文件的环境按老办法放进设置里。
    dropLocalRecord();
    restoredValue = value;
    writeServerCopy(value);
    return value.css.length <= SERVER_COPY_MAX || !!serverCopy()?.file;
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
<details style="margin-top:8px;"><summary style="cursor:pointer;">美化能用的名字</summary><div style="font-size:12px;line-height:1.6;margin-top:6px;">${SKIN_HOOKS.map(([label, selector]) => `<div style="margin-bottom:6px;"><div>${label}</div><code style="overflow-wrap:anywhere;user-select:all;">${selector.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></div>`).join('')}<div>颜色变量：<code style="overflow-wrap:anywhere;">${SKIN_TOKENS.join(' ')}</code></div><div style="opacity:.8;margin-top:4px;">外置框还在生成时，兔子镜会临时用它的 ::before / ::after 显示进度。</div></div></details>`;
    container.append(box);
    const enabled = box.querySelector('#rh_user_skin_enabled');
    const area = box.querySelector('#rh_user_skin_css');
    const file = box.querySelector('[data-rh-skin-file]');
    const status = box.querySelector('.rh-ui-user-skin-status');
    let current = readUserSkin();
    enabled.checked = current.enabled;
    area.value = current.css;
    let typing = 0;
    // 从酒馆里读回来一份（本机被清掉了，或别的设备存了新的）：设置界面开着时把内容换进来；打开以后已经动过的不盖。
    const view = doc.defaultView || globalThis;
    let edited = false;
    const onRestored = event => {
        if (!box.isConnected) { view.removeEventListener?.('rabbitmirror:user-skin-restored', onRestored); return; }
        if (edited || typing) return;
        current = normalizeSkin(event.detail);
        enabled.checked = current.enabled;
        area.value = current.css;
        status.textContent = '已换上酒馆里存的那份美化。';
    };
    view.addEventListener?.('rabbitmirror:user-skin-restored', onRestored);
    const commit = (message) => {
        edited = true;
        (doc.defaultView || globalThis).clearTimeout(typing);
        current = { enabled: enabled.checked, css: area.value, name: current.name };
        const saved = saveUserSkin(current);
        status.textContent = saved ? message : '美化已换上，但这台设备没能保存（可能太大或浏览器不让存），刷新后会恢复原样。';
    };
    listen(enabled, 'change', () => commit(enabled.checked ? '美化已启用。' : '美化已关闭，内容还留着。'));
    // 改文本框就自动存（停手一会儿后），不点「保存」直接关掉、导出或刷新也不会丢。开着美化时顺便换上，边写边看。
    listen(area, 'input', () => {
        edited = true;
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
