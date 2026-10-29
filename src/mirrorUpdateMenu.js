import { rmT as __rmT } from "./textTable.js?rmv=1.99.12";
import { paintToolMenuUpdateIcon, themeMirrorToolPanel } from './mirrorToolMenu.js?rmv=1.99.12';
import { applyRabbitMirrorUpdateAndReload, checkRabbitMirrorUpdate, getRabbitMirrorUpdateSnapshot, isNewerRabbitMirrorVersion, loadRabbitMirrorReadme, runningRabbitMirrorVersion, setupRabbitMirrorExtensionReloadWatch, subscribeRabbitMirrorUpdate, } from './extensionUpdater.js?rmv=1.99.12';
const buttonStyle = 'display:block;width:100%;min-height:44px;margin-top:8px;padding:10px 12px;text-align:left;white-space:normal;border:1px solid var(--SmartThemeBorderColor,#bbb);border-radius:10px;background-color:#243044;background-image:linear-gradient(var(--SmartThemeBlurTintColor,#243044),var(--SmartThemeBlurTintColor,#243044));color:inherit;font:inherit;cursor:pointer;box-sizing:border-box;';
let sheet = null;
let applying = false;
let sheetKeyInstalled = false;
function paintRow(row, snap) {
    const check = row.querySelector('[data-rm-update-check]');
    if (!check)
        return;
    const checking = snap.status === 'checking';
    const available = snap.status === 'available';
    check.disabled = checking || applying;
    check.dataset.rmUpdateMode = available ? 'update' : 'check';
    if (available) {
        check.textContent = snap.remoteVersion ? `${__rmT("ssMGAdjV02kKVu4ulb4dHT")}${snap.remoteVersion}` : __rmT("QU7HO7F0vMjDHT");
        check.title = __rmT("vQdxJgGGHmR5I0VG");
        check.style.setProperty('border-color', 'var(--SmartThemeQuoteColor,#c47a3a)', 'important');
        check.style.setProperty('font-weight', '600', 'important');
        return;
    }
    check.textContent = checking ? __rmT("SNye6jwjGbG") : __rmT("U.XNj88djt.SIeuZ");
    check.title = snap.status === 'latest'
        ? __rmT("7whgkzs0D68ZEEgar13vpzM7uyBZqvtYRzZpA2SquKl") : snap.status === 'unknown'
        ? (snap.message || __rmT("nXEbtZTlq37BK_dkaNfdPuQUn6IO.5b1QmB"))
        : __rmT("6lk3t2VkrYU5KAdyziTEnc10cJ1GnT");
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
        : (section.title || __rmT("wNciFNDZS2T"));
    block.append(heading);
    if (!section.items?.length) {
        const empty = document.createElement('p');
        empty.textContent = __rmT("7xadU839T9Z366lxphnfG0gDbNs");
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
        fail.textContent = result?.message || __rmT("JdWafuSzWN_wGgJjdztql1VGv7ZkUIs2");
        body.append(fail);
        return;
    }
    const current = runningRabbitMirrorVersion();
    const newer = result.sections.filter(section => section.version && isNewerRabbitMirrorVersion(section.version, current));
    const show = full ? result.sections : (newer.length ? newer : result.sections.slice(0, 1)).slice(0, 12);
    if (full && result.sections.length > 1) {
        const hint = document.createElement('p');
        hint.textContent = `${__rmT("tB0CyT")}${result.sections.length}${__rmT("xBwPDuv85.v59zUfsXebIl8U3g0Pa0MO39l8MCAS")}`;
        body.append(hint);
    }
    else if (!full && !newer.length) {
        const note = document.createElement('p');
        note.textContent = __rmT("UM_GcAMXKsXwYlhBCsRA3poNu5ifuV8srpwx7ejG82_4uAz7NYf0oxQrPWk5aBNGghLYTkdDQg4wHMpBHIsOi3q9iNkcxf");
        body.append(note);
    }
    for (const section of show)
        body.append(sectionBlock(section));
}
function closeSheet() {
    if (!sheet?.isConnected || applying)
        return;
    sheet.remove();
}
function onSheetKey(event) {
    if (event.key !== 'Escape')
        return;
    closeSheet();
}
function ensureSheet() {
    if (!sheetKeyInstalled) {
        sheetKeyInstalled = true;
        document.addEventListener('keydown', onSheetKey);
    }
    if (sheet?.isConnected)
        return sheet;
    const overlay = document.createElement('dialog');
    overlay.setAttribute('data-rm-update-sheet', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;border:0;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(0,0,0,.45);color:inherit;';
    const card = document.createElement('section');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', __rmT("wNciF2tsYDY"));
    card.style.cssText = 'width:min(440px,100%);max-height:min(78vh,720px);display:flex;flex-direction:column;box-sizing:border-box;padding:16px;border:1px solid var(--SmartThemeBorderColor,#bbb);border-radius:15px;background-color:#243044;background-image:linear-gradient(var(--SmartThemeBlurTintColor,#243044),var(--SmartThemeBlurTintColor,#243044));color:var(--SmartThemeBodyColor,#34495d);box-shadow:0 8px 30px #0004;font:14px/1.5 sans-serif;';
    const title = document.createElement('strong');
    title.dataset.rmUpdateSheetTitle = 'true';
    title.textContent = __rmT("uS2FK93O36VYHf");
    title.style.cssText = 'display:block;margin-bottom:8px;font-size:16px;';
    const body = document.createElement('div');
    body.dataset.rmUpdateSheetBody = 'true';
    body.style.cssText = 'overflow:auto;min-height:0;flex:1 1 auto;padding-right:4px;';
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:8px;margin-top:12px;';
    const close = document.createElement('button');
    close.type = 'button';
    close.dataset.rmUpdateSheetClose = 'true';
    close.textContent = __rmT("t8hHPh");
    close.style.cssText = `${buttonStyle}margin-top:0;flex:1;`;
    const apply = document.createElement('button');
    apply.type = 'button';
    apply.dataset.rmUpdateSheetApply = 'true';
    apply.textContent = __rmT("Q6RMzMgmR6s");
    apply.style.cssText = `${buttonStyle}margin-top:0;flex:1;border-color:var(--SmartThemeQuoteColor,#c47a3a);`;
    actions.append(close, apply);
    card.append(title, body, actions);
    overlay.append(card);
    overlay.addEventListener('cancel', event => {
        event.preventDefault();
        closeSheet();
    });
    overlay.addEventListener('pointerdown', event => {
        if (event.target === overlay)
            closeSheet();
    });
    close.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        closeSheet();
    });
    apply.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (apply.dataset.rmReadyAt === undefined || Date.now() < Number(apply.dataset.rmReadyAt))
            return;
        void runApply(apply, close, body);
    });
    document.body.append(overlay);
    try {
        if (typeof overlay.showModal === 'function' && !overlay.open)
            overlay.showModal();
    }
    catch (error) {
        const settings = document.getElementById('rabbit_mirror_theater_settings');
        if (settings?.open)
            settings.append(overlay);
        console.warn(__rmT("0ntRcB.fj8nRJx729d5YYO5uuIJ1Sxz9LaHIHc3r_pQp7.9HYBDTJ6CfX0JUxi01knv2yRCHAIU0Jf"), error);
    }
    themeMirrorToolPanel(card);
    sheet = overlay;
    return overlay;
}
async function runApply(apply, close, body) {
    if (applying)
        return;
    applying = true;
    apply.disabled = true;
    close.disabled = true;
    apply.textContent = __rmT("wNciFjwjGbG");
    const wait = document.createElement('p');
    wait.textContent = __rmT("HQUI9TWnvD__EVmGoc3KkoM.RPU1_Ni2oeIpOllSV.3oRiQSm2etbHOcUCFcHSkC");
    body.prepend(wait);
    try {
        const result = await applyRabbitMirrorUpdateAndReload();
        if (result.skipped) {
            globalThis.toastr?.info?.(result.message || __rmT("VwH5II8Fi3KHvcxGWZd5idjgBCn77ftQqt8"));
            applying = false;
            apply.disabled = false;
            close.disabled = false;
            apply.textContent = __rmT("Q6RMzMgmR6s");
            wait.remove();
            return;
        }
        apply.textContent = __rmT("cIFOASIL0Muo8h");
    }
    catch (error) {
        applying = false;
        apply.disabled = false;
        close.disabled = false;
        apply.textContent = __rmT("Q6RMzMgmR6s");
        wait.remove();
        const message = String(error?.message || __rmT("E_yylKAKE57UYxirVnRMi.uwiLsA.v4T29E"));
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
        ? (snap.remoteVersion ? `${__rmT("mJAJgt8PjXZMIlBq")}${snap.remoteVersion}` : __rmT("uS2FK93O36VYHf"))
        : __rmT("wNciF2tsYDY");
    body.textContent = __rmT("Mr80UHSzoMBwGgJjdztql1VGv7ZkU4Eg");
    delete apply.dataset.rmReadyAt;
    if (!applying)
        apply.disabled = true;
    const readme = await loadRabbitMirrorReadme({ remoteUrl: snap.remoteUrl, remoteBranch: snap.remoteBranch });
    if (!overlay.isConnected)
        return;
    fillReadme(body, readme, { full: !updateMode });
    apply.dataset.rmReadyAt = String(Date.now() + 600);
    if (!applying)
        setTimeout(() => { if (apply.isConnected && !applying)
            apply.disabled = false; }, 600);
}
const scrollIcon = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M7 4h8a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"/><path d="M7 4v13a3 3 0 0 0 3 3"/><path d="M10 8h5M10 12h5"/></svg>';
function paintSettingsChrome(row, snap) {
    const badge = row.querySelector('[data-rm-settings-badge]');
    const action = row.querySelector('[data-rm-settings-update]');
    const version = runningRabbitMirrorVersion();
    if (badge)
        badge.textContent = version ? `v${version}` : __rmT("k2WvFq5XB9A");
    if (!action)
        return;
    const checking = snap.status === 'checking' || applying;
    action.disabled = checking || snap.status === 'latest';
    if (snap.status === 'available') {
        action.textContent = applying ? __rmT("wNciFjwjGbG") : __rmT("KXfr.EAo");
        action.title = __rmT("RROx1gaG.X3glBOOKVfsrHAd3g0Pa0MOgMlHMZGB");
        action.dataset.rmSettingsMode = 'update';
    }
    else if (snap.status === 'latest') {
        action.textContent = __rmT("iF2xFU2XR6s");
        action.title = __rmT("l24Vhznfe2VmguXmOH3aTh");
        action.dataset.rmSettingsMode = 'latest';
    }
    else if (checking) {
        action.textContent = __rmT("SNye6jwjGbG");
        action.title = __rmT("nHLZzD8djt.SIeuZ");
        action.dataset.rmSettingsMode = 'checking';
    }
    else if (snap.status === 'unknown') {
        action.textContent = __rmT("SNye6LbkGU_");
        action.title = snap.message || __rmT("_DHaTZfA.CLMMrMshEETH.tsth0izPQoTWQbdSgBpu4U01Krq8_");
        action.dataset.rmSettingsMode = 'check';
    }
    else {
        action.textContent = __rmT("SNye6NgmR6s");
        action.title = __rmT("6lk3t2VkrYU5KAdyziTEnc10cJ1GnT");
        action.dataset.rmSettingsMode = 'check';
    }
}
export function refreshRabbitMirrorUpdateOnOpen() {
    void checkRabbitMirrorUpdate({ force: true });
}
export function mountSettingsUpdateChrome(row) {
    if (!row || row.querySelector('[data-rm-settings-update]'))
        return;
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
    log.title = __rmT("vQdxJgGGHmR5I0VG");
    log.setAttribute('aria-label', __rmT("vQdxJgGGHmR5I0VG"));
    log.innerHTML = scrollIcon;
    row.append(badge, action, log);
    const render = () => { if (row.isConnected)
        paintSettingsChrome(row, getRabbitMirrorUpdateSnapshot()); };
    const unsubscribe = subscribeRabbitMirrorUpdate(render);
    const observer = new MutationObserver(() => {
        if (!row.isConnected) {
            unsubscribe();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    render();
    action.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (action.dataset.rmSettingsMode === 'update') {
            void openRabbitMirrorChangelog({ mode: 'update' });
            return;
        }
        if (action.dataset.rmSettingsMode !== 'check')
            return;
        void (async () => {
            const snap = await checkRabbitMirrorUpdate({ force: true });
            if (!row.isConnected)
                return;
            if (snap.status === 'available') {
                void openRabbitMirrorChangelog({ mode: 'update' });
                return;
            }
            if (snap.status === 'latest')
                globalThis.toastr?.info?.(__rmT("b91q42TnytzLIVuZ"));
            else if (snap.status === 'unknown')
                globalThis.toastr?.warning?.(snap.message || __rmT("FlW4cdkmO.iHxJ3haN7Ged7y01e_hvDC29E"));
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
    if (!panel || panel.querySelector('[data-rm-update-host]'))
        return;
    const host = document.createElement('div');
    host.dataset.rmUpdateHost = 'true';
    const check = document.createElement('button');
    check.type = 'button';
    check.dataset.rmUpdateCheck = 'true';
    check.style.cssText = buttonStyle;
    host.append(check);
    const close = panel.querySelector('[data-rm-tool-choice="close"]');
    if (close)
        panel.insertBefore(host, close);
    else
        panel.append(host);
    const render = () => { if (host.isConnected)
        paintRow(host, getRabbitMirrorUpdateSnapshot()); };
    const unsubscribe = subscribeRabbitMirrorUpdate(render);
    const observer = new MutationObserver(() => {
        if (!host.isConnected) {
            unsubscribe();
            observer.disconnect();
        }
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
            if (!host.isConnected)
                return;
            if (snap.status === 'latest')
                globalThis.toastr?.info?.(__rmT("b91q42TnytzLIVuZ"));
            else if (snap.status === 'unknown')
                globalThis.toastr?.warning?.(snap.message || __rmT("FlW4cdkmO.iHxJ3haN7Ged7y01e_hvDC29E"));
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
    if (hookInstalled)
        return;
    hookInstalled = true;
    globalThis.__rabbitMirrorDecorateToolMenu = mountMirrorUpdateRow;
    globalThis.__rabbitMirrorPaintUpdateIcon = button => paintToolMenuUpdateIcon(button, getRabbitMirrorUpdateSnapshot().status === 'available');
    subscribeRabbitMirrorUpdate(paintRabbitIcons);
    setupRabbitMirrorExtensionReloadWatch();
    void checkRabbitMirrorUpdate();
}
