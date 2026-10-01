// Display/diagnostic metadata only. No prompts, timers, storage or requests.
export function createGenerationTimer() {
    let readClock = () => Date.now();
    try {
        if (typeof globalThis.performance?.now === 'function') {
            readClock = globalThis.performance.now.bind(globalThis.performance);
        }
    } catch { /* Date fallback for older hosts. */ }
    const read = () => {
        try { const value = readClock(); return Number.isFinite(value) ? value : null; }
        catch { return null; }
    };
    let started = null, elapsed = null, finished = false;
    return {
        start() { if (started === null && !finished) started = read(); },
        finish() {
            if (started === null) return null;
            if (!finished) {
                finished = true;
                const ended = read();
                elapsed = ended !== null && ended >= started ? Math.round(ended - started) : null;
                if (!Number.isSafeInteger(elapsed)) elapsed = null;
            }
            return elapsed;
        },
    };
}

export function formatGenerationElapsed(ms) {
    if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) return '未记录';
    return ms < 100 ? `${Math.round(ms)} 毫秒` : `${(ms / 1000).toFixed(1)} 秒`;
}

export function generationEvidenceTiming(record) {
    const between = (start, end) => {
        if (typeof start !== 'string' || typeof end !== 'string') return null;
        const a = Date.parse(start), b = Date.parse(end);
        return Number.isFinite(a) && Number.isFinite(b) && b >= a ? b - a : null;
    };
    return {
        requestToResponseMs: between(record?.request?.at, record?.response?.at),
        responseToProcessedMs: between(record?.response?.at, record?.processed?.at),
        totalMs: between(record?.startedAt, record?.finishedAt),
    };
}
