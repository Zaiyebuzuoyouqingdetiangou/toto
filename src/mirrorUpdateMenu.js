// 版本更新放在镜面工具菜单底部，不再单独开设置页。
// 有新版本时点「有更新」才去读仓库 README；更新成功后的刷新和预设备忘录一样。

import { paintToolMenuUpdateIcon, themeMirrorToolPanel } from './mirrorToolMenu.js?rmv=1.66.8';
import {
    applyRabbitMirrorUpdateAndReload,
    checkRabbitMirrorUpdate,
    getRabbitMirrorUpdateSnapshot,
    isNewerRabbitMirrorVersion,
    loadRabbitMirrorReadme,
    runningRabbitMirrorVersion,
    setupRabbitMirrorExtensionReloadWatch,
    subscribeRabbitMirrorUpdate,
} from './extensionUpdater.js?rmv=1.66.8';

const buttonStyle = 'display:block;width:100%;min-height:44px;margin-top:8px;padding:10px 12px;text-align:left;white-space:normal;border:1px solid var(--SmartThemeBorderColor,#bbb);border-radius:10px;background-color:#243044;background-image:linear-gradient(var(--SmartThemeBlurTintColor,#243044),var(--SmartThemeBlurTintColor,#243044));color:inherit;font:inherit;cursor:pointer;box-sizing:border-box;';
let sheet = null;
let applying = false;
let sheetKeyInstalled = false;

function paintRow(row, snap) {
    const check = row.querySelector('[data-rm-update-check]');
    if (!check) return;
    const checking = snap.status === 'checking';
    const available = snap.status === 'available';
    check.disabled = checking || applying;
    check.dataset.rmUpdateMode = available ? 'update' : 'check';
    if (available) {
        check.textContent = snap.remoteVersion ? `↑ 有更新 · ${snap.remoteVersion}` : '↑ 有更新';
        check.title = '查看更新日志';
        check.style.setProperty('border-color', 'var(--SmartThemeQuoteColor,#c47a3a)', 'important');
        check.style.setProperty('font-weight', '600', 'important');
        return;
    }
    check.textContent = checking ? '检测中…' : '↻ 检测更新';
    check.title = snap.status === 'latest'
        ? '当前已是最新，再点一次可重新检测'
        : snap.status === 'unknown'
            ? (snap.message || '上次检测失败，点击重新检测')
            : '检测兔子镜是否有新版本';
    check.style.removeProperty('border-color');
    check.style.removeProperty('font-weight');
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

function fillReadme(body, result, { full = false } = {}) {
    body.replaceChildren();
    if (!result?.ok) {
        const fail = document.createElement('p');
        fail.textContent = result?.message || '没能读到 README。';
        body.append(fail);
        return;
    }
    const current = runningRabbitMirrorVersion();
    const newer = result.sections.filter(section => section.version && isNewerRabbitMirrorVersion(section.version, current));
    const show = full ? result.sections : (newer.length ? newer : result.sections.slice(0, 1)).slice(0, 12);
    if (full && result.sections.length > 1) {
        const hint = document.createElement('p');
        hint.textContent = `共 ${result.sections.length} 个版本，向下滚动查看更早更新`;
        body.append(hint);
    } else if (!full && !newer.length) {
        const note = document.createElement('p');
        note.textContent = 'README 里还没有比当前版本更高的条目，下面是这次读到的最新说明。';
        body.append(note);
    }
    for (const section of show) body.append(sectionBlock(section));
}

function closeSheet() {
    if (!sheet?.isConnected || applying) return;
    sheet.remove();
}

function onSheetKey(event) {
    if (event.key !== 'Escape') return;
    closeSheet();
}

function ensureSheet() {
    if (!sheetKeyInstalled) {
        sheetKeyInstalled = true;
        document.addEventListener('keydown', onSheetKey);
    }
    if (sheet?.isConnected) return sheet;
    const overlay = document.createElement('dialog');
    overlay.setAttribute('data-rm-update-sheet', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;border:0;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(0,0,0,.45);color:inherit;';
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
    apply.textContent = '确认更新';
    apply.style.cssText = `${buttonStyle}margin-top:0;flex:1;border-color:var(--SmartThemeQuoteColor,#c47a3a);`;
    actions.append(close, apply);
    card.append(title, body, actions);
    overlay.append(card);
    overlay.addEventListener('cancel', event => {
        event.preventDefault();
        closeSheet();
    });
    overlay.addEventListener('pointerdown', event => {
        if (event.target === overlay) closeSheet();
    });
    close.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        closeSheet();
    });
    apply.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        void runApply(apply, close, body);
    });
    document.body.append(overlay);
    try {
        // 插件设置本身是 showModal 的顶层对话框，普通节点再高的 z-index 也在它下面。
        if (typeof overlay.showModal === 'function' && !overlay.open) overlay.showModal();
    } catch (error) {
        const settings = document.getElementById('rabbit_mirror_theater_settings');
        if (settings?.open) settings.append(overlay);
        console.warn('[RabbitMirror] 更新日志没能单独盖住插件面板', error);
    }
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
            apply.textContent = '确认更新';
            wait.remove();
            return;
        }
        apply.textContent = '正在刷新…';
    } catch (error) {
        applying = false;
        apply.disabled = false;
        close.disabled = false;
        apply.textContent = '确认更新';
        wait.remove();
        const message = String(error?.message || '更新失败，请检查宿主日志。');
        globalThis.toastr?.error?.(message);
    }
}

async function openRabbitMirrorChangelog({ mode = 'view' } = {}) {
    const overlay = ensureSheet();
    const body = overlay.querySelector('[data-rm-update-sheet-body]');
    const title = overlay.querySelector('[data-rm-update-sheet-title]');
    const apply = overlay.querySelector('[data-rm-update-sheet-apply]');
    const updateMode = mode === 'update';
    apply.hidden = !updateMode;
    apply.style.setProperty('display', updateMode ? 'block' : 'none', 'important');
    const snap = getRabbitMirrorUpdateSnapshot();
    title.textContent = updateMode
        ? (snap.remoteVersion ? `发现新版本 ${snap.remoteVersion}` : '发现新版本')
        : '更新日志';
    body.textContent = '正在读取 README…';
    const readme = await loadRabbitMirrorReadme({ remoteUrl: snap.remoteUrl, remoteBranch: snap.remoteBranch });
    if (!overlay.isConnected) return;
    fillReadme(body, readme, { full: !updateMode });
}

const scrollIcon = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M7 4h8a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"/><path d="M7 4v13a3 3 0 0 0 3 3"/><path d="M10 8h5M10 12h5"/></svg>';

function paintSettingsChrome(row, snap) {
    const badge = row.querySelector('[data-rm-settings-badge]');
    const action = row.querySelector('[data-rm-settings-update]');
    const version = runningRabbitMirrorVersion();
    if (badge) badge.textContent = version ? `v${version}` : '版本未知';
    if (!action) return;
    const checking = snap.status === 'checking' || applying;
    action.disabled = checking || snap.status === 'latest';
    if (snap.status === 'available') {
        action.textContent = applying ? '更新中…' : '有更新';
        action.title = '发现扩展更新，点击查看更新日志';
        action.dataset.rmSettingsMode = 'update';
    } else if (snap.status === 'latest') {
        action.textContent = '已是最新';
        action.title = '当前版本已是最新';
        action.dataset.rmSettingsMode = 'latest';
    } else if (checking) {
        action.textContent = '检测中…';
        action.title = '正在检测更新';
        action.dataset.rmSettingsMode = 'checking';
    } else if (snap.status === 'unknown') {
        action.textContent = '检测失败';
        action.title = snap.message || '网络不好，没能完成检测。点击再试一次。';
        action.dataset.rmSettingsMode = 'check';
    } else {
        action.textContent = '检测更新';
        action.title = '检测兔子镜是否有新版本';
        action.dataset.rmSettingsMode = 'check';
    }
}

export function refreshRabbitMirrorUpdateOnOpen() {
    void checkRabbitMirrorUpdate({ force: true });
}

export function mountSettingsUpdateChrome(row) {
    if (!row || row.querySelector('[data-rm-settings-update]')) return;
    const badge = document.createElement('span');
    badge.className = 'rh-ui-version-badge';
    badge.dataset.rmSettingsBadge = 'true';
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'rh-ui-version-update';
    action.dataset.rmSettingsUpdate = 'true';
    const log = document.createElement('button');
    log.type = 'button';
    log.className = 'rh-ui-version-log';
    log.title = '查看更新日志';
    log.setAttribute('aria-label', '查看更新日志');
    log.innerHTML = scrollIcon;
    row.append(badge, action, log);
    const render = () => { if (row.isConnected) paintSettingsChrome(row, getRabbitMirrorUpdateSnapshot()); };
    const unsubscribe = subscribeRabbitMirrorUpdate(render);
    const root = row.parentElement;
    const observer = new MutationObserver(() => {
        if (!row.isConnected) { unsubscribe(); observer.disconnect(); }
    });
    if (root) observer.observe(root, { childList: true, subtree: true });
    render();
    action.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (action.dataset.rmSettingsMode === 'update') {
            void openRabbitMirrorChangelog({ mode: 'update' });
            return;
        }
        if (action.dataset.rmSettingsMode !== 'check') return;
        void (async () => {
            const snap = await checkRabbitMirrorUpdate({ force: true });
            if (!row.isConnected) return;
            if (snap.status === 'available') {
                void openRabbitMirrorChangelog({ mode: 'update' });
                return;
            }
            if (snap.status === 'latest') globalThis.toastr?.info?.('当前已是最新');
            else if (snap.status === 'unknown') globalThis.toastr?.warning?.(snap.message || '没能完成检测，请稍后再试。');
        })();
    });
    log.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        void openRabbitMirrorChangelog({ mode: 'view' });
    });
    void checkRabbitMirrorUpdate();
}

function mountMirrorUpdateRow(panel) {
    if (!panel || panel.querySelector('[data-rm-update-host]')) return;
    const host = document.createElement('div');
    host.dataset.rmUpdateHost = 'true';
    const check = document.createElement('button');
    check.type = 'button';
    check.dataset.rmUpdateCheck = 'true';
    check.style.cssText = buttonStyle;
    host.append(check);
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
        if (check.dataset.rmUpdateMode === 'update') {
            void openRabbitMirrorChangelog({ mode: 'update' });
            return;
        }
        void (async () => {
            const snap = await checkRabbitMirrorUpdate({ force: true });
            if (!host.isConnected) return;
            if (snap.status === 'latest') globalThis.toastr?.info?.('当前已是最新');
            else if (snap.status === 'unknown') globalThis.toastr?.warning?.(snap.message || '没能完成检测，请稍后再试。');
        })();
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
