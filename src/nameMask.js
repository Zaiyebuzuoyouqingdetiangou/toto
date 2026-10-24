// 截图打码：一键把页面上显示的人名换成代称（user → 小美，角色 → 小帅），方便截图发给别人。
// 只改屏幕上显示的字，不改聊天记录、不改兔子镜存档、不发任何请求；关掉或刷新就恢复原样。
// 输入框、代码、样式里的字不动。头像图片换不了，截图时仍需自己遮。

export const NAME_MASK_MAX_RULES = 50;
const USER_ALIAS = '小美';
const CHAR_ALIAS = '小帅';
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'NOSCRIPT', 'TEMPLATE', 'CODE', 'PRE']);
// 标题的可见文字由 ::before 的 attr(...) 显示；隐藏原文留给收藏/维修读取。
const TITLE_PART_ATTR = 'data-rabbit-mirror-title-part';
const TITLE_DISPLAY_ATTR = 'data-rabbit-mirror-title-display';
const tagOf = node => String(node?.tagName || '').toUpperCase();
const isTitlePart = node => tagOf(node) === 'SPAN' && node.hasAttribute(TITLE_PART_ATTR) && node.hasAttribute(TITLE_DISPLAY_ATTR);
const displayValue = node => node.nodeType === 3 ? node.data : node.getAttribute(TITLE_DISPLAY_ATTR);
function setDisplayValue(node, value) {
    if (node.nodeType === 3) node.data = value;
    else node.setAttribute(TITLE_DISPLAY_ATTR, value);
}

let active = false;
let observer = null;
let rules = [];
// 文本节点/标题显示属性 → { original, masked }，只记录本次屏幕替换，不写入原文存档。
let touched = new Map();
let maskedChatId = '';
let lastExtra = [];
let eventsBound = false;
let restoreWarningShown = false;
let flowVisibility = new WeakMap();

function uncertainRestore() {
    const message = '页面文字已改变，部分姓名无法准确还原。请刷新页面后再收藏或继续截图，避免保存错误的人名。';
    if (!restoreWarningShown) {
        restoreWarningShown = true;
        try { globalThis.toastr?.warning?.(message); } catch { /* 保存仍须停止。 */ }
    }
    const error = new Error(message);
    error.name = 'RabbitMirrorNameMaskRestoreError';
    return error;
}

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
    return normalizeRules(value, NAME_MASK_MAX_RULES);
}

function normalizeRules(value, limit) {
    const list = Array.isArray(value) ? value : [];
    const seen = new Set();
    const out = [];
    for (const item of list) {
        const find = clean(typeof item === 'string' ? item : item?.find).slice(0, 40);
        const replace = clean(typeof item === 'string' ? '' : item?.replace).slice(0, 40);
        if (!find || seen.has(find)) continue;
        seen.add(find);
        out.push({ find, replace });
        if (out.length >= limit) break;
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
    for (const rule of normalizeRules(extra, NAME_MASK_MAX_RULES * 2)) put(rule.find, rule.replace || CHAR_ALIAS);
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
    for (let el = node.nodeType === 1 ? node : node.parentElement; el; el = el.parentElement) {
        if (SKIP_TAGS.has(tagOf(el)) || el.isContentEditable || el.hasAttribute?.('data-rm-no-mask')) return true;
        if (el !== node && isTitlePart(el)) return true;
    }
    return false;
}

// 名字可能被拆在几个行内标签里（<b>阿</b>雪）：同一段里相邻的行内文字连起来找名字，再按原来的分段写回去。
const INLINE_TAGS = new Set(['A', 'ABBR', 'B', 'BDI', 'BDO', 'CITE', 'DATA', 'DEL', 'DFN', 'EM', 'FONT', 'I', 'INS', 'KBD', 'MARK', 'Q', 'RUBY', 'RB', 'RP', 'RT', 'S', 'SAMP', 'SMALL', 'SPAN', 'STRIKE', 'STRONG', 'SUB', 'SUP', 'TIME', 'TT', 'U', 'VAR', 'WBR', 'LABEL', 'TSPAN']);
const isInline = el => INLINE_TAGS.has(tagOf(el));

function blockOf(node) {
    let el = node.nodeType === 3 ? node.parentElement : node;
    while (el && isInline(el) && el.parentElement) el = el.parentElement;
    return el;
}

// display:none 不占可见文字位置；隐藏内容单独打码，展开时也不会露名。
// 不把 aria-hidden、透明度或仍占位的 visibility:hidden 当作消失的文字。
function hiddenFromFlow(el) {
    try {
        const display = el.ownerDocument?.defaultView?.getComputedStyle?.(el)?.display;
        if (display) return display === 'none';
    } catch { /* 不具备样式计算的宿主退到明确标记。 */ }
    return el.hasAttribute('hidden') || /(?:^|;)\s*display\s*:\s*none\s*(?:!important)?\s*(?=;|$)/i.test(el.getAttribute('style') || '');
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
                if (skipped(child)) { flush(); continue; }
                const hidden = hiddenFromFlow(child);
                flowVisibility.set(child, hidden);
                if (hidden) {
                    // 不断开外层可见文字；隐藏的行内子树使用自己的分段。
                    // 隐藏块元素则由 collectBlocks 独立处理，避免重复写同一节点。
                    if (isTitlePart(child)) runs.push([child]);
                    else if (isInline(child)) {
                        const enclosing = run; run = [];
                        visit(child); flush(); run = enclosing;
                    }
                }
                else if (isTitlePart(child)) run.push(child);
                else if (isInline(child)) visit(child);
                else flush();
            }
        }
    };
    visit(block);
    flush();
    return runs;
}

function unchangedEdges(before, value) {
    let prefix = 0, suffix = 0;
    while (prefix < before.length && prefix < value.length && before[prefix] === value[prefix]) prefix++;
    while (suffix < before.length - prefix && suffix < value.length - prefix
        && before[before.length - 1 - suffix] === value[value.length - 1 - suffix]) suffix++;
    return { prefix, suffix };
}

function countToken(text, token) {
    let total = 0;
    for (let pos = text.indexOf(token); pos >= 0; pos = text.indexOf(token, pos + token.length)) total++;
    return total;
}

// 隐藏的后半姓名只跟它自己的起始替换关联；同组可能还有别的人，不能借别人的同代称还原。
// 只检查起始收据的位置，不递归读取另一段原文，避免跨节点记录互相依赖。
function splitLeadIsRetained(node, lead) {
    const record = touched.get(lead.node);
    if (!record?.parts?.includes(lead.part) || !lead.node.isConnected || blockOf(lead.node) !== blockOf(node)) return false;
    const value = displayValue(lead.node), before = record.masked;
    if (value === before || value === record.original) return true;
    if (value == null || !before) return false;
    const at = value.indexOf(before);
    if (at >= 0) return value.indexOf(before, at + 1) < 0;
    const token = before.slice(lead.part.from, lead.part.to);
    if (!token || countToken(value, token) < countToken(before, token)) return false;
    const { prefix, suffix } = unchangedEdges(before, value);
    return lead.part.to <= prefix || lead.part.from >= before.length - suffix;
}

function comesBefore(a, b) {
    if (typeof a.compareDocumentPosition === 'function') return !!(a.compareDocumentPosition(b) & 4);
    // 小型宿主/无布局 DOM 的等价结构判断，不遍历段落正文。
    const path = node => { const out = []; for (; node; node = node.parentNode) out.unshift(node); return out; };
    const left = path(a), right = path(b);
    let at = 0;
    while (at < left.length && at < right.length && left[at] === right[at]) at++;
    if (!at || at === left.length || at === right.length) return false;
    const siblings = [...left[at - 1].childNodes];
    return siblings.indexOf(left[at]) < siblings.indexOf(right[at]);
}

function splitTailsAreRetained(lead) {
    let previous = lead.node;
    for (const tail of lead.tails || []) {
        if (!tail.node.isConnected || blockOf(tail.node) !== blockOf(lead.node)
            || !touched.get(tail.node)?.parts?.includes(tail.part) || !comesBefore(previous, tail.node)) return false;
        previous = tail.node;
    }
    return true;
}

// 每一处替换都保留本节点的原文字段和输出位置，不用「小帅」反查人物。
// 只映射原片段整体包裹、或编辑区之外未变的位置；编辑区内同代称无法分清时停止保存。
function restoreEditedValue(record, value) {
    const before = record.masked;
    if (!before) return value; // 跨节点姓名被清空的后半，宿主重新写入的是新内容。
    const at = value.indexOf(before);
    if (at >= 0) {
        if (value.indexOf(before, at + 1) >= 0) throw uncertainRestore();
        return value.slice(0, at) + record.original + value.slice(at + before.length);
    }
    const { prefix, suffix } = unchangedEdges(before, value);
    const parts = [], checked = new Set();
    for (const part of record.parts || []) {
        const token = before.slice(part.from, part.to);
        if (token && !checked.has(token)) {
            checked.add(token);
            const remaining = countToken(value, token);
            // 原文里本来就有「小美」也算一个位置；删后不能把它错认成打码过的那个。
            if (remaining > 0 && remaining < countToken(before, token)) throw uncertainRestore();
        }
        if (part.to <= prefix && (token || prefix > part.from)) parts.push(part);
        else if (part.from >= before.length - suffix && (token || part.from > before.length - suffix)) {
            const delta = value.length - before.length;
            parts.push({ ...part, from: part.from + delta, to: part.to + delta });
        } else if (!token && part.from === 0 && part.lead) {
            // 起始姓名已由 originalOf 核对；编辑的是本节点仍可见的后半句，隐藏尾字仍在节点开头。
            parts.push(part);
        } else if (token && value.includes(token)) {
            // 有代称留下，却不在能对应的未变区：不能猜是被删的那个人还是另一个人。
            throw uncertainRestore();
        }
    }
    let out = '', offset = 0;
    for (const part of parts) {
        out += value.slice(offset, part.from) + part.original;
        offset = part.to;
    }
    return out + value.slice(offset);
}

function originalOf(node) {
    const record = touched.get(node);
    const value = displayValue(node);
    if (!record) return value;
    if (value == null) return value; // 标题投影属性被宿主移除，不补回旧属性。
    // 起始代称还在，尾片段却已被删掉/调序时不能保存半个人名。
    for (const part of record.parts || []) {
        if (part.anchor && splitLeadIsRetained(node, part.anchor) && !splitTailsAreRetained(part.anchor)) throw uncertainRestore();
    }
    if (value === record.original) return value;
    // 空尾节点被整体写入新字仍视为宿主替换；其余尾字必须有同一次匹配的起始记录。
    if (record.masked || value === record.masked) {
        for (const part of record.parts || []) if (part.lead && !splitLeadIsRetained(node, part.lead)) throw uncertainRestore();
    }
    if (value === record.masked) return record.original;
    return restoreEditedValue(record, value);
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

function maskRun(nodes, originals) {
    const joined = originals.join('');
    const matches = findMatches(joined);
    // 每个节点的新字：名字落在哪几个节点里，代称写进名字开头所在的那个节点，其余节点里属于名字的字去掉。
    const outputs = originals.map(() => '');
    const receipts = originals.map(() => []);
    let offset = 0, m = 0;
    originals.forEach((text, index) => {
        let out = '';
        for (let i = 0; i < text.length; i += 1) {
            const at = offset + i;
            while (m < matches.length && matches[m].to <= at) m += 1;
            const match = matches[m];
            if (match && at >= match.from && at < match.to) {
                if (at === match.from || i === 0) {
                    const from = out.length;
                    if (at === match.from) out += match.replace;
                    const part = { from, to: out.length, original: text.slice(i, Math.min(text.length, match.to - offset)) };
                    if (at === match.from) part.anchor = match.lead = { node: nodes[index], part, tails: [] };
                    else {
                        part.lead = match.lead;
                        match.lead.tails.push({ node: nodes[index], part });
                    }
                    receipts[index].push(part);
                }
            }
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
            if (touched.has(node)) { touched.delete(node); if (displayValue(node) !== original) setDisplayValue(node, original); }
            return;
        }
        touched.set(node, { original, masked, parts: receipts[index], group: groupOf.get(node) || null });
        if (displayValue(node) !== masked) setDisplayValue(node, masked);
    });
}

function maskBlock(block) {
    if (!block || block.nodeType !== 1 || skipped(block)) return;
    try {
        const runs = textRuns(block);
        // 显隐变化会把一次姓名匹配拆成不同 run，先一起核对再写，避免前段清掉后段来源。
        const originals = runs.map(run => run.map(originalOf));
        runs.forEach((run, index) => maskRun(run, originals[index]));
    } catch (error) { if (error?.name !== 'RabbitMirrorNameMaskRestoreError') throw error; }
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

/** cloneNode 后、过滤复制品之前调用；只凭原件对应节点的内存记录还原。
 *  结构变了就不能分清两个「小帅」各是谁，禁止按字串或同名标签猜回去。
 *  先核对整棵树再改字，失败时不留下半还原的复制品。导出工具的注释占位保留原位置。 */
export function unmaskNameMaskClone(clone, source = null) {
    if (!active || !clone || !touched.size) return clone;
    const pending = [];
    const mismatch = () => {
        const message = '复制内容与原件无法对应，请关闭人名打码后重试，避免保存错误的人名。';
        try { globalThis.toastr?.warning?.(message); } catch { /* 提示不可用也必须停止保存。 */ }
        throw new Error(message);
    };
    const pair = (copy, original) => {
        if (original && copy.nodeType === 8 && copy.data === 'rm-export-tool') return;
        if (!original || copy.nodeType !== original.nodeType || copy.nodeName !== original.nodeName) mismatch();
        if (copy.nodeType === 3 || touched.has(original)) {
            const record = touched.get(original);
            const restored = record ? originalOf(original) : displayValue(original);
            // 已还原的复制品重复调用也不改字；标题属性也要经过同一份对应校验。
            if (displayValue(copy) !== restored) {
                if (displayValue(copy) !== displayValue(original)) mismatch();
                if (record) pending.push([copy, restored]);
            }
            if (copy.nodeType === 3) return;
        }
        const a = [...(copy.childNodes || [])], b = [...(original.childNodes || [])];
        if (a.length !== b.length) mismatch();
        for (let i = 0; i < a.length; i += 1) pair(a[i], b[i]);
    };
    pair(clone, source);
    for (const [node, text] of pending) setDisplayValue(node, text);
    return clone;
}

/** 只供实际节点替换：先还原副本，replaceWith 成功后再提交来源转接。
 * 普通收藏副本不转接，避免夺走现场姓名记录；提交前失败也不改原件记录。 */
export function prepareNameMaskReplacement(clone, source) {
    unmaskNameMaskClone(clone, source);
    const records = touched;
    const pairs = [];
    const collect = (copy, original) => {
        const record = records.get(original);
        if (record) pairs.push([original, copy, record]);
        for (let i = 0; i < original.childNodes.length; i++) collect(copy.childNodes[i], original.childNodes[i]);
    };
    if (active && records.size) collect(clone, source);
    let committed = false;
    return () => {
        if (committed || !active || touched !== records || source.isConnected || !clone.isConnected) return;
        committed = true;
        const replacements = new Map(), groups = new Set(), anchors = new Set(), blocks = new Set();
        for (const [original, copy, record] of pairs) {
            if (records.get(original) !== record || (copy !== clone && !clone.contains(copy))) continue;
            replacements.set(original, copy);
            records.delete(original);
            // 副本已按最新文字还原；旧 original 不能继续指向编辑前的句子，否则会重复补尾字。
            record.original = displayValue(copy);
            records.set(copy, record);
            if (record.group) groups.add(record.group);
            blocks.add(blockOf(copy));
            for (const part of record.parts || []) if (part.anchor || part.lead) anchors.add(part.anchor || part.lead);
        }
        for (const group of groups) group.nodes = new Set([...group.nodes].map(node => replacements.get(node) || node));
        for (const anchor of anchors) {
            anchor.node = replacements.get(anchor.node) || anchor.node;
            for (const tail of anchor.tails || []) tail.node = replacements.get(tail.node) || tail.node;
        }
        // 同步重建当前段的记录；不等观察器，也不让后一次维修沿用旧的替换位置。
        for (const block of blocks) maskBlock(block);
    };
}

export function isNameMaskActive() { return active; }

// 维修会先拆监听再替换节点；先核对当前区域，避免有歧义时拆到一半才失败。
export function assertNameMaskRestorable(root) {
    if (!active || !root) return;
    for (const node of touched.keys()) if (root === node || root.contains?.(node)) originalOf(node);
}

/** 名单按角色卡分开：{ 钥匙: 名单 }，最多记 200 张卡。 */
export function normalizeNameMaskCardRules(value) {
    const out = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
    for (const [key, list] of Object.entries(value).slice(-200)) {
        const name = String(key || '').trim().slice(0, 300);
        const rules = normalizeNameMaskRules(list);
        if (name && rules.length) out[name] = rules;
    }
    return out;
}

/** 这次打码用的自填名单：当前卡的在前（同名以卡为准），再接通用名单。 */
export function nameMaskRulesFor(settings, cardKey) {
    const card = cardKey ? normalizeNameMaskRules(settings?.nameMaskRulesByCard?.[cardKey]) : [];
    return normalizeRules([...card, ...normalizeNameMaskRules(settings?.nameMaskRules)], NAME_MASK_MAX_RULES * 2);
}

export function enableNameMask({ doc = globalThis.document, ctx = hostContext(), extra = [] } = {}) {
    if (!doc?.body) return 0;
    // 名单可以是函数：换聊天时按新聊天的角色卡重新取。
    rules = buildNameMaskRules(ctx, typeof extra === 'function' ? extra(ctx) : extra);
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
            if (chatIdOf(now) !== maskedChatId) { if (disableNameMask() !== false) enableNameMask({ doc, ctx: now, extra: lastExtra }); return; }
            if (touched.size > 4000) for (const node of touched.keys()) if (!node.isConnected) touched.delete(node);
            // 先把要重找的段收齐去重再处理；处理完把我们自己写字引起的记录丢掉，不再回头重算。
            const blocks = new Set();
            const add = node => { if (node?.nodeType === 3) { if (!skipped(node)) blocks.add(blockOf(node)); } else if (node?.nodeType === 1) collectBlocks(node, blocks); };
            for (const record of records) {
                if (record.type === 'characterData') add(record.target);
                else {
                    if (record.type === 'attributes' && record.attributeName && record.attributeName !== TITLE_DISPLAY_ATTR) {
                        // 样式动画不引发全树重扫；只在已检查节点的实际显隐变化时重算附近文字。
                        if (!flowVisibility.has(record.target) || flowVisibility.get(record.target) === hiddenFromFlow(record.target)) continue;
                        blocks.add(blockOf(record.target.parentElement));
                    }
                    // 删除/搬走节点也会让两段姓名接起来，只重查受影响段，不遍历整个父树。
                    blocks.add(blockOf(record.target));
                    if (record.type === 'childList') record.addedNodes.forEach(add);
                }
            }
            for (const block of blocks) maskBlock(block);
            observer?.takeRecords?.();
        });
        observer.observe(doc.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [TITLE_DISPLAY_ATTR, 'hidden', 'style', 'class'] });
    }
    return rules.length;
}

export function disableNameMask() {
    // 在改动页面或断开观察器前核对完；遇到歧义不部分恢复，也不谎报已关闭。
    try {
        for (const node of touched.keys()) {
            if (node.isConnected) originalOf(node);
        }
    } catch (error) {
        if (error?.name === 'RabbitMirrorNameMaskRestoreError') return false;
        throw error;
    }
    active = false;
    observer?.disconnect();
    observer = null;
    // 宿主可能先接上新字、同一调用栈立即通知关闭，观察器还没轮到。
    // 只补算发生变化的已打码段，保留新增/改写文字并重新确认跨节点组。
    const changed = new Set();
    for (const [node, record] of touched) if (node.isConnected && displayValue(node) !== record.masked) changed.add(blockOf(node));
    for (const block of changed) maskBlock(block);
    const groupIntact = group => [...group.nodes].every(node => touched.get(node)?.masked === displayValue(node));
    // 先定下哪些要还原，再一起改：边改边查会让同组后面的节点以为组已经被动过。
    const restore = [...touched].filter(([node, record]) => displayValue(node) === record.masked && (!record.group || groupIntact(record.group)));
    for (const [node, record] of restore) setDisplayValue(node, record.original);
    touched = new Map();
    flowVisibility = new WeakMap();
    rules = [];
    restoreWarningShown = false;
    return true;
}

export function toggleNameMask(options = {}) {
    if (active) {
        if (disableNameMask() === false) return { active: true, count: rules.length, turnedOff: false, blocked: true };
        return { active: false, count: 0, turnedOff: true };
    }
    const count = enableNameMask(options);
    return { active: count > 0, count };
}
