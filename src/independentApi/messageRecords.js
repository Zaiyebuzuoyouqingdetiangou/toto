export const MESSAGE_RECORD_KEY = 'rabbitMirror';
export function messageCurrentSwipe(msg) {
    return Number(msg?.swipe_id ?? msg?.swipeId ?? 0) || 0;
}
function extraOfSwipeInfo(msg, swipe) {
    const info = Array.isArray(msg?.swipe_info) ? msg.swipe_info[swipe] : null;
    return info && typeof info === 'object' && info.extra && typeof info.extra === 'object' ? info.extra : null;
}
export function readMessageRecord(msg, swipe = messageCurrentSwipe(msg)) {
    if (!msg || typeof msg !== 'object')
        return undefined;
    const index = Number(swipe);
    if (!Number.isInteger(index) || index < 0)
        return undefined;
    if (index === messageCurrentSwipe(msg)) {
        const own = msg.extra && typeof msg.extra === 'object' ? msg.extra[MESSAGE_RECORD_KEY] : undefined;
        if (own !== undefined)
            return own;
    }
    const extra = extraOfSwipeInfo(msg, index);
    return extra ? extra[MESSAGE_RECORD_KEY] : undefined;
}
export function writeMessageRecord(msg, swipe, value) {
    if (!msg || typeof msg !== 'object')
        return false;
    const index = Number(swipe);
    if (!Number.isInteger(index) || index < 0)
        return false;
    const put = extra => {
        if (value === null || value === undefined)
            delete extra[MESSAGE_RECORD_KEY];
        else
            extra[MESSAGE_RECORD_KEY] = value;
    };
    if (index === messageCurrentSwipe(msg)) {
        if (!msg.extra || typeof msg.extra !== 'object')
            msg.extra = {};
        const own = msg.extra[MESSAGE_RECORD_KEY];
        put(msg.extra);
        const stale = extraOfSwipeInfo(msg, index);
        const copy = stale && stale !== msg.extra ? stale[MESSAGE_RECORD_KEY] : undefined;
        if (copy !== undefined && sameCellBody(copy, value === null || value === undefined ? own : value, value === null || value === undefined))
            put(stale);
        return true;
    }
    const extra = extraOfSwipeInfo(msg, index);
    if (!extra)
        return false;
    put(extra);
    return true;
}
function sameCellBody(copy, value, exact) {
    if (!copy || typeof copy !== 'object' || !value || typeof value !== 'object')
        return false;
    if (exact)
        return JSON.stringify(copy) === JSON.stringify(value);
    return String(copy.sourceHash || '') === String(value.sourceHash || '');
}
export function messageRecordSwipes(msg) {
    if (!msg || typeof msg !== 'object')
        return [];
    const current = messageCurrentSwipe(msg);
    const out = [];
    const seen = new Set();
    const push = (swipe, value) => {
        if (value === undefined || value === null || seen.has(swipe))
            return;
        seen.add(swipe);
        out.push({ swipe, value });
    };
    push(current, readMessageRecord(msg, current));
    const count = Array.isArray(msg.swipe_info) ? msg.swipe_info.length : 0;
    for (let swipe = 0; swipe < count; swipe += 1) {
        if (swipe === current)
            continue;
        push(swipe, readMessageRecord(msg, swipe));
    }
    return out;
}
