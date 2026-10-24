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

// 名字可能被拆在几个行内标签里（<b>阿</b>雪）：同一段里相邻的行内文字连起来找名字，再按原来的分段写回去。
const INLINE_TAGS = new Set(['A', 'ABBR', 'B', 'BDI', 'BDO', 'CITE', 'DATA', 'DEL', 'DFN', 'EM', 'FONT', 'I', 'INS', 'KBD', 'MARK', 'Q', 'RUBY', 'RB', 'RP', 'RT', 'S', 'SAMP', 'SMALL', 'SPAN', 'STRIKE', 'STRONG', 'SUB', 'SUP', 'TIME', 'TT', 'U', 'VAR', 'WBR', 'LABEL']);
const isInline = el => INLINE_TAGS.has(el?.tagName);

function blockOf(node) {
    let el = node.nodeType === 3 ? node.parentElement : node;
    while (el && isInline(el) && el.parentElement) el = el.parentElement;
    return el;
}

/** 一段里连在一起的行内文字（遇到块级元素、换行就断开）。 */
function textRuns(block) {
    const runs = [];
    let run = [];
    const flush = () => { if (run.length) runs.push(run); run = []; };
    const visit = el => {
        for (const child of el.childNodes) {
            if (child.nodeType === 3) { if (!skipped(child)) run.push(child); else flush(); }
            else if (child.nodeType === 1) {
                if (isInline(child) && !SKIP_TAGS.has(child.tagName)) visit(child);
                else flush();
            }
        }
    };
    visit(block);
    flush();
    return runs;
}

// 这个节点原本的字：打过码的取回原文；打过码后又接上新字（流式输出）的，原文＋新接的那段。
function originalOf(node) {
    const record = touched.get(node);
    if (!record) return node.data;
    if (node.data === record.masked) return record.original;
    // 被清空的那段（拆开的名字后半）：宿主重新写了字，就是新字，不把旧的半个名字带进去。
    if (record.masked && node.data.startsWith(record.masked)) return record.original + node.data.slice(record.masked.length);
    touched.delete(node);
    return node.data;
}

/** 在连起来的字里找名字的位置：长名字先占，不重叠。 */
function findMatches(text, list = rules) {
    const taken = new Uint8Array(text.length);
    const found = [];
    for (const { find, replace, pattern } of list) {
        if (!find) continue;
        const hits = [];
        if (pattern) {
            const re = new RegExp(pattern.source, pattern.flags);
            for (let m = re.exec(text); m; m = re.exec(text)) { hits.push([m.index, m.index + m[0].length]); if (!m[0].length) re.lastIndex += 1; }
        } else {
            for (let at = text.indexOf(find); at >= 0; at = text.indexOf(find, at + find.length)) hits.push([at, at + find.length]);
        }
        for (const [from, to] of hits) {
            let free = true;
            for (let i = from; i < to; i += 1) if (taken[i]) { free = false; break; }
            if (!free) continue;
            taken.fill(1, from, to);
            found.push({ from, to, replace });
        }
    }
    return found.sort((a, b) => a.from - b.from);
}

function maskRun(nodes) {
    const originals = nodes.map(originalOf);
    const joined = originals.join('');
    const matches = findMatches(joined);
    // 每个节点的新字：名字落在哪几个节点里，代称写进名字开头所在的那个节点，其余节点里属于名字的字去掉。
    const outputs = originals.map(() => '');
    let offset = 0, m = 0;
    originals.forEach((text, index) => {
        let out = '';
        for (let i = 0; i < text.length; i += 1) {
            const at = offset + i;
            while (m < matches.length && matches[m].to <= at) m += 1;
            const match = matches[m];
            if (match && at >= match.from && at < match.to) { if (at === match.from) out += match.replace; }
            else out += text[i];
        }
        outputs[index] = out;
        offset += text.length;
    });
    // 一个名字跨了几个节点：这几个记成一组，关掉时要么一起还原，要么都不动。
    const groupOf = new Map();
    offset = 0;
    const starts = originals.map(text => { const at = offset; offset += text.length; return at; });
    for (const match of matches) {
        const members = nodes.filter((_, index) => starts[index] < match.to && starts[index] + originals[index].length > match.from);
        if (members.length < 2) continue;
        const group = { nodes: new Set() };
        for (const node of members) { const prior = groupOf.get(node); if (prior) { for (const other of prior.nodes) { group.nodes.add(other); groupOf.set(other, group); } } group.nodes.add(node); groupOf.set(node, group); }
    }
    nodes.forEach((node, index) => {
        const original = originals[index], masked = outputs[index];
        if (masked === original && !groupOf.has(node)) {
            if (touched.has(node)) { touched.delete(node); if (node.data !== original) node.data = original; }
            return;
        }
        touched.set(node, { original, masked, group: groupOf.get(node) || null });
        if (node.data !== masked) node.data = masked;
    });
}

function maskBlock(block) {
    if (!block || block.nodeType !== 1 || SKIP_TAGS.has(block.tagName)) return;
    for (const run of textRuns(block)) maskRun(run);
}

function maskNode(node) {
    if (!node || node.nodeType !== 3) return;
    if (skipped(node)) return;
    maskBlock(blockOf(node));
}

function collectBlocks(root, blocks) {
    const start = isInline(root) ? blockOf(root) : root;
    if (!start) return;
    blocks.add(start);
    const doc = start.ownerDocument || globalThis.document;
    const walker = doc.createTreeWalker(start, 1);
    for (let el = walker.nextNode(); el; el = walker.nextNode()) if (!isInline(el)) blocks.add(el);
}

function maskTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { maskNode(root); return; }
    if (root.nodeType !== 1) return;
    const blocks = new Set();
    collectBlocks(root, blocks);
    for (const block of blocks) maskBlock(block);
}

/** 从页面复制出来要存的那份里换回原名（收藏、存档前用）。
 *  和原件一层层对着走，结构一样的地方按节点一一还原；对不上的那一小块才按字串反查，
 *  且只认「整段打码后只对应一种原文、不是拆开的半个名字」的，宁可不动也不换成别人的名字。 */
export function unmaskNameMaskClone(clone, source = null) {
    if (!active || !clone || !touched.size) return clone;
    let back = null;
    const fallback = node => {
        if (!back) {
            back = new Map();
            for (const record of touched.values()) {
                if (!record.masked || record.group) continue;
                const seen = back.get(record.masked);
                if (seen === undefined) back.set(record.masked, record.original);
                else if (seen !== record.original) back.set(record.masked, null);
            }
        }
        const doc = node.ownerDocument || globalThis.document;
        const list = node.nodeType === 3 ? [node] : [];
        const walker = node.nodeType === 1 ? doc?.createTreeWalker?.(node, 4) : null;
        for (let n = walker?.nextNode(); n; n = walker.nextNode()) list.push(n);
        for (const copy of list) { const original = back.get(copy.data); if (typeof original === 'string') copy.data = original; }
    };
    const pair = (copy, original) => {
        if (!original || copy.nodeType !== original.nodeType || copy.nodeName !== original.nodeName) { fallback(copy); return; }
        if (copy.nodeType === 3) {
            const record = touched.get(original);
            // 原件此刻的字（可能刚流式接上了新字，观察器还没处理）和复制品一样：按原件取原文。
            if (record && copy.data === original.data) copy.data = originalOf(original);
            return;
        }
        const a = [...(copy.childNodes || [])], b = [...(original.childNodes || [])];
        if (a.length === b.length) { for (let i = 0; i < a.length; i += 1) pair(a[i], b[i]); return; }
        // 复制品删掉或加了几个节点：按顺序找同名、同字的原件对上，对不上的那几个才走反查。
        let j = 0;
        for (const child of a) {
            let k = j;
            while (k < b.length && !(b[k].nodeName === child.nodeName && (child.nodeType !== 3 || b[k].data === child.data))) k += 1;
            if (k < b.length) { pair(child, b[k]); j = k + 1; } else fallback(child);
        }
    };
    if (source?.nodeType) pair(clone, source); else fallback(clone);
    return clone;
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
            // 先把要重找的段收齐去重再处理；处理完把我们自己写字引起的记录丢掉，不再回头重算。
            const blocks = new Set();
            const add = node => { if (node?.nodeType === 3) { if (!skipped(node)) blocks.add(blockOf(node)); } else if (node?.nodeType === 1) collectBlocks(node, blocks); };
            for (const record of records) {
                if (record.type === 'characterData') add(record.target);
                else record.addedNodes.forEach(add);
            }
            for (const block of blocks) maskBlock(block);
            observer?.takeRecords?.();
        });
        observer.observe(doc.body, { childList: true, subtree: true, characterData: true });
    }
    return rules.length;
}

export function disableNameMask() {
    active = false;
    observer?.disconnect();
    observer = null;
    const groupIntact = group => [...group.nodes].every(node => touched.get(node)?.masked === node.data);
    // 先定下哪些要还原，再一起改：边改边查会让同组后面的节点以为组已经被动过。
    const restore = [...touched].filter(([node, record]) => node.data === record.masked && (!record.group || groupIntact(record.group)));
    for (const [node, record] of restore) node.data = record.original;
    touched = new Map();
    rules = [];
}

export function toggleNameMask(options = {}) {
    if (active) { disableNameMask(); return { active: false, count: 0, turnedOff: true }; }
    const count = enableNameMask(options);
    return { active: count > 0, count };
}
