import { getSettings } from './settings.js?rmv=1.74.0';
import { generateMirrorImage, getImageCharacters } from './baibaiImage.js?rmv=1.74.0';
import { imagePromptFingerprint, removeMirrorImage, builtinImageKeysCompatible, findBuiltinImageKeyFromOtherChat, findCompatibleBuiltinImageKey, findShiftedBuiltinImageKey, builtinImageKeysShifted, loadMirrorImage, saveMirrorImage, replaceMirrorImageVersions } from './imageStore.js?rmv=1.74.0';
import { getContext, hashText } from './independentApi/runtime.js?rmv=1.74.0';
import { imageLlmConfigured } from './imageLlm.js?rmv=1.74.0';
import { tidyImagePayload } from './imageTagTidy.js?rmv=1.74.0';
import { isRabbitMirrorLinkedAvatarFrame, prepareRabbitMirrorAvatarFrame } from './chatAvatars.js?rmv=1.74.0';
import { rabbitMirrorAvatarPromptIdentity } from './chatAvatarPromptReady.js?rmv=1.74.0';

// 同一提示词在滚动、重挂载时共用这一次请求，避免每刷一次工具就再打一次柏宝绘。
const inflight = new Map();
const waiters = new Map();
const progress = new Map();
// 没连上柏宝绘时不要在每次刷新里反复请求。刷新页面后可以再试。
const failed = new Map();

function safeImageUrl(value) {
    const text = String(value || '');
    if (!text) return '';
    if (/^data:image\/[a-z\d.+-]+;base64,[a-z\d+/=\s]+$/i.test(text)) return text;
    try {
        const url = new URL(text, document.baseURI);
        if (['http:', 'https:'].includes(url.protocol)) return url.href;
        const host = new URL(document.location?.href || document.baseURI);
        if (host.protocol === 'tauri:' && host.host === 'localhost'
            && url.protocol === host.protocol && url.host === host.host
            && !host.username && !host.password && !url.username && !url.password) return url.href;
        return '';
    } catch { return ''; }
}

function characterGroup() {
    const ctx = getContext();
    const person = ctx.characters?.[ctx.characterId] || ctx.character || {};
    return String(person.name || ctx.name2 || '').trim() || '兔子镜';
}

// 画面说明写在这一面最后的 <div data-rm-draw-notes="N" hidden> 里（被服务商审核截断时只丢图、不丢正文）：
// 按编号搬回同一面里的图框 N，后面读提示词、人物外貌的地方都照旧从图框里读。图框里已经写了提示词的不动。
export function adoptDrawNotes(root) {
    if (!root?.querySelectorAll) return 0;
    let moved = 0;
    const PART = '[data-rm-draw-prompt],[data-rm-draw-tags],[data-rm-draw-char],[data-rm-draw-char-tags]';
    for (const notes of [...root.querySelectorAll('[data-rm-draw-notes]')]) {
        const number = String(notes.getAttribute('data-rm-draw-notes') || '1').trim() || '1';
        const scope = notes.closest?.('details') || root;
        const frames = [...scope.querySelectorAll('[data-rm-draw-frame]')];
        const empty = node => !node.querySelector('[data-rm-draw-prompt]');
        // 按编号找；模型把模板的 "1" 原样复制给了几个图框、编号对不上时，按先后给还没拿到说明的图框。
        let frame = frames.find(node => String(node.getAttribute('data-rm-draw-frame') || '1').trim() === number && empty(node));
        // 编号对不上：说明 N 给第 N 个图框（它还空着的话），再不行给第一个还空着的。
        if (!frame) { const nth = frames[Number(number) - 1]; frame = (nth && empty(nth) ? nth : null) || frames.find(empty) || null; }
        // 说明段落有时被模型多包了一层：找后代，不只找直接子节点。
        const parts = [...notes.querySelectorAll(PART)].filter(node => !node.parentElement?.closest?.(PART) || node.parentElement === notes);
        if (frame && parts.length) {
            for (const part of parts) part.hidden = true;
            frame.prepend(...parts);
            moved += 1;
            notes.remove();
        } else if (!parts.length) notes.remove();
        else notes.hidden = true;
    }
    return moved;
}

// 标题只取标题字（插件在标题条上加的工具按钮、翻面计数不算）。
function fallbackTitle(frame) {
    const summary = frame.closest?.('details')?.querySelector?.(':scope > summary');
    if (!summary) return '';
    const label = summary.querySelector?.('[data-rm-title-label]');
    let text = '';
    if (label) text = label.textContent || '';
    else {
        const copy = summary.cloneNode(true);
        copy.querySelectorAll?.('[data-rabbit-mirror-tool-entry-host], [data-rm-face-swipe-host], [data-rm-face-favorite-star], button').forEach(node => node.remove());
        text = copy.textContent || '';
    }
    return text.replace(/\s+/g, ' ').replace(/^【?兔子镜[:：]\s*/, '').replace(/】.*$/, '').trim();
}

// 模型在图框里真的写了画面描述（不是插件拿标题和旁边的字凑的）。
function hasModelPrompt(frame) {
    const node = frame?.querySelector?.('[data-rm-draw-prompt]');
    let text = node ? node.textContent : '';
    if (!String(text).trim()) { const attr = frame?.getAttribute?.('data-rm-draw-prompt') || ''; if (attr && attr !== '1') text = attr; }
    return String(text || '').replace(/\s+/g, ' ').trim().length >= 4;
}

// cleanTitle：凑提示词时标题只取标题字。存图的位置（键）仍按以前的取法算，免得已经画好的图找不到、又花一次额度重画；
// 真正发给生图的那段用干净的标题。
function legacyTitle(frame) {
    return String(frame.closest?.('details')?.querySelector?.(':scope > summary')?.textContent || '').replace(/\s+/g, ' ').replace(/^【?兔子镜[:：]\s*/, '').replace(/】$/, '').trim();
}
function readPrompt(frame, { cleanTitle = false, legacyCaption = false } = {}) {
    const node = frame.querySelector?.('[data-rm-draw-prompt]');
    let text = node ? node.textContent : '';
    if (!String(text).trim()) {
        const attr = frame.getAttribute?.('data-rm-draw-prompt') || '';
        if (attr && attr !== '1') text = attr;
    }
    text = String(text || '').replace(/\s+/g, ' ').trim();
    // 图框在、画面描述却没写（模型漏写，或写到这里被截断了）：用这一面的标题和图框旁边写的字当画面，照样画。
    if (text.length < 4) {
        const title = cleanTitle ? fallbackTitle(frame) : legacyTitle(frame);
        const caption = frameCaption(frame, { legacy: legacyCaption }).replace(/^前：|；后：|^后：/g, ' ').replace(/\s*\/\s*/g, '，').trim();
        const fallback = [title, caption].filter(Boolean).join('：').replace(/\s+/g, ' ').trim();
        return fallback.length >= 8 ? fallback.slice(0, 400) : '';
    }
    return text.slice(0, 800);
}

// NAI 5（自然语言＋标签）：图框里另写的一行英文短标签，进标签栏；自然语言画面进自然语言栏，两栏不再塞同一段话。
// 图框在这一面里紧挨着的文字（前后各一两段，往外最多找三层）：标题、说明、时间点。
// 生图 LLM 照这个画「这张图在这一面里代表的东西」，不去画正文最新那段情节。
function frameCaption(frame, { legacy = false } = {}) {
    const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
    const textOf = node => {
        if (!node) return '';
        if (node.nodeType === 3) return clean(node.textContent);
        if (node.nodeType !== 1 || node.hidden || node.matches?.('script,style,template,[hidden],[data-rm-draw-frame],[aria-hidden="true"]')) return '';
        if (node.querySelector?.('[data-rm-draw-frame]')) return '';
        // 一律用 textContent：innerText 在这一面藏着（多面非当前面、收起）和显示着时结果不同，键会跟着变。
        // legacy：1.74.0 以前按 innerText 算的键，只用来找回那时存下的图。
        return clean(legacy && typeof node.innerText === 'string' ? node.innerText : node.textContent);
    };
    const before = [];
    const after = [];
    let node = frame;
    for (let level = 0; level < 3 && node && !node.matches?.('details'); level += 1) {
        for (let prev = node.previousSibling, count = 0; prev && count < 2; prev = prev.previousSibling) {
            const text = textOf(prev);
            if (text) { before.unshift(text.slice(-160)); count += 1; }
        }
        for (let next = node.nextSibling, count = 0; next && count < 2; next = next.nextSibling) {
            const text = textOf(next);
            if (text) { after.push(text.slice(0, 160)); count += 1; }
        }
        if ((before.join('') + after.join('')).length >= 120) break;
        node = node.parentElement;
    }
    return [before.length ? `前：${before.join(' / ')}` : '', after.length ? `后：${after.join(' / ')}` : ''].filter(Boolean).join('；').slice(0, 300);
}

function readTags(frame) {
    const node = frame.querySelector?.('[data-rm-draw-tags]');
    return String(node ? node.textContent : '').replace(/\s+/g, ' ').trim().slice(0, 600);
}

// 图框里逐个写的出场人物外貌：<p data-rm-draw-char="原名" hidden>外貌</p>。
// NAI 5 时另写的 <p data-rm-draw-char-tags="原名" hidden>简短外貌英文标签</p>，按原名配给同一个人，进人物的标签栏。
function readCharacters(frame) {
    const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
    const tags = new Map();
    for (const node of frame.querySelectorAll?.('[data-rm-draw-char-tags]') || []) {
        const name = clean(node.getAttribute('data-rm-draw-char-tags')).slice(0, 40);
        const text = clean(node.textContent).slice(0, 300);
        if (name && text && !tags.has(name)) tags.set(name, text);
    }
    const nodes = [...(frame.querySelectorAll?.('[data-rm-draw-char]') || [])];
    const seen = new Set();
    return nodes.map(node => {
        const name = clean(node.getAttribute('data-rm-draw-char')).slice(0, 40);
        return { name, text: clean(node.textContent).slice(0, 400), modelTag: tags.get(name) || '' };
    }).filter(person => {
        // 同一个人写了两条（几个图框共用一块说明时常见）：只留第一条。
        if (!person.name || seen.has(person.name) || !(person.text.length >= 2 || person.modelTag)) return false;
        seen.add(person.name);
        return true;
    }).slice(0, 4);
}

// 长相里不会因为这一幕变的几类：发色、瞳色、头发长短。
// 第一串（角色库）写了这一类，后面（模型写的）同一类说法不同的就不要，免得 silver hair 和 white hair 一起交给生图、发色画乱。
// 发型（马尾、披发）、衣着会随这一幕变，不算在里面；同一串里自己写的几种（比如挑染）都留着。
const TAG_HUE = '(?:black|white|silver|grey|gray|blonde?|brown|red|pink|blue|green|purple|violet|orange|yellow|aqua|teal|cyan|magenta|lavender|golden|gold|crimson|amber|azure|platinum|beige|cream|ash|navy|rainbow'
    + '|auburn|hazel|chestnut|ginger|copper|scarlet|emerald|ruby|sapphire|turquoise|indigo|lilac|maroon|olive|burgundy|peach|coral|mint|ivory|jet|raven|honey|caramel|rose|wine|plum|cerulean|cobalt|periwinkle|mauve|tan|bronze|rust|vermilion|viridian|aquamarine|lime|khaki|sand|snow|pearl|smoke|charcoal|ebony|flaxen|strawberry|lavender|orchid|fuchsia|salmon|apricot|mocha|hazelnut|ochre|umber|sepia|tangerine|lemon|sky|ice|midnight|moss|jade|sage|slate|steel|gunmetal|pewter|ultramarine|cherry|garnet|brick|rosy|pinkish|bluish|greenish|reddish|purplish|yellowish|brownish|greyish|grayish|whitish|blackish)';
// 「dark hair」「light blue eyes」「dark-blue hair」都算；multicolored、two-tone、渐变、挑染也是发色。
// 两个颜色词连写的（platinum blonde、ash blonde、silver-white、pinkish white）也算。
const TAG_COLOR = `(?:(?:(?:light|dark|pale|deep|bright)[-\\s]+)?${TAG_HUE}(?:ish)?(?:[-\\s]+${TAG_HUE})?|light|dark|pale|multicolou?red|two[-\\s]?tone|gradient|streaked)`;
// 「long black hair」「black long hair」「big red eyes」这种长短／样子和颜色写在一起的也算（柏宝绘自动建档就是这么写的）：
// 先把长短、样子的词去掉，再认颜色。
const TAG_STYLE = /\b(?:very|absurdly|long|short|medium|shoulder[-\s]?length|wavy|curly|straight|messy|spiky|fluffy|silky|big|large|small|narrow|sharp|droopy|tsurime|tareme)\b/g;
const TAG_LENGTH = /\b(?:long|short|medium|shoulder[-\s]?length)\b/;
const TAG_TRAITS = [
    ['hair-color', bare => /\bhair$/.test(bare) && new RegExp(`^${TAG_COLOR}\\s+hair$`).test(bare.replace(TAG_STYLE, ' ').replace(/\s+/g, ' ').trim())],
    ['eye-color', bare => bare === 'heterochromia' || (/\b(?:eyes|pupils|irises)$/.test(bare) && new RegExp(`^${TAG_COLOR}\\s+(?:eyes|pupils|irises)$`).test(bare.replace(TAG_STYLE, ' ').replace(/\s+/g, ' ').trim()))],
    ['hair-length', bare => /\bhair$/.test(bare) && TAG_LENGTH.test(bare)],
];

// 权重括号或 :: 没配对：这一段是跨逗号的权重组拆出来的半截，去掉它会让括号配不上，权重漏到后面所有标签上。这种不动。
function unbalancedGroup(part) {
    const count = (re) => (part.match(re) || []).length;
    return count(/\{/g) !== count(/\}/g) || count(/\[/g) !== count(/\]/g) || count(/\(/g) !== count(/\)/g) || count(/::/g) % 2 === 1;
}

// loose：认角色库那一串写了哪几类时用。角色库自己的跨逗号权重组（{silver hair, long hair}）拆开的半截也算它写过；
// 要去掉的（模型写的）才要求括号配对。
function tagTraits(part, loose = false) {
    if (!loose && unbalancedGroup(part)) return [];
    // 去掉权重写法再认：{silver hair}、[silver hair]、(silver hair:1.2)、1.2::silver hair::
    const bare = part.toLowerCase().replace(/^-?\d+(?:\.\d+)?::|::$/g, '').replace(/[{}[\]()]/g, '').replace(/:\s*-?\d+(?:\.\d+)?$/, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    return TAG_TRAITS.filter(([, test]) => test(bare)).map(([name]) => name);
}
function tagTrait(part, loose = false) { return tagTraits(part, loose)[0] || ''; }

// 逗号标签合并：前面的优先，大小写不同的同一标签只留一个；第一串写过的长相类，后面的同类不要。
function mergeTagLists(...lists) {
    const seen = new Set();
    const claimed = new Set(String(lists[0] || '').split(',').flatMap(part => tagTraits(part.trim(), true)));
    return lists.flatMap((list, index) => String(list || '').split(',').map(part => [part.trim(), index])).filter(([part, index]) => {
        const key = part.toLowerCase();
        if (!part || seen.has(key)) return false;
        if (index > 0 && tagTraits(part).some(trait => claimed.has(trait))) return false;
        seen.add(key);
        return true;
    }).map(([part]) => part).join(', ');
}

function storageKey(root, frame, prompt) {
    const details = frame.closest?.('details');
    const ctx = getContext();
    // 收藏夹里打开的那一面不属于当前聊天：用收藏时记下的聊天、楼层和 swipe 找回当时画好的图。
    const image = details?.dataset || {};
    // 独立 API 的多面镜子：每一面的归属（楼层、swipe）要等外壳挂好后才写到这一面上，可画图在那之前就开始了。
    // 这一面还没写上时，直接读外壳上的归属，免得同一张图前后用了两个键（先存在「楼层空」下，之后找不到又画一遍）。
    const shell = details?.parentElement?.matches?.('[data-rabbit-mirror-external-source="true"]') ? details.parentElement.dataset : {};
    const pick = (...values) => { for (const value of values) if (value !== undefined && value !== null && String(value) !== '') return String(value); return ''; };
    const chat = pick(image.rmImageOwnerChat, details?.dataset?.rabbitMirrorOwnerChat, shell.rmOwnerChat)
        || String(ctx.getCurrentChatId?.() ?? ctx.chatId ?? '');
    const mes = image.rmImageOwnerMesid ?? pick(details?.dataset?.rabbitMirrorOwnerMesid, shell.rmOwnerMesid, shell.rmExternalOwnerMessage);
    const swipe = image.rmImageOwnerSwipe ?? pick(details?.dataset?.rabbitMirrorOwnerSwipe, shell.rmOwnerSwipe);
    const frames = [...(root.querySelectorAll?.('[data-rm-draw-frame]') || [])];
    const index = Math.max(0, frames.indexOf(frame));
    return `builtin:${chat}:${mes}:${swipe}:${index}:${hashText(prompt)}`;
}

// 这一面里别的图框各自的键：序号挪了去找旧图时，不拿别的图框自己的那张。
function otherFrameKeys(root, frame) {
    const keys = new Set();
    for (const other of root?.querySelectorAll?.('[data-rm-draw-frame]') || []) {
        if (other === frame) continue;
        const text = readPrompt(other);
        if (text) keys.add(storageKey(root, other, text));
    }
    return keys;
}

function readSaved(key) {
    try { return { record: loadMirrorImage(key) }; }
    catch { return { broken: true }; }
}

// 当前键下没有这张图时：先找同一聊天里兼容的键（当时还没记上楼层），再看是不是聊天开了分支／改了名，图还存在旧名字下。
// 还找不到时：同一聊天、同一楼层、同一 swipe、同一段提示词，只是图框序号变了（重新进聊天时这一面的结构被整理过、
// 前面多了或少了一个图框）——也是那一张。claimed 是这一面里别的图框自己的键，被它们占着的不拿。
function savedKeyFor(key, claimed = null, legacyKey = '') {
    const own = readSaved(key);
    if (own.broken || own.record) return key;
    for (const other of [legacyKey, findCompatibleBuiltinImageKey(key), findBuiltinImageKeyFromOtherChat(key), findShiftedBuiltinImageKey(key, claimed)]) {
        if (other && other !== key && readSaved(other).record) return other;
    }
    return key;
}
// 没写画面说明、拿标题和旁边的字凑提示词的图框：1.74.0 以前相邻文字按 innerText 算，键可能不同。算一个旧键只用来找回。
function legacyKeyFor(root, frame) {
    if (hasModelPrompt(frame)) return '';
    const legacy = readPrompt(frame, { legacyCaption: true });
    return legacy ? storageKey(root, frame, legacy) : '';
}
function readSavedAnyChat(key, claimed = null, legacyKey = '') {
    const where = savedKeyFor(key, claimed, legacyKey);
    return where === key ? readSaved(key) : readSaved(where);
}

// 同一张图正在画（键可能是还没记上楼层的那个）：跟着那一次，不再另发一次请求。
// 已经发出去的生图请求（钱已经花了）也算「正在画」：中途切走聊天再切回来，聊天对象换了一个，
// 以前这一次就被当成过期的，回来又发一次，先前那张画好了也不存。现在回来就跟着那一次等结果。
// 发出去超过 10 分钟还没回音的，当它卡死了：不再跟着等，也不再挡着重画。
const SENT_WAIT_MS = 10 * 60 * 1000;
function liveEntry(entry) {
    if (!entry) return false;
    // 发出去以后 10 分钟一点回音都没有：当它卡死了（渠道那边没回调），同一聊天里也不再等它、不再挡着重画。
    if (entry.sent === true) return Date.now() - (entry.sentAt || 0) < SENT_WAIT_MS;
    return entry.isCurrent?.() === true;
}
// claimed：这一面里别的图框自己的键（或算出它的函数），序号挪了去认正在画的那一次时不认别人的。
function inflightKeyFor(key, claimed = null) {
    if (liveEntry(inflight.get(key))) return key;
    for (const [other, entry] of inflight) if (other !== key && liveEntry(entry) && builtinImageKeysCompatible(key, other)) return other;
    let taken = null;
    for (const [other, entry] of inflight) {
        if (other === key || !liveEntry(entry) || !builtinImageKeysShifted(key, other)) continue;
        taken ||= (typeof claimed === 'function' ? claimed() : claimed) || new Set();
        if (!taken.has(other)) return other;
    }
    return key;
}

function frameImageSize(frame) {
    const width = frame.clientWidth;
    const height = frame.clientHeight;
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
        return width >= height ? 'landscape' : 'portrait';
    }
    // Hidden frames can still declare their intended shape. Unknown geometry keeps the backend default.
    const view = frame.ownerDocument?.defaultView;
    const ratio = String(view?.getComputedStyle?.(frame)?.aspectRatio
        || frame.style?.getPropertyValue('aspect-ratio') || '').trim().replace(/^auto\s+/, '');
    const parts = ratio.split('/').map(part => Number(part.trim()));
    if (parts.length > 2 || parts.some(value => !Number.isFinite(value) || value <= 0)) return undefined;
    return parts[0] >= (parts[1] || 1) ? 'landscape' : 'portrait';
}

// 图框比例和画出来的图差太多时（比如图框是一条很扁的横幅，图是 3:2），铺满会把人头、手切掉。
// 这时不再裁：图框改成跟图一样的比例、高度跟着图走，整张图完整显示；图框的边框、圆角等其余样式不动。
const FIT_CROP_TOLERANCE = 1.15;
function unfitFrameToImage(frame, image) {
    const naturalWidth = image.naturalWidth, naturalHeight = image.naturalHeight;
    const width = frame.clientWidth, height = frame.clientHeight;
    if (!(naturalWidth > 0 && naturalHeight > 0 && width > 0 && height > 0)) return false;
    const imageRatio = naturalWidth / naturalHeight, frameRatio = width / height;
    if (Math.max(imageRatio / frameRatio, frameRatio / imageRatio) <= FIT_CROP_TOLERANCE) return false;
    frame.setAttribute('data-rm-draw-fit', 'image');
    frame.style.setProperty('height', 'auto', 'important');
    frame.style.setProperty('min-height', '0', 'important');
    frame.style.setProperty('max-height', 'none', 'important');
    frame.style.setProperty('aspect-ratio', `${naturalWidth} / ${naturalHeight}`, 'important');
    image.style.setProperty('height', '100%', 'important');
    return true;
}

function fitFrameImage(image, record) {
    // Only newly generated records opt into filling the frame; legacy saves retain their display policy.
    const cover = record?.builtinImageFit === 'cover';
    image.style.setProperty('object-fit', cover ? 'cover' : 'contain', 'important');
    image.style.setProperty('object-position', 'center', 'important');
    const frame = image.closest?.('[data-rm-draw-frame]');
    if (!cover || !frame) return;
    const check = () => {
        try {
            if (frame.clientWidth > 0 && frame.clientHeight > 0) { unfitFrameToImage(frame, image); return; }
            // 镜面折叠着量不到尺寸：等它展开时再量一次。
            frame.closest?.('details')?.addEventListener('toggle', () => { try { unfitFrameToImage(frame, image); } catch {} }, { once: true });
        } catch { /* 量不到就照旧铺满 */ }
    };
    if (image.complete && image.naturalWidth) check();
    image.addEventListener('load', check, { once: true });
}

// 存档里的图片文件在酒馆服务器上已经没有了（换了设备、图片目录被清理）：以前坏图标一直挂着。
// 现在先换历史版本里还能读的那张；都读不到就说明情况，留「重新生图」，再画要花一次额度。
const unreadable = new Set();
// 这次打开页面里画好的图：本机存储满了没存进去时，这一面重新挂上（切面、刷新工具、重新渲染）还能放回去，不再画一遍。
const sessionRecords = new Map();
// 同一个图框位置（聊天、楼层、swipe、第几个图框）自动画了几次：10 分钟内自动画满 2 次就不再自动画，
// 改成留「重新生图」按钮。存不进去、提示词每次读出来不一样这类毛病，最多多花一次，不会一直画下去。
const AUTO_DRAW_WINDOW_MS = 10 * 60 * 1000;
const AUTO_DRAW_LIMIT = 2;
const autoDraws = new Map();
// 最近一次画好却一点也没存进去的键：重新挂上时放这次画的那张，不放存档里更旧的。换版本、存成功后去掉。
const unsavedKeys = new Set();
// 位置不看提示词：聊天、楼层、swipe（取自键），再加这一面在这条消息里是第几面、图框是这一面的第几个。
function frameSlot(key, frame) {
    const parts = String(key).split(':');
    const details = frame?.closest?.('details');
    const face = details?.parentElement ? [...details.parentElement.children].filter(node => node.matches?.('details')).indexOf(details) : 0;
    const frames = details ? [...details.querySelectorAll('[data-rm-draw-frame]')] : [];
    const own = Math.max(0, frames.indexOf(frame));
    // 融合在回复里的镜面键里没记楼层：从所在的那条消息取；还取不到就把提示词指纹算进位置，免得各楼层挤在一个位置上互相拦。
    let mes = parts.length >= 6 ? parts[parts.length - 4] : '';
    if (!mes) mes = String(frame?.closest?.('.mes[mesid]')?.getAttribute('mesid') || '');
    const swipe = parts.length >= 6 ? parts[parts.length - 3] : '';
    const chat = parts.length >= 6 ? parts.slice(1, -4).join(':').replace(/^chat:/, '') : String(key);
    return `${chat}:${mes || `#${parts[parts.length - 1] || ''}`}:${swipe}:${face}:${own}`;
}
function recentAutoDraws(slot) {
    const now = Date.now();
    const list = (autoDraws.get(slot) || []).filter(at => now - at < AUTO_DRAW_WINDOW_MS);
    autoDraws.set(slot, list);
    return list;
}
function sessionRecordFor(key) {
    if (sessionRecords.has(key)) return sessionRecords.get(key);
    for (const [other, record] of sessionRecords) if (builtinImageKeysCompatible(key, other) || builtinImageKeysShifted(key, other)) return record;
    return null;
}
// 以前存档里存过带主机的完整网址（比如在家用局域网地址画的）：换个地址打开酒馆（手机、外网）时主机对不上，
// 但文件还在这台酒馆上，所以同一路径再按当前地址试一次。
function sameHostAlternative(url) {
    try {
        const parsed = new URL(url), here = new URL(document.baseURI);
        if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin === here.origin || !/^\/user\//.test(parsed.pathname)) return '';
        return `${here.origin}${parsed.pathname}${parsed.search}`;
    } catch { return ''; }
}
function paintCandidates(record) {
    const list = [record, ...(Array.isArray(record?.history) ? [...record.history].reverse() : [])];
    const seen = new Set();
    // 先试当前地址：别的主机常常要等很久才报错。
    return list.flatMap(entry => [entry?.url || entry?.path, entry?.dataUrl]).map(safeImageUrl).flatMap(url => [sameHostAlternative(url), url])
        .filter(url => url && !seen.has(url) && seen.add(url));
}
function watchImageLoad(frame, image, record, root, key) {
    const candidates = paintCandidates(record);
    let index = 0;
    image.src = candidates[0];
    image.onerror = () => {
        index += 1;
        if (index < candidates.length) { image.src = candidates[index]; return; }
        image.remove();
        if (key) unreadable.add(key);
        note(frame, '这一面画好的图读不到了：生图服务给的是临时链接、已经失效，或者图片文件不在这台酒馆上。点「重新生图」会再画一次，要花一次额度；新画的图会存进酒馆，以后不会再丢。', root);
    };
}

function paint(frame, record, root = null, key = '') {
    if (isRabbitMirrorLinkedAvatarFrame(frame)) return false;
    const url = safeImageUrl(record?.url || record?.path || record?.dataUrl);
    if (!url) return false;
    const promptNode = frame.querySelector?.('[data-rm-draw-prompt]');
    if (promptNode) promptNode.hidden = true;
    hideFrameExtraMedia(frame);
    hideSiblingSubstituteImages(frame);
    frame.querySelector?.('[data-rm-draw-status]')?.remove();
    let image = frame.querySelector?.('img[data-rm-draw-result]');
    if (!image) {
        image = frame.ownerDocument.createElement('img');
        image.setAttribute('data-rm-draw-result', '1');
        image.alt = '这一面的画面';
        image.style.cssText = 'display:block;width:100%;height:100%;';
        frame.prepend(image);
    }
    fitFrameImage(image, record);
    watchImageLoad(frame, image, record, root, key);
    return true;
}

function note(frame, text, root = null) {
    if (isRabbitMirrorLinkedAvatarFrame(frame)) return;
    frame.querySelector?.('[data-rm-draw-status]')?.remove();
    const doc = frame.ownerDocument;
    const box = doc.createElement('div');
    box.setAttribute('data-rm-draw-status', '1');
    box.style.cssText = 'margin:0;padding:12px;font-size:12px;line-height:1.45;display:grid;gap:8px;align-content:center;height:100%;box-sizing:border-box;';
    const line = doc.createElement('p');
    line.textContent = text;
    line.style.cssText = 'margin:0;opacity:.72;';
    box.append(line);
    if (root) {
        // 失败后由用户决定要不要再画一次；只在点击时发一次请求，不自动重试。
        const row = doc.createElement('div');
        row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
        const button = (label, run) => {
            const node = doc.createElement('button');
            node.type = 'button';
            node.textContent = label;
            node.style.cssText = 'padding:5px 10px;border-radius:8px;border:1px solid currentColor;background:transparent;color:inherit;font-size:12px;cursor:pointer;';
            node.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); run(node); });
            return node;
        };
        row.append(button('重新生图', () => { const prompt = readPrompt(frame); failed.delete(storageKey(root, frame, prompt)); box.remove(); void fillFrame(root, frame, { manual: true }); }));
        box.append(row);
    }
    frame.append(box);
}

function anyWaiterConnected(key) {
    const nodes = waiters.get(key);
    if (!nodes) return false;
    for (const waiter of nodes) if (waiter.frame.isConnected && waiter.isCurrent() && !isRabbitMirrorLinkedAvatarFrame(waiter.frame)) return true;
    return false;
}

function imageRequestOwner() {
    const context = getContext();
    const chat = context?.chat;
    const identity = rabbitMirrorAvatarPromptIdentity(context);
    return () => {
        const settings = getSettings(), current = getContext();
        return settings.builtinImageEnabled === true && settings.enabled !== false && settings.mode !== 'off'
            && current?.chat === chat && rabbitMirrorAvatarPromptIdentity(current) === identity;
    };
}

function staleImageRequest() {
    return Object.assign(new Error('聊天、人物或生图设置已变化，本次未继续请求。'), { code: 'stale_owner' });
}

function reportProgress(key, text) {
    if (progress.get(key) === text) return;
    progress.set(key, text);
    for (const { frame, isCurrent, quiet, onText } of waiters.get(key) || []) {
        if (onText) { try { onText(text); } catch { /* 面板关了 */ } }
        // 从小兔子面板里重画时，镜面上的旧图保持原样，不盖进度条。
        if (!quiet && frame.isConnected && isCurrent()) note(frame, text);
    }
}

async function imageCharacters(floor) {
    try { return await getImageCharacters({ floor }); }
    catch (error) {
        console.warn('[RabbitMirror] 生图角色库暂不可用，保留本面已有角色资料', error);
        return [];
    }
}

// 没开生图 LLM 时，外貌原来只靠兔子镜模型顺手写的一句；用户在柏宝绘角色库／智绘姬角色预设里配好的外貌没用上。
// 这里按原名把角色库里唯一对得上的那份外貌放在前面，模型写的接在后面（两边都留，不互相覆盖）；
// 模型漏写了外貌、但画面里点了角色卡或 Persona 的名字时，也从角色库补上这个人。
function uniqueLibrary(list) {
    const counts = new Map();
    for (const person of list) counts.set(person.name, (counts.get(person.name) || 0) + 1);
    return new Map(list.filter(person => person.name && counts.get(person.name) === 1).map(person => [person.name, person]));
}

function mergeAppearance(library, modelText, tagsOnly) {
    // NAI 5：角色库的英文标签另放进标签栏，这里只合并自然语言外貌；角色库只有标签时，标签栏照样用上。
    // 标签写法只用建档的英文标签；建档只有中文自然语言时不塞进标签栏。
    const base = tagsOnly ? String(library?.tag || '') : String(library?.nl || '');
    if (!base.trim()) return modelText;
    if (!modelText) return base.trim();
    // 标签写法：角色库的标签在前，模型写的接在后面（去掉一模一样的）。
    // 角色库只管长相，这一幕穿什么衣服只有模型写的那份里有，不能整串丢掉。
    if (tagsOnly) return mergeTagLists(base, modelText);
    return modelText.includes(base.trim()) ? modelText : `${base.trim()}; ${modelText}`;
}

// 这一面没写、或写空了某个人的外貌（只写了「黑发」这种和设定对不上的）：从这张卡绑定的世界书里按名字摘出长相那几句补上。
// 世界书写的长相放在前面；它写了发色就去掉模型写的发色词，写了瞳色就去掉模型写的瞳色词（只去这几个词，衣着、动作照留），
// 英文标签里的发色、瞳色标签同样处理。角色库里配了这个人外貌的，以角色库为准，不再补。
// NAI 4.5 标签写法只收英文标签，中文的世界书原文用不上，不补。
const COLOR = '(?:乌|淡|浅|深|暗|亮|雪|酒|玫瑰|天|湖|海|宝|靛|藏|藕|杏|米|奶|珍珠|象牙|烟|银灰|铁|钴|翠|松|墨|绯|朱|丹|胭脂|樱|桃|橘|柠檬)?(?:[黑白银金红棕灰紫蓝粉绿褐赤青墨碧黄橙茶栗紫靛绯朱丹翠]{1,2}|琥珀|亚麻|焦糖|蜂蜜|栗子|玫瑰|葡萄|薰衣草|祖母绿|宝石蓝|天蓝|湖蓝|海蓝|冰蓝|深|浅)色?';
// 发色：「黑发」「乌黑长发」「黑色的头发」「一头银发」「发色偏深」；不算「发带、发夹、白发苍苍」。
const HAIR = `(?:一头|一头乌黑的?)?${COLOR}的?(?:长|短|卷|直|微卷|及腰|齐肩)*(?:头)?发(?![带簪饰绳夹冠圈卡苍型际胶蜡])|${COLOR}长直|发色(?:为|是|呈|偏)?(?:${COLOR})?`;
// 瞳色：「碧眼」「蓝色的眼睛」「深色瞳孔」「眼睛是蓝色的」；不算「眼镜」。
const EYE = `${COLOR}的?(?:瞳孔?|眸子?|眼睛|眼眸|眼瞳|眼(?![镜罩神角皮影圈线袋妆泪眶]))|(?:眼睛|眼眸|瞳孔)(?:是|为|呈)${COLOR}的?|[瞳眸]色(?:为|是|呈)?(?:${COLOR})?`;
const HAIR_WORDS = new RegExp(HAIR, 'g');
const EYE_WORDS = new RegExp(EYE, 'g');
const HAS_HAIR = new RegExp(HAIR);
const HAS_EYE = new RegExp(EYE);
// 这个人的长相已经从更靠前的来源定下来（建档、角色卡、世界书）：模型写的里头关于发色、瞳色的词去掉，衣着、动作照留；
// 英文标签里「颜色＋hair／eyes」的也去掉（hair ornament、closed eyes 不动；带权重括号的整串不拆）。
function stripModelLooks(person, { hair, eye }) {
    if (!hair && !eye) return;
    let rest = String(person.text || '');
    if (hair) rest = rest.replace(HAIR_WORDS, '');
    if (eye) rest = rest.replace(EYE_WORDS, '');
    person.text = rest.replace(/(^|[，,、。；;])\s*的/g, '$1').replace(/([，,、])\s*(?=[，,、。；;]|$)/g, '').replace(/^[，,、。；;\s]+/, '').trim();
    const tags = String(person.modelTag || '');
    if (tags && !/[{}()[\]]/.test(tags)) {
        person.modelTag = tags.split(',').map(tag => tag.trim()).filter(tag => {
            const traits = tagTraits(tag, true);
            return !((hair && traits.includes('hair-color')) || (eye && traits.includes('eye-color')));
        }).join(', ');
    }
}
// 英文标签串里写了发色／瞳色没有（建档角色的 tag）。
function tagHasLooks(tags) {
    const parts = String(tags || '').split(',').map(part => part.trim()).filter(Boolean);
    return { hair: parts.some(part => tagTraits(part, true).includes('hair-color')), eye: parts.some(part => tagTraits(part, true).includes('eye-color')) };
}

// 第二来源：角色卡（描述、性格）和 Persona 里写的长相。建档没有这个人、这一面又把长相写错时，从这里摘。
// 图框里写了名字的人（包括外貌写空、被 readCharacters 丢掉的）。
function frameCastNames(frame) {
    return [...new Set([...(frame?.querySelectorAll?.('[data-rm-draw-char]') || [])]
        .map(node => String(node.getAttribute('data-rm-draw-char') || '').replace(/\s+/g, ' ').trim().slice(0, 40)).filter(Boolean))].slice(0, 4);
}
async function withCardAppearance(people, frame, tagsOnly) {
    if (tagsOnly) return people;
    const names = frameCastNames(frame);
    const pending = names.filter(name => !people.find(person => person.name === name)?.looksSource);
    if (!pending.length) return people;
    let cast = '';
    let charName = '', personaName = '';
    try {
        const ctx = getContext();
        const char = ctx?.characters?.[ctx?.characterId] || ctx?.character || {};
        const data = char?.data && typeof char.data === 'object' ? char.data : char;
        charName = String(char?.name || data?.name || ctx?.name2 || '').trim();
        personaName = String(ctx?.name1 || globalThis.name1 || '').trim();
        // 角色卡里的 {{char}}／{{user}} 换成名字，不然摘出来的长相带着宏、名字也对不上。
        const fill = value => String(value || '').replace(/\{\{\s*char\s*\}\}/gi, charName || '').replace(/\{\{\s*user\s*\}\}/gi, personaName || '');
        const rows = [];
        const charText = fill([data?.description || char?.description || '', data?.personality || char?.personality || ''].map(value => String(value || '')).join('\n')).trim();
        if (charName && charText) rows.push({ book: '角色卡', title: charName, content: charText.slice(0, 12000) });
        const personaText = fill(ctx?.powerUserSettings?.persona_description || globalThis.power_user?.persona_description || ctx?.personaDescription || '').trim();
        if (personaName && personaText) rows.push({ book: 'Persona', title: personaName, content: personaText.slice(0, 12000) });
        cast = rows.map(row => JSON.stringify(row)).join('\n');
    } catch { cast = ''; }
    if (!cast) return people;
    const { appearanceFromCast } = await import('./characterWorldBook.js?rmv=1.74.0');
    const merged = people.map(person => ({ ...person }));
    // 角色卡里提到 Persona、Persona 里提到角色：摘到对方的名字就停，不把对方的长相算进来。
    const others = [...new Set([...names, charName, personaName].filter(Boolean))];
    for (const name of pending) {
        const looks = appearanceFromCast(cast, name, others);
        if (!looks) continue;
        const person = merged.find(item => item.name === name);
        if (!person) { if (merged.length < 4) merged.push({ name, text: looks, modelTag: '', looksSource: '人设' }); continue; }
        stripModelLooks(person, { hair: HAS_HAIR.test(looks), eye: HAS_EYE.test(looks) });
        person.text = [looks, person.text].filter(Boolean).join(' ');
        person.looksSource = '人设';
    }
    return merged;
}

const worldCastCache = new Map();
// 同一张卡、同一批人名 60 秒内共用一次读取（几张图同时画时不重复读）。读取不跟某一张图的取消走，免得取消一张连累别的图；
// 每张图自己的取消在 withWorldBookAppearance 里单独看。
function readWorldCast(names) {
    const ctx = getContext();
    const character = ctx?.characters?.[ctx?.characterId];
    const disabled = getSettings().independentWorldInfoDisabledBooks || [];
    const key = JSON.stringify([ctx?.characterId ?? '', character?.avatar || character?.name || '', character?.data?.extensions?.world || '', disabled, [...names].sort()]);
    const hit = worldCastCache.get(key);
    if (hit && Date.now() - hit.at < 60000) return hit.promise;
    const promise = import('./characterWorldBook.js?rmv=1.74.0').then(module => module.readCharacterWorldBookContext(ctx, {
        disabledBooks: disabled, focusText: names.join('\n'), onlyMentioned: true, maxChars: 4000,
    })).then(result => String(result?.text || '')).catch(() => { worldCastCache.delete(key); return ''; });
    worldCastCache.set(key, { at: Date.now(), promise });
    if (worldCastCache.size > 20) worldCastCache.delete(worldCastCache.keys().next().value);
    return promise;
}
async function withWorldBookAppearance(people, frame, tagsOnly, signal = null) {
    if (tagsOnly) return people;
    const names = frameCastNames(frame);
    if (!names.length || names.every(name => people.find(person => person.name === name)?.looksSource)) return people;
    const cast = await readWorldCast(names);
    if (signal?.aborted) throw Object.assign(new Error('生图已取消。'), { name: 'AbortError', code: 'aborted' });
    if (!cast) return people;
    const { appearanceFromCast } = await import('./characterWorldBook.js?rmv=1.74.0');
    const merged = people.map(person => ({ ...person }));
    // 世界书里没出场的第三人（角色卡主角、Persona）也算「别人」，他们的长相不会被算到这个人头上。
    let others = names;
    try { const ctx = getContext(); others = [...new Set([...names, String(ctx?.name2 || '').trim(), String(ctx?.name1 || globalThis.name1 || '').trim()].filter(Boolean))]; } catch { /* 照旧 */ }
    for (const name of names) {
        const person = merged.find(item => item.name === name);
        if (person?.looksSource) continue;
        const looks = appearanceFromCast(cast, name, others);
        if (!looks) continue;
        if (!person) { if (merged.length < 4) merged.push({ name, text: looks, modelTag: '', looksSource: '世界书' }); continue; }
        stripModelLooks(person, { hair: HAS_HAIR.test(looks), eye: HAS_EYE.test(looks) });
        person.text = [looks, person.text].filter(Boolean).join(' ');
        person.looksSource = '世界书';
    }
    return merged;
}

async function withLibraryAppearance(people, prompt, frame, tagsOnly) {
    const details = frame?.closest?.('details');
    const floorValue = Number(details?.dataset?.rabbitMirrorOwnerMesid);
    const floor = Number.isSafeInteger(floorValue) && floorValue >= 0 ? floorValue : undefined;
    const raw = await imageCharacters(floor);
    const library = uniqueLibrary((Array.isArray(raw) ? raw : []).map(person => ({
        name: String(person?.name || '').trim(), tag: String(person?.tag || '').trim(), nl: String(person?.nl || '').trim(),
    })).filter(person => person.name && (person.tag || person.nl)));
    if (!library.size) return people;
    // 建档角色排第一：它写了发色／瞳色的，模型写的同类词去掉，不让两种发色一起发给生图。
    // 模型给名字加了后缀（「甲（少女）」）时，按建档里唯一包含／被包含的那个名字认。
    const entryFor = name => library.get(name) || (() => {
        const hits = [...library.keys()].filter(key => key.length >= 2 && name.length >= 2 && (name.includes(key) || key.includes(name)));
        return hits.length === 1 ? library.get(hits[0]) : null;
    })();
    const merged = people.map(person => {
        const entry = entryFor(person.name);
        if (!entry) return { ...person };
        const next = { ...person };
        const looks = tagHasLooks(entry.tag);
        const nlLooks = { hair: HAS_HAIR.test(entry.nl || ''), eye: HAS_EYE.test(entry.nl || '') };
        if (!tagsOnly) stripModelLooks(next, { hair: looks.hair || nlLooks.hair, eye: looks.eye || nlLooks.eye });
        // 标签写法下建档只有中文自然语言（没有标签）：这一路什么都没给，不算「建档」来源，后面的角色卡、世界书照常补。
        if (tagsOnly && !String(entry.tag || '').trim()) return next;
        return { ...next, text: mergeAppearance(entry, next.text, tagsOnly), libraryTag: String(entry.tag || ''), fromLibrary: true, looksSource: '建档' };
    });
    const ctx = getContext();
    const owners = [characterGroup(), String(ctx?.name1 || globalThis.name1 || '').trim()].filter(Boolean);
    for (const name of owners) {
        // 这个人已经在了（含模型加了后缀的写法）就不再补一条，免得同一个人发成两条。
        if (merged.length >= 4 || merged.some(person => person.name === name || (name.length >= 2 && (person.name.includes(name) || name.includes(person.name))))) continue;
        if (!library.has(name) || !String(prompt || '').includes(name)) continue;
        merged.push({ name, text: mergeAppearance(library.get(name), '', tagsOnly), libraryTag: String(library.get(name)?.tag || ''), fromLibrary: true, looksSource: '建档' });
    }
    return merged.filter(person => person.text || person.libraryTag || person.modelTag);
}

function planningFailure() {
    return Object.assign(new Error('生图 LLM 未完成画面规划，本次未调用生图。请检查生图 LLM 设置后点“重新生图”。'), { code: 'image_plan_failed' });
}

// 同一条回复里几面的生图 LLM 规划按顺序进行：后面的面能看到前面已经定下的画面，
// 不会几张图都画成同一个动作（各面同时规划时互相看不见）。只排规划，出图照样并行。
const planQueues = new Map();
function planGroupOf(key) { return String(key).split(':').slice(0, -2).join(':'); }
function planInOrder(key, run) {
    const group = planGroupOf(key);
    let queue = planQueues.get(group);
    if (!queue) {
        queue = { tail: Promise.resolve(), scenes: [], touched: 0 };
        planQueues.set(group, queue);
        if (planQueues.size > 30) {
            const oldest = [...planQueues.entries()].sort((a, b) => a[1].touched - b[1].touched)[0];
            if (oldest && oldest[0] !== group) planQueues.delete(oldest[0]);
        }
    }
    queue.touched = Date.now();
    const turn = queue.tail.catch(() => {}).then(async () => {
        const plan = await run(queue.scenes.slice(-4));
        const scene = String(plan?.nl || plan?.flatPrompt || plan?.prompt || '').replace(/\s+/g, ' ').trim().slice(0, 240);
        if (scene) queue.scenes.push(scene);
        if (queue.scenes.length > 8) queue.scenes.splice(0, queue.scenes.length - 8);
        return plan;
    });
    queue.tail = turn;
    return turn;
}

// 简短线索不是完整提示词，规划失败时保留图框，不继续花费绘图额度。
async function planWithImageLlm(frame, onProgress, promptFormat, isCurrent, otherScenes = []) {
    try {
        const details = frame?.closest?.('details');
        const bridge = globalThis.__rabbitMirrorIndependentActionsV1;
        const target = details && typeof bridge?.prepareImageTarget === 'function' ? bridge.prepareImageTarget(details) : null;
        if (!target?.plan) throw planningFailure();
        const focus = readPrompt(frame, { cleanTitle: true });
        const publicCharacters = await imageCharacters(target.floor);
        if (!isCurrent()) throw staleImageRequest();
        // 图框里模型写好的出场人物外貌和当时衣着一并单独给生图 LLM，不让它从别处另找衣着、场景。
        const plan = await target.plan({ focus, frameCaption: frameCaption(frame), sceneCharacters: readCharacters(frame), publicCharacters, promptFormat, otherScenes }, { builtin: true, onProgress });
        if (!plan || !String(plan.prompt || plan.flatPrompt || plan.nl || '').trim()) throw planningFailure();
        return plan;
    } catch (error) {
        if (error?.code === 'stale_owner') throw error;
        console.warn('[RabbitMirror] 生图 LLM 规划未完成，保留图框且不调用绘图', error);
        throw planningFailure();
    }
}

function startJob(key, prompt, frame, isCurrent, options = {}) {
    const existing = inflight.get(key);
    if (liveEntry(existing)) return existing.job;
    const entry = { job: null, isCurrent, sent: false };
    const job = (async () => {
        if (!isCurrent()) throw staleImageRequest();
        // 模型没写画面、插件拿标题和旁边的字凑的：发给生图的那段用干净的标题（不带标题条上的按钮字）。
        if (!options.direct && !hasModelPrompt(frame)) prompt = readPrompt(frame, { cleanTitle: true }) || prompt;
        const size = frameImageSize(frame);
        const settings = { ...getSettings() };
        // 重画：沿用上次构思好的提示词只换随机种子（不再调用生图 LLM）；改了提示词时直接按改过的画。
        const withLlm = imageLlmConfigured(settings) && !options.reuse && !options.direct;
        if (withLlm) reportProgress(key, '等前面几面定好画面，再构思这一面…');
        const planned = options.reuse || (withLlm ? await planInOrder(key, otherScenes => {
            if (!isCurrent()) throw staleImageRequest();
            reportProgress(key, '生图 LLM 正在构思画面提示词…');
            return planWithImageLlm(frame, phase => {
                if (isCurrent() && (phase === 'response-chunk' || phase === 'connection-manager-frame')) {
                    reportProgress(key, '生图 LLM 正在返回画面提示词…');
                }
            }, settings.imagePromptFormat, isCurrent, otherScenes);
        }) : null);
        if (!isCurrent()) throw staleImageRequest();
        const provider = settings.imageBackend === 'chatu8' ? '智绘姬' : '柏宝绘';
        reportProgress(key, `${withLlm ? '提示词已完成，' : ''}正在交给${provider}生图…`);
        // 交给生图前把标签理一遍：人数和性别放最前、粘在一起的拆开、重复的去掉（见 imageTagTidy.js）。
        // 只理真正是标签的字段：生图 LLM 的 prompt 是标签，它的 flatPrompt 在 NAI 5 下是自然语言；
        // 没有生图 LLM 时，这一面没写标签行，prompt 退回的是自然语言画面，也不理。
        let tidy = { promptIsTags: true, flatTagLines: 'none' };
        let looksSources = options.looksSources && typeof options.looksSources === 'object' ? options.looksSources : null;
        const payload = planned ? {
            prompt: String(planned.prompt || planned.flatPrompt || planned.nl || ''),
            flatPrompt: String(planned.flatPrompt || ''),
            nl: String(planned.nl || ''),
            characters: Array.isArray(planned.characters) ? planned.characters : [],
            promptFormat: planned.promptFormat || settings.imagePromptFormat,
        } : await (async () => {
            // 没有生图 LLM：按提示词格式分开填，标签写法不再把同一句话当成自然语言再发一次。
            const tagsOnly = settings.imagePromptFormat === 'nai45-tags';
            // 人物标签栏：角色库的标签在前（用户自己写的长相，最准），模型写的接在后面，去掉一模一样的。
            // 以前角色库配了就整串不用模型写的，这一幕的衣着也跟着丢了。
            const tagOf = person => mergeTagLists(person.libraryTag, person.modelTag);
            // 每个人至少要有这种写法用得上的外貌：标签写法看标签，NAI 5 看自然语言或标签，空的人不发。
            // 长相来源的先后：建档角色 → 角色卡／Persona → 世界书 → 模型自己写的。前面有的，后面不再管这个人。
            const people = (await withWorldBookAppearance(await withCardAppearance(await withLibraryAppearance(readCharacters(frame), prompt, frame, tagsOnly), frame, tagsOnly), frame, tagsOnly, options.signal || null))
                .filter(person => tagsOnly ? String(person.text || '').trim() : String(person.text || '').trim() || tagOf(person));
            if (!isCurrent()) throw staleImageRequest();
            // 角色库外貌在前、模型写的在后，两边都保留；单提示词也逐人具名，不匿名混拼。
            // 单提示词后端按「原名: 自然语言外貌; 标签」逐人具名，和 buildSingleImagePrompt 的写法一致，不重复同一人。
            // NAI 5 人物标签栏：角色库的标签在前，模型照角色卡、世界书写的简短外貌标签补在后面。
            const appearanceOf = person => tagsOnly ? person.text : [...new Set([person.text, tagOf(person)].filter(Boolean))].join('; ');
            const appearance = people.map(person => `${person.name}: ${appearanceOf(person)}`).join('\n');
            looksSources = Object.fromEntries(people.map(person => [person.name, person.looksSource || '模型写的']));
            // NAI 5：标签栏放模型另写的英文短标签，自然语言栏放画面描述；旧镜面没写标签时仍只发画面描述这一份。
            const tags = tagsOnly ? '' : readTags(frame);
            return {
                prompt: tags || prompt,
                // 只收一段提示词的渠道：NAI 5 先放场景标签，再放自然语言画面，最后逐人外貌。
                flatPrompt: [tags, prompt, appearance].filter(Boolean).join('\n'),
                nl: tagsOnly ? '' : prompt,
                // 标签写法：这一面是按 NAI 5 写的（外貌是中文）、又另写了英文 char-tags 时，标签栏用英文标签，不塞中文。
                characters: people.map(person => ({ name: person.name, tag: tagsOnly ? (/[\u3400-\u9fff]/.test(person.text) && tagOf(person) ? tagOf(person) : person.text) : tagOf(person), nl: tagsOnly ? '' : person.text })),
                promptFormat: settings.imagePromptFormat,
            };
        })();
        if (planned) {
            const plannedTagsOnly = (planned.promptFormat || settings.imagePromptFormat) === 'nai45-tags';
            const promptText = String(planned.prompt || '').trim();
            // 重画沿用旧记录时：没写标签行的那种，记录里的 prompt 就是自然语言画面（和 nl 一样），不能当标签理。
            const promptIsTags = plannedTagsOnly ? !!promptText
                : options.reuse ? !!promptText && !!String(planned.nl || '').trim() && promptText !== String(planned.nl || '').trim()
                    : !!promptText;
            tidy = { promptIsTags, flatTagLines: plannedTagsOnly ? 'all' : 'none' };
        } else {
            const directTagsOnly = settings.imagePromptFormat === 'nai45-tags';
            const hasTags = !directTagsOnly && !!readTags(frame);
            tidy = { promptIsTags: directTagsOnly || hasTags, flatTagLines: directTagsOnly ? 'all' : hasTags ? 'first' : 'none' };
        }
        const generated = await generateMirrorImage(tidyImagePayload(payload, tidy), {
            character: characterGroup(),
            size,
            ...(options.signal ? { signal: options.signal } : {}),
            // 这里通过就是真要发请求了：记下来，之后切走聊天也等它画完、存下，不再另发一次。
            assertCurrent: () => {
                const ok = isCurrent() && anyWaiterConnected(key);
                if (ok) { entry.sent = true; entry.sentAt = Date.now(); if (options.slot && !options.reuse && !options.direct && !options.manual) recentAutoDraws(options.slot).push(Date.now()); }
                return ok;
            },
            onProgress: event => {
                const phase = { queued: '排队中', generating: '绘制中', 'queued-remote': '远端排队中', retrying: '按渠道规则重试中', saving: '保存中' }[event?.phase];
                // 切走又切回来时这一次的归属已过期，进度照样报给回来后跟着等的那个图框（各图框自己再看归属）。
                // 还在报进度（排队、绘制中）就不算卡住：重新计那 10 分钟。
                if (entry.sent) entry.sentAt = Date.now();
                if (phase && (isCurrent() || entry.sent)) reportProgress(key, `${provider}：${phase}…`);
            },
        });
        const record = { ...generated, builtinImageFit: 'cover', ...(looksSources ? { looksSources } : {}), ...(options.direct ? { editedPrompt: true } : {}) };
        if (inflight.get(key) === entry) {
            // 只记看图要的那份（有文件路径时不留整张图的 data:），最多记 200 张。
            const { dataUrl, ...light } = record;
            sessionRecords.delete(key);
            sessionRecords.set(key, record.path ? light : record);
            if (sessionRecords.size > 200) sessionRecords.delete(sessionRecords.keys().next().value);
            try { saveMirrorImage(key, record); unsavedKeys.delete(key); }
            catch (error) {
                // 存不下整份：只存看图要的（地址、时间、种子），刷新后至少图还在、不会再画一遍。
                let minimalSaved = false;
                try {
                    const meta = record.promptMetadata || {};
                    saveMirrorImage(key, { url: record.url, path: record.path, ...(record.path ? {} : { dataUrl: record.dataUrl }), generatedAt: record.generatedAt,
                        provider: record.provider, builtinImageFit: record.builtinImageFit, promptMetadata: { seed: meta.seed, promptFormat: meta.promptFormat, size: meta.size } });
                    minimalSaved = true;
                } catch { /* 还是存不下 */ }
                console.warn('[RabbitMirror] 内置生图已画成，但没能写入本机存档', error);
                // 画好了却没存进去（多半是本机存储满了）：记下原因，重画时如实告诉用户，不再说成「换好了」。
                if (minimalSaved) unsavedKeys.delete(key);
                else { unsavedKeys.add(key); Object.defineProperty(record, 'saveError', { value: error, enumerable: false }); }
            }
        }
        return record;
    })();
    entry.job = job;
    if (inflight.get(key) !== entry) progress.delete(key);
    inflight.set(key, entry);
    const cleanup = () => {
        if (inflight.get(key) === entry) { inflight.delete(key); progress.delete(key); }
    };
    job.then(cleanup, cleanup);
    return job;
}

async function fillFrame(root, frame, { manual = false } = {}) {
    const isCurrent = imageRequestOwner();
    // A saved pair may still be hydrating on reload. Resolve that local-only
    // bridge before an avatar placeholder can spend a drawing request.
    if (await prepareRabbitMirrorAvatarFrame(frame)) return;
    if (!isCurrent() || !frame.isConnected) return;
    ensureFrameBox(frame);
    const existingImage = frame.querySelector?.('img[data-rm-draw-result][src]');
    if (existingImage) return;
    const prompt = readPrompt(frame);
    if (!prompt) return;
    const key = storageKey(root, frame, prompt);
    const saved = readSavedAnyChat(key, () => otherFrameKeys(root, frame), legacyKeyFor(root, frame));
    if (saved.broken) {
        note(frame, '这一面的画面存档读不出来，没有重新生图。', root);
        return;
    }
    // 读不到的那张不再反复拿出来：按「重新生图」后直接发请求。
    // 这次打开页面里画过、比存档里的新（重画了却没存进去）：放这张，不再画。
    const remembered = !manual && !unreadable.has(key) ? sessionRecordFor(key) : null;
    const newer = remembered && (!saved.record || unsavedKeys.has(key));
    if (newer && paint(frame, remembered, root, key)) return;
    if (saved.record && !unreadable.has(key) && paint(frame, saved.record, root, key)) return;
    if (!manual && unreadable.has(key)) {
        // 读不到的那张：只留「重新生图」按钮，不自动再画（同一页面里重挂多少次都不画）。
        note(frame, '这一面画好的图读不到了（链接失效，或图片文件不在这台酒馆上）。点「重新生图」会再画一次，要花一次额度。', root);
        return;
    }
    if (saved.record && !manual) {
        // 存档在、地址却是这台设备认不出的（别的壳里的本地地址、少见的图片格式）：不当成没画过去自动画。
        note(frame, '这一面有画好的图，但它的地址在这台设备上打不开。点「重新生图」会再画一次，要花一次额度。', root);
        return;
    }
    if (failed.has(key)) {
        note(frame, failed.get(key), root);
        return;
    }
    const joined = inflightKeyFor(key, () => otherFrameKeys(root, frame));
    if (joined !== key) return void joinInflight(root, frame, joined, isCurrent);
    const slot = frameSlot(key, frame);
    if (!manual && !liveEntry(inflight.get(key)) && recentAutoDraws(slot).length >= AUTO_DRAW_LIMIT) {
        note(frame, '这个图框 10 分钟内已经自动画过两次，为免重复花额度，先不再自动画（画好的图在柏宝绘图库里）。要再画一张就点「重新生图」。', root);
        return;
    }
    let nodes = waiters.get(key);
    if (!nodes) { nodes = new Set(); waiters.set(key, nodes); }
    const waiter = { frame, isCurrent };
    nodes.add(waiter);
    if (progress.has(key)) note(frame, progress.get(key));
    try {
        const record = await startJob(key, prompt, frame, isCurrent, { manual, slot });
        unreadable.delete(key);
        if (isCurrent() && frame.isConnected) paint(frame, record, root, key);
    } catch (error) {
        const code = error?.code;
        if (code === 'stale_owner' || !isCurrent()) {
            // 归属变了就不画；图框还在页面上时留一个“重新生图”，不让它一直停在“绘制中…”。
            if (frame.isConnected) note(frame, '这一面的画面这次没有画成。', root);
            return;
        }
        const message = code === 'image_plan_failed' ? planningFailure().message : code === 'not_configured' || code === 'unsupported_api'
            ? `${String(error?.message || '生图渠道还没连好')}这一面先留着提示词。`
            : '这一面的画面这次没有画成。';
        if (['not_configured', 'unsupported_api', 'invalid_args', 'invalid_result', 'image_plan_failed'].includes(code)) failed.set(key, message);
        // 框里已经有图（跟上的是面板里的重画、被取消了）：旧图照留，不在下面追加失败提示。
        if (frame.isConnected && !frame.querySelector?.('img[data-rm-draw-result][src]')) note(frame, message, root);
        console.warn('[RabbitMirror] 内置生图没有填进图框', error);
    } finally {
        nodes.delete(waiter);
        if (!nodes.size) waiters.delete(key);
    }
}

// 跟着另一个键下正在画的那一次：画好就放进这个图框；画不成的提示交给那一次的调用方，这里只留「重新生图」。
async function joinInflight(root, frame, key, isCurrent) {
    const entry = inflight.get(key);
    if (!entry?.job) return;
    let nodes = waiters.get(key);
    if (!nodes) { nodes = new Set(); waiters.set(key, nodes); }
    const waiter = { frame, isCurrent };
    nodes.add(waiter);
    if (progress.has(key)) note(frame, progress.get(key));
    try {
        const record = await entry.job;
        if (isCurrent() && frame.isConnected) paint(frame, record, root, key);
    } catch {
        if (frame.isConnected && !frame.querySelector?.('img[data-rm-draw-result][src]')) note(frame, '这一面的画面这次没有画成。', root);
    } finally {
        nodes.delete(waiter);
        if (!nodes.size && waiters.get(key) === nodes) waiters.delete(key);
    }
}

// 模型有时在图框里另放一张图（比如外链的塔罗牌原图），和画好的图挤在同一个框里各占一半。
// 图框只显示画好的图：框里别的图片、视频不显示，只加一个运行时标记，原文不删。
const FRAME_EXTRA_MEDIA = 'img:not([data-rm-draw-result]), picture, video';
function hideFrameExtraMedia(frame) {
    for (const node of frame.querySelectorAll?.(FRAME_EXTRA_MEDIA) || []) {
        if (node.closest('[data-rm-draw-status]')) continue;
        if (node.matches('img') && node.closest('picture')) continue;
        node.setAttribute('data-rm-draw-extra', 'true');
        node.style.setProperty('display', 'none', 'important');
    }
    // 模型有时把图框自己写成 display:none，再在旁边放一张外链图顶替（比如塔罗牌原图），画好的图就永远看不到。
    // 图框只被它自己的普通内联 display:none 藏住时让它显示；交互驱动或 !important 状态规则管着的图框不碰。
    const style = frame.style;
    if (style && style.getPropertyValue('display') === 'none' && style.getPropertyPriority('display') !== 'important'
        && !frame.hasAttribute('data-rm-result-active') && !frame.hasAttribute('data-rm-show') && !frame.closest?.('[hidden]')) {
        style.setProperty('display', 'block');
        frame.setAttribute('data-rm-draw-unhidden', 'true');
    }
}
// 和图框并排、直接放在同一层的外链图片，是顶替画面的那张：画好的图放进去以后才不显示它。
// 画之前不动，画不成（渠道没连好、失败）时模型放的那张照样能看。
function hideSiblingSubstituteImages(frame) {
    for (const node of frame.parentElement?.children || []) {
        if (node === frame || !node.matches?.('img') || node.hasAttribute('data-rm-draw-result')) continue;
        if (!/^https?:/i.test(String(node.getAttribute('src') || '').trim())) continue;
        node.setAttribute('data-rm-draw-extra', 'true');
        node.style.setProperty('display', 'none', 'important');
    }
}

// 图框的基本外形由插件补上，提示词里只给模型最短的写法；模型自己写了的样式一律保留。
function ensureFrameBox(frame) {
    const style = frame?.style;
    if (!style) return;
    hideFrameExtraMedia(frame);
    let computed = null;
    try { computed = getComputedStyle(frame); } catch { computed = null; }
    if (!computed) return;
    if (computed.display === 'inline') style.setProperty('display', 'block');
    if (!style.margin && computed.marginLeft === '40px') style.setProperty('margin', '0');
    if (!style.aspectRatio && computed.aspectRatio === 'auto' && !style.height) style.setProperty('aspect-ratio', '4 / 3');
    if (computed.overflow === 'visible') style.setProperty('overflow', 'hidden');
    if (!style.borderRadius && computed.borderTopLeftRadius === '0px') style.setProperty('border-radius', '12px');
}

// 关掉内置生图只是不再画新图：已经画好、存在本机的图照样放回图框，不发任何请求。
export function restoreSavedBuiltinImages(root) {
    if (!root?.querySelectorAll) return 0;
    adoptDrawNotes(root);
    let restored = 0;
    for (const frame of root.querySelectorAll('[data-rm-draw-frame]')) {
        if (isRabbitMirrorLinkedAvatarFrame(frame)) continue;
        if (frame.querySelector?.('img[data-rm-draw-result][src]')) continue;
        const prompt = readPrompt(frame);
        if (!prompt) continue;
        let saved = readSavedAnyChat(storageKey(root, frame, prompt), () => otherFrameKeys(root, frame), legacyKeyFor(root, frame));
        // 收藏的是多面里的某一面时，图框在原来那条消息里的序号可能和收藏里不同：同一段提示词按序号挨个找。
        if (!saved.record && frame.closest?.('details')?.dataset?.rmImageOwnerChat) {
            const base = storageKey(root, frame, prompt).split(':');
            for (let index = 0; index < 16 && !saved.record; index += 1) {
                base[base.length - 2] = String(index);
                saved = readSaved(base.join(':'));
            }
        }
        if (!saved.record) {
            // 找不到存下的图时，不留一个破图标在那里。
            for (const broken of frame.querySelectorAll?.('img[data-rm-draw-result]:not([src])') || []) broken.remove();
            continue;
        }
        ensureFrameBox(frame);
        // 「重新生图」按钮只在真能画的地方给：内置生图开着、又不是收藏夹里的面（收藏里从不发生图请求）。
        const interactive = getSettings().builtinImageEnabled === true && !frame.closest?.('details')?.dataset?.rmImageOwnerChat;
        if (paint(frame, saved.record, interactive ? root : null, storageKey(root, frame, prompt))) restored += 1;
    }
    return restored;
}

export function fillBuiltinImageFrames(root) {
    if (getSettings().builtinImageEnabled !== true || !root?.querySelectorAll) return;
    adoptDrawNotes(root);
    // 一面里有几个图框就画几张（比如分镜每格一张），每个图框各自存档、各自重试。
    for (const frame of root.querySelectorAll('[data-rm-draw-frame]')) {
        if (isRabbitMirrorLinkedAvatarFrame(frame)) continue;
        hideFrameExtraMedia(frame);
        void fillFrame(root, frame);
    }
}


// ——— 小兔子 → 生图面板里的「这一面的插图」 ———
// 只读本机存档，不发请求；重画时只发一次生图请求，不调用语言模型（改过提示词也只是照着画）。
// 按画的时间排，顺序固定；current 是镜面上正在显示的那张在其中的位置。
function versionsOf(record) {
    if (!record) return { list: [], current: -1 };
    const { history = [], ...shown } = record;
    const all = [...(Array.isArray(history) ? history : []), shown];
    const time = entry => { const value = Date.parse(entry?.generatedAt || ''); return Number.isFinite(value) ? value : 0; };
    const list = all.map((entry, order) => ({ entry, order })).sort((a, b) => time(a.entry) - time(b.entry) || a.order - b.order).map(item => item.entry);
    return { list, current: list.indexOf(shown) };
}

export function listBuiltinImageFrames(root) {
    if (!root?.querySelectorAll) return [];
    adoptDrawNotes(root);
    const list = [];
    for (const frame of root.querySelectorAll('[data-rm-draw-frame]')) {
        if (isRabbitMirrorLinkedAvatarFrame(frame)) continue;
        const prompt = readPrompt(frame);
        if (!prompt) continue;
        const key = storageKey(root, frame, prompt);
        const saved = readSavedAnyChat(key, () => otherFrameKeys(root, frame));
        const { list: versions, current } = saved.broken ? { list: [], current: -1 } : versionsOf(saved.record);
        list.push({ frame, key, prompt, editPrompt: hasModelPrompt(frame) ? prompt : (readPrompt(frame, { cleanTitle: true }) || prompt), versions, current, broken: !!saved.broken,
            busy: liveEntry(inflight.get(inflightKeyFor(key, () => otherFrameKeys(root, frame)))) });
    }
    return list;
}

export function builtinImageReady() { return getSettings().builtinImageEnabled === true; }

// 聊天开了分支／改了名以后，图可能存在旧聊天名的键下：先把那份搬到当前键，之后翻历史、重画都对着当前键。
function adoptSavedKey(key, claimed = null, legacyKey = '') {
    const own = readSaved(key);
    if (own.broken || own.record) return;
    const other = savedKeyFor(key, claimed, legacyKey);
    if (!other || other === key) return;
    const moved = readSaved(other).record;
    if (!moved) return;
    const { history = [], ...current } = moved;
    // 搬过来以后旧键下那份删掉：同一组图不在本机存两份（含整张图的 data: 存档会直接翻倍）。
    // 同一聊天里的旧键（没记楼层、序号挪了）搬过来以后删掉，不存两份；分支／改名前那个聊天的那份只读不删。
    const sameChat = other === legacyKey || builtinImageKeysCompatible(key, other) || builtinImageKeysShifted(key, other);
    try { replaceMirrorImageVersions(key, current, history); if (sameChat) removeMirrorImage(other); } catch { /* 存不下就照旧对着旧键 */ }
}

// 沿用上次的提示词：有完整的构思记录就用它；只记了实际发出去的那段（智绘姬）就整段当提示词。
function reusablePlan(saved) {
    const meta = saved?.promptMetadata;
    if (meta && String(meta.prompt || meta.flatPrompt || meta.nl || '').trim()) {
        const sent = String(saved.prompt || '').trim();
        const characters = Array.isArray(meta.characters) ? meta.characters : null;
        return {
            prompt: String(meta.prompt || ''), nl: String(meta.nl || ''),
            flatPrompt: String(meta.flatPrompt || '') || (!characters && sent ? sent : ''),
            characters: characters || [], promptFormat: meta.promptFormat,
        };
    }
    const sent = String(saved?.prompt || '').trim();
    return sent ? { prompt: sent, flatPrompt: sent, nl: '', characters: [], promptFormat: saved?.promptMetadata?.promptFormat } : null;
}
export function builtinImageReusable(record) { return !!reusablePlan(record); }

export async function rerollBuiltinImage(root, frame, { prompt: edited = '', signal = null, onText = null } = {}) {
    if (!builtinImageReady()) throw Object.assign(new Error('内置生图没有开启，在兔子镜设置里打开后才能重画。'), { code: 'disabled' });
    const isCurrent = imageRequestOwner();
    const original = readPrompt(frame);
    if (!original) throw Object.assign(new Error('这个图框里没有提示词，没法重画。'), { code: 'no_prompt' });
    const key = storageKey(root, frame, original);
    if (liveEntry(inflight.get(inflightKeyFor(key, () => otherFrameKeys(root, frame))))) throw Object.assign(new Error('这张正在画，等它画完再重画。'), { code: 'busy' });
    adoptSavedKey(key, () => otherFrameKeys(root, frame), legacyKeyFor(root, frame));
    const savedState = readSaved(key);
    if (savedState.broken) throw Object.assign(new Error('这张图的存档读不出来，重画的结果会存不进去，先没有画。'), { code: 'broken' });
    const saved = savedState.record;
    const text = String(edited || '').replace(/\s+/g, ' ').trim();
    const reuse = !text ? reusablePlan(saved) : null;
    failed.delete(key); unreadable.delete(key);
    let nodes = waiters.get(key);
    if (!nodes) { nodes = new Set(); waiters.set(key, nodes); }
    const waiter = { frame, isCurrent, quiet: true, onText };
    nodes.add(waiter);
    try {
        const generated = await startJob(key, text || original, frame, isCurrent, { reuse, direct: !!text, manual: true, signal, ...(reuse && saved?.looksSources ? { looksSources: saved.looksSources } : {}) });
        let record = null;
        // 没存进去时本机存档还是旧图：镜面上照样换成新画的这张，只是翻不回来、刷新后会变回旧的。
        if (!generated?.saveError) { try { record = loadMirrorImage(key); } catch { record = null; } }
        if (!record) record = generated;
        const painted = !!(record && frame.isConnected && isCurrent());
        if (painted) { ensureFrameBox(frame); paint(frame, record, root, key); }
        return { record, painted, saveError: generated?.saveError || null };
    } finally {
        nodes.delete(waiter);
        if (!nodes.size && waiters.get(key) === nodes) waiters.delete(key);
    }
}

// 换成第 index 张显示（0 是最早的）。只改本机存档的先后，不发请求。
export function showBuiltinImageVersion(root, frame, index) {
    const prompt = readPrompt(frame);
    if (!prompt) return null;
    const key = storageKey(root, frame, prompt);
    adoptSavedKey(key, () => otherFrameKeys(root, frame), legacyKeyFor(root, frame));
    const record = loadMirrorImage(key);
    const { list, current } = versionsOf(record);
    const chosen = list[index];
    if (!chosen || index === current) return record;
    // 本机存储满时旧版本被瘦过，没留提示词：同一图框的各版本多半是同一段提示词重画的，沿用换下来那张的，重画时不用再构思。
    const shown = list[current];
    // 只在那张当时用的提示词和换下来这张一样（指纹对得上）时才借；改过提示词画的、从没记过提示词的都不借，
    // 重画时再构思一次，不会画成别的内容。
    const fingerprint = imagePromptFingerprint(chosen);
    const shownHasPrompt = !!String(shown?.promptMetadata?.prompt || shown?.promptMetadata?.nl || shown?.promptMetadata?.flatPrompt || shown?.prompt || '').trim();
    const picked = chosen?.slimmed === true && shown && shownHasPrompt && fingerprint && fingerprint === imagePromptFingerprint(shown) ? {
        ...chosen, slimmed: undefined, promptHash: undefined, prompt: shown.prompt,
        promptMetadata: { ...(shown.promptMetadata || {}), seed: chosen.promptMetadata?.seed ?? shown.promptMetadata?.seed },
        ...(shown.looksSources && !chosen.looksSources ? { looksSources: shown.looksSources } : {}),
    } : chosen;
    let next;
    try { next = replaceMirrorImageVersions(key, picked, list.filter((_, i) => i !== index)); }
    catch (error) { throw Object.assign(new Error('本机存储写不进去（多半是满了），没能换成这张。'), { code: 'quota', cause: error }); }
    // 用户自己选了这张：这次画的那张不再盖过它。
    sessionRecords.delete(key); unsavedKeys.delete(key);
    unreadable.delete(key);
    if (frame.isConnected) { ensureFrameBox(frame); paint(frame, next, root, key); }
    return next;
}
