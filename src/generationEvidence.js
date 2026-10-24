// 生成取证：本模块不写存储、不联网、不加定时器、不读实时 DOM（挂载结果由挂载层读好传进来）、不消耗随机数，观察者永远不影响生成结果。
// 平时自动在本页内存里保留最近 RECENT_LIMIT 次独立 API 生成（出了问题直接导出，不必事先预知）；
// 手动“记录下一次生成”拿到的那份会被钉住，后面的自动记录不会顶掉它。刷新页面即清空。
import { generationEvidenceTiming } from './generationTiming.js?rmv=1.81.5';
import { roleColorEvidence } from './roleColorVariants.js?rmv=1.81.5';
import { interactionMethodsFromRecord } from './interactionMethodLedger.js?rmv=1.81.5';
const RECENT_LIMIT = 3;
let armed = false;
let current = null;      // 手动钉住的那份；没有时为 null
let recent = [];         // 最近几次（含钉住的那份），新的在后
const live = new Set();  // 仍在记录中的
let sequence = 0;
const listeners = new Set();
let results = new WeakMap();

const SETTINGS_KEYS = [
    'generationSource', 'independentGenerationTiming', 'samplingMode', 'lotteryMethod',
    'rawPolicy', 'rabbitMirrorFaceCount', 'rabbitMirrorPresentationModes', 'multifaceDispatch',
    'forceVisualScenery', 'visualSceneryCombination', 'visualPromptEditingEnabled', 'darkVisualMode', 'visualToneMode', 'avoidRepeat', 'creativeExpansionMode',
    'postGenerationRecolor', 'visualDesignMode',
    'userDirectivePriority', 'presentationWorldviewLock', 'behaviorRuleMode',
    'independentContextMaxLayers', 'independentContextExcludedTags',
    'independentReadCharacterCardSummary', 'independentReadPersonaSummary',
    'independentReadGlobalWorldInfo', 'independentAdvancedEnabled',
];
const PRIVATE_KEY = /^(?:authorization|proxyauthorization|cookie|setcookie|headers|requestheaders|customincludeheaders|apikey|independentapikey|secret|secretid|password|proxypassword|accesstoken|refreshtoken|credential|credentials|customurl|reverseproxy|baseurl|endpoint)$/i;

function copy(value) {
    return JSON.parse(JSON.stringify(value, (key, item) =>
        PRIVATE_KEY.test(key.replace(/[^a-z]/gi, '')) ? '[未采集连接信息]' : item));
}

function visibleText(value) {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(visibleText).filter(Boolean).join('\n');
    if (!value || typeof value !== 'object' || value.thought === true
        || /^(?:reasoning|reasoning_text|analysis|thinking|thought)$/i.test(String(value.type || ''))) return '';
    return visibleText(value.text ?? value.content ?? value.output_text ?? value.value);
}

function completionEvidence(result) {
    const parserText = String(result?.text ?? '');
    // The normal JSON parser trims the visible field. Preserve that field's
    // whitespace here without changing the parser or retaining the whole payload.
    // For streams the last payload is not the complete answer: use its assembled text.
    if (!result?.streamed) {
        const payload = result?.payload, choice = payload?.choices?.[0];
        const candidates = [choice?.message?.content, choice?.text, choice?.delta?.content,
            payload?.output_text, payload?.response, payload?.text, payload?.content,
            payload?.message?.content, payload?.data?.output_text, payload?.data?.content,
            payload?.candidates?.[0]?.content?.parts, payload?.candidates?.[0]?.output,
            payload?.output];
        if (result?.parserFormat === 'text') candidates.push(result.raw);
        for (const candidate of candidates) {
            const text = visibleText(candidate);
            if (text.trim() && text.trim() === parserText.trim()) {
                return { text, textSource: 'visible-response-content',
                    ...(text !== parserText ? { parserText } : {}) };
            }
        }
    }
    return { text: parserText, textSource: result?.streamed ? 'assembled-stream-content' : 'parser-visible-content' };
}

function notify() {
    for (const listener of listeners) { try { listener(); } catch {} }
}

function shown() { return current || recent[recent.length - 1] || null; }

export function getGenerationEvidenceState() {
    const report = shown();
    return { armed, pinned: !!current, recentCount: recent.length,
        status: report?.status || 'idle', id: report?.id || '',
        mesid: report?.context?.owner?.mesid ?? null, hasReport: !!report,
        hasRequest: !!report?.request, hasResponse: !!report?.response,
        hasProcessedHtml: !!report?.processed, complete: report?.status === 'complete',
        timing: generationEvidenceTiming(report) };
}

export function subscribeGenerationEvidence(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function armGenerationEvidence() {
    if (current?.status === 'capturing') return false;
    current = null;
    armed = true;
    notify();
    return true;
}

export function cancelGenerationEvidenceArm() { armed = false; notify(); }

export function clearGenerationEvidence() {
    armed = false;
    current = null;
    recent = [];
    live.clear();
    results = new WeakMap();
    notify();
}

// VS 承诺与实际骨架对照：只读、只记录，不重试、不改成品。启发式结果，仅供排查。
function readVsAttribute(html) {
    const match = String(html || '').match(/data-rm-vs=(["'])([\s\S]*?)\1/);
    if (!match) return null;
    const text = match[2].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    try { return JSON.parse(text); } catch { return { unparsable: true }; }
}

function observedSkeletonHint(html) {
    const source = String(html || '');
    let radioGroups = [], checkboxes = 0, labels = 0;
    try {
        const doc = new DOMParser().parseFromString(source, 'text/html');
        const groups = new Map();
        for (const input of doc.querySelectorAll('input[type="radio"]')) {
            const name = input.getAttribute('name') || '';
            groups.set(name, (groups.get(name) || 0) + 1);
        }
        radioGroups = [...groups.values()];
        checkboxes = doc.querySelectorAll('input[type="checkbox"]').length;
        labels = doc.querySelectorAll('label').length;
    } catch {
        const names = [...source.matchAll(/type=["']radio["'][^>]*name=["']([^"']+)|name=["']([^"']+)["'][^>]*type=["']radio/gi)].map(m => m[1] || m[2]);
        const groups = new Map(); for (const name of names) groups.set(name, (groups.get(name) || 0) + 1);
        radioGroups = [...groups.values()];
        checkboxes = (source.match(/type=["']checkbox/gi) || []).length;
        labels = (source.match(/<label\b/gi) || []).length;
    }
    const largestRadioGroup = Math.max(0, ...radioGroups);
    const hint = largestRadioGroup >= 3 && labels >= 3 ? 'parallel_choice_group'
        : checkboxes >= 3 && labels >= 3 ? 'parallel_toggle_group' : 'other';
    return { hint, largestRadioGroup, checkboxes, labels };
}

function vsCheckFor(report) {
    const raw = report?.response?.text || '';
    const vs = readVsAttribute(raw);
    if (!vs) return { present: false };
    const pick = Number(vs.pick);
    const candidates = Array.isArray(vs.c) ? vs.c : [];
    const promised = Number.isInteger(pick) && candidates[pick - 1] ? String(candidates[pick - 1][0] || '') : '';
    const observed = observedSkeletonHint(report?.processed?.html || raw);
    const methods = interactionMethodsFromRecord(vs);
    return {
        present: true, pick: Number.isInteger(pick) ? pick : null, promised, methods,
        observed,
        // 并列同组选项（≥3）在多数情况下就是“并列入口切换同位内容”。仅为提示，不判定成品失败。
        possibleMismatch: observed.hint !== 'other',
        note: '启发式对照，仅记录，不重试；需结合成品确认。',
    };
}

function exportable(report) {
    return { ...report, vsCheck: vsCheckFor(report), timing: generationEvidenceTiming(report) };
}

export function exportGenerationEvidence() {
    const report = shown();
    return report ? JSON.stringify(exportable(report), null, 2) : '';
}

// 最近几次一起导出（新的在前）。
export function exportRecentGenerationEvidence() {
    if (!recent.length) return '';
    return JSON.stringify({ schema: 'rabbitmirror-generation-evidence-recent/1',
        reports: [...recent].reverse().map(exportable) }, null, 2);
}

export function claimGenerationEvidence({ version, profile, owner, settings, faceIndex, serial } = {}) {
    const pin = armed;
    armed = false;
    let record;
    try {
        const settingsSnapshot = {};
        for (const key of SETTINGS_KEYS) if (settings?.[key] !== undefined) settingsSnapshot[key] = settings[key];
        record = {
            schema: 'rabbitmirror-generation-evidence/1',
            id: `rm-evidence-${Date.now()}-${++sequence}`,
            startedAt: new Date().toISOString(), status: 'capturing',
            context: copy({ version, profile, owner, settings: settingsSnapshot, faceIndex, serial: serial === true }),
            boundaries: {
                request: '插件交出请求时的内容；连接信息省略。宿主、服务端及中转站此后的改写不可见。',
                response: '模型可见回复，未移除挑签标签、未净化；普通回复保留可确认的原内容及首尾空白，流式回复记录解析器拼接正文。textSource 标明来源；不采集隐藏 reasoning 或原始网络帧。',
                processed: '插件处理完成后、交给挂载层之前的 HTML；不是宿主渲染或维修后的实时 DOM。',
                mount: '挂载层拿到结果后的去向：挂上了、复用了已有成品，或因为消息已变、找不到消息而没有挂。',
                scope: '仅一次独立 API 请求；多面单请求包含整批，逐面请求只含本次请求对应的一面。',
            },
            request: null, response: null, processed: null, outcome: null,
        };
        if (pin) {
            record.pinned = true;
            current = record;
        }
        recent.push(record);
        // 超出上限时丢最旧的，但钉住的那份不丢。
        while (recent.length > RECENT_LIMIT) {
            // 先丢已经结束的旧记录；同时在记录的（逐面并行）尽量不中途掐掉。
            let drop = recent.findIndex(item => item !== current && item !== record && item.status !== 'capturing');
            if (drop < 0) drop = recent.findIndex(item => item !== current && item !== record);
            if (drop < 0) break;
            live.delete(recent[drop]);
            recent.splice(drop, 1);
        }
        live.add(record);
    } catch { notify(); return null; }
    const observe = fn => {
        if (!live.has(record) || record.status !== 'capturing') return false;
        try { fn(); notify(); return true; }
        catch { record.observationError = true; return false; }
    };
    const handle = {
        request(body, boundary = 'sillytavern-proxy') {
            return observe(() => {
                const value = typeof body === 'string' ? JSON.parse(body) : body;
                record.request = { at: new Date().toISOString(), boundary, body: copy(value) };
            });
        },
        response(result, transport = null, status = null) {
            return observe(() => {
                // Extract only visible content; never copy the payload envelope.
                record.response = { at: new Date().toISOString(), ...completionEvidence(result),
                    partial: result?.partial === true, status, transport: transport ? copy(transport) : null };
            });
        },
        processed(html, detail = {}) {
            return observe(() => {
                record.processed = { at: new Date().toISOString(), html: String(html ?? ''), detail: copy(detail) };
                const variant = roleColorEvidence(html);
                if (variant) record.colorMapping = copy(variant);
            });
        },
        finish(detail = {}) {
            return observe(() => {
                record.outcome = copy(detail);
                record.status = record.request && record.response && record.processed && !record.observationError ? 'complete' : 'incomplete';
                record.finishedAt = new Date().toISOString();
            });
        },
        fail(phase, error, detail = {}) {
            return observe(() => {
                // Provider exception messages can echo credentials. Retain only
                // a stable code and phase; the usual diagnostic owns the error UI.
                const code = String(error?.code || 'UNCLASSIFIED');
                record.outcome = { phase, code: /^[A-Z0-9_-]{1,100}$/.test(code) ? code : 'UNCLASSIFIED', ...copy(detail) };
                record.status = 'failed';
                record.finishedAt = new Date().toISOString();
            });
        },
    };
    notify();
    return handle;
}

// 挂载层按消息号找回那一次的记录（最近一份还没写挂载结果的）。只写本页内存里的那份，不影响任何东西。
export function noteGenerationEvidenceMount(mesid, detail = {}) {
    for (let i = recent.length - 1; i >= 0; i--) {
        const record = recent[i];
        if (String(record?.context?.owner?.mesid ?? '') !== String(mesid) || record.mount) continue;
        try { record.mount = { at: new Date().toISOString(), ...copy(detail) }; notify(); return true; }
        catch { return false; }
    }
    return false;
}

export function associateGenerationEvidence(result, handle) {
    if (handle && result && typeof result === 'object') results.set(result, handle);
}

export function generationEvidenceFor(result) {
    return result && typeof result === 'object' ? results.get(result) || null : null;
}
