// 找回旧兔子镜：在整个聊天的存档里，按这条回复的正文指纹挑出挪了楼层号的那一份。纯函数，不读写任何存储。
// candidates: [{record, from:{index, swipe}}]；matches(record) 判断正文对得上这条回复；
// ownHash(index) 给出那一层现在正文的指纹（那一层自己正文也对得上时，这份存档属于那一层，不拿）。
export function pickMovedIndependentRecord(candidates, { index, matches, ownHash, restorable = () => true }) {
    const target = Number(index);
    const found = [];
    for (const candidate of Array.isArray(candidates) ? candidates : []) {
        const record = candidate?.record, from = candidate?.from;
        // from.index 为 null：找回时挪出来另存的那份，不属于任何楼层。
        if (!record?.html || record.deleted || !from || (from.index !== null && (!Number.isInteger(from.index) || from.index < 0))) continue;
        if (!restorable(record.html) || !matches(record)) continue;
        if (from.index !== null && from.index !== target) {
            const hash = String(ownHash(from.index) || '');
            if (hash && (String(record.sourceHash || '') === hash || String(record.bodyHash || '') === hash)) continue;
        }
        found.push(candidate);
    }
    found.sort((a, b) => Number(b.record.ts || 0) - Number(a.record.ts || 0));
    return found[0] || null;
}
