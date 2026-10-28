const MUTE_KEY = 'rabbit_mirror_startup_guard_mute:v1';
const SELF_URL = String(import.meta.url || '');
const RUNTIME_VERSION = (/[?&]rmv=([^&#]+)/.exec(SELF_URL) || [])[1] || '';
const BASE_URL = SELF_URL.replace(/[?#].*$/, '').replace(/src\/startupGuard\.js$/, '');
const EXTENSION_PATH_RE = /\/scripts\/extensions\/(third-party\/)?([^/?#:\s)]+)\//g;
const SELF_FOLDER = folderOf(BASE_URL);
const PATH_FROM_BASE = (() => { try {
    return new URL(BASE_URL).pathname;
}
catch {
    return BASE_URL;
} })();
const steps = [];
const reportedFailures = new Set();
let evaluated = false;
let disposed = false;
let opener = null;
let evalErrorTimer = 0;
let evalWindowTimer = 0;
const activeToasts = new Set();
let commandAvailable = false;
const nameCache = new Map();
function folderOf(url) {
    EXTENSION_PATH_RE.lastIndex = 0;
    const match = EXTENSION_PATH_RE.exec(String(url || ''));
    return match ? `${match[1] ? 'third-party/' : ''}${match[2]}` : '';
}
function isOwnUrl(text) {
    const value = String(text || '');
    return !!value && (value.includes(BASE_URL) || (!!PATH_FROM_BASE && PATH_FROM_BASE !== '/' && value.includes(PATH_FROM_BASE)));
}
export function foreignExtensionsInStack(stack) {
    const found = [];
    EXTENSION_PATH_RE.lastIndex = 0;
    const text = String(stack || '');
    let match;
    while ((match = EXTENSION_PATH_RE.exec(text))) {
        const folder = `${match[1] ? 'third-party/' : ''}${match[2]}`;
        if (folder === SELF_FOLDER || !match[1] || found.includes(folder))
            continue;
        found.push(folder);
    }
    return found;
}
function shortPath(text) {
    return String(text || '')
        .split(BASE_URL).join('兔子镜/')
        .replace(/(?:https?|tauri|app|file|blob|asset):\/\/[^\s)]*?\/scripts\/extensions\//g, 'extensions/')
        .replace(/(?:https?|tauri|app|file|blob|asset):\/\/[^/\s)]*/g, '');
}
function maskQuoted(text) {
    return String(text || '').replace(/"[^\n]*"/g, '"…"').replace(/'[^'\n]{9,400}'/g, "'…'").slice(0, 400);
}
function errorText(error) {
    if (error instanceof Error)
        return maskQuoted(`${error.name || 'Error'}: ${error.message || ''}`.trim().replace(/\s*\n\s*/g, ' '));
    if (error && typeof error === 'object' && 'message' in error)
        return maskQuoted(String(error.message));
    return maskQuoted(String(error ?? '未知错误'));
}
function errorStack(error) {
    const stack = error instanceof Error ? String(error.stack || '') : '';
    return stack.split('\n').slice(0, 14).map(line => (/^\s*at\s|@\S+:\d+/.test(line) ? line : maskQuoted(line))).join('\n');
}
function readMuted() {
    try {
        const list = JSON.parse(globalThis.localStorage?.getItem(MUTE_KEY) || '[]');
        return Array.isArray(list) ? list : [];
    }
    catch {
        return [];
    }
}
function isMuted(signature) { return readMuted().includes(signature); }
function mute(signature) {
    try {
        const list = readMuted().filter(item => item !== signature);
        list.push(signature);
        globalThis.localStorage?.setItem(MUTE_KEY, JSON.stringify(list.slice(-30)));
    }
    catch { }
}
async function displayNameOf(folder) {
    if (nameCache.has(folder))
        return nameCache.get(folder);
    let name = folder.replace(/^third-party\//, '');
    try {
        name = decodeURIComponent(name);
    }
    catch { }
    const display = String((await readManifest(folder))?.display_name || '').trim();
    if (display)
        name = display;
    nameCache.set(folder, name);
    return name;
}
function loadedExtensionFolders() {
    const folders = new Set();
    try {
        for (const node of document.querySelectorAll('script[src*="/scripts/extensions/"], link[href*="/scripts/extensions/"]')) {
            const folder = folderOf(node.src || node.href);
            if (folder.startsWith('third-party/'))
                folders.add(folder);
        }
    }
    catch { }
    return [...folders];
}
export function otherRabbitMirrorInstalls() {
    const others = new Set();
    try {
        for (const node of document.querySelectorAll('script[src*="/scripts/extensions/third-party/"]')) {
            const src = node.src || '';
            if (!/\/index\.js\?rmv=/.test(src))
                continue;
            const folder = folderOf(src);
            if (folder && folder !== SELF_FOLDER)
                others.add(folder);
        }
    }
    catch { }
    return [...others];
}
const manifestCache = new Map();
async function readManifest(folder) {
    if (manifestCache.has(folder))
        return manifestCache.get(folder);
    let manifest = null;
    try {
        const at = BASE_URL.indexOf('/scripts/extensions/');
        if (at >= 0) {
            const base = BASE_URL.slice(0, at + '/scripts/extensions/'.length);
            const controller = typeof AbortController === 'function' ? new AbortController() : null;
            const timer = setTimeout(() => controller?.abort(), 2500);
            const response = await fetch(`${base}${folder}/manifest.json`, { cache: 'no-store', signal: controller?.signal });
            clearTimeout(timer);
            if (response.ok)
                manifest = await response.json();
        }
    }
    catch { }
    manifestCache.set(folder, manifest);
    return manifest;
}
function hostLabel() {
    if (globalThis.__TAURITAVERN__)
        return 'TauriTavern';
    return globalThis.SillyTavern ? 'SillyTavern' : '未知宿主';
}
export function buildRabbitMirrorStartupDiagnostic(extra = '') {
    const lines = [];
    lines.push(`兔子镜启动自检 ${RUNTIME_VERSION} ${new Date().toISOString()}`);
    lines.push(`宿主=${hostLabel()} 安装文件夹=${SELF_FOLDER || shortPath(BASE_URL) || '-'}`);
    try {
        lines.push(`浏览器=${navigator.userAgent}`);
    }
    catch { }
    try {
        lines.push(`窗口=${innerWidth}x${innerHeight} 触屏=${matchMedia('(pointer: coarse)').matches ? '是' : '否'}`);
    }
    catch { }
    lines.push('（不含聊天内容和设置内容）');
    lines.push('');
    lines.push('启动步骤：');
    if (!steps.length)
        lines.push('  （启动文件没有跑到第一步）');
    steps.forEach((step, index) => lines.push(`  ${index + 1}. ${step.label}：${step.ok ? '好' : `没成功 —— ${shortPath(step.error)}`}`));
    const others = otherRabbitMirrorInstalls();
    if (others.length)
        lines.push(`入口写法像兔子镜的其他扩展（没核实）：${others.join("、")}`);
    lines.push('');
    lines.push(`这次页面里加载了的第三方扩展（${loadedExtensionFolders().length}）：`);
    lines.push(`  ${loadedExtensionFolders().map(item => { const name = item.replace(/^third-party\//, ''); try {
        return decodeURIComponent(name);
    }
    catch {
        return name;
    } }).join('、') || '（没读到）'}`);
    const entry = document.getElementById('rabbit_mirror_wand_entry') || document.getElementById('rabbit_mirror_wand_bootstrap');
    lines.push(`魔法棒菜单=${document.getElementById('extensionsMenu') ? '有' : '没有'} 兔子镜入口=${entry ? (entry.isConnected ? '在' : '不在页面上') : '没有'} 设置界面=${document.getElementById('rabbit_mirror_theater_settings') ? '已挂上' : '没挂上'}`);
    if (extra) {
        lines.push('');
        lines.push(shortPath(extra));
    }
    return lines.join('\n');
}
async function copyText(text, host = document.body) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    }
    catch { }
    try {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;font-size:16px';
        (host || document.body).append(area);
        area.focus({ preventScroll: true });
        area.select();
        area.setSelectionRange(0, text.length);
        const ok = document.execCommand('copy');
        area.remove();
        return ok;
    }
    catch {
        return false;
    }
}
function closeToast(toast) {
    if (!toast)
        return;
    activeToasts.delete(toast);
    try {
        if (globalThis.toastr?.clear && toast.jquery)
            globalThis.toastr.clear(toast, { force: true });
    }
    catch { }
    try {
        (toast.jquery ? toast[0] : toast)?.remove?.();
    }
    catch { }
}
function closeAllToasts() { for (const toast of [...activeToasts])
    closeToast(toast); }
function fallbackStack() {
    let stack = document.querySelector('[data-rm-startup-notice-stack]');
    if (stack)
        return stack;
    stack = document.createElement('div');
    stack.dataset.rmStartupNoticeStack = 'true';
    stack.style.cssText = 'position:fixed;left:12px;right:12px;top:12px;z-index:2147483000;max-width:420px;margin:0 auto;display:flex;flex-direction:column;gap:8px;pointer-events:none';
    document.body.append(stack);
    return stack;
}
function showNotice({ title, lines, actions }) {
    if (disposed || typeof document === 'undefined' || !document.body)
        return null;
    const body = document.createElement('div');
    body.className = 'rabbit-mirror-startup-notice';
    body.style.cssText = 'line-height:1.5;overflow-wrap:anywhere';
    for (const text of lines.filter(Boolean)) {
        const p = document.createElement('div');
        p.textContent = text;
        p.style.margin = '0 0 4px';
        body.append(p);
    }
    const status = document.createElement('div');
    status.setAttribute('role', 'status');
    status.style.cssText = 'min-height:0;font-size:.9em;opacity:.85';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:6px';
    let toast = null;
    for (const action of actions) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = action.label;
        button.dataset.rmStartupAction = action.id;
        button.style.cssText = 'min-height:36px;padding:4px 10px;border-radius:8px;border:1px solid currentColor;background:transparent;color:inherit;font:inherit;cursor:pointer;touch-action:manipulation';
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            const keep = await action.run({ status });
            if (keep !== true)
                closeToast(toast);
        });
        row.append(button);
    }
    body.append(row, status);
    const toastr = globalThis.toastr;
    if (typeof toastr?.warning === 'function') {
        try {
            toast = toastr.warning(' ', title, { timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false, preventDuplicates: false, escapeHtml: true });
            const message = toast?.find?.('.toast-message');
            if (message?.length) {
                message.empty().append(body);
                activeToasts.add(toast);
                return toast;
            }
            try {
                toast?.remove?.();
            }
            catch { }
        }
        catch { }
    }
    const box = document.createElement('div');
    box.dataset.rmStartupNotice = 'true';
    box.setAttribute('role', 'alert');
    box.style.cssText = 'pointer-events:auto;padding:12px 14px;border-radius:12px;background:#3b2f1d;color:#fff4e0;box-shadow:0 6px 24px rgba(0,0,0,.35);font:14px/1.5 system-ui,sans-serif';
    const head = document.createElement('div');
    head.style.cssText = 'display:flex;justify-content:space-between;gap:8px;font-weight:700;margin-bottom:4px';
    const strong = document.createElement('span');
    strong.textContent = title;
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', '关闭');
    close.style.cssText = 'border:0;background:transparent;color:inherit;font-size:20px;line-height:1;cursor:pointer;min-width:32px;min-height:32px';
    close.addEventListener('click', () => closeToast(toast));
    head.append(strong, close);
    box.append(head, body);
    fallbackStack().append(box);
    toast = box;
    activeToasts.add(box);
    return box;
}
const copyAction = (extra = '') => ({
    id: 'copy',
    label: '复制诊断',
    run: async ({ status }) => {
        const text = buildRabbitMirrorStartupDiagnostic(extra);
        const ok = await copyText(text, status.parentElement);
        if (ok) {
            status.textContent = '已复制，发给作者就行。';
            return true;
        }
        status.textContent = '这台设备不让网页直接复制。长按下面的框全选，再复制：';
        let box = status.parentElement?.querySelector('textarea[data-rm-startup-diagnostic]');
        if (!box) {
            box = document.createElement('textarea');
            box.dataset.rmStartupDiagnostic = 'true';
            box.readOnly = true;
            box.rows = 6;
            box.style.cssText = 'display:block;width:100%;box-sizing:border-box;margin-top:4px;font:12px/1.4 monospace;color:inherit;background:rgba(0,0,0,.25);border:1px solid currentColor;border-radius:6px';
            status.after(box);
        }
        box.value = text;
        return true;
    },
});
const openAction = () => (opener ? {
    id: 'open',
    label: '打开兔子镜设置',
    run: async ({ status }) => {
        status.textContent = '正在打开…';
        try {
            await opener('startup-notice');
            return false;
        }
        catch (error) {
            status.textContent = `没打开：${errorText(error)}`;
            return true;
        }
    },
} : null);
const closeAction = { id: 'close', label: '关闭', run: async () => false };
const muteAction = signature => ({ id: 'mute', label: '不再提醒', run: async () => { mute(signature); return false; } });
export function setRabbitMirrorStartupOpener(fn) { opener = typeof fn === 'function' ? fn : null; }
export function setRabbitMirrorOpenCommandAvailable(value) { commandAvailable = value === true; }
const COMMAND_HINT = '以后找不到入口，在聊天输入框打 /兔子镜 回车。';
export function markRabbitMirrorBootstrapEvaluated() {
    if (evaluated)
        return;
    evaluated = true;
    steps.push({ label: '启动文件跑完', ok: true });
    removeEvalListeners();
}
export function runRabbitMirrorStartupStep(label, fn) {
    try {
        const result = fn();
        steps.push({ label, ok: true });
        return result;
    }
    catch (error) {
        reportRabbitMirrorStartupFailure(label, error);
        return undefined;
    }
}
const LOAD_FAILURE_RE = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Failed to load module script|NetworkError when attempting to fetch/i;
export function reportRabbitMirrorStartupFailure(label, error, { quiet = false, canOpen = evaluated, opening = false } = {}) {
    const message = errorText(error);
    const stack = errorStack(error);
    console.warn(`[RabbitMirror] 启动自检：${label} 没成功`, error);
    const existing = steps.find(step => step.label === label && !step.ok);
    if (!existing)
        steps.push({ label, ok: false, error: message });
    const signature = `${message}\u0000${stack.split('\n').find(line => /\bat\b|@/.test(line)) || ''}`;
    if (quiet || reportedFailures.has(signature) || disposed)
        return;
    reportedFailures.add(signature);
    const stepNumber = steps.findIndex(step => step.label === label && !step.ok) + 1;
    const foreign = foreignExtensionsInStack(`${stack}\n${error?.fileName || ''}`);
    void Promise.all(foreign.slice(0, 3).map(displayNameOf)).then(names => {
        const culprit = LOAD_FAILURE_RE.test(message)
            ? '是兔子镜的文件没下载下来（网络不稳，或者更新后还没刷新）。刷新网页再试；一直这样就重新更新一次兔子镜。'
            : names.length
                ? `报错经过了「${names.join('」「')}」的代码，可能和${names.length > 1 ? '它们' : '它'}冲突。可以先在「管理扩展」里暂时关掉${names.length > 1 ? '它们' : '它'}，刷新网页再看兔子镜。`
                : stack ? '报错里没看到别的插件的代码，点「复制诊断」发给作者就行。'
                    : '看不出是哪里出的错，点「复制诊断」发给作者就行。';
        const hint = canOpen && commandAvailable ? '魔法棒里找不到兔子镜时，可以在聊天输入框打 /兔子镜 回车。' : '';
        const what = shortPath(message).slice(0, 160);
        showNotice({
            title: opening ? '兔子镜打不开' : '兔子镜启动出错',
            lines: [opening ? `${label}没成功：${what}` : `第 ${stepNumber} 步「${label}」没成功：${what}`, culprit, hint],
            actions: [copyAction(`报错位置：\n${stack || message}`), canOpen ? openAction() : null, closeAction].filter(Boolean),
        });
    });
}
function onWindowError(event) {
    const error = event?.error;
    const where = `${event?.filename || ''}\n${errorStack(error)}`;
    if (!isOwnUrl(where))
        return;
    const ownFrame = errorStack(error).split('\n').find(line => isOwnUrl(line)) || (isOwnUrl(event?.filename) ? event.filename : '');
    const ownFile = (/(?:https?|tauri|app|file):\/\/[^\s)]+?\.js/.exec(ownFrame) || [])[0] || '';
    pendingEvalError ??= { error: error || new Error(String(event?.message || '加载出错')), file: ownFile };
    clearTimeout(evalErrorTimer);
    evalErrorTimer = setTimeout(flushEvalError, 1500);
}
let pendingEvalError = null;
function flushEvalError() {
    evalErrorTimer = 0;
    const pending = pendingEvalError;
    pendingEvalError = null;
    if (!pending || evaluated || disposed)
        return;
    const file = shortPath(pending.file).replace(/\?.*$/, '');
    reportRabbitMirrorStartupFailure(`加载启动文件${file ? `（${file}）` : ''}`, pending.error);
}
function removeEvalListeners() {
    try {
        globalThis.removeEventListener?.('error', onWindowError);
    }
    catch { }
    clearTimeout(evalWindowTimer);
    evalWindowTimer = 0;
    if (evaluated) {
        clearTimeout(evalErrorTimer);
        evalErrorTimer = 0;
        pendingEvalError = null;
    }
}
export const BOOT_MARK_ATTRIBUTE = 'data-rabbit-mirror-boot';
try {
    document?.documentElement?.setAttribute?.(BOOT_MARK_ATTRIBUTE, RUNTIME_VERSION || '1');
}
catch { }
if (typeof globalThis.addEventListener === 'function' && typeof document !== 'undefined') {
    globalThis.addEventListener('error', onWindowError);
    evalWindowTimer = setTimeout(removeEvalListeners, 30000);
}
function hiddenBy(node) {
    if (!node || node.nodeType !== 1)
        return null;
    if (node.hidden)
        return { node, prop: 'hidden', inline: true };
    if (node.classList?.contains('displayNone'))
        return { node, prop: 'displayNone', inline: true };
    const style = globalThis.getComputedStyle?.(node);
    if (!style)
        return null;
    if (style.display === 'none')
        return { node, prop: 'display', inline: node.style?.display === 'none' };
    if (style.visibility === 'hidden' || style.visibility === 'collapse') {
        const parent = node.parentElement && globalThis.getComputedStyle?.(node.parentElement);
        if (parent && parent.visibility !== 'visible')
            return null;
        return { node, prop: 'visibility', inline: /hidden|collapse/.test(node.style?.visibility || '') };
    }
    if (Number(style.opacity) === 0)
        return { node, prop: 'opacity', inline: node.style?.opacity === '0' };
    return null;
}
function ruleHides(rule, prop) {
    const style = rule.style;
    if (!style)
        return false;
    if (prop === 'display')
        return style.getPropertyValue('display').trim() === 'none';
    if (prop === 'visibility')
        return /hidden|collapse/.test(style.getPropertyValue('visibility'));
    if (prop === 'opacity')
        return style.getPropertyValue('opacity').trim() === '0';
    return false;
}
function* walkRules(rules) {
    for (const rule of rules || []) {
        if (rule.selectorText !== undefined)
            yield rule;
        if (rule.cssRules)
            yield* walkRules(rule.cssRules);
    }
}
export function findHidingStylesheet(node, prop) {
    const hits = [];
    for (const sheet of document.styleSheets || []) {
        let rules;
        try {
            rules = sheet.cssRules;
        }
        catch {
            continue;
        }
        for (const rule of walkRules(rules)) {
            if (!ruleHides(rule, prop))
                continue;
            let matches = false;
            try {
                matches = node.matches(rule.selectorText);
            }
            catch { }
            if (!matches)
                continue;
            const href = sheet.href || '';
            const owner = sheet.ownerNode;
            hits.push({
                folder: folderOf(href),
                own: isOwnUrl(href),
                source: href ? shortPath(href).replace(/\?.*$/, '') : `页面里的 <style${owner?.id ? ` id="${owner.id}"` : ''}>`,
                userCss: !href && owner?.id === 'custom-style',
                selector: String(rule.selectorText).slice(0, 160),
            });
        }
    }
    return hits.filter(hit => !hit.own);
}
function wandEntry() {
    return document.getElementById('rabbit_mirror_wand_entry') || document.getElementById('rabbit_mirror_wand_bootstrap');
}
function visibleNow(node) {
    try {
        return !!node && node.getClientRects().length > 0;
    }
    catch {
        return false;
    }
}
export async function checkRabbitMirrorEntryVisibility({ menuOpen = false } = {}) {
    if (disposed || typeof document === 'undefined')
        return null;
    const menu = document.getElementById('extensionsMenu');
    if (!menu)
        return null;
    if (menuOpen && !visibleNow(menu))
        return null;
    const entry = wandEntry();
    if (!entry)
        return notifyHidden({ kind: 'removed', culprits: [], detail: '入口不在页面上' });
    if (!entry.isConnected)
        return notifyHidden({ kind: 'removed', culprits: [], detail: '入口不在页面上' });
    if (!menu.contains(entry))
        return { ok: true, moved: true };
    const hit = hiddenBy(entry);
    if (!hit)
        return { ok: true };
    const sheets = hit.prop === 'display' || hit.prop === 'visibility' || hit.prop === 'opacity' ? findHidingStylesheet(hit.node, hit.prop) : [];
    const folders = [...new Set(sheets.map(item => item.folder).filter(folder => folder.startsWith('third-party/') && folder !== SELF_FOLDER))];
    const userCss = !folders.length && sheets.some(item => item.userCss);
    const detail = sheets.length
        ? sheets.slice(0, 4).map(item => `${item.source} → ${item.selector}`).join('\n')
        : `${hit.inline ? '节点上直接写了隐藏（脚本改的）' : '看不出来源'}：${hit.prop}`;
    return notifyHidden({ kind: userCss ? 'user-css' : sheets.length ? 'stylesheet' : 'script', culprits: folders, detail, styleSources: sheets.map(item => item.source) });
}
async function notifyHidden({ kind, culprits, detail, styleSources = [] }) {
    const signature = `hidden:${kind}:${culprits.join(',') || styleSources[0] || '-'}`;
    const result = { ok: false, kind, culprits, detail, signature };
    if (isMuted(signature) || reportedFailures.has(signature))
        return result;
    reportedFailures.add(signature);
    const names = await Promise.all(culprits.slice(0, 3).map(displayNameOf));
    const cause = names.length
        ? `是「${names.join('」「')}」的样式把它藏了。`
        : kind === 'user-css' ? '是「用户设置 → 自定义 CSS」或美化主题里的样式把它藏了。'
            : kind === 'stylesheet' ? `是一段页面样式把它藏了（${styleSources[0] || '来源不明'}），看不出是哪个插件加的。`
                : kind === 'removed' ? '入口被别的插件从页面上拿掉了，看不出是哪个。'
                    : '是别的插件用脚本藏的，看不出是哪个。';
    showNotice({
        title: '兔子镜',
        lines: [
            '魔法棒里的兔子镜入口被藏起来了。',
            cause,
            `${kind === 'user-css' ? '如果是你故意写的' : '如果是你自己在那个插件里关掉的'}，点「不再提醒」。${commandAvailable ? COMMAND_HINT : ''}`,
        ],
        actions: [openAction(), copyAction(`入口检测：${detail}`), muteAction(signature), closeAction].filter(Boolean),
    });
    return result;
}
export async function checkRabbitMirrorDuplicateInstall() {
    if (disposed)
        return null;
    const candidates = otherRabbitMirrorInstalls();
    const manifests = await Promise.all(candidates.map(readManifest));
    const others = candidates.filter((_, index) => manifests[index]?.generate_interceptor === 'rabbitMirrorGenerateInterceptor');
    if (disposed || !others.length)
        return { ok: true };
    const signature = `duplicate:${[SELF_FOLDER, ...others].sort().join(',')}`;
    const shown = (globalThis.__rabbitMirrorStartupNoticesShown ??= new Set());
    if (isMuted(signature) || reportedFailures.has(signature) || shown.has(signature))
        return { ok: false, others };
    reportedFailures.add(signature);
    shown.add(signature);
    const folders = [SELF_FOLDER, ...others].filter(Boolean).map(item => { const name = item.replace(/^third-party\//, ''); try {
        return decodeURIComponent(name);
    }
    catch {
        return name;
    } });
    showNotice({
        title: '兔子镜',
        lines: [
            `检测到同时开着 ${folders.length} 份兔子镜（文件夹：${folders.join('、')}）。`,
            '两份一起开会互相抢着处理同一层，常见表现是重复、闪烁或者不显示。请在「管理扩展」里只留一份勾着，刷新网页。',
        ],
        actions: [copyAction(`重复安装：${folders.join('、')}`), muteAction(signature), closeAction],
    });
    return { ok: false, others };
}
export function disposeRabbitMirrorStartupGuard() {
    disposed = true;
    removeEvalListeners();
    clearTimeout(evalErrorTimer);
    evalErrorTimer = 0;
    closeAllToasts();
    opener = null;
}
export const startupGuardForTests = {
    shortPath,
    errorText,
    errorStack,
    steps,
    reset() { steps.length = 0; reportedFailures.clear(); evaluated = false; disposed = false; closeAllToasts(); },
    get selfFolder() { return SELF_FOLDER; },
    get baseUrl() { return BASE_URL; },
    muteKey: MUTE_KEY,
};
