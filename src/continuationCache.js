const CONTINUATION_CHANCE = 0.04;
const RECENT_KEY = 'rabbitMirrorContinuationRecent';
let candidates = [];
let currentCharacter = () => '';
export function setContinuationCandidates(list) {
    candidates = Array.isArray(list) ? list.filter(item => item && item.id && item.formatId && item.title) : [];
}
export function setContinuationCharacterResolver(resolver) {
    if (typeof resolver === 'function')
        currentCharacter = resolver;
}
function randomUnit() {
    try {
        const buffer = new Uint32Array(1);
        globalThis.crypto.getRandomValues(buffer);
        return buffer[0] / 4294967296;
    }
    catch {
        return Math.random();
    }
}
export function normalizeContinuation(value) {
    if (!value || typeof value !== 'object')
        return null;
    const id = String(value.id || '').slice(0, 120);
    const formatId = String(value.formatId || '').slice(0, 80);
    const title = String(value.title || '').slice(0, 80);
    if (!id || !formatId || !title)
        return null;
    return Object.freeze({ id, formatId, title, gist: String(value.gist || '').slice(0, 90) });
}
export function drawContinuation(isKnownFormat = () => true) {
    if (!candidates.length || randomUnit() >= CONTINUATION_CHANCE)
        return null;
    let recent = [];
    try {
        recent = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]');
    }
    catch {
        recent = [];
    }
    let character = '';
    try {
        character = String(currentCharacter() || '');
    }
    catch {
        character = '';
    }
    const pool = candidates.filter(item => (!character || !item.characterId || item.characterId === character)
        && !recent.includes(item.id) && isKnownFormat(item.formatId));
    if (!pool.length)
        return null;
    const picked = pool[Math.floor(randomUnit() * pool.length)];
    try {
        globalThis.localStorage?.setItem(RECENT_KEY, JSON.stringify([...recent.filter(id => id !== picked.id), picked.id].slice(-6)));
    }
    catch { }
    return normalizeContinuation(picked);
}
export const COLLECTION_TASTE_MULTIPLIER = 1.5;
export const COLLECTION_ONLY = Symbol('collectionTasteOnly');
export function collectionTasteFormatIds(normalize = id => id) {
    return [...new Set(candidates.map(item => { try {
            return String(normalize(String(item.formatId || '')) || '');
        }
        catch {
            return '';
        } }).filter(Boolean))];
}
export function withCollectionTaste(favorites, settings, normalize) {
    if (!favorites || settings?.collectionTasteEnabled === false)
        return favorites;
    const extra = collectionTasteFormatIds(normalize).filter(id => !favorites.formatSet?.has?.(id) && !(favorites.formatIds || []).includes(id));
    if (!extra.length)
        return favorites;
    const formatIds = [...(favorites.formatIds || []), ...extra];
    const formatMultipliers = { ...(favorites.formatMultipliers || {}), ...Object.fromEntries(extra.map(id => [id, COLLECTION_TASTE_MULTIPLIER])) };
    formatMultipliers[COLLECTION_ONLY] = new Set(extra);
    return { ...favorites, formatIds, formatSet: new Set(formatIds), formatMultipliers };
}
