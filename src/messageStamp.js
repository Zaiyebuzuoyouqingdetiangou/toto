export function messageStampSeconds(message, swipe = -1) {
    const info = Array.isArray(message?.swipe_info) && Number.isInteger(swipe) && swipe >= 0 ? message.swipe_info[swipe] : null;
    for (const value of [info?.gen_finished, info?.gen_started, message?.gen_finished, message?.gen_started, message?.send_date]) {
        const seconds = stampSeconds(value);
        if (seconds)
            return seconds;
    }
    return 0;
}
export function stampSeconds(value) {
    if (value === null || value === undefined || value === '')
        return 0;
    let ms = NaN;
    if (value instanceof Date || Object.prototype.toString.call(value) === '[object Date]')
        ms = value.getTime();
    else if (typeof value === 'number')
        ms = value;
    else if (/^\d{10,}$/.test(String(value).trim()))
        ms = Number(String(value).trim());
    else
        ms = Date.parse(String(value));
    return Number.isFinite(ms) && ms > 0 ? Math.floor(ms / 1000) : 0;
}
