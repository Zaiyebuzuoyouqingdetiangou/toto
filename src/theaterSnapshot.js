// 快拍：把当前聊天里的兔子镜按楼收成一页，最新在前，每页 10 条。
// 收藏仍走原来的收藏夹；这里只负责翻看、点开镜面里的交互、收藏/取消收藏，以及跳回原楼。
// 生成失败、没有成品的楼也留下，方便跳回去重试。正在生成的占位不收进来。

import { RUNTIME_VERSION } from './ui/runtime.js?rmv=1.78.12';

export const THEATER_SNAPSHOT_PAGE_SIZE = 10;

const GENERATING_PLACEHOLDER = /正在生成中|等待正文完成|等待手动生成/;
// 正文里只认兔子镜自己写下的失败标记；普通回复里出现「生成失败」「面未完成」这几个字不算。
const FAILURE_MARK = /data-rabbit-mirror-face-failure|data-rabbit-mirror-follow-failure|兔子镜本批生成失败|【兔子镜：生成失败】|【兔子镜：第\s*\d+\s*面未完成】/;
// 兔子镜自己挂在楼层上的错误提示，措辞不固定，宽一点认。
const NOTICE_FAILURE_MARK = /面未完成|生成失败|没有生成成功/;
const MIRROR_MARK = /兔子镜|data-rabbit-mirror|data-rabbit-hole|face-failure/;

export function currentSwipeId(message) {
    const swipe = Number(message?.swipe_id ?? message?.swipeId ?? 0);
    return Number.isInteger(swipe) && swipe > 0 ? swipe : 0;
}

export function messageSwipeText(message) {
    const swipe = currentSwipeId(message);
    const version = message?.swipes?.[swipe];
    return typeof version === 'string' ? version : String(message?.mes || '');
}

// 跟随模式的成品在楼层正文里；独立模式的成品常常整段就是存档 HTML。嵌套 details 不能用非贪婪截断。
export function extractMirrorHtml(text) {
    const source = String(text || '').trim();
    if (!source || !MIRROR_MARK.test(source)) return '';
    if (/^<(?:toto|details)\b/i.test(source)) return source;
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
    return title || '兔子镜';
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
            // 存档里的这面是对着另一段正文生成的（换过存档、正文改过）：聊天里那一层不会挂出它。
            stale: !!(savedStale && html === fromSaved && html !== fromText),
            errorText: '',
        };
    }
    const notice = snapshotPlainText(errorText) || (isMirrorFailure(text) ? snapshotPlainText(text) : '');
    if (!notice) return null;
    return {
        mesid: index,
        swipe,
        kind: 'error',
        html: '',
        title: '兔子镜没有生成成功',
        failed: true,
        errorText: notice,
    };
}

// persisted: [{ index, swipe, html, stale }]，只认当前 swipe；stale：这面是对着另一段正文生成的，聊天里不会挂出来。domErrors: [{ mesid, text }]。
// 结果从新到旧。用户楼、没有兔子镜也没有报错的楼、还在生成的占位都不进入列表。
export function collectTheaterSnapshots(chat, sources = {}) {
    const list = Array.isArray(chat) ? chat : [];
    const savedByKey = new Map();
    const staleKeys = new Set();
    for (const row of sources.persisted || []) {
        if (!row || !Number.isInteger(row.index) || row.index < 0) continue;
        const swipe = Number.isInteger(row.swipe) && row.swipe > 0 ? row.swipe : 0;
        savedByKey.set(`${row.index}:${swipe}`, String(row.html || ''));
        if (row.stale) staleKeys.add(`${row.index}:${swipe}`);
    }
    const errors = new Map();
    for (const row of sources.domErrors || []) {
        const mesid = Number(row?.mesid);
        const text = String(row?.text || '').trim();
        if (Number.isInteger(mesid) && mesid >= 0 && text) errors.set(mesid, text);
    }
    const items = [];
    for (let index = list.length - 1; index >= 0; index -= 1) {
        const message = list[index];
        if (!message || message.is_user === true) continue;
        const swipe = currentSwipeId(message);
        const item = classifyFloor({
            index,
            swipe,
            text: messageSwipeText(message),
            saved: savedByKey.get(`${index}:${swipe}`) || '',
            savedStale: staleKeys.has(`${index}:${swipe}`),
            errorText: errors.get(index) || '',
        });
        if (item) items.push(item);
    }
    return items;
}

// 重说过的楼：每一面最多存 5 版。快拍把同一层的其它版本也列出来，紧跟在当前那一版后面。
// versionsByKey: Map(`${mesid}:${swipe}` → { 面序号: { versions:[{html}], currentIndex } })；merge(整楼html, 面序号, 这一面的html) 拼回整楼。
export function expandSnapshotVersions(items, versionsByKey, merge = (_html, _face, faceHtml) => faceHtml) {
    const out = [];
    for (const item of Array.isArray(items) ? items : []) {
        const states = item?.kind === 'ready' ? versionsByKey?.get?.(`${item.mesid}:${item.swipe}`) : null;
        const faces = Object.entries(states || {})
            .map(([face, state]) => ({ face: Number(face), versions: Array.isArray(state?.versions) ? state.versions.filter(entry => entry?.html) : [], current: Math.max(0, Number(state?.currentIndex) || 0) }))
            .filter(entry => Number.isInteger(entry.face) && entry.face >= 0 && entry.versions.length > 1)
            .sort((a, b) => a.face - b.face);
        if (!faces.length) { out.push(item); continue; }
        const multi = faces.length > 1 || faces[0].face > 0;
        const label = (face, index, total) => `${multi ? `第 ${face + 1} 面 · ` : ''}第 ${index + 1}/${total} 版`;
        const main = { ...item, versionLabel: faces.map(entry => label(entry.face, Math.min(entry.current, entry.versions.length - 1), entry.versions.length)).join('，') };
        out.push(main);
        for (const entry of faces) {
            entry.versions.forEach((version, index) => {
                if (index === Math.min(entry.current, entry.versions.length - 1)) return;
                let html = '';
                try { html = String(merge(item.html, entry.face, version.html) || ''); } catch { html = ''; }
                if (!html) html = String(version.html || '');
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
// 每次「关掉快拍」都让还在读数据、没打开出来的那一次作废，免得停用之后它又自己弹出来。
let openGeneration = 0;
// 兔子镜停用或热更新时，index.js 用它把开着的快拍一并关掉（只有打开过快拍才会加载这个模块）。
// 记下是哪一份兔子镜的，旧的一份停用时不会去关新装那份打开的快拍。
const closeFromRuntime = () => closeTheaterSnapshot();
closeFromRuntime.runtime = RUNTIME_VERSION;
globalThis.__rabbitMirrorCloseSnapshot = closeFromRuntime;

function resetThumbs() {
    thumbObserver?.disconnect?.();
    thumbObserver = null;
}

function overlayParent() {
    const settings = document.getElementById('rabbit_mirror_theater_settings');
    if (settings?.tagName === 'DIALOG' && (settings.open || settings.hasAttribute('open'))) return settings;
    return document.body;
}

export function closeTheaterSnapshot() {
    openGeneration += 1;
    closeSnapshotNow();
}

function closeSnapshotNow() {
    if (!snapshot) return;
    resetThumbs();
    const { overlay, keydown, onFavoritesChanged, onResize } = snapshot;
    document.removeEventListener('keydown', keydown, true);
    if (onResize) globalThis.removeEventListener?.('resize', onResize);
    if (onFavoritesChanged) document.removeEventListener(snapshot.favoritesEvent, onFavoritesChanged);
    try { if (overlay?.open && typeof overlay.close === 'function') overlay.close(); } catch { /* 已经关了 */ }
    overlay?.remove?.();
    snapshot = null;
}

function readDomSnapshotErrors() {
    const rows = [];
    const messages = document.querySelectorAll?.('#chat .mes[mesid], #chat [mesid].mes') || [];
    for (const message of messages) {
        const mesid = Number(message.getAttribute?.('mesid'));
        if (!Number.isInteger(mesid) || mesid < 0) continue;
        const errorHost = message.querySelector?.('[data-rm-state="error"], [data-rabbit-mirror-follow-failure]');
        if (!errorHost) continue;
        const text = errorHost.querySelector?.('.rabbit-mirror-external-error-message')?.textContent
            || errorHost.textContent
            || '';
        if (String(text).trim()) rows.push({ mesid, text });
    }
    return rows;
}

// 虚拟列表没有把整段聊天画出来。这时不要自己把滚动条拽到顶，交给宿主的 /chat-jump。
export function snapshotUsesVirtualChat({ chatLength, mountedCount, hasShowMore } = {}) {
    const length = Number(chatLength);
    const mounted = Number(mountedCount);
    if (!length || length < 1 || hasShowMore) return false;
    return mounted > 0 && mounted < length;
}

function windowsWithChat() {
    const found = [];
    const push = win => {
        if (!win || found.includes(win)) return;
        try { if (win.document?.getElementById('chat')) found.push(win); } catch { /* 跨域窗口没有聊天区 */ }
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
            if (mesid === wanted) return node;
        }
    }
    return null;
}

function firstMesId() {
    for (const win of windowsWithChat()) {
        const id = Number(win.document.querySelector('#chat .mes')?.getAttribute('mesid'));
        if (Number.isFinite(id)) return id;
    }
    return null;
}

function mountedChatCount() {
    let count = 0;
    for (const win of windowsWithChat()) count = Math.max(count, win.document.querySelectorAll('#chat .mes').length);
    return count;
}

function hostHasShowMore() {
    return windowsWithChat().some(win => !!win.document.getElementById('show_more_messages'));
}

function waitMore(ms = 1200) {
    return new Promise(resolve => {
        let done = false;
        const finish = ok => { if (!done) { done = true; resolve(ok); } };
        const ctx = globalThis.SillyTavern?.getContext?.();
        const source = ctx?.eventSource;
        const name = ctx?.eventTypes?.MORE_MESSAGES_LOADED || globalThis.tavern_events?.MORE_MESSAGES_LOADED;
        const handler = () => finish(true);
        if (source && name && typeof source.on === 'function') source.on(name, handler);
        globalThis.setTimeout(() => {
            try { source?.removeListener?.(name, handler); } catch { /* 事件源没有这项 */ }
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
    } catch {
        return false;
    }
    for (const win of windowsWithChat()) {
        if (typeof win.showMoreMessages === 'function') {
            try { await win.showMoreMessages(); return true; } catch { return false; }
        }
        const button = win.document.getElementById('show_more_messages');
        if (!button) continue;
        const jq = win.jQuery || win.$;
        // 酒馆在 document 上监听的是 click（script.js 的 #show_more_messages）。
        if (typeof jq === 'function') jq(button).trigger('click');
        else button.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
        return true;
    }
    return false;
}

/** 把还没加载到页面上的那一层加载出来（和点「显示更多消息」一样）；加载不出来返回 null。一键补楼层也用它。 */
// keepGoing() 返回假时不再往上加载（比如一键补楼层途中换了聊天）。
export async function revealChatFloor(id, { keepGoing } = {}) { return revealMes(id, keepGoing); }

async function revealMes(id, keepGoing = () => true) {
    let node = findMes(id);
    if (node) return node;
    for (let round = 0; round < 80; round += 1) {
        if (!keepGoing()) break;
        const before = firstMesId();
        // 先开始等「加载好了」的事件再去加载：酒馆加载完马上就发这个事件，晚一步听就收不到，每轮都要白等到超时。
        const waiting = waitMore(1200);
        if (!(await loadOlder())) break;
        const loaded = await waiting;
        // 等页面画一帧再找；页面在后台时不会画（一键补楼层切到后台也要接着走），最多等 100ms。
        await new Promise(resolve => { const timer = setTimeout(resolve, 100); requestAnimationFrame(() => { clearTimeout(timer); resolve(); }); });
        node = findMes(id);
        if (node) return node;
        const after = firstMesId();
        if (!loaded && (after == null || after === before)) break;
        if (after != null && before != null && after >= before && !loaded) break;
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
    } catch (error) {
        console.warn('[RabbitMirror] /chat-jump 失败', error);
    }
    return false;
}

async function jumpToFloor(id, chatLength) {
    // 往前加载要等一会儿；这期间用户重新打开的快拍不能被这次跳转关掉。
    const owner = snapshot;
    const closeTheaterSnapshot = () => { if (snapshot && snapshot === owner) closeSnapshotNow(); };
    const virtual = snapshotUsesVirtualChat({
        chatLength,
        mountedCount: mountedChatCount(),
        hasShowMore: hostHasShowMore(),
    });
    if (virtual) {
        closeTheaterSnapshot();
        if (!(await jumpBySlash(id))) globalThis.toastr?.warning?.(`没有跳到 #${id}。`);
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
    if (!(await jumpBySlash(id))) globalThis.toastr?.warning?.(`#${id} 还没有出现在聊天里。`);
}

function flashFloor(node) {
    node.setAttribute('data-rm-snapshot-flash', 'true');
    const clear = () => node.removeAttribute('data-rm-snapshot-flash');
    node.addEventListener?.('animationend', clear, { once: true });
    // 闪烁样式放在 style.css 里（快拍关掉后仍在）；万一动画没跑，也按时把标记拿掉，下次打开不会再闪。
    setTimeout(clear, 1800);
}

function paintStar(button, on) {
    const favorited = !!on;
    button.setAttribute('aria-pressed', favorited ? 'true' : 'false');
    button.textContent = favorited ? '★ 已收藏' : '☆ 收藏';
    button.title = favorited ? '取消收藏这一面' : '收藏这一面';
}

function closeSnapshotViewer() {
    snapshot?.viewer?.remove?.();
    if (snapshot) snapshot.viewer = null;
}

function snapshotPlateColor(html) {
    const text = String(html || '');
    const match = /background(?:-color)?\s*:\s*(#[0-9a-f]{6}\b|#[0-9a-f]{3}\b)/i.exec(text)
        || /linear-gradient\([^)]*?(#[0-9a-f]{6}\b)/i.exec(text);
    if (!match) return '';
    let hex = match[1].toLowerCase();
    if (hex.length === 4) hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    return hex;
}

function snapshotThumbDocument(html, expand, prepare) {
    let body = expand(String(html || ''));
    try {
        const template = document.createElement('template');
        template.innerHTML = body;
        prepare?.(template);
        const details = template.content.querySelector('details');
        if (details) details.setAttribute('open', '');
        body = template.innerHTML;
    } catch { /* 用原文 */ }
    let base = '';
    try { base = `<base href="${String(globalThis.location?.origin || '').replace(/"/g, '')}/">`; } catch { base = ''; }
    return `<!doctype html><html><head><meta charset="utf-8">${base}<style>`
        + `html,body{margin:0;padding:0;background:transparent;overflow:hidden;width:${THUMB_WIDTH}px}`
        + `body{font-family:-apple-system,"PingFang SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif}`
        + `details>summary{display:none!important}`
        + `*,*::before,*::after{animation-play-state:paused!important;animation-delay:-1s!important;transition:none!important}`
        + `</style></head><body>${body}</body></html>`;
}

function loadThumb(frame, expand) {
    if (!frame || frame.dataset.loaded === 'true') return;
    frame.dataset.loaded = 'true';
    const afterLoad = frame.__rmSnapshotAfterLoad;
    if (typeof afterLoad === 'function') {
        frame.addEventListener('load', () => { try { afterLoad(frame.contentDocument); } catch { /* 读不到就保持原样 */ } }, { once: true });
    }
    frame.srcdoc = snapshotThumbDocument(frame.__rmSnapshotHtml, expand, frame.__rmSnapshotPrepare);
    frame.__rmSnapshotHtml = null;
    frame.__rmSnapshotPrepare = null;
    frame.__rmSnapshotAfterLoad = null;
}

function observeThumb(frame, scrollRoot, expand) {
    if (typeof IntersectionObserver !== 'function') { loadThumb(frame, expand); return; }
    if (!thumbObserver || thumbObserver.__root !== scrollRoot) {
        thumbObserver?.disconnect?.();
        thumbObserver = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
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
    if (width > 0) grid.style.setProperty('--thumb-scale', String(width / THUMB_WIDTH));
}

export async function openTheaterSnapshot() {
    const generation = ++openGeneration;
    const [{ applyAppearanceTheme }, api, favorites, persistence, runtime, connection, mount] = await Promise.all([
        import('./appearanceTheme.js?rmv=1.78.12'),
        import('./independentApi.js?rmv=1.78.12'),
        import('./theaterFavorites.js?rmv=1.78.12'),
        import('./independentApi/persistence.js?rmv=1.78.12'),
        import('./independentApi/runtime.js?rmv=1.78.12'),
        import('./independentApi/connection.js?rmv=1.78.12'),
        import('./independentApi/mount.js?rmv=1.78.12'),
    ]);
    const ctx = runtime.getContext?.() || {};
    const chat = Array.isArray(ctx.chat) ? ctx.chat : [];
    let persisted = [];
    const recordFaceSwipes = new Map();
    try {
        const entries = persistence.chatPersistedOwnerEntries(ctx);
        for (const entry of entries) if (entry.record?.faceSwipes) recordFaceSwipes.set(`${entry.index}:${entry.swipe}`, entry.record.faceSwipes);
        // 和聊天里挂兔子镜用同一个判断：这面存档是不是对着这一层现在的正文生成的。
        // 对不上（换回以前的存档、正文改过）时聊天里不会挂它，快拍照样列出来，但标上「正文已变」，点进去时说清楚。
        const matchesFloor = entry => {
            try {
                const msg = chat[entry.index];
                if (!msg) return false;
                return !!connection.savedRecordMatchesObserved(entry.record, mount.passiveObservedIdentity(ctx, entry.index, msg));
            } catch { return true; }
        };
        persisted = entries
            .map(entry => ({ index: entry.index, swipe: entry.swipe, html: entry.record?.html || '', stale: !matchesFloor(entry) }))
            .filter(entry => entry.html);
    } catch { persisted = []; }
    const domErrors = readDomSnapshotErrors();
    let imageChatKey = '';
    let restoreBuiltinImages = () => 0;
    let applyTextures = () => 0;
    let applySprites = () => 0;
    try {
        const textures = await import('./materialTexture.js?rmv=1.78.12');
        applyTextures = root => textures.applyMaterialTextures(root, undefined, { record: false });
    } catch { /* 没有材质模块时缩略图保持原样 */ }
    try {
        const sprites = await import('./pixelSprites.js?rmv=1.78.12');
        applySprites = root => sprites.applyPixelSprites(root);
    } catch { /* 没有像素画模块时缩略图保持原样 */ }
    try {
        const connection = await import('./independentApi/connection.js?rmv=1.78.12');
        imageChatKey = String(connection.chatKey(ctx) || '');
    } catch { imageChatKey = ''; }
    try {
        const images = await import('./builtinImage.js?rmv=1.78.12');
        if (typeof images.restoreSavedBuiltinImages === 'function') restoreBuiltinImages = images.restoreSavedBuiltinImages;
    } catch { /* 没有生图模块时图框保持原样 */ }
    let sessionErrors = [];
    try {
        const flights = await import('./independentApi/flights.js?rmv=1.78.12');
        const key = imageChatKey;
        const seen = new Set(domErrors.map(row => row.mesid));
        for (const failure of flights.automaticFailureStops?.values?.() || []) {
            if (!failure || flights.isMissingShellStop?.(failure)) continue;
            const base = String(failure.baseSlot || '');
            if (!key || !base.startsWith(`${key}:`)) continue;
            const match = base.slice(key.length + 1).match(/^(\d+):(\d+)$/);
            if (!match) continue;
            const mesid = Number(match[1]);
            const swipe = Number(match[2]);
            if (seen.has(mesid) || currentSwipeId(chat[mesid]) !== swipe) continue;
            const text = String(failure.message || '').trim();
            if (!text) continue;
            seen.add(mesid);
            sessionErrors.push({ mesid, text });
        }
    } catch { sessionErrors = []; }
    let items = collectTheaterSnapshots(chat, { persisted, domErrors: [...domErrors, ...sessionErrors] });
    // 重说的其它版本：本机记录优先，没有就用聊天文件里随楼存的、再没有就用版本存档。只读，不改任何记录。
    try {
        const [swipes, faceSwipe] = await Promise.all([
            import('./swipeVersions.js?rmv=1.78.12'),
            import('./independentApi/faceSwipe.js?rmv=1.78.12'),
        ]);
        let archive = new Map();
        if (imageChatKey && typeof swipes.loadFaceSwipeArchiveRows === 'function') {
            const rows = await swipes.loadFaceSwipeArchiveRows(imageChatKey).catch(() => null);
            archive = new Map((rows || []).map(row => [String(row.slot), row.states || {}]));
        }
        const versionsByKey = new Map();
        for (const item of items) {
            if (item.kind !== 'ready' || !imageChatKey) continue;
            const key = `${item.mesid}:${item.swipe}`;
            const base = `${imageChatKey}:${key}`;
            const states = {};
            for (let face = 0; face < 5; face += 1) {
                const candidates = [swipes.readFaceSwipe(base, face), recordFaceSwipes.get(key)?.[face], archive.get(base)?.[face]];
                // 三处记录可能不一致（换过设备时）：取最后改动过的那一份，和挂楼时的取法一样。
                const state = candidates.map(value => swipes.normalizeSwipeState(value)).filter(value => value.versions.length > 1)
                    .sort((a, b) => Number(b.touched || 0) - Number(a.touched || 0))[0];
                if (state) states[face] = state;
            }
            if (Object.keys(states).length) versionsByKey.set(key, states);
        }
        items = expandSnapshotVersions(items, versionsByKey, faceSwipe.mergeFaceDetailsIntoHtml);
    } catch { /* 读不到版本就只列当前这一版 */ }
    let expandBlocks = value => String(value || '');
    try {
        const markup = await import('./outputSanitizer/markup.js?rmv=1.78.12');
        if (typeof markup.expandHtmlDocumentCodeBlocks === 'function') expandBlocks = markup.expandHtmlDocumentCodeBlocks;
    } catch { /* 缩略图用原文 */ }
    if (generation !== openGeneration) return [];
    closeSnapshotNow();

    const narrow = (globalThis.innerWidth || 1024) < 640;
    const overlay = document.createElement('dialog');
    overlay.setAttribute('aria-label', '兔子镜快拍');
    overlay.setAttribute('data-rm-theater-snapshot', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;width:auto;height:auto;max-width:none;max-height:none;margin:0;padding:max(16px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));box-sizing:border-box;border:0;background:rgba(8,10,14,.62);display:flex;align-items:center;justify-content:center;z-index:10070;';
    applyAppearanceTheme(overlay);
    if (narrow) overlay.style.alignItems = 'stretch';
    if (narrow) overlay.style.padding = 'max(10px,env(safe-area-inset-top)) 0 0 0';
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
    title.textContent = '快拍';
    const count = document.createElement('span');
    count.className = 'rm-snap-count';
    count.textContent = items.length ? `${items.length} 条` : '';
    title.append(count);
    const note = document.createElement('p');
    note.className = 'rm-snap-note';
    note.textContent = '最新 10 条在最前，重说过的楼会把每一版都列出来。整页直接看，镜片一排两个、点进去再看。收藏仍进原来的收藏夹。';
    const heading = document.createElement('div');
    heading.style.cssText = 'flex:1;min-width:0;';
    heading.append(title, note);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'rm-snap-close';
    close.textContent = '×';
    close.setAttribute('aria-label', '关闭快拍');
    close.addEventListener('click', () => closeTheaterSnapshot());
    head.append(heading, close);
    let viewMode = 'feed';
    try { viewMode = globalThis.localStorage?.getItem(SNAPSHOT_VIEW_KEY) === 'grid' ? 'grid' : 'feed'; } catch { viewMode = 'feed'; }
    const viewSwitch = document.createElement('div');
    viewSwitch.className = 'rm-snap-view';
    viewSwitch.setAttribute('role', 'group');
    viewSwitch.setAttribute('aria-label', '显示方式');
    const viewButtons = [];
    for (const [key, label] of [['feed', '整页'], ['grid', '镜片']]) {
        const option = document.createElement('button');
        option.type = 'button';
        option.textContent = label;
        option.setAttribute('aria-pressed', String(viewMode === key));
        option.addEventListener('click', () => {
            if (viewMode === key) return;
            viewMode = key;
            try { globalThis.localStorage?.setItem(SNAPSHOT_VIEW_KEY, key); } catch { /* 记不住就只用这一次 */ }
            for (const other of viewButtons) other.setAttribute('aria-pressed', String(other === option));
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
    older.textContent = '更早';
    const range = document.createElement('div');
    range.className = 'rm-snap-range';
    // 页码：直接跳到任意一页，不用一页页点「更早」。
    const pageSelect = document.createElement('select');
    pageSelect.className = 'rm-snap-page-select';
    pageSelect.setAttribute('aria-label', '跳到第几页');
    pageSelect.addEventListener('change', () => { page = Number(pageSelect.value) || 0; render(); card.scrollTop = 0; });
    const rangeText = document.createElement('span');
    range.append(pageSelect, rangeText);
    const newer = document.createElement('button');
    newer.type = 'button';
    newer.textContent = '更新';
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
            if (stale) globalThis.toastr?.info?.(`#${mesid} 现在的正文和生成这面兔子镜时不一样（换过存档或改过正文），所以聊天里那一层没挂这面。想挂回去，可以在那一层的兔子镜卡上点「找回旧兔子镜」试试。`, '兔子镜');
        });
    };

    const refreshStars = () => {
        for (const entry of stars) {
            void favorites.isTheaterFavoriteHtml(entry.html).then(on => {
                if (entry.button.isConnected) paintStar(entry.button, on);
            }).catch(() => {});
        }
    };

    const wireStar = (button, item, stage) => {
        stars.push({ button, html: item.html });
        button.addEventListener('click', () => {
            if (button.dataset.rmSnapshotBusy === 'true') return;
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
                globalThis.toastr?.success?.(result.already ? '这一面已经在收藏夹里了，没有重复收藏。' : result.favorited ? '已收入兔子镜收藏夹。' : '已取消收藏。');
            }).catch(error => {
                paintStar(button, !next);
                globalThis.toastr?.warning?.(String(error?.message || '收藏失败。'));
            }).finally(() => { delete button.dataset.rmSnapshotBusy; });
        });
    };

    // 缩略图里先只记下这一面属于哪个聊天、哪一层；图等小窗口加载好以后在里面放，读不到时还能换地址再试。
    const prepareSnapshotImages = (template, item) => {
        // 1.74.2 以前存进兔子镜正文的生图进度条（「正在交给柏宝绘生图…」）：缩略图里不显示。
        template.content.querySelectorAll('[data-rm-draw-status]').forEach(node => node.remove());
        const roots = [...template.content.querySelectorAll('details')];
        if (!roots.length) roots.push(template.content);
        const faces = roots.filter(details => !details.parentElement?.closest?.('details'));
        for (const details of roots) {
            if (!details?.dataset) continue;
            if (imageChatKey) details.dataset.rmImageOwnerChat = imageChatKey;
            details.dataset.rmImageOwnerMesid = String(item.mesid);
            details.dataset.rmImageOwnerSwipe = String(item.swipe);
            let face = details;
            while (face.parentElement?.closest?.('details')) face = face.parentElement.closest('details');
            const at = faces.indexOf(face);
            if (at >= 0) details.dataset.rmImageOwnerFace = String(faces.length === 1 && Number.isInteger(item.versionOf?.face) ? item.versionOf.face : at);
        }
    };
    const paintThumbImages = doc => {
        for (const details of doc?.querySelectorAll?.('details') || []) {
            if (details.querySelector?.('[data-rm-draw-frame]')) restoreBuiltinImages(details);
        }
        if (doc?.body) { applyTextures(doc.body); applySprites(doc.body); }
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
        if (!host) stage.textContent = '这一面暂时挂不上。可以跳回原楼查看。';
        else host.querySelectorAll?.('details')?.forEach(details => { details.open = true; });
        return host;
    };

    const openItemViewer = item => {
        closeSnapshotViewer();
        const layer = document.createElement('div');
        layer.className = 'rm-snap-viewer';
        layer.addEventListener('pointerdown', event => {
            if (event.target !== layer) return;
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
        floor.setAttribute('aria-label', `跳到第 ${item.mesid} 层`);
        floor.addEventListener('click', () => jump(item.mesid, item.stale));
        const name = document.createElement('p');
        name.className = 'rm-snap-name';
        name.textContent = item.versionLabel ? `${item.title} · ${item.versionLabel}` : item.title;
        bar.append(floor, name);
        if (item.stale) {
            const chip = document.createElement('span');
            chip.className = 'rm-snap-chip';
            chip.textContent = '正文已变';
            chip.title = '这一层现在的正文和生成这面时不一样，聊天里没挂这面';
            bar.append(chip);
        }
        if (item.failed) {
            const chip = document.createElement('span');
            chip.className = 'rm-snap-chip';
            chip.textContent = '未完成';
            bar.append(chip);
        }
        const jumpButton = document.createElement('button');
        jumpButton.type = 'button';
        jumpButton.className = 'rm-snap-jump';
        jumpButton.textContent = '跳转';
        jumpButton.addEventListener('click', () => jump(item.mesid, item.stale));
        bar.append(jumpButton);
        const closer = document.createElement('button');
        closer.type = 'button';
        closer.className = 'rm-snap-close';
        closer.textContent = '×';
        closer.setAttribute('aria-label', '关闭这一面');
        closer.addEventListener('click', () => closeSnapshotViewer());
        bar.append(closer);
        const stage = document.createElement('div');
        stage.className = 'rm-snap-stage';
        stage.addEventListener('submit', event => { event.preventDefault(); event.stopPropagation(); });
        panel.append(bar, stage);
        layer.append(panel);
        overlay.append(layer);
        if (snapshot) snapshot.viewer = layer;
        if (item.kind === 'error' || !item.html) {
            const error = document.createElement('p');
            error.className = 'rm-snap-error';
            error.textContent = item.errorText || '这一层的兔子镜没有生成成功。跳回原楼可以重试。';
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
            if (star.isConnected) paintStar(star, on);
        }).catch(() => {});
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
        if (!view.total) rangeText.textContent = '';
        else {
            for (let index = 0; index < view.pages; index += 1) {
                const option = document.createElement('option');
                const from = index * THEATER_SNAPSHOT_PAGE_SIZE + 1;
                const to = Math.min(view.total, from + THEATER_SNAPSHOT_PAGE_SIZE - 1);
                option.value = String(index);
                option.textContent = `第 ${index + 1} 页（${from}–${to}）`;
                pageSelect.append(option);
            }
            pageSelect.value = String(view.page);
            pageSelect.hidden = view.pages < 2;
            rangeText.textContent = view.pages < 2 ? `共 ${view.total} 条` : `共 ${view.pages} 页 · ${view.total} 条`;
        }
        list.className = viewMode === 'grid' ? 'rm-snap-grid' : 'rm-snap-list';
        list.replaceChildren();
        if (!view.total) {
            const empty = document.createElement('div');
            empty.className = 'rm-snap-empty';
            empty.innerHTML = '<strong>这一聊天还没有可看的兔子镜</strong>生成成功或报错之后，会从最新的一条开始出现在这里。';
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
                plate.setAttribute('aria-label', `打开 #${item.mesid} ${item.title}`);
                if (item.failed) plate.setAttribute('data-failed', 'true');
                plate.style.setProperty('--plate', snapshotPlateColor(item.html) || 'var(--rh-primary,#ce729c)');
                if (item.html) {
                    const thumb = document.createElement('iframe');
                    thumb.className = 'rm-snap-thumb';
                    // 同源但不跑脚本：这样读图时带上酒馆的登录信息（开了用户账户的酒馆，图片要登录才能读）。
                    thumb.setAttribute('sandbox', 'allow-same-origin');
                    thumb.setAttribute('aria-hidden', 'true');
                    thumb.setAttribute('tabindex', '-1');
                    thumb.setAttribute('title', '');
                    thumb.__rmSnapshotHtml = item.html;
                    thumb.__rmSnapshotPrepare = template => prepareSnapshotImages(template, item);
                    thumb.__rmSnapshotAfterLoad = paintThumbImages;
                    plate.append(thumb);
                } else {
                    const copy = document.createElement('span');
                    copy.className = 'rm-snap-plate-copy';
                    copy.textContent = item.errorText || '这一层没有生成成功';
                    plate.append(copy);
                }
                const floor = document.createElement('button');
                floor.type = 'button';
                floor.className = 'rm-snap-plate-floor';
                floor.textContent = `#${item.mesid}`;
                floor.setAttribute('aria-label', `跳到第 ${item.mesid} 层`);
                floor.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    jump(item.mesid, item.stale);
                });
                plate.append(floor);
                plate.addEventListener('click', event => {
                    if (event.target?.closest?.('.rm-snap-plate-floor')) return;
                    openItemViewer(item);
                });
                plate.addEventListener('keydown', event => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    openItemViewer(item);
                });
                const name = document.createElement('p');
                name.className = 'rm-snap-tile-name';
                name.textContent = `${item.title}${item.versionLabel ? ` · ${item.versionLabel}` : ''}${item.stale ? ' · 正文已变' : ''}${item.failed ? ' · 未完成' : ''}`;
                tile.append(plate, name);
                list.append(tile);
            }
            requestAnimationFrame(() => {
                if (token !== renderToken) return;
                updateThumbScale(list);
                for (const frame of list.querySelectorAll('iframe.rm-snap-thumb')) observeThumb(frame, card, expandBlocks);
            });
            return;
        }
        for (const item of view.items) {
            const cardNode = document.createElement('article');
            cardNode.className = 'rm-snap-card';
            if (item.failed) cardNode.setAttribute('data-failed', 'true');
            const bar = document.createElement('div');
            bar.className = 'rm-snap-bar';
            const floor = document.createElement('button');
            floor.type = 'button';
            floor.className = 'rm-snap-floor';
            floor.textContent = `#${item.mesid}`;
            floor.title = `跳到 #${item.mesid}`;
            floor.setAttribute('aria-label', `跳到第 ${item.mesid} 层`);
            floor.addEventListener('click', () => jump(item.mesid, item.stale));
            const name = document.createElement('p');
            name.className = 'rm-snap-name';
            name.textContent = item.versionLabel ? `${item.title} · ${item.versionLabel}` : item.title;
            bar.append(floor, name);
            if (item.stale) {
                const chip = document.createElement('span');
                chip.className = 'rm-snap-chip';
                chip.textContent = '正文已变';
                chip.title = '这一层现在的正文和生成这面时不一样，聊天里没挂这面';
                bar.append(chip);
            }
            if (item.failed) {
                const chip = document.createElement('span');
                chip.className = 'rm-snap-chip';
                chip.textContent = '未完成';
                bar.append(chip);
            }
            const jumpButton = document.createElement('button');
            jumpButton.type = 'button';
            jumpButton.className = 'rm-snap-jump';
            jumpButton.textContent = '跳转';
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
                error.textContent = item.errorText || '这一层的兔子镜没有生成成功。跳回原楼可以重试。';
                stage.append(error);
            } else {
                star = document.createElement('button');
                star.type = 'button';
                star.className = 'rm-snap-star';
                paintStar(star, false);
                bar.append(star);
            }
            cardNode.append(bar, stage);
            list.append(cardNode);
            if (!star) continue;
            // 先放进页面再挂镜，镜面里的按钮才会在打开时接上。
            mountStage(stage, item);
            wireStar(star, item, stage);
            if (token === renderToken) {
                void favorites.isTheaterFavoriteHtml(item.html).then(on => {
                    if (token === renderToken && star.isConnected) paintStar(star, on);
                }).catch(() => {});
            }
        }
    };

    older.addEventListener('click', () => { page += 1; render(); card.scrollTop = 0; });
    newer.addEventListener('click', () => { page -= 1; render(); card.scrollTop = 0; });

    overlay.addEventListener('cancel', event => {
        event.preventDefault();
        event.stopPropagation();
        if (snapshot?.viewer) closeSnapshotViewer();
        else closeTheaterSnapshot();
    });
    overlay.addEventListener('pointerdown', event => {
        if (event.target !== overlay) return;
        event.preventDefault();
        closeTheaterSnapshot();
    });
    overlay.addEventListener('click', event => event.stopPropagation());
    const keydown = event => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (snapshot?.viewer) closeSnapshotViewer();
        else closeTheaterSnapshot();
    };
    const onFavoritesChanged = () => { if (snapshot?.overlay === overlay) refreshStars(); };
    // 转屏或改窗口宽度后，镜片缩略图按新宽度重算比例，不被裁掉也不留空。
    let resizeFrame = 0;
    const onResize = () => {
        if (resizeFrame) return;
        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = 0;
            for (const grid of overlay.querySelectorAll('.rm-snap-grid')) updateThumbScale(grid);
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
        if (typeof overlay.showModal === 'function') overlay.showModal();
        else overlay.setAttribute('open', '');
    } catch { overlay.setAttribute('open', ''); }
    render();
    return items;
}
