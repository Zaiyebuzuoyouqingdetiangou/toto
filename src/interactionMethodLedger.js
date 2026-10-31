import { rmR as __rmR } from "./textTable.js?rmv=2.3.1";
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
const SELF_FORM_KEY = 'rabbitMirrorSelfFormLedger';
const SELF_FORM_FRESH_MS = 3 * 24 * 60 * 60 * 1000;
function readSelfForms() {
    try {
        const parsed = JSON.parse(globalThis.localStorage?.getItem(SELF_FORM_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.form === 'string' && typeof item.key === 'string') : [];
    }
    catch {
        return [];
    }
}
const cleanSelfText = (value, max) => String(value || '').replace(/[\u0000-\u001f\u007f<>"]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
export function parseSelfInvented(raw) {
    const text = cleanSelfText(raw, 240);
    if (!text)
        return null;
    const form = text.match(__rmR("t_y9Aklu5j1AAfa80nZvzpqNLiSRV9TfnZnYp9bFkJcTv9SqykJOGayXW6kTHAGgUmuJ1uZweiy8l5LEZAdVLV5f5ZrlHxPoJQljW1FZ7P5Ul3.3QHKGrSksRWBVDmCa", ""))?.[1] || (!__rmR("nU5FOnaSHWklk0Aw4YVLECfx", "").test(text.split(__rmR("pEwVbaaua.G", ""))[0]) ? text.split(__rmR("pEwVbaaua.G", ""))[0] : '');
    const angle = text.match(__rmR("1Ujq.KCym19mNVwEyxsWfi86yD9ZN0XjBVDDGYEL9mbFfcM1Kef.3f", ""))?.[1] || '';
    const result = { form: cleanSelfText(form, 30), angle: cleanSelfText(angle, 60) };
    return result.form ? result : null;
}
export function selfInventedOf(details) {
    if (!details?.getAttribute)
        return null;
    const raw = details.getAttribute('data-rm-self') || details.querySelector?.(':scope > :not(summary)[data-rm-self]')?.getAttribute('data-rm-self');
    return raw ? parseSelfInvented(raw) : null;
}
export function recordSelfInventedForm(details) {
    const self = selfInventedOf(details);
    if (!self)
        return;
    const key = `${details.getAttribute('data-rabbit-mirror-owner-key') || ''}#${self.form}#${self.angle}`;
    let at = Date.now();
    try {
        const stamp = JSON.parse(details.getAttribute('data-rm-generated') || 'null');
        if (Number.isFinite(Number(stamp?.t)))
            at = Number(stamp.t);
    }
    catch { }
    if (Date.now() - at > SELF_FORM_FRESH_MS)
        return;
    const list = readSelfForms();
    if (list.some(item => item.key === key))
        return;
    list.push({ key, form: self.form, at });
    list.sort((a, b) => Number(a.at) - Number(b.at));
    try {
        globalThis.localStorage?.setItem(SELF_FORM_KEY, JSON.stringify(list.slice(-LEDGER_LIMIT)));
    }
    catch { }
}
export function recentSelfInventedForms(faces = 6) {
    const now = Date.now();
    const recent = readSelfForms().filter(item => Number.isFinite(Number(item.at)) && now - Number(item.at) <= SELF_FORM_FRESH_MS).slice(-faces);
    return [...new Set(recent.map(item => item.form).filter(Boolean))];
}
