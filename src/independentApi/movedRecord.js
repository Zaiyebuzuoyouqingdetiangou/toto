// 找回旧兔子镜：在整个聊天的存档里，按这条回复的正文指纹挑出挪了楼层号的那一份。纯函数，不读写任何存储。
// candidates: [{record, from:{index, swipe}}]；matches(record) 判断正文对得上这条回复；
// ownHashes(index) 给出那一层现在正文的指纹（含旧版算法的指纹；那一层自己正文也对得上时，这份存档属于那一层，不拿）。
export function pickMovedIndependentRecord(candidates, { index, matches, ownHashes, restorable = () => true }) {
    const target = Number(index);
    const found = [];
    for (const candidate of Array.isArray(candidates) ? candidates : []) {
        const record = candidate?.record, from = candidate?.from;
        // from.index 为 null：找回时挪出来另存的那份，不属于任何楼层。
        if (!record?.html || record.deleted || !from || (from.index !== null && (!Number.isInteger(from.index) || from.index < 0))) continue;
        if (!restorable(record.html) || !matches(record)) continue;
        if (from.index !== null && from.index !== target) {
            const own = new Set((ownHashes(from.index) || []).map(String).filter(Boolean));
            if (own.has(String(record.sourceHash || '')) || own.has(String(record.bodyHash || ''))) continue;
        }
        found.push(candidate);
    }
    found.sort((a, b) => Number(b.record.ts || 0) - Number(a.record.ts || 0));
    return found[0] || null;
}

// 这一层自己名下的存档，正文指纹却对不上（回复后来被编辑或被正则改写）：按用户明确点的「找回」放回去。
// 条件：这份存档的指纹不属于别的任何一层（否则它是错位过来的，归上面的流程），取最新的一份。
export function pickOwnStaleRecord(candidates, { index, otherHashes, restorable = () => true }) {
    const target = Number(index);
    const taken = new Set((otherHashes || []).map(String).filter(Boolean));
    const found = [];
    for (const candidate of Array.isArray(candidates) ? candidates : []) {
        const record = candidate?.record, from = candidate?.from;
        if (!record?.html || record.deleted || from?.index !== target) continue;
        if (!restorable(record.html)) continue;
        const hashes = [record.sourceHash, record.bodyHash].map(value => String(value || '')).filter(Boolean);
        if (!hashes.length || hashes.some(hash => taken.has(hash))) continue;
        found.push(candidate);
    }
    found.sort((a, b) => Number(b.record.ts || 0) - Number(a.record.ts || 0));
    return found[0] || null;
}
