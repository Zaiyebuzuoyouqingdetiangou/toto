// Atlas definitions and associations are separate from saved mirrors. Reading,
// editing or deleting an atlas never rewrites the original favorite.
const DB_NAME = 'rabbit_mirror_favorite_atlases_v1';
const STORE = 'atlases';
const clean = value => String(value ?? '').trim();
const key = value => clean(value).normalize('NFKC').toLocaleLowerCase();
const unique = values => [...new Set(values)];
const evidenceCache = new WeakMap();

function newId(prefix) {
    return `${prefix}_${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`}`;
}

// slotIds 与文本逐行对应（可省略）：编辑器里改了格子名称时，凭原来的格子 id 保住手动关联，
// 不因为名字变了就当成新格子。只认 previous 里真实存在、且没被别的行用掉的 id。
export function parseAtlasSlots(text, previous = [], slotIds = []) {
    const byLabel = new Map(previous.map(slot => [key(slot.label), slot]));
    const previousIds = new Set(previous.map(slot => slot.id));
    const usedIds = new Set();
    const seen = new Set();
    return String(text || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map((line, index) => {
        const [label, ...aliases] = line.split('|').map(clean);
        if (!label) throw new Error(`第 ${index + 1} 行缺少格子名称。`);
        if (seen.has(key(label))) throw new Error(`格子「${label}」重复了，请使用不同名称。`);
        seen.add(key(label));
        const carried = slotIds[index];
        const byName = byLabel.get(key(label))?.id;
        const id = carried && previousIds.has(carried) && !usedIds.has(carried) ? carried
            : byName && !usedIds.has(byName) ? byName : newId('slot');
        usedIds.add(id);
        return { id, label, keywords: unique([label, ...aliases].filter(Boolean)) };
    });
}

export function atlasSlotsText(slots) {
    return slots.map(slot => [slot.label, ...slot.keywords.filter(word => key(word) !== key(slot.label))].join(' | ')).join('\n');
}

export function buildFavoriteAtlas({ id, name, slotsText, slotIds = [], previous = null }) {
    if (!clean(name)) throw new Error('请填写图鉴名称。');
    const slots = parseAtlasSlots(slotsText, previous?.slots || [], slotIds);
    if (!slots.length) throw new Error('请至少填写一个格子。');
    const selections = {};
    for (const slot of slots) {
        if (Object.hasOwn(previous?.selections || {}, slot.id)) selections[slot.id] = [...previous.selections[slot.id]];
    }
    return {
        id: clean(id || previous?.id) || newId('atlas'), name: clean(name), slots, selections,
        createdAt: previous?.createdAt || Date.now(), updatedAt: Date.now(),
    };
}

export function setAtlasSelection(atlas, slotId, favoriteIds) {
    if (!atlas.slots.some(slot => slot.id === slotId)) throw new Error('没有找到这个图鉴格子。');
    const selections = { ...atlas.selections };
    if (favoriteIds === null) delete selections[slotId]; // restore automatic matching
    else selections[slotId] = unique(favoriteIds.map(clean).filter(Boolean)); // [] deliberately unlit
    return { ...atlas, selections, updatedAt: Date.now() };
}

function decodeText(value) {
    return String(value).replace(/&#(x[\da-f]+|\d+);?/gi, (_, code) => {
        const number = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
        return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : ' ';
    }).replace(/&(?:nbsp|ensp|emsp|thinsp);/gi, ' ')
        .replace(/&(?:amp|lt|gt|quot|apos);/gi, entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" }[entity.toLowerCase()]))
        .replace(/&[a-z][a-z\d]+;/gi, ' ');
}

function plainText(html) {
    return decodeText(String(html).replace(/<(?:[^>"']|"[^"]*"|'[^']*')*>/g, ''));
}

function keywordInLabel(text, keyword) {
    const haystack = key(text), needle = key(keyword);
    if (!needle) return false;
    // Short ordinary words (猫, 月亮, sun) require word/label boundaries.
    // Longer Chinese phrases can also occur inside a descriptive title.
    if ([...needle].length >= 3 && /[\u3400-\u9fff]/u.test(needle)) return haystack.includes(needle);
    let start = haystack.indexOf(needle);
    while (start >= 0) {
        const before = [...haystack.slice(0, start)].at(-1) || '';
        const after = [...haystack.slice(start + needle.length)][0] || '';
        if (!/[\p{L}\p{N}]/u.test(before) && !/[\p{L}\p{N}]/u.test(after)) return true;
        start = haystack.indexOf(needle, start + 1);
    }
    return false;
}

function favoriteEvidence(favorite) {
    const title = String(favorite?.title || ''), source = String(favorite?.html || '');
    const cached = favorite && evidenceCache.get(favorite);
    if (cached?.title === title && cached?.source === source) return cached;
    const html = source
        .replace(/<!--[\s\S]*?(?:-->|$)/g, '')
        .replace(/<(script|style|template)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, '');
    const headings = [title];
    for (const heading of html.matchAll(/<(h[1-6]|summary|header|figcaption|caption|legend|dt)\b(?:[^>"']|"[^"]*"|'[^']*')*>([\s\S]*?)<\/\1\s*>/gi)) {
        headings.push(plainText(heading[2]));
    }
    const text = html.replace(/<\/?(?:div|p|section|article|li|dt|dd|td|th|tr|br)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi, '\n');
    const labels = plainText(text).split('\n').map(line => key(line).replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, '').trim());
    const evidence = { title, source, headings, labels: new Set(labels) };
    if (favorite && typeof favorite === 'object') evidenceCache.set(favorite, evidence);
    return evidence;
}

export function atlasSlotMatchesFavorite(slot, favorite) {
    const keywords = unique([slot.label, ...(slot.keywords || [])].map(clean).filter(Boolean));
    const evidence = favoriteEvidence(favorite);
    return keywords.some(word => evidence.labels.has(key(word)) || evidence.headings.some(heading => keywordInLabel(heading, word)));
}

export function favoriteAtlasProgress(atlas, favorites) {
    const rows = Array.isArray(favorites) ? favorites : [];
    const slots = atlas.slots.map(slot => {
        const manual = Object.hasOwn(atlas.selections || {}, slot.id);
        const selected = new Set(manual ? atlas.selections[slot.id] : []);
        const matches = rows.filter(row => manual ? selected.has(row.id) : atlasSlotMatchesFavorite(slot, row));
        return { ...slot, manual, matches };
    });
    return { slots, total: slots.length, count: slots.filter(slot => slot.matches.length).length };
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        if (!globalThis.indexedDB) { reject(new Error('当前环境没有 IndexedDB，无法保存自定义图鉴。')); return; }
        const request = indexedDB.open(DB_NAME, 1);
        let blocked = false;
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' });
        };
        request.onsuccess = () => {
            if (blocked) { request.result.close(); return; }
            request.result.onversionchange = () => request.result.close();
            resolve(request.result);
        };
        request.onerror = () => reject(request.error || new Error('无法打开自定义图鉴。'));
        request.onblocked = () => { blocked = true; reject(new Error('图鉴存储被其他窗口占用，请关闭旧窗口后重试。')); };
    });
}

async function transaction(mode, action) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        let result, tx;
        try {
            tx = db.transaction(STORE, mode);
            tx.oncomplete = () => { db.close(); resolve(result); };
            tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('图鉴保存失败，原有图鉴和收藏未改变。')); };
            const request = action(tx.objectStore(STORE));
            request.onsuccess = () => { result = request.result; };
        } catch (error) { try { tx?.abort(); } catch {} db.close(); reject(error); }
    });
}

export async function listFavoriteAtlases() {
    const rows = await transaction('readonly', store => store.getAll());
    return (rows || []).sort((a, b) => a.createdAt - b.createdAt);
}

export async function saveFavoriteAtlas(atlas) {
    await transaction('readwrite', store => store.put(atlas));
    return atlas;
}

export async function deleteFavoriteAtlas(id) {
    await transaction('readwrite', store => store.delete(String(id)));
}
