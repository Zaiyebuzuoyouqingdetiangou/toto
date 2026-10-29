import { rmT as __rmT } from "./textTable.js?rmv=1.99.11";
export const BACKFILL_GAP_MS = 3000;
export const BACKFILL_BUSY_POLL_MS = 1500;
export const BACKFILL_FAILURE_PAUSE = 3;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export function createBackfillQueue({ run, prepare = null, busy = () => false, onChange = () => { }, gapMs = BACKFILL_GAP_MS, busyPollMs = BACKFILL_BUSY_POLL_MS, failurePause = BACKFILL_FAILURE_PAUSE, wait = sleep, now = () => Date.now(), } = {}) {
    let state = blank();
    let wake = null;
    let loop = null;
    function blank() {
        return { status: 'idle', floors: [], position: 0, current: null, preparing: false, done: [], skipped: [], failed: [], note: '', streak: 0, waiting: false, waitingSince: 0 };
    }
    const snapshot = () => ({
        status: state.status,
        total: state.floors.length,
        position: state.position,
        current: state.current,
        preparing: state.preparing,
        done: [...state.done],
        skipped: state.skipped.map(item => ({ ...item })),
        failed: state.failed.map(item => ({ ...item })),
        note: state.note,
        waiting: state.waiting,
        waitedMs: state.waiting ? Math.max(0, now() - state.waitingSince) : 0,
    });
    const changed = () => { try {
        onChange(snapshot());
    }
    catch { } };
    const nudge = () => { const resolve = wake; wake = null; resolve?.(); };
    const pause = ms => new Promise(resolve => {
        let settled = false;
        const finish = () => { if (!settled) {
            settled = true;
            resolve();
        } };
        wake = finish;
        Promise.resolve(wait(ms)).then(finish, finish);
    });
    const stopping = () => state.status === 'stopping';
    async function drain() {
        while (state.position < state.floors.length) {
            while (state.status === 'paused')
                await new Promise(resolve => { wake = resolve; });
            if (stopping())
                break;
            const floor = state.floors[state.position];
            await waitWhileBusy();
            if (stopping())
                break;
            if (state.status === 'paused')
                continue;
            if (typeof prepare === 'function') {
                state.current = floor;
                state.preparing = true;
                changed();
                try {
                    await prepare(floor, { keepGoing: () => state.status === 'running' });
                }
                catch { }
                state.preparing = false;
                if (stopping())
                    break;
                if (state.status === 'paused') {
                    state.current = null;
                    changed();
                    continue;
                }
                await waitWhileBusy();
            }
            if (stopping())
                break;
            if (state.status === 'paused') {
                state.current = null;
                changed();
                continue;
            }
            state.current = floor;
            changed();
            let result;
            try {
                result = await run(floor);
            }
            catch (error) {
                result = { status: 'failed', message: String(error?.message || error || __rmT("eP6y8dbkGU_")) };
            }
            const status = result?.status;
            if (status === 'stopped') {
                state.note = String(result?.message || __rmT("4RMihIsf"));
                state.status = 'stopping';
                break;
            }
            if (status === 'done') {
                state.done.push(floor);
                state.streak = 0;
            }
            else if (status === 'skipped')
                state.skipped.push({ floor, message: String(result?.message || __rmT("ssqNH705")) });
            else {
                state.failed.push({ floor, message: String(result?.message || __rmT("eP6y8dbkGU_")) });
                state.streak += 1;
            }
            state.position += 1;
            state.current = null;
            const more = state.position < state.floors.length;
            if (more && state.streak >= failurePause && state.status === 'running') {
                state.status = 'paused';
                const last = state.failed[state.failed.length - 1]?.message || '';
                state.note = `${__rmT("DkvvHcc6")}${state.streak}${__rmT("SzW6g6f18MY3JkV7S4idD99mV7CcniyfJ_a38qmiMuOCWKUbBUi27dkqpYY")}${last.slice(0, 160)}${__rmT("8Kg0RiNTDsmR6xpKVSkkeWXZaVTXQs7Nz5nokMZMc_0cWvQX")}`;
                state.streak = 0;
            }
            changed();
            if (more && status !== 'skipped' && !stopping())
                await pause(gapMs);
        }
        state.current = null;
        state.status = stopping() ? 'stopped' : 'finished';
        changed();
    }
    function safeBusy() { try {
        return !!busy();
    }
    catch {
        return false;
    } }
    async function waitWhileBusy() {
        if (state.status !== 'running' || !safeBusy())
            return;
        state.waiting = true;
        state.waitingSince = now();
        changed();
        while (!stopping() && state.status === 'running' && safeBusy()) {
            await pause(busyPollMs);
            changed();
        }
        state.waiting = false;
        changed();
    }
    return {
        start(floors) {
            if (state.status === 'running' || state.status === 'paused' || state.status === 'stopping')
                return false;
            const list = [...new Set((Array.isArray(floors) ? floors : []).map(Number).filter(n => Number.isInteger(n) && n >= 0))].sort((a, b) => a - b);
            if (!list.length)
                return false;
            state = { ...blank(), status: 'running', floors: list };
            changed();
            loop = drain().finally(() => { loop = null; });
            return true;
        },
        pause() {
            if (state.status !== 'running')
                return false;
            state.status = 'paused';
            state.note = '';
            changed();
            nudge();
            return true;
        },
        resume() {
            if (state.status !== 'paused')
                return false;
            state.status = 'running';
            state.note = '';
            state.streak = 0;
            changed();
            nudge();
            return true;
        },
        stop() {
            if (state.status !== 'running' && state.status !== 'paused')
                return false;
            state.status = 'stopping';
            changed();
            nudge();
            return true;
        },
        reset() {
            if (state.status === 'running' || state.status === 'paused' || state.status === 'stopping')
                return false;
            state = blank();
            changed();
            return true;
        },
        snapshot,
        finished: () => loop || Promise.resolve(),
    };
}
export function describeBackfill(view) {
    const s = view || {};
    const label = n => `#${n}`;
    const tally = () => {
        const parts = [`${__rmT("6iV.hUc6")}${s.done?.length || 0}${__rmT("2RdruT")}`];
        if (s.skipped?.length) {
            const reasons = [...new Set(s.skipped.map(item => item.message).filter(Boolean))].slice(0, 3).join(__rmT("7os"));
            parts.push(`${__rmT("4f8cjcc6")}${s.skipped.length}${__rmT("2RdruT")}${reasons ? `${__rmT("eis")}${reasons}${__rmT("eXs")}` : ''}`);
        }
        if (s.failed?.length)
            parts.push(`${__rmT("jXmSEUc6")}${s.failed.length}${__rmT("qGyT0rop")}${s.failed.map(item => label(item.floor)).join(__rmT("jvk"))}`);
        return parts.join(__rmT("Yis"));
    };
    const step = Math.min((s.position || 0) + (s.current != null ? 1 : 0), s.total || 0);
    switch (s.status) {
        case 'running':
            if (s.waiting) {
                const long = (s.waitedMs || 0) > 90000 ? __rmT("z3xeJYY3IqS_pITn3l2ATsnkK8ZiZv8iZT1CKNVMIbSUJw04uW_20n9kydzTrb1uAUEvTtQvKxAPRBUsW_fzRT8omM.YN4YO") : '';
                return `${__rmT("P8w6lFxLRKGK.y35U45pQQrWz.0wPYuFmWB15envF9uxUDlPkhPRoImKwyDrBMaVsYK6yfknJLEUsdcSmjk")}${s.position}/${s.total}${__rmT("N_i_qVKdOoG")}${tally()}${__rmT("jzk")}${long}`;
            }
            if (s.preparing && s.current != null)
                return `${__rmT("cIFOAHcdp6OBTh")}${step}/${s.total}${__rmT("qGyT01Lp")}${label(s.current)}${__rmT("G3BuDnfB_H.qxjyCCO_x0cDd.zq.N4NDG.GoL0bB7F8ujdVZhAGRM9uIguG")}${tally()}${__rmT("jzk")}`;
            return s.current != null
                ? `${__rmT("cIFOAWJlp6OBTh")}${step}/${s.total}${__rmT("qGyT01Lp")}${label(s.current)}${__rmT("Kq5YsV.2")}${tally()}${__rmT("jzk")}` : `${__rmT("iFN6zr2gHKG")}${s.position}/${s.total}${__rmT("tMyTp8bW0K28juFM5zAd2hMKAAeSLyLpCjdBkf")}${tally()}${__rmT("jzk")}`;
        case 'paused':
            return `${s.note ? `${s.note}\n` : __rmT("iFu_FhPQOoG")}${__rmT("QfxY0Uc6")}${s.position}/${s.total}${__rmT("Yis")}${tally()}${__rmT("jzk")}`;
        case 'stopping':
            return `${__rmT("fHMzM1Y9TVJEMIubbTjXG35P6hDHtDpv3CTHdW6N5cjU0Ixxq8_")}${tally()}${__rmT("jzk")}`;
        case 'stopped':
            return `${__rmT("4RMihIsf")}${s.note ? `${__rmT("eis")}${s.note}${__rmT("eXs")}` : ''}${__rmT("Y5Z6zR4jHKG")}${s.position}/${s.total}${__rmT("qGyT01rp")}${tally()}${__rmT("jzk")}`;
        case 'finished':
            return `${__rmT("kijo7AL2MQBYTIK9gPD")}${s.total}${__rmT("qGyT01rp")}${tally()}${__rmT("jzk")}${s.failed?.length ? `${__rmT("Q9OLRX.VM18mkyJo0vOW316ebDjocT")}${String(s.failed[s.failed.length - 1].message || '').slice(0, 160)}${__rmT("ocOl7f17XXMJginlZmKG6Giqg1Zy6bztCZDm6fww9qF9TTPz7kceKtEK5wTfnDs4E0ySU.J5WVOmfY2rKwdGs3Tw_iRe2lHoANA")}` : ''}`;
        default:
            return '';
    }
}
