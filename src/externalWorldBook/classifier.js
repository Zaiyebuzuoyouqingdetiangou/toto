import { rmT as __rmT } from "../textTable.js?rmv=2.6.3";
import { entryIdentity } from './selectionState.js?rmv=2.6.3';
import { buildExternalEntrySummary } from './summary.js?rmv=2.6.3';
export const EXTERNAL_WORLD_BOOK_CLASSIFICATION = Object.freeze({
    THEME: 'theme',
    FORMAT: 'format',
    TEXT: 'text',
    MIXED: 'mixed',
    AUXILIARY: 'auxiliary',
    IGNORE: 'ignore',
    PENDING: 'pending',
});
export const EXTERNAL_WORLD_BOOK_CONFIDENCE = Object.freeze({
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
});
const FORMAT_SIGNALS = Object.freeze([
    __rmT("7kSHOv8A"),
    __rmT("KUJb2k"),
    __rmT("oVn02T"),
    __rmT("3Fo8Yh"),
    __rmT("CGmZuf"),
    __rmT("lgzruT"),
    __rmT("LGoYBk"),
    __rmT("kAwqaoBZAGY"),
    __rmT("IUW.Bh"),
    __rmT("MJNyiT"),
    __rmT("GN8U3k"),
    __rmT("0NkU3k"),
    __rmT("eCUPEk"),
    __rmT("92xAEk"),
    __rmT("I6wS.h"),
    __rmT("X3G90vhC"),
    __rmT("8CCv3f"),
    __rmT("PuBv3f"),
    __rmT("JH_U3k"),
    __rmT("2yzXLypZ"),
    __rmT("Agz7Nk"),
    __rmT("qPPQ2T"),
    __rmT("rDrn7k"),
    __rmT("Y6s_nf"),
    __rmT("gD9BNk"),
    __rmT("GtPWjITG"),
    __rmT("3gbgLf"),
    'rpg', 'gal game', 'galgame',
    __rmT("R80YLf"),
    __rmT("NJpI8i5jdJs"),
    __rmT("s2iUNk"),
    'gacha',
    __rmT("Zt15E1Dn"),
    __rmT("VFbF84fyXgA"),
    __rmT("M2iy2T"),
    __rmT("g6rlYT"),
    __rmT(".JKDNh"),
    __rmT("JMS4Zf"),
    __rmT("syYnW5GQ"),
    __rmT("QJz9Lk"),
    __rmT("oPv9Lk"),
    __rmT("f8LEfh"),
    __rmT("iJKHjT"),
    __rmT("82cdBk"),
    __rmT("oNTANk"),
    __rmT("GCvffk"),
    __rmT("SVQXEk"),
    __rmT("tBBkEk"),
    __rmT("JH_kEk"),
    __rmT("CApkEk"),
    __rmT("bD8M2f"),
    __rmT("3MvB3k"),
    __rmT("UJbmnh"),
    __rmT("u62mnh"),
    __rmT("M2.s7f"),
    __rmT("mgTmPh"),
    __rmT("M2E8Bk"),
    __rmT("1NNxGT"),
    __rmT("1NB3ff"),
    __rmT("Ygqd7h"),
    __rmT("ATM2GOwA"),
    __rmT("6UJ7Nk"),
    'wiki',
    __rmT("7H_9zx1PlPp"),
    __rmT("dcJDYk"),
    __rmT("wFBONk"),
    __rmT(".w9V924T"),
    __rmT("l3xdEg4T"),
    __rmT("pmfnWv8A"),
    __rmT("zUYWnT"),
    __rmT("FgH4jh"),
    'twitter', 'youtube', 'tiktok', 'bilibili',
    __rmT("s3KfPOEc"),
    __rmT("CV97Nk"),
    __rmT("CA1c.T"),
    __rmT("bw0d9ABy"),
    __rmT("BO.c.ZGh"),
    __rmT("zyBr7_DV"),
    __rmT("WoiMiRCh"),
    __rmT("UFA.81b5SDY"),
    __rmT("biptYrTn"),
    __rmT("EGemAPtsYDY"),
    __rmT("VcZGGf"),
    __rmT("VcZS.k"),
    __rmT("wA6sef"),
]);
const THEME_SIGNALS = Object.freeze([
    __rmT("OBRLBh"),
    __rmT("hVCbNk"),
    __rmT("u68Ojh"),
    __rmT("12vJ.h"),
    __rmT("bBkzuk"),
    __rmT("XYkBq60LwPs"),
    __rmT("mVDzuk"),
    __rmT("W.46.Asf"),
    __rmT("AuNtLT"),
    __rmT("a6XtLT"),
    __rmT("IGqwNf"),
    __rmT("hY02nh"),
    __rmT("DUBN2f"),
    __rmT("wM89Vb5rJJC"),
    __rmT("lMRy.h"),
    __rmT("Vh8p.f_I"),
    __rmT("MPV1BT"),
    __rmT("1gC0LT"),
    __rmT("mPWh3k"),
    __rmT("0Dqh3k"),
    __rmT("plvUPA_E"),
    __rmT("yHGUmzbJw2A"),
    __rmT("ZGitLf"),
    __rmT("fB4l2T"),
    __rmT("UJkzBk"),
    __rmT("8gUenh"),
    __rmT("4Pj2nh"),
    __rmT("YMv_Bk"),
    __rmT("jgi6Ph"),
    __rmT("mH_ILT"),
    __rmT("O8GILT"),
    __rmT("bNEILT"),
    __rmT("8CY05EnjF2C"),
    __rmT("tueN1ckQMcY"),
    __rmT("yHLZzp4jvMs"),
    __rmT("kBwZ3f"),
    __rmT("uPMOjk"),
    __rmT("ScumNk"),
    __rmT("rAUMLh"),
    __rmT("_60bjk"),
    __rmT("fUjpEf"),
    __rmT("PDBoEk"),
    __rmT("Gcgo3k"),
    __rmT("J6Exuk"),
    __rmT("K6jlLh"),
    __rmT("JDDGZf"),
    __rmT("bBztLT"),
    __rmT("KM4wNf"),
    __rmT("4DjcAHEDHYG"),
    __rmT("s8JF2T"),
    __rmT("l9UMPf"),
    __rmT("uPWl.T"),
    __rmT(".Vw_qW2L_cp"),
    __rmT("SHnBKQwKl9f"),
    __rmT("8DWCnk"),
    __rmT("_uYBz60LwPs"),
]);
const AUXILIARY_SIGNALS = Object.freeze([
    __rmT("YcwaKuDfWGh"),
    __rmT("Qu9wAuDfWGh"),
    __rmT("yQPppQDfWGh"),
    __rmT("EFvoXQDfWGh"),
    __rmT("xolaLLfH"),
    __rmT("aCfCAuDfWGh"),
    __rmT("3Nt7qK_fx2B"),
    __rmT("GNb783qjmCD"),
    __rmT("RGnaKNDZS2T"),
    __rmT("IQdTmMDZS2T"),
    __rmT("yQHc59DZS2T"),
    __rmT("gpy2AuDfWGh"),
    __rmT("YcwaKNDZS2T"),
    __rmT("yQPaKNDZS2T"),
    __rmT("5p7qA9DZS2T"),
    __rmT("Du9oqJDZS2T"),
    __rmT("3Nt7q5l7TGE"),
    __rmT("yQPZcQDfWGh"),
]);
const RISK_SIGNALS = Object.freeze([
    __rmT(".QZ6K7qjvGh"),
    __rmT(".QZ6KngvvGh"),
    __rmT("5ADDK9qULJf"),
    __rmT("5ADDKPtj0uf"),
    'system prompt', '<toto', 'sourcehash', 'mesid', 'owner key',
    'javascript:', '<script', 'onclick=', 'onload=', 'fetch', 'xmlhttprequest', '/api/', 'reasoning_content',
    __rmT("jmd6xuB7JIQIBhmGLgOlJQirX3yaJk"),
    __rmT("P3VXQuB7JIQIBhmGLgOlJQirX3yaJk"),
    __rmT("yHG5Vu2DCBC"),
    __rmT("GAHaAHEDYUp"),
    __rmT("OVPnaNpZx2B"),
    'slash command',
    __rmT("g9dZzpTB96A"),
    __rmT(".tUOs1Bpnsl7Th"),
    __rmT("WgYu4Kmz68E"),
]);
function normalize(value) {
    return String(value ?? '').normalize?.('NFKC')?.toLocaleLowerCase?.('zh-Hans-CN')
        ?? String(value ?? '').toLowerCase();
}
const NORMALIZED_FORMAT_SIGNALS = Object.freeze(FORMAT_SIGNALS.map(signal => Object.freeze([signal, normalize(signal)])));
const NORMALIZED_THEME_SIGNALS = Object.freeze(THEME_SIGNALS.map(signal => Object.freeze([signal, normalize(signal)])));
const NORMALIZED_AUXILIARY_SIGNALS = Object.freeze(AUXILIARY_SIGNALS.map(signal => Object.freeze([signal, normalize(signal)])));
const NORMALIZED_RISK_SIGNALS = Object.freeze(RISK_SIGNALS.map(signal => Object.freeze([signal, normalize(signal)])));
function hitsNormalized(source, signalPairs) {
    const matched = [];
    for (const [label, normalizedSignal] of signalPairs) {
        if (source.includes(normalizedSignal))
            matched.push(label);
    }
    return matched;
}
function scoreFieldNormalized(source, signalPairs, weight) {
    const matched = hitsNormalized(source, signalPairs);
    return { score: matched.length * weight, matched };
}
function mergeReason(bucket, label, matched) {
    if (!matched.length)
        return;
    const unique = [...new Set(matched)].slice(0, 4);
    bucket.push(`${label}${__rmT("7ys")}${unique.join(' / ')}`);
}
function scoreSignals(sources, signalPairs) {
    const title = scoreFieldNormalized(sources.title, signalPairs, 5);
    const keywords = scoreFieldNormalized(sources.keywords, signalPairs, 3);
    const content = scoreFieldNormalized(sources.content, signalPairs, 1);
    return {
        score: title.score + keywords.score + content.score,
        title: title.matched,
        keywords: keywords.matched,
        content: content.matched,
    };
}
function reasonFor(label, scored) {
    const reasons = [];
    mergeReason(reasons, `${label}${__rmT("fBAAfh")}`, scored.title);
    mergeReason(reasons, `${label}${__rmT("03g_724T")}`, scored.keywords);
    mergeReason(reasons, `${label}${__rmT("g6Q4jh")}`, scored.content);
    return reasons;
}
function confidenceFor(score, runnerUp = 0) {
    if (score >= 8 && score - runnerUp >= 3)
        return EXTERNAL_WORLD_BOOK_CONFIDENCE.HIGH;
    if (score >= 5)
        return EXTERNAL_WORLD_BOOK_CONFIDENCE.MEDIUM;
    return EXTERNAL_WORLD_BOOK_CONFIDENCE.LOW;
}
function explicitCategories(sources) {
    const labels = `${sources.title}\n${sources.keywords}`;
    const kinds = [];
    for (const [kind, label] of [['format', __rmT("vBWw9pdSMWk_kh7TryVVESBx")], ['theme', __rmT("HFw1fAdSMWk_kSeXRsRVESBx")], ['text', __rmT("zbLewxRMQaFK22tfA4jkm2TgcazNu5_geaLlvFzQmOiowW_.8P_")], ['auxiliary', __rmT("4G9SCAEQCwYcGJbUNp0Jlt1OWY2EUzDP")]]) {
        const labelled = new RegExp(`${__rmT("T3gjf35Xf2hiwJHP7.Kq4aWLXfj0NY1AdCZy54mpV6NUPTUy")}${label}${__rmT("1o80wYZU90uT_i.zbT2KLNpzAN.0wpqLBf71JHLLSk4FYSn7P00b5RqN1xPNLJbA_ITSWpZ44UBuFHDB4PM86WnspAuWMcaNqckbXijdjJB7FqDW1dzpvswtIzc4zSvsuZS1BLDSLZUZjYsQ")}`, 'm');
        const declaration = new RegExp(`${__rmT("I2RXYOKxESNc4CzWs72Zc9eHLHbBeR0fSKQPSIQvIejZje2pGBULZO2GA9_90ZSao6cs7h")}${label}${__rmT("tN3FYi3XYROOcfMnlDS4f_5O3uOw.Qr1spG3.zjbI28")}`, 'm');
        if (labelled.test(labels) || declaration.test(`${labels}\n${sources.content}`))
            kinds.push(kind);
    }
    return kinds;
}
export function classifyExternalWorldBookEntry(entry) {
    const sources = {
        title: normalize(`${entry?.title || ''}\n${entry?.comment || ''}`),
        keywords: normalize([...(entry?.primaryKeywords || []), ...(entry?.secondaryKeywords || [])].join('\n')),
        content: normalize(String(entry?.content || '').slice(0, 1800)),
    };
    const format = scoreSignals(sources, NORMALIZED_FORMAT_SIGNALS);
    const theme = scoreSignals(sources, NORMALIZED_THEME_SIGNALS);
    const auxiliary = scoreSignals(sources, NORMALIZED_AUXILIARY_SIGNALS);
    const risk = scoreSignals(sources, NORMALIZED_RISK_SIGNALS);
    const explicit = explicitCategories(sources);
    const reasons = [];
    let suggestion = EXTERNAL_WORLD_BOOK_CLASSIFICATION.PENDING;
    let confidence = EXTERNAL_WORLD_BOOK_CONFIDENCE.LOW;
    if (risk.score >= 3) {
        suggestion = EXTERNAL_WORLD_BOOK_CLASSIFICATION.IGNORE;
        confidence = EXTERNAL_WORLD_BOOK_CONFIDENCE.HIGH;
        reasons.push(...reasonFor(__rmT("2XX11jMZ_Q4LZf"), risk));
    }
    else if (explicit.length === 1) {
        suggestion = explicit[0];
        confidence = EXTERNAL_WORLD_BOOK_CONFIDENCE.HIGH;
        reasons.push(`${__rmT("NfEsulL1S7YnF.MTVpA")}${suggestion === 'format' ? __rmT("1Q3is5nrSDY") : suggestion === 'theme' ? __rmT("_GerrIjDHM_") : suggestion === 'text' ? __rmT("H2CeX.1s96A") : __rmT("5p7qAO1PlPp")}`);
    }
    else if (explicit.length > 1) {
        suggestion = EXTERNAL_WORLD_BOOK_CLASSIFICATION.MIXED;
        reasons.push(__rmT("EBWkVwvWRbubswAm1Dcm_qMyVBMAUPMkiKf6YYy0sl0fa0no"));
    }
    else if (format.score >= 5 && theme.score >= 5) {
        suggestion = EXTERNAL_WORLD_BOOK_CLASSIFICATION.MIXED;
        confidence = (format.score >= 8 && theme.score >= 8)
            ? EXTERNAL_WORLD_BOOK_CONFIDENCE.HIGH
            : EXTERNAL_WORLD_BOOK_CONFIDENCE.MEDIUM;
        reasons.push(...reasonFor(__rmT("1Q3is5nrSDY"), format), ...reasonFor(__rmT("3F3_GT"), theme));
    }
    else if (format.score >= 5 && format.score >= theme.score + 2) {
        suggestion = EXTERNAL_WORLD_BOOK_CLASSIFICATION.FORMAT;
        confidence = confidenceFor(format.score, theme.score);
        reasons.push(...reasonFor(__rmT("1Q3is5nrSDY"), format));
    }
    else if (theme.score >= 5 && theme.score >= format.score + 2) {
        suggestion = EXTERNAL_WORLD_BOOK_CLASSIFICATION.THEME;
        confidence = confidenceFor(theme.score, format.score);
        reasons.push(...reasonFor(__rmT("3F3_GT"), theme));
    }
    else if (auxiliary.score >= 5 && format.score < 5 && theme.score < 5) {
        suggestion = EXTERNAL_WORLD_BOOK_CLASSIFICATION.AUXILIARY;
        confidence = confidenceFor(auxiliary.score, Math.max(format.score, theme.score));
        reasons.push(...reasonFor(__rmT("5p7qAHDfWGh"), auxiliary));
    }
    else {
        const top = Math.max(format.score, theme.score, auxiliary.score);
        if (top > 0) {
            reasons.push(`${__rmT("qur9Pa1EvUij0XLVRGtdHT")}${format.score}${__rmT("4bMejaFygRhyXsBq")}${theme.score}${__rmT("4bMejaFyCOCml_Bq")}${auxiliary.score}`);
            const ranked = [['format', format.score], ['theme', theme.score], ['auxiliary', auxiliary.score]].sort((a, b) => b[1] - a[1]);
            if (ranked[0][1] > ranked[1][1])
                suggestion = ranked[0][0];
        }
        else {
            reasons.push(__rmT("0_7bRcN_eCiPVp9t1ys0oHPMDMqdef"));
        }
    }
    const autoAccepted = confidence === EXTERNAL_WORLD_BOOK_CONFIDENCE.HIGH
        && [
            EXTERNAL_WORLD_BOOK_CLASSIFICATION.THEME,
            EXTERNAL_WORLD_BOOK_CLASSIFICATION.FORMAT,
            EXTERNAL_WORLD_BOOK_CLASSIFICATION.TEXT,
            EXTERNAL_WORLD_BOOK_CLASSIFICATION.AUXILIARY,
        ].includes(suggestion);
    return Object.freeze({
        suggestion,
        confidence,
        reasons: Object.freeze(reasons.slice(0, 6)),
        autoAccepted,
        suggestedFinalClassification: autoAccepted ? suggestion : EXTERNAL_WORLD_BOOK_CLASSIFICATION.PENDING,
    });
}
export function applyExternalWorldBookBulkClassification(draft, mode = 'suggested') {
    const allowed = ['theme', 'format', 'text', 'auxiliary', 'ignore'];
    if (mode !== 'suggested' && !allowed.includes(mode))
        return Array.isArray(draft) ? draft : [];
    return (Array.isArray(draft) ? draft : []).map(item => {
        if (item.userConfirmed === true || item.classification !== 'pending')
            return item;
        const classification = mode === 'suggested' ? item.suggestion : mode;
        if (!allowed.includes(classification) || (mode === 'suggested' && classification === 'ignore'))
            return item;
        return { ...item, classification, userConfirmed: true, requiresReview: false };
    });
}
export function createExternalWorldBookClassificationDraft(book, selectedIds, options = {}) {
    const selected = selectedIds instanceof Set ? selectedIds : new Set();
    const entries = (Array.isArray(book?.entries) ? book.entries : [])
        .filter(entry => selected.has(entryIdentity(entry)))
        .map(entry => {
        const textImport = options.importKind === 'text';
        const analysis = textImport ? { suggestion: 'text', confidence: 'high', reasons: [__rmT(".JIGiLhvtIgNLfRXCR.kcLQR")], suggestedFinalClassification: 'text', autoAccepted: true } : classifyExternalWorldBookEntry(entry);
        return {
            entryIdentity: entryIdentity(entry),
            sourceEntryId: entry.sourceEntryId,
            sourceEntryUid: entry.sourceEntryUid,
            sourceTitle: entry.title,
            suggestion: analysis.suggestion,
            confidence: analysis.confidence,
            reasons: [...analysis.reasons],
            classification: analysis.suggestedFinalClassification,
            userConfirmed: textImport,
            requiresReview: !analysis.autoAccepted,
            localTitle: String(entry.title || '').trim(),
            summary: buildExternalEntrySummary(entry),
            contentHash: entry.contentHash,
        };
    });
    return entries;
}
export function updateExternalWorldBookDraftItem(draft, identity, patch = {}) {
    const list = Array.isArray(draft) ? draft : [];
    return list.map(item => {
        if (item.entryIdentity !== identity)
            return item;
        const next = { ...item };
        if (Object.prototype.hasOwnProperty.call(patch, 'classification')) {
            const value = String(patch.classification || '');
            if (Object.values(EXTERNAL_WORLD_BOOK_CLASSIFICATION).includes(value))
                next.classification = value;
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'localTitle'))
            next.localTitle = String(patch.localTitle || '').trim().slice(0, 1000);
        if (Object.prototype.hasOwnProperty.call(patch, 'summary'))
            next.summary = String(patch.summary || '').replace(/\r\n?/g, '\n').trim().slice(0, 1200);
        next.userConfirmed = patch.userConfirmed === true ? true : next.userConfirmed;
        next.requiresReview = next.classification === EXTERNAL_WORLD_BOOK_CLASSIFICATION.PENDING;
        return next;
    });
}
export function externalWorldBookClassificationCounts(draft) {
    const counts = {
        total: 0,
        theme: 0,
        format: 0,
        text: 0,
        auxiliary: 0,
        ignore: 0,
        pending: 0,
        mixedSuggested: 0,
        uncertainSuggested: 0,
    };
    for (const item of Array.isArray(draft) ? draft : []) {
        counts.total += 1;
        if (Object.prototype.hasOwnProperty.call(counts, item.classification))
            counts[item.classification] += 1;
        if (item.suggestion === EXTERNAL_WORLD_BOOK_CLASSIFICATION.MIXED)
            counts.mixedSuggested += 1;
        if (item.suggestion === EXTERNAL_WORLD_BOOK_CLASSIFICATION.PENDING)
            counts.uncertainSuggested += 1;
    }
    return counts;
}
