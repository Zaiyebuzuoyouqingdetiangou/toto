// 快拍：把当前聊天里的兔子镜按楼收成一页，最新在前，每页 10 条。
// 收藏仍走原来的收藏夹；这里只负责翻看、点开镜面里的交互、收藏/取消收藏，以及跳回原楼。
// 生成失败、没有成品的楼也留下，方便跳回去重试。正在生成的占位不收进来。

export const THEATER_SNAPSHOT_PAGE_SIZE = 10;

const GENERATING_PLACEHOLDER = /正在生成中|等待正文完成|等待手动生成/;
const FAILURE_MARK = /data-rabbit-mirror-face-failure|data-rabbit-mirror-follow-failure|兔子镜本批生成失败|【兔子镜：生成失败】|【兔子镜：第\s*\d+\s*面未完成】|面未完成|生成失败/;
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

function classifyFloor({ index, swipe, text, saved, errorText }) {
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
            failed: isMirrorFailure(html) || isMirrorFailure(text) || isMirrorFailure(errorText),
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

// persisted: [{ index, swipe, html }]，只认当前 swipe。domErrors: [{ mesid, text }]。
// 结果从新到旧。用户楼、没有兔子镜也没有报错的楼、还在生成的占位都不进入列表。
export function collectTheaterSnapshots(chat, sources = {}) {
    const list = Array.isArray(chat) ? chat : [];
    const savedByKey = new Map();
    for (const row of sources.persisted || []) {
        if (!row || !Number.isInteger(row.index) || row.index < 0) continue;
        const swipe = Number.isInteger(row.swipe) && row.swipe > 0 ? row.swipe : 0;
        savedByKey.set(`${row.index}:${swipe}`, String(row.html || ''));
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
            errorText: errors.get(index) || '',
        });
        if (item) items.push(item);
    }
    return items;
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
.rm-snap-pager{display:flex;align-items:center;gap:8px;position:sticky;top:0;z-index:2;padding:2px 0 8px;background:var(--rh-bg,var(--SmartThemeBlurTintColor,#f5f4fb))}
.rm-snap-pager button{flex:0 0 auto;min-height:36px;padding:0 12px;border-radius:999px;border:1px solid var(--rh-border,rgba(127,127,127,.35));background:transparent}
.rm-snap-range{flex:1;min-width:0;text-align:center;font-size:12px;font-weight:700;color:var(--rh-muted,inherit)}
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
@keyframes rm-snapshot-flash{0%{outline:3px solid var(--rh-primary,#ce729c)}100%{outline:3px solid transparent}}
[data-rm-snapshot-flash="true"]{animation:rm-snapshot-flash 1.4s ease;outline-offset:4px}
`;

let snapshot = null;

function overlayParent() {
    const settings = document.getElementById('rabbit_mirror_theater_settings');
    if (settings?.tagName === 'DIALOG' && (settings.open || settings.hasAttribute('open'))) return settings;
    return document.body;
}

export function closeTheaterSnapshot() {
    if (!snapshot) return;
    const { overlay, keydown, onFavoritesChanged } = snapshot;
    document.removeEventListener('keydown', keydown, true);
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

async function revealFloor(mesid) {
    const selector = `#chat .mes[mesid="${mesid}"], #chat [mesid="${mesid}"].mes`;
    const found = () => document.querySelector(selector);
    if (found()) return found();
    const more = document.querySelector('#show_more_messages, #chat .mes_show_more, .show_more_messages');
    const chat = document.getElementById('chat');
    for (let step = 0; step < 12 && !found(); step += 1) {
        if (typeof more?.click === 'function') more.click();
        else if (chat) chat.scrollTop = 0;
        await new Promise(resolve => setTimeout(resolve, 40));
    }
    return found();
}

function flashFloor(node) {
    node.setAttribute('data-rm-snapshot-flash', 'true');
    node.addEventListener?.('animationend', () => node.removeAttribute('data-rm-snapshot-flash'), { once: true });
}

function paintStar(button, on) {
    const favorited = !!on;
    button.setAttribute('aria-pressed', favorited ? 'true' : 'false');
    button.textContent = favorited ? '★ 已收藏' : '☆ 收藏';
    button.title = favorited ? '取消收藏这一面' : '收藏这一面';
}

export async function openTheaterSnapshot() {
    const [{ applyAppearanceTheme }, api, favorites, persistence, runtime] = await Promise.all([
        import('./appearanceTheme.js?rmv=1.68.43'),
        import('./independentApi.js?rmv=1.68.43'),
        import('./theaterFavorites.js?rmv=1.68.43'),
        import('./independentApi/persistence.js?rmv=1.68.43'),
        import('./independentApi/runtime.js?rmv=1.68.43'),
    ]);
    const ctx = runtime.getContext?.() || {};
    const chat = Array.isArray(ctx.chat) ? ctx.chat : [];
    let persisted = [];
    try {
        persisted = persistence.chatPersistedOwnerEntries(ctx)
            .map(entry => ({ index: entry.index, swipe: entry.swipe, html: entry.record?.html || '' }))
            .filter(entry => entry.html);
    } catch { persisted = []; }
    const domErrors = readDomSnapshotErrors();
    let sessionErrors = [];
    try {
        const flights = await import('./independentApi/flights.js?rmv=1.68.43');
        const connection = await import('./independentApi/connection.js?rmv=1.68.43');
        const key = connection.chatKey(ctx);
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
    const items = collectTheaterSnapshots(chat, { persisted, domErrors: [...domErrors, ...sessionErrors] });
    closeTheaterSnapshot();

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
    note.textContent = '最新的 10 条在最前。点楼层号跳回原楼；收藏和取消收藏进原来的收藏夹。';
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

    const pager = document.createElement('div');
    pager.className = 'rm-snap-pager';
    const older = document.createElement('button');
    older.type = 'button';
    older.textContent = '更早';
    const range = document.createElement('div');
    range.className = 'rm-snap-range';
    const newer = document.createElement('button');
    newer.type = 'button';
    newer.textContent = '更新';
    pager.append(older, range, newer);
    const list = document.createElement('div');
    list.className = 'rm-snap-list';
    shelf.append(head, pager, list);
    card.append(style, shelf);

    let page = 0;
    let renderToken = 0;
    const stars = [];

    const jump = mesid => {
        void revealFloor(mesid).then(node => {
            if (!node) {
                globalThis.toastr?.warning?.(`#${mesid} 还没出现在聊天页面上。先往上翻到这一层，再点一次跳转。`);
                return;
            }
            closeTheaterSnapshot();
            node.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
            flashFloor(node);
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

    const render = () => {
        const token = ++renderToken;
        stars.length = 0;
        const view = theaterSnapshotPage(items, page);
        page = view.page;
        older.disabled = view.page >= view.pages - 1 || !view.total;
        newer.disabled = view.page <= 0 || !view.total;
        older.hidden = !view.total;
        newer.hidden = !view.total;
        range.hidden = !view.total;
        if (!view.total) range.textContent = '';
        else {
            const end = Math.min(view.total, view.start + view.items.length);
            range.textContent = `第 ${view.start + 1}–${end} 条，共 ${view.total} 条`;
        }
        list.replaceChildren();
        if (!view.total) {
            const empty = document.createElement('div');
            empty.className = 'rm-snap-empty';
            empty.innerHTML = '<strong>这一聊天还没有可看的兔子镜</strong>生成成功或报错之后，会从最新的一条开始出现在这里。';
            list.append(empty);
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
            floor.addEventListener('click', () => jump(item.mesid));
            const name = document.createElement('p');
            name.className = 'rm-snap-name';
            name.textContent = item.title;
            bar.append(floor, name);
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
            jumpButton.addEventListener('click', () => jump(item.mesid));
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
            const host = api.hydrateIndependentFavoriteHtml(stage, {
                html: item.html,
                id: `snapshot:${item.mesid}:${item.swipe}`,
                title: item.title,
                mesid: item.mesid,
                swipe: item.swipe,
            });
            if (!host) stage.textContent = '这一面暂时挂不上。可以跳回原楼查看。';
            else host.querySelectorAll?.('details')?.forEach(details => { details.open = true; });
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
        closeTheaterSnapshot();
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
        closeTheaterSnapshot();
    };
    const onFavoritesChanged = () => { if (snapshot?.overlay === overlay) refreshStars(); };
    document.addEventListener('keydown', keydown, true);
    document.addEventListener(favorites.THEATER_FAVORITES_CHANGED_EVENT, onFavoritesChanged);
    overlayParent().append(overlay);
    snapshot = {
        overlay,
        keydown,
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
