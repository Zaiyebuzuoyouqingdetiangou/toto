import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=2.2.0";
import { layoutRect } from '../faceZoomMetrics.js?rmv=2.2.0';
import { RADIO_BRANCH_COUNT_ATTR, findRadioBranchCandidates } from './radioBranchRepair.js?rmv=2.2.0';
import { GENERIC_PROBE_RESULT_ATTR, runMaintenanceGenericProbe, describeGenericProbe } from './maintenanceGenericProbe.js?rmv=2.2.0';
import { recordRepairSample } from './repairSamples.js?rmv=2.2.0';
import { cancelLabeledCheckedTransitionVerification, invalidateMaintenanceLabeledCheckedProbe } from './fallbackRescue.js?rmv=2.2.0';
import { LABELED_CHECKED_VERIFY_LAST_ATTR } from './checkedStateRescue.js?rmv=2.2.0';
import { findUnmappedNavigationButtons } from './choiceRescue.js?rmv=2.2.0';
import { nativePopoverFallbackCount, inspectNativePopoverFallback } from './nativePopoverFallback.js?rmv=2.2.0';
import { inspectBehaviorRecovery } from './behaviorRecovery.js?rmv=2.2.0';
import { BEHAVIOR_RELAY_ATTR, relayDeadBehaviorGroups } from './behaviorRelay.js?rmv=2.2.0';
import { BEHAVIOR_REVERSE_ATTR, reverseRelayDeadHandwrittenControls } from './behaviorReverseRelay.js?rmv=2.2.0';
import { cloneRabbitMirrorFilteredNode } from '../bannedWords.js?rmv=2.2.0';
import { applyNameMaskToRestoredRoot, isNameMaskActive, unmaskNameMaskClone } from '../nameMask.js?rmv=2.2.0';
import { getCurrentChatKey } from '../storage.js?rmv=2.2.0';
import { bindRabbitMirrorAvatarRoot, restoreRabbitMirrorAvatarClone } from '../chatAvatars.js?rmv=2.2.0';
import { auditVisibleLanguageBalanceText } from '../feedbackCat.js?rmv=2.2.0';
import { captureMaintenanceRevealBaseline, collectMaintenanceRevealPatches, mergeMaintenanceRevealPatches, replayMaintenanceRevealPatches } from './maintenanceRevealReplay.js?rmv=2.2.0';
import { getRabbitMirrorGenerationSnapshot } from '../generationGuard.js?rmv=2.2.0';
import { analyzeStylelessControlKinds, collectBoundedElementDescendants, countMeaningfulStateVisualRules } from '../presentationQuality.js?rmv=2.2.0';
import { isHostDetailsCollapseControl, EXTERNAL_REFERENCE_NOTE_ATTR, FEEDBACK_CAT_ATTR, INTERACTION_HOME_ATTR, MAINTENANCE_RABBIT_ATTR, MIRROR_TOTO_SELECTOR, RECIPE_BUTTON_ATTR, RUNTIME_VERSION, TOOL_ENTRY_HOST_ATTR, getRenderedRabbitMirrorInteractionRoots, hashInteractionSignature, isInsideChatMessage, isRabbitMirrorDetails, isMaintenanceAutoPatrolEnabled, } from './runtime.js?rmv=2.2.0';
import { CHANGE_PSEUDO_RESCUE_ATTR, CHANNEL_DIAL_CYCLE_COUNT_ATTR, CHECKED_HAS_STATE_RULE_COUNT_ATTR, CROSS_PARENT_CHECKED_ROOT_ATTR, CROSS_PARENT_CHECKED_RULE_RESCUE_ATTR, DECORATIVE_OVERLAY_PASS_THROUGH_ATTR, DETACHED_CHECKED_HAS_RULE_COUNT_ATTR, DIRECT_ID_CLASS_STATE_RESCUE_ATTR, DIRECT_ID_CLICK_RESCUE_ATTR, EXCLUSIVE_STACKED_STATE_COUNT_ATTR, FOCUS_WITHIN_PERSISTENT_ROOT_ATTR, INLINE_PSEUDO_RESCUE_ATTR, LABELED_CHECKED_VERIFY_ROOT_ATTR, MISSING_CHECKED_SUBJECT_CLASS_RESCUE_ATTR, NESTED_CHECKED_CONTENT_RESCUE_ATTR, PAIRED_CHECKED_STATE_COUNT_ATTR, PASSPORT_DOCUMENT_TRIGGER_RESCUE_ATTR, RAW_NAMED_FUNCTION_RESCUE_ATTR, RAW_SCRIPT_TIMELINE_RESCUE_ATTR, RAW_SCRIPT_TIMELINE_ROOT_ATTR, REVERSIBLE_CHECKED_RESULT_ROOT_ATTR, REVERSIBLE_CHECKED_RESULT_TARGET_ATTR, crossParentCheckedCandidateVerified, findChannelDialCycleCandidates, findCrossParentCheckedRuleFallbackCandidates, findExclusiveStackedStateCandidates, findPairedCheckedStateCandidates, installMissingCheckedSubjectClassRescue, parseBrokenCheckedHasStateRules, parseCheckedRulesFromText, parseDetachedCheckedHasRules, parseMissingCheckedSubjectClassRules, resolveTargetsForCheckedRule, restoreIndependentNativeCheckedInteraction, } from './checkedStateRescue.js?rmv=2.2.0';
import { getClassTokens, isCollapsedDimensionValue, normalizeStylePropertyName } from './renderedStateRescue.js?rmv=2.2.0';
import { RAW_RADIO_RESET_RESCUE_ATTR, RAW_SELF_MUTATION_RESCUE_ATTR, chooseMatchingRawRabbitMirrorRoot, collectSafeRawScriptTimelinePrograms, detectInteractionCapabilities, filterRabbitMirrorRuntimeDom, getAvailableHostChat, getExternalOwnerMessageIndex, getRabbitMirrorSummaryText, getRawAssistantMessageForRenderedRoot, installRawMessageRadioResetProgramRescue, normalizeInteractionMatchText, } from './scriptedInteractionRescue.js?rmv=2.2.0';
import { REVERSIBLE_RADIO_ROOT_ATTR, TOUCH_HOVER_ATTR, TOUCH_HOVER_READY_ATTR, TOUCH_HOVER_STYLE_ATTR, findDecorativeOverlayPassThroughCandidates, findFocusWithinPersistentCandidates, findMobileInlineAnnotationCandidates, findNestedDetailsPopupClippingCandidates, findOneWayCheckedResultCandidates, installIntelligentInteractionRescue, installMobileInlineAnnotationRescue, installReversibleRadioGroupFallback, installWebKit3DFlipRescue, repairMarkdownCorruptedCssComments, repairNestedDetailsPopupClipping, scheduleMaintenanceLabeledCheckedProbe, } from './fallbackRescue.js?rmv=2.2.0';
import { RADIO_GROUP_ROOT_ATTR, activateRabbitMirrorInteractionRescue, inspectSanitizedRadioGroupLoss, rearmRabbitMirrorSerializedInteractionRoot, scopeRabbitMirrorInteractionIds, } from './idsAndRearm.js?rmv=2.2.0';
import { DISABLED_ONLY_CHOICE_RESCUE_ATTR, FEEDBACK_CAT_MENU_ATTR, FILL_IN_CHOICE_COUNT_ATTR, INDEPENDENT_REPAIR_PERSIST_EVENT, INERT_ACTION_BUTTON_RESCUE_ATTR, INTERACTION_DIAGNOSTIC_PANEL_ATTR, MAINTENANCE_AUTO_SAFE_ATTR, MAINTENANCE_AUTO_SAFE_RESULT_ATTR, MAINTENANCE_AUTO_SAFE_VERSION, MAINTENANCE_MENU_ATTR, MAINTENANCE_MIRROR_IDENTITY_ATTR, MAINTENANCE_REPAIR_ATTR, MAINTENANCE_STATES, RECIPE_MENU_ATTR, RESAY_ATTR, SELECTION_ONLY_FALLBACK_ATTR, SOURCE_TRUNCATION_NOTICE_ATTR, STATIC_CHOICE_SELECTION_COUNT_ATTR, STRUCTURED_STATIC_DISCLOSURE_COUNT_ATTR, STYLELESS_STRUCTURED_CHOICE_ATTR, STYLELESS_STRUCTURED_CHOICE_LABEL_ATTR, STYLELESS_STRUCTURED_COUNT_ATTR, STYLELESS_STRUCTURED_HEADER_ATTR, STYLELESS_STRUCTURED_MAX_DESCENDANTS, STYLELESS_STRUCTURED_RESCUE_ATTR, STYLELESS_STRUCTURED_SECTION_ATTR, STYLELESS_STRUCTURED_SHELL_ATTR, STYLELESS_STRUCTURED_STYLE_ATTR, STYLELESS_STRUCTURED_SUBTITLE_ATTR, STYLELESS_STRUCTURED_TEXT_ATTR, STYLELESS_STRUCTURED_TITLE_ATTR, captureInteractionDiagnosticSnapshot, createOneShotInteractionDiagnosticPanel, diagnosticCodeRescueSummary, diagnosticComputedStyle, diagnosticContentSnapshot, diagnosticFullChainSummary, diagnosticMessageBody, diagnosticQueryContentAll, diagnosticRouteSummary, failMaintenanceRabbit, finalizeOneShotInteractionDiagnostic, findMaintenanceTextClippingCandidates, inspectRevealedDrawerClipping, interactionDiagnosticStates, isLikelyTouchDevice, maintenanceInteractionScopeEvidence, maintenancePreRepairSnapshots, markIndependentMaintenanceLiveRepair, rabbitMirrorInteractionResetInstanceIds, rabbitMirrorInteractionResetSnapshots, rabbitMirrorLanguageBalance, releaseIndependentMaintenanceLiveRepair, removeInteractionDiagnostic, repairMaintenanceTextClipping, repairRevealedDrawerClipping, setMaintenanceRabbitState, stripMaintenanceRabbitGlyphs, MAINTENANCE_STATE_ATTR, MAINTENANCE_REASON_ATTR, buildRabbitMirrorSkeletonPair, } from './diagnostics.js?rmv=2.2.0';
import { captureRabbitMirrorMaintenanceRepairState, findDisabledOnlyChoiceGroupCandidates, findFillInChoiceCandidates, findInertActionButtonCandidates, findSelectionOnlyRadioFallbackCandidates, findStaticChoiceSelectionCandidates, findStructuredStaticDisclosureCandidates, installDisabledOnlyChoiceFallback, installFillInChoiceFallback, installInertActionButtonFallback, installSelectionOnlyStateFallback, installStaticChoiceSelectionFallback, installStructuredStaticDisclosureFallback, rehydrateRabbitMirrorMaintenanceRepairs, } from './choiceRescue.js?rmv=2.2.0';
import { FENCED_BLOCK_RE, RABBIT_MIRROR_SANITIZER_STYLE_DROP_ATTR, TOTO_BLOCK_SINGLE_RE, cleanRabbitMirrorOutput, cloneMessageForTransientRerender, compactTotoBlock, decodeHtmlEntities, looksLikeCompleteHtmlBlock, rescueDamagedDataUriRabbitMirrorOutput, rescuePlainTextRabbitMirrorOutput, sanitizeRabbitMirrorUntrustedTemplate, setTransientMessageSource, splitCssSelectorList, stripOneCodeFence, validateRabbitMirrorMarkupLexicalBudget, wrapNakedHtmlAsToto, wrapTrailingNakedHtml, } from './markup.js?rmv=2.2.0';
import { getRabbitMirrorFacePosition, independentMaintenanceHost, inspectMaintenanceMobileLayout, inspectMaintenanceViewportLayout, installMaintenanceHorizontalClipRescue, installMaintenanceMobileLayoutRescue, installMaintenanceViewportLayoutRescue, installVisualSceneryMobileNarrativeOverflowRescue, maintenanceMobileLayoutComputedStyle, maintenanceMobileLayoutIsInternal, maintenanceMobileLayoutRect, maintenanceMobileLayoutTextLength, shouldRunMaintenanceMobileLayoutRescue, } from './layoutRescue.js?rmv=2.2.0';
import { containRabbitMirrorTitleToolFloat, installMaintenanceRabbitForRoot, rabbitMirrorTextPresentation, refreshRabbitMirrorToolsInScope, } from './toolsChrome.js?rmv=2.2.0';
import { TRANSIENT_RERENDER_REASONING_ENVELOPE_RE, followMaintenanceRepairRecipes, getMessageIndexFromMirrorNode, hostScriptModule, maintenanceRepairActiveRuns, maintenanceRepairRunRecords, maintenanceRepairRunTokens, maintenanceRepairTimers, messageContainsReasoningEnvelope, messageUsesDistinctDisplaySource, } from './lifecycle.js?rmv=2.2.0';
let rabbitMirrorInteractionResetInstanceCounter = 0;
export const MAINTENANCE_FINDING_STAGE_LABELS = Object.freeze({
    source: __rmT("qgbVfT"),
    structure: __rmT("ukwR8O06zJ.qWf"),
    visibility: __rmT("_PmXfh"),
    interaction: __rmT("MQ3L3f"),
    compatibility: __rmT("lDOKBk"),
});
const TEXT_CONTRAST_RESCUE_ATTR = 'data-rabbit-mirror-text-contrast-rescue';
export const TEXT_CONTRAST_RESCUE_ROOT_ATTR = 'data-rabbit-mirror-text-contrast-rescue-count';
export const MAINTENANCE_QUARANTINED_SCRIPT_ATTR = 'data-rabbit-mirror-quarantined-script';
const MAINTENANCE_STATIC_DECOR_ATTR = 'data-rabbit-mirror-static-script-fallback';
const MAINTENANCE_STATIC_DECOR_CHILD_ATTR = 'data-rabbit-mirror-static-decoration';
const rabbitMirrorInteractionResetSourceSignatures = new WeakMap();
const rabbitMirrorInteractionResetBudgetSkips = new WeakMap();
const MAINTENANCE_RESCUE_MODULE_VERSION = 'v2.25';
const MAINTENANCE_RESCUE_LIBRARY = Object.freeze([
    { id: 'code-block-dom', modes: ['source', 'code', 'all'], bucket: 'code', run: ({ messageScope }) => sanitizeCodeBlocksInScope(messageScope, true) },
    { id: 'plain-text-dom', modes: ['source', 'plainText', 'code', 'all'], bucket: 'plainText', run: ({ messageScope }) => sanitizeWholePlainTextRabbitMirrorsInScope(messageScope, true) },
    { id: 'rendered-details-dom', modes: ['source', 'plainText', 'code', 'all'], bucket: 'plainText', run: ({ messageScope }) => sanitizeRenderedRabbitMirrorDetailsInScope(messageScope, true) },
    { id: 'styleless-structured-rescue', modes: ['style', 'all'], bucket: 'style', perTarget: true, run: ({ root, target }) => target === root ? installMaintenanceStylelessStructuredRescue(target) : 0 },
    { id: 'css-comment-boundary', modes: ['source', 'style', 'all'], bucket: 'style', perTarget: true, run: ({ target }) => repairMarkdownCorruptedCssComments(target) },
    { id: 'mobile-inline-annotation-flow-repair', modes: ['text', 'all'], bucket: 'style', perTarget: true, run: ({ target }) => installMobileInlineAnnotationRescue(target) },
    { id: 'nested-details-popup-flow-repair', modes: ['text', 'all'], bucket: 'style', perTarget: true, run: ({ target }) => repairNestedDetailsPopupClipping(target) },
    { id: 'mobile-layout-rescue', modes: ['text', 'all'], bucket: 'style', perTarget: true, run: ({ root, target }) => target === root && shouldRunMaintenanceMobileLayoutRescue(target) ? installMaintenanceMobileLayoutRescue(target) : 0 },
    { id: 'viewport-layout-rescue', modes: ['text', 'all'], bucket: 'style', perTarget: true, run: ({ root, target }) => target === root ? installMaintenanceViewportLayoutRescue(target) : 0 },
    { id: 'horizontal-clip-rescue', modes: ['text', 'all'], bucket: 'style', perTarget: true, run: ({ root, target }) => target === root ? installMaintenanceHorizontalClipRescue(target) : 0 },
    { id: 'text-contrast-repair', modes: ['text', 'all'], bucket: 'style', perTarget: true, run: ({ target }) => repairSevereTextContrast(target) },
    { id: 'text-clipping-repair', modes: ['text', 'all'], bucket: 'style', perTarget: true, run: ({ target }) => repairMaintenanceTextClipping(target) },
    { id: 'webkit-3d-flip-compat', modes: ['interaction', 'style', 'all'], bucket: 'style', perTarget: true, run: ({ target }) => installWebKit3DFlipRescue(target) },
    { id: 'interaction-id-scope', modes: ['source', 'interaction', 'style', 'all'], bucket: 'scope', perTarget: true, run: ({ target }) => { scopeRabbitMirrorInteractionIds(target); return 1; } },
    { id: 'complete-interaction-library', modes: ['interaction', 'all'], bucket: 'interaction', perTarget: true, run: ({ target }) => {
            const radioGroupCountBefore = Number.parseInt(target.getAttribute?.(RADIO_GROUP_ROOT_ATTR) || '0', 10) || 0;
            scopeRabbitMirrorInteractionIds(target);
            const overlayCountBefore = target.querySelectorAll?.(`[${DECORATIVE_OVERLAY_PASS_THROUGH_ATTR}]`)?.length || 0;
            const rawHoverCountBefore = Number.parseInt(target.dataset?.rabbitMirrorRawHoverFallback || '0', 10) || 0;
            const recoveredProgramCountBefore = recoveredInlineStateProgramCount(target);
            const rawScriptTimelineCountBefore = Number.parseInt(target.getAttribute?.(RAW_SCRIPT_TIMELINE_ROOT_ATTR) || '0', 10) || 0;
            const disabledChoiceRepairCount = installDisabledOnlyChoiceFallback(target);
            invalidateMaintenanceLabeledCheckedProbe(target);
            for (const input of target.querySelectorAll('input[type="checkbox"],input[type="radio"]'))
                cancelLabeledCheckedTransitionVerification(input);
            installIntelligentInteractionRescue(target);
            const overlayCountAfter = target.querySelectorAll?.(`[${DECORATIVE_OVERLAY_PASS_THROUGH_ATTR}]`)?.length || 0;
            const rawHoverCountAfter = Number.parseInt(target.dataset?.rabbitMirrorRawHoverFallback || '0', 10) || 0;
            const recoveredProgramCountAfter = recoveredInlineStateProgramCount(target);
            const rawScriptTimelineCountAfter = Number.parseInt(target.getAttribute?.(RAW_SCRIPT_TIMELINE_ROOT_ATTR) || '0', 10) || 0;
            const rawScriptTimelineRepairCount = Math.max(0, rawScriptTimelineCountAfter - rawScriptTimelineCountBefore);
            const behaviorAfter = inspectBehaviorRecovery(target);
            const behaviorWiredCount = behaviorAfter.wired + nativePopoverFallbackCount(target);
            const radioGroupCountAfter = Number.parseInt(target.getAttribute?.(RADIO_GROUP_ROOT_ATTR) || '0', 10) || 0;
            const radioGroupRepairCount = Math.max(0, radioGroupCountAfter - radioGroupCountBefore);
            const overlayRepairCount = Math.max(0, overlayCountAfter - overlayCountBefore);
            const rawHoverRepairCount = Math.max(0, rawHoverCountAfter - rawHoverCountBefore);
            const recoveredProgramRepairCount = Math.max(0, recoveredProgramCountAfter - recoveredProgramCountBefore);
            const crossParentCheckedCount = Number.parseInt(target.getAttribute?.(CROSS_PARENT_CHECKED_ROOT_ATTR) || '0', 10) || 0;
            const labeledCheckedVerifyCount = Number.parseInt(target.getAttribute?.(LABELED_CHECKED_VERIFY_ROOT_ATTR) || '0', 10) || 0;
            const radioBranchCount = Number.parseInt(target.getAttribute?.(RADIO_BRANCH_COUNT_ATTR) || '0', 10) || 0;
            if (radioBranchCount > 0 || crossParentCheckedCount > 0 || labeledCheckedVerifyCount > 0) {
                scheduleMaintenanceLabeledCheckedProbe(target, null);
            }
            const checkedHasStateCount = Number.parseInt(target.getAttribute?.(CHECKED_HAS_STATE_RULE_COUNT_ATTR) || '0', 10) || 0;
            const detachedCheckedHasCount = Number.parseInt(target.getAttribute?.(DETACHED_CHECKED_HAS_RULE_COUNT_ATTR) || '0', 10) || 0;
            const pairedCheckedStateCount = Number.parseInt(target.getAttribute?.(PAIRED_CHECKED_STATE_COUNT_ATTR) || '0', 10) || 0;
            const exclusiveStackedStateCount = Number.parseInt(target.getAttribute?.(EXCLUSIVE_STACKED_STATE_COUNT_ATTR) || '0', 10) || 0;
            const channelDialCycleCount = Number.parseInt(target.getAttribute?.(CHANNEL_DIAL_CYCLE_COUNT_ATTR) || '0', 10) || 0;
            const reversibleCheckedCount = Number.parseInt(target.getAttribute?.(REVERSIBLE_CHECKED_RESULT_ROOT_ATTR) || '0', 10) || 0;
            const reversibleRadioCount = Number.parseInt(target.getAttribute?.(REVERSIBLE_RADIO_ROOT_ATTR) || '0', 10) || 0;
            const nestedCheckedContentCount = target.querySelectorAll?.(`[${NESTED_CHECKED_CONTENT_RESCUE_ATTR}]`)?.length || 0;
            const focusWithinPersistentCount = Number.parseInt(target.getAttribute?.(FOCUS_WITHIN_PERSISTENT_ROOT_ATTR) || '0', 10) || 0;
            const selectionFallbackCount = installSelectionOnlyStateFallback(target);
            const inertActionRepairCount = installInertActionButtonFallback(target);
            const staticChoiceRepairCount = installStaticChoiceSelectionFallback(target);
            const structuredStaticDisclosureRepairCount = installStructuredStaticDisclosureFallback(target);
            const fillInChoiceRepairCount = installFillInChoiceFallback(target);
            const disabledChoiceCount = target.querySelectorAll?.(`[${DISABLED_ONLY_CHOICE_RESCUE_ATTR}]`)?.length || 0;
            const inertActionCount = target.querySelectorAll?.(`[${INERT_ACTION_BUTTON_RESCUE_ATTR}]`)?.length || 0;
            const staticChoiceCount = Number.parseInt(target.getAttribute?.(STATIC_CHOICE_SELECTION_COUNT_ATTR) || '0', 10) || 0;
            const structuredStaticDisclosureCount = Number.parseInt(target.getAttribute?.(STRUCTURED_STATIC_DISCLOSURE_COUNT_ATTR) || '0', 10) || 0;
            const fillInChoiceCount = Number.parseInt(target.getAttribute?.(FILL_IN_CHOICE_COUNT_ATTR) || '0', 10) || 0;
            detectInteractionCapabilities(target);
            const depthAfter = maintenanceCheckedInteractionDepth(target);
            const meaningfulCheckedRoute = depthAfter.meaningfulCheckedRuleCount > 0
                && depthAfter.unresolvedCheckedRuleCount === 0
                && !depthAfter.checkedSelectionOnly;
            const genuinelyRescued = radioBranchCount > 0 || behaviorWiredCount > 0
                || selectionFallbackCount > 0
                || disabledChoiceRepairCount > 0
                || inertActionRepairCount > 0
                || staticChoiceRepairCount > 0
                || structuredStaticDisclosureRepairCount > 0
                || fillInChoiceRepairCount > 0
                || disabledChoiceCount > 0
                || inertActionCount > 0
                || staticChoiceCount > 0
                || structuredStaticDisclosureCount > 0
                || fillInChoiceCount > 0
                || overlayRepairCount > 0
                || rawHoverRepairCount > 0
                || recoveredProgramRepairCount > 0
                || recoveredProgramCountAfter > 0
                || rawScriptTimelineRepairCount > 0
                || rawScriptTimelineCountAfter > 0
                || radioGroupRepairCount > 0
                || radioGroupCountAfter > 0
                || crossParentCheckedCount > 0
                || labeledCheckedVerifyCount > 0
                || checkedHasStateCount > 0
                || detachedCheckedHasCount > 0
                || pairedCheckedStateCount > 0
                || exclusiveStackedStateCount > 0
                || channelDialCycleCount > 0
                || reversibleCheckedCount > 0
                || reversibleRadioCount > 0
                || nestedCheckedContentCount > 0
                || focusWithinPersistentCount > 0
                || meaningfulCheckedRoute;
            if (genuinelyRescued)
                target.dataset.rabbitMirrorInteractionRescued = 'true';
            else
                delete target.dataset.rabbitMirrorInteractionRescued;
            const routes = String(target.dataset.rabbitMirrorInteractionRoutes || '')
                .split(',')
                .map(item => item.trim())
                .filter(item => item && item !== 'none');
            return genuinelyRescued ? Math.max(radioBranchCount, behaviorWiredCount, routes.length, disabledChoiceRepairCount, inertActionRepairCount, staticChoiceRepairCount, structuredStaticDisclosureRepairCount, fillInChoiceRepairCount, disabledChoiceCount, inertActionCount, staticChoiceCount, structuredStaticDisclosureCount, fillInChoiceCount, overlayRepairCount, rawHoverRepairCount, recoveredProgramRepairCount, recoveredProgramCountAfter, rawScriptTimelineRepairCount, rawScriptTimelineCountAfter, radioGroupRepairCount, radioGroupCountAfter, crossParentCheckedCount, labeledCheckedVerifyCount, checkedHasStateCount, detachedCheckedHasCount, pairedCheckedStateCount, exclusiveStackedStateCount, channelDialCycleCount, reversibleCheckedCount, nestedCheckedContentCount, focusWithinPersistentCount) : 0;
        } },
    { id: 'behavior-relay', modes: ['interaction', 'all'], bucket: 'interaction', perTarget: true, run: ({ root, target }) => target === root ? relayDeadBehaviorGroups(target) : 0 },
    { id: 'behavior-reverse-relay', modes: ['interaction', 'all'], bucket: 'interaction', perTarget: true, run: ({ root, target }) => target === root ? reverseRelayDeadHandwrittenControls(target) : 0 },
]);
const SOURCE_RECOVERY_COOLDOWN_MS = 1800;
const sourceRecoveryLastRun = new Map();
let codeShellRecoveryObserver = null;
export const CODE_SHELL_SELECTOR = 'pre, code, .hljs, .code_block, .code-block, .codeblock, [class*="codeblock"], [class*="code-block"]';
function isCheckedSelectionVisualProperty(property, value) {
    const name = String(property || '').trim().toLowerCase();
    const cleanValue = String(value || '').trim().toLowerCase();
    if (!name)
        return true;
    if (name === 'transform') {
        return !/(?:rotate[xy]|perspective)\s*\(/i.test(cleanValue);
    }
    if (name.startsWith('--'))
        return true;
    return name === 'color'
        || name === 'background' || name.startsWith('background-')
        || name === 'border' || name.startsWith('border-')
        || name === 'box-shadow' || name === 'text-shadow'
        || name === 'outline' || name.startsWith('outline-')
        || name === 'filter' || name === 'backdrop-filter'
        || name === 'fill' || name === 'stroke'
        || name === 'cursor'
        || name === 'font-weight' || name === 'font-style'
        || name === 'text-decoration' || name === 'letter-spacing'
        || name === 'translate' || name === 'rotate' || name === 'scale'
        || name === 'transition' || name.startsWith('transition-')
        || name === 'transform-origin';
}
function checkedBaselineDeclarationMap(declarations) {
    const map = new Map();
    const declarationRe = /(^|;)\s*([a-z-]+)\s*:\s*([^;{}]+?)(?=;|$)/gi;
    let match;
    while ((match = declarationRe.exec(String(declarations || '')))) {
        map.set(normalizeStylePropertyName(match[2]), String(match[3] || '').replace(/\s*!important\s*$/i, '').trim().toLowerCase());
    }
    return map;
}
function checkedTargetHasHiddenBaseline(root, target, property) {
    if (!target)
        return false;
    const name = normalizeStylePropertyName(property);
    const inlineValue = String(target.style?.getPropertyValue?.(name) || '').trim().toLowerCase();
    const computed = diagnosticComputedStyle(target);
    const computedValue = String(computed?.getPropertyValue?.(name) || computed?.[name] || '').trim().toLowerCase();
    if (name === 'display' && (target.hidden || inlineValue === 'none' || computedValue === 'none'))
        return true;
    if (name === 'visibility' && /^(?:hidden|collapse)$/.test(inlineValue || computedValue))
        return true;
    if (name === 'opacity') {
        const value = Number.parseFloat(inlineValue || computedValue || '1');
        if (Number.isFinite(value) && value <= 0.05)
            return true;
    }
    if (/^(?:height|max-height|min-height)$/.test(name)) {
        const value = inlineValue || computedValue;
        if (isCollapsedDimensionValue(value))
            return true;
    }
    if (name === 'clip-path' && /(?:inset\(\s*50%|circle\(\s*0|polygon\(\s*0)/i.test(inlineValue || computedValue))
        return true;
    const blockRe = /([^{}]+)\{([^{}]*)\}/g;
    for (const style of diagnosticQueryContentAll(root, 'style')) {
        const cssText = String(style.textContent || '');
        blockRe.lastIndex = 0;
        let block;
        while ((block = blockRe.exec(cssText))) {
            const selectorText = String(block[1] || '').trim();
            if (!selectorText || selectorText.startsWith('@') || /:(?:checked|hover|active|focus|focus-within|target|has)\b/i.test(selectorText))
                continue;
            const declarations = checkedBaselineDeclarationMap(block[2]);
            if (!declarations.has(name))
                continue;
            const baselineValue = declarations.get(name) || '';
            let matches = false;
            for (const selector of splitCssSelectorList(selectorText)) {
                try {
                    if (target.matches?.(selector)) {
                        matches = true;
                        break;
                    }
                }
                catch {
                }
            }
            if (!matches)
                continue;
            if (name === 'display' && baselineValue === 'none')
                return true;
            if (name === 'visibility' && /^(?:hidden|collapse)$/.test(baselineValue))
                return true;
            if (name === 'opacity') {
                const value = Number.parseFloat(baselineValue);
                if (Number.isFinite(value) && value <= 0.05)
                    return true;
            }
            if (/^(?:height|max-height|min-height)$/.test(name) && isCollapsedDimensionValue(baselineValue))
                return true;
            if (name === 'clip-path' && /(?:inset\(\s*50%|circle\(\s*0|polygon\(\s*0)/i.test(baselineValue))
                return true;
        }
    }
    return false;
}
export function checkedTargetCarriesResultContent(target) {
    if (!target)
        return false;
    const text = normalizeInteractionMatchText(target.textContent);
    if (text.length >= 2)
        return true;
    if (target.querySelector?.('img,svg,canvas,video,audio,figure,table,ul,ol,dl,blockquote'))
        return true;
    const semantic = `${target.id || ''} ${getClassTokens(target).join(' ')}`;
    return __rmR("dL0Mdd8_m1FOR0mpsQ9sLoQYnE5yJwOilUCxm7msJS0g8RAeWcVD1OGXFVzoKOR0z9YxYfFl7p6zra8YnZ7msoc_m.2wtwc5o6mRY59ZXZXybkqBcHZ_cOvnAfpGClDj_sYwPIZfRPpkNNqFq7U_U6.hIJqj4IhFim.ixwn6aAFPO1Le5WJx_HB559Jn82rJ2AEXY8lodH6tHZlmqeJ6mGuzNtFcIds5HhrtOCa._sf.7k5CMmOyc6.l1zK9.l2hvARbtRzZ", "i").test(semantic)
        && !__rmR("2QBOHvkouCibRAfS5HcZ0LOpe9CpJhrUMk6Ub_W2DNxHgHey0iInVr7qloTJMmty2rClnUoJk_fbwNhRdthhHkVa0z2Ste8j3e9twKzIPSq3nV6rRnKJvE1t4XG3IVVXu7FmWwbIk.dWZxlrKLj7lMzt2CDg_Xb_twHNQLUjzAG", "i").test(semantic);
}
export function checkedDeclarationCreatesContentReveal(root, target, property, value) {
    if (!checkedTargetCarriesResultContent(target))
        return false;
    const name = normalizeStylePropertyName(property);
    const cleanValue = String(value || '').replace(/\s*!important\s*$/i, '').trim().toLowerCase();
    if (name === 'display')
        return cleanValue !== 'none' && checkedTargetHasHiddenBaseline(root, target, name);
    if (name === 'visibility')
        return /^(?:visible|initial|inherit|unset)$/.test(cleanValue) && checkedTargetHasHiddenBaseline(root, target, name);
    if (name === 'opacity') {
        const next = Number.parseFloat(cleanValue);
        return Number.isFinite(next) && next > 0.05 && checkedTargetHasHiddenBaseline(root, target, name);
    }
    if (/^(?:height|max-height|min-height)$/.test(name)) {
        return !isCollapsedDimensionValue(cleanValue) && checkedTargetHasHiddenBaseline(root, target, name);
    }
    if (name === 'clip-path')
        return /^(?:none|initial|inherit|unset)$/.test(cleanValue) && checkedTargetHasHiddenBaseline(root, target, name);
    if (name === 'content')
        return !/^(?:none|normal|['"]{0,2})$/.test(cleanValue);
    return false;
}
function isCheckedRuleVisualOnlyForTarget(root, target, styleMap) {
    return (styleMap || []).every(([property, value]) => {
        if (checkedDeclarationCreatesContentReveal(root, target, property, value))
            return false;
        const name = normalizeStylePropertyName(property);
        if (/^(?:display|visibility|opacity|height|max-height|min-height|clip-path)$/.test(name))
            return true;
        return isCheckedSelectionVisualProperty(name, value);
    });
}
function isUnresolvedCheckedDecoration(property, value) {
    const name = String(property || '').toLowerCase();
    if (/^(?:color|background-color|border-color|box-shadow|text-shadow|outline-color|font-weight|text-decoration-color)$/.test(name))
        return true;
    return name === 'background' && /^(?:#[a-f\d]{3,8}|(?:rgb|hsl)a?\([^()]+\)|[a-z]+)$/i.test(String(value || '').trim());
}
function nativeCheckedRuleStructuralTargets(input, rule) {
    const parent = input?.parentElement;
    const relation = String(rule?.relation || '').trim();
    const target = String(rule?.targetSelector || '').trim();
    if (!parent || !input.id || !target || !['+', '~'].includes(relation))
        return [];
    try {
        const escaped = globalThis.CSS?.escape ? CSS.escape(input.id) : input.id.replace(/([^\w-])/g, '\\$1');
        return [...parent.querySelectorAll(`:scope > #${escaped} ${relation} ${target}`)];
    }
    catch {
        return [];
    }
}
export function maintenanceCheckedInteractionDepth(root) {
    const controls = diagnosticQueryContentAll(root, 'input[type="checkbox"], input[type="radio"]');
    const selectionOnlyFallbackCount = diagnosticQueryContentAll(root, `[${SELECTION_ONLY_FALLBACK_ATTR}]`).length;
    if (!controls.length)
        return { checkedSelectionOnly: false, checkedSelectionOnlyRaw: false, checkedRuleCount: 0, meaningfulCheckedRuleCount: 0, selectionStyleRuleCount: 0, unresolvedCheckedRuleCount: 0, selectionOnlyFallbackCount };
    let checkedRuleCount = 0;
    let meaningfulCheckedRuleCount = 0;
    let selectionStyleRuleCount = 0;
    let unresolvedCheckedRuleCount = 0;
    let unresolvedCheckedVisualRuleCount = 0;
    const unresolvedRules = new Map();
    const resolvedRuleKeys = new Set();
    for (const input of controls) {
        const wrappingLabel = input.closest?.('label');
        for (const rule of parseCheckedRulesFromText(root, input)) {
            checkedRuleCount += 1;
            const ruleKey = `${rule.relation || ''}|${rule.targetSelector || ''}|${JSON.stringify(rule.styleMap || [])}`;
            let targets = resolveTargetsForCheckedRule(root, input, rule);
            if (!targets.length)
                targets = nativeCheckedRuleStructuralTargets(input, rule);
            if (!targets.length) {
                if (!unresolvedRules.has(ruleKey))
                    unresolvedRules.set(ruleKey, rule);
                continue;
            }
            resolvedRuleKeys.add(ruleKey);
            const onlySelectionSurface = targets.every(target => ((wrappingLabel && (target === wrappingLabel || wrappingLabel.contains?.(target)))
                || String(target.tagName || '').toLowerCase() === 'label'));
            const visualOnly = targets.every(target => isCheckedRuleVisualOnlyForTarget(root, target, rule.styleMap));
            if (onlySelectionSurface && visualOnly)
                selectionStyleRuleCount += 1;
            else
                meaningfulCheckedRuleCount += 1;
        }
    }
    for (const [ruleKey, rule] of unresolvedRules) {
        if (resolvedRuleKeys.has(ruleKey))
            continue;
        unresolvedCheckedRuleCount += 1;
        if (rule.styleMap.every(([property, value]) => isUnresolvedCheckedDecoration(property, value)))
            unresolvedCheckedVisualRuleCount += 1;
    }
    const detachedCheckedHasRuleCount = Number.parseInt(root.getAttribute?.(DETACHED_CHECKED_HAS_RULE_COUNT_ATTR) || '0', 10) || 0;
    if (detachedCheckedHasRuleCount > 0) {
        checkedRuleCount += detachedCheckedHasRuleCount;
        meaningfulCheckedRuleCount += detachedCheckedHasRuleCount;
    }
    const checkedSelectionOnlyRaw = checkedRuleCount > 0
        && unresolvedCheckedRuleCount === 0
        && meaningfulCheckedRuleCount === 0
        && selectionStyleRuleCount === checkedRuleCount
        && controls.length > 1;
    const checkedSelectionOnly = checkedSelectionOnlyRaw && selectionOnlyFallbackCount === 0;
    return { checkedSelectionOnly, checkedSelectionOnlyRaw, checkedRuleCount, meaningfulCheckedRuleCount, selectionStyleRuleCount, unresolvedCheckedRuleCount, unresolvedCheckedVisualRuleCount, unresolvedContentCheckedRuleCount: unresolvedCheckedRuleCount - unresolvedCheckedVisualRuleCount, selectionOnlyFallbackCount };
}
export function pseudoStateTargetSelector(selectorText) {
    return String(selectorText || '')
        .replace(/:(?:hover|active|focus-within|focus)\b/gi, '')
        .trim();
}
function pseudoStateOpacityReveal(root, selectorText, value) {
    const nextOpacity = Number.parseFloat(String(value || ''));
    if (!Number.isFinite(nextOpacity) || nextOpacity <= 0.05)
        return false;
    const selector = pseudoStateTargetSelector(selectorText);
    if (!selector || !root?.querySelectorAll)
        return false;
    try {
        return [...root.querySelectorAll(selector)].some(target => {
            const style = diagnosticComputedStyle(target);
            const current = Number.parseFloat(style?.opacity || '1');
            return Number.isFinite(current) && current <= 0.05;
        });
    }
    catch {
        return false;
    }
}
function pseudoStateMovesDecorativeNestedDetailsSummary(root, selectorText, property) {
    const name = normalizeStylePropertyName(property);
    if (!['left', 'right', 'top', 'bottom'].includes(name))
        return false;
    if (!/:hover\b/i.test(String(selectorText || '')))
        return false;
    const selector = pseudoStateTargetSelector(selectorText);
    if (!selector || !root?.querySelectorAll)
        return false;
    try {
        const targets = [...root.querySelectorAll(selector)];
        if (!targets.length)
            return false;
        return targets.every(target => {
            const summary = target.closest?.('summary');
            const details = summary?.parentElement;
            if (!summary || !details || details.tagName !== 'DETAILS')
                return false;
            const outerDetails = root.matches?.('details') ? root : root.querySelector?.(':scope > details');
            if (details === outerDetails)
                return false;
            if (String(target.textContent || '').trim())
                return false;
            const rect = layoutRect(target);
            const thinDecoration = !rect || Number(rect.height || 0) <= 16 || Number(rect.width || 0) <= 16;
            return thinDecoration;
        });
    }
    catch {
        return false;
    }
}
function isPseudoStateVisualOnlyProperty(root, selectorText, property, value) {
    const name = normalizeStylePropertyName(property);
    const normalizedValue = String(value || '').trim().toLowerCase();
    if (name === 'opacity')
        return !pseudoStateOpacityReveal(root, selectorText, normalizedValue);
    if (pseudoStateMovesDecorativeNestedDetailsSummary(root, selectorText, name))
        return true;
    return isCheckedSelectionVisualProperty(name, normalizedValue);
}
export function maintenancePseudoInteractionDepth(root) {
    let pseudoRuleCount = 0;
    let visualOnlyPseudoRuleCount = 0;
    let meaningfulPseudoRuleCount = 0;
    const blockRe = /([^{}]+)\{([^{}]*)\}/g;
    const declarationRe = /(^|;)\s*([a-z-]+)\s*:\s*([^;{}]+?)(?=;|$)/gi;
    for (const style of diagnosticQueryContentAll(root, 'style')) {
        if (style.hasAttribute?.(TOUCH_HOVER_STYLE_ATTR))
            continue;
        const cssText = String(style.textContent || '');
        blockRe.lastIndex = 0;
        let block;
        while ((block = blockRe.exec(cssText))) {
            const selectorText = String(block[1] || '').trim();
            if (!/:(?:hover|active|focus-within|focus)\b/i.test(selectorText))
                continue;
            for (const selector of selectorText.split(',').map(value => value.trim()).filter(Boolean)) {
                if (!/:(?:hover|active|focus-within|focus)\b/i.test(selector))
                    continue;
                const declarations = [];
                declarationRe.lastIndex = 0;
                let declaration;
                while ((declaration = declarationRe.exec(String(block[2] || '')))) {
                    declarations.push([declaration[2], declaration[3]]);
                }
                if (!declarations.length)
                    continue;
                pseudoRuleCount += 1;
                const visualOnly = declarations.every(([property, value]) => (isPseudoStateVisualOnlyProperty(root, selector, property, value)));
                if (visualOnly)
                    visualOnlyPseudoRuleCount += 1;
                else
                    meaningfulPseudoRuleCount += 1;
            }
        }
    }
    const touchHoverEligibleCount = diagnosticQueryContentAll(root, `[${TOUCH_HOVER_READY_ATTR}]`).length;
    const touchHoverActiveCount = diagnosticQueryContentAll(root, `[${TOUCH_HOVER_ATTR}="true"]`).length;
    return {
        pseudoRuleCount,
        visualOnlyPseudoRuleCount,
        meaningfulPseudoRuleCount,
        touchHoverEligibleCount,
        touchHoverActiveCount,
        pseudoVisualOnlyRaw: pseudoRuleCount > 0 && meaningfulPseudoRuleCount === 0,
    };
}
function recoveredInlineStateProgramCount(root) {
    if (!root?.querySelectorAll)
        return 0;
    const selector = [
        `[${CHANGE_PSEUDO_RESCUE_ATTR}]`,
        `[${INLINE_PSEUDO_RESCUE_ATTR}]`,
        `[${DIRECT_ID_CLICK_RESCUE_ATTR}]`,
        `[${DIRECT_ID_CLASS_STATE_RESCUE_ATTR}]`,
        `[${RAW_SELF_MUTATION_RESCUE_ATTR}]`,
        `[${RAW_NAMED_FUNCTION_RESCUE_ATTR}]`,
        `[${RAW_SCRIPT_TIMELINE_RESCUE_ATTR}]`,
        `[${RAW_RADIO_RESET_RESCUE_ATTR}]`,
        `[${PASSPORT_DOCUMENT_TRIGGER_RESCUE_ATTR}]`,
    ].join(',');
    return new Set([...root.querySelectorAll(selector)]).size;
}
export function maintenanceReachableInteractionEvidence(root, routeSummary, checkedDepth, pseudoDepth, raw) {
    if (!root?.querySelectorAll) {
        return { contentInteractiveElementCount: 0, installedInteractionRouteCount: 0, noInteractionStructure: false };
    }
    const outerDetails = root.matches?.('details') ? root : root.querySelector?.(':scope > details');
    const outerSummary = outerDetails?.querySelector?.(':scope > summary') || null;
    const interactiveSelector = [
        'button', 'input:not([type="hidden"])', 'select', 'textarea', 'a[href]',
        '[role="button"]', '[role="switch"]', '[role="tab"]', '[role="menuitem"]', '[role="radio"]',
        '[contenteditable="true"]', '[popovertarget]', '[commandfor]', '[tabindex]', 'summary',
    ].join(',');
    const contentInteractiveElementCount = diagnosticQueryContentAll(root, interactiveSelector)
        .filter(element => {
        if (outerSummary && (element === outerSummary || outerSummary.contains?.(element)))
            return false;
        if (element.matches?.(`[${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [${RECIPE_BUTTON_ATTR}], [${RESAY_ATTR}], [${TOOL_ENTRY_HOST_ATTR}]`))
            return false;
        return true;
    }).length;
    const installedInteractionRouteCount = Number(routeSummary.behavior || 0)
        + Number(routeSummary.nativePopover || 0)
        + Number(routeSummary.adjacent || 0)
        + Number(routeSummary.layers || 0)
        + Number(routeSummary.labelInternal || 0)
        + Number(routeSummary.labelAdjacent || 0)
        + Number(routeSummary.maskReveal || 0)
        + Number(routeSummary.listDetail || 0)
        + Number(routeSummary.stateSibling || 0)
        + Number(routeSummary.stateCrossTree || 0)
        + Number(routeSummary.buttonAdjacent || 0)
        + Number(routeSummary.clickableAdjacent || 0)
        + Number(routeSummary.clickablePopup || 0)
        + Number(routeSummary.checkedIdTarget || 0)
        + Number(routeSummary.focusToChecked || 0)
        + Number(routeSummary.checkedTextRule || 0)
        + Number(routeSummary.crossParentChecked || 0)
        + Number(routeSummary.checkedHasState || 0)
        + Number(routeSummary.detachedCheckedHas || 0)
        + Number(routeSummary.pairedCheckedState || 0)
        + Number(routeSummary.exclusiveStackedState || 0)
        + Number(routeSummary.channelDialCycle || 0)
        + Number(routeSummary.reversibleChecked || 0)
        + Number(routeSummary.containerReveal || 0)
        + Number(routeSummary.selfMutation || 0)
        + Number(routeSummary.classStateProgram || 0)
        + Number(routeSummary.scriptTimeline || 0)
        + Number(routeSummary.changeProgram || 0)
        + Number(routeSummary.focusWithinPersistent || 0)
        + Number(routeSummary.unlabeledChecked || 0)
        + Number(routeSummary.selectionFallback || 0)
        + Number(routeSummary.disabledChoice || 0)
        + Number(routeSummary.inertAction || 0)
        + Number(routeSummary.staticChoiceSelection || 0)
        + Number(routeSummary.structuredStaticDisclosure || 0)
        + Number(routeSummary.fillInChoice || 0)
        + Number(routeSummary.passportDocument || 0);
    const rawStateProgram = /\bon(?:click|change|input)\s*=|addEventListener\s*\(\s*['"](?:click|change|input)['"]|setAttribute\s*\(\s*['"]data-|classList\.(?:add|remove|toggle)|\.checked\s*=|:checked\b|:target\b/i.test(String(raw || ''));
    const nestedDetailsCount = diagnosticQueryContentAll(root, 'details').filter(details => details !== outerDetails).length;
    const staticChoiceCandidateCount = findStaticChoiceSelectionCandidates(root).length;
    const structuredStaticDisclosureCandidateCount = findStructuredStaticDisclosureCandidates(root).length;
    const fillInChoiceCandidateCount = findFillInChoiceCandidates(root)
        .reduce((sum, candidate) => sum + Number(candidate.blanks?.length || 0), 0);
    const noInteractionStructure = !rabbitMirrorTextPresentation(root) && contentInteractiveElementCount === 0
        && installedInteractionRouteCount === 0
        && staticChoiceCandidateCount === 0
        && structuredStaticDisclosureCandidateCount === 0
        && fillInChoiceCandidateCount === 0
        && Number(checkedDepth?.checkedRuleCount || 0) === 0
        && Number(pseudoDepth?.pseudoRuleCount || 0) === 0
        && nestedDetailsCount === 0
        && !rawStateProgram;
    return { contentInteractiveElementCount, installedInteractionRouteCount, noInteractionStructure };
}
function maintenanceKnownInteractionEvidence(root, full, code) {
    const raw = decodeHtmlEntities(getRawAssistantMessageForRenderedRoot(root) || '');
    const rawRoot = chooseMatchingRawRabbitMirrorRoot(raw, root);
    const rawMirrorHtml = String(rawRoot?.outerHTML || raw || '');
    const stateProgram = /\bon(?:click|change|input)\s*=|setAttribute\s*\(\s*['"]data-|classList\.(?:add|remove|toggle)|\.checked\s*=|:checked\b/i.test(rawMirrorHtml);
    const checkedControlsLost = !!full.stateControlsLost;
    const radioBranchCandidateCount = findRadioBranchCandidates(root).length;
    const radioBranchRepairCount = Number(root.getAttribute?.(RADIO_BRANCH_COUNT_ATTR) || 0);
    const unmappedNavigationButtonCount = findUnmappedNavigationButtons(root).length;
    const lostInlineStatePrograms = Math.max(0, Number((full.rawMirrorInlineEvents ?? full.rawInlineEvents) || 0) - Number((full.renderedMirrorInlineEvents ?? full.renderedInlineEvents) || 0));
    const recoveredInlineStatePrograms = recoveredInlineStateProgramCount(root);
    const strippedStateProgram = lostInlineStatePrograms > recoveredInlineStatePrograms && stateProgram;
    const decorativeOverlayCandidateCount = findDecorativeOverlayPassThroughCandidates(root).length;
    const scopeEvidence = maintenanceInteractionScopeEvidence(root);
    const checkedDepth = maintenanceCheckedInteractionDepth(root);
    const pseudoDepth = maintenancePseudoInteractionDepth(root);
    const routeSummary = diagnosticRouteSummary(root);
    const behavior = inspectBehaviorRecovery(root);
    const popup = inspectNativePopoverFallback(root);
    const nativePopoverMissingCount = popup.missingTargets;
    const nativePopoverUnwiredCount = popup.unwired;
    const behaviorRecoveryCandidateCount = behavior.candidates;
    const behaviorIncompleteCount = behavior.incomplete;
    const behaviorUnmappedRangeCount = behavior.unmappedRanges;
    const behaviorUnwiredCount = behavior.unwired;
    const behaviorWiredCount = behavior.wired;
    const otherRouteCount = Number(routeSummary.behavior || 0) + Number(routeSummary.nativePopover || 0) + routeSummary.adjacent + routeSummary.layers + routeSummary.labelInternal + routeSummary.labelAdjacent
        + routeSummary.maskReveal + routeSummary.listDetail + routeSummary.stateSibling + routeSummary.buttonAdjacent
        + routeSummary.clickableAdjacent + routeSummary.clickablePopup + routeSummary.checkedIdTarget + routeSummary.focusToChecked
        + routeSummary.checkedTextRule + routeSummary.crossParentChecked + routeSummary.checkedHasState + routeSummary.detachedCheckedHas + routeSummary.pairedCheckedState + routeSummary.expandedOpacity
        + routeSummary.reversibleChecked + routeSummary.radioReset
        + routeSummary.containerReveal + routeSummary.selfMutation + routeSummary.classStateProgram + routeSummary.scriptTimeline + routeSummary.changeProgram
        + routeSummary.focusWithinPersistent + routeSummary.unlabeledChecked + routeSummary.selectionFallback + routeSummary.disabledChoice + routeSummary.inertAction + routeSummary.staticChoiceSelection + routeSummary.structuredStaticDisclosure + routeSummary.fillInChoice + routeSummary.passportDocument;
    const innerDetailsCount = diagnosticQueryContentAll(root, 'details').length;
    const hasTargetRoute = !!root?.querySelector?.('a[href^="#"]') && /:target\b/i.test(raw);
    const hasPopoverRoute = !!root?.querySelector?.('[popovertarget], [commandfor], [popover]');
    const pseudoVisualOnly = pseudoDepth.pseudoVisualOnlyRaw
        && checkedDepth.meaningfulCheckedRuleCount === 0
        && otherRouteCount === 0
        && innerDetailsCount === 0
        && !hasTargetRoute
        && !hasPopoverRoute;
    const rawRootForCheckedClass = chooseMatchingRawRabbitMirrorRoot(raw, root);
    const missingCheckedSubjectClassCandidateCount = rawRootForCheckedClass
        ? parseMissingCheckedSubjectClassRules(rawRootForCheckedClass).length
        : 0;
    const missingCheckedSubjectClassRescueCount = Number.parseInt(root.getAttribute?.(MISSING_CHECKED_SUBJECT_CLASS_RESCUE_ATTR) || '0', 10) || 0;
    const missingCheckedSubjectClassMissingCount = Math.max(0, missingCheckedSubjectClassCandidateCount - missingCheckedSubjectClassRescueCount);
    const radioGroupInspection = inspectSanitizedRadioGroupLoss(root);
    const radioGroupLossCandidateCount = Number(radioGroupInspection.candidateCount) || 0;
    const radioGroupRescueCount = Number(radioGroupInspection.rescuedCount) || 0;
    const selectionOnlyRepairCandidateCount = checkedDepth.checkedSelectionOnly
        ? findSelectionOnlyRadioFallbackCandidates(root).length
        : 0;
    const crossParentCheckedCandidates = findCrossParentCheckedRuleFallbackCandidates(root);
    const crossParentCheckedRuleVerifiedCount = crossParentCheckedCandidates
        .filter(candidate => crossParentCheckedCandidateVerified(candidate))
        .length;
    const crossParentControlReachable = input => {
        const labels = [...(input.labels || [])];
        const wrapping = input.closest?.('label');
        if (wrapping && !labels.includes(wrapping))
            labels.push(wrapping);
        return labels.some(label => label.getClientRects?.().length > 0);
    };
    const crossParentCheckedRuleCandidateCount = crossParentCheckedCandidates
        .filter(candidate => !candidate.input.hasAttribute(CROSS_PARENT_CHECKED_RULE_RESCUE_ATTR)
        || !crossParentCheckedCandidateVerified(candidate))
        .filter(candidate => crossParentControlReachable(candidate.input))
        .length;
    const checkedHasStateRuleCandidateCount = parseBrokenCheckedHasStateRules(root).length;
    const checkedHasStateRuleRescueCount = Number.parseInt(root.getAttribute?.(CHECKED_HAS_STATE_RULE_COUNT_ATTR) || '0', 10) || 0;
    const checkedHasStateRuleMissingCount = Math.max(0, checkedHasStateRuleCandidateCount - checkedHasStateRuleRescueCount);
    const detachedCheckedHasRuleCandidateCount = parseDetachedCheckedHasRules(root).length;
    const detachedCheckedHasRuleRescueCount = Number.parseInt(root.getAttribute?.(DETACHED_CHECKED_HAS_RULE_COUNT_ATTR) || '0', 10) || 0;
    const detachedCheckedHasRuleMissingCount = Math.max(0, detachedCheckedHasRuleCandidateCount - detachedCheckedHasRuleRescueCount);
    const pairedCheckedStateCandidateCount = findPairedCheckedStateCandidates(root).length;
    const pairedCheckedStateRescueCount = Number.parseInt(root.getAttribute?.(PAIRED_CHECKED_STATE_COUNT_ATTR) || '0', 10) || 0;
    const pairedCheckedStateMissingCount = Math.max(0, pairedCheckedStateCandidateCount - pairedCheckedStateRescueCount);
    const exclusiveStackedStateCandidateCount = findExclusiveStackedStateCandidates(root).length;
    const exclusiveStackedStateRescueCount = Number.parseInt(root.getAttribute?.(EXCLUSIVE_STACKED_STATE_COUNT_ATTR) || '0', 10) || 0;
    const exclusiveStackedStateMissingCount = Math.max(0, exclusiveStackedStateCandidateCount - exclusiveStackedStateRescueCount);
    const channelDialCycleCandidateCount = findChannelDialCycleCandidates(root).length;
    const channelDialCycleRescueCount = Number.parseInt(root.getAttribute?.(CHANNEL_DIAL_CYCLE_COUNT_ATTR) || '0', 10) || 0;
    const channelDialCycleMissingCount = Math.max(0, channelDialCycleCandidateCount - channelDialCycleRescueCount);
    const oneWayCheckedResultCandidateCount = findOneWayCheckedResultCandidates(root)
        .filter(candidate => !candidate.target?.hasAttribute?.(REVERSIBLE_CHECKED_RESULT_TARGET_ATTR))
        .length;
    const reversibleCheckedResultRescueCount = Number.parseInt(root.getAttribute?.(REVERSIBLE_CHECKED_RESULT_ROOT_ATTR) || '0', 10) || 0;
    const disabledOnlyChoiceCandidateCount = findDisabledOnlyChoiceGroupCandidates(root).length;
    const inertActionButtonCandidateCount = findInertActionButtonCandidates(root).length;
    const staticChoiceSelectionCandidateCount = findStaticChoiceSelectionCandidates(root).length;
    const staticChoiceSelectionRescueCount = Number.parseInt(root.getAttribute?.(STATIC_CHOICE_SELECTION_COUNT_ATTR) || '0', 10) || 0;
    const structuredStaticDisclosureCandidateCount = otherRouteCount === 0
        && checkedDepth.meaningfulCheckedRuleCount === 0
        && pseudoDepth.meaningfulPseudoRuleCount === 0
        ? findStructuredStaticDisclosureCandidates(root).length
        : 0;
    const structuredStaticDisclosureRescueCount = Number.parseInt(root.getAttribute?.(STRUCTURED_STATIC_DISCLOSURE_COUNT_ATTR) || '0', 10) || 0;
    const fillInChoiceCandidateCount = findFillInChoiceCandidates(root)
        .reduce((sum, candidate) => sum + Number(candidate.blanks?.length || 0), 0);
    const fillInChoiceRescueCount = Number.parseInt(root.getAttribute?.(FILL_IN_CHOICE_COUNT_ATTR) || '0', 10) || 0;
    const focusWithinPersistentCandidateCount = findFocusWithinPersistentCandidates(root).length;
    const focusWithinPersistentRescueCount = Number(routeSummary.focusWithinPersistent || 0);
    const focusWithinPersistentMissingCount = Math.max(0, focusWithinPersistentCandidateCount - focusWithinPersistentRescueCount);
    const rawScriptTimelineCandidateCount = collectSafeRawScriptTimelinePrograms(root).length;
    const rawScriptTimelineRescueCount = Number(routeSummary.scriptTimeline || 0);
    const rawScriptTimelineMissingCount = Math.max(0, rawScriptTimelineCandidateCount - rawScriptTimelineRescueCount);
    const touchHoverMissing = !checkedDepth.checkedSelectionOnly
        && isLikelyTouchDevice()
        && pseudoDepth.meaningfulPseudoRuleCount > 0
        && focusWithinPersistentCandidateCount === 0
        && !root.querySelector?.(`[${TOUCH_HOVER_STYLE_ATTR}]`)
        && root.getAttribute?.('data-rabbit-mirror-touch-hover-fallback') !== 'true';
    const unscopedControls = (full.inputCount > 0 || full.buttonCount > 0)
        && root.dataset?.rabbitMirrorInteractionScoped !== 'true';
    const reachability = maintenanceReachableInteractionEvidence(root, routeSummary, checkedDepth, pseudoDepth, raw);
    return { behaviorRecoveredCount: behavior.classRepaired, behaviorRelayedCount: Number(root.getAttribute?.(BEHAVIOR_RELAY_ATTR)) || 0, behaviorReverseCount: Number(root.getAttribute?.(BEHAVIOR_REVERSE_ATTR)) || 0, radioBranchCandidateCount, radioBranchRepairCount, unmappedNavigationButtonCount, nativePopoverMissingCount, nativePopoverUnwiredCount, behaviorRecoveryCandidateCount, behaviorIncompleteCount, behaviorUnmappedRangeCount, behaviorUnwiredCount, behaviorWiredCount, checkedControlsLost, stateControlsLost: !!full.stateControlsLost, strippedStateProgram, lostInlineStatePrograms, recoveredInlineStatePrograms, decorativeOverlayCandidateCount, touchHoverMissing, unscopedControls, missingCheckedSubjectClassCandidateCount, missingCheckedSubjectClassRescueCount, missingCheckedSubjectClassMissingCount, radioGroupLossCandidateCount, radioGroupRescueCount, selectionOnlyRepairCandidateCount, disabledOnlyChoiceCandidateCount, inertActionButtonCandidateCount, staticChoiceSelectionCandidateCount, staticChoiceSelectionRescueCount, structuredStaticDisclosureCandidateCount, structuredStaticDisclosureRescueCount, fillInChoiceCandidateCount, fillInChoiceRescueCount, focusWithinPersistentCandidateCount, focusWithinPersistentRescueCount, focusWithinPersistentMissingCount, rawScriptTimelineCandidateCount, rawScriptTimelineRescueCount, rawScriptTimelineMissingCount, crossParentCheckedRuleCandidateCount, crossParentCheckedRuleVerifiedCount, checkedHasStateRuleCandidateCount, checkedHasStateRuleRescueCount, checkedHasStateRuleMissingCount, detachedCheckedHasRuleCandidateCount, detachedCheckedHasRuleRescueCount, detachedCheckedHasRuleMissingCount, pairedCheckedStateCandidateCount, pairedCheckedStateRescueCount, pairedCheckedStateMissingCount, exclusiveStackedStateCandidateCount, exclusiveStackedStateRescueCount, exclusiveStackedStateMissingCount, channelDialCycleCandidateCount, channelDialCycleRescueCount, channelDialCycleMissingCount, oneWayCheckedResultCandidateCount, reversibleCheckedResultRescueCount, pseudoVisualOnly, raw, ...scopeEvidence, ...checkedDepth, ...pseudoDepth, ...reachability };
}
function maintenanceStyleRuleCountFromText(cssText) {
    return (String(cssText || '').match(/[^@{}][^{}]*\{[^{}]*\}/g) || []).length;
}
function maintenanceStylelessAuthoredRuleCount(root) {
    let rendered = 0;
    let renderedStateVisual = 0;
    for (const style of root?.querySelectorAll?.('style') || []) {
        if ([...(style.attributes || [])].some(attribute => /^data-rabbit-mirror-/i.test(attribute.name)))
            continue;
        const cssText = String(style.textContent || '');
        rendered += maintenanceStyleRuleCountFromText(cssText);
        renderedStateVisual += countMeaningfulStateVisualRules(cssText);
    }
    let raw = 0;
    let rawStateVisual = 0;
    try {
        const decodedRaw = decodeHtmlEntities(String(getRawAssistantMessageForRenderedRoot(root) || ''));
        const isolated = extractMaintenanceMirrorSourceBySummary(decodedRaw, root) || decodedRaw;
        const css = [...String(isolated || '').matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)]
            .map(match => String(match[1] || ''))
            .join('\n');
        raw = maintenanceStyleRuleCountFromText(css);
        rawStateVisual = countMeaningfulStateVisualRules(css);
    }
    catch { }
    return {
        rendered,
        raw,
        total: Math.max(rendered, raw),
        renderedStateVisual,
        rawStateVisual,
        stateVisual: Math.max(renderedStateVisual, rawStateVisual),
    };
}
function maintenanceStylelessComputedVisualMaturity(elements = []) {
    let computedVisualCount = 0;
    let computedVisualSignalCount = 0;
    let inlineStructuralVisualCount = 0;
    for (const element of elements || []) {
        if (!element?.getAttribute || element.matches?.('input,button,select,textarea,label,img,svg,canvas,video,audio,iframe,object,embed'))
            continue;
        const inline = String(element.getAttribute('style') || '').toLowerCase();
        const strongInlineVisual = [
            /(?:^|;)\s*background(?:-color|-image)?\s*:/,
            /(?:^|;)\s*border(?:-[\w-]+)?\s*:/,
            /(?:^|;)\s*box-shadow\s*:/,
            /(?:^|;)\s*border-radius\s*:/,
            /(?:^|;)\s*display\s*:\s*(?:flex|grid|inline-flex|inline-grid)\b/,
        ].some(pattern => pattern.test(inline));
        if (strongInlineVisual)
            inlineStructuralVisualCount += 1;
        const style = maintenanceMobileLayoutComputedStyle(element);
        if (!style)
            continue;
        let signals = 0;
        const background = String(style.backgroundColor || '').toLowerCase();
        if (!/(?:^|;)\s*background(?:-color|-image)?\s*:/.test(inline)
            && background && background !== 'transparent' && background !== 'rgba(0, 0, 0, 0)')
            signals += 1;
        const borderWidth = Math.max(Number.parseFloat(style.borderTopWidth || '0') || 0, Number.parseFloat(style.borderRightWidth || '0') || 0, Number.parseFloat(style.borderBottomWidth || '0') || 0, Number.parseFloat(style.borderLeftWidth || '0') || 0);
        if (!/(?:^|;)\s*border(?:-[\w-]+)?\s*:/.test(inline) && borderWidth >= 1)
            signals += 1;
        if (!/(?:^|;)\s*box-shadow\s*:/.test(inline) && String(style.boxShadow || '').toLowerCase() !== 'none')
            signals += 1;
        const radius = Math.max(Number.parseFloat(style.borderTopLeftRadius || '0') || 0, Number.parseFloat(style.borderTopRightRadius || '0') || 0, Number.parseFloat(style.borderBottomLeftRadius || '0') || 0, Number.parseFloat(style.borderBottomRightRadius || '0') || 0);
        if (!/(?:^|;)\s*border-radius\s*:/.test(inline) && radius >= 4)
            signals += 1;
        const display = String(style.display || '').toLowerCase();
        if (!/(?:^|;)\s*display\s*:/.test(inline) && /^(?:flex|grid|inline-flex|inline-grid)$/.test(display))
            signals += 1;
        const padding = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']
            .reduce((sum, key) => sum + (Number.parseFloat(style[key] || '0') || 0), 0);
        if (!/(?:^|;)\s*padding(?:-[\w-]+)?\s*:/.test(inline) && padding >= 16)
            signals += 1;
        if (signals >= 2)
            computedVisualCount += 1;
        computedVisualSignalCount += signals;
    }
    return { computedVisualCount, computedVisualSignalCount, inlineStructuralVisualCount };
}
function maintenanceStylelessStructuredInfo(root, full = null) {
    const empty = {
        candidate: false,
        authoredRuleCount: 0,
        textLength: 0,
        elementCount: 0,
        classedCount: 0,
        distinctClassCount: 0,
        inlineStyledCount: 0,
        inlineDeclarationCount: 0,
        richInlineCount: 0,
        inlineStructuralVisualCount: 0,
        computedVisualCount: 0,
        computedVisualSignalCount: 0,
        formControlCount: 0,
        meaningfulFormControlCount: 0,
        choiceControlCount: 0,
        nonChoiceFormControlCount: 0,
        stateVisualRuleCount: 0,
    };
    if (!root?.querySelectorAll || root.hasAttribute?.(STYLELESS_STRUCTURED_RESCUE_ATTR))
        return empty;
    const details = root.matches?.('details') ? root : root.querySelector?.('details');
    if (!details)
        return empty;
    const authored = maintenanceStylelessAuthoredRuleCount(root);
    const boundedTree = collectBoundedElementDescendants(details, STYLELESS_STRUCTURED_MAX_DESCENDANTS);
    if (boundedTree.exceeded)
        return empty;
    const elements = boundedTree.elements.filter(element => {
        const tag = String(element.tagName || '').toLowerCase();
        if (!tag || ['summary', 'style', 'script', 'template', 'br'].includes(tag))
            return false;
        return !maintenanceMobileLayoutIsInternal(element);
    });
    const textLength = Number(full?.rawBodyTextLength || full?.renderedBodyTextLength || maintenanceMobileLayoutTextLength(details) || 0);
    const elementCount = Number(full?.rawBodyElementCount || full?.renderedBodyElementCount || elements.length || 0);
    const visualProgramCount = Math.max(Number(full?.rawBodyVisualProgramCount || 0), Number(full?.renderedBodyVisualProgramCount || 0));
    const semanticElementCount = Math.max(Number(full?.rawBodySemanticElementCount || 0), Number(full?.renderedBodySemanticElementCount || 0));
    const classed = elements.filter(element => String(element.getAttribute?.('class') || '').trim());
    const distinctClasses = new Set(classed.flatMap(element => String(element.getAttribute('class') || '').split(/\s+/).filter(Boolean)));
    let inlineStyledCount = 0;
    let inlineDeclarationCount = 0;
    const richInlineCount = elements.filter(element => {
        const style = String(element.getAttribute?.('style') || '');
        if (style.trim())
            inlineStyledCount += 1;
        const declarations = (style.match(/(?:^|;)\s*[-\w]+\s*:/g) || []).length;
        inlineDeclarationCount += declarations;
        return declarations >= 5 || /(?:background(?:-image)?\s*:[^;]*(?:url\(|gradient\()|mask(?:-image)?\s*:|clip-path\s*:|filter\s*:)/i.test(style);
    }).length;
    const maturity = maintenanceStylelessComputedVisualMaturity(elements);
    const formControls = elements.filter(control => control.matches?.('input,button,select,textarea'));
    const formControlCount = formControls.length;
    const controlKinds = analyzeStylelessControlKinds(formControls.map(control => ({
        tagName: String(control.tagName || '').toLowerCase(),
        type: String(control.getAttribute?.('type') || control.type || '').toLowerCase(),
    })));
    const meaningfulFormControlCount = formControls.filter(control => {
        if (control.matches?.('button,select,textarea'))
            return maintenanceMobileLayoutTextLength(control) >= 1 || !!control.getAttribute?.('aria-label');
        if (!control.id)
            return false;
        let label = null;
        try {
            label = details.querySelector(`label[for="${cssEscape(control.id)}"]`);
        }
        catch { }
        return maintenanceMobileLayoutTextLength(label) >= 2 || !!control.getAttribute?.('aria-label');
    }).length;
    const namedStructure = classed.length >= 5 && distinctClasses.size >= 5;
    const bareChoiceNarrative = controlKinds.choiceCount >= 2
        && controlKinds.safeChoiceOnly
        && elementCount >= 8;
    const candidate = textLength >= 140
        && elementCount >= 8
        && semanticElementCount >= 1
        && visualProgramCount === 0
        && (namedStructure || bareChoiceNarrative)
        && inlineStyledCount <= 2
        && inlineDeclarationCount <= 9
        && richInlineCount === 0
        && maturity.inlineStructuralVisualCount === 0
        && maturity.computedVisualSignalCount === 0
        && controlKinds.safeChoiceOnly;
    return {
        candidate,
        authoredRuleCount: authored.total,
        textLength,
        elementCount,
        classedCount: classed.length,
        distinctClassCount: distinctClasses.size,
        inlineStyledCount,
        inlineDeclarationCount,
        richInlineCount,
        inlineStructuralVisualCount: maturity.inlineStructuralVisualCount,
        computedVisualCount: maturity.computedVisualCount,
        computedVisualSignalCount: maturity.computedVisualSignalCount,
        formControlCount,
        meaningfulFormControlCount,
        choiceControlCount: controlKinds.choiceCount,
        nonChoiceFormControlCount: controlKinds.nonChoiceCount,
        stateVisualRuleCount: authored.stateVisual,
    };
}
function maintenanceStylelessStructuredCss() {
    return `
[${STYLELESS_STRUCTURED_RESCUE_ATTR}] [${STYLELESS_STRUCTURED_SHELL_ATTR}] { width:100% !important; max-width:760px !important; min-width:0 !important; margin:8px auto !important; padding:clamp(10px,3vw,18px) clamp(4px,2vw,12px) !important; box-sizing:border-box !important; border:0 !important; border-radius:0 !important; background:transparent !important; box-shadow:none !important; overflow:visible !important; line-height:1.72 !important; }
[${STYLELESS_STRUCTURED_RESCUE_ATTR}] [${STYLELESS_STRUCTURED_HEADER_ATTR}] { display:block !important; margin:0 0 14px !important; padding:0 0 9px !important; border:0 !important; border-bottom:1px solid color-mix(in srgb,currentColor 24%,transparent) !important; border-radius:0 !important; background:transparent !important; box-shadow:none !important; }
[${STYLELESS_STRUCTURED_RESCUE_ATTR}] [${STYLELESS_STRUCTURED_TITLE_ATTR}] { display:block !important; margin:0 0 6px !important; font-size:clamp(1.08rem,4.8vw,1.45rem) !important; line-height:1.3 !important; font-weight:800 !important; letter-spacing:.02em !important; overflow-wrap:anywhere !important; }
[${STYLELESS_STRUCTURED_RESCUE_ATTR}] [${STYLELESS_STRUCTURED_SUBTITLE_ATTR}] { display:block !important; margin:0 0 10px !important; font-size:.88em !important; line-height:1.55 !important; opacity:.76 !important; overflow-wrap:anywhere !important; }
[${STYLELESS_STRUCTURED_RESCUE_ATTR}] [${STYLELESS_STRUCTURED_SECTION_ATTR}] { display:block !important; width:100% !important; max-width:100% !important; min-width:0 !important; margin:13px 0 !important; padding:0 !important; box-sizing:border-box !important; border:0 !important; border-radius:0 !important; background:transparent !important; box-shadow:none !important; overflow:visible !important; }
[${STYLELESS_STRUCTURED_RESCUE_ATTR}] [${STYLELESS_STRUCTURED_TEXT_ATTR}] { max-width:100% !important; min-width:0 !important; line-height:1.75 !important; overflow-wrap:anywhere !important; word-break:break-word !important; }
[${STYLELESS_STRUCTURED_RESCUE_ATTR}] [${STYLELESS_STRUCTURED_CHOICE_ATTR}] { inline-size:18px !important; block-size:18px !important; margin:2px 8px 2px 2px !important; vertical-align:middle !important; accent-color:currentColor !important; }
[${STYLELESS_STRUCTURED_RESCUE_ATTR}] [${STYLELESS_STRUCTURED_CHOICE_LABEL_ATTR}] { display:inline-flex !important; align-items:center !important; gap:7px !important; min-height:32px !important; max-width:100% !important; margin:2px 10px 2px 0 !important; overflow-wrap:anywhere !important; }
`;
}
function installMaintenanceStylelessStructuredRescue(root) {
    if (!root?.querySelectorAll || !root?.isConnected)
        return 0;
    const full = diagnosticFullChainSummary(root, diagnosticCodeRescueSummary(root));
    const info = maintenanceStylelessStructuredInfo(root, full);
    if (!info.candidate)
        return 0;
    const details = root.matches?.('details') ? root : root.querySelector?.('details');
    if (!details)
        return 0;
    const direct = [...details.children].filter(child => {
        const tag = String(child.tagName || '').toLowerCase();
        return tag && !['summary', 'style', 'script', 'template'].includes(tag) && !maintenanceMobileLayoutIsInternal(child);
    });
    const shell = direct.find(child => maintenanceMobileLayoutTextLength(child) >= 80 && Number(child.childElementCount || 0) >= 2) || direct[0];
    if (!shell)
        return 0;
    const marked = new Set();
    const mark = (element, attr) => {
        if (!element?.setAttribute || element.hasAttribute(attr))
            return;
        element.setAttribute(attr, 'true');
        marked.add(element);
    };
    mark(shell, STYLELESS_STRUCTURED_SHELL_ATTR);
    for (const element of [shell, ...shell.querySelectorAll('*')]) {
        if (maintenanceMobileLayoutIsInternal(element))
            continue;
        const signature = `${element.id || ''} ${element.className || ''} ${element.getAttribute?.('role') || ''}`.toLowerCase();
        if (/(?:^|[-_\s])(?:header|masthead|head)(?:$|[-_\s])/.test(signature))
            mark(element, STYLELESS_STRUCTURED_HEADER_ATTR);
        if (/(?:^|[-_\s])(?:title|heading|headline)(?:$|[-_\s])/.test(signature))
            mark(element, STYLELESS_STRUCTURED_TITLE_ATTR);
        if (/(?:^|[-_\s])(?:subtitle|sub-title|subhead|kicker|meta)(?:$|[-_\s])/.test(signature))
            mark(element, STYLELESS_STRUCTURED_SUBTITLE_ATTR);
        if (/(?:^|[-_\s])(?:box|panel|section|speech|confession|track|card|note)(?:$|[-_\s])/.test(signature))
            mark(element, STYLELESS_STRUCTURED_SECTION_ATTR);
        if (/(?:^|[-_\s])(?:text|content|speech|confession|rhyme|desc|description|body)(?:$|[-_\s])/.test(signature)
            || element.matches?.('p,blockquote,li'))
            mark(element, STYLELESS_STRUCTURED_TEXT_ATTR);
    }
    for (const control of shell.querySelectorAll('input[type="radio"],input[type="checkbox"]')) {
        mark(control, STYLELESS_STRUCTURED_CHOICE_ATTR);
        let label = control.closest?.('label') || null;
        if (!label && control.id) {
            try {
                label = shell.querySelector(`label[for="${cssEscape(control.id)}"]`);
            }
            catch { }
        }
        if (label)
            mark(label, STYLELESS_STRUCTURED_CHOICE_LABEL_ATTR);
    }
    let style = root.querySelector(`style[${STYLELESS_STRUCTURED_STYLE_ATTR}]`);
    if (!style) {
        style = document.createElement('style');
        style.setAttribute(STYLELESS_STRUCTURED_STYLE_ATTR, 'true');
        root.appendChild(style);
    }
    style.textContent = maintenanceStylelessStructuredCss();
    root.setAttribute(STYLELESS_STRUCTURED_RESCUE_ATTR, 'true');
    root.setAttribute(STYLELESS_STRUCTURED_COUNT_ATTR, String(marked.size));
    return Math.max(1, marked.size);
}
function maintenanceFallbackFullSummary(root) {
    const body = diagnosticMessageBody(root) || root;
    const snapshot = diagnosticContentSnapshot(body);
    const renderedHtml = snapshot.html;
    const renderedText = snapshot.text;
    const styleTexts = diagnosticQueryContentAll(body, 'style').map(style => String(style.textContent || '')).join('\n');
    return {
        renderedEscapedTags: /&lt;\/?[a-z]/i.test(renderedHtml) || /<toto\b/i.test(renderedText),
        structureTruncated: false,
        damagedDataUriCandidate: false,
        sourceCandidate: false,
        hostCssParserError: false,
        hostCssParserErrorText: '',
        rawUnencodedSvgDataUri: false,
        rawCssCommentCount: 0,
        rawCssIdSelectorCount: 0,
        severeStructureLoss: false,
        visibleBodyMissing: false,
        rawSourceBodyMissing: false,
        rawCssTruncated: false,
        rawBodyTagCount: 0,
        rawBodyTextLength: 0,
        rawBodyElementCount: 0,
        rawBodySemanticElementCount: 0,
        rawBodyVisualProgramCount: 0,
        rawBodyEmptyShell: false,
        sourceTruncationNoticeInstalled: false,
        renderedBodyElementCount: 0,
        renderedBodyTextLength: 0,
        renderedBodySemanticElementCount: 0,
        renderedBodyVisualProgramCount: 0,
        renderedBodyEmptyShell: false,
        languageForeignDominant: false,
        languageHanChars: 0,
        languageLatinLetters: 0,
        languageForeignWordCount: 0,
        languageForeignWords: [],
        rawToto: false,
        rawHtml: false,
        controlsLost: false,
        checkedCount: (styleTexts.match(/:checked\b/gi) || []).length,
        rawInlineEvents: 0,
        renderedInlineEvents: 0,
        hoverCount: (styleTexts.match(/:hover\b/gi) || []).length,
        activeCount: (styleTexts.match(/:active\b/gi) || []).length,
        inputCount: body?.querySelectorAll?.('input,select,textarea')?.length || 0,
        buttonCount: body?.querySelectorAll?.('button')?.length || 0,
    };
}
function parseComputedRgbColor(value) {
    const text = String(value || '').trim().toLowerCase();
    if (!text || text === 'transparent')
        return null;
    const match = text.match(/^rgba?\(\s*([\d.]+)(?:\s*,\s*|\s+)([\d.]+)(?:\s*,\s*|\s+)([\d.]+)(?:\s*(?:,|\/)\s*([\d.]+%?))?\s*\)$/i);
    if (!match)
        return null;
    const alphaText = String(match[4] || '1');
    const alpha = alphaText.endsWith('%') ? Number.parseFloat(alphaText) / 100 : Number.parseFloat(alphaText);
    return {
        r: Math.max(0, Math.min(255, Number.parseFloat(match[1]) || 0)),
        g: Math.max(0, Math.min(255, Number.parseFloat(match[2]) || 0)),
        b: Math.max(0, Math.min(255, Number.parseFloat(match[3]) || 0)),
        a: Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : 1,
    };
}
function compositeReadableColor(foreground, background, alpha = 1) {
    const a = Math.max(0, Math.min(1, Number(alpha) || 0));
    return {
        r: foreground.r * a + background.r * (1 - a),
        g: foreground.g * a + background.g * (1 - a),
        b: foreground.b * a + background.b * (1 - a),
        a: 1,
    };
}
function readableRelativeLuminance(color) {
    if (!color)
        return 0;
    const channel = value => {
        const normalized = Math.max(0, Math.min(255, Number(value) || 0)) / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}
function readableContrastRatio(a, b) {
    const l1 = readableRelativeLuminance(a);
    const l2 = readableRelativeLuminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
function directReadableTextLength(element) {
    if (!element?.childNodes)
        return 0;
    return [...element.childNodes]
        .filter(node => node?.nodeType === 3)
        .map(node => String(node.textContent || '').replace(/\s+/g, ' ').trim())
        .join(' ')
        .trim().length;
}
function effectiveReadableOpacity(element, root) {
    let opacity = 1;
    for (let current = element; current && current.nodeType === 1; current = current.parentElement) {
        let style = null;
        try {
            style = globalThis.getComputedStyle?.(current) || null;
        }
        catch { }
        const local = Number.parseFloat(style?.opacity || '1');
        if (Number.isFinite(local))
            opacity *= Math.max(0, Math.min(1, local));
        if (current === root)
            break;
    }
    return opacity;
}
function effectiveReadableBackground(element, root) {
    const layers = [];
    let foundOpaque = false;
    for (let current = element; current && current.nodeType === 1; current = current.parentElement) {
        let style = null;
        try {
            style = globalThis.getComputedStyle?.(current) || null;
        }
        catch { }
        const parsed = parseComputedRgbColor(style?.backgroundColor);
        const backgroundImage = String(style?.backgroundImage || 'none').trim().toLowerCase();
        if (backgroundImage && backgroundImage !== 'none' && (!parsed || parsed.a < 0.82))
            return null;
        if (parsed && parsed.a > 0.02) {
            layers.push(parsed);
            if (parsed.a >= 0.96) {
                foundOpaque = true;
                break;
            }
        }
        if (current === root)
            break;
    }
    if (!layers.length || !foundOpaque)
        return null;
    let background = { r: layers[layers.length - 1].r, g: layers[layers.length - 1].g, b: layers[layers.length - 1].b, a: 1 };
    for (let index = layers.length - 2; index >= 0; index -= 1) {
        background = compositeReadableColor(layers[index], background, layers[index].a);
    }
    return background;
}
function severeTextContrastCandidate(element, root) {
    if (!element || element === root || element.closest?.(`[${TOOL_ENTRY_HOST_ATTR}]`))
        return null;
    if (element.closest?.('summary'))
        return null;
    if (element.closest?.('[data-rm-spoiler]:not([data-rm-revealed="true"])'))
        return null;
    const tag = String(element.tagName || '').toUpperCase();
    if (['STYLE', 'SCRIPT', 'TEMPLATE', 'NOSCRIPT', 'SVG', 'PATH', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tag))
        return null;
    const textLength = directReadableTextLength(element);
    if (textLength < 8 && !['BUTTON', 'LABEL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tag))
        return null;
    let style = null;
    try {
        style = globalThis.getComputedStyle?.(element) || null;
    }
    catch {
        return null;
    }
    if (!style || style.display === 'none' || style.visibility === 'hidden')
        return null;
    const effectiveOpacity = effectiveReadableOpacity(element, root);
    if (!Number.isFinite(effectiveOpacity) || effectiveOpacity < 0.6)
        return null;
    const foreground = parseComputedRgbColor(style.color);
    const background = effectiveReadableBackground(element, root);
    if (!foreground || !background)
        return null;
    const effectiveForeground = compositeReadableColor(foreground, background, Math.max(0, Math.min(1, foreground.a * effectiveOpacity)));
    const ratio = readableContrastRatio(effectiveForeground, background);
    if (ratio >= 2.05)
        return null;
    return { element, ratio, foreground, background, effectiveOpacity, textLength };
}
export function findSevereTextContrastCandidates(root, limit = 80) {
    if (!root?.querySelectorAll || typeof globalThis.getComputedStyle !== 'function')
        return [];
    const selector = 'p,li,blockquote,h1,h2,h3,h4,h5,h6,span,strong,em,b,i,label,button,td,th,dt,dd,figcaption,small,div,section,article';
    const result = [];
    for (const element of root.querySelectorAll(selector)) {
        const candidate = severeTextContrastCandidate(element, root);
        if (!candidate)
            continue;
        result.push(candidate);
        if (result.length >= Math.max(1, Number(limit) || 80))
            break;
    }
    return result;
}
function readableForegroundForBackground(original, background, targetRatio = 4.2) {
    const dark = { r: 18, g: 18, b: 20, a: 1 };
    const light = { r: 248, g: 248, b: 248, a: 1 };
    const target = readableRelativeLuminance(background) > 0.42 ? dark : light;
    let best = target;
    for (let step = 1; step <= 20; step += 1) {
        const t = step / 20;
        const mixed = {
            r: original.r * (1 - t) + target.r * t,
            g: original.g * (1 - t) + target.g * t,
            b: original.b * (1 - t) + target.b * t,
            a: 1,
        };
        if (readableContrastRatio(mixed, background) >= targetRatio) {
            best = mixed;
            break;
        }
    }
    return best;
}
function repairSevereTextContrast(root) {
    const candidates = findSevereTextContrastCandidates(root);
    if (!candidates.length) {
        root?.removeAttribute?.(TEXT_CONTRAST_RESCUE_ROOT_ATTR);
        return 0;
    }
    let repaired = 0;
    for (const candidate of candidates) {
        const element = candidate.element;
        if (!element?.isConnected || !root.contains?.(element))
            continue;
        const next = readableForegroundForBackground(candidate.foreground, candidate.background, 4.2);
        element.style?.setProperty?.('color', `rgb(${Math.round(next.r)}, ${Math.round(next.g)}, ${Math.round(next.b)})`, 'important');
        element.setAttribute?.(TEXT_CONTRAST_RESCUE_ATTR, 'true');
        repaired += 1;
    }
    if (repaired)
        root.setAttribute?.(TEXT_CONTRAST_RESCUE_ROOT_ATTR, String(repaired));
    return repaired;
}
function createMaintenanceFinding({ id, stage, label, evidence = [], mode, confidence = 1 }) {
    return {
        id: String(id || ''),
        stage: String(stage || 'structure'),
        label: String(label || ''),
        evidence: (Array.isArray(evidence) ? evidence : [evidence]).map(value => String(value || '')).filter(Boolean),
        mode: String(mode || ''),
        confidence: Math.max(0, Math.min(1, Number(confidence) || 0)),
    };
}
function maintenanceFindingKey(finding) {
    return `${finding?.stage || ''}:${finding?.id || ''}`;
}
function dedupeMaintenanceFindings(findings) {
    const map = new Map();
    for (const finding of findings || []) {
        if (!finding?.id || !finding?.label)
            continue;
        const key = maintenanceFindingKey(finding);
        const previous = map.get(key);
        if (!previous || Number(finding.confidence || 0) > Number(previous.confidence || 0))
            map.set(key, finding);
    }
    return [...map.values()];
}
function buildMaintenanceFindings(root, { full = {}, code = {}, interaction = {}, textClippingCandidateCount = 0, textContrastCandidateCount = 0, nestedDetailsPopupCandidateCount = 0, mobileInlineAnnotationCandidateCount = 0, mobileLayout = null, viewportLayout = null, } = {}) {
    const findings = [];
    const add = finding => findings.push(createMaintenanceFinding(finding));
    if (Number(interaction.nativePopoverUnwiredCount) > 0) {
        add({
            id: 'native-popover-fallback-missing', stage: 'interaction', mode: 'interaction',
            label: __rmT("M_I3h42OQgYxghUmtF0lhQt9hI0L2CgoDAJrNk5rYGtG3JVYoCSmWr3Sij4jxpV_zvAogZSsqhiEHl0690uVYm_qC2oyOf"),
            evidence: [`nativePopoverUnwiredCount=${interaction.nativePopoverUnwiredCount}`], confidence: 1,
        });
    }
    if (Number(interaction.behaviorRecoveryCandidateCount) > 0) {
        add({
            id: 'range-cover-mapping-missing', stage: 'interaction', mode: 'interaction',
            label: __rmT("SajwtWBcPXRjhr398L2pw1IWCxYkP8pcYqs3pTme9wdEvwZzPdrDcC6CGoCACpyosBpd1gSpKtRqCRbMeJvw9S.6fvG"),
            evidence: [`behaviorRecoveryCandidateCount=${interaction.behaviorRecoveryCandidateCount}`], confidence: 0.98,
        });
    }
    if (Number(interaction.behaviorUnwiredCount) > Number(interaction.behaviorIncompleteCount)) {
        add({
            id: 'behavior-listeners-missing', stage: 'interaction', mode: 'interaction',
            label: __rmT("F17EPzmuhmQuQ8RwtEpjGfPdU7xXi568XHn9LS6t1lunuynt6S.s2.N_"),
            evidence: [`behaviorUnwiredCount=${interaction.behaviorUnwiredCount}`], confidence: 1,
        });
    }
    const sanitizerDroppedStyleCount = Number.parseInt(root?.getAttribute?.(RABBIT_MIRROR_SANITIZER_STYLE_DROP_ATTR) || '0', 10) || 0;
    if (sanitizerDroppedStyleCount > 0) {
        add({
            id: 'sanitizer-local-style-dropped', stage: 'structure', mode: 'style',
            label: `${__rmT("VB8qS915TvRyepuK_v09m4Cx")}${sanitizerDroppedStyleCount}${__rmT("oh.YV6YcSyR6973O5jmddFNrDkEhHoW5QOISRetOhN8hctO2QfSGkzqCi.QShKSqGj3crwO6lvFcw__u0GtV0KaMPzY")}`,
            evidence: [`sanitizerDroppedStyleCount=${sanitizerDroppedStyleCount}`], confidence: 1,
        });
    }
    if (full.rawSourceBodyMissing && !full.sourceTruncationNoticeInstalled) {
        add({
            id: full.rawCssTruncated ? 'raw-css-truncated' : 'raw-body-missing',
            stage: 'source',
            mode: 'source',
            label: full.rawCssTruncated ? __rmT("3Gp0r1exFoUMMsB4VBkHfLca0a_e4pjAAZKeeiJGl31Wa0kE") : __rmT("htkFVOSjotagLBKGJ4zeLoLjj1AIbZzK0Ib.2h"),
            evidence: [`rawSourceBodyMissing=${!!full.rawSourceBodyMissing}`, `rawCssTruncated=${!!full.rawCssTruncated}`],
            confidence: 1,
        });
    }
    if (full.visibleBodyMissing) {
        add({
            id: 'visible-body-missing', stage: 'source', mode: 'source',
            label: __rmT("mjLFgpb48MYgySKeGSI.DbB2k3cZYgi7Gq5uWy4NgQjAwFH6JatP7iDIIil"),
            evidence: ['visibleBodyMissing=true'], confidence: 1,
        });
    }
    if (full.structureTruncated || full.damagedDataUriCandidate) {
        add({
            id: 'source-structure-damaged', stage: 'source', mode: 'source',
            label: __rmT("Jq5IpCib.yd8e24GoWuGGuA4UV5BR6nCYGZhQblQTJWenhEgDL2bZa4eLyKWkk"),
            evidence: [`structureTruncated=${!!full.structureTruncated}`, `damagedDataUriCandidate=${!!full.damagedDataUriCandidate}`],
            confidence: 0.98,
        });
    }
    if (full.severeStructureLoss && !full.visibleBodyMissing && full.rawToto) {
        add({
            id: 'severe-render-structure-loss', stage: 'source', mode: 'source',
            label: __rmT("a6T6Q.aTnt3cFutsKNBX_pSm9bGWyGQZDSPnZ8MJcXLN5vAj"),
            evidence: ['severeStructureLoss=true', 'rawToto=true'], confidence: 0.96,
        });
    }
    if (full.hostCssParserError) {
        add({
            id: 'host-css-parser-error', stage: 'structure', mode: 'style',
            label: __rmT("CmR.1EY7zOQsB0jG4g0rGj1OPBPOHf"),
            evidence: [String(full.hostCssParserErrorText || 'hostCssParserError=true')], confidence: 0.98,
        });
    }
    if (!full.rawSourceBodyMissing && ((full.sourceCandidate && full.sourceObscured) || (code.strictWhole && code.strictParseOk))) {
        add({
            id: 'source-obscured-or-code-shell', stage: 'source', mode: 'source',
            label: __rmT("OjnMpK9KdTuxo75cWAxoTcF.TvfBYPS4EX3hjGwanwG6klVBi4soQSXcuoTU4h"),
            evidence: [
                `sourceCandidate=${!!full.sourceCandidate}`,
                `sourceObscured=${!!full.sourceObscured}`,
                `strictWhole=${!!code.strictWhole}`,
                `strictParseOk=${!!code.strictParseOk}`,
                `currentMirrorNeedsSanitize=${!!code.currentMirrorNeedsSanitize}`,
            ],
            confidence: full.sourceObscured || code.strictParseOk ? 0.97 : 0.86,
        });
    }
    const stylelessStructured = maintenanceStylelessStructuredInfo(root, full);
    if (stylelessStructured.candidate) {
        add({
            id: 'styleless-structured-mirror', stage: 'structure', mode: 'style',
            label: __rmT("QxZoNISA9C9UxLubXsNTQHBFrQNc5Dsa_cDirWkFeg8gwDCz9qtId0yqm21D1w27D26z2jt2fF2cpqspFo1ymiuRwsJgVo116SqmVDmBhQFuR4U0A8eqzWs_"),
            evidence: [
                `authoredRules=${stylelessStructured.authoredRuleCount}`,
                `text=${stylelessStructured.textLength}`,
                `elements=${stylelessStructured.elementCount}`,
                `classed=${stylelessStructured.classedCount}`,
                `distinctClasses=${stylelessStructured.distinctClassCount}`,
                `inlineStyled=${stylelessStructured.inlineStyledCount}`,
                `inlineDeclarations=${stylelessStructured.inlineDeclarationCount}`,
                `richInline=${stylelessStructured.richInlineCount}`,
                `inlineStructuralVisual=${stylelessStructured.inlineStructuralVisualCount}`,
                `computedVisual=${stylelessStructured.computedVisualCount}`,
                `computedVisualSignals=${stylelessStructured.computedVisualSignalCount}`,
                `formControls=${stylelessStructured.formControlCount}`,
                `meaningfulFormControls=${stylelessStructured.meaningfulFormControlCount}`,
                `choiceControls=${stylelessStructured.choiceControlCount}`,
                `nonChoiceControls=${stylelessStructured.nonChoiceFormControlCount}`,
                `stateVisualRules=${stylelessStructured.stateVisualRuleCount}`,
            ],
            confidence: 0.99,
        });
    }
    if ((Number(nestedDetailsPopupCandidateCount) || 0) > 0) {
        add({
            id: 'nested-details-popup-clipped', stage: 'visibility', mode: 'text',
            label: `${__rmT("SNye6L2gHKG")}${Number(nestedDetailsPopupCandidateCount) || 0}${__rmT("3bWoL1nXxrRYsVI5ETDxhHw6aD7L7c.jmB2LXWWDu6JG1k")}`,
            evidence: [`nestedDetailsPopupCandidateCount=${Number(nestedDetailsPopupCandidateCount) || 0}`],
            confidence: 0.98,
        });
    }
    if ((Number(mobileInlineAnnotationCandidateCount) || 0) > 0) {
        add({
            id: 'mobile-inline-annotation-clipped', stage: 'visibility', mode: 'text',
            label: `${__rmT("SNye6L2gHKG")}${Number(mobileInlineAnnotationCandidateCount) || 0}${__rmT("v3gErJa_Q3XKxPq0W8FK2urJ4GA5yEcxEqfbG9yjg.fFQv__")}`,
            evidence: [`mobileInlineAnnotationCandidateCount=${Number(mobileInlineAnnotationCandidateCount) || 0}`],
            confidence: 0.98,
        });
    }
    if ((Number(mobileLayout?.candidateCount) || 0) > 0) {
        add({
            id: 'mobile-layout-content-risk', stage: 'visibility', mode: 'text',
            label: `${__rmT("SNye6L2gHKG")}${Number(mobileLayout?.candidateCount) || 0}${__rmT("dxgplKy4ziUKnNnLIpQETCefTavcjBLT.yG63QVPVKwAg..Nv0AlpQOtv77ITf")}`,
            evidence: [
                `viewportWidth=${Number(mobileLayout?.viewportWidth) || 0}`,
                `horizontalOverflow=${Number(mobileLayout?.horizontalOverflowCount) || 0}`,
                `fixedWidth=${Number(mobileLayout?.fixedWidthCount) || 0}`,
                `grid=${Number(mobileLayout?.gridCount) || 0}`,
                `matrix=${Number(mobileLayout?.matrixCount) || 0}`,
                `flex=${Number(mobileLayout?.flexCount) || 0}`,
                `multiColumn=${Number(mobileLayout?.multiColumnCount) || 0}`,
                `media=${Number(mobileLayout?.mediaCount) || 0}`,
                `stateContent=${Number(mobileLayout?.stateContentCount) || 0}`,
                `squeezedText=${Number(mobileLayout?.squeezedTextCount) || 0}`,
                `underfill=${Number(mobileLayout?.underfillCount) || 0}`,
            ],
            confidence: 0.93,
        });
    }
    if ((Number(viewportLayout?.candidateCount) || 0) > 0) {
        add({
            id: 'viewport-layout-squeezed-or-clipped', stage: 'visibility', mode: 'text',
            label: `${__rmT("SNye6L2gHKG")}${Number(viewportLayout?.candidateCount) || 0}${__rmT("3bWoL1gKSL8fKzK18ohRWP_Li2lw3JuNAWnLTuk_u6JG1k")}`,
            evidence: [
                `viewportWidth=${Number(viewportLayout?.viewportWidth) || 0}`,
                `structuralGridSpan=${Number(viewportLayout?.structuralGridSpanCount) || 0}`,
                `squeezed=${Number(viewportLayout?.squeezedCount) || 0}`,
                `overflow=${Number(viewportLayout?.overflowCount) || 0}`,
                `overflowX=${Number(viewportLayout?.overflowXCount) || 0}`,
                `overflowY=${Number(viewportLayout?.overflowYCount) || 0}`,
                `pointerBlocked=${Number(viewportLayout?.pointerBlockedCount) || 0}`,
            ],
            confidence: 0.97,
        });
    }
    if ((Number(textContrastCandidateCount) || 0) > 0) {
        add({
            id: 'severe-text-contrast', stage: 'visibility', mode: 'text',
            label: `${__rmT("SNye6L2gHKG")}${Number(textContrastCandidateCount) || 0}${__rmT("SzdKJSPsxNTlp8KGq_mcslCdHIyK3YMkNk57W1RaBJC5SW.Z9rlQLasvs4p")}`,
            evidence: [`textContrastCandidateCount=${Number(textContrastCandidateCount) || 0}`], confidence: 0.99,
        });
    }
    if ((Number(textClippingCandidateCount) || 0) > 0) {
        add({
            id: 'text-clipping', stage: 'visibility', mode: 'text',
            label: `${__rmT("SNye6L2gHKG")}${Number(textClippingCandidateCount) || 0}${__rmT("xBwVRUyw.oIfIlLpYvRp8dpUCyXTy8utSNnRXFhv")}`,
            evidence: [`textClippingCandidateCount=${Number(textClippingCandidateCount) || 0}`], confidence: 0.9,
        });
    }
    if (interaction.stateControlsLost) {
        add({
            id: 'state-control-structure-stripped', stage: 'source', mode: 'source',
            label: __rmT("AwekZ5V05xwgxHrWuSSkICrTnTO43WvenK8QS7vXkaKLHMMp3JczaLxbJwnlwXt1j35NDVsRoJoeEJUCCFMPRXkNxmxQ_w6OcTSntwo6s812vHATk9LU6h"),
            evidence: [
                `rawMirrorStateInputs=${Number(full.rawMirrorStateInputCount) || 0}`,
                `renderedMirrorStateInputs=${Number(full.renderedMirrorStateInputCount) || 0}`,
            ],
            confidence: 1,
        });
    }
    else if (interaction.checkedControlsLost) {
        add({
            id: 'checked-controls-lost', stage: 'interaction', mode: 'interaction',
            label: __rmT("0nXSnyoVUHkaERx2XUTtwK3833FtM7BDD2WXKLrNgL60.X659JC0L6sQFMLNAC7wivItifxJBPT"),
            evidence: ['controlsLost=true', 'checkedCount>0'], confidence: 1,
        });
    }
    if (interaction.strippedStateProgram) {
        add({
            id: 'state-program-stripped', stage: 'interaction', mode: 'interaction',
            label: __rmT("eGWn4sNEov6YsiECEP5bhlXYHrYs1mI6Z7j35Qij5R45cNsf"),
            evidence: [
                `lostInlineStatePrograms=${Number(interaction.lostInlineStatePrograms) || 0}`,
                `recoveredInlineStatePrograms=${Number(interaction.recoveredInlineStatePrograms) || 0}`,
            ],
            confidence: 0.92,
        });
    }
    if (Number(interaction.rawScriptTimelineMissingCount) > 0) {
        add({
            id: 'script-timeline-stripped', stage: 'interaction', mode: 'interaction',
            label: __rmT("W9M7sfCGP8GTLZz4KO4YPJ1Xs5COpNGqnuf7GI2FtAGnHM98BEC"),
            evidence: [
                `rawScriptTimelineCandidateCount=${Number(interaction.rawScriptTimelineCandidateCount) || 0}`,
                `rawScriptTimelineRescueCount=${Number(interaction.rawScriptTimelineRescueCount) || 0}`,
            ],
            confidence: 0.98,
        });
    }
    if (Number(interaction.decorativeOverlayCandidateCount) > 0) {
        add({
            id: 'decorative-overlay-blocks-touch', stage: 'interaction', mode: 'interaction',
            label: `${Number(interaction.decorativeOverlayCandidateCount)}${__rmT("tMtaViRQIzeWYVis.mPHB5zKQB.uhk9KY34r7f")}`,
            evidence: [`decorativeOverlayCandidateCount=${Number(interaction.decorativeOverlayCandidateCount)}`], confidence: 0.86,
        });
    }
    if (interaction.touchHoverMissing) {
        add({
            id: 'meaningful-hover-without-touch', stage: 'interaction', mode: 'interaction',
            label: __rmT("QR1WlpkJVr0bYwPa_Ccfsw8e2HblJDLzC.QSKgCUIkQGcr9BQt9ypGapTnsXKGt8x3CJzf"),
            evidence: [`meaningfulPseudoRuleCount=${Number(interaction.meaningfulPseudoRuleCount) || 0}`], confidence: 0.94,
        });
    }
    if (Number(interaction.focusWithinPersistentMissingCount) > 0) {
        add({
            id: 'unlabeled-focus-within-not-persistent', stage: 'interaction', mode: 'interaction',
            label: __rmT("w1EgX4l_LX3OfOEvpWJpzfNZ.ifXxtfv16vLGm0mzuQdFqXqvvci9c4ElmXsl1hOrRQKmtRDDfmZxlyE24DRvZyrWPK49HVa6g74IfTKxaHxqAeCgz4Lt5DbaMOewYwpzfpiLIJb52fAbJlQ7utZ15DTHgk"),
            evidence: [`focusWithinPersistentMissingCount=${Number(interaction.focusWithinPersistentMissingCount)}`], confidence: 1,
        });
    }
    if (Number(interaction.missingCheckedSubjectClassMissingCount) > 0) {
        add({
            id: 'missing-checked-control-class', stage: 'interaction', mode: 'interaction',
            label: __rmT("VRHjZ6wDtmTYvBPDRehLRnkTGiOT21RY5Pu48Mx37C9K1XY70Id6mg5FdbQ3q3AfhTZTzny0k7RShsbWSX5MW.lRqiu9P80Eo.yzhoZP5B.Of4EKkts"),
            evidence: [`missingCheckedSubjectClassMissingCount=${Number(interaction.missingCheckedSubjectClassMissingCount)}`], confidence: 1,
        });
    }
    if (Number(interaction.radioGroupLossCandidateCount) > 0) {
        add({
            id: 'radio-group-name-stripped', stage: 'interaction', mode: 'interaction',
            label: __rmT("w4XfnRzVqFzYmdpYGDjPT__HF9JIB_Hn_b3h0rplkupkUiB4Q.n_uVT3jD2ZvJQ47ZUaGSoYb9E"),
            evidence: [`radioGroupLossCandidateCount=${Number(interaction.radioGroupLossCandidateCount)}`], confidence: 1,
        });
    }
    if (Number(interaction.selectionOnlyRepairCandidateCount) > 0) {
        add({
            id: 'selection-only-missing-result', stage: 'interaction', mode: 'interaction',
            label: __rmT("jBpOhIPAHEDqpKQn1TBapVPTIlGmVw4rqFfbeNTW1Z63jIwLfOwkHmuj"),
            evidence: [`selectionOnlyRepairCandidateCount=${Number(interaction.selectionOnlyRepairCandidateCount)}`], confidence: 0.88,
        });
    }
    if (Number(interaction.disabledOnlyChoiceCandidateCount) > 0) {
        add({
            id: 'disabled-only-choice-group', stage: 'interaction', mode: 'interaction',
            label: __rmT("robMt83y..wweeRCUB5BYfZ60R20n1YQH9C9stCtK.sb3aHi1ST7gBnSihK8lpsy8FmuF5.eKJdvOfp5g0BCun7d"),
            evidence: [`disabledOnlyChoiceCandidateCount=${Number(interaction.disabledOnlyChoiceCandidateCount)}`], confidence: 0.96,
        });
    }
    if (Number(interaction.inertActionButtonCandidateCount) > 0) {
        add({
            id: 'inert-action-button', stage: 'interaction', mode: 'interaction',
            label: __rmT("mpyYP2nAmOOsgRQnX_j3cLb6f0LJdNP6IBcEB7gJ4K3BZd4gIbtSo_rT"),
            evidence: [`inertActionButtonCandidateCount=${Number(interaction.inertActionButtonCandidateCount)}`], confidence: 0.91,
        });
    }
    if (Number(interaction.staticChoiceSelectionCandidateCount) > 0) {
        add({
            id: 'static-choice-cards-without-selection', stage: 'interaction', mode: 'interaction',
            label: __rmT("ovWlOASByEkkBZdsLOiSbhRbKXuYY8lfNgwnZvvp329r71XpjWSW1q5wviAqUX5TsIIXKFU6"),
            evidence: [`staticChoiceSelectionCandidateCount=${Number(interaction.staticChoiceSelectionCandidateCount)}`], confidence: 0.97,
        });
    }
    if (Number(interaction.structuredStaticDisclosureCandidateCount) > 0) {
        add({
            id: 'structured-static-sections-without-reachable-state', stage: 'interaction', mode: 'interaction',
            label: __rmT("4_6OWK71wR65GXq.lciE.EYgowxMvO0k8JE79VJKIsmYgpvvMEHb5w84MR7O1ZKO0ZLJRvp7B2VcD2CG1kaNi4.Fv1ejvrA3oelbO9OtPIZb3IxJGa18_RmglRtTugFitAYuBCgrgYaIrh"),
            evidence: [`structuredStaticDisclosureCandidateCount=${Number(interaction.structuredStaticDisclosureCandidateCount)}`], confidence: 0.94,
        });
    }
    if (Number(interaction.fillInChoiceCandidateCount) > 0) {
        add({
            id: 'fill-in-blanks-with-static-options', stage: 'interaction', mode: 'interaction',
            label: __rmT("jPudx5t9X1hNDE0Z9WMkJAdhfKYpF5dI1wEPuo6QXUDHkjNaw0SM5DwNNef5V.vMSAHdE7yPVio3FzYVlJgRdXXtlvpziThJ50k8GvJcN02VOe_j0ntdPHFbNxaKNjjZjg8JMQu.IYPRga3H"),
            evidence: [`fillInChoiceCandidateCount=${Number(interaction.fillInChoiceCandidateCount)}`], confidence: 0.99,
        });
    }
    if (Number(interaction.radioBranchCandidateCount) > Number(interaction.radioBranchRepairCount)) {
        add({ id: 'disconnected-radio-branches', stage: 'interaction', mode: 'interaction',
            label: __rmT("17S_U3JNJyVXGyZUL0lXLTyG67j3o4Gm8gw4fVeA32GwLRogaAfsJB6cvsz33D_kVzELz0c8"),
            evidence: [`radioBranchCandidateCount=${interaction.radioBranchCandidateCount}`], confidence: 0.98 });
    }
    if (Number(interaction.unresolvedContentCheckedRuleCount ?? interaction.unresolvedCheckedRuleCount) > 0) {
        add({
            id: 'unresolved-checked-target', stage: 'interaction', mode: 'interaction',
            label: __rmT("vAh4eCapvDL4W.YaQtPf8woI72Rn4C08FNrIDnJCDdMgTsYwyLuOFUiCcbtYUXs1.Ko2F2vv0PjM1Y1Hcj5RmUIV.13Xl0Eseslujk"),
            evidence: [`unresolvedCheckedRuleCount=${Number(interaction.unresolvedCheckedRuleCount)}`], confidence: 0.99,
        });
    }
    if (Number(interaction.crossParentCheckedRuleCandidateCount) > 0) {
        add({
            id: 'cross-parent-checked-target', stage: 'interaction', mode: 'interaction',
            label: __rmT("WOGe9HGKbDcQTuD7mltv7WH7QiDdUQxdZJZJzXfPXDlEw3h1rJvDmktc_yC3enXgj25ZgkqRTbpzTqLXs48"),
            evidence: [
                `crossParentCheckedRuleCandidateCount=${Number(interaction.crossParentCheckedRuleCandidateCount)}`,
                `crossParentCheckedRuleVerifiedCount=${Number(interaction.crossParentCheckedRuleVerifiedCount) || 0}`,
            ], confidence: 0.98,
        });
    }
    if (Number(interaction.checkedHasStateRuleMissingCount) > 0) {
        add({
            id: 'checked-has-wrong-scope', stage: 'interaction', mode: 'interaction',
            label: __rmT("YPXLVo_9Q_sZJQbasd7NSnxcKOs3ci1EGFMucHewng3AEIWSbQHKVImQp6uVYTZgeLCsWdSK4lRZyoYY"),
            evidence: [`checkedHasStateRuleMissingCount=${Number(interaction.checkedHasStateRuleMissingCount)}`], confidence: 0.98,
        });
    }
    if (Number(interaction.detachedCheckedHasRuleMissingCount) > 0) {
        add({
            id: 'detached-checked-has-state', stage: 'interaction', mode: 'interaction',
            label: __rmT("kYLwlvkOGzVRGQGO1JVYbB3_3adBh6FHYfzFZurTdqlshhOidIngxYgeOKNGoxUBv43l7Cjo8nQvVOTmpKa0Y0FEsyahzoWz1vYTk5j.oujdKjcUWuCOtoC_"),
            evidence: [`detachedCheckedHasRuleMissingCount=${Number(interaction.detachedCheckedHasRuleMissingCount)}`], confidence: 1,
        });
    }
    if (Number(interaction.pairedCheckedStateMissingCount) > 0) {
        add({
            id: 'paired-checked-state-locked', stage: 'interaction', mode: 'interaction',
            label: __rmT("NFm4QZGXGLcY7jU.Fc1sVY8oJBEQSSgdCVmG9XqgI4sa6M6IizeK8qNbb0ESxIdaDiX3LtHx4KrnIlwDSEdSRf7qlhzSZAmduCIuP0wZwA2D4yCpjLA7mcKihhCYkk"),
            evidence: [`pairedCheckedStateMissingCount=${Number(interaction.pairedCheckedStateMissingCount)}`], confidence: 1,
        });
    }
    if (Number(interaction.exclusiveStackedStateMissingCount) > 0) {
        add({
            id: 'exclusive-stacked-state-overlap', stage: 'interaction', mode: 'interaction',
            label: __rmT("FARjFpUt1icI9WIAoQ4MpuO5D_7fPOVaG.J4xS0a0Jq9UxBBLWePYVAwLt7LL592LdDvqC0eQs28vEe6tZl"),
            evidence: [`exclusiveStackedStateMissingCount=${Number(interaction.exclusiveStackedStateMissingCount)}`], confidence: 0.99,
        });
    }
    if (Number(interaction.channelDialCycleMissingCount) > 0) {
        add({
            id: 'channel-dial-overlap', stage: 'interaction', mode: 'interaction',
            label: __rmT("9q2lVj0tDTU1Dlksyd4M2zSw34E1O2esORVXdlEOCzglJrHvgz9cIIjvVS95CQiqFpUbWozQlnsYrJPR"),
            evidence: [`channelDialCycleMissingCount=${Number(interaction.channelDialCycleMissingCount)}`], confidence: 0.99,
        });
    }
    if (Number(interaction.oneWayCheckedResultCandidateCount) > 0) {
        add({
            id: 'checked-result-no-return', stage: 'interaction', mode: 'interaction',
            label: __rmT("pUSVJjZ51QOzwdr32NR4GyKvkjQo4VFurFtmMX6wrJ7j8.wCJNV4MS8QaE_kBlrh9hYroUNVsNoOLLq0XGb98q2lahs42NDmll8"),
            evidence: [`oneWayCheckedResultCandidateCount=${Number(interaction.oneWayCheckedResultCandidateCount)}`], confidence: 0.98,
        });
    }
    if (interaction.needsScopeRepair) {
        add({
            id: 'interaction-id-scope-collision', stage: 'interaction', mode: 'interaction',
            label: `${__rmT("EoWY1tcX73OLceJntiKPcvvB2VbXQ_1oa2eK.45bp28")}${Number(interaction.duplicateIds) || 0}${__rmT("DfrgIhtbpt6GrREq")}${Number(interaction.brokenLocalLabels) || 0}${__rmT("eXs")}`,
            evidence: [
                `duplicateIds=${Number(interaction.duplicateIds) || 0}`,
                `brokenLocalLabels=${Number(interaction.brokenLocalLabels) || 0}`,
            ],
            confidence: 0.94,
        });
    }
    if (full.mobile3DFlipCandidate) {
        add({
            id: 'ios-3d-flip-incomplete', stage: 'compatibility', mode: 'style',
            label: __rmT("oj3_jNqL8BPelwhq4t5BbqIc3z4X6xRrO_vg00xEZF13m5FiLSvI3dysOelKYzmxN_xkuaEmNJ2H.ZAVd_qUeeut"),
            evidence: ['mobile3DFlipCandidate=true'], confidence: 0.96,
        });
    }
    return dedupeMaintenanceFindings(findings);
}
export function maintenanceRepairModesForFindings(findings) {
    const list = findings || [];
    const plan = [];
    const push = mode => { if (mode && !plan.includes(mode))
        plan.push(mode); };
    if (list.some(finding => finding.stage === 'source'))
        push('source');
    if (list.some(finding => finding.stage === 'structure'))
        push('style');
    if (list.some(finding => finding.stage === 'visibility'))
        push('text');
    if (list.some(finding => finding.stage === 'interaction'))
        push('interaction');
    if (list.some(finding => finding.stage === 'compatibility'))
        push('style');
    return plan;
}
export function maintenanceFindingReason(findings) {
    const list = findings || [];
    if (!list.length)
        return '';
    return list.map((finding, index) => {
        const stage = MAINTENANCE_FINDING_STAGE_LABELS[finding.stage] || __rmT("yGhZ3f");
        return `${index + 1}. ${stage}${__rmT("7ys")}${finding.label}`;
    }).join(__rmT("7os"));
}
function maintenanceFindingSnapshot(findings) {
    return (findings || []).map(finding => ({
        id: finding.id,
        stage: finding.stage,
        label: finding.label,
        mode: finding.mode,
        confidence: finding.confidence,
        evidence: finding.evidence,
    }));
}
export function maintenanceInteractionRepairOutcome({ after, actualRepairApplied, failedModules = [], evidence = '', clipped = 0 }) {
    const verified = /@maintenance-sandbox-probe-observe:verified$/.test(evidence);
    const result = (state, reason, complete = false) => ({ state, reason, verified: complete });
    const progress = verified ? __rmT("oYfWxDdElKKmshlaUCjVO1dGxrDbzPKVwk9xLlZOtXZN54ix") : __rmT("qMyWkFwVEwYH1bqD");
    if (failedModules.length)
        return result(MAINTENANCE_STATES.unknown, `${progress}${__rmT("QQ5OQOJksb35c9Bsb2cDOqiFWeiAUdREpsmGbZieAzBL8VAj")}`);
    if (after?.state === MAINTENANCE_STATES.repairable || after?.state === MAINTENANCE_STATES.unknown)
        return result(after.state, `${progress}${after.reason}`);
    if (/:failed$|:corrected$/.test(evidence))
        return result(MAINTENANCE_STATES.unknown, __rmT("TBeHhNKH8fDx8ay1HGLZcI7BCEndy1bA7JcFxPZ3SCBE4k6o50N2QT"));
    if (!actualRepairApplied)
        return result(MAINTENANCE_STATES.unknown, __rmT("bWNc.H4uwKKYr6RU3tBLIs0bBhaOH6m_AuwsXZ6trzF0uz2WAvY3Uir_"));
    if (clipped > 0)
        return result(MAINTENANCE_STATES.repairable, `${progress}${__rmT("4gfNOge_zSEElsVCQPD7wexGrsjQ1xdW1fFnmO.zRaaerJht1KTQ7f")}`);
    if (!verified)
        return result(MAINTENANCE_STATES.unknown, __rmT("m.z3gDtsQcOwYx0VOF6Bos7Q4tIcoan3UgdjCuFqn0utcCiWC12MT2J50_MMMZ0FuEjv5f"));
    return result(MAINTENANCE_STATES.idle, __rmT("hy1_aQrp6oqgbpF9Gr2SSxJEg5ODAlYDqDJRF3CQIstLWVr741AOBwrTKrPfBaOEwth0w1DsNHJ0dzTBXsa1o_vS"), true);
}
function inspectMaintenanceRabbit(root) {
    let code = {};
    let full = maintenanceFallbackFullSummary(root);
    let partialInspection = false;
    try {
        code = diagnosticCodeRescueSummary(root) || {};
    }
    catch (error) {
        partialInspection = true;
        console.debug('[RabbitMirror] maintenance code inspection skipped:', error);
    }
    try {
        full = { ...full, ...(diagnosticFullChainSummary(root, code) || {}) };
    }
    catch (error) {
        partialInspection = true;
        console.debug('[RabbitMirror] maintenance full-chain inspection skipped:', error);
    }
    let interaction;
    try {
        interaction = maintenanceKnownInteractionEvidence(root, full, code);
    }
    catch (error) {
        partialInspection = true;
        console.debug('[RabbitMirror] maintenance interaction inspection skipped:', error);
        interaction = { checkedControlsLost: false, stateControlsLost: false, strippedStateProgram: false, lostInlineStatePrograms: 0, recoveredInlineStatePrograms: 0, decorativeOverlayCandidateCount: 0, touchHoverMissing: false, unscopedControls: false, missingCheckedSubjectClassCandidateCount: 0, missingCheckedSubjectClassRescueCount: 0, missingCheckedSubjectClassMissingCount: 0, radioGroupLossCandidateCount: 0, radioGroupRescueCount: 0, duplicateIds: 0, brokenLocalLabels: 0, checkedCssIdSelectors: 0, needsScopeRepair: false, checkedSelectionOnly: false, checkedSelectionOnlyRaw: false, checkedRuleCount: 0, meaningfulCheckedRuleCount: 0, selectionStyleRuleCount: 0, unresolvedCheckedRuleCount: 0, selectionOnlyFallbackCount: 0, selectionOnlyRepairCandidateCount: 0, disabledOnlyChoiceCandidateCount: 0, inertActionButtonCandidateCount: 0, staticChoiceSelectionCandidateCount: 0, staticChoiceSelectionRescueCount: 0, structuredStaticDisclosureCandidateCount: 0, structuredStaticDisclosureRescueCount: 0, fillInChoiceCandidateCount: 0, fillInChoiceRescueCount: 0, focusWithinPersistentCandidateCount: 0, focusWithinPersistentRescueCount: 0, focusWithinPersistentMissingCount: 0, rawScriptTimelineCandidateCount: 0, rawScriptTimelineRescueCount: 0, rawScriptTimelineMissingCount: 0, crossParentCheckedRuleCandidateCount: 0, checkedHasStateRuleCandidateCount: 0, checkedHasStateRuleRescueCount: 0, checkedHasStateRuleMissingCount: 0, detachedCheckedHasRuleCandidateCount: 0, detachedCheckedHasRuleRescueCount: 0, detachedCheckedHasRuleMissingCount: 0, pairedCheckedStateCandidateCount: 0, pairedCheckedStateRescueCount: 0, pairedCheckedStateMissingCount: 0, exclusiveStackedStateCandidateCount: 0, exclusiveStackedStateRescueCount: 0, exclusiveStackedStateMissingCount: 0, channelDialCycleCandidateCount: 0, channelDialCycleRescueCount: 0, channelDialCycleMissingCount: 0, oneWayCheckedResultCandidateCount: 0, reversibleCheckedResultRescueCount: 0, pseudoVisualOnly: false, pseudoRuleCount: 0, visualOnlyPseudoRuleCount: 0, meaningfulPseudoRuleCount: 0, touchHoverEligibleCount: 0, touchHoverActiveCount: 0, contentInteractiveElementCount: 0, installedInteractionRouteCount: 0, noInteractionStructure: false, raw: '' };
    }
    let textContrastCandidateCount = 0;
    try {
        textContrastCandidateCount = findSevereTextContrastCandidates(root).length;
    }
    catch (error) {
        partialInspection = true;
        console.debug('[RabbitMirror] maintenance text contrast inspection skipped:', error);
    }
    let textClippingCandidateCount = 0;
    try {
        textClippingCandidateCount = findMaintenanceTextClippingCandidates(root).length;
    }
    catch (error) {
        partialInspection = true;
        console.debug('[RabbitMirror] maintenance text clipping inspection skipped:', error);
    }
    let nestedDetailsPopupCandidateCount = 0;
    try {
        nestedDetailsPopupCandidateCount = findNestedDetailsPopupClippingCandidates(root).length;
    }
    catch (error) {
        partialInspection = true;
        console.debug('[RabbitMirror] maintenance nested details popup inspection skipped:', error);
    }
    let mobileInlineAnnotationCandidateCount = 0;
    try {
        mobileInlineAnnotationCandidateCount = findMobileInlineAnnotationCandidates(root).length;
    }
    catch (error) {
        partialInspection = true;
        console.debug('[RabbitMirror] maintenance mobile inline annotation inspection skipped:', error);
    }
    let mobileLayout = { candidateCount: 0, viewportWidth: Number(globalThis.innerWidth || 0), narrowViewport: false };
    try {
        mobileLayout = inspectMaintenanceMobileLayout(root);
    }
    catch (error) {
        partialInspection = true;
        console.debug('[RabbitMirror] maintenance mobile layout inspection skipped:', error);
    }
    let viewportLayout = { candidateCount: 0, squeezedCount: 0, overflowCount: 0, overflowXCount: 0, overflowYCount: 0, pointerBlockedCount: 0, viewportWidth: Number(globalThis.innerWidth || 0) };
    try {
        viewportLayout = inspectMaintenanceViewportLayout(root);
    }
    catch (error) {
        partialInspection = true;
        console.debug('[RabbitMirror] maintenance viewport layout inspection skipped:', error);
    }
    let languageBalance = auditVisibleLanguageBalanceText('');
    try {
        languageBalance = rabbitMirrorLanguageBalance(root);
    }
    catch (error) {
        partialInspection = true;
        console.debug('[RabbitMirror] maintenance language balance inspection skipped:', error);
    }
    const findings = buildMaintenanceFindings(root, {
        full,
        code,
        interaction,
        textClippingCandidateCount,
        textContrastCandidateCount,
        nestedDetailsPopupCandidateCount,
        mobileInlineAnnotationCandidateCount,
        mobileLayout,
        viewportLayout,
    });
    const repairPlan = maintenanceRepairModesForFindings(findings);
    if (findings.length) {
        return {
            state: MAINTENANCE_STATES.repairable,
            reason: maintenanceFindingReason(findings),
            findings,
            repairPlan,
            code,
            full,
            interaction,
            textClippingCandidateCount,
            textContrastCandidateCount,
            nestedDetailsPopupCandidateCount,
            mobileInlineAnnotationCandidateCount,
            mobileLayout,
            viewportLayout,
            languageBalance,
        };
    }
    if (languageBalance.foreignDominant) {
        return {
            state: MAINTENANCE_STATES.notice,
            reason: `${languageBalance.reason}${__rmT("gOV36lBiFaPl854kGatGtUuaktKcT8S11wEPuB2BXqLOxjJburu_7KLw6.27_Twuz0rA8ENI7YUN8y_c1DmyWuR.lKB1v5czwDseXEaGUK4B2pIX0XwzMFETFq5PZWvlIbzJfaESv2StcdEF")}`,
            findings: [],
            repairPlan: [],
            code,
            full,
            interaction,
            textClippingCandidateCount,
            textContrastCandidateCount,
            nestedDetailsPopupCandidateCount,
            mobileInlineAnnotationCandidateCount,
            mobileLayout,
            viewportLayout,
            languageBalance,
        };
    }
    const unknownReasons = [];
    if (Number(interaction.nativePopoverMissingCount) > 0)
        unknownReasons.push(__rmT("m9qXOPmC2VS3ZPCqwYaUkrMbSFkRZsLcrVDy_sx_.3Uyri4QIFX.fJVgS8bFbSKR"));
    if (Number(interaction.behaviorIncompleteCount) > 0)
        unknownReasons.push(__rmT("fSMI96iV7scd2RdkTzRPubvIdIvAN5ADWxYU35.OY7gR7_J211gR1706nmOahekxp0v.4bIJ"));
    if (Number(interaction.behaviorUnmappedRangeCount) > 0)
        unknownReasons.push(__rmT("LW3MWR4wc_4NQby1KQxiU7VnBww9owcpQbz8KCnX4JKt6jlbsaQzo43qDGevgnosk5C"));
    if (full.sourceTruncationNoticeInstalled)
        unknownReasons.push(__rmT("270iwgHpOXRRn5r1RxugBTBTbzRCoTkuiBOG3x9r3vt2KyZjuC2R1706vxCvNz0x97bjsDOF"));
    if (full.severeStructureLoss && !full.rawToto)
        unknownReasons.push(__rmT("pF.FatGpnqi8_bra7nZRHlKOizXtklAMeCT.ClbBJUnGdve7eik"));
    if (full.controlsLost && full.checkedCount === 0 && full.rawInlineEvents === 0)
        unknownReasons.push(__rmT("s23Dn82IlWJUTtcR0Wx9WEWvcuZ5G2QNWe3aAnPAWNGXTf"));
    if (full.currentMirrorRenderedEscapedTags && !code.strictParseOk && !full.sourceCandidate)
        unknownReasons.push(__rmT("OjnMpK9Km_z2YDq02Lxtv2I859tuo4LD1Xli3hFZvbSjgURZKxkNp4ZT1.TOxT"));
    if (interaction.checkedSelectionOnly && interaction.selectionOnlyRepairCandidateCount === 0 && Number(interaction.pairedCheckedStateRescueCount || 0) === 0)
        unknownReasons.push(__rmT("olhpZ62fS3246bC3llN6sXzTkcWFsHM4CZgpspmRKAHH80PHnfXNIi86ebXVb59WWhJsMNi_va_PjdP0IAUgsLwPg77ioFfOjT_"));
    if (!rabbitMirrorTextPresentation(root) && interaction.pseudoVisualOnly)
        unknownReasons.push(__rmT("4ltGq2eJ.x2XA7M8XlwXz1jN3y0xM__fISZypijFZNAsv9zqpe.oJi4.COT1LyoBEHrWbOnhNDIZfYbl3v.69W2kAqcMKGdVNr5F1NG3nXaYbqq3qS6JZA34ovKv2VvE"));
    if (interaction.unmappedNavigationButtonCount > 0)
        unknownReasons.push(`${__rmT("lsq6.cc6")}${interaction.unmappedNavigationButtonCount}${__rmT("3I1SPp1loh6ZwqufJtlZtoDKuvsM0UmliDEo_ktk.eH5nZDH3S87OKi.")}`);
    if (interaction.noInteractionStructure)
        unknownReasons.push(__rmT("6IBVN.oilq4Ds6xrQ0BK1L_RPngU8jf6IjjR.O4_qc.3WF2OQdDdUQ9yYQhZRold2V4ZMk06.SuypeGmXkZ1X9xxg_irvxju8zC5pI4GrNOSguFAqJU4FXli"));
    if (unknownReasons.length) {
        return {
            state: MAINTENANCE_STATES.unknown,
            reason: unknownReasons.join(__rmT("7os")),
            findings: [],
            repairPlan: [],
            code,
            full,
            interaction,
            textClippingCandidateCount,
            textContrastCandidateCount,
            nestedDetailsPopupCandidateCount,
            mobileInlineAnnotationCandidateCount,
            mobileLayout,
            viewportLayout,
            languageBalance,
        };
    }
    const relayNote = (Number(interaction.behaviorRelayedCount) > 0 ? `${__rmT("7os")}${Number(interaction.behaviorRelayedCount)}${__rmT("3Irb.LmAHEQppfFBXRCLp41Tf0YQiG6KQJFYZRqLizLqu_jx.S9GU5LE")}` : '')
        + (Number(interaction.behaviorReverseCount) > 0 ? `${__rmT("7os")}${Number(interaction.behaviorReverseCount)}${__rmT("3Irb.2TjwEtfr2RSXRCLp41Tf0e8Ss066JkwYb2chlIGjxPgJ4JGUKXc")}` : '');
    const healthyReason = (Number(interaction.behaviorWiredCount) > 0
        ? `${__rmT("AGGEWt6EzpTUDCJpDFRFaf")}${Number(interaction.behaviorRecoveredCount) > 0 ? `${__rmT("fnZGAjwjHKG")}${Number(interaction.behaviorRecoveredCount)}${__rmT("xBwVRCa2Xv86DoHW4iY_y6l2B8gH5Pr6XCM_pmZ8")}` : ''}${__rmT("nX6SOL5p8tmnQPelxoSbyj2LKxGmVEmxCaYKBU0Ws_4Vnfjdqi.00RHV")}` : partialInspection
        ? __rmT("bWBuEfqCwKX5y1XmVlC0kp7Lg.lci64q6LyQWiPoZm0f_N4Fgb1Joq_x") : (full.activeCount > 0 && full.checkedCount === 0 ? __rmT("Y8KyWDx.IzdNUqKFJDyF4zVcMRre4xUGB0Lzs9eUNQJEtygDqkEsJT") : __rmT("ZDOuh357GY504crLOJmXXf"))) + relayNote;
    return {
        state: MAINTENANCE_STATES.healthy,
        reason: healthyReason,
        findings: [],
        repairPlan: [],
        code,
        full,
        interaction,
        textClippingCandidateCount,
        textContrastCandidateCount,
        nestedDetailsPopupCandidateCount,
        mobileInlineAnnotationCandidateCount,
        mobileLayout,
        viewportLayout,
        languageBalance,
    };
}
export function maintenanceRepairRootBudget(root) {
    const limits = { maxNodes: 2200, maxDepth: 64, maxAttributes: 7000 };
    if (!root?.isConnected)
        return { ok: false, reason: 'detached', ...limits };
    const stack = [{ node: root, depth: 1 }];
    let nodes = 0;
    let attributes = 0;
    while (stack.length) {
        const { node, depth } = stack.pop();
        nodes += 1;
        attributes += Number(node?.attributes?.length || 0);
        if (nodes > limits.maxNodes || depth > limits.maxDepth || attributes > limits.maxAttributes) {
            return { ok: false, reason: 'complexity', nodes, depth, attributes, ...limits };
        }
        const children = node?.children || [];
        for (let index = children.length - 1; index >= 0; index -= 1)
            stack.push({ node: children[index], depth: depth + 1 });
    }
    return { ok: true, nodes, attributes, ...limits };
}
export function rejectOversizedMaintenanceRepair(root, button, action = __rmT("iJ_93k")) {
    const budget = maintenanceRepairRootBudget(root);
    if (budget.ok)
        return false;
    setMaintenanceRabbitState(button, MAINTENANCE_STATES.unknown, budget.reason === 'complexity'
        ? `${__rmT("58GZSnnxSojcbyQDA4VgMx1y")}${budget.nodes || '>'}${budget.maxNodes}${__rmT("v3Q9TcXyVbBzJwSYVSkXffuaMVnqIDrzaOJ5B4Swp.rb5L5r")}${action}${__rmT("jUPQqZ1cQ.xaabxwT5WhCCVIXN8ofK2VpmT")}` : `${__rmT("ntvm13KQAwb.EaxHKiDf79HaiHxiMBamA4wv9f")}${action}`);
    return true;
}
function rememberRepairSample(root, trigger, reason, controls) {
    try {
        const skeleton = buildRabbitMirrorSkeletonPair(root);
        return !!recordRepairSample(root, { trigger, reason, controls, skeleton });
    }
    catch (error) {
        console.debug('[RabbitMirror] repair sample skipped:', error);
        return false;
    }
}
export function patrolMaintenanceRabbit(root, button) {
    if (!root?.isConnected || !button?.isConnected)
        return null;
    if (rejectOversizedMaintenanceRepair(root, button, __rmT("PBnm9T")))
        return null;
    const origin = maintenancePatrolOrigin(root);
    setMaintenanceRabbitState(button, MAINTENANCE_STATES.checking, __rmT("P63FwCedNOacNp0E3oIffws6u29SNCNjrcQZCBe8Ej4l4NbQnIPM8f"));
    let result;
    let patrolDeadToRecord = -1;
    let patrolProbe = null;
    try {
        result = inspectMaintenanceRabbit(root);
    }
    catch (error) {
        console.debug('[RabbitMirror] maintenance rabbit patrol failed:', error);
        result = { state: MAINTENANCE_STATES.unknown, reason: __rmT("Q9KZ24ghVCaJZMZ_cdhTVMLu91bb9yfcka5OZHQRcK8NI2x.iasCBKRo.HWFbO.x") };
    }
    try {
        const probe = runMaintenanceGenericProbe(root, { recordResult: false });
        patrolProbe = probe;
        const line = describeGenericProbe(probe);
        if (!probe && result.state === MAINTENANCE_STATES.healthy) {
            result = { ...result, state: MAINTENANCE_STATES.unknown, reason: `${result.reason}${__rmT("nzLYqZ3R_JMsakiCKfBzi4cjvxbJ85Cmz.PNBxDricY21kBk9QlTmr8EKsnKX71uXwJirO8y5C4C5ZNaz6rv49I4sqgLDFbHJtZ_.sMdAqH2Gb2C5mC")}` };
        }
        if (probe) {
            const deadCount = (probe.dead || []).length + (probe.feedbackOnly || []).length;
            if (deadCount || (!probe.truncated && !probe.uncertain))
                patrolDeadToRecord = deadCount;
        }
        if (probe?.dead?.length || probe?.feedbackOnly?.length) {
            const recorded = maintenancePatrolOriginIsCurrent(root, origin)
                && rememberRepairSample(root, 'patrol', line, [...(probe.dead || []), ...(probe.feedbackOnly || [])]);
            result = { ...result, state: result.state === MAINTENANCE_STATES.healthy ? MAINTENANCE_STATES.unknown : result.state,
                reason: `${result.state === MAINTENANCE_STATES.healthy ? '' : `${result.reason}${__rmT("7os")}`}${line}${__rmT("F6EB8pXp73OQr_xMVin7y668Ren.85zLIH_u8yN8")}${recorded ? __rmT("uLn4_RGyVwho429RMJW7S1bYLk2pLnjY8cpTHpmebQu0pPgksPC_GWxm48jkgZQoUuf") : __rmT("vNxPkeytZ42J4OdSFfSYf.tL1JrCK7Y00G61FJZQntaVf3iV14iI_hR.DAwuJWctcRlm_RznabnRURscUn7FRajtL4akfd8Una.D4FKrf7s")}` };
        }
        else if (probe?.truncated || probe?.uncertain) {
            result = { ...result, state: result.state === MAINTENANCE_STATES.healthy ? MAINTENANCE_STATES.unknown : result.state,
                reason: `${result.reason}${__rmT("7os")}${line}${__rmT("qU050pnn9utDRTV4GMrArHQ2yKbqoxkl613JLokJPPwtj8tAkdrWYWVOrmsAHTeSywRkbvf_veWkh4Yl5zUwZl2EbYaNCk")}` };
        }
        else if (line && result.state === MAINTENANCE_STATES.healthy) {
            result = { ...result, reason: `${result.reason}${__rmT("7os")}${line}` };
        }
    }
    catch (error) {
        console.debug('[RabbitMirror] generic probe skipped:', error);
        if (result.state === MAINTENANCE_STATES.healthy) {
            result = { ...result, state: MAINTENANCE_STATES.unknown, reason: `${result.reason}${__rmT("_5sDa9OHRR9F1TrDJ4rOErFZ53rbxm8_jrOcaRL4rVChjs3PKkAZcwDzluODga9kIU0o8qqzKnhz0KQgiJI09wWtWEof2dn0BJxXmkdzMbG")}` };
        }
    }
    const patrolRecord = rememberMaintenanceProbeResult(root, patrolProbe, origin);
    const patrolRevision = patrolRecord?.revision;
    setTimeout(() => {
        if (!button.isConnected || !patrolRecord)
            return;
        if (maintenanceAutoProbeAttempts.get(maintenancePatrolDeadKey(root)) !== patrolRecord
            || patrolRecord.revision !== patrolRevision)
            return;
        if (maintenancePatrolOriginIsCurrent(root, origin)) {
            if (patrolDeadToRecord >= 0)
                setMaintenancePatrolDeadCount(root, patrolDeadToRecord);
            setMaintenanceRabbitState(button, result.state, result.reason);
            if (__rmR("b6d_qIqjCBl", "").test(String(result.reason || ''))) {
                try {
                    scheduleMaintenanceLabeledCheckedProbe(root);
                }
                catch { }
            }
        }
    }, 120);
    return result;
}
function findLiveMaintenanceRoot(root, summaryText = '', messageIndex = -1) {
    if (root?.isConnected)
        return exactIndependentMaintenanceRoot(root);
    const wantedIdentity = followMaintenanceMirrorIdentity(root);
    const independentHost = independentMaintenanceHost(root);
    const ownerKey = String(independentHost?.dataset?.rmKey || root?.dataset?.rabbitMirrorExternalOwner || '');
    const facePosition = getRabbitMirrorFacePosition(root);
    if (ownerKey) {
        const exact = [...(document.querySelectorAll?.('[data-rabbit-mirror-external-source="true"][data-rm-source="independent"]') || [])]
            .find(host => String(host.dataset?.rmKey || '') === ownerKey);
        if (exact && Number.isInteger(facePosition?.faceIndex)) {
            const faces = [...(exact.children || [])].filter(child => child?.matches?.('details') && isRabbitMirrorDetails(child));
            return faces.length === facePosition.faceCount ? faces[facePosition.faceIndex] || null : null;
        }
        return null;
    }
    const messageElement = messageIndex >= 0 ? getRenderedMessageElement(messageIndex) : null;
    if (!messageElement)
        return null;
    const candidates = getRenderedRabbitMirrorInteractionRoots(messageElement);
    if (wantedIdentity) {
        const exact = candidates.find(candidate => followMaintenanceMirrorIdentity(candidate) === wantedIdentity);
        return exact || null;
    }
    if (!summaryText)
        return candidates.length === 1 ? candidates[0] : null;
    const summaryMatches = candidates.filter(candidate => getRabbitMirrorSummaryText(candidate).includes(summaryText));
    return summaryMatches.length === 1 ? summaryMatches[0] : null;
}
export function getSelectedMessageSource(message, { preferDisplay = false } = {}) {
    if (!message || message?.is_user)
        return '';
    const swipeIndex = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
    const displaySource = typeof message?.extra?.display_text === 'string' ? message.extra.display_text : '';
    const swipeSource = swipeIndex >= 0 && typeof message?.swipes?.[swipeIndex] === 'string'
        ? message.swipes[swipeIndex]
        : '';
    const messageSource = typeof message?.mes === 'string' ? message.mes : '';
    const candidates = preferDisplay
        ? [displaySource]
        : [swipeSource, messageSource, displaySource];
    for (const candidate of candidates) {
        const decoded = decodeHtmlEntities(String(candidate || '')).trim();
        if (!decoded)
            continue;
        if (needsSanitize(decoded) || /<(?:toto|details)\b/i.test(decoded))
            return decoded;
    }
    return candidates.map(value => String(value || '').trim()).find(Boolean) || '';
}
export function normalizeMaintenanceSummaryText(text) {
    return stripMaintenanceRabbitGlyphs(text)
        .replace(/\s+/g, ' ')
        .trim();
}
export function maintenanceMessageSourceCandidates(message, { displayOnly = false } = {}) {
    const candidates = [];
    const seen = new Set();
    const push = (label, value) => {
        if (typeof value !== 'string')
            return;
        const source = decodeHtmlEntities(value).trim();
        if (!source || seen.has(source))
            return;
        seen.add(source);
        candidates.push({ label, source });
    };
    if (displayOnly) {
        push('display_text', message?.extra?.display_text);
        return candidates;
    }
    const swipeIndex = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
    if (swipeIndex >= 0)
        push(__rmT("l24VhpvSz.2M_RWuKwz0HT"), message?.swipes?.[swipeIndex]);
    push('mes', message?.mes);
    push('display_text', message?.extra?.display_text);
    return candidates;
}
export function maintenanceMirrorBodyEvidence(candidate) {
    const empty = {
        hasDetails: false,
        textLength: 0,
        bodyElementCount: 0,
        semanticElementCount: 0,
        visualProgramCount: 0,
        highConfidenceEmptyShell: false,
    };
    if (!(candidate instanceof Element))
        return empty;
    const details = candidate.matches?.('details') ? candidate : candidate.querySelector?.('details');
    if (!details)
        return empty;
    const clone = details.cloneNode(true);
    [...clone.children].filter(isHostDetailsCollapseControl).forEach(node => node.remove());
    clone.querySelectorAll?.([
        ':scope > summary',
        '[data-rm-image-region]',
        'script',
        'template',
        `[${MAINTENANCE_RABBIT_ATTR}]`,
        `[${FEEDBACK_CAT_ATTR}]`,
        `[${TOOL_ENTRY_HOST_ATTR}]`,
        `[${MAINTENANCE_MENU_ATTR}]`,
        `[${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`,
        `[${FEEDBACK_CAT_MENU_ATTR}]`,
        `[${RECIPE_MENU_ATTR}]`,
        `[${SOURCE_TRUNCATION_NOTICE_ATTR}]`,
        `[${EXTERNAL_REFERENCE_NOTE_ATTR}]`,
    ].join(','))?.forEach(node => node.remove());
    const contentStyles = [...(clone.querySelectorAll?.('style') || [])]
        .filter(style => ![...style.attributes].some(attribute => /^data-rabbit-mirror-/i.test(attribute.name)))
        .map(style => String(style.textContent || ''))
        .join('\n');
    clone.querySelectorAll?.('style')?.forEach(style => style.remove());
    const textLength = decodeHtmlEntities(String(clone.textContent || ''))
        .replace(/\s+/g, ' ')
        .trim().length;
    const bodyElements = [...(clone.querySelectorAll?.('*') || [])]
        .filter(element => !['br'].includes(String(element.tagName || '').toLowerCase()));
    const semanticSelector = [
        'input', 'button', 'select', 'textarea', 'a[href]', 'label',
        'img', 'svg', 'canvas', 'video', 'audio', 'iframe', 'object', 'embed',
        'table', 'ul', 'ol', 'li', 'p', 'blockquote', 'pre', 'code',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figure', 'figcaption',
        'details', 'meter', 'progress', '[role]', '[tabindex]', '[contenteditable="true"]',
    ].join(',');
    const semanticElementCount = clone.querySelectorAll?.(semanticSelector)?.length || 0;
    const inlineVisualProgramCount = bodyElements.filter(element => {
        const style = String(element.getAttribute?.('style') || '');
        return /(?:background(?:-image)?\s*:[^;]*(?:url\(|gradient\()|mask(?:-image)?\s*:|clip-path\s*:|filter\s*:|content\s*:)/i.test(style);
    }).length;
    const stylesheetVisualProgramCount = (contentStyles.match(/@keyframes\b|content\s*:|background(?:-image)?\s*:[^;{}]*(?:url\(|gradient\()|mask(?:-image)?\s*:|clip-path\s*:/gi) || []).length;
    const visualProgramCount = inlineVisualProgramCount + stylesheetVisualProgramCount;
    const highConfidenceEmptyShell = textLength === 0
        && semanticElementCount === 0
        && bodyElements.length <= 2
        && visualProgramCount === 0;
    return {
        hasDetails: true,
        textLength,
        bodyElementCount: bodyElements.length,
        semanticElementCount,
        visualProgramCount,
        highConfidenceEmptyShell,
    };
}
function maintenanceMirrorCandidateHasBody(candidate) {
    const evidence = maintenanceMirrorBodyEvidence(candidate);
    return evidence.hasDetails && !evidence.highConfidenceEmptyShell
        && (evidence.textLength > 0
            || evidence.bodyElementCount > 0
            || evidence.semanticElementCount > 0
            || evidence.visualProgramCount > 0);
}
export function findRecoverableMaintenanceMirrorSource(message, root, { displayOnly = false } = {}) {
    const wantedSummary = normalizeMaintenanceSummaryText(getRabbitMirrorSummaryText(root));
    const candidates = maintenanceMessageSourceCandidates(message, { displayOnly });
    if (!displayOnly) {
        const chat = getAvailableHostChat();
        const messageIndex = Array.isArray(chat) ? chat.lastIndexOf(message) : -1;
        const snapshot = getRabbitMirrorGenerationSnapshot(message, chat, messageIndex, wantedSummary);
        if (snapshot?.source)
            candidates.push({ label: __rmT("EwjDeCR4VMApFSEBqI.1G4bOry8"), source: snapshot.source });
    }
    const seen = new Set();
    for (const candidateSource of candidates) {
        if (!candidateSource?.source || seen.has(candidateSource.source))
            continue;
        seen.add(candidateSource.source);
        const isolated = extractIsolatedMaintenanceMirrorSource(candidateSource.source, root);
        if (!isolated)
            continue;
        const candidate = findCleanMaintenanceMirrorNode(isolated, root);
        if (!candidate || !maintenanceMirrorCandidateHasBody(candidate))
            continue;
        const candidateSummary = normalizeMaintenanceSummaryText(getRabbitMirrorSummaryText(candidate));
        const titleMatches = !!wantedSummary && (candidateSummary === wantedSummary
            || candidateSummary.includes(wantedSummary)
            || wantedSummary.includes(candidateSummary));
        if (!titleMatches)
            continue;
        return { ...candidateSource, source: isolated };
    }
    return null;
}
export function extractMaintenanceMirrorSourceBySummary(source, root) {
    const text = String(source || '');
    if (!text || !normalizeMaintenanceSummaryText(getRabbitMirrorSummaryText(root)))
        return '';
    const candidate = chooseMatchingRawRabbitMirrorRoot(text, root);
    const isolated = String(candidate?.outerHTML || '').trim();
    if (!isolated || TRANSIENT_RERENDER_REASONING_ENVELOPE_RE.test(isolated))
        return '';
    return isolated;
}
function quarantineMaintenanceScriptBlocks(source) {
    return String(source || '').replace(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi, (_match, body) => {
        let encoded = '';
        try {
            encoded = encodeURIComponent(String(body || ''));
        }
        catch {
            encoded = '';
        }
        return `<template ${MAINTENANCE_QUARANTINED_SCRIPT_ATTR}="${encoded}"></template>`;
    });
}
function decodeQuarantinedMaintenanceScript(element) {
    const encoded = String(element?.getAttribute?.(MAINTENANCE_QUARANTINED_SCRIPT_ATTR) || '');
    if (!encoded)
        return '';
    try {
        return decodeURIComponent(encoded);
    }
    catch {
        return '';
    }
}
export function findMaintenanceElementByRawClass(root, rawClass) {
    const wanted = String(rawClass || '').trim();
    if (!root?.querySelectorAll || !wanted)
        return null;
    for (const element of root.querySelectorAll('[class]')) {
        const tokens = String(element.className || '').split(/\s+/).filter(Boolean);
        if (tokens.some(token => token === wanted || token === `custom-${wanted}` || token.endsWith(`-${wanted}`))) {
            return element;
        }
    }
    return null;
}
export function resolveMaintenanceGeneratedClass(root, rawClass) {
    const wanted = String(rawClass || '').trim();
    if (!wanted)
        return '';
    const existing = findMaintenanceElementByRawClass(root, wanted);
    if (existing) {
        const tokens = String(existing.className || '').split(/\s+/).filter(Boolean);
        return tokens.find(token => token === wanted || token === `custom-${wanted}` || token.endsWith(`-${wanted}`)) || wanted;
    }
    for (const style of root?.querySelectorAll?.('style') || []) {
        const css = String(style.textContent || '');
        const classRe = /\.([_a-zA-Z][\w-]*)/g;
        let match;
        while ((match = classRe.exec(css))) {
            const token = String(match[1] || '');
            if (token === wanted || token === `custom-${wanted}` || token.endsWith(`-${wanted}`))
                return token;
        }
    }
    return wanted;
}
function parseMaintenanceStaticDecorationPlans(scriptText) {
    const script = String(scriptText || '');
    if (!script || !/createElement\s*\(\s*['"]div['"]\s*\)/i.test(script))
        return [];
    const targets = new Map();
    const childClasses = new Map();
    const plans = [];
    const targetRe = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*document\.querySelector\(\s*(['"])\.([A-Za-z_][\w-]*)\2\s*\)/g;
    const classRe = /([A-Za-z_$][\w$]*)\.className\s*=\s*(['"])([^'"]+)\2/g;
    const appendRe = /([A-Za-z_$][\w$]*)\.appendChild\(\s*([A-Za-z_$][\w$]*)\s*\)/g;
    let match;
    while ((match = targetRe.exec(script)))
        targets.set(match[1], match[3]);
    while ((match = classRe.exec(script)))
        childClasses.set(match[1], String(match[3] || '').trim());
    while ((match = appendRe.exec(script))) {
        const targetClass = targets.get(match[1]);
        const childClass = childClasses.get(match[2]);
        if (!targetClass || !childClass)
            continue;
        const signal = `${targetClass} ${childClass}`.toLowerCase();
        const kind = /(?:star|stars|spark|twinkle)/.test(signal)
            ? 'stars'
            : /(?:building|cityscape|skyline)/.test(signal) ? 'buildings' : '';
        if (kind)
            plans.push({ targetClass, childClass, kind });
    }
    return plans.slice(0, 4);
}
function installMaintenanceStaticDecorationFallback(root, scriptText) {
    if (!root?.querySelectorAll)
        return 0;
    let created = 0;
    for (const plan of parseMaintenanceStaticDecorationPlans(scriptText)) {
        const target = findMaintenanceElementByRawClass(root, plan.targetClass);
        if (!target || target.children.length > 4)
            continue;
        const childClass = resolveMaintenanceGeneratedClass(root, plan.childClass);
        if (!childClass)
            continue;
        const count = plan.kind === 'stars' ? 24 : 10;
        for (let index = 0; index < count; index += 1) {
            const child = document.createElement('div');
            child.className = childClass;
            child.setAttribute(MAINTENANCE_STATIC_DECOR_CHILD_ATTR, plan.kind);
            if (plan.kind === 'stars') {
                const size = 1 + ((index * 7) % 4) * 0.45;
                child.style.width = `${size.toFixed(2)}px`;
                child.style.height = `${size.toFixed(2)}px`;
                child.style.top = `${(index * 37 + 9) % 96}%`;
                child.style.left = `${(index * 53 + 5) % 98}%`;
                child.style.animationDelay = `${-((index * 0.47) % 5).toFixed(2)}s`;
                child.style.animationDuration = `${(3 + (index % 5) * 0.55).toFixed(2)}s`;
            }
            else {
                child.style.left = `${Math.min(95, index * 9.7).toFixed(1)}%`;
                child.style.height = `${14 + ((index * 17) % 47)}%`;
                child.style.width = `${3 + ((index * 5) % 6)}%`;
                child.style.opacity = `${(0.32 + (index % 5) * 0.11).toFixed(2)}`;
            }
            target.appendChild(child);
            created += 1;
        }
        target.setAttribute(MAINTENANCE_STATIC_DECOR_ATTR, `${plan.kind}:${count}`);
    }
    return created;
}
function sanitizeMaintenanceMirrorTemplate(template) {
    if (!template?.content?.querySelectorAll)
        return null;
    const scriptSources = [];
    for (const placeholder of [...template.content.querySelectorAll(`template[${MAINTENANCE_QUARANTINED_SCRIPT_ATTR}]`)]) {
        scriptSources.push(decodeQuarantinedMaintenanceScript(placeholder));
        placeholder.remove();
    }
    for (const script of [...template.content.querySelectorAll('script')]) {
        scriptSources.push(String(script.textContent || ''));
        script.remove();
    }
    if (!sanitizeRabbitMirrorUntrustedTemplate(template))
        return null;
    let decorationCount = 0;
    for (const scriptSource of scriptSources) {
        decorationCount += installMaintenanceStaticDecorationFallback(template.content, scriptSource);
    }
    return { strippedScriptCount: scriptSources.length, decorationCount };
}
function prepareMaintenanceMirrorSource(source) {
    let text = decodeHtmlEntities(String(source || ''))
        .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
        .trim();
    if (!text)
        return '';
    text = quarantineMaintenanceScriptBlocks(text);
    text = rescueDamagedDataUriRabbitMirrorOutput(text);
    text = rescuePlainTextRabbitMirrorOutput(text) || text;
    text = cleanRabbitMirrorOutput(text) || text;
    return text.trim();
}
function extractIsolatedMaintenanceMirrorSource(source, root) {
    let text = decodeHtmlEntities(String(source || ''))
        .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
        .trim();
    if (!text)
        return '';
    const isolatedBySummary = extractMaintenanceMirrorSourceBySummary(text, root);
    if (isolatedBySummary) {
        const repairedIsolated = rescueDamagedDataUriRabbitMirrorOutput(isolatedBySummary).trim();
        if (repairedIsolated
            && !TRANSIENT_RERENDER_REASONING_ENVELOPE_RE.test(repairedIsolated)
            && /<(?:toto|details)\b/i.test(repairedIsolated)
            && __rmR("5C.LFe5gpgDNlp12QWacIU2t618I1L7hPo9BpEfR7AL2z8gGQIsYntJhUGMu83HhnZyBqEZy", "i").test(repairedIsolated)) {
            return repairedIsolated;
        }
    }
    text = rescueDamagedDataUriRabbitMirrorOutput(text);
    const matched = chooseMatchingRawRabbitMirrorRoot(text, root);
    const isolated = String(matched?.outerHTML || '').trim();
    if (!isolated)
        return '';
    const wantedSummary = normalizeMaintenanceSummaryText(getRabbitMirrorSummaryText(root));
    const matchedSummary = normalizeMaintenanceSummaryText(getRabbitMirrorSummaryText(matched));
    const titleMatches = !!wantedSummary && (matchedSummary === wantedSummary
        || matchedSummary.includes(wantedSummary)
        || wantedSummary.includes(matchedSummary));
    if (!titleMatches)
        return '';
    if (TRANSIENT_RERENDER_REASONING_ENVELOPE_RE.test(isolated))
        return '';
    if (!/<(?:toto|details)\b/i.test(isolated) || !__rmR("5C.LFe5gpgDNlp12QWacIU2t618I1L7hPo9BpEfR7AL2z8gGQIsYntJhUGMu83HhnZyBqEZy", "i").test(isolated))
        return '';
    return isolated;
}
export function findCleanMaintenanceMirrorNode(source, root) {
    const cleaned = prepareMaintenanceMirrorSource(source);
    if (!cleaned || typeof document === 'undefined')
        return null;
    if (!validateRabbitMirrorMarkupLexicalBudget(cleaned))
        return null;
    const wantedSummary = normalizeMaintenanceSummaryText(getRabbitMirrorSummaryText(root));
    try {
        const template = document.createElement('template');
        template.innerHTML = cleaned;
        if (!sanitizeMaintenanceMirrorTemplate(template))
            return null;
        const candidates = [];
        for (const toto of template.content.querySelectorAll('toto')) {
            const cloned = toto.cloneNode(true);
            if (cloned.querySelector?.('details'))
                candidates.push(cloned);
        }
        if (!candidates.length) {
            for (const details of template.content.querySelectorAll('details')) {
                const holder = document.createElement('toto');
                holder.setAttribute('data-rabbit-mirror', 'true');
                holder.style.display = 'block';
                holder.appendChild(details.cloneNode(true));
                candidates.push(holder);
            }
        }
        let fallback = null;
        for (const candidate of candidates) {
            fallback ||= candidate;
            const candidateSummary = normalizeMaintenanceSummaryText(getRabbitMirrorSummaryText(candidate));
            const titleMatches = !!wantedSummary && (candidateSummary === wantedSummary
                || candidateSummary.includes(wantedSummary)
                || wantedSummary.includes(candidateSummary));
            if (titleMatches)
                return candidate;
        }
        return !wantedSummary && candidates.length === 1 ? fallback : null;
    }
    catch (error) {
        console.debug('[RabbitMirror] maintenance source parse failed:', error);
        return null;
    }
}
function replaceMaintenanceMirrorDomFromSource(root, source) {
    if (!root?.isConnected || typeof document === 'undefined')
        return false;
    const candidate = findCleanMaintenanceMirrorNode(source, root);
    if (!candidate || !maintenanceMirrorCandidateHasBody(candidate))
        return false;
    const currentToto = root.matches?.(MIRROR_TOTO_SELECTOR)
        ? root
        : root.closest?.(MIRROR_TOTO_SELECTOR);
    const currentDetails = root.matches?.('details') ? root : root.querySelector?.('details');
    const candidateDetails = candidate instanceof Element ? candidate.querySelector('details') : null;
    const replaceTarget = currentToto?.isConnected ? currentToto : currentDetails?.isConnected ? currentDetails : root;
    const clonedDetails = candidateDetails?.cloneNode?.(true);
    const replacement = currentToto?.isConnected
        ? candidate
        : clonedDetails instanceof Element ? clonedDetails : null;
    if (!replaceTarget?.isConnected || !replacement)
        return false;
    const wasOpen = !!currentDetails?.open;
    replaceTarget.replaceWith(replacement);
    const liveRoot = replacement.matches?.('details') ? replacement : replacement.querySelector?.('details') || replacement;
    bindRabbitMirrorAvatarRoot(liveRoot);
    const liveDetails = liveRoot.matches?.('details') ? liveRoot : liveRoot.querySelector?.('details');
    if (liveDetails instanceof HTMLDetailsElement && wasOpen)
        liveDetails.open = true;
    installMaintenanceRabbitForRoot(liveRoot);
    return true;
}
function installMaintenanceSourceTruncationNotice(root, inspection) {
    if (!root?.isConnected || typeof document === 'undefined')
        return false;
    const details = root.matches?.('details') ? root : root.querySelector?.('details');
    if (!details)
        return false;
    if (details.querySelector?.(`[${SOURCE_TRUNCATION_NOTICE_ATTR}]`))
        return false;
    const notice = document.createElement('div');
    notice.setAttribute(SOURCE_TRUNCATION_NOTICE_ATTR, 'true');
    notice.setAttribute('role', 'status');
    notice.style.cssText = 'box-sizing:border-box;width:calc(100% - 24px);margin:16px 12px;padding:16px;border:1px dashed currentColor;border-radius:6px;background:rgba(127,127,127,.08);color:inherit;line-height:1.65.5;opacity:.9;';
    const title = document.createElement('div');
    title.style.cssText = 'font-weight:700;margin-bottom:6px;';
    title.textContent = inspection?.full?.rawCssTruncated ? __rmT("X4Mu7eINz40dAA7uGK_") : __rmT("X4Mu7eINz4hiTI7ImoG");
    const message = document.createElement('div');
    const independent = isIndependentMaintenanceRoot(root);
    message.textContent = inspection?.full?.rawCssTruncated
        ? (independent ? __rmT("YA3Ss.64gZWjgwzwTqNqYbE5fetPa.25fOLGPcD1RDXorvCk3Y6w7YSrPXOSPHHfHrlths62.PS8MQvaZDSjZdRvYhlAtXMQvlFWrb3X03t4N1MntanJIw41OcaAP7OB1GCu4shWpm96C.KLy4YujAU0dJhSIf") : __rmT(".vG1WjQgM.omeRm0y7LoARO5nJzC.1hmTX7wvWwNgRRcccJzdEEJHHTDyiqMz4qFdzbfVqBQcH_yzvkOrOAw20WDZqEVT_p5x1WFEWOzV74sQtFkU5783OR92XY6WWINBPvuLkDSKVXzZh"))
        : (independent ? __rmT("qAJr3rITsZldl4wMtu4a5IfXtNRDO2lHKji_wHEfFgDQMazy0qfBPfWfkd.OEnpaugNrlcAY5nGsIsY19_cYRVFvoI7c.btyHayYjF2ERSoOe1ctEi0WXkNkEesEZf") : __rmT("GVZwqQQtm7c6MpwrHMJVXLC8wpRONLKXhoMeuhr5CVCxhnfKlkQW.zxDM_gNb5nD2SoITl4keOty9X39gA.KE9pza.FI6xgCfcAx79Y1dpdeii_z"));
    const detail = document.createElement('div');
    detail.style.cssText = 'margin-top:8px;font-size:.88em;opacity:.72;';
    detail.textContent = __rmT("cB.ps1AP4UJD_bLHrvID3Eq8sHXGJNGOfd_KdiYQ6YQMC3UDq8_");
    notice.append(title, message, detail);
    const summary = details.querySelector?.(':scope > summary') || details.querySelector?.('summary');
    if (summary)
        summary.insertAdjacentElement('afterend', notice);
    else
        details.prepend(notice);
    return true;
}
export function isIndependentMaintenanceRoot(root) {
    if (independentMaintenanceHost(root))
        return true;
    const details = root?.matches?.('details') ? root : root?.querySelector?.('details');
    return String(details?.dataset?.rabbitMirrorExternalSource || '') === 'independent';
}
function exactIndependentMaintenanceRoot(root) {
    const face = getRabbitMirrorFacePosition(root);
    if (face?.source === 'independent')
        return face.details || null;
    const host = independentMaintenanceHost(root);
    return host ? null : root;
}
function independentMaintenanceRootHasBody(root) {
    const details = exactIndependentMaintenanceRoot(root)?.matches?.('details')
        ? exactIndependentMaintenanceRoot(root)
        : exactIndependentMaintenanceRoot(root)?.querySelector?.('details');
    if (!details)
        return false;
    const summary = details.querySelector?.(':scope > summary');
    return [...(details.childNodes || [])].some(node => {
        if (node === summary || isHostDetailsCollapseControl(node))
            return false;
        if (node.nodeType === 3)
            return !!String(node.textContent || '').trim();
        if (node.nodeType !== 1 || ['STYLE', 'SCRIPT', 'TEMPLATE', 'LINK', 'META'].includes(node.tagName))
            return false;
        if (node.matches?.('[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-source-truncation-notice]'))
            return false;
        if (node.hidden || String(node.getAttribute?.('aria-hidden') || '').toLowerCase() === 'true')
            return false;
        return !!(String(node.textContent || '').trim() || node.children?.length || node.matches?.('img,svg,canvas,video,audio,input,button,select,textarea,table,ul,ol,section,article,main,figure,form'));
    });
}
function repairMaintenanceMessageSource(root, inspection) {
    if (isIndependentMaintenanceRoot(root)) {
        const blank = !independentMaintenanceRootHasBody(root);
        const localInspection = blank
            ? { ...inspection, full: { ...(inspection?.full || {}), rawSourceBodyMissing: true } }
            : inspection;
        const noticeShown = blank ? installMaintenanceSourceTruncationNotice(root, localInspection) : false;
        return { changed: false, noticeShown, unrecoverable: blank, index: getMessageIndexFromMirrorNode(root), reason: blank
                ? __rmT("yDhCZMWDnm5uwqF1Af6xfq3LwughRpTVXXc63HoSIpuZlJfbe01hmugtX.bhxXp1qvp2UbQMzY7eAwis.WUETK3_1GO0PDa6zUdDzD2q81KkH5VbBJT") : __rmT("6wh.rZfv5A4oYArkVWymCvbXZLyWpFwy7Bmv1Km1RF4faZ1g7t5ISh_r4DkANI1yyhb3F_7AlVOV8vsKC5LOpLgRBygK.0JbxKBZRLazwG1UXkheeP80if") };
    }
    const index = getMessageIndexFromMirrorNode(root);
    if (index < 0)
        return { changed: false, index, reason: __rmT("hGH3w9GHYGnRpiMV4HaHxT") };
    const host = hostScriptModule || globalThis;
    const chat = host?.chat || globalThis.chat;
    const message = Array.isArray(chat) ? chat[index] : null;
    if (!message || message?.is_user)
        return { changed: false, index, reason: __rmT("IEsGl.e4HC121lJJ9lMlo9PCVgMPZk") };
    const hasReasoningEnvelope = messageContainsReasoningEnvelope(message);
    const distinctDisplaySource = messageUsesDistinctDisplaySource(message);
    const source = getSelectedMessageSource(message, { preferDisplay: distinctDisplaySource });
    if (!source)
        return { changed: false, index, reason: distinctDisplaySource ? __rmT("iBE7oxmpmCYj8yVNDXX4WttRaBTN_MUmkUXfXr_IRUZiRh") : __rmT("t2ULwD6x.xkPLXQuWKl4AGUb") };
    if (inspection?.full?.rawSourceBodyMissing) {
        const alternate = findRecoverableMaintenanceMirrorSource(message, root, { displayOnly: distinctDisplaySource });
        if (alternate?.source) {
            const recovered = replaceMaintenanceMirrorDomFromSource(root, alternate.source);
            if (recovered) {
                return { changed: true, index, reason: `${__rmT("Unz_YEXIsSo_8TV2SEf")}${alternate.label}${__rmT("S6gUry99rR4JQ1AT2PHfjSdKXuz0UdRESvVgBhUppoKWmJ_P")}` };
            }
        }
        const noticeShown = installMaintenanceSourceTruncationNotice(root, inspection);
        const reason = inspection?.full?.rawCssTruncated
            ? __rmT("1wWrftNKu7rmI4j7oSSfIUaTYTOl3WJepKFrSYWTytsyxLgO1VQDEGfMDQR8fC5XbLcRgXl_xRlTPjcD0MS3IUAtUF2ghy24Nzb1pWNiq6KYmisDeD9BAh") : __rmT("1NthNxyVMVH_pgkdNzHrBepqR163VByYLzAmBV2cFu7yMHBvGNFPg6Nc8oIdmCBRbTskZ4AAQdhoBd6HFS_FNY8DO3Ccq2x4zq3bWCLMdEIEOXnBqzlbOCNBxEo2gWkcm8_l2EuY");
        return { changed: false, noticeShown, unrecoverable: true, index, reason };
    }
    const hasSourceCandidate = inspection?.full?.sourceCandidate || inspection?.code?.strictWhole || inspection?.code?.needsSanitize;
    if (hasSourceCandidate) {
        const recoverable = findRecoverableMaintenanceMirrorSource(message, root, { displayOnly: distinctDisplaySource });
        const sourceForRecovery = recoverable?.source || source;
        const isolatedMirrorSource = extractIsolatedMaintenanceMirrorSource(sourceForRecovery, root);
        if (isolatedMirrorSource) {
            const directDomRecovered = replaceMaintenanceMirrorDomFromSource(root, isolatedMirrorSource);
            if (directDomRecovered) {
                const notes = [];
                if (recoverable?.label)
                    notes.push(`${__rmT("dX7SwCI6")}${recoverable.label}`);
                if (hasReasoningEnvelope)
                    notes.push(__rmT("Un4rSWSE6TWhsr.GK5G"));
                if (/<script\b/i.test(isolatedMirrorSource))
                    notes.push(__rmT("jvfZl78F2_kRyi4v0lvoweQMAL800vPhRo8"));
                const note = notes.length ? `${__rmT("eis")}${notes.join(__rmT("7os"))}${__rmT("eXs")}` : '';
                return { changed: true, index, reason: `${__rmT("LW7qt7PD4FiJl1Fnz4_8zzs2R7dC0xJk3hvbW7AoEFAASEoLxSckV_KO7PG")}${note}` };
            }
        }
        if (!hasReasoningEnvelope && !distinctDisplaySource) {
            const directRecovered = recoverMessageSourceToDisplay(host, index, message, { force: true, sourceOverride: source });
            if (directRecovered)
                return { changed: true, index, reason: __rmT("AMSHlTptg1Cdo_MG1ZixHygA9n3GKCGTJVqHdZbC9qw2Hr7YWXE") };
        }
    }
    if (hasReasoningEnvelope) {
        return { changed: false, index, reason: __rmT("JftVbh5nSXBE6bAepUv7mb7sXFx1TbdRn28r62qXEqmZ8ytHo_iYdhAjXXMj_2yiZTQ9OMLsBUPJur.ZAJ6tq28vBT8X7fPmzXl") };
    }
    if (distinctDisplaySource) {
        return { changed: false, index, reason: __rmT("hivF9YATEMUsrHjMOCx1eM1vlnI3FEm5aHjapM4TWhT2TTpKsvDRGDcHLKCkuZThikqsARm8T7KPVBPM2wb0ek") };
    }
    let repaired = source;
    if (inspection?.full?.damagedDataUriCandidate || inspection?.full?.structureTruncated) {
        repaired = rescueDamagedDataUriRabbitMirrorOutput(repaired);
    }
    if (inspection?.full?.sourceCandidate || inspection?.code?.strictWhole || inspection?.code?.needsSanitize) {
        repaired = rescuePlainTextRabbitMirrorOutput(repaired) || repaired;
    }
    if (!repaired || repaired === source)
        return { changed: false, index, reason: __rmT("6TkKbVy6phTYrNy9cET") };
    const transientMessage = setTransientMessageSource(message, repaired);
    const changed = preserveAndRerenderSanitizedMessage(host, index, transientMessage);
    return { changed, index, reason: changed ? __rmT("VK2HrizpVR6fI770dEiDl5YGqDcGTJLWGN4aK2s2") : __rmT("l24VhyntVPuk8LSW.MW0Jh") };
}
function maintenanceSnapshotKey(root) {
    const index = getMessageIndexFromMirrorNode(root);
    const chat = getAvailableHostChat();
    const message = index >= 0 ? chat[index] : null;
    const swipe = Number.isInteger(message?.swipe_id) ? message.swipe_id : 0;
    const host = root?.matches?.('[data-rabbit-mirror-external-source="true"]')
        ? root
        : root?.closest?.('[data-rabbit-mirror-external-source="true"]');
    const sourceKind = String(host?.dataset?.rmSource || '');
    const ownerKey = sourceKind === 'independent' ? String(host?.dataset?.rmKey || '') : '';
    const faceIndex = getRabbitMirrorFacePosition(root)?.faceIndex;
    let chatKey = 'chat';
    try {
        chatKey = String(getCurrentChatKey?.(chat) || 'chat');
    }
    catch { }
    const mirrorIdentity = ownerKey ? '' : followMaintenanceMirrorIdentity(root);
    if (!ownerKey && !mirrorIdentity)
        return '';
    const facePart = Number.isInteger(faceIndex) ? `:face:${faceIndex}` : '';
    return ownerKey ? `${chatKey}:${ownerKey}${facePart}` : `${chatKey}:${index}:${swipe}:${mirrorIdentity}${facePart}`;
}
function captureMaintenanceRepairOrigin(root) {
    const index = getMessageIndexFromMirrorNode(root);
    const chat = getAvailableHostChat();
    const message = index >= 0 ? chat[index] : null;
    const swipe = Number.isInteger(message?.swipe_id) ? message.swipe_id : 0;
    const host = root?.matches?.('[data-rabbit-mirror-external-source="true"]')
        ? root
        : root?.closest?.('[data-rabbit-mirror-external-source="true"]');
    const sourceKind = String(host?.dataset?.rmSource || '');
    const ownerKey = sourceKind === 'independent' ? String(host?.dataset?.rmKey || '') : '';
    let chatKey = 'chat';
    try {
        chatKey = String(getCurrentChatKey?.(chat) || 'chat');
    }
    catch { }
    const selectedSource = message && !message?.is_user
        ? getSelectedMessageSource(message, { preferDisplay: messageUsesDistinctDisplaySource(message) })
        : '';
    const sourceHash = ownerKey
        ? String(host?.dataset?.rmSourceHash || '')
        : (selectedSource ? hashInteractionSignature(selectedSource) : '');
    const faceIndex = getRabbitMirrorFacePosition(root)?.faceIndex;
    const mirrorIdentity = ownerKey
        ? `${ownerKey}${Number.isInteger(faceIndex) ? `:face:${faceIndex}` : ''}`
        : followMaintenanceMirrorIdentity(root);
    const remountEpoch = ownerKey ? String(host?.dataset?.rmFaceRemountEpoch || '0') : '';
    return Object.freeze({ chatKey, index, swipe, sourceHash, mirrorIdentity, ownerKey, faceIndex, remountEpoch });
}
function maintenanceRepairOriginKey(origin) {
    if (!origin)
        return '';
    const owner = origin.ownerKey || `${origin.index}:${origin.swipe}`;
    return `${origin.chatKey}:${owner}:${origin.sourceHash}:${origin.mirrorIdentity}`;
}
function maintenanceRepairOriginIsCurrent(origin) {
    if (!origin)
        return false;
    const chat = getAvailableHostChat();
    let chatKey = 'chat';
    try {
        chatKey = String(getCurrentChatKey?.(chat) || 'chat');
    }
    catch { }
    if (chatKey !== origin.chatKey)
        return false;
    if (origin.ownerKey) {
        if (typeof document === 'undefined')
            return false;
        const host = [...(document.querySelectorAll?.('[data-rabbit-mirror-external-source="true"][data-rm-source="independent"]') || [])]
            .find(candidate => String(candidate?.dataset?.rmKey || '') === origin.ownerKey);
        if (!host?.isConnected || !Number.isInteger(origin.faceIndex))
            return false;
        if (String(host.dataset?.rmFaceRemountEpoch || '0') !== String(origin.remountEpoch || '0'))
            return false;
        const currentSourceHash = String(host.dataset?.rmSourceHash || '');
        const faces = [...(host.children || [])].filter(child => child?.matches?.('details') && isRabbitMirrorDetails(child));
        const currentFace = faces[origin.faceIndex];
        return !!origin.sourceHash && !!currentSourceHash && currentSourceHash === origin.sourceHash
            && !!currentFace && getRabbitMirrorFacePosition(currentFace)?.faceIndex === origin.faceIndex;
    }
    const message = Number.isInteger(origin.index) && origin.index >= 0 ? chat[origin.index] : null;
    if (!message || message?.is_user)
        return false;
    const swipe = Number.isInteger(message?.swipe_id) ? message.swipe_id : 0;
    if (swipe !== origin.swipe)
        return false;
    const source = getSelectedMessageSource(message, { preferDisplay: messageUsesDistinctDisplaySource(message) });
    const sourceHash = source ? hashInteractionSignature(source) : '';
    if (!sourceHash || sourceHash !== origin.sourceHash || !origin.mirrorIdentity)
        return false;
    const messageElement = getRenderedMessageElement(origin.index);
    if (!messageElement?.isConnected)
        return false;
    return getRenderedRabbitMirrorInteractionRoots(messageElement)
        .some(candidate => followMaintenanceMirrorIdentity(candidate) === origin.mirrorIdentity);
}
export function beginMaintenanceRepairRun(root, button) {
    const origin = captureMaintenanceRepairOrigin(root);
    if (!origin.ownerKey && !origin.mirrorIdentity) {
        failMaintenanceRabbit(button, isNameMaskActive()
            ? __rmT("gEUmEBEU16pyKges7jA7XwjVFtGCX7wotp82DHjFT0icTmwnCRZo4Jwx_h7DHrs0vEiRxcPIm7AozyjQg0biGf") : __rmT("Psql1YBLmAn7OdeBdpducGHp3E5mwehlzH5TCYxQfSA9cSC6bkgkaFvRd5HqAG4DFwDzVT"));
        return null;
    }
    const key = maintenanceRepairOriginKey(origin);
    if (!key || maintenanceRepairActiveRuns.has(key))
        return null;
    const token = (Number(maintenanceRepairRunTokens.get(key)) || 0) + 1;
    maintenanceRepairRunTokens.delete(key);
    maintenanceRepairRunTokens.set(key, token);
    maintenanceRepairActiveRuns.add(key);
    const repairRun = Object.freeze({ key, token, origin, button });
    maintenanceRepairRunRecords.set(key, repairRun);
    return repairRun;
}
function maintenanceRepairRunIsCurrent(repairRun) {
    return !!repairRun
        && maintenanceRepairActiveRuns.has(repairRun.key)
        && maintenanceRepairRunTokens.get(repairRun.key) === repairRun.token
        && maintenanceRepairOriginIsCurrent(repairRun.origin);
}
function maintenanceButtonsStuckInRun(repairRun) {
    const stuck = new Set();
    const isChecking = button => button?.isConnected && button.getAttribute?.(MAINTENANCE_STATE_ATTR) === MAINTENANCE_STATES.checking
        && !button.hasAttribute?.('data-rabbit-mirror-external-waiting');
    if (isChecking(repairRun.button))
        stuck.add(repairRun.button);
    let candidates = [];
    try {
        candidates = [...(globalThis.document?.querySelectorAll?.(`[${MAINTENANCE_RABBIT_ATTR}][${MAINTENANCE_STATE_ATTR}="${MAINTENANCE_STATES.checking}"]`) || [])];
    }
    catch {
        candidates = [];
    }
    for (const button of candidates) {
        if (stuck.has(button) || !isChecking(button))
            continue;
        const roots = [button.closest?.('details'), button.closest?.('toto'), button.closest?.('[data-rabbit-mirror-external-source="true"]')].filter(Boolean);
        try {
            if (roots.some(root => maintenanceRepairOriginKey(captureMaintenanceRepairOrigin(root)) === repairRun.key))
                stuck.add(button);
        }
        catch { }
    }
    return [...stuck];
}
export function finishMaintenanceRepairRun(repairRun, { sweepStuck = true } = {}) {
    if (!repairRun || maintenanceRepairRunTokens.get(repairRun.key) !== repairRun.token)
        return false;
    for (const button of sweepStuck ? maintenanceButtonsStuckInRun(repairRun) : []) {
        try {
            failMaintenanceRabbit(button, __rmT("0NYhK474hkOVV.etNM84s9A16Lz_CpFydERVnxNpkgXJinYL1ZMeUKWEkXCY6z8ZdfxNAlqjnf_g0DxAdiXv5Vw1Ls_rk7gCfcakd4PAmMCTYYOj"));
        }
        catch { }
    }
    maintenanceRepairActiveRuns.delete(repairRun.key);
    maintenanceRepairRunRecords.delete(repairRun.key);
    for (const [timer, key] of maintenanceRepairTimers.entries()) {
        if (key !== repairRun.key)
            continue;
        clearTimeout(timer);
        maintenanceRepairTimers.delete(timer);
    }
    while (maintenanceRepairRunTokens.size > 128) {
        const oldest = maintenanceRepairRunTokens.keys().next().value;
        if (!oldest || maintenanceRepairActiveRuns.has(oldest))
            break;
        maintenanceRepairRunTokens.delete(oldest);
    }
    return true;
}
function scheduleMaintenanceRepairCallback(repairRun, delay, callback, button = repairRun?.button) {
    let timer = 0;
    timer = setTimeout(() => {
        maintenanceRepairTimers.delete(timer);
        if (!maintenanceRepairRunIsCurrent(repairRun)) {
            cancelMaintenanceRepairRun(repairRun, __rmT("l8v1EXPNoC4f9BpMykwNuvWD4yuMDFPJJ4.6oCuq0y8ZTBMOn1ZVBwI4KBjIB9HF"));
            return;
        }
        try {
            callback();
        }
        catch (error) {
            console.debug('[RabbitMirror] delayed maintenance repair failed:', error);
            failMaintenanceRabbit(button, __rmT("cB.psRsCVQy6nwo8rzWT3bg1aXaHdpbUu1oA9_bByGsJnFZd_RD"));
            finishMaintenanceRepairRun(repairRun);
        }
    }, Math.max(0, Number(delay) || 0));
    maintenanceRepairTimers.set(timer, repairRun?.key || '');
    return timer;
}
export function cancelMaintenanceRepairRun(repairRun, reason = __rmT("bqwU0HVYnNR_mMqVlcLxLyA6CC_nxFer"), { notify = true } = {}) {
    if (!repairRun || maintenanceRepairRunTokens.get(repairRun.key) !== repairRun.token)
        return false;
    if (notify && repairRun.button?.isConnected)
        failMaintenanceRabbit(repairRun.button, `❌ ${reason}`);
    return finishMaintenanceRepairRun(repairRun, { sweepStuck: notify });
}
export function cancelMaintenanceRepairRuns(reason = __rmT("yJJmHW3n2v5bMzdcDRIyfEf64B97NWzjNVQVTquKRaANpIjYzkolrk"), { notify = false } = {}) {
    const activeRuns = [...maintenanceRepairRunRecords.values()];
    for (const timer of maintenanceRepairTimers.keys())
        clearTimeout(timer);
    maintenanceRepairTimers.clear();
    if (notify) {
        for (const repairRun of activeRuns) {
            if (repairRun.button?.isConnected)
                failMaintenanceRabbit(repairRun.button, `❌ ${reason}`);
        }
    }
    maintenanceRepairActiveRuns.clear();
    maintenanceRepairRunRecords.clear();
    maintenanceRepairRunTokens.clear();
}
function trimMaintenanceSnapshots(max = 24) {
    while (maintenancePreRepairSnapshots.size > max) {
        const oldest = [...maintenancePreRepairSnapshots.entries()].sort((a, b) => Number(a[1]?.ts || 0) - Number(b[1]?.ts || 0))[0]?.[0];
        if (!oldest)
            break;
        maintenancePreRepairSnapshots.delete(oldest);
    }
}
function trimRabbitMirrorInteractionResetSnapshots(max = 24) {
    while (rabbitMirrorInteractionResetSnapshots.size > max) {
        const oldest = [...rabbitMirrorInteractionResetSnapshots.entries()].sort((a, b) => Number(a[1]?.ts || 0) - Number(b[1]?.ts || 0))[0]?.[0];
        if (!oldest)
            break;
        rabbitMirrorInteractionResetSnapshots.delete(oldest);
    }
}
function rabbitMirrorInteractionResetIdentityNode(root) {
    if (!root)
        return null;
    if (root.matches?.('details'))
        return root;
    return root.querySelector?.(':scope > details') || root.querySelector?.('details') || root;
}
function rabbitMirrorInteractionResetInstanceId(root, create = false) {
    const node = rabbitMirrorInteractionResetIdentityNode(root);
    if (!node)
        return '';
    let id = rabbitMirrorInteractionResetInstanceIds.get(node) || '';
    if (!id && create) {
        rabbitMirrorInteractionResetInstanceCounter += 1;
        id = `${Date.now().toString(36)}-${rabbitMirrorInteractionResetInstanceCounter.toString(36)}`;
        rabbitMirrorInteractionResetInstanceIds.set(node, id);
    }
    return id;
}
function rabbitMirrorInteractionResetSourceSignature(root) {
    const externalHost = root?.matches?.('[data-rabbit-mirror-external-source="true"]')
        ? root
        : root?.closest?.('[data-rabbit-mirror-external-source="true"]');
    const externalSourceHash = String(externalHost?.getAttribute?.('data-rabbit-mirror-owner-source-hash')
        || externalHost?.getAttribute?.('data-rm-owner-source-hash')
        || externalHost?.dataset?.rabbitMirrorOwnerSourceHash
        || '').trim();
    const externalOwnerKey = String(externalHost?.dataset?.rmKey || externalHost?.dataset?.rabbitMirrorExternalOwner || '').trim();
    if (externalSourceHash || externalOwnerKey) {
        return hashInteractionSignature(`external|${externalOwnerKey}|${externalSourceHash}`);
    }
    const index = getMessageIndexFromMirrorNode(root);
    const chat = getAvailableHostChat();
    const message = index >= 0 ? chat[index] : null;
    if (message && !message?.is_user) {
        const swipe = Number.isInteger(message?.swipe_id) ? message.swipe_id : 0;
        const mes = message.mes;
        const swipeSource = message.swipes?.[message.swipe_id];
        const display = message.extra?.display_text;
        const previous = rabbitMirrorInteractionResetSourceSignatures.get(message);
        if (previous && previous.index === index && previous.swipeId === message.swipe_id
            && previous.mes === mes && previous.swipeSource === swipeSource && previous.display === display)
            return previous.signature;
        const source = getSelectedMessageSource(message, { preferDisplay: messageUsesDistinctDisplaySource(message) });
        const signature = source ? hashInteractionSignature(`${index}|${swipe}|${source}`) : 'fallback';
        rabbitMirrorInteractionResetSourceSignatures.set(message, { index, swipeId: message.swipe_id, mes, swipeSource, display, signature });
        return signature;
    }
    return 'fallback';
}
function rabbitMirrorInteractionResetSnapshotKey(root, createInstance = false) {
    const base = maintenanceSnapshotKey(root);
    const instance = rabbitMirrorInteractionResetInstanceId(root, createInstance);
    const source = rabbitMirrorInteractionResetSourceSignature(root);
    return base && instance && source ? `${base}|mirror:${instance}|src:${source}` : '';
}
function cleanRabbitMirrorInteractionResetClone(details) {
    if (!details?.cloneNode)
        return null;
    const clone = cloneRabbitMirrorFilteredNode(details);
    restoreRabbitMirrorAvatarClone(details, clone);
    clone.querySelectorAll?.(`[${EXTERNAL_REFERENCE_NOTE_ATTR}]`)?.forEach(node => node.remove());
    clone.querySelectorAll?.(`[data-rm-image-region], [data-rm-image-portal], [${INTERACTION_DIAGNOSTIC_PANEL_ATTR}], [${MAINTENANCE_MENU_ATTR}], [${FEEDBACK_CAT_MENU_ATTR}], [${RECIPE_MENU_ATTR}]`)?.forEach(node => node.remove());
    clone.querySelector?.(':scope > summary > [data-rabbit-mirror-tool-entry-host]')?.remove?.();
    clone.querySelectorAll?.('[data-rabbit-mirror-maintenance-checked-sandbox]')?.forEach(node => node.remove());
    clone.querySelectorAll?.(`[${INTERACTION_HOME_ATTR}]`)?.forEach(node => node.remove());
    return clone;
}
export function removeRabbitMirrorInteractionHomeControls(root) {
    if (!root)
        return 0;
    const controls = new Set();
    if (root.matches?.(`[${INTERACTION_HOME_ATTR}]`))
        controls.add(root);
    root.querySelectorAll?.(`[${INTERACTION_HOME_ATTR}]`)?.forEach(node => controls.add(node));
    let removed = 0;
    for (const control of controls) {
        control.remove?.();
        removed += 1;
    }
    return removed;
}
function invalidateRabbitMirrorInteractionResetSnapshot(root) {
    rabbitMirrorInteractionResetBudgetSkips.delete(root);
    const key = rabbitMirrorInteractionResetSnapshotKey(root, false);
    if (key)
        rabbitMirrorInteractionResetSnapshots.delete(key);
}
function captureRabbitMirrorInteractionResetSnapshot(root) {
    if (!root?.isConnected)
        return false;
    const key = rabbitMirrorInteractionResetSnapshotKey(root, true);
    if (!key || rabbitMirrorInteractionResetSnapshots.has(key)
        || rabbitMirrorInteractionResetBudgetSkips.get(root) === key)
        return false;
    const budget = maintenanceRepairRootBudget(root);
    if (!budget.ok || budget.nodes > 1200 || budget.attributes > 4000) {
        rabbitMirrorInteractionResetBudgetSkips.set(root, key);
        return false;
    }
    rabbitMirrorInteractionResetBudgetSkips.delete(root);
    const details = root.matches?.('details') ? root : root.querySelector?.(':scope > details') || root.querySelector?.('details');
    if (!details?.parentNode)
        return false;
    const node = cleanRabbitMirrorInteractionResetClone(details);
    if (!node)
        return false;
    const instanceId = rabbitMirrorInteractionResetInstanceId(root, false);
    rabbitMirrorInteractionResetSnapshots.set(key, { node, instanceId, sourceSignature: rabbitMirrorInteractionResetSourceSignature(root), ts: Date.now() });
    trimRabbitMirrorInteractionResetSnapshots();
    removeRabbitMirrorInteractionHomeControls(root);
    return true;
}
export function hasRabbitMirrorInteractionResetSnapshot(root) {
    const key = rabbitMirrorInteractionResetSnapshotKey(root, false);
    return !!key && rabbitMirrorInteractionResetSnapshots.has(key);
}
export function rabbitMirrorInteractionRootFromTarget(target) {
    if (!(target instanceof Element))
        return null;
    const directToto = target.closest?.(MIRROR_TOTO_SELECTOR);
    if (directToto && isInsideChatMessage(directToto))
        return directToto;
    let details = target.closest?.('details');
    while (details) {
        if (isRabbitMirrorDetails(details) && isInsideChatMessage(details))
            return details;
        details = details.parentElement?.closest?.('details') || null;
    }
    const label = target.closest?.('label');
    const forId = String(label?.getAttribute?.('for') || '').trim();
    if (forId) {
        const input = label.ownerDocument?.getElementById?.(forId);
        if (input && input !== target)
            return rabbitMirrorInteractionRootFromTarget(input);
    }
    return null;
}
export function captureRabbitMirrorInteractionResetFromEventTarget(target) {
    if (!(target instanceof Element))
        return false;
    if (target.closest?.(`[data-rm-image-region], [data-rm-image-portal], [${TOOL_ENTRY_HOST_ATTR}], [${MAINTENANCE_MENU_ATTR}], [${FEEDBACK_CAT_MENU_ATTR}], [${RECIPE_MENU_ATTR}], [${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`))
        return false;
    const root = rabbitMirrorInteractionRootFromTarget(target);
    if (!root)
        return false;
    const details = getRabbitMirrorFacePosition(root)?.details
        || (root.matches?.('details') ? root : root.querySelector?.(':scope > details') || null);
    const summary = target.closest?.('summary');
    if (summary?.parentElement === details)
        return false;
    const actionable = target.closest?.('input, button, label, select, textarea, a[href], [role="button"], [tabindex], summary, [data-rabbit-mirror-change-pseudo-rescue], [data-rabbit-mirror-direct-id-click-rescue], [data-rabbit-mirror-clickable-adjacent-popup-fallback], [data-rabbit-mirror-container-internal-reveal-fallback]');
    if (!actionable || !details?.contains?.(actionable))
        return false;
    return captureRabbitMirrorInteractionResetSnapshot(root);
}
export function restoreRabbitMirrorInteractionResetSnapshot(root, button) {
    const key = rabbitMirrorInteractionResetSnapshotKey(root, false);
    const snapshot = key ? rabbitMirrorInteractionResetSnapshots.get(key) : null;
    if (!snapshot?.node) {
        setMaintenanceRabbitState(button, MAINTENANCE_STATES.unknown, __rmT("iGaUp6JwnXlyJZWCi6lRNQNcxaLcllcKVhHkbeMLsXKyqZpi"));
        return false;
    }
    const details = root.matches?.('details') ? root : root.querySelector?.(':scope > details') || root.querySelector?.('details');
    if (!details?.parentNode)
        return false;
    const keepOpen = details.hasAttribute('open');
    const restoredDetails = cloneRabbitMirrorFilteredNode(snapshot.node);
    restoreRabbitMirrorAvatarClone(snapshot.node, restoredDetails);
    filterRabbitMirrorRuntimeDom(restoredDetails);
    if (keepOpen)
        restoredDetails.setAttribute('open', '');
    else
        restoredDetails.removeAttribute('open');
    rearmRabbitMirrorSerializedInteractionRoot(restoredDetails);
    details.replaceWith(restoredDetails);
    if (snapshot.instanceId)
        rabbitMirrorInteractionResetInstanceIds.set(restoredDetails, snapshot.instanceId);
    const restoredRoot = root === details ? restoredDetails : root;
    try {
        activateRabbitMirrorInteractionRescue(restoredRoot);
    }
    catch (error) {
        console.debug('[RabbitMirror] interaction reset rescue rebind skipped:', error);
    }
    try {
        rehydrateRabbitMirrorMaintenanceRepairs(restoredRoot);
    }
    catch (error) {
        console.debug('[RabbitMirror] interaction reset maintenance rehydrate skipped:', error);
    }
    try {
        refreshRabbitMirrorToolsInScope(restoredRoot);
    }
    catch (error) {
        console.debug('[RabbitMirror] interaction reset tool refresh skipped:', error);
    }
    try {
        removeRabbitMirrorInteractionHomeControls(restoredRoot);
    }
    catch (error) {
        console.debug('[RabbitMirror] legacy interaction home cleanup skipped:', error);
    }
    const restoredButton = restoredRoot.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || restoredDetails.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || button;
    setMaintenanceRabbitState(restoredButton, MAINTENANCE_STATES.idle, __rmT("9oFkldpGfNWmdZwadAaDpeH0h.Cxui6ftDidOHOVRM9BIroBq.YRVu9NvnS9TWjeIbyyVf"));
    if (isIndependentMaintenanceRoot(restoredRoot))
        notifyIndependentRepairPersistence(restoredRoot);
    return true;
}
function captureMaintenancePreRepairSnapshot(root) {
    if (!root?.isConnected)
        return null;
    const details = root.matches?.('details') ? root : root.querySelector?.(':scope > details') || root.querySelector?.('details');
    if (!details?.parentNode)
        return null;
    const key = maintenanceSnapshotKey(root);
    const originalNode = details;
    if (isIndependentMaintenanceRoot(root)) {
        const snapshotNode = cloneRabbitMirrorFilteredNode(originalNode);
        const workingNode = cloneRabbitMirrorFilteredNode(originalNode);
        restoreRabbitMirrorAvatarClone(originalNode, snapshotNode);
        restoreRabbitMirrorAvatarClone(originalNode, workingNode);
        snapshotNode.querySelectorAll?.(`[data-rm-image-region], [data-rm-image-portal], [${INTERACTION_DIAGNOSTIC_PANEL_ATTR}], [${MAINTENANCE_MENU_ATTR}], [${FEEDBACK_CAT_MENU_ATTR}]`)?.forEach(node => node.remove());
        snapshotNode.querySelector?.(':scope > summary > [data-rabbit-mirror-tool-entry-host]')?.remove?.();
        workingNode.querySelectorAll?.(`[data-rm-image-region], [data-rm-image-portal], [${INTERACTION_DIAGNOSTIC_PANEL_ATTR}], [${MAINTENANCE_MENU_ATTR}], [${FEEDBACK_CAT_MENU_ATTR}]`)?.forEach(node => node.remove());
        workingNode.querySelector?.(':scope > summary > [data-rabbit-mirror-tool-entry-host]')?.remove?.();
        const wasOpen = originalNode.hasAttribute('open');
        rearmRabbitMirrorSerializedInteractionRoot(workingNode);
        originalNode.replaceWith(workingNode);
        if (wasOpen)
            workingNode.setAttribute('open', '');
        else
            workingNode.removeAttribute('open');
        try {
            rehydrateRabbitMirrorMaintenanceRepairs(workingNode, { cloned: true });
        }
        catch (error) {
            console.debug('[RabbitMirror] maintenance clone rehydrate skipped:', error);
        }
        try {
            refreshRabbitMirrorToolsInScope?.(workingNode);
        }
        catch { }
        maintenancePreRepairSnapshots.set(key, {
            node: snapshotNode,
            open: wasOpen,
            ts: Date.now(),
        });
        trimMaintenanceSnapshots();
        const workingButton = workingNode.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || null;
        return { key, root: workingNode, button: workingButton };
    }
    const snapshotNode = cloneRabbitMirrorFilteredNode(originalNode);
    restoreRabbitMirrorAvatarClone(originalNode, snapshotNode);
    snapshotNode.querySelectorAll?.(`[data-rm-image-region], [data-rm-image-portal], [${INTERACTION_DIAGNOSTIC_PANEL_ATTR}], [${MAINTENANCE_MENU_ATTR}], [${FEEDBACK_CAT_MENU_ATTR}]`)?.forEach(node => node.remove());
    snapshotNode.querySelector?.(':scope > summary > [data-rabbit-mirror-tool-entry-host]')?.remove?.();
    const recipeKey = followMaintenanceRepairKey(root);
    maintenancePreRepairSnapshots.set(key, {
        node: snapshotNode,
        open: originalNode.hasAttribute('open'),
        recipeKey,
        recipe: copyFollowMaintenanceRecipe(followMaintenanceRepairRecipes.get(recipeKey)),
        repairState: captureRabbitMirrorMaintenanceRepairState(root),
        ts: Date.now(),
    });
    trimMaintenanceSnapshots();
    const workingButton = root.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || originalNode.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || null;
    return { key, root, button: workingButton };
}
export function hasMaintenancePreRepairSnapshot(root) {
    if (!root || isIndependentMaintenanceRoot(root))
        return false;
    try {
        const snapshot = maintenancePreRepairSnapshots.get(maintenanceSnapshotKey(root));
        return !!snapshot?.node && (!snapshot.recipeKey || snapshot.recipeKey === followMaintenanceRepairKey(root));
    }
    catch {
        return false;
    }
}
export function restoreMaintenancePreRepairSnapshotAndForget(root, button) {
    if (!hasMaintenancePreRepairSnapshot(root))
        return false;
    let recipeKey = '';
    try {
        recipeKey = followMaintenanceRepairKey(root);
    }
    catch {
        recipeKey = '';
    }
    const snapshot = maintenancePreRepairSnapshots.get(maintenanceSnapshotKey(root));
    const restored = restoreMaintenancePreRepairSnapshot(root, button);
    if (restored && recipeKey) {
        const previous = snapshot?.recipeKey === recipeKey ? copyFollowMaintenanceRecipe(snapshot.recipe) : null;
        if (previous) {
            previous.lastRoot = root.matches?.('details') ? snapshot.node : root;
            previous.ts = Date.now();
            followMaintenanceRepairRecipes.set(recipeKey, previous);
        }
        else
            followMaintenanceRepairRecipes.delete(recipeKey);
    }
    return restored;
}
function restoreMaintenancePreRepairSnapshot(root, button) {
    const key = maintenanceSnapshotKey(root);
    const snapshot = maintenancePreRepairSnapshots.get(key);
    if (!snapshot?.node) {
        setMaintenanceRabbitState(button, MAINTENANCE_STATES.unknown, __rmT("7whgkDCwjDRyfRtm1osfpCRiiwMqTSgDKyxFF0Z9nSC"));
        return false;
    }
    const details = root.matches?.('details') ? root : root.querySelector?.(':scope > details') || root.querySelector?.('details');
    if (!details?.parentNode)
        return false;
    const originalNode = snapshot.node;
    filterRabbitMirrorRuntimeDom(originalNode);
    if (snapshot.open)
        originalNode.setAttribute('open', '');
    else
        originalNode.removeAttribute('open');
    rearmRabbitMirrorSerializedInteractionRoot(originalNode);
    try {
        rehydrateRabbitMirrorMaintenanceRepairs(originalNode, { cloned: true, state: snapshot.repairState });
    }
    catch { }
    details.replaceWith(originalNode);
    applyNameMaskToRestoredRoot(originalNode);
    maintenancePreRepairSnapshots.delete(key);
    const restoredRoot = root === details ? originalNode : root;
    const restoredOrigin = captureMaintenanceRepairOrigin(restoredRoot);
    setTimeout(() => {
        if (!originalNode.isConnected || !restoredRoot?.isConnected
            || !restoredRoot.contains?.(originalNode) || !maintenanceRepairOriginIsCurrent(restoredOrigin))
            return;
        try {
            refreshRabbitMirrorToolsInScope?.(restoredRoot);
        }
        catch { }
        try {
            activateRabbitMirrorInteractionRescue(originalNode);
        }
        catch { }
    }, 0);
    return true;
}
export function triggerDiagnosticForMaintenanceRoot(root) {
    const button = root?.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`);
    const failDiagnostic = (error, stage) => {
        console.debug(`[RabbitMirror] maintenance diagnostic ${stage} failed:`, error);
        failMaintenanceRabbit(button, `${__rmT("j5344CvSpB35FVKYn1.PTh")}${stage}${__rmT("mBeAuDWxotVBX2zQ_GD31jdTvomqzQmcY_osJ.OVyQp2tftB4T_IKf")}`);
        return false;
    };
    if (!root?.isConnected)
        return failDiagnostic(new Error('diagnostic root detached'), __rmT("B8cENf"));
    try {
        removeInteractionDiagnostic(root);
        const state = { events: ['maintenance-rabbit:direct'], snapshots: [], panel: null, pre: null, report: '' };
        interactionDiagnosticStates.set(root, state);
        createOneShotInteractionDiagnosticPanel(root, state);
        captureInteractionDiagnosticSnapshot(root, state, __rmT("aBIYpIGbs7K1lJ.U"));
        scheduleMaintenanceLabeledCheckedProbe(root, state);
        const captureLater = label => {
            try {
                captureInteractionDiagnosticSnapshot(root, state, label);
            }
            catch (error) {
                failDiagnostic(error, `${label}${__rmT("qGlu0xGJ")}`);
            }
        };
        setTimeout(() => captureLater('+100ms'), 100);
        setTimeout(() => captureLater('+500ms'), 500);
        setTimeout(() => finalizeOneShotInteractionDiagnostic(root, state), 650);
        return true;
    }
    catch (error) {
        return failDiagnostic(error, __rmT("B8cENf"));
    }
}
function maintenanceUserRepairInspection(root, mode) {
    const inspection = inspectMaintenanceRabbit(root);
    const independent = isIndependentMaintenanceRoot(root);
    if (!independent && (mode === 'source' || mode === 'code' || mode === 'plainText' || mode === 'all')) {
        inspection.full = { ...inspection.full, sourceCandidate: true };
        inspection.code = { ...inspection.code, needsSanitize: true, strictWhole: true };
    }
    if (mode === 'style' || mode === 'source' || mode === 'all') {
        const full = diagnosticFullChainSummary(root, inspection.code || {}) || {};
        if (full.damagedDataUriCandidate || full.structureTruncated || full.hostCssParserError) {
            inspection.full = { ...inspection.full, ...full };
        }
    }
    return inspection;
}
function createMaintenanceLibraryResult(mode) {
    return {
        version: MAINTENANCE_RESCUE_MODULE_VERSION,
        mode,
        code: 0,
        plainText: 0,
        interaction: 0,
        style: 0,
        scope: 0,
        executed: [],
        skipped: [],
        failed: [],
    };
}
function runMaintenanceRescueModule(module, context, result) {
    try {
        const count = Number(module.run(context)) || 0;
        result[module.bucket] = (Number(result[module.bucket]) || 0) + count;
        result.executed.push({ id: module.id, count });
    }
    catch (error) {
        result.failed.push({ id: module.id, message: String(error?.message || error || 'unknown error') });
        console.debug(`[RabbitMirror] maintenance module ${module.id} skipped:`, error);
    }
}
function runMaintenanceLegacyRescueLibrary(root, mode = 'all') {
    const result = createMaintenanceLibraryResult(mode);
    if (!root?.isConnected)
        return result;
    const independent = isIndependentMaintenanceRoot(root);
    const messageScope = independent ? exactIndependentMaintenanceRoot(root) : root;
    const targets = [independent ? exactIndependentMaintenanceRoot(root) : root];
    for (const module of MAINTENANCE_RESCUE_LIBRARY) {
        if (!module.modes.includes(mode) || (independent && ['code-block-dom', 'plain-text-dom', 'rendered-details-dom'].includes(module.id))) {
            result.skipped.push(module.id);
            continue;
        }
        if (module.perTarget) {
            for (const target of targets) {
                if (!target?.isConnected)
                    continue;
                runMaintenanceRescueModule(module, { root, target, messageScope, mode }, result);
            }
        }
        else {
            runMaintenanceRescueModule(module, { root, messageScope, mode }, result);
        }
    }
    return result;
}
function mergeMaintenanceLibraryResult(target, addition, label = '') {
    if (!target || !addition)
        return target;
    for (const bucket of ['code', 'plainText', 'interaction', 'style', 'scope']) {
        target[bucket] = (Number(target[bucket]) || 0) + (Number(addition[bucket]) || 0);
    }
    target.executed = [...(target.executed || []), ...(addition.executed || [])];
    target.failed = [...(target.failed || []), ...(addition.failed || [])];
    if (label)
        target.followup = label;
    return target;
}
function followMaintenanceRepairKey(root) {
    if (!root || isIndependentMaintenanceRoot(root))
        return '';
    const index = getMessageIndexFromMirrorNode(root);
    const message = index >= 0 ? getAvailableHostChat()?.[index] : null;
    const source = getSelectedMessageSource(message, { preferDisplay: true }) || getSelectedMessageSource(message);
    const identity = followMaintenanceMirrorIdentity(root);
    return identity ? `${maintenanceSnapshotKey(root)}:${hashInteractionSignature(source)}:${identity}` : '';
}
function followMaintenanceOriginalSummaryText(root) {
    if (!isNameMaskActive())
        return getRabbitMirrorSummaryText(root);
    const summary = root?.querySelector?.('summary');
    if (!summary)
        return '';
    const clone = summary.cloneNode(true);
    unmaskNameMaskClone(clone, summary);
    clone.querySelectorAll(`[data-rm-image-region], [data-rm-image-portal], [${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [${RECIPE_BUTTON_ATTR}], [${RESAY_ATTR}], [${TOOL_ENTRY_HOST_ATTR}]`).forEach(node => node.remove());
    return String(clone.textContent || '');
}
function followMaintenanceMirrorIdentity(root) {
    if (!root || isIndependentMaintenanceRoot(root))
        return '';
    const existing = String(root.getAttribute?.(MAINTENANCE_MIRROR_IDENTITY_ATTR) || '').trim();
    if (existing)
        return existing;
    const index = getMessageIndexFromMirrorNode(root);
    const messageElement = index >= 0 ? getRenderedMessageElement(index) : null;
    const candidates = messageElement ? getRenderedRabbitMirrorInteractionRoots(messageElement) : [];
    let ordinal = candidates.findIndex(candidate => candidate === root || candidate.contains?.(root) || root.contains?.(candidate));
    if (ordinal < 0)
        ordinal = 0;
    let summary;
    try {
        summary = normalizeMaintenanceSummaryText(followMaintenanceOriginalSummaryText(root));
    }
    catch {
        return '';
    }
    const identity = `m${ordinal}:${hashInteractionSignature(`${ordinal}|${String(root.tagName || '')}|${summary}`).slice(0, 12)}`;
    try {
        root.setAttribute?.(MAINTENANCE_MIRROR_IDENTITY_ATTR, identity);
    }
    catch { }
    return identity;
}
function followMaintenanceRecipeModules(recipe) {
    if (Array.isArray(recipe?.modules))
        return recipe.modules;
    return (Array.isArray(recipe?.moduleIds) ? recipe.moduleIds : []).map(id => ({ id, mode: recipe.mode }));
}
function copyFollowMaintenanceRecipe(recipe) {
    if (!recipe)
        return null;
    return { modules: followMaintenanceRecipeModules(recipe).map(item => ({ ...item,
            ...(item.patches ? { patches: mergeMaintenanceRevealPatches([], item.patches) } : {}),
        })), lastRoot: null, ts: recipe.ts };
}
function successfulFollowMaintenanceModules(mode, result) {
    const failed = new Set((result?.failed || []).map(item => item?.id));
    const additions = [];
    for (const entry of result?.executed || []) {
        if (!(Number(entry?.count) > 0) || failed.has(entry.id))
            continue;
        if (mode === 'reveal-clip' && entry.id === 'revealed-clip-repair' && entry.patches?.length) {
            additions.push({ id: entry.id, mode, patches: entry.patches });
            continue;
        }
        const module = MAINTENANCE_RESCUE_LIBRARY.find(item => item.id === entry.id);
        const route = module?.modes.includes(mode) ? mode
            : module?.modes.includes(result?.followup) ? result.followup : '';
        if (route)
            additions.push({ id: module.id, mode: route });
    }
    return additions;
}
function rememberFollowMaintenanceRepair(root, mode, result) {
    const key = followMaintenanceRepairKey(root);
    if (!key)
        return false;
    const additions = successfulFollowMaintenanceModules(mode, result);
    if (!additions.length)
        return false;
    const modules = new Map(followMaintenanceRecipeModules(followMaintenanceRepairRecipes.get(key)).map(item => [item.id, item]));
    for (const item of additions) {
        const previous = modules.get(item.id);
        if (item.patches)
            item.patches = mergeMaintenanceRevealPatches(previous?.patches, item.patches);
        modules.delete(item.id);
        modules.set(item.id, item);
    }
    followMaintenanceRepairRecipes.set(key, { modules: [...modules.values()], lastRoot: root, ts: Date.now() });
    while (followMaintenanceRepairRecipes.size > 24) {
        const oldest = [...followMaintenanceRepairRecipes.entries()].sort((a, b) => Number(a[1]?.ts || 0) - Number(b[1]?.ts || 0))[0]?.[0];
        if (!oldest)
            break;
        followMaintenanceRepairRecipes.delete(oldest);
    }
    return true;
}
function applyFollowMaintenanceModules(root, modules, failed = []) {
    if (!root?.isConnected)
        return 0;
    if (!maintenanceRepairRootBudget(root).ok)
        return 0;
    let repaired = 0;
    const messageScope = root;
    const replayed = new Set();
    for (const { id, mode, patches } of modules) {
        if (replayed.has(id))
            continue;
        if (id === 'revealed-clip-repair' && mode === 'reveal-clip') {
            replayed.add(id);
            try {
                repaired += replayMaintenanceRevealPatches(root, patches);
            }
            catch (error) {
                failed.push({ id, message: String(error?.message || error) });
            }
            continue;
        }
        const module = MAINTENANCE_RESCUE_LIBRARY.find(item => item.id === id && item.modes.includes(mode));
        if (!module)
            continue;
        replayed.add(id);
        const result = createMaintenanceLibraryResult(`replay:${mode}`);
        if (module.perTarget)
            runMaintenanceRescueModule(module, { root, target: root, messageScope, mode }, result);
        else
            runMaintenanceRescueModule(module, { root, messageScope, mode }, result);
        repaired += Number(result[module.bucket] || 0);
        failed.push(...result.failed);
    }
    return repaired;
}
export function replayFollowMaintenanceRepair(root) {
    if (!followMaintenanceRepairRecipes.size)
        return 0;
    const key = followMaintenanceRepairKey(root);
    const recipe = key ? followMaintenanceRepairRecipes.get(key) : null;
    if (!recipe || recipe.lastRoot === root || !root?.isConnected)
        return 0;
    if (!maintenanceRepairRootBudget(root).ok)
        return 0;
    const failed = [];
    const repaired = applyFollowMaintenanceModules(root, followMaintenanceRecipeModules(recipe), failed);
    recipe.lastFailures = failed;
    recipe.lastRoot = root;
    recipe.ts = Date.now();
    root.dataset.rabbitMirrorMaintenanceRecipeReplayed = repaired > 0 ? 'true' : 'checked';
    return repaired;
}
function applyPendingFollowMaintenanceRepair(root, pending) {
    if (!pending || pending.lastRoot === root || isIndependentMaintenanceRoot(root))
        return;
    if (!maintenanceRepairRootBudget(root).ok) {
        pending.failed.push({ id: 'pending-repair-budget', message: __rmT("7HfQG0X_5aJJg7Pre10oB_pLNUwrVXUK") });
        return;
    }
    const key = followMaintenanceRepairKey(root);
    const previous = key ? followMaintenanceRepairRecipes.get(key) : null;
    const priorModules = followMaintenanceRecipeModules(previous);
    const alreadyApplied = previous?.lastRoot === root ? new Set(priorModules.map(item => item.id)) : new Set();
    if (previous?.lastRoot === root)
        pending.failed.push(...(previous.lastFailures || []));
    const modules = new Map(previous && previous.lastRoot !== root ? priorModules.map(item => [item.id, item]) : []);
    for (const item of pending.modules) {
        if (alreadyApplied.has(item.id))
            continue;
        modules.delete(item.id);
        modules.set(item.id, item);
    }
    applyFollowMaintenanceModules(root, [...modules.values()], pending.failed);
    if (previous) {
        previous.lastRoot = root;
        previous.lastFailures = [...pending.failed];
        previous.ts = Date.now();
    }
    pending.lastRoot = root;
}
function runMaintenanceSourceInteractionFollowup(root) {
    if (!root?.isConnected)
        return null;
    const inspection = inspectMaintenanceRabbit(root);
    const interaction = inspection?.interaction || {};
    const shouldRepair = interaction.strippedStateProgram
        || interaction.stateControlsLost
        || interaction.checkedControlsLost
        || interaction.decorativeOverlayCandidateCount > 0
        || interaction.touchHoverMissing
        || interaction.needsScopeRepair
        || interaction.missingCheckedSubjectClassMissingCount > 0
        || interaction.radioGroupLossCandidateCount > 0
        || interaction.selectionOnlyRepairCandidateCount > 0
        || interaction.disabledOnlyChoiceCandidateCount > 0
        || interaction.inertActionButtonCandidateCount > 0
        || interaction.staticChoiceSelectionCandidateCount > 0
        || interaction.structuredStaticDisclosureCandidateCount > 0
        || interaction.fillInChoiceCandidateCount > 0
        || interaction.focusWithinPersistentMissingCount > 0
        || interaction.rawScriptTimelineMissingCount > 0
        || interaction.oneWayCheckedResultCandidateCount > 0;
    if (!shouldRepair)
        return null;
    const module = MAINTENANCE_RESCUE_LIBRARY.find(item => item.id === 'complete-interaction-library');
    if (!module)
        return null;
    const result = createMaintenanceLibraryResult('source-interaction-followup');
    runMaintenanceRescueModule(module, { root, target: root, messageScope: root, mode: 'interaction' }, result);
    return result;
}
function scheduleMaintenanceScopedFollowups(root, summaryText, messageIndex, mode, repairRun, pending = null) {
    if (isIndependentMaintenanceRoot(root) && ['interaction', 'text', 'style'].includes(mode)) {
        scheduleMaintenanceRepairCallback(repairRun, 140, () => {
            const liveRoot = findLiveMaintenanceRoot(root, summaryText, messageIndex) || root;
            if (!liveRoot?.isConnected)
                return;
            installMaintenanceRabbitForRoot(liveRoot);
        });
        return;
    }
    scheduleMaintenanceRepairCallback(repairRun, 160, () => {
        const liveRoot = findLiveMaintenanceRoot(root, summaryText, messageIndex);
        if (!liveRoot?.isConnected)
            return;
        if (liveRoot !== root) {
            if (pending)
                applyPendingFollowMaintenanceRepair(liveRoot, pending);
            else
                replayFollowMaintenanceRepair(liveRoot);
        }
        installMaintenanceRabbitForRoot(liveRoot);
    });
}
export function maintenanceRepairPlanLabel(plan) {
    const labels = { source: __rmT("qgbVfT"), style: __rmT("ukwR8O06zJ.qWf"), text: __rmT("Q7BIKx06kNeziT"), interaction: __rmT("MQ3L3f") };
    return (plan || []).map(mode => labels[mode] || mode).join(' → ');
}
function maintenanceRepairUnsafeToPersist({ introduced = [], failedModules = [] } = {}) {
    return (introduced?.length || 0) > 0 || (failedModules?.length || 0) > 0;
}
function noteMaintenanceRepairNotPersisted(button, introduced = [], failedModules = []) {
    if (!button)
        return;
    const state = button.getAttribute(MAINTENANCE_STATE_ATTR) || MAINTENANCE_STATES.unknown;
    const reason = String(button.getAttribute(MAINTENANCE_REASON_ATTR) || '').trim();
    const why = introduced.length
        ? `${__rmT("LnPVqhc3xuQBTh")}${introduced.length}${__rmT("4b64xm8PXflyXX6D")}${introduced.map(item => item.label).filter(Boolean).join(__rmT("jvk"))}${__rmT("eXs")}` : `${failedModules.length}${__rmT("wHJlU5.d0Boc8WAqx7iUeZ2wuhG")}`;
    button.removeAttribute(MAINTENANCE_REPAIR_ATTR);
    setMaintenanceRabbitState(button, state === MAINTENANCE_STATES.idle || state === MAINTENANCE_STATES.healthy ? MAINTENANCE_STATES.unknown : state, `${reason ? `${reason}${__rmT("7os")}` : ''}${why}${__rmT("gfH5lkh7rrD9_rMs3SxOEHwVsHXZRfkg3eNXO11bKpC7wgISCyY")}`);
}
function compareMaintenanceFindings(beforeFindings, afterFindings) {
    const beforeMap = new Map((beforeFindings || []).map(finding => [maintenanceFindingKey(finding), finding]));
    const afterMap = new Map((afterFindings || []).map(finding => [maintenanceFindingKey(finding), finding]));
    const resolved = [...beforeMap.entries()].filter(([key]) => !afterMap.has(key)).map(([, finding]) => finding);
    const remaining = [...afterMap.values()];
    const introduced = [...afterMap.entries()].filter(([key]) => !beforeMap.has(key)).map(([, finding]) => finding);
    return { resolved, remaining, introduced };
}
export function notifyIndependentRepairPersistence(root) {
    const host = root?.closest?.('[data-rabbit-mirror-external-source="true"][data-rm-source="independent"]');
    const button = root?.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`);
    if (!host) {
        if (isIndependentMaintenanceRoot(root)) {
            button?.removeAttribute?.(MAINTENANCE_REPAIR_ATTR);
            setMaintenanceRabbitState(button, MAINTENANCE_STATES.unknown, __rmT("dOZmcfBSKwMtJ5x20d5fYUju8dT2xJgU_n1vAjki3WWVGGZcSSgzrkWzfZFTA7nLDkw.Az8pKskJ1f"));
        }
        return false;
    }
    const detail = { root, host, persisted: null, persistenceReason: '' };
    if (!host.isConnected || typeof document === 'undefined' || typeof CustomEvent === 'undefined') {
        detail.persisted = false;
        detail.persistenceReason = __rmT("Tiv9VyFT0XQo32uIAf1q9PcFJUunUxvOTE1_.h");
    }
    else {
        try {
            document.dispatchEvent(new CustomEvent(INDEPENDENT_REPAIR_PERSIST_EVENT, { detail }));
        }
        catch (error) {
            detail.persisted = false;
            detail.persistenceReason = `${__rmT("wM4fSfWJ1PnIXgJrw96_Lk")}${String(error?.message || error || 'unknown').slice(0, 80)}`;
        }
    }
    releaseIndependentMaintenanceLiveRepair(host, 900);
    if (detail.persisted !== true) {
        button?.removeAttribute?.(MAINTENANCE_REPAIR_ATTR);
        setMaintenanceRabbitState(button, MAINTENANCE_STATES.unknown, `${__rmT("3OLfJsHfvbHIuDsrhSyxQmij7Ya8antbZmAfL4pQNVBmL7mlxKqI7Taf0apeDeTdC5T7kI8XUTlYEf")}${String(detail.persistenceReason || __rmT("sg1SIzEdtbV2RqQH")).slice(0, 260)}${__rmT("UZHpQV2Tu7YGeGUsM0FymzOG")}`);
        return false;
    }
    return true;
}
function runMaintenanceAutomaticRepairPlan(root, button, repairRun) {
    if (!root?.isConnected || !button?.isConnected || !maintenanceRepairRunIsCurrent(repairRun)) {
        finishMaintenanceRepairRun(repairRun);
        return false;
    }
    if (rejectOversizedMaintenanceRepair(root, button, __rmT("GAHaA9gWNuY"))) {
        finishMaintenanceRepairRun(repairRun);
        return false;
    }
    const initialInspection = inspectMaintenanceRabbit(root);
    let patrolDeadBefore = maintenancePatrolDeadCount(root);
    const initialFindings = [...(initialInspection.findings || [])];
    if (patrolDeadBefore > 0)
        initialFindings.push(maintenancePatrolDeadFinding(patrolDeadBefore));
    let ownProbeNote = '';
    if (!maintenanceRepairModesForFindings(initialFindings).length) {
        try {
            const probeOrigin = maintenancePatrolOrigin(root);
            const probe = runMaintenanceGenericProbe(root, { budget: AUTO_PROBE_BUDGET_MS * 2, recordResult: false });
            if (!root.isConnected || !button.isConnected || !maintenanceRepairRunIsCurrent(repairRun)
                || !maintenancePatrolOriginIsCurrent(root, probeOrigin)) {
                finishMaintenanceRepairRun(repairRun);
                return false;
            }
            rememberMaintenanceProbeResult(root, probe, probeOrigin);
            if (!probe)
                ownProbeNote = __rmT("xLseOp6TMVEd80uJKf6wWIIOBdlafBxU98FoX14FkeUukk");
            if (probe?.truncated || probe?.uncertain)
                ownProbeNote = describeGenericProbe(probe) || `${__rmT("AGJteh")}${probe.truncated ? __rmT("jXXFwbph") : ''}${probe.truncated && probe.uncertain ? __rmT("jvk") : ''}${probe.uncertain ? `${__rmT("726CyT")}${probe.uncertain}${__rmT("xBwPDjyHVteeIlLpARMzzo60jgis8EwqcJwIT0EL")}` : ''}`;
            const deadCount = probe ? (probe.dead || []).length + (probe.feedbackOnly || []).length : 0;
            if (deadCount > 0) {
                setMaintenancePatrolDeadCount(root, deadCount);
                patrolDeadBefore = deadCount;
                initialFindings.push(maintenancePatrolDeadFinding(deadCount));
            }
        }
        catch (error) {
            console.debug('[RabbitMirror] auto plan probe skipped:', error);
            ownProbeNote = __rmT("hbSFDSx63yQ1fa7UqwNWTkuOXL44oUHBJfgcnk");
        }
    }
    const initialPlan = maintenanceRepairModesForFindings(initialFindings);
    if (!initialPlan.length) {
        const state = initialInspection.state === MAINTENANCE_STATES.unknown || ownProbeNote
            ? MAINTENANCE_STATES.unknown
            : initialInspection.state;
        const reason = initialInspection.reason || __rmT("R_f014.P2bK2H5udlxcV_ViBkQplNYNjL_Tdif");
        setMaintenanceRabbitState(button, state, ownProbeNote ? `${reason}${__rmT("7os")}${ownProbeNote}${__rmT("aEvZdxbfYmTc_RG8JzQCTONvgC5i3Q4F5z7YKW.aujWtE5gsz8xp5pOwifRLTZ6nQSJq5s49okLxJT")}` : reason);
        finishMaintenanceRepairRun(repairRun);
        return false;
    }
    markIndependentMaintenanceLiveRepair(root, 5200);
    const captured = captureMaintenancePreRepairSnapshot(root);
    if (captured) {
        root = captured.root || root;
        button = captured.button || root.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || button;
    }
    const summaryText = stripMaintenanceRabbitGlyphs(getRabbitMirrorSummaryText(root)).trim();
    const originalIndex = getMessageIndexFromMirrorNode(root);
    const aggregate = createMaintenanceLibraryResult('auto-plan');
    aggregate.repairOrder = [...initialPlan];
    aggregate.findingsBefore = maintenanceFindingSnapshot(initialFindings);
    const discoveredFindings = new Map(initialFindings.map(finding => [maintenanceFindingKey(finding), finding]));
    aggregate.stepResults = [];
    aggregate.sourceRepairs = [];
    const attemptedModes = new Set();
    let currentRoot = root;
    const pending = !isIndependentMaintenanceRoot(root)
        ? { modules: [], lastRoot: root, failed: [] } : null;
    setMaintenanceRabbitState(button, MAINTENANCE_STATES.checking, `${__rmT("SNye6L2gHKG")}${initialFindings.length}${__rmT("uNe15hgx4SVUY8KdmfvLwOyE4jsUPIWh3df")}${maintenanceRepairPlanLabel(initialPlan)}`);
    const locateCurrentRoot = () => {
        if (!maintenanceRepairRunIsCurrent(repairRun))
            return null;
        const liveRoot = findLiveMaintenanceRoot(currentRoot, summaryText, originalIndex) || currentRoot;
        if (liveRoot?.isConnected)
            applyPendingFollowMaintenanceRepair(liveRoot, pending);
        return liveRoot;
    };
    const finalize = () => {
        const liveRoot = locateCurrentRoot();
        const liveButton = liveRoot?.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || button;
        if (!liveRoot?.isConnected) {
            failMaintenanceRabbit(liveButton, __rmT("MKA_kDelBEUCZUyU3TBxuQJOScfw7tyQFTgS.k"));
            finishMaintenanceRepairRun(repairRun);
            return;
        }
        if (rejectOversizedMaintenanceRepair(liveRoot, liveButton, __rmT("fTiWvOUflHHk9h"))) {
            finishMaintenanceRepairRun(repairRun);
            return;
        }
        const afterInspection = inspectMaintenanceRabbit(liveRoot);
        if (patrolDeadBefore > 0) {
            let deadNow = patrolDeadBefore;
            try {
                const probeOrigin = maintenancePatrolOrigin(liveRoot);
                const probe = runMaintenanceGenericProbe(liveRoot, { budget: AUTO_PROBE_BUDGET_MS, recordResult: false });
                if (!liveRoot.isConnected || !liveButton.isConnected || !maintenanceRepairRunIsCurrent(repairRun)
                    || !maintenancePatrolOriginIsCurrent(liveRoot, probeOrigin)) {
                    finishMaintenanceRepairRun(repairRun);
                    return;
                }
                rememberMaintenanceProbeResult(liveRoot, probe, probeOrigin);
                const found = probe ? (probe.dead || []).length + (probe.feedbackOnly || []).length : 0;
                if (probe && (found > 0 || (!probe.truncated && !probe.uncertain)))
                    deadNow = found;
            }
            catch (error) {
                console.debug('[RabbitMirror] post-repair probe failed:', error);
            }
            if (deadNow > 0) {
                setMaintenancePatrolDeadCount(liveRoot, deadNow);
                afterInspection.findings = [...(afterInspection.findings || []), maintenancePatrolDeadFinding(deadNow)];
            }
            else {
                setMaintenancePatrolDeadCount(liveRoot, 0);
            }
        }
        const comparison = compareMaintenanceFindings([...discoveredFindings.values()], afterInspection.findings || []);
        for (const finding of afterInspection.findings || [])
            discoveredFindings.set(maintenanceFindingKey(finding), finding);
        aggregate.findingsAfter = maintenanceFindingSnapshot(afterInspection.findings || []);
        const executedAny = (aggregate.executed || []).some(entry => entry?.id !== 'interaction-id-scope' && Number(entry?.count) > 0);
        if (!executedAny)
            comparison.resolved = comparison.resolved.filter(item => item?.id !== 'patrol-dead-controls');
        aggregate.verification = {
            resolved: maintenanceFindingSnapshot(comparison.resolved),
            remaining: maintenanceFindingSnapshot(comparison.remaining),
            introduced: maintenanceFindingSnapshot(comparison.introduced),
        };
        aggregate.autoSelected = 'multi-plan';
        aggregate.mode = 'auto-plan';
        aggregate.sourceRepair = aggregate.sourceRepairs[0] || { attempted: false, changed: false, reason: '' };
        aggregate.failed.push(...(pending?.failed || []));
        liveRoot.dataset.rabbitMirrorMaintenanceModules = JSON.stringify(aggregate);
        liveButton.removeAttribute(MAINTENANCE_REPAIR_ATTR);
        const resolvedLabels = comparison.resolved.map(item => item.label);
        const remainingLabels = comparison.remaining.map(item => item.label);
        const failedModules = [...new Set((aggregate.failed || []).map(item => String(item?.id || '')).filter(Boolean))];
        if (afterInspection.full?.sourceTruncationNoticeInstalled) {
            setMaintenanceRabbitState(liveButton, MAINTENANCE_STATES.unknown, __rmT("UqjOkBoYDyvbou1Lr1Vpji7CBKoUoj9PrKq77xO2iUBzxuyNTTyQtUzq8h3Qlk"));
        }
        else if (remainingLabels.length) {
            const resolvedText = resolvedLabels.length ? `${__rmT("qMlaxBmVX3d2yEBq")}${resolvedLabels.length}${__rmT("qGygZrop")}${resolvedLabels.join(__rmT("jvk"))}${__rmT("7os")}` : __rmT("CeCOHiXn216A6PjBl6Bi9l_c41WA5f2Y");
            setMaintenanceRabbitState(liveButton, MAINTENANCE_STATES.repairable, `${failedModules.length ? `⚠️ ${failedModules.length}${__rmT("9TYO0F3qf6GivPbkgq8mNcAF3FCzrxjY")}${failedModules.join(__rmT("jvk"))}${__rmT("7Z2bxk")}` : ''}${resolvedText}${__rmT("lsq6.cc6")}${remainingLabels.length}${__rmT("qGygZrop")}${remainingLabels.join(__rmT("7os"))}`);
        }
        else if (afterInspection.state === MAINTENANCE_STATES.unknown) {
            setMaintenanceRabbitState(liveButton, MAINTENANCE_STATES.unknown, `${__rmT("qMlaxBmVX3d2yEBq")}${resolvedLabels.length}${__rmT("4Jhwvt6iOV5tI6ypHoRRoBmXyV0ocT")}${afterInspection.reason}`);
        }
        else if (failedModules.length) {
            setMaintenanceRabbitState(liveButton, MAINTENANCE_STATES.unknown, `${__rmT("ttRfQYrSQva9dJoCXbVOM5Cx")}${resolvedLabels.length}${__rmT("UqYT17w6oBxBTh")}${failedModules.length}${__rmT("3bWTnKj_JWydFQ.4Fo1r_x6Ih6QO3RKYqcLGsEhuB2LWEf")}${failedModules.join(__rmT("jvk"))}${__rmT("2HQQ857o24Q7rkI490C")}`);
        }
        else if (attemptedModes.has('interaction')) {
            const outcome = maintenanceInteractionRepairOutcome({ after: afterInspection, actualRepairApplied: resolvedLabels.length > 0,
                failedModules, evidence: liveRoot.getAttribute(LABELED_CHECKED_VERIFY_LAST_ATTR) || '',
                clipped: inspectRevealedDrawerClipping(liveRoot).clipped });
            if (outcome.verified)
                liveButton.setAttribute(MAINTENANCE_REPAIR_ATTR, 'true');
            setMaintenanceRabbitState(liveButton, outcome.state, outcome.reason);
        }
        else {
            liveButton.setAttribute(MAINTENANCE_REPAIR_ATTR, 'true');
            setMaintenanceRabbitState(liveButton, MAINTENANCE_STATES.idle, `${__rmT("2lXwiPLk6QuhKEfwWhEKjxAcjFs")}${resolvedLabels.length}${__rmT("qGygZrop")}${resolvedLabels.join(__rmT("jvk")) || __rmT(".teqSWKPzHPRxmgMOSHfS.6O7sp")}`);
        }
        if (maintenanceRepairUnsafeToPersist({ introduced: comparison.introduced, failedModules })) {
            noteMaintenanceRepairNotPersisted(liveButton, comparison.introduced, failedModules);
            finishMaintenanceRepairRun(repairRun);
            return;
        }
        const replayIntroduced = compareMaintenanceFindings(initialFindings, afterInspection.findings || []).introduced;
        if (!replayIntroduced.length)
            for (const step of aggregate.stepResults) {
                if (step.modules)
                    rememberFollowMaintenanceRepair(liveRoot, step.mode, step.modules);
            }
        const persistenceOk = notifyIndependentRepairPersistence(liveRoot);
        if (isIndependentMaintenanceRoot(liveRoot) && !persistenceOk) {
            finishMaintenanceRepairRun(repairRun);
            return;
        }
        scheduleMaintenanceRepairCallback(repairRun, 1100, () => {
            try {
                const verifyRoot = findLiveMaintenanceRoot(liveRoot, summaryText, originalIndex) || liveRoot;
                const verifyButton = verifyRoot?.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || liveButton;
                if (!verifyRoot?.isConnected || !verifyButton?.isConnected)
                    return;
                if (rejectOversizedMaintenanceRepair(verifyRoot, verifyButton, __rmT("wFYI4cwkw6D")))
                    return;
                const lateInspection = inspectMaintenanceRabbit(verifyRoot);
                if ((lateInspection.findings || []).length) {
                    setMaintenanceRabbitState(verifyButton, MAINTENANCE_STATES.repairable, `${__rmT("NGiker56670PnJu1jRR_84Cx")}${(lateInspection.findings || []).length}${__rmT("qGygZrop")}${maintenanceFindingReason(lateInspection.findings || [])}`);
                }
            }
            finally {
                finishMaintenanceRepairRun(repairRun);
            }
        }, liveButton);
    };
    const runNextStep = () => {
        const liveRoot = locateCurrentRoot();
        if (!liveRoot?.isConnected) {
            finalize();
            return;
        }
        const liveButton = liveRoot.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || button;
        if (rejectOversizedMaintenanceRepair(liveRoot, liveButton, __rmT("GAHaA9gWNuY"))) {
            finishMaintenanceRepairRun(repairRun);
            return;
        }
        currentRoot = liveRoot;
        const currentInspection = inspectMaintenanceRabbit(liveRoot);
        for (const finding of currentInspection.findings || [])
            discoveredFindings.set(maintenanceFindingKey(finding), finding);
        const currentPlan = maintenanceRepairModesForFindings(currentInspection.findings || []);
        const discoveredPlan = maintenanceRepairModesForFindings([...discoveredFindings.values()]);
        const candidatePlan = [...currentPlan, ...discoveredPlan.filter(mode => !currentPlan.includes(mode))];
        const nextMode = candidatePlan.find(mode => !attemptedModes.has(mode));
        if (!nextMode) {
            finalize();
            return;
        }
        attemptedModes.add(nextMode);
        if (!aggregate.repairOrder.includes(nextMode))
            aggregate.repairOrder.push(nextMode);
        const stepBefore = maintenanceFindingSnapshot(currentInspection.findings || []);
        const step = { mode: nextMode, before: stepBefore, sourceRepair: null, modules: null };
        aggregate.stepResults.push(step);
        const executeLibrary = () => {
            const latestRoot = locateCurrentRoot();
            if (!latestRoot?.isConnected) {
                finalize();
                return;
            }
            const latestButton = latestRoot.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || button;
            if (rejectOversizedMaintenanceRepair(latestRoot, latestButton, __rmT("GAHaA9gWNuY"))) {
                finishMaintenanceRepairRun(repairRun);
                return;
            }
            currentRoot = latestRoot;
            const nativeCheckedRestoreCount = nextMode === 'interaction'
                ? restoreIndependentNativeCheckedInteraction(latestRoot)
                : 0;
            const libraryResult = runMaintenanceLegacyRescueLibrary(latestRoot, nextMode);
            if (nativeCheckedRestoreCount > 0) {
                libraryResult.interaction = (Number(libraryResult.interaction) || 0) + nativeCheckedRestoreCount;
                libraryResult.executed.unshift({ id: 'independent-checked-state-reset', count: nativeCheckedRestoreCount });
            }
            mergeMaintenanceLibraryResult(aggregate, libraryResult, nextMode);
            step.modules = {
                executed: [...(libraryResult.executed || [])],
                failed: [...(libraryResult.failed || [])],
            };
            if (pending) {
                const modules = new Map(pending.modules.map(item => [item.id, item]));
                for (const item of successfulFollowMaintenanceModules(nextMode, libraryResult)) {
                    modules.delete(item.id);
                    modules.set(item.id, item);
                }
                pending.modules = [...modules.values()];
                pending.lastRoot = latestRoot;
            }
            scheduleMaintenanceRepairCallback(repairRun, 180, () => {
                const afterStepRoot = locateCurrentRoot();
                const afterStepInspection = afterStepRoot?.isConnected ? inspectMaintenanceRabbit(afterStepRoot) : { findings: [] };
                step.after = maintenanceFindingSnapshot(afterStepInspection.findings || []);
                runNextStep();
            }, latestButton);
        };
        if (nextMode === 'source') {
            const sourceInspection = maintenanceUserRepairInspection(liveRoot, 'source');
            const sourceResult = repairMaintenanceMessageSource(liveRoot, sourceInspection);
            step.sourceRepair = {
                attempted: true,
                changed: !!sourceResult.changed,
                noticeShown: !!sourceResult.noticeShown,
                unrecoverable: !!sourceResult.unrecoverable,
                reason: String(sourceResult.reason || ''),
            };
            aggregate.sourceRepairs.push(step.sourceRepair);
            if (sourceResult.changed)
                scheduleMaintenanceRepairCallback(repairRun, 220, executeLibrary, liveButton);
            else
                executeLibrary();
        }
        else {
            executeLibrary();
        }
    };
    runNextStep();
    return true;
}
function maintenanceAutoSafeCountAttribute(root, attribute) {
    return Number.parseInt(root?.getAttribute?.(attribute) || '0', 10) || 0;
}
function maintenanceAutoSafeHasSettledOpenLayout(root) {
    if (!root?.isConnected)
        return false;
    const outerDetails = root.matches?.('details')
        ? root
        : root.querySelector?.(':scope > details') || root.querySelector?.('details');
    if (outerDetails && !outerDetails.open)
        return false;
    const rect = maintenanceMobileLayoutRect(outerDetails || root);
    return !!rect && rect.width > 1 && rect.height > 1;
}
function installMaintenanceAutoSafeViewportLayoutRescue(root) {
    if (!maintenanceAutoSafeHasSettledOpenLayout(root))
        return 0;
    return installMaintenanceViewportLayoutRescue(root);
}
function installMaintenanceAutoSafeNestedDetailsPopupRescue(root) {
    if (!maintenanceAutoSafeHasSettledOpenLayout(root))
        return 0;
    return repairNestedDetailsPopupClipping(root, { requireOpen: true });
}
function captureMaintenanceAutoSafeUiState(root) {
    if (!root?.querySelectorAll)
        return null;
    return {
        controls: [...root.querySelectorAll('input[type="checkbox"], input[type="radio"]')].map(control => ({
            control,
            checked: !!control.checked,
            defaultChecked: !!control.defaultChecked,
        })),
        details: [...root.querySelectorAll('details')].map(details => ({ details, open: !!details.open })),
    };
}
function restoreMaintenanceAutoSafeUiState(snapshot) {
    if (!snapshot)
        return;
    for (const item of snapshot.controls || []) {
        if (!item.control?.isConnected)
            continue;
        item.control.checked = item.checked;
        item.control.defaultChecked = item.defaultChecked;
    }
    for (const item of snapshot.details || []) {
        if (!item.details?.isConnected)
            continue;
        item.details.open = item.open;
    }
}
export function runMaintenanceSafeAutomaticRepairs(root, button) {
    if (!root?.isConnected || !button?.isConnected)
        return { repaired: 0, modules: [] };
    const repairRun = beginMaintenanceRepairRun(root, button);
    if (!repairRun)
        return { repaired: 0, modules: [], skipped: 'busy' };
    try {
        if (rejectOversizedMaintenanceRepair(root, button, __rmT("GAHaAPbpwpG")))
            return { repaired: 0, modules: [], skipped: 'budget' };
        invalidateRabbitMirrorInteractionResetSnapshot(root);
        const uiStateSnapshot = captureMaintenanceAutoSafeUiState(root);
        const modules = [];
        const failedModules = [];
        const add = (id, count) => {
            const value = Math.max(0, Number(count) || 0);
            if (value > 0)
                modules.push({ id, count: value });
            return value;
        };
        let repaired = 0;
        setMaintenanceRabbitState(button, MAINTENANCE_STATES.checking, __rmT("wHIhEV5JNx51w6ObtEVstkkOvTAJ0DWFhMmTL2gNilj3jp15.Sq0iqyj"));
        try {
            const beforeScoped = root.dataset?.rabbitMirrorInteractionScoped === 'true';
            const beforeRadioGroups = maintenanceAutoSafeCountAttribute(root, RADIO_GROUP_ROOT_ATTR);
            const scopeResult = root.querySelector?.('input[id], label[for]')
                ? scopeRabbitMirrorInteractionIds(root, { installRescue: false })
                : null;
            const afterScoped = root.dataset?.rabbitMirrorInteractionScoped === 'true';
            const afterRadioGroups = maintenanceAutoSafeCountAttribute(root, RADIO_GROUP_ROOT_ATTR);
            if (!beforeScoped && afterScoped && Number(scopeResult?.scopedIdCount || 0) > 0)
                repaired += add('interaction-id-scope', 1);
            repaired += add('radio-group-local-scope', Math.max(0, afterRadioGroups - beforeRadioGroups));
        }
        catch (error) {
            failedModules.push('interaction-id-scope');
            console.debug('[RabbitMirror] auto-safe ID/radio repair skipped:', error);
        }
        const safeInstallers = [
            ['radio-reset-local-scope', installRawMessageRadioResetProgramRescue],
            ['radio-reversible-return', installReversibleRadioGroupFallback],
            ['missing-checked-control-class', installMissingCheckedSubjectClassRescue],
            ['webkit-3d-flip-compat', installWebKit3DFlipRescue],
            ['visual-scenery-mobile-overflow', installVisualSceneryMobileNarrativeOverflowRescue],
            ['styleless-structured-rescue', installMaintenanceStylelessStructuredRescue],
            ['viewport-layout-rescue', installMaintenanceAutoSafeViewportLayoutRescue],
            ['nested-details-popup-flow-repair', installMaintenanceAutoSafeNestedDetailsPopupRescue],
        ];
        for (const [id, installer] of safeInstallers) {
            try {
                repaired += add(id, installer(root));
            }
            catch (error) {
                failedModules.push(id);
                console.debug(`[RabbitMirror] auto-safe module ${id} skipped:`, error);
            }
        }
        restoreMaintenanceAutoSafeUiState(uiStateSnapshot);
        const inspection = inspectMaintenanceRabbit(root);
        const payload = {
            version: MAINTENANCE_AUTO_SAFE_VERSION,
            runtime: RUNTIME_VERSION,
            repaired,
            modules,
            failedModules,
            statePreserved: true,
            remaining: maintenanceFindingSnapshot(inspection.findings || []),
        };
        root.setAttribute(MAINTENANCE_AUTO_SAFE_ATTR, repaired > 0 ? 'repaired' : 'checked');
        root.setAttribute(MAINTENANCE_AUTO_SAFE_RESULT_ATTR, JSON.stringify(payload));
        if (repaired > 0)
            button.setAttribute(MAINTENANCE_REPAIR_ATTR, 'true');
        if (failedModules.length) {
            button.removeAttribute(MAINTENANCE_REPAIR_ATTR);
            const completed = repaired > 0 ? `${__rmT("iFuZaA26HKG")}${repaired}${__rmT("7aAPOp9yd00MTLRSVYA")}` : '';
            setMaintenanceRabbitState(button, MAINTENANCE_STATES.unknown, `${completed}${__rmT("BBZ0C8QYUdYrxs1KSWn7YWWh.YqhrfbY")}${failedModules.join(__rmT("jvk"))}${__rmT("qkAMGcje5A9N3SfqlJ.hIoSMuD28bHa9QVDY6SFIDmvcIbR4KFhfb3Np4Vw3iGKx")}`);
        }
        else if ((inspection.findings || []).length) {
            const prefix = repaired > 0 ? `${__rmT("qMRfqiB_dsark_Bq")}${repaired}${__rmT("7aAPOp9yd00MTLRSVYA")}` : __rmT("2sQ4kEp9oo94gY7bAfJu9oczzq9Fh88q3af");
            setMaintenanceRabbitState(button, MAINTENANCE_STATES.repairable, `${prefix}${__rmT("I9NjYqnXxrlxmlcA9yZ5WEnRGItNuzao1LxGsejEkPrcEf")}${maintenanceFindingReason(inspection.findings || [])}`);
        }
        else if (repaired > 0) {
            setMaintenanceRabbitState(button, MAINTENANCE_STATES.healthy, `${__rmT("qMRfqiB_dsark_Bq")}${repaired}${__rmT("3bd0dN0FPrcHT_VR0WvhWzj6B6Kp3LI2kcgkmDqdHc9cEf")}${modules.map(item => item.id).join(__rmT("jvk"))}`);
        }
        else {
            setMaintenanceRabbitState(button, inspection.state, inspection.reason || __rmT("mv2ik4T0RAh8E9tkHtwmcOuG6bR2FZgDKyvTTHuJ.zB"));
        }
        if (repaired > 0 && !failedModules.length)
            notifyIndependentRepairPersistence(root);
        scheduleMaintenanceAutoProbe(root, button);
        return { repaired, modules, failedModules, inspection };
    }
    finally {
        finishMaintenanceRepairRun(repairRun);
    }
}
const AUTO_PROBE_ATTR = 'data-rabbit-mirror-auto-probe';
let autoProbeNoticeShown = false;
const maintenanceAutoProbeAttempts = new WeakMap();
function hostLooksStreaming(root) {
    try {
        const message = root.closest?.('.mes');
        if (message?.matches?.('.streaming, [data-is-streaming="true"], [is_generating="true"], [data-generating="true"]'))
            return true;
        return !!document.querySelector('#chat .mes.streaming, #chat .mes[data-is-streaming="true"], #chat .mes[is_generating="true"], #chat .mes[data-generating="true"]');
    }
    catch {
        return false;
    }
}
const AUTO_PROBE_BUDGET_MS = 500;
const maintenancePatrolDeadCounts = new WeakMap();
function maintenancePatrolDeadKey(root) {
    if (!root)
        return null;
    if (root.matches?.('details'))
        return root;
    return root.querySelector?.(':scope > details') || root.querySelector?.('details') || root;
}
function maintenancePatrolOwnerRoot(root) {
    const face = maintenancePatrolDeadKey(root);
    return independentMaintenanceHost(face) ? face : face?.closest?.(MIRROR_TOTO_SELECTOR) || root;
}
function maintenancePatrolOrigin(root) {
    return captureMaintenanceRepairOrigin(maintenancePatrolOwnerRoot(root));
}
function maintenancePatrolOriginKey(origin) {
    return `${maintenanceRepairOriginKey(origin)}:${origin?.remountEpoch || ''}`;
}
function maintenancePatrolOriginIsCurrent(root, origin) {
    return !!root?.isConnected
        && maintenancePatrolOriginKey(maintenancePatrolOrigin(root)) === maintenancePatrolOriginKey(origin)
        && ((origin.index < 0 && !origin.ownerKey) || maintenanceRepairOriginIsCurrent(origin));
}
function maintenancePatrolDeadCount(root) {
    const key = maintenancePatrolDeadKey(root);
    const value = key && maintenancePatrolDeadCounts.get(key);
    if (!value)
        return 0;
    if (value.originKey !== maintenancePatrolOriginKey(maintenancePatrolOrigin(root))) {
        maintenancePatrolDeadCounts.delete(key);
        return 0;
    }
    return value.count;
}
function setMaintenancePatrolDeadCount(root, count) {
    const key = maintenancePatrolDeadKey(root);
    if (!key)
        return;
    if (count > 0)
        maintenancePatrolDeadCounts.set(key, {
            originKey: maintenancePatrolOriginKey(maintenancePatrolOrigin(root)), count,
        });
    else
        maintenancePatrolDeadCounts.delete(key);
}
function maintenanceProbeNodes(root) {
    return [...new Set([root, maintenancePatrolDeadKey(root), maintenancePatrolOwnerRoot(root)].filter(Boolean))];
}
function clearPatrolPendingMarks(root) {
    try {
        for (const scope of maintenanceProbeNodes(root)) {
            for (const node of scope?.querySelectorAll?.('[data-rm-patrol-pending]') || [])
                node.removeAttribute('data-rm-patrol-pending');
        }
    }
    catch { }
}
function maintenanceProbeRecord(root, origin = maintenancePatrolOrigin(root)) {
    const face = maintenancePatrolDeadKey(root);
    const key = maintenancePatrolOriginKey(origin);
    let record = maintenanceAutoProbeAttempts.get(face);
    if (!record || record.key !== key) {
        record = { key, origin, count: 0, revision: 0, state: '', probe: null };
        maintenanceAutoProbeAttempts.set(face, record);
        clearPatrolPendingMarks(root);
        for (const node of maintenanceProbeNodes(root)) {
            node.removeAttribute?.(AUTO_PROBE_ATTR);
            node.removeAttribute?.(GENERIC_PROBE_RESULT_ATTR);
        }
    }
    return record;
}
function rememberMaintenanceProbeResult(root, probe, origin = maintenancePatrolOrigin(root)) {
    if (!maintenancePatrolOriginIsCurrent(root, origin))
        return null;
    const record = maintenanceProbeRecord(root, origin);
    record.revision += 1;
    record.probe = probe;
    record.state = probe ? (probe.truncated || probe.uncertain ? 'incomplete' : 'done') : 'failed';
    clearPatrolPendingMarks(root);
    for (const node of maintenanceProbeNodes(root)) {
        node.setAttribute?.(AUTO_PROBE_ATTR, record.state);
        if (probe)
            node.setAttribute?.(GENERIC_PROBE_RESULT_ATTR, JSON.stringify(probe));
        else
            node.removeAttribute?.(GENERIC_PROBE_RESULT_ATTR);
    }
    const dead = (probe?.dead || []).length + (probe?.feedbackOnly || []).length;
    if (dead || record.state === 'done')
        setMaintenancePatrolDeadCount(root, dead);
    return record;
}
function applyMaintenanceProbeEvidence(root, button, record) {
    try {
        if (record?.state === 'pending')
            button?.setAttribute?.('data-rm-patrol-pending', 'true');
        else
            button?.removeAttribute?.('data-rm-patrol-pending');
    }
    catch { }
    if (!button?.isConnected || button.getAttribute(MAINTENANCE_STATE_ATTR) !== MAINTENANCE_STATES.healthy)
        return;
    const dead = maintenancePatrolDeadCount(root);
    if (dead > 0) {
        const line = describeGenericProbe(record.probe);
        setMaintenanceRabbitState(button, MAINTENANCE_STATES.unknown, `${line || `${__rmT("uNmq43kejtibIlBq")}${dead}${__rmT("4JOs1CQvwc5SI09WDivp7y0O7D4ZoT")}`}${__rmT("FieWK.eNCKuLHtHDAMMst0zEXkjTU2egLrlFyDpCPuHLwFXa8NBK_FzL0EVSUzqCLjeTDqtFvxemmbvYl5s")}`);
    }
    else if (record.state !== 'done' && record.state !== 'pending') {
        setMaintenanceRabbitState(button, MAINTENANCE_STATES.unknown, `${describeGenericProbe(record.probe) || (record.state === 'failed' ? __rmT("mv2ik4T0RAS5iBsntRKwccOCzmGbATkLuXFma3Xsawk") : __rmT("Sr8hhDqmfCNjgQ9Xz9wLxf"))}${__rmT("D7rZvA898Xeu4NPyg1aX0gzeZ0_dJZxW_i6AFh_vjv3fh1JkSD3ByDw5p62bNhi_sqUePqulRSgUFdYm")}`);
    }
}
function maintenancePatrolDeadFinding(count) {
    return { id: 'patrol-dead-controls', stage: 'interaction', label: `${__rmT("5JyI5KkejtibIlBq")}${count}${__rmT("wRecU_2ID58wBoIO..JO8Bcw")}`, mode: 'interaction', confidence: 'high', evidence: `dead=${count}` };
}
function isPluginPlaceholderFace(root) {
    return Boolean(root?.classList?.contains('rabbit-mirror-external-placeholder') || root?.hasAttribute?.('data-rabbit-mirror-placeholder')
        || root?.querySelector?.('.rabbit-mirror-external-error-actions, .rabbit-mirror-external-placeholder-body'));
}
function scheduleMaintenanceAutoProbe(root, button) {
    if (!root?.isConnected || !button?.isConnected || isPluginPlaceholderFace(root))
        return false;
    const face = maintenancePatrolDeadKey(root);
    const origin = maintenancePatrolOrigin(root);
    const record = maintenanceProbeRecord(root, origin);
    if (record.state === 'pending' && (!record.pendingRoot?.isConnected
        || (typeof record.pendingRoot.contains === 'function' && !record.pendingRoot.contains(face)))) {
        record.revision += 1;
        record.state = '';
    }
    if (record.state === 'pending' || record.state === 'done' || record.count >= 2) {
        applyMaintenanceProbeEvidence(root, button, record);
        return false;
    }
    const initialState = button.getAttribute(MAINTENANCE_STATE_ATTR);
    const initialReason = button.getAttribute(MAINTENANCE_REASON_ATTR) || '';
    record.state = 'pending';
    record.pendingRoot = root;
    const revision = ++record.revision;
    const ownsRecord = () => maintenanceAutoProbeAttempts.get(face) === record
        && record.revision === revision;
    const stillCurrent = () => ownsRecord() && maintenancePatrolOriginIsCurrent(root, origin);
    const probeNodes = maintenanceProbeNodes(root);
    for (const node of probeNodes)
        node.setAttribute?.(AUTO_PROBE_ATTR, 'pending');
    applyMaintenanceProbeEvidence(root, button, record);
    const pendingReason = button.getAttribute(MAINTENANCE_REASON_ATTR);
    const abandon = () => {
        if (!ownsRecord())
            return;
        try {
            button?.removeAttribute?.('data-rm-patrol-pending');
        }
        catch { }
        clearPatrolPendingMarks(root);
        maintenanceAutoProbeAttempts.delete(face);
        for (const node of probeNodes) {
            node.removeAttribute?.(AUTO_PROBE_ATTR);
            node.removeAttribute?.(GENERIC_PROBE_RESULT_ATTR);
        }
    };
    let streamingAttempts = 0;
    const run = () => {
        if (!ownsRecord())
            return;
        if (!root.isConnected || !button.isConnected || !isMaintenanceAutoPatrolEnabled() || !stillCurrent()) {
            abandon();
            return;
        }
        if (hostLooksStreaming(root)) {
            if (streamingAttempts++ < 3)
                setTimeout(run, 1500);
            else
                abandon();
            return;
        }
        let probe = null;
        record.count += 1;
        try {
            probe = runMaintenanceGenericProbe(root, { budget: AUTO_PROBE_BUDGET_MS, recordResult: false });
        }
        catch (error) {
            console.debug('[RabbitMirror] auto probe failed:', error);
        }
        if (!stillCurrent()) {
            abandon();
            return;
        }
        rememberMaintenanceProbeResult(root, probe, origin);
        if (pendingReason !== initialReason && button.getAttribute(MAINTENANCE_REASON_ATTR) === pendingReason) {
            setMaintenanceRabbitState(button, initialState, initialReason);
        }
        applyMaintenanceProbeEvidence(root, button, record);
        if (!probe)
            return;
        const dead = [...(probe.dead || []), ...(probe.feedbackOnly || [])];
        if (!dead.length)
            return;
        const line = describeGenericProbe(probe);
        const recorded = rememberRepairSample(root, 'auto', line, dead);
        setMaintenanceRabbitState(button, MAINTENANCE_STATES.unknown, `${__rmT("jbnOcmuuIVRBTh")}${line}${__rmT("F6EB8pXp73OQr_xMVin7y668Ren.85zLIH_u8yN8")}${recorded ? __rmT("uLn4_RGyVwho429RMJW7S1bYLk2pLnjY8cpTHpmebQu0pPgksPC_GWxm48jkgZQoUuf") : __rmT("_EAZleAbRKYxKX34qNZ5iURnaWGTw11OuLf")}`);
        if (recorded && !autoProbeNoticeShown) {
            autoProbeNoticeShown = true;
            try {
                globalThis.toastr?.info?.(__rmT("naAYLXH9pPDZIb9J5a_BY.qFBzWHLqFmuFqGa6hWY7J2hRVR.Nihwyyqk3j8ob6wZyOgz8QnqzFKJ.KYF2Eqs.O4InddCut7j6IgNzzn4QvppDL0ZwibU4eyM_VO89LxWY4OqIifeDxvtn78F0Lroc1qSx5G0hqDo2PLDPek"));
            }
            catch { }
        }
    };
    const idle = globalThis.requestIdleCallback;
    if (typeof idle === 'function')
        idle(() => run(), { timeout: 15000 });
    else
        setTimeout(run, 4000);
    return true;
}
export function runMaintenanceUserRepair(root, button, mode) {
    if (!root?.isConnected || !button?.isConnected)
        return false;
    const repairRun = beginMaintenanceRepairRun(root, button);
    if (!repairRun) {
        return false;
    }
    if (rejectOversizedMaintenanceRepair(root, button, mode === 'interaction' ? __rmT("6Bel59gWNuY") : __rmT("iJ_93k"))) {
        finishMaintenanceRepairRun(repairRun);
        return false;
    }
    try {
        invalidateRabbitMirrorInteractionResetSnapshot(root);
        if (mode === 'auto')
            return runMaintenanceAutomaticRepairPlan(root, button, repairRun);
        markIndependentMaintenanceLiveRepair(root, 5200);
        const captured = captureMaintenancePreRepairSnapshot(root);
        if (captured) {
            root = captured.root || root;
            button = captured.button || root.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || button;
        }
        const effectiveMode = mode;
        const labels = {
            auto: __rmT("bl0NrrruJwMe34R7EncbfnrOScfw7tyQFTgS.k"),
            source: __rmT("SPWkVGZopipI86TFnGFYeze5DjR2QAO5w2.Kn_ZO2Xqrv7Gq"),
            interaction: __rmT("bl0NrQupev_Y7u7MU45d2BimSVkXhvyi.T2R_k"),
            text: __rmT("3ExiInlxkBVIS0mIfRdwrE.A8RFVF7PQNKusxHuJ.zB"),
            code: __rmT("3ExiI_kSaeRT.jmJ7KovpsyTRtRwDY0xrwEc5pNFVE_"),
            plainText: __rmT("RHgve05Xp2bU6EVRA3519Y0tM63gwMUmXjI1xd5tdVveRT"),
            style: __rmT("3ExiI_kSaetsdWmJ7KovpsyTRtRwDY0xxKly5YXqDXp"),
            all: __rmT("bl0Nr1Q4Abts3lHUU50q9PSlUDRBZurJfv3f2h"),
        };
        setMaintenanceRabbitState(button, MAINTENANCE_STATES.checking, labels[mode] || labels[effectiveMode] || __rmT("m6Fq0Qj_y5KcjZ.KfXssMYLC"));
        const summaryText = stripMaintenanceRabbitGlyphs(getRabbitMirrorSummaryText(root)).trim();
        const originalIndex = getMessageIndexFromMirrorNode(root);
        const inspection = maintenanceUserRepairInspection(root, effectiveMode);
        const sourceResult = (effectiveMode === 'source' || effectiveMode === 'code' || effectiveMode === 'plainText' || effectiveMode === 'style' || effectiveMode === 'all')
            ? repairMaintenanceMessageSource(root, inspection)
            : { changed: false, index: originalIndex, reason: '' };
        const continueRepair = () => {
            if (!maintenanceRepairRunIsCurrent(repairRun)) {
                finishMaintenanceRepairRun(repairRun);
                return;
            }
            const liveRoot = findLiveMaintenanceRoot(root, summaryText, sourceResult.index >= 0 ? sourceResult.index : originalIndex);
            if (!liveRoot) {
                failMaintenanceRabbit(button, __rmT("yJJmHG.NH7qPz0zX_PKfpy39RRrKmxUGwKUlckeAaVCscXTJVRXHpk"));
                finishMaintenanceRepairRun(repairRun);
                return;
            }
            const liveButton = liveRoot.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || button;
            if (rejectOversizedMaintenanceRepair(liveRoot, liveButton, effectiveMode === 'interaction' ? __rmT("6Bel59gWNuY") : __rmT("iJ_93k"))) {
                finishMaintenanceRepairRun(repairRun);
                return;
            }
            const nativeCheckedRestoreCount = (effectiveMode === 'interaction' || effectiveMode === 'all')
                ? restoreIndependentNativeCheckedInteraction(liveRoot)
                : 0;
            const libraryResult = runMaintenanceLegacyRescueLibrary(liveRoot, effectiveMode);
            if (nativeCheckedRestoreCount > 0) {
                libraryResult.interaction = (Number(libraryResult.interaction) || 0) + nativeCheckedRestoreCount;
                libraryResult.executed.unshift({ id: 'independent-checked-state-reset', count: nativeCheckedRestoreCount });
            }
            if (sourceResult.changed && effectiveMode === 'source') {
                const followupResult = runMaintenanceSourceInteractionFollowup(liveRoot);
                if (followupResult)
                    mergeMaintenanceLibraryResult(libraryResult, followupResult, 'interaction');
            }
            libraryResult.sourceRepair = {
                attempted: effectiveMode === 'source' || effectiveMode === 'code' || effectiveMode === 'plainText' || effectiveMode === 'style' || effectiveMode === 'all',
                changed: !!sourceResult.changed,
                noticeShown: !!sourceResult.noticeShown,
                unrecoverable: !!sourceResult.unrecoverable,
                reason: String(sourceResult.reason || ''),
            };
            const executedRepairCount = (libraryResult.executed || [])
                .filter(entry => entry?.id !== 'interaction-id-scope')
                .reduce((sum, entry) => sum + Math.max(0, Number(entry?.count) || 0), 0);
            const actualRepairApplied = !!sourceResult.changed || executedRepairCount > 0;
            liveRoot.dataset.rabbitMirrorMaintenanceModules = JSON.stringify(libraryResult);
            const pending = !isIndependentMaintenanceRoot(liveRoot) && !(libraryResult.failed || []).length
                ? { modules: successfulFollowMaintenanceModules(effectiveMode, libraryResult), lastRoot: liveRoot, failed: [] } : null;
            if (sourceResult.unrecoverable || !actualRepairApplied)
                liveButton.removeAttribute(MAINTENANCE_REPAIR_ATTR);
            else
                liveButton.setAttribute(MAINTENANCE_REPAIR_ATTR, 'true');
            scheduleMaintenanceScopedFollowups(liveRoot, summaryText, sourceResult.index >= 0 ? sourceResult.index : originalIndex, effectiveMode, repairRun, pending);
            scheduleMaintenanceRepairCallback(repairRun, 360, () => {
                const afterRoot = findLiveMaintenanceRoot(liveRoot, summaryText, sourceResult.index >= 0 ? sourceResult.index : originalIndex);
                const afterButton = afterRoot?.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || liveButton;
                if (!afterRoot) {
                    failMaintenanceRabbit(afterButton, __rmT("MKA_kDelBEUCZUyU3TBxuQJOScfw7tyQFTgS.k"));
                    finishMaintenanceRepairRun(repairRun);
                    return;
                }
                if (rejectOversizedMaintenanceRepair(afterRoot, afterButton, __rmT("fTiWvOUflHHk9h"))) {
                    finishMaintenanceRepairRun(repairRun);
                    return;
                }
                applyPendingFollowMaintenanceRepair(afterRoot, pending);
                const after = inspectMaintenanceRabbit(afterRoot);
                const failedModules = [...new Set([...(libraryResult.failed || []), ...(pending?.failed || [])].map(item => String(item?.id || '')).filter(Boolean))];
                if (after.full?.sourceTruncationNoticeInstalled) {
                    afterButton.removeAttribute(MAINTENANCE_REPAIR_ATTR);
                    setMaintenanceRabbitState(afterButton, MAINTENANCE_STATES.unknown, __rmT("UqjOkBoYDyvbou1Lr1Vpji7CBKoUoj9PrKq77xO2iUBzxuyNTTyQtUzq8h3Qlk"));
                }
                else if (effectiveMode === 'interaction' || (effectiveMode === 'all' && afterRoot.querySelector('input[type="checkbox"],input[type="radio"]'))) {
                    const outcome = maintenanceInteractionRepairOutcome({ after, actualRepairApplied, failedModules,
                        evidence: afterRoot.getAttribute(LABELED_CHECKED_VERIFY_LAST_ATTR) || '',
                        clipped: inspectRevealedDrawerClipping(afterRoot).clipped });
                    if (!outcome.verified) {
                        afterButton.removeAttribute(MAINTENANCE_REPAIR_ATTR);
                        const evidence = afterRoot.getAttribute(LABELED_CHECKED_VERIFY_LAST_ATTR) || '';
                        if (!actualRepairApplied || /:failed$|:corrected$/.test(evidence))
                            rememberRepairSample(afterRoot, 'interaction', outcome.reason, []);
                    }
                    setMaintenanceRabbitState(afterButton, outcome.state, outcome.reason);
                }
                else if (after.state === MAINTENANCE_STATES.repairable) {
                    afterButton.removeAttribute(MAINTENANCE_REPAIR_ATTR);
                    setMaintenanceRabbitState(afterButton, MAINTENANCE_STATES.repairable, `${__rmT("HMn1jbfHlpQHT_4P3fhYGVCDcuZ5Gn2adAkkvq4FUdScEf")}${after.reason}`);
                }
                else if (after.state === MAINTENANCE_STATES.unknown) {
                    afterButton.removeAttribute(MAINTENANCE_REPAIR_ATTR);
                    setMaintenanceRabbitState(afterButton, MAINTENANCE_STATES.unknown, `${__rmT("6b6wpcMn3.QbNBjgzScgLh9zYekJ7sdhpKJCqh")}${after.reason}`);
                }
                else if (failedModules.length) {
                    afterButton.removeAttribute(MAINTENANCE_REPAIR_ATTR);
                    setMaintenanceRabbitState(afterButton, MAINTENANCE_STATES.unknown, `⚠️ ${failedModules.length}${__rmT("3bWTnKj_JWydFQ.4Fo1r_x6Ih6QO3RKYqcLGsEhuB2LWEf")}${failedModules.join(__rmT("jvk"))}${__rmT("Qe3RPxJNcAU9KkSfS4Ra3M5YTpNdwT")}`);
                }
                else if (!actualRepairApplied) {
                    afterButton.removeAttribute(MAINTENANCE_REPAIR_ATTR);
                    setMaintenanceRabbitState(afterButton, MAINTENANCE_STATES.unknown, `${__rmT("CjLKtPLwvs41otgoFYshsJUO0.f2fLzNXlEi94OqPe2bJeU0TXaEI2JDsmgrrk")}${sourceResult.reason ? `${__rmT("7ys")}${sourceResult.reason}` : ''}`);
                }
                else {
                    const autoNote = mode === 'auto' ? `${__rmT("QfVfqiB_1humkb5D")}${effectiveMode}${__rmT("eXs")}` : '';
                    const executedModuleCount = id => Number((libraryResult.executed || []).find(item => item?.id === id)?.count || 0);
                    const mobileOnlyMarks = executedModuleCount('mobile-layout-rescue');
                    const viewportMarks = executedModuleCount('viewport-layout-rescue');
                    const viewportWidth = Math.max(0, Number(globalThis.innerWidth || globalThis.document?.documentElement?.clientWidth || 0));
                    let layoutNote = '';
                    if (mobileOnlyMarks) {
                        layoutNote = `${__rmT("OLcYOy3tlQbua98NHTUbS.1WjFs")}${mobileOnlyMarks}${__rmT("fiXlSvbkf6pbpmSPZrSwlf")}`;
                    }
                    if (viewportMarks) {
                        layoutNote += `${__rmT("OLcYOlu6lQbuaPANzTubS.1WjFs")}${viewportMarks}${__rmT("9TYtdyONJBskjvpbaWrF5XsrgpBPkBL5")}`;
                    }
                    setMaintenanceRabbitState(afterButton, MAINTENANCE_STATES.idle, `${__rmT("CxysYvxBn7bdATUuf0G")}${autoNote}${layoutNote}${__rmT("OmPsZwcZMrROapf_sCLfuV_DSYadmvec")}`);
                }
                const introduced = compareMaintenanceFindings(inspection?.findings || [], after.findings || []).introduced;
                if (maintenanceRepairUnsafeToPersist({ introduced, failedModules }))
                    noteMaintenanceRepairNotPersisted(afterButton, introduced, failedModules);
                else {
                    rememberFollowMaintenanceRepair(afterRoot, effectiveMode, libraryResult);
                    notifyIndependentRepairPersistence(afterRoot);
                }
                finishMaintenanceRepairRun(repairRun);
            }, liveButton);
        };
        if (sourceResult.changed)
            scheduleMaintenanceRepairCallback(repairRun, 200, continueRepair, button);
        else
            continueRepair();
    }
    catch (error) {
        console.debug('[RabbitMirror] maintenance user repair failed:', error);
        failMaintenanceRabbit(button, __rmT("pbYwDgyGP0yy4OaQKV7v8jCzh2aDm47n_pErIckS"));
        finishMaintenanceRepairRun(repairRun);
        return false;
    }
    return true;
}
export async function runMaintenanceNarrowFaceRepair(root, button) {
    if (!root?.isConnected || !button?.isConnected)
        return false;
    const details = button.closest?.('details');
    if (!details || !(root === details || root.contains?.(details)) || !isRabbitMirrorDetails(details))
        return false;
    if (!details.open) {
        setMaintenanceRabbitState(button, MAINTENANCE_STATES.idle, __rmT("GWJZY1nXxrRokNM4c.gNGpkg.xyNoAHPrGupaeC4CAKY1T"));
        return false;
    }
    const repairRun = beginMaintenanceRepairRun(root, button);
    if (!repairRun)
        return false;
    try {
        if (rejectOversizedMaintenanceRepair(root, button, __rmT("52rsVatEbDE")))
            return false;
        if (!maintenanceRepairRunIsCurrent(repairRun))
            return false;
        setMaintenanceRabbitState(button, MAINTENANCE_STATES.checking, __rmT("hRyJwAG78A.6OWXcRzu52gjkWkzGtdWOrujTdwmZdDFO.yRaoXC"));
        const adapter = await import('../independentApi.js?rmv=2.2.0');
        if (!root.isConnected || !details.isConnected || !button.isConnected
            || button.closest?.('details') !== details || !details.open
            || !maintenanceRepairRunIsCurrent(repairRun)) {
            if (button.isConnected)
                setMaintenanceRabbitState(button, MAINTENANCE_STATES.idle, __rmT("4uJgcJAk9Bi4B0ZI07u_9vqGXfS5IoYvocAZiN6H1p05CBOXe3G"));
            return false;
        }
        const geometry = adapter.remeasureRabbitMirrorFaceGeometry(details);
        if (geometry.status === 'stale') {
            setMaintenanceRabbitState(button, MAINTENANCE_STATES.unknown, __rmT("i7M0XDNewy3RziIj6wSQUYGfEgnea4rL2uENqqY9"));
            return false;
        }
        const summary = details.querySelector(':scope > summary');
        if (summary)
            containRabbitMirrorTitleToolFloat(summary);
        const content = adapter.repairRabbitMirrorFaceAutoWidth(details);
        const gains = [geometry, content].filter(result => Number(result.afterWidth) > Number(result.beforeWidth) + 2);
        if (gains.length) {
            const result = gains[gains.length - 1];
            setMaintenanceRabbitState(button, MAINTENANCE_STATES.idle, `${__rmT("TsdGAH6mr6NkJfazDJ6_Lk")}${Math.round(result.beforeWidth)} → ${Math.round(result.afterWidth)}${__rmT("pimTAdI30Uq0zI7ZiQ2sqh")}`);
        }
        else {
            setMaintenanceRabbitState(button, MAINTENANCE_STATES.idle, __rmT("j4x39hchp.7HPtwiE9Zst0zE5.WSh1HF5pcLkfhg7Ng9d8SaMq3Qnu6FesQeXK3bZcCPgkqJqTk8DEQO_IY"));
        }
        return gains.length > 0;
    }
    catch (error) {
        console.debug('[RabbitMirror] narrow face repair failed:', error);
        failMaintenanceRabbit(button, __rmT("C3ACxohgK8C8Ew6DIyP5wdI9oKA0c9nLIv12y2QYh3E"));
        return false;
    }
    finally {
        finishMaintenanceRepairRun(repairRun);
    }
}
export function runMaintenanceRevealClipRepair(root, button) {
    if (!root?.isConnected || !button?.isConnected)
        return false;
    const repairRun = beginMaintenanceRepairRun(root, button);
    if (!repairRun)
        return false;
    try {
        if (rejectOversizedMaintenanceRepair(root, button, __rmT("8SUQaOUfqp9FZh")))
            return false;
        invalidateRabbitMirrorInteractionResetSnapshot(root);
        const captured = captureMaintenancePreRepairSnapshot(root);
        if (captured) {
            root = captured.root || root;
            button = captured.button || root.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || button;
        }
        setMaintenanceRabbitState(button, MAINTENANCE_STATES.checking, __rmT("SPWkViX3ny_b6hlaZ2ApYtafrrbxRfQdb3LC2jaOyyCFQv__"));
        const before = inspectMaintenanceRabbit(root);
        const revealBaseline = !isIndependentMaintenanceRoot(root) ? captureMaintenanceRevealBaseline(root) : null;
        const result = repairRevealedDrawerClipping(root);
        if (result.reason === 'none-open') {
            button.removeAttribute(MAINTENANCE_REPAIR_ATTR);
            setMaintenanceRabbitState(button, MAINTENANCE_STATES.idle, __rmT("BgD69P0xCmOnA9oPoNTHPaUQ6xqnwOCPmzVwM8gKIm_LnW8ykguOUwHqbjR3MSPiWUE"));
            return false;
        }
        if (!result.repaired) {
            button.removeAttribute(MAINTENANCE_REPAIR_ATTR);
            setMaintenanceRabbitState(button, MAINTENANCE_STATES.unknown, __rmT("AwekZ5ufWxsnQYJrFAn9Bbp971bIy3B3JGTTsz5wgUmIQY0O7mu3SQApI6HtBrbHIke58XSghKlS.4uE5F1TvHqb640W3DPbIWbqCqsKHXZxyQmcqyE0if"));
            return false;
        }
        button.setAttribute(MAINTENANCE_REPAIR_ATTR, 'true');
        setMaintenanceRabbitState(button, MAINTENANCE_STATES.idle, __rmT("hTjnnI1Eu_HCqV1Izb5WcdxxUA5zuLujU9Pfao4cmdtJyu5YkTGYt0sKA6WwbNiQ9r1V3UJ6VjHSjN5AKmUTlrqH5i7b2Ds_ANA"));
        const after = inspectMaintenanceRabbit(root);
        const introduced = compareMaintenanceFindings(before.findings || [], after.findings || []).introduced;
        if (introduced.length) {
            noteMaintenanceRepairNotPersisted(button, introduced);
            return true;
        }
        const patches = collectMaintenanceRevealPatches(revealBaseline);
        if (patches.length)
            rememberFollowMaintenanceRepair(root, 'reveal-clip', {
                executed: [{ id: 'revealed-clip-repair', count: patches.length, patches }],
            });
        notifyIndependentRepairPersistence(root);
        return true;
    }
    catch (error) {
        console.debug('[RabbitMirror] revealed clip repair failed:', error);
        failMaintenanceRabbit(button, __rmT("kJjNjSmaQ6erIiu54.SNd7IOnr_Dj5cPtUsXRKfu2gpzJT"));
        return false;
    }
    finally {
        finishMaintenanceRepairRun(repairRun);
    }
}
export function needsSanitize(text) {
    const decoded = decodeHtmlEntities(String(text || ''));
    if (TOTO_BLOCK_SINGLE_RE.test(decoded))
        return true;
    if (/```(?:html|HTML|xml|XML)?[\s\S]*?<toto\b/i.test(decoded))
        return true;
    if (FENCED_BLOCK_RE.test(decoded)) {
        FENCED_BLOCK_RE.lastIndex = 0;
        let match;
        while ((match = FENCED_BLOCK_RE.exec(decoded))) {
            const raw = stripOneCodeFence(decodeHtmlEntities(match[1]));
            if (looksLikeCompleteHtmlBlock(raw) || TOTO_BLOCK_SINGLE_RE.test(raw)) {
                FENCED_BLOCK_RE.lastIndex = 0;
                return true;
            }
        }
        FENCED_BLOCK_RE.lastIndex = 0;
    }
    return wrapTrailingNakedHtml(decoded) !== decoded.trim();
}
function findRecentAssistantMessages(mod) {
    const chat = mod?.chat || globalThis.chat;
    if (!Array.isArray(chat) || !chat.length)
        return [];
    const start = Math.max(0, chat.length - 8);
    return chat
        .slice(start)
        .map((message, offset) => ({ message, index: start + offset }))
        .filter(({ message }) => !message?.is_user && typeof message?.mes === 'string');
}
export function getRenderedMessageElement(index) {
    if (typeof document === 'undefined')
        return null;
    const safeIndex = Number.isInteger(Number(index)) ? String(Number(index)) : '';
    return safeIndex ? document.querySelector(`#chat [mesid="${safeIndex}"]`) : null;
}
function renderedMessageHasCssError(index) {
    const messageElement = getRenderedMessageElement(index);
    if (!messageElement)
        return false;
    const text = messageElement.querySelector('.mes_text')?.textContent || messageElement.textContent || '';
    return /CSS\s+ERROR\s*:/i.test(text) && !!messageElement.querySelector('details, toto');
}
function preserveAndRerenderSanitizedMessage(mod, index, message) {
    try {
        const updater = mod?.updateMessageBlock || globalThis.updateMessageBlock;
        if (typeof updater !== 'function' || typeof document === 'undefined')
            return false;
        const messageElement = getRenderedMessageElement(index);
        const detailsOpenStates = messageElement
            ? [...messageElement.querySelectorAll('details')].map(details => details.open)
            : [];
        updater(index, message);
        const restoredElement = getRenderedMessageElement(index);
        if (restoredElement && detailsOpenStates.length) {
            [...restoredElement.querySelectorAll('details')].forEach((details, detailsIndex) => {
                if (detailsOpenStates[detailsIndex])
                    details.open = true;
            });
        }
        return true;
    }
    catch (error) {
        console.debug('[RabbitMirror] rerender after sanitizer failed:', error);
        return false;
    }
}
function getMessageIndexFromElement(node) {
    const externalIndex = getExternalOwnerMessageIndex(node);
    if (externalIndex >= 0)
        return externalIndex;
    const messageElement = node?.closest?.('#chat [mesid], .mes[mesid]');
    const value = Number(messageElement?.getAttribute?.('mesid'));
    return Number.isInteger(value) && value >= 0 ? value : -1;
}
function getSourceRecoveryCandidate(message) {
    if (!message || message?.is_user)
        return '';
    const swipeIndex = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
    const sources = [];
    if (typeof message?.extra?.display_text === 'string')
        sources.push(message.extra.display_text);
    if (swipeIndex >= 0 && typeof message?.swipes?.[swipeIndex] === 'string')
        sources.push(message.swipes[swipeIndex]);
    if (typeof message?.mes === 'string')
        sources.push(message.mes);
    for (const source of sources) {
        const decoded = decodeHtmlEntities(source);
        if (needsSanitize(decoded))
            return decoded;
    }
    return '';
}
function recoverMessageSourceToDisplay(mod, index, message, { force = false, sourceOverride = '' } = {}) {
    if (!force || !message || message?.is_user)
        return false;
    const source = String(sourceOverride || getSourceRecoveryCandidate(message) || '');
    if (!source)
        return false;
    if (TRANSIENT_RERENDER_REASONING_ENVELOPE_RE.test(source))
        return false;
    const cleaned = cleanRabbitMirrorOutput(source);
    if (!cleaned || cleaned === source)
        return false;
    const signature = `${index}:${source.length}:${cleaned.length}`;
    const now = Date.now();
    const previous = sourceRecoveryLastRun.get(signature) || 0;
    if (!force && now - previous < SOURCE_RECOVERY_COOLDOWN_MS)
        return false;
    sourceRecoveryLastRun.set(signature, now);
    const transientMessage = cloneMessageForTransientRerender(message);
    transientMessage.mes = cleaned;
    if (Array.isArray(transientMessage.swipes)) {
        const swipeIndex = Number.isInteger(transientMessage.swipe_id)
            ? transientMessage.swipe_id
            : transientMessage.swipes.length - 1;
        if (typeof transientMessage.swipes[swipeIndex] === 'string')
            transientMessage.swipes[swipeIndex] = cleaned;
    }
    if (typeof transientMessage?.extra?.display_text === 'string')
        transientMessage.extra.display_text = cleaned;
    const rerendered = preserveAndRerenderSanitizedMessage(mod, index, transientMessage);
    return rerendered;
}
function parseHtmlFragment(html) {
    try {
        if (!validateRabbitMirrorMarkupLexicalBudget(html))
            return null;
        const template = document.createElement('template');
        template.innerHTML = html;
        if (!sanitizeMaintenanceMirrorTemplate(template))
            return null;
        return template.content.childNodes.length ? template.content.cloneNode(true) : null;
    }
    catch {
        return null;
    }
}
export function parseTotoFragment(html) {
    try {
        if (!validateRabbitMirrorMarkupLexicalBudget(html))
            return null;
        const template = document.createElement('template');
        template.innerHTML = html;
        if (!sanitizeMaintenanceMirrorTemplate(template))
            return null;
        const toto = template.content.querySelector('toto[data-rabbit-mirror="true"], toto');
        return toto ? toto.cloneNode(true) : null;
    }
    catch {
        return null;
    }
}
function isCodeShellNode(node) {
    return !!node?.matches?.(CODE_SHELL_SELECTOR);
}
function findCodeReplaceTarget(node) {
    if (!node?.closest)
        return null;
    const pre = node.closest('pre');
    if (pre)
        return pre;
    return isCodeShellNode(node) ? node : null;
}
function getCodeCandidateText(node) {
    const clone = node.cloneNode(true);
    for (const el of [...clone.querySelectorAll('button, .copy_code, .code-copy, .codeblock-header, .code_block_header, .toolbar, .hljs-button')])
        el.remove();
    return clone.textContent || '';
}
function extractLikelyHtmlFromText(text) {
    let raw = stripOneCodeFence(decodeHtmlEntities(String(text || '')))
        .replace(/\u00a0/g, ' ')
        .trim();
    if (!raw)
        return '';
    raw = raw
        .replace(__rmR("yasR7DWGIIYfgUmwwTXYxZyu8ukeCu9h3PtTc8zc34G2vGvXnl9OA7ouJyrgoU2hpSM5HSSBWBOajFP60iPUHApFal33E1Hzaz0EdXCpx9n2pCKvZSjrrrBlAw49WIxz5Mft7cxIzS_Uzo2k6ukSFJb_xfgRF0R.aJsncE9Ryo6auSeFz.eYJT", "i"), '')
        .trim();
    const startMatch = raw.match(/<\s*(?:toto|div|section|article|details)\b/i);
    if (!startMatch)
        return '';
    raw = raw.slice(startMatch.index).trim();
    const closingTags = ['</toto>', '</details>', '</article>', '</section>', '</div>'];
    let end = -1;
    for (const tag of closingTags) {
        const index = raw.toLowerCase().lastIndexOf(tag);
        if (index >= 0)
            end = Math.max(end, index + tag.length);
    }
    if (end >= 0)
        raw = raw.slice(0, end).trim();
    return raw;
}
function sanitizeRenderedRabbitMirrorDetailsInScope(root, force = false) {
    if (!force)
        return 0;
    if (!root?.querySelectorAll)
        return 0;
    let repairedCount = 0;
    const detailsList = [...new Set([...(root.matches?.('details') ? [root] : []), ...root.querySelectorAll('toto details, details')])].filter(isRabbitMirrorDetails);
    for (const details of detailsList) {
        if (!isInsideChatMessage(details))
            continue;
        const candidates = [...details.querySelectorAll('pre, code, .hljs, .code_block, .code-block, .codeblock, [class*="codeblock"], [class*="code-block"]')]
            .filter(node => node !== details && !node.closest('summary'))
            .sort((a, b) => (b.querySelectorAll('*').length - a.querySelectorAll('*').length));
        for (const node of candidates) {
            if (!node?.isConnected || !details.contains(node))
                continue;
            if (node.querySelector?.('toto, details'))
                continue;
            const raw = extractLikelyHtmlFromText(getCodeCandidateText(node));
            if (!raw)
                continue;
            let replacement = null;
            if (TOTO_BLOCK_SINGLE_RE.test(raw)) {
                const cleaned = cleanRabbitMirrorOutput(raw);
                const inner = cleaned
                    .replace(/^\s*<toto\b[^>]*>/i, '')
                    .replace(/<\/toto>\s*$/i, '')
                    .trim();
                replacement = parseHtmlFragment(compactTotoBlock(inner));
            }
            else if (looksLikeCompleteHtmlBlock(raw)) {
                replacement = parseHtmlFragment(compactTotoBlock(raw));
            }
            if (!replacement)
                continue;
            const target = findCodeReplaceTarget(node);
            if (target?.isConnected && details.contains(target) && isInsideChatMessage(target) && isCodeShellNode(target)) {
                target.replaceWith(replacement);
                repairedCount += 1;
                break;
            }
        }
    }
    return repairedCount;
}
export function extractStrictWholeRabbitMirrorText(node) {
    if (!node)
        return '';
    const decoded = decodeHtmlEntities(String(node.textContent || ''))
        .replace(/\u00a0/g, ' ')
        .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
        .trim();
    if (!decoded)
        return '';
    const match = decoded.match(/^\s*(<toto\b[\s\S]*?<\/toto>)\s*$/i);
    if (!match)
        return '';
    const raw = match[1].trim();
    if (!/<toto\b[^>]*data-rabbit-mirror\s*=\s*["']true["']/i.test(raw))
        return '';
    if (!/<details\b/i.test(raw) || !__rmR("5C.LFe5gpgDNlp12QWacIU2t618I1L7hPo9BpEfR7AL2z8gGQIsYntJhUGMu83HhnZyBqEZy", "i").test(raw))
        return '';
    return raw;
}
function sanitizeWholePlainTextRabbitMirrorsInScope(root, force = false) {
    if (!force)
        return 0;
    if (!root?.querySelectorAll)
        return 0;
    let repairedCount = 0;
    const messageBodies = root.matches?.('.mes_text') ? [root] : [...root.querySelectorAll('.mes_text')];
    for (const body of messageBodies) {
        if (!body?.isConnected || !isInsideChatMessage(body))
            continue;
        if ([...body.querySelectorAll('toto, details')].some(node => !node.closest('[data-rabbit-mirror-external-source]')))
            continue;
        const raw = extractStrictWholeRabbitMirrorText(body);
        if (!raw)
            continue;
        const cleaned = cleanRabbitMirrorOutput(raw);
        const match = cleaned.match(TOTO_BLOCK_SINGLE_RE);
        const replacement = match ? parseTotoFragment(match[0]) : null;
        if (!replacement)
            continue;
        body.replaceChildren(replacement);
        bindRabbitMirrorAvatarRoot(replacement);
        repairedCount += 1;
    }
    return repairedCount;
}
function sanitizeCodeBlocksInScope(root, force = false) {
    if (!force)
        return 0;
    if (!root?.querySelectorAll)
        return 0;
    let repairedCount = 0;
    const candidates = [...new Set([...(root.matches?.(CODE_SHELL_SELECTOR) ? [root] : []), ...root.querySelectorAll(CODE_SHELL_SELECTOR)])]
        .filter(node => !node.querySelector?.('pre, code') || node.matches('pre, code, .hljs'));
    for (const node of candidates) {
        if (!node?.isConnected || !isInsideChatMessage(node))
            continue;
        const raw = stripOneCodeFence(decodeHtmlEntities(getCodeCandidateText(node)));
        if (!raw)
            continue;
        let replacement = null;
        const ownerDetails = node.closest('details');
        const insideRabbitMirror = !!node.closest(MIRROR_TOTO_SELECTOR) || !!(ownerDetails && isRabbitMirrorDetails(ownerDetails));
        if (TOTO_BLOCK_SINGLE_RE.test(raw)) {
            const cleaned = cleanRabbitMirrorOutput(raw);
            const match = cleaned.match(TOTO_BLOCK_SINGLE_RE);
            replacement = match ? parseTotoFragment(match[0]) : null;
        }
        else if (looksLikeCompleteHtmlBlock(raw)
            && (insideRabbitMirror || /<details\b[\s\S]*<summary\b/i.test(raw))) {
            replacement = insideRabbitMirror
                ? parseHtmlFragment(compactTotoBlock(raw))
                : parseTotoFragment(wrapNakedHtmlAsToto(raw));
        }
        if (!replacement)
            continue;
        const target = findCodeReplaceTarget(node);
        if (target?.isConnected && (target === root || root.contains?.(target)) && isInsideChatMessage(target) && isCodeShellNode(target)) {
            target.replaceWith(replacement);
            repairedCount += 1;
        }
    }
    return repairedCount;
}
globalThis.__rabbitMirrorRefreshCrossParentVerdict = root => {
    try {
        const button = root?.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`);
        if (!button?.isConnected || button.getAttribute('data-rabbit-mirror-maintenance-state') !== MAINTENANCE_STATES.repairable)
            return;
        if (!__rmR("b6d_qIqjCBl", "").test(button.getAttribute('data-rabbit-mirror-maintenance-reason') || ''))
            return;
        const after = inspectMaintenanceRabbit(root);
        const findings = after?.findings || [];
        if (findings.some(finding => finding?.id === 'cross-parent-checked-target'))
            return;
        if (findings.length) {
            setMaintenanceRabbitState(button, MAINTENANCE_STATES.repairable, `${__rmT("OEHx.F_bpDMZNr6_WCUhKUMe43WTu2S4ysP7.Nc1gnlAxYjAwSOLDTi8RK8v9k")}${maintenanceFindingReason(findings)}`);
        }
        else {
            setMaintenanceRabbitState(button, MAINTENANCE_STATES.idle, __rmT("udin0aytizN3Yf5ayYwsAAM4M7glo.mUaHTkugRPGlKtcSC6bkJnpLUX_ZOqTqm8uEjv5f"));
        }
    }
    catch (error) {
        console.debug('[RabbitMirror] cross-parent verdict refresh skipped:', error);
    }
};
