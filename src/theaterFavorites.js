import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.6.0";
import { expandHtmlDocumentCodeBlocks } from './outputSanitizer/markup.js?rmv=2.6.0';
import { restoreRuntimeAnimationClone } from './runtimeAnimationState.js?rmv=2.6.0';
import { setContinuationCandidates, setContinuationCharacterResolver } from './continuationCache.js?rmv=2.6.0';
import { applyAppearanceTheme } from './appearanceTheme.js?rmv=2.6.0';
import { createFavoriteAtlasPanel } from './favoriteAtlasesUi.js?rmv=2.6.0';
const DB_NAME = 'rabbit_mirror_theater_favorites_v1';
const STORE = 'favorites';
const DB_VERSION = 1;
export const THEATER_FAVORITES_CHANGED_EVENT = 'rabbitmirror:theater-favorites-changed';
export const THEATER_FAVORITE_MAX_ITEMS = Infinity;
export const THEATER_FAVORITE_MAX_HTML_BYTES = 400 * 1024;
export const UNCATEGORIZED_CHARACTER_NAME = __rmT("cynAhhB1");
function byteLength(value = '') {
    const text = String(value || '');
    try {
        return new TextEncoder().encode(text).length;
    }
    catch {
        return unescape(encodeURIComponent(text)).length;
    }
}
function notifyChanged() {
    contentIndexPromise = null;
    void import('./favoriteServerBackup.js?rmv=2.6.0').then(module => module.scheduleFavoriteServerBackup()).catch(() => { });
    void listTheaterFavorites().then(rows => {
        setContinuationCandidatesFromRows(rows);
        try {
            document.dispatchEvent(new CustomEvent(THEATER_FAVORITES_CHANGED_EVENT, { detail: { rows } }));
        }
        catch { }
    }).catch(() => {
        try {
            document.dispatchEvent(new CustomEvent(THEATER_FAVORITES_CHANGED_EVENT));
        }
        catch { }
    });
}
function continuationGist(html) {
    const text = String(html || '')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<summary[\s\S]*?<\/summary>/gi, ' ')
        .replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
    return text.slice(0, 60);
}
function continuationFormatId(html) {
    const match = /data-rm-face-recipe="([^"]*)"/i.exec(String(html || ''));
    if (!match)
        return '';
    try {
        const recipe = JSON.parse(match[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
        return Array.isArray(recipe?.formatIds) && recipe.formatIds.length ? String(recipe.formatIds[0]) : '';
    }
    catch {
        return '';
    }
}
function setContinuationCandidatesFromRows(rows) {
    setContinuationCandidates((Array.isArray(rows) ? rows : []).map(row => ({
        id: row.id, title: theaterFavoriteDisplayTitle(row).slice(0, 60), formatId: continuationFormatId(row.html),
        gist: continuationGist(row.html), characterId: String(row.characterId || ''),
    })).filter(row => row.formatId));
}
export async function refreshContinuationCandidates(rows) {
    try {
        setContinuationCandidatesFromRows(Array.isArray(rows) ? rows : await listTheaterFavorites());
    }
    catch { }
}
function firstNonEmpty(values) {
    for (const value of values) {
        const text = String(value ?? '').trim();
        if (text)
            return text;
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
            const name = firstNonEmpty([group?.name, ctx.groupName, __rmT("MJNyiT")]).replace(/\s+/g, ' ').slice(0, 80);
            return { characterId: `group:${groupId}`.slice(0, 180), characterName: name || __rmT("MJNyiT") };
        }
        const chid = ctx.characterId ?? ctx.character_id ?? globalThis.this_chid;
        const character = ctx.character || (characters[chid] && typeof characters[chid] === 'object' ? characters[chid] : null);
        const avatar = firstNonEmpty([character?.avatar]);
        const name = firstNonEmpty([ctx.name2, character?.name, ctx.characterName]).replace(/\s+/g, ' ').slice(0, 80);
        const characterId = firstNonEmpty([avatar, name ? `name:${name}` : '', chid != null && chid !== '' ? `chid:${chid}` : '']).slice(0, 180);
        return {
            characterId,
            characterName: name || (characterId ? __rmT("W7DAA7Hf6YGJfk") : UNCATEGORIZED_CHARACTER_NAME),
        };
    }
    catch {
        return { characterId: '', characterName: UNCATEGORIZED_CHARACTER_NAME };
    }
}
export function groupTheaterFavoritesByCharacter(rows) {
    const groups = new Map();
    for (const row of rows || []) {
        const id = String(row?.characterId || '');
        const name = String(row?.characterName || '').trim() || (id ? __rmT("W7DAA7Hf6YGJfk") : UNCATEGORIZED_CHARACTER_NAME);
        if (!groups.has(id))
            groups.set(id, { characterId: id, characterName: name, items: [] });
        const group = groups.get(id);
        if (name && (group.characterName === UNCATEGORIZED_CHARACTER_NAME || !group.characterName))
            group.characterName = name;
        group.items.push(row);
    }
    return [...groups.values()].sort((a, b) => {
        if (!a.characterId && b.characterId)
            return 1;
        if (a.characterId && !b.characterId)
            return -1;
        return String(a.characterName).localeCompare(String(b.characterName), 'zh');
    });
}
function openDatabase() {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new Error(__rmT("WLzs1OwaR_ONCCO50RVdwKH8o3FtMfADg6WmKYrNnaFuyhma_nGNLa8WQMH.MiMAbxOtfO33Y3Y")));
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
        request.onerror = () => reject(request.error || new Error(__rmT("5la4tgu5ZYc6l5N5_zAnnZ84HBPrrk")));
    });
}
function runStore(mode, work) {
    return openDatabase().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const store = tx.objectStore(STORE);
        let result;
        tx.oncomplete = () => {
            try {
                db.close();
            }
            catch { }
            resolve(result);
        };
        tx.onerror = () => {
            try {
                db.close();
            }
            catch { }
            reject(tx.error || new Error(__rmT("eDH1ecj6sHhEDGrkGqqpUT")));
        };
        tx.onabort = () => {
            try {
                db.close();
            }
            catch { }
            reject(tx.error || new Error(__rmT("9PzfjU06j0M1YQ7vywkya7EI")));
        };
        try {
            result = work(store, value => { result = value; });
        }
        catch (error) {
            try {
                tx.abort();
                db.close();
            }
            catch { }
            reject(error);
        }
    }));
}
function normalizeRecord(value) {
    if (!value || typeof value !== 'object')
        return null;
    const html = String(value.html || '').trim();
    if (!html || byteLength(html) > THEATER_FAVORITE_MAX_HTML_BYTES)
        return null;
    const id = String(value.id || '').trim();
    if (!id)
        return null;
    const characterId = String(value.characterId || '').slice(0, 180);
    const characterName = String(value.characterName || '').replace(/\s+/g, ' ').trim().slice(0, 80)
        || (characterId ? __rmT("W7DAA7Hf6YGJfk") : UNCATEGORIZED_CHARACTER_NAME);
    return {
        id,
        title: String(value.title || __rmT("IFW1zAlNfsbryg9S")).replace(/\s+/g, ' ').trim().slice(0, 120) || __rmT("IFW1zAlNfsbryg9S"),
        mode: value.mode === 'text' ? 'text' : 'html',
        html,
        chatKey: String(value.chatKey || '').slice(0, 180),
        mesid: Number.isInteger(value.mesid) && value.mesid >= 0 ? value.mesid : null,
        swipe: Number.isInteger(value.swipe) && value.swipe >= 0 ? value.swipe : null,
        faceIndex: Number.isInteger(value.faceIndex) && value.faceIndex >= 0 ? value.faceIndex : null,
        sourceHash: String(value.sourceHash || '').slice(0, 80),
        characterId,
        characterName,
        createdAt: Number(value.createdAt) || Date.now(),
        ...(value.contentKey ? { contentKey: String(value.contentKey).slice(0, 80) } : {}),
        ...(value.images && typeof value.images === 'object' && !Array.isArray(value.images) ? { images: value.images } : {}),
    };
}
function noteReadded(ids) {
    void import('./favoriteServerBackup.js?rmv=2.6.0').then(module => module.forgetFavoriteBackupDeletes(ids)).catch(() => { });
}
function noteDeleted(ids) {
    void import('./favoriteServerBackup.js?rmv=2.6.0').then(module => module.noteFavoriteBackupDeletes({ favorites: ids })).catch(() => { });
}
export async function importTheaterFavoriteRecords(values) {
    const records = (Array.isArray(values) ? values : []).map(normalizeRecord).filter(Boolean);
    if (!records.length)
        return 0;
    let written = 0;
    await runStore('readwrite', (store, done) => {
        let pending = records.length;
        for (const record of records) {
            const probe = store.get(record.id);
            probe.onsuccess = () => {
                if (!probe.result) {
                    store.put(record);
                    written += 1;
                }
                pending -= 1;
                if (!pending)
                    done(written);
            };
        }
    });
    if (written)
        notifyChanged();
    return written;
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
    '[data-rabbit-mirror-source-truncation-notice]',
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
    if (!summary)
        return '';
    const clone = typeof summary.cloneNode === 'function' ? summary.cloneNode(true) : null;
    if (clone?.querySelectorAll) {
        restoreRuntimeAnimationClone(summary, clone);
        stripTheaterFavoriteRuntimeUi(clone);
        return sanitizeTheaterFavoriteTitle(clone.textContent);
    }
    return sanitizeTheaterFavoriteTitle(summary.textContent);
}
const displayTitleCache = new WeakMap();
const displayTitleByIdCache = new Map();
function displayTitleStamp(record) {
    const html = String(record?.html || '');
    return `${record?.createdAt || ''}|${record?.updatedAt || ''}|${html.length}|${html.slice(0, 200)}|${record?.title || ''}`;
}
export function theaterFavoriteDisplayTitle(record) {
    if (record && typeof record === 'object') {
        const cached = displayTitleCache.get(record);
        if (cached && cached.html === record.html && cached.title === record.title)
            return cached.value;
        const byId = record.id ? displayTitleByIdCache.get(record.id) : null;
        if (byId && byId.stamp === displayTitleStamp(record)) {
            displayTitleCache.set(record, { html: record.html, title: record.title, value: byId.value });
            return byId.value;
        }
    }
    const html = String(record?.html || '').trim();
    let value = '';
    if (html && typeof document !== 'undefined') {
        const template = document.createElement('template');
        template.innerHTML = html;
        value = theaterFavoriteTitleFromDetails(template.content.querySelector('details') || template.content) || '';
    }
    value = value || sanitizeTheaterFavoriteTitle(record?.title) || __rmT("IFW1zAlNfsbryg9S");
    if (record && typeof record === 'object') {
        displayTitleCache.set(record, { html: record.html, title: record.title, value });
        if (record.id) {
            if (displayTitleByIdCache.size > 3000)
                displayTitleByIdCache.clear();
            displayTitleByIdCache.set(record.id, { stamp: displayTitleStamp(record), value });
        }
    }
    return value;
}
function unwrapTheaterFavoriteTitleChrome(scope) {
    if (!scope?.querySelectorAll)
        return;
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
    scope.querySelectorAll('[data-rabbit-mirror-title-extra]').forEach(node => node.removeAttribute('data-rabbit-mirror-title-extra'));
    scope.querySelectorAll('details[open]').forEach(node => node.removeAttribute('open'));
}
export function stripTheaterFavoriteRuntimeUi(scope) {
    if (!scope?.querySelectorAll)
        return;
    scope.querySelectorAll(FAVORITE_RUNTIME_UI_SELECTOR).forEach(node => node.remove());
    for (const node of [scope, ...scope.querySelectorAll('[data-rm-face-frame], [data-rm-face-frame-body], [data-rm-face-flush], [data-rm-face-flush-checked]')]) {
        if (!node?.removeAttribute)
            continue;
        for (const name of ['data-rm-face-frame', 'data-rm-face-frame-body', 'data-rm-face-flush', 'data-rm-face-flush-checked'])
            node.removeAttribute(name);
        for (const name of ['--rm-face-frame-bg', '--rm-face-frame-bg-image', '--rm-face-frame-border', '--rm-face-frame-radius', '--rm-face-frame-shadow'])
            node.style?.removeProperty?.(name);
    }
    scope.querySelectorAll('[data-rm-ephemeral-failure-hidden]').forEach(node => {
        node.removeAttribute('data-rm-ephemeral-failure-hidden');
        node.hidden = false;
    });
    if (scope.matches?.('details'))
        scope.removeAttribute('data-rm-ephemeral-failure');
    scope.querySelectorAll('details[data-rm-ephemeral-failure]').forEach(node => node.removeAttribute('data-rm-ephemeral-failure'));
    unwrapTheaterFavoriteTitleChrome(scope);
}
async function copyTextToClipboard(text) {
    const value = String(text || '');
    if (!value)
        return false;
    try {
        await navigator.clipboard.writeText(value);
        return true;
    }
    catch {
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
        }
        catch {
            return false;
        }
    }
}
export async function copyTheaterFavoriteHtml(record) {
    const html = scrubTheaterFavoriteHtml(record?.html);
    if (!html)
        throw new Error(__rmT("5zhCxoE2Tca5ijwAXKwvrJr58R8n.DZ1P2eF.4nbgG8"));
    const copied = await copyTextToClipboard(html);
    if (!copied)
        throw new Error(__rmT("pwPp12HIHvrKa_cPS0r3LOIPoL3P_uMK2T9spf"));
    return html;
}
export function scrubTheaterFavoriteHtml(html) {
    const source = String(html || '').trim();
    if (!source || typeof document === 'undefined')
        return source;
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
const FAVORITE_CONTENT_NOISE_SELECTOR = [
    '[data-rm-mobile-controls]',
    __rmT("kUS3Jjz5puOvwWN3u9ltGDThpxbEdw2_6KamwHiO0SaCEoMvbU6FunUBiDUOg96svV1rV0qSfzhn4c9.ald8gFb7Vyb3Gyei0HA"),
    __rmT("kUS3Jjz5puOvwWN3u9ltGDThpxbEdw2_6KamwHiO0SaCEoMvbU6FunUBiDUOg96svV1rV0qSfzhn4c9.alUy8h1HLkNj9Xei0HA"),
    __rmT("kUS3Jjz5puOvwWN3u9ltGDThpxbEdw2_6KamwHiO0SaCEoMvbU6FunUBiDUOg96svV1rV0qSfzhn4c9.alC75mwuahs42oei0HA"),
    'style', 'script', 'template', 'noscript',
    '[data-rm-draw-status]', '[data-rm-draw-prompt]', '[data-rm-draw-tags]', '[data-rm-draw-char]', '[data-rm-draw-char-tags]', '[data-rm-draw-notes]',
].join(', ');
const CONTENT_KEY_VERSION = 'k2';
const contentKeyMemo = new Map();
export function theaterFavoriteContentKey(html) {
    const source = String(html || '').trim();
    if (!source || typeof document === 'undefined')
        return '';
    const memo = contentKeyMemo.get(source);
    if (memo)
        return memo;
    const template = document.createElement('template');
    template.innerHTML = source;
    stripTheaterFavoriteRuntimeUi(template.content);
    template.content.querySelectorAll(FAVORITE_CONTENT_NOISE_SELECTOR).forEach(node => node.remove());
    const text = String(template.content.textContent || '').replace(/\s+/g, '');
    let key = `${CONTENT_KEY_VERSION}_${hashFavoriteHtml(text)}_${text.length}`;
    if (text.length < 40) {
        const shape = [...template.content.querySelectorAll('*')].map(node => {
            const src = node.getAttribute?.('src') || node.getAttribute?.('href') || '';
            return `${node.tagName}${src ? `=${src.length}:${hashFavoriteHtml(src)}` : ''}`;
        }).join(',');
        key += `_${hashFavoriteHtml(shape)}`;
    }
    contentKeyMemo.set(source, key);
    if (contentKeyMemo.size > 64)
        contentKeyMemo.delete(contentKeyMemo.keys().next().value);
    return key;
}
function recordContentKey(row) {
    if (!row?.html)
        return '';
    const stored = String(row.contentKey || '');
    return stored.startsWith(`${CONTENT_KEY_VERSION}_`) ? stored : theaterFavoriteContentKey(row.html);
}
function favoriteComparableText(html) {
    if (typeof document === 'undefined')
        return '';
    const template = document.createElement('template');
    template.innerHTML = String(html || '');
    stripTheaterFavoriteRuntimeUi(template.content);
    template.content.querySelectorAll(FAVORITE_CONTENT_NOISE_SELECTOR).forEach(node => node.remove());
    return String(template.content.textContent || '').replace(/\s+/g, '');
}
function textSimilarity(a, b) {
    if (!a || !b)
        return 0;
    if (a === b)
        return 1;
    const grams = text => { const map = new Map(); for (let i = 0; i < text.length - 1; i += 1) {
        const g = text.slice(i, i + 2);
        map.set(g, (map.get(g) || 0) + 1);
    } return map; };
    const left = grams(a), right = grams(b);
    let shared = 0;
    for (const [gram, count] of left)
        shared += Math.min(count, right.get(gram) || 0);
    const total = Math.max(1, a.length - 1 + b.length - 1);
    return (2 * shared) / total;
}
let contentIndexPromise = null;
function favoriteContentIndex() {
    if (!contentIndexPromise) {
        contentIndexPromise = listTheaterFavorites().then(rows => {
            const index = new Map();
            for (const row of rows) {
                const key = recordContentKey(row);
                if (!key)
                    continue;
                if (!index.has(key))
                    index.set(key, []);
                index.get(key).push(row.id);
            }
            return index;
        }).catch(error => { contentIndexPromise = null; throw error; });
    }
    return contentIndexPromise;
}
export async function saveTheaterFavorite(input) {
    const html = scrubTheaterFavoriteHtml(input?.html);
    if (!html)
        throw new Error(__rmT("JdCzHGxNdF4kQLnOSjgdNaWKkYes5xs2"));
    if (byteLength(html) > THEATER_FAVORITE_MAX_HTML_BYTES) {
        throw new Error(__rmT("0uM93oWrkRoIceMFA7C.y8lEmxHdi04RO2TbbT6dMnRecogt7vcGHj5X"));
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
        faceIndex: input?.faceIndex,
        sourceHash: input?.sourceHash,
        characterId: input?.characterId || character.characterId,
        characterName: input?.characterName || character.characterName,
        createdAt: Date.now(),
    });
    if (!record)
        throw new Error(__rmT("9Pzfjin52zwru6R4vwpAM7EI"));
    try {
        await runStore('readwrite', store => store.put(record));
        noteReadded([record.id]);
    }
    catch (error) {
        if (error?.name === 'QuotaExceededError')
            throw new Error(__rmT("W1o_pqCPzjleZiKwFVr2VFvqvAHfNrGLUAs4BRxMrO4AsPSCVJzu.XqQNNdYSqPefJpKzKOIj5W.I5.EHI3sKDi9KfITeugUeLtOUZR0.Aua4nYNU8BE1BOxZtGEZf"));
        throw error;
    }
    notifyChanged();
    return record;
}
export async function deleteTheaterFavorite(id) {
    const key = String(id || '');
    if (!key)
        return false;
    await runStore('readwrite', store => store.delete(key));
    noteDeleted([key]);
    notifyChanged();
    return true;
}
async function favoriteImagesFor(captured) {
    if (!Number.isInteger(captured?.mesid) || !Number.isInteger(captured?.swipe))
        return null;
    try {
        return (await import('./imageStore.js?rmv=2.6.0')).mirrorImagesForSlot(captured.mesid, captured.swipe, captured.chatKey || '');
    }
    catch {
        return null;
    }
}
export async function toggleTheaterFavorite(input, intent = 'auto') {
    const captured = input && typeof input === 'object' ? input : null;
    const html = scrubTheaterFavoriteHtml(captured?.html);
    if (!html)
        throw new Error(__rmT("aVHrCsQUHQghsK2vp9Bv7dpFcpXuk7s2"));
    const id = `toggle_${hashFavoriteHtml(html)}`.slice(0, 80);
    if (byteLength(html) > THEATER_FAVORITE_MAX_HTML_BYTES)
        throw new Error(__rmT("0uM93oWrkRoIceMFA7C.y8lEmxHdi04RO2TbbT6dMnRecogt7vcGHj5X"));
    const contentKey = theaterFavoriteContentKey(html);
    const character = currentTheaterFavoriteCharacter();
    const record = normalizeRecord({
        id, title: captured?.title, mode: captured?.mode, html, chatKey: captured?.chatKey,
        mesid: captured?.mesid, swipe: captured?.swipe, faceIndex: captured?.faceIndex, sourceHash: captured?.sourceHash,
        characterId: captured?.characterId || character.characterId,
        characterName: captured?.characterName || character.characterName,
        createdAt: Date.now(), contentKey,
        images: await favoriteImagesFor(captured),
    });
    if (!record)
        throw new Error(__rmT("9Pzfjin52zwru6R4vwpAM7EI"));
    let knownIds = [];
    try {
        knownIds = (await favoriteContentIndex()).get(contentKey) || [];
    }
    catch {
        knownIds = [];
    }
    let favorited = false;
    let removedIds = [];
    let alreadyIds = [];
    try {
        await runStore('readwrite', (store, done) => {
            const candidates = [...new Set([id, ...knownIds])];
            const found = [];
            let pending = candidates.length;
            const finish = () => {
                if (found.length && intent === 'add') {
                    favorited = true;
                    alreadyIds = found;
                }
                else if (found.length) {
                    for (const key of found)
                        store.delete(key);
                    favorited = false;
                    removedIds = found;
                }
                else if (intent === 'remove')
                    favorited = false;
                else {
                    store.put(record);
                    favorited = true;
                }
                done(favorited);
            };
            for (const key of candidates) {
                const probe = store.get(key);
                probe.onsuccess = () => {
                    const row = probe.result;
                    if (row && (key === id || recordContentKey(row) === contentKey))
                        found.push(key);
                    pending -= 1;
                    if (!pending)
                        finish();
                };
            }
        });
    }
    catch (error) {
        if (error?.name === 'QuotaExceededError')
            throw new Error(__rmT("W1o_pqCPzjleZiKwFVr2VFvqvAHfNrGLUAs4BRxMrO4AsPSCVJzu.XqQNNdYSqPefJpKzKOIj5W.I5.EHI3sKDi9KfITeugUeLtOUZR0.Aua4nYNU8BE1BOxZtGEZf"));
        throw error;
    }
    if (removedIds.length)
        noteDeleted(removedIds);
    else if (favorited && !alreadyIds.length)
        noteReadded([id]);
    if (removedIds.length || (favorited && !alreadyIds.length))
        notifyChanged();
    return { favorited, id: alreadyIds[0] || (favorited ? id : (removedIds[0] || id)), removed: removedIds.length, already: alreadyIds.length > 0 };
}
export async function isTheaterFavoriteHtml(html) {
    const scrubbed = scrubTheaterFavoriteHtml(html);
    if (!scrubbed)
        return false;
    try {
        const index = await favoriteContentIndex();
        if (index.has(theaterFavoriteContentKey(scrubbed)))
            return true;
    }
    catch { }
    return !!(await getTheaterFavorite(`toggle_${hashFavoriteHtml(scrubbed)}`.slice(0, 80)));
}
export async function findDuplicateTheaterFavorites(rows) {
    const list = Array.isArray(rows) ? rows : await listTheaterFavorites();
    const groups = new Map();
    for (const row of list) {
        const key = recordContentKey(row);
        if (!key)
            continue;
        if (!groups.has(key))
            groups.set(key, []);
        groups.get(key).push(row);
    }
    const remap = new Map();
    for (const group of groups.values()) {
        if (group.length < 2)
            continue;
        group.sort((a, b) => Number(a.createdAt) - Number(b.createdAt));
        for (const extra of group.slice(1))
            remap.set(extra.id, group[0].id);
    }
    const byTitle = new Map();
    for (const row of list) {
        if (remap.has(row.id) || !row?.html)
            continue;
        const key = `${row.characterId || row.characterName}\u0000${row.title}`;
        if (!byTitle.has(key))
            byTitle.set(key, []);
        byTitle.get(key).push(row);
    }
    for (const group of byTitle.values()) {
        if (group.length < 2)
            continue;
        group.sort((a, b) => Number(a.createdAt) - Number(b.createdAt));
        const texts = new Map(group.map(row => [row.id, favoriteComparableText(row.html)]));
        const kept = [];
        for (const row of group) {
            const text = texts.get(row.id);
            const same = text.length >= 20 && kept.find(other => textSimilarity(texts.get(other.id), text) >= 0.95);
            if (same)
                remap.set(row.id, remap.get(same.id) || same.id);
            else
                kept.push(row);
        }
    }
    return remap;
}
export async function removeDuplicateTheaterFavorites() {
    const remap = await findDuplicateTheaterFavorites();
    if (!remap.size)
        return 0;
    const atlases = await import('./favoriteAtlases.js?rmv=2.6.0');
    for (const atlas of await atlases.listFavoriteAtlases()) {
        let changed = false;
        const selections = {};
        for (const [slotId, ids] of Object.entries(atlas.selections || {})) {
            const next = [...new Set((ids || []).map(id => remap.get(id) || id))];
            if (next.length !== (ids || []).length || next.some((id, i) => id !== ids[i]))
                changed = true;
            selections[slotId] = next;
        }
        if (changed)
            await atlases.saveFavoriteAtlas({ ...atlas, selections, updatedAt: Date.now() });
    }
    await runStore('readwrite', store => { for (const id of remap.keys())
        store.delete(id); });
    noteDeleted([...remap.keys()]);
    notifyChanged();
    return remap.size;
}
function isTheaterFavoritePlaceholder(details) {
    return !!details?.classList?.contains('rabbit-mirror-external-placeholder')
        || !!details?.hasAttribute?.('data-rabbit-mirror-placeholder');
}
function firstCapturableFavoriteDetails(nodes) {
    for (const node of nodes || []) {
        if (node?.matches?.('details') && !isTheaterFavoritePlaceholder(node))
            return node;
    }
    return null;
}
export function resolveTheaterFavoriteCaptureRoot(root) {
    const direct = root?.matches?.('details') ? root
        : (root?.closest?.('details') || root?.querySelector?.('details') || null);
    if (direct && !isTheaterFavoritePlaceholder(direct))
        return direct;
    const host = root?.closest?.('[data-rabbit-mirror-external-source="true"], .rabbit-mirror-external-host')
        || direct?.closest?.('[data-rabbit-mirror-external-source="true"], .rabbit-mirror-external-host');
    const fromHost = firstCapturableFavoriteDetails(host?.children);
    if (fromHost)
        return fromHost;
    const message = root?.closest?.('.mes, [mesid]') || host?.closest?.('.mes, [mesid]') || direct?.closest?.('.mes, [mesid]');
    for (const shell of message?.querySelectorAll?.('[data-rabbit-mirror-external-source="true"], .rabbit-mirror-external-host') || []) {
        const found = firstCapturableFavoriteDetails(shell.children);
        if (found)
            return found;
    }
    return null;
}
export function captureTheaterFavoriteFromRoot(root, owner = {}) {
    const details = resolveTheaterFavoriteCaptureRoot(root);
    if (!details)
        return null;
    const html = scrubTheaterFavoriteHtml(restoreRuntimeAnimationClone(details, details.cloneNode(true)).outerHTML);
    if (!html)
        return null;
    const title = theaterFavoriteTitleFromDetails(details) || String(details.querySelector?.(':scope > summary')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    const character = currentTheaterFavoriteCharacter();
    const faceNumber = value => value !== undefined && value !== null && String(value).trim() !== ''
        && Number.isInteger(Number(value)) && Number(value) >= 0 ? Number(value) : null;
    let faceIndex = faceNumber(owner.faceIndex) ?? faceNumber(details.dataset?.rmImageOwnerFace)
        ?? faceNumber(details.dataset?.rabbitMirrorFaceIndex);
    if (faceIndex === null) {
        const ordinal = faceNumber(details.closest?.('toto[data-rm-face]')?.getAttribute?.('data-rm-face'));
        if (ordinal !== null && ordinal > 0)
            faceIndex = ordinal - 1;
    }
    if (faceIndex === null) {
        const scope = details.closest?.('[data-rabbit-mirror-external-source="true"]') || details.closest?.('.mes');
        const faces = [...(scope?.querySelectorAll?.('details') || [])]
            .filter(face => !face.parentElement?.closest?.('details') && !isTheaterFavoritePlaceholder(face));
        const at = faces.indexOf(details);
        if (at >= 0)
            faceIndex = at;
    }
    return {
        id: theaterFavoriteToggleId(html),
        title: title || __rmT("IFW1zAlNfsbryg9S"),
        mode: String(details.getAttribute?.('data-rm-presentation-mode') || owner.mode || '') === 'text' ? 'text' : 'html',
        html,
        chatKey: String(owner.chatKey || details.dataset?.rabbitMirrorOwnerChat || ''),
        mesid: Number.isInteger(owner.mesid) ? owner.mesid : Number(details.dataset?.rabbitMirrorOwnerMesid),
        swipe: Number.isInteger(owner.swipe) ? owner.swipe : Number(details.dataset?.rabbitMirrorOwnerSwipe),
        faceIndex,
        sourceHash: String(owner.sourceHash || details.dataset?.rabbitMirrorOwnerSourceHash || ''),
        characterId: String(owner.characterId || character.characterId || ''),
        characterName: String(owner.characterName || character.characterName || UNCATEGORIZED_CHARACTER_NAME),
    };
}
let viewer = null;
let lastHydrate = null;
let library = null;
function overlayParent() {
    const settings = document.getElementById('rabbit_mirror_theater_settings');
    if (settings?.tagName === 'DIALOG' && (settings.open || settings.hasAttribute('open')))
        return settings;
    return document.body;
}
function dismissOverlay(overlay) {
    try {
        if (overlay?.open && typeof overlay.close === 'function')
            overlay.close();
    }
    catch { }
    overlay?.remove?.();
}
export function closeTheaterFavoriteViewer() {
    if (!viewer)
        return;
    const { overlay, keydown } = viewer;
    document.removeEventListener('keydown', keydown, true);
    dismissOverlay(overlay);
    viewer = null;
}
export function closeTheaterFavoriteLibrary() {
    if (!library)
        return;
    const { overlay, keydown, onFavoritesChanged, onBackupSaved } = library;
    if (onBackupSaved)
        globalThis.removeEventListener?.('rabbitmirror:favorite-backup', onBackupSaved);
    document.removeEventListener('keydown', keydown, true);
    document.removeEventListener(THEATER_FAVORITES_CHANGED_EVENT, onFavoritesChanged);
    thumbObserver?.disconnect?.();
    thumbObserver = null;
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
        if (typeof overlay.showModal === 'function')
            overlay.showModal();
        else
            overlay.setAttribute('open', '');
    }
    catch {
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
        if (event.target !== overlay)
            return;
        event.preventDefault();
        close();
    });
}
export async function openTheaterFavoriteViewer(id, hydrate) {
    const record = await getTheaterFavorite(id);
    if (!record)
        throw new Error(__rmT("t2ULwImkFZgm0f3DD3i0RxEI"));
    closeTheaterFavoriteViewer();
    const { overlay, card } = overlayCard(__rmT("8vfuqCi7zNNq7T"));
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
    copy.textContent = __rmT("N07CniteidUk0Sl6fPD");
    copy.addEventListener('click', () => {
        void copyTheaterFavoriteHtml(record).then(() => {
            globalThis.toastr?.success?.(__rmT("6b6mVPcJLvtnENO7zyBwZbmiCkEaViPBXcdspf"));
        }).catch(error => {
            globalThis.toastr?.warning?.(String(error?.message || __rmT("iSxmcvu3rCFMsh")));
        });
    });
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'menu_button';
    close.textContent = __rmT("t8hHPh");
    close.addEventListener('click', () => closeTheaterFavoriteViewer());
    actions.append(copy, close);
    header.append(title, actions);
    const note = document.createElement('p');
    note.style.cssText = 'margin:0 0 10px;opacity:.7;font-size:11px;line-height:1.45;';
    note.textContent = record.characterName ? `${__rmT("dAJEk0bJWZY")}${record.characterName}` : '';
    if (!note.textContent)
        note.hidden = true;
    const stage = document.createElement('div');
    stage.setAttribute('data-rm-theater-favorite-stage', 'true');
    card.append(header, note, stage);
    stage.style.cssText = 'position:relative;max-width:100%;overflow:auto;isolation:isolate;';
    stage.addEventListener('submit', event => { event.preventDefault(); event.stopPropagation(); });
    bindOverlayDismiss(overlay, closeTheaterFavoriteViewer);
    const keydown = event => {
        if (event.key !== 'Escape')
            return;
        event.preventDefault();
        event.stopImmediatePropagation();
        closeTheaterFavoriteViewer();
    };
    document.addEventListener('keydown', keydown, true);
    presentOverlay(overlay);
    viewer = { overlay, keydown };
    if (typeof hydrate !== 'function') {
        closeTheaterFavoriteViewer();
        throw new Error(__rmT("9t3HjtuIL2oVczh4U3GfwdtkbNs"));
    }
    try {
        await hydrate(stage, record);
        stripTheaterFavoriteRuntimeUi(stage);
    }
    catch (error) {
        closeTheaterFavoriteViewer();
        throw error;
    }
    return record;
}
export const SOLAR_TERMS = Object.freeze([__rmT("OMtOjf"), __rmT("HpmTeT"), __rmT("OPCAwf"), __rmT("N2mzNf"), __rmT("Z2bJjf"), __rmT("ocYEPf"), __rmT("OMtgBh"), __rmT("f8YUef"), __rmT("qUEQfh"), __rmT("f8kqih"), __rmT("f8eejf"), __rmT("N8Iejf"), __rmT("OMltfh"), __rmT("ZDIejf"), __rmT("lNmaPk"), __rmT("OM4zNf"), __rmT("WGgaPk"), __rmT("YpMQPf"), __rmT("OMRGNh"), __rmT("f8YiPf"), __rmT("N8kiPf"), __rmT("8Dhqih"), __rmT("f8YLBk"), __rmT("N8kLBk")]);
const SOLAR_TERM_PATTERN = new RegExp(SOLAR_TERMS.join('|'), 'u');
const ORDINARY_SOLAR_WORDS = new Set([__rmT("HpmTeT"), __rmT("Z2bJjf"), __rmT("lNmaPk"), __rmT("WGgaPk"), __rmT("f8YiPf"), __rmT("N8kiPf"), __rmT("f8YUef")]);
const SOLAR_TRADITIONAL_CHARS = { [__rmT("IDG")]: __rmT("U1k"), [__rmT("dH_")]: __rmT("PHB"), [__rmT("1dG")]: __rmT("NuT"), [__rmT("Gj8")]: __rmT("wq8"), [__rmT("_rG")]: __rmT("CaC"), [__rmT("zFB")]: __rmT("LCC"), [__rmT("WdE")]: __rmT("qQD"), [__rmT("bjT")]: __rmT("ZWT"), [__rmT("g1E")]: __rmT("qAT"), [__rmT("11B")]: __rmT("91Y") };
function normalizeSolarText(value = '') {
    return String(value).replace(/&#(x[\da-f]+|\d+);?/gi, (entity, code) => {
        const number = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
        return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : ' ';
    }).replace(/&(?:nbsp|ensp|emsp|thinsp|ZeroWidthSpace);/gi, ' ')
        .replace(/&[a-z][a-z\d]+;/gi, ' ')
        .replace(__rmR("Ake7LMoy6BmT5E6.SJeaZxBpKWX1sCkP", "gu"), char => SOLAR_TRADITIONAL_CHARS[char])
        .replace(/[\s\u200b-\u200d\ufeff]+/gu, '');
}
function firstSolarTerm(value) {
    return normalizeSolarText(value).match(SOLAR_TERM_PATTERN)?.[0] || '';
}
function favoritePlainText(html = '') {
    return String(html).replace(/<(?:[^>"']|"[^"]*"|'[^']*')*>/g, tag => /^<\/?(?:div|p|section|article|header|footer|h[1-6]|summary|li|dt|dd|td|th|tr|figcaption|caption|legend)\b/i.test(tag) ? '\n' : '');
}
export function solarTermOfFavorite(record) {
    const inTitle = firstSolarTerm(record?.title || '');
    if (inTitle)
        return inTitle;
    const html = String(record?.html || '')
        .replace(/<!--[\s\S]*?(?:-->|$)/g, '')
        .replace(/<(style|script|template)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, '');
    for (const heading of html.matchAll(/<(h[1-6]|summary|header|figcaption|caption|legend|dt)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)) {
        const term = firstSolarTerm(favoritePlainText(heading[2]));
        if (term)
            return term;
    }
    const text = favoritePlainText(html);
    for (const line of text.split('\n')) {
        const label = normalizeSolarText(line).replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, '');
        if (SOLAR_TERMS.includes(label))
            return label;
    }
    const normalized = normalizeSolarText(text);
    if (__rmR("cqwy2eaS7LIxM6kYMmrn9azoHP8yoUpQaC4usAoYPqZa1h", "").test(normalized))
        return firstSolarTerm(normalized);
    for (const match of normalized.matchAll(new RegExp(SOLAR_TERM_PATTERN.source, 'gu'))) {
        if (!ORDINARY_SOLAR_WORDS.has(match[0]))
            return match[0];
    }
    return '';
}
export function solarTermProgress(rows) {
    const collected = new Map();
    for (const row of Array.isArray(rows) ? rows : []) {
        const term = solarTermOfFavorite(row);
        if (term && !collected.has(term))
            collected.set(term, row);
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
    summary.textContent = `${__rmT("691Qh2bAXcZu1DNsfr2dHT")}${progress.count}/${progress.total}`;
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
            cell.title = `${__rmT("Po1v0qVg")}${theaterFavoriteDisplayTitle(row)}${__rmT("Yvk")}`;
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => {
                void openTheaterFavoriteViewer(row.id, hydrate).catch(error => {
                    globalThis.toastr?.warning?.(String(error?.message || __rmT("OTS1_Qzqs0BSMMrX4DD")));
                });
            });
        }
        grid.append(cell);
    }
    const hint = document.createElement('p');
    hint.style.cssText = 'margin:8px 0 0;opacity:.62;font-size:11px;line-height:1.45;';
    hint.textContent = __rmT("dWk3urQCdumFGd4h.KC.AHMZOV4sJiHMCEqUqU4lab2.0LeTx4b4uD.ITbjNLkYGeli6q7JYAM4G5G4cicVZAaIl012gTlCwaxELRf");
    box.append(summary, bar, grid, hint);
    return box;
}
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
    if (!match)
        return '';
    let hex = match[1].toLowerCase();
    if (hex.length === 4)
        hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    return hex;
}
const THUMB_WIDTH = 420;
function favoriteThumbDocument(html) {
    let body = expandHtmlDocumentCodeBlocks(String(html || ''));
    try {
        const template = document.createElement('template');
        template.innerHTML = body;
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
let thumbObserver = null;
function loadFavoriteThumb(frame) {
    if (!frame || frame.dataset.loaded === 'true')
        return;
    frame.dataset.loaded = 'true';
    frame.srcdoc = favoriteThumbDocument(frame.__rmFavoriteHtml);
    frame.__rmFavoriteHtml = null;
}
function observeFavoriteThumb(frame, scrollRoot) {
    if (typeof IntersectionObserver !== 'function') {
        loadFavoriteThumb(frame);
        return;
    }
    if (!thumbObserver || thumbObserver.__root !== scrollRoot) {
        thumbObserver?.disconnect?.();
        thumbObserver = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting)
                    continue;
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
    if (width > 0)
        grid.style.setProperty('--thumb-scale', String(width / THUMB_WIDTH));
}
function favoriteDateText(ts) {
    const date = new Date(Number(ts) || Date.now());
    return `${date.getMonth() + 1}${__rmT("eW_")}${date.getDate()}${__rmT("iqY")}`;
}
export async function openTheaterFavoriteLibrary(hydrate) {
    if (typeof hydrate === 'function')
        lastHydrate = hydrate;
    else
        hydrate = lastHydrate;
    let rows = await listTheaterFavorites();
    closeTheaterFavoriteLibrary();
    const { overlay, card } = overlayCard(__rmT("oNm9IIg2DbRuF.Ki"));
    overlay.setAttribute('data-rm-theater-favorite-library', 'true');
    const narrow = (globalThis.innerWidth || 1024) < 640;
    overlay.style.alignItems = narrow ? 'stretch' : 'center';
    if (narrow)
        overlay.style.padding = 'max(10px,env(safe-area-inset-top)) 0 0 0';
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
    title.textContent = __rmT("vyBKeYfS");
    const count = document.createElement('span');
    count.className = 'rm-fav-count';
    count.textContent = rows.length ? `${rows.length}${__rmT("2RddPk")}` : '';
    title.append(count);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'rm-fav-close';
    close.textContent = '×';
    close.setAttribute('aria-label', __rmT("xzZCpzVOspuIdT"));
    close.addEventListener('click', () => closeTheaterFavoriteLibrary());
    head.append(title, close);
    shelf.append(head);
    const grid = document.createElement('div');
    grid.className = 'rm-fav-grid';
    const dedupeBar = document.createElement('div');
    dedupeBar.className = 'rm-fav-row';
    dedupeBar.hidden = true;
    dedupeBar.style.cssText = 'align-items:center;gap:8px;font-size:12px;opacity:.9;margin:2px 0 8px;';
    const dedupeText = document.createElement('span');
    dedupeText.style.cssText = 'flex:1;min-width:0;';
    const dedupeButton = document.createElement('button');
    dedupeButton.type = 'button';
    dedupeButton.className = 'rm-fav-chip';
    dedupeBar.append(dedupeText, dedupeButton);
    let dedupeArmed = false;
    const refreshDedupe = () => {
        void findDuplicateTheaterFavorites(rows).then(remap => {
            if (library?.overlay && library.overlay !== overlay)
                return;
            dedupeArmed = false;
            dedupeBar.hidden = !remap.size;
            dedupeText.textContent = remap.size ? `${__rmT("726CyT")}${remap.size}${__rmT("v3De4sdBASUbF__yceGlstLvfcN8Q67VWZgouAyJLS1xYzQX")}` : '';
            dedupeButton.textContent = __rmT("sHOj8FEDSGl");
        }).catch(() => { dedupeBar.hidden = true; });
    };
    dedupeButton.addEventListener('click', () => {
        if (!dedupeArmed) {
            dedupeArmed = true;
            dedupeButton.textContent = __rmT("NRH81KZpTK47gFvtsV7JkNDQvJPhvSyStVBxTwZ8");
            return;
        }
        dedupeButton.disabled = true;
        dedupeArmed = false;
        dedupeButton.textContent = __rmT("sHOj8FEDSGl");
        void removeDuplicateTheaterFavorites().then(removed => {
            globalThis.toastr?.success?.(removed ? `${__rmT("iFuUAKmMHKG")}${removed}${__rmT("7aawYhFpm5kSMMrX4DD")}` : __rmT("T8yI.Np53DsQIGNsZjjpUT"));
        }).catch(error => globalThis.toastr?.warning?.(String(error?.message || __rmT("lV2rYVQfS1h4jK2vp9Bjj4Ttwjp3xxs2"))))
            .finally(() => { dedupeButton.disabled = false; });
    });
    if (rows.length > 1)
        refreshDedupe();
    const backupBar = document.createElement('div');
    backupBar.className = 'rm-fav-row';
    backupBar.style.cssText = 'align-items:center;gap:8px;font-size:12px;opacity:.85;margin:2px 0 8px;flex-wrap:wrap;';
    const backupText = document.createElement('span');
    backupText.style.cssText = 'flex:1;min-width:0;';
    const restoreButton = document.createElement('button');
    restoreButton.type = 'button';
    restoreButton.className = 'rm-fav-chip';
    restoreButton.hidden = true;
    backupBar.append(backupText, restoreButton);
    let backupRefresh = 0;
    const refreshBackup = () => {
        const ticket = ++backupRefresh;
        void import('./favoriteServerBackup.js?rmv=2.6.0').then(async (module) => {
            const status = module.getFavoriteServerBackupStatus();
            const when = Number(status?.savedAt) ? new Date(Number(status.savedAt)).toLocaleString('zh-CN', { hour12: false }) : '';
            backupText.textContent = status?.ok ? `${__rmT("Font1II3TGcStf")}${status.count}${__rmT("qGltWWrp")}${when}${__rmT("N_iraKgwOoG")}` : status?.message ? `${__rmT("l18yZaw6OQhE1ySz0g6_Lk")}${status.message}` : __rmT("suodofgD_Q_vomk8yjeAJLMNRqoliwlcILTS3PVqKymUqyUB2HCWB.LfOU6QuvkC");
            const missing = await module.countMissingFavoritesInServerBackup({ rows });
            if (ticket !== backupRefresh || (library?.overlay && library.overlay !== overlay))
                return;
            restoreButton.hidden = !missing;
            restoreButton.textContent = `${__rmT("PJ1NfXG6bGKTt.e7LJ2dHT")}${missing}${__rmT("2RCF3f")}`;
        }).catch(() => { restoreButton.hidden = true; });
    };
    restoreButton.addEventListener('click', () => {
        restoreButton.disabled = true;
        void import('./favoriteServerBackup.js?rmv=2.6.0').then(module => module.restoreFavoritesFromServerBackup()).then(result => {
            globalThis.toastr?.success?.(result.empty ? __rmT("nnQAcGxIbXQK.5KB5h7p2gHdIUqdBQrKoRvspf") : `${__rmT("iFN6zD0tHKG")}${result.restored}${__rmT("N_E05d4sZVs")}${result.atlases ? `${__rmT("jvk")}${result.atlases}${__rmT("N_wvFM0tsAh")}` : ''}${result.failed ? `${__rmT("7os")}${result.failed}${__rmT("wHQ2U5Zn2GuiaYs1FJHzZIExX3p")}` : ''}${__rmT("jzk")}`);
        }).catch(error => globalThis.toastr?.warning?.(`${__rmT("VOUk8WJl8ueStf")}${String(error?.message || error || __rmT("cHhXcUwjS2T"))}${__rmT("gHOMRKKa5LfuIMU.03fEnK00RD1rrk")}`))
            .finally(() => { restoreButton.disabled = false; refreshBackup(); });
    });
    refreshBackup();
    let query = '';
    let character = '';
    let view = 'grid';
    try {
        view = globalThis.localStorage?.getItem(FAVORITE_VIEW_KEY) === 'list' ? 'list' : 'grid';
    }
    catch {
        view = 'grid';
    }
    if (!rows.length) {
        const empty = document.createElement('div');
        empty.className = 'rm-fav-empty';
        empty.innerHTML = __rmT("nALKl5kOivVRGREOrJpzbnwnathP4JBnbWbKZuMTHn5r5VHi57nRxYnev.BFzafQirvehww.Tt12Q3l1QBZHSMqkHXrplpg7qKMqJg_bWNe5gpJfPq74zDUt");
        shelf.append(backupBar, empty);
    }
    else {
        const tools = document.createElement('div');
        tools.className = 'rm-fav-tools';
        const search = document.createElement('input');
        search.type = 'search';
        search.className = 'rm-fav-search';
        search.placeholder = __rmT("QQaKRK2LNbZLgBZh");
        search.setAttribute('aria-label', __rmT("2hFe3V.R6hAascOoTn_"));
        let searchTimer = 0;
        search.addEventListener('input', () => {
            query = search.value.trim().toLowerCase();
            clearTimeout(searchTimer);
            searchTimer = setTimeout(paint, 160);
        });
        const viewSwitch = document.createElement('div');
        viewSwitch.className = 'rm-fav-view';
        viewSwitch.setAttribute('role', 'group');
        viewSwitch.setAttribute('aria-label', __rmT("aM0QAimsSDY"));
        for (const [key, label] of [['grid', __rmT("cmvjHBl.")], ['list', __rmT("L8iEET")]]) {
            const option = document.createElement('button');
            option.type = 'button';
            option.textContent = label;
            option.setAttribute('aria-pressed', String(view === key));
            option.addEventListener('click', () => {
                view = key;
                try {
                    globalThis.localStorage?.setItem(FAVORITE_VIEW_KEY, key);
                }
                catch { }
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
            chips.setAttribute('aria-label', __rmT("wON24rLrugOxYh"));
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
            chips.append(chip(`${__rmT("U.DNfVc6")}${rows.length}`, ''));
            for (const group of groups)
                chips.append(chip(`${group.characterName} ${group.items.length}`, group.characterName));
            tools.append(chips);
        }
        shelf.append(tools, backupBar, dedupeBar, grid);
    }
    const plateFor = item => {
        const wrap = document.createElement('div');
        wrap.className = 'rm-fav-item';
        const plate = document.createElement('button');
        plate.type = 'button';
        plate.className = 'rm-fav-plate';
        plate.style.setProperty('--plate', favoritePlateColor(item.html) || 'var(--rh-primary,#ce729c)');
        plate.setAttribute('aria-label', `${__rmT("Po1v0qVg")}${theaterFavoriteDisplayTitle(item)}${__rmT("Yvk")}`);
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
            void openTheaterFavoriteViewer(item.id, hydrate).catch(error => globalThis.toastr?.warning?.(String(error?.message || __rmT("OTS1_Qzqs0BSMMrX4DD"))));
        });
        const name = document.createElement('p');
        name.className = 'rm-fav-name';
        name.textContent = theaterFavoriteDisplayTitle(item);
        const meta = document.createElement('div');
        meta.className = 'rm-fav-meta';
        const who = document.createElement('span');
        who.textContent = item.characterName || __rmT("cynAhhB1");
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'rm-fav-more';
        more.textContent = '⋯';
        more.setAttribute('aria-label', __rmT("wNqpauwKaFY"));
        more.addEventListener('click', () => {
            meta.replaceChildren();
            const confirm = document.createElement('div');
            confirm.className = 'rm-fav-confirm';
            confirm.style.flex = '1';
            const keep = document.createElement('button');
            keep.type = 'button';
            keep.textContent = __rmT("CuN3nh");
            keep.addEventListener('click', () => { meta.replaceChildren(who, more); });
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'rm-fav-danger';
            remove.textContent = __rmT("Uv_.psMgt8ANef");
            remove.addEventListener('click', () => {
                void deleteTheaterFavorite(item.id).then(() => openTheaterFavoriteLibrary(hydrate))
                    .catch(error => globalThis.toastr?.warning?.(String(error?.message || __rmT("Uv_.pvu3rCFMsh"))));
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
        open.setAttribute('aria-label', `${__rmT("Po1v0qVg")}${theaterFavoriteDisplayTitle(item)}${__rmT("Yvk")}`);
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
        meta.textContent = `${favoriteDateText(item.createdAt)}${__rmT("jSk")}${item.characterName || __rmT("cynAhhB1")}`;
        text.append(name, meta);
        open.append(swatch, text);
        open.addEventListener('click', () => {
            void openTheaterFavoriteViewer(item.id, hydrate).catch(error => globalThis.toastr?.warning?.(String(error?.message || __rmT("OTS1_Qzqs0BSMMrX4DD"))));
        });
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'rm-fav-more';
        more.textContent = '⋯';
        more.setAttribute('aria-label', __rmT("wNqpauwKaFY"));
        more.addEventListener('click', () => {
            more.remove();
            const confirm = document.createElement('div');
            confirm.className = 'rm-fav-confirm';
            const keep = document.createElement('button');
            keep.type = 'button';
            keep.textContent = __rmT("CuN3nh");
            keep.addEventListener('click', () => { confirm.remove(); line.append(more); });
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'rm-fav-danger';
            remove.textContent = __rmT("2DihPf");
            remove.addEventListener('click', () => {
                void deleteTheaterFavorite(item.id).then(() => openTheaterFavoriteLibrary(hydrate))
                    .catch(error => globalThis.toastr?.warning?.(String(error?.message || __rmT("Uv_.pvu3rCFMsh"))));
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
        const visible = rows.filter(item => (!character || (item.characterName || __rmT("cynAhhB1")) === character)
            && (!query || theaterFavoriteDisplayTitle(item).toLowerCase().includes(query)));
        if (!visible.length) {
            const none = document.createElement('div');
            none.className = 'rm-fav-empty';
            none.style.gridColumn = '1 / -1';
            none.textContent = __rmT("wEm6JteMEwFG9uFMHbZWTgaRsCLwWjQnB.Jspf");
            grid.append(none);
            return;
        }
        for (const item of visible)
            grid.append(view === 'list' ? lineFor(item) : plateFor(item));
        if (view !== 'list') {
            requestAnimationFrame(() => {
                updateThumbScale(grid);
                for (const frame of grid.querySelectorAll('iframe.rm-fav-thumb'))
                    observeFavoriteThumb(frame, card);
            });
        }
    }
    if (rows.length)
        paint();
    if (typeof ResizeObserver === 'function') {
        const resize = new ResizeObserver(() => updateThumbScale(grid));
        resize.observe(grid);
        overlay.addEventListener('close', () => resize.disconnect(), { once: true });
    }
    const solarTerms = document.createElement('div');
    solarTerms.append(renderSolarTermProgress(rows, hydrate));
    const atlases = createFavoriteAtlasPanel({
        favorites: rows,
        openFavorite: id => openTheaterFavoriteViewer(id, hydrate),
        displayTitle: theaterFavoriteDisplayTitle,
    });
    shelf.append(solarTerms, atlases);
    card.append(style, shelf);
    bindOverlayDismiss(overlay, closeTheaterFavoriteLibrary);
    const keydown = event => {
        if (event.key !== 'Escape')
            return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (viewer)
            closeTheaterFavoriteViewer();
        else
            closeTheaterFavoriteLibrary();
    };
    document.addEventListener('keydown', keydown, true);
    presentOverlay(overlay);
    const startedEmpty = !rows.length;
    const onFavoritesChanged = () => {
        void listTheaterFavorites().then(next => {
            if (library?.overlay !== overlay)
                return;
            if (startedEmpty && next.length) {
                closeTheaterFavoriteLibrary();
                void openTheaterFavoriteLibrary(hydrate);
                return;
            }
            rows = next;
            count.textContent = rows.length ? `${rows.length}${__rmT("2RddPk")}` : '';
            paint();
            refreshDedupe();
            refreshBackup();
            solarTerms.replaceChildren(renderSolarTermProgress(rows, hydrate));
            atlases.setFavorites(rows);
        }).catch(error => globalThis.toastr?.warning?.(String(error?.message || __rmT("YfS3dno5fhTUcAia4DD"))));
    };
    document.addEventListener(THEATER_FAVORITES_CHANGED_EVENT, onFavoritesChanged);
    const onBackupSaved = () => { if (library?.overlay === overlay)
        refreshBackup(); };
    globalThis.addEventListener?.('rabbitmirror:favorite-backup', onBackupSaved);
    library = { overlay, keydown, onFavoritesChanged, onBackupSaved };
    return rows;
}
setContinuationCharacterResolver(() => { try {
    return String(currentTheaterFavoriteCharacter()?.characterId || '');
}
catch {
    return '';
} });
setTimeout(() => { void refreshContinuationCandidates(); }, 0);
