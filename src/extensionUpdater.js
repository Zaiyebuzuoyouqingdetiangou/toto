// 用户点了更新之后才动安装。检测只看当前分支；git pull 被本地改动挡住时，只有 main 才用 GitHub 覆盖。
let pending = null;
export function ownExtensionFolder(moduleUrl = import.meta.url) {
    // TauriTavern 等宿主可能在路径前加前缀，只要求末尾是 third-party/<目录>/src/extensionUpdater.js。
    const match = new URL(moduleUrl).pathname.match(/\/third-party\/([^/]+)\/src\/extensionUpdater\.js$/);
    if (!match) throw new Error('无法确认当前安装目录，未发送更新请求。请在扩展管理中检查安装。');
    const folder = decodeURIComponent(match[1]);
    if (!folder || /[\\/\u0000-\u001f]/.test(folder) || folder === '.' || folder === '..') throw new Error('安装目录无效，未发送更新请求。');
    return folder;
}
function failure(status) {
    if (status === 401 || status === 403) return '酒馆拒绝更新权限。全局安装可能需要管理员操作；此按钮不能绕过权限。';
    if (status === 404 || status === 405) return '当前酒馆没有提供此更新接口，或安装目录不存在。请使用宿主更新功能或安装包。';
    return '宿主更新失败。可能是仓库连接失败、非 Git 安装或本地文件冲突；请检查宿主日志。';
}
// 旧版没有超时：宿主的 git 拉取卡住时，按钮一直处于处理中，之后再点也没有反应。
async function fetchWithTimeout(fetchImpl, url, init, ms, label) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    let timer = 0;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
            try { controller?.abort(); } catch {}
            reject(new Error(`${label}超过 ${Math.round(ms / 1000)} 秒没有回应，已停止等待。宿主可能仍在后台拉取，请稍后刷新页面查看版本号，或检查网络 / 宿主日志。`));
        }, ms);
    });
    try {
        return await Promise.race([fetchImpl(url, controller ? { ...init, signal: controller.signal } : init), timeout]);
    } finally { clearTimeout(timer); }
}

async function hostRequestHeaders() {
    try {
        const context = globalThis.SillyTavern?.getContext?.();
        if (typeof context?.getRequestHeaders === 'function') return context.getRequestHeaders();
    } catch {}
    return (await import('../../../../../script.js')).getRequestHeaders();
}

// Explicit diagnostic only. Read the currently served installation and the
// host's registered branch; never checkout, pull, clear caches or reload here.
export async function inspectRabbitMirrorVersion({ fetchImpl = globalThis.fetch.bind(globalThis), getHeaders,
    moduleUrl = import.meta.url, pageVersion = globalThis.__rabbitMirrorRuntimeVersion,
    uiVersion, apiVersion } = {}) {
    const folder = ownExtensionFolder(moduleUrl);
    const manifestUrl = new URL('../manifest.json', moduleUrl);
    manifestUrl.searchParams.set('rm-check', String(Date.now()));
    const version = value => typeof value === 'string' && /^[0-9][\w.+-]{0,79}$/.test(value) ? value : '';
    const result = { folder, pageVersion: version(pageVersion), uiVersion: version(uiVersion),
        apiVersion: version(apiVersion), installedVersion: '', branch: '', commit: '', installType: '', warnings: [] };
    const checks = await Promise.allSettled([
        (async () => {
            const response = await fetchWithTimeout(fetchImpl, manifestUrl.href, { cache: 'no-store' }, 15000, '读取安装版本');
            if (!response.ok) throw new Error('无法读取当前安装目录的 manifest');
            const manifest = await response.json();
            result.installedVersion = version(manifest?.version);
            if (!result.installedVersion) throw new Error('安装文件未返回有效版本号');
        })(),
        (async () => {
            const discovery = await fetchWithTimeout(fetchImpl, '/api/extensions/discover', { cache: 'no-store' }, 15000, '读取扩展列表');
            if (!discovery.ok) throw new Error('宿主不支持读取安装列表');
            const entries = await discovery.json();
            const matches = Array.isArray(entries) ? entries.filter(e => e?.name === `third-party/${folder}`) : [];
            const entry = matches.find(e => e.type === 'local') || matches.find(e => e.type === 'global');
            if (!entry) throw new Error('宿主未识别当前安装目录');
            result.installType = entry.type;
            const headers = getHeaders ? await getHeaders() : await hostRequestHeaders();
            const response = await fetchWithTimeout(fetchImpl, '/api/extensions/version', {
                method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ extensionName: folder, global: entry.type === 'global' }),
            }, 15000, '读取安装分支');
            if (!response.ok) throw new Error('宿主未返回分支信息（不支持接口、非 Git 安装或仓库连接失败）');
            const info = await response.json();
            result.branch = typeof info?.currentBranchName === 'string' ? info.currentBranchName.slice(0, 160) : '';
            result.commit = /^[a-f0-9]{7,64}$/i.test(info?.currentCommitHash || '') ? info.currentCommitHash.slice(0, 12) : '';
            if (!result.branch) result.warnings.push('分支未知；可能为 ZIP 安装或宿主不提供 Git 信息');
        })(),
    ]);
    checks.forEach(check => { if (check.status === 'rejected') result.warnings.push(String(check.reason?.message || '版本读取失败')); });
    return result;
}

export function formatRabbitMirrorVersionStatus(result) {
    const show = value => value || '未知';
    const loaded = [result.pageVersion, result.uiVersion, result.apiVersion].filter(Boolean);
    const known = [...loaded, result.installedVersion].filter(Boolean);
    const mismatch = new Set(known).size > 1;
    const hint = mismatch
        ? '版本不一致。请结束生成并保存输入后整页刷新；若仍不一致，检查当前安装目录与分支。'
        : known.length === 4 ? '页面与安装文件版本一致；请核对分支是否为你更新的目标分支。' : '部分版本未能读取，暂不能确认是否一致。';
    return `页面入口：${show(result.pageVersion)}；设置模块：${show(result.uiVersion)}；生成模块：${show(result.apiVersion)}；安装文件：${show(result.installedVersion)}。安装目录：${result.folder}；分支：${show(result.branch)}${result.commit ? `（${result.commit}）` : ''}。${hint}${result.warnings.length ? ' ' + result.warnings.join('；') : ''}`;
}

export function requestRabbitMirrorUpdate({ fetchImpl = globalThis.fetch.bind(globalThis), getHeaders, moduleUrl = import.meta.url } = {}) {
    if (pending) return pending;
    pending = (async () => {
        const folder = ownExtensionFolder(moduleUrl);
        const discovery = await fetchWithTimeout(fetchImpl, '/api/extensions/discover', { cache: 'no-store' }, 20000, '读取扩展列表');
        if (!discovery.ok) throw new Error(failure(discovery.status));
        const entries = await discovery.json();
        if (!Array.isArray(entries)) throw new Error('宿主未返回有效安装列表，未发送更新请求。');
        const matches = entries.filter(e => e?.name === `third-party/${folder}` && ['local', 'global'].includes(e.type));
        // SillyTavern resolves a same-named local extension before the global one.
        const entry = matches.find(e => e.type === 'local') || matches.find(e => e.type === 'global');
        if (!entry) throw new Error('宿主未识别当前兔子镜安装，未发送更新请求。不会改动其他扩展。');
        const headers = getHeaders ? await getHeaders() : await hostRequestHeaders();
        const response = await fetchWithTimeout(fetchImpl, '/api/extensions/update', {
            method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ extensionName: folder, global: entry.type === 'global' }),
        }, 180000, '宿主更新');
        if (!response.ok) {
            let detail = '';
            try { detail = (await response.text()).trim(); } catch {}
            const error = new Error(failure(response.status));
            error.status = response.status;
            error.detail = detail;
            throw error;
        }
        const result = await response.json();
        if (typeof result?.isUpToDate !== 'boolean') throw new Error('宿主返回了未识别的更新结果，请检查扩展版本后再操作；不会自动重复更新。');
        return { status: result.isUpToDate ? 'current' : 'updated' };
    })().finally(() => { pending = null; });
    return pending;
}

// 和预设备忘录一样：只拿仓库 manifest 的版本号和当前页面比。
// 同版本内容差、本地 git dirty、远端暂时读失败都不当成「有更新」。
const HOMEPAGE = 'https://github.com/Zaiyebuzuoyouqingdetiangou/toto';
const FALLBACK_BRANCH = 'main';
const UPDATE_CHECK_THROTTLE_MS = 30_000;
const LOADED_VERSION_KEY = '__rabbitMirrorLoadedVersion';
const RELOAD_GUARD_KEY = 'rabbitMirrorReloadedVersion';

let updateCheckSequence = 0;
let lastUpdateCheckAt = 0;
let checkingPromise = null;
let reloadWatchInstalled = false;
let updateState = { status: 'idle', remoteVersion: '', remoteUrl: HOMEPAGE, remoteBranch: 'main', message: '' };
const updateListeners = new Set();

function validVersion(value) {
    return typeof value === 'string' && /^[0-9][\w.+-]{0,79}$/.test(value) ? value : '';
}

export function runningRabbitMirrorVersion() {
    return validVersion(globalThis.__rabbitMirrorRuntimeVersion);
}

export function compareRabbitMirrorVersions(a, b) {
    const parse = value => String(value || '').trim().replace(/^v/i, '').split('.').map(part => parseInt(part, 10) || 0);
    const left = parse(a);
    const right = parse(b);
    const length = Math.max(left.length, right.length);
    for (let index = 0; index < length; index += 1) {
        const delta = (left[index] ?? 0) - (right[index] ?? 0);
        if (delta) return delta;
    }
    return 0;
}

export function isNewerRabbitMirrorVersion(latest, current) {
    return compareRabbitMirrorVersions(latest, current) > 0;
}

function snapshot() {
    return { ...updateState };
}

function publish(next) {
    updateState = { ...updateState, ...next };
    for (const listener of updateListeners) {
        try { listener(snapshot()); } catch {}
    }
}

export function getRabbitMirrorUpdateSnapshot() {
    return snapshot();
}

export function subscribeRabbitMirrorUpdate(listener) {
    updateListeners.add(listener);
    return () => updateListeners.delete(listener);
}

function parseGithubRepo(remoteUrl) {
    const match = String(remoteUrl || '').trim().match(/github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?\/?$/i);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
}

function remoteFileUrl(remoteUrl, fileName, branch, cdn) {
    const parsed = parseGithubRepo(remoteUrl);
    if (!parsed) return '';
    const safeBranch = encodeURIComponent(String(branch || '').trim() || FALLBACK_BRANCH);
    const file = String(fileName || '').replace(/^\//, '');
    return cdn
        ? `https://cdn.jsdelivr.net/gh/${parsed.owner}/${parsed.repo}@${safeBranch}/${file}`
        : `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${safeBranch}/${file}`;
}

function uniqueUrls(urls) {
    return [...new Set(urls.filter(Boolean))];
}

async function readJson(response) {
    try {
        const text = (await response.text()).trim();
        if (!text || (text[0] !== '{' && text[0] !== '[')) return null;
        return JSON.parse(text);
    } catch {
        return null;
    }
}

async function fetchManifestVersionFromUrl(url, fetchImpl) {
    try {
        const response = await fetchWithTimeout(fetchImpl, `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`, { cache: 'no-store' }, 12000, '读取远程版本');
        if (!response.ok) return '';
        const data = await readJson(response);
        return validVersion(data?.version);
    } catch {
        return '';
    }
}

async function tryReadInstallInfo(moduleUrl) {
    const fn = typeof globalThis.getExtensionInstallationInfo === 'function'
        ? globalThis.getExtensionInstallationInfo
        : globalThis.TavernHelper?.getExtensionStatus;
    if (typeof fn !== 'function') return null;
    let folder = '';
    try { folder = ownExtensionFolder(moduleUrl); } catch { return null; }
    try {
        return await Promise.race([
            fn(folder),
            new Promise(resolve => { setTimeout(() => resolve(null), 5000); }),
        ]);
    } catch {
        return null;
    }
}

function currentBranchName(info) {
    return String(info?.current_branch_name || info?.currentBranchName || '').trim();
}

async function fetchRemoteManifestVersion(info, fetchImpl) {
    const branch = currentBranchName(info) || FALLBACK_BRANCH;
    const repo = info?.remote_url || info?.remoteUrl || HOMEPAGE;
    const urls = uniqueUrls([
        remoteFileUrl(repo, 'manifest.json', branch, false),
        remoteFileUrl(repo, 'manifest.json', branch, true),
    ]);
    for (const url of urls) {
        const version = await fetchManifestVersionFromUrl(url, fetchImpl);
        if (version) return version;
    }
    return '';
}

function rememberRemote(info, remoteVersion) {
    return {
        remoteVersion: remoteVersion || '',
        remoteUrl: info?.remote_url || info?.remoteUrl || HOMEPAGE,
        remoteBranch: currentBranchName(info) || FALLBACK_BRANCH,
    };
}

export async function checkRabbitMirrorUpdate({ force = false, fetchImpl = globalThis.fetch.bind(globalThis), moduleUrl = import.meta.url } = {}) {
    if (updateState.status === 'checking' && checkingPromise) return checkingPromise;
    const now = Date.now();
    if (!force && updateState.status !== 'unknown' && now - lastUpdateCheckAt < UPDATE_CHECK_THROTTLE_MS) return snapshot();
    const sequence = ++updateCheckSequence;
    lastUpdateCheckAt = now;
    publish({ status: 'checking', message: '' });
    checkingPromise = (async () => {
        try {
            const info = await tryReadInstallInfo(moduleUrl);
            const remoteVersion = await fetchRemoteManifestVersion(info, fetchImpl);
            if (sequence !== updateCheckSequence) return snapshot();
            if (!remoteVersion) {
                publish({ status: 'unknown', message: '没能读到远程版本。请检查网络后再点「检测更新」。', ...rememberRemote(info, '') });
                return snapshot();
            }
            const current = runningRabbitMirrorVersion();
            publish({
                status: isNewerRabbitMirrorVersion(remoteVersion, current) ? 'available' : 'latest',
                message: '',
                ...rememberRemote(info, remoteVersion),
            });
            return snapshot();
        } catch (error) {
            if (sequence === updateCheckSequence) {
                publish({ status: 'unknown', message: String(error?.message || '没能完成检测，请稍后再试。') });
            }
            return snapshot();
        } finally {
            checkingPromise = null;
        }
    })();
    return checkingPromise;
}

const headingPattern = /^(#{1,3})\s+v?(\d+\.\d+(?:\.\d+)*)(?:\s*[：:·\-—]\s*|\s+)(.*)$/;
const quoteHeadingPattern = /^>\s+\*\*v?(\d+\.\d+(?:\.\d+)*)(?:\s*[：:·\-—]\s*|\s+)(.+?)\*\*/;

export function parseReadmeChangelog(text) {
    const sections = [];
    let current = null;
    const push = () => {
        if (!current) return;
        const items = [];
        for (const raw of current.lines) {
            let line = raw.replace(/^\s*>\s?/, '').trim();
            if (!line || line === '---') continue;
            line = line.replace(/^[-*]\s+/, '').replace(/^\*\*(.+)\*\*$/, '$1').trim();
            if (line) items.push(line);
        }
        if (current.version || items.length) sections.push({ version: current.version, title: current.title, items });
    };
    for (const line of String(text || '').split(/\r?\n/)) {
        const heading = line.match(headingPattern);
        const quote = !heading && line.match(quoteHeadingPattern);
        if (heading || quote) {
            push();
            const version = validVersion((heading || quote)[heading ? 2 : 1]);
            const title = String((heading ? heading[3] : quote[2]) || '').replace(/\*\*/g, '').trim();
            current = { version, title, lines: [] };
            continue;
        }
        if (current) current.lines.push(line);
    }
    push();
    return sections.sort((a, b) => compareRabbitMirrorVersions(b.version, a.version));
}

async function fetchText(url, fetchImpl, label) {
    const response = await fetchWithTimeout(fetchImpl, `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`, { cache: 'no-store' }, 15000, label);
    if (!response.ok) return '';
    const text = await response.text();
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith('<')) return '';
    return text;
}

export async function loadRabbitMirrorReadme({ fetchImpl = globalThis.fetch.bind(globalThis), moduleUrl = import.meta.url, remoteUrl, remoteBranch } = {}) {
    const branch = String(remoteBranch || updateState.remoteBranch || 'main').trim() || 'main';
    const repo = remoteUrl || updateState.remoteUrl || HOMEPAGE;
    const installed = new URL('../README.md', moduleUrl);
    installed.searchParams.set('rm-check', String(Date.now()));
    const urls = uniqueUrls([
        remoteFileUrl(repo, 'README.md', branch, false),
        remoteFileUrl(repo, 'README.md', branch, true),
        installed.href,
    ]);
    for (const url of urls) {
        try {
            const text = await fetchText(url, fetchImpl, '读取更新说明');
            if (!text) continue;
            const sections = parseReadmeChangelog(text);
            if (sections.length) return { ok: true, sections };
            const items = text.trim().split(/\n+/).map(line => line.trim()).filter(Boolean).slice(0, 40);
            if (items.length) return { ok: true, sections: [{ version: '', title: 'README', items }] };
        } catch {}
    }
    return { ok: false, sections: [], message: '没能读到 README。请检查网络后再打开一次。' };
}

export function reloadTavernPage(delayMs = 800) {
    globalThis.setTimeout(() => {
        try {
            if (typeof globalThis.triggerSlash === 'function') {
                globalThis.triggerSlash('/reload-page');
                return;
            }
        } catch {}
        try { globalThis.location?.reload(); } catch {}
    }, delayMs);
}

export async function fetchInstalledManifestVersion({ fetchImpl = globalThis.fetch.bind(globalThis), moduleUrl = import.meta.url } = {}) {
    try {
        const url = new URL('../manifest.json', moduleUrl);
        url.searchParams.set('rm-check', String(Date.now()));
        const response = await fetchWithTimeout(fetchImpl, url.href, { cache: 'no-store' }, 15000, '读取安装版本');
        if (!response.ok) return '';
        const manifest = await readJson(response);
        return validVersion(manifest?.version);
    } catch {
        return '';
    }
}

export async function checkRabbitMirrorManifestBump({ silent = false, fetchImpl, moduleUrl } = {}) {
    const installed = await fetchInstalledManifestVersion({ fetchImpl, moduleUrl });
    if (!installed) return false;
    const loaded = validVersion(globalThis[LOADED_VERSION_KEY]) || runningRabbitMirrorVersion();
    if (!isNewerRabbitMirrorVersion(installed, loaded)) {
        globalThis[LOADED_VERSION_KEY] = installed;
        try { globalThis.sessionStorage?.removeItem(RELOAD_GUARD_KEY); } catch {}
        return false;
    }
    const guard = `${loaded}->${installed}`;
    try {
        if (globalThis.sessionStorage?.getItem(RELOAD_GUARD_KEY) === guard) return false;
        globalThis.sessionStorage?.setItem(RELOAD_GUARD_KEY, guard);
    } catch {}
    if (!silent) globalThis.toastr?.info?.('兔子镜已更新，正在刷新页面…', '兔子镜');
    reloadTavernPage();
    return true;
}

export function setupRabbitMirrorExtensionReloadWatch() {
    if (reloadWatchInstalled) return;
    reloadWatchInstalled = true;
    const version = runningRabbitMirrorVersion();
    if (version) globalThis[LOADED_VERSION_KEY] = version;
    const handler = () => { void checkRabbitMirrorManifestBump(); };
    const events = globalThis.tavern_events;
    if (typeof globalThis.eventOn === 'function' && events?.EXTENSION_SETTINGS_LOADED) {
        globalThis.eventOn(events.EXTENSION_SETTINGS_LOADED, handler);
        return;
    }
    try {
        const context = globalThis.SillyTavern?.getContext?.();
        const eventType = context?.eventTypes?.EXTENSION_SETTINGS_LOADED;
        if (context?.eventSource && eventType && typeof context.eventSource.on === 'function') {
            context.eventSource.on(eventType, handler);
        }
    } catch {}
}

function resolveHostFn(name) {
    if (typeof globalThis[name] === 'function') return globalThis[name].bind(globalThis);
    const helper = globalThis.TavernHelper;
    if (typeof helper?.[name] === 'function') return helper[name].bind(helper);
    return null;
}

function resolveUpdateExtensionFn() {
    return resolveHostFn('updateExtension');
}

function looksLikeGitPullBlocked(error, status = 0, detail = '') {
    const text = `${detail} ${error instanceof Error ? error.message : String(error || '')}`;
    return status === 500 || error?.status === 500 || /not valid JSON|Unexpected token|Internal Server Error/i.test(text);
}

async function overwriteFromGithub(folder) {
    const reinstallFn = resolveHostFn('reinstallExtension');
    if (!reinstallFn) {
        throw new Error('更新失败：本地扩展目录有改动，酒馆无法 git pull。当前环境没有 GitHub 覆盖安装。');
    }
    globalThis.toastr?.info?.('git pull 被本地改动挡住了，改为用 GitHub 版本覆盖…');
    const response = await reinstallFn(folder);
    if (response?.ok === true) {
        globalThis.toastr?.success?.('已强制覆盖为 GitHub 版本，正在刷新页面…');
        reloadTavernPage();
        return { ok: true, overwritten: true };
    }
    const status = typeof response?.status === 'number' ? response.status : 0;
    let detail = '';
    try { if (typeof response?.text === 'function') detail = (await response.text()).trim(); } catch {}
    throw new Error(detail || (status ? `GitHub 覆盖失败 (HTTP ${status})` : 'GitHub 覆盖失败'));
}

function finishUpdated() {
    globalThis.toastr?.success?.('兔子镜已更新，正在刷新页面…');
    reloadTavernPage();
    return { ok: true };
}

function localChangesMessage(branch) {
    return `更新失败：本地扩展目录有改动，酒馆无法 git pull。当前分支是 ${branch}，只有 main 才会用 GitHub 覆盖。请先处理本地改动后再更新。`;
}

function afterPullBlocked(branch, folder) {
    if (branch === 'main') return overwriteFromGithub(folder);
    throw new Error(localChangesMessage(branch));
}

export async function applyRabbitMirrorUpdateAndReload(options = {}) {
    const check = await checkRabbitMirrorUpdate({ ...options, force: true });
    if (check.status !== 'available') {
        publish({ status: check.status === 'unknown' ? 'unknown' : 'latest' });
        return { ok: true, skipped: true, message: check.status === 'unknown' ? (check.message || '没能确认远程版本，没有发送更新。') : '当前已是最新版本，无需更新' };
    }
    let folder = '';
    try { folder = ownExtensionFolder(options.moduleUrl); } catch (error) { throw error; }
    const branch = updateState.remoteBranch || FALLBACK_BRANCH;
    const updateFn = resolveUpdateExtensionFn();
    if (updateFn) {
        try {
            const response = await updateFn(folder);
            if (response?.ok === true) return finishUpdated();
            const status = typeof response?.status === 'number' ? response.status : 0;
            let detail = '';
            try { if (typeof response?.text === 'function') detail = (await response.text()).trim(); } catch {}
            if (looksLikeGitPullBlocked(null, status, detail)) return afterPullBlocked(branch, folder);
            throw new Error(detail || failure(status));
        } catch (error) {
            if (looksLikeGitPullBlocked(error, error?.status, error?.detail)) return afterPullBlocked(branch, folder);
            throw error;
        }
    }
    try {
        const result = await requestRabbitMirrorUpdate(options);
        if (result.status === 'current') {
            publish({ status: 'latest' });
            return { ok: true, skipped: true, message: '宿主确认当前安装已同步，没有新的文件可拉取。' };
        }
        return finishUpdated();
    } catch (error) {
        if (looksLikeGitPullBlocked(error, error?.status, error?.detail)) return afterPullBlocked(branch, folder);
        throw error;
    }
}
