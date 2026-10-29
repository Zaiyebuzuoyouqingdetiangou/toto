import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=1.99.14";
import { RUNTIME_VERSION } from './ui/runtime.js?rmv=1.99.14';
export const THEATER_SNAPSHOT_PAGE_SIZE = 10;
const GENERATING_PLACEHOLDER = __rmR("fHMzM4BtaqM2L2tfR0kFG94cofYHtJklITg.EzPL0qURCpVB53Y", "");
const FAILURE_MARK = __rmR("MgDOkYgsodAHzAgueF5sr.DsJQQYfl8mjLY8npEe1APZEhpt2A1rR9tgRH7tTDkSptjSAxWHyE.i8FXWHRJESicrrrw.TjToUfIMJsRDPqbyooc8I7ehCA4z0T2AvtTigAN7wVqNxoVF7xAM6VJq6Bjgm5vdzNkPdPY12.flzgkjBdtqr8l8dDURM.ICSqbDT0j240Yr6qOSbqG4itNrbROh5YSvtjbMt1KS8ujAvxtNOIGiZ55VMbUiJX9bvAXIwcPXUkiJkPO6YTUwBi3wlV2sL38q0k", "");
const NOTICE_FAILURE_MARK = __rmR("35IERepU1gHicLqdIyPyrgQErJSZaljhFEkCcdSKEXT", "");
const MIRROR_MARK = __rmR("pE8GQ37Ul9idqQiQ5P32K2tc8VyO5rLfpzmG83odTxPyjya5F.eK7zI1rhSizxF0rIhboa17rc1NOw6IfLlyjUDGqbfupfklPYRJ2OPtLhMbtD0IL6T4Utbf7NWhYhNGDtLuhl8SoJT", "");
export function currentSwipeId(message) {
    const swipe = Number(message?.swipe_id ?? message?.swipeId ?? 0);
    return Number.isInteger(swipe) && swipe > 0 ? swipe : 0;
}
export function messageSwipeText(message) {
    const swipe = currentSwipeId(message);
    const version = message?.swipes?.[swipe];
    return typeof version === 'string' ? version : String(message?.mes || '');
}
export function extractMirrorHtml(text) {
    const source = String(text || '').trim();
    if (!source || !MIRROR_MARK.test(source))
        return '';
    if (/^<(?:toto|details)\b/i.test(source))
        return source;
    const matches = source.match(/<toto\b[^>]*(?:data-rabbit-mirror|data-rabbit-hole)=["']true["'][^>]*>[\s\S]*?<\/toto>/gi);
    return matches?.join('') || '';
}
export function snapshotTitleFromHtml(html) {
    const summary = String(html || '').match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
    const raw = summary ? summary[1].replace(/<[^>]+>/g, ' ') : '';
    const title = raw
        .replace(/[‹<]\s*\d+\s*\/\s*\d+\s*[›>]/g, '')
        .replace(/[×✕]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 120);
    return title || __rmT("9.JSSv1i");
}
export function snapshotPlainText(text) {
    return String(text || '')
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 240);
}
function isGeneratingPlaceholder(html) {
    return GENERATING_PLACEHOLDER.test(String(html || '')) && !FAILURE_MARK.test(String(html || ''));
}
function isMirrorFailure(text) {
    return FAILURE_MARK.test(String(text || ''));
}
function isMirrorFailureNotice(text) {
    return FAILURE_MARK.test(String(text || '')) || NOTICE_FAILURE_MARK.test(String(text || ''));
}
function classifyFloor({ index, swipe, text, saved, savedStale = false, errorText }) {
    const fromText = extractMirrorHtml(text);
    const savedHtml = String(saved || '').trim();
    const fromSaved = extractMirrorHtml(savedHtml);
    const html = [fromText, fromSaved].find(value => value && !isGeneratingPlaceholder(value)) || '';
    if (html) {
        return {
            mesid: index,
            swipe,
            kind: 'ready',
            html,
            title: snapshotTitleFromHtml(html),
            failed: isMirrorFailure(html) || isMirrorFailure(text) || isMirrorFailureNotice(errorText),
            stale: !!(savedStale && html === fromSaved && html !== fromText),
            errorText: '',
        };
    }
    const notice = snapshotPlainText(errorText) || (isMirrorFailure(text) ? snapshotPlainText(text) : '');
    if (!notice)
        return null;
    return {
        mesid: index,
        swipe,
        kind: 'error',
        html: '',
        title: __rmT("vDfth4Aq3ITwujUNIKxsADu0"),
        failed: true,
        errorText: notice,
    };
}
export function collectTheaterSnapshots(chat, sources = {}) {
    const list = Array.isArray(chat) ? chat : [];
    const savedByKey = new Map();
    const staleKeys = new Set();
    for (const row of sources.persisted || []) {
        if (!row || !Number.isInteger(row.index) || row.index < 0)
            continue;
        const swipe = Number.isInteger(row.swipe) && row.swipe > 0 ? row.swipe : 0;
        savedByKey.set(`${row.index}:${swipe}`, String(row.html || ''));
        if (row.stale)
            staleKeys.add(`${row.index}:${swipe}`);
    }
    const errors = new Map();
    for (const row of sources.domErrors || []) {
        const mesid = Number(row?.mesid);
        const text = String(row?.text || '').trim();
        if (Number.isInteger(mesid) && mesid >= 0 && text)
            errors.set(mesid, text);
    }
    const items = [];
    for (let index = list.length - 1; index >= 0; index -= 1) {
        const message = list[index];
        if (!message || message.is_user === true)
            continue;
        const swipe = currentSwipeId(message);
        const item = classifyFloor({
            index,
            swipe,
            text: messageSwipeText(message),
            saved: savedByKey.get(`${index}:${swipe}`) || '',
            savedStale: staleKeys.has(`${index}:${swipe}`),
            errorText: errors.get(index) || '',
        });
        if (item)
            items.push(item);
    }
    return items;
}
export function expandSnapshotVersions(items, versionsByKey, merge = (_html, _face, faceHtml) => faceHtml) {
    const out = [];
    for (const item of Array.isArray(items) ? items : []) {
        const states = item?.kind === 'ready' ? versionsByKey?.get?.(`${item.mesid}:${item.swipe}`) : null;
        const faces = Object.entries(states || {})
            .map(([face, state]) => ({ face: Number(face), versions: Array.isArray(state?.versions) ? state.versions.filter(entry => entry?.html) : [], current: Math.max(0, Number(state?.currentIndex) || 0) }))
            .filter(entry => Number.isInteger(entry.face) && entry.face >= 0 && entry.versions.length > 1)
            .sort((a, b) => a.face - b.face);
        if (!faces.length) {
            out.push(item);
            continue;
        }
        const multi = faces.length > 1 || faces[0].face > 0;
        const label = (face, index, total) => `${multi ? `${__rmT("BJgCyT")}${face + 1}${__rmT("UqYPp0_pSlRBTh")}` : ''}${__rmT("BJgCyT")}${index + 1}/${total}${__rmT("2RdlZf")}`;
        const main = { ...item, versionLabel: faces.map(entry => label(entry.face, Math.min(entry.current, entry.versions.length - 1), entry.versions.length)).join(__rmT("Yis")) };
        out.push(main);
        for (const entry of faces) {
            entry.versions.forEach((version, index) => {
                if (index === Math.min(entry.current, entry.versions.length - 1))
                    return;
                let html = '';
                try {
                    html = String(merge(item.html, entry.face, version.html) || '');
                }
                catch {
                    html = '';
                }
                if (!html)
                    html = String(version.html || '');
                out.push({ ...item, html, title: snapshotTitleFromHtml(html) || item.title, failed: isMirrorFailure(html),
                    versionLabel: label(entry.face, index, entry.versions.length), versionOf: { face: entry.face, index } });
            });
        }
    }
    return out;
}
export function theaterSnapshotPage(items, page = 0) {
    const list = Array.isArray(items) ? items : [];
    const pages = Math.max(1, Math.ceil(list.length / THEATER_SNAPSHOT_PAGE_SIZE) || 1);
    const index = Math.min(pages - 1, Math.max(0, Math.floor(Number(page) || 0)));
    const start = index * THEATER_SNAPSHOT_PAGE_SIZE;
    return {
        page: index,
        pages,
        total: list.length,
        start,
        items: list.slice(start, start + THEATER_SNAPSHOT_PAGE_SIZE),
    };
}
const SNAPSHOT_STYLE = `
[data-rm-snapshot-shelf]{display:flex;flex-direction:column;gap:14px;color:var(--rh-text,var(--SmartThemeBodyColor,#34495d));font-size:14px;line-height:1.5}
[data-rm-snapshot-shelf] button{font:inherit;color:inherit;cursor:pointer}
[data-rm-snapshot-shelf] button:focus-visible{outline:2px solid var(--rh-primary,#ce729c);outline-offset:2px}
[data-rm-snapshot-shelf] button:disabled{opacity:.38;cursor:default}
.rm-snap-head{display:flex;align-items:flex-start;gap:10px}
.rm-snap-title{flex:1;min-width:0;margin:0;font-size:20px;font-weight:800;letter-spacing:.02em}
.rm-snap-count{font-size:13px;font-weight:600;color:var(--rh-muted,inherit);margin-left:6px}
.rm-snap-note{margin:4px 0 0;font-size:12px;font-weight:500;color:var(--rh-muted,inherit)}
.rm-snap-close{width:40px;height:40px;border-radius:50%;border:0;background:color-mix(in srgb,currentColor 8%,transparent);font-size:20px;line-height:1}
.rm-snap-tools{display:flex;align-items:center;gap:8px}
.rm-snap-view{display:flex;flex:0 0 auto;padding:3px;border-radius:12px;border:1px solid var(--rh-border,rgba(127,127,127,.35))}
.rm-snap-view button{min-height:32px;padding:0 11px;border:0;border-radius:9px;background:transparent;font-size:13px}
.rm-snap-view button[aria-pressed="true"]{background:color-mix(in srgb,var(--rh-primary,#ce729c) 16%,transparent);color:var(--rh-primary,#ce729c);font-weight:700}
.rm-snap-pager{display:flex;align-items:center;gap:8px;position:sticky;top:0;z-index:2;padding:2px 0 8px;background:var(--rh-bg,var(--SmartThemeBlurTintColor,#f5f4fb))}
.rm-snap-pager button{flex:0 0 auto;min-height:36px;padding:0 12px;border-radius:999px;border:1px solid var(--rh-border,rgba(127,127,127,.35));background:transparent}
.rm-snap-range{flex:1;min-width:0;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 8px;text-align:center;font-size:12px;font-weight:700;color:var(--rh-muted,inherit)}
.rm-snap-page-select{min-height:36px;max-width:100%;padding:0 8px;border-radius:999px;border:1px solid var(--rh-border,rgba(127,127,127,.35));background:var(--rh-field,var(--rh-bg,#fff));color:inherit;font:inherit;font-size:13px}
.rm-snap-list{display:flex;flex-direction:column;gap:14px}
.rm-snap-card{display:flex;flex-direction:column;gap:8px;min-width:0;padding:12px;border:1px solid var(--rh-border,rgba(127,127,127,.28));border-radius:16px;background:color-mix(in srgb,var(--rh-field,var(--rh-bg,#fff)) 88%,transparent)}
.rm-snap-card[data-failed="true"]{border-color:color-mix(in srgb,#c0504d 45%,var(--rh-border,transparent))}
.rm-snap-bar{display:flex;align-items:center;gap:8px;min-width:0}
.rm-snap-floor{flex:0 0 auto;min-height:32px;padding:0 10px;border-radius:999px;border:0;background:var(--rh-primary,#ce729c);color:#fff;font-size:12px;font-weight:800}
.rm-snap-name{flex:1;min-width:0;margin:0;font-size:14px;font-weight:700;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rm-snap-chip{flex:0 0 auto;font-size:11px;font-weight:700;color:#c0504d}
.rm-snap-jump,.rm-snap-star{flex:0 0 auto;min-height:32px;padding:0 10px;border-radius:999px;border:1px solid var(--rh-border,rgba(127,127,127,.35));background:transparent;font-size:12px;font-weight:700}
.rm-snap-star[aria-pressed="true"]{border-color:var(--rh-primary,#ce729c);color:var(--rh-primary,#ce729c)}
.rm-snap-stage{position:relative;max-width:100%;overflow:auto;isolation:isolate}
.rm-snap-error{margin:0;font-size:13px;line-height:1.55;color:var(--rh-muted,inherit)}
.rm-snap-empty{padding:36px 12px;text-align:center;color:var(--rh-muted,inherit);font-size:13px;line-height:1.7}
.rm-snap-empty strong{display:block;font-size:15px;color:var(--rh-text,inherit);margin-bottom:4px}
.rm-snap-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.rm-snap-tile{display:flex;flex-direction:column;gap:7px;min-width:0}
.rm-snap-plate{position:relative;display:block;width:100%;aspect-ratio:4/5;padding:0;border:1px solid var(--rh-border,rgba(127,127,127,.3));border-radius:14px;overflow:hidden;background:var(--plate,var(--rh-primary,#ce729c));box-shadow:0 4px 14px rgba(0,0,0,.12);cursor:pointer}
.rm-snap-plate[data-failed="true"]{background:color-mix(in srgb,#c0504d 18%,var(--rh-bg,#fff))}
.rm-snap-thumb{position:absolute;left:0;top:0;width:420px;height:525px;border:0;transform-origin:0 0;transform:scale(var(--thumb-scale,.4));pointer-events:none;background:transparent}
.rm-snap-plate-copy{position:absolute;z-index:1;left:10px;right:10px;bottom:36px;font-size:12px;font-weight:700;line-height:1.4;text-align:left;color:#2b2b2b}
.rm-snap-plate-floor{position:absolute;z-index:1;left:8px;bottom:8px;min-height:26px;padding:0 8px;border:0;border-radius:999px;background:rgba(255,255,255,.86);color:#2b2b2b;font-size:11px;font-weight:800}
.rm-snap-tile-name{margin:0;font-size:13px;font-weight:700;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rm-snap-viewer{position:fixed;inset:0;z-index:10090;display:flex;align-items:center;justify-content:center;padding:max(16px,env(safe-area-inset-top)) 12px max(16px,env(safe-area-inset-bottom));box-sizing:border-box;background:rgba(8,10,14,.72)}
.rm-snap-viewer-card{width:min(820px,100%);max-height:min(88vh,100%);overflow:auto;padding:16px;border-radius:18px;background:var(--rh-bg,var(--SmartThemeBlurTintColor,#f5f4fb));box-sizing:border-box}
@keyframes rm-snapshot-flash{0%{outline:3px solid var(--rh-primary,#ce729c)}100%{outline:3px solid transparent}}
[data-rm-snapshot-flash="true"]{animation:rm-snapshot-flash 1.4s ease;outline-offset:4px}
`;
const SNAPSHOT_VIEW_KEY = 'rabbitMirrorSnapshotView';
const THUMB_WIDTH = 420;
let snapshot = null;
let thumbObserver = null;
let openGeneration = 0;
const closeFromRuntime = () => closeTheaterSnapshot();
closeFromRuntime.runtime = RUNTIME_VERSION;
globalThis.__rabbitMirrorCloseSnapshot = closeFromRuntime;
function resetThumbs() {
    thumbObserver?.disconnect?.();
    thumbObserver = null;
}
function overlayParent() {
    const settings = document.getElementById('rabbit_mirror_theater_settings');
    if (settings?.tagName === 'DIALOG' && (settings.open || settings.hasAttribute('open')))
        return settings;
    return document.body;
}
export function closeTheaterSnapshot() {
    openGeneration += 1;
    closeSnapshotNow();
}
function closeSnapshotNow() {
    if (!snapshot)
        return;
    resetThumbs();
    const { overlay, keydown, onFavoritesChanged, onResize } = snapshot;
    document.removeEventListener('keydown', keydown, true);
    if (onResize)
        globalThis.removeEventListener?.('resize', onResize);
    if (onFavoritesChanged)
        document.removeEventListener(snapshot.favoritesEvent, onFavoritesChanged);
    try {
        if (overlay?.open && typeof overlay.close === 'function')
            overlay.close();
    }
    catch { }
    overlay?.remove?.();
    snapshot = null;
}
function readDomSnapshotErrors() {
    const rows = [];
    const messages = document.querySelectorAll?.('#chat .mes[mesid], #chat [mesid].mes') || [];
    for (const message of messages) {
        const mesid = Number(message.getAttribute?.('mesid'));
        if (!Number.isInteger(mesid) || mesid < 0)
            continue;
        const errorHost = message.querySelector?.('[data-rm-state="error"], [data-rabbit-mirror-follow-failure]');
        if (!errorHost)
            continue;
        const text = errorHost.querySelector?.('.rabbit-mirror-external-error-message')?.textContent
            || errorHost.textContent
            || '';
        if (String(text).trim())
            rows.push({ mesid, text });
    }
    return rows;
}
export function snapshotUsesVirtualChat({ chatLength, mountedCount, hasShowMore } = {}) {
    const length = Number(chatLength);
    const mounted = Number(mountedCount);
    if (!length || length < 1 || hasShowMore)
        return false;
    return mounted > 0 && mounted < length;
}
function windowsWithChat() {
    const found = [];
    const push = win => {
        if (!win || found.includes(win))
            return;
        try {
            if (win.document?.getElementById('chat'))
                found.push(win);
        }
        catch { }
    };
    push(globalThis.parent);
    push(globalThis.top);
    push(globalThis);
    return found;
}
function findMes(id) {
    const wanted = String(id);
    for (const win of windowsWithChat()) {
        const nodes = win.document.querySelectorAll('#chat .mes');
        for (const node of nodes) {
            const mesid = node.getAttribute('mesid') || node.dataset?.mesid;
            if (mesid === wanted)
                return node;
        }
    }
    return null;
}
function firstMesId() {
    for (const win of windowsWithChat()) {
        const id = Number(win.document.querySelector('#chat .mes')?.getAttribute('mesid'));
        if (Number.isFinite(id))
            return id;
    }
    return null;
}
function mountedChatCount() {
    let count = 0;
    for (const win of windowsWithChat())
        count = Math.max(count, win.document.querySelectorAll('#chat .mes').length);
    return count;
}
function hostHasShowMore() {
    return windowsWithChat().some(win => !!win.document.getElementById('show_more_messages'));
}
function waitMore(ms = 1200) {
    return new Promise(resolve => {
        let done = false;
        const finish = ok => { if (!done) {
            done = true;
            resolve(ok);
        } };
        const ctx = globalThis.SillyTavern?.getContext?.();
        const source = ctx?.eventSource;
        const name = ctx?.eventTypes?.MORE_MESSAGES_LOADED || globalThis.tavern_events?.MORE_MESSAGES_LOADED;
        const handler = () => finish(true);
        if (source && name && typeof source.on === 'function')
            source.on(name, handler);
        globalThis.setTimeout(() => {
            try {
                source?.removeListener?.(name, handler);
            }
            catch { }
            finish(false);
        }, ms);
    });
}
async function loadOlder() {
    try {
        const showMore = globalThis.SillyTavern?.getContext?.()?.showMoreMessages;
        if (typeof showMore === 'function') {
            await showMore();
            return true;
        }
    }
    catch {
        return false;
    }
    for (const win of windowsWithChat()) {
        if (typeof win.showMoreMessages === 'function') {
            try {
                await win.showMoreMessages();
                return true;
            }
            catch {
                return false;
            }
        }
        const button = win.document.getElementById('show_more_messages');
        if (!button)
            continue;
        const jq = win.jQuery || win.$;
        if (typeof jq === 'function')
            jq(button).trigger('click');
        else
            button.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
        return true;
    }
    return false;
}
export async function revealChatFloor(id, { keepGoing } = {}) { return revealMes(id, keepGoing); }
async function revealMes(id, keepGoing = () => true) {
    let node = findMes(id);
    if (node)
        return node;
    for (let round = 0; round < 80; round += 1) {
        if (!keepGoing())
            break;
        const before = firstMesId();
        const waiting = waitMore(1200);
        if (!(await loadOlder()))
            break;
        const loaded = await waiting;
        await new Promise(resolve => { const timer = setTimeout(resolve, 100); requestAnimationFrame(() => { clearTimeout(timer); resolve(); }); });
        node = findMes(id);
        if (node)
            return node;
        const after = firstMesId();
        if (!loaded && (after == null || after === before))
            break;
        if (after != null && before != null && after >= before && !loaded)
            break;
    }
    return findMes(id);
}
function scrollFloor(node) {
    const text = node.querySelector?.('.mes_text') || node;
    requestAnimationFrame(() => text.scrollIntoView({ behavior: 'auto', block: 'start' }));
}
async function jumpBySlash(id) {
    const command = `/chat-jump ${id}`;
    try {
        if (typeof globalThis.triggerSlash === 'function') {
            await globalThis.triggerSlash(command);
            return true;
        }
        const ctx = globalThis.SillyTavern?.getContext?.();
        const run = ctx?.executeSlashCommandsWithOptions || ctx?.executeSlashCommands;
        if (typeof run === 'function') {
            await run(command, { handleParserErrors: true, handleExecutionErrors: true });
            return true;
        }
    }
    catch (error) {
        console.warn(__rmT("UnX0nRLVcQzumShYaRVSwKc82KFBM7GDygWrKZLNDd8axBonxeB7Vr.Zrb.DE3sOyjahxxK33dh"), error);
    }
    return false;
}
async function jumpToFloor(id, chatLength) {
    const owner = snapshot;
    const closeTheaterSnapshot = () => { if (snapshot && snapshot === owner)
        closeSnapshotNow(); };
    const virtual = snapshotUsesVirtualChat({
        chatLength,
        mountedCount: mountedChatCount(),
        hasShowMore: hostHasShowMore(),
    });
    if (virtual) {
        closeTheaterSnapshot();
        if (!(await jumpBySlash(id)))
            globalThis.toastr?.warning?.(`${__rmT("0QJ5ygq4QsZaBsYq")}${id}${__rmT("jzk")}`);
        return;
    }
    const node = findMes(id) || await revealMes(id);
    if (node) {
        closeTheaterSnapshot();
        scrollFloor(node);
        flashFloor(node);
        return;
    }
    closeTheaterSnapshot();
    if (!(await jumpBySlash(id)))
        globalThis.toastr?.warning?.(`#${id}${__rmT("4JSyqA7Kf1jelKN2IyKw9l0bYpgrrk")}`);
}
function flashFloor(node) {
    node.setAttribute('data-rm-snapshot-flash', 'true');
    const clear = () => node.removeAttribute('data-rm-snapshot-flash');
    node.addEventListener?.('animationend', clear, { once: true });
    setTimeout(clear, 1800);
}
function paintStar(button, on) {
    const favorited = !!on;
    button.setAttribute('aria-pressed', favorited ? 'true' : 'false');
    button.textContent = favorited ? __rmT("EURHOoeuzNNq7T") : __rmT("nXqXhr4sZVs");
    button.title = favorited ? __rmT("En6N_bLTto5RkLFc2zY") : __rmT("h7zrklMgt8ANef");
}
function closeSnapshotViewer() {
    snapshot?.viewer?.remove?.();
    if (snapshot)
        snapshot.viewer = null;
}
function snapshotPlateColor(html) {
    const text = String(html || '');
    const match = /background(?:-color)?\s*:\s*(#[0-9a-f]{6}\b|#[0-9a-f]{3}\b)/i.exec(text)
        || /linear-gradient\([^)]*?(#[0-9a-f]{6}\b)/i.exec(text);
    if (!match)
        return '';
    let hex = match[1].toLowerCase();
    if (hex.length === 4)
        hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    return hex;
}
function snapshotThumbDocument(html, expand, prepare) {
    let body = expand(String(html || ''));
    try {
        const template = document.createElement('template');
        template.innerHTML = body;
        prepare?.(template);
        const details = template.content.querySelector('details');
        if (details)
            details.setAttribute('open', '');
        body = template.innerHTML;
    }
    catch { }
    let base = '';
    try {
        base = `<base href="${String(globalThis.location?.origin || '').replace(/"/g, '')}/">`;
    }
    catch {
        base = '';
    }
    return `<!doctype html><html><head><meta charset="utf-8">${base}<style>`
        + `html,body{margin:0;padding:0;background:transparent;overflow:hidden;width:${THUMB_WIDTH}px}`
        + `body{font-family:-apple-system,"PingFang SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif}`
        + `details>summary{display:none!important}`
        + `*,*::before,*::after{animation-play-state:paused!important;animation-delay:-1s!important;transition:none!important}`
        + `</style></head><body>${body}</body></html>`;
}
function loadThumb(frame, expand) {
    if (!frame || frame.dataset.loaded === 'true')
        return;
    frame.dataset.loaded = 'true';
    const afterLoad = frame.__rmSnapshotAfterLoad;
    if (typeof afterLoad === 'function') {
        frame.addEventListener('load', () => { try {
            afterLoad(frame.contentDocument);
        }
        catch { } }, { once: true });
    }
    frame.srcdoc = snapshotThumbDocument(frame.__rmSnapshotHtml, expand, frame.__rmSnapshotPrepare);
    frame.__rmSnapshotHtml = null;
    frame.__rmSnapshotPrepare = null;
    frame.__rmSnapshotAfterLoad = null;
}
function observeThumb(frame, scrollRoot, expand) {
    if (typeof IntersectionObserver !== 'function') {
        loadThumb(frame, expand);
        return;
    }
    if (!thumbObserver || thumbObserver.__root !== scrollRoot) {
        thumbObserver?.disconnect?.();
        thumbObserver = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting)
                    continue;
                thumbObserver.unobserve(entry.target);
                loadThumb(entry.target, expand);
            }
        }, { root: scrollRoot || null, rootMargin: '300px 0px' });
        thumbObserver.__root = scrollRoot;
    }
    thumbObserver.observe(frame);
}
function updateThumbScale(grid) {
    const plate = grid?.querySelector?.('.rm-snap-plate');
    const width = plate?.clientWidth || 0;
    if (width > 0)
        grid.style.setProperty('--thumb-scale', String(width / THUMB_WIDTH));
}
export async function openTheaterSnapshot() {
    const generation = ++openGeneration;
    const [{ applyAppearanceTheme }, api, favorites, persistence, runtime, connection, mount] = await Promise.all([
        import('./appearanceTheme.js?rmv=1.99.14'),
        import('./independentApi.js?rmv=1.99.14'),
        import('./theaterFavorites.js?rmv=1.99.14'),
        import('./independentApi/persistence.js?rmv=1.99.14'),
        import('./independentApi/runtime.js?rmv=1.99.14'),
        import('./independentApi/connection.js?rmv=1.99.14'),
        import('./independentApi/mount.js?rmv=1.99.14'),
    ]);
    const ctx = runtime.getContext?.() || {};
    const chat = Array.isArray(ctx.chat) ? ctx.chat : [];
    let persisted = [];
    const recordFaceSwipes = new Map();
    try {
        const entries = persistence.chatPersistedOwnerEntries(ctx);
        for (const entry of entries)
            if (entry.record?.faceSwipes)
                recordFaceSwipes.set(`${entry.index}:${entry.swipe}`, entry.record.faceSwipes);
        const matchesFloor = entry => {
            try {
                const msg = chat[entry.index];
                if (!msg)
                    return false;
                return !!connection.savedRecordMatchesObserved(entry.record, mount.passiveObservedIdentity(ctx, entry.index, msg));
            }
            catch {
                return true;
            }
        };
        persisted = entries
            .map(entry => ({ index: entry.index, swipe: entry.swipe, html: entry.record?.html || '', stale: !matchesFloor(entry) }))
            .filter(entry => entry.html);
    }
    catch {
        persisted = [];
    }
    const domErrors = readDomSnapshotErrors();
    let imageChatKey = '';
    let restoreBuiltinImages = () => 0;
    let applyTextures = () => 0;
    let applySprites = () => 0;
    try {
        const textures = await import('./materialTexture.js?rmv=1.99.14');
        applyTextures = root => textures.applyMaterialTextures(root, undefined, { record: false });
    }
    catch { }
    try {
        const sprites = await import('./pixelSprites.js?rmv=1.99.14');
        applySprites = root => sprites.applyPixelSprites(root);
    }
    catch { }
    try {
        const connection = await import('./independentApi/connection.js?rmv=1.99.14');
        imageChatKey = String(connection.chatKey(ctx) || '');
    }
    catch {
        imageChatKey = '';
    }
    try {
        const images = await import('./builtinImage.js?rmv=1.99.14');
        if (typeof images.restoreSavedBuiltinImages === 'function')
            restoreBuiltinImages = images.restoreSavedBuiltinImages;
    }
    catch { }
    let sessionErrors = [];
    try {
        const flights = await import('./independentApi/flights.js?rmv=1.99.14');
        const key = imageChatKey;
        const seen = new Set(domErrors.map(row => row.mesid));
        for (const failure of flights.automaticFailureStops?.values?.() || []) {
            if (!failure || flights.isMissingShellStop?.(failure))
                continue;
            const base = String(failure.baseSlot || '');
            if (!key || !base.startsWith(`${key}:`))
                continue;
            const match = base.slice(key.length + 1).match(/^(\d+):(\d+)$/);
            if (!match)
                continue;
            const mesid = Number(match[1]);
            const swipe = Number(match[2]);
            if (seen.has(mesid) || currentSwipeId(chat[mesid]) !== swipe)
                continue;
            const text = String(failure.message || '').trim();
            if (!text)
                continue;
            seen.add(mesid);
            sessionErrors.push({ mesid, text });
        }
    }
    catch {
        sessionErrors = [];
    }
    let items = collectTheaterSnapshots(chat, { persisted, domErrors: [...domErrors, ...sessionErrors] });
    try {
        const [swipes, faceSwipe] = await Promise.all([
            import('./swipeVersions.js?rmv=1.99.14'),
            import('./independentApi/faceSwipe.js?rmv=1.99.14'),
        ]);
        let archive = new Map();
        if (imageChatKey && typeof swipes.loadFaceSwipeArchiveRows === 'function') {
            const rows = await swipes.loadFaceSwipeArchiveRows(imageChatKey).catch(() => null);
            archive = new Map((rows || []).map(row => [String(row.slot), row.states || {}]));
        }
        const versionsByKey = new Map();
        for (const item of items) {
            if (item.kind !== 'ready' || !imageChatKey)
                continue;
            const key = `${item.mesid}:${item.swipe}`;
            const base = `${imageChatKey}:${key}`;
            const states = {};
            for (let face = 0; face < 5; face += 1) {
                const candidates = [swipes.readFaceSwipe(base, face), recordFaceSwipes.get(key)?.[face], archive.get(base)?.[face]];
                const state = candidates.map(value => swipes.normalizeSwipeState(value)).filter(value => value.versions.length > 1)
                    .sort((a, b) => Number(b.touched || 0) - Number(a.touched || 0))[0];
                if (state)
                    states[face] = state;
            }
            if (Object.keys(states).length)
                versionsByKey.set(key, states);
        }
        items = expandSnapshotVersions(items, versionsByKey, faceSwipe.mergeFaceDetailsIntoHtml);
    }
    catch { }
    let expandBlocks = value => String(value || '');
    try {
        const markup = await import('./outputSanitizer/markup.js?rmv=1.99.14');
        if (typeof markup.expandHtmlDocumentCodeBlocks === 'function')
            expandBlocks = markup.expandHtmlDocumentCodeBlocks;
    }
    catch { }
    if (generation !== openGeneration)
        return [];
    closeSnapshotNow();
    const narrow = (globalThis.innerWidth || 1024) < 640;
    const overlay = document.createElement('dialog');
    overlay.setAttribute('aria-label', __rmT("8vfuqCi7cQvcGk"));
    overlay.setAttribute('data-rm-theater-snapshot', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;width:auto;height:auto;max-width:none;max-height:none;margin:0;padding:max(16px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));box-sizing:border-box;border:0;background:rgba(8,10,14,.62);display:flex;align-items:center;justify-content:center;z-index:10070;';
    applyAppearanceTheme(overlay);
    if (narrow)
        overlay.style.alignItems = 'stretch';
    if (narrow)
        overlay.style.padding = 'max(10px,env(safe-area-inset-top)) 0 0 0';
    const card = document.createElement('div');
    card.style.cssText = 'overflow:auto;background:var(--rh-bg,var(--SmartThemeBlurTintColor,#f5f4fb));color:var(--rh-text,var(--SmartThemeBodyColor,#34495d));border:1px solid var(--rh-border,color-mix(in srgb,currentColor 18%,transparent));box-shadow:0 22px 70px rgba(0,0,0,.42);box-sizing:border-box;position:relative;isolation:isolate;';
    card.style.cssText += narrow
        ? ';width:100%;max-width:none;max-height:none;height:100%;border-radius:22px 22px 0 0;padding:16px 14px max(18px,env(safe-area-inset-bottom));'
        : ';width:min(820px,calc(100vw - 48px));max-height:min(88vh,calc(100dvh - 48px));border-radius:22px;padding:20px 22px;';
    overlay.append(card);
    const style = document.createElement('style');
    style.textContent = SNAPSHOT_STYLE;
    const shelf = document.createElement('div');
    shelf.setAttribute('data-rm-snapshot-shelf', 'true');
    const head = document.createElement('div');
    head.className = 'rm-snap-head';
    const title = document.createElement('h2');
    title.className = 'rm-snap-title';
    title.textContent = __rmT("H8BQLf");
    const count = document.createElement('span');
    count.className = 'rm-snap-count';
    count.textContent = items.length ? `${items.length}${__rmT("2RdUjk")}` : '';
    title.append(count);
    const note = document.createElement('p');
    note.className = 'rm-snap-note';
    note.textContent = __rmT("nop.kH8jQRoft0YIPL4lgTVPvqHrevwrTfWNn1dATC8wxNJiV4SGD1fJ11z27NJLzhSr4Bun0E181oVNE7YmO28vcbHWNGpC3dnm_kVvmEz_e27MhqTioHWS2.MPU1euIiSK09CyqwMf7hX3DfOn1k");
    const heading = document.createElement('div');
    heading.style.cssText = 'flex:1;min-width:0;';
    heading.append(title, note);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'rm-snap-close';
    close.textContent = '×';
    close.setAttribute('aria-label', __rmT("yHG5V2qrZPh"));
    close.addEventListener('click', () => closeTheaterSnapshot());
    head.append(heading, close);
    let viewMode = 'feed';
    try {
        viewMode = globalThis.localStorage?.getItem(SNAPSHOT_VIEW_KEY) === 'grid' ? 'grid' : 'feed';
    }
    catch {
        viewMode = 'feed';
    }
    const viewSwitch = document.createElement('div');
    viewSwitch.className = 'rm-snap-view';
    viewSwitch.setAttribute('role', 'group');
    viewSwitch.setAttribute('aria-label', __rmT("3MqCXomsSDY"));
    const viewButtons = [];
    for (const [key, label] of [['feed', __rmT("ygvxGT")], ['grid', __rmT("ppv4Zf")]]) {
        const option = document.createElement('button');
        option.type = 'button';
        option.textContent = label;
        option.setAttribute('aria-pressed', String(viewMode === key));
        option.addEventListener('click', () => {
            if (viewMode === key)
                return;
            viewMode = key;
            try {
                globalThis.localStorage?.setItem(SNAPSHOT_VIEW_KEY, key);
            }
            catch { }
            for (const other of viewButtons)
                other.setAttribute('aria-pressed', String(other === option));
            render();
            card.scrollTop = 0;
        });
        viewButtons.push(option);
        viewSwitch.append(option);
    }
    const tools = document.createElement('div');
    tools.className = 'rm-snap-tools';
    tools.append(viewSwitch);
    const pager = document.createElement('div');
    pager.className = 'rm-snap-pager';
    const older = document.createElement('button');
    older.type = 'button';
    older.textContent = __rmT("igs.jh");
    const range = document.createElement('div');
    range.className = 'rm-snap-range';
    const pageSelect = document.createElement('select');
    pageSelect.className = 'rm-snap-page-select';
    pageSelect.setAttribute('aria-label', __rmT("7tOFc5.mqFDRLh"));
    pageSelect.addEventListener('change', () => { page = Number(pageSelect.value) || 0; render(); card.scrollTop = 0; });
    const rangeText = document.createElement('span');
    range.append(pageSelect, rangeText);
    const newer = document.createElement('button');
    newer.type = 'button';
    newer.textContent = __rmT("igKAjh");
    pager.append(older, range, newer);
    const list = document.createElement('div');
    list.className = 'rm-snap-list';
    shelf.append(head, tools, pager, list);
    card.append(style, shelf);
    let page = 0;
    let renderToken = 0;
    const stars = [];
    const jump = (mesid, stale = false) => {
        void jumpToFloor(mesid, chat.length).then(() => {
            if (stale)
                globalThis.toastr?.info?.(`#${mesid}${__rmT("cE1PvuN.p5Dc7X2GggGimx_.vo1PbyRGR78nwQkPKMd1d2DBaid0d7b1RcOxu88iz8BuaiU0krtX8aekcrayyHCKkn9af41ThH9R8jh3dQK8n3o156FcYu9U7lnx9o3xq08AphOswHbIMHZxSECU_pphGaGunoaiBA0n4XBk1Mvkmtj6Cg0HsDJOMqP99rzO")}`, __rmT("9.JSSv1i"));
        });
    };
    const refreshStars = () => {
        for (const entry of stars) {
            void favorites.isTheaterFavoriteHtml(entry.html).then(on => {
                if (entry.button.isConnected)
                    paintStar(entry.button, on);
            }).catch(() => { });
        }
    };
    const wireStar = (button, item, stage) => {
        stars.push({ button, html: item.html });
        button.addEventListener('click', () => {
            if (button.dataset.rmSnapshotBusy === 'true')
                return;
            const captured = favorites.captureTheaterFavoriteFromRoot(stage);
            const input = captured || { html: item.html, title: item.title };
            input.mesid = item.mesid;
            input.swipe = item.swipe;
            input.chatKey = imageChatKey;
            input.title = input.title || item.title;
            const next = button.getAttribute('aria-pressed') !== 'true';
            button.dataset.rmSnapshotBusy = 'true';
            paintStar(button, next);
            void favorites.toggleTheaterFavorite(input, next ? 'add' : 'remove').then(result => {
                paintStar(button, result.favorited);
                globalThis.toastr?.success?.(result.already ? __rmT("X199sYw.yYVFNoo1ZZF5otP1lwp0J2v7adM.PrDBvYgnHFrGq8_") : result.favorited ? __rmT("2lXfwJHQRFWpAq2cq0IXfyjWbNs") : __rmT("qMRE4lB0DbRuFif1"));
            }).catch(error => {
                paintStar(button, !next);
                globalThis.toastr?.warning?.(String(error?.message || __rmT("h7zrkzu3rCFMsh")));
            }).finally(() => { delete button.dataset.rmSnapshotBusy; });
        });
    };
    const prepareSnapshotImages = (template, item) => {
        template.content.querySelectorAll('[data-rm-draw-status]').forEach(node => node.remove());
        const roots = [...template.content.querySelectorAll('details')];
        if (!roots.length)
            roots.push(template.content);
        const faces = roots.filter(details => !details.parentElement?.closest?.('details'));
        for (const details of roots) {
            if (!details?.dataset)
                continue;
            if (imageChatKey)
                details.dataset.rmImageOwnerChat = imageChatKey;
            details.dataset.rmImageOwnerMesid = String(item.mesid);
            details.dataset.rmImageOwnerSwipe = String(item.swipe);
            let face = details;
            while (face.parentElement?.closest?.('details'))
                face = face.parentElement.closest('details');
            const at = faces.indexOf(face);
            if (at >= 0)
                details.dataset.rmImageOwnerFace = String(faces.length === 1 && Number.isInteger(item.versionOf?.face) ? item.versionOf.face : at);
        }
    };
    const paintThumbImages = doc => {
        for (const details of doc?.querySelectorAll?.('details') || []) {
            if (details.querySelector?.('[data-rm-draw-frame]'))
                restoreBuiltinImages(details);
        }
        if (doc?.body) {
            applyTextures(doc.body);
            applySprites(doc.body);
        }
    };
    const mountStage = (stage, item) => {
        const host = api.hydrateIndependentFavoriteHtml(stage, {
            html: item.html,
            id: `snapshot:${item.mesid}:${item.swipe}${item.versionOf ? `:v${item.versionOf.face}.${item.versionOf.index}` : ''}`,
            title: item.title,
            mesid: item.mesid,
            swipe: item.swipe,
            faceIndex: Number.isInteger(item.versionOf?.face) ? item.versionOf.face : 0,
            chatKey: imageChatKey,
        });
        if (!host)
            stage.textContent = __rmT("lVqG487HW3MCablDVFpyfjwLZUu3Q69r2IQRB4X.q315azQX");
        else
            host.querySelectorAll?.('details')?.forEach(details => { details.open = true; });
        return host;
    };
    const openItemViewer = item => {
        closeSnapshotViewer();
        const layer = document.createElement('div');
        layer.className = 'rm-snap-viewer';
        layer.addEventListener('pointerdown', event => {
            if (event.target !== layer)
                return;
            event.preventDefault();
            closeSnapshotViewer();
        });
        const panel = document.createElement('div');
        panel.className = 'rm-snap-viewer-card';
        const bar = document.createElement('div');
        bar.className = 'rm-snap-bar';
        const floor = document.createElement('button');
        floor.type = 'button';
        floor.className = 'rm-snap-floor';
        floor.textContent = `#${item.mesid}`;
        floor.setAttribute('aria-label', `${__rmT("iC2iAWPSHKG")}${item.mesid}${__rmT("2RdruT")}`);
        floor.addEventListener('click', () => jump(item.mesid, item.stale));
        const name = document.createElement('p');
        name.className = 'rm-snap-name';
        name.textContent = item.versionLabel ? `${item.title} · ${item.versionLabel}` : item.title;
        bar.append(floor, name);
        if (item.stale) {
            const chip = document.createElement('span');
            chip.className = 'rm-snap-chip';
            chip.textContent = __rmT("J9IuFNnpj8C");
            chip.title = __rmT("nPu5.Yt3DKnBVfdnHMjWUwRmXbSM7lx2pXbdTNbrz8UAoWJi7rgt9drK3FookbF7mwT");
            bar.append(chip);
        }
        if (item.failed) {
            const chip = document.createElement('span');
            chip.className = 'rm-snap-chip';
            chip.textContent = __rmT("cy7XSaAu");
            bar.append(chip);
        }
        const jumpButton = document.createElement('button');
        jumpButton.type = 'button';
        jumpButton.className = 'rm-snap-jump';
        jumpButton.textContent = __rmT("wcZG.k");
        jumpButton.addEventListener('click', () => jump(item.mesid, item.stale));
        bar.append(jumpButton);
        const closer = document.createElement('button');
        closer.type = 'button';
        closer.className = 'rm-snap-close';
        closer.textContent = '×';
        closer.setAttribute('aria-label', __rmT("xzZCplMgt8ANef"));
        closer.addEventListener('click', () => closeSnapshotViewer());
        bar.append(closer);
        const stage = document.createElement('div');
        stage.className = 'rm-snap-stage';
        stage.addEventListener('submit', event => { event.preventDefault(); event.stopPropagation(); });
        panel.append(bar, stage);
        layer.append(panel);
        overlay.append(layer);
        if (snapshot)
            snapshot.viewer = layer;
        if (item.kind === 'error' || !item.html) {
            const error = document.createElement('p');
            error.className = 'rm-snap-error';
            error.textContent = item.errorText || __rmT("BHqkQR9K.t0ruCqLlD1H5_3CqZdteBZrS324VjZpbmK91ZQSW4e5IBcpAh_9uT");
            stage.append(error);
            return;
        }
        const star = document.createElement('button');
        star.type = 'button';
        star.className = 'rm-snap-star';
        paintStar(star, false);
        bar.insertBefore(star, closer);
        mountStage(stage, item);
        wireStar(star, item, stage);
        void favorites.isTheaterFavoriteHtml(item.html).then(on => {
            if (star.isConnected)
                paintStar(star, on);
        }).catch(() => { });
    };
    const render = () => {
        const token = ++renderToken;
        closeSnapshotViewer();
        resetThumbs();
        stars.length = 0;
        const view = theaterSnapshotPage(items, page);
        page = view.page;
        older.disabled = view.page >= view.pages - 1 || !view.total;
        newer.disabled = view.page <= 0 || !view.total;
        older.hidden = !view.total;
        newer.hidden = !view.total;
        range.hidden = !view.total;
        pageSelect.replaceChildren();
        if (!view.total)
            rangeText.textContent = '';
        else {
            for (let index = 0; index < view.pages; index += 1) {
                const option = document.createElement('option');
                const from = index * THEATER_SNAPSHOT_PAGE_SIZE + 1;
                const to = Math.min(view.total, from + THEATER_SNAPSHOT_PAGE_SIZE - 1);
                option.value = String(index);
                option.textContent = `${__rmT("BJgCyT")}${index + 1}${__rmT("qGy1Z1Lp")}${from}–${to}${__rmT("eXs")}`;
                pageSelect.append(option);
            }
            pageSelect.value = String(view.page);
            pageSelect.hidden = view.pages < 2;
            rangeText.textContent = view.pages < 2 ? `${__rmT("tB0CyT")}${view.total}${__rmT("2RdUjk")}` : `${__rmT("tB0CyT")}${view.pages}${__rmT("UqYs1n_pSlRBTh")}${view.total}${__rmT("2RdUjk")}`;
        }
        list.className = viewMode === 'grid' ? 'rm-snap-grid' : 'rm-snap-list';
        list.replaceChildren();
        if (!view.total) {
            const empty = document.createElement('div');
            empty.className = 'rm-snap-empty';
            empty.innerHTML = __rmT("Co981Ac_A63FbYPxVuQKqKS6ACxdHOI7BTReTGiw0l.W4J3EqY3lkJvGyuE8ETwoyoLhJ0IDYlXjQGzCXH.41Hs6ZvK_X546w5feXm3hTFy98vdf4epSNNVhWiFTWWgAgaIXArGsmSZ9vLaRf_C");
            list.append(empty);
            return;
        }
        if (viewMode === 'grid') {
            for (const item of view.items) {
                const tile = document.createElement('div');
                tile.className = 'rm-snap-tile';
                const plate = document.createElement('div');
                plate.className = 'rm-snap-plate';
                plate.tabIndex = 0;
                plate.setAttribute('role', 'button');
                plate.setAttribute('aria-label', `${__rmT("r9WoqqNuHRG")}${item.mesid} ${item.title}`);
                if (item.failed)
                    plate.setAttribute('data-failed', 'true');
                plate.style.setProperty('--plate', snapshotPlateColor(item.html) || 'var(--rh-primary,#ce729c)');
                if (item.html) {
                    const thumb = document.createElement('iframe');
                    thumb.className = 'rm-snap-thumb';
                    thumb.setAttribute('sandbox', 'allow-same-origin');
                    thumb.setAttribute('aria-hidden', 'true');
                    thumb.setAttribute('tabindex', '-1');
                    thumb.setAttribute('title', '');
                    thumb.__rmSnapshotHtml = item.html;
                    thumb.__rmSnapshotPrepare = template => prepareSnapshotImages(template, item);
                    thumb.__rmSnapshotAfterLoad = paintThumbImages;
                    plate.append(thumb);
                }
                else {
                    const copy = document.createElement('span');
                    copy.className = 'rm-snap-plate-copy';
                    copy.textContent = item.errorText || __rmT("7eHbUZtX3ITwujUNIKxsADu0");
                    plate.append(copy);
                }
                const floor = document.createElement('button');
                floor.type = 'button';
                floor.className = 'rm-snap-plate-floor';
                floor.textContent = `#${item.mesid}`;
                floor.setAttribute('aria-label', `${__rmT("iC2iAWPSHKG")}${item.mesid}${__rmT("2RdruT")}`);
                floor.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    jump(item.mesid, item.stale);
                });
                plate.append(floor);
                plate.addEventListener('click', event => {
                    if (event.target?.closest?.('.rm-snap-plate-floor'))
                        return;
                    openItemViewer(item);
                });
                plate.addEventListener('keydown', event => {
                    if (event.key !== 'Enter' && event.key !== ' ')
                        return;
                    event.preventDefault();
                    openItemViewer(item);
                });
                const name = document.createElement('p');
                name.className = 'rm-snap-tile-name';
                name.textContent = `${item.title}${item.versionLabel ? ` · ${item.versionLabel}` : ''}${item.stale ? __rmT("7aqU1yteCfJnMFxdcip") : ''}${item.failed ? __rmT("4b8RjaFytbpNytue") : ''}`;
                tile.append(plate, name);
                list.append(tile);
            }
            requestAnimationFrame(() => {
                if (token !== renderToken)
                    return;
                updateThumbScale(list);
                for (const frame of list.querySelectorAll('iframe.rm-snap-thumb'))
                    observeThumb(frame, card, expandBlocks);
            });
            return;
        }
        for (const item of view.items) {
            const cardNode = document.createElement('article');
            cardNode.className = 'rm-snap-card';
            if (item.failed)
                cardNode.setAttribute('data-failed', 'true');
            const bar = document.createElement('div');
            bar.className = 'rm-snap-bar';
            const floor = document.createElement('button');
            floor.type = 'button';
            floor.className = 'rm-snap-floor';
            floor.textContent = `#${item.mesid}`;
            floor.title = `${__rmT("iC2iAWNuHRG")}${item.mesid}`;
            floor.setAttribute('aria-label', `${__rmT("iC2iAWPSHKG")}${item.mesid}${__rmT("2RdruT")}`);
            floor.addEventListener('click', () => jump(item.mesid, item.stale));
            const name = document.createElement('p');
            name.className = 'rm-snap-name';
            name.textContent = item.versionLabel ? `${item.title} · ${item.versionLabel}` : item.title;
            bar.append(floor, name);
            if (item.stale) {
                const chip = document.createElement('span');
                chip.className = 'rm-snap-chip';
                chip.textContent = __rmT("J9IuFNnpj8C");
                chip.title = __rmT("nPu5.Yt3DKnBVfdnHMjWUwRmXbSM7lx2pXbdTNbrz8UAoWJi7rgt9drK3FookbF7mwT");
                bar.append(chip);
            }
            if (item.failed) {
                const chip = document.createElement('span');
                chip.className = 'rm-snap-chip';
                chip.textContent = __rmT("cy7XSaAu");
                bar.append(chip);
            }
            const jumpButton = document.createElement('button');
            jumpButton.type = 'button';
            jumpButton.className = 'rm-snap-jump';
            jumpButton.textContent = __rmT("wcZG.k");
            jumpButton.addEventListener('click', () => jump(item.mesid, item.stale));
            bar.append(jumpButton);
            const stage = document.createElement('div');
            stage.className = 'rm-snap-stage';
            stage.setAttribute('data-rm-snapshot-stage', 'true');
            stage.addEventListener('submit', event => { event.preventDefault(); event.stopPropagation(); });
            let star = null;
            if (item.kind === 'error' || !item.html) {
                const error = document.createElement('p');
                error.className = 'rm-snap-error';
                error.textContent = item.errorText || __rmT("BHqkQR9K.t0ruCqLlD1H5_3CqZdteBZrS324VjZpbmK91ZQSW4e5IBcpAh_9uT");
                stage.append(error);
            }
            else {
                star = document.createElement('button');
                star.type = 'button';
                star.className = 'rm-snap-star';
                paintStar(star, false);
                bar.append(star);
            }
            cardNode.append(bar, stage);
            list.append(cardNode);
            if (!star)
                continue;
            mountStage(stage, item);
            wireStar(star, item, stage);
            if (token === renderToken) {
                void favorites.isTheaterFavoriteHtml(item.html).then(on => {
                    if (token === renderToken && star.isConnected)
                        paintStar(star, on);
                }).catch(() => { });
            }
        }
    };
    older.addEventListener('click', () => { page += 1; render(); card.scrollTop = 0; });
    newer.addEventListener('click', () => { page -= 1; render(); card.scrollTop = 0; });
    overlay.addEventListener('cancel', event => {
        event.preventDefault();
        event.stopPropagation();
        if (snapshot?.viewer)
            closeSnapshotViewer();
        else
            closeTheaterSnapshot();
    });
    overlay.addEventListener('pointerdown', event => {
        if (event.target !== overlay)
            return;
        event.preventDefault();
        closeTheaterSnapshot();
    });
    overlay.addEventListener('click', event => event.stopPropagation());
    const keydown = event => {
        if (event.key !== 'Escape')
            return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (snapshot?.viewer)
            closeSnapshotViewer();
        else
            closeTheaterSnapshot();
    };
    const onFavoritesChanged = () => { if (snapshot?.overlay === overlay)
        refreshStars(); };
    let resizeFrame = 0;
    const onResize = () => {
        if (resizeFrame)
            return;
        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = 0;
            for (const grid of overlay.querySelectorAll('.rm-snap-grid'))
                updateThumbScale(grid);
        });
    };
    document.addEventListener('keydown', keydown, true);
    document.addEventListener(favorites.THEATER_FAVORITES_CHANGED_EVENT, onFavoritesChanged);
    globalThis.addEventListener?.('resize', onResize);
    overlayParent().append(overlay);
    snapshot = {
        overlay,
        keydown,
        onResize,
        onFavoritesChanged,
        favoritesEvent: favorites.THEATER_FAVORITES_CHANGED_EVENT,
    };
    try {
        if (typeof overlay.showModal === 'function')
            overlay.showModal();
        else
            overlay.setAttribute('open', '');
    }
    catch {
        overlay.setAttribute('open', '');
    }
    render();
    return items;
}
