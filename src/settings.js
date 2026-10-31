import { rmT as __rmT, rmTpl as __rmTpl, rmR as __rmR } from "./textTable.js?rmv=2.3.1";
import { normalizeNameMaskRules, normalizeNameMaskCardRules } from './nameMask.js?rmv=2.3.1';
import { normalizePresentationModes } from './presentationMode.js?rmv=2.3.1';
import { normalizeFaceDrawRules, normalizeFaceDrawPresets } from './faceDrawRules.js?rmv=2.3.1';
import { extension_settings } from '../../../../extensions.js';
import { saveSettingsDebounced } from '../../../../../script.js';
import { independentGenerationTiming } from './independentTiming.js?rmv=2.3.1';
import { AUTOMATIC_REROLL_DEFAULT, AUTOMATIC_REROLL_IDLE_DEFAULT_SECONDS, normalizeAutomaticRerollIdleSeconds, normalizeAutomaticRerollMax } from './automaticReroll.js?rmv=2.3.1';
import { DEFAULT_INDEPENDENT_MAX_REQUEST_CHARS, normalizeIndependentMaxRequestChars } from './independentRequestBudget.js?rmv=2.3.1';
import { normalizeMissingShellScanRange } from './independentApi/missingRetryShell.js?rmv=2.3.1';
export const MODULE_NAME = 'rabbit_mirror_theater';
export const VISUAL_PROMPT_MAX_CHARS = 5000;
export const VISUAL_EXTRA_PROMPT_MAX_CHARS = 1000;
export const VISUAL_AVOID_PROMPT_MAX_CHARS = 1000;
export const WORLD_INFO_BOOK_NAME_MAX_CHARS = 512;
export const VISUAL_TONE_MODES = Object.freeze(['normal', 'soft', 'dark']);
export const INDEPENDENT_CONTEXT_EXCLUDED_TAG_MAX_COUNT = 128;
function normalizeMemoryWorldBookSettingId(value) {
    return typeof value === 'string' && value.length <= 1000 && !/[\u0000\r\n]/.test(value)
        ? value.trim() : '';
}
export function normalizeIndependentEarlyBodyTags(value) {
    if (!Array.isArray(value) || value.length > 8 || value.some(tag => typeof tag !== 'string' || !/^[a-z][a-z0-9_:-]{0,63}$/i.test(tag.trim())))
        return [];
    return [...new Set(value.map(tag => tag.trim().toLowerCase()))];
}
export const DEFAULT_INDEPENDENT_CONTEXT_EXCLUDED_TAGS = Object.freeze([
    'thinking',
    'updatevariable',
    'updatevarible',
]);
export const RABBIT_MIRROR_BANNED_WORD_MAX_COUNT = 256;
export const RABBIT_MIRROR_BANNED_WORD_MAX_CHARS = 80;
export function normalizeRabbitMirrorBannedWords(value) {
    const source = typeof value === 'string'
        ? value.replace(/\r\n?/g, '\n').split('\n')
        : Array.isArray(value) ? value : [];
    const result = [];
    const seen = new Set();
    for (const raw of source) {
        const term = String((raw && typeof raw === 'object' ? raw.find : raw) ?? '')
            .replace(/[\u0000-\u001F\u007F]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, RABBIT_MIRROR_BANNED_WORD_MAX_CHARS);
        if (!term)
            continue;
        const key = term.toLocaleLowerCase();
        if (seen.has(key))
            continue;
        seen.add(key);
        const replacement = raw && typeof raw === 'object'
            ? String(raw.replace ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').slice(0, 240) : '';
        result.push(replacement ? { find: term, replace: replacement } : term);
        if (result.length >= RABBIT_MIRROR_BANNED_WORD_MAX_COUNT)
            break;
    }
    return result;
}
function normalizeLotteryEntries(value) {
    if (!Array.isArray(value))
        return [];
    const result = [];
    const seen = new Set();
    for (const raw of value) {
        if (!raw || typeof raw !== 'object')
            continue;
        const book = String(raw.book || '').trim().slice(0, 240);
        const uid = String(raw.uid || '').trim().slice(0, 80);
        const id = String(raw.id || (book && uid ? `${book}::${uid}` : '')).trim().slice(0, 360);
        if (!book || !uid || !id || seen.has(id))
            continue;
        seen.add(id);
        result.push({
            id,
            book,
            uid,
            title: String(raw.title || uid).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200),
            content: String(raw.content || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 1800),
        });
        if (result.length >= 80)
            break;
    }
    return result;
}
function normalizeLotteryBooks(value, entries = []) {
    const source = Array.isArray(value) && value.length ? value : entries.map(entry => entry?.book);
    const result = [];
    const seen = new Set();
    for (const raw of source) {
        const book = String(raw || '').trim().slice(0, 240);
        if (!book || seen.has(book))
            continue;
        seen.add(book);
        result.push(book);
        if (result.length >= 40)
            break;
    }
    return result;
}
export function normalizeIndependentContextExcludedTags(value) {
    const source = Array.isArray(value)
        ? value
        : String(value ?? '').split(__rmR("xugMa2TBnsSB3v.fAcL9yGrXeQs", ""));
    const normalized = [];
    const seen = new Set();
    for (const rawValue of source) {
        const raw = String(rawValue ?? '').trim();
        if (!raw)
            continue;
        const unwrapped = raw
            .replace(/^<\s*\/?\s*/, '')
            .replace(/\s*\/?>\s*$/, '')
            .split(/\s/, 1)[0]
            .toLocaleLowerCase();
        if (!/^[\p{L}][\p{L}\p{N}._:-]{0,63}$/u.test(unwrapped) || [...unwrapped].length > 64 || seen.has(unwrapped))
            continue;
        seen.add(unwrapped);
        normalized.push(unwrapped);
        if (normalized.length >= INDEPENDENT_CONTEXT_EXCLUDED_TAG_MAX_COUNT)
            break;
    }
    return normalized;
}
const LEGACY_FORMAT_ID_ALIASES = Object.freeze({
    '6.2.1.2': '6.2.1.1.e',
});
function canonicalFormatSettingId(value) {
    const id = String(value || '').trim();
    return LEGACY_FORMAT_ID_ALIASES[id] || id;
}
const PREVIOUS_VISUAL_COLOR_RULES = String.raw(__rmTpl(["Oa9N3G_tw8eDcquWCtciT3hEgZ.a6BWK0ZFSwALssQkppgwiar3yWi8DYOa61Y13aSi4pVi.ykvkKW4xs9yp85.RalPC8uIHh5lAYUpsnh0yd_1V7rcaFDnznulMQ1z9fgApPgVOWRiBVV7bz9ce13HaglpE51wTPGOb2J6D2HI8pFSaYWFJZ3zKkQD1JtgXD3CiGMOasZGAG1yn1C16HHOcqFRjc2usAr.DIKQDwudot.cQweN6fOVYHIXt5GaM7NCEtkSnLlmgBQLplLX5LmvmrmFuHPRaK3aFXci5.iwGs2syslcJMuHJo9j28X5EgnsNSp8L8WXduEohUCBvjt9OahvzJpySoYECC4c_W6LYkroVPU5fbc5Rp14F4acV_5EQivHW2fYE88n7xfULSpVpG.HknQWc8D2F9kR6lEmLInTR0xcTtAfE03c7k3hCG2xv6zN8pdvv8rE6zN7z1NW7grsY8nOa_Iwz_.ycjJEF8Ri_Iiku8R9SSUOmiFDEwGF5mMTimc6nZkcNlWZ1C9A7SgZ0JgJVgVSlAXr0_KDQGvc05dq.rcsERsnZhBQuJzYqa4UMPIBeSo22638gT1IDUXY8Zb872CiPVAuubTGVWhw56BGmNncdAp17s0Ew15xDEo6IuPY5p2z3EU4PWOwxB51j.R50BHu9MINjyWdnc6gRq6qIqXYqRAsFS5poWWHtWgkIWA5kj1dNbbY7LGZFXVQ1GHRXl8qrF7aSR4i_ITyqihnOhhaymIxNAVOl8OvC.Pfa2WvbUCfLjjZo.6pcLYduR.8vGR_qH19F19XhFabGTVaXegil_p.mFGPVn_cwhAbxScbjbYmEfjydRKQwO4fW41g4G1hhdOALBBU9P3Vy4UEB0nuQGbEZ5kCeQdBKyZuvTxRNXywT7ODaTBrVCn4597DZqxlHqfxalNcAnf9mrnq27Lt75xAgkDcAeItKhHkG_LKyNrjti3UmLW0k9WdQ8pJ_GcPUr6cNhGs"], ["Oa9N3G_tw8eDcquWCtciT3hEgZ.a6BWK0ZFSwALssQkppgwiar3yWi8DYOa61Y13aSi4pVi.ykvkKW4xs9yp85.RalPC8uIHh5lAYUpsnh0yd_1V7rcaFDnznulMQ1z9fgApPgVOWRiBVV7bz9ce13HaglpE51wTPGOb2J6D2HI8pFSaYWFJZ3zKkQD1JtgXD3CiGMOasZGAG1yn1C16HHOcqFRjc2usAr.DIKQDwudot.cQweN6fOVYHIXt5GaM7NCEtkSnLlmgBQLplLX5LmvmrmFuHPRaK3aFXci5.iwGs2syslcJMuHJo9j28X5EgnsNSp8L8WXduEohUCBvjt9OahvzJpySoYECC4c_W6LYkroVPU5fbc5Rp14F4acV_5EQivHW2fYE88n7xfULSpVpG.HknQWc8D2F9kR6lEmLInTR0xcTtAfE03c7k3hCG2xv6zN8pdvv8rE6zN7z1NW7grsY8nOa_Iwz_.ycjJEF8Ri_Iiku8R9SSUOmiFDEwGF5mMTimc6nZkcNlWZ1C9A7SgZ0JgJVgVSlAXr0_KDQGvc05dq.rcsERsnZhBQuJzYqa4UMPIBeSo22638gT1IDUXY8Zb872CiPVAuubTGVWhw56BGmNncdAp17s0Ew15xDEo6IuPY5p2z3EU4PWOwxB51j.R50BHu9MINjyWdnc6gRq6qIqXYqRAsFS5poWWHtWgkIWA5kj1dNbbY7LGZFXVQ1GHRXl8qrF7aSR4i_ITyqihnOhhaymIxNAVOl8OvC.Pfa2WvbUCfLjjZo.6pcLYduR.8vGR_qH19F19XhFabGTVaXegil_p.mFGPVn_cwhAbxScbjbYmEfjydRKQwO4fW41g4G1hhdOALBBU9P3Vy4UEB0nuQGbEZ5kCeQdBKyZuvTxRNXywT7ODaTBrVCn4597DZqxlHqfxalNcAnf9mrnq27Lt75xAgkDcAeItKhHkG_LKyNrjti3UmLW0k9WdQ8pJ_GcPUr6cNhGs"]));
const PREVIOUS_82_VISUAL_COLOR_RULES = PREVIOUS_VISUAL_COLOR_RULES
    .replace(__rmT("u.qoDnMoEmXbMMFQArOrxSW85_sA9YalKxZL4q4XsY4ZZsLZ7Oi8fL62FsFpknWSOBi8Z4Z8Pw2jVuQ0ElDP8mmVXLid4AkIqj_RAbhWA67AVTPOUI.SWFPBDfppuZHwciGiQ1_LgdJelIwhx_ikTlcslWk9qGNt2flx_T"), __rmT("7U6UbCd4U74WbC51o0mwLFu.eswF56krSBc0amw1dZ3MC0kRqvWeW8YmNJZU5mt2Dpx9gl1eCaRm58otpsf1Q5o9TW3ttZKyQiZ2OBVMy623U4fvMp0RZFPAWZ0Tv57lr6A"))
    .replace(__rmT("yByCXt0OHVkvJFDnjSb1ssuWKV7GPVPyZoMHMdxiHNnXgI5JKQoikEyxNeTDzZLMdVO_eDsWR1lZJeiyIvLUmqwZyNE1E0YO"), __rmT("r0_8bNMhB9XdcSdF4Ztng9_Rp0i6caTNQbsoR61XrJZyHzYhMas.SmvPKQ0vX_hiFl05ZtsQJiEvR3CmjTZQqQHxNtiWN6jaO5DcFr58iHwbpjLePJhTtDUt"));
export const DEFAULT_VISUAL_COLOR_RULES = PREVIOUS_82_VISUAL_COLOR_RULES
    .replace(__rmT("0yZN7UKsrf6GTcSkS6Wij5mZc83SrwwWeJx_cShaVfPsKgArMREWQUT7I6PTNt5yksyvtgGGXONBiNU5r6vmvkppdUUS.r2Q1zYZAfHFz6IrKd0vGcC0if"), __rmT("XMkTaSq9HUpPmsIv5QBxV6L5DK0bFgdc6UKLu4huxBgBPZVr2cLknELTpkEQLp1HGSqUwXOzRUBOXlFdQPJj2zzo7sUFbkmY6k53N0vgpZfhrV.HiwF6fyy9zg94.fqJgC9zv0dhfYnikafF"))
    .replace(__rmT("V_k.D0S4gtnRhmhuEiRwHixqCayyha6tc1rjhMPIwG57qUwCBPk4iMkY0YBt71EklCU3JfTi_IFUvy7uwSTlvney4MGcD3Vvx4_WjSXG4Gtq_Hy65zCCvti6fbN7lyt5yQk9zjLP1FT"), __rmT("yfXc6ao0Uw0Y0s11t5OD3XaCNZmImg4IFpdtPsPFZpZ8Gx2HjFwJrs6y61M1Lk0OozhURrdyCkKUv1zZmSTcJ5bjngGM3sFZTqybp1d6Q5MHLsVlRwD_6SFVBbLhyot5jQ_9zjLP1FT"));
export const DEFAULT_VISUAL_PROMPT = String.raw(__rmTpl(["4_TIz9_pLy0s2Hq1EkTKrrsa.f1.12uNL_wO9GetCK2c6wIua75uHeFYVly1erV4dEB6n5GluIZbiIBYGmiK0o_kdG9SzLSbezuPC6o4rD8xPuQHSOXGfyWhqelCIj0wF1e4LyjW.9RGondO72dlQJOn4hTJeZ.WcOsuBZAWJSxnimv4qUL7ody1PqMYg5A67GHhURTkvAuOilGT7AUQmfM5cBMtRoJrnEvjvOM5LhSPwLSO2LeMJpZWb4UnLk257GNfIM4ZmlB2to6IAeic2iRRViN.1QewU8MMultHXcs95NC9jrkepwZeKaZamS.dW3dPvzOPEJZxl74tl_EtOpwnpVOfLAiMzvoTa3hQUJvxIhpCGiQU7gx1yLcRfCubjgB_FZPNy780uNESrYeMAcwK36vF4XiQfTaxygaCDHbNrQIlQWFPQQC96z5xAd1iRkKPorNJALS9pvKSWa2Nx2sW8fPhX8.VPTT.rfut5i.oK7U.yN89oOv2HsJpo7yLUnRo8UHyY4jXVF0QiVhAD6V1xbiUNYgeZZksc_.4Fx4.qtukFWtRmY4ZCXTQwT", ""], ["4_TIz9_pLy0s2Hq1EkTKrrsa.f1.12uNL_wO9GetCK2c6wIua75uHeFYVly1erV4dEB6n5GluIZbiIBYGmiK0o_kdG9SzLSbezuPC6o4rD8xPuQHSOXGfyWhqelCIj0wF1e4LyjW.9RGondO72dlQJOn4hTJeZ.WcOsuBZAWJSxnimv4qUL7ody1PqMYg5A67GHhURTkvAuOilGT7AUQmfM5cBMtRoJrnEvjvOM5LhSPwLSO2LeMJpZWb4UnLk257GNfIM4ZmlB2to6IAeic2iRRViN.1QewU8MMultHXcs95NC9jrkepwZeKaZamS.dW3dPvzOPEJZxl74tl_EtOpwnpVOfLAiMzvoTa3hQUJvxIhpCGiQU7gx1yLcRfCubjgB_FZPNy780uNESrYeMAcwK36vF4XiQfTaxygaCDHbNrQIlQWFPQQC96z5xAd1iRkKPorNJALS9pvKSWa2Nx2sW8fPhX8.VPTT.rfut5i.oK7U.yN89oOv2HsJpo7yLUnRo8UHyY4jXVF0QiVhAD6V1xbiUNYgeZZksc_.4Fx4.qtukFWtRmY4ZCXTQwT", ""]), DEFAULT_VISUAL_COLOR_RULES);
const PREVIOUS_82_DEFAULT_VISUAL_PROMPT = DEFAULT_VISUAL_PROMPT.replace(DEFAULT_VISUAL_COLOR_RULES, PREVIOUS_82_VISUAL_COLOR_RULES);
const PREVIOUS_DEFAULT_VISUAL_PROMPT = DEFAULT_VISUAL_PROMPT.replace(DEFAULT_VISUAL_COLOR_RULES, PREVIOUS_VISUAL_COLOR_RULES);
const SUPERSEDED_DEFAULT_VISUAL_PROMPT = DEFAULT_VISUAL_PROMPT.replace(DEFAULT_VISUAL_COLOR_RULES, String.raw(__rmTpl(["ZD8cEKukhvBH_rOv4r7CQvfjpqIraum4SpyJzJOdUao4w2anH4X08iCzFlQHijqinzqcracPh__ZhdSWe0bPGbmR.ZMp6fYqz0URRgTQ2YRRWV9tYkU4GJeUBWkoOIWATJhyoYQGG0dyTrgyx7rG6aiPIrXcGyQmxD4KwUr34YfK1PjZI0th94_12f59BFp7lntTEGtZ.H.v03s.6fKuUVeibF9UCK7Y2lmVhpYr4IaxDbwJo1RMgGInJ.FVXr3Gk3UzbxlmqYhw0pdZGCZxdmWqkp500BBemvEYsy4TCbxhi9AvlWMuNI8RJm4g77gdi0dhgRk0vQmu1rKz9_ylVbhHhpE2Y67d5yfmyf2dVDq_U0XMatBXOPX1lTDgZ4ufh.DIoqzg5ddd1NYCAJlEGW8QQ4opkk9QVj8CTC_8NkRb6wPz2bDir0ga2NegHJuKbkYweM6U7O7pVLE0.Wa50tmgfSNlMGtXZknXVNnxkgt2kOrJoEv3A4x.iVRg2jVI4fEaUsZPwMbiHtpPx4i3Io0IwBvMG4mtQcgrJE0jcJCAeqLkPGB2.xrq3EQeC550no.kzUAInWrZ5dYdvLseqwViorfQj6MwB3YMTh6Cwx_qxeJv4SNdbMqWCoXuREqRsu6mscFbFke5KkEmF8qoeldQ3Y52dR0whDZytotZ.BDfQFcrNzZKrD3ElD8ZMSAqy50TAmCTc6YOWnKhxuhBFBE05eebRVtE8KFbzzrT1e0u_lnJWQKkVqLdksCZEUQE9hGdKB7nL8zk99dUmfsDNyG2WX4wv2jVmUXsK13.CDXhHYpz_lngrOZGylkILf"], ["ZD8cEKukhvBH_rOv4r7CQvfjpqIraum4SpyJzJOdUao4w2anH4X08iCzFlQHijqinzqcracPh__ZhdSWe0bPGbmR.ZMp6fYqz0URRgTQ2YRRWV9tYkU4GJeUBWkoOIWATJhyoYQGG0dyTrgyx7rG6aiPIrXcGyQmxD4KwUr34YfK1PjZI0th94_12f59BFp7lntTEGtZ.H.v03s.6fKuUVeibF9UCK7Y2lmVhpYr4IaxDbwJo1RMgGInJ.FVXr3Gk3UzbxlmqYhw0pdZGCZxdmWqkp500BBemvEYsy4TCbxhi9AvlWMuNI8RJm4g77gdi0dhgRk0vQmu1rKz9_ylVbhHhpE2Y67d5yfmyf2dVDq_U0XMatBXOPX1lTDgZ4ufh.DIoqzg5ddd1NYCAJlEGW8QQ4opkk9QVj8CTC_8NkRb6wPz2bDir0ga2NegHJuKbkYweM6U7O7pVLE0.Wa50tmgfSNlMGtXZknXVNnxkgt2kOrJoEv3A4x.iVRg2jVI4fEaUsZPwMbiHtpPx4i3Io0IwBvMG4mtQcgrJE0jcJCAeqLkPGB2.xrq3EQeC550no.kzUAInWrZ5dYdvLseqwViorfQj6MwB3YMTh6Cwx_qxeJv4SNdbMqWCoXuREqRsu6mscFbFke5KkEmF8qoeldQ3Y52dR0whDZytotZ.BDfQFcrNzZKrD3ElD8ZMSAqy50TAmCTc6YOWnKhxuhBFBE05eebRVtE8KFbzzrT1e0u_lnJWQKkVqLdksCZEUQE9hGdKB7nL8zk99dUmfsDNyG2WX4wv2jVmUXsK13.CDXhHYpz_lngrOZGylkILf"])));
function cloneDefaultSettings() {
    return typeof structuredClone === 'function'
        ? structuredClone(defaultSettings)
        : JSON.parse(JSON.stringify(defaultSettings));
}
export const defaultSettings = Object.freeze({
    enabled: true,
    autoRabbitMirrorInjection: true,
    mode: 'integrated',
    generationSource: 'follow',
    independentGenerationTiming: 'auto',
    followDisplayMode: 'inline',
    independentConnectionProfileId: '',
    independentExternalAnchor: 'outside',
    independentExternalAnchorDefaultV2: false,
    independentConnectionSecretMemo: {},
    independentApiBaseUrl: '',
    independentApiKey: '',
    independentApiModel: '',
    independentApiTemperature: 0.8,
    independentApiMaxTokens: 30000,
    independentMaxRequestChars: DEFAULT_INDEPENDENT_MAX_REQUEST_CHARS,
    independentAutomaticRerollMax: AUTOMATIC_REROLL_DEFAULT,
    independentAutomaticRerollIdleSeconds: AUTOMATIC_REROLL_IDLE_DEFAULT_SECONDS,
    automaticRerollEnabled: true,
    independentAdvancedEnabled: false,
    independentReasoningEffort: '',
    independentExtraParams: '',
    independentExcludedParams: [],
    independentContextMaxLayers: 20,
    independentContextExcludedTags: [...DEFAULT_INDEPENDENT_CONTEXT_EXCLUDED_TAGS],
    behaviorRuleMode: 'off',
    behaviorRuleText: null,
    independentEarlyBodyEnabled: false,
    independentEarlyBodyTags: [],
    independentEarlyBodyChatKey: '',
    followTagIsolationEnabled: false,
    independentReadCharacterCardSummary: true,
    independentReadPersonaSummary: true,
    independentDisplayMode: 'external',
    missingShellScanRange: 10,
    independentReadGlobalWorldInfo: false,
    independentWorldInfoDisabledBooks: [],
    samplingMode: 'classic',
    singlePairSampling: false,
    lotteryMethod: 'random',
    atmosphereStoryPercent: 70,
    rawPolicy: 'balanced',
    showCot: false,
    avoidRepeat: true,
    darkVisualMode: false,
    visualToneMode: 'normal',
    postGenerationRecolor: false,
    visualDesignMode: 'guided1553',
    cooldownRounds: 10,
    stripOldMirrorsBeforeSend: true,
    noSendRegexAutoConfigured: false,
    blacklistEnabled: true,
    blacklistedThemeIds: [],
    blacklistedFormatIds: [],
    favoriteThemeIds: [],
    favoriteFormatIds: [],
    favoriteThemeMultipliers: {},
    favoriteFormatMultipliers: {},
    presentationWorldviewLock: false,
    rabbitMirrorFaceCount: 1,
    multifaceDispatch: 'single',
    rabbitMirrorPresentationModes: ['html', 'html', 'html', 'html', 'html'],
    rabbitMirrorFaceDrawRules: normalizeFaceDrawRules(),
    rabbitMirrorFaceDrawPresets: [],
    longTextSource: 'blank',
    autoLongTextPercent: 0,
    presentationDefaultsMigration: 1,
    lotterySource: 'builtin',
    lotteryBuiltinPercent: 50,
    lotteryBooks: [],
    lotteryEntries: [],
    facePagerPosition: 'top',
    animationIdlePause: 'auto',
    desktopFaceZoom: true,
    desktopFaceZoomWidth: 520,
    faceHealthInMenu: false,
    repairSampleUpload: false,
    updateGuideEnabled: true,
    selfInventMode: false,
    updateGuideSeenVersion: '',
    writingStyle: '',
    independentReadCharacterWorldBook: false,
    richFormatBias: false,
    maintenanceRabbitEnabled: true,
    maintenanceRabbitAutoSafeEnabled: false,
    maintenanceRabbitAutoSafeConsent: false,
    feedbackCatEnabled: true,
    rabbitMirrorBannedWords: [],
    externalWorldBookRandomEnabled: false,
    externalWorldBookMixMode: 'builtin-only',
    visualPromptEditingEnabled: false,
    visualPrompt: DEFAULT_VISUAL_PROMPT,
    visualExtraPrompt: '',
    visualAvoidPrompt: '',
    appearanceReferenceEnabled: false,
    appearanceReferenceRevision: '',
    hardStartup: true,
    hardChineseLock: true,
    userDirectivePriority: true,
    creativeExpansionMode: true,
    forceVisualScenery: false,
    visualSceneryCombination: false,
    imageEnabled: false,
    builtinImageEnabled: false,
    materialTextureEnabled: false,
    webFontsEnabled: true,
    collectionTasteEnabled: true,
    imagePromptFormat: 'nai5-natural',
    imageLooksLibrary: true,
    imageLooksCard: true,
    imageLooksMyriad: true,
    imageLooksWorldBook: true,
    imageLooksModel: true,
    nameMaskRules: [],
    nameMaskRulesByCard: {},
    imageCompositionMode: 'scene',
    imageBackend: 'baibai',
    imageLlmEnabled: false,
    imageLlmProfileId: '',
    imageLlmBaseUrl: '',
    imageLlmKey: '',
    imageLlmModel: '',
    imageLlmTemperature: 0.8,
    imageLlmMaxTokens: 4096,
    memoryScanEnabled: false,
    sourceProfilesEnabled: false,
    sourceProfiles: null,
    userSkin: null,
    memoryWorldBookEnabled: false,
    memoryWorldBookId: '',
    memoryProviderIds: [],
    memoryMaxChars: 2200,
    themesMin: 1,
    themesMax: 3,
    formatsMin: 1,
    formatsMax: 2,
    depth: 0,
    role: 'system',
    skipQuiet: true,
    skipImpersonate: true,
    debug: false,
});
const VERSION_SWITCH_BACKUP_KEY = 'rabbit_mirror_settings_before_version_switch:v1';
const VERSION_SWITCH_BACKUP_KEY_V2 = 'rabbit_mirror_settings_before_version_switch:v2';
const SECRET_SETTING = /(?:ApiKey|LlmKey|Secret|Token|Password)$|SecretMemo$/;
let versionSwitchBackupChecked = false;
export function backupSettingsBeforeVersionSwitch() {
    const settings = getSettings();
    const copy = {};
    for (const [key, value] of Object.entries(settings))
        if (!SECRET_SETTING.test(key))
            copy[key] = value;
    const payload = JSON.stringify({ at: Date.now(), settings: copy });
    globalThis.localStorage?.setItem(VERSION_SWITCH_BACKUP_KEY, payload);
    try {
        const kept = JSON.parse(globalThis.localStorage?.getItem(VERSION_SWITCH_BACKUP_KEY_V2) || 'null')?.settings || {};
        globalThis.localStorage?.setItem(VERSION_SWITCH_BACKUP_KEY_V2, JSON.stringify({ at: Date.now(), settings: { ...kept, ...copy } }));
    }
    catch { }
}
function restoreSettingsDroppedByOtherVersion(settings) {
    if (versionSwitchBackupChecked)
        return;
    versionSwitchBackupChecked = true;
    const readBackup = key => { try {
        const value = JSON.parse(globalThis.localStorage?.getItem(key) || 'null');
        return value?.settings && typeof value.settings === 'object' ? value : null;
    }
    catch {
        return null;
    } };
    const first = readBackup(VERSION_SWITCH_BACKUP_KEY_V2), second = readBackup(VERSION_SWITCH_BACKUP_KEY);
    if (!first && !second)
        return;
    const backup = { at: Math.max(Number(first?.at || 0), Number(second?.at || 0)), settings: Number(second?.at || 0) > Number(first?.at || 0) ? { ...(first?.settings || {}), ...(second?.settings || {}) } : { ...(second?.settings || {}), ...(first?.settings || {}) } };
    const drop = () => { try {
        globalThis.localStorage?.removeItem(VERSION_SWITCH_BACKUP_KEY);
        globalThis.localStorage?.removeItem(VERSION_SWITCH_BACKUP_KEY_V2);
    }
    catch { } };
    if (!(Date.now() - Number(backup.at || 0) < 90 * 86400000)) {
        drop();
        return;
    }
    let restored = 0;
    for (const [key, value] of Object.entries(backup.settings)) {
        if (!(key in defaultSettings) || SECRET_SETTING.test(key) || Object.prototype.hasOwnProperty.call(settings, key))
            continue;
        settings[key] = value;
        restored += 1;
    }
    if (Object.keys(backup.settings).every(key => key in defaultSettings))
        drop();
    if (restored) {
        try {
            saveSettingsDebounced();
        }
        catch { }
    }
}
export function getSettings() {
    const newInstallation = !Object.prototype.hasOwnProperty.call(extension_settings, MODULE_NAME);
    if (!extension_settings[MODULE_NAME] || typeof extension_settings[MODULE_NAME] !== 'object') {
        extension_settings[MODULE_NAME] = cloneDefaultSettings();
        if (!newInstallation)
            extension_settings[MODULE_NAME].behaviorRuleMode = 'always';
        if (newInstallation)
            extension_settings[MODULE_NAME].updateGuideSeenVersion = 'fresh';
    }
    const settings = extension_settings[MODULE_NAME];
    if (!newInstallation)
        restoreSettingsDroppedByOtherVersion(settings);
    if (!newInstallation && settings.behaviorRuleMode === undefined)
        settings.behaviorRuleMode = 'always';
    settings.independentGenerationTiming = independentGenerationTiming(settings);
    const legacyRescueWasEnabled = !!(settings.plainTextRescueMode || settings.codeBlockRescueMode || settings.interactionRescueMode);
    if (settings.presentationDefaultsMigration !== 1) {
        settings.rabbitMirrorPresentationModes = ['html', 'html', 'html', 'html', 'html'];
        settings.autoLongTextPercent = 0;
        settings.presentationDefaultsMigration = 1;
        try {
            saveSettingsDebounced();
        }
        catch { }
    }
    if (settings.visualToneMode === undefined)
        settings.visualToneMode = settings.darkVisualMode === true ? 'dark' : 'normal';
    if (settings.showCot === undefined && settings.showWonderland !== undefined)
        settings.showCot = !!settings.showWonderland;
    if (settings.autoRabbitMirrorInjection === undefined)
        settings.autoRabbitMirrorInjection = settings.enabled !== false;
    if (settings.maintenanceRabbitEnabled === undefined)
        settings.maintenanceRabbitEnabled = legacyRescueWasEnabled || defaultSettings.maintenanceRabbitEnabled;
    for (const [key, value] of Object.entries(defaultSettings)) {
        if (settings[key] === undefined)
            settings[key] = value;
    }
    if (settings.mode === 'canon' || settings.mode === 'off') {
        settings.mode = settings.mode === 'off' ? 'off' : 'integrated';
    }
    if (!['follow', 'independent'].includes(settings.generationSource))
        settings.generationSource = 'follow';
    if (!['inline', 'external'].includes(settings.followDisplayMode))
        settings.followDisplayMode = 'inline';
    if (!['external', 'external_then_inline'].includes(settings.independentDisplayMode))
        settings.independentDisplayMode = 'external';
    if (!['auto', 'body', 'outside'].includes(settings.independentExternalAnchor))
        settings.independentExternalAnchor = 'outside';
    if (settings.independentExternalAnchorDefaultV2 !== true) {
        if (settings.independentExternalAnchor === 'auto')
            settings.independentExternalAnchor = 'outside';
        settings.independentExternalAnchorDefaultV2 = true;
    }
    settings.missingShellScanRange = normalizeMissingShellScanRange(settings.missingShellScanRange);
    settings.independentReadGlobalWorldInfo = settings.independentReadGlobalWorldInfo === true;
    settings.independentConnectionProfileId = String(settings.independentConnectionProfileId || '').trim().slice(0, 160);
    {
        const memo = settings.independentConnectionSecretMemo && typeof settings.independentConnectionSecretMemo === 'object' && !Array.isArray(settings.independentConnectionSecretMemo) ? settings.independentConnectionSecretMemo : {};
        settings.independentConnectionSecretMemo = Object.fromEntries(Object.entries(memo)
            .map(([id, secret]) => [String(id || '').trim().slice(0, 160), String(secret || '').trim().slice(0, 240)])
            .filter(([id, secret]) => id && secret).slice(-40));
    }
    settings.independentWorldInfoDisabledBooks = [...new Set((Array.isArray(settings.independentWorldInfoDisabledBooks) ? settings.independentWorldInfoDisabledBooks : [])
            .map(value => String(value || '').trim())
            .filter(value => value && value.length <= WORLD_INFO_BOOK_NAME_MAX_CHARS))];
    settings.independentApiBaseUrl = String(settings.independentApiBaseUrl || '').trim();
    settings.independentApiKey = String(settings.independentApiKey || '').trim();
    settings.independentApiModel = String(settings.independentApiModel || '').trim();
    {
        const temperature = Number(settings.independentApiTemperature);
        settings.independentApiTemperature = Math.max(0, Math.min(2, Number.isFinite(temperature) ? temperature : 0.8));
    }
    settings.independentApiMaxTokens = Math.max(512, Math.min(64000, Number(settings.independentApiMaxTokens) || 30000));
    settings.independentMaxRequestChars = normalizeIndependentMaxRequestChars(settings.independentMaxRequestChars);
    settings.independentAutomaticRerollMax = normalizeAutomaticRerollMax(settings.independentAutomaticRerollMax);
    settings.independentAutomaticRerollIdleSeconds = normalizeAutomaticRerollIdleSeconds(settings.independentAutomaticRerollIdleSeconds);
    settings.automaticRerollEnabled = settings.automaticRerollEnabled !== false;
    settings.independentAdvancedEnabled = settings.independentAdvancedEnabled === true;
    {
        const contextLayers = Number(settings.independentContextMaxLayers);
        settings.independentContextMaxLayers = Math.max(1, Math.min(200, Number.isFinite(contextLayers) ? Math.round(contextLayers) : 20));
    }
    settings.independentContextExcludedTags = normalizeIndependentContextExcludedTags(settings.independentContextExcludedTags);
    settings.behaviorRuleMode = ['always', 'off', 'adult-only'].includes(settings.behaviorRuleMode) ? settings.behaviorRuleMode : 'always';
    settings.behaviorRuleText = settings.behaviorRuleText == null ? null : String(settings.behaviorRuleText).replace(/\u0000/g, '').slice(0, 20000);
    settings.independentEarlyBodyEnabled = settings.independentEarlyBodyEnabled === true;
    settings.independentEarlyBodyTags = normalizeIndependentEarlyBodyTags(settings.independentEarlyBodyTags);
    settings.independentEarlyBodyChatKey = String(settings.independentEarlyBodyChatKey || '').slice(0, 2048);
    settings.followTagIsolationEnabled = settings.followTagIsolationEnabled === true;
    settings.independentReadCharacterCardSummary = settings.independentReadCharacterCardSummary !== false;
    settings.independentReadPersonaSummary = settings.independentReadPersonaSummary !== false;
    if (settings.showWonderland !== undefined)
        delete settings.showWonderland;
    if (settings.forceInteractiveMode !== undefined)
        delete settings.forceInteractiveMode;
    if (settings.uiAudit !== undefined)
        delete settings.uiAudit;
    for (const key of Object.keys(settings)) {
        if (!(key in defaultSettings))
            delete settings[key];
    }
    settings.themesMin = Number(settings.themesMin) || defaultSettings.themesMin;
    settings.themesMax = Number(settings.themesMax) || defaultSettings.themesMax;
    settings.formatsMin = Number(settings.formatsMin) || defaultSettings.formatsMin;
    settings.formatsMax = Number(settings.formatsMax) || defaultSettings.formatsMax;
    settings.avoidRepeat = true;
    if (!VISUAL_TONE_MODES.includes(settings.visualToneMode))
        settings.visualToneMode = settings.darkVisualMode === true ? 'dark' : 'normal';
    settings.darkVisualMode = settings.visualToneMode === 'dark';
    settings.postGenerationRecolor = false;
    settings.visualDesignMode = 'guided1553';
    settings.cooldownRounds = Math.max(1, Number(settings.cooldownRounds) || defaultSettings.cooldownRounds);
    settings.blacklistEnabled = settings.blacklistEnabled !== false;
    const normalizeSelectionIds = (value, mapId = id => id) => [...new Set((Array.isArray(value) ? value : []).map(id => mapId(String(id || '').trim())).filter(Boolean))].slice(0, 512);
    settings.blacklistedThemeIds = normalizeSelectionIds(settings.blacklistedThemeIds);
    settings.blacklistedFormatIds = normalizeSelectionIds(settings.blacklistedFormatIds, canonicalFormatSettingId);
    settings.favoriteThemeIds = normalizeSelectionIds(settings.favoriteThemeIds);
    settings.favoriteFormatIds = normalizeSelectionIds(settings.favoriteFormatIds, canonicalFormatSettingId);
    const normalizeFavoriteMultipliers = (value, favoriteIds, mapId = id => id) => {
        const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        const allowed = new Set(favoriteIds || []);
        const forbiddenKeys = new Set(['__proto__', 'prototype', 'constructor']);
        const result = {};
        for (const [rawId, rawMultiplier] of Object.entries(source)) {
            const sourceId = String(rawId || '').trim();
            const id = mapId(sourceId);
            if (!id || forbiddenKeys.has(sourceId) || forbiddenKeys.has(id) || !allowed.has(id) || Object.keys(result).length >= 512)
                continue;
            const empty = rawMultiplier == null || (typeof rawMultiplier === 'string' && !rawMultiplier.trim());
            const parsed = empty ? NaN : Number(rawMultiplier);
            const bounded = Math.max(1, Math.min(50, Number.isFinite(parsed) ? parsed : 3));
            result[id] = Math.round(bounded * 2) / 2;
        }
        return result;
    };
    settings.favoriteThemeMultipliers = normalizeFavoriteMultipliers(settings.favoriteThemeMultipliers, settings.favoriteThemeIds);
    settings.favoriteFormatMultipliers = normalizeFavoriteMultipliers(settings.favoriteFormatMultipliers, settings.favoriteFormatIds, canonicalFormatSettingId);
    settings.presentationWorldviewLock = settings.presentationWorldviewLock === true;
    settings.rabbitMirrorPresentationModes = normalizePresentationModes(settings.rabbitMirrorPresentationModes);
    settings.rabbitMirrorFaceDrawRules = normalizeFaceDrawRules(settings.rabbitMirrorFaceDrawRules);
    settings.rabbitMirrorFaceDrawPresets = normalizeFaceDrawPresets(settings.rabbitMirrorFaceDrawPresets);
    settings.longTextSource = ['blank', 'text', 'mixed'].includes(settings.longTextSource) ? settings.longTextSource : 'blank';
    const autoPercent = Number(settings.autoLongTextPercent);
    settings.autoLongTextPercent = Number.isFinite(autoPercent) ? Math.max(0, Math.min(100, Math.round(autoPercent))) : 0;
    settings.lotterySource = ['builtin', 'worldbook', 'both'].includes(settings.lotterySource) ? settings.lotterySource : 'builtin';
    const builtinPercent = Number(settings.lotteryBuiltinPercent);
    settings.lotteryBuiltinPercent = Number.isFinite(builtinPercent) ? Math.max(0, Math.min(100, Math.round(builtinPercent))) : 50;
    settings.lotteryEntries = normalizeLotteryEntries(settings.lotteryEntries);
    settings.lotteryBooks = normalizeLotteryBooks(settings.lotteryBooks, settings.lotteryEntries);
    settings.lotteryEntries = settings.lotteryEntries.filter(entry => settings.lotteryBooks.includes(entry.book));
    settings.facePagerPosition = settings.facePagerPosition === 'bottom' ? 'bottom' : 'top';
    settings.animationIdlePause = ['auto', 'on', 'off'].includes(settings.animationIdlePause) ? settings.animationIdlePause : 'auto';
    settings.desktopFaceZoom = settings.desktopFaceZoom !== false;
    {
        const width = Math.round(Number(settings.desktopFaceZoomWidth));
        settings.desktopFaceZoomWidth = Number.isFinite(width) ? Math.min(900, Math.max(400, width)) : 520;
    }
    settings.faceHealthInMenu = settings.faceHealthInMenu === true;
    settings.repairSampleUpload = settings.repairSampleUpload === true;
    settings.updateGuideEnabled = settings.updateGuideEnabled !== false;
    settings.selfInventMode = settings.selfInventMode === true;
    settings.updateGuideSeenVersion = /^(?:fresh|\d{1,3}\.\d{1,4}\.\d{1,4})$/.test(String(settings.updateGuideSeenVersion || '')) ? String(settings.updateGuideSeenVersion) : '';
    settings.writingStyle = typeof settings.writingStyle === 'string' ? settings.writingStyle : '';
    settings.independentReadCharacterWorldBook = settings.independentReadCharacterWorldBook === true;
    for (const key of ['imageLooksLibrary', 'imageLooksCard', 'imageLooksMyriad', 'imageLooksWorldBook', 'imageLooksModel'])
        settings[key] = settings[key] !== false;
    settings.nameMaskRules = normalizeNameMaskRules(settings.nameMaskRules);
    settings.nameMaskRulesByCard = normalizeNameMaskCardRules(settings.nameMaskRulesByCard);
    settings.imageCompositionMode = settings.imageCompositionMode === 'auto' ? 'auto' : 'scene';
    const faceCount = settings.rabbitMirrorFaceCount;
    settings.rabbitMirrorFaceCount = Number.isInteger(faceCount) && faceCount >= 2 && faceCount <= 5 ? faceCount : 1;
    settings.maintenanceRabbitEnabled = !!settings.maintenanceRabbitEnabled;
    settings.maintenanceRabbitAutoSafeConsent = settings.maintenanceRabbitAutoSafeConsent === true;
    settings.maintenanceRabbitAutoSafeEnabled = settings.maintenanceRabbitAutoSafeConsent === true
        && settings.maintenanceRabbitAutoSafeEnabled === true;
    if (!settings.maintenanceRabbitEnabled) {
        settings.maintenanceRabbitAutoSafeEnabled = false;
        settings.maintenanceRabbitAutoSafeConsent = false;
    }
    settings.feedbackCatEnabled = settings.feedbackCatEnabled !== false;
    settings.stripOldMirrorsBeforeSend = settings.stripOldMirrorsBeforeSend !== false;
    settings.noSendRegexAutoConfigured = settings.noSendRegexAutoConfigured === true;
    settings.rabbitMirrorBannedWords = normalizeRabbitMirrorBannedWords(settings.rabbitMirrorBannedWords);
    settings.externalWorldBookRandomEnabled = settings.externalWorldBookRandomEnabled === true;
    settings.externalWorldBookMixMode = ['builtin-only', 'builtin-preferred', 'balanced', 'external-preferred', 'external-only'].includes(settings.externalWorldBookMixMode)
        ? settings.externalWorldBookMixMode
        : 'builtin-only';
    settings.visualSceneryCombination = settings.visualSceneryCombination === true;
    settings.imageEnabled = settings.imageEnabled === true;
    settings.imageLlmEnabled = settings.imageLlmEnabled === true;
    settings.imageBackend = settings.imageBackend === 'chatu8' ? 'chatu8' : 'baibai';
    for (const key of ['imageLlmProfileId', 'imageLlmBaseUrl', 'imageLlmKey', 'imageLlmModel'])
        settings[key] = typeof settings[key] === 'string' ? settings[key] : '';
    settings.imageLlmTemperature = Number.isFinite(Number(settings.imageLlmTemperature)) ? Math.min(2, Math.max(0, Number(settings.imageLlmTemperature))) : 0.8;
    settings.imageLlmMaxTokens = Number(settings.imageLlmMaxTokens) > 0 ? Math.min(64000, Math.round(Number(settings.imageLlmMaxTokens))) : 4096;
    settings.builtinImageEnabled = settings.builtinImageEnabled === true;
    settings.materialTextureEnabled = settings.materialTextureEnabled === true;
    settings.webFontsEnabled = settings.webFontsEnabled !== false;
    settings.collectionTasteEnabled = settings.collectionTasteEnabled !== false;
    settings.imagePromptFormat = settings.imagePromptFormat === 'nai45-tags' ? 'nai45-tags' : 'nai5-natural';
    settings.visualPromptEditingEnabled = !!settings.visualPromptEditingEnabled;
    settings.appearanceReferenceEnabled = settings.appearanceReferenceEnabled === true;
    settings.appearanceReferenceRevision = /^[a-z\d-]{8,80}$/i.test(String(settings.appearanceReferenceRevision || '')) ? String(settings.appearanceReferenceRevision) : '';
    const normalizeVisualSetting = (value, fallback, maxChars) => {
        const raw = typeof value === 'string' ? value : String(value ?? fallback);
        if (raw.length <= maxChars && raw.indexOf('\r') < 0)
            return raw;
        return raw.replace(/\r\n?/g, '\n').slice(0, maxChars);
    };
    settings.visualPrompt = normalizeVisualSetting(settings.visualPrompt, DEFAULT_VISUAL_PROMPT, VISUAL_PROMPT_MAX_CHARS);
    if (settings.visualPrompt === PREVIOUS_82_DEFAULT_VISUAL_PROMPT || settings.visualPrompt === SUPERSEDED_DEFAULT_VISUAL_PROMPT || settings.visualPrompt === PREVIOUS_DEFAULT_VISUAL_PROMPT)
        settings.visualPrompt = DEFAULT_VISUAL_PROMPT;
    settings.visualExtraPrompt = normalizeVisualSetting(settings.visualExtraPrompt, '', VISUAL_EXTRA_PROMPT_MAX_CHARS);
    settings.visualAvoidPrompt = normalizeVisualSetting(settings.visualAvoidPrompt, '', VISUAL_AVOID_PROMPT_MAX_CHARS);
    delete settings.plainTextRescueMode;
    delete settings.codeBlockRescueMode;
    delete settings.interactionRescueMode;
    if (!['classic', 'format_only'].includes(settings.samplingMode))
        settings.samplingMode = defaultSettings.samplingMode;
    settings.singlePairSampling = settings.singlePairSampling === true;
    if (!['random', 'atmosphere'].includes(settings.lotteryMethod))
        settings.lotteryMethod = defaultSettings.lotteryMethod;
    const storyPercent = Number(settings.atmosphereStoryPercent);
    settings.atmosphereStoryPercent = Number.isFinite(storyPercent) ? Math.max(0, Math.min(100, Math.round(storyPercent))) : defaultSettings.atmosphereStoryPercent;
    if (!['single', 'serial'].includes(settings.multifaceDispatch))
        settings.multifaceDispatch = defaultSettings.multifaceDispatch;
    if (!['compact', 'balanced', 'full'].includes(settings.rawPolicy))
        settings.rawPolicy = defaultSettings.rawPolicy;
    if (!Array.isArray(settings.memoryProviderIds))
        settings.memoryProviderIds = [];
    settings.memoryProviderIds = settings.memoryProviderIds.map(value => {
        const id = String(value || '');
        return id === 'baibai-book' ? 'global:STBaiBaiBook' : id;
    });
    settings.memoryProviderIds = [...new Set(settings.memoryProviderIds.filter(Boolean))].slice(0, 12);
    settings.memoryScanEnabled = !!settings.memoryScanEnabled;
    settings.memoryWorldBookEnabled = settings.memoryWorldBookEnabled === true;
    settings.memoryWorldBookId = normalizeMemoryWorldBookSettingId(settings.memoryWorldBookId);
    settings.memoryMaxChars = Math.max(600, Math.min(6000, Number(settings.memoryMaxChars) || defaultSettings.memoryMaxChars));
    settings.richFormatBias = false;
    settings.depth = Number(settings.depth) || 0;
    return settings;
}
export function syncExternalReferenceVisibility(settings) {
    const root = globalThis.document?.documentElement;
    if (!root?.setAttribute)
        return;
    const value = settings?.externalWorldBookRandomEnabled === true ? 'true' : 'false';
    if (root.getAttribute('data-rabbit-mirror-external-sampling-enabled') !== value) {
        root.setAttribute('data-rabbit-mirror-external-sampling-enabled', value);
    }
}
export const SOURCE_PROFILE_KEYS = Object.freeze([
    'rabbitMirrorFaceCount', 'rabbitMirrorPresentationModes', 'samplingMode', 'rawPolicy', 'creativeExpansionMode',
    'forceVisualScenery', 'visualSceneryCombination', 'darkVisualMode', 'visualToneMode', 'userDirectivePriority', 'presentationWorldviewLock',
    'visualPromptEditingEnabled', 'builtinImageEnabled', 'imagePromptFormat', 'materialTextureEnabled', 'webFontsEnabled', 'memoryScanEnabled',
]);
function sourceProfileSnapshot(settings) {
    const snapshot = {};
    for (const key of SOURCE_PROFILE_KEYS) {
        try {
            snapshot[key] = JSON.parse(JSON.stringify(settings?.[key] ?? null));
        }
        catch {
            snapshot[key] = null;
        }
    }
    return snapshot;
}
export function sourceProfileLabel(source) {
    return source === 'independent' ? __rmT("TBxxQLFyeH2rBMsq") : __rmT("iy43SwS2AdUe008676D");
}
export function updateSettings(patch) {
    const settings = getSettings();
    const safePatch = patch && typeof patch === 'object' ? { ...patch } : {};
    if (Object.prototype.hasOwnProperty.call(safePatch, 'sourceProfilesEnabled')) {
        safePatch.sourceProfilesEnabled = safePatch.sourceProfilesEnabled === true;
        if (safePatch.sourceProfilesEnabled && settings.sourceProfilesEnabled !== true) {
            safePatch.sourceProfiles = { follow: sourceProfileSnapshot(settings), independent: sourceProfileSnapshot(settings) };
        }
        else if (!safePatch.sourceProfilesEnabled) {
            safePatch.sourceProfiles = null;
        }
    }
    const sourceChange = Object.prototype.hasOwnProperty.call(safePatch, 'generationSource')
        && (safePatch.generationSource === 'independent' ? 'independent' : 'follow') !== (settings.generationSource === 'independent' ? 'independent' : 'follow');
    if (sourceChange && (safePatch.sourceProfilesEnabled ?? settings.sourceProfilesEnabled) === true) {
        const from = settings.generationSource === 'independent' ? 'independent' : 'follow';
        const to = from === 'follow' ? 'independent' : 'follow';
        const profiles = { ...(settings.sourceProfiles && typeof settings.sourceProfiles === 'object' ? settings.sourceProfiles : {}) };
        profiles[from] = sourceProfileSnapshot(settings);
        const target = profiles[to] && typeof profiles[to] === 'object' ? profiles[to] : null;
        if (target) {
            for (const key of SOURCE_PROFILE_KEYS) {
                if (!Object.prototype.hasOwnProperty.call(safePatch, key) && Object.prototype.hasOwnProperty.call(target, key))
                    safePatch[key] = target[key];
            }
        }
        safePatch.sourceProfiles = profiles;
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'visualDesignMode'))
        safePatch.visualDesignMode = 'guided1553';
    if (Object.prototype.hasOwnProperty.call(safePatch, 'visualToneMode')) {
        safePatch.visualToneMode = VISUAL_TONE_MODES.includes(safePatch.visualToneMode) ? safePatch.visualToneMode : 'normal';
        safePatch.darkVisualMode = safePatch.visualToneMode === 'dark';
    }
    else if (Object.prototype.hasOwnProperty.call(safePatch, 'darkVisualMode')) {
        safePatch.darkVisualMode = safePatch.darkVisualMode === true;
        safePatch.visualToneMode = safePatch.darkVisualMode ? 'dark' : (settings.visualToneMode === 'dark' ? 'normal' : settings.visualToneMode);
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'independentGenerationTiming')) {
        safePatch.independentGenerationTiming = independentGenerationTiming({ ...settings, ...safePatch });
    }
    if ((safePatch.generationSource ?? settings.generationSource) === 'independent'
        && (Object.prototype.hasOwnProperty.call(safePatch, 'independentGenerationTiming') || safePatch.generationSource === 'independent')) {
        const timing = independentGenerationTiming({ ...settings, ...safePatch });
        const enabled = timing !== 'off';
        const previousMode = safePatch.mode ?? settings.mode;
        safePatch.enabled = enabled;
        safePatch.autoRabbitMirrorInjection = enabled;
        safePatch.mode = enabled ? (previousMode === 'off' ? 'integrated' : previousMode) : 'off';
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'memoryWorldBookEnabled'))
        safePatch.memoryWorldBookEnabled = safePatch.memoryWorldBookEnabled === true;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'memoryWorldBookId'))
        safePatch.memoryWorldBookId = normalizeMemoryWorldBookSettingId(safePatch.memoryWorldBookId);
    if (Object.prototype.hasOwnProperty.call(safePatch, 'independentEarlyBodyEnabled'))
        safePatch.independentEarlyBodyEnabled = safePatch.independentEarlyBodyEnabled === true;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'independentEarlyBodyTags'))
        safePatch.independentEarlyBodyTags = normalizeIndependentEarlyBodyTags(safePatch.independentEarlyBodyTags);
    if (Object.prototype.hasOwnProperty.call(safePatch, 'independentEarlyBodyChatKey'))
        safePatch.independentEarlyBodyChatKey = String(safePatch.independentEarlyBodyChatKey || '').slice(0, 2048);
    if (Object.prototype.hasOwnProperty.call(safePatch, 'automaticRerollEnabled')) {
        safePatch.automaticRerollEnabled = safePatch.automaticRerollEnabled !== false;
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'independentAutomaticRerollMax')) {
        safePatch.independentAutomaticRerollMax = normalizeAutomaticRerollMax(safePatch.independentAutomaticRerollMax);
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'independentAutomaticRerollIdleSeconds')) {
        safePatch.independentAutomaticRerollIdleSeconds = normalizeAutomaticRerollIdleSeconds(safePatch.independentAutomaticRerollIdleSeconds);
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'missingShellScanRange')) {
        safePatch.missingShellScanRange = normalizeMissingShellScanRange(safePatch.missingShellScanRange);
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'behaviorRuleMode'))
        safePatch.behaviorRuleMode = ['always', 'off', 'adult-only'].includes(safePatch.behaviorRuleMode) ? safePatch.behaviorRuleMode : 'always';
    if (Object.prototype.hasOwnProperty.call(safePatch, 'behaviorRuleText'))
        safePatch.behaviorRuleText = safePatch.behaviorRuleText == null ? null : String(safePatch.behaviorRuleText).replace(/\u0000/g, '').slice(0, 20000);
    if (Object.prototype.hasOwnProperty.call(safePatch, 'independentContextExcludedTags')) {
        safePatch.independentContextExcludedTags = normalizeIndependentContextExcludedTags(safePatch.independentContextExcludedTags);
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'followTagIsolationEnabled')) {
        safePatch.followTagIsolationEnabled = safePatch.followTagIsolationEnabled === true;
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'rabbitMirrorBannedWords')) {
        safePatch.rabbitMirrorBannedWords = normalizeRabbitMirrorBannedWords(safePatch.rabbitMirrorBannedWords);
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'externalWorldBookRandomEnabled')) {
        safePatch.externalWorldBookRandomEnabled = safePatch.externalWorldBookRandomEnabled === true;
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'externalWorldBookMixMode')) {
        safePatch.externalWorldBookMixMode = ['builtin-only', 'builtin-preferred', 'balanced', 'external-preferred', 'external-only'].includes(safePatch.externalWorldBookMixMode)
            ? safePatch.externalWorldBookMixMode
            : 'builtin-only';
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'imageEnabled'))
        safePatch.imageEnabled = safePatch.imageEnabled === true;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'builtinImageEnabled'))
        safePatch.builtinImageEnabled = safePatch.builtinImageEnabled === true;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'materialTextureEnabled'))
        safePatch.materialTextureEnabled = safePatch.materialTextureEnabled === true;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'webFontsEnabled'))
        safePatch.webFontsEnabled = safePatch.webFontsEnabled !== false;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'desktopFaceZoom'))
        safePatch.desktopFaceZoom = safePatch.desktopFaceZoom !== false;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'desktopFaceZoomWidth')) {
        const width = Math.round(Number(safePatch.desktopFaceZoomWidth));
        safePatch.desktopFaceZoomWidth = Number.isFinite(width) ? Math.min(900, Math.max(400, width)) : 520;
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'faceHealthInMenu'))
        safePatch.faceHealthInMenu = safePatch.faceHealthInMenu === true;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'repairSampleUpload'))
        safePatch.repairSampleUpload = safePatch.repairSampleUpload === true;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'updateGuideEnabled'))
        safePatch.updateGuideEnabled = safePatch.updateGuideEnabled !== false;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'selfInventMode'))
        safePatch.selfInventMode = safePatch.selfInventMode === true;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'updateGuideSeenVersion'))
        safePatch.updateGuideSeenVersion = /^(?:fresh|\d{1,3}\.\d{1,4}\.\d{1,4})$/.test(String(safePatch.updateGuideSeenVersion || '')) ? String(safePatch.updateGuideSeenVersion) : '';
    if (Object.prototype.hasOwnProperty.call(safePatch, 'collectionTasteEnabled'))
        safePatch.collectionTasteEnabled = safePatch.collectionTasteEnabled !== false;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'longTextSource'))
        safePatch.longTextSource = ['blank', 'text', 'mixed'].includes(safePatch.longTextSource) ? safePatch.longTextSource : 'blank';
    if (Object.prototype.hasOwnProperty.call(safePatch, 'autoLongTextPercent')) {
        const autoPercent = Number(safePatch.autoLongTextPercent);
        safePatch.autoLongTextPercent = Number.isFinite(autoPercent) ? Math.max(0, Math.min(100, Math.round(autoPercent))) : 0;
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'lotterySource'))
        safePatch.lotterySource = ['builtin', 'worldbook', 'both'].includes(safePatch.lotterySource) ? safePatch.lotterySource : 'builtin';
    if (Object.prototype.hasOwnProperty.call(safePatch, 'lotteryBuiltinPercent')) {
        const builtinPercent = Number(safePatch.lotteryBuiltinPercent);
        safePatch.lotteryBuiltinPercent = Number.isFinite(builtinPercent) ? Math.max(0, Math.min(100, Math.round(builtinPercent))) : 50;
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'lotteryBooks'))
        safePatch.lotteryBooks = normalizeLotteryBooks(safePatch.lotteryBooks, []);
    if (Object.prototype.hasOwnProperty.call(safePatch, 'lotteryEntries'))
        safePatch.lotteryEntries = normalizeLotteryEntries(safePatch.lotteryEntries);
    if (Object.prototype.hasOwnProperty.call(safePatch, 'facePagerPosition'))
        safePatch.facePagerPosition = safePatch.facePagerPosition === 'bottom' ? 'bottom' : 'top';
    if (Object.prototype.hasOwnProperty.call(safePatch, 'animationIdlePause'))
        safePatch.animationIdlePause = ['auto', 'on', 'off'].includes(safePatch.animationIdlePause) ? safePatch.animationIdlePause : 'auto';
    if (Object.prototype.hasOwnProperty.call(safePatch, 'writingStyle'))
        safePatch.writingStyle = typeof safePatch.writingStyle === 'string' ? safePatch.writingStyle : '';
    if (Object.prototype.hasOwnProperty.call(safePatch, 'independentReadCharacterWorldBook'))
        safePatch.independentReadCharacterWorldBook = safePatch.independentReadCharacterWorldBook === true;
    for (const key of ['imageLooksLibrary', 'imageLooksCard', 'imageLooksMyriad', 'imageLooksWorldBook', 'imageLooksModel']) {
        if (Object.prototype.hasOwnProperty.call(safePatch, key))
            safePatch[key] = safePatch[key] !== false;
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'independentExternalAnchor'))
        safePatch.independentExternalAnchorDefaultV2 = true;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'imageCompositionMode'))
        safePatch.imageCompositionMode = safePatch.imageCompositionMode === 'auto' ? 'auto' : 'scene';
    if (Object.prototype.hasOwnProperty.call(safePatch, 'imagePromptFormat'))
        safePatch.imagePromptFormat = safePatch.imagePromptFormat === 'nai45-tags' ? 'nai45-tags' : 'nai5-natural';
    if (Object.prototype.hasOwnProperty.call(safePatch, 'visualSceneryCombination')) {
        safePatch.visualSceneryCombination = safePatch.visualSceneryCombination === true;
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'appearanceReferenceEnabled'))
        safePatch.appearanceReferenceEnabled = safePatch.appearanceReferenceEnabled === true;
    if (Object.prototype.hasOwnProperty.call(safePatch, 'appearanceReferenceRevision'))
        safePatch.appearanceReferenceRevision = /^[a-z\d-]{8,80}$/i.test(String(safePatch.appearanceReferenceRevision || '')) ? String(safePatch.appearanceReferenceRevision) : '';
    if (Object.prototype.hasOwnProperty.call(safePatch, 'rabbitMirrorPresentationModes')) {
        safePatch.rabbitMirrorPresentationModes = normalizePresentationModes(safePatch.rabbitMirrorPresentationModes);
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'rabbitMirrorFaceDrawRules'))
        safePatch.rabbitMirrorFaceDrawRules = normalizeFaceDrawRules(safePatch.rabbitMirrorFaceDrawRules);
    if (Object.prototype.hasOwnProperty.call(safePatch, 'rabbitMirrorFaceDrawPresets'))
        safePatch.rabbitMirrorFaceDrawPresets = normalizeFaceDrawPresets(safePatch.rabbitMirrorFaceDrawPresets);
    if (Object.prototype.hasOwnProperty.call(safePatch, 'rabbitMirrorFaceCount')) {
        const faceCount = safePatch.rabbitMirrorFaceCount;
        safePatch.rabbitMirrorFaceCount = Number.isInteger(faceCount) && faceCount >= 2 && faceCount <= 5 ? faceCount : 1;
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'multifaceDispatch')) {
        safePatch.multifaceDispatch = safePatch.multifaceDispatch === 'serial' ? 'serial' : 'single';
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'lotteryMethod')) {
        safePatch.lotteryMethod = safePatch.lotteryMethod === 'atmosphere' ? 'atmosphere' : 'random';
    }
    if (Object.prototype.hasOwnProperty.call(safePatch, 'atmosphereStoryPercent')) {
        const storyPercent = Number(safePatch.atmosphereStoryPercent);
        safePatch.atmosphereStoryPercent = Number.isFinite(storyPercent) ? Math.max(0, Math.min(100, Math.round(storyPercent))) : 70;
    }
    for (const key of ['independentReadCharacterCardSummary', 'independentReadPersonaSummary']) {
        if (Object.prototype.hasOwnProperty.call(safePatch, key))
            safePatch[key] = safePatch[key] !== false;
    }
    const keys = Object.keys(safePatch).slice(0, 24);
    const changedKeys = keys.filter(key => {
        try {
            return JSON.stringify(settings?.[key]) !== JSON.stringify(safePatch[key]);
        }
        catch {
            return settings?.[key] !== safePatch[key];
        }
    });
    globalThis.__rabbitMirrorPerfDiag?.mark?.('settings.update', {
        keys: keys.join(','),
        changedKeys: changedKeys.join(','),
        changedCount: changedKeys.length,
    });
    Object.assign(settings, safePatch);
    if (Object.prototype.hasOwnProperty.call(safePatch, 'externalWorldBookRandomEnabled'))
        syncExternalReferenceVisibility(settings);
    if (String(settings.independentConnectionProfileId || '').trim())
        settings.independentApiKey = '';
    globalThis.__rabbitMirrorPerfDiag?.mark?.('settings.saveScheduled', { source: 'updateSettings', keys: keys.join(',') });
    saveSettingsDebounced();
}
export function resetSettings() {
    extension_settings[MODULE_NAME] = cloneDefaultSettings();
    syncExternalReferenceVisibility(extension_settings[MODULE_NAME]);
    saveSettingsDebounced();
}
export async function resetSettingsAndSaveNow() {
    resetSettings();
    try {
        const host = await import('../../../../../script.js');
        if (typeof host?.saveSettings === 'function') {
            await host.saveSettings();
            return true;
        }
    }
    catch { }
    await new Promise(resolve => setTimeout(resolve, 1800));
    return true;
}
export async function saveSettingsNowAndVerify(check = () => true) {
    let host = null;
    try {
        host = await import('../../../../../script.js');
    }
    catch {
        host = null;
    }
    try {
        if (typeof host?.saveSettings !== 'function')
            return { ok: false, reason: __rmT("BbzPUmKJleCZpN8LDvmzUGnUHXC") };
        await host.saveSettings();
    }
    catch (error) {
        return { ok: false, reason: `${__rmT("6vM7svu3rCFStf")}${String(error?.message || error).slice(0, 80)}` };
    }
    let last = { ok: false, reason: '' };
    for (let attempt = 0; attempt < 3; attempt += 1) {
        if (attempt)
            await new Promise(resolve => setTimeout(resolve, 1500));
        last = await readBackSettings(host, check);
        if (last.ok)
            return last;
    }
    return last;
}
async function readBackSettings(host, check) {
    try {
        const ctx = globalThis.SillyTavern?.getContext?.();
        const headers = new Headers(typeof ctx?.getRequestHeaders === 'function' ? await ctx.getRequestHeaders() : (typeof host?.getRequestHeaders === 'function' ? host.getRequestHeaders() : {}));
        headers.set('Content-Type', 'application/json');
        const response = await fetch('/api/settings/get', { method: 'POST', credentials: 'same-origin', headers, body: '{}' });
        if (!response.ok)
            return { ok: false, reason: `${__rmT("u7U80mFI7CLy3aQhwVjUxBvXjFs")}${response.status}` };
        const payload = await response.json();
        const saved = typeof payload?.settings === 'string' ? JSON.parse(payload.settings) : payload?.settings;
        const mine = saved?.extension_settings?.[MODULE_NAME];
        return check(mine || {}) ? { ok: true, reason: '' } : { ok: false, reason: __rmT("Myxht2v_MtY6DBNtU.7QXs_2dghFDiiEr6IQqYf_") };
    }
    catch (error) {
        return { ok: false, reason: `${__rmT("ntMjAvu3rCFStf")}${String(error?.message || error).slice(0, 80)}` };
    }
}
