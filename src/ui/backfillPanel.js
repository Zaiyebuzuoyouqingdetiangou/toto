import { rmT as __rmT } from "../textTable.js?rmv=2.0.1";
import { createBackfillQueue, describeBackfill } from '../backfillQueue.js?rmv=2.0.1';
let queue = null;
let deps = null;
let lastToast = '';
let backfillChat = '';
let backfillTokens = new Map();
function panelParts(doc = globalThis.document) {
    const box = doc?.getElementById?.('rh_backfill');
    if (!box)
        return null;
    const pick = name => box.querySelector(`[data-rh-backfill="${name}"]`);
    return {
        box,
        start: pick('start'), confirm: pick('confirm'), confirmText: pick('confirm-text'), go: pick('go'), cancel: pick('cancel'),
        status: pick('status'), pause: pick('pause'), resume: pick('resume'), stop: pick('stop'), clear: pick('clear'),
    };
}
function render(view = queue?.snapshot()) {
    const parts = panelParts();
    if (!parts || !view)
        return;
    const active = view.status === 'running' || view.status === 'paused' || view.status === 'stopping';
    const ended = view.status === 'finished' || view.status === 'stopped';
    parts.start.hidden = active;
    if (active)
        parts.confirm.hidden = true;
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
    if (!toastr)
        return;
    const key = `${view.status}:${view.position}:${view.note}`;
    if (key === lastToast)
        return;
    if (view.status === 'finished')
        toastr[view.failed.length ? 'warning' : 'success']?.(describeBackfill(view), __rmT(".5.Wp1JlfMGMWh"));
    else if (view.status === 'stopped')
        toastr.info?.(describeBackfill(view), __rmT(".5.Wp1JlfMGMWh"));
    else if (view.status === 'paused' && view.note)
        toastr.warning?.(view.note, __rmT(".5.Wp1JlfMGMWh"));
    else
        return;
    lastToast = key;
}
function ensureQueue() {
    if (queue)
        return queue;
    queue = createBackfillQueue({
        run: floor => deps.run(floor),
        prepare: (floor, opts) => deps.prepare(floor, opts),
        busy: () => deps.busy(),
        onChange: view => { render(view); toastFor(view); },
    });
    return queue;
}
export function mountBackfillControls(options) {
    deps = {
        run: floor => options.generate(floor, backfillChat, backfillTokens.get(floor) || ''),
        prepare: (floor, opts) => options.prepare?.(floor, backfillChat, { ...opts, token: backfillTokens.get(floor) || '' }),
        busy: () => options.busy(),
    };
    const q = ensureQueue();
    const parts = panelParts();
    if (!parts || parts.box.dataset.rhBackfillBound === 'true') {
        render();
        return;
    }
    parts.box.dataset.rhBackfillBound = 'true';
    let pending = [];
    let pendingChat = '';
    let pendingTokens = new Map();
    parts.start.addEventListener('click', event => {
        event.preventDefault();
        const ready = options.available?.() || { ok: true };
        if (!ready.ok) {
            parts.confirm.hidden = true;
            parts.status.hidden = false;
            parts.status.textContent = ready.message;
            return;
        }
        let listed;
        try {
            listed = options.list();
        }
        catch {
            listed = { floors: [] };
        }
        try {
            options.afterList?.(listed);
        }
        catch { }
        pendingChat = String(options.chatKey?.() || '');
        const all = (listed?.floors || []).filter(item => Number.isInteger(Number(item?.index ?? item)) && Number(item?.index ?? item) >= 0);
        const unloaded = all.filter(item => item && typeof item === 'object' && item.mounted === false).length;
        pending = all.map(item => Number(item?.index ?? item));
        pendingTokens = new Map(pending.map(floor => [floor, String(options.floorToken?.(floor) || '')]));
        const unloadedNote = unloaded ? `${__rmT("SRgbWUc6")}${unloaded}${__rmT("n9YCHhUsniGJH1tzxAywSNol8zKsag7.aa.OdzFzBTHPzBA4GzfazTCrHs_nR75QJtuQtugtTMurzeTIi53mPsKd5WWBYWlYRUu8Si3JLSMZi6O6PayVE5rGDhkXHkVPiqqS_gYoCEzzZh")}` : '';
        if (!pending.length) {
            parts.confirm.hidden = true;
            parts.status.hidden = false;
            parts.status.textContent = __rmT(".ohA55iXX33Y7vrZCMFWpLK.38Jg8I0SnHHyr4.eOdgZ8hKyd3hISELQVG9Y_Cpl_TFQI6emeRP1RaOd_amFmex9Du2Y_6hFuXct46MBk8g5n27BqH3z4KRwbt097NReWZdOvT");
            return;
        }
        const faces = Math.max(1, Number(options.faceCount?.()) || 1);
        const many = pending.length > 30 ? __rmT("EgYn.eVU4tLtlfTn5Pt84t.96iSJzRPAZKrWKvx5wcfjvytLWkhr7f") : '';
        parts.confirmText.textContent = `${__rmT("bTGPPUc6")}${pending.length}${__rmT("RN_p4hlGkBpLhLqdIyPm46NJltU06FkZsYP6q5944g8")}${faces}${__rmT("kbjDJzzVxXyELkrobvxedrkyw4vUy1EqFCaVG16NtCGLfAKxm2_")}${pending.length}${__rmT("1GpiMzEuYEccBnhBQMxx23Hzj25eLMJzRVNiE6q_k42iV7fxdcUAqWI.6zk7yOoKnUqIL5S8BTuZw92Sm07P8w0nDgc6I77x4GNITCw9")}${many}${unloadedNote}`;
        parts.confirm.hidden = false;
        parts.status.hidden = true;
    });
    parts.cancel.addEventListener('click', event => { event.preventDefault(); parts.confirm.hidden = true; pending = []; pendingChat = ''; render(); });
    parts.go.addEventListener('click', event => {
        event.preventDefault();
        parts.confirm.hidden = true;
        const ready = options.available?.() || { ok: true };
        if (!ready.ok) {
            parts.status.hidden = false;
            parts.status.textContent = ready.message;
            return;
        }
        const chatNow = String(options.chatKey?.() || '');
        if (chatNow !== pendingChat) {
            pending = [];
            pendingChat = '';
            parts.status.hidden = false;
            parts.status.textContent = __rmT("_rMaqR1QzKtt97bmUcp5oeoD4hImS.NSjyLDEX7bC55f8BzZDQ.AzEvi1TbWWjVOMeYT5CeQN_HbzlH9");
            return;
        }
        backfillChat = chatNow;
        backfillTokens = pendingTokens;
        pendingTokens = new Map();
        lastToast = '';
        if (!q.start(pending))
            render();
        pending = [];
        pendingChat = '';
    });
    parts.pause.addEventListener('click', event => { event.preventDefault(); q.pause(); });
    parts.resume.addEventListener('click', event => { event.preventDefault(); q.resume(); });
    parts.stop.addEventListener('click', event => { event.preventDefault(); q.stop(); });
    parts.clear.addEventListener('click', event => { event.preventDefault(); q.reset(); });
    render();
}
export function stopBackfill() {
    try {
        queue?.stop();
    }
    catch { }
}
export function backfillSnapshot() {
    return queue?.snapshot() || null;
}
