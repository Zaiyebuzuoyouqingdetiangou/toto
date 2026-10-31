import { rmT as __rmT } from "./textTable.js?rmv=2.3.9";
import { getSettings, updateSettings } from './settings.js?rmv=2.3.9';
import { compareRabbitMirrorVersions, runningRabbitMirrorVersion } from './extensionUpdater.js?rmv=2.3.9';
import { themeMirrorToolPanel } from './mirrorToolMenu.js?rmv=2.3.9';
export const UPDATE_GUIDE_TIPS = Object.freeze([
    { id: 'sample-upload', since: '2.3.5', title: __rmT("xSWXkdK55pqIgerkkRmAo508TQ5I9k"), text: __rmT("1uM.uHLsSsLHjhAa_ZWLIQJsZ4kTBq2gAaDQypnARLxacCCweg3u6836rq9k6TCQqxz67rBQg0m4uo6CStrqk.kX6KYPMjgfY24iCbWyP_IBHP8MxzymLwlsQQJLq4WwK9THCeAc"), page: 'mirror', target: 'rh_repair_upload' },
    { id: 'self-invent', since: '2.3.0', title: __rmT("OZRqydFrGFtotFLDVmNKErqZmG5g3T"), text: __rmT("RNkKcHnaMYlnplpl7HpxtgN5l_CSxTEHla6dbbj1nDihybSArC6HGIzlpMisUcmWLz9RWgVJnCUZvEFdrPVeWna0R7djwKlnzh8FI7eHoodc.9xa8nwTPudwDdyOLwnJyOOLkyXH3qh6JdfF"), page: 'draw', target: 'rh_self_invent' },
    { id: 'face-health', since: '2.3.0', title: __rmT("guUPAJ8b3f1Vgzub"), text: __rmT("YjvHt9WAfXBcLNRkNMWTUOtkLwQ3oDh_WDRKzxfQ1wPA.jZUlKzRA2bJtwFiWABr3YeUgjZkIO.hw66w4pQehGJ.WAT"), page: 'health', target: 'rh_face_health_block' },
    { id: 'rollback', since: '2.2.0', title: __rmT("UFqopI6P96A"), text: __rmT("qM7KpackmUnkYcG80LEzJ3HEAGZZlVwQnsNfIo6CwF38mKNi4W8RNgJUAk7yasI7T2JG0OvrXf5QAkSXCfGxMTAHvAjx_bFYb9kpqOcs2VIUF1vCiemLuVmgAe.h8217eKBkVzSzERovYjmbWv3rZM5JyapZcz3K7h7_f7AXM1Nubr5GoHBEmBXticka4.rB3ACnESDzYafZbOQhSI.w8sbd7H.fFO52kMTT_BONTu_4wxI5pgAs692fGm5hd7en"), action: 'rollback' },
    { id: 'desktop-width', since: '2.1.4', title: __rmT("9NIyLdwEhZVaLn9MCsOgMxu."), text: __rmT("WevGsCtuVHOZICadd4MpJFhU27H57mdzGqxThQP14Yae0pcORARnfGt.zBG"), page: 'display', target: 'rh_desktop_face_zoom_width' },
]);
export function pendingUpdateTips(seen, current, tips = UPDATE_GUIDE_TIPS) {
    return tips.filter(tip => (!seen || compareRabbitMirrorVersions(tip.since, seen) > 0)
        && (!current || compareRabbitMirrorVersions(tip.since, current) <= 0)
        && (typeof tip.when !== 'function' || tip.when()));
}
const CARD_ATTR = 'data-rm-update-guide';
const HIGHLIGHT_ATTR = 'data-rm-guide-highlight';
let card = null;
let returnWatch = 0;
let session = null;
const buttonStyle = 'min-height:38px;padding:7px 12px;border:1px solid var(--SmartThemeBorderColor,#bbb);border-radius:10px;background:transparent;color:inherit;font:inherit;cursor:pointer;';
function markSeen(version) {
    try {
        updateSettings({ updateGuideSeenVersion: version });
    }
    catch { }
}
export function destroyUpdateGuide() {
    session = null;
    clearInterval(returnWatch);
    closeUpdateGuide();
}
export function closeUpdateGuide() {
    card?.remove();
    card = null;
}
function settingsRoot() { return document.getElementById('rabbit_mirror_theater_settings'); }
function settingsOpen() {
    const root = settingsRoot();
    return !!(root && !root.hidden && (root.open || root.hasAttribute('open')));
}
const frames = (count = 2) => new Promise(resolve => {
    const step = left => (left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1)));
    step(count);
});
function highlight(nodes) {
    const list = nodes.filter(Boolean);
    for (const node of list)
        node.setAttribute(HIGHLIGHT_ATTR, 'true');
    setTimeout(() => { for (const node of list)
        node.removeAttribute(HIGHLIGHT_ATTR); }, 4200);
}
function watchForReturn() {
    clearInterval(returnWatch);
    const startedAt = Date.now();
    returnWatch = setInterval(() => {
        if (Date.now() - startedAt > 15 * 60 * 1000 || !session?.remaining?.length) {
            clearInterval(returnWatch);
            return;
        }
        if (settingsOpen() || document.querySelector('[data-rm-update-sheet]'))
            return;
        clearInterval(returnWatch);
        showUpdateGuideCard(session.remaining, session.version, { all: !!session.all });
    }, 900);
}
export async function goToUpdateTip(tip) {
    closeUpdateGuide();
    if (session)
        session.remaining = session.remaining.filter(item => item.id !== tip.id);
    if (tip.action === 'rollback') {
        const menu = await import('./mirrorUpdateMenu.js?rmv=2.3.9');
        await menu.openRabbitMirrorRollback();
        watchForReturn();
        return true;
    }
    const root = settingsRoot();
    const workbench = root?.__rabbitMirrorWorkbench;
    if (!workbench) {
        globalThis.toastr?.info?.(__rmT("3NnMF1jw3ubBNI3bqS3MPln1h5dHd1bOdcRaESgBbLwU01Krq8_"));
        return false;
    }
    workbench.open();
    if (tip.page)
        workbench.navigate(tip.page);
    await frames(2);
    const target = tip.target ? document.getElementById(tip.target) : null;
    if (target) {
        const label = target.id ? root.querySelector(`label[for="${target.id}"]`) : null;
        const wrap = target.closest('label') || label || target;
        try {
            wrap.scrollIntoView({ block: 'center' });
        }
        catch { }
        highlight([wrap, label && label !== wrap ? target : null]);
    }
    watchForReturn();
    return true;
}
export function showUpdateGuideCard(tips, version = runningRabbitMirrorVersion(), { all = false } = {}) {
    closeUpdateGuide();
    if (!tips?.length)
        return null;
    session = { version, remaining: [...tips], all };
    const node = document.createElement('section');
    node.setAttribute(CARD_ATTR, 'true');
    node.setAttribute('role', 'dialog');
    node.setAttribute('aria-label', __rmT("oNm9IIg2HmlQl7iq"));
    node.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom, 0px) + 84px);z-index:10040;'
        + 'box-sizing:border-box;width:min(420px, calc(100vw - 24px));max-height:min(62vh, 560px);max-height:min(62dvh, 560px);overflow:auto;overscroll-behavior:contain;'
        + 'padding:14px 14px 12px;border:1px solid var(--SmartThemeBorderColor,#bbb);border-radius:15px;background-color:#243044;'
        + 'background-image:linear-gradient(var(--SmartThemeBlurTintColor,#243044),var(--SmartThemeBlurTintColor,#243044));color:var(--SmartThemeBodyColor,#34495d);'
        + 'box-shadow:0 8px 30px #0005;font:14px/1.5 sans-serif;';
    const head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:flex-start;gap:8px;';
    const title = document.createElement('strong');
    title.style.cssText = 'flex:1;min-width:0;font-size:15px;';
    title.textContent = all ? __rmT(".tQmaa1VItXLumOqCs058yZx") : `${__rmT(".PLrau.QlFtD138rL4zIUmvXzus")}${version}`;
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', __rmT("t8hHPh"));
    close.style.cssText = `${buttonStyle}min-height:32px;min-width:32px;padding:0 8px;line-height:1;`;
    head.append(title, close);
    const lead = document.createElement('p');
    lead.style.cssText = 'margin:6px 0 8px;opacity:.85;';
    lead.textContent = tips.length > 1 ? `${__rmT("Ix4jquVJFCxBTh")}${tips.length}${__rmT("uNYYr1laN5UUYaap2hSY9dQ49WB6Oi46_af")}` : __rmT("H_gBzUETce_8dXqIMf05wOuGqmE8TsbTAogo8rXglAp");
    const list = document.createElement('div');
    for (const tip of tips) {
        const row = document.createElement('div');
        row.setAttribute('data-rm-guide-tip', tip.id);
        row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid color-mix(in srgb,currentColor 14%,transparent);';
        const words = document.createElement('div');
        words.style.cssText = 'flex:1;min-width:0;';
        const name = document.createElement('b');
        name.style.cssText = 'display:block;';
        name.textContent = tip.title;
        const text = document.createElement('small');
        text.style.cssText = 'display:block;opacity:.8;line-height:1.45;';
        text.textContent = tip.text;
        words.append(name, text);
        const go = document.createElement('button');
        go.type = 'button';
        go.textContent = __rmT("734FHqBl");
        go.setAttribute('data-rm-guide-go', tip.id);
        go.style.cssText = `${buttonStyle}flex:none;border-color:var(--SmartThemeQuoteColor,#c47a3a);`;
        go.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            void goToUpdateTip(tip).then(ok => { if (ok && !all)
                markSeen(version); });
        });
        row.append(words, go);
        list.append(row);
    }
    const foot = document.createElement('div');
    foot.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;margin-top:8px;';
    const done = document.createElement('button');
    done.type = 'button';
    done.textContent = __rmT("rmZOftEc");
    done.setAttribute('data-rm-guide-done', 'true');
    done.style.cssText = buttonStyle;
    const never = document.createElement('button');
    never.type = 'button';
    never.textContent = __rmT("Y0.1A7HJ6MIziT");
    never.setAttribute('data-rm-guide-never', 'true');
    never.style.cssText = `${buttonStyle}opacity:.8;`;
    const finish = () => { if (!all)
        markSeen(version); session = null; clearInterval(returnWatch); closeUpdateGuide(); };
    done.addEventListener('click', event => { event.preventDefault(); finish(); });
    close.addEventListener('click', event => { event.preventDefault(); finish(); });
    never.addEventListener('click', event => {
        event.preventDefault();
        try {
            updateSettings({ updateGuideEnabled: false, updateGuideSeenVersion: version });
        }
        catch { }
        session = null;
        clearInterval(returnWatch);
        closeUpdateGuide();
        try {
            const box = document.getElementById('rh_update_guide_enabled');
            if (box)
                box.checked = false;
        }
        catch { }
        globalThis.toastr?.info?.(__rmT("FHJHD18VmdBjpQplCnyo8jNeMGmtP1MttwhbKLx4HlijhUCKrrGq_Cbvmv6ERD98PhwzS.KzcFC_J7OvUxRDcef2D9V.3nYO"));
    });
    if (all)
        foot.append(done);
    else
        foot.append(never, done);
    node.append(head, lead, list, foot);
    (settingsOpen() ? settingsRoot() : document.body).append(node);
    themeMirrorToolPanel(node);
    node.addEventListener('keydown', event => { if (event.key === 'Escape') {
        event.preventDefault();
        finish();
    } });
    card = node;
    return node;
}
export function maybeShowUpdateGuide({ delayMs = 5000, tries = 12 } = {}) {
    const check = left => {
        let settings = null;
        try {
            settings = getSettings();
        }
        catch {
            return;
        }
        if (settings?.updateGuideEnabled === false)
            return;
        const current = runningRabbitMirrorVersion();
        if (!current)
            return;
        const seen = String(settings?.updateGuideSeenVersion || '');
        if (seen === 'fresh') {
            markSeen(current);
            return;
        }
        if (seen && compareRabbitMirrorVersions(seen, current) >= 0)
            return;
        const tips = pendingUpdateTips(seen, current);
        if (!tips.length) {
            markSeen(current);
            return;
        }
        const busy = settingsOpen() || document.querySelector('[data-rm-update-sheet], [data-rm-tool-menu], [data-rm-update-guide]')
            || (document.getElementById('mes_stop') && getComputedStyle(document.getElementById('mes_stop')).display !== 'none');
        if (busy) {
            if (left > 0)
                setTimeout(() => check(left - 1), 5000);
            return;
        }
        showUpdateGuideCard(tips, current);
    };
    setTimeout(() => check(tries), delayMs);
}
export function showAllUpdateTips() {
    const current = runningRabbitMirrorVersion();
    return showUpdateGuideCard(pendingUpdateTips('', current), current, { all: true });
}
