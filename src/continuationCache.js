// 偶尔的续篇：以很小的概率，让这一面接着收藏夹里的某一面写（回信、下一页、之后的事）。
// 这里只保存收藏的摘要（标题、展现形式、一句梗概），由收藏夹模块刷新；不读写 HTML，也不发起任何请求。
const CONTINUATION_CHANCE = 0.04;
const RECENT_KEY = 'rabbitMirrorContinuationRecent';
let candidates = [];
let currentCharacter = () => '';

export function setContinuationCandidates(list) {
    candidates = Array.isArray(list) ? list.filter(item => item && item.id && item.formatId && item.title) : [];
}

export function setContinuationCharacterResolver(resolver) {
    if (typeof resolver === 'function') currentCharacter = resolver;
}

function randomUnit() {
    try {
        const buffer = new Uint32Array(1);
        globalThis.crypto.getRandomValues(buffer);
        return buffer[0] / 4294967296;
    } catch {
        return Math.random();
    }
}

export function normalizeContinuation(value) {
    if (!value || typeof value !== 'object') return null;
    const id = String(value.id || '').slice(0, 120);
    const formatId = String(value.formatId || '').slice(0, 80);
    const title = String(value.title || '').slice(0, 80);
    if (!id || !formatId || !title) return null;
    return Object.freeze({ id, formatId, title, gist: String(value.gist || '').slice(0, 90) });
}

// 有可续写的收藏、并且抽中很小的概率时，返回一条续篇；同一条收藏近期不重复。
export function drawContinuation(isKnownFormat = () => true) {
    if (!candidates.length || randomUnit() >= CONTINUATION_CHANCE) return null;
    let recent = [];
    try { recent = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]'); } catch { recent = []; }
    let character = '';
    try { character = String(currentCharacter() || ''); } catch { character = ''; }
    const pool = candidates.filter(item => (!character || !item.characterId || item.characterId === character)
        && !recent.includes(item.id) && isKnownFormat(item.formatId));
    if (!pool.length) return null;
    const picked = pool[Math.floor(randomUnit() * pool.length)];
    try { globalThis.localStorage?.setItem(RECENT_KEY, JSON.stringify([...recent.filter(id => id !== picked.id), picked.id].slice(-6))); } catch { /* best effort */ }
    return normalizeContinuation(picked);
}
