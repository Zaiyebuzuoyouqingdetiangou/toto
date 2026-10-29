import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=1.99.18";
function text(value) { return typeof value === 'string' ? value : ''; }
const TITLE_NOISE = __rmR("mUDo2G3L_T7K7wAtGNUteb71Huc1WjUV7XX.XEYvCK4YRX0RYRpTEqfvmpDQcwoyE.q11yIDxg46EXB0VXU1Hx_n48umDtEdIUM7v9B4I7Nodj4l.E.2TjoTfW35lHJnP6A81Ayk6z_ogw3a1Ros30qIn4xydqJC0RlWS4Z.XEH7z2REukNBW4f7PM76E.0r_iMHrzvGU37na_cmtDijRTnYBMmHY.4yaXKRWSagfsSCYZ.CZ2tGzPljTDFkEPpC3ZhgnkcbcDU2YppIYOq8lIBqxyrn_2OxQM1noMv3KPVeC0vZG4H_qfYAL5OEkdj.N_tinQJqnQIHAn1qlkZ3JF7LY23hXg.M766WX_dLjS1jF3Pj", "");
const APPEARANCE_WORDS = __rmR("W2oaR2dcFKY5fybHbY0evGX2pnDD8JtiIjfYE3KSJ9W8aKXV3fJtY21N_ja1QhJMLsGApQ3MWiNg3RJGkAMUWYaKpWM.PFuzyVtxJRvXxyYUbo66c6H6K8LH7YaESHblUKzgUoY1i6oVY_v3JI0sXo5ymv8GZgcCDOVsDtBVeh7ZCU4nXjYByKC8Q49B5ERUDY8GN_kll5jR1Y4NrtHM994jnkQXCxYRmVedP.mE1tt_zUzV3U88ICwyEBU26c6tW6UBGvt3SPqGduX3Z06kQE21x9QHeEXx4G1IQ_Fk6cftweEMvdIINhqLXaO_rhODvakM96RbPUXeWzOBQ7F6_HFc9BMZBeTyBrMZqXbd8qVuW7cE1RwdSPLVS4KIzdlX3IiA_8qfEyiHbcgmfTetcdfagzcdEKG9pBdEKOYcdhjyCmxV.FrXFlkO8icT18uH5_Uw4srdoohq5vOidlXJl07_BrweJxdzO_PVBpdPzYq30vL3X5CZUQoqpain50.N0Mtil5l5Ay9_WWnrVHS1_0sCPanI9hrCWdZRn8sNWDXfYltLqz8rsAhR_V_Te0SVqZz9Jd_w7kjyPmvgtri5yM91NKqS4KNtya9oJyEj.wgnZeCfhyR0soAAq.KqDap9FH1wkoP6oOZRyXYIIp.feOEBjes0uYdTmtxVw4qtQEgdej7Po4ZGuUFhDl9gmmEN6Fv4qoRoesdxWgOQzDkz7k", "i");
const GENDER_IDENTITY = __rmT("X8wbWqY_24FgwxcCTToKuyGhGH3YnU9ME.ryfP6T85hP.GMRFkiQRGHr3tB39hQer44M6MllJd.DL5zf9uhtnvngdtaaHMlxj6dUoh6egWGahCXzsi3nzNP9ni9halCRvM_7heZz8v7lIzPHYPZDQbz_nGBZFEEIjaCfcDpGQSvS7xFFgNyEWIYToIwzyk4FuTVOLfVSlL.tq8nC97Nzwngaq1Prt8QtzNwQWqp3fhWYtbRbZBvznT9ubuvgT37s5E16XQJGSdgTQx5MIyBBLfFS9_0p7iiZMBZS7rMsdgu46dDx8V7eABs_wZ38zGpToY_epJxb3OHdOGfRnPtHYd1GgZEvj8vtzsPADAut.LHPkqvSUW8Eohkbye88YCC5Az3Kdh8gB35Hlnr5R3SLz5vb0Yy2v5XSTUTk3TrQRfY");
const SCAN_APPEARANCE_WORDS = new RegExp(`${APPEARANCE_WORDS.source}|${GENDER_IDENTITY}${__rmT("JbWKBfPTi4vh6iUrmGtLXqMoqyxvJClQlhMUGAdYX0PRnh")}`, 'i');
export function explicitGenderStatements(value, name = '') {
    const source = text(value);
    const named = text(name).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const zhSubject = `(?:${named ? `${named}|` : ''}${__rmT("tFvYfuXWB6OXaAEUu.KhulyGafe38HizTlNil5VyM0XJgfUy")}`;
    const enSubject = `(?:${named ? `${named}|` : ''}he|she|they|I|the character)`;
    const identity = `(?:${GENDER_IDENTITY}${__rmT("M5U2X5MI9NbjD9NqilF1CcHF58qaQd2YLqIgHQzDpnOXpSR7loJMsK8EmtiABO0oHdE")}${GENDER_IDENTITY}${__rmT("4AjF70hOiWhgGlCOrJVubBx__rdLhMFHVh4XZBiTS05I5kRivxn1xY2ed.2AocUBW4oTVKLVuaUrfz7xg8Z1Pu8mk2nKLmvWfY69u9dDxbCNBcqcJt.e2MVm")}${GENDER_IDENTITY}|${zhSubject}${__rmT("PC.LFftge2QDlIP2oxiTI0zIsW6h27RhiXPMp.fRofi2zFyWLC.Sk9PTUGMN83Hh7jJ6O2D2")}${GENDER_IDENTITY}|${enSubject}\\s+(?:is|am|identifies\\s+as)\\s+(?:an?\\s+)?${GENDER_IDENTITY}${named ? `|${named}${__rmT("THgeaoYBylSiS4zb.ej.xNXXeus")}${GENDER_IDENTITY}` : ''})`;
    const birth = `${__rmT("Y3wximToex_8z4WeptVxGlRLVPtHIeCu7PaYkk1J2cWSB_KB4zXiGVvq4EfxbwzugOtgGtJued5DOAe2MOklaq1HNAmrmqr7Dr2Iv2OhyznVa.sv")}${enSubject}\\s+was\\s+)?assigned\\s+(?:male|female)\\s+at\\s+birth)`;
    const boundary = __rmT("pi6IO_X9cHqt9Zr.aTRIglhIZLCsJbPEcr11cPHwzP_kEpjSbRe6Buvo2pWSz4qHiIE3m.nBPNKv2oQN");
    const end = __rmT("y0U_HD3bOePxxz9MpWLGgWeRy88GUc8B5MpEC5g.gWz8gnHnEBoMRFtHtKBpaeVEC4CMrCoRrKP8l9UMEyHux85XHtdE49Xf2RKbh.0XJfNcOk");
    const spans = [];
    for (const [kind, pattern] of [['identity', identity], ['birth', birth]]) {
        const re = new RegExp(`${boundary}(${pattern})${end}`, 'gi');
        for (const match of source.matchAll(re)) {
            const start = match.index + match[0].length - match[2].length;
            spans.push({ start, end: start + match[2].length, kind });
        }
    }
    return spans.sort((a, b) => a.start - b.start);
}
export function isExplicitGenderStatement(value, name = '') {
    return explicitGenderStatements(value, name).some(span => span.kind === 'identity');
}
const PERSON_LOOKS_WORDS = __rmR("nQ0HjYQHZLVXZp3e9kYfSuZNbd1YTJHz98p1m5DBIgU2ffnU9vuzxpDjpD4ukzB3t4_4mE.ByW1K0NgBbNnNUsDRnAx7MA_8Is1KriyfaS_jbD4O8qQp6cHwIPiLyJPdgRrut8xBksbADQ8VBmjmLNfU.AYTjjUV7ZyP3njWagtgAWJXEFIPYONcyZYHareD6CJxhdpkbqkxImoo2jQRVILKJ93mjmA3J9IYrQqkLMmcVLgwKBCG9uXHVj3JMmu9p_lX4XdRczSVQE6qW2vb_PZMZQjexeNpU2k7WhNjZTiwpD0Pew7kz8pXkqG0B7Hxib_iPUmT35o5LB28Ju5JQ9HGlrPJ3AX.Qo1OuAmy9ErP.1zmKrqjNFY8655Y_OXHRuwtvNkToewDMifjyYxpSa4Gd8y59eoHM4CFm9pX4nMcEnAxz5hA8CFNmA8ncUUMKVncCie4OWojQAeA8A1719tZS.A4BqDfKn4YvBwxBJYmMAGjfOy7G5hNTqjSEnv9UJfpE4UarHnso_ky0kft2NcxpoWwoaWTzi12q6NfAkwSTh_G2ecWiXHt9De7IaKceH4LU9rN9jbV_zGczxYSYxizTIf6hvmKlCBF_fVqcmPvGRuraLkE4MGoPlsodbb8NPHnsk1U2nYHWsFTjL18tIENi8uA_h_sDg4lOL7ar_Y2verjFPuUJnKMKlINkPek8dn81Y4WDvz6p5nlAKYUQxB1va6ioVKUgCiFzcJphYND.sBytGMzTxgumJHNBIpVkDLSuj1pogxShsMrMkUWA1pemAH5ClRjrYnnOVxgolLSrpFVA3UfAXq3TRMZnqPWfojOWDSVQFOju0Jae9PmiXrx9RVgugLWS0fss23qav9qnj62qHAB4DrXXSWSQcKyvfpoqV1uxGzeeKWkQe9O9Twz1IRWusEiiZlJQZtQ3m_aVL7bftg1tU6lou86_94mzckflAiDWlTpg6PQvBXoUSgw54FZ8l0R7uYVq0R2hShRDsSvg6eADvggJej4tHvvn.Cqy8HPH0QK9OPoGyjuxBMEmp5qcn3ooIgAxXsOk1.GbixdgyLag4blA6YA7mcclUg5oiiy5C_NR6.ZkF_tbD32r7D8nGXAZEH_aOX4uxIBPWWgOnlWX3qmv7KhQmez1afQRiDlGKhk3g98c27dMGp9I2v7SZAVG65E_IAWLfmttxod5O_8DS_Dj.nHcjy4lElHLnqOFJV3S1.ohlcVY1pmH2fy08T6xuc_sk", "");
const PERSON_LOOKS_WORDS_EN = /\b(?:appearance|hair(?:ed|style)?|eyes?|eyed|skin|complexion|height|tall|petite|muscular|slender|scars?|tattoos?|freckles?|wears?|wearing|dressed|outfit|coat|cloak|dress|shirt|jacket|suit|uniform|armou?r|glasses|mask|gloves?|boots?)\b/i;
function describesLooks(content, names = []) {
    return APPEARANCE_WORDS.test(content) || PERSON_LOOKS_WORDS.test(content) || PERSON_LOOKS_WORDS_EN.test(content)
        || ['', ...names].some(name => isExplicitGenderStatement(content, name));
}
function currentCharacter(ctx) {
    return ctx?.characters?.[ctx.characterId] || ctx?.character || null;
}
function abortError() {
    const error = new Error(__rmT("mSpCAwRbIL3QgQc0Xiwj3nbeVg6rrk"));
    error.name = 'AbortError';
    return error;
}
function staleError() {
    const error = new Error(__rmT("TLeQc95RofSfzY4mzgGxWEL_I40E9prqq3zAG8kOUi9V8vXxgz9SMi0QnINpLEuhCuWT25SKx.Gm4sH9"));
    error.code = 'CHARACTER_WORLD_BOOK_STALE';
    return error;
}
function sourceRow(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(__rmR("nSk", "g"), '\\u3010');
}
export async function readCharacterWorldBookContext(ctx, { signal, assertCurrent = () => { }, maxChars = 8000, disabledBooks = [], focusText = '', onlyMentioned = false, filterContent = null, } = {}) {
    if (!Number.isSafeInteger(maxChars) || maxChars < 0)
        throw new RangeError(__rmT("OqzGh5bESpWOTQ.tHthyB8wUbPREEO31zQWbgCmxcUX.bh"));
    const character = currentCharacter(ctx);
    const characterId = ctx?.characterId;
    const linkedName = text(character?.data?.extensions?.world).trim();
    const embedded = character?.data?.character_book ?? character?.character_book;
    const check = () => {
        if (signal?.aborted)
            throw abortError();
        assertCurrent();
        if (ctx?.characterId !== characterId || currentCharacter(ctx) !== character
            || text(character?.data?.extensions?.world).trim() !== linkedName
            || (character?.data?.character_book ?? character?.character_book) !== embedded)
            throw staleError();
        if (signal?.aborted)
            throw abortError();
    };
    check();
    const empty = (reason = '') => ({ text: '', bookNames: [], entryCount: 0, titles: [], truncated: false, reason });
    if (!character || (!linkedName && !embedded))
        return empty(__rmT("7xarO9FgT9Z36mEo_hMWSF4gr3p"));
    const name = linkedName || text(embedded?.name).trim() || `${text(character.name).trim() || __rmT("rHZnAGffKeh")}${__rmT("9Bhm4hDnk30NVGIF")}`;
    const disabled = new Set((Array.isArray(disabledBooks) ? disabledBooks : [])
        .map(value => text(value).trim()).filter(Boolean));
    if (disabled.has(name))
        return empty(`${__rmT("j8LZKn4jSXG")}${name}${__rmT("O0Y0U03BmNFnRe8_EcxMGu6hKAelKF.U")}`);
    let book = embedded;
    if (linkedName) {
        let getHeaders = ctx?.getRequestHeaders;
        if (typeof getHeaders !== 'function') {
            const host = await import('../../../../../script.js');
            check();
            getHeaders = host.getRequestHeaders;
        }
        if (typeof getHeaders !== 'function')
            throw new Error(__rmT("9wxK1t_uqgiQd9kNuhPH4KiYki2DtxPY40FaapvrgG8"));
        const suppliedHeaders = await getHeaders.call(ctx);
        check();
        if (!suppliedHeaders || typeof suppliedHeaders !== 'object')
            throw new Error(__rmT("L.4MDfu4C4dHrj7xWieX82kCuUZSTbMobMypMbKq"));
        const headers = new Headers(suppliedHeaders);
        headers.set('Content-Type', 'application/json');
        const response = await fetch('/api/worldinfo/get', {
            method: 'POST', credentials: 'same-origin', headers, signal,
            body: JSON.stringify({ name: linkedName }),
        });
        check();
        if (!response.ok)
            throw new Error(`${__rmT("mqbDqehkLXtTgbGj")}${name}${__rmT("lBS.a5RzopEJ6qTjugOxJgLr5RtCJk")}${response.status}${__rmT("jzk")}`);
        book = await response.json();
        check();
    }
    const entries = book?.entries;
    if (!entries || typeof entries !== 'object')
        throw new TypeError(`${__rmT("mqbDqehkLXtTgbGj")}${name}${__rmT("kGtDlQHpSswFf68AGdtVtMwi9hEgVEgBxVdspf")}`);
    const rows = [];
    let skippedNoLooks = 0;
    const focus = text(focusText);
    const anchors = new Set();
    const mentioned = entry => {
        mentioned.hits = [];
        if (!focus)
            return 0;
        const keys = [...(Array.isArray(entry.key) ? entry.key : []), ...(Array.isArray(entry.keys) ? entry.keys : [])]
            .map(value => text(value).trim()).filter(value => value && value.length <= 40 && !/^\/.*\/[a-z]*$/i.test(value));
        const title = (text(entry.comment) || text(entry.name) || text(entry.title)).trim();
        const hitKeys = keys.filter(key => focus.includes(key));
        hitKeys.forEach(key => anchors.add(key));
        mentioned.hits = [...hitKeys];
        let score = hitKeys.length;
        if (title && title.length <= 20 && focus.includes(title)) {
            score += 1;
            anchors.add(title);
            mentioned.hits.push(title);
        }
        else if (title && !score) {
            const pieces = title.split(__rmR("4RHBZFwD4svI0m2DeVhHRfYT6XhM2IzPGCC286Q3XhSqnmxX9eT5hHv_G6xKje.QmpQPNUCy4OR3hmbWxivVBNpK0OWqqQLPNDrWcuwq4iMogrVwZuT", ""))
                .map(piece => piece.trim()).filter(piece => piece.length >= 2 && piece.length <= 8 && !TITLE_NOISE.test(piece));
            const looksLikePerson = describesLooks(text(entry.content), [...keys, ...pieces]);
            const hit = piece => /^[A-Za-z0-9 ]+$/.test(piece)
                ? piece.length >= 3 && new RegExp(`(?:^|[^A-Za-z0-9])${piece.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^A-Za-z0-9])`, 'i').test(focus)
                : focus.includes(piece);
            const hits = looksLikePerson ? pieces.filter(hit) : [];
            hits.forEach(piece => anchors.add(piece));
            mentioned.hits.push(...hits);
            if (hits.length)
                score += 1;
        }
        return score;
    };
    for (const entry of Object.values(entries)) {
        check();
        if (!entry || typeof entry !== 'object' || Array.isArray(entry))
            throw new TypeError(`${__rmT("mqbDqehkLXtTgbGj")}${name}${__rmT("bsXRhYbad2tVV3rXND2pUT")}`);
        if (entry.enabled === false || entry.disable === true)
            continue;
        if (typeof entry.content !== 'string')
            throw new TypeError(`${__rmT("mqbDqehkLXtTgbGj")}${name}${__rmT("h6g1wSViFHC.Av_ix5laGt4ubNs")}`);
        if (!entry.content.trim())
            continue;
        const content = typeof filterContent === 'function' ? String(filterContent(entry.content) ?? '') : entry.content;
        if (!content.trim())
            continue;
        const title = text(entry.comment) || text(entry.name) || text(entry.title);
        const score = mentioned({ ...entry, content });
        if (onlyMentioned && score > 0 && !describesLooks(content, [title, ...(mentioned.hits || [])])) {
            skippedNoLooks += 1;
            continue;
        }
        rows.push({ row: sourceRow({ book: name, title, content }), title, content, score, hits: mentioned.hits || [], order: rows.length });
    }
    if (onlyMentioned)
        rows.splice(0, rows.length, ...rows.filter(item => item.score > 0));
    rows.sort((a, b) => (b.score > 0) - (a.score > 0) || (a.score > 0 && b.score > 0 ? b.score - a.score : 0) || a.order - b.order);
    if (onlyMentioned && rows.reduce((sum, item) => sum + item.row.length + 1, 0) > maxChars) {
        const names = [...anchors].filter(value => value.length >= 2);
        const safe = (content, at) => (at > 0 && at < content.length && /[\uDC00-\uDFFF]/.test(content[at]) ? at - 1 : at);
        for (const item of rows) {
            const own = new Set(item.hits.filter(value => value.length >= 2));
            const spans = [];
            for (const anchor of [...own, ...names.filter(value => !own.has(value))]) {
                let from = 0;
                for (let found = 0; found < (own.has(anchor) ? 6 : 1); found += 1) {
                    const at = item.content.indexOf(anchor, from);
                    if (at < 0)
                        break;
                    from = at + anchor.length;
                    const start = safe(item.content, Math.max(0, at - 10));
                    const end = safe(item.content, Math.min(item.content.length, at + 420));
                    const look = item.content.slice(at, end).search(SCAN_APPEARANCE_WORDS);
                    if (look >= 0)
                        spans.push({ start, end, rank: (own.has(anchor) ? 0 : 10000) + look });
                }
            }
            if ([...own].some(value => String(item.title || '').includes(value))) {
                const words = new RegExp(SCAN_APPEARANCE_WORDS.source, `${SCAN_APPEARANCE_WORDS.flags}g`);
                let match, count = 0;
                while ((match = words.exec(item.content)) && count < 6) {
                    const at = match.index;
                    if (spans.some(span => at >= span.start && at < span.end))
                        continue;
                    count += 1;
                    spans.push({ start: safe(item.content, Math.max(0, at - 60)), end: safe(item.content, Math.min(item.content.length, at + 240)), rank: 5000 + count });
                }
            }
            if (!spans.length)
                continue;
            spans.sort((a, b) => a.rank - b.rank);
            const merged = [];
            for (const span of spans) {
                const overlap = merged.find(other => span.start < other.end && span.end > other.start);
                if (overlap) {
                    overlap.start = Math.min(overlap.start, span.start);
                    overlap.end = Math.max(overlap.end, span.end);
                }
                else
                    merged.push({ ...span });
            }
            const excerpt = merged.map(({ start, end }) => item.content.slice(start, end)).join('\n…\n');
            if (excerpt.length < item.content.length) {
                item.content = excerpt;
                item.row = sourceRow({ book: name, title: item.title, content: excerpt });
            }
            item.appearance = true;
        }
        rows.sort((a, b) => (b.appearance === true) - (a.appearance === true));
    }
    if (onlyMentioned && rows.length >= 1 && rows.reduce((sum, item) => sum + item.row.length + 1, 0) > maxChars) {
        const keep = Math.max(1, Math.min(rows.length, Math.floor(maxChars / 220)));
        rows.splice(keep);
        const share = Math.floor(maxChars / rows.length) - 1;
        for (const item of rows) {
            if (item.row.length <= share)
                continue;
            let cut = Math.min(item.content.length, share);
            let row = '';
            while (cut > 0) {
                let content = item.content.slice(0, cut);
                if (/[\uD800-\uDBFF]$/.test(content))
                    content = content.slice(0, -1);
                row = sourceRow({ book: name, title: item.title, content: `${content}${__rmT("CeeIoOUfLPuxtf")}` });
                if (row.length <= share)
                    break;
                cut -= Math.max(1, Math.ceil((row.length - share) / 2));
            }
            if (cut > 0)
                item.row = row;
        }
        rows.splice(0, rows.length, ...rows.filter(item => item.row.length <= share));
    }
    const titles = rows.map(item => item.title);
    rows.splice(0, rows.length, ...rows.map(item => item.row));
    check();
    const fullText = rows.join('\n');
    if (fullText.length <= maxChars)
        return { text: fullText, bookNames: [name], entryCount: rows.length, titles: titles.filter(Boolean), truncated: false, ...(skippedNoLooks ? { skippedNoLooks } : {}) };
    const note = maxChars >= 15 ? __rmT("VNtSbcd7szMWNRQIGZcuB.NRjQtc2BaMr0vwpf") : __rmT("HAL6a4cdC9uHsh");
    const marker = note.slice(0, maxChars);
    const contentBudget = Math.max(0, maxChars - marker.length);
    let prefix = fullText.slice(0, contentBudget);
    if (/[\uD800-\uDBFF]$/.test(prefix))
        prefix = prefix.slice(0, -1);
    let used = 0;
    let entryCount = 0;
    for (const row of rows) {
        if (used >= prefix.length)
            break;
        entryCount += 1;
        used += row.length + 1;
    }
    return { text: prefix + marker, bookNames: [name], entryCount, titles: titles.slice(0, entryCount).filter(Boolean), truncated: true, ...(skippedNoLooks ? { skippedNoLooks } : {}) };
}
const SENTENCE_SPLIT = __rmR("3YouzvW2b9JKDgCS7idrEt2MjKZpsubw.kPLdU49E.hghatq37owuPdM6DAmrYcnul7ODMTI2J_WQwGK0_CKj4XpiHppeEyWA_YA2sU0NjGXxzOM_fYBhhEQrFgb9DPrnlN0n71qjtlW.6LOUN9YqGKOHftg8xhKdlXHNIkdgKeZHz5YJSP3uLU07374A14YgkXUGcMFTCOSB0fZx8xntJkvkfdqIL0myvsGHfElYTU.wb9D.vuoNUq2l1d.Vg5_C0658xMCCg9aPAeAIj7PKT", "");
function englishSentenceStart(content, at) {
    const re = new RegExp(SENTENCE_SPLIT.source.replace(/^\(\?<=\[[^\]]*\]\)\|/, ''), 'g');
    const head = content.slice(0, at);
    let start = 0, match;
    while ((match = re.exec(head))) {
        start = match.index + match[0].length;
        if (!match[0].length)
            re.lastIndex += 1;
    }
    return start;
}
const EN_PRONOUN_START = /^["'“‘(]?(?:he|she|they|his|her|hers|their|him|them)\b/i;
const EN_NOT_NAME = /^(?:The|A|An|This|That|These|Those|There|Here|It|Its|When|While|After|Before|As|At|In|On|Of|With|And|But|Or|So|If|Then|Her|His|Their|She|He|They|Dr|Mr|Mrs|Ms|Sir|Lady|Lord|Long|Short|Silver|Black|White|Red|Blue|Green|Pale|Dark|Light|Golden|Brown|Pink|Purple|Freckles|Skin|Hair|Eyes)$/;
const EN_RELATION = /\b(?:her|his|their)\s+(?:brother|sister|friend|neighbou?r|father|mother|dad|mom|husband|wife|lover|rival|cousin|son|daughter|master|servant|teacher|student|boss|partner|uncle|aunt)\b/i;
function englishSentencesAboutOthers(content, who) {
    const result = new Set();
    const text = String(content || '');
    if (!/[A-Za-z]{3}/.test(text))
        return result;
    const target = String(who || '').trim().toLowerCase();
    let alias = target && text.toLowerCase().includes(target) ? '' : null;
    let subject = 'self';
    const relatives = new Set();
    const genderOf = value => (/^["'“‘(]?(?:she|her|hers)\b/i.test(value) ? 'f' : /^["'“‘(]?(?:he|his|him)\b/i.test(value) ? 'm' : '');
    let selfGender = '', otherGender = '';
    for (const raw of text.split(SENTENCE_SPLIT)) {
        const sentence = raw.trim();
        if (!sentence)
            continue;
        const first = sentence.match(/^["'“‘(]?([A-Z][a-z]+)\b/)?.[1] || '';
        const named = !!first && !EN_NOT_NAME.test(first)
            && new RegExp(`^["'“‘(]?${first}(?:'s)?\\s+(?:is|was|has|had|wears|wore|looks|stands|sits|seems|appears)\\b`).test(sentence);
        if (named && EN_RELATION.test(sentence))
            relatives.add(first);
        if (named && alias === null && !relatives.has(first))
            alias = first;
        const relation = sentence.match(/\b(her|his)\s+(?:brother|sister|friend|neighbou?r|father|mother|dad|mom|husband|wife|lover|rival|cousin|son|daughter|master|servant|teacher|student|boss|partner|uncle|aunt)\b/i);
        if (named && relation && !selfGender)
            selfGender = /^her$/i.test(relation[1]) ? 'f' : 'm';
        const pronoun = genderOf(sentence);
        if ((target && sentence.toLowerCase().includes(target)) || (alias && first === alias))
            subject = 'self';
        else if (named) {
            subject = 'other';
            otherGender = /\b(?:sister|mother|mom|wife|daughter|aunt|girlfriend|niece|grandmother|queen|princess|lady)\b/i.test(sentence) ? 'f'
                : /\b(?:brother|father|dad|husband|son|uncle|boyfriend|nephew|grandfather|king|prince|lord)\b/i.test(sentence) ? 'm' : '';
        }
        else if (!EN_PRONOUN_START.test(sentence))
            subject = 'self';
        else if (subject === 'other' && pronoun) {
            if (selfGender && pronoun === selfGender && otherGender && otherGender !== pronoun)
                subject = 'self';
            else if (!otherGender)
                otherGender = pronoun;
        }
        if (subject === 'self' && pronoun && !selfGender)
            selfGender = pronoun;
        if (subject === 'other')
            result.add(sentence);
    }
    return result;
}
function joinSentences(list) {
    return list.reduce((out, part) => {
        if (out && !__rmR("owLG05JVsIvqMy6fBgZ4moaoGa4XuFQijkJFM6NH67i8Tdp.X2_", "").test(out))
            return `${out}\n${part}`;
        return out && /[A-Za-z0-9.,!?"'”’)]$/.test(out) && /^["'“‘(]?[A-Za-z]/.test(part) ? `${out} ${part}` : out + part;
    }, '');
}
const APPEARANCE_LABEL = __rmR("JRKeNZrREL3jH0t5lhIeLlMpATo5AlNEzeIcmFNgyW9MyiYswk45yDw9hdPVJfNJfTbEO0fU5cFzPHXoSmIkL_OXCI4l6n26hP8z1Q6j_5Yh_7L.nsyoI8wkfFYaa2xOQs2K4b.WqA.HwrReqlbRof8kkB5SbYI.CtlRd3R8UMMKiVNILvPJPUXi8f3KfSrhOU9hvDjiWRWrW5uz8yYwRLkqZ5Vlq2ozDxsGsOhx7aVxDNjtfNRjh5UueuMNQFPAKoaqo_HBc5MPFVIzVTxI7y0JuSZskzeMV4IYkmKJ8nlboifpur6NFfdg8MjjRsfDIKI.IGORc8xryadVG4_40eC2bV3mjcFwLQWwNMswTfpCyjffxNyphuJ8nsNJjeX2a2SKxIv3rhKg1cnLcegDCJkZKV9D4nRrE5r5FI2kz8MF9BmNgw4Q7rFnnHUDWfrrkkOxQh", "");
function chineseSubjectBoundaries(content, who, knownOthers) {
    const names = new Set(knownOthers);
    for (const match of content.matchAll(__rmR("B8_96QohivOlHGiVxpK25EzIrl7c5DV.80DxLMJIPsMDu4wuuCgqiw9ZSXruUfPEGT35WxbxwvsQR9FRWaTwya7_Vp9KZfhVuiUVL3mBx3efCPlW1uWslR1IqYLq6ZADpHXX0xQr6xmYiv1.tEVJdevCe1Gt7gFyMzm0aEDjrDHAlY632mG", "g"))) {
        const name = (match[1] || match[2]).trim();
        if (name !== who && !APPEARANCE_LABEL.test(name) && !TITLE_NOISE.test(name))
            names.add(name);
    }
    const foreign = new Set();
    let other = false;
    for (const raw of content.split(SENTENCE_SPLIT)) {
        const part = raw.trim();
        if (!part)
            continue;
        const start = part.replace(__rmR("T.Ypa5aSHWkaldGbrB8xE0Dx", ""), '');
        if (start.startsWith(who) && !__rmR("MjYZOuRv3DAUTh", "").test(start.slice(who.length)))
            other = false;
        else if ([...names].some(name => start.startsWith(name)))
            other = true;
        if (other)
            foreign.add(part);
    }
    return { names: [...names], foreign };
}
export function appearanceFromCast(castText, name, otherNames = []) {
    const who = text(name).trim();
    if (!who || who.length < 2)
        return '';
    const others = (Array.isArray(otherNames) ? otherNames : []).map(value => text(value).trim()).filter(value => value && value !== who && !who.includes(value));
    const rows = [];
    for (const line of text(castText).split('\n')) {
        try {
            const row = JSON.parse(line);
            if (row && typeof row.content === 'string')
                rows.push(row);
        }
        catch { }
    }
    const titleIsWho = row => text(row.title).trim() === who || text(row.title).split(__rmR("4RHBZFwD4svI0m2DeVhHRfYT6XhM2IzPGCC286Q3XhSqnmxX9eT5hHv_G6xKje.QmpQPNUCy4OR3hmbWxivVBNpK0OWqqQLPNDrWcuwq4iMogrVwZuT", "")).some(piece => piece.trim() === who);
    let foreign = new Set(), rowOthers = others;
    const setSubjects = content => {
        const chinese = chineseSubjectBoundaries(content, who, others);
        rowOthers = chinese.names;
        foreign = new Set([...englishSentencesAboutOthers(content, who), ...chinese.foreign]);
    };
    const pick = window => {
        const sentences = window.split(SENTENCE_SPLIT).map(part => part.trim()).filter(Boolean);
        return joinSentences(sentences.filter(part => (APPEARANCE_WORDS.test(part) || explicitGenderStatements(part, who).length) && !foreign.has(part))).slice(0, 600);
    };
    const cutAtOthers = window => {
        let end = window.length;
        for (const other of rowOthers) {
            const at = window.indexOf(other);
            if (at >= 0)
                end = Math.min(end, at);
        }
        return window.slice(0, end);
    };
    const ownRows = rows.filter(titleIsWho);
    const collected = [];
    const collect = found => {
        for (const sentence of found.split(SENTENCE_SPLIT).map(part => part.trim()).filter(Boolean)) {
            if (!collected.includes(sentence) && collected.join('').length + sentence.length <= 600)
                collected.push(sentence);
        }
    };
    for (const row of ownRows) {
        collected.splice(0);
        const content = row.content;
        setSubjects(content);
        const words = new RegExp(SCAN_APPEARANCE_WORDS.source, `${SCAN_APPEARANCE_WORDS.flags}g`);
        let match, tries = 0, lastStart = -1;
        while ((match = words.exec(content)) && tries < 8) {
            const at = match.index;
            const start = Math.max(0, content.lastIndexOf('\n', at), Math.max(content.lastIndexOf(__rmT("jzk"), at), content.lastIndexOf(__rmT("7os"), at)) + 1, englishSentenceStart(content, at));
            if (start === lastStart)
                continue;
            lastStart = start;
            tries += 1;
            const found = pick(cutAtOthers(content.slice(start, start + 360)));
            if (found)
                collect(found);
        }
        if (collected.length)
            return joinSentences(collected);
    }
    const boundary = __rmR("pnqOr7hlXCx54eJBgdIqQZDnbjGtUgIFM.FOuqaIsVGG5ZqzjMDf8y3Hu9nzhBaYySD2YCiGGbtUfDCRf4xMV5zPJ71E4Xfb5x_bsTxIJ5MxUpnR8cbSIpbc9IJqOZVXlDA", "");
    for (const row of rows) {
        if (ownRows.includes(row))
            continue;
        const content = row.content;
        setSubjects(content);
        let tries = 0;
        for (let at = content.indexOf(who); at >= 0 && tries < 6; at = content.indexOf(who, at + who.length)) {
            if (!boundary.test(content.slice(at + who.length, at + who.length + 1)))
                continue;
            if (at > 0 && /[\u3400-\u9fff]/.test(content[at - 1]) && /[\u3400-\u9fff]/.test(who[0]) && !__rmR("54WmPTmtLbfw58rxMMONwNueKKUnbuXaatw6KaEIX68bjZAyT2gNwzKcqFTNgroHTLE", "").test(content[at - 1]))
                continue;
            tries += 1;
            let window = content.slice(at, at + 360);
            window = window.slice(0, 1) + window.slice(1).split(__rmR("fMy_nK_BsNv2QEDA9Ltjt8ti.hEXV.nBWedipf", ""))[0];
            const found = pick(cutAtOthers(window));
            if (found)
                return found;
        }
    }
    return '';
}
