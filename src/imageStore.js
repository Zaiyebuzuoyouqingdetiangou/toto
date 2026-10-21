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
    // 旧版本只留最近 4 张；整张图存在本机（data:）的旧版本只留最近一张，免得重画几次就把本机空间占满。
    const history = (previous ? [...previous.history, storedRecord(previous)] : [])
        .slice(-4)
        .filter((entry, index, list) => index === list.length - 1 || !String(entry?.url || '').startsWith('data:'))
        .map((entry, index, list) => {
            if (index === list.length - 1 || !entry || typeof entry !== 'object') return entry;
            const { dataUrl: ignoredDataUrl, ...rest } = entry;
            return rest;
        });
    write(key, 'images', { version: 1, current, history });
    return { ...current, history };
}

// 聊天开了分支或改了名，聊天名变了，画好的图还存在旧名字下。同一楼层、同一 swipe、同一图框、
// 同一段提示词的图就是那一张：找到就直接放回，不再花钱重画。只读，不搬也不删。
export function findBuiltinImageKeyFromOtherChat(key) {
    const storage = globalThis.localStorage;
    const parts = String(key || '').split(':');
    if (!storage || parts[0] !== 'builtin' || parts.length < 6 || !parts[parts.length - 1]) return '';
    const suffix = `:${parts.slice(-4).join(':')}`;
    const imagesPrefix = `${PREFIX}images:`;
    const head = `${imagesPrefix}builtin:`;
    const own = storageKey(key, 'images');
    try {
        for (let i = 0; i < storage.length; i += 1) {
            const name = storage.key(i);
            if (!name || name === own || !name.startsWith(head) || !name.endsWith(suffix)) continue;
            return name.slice(imagesPrefix.length);
        }
    } catch { /* 读不到就当没有 */ }
    return '';
}

// 内置生图的键：builtin:聊天:楼层:swipe:图框序号:提示词哈希。聊天名里可能带冒号，从后往前拆。
export function parseBuiltinImageKey(key) {
    const parts = String(key || '').split(':');
    if (parts[0] !== 'builtin' || parts.length < 6) return null;
    return { chat: parts.slice(1, -4).join(':'), mes: parts[parts.length - 4], swipe: parts[parts.length - 3], index: parts[parts.length - 2], hash: parts[parts.length - 1] };
}

// 两个键指的是不是同一张图：同一聊天、同一图框、同一段提示词；楼层和 swipe 一样，或其中一边当时还没记上（空）。
// 多面镜子在归属写上之前就开始画，画好的图存在「楼层空」的键下，写上归属后再找就对不上，于是又画一遍。
// 聊天名有两种写法：写上归属的那一面记的是「chat:聊天名」，没写上的直接用酒馆给的聊天名，指的是同一个聊天。
const sameChat = (a, b) => String(a).replace(/^chat:/, '') === String(b).replace(/^chat:/, '');
export function builtinImageKeysCompatible(a, b) {
    const x = parseBuiltinImageKey(a), y = parseBuiltinImageKey(b);
    if (!x || !y || !sameChat(x.chat, y.chat) || x.index !== y.index || x.hash !== y.hash || !x.hash) return false;
    const same = (u, v) => u === v || u === '' || v === '';
    return same(x.mes, y.mes) && same(x.swipe, y.swipe);
}

// 同一张图存在另一个兼容的键下（见上）：优先楼层、swipe 都对得上的，再退到当时没记楼层的。只读。
export function findCompatibleBuiltinImageKey(key) {
    const storage = globalThis.localStorage;
    const wanted = parseBuiltinImageKey(key);
    if (!storage || !wanted || !wanted.hash) return '';
    const imagesPrefix = `${PREFIX}images:`;
    const head = `${imagesPrefix}builtin:`;
    const suffix = `:${wanted.index}:${wanted.hash}`;
    const own = storageKey(key, 'images');
    let best = '', bestScore = -1;
    try {
        for (let i = 0; i < storage.length; i += 1) {
            const name = storage.key(i);
            if (!name || name === own || !name.startsWith(head) || !name.endsWith(suffix)) continue;
            const candidate = name.slice(imagesPrefix.length);
            if (!builtinImageKeysCompatible(key, candidate)) continue;
            const other = parseBuiltinImageKey(candidate);
            const score = (other.mes === wanted.mes ? 4 : 0) + (other.swipe === wanted.swipe ? 2 : 0) + (other.chat === wanted.chat ? 1 : 0);
            if (score > bestScore) { best = candidate; bestScore = score; }
        }
    } catch { /* 读不到就当没有 */ }
    return best;
}

// 两个键是不是「同一张图、只是图框序号挪了」：同一聊天、同一楼层、同一 swipe（都记上了）、同一段提示词，序号不同。
export function builtinImageKeysShifted(a, b) {
    const x = parseBuiltinImageKey(a), y = parseBuiltinImageKey(b);
    if (!x || !y || !x.hash || x.hash !== y.hash || x.index === y.index) return false;
    if (x.mes === '' || x.swipe === '' || x.mes !== y.mes || x.swipe !== y.swipe) return false;
    return sameChat(x.chat, y.chat);
}

// 同一聊天、同一楼层、同一 swipe、同一段提示词，图框序号却不同：这一面重新挂上时结构被整理过，序号挪了，图还是那一张。
// 楼层和 swipe 都得是记上了的（空的不算，免得认到别的楼层去）；claimed 里的键（这一面别的图框自己的）不拿；
// 有好几个时取序号最近的。只读。
export function findShiftedBuiltinImageKey(key, claimed = null) {
    const storage = globalThis.localStorage;
    const wanted = parseBuiltinImageKey(key);
    if (!storage || !wanted || !wanted.hash || wanted.mes === '' || wanted.swipe === '') return '';
    const imagesPrefix = `${PREFIX}images:`;
    const head = `${imagesPrefix}builtin:`;
    const suffix = `:${wanted.mes}:${wanted.swipe}:`;
    let best = '', bestDistance = Infinity;
    // claimed 可以是一个集合，也可以是算出集合的函数（真找到候选时才算，平常命中自己的键时不花这份工夫）。
    let claimedSet = null;
    const taken = () => claimedSet || (claimedSet = (typeof claimed === 'function' ? claimed() : claimed) || new Set());
    try {
        for (let i = 0; i < storage.length; i += 1) {
            const name = storage.key(i);
            if (!name || !name.startsWith(head) || !name.endsWith(`:${wanted.hash}`) || !name.includes(suffix)) continue;
            const candidate = name.slice(imagesPrefix.length);
            const other = parseBuiltinImageKey(candidate);
            if (!other || !builtinImageKeysShifted(key, candidate)) continue;
            if (taken().has(candidate)) continue;
            const distance = Math.abs(Number(other.index) - Number(wanted.index));
            if (Number.isFinite(distance) && distance < bestDistance) { best = candidate; bestDistance = distance; }
        }
    } catch { /* 读不到就当没有 */ }
    return best;
}

// 换成历史里的另一张显示：选中的那张当当前，其余按原来的先后留在历史里。不发请求。
export function replaceMirrorImageVersions(key, current, history) {
    const value = { version: 1, current: storedRecord(current), history: (Array.isArray(history) ? history : []).filter(entry => entry && typeof entry === 'object').map(entry => ({ ...entry })) };
    write(key, 'images', value);
    return { ...value.current, history: value.history };
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
