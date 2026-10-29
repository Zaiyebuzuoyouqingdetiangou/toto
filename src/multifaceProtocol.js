import { rmT as __rmT } from "./textTable.js?rmv=2.0.0";
export const MULTIFACE_PROTOCOL_LIMITS = Object.freeze({
    chars: 768 * 1024,
    bytes: 512 * 1024,
    tags: 4200,
    depth: 72,
    attributes: 12000,
    tagChars: 32768,
    cssChars: 160000,
    cssRules: 1400,
    dataUriChars: 192000,
});
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW_TAGS = new Set(['style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript']);
const SPACE = /[\t\n\f\r ]/;
const NAME_START = /[a-z]/i;
const NAME_PART = /[a-z0-9._:-]/i;
export const MULTIFACE_FAILURE_ATTR = 'data-rabbit-mirror-face-failure';
export function createMultifaceFailureSlot(faceIndex, code = 'incomplete-face') {
    if (!Number.isInteger(faceIndex) || faceIndex < 0 || faceIndex > 4)
        throw new RangeError('Invalid face index');
    const safeCode = String(code || '').replace(/[^a-z0-9-]/gi, '').slice(0, 80) || 'incomplete-face';
    const ordinal = faceIndex + 1;
    return `<toto data-rabbit-mirror="true" data-rm-face="${ordinal}"><details ${MULTIFACE_FAILURE_ATTR}="${safeCode}${__rmT("vKgLf3PX2ghWwQxP3KKU4TwdqkLrNeC6FOLzNIK7DCWYckIy")}${ordinal}${__rmT("Zl4AVEU01XQblX236dzjQ7r.Be6nP4QTTySuhXbiJ9B7pYPPH1e7khm_PGm2yrwwgGn6x7jArQHtnh7gSNWTI8AM_XK3fcj1WkhyDSRbjdk")}${safeCode}${__rmT("oD2NKpOWiKXEMMsWyQBw07NjJYRt44mwRh0ad6bpM2U3o9m.mTP6Dgpm7tML1IG1zQ9jETIW1HiCtFCkj40mxk8HVFAIsqVKt08J3EuMVKJ10DxtDE7gFDjtLCuPoqIa8983tf0GqCFh41f5hzCUDFFEh7yWu2kcDxm25ZGHDCjSKnLp5QOaSGvUDZE")}`;
}
export function recoverableMultifaceFrames(parsed) {
    if (!parsed || !Array.isArray(parsed.faces) || (parsed.errors || []).some(error => /budget|depth/.test(String(error?.code || '')) || error?.code === 'invalid-input' || error?.code === 'invalid-expected-count'))
        return [];
    return parsed.faces;
}
export function multifaceRecoveryWithinRawBudgets(raw) {
    if (typeof raw !== 'string')
        return false;
    const stats = { bytes: 0, dataUriChars: 0 };
    if (preflight(raw, stats))
        return false;
    let tags = 0, attributes = 0, depth = 0, cssChars = 0, cssRules = 0;
    for (const match of raw.matchAll(/<\s*(\/?)\s*([a-z][a-z0-9._:-]*)\b/gi)) {
        tags += 1;
        if (tags > MULTIFACE_PROTOCOL_LIMITS.tags)
            return false;
        const start = match.index;
        const end = raw.indexOf('>', start + 1);
        const fragment = raw.slice(start, end < 0 ? raw.length : end + 1);
        if (fragment.length > MULTIFACE_PROTOCOL_LIMITS.tagChars)
            return false;
        const name = match[2].toLowerCase();
        if (match[1])
            depth = Math.max(0, depth - 1);
        else if (!VOID_TAGS.has(name) && !/\/\s*>$/.test(fragment))
            depth += 1;
        if (depth > MULTIFACE_PROTOCOL_LIMITS.depth)
            return false;
        if (!match[1])
            for (const attribute of fragment.matchAll(/\s+[a-z_:][a-z0-9_:.-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/gi)) {
                attributes += 1;
                if (attributes > MULTIFACE_PROTOCOL_LIMITS.attributes)
                    return false;
            }
    }
    for (const match of raw.matchAll(/<style\b[^>]*>([\s\S]*?)(?:<\/style\s*>|$)/gi)) {
        cssChars += match[1].length;
        for (const char of match[1])
            if (char === '{')
                cssRules += 1;
        if (cssChars > MULTIFACE_PROTOCOL_LIMITS.cssChars || cssRules > MULTIFACE_PROTOCOL_LIMITS.cssRules)
            return false;
    }
    return true;
}
function protocolError(code, offset, message) {
    return { code, offset, message };
}
export function normalizedSummaryText(source = '') {
    const input = String(source || '');
    let text = '';
    let cursor = 0;
    while (cursor < input.length) {
        if (input.startsWith('<!--', cursor)) {
            const end = input.indexOf('-->', cursor + 4);
            cursor = end < 0 ? input.length : end + 3;
            continue;
        }
        if (input[cursor] !== '<') {
            text += input[cursor];
            cursor += 1;
            continue;
        }
        let quote = '';
        cursor += 1;
        while (cursor < input.length) {
            const char = input[cursor];
            if (quote) {
                if (char === quote)
                    quote = '';
            }
            else if (char === '"' || char === "'")
                quote = char;
            else if (char === '>') {
                cursor += 1;
                break;
            }
            cursor += 1;
        }
    }
    return text
        .replace(/&#x([0-9a-f]{1,6});?/gi, (_, hex) => {
        try {
            return String.fromCodePoint(Number.parseInt(hex, 16));
        }
        catch {
            return '';
        }
    })
        .replace(/&#([0-9]{1,7});?/g, (_, decimal) => {
        try {
            return String.fromCodePoint(Number.parseInt(decimal, 10));
        }
        catch {
            return '';
        }
    })
        .replace(/&(nbsp|ensp|emsp|thinsp);/gi, ' ')
        .replace(/&(amp|lt|gt|quot|apos);/gi, (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[entity.toLowerCase()])
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[\s\u200b-\u200d\ufeff]+/g, '');
}
function readTag(source, start, stats) {
    let cursor = start + 1;
    const closing = source[cursor] === '/';
    if (closing)
        cursor += 1;
    if (!NAME_START.test(source[cursor] || ''))
        return { error: protocolError('invalid-tag', start, __rmT("JH2pQplNKmtoIif1")) };
    const nameStart = cursor;
    while (cursor < source.length && NAME_PART.test(source[cursor]))
        cursor += 1;
    const name = source.slice(nameStart, cursor).toLowerCase();
    const attributes = Object.create(null);
    let selfClosing = false;
    while (cursor < source.length) {
        if (cursor - start > MULTIFACE_PROTOCOL_LIMITS.tagChars)
            return { error: protocolError('tag-budget', start, __rmT("qUBl97cvJ10DgqmpcpnONxln0U9ekOs2")) };
        const beforeSpace = cursor;
        while (cursor < source.length && SPACE.test(source[cursor]))
            cursor += 1;
        if (cursor - start > MULTIFACE_PROTOCOL_LIMITS.tagChars)
            return { error: protocolError('tag-budget', start, __rmT("qUBl97cvJ10DgqmpcpnONxln0U9ekOs2")) };
        if (source[cursor] === '>') {
            cursor += 1;
            stats.tags += 1;
            if (stats.tags > MULTIFACE_PROTOCOL_LIMITS.tags)
                return { error: protocolError('tag-budget', start, __rmT("l_I1RyElMlDuvZy_YRuBYwuWSA22WJ_F29E")) };
            return { name, closing, selfClosing, attributes, start, end: cursor };
        }
        if (!closing && source[cursor] === '/' && source[cursor + 1] === '>') {
            selfClosing = true;
            cursor += 2;
            stats.tags += 1;
            if (stats.tags > MULTIFACE_PROTOCOL_LIMITS.tags)
                return { error: protocolError('tag-budget', start, __rmT("l_I1RyElMlDuvZy_YRuBYwuWSA22WJ_F29E")) };
            return { name, closing, selfClosing, attributes, start, end: cursor };
        }
        if (closing || beforeSpace === cursor)
            return { error: protocolError('invalid-tag', start, __rmT("rlilRRepH_vW7pcJdkZEeMreFrR.ZYoKm5vspf")) };
        const attributeStart = cursor;
        while (cursor < source.length && !SPACE.test(source[cursor]) && !'/=>'.includes(source[cursor])) {
            if ('<\"\'`\0'.includes(source[cursor]))
                return { error: protocolError('invalid-attribute', cursor, __rmT("TlMIi_QluHimqlGVG44dWwPVbNs")) };
            cursor += 1;
        }
        if (cursor === attributeStart)
            return { error: protocolError('invalid-attribute', cursor, __rmT("_MJ3tAlNg30Erof1")) };
        const attribute = source.slice(attributeStart, cursor).toLowerCase();
        if (Object.hasOwn(attributes, attribute))
            return { error: protocolError('duplicate-attribute', attributeStart, __rmT("CENdUsOT12ymqybxFf5wdbwobNs")) };
        const afterName = cursor;
        while (cursor < source.length && SPACE.test(source[cursor]))
            cursor += 1;
        let value = '';
        if (source[cursor] === '=') {
            cursor += 1;
            while (cursor < source.length && SPACE.test(source[cursor]))
                cursor += 1;
            const quote = source[cursor];
            if (quote === '"' || quote === "'") {
                cursor += 1;
                const valueStart = cursor;
                while (cursor < source.length && source[cursor] !== quote)
                    cursor += 1;
                if (cursor === source.length)
                    return { error: protocolError('unclosed-attribute', valueStart, __rmT("tgywEWWK0GLWVccl09npUT")) };
                value = source.slice(valueStart, cursor);
                cursor += 1;
            }
            else {
                const valueStart = cursor;
                while (cursor < source.length && !SPACE.test(source[cursor]) && source[cursor] !== '>') {
                    if ('<\"\'`='.includes(source[cursor]))
                        return { error: protocolError('invalid-attribute', cursor, __rmT("H_kPz7Eqvyey5RI3AkSASBU7vCZrS31Y29E")) };
                    cursor += 1;
                }
                if (cursor === valueStart)
                    return { error: protocolError('invalid-attribute', valueStart, __rmT("_MJ3tqDog30Erof1")) };
                value = source.slice(valueStart, cursor);
            }
        }
        else
            cursor = afterName;
        attributes[attribute] = value;
        stats.attributes += 1;
        if (stats.attributes > MULTIFACE_PROTOCOL_LIMITS.attributes)
            return { error: protocolError('attribute-budget', attributeStart, __rmT("l_I1RgD8E3CuvZy_YRuBYwuWSA22WJ_F29E")) };
    }
    return { error: protocolError('unclosed-tag', start, __rmT("JH2pQrfHXhyoRXf1")) };
}
function rawClose(source, start, name) {
    const expression = new RegExp(`</${name}[\\t\\n\\f\\r ]*>`, 'gi');
    expression.lastIndex = start;
    return expression.exec(source);
}
function validateStyle(source, start, end, stats) {
    stats.cssChars += end - start;
    if (stats.cssChars > MULTIFACE_PROTOCOL_LIMITS.cssChars)
        return protocolError('css-budget', start, __rmT("l_I1RREldoBXKsHaYRuBYwuWSA22WJ_F29E"));
    let quote = '';
    let comment = false;
    const brackets = [];
    for (let cursor = start; cursor < end; cursor += 1) {
        const char = source[cursor];
        if (char === '{') {
            stats.cssRules += 1;
            if (stats.cssRules > MULTIFACE_PROTOCOL_LIMITS.cssRules)
                return protocolError('css-budget', cursor, __rmT("l_I1RREldoN.QbebYRuBYwuWSA22WJ_F29E"));
        }
        if (comment) {
            if (char === '*' && source[cursor + 1] === '/') {
                comment = false;
                cursor += 1;
            }
            continue;
        }
        if (quote) {
            if (char === '\\')
                cursor += 1;
            else if (char === quote)
                quote = '';
            continue;
        }
        if (char === '/' && source[cursor + 1] === '*') {
            comment = true;
            cursor += 1;
            continue;
        }
        if (char === '"' || char === "'") {
            quote = char;
            continue;
        }
        if (char === '\\') {
            cursor += 1;
            continue;
        }
        if (char === '<' && /^<\/?(?:toto|details|style)\b/i.test(source.slice(cursor, cursor + 20))) {
            return protocolError('cross-face-style', cursor, __rmT("DEKQ4o_.A8sjOUW1WhL5RIyjI0sUcOmFb3D5qkNCgG8"));
        }
        if ('{(['.includes(char)) {
            brackets.push(char);
            if (brackets.length > MULTIFACE_PROTOCOL_LIMITS.depth)
                return protocolError('css-depth', cursor, __rmT("_EAxzNkFTo4EDZizZhSLiHOuQ1m2WJ_F29E"));
        }
        else if ('})]'.includes(char)) {
            if (stats.lenientStyle && char === '}' && !brackets.length)
                continue;
            if (brackets.pop() !== ({ '}': '{', ')': '(', ']': '[' })[char])
                return protocolError('unbalanced-style', cursor, __rmT("eBo10B4k0GLktGdJva1pUT"));
        }
    }
    if (quote || comment || brackets.length)
        return protocolError('unclosed-style', end, __rmT("DEKQ4eCDL8lAPC43V2hjgecT_EPbc0wYAKguDjzggG8"));
    return null;
}
function preflight(source, stats) {
    if (source.length > MULTIFACE_PROTOCOL_LIMITS.chars)
        return protocolError('character-budget', 0, __rmT("l_I1R1lqjokXKsHaYRuBYwuWSA22WJ_F29E"));
    for (let cursor = 0; cursor < source.length; cursor += 1) {
        const code = source.charCodeAt(cursor);
        if (code < 0x80)
            stats.bytes += 1;
        else if (code < 0x800)
            stats.bytes += 2;
        else if (code >= 0xd800 && code <= 0xdbff && source.charCodeAt(cursor + 1) >= 0xdc00 && source.charCodeAt(cursor + 1) <= 0xdfff) {
            stats.bytes += 4;
            cursor += 1;
        }
        else
            stats.bytes += 3;
        if (stats.bytes > MULTIFACE_PROTOCOL_LIMITS.bytes)
            return protocolError('byte-budget', cursor, __rmT("W2o7Ds2XZPhrwg3PRKss4cWdsU8MMsvr3_.RBp90lwSGyZQX"));
    }
    for (const match of source.matchAll(/data:[^\s"')>]+/gi)) {
        stats.dataUriChars += match[0].length;
        if (stats.dataUriChars > MULTIFACE_PROTOCOL_LIMITS.dataUriChars)
            return protocolError('data-uri-budget', match.index, __rmT("B_DmlJA2BPEvcZon7GSaf2bO8ZjAyctYsRDXXSOQgG8"));
    }
    return null;
}
export function parseMultifaceOutput(raw, { expectedCount, allowProse = false, storedDisplay = false } = {}) {
    const stats = { chars: typeof raw === 'string' ? raw.length : 0, bytes: 0, tags: 0, attributes: 0, maxDepth: 0, cssChars: 0, cssRules: 0, dataUriChars: 0, lenientStyle: storedDisplay === true };
    const faces = [];
    const errors = [];
    const stack = [];
    let active = null;
    let cursor = 0;
    let aborted = false;
    const seenOrdinals = new Set();
    const seenSummaries = new Map();
    const fail = (error, ordinal = active?.ordinal) => {
        const located = Number.isInteger(ordinal) && ordinal >= 1 && ordinal <= 5
            ? { ...error, terminalFace: ordinal } : error;
        if (errors.length < 12)
            errors.push(located);
        aborted = true;
    };
    if (typeof raw !== 'string')
        fail(protocolError('invalid-input', 0, __rmT("RwpAxvOVqY59t7cTkKFv_sbKPHqrrk")));
    if (expectedCount !== undefined && (!Number.isInteger(expectedCount) || expectedCount < 2 || expectedCount > 5)) {
        fail(protocolError('invalid-expected-count', 0, __rmT("s8iJcHN2Azdj88P5R2CC4AwdOfegMrCgOAnvlsovnRyDvSQX")));
    }
    if (!aborted) {
        const error = preflight(raw, stats);
        if (error)
            fail(error);
    }
    while (!aborted && cursor < raw.length) {
        if (raw[cursor] !== '<' || (!NAME_START.test(raw[cursor + 1] || '') && !'/!?'.includes(raw[cursor + 1] || '\0'))) {
            const start = cursor;
            cursor += 1;
            while (cursor < raw.length && raw[cursor] !== '<')
                cursor += 1;
            if (!active && /(?:^|\r?\n)\s*(?:```|~~~)/.test(raw.slice(start, cursor))) {
                fail(protocolError('outside-wrapper', start, __rmT("qNEgNKjn4CSjucj0IcMOl16DJyuPD8qJfh.spN8Z6BThelTaIg7FeRxr6g8MbvkC")));
                continue;
            }
            if ((!active && !allowProse) || (active && stack.length === 1)) {
                if (/\S/.test(raw.slice(start, cursor)))
                    fail(protocolError('outside-content', start, __rmT("mCQQhCPaSX3_oI.uCimeM7EI")));
            }
            continue;
        }
        if (raw.startsWith('<!--', cursor)) {
            const end = raw.indexOf('-->', cursor + 4);
            if (end < 0) {
                fail(protocolError('unclosed-comment', cursor, __rmT("xuQT5dfHXhyoRXf1")));
                break;
            }
            if (!active && !allowProse) {
                fail(protocolError('outside-content', cursor, __rmT("iBE7o5w6H9.JaUOJ0sAwdlwRP2jmiEeUWQmLTn61B6J.bh")));
                break;
            }
            cursor = end + 3;
            continue;
        }
        if (raw.startsWith('<![CDATA[', cursor) && stack.at(-1)?.foreign) {
            const end = raw.indexOf(']]>', cursor + 9);
            if (end < 0) {
                fail(protocolError('unclosed-cdata', cursor, __rmT("qugSaB8BRs0eSkHhT0Q_YRn9bNs")));
                break;
            }
            cursor = end + 3;
            continue;
        }
        if (raw[cursor + 1] === '!' || raw[cursor + 1] === '?') {
            fail(protocolError('unsupported-declaration', cursor, __rmT("FQxRD0r.dRAxckp5VgCZ2jamGqrmz9cV6hwGbZVnMsOsvzQX")));
            break;
        }
        const tag = readTag(raw, cursor, stats);
        if (tag.error) {
            fail(tag.error);
            break;
        }
        cursor = tag.end;
        if (tag.closing) {
            if (stack.at(-1)?.name !== tag.name) {
                fail(protocolError('mismatched-close', tag.start, __rmT("dbPBGSoeDuZzMEg.SEQ_YRn9bNs")));
                break;
            }
            stack.pop();
            if (active && tag.name === 'summary' && stack.length === 2)
                active.summaryEnd = tag.start;
            if (active && tag.name === 'details' && stack.length === 1)
                active.detailsEnd = tag.end;
            if (tag.name === 'toto') {
                if (!active || active.details !== 1 || active.summaries !== 1) {
                    fail(protocolError('invalid-face-structure', tag.start, __rmT(".PzEggarOODWlXjXndClmRULaniUI7Du46qzkVbJuvKoVN_L6E_YXAZq2J36p6SubeatGgMunr5YHdQcwVMgKtt9RAXzSWS7t0XVvNehBSZ4ai_z")));
                    break;
                }
                const inner = raw.slice(active.innerStart, tag.start);
                const duplicate = faces.findIndex(face => face.inner.trim() === inner.trim());
                if (duplicate >= 0 && !storedDisplay) {
                    faces.splice(duplicate, 1);
                    fail(protocolError('duplicate-face-content', active.start, __rmT("jmx_Tn0PZymw8dILwfHW9aehIU3YhA6A29E")));
                    break;
                }
                const summaryHtml = raw.slice(active.summaryStart, active.summaryEnd);
                const summaryKey = normalizedSummaryText(summaryHtml);
                const duplicateSummary = seenSummaries.get(summaryKey);
                if (duplicateSummary !== undefined && !storedDisplay) {
                    const duplicateIndex = faces.findIndex(face => face.index === duplicateSummary);
                    if (duplicateIndex >= 0)
                        faces.splice(duplicateIndex, 1);
                    fail(protocolError('duplicate-face-summary', active.start, __rmT("GYiSmuXQ9INMBRCp2F3osEIj4saZ2Gs2aoX0ECQLa0rJkjuXbSSN1AoKWxf9uT")));
                    break;
                }
                faces.push({
                    index: active.ordinal - 1,
                    inner,
                    html: raw.slice(active.start, tag.end),
                    details: raw.slice(active.detailsStart, active.detailsEnd),
                    summaryHtml,
                });
                seenSummaries.set(summaryKey, active.ordinal - 1);
                active = null;
            }
            continue;
        }
        if (tag.name === 'toto') {
            if (active || stack.length) {
                fail(protocolError('nested-face', tag.start, __rmT("foHkxNCi86MvNk5F2r0AOJGeZubjJQvzXvA3idZUBk0uI4ydFbN4I49xDlOvqPpXQbRY3h")));
                break;
            }
            const ordinal = tag.attributes['data-rm-face'];
            if (tag.selfClosing || tag.attributes['data-rabbit-mirror'] !== 'true' || !/^[1-5]$/.test(ordinal || '')) {
                fail(protocolError('invalid-face-marker', tag.start, __rmT("zQCgNalbCqrYnsB2wYq3RhMnyjlRZAKIQAY8pbkZiGvKc_TaAwHBgJxd2D0hBSkC")));
                break;
            }
            const number = Number(ordinal);
            if (seenOrdinals.has(number)) {
                const duplicate = faces.findIndex(face => face.index === number - 1);
                if (duplicate >= 0)
                    faces.splice(duplicate, 1);
                fail(protocolError('duplicate-face-index', tag.start, __rmT("OcVvGMF3yNwcse4CpgJ6NebmzAGvxxs2")), number);
                break;
            }
            if (expectedCount !== undefined && number > expectedCount) {
                fail(protocolError('unexpected-face-index', tag.start, __rmT("tEUFrVXjjtGqN4XmcnVy__dqj1AkhZSrfk9spf")), number);
                break;
            }
            seenOrdinals.add(number);
            active = { ordinal: number, start: tag.start, innerStart: tag.end, details: 0, summaries: 0 };
        }
        else if (!active && !allowProse) {
            fail(protocolError('outside-markup', tag.start, __rmT("DJMNCFKj6ocBtQZvgJM8DL7G_.lQX0LjkVD1GehLmk0SfT2YrKTr7f")));
            break;
        }
        else if (active && stack.length === 1) {
            if (tag.name === 'details') {
                active.details += 1;
                active.detailsStart = tag.start;
            }
            else if (tag.name !== 'style') {
                fail(protocolError('invalid-face-root', tag.start, __rmT("vP6Nrl6vyeVtpHKKb3Q2FvDaJKkPfE0ov8tMATiQOETRAb_4UZACVfYTzBG")));
                break;
            }
            if (active.details > 1) {
                fail(protocolError('multiple-face-details', tag.start, __rmT("D2wDJzfARHv57yZpu7JLE6Yrw4vVuK7i1hgfvsMQP7iQTSA.q8_")));
                break;
            }
        }
        else if (active && stack.length === 2 && stack.at(-1)?.name === 'details' && tag.name === 'summary') {
            active.summaries += 1;
            active.summaryStart = tag.end;
            if (active.summaries > 1) {
                fail(protocolError('multiple-face-summaries', tag.start, __rmT("ORRWifWgr2DZlVn2RjaUId2tmjFM13k52dPl3oF4YTEAbjig3xs6nRZhHG6o8B7hNqJxOuGP")));
                break;
            }
        }
        if (tag.name === 'plaintext' || tag.name === 'script') {
            fail(protocolError('unsupported-raw-text', tag.start, __rmT("5rPKf9Y4CTXSu3h8znX4AcdXk1ke6H4FZbqtaZhOtNi8ePiMH.qO7vSf5dph.VzxyWlELc3WxG8obh")));
            break;
        }
        const parentForeign = !!stack.at(-1)?.foreign;
        const foreign = tag.name === 'svg' || tag.name === 'math' || (parentForeign && tag.name !== 'foreignobject');
        if (tag.selfClosing && !VOID_TAGS.has(tag.name) && !parentForeign && !['svg', 'math'].includes(tag.name)) {
            fail(protocolError('invalid-self-close', tag.start, __rmT("zaMhoTrS045n0GpY5Gy9XcmtdF1Z3eN7LrSiaKBIPdM.bh")));
            break;
        }
        if (!VOID_TAGS.has(tag.name) && !tag.selfClosing) {
            stack.push({ name: tag.name, foreign });
            stats.maxDepth = Math.max(stats.maxDepth, stack.length);
            if (stack.length > MULTIFACE_PROTOCOL_LIMITS.depth) {
                fail(protocolError('depth-budget', tag.start, __rmT("l_I1RJkFTozBTYHnYRuBYwuWSA22WJ_F29E")));
                break;
            }
            if (RAW_TAGS.has(tag.name)) {
                const close = rawClose(raw, cursor, tag.name);
                if (!close) {
                    fail(protocolError('unclosed-raw-text', tag.start, __rmT("k_V.hpOKnMmjafG3T0Q_YRn9bNs")));
                    break;
                }
                if (tag.name === 'style') {
                    const error = validateStyle(raw, cursor, close.index, stats);
                    if (error) {
                        fail(error);
                        break;
                    }
                }
                const closeTag = readTag(raw, close.index, stats);
                if (closeTag.error) {
                    fail(closeTag.error);
                    break;
                }
                stack.pop();
                cursor = closeTag.end;
            }
        }
    }
    if (!aborted && (active || stack.length))
        fail(protocolError('unclosed-face', raw.length, __rmT("attZ4k8kY6mCEgm31omeQWHA2tvqT98f6K_5qkNCgG8")));
    const count = faces.length;
    const inferredCount = seenOrdinals.size ? Math.max(...seenOrdinals) : 0;
    const wanted = expectedCount === undefined ? inferredCount : expectedCount;
    const orderedFaces = faces.sort((left, right) => left.index - right.index);
    const allOrdinals = wanted >= 2 && wanted <= 5 && count === wanted && orderedFaces.every((face, index) => face.index === index);
    if (!aborted && !allOrdinals) {
        const missing = Array.from({ length: Math.max(0, Math.min(5, wanted)) }, (_, index) => index + 1).filter(ordinal => !orderedFaces.some(face => face.index === ordinal - 1));
        errors.push({ ...protocolError('face-count-mismatch', typeof raw === 'string' ? raw.length : 0, __rmT("aNJiuplc.VUD1KHa43cK9IgfU8.iZDvz7V5R6nwNYPi.bh")), ...(missing.length === 1 ? { terminalFace: missing[0] } : {}) });
    }
    const complete = !aborted && allOrdinals;
    const ok = complete && errors.length === 0;
    return { ok, faces: orderedFaces, errors, complete, count, expectedCount: wanted, partial: count > 0 && !ok, stats };
}
