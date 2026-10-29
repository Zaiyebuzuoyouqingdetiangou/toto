import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=1.99.14";
let pending = null;
export function ownExtensionFolder(moduleUrl = import.meta.url) {
    const match = new URL(moduleUrl).pathname.match(/\/third-party\/([^/]+)\/src\/extensionUpdater\.js$/);
    if (!match)
        throw new Error(__rmT("1jXGxHVViTuxWPH4puhj5WH73ReWQ4OtbqFNv1h2bHZuN.pU4le5SgnxIw8lLDrwYUhLkJj5xtRoKlcSqAk"));
    const folder = decodeURIComponent(match[1]);
    if (!folder || /[\\/\u0000-\u001f]/.test(folder) || folder === '.' || folder === '..')
        throw new Error(__rmT("2RkpF59s.X7blWIOKVZw42_CCpsYvq9SNpay8tKq"));
    return folder;
}
function failure(status) {
    if (status === 401 || status === 403)
        return __rmT("fiNexzvA1tfZekxZ2F.5UO4ZQhMw66G3VAfIqNtEkkBc3iEebVhhon9rOAkI5A3U0mTn_5PCLWB99Z2ui4aFUaGu");
    if (status === 404 || status === 405)
        return __rmT("DhohoAlSXfrDAhqMa_4868cgaWVXm5ZmbG6_fb043qu4yeqp_kreJxl4X38z1W7qaxMtBXzF1dNgN3bDuu.etXnBW0zN9EDKANA");
    return __rmT("PLQBMC8F20mhWelqupYNbNgRty0pab3rRZ6csVSAITJe1LjAC6bdvl1HZSCVa_bDNPVTokj93GA4eTlAggwTwNhINjDTu0WqP87k5IZ2ccdo.k");
}
async function fetchWithTimeout(fetchImpl, url, init, ms, label) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    let timer = 0;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
            try {
                controller?.abort();
            }
            catch { }
            reject(new Error(`${label}${__rmT("oT8cjcc6")}${Math.round(ms / 1000)}${__rmT("mGGHcuU7Iyurh19WWxmjplM.1DMLvEqdp4mKwJVqBVNiMMoDRbCR6ENMidza7MZLktl8VtUq2qbKlI1yJ8bwT0xmHGb6U6EsuSQhzrMZM.jJB8zaesYd2ZAF5wP_ys.OsTNOvT")}`));
        }, ms);
    });
    try {
        return await Promise.race([fetchImpl(url, controller ? { ...init, signal: controller.signal } : init), timeout]);
    }
    finally {
        clearTimeout(timer);
    }
}
async function hostRequestHeaders() {
    try {
        const context = globalThis.SillyTavern?.getContext?.();
        if (typeof context?.getRequestHeaders === 'function')
            return context.getRequestHeaders();
    }
    catch { }
    return (await import('../../../../../script.js')).getRequestHeaders();
}
export async function inspectRabbitMirrorVersion({ fetchImpl = globalThis.fetch.bind(globalThis), getHeaders, moduleUrl = import.meta.url, pageVersion = globalThis.__rabbitMirrorRuntimeVersion, uiVersion, apiVersion } = {}) {
    const folder = ownExtensionFolder(moduleUrl);
    const manifestUrl = new URL('../manifest.json', moduleUrl);
    manifestUrl.searchParams.set('rm-check', String(Date.now()));
    const version = value => typeof value === 'string' && /^[0-9][\w.+-]{0,79}$/.test(value) ? value : '';
    const result = { folder, pageVersion: version(pageVersion), uiVersion: version(uiVersion),
        apiVersion: version(apiVersion), installedVersion: '', branch: '', commit: '', installType: '', warnings: [] };
    const checks = await Promise.allSettled([
        (async () => {
            const response = await fetchWithTimeout(fetchImpl, manifestUrl.href, { cache: 'no-store' }, 15000, __rmT("cWeE4l_eAO6op_Hf"));
            if (!response.ok)
                throw new Error(__rmT("ggdpOjMVLZWrRAaX9gwBvUcRl3eU14LjQeDvGjELafSCfaN1Pe7T3f"));
            const manifest = await response.json();
            result.installedVersion = version(manifest?.version);
            if (!result.installedVersion)
                throw new Error(__rmT("kU6yZo7EL6EUx5fBkqLmeqAR5r2HsXH8"));
        })(),
        (async () => {
            const discovery = await fetchWithTimeout(fetchImpl, '/api/extensions/discover', { cache: 'no-store' }, 15000, __rmT("cWeE4z_EfE9IlBMm"));
            if (!discovery.ok)
                throw new Error(__rmT("CmR.1iObuW_ikuc0XiiE_vfyS8rEGk"));
            const entries = await discovery.json();
            const matches = Array.isArray(entries) ? entries.filter(e => e?.name === `third-party/${folder}`) : [];
            const entry = matches.find(e => e.type === 'local') || matches.find(e => e.type === 'global');
            if (!entry)
                throw new Error(__rmT("CmR.1EKa0FCpl4LqBo9E_vfy_9L73T"));
            result.installType = entry.type;
            const headers = getHeaders ? await getHeaders() : await hostRequestHeaders();
            const response = await fetchWithTimeout(fetchImpl, '/api/extensions/version', {
                method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ extensionName: folder, global: entry.type === 'global' }),
            }, 15000, __rmT("cWeE4l_eAOMfl_UZ"));
            if (!response.ok)
                throw new Error(__rmT("uov9EDEUPVv_J9W7yYoKFFqR3QApX24ROay5Vu2tVd_.I2LP4c.GjKlyHBXQP.WMln5Cxsng_tzMpKPpOiEvcf"));
            const info = await response.json();
            result.branch = typeof info?.currentBranchName === 'string' ? info.currentBranchName.slice(0, 160) : '';
            result.commit = /^[a-f0-9]{7,64}$/i.test(info?.currentCommitHash || '') ? info.currentCommitHash.slice(0, 12) : '';
            if (!result.branch)
                result.warnings.push(__rmT("vrqoJu6SYXbhkNF1Yepesu787KF0MZYDNPCZPEkZrT59W.n397Sc3KA3Ym.ME3EOtjahxsKgtDY"));
        })(),
    ]);
    checks.forEach(check => { if (check.status === 'rejected')
        result.warnings.push(String(check.reason?.message || __rmT("uBvLygjVT_LWyEyM"))); });
    return result;
}
export function formatRabbitMirrorVersionStatus(result) {
    const show = value => value || __rmT("uP8Onk");
    const loaded = [result.pageVersion, result.uiVersion, result.apiVersion].filter(Boolean);
    const known = [...loaded, result.installedVersion].filter(Boolean);
    const mismatch = new Set(known).size > 1;
    const hint = mismatch
        ? __rmT("DgJMFiFJCmo6Atj3Qo.PL5qJzvii5SCibJo5akcO_b_07YMy6Xamq6mqcX_Yq2TxFpY68TfZrQPF353SvHfSIa2a74HioUW.C1NjDXxE79s") : known.length === 4 ? __rmT("GMwKfifo.RK9GmGXJzg7DVdXVUTIzd7eqipC5883hW227Oz9GDdPzZnbLTbFA2P1GkeylvCcWoEobh") : __rmT("vLLE6LpDFqi__4QfOlI9PEKObkNGJYqiVjGkfD4w8CmU0J9Eq8_");
    return `${__rmT("TiAPpWQeqQIStf")}${show(result.pageVersion)}${__rmT("RhppczkxRw5IRt5D")}${show(result.uiVersion)}${__rmT("RhrUJU8ERw5IRt5D")}${show(result.apiVersion)}${__rmT("Rhp5IDwrCtRhgb5D")}${show(result.installedVersion)}${__rmT("gs85IDwrXo44tt5D")}${result.folder}${__rmT("Y0nBAWWsWZY")}${show(result.branch)}${result.commit ? `${__rmT("eis")}${result.commit}${__rmT("eXs")}` : ''}${__rmT("jzk")}${hint}${result.warnings.length ? ' ' + result.warnings.join(__rmT("7os")) : ''}`;
}
export function requestRabbitMirrorUpdate({ fetchImpl = globalThis.fetch.bind(globalThis), getHeaders, moduleUrl = import.meta.url } = {}) {
    if (pending)
        return pending;
    pending = (async () => {
        const folder = ownExtensionFolder(moduleUrl);
        const discovery = await fetchWithTimeout(fetchImpl, '/api/extensions/discover', { cache: 'no-store' }, 20000, __rmT("cWeE4z_EfE9IlBMm"));
        if (!discovery.ok)
            throw new Error(failure(discovery.status));
        const entries = await discovery.json();
        if (!Array.isArray(entries))
            throw new Error(__rmT("_839HMKHLmegthdgNBLYrjN5_KSQ8OUGB0LzsOZr7rFvQwflW4hr7f"));
        const matches = entries.filter(e => e?.name === `third-party/${folder}` && ['local', 'global'].includes(e.type));
        const entry = matches.find(e => e.type === 'local') || matches.find(e => e.type === 'global');
        if (!entry)
            throw new Error(__rmT("O2LCvFWRZx2GIV6vUapjnByUgwvA07FCxa1ZEn_suZoHcGd1cc8j4_Jiphbn7valZAUgPcMLElcMl_H9"));
        const headers = getHeaders ? await getHeaders() : await hostRequestHeaders();
        const response = await fetchWithTimeout(fetchImpl, '/api/extensions/update', {
            method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ extensionName: folder, global: entry.type === 'global' }),
        }, 180000, __rmT("KH4U59gmR6s"));
        if (!response.ok) {
            let detail = '';
            try {
                detail = (await response.text()).trim();
            }
            catch { }
            const error = new Error(failure(response.status));
            error.status = response.status;
            error.detail = detail;
            throw error;
        }
        const result = await response.json();
        if (typeof result?.isUpToDate !== 'boolean')
            throw new Error(__rmT("owxLd3Ex2uUC193m3YSn.x.0l0pHuUCHcqyTMyG742hZuwVHir8J2.IjPRicxSU2jZxLEzL.xjfc3DAsNod_O3A1IMlcxf"));
        return { status: result.isUpToDate ? 'current' : 'updated' };
    })().finally(() => { pending = null; });
    return pending;
}
const HOMEPAGE = 'https://github.com/Zaiyebuzuoyouqingdetiangou/toto';
const FALLBACK_BRANCH = 'main';
const UPDATE_CHECK_THROTTLE_MS = 30000;
const LOADED_VERSION_KEY = '__rabbitMirrorLoadedVersion';
const RELOAD_GUARD_KEY = 'rabbitMirrorReloadedVersion';
let updateCheckSequence = 0;
let lastUpdateCheckAt = 0;
let checkingPromise = null;
let reloadWatchInstalled = false;
let updateState = { status: 'idle', remoteVersion: '', remoteUrl: HOMEPAGE, remoteBranch: 'main', remoteBranchKnown: false, message: '' };
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
        if (delta)
            return delta;
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
        try {
            listener(snapshot());
        }
        catch { }
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
    if (!match)
        return null;
    return { owner: match[1], repo: match[2] };
}
function remoteFileUrl(remoteUrl, fileName, branch, cdn) {
    const parsed = parseGithubRepo(remoteUrl);
    if (!parsed)
        return '';
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
        if (!text || (text[0] !== '{' && text[0] !== '['))
            return null;
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
async function fetchManifestVersionFromUrl(url, fetchImpl) {
    try {
        const response = await fetchWithTimeout(fetchImpl, `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`, { cache: 'no-store' }, 12000, __rmT("cWeE4QgI1y5op_Hf"));
        if (!response.ok)
            return '';
        const data = await readJson(response);
        return validVersion(data?.version);
    }
    catch {
        return '';
    }
}
async function tryReadInstallInfo(moduleUrl) {
    const fn = typeof globalThis.getExtensionInstallationInfo === 'function'
        ? globalThis.getExtensionInstallationInfo
        : globalThis.TavernHelper?.getExtensionStatus;
    if (typeof fn !== 'function')
        return null;
    let folder = '';
    try {
        folder = ownExtensionFolder(moduleUrl);
    }
    catch {
        return null;
    }
    try {
        return await Promise.race([
            fn(folder),
            new Promise(resolve => { setTimeout(() => resolve(null), 5000); }),
        ]);
    }
    catch {
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
        if (version)
            return version;
    }
    return '';
}
function rememberRemote(info, remoteVersion) {
    return {
        remoteVersion: remoteVersion || '',
        remoteUrl: info?.remote_url || info?.remoteUrl || HOMEPAGE,
        remoteBranch: currentBranchName(info) || FALLBACK_BRANCH,
        remoteBranchKnown: !!currentBranchName(info),
    };
}
export async function checkRabbitMirrorUpdate({ force = false, fetchImpl = globalThis.fetch.bind(globalThis), moduleUrl = import.meta.url } = {}) {
    if (updateState.status === 'checking' && checkingPromise)
        return checkingPromise;
    const now = Date.now();
    if (!force && updateState.status !== 'unknown' && now - lastUpdateCheckAt < UPDATE_CHECK_THROTTLE_MS)
        return snapshot();
    const sequence = ++updateCheckSequence;
    lastUpdateCheckAt = now;
    publish({ status: 'checking', message: '' });
    checkingPromise = (async () => {
        try {
            const info = await tryReadInstallInfo(moduleUrl);
            const remoteVersion = await fetchRemoteManifestVersion(info, fetchImpl);
            if (sequence !== updateCheckSequence)
                return snapshot();
            if (!remoteVersion) {
                publish({ status: 'unknown', message: __rmT("uHMYbyll9C7rH9lu_YdUkV58CdqJZx9.o1np2sKrVKqqQykrQFD5f3xaY6lNkZkC"), ...rememberRemote(info, '') });
                return snapshot();
            }
            const current = runningRabbitMirrorVersion();
            publish({
                status: isNewerRabbitMirrorVersion(remoteVersion, current) ? 'available' : 'latest',
                message: '',
                ...rememberRemote(info, remoteVersion),
            });
            return snapshot();
        }
        catch (error) {
            if (sequence === updateCheckSequence) {
                publish({ status: 'unknown', message: String(error?.message || __rmT("FlW4cdkmO.iHxJ3haN7Ged7y01e_hvDC29E")) });
            }
            return snapshot();
        }
        finally {
            checkingPromise = null;
        }
    })();
    return checkingPromise;
}
const headingPattern = __rmR("cfNAZ4K7uljCR6t2ogrY1fSBm1dVv05yniiEymckagd7mDsnWS3JniYHP9LEqTqhH62jGZxTm3WzbXahgPNbhAH4h_IC12bCyfgFBSZ59pVvJKkleqxdOIcYg83vOvOrEE60B2kmq3nQfQm8KTJgP.cGkmUZEL09SIp", "");
const quoteHeadingPattern = __rmR("3YvZGMbIiabL.yDPKkFAwGoyhDp9TO23Yr0Xsr9gUhFKTiEfZAnhpgaWI648deMjv75G.KqHPBtq_i0c12Zr2rdjEoWAfjR31X3E0iVYd5BFZua2XA3jcRTW_pmhy9WCMGO6fFSy3X4t2WZq6udGWifoVvZkiT6.4jfufT", "");
const titledHeadingPattern = /^(#{1,3})\s+(.+?)\s+v?(\d+\.\d+(?:\.\d+)*)\s*$/;
export function parseReadmeChangelog(text) {
    const sections = [];
    let current = null;
    const push = () => {
        if (!current)
            return;
        const items = [];
        for (const raw of current.lines) {
            let line = raw.replace(/^\s*>\s?/, '').trim();
            if (!line || line === '---')
                continue;
            line = line.replace(/^#{1,6}\s+/, '').replace(/^[-*]\s+/, '').replace(/^\*\*(.+)\*\*$/, '$1').trim();
            if (line)
                items.push(line);
        }
        if (current.version || items.length)
            sections.push({ version: current.version, title: current.title, items });
    };
    for (const line of String(text || '').split(/\r?\n/)) {
        const heading = line.match(headingPattern);
        const quote = !heading && line.match(quoteHeadingPattern);
        const titled = !heading && !quote && line.match(titledHeadingPattern);
        if (heading || quote || titled) {
            push();
            const version = validVersion(heading ? heading[2] : quote ? quote[1] : titled[3]);
            const title = String((heading ? heading[3] : quote ? quote[2] : titled[2]) || '').replace(/\*\*/g, '').trim();
            current = { version, title, lines: [] };
            continue;
        }
        if (current)
            current.lines.push(line);
    }
    push();
    return sections.sort((a, b) => compareRabbitMirrorVersions(b.version, a.version));
}
async function fetchText(url, fetchImpl, label) {
    const response = await fetchWithTimeout(fetchImpl, `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`, { cache: 'no-store' }, 15000, label);
    if (!response.ok)
        return '';
    const text = await response.text();
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith('<'))
        return '';
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
            const text = await fetchText(url, fetchImpl, __rmT("cWeE4gGGHmRSMyO7"));
            if (!text)
                continue;
            const sections = parseReadmeChangelog(text);
            if (sections.length)
                return { ok: true, sections };
            const items = text.trim().split(/\n+/).map(line => line.trim()).filter(Boolean).slice(0, 40);
            if (items.length)
                return { ok: true, sections: [{ version: '', title: 'README', items }] };
        }
        catch { }
    }
    return { ok: false, sections: [], message: __rmT("uHMYbyll9CZMJbH0b4wDuxPDJyutDmqMqG4BoZ7cvmyZJiQSN9EPnSOt8FhaLSkC") };
}
export function reloadTavernPage(delayMs = 800) {
    globalThis.setTimeout(() => {
        try {
            if (typeof globalThis.triggerSlash === 'function') {
                globalThis.triggerSlash('/reload-page');
                return;
            }
        }
        catch { }
        try {
            globalThis.location?.reload();
        }
        catch { }
    }, delayMs);
}
export async function fetchInstalledManifestVersion({ fetchImpl = globalThis.fetch.bind(globalThis), moduleUrl = import.meta.url } = {}) {
    try {
        const url = new URL('../manifest.json', moduleUrl);
        url.searchParams.set('rm-check', String(Date.now()));
        const response = await fetchWithTimeout(fetchImpl, url.href, { cache: 'no-store' }, 15000, __rmT("cWeE4l_eAO6op_Hf"));
        if (!response.ok)
            return '';
        const manifest = await readJson(response);
        return validVersion(manifest?.version);
    }
    catch {
        return '';
    }
}
export async function checkRabbitMirrorManifestBump({ silent = false, fetchImpl, moduleUrl } = {}) {
    const installed = await fetchInstalledManifestVersion({ fetchImpl, moduleUrl });
    if (!installed)
        return false;
    const loaded = validVersion(globalThis[LOADED_VERSION_KEY]) || runningRabbitMirrorVersion();
    if (!isNewerRabbitMirrorVersion(installed, loaded)) {
        globalThis[LOADED_VERSION_KEY] = installed;
        try {
            globalThis.sessionStorage?.removeItem(RELOAD_GUARD_KEY);
        }
        catch { }
        return false;
    }
    const guard = `${loaded}->${installed}`;
    try {
        if (globalThis.sessionStorage?.getItem(RELOAD_GUARD_KEY) === guard)
            return false;
        globalThis.sessionStorage?.setItem(RELOAD_GUARD_KEY, guard);
    }
    catch { }
    if (!silent) {
        const toastr = globalThis.toastr;
        if (toastr?.info) {
            toastr.info(`${__rmT("vDfth4AqQvqHbQQQHK._84Cx")}${installed}${__rmT("HRuhmrtuRcVhvEds.5moVo8vjq0f20V7BxJGh_mECUfr7wUh6ryA_lhnzBG")}`, __rmT("9.JSSv1i"), {
                timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false,
                onclick: () => reloadTavernPage(0),
            });
        }
    }
    return true;
}
export function setupRabbitMirrorExtensionReloadWatch() {
    if (reloadWatchInstalled)
        return;
    reloadWatchInstalled = true;
    const version = runningRabbitMirrorVersion();
    if (version)
        globalThis[LOADED_VERSION_KEY] = version;
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
    }
    catch { }
}
function resolveHostFn(name) {
    if (typeof globalThis[name] === 'function')
        return globalThis[name].bind(globalThis);
    const helper = globalThis.TavernHelper;
    if (typeof helper?.[name] === 'function')
        return helper[name].bind(helper);
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
        throw new Error(__rmT("9mGeMdFkdm5pgWPbHF5ONCLrMQMPZBKqjpVZfDkr2n5bYa4ZAdMsGcXX6YKmHa2AvmBKgNLwIotdkxj5gIw8GWWLlpqaTI4oRQRCB5IZY65EloQ31L4eCM.JTvqC9KDr"));
    }
    globalThis.toastr?.info?.(__rmT("RqPh.ujS_DvNfgDABHunj0dHHplnM7WBXH7a0Kgo34Z_GH5F0S37Be0i"));
    const response = await reinstallFn(folder);
    if (response?.ok === true) {
        globalThis.toastr?.success?.(__rmT("RNKnGv6e1QKljFD.rnwyu5bDpouzD8PJZTE8pBUh.i.z98K35MctbHOcUCFcHhfA"));
        reloadTavernPage();
        return { ok: true, overwritten: true };
    }
    const status = typeof response?.status === 'number' ? response.status : 0;
    let detail = '';
    try {
        if (typeof response?.text === 'function')
            detail = (await response.text()).trim();
    }
    catch { }
    throw new Error(detail || (status ? `${__rmT("P.JIfugXe6hWwQRPy.XzO9XfUVv3FrCgdCZNlxbp2gNGPTIy")}${status})` : __rmT("NMhmYQp7k7QNBhnG4gS0GnbTPBPOHf")));
}
function finishUpdated() {
    globalThis.toastr?.success?.(__rmT("ZmJSVRoR_tVVfzF7vF5DetoF6cWZ_KQkc_MBkf"));
    reloadTavernPage();
    return { ok: true };
}
function localChangesMessage(branch) {
    return `${__rmT("l_13E06WUCg8PMVmhFn7OsHQJz1ljDlT_WpY77VUWAVxd1OiyVFS1QETv8KlUsfm_Ll8nAn0E5w3xjBxMZ9j0hBpdJkjKf")}${branch}${__rmT("4vRRQ8lp2hRqjWc3JV4Jdy2TygsGBcnJ6u0eHVBOAQnVbuJaVIYq_URNzehgLfHSxUHYswCac8YElkIsfkFiKDA2OHvIOnYO")}`;
}
function gitDetailShowsLocalChanges(detail) {
    return /local changes|would be overwritten|commit your changes|stash them|uncommitted|untracked working tree/i.test(String(detail || ''));
}
function afterPullBlocked(branch, folder, detail = '') {
    if (branch !== 'main' || updateState.remoteBranchKnown !== true) {
        if (gitDetailShowsLocalChanges(detail))
            throw new Error(localChangesMessage(branch));
        throw new Error(__rmT("nqeJ_BKSq2Mh9pUr_d8Q.ZEqgTYm79vRSanQsC9QQxz521H35uqkERukj12sjttPaRMWkGJ2uPBid5cQlaKZVJygIwVb9gQFabuYNdrfIUcYv6SmBgYI1xTxGlr1Tsax47qA0nQw9ib_toVseysfbqnqB4bzC81F1QI6sgek"));
    }
    const sure = gitDetailShowsLocalChanges(detail);
    const question = sure
        ? __rmT("o3A9yU9.Ro_QAhFyxtppauquWXRkW.zPLnonUq0iBUx7sPAfQY7Jd2qZrgzVdLijCx5s.s5HFDtX_ES6Elgd1WPT4LIXRsqlsrshai7Y0erX1w0XbOeuiv9w4hpNLB1YWDh.fXDoYRkTt3nN59dN5I.f3dGOJvd0NIpx_T") : __rmT("Z83mGF.pa33jYZ6mGiO6O7pUkQ6Ub89GgJtk9DuH6nFdCRhkXdlWI8tL8yKfIJfisMrL.geRQWp2PrKZvwBAR.VIjaKD4IegTK2qPwLpdGGOYFTJ0c9drhaGw9WP5tgH5WtGh4HBRGmCJGV9fUIQvr3wU4uRoxdQsWNG6eLB2_N9AYLnHc56Ua9ciTZV74tCk_A66BipjOOyHJvHGsX_v3UuIiT23xohx9jUB8OZmSZuXvoRVlTBBLMgjNHqcBuwXEuKHoIR9O7WIAH0HIo9JFbqPLz.Wyoir_OHLiCE5s2J9_3F0r_0QBxU");
    let confirmed = false;
    try {
        confirmed = globalThis.confirm?.(question) === true;
    }
    catch {
        confirmed = false;
    }
    if (!confirmed)
        throw new Error(__rmT("AMOs6JpjnuehBfQIiEyTkHbtP0wFsOpz_djXdcn1Cen_Hmumq8_"));
    return overwriteFromGithub(folder);
}
export async function applyRabbitMirrorUpdateAndReload(options = {}) {
    const check = await checkRabbitMirrorUpdate({ ...options, force: true });
    if (check.status !== 'available') {
        publish({ status: check.status === 'unknown' ? 'unknown' : 'latest' });
        return { ok: true, skipped: true, message: check.status === 'unknown' ? (check.message || __rmT(".li6APlr9VtyLWWHjtPnQHEox_fMAxqYXzjkAESMgG8")) : __rmT("VwH5II8Fi3KHvcxGWZd5idjgBCn77ftQqt8") };
    }
    let folder = '';
    try {
        folder = ownExtensionFolder(options.moduleUrl);
    }
    catch (error) {
        throw error;
    }
    const branch = updateState.remoteBranch || FALLBACK_BRANCH;
    const updateFn = resolveUpdateExtensionFn();
    if (updateFn) {
        try {
            const response = await updateFn(folder);
            if (response?.ok === true)
                return finishUpdated();
            const status = typeof response?.status === 'number' ? response.status : 0;
            let detail = '';
            try {
                if (typeof response?.text === 'function')
                    detail = (await response.text()).trim();
            }
            catch { }
            if (looksLikeGitPullBlocked(null, status, detail))
                return afterPullBlocked(branch, folder, detail);
            throw new Error(detail || failure(status));
        }
        catch (error) {
            if (looksLikeGitPullBlocked(error, error?.status, error?.detail))
                return afterPullBlocked(branch, folder, `${error?.detail || ''} ${error?.message || ''}`);
            throw error;
        }
    }
    try {
        const result = await requestRabbitMirrorUpdate(options);
        if (result.status === 'current') {
            publish({ status: 'latest' });
            return { ok: true, skipped: true, message: __rmT("VqJztZbwFCQ7kUxOpfgsXVf3Y7Tl3ofO4iXL.lmEB6P0.rcRzj6R3cBvzBG") };
        }
        return finishUpdated();
    }
    catch (error) {
        if (looksLikeGitPullBlocked(error, error?.status, error?.detail))
            return afterPullBlocked(branch, folder, `${error?.detail || ''} ${error?.message || ''}`);
        throw error;
    }
}
