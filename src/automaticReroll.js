import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.3.4";
export const AUTOMATIC_REROLL_DEFAULT = 2;
export const AUTOMATIC_REROLL_MIN = 0;
export const AUTOMATIC_REROLL_IDLE_DEFAULT_SECONDS = 90;
export const AUTOMATIC_REROLL_IDLE_MIN_SECONDS = 1;
export const AUTOMATIC_REROLL_STALL_MS = AUTOMATIC_REROLL_IDLE_DEFAULT_SECONDS * 1000;
export const AUTOMATIC_REROLL_STALL_CODE = 'RABBIT_MIRROR_INDEPENDENT_STALL_TIMEOUT';
export function stallTimeoutError(lastProgressAt = Date.now(), idleSeconds = AUTOMATIC_REROLL_IDLE_DEFAULT_SECONDS) {
    const seconds = normalizeAutomaticRerollIdleSeconds(idleSeconds);
    const error = new Error(`${__rmT("l5Tz7FKkk4nJkBRVgPD")}${seconds}${__rmT(".5dOh94.dEIkQcu9BHIE4DcavstDnnd5YIERX1s4p4Sxn8fkSHZMuEX65g7IgjMPWUE")}`);
    error.name = 'RabbitMirrorIndependentTimeoutError';
    error.code = AUTOMATIC_REROLL_STALL_CODE;
    error.allowAutomaticReroll = true;
    error.lastProgressAt = lastProgressAt;
    error.idleSeconds = seconds;
    return error;
}
export function isAutomaticRerollStall(error) {
    return error?.code === AUTOMATIC_REROLL_STALL_CODE || error?.allowAutomaticReroll === true;
}
export function normalizeAutomaticRerollMax(value) {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n))
        return AUTOMATIC_REROLL_DEFAULT;
    return Math.min(10, Math.max(AUTOMATIC_REROLL_MIN, n));
}
export function automaticRerollEnabled(settings) {
    return settings?.automaticRerollEnabled !== false;
}
export function configuredAutomaticRerollMax(settings) {
    if (!automaticRerollEnabled(settings))
        return 0;
    return normalizeAutomaticRerollMax(settings?.independentAutomaticRerollMax);
}
export function normalizeAutomaticRerollIdleSeconds(value) {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n))
        return AUTOMATIC_REROLL_IDLE_DEFAULT_SECONDS;
    return Math.max(AUTOMATIC_REROLL_IDLE_MIN_SECONDS, n);
}
export function configuredAutomaticRerollIdleMs(settings) {
    return normalizeAutomaticRerollIdleSeconds(settings?.independentAutomaticRerollIdleSeconds) * 1000;
}
export function configuredAutomaticRerollIdleSeconds(settings) {
    return normalizeAutomaticRerollIdleSeconds(settings?.independentAutomaticRerollIdleSeconds);
}
export function isQuotaInsufficientFailure(error, diagnostic = {}) {
    const status = Number(diagnostic?.status ?? error?.status ?? error?.statusCode);
    if (status === 401 || status === 429)
        return false;
    const text = [
        error?.message, error?.code, diagnostic?.semanticFailure, diagnostic?.transportCause,
        diagnostic?.failureCategory, compactErrorBlob(error), compactErrorBlob(diagnostic),
    ].map(value => String(value || '')).join(' ');
    if (__rmR("p5aPr7llsCxi4jJBVaIjQZlnIGeIURdrW38mecXxx9ey5ftvr9QT183ukQn9h3vYLhg4YSxj9btefQfRO2QmVxWlQxrdNoCbxBDrsakAD56aKCnR5gwbNni6NszQM3JGkKf", "i").test(text) && !__rmR("oj3KjBqL.D9kl.Gq7bxkk1wSJcXIEA3rS_vx0WFEgu1HmqeizvTRgu0SPTK6lVsyqKkhb5PCV1i4cq5yjfnCnKiC", "i").test(text)) {
        return false;
    }
    return __rmR("VoEaW2yClQn6R3rC9TOGXyg5HPurZvreMUrvUIIHdZqnAXuBJCZNYZlzNElfyS9kwOmScxUmwo5ZAqnHvfP7jPAbh7FxNxNQTL6f4W1Egi8q4UxOIMyr10u6p3M1uV_3A.udhk5bVLTW1bayhlE4Rnqvfe8SnlPLaRHWp_3er4TYfAWxjT5SLMmXjnwzp.wR35EENVx4sUIv_O_hq1MMREjgEzuEkpzaFBIg2mbWec5G9lpUpdACJq6FwmmUYnY69Z8NRtq9x6wxoW6MPhFqUQDmnHE8mRKXCmZ2lZOLRpFV0dVbHOh1deAVa52b1vDHQJwd7OOKmnMtk5m3lsC9xgeY1CK4GzDvfbEP2_yweskuVRoRc3ssYxiN0_6glUjxxvvu04iEmeK8ky7DUL0gh9LsVP7AIumTMH7t6cJnfXrO_tsNvDH2WHDxGOUTdZxxKh7FXq0bO0bN3kNRy1ZMthfduOX4qgrHCRzS7k", "i").test(text);
}
export function isNonRetryableRequestFailure(error, diagnostic = {}) {
    const status = Number(diagnostic?.transport?.status ?? diagnostic?.status ?? error?.status ?? error?.statusCode ?? 0);
    if ([400, 401, 403, 404, 422, 429].includes(status))
        return true;
    const category = String(diagnostic?.transport?.failureCategory || diagnostic?.failureCategory || '');
    if (category === 'authentication' || category === 'rate-limit')
        return true;
    if (status)
        return false;
    return /\b(?:401|403|429)\b|unauthori[sz]ed|forbidden|invalid[_ -]?api[_ -]?key|incorrect[_ -]?api[_ -]?key|rate[_ -]?limit|too many requests/i
        .test(String(error?.message || ''));
}
export function isLocalPreflightFailure(error, diagnostic = {}) {
    if (Number(diagnostic?.requestCount) === 0 || Number(error?.requestCount) === 0)
        return true;
    const text = `${error?.code || ''} ${diagnostic?.semanticFailure || ''} ${diagnostic?.transportCause || ''} ${diagnostic?.failureCategory || ''}`;
    return /local-preflight|RABBIT_MIRROR_(?:CONTEXT_BOUNDARY|REQUEST_TOO_LARGE|DISPATCH_LEASE|BATCH_PLAN|CONNECTION_PROFILE|ADVANCED_OPTIONS|EXTERNAL_|APPEARANCE_|MEMORY_|STORED_UNRESTORABLE)/i.test(text)
        || /WORLD_BOOK_|MULTIFACE_PLAN_UNAVAILABLE/.test(String(error?.code || ''));
}
export function shouldAutomaticReroll({ enabled = true, manualResay = false, complete = false, failedPosts = 0, max = AUTOMATIC_REROLL_DEFAULT, timedOut = false, cancelled = false, stale = false, preflight = false, quotaInsufficient = false, } = {}) {
    if (manualResay || enabled === false || complete || timedOut || cancelled || stale || preflight || quotaInsufficient)
        return false;
    const total = normalizeAutomaticRerollMax(max);
    if (total <= 0)
        return false;
    const failed = Math.max(0, Number(failedPosts) || 0);
    return failed >= 1 && failed <= total;
}
export function automaticRerollStatusText(attempt = 1, max = AUTOMATIC_REROLL_DEFAULT, missingCount = 0) {
    const total = Math.max(1, normalizeAutomaticRerollMax(max) || AUTOMATIC_REROLL_DEFAULT);
    const current = Math.max(1, Math.min(Number(attempt) || 1, total));
    const missing = Math.max(0, Number(missingCount) || 0);
    const missingNote = missing > 0 ? `${__rmT("7nfr4a5dHKG")}${missing}${__rmT("2RddPk")}` : '';
    return `${__rmT("o1AFSExCK3QIXTNlbfUZngvmcWzISNEMurf")}${current}/${total}${missingNote}${__rmT("Qe3T_llxiAmelXJo_zc1wmwQfuv3jf")}`;
}
export function automaticRerollExhaustedNote(attempts = AUTOMATIC_REROLL_DEFAULT) {
    const total = Math.max(0, normalizeAutomaticRerollMax(attempts));
    if (total <= 0)
        return __rmT("bF8ThDWTzNcLq_8C3f0Id2nl3WaWn5Qs7dvYsdwtX9X.bh");
    return `${__rmT("qMRfqiB_ah34MlBq")}${total}/${total}${__rmT("FZqU4mvxXlNmTOw9EGqQW9ScH5eJRgRNR0JTHVdgFbdOaSQX")}`;
}
export function shouldAnnounceAutomaticRerollExhausted({ complete = false, failedPosts = 0, max = AUTOMATIC_REROLL_DEFAULT, cancelled = false, preflight = false, quotaInsufficient = false, } = {}) {
    if (complete || cancelled || preflight || quotaInsufficient)
        return false;
    const total = normalizeAutomaticRerollMax(max);
    if (total <= 0)
        return false;
    return Math.max(0, Number(failedPosts) || 0) > total;
}
function compactErrorBlob(value) {
    if (!value || typeof value !== 'object')
        return '';
    try {
        return JSON.stringify({
            semanticFailure: value.semanticFailure,
            transportCause: value.transportCause,
            failureCategory: value.failureCategory,
            status: value.status,
            code: value.code,
        });
    }
    catch {
        return '';
    }
}
