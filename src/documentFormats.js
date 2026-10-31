import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.3.2";
const TITLE_WORDS = [__rmT("M2iy2T"), __rmT("g6rlYT"), __rmT("y8HnBk"), __rmT("mVJ7uk"), __rmT("92Tnuk"), __rmT("92xAEk"), __rmT("Z2o7Nk"), __rmT("NUZ7Nk"), __rmT("NUnGjk"), __rmT("965S.h"), __rmT("QJz9Lk"), __rmT("oPv9Lk"), __rmT("f8LEfh"), __rmT("GBhVEk"), __rmT("QV18YT"), __rmT("QVr7Nk"), __rmT("GCv5Nk"), __rmT("I67DGf"), __rmT("hASEET"), __rmT("SVgA3k"), __rmT("I6fkEk"), __rmT("SNxzNk"), __rmT("1FBpYT"), __rmT("zh0s.OEc"), __rmT("5JQzNk"), __rmT("JBezNk"), __rmT("0eJS3f"), __rmT("eCCOnk"), __rmT("7DqD2T"), __rmT("1BIS7f"), __rmT("6BQUEk"), __rmT("yp.oBk"), __rmT("LJJ7uk"), __rmT("ncYOjk"), __rmT("CM3UEk"), __rmT("EGXT9f"), __rmT("XRrQPJGC"), __rmT("jgwcuT"), __rmT("VDJWYT"), __rmT("6BJKLf"), __rmT("6UJ7Nk"), __rmT("B8ct3f"), __rmT("X3G90vhC"), __rmT("sFNUjk"), __rmT("1CS7Nk"), __rmT("fkOGS6w.")];
const SUMMARY_FORM = __rmR("IA62oPI8Qk8d5qs.6UZQzurS5G8ND7UchtEA.OywPey5neGpiEgcJ2xASwAF_ykf0jB.zgFcEcWq_.cu4YYInmiacee1BdTaVFFi3SsmdPKx7D_HIkwUbPJooSCa7D_R3ImH7wXnVZ77VXT82nbVes9ZgJV0FhtTcbWBtYgJ_r_UL8PW_sP9IAvBwr1wM7.fForVyL_qce8guBDXoP.yP2wQFhPR8nFJRsXMvNwSI5jZoKtpZzM93rGutLpu4d6mN5z2MTluokucBJFSpZJXnUr2", "");
const NOT_DOCUMENT = new Set(['4.3.11', '6.5', '6.1.2', '8.6', '6.2.4', '1.11', '1.18', '1.1.2']);
const IS_DOCUMENT = new Set(['1.7', '6.5.4.1', '2.14', '1.6']);
const cache = new Map();
export function isDocumentFormat(item) {
    if (!item || typeof item !== 'object')
        return false;
    const key = `${item.id || ''}|${item.title || ''}`;
    if (cache.has(key))
        return cache.get(key);
    const title = String(item.title || '');
    const summary = String(item.summary || '');
    const id = String(item.id || '');
    const result = IS_DOCUMENT.has(id) || (!NOT_DOCUMENT.has(id) && (TITLE_WORDS.some(word => title.includes(word)) || SUMMARY_FORM.test(summary)));
    if (cache.size > 2000)
        cache.clear();
    cache.set(key, result);
    return result;
}
export function looksLikeDocument(visualSkeleton) {
    const text = String(visualSkeleton || '');
    const unit = __rmR("P6bmmEOz4Rl3bld43vDx9Qi.prQT.MLGahIU3UX_tc_2r9W4VVEijMQhARxeHUs0Lc8ha5s35x0xIP6y84_ZJh", "").test(text);
    const mood = __rmR("q74Q3pFTxZRelpbMdOszdPOD_NcMUxxx0SHs2HgN.pqZUoOJCjpI05EZBnE9P4topomJLRfULy1Feihq0542ktcyDIEKn48oP4ghEpAguOo50kWIH2H4rXuWUyD1of", "").test(text);
    return unit && mood;
}
