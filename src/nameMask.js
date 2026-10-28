import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=1.99.9";
export const NAME_MASK_MAX_RULES = 50;
const USER_ALIAS = __rmT("f8eJ7k");
const CHAR_ALIAS = __rmT("f8jIuf");
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'NOSCRIPT', 'TEMPLATE', 'CODE', 'PRE']);
const TITLE_PART_ATTR = 'data-rabbit-mirror-title-part';
const TITLE_DISPLAY_ATTR = 'data-rabbit-mirror-title-display';
const tagOf = node => String(node?.tagName || '').toUpperCase();
const isTitlePart = node => tagOf(node) === 'SPAN' && node.hasAttribute(TITLE_PART_ATTR) && node.hasAttribute(TITLE_DISPLAY_ATTR);
const displayValue = node => node.nodeType === 3 ? node.data : node.getAttribute(TITLE_DISPLAY_ATTR);
function setDisplayValue(node, value) {
    if (node.nodeType === 3)
        node.data = value;
    else
        node.setAttribute(TITLE_DISPLAY_ATTR, value);
}
let active = false;
let observer = null;
let rules = [];
let touched = new Map();
let maskedChatId = '';
let lastExtra = [];
let eventsBound = false;
let restoreWarningShown = false;
let flowVisibility = new WeakMap();
function uncertainRestore() {
    const message = __rmT("K4Qw0iQjvI.U4SvAWWwwX_phgVP5gxPI52i5FNgwfObsJV4jpHq_Y0fRiHpZP58gNlBvDKD7iKA_hBe4_PZrtB2YUFuY3j6XcTSZprQcNrm8qKpTqDs0if");
    if (!restoreWarningShown) {
        restoreWarningShown = true;
        try {
            globalThis.toastr?.warning?.(message);
        }
        catch { }
    }
    const error = new Error(message);
    error.name = 'RabbitMirrorNameMaskRestoreError';
    return error;
}
function chatIdOf(ctx) {
    try {
        return String(ctx?.getCurrentChatId?.() ?? ctx?.chatId ?? '');
    }
    catch {
        return '';
    }
}
function bindHostEvents(ctx) {
    if (eventsBound)
        return;
    const source = ctx?.eventSource, types = ctx?.eventTypes || ctx?.event_types || {};
    if (typeof source?.on !== 'function')
        return;
    eventsBound = true;
    for (const name of ['GENERATION_STARTED', 'MESSAGE_EDITED', 'MESSAGE_SWIPED', 'MESSAGE_DELETED', 'MESSAGE_UPDATED']) {
        if (types[name])
            source.on(types[name], () => { if (active)
                disableNameMask(); });
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
        if (!find || seen.has(find))
            continue;
        seen.add(find);
        out.push({ find, replace });
        if (out.length >= limit)
            break;
    }
    return out;
}
function hostContext() {
    try {
        return globalThis.SillyTavern?.getContext?.() || null;
    }
    catch {
        return null;
    }
}
export function buildNameMaskRules(ctx = hostContext(), extra = []) {
    const map = new Map();
    const put = (find, replace) => {
        const name = clean(find);
        if (!name || map.has(name) || name === replace)
            return;
        map.set(name, replace);
    };
    for (const rule of normalizeRules(extra, NAME_MASK_MAX_RULES * 2))
        put(rule.find, rule.replace || CHAR_ALIAS);
    const users = [ctx?.name1, ...(Array.isArray(ctx?.chat) ? ctx.chat.filter(msg => msg?.is_user).map(msg => msg?.name) : [])];
    const chars = [ctx?.name2, ...(Array.isArray(ctx?.chat) ? ctx.chat.filter(msg => msg && !msg.is_user && !msg.is_system).map(msg => msg?.name) : [])];
    const userNames = [...new Set(users.map(clean).filter(Boolean))];
    const charNames = [...new Set(chars.map(clean).filter(Boolean))].filter(name => !userNames.includes(name));
    const longEnough = name => name.length >= 2;
    userNames.filter(longEnough).forEach((name, index) => put(name, index ? `${USER_ALIAS}${index + 1}` : USER_ALIAS));
    charNames.filter(longEnough).forEach((name, index) => put(name, index ? `${CHAR_ALIAS}${index + 1}` : CHAR_ALIAS));
    return [...map].map(([find, replace]) => ({ find, replace, ...(/^[\x20-\x7e]+$/.test(find) ? { pattern: asciiPattern(find) } : {}) }))
        .sort((a, b) => b.find.length - a.find.length);
}
function asciiPattern(name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![A-Za-z0-9_])${escaped}(?![A-Za-z0-9_])`, 'gi');
}
export function maskText(text, list = rules) {
    let out = String(text ?? '');
    for (const { find, replace, pattern } of list) {
        if (!find)
            continue;
        if (pattern) {
            pattern.lastIndex = 0;
            out = out.replace(pattern, replace);
        }
        else if (out.includes(find))
            out = out.split(find).join(replace);
    }
    return out;
}
const MIRROR_SCOPE = 'toto, .rabbit-mirror-external-host, [data-rm-theater-favorite-host], [data-rm-theater-favorite-viewer], [data-rm-theater-favorite-stage], [data-rm-theater-favorite-library], [data-rm-theater-favorite-card], [data-rm-theater-snapshot], [data-rm-name-mask-scope]';
function isMirrorScope(el) {
    if (el.matches?.(MIRROR_SCOPE))
        return true;
    if (tagOf(el) !== 'DETAILS')
        return false;
    if (/^rmcss-/i.test(String(el.getAttribute?.('data-rabbit-mirror-css-scope') || '')))
        return true;
    const summary = el.querySelector?.(':scope > summary');
    return !!summary && __rmR("m10HJIJj1U505CT5FVUg_l3ktAhg1G1oa8t4ATvQ5_TQAbD4UzcaVoKOo2G", "i").test(summary.textContent || '');
}
function skipped(node) {
    let inside = false;
    for (let el = node.nodeType === 1 ? node : node.parentElement; el; el = el.parentElement) {
        if (SKIP_TAGS.has(tagOf(el)) || el.isContentEditable || el.hasAttribute?.('data-rm-no-mask'))
            return true;
        if (el !== node && isTitlePart(el))
            return true;
        if (!inside && isMirrorScope(el))
            inside = true;
    }
    return !inside;
}
const INLINE_TAGS = new Set(['A', 'ABBR', 'B', 'BDI', 'BDO', 'CITE', 'DATA', 'DEL', 'DFN', 'EM', 'FONT', 'I', 'INS', 'KBD', 'MARK', 'Q', 'RUBY', 'RB', 'RP', 'RT', 'S', 'SAMP', 'SMALL', 'SPAN', 'STRIKE', 'STRONG', 'SUB', 'SUP', 'TIME', 'TT', 'U', 'VAR', 'WBR', 'LABEL', 'TSPAN']);
const isInline = el => INLINE_TAGS.has(tagOf(el));
function blockOf(node) {
    let el = node.nodeType === 3 ? node.parentElement : node;
    while (el && isInline(el) && el.parentElement)
        el = el.parentElement;
    return el;
}
function hiddenFromFlow(el) {
    try {
        const display = el.ownerDocument?.defaultView?.getComputedStyle?.(el)?.display;
        if (display)
            return display === 'none';
    }
    catch { }
    return el.hasAttribute('hidden') || /(?:^|;)\s*display\s*:\s*none\s*(?:!important)?\s*(?=;|$)/i.test(el.getAttribute('style') || '');
}
function textRuns(block) {
    const runs = [];
    let run = [];
    const flush = () => { if (run.length)
        runs.push(run); run = []; };
    const visit = el => {
        for (const child of el.childNodes) {
            if (child.nodeType === 3) {
                if (!skipped(child))
                    run.push(child);
                else
                    flush();
            }
            else if (child.nodeType === 1) {
                if (skipped(child)) {
                    flush();
                    continue;
                }
                const hidden = hiddenFromFlow(child);
                flowVisibility.set(child, hidden);
                if (hidden) {
                    if (isTitlePart(child))
                        runs.push([child]);
                    else if (isInline(child)) {
                        const enclosing = run;
                        run = [];
                        visit(child);
                        flush();
                        run = enclosing;
                    }
                }
                else if (isTitlePart(child))
                    run.push(child);
                else if (isInline(child))
                    visit(child);
                else
                    flush();
            }
        }
    };
    visit(block);
    flush();
    return runs;
}
function unchangedEdges(before, value) {
    let prefix = 0, suffix = 0;
    while (prefix < before.length && prefix < value.length && before[prefix] === value[prefix])
        prefix++;
    while (suffix < before.length - prefix && suffix < value.length - prefix
        && before[before.length - 1 - suffix] === value[value.length - 1 - suffix])
        suffix++;
    return { prefix, suffix };
}
function countToken(text, token) {
    let total = 0;
    for (let pos = text.indexOf(token); pos >= 0; pos = text.indexOf(token, pos + token.length))
        total++;
    return total;
}
function splitLeadIsRetained(node, lead) {
    const record = touched.get(lead.node);
    if (!record?.parts?.includes(lead.part) || !lead.node.isConnected || blockOf(lead.node) !== blockOf(node))
        return false;
    const value = displayValue(lead.node), before = record.masked;
    if (value === before || value === record.original)
        return true;
    if (value == null || !before)
        return false;
    const at = value.indexOf(before);
    if (at >= 0)
        return value.indexOf(before, at + 1) < 0;
    const token = before.slice(lead.part.from, lead.part.to);
    if (!token || countToken(value, token) < countToken(before, token))
        return false;
    const { prefix, suffix } = unchangedEdges(before, value);
    return lead.part.to <= prefix || lead.part.from >= before.length - suffix;
}
function comesBefore(a, b) {
    if (typeof a.compareDocumentPosition === 'function')
        return !!(a.compareDocumentPosition(b) & 4);
    const path = node => { const out = []; for (; node; node = node.parentNode)
        out.unshift(node); return out; };
    const left = path(a), right = path(b);
    let at = 0;
    while (at < left.length && at < right.length && left[at] === right[at])
        at++;
    if (!at || at === left.length || at === right.length)
        return false;
    const siblings = [...left[at - 1].childNodes];
    return siblings.indexOf(left[at]) < siblings.indexOf(right[at]);
}
function splitTailsAreRetained(lead) {
    let previous = lead.node;
    for (const tail of lead.tails || []) {
        if (!tail.node.isConnected || blockOf(tail.node) !== blockOf(lead.node)
            || !touched.get(tail.node)?.parts?.includes(tail.part) || !comesBefore(previous, tail.node))
            return false;
        previous = tail.node;
    }
    return true;
}
function restoreEditedValue(record, value) {
    const before = record.masked;
    if (!before)
        return value;
    const at = value.indexOf(before);
    if (at >= 0) {
        if (value.indexOf(before, at + 1) >= 0)
            throw uncertainRestore();
        return value.slice(0, at) + record.original + value.slice(at + before.length);
    }
    const { prefix, suffix } = unchangedEdges(before, value);
    const parts = [], checked = new Set();
    for (const part of record.parts || []) {
        const token = before.slice(part.from, part.to);
        if (token && !checked.has(token)) {
            checked.add(token);
            const remaining = countToken(value, token);
            if (remaining > 0 && remaining < countToken(before, token))
                throw uncertainRestore();
        }
        if (part.to <= prefix && (token || prefix > part.from))
            parts.push(part);
        else if (part.from >= before.length - suffix && (token || part.from > before.length - suffix)) {
            const delta = value.length - before.length;
            parts.push({ ...part, from: part.from + delta, to: part.to + delta });
        }
        else if (!token && part.from === 0 && part.lead) {
            parts.push(part);
        }
        else if (token && value.includes(token)) {
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
    if (!record)
        return value;
    if (value == null)
        return value;
    for (const part of record.parts || []) {
        if (part.anchor && splitLeadIsRetained(node, part.anchor) && !splitTailsAreRetained(part.anchor))
            throw uncertainRestore();
    }
    if (value === record.original)
        return value;
    if (record.masked || value === record.masked) {
        for (const part of record.parts || [])
            if (part.lead && !splitLeadIsRetained(node, part.lead))
                throw uncertainRestore();
    }
    if (value === record.masked)
        return record.original;
    return restoreEditedValue(record, value);
}
function findMatches(text, list = rules) {
    const taken = new Uint8Array(text.length);
    const found = [];
    for (const { find, replace, pattern } of list) {
        if (!find)
            continue;
        const hits = [];
        if (pattern) {
            const re = new RegExp(pattern.source, pattern.flags);
            for (let m = re.exec(text); m; m = re.exec(text)) {
                hits.push([m.index, m.index + m[0].length]);
                if (!m[0].length)
                    re.lastIndex += 1;
            }
        }
        else {
            for (let at = text.indexOf(find); at >= 0; at = text.indexOf(find, at + find.length))
                hits.push([at, at + find.length]);
        }
        for (const [from, to] of hits) {
            let free = true;
            for (let i = from; i < to; i += 1)
                if (taken[i]) {
                    free = false;
                    break;
                }
            if (!free)
                continue;
            taken.fill(1, from, to);
            found.push({ from, to, replace });
        }
    }
    return found.sort((a, b) => a.from - b.from);
}
function maskRun(nodes, originals) {
    const joined = originals.join('');
    const matches = findMatches(joined);
    const outputs = originals.map(() => '');
    const receipts = originals.map(() => []);
    let offset = 0, m = 0;
    originals.forEach((text, index) => {
        let out = '';
        for (let i = 0; i < text.length; i += 1) {
            const at = offset + i;
            while (m < matches.length && matches[m].to <= at)
                m += 1;
            const match = matches[m];
            if (match && at >= match.from && at < match.to) {
                if (at === match.from || i === 0) {
                    const from = out.length;
                    if (at === match.from)
                        out += match.replace;
                    const part = { from, to: out.length, original: text.slice(i, Math.min(text.length, match.to - offset)) };
                    if (at === match.from)
                        part.anchor = match.lead = { node: nodes[index], part, tails: [] };
                    else {
                        part.lead = match.lead;
                        match.lead.tails.push({ node: nodes[index], part });
                    }
                    receipts[index].push(part);
                }
            }
            else
                out += text[i];
        }
        outputs[index] = out;
        offset += text.length;
    });
    const groupOf = new Map();
    offset = 0;
    const starts = originals.map(text => { const at = offset; offset += text.length; return at; });
    for (const match of matches) {
        const members = nodes.filter((_, index) => starts[index] < match.to && starts[index] + originals[index].length > match.from);
        if (members.length < 2)
            continue;
        const group = { nodes: new Set() };
        for (const node of members) {
            const prior = groupOf.get(node);
            if (prior) {
                for (const other of prior.nodes) {
                    group.nodes.add(other);
                    groupOf.set(other, group);
                }
            }
            group.nodes.add(node);
            groupOf.set(node, group);
        }
    }
    nodes.forEach((node, index) => {
        const original = originals[index], masked = outputs[index];
        if (masked === original && !groupOf.has(node)) {
            if (touched.has(node)) {
                touched.delete(node);
                if (displayValue(node) !== original)
                    setDisplayValue(node, original);
            }
            return;
        }
        touched.set(node, { original, masked, parts: receipts[index], group: groupOf.get(node) || null });
        if (displayValue(node) !== masked)
            setDisplayValue(node, masked);
    });
}
function maskBlock(block) {
    if (!block || block.nodeType !== 1 || skipped(block))
        return;
    try {
        const runs = textRuns(block);
        const originals = runs.map(run => run.map(originalOf));
        runs.forEach((run, index) => maskRun(run, originals[index]));
    }
    catch (error) {
        if (error?.name !== 'RabbitMirrorNameMaskRestoreError')
            throw error;
    }
}
function maskNode(node) {
    if (!node || node.nodeType !== 3)
        return;
    if (skipped(node))
        return;
    maskBlock(blockOf(node));
}
function collectBlocks(root, blocks) {
    const start = isInline(root) ? blockOf(root) : root;
    if (!start)
        return;
    blocks.add(start);
    const doc = start.ownerDocument || globalThis.document;
    const walker = doc.createTreeWalker(start, 1);
    for (let el = walker.nextNode(); el; el = walker.nextNode())
        if (!isInline(el))
            blocks.add(el);
}
function maskTree(root) {
    if (!root)
        return;
    if (root.nodeType === 3) {
        maskNode(root);
        return;
    }
    if (root.nodeType !== 1)
        return;
    const blocks = new Set();
    collectBlocks(root, blocks);
    for (const block of blocks)
        maskBlock(block);
}
export function unmaskNameMaskClone(clone, source = null) {
    if (!active || !clone || !touched.size)
        return clone;
    const pending = [];
    const mismatch = () => {
        const message = __rmT("1Z8U4qi1oR1GbzRCaPg4u_oy.T766nXFQYo3q6tFi.XF9xCloc7aonH54GfL5cvovsFh9rmxwdlfjrYhf7nCeLGu");
        try {
            globalThis.toastr?.warning?.(message);
        }
        catch { }
        throw new Error(message);
    };
    const pair = (copy, original) => {
        if (original && copy.nodeType === 8 && copy.data === 'rm-export-tool')
            return;
        if (!original || copy.nodeType !== original.nodeType || copy.nodeName !== original.nodeName)
            mismatch();
        if (copy.nodeType === 3 || touched.has(original)) {
            const record = touched.get(original);
            const restored = record ? originalOf(original) : displayValue(original);
            if (displayValue(copy) !== restored) {
                if (displayValue(copy) !== displayValue(original))
                    mismatch();
                if (record)
                    pending.push([copy, restored]);
            }
            if (copy.nodeType === 3)
                return;
        }
        const a = [...(copy.childNodes || [])], b = [...(original.childNodes || [])];
        if (a.length !== b.length)
            mismatch();
        for (let i = 0; i < a.length; i += 1)
            pair(a[i], b[i]);
    };
    pair(clone, source);
    for (const [node, text] of pending)
        setDisplayValue(node, text);
    return clone;
}
export function prepareNameMaskReplacement(clone, source) {
    unmaskNameMaskClone(clone, source);
    const records = touched;
    const pairs = [];
    const collect = (copy, original) => {
        const record = records.get(original);
        if (record)
            pairs.push([original, copy, record]);
        for (let i = 0; i < original.childNodes.length; i++)
            collect(copy.childNodes[i], original.childNodes[i]);
    };
    if (active && records.size)
        collect(clone, source);
    let committed = false;
    return () => {
        if (committed || !active || touched !== records || source.isConnected || !clone.isConnected)
            return;
        committed = true;
        const replacements = new Map(), groups = new Set(), anchors = new Set(), blocks = new Set();
        for (const [original, copy, record] of pairs) {
            if (records.get(original) !== record || (copy !== clone && !clone.contains(copy)))
                continue;
            replacements.set(original, copy);
            records.delete(original);
            record.original = displayValue(copy);
            records.set(copy, record);
            if (record.group)
                groups.add(record.group);
            blocks.add(blockOf(copy));
            for (const part of record.parts || [])
                if (part.anchor || part.lead)
                    anchors.add(part.anchor || part.lead);
        }
        for (const group of groups)
            group.nodes = new Set([...group.nodes].map(node => replacements.get(node) || node));
        for (const anchor of anchors) {
            anchor.node = replacements.get(anchor.node) || anchor.node;
            for (const tail of anchor.tails || [])
                tail.node = replacements.get(tail.node) || tail.node;
        }
        for (const block of blocks)
            maskBlock(block);
    };
}
export function isNameMaskActive() { return active; }
export function writeNameMaskOriginalText(node, value) {
    if (node?.nodeType !== 3)
        return false;
    const text = String(value ?? '');
    if (!active || !node.isConnected || skipped(node)) {
        node.nodeValue = text;
        touched.delete(node);
        return true;
    }
    const run = textRuns(blockOf(node)).find(nodes => nodes.includes(node));
    const originals = run?.map(current => current === node ? text : originalOf(current));
    node.nodeValue = text;
    if (run)
        maskRun(run, originals);
    else
        touched.delete(node);
    return true;
}
export function applyNameMaskToRestoredRoot(root) {
    if (active && root?.isConnected)
        maskTree(root);
}
export function assertNameMaskRestorable(root) {
    if (!active || !root)
        return;
    for (const node of touched.keys())
        if (root === node || root.contains?.(node))
            originalOf(node);
}
export function normalizeNameMaskCardRules(value) {
    const out = {};
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return out;
    for (const [key, list] of Object.entries(value).slice(-200)) {
        const name = String(key || '').trim().slice(0, 300);
        const rules = normalizeNameMaskRules(list);
        if (name && rules.length)
            out[name] = rules;
    }
    return out;
}
export function nameMaskRulesFor(settings, cardKey) {
    const card = cardKey ? normalizeNameMaskRules(settings?.nameMaskRulesByCard?.[cardKey]) : [];
    return normalizeRules([...card, ...normalizeNameMaskRules(settings?.nameMaskRules)], NAME_MASK_MAX_RULES * 2);
}
export function enableNameMask({ doc = globalThis.document, ctx = hostContext(), extra = [] } = {}) {
    if (!doc?.body)
        return 0;
    rules = buildNameMaskRules(ctx, typeof extra === 'function' ? extra(ctx) : extra);
    if (!rules.length)
        return 0;
    active = true;
    maskedChatId = chatIdOf(ctx);
    lastExtra = extra;
    bindHostEvents(ctx);
    maskTree(doc.body);
    observer?.disconnect();
    const Observer = doc.defaultView?.MutationObserver || globalThis.MutationObserver;
    if (Observer) {
        observer = new Observer(records => {
            if (!active)
                return;
            const now = hostContext();
            if (chatIdOf(now) !== maskedChatId) {
                if (disableNameMask() !== false)
                    enableNameMask({ doc, ctx: now, extra: lastExtra });
                return;
            }
            if (touched.size > 4000)
                for (const node of touched.keys())
                    if (!node.isConnected)
                        touched.delete(node);
            const blocks = new Set();
            const add = node => { if (node?.nodeType === 3) {
                if (!skipped(node))
                    blocks.add(blockOf(node));
            }
            else if (node?.nodeType === 1)
                collectBlocks(node, blocks); };
            for (const record of records) {
                if (record.type === 'characterData')
                    add(record.target);
                else {
                    if (record.type === 'attributes' && record.attributeName && record.attributeName !== TITLE_DISPLAY_ATTR) {
                        if (!flowVisibility.has(record.target) || flowVisibility.get(record.target) === hiddenFromFlow(record.target))
                            continue;
                        blocks.add(blockOf(record.target.parentElement));
                    }
                    blocks.add(blockOf(record.target));
                    if (record.type === 'childList')
                        record.addedNodes.forEach(add);
                }
            }
            for (const block of blocks)
                maskBlock(block);
            observer?.takeRecords?.();
        });
        observer.observe(doc.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [TITLE_DISPLAY_ATTR, 'hidden', 'style', 'class'] });
    }
    return rules.length;
}
export function disableNameMask() {
    try {
        for (const node of touched.keys()) {
            if (node.isConnected)
                originalOf(node);
        }
    }
    catch (error) {
        if (error?.name === 'RabbitMirrorNameMaskRestoreError')
            return false;
        throw error;
    }
    active = false;
    observer?.disconnect();
    observer = null;
    const changed = new Set();
    for (const [node, record] of touched)
        if (node.isConnected && displayValue(node) !== record.masked)
            changed.add(blockOf(node));
    for (const block of changed)
        maskBlock(block);
    const groupIntact = group => [...group.nodes].every(node => touched.get(node)?.masked === displayValue(node));
    const restore = [...touched].filter(([node, record]) => displayValue(node) === record.masked && (!record.group || groupIntact(record.group)));
    for (const [node, record] of restore)
        setDisplayValue(node, record.original);
    touched = new Map();
    flowVisibility = new WeakMap();
    rules = [];
    restoreWarningShown = false;
    return true;
}
export function toggleNameMask(options = {}) {
    if (active) {
        if (disableNameMask() === false)
            return { active: true, count: rules.length, turnedOff: false, blocked: true };
        return { active: false, count: 0, turnedOff: true };
    }
    const count = enableNameMask(options);
    return { active: count > 0, count };
}
