import { rmT as __rmT } from "./textTable.js?rmv=2.5.2";
import { compareRabbitMirrorVersions, fetchWithTimeout, hostRequestHeaders, ownExtensionFolder, reloadTavernPage, } from './extensionUpdater.js?rmv=2.5.2';
export { backupSettingsBeforeVersionSwitch } from './settings.js?rmv=2.5.2';
const UPDATER_URL = new URL('./extensionUpdater.js', import.meta.url).href;
const VERSION_BRANCH = /^(?:remotes\/)?(?:origin\/)?v(\d{1,3}\.\d{1,4}\.\d{1,4})$/;
export const ROLLBACK_SINCE = '2.2.0';
function failure(status, action) {
    if (status === 401 || status === 403)
        return `${__rmT("rcHBrewjgUp")}${action}${__rmT("clzU1onoMhYYP2vYh6_00aArj2T00UcKb3EZPEkZkV67EXREQ3mp2AkdJMs2tpevIIKK7x3OY3Y")}`;
    if (status === 404)
        return `${__rmT("752kvMl_kuBSOv2z7Ry0cIyj6btatzgxPyG8ZKd5X3D")}${action}${__rmT("Ufd_9tTIwl1BRTNa62VUGg90Bwida7SNjO2oMG9Dnl_9phH77iJnsssEKw.uM9yGWUE")}`;
    return `${__rmT("rcHBrbbcoUG")}${action}${__rmT("KtrAMYRMizJDGa5499k7SCItoL6KMmsFppY.JL3XPP2j0RWUtrzYH75uudfXNJh2z8uaI82qCLnvW4jwc10wkWk.kSAvG681_DCkTx_mK9aOWLuoj.zdBxrU1RxzIf13NI07ymrCtfbTHy2.gPK22qDfsJkT2y8bT_og2EhFWLmrKN0RdPRyJKPoIFZj_LzO")}`;
}
async function readText(response) {
    try {
        return (await response.text()).trim().slice(0, 300);
    }
    catch {
        return '';
    }
}
export async function resolveOwnInstall({ fetchImpl = globalThis.fetch.bind(globalThis), moduleUrl = UPDATER_URL } = {}) {
    const folder = ownExtensionFolder(moduleUrl);
    const discovery = await fetchWithTimeout(fetchImpl, '/api/extensions/discover', { cache: 'no-store' }, 20000, __rmT("cWeE4z_EfE9IlBMm"));
    if (!discovery.ok)
        throw new Error(failure(discovery.status, __rmT("cWeE4z_EfE9IlBMm")));
    const entries = await discovery.json();
    const matches = Array.isArray(entries) ? entries.filter(entry => entry?.name === `third-party/${folder}` && ['local', 'global'].includes(entry.type)) : [];
    const entry = matches.find(item => item.type === 'local') || matches.find(item => item.type === 'global');
    if (!entry)
        throw new Error(__rmT("XPhmMi06FCg84peSvkQUFZDacIyEUhNGX.vngR6U69EXhLIREaDK_zh5zBG"));
    return { folder, global: entry.type === 'global' };
}
export function rollbackChoices(branches) {
    const list = Array.isArray(branches) ? branches : [];
    const byVersion = new Map();
    let current = '';
    for (const branch of list) {
        const name = String(branch?.name || '').trim();
        if (branch?.current && name)
            current = name;
        const match = name.match(VERSION_BRANCH);
        if (!match)
            continue;
        const remote = /^(?:remotes\/)?origin\//.test(name);
        const known = byVersion.get(match[1]);
        if (!known || (remote && !known.remote))
            byVersion.set(match[1], { version: match[1], branch: name.replace(/^remotes\//, ''), remote });
    }
    const versions = [...byVersion.values()]
        .sort((a, b) => compareRabbitMirrorVersions(b.version, a.version))
        .map(({ version, branch }) => ({ version, branch, beforeRollback: compareRabbitMirrorVersions(version, ROLLBACK_SINCE) < 0 }));
    const pinned = current.match(VERSION_BRANCH)?.[1] || '';
    const names = new Set(list.map(branch => String(branch?.name || '').replace(/^remotes\//, '')));
    return { current, pinned, versions, hasTest: names.has('origin/test') || names.has('test') };
}
async function postJson(fetchImpl, url, body, ms, label) {
    const headers = await hostRequestHeaders();
    return fetchWithTimeout(fetchImpl, url, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, ms, label);
}
export async function listRollbackVersions({ fetchImpl = globalThis.fetch.bind(globalThis), moduleUrl } = {}) {
    const install = await resolveOwnInstall({ fetchImpl, moduleUrl });
    const response = await postJson(fetchImpl, '/api/extensions/branches', { extensionName: install.folder, global: install.global }, 120000, __rmT("ucMQSD6xl468erNmCshCT4eL"));
    if (!response.ok) {
        const error = new Error(failure(response.status, __rmT("ucMQSD6xl468erNmCshCT4eL")));
        error.detail = await readText(response);
        throw error;
    }
    const branches = await response.json();
    return { ...install, ...rollbackChoices(branches) };
}
export async function switchRabbitMirrorBranch({ branch, install, fetchImpl = globalThis.fetch.bind(globalThis), moduleUrl } = {}) {
    const name = String(branch || '').trim();
    if (!/^(?:origin\/)?(?:main|test|v\d{1,3}\.\d{1,4}\.\d{1,4})$/.test(name))
        throw new Error(__rmT("xS5Bk_R9PEis_09mvSc72.l7oL3P_NzJcn9spf"));
    const target = install || await resolveOwnInstall({ fetchImpl, moduleUrl });
    const response = await postJson(fetchImpl, '/api/extensions/switch', { extensionName: target.folder, branch: name, global: target.global }, 120000, __rmT("nHds8x6P96A"));
    if (!response.ok) {
        const error = new Error(failure(response.status, __rmT("nHds8x6P96A")));
        error.detail = await readText(response);
        throw error;
    }
    return { ok: true, install: target };
}
export async function returnToLatestRabbitMirror({ channel = 'main', install, fetchImpl = globalThis.fetch.bind(globalThis), moduleUrl } = {}) {
    const name = channel === 'test' ? 'test' : 'main';
    const { install: target } = await switchRabbitMirrorBranch({ branch: `origin/${name}`, install, fetchImpl, moduleUrl });
    const response = await postJson(fetchImpl, '/api/extensions/update', { extensionName: target.folder, global: target.global }, 180000, __rmT("fxtF8z3LtMnDHT"));
    if (!response.ok) {
        const error = new Error(`${__rmT("iFB7mU1gLBT")}${name === 'main' ? __rmT("Wo0K05YQ") : __rmT(".o8WL5YQ")}${__rmT("fzNz3k")}${failure(response.status, __rmT("PhXpnsyvfhvfXyUoXtT"))}`);
        error.detail = await readText(response);
        error.switched = true;
        throw error;
    }
    return { ok: true };
}
export function reloadAfterVersionSwitch(delayMs = 900) {
    reloadTavernPage(delayMs);
}
