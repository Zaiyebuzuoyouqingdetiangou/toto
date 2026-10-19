// 设置 →「缺壳扫描」下面的「一键补上」：把扫描范围里没有兔子镜的回复排好队，一层一层生成。
// 队列只有一份，挂在这个模块上；设置界面关掉、重画都不影响正在补的队伍，重新打开时接着显示进度。

import { createBackfillQueue, describeBackfill } from '../backfillQueue.js?rmv=1.71.2';

let queue = null;
let deps = null;
let lastToast = '';
// 开始补的那条聊天：换了聊天就停，不往别的聊天里补。放在模块上，设置界面重画也不丢。
let backfillChat = '';
// 开始时记下的每层身份（楼层号 → 身份），补之前对一下，中途删过楼层就不补挪过来的那层。
let backfillTokens = new Map();

function panelParts(doc = globalThis.document) {
    const box = doc?.getElementById?.('rh_backfill');
    if (!box) return null;
    const pick = name => box.querySelector(`[data-rh-backfill="${name}"]`);
    return {
        box,
        start: pick('start'), confirm: pick('confirm'), confirmText: pick('confirm-text'), go: pick('go'), cancel: pick('cancel'),
        status: pick('status'), pause: pick('pause'), resume: pick('resume'), stop: pick('stop'), clear: pick('clear'),
    };
}

function render(view = queue?.snapshot()) {
    const parts = panelParts();
    if (!parts || !view) return;
    const active = view.status === 'running' || view.status === 'paused' || view.status === 'stopping';
    const ended = view.status === 'finished' || view.status === 'stopped';
    parts.start.hidden = active;
    if (active) parts.confirm.hidden = true;
    parts.pause.hidden = view.status !== 'running';
    parts.resume.hidden = view.status !== 'paused';
    parts.stop.hidden = !(view.status === 'running' || view.status === 'paused');
    parts.clear.hidden = !ended;
    const text = describeBackfill(view);
    parts.status.hidden = !text;
    parts.status.textContent = text;
}

function toastFor(view) {
    const toastr = globalThis.toastr;
    if (!toastr) return;
    // 同一件事只提示一次；进行中的每一层不弹，免得刷屏。
    const key = `${view.status}:${view.position}:${view.note}`;
    if (key === lastToast) return;
    if (view.status === 'finished') toastr[view.failed.length ? 'warning' : 'success']?.(describeBackfill(view), '一键补楼层');
    else if (view.status === 'stopped') toastr.info?.(describeBackfill(view), '一键补楼层');
    else if (view.status === 'paused' && view.note) toastr.warning?.(view.note, '一键补楼层');
    else return;
    lastToast = key;
}

function ensureQueue() {
    if (queue) return queue;
    queue = createBackfillQueue({
        run: floor => deps.run(floor),
        prepare: (floor, opts) => deps.prepare(floor, opts),
        busy: () => deps.busy(),
        onChange: view => { render(view); toastFor(view); },
    });
    return queue;
}

/**
 * 把按钮接到设置界面上。每次设置界面重画后调用一次即可。
 * options:
 *   list()     → { floors:[{index, mounted}], range } 现在扫描范围里没有兔子镜的楼层（mounted：已经加载到页面上）
 *   prepare(floor, chat, { keepGoing }) → Promise 每层开头先把还没加载到页面上的那一层加载出来；keepGoing() 变假（暂停、停止）就别再加载
 *   generate(floor, chat, token) → Promise<{status,message}>
 *   floorToken(floor) → 这一层回复的身份
 *   busy()     → 酒馆或别的兔子镜请求正在跑
 *   chatKey()  → 当前聊天
 *   faceCount()→ 每层几面
 *   available()→ { ok, message } 现在能不能补（比如不是独立 API）
 *   afterList(listed) 扫描完顺便刷新设置里的缺壳报告
 */
export function mountBackfillControls(options) {
    deps = {
        run: floor => options.generate(floor, backfillChat, backfillTokens.get(floor) || ''),
        prepare: (floor, opts) => options.prepare?.(floor, backfillChat, { ...opts, token: backfillTokens.get(floor) || '' }),
        busy: () => options.busy(),
    };
    const q = ensureQueue();
    const parts = panelParts();
    if (!parts || parts.box.dataset.rhBackfillBound === 'true') { render(); return; }
    parts.box.dataset.rhBackfillBound = 'true';
    let pending = [];
    let pendingChat = '';
    let pendingTokens = new Map();
    parts.start.addEventListener('click', event => {
        event.preventDefault();
        const ready = options.available?.() || { ok: true };
        if (!ready.ok) { parts.confirm.hidden = true; parts.status.hidden = false; parts.status.textContent = ready.message; return; }
        let listed;
        try { listed = options.list(); } catch { listed = { floors: [] }; }
        try { options.afterList?.(listed); } catch { /* 报告刷新失败不挡 */ }
        pendingChat = String(options.chatKey?.() || '');
        const all = (listed?.floors || []).filter(item => Number.isInteger(Number(item?.index ?? item)) && Number(item?.index ?? item) >= 0);
        // 还没加载到页面上的老楼层也排进来：补到那一层时先自动加载出来（和点「显示更多消息」一样）。
        const unloaded = all.filter(item => item && typeof item === 'object' && item.mounted === false).length;
        pending = all.map(item => Number(item?.index ?? item));
        // 楼层身份在数的时候就记下：问完到点确定之间删了楼层，挪过来的那层也认得出来。
        pendingTokens = new Map(pending.map(floor => [floor, String(options.floorToken?.(floor) || '')]));
        const unloadedNote = unloaded ? `其中 ${unloaded} 层是更早的回复，还没加载到页面上，补到时会先在聊天里把它们加载出来（楼层很多时，手机上可能会卡一会儿）。` : '';
        if (!pending.length) {
            parts.confirm.hidden = true;
            parts.status.hidden = false;
            parts.status.textContent = '扫描范围里每一层都有兔子镜，没有要补的。想补更早的楼层，把「缺壳扫描范围」改成「全部助手回复」再点。';
            return;
        }
        const faces = Math.max(1, Number(options.faceCount?.()) || 1);
        const many = pending.length > 30 ? '楼层比较多，可以先把扫描范围改小试几层。' : '';
        parts.confirmText.textContent = `要给 ${pending.length} 层回复各生成一次兔子镜（每层 ${faces} 面），会从最早那层开始依次发出至少 ${pending.length} 次独立 API 请求，楼多的话比较花钱。每层之间隔几秒，可以随时暂停或停止。${many}${unloadedNote}`;
        parts.confirm.hidden = false;
        parts.status.hidden = true;
    });
    parts.cancel.addEventListener('click', event => { event.preventDefault(); parts.confirm.hidden = true; pending = []; pendingChat = ''; render(); });
    parts.go.addEventListener('click', event => {
        event.preventDefault();
        parts.confirm.hidden = true;
        const ready = options.available?.() || { ok: true };
        if (!ready.ok) { parts.status.hidden = false; parts.status.textContent = ready.message; return; }
        // 问的时候和点确定的时候不是同一个聊天：不能拿上一个聊天的楼层号来补这个聊天，重新数一遍。
        const chatNow = String(options.chatKey?.() || '');
        if (chatNow !== pendingChat) {
            pending = []; pendingChat = '';
            parts.status.hidden = false;
            parts.status.textContent = '聊天换了，刚才数的楼层不算数。请再点一次「一键补上」重新数。';
            return;
        }
        backfillChat = chatNow;
        backfillTokens = pendingTokens;
        pendingTokens = new Map();
        lastToast = '';
        if (!q.start(pending)) render();
        pending = []; pendingChat = '';
    });
    parts.pause.addEventListener('click', event => { event.preventDefault(); q.pause(); });
    parts.resume.addEventListener('click', event => { event.preventDefault(); q.resume(); });
    parts.stop.addEventListener('click', event => { event.preventDefault(); q.stop(); });
    parts.clear.addEventListener('click', event => { event.preventDefault(); q.reset(); });
    render();
}

/** 停用兔子镜时：正在补的停下（这一层发出去的请求照常收尾，不再发下一层）。 */
export function stopBackfill() {
    try { queue?.stop(); } catch { /* 没有在补 */ }
}

export function backfillSnapshot() {
    return queue?.snapshot() || null;
}
