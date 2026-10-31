import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.5.2";
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
            if (/^(?:content_filter|safety|recitation|blocked|prohibited_content|blocklist|spii|image_safety|refusal)$/.test(reason))
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
const PLAN_PREFIX = __rmT("MFj_UaZ1.W1AH.70VexH1ZgDZBrDGBtJILTFoPAZfTt6tFkahF1R7cffyUCjbF3m");
const STRONG_PLAN_LABELS = new Set([__rmT("AQ9z5FEDt9G"), __rmT("AQ9z5K_ft9G"), __rmT("AQ9z5m_ZUBh"), __rmT("AQ9z5AwFNV_"), __rmT("gHC28QDfUBh"), __rmT("gHC28RmzV2C"), __rmT("0J._k.mzV2C"), __rmT("vAd7a3mzV2C"), __rmT("_FvxFHDfUBh"), __rmT("iul.VqbxzAk"), __rmT("598fr1bxzAk"), __rmT("OctSM1bxzAk"), __rmT("Hp4ozWbxzAk"), __rmT("Hp4J61bxzAk"), __rmT("9H0Uc1bxzAk"), __rmT("s8ehzqbxzAk"), __rmT("HUhpYT"), __rmT("aCfCAu2xBPA"), __rmT("1HziF3_fx2B"), __rmT("1HziFb1MEBh"), __rmT("s8YiXukfeel"), __rmT("CQOe5Hkfeel")]);
const WEAK_PLAN_LABELS = [__rmT("hYOKZT"), __rmT("5eIKZT"), __rmT("3gp1uk"), __rmT("N8Ia7f"), __rmT("Y2CP.h"), __rmT("tVne2T")];
const PLAN_LABEL_WORD = `(${[...STRONG_PLAN_LABELS, ...WEAK_PLAN_LABELS].sort((a, b) => b.length - a.length).join('|')})`;
const PLAN_LABEL = new RegExp(`${__rmT("_9hRYtYOV7QAB0wGp6OFJQJr..tEJk")}${PLAN_PREFIX})?${PLAN_LABEL_WORD}${__rmT("C0XznQMVWH4pmWEYKKpX0XO8fRFqMZCDy2dxKeMNVFVwx2JndcBuVIcZNff1EosOB1q_xcApooY")}`);
const PLAN_LABEL_HEADING = new RegExp(`${__rmT("_9hRYtYOV7QAB0wGp6OFJQJr..tEJk")}${PLAN_PREFIX})?${PLAN_LABEL_WORD}${__rmT("rNeReEuC52U8WgkRSVwzqeBAqSrSA.awZQE")}`);
const PLAN_LABEL_EN = __rmR("3TecGHg52y_a7o6vhT8zW7u0gHOzhrfnL3hFGHQtuLzFqy75CyyAKK0pTHqQuFgVv1NMZP_QSu9_JETSpT59LFlklkWWJlE8mUIekUk1g2xtQlXKo1JuEJ5gWKfD4ReiK_aQ9j7eHewkc6yxQByao.p9Jczd2bCXUnktt_.F70hYp3hRe0vu45MqDm5rWMhldVB", "i");
const STRONG_PLAN_LABELS_EN = /^(?:self[- ]?check|writing plan|checklist|plot plan)$/i;
const PLAN_LINE_DECOR = __rmR("l_p3Bj8W5nlRxPdhZh8SchlmZE9rBbNbeufQZFaauXVGUttxyhxX13mZKwi9ElhmtE4uM2AL38vPhjmQyBV20jfuRkwK_bFYgNI.qOcs3eIgrTgLtIW4VSXEP9ZFh7y1N2pG4NSBi334ZBCr071s3_iPi1U0cjGN0LVh_ZPIgxkRr2yolKfidCqOZ.XoWBjmsEuJmr9eYkRVhofaFBy5N9iA_k9.bMd.7EFjgefOWyl.6_bN22AR6Pnf8tvWdnx0", "");
const PLAN_STEP = __rmR("9lp1iEqMwYfRg4aRXX8OiUHtyrMaM8AFz_9mHOHyQgpnSLhyZAoKX0AaKUQi4ABNHPaSeoU0kryg1tGT2U8j3l63JXlrAntPCDN5w7q8SJ63TwvnswnMl2XbJyTaXhptsfL.jkV4CuqGHDq.Ygs.DYx66EsC1GWhO5SCtMOS6bHLduy9wotiu3y7Bmpip5X7", "");
const PLAN_PHRASE = __rmR("twyaRI0mXVUEHs0agSHLRJULDa97CupCmwcT_f96bDUYvSUt70fO9UjLAU1V1Fv.o9lwK0BYfZJeA7V2luMGGXOhKn3ePyOiAtkzLhspQXcCGNaUbJwHqvwodxL3q3KuhgcAl.pKbBgqT8kVAz02uxm7VWM8gDiXWzlNcyJLri3_KbFiqbCkryx7fptiqNSuX61npwfJ4I.Qr5d6GvzhItqwX6vjAUQq7QEskSbb_GyPm6iV", "");
const PLAN_CHECK = __rmR("lB7UuAnj5DtSPYDBf0BWiBVvzz8aipLtkeGEWhY7vroNpExtenK.GcxuECLmZiOkBmdC2Pjp76gO7HYawpDjYcaHfKjKS9WngxJvgR54rbK8LWC3aPaZ8B1sTcNyz9qIsvpKUUOdzKxsoUmOHsVXWaQ1CZw4RisO.b.td.rGNpTVU7zil2KTIZVa1YepVEUdKjXYQ2e8", "");
const PLAN_BULLET = __rmR("a9eLLt5lU18Bzqn.DOfby9wKGZ7Vg_XlqrxjvcN9O18sOYtTr_aPsek1M.TY_Tfa3h6Fijyf3eXgMmSH18jl_n4A2fk6wMqr1KKFevY7qdSomP_U.z3dxXyu5UgL80dbE9Locy8S8kl13LbWBIQzoyzIl_oOkrfn", "");
const PLAN_WRAP_END = __rmR("xuJ9QE8Go4oy3TuhAcLgxBrXLFs", "");
const DIALOGUE_START = __rmR("_9hRYyCOenDRBd0BRQhzJyUF.RyuJk", "");
const STORY_SECTION_START = __rmR("RLM9OPUPFn98JhVeCAJOeEledQQZLUdC1AEeOE4O73xnrLja.5npzaMTMjDZrWNtBd3YmY310j3KKGUEFVODjiGn.8U37KdvUtqa.Batd8yVMdjSVq1AKApLkGQlD3W3YGImIswJ9CqT600UgGrQkKPDMs1OpIDcari4yn03ad54lf", "i");
function planLabelOf(line) {
    const text = line.replace(/\*\*|__/g, '').trim().replace(PLAN_LINE_DECOR, '');
    let match = text.match(PLAN_LABEL);
    if (match)
        return { word: match[2], strong: !!match[1] || STRONG_PLAN_LABELS.has(match[2]), rest: text.slice(match[0].length).trim() };
    match = text.match(PLAN_LABEL_HEADING);
    if (match)
        return { word: match[2], strong: !!match[1] || STRONG_PLAN_LABELS.has(match[2]), rest: '' };
    match = text.match(PLAN_LABEL_EN);
    if (match)
        return { word: match[1].toLowerCase(), strong: STRONG_PLAN_LABELS_EN.test(match[1]), rest: text.slice(match[0].length).trim() };
    return null;
}
function planningLeakReason(source) {
    const lines = String(source || '').replace(/<[^>]+>/g, ' ').split(/\r?\n/);
    let planChars = 0, storyChars = 0, steps = 0, phrases = 0, checks = 0;
    let mode = '', blockLines = 0, blockChars = 0;
    const strong = new Set(), weak = new Set();
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) {
            mode = '';
            continue;
        }
        const size = line.replace(/\s+/g, '').length;
        const label = planLabelOf(line);
        const step = PLAN_STEP.test(line);
        const bullet = PLAN_BULLET.test(line);
        const phrase = PLAN_PHRASE.test(line);
        const check = PLAN_CHECK.test(line);
        let plan = false;
        if (label) {
            (label.strong ? strong : weak).add(label.word);
            plan = true;
            mode = !label.rest ? (label.strong ? 'block' : 'item') : (PLAN_WRAP_END.test(label.rest) ? 'wrap' : 'item');
            blockLines = 0;
            blockChars = 0;
        }
        else if (step) {
            plan = true;
            mode = 'item';
        }
        else if (mode && (bullet || phrase || check)) {
            plan = true;
            if (mode !== 'block')
                mode = PLAN_WRAP_END.test(line) ? 'wrap' : 'item';
        }
        else if (mode === 'wrap' && !DIALOGUE_START.test(line)) {
            plan = true;
            mode = PLAN_WRAP_END.test(line) ? 'wrap' : 'item';
        }
        else if (mode === 'block' && blockLines < 6 && blockChars + size <= 400 && !DIALOGUE_START.test(line) && !STORY_SECTION_START.test(line)) {
            plan = true;
            blockLines += 1;
            blockChars += size;
        }
        else if (bullet && phrase) {
            plan = true;
            mode = 'item';
        }
        if (plan) {
            planChars += size;
            if (step)
                steps += 1;
            if (phrase)
                phrases += 1;
            if (check)
                checks += 1;
        }
        else {
            storyChars += size;
            mode = '';
        }
    }
    const total = planChars + storyChars;
    if (total < 40)
        return '';
    const share = planChars / total;
    const evidence = strong.size >= 2
        || (strong.size >= 1 && (weak.size >= 1 || steps >= 1 || phrases >= 2 || checks >= 2))
        || (weak.size >= 2 && (steps >= 1 || phrases >= 2))
        || (strong.size >= 1 && share >= 0.85 && storyChars <= 200);
    if (!evidence || share < 0.6 || storyChars > 600)
        return '';
    return __rmT("vADXVG212Ns0RFHC1zXhDbGtmlR6ntMs7fQbiqRahQMOEnHw6A9371GT2.A");
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
    const planReason = planningLeakReason(visibleSource);
    if (planReason)
        return planReason;
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
