const PREFIX = 'rabbitMirror:image:v1:';
// 插图存档以前只存在本机（localStorage）：App 更新或重装、清理网站数据、本机存储满了，记录就没了，
// 重新打开聊天时每一面都当成没画过、再花一次额度重画。现在同一份记录也写进当前聊天的聊天文件（聊天信息里的这一格），
// 本机这份当缓存：本机读不到时从聊天文件读回来，本机写不进去（满了）时只要聊天文件这份写上了就不算没存。
// 聊天文件里只放看图要的（地址、时间、种子、提示词），整张图的 data: 不放，免得聊天文件变得很大。
const CHAT_META_KEY = 'rabbitMirrorImages';

function storageKey(key, kind) {
    if (typeof key !== 'string' || !key) throw new TypeError('图片必须绑定到明确的聊天与镜面。');
    return `${PREFIX}${kind}:${key}`;
}

function liveContext() {
    try { return globalThis.SillyTavern?.getContext?.() || null; } catch { return null; }
}
function stripChat(value) { return String(value ?? '').replace(/^chat:/, ''); }
// 键里记的是哪个聊天：内置生图 builtin:聊天:楼层:swipe:序号:哈希；手动生图是 JSON 数组 [聊天, 楼层, swipe, …]。
function chatOfKey(key) {
    const text = String(key || '');
    if (text.startsWith('builtin:')) return parseBuiltinImageKey(text)?.chat ?? '';
    if (text.startsWith('[')) { try { const parts = JSON.parse(text); return Array.isArray(parts) ? String(parts[0] ?? '') : ''; } catch { return ''; } }
    return '';
}
function mesOfKey(key) {
    const text = String(key || '');
    if (text.startsWith('builtin:')) return Number(parseBuiltinImageKey(text)?.mes);
    if (text.startsWith('[')) { try { return Number(JSON.parse(text)[1]); } catch { return NaN; } }
    return NaN;
}
// 聊天加载完整、聊天信息已经是这条聊天自己的（群聊加载中途会先放一个空对象，等消息画完才换成真的）。
function metadataReady(ctx) {
    const metadata = ctx?.chatMetadata;
    if (!metadata || typeof metadata !== 'object' || !Array.isArray(ctx?.chat) || !ctx.chat.length) return false;
    return Object.keys(metadata).some(name => name !== CHAT_META_KEY);
}
// 当前聊天文件里的插图格子（读、删用：这个格子本来就属于当前聊天文件，分支、改名带过来的旧名字键也照读）。
function chatMetaStore() {
    const ctx = liveContext();
    if (!metadataReady(ctx)) return null;
    const store = ctx.chatMetadata[CHAT_META_KEY];
    return store && typeof store === 'object' && !Array.isArray(store) ? { store, ctx } : null;
}
// 当前聊天的插图格子（写用）；键不是当前聊天的（收藏夹里别的聊天的面）返回 null，照旧只用本机这份。
function chatImageStore(key, create = false) {
    const ctx = liveContext();
    const metadata = ctx?.chatMetadata;
    if (!metadataReady(ctx)) return null;
    const current = stripChat(ctx.getCurrentChatId?.() ?? ctx.chatId ?? '');
    if (!current || stripChat(chatOfKey(key)) !== current) return null;
    let store = metadata[CHAT_META_KEY];
    if (!store || typeof store !== 'object' || Array.isArray(store)) {
        if (!create) return null;
        store = {};
        metadata[CHAT_META_KEY] = store;
    }
    return { store, ctx };
}
// 聊天文件里那份：去掉有地址时多余的 data: 副本；只有 data: 的整张图不放（太大），这时返回 null。
function chatCopy(value) {
    if (!value || typeof value !== 'object') return null;
    const light = entry => {
        if (!entry || typeof entry !== 'object') return entry;
        const { dataUrl, ...rest } = entry;
        const url = String(rest.path || rest.url || '');
        if (!url || url.startsWith('data:')) return null;
        return rest;
    };
    const current = light(value.current);
    if (!current) return null;
    return { version: 1, current, history: (Array.isArray(value.history) ? value.history : []).map(light).filter(Boolean) };
}
// 请酒馆找个安全的时候把聊天文件存一次（不在生成、还是这条聊天、聊天加载完整时）。几次合成一次。
let saveTimer = 0;
let saveKey = '';
function requestChatSave(ctx, key) {
    saveKey = key;
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
        saveTimer = 0;
        // 到点时取当时的聊天（中途换了聊天就存换过去的那条；它的聊天信息里有这次写的东西才存）。
        const live = liveContext();
        if (!metadataReady(live) || !live.chatMetadata[CHAT_META_KEY]) return;
        ctx = live; key = saveKey;
        const chat = ctx.chat;
        let index = mesOfKey(key);
        if (!Number.isInteger(index) || !chat[index]) index = chat.length - 1;
        if (index < 0) return;
        import('./independentApi/persistence.js?rmv=1.77.0')
            .then(module => module.requestSafeChatSave?.(ctx, index, chat[index]))
            .catch(() => { /* 存不上就等酒馆下次自己存 */ });
    }, 1500);
}
function writeChatImage(key, value) {
    const copy = chatCopy(value);
    if (!copy) {
        // 这次是只有 data: 的图（不放进聊天文件）：聊天文件里同一个键的旧图删掉，免得以后读回旧的那张。
        const existing = chatMetaStore();
        if (existing && Object.prototype.hasOwnProperty.call(existing.store, key)) { delete existing.store[key]; requestChatSave(existing.ctx, key); }
        return false;
    }
    const target = chatImageStore(key, true);
    if (!target) return false;
    target.store[key] = copy;
    requestChatSave(target.ctx, key);
    return true;
}
function readChatImage(key) {
    const target = chatMetaStore();
    const value = target?.store?.[key];
    return value && typeof value === 'object' ? value : null;
}
function removeChatImage(key) {
    const target = chatMetaStore();
    if (target && Object.prototype.hasOwnProperty.call(target.store, key)) { delete target.store[key]; requestChatSave(target.ctx, key); }
}
// 这个聊天以前只存在本机的插图：打开聊天后第一次读写时，一并抄进聊天文件（只抄聊天文件里还没有的）。
const backfilled = new WeakSet();
function backfillChatImages() {
    const ctx = liveContext();
    const metadata = ctx?.chatMetadata;
    const storage = globalThis.localStorage;
    if (!metadataReady(ctx) || backfilled.has(metadata) || !storage) return;
    if (!stripChat(ctx.getCurrentChatId?.() ?? ctx.chatId ?? '')) return;
    backfilled.add(metadata);
    const head = `${PREFIX}images:`;
    let copied = 0, sample = '';
    try {
        for (let i = 0; i < storage.length; i += 1) {
            const name = storage.key(i);
            if (!name?.startsWith(head)) continue;
            const key = name.slice(head.length);
            const target = chatImageStore(key, true);
            if (!target || target.store[key]) continue;
            let value = null;
            try { value = JSON.parse(storage.getItem(name)); } catch { value = null; }
            const copy = chatCopy(value);
            if (!copy) continue;
            target.store[key] = copy;
            copied += 1; sample = key;
        }
    } catch { /* 读不到就算了 */ }
    if (copied) requestChatSave(ctx, sample);
}
// 存档里所有插图的键：本机的和当前聊天文件里的。
function imageKeyNames() {
    const head = `${PREFIX}images:`;
    const names = new Set();
    const storage = globalThis.localStorage;
    try { if (storage) for (let i = 0; i < storage.length; i += 1) { const name = storage.key(i); if (name?.startsWith(head)) names.add(name); } } catch { /* 读不到就当没有 */ }
    const store = chatMetaStore()?.store;
    if (store) for (const key of Object.keys(store)) names.add(head + key);
    return [...names];
}

function read(key, kind) {
    if (kind === 'images') backfillChatImages();
    const text = globalThis.localStorage.getItem(storageKey(key, kind));
    if (text != null) return JSON.parse(text);
    if (kind !== 'images') return null;
    const fromChat = readChatImage(key);
    if (!fromChat) return null;
    // 本机这份没了（App 更新、清理数据）：从聊天文件读回来，顺手放回本机缓存（放不下也没关系）。
    try { globalThis.localStorage.setItem(storageKey(key, kind), JSON.stringify(fromChat)); } catch { /* 本机满了就只用聊天文件那份 */ }
    return fromChat;
}

function write(key, kind, value) {
    // 插图先写进聊天文件那一格：本机写不进去（满了）时，只要这份写上了就不算没存。
    const inChat = kind === 'images' && writeChatImage(key, value);
// A single atomic setItem: a quota/error leaves the entire old record intact.
    const name = storageKey(key, kind), text = JSON.stringify(value);
    try { globalThis.localStorage.setItem(name, text); }
    catch (error) {
        // 本机存储满了：先把各张图旧版本里的长提示词瘦下来（图本身一张不删），腾出地方再写一次。
        try {
            if (!slimMirrorImagesForQuota()) throw error;
            globalThis.localStorage.setItem(name, text);
        } catch (again) {
            if (!inChat) throw again;
            // 本机旧的那份里有只存在本机的 data: 图（聊天文件不放）：删了就真没了，照旧算没存上。
            let localOnly = false;
            try {
                const old = JSON.parse(globalThis.localStorage.getItem(name) || 'null');
                const dataOnly = entry => entry && typeof entry === 'object' && !entry.path && /^data:/.test(String(entry.url || entry.dataUrl || ''));
                localOnly = !!old && (dataOnly(old.current) || (Array.isArray(old.history) && old.history.some(dataOnly)));
            } catch { localOnly = false; }
            if (localOnly) throw again;
            // 聊天文件里那份写上了：本机这份旧的删掉，免得读到的比聊天文件旧。
            try { globalThis.localStorage.removeItem(name); } catch { /* 删不掉也只是旧缓存 */ }
        }
    }
}

// 旧版本（翻回去看的那几张）只留看图要用的：地址、时间、种子、格式；长提示词、人物外貌不留（没有文件路径、
// 只有 data: 的那张保留图本身）。当前那张不动（重画沿用它的提示词）；翻回旧版本时沿用换下来那张的提示词（builtinImage.js）。
// 一张图用的那段提示词的指纹：旧版本瘦掉提示词后留着它，翻回去时只在和当前那张一样时才借用。
export function imagePromptFingerprint(entry) {
    if (!entry || typeof entry !== 'object') return '';
    if (entry.slimmed === true) return String(entry.promptHash || '');
    const meta = entry.promptMetadata && typeof entry.promptMetadata === 'object' ? entry.promptMetadata : {};
    const text = JSON.stringify([String(meta.prompt || ''), String(meta.nl || ''), String(meta.flatPrompt || ''), String(entry.prompt || ''), meta.promptFormat || '']);
    if (text === JSON.stringify(['', '', '', '', ''])) return '';
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 0x01000193) >>> 0; }
    return hash.toString(36);
}

function slimEntry(entry) {
    if (!entry || typeof entry !== 'object') return entry;
    if (entry.slimmed === true) return { ...entry };
    // 用户自己改过提示词画的那张：提示词留着（只有这一类留，占不了多少），翻回去重画照它的来。
    if (entry.editedPrompt === true) { const { dataUrl: ignored, ...rest } = entry; return entry.path ? rest : { ...entry }; }
    const promptHash = imagePromptFingerprint(entry);
    const meta = entry.promptMetadata && typeof entry.promptMetadata === 'object' ? entry.promptMetadata : {};
    const out = { url: entry.url, path: entry.path, generatedAt: entry.generatedAt, provider: entry.provider, builtinImageFit: entry.builtinImageFit, looksSources: entry.looksSources };
    if (!entry.path && entry.dataUrl && entry.dataUrl !== entry.url) out.dataUrl = entry.dataUrl;
    const slimMeta = { seed: meta.seed, promptFormat: meta.promptFormat, size: meta.size };
    out.promptMetadata = Object.fromEntries(Object.entries(slimMeta).filter(([, value]) => value !== undefined));
    out.slimmed = true;
    if (promptHash) out.promptHash = promptHash;
    return Object.fromEntries(Object.entries(out).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}

/** 本机存储满了时给插图存档瘦身：只瘦旧版本、去掉已有文件路径的 data: 副本，不删任何一张图。腾出了地方返回 true。 */
// 以前的旧版本都带着整套提示词：这次打开页面后第一次存图时，把所有存档的旧版本瘦一遍（只一次）。
let migrated = false;
function migrateOldImageRecords() {
    if (migrated) return;
    migrated = true;
    try { slimMirrorImagesForQuota(); } catch { /* 瘦不了就照旧 */ }
}

// 瘦过一遍、之后没再存新图：再瘦也腾不出地方，不再把几百份存档逐条解析一遍。
let slimmedClean = false;
export function slimMirrorImagesForQuota() {
    const storage = globalThis.localStorage;
    if (!storage || slimmedClean) return false;
    const head = `${PREFIX}images:`;
    const names = [];
    try { for (let i = 0; i < storage.length; i += 1) { const name = storage.key(i); if (name?.startsWith(head)) names.push(name); } } catch { return false; }
    let freed = false;
    for (const name of names) {
        try {
            const raw = storage.getItem(name);
            const data = raw ? JSON.parse(raw) : null;
            if (!data || data.version !== 1 || !data.current || !Array.isArray(data.history)) continue;
            const current = { ...data.current };
            if (current.path) delete current.dataUrl;
            const next = JSON.stringify({ ...data, current, history: data.history.map(slimEntry) });
            if (next.length >= raw.length) continue;
            storage.setItem(name, next);
            freed = true;
        } catch { /* 这一份瘦不了就跳过 */ }
    }
    slimmedClean = true;
    return freed;
}

function storedRecord(record) {
    if (!record || typeof record !== 'object') throw new TypeError('缺少要保存的图片。');
    const { history: ignoredHistory, ...copy } = record;
    const url = copy.path || copy.url || copy.dataUrl;
    if (typeof url !== 'string' || !url) throw new TypeError('图片没有可保存的地址。');
    copy.url = url;
    // Durable provider files do not require duplicating their large base64 payload.
    if (copy.path) delete copy.dataUrl;
    // 只有 data: 的图：url 和 dataUrl 是同一串 base64，只存一份（不然一张图占两倍本机空间）。
    else if (copy.dataUrl && copy.dataUrl === copy.url) delete copy.dataUrl;
    return copy;
}

/** 删掉一份插图存档（搬到新键以后清旧键用）。不存在也不报错。 */
export function removeMirrorImage(key) {
    try { globalThis.localStorage.removeItem(storageKey(key, 'images')); } catch { /* 删不掉就留着 */ }
    try { removeChatImage(key); } catch { /* 聊天文件里那份删不掉就留着 */ }
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
    // 提示词只给当前那张留一份：旧版本只记图片地址、时间和种子（图本身在柏宝绘图库／酒馆上）。
    migrateOldImageRecords();
    const history = (previous ? [...previous.history, storedRecord(previous)] : [])
        .slice(-4)
        .filter((entry, index, list) => index === list.length - 1 || !String(entry?.url || '').startsWith('data:'))
        .map((entry, index, list) => {
            if (index === list.length - 1 || !entry || typeof entry !== 'object') return entry;
            const { dataUrl: ignoredDataUrl, ...rest } = entry;
            return rest;
        })
        .map(slimEntry);
    write(key, 'images', { version: 1, current, history });
    slimmedClean = false;
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
        for (const name of imageKeyNames()) {
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
        for (const name of imageKeyNames()) {
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
        for (const name of imageKeyNames()) {
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
    migrateOldImageRecords();
    const value = { version: 1, current: storedRecord(current), history: (Array.isArray(history) ? history : []).filter(entry => entry && typeof entry === 'object').map(slimEntry) };
    write(key, 'images', value);
    slimmedClean = false;
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
function remapChatImageStore(nextKeyFor) {
    const store = chatMetaStore()?.store;
    if (!store) return 0;
    const moves = Object.keys(store).map(key => ({ from: key, to: nextKeyFor(key) })).filter(move => move.to && move.to !== move.from);
    if (!moves.length) return 0;
    const count = new Map();
    for (const move of moves) count.set(move.to, (count.get(move.to) || 0) + 1);
    let plan = moves.filter(move => count.get(move.to) === 1);
    for (let changed = true; changed;) {
        const leaving = new Set(plan.map(move => move.from));
        const kept = plan.filter(move => !Object.prototype.hasOwnProperty.call(store, move.to) || leaving.has(move.to));
        changed = kept.length !== plan.length;
        plan = kept;
    }
    const values = plan.map(move => ({ ...move, value: store[move.from] }));
    for (const move of values) delete store[move.from];
    for (const move of values) store[move.to] = move.value;
    if (values.length) { const ctx = liveContext(); if (ctx) requestChatSave(ctx, values[0].to); }
    return values.length;
}

export function remapMirrorImageSlots(chat, mapper) {
    const storage = globalThis.localStorage;
    if (!storage || typeof chat !== 'string' || !chat || typeof mapper !== 'function') return 0;
    const builtinPrefix = `builtin:${chat}:`;
    const target = (index, swipe) => {
        const value = mapper(index, swipe);
        const match = /^(\d+):(\d+)$/.exec(String(value ?? ''));
        return match ? [Number(match[1]), Number(match[2])] : null;
    };
    const nextKeyFor = key => {
        if (key.startsWith(builtinPrefix)) {
            const match = /^(\d+):(\d+):(.+)$/.exec(key.slice(builtinPrefix.length));
            const moved = match && target(Number(match[1]), Number(match[2]));
            return moved ? `${builtinPrefix}${moved[0]}:${moved[1]}:${match[3]}` : '';
        }
        if (key.startsWith('[')) {
            let parts;
            try { parts = JSON.parse(key); } catch { return ''; }
            if (!Array.isArray(parts) || parts[0] !== chat || !Number.isInteger(parts[1]) || !Number.isInteger(parts[2])) return '';
            const moved = target(parts[1], parts[2]);
            return moved ? JSON.stringify([parts[0], moved[0], moved[1], ...parts.slice(3)]) : '';
        }
        return '';
    };
    // 聊天文件里那一格也跟着搬（规则同本机：两张搬到一处、或目标被不搬走的占着时不搬）。
    remapChatImageStore(nextKeyFor);
    const moves = [];
    for (let i = 0; i < storage.length; i += 1) {
        const full = storage.key(i);
        if (!full || !full.startsWith(PREFIX)) continue;
        const rest = full.slice(PREFIX.length);
        const colon = rest.indexOf(':');
        if (colon < 0) continue;
        const kind = rest.slice(0, colon), key = rest.slice(colon + 1);
        if (kind !== 'images' && kind !== 'draft') continue;
        const next = nextKeyFor(key);
        if (next && next !== key) moves.push({ from: full, to: `${PREFIX}${kind}:${next}` });
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
