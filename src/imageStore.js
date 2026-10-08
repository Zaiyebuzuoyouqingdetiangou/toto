const PREFIX = 'rabbitMirror:image:v1:';

function storageKey(key, kind) {
    if (typeof key !== 'string' || !key) throw new TypeError('图片必须绑定到明确的聊天与镜面。');
    return `${PREFIX}${kind}:${key}`;
}

function read(key, kind) {
    const text = globalThis.localStorage.getItem(storageKey(key, kind));
    return text == null ? null : JSON.parse(text);
}

function write(key, kind, value) {
    // A single atomic setItem: a quota/error leaves the entire old record intact.
    globalThis.localStorage.setItem(storageKey(key, kind), JSON.stringify(value));
}

function storedRecord(record) {
    if (!record || typeof record !== 'object') throw new TypeError('缺少要保存的图片。');
    const { history: ignoredHistory, ...copy } = record;
    const url = copy.path || copy.url || copy.dataUrl;
    if (typeof url !== 'string' || !url) throw new TypeError('图片没有可保存的地址。');
    copy.url = url;
    // Durable provider files do not require duplicating their large base64 payload.
    if (copy.path) delete copy.dataUrl;
    return copy;
}

export function loadMirrorImage(key) {
    const data = read(key, 'images');
    if (data == null) return null;
    if (data.version !== 1 || !data.current || !Array.isArray(data.history)) throw new TypeError('图片存档格式无法识别，原存档已保留。');
    return { ...data.current, history: data.history };
}

export function saveMirrorImage(key, record) {
    const previous = loadMirrorImage(key);
    const current = storedRecord(record);
    const history = previous ? [...previous.history, storedRecord(previous)] : [];
    write(key, 'images', { version: 1, current, history });
    return { ...current, history };
}

export function loadMirrorImageDraft(key) { return read(key, 'draft'); }

export function saveMirrorImageDraft(key, draft) {
    if (!draft || typeof draft !== 'object' || Array.isArray(draft)) throw new TypeError('提示词草稿必须是对象。');
    write(key, 'draft', draft);
    return draft;
}

// 删楼层／删 swipe 后，把这个聊天的插图存档（内置生图与手动生图，含提示词草稿）搬到新楼层号。
// mapper(楼层, swipe) 返回 "新楼层:新swipe"，被删掉的返回 null：那几层的图原样留在本机，不删。
// 目标位置已经有别的存档时不覆盖，那一张留在原处。
export function remapMirrorImageSlots(chat, mapper) {
    const storage = globalThis.localStorage;
    if (!storage || typeof chat !== 'string' || !chat || typeof mapper !== 'function') return 0;
    const builtinPrefix = `builtin:${chat}:`;
    const target = (index, swipe) => {
        const value = mapper(index, swipe);
        const match = /^(\d+):(\d+)$/.exec(String(value ?? ''));
        return match ? [Number(match[1]), Number(match[2])] : null;
    };
    const moves = [];
    for (let i = 0; i < storage.length; i += 1) {
        const full = storage.key(i);
        if (!full || !full.startsWith(PREFIX)) continue;
        const rest = full.slice(PREFIX.length);
        const colon = rest.indexOf(':');
        if (colon < 0) continue;
        const kind = rest.slice(0, colon), key = rest.slice(colon + 1);
        if (kind !== 'images' && kind !== 'draft') continue;
        let next = '';
        if (key.startsWith(builtinPrefix)) {
            const match = /^(\d+):(\d+):(.+)$/.exec(key.slice(builtinPrefix.length));
            const moved = match && target(Number(match[1]), Number(match[2]));
            if (!moved) continue;
            next = `${builtinPrefix}${moved[0]}:${moved[1]}:${match[3]}`;
        } else if (key.startsWith('[')) {
            let parts;
            try { parts = JSON.parse(key); } catch { continue; }
            if (!Array.isArray(parts) || parts[0] !== chat || !Number.isInteger(parts[1]) || !Number.isInteger(parts[2])) continue;
            const moved = target(parts[1], parts[2]);
            if (!moved) continue;
            next = JSON.stringify([parts[0], moved[0], moved[1], ...parts.slice(3)]);
        } else continue;
        if (next !== key) moves.push({ from: full, to: `${PREFIX}${kind}:${next}` });
    }
    if (!moves.length) return 0;
    // 两张图搬到同一个位置时都不搬；目标被一个不搬走的存档占着时也不搬。反复筛到稳定为止。
    const count = new Map();
    for (const move of moves) count.set(move.to, (count.get(move.to) || 0) + 1);
    let plan = moves.filter(move => count.get(move.to) === 1);
    for (let changed = true; changed;) {
        const leaving = new Set(plan.map(move => move.from));
        const kept = plan.filter(move => storage.getItem(move.to) == null || leaving.has(move.to));
        changed = kept.length !== plan.length;
        plan = kept;
    }
    const values = plan.map(move => ({ ...move, value: storage.getItem(move.from) })).filter(move => move.value != null);
    for (const move of values) storage.removeItem(move.from);
    let moved = 0;
    for (const move of values) {
        try { storage.setItem(move.to, move.value); moved += 1; }
        catch { try { storage.setItem(move.from, move.value); } catch { /* 原位也写不回时只能放弃这一张 */ } }
    }
    return moved;
}
