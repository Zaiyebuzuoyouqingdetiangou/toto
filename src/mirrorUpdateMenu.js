// 版本更新放在镜面工具菜单底部，不再单独开设置页。
// 有新版本时点「有更新」才去读仓库 README；更新成功后的刷新和预设备忘录一样。

import { paintToolMenuUpdateIcon, themeMirrorToolPanel } from './mirrorToolMenu.js?rmv=1.62.95';
import {
    applyRabbitMirrorUpdateAndReload,
    checkRabbitMirrorUpdate,
    getRabbitMirrorUpdateSnapshot,
    isNewerRabbitMirrorVersion,
    loadRabbitMirrorReadme,
    runningRabbitMirrorVersion,
    setupRabbitMirrorExtensionReloadWatch,
    subscribeRabbitMirrorUpdate,
} from './extensionUpdater.js?rmv=1.62.95';

const buttonStyle = 'display:block;width:100%;min-height:44px;margin-top:8px;padding:10px 12px;text-align:left;white-space:normal;border:1px solid var(--SmartThemeBorderColor,#bbb);border-radius:10px;background-color:#243044;background-image:linear-gradient(var(--SmartThemeBlurTintColor,#243044),var(--SmartThemeBlurTintColor,#243044));color:inherit;font:inherit;cursor:pointer;box-sizing:border-box;';
let sheet = null;
let applying = false;
let sheetKeyInstalled = false;

function paintRow(row, snap) {
    const check = row.querySelector('[data-rm-update-check]');
    const available = row.querySelector('[data-rm-update-available]');
    const version = row.querySelector('[data-rm-update-version]');
    const checking = snap.status === 'checking';
    const current = runningRabbitMirrorVersion();
    if (version) version.textContent = current ? `当前 v${current}` : '当前版本未知';
    check.disabled = checking || applying;
    check.textContent = checking ? '检测中…' : '↻ 检测更新';
    check.title = snap.status === 'latest'
        ? '当前已是最新，再点一次可重新检测'
        : snap.status === 'unknown'
            ? '上次检测失败，点击重新检测'
            : '检测兔子镜是否有新版本';
    const show = snap.status === 'available';
    available.hidden = !show;
    available.style.setProperty('display', show ? 'block' : 'none', 'important');
    available.disabled = applying;
    available.textContent = snap.remoteVersion ? `↑ 有更新 · ${snap.remoteVersion}` : '↑ 有更新';
    available.title = '查看更新日志';
}

function sectionBlock(section) {
    const block = document.createElement('section');
    block.style.cssText = 'margin:0 0 14px;';
    const heading = document.createElement('strong');
    heading.style.cssText = 'display:block;margin:0 0 6px;';
    heading.textContent = section.version
        ? (section.title ? `v${section.version} · ${section.title}` : `v${section.version}`)
        : (section.title || '更新说明');
    block.append(heading);
    if (!section.items?.length) {
        const empty = document.createElement('p');
        empty.textContent = '这一版没有写出条目。';
        block.append(empty);
        return block;
    }
    const list = document.createElement('ul');
    list.style.cssText = 'margin:0;padding-left:1.2em;';
    for (const item of section.items) {
        const li = document.createElement('li');
        li.style.cssText = 'margin:4px 0;';
        li.textContent = item;
        list.append(li);
    }
    block.append(list);
    return block;
}

function fillReadme(body, result) {
    body.replaceChildren();
    if (!result?.ok) {
        const fail = document.createElement('p');
        fail.textContent = result?.message || '没能读到 README。';
        body.append(fail);
        return;
    }
    const current = runningRabbitMirrorVersion();
    const newer = result.sections.filter(section => section.version && isNewerRabbitMirrorVersion(section.version, current));
    const show = (newer.length ? newer : result.sections.slice(0, 1)).slice(0, 12);
    if (!newer.length) {
        const note = document.createElement('p');
        note.textContent = 'README 里还没有比当前版本更高的条目，下面是这次读到的最新说明。';
        body.append(note);
    }
    for (const section of show) body.append(sectionBlock(section));
}

function onSheetKey(event) {
    if (event.key !== 'Escape' || applying || !sheet?.isConnected) return;
    sheet.remove();
}

function ensureSheet() {
    if (!sheetKeyInstalled) {
        sheetKeyInstalled = true;
        document.addEventListener('keydown', onSheetKey);
    }
    if (sheet?.isConnected) return sheet;
    const overlay = document.createElement('div');
    overlay.setAttribute('data-rm-update-sheet', 'true');
    overlay.setAttribute('role', 'presentation');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10080;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(0,0,0,.45);';
    const card = document.createElement('section');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', '更新日志');
    card.style.cssText = 'width:min(440px,100%);max-height:min(78vh,720px);display:flex;flex-direction:column;box-sizing:border-box;padding:16px;border:1px solid var(--SmartThemeBorderColor,#bbb);border-radius:15px;background-color:#243044;background-image:linear-gradient(var(--SmartThemeBlurTintColor,#243044),var(--SmartThemeBlurTintColor,#243044));color:var(--SmartThemeBodyColor,#34495d);box-shadow:0 8px 30px #0004;font:14px/1.5 sans-serif;';
    const title = document.createElement('strong');
    title.dataset.rmUpdateSheetTitle = 'true';
    title.textContent = '发现新版本';
    title.style.cssText = 'display:block;margin-bottom:8px;font-size:16px;';
    const body = document.createElement('div');
    body.dataset.rmUpdateSheetBody = 'true';
    body.style.cssText = 'overflow:auto;min-height:0;flex:1 1 auto;padding-right:4px;';
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:8px;margin-top:12px;';
    const close = document.createElement('button');
    close.type = 'button';
    close.dataset.rmUpdateSheetClose = 'true';
    close.textContent = '关闭';
    close.style.cssText = `${buttonStyle}margin-top:0;flex:1;`;
    const apply = document.createElement('button');
    apply.type = 'button';
    apply.dataset.rmUpdateSheetApply = 'true';
    apply.textContent = '更新';
    apply.style.cssText = `${buttonStyle}margin-top:0;flex:1;border-color:var(--SmartThemeQuoteColor,#c47a3a);`;
    actions.append(close, apply);
    card.append(title, body, actions);
    overlay.append(card);
    overlay.addEventListener('pointerdown', event => {
        if (event.target === overlay && !applying) overlay.remove();
    });
    close.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (!applying) overlay.remove();
    });
    apply.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        void runApply(apply, close, body);
    });
    document.body.append(overlay);
    themeMirrorToolPanel(card);
    sheet = overlay;
    return overlay;
}

async function runApply(apply, close, body) {
    if (applying) return;
    applying = true;
    apply.disabled = true;
    close.disabled = true;
    apply.textContent = '更新中…';
    const wait = document.createElement('p');
    wait.textContent = '正在向酒馆请求更新当前兔子镜。完成后会刷新页面。';
    body.prepend(wait);
    try {
        const result = await applyRabbitMirrorUpdateAndReload();
        if (result.skipped) {
            globalThis.toastr?.info?.(result.message || '当前已是最新版本，无需更新');
            applying = false;
            apply.disabled = false;
            close.disabled = false;
            apply.textContent = '更新';
            wait.remove();
            return;
        }
        apply.textContent = '正在刷新…';
    } catch (error) {
        applying = false;
        apply.disabled = false;
        close.disabled = false;
        apply.textContent = '更新';
        wait.remove();
        const message = String(error?.message || '更新失败，请检查宿主日志。');
        globalThis.toastr?.error?.(message);
    }
}

async function openUpdateLog() {
    const overlay = ensureSheet();
    const body = overlay.querySelector('[data-rm-update-sheet-body]');
    const title = overlay.querySelector('[data-rm-update-sheet-title]');
    const snap = getRabbitMirrorUpdateSnapshot();
    title.textContent = snap.remoteVersion ? `发现新版本 ${snap.remoteVersion}` : '发现新版本';
    body.textContent = '正在读取 README…';
    const readme = await loadRabbitMirrorReadme({ remoteUrl: snap.remoteUrl, remoteBranch: snap.remoteBranch });
    if (!overlay.isConnected) return;
    fillReadme(body, readme);
}

function mountMirrorUpdateRow(panel) {
    if (!panel || panel.querySelector('[data-rm-update-host]')) return;
    const host = document.createElement('div');
    host.dataset.rmUpdateHost = 'true';
    const version = document.createElement('div');
    version.dataset.rmUpdateVersion = 'true';
    version.style.cssText = 'margin-top:10px;font-size:12px;line-height:1.4;opacity:.75;';
    const available = document.createElement('button');
    available.type = 'button';
    available.dataset.rmUpdateAvailable = 'true';
    available.style.cssText = `${buttonStyle}border-color:var(--SmartThemeQuoteColor,#c47a3a);font-weight:600;`;
    available.hidden = true;
    available.style.setProperty('display', 'none', 'important');
    const check = document.createElement('button');
    check.type = 'button';
    check.dataset.rmUpdateCheck = 'true';
    check.style.cssText = buttonStyle;
    host.append(version, available, check);
    const close = panel.querySelector('[data-rm-tool-choice="close"]');
    if (close) panel.insertBefore(host, close);
    else panel.append(host);
    const render = () => { if (host.isConnected) paintRow(host, getRabbitMirrorUpdateSnapshot()); };
    const unsubscribe = subscribeRabbitMirrorUpdate(render);
    const observer = new MutationObserver(() => {
        if (!host.isConnected) { unsubscribe(); observer.disconnect(); }
    });
    observer.observe(document.body, { childList: true });
    render();
    check.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        void (async () => {
            const snap = await checkRabbitMirrorUpdate({ force: true });
            if (!host.isConnected) return;
            if (snap.status === 'latest') globalThis.toastr?.info?.('当前已是最新');
            else if (snap.status === 'unknown') globalThis.toastr?.warning?.(snap.message || '没能完成检测，请稍后再试。');
            else if (snap.status === 'available') globalThis.toastr?.info?.(snap.remoteVersion ? `发现新版本 ${snap.remoteVersion}` : '发现新版本');
        })();
    });
    available.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        void openUpdateLog();
    });
    void checkRabbitMirrorUpdate();
}

function paintRabbitIcons(snap = getRabbitMirrorUpdateSnapshot()) {
    const available = snap.status === 'available';
    document.querySelectorAll('[data-rm-tool-menu-button]').forEach(button => paintToolMenuUpdateIcon(button, available));
}

let hookInstalled = false;
export function installMirrorUpdateMenuHook() {
    if (hookInstalled) return;
    hookInstalled = true;
    globalThis.__rabbitMirrorDecorateToolMenu = mountMirrorUpdateRow;
    globalThis.__rabbitMirrorPaintUpdateIcon = button => paintToolMenuUpdateIcon(button, getRabbitMirrorUpdateSnapshot().status === 'available');
    subscribeRabbitMirrorUpdate(paintRabbitIcons);
    setupRabbitMirrorExtensionReloadWatch();
    // 菜单还没打开时也检测，标题栏兔子才能提前变样。
    void checkRabbitMirrorUpdate();
}
