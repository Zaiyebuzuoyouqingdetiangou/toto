// 交互方式账本：记录每面兔子镜“实际被指定实现的那条 VS 候选”自报的交互方式，
// 下一次出题时提醒模型近期已经用过哪些方式。只读模型自己写在 data-rm-vs 里的标签，
// 不从 HTML 结构猜测，也不由程序指派交互方式。
const LEDGER_KEY = 'rabbitMirrorInteractionMethodLedger';
const LEDGER_LIMIT = 30;

function readLedger() {
    try {
        const parsed = JSON.parse(globalThis.localStorage?.getItem(LEDGER_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.key === 'string' && Array.isArray(item.methods)) : [];
    } catch {
        return [];
    }
}

function writeLedger(entries) {
    try { globalThis.localStorage?.setItem(LEDGER_KEY, JSON.stringify(entries.slice(-LEDGER_LIMIT))); } catch { /* best effort */ }
}

function cleanMethods(list) {
    if (!Array.isArray(list)) return [];
    return [...new Set(list.filter(item => typeof item === 'string').map(item => item.trim()).filter(item => item && item.length <= 12))].slice(0, 5);
}

export function interactionMethodsFromRecord(record) {
    if (!record || !Array.isArray(record.m) || !Number.isInteger(record.pick)) return [];
    if (record.pick < 1 || record.pick > record.m.length) return [];
    const selected = record.m[record.pick - 1];
    // 同一候选既可能自报单个标签，也可能自报标签数组；仍只读取 pick 指定的那项。
    return cleanMethods(typeof selected === 'string' ? [selected] : selected);
}

// 挂载时调用；同一面只记一次（按归属键或 VS 原文），重新挂载不会把旧面重新排到最新。
export function recordInteractionMethods(details) {
    if (!details?.getAttribute) return;
    // 模型有时把记录写在 details 里面第一层的容器上，而不是 details 本身。
    const raw = details.getAttribute('data-rm-vs') || details.querySelector?.(':scope > :not(summary)[data-rm-vs], :scope > * > [data-rm-vs]')?.getAttribute('data-rm-vs');
    if (!raw || raw.length > 8192) return;
    let record;
    try { record = JSON.parse(raw); } catch { return; }
    const methods = interactionMethodsFromRecord(record);
    if (!methods.length) return;
    const key = details.getAttribute('data-rabbit-mirror-owner-key') || `vs:${raw.length}:${raw.slice(0, 80)}`;
    const ledger = readLedger();
    if (ledger.some(item => item.key === key)) return;
    ledger.push({ key, methods, at: Date.now() });
    writeLedger(ledger);
}

export function recentInteractionMethods(faces = 3) {
    const recent = readLedger().slice(-faces);
    return [...new Set(recent.flatMap(item => item.methods))];
}
