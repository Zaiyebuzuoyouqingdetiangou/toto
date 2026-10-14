// 待修样本箱：维修兔「认不出写法」或「修了还是没反应」的那一面，把写法骨架存一份在本机，设置里一键导出。
// 骨架里没有聊天正文（文字全是占位），只有结构、标识和 CSS。只存在本机，不会自动发出去。
// 容量：最多 40 面、总共约 2 MB，超了先挤掉最早的；同一面（骨架相同）只记一份，更新原因和次数。
import { hashText } from '../independentApi/runtime.js?rmv=1.68.59';
import { RUNTIME_VERSION } from './runtime.js?rmv=1.68.59';
import { maskFaceText } from './writingSkeleton.js?rmv=1.68.59';
import { inspectBehaviorDialect } from './behaviorDialect.js?rmv=1.68.59';

export const REPAIR_SAMPLES_KEY = 'rabbit_mirror_repair_samples:v1';
export const REPAIR_SAMPLES_EVENT = 'rabbitmirror:repair-samples';
const MAX_ENTRIES = 40;
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_SKELETON_CHARS = 120000;

function read() {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(REPAIR_SAMPLES_KEY) || 'null');
        return value && typeof value === 'object' && Array.isArray(value.entries) ? value : { version: 1, entries: [] };
    } catch { return { version: 1, entries: [] }; }
}
function write(box) {
    const trimmed = { version: 1, entries: [...box.entries] };
    // 先按条数、再按总量，从最早的开始挤。
    trimmed.entries.sort((a, b) => Number(b.at || 0) - Number(a.at || 0));
    trimmed.entries = trimmed.entries.slice(0, MAX_ENTRIES);
    let text = JSON.stringify(trimmed);
    while (text.length * 2 > MAX_BYTES && trimmed.entries.length > 1) { trimmed.entries.pop(); text = JSON.stringify(trimmed); }
    try { globalThis.localStorage?.setItem(REPAIR_SAMPLES_KEY, text); }
    catch { /* 本机存满了：这份样本先不存，不影响维修本身 */ return false; }
    try { globalThis.dispatchEvent?.(new CustomEvent(REPAIR_SAMPLES_EVENT, { detail: { count: trimmed.entries.length } })); } catch { /* ignore */ }
    return true;
}

export function listRepairSamples() { return read().entries.slice().sort((a, b) => Number(b.at || 0) - Number(a.at || 0)); }
export function countRepairSamples() { return read().entries.length; }
export function clearRepairSamples() { try { globalThis.localStorage?.removeItem(REPAIR_SAMPLES_KEY); } catch { /* ignore */ } try { globalThis.dispatchEvent?.(new CustomEvent(REPAIR_SAMPLES_EVENT, { detail: { count: 0 } })); } catch { /* ignore */ } }

/**
 * 记一份样本。trigger：patrol（巡逻实测有控件没反应）/ interaction（点了没反应维修后仍没好）。
 * controls：没反应的控件名（会打码只留长度）；reason：维修兔给出的结论原文（会打码控件名）。
 * skeleton：{ source, rendered }，由调用方用 buildRabbitMirrorSkeletonPair 生成。
 */
export function recordRepairSample(root, { trigger = 'patrol', reason = '', controls = [], skeleton = null } = {}) {
    if (!skeleton || (!skeleton.source && !skeleton.rendered)) return null;
    const source = String(skeleton.source || '').slice(0, MAX_SKELETON_CHARS);
    const rendered = String(skeleton.rendered || '').slice(0, MAX_SKELETON_CHARS);
    const id = hashText(`${source}\u0000${rendered}`);
    // 方言识别结果：认不出的键是模型写的原文，和骨架一样换成长度（短英文键照留）。
    const PLAIN = /^!?[\w.-]{1,24}$/;
    let dialect = null;
    try {
        const inspected = root ? inspectBehaviorDialect(root) : null;
        if (inspected) dialect = { declared: !!inspected.declared, dialects: inspected.dialects || [],
            unmatched: (inspected.unmatched || []).map(item => `${String(item?.type || '')}:${PLAIN.test(String(item?.token || '')) ? item.token : maskFaceText(item?.token)}`) };
    } catch { dialect = null; }
    const box = read();
    const existing = box.entries.find(entry => entry.id === id);
    const rawControls = (Array.isArray(controls) ? controls : []).map(name => String(name || '')).filter(Boolean);
    const maskedControls = rawControls.map(name => maskFaceText(name)).slice(0, 12);
    // 结论里的控件名：先按原文整个替换（名字本身带「」也不会漏字），再把剩下「」里的都换掉。
    let maskedReason = String(reason || '');
    for (const name of [...rawControls].sort((a, b) => b.length - a.length)) maskedReason = maskedReason.split(name).join(maskFaceText(name));
    maskedReason = maskedReason.replace(/「[^」]*」/g, match => /^「字×\d+」$/.test(match) ? match : `「${maskFaceText(match.slice(1, -1))}」`).slice(0, 400);
    const entry = {
        id, at: Date.now(), version: RUNTIME_VERSION, trigger,
        reason: maskedReason,
        controls: maskedControls, dialect, source, rendered,
        hits: (existing?.hits || 0) + 1, firstAt: existing?.firstAt || Date.now(),
    };
    box.entries = [entry, ...box.entries.filter(item => item.id !== id)];
    return write(box) ? entry : null;
}

function stamp(ts) { const n = Number(ts || 0); return n > 0 ? new Date(n).toISOString().replace('T', ' ').slice(0, 19) : '-'; }

export function buildRepairSamplesExport() {
    const entries = listRepairSamples();
    const head = [
        `兔子镜待修样本箱 ${RUNTIME_VERSION} ${new Date().toISOString()} 共 ${entries.length} 面`,
        '（每面只有写法骨架：文字全是占位，不含聊天内容。可以直接发给作者。）',
        '',
    ];
    const body = entries.map((entry, index) => [
        `==================== 样本 ${index + 1} / ${entries.length} ====================`,
        `编号=${entry.id} 时间=${stamp(entry.at)} 版本=${entry.version} 触发=${entry.trigger === 'interaction' ? '点了没反应维修后仍没好' : '巡逻实测有控件没反应'} 次数=${entry.hits}`,
        `结论：${entry.reason || '-'}`,
        entry.controls?.length ? `没反应的控件：${entry.controls.join('、')}` : '',
        entry.dialect ? `方言：${entry.dialect.declared ? (entry.dialect.dialects.join(',') || '标准写法') : '没有插件写法'}${entry.dialect.unmatched?.length ? `；认不出：${entry.dialect.unmatched.map(String).join('、')}` : ''}` : '',
        '',
        '[源代码骨架]', entry.source || '（无）', '',
        '[实际渲染骨架]', entry.rendered || '（无）', '',
    ].filter(line => line !== '').join('\n'));
    return [...head, ...body].join('\n');
}
