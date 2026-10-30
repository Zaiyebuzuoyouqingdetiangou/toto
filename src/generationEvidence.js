import { rmT as __rmT } from "./textTable.js?rmv=2.1.4";
import { generationEvidenceTiming } from './generationTiming.js?rmv=2.1.4';
import { roleColorEvidence } from './roleColorVariants.js?rmv=2.1.4';
import { interactionMethodsFromRecord } from './interactionMethodLedger.js?rmv=2.1.4';
const RECENT_LIMIT = 3;
let armed = false;
let current = null;
let recent = [];
const live = new Set();
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
    return JSON.parse(JSON.stringify(value, (key, item) => PRIVATE_KEY.test(key.replace(/[^a-z]/gi, '')) ? __rmT("xKecwJB5pX280_RlKwp4ACfx") : item));
}
function visibleText(value) {
    if (typeof value === 'string')
        return value;
    if (Array.isArray(value))
        return value.map(visibleText).filter(Boolean).join('\n');
    if (!value || typeof value !== 'object' || value.thought === true
        || /^(?:reasoning|reasoning_text|analysis|thinking|thought)$/i.test(String(value.type || '')))
        return '';
    return visibleText(value.text ?? value.content ?? value.output_text ?? value.value);
}
function completionEvidence(result) {
    const parserText = String(result?.text ?? '');
    if (!result?.streamed) {
        const payload = result?.payload, choice = payload?.choices?.[0];
        const candidates = [choice?.message?.content, choice?.text, choice?.delta?.content,
            payload?.output_text, payload?.response, payload?.text, payload?.content,
            payload?.message?.content, payload?.data?.output_text, payload?.data?.content,
            payload?.candidates?.[0]?.content?.parts, payload?.candidates?.[0]?.output,
            payload?.output];
        if (result?.parserFormat === 'text')
            candidates.push(result.raw);
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
    for (const listener of listeners) {
        try {
            listener();
        }
        catch { }
    }
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
    if (current?.status === 'capturing')
        return false;
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
function readVsAttribute(html) {
    const match = String(html || '').match(/data-rm-vs=(["'])([\s\S]*?)\1/);
    if (!match)
        return null;
    const text = match[2].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    try {
        return JSON.parse(text);
    }
    catch {
        return { unparsable: true };
    }
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
    }
    catch {
        const names = [...source.matchAll(/type=["']radio["'][^>]*name=["']([^"']+)|name=["']([^"']+)["'][^>]*type=["']radio/gi)].map(m => m[1] || m[2]);
        const groups = new Map();
        for (const name of names)
            groups.set(name, (groups.get(name) || 0) + 1);
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
    if (!vs)
        return { present: false };
    const pick = Number(vs.pick);
    const candidates = Array.isArray(vs.c) ? vs.c : [];
    const promised = Number.isInteger(pick) && candidates[pick - 1] ? String(candidates[pick - 1][0] || '') : '';
    const observed = observedSkeletonHint(report?.processed?.html || raw);
    const methods = interactionMethodsFromRecord(vs);
    return {
        present: true, pick: Number.isInteger(pick) ? pick : null, promised, methods,
        observed,
        possibleMismatch: observed.hint !== 'other',
        note: __rmT("OqcGDp2DiFQUgIqlj7oQXmlbY23CYzetohSpg1soRgQEOB.OQqU92Zn9zBG"),
    };
}
function exportable(report) {
    return { ...report, vsCheck: vsCheckFor(report), timing: generationEvidenceTiming(report) };
}
export function exportGenerationEvidence() {
    const report = shown();
    return report ? JSON.stringify(exportable(report), null, 2) : '';
}
export function exportRecentGenerationEvidence() {
    if (!recent.length)
        return '';
    return JSON.stringify({ schema: 'rabbitmirror-generation-evidence-recent/1',
        reports: [...recent].reverse().map(exportable) }, null, 2);
}
export function claimGenerationEvidence({ version, profile, owner, settings, faceIndex, serial } = {}) {
    const pin = armed;
    armed = false;
    let record;
    try {
        const settingsSnapshot = {};
        for (const key of SETTINGS_KEYS)
            if (settings?.[key] !== undefined)
                settingsSnapshot[key] = settings[key];
        record = {
            schema: 'rabbitmirror-generation-evidence/1',
            id: `rm-evidence-${Date.now()}-${++sequence}`,
            startedAt: new Date().toISOString(), status: 'capturing',
            context: copy({ version, profile, owner, settings: settingsSnapshot, faceIndex, serial: serial === true }),
            boundaries: {
                request: __rmT("G5E2u6jKO_WoRY2xms2WcdxxUA5euYKnyg8xsB1ImcP0xgrzdhL0JAHGqyMObrvr2hJJL4R.mVD2urWFbPX7adwPrSLT_f2WANA"),
                response: __rmT("ualFRzllOtVutlNgxvWrvAHwJLm0gbY5Dp4V4DX4KgwIgBtYiFij9LxP7CMVy5I9Ha_qQCi4Q4F8vwpux9NgLUOjAPJExnYpyuNHl3lSt03sKWWSK8f5M2zzrK7Y4kN0KnvviNQs8fqrev3cp7.AZMn7ZeMOIMsAn3_4Tel.o44uABD9RfRPYuCo4ZVj5GoeO92lXo8qzuMpp0hLyx11M4N4AZHvr5SyDSr9bsmbkXEQvJsP86_"),
                processed: __rmT("i9Rh5X33U_q4ziotq4ZFV_205Zzs5vgm86Zh53ysCRkRpjgP5WjV0YyZcXbspe8ueUkk8sgKxTDwbZu6387OkLw21XUaNZvva00o_B8Q79s"),
                mount: __rmT("o6S5RD7zYSfjgx5yHQukK1AhId07Yj5d2RMOnPapV7KbEFE.0fgrHSWfr_jy7Kedk0s4KwbjFkrfCHIdnCRXES0Prh1IaDjstVmCZLYlrYt8io_z"),
                scope: __rmT("Xsst5oBk3_LorcCBR9xG22RzS03hwyT7YsziEcEKSy6RK3jZg80i1hB8LSUbdYx0aVXS7H9VLvxcVLjLyOpnmA5NL8z5z8uUYHSItCw9"),
            },
            request: null, response: null, processed: null, outcome: null,
        };
        if (pin) {
            record.pinned = true;
            current = record;
        }
        recent.push(record);
        while (recent.length > RECENT_LIMIT) {
            let drop = recent.findIndex(item => item !== current && item !== record && item.status !== 'capturing');
            if (drop < 0)
                drop = recent.findIndex(item => item !== current && item !== record);
            if (drop < 0)
                break;
            live.delete(recent[drop]);
            recent.splice(drop, 1);
        }
        live.add(record);
    }
    catch {
        notify();
        return null;
    }
    const observe = fn => {
        if (!live.has(record) || record.status !== 'capturing')
            return false;
        try {
            fn();
            notify();
            return true;
        }
        catch {
            record.observationError = true;
            return false;
        }
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
                record.response = { at: new Date().toISOString(), ...completionEvidence(result),
                    partial: result?.partial === true, status, transport: transport ? copy(transport) : null };
            });
        },
        processed(html, detail = {}) {
            return observe(() => {
                record.processed = { at: new Date().toISOString(), html: String(html ?? ''), detail: copy(detail) };
                const variant = roleColorEvidence(html);
                if (variant)
                    record.colorMapping = copy(variant);
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
export function noteGenerationEvidenceMount(mesid, detail = {}) {
    for (let i = recent.length - 1; i >= 0; i--) {
        const record = recent[i];
        if (String(record?.context?.owner?.mesid ?? '') !== String(mesid) || record.mount)
            continue;
        try {
            record.mount = { at: new Date().toISOString(), ...copy(detail) };
            notify();
            return true;
        }
        catch {
            return false;
        }
    }
    return false;
}
export function associateGenerationEvidence(result, handle) {
    if (handle && result && typeof result === 'object')
        results.set(result, handle);
}
export function generationEvidenceFor(result) {
    return result && typeof result === 'object' ? results.get(result) || null : null;
}
