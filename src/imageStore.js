const PREFIX = 'rabbitMirror:image:v1:';
// 插图记录存在它所在的那条消息上（消息的附加数据里，跟着那一个 swipe 走），跟聊天记录一起存进聊天文件：
// 删楼层、删 swipe、开分支、群聊都跟着消息走；App 更新、清理数据、换设备都不丢；也不占本机存储。
// 只记看图要的（图片地址、时间、种子、提示词），整张图的 data: 不放进聊天记录。
// 本机存储只在这几种时候还用：图只有 data:（没能存成文件）、键还没记上楼层、或不是当前聊天（收藏夹另带一份）。
const EXTRA_KEY = 'rabbitMirrorImages';
// 1.77.0 放在聊天信息里的那一格：读到就搬到对应的消息上。
const LEGACY_META_KEY = 'rabbitMirrorImages';

function storageKey(key, kind) {
    if (typeof key !== 'string' || !key) throw new TypeError('图片必须绑定到明确的聊天与镜面。');
    return `${PREFIX}${kind}:${key}`;
}

function liveContext() {
    try { return globalThis.SillyTavern?.getContext?.() || null; } catch { return null; }
}
function stripChat(value) { return String(value ?? '').replace(/^chat:/, ''); }
function currentChatName(ctx) { return stripChat(ctx?.getCurrentChatId?.() ?? ctx?.chatId ?? ''); }
// 聊天加载完整（群聊加载中途会先放一个空的聊天信息，那时不读不写）。
function chatReady(ctx) {
    const metadata = ctx?.chatMetadata;
    if (!metadata || typeof metadata !== 'object' || !Array.isArray(ctx?.chat) || !ctx.chat.length) return false;
    return Object.keys(metadata).some(name => name !== LEGACY_META_KEY);
}
// 键 → 哪个聊天、哪一层、哪个 swipe、消息里那一格的名字。
// 内置生图 builtin:聊天:楼层:swipe:序号:哈希；手动生图是 JSON 数组 [聊天, 楼层, swipe, …]。
function slotOfKey(key) {
    const text = String(key || '');
    if (text.startsWith('builtin:')) {
        const parsed = parseBuiltinImageKey(text);
        if (!parsed) return null;
        return { chat: parsed.chat, mes: parsed.mes, swipe: parsed.swipe, entry: `${parsed.index}:${parsed.hash}` };
    }
    if (text.startsWith('[')) {
        try {
            const parts = JSON.parse(text);
            if (!Array.isArray(parts)) return null;
            return { chat: String(parts[0] ?? ''), mes: String(parts[1] ?? ''), swipe: String(parts[2] ?? ''), entry: `manual:${JSON.stringify(parts.slice(3))}` };
        } catch { return null; }
    }
    return null;
}
// 那个 swipe 的附加数据：正显示着的 swipe 用消息本身的；别的 swipe 用它自己存着的那份（切过去时酒馆会换上）。
// 只写一处：正显示着的 swipe 写消息本身（酒馆切走时会存回那个 swipe）；别的 swipe 写它自己那份。
function swipeExtras(msg, swipe) {
    const current = Number.isInteger(msg.swipe_id) ? msg.swipe_id : 0;
    if (swipe === current) return [msg.extra && typeof msg.extra === 'object' ? msg.extra : null];
    const info = Array.isArray(msg.swipe_info) ? msg.swipe_info[swipe] : null;
    return [info && typeof info === 'object' && info.extra && typeof info.extra === 'object' ? info.extra : null];
}
// 每条记录记着自己是哪个 swipe 的：右滑出新 swipe 时酒馆会把上一个 swipe 的附加数据整份抄过去，
// 抄过来的那些不是这个 swipe 的图，读的时候不认，写的时候顺手清掉。
function ownEntry(value, swipe) {
    return !!value && typeof value === 'object' && (value.swipe === undefined || Number(value.swipe) === swipe);
}
function pruneCopied(store, swipe) {
    let pruned = false;
    for (const [entry, value] of Object.entries(store)) if (value && typeof value === 'object' && value.swipe !== undefined && Number(value.swipe) !== swipe) { delete store[entry]; pruned = true; }
    return pruned;
}
// 这个键是当前聊天的、聊天却还没加载完整（消息上的插图记录读不到）：这时读到「没有」不算数，调用方要等一等再读。
export function mirrorImageChatLoading(key) {
    const ctx = liveContext();
    // 消息已经到了、聊天信息还是空的才算「加载中」；没有消息的聊天（新开、测试环境）不等。
    if (chatReady(ctx) || !Array.isArray(ctx?.chat) || !ctx.chat.length) return false;
    const slot = slotOfKey(key);
    const current = currentChatName(ctx);
    return !!slot && !!current && stripChat(slot.chat) === current;
}
// 当前聊天里这个键对应的消息格子。create 时没有就建。键不是当前聊天、楼层没记上或消息不在时返回 null。
function messageSlot(key, create = false) {
    const ctx = liveContext();
    if (!chatReady(ctx)) return null;
    const slot = slotOfKey(key);
    if (!slot || !/^\d+$/.test(slot.mes) || !/^\d+$/.test(slot.swipe)) return null;
    const current = currentChatName(ctx);
    if (!current || stripChat(slot.chat) !== current) return null;
    const mes = Number(slot.mes), swipe = Number(slot.swipe);
    const msg = ctx.chat[mes];
    if (!msg || typeof msg !== 'object') return null;
    const currentSwipe = Number.isInteger(msg.swipe_id) ? msg.swipe_id : 0;
    const hasInfo = Array.isArray(msg.swipe_info) && msg.swipe_info[swipe] && typeof msg.swipe_info[swipe] === 'object';
    if (swipe !== currentSwipe && !hasInfo) return null;
    if (create) {
        if (swipe === currentSwipe && (!msg.extra || typeof msg.extra !== 'object')) msg.extra = {};
        if (swipe !== currentSwipe && (!msg.swipe_info[swipe].extra || typeof msg.swipe_info[swipe].extra !== 'object')) msg.swipe_info[swipe].extra = {};
    }
    const extras = swipeExtras(msg, swipe).filter(Boolean);
    const stores = [];
    for (const extra of extras) {
        let store = extra[EXTRA_KEY];
        if (!store || typeof store !== 'object' || Array.isArray(store)) {
            if (!create) continue;
            store = {};
            extra[EXTRA_KEY] = store;
        }
        stores.push(store);
    }
    if (!stores.length) return null;
    return { ctx, mes, msg, swipe, entry: slot.entry, stores };
}
// 聊天记录里那份：去掉有地址时多余的 data: 副本；只有 data: 的整张图不放（太大），这时返回 null。
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
// 请酒馆找个安全的时候把聊天存一次（不在生成、还是这条聊天、聊天加载完整时）。几次合成一次，到点时取当时的聊天。
let saveTimer = 0;
let saveMes = -1;
function requestChatSave(mes) {
    saveMes = mes;
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
        saveTimer = 0;
        const ctx = liveContext();
        if (!chatReady(ctx)) return;
        const chat = ctx.chat;
        const index = Number.isInteger(saveMes) && chat[saveMes] ? saveMes : chat.length - 1;
        if (index < 0) return;
        import('./independentApi/persistence.js?rmv=1.78.5')
            .then(module => module.requestSafeChatSave?.(ctx, index, chat[index]))
            .catch(() => { /* 存不上就等酒馆下次自己存 */ });
    }, 1500);
}
function writeMessageImage(key, value) {
    const copy = chatCopy(value);
    if (!copy) {
        // 这次是只有 data: 的图（不放进聊天记录）：消息上同一格的旧图删掉，免得以后读回旧的那张。
        const existing = messageSlot(key);
        if (existing && existing.stores.some(store => Object.prototype.hasOwnProperty.call(store, existing.entry))) {
            existing.stores.forEach(store => { delete store[existing.entry]; });
            requestChatSave(existing.mes);
        }
        return false;
    }
    const target = messageSlot(key, true);
    if (!target) return false;
    target.stores.forEach(store => { pruneCopied(store, target.swipe); store[target.entry] = { ...structuredCloneSafe(copy), swipe: target.swipe }; });
    keyNamesGen += 1;
    requestChatSave(target.mes);
    return true;
}
function structuredCloneSafe(value) {
    try { return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)); } catch { return JSON.parse(JSON.stringify(value)); }
}
function readMessageImage(key) {
    const target = messageSlot(key);
    if (!target) return null;
    for (const store of target.stores) {
        const value = store[target.entry];
        if (ownEntry(value, target.swipe)) { const { swipe, ...record } = value; return record; }
    }
    return null;
}
function removeMessageImage(key) {
    const target = messageSlot(key);
    if (!target) return;
    let removed = false;
    for (const store of target.stores) if (Object.prototype.hasOwnProperty.call(store, target.entry)) { delete store[target.entry]; removed = true; }
    if (removed) { keyNamesGen += 1; requestChatSave(target.mes); }
}
// 收藏夹里别的聊天的面：收藏时把那一面的插图记录一并存进收藏，打开收藏时登记在这里（只在这次打开页面里有效）。
const borrowed = new Map();
function borrowKey(chat, mes, swipe) { return `${stripChat(chat)}|${mes}|${swipe}`; }
export function lendMirrorImages(chat, mes, swipe, entries) {
    if (!entries || typeof entries !== 'object') return;
    borrowed.set(borrowKey(chat, mes, swipe), entries);
    if (borrowed.size > 200) borrowed.delete(borrowed.keys().next().value);
}
function readBorrowed(key) {
    const slot = slotOfKey(key);
    if (!slot) return null;
    const value = borrowed.get(borrowKey(slot.chat, slot.mes, slot.swipe))?.[slot.entry];
    return value && typeof value === 'object' ? value : null;
}
// 收藏一面时：这一面在当前聊天里的插图记录（只要看图要的那份），存进收藏。
// 收藏里只带看图要的（地址、时间、尺寸方式、渠道），不带提示词；整份不超过 32KB。
function favoriteLight(value) {
    const light = entry => entry && typeof entry === 'object' ? Object.fromEntries(Object.entries({
        url: entry.url, path: entry.path, generatedAt: entry.generatedAt, builtinImageFit: entry.builtinImageFit, provider: entry.provider,
    }).filter(([, item]) => item !== undefined && item !== null && item !== '')) : null;
    const current = light(value?.current);
    return current && (current.path || current.url) && !String(current.path || current.url).startsWith('data:') ? { version: 1, current, history: [] } : null;
}
export function mirrorImagesForSlot(mes, swipe, chatKey = '') {
    const ctx = liveContext();
    if (!chatReady(ctx)) return null;
    const current = currentChatName(ctx);
    if (chatKey && stripChat(chatKey) !== current) return null;
    const msg = ctx.chat?.[Number(mes)];
    if (!msg) return null;
    const out = {};
    for (const extra of swipeExtras(msg, Number(swipe)).filter(Boolean)) {
        const store = extra[EXTRA_KEY];
        if (store && typeof store === 'object') for (const [entry, value] of Object.entries(store)) {
            if (out[entry] || !ownEntry(value, Number(swipe))) continue;
            const light = favoriteLight(value);
            if (light) out[entry] = light;
        }
    }
    // 本机里还没搬过去的旧记录也带上。
    for (const name of localImageNames()) {
        const slot = slotOfKey(name.slice(`${PREFIX}images:`.length));
        if (!slot || stripChat(slot.chat) !== current || slot.mes !== String(mes) || slot.swipe !== String(swipe) || out[slot.entry]) continue;
        try { const light = favoriteLight(JSON.parse(globalThis.localStorage.getItem(name))); if (light) out[slot.entry] = light; } catch { /* 读不到就不带 */ }
    }
    if (!Object.keys(out).length) return null;
    while (JSON.stringify(out).length > 32768 && Object.keys(out).length) delete out[Object.keys(out).pop()];
    return Object.keys(out).length ? out : null;
}
function localImageNames() {
    const head = `${PREFIX}images:`;
    const names = [];
    const storage = globalThis.localStorage;
    try { if (storage) for (let i = 0; i < storage.length; i += 1) { const name = storage.key(i); if (name?.startsWith(head)) names.push(name); } } catch { /* 读不到就当没有 */ }
    return names;
}
// 以前存在本机、或 1.77.0 放在聊天信息里的插图记录：打开聊天后第一次读写时，搬到对应的消息上（消息上已经有的不覆盖）。
// 本机那份先留着（聊天存盘之前它是唯一的一份），以后不再往本机写新的。
const migratedChats = new WeakSet();
function migrateIntoMessages() {
    const ctx = liveContext();
    if (!chatReady(ctx) || migratedChats.has(ctx.chatMetadata) || !currentChatName(ctx)) return;
    migratedChats.add(ctx.chatMetadata);
    let moved = 0, lastMes = -1;
    const adopt = (key, value) => {
        const copy = chatCopy(value);
        if (!copy) return false;
        const target = messageSlot(key, true);
        if (!target) return false;
        if (target.stores.some(store => ownEntry(store[target.entry], target.swipe))) return true;
        target.stores.forEach(store => { pruneCopied(store, target.swipe); store[target.entry] = { ...structuredCloneSafe(copy), swipe: target.swipe }; });
        moved += 1; lastMes = target.mes;
        return true;
    };
    const legacy = ctx.chatMetadata[LEGACY_META_KEY];
    if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) {
        for (const [key, value] of Object.entries(legacy)) if (adopt(key, value)) delete legacy[key];
        if (!Object.keys(legacy).length) delete ctx.chatMetadata[LEGACY_META_KEY];
    }
    const head = `${PREFIX}images:`;
    const currentName = currentChatName(ctx);
    for (const name of localImageNames()) {
        const key = name.slice(head.length);
        const slot = slotOfKey(key);
        // 先按键里的聊天名挑出这个聊天的，再解析（data: 整图很大，别的聊天的不读）。
        if (!slot || stripChat(slot.chat) !== currentName) continue;
        let value = null;
        try { value = JSON.parse(globalThis.localStorage.getItem(name)); } catch { value = null; }
        if (value) adopt(key, value);
    }
    if (moved) { keyNamesGen += 1; requestChatSave(lastMes); }
}
// 存档里所有插图的键：本机的、当前聊天各消息上的、还没搬走的聊天信息里的。
// 消息上的键按「这个聊天数组、条数、各消息正显示的 swipe、本插件写过几次」记一份，没变就不再整条聊天扫一遍。
let keyNamesGen = 0;
const keyNamesCache = new WeakMap();
function messageKeyNames(ctx) {
    const signature = `${ctx.chat.length}|${keyNamesGen}|${currentChatName(ctx)}|${ctx.chat.reduce((sum, msg, index) => sum + (Number.isInteger(msg?.swipe_id) ? msg.swipe_id * (index + 1) : 0), 0)}`;
    const cached = keyNamesCache.get(ctx.chat);
    if (cached?.signature === signature) return cached.names;
    const names = [];
    const head = `${PREFIX}images:`;
    const chat = currentChatName(ctx);
    ctx.chat.forEach((msg, mes) => {
        if (!msg || typeof msg !== 'object') return;
        const swipes = new Set([Number.isInteger(msg.swipe_id) ? msg.swipe_id : 0]);
        if (Array.isArray(msg.swipe_info)) msg.swipe_info.forEach((_, index) => swipes.add(index));
        for (const swipe of swipes) for (const extra of swipeExtras(msg, swipe).filter(Boolean)) {
            const store = extra[EXTRA_KEY];
            if (!store || typeof store !== 'object') continue;
            for (const [entry, value] of Object.entries(store)) if (!entry.startsWith('manual:') && ownEntry(value, swipe)) names.push(`${head}builtin:${chat}:${mes}:${swipe}:${entry}`);
        }
    });
    keyNamesCache.set(ctx.chat, { signature, names });
    return names;
}
function imageKeyNames() {
    const head = `${PREFIX}images:`;
    const names = new Set(localImageNames());
    const ctx = liveContext();
    if (chatReady(ctx)) {
        for (const name of messageKeyNames(ctx)) names.add(name);
        const legacy = ctx.chatMetadata?.[LEGACY_META_KEY];
        if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) for (const key of Object.keys(legacy)) names.add(head + key);
    }
    return [...names];
}

function read(key, kind) {
    if (kind !== 'images') {
        const text = globalThis.localStorage.getItem(storageKey(key, kind));
        return text == null ? null : JSON.parse(text);
    }
    migrateIntoMessages();
    const fromMessage = readMessageImage(key);
    if (fromMessage) return fromMessage;
    const text = globalThis.localStorage.getItem(storageKey(key, kind));
    if (text != null) {
        const value = JSON.parse(text);
        // 本机还有、消息上没有（楼层后来才记上）：搬到消息上。
        if (chatCopy(value)) writeMessageImage(key, value);
        return value;
    }
    const legacy = liveContext()?.chatMetadata?.[LEGACY_META_KEY]?.[key];
    if (legacy && typeof legacy === 'object') { writeMessageImage(key, legacy); return legacy; }
    return readBorrowed(key);
}

function write(key, kind, value) {
    // 插图写在消息上（跟聊天记录一起存）。本机另留一份很小的（只有地址、时间这些，不含整张图），
    // 防的是聊天还没存盘就关了 App；写不进去（本机满了）也不要紧。本机旧记录里有只存在本机的 data: 整图版本时，那份原样留着。
    if (kind === 'images' && writeMessageImage(key, value)) {
        const name = storageKey(key, kind);
        let keepOld = false;
        try {
            const old = JSON.parse(globalThis.localStorage.getItem(name) || 'null');
            const dataOnly = entry => entry && typeof entry === 'object' && !entry.path && /^data:/.test(String(entry.url || entry.dataUrl || ''));
            keepOld = !!old && (dataOnly(old.current) || (Array.isArray(old.history) && old.history.some(dataOnly)));
        } catch { keepOld = false; }
        if (!keepOld) {
            const light = chatCopy(value);
            try { globalThis.localStorage.setItem(name, JSON.stringify(light)); } catch { /* 本机满了就只靠聊天记录 */ }
        }
        return;
    }
    // A single atomic setItem: a quota/error leaves the entire old record intact.
    const name = storageKey(key, kind), text = JSON.stringify(value);
    try { globalThis.localStorage.setItem(name, text); }
    catch (error) {
        // 本机存储满了：先把各张图旧版本里的长提示词瘦下来（图本身一张不删），腾出地方再写一次。
        if (!slimMirrorImagesForQuota()) throw error;
        globalThis.localStorage.setItem(name, text);
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
export function removeMirrorImage(key, { keepSlotOf = '' } = {}) {
    try { globalThis.localStorage.removeItem(storageKey(key, 'images')); } catch { /* 删不掉就留着 */ }
    // 旧键和新键指向消息上同一格（只是聊天名写法不同）：刚写进去的就是这一格，不能删。
    const a = slotOfKey(key), b = keepSlotOf ? slotOfKey(keepSlotOf) : null;
    const sameSlot = a && b && stripChat(a.chat) === stripChat(b.chat) && a.mes === b.mes && a.swipe === b.swipe && a.entry === b.entry;
    if (!sameSlot) try { removeMessageImage(key); } catch { /* 消息上那份删不掉就留着 */ }
    try { const legacy = liveContext()?.chatMetadata?.[LEGACY_META_KEY]; if (legacy && typeof legacy === 'object') delete legacy[key]; } catch { /* 旧格子删不掉就留着 */ }
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
    // 消息上的插图记录跟着消息、swipe 走，不用搬；这里只搬本机里的旧记录。
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
