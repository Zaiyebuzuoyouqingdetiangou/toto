import { restoreRuntimeAnimationClone } from './runtimeAnimationState.js?rmv=1.67.39';
import { setContinuationCandidates, setContinuationCharacterResolver } from './continuationCache.js?rmv=1.67.39';
import { applyAppearanceTheme } from './appearanceTheme.js?rmv=1.67.39';
const DB_NAME = 'rabbit_mirror_theater_favorites_v1';
const STORE = 'favorites';
const DB_VERSION = 1;
export const THEATER_FAVORITES_CHANGED_EVENT = 'rabbitmirror:theater-favorites-changed';
export const THEATER_FAVORITE_MAX_ITEMS = 80;
export const THEATER_FAVORITE_MAX_HTML_BYTES = 400 * 1024;
export const UNCATEGORIZED_CHARACTER_NAME = '未分类';

function byteLength(value = '') {
    const text = String(value || '');
    try { return new TextEncoder().encode(text).length; }
    catch { return unescape(encodeURIComponent(text)).length; }
}

function notifyChanged() {
    try { document.dispatchEvent(new CustomEvent(THEATER_FAVORITES_CHANGED_EVENT)); } catch {}
    void refreshContinuationCandidates();
}

// 续篇候选：只取能读出原展现形式的收藏，记下标题、形式和一句梗概，不保留 HTML。
function continuationGist(html) {
    const text = String(html || '')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<summary[\s\S]*?<\/summary>/gi, ' ')
        .replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
    return text.slice(0, 60);
}

function continuationFormatId(html) {
    const match = /data-rm-face-recipe="([^"]*)"/i.exec(String(html || ''));
    if (!match) return '';
    try {
        const recipe = JSON.parse(match[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
        return Array.isArray(recipe?.formatIds) && recipe.formatIds.length ? String(recipe.formatIds[0]) : '';
    } catch { return ''; }
}

export async function refreshContinuationCandidates() {
    try {
        const rows = await listTheaterFavorites();
        setContinuationCandidates(rows.map(row => ({
            id: row.id, title: theaterFavoriteDisplayTitle(row).slice(0, 60), formatId: continuationFormatId(row.html),
            gist: continuationGist(row.html), characterId: String(row.characterId || ''),
        })).filter(row => row.formatId));
    } catch { /* 收藏夹不可用时就不出现续篇 */ }
}

function firstNonEmpty(values) {
    for (const value of values) {
        const text = String(value ?? '').trim();
        if (text) return text;
    }
    return '';
}

export function currentTheaterFavoriteCharacter() {
    try {
        const ctx = globalThis.SillyTavern?.getContext?.() || {};
        const characters = Array.isArray(ctx.characters) ? ctx.characters
            : (Array.isArray(globalThis.characters) ? globalThis.characters : []);
        const groupId = firstNonEmpty([ctx.groupId, ctx.group_id, globalThis.selected_group]);
        if (groupId) {
            const groups = Array.isArray(ctx.groups) ? ctx.groups
                : (Array.isArray(globalThis.groups) ? globalThis.groups : []);
            const group = groups.find(item => String(item?.id) === groupId);
            const name = firstNonEmpty([group?.name, ctx.groupName, '群聊']).replace(/\s+/g, ' ').slice(0, 80);
            return { characterId: `group:${groupId}`.slice(0, 180), characterName: name || '群聊' };
        }
        const chid = ctx.characterId ?? ctx.character_id ?? globalThis.this_chid;
        const character = ctx.character || (characters[chid] && typeof characters[chid] === 'object' ? characters[chid] : null);
        const avatar = firstNonEmpty([character?.avatar]);
        const name = firstNonEmpty([ctx.name2, character?.name, ctx.characterName]).replace(/\s+/g, ' ').slice(0, 80);
        const characterId = firstNonEmpty([avatar, name ? `name:${name}` : '', chid != null && chid !== '' ? `chid:${chid}` : '']).slice(0, 180);
        return {
            characterId,
            characterName: name || (characterId ? '未命名角色' : UNCATEGORIZED_CHARACTER_NAME),
        };
    } catch {
        return { characterId: '', characterName: UNCATEGORIZED_CHARACTER_NAME };
    }
}

export function groupTheaterFavoritesByCharacter(rows) {
    const groups = new Map();
    for (const row of rows || []) {
        const id = String(row?.characterId || '');
        const name = String(row?.characterName || '').trim() || (id ? '未命名角色' : UNCATEGORIZED_CHARACTER_NAME);
        if (!groups.has(id)) groups.set(id, { characterId: id, characterName: name, items: [] });
        const group = groups.get(id);
        if (name && (group.characterName === UNCATEGORIZED_CHARACTER_NAME || !group.characterName)) group.characterName = name;
        group.items.push(row);
    }
    return [...groups.values()].sort((a, b) => {
        if (!a.characterId && b.characterId) return 1;
        if (a.characterId && !b.characterId) return -1;
        return String(a.characterName).localeCompare(String(b.characterName), 'zh');
    });
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new Error('当前环境没有 IndexedDB，无法使用兔子镜收藏夹。'));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE)) {
                const store = db.createObjectStore(STORE, { keyPath: 'id' });
                store.createIndex('createdAt', 'createdAt');
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('无法打开兔子镜收藏夹。'));
    });
}

function runStore(mode, work) {
    return openDatabase().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const store = tx.objectStore(STORE);
        let result;
        tx.oncomplete = () => {
            try { db.close(); } catch {}
            resolve(result);
        };
        tx.onerror = () => {
            try { db.close(); } catch {}
            reject(tx.error || new Error('收藏夹事务失败。'));
        };
        tx.onabort = () => {
            try { db.close(); } catch {}
            reject(tx.error || new Error('收藏夹事务已中止。'));
        };
        try { result = work(store, value => { result = value; }); }
        catch (error) { reject(error); }
    }));
}

function normalizeRecord(value) {
    if (!value || typeof value !== 'object') return null;
    const html = String(value.html || '').trim();
    if (!html || byteLength(html) > THEATER_FAVORITE_MAX_HTML_BYTES) return null;
    const id = String(value.id || '').trim();
    if (!id) return null;
    const characterId = String(value.characterId || '').slice(0, 180);
    const characterName = String(value.characterName || '').replace(/\s+/g, ' ').trim().slice(0, 80)
        || (characterId ? '未命名角色' : UNCATEGORIZED_CHARACTER_NAME);
    return {
        id,
        title: String(value.title || '未命名兔子镜').replace(/\s+/g, ' ').trim().slice(0, 120) || '未命名兔子镜',
        mode: value.mode === 'text' ? 'text' : 'html',
        html,
        chatKey: String(value.chatKey || '').slice(0, 180),
        mesid: Number.isInteger(value.mesid) && value.mesid >= 0 ? value.mesid : null,
        swipe: Number.isInteger(value.swipe) && value.swipe >= 0 ? value.swipe : null,
        sourceHash: String(value.sourceHash || '').slice(0, 80),
        characterId,
        characterName,
        createdAt: Number(value.createdAt) || Date.now(),
    };
}

export async function listTheaterFavorites() {
    const rows = await runStore('readonly', (store, done) => {
        const request = store.getAll();
        request.onsuccess = () => done(request.result || []);
    });
    return (Array.isArray(rows) ? rows : []).map(normalizeRecord).filter(Boolean)
        .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
}

export async function getTheaterFavorite(id) {
    const row = await runStore('readonly', (store, done) => {
        const request = store.get(String(id || ''));
        request.onsuccess = () => done(request.result || null);
    });
    return normalizeRecord(row);
}

function hashFavoriteHtml(text = '') {
    let h = 2166136261;
    for (const ch of String(text)) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
}

const FAVORITE_RUNTIME_UI_SELECTOR = [
    '[data-rabbit-mirror-tool-entry-host]',
    '[data-rm-image-region]',
    '[data-rm-image-portal]',
    '[data-rabbit-mirror-maintenance-rabbit]',
    '[data-rabbit-mirror-feedback-cat]',
    '[data-rabbit-mirror-recipe]',
    '[data-rabbit-mirror-resay]',
    '[data-rm-tool-menu-button]',
    '[data-rm-ephemeral-failure-body]',
    '[data-rm-face-swipe-host]',
    '[data-rm-face-swipe-bar]',
    '[data-rm-face-swipe-delete]',
    '[data-rm-face-favorite-star]',
].join(', ');

export function sanitizeTheaterFavoriteTitle(title) {
    return String(title || '')
        .replace(/[‹<]\s*\d+\s*\/\s*\d+\s*[›>]/g, '')
        .replace(/[×✕]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 120);
}

export function theaterFavoriteTitleFromDetails(details) {
    const summary = details?.querySelector?.(':scope > summary') || details?.querySelector?.('summary');
    if (!summary) return '';
    const clone = typeof summary.cloneNode === 'function' ? summary.cloneNode(true) : null;
    if (clone?.querySelectorAll) {
        stripTheaterFavoriteRuntimeUi(clone);
        return sanitizeTheaterFavoriteTitle(clone.textContent);
    }
    return sanitizeTheaterFavoriteTitle(summary.textContent);
}

export function theaterFavoriteDisplayTitle(record) {
    const html = String(record?.html || '').trim();
    if (html && typeof document !== 'undefined') {
        const template = document.createElement('template');
        template.innerHTML = html;
        const fromHtml = theaterFavoriteTitleFromDetails(template.content.querySelector('details') || template.content);
        if (fromHtml) return fromHtml;
    }
    return sanitizeTheaterFavoriteTitle(record?.title) || '未命名兔子镜';
}

function unwrapTheaterFavoriteTitleChrome(scope) {
    if (!scope?.querySelectorAll) return;
    scope.querySelectorAll('[data-rm-title-label]').forEach(label => {
        label.replaceWith(...[...label.childNodes]);
    });
    scope.querySelectorAll('[data-rabbit-mirror-title-part]').forEach(part => {
        const source = part.querySelector('[data-rabbit-mirror-title-source]');
        const text = source?.textContent
            || part.getAttribute('data-rabbit-mirror-title-display')
            || part.textContent
            || '';
        part.replaceWith(part.ownerDocument.createTextNode(text));
    });
    scope.querySelectorAll('[data-rm-title-chrome]').forEach(node => node.removeAttribute('data-rm-title-chrome'));
    scope.querySelectorAll('details[open]').forEach(node => node.removeAttribute('open'));
}

export function stripTheaterFavoriteRuntimeUi(scope) {
    if (!scope?.querySelectorAll) return;
    scope.querySelectorAll(FAVORITE_RUNTIME_UI_SELECTOR).forEach(node => node.remove());
    unwrapTheaterFavoriteTitleChrome(scope);
}

async function copyTextToClipboard(text) {
    const value = String(text || '');
    if (!value) return false;
    try {
        await navigator.clipboard.writeText(value);
        return true;
    } catch {
        try {
            const field = document.createElement('textarea');
            field.value = value;
            field.setAttribute('readonly', '');
            field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
            document.body.append(field);
            field.select();
            const ok = document.execCommand('copy');
            field.remove();
            return !!ok;
        } catch {
            return false;
        }
    }
}

export async function copyTheaterFavoriteHtml(record) {
    const html = scrubTheaterFavoriteHtml(record?.html);
    if (!html) throw new Error('这面收藏没有可复制的 HTML。');
    const copied = await copyTextToClipboard(html);
    if (!copied) throw new Error('复制失败，当前收藏没有改变。');
    return html;
}

export function scrubTheaterFavoriteHtml(html) {
    const source = String(html || '').trim();
    if (!source || typeof document === 'undefined') return source;
    const template = document.createElement('template');
    template.innerHTML = source;
    stripTheaterFavoriteRuntimeUi(template.content);
    const root = [...template.content.children].find(node => node.nodeType === 1);
    return String(root?.outerHTML || source).trim();
}

export function theaterFavoriteToggleId(html) {
    const scrubbed = scrubTheaterFavoriteHtml(html);
    return `toggle_${hashFavoriteHtml(scrubbed)}`.slice(0, 80);
}

export async function saveTheaterFavorite(input) {
    const html = scrubTheaterFavoriteHtml(input?.html);
    if (!html) throw new Error('没有可收藏的兔子镜内容。');
    if (byteLength(html) > THEATER_FAVORITE_MAX_HTML_BYTES) {
        throw new Error('这面兔子镜超过收藏夹单条体积上限，未写入。');
    }
    const character = currentTheaterFavoriteCharacter();
    const record = normalizeRecord({
        id: String(input?.id || '').trim() || `fav_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        title: input?.title,
        mode: input?.mode,
        html,
        chatKey: input?.chatKey,
        mesid: input?.mesid,
        swipe: input?.swipe,
        sourceHash: input?.sourceHash,
        characterId: input?.characterId || character.characterId,
        characterName: input?.characterName || character.characterName,
        createdAt: Date.now(),
    });
    if (!record) throw new Error('收藏内容无法保存。');
    await runStore('readwrite', (store, done) => {
        const request = store.getAll();
        request.onsuccess = () => {
            const rows = (Array.isArray(request.result) ? request.result : []).map(normalizeRecord).filter(Boolean)
                .filter(row => row.id !== record.id)
                .sort((a, b) => Number(a.createdAt) - Number(b.createdAt));
            while (rows.length >= THEATER_FAVORITE_MAX_ITEMS) {
                const oldest = rows.shift();
                if (oldest?.id) store.delete(oldest.id);
            }
            store.put(record);
            done(record);
        };
    });
    notifyChanged();
    return record;
}

export async function deleteTheaterFavorite(id) {
    const key = String(id || '');
    if (!key) return false;
    await runStore('readwrite', store => store.delete(key));
    notifyChanged();
    return true;
}

export async function toggleTheaterFavorite(input) {
    const captured = input && typeof input === 'object' ? input : null;
    const html = scrubTheaterFavoriteHtml(captured?.html);
    if (!html) throw new Error('当前没有可收藏的兔子镜。');
    const id = theaterFavoriteToggleId(html);
    const existing = await getTheaterFavorite(id);
    if (existing) {
        await deleteTheaterFavorite(id);
        return { favorited: false, id };
    }
    await saveTheaterFavorite({ ...captured, html, id });
    return { favorited: true, id };
}

export async function isTheaterFavoriteHtml(html) {
    const id = theaterFavoriteToggleId(html);
    return !!(await getTheaterFavorite(id));
}

function isTheaterFavoritePlaceholder(details) {
    return !!details?.classList?.contains('rabbit-mirror-external-placeholder')
        || !!details?.hasAttribute?.('data-rabbit-mirror-placeholder');
}

function firstCapturableFavoriteDetails(nodes) {
    for (const node of nodes || []) {
        if (node?.matches?.('details') && !isTheaterFavoritePlaceholder(node)) return node;
    }
    return null;
}

export function resolveTheaterFavoriteCaptureRoot(root) {
    const direct = root?.matches?.('details') ? root
        : (root?.closest?.('details') || root?.querySelector?.('details') || null);
    if (direct && !isTheaterFavoritePlaceholder(direct)) return direct;
    const host = root?.closest?.('[data-rabbit-mirror-external-source="true"], .rabbit-mirror-external-host')
        || direct?.closest?.('[data-rabbit-mirror-external-source="true"], .rabbit-mirror-external-host');
    const fromHost = firstCapturableFavoriteDetails(host?.children);
    if (fromHost) return fromHost;
    const message = root?.closest?.('.mes, [mesid]') || host?.closest?.('.mes, [mesid]') || direct?.closest?.('.mes, [mesid]');
    for (const shell of message?.querySelectorAll?.('[data-rabbit-mirror-external-source="true"], .rabbit-mirror-external-host') || []) {
        const found = firstCapturableFavoriteDetails(shell.children);
        if (found) return found;
    }
    return null;
}

export function captureTheaterFavoriteFromRoot(root, owner = {}) {
    const details = resolveTheaterFavoriteCaptureRoot(root);
    if (!details) return null;
    const html = scrubTheaterFavoriteHtml(restoreRuntimeAnimationClone(details, details.cloneNode(true)).outerHTML);
    if (!html) return null;
    const title = theaterFavoriteTitleFromDetails(details) || String(details.querySelector?.(':scope > summary')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    const character = currentTheaterFavoriteCharacter();
    return {
        id: theaterFavoriteToggleId(html),
        title: title || '未命名兔子镜',
        mode: String(details.getAttribute?.('data-rm-presentation-mode') || owner.mode || '') === 'text' ? 'text' : 'html',
        html,
        chatKey: String(owner.chatKey || details.dataset?.rabbitMirrorOwnerChat || ''),
        mesid: Number.isInteger(owner.mesid) ? owner.mesid : Number(details.dataset?.rabbitMirrorOwnerMesid),
        swipe: Number.isInteger(owner.swipe) ? owner.swipe : Number(details.dataset?.rabbitMirrorOwnerSwipe),
        sourceHash: String(owner.sourceHash || details.dataset?.rabbitMirrorOwnerSourceHash || ''),
        characterId: String(owner.characterId || character.characterId || ''),
        characterName: String(owner.characterName || character.characterName || UNCATEGORIZED_CHARACTER_NAME),
    };
}

let viewer = null;
// 最近一次打开收藏夹时用的挂载函数；从里程碑卡片直接打开收藏夹时沿用它。
let lastHydrate = null;
let library = null;

function overlayParent() {
    const settings = document.getElementById('rabbit_mirror_theater_settings');
    if (settings?.tagName === 'DIALOG' && (settings.open || settings.hasAttribute('open'))) return settings;
    return document.body;
}

function dismissOverlay(overlay) {
    try { if (overlay?.open && typeof overlay.close === 'function') overlay.close(); } catch {}
    overlay?.remove?.();
}

export function closeTheaterFavoriteViewer() {
    if (!viewer) return;
    const { overlay, keydown } = viewer;
    document.removeEventListener('keydown', keydown, true);
    dismissOverlay(overlay);
    viewer = null;
}

export function closeTheaterFavoriteLibrary() {
    if (!library) return;
    const { overlay, keydown } = library;
    document.removeEventListener('keydown', keydown, true);
    dismissOverlay(overlay);
    library = null;
}

function overlayCard(label) {
    const overlay = document.createElement('dialog');
    overlay.setAttribute('aria-label', label);
    overlay.style.cssText = 'position:fixed;inset:0;width:auto;height:auto;max-width:none;max-height:none;margin:0;padding:max(16px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));box-sizing:border-box;border:0;background:rgba(8,10,14,.62);display:flex;align-items:center;justify-content:center;z-index:10070;';
    applyAppearanceTheme(overlay);
    const card = document.createElement('div');
    card.setAttribute('data-rm-theater-favorite-card', 'true');
    card.style.cssText = 'width:min(720px,calc(100vw - 24px));max-height:min(88vh,calc(100dvh - 48px));overflow:auto;background:var(--SmartThemeBlurTintColor,#202226);color:var(--SmartThemeBodyColor,#ddd);border:1px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:18px;box-shadow:0 22px 70px rgba(0,0,0,.42);padding:14px;box-sizing:border-box;position:relative;isolation:isolate;';
    overlay.append(card);
    overlay.addEventListener('click', event => event.stopPropagation());
    overlay.addEventListener('pointerdown', event => event.stopPropagation());
    overlay.addEventListener('submit', event => { event.preventDefault(); event.stopPropagation(); });
    return { overlay, card };
}

function presentOverlay(overlay) {
    overlayParent().append(overlay);
    try {
        if (typeof overlay.showModal === 'function') overlay.showModal();
        else overlay.setAttribute('open', '');
    } catch {
        overlay.setAttribute('open', '');
    }
}

function bindOverlayDismiss(overlay, close) {
    overlay.addEventListener('cancel', event => {
        event.preventDefault();
        event.stopPropagation();
        close();
    });
    overlay.addEventListener('pointerdown', event => {
        if (event.target !== overlay) return;
        event.preventDefault();
        close();
    });
}

export async function openTheaterFavoriteViewer(id, hydrate) {
    const record = await getTheaterFavorite(id);
    if (!record) throw new Error('没有找到这条收藏。');
    closeTheaterFavoriteViewer();
    const { overlay, card } = overlayCard('兔子镜收藏');
    overlay.style.zIndex = '10080';
    overlay.setAttribute('data-rm-theater-favorite-viewer', 'true');
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;gap:8px;align-items:center;justify-content:space-between;margin-bottom:10px;';
    const title = document.createElement('strong');
    title.textContent = theaterFavoriteDisplayTitle(record);
    title.style.cssText = 'min-width:0;flex:1;font-size:15px;';
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:6px;flex:0 0 auto;';
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'menu_button';
    copy.textContent = '复制 HTML';
    copy.addEventListener('click', () => {
        void copyTheaterFavoriteHtml(record).then(() => {
            globalThis.toastr?.success?.('已复制这面收藏的 HTML。');
        }).catch(error => {
            globalThis.toastr?.warning?.(String(error?.message || '复制失败。'));
        });
    });
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'menu_button';
    close.textContent = '关闭';
    close.addEventListener('click', () => closeTheaterFavoriteViewer());
    actions.append(copy, close);
    header.append(title, actions);
    const note = document.createElement('p');
    note.style.cssText = 'margin:0 0 10px;opacity:.7;font-size:11px;line-height:1.45;';
    note.textContent = record.characterName
        ? `角色卡：${record.characterName}。收藏走本机净化与挂载，不写入主楼 Prompt。`
        : '收藏走本机净化与挂载，不写入主楼 Prompt，也不接入七日历坐标。';
    const stage = document.createElement('div');
    stage.setAttribute('data-rm-theater-favorite-stage', 'true');
    card.append(header, note, stage);
    stage.style.cssText = 'position:relative;max-width:100%;overflow:auto;isolation:isolate;';
    stage.addEventListener('submit', event => { event.preventDefault(); event.stopPropagation(); });
    bindOverlayDismiss(overlay, closeTheaterFavoriteViewer);
    const keydown = event => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopImmediatePropagation();
        closeTheaterFavoriteViewer();
    };
    document.addEventListener('keydown', keydown, true);
    presentOverlay(overlay);
    viewer = { overlay, keydown };
    if (typeof hydrate !== 'function') {
        closeTheaterFavoriteViewer();
        throw new Error('收藏夹缺少挂载管线。');
    }
    try {
        await hydrate(stage, record);
        stripTheaterFavoriteRuntimeUi(stage);
    } catch (error) {
        closeTheaterFavoriteViewer();
        throw error;
    }
    return record;
}

// Only inspect the saved work, never chat history or the draw registry. Old
// favorites are recognized on read without rewriting their HTML or identity.
export const SOLAR_TERMS = Object.freeze(['立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
    '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒']);

const SOLAR_TERM_PATTERN = new RegExp(SOLAR_TERMS.join('|'), 'u');
const ORDINARY_SOLAR_WORDS = new Set(['雨水', '清明', '白露', '寒露', '小雪', '大雪', '小满']);
const SOLAR_TRADITIONAL_CHARS = { 驚: '惊', 蟄: '蛰', 穀: '谷', 滿: '满', 種: '种', 處: '处', 節: '节', 氣: '气', 歲: '岁', 時: '时' };

function normalizeSolarText(value = '') {
    return String(value).replace(/&#(x[\da-f]+|\d+);?/gi, (entity, code) => {
        const number = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
        return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : ' ';
    }).replace(/&(?:nbsp|ensp|emsp|thinsp|ZeroWidthSpace);/gi, ' ')
        .replace(/&[a-z][a-z\d]+;/gi, ' ')
        .replace(/[驚蟄穀滿種處節氣歲時]/gu, char => SOLAR_TRADITIONAL_CHARS[char])
        .replace(/[\s\u200b-\u200d\ufeff]+/gu, '');
}

function firstSolarTerm(value) {
    return normalizeSolarText(value).match(SOLAR_TERM_PATTERN)?.[0] || '';
}

// This is text extraction only: nothing is inserted into the live document.
function favoritePlainText(html = '') {
    return String(html).replace(/<(?:[^>"']|"[^"]*"|'[^']*')*>/g, tag =>
        /^<\/?(?:div|p|section|article|header|footer|h[1-6]|summary|li|dt|dd|td|th|tr|figcaption|caption|legend)\b/i.test(tag) ? '\n' : '');
}

export function solarTermOfFavorite(record) {
    const inTitle = firstSolarTerm(record?.title || '');
    if (inTitle) return inTitle;
    const html = String(record?.html || '')
        .replace(/<!--[\s\S]*?(?:-->|$)/g, '')
        .replace(/<(style|script|template)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, '');
    // A named heading or standalone label is direct evidence, including split
    // glyphs, vertical typesetting and traditional Chinese in existing works.
    for (const heading of html.matchAll(/<(h[1-6]|summary|header|figcaption|caption|legend|dt)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)) {
        const term = firstSolarTerm(favoritePlainText(heading[2]));
        if (term) return term;
    }
    const text = favoritePlainText(html);
    for (const line of text.split('\n')) {
        const label = normalizeSolarText(line).replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, '');
        if (SOLAR_TERMS.includes(label)) return label;
    }
    const normalized = normalizeSolarText(text);
    if (/节气|岁时|物候|初候|二候|三候/.test(normalized)) return firstSolarTerm(normalized);
    // Bare weather words and character names are not enough by themselves.
    for (const match of normalized.matchAll(new RegExp(SOLAR_TERM_PATTERN.source, 'gu'))) {
        if (!ORDINARY_SOLAR_WORDS.has(match[0])) return match[0];
    }
    return '';
}

export function solarTermProgress(rows) {
    const collected = new Map();
    for (const row of Array.isArray(rows) ? rows : []) {
        const term = solarTermOfFavorite(row);
        if (term && !collected.has(term)) collected.set(term, row);
    }
    return { total: SOLAR_TERMS.length, count: collected.size, collected };
}

function renderSolarTermProgress(rows, hydrate) {
    const progress = solarTermProgress(rows);
    const box = document.createElement('details');
    box.setAttribute('data-rm-solar-terms', 'true');
    box.style.cssText = 'margin:14px 0 0;padding:8px 10px;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:10px;opacity:.9;';
    const summary = document.createElement('summary');
    summary.style.cssText = 'cursor:pointer;font-weight:600;font-size:11px;opacity:.8;';
    summary.textContent = `二十四节气收集 ${progress.count}/${progress.total}`;
    const bar = document.createElement('div');
    bar.style.cssText = 'height:6px;margin:8px 0;border-radius:999px;background:color-mix(in srgb,currentColor 12%,transparent);overflow:hidden;';
    const fill = document.createElement('div');
    fill.style.cssText = `height:100%;width:${Math.round(progress.count / progress.total * 100)}%;background:currentColor;opacity:.55;border-radius:999px;`;
    bar.append(fill);
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;';
    for (const term of SOLAR_TERMS) {
        const row = progress.collected.get(term);
        const cell = document.createElement(row ? 'button' : 'span');
        cell.textContent = term;
        cell.style.cssText = `display:flex;align-items:center;justify-content:center;min-height:32px;border-radius:8px;font:inherit;font-size:12px;border:1px solid ${row ? 'currentColor' : 'color-mix(in srgb,currentColor 14%,transparent)'};background:${row ? 'color-mix(in srgb,currentColor 12%,transparent)' : 'transparent'};color:inherit;opacity:${row ? 1 : .42};font-weight:${row ? 800 : 400};`;
        if (row) {
            cell.type = 'button';
            cell.title = `打开「${theaterFavoriteDisplayTitle(row)}」`;
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => {
                void openTheaterFavoriteViewer(row.id, hydrate).catch(error => {
                    globalThis.toastr?.warning?.(String(error?.message || '无法打开收藏。'));
                });
            });
        }
        grid.append(cell);
    }
    const hint = document.createElement('p');
    hint.style.cssText = 'margin:8px 0 0;opacity:.62;font-size:11px;line-height:1.45;';
    hint.textContent = '按收藏的标题和正文识别节气，标题不必写节气名。点亮的格子可以直接打开那一面。';
    box.append(summary, bar, grid, hint);
    return box;
}


// 收藏夹：每一面收藏是一块「镜片」，镜片的颜色取自那一面自己的主色；其余界面安静地跟随兔子镜主题。
// 手机上是铺满屏幕的抽屉，电脑上是居中的面板；只用 dialog、flex/grid 与普通事件，酒馆网页、手机浏览器和 TT 都能打开。
const FAVORITE_VIEW_KEY = 'rabbitMirrorFavoriteView';
const LIBRARY_STYLE = `
[data-rm-fav-shelf]{--fav-gap:12px;display:flex;flex-direction:column;gap:12px;color:var(--rh-text,var(--SmartThemeBodyColor,#34495d));font-size:14px;line-height:1.5}
[data-rm-fav-shelf] button{font:inherit;color:inherit;cursor:pointer}
[data-rm-fav-shelf] button:focus-visible,[data-rm-fav-shelf] input:focus-visible{outline:2px solid var(--rh-primary,var(--SmartThemeQuoteColor,#ce729c));outline-offset:2px}
.rm-fav-head{display:flex;align-items:center;gap:10px}
.rm-fav-title{flex:1;min-width:0;margin:0;font-size:19px;font-weight:800;letter-spacing:.02em}
.rm-fav-count{font-size:13px;font-weight:600;color:var(--rh-muted,inherit);margin-left:6px}
.rm-fav-text-btn{min-height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--rh-border,rgba(127,127,127,.35));background:transparent}
.rm-fav-close{width:40px;height:40px;border-radius:50%;border:0;background:color-mix(in srgb,currentColor 8%,transparent);font-size:20px;line-height:1}
.rm-fav-tools{display:flex;flex-direction:column;gap:8px}
.rm-fav-search{width:100%;box-sizing:border-box;min-height:42px;padding:0 14px;border-radius:12px;border:1px solid var(--rh-border,rgba(127,127,127,.35));background:var(--rh-field,transparent);color:inherit;font:inherit}
.rm-fav-chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.rm-fav-chips::-webkit-scrollbar{display:none}
.rm-fav-chip{flex:0 0 auto;min-height:34px;padding:0 13px;border-radius:999px;border:1px solid var(--rh-border,rgba(127,127,127,.35));background:transparent;font-size:13px;white-space:nowrap}
.rm-fav-chip[aria-pressed="true"]{background:var(--rh-primary,#ce729c);border-color:var(--rh-primary,#ce729c);color:#fff;font-weight:700}
.rm-fav-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--fav-gap)}
.rm-fav-item{position:relative;display:flex;flex-direction:column;gap:7px;min-width:0}
.rm-fav-plate{position:relative;display:block;width:100%;aspect-ratio:4/5;border:1px solid var(--rh-border,rgba(127,127,127,.3));padding:0;border-radius:14px;overflow:hidden;background:var(--plate);box-shadow:0 4px 14px rgba(0,0,0,.12)}
.rm-fav-thumb{position:absolute;left:0;top:0;width:420px;height:525px;border:0;transform-origin:0 0;transform:scale(var(--thumb-scale,.4));pointer-events:none;background:transparent}
.rm-fav-plate-date{position:absolute;z-index:1;left:10px;bottom:9px;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;background:rgba(255,255,255,.78);color:#2b2b2b}
.rm-fav-name{margin:0;font-size:14px;font-weight:700;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
.rm-fav-meta{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--rh-muted,inherit);min-height:28px}
.rm-fav-meta span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rm-fav-more{flex:0 0 auto;width:30px;height:28px;border-radius:8px;border:0;background:transparent;font-size:16px;line-height:1;opacity:.7}
.rm-fav-confirm{display:flex;gap:6px}
.rm-fav-confirm button{flex:1;min-height:34px;border-radius:10px;border:1px solid var(--rh-border,rgba(127,127,127,.35));background:transparent;font-size:12px}
.rm-fav-confirm .rm-fav-danger{border-color:#c0504d;color:#c0504d;font-weight:700}
.rm-fav-empty{padding:34px 12px;text-align:center;color:var(--rh-muted,inherit);font-size:13px;line-height:1.7}
.rm-fav-empty strong{display:block;font-size:15px;color:var(--rh-text,inherit);margin-bottom:4px}
.rm-fav-row{display:flex;align-items:center;gap:8px}
.rm-fav-row .rm-fav-search{flex:1;min-width:0}
.rm-fav-view{display:flex;flex:0 0 auto;padding:3px;border-radius:12px;border:1px solid var(--rh-border,rgba(127,127,127,.35))}
.rm-fav-view button{min-height:34px;padding:0 11px;border:0;border-radius:9px;background:transparent;font-size:13px}
.rm-fav-view button[aria-pressed="true"]{background:color-mix(in srgb,var(--rh-primary,#ce729c) 16%,transparent);color:var(--rh-primary,#ce729c);font-weight:700}
.rm-fav-list{display:flex;flex-direction:column}
.rm-fav-line{display:flex;align-items:center;gap:12px;min-height:56px;padding:6px 2px;border-bottom:1px solid color-mix(in srgb,currentColor 10%,transparent)}
.rm-fav-line-open{flex:1;min-width:0;display:flex;align-items:center;gap:12px;border:0;background:transparent;padding:4px 0;text-align:left}
.rm-fav-swatch{flex:0 0 auto;width:12px;height:12px;border-radius:50%;background:var(--plate);box-shadow:inset 0 0 0 1px rgba(127,127,127,.35)}
.rm-fav-line-text{flex:1;min-width:0;display:flex;flex-direction:column}
.rm-fav-line-title{font-weight:700;font-size:14px;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rm-fav-line-meta{font-size:12px;color:var(--rh-muted,inherit);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rm-fav-line .rm-fav-confirm{flex:0 0 auto}
@media (min-width:640px){.rm-fav-grid{grid-template-columns:repeat(3,minmax(0,1fr))}[data-rm-fav-shelf]{--fav-gap:16px}}
@media (min-width:900px){.rm-fav-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (prefers-reduced-motion:no-preference){.rm-fav-plate{transition:transform .18s ease}.rm-fav-plate:active{transform:scale(.97)}}
`;

function favoritePlateColor(html) {
    const text = String(html || '');
    const match = /background(?:-color)?\s*:\s*(#[0-9a-f]{6}\b|#[0-9a-f]{3}\b)/i.exec(text)
        || /linear-gradient\([^)]*?(#[0-9a-f]{6}\b)/i.exec(text);
    if (!match) return '';
    let hex = match[1].toLowerCase();
    if (hex.length === 4) hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    return hex;
}

// 收藏夹缩略图：把这一面兔子镜本身缩小显示。放进无脚本的沙盒 iframe，样式不会影响酒馆页面；
// 动画停在 1 秒处（淡入已经完成），不跑动，滚到附近时才载入。
const THUMB_WIDTH = 420;
function favoriteThumbDocument(html) {
    let body = String(html || '');
    try {
        const template = document.createElement('template');
        template.innerHTML = body;
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

let thumbObserver = null;
function loadFavoriteThumb(frame) {
    if (!frame || frame.dataset.loaded === 'true') return;
    frame.dataset.loaded = 'true';
    frame.srcdoc = favoriteThumbDocument(frame.__rmFavoriteHtml);
    frame.__rmFavoriteHtml = null;
}
function observeFavoriteThumb(frame, scrollRoot) {
    if (typeof IntersectionObserver !== 'function') { loadFavoriteThumb(frame); return; }
    if (!thumbObserver || thumbObserver.__root !== scrollRoot) {
        thumbObserver?.disconnect?.();
        thumbObserver = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                thumbObserver.unobserve(entry.target);
                loadFavoriteThumb(entry.target);
            }
        }, { root: scrollRoot || null, rootMargin: '300px 0px' });
        thumbObserver.__root = scrollRoot;
    }
    thumbObserver.observe(frame);
}
function updateThumbScale(grid) {
    const plate = grid?.querySelector?.('.rm-fav-plate');
    const width = plate?.clientWidth || 0;
    if (width > 0) grid.style.setProperty('--thumb-scale', String(width / THUMB_WIDTH));
}

function favoriteDateText(ts) {
    const date = new Date(Number(ts) || Date.now());
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export async function openTheaterFavoriteLibrary(hydrate) {
    if (typeof hydrate === 'function') lastHydrate = hydrate; else hydrate = lastHydrate;
    const rows = await listTheaterFavorites();
    closeTheaterFavoriteLibrary();
    const { overlay, card } = overlayCard('兔子镜收藏夹');
    overlay.setAttribute('data-rm-theater-favorite-library', 'true');
    // 手机：铺满的抽屉；电脑：居中的较宽面板。
    const narrow = (globalThis.innerWidth || 1024) < 640;
    overlay.style.alignItems = narrow ? 'stretch' : 'center';
    if (narrow) overlay.style.padding = 'max(10px,env(safe-area-inset-top)) 0 0 0';
    card.style.cssText += narrow
        ? ';width:100%;max-width:none;max-height:none;height:100%;border-radius:22px 22px 0 0;padding:16px 14px max(18px,env(safe-area-inset-bottom));'
        : ';width:min(860px,calc(100vw - 48px));max-height:min(86vh,calc(100dvh - 64px));border-radius:22px;padding:22px 24px;';
    card.style.background = 'var(--rh-bg,var(--SmartThemeBlurTintColor,#f5f4fb))';
    const style = document.createElement('style');
    style.textContent = LIBRARY_STYLE;
    const shelf = document.createElement('div');
    shelf.setAttribute('data-rm-fav-shelf', 'true');

    const head = document.createElement('div');
    head.className = 'rm-fav-head';
    const title = document.createElement('h2');
    title.className = 'rm-fav-title';
    title.textContent = '收藏夹';
    const count = document.createElement('span');
    count.className = 'rm-fav-count';
    count.textContent = rows.length ? `${rows.length} 面` : '';
    title.append(count);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'rm-fav-close';
    close.textContent = '×';
    close.setAttribute('aria-label', '关闭收藏夹');
    close.addEventListener('click', () => closeTheaterFavoriteLibrary());
    head.append(title, close);
    shelf.append(head);

    const grid = document.createElement('div');
    grid.className = 'rm-fav-grid';
    let query = '';
    let character = '';
    let view = 'grid';
    try { view = globalThis.localStorage?.getItem(FAVORITE_VIEW_KEY) === 'list' ? 'list' : 'grid'; } catch { view = 'grid'; }
    if (!rows.length) {
        const empty = document.createElement('div');
        empty.className = 'rm-fav-empty';
        empty.innerHTML = '<strong>这里还空着</strong>点兔子镜标题旁的 ☆，喜欢的那一面就会收进来。';
        shelf.append(empty);
    } else {
        const tools = document.createElement('div');
        tools.className = 'rm-fav-tools';
        const search = document.createElement('input');
        search.type = 'search';
        search.className = 'rm-fav-search';
        search.placeholder = '按标题找一面';
        search.setAttribute('aria-label', '按标题搜索收藏');
        search.addEventListener('input', () => { query = search.value.trim().toLowerCase(); paint(); });
        // 两种排列：缩略图（镜片）或标题列表；记住上次的选择。
        const viewSwitch = document.createElement('div');
        viewSwitch.className = 'rm-fav-view';
        viewSwitch.setAttribute('role', 'group');
        viewSwitch.setAttribute('aria-label', '排列方式');
        for (const [key, label] of [['grid', '缩略图'], ['list', '列表']]) {
            const option = document.createElement('button');
            option.type = 'button';
            option.textContent = label;
            option.setAttribute('aria-pressed', String(view === key));
            option.addEventListener('click', () => {
                view = key;
                try { globalThis.localStorage?.setItem(FAVORITE_VIEW_KEY, key); } catch { /* best effort */ }
                viewSwitch.querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === option)));
                paint();
            });
            viewSwitch.append(option);
        }
        const searchRow = document.createElement('div');
        searchRow.className = 'rm-fav-row';
        searchRow.append(search, viewSwitch);
        tools.append(searchRow);
        const groups = groupTheaterFavoritesByCharacter(rows);
        if (groups.length > 1) {
            const chips = document.createElement('div');
            chips.className = 'rm-fav-chips';
            chips.setAttribute('role', 'group');
            chips.setAttribute('aria-label', '按角色筛选');
            const chip = (label, key) => {
                const node = document.createElement('button');
                node.type = 'button';
                node.className = 'rm-fav-chip';
                node.textContent = label;
                node.setAttribute('aria-pressed', String(character === key));
                node.addEventListener('click', () => {
                    character = key;
                    chips.querySelectorAll('.rm-fav-chip').forEach(other => other.setAttribute('aria-pressed', String(other === node)));
                    paint();
                });
                return node;
            };
            chips.append(chip(`全部 ${rows.length}`, ''));
            for (const group of groups) chips.append(chip(`${group.characterName} ${group.items.length}`, group.characterName));
            tools.append(chips);
        }
        shelf.append(tools, grid);
    }

    const plateFor = item => {
        const wrap = document.createElement('div');
        wrap.className = 'rm-fav-item';
        const plate = document.createElement('button');
        plate.type = 'button';
        plate.className = 'rm-fav-plate';
        plate.style.setProperty('--plate', favoritePlateColor(item.html) || 'var(--rh-primary,#ce729c)');
        plate.setAttribute('aria-label', `打开「${theaterFavoriteDisplayTitle(item)}」`);
        const date = document.createElement('span');
        date.className = 'rm-fav-plate-date';
        date.textContent = favoriteDateText(item.createdAt);
        const thumb = document.createElement('iframe');
        thumb.className = 'rm-fav-thumb';
        thumb.setAttribute('sandbox', '');
        thumb.setAttribute('aria-hidden', 'true');
        thumb.setAttribute('tabindex', '-1');
        thumb.setAttribute('title', '');
        thumb.__rmFavoriteHtml = item.html;
        plate.append(thumb, date);
        plate.addEventListener('click', () => {
            void openTheaterFavoriteViewer(item.id, hydrate).catch(error => globalThis.toastr?.warning?.(String(error?.message || '无法打开收藏。')));
        });
        const name = document.createElement('p');
        name.className = 'rm-fav-name';
        name.textContent = theaterFavoriteDisplayTitle(item);
        const meta = document.createElement('div');
        meta.className = 'rm-fav-meta';
        const who = document.createElement('span');
        who.textContent = item.characterName || '未分类';
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'rm-fav-more';
        more.textContent = '⋯';
        more.setAttribute('aria-label', '更多操作');
        more.addEventListener('click', () => {
            // 删除要再确认一次，避免误触。
            meta.replaceChildren();
            const confirm = document.createElement('div');
            confirm.className = 'rm-fav-confirm';
            confirm.style.flex = '1';
            const keep = document.createElement('button');
            keep.type = 'button';
            keep.textContent = '保留';
            keep.addEventListener('click', () => { meta.replaceChildren(who, more); });
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'rm-fav-danger';
            remove.textContent = '删除这一面';
            remove.addEventListener('click', () => {
                void deleteTheaterFavorite(item.id).then(() => openTheaterFavoriteLibrary(hydrate))
                    .catch(error => globalThis.toastr?.warning?.(String(error?.message || '删除失败。')));
            });
            confirm.append(keep, remove);
            meta.append(confirm);
            keep.focus?.();
        });
        meta.append(who, more);
        wrap.append(plate, name, meta);
        return wrap;
    };

    const lineFor = item => {
        const line = document.createElement('div');
        line.className = 'rm-fav-line';
        const open = document.createElement('button');
        open.type = 'button';
        open.className = 'rm-fav-line-open';
        open.setAttribute('aria-label', `打开「${theaterFavoriteDisplayTitle(item)}」`);
        const swatch = document.createElement('span');
        swatch.className = 'rm-fav-swatch';
        swatch.style.setProperty('--plate', favoritePlateColor(item.html) || 'var(--rh-primary,#ce729c)');
        const text = document.createElement('span');
        text.className = 'rm-fav-line-text';
        const name = document.createElement('span');
        name.className = 'rm-fav-line-title';
        name.textContent = theaterFavoriteDisplayTitle(item);
        const meta = document.createElement('span');
        meta.className = 'rm-fav-line-meta';
        meta.textContent = `${favoriteDateText(item.createdAt)}　${item.characterName || '未分类'}`;
        text.append(name, meta);
        open.append(swatch, text);
        open.addEventListener('click', () => {
            void openTheaterFavoriteViewer(item.id, hydrate).catch(error => globalThis.toastr?.warning?.(String(error?.message || '无法打开收藏。')));
        });
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'rm-fav-more';
        more.textContent = '⋯';
        more.setAttribute('aria-label', '更多操作');
        more.addEventListener('click', () => {
            more.remove();
            const confirm = document.createElement('div');
            confirm.className = 'rm-fav-confirm';
            const keep = document.createElement('button');
            keep.type = 'button';
            keep.textContent = '保留';
            keep.addEventListener('click', () => { confirm.remove(); line.append(more); });
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'rm-fav-danger';
            remove.textContent = '删除';
            remove.addEventListener('click', () => {
                void deleteTheaterFavorite(item.id).then(() => openTheaterFavoriteLibrary(hydrate))
                    .catch(error => globalThis.toastr?.warning?.(String(error?.message || '删除失败。')));
            });
            confirm.append(keep, remove);
            line.append(confirm);
            keep.focus?.();
        });
        line.append(open, more);
        return line;
    };

    function paint() {
        grid.className = view === 'list' ? 'rm-fav-list' : 'rm-fav-grid';
        grid.replaceChildren();
        const visible = rows.filter(item => (!character || (item.characterName || '未分类') === character)
            && (!query || theaterFavoriteDisplayTitle(item).toLowerCase().includes(query)));
        if (!visible.length) {
            const none = document.createElement('div');
            none.className = 'rm-fav-empty';
            none.style.gridColumn = '1 / -1';
            none.textContent = '没有找到这一面，换个词试试。';
            grid.append(none);
            return;
        }
        for (const item of visible) grid.append(view === 'list' ? lineFor(item) : plateFor(item));
        if (view !== 'list') {
            requestAnimationFrame(() => {
                updateThumbScale(grid);
                for (const frame of grid.querySelectorAll('iframe.rm-fav-thumb')) observeFavoriteThumb(frame, card);
            });
        }
    }
    if (rows.length) paint();
    if (typeof ResizeObserver === 'function') {
        const resize = new ResizeObserver(() => updateThumbScale(grid));
        resize.observe(grid);
        overlay.addEventListener('close', () => resize.disconnect(), { once: true });
    }
    // 节气收集放在最下面，默认收起。
    shelf.append(renderSolarTermProgress(rows, hydrate));
    card.append(style, shelf);
    bindOverlayDismiss(overlay, closeTheaterFavoriteLibrary);
    const keydown = event => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (viewer) closeTheaterFavoriteViewer();
        else closeTheaterFavoriteLibrary();
    };
    document.addEventListener('keydown', keydown, true);
    presentOverlay(overlay);
    library = { overlay, keydown };
    return rows;
}

setContinuationCharacterResolver(() => { try { return String(currentTheaterFavoriteCharacter()?.characterId || ''); } catch { return ''; } });
setTimeout(() => { void refreshContinuationCandidates(); }, 0);
