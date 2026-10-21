// 存档清单：当前聊天的兔子镜在三处存档里各记着什么（本机缓存、聊天文件、版本存档），
// 外加每一层现在正文的指纹。只有键、指纹、时间、长度这类数字和代号，不含任何聊天正文和兔子镜内容。
// 给「找回旧兔子镜」找不到时排查用：拿清单对一下，就知道存档是在别的楼层名下、还是真的没了。
import { getContext, RUNTIME_VERSION } from './runtime.js?rmv=1.73.11';
import { chatKey, legacyChatKey, swipeId, messageSourceFingerprint, legacyMessageSourceFingerprints } from './connection.js?rmv=1.73.11';
import { readStore, chatPersistedOwnerEntries, chatMovedOwners, persistedOwnerForMessage } from './persistence.js?rmv=1.73.11';
import { loadFaceSwipeArchiveRows } from '../swipeVersions.js?rmv=1.73.11';

const pad = (value, width) => String(value ?? '').padEnd(width);
function describe(record) {
    if (!record || typeof record !== 'object') return '（空）';
    if (record.deleted) return `已删除标记 指纹=${record.sourceHash || '-'} 时间=${stamp(record.ts)}`;
    const html = String(record.html || '');
    return `指纹=${record.sourceHash || '-'}${record.bodyHash && record.bodyHash !== record.sourceHash ? `/${record.bodyHash}` : ''} 时间=${stamp(record.ts)} 版本=${record.runtime || '-'} 长度=${html.length}${record.ownerLineage ? ` 认领=${record.ownerLineage.mesid}:${record.ownerLineage.swipe}` : ''}${record.faceSwipes ? ` 五版=${Object.keys(record.faceSwipes).length}面` : ''}`;
}
function stamp(ts) { const n = Number(ts || 0); return n > 0 ? new Date(n).toISOString().replace('T', ' ').slice(0, 19) : '-'; }

export async function buildRabbitMirrorArchiveInventory(ctx = getContext()) {
    const chat = Array.isArray(ctx?.chat) ? ctx.chat : [];
    const key = chatKey(ctx), legacy = legacyChatKey(ctx);
    const lines = [];
    lines.push(`兔子镜存档清单 ${RUNTIME_VERSION} ${new Date().toISOString()}`);
    lines.push(`聊天键=${key}${legacy !== key ? ` 旧式键=${legacy}` : ''} 楼层数=${chat.length}`);
    lines.push('（不含聊天正文和兔子镜内容；指纹是正文的哈希代号，用来对楼层）');
    lines.push('');
    lines.push('一、每层现在的正文指纹（助手回复）');
    lines.push('楼层  swipe 当前指纹   旧算法指纹  聊天文件里记着');
    chat.forEach((msg, index) => {
        if (!msg || msg.is_user || msg.is_system) return;
        const legacyHashes = legacyMessageSourceFingerprints(msg).filter(hash => hash !== messageSourceFingerprint(msg));
        const owner = persistedOwnerForMessage(ctx, index, msg);
        const match = owner && !owner.deleted && [messageSourceFingerprint(msg), ...legacyHashes].includes(String(owner.sourceHash || owner.bodyHash || '')) ? '对得上' : owner ? (owner.deleted ? '已删除标记' : '对不上') : '无';
        lines.push(`${pad(index, 5)} ${pad(swipeId(msg), 5)} ${pad(messageSourceFingerprint(msg), 11)} ${pad(legacyHashes.join('/') || '-', 11)} ${match}`);
    });
    lines.push('');
    lines.push('二、聊天文件里记着的兔子镜（按楼层号）');
    for (const entry of chatPersistedOwnerEntries(ctx).sort((a, b) => a.index - b.index || a.swipe - b.swipe)) lines.push(`${entry.index}:${entry.swipe}  ${describe(entry.record)}`);
    const aside = chatMovedOwners(ctx);
    if (aside.length) { lines.push('找回时另存的（不属于任何楼层）：'); for (const entry of aside) lines.push(`  指纹=${entry.hash}  ${describe(entry.record)}`); }
    lines.push('');
    lines.push('三、本机缓存（localStorage）里这个聊天的记录');
    const store = readStore();
    const prefixes = [...new Set([`${key}:`, `${legacy}:`])];
    let cached = 0;
    for (const [slot, record] of Object.entries(store)) {
        if (!prefixes.some(prefix => slot.startsWith(prefix))) continue;
        cached += 1;
        lines.push(`${slot}  ${describe(record)}`);
    }
    if (!cached) lines.push('（没有）');
    lines.push('');
    lines.push('四、版本存档（IndexedDB）里这个聊天的行');
    for (const prefix of prefixes) {
        const rows = await loadFaceSwipeArchiveRows(prefix.slice(0, -1));
        if (rows === null) { lines.push(`${prefix}… 读不出来（超时或出错）`); continue; }
        if (!rows.length) { lines.push(`${prefix}… （没有）`); continue; }
        for (const row of rows.sort((a, b) => String(a.slot).localeCompare(String(b.slot), undefined, { numeric: true }))) {
            lines.push(`${row.slot}  ${describe(row.record)}  版本面数=${Object.keys(row.states || {}).length}`);
        }
    }
    return lines.join('\n');
}
