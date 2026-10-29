import { rmR as __rmR } from "./textTable.js?rmv=2.0.1";
const LEDGER_KEY = 'rabbitMirrorInteractionMethodLedger';
const LEDGER_LIMIT = 30;
function readLedger() {
    try {
        const parsed = JSON.parse(globalThis.localStorage?.getItem(LEDGER_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.key === 'string' && Array.isArray(item.methods)) : [];
    }
    catch {
        return [];
    }
}
function writeLedger(entries) {
    try {
        globalThis.localStorage?.setItem(LEDGER_KEY, JSON.stringify(entries.slice(-LEDGER_LIMIT)));
    }
    catch { }
}
function cleanMethods(list) {
    if (!Array.isArray(list))
        return [];
    return [...new Set(list.filter(item => typeof item === 'string').map(item => item.trim()).filter(item => item && item.length <= 12))].slice(0, 5);
}
function cleanArt(value) {
    return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) : '';
}
export function artDirectionGist(value) {
    const first = cleanArt(value).split(__rmR("trcQ8m0emHB80dTgY6D", ""))[0].trim();
    return first.length > 24 ? `${first.slice(0, 24)}…` : first;
}
export function interactionMethodsFromRecord(record) {
    if (!record || !Array.isArray(record.m) || !Number.isInteger(record.pick))
        return [];
    if (record.pick < 1 || record.pick > record.m.length)
        return [];
    const selected = record.m[record.pick - 1];
    return cleanMethods(typeof selected === 'string' ? [selected] : selected);
}
export function recordInteractionMethods(details) {
    if (!details?.getAttribute)
        return;
    const raw = details.getAttribute('data-rm-vs') || details.querySelector?.(':scope > :not(summary)[data-rm-vs], :scope > * > [data-rm-vs]')?.getAttribute('data-rm-vs');
    if (!raw || raw.length > 8192)
        return;
    let record;
    try {
        record = JSON.parse(raw);
    }
    catch {
        return;
    }
    const methods = interactionMethodsFromRecord(record);
    const art = cleanArt(record?.a);
    if (!methods.length && !art)
        return;
    const key = details.getAttribute('data-rabbit-mirror-owner-key') || `vs:${raw.length}:${raw.slice(0, 80)}`;
    const ledger = readLedger();
    if (ledger.some(item => item.key === key))
        return;
    ledger.push({ key, methods, at: Date.now(), ...(Number.isInteger(record.pick) && record.pick >= 1 && record.pick <= 3 ? { pick: record.pick } : {}), ...(art ? { art } : {}) });
    writeLedger(ledger);
}
const FRESH_MS = 12 * 60 * 60 * 1000;
function freshLedger() {
    const now = Date.now();
    return readLedger().filter(item => Number.isFinite(Number(item.at)) && now - Number(item.at) <= FRESH_MS);
}
export function recentInteractionMethods(faces = 3) {
    const recent = freshLedger().slice(-faces);
    return [...new Set(recent.flatMap(item => item.methods))];
}
export function recentArtDirections(faces = 3) {
    return [...new Set(freshLedger().slice(-faces).map(item => artDirectionGist(item.art)).filter(Boolean))];
}
export function recentDesignPicks(faces = 2) {
    return freshLedger().slice(-faces).map(item => item.pick).filter(pick => Number.isInteger(pick));
}
const FOLLOW_PICK_KEY = 'rabbitMirrorFollowPickLedger';
function readFollowPicks() {
    try {
        const parsed = JSON.parse(globalThis.localStorage?.getItem(FOLLOW_PICK_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.filter(item => item && Number.isInteger(item.pick) && Number.isFinite(Number(item.at))) : [];
    }
    catch {
        return [];
    }
}
export function rememberFollowPicks(picks = []) {
    const fresh = (Array.isArray(picks) ? picks : []).filter(pick => Number.isInteger(pick) && pick >= 1 && pick <= 3);
    if (!fresh.length)
        return;
    const now = Date.now();
    try {
        globalThis.localStorage?.setItem(FOLLOW_PICK_KEY, JSON.stringify([...readFollowPicks(), ...fresh.map(pick => ({ pick, at: now }))].slice(-LEDGER_LIMIT)));
    }
    catch { }
}
export function recentFollowPicks(faces = 2) {
    const now = Date.now();
    return readFollowPicks().filter(item => now - Number(item.at) <= FRESH_MS).slice(-faces).map(item => item.pick);
}
