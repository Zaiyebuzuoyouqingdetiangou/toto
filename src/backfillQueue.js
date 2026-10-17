// 一键补楼层的排队器：把一串楼层一层一层交给 run() 去生成，不同时发。
// 只管排队、暂停、停止、记账；真正怎么生成、怎么判断成没成由调用方传进来，方便单独测试。
//
// run(floor) 返回 { status: 'done' | 'skipped' | 'failed' | 'stopped', message? }：
//   done    生成好了
//   skipped 这一层不补（已经有兔子镜、不是能补的回复、还没加载到页面上……），message 说为什么；不发请求、不等间隔
//   failed  生成失败（记下来，最后告诉用户哪几层没成）
//   stopped 整个队列都该停了（比如换了聊天）
// busy() 为真时（酒馆正在生成正文、或别的兔子镜请求还在跑）先等着，不插队。
// prepare(floor) 在每层开头先跑（比如把还没加载到页面上的老楼层加载出来，可能要一阵子）；
// 跑完以后才看暂停/停止、等酒馆空下来、再交给 run()，所以准备期间点了暂停，这一层不会发请求。

export const BACKFILL_GAP_MS = 3000;
export const BACKFILL_BUSY_POLL_MS = 1500;
// 连着失败这么多层就自动暂停：多半是接口限流、额度用完或连接断了，继续发只会白白失败。
export const BACKFILL_FAILURE_PAUSE = 3;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function createBackfillQueue({
    run,
    prepare = null,
    busy = () => false,
    onChange = () => {},
    gapMs = BACKFILL_GAP_MS,
    busyPollMs = BACKFILL_BUSY_POLL_MS,
    failurePause = BACKFILL_FAILURE_PAUSE,
    wait = sleep,
    now = () => Date.now(),
} = {}) {
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
    const changed = () => { try { onChange(snapshot()); } catch { /* 界面更新失败不挡排队 */ } };
    const nudge = () => { const resolve = wake; wake = null; resolve?.(); };
    // 等一段时间，暂停/继续/停止时能提前醒。
    const pause = ms => new Promise(resolve => {
        let settled = false;
        const finish = () => { if (!settled) { settled = true; resolve(); } };
        wake = finish;
        Promise.resolve(wait(ms)).then(finish, finish);
    });
    const stopping = () => state.status === 'stopping';

    async function drain() {
        while (state.position < state.floors.length) {
            // 暂停时只等「继续 / 停止」叫醒，不靠计时器空转。
            while (state.status === 'paused') await new Promise(resolve => { wake = resolve; });
            if (stopping()) break;
            const floor = state.floors[state.position];
            if (typeof prepare === 'function') {
                state.current = floor; state.preparing = true; changed();
                try { await prepare(floor); } catch { /* 准备不成，交给 run() 自己判断 */ }
                state.preparing = false;
                if (stopping()) break;
                // 准备期间点了暂停：这一层还没发请求，继续时从这一层重新来。
                if (state.status === 'paused') { state.current = null; changed(); continue; }
            }
            if (state.status === 'running' && safeBusy()) {
                state.waiting = true; state.waitingSince = now(); changed();
                // 每轮都刷新一下界面：等太久时的提示（多少秒以后）要能显示出来。
                while (!stopping() && state.status === 'running' && safeBusy()) { await pause(busyPollMs); changed(); }
                state.waiting = false; changed();
            }
            if (stopping()) break;
            if (state.status === 'paused') { state.current = null; changed(); continue; }
            state.current = floor;
            changed();
            let result;
            try { result = await run(floor); } catch (error) { result = { status: 'failed', message: String(error?.message || error || '生成失败') }; }
            const status = result?.status;
            if (status === 'stopped') { state.note = String(result?.message || '已停止'); state.status = 'stopping'; break; }
            if (status === 'done') { state.done.push(floor); state.streak = 0; }
            else if (status === 'skipped') state.skipped.push({ floor, message: String(result?.message || '不用补') });
            else { state.failed.push({ floor, message: String(result?.message || '生成失败') }); state.streak += 1; }
            state.position += 1;
            state.current = null;
            const more = state.position < state.floors.length;
            if (more && state.streak >= failurePause && state.status === 'running') {
                state.status = 'paused';
                const last = state.failed[state.failed.length - 1]?.message || '';
                state.note = `连着 ${state.streak} 层都没生成成功，先停下了。最后一层的原因：${last.slice(0, 160)}\n看一眼原因，处理好了再点「继续」。`;
                state.streak = 0;
            }
            changed();
            // 只有真的发过请求（成了或失败了）才隔一会儿；跳过的层不用等。
            if (more && status !== 'skipped' && !stopping()) await pause(gapMs);
        }
        state.current = null;
        state.status = stopping() ? 'stopped' : 'finished';
        changed();
    }

    function safeBusy() { try { return !!busy(); } catch { return false; } }

    return {
        start(floors) {
            if (state.status === 'running' || state.status === 'paused' || state.status === 'stopping') return false;
            const list = [...new Set((Array.isArray(floors) ? floors : []).map(Number).filter(n => Number.isInteger(n) && n >= 0))].sort((a, b) => a - b);
            if (!list.length) return false;
            state = { ...blank(), status: 'running', floors: list };
            changed();
            loop = drain().finally(() => { loop = null; });
            return true;
        },
        pause() {
            if (state.status !== 'running') return false;
            state.status = 'paused'; state.note = '';
            changed(); nudge();
            return true;
        },
        resume() {
            if (state.status !== 'paused') return false;
            state.status = 'running'; state.note = ''; state.streak = 0;
            changed(); nudge();
            return true;
        },
        stop() {
            if (state.status !== 'running' && state.status !== 'paused') return false;
            state.status = 'stopping';
            changed(); nudge();
            return true;
        },
        // 跑完或停下以后清掉记录，回到空闲。
        reset() {
            if (state.status === 'running' || state.status === 'paused' || state.status === 'stopping') return false;
            state = blank();
            changed();
            return true;
        },
        snapshot,
        finished: () => loop || Promise.resolve(),
    };
}

/** 进度写成一句话，设置里和提示里都用。 */
export function describeBackfill(view) {
    const s = view || {};
    const label = n => `#${n}`;
    const tally = () => {
        const parts = [`成功 ${s.done?.length || 0} 层`];
        if (s.skipped?.length) {
            const reasons = [...new Set(s.skipped.map(item => item.message).filter(Boolean))].slice(0, 3).join('；');
            parts.push(`跳过 ${s.skipped.length} 层${reasons ? `（${reasons}）` : ''}`);
        }
        if (s.failed?.length) parts.push(`没成 ${s.failed.length} 层：${s.failed.map(item => label(item.floor)).join('、')}`);
        return parts.join('，');
    };
    const step = Math.min((s.position || 0) + (s.current != null ? 1 : 0), s.total || 0);
    switch (s.status) {
        case 'running':
            if (s.waiting) {
                const long = (s.waitedMs || 0) > 90_000 ? '\n已经等了一阵子。如果酒馆其实没在生成，可以点「停止」，刷新页面后再补。' : '';
                return `酒馆正在生成，或者别的兔子镜还在生成，等它结束再接着补（已补 ${s.position}/${s.total} 层）。${tally()}。${long}`;
            }
            if (s.preparing && s.current != null) return `正在把第 ${step}/${s.total} 层（${label(s.current)}）加载到页面上（更早的回复要先加载出来）……${tally()}。`;
            return s.current != null
                ? `正在补第 ${step}/${s.total} 层（${label(s.current)}）……${tally()}。`
                : `已补到 ${s.position}/${s.total} 层，稍等一下再发下一层……${tally()}。`;
        case 'paused':
            return `${s.note ? `${s.note}\n` : '已暂停。'}进度 ${s.position}/${s.total}，${tally()}。`;
        case 'stopping':
            return `正在停下：这一层生成完就不再发下一层。${tally()}。`;
        case 'stopped':
            return `已停止${s.note ? `（${s.note}）` : ''}：补了 ${s.position}/${s.total} 层，${tally()}。`;
        case 'finished':
            return `补完了：一共 ${s.total} 层，${tally()}。${s.failed?.length ? `\n最后没成的那层原因：${String(s.failed[s.failed.length - 1].message || '').slice(0, 160)}\n没成的那几层下面挂着卡，可以单独点卡重新生成，或者再点一次「一键补上」。` : ''}`;
        default:
            return '';
    }
}
