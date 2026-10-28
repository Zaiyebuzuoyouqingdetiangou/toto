export function pickMovedIndependentRecord(candidates, { index, matches, ownHashes, restorable = () => true }) {
    const target = Number(index);
    const found = [];
    for (const candidate of Array.isArray(candidates) ? candidates : []) {
        const record = candidate?.record, from = candidate?.from;
        if (!record?.html || record.deleted || !from || (from.index !== null && (!Number.isInteger(from.index) || from.index < 0)))
            continue;
        if (!restorable(record.html) || !matches(record))
            continue;
        if (from.index !== null && from.index !== target) {
            const own = new Set((ownHashes(from.index) || []).map(String).filter(Boolean));
            if (own.has(String(record.sourceHash || '')) || own.has(String(record.bodyHash || '')))
                continue;
        }
        found.push(candidate);
    }
    found.sort((a, b) => Number(b.record.ts || 0) - Number(a.record.ts || 0));
    return found[0] || null;
}
export function pickOwnStaleRecord(candidates, { index, otherHashes, restorable = () => true }) {
    const target = Number(index);
    const taken = new Set((otherHashes || []).map(String).filter(Boolean));
    const found = [];
    for (const candidate of Array.isArray(candidates) ? candidates : []) {
        const record = candidate?.record, from = candidate?.from;
        if (!record?.html || record.deleted || from?.index !== target)
            continue;
        if (!restorable(record.html))
            continue;
        const hashes = [record.sourceHash, record.bodyHash].map(value => String(value || '')).filter(Boolean);
        if (!hashes.length || hashes.some(hash => taken.has(hash)))
            continue;
        found.push(candidate);
    }
    found.sort((a, b) => Number(b.record.ts || 0) - Number(a.record.ts || 0));
    return found[0] || null;
}
