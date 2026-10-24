// 截图打码：一键把页面上显示的人名换成代称（user → 小美，角色 → 小帅），方便截图发给别人。
// 只改屏幕上显示的字，不改聊天记录、不改兔子镜存档、不发任何请求；关掉或刷新就恢复原样。
// 输入框、代码、样式里的字不动。头像图片换不了，截图时仍需自己遮。

export const NAME_MASK_MAX_RULES = 50;
const USER_ALIAS = '小美';
const CHAR_ALIAS = '小帅';
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'NOSCRIPT', 'TEMPLATE', 'CODE', 'PRE']);

let active = false;
let observer = null;
let rules = [];
// 文本节点 → { original, masked }：只在节点还是我们换上的那串字时才还原，宿主后来改过的字不碰。
let touched = new Map();
let maskedChatId = '';
let lastExtra = [];
let eventsBound = false;

function chatIdOf(ctx) {
    try { return String(ctx?.getCurrentChatId?.() ?? ctx?.chatId ?? ''); } catch { return ''; }
}

// 开始生成、改消息、翻 swipe 时自动关掉打码：兔子镜会在这些时候把页面上的成品存下来，
// 不能让「小美／小帅」被当成原文存进聊天记录或收藏。
function bindHostEvents(ctx) {
    if (eventsBound) return;
    const source = ctx?.eventSource, types = ctx?.eventTypes || ctx?.event_types || {};
    if (typeof source?.on !== 'function') return;
    eventsBound = true;
    for (const name of ['GENERATION_STARTED', 'MESSAGE_EDITED', 'MESSAGE_SWIPED', 'MESSAGE_DELETED', 'MESSAGE_UPDATED']) {
        if (types[name]) source.on(types[name], () => { if (active) disableNameMask(); });
    }
}

/** 从页面复制出来要存的那份里，把打过码的字换回原文（收藏、存档前用）。 */
export function unmaskNameMaskClone(root) {
    if (!active || !root || !touched.size) return root;
    const back = new Map();
    for (const record of touched.values()) if (!back.has(record.masked)) back.set(record.masked, record.original);
    const doc = root.ownerDocument || globalThis.document;
    const walker = doc?.createTreeWalker?.(root, 4);
    for (let node = walker?.nextNode(); node; node = walker.nextNode()) if (back.has(node.data)) node.data = back.get(node.data);
    return root;
}

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();

export function normalizeNameMaskRules(value) {
    const list = Array.isArray(value) ? value : [];
    const seen = new Set();
    const out = [];
    for (const item of list) {
        const find = clean(typeof item === 'string' ? item : item?.find).slice(0, 40);
        const replace = clean(typeof item === 'string' ? '' : item?.replace).slice(0, 40);
        if (!find || seen.has(find)) continue;
        seen.add(find);
        out.push({ find, replace });
        if (out.length >= NAME_MASK_MAX_RULES) break;
    }
    return out;
}

function hostContext() {
    try { return globalThis.SillyTavern?.getContext?.() || null; } catch { return null; }
}

/** 这次要换的名单：自己填的在前，再是聊天里出现的 user 名和角色名。长名字先换，免得「阿雪儿」被「阿雪」拆开。 */
export function buildNameMaskRules(ctx = hostContext(), extra = []) {
    const map = new Map();
    const put = (find, replace) => {
        const name = clean(find);
        if (!name || map.has(name) || name === replace) return;
        map.set(name, replace);
    };
    for (const rule of normalizeNameMaskRules(extra)) put(rule.find, rule.replace || CHAR_ALIAS);
    const users = [ctx?.name1, ...(Array.isArray(ctx?.chat) ? ctx.chat.filter(msg => msg?.is_user).map(msg => msg?.name) : [])];
    const chars = [ctx?.name2, ...(Array.isArray(ctx?.chat) ? ctx.chat.filter(msg => msg && !msg.is_user && !msg.is_system).map(msg => msg?.name) : [])];
    const userNames = [...new Set(users.map(clean).filter(Boolean))];
    const charNames = [...new Set(chars.map(clean).filter(Boolean))].filter(name => !userNames.includes(name));
    // 自动加的名字只有一个字（「我」「月」「A」）会把正文、按钮里的普通字也换掉：跳过，要换请自己填进名单。
    const longEnough = name => name.length >= 2;
    userNames.filter(longEnough).forEach((name, index) => put(name, index ? `${USER_ALIAS}${index + 1}` : USER_ALIAS));
    charNames.filter(longEnough).forEach((name, index) => put(name, index ? `${CHAR_ALIAS}${index + 1}` : CHAR_ALIAS));
    return [...map].map(([find, replace]) => ({ find, replace, ...(/^[\x20-\x7e]+$/.test(find) ? { pattern: asciiPattern(find) } : {}) }))
        .sort((a, b) => b.find.length - a.find.length);
}

// 英文名按整词、不分大小写换：「Al」不会把 Also 换成「小帅so」。
function asciiPattern(name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![A-Za-z0-9_])${escaped}(?![A-Za-z0-9_])`, 'gi');
}

export function maskText(text, list = rules) {
    let out = String(text ?? '');
    for (const { find, replace, pattern } of list) {
        if (!find) continue;
        if (pattern) { pattern.lastIndex = 0; out = out.replace(pattern, replace); }
        else if (out.includes(find)) out = out.split(find).join(replace);
    }
    return out;
}

function skipped(node) {
    for (let el = node.parentElement; el; el = el.parentElement) {
        if (SKIP_TAGS.has(el.tagName) || el.isContentEditable || el.hasAttribute?.('data-rm-no-mask')) return true;
    }
    return false;
}

function maskNode(node) {
    if (!node || node.nodeType !== 3 || !node.data) return;
    const record = touched.get(node);
    if (record && node.data === record.masked) return;
    if (skipped(node)) return;
    // 打过码的字后面又接上了新字（流式输出）：原文＝原来的原文＋新接的那段，关掉时才还原得回原名。
    const base = record && node.data.startsWith(record.masked)
        ? record.original + node.data.slice(record.masked.length)
        : node.data;
    const masked = maskText(base);
    if (masked === base) { touched.delete(node); return; }
    touched.set(node, { original: base, masked });
    node.data = masked;
}

function maskTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { maskNode(root); return; }
    const doc = root.ownerDocument || root;
    const walker = doc.createTreeWalker(root, 4);
    const nodes = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node);
    nodes.forEach(maskNode);
}

export function isNameMaskActive() { return active; }

export function enableNameMask({ doc = globalThis.document, ctx = hostContext(), extra = [] } = {}) {
    if (!doc?.body) return 0;
    rules = buildNameMaskRules(ctx, extra);
    if (!rules.length) return 0;
    active = true;
    maskedChatId = chatIdOf(ctx);
    lastExtra = extra;
    bindHostEvents(ctx);
    maskTree(doc.body);
    observer?.disconnect();
    const Observer = doc.defaultView?.MutationObserver || globalThis.MutationObserver;
    if (Observer) {
        observer = new Observer(records => {
            if (!active) return;
            // 换了聊天：名单跟着这个聊天的 user 和角色重建。
            const now = hostContext();
            if (chatIdOf(now) !== maskedChatId) { disableNameMask(); enableNameMask({ doc, ctx: now, extra: lastExtra }); return; }
            if (touched.size > 4000) for (const node of touched.keys()) if (!node.isConnected) touched.delete(node);
            for (const record of records) {
                if (record.type === 'characterData') maskNode(record.target);
                else record.addedNodes.forEach(maskTree);
            }
        });
        observer.observe(doc.body, { childList: true, subtree: true, characterData: true });
    }
    return rules.length;
}

export function disableNameMask() {
    active = false;
    observer?.disconnect();
    observer = null;
    for (const [node, record] of touched) if (node.data === record.masked) node.data = record.original;
    touched = new Map();
    rules = [];
}

export function toggleNameMask(options = {}) {
    if (active) { disableNameMask(); return { active: false, count: 0, turnedOff: true }; }
    const count = enableNameMask(options);
    return { active: count > 0, count };
}
