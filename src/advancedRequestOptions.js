import { rmT as __rmT } from "./textTable.js?rmv=2.3.5";
export const INDEPENDENT_ADVANCED_ERROR_CODE = 'RABBIT_MIRROR_ADVANCED_OPTIONS_REJECTED';
export const INDEPENDENT_ADVANCED_MAX_CHARS = 8192;
export const INDEPENDENT_REASONING_EFFORTS = Object.freeze(['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']);
export const INDEPENDENT_EXCLUDABLE_PARAMS = Object.freeze(['temperature', 'top_p', 'top_k', 'min_p', 'top_a', 'typical_p', 'frequency_penalty', 'presence_penalty', 'repetition_penalty', 'seed']);
const unit = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
const penalty = value => typeof value === 'number' && Number.isFinite(value) && value >= -2 && value <= 2;
const validators = Object.freeze({
    reasoning_effort: value => typeof value === 'string' && INDEPENDENT_REASONING_EFFORTS.includes(value),
    top_p: unit,
    min_p: unit,
    top_a: unit,
    typical_p: unit,
    top_k: value => Number.isSafeInteger(value) && value >= 0 && value <= 1000000,
    frequency_penalty: penalty,
    presence_penalty: penalty,
    repetition_penalty: value => typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 10,
    seed: value => Number.isSafeInteger(value),
    verbosity: value => typeof value === 'string' && ['low', 'medium', 'high'].includes(value),
});
export function independentAdvancedOptionsError(message = __rmT("10WiWTWgtgDWlrW231AYWJaxnzA9oRGVa8mo67driZAU2kuvsrrJ1K1V3fj3WiEAcyl34HGP")) {
    const error = new TypeError(message);
    error.code = INDEPENDENT_ADVANCED_ERROR_CODE;
    error.requestCount = 0;
    return error;
}
const validatedOptions = new WeakSet();
function result(enabled, body, excludedParams = []) {
    const frozenBody = Object.freeze(body);
    const excluded = Object.freeze(excludedParams);
    const parsed = Object.freeze({ enabled, body: frozenBody, serializedBody: Object.keys(body).length ? JSON.stringify(body) : '',
        excludedParams: excluded, serializedExcluded: excluded.length ? JSON.stringify(excluded) : '' });
    validatedOptions.add(parsed);
    return parsed;
}
export function parseIndependentAdvancedOptions(settings = {}) {
    if (settings?.independentAdvancedEnabled !== true)
        return result(false, {});
    const excludedInput = settings.independentExcludedParams === undefined ? [] : settings.independentExcludedParams;
    if (!Array.isArray(excludedInput) || excludedInput.length > INDEPENDENT_EXCLUDABLE_PARAMS.length
        || Array.from(excludedInput).some(key => typeof key !== 'string' || !INDEPENDENT_EXCLUDABLE_PARAMS.includes(key))) {
        throw independentAdvancedOptionsError(__rmT("mlBz2yrg0ofOCGb7qpPuZDfeVsj_cxUPs63sORXEeE2YgQNiPZf3HwD.fk0QIckDvOedpVKiNJFyI2VmokMV7nf1mxMmPL7Kpf9oc3AnHhjyAwDHcrdkG.mgkfXIS1uNjdMt2.AYgUZzZh"));
    }
    const excludedParams = [...new Set(excludedInput)].sort();
    const raw = settings.independentExtraParams ?? '';
    const effort = settings.independentReasoningEffort ?? '';
    if (typeof raw !== 'string' || typeof effort !== 'string') {
        throw independentAdvancedOptionsError(__rmT("pLSaARsKjGcvT287illJq4Ru8KC2w.3qc2eAthEB8Huc10E9zDrXj4P8dI3fUldafqFnxC0eHogotqVvqAk"));
    }
    if (raw.length > INDEPENDENT_ADVANCED_MAX_CHARS || new TextEncoder().encode(raw).byteLength > INDEPENDENT_ADVANCED_MAX_CHARS) {
        throw independentAdvancedOptionsError(__rmT("UNCVToBo6puqbBNTrtpJRUCpbaSTByyY9nJgkktJQZKPMGVBJAx0Gk2l1sYwp8vufVaUGyzuer5bs0ehVQQc5kBb4g436LlooehFdEjTFMX8.i_z"));
    }
    if (effort && !INDEPENDENT_REASONING_EFFORTS.includes(effort)) {
        throw independentAdvancedOptionsError(__rmT(".s1HJpxxaZ2R40NWMxusFKOO1lhV3w6lq8YmCuOr9zy15ex_HE_L.3.0I_W1M1Ad83KY3h"));
    }
    let input = {};
    try {
        if (raw.trim())
            input = JSON.parse(raw);
    }
    catch {
        throw independentAdvancedOptionsError(__rmT("AwtpXo3Pag_VBnkBeMxsXcGfNrnWY9l5ucdK0j1tL_ENb.aXo3iJZ0x3kAi9tncmGn3BhqaJuSvagBlhrCG1yhmy.gCuzBaV7YBYXCw9"));
    }
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.getPrototypeOf(input) !== Object.prototype) {
        throw independentAdvancedOptionsError(__rmT("OgQ3XslpAPCbY26.sd4sEsgmchqyvZWG86fiqyeayskRpj4Pvjj10YrZ6IhDII45Fbfa8TAnyTRQoOu6dtwGlg0aUKzh4rJvM50K_NsQ79s"));
    }
    const keys = Object.keys(input);
    if (keys.length > 12)
        throw independentAdvancedOptionsError(__rmT("cHxYmFy95QaneCZ.X0l1SWyEE4HRE8vqbwYmLbTabAO3cvy6BBn.MizogCW6z4nHveYSSFSMrmxbzlH9"));
    const body = {};
    for (const key of keys.sort()) {
        if (!Object.prototype.hasOwnProperty.call(validators, key)) {
            throw independentAdvancedOptionsError(__rmT("ba1ho8qOjydivPV8r8AJg6dUhDSW1YyESXmr7V21eTTqC1chXfnVClOao_P4UAwnpRukFkNQPNLi5A0cL1YR823BCcx8lhEvvoCLRf"));
        }
        if (!validators[key](input[key])) {
            throw independentAdvancedOptionsError(__rmT("REeNODVzy3lZbyN4RSDBtUgmw0VFAOwoiUI.zw6gkneTpL1K77eSRlUaWW4qbwCegzCB6V2aXZZ9rxsLPfkFrh"));
        }
        body[key] = input[key];
    }
    if (effort && Object.prototype.hasOwnProperty.call(body, 'reasoning_effort') && body.reasoning_effort !== effort) {
        throw independentAdvancedOptionsError(__rmT("3iWKakQS9KXLdJHwl6DVn30KgoLfEfNFlhKw97FtPTYONTmrbJFTiUWH1fDQVluHC1O92HD0tSYPef.LyxIXH7_DjJ7LSUofWeN_yjyceEo2Y9rro5Gb4qQaeomSKZFJARSOvT"));
    }
    if (effort)
        body.reasoning_effort = effort;
    for (const key of excludedParams)
        delete body[key];
    return result(true, body, excludedParams);
}
export function applyIndependentAdvancedExclusions(body, parsed) {
    if (!validatedOptions.has(parsed))
        throw independentAdvancedOptionsError(__rmT("10WiWTWgtgDWlrW231AYWJaxnzA9oIk1SjGzW_Q9VsPOBcQvnyICJssw8oUSEinT6wdJMuGP"));
    if (!parsed.excludedParams.length)
        return body;
    const output = { ...body };
    for (const key of parsed.excludedParams)
        delete output[key];
    return output;
}
export function buildIndependentAdvancedCarrier(parsed, { source = '', apiFormat = '' } = {}) {
    if (!validatedOptions.has(parsed))
        throw independentAdvancedOptionsError(__rmT("10WiWTWgtgDWlrW231AYWJaxnzA9oIk1SjGzW_Q9VsPOBcQvnyICJssw8oUSEinT6wdJMuGP"));
    if (!parsed.serializedBody && !parsed.serializedExcluded)
        return {};
    if (source !== 'custom' || !['', 'openai_compat'].includes(String(apiFormat ?? '').trim())) {
        throw independentAdvancedOptionsError(__rmT("6mXm8DvrJf4runvONXv3zclN1NdKZ3BlXT.vmZnslv0I8RAeGUV51UsXMTVjPNgET_uyPWAiAEscfpQN1S7tso7_XR2Xt9V5L6mRY5dZmZX1bk2BcHZQcOonahpwCDljZEYxPkofDPplN2bFq7CdNJpxXm2NNXVjvuC9xEt6ApFCO1LeT1Jx_Gk5xMJ_8bMJY5kVkVae8.zOMhNGcPgNxHsqumM7t7mlWRUAn.T8ZO1ULPJqb7N3c_6_rz8EWky6393KywiS"));
    }
    return { ...(parsed.serializedBody ? { custom_include_body: parsed.serializedBody } : {}),
        ...(parsed.serializedExcluded ? { custom_exclude_body: parsed.serializedExcluded } : {}) };
}
let previousKeyInput = null;
let previousKey = '';
export function independentAdvancedOptionsSignature(settings = {}) {
    if (settings?.independentAdvancedEnabled !== true)
        return '';
    const effort = typeof settings.independentReasoningEffort === 'string' ? settings.independentReasoningEffort : '!invalid-type';
    const raw = typeof settings.independentExtraParams === 'string' ? settings.independentExtraParams : settings.independentExtraParams == null ? '' : '!invalid-type';
    const excluded = settings.independentExcludedParams;
    const excludedKey = excluded === undefined || (Array.isArray(excluded) && excluded.length === 0) ? ''
        : Array.isArray(excluded) ? JSON.stringify([...new Set(excluded.slice(0, 11).map(value => typeof value === 'string' ? value.slice(0, 64) : `!${typeof value}`))].sort()) + (excluded.length > 10 ? `!length:${excluded.length}` : '')
            : '!invalid-exclusions';
    if (!effort && !excludedKey && raw.length <= 8192 && (!raw.trim() || /^\{\s*\}$/.test(raw)))
        return '';
    if (previousKeyInput?.effort === effort && previousKeyInput?.raw === raw && previousKeyInput?.excludedKey === excludedKey)
        return previousKey;
    const text = JSON.stringify([effort.slice(0, 64), raw.slice(0, 8193), raw.length, ...(excludedKey ? [excludedKey] : [])]);
    let first = 2166136261;
    let second = 5381;
    for (let i = 0; i < text.length; i += 1) {
        first = Math.imul(first ^ text.charCodeAt(i), 16777619);
        second = Math.imul(second, 33) ^ text.charCodeAt(i);
    }
    previousKey = `${(first >>> 0).toString(36)}-${(second >>> 0).toString(36)}`;
    previousKeyInput = raw.length <= 8192 && effort.length <= 64 ? { effort, raw, excludedKey } : null;
    return previousKey;
}
