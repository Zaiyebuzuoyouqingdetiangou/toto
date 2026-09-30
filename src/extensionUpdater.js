// User-triggered only. The host owns Git/permissions; never reset, delete or reinstall.
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
    return '宿主更新失败。可能是仓库连接失败、非 Git 安装或本地文件冲突；请检查宿主日志。没有自动重试或重装。';
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
        if (!response.ok) throw new Error(failure(response.status));
        const result = await response.json();
        if (typeof result?.isUpToDate !== 'boolean') throw new Error('宿主返回了未识别的更新结果，请检查扩展版本后再操作；不会自动重复更新。');
        return { status: result.isUpToDate ? 'current' : 'updated' };
    })().finally(() => { pending = null; });
    return pending;
}
