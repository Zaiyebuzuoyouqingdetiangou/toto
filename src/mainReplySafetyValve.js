import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.1.8";
const NOTIFIED = new WeakMap();
const STATUS_CODE = /\b(?:400|401|403|408|413|429|500|502|503|504|520|521|522|523|524|529)\b/;
const ERROR_EN = /(?:\berror\b|too many requests|rate.?limit|quota|resource.?exhausted|service unavailable|bad gateway|gateway time-?out|timed? ?out|upstream|internal server error|overloaded|unauthorized|forbidden|cloudflare)/i;
const ERROR_CN = __rmR("NclgjoZ_Xx5H1DXaN7.xTKBFBVAlvDWWOGBIgwbs7Zrc0U2t7ckUcereHHiNtY1if4iPa2DHSLN9DWoTAHxOkJVhCiVC7P_qACMHBhr2hOZRvM0OOnAsxHTvOE9qcwWcxbs2ZufCIeaVd2sdTShCderB_vIQG36JkOi4SaaWD70xKlp8hVo1UQq8beSiRuJPB91NgcLODxGpggLUAJ7jRSCV6vttmQOO0G8", "");
const API_ERROR_PHRASE = /(?:rate[ _-]?limit(?:ed|[ _-]exceeded|[ _-]error| reached)|resource[ _-]?(?:has been )?exhausted|insufficient[ _-]quota|exceeded your current quota|please (?:retry|try again) (?:after|in) \d+ ?(?:s|sec|seconds?)\b|request id: ?[\w-]{6,})/i;
const RELAY_ERROR_PHRASE = __rmR("2QBOHvkoBCizRAfSSucR0LxpZMCyJUaUKT6Ub_52lNxXgHHydyIIVrHq1Pl5iBo_v7_nn.0pl22CQL3nSt07tREGVqiCZk3gBVP5lETyJ144cNzZRnm_UxHkjgO.UJfRZBhd5tWIdcJpQ6dQ1SEi9Fjx2CDTdN67NGXmTAHozAG", "i");
const RELAY_ERROR_COMPANION = __rmR("kWeKzn9OsCMHWHRTevYty2fS9VOQvgvJXFZy25iKVi8Sora6nRQnQNMArbF10CQ6qa0t6fw9_1GmvKNlvYoGOeRFUIW.W_ZUr7JOww.hedzbEWGUSC8aDLqQVYOE7lGsIk9oDZefjycjvqNX6l7GXLASWUOM__7PE_U4KiZ_p1OVXfbO7UFTHJGETOL58jf3pAdhEXnOfo4utv9RhaRg4JZs2PPGNy1RvBjugdcrsWBX9T", "i");
const ERROR_START = __rmR("QKwdimCoUAuzb2aTZwpOGD.LTnwuCDdZpPAyBSQbNzXUBbpAyOY73UvqNJ3mp6zuRVq_GJSu1dvRshA6FIk4hh9QnpXYSWX7DnX1v2uhnzZWaETv", "i");
const EMPTY_HINT = __rmR("rAdNPoKM58YAdG.au15Eb.jYR1Og8pOGNjUiqqTl9Pz4JPtiPjf4ABHVj4gLqsXswFuuh2CMKe.VxkgHeYBBGlQN1M0wKxhUE8RpXOaX3sq7wwHBFPRzXzQ8iJFfYEPhR_vwaeWaqUXu3cYQz37D5cVlrnklB8gwC9wB9XGkUtyKzrU6mP8Pzxb2YUxP26XPKPJCZf", "i");
const REFUSAL_START = __rmR("lY8J614QzTDEEC6bZ3F88ZHYlE8eelO8kGoZzdY5jeuaFr2mQm4Dnc8AyyrXWrcubNxlhDFKb_CquHq03b1PjmkzdHEXEJiGJAXsgRTM7tKQT7bVMYKulRsSF3OuItMRuJHJx.0PNEesRLK.mTzeUl1Iybz5dQml1QSkuZqaBndu5D08ohZiua9sXmerRQMbcXFWGLu.Gje8uEEAqONsYLbV.k1OjT4bbFPe4NaSjiAbO87S2nxQWzQpcRCwdU3_YS0ZDF2ocDpdvi41.7TcvkKPFYJ9je7IuJzjSHcakzNfiw3GO531whZBsE4ZfGibiwIkzvCVbGGy4Mb_LiXTxA_34QWBLC0Jhelvmy6C3qT5q0NligqJaS5ikT1_Bo4hKeA", "i");
const REFUSAL_WORDS = __rmR("dehpWObqzjM49GdOdUgenRE6vzTwe7aMinU7JE90cwOGUqGU6uLisP0OxU_ClkDSc_bpaIuYZv_KPalnpzs8BB8CpfKqIpjrqcsURyZpahOCLd9gdRY.2SumQRSxyB8xGhAc7r6Ki1x1b2PldhjMEduX9gEBmJ8QWsNSHBrCWqinjKFuMSR1X66walvDs_UhCQaOEBILu3Rn5s8L3x4bi8HlMT7857WL09cGUPtfb4l1Ks6fUmjS2hP2cgA", "i");
const REASONING_TAGS = new Set(['think', 'thinking', 'thought', 'thoughts', 'reasoning', 'analysis', 'cot', 'chain-of-thought']);
function abnormalTerminationReason(message, { processor, messageIndex } = {}) {
    const sources = [message, message.extra];
    const body = String(message.mes || '').trim();
    const processorSwipe = processor?.swipe_id ?? processor?.swipeId;
    if (processor && Number.isSafeInteger(messageIndex) && Number(processor.messageId) === messageIndex
        && body && String(processor.result || '').trim() === body
        && (processorSwipe === undefined || Number(processorSwipe) === Number(message.swipe_id || 0)))
        sources.push(processor);
    for (const source of sources)
        for (const field of ['finish_reason', 'finishReason', 'stop_reason', 'stopReason']) {
            const value = source?.[field];
            if (typeof value !== 'string')
                continue;
            const reason = value.trim().toLowerCase().replace(/[ -]/g, '_');
            if (/^(?:length|max_tokens|max_output_tokens|model_length)$/.test(reason))
                return __rmT("gidBIRkWEU_SOXp_6.dkc4rm2iu0DEI8NlkDXcJKh3E");
            if (/^(?:content_filter|safety|recitation|blocked)$/.test(reason))
                return __rmT("2P_pev5626ZJMLcrxRNW.216.xRAfNHEieAKDx15taE0Vf");
            if (/^(?:error|abort|aborted|cancelled|canceled)$/.test(reason))
                return __rmT("qEYby3dn8yZ1z7eJe_MQUfY_VPGtm031.NVeqjp_");
        }
    return '';
}
function unfinishedProseReason(raw) {
    const source = raw.trim();
    if (!/[\p{L}\p{N}]$/u.test(source))
        return '';
    const text = plainText(source);
    if (text.length < 80 || (text.match(__rmR("61eg.726D4TUTh", "g")) || []).length < 2)
        return '';
    const line = source.split(/\r?\n/).filter(value => value.trim()).at(-1)?.trim() || '';
    if (__rmR("aRvc4x5cGWnTRcQYPbXMfxUTW6NZaIFbgHD2e1H9lSqZWWZ1En7sZaZbpZHAiMQEOVT8Qe2WxNY_X9lhMabvcjY3cqNl89RbUr4eK4hfJ_CF584ZwNCXXz9Vv3k", "").test(line))
        return '';
    const tail = plainText(line);
    if (tail.length < 24 || (tail.match(/[\u3400-\u9fff]/g) || []).length < 16)
        return '';
    return __rmT("fH8.ahD3KYkWBwybDxiY9S2RAvMHdJGv3CxuZs1xBQkjWs3sYoT");
}
function jsonApiError(raw) {
    const trimmed = String(raw || '').trim();
    const start = trimmed.indexOf('{');
    if (start < 0 || start > 80 || !trimmed.endsWith('}'))
        return false;
    let data;
    try {
        data = JSON.parse(trimmed.slice(start));
    }
    catch {
        return false;
    }
    if (!data || typeof data !== 'object' || Array.isArray(data))
        return false;
    const err = data.error;
    if (data.type === 'error' && (err || data.message))
        return true;
    if (err && typeof err === 'object' && (err.message || err.type || err.code || err.status))
        return true;
    if (typeof err === 'string' && (data.message || data.code || data.status || data.type || /\b(?:4\d\d|5\d\d)\b|limit|quota|exhaust|invalid|unauthori|overload/i.test(err)))
        return true;
    const code = Number(data.code ?? data.status ?? data.status_code ?? data.statusCode);
    return code >= 400 && code < 600 && typeof (data.message ?? data.msg ?? data.detail) === 'string';
}
function plainText(raw) {
    return String(raw || '').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function htmlApiErrorHeader(raw) {
    if (!/^(?:<!doctype\s+html\b|<html\b)/i.test(raw.trim()))
        return false;
    const header = plainText([
        raw.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] || '',
        raw.match(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/i)?.[1] || '',
    ].join(' '));
    return (STATUS_CODE.test(header) && (ERROR_EN.test(header) || ERROR_CN.test(header)))
        || (/\bcloudflare\b/i.test(header) && /(?:too many requests|rate.?limit|service unavailable|bad gateway|gateway time-?out|timed? ?out|timeout|overloaded)/i.test(header));
}
function incompleteMainReplyMarkup(raw, bodyTags = [], completion = {}) {
    const bodies = new Set(['content', 'story', 'story_scene', __rmT("g6Q4jh")]);
    if (Array.isArray(bodyTags))
        for (const tag of bodyTags.slice(0, 8)) {
            if (typeof tag === 'string' && /^[a-z][a-z0-9_:-]{0,63}$/i.test(tag) && !REASONING_TAGS.has(tag.toLowerCase()))
                bodies.add(tag.toLowerCase());
        }
    const pending = new Map([...bodies, 'details', ...REASONING_TAGS].map(name => [name, 0]));
    const opaque = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'pre', 'code']);
    const tagStart = /<(\/?)([a-z\u3400-\u9fff][a-z0-9:._\-\u3400-\u9fff]*)(?=[\s/>]|$)/iy;
    const fenceStart = / {0,3}(`{3,}|~{3,})([^\r\n]*)/y;
    let cursor = 0, codeRuns = null, inlineBreaks = null, syntaxReason = '', closedBodyReason = '';
    const pendingReason = () => {
        for (const [name, count] of pending)
            if (count > 0)
                return `${__rmT("m66BwPg_Y7_luoHABK.CnZYx")}${name}${__rmT("oMYoeiElMlQ4vTrBqfXnDwOIwd66EVPJuLf")}`;
        return '';
    };
    while (cursor < raw.length) {
        if (cursor === 0 || raw[cursor - 1] === '\n') {
            fenceStart.lastIndex = cursor;
            const fence = fenceStart.exec(raw);
            if (fence && (fence[1][0] !== '`' || !fence[2].includes('`'))) {
                const close = new RegExp(`^ {0,3}${fence[1][0]}{${fence[1].length},}[\\t ]*\\r?$`, 'gm');
                close.lastIndex = fenceStart.lastIndex;
                const end = close.exec(raw);
                if (!end && fence[1][0] === '~') {
                    cursor = fenceStart.lastIndex;
                    continue;
                }
                if (!end && /<\/content\s*>/i.test(raw.slice(cursor))) {
                    cursor += fence[0].length - fence[2].length;
                    continue;
                }
                if (!end) {
                    syntaxReason = __rmT("P6bL0VuTzxam48vqeBYeweIcubJatnmTH_32K7WHDjqX4zWU_5pRSh");
                    break;
                }
                cursor = end.index + end[0].length;
                continue;
            }
        }
        if (raw[cursor] === '\\') {
            cursor += 2;
            continue;
        }
        if (raw[cursor] === '`') {
            if (!codeRuns) {
                codeRuns = new Map();
                for (const match of raw.matchAll(/`+/g)) {
                    const length = match[0].length;
                    if (!codeRuns.has(length))
                        codeRuns.set(length, { indexes: [], next: 0 });
                    codeRuns.get(length).indexes.push(match.index);
                }
                inlineBreaks = { indexes: [], next: 0 };
                for (const match of raw.matchAll(/^[\t ]*\r?$|^ {0,3}(?:`{3,}|~{3,})[^\r\n]*$|<\/(?:content|details)\s*>/gim)) {
                    inlineBreaks.indexes.push(match.index);
                }
            }
            let end = cursor + 1;
            while (raw[end] === '`')
                end += 1;
            const length = end - cursor, runs = codeRuns.get(length);
            while (runs && runs.next < runs.indexes.length && runs.indexes[runs.next] <= cursor)
                runs.next += 1;
            while (inlineBreaks.next < inlineBreaks.indexes.length && inlineBreaks.indexes[inlineBreaks.next] <= cursor)
                inlineBreaks.next += 1;
            const blockEnd = inlineBreaks.indexes[inlineBreaks.next] ?? raw.length;
            cursor = runs && runs.next < runs.indexes.length && runs.indexes[runs.next] < blockEnd
                ? runs.indexes[runs.next++] + length : end;
            continue;
        }
        if (raw.startsWith('<!--', cursor) || raw.startsWith('<![CDATA[', cursor)) {
            const cdata = raw.startsWith('<![CDATA[', cursor), close = cdata ? ']]>' : '-->';
            const end = raw.indexOf(close, cursor + (cdata ? 9 : 4));
            cursor = end < 0 ? raw.length : end + close.length;
            continue;
        }
        if (raw[cursor] !== '<') {
            cursor += 1;
            continue;
        }
        tagStart.lastIndex = cursor;
        const tag = tagStart.exec(raw);
        if (!tag) {
            cursor += 1;
            continue;
        }
        const name = tag[2].toLowerCase(), closing = !!tag[1];
        let end = tagStart.lastIndex, quote = '';
        for (; end < raw.length; end += 1) {
            const char = raw[end];
            if (quote) {
                if (char === quote)
                    quote = '';
            }
            else if (char === '"' || char === "'")
                quote = char;
            else if (char === '>' || char === '<')
                break;
        }
        if (end === raw.length && quote) {
            const next = /[<>]/g;
            next.lastIndex = tagStart.lastIndex;
            const fallback = next.exec(raw);
            if (fallback)
                end = fallback.index;
        }
        if (raw[end] === '<') {
            cursor += 1;
            continue;
        }
        if (end === raw.length) {
            if (pending.has(name) && !closing)
                pending.set(name, pending.get(name) + 1);
            break;
        }
        const selfClosing = raw[end - 1] === '/';
        cursor = end + 1;
        if (pending.has(name)) {
            const opened = pending.get(name) > 0;
            if (closing)
                pending.set(name, bodies.has(name) ? 0 : Math.max(0, pending.get(name) - 1));
            else if (!selfClosing)
                pending.set(name, pending.get(name) + 1);
            if (closing && opened && bodies.has(name) && [...bodies].every(tag => !pending.get(tag))) {
                completion.bodyEnd = cursor;
                closedBodyReason = pendingReason();
            }
        }
        if (!closing && !selfClosing && REASONING_TAGS.has(name)) {
            const close = new RegExp(`</${name}\\s*>`, 'gi');
            close.lastIndex = cursor;
            const match = close.exec(raw);
            if (!match)
                break;
            pending.set(name, 0);
            cursor = match.index + match[0].length;
            (completion.reasoningRanges ||= []).push([tag.index, cursor]);
            continue;
        }
        if (!closing && !selfClosing && opaque.has(name)) {
            const close = new RegExp(`</${name}\\s*>`, 'gi');
            close.lastIndex = cursor;
            const match = close.exec(raw);
            if (match)
                cursor = match.index + match[0].length;
        }
    }
    if (completion.bodyEnd && [...bodies].every(tag => !pending.get(tag)))
        return closedBodyReason;
    completion.bodyEnd = 0;
    return syntaxReason || pendingReason();
}
export function mainReplyAbnormalReason(message, { partial = false, bodyTags = [], processor = null, messageIndex = -1 } = {}) {
    if (!message)
        return '';
    const raw = String(message.mes || '');
    if (message.extra?.error || message.extra?.api_error)
        return __rmT("a4uHYEZKfiDiT1oi8nC");
    const completion = {};
    const structuralReason = partial ? '' : incompleteMainReplyMarkup(raw, bodyTags, completion);
    if (!partial && !completion.bodyEnd) {
        const terminalReason = abnormalTerminationReason(message, { processor, messageIndex });
        if (terminalReason)
            return terminalReason;
    }
    let visibleSource = '', offset = 0;
    for (const [start, end] of completion.reasoningRanges || []) {
        visibleSource += raw.slice(offset, start) + ' ';
        offset = end;
    }
    visibleSource += raw.slice(offset);
    const text = plainText(visibleSource);
    if (!partial && (text.length < 30 || (text.length < 80 && EMPTY_HINT.test(text))))
        return __rmT("mbCOwyem.A3Jq9sxYfMWHxExCih");
    const signals = [STATUS_CODE, ERROR_EN, ERROR_CN].filter(pattern => pattern.test(text)).length;
    const head = text.slice(0, 400);
    const headSignals = [STATUS_CODE, ERROR_EN, ERROR_CN].filter(pattern => pattern.test(head)).length;
    const relayHit = RELAY_ERROR_PHRASE.test(head)
        && RELAY_ERROR_COMPANION.test(head.replace(RELAY_ERROR_PHRASE, ''));
    if (jsonApiError(raw) || (API_ERROR_PHRASE.test(head) && (text.length < 600 || headSignals >= 2)) || (relayHit && (text.length < 600 || headSignals >= 2)))
        return __rmT("fH8.aiB9F1Gn3zv4aSdUNl.Ob4dVu87iZfJ3v8zQs7wjTdG.cph");
    if (ERROR_START.test(text.slice(0, 40)) || ERROR_START.test(raw.trim().slice(0, 40)) || htmlApiErrorHeader(raw)
        || (text.length < 1500 && signals >= 2) || (text.length < 150 && signals >= 1))
        return __rmT("fH8.aiB9F1Gn3zv4aSdUNl.Ob4dVu87iZfJ3v8zQs7wjTdG.cph");
    if (text.length < 400 && REFUSAL_START.test(text) && REFUSAL_WORDS.test(text))
        return __rmT("mbCOwyIXf9DbqmhzwzMWH8siRwf");
    return partial ? '' : structuralReason || (completion.bodyEnd ? '' : unfinishedProseReason(visibleSource));
}
export function notifySafetyValve(message, reason) {
    if (!message || typeof message !== 'object')
        return;
    const shown = NOTIFIED.get(message) || new Set();
    if (shown.has(reason))
        return;
    shown.add(reason);
    NOTIFIED.set(message, shown);
    try {
        globalThis.toastr?.info?.(`${reason}${__rmT("Ly6CO3lBIRaRr8oOrK0xqXn6anB0SAHecd7x0mgRewBZZr4MTfC3UW5X")}`, __rmT("oNm9IIg2WEqXliNO"));
    }
    catch { }
}
