import { rmT as __rmT } from "../textTable.js?rmv=1.99.19";
import { getContext, RUNTIME_VERSION } from './runtime.js?rmv=1.99.19';
import { chatKey, legacyChatKey, swipeId, messageSourceFingerprint, legacyMessageSourceFingerprints } from './connection.js?rmv=1.99.19';
import { readStore, chatPersistedOwnerEntries, chatMovedOwners, persistedOwnerForMessage } from './persistence.js?rmv=1.99.19';
import { loadFaceSwipeArchiveRows } from '../swipeVersions.js?rmv=1.99.19';
const pad = (value, width) => String(value ?? '').padEnd(width);
function describe(record) {
    if (!record || typeof record !== 'object')
        return __rmT("KWvD9WZp");
    if (record.deleted)
        return `${__rmT("2GOmSfYAAOSLSYBwpRqe5zfx")}${record.sourceHash || '-'}${__rmT("N_EGFNDli.G")}${stamp(record.ts)}`;
    const html = String(record.html || '');
    return `${__rmT("XoIgPCI6")}${record.sourceHash || '-'}${record.bodyHash && record.bodyHash !== record.sourceHash ? `/${record.bodyHash}` : ''}${__rmT("N_EGFNDli.G")}${stamp(record.ts)}${__rmT("N_iLsWPXi.G")}${record.runtime || '-'}${__rmT("N_iOVb41i.G")}${html.length}${record.ownerLineage ? `${__rmT("N_.MzKkIi.G")}${record.ownerLineage.mesid}:${record.ownerLineage.swipe}` : ''}${record.faceSwipes ? `${__rmT("N_.J5O6Pi.G")}${Object.keys(record.faceSwipes).length}${__rmT("tD_")}` : ''}`;
}
function stamp(ts) { const n = Number(ts || 0); return n > 0 ? new Date(n).toISOString().replace('T', ' ').slice(0, 19) : '-'; }
export async function buildRabbitMirrorArchiveInventory(ctx = getContext()) {
    const chat = Array.isArray(ctx?.chat) ? ctx.chat : [];
    const key = chatKey(ctx), legacy = legacyChatKey(ctx);
    const lines = [];
    lines.push(`${__rmT("RP6BSnkqDBqirgLqAMtdHT")}${RUNTIME_VERSION} ${new Date().toISOString()}`);
    lines.push(`${__rmT("kAwqajhli.G")}${key}${legacy !== key ? `${__rmT("UqLi8IO2peuVTh")}${legacy}` : ''}${__rmT("UqYc6VeBnMuVTh")}${chat.length}`);
    lines.push(__rmT("KoeTFR7HefAgdQ7M1MuopEIa_3pqnH3FVqukH8Eo38KIOmkSSukk3envBsJMZ.o1LRlnyT4salXPxC9acDs"));
    lines.push('');
    lines.push(__rmT("e2b2lo6QOdkqmo74IwjHCQw6wDXiezjamcvgTojz9aydEf"));
    lines.push(__rmT("hjlmK.sKt8c7TBk7s_yS7wpWkBG8OVKM9Y6SQ9xK6wVy8jfEdBF72FwVciQFIk4Y19TZVXgXcKG2tPOOWf_"));
    chat.forEach((msg, index) => {
        if (!msg || msg.is_user || msg.is_system)
            return;
        const legacyHashes = legacyMessageSourceFingerprints(msg).filter(hash => hash !== messageSourceFingerprint(msg));
        const owner = persistedOwnerForMessage(ctx, index, msg);
        const match = owner && !owner.deleted && [messageSourceFingerprint(msg), ...legacyHashes].includes(String(owner.sourceHash || owner.bodyHash || '')) ? __rmT("IKOU0q_c") : owner ? (owner.deleted ? __rmT("7ZOHcqyZyJwDZf") : __rmT("IK0mWW_c")) : __rmT("wWY");
        lines.push(`${pad(index, 5)} ${pad(swipeId(msg), 5)} ${pad(messageSourceFingerprint(msg), 11)} ${pad(legacyHashes.join('/') || '-', 11)} ${match}`);
    });
    lines.push('');
    lines.push(__rmT("P2iP0atM8CYx_0doEKGl3GtHoO2xRikcQFoERJ29i1JWW9UXcph"));
    for (const entry of chatPersistedOwnerEntries(ctx).sort((a, b) => a.index - b.index || a.swipe - b.swipe))
        lines.push(`${entry.index}:${entry.swipe}  ${describe(entry.record)}`);
    const aside = chatMovedOwners(ctx);
    if (aside.length) {
        lines.push(__rmT("NsLBIzE2MG.J0w2U11bv4sdKMi2DXHWDO3xaM1phRCp"));
        for (const entry of aside)
            lines.push(`${__rmT("UqeHO7IWOPcVTh")}${entry.hash}  ${describe(entry.record)}`);
    }
    lines.push('');
    lines.push(__rmT("xq1TbQ0S0tbGh7UtHzF4wK.8b.FgM7CDr2WwKL9Nba8AxBSnTeuEM8P49WfjmmSOBzfpEuMtIPG"));
    const store = readStore();
    const prefixes = [...new Set([`${key}:`, `${legacy}:`])];
    let cached = 0;
    for (const [slot, record] of Object.entries(store)) {
        if (!prefixes.some(prefix => slot.startsWith(prefix)))
            continue;
        cached += 1;
        lines.push(`${slot}  ${describe(record)}`);
    }
    if (!cached)
        lines.push(__rmT("fn7m6VmX0SY"));
    lines.push('');
    lines.push(__rmT("1J7G5V4c.W1z_EEgl_nku54DkouwD8bJnk.spBYZaDx19vzWtWeZBdJfvGXn7aM_"));
    for (const prefix of prefixes) {
        const rows = await loadFaceSwipeArchiveRows(prefix.slice(0, -1));
        if (rows === null) {
            lines.push(`${prefix}${__rmT("B8YoeObwdmonmBU9qNfNYQK7UplPhX8MuLf")}`);
            continue;
        }
        if (!rows.length) {
            lines.push(`${prefix}${__rmT("zKMNjANx.w9bIymD")}`);
            continue;
        }
        for (const row of rows.sort((a, b) => String(a.slot).localeCompare(String(b.slot), undefined, { numeric: true }))) {
            lines.push(`${row.slot}  ${describe(row.record)}${__rmT("7acv1DiWqhFar7Fol6D")}${Object.keys(row.states || {}).length}`);
        }
    }
    return lines.join('\n');
}
