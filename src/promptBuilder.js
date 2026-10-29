import { rmT as __rmT, rmTpl as __rmTpl, rmR as __rmR } from "./textTable.js?rmv=2.0.0";
import { INTERACTION_SAMPLING_RULE, designCandidatePick, drawDesignCandidate } from './interactionSampling.js?rmv=2.0.0';
import { isDocumentFormat, looksLikeDocument } from './documentFormats.js?rmv=2.0.0';
import { driverContractLines, drawDriverOffer, interactionMethodNames, matchDriversToUsages, normalizeDriverOffer, isObjectDriver, OFFER_LIMITS_187 } from './interactionMethods.js?rmv=2.0.0';
import { drawUsageOffer, normalizeUsageOffer, relatedUsagesForCombo, signatureUsageForCombo } from './interactionUsageOffer.js?rmv=2.0.0';
import { drawContinuation, normalizeContinuation } from './continuationCache.js?rmv=2.0.0';
import { recentInteractionMethods, recentDesignPicks, recentFollowPicks, rememberFollowPicks, recentArtDirections } from './interactionMethodLedger.js?rmv=2.0.0';
import { gameplayRuleFor } from './gameplayRules.js?rmv=2.0.0';
import { usesModelOriginalColors, withoutPaletteRecipe, GUIDED_VISUAL_FLOOR, COMMON_VISUAL_DRAWING } from './visualDesign.js?rmv=2.0.0';
import { getRecentDiversityHistory, parseVisualFamilySkeleton, visualFamilyForCooldown } from './storage.js?rmv=2.0.0';
import { attachPaletteRecipes, paletteRecipeFor, observedPaletteFamilyLabels } from './paletteRecipes.js?rmv=2.0.0';
import { isNearWhitePalette, isNearWhiteContentSurface } from './paletteObservation.js?rmv=2.0.0';
import { observedOperationFamiliesFor, observedMechanismsFor } from './compositionFingerprint.js?rmv=2.0.0';
import { TAROT_IMAGE_RULES } from '../data/raw/tarotImageRules.js?rmv=2.0.0';
import { expandShuffledOptions } from '../data/raw/rawSegmentLookup.js?rmv=2.0.0';
import { TOUCH_THEATER_RULES } from '../data/raw/touchTheaterRules.js?rmv=2.0.0';
import { buildBehaviorRuleBlock } from './behaviorRules.js?rmv=2.0.0';
import { buildBatchInteractionDiversityRule } from './batchInteractionDiversity.js?rmv=2.0.0';
import { VISUAL_SCENERY_CONSTRUCTION_RULES, VISUAL_SCENERY_MOTION_RULES, VISUAL_SCENERY_EXPRESSION_RULE, VISUAL_SCENERY_VS_GUIDANCE, VISUAL_SCENERY_SUBJECT_BY_PICK } from '../data/raw/visualSceneryRules.js?rmv=2.0.0';
import { DYNAMIC_VISUAL_RULES } from '../data/raw/dynamicVisualRules.js?rmv=2.0.0';
import { buildPureOrderSelection, pickCombination, pickCombinationBatch, pickCombinationForMultifaceResay } from './picker.js?rmv=2.0.0';
import { getComboHistory, getActivePaletteCooldown, retargetSingleAttemptFormat } from './storage.js?rmv=2.0.0';
import { strongVisualDiversityRule, darkVisualGenerationRule, softLightVisualGenerationRule, visualDiversityExecutionLock, recentPaletteExecutionReminder, recentPaletteHueFamilies, describeHueFamilies } from './visualDiversityPolicy.js?rmv=2.0.0';
import { withoutInteractionRecipe, observedInteractionRecipesFor } from './interactionRecipes.js?rmv=2.0.0';
import { selectGenerationPalettes, buildGenerationPaletteRule, buildPostGenerationColorRule } from './generationPalettes.js?rmv=2.0.0';
import { materialTextureRule } from './materialTexture.js?rmv=2.0.0';
import { webFontRule } from './webFonts.js?rmv=2.0.0';
import { buildPaletteCooldownRule, buildPaletteCooldownExecutionLock } from './paletteCooldown.js?rmv=2.0.0';
import { assignFaceHueFamilies, hueFamilyInstruction, userDirectsColor, HUE_FAMILY_NAMES } from './paletteAssignment.js?rmv=2.0.0';
import { readSelectedMemoryForPrompt } from './memoryScanner.js?rmv=2.0.0';
export { prepareSelectedMemoryForPrompt, memoryRequestSettingsKey, assertMemoryRequestSettings } from './memoryScanner.js?rmv=2.0.0';
import { resolveRawForItem, resolveRawSnippetForItem } from '../data/raw/rawSegmentLookup.js?rmv=2.0.0';
import { externalSummaryForSending } from './externalWorldBook/summary.js?rmv=2.0.0';
import { isTextPresentation, presentationModeFields, visualSceneryEnabled } from './presentationMode.js?rmv=2.0.0';
import { faceDrawMetadataFields } from './faceDrawRules.js?rmv=2.0.0';
import { DEFAULT_VISUAL_COLOR_RULES, DEFAULT_VISUAL_PROMPT, VISUAL_AVOID_PROMPT_MAX_CHARS, VISUAL_EXTRA_PROMPT_MAX_CHARS, VISUAL_PROMPT_MAX_CHARS, normalizeIndependentContextExcludedTags } from './settings.js?rmv=2.0.0';
import { THEMATIC_CATEGORIES } from '../data/structured/thematicIndex.js?rmv=2.0.0';
import { PRESENTATION_FORMATS } from '../data/structured/presentationIndex.js?rmv=2.0.0';
import { rabbitMirrorAvatarPromptRule } from './chatAvatars.js?rmv=2.0.0';
const THEME_ITEMS = new Map(THEMATIC_CATEGORIES.map(item => [item.id, item]));
const FORMAT_ITEMS = new Map(PRESENTATION_FORMATS.map(item => [item.id, item]));
function hasAtmosphereMenu(combo) {
    return Array.isArray(combo?.atmosphereMenu) && combo.atmosphereMenu.length > 1;
}
function asText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}
function truncate(text, max = 220) {
    const raw = asText(text);
    if (!raw || raw.length <= max)
        return raw;
    return `${raw.slice(0, Math.max(20, max - 1)).trim()}…`;
}
const RAW_POLICY_PROFILES = Object.freeze({
    compact: Object.freeze({ summaryMax: 170, themeTotal: 0, themeItem: 0, presentationTotal: 0, presentationItem: 0 }),
    balanced: Object.freeze({ summaryMax: 170, themeTotal: 360, themeItem: 180, presentationTotal: 540, presentationItem: 360 }),
    full: Object.freeze({ summaryMax: Infinity, themeTotal: Infinity, themeItem: Infinity, presentationTotal: Infinity, presentationItem: Infinity, complete: true }),
});
function normalizedRawPolicy(value) {
    return Object.prototype.hasOwnProperty.call(RAW_POLICY_PROFILES, value) ? value : 'balanced';
}
function rawPolicyProfile(value) {
    return RAW_POLICY_PROFILES[normalizedRawPolicy(value)];
}
const EXTERNAL_REFERENCE_RULE = __rmT("2SPmNLSHXTDl34pXSpsylcWQI8dH59_qPniNT7sOZ91hHW208dlZ_nJR7HCRtBbjWlI4ZFdHg28PcZ847eBooedDk2oWiQP0cnHcxZWC46uNBtHxna1hew5gBAQXJBfiAjFm19U6jSmiTmvTZGylJQ5sTCJr0Ircr6Pq6hs2e7vmKt.C0PWm2AmRmilWLWB5yKRh7HVMvj3zhCLR23GKfshT");
function isExternalItem(item) {
    return typeof item?.id === 'string' && item.id.startsWith('ext:');
}
function externalMaterialError(code) {
    const error = new Error(code === 'RABBIT_MIRROR_EXTERNAL_MATERIAL_MISSING'
        ? __rmT("RmPf.ZgTR6WAzLLDb9SYhExJSTLYnLYpEQK97kuU82bLNGQjxcLnnmahef7MXX0k4zcjklQS3aCPCA_Rr7H10mGbJMpcxf") : __rmT("9oMblppm1VzgeF_qIWq88qL2aKdcZwjf0J83iOeXL4zeGhd09iDjVhNtrf.a1BlKZ.VY3h"));
    error.code = code;
    return error;
}
function externalReferenceText(value, maxChars) {
    const limit = Math.max(0, Math.floor(Number(maxChars) || 0));
    if (typeof value !== 'string' || !limit)
        return '';
    const text = asText(value.slice(0, limit * 4)
        .replace(/[<>&{}\[\]`]/g, char => ({ '<': __rmT("fis"), '>': __rmT("fys"), '&': __rmT("Lys"), '{': __rmT("Ios"), '}': __rmT("kXs"), '[': __rmT("uos"), ']': __rmT("BXs"), '`': __rmT("1is") })[char])
        .replace(/\bdata-/gi, 'data·'));
    return text.length > limit ? `${text.slice(0, limit - 1).trim()}…` : text;
}
function externalRecordFor(item, kind, externalRawMap) {
    const id = item?.id;
    if (typeof id !== 'string' || id.length > 2048 || !/^ext:[A-Za-z0-9:._!~*'()-]+$/.test(id)) {
        throw externalMaterialError('RABBIT_MIRROR_EXTERNAL_MATERIAL_INVALID');
    }
    if (!(externalRawMap instanceof Map) || !externalRawMap.has(id)) {
        throw externalMaterialError('RABBIT_MIRROR_EXTERNAL_MATERIAL_MISSING');
    }
    const record = externalRawMap.get(id);
    const classification = kind === 'text' ? 'text' : kind === 'presentation' ? 'format' : 'theme';
    if (!record || record.externalId !== id || record.classification !== classification ||
        record.enabled !== true || record.userConfirmed !== true || typeof record.rawContent !== 'string' || !record.rawContent.trim()) {
        throw externalMaterialError('RABBIT_MIRROR_EXTERNAL_MATERIAL_INVALID');
    }
    return record;
}
function externalDescriptor(item, kind, externalRawMap, summaryMax = 210) {
    const record = externalRecordFor(item, kind, externalRawMap);
    const title = externalReferenceText(record.localTitle, 160);
    if (!title)
        throw externalMaterialError('RABBIT_MIRROR_EXTERNAL_MATERIAL_INVALID');
    return {
        id: item.id, title,
        summary: externalReferenceText(externalSummaryForSending(record, summaryMax), 210),
        tags: (Array.isArray(record.sourceKeywords) ? record.sourceKeywords : [])
            .slice(0, 4).map(tag => externalReferenceText(tag, 64)).filter(Boolean),
        externalKind: kind === 'text' ? 'text' : kind === 'presentation' ? 'format' : 'theme',
        sourceWorldBookName: String(record.sourceWorldBookName || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200),
    };
}
function externalRawSnippet(item, kind, allowance, externalRawMap) {
    const record = externalRecordFor(item, kind, externalRawMap);
    const snippet = externalReferenceText(record.rawContent, allowance);
    return snippet === item.summary ? '' : snippet;
}
function fullTextMaterial(item, externalRawMap, kind = 'text') {
    const record = externalRecordFor(item, kind, externalRawMap);
    return record.rawContent.replace(/[<>&{}\[\]`]/g, char => ({ '<': __rmT("fis"), '>': __rmT("fys"), '&': __rmT("Lys"), '{': __rmT("Ios"), '}': __rmT("kXs"), '[': __rmT("uos"), ']': __rmT("BXs"), '`': __rmT("1is") })[char])
        .replace(/\bdata-/gi, 'data·');
}
function compactItemLine(item, kind, summaryMax = 170, rawSnippet = '', index = 0, textPresentation = false, longText = false, gameplayEnabled = true) {
    const id = item?.id || '?';
    const title = item?.title || __rmT("cyZtO1kw");
    const tags = Array.isArray(item?.tags) && item.tags.length ? `${__rmT("bQDd1JgeULUW0Uf6gPD")}${item.tags.slice(0, 4).join(',')}` : '';
    const summary = item?.summary || item?.raw || '';
    const note = longText ? __rmT("QjFG8Bw0hASml9U6GbXhKNGU9T3yuV6vse96.2jXrEumDQ0bcDq1oWsnGEQNInaYeg8tW_SgCjsLf7axeW9G3kXr96SQT77x19yItCw9") : kind === 'text' ? __rmT("z_Bpxw2jxJjBHcP3IxD2LRE6Sxu1srYGlwJh1RzDg3zNBmTBKidi9eNmQj.FU0prJVxJbZev581EBmEASgl5dvIxuJSmjjD2quVRsmSuZryo.k") : textPresentation && kind === 'presentation' ? __rmT("xjL_5WZcVqFKdrd_xgih1zid7JwCmA7r5Ak2Che96dJK1oMTa.erF4buG15C_vfKX7F2V._0pzYueZULI7k9H2NIPQWl4aBDMcfAIS9lh_aRncJrsHnOmN7JHlq9yx72OkiOvT") : kind === 'presentation'
        ? index === 0
            ? __rmT("FiYNvgycIjDyHHdo.F2ZzJKH3R2291IqGjQjHACS.LUXhMC1drvinNbG6Oj_eudtkqimyJlZMIq6vViUqAk") : __rmT("elJioaipaPtZhGbJD4v2e0RlNRGFNc2eGcBUICnmSbG_CPSp_5nSUkjY6_ibEfnNwpvMlIlTGjMAwmO4byatLfyeT80HQMR78sccCuUL_qzk39zwELyyuUAP.4M9cUQer6A")
        : __rmT("N9oJZcA6uL3ZQS5Jl.BIRXhf7aY8cDoXLgcZtzDTKeG76CW0f4dYdCBLORGjbQyoxnuQBVl3Jr2GYDqXBFSwcaGSkfUfnY8RANA");
    const supplement = rawSnippet ? `${__rmT("NyXGACvS.gaOVKe7TM1_Lk")}${rawSnippet}` : '';
    const gameplay = gameplayEnabled && kind === 'presentation' && !textPresentation && !longText ? gameplayRuleFor(item) : '';
    return `${__rmT("A8tZArcg")}${id} ${title}${__rmT("nvk")}${summary ? `${__rmT("7ys")}${truncate(summary, summaryMax)}` : ''}${tags}${note}${supplement}${gameplay ? `\n  ${gameplay}` : ''}`;
}
function formatItemsWithRawPolicy(items, kind, rawPolicy, externalRawMap = null, textPresentation = false, preserveOriginal = false, gameplayEnabled = true) {
    if (!Array.isArray(items) || !items.length)
        return { text: __rmT("A8tZAQAo"), retrievedChars: 0, retrievedItems: 0 };
    const profile = rawPolicyProfile(rawPolicy);
    let remaining = kind === 'presentation' || kind === 'text' ? profile.presentationTotal : profile.themeTotal;
    const perItem = kind === 'presentation' || kind === 'text' ? profile.presentationItem : profile.themeItem;
    let retrievedChars = 0;
    let retrievedItems = 0;
    const lines = items.map((item, index) => {
        const allowance = Math.max(0, Math.min(perItem, remaining));
        const rawSnippet = preserveOriginal ? (isExternalItem(item) ? fullTextMaterial(item, externalRawMap, kind) : resolveRawForItem(item, kind) || item.raw || item.summary || '')
            : kind === 'text' ? fullTextMaterial(item, externalRawMap)
                : profile.complete ? isExternalItem(item) ? fullTextMaterial(item, externalRawMap, kind) : resolveRawSnippetForItem(item, kind, Infinity)
                    : item?.fullRaw === true && !isExternalItem(item) ? resolveRawSnippetForItem(item, kind, Infinity)
                        : allowance > 0
                            ? isExternalItem(item) ? externalRawSnippet(item, kind, allowance, externalRawMap) : resolveRawSnippetForItem(item, kind, allowance)
                            : '';
        if (rawSnippet) {
            remaining -= rawSnippet.length;
            retrievedChars += rawSnippet.length;
            retrievedItems += 1;
        }
        return compactItemLine(item, kind, profile.summaryMax, rawSnippet, index, textPresentation, preserveOriginal, gameplayEnabled);
    });
    return { text: lines.join('\n'), retrievedChars, retrievedItems };
}
function signatureOf(combo) {
    return JSON.stringify({
        themeIds: combo?.themeIds || [],
        formatIds: combo?.formatIds || [],
        samplingMode: combo?.samplingMode || 'classic',
        forcedVisualScenery: !!combo?.forcedVisualScenery,
    });
}
function samplingModeLabel(combo, settings) {
    const mode = combo?.samplingMode || settings?.samplingMode || 'classic';
    return mode === 'format_only' ? __rmT("_0E_aN3qjuxqWf") : __rmT("VX2yvJukNLstBCqG4gOT3V1cmG5g3T");
}
function hasVisualScenery(combo) {
    return combo?.formats?.some(item => item.id === '10.2.2' || String(item.title || '').toLowerCase().includes('visual scenery'));
}
function hasSharedMemoryTheme(combo) {
    return combo?.themes?.some(item => item?.id === 'I.1')
        || combo?.atmosphereMenu?.some(ticket => ticket?.themeIds?.includes('I.1'));
}
function sharedMemoryMaterialRule(memoryMaterial) {
    if (!memoryMaterial?.text)
        return '';
    const sourceNames = Array.isArray(memoryMaterial.sources) && memoryMaterial.sources.length
        ? memoryMaterial.sources.join(__rmT("jvk"))
        : __rmT("2lKBSsNDF68Qp4TFPRhGGgWu6mp");
    return String.raw(__rmTpl(["Jmj26SYiVYHTZD.3FSME5B_nuTjkkzkklrKxfyb6qXZkH_F4xAh", "66tDA136", "gHRhMxRMQReKYG_R5t4lNZQIhWahVRY4em1.qX6IY3Bq6SWC3rX_AVN9.mFBtzthRRBgC_WTVaX3n1fROCpQlPz5mFNucyMJmbpqWComVcgS4SFxYZ69bT64fG9vNswvQUfDq4z3fQJchDfyWnw0d.akHWrsk9wHL5qw6D5DOPgz9AJVVDdrZuQIthQMMR7UbMfpSB1fm3EPhQ7y7QMrDyUBWbRWe8FkvLVQvV8ofuyf6aV34pn1XhuChrWwuh_BdYbZUCP0q6voDqRxdS5Lj2oAdnscksKtr8B7ks86rDWZEg5KMp6Gjq8f_a7Cdu_A2Vxu4VV6hw.reE6i69AeWos6RVJjZ7zjEGTlBaFsd07V8a_qAmoOOwSrZ77TsgJJR.WYVCEAsvA8NGo3rryPL699RknqlBprV8ETBGp0wSaPvtrs7KnAp1vrxTcjlcQEaRxQiKtB5Vt8B.F6ZfNvNudvSdmcbqLvFCj_BVo3CSW6_LI7mhuDMd0WTDQP.lKmxMjpR0MqoLzkkz10Da2_ZAewiNaDI7ND78UtQhPeZz0Lq14Bd8VTiMPMeuGuwuNMGqTda3i6SiO8NRaFOCH7jT"], ["Jmj26SYiVYHTZD.3FSME5B_nuTjkkzkklrKxfyb6qXZkH_F4xAh", "66tDA136", "gHRhMxRMQReKYG_R5t4lNZQIhWahVRY4em1.qX6IY3Bq6SWC3rX_AVN9.mFBtzthRRBgC_WTVaX3n1fROCpQlPz5mFNucyMJmbpqWComVcgS4SFxYZ69bT64fG9vNswvQUfDq4z3fQJchDfyWnw0d.akHWrsk9wHL5qw6D5DOPgz9AJVVDdrZuQIthQMMR7UbMfpSB1fm3EPhQ7y7QMrDyUBWbRWe8FkvLVQvV8ofuyf6aV34pn1XhuChrWwuh_BdYbZUCP0q6voDqRxdS5Lj2oAdnscksKtr8B7ks86rDWZEg5KMp6Gjq8f_a7Cdu_A2Vxu4VV6hw.reE6i69AeWos6RVJjZ7zjEGTlBaFsd07V8a_qAmoOOwSrZ77TsgJJR.WYVCEAsvA8NGo3rryPL699RknqlBprV8ETBGp0wSaPvtrs7KnAp1vrxTcjlcQEaRxQiKtB5Vt8B.F6ZfNvNudvSdmcbqLvFCj_BVo3CSW6_LI7mhuDMd0WTDQP.lKmxMjpR0MqoLzkkz10Da2_ZAewiNaDI7ND78UtQhPeZz0Lq14Bd8VTiMPMeuGuwuNMGqTda3i6SiO8NRaFOCH7jT"]), sourceNames, memoryMaterial.text);
}
const TAROT_IMAGE_EXEMPT_IDS = new Set(['5.3.1.1']);
function isTarotRelated(combo) {
    const items = [
        ...(combo?.themes || []),
        ...(combo?.formats || []),
    ].filter(item => !TAROT_IMAGE_EXEMPT_IDS.has(String(item?.id || '').trim()));
    if (items.some(item => String(item?.id || '').trim() === '5.3.1'))
        return true;
    const statements = value => String(value || '').slice(0, 600)
        .replace(/\be\.g\./gi, 'for example')
        .split(__rmR("svd6fAOGjnB0jZ85xVUj_Qck7P_A1Hnos8yxAcoQalxuA__4UZc8VN7ODPG", ""));
    const mentions = value => statements(value).flatMap(statement => {
        const result = [];
        for (const match of statement.matchAll(__rmR("kpdbWuLj285WfQ3rtFBCj0zHS0prbva9SwyZIWzGaJYPJ9oG9Wx7KI5y", "gi"))) {
            const before = statement.slice(0, match.index);
            const after = statement.slice(match.index + match[0].length);
            const localBefore = before.split(__rmR("pEwvhVHda.G", "")).at(-1);
            const denied = __rmR(".jf52Ju4tUWCexeYETg15mlyhl1.LkGusz6KA_WOD_zoldFagT9KhNXh.L70H9aqB9AD.PjsG9TzxD6PbqNpjN.bBh4uy3Yy6laB2ZXVXBhkc5DNnBf6KWA_zFukyh6V7bHDXAWAN75FKKh.K522VwvsEhPblrGGFs91kz9CszB_A4bJ9.I78rcBvohfMBPKZd9V6A.obPuI77ahW0xWulQJTzgCUoNmDl3dq5paP2g209wB18RmIr8DFzpAjukmXtzqg21VssKmSejQqQtqgmTpim1AiPDx80uLeACJL0bl9oX1w.pK3Xx.NItCrR05jqWu8fJdq0FuTxBMGfjyfOevPsNoRI_TH8DZR7i3FTdMVbzpRev8LIpWZzQMUcG.NPA0xtS4BWFhm7cxOJJh9bbdemD", "i").test(localBefore)
                || __rmR("MoDeOLfpV_R_Th", "").test(localBefore)
                || __rmR("6O4M3VQTSvR1lznMAxsUcI1I2EYmEBYiqZPI9XmTUpA3sDFLHvYBPf594eCcx128l94RgNuxHbvhIox0DCN_IWUvepsC2i6UGalC5G6Tlq4wqBgi6i0J4DVNMys1of", "").test(after);
            const optionalOrIncidental = __rmR("LvU5BmQFwaIFjKz.j_CvzhxQfTozk7GuUIdMyYgEtW3xKY2PECtQfwW0G7A.xu68zb9c604KUZyb69PdTJxzsE2w0HUrt6Zz4oWCw65pUunyAIE5irYRxjbMPfYsyeHGQBukgztCuRVNQtKdXKcq09o2SrFsFKAsBp5XrwuezUPr0gSd0h41k1SZaqqRWKlZAlobdMHr1fsD7e.ezTGawBRRwLvFvv0H27uJMU4B0emiwPh1JipjiZ2e6xCsTKm8DscZjpIuIXWSSO7GPMWLBa8lo6Fx_nBPRXcbeO9Nq1hALkgft58JdK4ldCG68LN4MQ7hiH91rDpVSPeQPiZFieFQ285Fh_MdCZFpnLZnnYZlYFIltJlRcu4lxxFr7juVP6BaX8.X9Lpp9rKye6v9syHIEVZ2olA9CClyj94QtZurWDHbH91aflkuPxjXfKyB4F9qZyp6gXZVclyUHvnS6SiIUC3XZoR1ccyq50WzBQAn8G6uCkU4gn_4kfS_VcfxjJCfvwhoeRgNJvpiTpBJHkqZb8SD5.BdDx9mjobKPqWh.T", "i").test(statement)
                || __rmR("uy64O_z9HFqPe0J.84Rgf9mXfx.k0KFE.FMCcHewn6_wEV5Sf3YxBNLo2YdZz4tHX0.hmwwBONKR2oVN", "i").test(after)
                || __rmR("OoPA1TR_ZXfFrc0x.KxEijAAVAxTNYYDY3XG8b6DH.BTRIUYK72azJxvtKYXEc4o_ijGJUsrVDrlQP69JQ3MbgIum1ccdNXugo8y6GYAK7Y68FwoaeAHLeCLYSIXWTMPy2D_rNutHZQ3AavjNwC", "").test(after);
            const deliberate = __rmR("GKqaHLP.BeJYTvTyOIkwT9mez8BV2LPXUs1ca9gs_yCRNmpexsCjyBPfSrYyKdaxrc27HI8JXwEUjj.RT0PWX2FrtcpnVLV7wUYVFuqeR8YiUzJN5oS8o.f3GDFAlHnBGK92Rr8ZiFox3zkGbV2PyHC9pe2Ak6LMd3QvivkZMSb0_FCzj3kE8Scr5p5D5CTngfN1mAwPIOMGNZcmzerKzcHjOGXj59NZ02uv8xhAnnYnscapxOUjXY0piBx9cOj5ygFkCXUYT2gGpqtJajEw.8uqUNgIxjPP4fz2EzDh56UxuhpGud8ebTrYDuraWGqtkr2xenMk6qrtr5aeGTZn1b.T8dwFLS0dkM7JkgHDEHoMscPN3vUOjomYKWyC3MHiui3LW2Lv", "i").test(localBefore)
                || (__rmR("n4CmHlUbKVPFxpdMj1juZj3RgD8.UT9jUMpvIIj.bEIeoY30StCFYRnHP1tiU5Jn5LuH7fzR2.96lEKMHJfRxFvB.mWt4GzfBKK7h.0XtTN8Ok", "").test(before)
                    && __rmR("gYLZl5_O8vpJGDGO7NVT4KbJNrdnADkMfhIsJmqz90xQ7af_qO7knROoSRuXgYnJU4oVuu8ZQrdoQA_noB7PA6V376ni4q2Ykp6SyimxAtUIVw96ztEjr9Qm", "").test(after));
            result.push({ denied, optionalOrIncidental, deliberate });
        }
        return result;
    });
    return items.some(item => {
        const title = String(item?.title || '').slice(0, 600);
        const summary = String(item?.summary || '').slice(0, 600);
        if (__rmR("mI561ePkDJf7OjyhqhlNviymuSJJBoiK_YlG6Y5enrgfzFgowVf40wEW9k.Sw2itlRgdE1jZelpuUbQuQFJrL5EJoroo9LPdvjdwrD1zj8Dc4quMMwNvf7rifY0LGvoHcytG_7T5WTDq0RILZY2niQyZiiETlu8m9QCud6QwhCWuQox6Xphm9gXRKR2u4sasfJLY390z1xGsASRrOdyC4IAgsd1TLb868QNGNplrU4DeaJQPzMrFkwXxr1n7sHHwmhZvfk0iYreU8fodMZcwafC_W7FtftPFzYfBdmAhvnZAbK4Mvnp7MJBNTDPMKbZA8l22B3VvoddnfiM00VqHDykZdkFewxOOb9mlpn71cQ5PVl.ldML10VaCtUtpOBxHHK0BDZkpLSEG0awYsif", "i").test(title))
            return false;
        const titleMentions = mentions(title);
        const summaryMentions = mentions(summary);
        if ([...titleMentions, ...summaryMentions].some(mention => mention.denied))
            return false;
        if (titleMentions.some(mention => !mention.optionalOrIncidental))
            return true;
        if (__rmR("uBNSu8fjsQdP_rCIxAW5JWAl0LBGtsKj2GQ4TmmvwKh93fWlFVtA2UQ8aizjMkj1VrXAt38aveC8N5CFCdDlo.SWN_ui.4.12ZPwtWBn7m86ahKWTc7u4ui__weRpB_jGLbR0EjFQGhK2ldDsnR8gk", "").test(summary))
            return false;
        return summaryMentions.some(mention => !mention.optionalOrIncidental && mention.deliberate);
    });
}
function isTouchTheaterRelated(combo) {
    return (combo?.formats || []).some(item => ['6.2.1.1.e', '6.2.1.2'].includes(String(item?.id || '')));
}
function shortHistorySkeleton(item) {
    const family = visualFamilyForCooldown(parseVisualFamilySkeleton(item?.visualSkeleton || ''));
    const labels = {
        scene_above_text: __rmT("UHwdwUPj.X_9mLcOP.wPcAF9"),
        text_above_scene: __rmT("UHwdwi21hSE9mLcOP..jxqid"),
        scene_beside_text: __rmT("jIhTSsa23fx4c7OUWRp"),
        separate_scene_text: __rmT("jIhTSsa23fx4cLOHRyp"),
        text_panel_switch: __rmT("QnhwvyQ4Jqp0RdNdBb3geajT8Au4nf"),
        text_disclosure_stack: __rmT("l0VZfsT9xkx0kXUoLoC"),
        object_state_change: __rmT("KNoHULF36hepU3I3V.MA8fKS"),
    };
    return [labels[family.layout_family], ...observedOperationFamiliesFor(item)
            .filter(value => value !== 'object_state_change').map(value => labels[value])]
        .filter(Boolean).join(__rmT("7os")) || __rmT("cyfALcBH");
}
let lastPaleLock = false;
function faceLooksLikeDocument(item) {
    return (Array.isArray(item?.formatIds) && item.formatIds.some(id => { const format = FORMAT_ITEMS.get(String(id)); return !!format && isDocumentFormat(format); }))
        || looksLikeDocument(item?.visualSkeleton);
}
function sharedVisualHistoryRule({ textOnly = false, darkVisualMode = false, softTone = false, follow = false } = {}) {
    lastPaleLock = false;
    const recent = getRecentDiversityHistory(textOnly ? 3 : 5);
    if (!recent.length)
        return '';
    const rounds = new Map();
    recent.forEach((item, index) => {
        const key = item?.diversityRound || item?.batchId || `legacy:${index}`;
        if (!rounds.has(key))
            rounds.set(key, []);
        rounds.get(key).push(item || {});
    });
    const ids = values => Array.isArray(values) ? values.map(asText).filter(Boolean).join(__rmT("jvk")) : '';
    const face = item => {
        const interactions = observedInteractionRecipesFor(item).map(recipe => recipe.title).join(__rmT("jvk"));
        const operations = observedOperationFamiliesFor(item);
        const coarse = !(operations.length === 1 && operations[0] === 'object_state_change')
            && Number(item.interactionFamily?.confidence) >= .75 && ({
            tabbed_radio_family: __rmT("MlvxSaO6UBN_3mCo24QqnwbE3dk"),
            checkbox_reveal_family: __rmT("BlzwZbVXscM_3mCo24QqnwbE3dk"),
        })[item.interactionFamily?.id];
        const observed = item.paletteFingerprint?.mainColors;
        const colors = Array.isArray(observed) ? [...new Set(observed
                .filter(value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value))
                .map(value => value.toUpperCase()))].join('/') : '';
        const surfaceColors = Number(item.paletteFingerprint?.confidence) >= .5
            && Array.isArray(item.paletteFingerprint?.contentSurfaceColors)
            ? [...new Set(item.paletteFingerprint.contentSurfaceColors.slice(0, 4)
                    .filter(value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)).map(value => value.toUpperCase()))]
                .filter(value => !colors.split('/').includes(value)) : [];
        const shortLabel = label => String(label).replace(__rmR("2FDQ1QqeXFuQ0Cf6IAA", "g"), '');
        const families = colors ? [...new Set(observedPaletteFamilyLabels(item).map(shortLabel))] : [];
        const surfaceFamilies = surfaceColors.length ? [...new Set(observedPaletteFamilyLabels({ paletteFingerprint: {
                    ...item.paletteFingerprint, mainColors: surfaceColors,
                } }).map(shortLabel))].filter(label => !families.includes(label)) : [];
        const pale = !textOnly && (isNearWhitePalette(item.paletteFingerprint) || isNearWhiteContentSurface(item.paletteFingerprint));
        const documentLike = !textOnly && faceLooksLikeDocument(item);
        const mainColor = `${__rmT("x_akYUc6")}${colors || (Array.isArray(observed) ? __rmT("cyfALcBH") : __rmT("cy7zLvhC"))}${families.length ? `${__rmT("ZSk")}${families.join(__rmT("jvk"))}${__rmT("Zvk")}` : ''}` + (surfaceColors.length ? `${__rmT("Y07gqSf2HKG")}${surfaceColors.join('/')}${surfaceFamilies.length ? `${__rmT("ZSk")}${surfaceFamilies.join(__rmT("jvk"))}${__rmT("Zvk")}` : ''}` : '') + (pale ? __rmT("jbEt4vwwCiG") : '');
        if (textOnly)
            return mainColor;
        const documentMark = documentLike ? __rmT("GAjy8yVJzJ..sh") : '';
        if (follow)
            return `${__rmT("eOUp.cc6")}${shortHistorySkeleton(item)}${documentMark}${__rmT("Vn7M5EnjHKG")}${interactions || coarse || __rmT("cy7zLvhC")}${__rmT("kis")}${mainColor}`;
        return `${__rmT("x_c9ZVc6")}${ids(item.themeIds) || __rmT("cy7zLvhC")}${__rmT("4bF.jaFy3_dutlBq")}${ids(item.formatIds) || __rmT("cy7zLvhC")}` + `${__rmT("Vn7ari4XHKG")}${shortHistorySkeleton(item)}${documentMark}${__rmT("Vn7M5EnjHKG")}${interactions || coarse || __rmT("cy7zLvhC")}${__rmT("kis")}${mainColor}`;
    };
    const lines = [...rounds.values()].map((items, index) => {
        const ordered = items.slice().sort((a, b) => (a.faceIndex ?? 0) - (b.faceIndex ?? 0));
        const contents = ordered.length === 1 ? face(ordered[0]) : ordered
            .map((item, faceIndex) => `${__rmT("tD_")}${Number.isInteger(item.faceIndex) ? item.faceIndex + 1 : faceIndex + 1}${__rmT("ZSk")}${face(item)}${__rmT("Zvk")}`).join(__rmT("7os"));
        return `${index + 1}${__rmT("7ys")}${contents}`;
    });
    const scope = textOnly ? __rmT(".iQ2Y9cNKmmwIeecb4k") : __rmT("7P2W.LsySV0g4tKWIHc0_MMC6stp9f8PKOYsTshb5GdIfjq7IqJaUJRSAacWMLHt6iC");
    const paleRounds = [...rounds.values()].slice(-3).filter(items => items.some(item => item.presentationMode !== 'text' && (isNearWhitePalette(item.paletteFingerprint) || isNearWhiteContentSurface(item.paletteFingerprint)))).length;
    lastPaleLock = !textOnly && !darkVisualMode && paleRounds >= 2;
    const paleReminder = !textOnly && !darkVisualMode && paleRounds >= 2 && softTone
        ? `${__rmT("Q9hoYgp7IIQ0Bh7mmn_EuGsQU2nCJk")}${paleRounds}${__rmT("N836BT04RJobaJq5CgIrEhBwkhEgGb_f.C7ENa2fXgSOeprAG5vNmzsz7FPgT7iZO1EYBVkyppSqBE_hqy8sY7B4RhnHVyV2JuhdIMi.wzHtKodGNt7u2.ZAihiT2K..ik6LMYGhbC16yNJ2Sg3dcTblQBYPzEG6tCTBenuHjm59iDN47lG")}` : !textOnly && !darkVisualMode && paleRounds >= 2
        ? `${__rmT("Q9hoYgp7IIQ0Bh7mmn_EuGsQU2nCJk")}${paleRounds}${__rmT("KDic1ec1W3i7grIAL8AHLr3mRuRYipSSVehUO.XbYG5gc0j_db9aFmSd9mE06VNo5u94yr7yqziFx5waDu7a7iaNzDTxElne0zY4z9KsIhwfBWtg31q_NYJNqnOaj9__8U5uAkQpXCnr_KFHyckCL0tJRM5wi5oj_WwLeQFaJNC7W1Y.0FRHjhNVGZiEKhoid9XBlwi_VqAgSu4aWSkdkyF1pel")}` : '';
    const documentFaces = textOnly ? 0 : recent.filter(item => item?.presentationMode !== 'text').slice(-3).filter(faceLooksLikeDocument).length;
    const documentReminder = documentFaces >= 2
        ? `${__rmT("Q9hoYgp7IIQ0Bh7mmn_EuGl7U2nCJk")}${documentFaces}${__rmT("A9xpmFvu1zALJkc2BU3BTDEdiQcm4RjSu4lDengoxC0N3HS6WknWmxh13s2uX8whbXTAbGj6d3KzYCdEi8KJIx1gZdOyPrZvvZG4Xj4Jtsn27fkxzPN3W3k5UrlgqSxq0F6M1HvDmq7N8lzenzIuASMhfXfLqBOLBIQdNFJ9iGROHmmOAoSSKpCghM97cb4ZENrRMh59H68ysokW..wkm7U6btaqpdiNzy_X7jzgsdB")}` : '';
    return `${__rmT("uwHL89otNHxGsh")}${scope}${__rmT("66tGgq36")}${lines.join('\n')}${paleReminder}${documentReminder}`;
}
function groupScopedRules(entries) {
    const groups = new Map();
    for (const { body, scope } of entries) {
        if (!body)
            continue;
        if (!groups.has(body))
            groups.set(body, new Set());
        groups.get(body).add(scope);
    }
    return [...groups].map(([body, scopes]) => `${__rmT("V0xMN_VVaO5fIq3H1GD")}${[...scopes].join(__rmT("7os"))}${__rmT("qox2MYIkOn7UFTRwc2uMDtX5N1jg47T1u75jca..wYNUDYstxJEy3f")}${body}`).join('\n\n');
}
const NORMAL_ONLY_COLOR_CLAUSE = __rmT("SyxcUUvl2awbGt_WulyOMOzfp2BLMVyaco6Gpn66lXvbG3ahtmVt9RKxQ4pHI_6NKWGvFbuSQqI5Xk_EW9SJxSelh1ANAGTlgRDLRf");
function toneAwareColorRules(settings) {
    if (settings?.visualToneMode !== 'soft' && settings?.darkVisualMode !== true)
        return DEFAULT_VISUAL_COLOR_RULES;
    return DEFAULT_VISUAL_COLOR_RULES.replace(NORMAL_ONLY_COLOR_CLAUSE, __rmT("jzk"));
}
function sharedSpecialFormatRules(faces, settings) {
    return groupScopedRules(faces.flatMap((face, index) => (face.atmosphereFaces || [face]).flatMap((candidate, ticket) => {
        const scope = `${__rmT("BJgCyT")}${index + 1}${__rmT("2RddPk")}${face.atmosphereFaces ? `${__rmT("_0.kVnHJf2OBTh")}${ticket + 1}${__rmT("N_EGFefQPMs")}` : ''}`;
        return [presentationWorldviewLockRule(candidate.combo, settings),
            !face.textPresentation && candidate.tarotRulesText ? `${tarotPhysicalImageRule([1]).replace(__rmT("3cajYiXiAdCU0hvE18D"), __rmT("0yLNULwEQbsCCCFNV4aBFkhI"))}\n${candidate.tarotRulesText}` : '',
            !face.textPresentation ? candidate.touchTheaterRulesText : ''].map(body => ({ body, scope }));
    })));
}
function sharedTextAwareBaseRules(faces, settings, directive, independent, split = false) {
    const construction = [], finish = [], all = [];
    faces.forEach((face, index) => {
        const scope = `${__rmT("BJgCyT")}${index + 1}${__rmT("2RddPk")}${face.textPresentation ? __rmT("v65Gjk") : 'HTML'}`;
        const mode = face.combo.samplingMode || settings.samplingMode || 'classic';
        const first = [userDirectivePriorityRule(activeUserDirective(settings, directive), face.textPresentation), visualColorTruthRule()];
        const rest = [];
        if (face.textPresentation)
            first.push(textPresentationRule(face.longText));
        else {
            first.push(compactCreativeRule(!!settings.creativeExpansionMode, mode === 'format_only'), settings.visualPromptEditingEnabled ? presentationEmbodimentRule() : legacyPresentationEmbodimentRule(!independent));
            rest.push(globalCompletionFloorRule(false, settings), settings.visualPromptEditingEnabled ? editableVisualPromptRule(settings) : '', !independent && compactVisualPreferenceExecutionLock(settings) ? `${__rmT("FoTQp7Q4J5gTIAe3WsWQ8dbS9Km9PoP1ws2O0Rc1")}${compactVisualPreferenceExecutionLock(settings)}` : '');
        }
        const entries = rules => rules.map(body => ({ body, scope }));
        construction.push(...entries(first));
        finish.push(...entries(rest));
        all.push(...entries([...first, ...rest]));
    });
    return split ? { construction: groupScopedRules(construction), finish: groupScopedRules(finish) } : groupScopedRules(all);
}
function sharedPaletteRules(faces, settings, palettes, split = false, follow = false) {
    const available = new Set(palettes.map(item => item.id));
    const factoryColors = !settings.visualPromptEditingEnabled
        || cleanEditableVisualPrompt(settings.visualPrompt ?? DEFAULT_VISUAL_PROMPT) === cleanEditableVisualPrompt(DEFAULT_VISUAL_PROMPT);
    const fallback = factoryColors ? groupScopedRules(faces.flatMap((face, index) => face.textPresentation || face.combo?.pureOrder ? [] : (face.atmosphereFaces || [face]).flatMap((candidate, ticket) => available.has(paletteRecipeFor(candidate.combo)?.id) ? [] : [{ body: toneAwareColorRules(settings),
            scope: `${__rmT("BJgCyT")}${index + 1}${__rmT("2RddPk")}${face.atmosphereFaces ? `${__rmT("_0.kVnHJf2OBTh")}${ticket + 1}${__rmT("N_EGFefQPMs")}` : ' HTML'}` }]))) : '';
    const references = settings.postGenerationRecolor === true
        ? buildPostGenerationColorRule(palettes, faces) : buildGenerationPaletteRule(palettes, faces);
    const htmlFaces = faces.some(face => !face.textPresentation && !face.combo?.pureOrder);
    const cooldown = buildPaletteCooldownRule(settings, {
        includeIndexedFamily: htmlFaces,
        compact: !!references || !htmlFaces,
    });
    let softAvoid = [];
    if (settings.visualToneMode === 'soft') {
        try {
            softAvoid = recentPaletteHueFamilies(getRecentDiversityHistory(3));
        }
        catch {
            softAvoid = [];
        }
    }
    const softFaceNumbers = faces.flatMap((face, index) => !face.textPresentation && !face.combo?.pureOrder ? [index + 1] : []);
    const darkMode = darkVisualGenerationRule(settings) || softLightVisualGenerationRule(settings, { avoidFamilies: softAvoid,
        faceCount: softFaceNumbers.length || 1, faceNumbers: faces.length > 1 ? softFaceNumbers : [] });
    const execution = references
        ? __rmT("1uEPqq44dpFy86tkJCOBzSdW7XYla5U2zCEUoMuHdaoOxorJaM6NiuuBqf_xuKmPh5srLjvRko_pMNhAkajES7ouw049OWlBrTVI93BuHwd.2Ou6Swz.ZudIi6lwnItjwAqH6qRsaLBSJrfF") : '';
    const normalTone = htmlFaces && !darkMode
        ? __rmT("gNU3F9uQ9CvvTPSWb1Mjq3cXd1d3eZY.rNOy4ThKMPd1fMfMYrKeZ3XMILskjb9cNSsdtEn7LSwUUonUy2gba_HM.nvyYYiPlMpUMv_CDJ9qcsK2YBMTmUa2uM69iBs2aFLmVLEdHJ3PaILH9WMxjusvyDZdOo9ZZGR1ka5qSj7407QvNbn23qgqmklx5fVWWN0NiyZ00vR7B82E8KYUGGi0jA6vpQtO") : '';
    const common = [cooldown, darkMode || normalTone, execution].filter(Boolean).join('\n');
    const heading = htmlFaces ? __rmT("F20gsn0rNPv4cVRbSrCeV8_P1ZHhoBHQ.1TB.UtiOeiOWFMe1NuQOtg0rGG") : __rmT("rBzMBl5rotU_vuUBI9BqyLqzh7fQHK2tXHZZCfOjby._w4l0CXcm3dmX");
    const texture = htmlFaces ? materialTextureRule(settings, { follow }) : '';
    const fonts = htmlFaces ? webFontRule(settings, { follow }) : '';
    const design = [references, fallback, texture, fonts].filter(Boolean).join('\n\n');
    const cooldownRule = common ? `${heading}${__rmT("eS2yyT")}${common}` : '';
    return split ? { design, cooldown: cooldownRule } : [design, cooldownRule].filter(Boolean).join('\n\n');
}
const PICK_ROTATION_184 = false;
function hardStartupReserve(independent = false) {
    return `${__rmT("qsLHt0xNwS63Tgv_G38LFuTd6CHrsKp8CGOmkfES")}${independent ? '' : __rmT("JPMX.5tVfHOnQPakShKgKh")}${__rmT("oB6HOFqL_GN6fSW9wU6otVzrGrFMiwlcQpLtn.IyXI.tuge4OMCcB5Fvv2ZMezkC")}`;
}
export function followMainReplyFirewall() {
    return __rmT("D.Fot7Z1KeYVPb9XKtjMw8QP4lMGJP.eLEw49IMUx9Fi9ewxCTRJw50PIR0v6rDMAT_paQkIh9f1OyYOXcmGxU2tLNsAou1_iIrISk87TyGfNx51vSjZVaE.OKPGj1Axb1A8I_lW9DqyoTVy4_nCauz6snNlkaJe81j6rctyvpWt3bXOg4g1r6JQliB9EQglxgoiV_DaBvyh24Clmg1Zjfv3W6ClaUy_kFkOc4cBdzh.Ql0xmkjDL7cvpgPH_WOxxPkA5NGzzikz303O4L4BQDW8CjT.LoHh8a3LBHIyeHeMDpYfKelkgj9inhDtHrsRc_ZEFdhgGfiZhb5ZgHRnF6OTE2ztyfXdnC_5QDHeKifDj1ETgd.8mhO.XTuxQ0.8bp56ezcZTMwtm5Q0rtGirLNhUlWMgXnTpnOEApxb6iWdqG1_Ee90pNuFL26XWJsgL5JeqeKv4Sdqd0zEn7dnEIHy3Rd_iL1F4kvt5azdP8EBGjvIXGEnhoazk3Y");
}
const RABBIT_MIRROR_DEFINITION_LEAD = __rmT("gioaP5wvFgWLb2.TutVmkWSv.rWiTFWHcmBGUz_3CBQV._0MQODamTG651b2afTMPgwV_0HWNel7yoJivwU6mg3vqOtfY1VKO9XRmNFJNZcRqsaJE9pqCba.8ECuRngOuyOgZ4rxDOGqY8ycGKul2Z405UcFrKjJ6jvJE13zdZzricb3QXF16a0P17E");
const RABBIT_MIRROR_DEFINITION_ANGLE = Object.freeze({
    drawn: __rmT("9p2RaucSpRJ7CrcJrFSDVG7V8_f0UZekPxceylf5FG7S1S8Pt9_k3NbGKTn9e29tddg7rCmesxcxsur6qAk"),
    formatOnly: __rmT("QOUXfzuXxWM7sZKMmtHdgbDXczo65oEIt54tJbWXmCdHlm1OGUPRZGJFm2pKrfEL_JmVMz8lm0bY40fNhiV0tRK3DYEmz9jlXvELzC5uWJw.V33U3gepXDUt"),
    pureOrder: __rmT("9Rb.uqssqwfha2Wm3KOwj6RTtWYycRdZ9Pj70i4I.dyixgJzMxIvlLpLkTzd_I9.9JFNOP9E4ecD2b6ssB_Evjl5ef3U2kpmANA"),
    atmosphere: __rmT("5GaY2pzo1xp3oe_wvNxNA08n8wSTGqNhgyUJr.l_njVQ6YwB8disrGgp5WVJMFCy1xQoNAStxNetdP3iEIgYJW3dhnOAUyf7lwhNH_QgO8o5dKN_pZ4dHEqY8ik"),
    atmosphereFormatOnly: __rmT("VpsSd5xqwBgR4kIQJvVGdQy1inHya_mRkEbA67dQtsMKU1mG9qJUXi9qLw36g56yXQxnE9Ehf5XHHt0SNY3OR0nK8trJxwp7ibP6WnMCgFP6Xh3C4733H7h1MHuV44gTwTNN7vdGSNGVnnp3Ncg5yStaZxY"),
    blank: __rmT("h0TS1kgXyY9YN_gV.LqBoANR3wI.uH4H_gb_uo31DJGj44LdSsbJlNz5w4q5X51nhmRY3h"),
});
export const RABBIT_MIRROR_PRIORITY_LADDER = __rmT("quzAr63z6_T8W518o0M10eciyBfclCfLY.PvgGyaQ786UkUXzGZJ2WrJmtibnsGbG2L5SscxNhyr8HdZ7BpO_SsuYV3Ok98gjmsXDokza43pcyyFvaobQ.PbzlSZEnmhr0v7tZJSiLN81TyqTp4p3nOSxn_sof_NZyGm4EHfdrNI3QG_t7wYm_KJ2zku1_ME8uupHYO90jhfFc.f6pv_Mtf81bjab8uZZE8nb1IiSWQa2ssewEQ1w_2h.Lx4zIen");
const faceIsFormatOnly = (face, settings) => (face?.combo?.samplingMode || settings?.samplingMode) === 'format_only';
const ticketHasThemes = ticket => Array.isArray(ticket?.combo?.themes) && ticket.combo.themes.length > 0;
export function rabbitMirrorDefinitionSituation(faceContexts = [], { directive = null, settings = {} } = {}) {
    const faces = Array.isArray(faceContexts) && faceContexts.length ? faceContexts : [{}];
    let kind = 'drawn';
    if (directive?.pureOrder === true || faces.every(face => face?.combo?.pureOrder === true))
        kind = 'pureOrder';
    else if (faces.every(face => face?.combo?.blankLongText === true))
        kind = 'blank';
    else if (faces.every(face => Array.isArray(face?.atmosphereFaces) && face.atmosphereFaces.length > 0)) {
        kind = faces.every(face => !face.atmosphereFaces.some(ticketHasThemes)) ? 'atmosphereFormatOnly' : 'atmosphere';
    }
    else if (faces.every(face => faceIsFormatOnly(face, settings)))
        kind = 'formatOnly';
    return { kind, textOnly: faces.every(face => face?.longText === true || face?.textPresentation === true) };
}
export function rabbitMirrorDefinition({ kind = 'drawn', textOnly = false } = {}) {
    const angle = RABBIT_MIRROR_DEFINITION_ANGLE[kind] || RABBIT_MIRROR_DEFINITION_ANGLE.drawn;
    return `${RABBIT_MIRROR_DEFINITION_LEAD}${textOnly ? angle.replace(__rmT("xGetiN1EWn87Nd_br38Cm4Vp"), __rmT("gS7uFK3J38ct9h")) : angle}`;
}
function rabbitMirrorOpening(faceContexts, options) {
    return `${rabbitMirrorDefinition(rabbitMirrorDefinitionSituation(faceContexts, options))}\n${RABBIT_MIRROR_PRIORITY_LADDER}`;
}
function rabbitMirrorConstructionScopeRule() {
    return __rmT("HKeb6dVly24yE2xnOaL1p8uHkCKjvgDru3UIeiBKkAj0aZLBJv9HjSG1VPyzL_rLihRI_KH4373fmEVG.HAXRzmAhK5jfBAb7p0ELFCnbtMu0kQTNjmh2uPS8wYRBmZb3nY067fMU7C93A3KcEUn1k");
}
function coreOutputProtocol(independent = false, reserve = true) {
    return String.raw(__rmTpl(["WnCW9U1N55Q05joAwU2wPjVUqRJ_3Du2SvpkUrj0uYSrnj6r1Kg_sM_EKwisBhPowrE", "BEzah_lpwPUwY3iJwyKZ3wpS6hXoPrFThoSQVl9m7tcxO4BYd0iSTvXZsISVjxFmWf.YP_MnrQGw7SV3U8j9Ik_KYETpNan039OsFl.379s", "vrmzXPQ5slP8Youhie64unuW.kRtqoJw3F6IhN8BlvTnH6hM.R2V5qr85bmfoYHgdX7ygmF7Rpa1ei4mSQbKqBxp2Q_y5tRjm0JyewwiA5A5wNBQzwzKmJxt0VdOqMMWRttPGkwyBl__.QceL0lF.5vdVc.92pCyAQJtrQtxM1F0dFKjMcxG.lssMny.xvuXLReZBkzTZd1HFfyE2zTlPjGdLHMTGVmYpL2i5fj3ouMqITzIYTOKyvz0LrNZGMu7XXBC.qLX2iFZbW1YIo8Ldzf8473GrczGhv9nbb1VNKhdtovOwbCJ0mikBcLJ7YAoia0VA8jFDcrPVO8i9TIQRdsZUxoAM9VmObwBmPpNbiAk1ftz3Lqz.69x7kW657BSrdRFF3mtHqqkrYT2Eb13b8r8B7gJsVjI9UNNfl3ZY3qX3vUyr8ViI3wWJlcFDBbKeFQh6fdQtoNZckucsNbp_5SQHiVZdsNFeUHrVgJNJDRakimwRMwXjNIHAt8D_I7rz.mHkrQiKCg4fWT_2xWpHhPHJBcCZctDp5UdToUFHiQ6DWzozPhHdS1W4uWgdqY0wvBchUumwVbHJ1cWWoBrO_QVO1JkgsT3GXMYeeLqbR7i9Ov2jqVmb7gxNJlNfJFRcj9Xn7CRhDXKW3WBrx.2QguTK9GgCqBE8aKxMLmm7KkluD8fzfj4ocZc3mjucuXvn_pdNOl_Y7_oPIUUmMwNPnSGXfiIYIqIP9H721z4jYYNoHGgM3El2EMSuYLf.te77pLDwWg3PBlrWetO6RZL9SAV.1E_HG.60tJy578eRDPkY0a0lIQRSsrqt_I32TZnSmCUT6msoElBMBkjTT4wKgnAvE.7DwKZPeiyng1RIvAUe_w8xSawZjsMJAxC2.UuNR955MXxzRXV6xsjcyhwBbvJzccxeExfro73ymvfN0jAaYnBltYd13JbXARQ6954EyC", ""], ["WnCW9U1N55Q05joAwU2wPjVUqRJ_3Du2SvpkUrj0uYSrnj6r1Kg_sM_EKwisBhPowrE", "BEzah_lpwPUwY3iJwyKZ3wpS6hXoPrFThoSQVl9m7tcxO4BYd0iSTvXZsISVjxFmWf.YP_MnrQGw7SV3U8j9Ik_KYETpNan039OsFl.379s", "vrmzXPQ5slP8Youhie64unuW.kRtqoJw3F6IhN8BlvTnH6hM.R2V5qr85bmfoYHgdX7ygmF7Rpa1ei4mSQbKqBxp2Q_y5tRjm0JyewwiA5A5wNBQzwzKmJxt0VdOqMMWRttPGkwyBl__.QceL0lF.5vdVc.92pCyAQJtrQtxM1F0dFKjMcxG.lssMny.xvuXLReZBkzTZd1HFfyE2zTlPjGdLHMTGVmYpL2i5fj3ouMqITzIYTOKyvz0LrNZGMu7XXBC.qLX2iFZbW1YIo8Ldzf8473GrczGhv9nbb1VNKhdtovOwbCJ0mikBcLJ7YAoia0VA8jFDcrPVO8i9TIQRdsZUxoAM9VmObwBmPpNbiAk1ftz3Lqz.69x7kW657BSrdRFF3mtHqqkrYT2Eb13b8r8B7gJsVjI9UNNfl3ZY3qX3vUyr8ViI3wWJlcFDBbKeFQh6fdQtoNZckucsNbp_5SQHiVZdsNFeUHrVgJNJDRakimwRMwXjNIHAt8D_I7rz.mHkrQiKCg4fWT_2xWpHhPHJBcCZctDp5UdToUFHiQ6DWzozPhHdS1W4uWgdqY0wvBchUumwVbHJ1cWWoBrO_QVO1JkgsT3GXMYeeLqbR7i9Ov2jqVmb7gxNJlNfJFRcj9Xn7CRhDXKW3WBrx.2QguTK9GgCqBE8aKxMLmm7KkluD8fzfj4ocZc3mjucuXvn_pdNOl_Y7_oPIUUmMwNPnSGXfiIYIqIP9H721z4jYYNoHGgM3El2EMSuYLf.te77pLDwWg3PBlrWetO6RZL9SAV.1E_HG.60tJy578eRDPkY0a0lIQRSsrqt_I32TZnSmCUT6msoElBMBkjTT4wKgnAvE.7DwKZPeiyng1RIvAUe_w8xSawZjsMJAxC2.UuNR955MXxzRXV6xsjcyhwBbvJzccxeExfro73ymvfN0jAaYnBltYd13JbXARQ6954EyC", ""]), rabbitMirrorConstructionScopeRule(), reserve ? hardStartupReserve(independent) : `${__rmT("sLIvhxlqq8S94uzr_QjJLk")}${independent ? '' : __rmT("JPMX.5tVfHOnQPakShKgKh")}${__rmT("W8C9xJTPD8vjbpFuXz6PHEqfyX0emPv7.C5bYvtZE1FanN7sq8_")}`, independent ? __rmT("p0R9nytisslFqkOSIyayqWIxnjxQmF4EJMm7qi1QMpmT8rjsqThztdGvO.82AjoJknDAdNL5_jCwe4E8K0uVJwPirnXljQhQANA") : __rmT("VsAHcpK6OnskOcwOjuhXoOrMzBzq2jxrmqm2oRiilcgYdxl8metDsd0UaRHjM1vMiFVroZ2s9rPVL71622NM7tgNWqYEaLXFNrTkg_j2y.udba_83XIMfmUJJyV77.Dr"));
}
function multiFaceOutputProtocol(faceCount, independent = false, reserve = true) {
    const order = Array.from({ length: faceCount }, (_, index) => String(index + 1)).join(' → ');
    const openingTags = Array.from({ length: faceCount }, (_, index) => `<toto data-rabbit-mirror="true" data-rm-face="${index + 1}" style="display:block;">`).join(__rmT("jvk"));
    return String.raw(__rmTpl(["Xp.x.1dfDZ3.NYQlxmDaeqIjkZIYYTkmH2OLW77_NjYtBgIWCCIDa6zfsBMF8_ehyjgUO2h2", "", "wjeHOn_ppERBTh", "bOk", "l0UQMSh7QSvSd.1puAjxoPjlWKe0sGdR8mjYFYW.1Gmhge70x6byvQ2Hl.uIaZXna5C1rhZRRRPHl.OMXyGfxK4XXmWf49BDW8rIcriUyCSsOk", "MXgSf_2Xt6OmwRVP1G.ddtafyc6KmAUY.ZvEZRMgr3qz8n9x", "cPEYXYc1nkwPlU.STD_raPVhAfcHSrWtLvYEsgXw0RqNGpbE8H3cdb2fDawuU5bJPRZJ7IZxXRZVCkpGZG1dYFh4J8vRdc2kKEJLq4l3pW8i6jaK7IkCRvRUEjNXcNvoQzGTHVdaeC3w2IdnVnuZtprYzzF25BmOvzjkciAY_y_FFxQg7_atkpG1O.ZPhAnlsExaNuPZ6zJDllXU5JDon8ELlal", "rxBm05Y9tdOB9Jo2YwEWJiJRCTwvZPPJ_wNuXbWic45Tqz9UFiqdRFlVDxN1DrzOxP4MRaUpyjZmoZuS1m3gwmlwNQuvh3gTOZ1ASK1DJkTIcIJ_O5UGqeethsQp0WQ9syab.ciMFZWYA6EInfuQ8OXmEf4xmrccQqsDcm9MweS1mBkS8hb_kk8PfWx3ta89yawHcHqQwUw19slrFL7OEVboF2G8KJz5wrr2OxbjnDfN0ZhpIYK2fWh5secqmMQBGapo0HJ4tyr4B.pfPhvqvs3uK3VJNrOfQe5qVvYt0FRX9CRR_lIeVIas5bUrOc7gfzEfDh6NlkHuoah7DO3F0.eLB66QA3mnZWBd3gOZmdotiGgb6baExcuRiTDM2aXS87.m1N7eGvhCNOTZZAEZxsxoFbiushE.eRcGuOpc9K8T5KSJeVTvFBGzZyy5so1ys8UcwSbqWlznjiIE5.urqkJtGip6vVu9T8gMJeRZCAj6pBby6Szji2KXHZwbzRPhKvpItGtGLMyNGymPcRPOJkVlqAMPEMnCh4h7xOP1YCnVIDFX01JVWAF09_XqldPr..ci49deAsvgVLqZNo.A1hro1UnYQNaNLrPArTiMl6fi1568nWIQSHBacY5qvEC2BVSDsbemVTYgeJAmbS_0rM1rvLJlBijIF3oMhZt3mODnHBhCCiyfpjTvtABftQHf9VsWiLho2alJbai3NFWHhFc.Y7u0pbdFHS9j7j9DoGVbnjHAkLnaHoxMxY1yIouAbt.qsX9UZj9mrwzqMBhJSAoVm0ONVtOlxtgHU6lBinss4.pIjZ_", "CI4p8MYrhZRnl4nMW7K1di7Db_YlmaIxgjr8hzGf8IW5T_y0zV.JOlqQprQZyc28ijPO4g0d7Zo.kEU0UnTtlyc3xnpS2O23E9eYlZgZPYOOkKWks1sslkNkEhCEZf", ""], ["Xp.x.1dfDZ3.NYQlxmDaeqIjkZIYYTkmH2OLW77_NjYtBgIWCCIDa6zfsBMF8_ehyjgUO2h2", "", "wjeHOn_ppERBTh", "bOk", "l0UQMSh7QSvSd.1puAjxoPjlWKe0sGdR8mjYFYW.1Gmhge70x6byvQ2Hl.uIaZXna5C1rhZRRRPHl.OMXyGfxK4XXmWf49BDW8rIcriUyCSsOk", "MXgSf_2Xt6OmwRVP1G.ddtafyc6KmAUY.ZvEZRMgr3qz8n9x", "cPEYXYc1nkwPlU.STD_raPVhAfcHSrWtLvYEsgXw0RqNGpbE8H3cdb2fDawuU5bJPRZJ7IZxXRZVCkpGZG1dYFh4J8vRdc2kKEJLq4l3pW8i6jaK7IkCRvRUEjNXcNvoQzGTHVdaeC3w2IdnVnuZtprYzzF25BmOvzjkciAY_y_FFxQg7_atkpG1O.ZPhAnlsExaNuPZ6zJDllXU5JDon8ELlal", "rxBm05Y9tdOB9Jo2YwEWJiJRCTwvZPPJ_wNuXbWic45Tqz9UFiqdRFlVDxN1DrzOxP4MRaUpyjZmoZuS1m3gwmlwNQuvh3gTOZ1ASK1DJkTIcIJ_O5UGqeethsQp0WQ9syab.ciMFZWYA6EInfuQ8OXmEf4xmrccQqsDcm9MweS1mBkS8hb_kk8PfWx3ta89yawHcHqQwUw19slrFL7OEVboF2G8KJz5wrr2OxbjnDfN0ZhpIYK2fWh5secqmMQBGapo0HJ4tyr4B.pfPhvqvs3uK3VJNrOfQe5qVvYt0FRX9CRR_lIeVIas5bUrOc7gfzEfDh6NlkHuoah7DO3F0.eLB66QA3mnZWBd3gOZmdotiGgb6baExcuRiTDM2aXS87.m1N7eGvhCNOTZZAEZxsxoFbiushE.eRcGuOpc9K8T5KSJeVTvFBGzZyy5so1ys8UcwSbqWlznjiIE5.urqkJtGip6vVu9T8gMJeRZCAj6pBby6Szji2KXHZwbzRPhKvpItGtGLMyNGymPcRPOJkVlqAMPEMnCh4h7xOP1YCnVIDFX01JVWAF09_XqldPr..ci49deAsvgVLqZNo.A1hro1UnYQNaNLrPArTiMl6fi1568nWIQSHBacY5qvEC2BVSDsbemVTYgeJAmbS_0rM1rvLJlBijIF3oMhZt3mODnHBhCCiyfpjTvtABftQHf9VsWiLho2alJbai3NFWHhFc.Y7u0pbdFHS9j7j9DoGVbnjHAkLnaHoxMxY1yIouAbt.qsX9UZj9mrwzqMBhJSAoVm0ONVtOlxtgHU6lBinss4.pIjZ_", "CI4p8MYrhZRnl4nMW7K1di7Db_YlmaIxgjr8hzGf8IW5T_y0zV.JOlqQprQZyc28ijPO4g0d7Zo.kEU0UnTtlyc3xnpS2O23E9eYlZgZPYOOkKWks1sslkNkEhCEZf", ""]), rabbitMirrorConstructionScopeRule(), reserve ? hardStartupReserve(independent) : `${__rmT("sLIvhxlqq8S94uzr_QjJLk")}${independent ? '' : __rmT("JPMX.5tVfHOnQPakShKgKh")}${__rmT("W8C9xJTPD8vjbpFuXz6PHEqfyX0emPv7.C5bYvtZE1FanN7sq8_")}`, independent ? __rmT("uaaMg.bilbYQG8F9DDGmq2S1pQ41UXxuJ3D_CIt8o5X4SxjVthcpbOpVNknQxx3zUmQ.i2ag92f") : __rmT("0MtUHT0U.W1AHHl.Faapt0a08Glp2Bd2mAjS7c.QiXBukmbQNrxaotNb49Spw.OV"), faceCount, order, openingTags, faceCount, faceCount, independent ? '' : __rmT("Bpro.oY83tKebo_kmT2yIfFItCLcMj2Rbn.lmzwn5a9F_nl5SFlf5djMYzXiAjfxuvPRgYqTTiEobh"));
}
const HUE_FAMILY_ASSIGNMENT_ENABLED = false;
function assignmentAllowed(settings) {
    if (!HUE_FAMILY_ASSIGNMENT_ENABLED)
        return false;
    if (settings?.visualToneMode === 'soft')
        return false;
    return !userDirectsColor(settings, { defaultPrompt: DEFAULT_VISUAL_PROMPT, clean: value => cleanEditableVisualPrompt(value) });
}
function multiFaceSelectionRule(faces, hueFamilies = []) {
    const plans = faces.map((face, index) => {
        const hueLine = hueFamilyInstruction(hueFamilies[index]);
        const mode = face.combo?.samplingMode || 'classic';
        const themes = mode === 'format_only' ? __rmT("WVh2W9SdYpzkU7shxpRUWUFhryC.0jiEqsuAp7N1gucauzl.JKw8FoX9AvYLKxf.DGCy3HujepT5CNGiKjFPla.ZqQKfZOO7GMzmu8bJCYNTVD4KlevgFc.taHNZNa7m5UUB3l9Bb0DezOU3NWt.aU_Uv8E.S_I1O9V7AX69I5LGpu6fUKTqIlyOw9XoNZsXmEfGtHsKO220PvLY1XXqKBpKPdIcHwi54b6u13Tw1WAlbFHkNdq_zjSQOEp") : face.selectedThemes;
        const materials = face.atmosphereFaces ? atmosphereMenuInstruction(face.combo, face.atmosphereFaces)
            : `${__rmT("VPkSxTAbRXilWyTq")}${themes}${__rmT("2LA1f1ydC4B2AjnpIgD")}${face.selectedFormats}`;
        return String.raw(__rmTpl(["6Pto9cc6", "6RT5b.Wx1tewyZ4E7oIsfE_6IBPlNdojQeQXGjlLAfSOfaN18cfd3f", "fyXu8dNSxg72DFr5SNm_Lk", "eIk", "", "7fyUrlCbHvi0eAEN0zFPVPh4kLmQlPIFo_MD5peYrHh28Si_rrK0OfU4zYSotct8AKh7E_RxRUpW04pfGL5J90ZUnITFT3_N58hpKQSQmFDf9dFs4PsuQ8sue568Md5HW_KlKvuC2exqeL9Jgc3tilN2poV_D88e.1zedn9bE.qKvyNwQ_KnipF8NiKj.xVcLjOZbne7OmCrTperI39YFidBdOX7ATzs8Fv.Ov8RhP0fvE0F2R_79ZcrgjyUeAGkWFIifh"], ["6Pto9cc6", "6RT5b.Wx1tewyZ4E7oIsfE_6IBPlNdojQeQXGjlLAfSOfaN18cfd3f", "fyXu8dNSxg72DFr5SNm_Lk", "eIk", "", "7fyUrlCbHvi0eAEN0zFPVPh4kLmQlPIFo_MD5peYrHh28Si_rrK0OfU4zYSotct8AKh7E_RxRUpW04pfGL5J90ZUnITFT3_N58hpKQSQmFDf9dFs4PsuQ8sue568Md5HW_KlKvuC2exqeL9Jgc3tilN2poV_D88e.1zedn9bE.qKvyNwQ_KnipF8NiKj.xVcLjOZbne7OmCrTperI39YFidBdOX7ATzs8Fv.Ov8RhP0fvE0F2R_79ZcrgjyUeAGkWFIifh"]), index + 1, index + 1, samplingModeLabel(face.combo, face.settings), hueLine ? `${hueLine}
` : '', materials);
    }).join('\n\n');
    return `${__rmT("CMlFHAfZSG28wOlvMCYG6pvN33By3Fc3LULm2KP.UsguzqF818xWbkIUsiB.lZhY")}${plans}${__rmT("ChFDfx6rGLXeZD9rXRhs9.b_vCypODtlFNOyTaZknkG1.vDrDCPZrVLoJz8eOIQeKPo5akLR1pl1KlTgAQU975852.LDzgacRHLx8Q12BNBF3Ao6O9DdkXwkcQ2C2uW3hZRI35kS57XZ7up12lDGUY0Q7GzWqldo4xupOjhvN7LLOfIElsSqUtuJ9RQXA.GIXPhRxT1LjHR7irGu.frpA2ZN5sjh9NHnAhkIdpNF.1_uEHO.b9pG3WO.pBASy0NsAci9tLIoAURUUD76hGyBvDZapf89rx1rtGQ71tjYmCurYeNSwWJR5i6GYK4mEOdbit3oDdD9BAiVplFJqsdmNx.TcjYWVi6KxplANTraolBOC5cif8KaVrvwZ0IH0xBeqlpYx3yPmlmQEhU_SBV7cWoEwbCrfT6vDE79NcpkXQ3cmcIm1SF95PzugZnVpDpJwkJsiGlM4jyYwuwzQ_VvJquy2p.f5JXjc4NoW49HNkmFf9iXAZUjoBpNA4Z7bCkHXw77WjYSMHK4Q5oINB1ZG6rPApeZyffrkbVqmbjqf6J.NJgAwAKYwegeRmrQEUsx31i4NEEGXXVrFPGKaCSzCo61lAZd3Gqqu.UMY6znd8jcptc9oKmY0yeB_aL8ermdmtQv6enG6fGRFZKLHQNPEpjnGH1_gyUFbalQrBR1E39_gtMlQGSIWNb1yXGQdC3AdJwzJBXNMr8pbVVKQwRGCko9eFZGMjCWPCqhIksoBXfOSAwAS.wPJENxJKpMIYGvxoD9xYh13vKHDFioz6isPw.JqNm4Ry0jrs_Wzn4GeRzPWuiOs1JhZ.Va9bm6liwxuM6tA1zHO.0pPaJ7")}`;
}
function tarotPhysicalImageRule(faceIndexes = []) {
    if (!faceIndexes.length)
        return '';
    return `${__rmT("qcc_wwcZmPH4AO6IEeiqHZeBfePH65AP")}${faceIndexes.join(__rmT("jvk"))}${__rmT("uhgOh8qeptsTiYP5r9H577CR7HIQoh042fTHoaQZs.rDB0b2I9.SLEGSsErma5wdSVmnLIB9kGhsGSPM8dFDK.dz4wFPHgQve2lI8m.C8zkNyKeRDsgcjObgbwoo0jBpVdztztbnaQa5bsya4NyD99ehz0AVq3z8oYn6dJwn8iNcyMTQNfhpA0OuKvNFQ0OVZQYsmGtGg2ZgRuA5ypoqsG01vVOfpAYqdjhVWMwmzyzjqLwtOzwwG7tXUJno.a5IHbgwg_9j8irzYqEaZe3DKS.T7MFoUEMs2UqUKuZQOzTX617e5juz92eRraQmkWdQ3_D0gYhpZRgWlXzRFOjLfb_AZ.KQXACLLTJlglPWtPQUlVlkod1ZUf")}`;
}
const FOLLOW_CONSTRUCTION_NOTE = __rmT("GmtpyURLRxWBggQ0pfhCj5K2x4uJJHaNtVZR4Np_FTo0uVTQHc_K_fYKT8U0I7.Qxlc1gLBlscNfqphraG.pLklktFE4LrVyHJ0WfNd3cnjubtQDKTFaxPyRB3GvZR2wskunW7G2EvFdZ84E5JZpHS1LRy3ysK7F6KAbBUSmTK0__qAB1SfeffmoXOES6xA3q0ZvOL1HiwsVxrJop.0OKVGutLliQjyVw3v_Op7QHJ4XQ5GhlAt..SQ1I3wnN8XOrCyYBIOVJOd8827R0tYNdchSK7LWhuuO2u4TQSBslK9lj32bjO_5dCsQdOgvgT6967976h1M1uzTya4I9zWetREeCLMByF1knzXlIJy1GPS3c1CTKVPJ6t8eb9cNe2YA0xjSvT");
const FOLLOW_PICK_DIRECTION = Object.freeze({
    1: __rmT("vMN0azCA8eJRLuvb_67DSa2KlTnFJ4lcIpAWCJm1Gjzk9BuXvXf"),
    2: __rmT("fx.0qrDepLSmueZ9uZ4suU3qEMJIQLoY5ZUqqu1dlzlwrn2Pwc1TVOaSUIgpEmdtDhVDX8AisZOKHs_gSdOBtLRkTWB0ig1s580nFh6K_bjxirJIRxDrB56HsRpI_weHQ._u_w73r7WVWgaP4EX.mJMrqFeqjhr.zwEG3MiylTSabh"),
});
function followPickDirection(faces) {
    const lines = faces.flatMap((face, index) => {
        if (face.textPresentation || face.combo?.pureOrder)
            return [];
        const pick = Number(face.designCandidatePick);
        const parts = [FOLLOW_PICK_DIRECTION[pick], face.visualSceneryMode && VISUAL_SCENERY_SUBJECT_BY_PICK[pick] ? `${__rmT("0kkPpSxJ2DxStf")}${VISUAL_SCENERY_SUBJECT_BY_PICK[pick]}` : ''].filter(Boolean);
        return parts.length ? [`${faces.length > 1 ? `${__rmT("BJgCyT")}${index + 1}${__rmT("2RddPk")}` : __rmT("BgMdPk")}${__rmT("p5w2vMFOgH3Stf")}${parts.join(__rmT("7os"))}${__rmT("jzk")}`] : [];
    });
    return lines.length ? `\n${lines.join('\n')}` : '';
}
function mediumInteractionConstructionRule(driverOffer = [], usages = [], follow = false) {
    const lines = driverContractLines(driverOffer, usages);
    const pairs = matchDriversToUsages(usages, normalizeDriverOffer(driverOffer) || []);
    const pairedObject = pairs.some(([key]) => isObjectDriver(key));
    const driverBlock = lines.length && !OFFER_LIMITS_187
        ? pairs.length
            ? `${__rmT("zfeKGE55JooDQWMs9uZ15MsvHw7cbTFT12sXRo88C4w.9YBbPqJhPP_6LIvaymLgQfKiIpU1TysPHjv5K1G2zSREjmBeou39C4Shnkxv7Zv6YGwDTO82coiMVGmTYSAmn9VEXIX9wTHqdLnYe.5x48f9Vczo23AX.5IVtNVFZnhApb6vk1DMj06QYHinBl15iVB")}${lines.join('\n')}\n` : `${__rmT("YAjilaCOMZ1RsFcYXKbi1OfZubR2AYY8Ma5Q.08d6V.SP6lOPi.lUSM2qJy2OpBQtWUT_wtN_ITMfIKxYBnSPoAmVgnULFLWgAM6d30rRNO58USZbffsCDVm")}${lines.join('\n')}\n`
        : lines.length
            ? pairedObject
                ? `${__rmT("ZWYtWtiZzoeI0lbnV4Dch80tpOo3xYkwSfXaa7_mPEWnleqE3FUudx8QOXnyUKPQOoGZYoBlWY78h9KiSZAViiLWRLT1xyqvSaLU_KIHomo2n._YbRh4LTDwkEdMhtlRFaBS6LZE8IHJ9AMGTY_h1jRbUocbthRBTBYzUEIs2ylG0zp7tHa3A0fhaiW8CslxZfbOJbwMM7nGI5zM1veW1ZVjj7soJzyvZlubJRVfjesFV8o1B6mUeHuTUy.01kqxtZr9OGpt8zSh5S1CQSXyDH4X5cyZX1Bv.ub3E8H2sw_")}${lines.join('\n')}\n` : pairs.length
                ? `${__rmT("2TtV7kvtkAxEeRpEb4aIJ4i.rCq.9Cim5o9rRViztJy3JrZCmBEr0QVoKrQ_JHnHZ6CzeyeoZtmmC2rH_A7S_rMaG5lfOQAvqdkNajRFIFDTCde0QY_jMk_cjoW7PagYsytjWJIcpUUaJxJlJuO4zfzwg5dr8iDBTx_TexacCm7NpUdKbtOXSZUF6MWe.lHRXqXtdvD8rrryxqvVyykj6oaLRUVwGej_.LtEvuuZ5yrcdRmFgvO7FxvRhuL1uzr_JxUd_h")}${lines.join('\n')}\n` : `${__rmT("YAjilaCOMZ1RsFcYXKbi1OfZubR2AYY8Ma5Q.08d6V.SP6lOPi.lUSM2qJy2OpBQtWUT_wtN_ITMfIKxYBnSPoAmVgnULFLWgAM6d30rRNO58USZbffsCDVm")}${lines.join('\n')}\n`
            : '';
    let recentArt = [];
    if (!follow) {
        try {
            recentArt = recentArtDirections(3);
        }
        catch {
            recentArt = [];
        }
    }
    const artRotation = recentArt.length ? `${__rmT("VNtZnMEBPMv7QCX6Q5gQ9ViBeW7R_7MKHhaCqh")}${recentArt.join(__rmT("Yos"))}${__rmT("9OdeVzEkDJGzp5.KDnTGQJ9mJ7NJY1JVcyhuWY6eONXI0yrIspXLnAEwzBG")}` : '';
    const samplingRule = follow ? FOLLOW_CONSTRUCTION_NOTE : `${INTERACTION_SAMPLING_RULE}${artRotation}`;
    return String.raw(__rmTpl(["RxuSH5LTw8rAkxex_Qs_gbQX0BGsKZ79iyRjPE3mTJ3wWhwweHErKcguzKtccY06ojRzk.dW8KHrYN5zb2LtnpMy9tNhevcFYOBD3H8gcl.jP97xDaGvtZvPospPTWKMmAxCLxK29IXNbc2v_z4iCHFHnyXdukrQSG4RY0pqzKOiNzfJWBG8ERMCWUYm22xjOIWFa7XElDtiGj78Yyz9NVjmTy76JrT13fGaANsmZJguCpQw6TGzbYBablh_VE54s7IGYt0JbvHlD19RTcLDMBwFwtXUt5VJyyGJcQTU0A.3v6DKM4vu_ZR5g.BmVOLVQwZPQ6ccu5ElbztT.dpFSiOHdIyHkQp9GDwCW4L_2ejnS0d..Rq06e4645meRvjPAw_AmPt1TrmYiFU1QMlJJphyJ8rKJTbuumTHERzDBh0_rpC_JVx0VEB5JmfOSgXnbQAF5sYeIlJ52fvksPwreXpy3LFQDc.mp8am9lOLiZGQF32.ctL3xvU4kNLFtWCEWigRVC5Hw62HC0Fmcb78jl_9dqG2mrf1mxQjabECD7qLl.pC7e1c4uEAxBBCwthNTa.qhJaWZNgVvH8Xf0jtUMYAUqTVq_CrS1SB0NKYduFAzRGv9lMEkoBM6KompHHO6YJnNYmtUcv7FIhQ7k0po6zqSEHQmpXVFYUqvtjCGWYFXMgabon0tC46.WWJdB7MVjXAgx0isOt3d6peKdoey2ApUJiOsdsgu3ylIGcFtkM1v94ISXNzNGbd7Gj1yBLNVSOJRKoSdN4p9Z_QSN91LttLrqtb0wXoZ_Rzsxl4NLbasKPV8O2bounV0frZ7q26jbJcSqNmLDIGjuFmSl14CS8XPgfpcPZ3ub_v5j0pgx_20uPBtPcq_tp9K7xe8CcKFOpz4qyADAU_3wCIgrhNEO0fhiY5ubnsiMZ_Q5Mt2VteQ_zA.IBRXRJFiJncwJJdjWokCSOfS9fKMs0.M6MpZVH01gXp7BsgAlAkScaJt6O1EmBJZRqOu9_V0qdz3UI5EIN9pl4_lWRbAnN9lwUa23NdWTtkbwEwhZthm2xgfzeA.oPYwosnKofQadlhe0AU7AsHay_5548OW4AftZA7Sv1dkHejpAMDC55Sbx._4i_y2eZ1r3fyv23DrwasuJldOz8DH5KnAsFxPcvkU.jJsk9g8fa.Xsj9uEFHgMs2wl8Jr38luJKBcbJ82bZnj3yYgjpr7QK1IhRKLm_1hYrZygpScb.IbSbZNGvWmcPaDj16P25SKSHB0EGuxanQNs6q9MEw0epO1sf.mvyJxZQrt.tHTodb9amQsCySOW8h_fztZ8c5yC3ofMt3WIxwNcPM11iMHAJTIji7WJzAXVTIVPCWLQM8zkalYRDj6eV6rINTJvdkM1htNk_hj9216gM453T3eqSFJRjON5gQhxMeXpeOHIxmXaJ6q1NgsMeg", "", ""], ["RxuSH5LTw8rAkxex_Qs_gbQX0BGsKZ79iyRjPE3mTJ3wWhwweHErKcguzKtccY06ojRzk.dW8KHrYN5zb2LtnpMy9tNhevcFYOBD3H8gcl.jP97xDaGvtZvPospPTWKMmAxCLxK29IXNbc2v_z4iCHFHnyXdukrQSG4RY0pqzKOiNzfJWBG8ERMCWUYm22xjOIWFa7XElDtiGj78Yyz9NVjmTy76JrT13fGaANsmZJguCpQw6TGzbYBablh_VE54s7IGYt0JbvHlD19RTcLDMBwFwtXUt5VJyyGJcQTU0A.3v6DKM4vu_ZR5g.BmVOLVQwZPQ6ccu5ElbztT.dpFSiOHdIyHkQp9GDwCW4L_2ejnS0d..Rq06e4645meRvjPAw_AmPt1TrmYiFU1QMlJJphyJ8rKJTbuumTHERzDBh0_rpC_JVx0VEB5JmfOSgXnbQAF5sYeIlJ52fvksPwreXpy3LFQDc.mp8am9lOLiZGQF32.ctL3xvU4kNLFtWCEWigRVC5Hw62HC0Fmcb78jl_9dqG2mrf1mxQjabECD7qLl.pC7e1c4uEAxBBCwthNTa.qhJaWZNgVvH8Xf0jtUMYAUqTVq_CrS1SB0NKYduFAzRGv9lMEkoBM6KompHHO6YJnNYmtUcv7FIhQ7k0po6zqSEHQmpXVFYUqvtjCGWYFXMgabon0tC46.WWJdB7MVjXAgx0isOt3d6peKdoey2ApUJiOsdsgu3ylIGcFtkM1v94ISXNzNGbd7Gj1yBLNVSOJRKoSdN4p9Z_QSN91LttLrqtb0wXoZ_Rzsxl4NLbasKPV8O2bounV0frZ7q26jbJcSqNmLDIGjuFmSl14CS8XPgfpcPZ3ub_v5j0pgx_20uPBtPcq_tp9K7xe8CcKFOpz4qyADAU_3wCIgrhNEO0fhiY5ubnsiMZ_Q5Mt2VteQ_zA.IBRXRJFiJncwJJdjWokCSOfS9fKMs0.M6MpZVH01gXp7BsgAlAkScaJt6O1EmBJZRqOu9_V0qdz3UI5EIN9pl4_lWRbAnN9lwUa23NdWTtkbwEwhZthm2xgfzeA.oPYwosnKofQadlhe0AU7AsHay_5548OW4AftZA7Sv1dkHejpAMDC55Sbx._4i_y2eZ1r3fyv23DrwasuJldOz8DH5KnAsFxPcvkU.jJsk9g8fa.Xsj9uEFHgMs2wl8Jr38luJKBcbJ82bZnj3yYgjpr7QK1IhRKLm_1hYrZygpScb.IbSbZNGvWmcPaDj16P25SKSHB0EGuxanQNs6q9MEw0epO1sf.mvyJxZQrt.tHTodb9amQsCySOW8h_fztZ8c5yC3ofMt3WIxwNcPM11iMHAJTIji7WJzAXVTIVPCWLQM8zkalYRDj6eV6rINTJvdkM1htNk_hj9216gM453T3eqSFJRjON5gQhxMeXpeOHIxmXaJ6q1NgsMeg", "", ""]), driverBlock, samplingRule);
}
function compactCreativeRule(enabled, formatOnly = false) {
    if (formatOnly) {
        return enabled ? String.raw(__rmTpl(["D1L17cjKZ1t5PXkwdbE7AmDSAs1UWyzJaGWi.VvmZf_gQzH4Dm3ZgG1PSzkkjmYcgkjS4EAK8mon8Lop_sFa0gc2218KMK6e2jlQxsY61Hsp8bFPgxAh7pMif_Yy3ROrCumxposo9MtiwwlxTinKVFyh593otipUru2C2E2VDb7Y0ra4V.uhR1eo3Lsoo7uMgIwv56P7HPp_u10T.hnejT4wmnw1RKab73FPHbnRpz8edT"], ["D1L17cjKZ1t5PXkwdbE7AmDSAs1UWyzJaGWi.VvmZf_gQzH4Dm3ZgG1PSzkkjmYcgkjS4EAK8mon8Lop_sFa0gc2218KMK6e2jlQxsY61Hsp8bFPgxAh7pMif_Yy3ROrCumxposo9MtiwwlxTinKVFyh593otipUru2C2E2VDb7Y0ra4V.uhR1eo3Lsoo7uMgIwv56P7HPp_u10T.hnejT4wmnw1RKab73FPHbnRpz8edT"])) : String.raw(__rmTpl(["PJgB5yAA5Z.ikxk5L4mHQGvsnCJZFMM_UKk8gD1QSZWaYj9daaD6JjS1dFV8Tk0ywiukzPNQB0K.JtO_GGdMSeS46XrTiijPaEChPcXHZ5buhhAc5w_J9TldbaPTp8VPW8bsmp5LDur1r0EA0OyZ.hMiF6f65BJOdfgIEjxeKAqHFH70hAfZ.oLhHKO0qXfni91Ei2mji8x6fWGcBUY"], ["PJgB5yAA5Z.ikxk5L4mHQGvsnCJZFMM_UKk8gD1QSZWaYj9daaD6JjS1dFV8Tk0ywiukzPNQB0K.JtO_GGdMSeS46XrTiijPaEChPcXHZ5buhhAc5w_J9TldbaPTp8VPW8bsmp5LDur1r0EA0OyZ.hMiF6f65BJOdfgIEjxeKAqHFH70hAfZ.oLhHKO0qXfni91Ei2mji8x6fWGcBUY"]));
    }
    if (enabled) {
        return String.raw(__rmTpl(["lO2zeH4qkmos4aTCrkeDVJE9BwGrwD0e9u8yb.KSypzVCdenEl8KE0_Rc4HmRPSNu9PMj5mEuXOg23eNb32yZUNDMXDPNCMPNc46K9.coze.GMfyz83.YLBfTjrVhK_AD5FY8ybjR3Ib.yLF6TNOQuxymRxG7ej3oMUdBlxiy3tv7FiflZ_EtSuE3KZ6V4FfQJakzYal6Buyo3tc88j7xkur4GpD8iVc4RyeS7WsAPoESJxUST7QrxVOw8oYH.gzBnVwT6Qp9SgC_9qYizHMyC.EyvF2O1httHf"], ["lO2zeH4qkmos4aTCrkeDVJE9BwGrwD0e9u8yb.KSypzVCdenEl8KE0_Rc4HmRPSNu9PMj5mEuXOg23eNb32yZUNDMXDPNCMPNc46K9.coze.GMfyz83.YLBfTjrVhK_AD5FY8ybjR3Ib.yLF6TNOQuxymRxG7ej3oMUdBlxiy3tv7FiflZ_EtSuE3KZ6V4FfQJakzYal6Buyo3tc88j7xkur4GpD8iVc4RyeS7WsAPoESJxUST7QrxVOw8oYH.gzBnVwT6Qp9SgC_9qYizHMyC.EyvF2O1httHf"]));
    }
    return String.raw(__rmTpl(["DYx0qByfmhJdABfPck8DwGay6EF3Cs9ga72QPT5u3avVCL7iEvtYuBjVRpmtcmnQzdDvFpiMHXdOV_8JybHDtvpNkHWol7iS3gNtI7p9UAbPTjDLaPhViTIonSnhNMcxLTt2D3s4j3zelIwhx_V05e3JXN.MFjIaNIpx_T"], ["DYx0qByfmhJdABfPck8DwGay6EF3Cs9ga72QPT5u3avVCL7iEvtYuBjVRpmtcmnQzdDvFpiMHXdOV_8JybHDtvpNkHWol7iS3gNtI7p9UAbPTjDLaPhViTIonSnhNMcxLTt2D3s4j3zelIwhx_V05e3JXN.MFjIaNIpx_T"]));
}
function complexInteractiveCore() {
    return String.raw(__rmTpl(["FfsEtfcqMfNqH16hqOEfbBiaowD_sERCFe8zTKg3RnZJ1rDJKRhEAbGyQu1Z2dc8RoyhzzpNjvcSbYNMry0455Ge1PMQ7zP6Heg_TMWpMOmJ_l9zwNHDqNYKILKPiTdA9tLOCZ_zCxlWY.kyU0ixDIDznT0yCeoRTqLFefYazhX87reYb3dL_.uiv1wdF3v6HVaz3pwyX3ZvsqfaQjpNwfLeCYbFCA1Aa.ISp6z_Y4JAAsjCZd9ySYELo5WwK_yIF0Er93U_TZI_sjdxk7AMEGUv5CfSXSMNxzsmFycCwiMg8uBnI9iUZxcUdpYIlUCSUyMLVHh3XXGWM5Xn_LOpGsRCZjjPkc1hihPOR0FmCeyQfn_sEeNMvBIDR7h_JqdMX7bmpmfKy5o9lCYcd.9DaxzYgC3wisO0D0TBQnPQmEXnG.nDC.rH24qPKj4XX6IF6xP5fEnyjLTNKVDAFulYzQwQo1NsgX.JfuTlIAQg5nXw5ZedD4n6xT7Ve_tDT81rMj5ChTFfuP9dUNw1hgkmSB2b4mMYxo.zIzT"], ["FfsEtfcqMfNqH16hqOEfbBiaowD_sERCFe8zTKg3RnZJ1rDJKRhEAbGyQu1Z2dc8RoyhzzpNjvcSbYNMry0455Ge1PMQ7zP6Heg_TMWpMOmJ_l9zwNHDqNYKILKPiTdA9tLOCZ_zCxlWY.kyU0ixDIDznT0yCeoRTqLFefYazhX87reYb3dL_.uiv1wdF3v6HVaz3pwyX3ZvsqfaQjpNwfLeCYbFCA1Aa.ISp6z_Y4JAAsjCZd9ySYELo5WwK_yIF0Er93U_TZI_sjdxk7AMEGUv5CfSXSMNxzsmFycCwiMg8uBnI9iUZxcUdpYIlUCSUyMLVHh3XXGWM5Xn_LOpGsRCZjjPkc1hihPOR0FmCeyQfn_sEeNMvBIDR7h_JqdMX7bmpmfKy5o9lCYcd.9DaxzYgC3wisO0D0TBQnPQmEXnG.nDC.rH24qPKj4XX6IF6xP5fEnyjLTNKVDAFulYzQwQo1NsgX.JfuTlIAQg5nXw5ZedD4n6xT7Ve_tDT81rMj5ChTFfuP9dUNw1hgkmSB2b4mMYxo.zIzT"]));
}
function visualCombinationRule(combo, stage = 'all') {
    if (combo?.visualSceneryCombination !== true || isTextPresentation(combo))
        return '';
    const construction = String.raw(__rmTpl(["YkEIzqC2unMo7XRDkNgwXnMj3bZY9cDVQx4_tOnHiXiNqe_wztxJvM0vaipfhxXUgaD.t4y.yAvh60zun.LIFRgAwjT", "virOrk5ElZV2nvBPVdJvezCMKaXcAl0Kv9pA1gHOswuVMFkT0RW_rVXSL_QVeyLq1lbBkRLCiao5l3059zwVVse.0HvpHCfYK_s0FdbcareMCmIaOkw88a.GJwxWAOYXzm0iOcpkwOKHyGHq6hHYJZw0iIHv.Qi3zZBeLxAT4WlQHCRFZu9whKU_PwdlE3I7tPDjsM5WPAy34LYtFTaiSoRXhPVCGaovZCp5KnOT2Ffpx_EGM4LrlZ7t.Xcswo.q8sWMDBk1wYOXCSu9gY1ytwpH9TVUouetNDGl6y_5KO0WyRVrqUWVt8aKoXzcKS52uR2JOUvPGQzl9WXE10pQLyaGLT_JZbIZTPM66MDf11.eNUI7s6FE0b575OUOPfhIXQqX1kJD9wsWp5Lsm8nnld_GlMkyLeFW9K5yLkbUqOZE.bHdjIoE_t7.e0AnGNv6ts649S16MpXTOGaLZwdj2MbSk9c9ZR3Ia5ohP1Kn3wrYvWi8BBKxga8dV2yzF3U6I2Ib1XlCONRalGq969qdY.8MxKq9tEM19XkVxShsKqU.5.9gVdnqQlaVEiFNN0EgbE6uWo8h1E7Somh0lB735N4O0PPoXnLzrP0AtjdlZMXGVoJ9tLDJTf65WtG"], ["YkEIzqC2unMo7XRDkNgwXnMj3bZY9cDVQx4_tOnHiXiNqe_wztxJvM0vaipfhxXUgaD.t4y.yAvh60zun.LIFRgAwjT", "virOrk5ElZV2nvBPVdJvezCMKaXcAl0Kv9pA1gHOswuVMFkT0RW_rVXSL_QVeyLq1lbBkRLCiao5l3059zwVVse.0HvpHCfYK_s0FdbcareMCmIaOkw88a.GJwxWAOYXzm0iOcpkwOKHyGHq6hHYJZw0iIHv.Qi3zZBeLxAT4WlQHCRFZu9whKU_PwdlE3I7tPDjsM5WPAy34LYtFTaiSoRXhPVCGaovZCp5KnOT2Ffpx_EGM4LrlZ7t.Xcswo.q8sWMDBk1wYOXCSu9gY1ytwpH9TVUouetNDGl6y_5KO0WyRVrqUWVt8aKoXzcKS52uR2JOUvPGQzl9WXE10pQLyaGLT_JZbIZTPM66MDf11.eNUI7s6FE0b575OUOPfhIXQqX1kJD9wsWp5Lsm8nnld_GlMkyLeFW9K5yLkbUqOZE.bHdjIoE_t7.e0AnGNv6ts649S16MpXTOGaLZwdj2MbSk9c9ZR3Ia5ohP1Kn3wrYvWi8BBKxga8dV2yzF3U6I2Ib1XlCONRalGq969qdY.8MxKq9tEM19XkVxShsKqU.5.9gVdnqQlaVEiFNN0EgbE6uWo8h1E7Somh0lB735N4O0PPoXnLzrP0AtjdlZMXGVoJ9tLDJTf65WtG"]), VISUAL_SCENERY_EXPRESSION_RULE);
    const motion = String.raw(__rmTpl(["ha2txWDKOcglUEBe3nwuGlnqOs5C3BSBK1mAY.wvkK.UQU6RDsg84o8arEF6HVzDjJGhASdrAG7winvzfx4LAx3yWvW4xcssNEQk2qZJIuREEyXXdEPHwRBXYtdgc6NDMcmMTrTc8Cpn7ChB5zG2WTcB75EjfoSv1SAuxIjED3WZ7cQ4DGJvT9Z1YvcRE5vsyhwziqQtgERK6iT_Q5fc.vVT3QqwZg6HQ5cXfIURktwGd4yEL50amQBHpFV4gK8S2vDwko0awCcrkpo3OG0NlR2rApoCAzqVQTQGjGBFT1SK8Z2w1imWlr_5oZ_CVabCKmZNt3ab98H4IOD4fzr_8Z6mlg3enVg.C.uodNzBgJywAYWjEK1TGhQTfat37dNzj46N64ipwtxCF8HN4tWyS3FgEXyFZMDFnZN.2QBSE7isoNC55wTByPRQvqtnDYkyOhoCHGZ7ln_CCD3A04RyQbQZBpgtWcg6uqYPEfS8iqZjEupit_mospdzEcWwSaESGgfivbTcgV_Cp2XHriAe7AQ6dPgbA1k.boJF9f1SFUZIbywsTf5wKtIMCXdOOqcwj5IjpnTBc1uKU2baENskgQGzor1xelHXZ_Wbc.eNifk5Ch0vhraZ5U9GRwD98PwkTdi8bOR5uL.8IENKL.7KVF22e2QqMjKziG8NIqY_C380i.Q5ypczjChcYM6tEAjqPfQ41IlW2nqq6jfmsxw4wQ2qQbxsztu2cr5_a7FbRUW7TM9Zqqg.XVKrDwKIHmqUUFe1l560LkUVDBiTpEBCB6oeVMTTUAv32vkhrnFAzQ_704C5uMHZtUvef7EiU1okcPYAkP.jHRhZy8zvKdnlJmRX2vIKowk8b0G5UcQpl.zeXJ22dy6CVGq_v295wxTEGDrBfFpWcumjLkBonXr3YCbUpmyLTaTlAAPon1D4qJX.mNaIGqDarv9GunX5lx0H2Cl1Ap5Z4YbHzSuxR3Y2W2LeXaVm68rfvws_14gBfbp1aJnX.3Lt8gIkQ9hxxmuJnnRwKZokQ0bh7BjJY9emT.O6am21oKIfEb9T7mAPiYghJYkaW0ZMCWB6Bk232mUTZWcs5PYSQITjOUCM2WTrPvJ2Z0HUw0w2BWzutTeTGmpqdJR.cL.ZoDWH2uCp594QMAg6zzF4s4otGQrHCAAbJgAmaFaHAtABZEAV8IQZwKevY4aqZe8M5gLoaC2Xp8.YqHV4YcWTrROBs_VbTyy_BwhyaFXVTAfy4uc1jVa3u2.vrhln58J4LST3xTHhI6BCwUlVxtjI.RweSZHOO15cQDsx7.omS4vLuSLaH.PKTQ.i1nS3NINAhNBAkpWa5RL6aRjMXLOe31V.or73ayR2fWvSMBYSfxHa7jZilCLyZ6mmMPbd_Nau6WQid9kj7Ue3EcKZJ47GRnfMjtNcNSBuwSkpTbonmsMKUNaSFW6VIjp7bzol.XSlm_ybnPSuC.vTP_Gam0AoDFXsnyLodxW5fg5Ou6hJMv807e8kIBuWdtUp2_ACUrjazQ.RqdJN805ldIvCHqZUTnZ1hIwHHXIGDIA7WjPUSKy8kUIsTipedtHE30qeapvvUs3teSYjTOQNstvLknurbK1XaWqpiszo.FUVDNhgGMKNvbKG1hf4ZGy_n6IaMxPw3_1SAiQHneCzz_.IGd0_xoPK5i2Cw2uDr7R_w6HowRJdo6fgA5jjPTTb41XtvStc7bYdzDOzzhTYbmxhjeA2Sy5kZMzA8iP2SvA5prxWI7HsXSXFtnhzSxg8BXSkUxuvByzyMv4cMp6tvW2OJ.uwY6ZxvuLmY8M6J56vOQbs396h59NFRCBSh0aAr_xnXfU_8MfB.4bmnr0khSM4OSpTO5aahr4WvSWXqJjHJA4EZlaR.rxgjEox4GGYv1qELmxkZ3cvb489Bdho5PYtwo5aNixRZVFdHGYdYDVTrmMsRLgOjPT3e3GrhzeEcIgrU_JtO9_YI9nZdO6zj1ihYZPUwHRQnV1j3H4FMEuEAK17izaHI2ouy_7pXsgSI18FL18mY.pPvnwcoS5I", ""], ["ha2txWDKOcglUEBe3nwuGlnqOs5C3BSBK1mAY.wvkK.UQU6RDsg84o8arEF6HVzDjJGhASdrAG7winvzfx4LAx3yWvW4xcssNEQk2qZJIuREEyXXdEPHwRBXYtdgc6NDMcmMTrTc8Cpn7ChB5zG2WTcB75EjfoSv1SAuxIjED3WZ7cQ4DGJvT9Z1YvcRE5vsyhwziqQtgERK6iT_Q5fc.vVT3QqwZg6HQ5cXfIURktwGd4yEL50amQBHpFV4gK8S2vDwko0awCcrkpo3OG0NlR2rApoCAzqVQTQGjGBFT1SK8Z2w1imWlr_5oZ_CVabCKmZNt3ab98H4IOD4fzr_8Z6mlg3enVg.C.uodNzBgJywAYWjEK1TGhQTfat37dNzj46N64ipwtxCF8HN4tWyS3FgEXyFZMDFnZN.2QBSE7isoNC55wTByPRQvqtnDYkyOhoCHGZ7ln_CCD3A04RyQbQZBpgtWcg6uqYPEfS8iqZjEupit_mospdzEcWwSaESGgfivbTcgV_Cp2XHriAe7AQ6dPgbA1k.boJF9f1SFUZIbywsTf5wKtIMCXdOOqcwj5IjpnTBc1uKU2baENskgQGzor1xelHXZ_Wbc.eNifk5Ch0vhraZ5U9GRwD98PwkTdi8bOR5uL.8IENKL.7KVF22e2QqMjKziG8NIqY_C380i.Q5ypczjChcYM6tEAjqPfQ41IlW2nqq6jfmsxw4wQ2qQbxsztu2cr5_a7FbRUW7TM9Zqqg.XVKrDwKIHmqUUFe1l560LkUVDBiTpEBCB6oeVMTTUAv32vkhrnFAzQ_704C5uMHZtUvef7EiU1okcPYAkP.jHRhZy8zvKdnlJmRX2vIKowk8b0G5UcQpl.zeXJ22dy6CVGq_v295wxTEGDrBfFpWcumjLkBonXr3YCbUpmyLTaTlAAPon1D4qJX.mNaIGqDarv9GunX5lx0H2Cl1Ap5Z4YbHzSuxR3Y2W2LeXaVm68rfvws_14gBfbp1aJnX.3Lt8gIkQ9hxxmuJnnRwKZokQ0bh7BjJY9emT.O6am21oKIfEb9T7mAPiYghJYkaW0ZMCWB6Bk232mUTZWcs5PYSQITjOUCM2WTrPvJ2Z0HUw0w2BWzutTeTGmpqdJR.cL.ZoDWH2uCp594QMAg6zzF4s4otGQrHCAAbJgAmaFaHAtABZEAV8IQZwKevY4aqZe8M5gLoaC2Xp8.YqHV4YcWTrROBs_VbTyy_BwhyaFXVTAfy4uc1jVa3u2.vrhln58J4LST3xTHhI6BCwUlVxtjI.RweSZHOO15cQDsx7.omS4vLuSLaH.PKTQ.i1nS3NINAhNBAkpWa5RL6aRjMXLOe31V.or73ayR2fWvSMBYSfxHa7jZilCLyZ6mmMPbd_Nau6WQid9kj7Ue3EcKZJ47GRnfMjtNcNSBuwSkpTbonmsMKUNaSFW6VIjp7bzol.XSlm_ybnPSuC.vTP_Gam0AoDFXsnyLodxW5fg5Ou6hJMv807e8kIBuWdtUp2_ACUrjazQ.RqdJN805ldIvCHqZUTnZ1hIwHHXIGDIA7WjPUSKy8kUIsTipedtHE30qeapvvUs3teSYjTOQNstvLknurbK1XaWqpiszo.FUVDNhgGMKNvbKG1hf4ZGy_n6IaMxPw3_1SAiQHneCzz_.IGd0_xoPK5i2Cw2uDr7R_w6HowRJdo6fgA5jjPTTb41XtvStc7bYdzDOzzhTYbmxhjeA2Sy5kZMzA8iP2SvA5prxWI7HsXSXFtnhzSxg8BXSkUxuvByzyMv4cMp6tvW2OJ.uwY6ZxvuLmY8M6J56vOQbs396h59NFRCBSh0aAr_xnXfU_8MfB.4bmnr0khSM4OSpTO5aahr4WvSWXqJjHJA4EZlaR.rxgjEox4GGYv1qELmxkZ3cvb489Bdho5PYtwo5aNixRZVFdHGYdYDVTrmMsRLgOjPT3e3GrhzeEcIgrU_JtO9_YI9nZdO6zj1ihYZPUwHRQnV1j3H4FMEuEAK17izaHI2ouy_7pXsgSI18FL18mY.pPvnwcoS5I", ""]), VISUAL_SCENERY_VS_GUIDANCE);
    return stage === 'construction' ? construction : stage === 'motion' ? motion : construction + motion;
}
function visualScenerySceneFirstCore(stage = 'all') {
    const construction = String.raw(__rmTpl(["ikE5ch1lbRKC2oy70uPIVMFRIKbcNhODPRje7iFjdsSEpsUhhG2mTWrXGg.FqaHBqJmpe3SVtPM9nHloBOYU2HPpmKO_bYvE8Roto2Rpnxh6aSMTCR_m2yct2BWb6r17aUD3d4Lqr8bSxpkQmW927HMkS8Fp1nVmYNxaQdB1aSlxHbLICedqZcgwmdH2rkq8dssW6gnXpg1ULwN65z.3MaiqGbNgu1fABmUiNpL16uYHlbeARo9e6JvhbQ5upahEYsB_xDjjInE8m9TRURBUWpFlrdj_ib204w7fhbJLTGK7VZUJPday06w.yaKb7dqIClLLZL3j05QZjZosUJqKVwuZcwvhNg.KCZEb__EjFdupYV27YhU0OBJiTR2PfLOGZh8VV2AgAn4VRWGdNCMELqfMDuuivDI9PSJl9ZzjIM9V6mgQMc0nfPL6Cml0r8VqL.4yjB8uWFD0RVaUJOsciiWZ3rk_s3tZOcND59Iby.Y2CauIWbObLuQNKDbAUhhX.lLNdXrqVeeOUsYFa.KsVfJPpvmFGEshHOLcD4gNOo_j.dkDopDZ1ZbZd5eHDBay56ZVethzW05WGzIgSpusaZlhpctc9gwN.J4Ywo0kLeqxyvg1xLHKX9kZZOhveRUGR8Ji9tnuawTfCj7iPsJtWJuWgRQiITCoo6NrKcajK6jf2vySSKE5IriYluIxw__pQt6hlygqOrl6HkSlySzjBrWWWz1OeY9y92s60oTHS1Ctgv8bTuARt2ke5y13LLQ9retfkfaouAGxku7XixttGKgM6HJVz2rxmWMW9Wu9eqR4V4LfooamMjEKxPk1AVnMyANGQpXV5P1Jt30d_2QLvtP2gvXE_He12tLHVA.1zNc4pnPSnNVRk5K.23ifbIhpgENglu0u6_vp2LUJio3vCYXUoSVB9f"], ["ikE5ch1lbRKC2oy70uPIVMFRIKbcNhODPRje7iFjdsSEpsUhhG2mTWrXGg.FqaHBqJmpe3SVtPM9nHloBOYU2HPpmKO_bYvE8Roto2Rpnxh6aSMTCR_m2yct2BWb6r17aUD3d4Lqr8bSxpkQmW927HMkS8Fp1nVmYNxaQdB1aSlxHbLICedqZcgwmdH2rkq8dssW6gnXpg1ULwN65z.3MaiqGbNgu1fABmUiNpL16uYHlbeARo9e6JvhbQ5upahEYsB_xDjjInE8m9TRURBUWpFlrdj_ib204w7fhbJLTGK7VZUJPday06w.yaKb7dqIClLLZL3j05QZjZosUJqKVwuZcwvhNg.KCZEb__EjFdupYV27YhU0OBJiTR2PfLOGZh8VV2AgAn4VRWGdNCMELqfMDuuivDI9PSJl9ZzjIM9V6mgQMc0nfPL6Cml0r8VqL.4yjB8uWFD0RVaUJOsciiWZ3rk_s3tZOcND59Iby.Y2CauIWbObLuQNKDbAUhhX.lLNdXrqVeeOUsYFa.KsVfJPpvmFGEshHOLcD4gNOo_j.dkDopDZ1ZbZd5eHDBay56ZVethzW05WGzIgSpusaZlhpctc9gwN.J4Ywo0kLeqxyvg1xLHKX9kZZOhveRUGR8Ji9tnuawTfCj7iPsJtWJuWgRQiITCoo6NrKcajK6jf2vySSKE5IriYluIxw__pQt6hlygqOrl6HkSlySzjBrWWWz1OeY9y92s60oTHS1Ctgv8bTuARt2ke5y13LLQ9retfkfaouAGxku7XixttGKgM6HJVz2rxmWMW9Wu9eqR4V4LfooamMjEKxPk1AVnMyANGQpXV5P1Jt30d_2QLvtP2gvXE_He12tLHVA.1zNc4pnPSnNVRk5K.23ifbIhpgENglu0u6_vp2LUJio3vCYXUoSVB9f"]));
    const motion = String.raw(__rmTpl(["H1LMuNwtMsamHk8KJ627dz.npBjTyS4SpOphCLFojwvXQeU1nBzbzGRsxQDumRj.tgV9oRH1ndxv45Asm6LC7tHGL.hXicWLxNsxaP2O1ULEorBfQxR5odILmptA6UpEKWjNRLB8cb3v5Jn_pTTEbhnb0ftB6gHNSzSRqeQAJTwxS3vRDGurPtFM9aEHROGz7xxKRyJgbDQ_H8i3F1xILBE3HqYkzlYmtfdRQ3X3ipUAkCViIxgVYu4Z_D8d1DyA5dhHkDkTcZTcf5oI3DnYI_llb28NWwwk_AV6zjF97cZ04n0goOFbTf8CL_4BksMcPV_95STqPUdiTO1DrO0o5LLBXDKKmdyNUKDp9DsQO4niBIoAXBgb0aTNMPP6RYI0Fn2tq4MW6K7po5j1lQPd6zMM_msIv9Nj7qNKGCyIbi4uNLabC6Xl_EAQQZjtl5LPGlZFufzOE34qt2Of6H9T4.M4dJ1rsqjDso3jQKZ5wkTxnKBZg3VCOILa4LKqkML9HGH6BdwrCGk3U7HQ2cy22M05jF4_OZFBwrV1uV99yAHvv5AwrpJ5kKAy3ceQSo_KVma4yCfHlywwAHtYeKutLoHvT.My_o0VO0mb.ykQ.lbRojXZUiK0fW_hFA3w4HLS_tu0LvwzfOslaxlqfq2YzFQGZfn_YM5zgvfgYR8Zko57YjGa_5Nwf0cGkByjAo0V3RZmh6KPqt7pMEsqV9sMtkptATk71sdqLKoLtA9KzPRPc1M0oqbc4JtGY7VNNhzhD5EK5MFwKjW2aATFlJ.OwJFn40URw1qlLE2T2PeOU8fL0.bpAU2OW5u1kQRI5qjovM3FxT7hbsTh7qmOVoi9PhFoFnoKM4o0WVfPlijF7Rnq3KS3INqcKZNgcknR0oBOZsdvekBhHXaC4xiVMAU4fcHo_oOwwF6qeQQb7xer0OLrdAzJy6JxhauZ7DnZmrYPAaYj_U_aUr56HTNiBMQLYiSJYjUxQkvSNkj58eqvltuk0pXuxxq199gmeSJAudWiI4fcWeydS7ECZ6shlCdIb3Fr5rniLUWaQDm.mgk9cD9ZZdNp0oUXsctMniIN04WGQ3gbDCyhy8xM.5jcCLyG0jeh4HSF3k3xfEPCn4XZxQwgk0VOb2_1VdQ9gFwcNiY_zqXvD0_wSbBUT6vDZnMYhnl1a6awrmmqcqIqVk0J5_F7y0Qv.crcUOBniDiFI8BIlYtVXqrIWBoF.cUGtpF2zSVwy5PhjTF_y7PxLTVTBqf791Y9bA4hN2sl94mzWdiJf2clwcDZqiarEFrXDmy2.rzB_q79irX.SlIpx6Y614P.Rwb26CnCAtHOrMGvKcXANdOM8AzVNyk.CuaIMvX.IuOKZLgXWsnfgjMuEYImYuoviLQ9_1CizVYDPmivbeQl2HB2AM4kOopKLd127k0iAwMEjQi8LF69jLaO8itoAGvYUk"], ["H1LMuNwtMsamHk8KJ627dz.npBjTyS4SpOphCLFojwvXQeU1nBzbzGRsxQDumRj.tgV9oRH1ndxv45Asm6LC7tHGL.hXicWLxNsxaP2O1ULEorBfQxR5odILmptA6UpEKWjNRLB8cb3v5Jn_pTTEbhnb0ftB6gHNSzSRqeQAJTwxS3vRDGurPtFM9aEHROGz7xxKRyJgbDQ_H8i3F1xILBE3HqYkzlYmtfdRQ3X3ipUAkCViIxgVYu4Z_D8d1DyA5dhHkDkTcZTcf5oI3DnYI_llb28NWwwk_AV6zjF97cZ04n0goOFbTf8CL_4BksMcPV_95STqPUdiTO1DrO0o5LLBXDKKmdyNUKDp9DsQO4niBIoAXBgb0aTNMPP6RYI0Fn2tq4MW6K7po5j1lQPd6zMM_msIv9Nj7qNKGCyIbi4uNLabC6Xl_EAQQZjtl5LPGlZFufzOE34qt2Of6H9T4.M4dJ1rsqjDso3jQKZ5wkTxnKBZg3VCOILa4LKqkML9HGH6BdwrCGk3U7HQ2cy22M05jF4_OZFBwrV1uV99yAHvv5AwrpJ5kKAy3ceQSo_KVma4yCfHlywwAHtYeKutLoHvT.My_o0VO0mb.ykQ.lbRojXZUiK0fW_hFA3w4HLS_tu0LvwzfOslaxlqfq2YzFQGZfn_YM5zgvfgYR8Zko57YjGa_5Nwf0cGkByjAo0V3RZmh6KPqt7pMEsqV9sMtkptATk71sdqLKoLtA9KzPRPc1M0oqbc4JtGY7VNNhzhD5EK5MFwKjW2aATFlJ.OwJFn40URw1qlLE2T2PeOU8fL0.bpAU2OW5u1kQRI5qjovM3FxT7hbsTh7qmOVoi9PhFoFnoKM4o0WVfPlijF7Rnq3KS3INqcKZNgcknR0oBOZsdvekBhHXaC4xiVMAU4fcHo_oOwwF6qeQQb7xer0OLrdAzJy6JxhauZ7DnZmrYPAaYj_U_aUr56HTNiBMQLYiSJYjUxQkvSNkj58eqvltuk0pXuxxq199gmeSJAudWiI4fcWeydS7ECZ6shlCdIb3Fr5rniLUWaQDm.mgk9cD9ZZdNp0oUXsctMniIN04WGQ3gbDCyhy8xM.5jcCLyG0jeh4HSF3k3xfEPCn4XZxQwgk0VOb2_1VdQ9gFwcNiY_zqXvD0_wSbBUT6vDZnMYhnl1a6awrmmqcqIqVk0J5_F7y0Qv.crcUOBniDiFI8BIlYtVXqrIWBoF.cUGtpF2zSVwy5PhjTF_y7PxLTVTBqf791Y9bA4hN2sl94mzWdiJf2clwcDZqiarEFrXDmy2.rzB_q79irX.SlIpx6Y614P.Rwb26CnCAtHOrMGvKcXANdOM8AzVNyk.CuaIMvX.IuOKZLgXWsnfgjMuEYImYuoviLQ9_1CizVYDPmivbeQl2HB2AM4kOopKLd127k0iAwMEjQi8LF69jLaO8itoAGvYUk"]));
    return stage === 'construction' ? construction : stage === 'motion' ? motion : construction + motion;
}
function visibleChineseHardLock(follow = false) {
    if (follow)
        return String.raw(__rmTpl(["FfmyR8MuBkNS0Kf7Vh_8QBaWBtD9sH3C9UF2TFq3xU4NPRYfFKaHpo6oEYj57XuC4JNydzeYXW56Qd3VkBct5fls.repFj0Au9jIcCqJAyHzXuzjw42GcEwPodJUrCMRhwL.XrTrdKCKW7gidRdKj0lwDt0iTC9JHYyMeL1R4ko7k73_5hF8pnxQWUVzCFX6hca831gyARn5sAlab8FQsM6JJci_0wgO6_uSp6z_hO2y16nt1eY1bexp4XGsplnBRL9_cjkS2NEuCXE5K10UTthZjx_6RZtvdUfZElVYqoFbOQQD4wOYp2GPX3g5i6R5G7pIfQFzc39rB54EzvBbKJAvgfILYRxH1dqlMRudnsFxjABay3sSaZUVinn04nL8pZvH1fZt7fW2ixYBLEoupxEQHcHtbY8a5XxB0bNZe_qAv3nD_z8EO068YMWPx1uFVk.xit699MY7GspsEYRXPt2QQVUVVW.s_bFDRTkZ22n45eFd2XAPX6VIam2fHho8Mjv.UyMeY2GSUAPECBSf.Rjpi_FWQWasIzT"], ["FfmyR8MuBkNS0Kf7Vh_8QBaWBtD9sH3C9UF2TFq3xU4NPRYfFKaHpo6oEYj57XuC4JNydzeYXW56Qd3VkBct5fls.repFj0Au9jIcCqJAyHzXuzjw42GcEwPodJUrCMRhwL.XrTrdKCKW7gidRdKj0lwDt0iTC9JHYyMeL1R4ko7k73_5hF8pnxQWUVzCFX6hca831gyARn5sAlab8FQsM6JJci_0wgO6_uSp6z_hO2y16nt1eY1bexp4XGsplnBRL9_cjkS2NEuCXE5K10UTthZjx_6RZtvdUfZElVYqoFbOQQD4wOYp2GPX3g5i6R5G7pIfQFzc39rB54EzvBbKJAvgfILYRxH1dqlMRudnsFxjABay3sSaZUVinn04nL8pZvH1fZt7fW2ixYBLEoupxEQHcHtbY8a5XxB0bNZe_qAv3nD_z8EO068YMWPx1uFVk.xit699MY7GspsEYRXPt2QQVUVVW.s_bFDRTkZ22n45eFd2XAPX6VIam2fHho8Mjv.UyMeY2GSUAPECBSf.Rjpi_FWQWasIzT"]));
    return String.raw(__rmTpl(["SP3GcQwpuBIMDxUT0laHJhWarPvEdq6U86fkMpBqDk.tlzEV0jqbrx6yy9HIZCYQb4r8boBO7_ynQatJHHDqw.0FqrOFBJ9MUNE8ENFtF_yK0gOrjdsMMP5jneFueA7nXFR5s0KNRDZywikCVV7x0mX9UJo87IRVWL3AgGUXKpz5kgozYN7pN6EAOLvBEyaN.aU3s8ZXo6D0Pl7mDvv6.8X902Dc.irpcLWHCGcq_3QU.alhcMLlPjmmAbgVsgB.4XubeLz1A6OJ5HdTScX7GunadfF1FAOJ.TdWFEPo1qFXT2Kf5iOn5AhQy8htSGwpF6oJK.V.Mueu_a5N7w_lywCVR0TlDw6Tmq4WmgZIToF84Xc2PnCwbUZqsswJfsEM9eQ3SjFyA4VmsEuV2hYd7yXBpSAfL1en4ng8dLYF05_IEcMEF0btckhXtr.fiva._Xd55dNPsKnJp8.aENQGCt4Xzd2b0xOqboMHhQ1bv73LeSGKaTxuAyi7CBMCzIp2mwhJgcztu4rwj71mb1f_AK_oB8u95g8tdTs1H8la3w35WX..0zBF2cW_OofzV1FU4YTJUhkDnH.EhaBW0h5AD_X2cNpWLEkvEul"], ["SP3GcQwpuBIMDxUT0laHJhWarPvEdq6U86fkMpBqDk.tlzEV0jqbrx6yy9HIZCYQb4r8boBO7_ynQatJHHDqw.0FqrOFBJ9MUNE8ENFtF_yK0gOrjdsMMP5jneFueA7nXFR5s0KNRDZywikCVV7x0mX9UJo87IRVWL3AgGUXKpz5kgozYN7pN6EAOLvBEyaN.aU3s8ZXo6D0Pl7mDvv6.8X902Dc.irpcLWHCGcq_3QU.alhcMLlPjmmAbgVsgB.4XubeLz1A6OJ5HdTScX7GunadfF1FAOJ.TdWFEPo1qFXT2Kf5iOn5AhQy8htSGwpF6oJK.V.Mueu_a5N7w_lywCVR0TlDw6Tmq4WmgZIToF84Xc2PnCwbUZqsswJfsEM9eQ3SjFyA4VmsEuV2hYd7yXBpSAfL1en4ng8dLYF05_IEcMEF0btckhXtr.fiva._Xd55dNPsKnJp8.aENQGCt4Xzd2b0xOqboMHhQ1bv73LeSGKaTxuAyi7CBMCzIp2mwhJgcztu4rwj71mb1f_AK_oB8u95g8tdTs1H8la3w35WX..0zBF2cW_OofzV1FU4YTJUhkDnH.EhaBW0h5AD_X2cNpWLEkvEul"]));
}
function visualSceneryInteractionLinkRule() {
    return String.raw(__rmTpl(["bHHnXHtRAHgGycMmhPgew9AS8qBGARzcn9sFNhQX_cBvo0DUjTixyzODF7b3fLfIGS_KqPGfAja2fwLiyDluRjm_4m0gf5atodaqa_ldn7xJr22R0Jk8W3jtcULvIxUB2TdcAxbl4TfgYVocfIDHJ78SDNhwMt3URweOEfP5Ru2iequEDrHdd8mH4bzN1JS0E2XY3mfCG8h8hYdJ1imdtxRcWdlKBuJGWd2WXaBkGUExjE_f3OdA6azCxACNPgr8fiYJhTfP1sjDwuGpobiROTrNpmwiiLrFsREzkGgDxlyUSuF9ClCx53eUMczrLY3i3r550qKfQ42.UKx_OlDRyTqRQYkUZxtDwsao3b8Sdv_d92QT1nP7v_tErplR7H6bp0J7nQ5EoOiIqTa1.pYH7.5OlHy43jjdSFk3C4uTFDzSpQ1mmVvs6TIe2Gpg.nlgPaU7gkZfSqgVNnkWeuCo2xcnWvreneILVZtAMvjt2pEgb6.peTEcekg8b5xOzq336Cqr783GpAUYt6ov0aphXmWwN1sSjAxHXHUhEayHkETql4lOoSWljdIgCyqeKtf5sn4p5izjEflnDkTJmRd9UJULH53dbBykbYagd3swUaGxSy7HDjUV1zSD.r1zd1bBxrUup409dFySM3Bpp_E9X64s21Fk964eedetL7b_GWUSsSCXmU6OckODf0JhAt5siPsgtOXPmo4bunNy4O0nVD1dnrcGs1ak_BXg8r3XWyJ1wviQI3ic_UL0YLHTN800Rmm1dgq_.primPuM1NPO_e.suKixLdLP", ""], ["bHHnXHtRAHgGycMmhPgew9AS8qBGARzcn9sFNhQX_cBvo0DUjTixyzODF7b3fLfIGS_KqPGfAja2fwLiyDluRjm_4m0gf5atodaqa_ldn7xJr22R0Jk8W3jtcULvIxUB2TdcAxbl4TfgYVocfIDHJ78SDNhwMt3URweOEfP5Ru2iequEDrHdd8mH4bzN1JS0E2XY3mfCG8h8hYdJ1imdtxRcWdlKBuJGWd2WXaBkGUExjE_f3OdA6azCxACNPgr8fiYJhTfP1sjDwuGpobiROTrNpmwiiLrFsREzkGgDxlyUSuF9ClCx53eUMczrLY3i3r550qKfQ42.UKx_OlDRyTqRQYkUZxtDwsao3b8Sdv_d92QT1nP7v_tErplR7H6bp0J7nQ5EoOiIqTa1.pYH7.5OlHy43jjdSFk3C4uTFDzSpQ1mmVvs6TIe2Gpg.nlgPaU7gkZfSqgVNnkWeuCo2xcnWvreneILVZtAMvjt2pEgb6.peTEcekg8b5xOzq336Cqr783GpAUYt6ov0aphXmWwN1sSjAxHXHUhEayHkETql4lOoSWljdIgCyqeKtf5sn4p5izjEflnDkTJmRd9UJULH53dbBykbYagd3swUaGxSy7HDjUV1zSD.r1zd1bBxrUup409dFySM3Bpp_E9X64s21Fk964eedetL7b_GWUSsSCXmU6OckODf0JhAt5siPsgtOXPmo4bunNy4O0nVD1dnrcGs1ak_BXg8r3XWyJ1wviQI3ic_UL0YLHTN800Rmm1dgq_.primPuM1NPO_e.suKixLdLP", ""]), VISUAL_SCENERY_VS_GUIDANCE);
}
export const RABBIT_MIRROR_RUNTIME_ENVIRONMENT = __rmT("dPqouh_KD9DNf9xPLp7dLik_ptz4Fr1xqQ5gYMqPONHUsblnBswwDpuj0VWKlMAtKl8ItDA3Ghd5HGsRFufk13srWQHvXZWfOqDr6oyER92GY3_prVgTcxx.Nbeuy8zilDGMCTPqhfFTXL0jhO4NVSdCfqfMJN3VOnD78SAgZNXlz623Q87UkS0oi8_CHLH4.X8jdeWFAYupftz4CMapKJWtS8dUXE9v0ZVY3Kg2F7UD1SEanbWAIDD6Wz7J6E0XnLbezKVyjm8wqkBp2JfadtL1dEVNRmzO1gQ.DcjLSBe7Usg1nXLQth3cvAxbChO_plu4jyN2n4HaaHCtrCUaaibY9CgwBicSo0YLr0Lrhv58NLVim1HKYO9SMEiX4Xk2F809ETFCoCanpNr1cbgPgjdSja1LqFP9m3JxMgFuzl1Zd2b8xDL66kI1b_x3AnAWGSEeFvrGwqDpN14lTFzKcT9erPQvIO0ERdZUqfjnsoH6ve8EiGuQSoAZu8YiQ.bNwgwcd2KM2Db82LISgXNapLT7kWIVUImptRPXY17aPSp_ztp16YXxXCsZb.AODq9e7iDWLP_8nNeV7ghUhFvVA0qxufPcLXoezKix38YZ8VuMhpapAHQmqTyaMsFxLZgdKXlbYeLS8HUCN75.8Mbduy6nxyTrMXpNsXeBIAinvDD9u2yNdNFj0FLV.qqbgwJ7ssPhmbhKT7hsHERcUQ7GbIiqy.FkeVMPJAVZOGVZvFtNd3lfqjGoIrDHD9RIqNgXaTDSsTYGwoL54yfrGCNncwBvjzhtL.dxT8ciEgM4AHcJxoleovewfKDjg1Wr3zrOI3vy3ZUkFnk3RTRI6GHdx5Om40qUOOD2geme4LZxwE43sMbhAjYDbZZp9i0e7ilWxAC4WLtZnaF7jY4vTspkKmUp57XIeSHtD9kwNBtpMLn_jghrx4Xd6fWKc9ZPajjoe9lqLL5YNV9S2RntdK7Fr0IyD5RXc0znjEOZsbynJGqspqwchYRbMRpXjRyb_FvFXfMEeZOzVLPnLioxDgo_uhHRyl2uU5RPcgNFMvkFN.AwMqfSdFsfJlfx2zHfFShe7bYKF73OguJRP5A_rR8VIoMvf6GMnuvb1fUkAvW7VviTS2DUSWm1UMT79OoqwL6xBgOQbbL_mGrKHWV38PKaHGwLjMQhUuT1I_rswuvzKS9zU8oGLPiFSMoRNPz.916IiXxwuG1nIkaAeRPFiMoyEsGkrqY");
function htmlSafetyCore(htmlFaces = null) {
    const scope = htmlFaces ? `${__rmT("Lu.mavdShjIPkSGwR6FkvnCx")}${htmlFaces.join(__rmT("jvk"))}${__rmT("qGyf7aop")}` : '';
    const htmlLines = [RABBIT_MIRROR_RUNTIME_ENVIRONMENT, __rmT("01H_95cFtx6pRwSb7aStnJ9QfRDwcinTWqjmIIjd.frLINvosOkxCYCK58MW5VJfnkghLY1FgStCER5iF0SNR7RUyMcG.fwJNKA_.fiti0WQlv8TYZi5K.nowvZN8CSBtQSXEz3Nx67mH8j84jO5p52BCs4rGu5fVXwtaopsvi7u8xBfQwChb_W6f.qdHY7EFN1GzZYNo4aWF0bFMQCAJFg.tAV9MzFR8NeqQsOX")].join(scope ? '' : '\n  ');
    return String.raw(__rmTpl(["7iv0k5KV1i0IcJObJmYOlW66D3q99wghWRq2HGfWvrD99x.VJIh75kpJPpmA4aaEKTJ7mHWIqt57OlFz2b7Al8.ey5w98H5iAn0E8pDf14WMgs_NYR87sf5tfalBD5zHB1Y6ABK0StQd8JW82YFHTrixKiO5I_9x_HKkCoDD2slrRIdwwdIYeVnUrJH6bNjai28m0sZVEt4pxeAS2FkhDU3X81l43eS8.Y5eW71W48NW6g4k8.5Kzg1A9J4QVFIfuceqqZW5jaE", "XF3x5uJMJGmSDA_VccdW6bYnhys_kQrxBGiDOkE7fVQ5NnHvlVoIt5UfhSZIcj_xHvbuA4vAVAD8abtTaAJy403VVZe507wZOcZ6D8c7rxiEyI8OIHEPybDQKWfRP1u5p8likiR3bYlc1CiJhReMJpwERKc6XL85ftFny_j2UwCn8qRw"], ["7iv0k5KV1i0IcJObJmYOlW66D3q99wghWRq2HGfWvrD99x.VJIh75kpJPpmA4aaEKTJ7mHWIqt57OlFz2b7Al8.ey5w98H5iAn0E8pDf14WMgs_NYR87sf5tfalBD5zHB1Y6ABK0StQd8JW82YFHTrixKiO5I_9x_HKkCoDD2slrRIdwwdIYeVnUrJH6bNjai28m0sZVEt4pxeAS2FkhDU3X81l43eS8.Y5eW71W48NW6g4k8.5Kzg1A9J4QVFIfuceqqZW5jaE", "XF3x5uJMJGmSDA_VccdW6bYnhys_kQrxBGiDOkE7fVQ5NnHvlVoIt5UfhSZIcj_xHvbuA4vAVAD8abtTaAJy403VVZe507wZOcZ6D8c7rxiEyI8OIHEPybDQKWfRP1u5p8likiR3bYlc1CiJhReMJpwERKc6XL85ftFny_j2UwCn8qRw"]), htmlFaces && !htmlFaces.length ? '' : `  ${scope}${htmlLines}\n`);
}
function readingTypographyRule() {
    return __rmT("jI5.9sU4SUKuDRIXbmm2GjpEsdhyydZZ0Qdqe57CMqLdtplJx4veVYpXLogLwfzxi0TJro7lZhHgEPxjsc9CS6tJAXXA6v.0s8SF11kBhGMmaZa3Vua6r3RHW4dwpMS.U1n4Xo80KuEsl0Nw4HJ4Np.aJInzTow10fUthplbzKfcQhou3eHfMpzhOVrgGzUDzfqXl.STMV_jSP6asI6D7lqR2eAGrRCMcSVch3h5KPBbD9QFV4IqHRkcw16BhjNfWcKOZBR3Ofmq23L4PW7JM.pWd1Kl3iQz2rfDkHRA5cQIdYFvT5xpo327dcqM9c4IileNiDJfN3S6LJXlXuANB97IUpOiVUsCJy0c_0Ez22MInG2AlvbaRNGmjy3cv0kf4z51bLAc9RlYI2SWI4Ei1TlQIRom9UOzB3Xqgv.7VG.7HTqmOeNallq9IXdOatGq2RDFuz7O.M4PbTHJumPbYvVkUyeXBrH1oE078NRvkPTdCmnlKJVMwuK.rF8VjhW4boMC8cHt3FCJ3txoW7WDaBd0aj8eTbpZMeiU28sILA1QcSNRa5u5YzFSO_xC3Y3S83AEMcU9B1Ir.aFsc6Avk.LrRRV.hk");
}
function presentationEmbodimentRule() {
    return String.raw(__rmTpl(["9Ljo.pg2Tq0PBrwjQ3l2iaLB5AK3ydJqIof9woVrolAdU0DPNmZItzp4JLy9cd0_el01qEEfMsVQdhl3N3X9x5Haw42VjZ4uEW09XSWqHHb5by0CLMIiWhDjBcM3O.Rd2Rj9u_2aHqYPIS5Vwbq4uYyt7A6JJ_Yalbws8LGbGI4vnl3XGHQCQqaCbJhphYaw5ZcT93csjs_y3MgozEK8WiB1Is_Y774eIbeU1oihf9NIczttwGCseftOQ9fNM6Qy3xqBpoyx5marU_bxx5U9MJXlu2qyW5uv_BJsqNzhZi0Z2kVlJaDnPvItSGoSwt3vZQBVsARhqVH0J15U9FSJb5ipVhXQspVkk9E5IjQipeYBzwyiDzV.zg2XQUocbp2DYxYwW7RRl6R20IwXVNnKZjdEUvb5I2DrAVSrGku0lQWfQKKyG4Cddk4BkQ_yRh1ndxgEu1J5Yzml6HBZGBb0JZ6ro2DbAA3Micv7pQMiYSo2.3PpV5ympgxswpm2BeFrGm12nGbjynmGTYfBcKMvVHY6JCHS7KkE9rQLVON.YcasGfMeUc2EoF._7gU6WHeO5UalQwtWNdW6NG5dYN7O3Ftd_1rdv5T.lPyAxbOjcfbPpQOggP.3ex8PSU94YhtcCxGxwQKSaE0Ig1q_3jz37T8H26u_FYj.mWXXG_bS.hyHzZlXx4Q6FCa_H5JiaFft_u7y36HNVI9pU57W0f_RyGghjZBB00DzEqiD2HaiVTa4cweFa2.ZhiETwfobsYnlmMCm4xZqdQgm9XfaccZC98VBsRqwOd_6HpMVCKUBnPh.xeuL7jNonXj6XNUBkr_PslOUP3cCfud7luc8KxmPm0ZVjrKp4BO_ybbTzcV.lDByULDIYehVHuZapepwW9onszvixjYzFi3jSQ_1xIoquvPx7casTL8TDzBvyIjeSdg32S.4c0CYFH8SVWkBgwwo_Z9UGbsQ.GmRkcjyGWVnNqfEDDI5p20.l5qr14jGukJJAm6Ax27sX6sb4jpnTy8RyNBUfNnE9ne36.nbkRiT0b.l1hw8dsVr.WoyYMy8MFUVqEh_JA.RbPtwXTSrejdKQs53gOHqAsM6x.q.6.tEwerGba6Vwsn0wf5T724ueN8lR8.JKv7Atztm5OWJkQXSoYBDuruOdLlU2t0a0B.SZS9BCjYh7gsjK8T.q1SS7KGYye3o2FuFwy48.MM8QlP7sLue3Ht95oR5Af3TdPiMEIN2OkLGVCTqkwTrIk3kI3Adiz_U8oUXtbzcrZF_Hs.xkHXFU9LOdn2T8Xp8IcamKmpaxmjhMQGvMiK8nHiZ9b0G0OW_kkuEIeLdEV0IIRVeFaHGFW6sNbRO1SJoYCNfcF2CkglMdq90nYcEIdTohYuL102gGQxVidCyg.izciveKYsCVlHSX7r2GydrSC7O3DQNYyRJH8vx2lq9KQTW82nchPyvapSti182brOIyG8.sX7YRGj5P0A0uFa27Fh_za113Hp13qDSP8RirPuQCcWc2mS_8ijOWKVJo8yTU3yZiQ7cqgIBq_ulZq1MWhqEpA3hYoJEfWlQuN4TyWoV8ZmY6WX6PYkkOc8Qn4xus9slj66hoNiyhV2829n_e6ZVQzB9xexqpQzDBgRFlUR3p4aDcJbSDFV0B1N82W9vTQ3OYj7pNodcivNQMofpcnfulMlh8H_VNvNhnpSL8Jt76JVhIbHXP14zRVRiwiVAUginjtEnFpIhGAWoqtPrvA1vxg5lOO1lRQeuzm2qPRPXpmX9egrDt9o3UpSSdl_TLPNAIluOchnLvVCBxHQmGIjsjrY54OZ2Qg5zrvLAaPWgX7zmdNGFhOz3GL698.yKChtr2PDpdIv3YTGItCRLc9eX1ycfmEPm1Jv1hyOjcSc13VfamO3Z.t8Dwqz5UYwWsc2Btbbl8056gSt5VN0aAWNvYEXjsB2oN_Z9fkXGjuIXTcfx0fuFvzfP9JBaU1Fx6tAK7tSjQJzbpkRdC.CMfZCbAzM_NMT9WVSnS06i5u4Jl4Vdf0tX5us3F9vVZ09y2bB8Bugd.k51gAegePHVkPze1p5puuOFuSZvk3Gg1GjjqOiKD5D8gwE9kBp_6wET8vy_11a4cMJyIJxLoqTFV9rjWImN3RkbRlnzS3TGrOHx4Z2FRwDMgp48cX9Um958eYtRmHpg_Y2iCR2onEOH6X6y3zSDp8ZRiXPXNjfczl8Hi.tDq9b71AMTc_inp2MgzxuhrIKLh5rzFgiacrspSebdrdV2By.QTn3bhX2MZmUEUA73zX3keBnYNTs3Fg7XthYV7P5kXCRzK342Y99H1kdzqwVaKQuxptzf9lTkiglRxY5w7kKiWBBdWMHYRM3ejSjU78Wn0UWjXRSyw.XUADh_FvZyZzem8U_c4jLKhoB3k.6OQh8CvEpVUj7B6InAL9MrT1z3pccYrMS7wr2YtU2LM5RiAAoH7x47Kz_KJM0816S3MoPbMpHZWxJGdaUSdxMvqcX4cb0sRVcX..r13g6NdLD0PAl"], ["9Ljo.pg2Tq0PBrwjQ3l2iaLB5AK3ydJqIof9woVrolAdU0DPNmZItzp4JLy9cd0_el01qEEfMsVQdhl3N3X9x5Haw42VjZ4uEW09XSWqHHb5by0CLMIiWhDjBcM3O.Rd2Rj9u_2aHqYPIS5Vwbq4uYyt7A6JJ_Yalbws8LGbGI4vnl3XGHQCQqaCbJhphYaw5ZcT93csjs_y3MgozEK8WiB1Is_Y774eIbeU1oihf9NIczttwGCseftOQ9fNM6Qy3xqBpoyx5marU_bxx5U9MJXlu2qyW5uv_BJsqNzhZi0Z2kVlJaDnPvItSGoSwt3vZQBVsARhqVH0J15U9FSJb5ipVhXQspVkk9E5IjQipeYBzwyiDzV.zg2XQUocbp2DYxYwW7RRl6R20IwXVNnKZjdEUvb5I2DrAVSrGku0lQWfQKKyG4Cddk4BkQ_yRh1ndxgEu1J5Yzml6HBZGBb0JZ6ro2DbAA3Micv7pQMiYSo2.3PpV5ympgxswpm2BeFrGm12nGbjynmGTYfBcKMvVHY6JCHS7KkE9rQLVON.YcasGfMeUc2EoF._7gU6WHeO5UalQwtWNdW6NG5dYN7O3Ftd_1rdv5T.lPyAxbOjcfbPpQOggP.3ex8PSU94YhtcCxGxwQKSaE0Ig1q_3jz37T8H26u_FYj.mWXXG_bS.hyHzZlXx4Q6FCa_H5JiaFft_u7y36HNVI9pU57W0f_RyGghjZBB00DzEqiD2HaiVTa4cweFa2.ZhiETwfobsYnlmMCm4xZqdQgm9XfaccZC98VBsRqwOd_6HpMVCKUBnPh.xeuL7jNonXj6XNUBkr_PslOUP3cCfud7luc8KxmPm0ZVjrKp4BO_ybbTzcV.lDByULDIYehVHuZapepwW9onszvixjYzFi3jSQ_1xIoquvPx7casTL8TDzBvyIjeSdg32S.4c0CYFH8SVWkBgwwo_Z9UGbsQ.GmRkcjyGWVnNqfEDDI5p20.l5qr14jGukJJAm6Ax27sX6sb4jpnTy8RyNBUfNnE9ne36.nbkRiT0b.l1hw8dsVr.WoyYMy8MFUVqEh_JA.RbPtwXTSrejdKQs53gOHqAsM6x.q.6.tEwerGba6Vwsn0wf5T724ueN8lR8.JKv7Atztm5OWJkQXSoYBDuruOdLlU2t0a0B.SZS9BCjYh7gsjK8T.q1SS7KGYye3o2FuFwy48.MM8QlP7sLue3Ht95oR5Af3TdPiMEIN2OkLGVCTqkwTrIk3kI3Adiz_U8oUXtbzcrZF_Hs.xkHXFU9LOdn2T8Xp8IcamKmpaxmjhMQGvMiK8nHiZ9b0G0OW_kkuEIeLdEV0IIRVeFaHGFW6sNbRO1SJoYCNfcF2CkglMdq90nYcEIdTohYuL102gGQxVidCyg.izciveKYsCVlHSX7r2GydrSC7O3DQNYyRJH8vx2lq9KQTW82nchPyvapSti182brOIyG8.sX7YRGj5P0A0uFa27Fh_za113Hp13qDSP8RirPuQCcWc2mS_8ijOWKVJo8yTU3yZiQ7cqgIBq_ulZq1MWhqEpA3hYoJEfWlQuN4TyWoV8ZmY6WX6PYkkOc8Qn4xus9slj66hoNiyhV2829n_e6ZVQzB9xexqpQzDBgRFlUR3p4aDcJbSDFV0B1N82W9vTQ3OYj7pNodcivNQMofpcnfulMlh8H_VNvNhnpSL8Jt76JVhIbHXP14zRVRiwiVAUginjtEnFpIhGAWoqtPrvA1vxg5lOO1lRQeuzm2qPRPXpmX9egrDt9o3UpSSdl_TLPNAIluOchnLvVCBxHQmGIjsjrY54OZ2Qg5zrvLAaPWgX7zmdNGFhOz3GL698.yKChtr2PDpdIv3YTGItCRLc9eX1ycfmEPm1Jv1hyOjcSc13VfamO3Z.t8Dwqz5UYwWsc2Btbbl8056gSt5VN0aAWNvYEXjsB2oN_Z9fkXGjuIXTcfx0fuFvzfP9JBaU1Fx6tAK7tSjQJzbpkRdC.CMfZCbAzM_NMT9WVSnS06i5u4Jl4Vdf0tX5us3F9vVZ09y2bB8Bugd.k51gAegePHVkPze1p5puuOFuSZvk3Gg1GjjqOiKD5D8gwE9kBp_6wET8vy_11a4cMJyIJxLoqTFV9rjWImN3RkbRlnzS3TGrOHx4Z2FRwDMgp48cX9Um958eYtRmHpg_Y2iCR2onEOH6X6y3zSDp8ZRiXPXNjfczl8Hi.tDq9b71AMTc_inp2MgzxuhrIKLh5rzFgiacrspSebdrdV2By.QTn3bhX2MZmUEUA73zX3keBnYNTs3Fg7XthYV7P5kXCRzK342Y99H1kdzqwVaKQuxptzf9lTkiglRxY5w7kKiWBBdWMHYRM3ejSjU78Wn0UWjXRSyw.XUADh_FvZyZzem8U_c4jLKhoB3k.6OQh8CvEpVUj7B6InAL9MrT1z3pccYrMS7wr2YtU2LM5RiAAoH7x47Kz_KJM0816S3MoPbMpHZWxJGdaUSdxMvqcX4cb0sRVcX..r13g6NdLD0PAl"]));
}
function presentationExecutionDescription(item) {
    const summary = asText(item?.summary);
    if (summary)
        return truncate(summary, 86);
    const raw = asText(item?.raw);
    const heading = asText(`${item?.id || ''} ${item?.title || ''}`);
    const plainRaw = raw.replace(/^[\s#*\-]+/, '').replace(/\*\*/g, '').replace(__rmR("yoXZgeNSQR27_ltuPt4SHT", ""), '').trim();
    if (plainRaw && plainRaw !== heading)
        return truncate(raw, 86);
    const children = FORMAT_ITEMS.has(item?.id) ? PRESENTATION_FORMATS.filter(child => child.id.startsWith(`${item.id}.`) && asText(child.summary)) : [];
    if (!children.length)
        return __rmT("WUHbWrsysEkoRIJavMKBd8uTz3FPPsN9K7_7UzmuEHTs_ktokJx89ySM92ZAVXI7Uxp");
    const depth = Math.min(...children.map(child => child.id.split('.').length));
    const examples = children.filter(child => child.id.split('.').length === depth).slice(0, 2)
        .map(child => `${__rmT("YSk")}${truncate(child.title, 24)}${__rmT("Yvk")}${truncate(child.summary, 70)}`).join(__rmT("7os"));
    return `${__rmT("19btuHZq0UCXZaf_M5uJIS7UykDx7tGpHqBvPmj_92vm8qBJzN8Ulko9P.MlC_8wCsSYB7hmDYV.oY1AinzXZzrZp0dsqHqV_defzbOmsI0H9bOVE0fq7ugFhSUSyuA9mrehrYjM")}${examples}${__rmT("sSAzp..MhoRZa5CepAXoezdKxc9qRCjAwTGiYoNWkEK58zQX")}`;
}
function compactPresentationExecutionContract(items) {
    if (!Array.isArray(items) || !items.length)
        return __rmT("ntvm1jQ4jv3_P7cEMSAwZbyQ.GfqZOoPcfNxbh");
    return items.slice(0, 3).map((item, index) => {
        const id = asText(item?.id || '');
        const title = asText(item?.title || item?.id || __rmT("cyZtO1kw"));
        const summary = presentationExecutionDescription(item);
        const identity = id && title !== id ? `${id} ${title}` : title;
        const role = index === 0 ? __rmT("x_af0qDC") : __rmT("5p7qA0nrSDY");
        return summary ? `${role} ${identity}${__rmT("7ys")}${summary}` : `${role} ${identity}`;
    }).join(__rmT("7os"));
}
function compactComboExecutionContract(combo, candidateFaces = null) {
    if (hasAtmosphereMenu(combo)) {
        const grouped = new Map();
        (candidateFaces || []).forEach((face, index) => {
            const contract = compactComboExecutionContract(face.combo);
            if (!grouped.has(contract))
                grouped.set(contract, []);
            grouped.get(contract).push(index + 1);
        });
        const checks = [...grouped].map(([contract, tickets]) => `${__rmT("FKt6fVc6")}${tickets.join(__rmT("jvk"))}${__rmT("N_wdMJmzWZY")}${contract}`);
        return [__rmT("RxpS52Cf1_pqtWu1wbKytlplg60CuUYIYsIoie6DCnY56PPTeJkspoB4H5cnJII6.03BhaoVdfHvyCWmyvjKQk_d.gWfyr3zQD_cF5oO"), ...checks].join('\n');
    }
    if (combo?.visualSceneryCombination !== true || isTextPresentation(combo))
        return compactPresentationExecutionContract(combo?.formats);
    return __rmT("5MHPVx5j.m4kSvy4eGNM82S1pF4tHqFrJyNY9G1ES4mEWiM03v0O_sGraG0Gq_RT7ZdfHoeXZIG") + compactPresentationExecutionContract(combo.formats.filter(item => item.id !== '10.2.2'));
}
function presentationExecutionOrderRule() {
    return __rmT("u6DI7L0zAf9moGkR7jyQ8tKREGuDTgB3xTOdZHOiFcgD_EYTezHPanKJU2e.xJFcmG2YwrOLIsefwUkbPIGkAbuAb02VjycPqU8ApD9s6KMuZYxZNkl7URxMjjZ3XNGV9qOF7s8qIR2u4PhDAvObtPO.xTdp1K5pSwxxybBFllfTE.JVwsHuHezygkm1W93Nk0wTZSqiUTpEZfay7HHHVVNbi97Dngt84Yw7qTDozu4OlYGVqqg5NfKm");
}
function presentationFinalAcceptanceLock(combo, includeExecutionOrder = true, candidateFaces = null) {
    return String.raw(__rmTpl(["jmWNuiW_cVFraSV0fiiNvm2RC6Er9MOBlLvlJv9CW49Unh", "NyXGACvSeRN._RJrSNm_Lk", "WB19_BVehLTyPNKB5B67xijpmJVYfGe5CxPLQOs41md0EYlOwpaHM83JgHV1e_3DdGnxrFapCy.9XJHbxyJJiIR46oavCjAMBNzuj028yT6Q2oSjNT2.AJpri1G1ovw1..aFKyCD6g4d02GHVDCEJXeKbVhIerF2S4.Mr1GCqtohBaqsMeaNxArSnnmpVhaA4St3mSLic.1pYAAYvbsfg9Au6R5pDzAgBNDtH2cwXV8p4wpahfTS9za0mScPJUB9AYc5h.xzSJNleSStIBryGh9Msshdz94WFT1MUdXAfSMpC.pdl2GCo5XyPcHL0sYf8XRL1egK"], ["jmWNuiW_cVFraSV0fiiNvm2RC6Er9MOBlLvlJv9CW49Unh", "NyXGACvSeRN._RJrSNm_Lk", "WB19_BVehLTyPNKB5B67xijpmJVYfGe5CxPLQOs41md0EYlOwpaHM83JgHV1e_3DdGnxrFapCy.9XJHbxyJJiIR46oavCjAMBNzuj028yT6Q2oSjNT2.AJpri1G1ovw1..aFKyCD6g4d02GHVDCEJXeKbVhIerF2S4.Mr1GCqtohBaqsMeaNxArSnnmpVhaA4St3mSLic.1pYAAYvbsfg9Au6R5pDzAgBNDtH2cwXV8p4wpahfTS9za0mScPJUB9AYc5h.xzSJNleSStIBryGh9Msshdz94WFT1MUdXAfSMpC.pdl2GCo5XyPcHL0sYf8XRL1egK"]), includeExecutionOrder ? presentationExecutionOrderRule() : '', compactComboExecutionContract(combo, candidateFaces));
}
const LEGACY_EMBODIMENT_FOLLOW_DROPS = [__rmT("kbLJwT7MMxvRLfRfpzaK5b0fbXWNI_qOruLUXv0ECA4CsioSC_D"), __rmT("Szdu_aZjBEdVypuG1zKQVLW7j1Sw7YMkDK_RE4b6cPCx0Z.TO1DgZ0lTCop")];
function legacyPresentationEmbodimentRule(follow = false) {
    const rule = legacyPresentationEmbodimentRuleText();
    return follow ? rule.split('\n').filter(line => !LEGACY_EMBODIMENT_FOLLOW_DROPS.some(prefix => line.startsWith(prefix))).join('\n') : rule;
}
function legacyPresentationEmbodimentRuleText() {
    return String.raw(__rmTpl(["aScfOkSbeMsbnPgtl.xJrc0F6UXdSeA71D.g1ZUtf2S2b_cnn1xXWM21pmrFoWo2tTf_gWNMdsLdeqr48IxlUJeIpUC..F1jCxknQgl.JXDeiJpvZZ8LsBuuHwr0x82g1OsZUINAPTD7hpk9Gewg_fIeVXltBF.I9_Gh0bpuWhCUF84T81.b6Y5UPr4ZjFHmr0bkOEc1GUgbKcETUr6bibRd2HhxmDqjzRrG97Emq20CeFHu2XuBybM9ar9sEVwSklzW.Osz.ryjodmyprB7_nR3LUV.hwoQaro5m9_iP9Z.IsRPy6d7BxDxFiISVngDcoan2N6FhYev1bpzAmIU2Cvh3cXqi2JDvchBqfh8BJfjrsFVndjESdg504zQP.DRsreW_af_NCcmyZuE54FumFYl2Pu_KHjIBGZ0kCatiYAku0ScV03LDW4aRpT9R40tQ8JgLiJE3vwEHWVi3x07VDk.AbBYdyPAgN1eX49_EZc5FfhHMnFw2HLvegKsSzZDK1uznzeEgrYEkhfwKnZsJiK91OLZiErpHnVEBQllOsizPdvc0Cvk4dzhbPxjJ1Ybsv6hQ1mJbuJVyKp1xUgmGNmWX2TlF_B6ezMKcOM8CoaX.cqwjXrB3oOlOvi0rLr7g.TXDFT.vTW1rPJQOcB0816qQL0C9_nyRsIg8YBUpN4bgXgKPnNk6.WkpINFq.swEH4BMPcZeLYyyZf0fyuBN4n.RrULMmYJog.3Ago66M09kgLjJqsAKtzwwGhUHnQv9Dv.EHHhU2NeLtO4WtDkj2UfsRfUXqt9ZEWFOCETtqMoV7z5527HxR1_i_nR7Jp2D0Q1l7J4lh2TMN6ZEv45i9L6rG3T.oVKohBjeEuFM6YyHlh143_B9YigJ6ljH5i8DI4W45MmQZZvPMRwCfdXUSaqGwgaSavMhAWgoVvCy4iORNJ_EAnk8bVaiXpVxUOxrCsTbzpszC1jym58PuSVB7phGO49mJjfMCGb2Qe6ALCvciXCgqPEERTgIpTIUsf7O9ij1szoFK2SrqDFLeVK.PMGGHLmZtUprZLTUrfh27MSFCNsozIErAlM9qGPnqV7OXobUj2r01F5.ENFmkJRI4LU8fImu8eOYlApBE92FPtv3oVmlBVcVRV9JGxIwsB2DJwXUrqPH7A35BFdRtvB5Bq8YTw_35_q8rEyX0ExbmI8Pyz4833xuZJ7mH5RvQuiQEZnosRydONKljg08dkdk81bKi2_B7i9Hhtq.C4MI2phjdQN2Js_T_ZKXAEgC2wDXnKqJ3C5AH96iKsQhcl8sUQRy7v_5MZix1Valg2gADzjAwnjIomJV21g8AhFGNnGKXPpMk8j9qT7V5RuYu7vbzSt4V3MquF6nlPXYgCV82lNlDwv3qiVbb0LqtTIVLHgY5yAIUo2jX1T72HICilBeZtZGJv3FlS.b.TTRGOygZuknQp3Z..dtoaDtEgFn34eGrgPG00t59YBy0Rp.9PHuOM71xtG5wRqCbdv_GMoN8hML2R3EcMJbCnw0GtfyrkBvMSiukIh.ltLACbnKGtBgXuoMGKLVXE9Vub9i4IvrciC0JmL6hU4nxqfjTPA5VrgJ4cRpgRyxvr3Ch6KZLd7Sf6V7xZDAhLz5MvaMZS2lsAbqvRmmrnbkktxUReLNkkpZ2fSDLHp0NIEWC.NLy6FOKVVObUbVtV4kGTBZYJ1w5uPSwpoN25Ko9.mllOp5baPCMIqrqBq53DK5VA4__kABU9az_az2xeVb_Ru9MR77j7ed3S_88wd_k8JSPFRh.TiHZT0eIUb26Xr.DeIMMsHq8Dm25eoamriDkQ2MRXDr23XTYanOTOINhADCWPiggD3WD2Zl4noHEt_O3wYW42CQCVHS5.U_FHvMcUQk2cEX14cSweO3GE1sZxxFKUChA2BkZ39PoUuT.ode.efxxQAYE3ZkHKef4jCRaBnxwuWHzrdOZMhabyWBuXJUExoMMknQZgNKwpgEcVPQStae_mZY8BP3hYXeYoVAPELqsbAKPuDeqp4pYZXm9ZernadoRCzqMHsBNNKAM0kbfd_KrzWevd2okN6wJFSlzgfs3hmBXY.RzTGKrKRmOBZyqNyfqwowhKjmMg0mXrdb3gAO2Dtz4ULbKj24LvWLzEnmnNBJf0XkOHkj5BP7FZNLiOT8WhZPGEq0eX1YWyVSRSl5wp4xWVJJZeUaF5IUiVl3xlXbLJJa.bdm3NVTk6dWKFFztnXqALnUztipGL3.P5TuvQbZDqirWft42VzbyWP_ruOK07m3bt6qAtvj6Lr833EOk5K_ljgCptPSffkYmpFk8df.2QSeFbiWdg_YTiMpXdJu7Z9MeWzcNeQDPC.J_yiwXLZBliOuoFyQ.TnJQuHLkbzTCOZJ7srb9GA50TXjXJkYS2BqWDU5XtK_q1peCDUc0b6AWQSI.H5lmP4fe3TFirXW5reT8PuHqIzg0vdm68ITeewYVNGR6mb11OlxLwRuRoBDayja7TTbJPMODxKnRvMta93zG6U_73ocKEYT1KddwlWnkF1Imi_xb8hIDt7Mgmu2oQEW7rsv1R8sXZ_0j1eyX7yIYe0Z4WU8W1ef27We5mXSo.6efBkGyWeFjjoVnMvWnaSE0NrFXEJ25Hrr7zOiiSpu9JTLtveNp8Q0Ea_ScpZZxsN3ThMkQoKjEvaY9sTd0IBZFEGuoaygbBVjFHYf4iSE9RW9.KHV5i9p9xLU1_UAnxqcGQa2qY2ikSIMBUIF0OMxiD.JrhL7jE8J_ABXXDy2YpTfQP8vfgWK_vhxRBNfFfhIBWFvwD9G1D5htXIncgHPaKpUnSzDqn3L20HDCcI3s4CtZLarL9otV6msc960BNd.FO15llRG2prghchvv5t7ikG4VuzUHkj4EXTPp2fnu.LHlRxnc3izzPtSEzfHeO7jHgj8fxxa6_EvQeuik0TM4Q_83gHT9qk6Jf9CEiC61EKCRvOTDqZJE2PuFMRDm.zsTPuP.dcwEe..VGX3piGjtUC"], ["aScfOkSbeMsbnPgtl.xJrc0F6UXdSeA71D.g1ZUtf2S2b_cnn1xXWM21pmrFoWo2tTf_gWNMdsLdeqr48IxlUJeIpUC..F1jCxknQgl.JXDeiJpvZZ8LsBuuHwr0x82g1OsZUINAPTD7hpk9Gewg_fIeVXltBF.I9_Gh0bpuWhCUF84T81.b6Y5UPr4ZjFHmr0bkOEc1GUgbKcETUr6bibRd2HhxmDqjzRrG97Emq20CeFHu2XuBybM9ar9sEVwSklzW.Osz.ryjodmyprB7_nR3LUV.hwoQaro5m9_iP9Z.IsRPy6d7BxDxFiISVngDcoan2N6FhYev1bpzAmIU2Cvh3cXqi2JDvchBqfh8BJfjrsFVndjESdg504zQP.DRsreW_af_NCcmyZuE54FumFYl2Pu_KHjIBGZ0kCatiYAku0ScV03LDW4aRpT9R40tQ8JgLiJE3vwEHWVi3x07VDk.AbBYdyPAgN1eX49_EZc5FfhHMnFw2HLvegKsSzZDK1uznzeEgrYEkhfwKnZsJiK91OLZiErpHnVEBQllOsizPdvc0Cvk4dzhbPxjJ1Ybsv6hQ1mJbuJVyKp1xUgmGNmWX2TlF_B6ezMKcOM8CoaX.cqwjXrB3oOlOvi0rLr7g.TXDFT.vTW1rPJQOcB0816qQL0C9_nyRsIg8YBUpN4bgXgKPnNk6.WkpINFq.swEH4BMPcZeLYyyZf0fyuBN4n.RrULMmYJog.3Ago66M09kgLjJqsAKtzwwGhUHnQv9Dv.EHHhU2NeLtO4WtDkj2UfsRfUXqt9ZEWFOCETtqMoV7z5527HxR1_i_nR7Jp2D0Q1l7J4lh2TMN6ZEv45i9L6rG3T.oVKohBjeEuFM6YyHlh143_B9YigJ6ljH5i8DI4W45MmQZZvPMRwCfdXUSaqGwgaSavMhAWgoVvCy4iORNJ_EAnk8bVaiXpVxUOxrCsTbzpszC1jym58PuSVB7phGO49mJjfMCGb2Qe6ALCvciXCgqPEERTgIpTIUsf7O9ij1szoFK2SrqDFLeVK.PMGGHLmZtUprZLTUrfh27MSFCNsozIErAlM9qGPnqV7OXobUj2r01F5.ENFmkJRI4LU8fImu8eOYlApBE92FPtv3oVmlBVcVRV9JGxIwsB2DJwXUrqPH7A35BFdRtvB5Bq8YTw_35_q8rEyX0ExbmI8Pyz4833xuZJ7mH5RvQuiQEZnosRydONKljg08dkdk81bKi2_B7i9Hhtq.C4MI2phjdQN2Js_T_ZKXAEgC2wDXnKqJ3C5AH96iKsQhcl8sUQRy7v_5MZix1Valg2gADzjAwnjIomJV21g8AhFGNnGKXPpMk8j9qT7V5RuYu7vbzSt4V3MquF6nlPXYgCV82lNlDwv3qiVbb0LqtTIVLHgY5yAIUo2jX1T72HICilBeZtZGJv3FlS.b.TTRGOygZuknQp3Z..dtoaDtEgFn34eGrgPG00t59YBy0Rp.9PHuOM71xtG5wRqCbdv_GMoN8hML2R3EcMJbCnw0GtfyrkBvMSiukIh.ltLACbnKGtBgXuoMGKLVXE9Vub9i4IvrciC0JmL6hU4nxqfjTPA5VrgJ4cRpgRyxvr3Ch6KZLd7Sf6V7xZDAhLz5MvaMZS2lsAbqvRmmrnbkktxUReLNkkpZ2fSDLHp0NIEWC.NLy6FOKVVObUbVtV4kGTBZYJ1w5uPSwpoN25Ko9.mllOp5baPCMIqrqBq53DK5VA4__kABU9az_az2xeVb_Ru9MR77j7ed3S_88wd_k8JSPFRh.TiHZT0eIUb26Xr.DeIMMsHq8Dm25eoamriDkQ2MRXDr23XTYanOTOINhADCWPiggD3WD2Zl4noHEt_O3wYW42CQCVHS5.U_FHvMcUQk2cEX14cSweO3GE1sZxxFKUChA2BkZ39PoUuT.ode.efxxQAYE3ZkHKef4jCRaBnxwuWHzrdOZMhabyWBuXJUExoMMknQZgNKwpgEcVPQStae_mZY8BP3hYXeYoVAPELqsbAKPuDeqp4pYZXm9ZernadoRCzqMHsBNNKAM0kbfd_KrzWevd2okN6wJFSlzgfs3hmBXY.RzTGKrKRmOBZyqNyfqwowhKjmMg0mXrdb3gAO2Dtz4ULbKj24LvWLzEnmnNBJf0XkOHkj5BP7FZNLiOT8WhZPGEq0eX1YWyVSRSl5wp4xWVJJZeUaF5IUiVl3xlXbLJJa.bdm3NVTk6dWKFFztnXqALnUztipGL3.P5TuvQbZDqirWft42VzbyWP_ruOK07m3bt6qAtvj6Lr833EOk5K_ljgCptPSffkYmpFk8df.2QSeFbiWdg_YTiMpXdJu7Z9MeWzcNeQDPC.J_yiwXLZBliOuoFyQ.TnJQuHLkbzTCOZJ7srb9GA50TXjXJkYS2BqWDU5XtK_q1peCDUc0b6AWQSI.H5lmP4fe3TFirXW5reT8PuHqIzg0vdm68ITeewYVNGR6mb11OlxLwRuRoBDayja7TTbJPMODxKnRvMta93zG6U_73ocKEYT1KddwlWnkF1Imi_xb8hIDt7Mgmu2oQEW7rsv1R8sXZ_0j1eyX7yIYe0Z4WU8W1ef27We5mXSo.6efBkGyWeFjjoVnMvWnaSE0NrFXEJ25Hrr7zOiiSpu9JTLtveNp8Q0Ea_ScpZZxsN3ThMkQoKjEvaY9sTd0IBZFEGuoaygbBVjFHYf4iSE9RW9.KHV5i9p9xLU1_UAnxqcGQa2qY2ikSIMBUIF0OMxiD.JrhL7jE8J_ABXXDy2YpTfQP8vfgWK_vhxRBNfFfhIBWFvwD9G1D5htXIncgHPaKpUnSzDqn3L20HDCcI3s4CtZLarL9otV6msc960BNd.FO15llRG2prghchvv5t7ikG4VuzUHkj4EXTPp2fnu.LHlRxnc3izzPtSEzfHeO7jHgj8fxxa6_EvQeuik0TM4Q_83gHT9qk6Jf9CEiC61EKCRvOTDqZJE2PuFMRDm.zsTPuP.dcwEe..VGX3piGjtUC"]));
}
function globalCompletionFloorRule(compact = false, settings = {}) {
    const rule = GUIDED_VISUAL_FLOOR + COMMON_VISUAL_DRAWING;
    return compact ? `${__rmT("45TZfke_yXkCa7V_VpA")}${rule}` : `${__rmT("3mJvpAa7ZvLI_oVnccRhuOofaH.JB62GPNNADf")}${rule}`;
}
function cleanEditableVisualPrompt(value, maxChars = VISUAL_PROMPT_MAX_CHARS) {
    const text = String(value ?? '')
        .replace(/\r\n?/g, '\n')
        .replace(/<\/?(?:rabbit_mirror_visual_style|rabbit_mirror_visual_extra|rabbit_mirror_visual_avoid)>/gi, '')
        .trim();
    if (!text)
        return '';
    return text.slice(0, Math.max(0, Number(maxChars) || 0));
}
function visualCompletionFloorRule(compact = false) {
    if (compact) {
        return __rmT("9Y0sMV3BuPxgnWp.BbpdGTQ3oQ9Wyrml5ljwpz1w298b53XVNd.gC9oy2D006XekOnXQH5VcWsRomTy157iQMOndM1voD2pRoEbzenANaz2IhmemtIW_Z.nZqQn4FC_Jl8VOpHiGENCJbVYM6hF23nJAcpDy8Ydeu4iNt5at.pDeCeEntOERcR7ILup7gQS3wYPOuibPlaJ4r3HwiSYYtrqw3ed74ud32QdqHzh71DSmWCc7Q.XYuP3QMF2xmOen");
    }
    return __rmT("jF1FocoaT2CgNtTPUY3KlwIlmU0ZjIHAteSy7UBRWkUGfPwrTt6DmRDIoRA.xbZC5s.RiRSXfmRxXVjPyskdTTANOdEM_xvQq_YBt4p4BnR19sm7fgxu0sQslhd.8d1q4O3ijQuetS.RHXDOMIs5kvwyZwwziF8tCxeHdwaz6y4lMmI.6lsaHLvLe5USx1cx2UoqiDB3V.Zmmvi6eZZN5HdpTKPivFsvmkV5MMC8ErBCEHJzJiNWGgMxEIIw5Y4P3sYYiqFCnGNBWs4PK7qxNTlKF2sGQlfR2digJhoJasGj6P2Ay3a8nhaRxMe3TWmwROYi_j8yNbiLAgYKXm28FHr4GZHtV_tXKA5hgtC0gZoawU.Cm1itMgpiV51N171Q00h6a0YZy0sHKg.hHPYHU.579Eyi35X6wh_8wQXJglRgM0qOE.olAJVdq4umazwptVeTu64QP11A7eA21tOpftzESj.nSy1CYrWaGqW4Tj4DreEcy51t4lyBbxbY6h9FMIloBBk5c6s24dqyvd.tF8XA.g1H6tN1r6_Nasjo44EjKCb_qpOTEBInF0jIh8vhD9Hq5vTb1.pzeU3DBkjCGMu4l_1gt7SM_dvORtPl.ChQclzMLCKPoWH1OJAmfvM4YCsSvX8uUMrVat_KYFXxIUB3_GmWWI7L0pHzeHRWkCFUlKKsvjR.fog_HuM91YiSZU1hPJPLUBkOwK987tBvK3LLo2Z8J595TgkdBwcV6AmLtJh8wrBSu0uOIdhrxAEHiWgYa2nVLYSqKM3TBmtfYJaLdxy5x5mllVCdDHC3wrWn.VyG3qLMgMAHVuJMNxu569h");
}
function compactVisualPreferenceExecutionLock(settings) {
    if (!settings?.visualPromptEditingEnabled)
        return '';
    const extra = cleanEditableVisualPrompt(settings?.visualExtraPrompt, VISUAL_EXTRA_PROMPT_MAX_CHARS);
    const avoid = cleanEditableVisualPrompt(settings?.visualAvoidPrompt, VISUAL_AVOID_PROMPT_MAX_CHARS);
    if (!extra && !avoid)
        return '';
    const clauses = [];
    if (extra) {
        clauses.push(`${__rmT("Vwf88Bh6Fy6ItcVtLs.L89sorCncNJpS5pWk0aPUr5n5KXnwANbGI1_5YvasRb7s.03Bh5aWwZEET6lUXOnvViB68Db9xkKJEuh_5clU")}${truncate(extra, 180)}`);
    }
    if (avoid) {
        clauses.push(`${__rmT("OLRUi7vuOBIayyquZWvRbHAMbCecFTbY")}${truncate(avoid, 120)}${__rmT("GyaCmluatEzXY1lzyY08A9x_5fy5YloPn.mH_GH1nw9JqORNKxIStoLa.3aHgf")}`);
    }
    return `${__rmT("WweiHTd79C12aV_F05bKn3APuLk")}${clauses.join(__rmT("7os"))}${__rmT("5kmskStNWiYt3YKvJ678FV_a8PSAE0zo__5FB0hoC5eyyPPtVzY1ZACRjFximdKiZIMRSbujY3Y")}${visualCompletionFloorRule(true)}`;
}
function visualPreferenceSpecificity(text) {
    const value = String(text || '').trim();
    if (!value)
        return 'none';
    const clauses = value.split(__rmR("3MONPsC7YiAYBdnBgBOFJDXrT3twJk", "")).map(item => item.trim()).filter(Boolean).length;
    const dimensionPatterns = [
        __rmR("YqbLwc007A0JVqSI4_Wkmej80yguu68Dqe5BvXDB.HduTSvwQ_p", "u"),
        __rmR("NJnLwxqEiCtJVsUkROPkmLn7.51uua0AlUtBvagNTpouTEutaoE", "u"),
        __rmR("3CrRnkmaRoZ1mHzVsGcnw6_dB38z0hCDrXpzC1dNmOCHxe2.GSDuVIBcLquIEoRoskqsx6d_TuC", "u"),
        __rmR("JjrDrynOuKjIorrRyAXmsPD4Uf3ZHi0Cf3s_9tEQ6ZpGTvDg3k8yA55euyowlh", "u"),
        __rmR("tqYXtynO_.DcZLrRRLpcc6D4IRYhZo0C4xrlNwEQsR2QQSDgSnpHRn5eT3oyzf", "u"),
        __rmR("4r_PtnLjMH.JyrA5WT.2pKHkzI7Hfunoet5K7kyQv6bGWvcxFAc8VBCzHZ8", "u"),
    ];
    const dimensions = dimensionPatterns.reduce((count, pattern) => count + (pattern.test(value) ? 1 : 0), 0);
    if (value.length <= 30 && clauses <= 2 && dimensions <= 2)
        return 'seed';
    if (value.length <= 120 && clauses <= 6 && dimensions <= 4)
        return 'sketch';
    return 'detailed';
}
function visualPreferenceElaborationRule(extra) {
    const specificity = visualPreferenceSpecificity(extra);
    const blocks = [];
    if (specificity !== 'none') {
        let specificityLine = '';
        if (specificity === 'seed') {
            specificityLine = __rmT("TyYXQp9NpRChwuvckKgAjL9dwOO0kZmbma_pUkqWWtZLWDQurnl0nv4Rt7zhCECv7pdFpOlKWxs7P89AB7WsfeM61XusOqXq.k9e6PCyEYrXf_Id68cljw3.JlVJNgUoHFU6lL0aEBYMTuimuGvBA4BIyFOI8tJXXWJKVKnuQ0tAnvmlfDxmNWSPRMVcouxwogRmzMy3shmhGVbt483WLKKoIXqrfLZXShomCaZ7N3SxaI7IPNKbjux6iw2HzA3Phnto0bWjNJeF2rh67sz6eeMowY5UJ1FLF4r5R_KfdRlGa8n1ygv.AfIuA3CaY9JH9KtY5QnTt4V6xbfl6FV9tc_GC5HtXP0Uvi3hYjehDXTcsmBlEZl");
        }
        else if (specificity === 'sketch') {
            specificityLine = __rmT("wnnKDW8ZUjw9o1zaiMCRncKQNfzVXe6Ujj938TnfZi_6_ZZyuOLpRBBVde9hpFcMHBiNaGdwkTyLhDrhXUz1p9Kq5N71UPttYoF_TSrZowvylwYq4Y.5KCYH3zip5x7UuQzXEIGgzEGbUqd2RhGYDTdmvYc.q5FZVXw4GhQvzHBKha0wn2b2DGMyO2OzAFKAvGBCG2Bly5TIz71zlG5I1StGcqV9My3AvgcaQsOX");
        }
        else {
            specificityLine = __rmT("zmU6KDrjyJZyhMECpJF71N_ID_fer4djSCER5YbaXWoTTrXn349Ablo9Qu6NB.H9OMSOZ96iqXF6rqfkoAKiaLbOMOUNIpBQxcd1VfmjN6xUiMZa3JbwDwB6fmx87YGYjlVX3pxgvQdrxpjqTIvQOva4AmLz5tLCmieCtzeQFuIPeP.030a4G10CqRNwhPi1do2zH2WsysEiiLBfj.sT6T");
        }
        blocks.push(`${__rmT("_0gvhNQe_imVi.cDrd.pvRmu71drZfNHvWRBfEqzk86jNrlBtn4QKQJvOY_XJ3riwvoWcf38iBUPItCXRJH1dM114CbQr4MI27rVm2kgL64nW8.sq3tBqPLcs7ePv8zDGFypMf6uhL7_CKtCW3vF2LaVSb772e3a9PI2m8G13f9WBxCXUlZM0GSFNGllN2vJQf7TFBODv9.XqfnKQmZWcfrhTKQvmAT7FhixXjHbrpg9EXsRIxJ6I5WAosqDQRyjO0TXTq_.LUShpebAHEOD_QlpsPQSmFgCViMOks.jWKoUGWJYJzJgb.b6u1.cV6RRTbSD0vA_Rw.RzBbrkJcAa0mAxv0fCgePyLaD3EQFEu_kvDgnNGoleLjD2DdXVekqQe34x_mwZNV1kNHEr3fNYOtHYyc3f41IfxYI2gxW")}${specificityLine}`);
    }
    blocks.push(visualCompletionFloorRule(false));
    return blocks.join('\n\n');
}
function editableVisualPromptRule(settings) {
    let official = cleanEditableVisualPrompt(settings?.visualPrompt ?? DEFAULT_VISUAL_PROMPT, VISUAL_PROMPT_MAX_CHARS);
    if (official === cleanEditableVisualPrompt(DEFAULT_VISUAL_PROMPT, VISUAL_PROMPT_MAX_CHARS)) {
        official = official.replace(DEFAULT_VISUAL_COLOR_RULES, '').trim();
    }
    const extra = cleanEditableVisualPrompt(settings?.visualExtraPrompt, VISUAL_EXTRA_PROMPT_MAX_CHARS);
    const avoid = cleanEditableVisualPrompt(settings?.visualAvoidPrompt, VISUAL_AVOID_PROMPT_MAX_CHARS);
    if (!official && !extra && !avoid)
        return '';
    const blocks = [];
    if (official)
        blocks.push(`<rabbit_mirror_visual_style>\n${official}\n</rabbit_mirror_visual_style>`);
    if (extra)
        blocks.push(`<rabbit_mirror_visual_extra>\n${extra}\n</rabbit_mirror_visual_extra>`);
    if (avoid)
        blocks.push(`<rabbit_mirror_visual_avoid>\n${avoid}\n</rabbit_mirror_visual_avoid>`);
    return String.raw(__rmTpl(["j3GEt.X9sJXrT4.1v3rswIHEcKhQDFbzOKVQ2RhlGrthM.IyKrxtEwvEKgTjGHOQQqDjQ1QsspkkpqJu3gblzgK8TWiy031fNxfDG8o3HPdU1kuwNQT", "eWOy3UhjUo1OER1mgVS1Ffnz8QNCupIX.ArTEINv1Gbr06jKOpqQOToYpXmeQF.dzYcjhwrwEme68fc99dpBknUrPNoo6Mu7evMYgV5mDRpSCRIYeO.q_I4SKX4EGO2zNj9uc7fWdQg_cKL0f6KzhvOCKupTNZ61x.8UOPng8AlGidoduQXJ3Ef.6zW.NsA7H..sB.Y.tJBp4dqKuH8W3WAdCHmceZwPTlaRZ6.mhpUA4jBXxH2JOF_EZiZFjgrnwLZSZpLN4oiVkDL0El0y4GpzPSwo3zeGbDBGYWC5N25XcFBgJr1OezuGErz7Af8V6tdeBXPHHo5EoAurx5BrtQREJAyjDzYeY8vK0.saiZRY3EnNPeAZ0PfOQxyypjUaNkoAC8hCAmh.6awOMVfs3jgznCumEwlm8T9AYVDxZi_8oSlnYQtXewfqyL62YPIxMCHU5axHTjcgxLtorp3st0UDJIrnJT0EdW9KhIdHhN18eGwyg0WflVkPVgzJHF2pvOqKOTf5bLWo0IDZAvjjxEySkQgZ.WTrcoELOylsF2a9_drvJwt39hJfUYn8xQlpL8r7r.VmHJBwnYuKi4pz4Z8ts1Jte8PpB4CX8NnrzSi.8e8dAhVdbJQLWMOexhEspURWcNNP4ehfLRuZet7ggFaKzmxamPBdeQkcU6jzfHb9ltIYWpmj1cYh1oxAg1saWt7n9OyLBLbAesX8xa6Xwz1qc7qJrjlYcIVJVoMlnkypIR8_ifyD5TZbqQbPy25L2C31eB815ourvQTG4neW.h1m_4P69xm0WxjJEAMXo_FX1aDkeZXd.YjryvWC7sOMucd5_Gi7d9GrUvrXPBanH4DLrk9LDxoHzHrmGj9Q.6CLD87hSYq4108ITl.1n_iJhuw3VapHCjiOE5bVCtOsrg3DWU6TZpMg3Lfyy80wmJaXCw5O4RoreFzsGNKjQxetx0VcgnjU7ioAEhK_rgdSA5h7KJsaS0iHabdc_NOAiyyxRHPnW7pWdbI0fA_Ha4LtAsaEYyd73UIwRFPIKDreeq5rEIOsXnhY8BJma7m_rucAqrh.DT6Vk26QtpJgNR5E4LKOF8V5tjAsUIslwXgOVpw1j4IxNts3rqzayhF2phE_TaEO.p4Ghri2xznX.43T9SmzjOLYcsm8k7KzuBYCPGpBguPdhxCUCqDBfJACFm4mY_Ko9LnBw2rudV3Dn3UUpnfF6GQMBaBtpKghCB8r_TVaoqE2KcpHlpJZ6iVF6TGmJifGHc8LPTJjoNeS9CA7wxRNGyYqeh3ebCUb0L8XMkTHVWPq6WlErafjqo0yXRGPMEIEuYlE0vsw6yqVJTgkooSQHTmWrVsvYwCtr2VVPidK1Nf_TevvzCdCuKR..pMiRWMDRJF4J488m0w70k", ""], ["j3GEt.X9sJXrT4.1v3rswIHEcKhQDFbzOKVQ2RhlGrthM.IyKrxtEwvEKgTjGHOQQqDjQ1QsspkkpqJu3gblzgK8TWiy031fNxfDG8o3HPdU1kuwNQT", "eWOy3UhjUo1OER1mgVS1Ffnz8QNCupIX.ArTEINv1Gbr06jKOpqQOToYpXmeQF.dzYcjhwrwEme68fc99dpBknUrPNoo6Mu7evMYgV5mDRpSCRIYeO.q_I4SKX4EGO2zNj9uc7fWdQg_cKL0f6KzhvOCKupTNZ61x.8UOPng8AlGidoduQXJ3Ef.6zW.NsA7H..sB.Y.tJBp4dqKuH8W3WAdCHmceZwPTlaRZ6.mhpUA4jBXxH2JOF_EZiZFjgrnwLZSZpLN4oiVkDL0El0y4GpzPSwo3zeGbDBGYWC5N25XcFBgJr1OezuGErz7Af8V6tdeBXPHHo5EoAurx5BrtQREJAyjDzYeY8vK0.saiZRY3EnNPeAZ0PfOQxyypjUaNkoAC8hCAmh.6awOMVfs3jgznCumEwlm8T9AYVDxZi_8oSlnYQtXewfqyL62YPIxMCHU5axHTjcgxLtorp3st0UDJIrnJT0EdW9KhIdHhN18eGwyg0WflVkPVgzJHF2pvOqKOTf5bLWo0IDZAvjjxEySkQgZ.WTrcoELOylsF2a9_drvJwt39hJfUYn8xQlpL8r7r.VmHJBwnYuKi4pz4Z8ts1Jte8PpB4CX8NnrzSi.8e8dAhVdbJQLWMOexhEspURWcNNP4ehfLRuZet7ggFaKzmxamPBdeQkcU6jzfHb9ltIYWpmj1cYh1oxAg1saWt7n9OyLBLbAesX8xa6Xwz1qc7qJrjlYcIVJVoMlnkypIR8_ifyD5TZbqQbPy25L2C31eB815ourvQTG4neW.h1m_4P69xm0WxjJEAMXo_FX1aDkeZXd.YjryvWC7sOMucd5_Gi7d9GrUvrXPBanH4DLrk9LDxoHzHrmGj9Q.6CLD87hSYq4108ITl.1n_iJhuw3VapHCjiOE5bVCtOsrg3DWU6TZpMg3Lfyy80wmJaXCw5O4RoreFzsGNKjQxetx0VcgnjU7ioAEhK_rgdSA5h7KJsaS0iHabdc_NOAiyyxRHPnW7pWdbI0fA_Ha4LtAsaEYyd73UIwRFPIKDreeq5rEIOsXnhY8BJma7m_rucAqrh.DT6Vk26QtpJgNR5E4LKOF8V5tjAsUIslwXgOVpw1j4IxNts3rqzayhF2phE_TaEO.p4Ghri2xznX.43T9SmzjOLYcsm8k7KzuBYCPGpBguPdhxCUCqDBfJACFm4mY_Ko9LnBw2rudV3Dn3UUpnfF6GQMBaBtpKghCB8r_TVaoqE2KcpHlpJZ6iVF6TGmJifGHc8LPTJjoNeS9CA7wxRNGyYqeh3ebCUb0L8XMkTHVWPq6WlErafjqo0yXRGPMEIEuYlE0vsw6yqVJTgkooSQHTmWrVsvYwCtr2VVPidK1Nf_TevvzCdCuKR..pMiRWMDRJF4J488m0w70k", ""]), blocks.join('\n\n'), visualPreferenceElaborationRule(extra));
}
function truncateDirectiveText(value, max = 3000) {
    const text = String(value || '')
        .replace(/\r\n?/g, '\n')
        .trim();
    if (!text || text.length <= max)
        return text;
    return `${text.slice(0, Math.max(20, max - 1)).trim()}…`;
}
function directiveList(values, fallback = __rmT("KWTZ.jZp")) {
    const items = (values || [])
        .map(value => truncate(value, 700))
        .filter(Boolean)
        .slice(0, 8);
    return items.length ? items.map(value => `  - ${JSON.stringify(value)}`).join('\n') : fallback;
}
function activeUserDirective(settings, directive) {
    if (!directive?.rawDirective)
        return null;
    if (directive.pureOrder === true || settings?.userDirectivePriority)
        return directive;
    return null;
}
function pureOrderFaceLock(face, index) {
    const kind = face?.longText
        ? __rmT("2XJYyRJxT6PTNAKwJF73oKoKR_30Mp_0q0yPMKYSd_Iw_rHirvTJgBtSEhKFlpsy8FXxr4PCLWBeOgh0m4QxdLGu") : __rmT("8zW._TZj4ECk27Ofr3I61tTfpnAgSofOGEAoLS0f6BQCWmLlBU.x0ogazBG");
    return `${__rmT("BJgCyT")}${index + 1}${__rmT("7aATSKC9j7o.mPJ8kCA")}${kind}${__rmT("22IB00OEsfruUTaSGrdSgH.y2EnOQ1EB_x5gyfRAFe7vlr1BAfEr7f")}`;
}
function userDirectivePriorityRule(directive, textPresentation = false) {
    if (!directive)
        return '';
    const rawDirective = truncateDirectiveText(directive.rawDirective || '', 3000);
    if (!rawDirective)
        return '';
    if (directive.pureOrder === true) {
        return String.raw(__rmTpl(["mlVqq3Icy4PwjgAyER8x63mezz1Ii95rxzUrn.EEOQv_Jrs0XCpB33kr4ufRo.kHDKtCeBkDU52bNe63VBBHrDKz6nTIZ786KPrGqFjFSsvPTGCfiD6clbqrMQDeXHdyYra5jpDP3kocHDW.B6sBDLR60bsj1HjhOnS6tmVSEmGzd_J9.yt_ubd7LmpIDaS7", "_x3nDBKmp9m7iCDOkB9ahv6rrDAlUcqxWV.Sb.Cg.MEB4rma2rQjfKscHtzm5T8ZN_M_bHbc97eY1OM5XvqhirhhMHUfW84Q0Y5W.Qs.N9IaqZRMQLeN9ulAge9kLYnVdLSy96OBtEeX6MxF6TUQKU5mdhOc_mB90xDLEW5rg13WScaJOFU6v4wA.KVLbFYr5uh2p4O4eAeVONBWkyie8613jpdGbt14smYUIelvg6l77wUYYDxegO5Gj2e5iWyVWjHQg4VGGCIvNG0u.4mngmlK8vDCRsiZXnYdsbv2w9yBzDhUxXFXWxBL6DzxVMqirrr8G_8oFE3UryHCWzTwXhWJDTSCrkTAwLd0F3gU1IDsFejb5JFzSlan_UIVLa5pwVTkznT10aqyYcI6PkhxBb77QUGxJOfzcfwTkIGZaVeYTmdlb2PR96SJvdl5a3nEhTXHoPlt.VrDyfB.pFk"], ["mlVqq3Icy4PwjgAyER8x63mezz1Ii95rxzUrn.EEOQv_Jrs0XCpB33kr4ufRo.kHDKtCeBkDU52bNe63VBBHrDKz6nTIZ786KPrGqFjFSsvPTGCfiD6clbqrMQDeXHdyYra5jpDP3kocHDW.B6sBDLR60bsj1HjhOnS6tmVSEmGzd_J9.yt_ubd7LmpIDaS7", "_x3nDBKmp9m7iCDOkB9ahv6rrDAlUcqxWV.Sb.Cg.MEB4rma2rQjfKscHtzm5T8ZN_M_bHbc97eY1OM5XvqhirhhMHUfW84Q0Y5W.Qs.N9IaqZRMQLeN9ulAge9kLYnVdLSy96OBtEeX6MxF6TUQKU5mdhOc_mB90xDLEW5rg13WScaJOFU6v4wA.KVLbFYr5uh2p4O4eAeVONBWkyie8613jpdGbt14smYUIelvg6l77wUYYDxegO5Gj2e5iWyVWjHQg4VGGCIvNG0u.4mngmlK8vDCRsiZXnYdsbv2w9yBzDhUxXFXWxBL6DzxVMqirrr8G_8oFE3UryHCWzTwXhWJDTSCrkTAwLd0F3gU1IDsFejb5JFzSlan_UIVLa5pwVTkznT10aqyYcI6PkhxBb77QUGxJOfzcfwTkIGZaVeYTmdlb2PR96SJvdl5a3nEhTXHoPlt.VrDyfB.pFk"]), rawDirective);
    }
    const knownThemes = (directive.themes || []).map(item => `${item.id} ${item.title}`);
    const knownFormats = (directive.formats || []).map(item => `${item.id} ${item.title}`);
    return String.raw(__rmTpl(["NyXC.fD.YNyMphdHLWtLUT", "BYClHAsTF60suDxZktlJ_.Mj2AyRXIW5IKVqCx5NiieUZSoA6MAoxVtLurBtr4pu_gfZ9uKM.cerkfGb5VNX6jdIHOFxZ5Bbwvbw5_VJQvABq5goKMpdC_9.s_CJRj4OhHFDtetGsY854zp5qZC5DF7EOxyuu2AcQOmN5jpHbYLFKZSpcuOWS.aUVZE", "XF3.5uaM1XaB7kDVcUdl6b8n0os2kRyxe3b2FQVyeEGP1VhfiT56BgT4YjX7EI.SgJXTgxvAlpDzaNjTfxtkNKpWM1BU0yY26A8NQb5MyxEPecqFDgHDz2oIXvLYxx_YW3kRhi0J4WBQv3RjlmgVomyc7g6d.xl41mFFyN4QJfpeEq.b", "2LA1f1ydC4B2Aef6IgD", "VNt8n5QGjSmL7RJskX9v2ojiAh.zVGbBdUdoDf", "CzYCDJj7uznhPlbArFn1GEqJFr2J2jcuVssBbaCcOyDDx3rM_KVoqiBUdnfedv6F2_j_JfTFmK_6IC3IIKD1wTKZo_OHcsXmPY3xpPSYcxwzQ50CZYgyy4jBToFLdFQk0kYYG9.LSu1f4Vi2rMGMR8UoCkCjW5AGvyqYtl2leDBEBv93SqhdbeJyxMcT36P25QSybE8G7XLfFTOj1muAkHtoiGqN8jZGMorUvxSG_N.ZHbu8NHUOD0OerczlrNFM0u.cmhVfKQPmZ4UX5oywOFRNXr2ZoZbt", "3_cXBbLP5Dxg2cOt.aoDWoSQP.fndgtOacTeSkWKqW59R.FtW3NL.aC_VoX25HiP20qP1BwD37ZQ.RSltzXjDB0Fi0q_giTGHGV4Y8TihWAFilzMtS9N4QP7WwuohKxScYB9Xm3ZmIsS2KO_kvEdNpbXm_eOtUQrwz244xk6cZ8m.yg.h1x2zAkuc6WspuZOvw7XzQCd0EbouWtt4DuPOdqo8lnNaHUcgPIMmh"], ["NyXC.fD.YNyMphdHLWtLUT", "BYClHAsTF60suDxZktlJ_.Mj2AyRXIW5IKVqCx5NiieUZSoA6MAoxVtLurBtr4pu_gfZ9uKM.cerkfGb5VNX6jdIHOFxZ5Bbwvbw5_VJQvABq5goKMpdC_9.s_CJRj4OhHFDtetGsY854zp5qZC5DF7EOxyuu2AcQOmN5jpHbYLFKZSpcuOWS.aUVZE", "XF3.5uaM1XaB7kDVcUdl6b8n0os2kRyxe3b2FQVyeEGP1VhfiT56BgT4YjX7EI.SgJXTgxvAlpDzaNjTfxtkNKpWM1BU0yY26A8NQb5MyxEPecqFDgHDz2oIXvLYxx_YW3kRhi0J4WBQv3RjlmgVomyc7g6d.xl41mFFyN4QJfpeEq.b", "2LA1f1ydC4B2Aef6IgD", "VNt8n5QGjSmL7RJskX9v2ojiAh.zVGbBdUdoDf", "CzYCDJj7uznhPlbArFn1GEqJFr2J2jcuVssBbaCcOyDDx3rM_KVoqiBUdnfedv6F2_j_JfTFmK_6IC3IIKD1wTKZo_OHcsXmPY3xpPSYcxwzQ50CZYgyy4jBToFLdFQk0kYYG9.LSu1f4Vi2rMGMR8UoCkCjW5AGvyqYtl2leDBEBv93SqhdbeJyxMcT36P25QSybE8G7XLfFTOj1muAkHtoiGqN8jZGMorUvxSG_N.ZHbu8NHUOD0OerczlrNFM0u.cmhVfKQPmZ4UX5oywOFRNXr2ZoZbt", "3_cXBbLP5Dxg2cOt.aoDWoSQP.fndgtOacTeSkWKqW59R.FtW3NL.aC_VoX25HiP20qP1BwD37ZQ.RSltzXjDB0Fi0q_giTGHGV4Y8TihWAFilzMtS9N4QP7WwuohKxScYB9Xm3ZmIsS2KO_kvEdNpbXm_eOtUQrwz244xk6cZ8m.yg.h1x2zAkuc6WspuZOvw7XzQCd0EbouWtt4DuPOdqo8lnNaHUcgPIMmh"]), textPresentation ? __rmT("2DR7ribyallj8wsUVgU93cWd6fjENffgmCnvlsQRo.Ph8rhb") : __rmT("ZNTrrC6L58E"), rawDirective, directiveList(knownThemes), directiveList(knownFormats), textPresentation ? __rmT("ZN78xJ0E5VbRUys8a_w2nlSMtXEAUAIAX1Ml3cGEkEctMcjrcOKO_kkBkGPg6LSTcLKsf26.Pns3WkS.X0nvoKy4MQp5tkVSGGxoM1UcX9vOUXmGNvN9wZD.EqIXSHoKyPi5nLpvShS_qUVgF3P7Hyo86cZu8NOIA0e1yjtp8k4kb5uBvMi3TveL1EJK.7.igqhnLiAhCfavIFDH") : __rmT("h_UUtFuVBSMJeLo9SuA_0jOpe9CZJhXUah6vb352Q9xFgGIydyI.V1.qQyTlMmtyBdC3ndyJr_ffw2lRCbhwHkUa0z2MtesjDUPlwF5tjUwN1_7LvguEHPsT3PlgWJgqLqgeTbFuBDATgCyz40M55RwhphvHu4g7n6ZjXZLdD1G"), textPresentation ? __rmT("ksLSaN3iziQsdyzbmuSCxRz7XHtmEfzF7hstFKBFPTLkVoMOzsvWKJZWNtqIoJpyX7F2VWN9rCd6lD8VBLY9HjsDiwLNskIwZ.qCzoND2RC_oekqoGiYK7.h2.nqV83qsnLOvT") : __rmT(".O9c98HwgJ9TXWFwYsuwlCGmM4Dhmehyt5k1T1hFy6ov7SUoH8QBnExB_DdyR3sg3dxFu105mzoD4UiyzlG8sGUJe3JsvMbAy5vOI4n1TFCgKkiZU6juzBUt"));
}
function selectedThemeHasIf(combo) {
    return Array.isArray(combo?.themes) && combo.themes.some(item => Array.isArray(item?.tags) && item.tags.some(tag => String(tag || '').trim().toLowerCase() === 'if'));
}
function presentationWorldviewLockRule(combo, settings) {
    if (hasAtmosphereMenu(combo))
        return '';
    if (settings?.presentationWorldviewLock !== true || selectedThemeHasIf(combo))
        return '';
    return __rmT("JwWoTFWYzZnmluJDJTlbytkDB_ugHGYb4gWngC99N3qR7X0WkhMSYHTAQNQWRLxRzX_Q6SIwHYXTznm25wHuEvSe0Ebio9sMTX_9mE0egFnglKymt8VQ2Mdxg7Ahb2DZzkvzeEAYz5g4BJc98I909agR3i.eJyY.SHgVrV.uxen1jE7.drv3ZEGfBdRpy71yxJpMglUf38UPYdY5YwGeeYW12EUfkttx6B.mAVyEZJGEzLgWSsM2Q57JLaWwzbPbl7oNu_codmCa22xIJdX69.sTMhIDoVEcHUVkfl4244AEsJrLE2NhCu6AnfZiv485isQO7wPeynwp_GkObrR3PiKzcXeRbL5Xdhf");
}
function visualColorTruthRule() {
    return String.raw(__rmTpl(["zmd3bLhoz.lTagc43zpXnbHBqbsW1oCGwd82t8ItbJDOVcggQdapwENkz9JA.WOjEgS1_fbjNzLYunUd70bFYRaM4rKDe3FcGJBJ7OOb.51cFE1lriCVb7LvuglxD.LbRNoDkiYctxwCyvvFoCtfv_nRfW9wGlbr5LdsM1Na8fM0blNKuva3UzMt0RviOUJ4gbr8hs1Ar8YM8tiDl2_T6T"], ["zmd3bLhoz.lTagc43zpXnbHBqbsW1oCGwd82t8ItbJDOVcggQdapwENkz9JA.WOjEgS1_fbjNzLYunUd70bFYRaM4rKDe3FcGJBJ7OOb.51cFE1lriCVb7LvuglxD.LbRNoDkiYctxwCyvvFoCtfv_nRfW9wGlbr5LdsM1Na8fM0blNKuva3UzMt0RviOUJ4gbr8hs1Ar8YM8tiDl2_T6T"]));
}
function stateBarIsolationRule() {
    return String.raw(__rmTpl(["zmW.O94qrETMVnTM7zpYnbHBsFWnprKKKpcT5TYQOBxcJevn35Pv2MS2v9UZLsc.HYyreqtbI_BMJqTZKP6Rk00N0vIrR2rJxi0MrL_r8ata.mSjv8DPnfA9SicnpPWqgR56lEoCyQdgzvW9p4Vh.vX9D4fO6K9dJ736aQWDP94XNfcqSh3ONjzqYyty2mSFbE5V9c4TKOnQOZ5w_.YT6T"], ["zmW.O94qrETMVnTM7zpYnbHBsFWnprKKKpcT5TYQOBxcJevn35Pv2MS2v9UZLsc.HYyreqtbI_BMJqTZKP6Rk00N0vIrR2rJxi0MrL_r8ata.mSjv8DPnfA9SicnpPWqgR56lEoCyQdgzvW9p4Vh.vX9D4fO6K9dJ736aQWDP94XNfcqSh3ONjzqYyty2mSFbE5V9c4TKOnQOZ5w_.YT6T"]));
}
function followTagIsolationNames(settings, generationType = 'normal') {
    if (String(generationType || 'normal') === 'independent')
        return [];
    if (settings?.generationSource !== 'follow' || settings?.followTagIsolationEnabled !== true)
        return [];
    return normalizeIndependentContextExcludedTags(settings?.independentContextExcludedTags)
        .filter(tag => tag !== 'toto');
}
function followTagIsolationRule(tags = []) {
    if (!Array.isArray(tags) || !tags.length)
        return '';
    const label = tags.map(tag => `<${tag}>`).join(__rmT("jvk"));
    return `${__rmT("PlOIH73XO1lzGtfOgMVcb_Q_CIXWAGTvBHjrD_mgf9GQ.nOoucGViqvvcRNsoA7BO5oKVFyVudCLw5fNhi1DqQUOJGZ_LsvWjpMjuwSD0tWKK_Xl_FRBVQrk")}${label}${__rmT("EaOR5MSdYpkDdWwwK1ow9N0pfbHX03doCdFfdqSSOu6iHt_k5fzxMP6KP4j0yOla9m_DSZsrVvouKz.zYzswBBkCzTsmIpnrScKYoO42.U1McfL6P61BFc.tPHurNy8IXLOYpkMikbfUhEyizjiUA1pw53tEulGFlgO7TiXYkZOFcyIHA6QQo_mbKlvqsbRhAFqLmchBCQAKlrUBuYVEKBYWILr3hXJR_bWr1MQZBrJZScv4XaeoFKSVm8A")}`;
}
function compactLockItems(items, kind) {
    if (!Array.isArray(items) || !items.length)
        return kind === 'theme' ? __rmT("b91q42_evOc6Mrew") : __rmT("cy7zLvhC");
    return items.slice(0, 3).map((item, index) => {
        const id = asText(item?.id || '');
        const title = asText(item?.title || item?.id || __rmT("cyZtO1kw"));
        const identity = id && title !== id ? `${id} ${title}` : title;
        return kind === 'presentation' ? `${index === 0 ? __rmT("ue8") : __rmT("aFs")} ${identity}` : identity;
    }).join(' + ');
}
function compactComboLockItems(combo) {
    if (combo?.visualSceneryCombination !== true || isTextPresentation(combo)) {
        return compactLockItems(combo?.formats, 'presentation');
    }
    const media = (combo?.formats || []).filter(item => item.id !== '10.2.2');
    return `${__rmT("eYOsv0dAchnBUdQtilt079fW48Hua5TGWzc6LRHKHmp38ouQ2mjGk6vdtQTMIpjYySxonOo2LQnqPvt9mjk")}${compactLockItems(media, 'presentation')}`;
}
function atmosphereMenuInstruction(combo, candidateFaces = null) {
    const menu = combo?.atmosphereMenu;
    if (!Array.isArray(menu) || menu.length < 2)
        return '';
    const lines = menu.map((ticket, index) => {
        const face = candidateFaces?.[index];
        const palette = paletteRecipeFor(face?.combo || ticket);
        const paletteLine = palette ? `${__rmT("Qm6q505lCmrasm5D")}${palette.code}${__rmT("YSk")}${palette.title}${__rmT("Yvk")}` : '';
        if (face)
            return `${__rmT("l9gCyT")}${index + 1}${__rmT("jy8.Pg2uky.pQ7FMtEpZ5d1WMS7RC9btcrtB_TcjGcHnJwtd7ifjzqny")}${face.combo.samplingMode === 'format_only' ? __rmT("UJACPi1_7FcqGSE6l_ffR0a08GyPnaN2red_uaJzdEDETX4QMP7c33SbhgafezwP") : face.selectedThemes}${__rmT("2LA1f1ydC4B2AjnpIgD")}${face.selectedFormats}${paletteLine}`;
        const themes = (ticket.themeLines || []).join(__rmT("7os")) || __rmT("wWY");
        const formats = (ticket.formatLines || []).join(__rmT("7os")) || __rmT("wWY");
        return `${__rmT("l9gCyT")}${index + 1}${__rmT("Y5nU5E8IHKG")}${themes}${__rmT("gs6wkm8K3_dutlBq")}${formats}${__rmT("jzk")}${paletteLine}`;
    });
    return `${__rmT("Q_EcyaQAL1V7rjTjKn_UuGl7U2nCJk")}${menu.length}${__rmT("UioO0f4dETvVYk_xB2doEp68GtPPDJ3rnqYLfN497QiNHM2L9o3Lx.04yH0j2uN8OdPE0Tn97WEw9Xavzq9zCAUCoYTkWOGlB0m17_gRozjVnS21FZ1hXAkAqQdZDbam3U3Om7nZFca.ZyfmMLQBp9HGT3VJUrf85LhFlB0emdaKmnd8tQli7v1eLeK4eOvtm1pljA37Fnb5ENBNiF21h3kFw5QDOrh4t6_SS0PLWaLhJhn6fD5pSn8oy8BT_ErcwgRkL.P6Ez03_CRkG6tqpjR3NhMJ92sD45gJOWMJnGiDisMvv.yhvwgmHPRgjaACJxMhAp9eSR_zFXEuc6OJQiwnpLhkLRPcGitYPAOtvPeK1AyqPS1l0MdSbZmre05TVETNMSLz6VjgeN3cKKVDg2cE7TFiOXZwmrKpSb6.3FWVvTeCiebvt3EkFYKck4ee")}${menu.length}${__rmT("n6upMQHuGgxJ2ncAfCWcrqKqS.31FECxy.FMC_oeqYvv6vPselLdy.BPMDyVOqLQp7fkZFIHKkBRLqKqDwPFJBtkulN0PfGevqiQ_fvKZwMT.v3_o155fXLHepf6j6euIbdreEjFQtyrDmpBrdV2gk")}${lines.join('\n\n')}`;
}
function atmosphereExecutionReminder(combo) {
    return hasAtmosphereMenu(combo)
        ? __rmT("IRjV256N4hig6Jrj1QbwIkhpfaRWl82yZghdJlVHSJOBBS5kgJRgKmJ_Fj8ToNyncr2Imr2E32VZ5VNigVg1_j8yhRP31RUF51XlHpvEytW0xP.V3t8YPczDv1itmbxSemfGwc6YlSjFx97ZH6TDSBONhIS6rzwih5PZAB.cJEWy9h8ROpfEuXixhB7tsS21039r49ABhFwIB7PPPd9ImWV8cqECJi8gdcvfO_uBeXUPCXlaUhYmRME4SD7HGfukDMaGzi_bV4QQT0ZWRwCB4h9kNnCQqXy7CWVBY34q1NGWM9QiAALtjhmNRowJNynOI8ak0uHUiH6DP_EbxXZ4fTV1aSmuuAttaZHOTD5a9pObq0D8iawqGMiMWbxAFRzgmBsLbQFNg0Rm2Wftyvs8XfG0tqaCZf") : '';
}
function atmosphereConditionalRules(face) {
    if (!face.atmosphereFaces || face.textPresentation)
        return '';
    return face.atmosphereFaces.map((candidate, index) => {
        const rules = [
            presentationWorldviewLockRule(candidate.combo, face.settings),
            candidate.tarotRulesText ? `${__rmT("qSx2WESNJyFRZeoJI5JBjUaTThxL8CYwiFshjye4w_5uLe9oJdUVrtn5e3jhP9CZFvnJ.uD2")}${candidate.tarotRulesText}` : '',
            candidate.touchTheaterRulesText,
        ].filter(Boolean);
        return rules.length ? `${__rmT("_0.kVnHJf2OBTh")}${index + 1}${__rmT("tMlpJGdD9.dKa27n5wyr_ZdgcYYV3y.fPNNADf")}${rules.join('\n')}` : '';
    }).filter(Boolean).join('\n\n');
}
function sharedHtmlModeRules(faces, split = false, follow = false) {
    const constructionGroups = new Map(), modeGroups = new Map();
    const htmlNumbers = [];
    const add = (groups, body, faceIndex, ticketIndex, face) => {
        if (!body)
            return;
        if (!groups.has(body))
            groups.set(body, new Map());
        const scopes = groups.get(body);
        if (!scopes.has(faceIndex))
            scopes.set(faceIndex, []);
        if (face.atmosphereFaces)
            scopes.get(faceIndex).push(ticketIndex + 1);
    };
    faces.forEach((face, faceIndex) => {
        if (face.textPresentation || face.combo?.pureOrder)
            return;
        htmlNumbers.push(faceIndex + 1);
        (face.atmosphereFaces || [face]).forEach((candidate, ticketIndex) => {
            const construction = candidate.visualSceneryMode
                ? visualCombinationRule(candidate.combo, 'construction')
                    || [visualScenerySceneFirstCore('construction'), VISUAL_SCENERY_CONSTRUCTION_RULES].join('\n')
                : '';
            const mode = candidate.visualSceneryMode
                ? visualCombinationRule(candidate.combo, 'motion')
                    || [visualScenerySceneFirstCore('motion'), VISUAL_SCENERY_MOTION_RULES, visualSceneryInteractionLinkRule()].join('\n')
                : follow ? '' : complexInteractiveCore();
            const strip = text => follow ? text.split(`\n  - ${VISUAL_SCENERY_VS_GUIDANCE}`).join('') : text;
            add(constructionGroups, strip(construction), faceIndex, ticketIndex, face);
            add(modeGroups, strip(mode), faceIndex, ticketIndex, face);
        });
    });
    const grouped = (groups, title) => [...groups].map(([body, scopes]) => {
        if (faces.length === 1 && !faces[0].atmosphereFaces)
            return body;
        const labels = [...scopes].map(([index, tickets]) => tickets.length
            ? `${__rmT("BJgCyT")}${index + 1}${__rmT("fim97ju3wQSp8QajXDwdHT")}${tickets.join(__rmT("jvk"))}${__rmT("N_EGFefQPMs")}` : `${__rmT("BJgCyT")}${index + 1}${__rmT("2RddPk")}`);
        return `${__rmT("p6MhHAvSl32u_tquvw4dHT")}${title}${__rmT("nSk")}${labels.join(__rmT("7os"))}${__rmT("ZGlGY9CmCdO.h7ATxe03VtR2Ly5pZPsJ6zcdHYKPRfL15oXj4yTOgYFmx7Bf65hXzGc_7h")}${body}`;
    }).join('\n\n');
    const construction = grouped(constructionGroups, __rmT("VMWeyLDH7RUZMwKU"));
    const modes = grouped(modeGroups, __rmT("NJ17qFDfWGh"));
    const guidance = '';
    return split ? { construction, guidance, modes } : [construction, guidance, modes].filter(Boolean).join('\n\n');
}
function faceBehaviorRuleBlock(settings, faces) {
    const comboFor = face => ({ ...face.combo, formats: [...face.combo.formats, ...(face.combo.texts || [])] });
    if (settings?.behaviorRuleMode !== 'adult-only' || !faces.some(face => face.atmosphereFaces)) {
        return buildBehaviorRuleBlock(settings, faces.map(comboFor));
    }
    let rule = '';
    const scopes = [];
    faces.forEach((face, index) => {
        (face.atmosphereFaces || [face]).forEach((candidate, ticket) => {
            const block = buildBehaviorRuleBlock(settings, [comboFor(candidate)]);
            if (!block)
                return;
            rule = block;
            scopes.push(`${__rmT("BJgCyT")}${index + 1}${__rmT("2RddPk")}${face.atmosphereFaces ? `${__rmT("fVw55S0SHKG")}${ticket + 1}` : ''}`);
        });
    });
    return rule ? `${__rmT("OMr4W1bTQuWGXtLDf66isk")}${scopes.join(__rmT("jvk"))}${__rmT("EsksxEf7dCBbmnH45kiLnL7MFYy3LicfuHE")}${rule}` : '';
}
function sharedHtmlExecutionReminder(settings, directive) {
    const directiveText = settings?.userDirectivePriority && directive?.rawDirective
        ? truncateDirectiveText(directive.rawDirective, 240) : '';
    const visualPreferenceLock = compactVisualPreferenceExecutionLock(settings);
    return [
        __rmT("XhOIg01zvK0TWZVgbWYEgQxKplIYAc1rshAEiRsROGjM80IUsaeeNVhPBsQB.K4LK_UIcqgSE3BgjgCQJ_CYlSobkPY7C.EDBWjiJhypg3fhb.PFwFoyT8aWMT0RfYYFmhomuCVvBQ2B43Wzqj.LoUiJTCG.2NXuj7fmYZ8ClDmhbC4MZ4rnjnC7EJF0OiZh.LVtB7NFV5OQEn.vrbhBTtTPbs0AJUVj0jlU4LY_ij7IgnBs9Y_ALYEXWhsXHpnu2XbMehHg3FLMjnx.ZxqTIDWHX_3AV6jNw9KmgdTRIzTo_mW6XYevZ.AcU4nWLPzXnSH.7yDN4CTUqMEYQ3L3Anh5UmQGxaTBq.SPXrthepAlE_4mI6JkB.Em"),
        __rmT("lKJ9DRkoRMurGtS6TnkCOwcKBc7psf_fujz.gknfaoL7cPhwKjriBtBnk7xWcBnZ4gDO_FYLJE3Q.CRBmA3UkxCVO8xu90I6IWsVRNFHsVDYG.xFyc3iOtDhN.3bFeqz31ixT3ZENexeHY20HaZ7Dk6ZoPsXyo48ed7jOYhJkosXf8Ukmr3NqGT7z9aN4LZvp9ic0f4OudA7UzlmpX3fBN2zYvrHJWZtbR6MifCKsyOK38TdGHKp0vXGNCy2tjdYM7W18YWf_Kk1I6Z_VLu21EPWBWAxXs8OmExgn.eGWX3ve85IlBl1SbbqbLJMVDc9jTS2pVXanSVFwn2O_zmh.HXnwKrAiBYrtNAx2V7cyhY"),
        directiveText ? `${__rmT("4hLeIhKg3FQStf")}${directiveText}` : '',
        visualPreferenceLock ? `${__rmT("WgJjHN_P1tUHYO.ac02b8Tty")}${visualPreferenceLock}${__rmT("fp55qjlLF6BAOujAcQwqzoXYWoFiib62kMva9HjND7Euk9RRjbmYxYat4.rXI4wd3o7Y3h")}` : '',
        __rmT(".eOZAUs2iYhAHNInzl2a9PxCVUlGCwsklM19RckbnIMjgDrb.tcSMc5SeoEZHUprJpk6l4rswZtV0BWzhBuN2KSYWAT"),
    ].filter(Boolean).join('\n');
}
function imageLlmReady(settings) {
    return settings?.imageLlmEnabled === true
        && !!(String(settings.imageLlmProfileId || '').trim() || String(settings.imageLlmBaseUrl || '').trim())
        && !!String(settings.imageLlmModel || '').trim();
}
const CANON_APPEARANCE_RULE = __rmT("u.Vtv18mqtR9ll1RFmfuYlqiC2U32h5qsv7Ba40T1n4GVhzdmHG76pqj.vufKnkoyHfFgvIz4a7SFDRuTVt8CNQ.At_4dJbP3EwnlY6EEQsNJFyZZSGWSJnFzFU6WpsvZ8nRy9o_AhG.LDlq.QId2SjQ9.mvpW7Fl_22e1hyYXvZUm70BbU7Wbu9yyEt1xHFXeU9RZEkeQoTd3U8eHcyfAyysrE5TRbeSCyFNqmmga_1hVDZrJ0vSROazvPUSRjwUBjnUAlyOfTT7d3I7SU5OKXYa2wmO.RPuDVJudO9x_hbY6xGqCWCBcboPcfzMCBXbGPSHIQKJzlbqWRuwok8EM_mqTLSGy0Rwr3aIzCygr2Uj4DHBpuu6YHpE0McclEMiviEpOOH16Idj0g4FfuNV3snJNPbO2P.6qvDcDl5Hp7OE6il9l5IYJ4UpfOxfUz9QtcEBDgOWgvzByDJnlKRo.OJWV_3viNj");
function builtinImageFrameRule(settings) {
    if (settings?.builtinImageEnabled !== true)
        return '';
    const imagePromptByLlm = settings.builtinImageLlmReady === true;
    const tagsOnly = settings.imagePromptFormat === 'nai45-tags';
    const directPrompt = tagsOnly
        ? __rmT("mbvJBJZxG_szfOIVBvPQzPyaCu1WmN64VZ.Zgkz5ZI6dTNFahv3nSOshpu1U5NxnVMcoXXO4_MCdPffblUMvNo3_AgfibrpcNzBQUdcBfFnE2UzLBiot7Vlf3vaLBN6l49Zw3daKnq1y33297s1fAqMIDAjwiAFGTww7t.bDHXKlKHIDKa3EeG5jsWccrv6i541i1_hd2YZe8U98vExDSDuO4JnZDcvcbN7eW0L4G7dTKAcnAhyqBtC82R8Ls2rcmj1SC6e8xsWgjvyE6VHNxUzomxGYsTdW2xA1oJL4fAfT_N9uGkISYkeZ8WaM8ARl1ELv3LY7Su_1OPQSEuSE3TfA.Bpwf9iaJgvtPclTqXSdrLYcvAOPiAsT7D9kUa7JDrXGUtUeeYtEK7n3D0u6PXBmIKqdQiE58GFOn_9pUpaVol9Qe6QCBadrxtp9EeCkl7hY0u3h3DZ6cCUFq1W.EtzhhbtxF2YrCZVZ8zf5WerFjaav1e0CKfjivUTSVzupev3Z9uyRlLQqKZMuYm5FiJPUla0g0RemkA8hH9YmM94k7cwTn1c6Qw.JdfD5kXRkTSUlXau7xOgCFI2Uq9F1tGj22GaIF4lfjx_sw0FpwBqSg1w0yFYxfH7LQQZa4RGRGuYeAzG2_FcK2Wd7ZAegbHO6xBHFD0sxlFy5k0e4") : __rmT("F6XB09dNmR8dmLRLsAQT_PO2dB77ZJ5qXiROCWMlqSrAvxGEph_C_aazP0ZQ8eo.p98fXxVvm7pmA1jk.pEbEUOa74AYLnNw8a_R.HZsBJzC2yq9ofplYC0h6CRqlmrYjP47xt_y1KuTqglNA99S6cYqJtph.UpRT32Wx2oasXkiG3zFapuccGr.O3Zo4H6VpptfNKAl9knM9shumWMAboMq1iyHV4t_xT2SDr4CBWfCTnwLj16FNL8xhlGH5KEqLimBJVFlWuTQ.DDKqNIQak5ND1WhBN_843UE6543rYcUPTJ_oC5bRt2OvsNjRrhqztIUZe46ASB746.ZcNF8Zv7lVYK.CAmGG_sszHhPDBcr2kF2828HcGP.DXsO52th8j1Uqi4jja4RPJG8Qq003QrbuLHVpj4Xa_Ue2rYVvsKJtVgeksROn2P3UJxGdYpv9W5DWm.DLLtZ_mCYJz45y_9rK4hhKZtLUc9ZJrdEbE7ZjlRYX7ZoUaXd9aouxAxrP5ZAGdzLQOiuQnxWFVlmyue1k2r4Waiu7RWlgoNQ6aU9J3K1yawRQjy_.9BUhWNDRsfSap6gApvtbqnP3iP80gmRKcoDTCyDyQAfDEWDidrv0gyqTXsabeplfV3tHtjzrhJsLpWplhQVuHWKULLjK3LoUYWrj8EFV6g3DQmnqR2gcJNiYGtZBLFx1v7UYqCCJE2JOZZOJLdNlX7.SH95RECT7hiV3c1g8d2BxNb7KSMXqYMGch6IMp1oXq_ulyWvGKf2BmBz2BheDxtEvniSjaSUlIR5Hyzbjpj1tU.go3RsWydTrXw0kXFoyT4L64vu_9VCVFlWtK0_84NFq5itfdjcgcCRSotI7UQSJndicr15Am6_FVbUVSHjSYwfz8czIIldVKniNYZfSiZpz7_szT");
    const directCharacters = tagsOnly
        ? __rmT("6CW0jn6llvS5yctdGpzRlhGqeQcRapw2y97rID6pEIkDKpskHiZgMeqeUGs40UWVHDxTBIoOWHoPgnLmZm1qgKF7Sa8FFx2omvC_B4c7C6S83ORfeY1i7sBK0z7udhIapsqdxYUJcDQz9oipJwUN3VbdQJAr0S0QYgiuyzhXhGbGybn8uNblyioBSZrdm6_GosEXTRWmk.jD4W8nS4MiEo6RMEt9CrorzARsTzXD.9ebvC1eh2qQGES3iEHYpad1_uSjK0xkeeckZdorihh_PXxA3bGSOh7UjW1YdZP6N2RP4zHgOoXu6E0qjTmeDiDmsbX9_sMXd3wyoXFDs1fMgGIj5an5toYWVDni_cRNDOrOTHg3dhMJm7Qrq_QG83sVBpSNXaFOhCPGIWE0X1c4XSEoQ5XmgeWdepRmhghdIevnXnA8E1dPdIqwRKwQ9xJocQ6ynNSkkp8.OcCfzREsqx1J2vrwORqQVqDzpFvzRpjqAs4wL6hcvS5LYiv0bPvbXnH6pbc9LO4i3j5u4PoYwHTiNKCOFhtjBkTtVMtoT9RydQ8W7chAVjUYO5Ua5ad_u2kOhXcJS6f2oX56Lu0gWLTex.vraY6Bc8k2MebHo0ELoCIypvx0Mh_HrQwmrc7wQ2yRWfuYw7HrLb9nGZcalO5_YPm_Amy988snKCRm.A8epALss_vxV52WKKmeHpSRh0UMEgHJ3RASNKW9oyHECXUoDUjsbtYo") + CANON_APPEARANCE_RULE + __rmT("c_4VnyHMOF4gmdpYOHs0fRbTjNUcHmZIfKMnzHPQYZr1nQA79fQCQIG3E9sTFe7vqhNQyzb6Y3Y")
        : __rmT("0cJv6wi_fAHwm.6n7qAWNpqW6.zkyN.0XAw55Jv0QA2rhcX7.ipCsA4pUQWnKqNKD.kMiZOPXIm0GejmL3GriXozUz2JQjwfcY0.5vU.njCQIintdgyp5yWWjdAGdmlqmiKmWXlKRfn0fFiXHTp1fg.7J1hXg.tAdeJuetmi4io5_wpFajvWKKCWJa2IfAVLKy1sDH14Poj6YCE7vuSO8H336j7wp1hay56OYvo66Rjn19f2DsSvItAAWXddrrOps7VUL5M6tdkmluaaHivahci2A4qKug0wzzD6kkw6xIBZSNnNqB_SkA0JQ1LqjRTS.zz9FIvvLLnALjLvcKBEIMlgFHE7bCdlaUIFtS2HNwxLDvq_CSIunKedv48poqPz3zrw51rdL8SRcwSPRkI58Xi4z77SI_Nctf5oRDWKS4ZdDkdJUldtfFda2VNC_Kr76FsGKwjbzyV9O1GWoOw2yXKgTf6Kj.JmlrgUBg85jmaTabnktOZy64EF9MExV_b7qszyrMh4ghcmWQHCZ1PaLUA8ci0_hRURFKubNErf0cefd3m8WraLxWM283R2tXl3gaPX1g9yU9EEgCKqKBmXg66j4.I6XbO5mXtFIxeNCYtDluEYO0Atq3l93C_2kQby.PRUxdbE2CG6iFW7ON6xkTV9Q2qVJFq3n8fG4Ovu_0Th7tNyg2uvqxM6xHWjQCmrgdqX7TVmiB2to9jZTsHRBDw6ggPXYwlDw6fIVhWEJIe1SrzOXViWtGjde56Z6FA73IiWq3w.noGdyV4agrRdQyC8wX5asbkN9HMKvPrzgSXUCy7LTzj6Hw0zycTPQcixNEijJrbnkLE9DXHll7fziL.0WgF0Y4up") + CANON_APPEARANCE_RULE + __rmT("PlEEGRUqwxyAkq578ZB_8Ilf9cc9OMqe9Kf2Mn2F9vD2_FZlb68jdBfLxuqyEeNW2nJtVPN.pq3v85ye5s3LGW721mWwxaS9g6GHt_0_B2QpBtvmtRn3iI7LujQGibpzss2Rh1KNU27aH8g8rjOKpqWBC_4pG3gfoDd2aossco7f8AhfBtCib_P6eRaUHo6CTwygyo7Ca2jqbAiqByFjfsvLGOJbETpz7ZcFSEOX");
    return `${__rmT("3SDkyYYyA1yTFFo_SnjE2__eKc_r6z9zakTb65eHfLdxQvjPNGkcIEEN8zCnRN0OQftFv89wVrK0EYTTBmviXBig_pfNX7D.fROGG9mwZeWcmcQv7fz88KyoOJa2ELW5jqN1BI2bGkKWn05ev7JJX.PWhjMyRlvMJWTYXDUG5lS6iO6FCaRHIRolGN7owOmsujPUYVtNc2izHPOCHezfIGe_ipws2qxpzusczD0oAoviKN_iMdUxwnxgWUGU8mf2PnJG3hBmTZ2DbrPWivYFM.rZvjxy6qDJzpqlpfJ.o2GvDo2Bdu8nEuAHX7vNnAquoVDNjHjiKkMsTUIatwQAAry_cGqh.KtxA6acYTu_32EZ1eDWjMqV6P_.jFHSp1eZWgFpcA5pZLP0YCz3xkZTH65hK_k1yTt9OOSNe26QJSarqEWjoTXXfwQbSkDVfaJMzGAywleCZGksbX.yyHUNbpNxZa_0XdEllhJTlcnijoNoQ7DW.OrPylzeooTuQJCVY.2vNuTDrInNPa4.n2gT.a6CNnjZ2UEjlZ3RuUrOHQFhYyoZb_swuGplnzVf3gNLj7TtDz2fxuN_jghoxQMtz_WbwcPR6MYcshSXybu3Rd30x7YTRUZrwOGUW8UvWpvWlxY8B74z3yjV3ZzKkqTdXBpdyl84KY1WVccz9yjD6jfIze5JHf4aHfIOVe4IA4tb0oseqypoz7c_i1.BUYL.lEBhN88SOTI3X4_WOmncLQRWyNZEjA0AJO78W94JXfSRrk5Bck0X.7E7O_NW.s34IASRk.L.gATJJMmSvg_gmCcQVPOLOFLExtv1dUA8Y1AtqdtnVroiBFNtTEtD4rIjXhC1Tcv__I6rdr2ENvDK9qU.GBMxYNxNm0bYGFW2U9bZ8TXJOVhaZb2MBIIx.W8QzQ8qXXXNhgYcobcAMzBHz0foCdKFGxeDZNWyMQwA756voJGfMACvZlmpl498UpSsQVIxyl7Wb9IkTIEcQQAiPfDu7rhHpOVtxhU.zHMEyO4WmgoUvs_YbcXeVTLeTw7x6.rV8ld20Ep579JQTp0TNok9Guk81rb85iiozLSelLtRAm12x8kOa0WYd2ZKas2xVc8T53w9C2NKdDGu9VmAM_FLRmWMORMTdD2CHPJrOH8jxQawuopIsQZ3eJXEbLyy_f0_fwzw18OQsi2RXj9T79Y6ipLa1X6p40HOyYneam3wdfz9BuIW7XXMnO2UCY49nuGKaY0KtIZqHwlbaiE9t2PrscJSTztM0xxwI6ggmbcZ7eVzdYId0sCSjCoHg5nxaFp8g76xv2Q7QLAPlIG0SCHlAcP2DhLayeNDzWBwxHvitbjucXoEoea55mkh.PMTFw117nOUzUugm6mtHXV8R4TIG9lDGLR6YZpGsdO5IXEvtJ59Tqa.DUDx9r48owzQR39_vG5PuhyYr6jaCe3FaLkE8qbJoGZqv98b.uhFhS4bNoGJS_EycIFcLuayh_J3ClrqGjSxUDZjYH3OXyzl9UbcRp4NkQbum4EGR63nyha10D6lckhobc2dLuuCpKuIRFfWAkkJVwrZJZMHEVJJhsKYBEyfiMTOjQgbo48S5koOaU0m7qz.YAc6342ThsjVwVzYcbB3cZaDmWjOA3zQPanImX1eN1n4bxAbvM_Ux.a1X8rBJ0Dx4RWuNVTkwqQz.5shM_C7B1.P0Y.4XGbXnbrYoK3ngT8S3lu6_.0WK.oooX8U6xfoXa44YEjqq7Mmfd1rkXV1uLLbFPZltqK9lpRFAqIwDHI5VII_t9LMz6O3PWaapJenTPjkeafaOyNiDdXwoXmHiVXo4YUFEvrW4SSgEx7dfCluifvJDJpWaZD8EuwwHu48HZUXoFPjecWblVtpBadCdzFjHqZDx8t8IT8u.uLn6ST7NX_BWP46j5GzigoGjbnAqE9vppolZSFNYOZtJESvlDOT4S5LKm8z_fG_XQgxInepI_GSrEfOwWsNxbkffIs9rRiEL6Zd8Ht4K8.OijVe4WlS5qrJIBQfv84QLyaJgOW5_gwP8VzrnhdMuZixWxoAajskMNJa9iFzMIIRcSRwGzf4eAJt1H0E3Pf98vjY1erFLq24YFiUXUzhFpqPdZIHXH0TcBE4xOf2ZUE_gOwYX1_88ATL1DluXNKGeHxI32iTXc94hDVvaUAk1CTo7_3bK.B.5DejeC5GZTa3XNcZUphYMMqOgEWVvO_J3_FSc7.T6nKNRIiBgw3_QCKJ4S.3HzZdysguXkz67BoDrQ7fjUBMBXUSVlkXzCLqO30coi8V96SaO7xu0zKB0xgbwFVEo6MhRkX6xkobkhLSm.MtJNcOEgT7vZD8Pt_02HjYJnDQWzmSuaHFtSc2FNkhmMbJGukCIp5C71Mm_p7HQPOTP3Cc8AhzPBrQh_bKHgbWac_")}${imagePromptByLlm ? __rmT("Qw5pybmG85G8DDcFIjS9skHzf5zfLx21H15Wqa03SPRNs9lQ6cMMq9zrrqPivS80hSQKuU1n1WGRfFbjjPmFlWu.96JZip1wB1.4zfKhd.WQwQqDNfTEYE2Pf3RFJGqAt6tT.AjM") + directCharacters : directPrompt + directCharacters}`;
}
function buildIndependentFinalExecutionLock({ combo, settings, directive, candidateFaces = null, includeExecutionOrder = true, includeCommonRules = true, executionPolicy = '', includeBuiltinImage = true }) {
    const mode = combo?.samplingMode || settings?.samplingMode || 'classic';
    const themes = mode === 'format_only' ? __rmT("b91q4o__jtnczrVZ") : compactLockItems(combo?.themes, 'theme');
    const formats = compactComboLockItems(combo);
    const formatContract = compactComboExecutionContract(combo, candidateFaces);
    if (directive?.pureOrder === true || combo?.pureOrder === true) {
        return [
            __rmT("oHsEgKSPp08nYaCrfy2jhHKhEUyC5rNfISmh8BMdW7Pljtr5F.eE7zH1ef0TzxR0Vxhtoaj77U1ROw1I7alQjUYGqbfupfClECRt2UgtZkM_tD0IZPxgUgjfe9WcYOXGybLBhQ8SDMT"),
            pureOrderFaceLock({ longText: combo?.requestedPresentationMode === 'longtext' }, 0),
            `${__rmT("4hLeIhKg3FQStf")}${truncateDirectiveText(directive?.rawDirective || '', 2000)}`,
            includeBuiltinImage && combo?.requestedPresentationMode !== 'longtext' ? builtinImageFrameRule(settings) : '',
            __rmT("gEpAWngRhGQ.JNmRdWCG53J.frQK.mzGshIF3Ci_ye33CPiP3VEijKlyMGKAKjRvre863PGkHSE7Q400mkpFrh"),
            __rmT("pJOFYgVkrYU5K63Ww5bbof5xWY2MJk"),
        ].filter(Boolean).join('\n');
    }
    return [
        __rmT("oHsEgKSPp08nYaCrfy2jhHKhEUyC5rNfISmh8BMdW7Pljtr5F.eE7zH1ef0TzxR0Vxhtoaj77U1ROw1I7alQjUYGqbfupfClECRt2UgtZkM_tD0IZPxgUgjfe9WcYOXGybLBhQ8SDMT"),
        atmosphereExecutionReminder(combo),
        combo?.atmosphereMenu?.length > 1 ? '' : `${__rmT("dxDWzON7HuOStf")}${samplingModeLabel(combo, settings)}${__rmT("Y0nU5E8IWZY")}${themes}${__rmT("Rh1wkm8K3_dutt5D")}${formats}${__rmT("jzk")}`,
        includeExecutionOrder ? presentationExecutionOrderRule() : '',
        `${__rmT("dxDPpwH5mM.Stf")}${String(formatContract || '').replace(__rmR("3MOYBt6i_OD0WYPG_gOLJgvr.KthJk", "u"), '')}${__rmT("jzk")}`,
        includeCommonRules ? sharedHtmlExecutionReminder(settings, directive) : '',
        executionPolicy,
        includeBuiltinImage && combo?.requestedPresentationMode !== 'longtext' ? builtinImageFrameRule(settings) : '',
        __rmT("gEpAWngRhGQ.JNmRdWCG53J.frQK.mzGshIF3Ci_ye33CPiP3VEijKlyMGKAKjRvre863PGkHSE7Q400mkpFrh"),
        __rmT("pJOFYgVkrYU5K63Ww5bbof5xWY2MJk"),
    ].filter(Boolean).join('\n');
}
function buildMultiIndependentExecutionLock(faceContexts, settings, directive, executionPolicy = '') {
    const faceLocks = faceContexts.map((face, index) => {
        const mode = face.combo?.samplingMode || settings?.samplingMode || 'classic';
        const themes = mode === 'format_only' ? __rmT("b91q4o__jtnczrVZ") : compactLockItems(face.combo?.themes, 'theme');
        const formats = compactComboLockItems(face.combo);
        const tarot = face.tarotRulesText ? __rmT("nhN.Y1g.CrnfsBId7K5xBat7CFU9jzI3kccoXr02MCO7rk") : '';
        const locked = `${__rmT("BJgCyT")}${index + 1}${__rmT("qGyf7aop")}${samplingModeLabel(face.combo, settings)}${__rmT("Y0nU5E8IWZY")}${themes}${__rmT("Rh1wkm8K3_dutt5D")}${formats}${__rmT("ZmE5KF2xWZY")}${compactComboExecutionContract(face.combo, face.atmosphereFaces)}${__rmT("cvR9HKuI0CPwpw7FB6TsJ2DgRyqQFxwuxkCWxgVBDCNVV1hb8KzNgh")}${tarot}${__rmT("jzk")}`;
        const identity = hasAtmosphereMenu(face.combo)
            ? `${__rmT("BJgCyT")}${index + 1}${__rmT("qGyf7aop")}${atmosphereExecutionReminder(face.combo)}${__rmT("pmfvirop")}${compactComboExecutionContract(face.combo, face.atmosphereFaces)}${__rmT("Rcog16xCxYU2ImZvFmBPuCjD4Hqrrk")}` : locked;
        return identity;
    });
    return [
        __rmT("oHsEgKSPp08nYaCrfy2jhHKhEUyC5rNfISmh8BMdW7Pljtr5F.eE7zH1ef0TzxR0Vxhtoaj77U1ROw1I7alQjUYGqbfupfClECRt2UgtZkM_tD0IZPxgUgjfe9WcYOXGybLBhQ8SDMT"),
        `${__rmT("3K7lqNCi86MY2eXWPxNcOJGe7FoyJDrzd.DKKtsUnej.jY4p.GCwZOqGMUOj0B_qJgcA7h")}${faceContexts.length}${__rmT("7Lcv1gURbno1ku79gPD")}${faceContexts.length}${__rmT("FN31dj5hVg10BDUlLYQe_Q3IfSrFk6ujtxnnVadNG.4QkBtA2pEh3MU0SlpBUKhm3LlSnc50E4wOKfeiDZW3hnl8cepcxf")}`,
        presentationExecutionOrderRule(),
        ...faceLocks,
        sharedHtmlExecutionReminder(settings, directive),
        __rmT("gx0yRDIu84InXOOcq5FNtV2vK6VVH7uf4e0AbFgev5FLepv2TlUtnFZjWtFfc6nlJ1dMXuLZzEcGklyerbPllA2cugHHvy8kR6hE_bjRRUz4ghmeQvGx39IRDxz33Ji7GoHGpF2jYImPDgWF1yo4AzIS8e9KM1SsxzGx_T"),
        executionPolicy,
        builtinImageFrameRule(settings),
        `${__rmT("GF0jFqPSHKG")}${faceContexts.length}${__rmT("FmDgNmYZCCJYboYIMCjLkVDqNJS3byMLZFTuD_Ur6RQtuIrF7MhNi5FQugRkNSkC")}`,
        __rmT("pJOFYgVkrYU5K63Ww5bbof5xWY2MJk"),
    ].filter(Boolean).join('\n');
}
function freezeDeep(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value))
        return value;
    Object.freeze(value);
    Object.values(value).forEach(freezeDeep);
    return value;
}
function buildFaceContext(selectionCombo, settings, rawPolicy, externalRawMap = null) {
    const textPresentation = isTextPresentation(selectionCombo);
    const longText = selectionCombo?.requestedPresentationMode === 'longtext';
    const hasExternal = [...(selectionCombo.themes || []), ...(selectionCombo.formats || []), ...(selectionCombo.texts || [])].some(isExternalItem);
    const summaryMax = rawPolicyProfile(rawPolicy).summaryMax;
    const combo = hasExternal ? {
        ...selectionCombo,
        themes: selectionCombo.themes.map(item => isExternalItem(item) ? externalDescriptor(item, 'theme', externalRawMap, summaryMax) : item),
        formats: selectionCombo.formats.map(item => isExternalItem(item) ? externalDescriptor(item, 'presentation', externalRawMap, summaryMax) : item),
        ...(selectionCombo.texts?.length ? { texts: selectionCombo.texts.map(item => externalDescriptor(item, 'text', externalRawMap, summaryMax)) } : {}),
    } : selectionCombo;
    const selectedThemeResult = formatItemsWithRawPolicy(combo.themes, 'theme', rawPolicy, externalRawMap, textPresentation, longText);
    const combination = combo.visualSceneryCombination === true && !textPresentation;
    const selectedFormatResult = formatItemsWithRawPolicy(combination ? combo.formats.filter(item => item.id !== '10.2.2') : combo.formats, 'presentation', rawPolicy, externalRawMap, textPresentation, longText, combo.pureOrder !== true);
    if (combination)
        selectedFormatResult.text = __rmT("7d67OPUPS4PnJWQeWCgneGDeCHDELhXCeCE46ZNpe3Tabga894nrL_jfs1JXnkgL4c3eRxuVLZYtU0wUf.1kzfuRA1BOzeWs6glB69_uGRKrdLJKlZ6uH0Fzyy4_LsfZo3VxZtrGa_LkSZUvht_QYoZGVAO5d_vAM0sNEVatmV5hlf") + selectedFormatResult.text;
    const selectedTextResult = formatItemsWithRawPolicy(combo.texts, 'text', rawPolicy, externalRawMap);
    const face = {
        combo, settings, hasExternal, textPresentation, longText,
        selectedTextResult, selectedTexts: selectedTextResult.text,
        selectedThemeResult, selectedFormatResult,
        selectedThemes: selectedThemeResult.text,
        selectedFormats: selectedFormatResult.text,
        visualSceneryMode: !textPresentation && combo?.pureOrder !== true && !!((combo?.faceDrawConfigured !== true && visualSceneryEnabled(settings)) || hasVisualScenery(combo)),
        tarotRulesText: !textPresentation && isTarotRelated(combo) ? expandShuffledOptions(TAROT_IMAGE_RULES) : '',
        touchTheaterRulesText: !textPresentation && isTouchTheaterRelated(combo) ? TOUCH_THEATER_RULES : '',
    };
    if (hasAtmosphereMenu(combo)) {
        const itemFor = (id, kind) => String(id).startsWith('ext:')
            ? externalDescriptor({ id }, kind, externalRawMap, summaryMax)
            : (kind === 'theme' ? THEME_ITEMS : FORMAT_ITEMS).get(id);
        face.atmosphereFaces = combo.atmosphereMenu.map(ticket => {
            const themes = (ticket.themeIds || []).map(id => itemFor(id, 'theme')).filter(Boolean);
            const formats = (ticket.formatIds || []).map(id => itemFor(id, 'presentation')).filter(Boolean);
            return buildFaceContext({ ...combo, atmosphereMenu: undefined, themes, formats,
                paletteRecipeId: ticket.paletteRecipeId,
                themeIds: themes.map(item => item.id), formatIds: formats.map(item => item.id) }, settings, rawPolicy, externalRawMap);
        });
        face.hasExternal = face.atmosphereFaces.some(candidate => candidate.hasExternal);
        face.visualSceneryMode = false;
        face.tarotRulesText = '';
        face.touchTheaterRulesText = '';
        for (const key of ['selectedThemeResult', 'selectedFormatResult']) {
            face[key] = { ...face[key],
                retrievedChars: face.atmosphereFaces.reduce((sum, item) => sum + item[key].retrievedChars, 0),
                retrievedItems: face.atmosphereFaces.reduce((sum, item) => sum + item[key].retrievedItems, 0) };
        }
    }
    return face;
}
function faceMetadata(face, settings, generationType, rawPolicy, directive, memoryMaterial, followTagIsolationTags, followTagIsolationText) {
    const combo = face.combo;
    return {
        generationType: String(generationType || 'normal'), rawPolicy,
        strongDiversity: true, darkVisualMode: settings?.darkVisualMode === true,
        samplingMode: combo?.samplingMode || settings?.samplingMode || 'classic',
        ...faceDrawMetadataFields(combo),
        themeIds: Array.isArray(combo?.themeIds) ? [...combo.themeIds] : [],
        formatIds: Array.isArray(combo?.formatIds) ? [...combo.formatIds] : [],
        ...(Array.isArray(combo?.atmosphereMenu) && combo.atmosphereMenu.length > 1 ? { atmosphereMenu: combo.atmosphereMenu, atmosphereBucket: combo.atmosphereBucket || 'story' } : {}),
        ...(combo?.atmosphereBucket && !(combo.atmosphereMenu?.length > 1) ? { atmosphereBucket: combo.atmosphereBucket } : {}),
        ...presentationModeFields(combo),
        ...(combo.texts?.length ? {
            textIds: combo.texts.map(item => item.id),
            textLabels: combo.texts.map(item => `${item.id} ${item.title}`),
            textDescriptors: combo.texts.map(item => ({ id: item.id, title: item.title, sourceWorldBookName: item.sourceWorldBookName })),
            selectedTextChars: face.selectedTexts.length,
        } : {}),
        themeLabels: Array.isArray(combo?.themes) ? combo.themes.map(item => `${item?.id || '?'} ${item?.title || __rmT("cyZtO1kw")}`) : [],
        formatLabels: Array.isArray(combo?.formats) ? combo.formats.map(item => `${item?.id || '?'} ${item?.title || __rmT("cyZtO1kw")}`) : [],
        ...([...combo.themes, ...combo.formats, ...(combo.texts || [])].some(isExternalItem) ? {
            hasExternalReferences: true,
            externalSources: [...new Set([...combo.themes, ...combo.formats, ...(combo.texts || [])].filter(isExternalItem).map(item => item.sourceWorldBookName).filter(Boolean))].slice(0, 24),
        } : {}),
        ...(combo?.formats?.some(isExternalItem) ? { formatDescriptors: combo.formats.slice(0, 8).map(item => ({
                id: String(item.id || '').slice(0, 2048),
                title: asText(item.title).slice(0, 160),
                summary: asText(item.summary).slice(0, 210),
                tags: (Array.isArray(item.tags) ? item.tags : []).slice(0, 4).map(tag => asText(tag).slice(0, 64)),
            })) } : {}),
        selectedThemeChars: face.selectedThemes.length, selectedFormatChars: face.selectedFormats.length,
        editableVisualChars: !face.textPresentation && settings?.visualPromptEditingEnabled
            ? [settings?.visualPrompt ?? DEFAULT_VISUAL_PROMPT, settings?.visualExtraPrompt, settings?.visualAvoidPrompt].map(value => String(value || '')).join('').length : 0,
        motherLibraryChars: face.selectedThemeResult.retrievedChars + face.selectedFormatResult.retrievedChars + face.selectedTextResult.retrievedChars,
        motherLibraryItems: face.selectedThemeResult.retrievedItems + face.selectedFormatResult.retrievedItems + face.selectedTextResult.retrievedItems,
        memoryChars: String(memoryMaterial?.text || '').length,
        memorySources: Array.isArray(memoryMaterial?.sources) ? [...memoryMaterial.sources] : [],
        followTagIsolationEnabled: followTagIsolationText.length > 0,
        followTagIsolationTags: [...followTagIsolationTags], followTagIsolationChars: followTagIsolationText.length,
        visualSceneryMode: face.visualSceneryMode, forcedVisualScenery: !face.textPresentation && !!combo?.forcedVisualScenery,
        tarotRules: !!face.tarotRulesText, touchTheaterRules: !!face.touchTheaterRulesText,
        userDirectiveApplied: !!directive,
        customThemeCount: Array.isArray(directive?.customThemes) ? directive.customThemes.length : 0,
        customFormatCount: Array.isArray(directive?.customFormats) ? directive.customFormats.length : 0,
        customRequestCount: Array.isArray(directive?.customRequests) ? directive.customRequests.length : 0,
        rawDirectiveChars: String(directive?.rawDirective || '').length,
        customDirectiveChars: [...(directive?.customThemes || []), ...(directive?.customFormats || []), ...(directive?.customRequests || [])].join('').length,
        presentationWorldviewLockEnabled: settings?.presentationWorldviewLock === true,
        presentationWorldviewLockApplied: settings?.presentationWorldviewLock === true && !selectedThemeHasIf(combo),
        presentationWorldviewLockIfExempt: settings?.presentationWorldviewLock === true && selectedThemeHasIf(combo),
    };
}
function textPresentationRule(longText = false) {
    if (longText) {
        return __rmT("DBAmuv631okDAdVE0BxZwfnh3Ao3hopKrgNiubTb_o5kZAgZjcpTQyU2phOPvO.4qC9gvO_ONjY7XW153enBbgAgQcQoUY7Uuv8Vi.SnNpuzyOSkvnhP8_MRS51LFuyh4uEjfJ9gyaISRCHnXplkgRovgmcwstTANqnx3mFB2rd69giU.IzrpMYKM7hI7Iqh4.4P4uxBsz0hDxBqvDMpLx1jv2htLHxa8H08WLpNw0gzOXknsn3fnKeS8Qz0VlvXl80abrhVJKV2e6Uu2E_skNgcZZozYE86f1UgubEiYWBHoT9oNmzi2W2P3MgEodaxk7ezuIMh3C4C6QzwfjR.sNp7y9sBXpYG9M8HGDJ9Al.RwiTlEoU3Ga.RgXfJx5n1nK90RXLlZry0Z7X.SMT7IMY2geKRGVmZVv3RuoLjJHGPm3iVL2ox0wd7wItm2ybJc4IF6T4MMBF.3g_QaKu2ZVGtyq2O4QhDJrI57bEde7_CrtcmsH.p7wvJCo4dG0.4vQLuY7EEwB4z5YkbDtJp8VLJJ6gtjMy3im34T3Qno6He6mS8V8LjB.xy8ncMISPMtlIr5lseL.a57QtyV9xFqqdUPxd1NgH2trwNYHlqjT.mUWYEcPajFz5b7Po51k8hzaezxNYW7NMDQYH7lUShLb1Q36fFCnD05a6yDIHlJlx.F1ZqFL0TxO9R.IYSMYZEqkKC55jTSdtgL166.9z6tajjXt_g2Z7_jZOXlw6cLHNPmUmndAvbEpOdBdA7bai_NE0bxMaOk78KyVcMvEraJbMmlSWSvwK02oOD.kEx4wiVKX.IAyL7MG3lGmKBg6ZWZbs4MIEkhfh7xRDj0rvE4P39GQ6HlG2x2UPoLAPyQBlUHLuht1hot.YCo79MXHHN7qm2qXWaR55cAWu49q2WooLXCHdbNE44yXLQUjmxhk.LxhoocwrgKAcQ6Xx61G1ViSyP6VI2ZSImd2nNFNJl4v_mz4wKg21F6KtnqamWZaPaYwtxczwYF_ciCeTra.4UsCHPuJTYt6tXB.CGtw7rGluMhP51AM6Lyy0nVwHh9byYwAmBVmqweAz9iKW4feirmmMGH9wL33rvtXHB8RaJM_PKcV3GfvA3l6f.Shdj12Ych5XM3iBbrmZSfODQbvnSUXxl9LSk0HOG5S5BVGDOpznC14uyvK_bovdf9RLuUnkMtDeMmSDIkSS8k85aaqHkg.2gG.7L9E2_9NAz7wzhnfgwinI9gJRDcAQCKWuhnUbJVStZOH2KV8PR9huRVQ2usTXRm4StEhXW7u4oqzCVm8oc8El8SfGe0Y.EmH5jv5c5As23CW8od7KI5jKdLp1iyroWcvOTmQWdF200..94aXgc4UEcJjNVgE_x89T2EB.uHS_Assqn2Gfntpr96.66cDRZtNNGRd4deuYNzWN4_QtbFHPvqtuCq7zl3CjlBg14DRrg5TQ9qdKEm5mrf0clClth0uBNq312klHHDTuy6mtU_bVyl643lU7J6iDSzcKzM_yoYH.rGE4cGwFW3WCidgOV27S45kruYVxnvr536y_.AXugKNyfMKY7dsftiUiH2UuX_Cmzw0oEOoMY2EcYxdLDPliOj3M9XfvwFqQxCY5TR4BZPBc0N1AwcMzyFMCPhjLa1paIWEq4mdscYLEMUyyIyIOoih4Jval2I9qnVebcpX0jtyiWQFFnnV5TVT.PDvwYo1OIcph2Khhw2AUlpjjXQIX8rBoWL7XJchyGv4QfSrED4T6oXVg.LvFM09jc17.8bUzZA2hljxN_XxHrrS6.gb.ZR6j_hQhn2Z5DrKFmen2dEe4sXd6rMeBYraqUwsezsslLZthsfCpzXnpRvlew6ZI4u.nOT2fl5EzV2kDPBxU8MO4lX3tKpUQRQo1yTLTe2CtSFaAHz_.Cs6FDjGlWoKPPQjrNdMEC67v9RTLiUG9WbV9ZSUKGKfFxaJp_8_WZpRvxfQoZhpD8W3vPusQm5YcootmURGOgyKiuVXts1lFF9MkpvIGIdJ6t4DdU4SnT0iBZpSE.IomKXCPY_dWMO9YYHA5ntq_6eKviogZ3JSPc7jp2ec9v9Uv1PE5_mwObtMdt0REk9hff4.yW.krj8ltu9IEeGu9MFRANwqeSj1N4RnLT9pUm5wfdsHlDDq5j4.bet6AVCBJGf9SxX_tY8rrvZU7QcmAcMLoHCTs51VJ4JhYZYdUWJimB4uLLA2.Qow7_cSyZAJBHAGq5MZUbSPI1gv0dJvI71CaxRwgPCY0AUN2mHnfauR8O5OepU6p4fxvsQsp2OAh06zmUaPV_sYdfcYs775LkZTGADPydYuSW9CVQVrAk9YlxYi46TCAfRFG6r.wZISJxAaX9bKsFm3a7oLBLTRIYZ3806Lg6zInbVaQ9A_PkVKI937PzdsxEkB9t2vg1KNuaWsqB8n3zegkzl1aQTHx4teuQbY79Sr1wkPnScN3Iyx5kvjQuLb6.wTlLs8fg3cLzh_9FnBqbfa8ORB6tW4OthGZjvDwMs70JzQTlIwmuKeMuW9lSq9k_0vBkd.OfMC6_ph2kxvLV7a1yEw4GW7Fpp9G0iz.cCgsS5X.5iWp2IkzB_lkrWSXJdpp.n48T6bC60D6iOaTqk6CdYCp7Mbc2n1pQeLlNxLbiwgDRcPq.FOxTJSA4CIWdEDoAoZYpE4TEPy1CdyK4tj2em7ACth");
    }
    return __rmT("vWq26ESl8Yyt_loeiwtiRm3sotl7rjEtP9qgQ8dF5yOj8Phn0yKjygbsouy5KbwxIbcZdDS0EP2c0_UP_VikVeWtv0ToSlJXAyCPotbJ4Pmxl9M3gMANAKUEmYQJ4cyavEM50h4knOVcoM_zIaQK53wjrrfPSc3ggiVLrXRlYDGWhscyaGELNzr6U9a.gmiu8kBwBiP3WX9hVUsHbY2vqCkfLiaYCEbVvlBXup.9SOhzD6IPvTBIDh0EBrtq8Rs08HOT2oF53Hub38DAoJJIm_jm08Kgn9l1CyR8gjPSZoenmz66.dkpGHV63THMg63cI4LOsPOmUKEZeZBhGWNtelRlAfXgPBfnlKgpF2Qm0ClZNgvhWANpi7GpPwkAwW7IcYRJN2BVxsffginqBKo32dgs7_IC45BHC1utU1i3TfOwNmFLQgKsMS1HwkMwdZyjui9vB9QRNnfHN.xZGX7zBVXPm1xvoQdau0FfywgkYdFURWOAVIuWn4MvuOJNcATWBSaw9cy5fRjYTbRpabhdaVqa13A.Uo5PWUF6UUPmEvPjujD1AAVytvvpU6znzSHEdCXqhu9.fpVb9l5wGv7PcaWceUI4UMpWT_gFT4oRK2lI_hX_ljcH7725SJL6Q0vPy32ZeUiZNaqrFL02CSrn.bFD.QwtJ5y7gap6PzzhJAsxKSOqnEOrwSroc6ENiQyKoCmoRESZr43_spS3J0jaW6tN9v9LepKN3v1KbA_UfQpgtps8Mx2m8aJ6T8JnKTnPi1FGPGVyNBBxtoBERPgn2gz00.mJ7IUpSaqZlZaVCub1OjCG_aWwA6SFRTMSH7WSIIN6O0fJJaNL83lJL.00dcCX8TwqnMUIFVUZAqw6m8MLTF_PuIMoSL1ph8dvngvTw7rooqHl_PmqoUPdBi__n86MyeNNKEV.86NTBgblV5kJxoJJBtGOnLLXkj1YtISOvLuksjBpOz70N5BWaD0U2NrnHe8lXk_c2Z.GhvhspPhKUcxf8PeGm51ZzjZXQxyJkI2VouE4BQkLZ2kjW_ahZv3aLAiC.yVJctngCmPPRK.fE8e6OEgMdGLMpPQQbssUvRlNTTje8kK2j_4YFBmWr_90vwVVyvLFE1Erv1bwoL2TOUZq3d.h8Y1v.ECS0Nbem9N_68lwYuJZvAakv3pAySHJnK0gavQsmxfA2Tn__qnePofI4cfPDQRK.nw1Ok");
}
function textFaceLock(face, index) {
    if (hasAtmosphereMenu(face.combo))
        return `${__rmT("BJgCyT")}${index + 1}${__rmT("qGyf7aop")}${face.longText ? __rmT("8f_OwyRmo4_RanGzuk6VGQW2KRp") : __rmT("v65Gjk")}${__rmT("jzk")}${atmosphereExecutionReminder(face.combo)}${__rmT("o.j0bnHNDqgvTvFiF5UEriRE5nG44rYlleKR12fdg2oCUoPWPiiiSAZqiVMhoqOBw4opV6zVorCQ4WspPt3MT2PkFwwmgCPszzwY4eg.DJcmy0NHyMSDFDUt")}`;
    return `${__rmT("BJgCyT")}${index + 1}${__rmT("qGyf7aop")}${face.longText ? __rmT("KQzlHpKi.h9Lsb4cqLcxZ6C5s1rksuuU") : __rmT("v65Gjk")}${__rmT("Y0nU5E8IWZY")}${compactLockItems(face.combo.themes, 'theme')}${__rmT("o7490LtKGDeKmsdPt84_Lk")}${compactLockItems(face.combo.formats, 'presentation')}${__rmT("PDPy84.07gKStf")}${compactLockItems(face.combo.texts, 'text')}${__rmT("jzk")}${face.longText ? __rmT("taXIoNbIX1atd5wQLIAugablMCtILKpO8dvMnrleu60GKKrh.hT7aYW_dxlJv92UUj6MAwvCAK1xWrKS2__nmTXNW4HIyZDRA1MPM.f6nZcAwGiyLEw3SfNRznPMC5rCkMhl6aYkhxMkiYBYdyOd_cHWx4UvbDJ3rq_dt8QiPzOMOeIYGwp8ND0igd47SSMAYrBelnP8YzdlcfOxO_0NypDx9qtYD7VcqHNeCIE7is5mqRC4qQWIPscTIBxCzFOJw81Hxgh5QpkC0c8zoWQAY8WVRBY1X1cqJWbmzqQG5Hfi6k") : __rmT("YLvfJcP58_igd8.1GP3IxF78e3FXMnhDIPd6KBfnnTQRS9bzwMUGLOpg6dlPM4xojv8H.t.GY3Y")}${__rmT("eCHZ.yKZauIEvabvAaahNj_AvA3P1xs2")}`;
}
function buildTextAwarePrompt({ faceContexts, settings, directive, memoryMaterial, generationType, followTagIsolationText, appearanceReferenceText, visualHistoryRule, constructionRules = null, hueFamilies = [] }) {
    const independent = generationType === 'independent';
    const multiface = faceContexts.length > 1;
    const htmlNumbers = faceContexts.flatMap((face, index) => face.textPresentation ? [] : [index + 1]);
    const chunks = [__rmT("GRYgS01FSojlhsFKmKDQ8v_x"), independent ? visibleChineseHardLock() : ''];
    if (faceContexts.some(face => face.hasExternal))
        chunks.push(__rmT("ZF44dESsWXihW7ZJxNSf5Na0V1pDwzGEHIXd0rQrLyiVLcpu1e2AmN3JnOkk0yNvItBz5.iHQp66zjMyAudxP1eEq.JMyjKRpE0_QymVLAhOjLvFhVMtreSmTsP1VYeG12o7jsTdVjSk2fZrEsRmupXHOW.V81CM81.AamhRjFYPVoWCMxjVmBFztnzCTVBxVelE6VIlOVURjci.F_zCwhvA0UyIEW9Cup3CzDbQWPPjCSbAT3QriYAq1Si_mZq8nmE"));
    chunks.push(__rmT("YsRLvH2DwyZJrPrTbolOHI1UdLkBynDcMR7VKzmghQ6A9Mjk61AX.X9LMJydrv_UOI7ihSqmvH50FUG3JbC3sBJNNH3E.Xqikel8nq4eoiotQOCmSXUhxGcKncgqdku8dbmC7PBl0YgoOr3G1b_8SrmACjLPwr1hO0ivokbBqkjD99QG4Y1OU0AaCXtNBodZWa2f6UHLFy7AokyuuJscQ3QhURYW1TrIH28"));
    const appendFaces = () => {
        faceContexts.forEach((face, index) => {
            const mode = face.combo.samplingMode || settings.samplingMode || 'classic';
            const local = [`${__rmT("6Pto9cc6")}${index + 1}${__rmT("qGyf7vrp")}${face.textPresentation ? __rmT("v65Gjk") : 'HTML'}${__rmT(".Zc65Ovwt6hawQIP2.KU4cndcTjeNLfgcpZ5lv4pj22VPTQy")}${index + 1}${__rmT("2.WezT")}`, `${__rmT("zOobc0uilQxStf")}${samplingModeLabel(face.combo, settings)}`];
            if (face.atmosphereFaces)
                local.push(atmosphereMenuInstruction(face.combo, face.atmosphereFaces));
            else
                local.push(`${__rmT("VPkSxTAbRXilWyTq")}${mode === 'format_only' ? __rmT("WVh2W9SdYpzkU7shxpRUWUFhryC.0jiEqsuAp7N1gucauzl.JKw8FoX9AvYLKxf.DGCy3HujepT5CNGiKjFPla.ZqQKfZOO7GMzmu8bJCYNTVD4KlevgFc.taHNZNa7m5UUB3l9Bb0DezOU3NWt.aU_Uv8E.S_I1O9V7AX69I5LGpu6fUKTqIlyOw9XoNZsXmEfGtHsKO220PvLY1XXqKBpKPdIcHwi54b6u13Tw1WAlbFHkNdq_zjSQOEp") : face.selectedThemes}`, `${__rmT("oJDJgzT7rldlWyTq")}${face.selectedFormats}`);
            if (!face.textPresentation && hueFamilyInstruction(hueFamilies[index]))
                local.push(hueFamilyInstruction(hueFamilies[index]));
            if (face.combo.texts?.length)
                local.push(`${__rmT("r6I5wIPo5SQMnnuD0..an7lx")}${face.selectedTexts}`);
            if (face.combo.worldBookExcerpt)
                local.push(`${__rmT("klsAxcO5uVvPV1zdBlc4uG4O_9jDrk")}${face.combo.worldBookTitle || __rmT("cyZtO1kw")}${__rmT("s6tGgq36")}${face.combo.worldBookExcerpt}`);
            if (face.textPresentation) {
                if (face.combo?.pureOrder)
                    local.push(__rmT("_NNFtZEk8MYgy9x7FSD6fD8cNSPGUM9vBxD2HZ0ZUMWGO7FZjqB_LEhTzBG"));
                local.push(__rmT("SpVqnO7iYu5CRfTi6wRSqW.hB9N11aNacbMC_M6mWyj6CbxhYuUl91UXivxgR9GIBOcw5zD40PjJ5Wnw3CQi8fOhYWKUzYDwQK_LRf"), face.combo?.pureOrder ? pureOrderFaceLock(face, index) : textFaceLock(face, index));
                chunks.push(`${__rmT("XmDKPY0_xGl3nDfpLMxR6CoN7ouiDF6Jjf.FpoTZMDT0elpahbGugpEfO.B9lfkY")}${index + 1}">\n${local.filter(Boolean).join('\n\n')}${__rmT("hfYqTYTQXN7bX6TzLCNNecbmfQq_xSlP")}`);
                return;
            }
            if (!independent)
                local.push(`${__rmT("cZHraSKExHOStf")}${compactComboExecutionContract(face.combo, face.atmosphereFaces)}`);
            chunks.push(`${__rmT("u6Rak5T9xgte4SiWOONBOgvz8OMMo.yzCKQxKyAUneL0jebpFGChZCPG9ehY07raR2cA7h")}${index + 1}">\n${local.filter(Boolean).join('\n\n')}${__rmT("VNtynMfBcwqOb_JO0atmtFgiUkEkhLR7PhikDf")}`);
        });
    };
    if (constructionRules)
        appendFaces();
    chunks.push(sharedMemoryMaterialRule(memoryMaterial));
    if (independent)
        chunks.push(faceBehaviorRuleBlock(settings, faceContexts));
    chunks.push(stateBarIsolationRule());
    if (constructionRules) {
        const base = sharedTextAwareBaseRules(faceContexts, settings, directive, independent, true);
        chunks.push(base.construction, constructionRules.html.construction, base.finish, constructionRules.palette.design);
        if (appearanceReferenceText && htmlNumbers.length)
            chunks.push(`${__rmT("fMkBSzmEB1DeTIK9Ii7D9IsoExtZuzc19A4ljt6NSCrtnh")}${htmlNumbers.join(__rmT("jvk"))}${__rmT("ccFS8UuTeTdm9pCOQg8ieQOlt5oiav1jogItGDuMfY7lPCWDp4rXDYr7V2JJavLV8Z8pIIK424DnKqSut4wgNsS27VWpLkOyORNpD9BEPBj8mHqplM6QyQ04Fq6HigujjkEOhYh_GOmQ.DmFWwNh86IeH2Ll2aUlW4e6_R1b8RVFIPmXzEuBq4zowpj9Kqg6Codn2MD9smA")}${appearanceReferenceText}`);
        chunks.push(constructionRules.html.guidance, constructionRules.html.modes, constructionRules.interaction, constructionRules.palette.cooldown, sharedSpecialFormatRules(faceContexts, settings));
        if (visualHistoryRule)
            chunks.push(visualHistoryRule);
    }
    else {
        chunks.push(sharedHtmlModeRules(faceContexts, false, !independent));
        chunks.push(sharedTextAwareBaseRules(faceContexts, settings, directive, independent));
        chunks.push(sharedSpecialFormatRules(faceContexts, settings));
        if (visualHistoryRule)
            chunks.push(visualHistoryRule);
        appendFaces();
    }
    if (multiface && htmlNumbers.length) {
        chunks.push(`${__rmT("_W38.fqeMEYavA7EvG4pwocUfttcf3zNgns8AZnrJs_gpSH7fXJ9s8AE.rvYWfiUwrE")}${htmlNumbers.join(__rmT("jvk"))}${__rmT("FcJEdVJnpAM59kRnJ.bobKLM96SYiUeG.sau9aVG2uMFdWIOSEauJU13pjVz0Q4InzHGeWIdxTDuVlKySOgBiUWoY0a_7.U0dgBLZpgm5mWO8HjsU2BVmwKEN6nR_bJnizEobQq_u7MDjON8HcpZ4.OocfBpn8aMkYzF0FcK5XNno_jlCf1SlGH3Q2KvTjroCJ7NVpWro6lhvDpB_CVd2dNKCFlNxFbWovTO8UF_jrTYHkJxMYiUdx1lS9c4LN3RwQpcggiYIIJE5TXTMGEnq8uy0cOqm6AEtN0ybZFCCBXUu0dVnSSFO9Az5dSTaSgNaYGImLZkWxwbpytQgrGmYoFa.sjLcwWF4Xcs70BKjRwKIQBMxefoFg8QXPZAb8vKyx1gEzZLj8qjJQyu6_2AOXrRvYwifBB6H5iDJHxANUqXVbwnInFjum_gdAkK4B01lpx7LKY9cyhvG16FQX1bjXFUQYfL7aFpU16hEEVMm2flM6yuUOOI69ZVTcEYxR8.8xOjLE14t6ei3QLZtwU32dSVQGcmd30ftgi9YlRe6eknTBgovDsxacXRao3LzFmQYi1_kBz4QFmeh4rUlZFdNSEwIhI_S.ObPlYHONgBBwaxS..e72aDE0am9yx96rkvHfDt2oNSUj8Hyf")}`);
        chunks.push(buildBatchInteractionDiversityRule(faceContexts.map(face => face.combo), settings));
    }
    if (!constructionRules && appearanceReferenceText && htmlNumbers.length)
        chunks.push(`${__rmT("fMkBSzmEB1DeTIK9Ii7D9IsoExtZuzc19A4ljt6NSCrtnh")}${htmlNumbers.join(__rmT("jvk"))}${__rmT("ccFS8UuTeTdm9pCOQg8ieQOlt5oiav1jogItGDuMfY7lPCWDp4rXDYr7V2JJavLV8Z8pIIK424DnKqSut4wgNsS27VWpLkOyORNpD9BEPBj8mHqplM6QyQ04Fq6HigujjkEOhYh_GOmQ.DmFWwNh86IeH2Ll2aUlW4e6_R1b8RVFIPmXzEuBq4zowpj9Kqg6Codn2MD9smA")}${appearanceReferenceText}`);
    if (constructionRules)
        chunks.push(constructionRules.diversity);
    chunks.push(htmlSafetyCore(htmlNumbers), readingTypographyRule(), followTagIsolationText, multiface ? multiFaceOutputProtocol(faceContexts.length, independent, settings.hardStartup !== false) : coreOutputProtocol(independent, settings.hardStartup !== false));
    if (faceContexts.some(face => face.longText))
        chunks.push(__rmT("svb1uI92ob9jOl9DLiZb0MP4ZKxzcMxEWiM3q2c0BjG88FibBC1GRH2grQ7dTJkZX9rt8sMecPzoEhYq8gU7kT80g0zYs7IfiHkhjSTrEiDP1Jhbp8QtGXS3Wu8bdj7m5IajaLN4YgCNik3Cz0IIw1MfeC9V2pHU53zT8Bplr6kkBdwqQ.DgT6WBG6_baoWpE4TkIpWXUI49cxsyIn0Zw_zw42k.vZjDWHoV.yYg1V0gSA_6ztzj7XRTdHqjO2wj6hyLNvqpG50qlNGl77jyr2Wl5.CC0k"));
    chunks.push(__rmT("GHJQau.QlFtD1_4Ofk3u92Wwfus"));
    return chunks.filter(Boolean).join('\n\n').trim();
}
function buildTextAwareExecutionLock(faceContexts, settings, directive, executionPolicy = '') {
    const count = faceContexts.length;
    const htmlNumbers = faceContexts.flatMap((face, index) => !face.textPresentation && !face.combo?.pureOrder && !directive?.pureOrder ? [index + 1] : []);
    const locks = faceContexts.map((face, index) => (face.combo?.pureOrder || directive?.pureOrder) ? pureOrderFaceLock(face, index)
        : face.textPresentation ? textFaceLock(face, index)
            : `${__rmT("BJgCyT")}${index + 1}${__rmT("tMyfaJEBv95UQ.lASaygtsvhs1MtBNuRPNNADf")}${buildIndependentFinalExecutionLock({ combo: face.combo, settings, directive, candidateFaces: face.atmosphereFaces, includeExecutionOrder: false, includeCommonRules: false, includeBuiltinImage: false })
                .replace(__rmR("c3JAf_WXDghr6NpT7CPehyHHjc7e1CSoMYZllqqpu22ZPxFy", "g"), '')
                .replace(__rmT("gEpAWngRhGQ.JNmRdWCG53J.frQK.mzGshIF3Ci_ye33CPiP3VEijKlyMGKAKjRvre863PGkHSE7Q400mkpFrh"), __rmT("3d5g5iwALoN6wyxlONagP4gTJaR2XiF6Zos22ziQPH6LZWgfSuFDOeSpT6zv5ZjFG7V4W4L7IOw00Vhy8B.rdOJJWAT")).trim()}`);
    return [__rmT("oHsEgKSPp08nYaCrfy2jhHKhEUyC5rNfISmh8BMdW7Pljtr5F.eE7zH1ef0TzxR0Vxhtoaj77U1ROw1I7alQjUYGqbfupfClECRt2UgtZkM_tD0IZPxgUgjfe9WcYOXGybLBhQ8SDMT"), `${__rmT("ZTGsCcINz4OC6ORSgPD")}${count}${__rmT("ohwg5WZpEv_cLeJdGMCNOxdXyTfbPnG96HVeIOPL0.IKrXLgPdpWFvj05SoqWrJlEquizl.FNIkodJCLUDZP99KSWAT")}`, htmlNumbers.length ? `${__rmT("nLovtZwDnuuUtca68Eragdlykf3INaNf08tjAviQ9ETGA2E4OgGlM9TNJ6G")}${htmlNumbers.join(__rmT("jvk"))}${__rmT("UqYPpO66QnxvTh")}${presentationExecutionOrderRule()}` : '',
        htmlNumbers.length ? `${__rmT("vou31H7kBLbzVNNkMbBRjLmDEJ0CJk")}${htmlNumbers.join(__rmT("jvk"))}${__rmT("wRYKnprSWjIvkSEwL6Fan7lx")}${sharedHtmlExecutionReminder(settings, directive)}` : '',
        ...locks, executionPolicy, htmlNumbers.length ? builtinImageFrameRule(settings) : '', count > 1 ? `${__rmT("GY9u_vajDsUajjk5.eUg_l.k_pht1GWo5DtMAAJQx_xeA2C4xSqqUJIOJ2G")}${count}${__rmT("LKwii6vrDOSAs0jOZMmHqiABiLs9ODiluiCw3OwJJzsdM.xBbAx2XxMqIe0UfR4XV4P.Klqj4wEZuaHwdpZEmkWir64sxtkosaaJj.DFUAr.ho_z")}` : __rmT("kQ57YDJA1N3vCBT3r8cviLqqg3i0okb8iJ11DjdC2a6_T8swJLBiFiE.GM1dNgzWVxkqmvzGYDeBXdUpfdCJtFRs6PFXzY8p6._LRf"), __rmT("pJOFYgVkrYU5K63Ww5bbof5xWY2MJk")].filter(Boolean).join('\n');
}
function buildPrompt({ combo, settings, selectedThemes, selectedFormats, visualSceneryMode, tarotRulesText, touchTheaterRulesText, directive, memoryMaterial, activeFeedback, generationType = 'normal', followTagIsolationText = '', faceContexts = null, externalReferences = false, appearanceReferenceText = '', visualHistoryRule = '', constructionRules = null, hueFamilies = [] }) {
    const chunks = [];
    const multiface = Array.isArray(faceContexts) && faceContexts.length > 1;
    const independent = generationType === 'independent';
    const mode = combo?.samplingMode || settings?.samplingMode || 'classic';
    if ((combo?.pureOrder === true || directive?.pureOrder === true) && !multiface) {
        chunks.push(__rmT("GRYgS01FSojlhsFKmKDQ8v_x"));
        chunks.push(independent ? visibleChineseHardLock() : '', userDirectivePriorityRule(directive), __rmT("Ei1xvlwlrV29nopqA0WmuPUadi3Ryy_.uv_EwLop_3xzbJy8O5Z4LooUKXjyb1NBWX84XFNyafJ9irsS90QVyuD0BKEiQqG6gWZ1OZmCao7bd3LyJIySinQB7hcSiNHM4gkJ_9rGRzpcwsXnGls5nLd_VpWJSfLpBXDAikOej06Gkf"), htmlSafetyCore(), readingTypographyRule(), stateBarIsolationRule(), independent ? '' : builtinImageFrameRule(settings), followTagIsolationText, coreOutputProtocol(independent, settings.hardStartup !== false), __rmT("GHJQau.QlFtD1_4Ofk3u92Wwfus"));
        return chunks.filter(Boolean).join('\n\n').trim();
    }
    chunks.push(__rmT("GRYgS01FSojlhsFKmKDQ8v_x"));
    if (independent)
        chunks.push(visibleChineseHardLock());
    if (externalReferences)
        chunks.push(EXTERNAL_REFERENCE_RULE);
    if (multiface) {
        chunks.push(multiFaceSelectionRule(faceContexts, hueFamilies));
    }
    else if (faceContexts?.[0]?.atmosphereFaces) {
        chunks.push(atmosphereMenuInstruction(combo, faceContexts[0].atmosphereFaces));
    }
    else if (mode === 'format_only') {
        chunks.push(String.raw(__rmTpl(["XbNYgDo6DjPhDPPDEs1f9SEmShiXfR3tuTqI644W0N_v1vRIQrDYqYA7Yv6LucaS1TgSiGkxfZyVmy0PSOlSMrAmo9zf9LF3XZ.CZnuXjJUwhuGcB_aZCpD6Wj8lOj6_ia0G5EFiDUhuWKTjLHv2gLlXXZ5_Ag4oKy.dINfbM0IVLZCdvJbbAX_eiDLyhf6YGoud2.2WKomZz85C4ltW4xkJkEFDo_TDGxXAR4_Pwh47b_kohqwAINfRL3.6N30y3FDviWUMsF7Tp56NgMzk8nDgaugToYTn_SwA8sXU7XzJ_ExDzEawMof4lzOo8j8BRWP8h6eQd2BS.dnRetBySA2_56ugAaWLuqLGkq0tmjosziQe62bN5rj._XB3Nk", ""], ["XbNYgDo6DjPhDPPDEs1f9SEmShiXfR3tuTqI644W0N_v1vRIQrDYqYA7Yv6LucaS1TgSiGkxfZyVmy0PSOlSMrAmo9zf9LF3XZ.CZnuXjJUwhuGcB_aZCpD6Wj8lOj6_ia0G5EFiDUhuWKTjLHv2gLlXXZ5_Ag4oKy.dINfbM0IVLZCdvJbbAX_eiDLyhf6YGoud2.2WKomZz85C4ltW4xkJkEFDo_TDGxXAR4_Pwh47b_kohqwAINfRL3.6N30y3FDviWUMsF7Tp56NgMzk8nDgaugToYTn_SwA8sXU7XzJ_ExDzEawMof4lzOo8j8BRWP8h6eQd2BS.dnRetBySA2_56ugAaWLuqLGkq0tmjosziQe62bN5rj._XB3Nk", ""]), selectedFormats));
    }
    else {
        chunks.push(String.raw(__rmTpl(["U.e5wks.NIgTYY3VryVLE0Cx", "U.e5wks.60MXdSeXRsRLEOlx", "UQJEaoRm4YbIcQGnSh9XdiNX3us", ""], ["U.e5wks.NIgTYY3VryVLE0Cx", "U.e5wks.60MXdSeXRsRLEOlx", "UQJEaoRm4YbIcQGnSh9XdiNX3us", ""]), samplingModeLabel(combo, settings), selectedThemes, selectedFormats));
    }
    if (!multiface && hueFamilyInstruction(hueFamilies[0]))
        chunks.push(`${__rmT("BgMdPk")}${hueFamilyInstruction(hueFamilies[0])}`);
    chunks.push(userDirectivePriorityRule(activeUserDirective(settings, directive)));
    chunks.push(sharedMemoryMaterialRule(memoryMaterial));
    chunks.push(compactCreativeRule(!!settings.creativeExpansionMode, mode === 'format_only'));
    if (independent)
        chunks.push(faceBehaviorRuleBlock(settings, faceContexts || [{ combo }]));
    if (settings?.visualPromptEditingEnabled) {
        chunks.push(presentationEmbodimentRule());
    }
    else {
        chunks.push(legacyPresentationEmbodimentRule(!independent));
    }
    if (constructionRules)
        chunks.push(constructionRules.html.construction);
    chunks.push(globalCompletionFloorRule(false, settings));
    if (constructionRules)
        chunks.push(constructionRules.palette.design);
    if (settings?.visualPromptEditingEnabled)
        chunks.push(editableVisualPromptRule(settings));
    if (appearanceReferenceText)
        chunks.push(`${__rmT("4b6mKSfIS73wwNJdUnn_P1dBtt4osoDHvMFwWoTYtf1Zmlh1UXvAbhLKbGnHGM6qg2JdpzUBOVo1tc_DQ7NHg.AGoebEjBIi1jA4W9Vf_ejFdilELVyc0YsOdK_vzwRo0EPtqWvvs.0rERWauW_PlhJEJ2Kq5Ux4cduP93jK9tqt7L1xgZCexq8YUPW_c7R0La_VWiPqAPtO_rJt_RN4jVm.TIkZ57LERmeduxGKoXDCZA2UX6mdgMS4kjzYf6ij8TKilbj1PonCooEsejHLs.0oj.4NAZl7qkiOhSRY6pd_ZIEjrJ5Ywefvh.DztNOnNyAXIeXanSp84jWKptie.8JGA7IBfKsTQ9I.2eD_l0Y")}${appearanceReferenceText}`);
    if (constructionRules)
        chunks.push(constructionRules.html.guidance, constructionRules.html.modes, constructionRules.interaction, constructionRules.palette.cooldown);
    else
        chunks.push(sharedHtmlModeRules(faceContexts || [{ combo, visualSceneryMode }], false, !independent));
    chunks.push(visualHistoryRule);
    if (multiface)
        chunks.push(buildBatchInteractionDiversityRule(faceContexts.map(face => face.combo), settings));
    if (constructionRules)
        chunks.push(constructionRules.diversity);
    chunks.push(visualColorTruthRule());
    chunks.push(stateBarIsolationRule());
    chunks.push(sharedSpecialFormatRules(faceContexts || [{ combo, tarotRulesText, touchTheaterRulesText }], settings));
    if (!independent) {
        if (multiface)
            faceContexts.forEach((face, index) => chunks.push(`${__rmT("BJgCyT")}${index + 1}${__rmT("7aATSMrJmnBEFH3hVpA")}${compactComboExecutionContract(face.combo, face.atmosphereFaces)}`));
        else
            chunks.push(`${__rmT("cZHraSKExHOStf")}${compactComboExecutionContract(combo, faceContexts?.[0]?.atmosphereFaces)}`);
    }
    chunks.push(htmlSafetyCore(), readingTypographyRule());
    if (!independent)
        chunks.push(builtinImageFrameRule(settings));
    const visualPreferenceLock = compactVisualPreferenceExecutionLock(settings);
    if (visualPreferenceLock && String(generationType || 'normal') !== 'independent') {
        chunks.push(`${__rmT("FoTQp7Q4J5gTIAe3WsWQ8dbS9Km9PoP1ws2O0Rc1")}${visualPreferenceLock}`);
    }
    if (followTagIsolationText)
        chunks.push(followTagIsolationText);
    chunks.push(multiface ? multiFaceOutputProtocol(faceContexts.length, independent, settings.hardStartup !== false) : coreOutputProtocol(independent, settings.hardStartup !== false));
    chunks.push(__rmT("GHJQau.QlFtD1_4Ofk3u92Wwfus"));
    return chunks.filter(Boolean).join('\n\n').trim();
}
const PROMPT_PLANS = new WeakMap();
const PROMPT_SETTING_KEYS = Object.freeze([
    'enabled', 'autoRabbitMirrorInjection', 'mode', 'rabbitMirrorFaceCount', 'rawPolicy',
    'rabbitMirrorPresentationModes', 'writingStyle',
    'samplingMode', 'hardStartup', 'creativeExpansionMode', 'debug', 'avoidRepeat',
    'forceVisualScenery', 'visualSceneryCombination', 'darkVisualMode', 'visualToneMode', 'postGenerationRecolor', 'visualDesignMode', 'userDirectivePriority',
    'presentationWorldviewLock', 'visualPromptEditingEnabled', 'visualPrompt',
    'visualExtraPrompt', 'visualAvoidPrompt', 'generationSource',
    'appearanceReferenceEnabled', 'appearanceReferenceRevision', 'builtinImageEnabled', 'imagePromptFormat',
    'behaviorRuleMode', 'behaviorRuleText',
    'followTagIsolationEnabled', 'independentContextExcludedTags',
    'memoryScanEnabled', 'memoryProviderIds', 'memoryMaxChars', 'memoryWorldBookEnabled', 'memoryWorldBookId',
    'materialTextureEnabled',
    'webFontsEnabled',
]);
function copyPromptPlanValue(value, withoutRaw = false) {
    if (value == null)
        return value;
    return JSON.parse(JSON.stringify(value, withoutRaw
        ? (key, item) => key === 'raw' || key === 'rawContent' ? undefined : item
        : undefined));
}
const NATIVE_BUTTON_ROW = __rmR("5FH_p5AWQVreLgMhfakI.pCm3E99BbLbkFfYZKyaZXVWUQ0xVhxc1B6ZCD60QFBbMcb60HAL9oSmFribrBVN1NOMof.apwGrGtRJqwEzEvGFFJ9S9UgafkXEMsVhVUjhnPr7laSK5QdSoyA2Wp4aLDFwdn_PFBdySdpNp5vdBIzebr6RniZOTnHs1KsVku7qAEN13v69YktUm7RDCj5fpctMNk9_m61AVE8JG.KwiXReCPiKngAkC7M9.wvk5o_T", "");
function hasNativeButtonRow(combo) {
    return (combo?.formats || []).some(item => ['1', '6'].includes(String(item?.group || '')) || NATIVE_BUTTON_ROW.test(String(item?.title || '')));
}
const TEMPLATE_MECHANISMS = new Set(['flip', 'expand', 'page', 'toggle', 'pick', 'pager', 'hold', 'popover', 'peek', 'spoiler']);
const RICH_MECHANISMS = new Set(['drag', 'adjust', 'reveal', 'follow', 'reorder', 'accumulate', 'draw', 'motion', 'effect', 'view', 'scroll', 'input',
    'connect', 'turn', 'sequence']);
function recentHtmlFaces(limit = 3) {
    return getRecentDiversityHistory(limit).filter(item => !isTextPresentation(item)).slice(-limit);
}
function recentFlipExpandRotation() {
    try {
        return recentHtmlFaces(3).filter(item => {
            const used = observedMechanismsFor(item);
            return used.some(name => TEMPLATE_MECHANISMS.has(name)) && !used.some(name => RICH_MECHANISMS.has(name));
        }).length >= 2;
    }
    catch {
        return false;
    }
}
const SLIDE_MECHANISMS = new Set(['adjust', 'drag', 'turn']);
function recentSlideDragRotation() {
    try {
        return recentHtmlFaces(3).filter(item => observedMechanismsFor(item).some(name => SLIDE_MECHANISMS.has(name))).length >= 2;
    }
    catch {
        return false;
    }
}
const TAB_MECHANISMS = new Set(['pick', 'pager', 'page']);
function recentTabRowRotation() {
    try {
        return recentHtmlFaces(3).filter(item => observedMechanismsFor(item).some(name => TAB_MECHANISMS.has(name))).length >= 2;
    }
    catch {
        return false;
    }
}
function recentSwitchPopupRotation() {
    try {
        const recent = recentHtmlFaces(2);
        return recent.length >= 2 && recent.every(item => observedMechanismsFor(item).some(name => name === 'toggle' || name === 'popover'));
    }
    catch {
        return false;
    }
}
function recentTextRevealRotation() {
    try {
        const rounds = new Set();
        getRecentDiversityHistory(3).forEach((item, index) => {
            if (!isTextPresentation(item) && observedOperationFamiliesFor(item).some(family => family === 'text_panel_switch' || family === 'text_disclosure_stack')) {
                rounds.add(item?.diversityRound || item?.batchId || `legacy:${index}`);
            }
        });
        return rounds.size >= 2;
    }
    catch {
        return false;
    }
}
function independentHistoryNotes(source, { includePrevious = false } = {}) {
    if (!source || typeof source !== 'object')
        return { previousVersion: '', backfillRecords: [] };
    let previousVersion = '';
    if (includePrevious && (source.previousSkeleton || source.previousPalette)) {
        const layout = source.previousSkeleton ? shortHistorySkeleton({ visualSkeleton: source.previousSkeleton }) : '';
        const hues = source.previousPalette ? describeHueFamilies(recentPaletteHueFamilies([{ presentationMode: 'html', paletteFingerprint: source.previousPalette }])) : [];
        const parts = [layout && layout !== __rmT("cyfALcBH") ? `${__rmT("u4lZfla2tTcDTYV3kGD")}${layout}${__rmT("Yvk")}` : '', hues.length ? `${__rmT("VXNNADHq7iAYgIdJYn_RjLjTE6jDrk")}${hues.join(__rmT("jvk"))}${__rmT("Yvk")}` : ''].filter(Boolean);
        if (parts.length)
            previousVersion = `${__rmT("tknhItiEgvGtlS3xMldbULG0Cur.89Z8UB0lTPYc")}${parts.join(__rmT("Yis"))}${__rmT("_jjSereJ9AJPTaviFysThisZm0PJFC4xnDDTQtn3cTTc9jsc.1N9HGcIOgRtMSiWTpgX3bg0ROp3DsA9hbgStRyKRbPpIlW8OOSXkBjwO1fypCvP927mrGUt")}`;
    }
    const backfillRecords = Array.isArray(source.recent)
        ? source.recent.filter(item => item && (item.visualSkeleton || item.paletteFingerprint)).map(item => ({ presentationMode: 'html', visualSkeleton: String(item.visualSkeleton || ''), paletteFingerprint: item.paletteFingerprint || null }))
        : [];
    return { previousVersion, backfillRecords };
}
function continuedCombo(combo, format) {
    return { ...combo, formats: [format], formatIds: [format.id], formatGroups: [format.group].filter(Boolean) };
}
function createPromptPlan(selections, args, batchPlan = null, inactive = false) {
    const sendingCombo = combo => withoutInteractionRecipe(usesModelOriginalColors(args.settings) ? withoutPaletteRecipe(combo) : combo);
    const flipRotation = !inactive && recentFlipExpandRotation();
    const followPlan = String(args?.generationType || 'normal') !== 'independent';
    const recentPicks = count => followPlan ? recentFollowPicks(count) : recentDesignPicks(count);
    let recentWholeSwitch = false;
    try {
        recentWholeSwitch = !inactive && recentPicks(2).includes(2);
    }
    catch {
        recentWholeSwitch = false;
    }
    let repeatedPick = null;
    try {
        const picks = inactive ? [] : recentPicks(2);
        if (picks.length >= 2 && picks[0] === picks[1])
            repeatedPick = picks[0];
    }
    catch {
        repeatedPick = null;
    }
    const avoidPicks = [...new Set([...(recentWholeSwitch ? [2] : []), ...(repeatedPick ? [repeatedPick] : [])])];
    const slideRotation = !inactive && !flipRotation && recentSlideDragRotation();
    const tabRotation = !inactive && !flipRotation && recentTabRowRotation();
    const switchPopupRotation = !inactive && recentSwitchPopupRotation();
    const sendingSelections = selections.map(selection => {
        const { designCandidatePick: pinnedPick, driverOffer: pinnedOffer, usageOffer: pinnedUsage, continuation: pinnedContinuation, ...rest } = selection;
        const baseEligible = !inactive && !selection.disabled && selection.combo && !isTextPresentation(selection.combo) && !selection.combo.pureOrder;
        const menuFace = Array.isArray(selection.combo?.atmosphereMenu) && selection.combo.atmosphereMenu.length > 1;
        const continuation = baseEligible && !menuFace && !args?.noContinuation && !selection.combo.customDirective && !selection.combo.userPicked
            ? normalizeContinuation(pinnedContinuation) || drawContinuation(id => FORMAT_ITEMS.has(id)) : null;
        const continuedFormat = continuation ? FORMAT_ITEMS.get(continuation.formatId) : null;
        const combo = continuedFormat ? sendingCombo(continuedCombo(selection.combo, continuedFormat)) : sendingCombo(selection.combo);
        const eligible = !inactive && !selection.disabled && combo && !isTextPresentation(combo) && !combo.pureOrder;
        const usageOffer = eligible && !menuFace ? normalizeUsageOffer(pinnedUsage) || drawUsageOffer(combo, { avoidFlip: flipRotation, avoidSlide: slideRotation }) : null;
        return { ...rest, combo, ...(eligible ? { designCandidatePick: designCandidatePick(pinnedPick) || ((PICK_ROTATION_184 || followPlan)
                    ? drawDesignCandidate({ slots: flipRotation || recentTextRevealRotation() ? 2 : 3, avoid: avoidPicks })
                    : drawDesignCandidate({ slots: flipRotation ? 1 : recentTextRevealRotation() || !hasNativeButtonRow(combo) ? 2 : 3, avoid: recentWholeSwitch ? [2] : [] })),
                driverOffer: normalizeDriverOffer(pinnedOffer) || drawDriverOffer({ avoidSlide: slideRotation, avoidFlip: flipRotation, avoidTabs: tabRotation, avoidSwitchPopup: switchPopupRotation, usages: usageOffer?.usages || [], related: menuFace ? [] : relatedUsagesForCombo(combo),
                    nativeButtons: menuFace || hasNativeButtonRow(combo),
                    signature: (sig => sig && usageOffer?.usages?.includes(sig) ? sig : '')(menuFace ? '' : signatureUsageForCombo(combo)) }),
                usageOffer,
                ...(continuedFormat ? { continuation } : {}) } : {}) };
    });
    if (followPlan && !inactive) {
        try {
            rememberFollowPicks(sendingSelections.filter((selection, index) => selection.designCandidatePick && !designCandidatePick(selections[index]?.designCandidatePick))
                .map(selection => selection.designCandidatePick));
        }
        catch { }
    }
    const snapshot = freezeDeep(copyPromptPlanValue(sendingSelections));
    const privateArgs = freezeDeep(copyPromptPlanValue(args));
    const sendingBatch = batchPlan
        ? { ...batchPlan, faces: batchPlan.faces.map((face, index) => {
                const continuedFormat = sendingSelections[index]?.continuation && !face.combo?.atmosphereMenu
                    ? FORMAT_ITEMS.get(sendingSelections[index].continuation.formatId) : null;
                return { ...face, combo: sendingCombo(continuedFormat ? continuedCombo(face.combo, continuedFormat) : face.combo) };
            }) } : batchPlan;
    const privateBatch = sendingBatch ? freezeDeep(copyPromptPlanValue(sendingBatch)) : null;
    const selectedExternalIds = [...new Set(snapshot.flatMap(selection => [
            ...(selection?.combo?.themes || []), ...(selection?.combo?.formats || []), ...(selection?.combo?.texts || []),
            ...(selection?.combo?.atmosphereMenu || []).flatMap(ticket => [...(ticket.themeIds || []), ...(ticket.formatIds || [])].map(id => ({ id }))),
        ]).filter(isExternalItem).map(item => item.id))];
    const plan = freezeDeep({
        selections: copyPromptPlanValue(snapshot, true),
        args: copyPromptPlanValue(privateArgs, true),
        selectedExternalIds,
        appearanceReference: { enabled: !inactive && !snapshot[0]?.disabled && privateArgs.settings?.appearanceReferenceEnabled === true, revision: String(privateArgs.settings?.appearanceReferenceRevision || '') },
        memoryWorldBook: { enabled: !inactive && !snapshot[0]?.disabled && privateArgs.settings?.memoryScanEnabled === true
                && ((privateArgs.settings?.memoryWorldBookEnabled === true && !!String(privateArgs.settings?.memoryWorldBookId || '').trim())
                    || (Array.isArray(privateArgs.settings?.memoryProviderIds) && privateArgs.settings.memoryProviderIds.includes('global:qqj_v3_public_bridge_v1')))
                && snapshot.some(selection => hasSharedMemoryTheme(selection.combo)) },
        batchPlan: copyPromptPlanValue(privateBatch, true),
        inactive,
    });
    PROMPT_PLANS.set(plan, { selections: snapshot, args: privateArgs, batchPlan: privateBatch, inactive });
    return plan;
}
function presentationOverrideSettings(settings, resay) {
    const form = resay?.presentationOverride;
    if (form !== 'html' && form !== 'longtext')
        return settings;
    const modes = Array.isArray(settings?.rabbitMirrorPresentationModes) ? settings.rabbitMirrorPresentationModes.slice() : [];
    const collapsed = Number(settings?.rabbitMirrorFaceCount) === 1 && modes.length <= 1;
    const target = collapsed ? 0 : (Number.isSafeInteger(resay.faceIndex) ? resay.faceIndex : 0);
    while (modes.length <= target)
        modes.push('auto');
    modes[target] = form;
    return { ...settings, rabbitMirrorPresentationModes: modes };
}
function stampPresentationOverride(selection, form) {
    if ((form !== 'html' && form !== 'longtext') || !selection?.combo)
        return selection;
    const longText = form === 'longtext';
    selection.combo.requestedPresentationMode = longText ? 'longtext' : 'html';
    selection.combo.presentationMode = longText ? 'text' : 'html';
    if (!longText)
        selection.combo.blankLongText = false;
    return selection;
}
export function planRabbitMirrorPromptDetails(settings, generationType = 'normal', activeFeedback = null, generationScopeKey = '', generationContext = null) {
    settings = { ...settings, avoidRepeat: true };
    const renderSettings = Object.fromEntries(PROMPT_SETTING_KEYS.map(key => [key, settings?.[key]]));
    renderSettings.builtinImageLlmReady = imageLlmReady(settings);
    if (!settings?.enabled || !settings?.autoRabbitMirrorInjection || settings?.mode === 'off') {
        return createPromptPlan([], { settings: renderSettings, generationType, activeFeedback }, null, true);
    }
    const requestedFaceCount = Number.isSafeInteger(settings.rabbitMirrorFaceCount) && settings.rabbitMirrorFaceCount >= 1 && settings.rabbitMirrorFaceCount <= 5
        ? settings.rabbitMirrorFaceCount : 1;
    const resay = generationContext?.multifaceResay || null;
    const missingRetry = generationContext?.missingFaceRetry || null;
    const missingIndexes = Array.isArray(missingRetry?.indexes)
        ? missingRetry.indexes.filter(index => Number.isInteger(index) && index >= 0 && index <= 4)
        : [];
    let selections;
    const resaySettings = resay ? presentationOverrideSettings(settings, resay) : settings;
    const pinnedSelections = Array.isArray(generationContext?.pinnedSelections) ? generationContext.pinnedSelections.filter(item => item?.combo) : [];
    if (pinnedSelections.length === 1) {
        selections = copyPromptPlanValue(pinnedSelections);
    }
    else if (missingIndexes.length) {
        selections = missingIndexes.map(index => pickCombinationForMultifaceResay(settings, { faceIndex: index, faces: missingRetry.faces, preserveVariation: true }));
    }
    else if (resay) {
        if (resay.pureOrder === true) {
            selections = [buildPureOrderSelection(resaySettings, resay)];
        }
        else if (resay.retryFailedFace === true && resay.freshSelection === true) {
            selections = [pickCombination(resaySettings, generationScopeKey, { ...generationContext,
                    previousVariation: resay.faces?.[resay.faceIndex],
                    faceIndex: Number(settings.rabbitMirrorFaceCount) === 1 ? 0 : resay.faceIndex })];
        }
        else {
            try {
                selections = [stampPresentationOverride(pickCombinationForMultifaceResay(resaySettings, resay, generationScopeKey, generationContext), resay.presentationOverride)];
            }
            catch (error) {
                if (resay.retryFailedFace !== true || error?.code !== 'MULTIFACE_PLAN_UNAVAILABLE'
                    || !['BATCH_RESAY_ENTRY_UNAVAILABLE', 'BATCH_RESAY_RECIPE_INCOMPLETE', 'BATCH_RESAY_CUSTOM_RECIPE'].includes(error.reasonCode))
                    throw error;
                globalThis.toastr?.info?.(__rmT("h8ZHVACSO0GcLNRkU9LoPwvrFn8S.r8GVuH8CxteSbaPV7rzzxYQXipe1Re6PFv97HFtgeFUlBtEwX5j4pQs9MNIWAT"));
                selections = [pickCombination(settings, generationScopeKey, generationContext)];
            }
        }
    }
    else if (requestedFaceCount > 1) {
        const operation = generationContext?.batchIdentity ? null : generationContext?.batchOperation || {
            operationId: generationScopeKey || `preview:${String(generationType || 'normal')}`,
            generationType: String(generationType || 'normal'),
            preview: !generationScopeKey,
        };
        selections = pickCombinationBatch(settings, generationScopeKey || operation?.operationId || '', {
            ...(generationContext || {}), batchPlanningOnly: true, ...(operation ? { batchOperation: operation } : {}),
        }, requestedFaceCount);
    }
    else {
        selections = [pickCombination(settings, generationScopeKey, generationContext)];
    }
    if (!pinnedSelections.length) {
        try {
            const faces = selections.map(selection => ({ html: !!selection?.combo && !selection.disabled && !isTextPresentation(selection.combo) && !selection.combo.pureOrder }));
            const families = assignmentAllowed(settings) ? assignFaceHueFamilies(faces, recentPaletteHueFamilies(getRecentDiversityHistory(3))) : [];
            selections.forEach((selection, index) => { if (selection?.combo && typeof selection.combo === 'object') {
                if (families[index])
                    selection.combo.hueFamily = families[index];
                else
                    delete selection.combo.hueFamily;
            } });
        }
        catch { }
    }
    const paletteUsedIds = [], paletteUsedGroups = [];
    for (const selection of selections)
        if (!usesModelOriginalColors(settings) && !pinnedSelections.length && selection?.combo && !selection.disabled) {
            attachPaletteRecipes(selection.combo, { recent: getRecentDiversityHistory(3), usedIds: paletteUsedIds, usedGroups: paletteUsedGroups,
                darkOnly: settings.darkVisualMode === true, darkCooldown: settings.darkVisualMode !== true && getActivePaletteCooldown(3).active });
        }
    const plan = createPromptPlan(selections, {
        settings: renderSettings, generationType, activeFeedback, requestedFaceCount,
        resay: resay ? { faceIndex: resay.faceIndex } : null,
        noContinuation: !!(resay && (resay.preserveSelection || resay.userPicked || resay.preserveVariation || resay.singleFaceRecipe)),
        directive: selections[0]?.directive || null,
        serialFaceIndex: Number.isInteger(generationContext?.serialFaceIndex) ? generationContext.serialFaceIndex : null,
        serialFaceCount: Number(generationContext?.serialFaceCount) || 0,
    }, pinnedSelections.length ? null : selections.batchPlan || null);
    const sent = plan.selections?.[0];
    if (generationScopeKey && !plan.batchPlan && plan.selections?.length === 1 && !pinnedSelections.length && !missingIndexes.length
        && sent?.continuation && sent.combo?.formatIds?.length) {
        try {
            retargetSingleAttemptFormat(generationScopeKey, sent.combo);
        }
        catch { }
    }
    return plan;
}
export function renderRabbitMirrorPromptPlan(plan, externalRawMap = null, appearanceMaterial = null, preparedMemoryMaterial = undefined, independentHistorySource = null) {
    const frozen = PROMPT_PLANS.get(plan);
    if (!frozen)
        throw externalMaterialError('RABBIT_MIRROR_EXTERNAL_MATERIAL_INVALID');
    const { selections, args, inactive } = frozen;
    const { settings, generationType, activeFeedback, requestedFaceCount, resay, directive, serialFaceIndex, serialFaceCount } = args;
    if (inactive) {
        return { prompt: '', executionLock: '', metadata: Object.freeze({ generationType: String(generationType || 'normal') }) };
    }
    const disabled = selections[0]?.disabled;
    if (disabled) {
        if (settings.debug)
            console.debug('[RabbitMirror] skipped by user directive');
        const metadata = requestedFaceCount > 1
            ? { generationType: String(generationType || 'normal'), disabled: true, faceCount: 0, requestedFaceCount }
            : { generationType: String(generationType || 'normal'), disabled: true };
        return { prompt: '', executionLock: '', metadata: Object.freeze(metadata) };
    }
    let appearanceReferenceText = '';
    if (settings.appearanceReferenceEnabled === true) {
        if (!appearanceMaterial || appearanceMaterial.schemaVersion !== 1 || appearanceMaterial.revision !== settings.appearanceReferenceRevision || typeof appearanceMaterial.reference !== 'string' || !appearanceMaterial.reference || appearanceMaterial.reference.length > 12000) {
            const error = new Error(__rmT("piuO4RpvL5MjlW9Bj_w4FST7Qdv1e2hbkpaB0nnCqbtym8xIqekBIZGr_IfoRyQ8wu17ix9MEwKmJ52LV8jvVWqWnA8x4lzNCDjhJYw9"));
            error.code = 'RABBIT_MIRROR_APPEARANCE_MISSING';
            error.requestCount = 0;
            throw error;
        }
        appearanceReferenceText = appearanceMaterial.reference;
    }
    const rawPolicy = normalizedRawPolicy(settings.rawPolicy);
    const faceContexts = selections.map(selection => ({ ...buildFaceContext(selection.combo, settings, rawPolicy, externalRawMap),
        designCandidatePick: designCandidatePick(selection.designCandidatePick),
        driverOffer: normalizeDriverOffer(selection.driverOffer),
        usageOffer: normalizeUsageOffer(selection.usageOffer),
        continuation: normalizeContinuation(selection.continuation) }));
    const multiface = faceContexts.length > 1;
    const first = faceContexts[0];
    const memoryMaterial = settings.memoryScanEnabled === true && faceContexts.some(face => hasSharedMemoryTheme(face.combo))
        ? preparedMemoryMaterial !== undefined ? preparedMemoryMaterial
            : String(generationType || 'normal') !== 'independent' ? readSelectedMemoryForPrompt(settings, settings.memoryMaxChars || 2200) : null
        : null;
    const followTagIsolationTags = followTagIsolationNames(settings, generationType);
    const followTagIsolationText = followTagIsolationRule(followTagIsolationTags);
    const hasTextPresentation = faceContexts.some(face => face.textPresentation);
    const visualHistoryRule = faceContexts.some(face => !face.combo?.pureOrder)
        ? sharedVisualHistoryRule({ textOnly: faceContexts.every(face => face.textPresentation || face.combo?.pureOrder), darkVisualMode: settings.darkVisualMode, softTone: settings.visualToneMode === 'soft',
            follow: String(generationType || 'normal') !== 'independent' }) : '';
    const paletteReferences = !usesModelOriginalColors(settings) && faceContexts.some(face => !face.textPresentation && !face.combo?.pureOrder)
        ? selectGenerationPalettes(faceContexts, settings, {
            darkCooldown: settings.darkVisualMode !== true && getActivePaletteCooldown(3).active,
        }) : [];
    const htmlFacesPresent = faceContexts.some(face => !face.textPresentation && !face.combo?.pureOrder);
    const recentForPalette = getRecentDiversityHistory(3);
    let historyNotes = { previousVersion: '', backfillRecords: [] };
    if (htmlFacesPresent && typeof independentHistorySource === 'function') {
        try {
            historyNotes = independentHistoryNotes(independentHistorySource({ needsBackfill: !getRecentDiversityHistory(5).length }), { includePrevious: !multiface && !resay });
        }
        catch {
            historyNotes = { previousVersion: '', backfillRecords: [] };
        }
    }
    const paletteSource = recentForPalette.length ? recentForPalette : historyNotes.backfillRecords.slice(0, 3);
    const paletteReminder = htmlFacesPresent ? recentPaletteExecutionReminder(paletteSource, settings) : '';
    const backfillLayouts = recentForPalette.length ? [] : [...new Set(historyNotes.backfillRecords.map(item => shortHistorySkeleton(item)).filter(text => text && text !== __rmT("cyfALcBH")))].slice(0, 3);
    const backfillNote = backfillLayouts.length ? `${__rmT("lsnDJV9jBwafnBFLI0_wZ3vTdV3ELr9sMxNCqh")}${backfillLayouts.join(__rmT("kis"))}${__rmT("bQQXoMcNCkGmqyHR4DD")}` : '';
    const recentHueFamilies = recentPaletteHueFamilies(paletteSource);
    const stamped = faceContexts.map(face => String(face.combo?.hueFamily || ''));
    const hueFamilies = stamped.some(Boolean) ? stamped : htmlFacesPresent && assignmentAllowed(settings)
        ? assignFaceHueFamilies(faceContexts.map(face => ({ html: !face.textPresentation && !face.combo?.pureOrder })), recentHueFamilies) : [];
    const hueAssigned = hueFamilies.some(key => key && HUE_FAMILY_NAMES[key]);
    const faceNumber = index => Number.isInteger(serialFaceIndex) && serialFaceCount > 1 ? serialFaceIndex + 1 : index + 1;
    const paletteLock = htmlFacesPresent && generationType === 'independent'
        ? [hueAssigned ? `${__rmT("HFE.LN61QvAaChZ8PEFOFO1y")}${hueFamilies.map((key, index) => key && HUE_FAMILY_NAMES[key] ? `${__rmT("_dE")}${faceNumber(index)}${__rmT("tD_")}${HUE_FAMILY_NAMES[key].split(__rmT("eis"))[0]}` : '').filter(Boolean).join(__rmT("jvk"))}${__rmT("2HQo8MZCZxCuaiHRNKY")}` : '',
            buildPaletteCooldownExecutionLock(settings, { skipHueFamilies: hueAssigned ? Object.keys(HUE_FAMILY_NAMES) : recentHueFamilies })].filter(Boolean).join(__rmT("7os")) : '';
    const driverOfferUnion = [...new Set(faceContexts.flatMap(face => face.driverOffer || []))];
    const usageUnion = [...new Set(faceContexts.flatMap(face => face.usageOffer?.usages || []))];
    const textRevealRotation = htmlFacesPresent && recentTextRevealRotation();
    const generationPolicy = [strongVisualDiversityRule({ hasHistory: !!visualHistoryRule || getComboHistory(5).length > 0, textOnly: !htmlFacesPresent,
            textRevealRotation }), generationType === 'independent' ? '' : paletteReminder].filter(Boolean).join('\n');
    const follow = String(generationType || 'normal') !== 'independent';
    let followInteractionNotes = '';
    if (follow && htmlFacesPresent) {
        const flip = recentFlipExpandRotation();
        followInteractionNotes = visualDiversityExecutionLock(settings, { textRevealRotation, flipRotation: flip,
            slideRotation: !flip && recentSlideDragRotation(), tabRotation: !flip && recentTabRowRotation(),
            noButtonRow: !faceContexts.some(face => hasNativeButtonRow(face.combo)) })
            .split('\n').filter(Boolean).map(line => `\n  - ${line}`).join('');
    }
    const constructionRules = htmlFacesPresent ? {
        interaction: groupScopedRules(faceContexts.flatMap((face, index) => face.textPresentation || face.combo?.pureOrder ? []
            : [{ scope: `${__rmT("BJgCyT")}${index + 1}${__rmT("7aATSXteidUk0Sl6fPD")}`, body: mediumInteractionConstructionRule(driverOfferUnion, usageUnion, follow) }]))
            + `${follow ? followInteractionNotes + followPickDirection(faceContexts) : `${__rmT("NyXC.fD.F8AKk5X1_Nt_Lk")}${faceContexts.flatMap((face, index) => face.designCandidatePick
                ? [`${__rmT("BJgCyT")}${index + 1}${__rmT("4b6BvRxwPwtozsBq")}${face.designCandidatePick}`] : []).join(__rmT("7os"))}${__rmT("5ivohiouuZCgl6zbQGy1r_90N1jEQRhra0VJs7vrbGbJV85uJf_r7f")}`}${faceContexts.flatMap((face, index) => face.continuation ? [`${__rmT("KDto9cc6")}${index + 1}${__rmT("7aATSXv5xk52zXHRIDD")}${face.continuation.title}${__rmT("zyT0kd_3SjhkG2CXkZ_WT8aXo8daLwbxeldNLXVq73ilno583U.SM.n0AjHE4SvMCj6YqjflsOAfdrxVLzszmTse5uBuU27J")}${face.continuation.gist ? `${__rmT("Y0ZnAHtFWZY")}${face.continuation.gist}` : ''}${__rmT("jzk")}`] : []).join('')}${(lines => lines.length ? `${__rmT("XpEMCPofe_oSjzhCM7KkjLSfhZVYZ2ja9BAe_jez32GwL4S6jGsX1jbictC.iEAe5I6IoGgC")}${lines.join(__rmT("7os"))}${__rmT("jzk")}` : '')(faceContexts.flatMap((face, index) => face.usageOffer?.usages?.length ? [`${__rmT("BJgCyT")}${index + 1}${__rmT("qGyf7aUg")}${face.usageOffer.labels.join(__rmT("Yos"))}${__rmT("Zvk")}${face.usageOffer.usages.join(__rmT("jvk"))}`] : []))}${(methods => methods.length ? `${__rmT("hfjNndH15agKm_0SLeYZb9_dtj1JvTbY")}${methods.join(__rmT("jvk"))}${__rmT("IV5oJydtI.9JNIXKbhNCByJvVFGk3BvJlvXspf")}` : '')(follow ? [] : recentInteractionMethods(3))}`,
        palette: sharedPaletteRules(faceContexts, settings, paletteReferences, true, follow),
        html: sharedHtmlModeRules(faceContexts, true, follow), diversity: generationPolicy,
    } : null;
    const composedPrompt = (hasTextPresentation || faceContexts.some(face => face.combo?.faceDrawConfigured === true && face.combo.texts?.length)) ? buildTextAwarePrompt({ faceContexts, settings, directive, memoryMaterial,
        generationType, followTagIsolationText, appearanceReferenceText, visualHistoryRule, constructionRules, hueFamilies }) : buildPrompt({
        combo: first.combo, settings, selectedThemes: first.selectedThemes, selectedFormats: first.selectedFormats,
        visualSceneryMode: first.visualSceneryMode, tarotRulesText: first.tarotRulesText,
        touchTheaterRulesText: first.touchTheaterRulesText, directive, memoryMaterial, activeFeedback,
        generationType, followTagIsolationText, faceContexts,
        externalReferences: faceContexts.some(face => face.hasExternal),
        appearanceReferenceText, visualHistoryRule, constructionRules, hueFamilies,
    });
    const styleSource = typeof settings.writingStyle === 'string' ? settings.writingStyle : '';
    const writingStyle = externalReferenceText(styleSource, styleSource.length);
    const styleRule = writingStyle ? `${__rmT("Q9OrBlUaQFc6l5N5_zaSnZso0otyJk")}${writingStyle}${__rmT("3_AJlDjTw7WwrfQEYgI0mP.coKuIKxwhYex1SW4IzYjLgmQIMzwT.J.EliXgKgQRSk6kE40X94SEPi9U9.Vc4etLNopmJjf890kV9eo7G0yoqZ8S91C0jN4MP0wu8dOqIWz4K8IDTn5FoO9ZCIO79vHd1wAxrSFKNDPc4A0C4h1tYQmu5OsWznzPFJnnQPWaZhuMDjmK9mpxfqnVzGBKcmyfnHDRhbfboK3v5h")}` : '';
    const readingRules = htmlFacesPresent ? '' : sharedPaletteRules(faceContexts, settings, paletteReferences, false, follow);
    const followFirewall = generationType === 'independent' ? '' : followMainReplyFirewall();
    const definitionOpening = rabbitMirrorOpening(faceContexts, { directive, settings });
    const openTag = [followFirewall, definitionOpening, readingRules].filter(Boolean).join('\n\n');
    const referencedPrompt = openTag ? composedPrompt.replace(__rmT("GRYgS01FSojlhsFKmKDQ8v_x"), `${__rmT("pJhzk2eJVBbV8sMMxR7ko3XrU.tyJk")}${openTag}`) : composedPrompt;
    const finalLanguageLock = generationType === 'independent' ? '' : `${visibleChineseHardLock(true)}\n`;
    const avatarRule = htmlFacesPresent ? rabbitMirrorAvatarPromptRule(settings) : '';
    const withTail = referencedPrompt.replace(__rmT("GHJQau.QlFtD1_4Ofk3u92Wwfus"), htmlFacesPresent
        ? `${styleRule}${finalLanguageLock}${avatarRule}${__rmT("GHJQau.QlFtD1_4Ofk3u92Wwfus")}` : `${styleRule}\n${generationPolicy}\n${finalLanguageLock}${__rmT("GHJQau.QlFtD1_4Ofk3u92Wwfus")}`);
    const prompt = follow && !multiface && !faceContexts[0]?.atmosphereFaces
        ? withTail.split(__rmT("kkWVjIl0eXq.RxqtruRtasCh1xbidwRgw3aBwP9OEvqJENJzgcF3JApLDfB4Pjo9T5tPWUl34AKaWAP0bPmLxtmA_kCn9.a7auA")).join('') : withTail;
    const baseFaces = faceContexts.map(face => ({ ...faceMetadata(face, settings, generationType, rawPolicy, directive, memoryMaterial && hasSharedMemoryTheme(face.combo) ? memoryMaterial : null, followTagIsolationTags, followTagIsolationText),
        ...(face.designCandidatePick ? { designCandidatePick: face.designCandidatePick } : {}),
        ...(hueFamilies[faceContexts.indexOf(face)] ? { hueFamily: hueFamilies[faceContexts.indexOf(face)] } : {}),
        ...(!face.textPresentation && !face.combo?.pureOrder && paletteReferences.length
            ? { paletteReferenceIds: paletteReferences.map(item => item.id) } : {}),
    }));
    const faces = faceContexts.map((face, faceIndex) => Object.freeze({
        faceIndex,
        ...baseFaces[faceIndex],
    }));
    const firstMetadata = baseFaces[0];
    const metadata = !multiface && !resay ? Object.freeze(firstMetadata) : Object.freeze({
        ...firstMetadata,
        faceCount: faces.length,
        faces: Object.freeze(faces),
        requestedFaceCount: resay ? 1 : requestedFaceCount,
        resayFaceIndex: resay ? resay.faceIndex : null,
        selectedThemeChars: faces.reduce((sum, face) => sum + face.selectedThemeChars, 0),
        selectedFormatChars: faces.reduce((sum, face) => sum + face.selectedFormatChars, 0),
        ...(faces.some(face => face.selectedTextChars) ? { selectedTextChars: faces.reduce((sum, face) => sum + (face.selectedTextChars || 0), 0) } : {}),
        motherLibraryChars: faces.reduce((sum, face) => sum + face.motherLibraryChars, 0),
        motherLibraryItems: faces.reduce((sum, face) => sum + face.motherLibraryItems, 0),
        memoryChars: String(memoryMaterial?.text || '').length,
    });
    const batchPlan = multiface && frozen.batchPlan
        ? freezeDeep(copyPromptPlanValue(frozen.batchPlan)) : null;
    if (settings.debug) {
        console.debug('[RabbitMirror] generationType:', generationType, 'faceCount:', faces.length, 'combos:', faceContexts.map(face => face.hasExternal
            ? { themeIds: face.combo.themeIds, formatIds: face.combo.formatIds } : face.combo), 'rawPolicy:', rawPolicy, 'memorySources:', memoryMaterial?.sources || [], 'prompt chars:', prompt.length);
    }
    const executionPolicy = visualDiversityExecutionLock(settings, { textOnly: !htmlFacesPresent, textRevealRotation, flipRotation: htmlFacesPresent && recentFlipExpandRotation(),
        slideRotation: htmlFacesPresent && !recentFlipExpandRotation() && recentSlideDragRotation(),
        tabRotation: htmlFacesPresent && !recentFlipExpandRotation() && recentTabRowRotation(), paleBan: htmlFacesPresent && lastPaleLock, softTone: settings.visualToneMode === 'soft',
        paletteReminder: generationType === 'independent' ? paletteReminder : '',
        paletteLock, previousVersion: [historyNotes.previousVersion, backfillNote].filter(Boolean).join('\n'),
        noButtonRow: htmlFacesPresent && !faceContexts.some(face => hasNativeButtonRow(face.combo)) });
    const nearOutputPolicy = htmlFacesPresent ? executionPolicy : '';
    const executionLockBody = hasTextPresentation ? buildTextAwareExecutionLock(faceContexts, settings, directive, nearOutputPolicy) : multiface
        ? buildMultiIndependentExecutionLock(faceContexts, settings, directive, nearOutputPolicy)
        : buildIndependentFinalExecutionLock({ combo: first.combo, settings, directive, candidateFaces: first.atmosphereFaces, executionPolicy: nearOutputPolicy });
    const serialFaceNote = Number.isInteger(serialFaceIndex) && serialFaceCount > 1
        ? `${__rmT("U.Lrer1E.X_QupHD2.xkvnCx")}${serialFaceIndex + 1}${__rmT("UqYPpOw6nHQBTh")}${serialFaceCount}${__rmT("2B2msgTWVBSWed.MzeSb8zF9HSOa9QQjLGQHTFgzWS37SCWlPctQ2OV8CX4.V5P14Lm.tBBacUUONvAFvrQIoGaW8DONQ4V1QS9WtWezDPIUaSsHNScp4omZy2.Qp_GjEr_tqNHHy80VDMYBQeV5gk")}${serialFaceIndex + 1}${__rmT("3mWCkZyZgdsoqxL2hEqG2IIO.9JLG6MrPVXasiqNxJa.bh")}` : '';
    const opening = __rmT("oHsEgKSPp08nYaCrfy2jhHKhEUyC5rNfISmh8BMdW7Pljtr5F.eE7zH1ef0TzxR0Vxhtoaj77U1ROw1I7alQjUYGqbfupfClECRt2UgtZkM_tD0IZPxgUgjfe9WcYOXGybLBhQ8SDMT");
    const executionLock = executionLockBody.replace(opening, htmlFacesPresent
        ? `${opening}${serialFaceNote}` : `${opening}\n${executionPolicy}${serialFaceNote}`);
    return { prompt, executionLock, metadata, ...(batchPlan ? { batchPlan } : {}) };
}
export function promptPlanSelections(plan) {
    const frozen = PROMPT_PLANS.get(plan);
    if (!frozen || !Array.isArray(frozen.selections))
        return [];
    return frozen.selections.map(selection => copyPromptPlanValue(selection));
}
export function buildRabbitMirrorPromptDetails(settings, generationType = 'normal', activeFeedback = null, generationScopeKey = '', generationContext = null) {
    return renderRabbitMirrorPromptPlan(planRabbitMirrorPromptDetails(settings, generationType, activeFeedback, generationScopeKey, generationContext));
}
export function buildRabbitMirrorPrompt(settings, generationType = 'normal', activeFeedback = null, generationScopeKey = '', generationContext = null) {
    return buildRabbitMirrorPromptDetails(settings, generationType, activeFeedback, generationScopeKey, generationContext).prompt;
}
