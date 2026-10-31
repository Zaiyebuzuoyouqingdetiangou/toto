import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=2.5.2";
import { lendMirrorImages } from '../imageStore.js?rmv=2.5.2';
import { markFreshDrawSlot } from '../freshDrawSlots.js?rmv=2.5.2';
import { noteGenerationEvidenceMount } from '../generationEvidence.js?rmv=2.5.2';
import { carryExternalFaceFrames, clearFaceFrame } from './faceFrame.js?rmv=2.5.2';
import { describeLocalStorageUsage } from '../storageUsage.js?rmv=2.5.2';
import { hasUsableAssistantBody } from './missingRetryShell.js?rmv=2.5.2';
import { pickMovedIndependentRecord, pickOwnStaleRecord } from './movedRecord.js?rmv=2.5.2';
import { expandHtmlDocumentCodeBlocks } from '../outputSanitizer/markup.js?rmv=2.5.2';
import { restoreRuntimeAnimationClone } from '../runtimeAnimationState.js?rmv=2.5.2';
import { desktopFaceZoomActive } from '../desktopFaceZoom.js?rmv=2.5.2';
import { startGenerationProgress, dropGenerationProgressUnlessLoading } from './generationProgress.js?rmv=2.5.2';
import { stampGeneratedFaces } from '../generationStamp.js?rmv=2.5.2';
import { faceDrawMetadataFields } from '../faceDrawRules.js?rmv=2.5.2';
import { atmosphereSelectionFields } from '../atmosphereChoice.js?rmv=2.5.2';
import { presentationModeFields, isBlankLongTextSelection } from '../presentationMode.js?rmv=2.5.2';
import { PRESENTATION_FORMATS } from '../../data/structured/presentationIndex.js?rmv=2.5.2';
import { getSettings } from '../settings.js?rmv=2.5.2';
import { configuredIndependentMaxRequestChars } from '../independentRequestBudget.js?rmv=2.5.2';
import { independentGenerationTiming } from '../independentTiming.js?rmv=2.5.2';
import { mainReplyAbnormalReason, notifySafetyValve } from '../mainReplySafetyValve.js?rmv=2.5.2';
import { independentAdvancedOptionsSignature } from '../advancedRequestOptions.js?rmv=2.5.2';
import { cleanRabbitMirrorOutput, refreshRabbitMirrorToolsInScope, isolateRabbitMirrorInteractionIds, rearmRabbitMirrorSerializedInteractionRoot, armRabbitMirrorFirstUseInteraction, } from '../outputSanitizer.js?rmv=2.5.2';
import { matchesRabbitMirrorTextReplacementReceipt } from '../replacementReceipt.js?rmv=2.5.2';
import { parseMultifaceOutput, createMultifaceFailureSlot, MULTIFACE_FAILURE_ATTR, normalizedSummaryText } from '../multifaceProtocol.js?rmv=2.5.2';
import { getSanitizedRabbitMirrorFaceProof, markSanitizedRabbitMirrorFace, rabbitMirrorMultifaceSourceHash, rabbitMirrorMessageSourceHash } from '../multifaceProof.js?rmv=2.5.2';
import { FOLLOW_MULTIFACE_COMMITTED_EVENT, FOLLOW_MULTIFACE_REJECTED_EVENT, FOLLOW_GENERATION_SETTLED_EVENT, getRabbitMirrorFollowBatchFailure, } from '../visualScanner.js?rmv=2.5.2';
import { commitVisualHistorySelection, commitPendingComboBatch, releasePendingComboBatch, describeComboHistoryFailure, comboHistoryFailureCode } from '../storage.js?rmv=2.5.2';
let lastComboHistoryWarning = null;
import { consumeInjectedFeedbackForSuccessfulIndependentRabbitMirror, getActiveFeedbackForCurrentChat, markFeedbackCatInjected, } from '../feedbackCat.js?rmv=2.5.2';
import { getRabbitMirrorRecipe, recordRabbitMirrorRecipe } from '../blacklist.js?rmv=2.5.2';
import { readFollowPartialResult, followPartialResultFaceOwnerKey } from '../followPartialResults.js?rmv=2.5.2';
import { shouldAutomaticReroll, automaticRerollStatusText, automaticRerollExhaustedNote, shouldAnnounceAutomaticRerollExhausted, isAutomaticRerollStall, isQuotaInsufficientFailure, isNonRetryableRequestFailure, isLocalPreflightFailure, configuredAutomaticRerollIdleMs, } from '../automaticReroll.js?rmv=2.5.2';
import { mergeMissingIndependentFaces, mergeRetrySelectionDiagnostic, missingIndexesFromIndependentResult, recipesCoverMissing, } from '../missingFaceMerge.js?rmv=2.5.2';
import { FACE_SWIPE_FULL_MESSAGE, canAppendSwipe, seedSwipeState, updateCurrentSwipeHtml, readFaceSwipe, writeFaceSwipe, mutateFaceSwipe, faceSwipeSnapshotStored, saveFaceSwipeArchive, loadFaceSwipeArchiveRows, emptySwipeState, restoreFaceSwipeSnapshot, snapshotFaceSwipes, } from '../swipeVersions.js?rmv=2.5.2';
import { ACTION_BRIDGE_KEY, CONTEXT_TOTAL_BUDGET, EXTERNAL_SHELL_ATTR, FOLLOW_EXTERNAL_ANCHOR_ATTR, HISTORICAL_LIGHT_HOST_ATTR, HISTORY_EVENT, INDEPENDENT_GENERATION_INTENTS_KEY, INDEPENDENT_GENERATION_INTENT_TTL_MS, INDEPENDENT_GENERATION_INTENT_TYPES, INDEPENDENT_REPAIR_PERSIST_EVENT, RESAY_EVENT, RUNTIME_VERSION, SOURCE_ATTR, byteLength, currentRuntime, getContext, hashText, independentMaintenanceLiveRepairLocked, } from './runtime.js?rmv=2.5.2';
import { ACTIVE_GENERATION_WAIT_MS, FINAL_RENDER_CONFIRMATION_TTL_MS, FINAL_RENDER_POLL_INTERVAL_MS, FINAL_RENDER_SOURCE_STABLE_WAIT_MS, GENERATION_PLACEHOLDER_POLL_INTERVAL_MS, GENERATION_PLACEHOLDER_POLL_LIMIT_MS, OWNER_REATTACH_WAIT_MS, SOURCE_STABLE_WAIT_MS, WEAK_GENERATION_FLAG_GRACE_MS, WEAK_GENERATION_SOURCE_STABLE_WAIT_MS, advanceOperationEpochForBase, automaticDispatchAlreadyConsumed, automaticFailureStopFor, automaticFailureStops, blockingAutomaticFailureStopFor, isMissingShellStop, clearAutomaticFailureStop, createIndependentRequestDeadline, createManualDispatchLease, flightIdentity, generationPolls, globalFlights, hasAutomaticFailureStop, markAutomaticFailureStop, operationEpochForBase, pending, reserveAutomaticDispatchLease, } from './flights.js?rmv=2.5.2';
import { HISTORY_PANEL_ATTR, INDEPENDENT_RECORD_BUDGET_BYTES, appendHistoryEntry, applyIndependentFaceSwipe, canIndependentFaceResay, chatPersistenceSlot, deleteIndependentFaceSwipe, hasIndependentSwipeInitial, historyEntriesForSlot, independentFaceSwipeView, independentRecordWithinBudget, persistedOwnerForMessage, savedInChatFile, writtenToChatMetadata, independentHistoryLoaded, independentHistoryReadState, restoreIndependentHistory, readStore, restoreIndependentFaceSwipeInitial, writePersistedOwner, requestSafeChatSave, writeStore, chatPersistedOwnerEntries, chatMovedOwners, saveMovedOwner, dropMovedOwner, } from './persistence.js?rmv=2.5.2';
import { appendIndependentFaceSwipe, faceDetailsListFromHtml, mergeFaceDetailsIntoHtml, hasEphemeralFaceFailure, independentRerollMax, independentSwipeSlot, scrubSwipeDetailsHtml, seedIndependentFaceSwipes, seedNeighborIndependentFaceSwipes, showEphemeralFaceFailure, } from './faceSwipe.js?rmv=2.5.2';
import { INDEPENDENT_OWNER_OBSERVATION, assistantMessages, bindIndependentRecordContinuity, chatKey, contextBundle, createIndependentVisibleTextReader, externalHostGenerationActivity, findSavedRecord, globalWorldInfoContextView, globalWorldInfoSnapshotFor, hostGenerationActivity, hostGenerationLooksActive, hostModule, independentLineageOriginSlot, isRabbitMirrorEligibleAssistantMessage, isRabbitMirrorToolResultMessage, lastAssistantMessage, legacyChatKey, legacyMessageSlotKeys, lockedIndependentRecordForBase, messageBaseSlotKey, messageBody, messageBodyFingerprint, messageDisplayFingerprint, messageElement, messageReasoningFingerprint, messageSlotKey, messageSourceFingerprint, legacyMessageSourceFingerprints, observeMessageSourceRevision, ownerLockForBase, recordKey, saveRecordForSlot, savedIndependentRecordForOwner, savedRecordMatchesObserved, setOwnerLockForBase, slotSearchKeys, swipeId, stripExcludedTagsFromReference, } from './connection.js?rmv=2.5.2';
import { allExternalHosts, assertIndependentMarkupComplexityWithDiagnostic, callIndependentApi, commitIndependentVisualResult, externalHosts, externalInsertTarget, followOriginMarker, hasMultifaceMarkup, independentExternalEffectiveViewportWidth, independentMarkupLimitError, independentPaletteFingerprintFromHtml, independentSelectedFormatDescriptors, legacyFollowOriginContainer, markExternalGeometryLifecycle, matchingExternalHosts, outputCutMessage, removeDuplicateExternalHosts, removeEmptyFollowExternalAnchors, republishIndependentTerminalFailure, requestIndependentCompletion, stampExternalDetailsOwnership, wrapIndependentFace, wrapPreparedIndependentFace, wrappedIndependentMirrorHtml, } from './request.js?rmv=2.5.2';
import { DEFERRED_INTERACTION_RESCUE_ATTR, INDEPENDENT_CONTENT_WIDTH_BASELINE_ATTR, INDEPENDENT_CONTENT_WIDTH_RESCUE_ATTR, INDEPENDENT_EXTERNAL_STAGE_NEUTRALIZED_ATTR, MAINTENANCE_PERSISTED_LAYOUT_ATTR, averageExternalShellColors, beginHostWorkTiming, buildExternalHost, captureIndependentContentWidthBaseline, clearExternalHostFreshSourceState, clearIndependentResayStatus, collapseDuplicateIdentityHosts, ensureExternalTools, externalPlaceholderTitle, ensureReplyGenerationPlaceholder, externalHostsOwnedByMesid, externalShellColorsFromText, externalToolHost, extractReadyDetails, fallbackExternalDetails, hasExplicitSourceReplacementEvidence, independentStoredHtmlRestorable, initialHtmlForRecord, inlineRabbitMirrorDetails, isRabbitMirrorDetails, markExternalDetails, markMountedFaceProofs, messageElementForExternalHost, mirrorSemanticFingerprint, mountExternalFaceDetails, mountedIndependentErrorHostMatchesObserved, mountedIndependentReadyHostMatchesObserved, parseExternalShellColor, passiveIndependentFailureForIdentity, placeExternalHost, prepareQuickResay, prepareStoredIndependentRecordHtml, quickActionOwnerCurrent, quickStartOwners, readyDetailsFromHost, readyRecordFromHost, rebuildCollapsedReadyHost, recoverEscapedExternalDetails, recoverSavedRecord, refreshExistingExternalDetails, removeInlineMirrorDuplicate, renderExternalErrorBody, repatriateExternalDetails, replaceExternalMultifaceFace, restoreIndependentContentWidthBaseline, releaseExternalFlowHeight, sanitizeIndependentReadyFragment, scheduleExternalShellTint, scrubIndependentInteractionState, sealIndependentTextReplacementRecord, setPlaceholderSummary, showIndependentResayStatus, transferExternalTools, usableReadyDetails, } from './geometry.js?rmv=2.5.2';
import { assertEarlyBodyOwner, automaticHostGenerationMayUseTools, automaticHostRenderProof, automaticMainReplySafetyOptions, cancelEarlyBodyOwner, clearAutomaticHostGenerationSettlement, clearScheduledGeneration, earlyBodyOwnerCurrent, hasExistingFollowRabbitMirror, queueMessageSync, scheduleStartupHistorySync, suppressesAutomaticGeneration, unlockAutomaticGenerationCutover, } from './earlyBody.js?rmv=2.5.2';
import { automaticGenerationCutovers, backgroundLifecycleListenersInstalled, backgroundLifecycleNeedsRecovery, backgroundResumeTimer, generationPlaceholderStartedAt, generationPlaceholderTimer, hostGenerationHintStartedAt, hostGenerationInProgress, independentActionBridge, lastAppliedIndependentTiming, runtimeConfigSequence, writeBackgroundLifecycleListenersInstalled, writeBackgroundLifecycleNeedsRecovery, writeBackgroundResumeTimer, writeGenerationPlaceholderStartedAt, writeGenerationPlaceholderTimer, writeHostGenerationHintStartedAt, writeHostGenerationInProgress, writeIndependentActionBridge, writeLastAppliedIndependentTiming, } from './lifecycle.js?rmv=2.5.2';
let generationSequence = 0;
let historicalRestoreLightDepth = 0;
let feedbackActionListenerInstalled = false;
let repairPersistenceListenerInstalled = false;
let followMultifaceCommitListenerInstalled = false;
export const orphanExternalHostTimers = new Map();
export const messageSourceRevisions = new Map();
export const independentRejectedFacePreviews = new Map();
export const INDEPENDENT_REJECTED_PREVIEW_MAX_ENTRIES = 20;
export const INDEPENDENT_REJECTED_PREVIEW_MAX_CHARS = 1024 * 1024;
export let independentRejectedPreviewChars = 0;
export function writeIndependentRejectedPreviewChars(value) { independentRejectedPreviewChars = value; return value; }
export let independentRejectedPreviewSequence = 0;
export function writeIndependentRejectedPreviewSequence(value) { independentRejectedPreviewSequence = value; return value; }
export const independentRejectedFaceControlsWired = new WeakSet();
export let externalHostSyncIndex = null;
export function writeExternalHostSyncIndex(value) { externalHostSyncIndex = value; return value; }
let lastIndependentDisplayMode = independentDisplayMode();
const mirrorImageTargetCache = new WeakMap();
const MANUAL_INTENTS_KEY = '__rabbitMirrorIndependentManualIntentsV1';
const manualPlaceholderOwners = new WeakMap();
export const manualTerminalOwners = new Map();
export const INDEPENDENT_INTENT_OWNER = Symbol.for('rabbitMirror.independentIntentOwner');
export const earlyBodyCredentials = new WeakMap();
export function withHistoricalRestoreLightPass(fn) {
    historicalRestoreLightDepth += 1;
    try {
        return fn();
    }
    finally {
        historicalRestoreLightDepth = Math.max(0, historicalRestoreLightDepth - 1);
    }
}
function historicalRestoreLightPassActive() { return historicalRestoreLightDepth > 0; }
export function historicalLightHost(host) {
    if (!host?.isConnected || host.dataset?.rmSource !== 'independent' || host.dataset?.rmState !== 'ready')
        return false;
    const details = host.querySelector?.(':scope > details');
    return host.hasAttribute?.(HISTORICAL_LIGHT_HOST_ATTR) && !!details && externalFaceDetails(host).every(face => !face.open && !face.hasAttribute?.('open'));
}
function markHistoricalLightHostForRestore(host) {
    if (!host?.setAttribute || host.dataset?.rmSource !== 'independent' || host.dataset?.rmState !== 'ready')
        return false;
    const details = host.querySelector?.(':scope > details');
    if (historicalRestoreLightPassActive() && details && externalFaceDetails(host).every(face => !face.open && !face.hasAttribute?.('open'))) {
        host.setAttribute(HISTORICAL_LIGHT_HOST_ATTR, 'true');
        host.dataset.rmGeometryMode = 'historical-collapsed-deferred';
        return true;
    }
    if (externalFaceDetails(host).some(face => face.open || face.hasAttribute?.('open')))
        host.removeAttribute?.(HISTORICAL_LIGHT_HOST_ATTR);
    return false;
}
export function externalFaceDetails(host) {
    return [...(host?.children || [])].filter(node => node?.tagName === 'DETAILS').slice(0, 5);
}
export function showMultifaceFace(host, index = 0) {
    const faces = externalFaceDetails(host);
    if (!host || !faces.length)
        return 0;
    const next = Math.max(0, Math.min(faces.length - 1, Number.isInteger(Number(index)) ? Number(index) : 0));
    const previous = Math.max(0, Math.min(faces.length - 1, Number(host.dataset.rmFaceView) || 0));
    const carryOpen = faces.length > 1 && previous !== next ? faces[previous]?.hasAttribute?.('open') === true : null;
    host.dataset.rmFaceView = String(next);
    host.classList.toggle('rabbit-mirror-multiface-host', faces.length > 1);
    for (const [i, face] of faces.entries()) {
        const current = faces.length > 1 && i === next;
        if (current)
            face.setAttribute('data-rm-face-current', 'true');
        else
            face.removeAttribute('data-rm-face-current');
        if (faces.length > 1 && !current)
            face.style.setProperty('display', 'none', 'important');
        else
            face.style.removeProperty('display');
        if (carryOpen !== null) {
            if (current) {
                if (carryOpen)
                    face.setAttribute('open', '');
                else
                    face.removeAttribute('open');
            }
            else
                face.removeAttribute('open');
        }
    }
    if (faces.length > 1 && previous !== next && typeof refreshIndependentExternalFaceFit === 'function')
        refreshIndependentExternalFaceFit(host);
    if (faces.length > 1 && previous !== next && host?.dataset?.rmPlacement === 'external') {
        try {
            carryExternalFaceFrames(host);
        }
        catch { }
    }
    return next;
}
export function serializeExternalFaceDetails(host, { scrubTools = true } = {}) {
    const faces = externalFaceDetails(host);
    return faces.map((details, index) => {
        const clone = restoreRuntimeAnimationClone(details, details.cloneNode(true));
        clone.querySelectorAll?.('[data-rabbit-mirror-reference-note]')?.forEach(node => node.remove());
        if (scrubTools)
            clone.querySelectorAll?.('[data-rabbit-mirror-tool-entry-host], [data-rm-image-region], [data-rm-image-portal], [data-rabbit-mirror-interaction-diagnostic], [data-rabbit-mirror-interaction-home], [data-rm-face-swipe-host], [data-rm-face-swipe-bar], [data-rm-face-swipe-delete]')?.forEach(node => node.remove());
        stripIndependentTransientLayoutArtifacts(clone);
        clone.removeAttribute?.(DEFERRED_INTERACTION_RESCUE_ATTR);
        clone.removeAttribute?.('data-rm-face-current');
        clone.style?.removeProperty?.('display');
        return faces.length > 1 ? wrapIndependentFace(clone.outerHTML, index) : String(clone.outerHTML || '');
    }).join('\n');
}
export function clearIndependentRejectedFacePreviews() {
    independentRejectedFacePreviews.clear();
    independentRejectedPreviewChars = 0;
}
function independentDisplayMode() {
    return getSettings().independentDisplayMode === 'external_then_inline' ? 'external_then_inline' : 'external';
}
export function consumeIndependentDisplayModeChange() {
    const next = independentDisplayMode();
    const changed = next !== lastIndependentDisplayMode;
    lastIndependentDisplayMode = next;
    return changed;
}
export function independentPlacementForState(state = 'ready') {
    return state === 'ready' && independentDisplayMode() === 'external_then_inline' ? 'inline' : 'external';
}
export function stripEphemeralFailureArtifacts(details) {
    if (!details?.querySelectorAll)
        return details;
    details.querySelectorAll('[data-rabbit-mirror-source-truncation-notice]').forEach(node => node.remove());
    details.querySelectorAll('[data-rm-ephemeral-failure-body]').forEach(node => node.remove());
    details.querySelectorAll('[data-rm-ephemeral-failure-hidden]').forEach(node => { node.removeAttribute('data-rm-ephemeral-failure-hidden'); node.hidden = false; });
    details.removeAttribute?.('data-rm-ephemeral-failure');
    details.querySelectorAll('[data-rm-draw-status], style[data-rm-sibling-bridge]').forEach(node => node.remove());
    details.querySelectorAll('img[data-rm-draw-result]').forEach(node => { if (!/^data:/i.test(String(node.getAttribute('src') || '').trim()))
        node.remove(); });
    return details;
}
export function stripIndependentTransientLayoutArtifacts(details) {
    if (!details?.querySelectorAll)
        return details;
    stripEphemeralFailureArtifacts(details);
    clearFaceFrame(details);
    details.querySelectorAll?.('details[data-rm-face-frame]').forEach(node => clearFaceFrame(node));
    details.querySelectorAll('[data-rm-rejected-preview-host]').forEach(node => { node.replaceChildren(); node.hidden = true; });
    details.querySelectorAll('[data-rabbit-mirror-interaction-diagnostic]').forEach(node => node.remove());
    const preserveMaintenance = details.getAttribute?.(MAINTENANCE_PERSISTED_LAYOUT_ATTR) === 'true';
    for (const element of details.querySelectorAll(`[${INDEPENDENT_CONTENT_WIDTH_RESCUE_ATTR}], [${INDEPENDENT_CONTENT_WIDTH_BASELINE_ATTR}]`)) {
        restoreIndependentContentWidthBaseline(element);
    }
    const transientStyles = ['style[data-rabbit-mirror-independent-mobile-spatial-style]'];
    if (!preserveMaintenance) {
        transientStyles.push('style[data-rabbit-mirror-mobile-layout-rescue]', 'style[data-rabbit-mirror-visual-scenery-overflow-rescue]', 'style[data-rabbit-mirror-viewport-layout-rescue]');
    }
    details.querySelectorAll(transientStyles.join(',')).forEach(node => node.remove());
    if (!preserveMaintenance) {
        details.querySelectorAll('[data-rm-mobile-visual-scenery-overflow-host]').forEach(node => node.remove());
        details.querySelectorAll('[data-rm-mobile-visual-scenery-overflow-source]').forEach(node => node.removeAttribute('data-rm-mobile-visual-scenery-overflow-source'));
    }
    const runtimeAttrs = [
        'data-rm-external-flow-root',
        'data-rabbit-mirror-independent-mobile-spatial-count',
        'data-rm-independent-mobile-spatial-scroll', 'data-rm-independent-mobile-spatial-canvas'
    ];
    const maintenanceAttrs = [
        'data-rabbit-mirror-mobile-layout-scope', 'data-rabbit-mirror-mobile-layout-count',
        'data-rabbit-mirror-visual-scenery-overflow-count', 'data-rabbit-mirror-viewport-layout-count',
        'data-rm-mobile-fit', 'data-rm-mobile-min', 'data-rm-mobile-grid-collapse', 'data-rm-mobile-matrix-preserve',
        'data-rm-mobile-matrix-active', 'data-rm-mobile-matrix-cell', 'data-rm-mobile-flex-wrap', 'data-rm-mobile-state-row',
        'data-rm-mobile-flex-stack', 'data-rm-mobile-single-column', 'data-rm-mobile-fluid-title', 'data-rm-mobile-compact-padding',
        'data-rm-mobile-compact-gap', 'data-rm-mobile-media', 'data-rm-mobile-scroll', 'data-rm-mobile-break-text',
        'data-rm-mobile-state-content', 'data-rm-mobile-state-active', 'data-rm-mobile-section-stack-preserve', 'data-rm-mobile-screen-shell-preserve',
        'data-rm-mobile-relation-tree', 'data-rm-mobile-relation-branch', 'data-rm-mobile-relation-cell', 'data-rm-mobile-relation-detail',
        'data-rm-mobile-relation-side',
        'data-rm-squeezed-span', 'data-rm-squeezed-scroll', 'data-rm-squeezed-scroll-y', 'data-rm-squeezed-pointer'
    ];
    const attrs = preserveMaintenance ? runtimeAttrs : [...runtimeAttrs, ...maintenanceAttrs];
    const nodes = [details, ...details.querySelectorAll('*')];
    for (const node of nodes) {
        for (const attr of attrs)
            node.removeAttribute?.(attr);
        node.style?.removeProperty?.('--rm-mobile-spatial-natural-width');
    }
    return details;
}
export function independentPrimaryVisualShell(details) {
    if (!details?.querySelectorAll || typeof getComputedStyle !== 'function')
        return null;
    const body = [...(details.children || [])].find(node => !['SUMMARY', 'STYLE', 'SCRIPT', 'TEMPLATE', 'LINK', 'META'].includes(node?.tagName));
    if (!body?.isConnected)
        return null;
    let bodyRect;
    try {
        bodyRect = body.getBoundingClientRect();
    }
    catch {
        return null;
    }
    const bodyWidth = Math.max(1, Number(bodyRect?.width || 0));
    const bodyHeight = Math.max(1, Number(bodyRect?.height || 0));
    const nodes = [body, ...body.querySelectorAll('div,section,article,main,figure')].slice(0, 320);
    const candidates = [];
    for (const element of nodes) {
        if (!element?.isConnected || element.closest?.('[data-rabbit-mirror-tool-entry-host]'))
            continue;
        let style, rect;
        try {
            style = getComputedStyle(element);
            rect = element.getBoundingClientRect();
        }
        catch {
            continue;
        }
        if (!style || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || 1) < .08)
            continue;
        const width = Math.max(0, Number(rect?.width || 0));
        const height = Math.max(0, Number(rect?.height || 0));
        if (width < 180 || height < 220)
            continue;
        const widthRatio = width / bodyWidth;
        const heightRatio = height / bodyHeight;
        if (widthRatio < .34 || widthRatio > .96 || heightRatio < .28)
            continue;
        const signature = `${element.id || ''} ${element.className || ''} ${element.getAttribute?.('aria-label') || ''} ${element.getAttribute?.('style') || ''}`.toLowerCase();
        const strongHint = __rmR("fYYmO8CgN0OyRfEV4Tql66SLDBYyFjzLsBtObUZ4PuFXKaArATKn3tRp0X4ckn.v5YY6MUKh8vqWEVuaSBQU2T9gIxGnYnlWX_CeUkidKbLnzj9GVismKwZHAQiYsMR08XIb3u.3bpD8ZdEXxyMUHQzta.I7l3FFX3Q7XI0WGqHbkFJpyL_v.sAgmQaZGxYuicomlVVos2xbNV30i0PhdNh40cxhw6UNg4RGUAnyf9xPO6qZX.uZPi4jETldcNZjeudwqErwRhHDomMNO8vQ75GEk0VPaWaDKeUwyBQUCqDaRQsXSTicvf", "i").test(signature);
        const objectLike = __rmR("NclgjoZ_bQb4_R1wDHuGTcav70ri7XLXC8NeH3zfm9FtTJQj3z8Ac_soSwb7ugxabYLMaYvxBILn.4jSTux4UHTRWipDDLeU84kkt7J26Fdp7IRiyN_wx9uK2UgjdzK8cmmvAYFMoIRjVgldMPWgkerB8Aj1sHrm7qLErqyW7VNdd.B8LnfwH28J6.lnwddzwmtYR5dEEQp27pimP_fuphI2SP2Gzju00G8", "i").test(signature);
        const background = parseExternalShellColor(style.backgroundColor);
        const gradient = averageExternalShellColors(externalShellColorsFromText(style.backgroundImage));
        const borderRadius = Math.max(...String(style.borderRadius || '0').split(/[\s\/]+/).map(value => parseFloat(value) || 0), 0);
        const borderWidth = Math.max(...String(style.borderWidth || '0').split(/\s+/).map(value => parseFloat(value) || 0), 0);
        const hasBackground = !!((background && background.a >= .18) || gradient);
        const hasFrame = borderRadius >= 14 || borderWidth >= 2;
        if (!strongHint && !hasBackground && !hasFrame)
            continue;
        let depth = 0, current = element;
        while (current && current !== body && depth < 14) {
            depth++;
            current = current.parentElement;
        }
        const centerOffset = Math.abs((Number(rect.left || 0) + width / 2) - (Number(bodyRect.left || 0) + bodyWidth / 2)) / Math.max(1, bodyWidth);
        const area = width * height;
        const areaRatio = Math.min(1.6, area / Math.max(1, bodyWidth * bodyHeight));
        const portraitBonus = height >= width * 1.12 ? .65 : 0;
        const score = areaRatio * 6 + widthRatio * 2.8 + heightRatio * 1.4 + (strongHint ? 2.8 : 0) + (hasBackground ? 1.2 : 0) + (hasFrame ? 1.1 : 0) + portraitBonus - centerOffset * 2 + Math.max(0, .9 - depth * .08);
        candidates.push({ element, width, height, widthRatio, heightRatio, area, score, strongHint, objectLike, hasFrame, hasBackground });
    }
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0] || null;
}
function independentPrimaryContentCarrier(details) {
    if (!details?.querySelectorAll || typeof getComputedStyle !== 'function')
        return null;
    const body = [...(details.children || [])].find(node => !['SUMMARY', 'STYLE', 'SCRIPT', 'TEMPLATE', 'LINK', 'META'].includes(node?.tagName));
    if (!body?.isConnected)
        return null;
    let bodyRect;
    try {
        bodyRect = body.getBoundingClientRect();
    }
    catch {
        return null;
    }
    const bodyWidth = Math.max(1, Number(bodyRect?.width || 0));
    const bodyHeight = Math.max(1, Number(bodyRect?.height || 0));
    const compact = value => String(value || '').replace(/\s+/g, '').trim();
    const totalText = Math.max(1, compact(body.textContent).length);
    const visualShell = independentPrimaryVisualShell(details)?.element || null;
    const candidates = [];
    const nodes = [...body.querySelectorAll('main,article,section,figure,div')].slice(0, 260);
    for (const element of nodes) {
        if (!element?.isConnected || element.closest?.('[data-rabbit-mirror-tool-entry-host]'))
            continue;
        if (visualShell && (element === visualShell || visualShell.contains?.(element)))
            continue;
        let style, rect;
        try {
            style = getComputedStyle(element);
            rect = element.getBoundingClientRect();
        }
        catch {
            continue;
        }
        if (!style || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || 1) < .08)
            continue;
        const width = Math.max(0, Number(rect?.width || 0));
        const height = Math.max(0, Number(rect?.height || 0));
        if (width < 120 || height < 120)
            continue;
        const widthRatio = width / bodyWidth;
        const heightRatio = Math.min(1.4, height / bodyHeight);
        if (widthRatio < .42 || widthRatio > .93)
            continue;
        const textLength = compact(element.textContent).length;
        const textShare = Math.min(1, textLength / totalText);
        if (textLength < 140 || textShare < .42)
            continue;
        const background = parseExternalShellColor(style.backgroundColor);
        const hasBackground = !!(background && background.a >= .20) || (style.backgroundImage && style.backgroundImage !== 'none');
        if (!hasBackground)
            continue;
        let depth = 0, current = element;
        while (current && current !== body && depth < 12) {
            depth++;
            current = current.parentElement;
        }
        const score = textShare * 5 + widthRatio * 1.2 + heightRatio + (hasBackground ? 0.8 : 0) + Math.min(.8, depth * .08);
        candidates.push({ element, widthRatio, textShare, score });
    }
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0] || null;
}
function independentExternalCompactTarget(details) {
    if (!details?.querySelectorAll || typeof getComputedStyle !== 'function')
        return null;
    const body = [...(details.children || [])].find(node => !['SUMMARY', 'STYLE', 'SCRIPT', 'TEMPLATE', 'LINK', 'META'].includes(node?.tagName));
    if (!body?.isConnected)
        return null;
    let bodyRect;
    try {
        bodyRect = body.getBoundingClientRect();
    }
    catch {
        return null;
    }
    const bodyWidth = Math.max(1, Number(bodyRect?.width || 0));
    const bodyCenter = Number(bodyRect.left || 0) + bodyWidth / 2;
    const compact = value => String(value || '').replace(/\s+/g, '').trim();
    const totalText = Math.max(1, compact(body.textContent).length);
    const candidates = [];
    const seen = new Set();
    const scoreCandidate = (element, baseScore = 0) => {
        if (!element?.isConnected || element === body || seen.has(element) || element.closest?.('[data-rabbit-mirror-tool-entry-host]'))
            return;
        let style, rect;
        try {
            style = getComputedStyle(element);
            rect = element.getBoundingClientRect();
        }
        catch {
            return;
        }
        if (!style || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || 1) < .08)
            return;
        const width = Math.max(0, Number(rect?.width || 0));
        const height = Math.max(0, Number(rect?.height || 0));
        if (width < 180 || height < 140)
            return;
        const widthRatio = width / bodyWidth;
        if (widthRatio < .18 || widthRatio > .90)
            return;
        const centerOffset = Math.abs((Number(rect.left || 0) + width / 2) - bodyCenter) / Math.max(1, bodyWidth);
        if (centerOffset > .14)
            return;
        const textLength = compact(element.textContent).length;
        const textShare = Math.min(1, textLength / totalText);
        const signature = `${element.id || ''} ${element.className || ''} ${element.getAttribute?.('aria-label') || ''} ${element.getAttribute?.('style') || ''}`.toLowerCase();
        const semantic = __rmR("mqSk4y7fHX8W952nqzPdTfAtFNUaRA2cd11Jr8Hg0EsLl8p6diqsZPN6exOSqQXQlrn1lPFnVIwKEtHRQvPNrEjznwF8V9qTxIwGxgESxNR0HuO6mi6op5ptAO5gnyXjOkGIJGvzibiHAz0xVfWSx4DdH6Po2yDPnU04sEjRtDJZyi1KX6_P6E9vJJc30IKllqd5HQ0thEkyZolh6_FsLcttW.II_uVqsD3jCY1flQ281Iafo1CHRrQUeEQPpDoCbaoIDGXAz_FezQKSuwXpnhnutRMsc1dDBb_kd63O9xtbkYM7tZCs1CEff41wu0ikIeV.ndw4ESwlWEbVUJMyLSAxnwHaHgxgbHh3.amtmEH6yHi98WzFp0ImvyAYqzDdvlo3wwI6fNzqAqsksQjQSZ4BxCvuL6ZXy91EqrFGIgbKp1MXggHy7I2YbbUL._fWUP4fj.G3stHE719yQ05mx9lipBa6fRtpuhsRgcpzCLZSFX7Vth.Nh7Hfv9H.iVmdxTSyTEunyIJ8DtvF_qikEUa81gRvrhIlbPmStM8l0Fbt7cRssoNrqCEL8b4YulEMTcmtLW1YnIPnVxj3Ph4ziL3YwGD4J5hb8LOj4vsuGMH7692tslLvT2gfvEBjS7g50RDqDSwahhPBdhM0Ce8", "i").test(signature);
        const background = parseExternalShellColor(style.backgroundColor);
        const hasBackground = !!(background && background.a >= .16) || (style.backgroundImage && style.backgroundImage !== 'none');
        const borderWidth = Math.max(...String(style.borderWidth || '0').split(/\s+/).map(value => parseFloat(value) || 0), 0);
        const borderRadius = Math.max(...String(style.borderRadius || '0').split(/[\s\/]+/).map(value => parseFloat(value) || 0), 0);
        const hasFrame = borderWidth >= 1 || borderRadius >= 12 || (style.boxShadow && style.boxShadow !== 'none');
        const inlineStyle = String(element.getAttribute?.('style') || '').toLowerCase();
        const explicitWidth = /(?:^|;)\s*(?:width|max-width|min-width)\s*:/.test(inlineStyle)
            || (String(style.width || '').trim() && String(style.width || '').trim() !== 'auto' && Math.abs(width - bodyWidth) > 24)
            || (String(style.maxWidth || '').trim() && String(style.maxWidth || '').trim() !== 'none');
        if (!semantic && !hasBackground && !hasFrame && !explicitWidth)
            return;
        if (textLength < 60 && !semantic && !hasFrame)
            return;
        const portraitBonus = height >= width * 1.04 ? .6 : 0;
        const narrowBonus = Math.max(0, (.92 - widthRatio) * 3.6);
        const textBonus = Math.min(2.2, textShare * 2.6);
        const score = baseScore + narrowBonus + textBonus + (semantic ? 1.8 : 0) + (hasBackground ? 1.0 : 0) + (hasFrame ? 1.0 : 0) + (explicitWidth ? 1.4 : 0) + portraitBonus - centerOffset * 4;
        seen.add(element);
        candidates.push({ element, width, height, widthRatio, textShare, score });
    };
    const visual = independentPrimaryVisualShell(details);
    if (visual?.element)
        scoreCandidate(visual.element, 6.2);
    const carrier = independentPrimaryContentCarrier(details);
    if (carrier?.element)
        scoreCandidate(carrier.element, 4.8);
    for (const element of [...(body.children || [])])
        scoreCandidate(element, 3.6);
    for (const element of [...body.querySelectorAll('main,article,section,figure,div')].slice(0, 240))
        scoreCandidate(element, 0);
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0] || null;
}
export function clearIndependentExternalCompactShellWidth(host) {
    if (!host?.style)
        return;
    host.removeAttribute('data-rm-independent-external-compact-shell');
    host.style.removeProperty('--rm-external-compact-width');
}
function independentExternalVisibleFace(host) {
    const faces = externalFaceDetails(host);
    if (faces.length > 1) {
        const index = Math.max(0, Math.min(faces.length - 1, Number(host?.dataset?.rmFaceView) || 0));
        return faces.find(face => face.getAttribute?.('data-rm-face-current') === 'true') || faces[index] || null;
    }
    return host?.querySelector?.(':scope > details[data-rabbit-mirror-external-details="true"], :scope > details') || null;
}
function refreshIndependentExternalFaceFit(host) {
    if (!host?.isConnected || host.dataset.rmSource !== 'independent' || host.dataset.rmState !== 'ready' || host.dataset.rmPlacement !== 'external')
        return;
    if (host.__rabbitMirrorFaceFitFrame)
        globalThis.cancelAnimationFrame?.(host.__rabbitMirrorFaceFitFrame);
    const run = () => {
        host.__rabbitMirrorFaceFitFrame = 0;
        if (!host.isConnected || host.dataset.rmState !== 'ready')
            return;
        delete host.dataset.rmIndependentExternalCompactShell;
        clearIndependentExternalCompactShellWidth(host);
        releaseExternalFlowHeight(host);
        neutralizeIndependentExternalWideStage(host);
        try {
            carryExternalFaceFrames(host);
        }
        catch { }
        compactIndependentExternalShellToPrimaryVisual(host);
    };
    if (typeof requestAnimationFrame === 'function')
        host.__rabbitMirrorFaceFitFrame = requestAnimationFrame(run);
    else
        setTimeout(run, 0);
}
function compactIndependentExternalShellToPrimaryVisual(host) {
    if (!host?.isConnected || host.dataset.rmSource !== 'independent' || host.dataset.rmState !== 'ready' || host.dataset.rmPlacement !== 'external')
        return false;
    if (desktopFaceZoomActive(host.ownerDocument))
        return false;
    const viewportWidth = independentExternalEffectiveViewportWidth();
    if (viewportWidth > 0 && viewportWidth < 900)
        return false;
    const details = independentExternalVisibleFace(host);
    const summary = details?.querySelector?.(':scope > summary');
    if (!details || !summary || typeof getComputedStyle !== 'function')
        return false;
    const body = [...(details.children || [])].find(node => !['SUMMARY', 'STYLE', 'SCRIPT', 'TEMPLATE', 'LINK', 'META'].includes(node?.tagName));
    if (!body?.isConnected)
        return false;
    let bodyRect, hostRect, summaryRect;
    const summaryInlineWidth = summary.style.getPropertyValue('width'), summaryInlinePriority = summary.style.getPropertyPriority('width');
    try {
        bodyRect = body.getBoundingClientRect();
        hostRect = host.getBoundingClientRect();
        summary.style.setProperty('width', 'fit-content', 'important');
        summaryRect = summary.getBoundingClientRect();
    }
    catch {
        return false;
    }
    finally {
        if (summaryInlineWidth)
            summary.style.setProperty('width', summaryInlineWidth, summaryInlinePriority);
        else
            summary.style.removeProperty('width');
    }
    const bodyWidth = Math.max(0, Number(bodyRect?.width || 0));
    const hostWidth = Math.max(0, Number(hostRect?.width || 0));
    if (bodyWidth < 260 || hostWidth < 320 || bodyWidth > hostWidth + 2)
        return false;
    const target = independentExternalCompactTarget(details);
    if (!target?.element)
        return false;
    const targetWidth = Math.max(0, Number(target.width || 0));
    const targetHeight = Math.max(0, Number(target.height || 0));
    if (targetWidth < 180 || targetHeight < 140)
        return false;
    const summaryWidth = Math.max(0, Number(summaryRect?.width || 0));
    const laneWidth = Math.max(0, Number(hostWidth || 0));
    let compactWidth = Math.max(targetWidth, summaryWidth);
    compactWidth = Math.min(compactWidth, laneWidth);
    if (!Number.isFinite(compactWidth) || compactWidth < 220)
        return false;
    if (compactWidth >= laneWidth - 8)
        return false;
    host.style.setProperty('--rm-external-compact-width', `${Math.round(compactWidth * 10) / 10}px`);
    host.setAttribute('data-rm-independent-external-compact-shell', 'true');
    host.dataset.rmIndependentExternalCompactShell = 'primary-visual';
    return true;
}
function neutralizeIndependentExternalWideStage(host) {
    if (!host?.isConnected || host.dataset.rmSource !== 'independent' || host.dataset.rmState !== 'ready' || host.dataset.rmPlacement !== 'external')
        return false;
    const viewportWidth = independentExternalEffectiveViewportWidth();
    if (viewportWidth > 0 && viewportWidth < 900)
        return false;
    const details = independentExternalVisibleFace(host);
    if (!details || typeof getComputedStyle !== 'function')
        return false;
    const body = [...(details.children || [])].find(node => !['SUMMARY', 'STYLE', 'SCRIPT', 'TEMPLATE', 'LINK', 'META'].includes(node?.tagName));
    if (!body?.isConnected)
        return false;
    let bodyStyle, bodyRect;
    try {
        bodyStyle = getComputedStyle(body);
        bodyRect = body.getBoundingClientRect();
    }
    catch {
        return false;
    }
    const bodyWidth = Math.max(0, Number(bodyRect?.width || 0));
    const bodyHeight = Math.max(0, Number(bodyRect?.height || 0));
    if (bodyWidth < 760 || bodyHeight < 260)
        return false;
    const stageColor = parseExternalShellColor(bodyStyle?.backgroundColor);
    if (!stageColor || stageColor.a < .16)
        return false;
    if (bodyStyle?.backgroundImage && bodyStyle.backgroundImage !== 'none')
        return false;
    const compact = value => String(value || '').replace(/\s+/g, '').trim();
    const totalText = Math.max(1, compact(body.textContent).length);
    const bodyCenter = Number(bodyRect.left || 0) + bodyWidth / 2;
    const candidates = [];
    const nodes = [...body.querySelectorAll('main,article,section,figure,div')].slice(0, 320);
    for (const element of nodes) {
        if (!element?.isConnected || element.closest?.('[data-rabbit-mirror-tool-entry-host]'))
            continue;
        let style, rect;
        try {
            style = getComputedStyle(element);
            rect = element.getBoundingClientRect();
        }
        catch {
            continue;
        }
        if (!style || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || 1) < .08)
            continue;
        const width = Math.max(0, Number(rect?.width || 0));
        const height = Math.max(0, Number(rect?.height || 0));
        if (width < 220 || height < 240)
            continue;
        const widthRatio = width / bodyWidth;
        if (widthRatio < .12 || widthRatio > .72)
            continue;
        const centerOffset = Math.abs((Number(rect.left || 0) + width / 2) - bodyCenter) / Math.max(1, bodyWidth);
        if (centerOffset > .13)
            continue;
        const textLength = compact(element.textContent).length;
        const textShare = Math.min(1, textLength / totalText);
        if (textLength < 120 || textShare < .68)
            continue;
        const background = parseExternalShellColor(style.backgroundColor);
        const hasBackground = !!(background && background.a >= .16) || (style.backgroundImage && style.backgroundImage !== 'none');
        const borderWidth = Math.max(...String(style.borderWidth || '0').split(/\s+/).map(value => parseFloat(value) || 0), 0);
        const shadow = String(style.boxShadow || 'none');
        const signature = `${element.id || ''} ${element.className || ''} ${element.getAttribute?.('aria-label') || ''}`.toLowerCase();
        const semantic = __rmR("WioXAES6r1QjlOUGClm98zQGEDrnqFljROuqQdztfwIwTErMg2pXeCLZjmX0ybBG27v4TYXcypifFQ6771P3CceCBATrWOklD4XQ7_tR2Zjon0j1Xz1TXAkASHWgDoim3c3Tm7mZMea.Ztkm9aDwoUqT0.p7U1D8vdhGlB2eXdaKmnZ8NFRG7cMlvf3B5ib7UBFBzkV7X0bmEN8NHQ2Nh_pFH5D_Ok3jYGoSauxbhkFJnvSHwfRga1soN8BX_EzcKgRkLE26wz0I_U7ks6yajTAnmVqae.RrXPKGznaJkDweim0H.v56OpSxOmAE5KrPec4A0vrUcK3rFmTu5Ph2Qiqn1rhJLR1cGyyNPTItxge53v2bHSpk6B4aNSmbtvMXel5ocUMkPVe_JMUcmQsf.2eE7W30FtywLy7Lx65._nf0F88qAW.9fFBkOvSZ4nxe", "i").test(signature);
        const framed = hasBackground && (borderWidth >= 1 || (shadow && shadow !== 'none'));
        if (!semantic && !framed)
            continue;
        const portraitBonus = height >= width * 1.08 ? 1.2 : 0;
        const score = textShare * 6 + (1 - widthRatio) * 2.2 + portraitBonus + (semantic ? 1.8 : 0) + (framed ? 1.1 : 0) - centerOffset * 4;
        candidates.push({ element, score, widthRatio, textShare });
    }
    candidates.sort((a, b) => b.score - a.score);
    const object = candidates[0];
    if (!object?.element)
        return false;
    captureIndependentContentWidthBaseline(body);
    body.style.setProperty('background', 'transparent', 'important');
    body.style.setProperty('background-color', 'transparent', 'important');
    body.style.setProperty('background-image', 'none', 'important');
    body.setAttribute(INDEPENDENT_EXTERNAL_STAGE_NEUTRALIZED_ATTR, 'true');
    host.dataset.rmIndependentExternalStageNeutralized = 'solid-wide-stage';
    return true;
}
function rescueIndependentExternalContentWidth(host) {
    if (!host?.isConnected || host.dataset.rmSource !== 'independent' || host.dataset.rmState !== 'ready' || host.dataset.rmPlacement !== 'external')
        return false;
    const details = host.querySelector?.(':scope > details[data-rabbit-mirror-external-details="true"], :scope > details');
    if (!details)
        return false;
    const carrier = independentPrimaryContentCarrier(details);
    if (!carrier?.element || carrier.widthRatio >= .84)
        return false;
    let hostWidth = 0;
    try {
        hostWidth = Number(host.getBoundingClientRect?.().width || 0);
    }
    catch { }
    if (hostWidth > 0 && hostWidth > 900)
        return false;
    const element = carrier.element;
    captureIndependentContentWidthBaseline(element);
    element.style.setProperty('width', 'calc(100% - 10px)', 'important');
    element.style.setProperty('max-width', 'none', 'important');
    element.style.setProperty('min-width', '0', 'important');
    element.style.setProperty('margin-left', 'auto', 'important');
    element.style.setProperty('margin-right', 'auto', 'important');
    element.style.setProperty('box-sizing', 'border-box', 'important');
    element.setAttribute(INDEPENDENT_CONTENT_WIDTH_RESCUE_ATTR, 'true');
    host.dataset.rmIndependentContentWidthRescue = 'true';
    return true;
}
function rescueIndependentExternalVisualShell(host) {
    if (!host?.isConnected || host.dataset.rmSource !== 'independent' || host.dataset.rmState !== 'ready' || host.dataset.rmPlacement !== 'external')
        return false;
    const details = host.querySelector?.(':scope > details[data-rabbit-mirror-external-details="true"], :scope > details');
    if (!details)
        return false;
    const visual = independentPrimaryVisualShell(details);
    if (!visual?.element || !visual.objectLike)
        return false;
    const naturalWidth = Math.max(1, Number(visual.width || visual.element.getBoundingClientRect?.().width || 0));
    const naturalHeight = Math.max(1, Number(visual.height || visual.element.getBoundingClientRect?.().height || 0));
    if (naturalWidth <= 0 || naturalHeight <= 0)
        return false;
    const portrait = naturalHeight >= naturalWidth * 1.08;
    const widthRule = portrait
        ? 'clamp(320px, 78%, 460px)'
        : 'clamp(320px, 86%, 620px)';
    const element = visual.element;
    captureIndependentContentWidthBaseline(element);
    element.style.setProperty('width', widthRule, 'important');
    element.style.setProperty('max-width', 'calc(100% - 12px)', 'important');
    element.style.setProperty('min-width', '0', 'important');
    element.style.setProperty('margin-left', 'auto', 'important');
    element.style.setProperty('margin-right', 'auto', 'important');
    element.style.setProperty('box-sizing', 'border-box', 'important');
    const inlineStyle = String(element.getAttribute?.('style') || '').toLowerCase();
    if (/(?:^|;)\s*height\s*:/.test(inlineStyle)) {
        element.style.setProperty('height', 'auto', 'important');
        element.style.setProperty('aspect-ratio', `${Math.round(naturalWidth)} / ${Math.round(naturalHeight)}`, 'important');
    }
    element.setAttribute(INDEPENDENT_CONTENT_WIDTH_RESCUE_ATTR, 'true');
    host.dataset.rmIndependentVisualShellRescue = 'adaptive-clamp';
    return true;
}
export function scheduleIndependentReadyPostprocess(host, key = '', html = '') {
    if (!host || host.dataset.rmSource !== 'independent' || host.dataset.rmState !== 'ready')
        return false;
    if (historicalLightHost(host)) {
        host.dataset.rmIndependentPostprocessDeferred = 'history-open';
        return false;
    }
    delete host.dataset.rmIndependentPostprocessDeferred;
    const source = String(html || host.__rabbitMirrorIndependentSource || '');
    const signature = `${String(host.dataset.rmPlacement || 'external')}|${String(key || host.dataset.rmKey || '')}|${source.length}:${hashText(source)}`;
    const placementDirty = host.__rabbitMirrorIndependentPlacementDirty === true;
    const scheduled = !!(host.__rabbitMirrorIndependentPostFrame || host.__rabbitMirrorIndependentPostTimer);
    if (!placementDirty && host.dataset.rmIndependentPostprocessSignature === signature && !scheduled)
        return false;
    if (scheduled && host.__rabbitMirrorIndependentPostPendingSignature === signature)
        return false;
    if (host.__rabbitMirrorIndependentPostFrame)
        globalThis.cancelAnimationFrame?.(host.__rabbitMirrorIndependentPostFrame);
    if (host.__rabbitMirrorIndependentPostTimer)
        clearTimeout(host.__rabbitMirrorIndependentPostTimer);
    host.__rabbitMirrorIndependentPostPendingSignature = signature;
    const run = () => {
        host.__rabbitMirrorIndependentPostTimer = 0;
        if (!host.isConnected || host.dataset.rmState !== 'ready')
            return;
        if (host.__rabbitMirrorIndependentPostPendingSignature !== signature)
            return;
        host.__rabbitMirrorIndependentPostPendingSignature = '';
        if (host.dataset.rmPlacement === 'external') {
            delete host.dataset.rmIndependentContentWidthRescue;
            delete host.dataset.rmIndependentVisualShellRescue;
            delete host.dataset.rmIndependentExternalStageNeutralized;
            delete host.dataset.rmIndependentExternalCompactShell;
            clearIndependentExternalCompactShellWidth(host);
            releaseExternalFlowHeight(host);
            neutralizeIndependentExternalWideStage(host);
            try {
                carryExternalFaceFrames(host);
            }
            catch { }
            compactIndependentExternalShellToPrimaryVisual(host);
        }
        scheduleExternalShellTint(host, source);
        host.dataset.rmIndependentPostprocessSignature = signature;
        host.__rabbitMirrorIndependentPlacementDirty = false;
    };
    if (typeof requestAnimationFrame === 'function') {
        host.__rabbitMirrorIndependentPostFrame = requestAnimationFrame(() => {
            host.__rabbitMirrorIndependentPostFrame = 0;
            host.__rabbitMirrorIndependentPostTimer = setTimeout(run, 80);
        });
    }
    else
        host.__rabbitMirrorIndependentPostTimer = setTimeout(run, 80);
    return true;
}
export function ensureExternalUi(el, key, html, state = 'ready', source = 'independent', sourceHash = '', savedRecord = null) {
    const end = beginHostWorkTiming('independent.ensureExternalUi');
    try {
        const host = ensureExternalUiCore(el, key, html, state, source, sourceHash, savedRecord);
        if (host && state === 'ready' && source === 'independent')
            attachIndependentUnsavedNotices(host, key, savedRecord);
        if (host)
            dropGenerationProgressUnlessLoading(host);
        return host;
    }
    finally {
        end?.();
    }
}
const reportedMountFailures = new Set();
function reportIndependentMountFailure(key, html, kept) {
    const id = `${key}:${hashText(String(html || ''))}`;
    if (reportedMountFailures.has(id))
        return;
    reportedMountFailures.add(id);
    if (reportedMountFailures.size > 128)
        reportedMountFailures.delete(reportedMountFailures.values().next().value);
    globalThis.toastr?.error?.(kept ? __rmT("8U0fQ8P00yCtdtVxOPN0FJfNpZrcide9SXcLiXPQMkUoEdt1NnDFLca.bPYWmUSh8ZKRewKjY3Y") : __rmT("9o8PRoChDjAbNVjkRHuBqMHTrtruYbKKNDVDPmHRI0Ji4AVZC1BkI4NWD.Wbq6CWaoFY3h"));
}
function ensureExternalUiCore(el, key, html, state = 'ready', source = 'independent', sourceHash = '', savedRecord = null) {
    const body = externalInsertTarget(el);
    if (!body)
        return null;
    let locallyPrepared = false;
    if (state === 'ready' && source === 'independent' && savedRecord?.html === html) {
        const prepared = prepareStoredIndependentRecordHtml(savedRecord, key);
        if (!prepared) {
            const kept = matchingExternalHosts(el, key, source).find(node => (!sourceHash || node.dataset.rmSourceHash === String(sourceHash))
                && externalFaceDetails(node).length && externalFaceDetails(node).every(usableReadyDetails));
            reportIndependentMountFailure(key, html, !!kept);
            if (kept) {
                kept.dataset.rmState = 'ready';
                ensureExternalTools(kept);
                return kept;
            }
            return null;
        }
        html = prepared;
        locallyPrepared = true;
    }
    const reconciled = collapseDuplicateIdentityHosts(el, key, source, sourceHash);
    const same = matchingExternalHosts(el, key, source);
    let host = same[0] || reconciled || externalHosts(el).find(node => node.dataset.rmSource === source) || null;
    if (!host) {
        const escaped = [...(el.querySelectorAll?.('details[data-rabbit-mirror-external-details="true"]') || [])].find(details => details.dataset.rabbitMirrorExternalSource === String(source || 'independent')
            && (!details.dataset.rabbitMirrorExternalOwner || details.dataset.rabbitMirrorExternalOwner === String(key || '')));
        host = document.createElement('div');
        host.setAttribute(SOURCE_ATTR, 'true');
        host.setAttribute(EXTERNAL_SHELL_ATTR, 'true');
        host.className = 'rabbit-mirror-external-host rabbit-mirror-external-shell';
        host.dataset.rmKey = key;
        host.dataset.rmSource = source;
        host.dataset.rmState = state;
        if (state !== 'loading')
            delete host.dataset.rmReplyGenerationPlaceholder;
        if (sourceHash)
            host.dataset.rmSourceHash = String(sourceHash);
        if (escaped && !hasMultifaceMarkup(html)) {
            markExternalDetails(escaped, key, source);
            host.append(escaped);
        }
        else
            host = buildExternalHost(key, html, state, source, locallyPrepared);
        host.__rabbitMirrorIndependentSource = host.dataset.rmState === 'ready' ? String(html || '') : '';
        if (sourceHash)
            host.dataset.rmSourceHash = String(sourceHash);
        stampExternalDetailsOwnership(host);
        if (state === 'ready')
            markMountedFaceProofs(host, source, savedRecord?.apiRequest);
        markHistoricalLightHostForRestore(host);
        placeExternalHost(el, host, key, source);
        removeDuplicateExternalHosts(el, host, source);
        if (state === 'ready')
            scheduleExternalShellTint(host, html);
        ensureExternalTools(host);
        if (state === 'ready' && source === 'independent')
            scheduleIndependentReadyPostprocess(host, key, html);
        return host;
    }
    const sameOwner = host.dataset.rmKey === String(key) && host.dataset.rmSource === source
        && (!sourceHash || host.dataset.rmSourceHash === String(sourceHash));
    host.dataset.rmKey = key;
    host.dataset.rmSource = source;
    host.dataset.rmState = state;
    if (state !== 'loading')
        delete host.dataset.rmReplyGenerationPlaceholder;
    if (sourceHash)
        host.dataset.rmSourceHash = String(sourceHash);
    stampExternalDetailsOwnership(host);
    if (state === 'ready')
        markMountedFaceProofs(host, source, savedRecord?.apiRequest);
    placeExternalHost(el, host, key, source);
    removeDuplicateExternalHosts(el, host, source);
    let current = repatriateExternalDetails(el, host, key, source);
    if (!current)
        current = recoverEscapedExternalDetails(el, host, key, source);
    const wasOpen = !!current?.hasAttribute?.('open');
    const currentFaces = externalFaceDetails(host);
    const currentReady = currentFaces.length && currentFaces.every(usableReadyDetails) ? currentFaces[0] : null;
    if (state === 'ready') {
        clearExternalHostFreshSourceState(host);
        if (currentReady && independentMaintenanceLiveRepairLocked(host)) {
            if (wasOpen)
                currentReady.setAttribute('open', '');
            ensureExternalTools(host);
            return host;
        }
        const expectedFaces = hasMultifaceMarkup(html) ? parseMultifaceOutput(html, { storedDisplay: locallyPrepared }) : null;
        const liveFaces = externalFaceDetails(host);
        const faceCountMatches = expectedFaces
            ? (expectedFaces.ok && liveFaces.length === expectedFaces.faces.length)
            : liveFaces.length === 1;
        const sameReadySource = currentReady && faceCountMatches && host.dataset.rmState === 'ready' && String(host.__rabbitMirrorIndependentSource || '') === String(html || '');
        if (sameReadySource) {
            if (wasOpen)
                currentReady.setAttribute('open', '');
            scheduleExternalShellTint(host, html);
            ensureExternalTools(host);
            if (source === 'independent')
                scheduleIndependentReadyPostprocess(host, key, html);
            return host;
        }
        if (expectedFaces) {
            if (!mountExternalFaceDetails(host, key, source, html, { wasOpen, locallyPrepared })) {
                const kept = !!(sameOwner && currentReady);
                host.dataset.rmState = kept ? 'ready' : 'error';
                reportIndependentMountFailure(key, html, kept);
                if (kept)
                    ensureExternalTools(host);
                else {
                    const details = host.querySelector?.(':scope > details');
                    const message = __rmT("UPJGb9RMaOYcdWPQQn.qEJRy2iQ.5KmivSpdrJBXvEMvG_VvXwU.o.fmYXcCAlj5g4JO1VCBBqDfp0S_yip3MkMoFjnezvVwwgD3C_cSEVw7HaSLTgSnRJ0GoferclzEr6A");
                    try {
                        if (details?.classList?.contains?.('rabbit-mirror-external-placeholder')) {
                            setPlaceholderSummary(details, __rmT("tQhzk2eJVB_cWeSyVEptnaq30g1erk"));
                            renderExternalErrorBody(details, message);
                        }
                        else if (!externalFaceDetails(host).some(usableReadyDetails))
                            host.replaceChildren(fallbackExternalDetails('error', message));
                    }
                    catch { }
                }
                return host;
            }
            host.__rabbitMirrorIndependentSource = String(html || '');
            markHistoricalLightHostForRestore(host);
            ensureExternalTools(host);
            if (source === 'independent')
                scheduleIndependentReadyPostprocess(host, key, html);
            return host;
        }
        if (liveFaces.length > 1 && liveFaces.every(usableReadyDetails)) {
            const incoming = extractReadyDetails(html, locallyPrepared);
            const liveSummary = String(liveFaces[0]?.querySelector?.(':scope > summary')?.textContent || '').replace(/\s+/g, ' ').trim();
            const incomingSummary = String(incoming?.querySelector?.(':scope > summary')?.textContent || '').replace(/\s+/g, ' ').trim();
            if (incoming && liveSummary && liveSummary === incomingSummary) {
                const serialized = serializeExternalFaceDetails(host);
                host.__rabbitMirrorIndependentSource = serialized;
                showMultifaceFace(host, host.dataset.rmFaceView);
                if (wasOpen)
                    liveFaces[0].setAttribute('open', '');
                markHistoricalLightHostForRestore(host);
                ensureExternalTools(host);
                if (source === 'independent')
                    scheduleIndependentReadyPostprocess(host, key, serialized);
                return host;
            }
        }
        const nextDetails = extractReadyDetails(html, locallyPrepared);
        if (!usableReadyDetails(nextDetails)) {
            if (sameOwner && currentReady) {
                host.dataset.rmState = 'ready';
                reportIndependentMountFailure(key, html, true);
                ensureExternalTools(host);
                return host;
            }
            host.dataset.rmState = 'error';
            placeExternalHost(el, host, key, source);
            const fallback = current || fallbackExternalDetails('error', '');
            if (!current)
                host.append(fallback);
            setPlaceholderSummary(fallback, __rmT("09gvSQK4tcay35YeX4okWtC529s"));
            renderExternalErrorBody(fallback, __rmT("J3LdPZXXsEXvYlfBCsRJipiNrkp_Y0ll7XwMLg5axgoQBMOuBLCaojOrK.FG5gS9DLRxnA50i0iPKY7i5j0KqVHOS_Bcxf"));
            ensureExternalTools(host);
            return host;
        }
        host.__rabbitMirrorIndependentSource = String(html || '');
        if (liveFaces.length > 1) {
            for (const other of externalFaceDetails(host).slice(1))
                other.remove();
            delete host.dataset.rmFaceCount;
            host.classList.remove('rabbit-mirror-multiface-host');
        }
        nextDetails.removeAttribute('open');
        markExternalDetails(nextDetails, key, source);
        if (current)
            transferExternalTools(current, nextDetails);
        if (current?.isConnected)
            current.replaceWith(nextDetails);
        else
            host.append(nextDetails);
        if (wasOpen)
            nextDetails.setAttribute('open', '');
        markHistoricalLightHostForRestore(host);
        scheduleExternalShellTint(host, html);
        ensureExternalTools(host);
        if (source === 'independent')
            scheduleIndependentReadyPostprocess(host, key, html);
        return host;
    }
    if (sameOwner && (state === 'loading' || state === 'error') && (currentReady || currentFaces.some(usableReadyDetails))) {
        host.dataset.rmState = 'ready';
        if (state === 'loading')
            showIndependentResayStatus(host, __rmR("GAHaAHEDYUp", "").test(String(html || '')) ? String(html) : '');
        else
            clearIndependentResayStatus(host);
        ensureExternalTools(host);
        return host;
    }
    if (!sameOwner) {
        host.replaceChildren();
        current = null;
        delete host.dataset.rmFaceCount;
        delete host.dataset.rmFaceView;
        host.classList.remove('rabbit-mirror-multiface-host');
        host.__rabbitMirrorIndependentInitialSource = '';
        clearIndependentResayStatus(host);
    }
    host.__rabbitMirrorIndependentSource = '';
    let details = current;
    if (details && !details.classList?.contains('rabbit-mirror-external-placeholder')) {
        const placeholder = fallbackExternalDetails(state, html);
        transferExternalTools(details, placeholder);
        details.replaceWith(placeholder);
        details = placeholder;
    }
    if (!details) {
        details = fallbackExternalDetails(state, html);
        host.append(details);
    }
    markExternalDetails(details, key, source);
    setPlaceholderSummary(details, externalPlaceholderTitle(state, html));
    let bodyNode = details.querySelector(':scope > .rabbit-mirror-external-placeholder-body');
    if (state === 'error')
        renderExternalErrorBody(details, html);
    else if (html) {
        if (!bodyNode) {
            bodyNode = document.createElement('div');
            bodyNode.className = 'rabbit-mirror-external-placeholder-body';
            details.append(bodyNode);
        }
        bodyNode.textContent = html;
    }
    else
        bodyNode?.remove?.();
    if (state !== 'loading')
        clearIndependentResayStatus(host);
    ensureExternalTools(host);
    return host;
}
export function generationPollKey(index) { return `${chatKey(getContext())}:${Number(index)}`; }
export function generationWaitPollDelay(startedAt = 0) {
    const elapsed = Math.max(0, Date.now() - Number(startedAt || 0));
    if (elapsed < 12000)
        return GENERATION_PLACEHOLDER_POLL_INTERVAL_MS;
    if (elapsed < 60000)
        return 1600;
    return 3200;
}
export function hasGenerationWorkFor(index, slot = '', sourceHash = '') {
    if (blockingAutomaticFailureStopFor(slot, sourceHash))
        return true;
    const live = currentGenerationIdentity(index);
    if (live && automaticDispatchAlreadyConsumed(live.baseSlot))
        return true;
    if (generationPolls.has(generationPollKey(index)))
        return true;
    const active = pending.get(String(slot || ''));
    if (active && String(active.sourceHash || '') === String(sourceHash || ''))
        return true;
    return globalFlights().has(flightIdentity(slot, sourceHash));
}
function renderGenerationGateTimeout(index, reason = 'generation-active') {
    const host = ensureGenerationPlaceholderForIndex(index, false);
    if (!host)
        return;
    host.dataset.rmState = 'error';
    delete host.dataset.rmReplyGenerationPlaceholder;
    const details = host.querySelector?.(':scope > details');
    if (!details)
        return;
    const stabilityTimeout = reason === 'source-stability';
    const identityMissing = reason === 'identity-missing';
    setPlaceholderSummary(details, identityMissing ? __rmT("4Fyd1..4q0dPanKB5hnejoXsScfw71dyihzwpf") : (stabilityTimeout ? __rmT("4Fyd1..4q0dPa33tf05DeVSgMq18nZQefnvwpf") : __rmT("4Fyd1..4q0dPa33tf05DeVSgzqYK_ZQefnvwpf")));
    renderExternalErrorBody(details, identityMissing
        ? __rmT("NtVTJVRUCxnvYRXqztpHME4eU_TQZpqqjD1OrdyRZbjS3jAfNQBI2GTExBp7SvHksz30E35_rNmBA_O9QN.RRIDCxZ2RtLGjeePlwABJdprTbR.RQAoJfj9uB2ymZOYtfYY8vBieBzumy8ej0pevGdn94nbkWOjnp914ykniD1G") : (stabilityTimeout
        ? __rmT("QmauTP.v1v5VBk3VxxQHKGh2E.yYob0AFcrf1cJD5b35bmB6mDJaBSYRc6_adNaH4cC61a57De1BA_O9QN.RRIDCxZ2RtLGjeePlwABJdprHEAJX627RGZy9WPoKoOkphAYovGCXh8Hmy8ej0pevGdn94nbkWOjnp914ykniD1G") : __rmT("L6KjFXZfGSTCLqsBt6BuBzfLmhCaGCcJmHW0Xgps9TPf68fSmhuu92I_ZxtShyKNXkuGbL80.uqKumV6NLwQK63v_KXuZecWWm97nKKg05kDjlg9GpOFOD7GVHTzcfne8c1G6PWW8FUxPimYcC3dWimgbA6elsqa5ZnNiJDgblp.DNgecqIZFTze666Beh")));
    ensureExternalTools(host);
}
export function exactIndependentReadyForIdentity(index, live = currentGenerationIdentity(index)) {
    if (!live)
        return null;
    const el = messageElement(Number(index));
    const mounted = el ? externalHosts(el).find(host => host?.dataset?.rmSource === 'independent'
        && mountedIndependentReadyHostMatchesObserved(host, live.ctx, index, live.msg, live, live.key)) : null;
    if (mounted)
        return { kind: 'mounted', host: mounted, record: null };
    const persisted = persistedOwnerForMessage(live.ctx, index, live.msg);
    if (persisted?.html && independentStoredHtmlRestorable(persisted.html) && savedRecordMatchesObserved(persisted, live)) {
        return { kind: 'persisted', host: null, record: persisted };
    }
    const store = readStore();
    const lock = ownerLockForBase(live.baseSlot);
    const keys = [String(lock?.slot || ''), String(live.slot || ''), ...(Array.isArray(live.legacySlots) ? live.legacySlots.map(String) : [])].filter(Boolean);
    for (const key of new Set(keys)) {
        const record = store?.[key];
        if (record?.html && independentStoredHtmlRestorable(record.html) && savedRecordMatchesObserved(record, live)) {
            return { kind: 'store', host: null, record };
        }
    }
    return null;
}
function restoreExactIndependentReadyForIdentity(index, live, result) {
    if (!live || !result)
        return null;
    const el = messageElement(Number(index));
    if (result.host?.isConnected) {
        placeExternalHost(el, result.host, result.host.dataset?.rmKey || live.key, 'independent');
        result.host.hidden = false;
        clearExternalHostFreshSourceState(result.host);
        refreshExistingExternalDetails(result.host, result.host.dataset?.rmKey || live.key, 'independent');
        return result.host;
    }
    if (!el || !result.record?.html)
        return null;
    const host = ensureExternalUi(el, live.key, result.record.html, 'ready', 'independent', live.sourceHash, result.record);
    if (host) {
        rebuildCollapsedReadyHost(el, host, live.key, 'independent', result.record.html, live.sourceHash, result.record);
        host.hidden = false;
        clearExternalHostFreshSourceState(host);
    }
    return host;
}
function exactIndependentErrorForIdentity(index, live = currentGenerationIdentity(index)) {
    if (!live)
        return null;
    const el = messageElement(Number(index));
    if (!el)
        return null;
    return externalHosts(el).find(host => mountedIndependentErrorHostMatchesObserved(host, live.ctx, index, live.msg, live, live.key)) || null;
}
function restoreExactIndependentErrorForIdentity(index, live, host) {
    if (!live || !host?.isConnected)
        return null;
    const el = messageElement(Number(index));
    if (!el)
        return null;
    placeExternalHost(el, host, host.dataset?.rmKey || live.key, 'independent');
    host.dataset.rmState = 'error';
    host.hidden = false;
    clearExternalHostFreshSourceState(host);
    ensureExternalTools(host);
    return host;
}
export function renderAutomaticFailureStop(index, live, failure) {
    if (!live || !failure)
        return null;
    const existing = exactIndependentErrorForIdentity(index, live);
    if (existing)
        return restoreExactIndependentErrorForIdentity(index, live, existing);
    const el = messageElement(Number(index));
    if (!el)
        return null;
    const message = String(failure.message || failure.reason || __rmT("uqbkiAlQ6tebGJdjmZyH7ZYJ.Yqhr7s2"));
    return ensureExternalUi(el, live.key, message, 'error', 'independent', live.sourceHash);
}
function renderAutomaticDispatchConsumed(index, sourceHash = '') {
    const live = currentGenerationIdentity(index);
    if (!live)
        return null;
    const ready = exactIndependentReadyForIdentity(index, live);
    if (ready) {
        clearAutomaticFailureStop(live.slot, live.sourceHash);
        return restoreExactIndependentReadyForIdentity(index, live, ready) || ready.host || null;
    }
    const preciseFailure = automaticFailureStopFor(live.slot, sourceHash || live.sourceHash);
    if (preciseFailure)
        return renderAutomaticFailureStop(index, live, preciseFailure);
    const exactError = exactIndependentErrorForIdentity(index, live);
    if (exactError)
        return restoreExactIndependentErrorForIdentity(index, live, exactError);
    const el = messageElement(index);
    if (!el)
        return null;
    const previousHost = externalHosts(el).find(host => host?.dataset?.rmSource === 'independent') || null;
    const sourceReplaced = hasExplicitSourceReplacementEvidence(live.ctx, index, live.msg, previousHost);
    const message = sourceReplaced
        ? __rmT("bsCD89sSDy8PQfvduwVKoP_G2qfgyzWaIOKO0j7VyuK9FA1qxuDUqaItjePoD.wcwfQl_4E2tJphUJQ9_1VF_gMibsSMts3YtEeCwVziN5CQNJdRCVbW8G_GgpbwMPu1E1Eugy3WICV6tj8JAIfxCI6EbaFQSX1NSo4J3_8Xr47K_jyRZoXr8630X.KKhIaJG70O8Xkt.CPAdh") : __rmT("e.rDoFYMIJV4iQJq0xCx0ZPupTvpFWwtdtG1vkVtXKYLZhaAzIuAqLOg4C6kXaTwfPIojiKM1dxlyaGW1tDtcxQ6Mxp11dE504X5Pk22VWfywjOnWU8kTljaqcxdoTSizOXQ2AQhbxcVs6X8ZCFJeR_gdF5bs4NXApxDdTQgeZ3UH8TepmA3mmt117E");
    const failure = markAutomaticFailureStop(live.slot, sourceHash || live.sourceHash, 'host-operation-already-dispatched', {
        message,
        code: sourceReplaced ? 'source-replaced-after-dispatch' : 'dispatch-consumed-without-complete-output',
        semanticFailure: sourceReplaced ? 'source-replaced-after-dispatch' : 'dispatch-consumed-without-complete-output',
        terminalStage: 'passive-reconcile',
    });
    return renderAutomaticFailureStop(index, live, failure);
}
export function confirmFinalRenderedGeneration(index) {
    const state = generationPolls.get(generationPollKey(index));
    const live = currentGenerationIdentity(index);
    if (!state || !live)
        return false;
    state.finalRenderHash = live.sourceHash;
    state.finalRenderRevision = live.revision;
    state.finalRenderAt = Date.now();
    state.queue?.(FINAL_RENDER_POLL_INTERVAL_MS);
    return true;
}
export function scheduleMessageGeneration(index, delay = 260, sourceAware = true, finalRenderConfirmed = false, sourceStabilityConfirmed = false, sourceStableSince = 0) {
    if (!automaticIndependentTiming())
        return null;
    const initialContext = getContext();
    const initialMessage = initialContext.chat?.[index];
    if (suppressesAutomaticGeneration(initialContext, index) || hasExistingFollowRabbitMirror(initialContext, index, initialMessage))
        return null;
    const initialIdentity = currentGenerationIdentity(index);
    const initialReady = exactIndependentReadyForIdentity(index, initialIdentity);
    if (initialReady) {
        clearAutomaticFailureStop(initialIdentity.slot, initialIdentity.sourceHash);
        restoreExactIndependentReadyForIdentity(index, initialIdentity, initialReady);
        return null;
    }
    const pollKey = generationPollKey(index);
    const previous = generationPolls.get(pollKey);
    if (previous) {
        previous.cancelled = true;
        if (previous.timer)
            clearTimeout(previous.timer);
    }
    const state = { cancelled: false, timer: 0, startedAt: Date.now(), stableSince: 0, lastHash: '', lastRevision: -1, weakActiveSince: 0, finalRenderHash: '', finalRenderRevision: -1, finalRenderAt: 0, sourceStabilityConfirmed: sourceStabilityConfirmed === true, queue: null };
    generationPolls.set(pollKey, state);
    const finish = () => { if (generationPolls.get(pollKey) === state)
        generationPolls.delete(pollKey); };
    const queue = ms => { if (state.timer)
        clearTimeout(state.timer); state.timer = setTimeout(() => { state.timer = 0; poll(); }, ms); };
    state.queue = queue;
    if (finalRenderConfirmed) {
        const rendered = currentGenerationIdentity(index);
        if (rendered) {
            state.finalRenderHash = rendered.sourceHash;
            state.finalRenderRevision = rendered.revision;
            state.finalRenderAt = Date.now();
            const provenStableAt = Math.min(Date.now(), Math.max(0, Number(sourceStableSince) || 0));
            if (provenStableAt) {
                state.lastHash = rendered.sourceHash;
                state.lastRevision = rendered.revision;
                state.stableSince = provenStableAt;
                if (Date.now() - provenStableAt >= FINAL_RENDER_SOURCE_STABLE_WAIT_MS)
                    state.sourceStabilityConfirmed = true;
            }
        }
    }
    const poll = () => {
        if (state.cancelled || !currentRuntime() || runtimeMode() !== 'independent') {
            finish();
            return;
        }
        const live = currentGenerationIdentity(index);
        if (live && suppressesAutomaticGeneration(live.ctx, index)) {
            const authorization = automaticGenerationCutovers.get(chatKey(live.ctx))?.authorized.get(Number(index));
            const refreshed = refreshUnpaidAutomaticAuthorization(live.ctx, index, authorization);
            if (refreshed === 'waiting') {
                if (Date.now() - state.startedAt < ACTIVE_GENERATION_WAIT_MS)
                    queue(generationWaitPollDelay(state.startedAt));
                else {
                    finish();
                    renderGenerationGateTimeout(index, 'source-stability');
                }
                return;
            }
            if (refreshed === true) {
                state.lastHash = '';
                state.lastRevision = -1;
                state.stableSince = 0;
                state.sourceStabilityConfirmed = false;
                state.finalRenderHash = live.sourceHash;
                state.finalRenderRevision = live.revision;
                state.finalRenderAt = Date.now();
            }
        }
        if (live && (suppressesAutomaticGeneration(live.ctx, index) || hasExistingFollowRabbitMirror(live.ctx, index, live.msg))) {
            finish();
            return;
        }
        if (live)
            cancelSupersededFlightsForBase(live.baseSlot, live.sourceHash);
        if (!live) {
            if (Date.now() - state.startedAt < OWNER_REATTACH_WAIT_MS)
                queue(generationWaitPollDelay(state.startedAt));
            else {
                finish();
                renderGenerationGateTimeout(index, 'identity-missing');
            }
            return;
        }
        const exactReady = exactIndependentReadyForIdentity(index, live);
        if (exactReady) {
            clearAutomaticFailureStop(live.slot, live.sourceHash);
            restoreExactIndependentReadyForIdentity(index, live, exactReady);
            finish();
            return;
        }
        const activeBaseFlight = activeIndependentFlightForBase(live.baseSlot);
        if (activeBaseFlight && automaticFlightStillOwnsBaseOperation(activeBaseFlight)) {
            const liveEl = messageElement(index);
            if (liveEl) {
                const remounted = ensureExternalUi(liveEl, live.key, __rmT("RHgve.GHpdmYABVrSlaI.uw652DDj5cPkUXfXr_IhI9Q2h"), 'loading', 'independent', live.sourceHash);
                if (remounted)
                    activeBaseFlight.loadingHost = remounted;
            }
            finish();
            return;
        }
        const preciseFailure = blockingAutomaticFailureStopFor(live.slot, live.sourceHash);
        if (preciseFailure) {
            finish();
            renderAutomaticFailureStop(index, live, preciseFailure);
            return;
        }
        if (automaticDispatchAlreadyConsumed(live.baseSlot)) {
            finish();
            renderAutomaticDispatchConsumed(index, live.sourceHash);
            return;
        }
        const activity = hostGenerationActivity();
        if (activity.strong) {
            state.weakActiveSince = 0;
            state.stableSince = 0;
            state.lastHash = '';
            state.lastRevision = -1;
            state.sourceStabilityConfirmed = false;
            if (Date.now() - state.startedAt < ACTIVE_GENERATION_WAIT_MS)
                queue(generationWaitPollDelay(state.startedAt));
            else {
                finish();
                renderGenerationGateTimeout(index);
            }
            return;
        }
        const finalRenderMatches = state.finalRenderHash === live.sourceHash
            && state.finalRenderRevision === live.revision
            && Date.now() - state.finalRenderAt <= FINAL_RENDER_CONFIRMATION_TTL_MS;
        if (activity.weak && !finalRenderMatches) {
            if (!state.weakActiveSince)
                state.weakActiveSince = Date.now();
            if (Date.now() - state.weakActiveSince < WEAK_GENERATION_FLAG_GRACE_MS) {
                state.stableSince = 0;
                state.lastHash = '';
                state.lastRevision = -1;
                queue(generationWaitPollDelay(state.startedAt));
                return;
            }
        }
        else
            state.weakActiveSince = 0;
        cancelFlightsForSlot(live.slot, live.sourceHash);
        if (!sourceAware) {
            finish();
            void generateFor(index, live.msg, false, false);
            return;
        }
        if (live.sourceHash !== state.lastHash || live.revision !== state.lastRevision) {
            state.lastHash = live.sourceHash;
            state.lastRevision = live.revision;
            state.stableSince = Date.now();
            if (state.finalRenderHash !== live.sourceHash || state.finalRenderRevision !== live.revision) {
                state.finalRenderHash = '';
                state.finalRenderRevision = -1;
                state.finalRenderAt = 0;
                state.sourceStabilityConfirmed = false;
            }
        }
        const hasBody = String(live.msg?.mes || '').trim().length > 0;
        const confirmedFinal = state.finalRenderHash === live.sourceHash
            && state.finalRenderRevision === live.revision
            && Date.now() - state.finalRenderAt <= FINAL_RENDER_CONFIRMATION_TTL_MS;
        if (hasBody && confirmedFinal && state.sourceStabilityConfirmed) {
            finish();
            void generateFor(index, live.msg, false, true);
            return;
        }
        const stableWait = confirmedFinal ? FINAL_RENDER_SOURCE_STABLE_WAIT_MS : (activity.weak ? WEAK_GENERATION_SOURCE_STABLE_WAIT_MS : SOURCE_STABLE_WAIT_MS);
        if (hasBody && state.stableSince && Date.now() - state.stableSince >= stableWait) {
            finish();
            void generateFor(index, live.msg, false, true);
            return;
        }
        if (Date.now() - state.startedAt < OWNER_REATTACH_WAIT_MS)
            queue(confirmedFinal ? FINAL_RENDER_POLL_INTERVAL_MS : GENERATION_PLACEHOLDER_POLL_INTERVAL_MS);
        else {
            finish();
            renderGenerationGateTimeout(index, 'source-stability');
        }
    };
    queue(delay);
}
export function ensureGenerationPlaceholderForIndex(index, waitingForBody = true) {
    if (!currentRuntime() || runtimeMode() !== 'independent')
        return null;
    const live = currentGenerationIdentity(index);
    const el = messageElement(index);
    if (!live || !el)
        return null;
    if (hasExistingFollowRabbitMirror(live.ctx, index, live.msg))
        return null;
    const store = readStore();
    const recovered = recoverSavedRecord(store, live.slot, live);
    if (recovered.storeChanged)
        writeStore(store);
    if (recovered.saved?.html && savedRecordMatchesObserved(recovered.saved, live))
        return null;
    const existing = collapseDuplicateIdentityHosts(el, live.key, 'independent', live.sourceHash);
    if (readyDetailsFromHost(existing))
        return existing;
    const preciseFailure = automaticFailureStopFor(live.slot, live.sourceHash);
    if (preciseFailure)
        return renderAutomaticFailureStop(index, live, preciseFailure) || existing;
    if (existing?.dataset?.rmState === 'error' && String(existing.dataset.rmSourceHash || '') === String(live.sourceHash || ''))
        return existing;
    if (suppressesAutomaticGeneration(live.ctx, index))
        return existing || null;
    return ensureReplyGenerationPlaceholder(el, live.key, live.sourceHash, waitingForBody);
}
export function clearGenerationPlaceholderPoll() {
    if (generationPlaceholderTimer) {
        clearTimeout(generationPlaceholderTimer);
        writeGenerationPlaceholderTimer(0);
    }
    writeGenerationPlaceholderStartedAt(0);
}
export function scheduleGenerationPlaceholderPoll(delay = 80) {
    if (!automaticIndependentTiming())
        return;
    clearGenerationPlaceholderPoll();
    writeGenerationPlaceholderStartedAt(Date.now());
    const poll = () => {
        writeGenerationPlaceholderTimer(0);
        if (!currentRuntime() || runtimeMode() !== 'independent' || !hostGenerationLooksActive() || Date.now() - generationPlaceholderStartedAt > GENERATION_PLACEHOLDER_POLL_LIMIT_MS) {
            clearGenerationPlaceholderPoll();
            return;
        }
        const ctx = getContext();
        const index = Array.isArray(ctx.chat) ? ctx.chat.length - 1 : -1;
        const msg = index >= 0 ? ctx.chat?.[index] : null;
        if (isRabbitMirrorEligibleAssistantMessage(msg) && messageElement(index)) {
            const host = ensureGenerationPlaceholderForIndex(index, true);
            if (host) {
                clearGenerationPlaceholderPoll();
                return;
            }
        }
        writeGenerationPlaceholderTimer(setTimeout(poll, GENERATION_PLACEHOLDER_POLL_INTERVAL_MS));
    };
    writeGenerationPlaceholderTimer(setTimeout(poll, Math.max(0, Number(delay) || 0)));
}
function resumeRabbitMirrorLifecycle(event) {
    if (!currentRuntime())
        return;
    const type = String(event?.type || '');
    const mode = runtimeMode();
    if (mode === 'off')
        return;
    if (type === 'visibilitychange' && document?.visibilityState === 'hidden') {
        writeBackgroundLifecycleNeedsRecovery(true);
        const last = lastAssistantMessage(getContext());
        if (mode === 'independent' && last && !hostGenerationLooksActive())
            scheduleMessageGeneration(last.i, 0, true);
        return;
    }
    if (type === 'pageshow' && event?.persisted === true)
        writeBackgroundLifecycleNeedsRecovery(true);
    if (!backgroundLifecycleNeedsRecovery)
        return;
    if (document?.visibilityState === 'hidden')
        return;
    writeBackgroundLifecycleNeedsRecovery(false);
    if (backgroundResumeTimer)
        clearTimeout(backgroundResumeTimer);
    writeBackgroundResumeTimer(setTimeout(() => {
        writeBackgroundResumeTimer(0);
        if (!currentRuntime())
            return;
        const currentMode = runtimeMode();
        if (currentMode === 'off')
            return;
        const last = lastAssistantMessage(getContext());
        markExternalGeometryLifecycle('background-resume');
        scheduleStartupHistorySync(runtimeConfigSequence);
        if (currentMode === 'independent' && last)
            scheduleMessageGeneration(last.i, 160, true);
    }, 80));
}
export function installBackgroundLifecycleListeners() {
    if (backgroundLifecycleListenersInstalled || typeof window === 'undefined' || typeof document === 'undefined')
        return;
    document.addEventListener('visibilitychange', resumeRabbitMirrorLifecycle, true);
    window.addEventListener('pageshow', resumeRabbitMirrorLifecycle, true);
    window.addEventListener('focus', resumeRabbitMirrorLifecycle, true);
    writeBackgroundLifecycleListenersInstalled(true);
}
export function removeBackgroundLifecycleListeners() {
    if (!backgroundLifecycleListenersInstalled || typeof window === 'undefined' || typeof document === 'undefined')
        return;
    document.removeEventListener('visibilitychange', resumeRabbitMirrorLifecycle, true);
    window.removeEventListener('pageshow', resumeRabbitMirrorLifecycle, true);
    window.removeEventListener('focus', resumeRabbitMirrorLifecycle, true);
    writeBackgroundLifecycleListenersInstalled(false);
    writeBackgroundLifecycleNeedsRecovery(false);
    if (backgroundResumeTimer) {
        clearTimeout(backgroundResumeTimer);
        writeBackgroundResumeTimer(0);
    }
}
export function currentGenerationIdentity(index) {
    const ctx = getContext();
    const msg = ctx.chat?.[index];
    if (!isRabbitMirrorEligibleAssistantMessage(msg))
        return null;
    const observed = observeMessageSourceRevision(ctx, index, msg);
    return { ctx, msg, index, slot: observed.slot, baseSlot: messageBaseSlotKey(ctx, index, msg), legacySlots: observed.legacySlots || [], key: recordKey(ctx, index, msg), sourceHash: observed.sourceHash, bodyHash: observed.bodyHash, displayHash: observed.displayHash, reasoningHash: observed.reasoningHash, revision: observed.revision, [INDEPENDENT_OWNER_OBSERVATION]: { ctx, index, msg } };
}
function settleStuckLoadingHost(flight, record = null, slot = '') {
    const host = flight?.loadingHost;
    const liveEl = messageElement(Number(flight?.index));
    const stuck = node => node?.isConnected && node.dataset?.rmState === 'loading';
    const target = stuck(host) ? host : [...(liveEl ? externalHosts(liveEl) : [])].find(node => node.dataset?.rmSource === 'independent' && node.dataset?.rmKey === flight?.key && stuck(node));
    if (!target)
        return false;
    try {
        const details = target.querySelector?.(':scope > details');
        if (details) {
            setPlaceholderSummary(details, __rmT("Iu_Zk8AUYpADJdqdIyH5rOrwNV3cXaqPI4YacqJ7tB8"));
            renderExternalErrorBody(details, __rmT("jZGPlTiMMSKhYI38MCdg7QdDdAuSA.n4Df4uZcjKDbrPVVXaUgflGrUhdXTip2USaVtDMinS1ZH3iEuL03N_taR6jmsRq7R_nDwqRJIb6S3wP5diqV4CLi2zd7TaUyptbiiT.TQAXr7o7YyH_MgcX7nn0cuNYAs0"));
        }
        target.dataset.rmState = 'error';
        if (record?.html)
            showIndependentUnsavedOutput(record, slot || flight.key);
    }
    catch {
        return false;
    }
    return true;
}
function settleCancelledIndependentFlightUi(flight, reason = 'cancelled') {
    if (!flight || flight.uiSettled)
        return false;
    const host = flight.loadingHost;
    const liveEl = messageElement(Number(flight.index));
    const identity = currentGenerationIdentity(Number(flight.index));
    const sameOwner = identity && identity.key === flight.key && identity.sourceHash === flight.sourceHash;
    if (flight.manual && flight.previousReadyRecord?.html && liveEl && sameOwner) {
        ensureExternalUi(liveEl, flight.key, flight.previousReadyRecord.html, 'ready', 'independent', flight.sourceHash, flight.previousReadyRecord);
        flight.uiSettled = true;
        return true;
    }
    if (host?.isConnected && host.dataset?.rmState === 'loading') {
        if (sameOwner && liveEl && String(reason || '') === 'api-settings-changed') {
            ensureExternalUi(liveEl, flight.key, __rmT("GAszBT_lhYT14LoBeLzeP0KEnKD98N5Ca2dYT96SKR4gWS9OoUAcolEvdsUDAS0FyCvO1VCBBqDfp0S_yippQsF1yaUW8SOM2hqrCIch1VT.Hte_gpSI_ebuvI92qCdvr6A"), 'error', 'independent', flight.sourceHash);
        }
        else
            host.remove?.();
        flight.uiSettled = true;
        return true;
    }
    flight.uiSettled = true;
    return false;
}
function releaseIndependentFlightBatches(flight, { keepBatchId = '' } = {}) {
    for (const [id, identity] of flight?.batchReservations || []) {
        if (keepBatchId && id === keepBatchId)
            continue;
        try {
            if (releasePendingComboBatch(identity))
                flight.batchReservations.delete(id);
        }
        catch { }
    }
}
export function abortFlight(flight, reason = 'cancelled') {
    if (!flight)
        return;
    if (flight.earlyBodyOwner) {
        flight.earlyBodyOwner.cancelled = true;
        flight.earlyBodyOwner.cancelReason = reason;
        flight.earlyBodyOwner.resolveFinal?.(false);
        flight.earlyBodyOwner.resolveFinal = null;
        if (flight.earlyBodyOwner.finalTimer) {
            clearTimeout(flight.earlyBodyOwner.finalTimer);
            flight.earlyBodyOwner.finalTimer = 0;
        }
    }
    flight.cancelled = true;
    flight.cancelReason = reason;
    flight.deadline?.clear?.();
    flight.deadline = null;
    try {
        flight.dispatchLease?.release?.();
    }
    catch { }
    try {
        flight.controller?.abort?.(reason);
    }
    catch { }
    try {
        flight.cancelAttempt?.();
    }
    catch { }
    settleCancelledIndependentFlightUi(flight, reason);
}
export function cancelFlightsForSlot(slot, exceptSourceHash = '') {
    for (const [id, flight] of globalFlights()) {
        if (!String(id).startsWith(`${slot}\u0000`))
            continue;
        if (exceptSourceHash && flight?.sourceHash === exceptSourceHash)
            continue;
        abortFlight(flight, 'source-changed');
        globalFlights().delete(id);
    }
    const active = pending.get(slot);
    if (active && (!exceptSourceHash || active.sourceHash !== exceptSourceHash)) {
        abortFlight(active, 'source-changed');
        pending.delete(slot);
    }
}
export function activeIndependentFlightForBase(baseSlot = '') {
    const base = String(baseSlot || '');
    if (!base)
        return null;
    for (const flight of globalFlights().values()) {
        if (String(flight?.baseSlot || '') === base && !flight?.cancelled)
            return flight;
    }
    for (const flight of pending.values()) {
        if (String(flight?.baseSlot || '') === base && !flight?.cancelled)
            return flight;
    }
    return null;
}
function automaticFlightStillOwnsBaseOperation(flight) {
    if (!flight || flight.cancelled || flight.manual)
        return false;
    if (flight.earlyBodyOwner)
        return earlyBodyOwnerCurrent(flight.earlyBodyOwner);
    const base = String(flight.baseSlot || '');
    if (!base || Number(flight.operationEpoch || 0) !== Number(operationEpochForBase(base)))
        return false;
    const identity = currentGenerationIdentity(Number(flight.index));
    if (!identity || String(identity.baseSlot || '') !== base)
        return false;
    return !hasExplicitSourceReplacementEvidence(identity.ctx, Number(flight.index), identity.msg, flight.loadingHost || null);
}
export function cancelSupersededFlightsForBase(baseSlot, currentSourceHash = '') {
    const base = String(baseSlot || '');
    if (!base)
        return;
    for (const [id, flight] of globalFlights()) {
        if (String(flight?.baseSlot || '') !== base || String(flight?.sourceHash || '') === String(currentSourceHash || ''))
            continue;
        if (automaticFlightStillOwnsBaseOperation(flight) || (flight.manualBodyOwner && manualBodyOwnerCurrent(flight.manualBodyOwner)))
            continue;
        abortFlight(flight, 'source-version-replaced');
        globalFlights().delete(id);
    }
    for (const [slot, active] of pending.entries()) {
        if (String(active?.baseSlot || '') !== base || String(active?.sourceHash || '') === String(currentSourceHash || ''))
            continue;
        if (automaticFlightStillOwnsBaseOperation(active) || (active.manualBodyOwner && manualBodyOwnerCurrent(active.manualBodyOwner)))
            continue;
        abortFlight(active, 'source-version-replaced');
        pending.delete(slot);
    }
}
export function cancelFlightsForMessage(index, reason = 'message-source-changed', preserveBaseSlot = '') {
    const ctx = getContext();
    const chatKeys = new Set([chatKey(ctx), legacyChatKey(ctx)].map(value => String(value || '')).filter(Boolean));
    const preserveBase = String(preserveBaseSlot || '');
    const liveIdentity = preserveBase ? currentGenerationIdentity(Number(index)) : null;
    const keepCurrentFlight = flight => {
        const base = String(flight?.baseSlot || '');
        if (!preserveBase || base !== preserveBase || flight?.cancelled)
            return false;
        if (!flight?.manual)
            return automaticFlightStillOwnsBaseOperation(flight);
        return !!liveIdentity
            && String(liveIdentity.baseSlot || '') === preserveBase
            && String(flight?.slot || '') === String(liveIdentity.slot || '')
            && String(flight?.sourceHash || '') === String(liveIdentity.sourceHash || '')
            && Number(flight?.revision || 0) === Number(liveIdentity.revision || 0);
    };
    const belongsToCurrentMessage = flight => {
        const base = String(flight?.baseSlot || '');
        if (!base || keepCurrentFlight(flight))
            return false;
        return [...chatKeys].some(key => {
            const prefix = `${key}:${Number(index)}:`;
            return base.startsWith(prefix) && /^\d+$/.test(base.slice(prefix.length));
        });
    };
    for (const [id, flight] of globalFlights()) {
        if (!belongsToCurrentMessage(flight))
            continue;
        abortFlight(flight, reason);
        globalFlights().delete(id);
    }
    for (const [slot, active] of pending.entries()) {
        if (!belongsToCurrentMessage(active))
            continue;
        abortFlight(active, reason);
        pending.delete(slot);
    }
}
export function cancelAllIndependentFlights(reason = 'runtime-changed') {
    for (const flight of globalFlights().values())
        abortFlight(flight, reason);
    globalFlights().clear();
    for (const active of pending.values())
        abortFlight(active, reason);
    pending.clear();
}
function safetyCheckedAutomaticDispatchLease(lease, ctx, index, msg) {
    if (!lease)
        return null;
    return { ...lease, consume() {
            const live = getContext();
            if (live.chat !== ctx.chat || live.chat?.[index] !== msg)
                return false;
            const reason = mainReplyAbnormalReason(msg, automaticMainReplySafetyOptions(live, index));
            if (reason) {
                notifySafetyValve(msg, reason);
                throw Object.assign(new Error(`${reason}${__rmT("vTcVdqBDE1Vgo9W5eddHuxmDRou4DKmJqGINb3P.dOwtq7HnzJC5nGIzmJl1YvkC")}`), { code: 'RABBIT_MIRROR_MAIN_REPLY_INCOMPLETE', requestCount: 0 });
            }
            return lease.consume();
        } };
}
export async function generateFor(index, msg, force = false, sourceAware = true, multifaceResay = null, earlyBodyOwner = null, manualBodyOwner = null, singlePresentationResay = null, quickStartOwner = null, resayNote = null) {
    const ctx = getContext();
    const currentMsg = ctx.chat?.[index];
    if (quickStartOwner && (!quickStartOwners.has(quickStartOwner) || !quickActionOwnerCurrent(quickStartOwner) || quickStartOwner.index !== index || force))
        return;
    if (!isRabbitMirrorEligibleAssistantMessage(currentMsg))
        return;
    msg = currentMsg;
    if (earlyBodyOwner)
        assertEarlyBodyOwner(earlyBodyOwner);
    const observed = observeMessageSourceRevision(ctx, index, msg);
    const key = recordKey(ctx, index, msg);
    const slot = observed.slot;
    const sourceHash = observed.sourceHash;
    const bodyHash = observed.bodyHash;
    const displayHash = observed.displayHash;
    const reasoningHash = observed.reasoningHash;
    const revision = observed.revision;
    const st = getSettings();
    const baseSlot = messageBaseSlotKey(ctx, index, msg);
    if (st.enabled === false || st.autoRabbitMirrorInjection === false || st.generationSource !== 'independent' || runtimeMode() !== 'independent')
        return;
    if (independentGenerationTiming(st) === 'off' || (!force && !automaticIndependentTiming()))
        return;
    if (!force && !quickStartOwner) {
        const sample = earlyBodyOwner ? { mes: String(earlyBodyOwner.visible?.text || '') } : msg;
        const reason = mainReplyAbnormalReason(sample, earlyBodyOwner ? { partial: true } : automaticMainReplySafetyOptions(ctx, index));
        if (reason) {
            if (!earlyBodyOwner)
                notifySafetyValve(msg, reason);
            return;
        }
    }
    if (!independentHistoryLoaded(ctx, index, msg)) {
        await restoreIndependentHistory(ctx, index, msg);
        const live = getContext();
        if (live.chat !== ctx.chat || live.chat?.[index] !== msg || messageSlotKey(live, index, msg) !== slot)
            return;
    }
    if (force && independentGenerationTiming(st) === 'manual') {
        const active = activeIndependentFlightForBase(baseSlot);
        if (active)
            return active.task;
        manualBodyOwner ??= captureManualBodyOwner(ctx, index, msg, manualIntentForMessage(ctx, index));
    }
    const manualResay = force && !manualBodyOwner?.firstGeneration;
    if (!force && ((!earlyBodyOwner && !quickStartOwner && suppressesAutomaticGeneration(ctx, index)) || hasExistingFollowRabbitMirror(ctx, index, msg)))
        return;
    if (!force) {
        const preciseFailure = blockingAutomaticFailureStopFor(slot, sourceHash);
        if (preciseFailure) {
            renderAutomaticFailureStop(index, currentGenerationIdentity(index), preciseFailure);
            return;
        }
    }
    if (force || isMissingShellStop(automaticFailureStopFor(slot, sourceHash)))
        clearAutomaticFailureStop(slot, sourceHash);
    const el = messageElement(index);
    let store = readStore();
    const persistedOwner = persistedOwnerForMessage(ctx, index, msg);
    const persistedSuppressed = !!persistedOwner?.deleted;
    const persistedReady = persistedSuppressed ? null : savedIndependentRecordForOwner(ctx, index, msg, store, observed);
    if (force) {
    }
    else if (persistedReady) {
        const persistedSlot = chatPersistenceSlot(ctx, index, swipeId(msg), persistedReady) || slot;
        if (!store?.[persistedSlot]?.html) {
            saveRecordForSlot(store, persistedSlot, persistedReady, { dropLegacy: false });
            writeStore(store);
        }
        setOwnerLockForBase(baseSlot, persistedSlot, String(persistedReady.sourceHash || persistedReady.bodyHash || sourceHash));
        if (el)
            ensureExternalUi(el, key, persistedReady.html, 'ready', 'independent', sourceHash, persistedReady);
        return persistedReady;
    }
    else if (!persistedSuppressed) {
        const locked = lockedIndependentRecordForBase(baseSlot, store);
        if (locked?.record?.html && savedRecordMatchesObserved(locked.record, observed)) {
            if (el)
                ensureExternalUi(el, key, locked.record.html, 'ready', 'independent', sourceHash, locked.record);
            return locked.record;
        }
    }
    if (force) {
        const resayFaceIndex = Number.isInteger(multifaceResay?.faceIndex) ? multifaceResay.faceIndex : 0;
        if (persistedReady?.html)
            seedIndependentFaceSwipes(baseSlot, persistedReady.html);
        const earlyHost = el ? collapseDuplicateIdentityHosts(el, key, 'independent', sourceHash) : null;
        const earlyFaces = externalFaceDetails(earlyHost);
        const overlayDetails = earlyFaces.length > 1 ? earlyFaces[resayFaceIndex] : earlyFaces[0];
        if (!hasEphemeralFaceFailure(overlayDetails) && !canAppendSwipe(readFaceSwipe(baseSlot, resayFaceIndex))) {
            globalThis.toastr?.warning?.(FACE_SWIPE_FULL_MESSAGE);
            return null;
        }
        advanceOperationEpochForBase(baseSlot, 'manual-resay');
        cancelFlightsForMessage(index, 'manual-resay');
        if (manualBodyOwner) {
            manualBodyOwner.epoch = operationEpochForBase(baseSlot);
            rememberManualClickOwner(manualBodyOwner);
        }
    }
    else
        cancelSupersededFlightsForBase(baseSlot, sourceHash);
    const recoveredAtGeneration = recoverSavedRecord(store, slot, observed);
    let saved = persistedSuppressed && !force ? null : (persistedReady || recoveredAtGeneration.saved);
    if (recoveredAtGeneration.storeChanged)
        writeStore(store);
    const mountedHost = el ? collapseDuplicateIdentityHosts(el, key, 'independent', sourceHash) : null;
    const mountedReady = mountedIndependentReadyHostMatchesObserved(mountedHost, ctx, index, msg, observed, key)
        ? readyRecordFromHost(mountedHost, observed, st.independentApiModel)
        : null;
    if (mountedReady?.html && !force && !persistedSuppressed) {
        const mountedSlot = String(mountedHost?.dataset?.rmKey || slot);
        const mountedStore = readStore();
        if (!mountedStore?.[mountedSlot]?.html) {
            saveRecordForSlot(mountedStore, mountedSlot, mountedReady, { dropLegacy: false });
            writeStore(mountedStore);
        }
        setOwnerLockForBase(baseSlot, mountedSlot, String(mountedHost?.dataset?.rmSourceHash || sourceHash));
        writePersistedOwner(ctx, index, msg, mountedReady, { overwrite: false });
        return mountedReady;
    }
    if (saved?.html && !force) {
        const savedSourceHash = String(saved.sourceHash || '');
        if (savedRecordMatchesObserved(saved, observed) || (!savedSourceHash && !sourceAware)) {
            setOwnerLockForBase(baseSlot, slot, sourceHash);
            writePersistedOwner(ctx, index, msg, saved, { overwrite: false });
            if (el) {
                const restored = ensureExternalUi(el, key, saved.html, 'ready', 'independent', sourceHash, saved);
                rebuildCollapsedReadyHost(el, restored, key, 'independent', saved.html, sourceHash, saved);
            }
            return saved;
        }
    }
    const existing = pending.get(slot);
    if (!force && existing && existing.sourceHash === sourceHash && existing.revision === revision) {
        if (el) {
            const remounted = ensureExternalUi(el, key, __rmT("RHgve.GHpdmYABVrSlaI.uw652DDj5cPkUXfXr_IhI9Q2h"), 'loading', 'independent', sourceHash);
            if (remounted)
                existing.loadingHost = remounted;
        }
        existing.task?.finally?.(() => queueMessageSync([index]));
        return existing.task;
    }
    const flightKey = flightIdentity(slot, sourceHash);
    const shared = globalFlights().get(flightKey);
    if (!force && shared?.task) {
        if (el) {
            const remounted = ensureExternalUi(el, key, __rmT("RHgve.GHpdmYABVrSlaI.uw652DDj5cPkUXfXr_IhI9Q2h"), 'loading', 'independent', sourceHash);
            if (remounted)
                shared.loadingHost = remounted;
        }
        shared.task.finally?.(() => queueMessageSync([index]));
        return shared.task;
    }
    const previousReadyRecord = mountedReady ? { ...saved, ...mountedReady, apiRequest: saved?.apiRequest }
        : (saved?.html && independentStoredHtmlRestorable(saved.html) ? { ...saved } : null);
    if (multifaceResay) {
        const previousBatch = parseMultifaceOutput(String(previousReadyRecord?.html || ''));
        const faceIndex = Number(multifaceResay.faceIndex);
        if (!previousBatch.ok || !Number.isInteger(faceIndex) || faceIndex < 0 || faceIndex >= previousBatch.faces.length) {
            globalThis.toastr?.error?.(__rmT("gUGCDRPKpOES_Zy4XDImFy0.c8c_izx1niqFBG1EhnYOGVB_MzRHMaGcYHkjcdRvZycqnrxGY3Y"));
            return null;
        }
    }
    if (force) {
        if (previousReadyRecord?.html)
            seedIndependentFaceSwipes(baseSlot, previousReadyRecord.html);
    }
    else
        cancelFlightsForSlot(slot, sourceHash);
    if (!readFaceSwipe(baseSlot, 0).versions.length)
        seedNeighborIndependentFaceSwipes(ctx, index, msg, baseSlot);
    const rawDispatchLease = force ? createManualDispatchLease() : reserveAutomaticDispatchLease(baseSlot, sourceHash);
    const dispatchLease = force || quickStartOwner || earlyBodyOwner ? rawDispatchLease : safetyCheckedAutomaticDispatchLease(rawDispatchLease, ctx, index, msg);
    if (!dispatchLease) {
        if (!force) {
            const preciseFailure = blockingAutomaticFailureStopFor(slot, sourceHash);
            if (preciseFailure)
                renderAutomaticFailureStop(index, currentGenerationIdentity(index), preciseFailure);
            else if (automaticDispatchAlreadyConsumed(baseSlot))
                renderAutomaticDispatchConsumed(index, sourceHash);
        }
        return null;
    }
    let loadingHost = null;
    if (el) {
        collapseDuplicateIdentityHosts(el, key, 'independent', sourceHash);
        loadingHost = ensureExternalUi(el, key, __rmT("RHgve.GHpdmYABVrSlaI.uw652DDj5cPkUXfXr_IhI9Q2h"), 'loading', 'independent', sourceHash);
    }
    const runId = ++generationSequence;
    let stale = false;
    const operationEpoch = Number(dispatchLease?.epoch || operationEpochForBase(baseSlot));
    const expectedFaceCount = (() => {
        if (multifaceResay)
            return 1;
        const count = Number(st.rabbitMirrorFaceCount);
        return Number.isInteger(count) && count >= 1 ? count : 1;
    })();
    const flight = { task: null, runId, key, slot, index, sourceHash, revision, manual: !!force, manualBodyOwner, cancelled: false, controller: new AbortController(), baseSlot, operationEpoch, flightKey, dispatchLease, timedOut: false, stalled: false, timeoutError: null, deadline: null, loadingHost, previousReadyRecord, uiSettled: false, batchPlan: null, automaticRerollCount: 0, expectedFaceCount, retainedHtml: '', missingIndexes: [], faceRecipes: multifaceResay?.faces?.[multifaceResay.faceIndex] ? [multifaceResay.faces[multifaceResay.faceIndex]] : [], resayNote: String(resayNote || '') };
    if (earlyBodyOwner) {
        flight.earlyBodyOwner = earlyBodyOwner;
        earlyBodyOwner.flight = flight;
    }
    const currentIdentityForFlight = () => {
        const live = currentGenerationIdentity(index);
        const active = pending.get(slot);
        const registered = currentRuntime() && runtimeMode() === 'independent' && live
            && active?.runId === runId && active?.revision === revision
            && !flight.cancelled && globalFlights().get(flightKey) === flight;
        if (!registered)
            return null;
        if (earlyBodyOwner)
            return earlyBodyOwnerCurrent(earlyBodyOwner) ? live : null;
        if (manualBodyOwner)
            return manualBodyOwnerCurrent(manualBodyOwner) ? live : null;
        if (force) {
            return live.slot === slot && live.key === key && live.sourceHash === sourceHash && live.revision === revision ? live : null;
        }
        if (String(live.baseSlot || '') !== String(baseSlot)
            || Number(operationEpochForBase(baseSlot)) !== operationEpoch
            || hasExplicitSourceReplacementEvidence(live.ctx, index, live.msg, flight.loadingHost || null))
            return null;
        return live;
    };
    const stillCurrent = () => !!currentIdentityForFlight();
    flight.task = null;
    globalFlights().set(flightKey, flight);
    pending.set(slot, flight);
    try {
        flight.progress = startGenerationProgress({ faceCount: expectedFaceCount, dark: getSettings?.()?.darkVisualMode === true, getHost: () => {
                if (flight.loadingHost?.isConnected)
                    return flight.loadingHost;
                const liveEl = messageElement(index);
                return liveEl ? matchingExternalHosts(liveEl, key, 'independent')[0] || null : null;
            } });
    }
    catch (error) {
        flight.progress = null;
        console.debug('[RabbitMirror] generation progress not started:', error);
    }
    const dispatchAttempt = () => {
        const attempt = { controller: flight.controller, consumeCountAtStart: Math.max(0, Number(dispatchLease?.consumeCount?.() || 0)) };
        flight.attemptToken = attempt;
        const attemptCurrent = () => flight.attemptToken === attempt && !flight.cancelled && !attempt.controller.signal.aborted;
        const abortError = () => Object.assign(new Error(__rmT("kls8qmHCLj43t6LL_Ks5Z0beVg6rrk")), { name: 'AbortError' });
        const assertAttempt = () => { if (!attemptCurrent())
            throw abortError(); };
        let timeoutReject = null;
        const timeoutPromise = new Promise((resolve, reject) => { timeoutReject = reject; });
        flight.cancelAttempt = () => timeoutReject?.(abortError());
        flight.timedOut = false;
        flight.stalled = false;
        flight.timeoutError = null;
        flight.serialPartial = null;
        flight.deadline?.clear?.();
        flight.deadline = createIndependentRequestDeadline(attempt.controller, error => {
            if (flight.attemptToken !== attempt)
                return;
            if (Number(dispatchLease?.consumeCount?.() || 0) <= attempt.consumeCountAtStart) {
                error = Object.assign(new Error(__rmT("zsqcckylGfnyET2b49FyL7o4haYD_FqwZYyYWNNo6wFBLimUQTg3GaSX5YsPH6VmXuHJ1n8CIF.kizj1FSvU0lnG9c0XUqzsohRQ6.AqKyKSiUByl5fBoReiOXbA9RDr")), { name: 'RabbitMirrorIndependentTimeoutError', code: 'RABBIT_MIRROR_PREPARATION_TIMEOUT', requestCount: 0 });
            }
            if (isAutomaticRerollStall(error))
                flight.stalled = true;
            else
                flight.timedOut = true;
            flight.timeoutError = error;
            timeoutReject?.(error);
        }, { idleMs: configuredAutomaticRerollIdleMs(getSettings()) });
        const missingRetry = recipesCoverMissing(flight.faceRecipes, flight.missingIndexes) ? { indexes: flight.missingIndexes, faces: flight.faceRecipes } : null;
        if (multifaceResay && flight.automaticRerollCount > 0 && !missingRetry) {
            const error = new Error(__rmT("Ajc_TnJEvhBBwiuRNH62cPUHHbx6Zqzm19ByIFozJunPEzGZmJOunljnBayi0aiam16aqFpfXIwj8LHKqAk"));
            error.requestCount = 0;
            throw error;
        }
        assertAttempt();
        flight.progress?.attempt({ retry: Number(flight.automaticRerollCount) || 0, faceCount: missingRetry ? missingRetry.indexes.length : flight.expectedFaceCount });
        const apiTask = callIndependentApi(ctx, index, msg, attempt.controller.signal, { manualRetry: force && !manualBodyOwner?.firstGeneration, automaticReroll: Number(flight.automaticRerollCount) > 0, slot, dispatchLease, multifaceResay: missingRetry ? null : (multifaceResay || singlePresentationResay), missingFaceRetry: missingRetry, earlyBodyOwner, manualBodyOwner, resayNote: flight.resayNote,
            isPromptOwnerCurrent: () => attemptCurrent() && stillCurrent(), currentBatchPlan: () => attemptCurrent() ? flight.batchPlan : null,
            onProgress: (kind, detail) => { if (!attemptCurrent())
                return; flight.deadline?.progress?.(kind); flight.progress?.note(kind, detail); },
            onSerialPartial: partial => {
                if (attemptCurrent())
                    flight.progress?.serialAccepted(partial);
                if (!attemptCurrent() || flight.missingIndexes?.length)
                    return;
                if (Number(partial?.faceCount) !== Number(flight.expectedFaceCount))
                    return;
                flight.serialPartial = { html: String(partial?.html || ''), missing: Array.isArray(partial?.missing) ? [...partial.missing] : [] };
            },
            onRequestSelection: (diagnostic, forProgress) => { assertAttempt(); captureRecipes({ requestDiagnostic: diagnostic }, null); flight.progress?.selection(forProgress || diagnostic); },
            onBatchPlan: plan => {
                assertAttempt();
                flight.batchPlan = plan || null;
                if (plan) {
                    flight.batchReservations ??= new Map();
                    flight.batchReservations.set(plan.batchId, { batchId: plan.batchId, identity: { ...plan.identity } });
                }
            } });
        return Promise.race([apiTask, timeoutPromise]);
    };
    const settleSuccessfulIndependentResult = async (result) => {
        if (result?.skipped) {
            if (!settleSkippedManualIndependentFlightUi(flight, result))
                settleCancelledIndependentFlightUi(flight, 'prompt-skipped');
            flight.uiSettled = true;
            return result;
        }
        const evidenceMount = detail => { try {
            noteGenerationEvidenceMount(index, typeof detail === 'function' ? detail() : detail);
        }
        catch { } };
        if (earlyBodyOwner) {
            flight.deadline?.clear?.();
            flight.deadline = null;
            if (!earlyBodyOwner.finalized)
                await earlyBodyOwner.finalPromise;
            if (!earlyBodyOwnerCurrent(earlyBodyOwner, { visibility: true })) {
                stale = true;
                evidenceMount({ outcome: 'not-mounted', reason: 'early-body-final-changed' });
                settleCancelledIndependentFlightUi(flight, 'early-body-final-changed');
                return;
            }
        }
        const settledIdentity = currentIdentityForFlight();
        if (!settledIdentity) {
            stale = true;
            evidenceMount(() => ({ outcome: 'not-mounted', reason: 'stale-owner', messageInDom: !!messageElement(index) }));
            settleCancelledIndependentFlightUi(flight, 'stale-owner');
            return;
        }
        const settledCtx = settledIdentity.ctx;
        const settledMsg = settledIdentity.msg;
        const settledSlot = settledIdentity.slot;
        const settledKey = settledIdentity.key;
        const settledSourceHash = settledIdentity.sourceHash;
        const settledBodyHash = settledIdentity.bodyHash;
        const settledDisplayHash = settledIdentity.displayHash;
        const settledReasoningHash = settledIdentity.reasoningHash;
        if (!force) {
            const serverOwner = persistedOwnerForMessage(settledCtx, index, settledMsg);
            const serverRecord = serverOwner?.deleted ? null : (serverOwner?.html && independentStoredHtmlRestorable(serverOwner.html) && savedRecordMatchesObserved(serverOwner, settledIdentity) ? serverOwner : null);
            if (serverRecord?.html) {
                const serverSlot = chatPersistenceSlot(settledCtx, index, swipeId(settledMsg), serverRecord) || settledSlot;
                const liveStore = readStore();
                if (!liveStore?.[serverSlot]?.html) {
                    saveRecordForSlot(liveStore, serverSlot, serverRecord, { dropLegacy: false });
                    writeStore(liveStore);
                }
                setOwnerLockForBase(baseSlot, serverSlot, String(serverRecord.sourceHash || serverRecord.bodyHash || settledSourceHash));
                const liveEl = messageElement(index);
                if (liveEl)
                    ensureExternalUi(liveEl, settledKey, serverRecord.html, 'ready', 'independent', settledSourceHash, serverRecord);
                flight.notice = { host: null, failed: false };
                evidenceMount({ outcome: 'reused-saved-record', messageInDom: !!liveEl });
                return serverRecord;
            }
            const locked = lockedIndependentRecordForBase(baseSlot, readStore());
            if (locked?.record?.html && savedRecordMatchesObserved(locked.record, settledIdentity)) {
                const liveEl = messageElement(index);
                if (liveEl)
                    ensureExternalUi(liveEl, settledKey, locked.record.html, 'ready', 'independent', settledSourceHash, locked.record);
                flight.notice = { host: null, failed: false };
                evidenceMount({ outcome: 'reused-locked-record', messageInDom: !!liveEl });
                return locked.record;
            }
        }
        let html = String(result?.html || '');
        if (result?.outputCut) {
            try {
                globalThis.toastr?.warning?.(outputCutMessage(result.outputCut), __rmT("9.JSSv1i"));
            }
            catch { }
        }
        try {
            const timing = flight.progress?.timing?.() || null;
            html = stampGeneratedFaces(html, { v: RUNTIME_VERSION, t: Date.now(), ms: timing?.totalMs, th: timing?.thinkMs, r: timing?.retries, n: Math.max(1, Number(flight.expectedFaceCount) || 1) });
        }
        catch { }
        if (!multifaceResay && !result?.mergedFromMissingRetry) {
            try {
                html = stampFaceRecipesInHtml(html, result?.requestDiagnostic || null);
            }
            catch { }
        }
        let replacementVisualHtml = '';
        let replacementPreviousRecord = null;
        if (multifaceResay && !result?.mergedFromMissingRetry) {
            const liveEl = messageElement(index);
            const liveHost = liveEl ? collapseDuplicateIdentityHosts(liveEl, settledKey, 'independent', settledSourceHash) : null;
            const liveRecord = mountedIndependentReadyHostMatchesObserved(liveHost, settledCtx, index, settledMsg, settledIdentity, settledKey)
                ? readyRecordFromHost(liveHost, settledIdentity, st.independentApiModel) : null;
            const persistedNow = persistedOwnerForMessage(settledCtx, index, settledMsg);
            const liveMergeRecord = liveRecord?.html ? { ...previousReadyRecord, ...liveRecord, apiRequest: previousReadyRecord?.apiRequest } : null;
            const faceIndex = Number(multifaceResay.faceIndex);
            replacementVisualHtml = faceDetailsListFromHtml(sanitizeIndependentReadyFragment(html, true))[0]?.detailsHtml || '';
            if (!replacementVisualHtml)
                throw new Error(__rmT("8arbvKpKzo.5lK6n7U7FBsJSm0QQEsacS_DP9rDDbASMcZdk8BrWtIq7705VKxdWXenjbvzJV46XtEH9"));
            if (independentStoredHtmlRestorable(replacementVisualHtml))
                flight.completedFaceRecord = {
                    html: replacementVisualHtml, sourceHash: settledSourceHash, ts: Date.now(), runtime: RUNTIME_VERSION,
                };
            const mergeAttempt = mergeResayFaceIntoBatch([liveMergeRecord, persistedNow, previousReadyRecord], faceIndex, replacementVisualHtml, result?.requestDiagnostic || null);
            if (!mergeAttempt.ok) {
                console.warn('[RabbitMirror] multiface resay merge refused', mergeAttempt.reasons);
                throw Object.assign(new Error(`${__rmT("V6znaX4YFEiWN6RQEMfmq2S1LF1J0JICBiMLi55mHnT0U4W3xE1OBhEkGFham5.MDZvDCcONLxG")}${mergeAttempt.reasons.join(__rmT("Yis")) || __rmT("tmMwwSIgNF5Sc98L3TNPWg8HDTG")}${__rmT("1VO3PnG21gPnhB4yv_odRQEoNoBHXvBrYobFQNdlgG8")}`), { code: 'multiface-resay-merge' });
            }
            const mergeRecord = mergeAttempt.record;
            replacementPreviousRecord = mergeRecord;
            const previousBatch = mergeAttempt.previous;
            replacementVisualHtml = mergeAttempt.details;
            html = mergeAttempt.html;
            flight.completedFaceRecord = null;
            const oldDiagnostic = mergeRecord?.apiRequest && typeof mergeRecord.apiRequest === 'object' ? mergeRecord.apiRequest : {};
            const oldFaces = Array.isArray(oldDiagnostic.faces) && oldDiagnostic.faces.length === previousBatch.faces.length
                ? oldDiagnostic.faces : Array.from({ length: previousBatch.faces.length }, () => null);
            const remainingFailures = missingIndexesFromIndependentResult({ html }, previousBatch.faces.length).map(index => ({
                ...(Array.isArray(oldDiagnostic.failedFaces) ? oldDiagnostic.failedFaces.find(face => face.faceIndex === index) : null),
                faceIndex: index, status: 'failed', code: String(oldDiagnostic.failedFaces?.find?.(face => face.faceIndex === index)?.code || 'incomplete-face'),
            }));
            result.requestDiagnostic = { ...oldDiagnostic, faces: oldFaces.map((face, i) => i === faceIndex ? { ...result.requestDiagnostic, faceIndex: i } : face), faceCount: previousBatch.faces.length, multifaceResayFace: faceIndex + 1,
                partial: remainingFailures.length > 0, failedFaces: remainingFailures, completedFaces: previousBatch.faces.length - remainingFailures.length };
        }
        clearAutomaticFailureStop(slot, sourceHash);
        if (settledSlot !== slot || settledSourceHash !== sourceHash)
            clearAutomaticFailureStop(settledSlot, settledSourceHash);
        let completedVisualScan = null;
        const scanningReplacement = multifaceResay && !result?.mergedFromMissingRetry;
        const historyFaceIndex = Array.isArray(result?.requestDiagnostic?.faces) ? result.requestDiagnostic.faces.findIndex(face => face?.visualHistoryId === result?.historySelection?.historyId) : -1;
        const completedFaceScans = [];
        const paletteFingerprint = commitIndependentVisualResult(scanningReplacement ? replacementVisualHtml : html, (scan, faceIndex) => {
            if (Number.isInteger(faceIndex) && faceIndex >= 0)
                completedFaceScans[faceIndex] = scan;
            if (scanningReplacement || !Array.isArray(result?.requestDiagnostic?.faces) || faceIndex === historyFaceIndex)
                completedVisualScan = scan;
        });
        if (result?.feedbackId && result?.feedbackPrompt) {
            const liveFeedback = getActiveFeedbackForCurrentChat(getContext().chat);
            if (liveFeedback?.id === result.feedbackId) {
                markFeedbackCatInjected(liveFeedback, 'independent', result.feedbackPrompt);
                consumeInjectedFeedbackForSuccessfulIndependentRabbitMirror(wrappedIndependentMirrorHtml(html), result.feedbackId);
            }
        }
        const initialHtml = scrubIndependentInteractionState(html, html);
        const completed = { html: initialHtml || html, initialHtml: '', sourceHash: settledSourceHash, bodyHash: settledBodyHash, displayHash: settledDisplayHash, reasoningHash: settledReasoningHash, paletteFingerprint, ts: Date.now(), model: st.independentApiModel, runtime: RUNTIME_VERSION, apiRequest: result?.requestDiagnostic || null, executionLockChars: Number(result?.executionLockChars || 0) };
        bindIndependentRecordContinuity(settledCtx, index, settledMsg, completed, null, { completed: true, commit: false });
        sealIndependentTextReplacementRecord(completed, settledSlot, replacementPreviousRecord, multifaceResay ? Number(multifaceResay.faceIndex) : null);
        if (!independentRecordWithinBudget(completed))
            throw independentMarkupLimitError('record-bytes', byteLength(completed.html), INDEPENDENT_RECORD_BUDGET_BYTES);
        if (!independentStoredHtmlRestorable(completed.html) || !prepareStoredIndependentRecordHtml(completed, settledSlot)) {
            flight.completedFaceRecord = completed;
            throw Object.assign(new Error(__rmT("WxIuVfvrrw9ZOMB_H_D9UxJiVIqllA1bMqFY0LfH8cfUp.5GK6AIpzAWueVLb2GgW1KWOJrK85a2mkLN1feLQv4jiu2c7uH7Ux4J1zNMqVmcTTNZlmD2rK0hgio21BYHFJoQzrcx1FT")), { code: 'RABBIT_MIRROR_STORED_UNRESTORABLE', requestCount: 1 });
        }
        bindIndependentRecordContinuity(settledCtx, index, settledMsg, completed, null, { completed: true });
        recordRabbitMirrorRecipe({ chat: settledCtx.chat, chatKey: chatKey(settledCtx), messageIndex: index, swipeId: swipeId(settledMsg), message: settledMsg, metadata: result?.requestDiagnostic || null, source: 'independent' });
        void import('../milestones.js?rmv=2.5.2').then(module => module.recordMirrorMilestone(`${settledSlot}:${completed.ts}`)).catch(() => { });
        const recipeDiagnostic = result?.requestDiagnostic || null;
        if (force && multifaceResay) {
            const resayFaceIndex = Number.isInteger(multifaceResay?.faceIndex) ? multifaceResay.faceIndex : 0;
            const faceHtml = stampFaceRecipe(replacementVisualHtml, faceRecipeFromDiagnostic(recipeDiagnostic, resayFaceIndex));
            const swipeSlot = messageBaseSlotKey(settledCtx, index, settledMsg) || baseSlot;
            if (swipeSlot && swipeSlot !== baseSlot) {
                const prior = readFaceSwipe(baseSlot, resayFaceIndex);
                if (prior.versions.length && !readFaceSwipe(swipeSlot, resayFaceIndex).versions.length)
                    writeFaceSwipe(swipeSlot, resayFaceIndex, prior);
            }
            appendIndependentFaceSwipe(swipeSlot, resayFaceIndex, faceHtml);
        }
        else {
            const swipeSlot = messageBaseSlotKey(settledCtx, index, settledMsg) || baseSlot;
            const faces = faceDetailsListFromHtml(completed.html);
            if (force && swipeSlot && swipeSlot !== baseSlot) {
                for (const face of faces) {
                    const prior = readFaceSwipe(baseSlot, face.index);
                    if (prior.versions.length && !readFaceSwipe(swipeSlot, face.index).versions.length)
                        writeFaceSwipe(swipeSlot, face.index, prior);
                }
            }
            if (force || readFaceSwipe(swipeSlot, 0).versions.length) {
                for (const face of faces)
                    appendIndependentFaceSwipe(swipeSlot, face.index, stampFaceRecipe(face.detailsHtml, faceRecipeFromDiagnostic(recipeDiagnostic, face.index)));
            }
            else
                seedIndependentFaceSwipes(swipeSlot, faces.reduce((html, face) => mergeFaceDetailsIntoHtml(html, face.index, stampFaceRecipe(face.detailsHtml, faceRecipeFromDiagnostic(recipeDiagnostic, face.index))), completed.html));
        }
        const next = readStore();
        saveRecordForSlot(next, settledSlot, completed);
        writeStore(next);
        setOwnerLockForBase(baseSlot, settledSlot, settledSourceHash);
        writePersistedOwner(settledCtx, index, settledMsg, completed, { overwrite: true });
        requestSafeChatSave(settledCtx, index, settledMsg, __rmT("WuiUJU8ECXzLgBZh"));
        flight.persisted = true;
        if (String(readStore()?.[settledSlot]?.html || '') !== completed.html)
            showIndependentUnsavedOutput(completed, settledSlot);
        const heldHistoryBatch = !result?.batchPlan && !scanningReplacement && flight.historyBatch ? flight.historyBatch : null;
        let heldCommitted = false;
        if (heldHistoryBatch) {
            const heldCount = Math.max(1, Number(heldHistoryBatch.requestedFaceCount) || 1);
            const heldMissing = new Set(missingIndexesFromIndependentResult(result, heldCount));
            const heldScans = Array.from({ length: heldCount }, (_, faceIndex) => !heldMissing.has(faceIndex) && completedFaceScans[faceIndex]
                ? { ...completedFaceScans[faceIndex], faceIndex } : null);
            flight.historyBatch = null;
            const heldTickets = Array.from({ length: heldCount }, (_, faceIndex) => Number.isInteger(heldHistoryBatch.chosenTickets?.[faceIndex]) ? heldHistoryBatch.chosenTickets[faceIndex] : null);
            const selection = result?.historySelection;
            if (selection?.atmosphereResolved === true && Array.isArray(selection.atmosphereMenu) && historyFaceIndex >= 0 && historyFaceIndex < heldCount) {
                const sameIds = (left, right) => JSON.stringify([...(left || [])]) === JSON.stringify([...(right || [])]);
                const choice = selection.atmosphereMenu.findIndex(ticket => sameIds(ticket?.themeIds, selection.themeIds) && sameIds(ticket?.formatIds, selection.formatIds));
                if (choice >= 0)
                    heldTickets[historyFaceIndex] = choice;
            }
            const heldPersisted = String(findSavedRecord(readStore(), settledSlot, settledIdentity.legacySlots || [])?.html || '') === String(completed.html || '');
            if (heldPersisted && heldScans.some(Boolean)) {
                heldCommitted = commitPendingComboBatch(heldScans, { batchId: heldHistoryBatch.batchId, identity: heldHistoryBatch.identity,
                    partial: heldScans.some(scan => !scan), chosenTickets: heldTickets });
                if (!heldCommitted && !selection)
                    globalThis.toastr?.warning?.(__rmT("fVgg5ST9sXTgLKePhJajdzvLg7G0I__ApBhN8FGbiwUtrvS4I7Yvaw1gKywqUrKAOyFzgZNKTtAvwVs7w8uL26aBWAT"));
            }
        }
        if (!heldCommitted && result?.historySelection && completedVisualScan && commitVisualHistorySelection(result.historySelection, completedVisualScan))
            lastComboHistoryWarning = null;
        else if (!heldCommitted && result?.historySelection && completedVisualScan) {
            const code = comboHistoryFailureCode() || 'unknown', why = describeComboHistoryFailure();
            if (code !== lastComboHistoryWarning) {
                lastComboHistoryWarning = code;
                globalThis.toastr?.warning?.(`${__rmT("dDAIE.d2bZoJ17zyg7K24L9Aulnkku1ORsJolJL3FebGQt81kx._gh")}${why ? __rmT("7ys") + why : __rmT("jzk")}${__rmT("4sp5rcujaKdKauRMqZxIwWoswBy57eInKnLspf")}`);
            }
        }
        markFreshDrawSlot(chatKey(settledCtx), index, swipeId(settledMsg), Number.isInteger(multifaceResay?.faceIndex) ? multifaceResay.faceIndex : null, {
            message: settledMsg, outputIdentity: completed.html,
            getOutputIdentity: () => persistedOwnerForMessage(settledCtx, settledCtx.chat.indexOf(settledMsg), settledMsg)?.html || '',
        });
        const liveEl = messageElement(index);
        let liveHost = null;
        if (liveEl) {
            liveHost = collapseDuplicateIdentityHosts(liveEl, settledKey, 'independent', settledSourceHash);
            const hostBeforeSwap = liveHost;
            if (hostBeforeSwap?.dataset)
                hostBeforeSwap.dataset.rmFaceRemountEpoch = String((Number(hostBeforeSwap.dataset.rmFaceRemountEpoch) || 0) + 1);
            const replacedOne = multifaceResay && liveHost
                ? replaceExternalMultifaceFace(liveHost, settledKey, 'independent', html, Number(multifaceResay.faceIndex), true) : false;
            if (replacedOne) {
                clearIndependentResayStatus(liveHost);
                liveHost.dataset.rmSourceHash = settledSourceHash;
                stampExternalDetailsOwnership(liveHost);
                markMountedFaceProofs(liveHost, 'independent', completed.apiRequest);
                attachIndependentUnsavedNotices(liveHost, settledKey, completed);
                scheduleExternalShellTint(liveHost, html);
                ensureExternalTools(liveHost);
                scheduleIndependentReadyPostprocess(liveHost, settledKey, html);
            }
            else {
                ensureExternalUi(liveEl, settledKey, completed.html, 'ready', 'independent', settledSourceHash, completed);
                liveHost = collapseDuplicateIdentityHosts(liveEl, settledKey, 'independent', settledSourceHash);
            }
            if (liveHost?.dataset && liveHost !== hostBeforeSwap)
                liveHost.dataset.rmFaceRemountEpoch = String((Number(liveHost.dataset.rmFaceRemountEpoch) || 0) + 1);
            const patrolSettings = getSettings();
            if (liveHost?.isConnected && patrolSettings.maintenanceRabbitEnabled !== false && patrolSettings.maintenanceRabbitAutoSafeEnabled === true && patrolSettings.maintenanceRabbitAutoSafeConsent === true) {
                const patrolHost = liveHost, patrolHash = String(settledSourceHash || '');
                setTimeout(() => {
                    if (!patrolHost?.isConnected || patrolHost.dataset.rmState !== 'ready' || (patrolHash && String(patrolHost.dataset.rmSourceHash || '') !== patrolHash))
                        return;
                    void import('../outputSanitizer/toolsChrome.js?rmv=2.5.2')
                        .then(module => module.installMaintenanceRabbitsInScope(patrolHost, { autoSafeForceCurrent: true }))
                        .catch(error => console.debug('[RabbitMirror] auto patrol after independent mirror skipped:', error));
                }, 600);
            }
        }
        evidenceMount(() => ({ outcome: liveHost?.isConnected ? 'mounted' : 'not-mounted', reason: liveEl ? (liveHost ? '' : 'no-host-after-mount') : 'message-not-in-dom',
            hostState: String(liveHost?.dataset?.rmState || ''), hostConnected: !!liveHost?.isConnected }));
        if (result?.batchPlan) {
            const persisted = findSavedRecord(readStore(), settledSlot, settledIdentity.legacySlots || []);
            const mountedFaces = externalFaceDetails(liveHost);
            const mountedSerialized = serializeExternalFaceDetails(liveHost);
            const mountedProtocol = parseMultifaceOutput(mountedSerialized, { expectedCount: Number(result.batchPlan.requestedFaceCount) });
            const persistenceComplete = String(persisted?.html || '') === String(completed.html || '')
                && independentStoredHtmlRestorable(String(persisted?.html || ''));
            const mountComplete = !liveEl || (liveHost?.dataset?.rmSourceHash === settledSourceHash
                && mountedFaces.length === Number(result.batchPlan.requestedFaceCount)
                && mountedFaces.every(face => usableReadyDetails(face))
                && mountedProtocol.ok);
            if (!persistenceComplete || !mountComplete) {
                console.warn('[RabbitMirror] multiface result accepted; deferred persistence/DOM reconciliation', { persistenceComplete, mountComplete, slot: settledSlot });
                globalThis.toastr?.warning?.(__rmT("B8JEgQQtm7c6M4q.K8K7coCAHEZl_kZyoRX8bay7rju9h9CpDZi8G44eIehQnxbjy49RgKq6PnOYoEHHK1IvacHarh1Pxo_fXaaRf7Y5FMX8.i_z"));
            }
            if (persistenceComplete && !commitPendingComboBatch(result.faceScans || [], { batchId: result.batchPlan.batchId, identity: result.batchPlan.identity, partial: !!result.failedFaces?.length, chosenTickets: result.chosenTickets })) {
                globalThis.toastr?.warning?.(__rmT("fVgg5ST9sXTgLKePhJajdzvLg7G0I__ApBhN8FGbiwUtrvS4I7Yvaw1gKywqUrKAOyFzgZNKTtAvwVs7w8uL26aBWAT"));
            }
        }
        settleStuckLoadingHost(flight, completed, settledSlot);
        flight.notice = { host: liveHost || null, failed: Array.isArray(result?.failedFaces) && result.failedFaces.length > 0 };
        flight.uiSettled = true;
        await saveFaceSwipeArchive(messageBaseSlotKey(settledCtx, index, settledMsg), persistedOwnerForMessage(settledCtx, index, settledMsg) || completed);
        return completed;
    };
    const settleIndependentFailure = (err) => {
        if (flight.timedOut && stillCurrent()) {
            err = flight.timeoutError || err;
        }
        else if (flight.controller.signal.aborted || !stillCurrent()) {
            stale = true;
            settleCancelledIndependentFlightUi(flight, flight.cancelReason || 'stale-owner');
            return;
        }
        const failedIdentity = currentIdentityForFlight();
        if (!failedIdentity) {
            stale = true;
            settleCancelledIndependentFlightUi(flight, 'stale-owner');
            return;
        }
        const failedKey = failedIdentity.key, failedHash = failedIdentity.sourceHash;
        const liveEl = messageElement(index);
        const liveHost = liveEl ? collapseDuplicateIdentityHosts(liveEl, failedKey, 'independent', failedHash) : null;
        const keptReady = !!readyDetailsFromHost(liveHost);
        const failedPosts = Math.max(Number(dispatchLease?.consumeCount?.() || 0), Number(flight.automaticRerollCount || 0));
        let failureMessage = String(err?.message || err || 'generation-failed');
        if (manualResay && !flight.completedFaceRecord)
            failureMessage += __rmT("3I1COu5srXFcpONU8OAxyNBG2OVLBB4FahTbeBWFdl8ZZr4MpXqFbq5X");
        const rerollMax = manualResay ? 0 : independentRerollMax();
        if (shouldAnnounceAutomaticRerollExhausted({ complete: false, failedPosts, max: rerollMax, cancelled: !!flight.cancelled })) {
            failureMessage = `${failureMessage} ${automaticRerollExhaustedNote(rerollMax)}`;
        }
        const terminalDiagnostic = republishIndependentTerminalFailure(failedIdentity.ctx, index, failedIdentity.msg, failedHash, baseSlot, operationEpoch, err, dispatchLease);
        markAutomaticFailureStop(failedIdentity.slot, failedHash, 'generation-failed', {
            baseSlot, operationEpoch,
            message: failureMessage,
            code: String(terminalDiagnostic?.terminalErrorCode || err?.code || 'independent-generation-failed'),
            semanticFailure: String(terminalDiagnostic?.semanticFailure || ''),
            terminalStage: String(terminalDiagnostic?.terminalStage || 'postprocess'),
            terminalFace: terminalDiagnostic?.terminalFace,
            requestCount: terminalDiagnostic?.requestCount || failedPosts,
            protocolErrorCode: terminalDiagnostic?.protocolErrorCode,
            protocolOffset: terminalDiagnostic?.protocolOffset,
        });
        console.error('[RabbitMirror] independent generation failed', err);
        if (flight.completedFaceRecord) {
            const keptReady = !!(liveHost && liveHost.dataset?.rmState !== 'loading' && externalFaceDetails(liveHost).length && externalFaceDetails(liveHost).every(usableReadyDetails));
            if (keptReady) {
                liveHost.dataset.rmState = 'ready';
                clearIndependentResayStatus(liveHost);
            }
            else if (liveEl && previousReadyRecord?.html && !liveHost)
                ensureExternalUi(liveEl, failedKey, previousReadyRecord.html, 'ready', 'independent', failedHash, previousReadyRecord);
            else if (liveEl)
                ensureExternalUi(liveEl, failedKey, failureMessage, 'error', 'independent', failedHash);
            showIndependentUnsavedOutput(flight.completedFaceRecord, failedIdentity.slot, { unmerged: !!multifaceResay });
            flight.notice = { host: liveHost || null, failed: true };
            flight.uiSettled = true;
            globalThis.toastr?.warning?.(multifaceResay ? __rmT("tIkvRiMAkR8Y2XUCTD83uSS2f9kk8RBD1MSvT3D8zKmQ_Vr7FjKS3QecOFPG2bFIqX9xrQ2rPHVvOEkK4RrP2LGu") : __rmT("v6uz558HShiIWvGwof4UnRlLU_k2NzQjZEaVmc9jiRnl3UhgtXybPHJfQ3Bci8m1jLf5Z_jm1MKXBmdV_2UMS_FxWlU7B.jqWBFNMfucfd9o.k"));
            return;
        }
        if (liveEl) {
            if (force && previousReadyRecord?.html) {
                const currentHost = collapseDuplicateIdentityHosts(liveEl, failedKey, 'independent', failedHash) || liveHost;
                if (currentHost) {
                    currentHost.dataset.rmState = 'ready';
                    clearIndependentResayStatus(currentHost);
                    const faceIndex = Number.isInteger(multifaceResay?.faceIndex) ? multifaceResay.faceIndex : 0;
                    const overlayRoot = externalFaceDetails(currentHost)[currentHost && externalFaceDetails(currentHost).length > 1 ? faceIndex : 0] || currentHost;
                    showEphemeralFaceFailure(currentHost, faceIndex, failureMessage, () => { void import('../outputSanitizer/toolsChrome.js?rmv=2.5.2').then(module => module.openRabbitMirrorResayChooser(overlayRoot)).catch(() => globalThis.toastr?.warning?.(__rmT("Qpl_vG7HBRK8aT5PZ2ApY1YuYGFaQMxLx7YyEINjKZ_.QzQX"))); }, () => { applyIndependentFaceSwipe(overlayRoot, readFaceSwipe(independentSwipeSlot(failedIdentity), faceIndex).currentIndex); });
                }
                else {
                    ensureExternalUi(liveEl, failedKey, previousReadyRecord.html, 'ready', 'independent', failedHash, previousReadyRecord);
                }
                flight.notice = { host: currentHost || null, failed: true };
                flight.uiSettled = true;
                toastr?.error?.(failureMessage);
            }
            else if (keptReady) {
                clearIndependentResayStatus(liveHost);
                liveHost.dataset.rmState = 'ready';
                flight.notice = { host: liveHost, failed: true };
                flight.uiSettled = true;
                toastr?.error?.(failureMessage);
            }
            else {
                ensureExternalUi(liveEl, failedKey, failureMessage, 'error', 'independent', failedHash);
                flight.notice = { host: null, failed: true };
                flight.uiSettled = true;
            }
        }
    };
    const captureRecipes = (result, err) => {
        const diagnostic = result?.requestDiagnostic || err?.rabbitMirrorRequestDiagnostic;
        if (!diagnostic)
            return;
        const indexes = flight.missingIndexes?.length ? flight.missingIndexes : Array.from({ length: flight.expectedFaceCount }, (_, index) => index);
        flight.faceRecipes = mergeRetrySelectionDiagnostic(flight.faceRecipes, diagnostic, indexes, flight.expectedFaceCount).faces;
    };
    const independentDiagnostic = (err, result) => result?.requestDiagnostic || err?.rabbitMirrorRequestDiagnostic || {};
    const canReroll = (err, result, missing) => {
        const diagnostic = independentDiagnostic(err, result);
        const failedPosts = Math.max(0, Number(dispatchLease?.consumeCount?.() || 0));
        flight.automaticRerollCount = failedPosts;
        if (flight.persisted)
            return false;
        return diagnostic.serialStopped !== true && shouldAutomaticReroll({
            manualResay,
            complete: !missing.length,
            failedPosts,
            max: independentRerollMax(),
            timedOut: !!flight.timedOut,
            cancelled: !!flight.cancelled,
            stale: !stillCurrent(),
            preflight: failedPosts <= Number(flight.attemptToken?.consumeCountAtStart || 0) || isLocalPreflightFailure(err, diagnostic),
            quotaInsufficient: isQuotaInsufficientFailure(err, diagnostic),
        }) && !isNonRetryableRequestFailure(err, diagnostic) && stillCurrent();
    };
    const beginAutomaticReroll = (missing, html, identity, statusHost) => {
        flight.missingIndexes = missing;
        if (html)
            flight.retainedHtml = html;
        try {
            flight.deadline?.clear?.();
        }
        catch { }
        try {
            flight.controller = new AbortController();
        }
        catch { }
        flight.stalled = false;
        flight.timedOut = false;
        flight.timeoutError = null;
        const liveEl = statusHost || messageElement(index);
        if (liveEl && identity) {
            if (html)
                ensureExternalUi(liveEl, identity.key, html, 'ready', 'independent', identity.sourceHash);
            const status = automaticRerollStatusText(flight.automaticRerollCount, independentRerollMax(), missing.length);
            flight.loadingHost = ensureExternalUi(liveEl, identity.key, status, 'loading', 'independent', identity.sourceHash);
        }
    };
    const holdHistoryBatch = (plan, chosenTickets = null, { replace = false } = {}) => {
        if (!plan?.batchId || !plan?.identity || flight.expectedFaceCount < 2)
            return;
        if (flight.historyBatch && !(replace && flight.historyBatch.batchId !== plan.batchId))
            return;
        flight.historyBatch = { batchId: plan.batchId, identity: { ...plan.identity },
            requestedFaceCount: Number(plan.requestedFaceCount) || flight.expectedFaceCount,
            chosenTickets: Array.isArray(chosenTickets) ? [...chosenTickets] : null };
    };
    const task = (async () => {
        while (true) {
            try {
                const result = await dispatchAttempt();
                flight.progress?.finishing();
                captureRecipes(result, null);
                if (result?.skipped)
                    return await settleSuccessfulIndependentResult(result);
                let merged = result;
                if (flight.retainedHtml && flight.missingIndexes?.length) {
                    merged = { ...result, ...mergeMissingIndependentFaces(flight.retainedHtml, flight.expectedFaceCount, flight.missingIndexes, result) };
                    merged.requestDiagnostic = mergeRetrySelectionDiagnostic(flight.faceRecipes, result?.requestDiagnostic, flight.missingIndexes, flight.expectedFaceCount, merged.failedFaces);
                }
                else if (Array.isArray(result?.failedFaces) && result.failedFaces.length && flight.expectedFaceCount > 1) {
                    flight.retainedHtml = String(result.html || '');
                }
                const missing = missingIndexesFromIndependentResult(merged, flight.expectedFaceCount, flight.missingIndexes || []);
                if (missing.length) {
                    if (canReroll(null, merged, missing)) {
                        holdHistoryBatch(result?.batchPlan, result?.chosenTickets, { replace: true });
                        flight.holdHistoryBatchForReroll = true;
                        beginAutomaticReroll(missing, merged.html, currentIdentityForFlight());
                        continue;
                    }
                    if ((merged.completedFaces || 0) > 0 || /<details\b/i.test(String(merged.html || ''))) {
                        return await settleSuccessfulIndependentResult(merged);
                    }
                }
                return await settleSuccessfulIndependentResult(merged);
            }
            catch (err) {
                if (flight.cancelled || !stillCurrent()) {
                    stale = true;
                    settleCancelledIndependentFlightUi(flight, flight.cancelReason || 'stale-owner');
                    return;
                }
                if (flight.timedOut || flight.stalled)
                    err = flight.timeoutError || err;
                captureRecipes(null, err);
                if (flight.serialPartial && !flight.retainedHtml && !flight.missingIndexes?.length
                    && flight.serialPartial.missing.length && /<details\b/i.test(flight.serialPartial.html)) {
                    flight.retainedHtml = flight.serialPartial.html;
                    flight.missingIndexes = flight.serialPartial.missing;
                }
                flight.serialPartial = null;
                const failedIdentity = currentIdentityForFlight();
                if (!failedIdentity) {
                    stale = true;
                    settleCancelledIndependentFlightUi(flight, 'stale-owner');
                    return;
                }
                const missing = flight.missingIndexes?.length
                    ? flight.missingIndexes
                    : Array.from({ length: flight.expectedFaceCount }, (_, index) => index);
                if (canReroll(err, null, missing)) {
                    holdHistoryBatch(flight.batchPlan);
                    flight.holdHistoryBatchForReroll = true;
                    beginAutomaticReroll(missing, flight.retainedHtml, failedIdentity);
                    continue;
                }
                if (flight.retainedHtml && /<details\b/i.test(flight.retainedHtml)) {
                    holdHistoryBatch(flight.batchPlan);
                    return await settleSuccessfulIndependentResult({
                        html: flight.retainedHtml,
                        requestDiagnostic: mergeRetrySelectionDiagnostic(flight.faceRecipes, independentDiagnostic(err, null), [], flight.expectedFaceCount, missing.map(faceIndex => ({ faceIndex, status: 'failed', code: String(err?.code || 'incomplete-face') }))),
                        failedFaces: missing.map(faceIndex => ({ faceIndex, status: 'failed', code: String(err?.code || 'incomplete-face') })),
                        completedFaces: Math.max(0, flight.expectedFaceCount - missing.length),
                        mergedFromMissingRetry: true,
                    });
                }
                settleIndependentFailure(err);
                return;
            }
            finally {
                flight.attemptToken = null;
                flight.cancelAttempt = null;
                flight.deadline?.clear?.();
                flight.deadline = null;
                releaseIndependentFlightBatches(flight, { keepBatchId: flight.holdHistoryBatchForReroll ? flight.historyBatch?.batchId || '' : '' });
                flight.holdHistoryBatchForReroll = false;
                flight.batchPlan = null;
            }
        }
    })().finally(() => {
        try {
            flight.progress?.stop();
        }
        catch { }
        flight.progress = null;
        flight.historyBatch = null;
        releaseIndependentFlightBatches(flight);
        try {
            dispatchLease.release?.();
        }
        catch { }
        flight.deadline?.clear?.();
        flight.deadline = null;
        if (pending.get(slot)?.runId === runId)
            pending.delete(slot);
        if (globalFlights().get(flightKey) === flight)
            globalFlights().delete(flightKey);
        if (flight.loadingHost?.isConnected && flight.loadingHost.dataset?.rmState === 'loading') {
            if (!settleCancelledIndependentFlightUi(flight, flight.cancelReason || 'request-ended-without-terminal-ui'))
                settleStuckLoadingHost(flight, flight.completedFaceRecord || null);
        }
        queueMessageSync([index]);
        if (!flight.cancelled && flight.notice && typeof setTimeout === 'function') {
            const notice = flight.notice, noticeChat = ctx.chat;
            const resayFace = Number.isInteger(multifaceResay?.faceIndex) ? multifaceResay.faceIndex : -1;
            setTimeout(() => {
                try {
                    if (getContext().chat !== noticeChat)
                        return;
                    const liveEl = messageElement(index);
                    const host = notice.host?.isConnected ? notice.host : (liveEl ? matchingExternalHosts(liveEl, '', 'independent')[0] || null : null);
                    if (!host?.isConnected)
                        return;
                    const state = String(host.dataset?.rmState || '');
                    if (state !== 'ready' && state !== 'error')
                        return;
                    const faces = externalFaceDetails(host);
                    const face = resayFace >= 0 && faces.length > 1 ? faces[resayFace] : null;
                    const entry = face ? { el: face, anchor: host, reveal: () => showMultifaceFace(host, resayFace) } : host;
                    void import('../readyNotice.js?rmv=2.5.2').then(module => module.noteFacesReady([entry], { failed: notice.failed })).catch(() => { });
                }
                catch { }
            }, 700);
        }
    });
    flight.task = task;
    await task;
}
function independentHostForRoot(root) {
    if (!root)
        return null;
    const candidates = [];
    const add = node => { if (node && !candidates.includes(node))
        candidates.push(node); };
    add(root?.matches?.(`[${SOURCE_ATTR}]`) ? root : null);
    add(root?.closest?.(`[${SOURCE_ATTR}]`));
    add(root?.querySelector?.(`[${SOURCE_ATTR}][data-rm-source="independent"]`));
    const details = root?.matches?.('details') ? root : root?.closest?.('details') || root?.querySelector?.('details');
    add(details?.parentElement?.matches?.(`[${SOURCE_ATTR}]`) ? details.parentElement : null);
    const ownerKey = String(details?.dataset?.rabbitMirrorOwnerKey || details?.dataset?.rabbitMirrorExternalOwner || '');
    if (ownerKey)
        add(allExternalHosts().find(host => host.dataset.rmKey === ownerKey));
    const ownerMesid = Number(details?.dataset?.rabbitMirrorOwnerMesid);
    if (Number.isInteger(ownerMesid) && ownerMesid >= 0)
        add(externalHostsOwnedByMesid(String(ownerMesid)).find(host => host.dataset.rmSource === 'independent'));
    return candidates.find(host => host?.dataset?.rmSource === 'independent') || null;
}
export function messageIndexForExternalHost(host) {
    if (!host)
        return null;
    const ctx = getContext();
    const owner = String(host.dataset?.rmOwnerMesid || host.dataset?.rmExternalOwnerMessage || '').trim();
    if (/^\d+$/.test(owner)) {
        const index = Number(owner);
        if (Number.isInteger(index) && index >= 0 && isRabbitMirrorEligibleAssistantMessage(ctx.chat?.[index]))
            return index;
    }
    const ownerEl = host.closest?.('.mes[mesid], [mesid].mes') || host.parentElement?.closest?.('.mes[mesid], [mesid].mes');
    const mesid = String(ownerEl?.getAttribute?.('mesid') || '').trim();
    if (/^\d+$/.test(mesid)) {
        const index = Number(mesid);
        if (Number.isInteger(index) && index >= 0 && isRabbitMirrorEligibleAssistantMessage(ctx.chat?.[index]))
            return index;
    }
    const key = String(host.dataset?.rmKey || '');
    const match = key.match(/(?:^|:)(\d+):(\d+)$/);
    if (match) {
        const index = Number(match[1]);
        if (Number.isInteger(index) && index >= 0 && isRabbitMirrorEligibleAssistantMessage(ctx.chat?.[index]))
            return index;
    }
    return null;
}
function actionOwnerMetadata(root, owner = {}) {
    const details = root?.matches?.('details') ? root : root?.closest?.('details') || root?.querySelector?.('details');
    const numeric = value => { const n = Number(value); return Number.isInteger(n) && n >= 0 ? n : null; };
    return {
        chat: String(owner?.chat || owner?.ownerChat || details?.dataset?.rabbitMirrorOwnerChat || ''),
        mesid: numeric(owner?.mesid ?? owner?.messageId ?? owner?.index ?? details?.dataset?.rabbitMirrorOwnerMesid),
        swipe: numeric(owner?.swipe ?? details?.dataset?.rabbitMirrorOwnerSwipe),
        key: String(owner?.key || details?.dataset?.rabbitMirrorOwnerKey || details?.dataset?.rabbitMirrorExternalOwner || ''),
        sourceHash: String(owner?.sourceHash || details?.dataset?.rabbitMirrorOwnerSourceHash || ''),
    };
}
export function parseMessageIndexFromOwnerKey(key = '') {
    const parts = String(key || '').split(':').filter(Boolean);
    if (parts.length < 2)
        return null;
    const numeric = value => /^\d+$/.test(String(value || ''));
    if (parts.length >= 4 && numeric(parts.at(-3)) && numeric(parts.at(-2))) {
        const sourceHash = String(parts.at(-1) || '');
        if (/^[a-z0-9]+$/i.test(sourceHash))
            return { index: Number(parts.at(-3)), swipe: Number(parts.at(-2)), sourceHash };
    }
    if (numeric(parts.at(-2)) && numeric(parts.at(-1)))
        return { index: Number(parts.at(-2)), swipe: Number(parts.at(-1)), sourceHash: '' };
    return null;
}
export function resolveIndependentActionIdentity(root, owner = {}, { allowPassiveErrorRetry = false, allowEditedSource = false } = {}) {
    const ctx = getContext();
    const meta = actionOwnerMetadata(root, owner);
    let host = independentHostForRoot(root);
    if (!host) {
        host = allExternalHosts().find(candidate => candidate.dataset.rmSource === 'independent'
            && (meta.mesid === null || Number(candidate.dataset.rmOwnerMesid) === meta.mesid)
            && (!meta.key || candidate.dataset.rmKey === meta.key)) || null;
    }
    let index = messageIndexForExternalHost(host);
    if (index === null && meta.mesid !== null)
        index = meta.mesid;
    if (index === null) {
        const parsedKey = parseMessageIndexFromOwnerKey(meta.key);
        if (parsedKey)
            index = parsedKey.index;
    }
    if (index === null) {
        const messageNode = root?.closest?.('.mes[mesid], [mesid].mes');
        const parsed = Number(messageNode?.getAttribute?.('mesid'));
        if (Number.isInteger(parsed) && parsed >= 0)
            index = parsed;
    }
    if (index === null || !isRabbitMirrorEligibleAssistantMessage(ctx.chat?.[index]))
        return null;
    const currentChat = chatKey(ctx);
    const legacyChat = legacyChatKey(ctx);
    const acceptedChats = new Set([currentChat, legacyChat].filter(Boolean));
    const hostChat = String(host?.dataset?.rmOwnerChat || '').trim();
    if (meta.chat && !acceptedChats.has(meta.chat))
        return null;
    if (hostChat && !acceptedChats.has(hostChat))
        return null;
    const msg = ctx.chat[index];
    const currentSwipe = swipeId(msg);
    const currentKey = recordKey(ctx, index, msg);
    const parsedOwnerKey = parseMessageIndexFromOwnerKey(meta.key);
    const ownerSwipe = Number.isInteger(parsedOwnerKey?.swipe) ? parsedOwnerKey.swipe : meta.swipe;
    if (Number.isInteger(ownerSwipe) && ownerSwipe !== currentSwipe)
        return null;
    const ownerSourceHash = String(parsedOwnerKey?.sourceHash || meta.sourceHash || host?.dataset?.rmSourceHash || '').trim();
    const currentSourceHash = messageSourceFingerprint(msg);
    const terminalFailure = allowPassiveErrorRetry && host?.dataset?.rmState === 'error' && ownerSourceHash && ownerSourceHash !== currentSourceHash
        ? passiveIndependentFailureForIdentity(ctx, index, msg, host) : null;
    const passiveErrorRetry = !!terminalFailure && ownerSourceHash === terminalFailure.sourceHash
        && (!meta.key || meta.key === terminalFailure.slot);
    const editedSource = allowEditedSource && !passiveErrorRetry && !!ownerSourceHash && ownerSourceHash !== currentSourceHash
        && host?.dataset?.rmSource === 'independent' && host?.dataset?.rmState === 'ready'
        && messageIndexForExternalHost(host) === index;
    if (ownerSourceHash && ownerSourceHash !== currentSourceHash && !passiveErrorRetry && !editedSource)
        return null;
    if (meta.key && meta.key !== currentKey && !passiveErrorRetry && !editedSource) {
        const baseSuffix = `:${index}:${currentSwipe}`;
        const fullSuffix = `${baseSuffix}:${currentSourceHash}`;
        if (!meta.key.endsWith(baseSuffix) && !meta.key.endsWith(fullSuffix))
            return null;
    }
    const faces = externalFaceDetails(host);
    const requestedDetails = root?.matches?.('details') ? root : root?.closest?.('details') || root?.querySelector?.('details');
    const faceIndex = faces.length > 1 ? faces.findIndex(face => face === requestedDetails || face.contains?.(requestedDetails)) : -1;
    return { ctx, msg, index, host, slot: messageSlotKey(ctx, index, msg), baseSlot: messageBaseSlotKey(ctx, index, msg), legacySlots: legacyMessageSlotKeys(ctx, index, msg), key: currentKey, faceIndex,
        ...(editedSource ? { editedSource: true, staleSourceHash: ownerSourceHash } : {}) };
}
function adoptEditedIndependentMirror(identity) {
    const { ctx, index, msg, host } = identity || {};
    if (!identity?.editedSource || !host?.isConnected || ctx?.chat?.[index] !== msg)
        return false;
    if (hostGenerationLooksActive())
        return false;
    const persisted = persistedOwnerForMessage(ctx, index, msg);
    let record = persisted && !persisted.deleted && persisted.html && independentStoredHtmlRestorable(persisted.html) ? { ...persisted } : null;
    if (!record) {
        const ready = readyRecordFromHost(host, passiveObservedIdentity(ctx, index, msg), getSettings().independentApiModel);
        record = ready?.html ? { ...ready } : null;
    }
    if (!record?.html)
        return false;
    const sourceHash = messageSourceFingerprint(msg);
    const slot = messageSlotKey(ctx, index, msg);
    delete record.ownerLineage;
    record.sourceHash = sourceHash;
    record.bodyHash = sourceHash;
    record.ts = Date.now();
    const store = readStore();
    saveRecordForSlot(store, slot, record, { dropLegacy: false });
    writePersistedOwner(ctx, index, msg, record, { overwrite: true });
    requestSafeChatSave(ctx, index, msg, __rmT("YFxCzNCPfsbryg9S"));
    if (!writeStore(store)) {
        if (!writtenToChatMetadata(ctx, index, msg, record.html, sourceHash))
            return false;
        if (!savedInChatFile(ctx, index, msg, record.html, sourceHash))
            showIndependentUnsavedOutput(record, slot);
    }
    setOwnerLockForBase(identity.baseSlot, slot, sourceHash);
    host.dataset.rmKey = slot;
    host.dataset.rmSourceHash = sourceHash;
    for (const details of host.querySelectorAll('details')) {
        if (details.dataset.rabbitMirrorOwnerKey)
            details.dataset.rabbitMirrorOwnerKey = slot;
        if (details.dataset.rabbitMirrorExternalOwner)
            details.dataset.rabbitMirrorExternalOwner = slot;
        if (details.dataset.rabbitMirrorOwnerSourceHash)
            details.dataset.rabbitMirrorOwnerSourceHash = sourceHash;
    }
    return true;
}
function closeIndependentHistoryPanel() {
    document.querySelectorAll?.(`[${HISTORY_PANEL_ATTR}]`)?.forEach(panel => panel.remove());
}
async function findMovedIndependentRecord(ctx, index, msg) {
    if (!String(msg?.mes || '').trim())
        return { picked: null };
    const observed = passiveObservedIdentity(ctx, index, msg);
    const key = chatKey(ctx), prefix = `${key}:`;
    const place = slot => { const parts = String(slot).slice(prefix.length).split(':'); return { index: Number(parts[0]), swipe: Number(parts[1]) || 0 }; };
    const candidates = [];
    for (const [slot, record] of Object.entries(readStore()))
        if (slot.startsWith(prefix))
            candidates.push({ record, from: place(slot), states: record?.faceSwipes });
    for (const entry of chatPersistedOwnerEntries(ctx))
        candidates.push({ record: entry.record, from: { index: entry.index, swipe: entry.swipe }, states: entry.record.faceSwipes });
    for (const entry of chatMovedOwners(ctx))
        candidates.push({ record: entry.record, from: { index: null, swipe: 0, moved: entry.hash }, states: entry.record.faceSwipes });
    const rows = await loadFaceSwipeArchiveRows(key);
    const ownBase = messageBaseSlotKey(ctx, index, msg);
    let occupantRow = null;
    for (const row of rows || []) {
        if (!String(row.slot).startsWith(prefix))
            continue;
        if (row.slot === ownBase)
            occupantRow = row;
        candidates.push({ record: row.record, from: place(row.slot), states: row.states });
    }
    const hashesOf = other => other ? [messageSourceFingerprint(other), ...legacyMessageSourceFingerprints(other)] : [];
    const mine = new Set(hashesOf(msg));
    const restorable = html => independentStoredHtmlRestorable(html);
    const picked = pickMovedIndependentRecord(candidates, { index,
        matches: record => savedRecordMatchesObserved(record, observed) || mine.has(String(record.sourceHash || '')) || mine.has(String(record.bodyHash || '')),
        ownHashes: floor => hashesOf(ctx.chat?.[floor]),
        restorable });
    if (picked)
        return { picked, occupantRow, archiveError: rows === null };
    const otherHashes = (ctx.chat || []).flatMap((other, floor) => floor === Number(index) ? [] : hashesOf(other));
    const stale = pickOwnStaleRecord(candidates, { index, otherHashes, restorable });
    return { picked: stale ? { ...stale, edited: true } : null, occupantRow, archiveError: rows === null };
}
function adoptMovedIndependentRecord(ctx, index, msg, picked, occupantRow) {
    const sourceHash = messageSourceFingerprint(msg);
    const base = messageBaseSlotKey(ctx, index, msg);
    const occupants = [persistedOwnerForMessage(ctx, index, msg),
        occupantRow?.record ? { ...occupantRow.record, faceSwipes: occupantRow.states } : null];
    for (const occupant of occupants) {
        if (!occupant?.html || occupant.deleted)
            continue;
        const hash = String(occupant.sourceHash || occupant.bodyHash || '');
        if (!hash || hash === sourceHash || String(occupant.html) === String(picked.record.html))
            continue;
        const settled = (ctx.chat || []).some((other, floor) => floor !== Number(index) && other && [messageSourceFingerprint(other), ...legacyMessageSourceFingerprints(other)].includes(hash)
            && String(persistedOwnerForMessage(ctx, floor, other)?.html || '') === String(occupant.html));
        if (settled)
            continue;
        const versions = occupant.faceSwipes && Object.keys(occupant.faceSwipes).length ? occupant.faceSwipes : snapshotFaceSwipes(base);
        if (!saveMovedOwner(ctx, { ...occupant, faceSwipes: versions }))
            return null;
    }
    for (let face = 0; face < 5; face += 1)
        writeFaceSwipe(base, face, emptySwipeState());
    if (picked.states && Object.keys(picked.states).length)
        restoreFaceSwipeSnapshot(base, picked.states);
    else
        seedIndependentFaceSwipes(base, picked.record.html);
    const next = { ...picked.record, sourceHash, bodyHash: sourceHash, ts: Date.now(), faceSwipes: snapshotFaceSwipes(base) };
    delete next.ownerLineage;
    delete next.deleted;
    const store = readStore();
    saveRecordForSlot(store, messageSlotKey(ctx, index, msg), next, { dropLegacy: false });
    writeStore(store);
    writePersistedOwner(ctx, index, msg, next, { overwrite: true });
    if (picked.from?.moved)
        dropMovedOwner(ctx, picked.from.moved);
    requestSafeChatSave(ctx, index, msg, __rmT("YFxCzNCPfsbryg9S"));
    return next;
}
export const movedRecoveryForTests = Object.freeze({ findMovedIndependentRecord, adoptMovedIndependentRecord });
const savedMirrorRecoveries = new WeakMap();
export function recoverSavedIndependentMirror(root, owner = {}) {
    const identity = resolveIndependentActionIdentity(root, owner);
    const result = (status, message) => ({ status, message });
    if (!identity?.host?.isConnected || !currentRuntime() || runtimeMode() === 'off')
        return Promise.resolve(result('stale', __rmT("W8l_iKd26oA71UJ5b65w1a.G_.W.UoD_O_t0xpuAEV_25ktQG0Ar7f")));
    const { ctx, index, msg, host, baseSlot } = identity;
    if (savedMirrorRecoveries.has(host))
        return savedMirrorRecoveries.get(host);
    const sourceHash = messageSourceFingerprint(msg), swipe = swipeId(msg), startMode = runtimeMode();
    const current = () => {
        const live = getContext();
        return currentRuntime() && runtimeMode() === startMode && host.isConnected
            && live.chat === ctx.chat && live.chat?.[index] === msg
            && chatKey(live) === chatKey(ctx) && messageBaseSlotKey(live, index, msg) === baseSlot
            && swipeId(msg) === swipe && messageSourceFingerprint(msg) === sourceHash
            && resolveIndependentActionIdentity(host, owner)?.host === host;
    };
    const busy = () => hostGenerationLooksActive() || !!activeIndependentFlightForBase(baseSlot)
        || generationPolls.has(generationPollKey(index));
    const recovery = (async () => {
        if (busy())
            return result('busy', __rmT("IAMVE14uLowzR_.LtE1kAfkOvP5pBGgYSunXYGWFxso1bzmRhiUwBq5X"));
        if (persistedOwnerForMessage(ctx, index, msg)?.deleted)
            return result('deleted', __rmT("01N6uWAqH9.cAao_0yjCh55lqqG2cf3iwDKGseWA9ay.bh"));
        const candidate = () => {
            const observed = passiveObservedIdentity(ctx, index, msg), store = readStore();
            const saved = savedIndependentRecordForOwner(ctx, index, msg, store, observed)
                || recoverSavedRecord(store, observed.slot, observed, { lightweight: true }).saved;
            return saved?.html && savedRecordMatchesObserved(saved, observed) ? saved : null;
        };
        let record = candidate();
        if (!record) {
            await restoreIndependentHistory(ctx, index, msg, { retry: true });
            if (!current())
                return result('stale', __rmT("z_45.0NESZ3TBCJ8A0yrOSyL0A8F3PAVOBSRBlQ932P92VZJE1GYa_lqKoi4EcYVe4adXHGP"));
            if (busy())
                return result('busy', __rmT("2gJU9I6du5gT1YNsfGImOdKQMWQRfAatpO0SXjb1YPQt6BWNquvFUJR8LMPSktdDWUE"));
            if (persistedOwnerForMessage(ctx, index, msg)?.deleted)
                return result('deleted', __rmT("01N6uWAqH9.cAao_0yjCh55lqqG2cf3iwDKGseWA9ay.bh"));
            record = candidate();
        }
        let movedFrom = null, archiveError = false, editedBody = false;
        if (!record) {
            const moved = await findMovedIndependentRecord(ctx, index, msg);
            if (!current())
                return result('stale', __rmT("z_45.0NESZ3TBCJ8A0yrOSyL0A8F3PAVOBSRBlQ932P92VZJE1GYa_lqKoi4EcYVe4adXHGP"));
            if (busy())
                return result('busy', __rmT("2gJU9I6du5gT1YNsfGImOdKQMWQRfAatpO0SXjb1YPQt6BWNquvFUJR8LMPSktdDWUE"));
            if (persistedOwnerForMessage(ctx, index, msg)?.deleted)
                return result('deleted', __rmT("01N6uWAqH9.cAao_0yjCh55lqqG2cf3iwDKGseWA9ay.bh"));
            archiveError = !!moved.archiveError;
            if (moved.picked) {
                record = adoptMovedIndependentRecord(ctx, index, msg, moved.picked, moved.occupantRow);
                if (!record)
                    return result('unrenderable', __rmT("4ZbXB_Qw9C9UxYxMMt8alaB9sTvPagsIlwX1IdhmcWgTCrYO5riHS6vrC2p0MsALZeEAU6nYw0HzrciytsGH8MxxtXipVYjs_gViMbn04uehIVMLEq74zDUt"));
                movedFrom = moved.picked.from.index;
                if (moved.picked.edited)
                    editedBody = true;
            }
        }
        if (!current())
            return result('stale', __rmT("I9NjYqAqH9E4XQFgqRK8HEnRP2s2cf3i9LSSTg6V1ar.bh"));
        if (!record) {
            return archiveError || independentHistoryReadState(ctx, index, msg) === 'error'
                ? result('read-error', __rmT("uEKefhuN1ZuORiFNZaBueA5jJ4SmQYmynPul6GnGKokV54ftxwMkYZlR2dQsvgttNXSxQdCU5ZhLTxxbfuxgyS5nv5Qq_zMtIP01ILrwOrOYqpGYLGT0if"))
                : result('missing', __rmT("yHd13KVGPdtuePES7Oz9sRXW8OJK_H4miC01zmmlcNl1zmC2YFsDXfNRfKn3XWqHY1V.oV1QWaGRfqW0uYIzio_Sws_.MXAsA1tYG.ULdiC4UFPu8Bj33N_u1E9qrjGIh9ZY9VAc"));
        }
        const mounted = ensureExternalUi(messageElement(index), identity.key, record.html, 'ready', 'independent', sourceHash, record);
        if (!mounted || mounted.dataset.rmState !== 'ready' || !externalFaceDetails(mounted).length)
            return result('unrenderable', __rmT("EVqI10ggYbL0HZQsGzFHsJ8CR6WjNbxnDiSUC5m04c6JUPbDx5M8LxsWbTfjcWXTX7SbE0FdY3Y"));
        clearAutomaticFailureStop(identity.slot, sourceHash);
        delete mounted.dataset.rmMissingShellRetry;
        clearExternalHostFreshSourceState(mounted);
        mounted.hidden = false;
        return result('restored', editedBody
            ? __rmT(".lDr1VNdUvnzCP0etEViHlMi5E2zmR8bpAOb.M6mNd5kRTtLrDpflesUWdqb7jG.nWI0O4dAs3MOoulXbmBsIboFgBJxfRVj6ZYw4ZvfAr.KZG99wKCsxVMdyVNPRLTCuD4RM03c1FT") : movedFrom != null && movedFrom !== Number(index)
            ? `${__rmT("FmG8lklGC8.qEw2UfRdwrE.A2V3P6MmwZn8_8cZC4g8")}${movedFrom}${__rmT("kbjG8vfiTVJMMlN51zk6d4PVKz80J2d73mayPJTV6r6p9ReMq8_")}` : __rmT("FmG8lklGC8.qEw2UfRdwrE.ANV_uAssgA_keqwyDgG8"));
    })().catch(() => result('read-error', __rmT("g2OQOhAcu3mlfc_sY0oQl1Cd8uW8sj1XH4iUca.dXCB933SHAG5I1IhVECVZZxnLnbKOgh8Ry3Cobh")))
        .finally(() => { if (savedMirrorRecoveries.get(host) === recovery)
        savedMirrorRecoveries.delete(host); });
    savedMirrorRecoveries.set(host, recovery);
    return recovery;
}
function historyDateLabel(value) {
    const date = new Date(Number(value || 0));
    return Number.isFinite(date.getTime()) ? date.toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
}
function historyPreviewDetails(entry, faceIndex = -1, ownerSlot = '') {
    let source = ownerSlot ? prepareStoredIndependentRecordHtml(entry, ownerSlot) : String(entry?.html || '');
    if (faceIndex >= 0 && hasMultifaceMarkup(source)) {
        const parsed = parseMultifaceOutput(source);
        source = parsed.ok && parsed.faces[faceIndex] ? parsed.faces[faceIndex].inner : '';
    }
    const details = extractReadyDetails(source, !!ownerSlot);
    if (!details)
        return null;
    details.removeAttribute('data-rabbit-mirror-external-details');
    details.removeAttribute('data-rabbit-mirror-external-owner');
    details.removeAttribute('data-rabbit-mirror-external-source');
    details.setAttribute('open', '');
    details.querySelectorAll?.('[data-rabbit-mirror-tool-entry-host], [data-rm-face-swipe-host], [data-rm-image-region], [data-rm-image-portal], [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-rabbit-mirror-resay]')?.forEach(node => node.remove());
    try {
        isolateRabbitMirrorInteractionIds(details);
    }
    catch { }
    return details;
}
function showIndependentHistory(root, owner = {}) {
    const identity = resolveIndependentActionIdentity(root, owner);
    if (!identity)
        return false;
    const current = savedIndependentRecordForOwner(identity.ctx, identity.index, identity.msg, readStore());
    const historySlot = independentLineageOriginSlot(current) || identity.slot;
    if (current?.html)
        appendHistoryEntry(historySlot, current);
    const entries = [...new Map(slotSearchKeys(historySlot, [identity.slot, ...identity.legacySlots || []])
            .flatMap(candidate => historyEntriesForSlot(candidate))
            .map(entry => [String(entry.id || hashText(entry.html || '')), entry])).values()]
        .sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0));
    closeIndependentHistoryPanel();
    if (!entries.length) {
        globalThis.toastr?.info?.(__rmT("WzHblnDvdXzxDAcOq45g04UwqP7jhfjs29E"));
        return true;
    }
    const overlay = document.createElement('div');
    overlay.className = 'rabbit-mirror-history-overlay';
    overlay.setAttribute(HISTORY_PANEL_ATTR, 'true');
    overlay.innerHTML = __rmT("vIGfbeN8PSyCTf6jMZPabLCOUcNyPShoEgy4FfnW.bXi_mkRpPgrKaNb4HUxdau0mZkjb6ZCQ9zOxvPB4oTyfYivAKGeXtsUiKV5nu2NjUePjm8.CA3mjK84jblLXtMYn8VK9wwi.h1_OwpueH6amvwoJmTWSOeovbFCa9IJC0HGXKNxgfTZuacZvGZSAcf9uYzExJ3.jBPhvle89QMCik83Le4nuQ3n3dfJDRI1_TQ57F5PHbs451XeReIGrvop2sWH2xH215dvEeOScVz6.BJBBhsZqTumkmTST9DFdsVN9FjZCncsJ9EFCt9TdwJ5n5ZF.O4vVR76A04jYmcBai59PT1w4eHF3_HWud_6Zi9AxslGHfPZp4op1uL9XmjvgUdGZJNTrRSayk4L6k1v9hi8nEqScuOPSeaTs.tVxjf1R03thW2AaIWdgCxJebTHS2T9NCwRzqGzsKrkLCjKT_Js3VmUS2N2t1Kqw4h2oFBLMDTDA7i9ETjd1a.YfjRRTZREVpEpBxrVByc0fcPXVkdpkISNlJxHfO6bB90l93aR9LuvyHUSHDCHJbAjNWMXriMUlpB5ETEloVvrdUDiTA7HKo_YW9rfp3O9o02rgLRBpQGNLJomtMIuuW6I6UWkqTCGuS80Ma2aSxoSY5oAbms3YmHWmPGgVxEp0Bf5L604vpNdvtdn8CWgZ03QfdobTdCXTqL6VStInodOkrpx3xoln7gSCR_ZVBym3mc1oI4IMWgNiG_uB14d01.sMIY6JOiUfgDopDo4ZANrIa.4iaOwLLxslqB82QFf6JAYtR4YqECB1bwJz9sxobtf6RNQ7JoYnWlYV1vGCxcJIJA2Q4OxS4UBJ0CY9n9GkoI.p9Z6sZ1qghgYBGgq_zF3gvZ.joUqErEl1iboU6Q4yBgS7cDaVMlr7wSMrU6lJOpVhP3169WCv42VOXeEek9yxbVp2JIIAD.v72cedRbUSlkyzB5oePqI8SIoF_Qm6wckP7hfnOF7Wju2sSk5wjuWmrbkr5K.q36hGG9tF.IBe.EH_bJjl1In2wEOOFhh4zXeVaa1sSLOjfgBSEGmEBsJq1xhoA6SABgP9rdtNMzcldC9oEUqLHUnSxsI7D4YdncORGPIdUzrZhA");
    const list = overlay.querySelector('.rabbit-mirror-history-list');
    const preview = overlay.querySelector('.rabbit-mirror-history-preview');
    const render = (entry, button) => {
        list.querySelectorAll('button').forEach(item => item.classList.toggle('is-active', item === button));
        preview.replaceChildren();
        const details = historyPreviewDetails(entry, identity.faceIndex, independentLineageOriginSlot(entry) || historySlot);
        if (details)
            preview.append(details);
        else
            preview.textContent = __rmT("7xqi9F.QlFtD1_GVtnCcj7fqbNs");
    };
    entries.forEach((entry, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        const number = entries.length - index;
        const model = entry.model ? ` · ${entry.model}` : '';
        button.textContent = `${__rmT("BJgCyT")}${number}${__rmT("UqYIK5_pSlRBTh")}${historyDateLabel(entry.ts)}${model}`;
        button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); render(entry, button); }, true);
        list.append(button);
        if (index === 0)
            queueMicrotask(() => render(entry, button));
    });
    overlay.addEventListener('click', event => {
        if (event.target === overlay || event.target?.closest?.('[data-rm-history-close="true"]')) {
            event.preventDefault();
            closeIndependentHistoryPanel();
        }
    }, true);
    document.body.append(overlay);
    return true;
}
export async function continueIndependentLongText(root, owner = {}) {
    const identity = resolveIndependentActionIdentity(root, owner);
    if (!identity)
        return false;
    const details = root?.matches?.('details') ? root : root?.querySelector?.('details');
    const article = details?.querySelector?.('article') || details;
    const existing = String(article?.innerText || '').replace(/\s+/g, ' ').trim();
    if (existing.length < 40) {
        globalThis.toastr?.warning?.(__rmT("xS5vkodtLSlfZH3nJ4Iy_nJffePdBlZ5l4vspf"));
        return true;
    }
    const st = getSettings();
    if ((!st.independentConnectionProfileId && !st.independentApiBaseUrl) || !st.independentApiModel) {
        globalThis.toastr?.warning?.(__rmT("RsCDPv4gzV8LgbmBZPbBqHqmjrQD.sXG5TkY7GDjjT2Lso0vU.ZCtz.NHyLgGhoRikcZ6.t057ZBVnlZS5pFrh"));
        return true;
    }
    const saved = savedIndependentRecordForOwner(identity.ctx, identity.index, identity.msg, readStore());
    const diagnostic = saved?.apiRequest && typeof saved.apiRequest === 'object' ? saved.apiRequest : {};
    const face = Array.isArray(diagnostic.faces) ? diagnostic.faces[Math.max(0, identity.faceIndex)] : diagnostic;
    const subject = [face?.worldBookTitle, ...(Array.isArray(face?.themeLabels) ? face.themeLabels : [])].filter(Boolean).slice(0, 4).join(__rmT("7os"));
    const systemPrompt = `${__rmT("MAdA1mpwOHneoeShioTdBv11NvIvwrO2w8MmjR3TZw_dhHHtuAfCyZI8xUHNC1veNiwCxHY0h8JZhDniO4K6pwCZ9QK87Df24CTCMa6LCSlQJ8g5yjv_OkcYDG_9AOb7XJvuk0ZPGXfGD.v9L1fMR9YtsguFACvC3pD")}${subject ? `${__rmT("7ys")}${subject}` : ''}${__rmT("L4E0y5AoJtWyWx3C8qbQizZeZkf.vdEGPdzytNjEIyORDLVYiLV9vMARBZ1gUgSCUWBEzgijQGyjGgEf5God0r3EWAT")}`;
    const existingText = existing.slice(-6000);
    const userPrompt = `${__rmT("d5eBWSF2FqYdXbk1EM5eL6DRUZntUpBP")}${Number(identity.index) || 0} ASSISTANT]\n${JSON.stringify(existingText)}${__rmT("SkadRxXq5YEx.0EnpfPNxFv.qd_TfjccfyYZx3dRy.41xsyh9TTfaeg_dxl4vw6UUqFbfTwcsPfbA9GQRYRdkkPKVAvaNrubofOvUD7CQ7AYgF_ltwwPASbzQfP38Yw6B_P6SCRtyBNoAYLf4gys_PfHPq3SMvsZxxTM9dCgFYmosT3_rb5QSXSuqnXixl6Utz0VLPLrqfgj_LjHuwzaxYDxjYWHrq6OegAZ_sWRV2yO0F2sWR_lQP_hk8TwVGZdEY6vAM0SM2UBxQV3toPjzJWxNZVLDcV8YM._gFOqeFCZqk")}`;
    try {
        const completed = await requestIndependentCompletion(st, systemPrompt, userPrompt, { dispatchLease: createManualDispatchLease(), diagnosticContext: { longTextContinuation: true } });
        if (!completed?.response?.ok || completed?.semanticError)
            throw new Error(completed?.semanticError || __rmT("TDk04PWVeb9WyEyM"));
        const addition = String(completed?.result?.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (addition.length < 20)
            throw new Error(__rmT("SOtgn7zP2h86MI7ISEf"));
        const section = document.createElement('section');
        section.setAttribute('data-rm-continuation', 'true');
        section.textContent = addition;
        article.append(section);
        const store = readStore();
        const record = savedIndependentRecordForOwner(identity.ctx, identity.index, identity.msg, store);
        if (record?.html) {
            const safe = addition.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const snippet = `<section data-rm-continuation="true">${safe}</section>`;
            let seen = 0;
            const faceIndex = identity.faceIndex >= 0 ? identity.faceIndex : 0;
            const html = String(record.html).replace(/<\/article>/g, match => {
                if (seen === faceIndex) {
                    seen += 1;
                    return `${snippet}${match}`;
                }
                seen += 1;
                return match;
            });
            const next = { ...record, html, ts: Date.now() };
            saveRecordForSlot(store, identity.slot, next);
            writePersistedOwner(identity.ctx, identity.index, identity.msg, next, { overwrite: true });
            requestSafeChatSave(identity.ctx, identity.index, identity.msg, __rmT("GN33Nh"));
            if ((!writeStore(store) || readStore()?.[identity.slot]?.html !== html) && !savedInChatFile(identity.ctx, identity.index, identity.msg, html))
                showIndependentUnsavedOutput(next, identity.slot);
        }
        globalThis.toastr?.success?.(__rmT("2ls4iEeLiCoYxC0q2zymCew2bNs"));
    }
    catch {
        globalThis.toastr?.error?.(__rmT("zteBtWLdMKTdI0QJKVfNyflfVNd4xCaS7AWCamKq"));
    }
    return true;
}
export function resayIndependentMirror(root, owner = {}, options = {}) {
    const mode = ['fresh', 'original', 'order'].includes(options?.mode) ? options.mode : '';
    const pickIds = (value, limit) => [...new Set((Array.isArray(value) ? value : []).map(id => String(id || '').trim())
            .filter(id => id && id.length <= 2048 && (/^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/.test(id) || /^ext:[A-Za-z0-9:._!~*'()-]+$/.test(id))))].slice(0, limit);
    const pickedThemeIds = mode === 'order' ? pickIds(options?.themeIds, 3) : [];
    const pickedFormatIds = mode === 'order' ? pickIds(options?.formatIds, 2) : [];
    const orderPicked = pickedThemeIds.length > 0 || pickedFormatIds.length > 0;
    const note = String(options?.note || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ').trim().slice(0, mode === 'order' ? 2000 : 400);
    const form = options?.form === 'html' || options?.form === 'longtext' ? options.form : '';
    if (getSettings().generationSource === 'follow' && mode !== 'order') {
        if (mode === 'fresh') {
            globalThis.toastr?.warning?.(__rmT("InGoNlDHm6NGgcD41ArVQmg01wLLFtPtkWBbFiApaENdrNnv23u0vJwxSl1K3nfUm.16rQGp1O9Spiwnh5CFrh"));
            return true;
        }
        void import('../followFaceRetry.js?rmv=2.5.2').then(({ retryFollowFace }) => retryFollowFace(root, owner, {
            getContext, hostBusy: hostGenerationLooksActive, maxRequestChars: configuredIndependentMaxRequestChars(getSettings()), resayNote: note, presentationOverride: form,
            resolveOwner: target => {
                const host = target?.closest?.('[data-rabbit-mirror-external-source="true"][data-rm-source="follow"]');
                return followRecoveryOwner(host ? messageElementForExternalHost(host) : target?.closest?.('.mes[mesid]'));
            },
            context: (ctx, index) => { const snapshot = globalWorldInfoSnapshotFor(ctx, index, ctx.chat[index]); return contextBundle(ctx, index, snapshot, globalWorldInfoContextView(snapshot), CONTEXT_TOTAL_BUDGET, createIndependentVisibleTextReader(index)); },
            extractReadyDetails, formatDescriptors: independentSelectedFormatDescriptors, replaceExternalFace: replaceExternalMultifaceFace,
        })).catch(() => globalThis.toastr?.error?.(__rmT("Caou_TSjpEUgjnp55fH2Faw7SlRD3gXQOofmhfDrM5Ry.CHfF6q5WEDRzBG")));
        return true;
    }
    let identity = resolveIndependentActionIdentity(root, owner, { allowPassiveErrorRetry: true, allowEditedSource: true });
    if (!identity)
        return false;
    if (identity.editedSource) {
        if (!adoptEditedIndependentMirror(identity)) {
            globalThis.toastr?.warning?.(__rmT("s1SEuQZpadu8OtZ1b_JjRW.h1CM1DsdYovrVPdbasfi49z3JevOQrjIXlZr6k5EKDhGjm4rQCFCyBWFpBA4LaxUQjjHHT469XXkLRf"));
            return true;
        }
        identity = resolveIndependentActionIdentity(root, owner, { allowPassiveErrorRetry: true });
        if (!identity) {
            globalThis.toastr?.warning?.(__rmT("yRSURcYYjMC2f1RBpHdap8Jk3ETWj9139BMxdrZUfSA9c086HX8EDfNtrf.a1BlKZ.VY3h"));
            return true;
        }
    }
    const gate = canIndependentFaceResay(root, owner);
    if (!gate.ok) {
        globalThis.toastr?.warning?.(gate.message || FACE_SWIPE_FULL_MESSAGE);
        return true;
    }
    const saved = savedIndependentRecordForOwner(identity.ctx, identity.index, identity.msg, readStore());
    const diagnostic = saved?.apiRequest && typeof saved.apiRequest === 'object' ? saved.apiRequest : {};
    let faces = Array.isArray(diagnostic.faces) ? diagnostic.faces.slice() : [];
    const mountedFaces = externalFaceDetails(identity.host);
    const target = mountedFaces[identity.faceIndex];
    const failedFace = identity.faceIndex >= 0 && (target?.hasAttribute?.(MULTIFACE_FAILURE_ATTR)
        || hasEphemeralFaceFailure(target));
    const shownDetails = identity.faceIndex >= 0 ? target : (mountedFaces[0] || identity.host?.querySelector?.('details'));
    const shownRecipe = mode === 'original' ? displayedFaceRecipe(shownDetails) : null;
    if (shownRecipe && identity.faceIndex >= 0 && identity.faceIndex < mountedFaces.length) {
        const targetRecipe = faces[identity.faceIndex];
        if (faces.length !== mountedFaces.length)
            faces = Array.from({ length: mountedFaces.length }, () => null);
        faces[identity.faceIndex] = { ...(targetRecipe || {}), ...shownRecipe };
    }
    const recipe = faces[identity.faceIndex];
    const hasRecipe = faces.length === mountedFaces.length && recipe
        && (isBlankLongTextSelection(recipe) || recipe.worldBookEntryId || ['themeIds', 'formatIds', 'textIds'].some(key => Array.isArray(recipe[key]) && recipe[key].length));
    const singleRecipe = identity.faceIndex < 0 ? (shownRecipe ? { ...(faces[0] || diagnostic), ...shownRecipe } : (faces[0] || diagnostic)) : null;
    const hasSingleRecipe = !!singleRecipe && (isBlankLongTextSelection(singleRecipe) || singleRecipe.worldBookEntryId || ['themeIds', 'formatIds', 'textIds'].some(key => Array.isArray(singleRecipe[key]) && singleRecipe[key].length));
    let multifaceResay = null;
    let singlePresentationResay = null;
    const withForm = value => value && form ? { ...value, presentationOverride: form } : value;
    if (mode === 'order') {
        if (form !== 'html' && form !== 'longtext') {
            globalThis.toastr?.warning?.(__rmT("Kla2DP4vrNmejqBqDWnAOQBe_HbiJgXzcKDrUiNT95zSy086HX8EDfNtrf.a1BlKZ.VY3h"));
            return true;
        }
        if (!note && !orderPicked) {
            globalThis.toastr?.warning?.(__rmT("qSuYL_ATmOrT6TmnAzx06Giq9dVtpKyTCZgrqz4wuPYe6TPzglM0JKtksBCwg9tssfAjunaKJW3CspwJaMJzaztHVwiG9BYzANA"));
            return true;
        }
        if (form === 'html' && orderPicked && !pickedFormatIds.length && !note) {
            globalThis.toastr?.warning?.(__rmT("Dl4zhN8pq6UwYueMy4yx.on0gxkdRpLtedRdASoo1nB.jmoZ5vC8mdqRTAbKGr_3_VGT8Tt5UovKNuFTXcxA9EtJGRd9NKqOWMOdXGVU79s"));
            return true;
        }
        if (orderPicked) {
            const pickedFace = { samplingMode: pickedThemeIds.length ? 'classic' : 'format_only', themeIds: pickedThemeIds, formatIds: pickedFormatIds,
                forcedVisualScenery: false, visualSceneryCombination: false,
                requestedPresentationMode: form, presentationMode: form === 'longtext' ? 'text' : 'html' };
            if (identity.faceIndex >= 0) {
                const pickedFaces = Array.from({ length: Math.min(5, Math.max(mountedFaces.length, faces.length, identity.faceIndex + 1)) }, (_, index) => faces[index] && typeof faces[index] === 'object' ? faces[index] : {});
                pickedFaces[identity.faceIndex] = pickedFace;
                multifaceResay = withForm({ faceIndex: identity.faceIndex, faces: pickedFaces, retryFailedFace: false, freshSelection: false, userPicked: true });
            }
            else
                singlePresentationResay = withForm({ faceIndex: 0, faces: [pickedFace], freshSelection: false, retryFailedFace: false, singleFaceRecipe: true, userPicked: true });
        }
        else {
            const order = { pureOrder: true, presentationOverride: form, orderText: note, faceIndex: identity.faceIndex >= 0 ? identity.faceIndex : 0, freshSelection: false, retryFailedFace: false };
            if (identity.faceIndex >= 0)
                multifaceResay = { ...order, faces };
            else
                singlePresentationResay = order;
        }
    }
    else if (mode === 'fresh') {
        if (identity.faceIndex >= 0)
            multifaceResay = withForm({ faceIndex: identity.faceIndex, faces, retryFailedFace: true, freshSelection: true });
        else if (form && !(identity.host?.dataset?.rmState === 'error' && !saved?.html
            && Number(getSettings().rabbitMirrorFaceCount) > 1))
            singlePresentationResay = withForm({ faceIndex: 0, faces: [], freshSelection: true, retryFailedFace: true });
    }
    else if (mode === 'original') {
        const selfShown = shownRecipe?.samplingMode === 'self_invent' || (!shownRecipe && !!shownDetails?.hasAttribute?.('data-rm-self'));
        const selfNote = __rmT("HCQogFqu5iHJILHGhLLnCs9jEtU6SLBPAUoHhfw6ewe0gXIJ9Rd1PlQGnb60THd23SM2yphRknE9MzJgdsQMkP5BU3FBVWAd904NeMuQ7o5.l5TF7Wd5W4XIMm6MiyFiECZGx4HDSZewVDTaKZ.1dA_xLf4jzXIA0wfQ14ARcYo9iPT1hfgTr.WDOxruASjAUbRqD38PeG3_cXXCRGlswQ1qvsVIpYXYy8.Mmh");
        if (selfShown) {
            globalThis.toastr?.error?.(selfNote);
            return true;
        }
        if (identity.faceIndex >= 0) {
            if (!hasRecipe) {
                globalThis.toastr?.error?.(__rmT("OupP.O3id8EJQuVO_vilbkNZQS_FlCv954oPmQmtO_pUERkdYJ2JJzLmA4TKjXlKSgodWHTrBUzMFJ2yj7ge.mtaR0TaSwZQNyoiUrhgQQx3M9iK3ByECfgBKdRVw12iO7hbp9Z0lukborf8veDpmTlRZxY"));
                return true;
            }
            multifaceResay = withForm({ faceIndex: identity.faceIndex, faces, retryFailedFace: false, freshSelection: false, preserveSelection: true });
        }
        else if (!hasSingleRecipe) {
            globalThis.toastr?.error?.(__rmT("LzYRevcktSvoRt9zZq1g_Mqr.eEHFGsRWeY5cdNyT5TlskDeFz2qLUBlka76VFpRcw_zpyfMek_jTq7bhXG4D_1v7XGaxnrbQS4PDVr1eP3Kyu5cC6_0if"));
            return true;
        }
        else
            singlePresentationResay = withForm({ faceIndex: 0, faces: [singleRecipe], freshSelection: false, retryFailedFace: false, singleFaceRecipe: true, preserveSelection: true });
    }
    else {
        if (identity.faceIndex >= 0 && !hasRecipe && !failedFace) {
            globalThis.toastr?.error?.(__rmT("Vp76If4YcRJwJk6yen7WYkbmiK9aKmjamcZ7jgtxHeQDXXor5rKAR7A2uojw2a5Mf_9aZbWdshXXkRxKQFW0tmVxW6_y2WXMxQK8hpirqSAM3Uue4o2iuhGxiGPIWkhaKxPOeUXMGOovwBVi0IVmmcFL"));
            return true;
        }
        multifaceResay = identity.faceIndex >= 0
            ? { faceIndex: identity.faceIndex, faces, retryFailedFace: !!failedFace, freshSelection: !hasRecipe }
            : null;
    }
    const preparing = mode === 'order' && orderPicked
        ? (multifaceResay ? __rmT("CZkRESzG1bqyfJZ.jocYWGN24m_B_bbxv2G_WoF4rKg2KJSFhep9a6wweRapSnhwfkbiH286") : __rmT("SPWkViX3bmbP51Y3pAX_UmLvQD5MIBZNMIfgwpyJLS1o0Tui"))
        : mode === 'order'
            ? (multifaceResay ? __rmT("HQUI9x1CXUC4ozTeigggzFRut62nPtXpZFT46P34nlDETmuFoJUt7tebi9lxpffA") : __rmT("Oi4HyRaHhwfdIPxvoZg1I9wdv8sFDE9Qme19PR.W"))
            : mode === 'fresh'
                ? (multifaceResay ? __rmT("KVQ2Pk0STtSKp4Ri9Pr.BEKyLXKs3_x2_nFvl6VqbuNejI5rVJcFGQHpz6nVVT1XiCE") : (getSettings().selfInventMode === true && Number(getSettings().rabbitMirrorFaceCount || 1) === 1) ? __rmT("RHgveGhHFeBlafrVliux_1mctDCLr9IBHL6k67PmhI9Q2h") : __rmT("QE8LkoY1xoBCmUJriv7ZnRU7tAl1h3rtZPE"))
                : mode === 'original'
                    ? (multifaceResay ? __rmT("vAJ7Qp4AquGg5BdPe_ShDjmtjfBgSblOa3QQW7AomBt6h9xPyaQ3BJuIguG") : __rmT("mbdy0Eu6mQi3rgg8Q_fGUt9oL2s"))
                    : multifaceResay?.freshSelection
                        ? __rmT("ZHTPnFv8yrZ_jjTyHR65asXCsUzzQaLazw937V.275gHGtRTp4nm2bVZknIG4fpMgR2dQzMv8LT_BOt9dLdeQvUOpqHbyIfi8tCLRf") : multifaceResay ? __rmT("P63FwCRbSzRBXb7WXrs34RrEbqLjystuJEeQ6GHVOakb4VPvX1fSef") : __rmT("QE8LkZGcCozCtexGvSMtw5cUAW9R7KrtZPE");
    globalThis.toastr?.info?.(preparing);
    void generateFor(identity.index, identity.msg, true, true, multifaceResay, null, null, singlePresentationResay, null, mode === 'order' && !orderPicked ? '' : note);
    return true;
}
const unsavedIndependentOutputs = new Map();
const dismissedIndependentOutputs = new Set();
function tidyIndependentUnsavedList() {
    if (typeof document === 'undefined')
        return;
    const container = document.querySelector?.('[data-rabbit-mirror-unsaved-list]');
    if (!container)
        return;
    const count = container.querySelectorAll('[data-rabbit-mirror-unsaved-output]').length;
    if (!count) {
        container.remove();
        return;
    }
    container.querySelector('summary').textContent = `${__rmT("726CyT")}${count}${__rmT("tMltku.MfmhAouU.ySagta0iXkw2uUvQY0Mceh")}`;
    let usage = container.querySelector('[data-rabbit-mirror-unsaved-usage]');
    if (!usage) {
        usage = document.createElement('div');
        usage.setAttribute('data-rabbit-mirror-unsaved-usage', 'true');
        usage.style.cssText = 'margin:6px 0;font-size:12px;opacity:.85';
        container.querySelector('summary').after(usage);
    }
    usage.textContent = describeLocalStorageUsage();
}
function placeIndependentUnsavedNotice(entry, host = null) {
    const target = host || allExternalHosts().find(node => node.dataset.rmSource === 'independent' && node.dataset.rmKey === entry.slot
        && (entry.unmerged ? entry.record.sourceHash === node.dataset.rmSourceHash : String(node.__rabbitMirrorIndependentSource || '') === entry.record.html));
    if (target) {
        target.append(entry.notice);
        tidyIndependentUnsavedList();
        return;
    }
    let container = document.querySelector('[data-rabbit-mirror-unsaved-list]');
    if (!container) {
        container = document.createElement('details');
        container.setAttribute('data-rabbit-mirror-unsaved-list', 'true');
        container.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:2147483000;max-width:min(360px,90vw);max-height:35vh;overflow:auto;background:#fff8e8;color:#45301a;border:1px solid #bb8a43;border-radius:8px;padding:8px;font:13px/1.5 sans-serif';
        const summary = document.createElement('summary');
        summary.style.cursor = 'pointer';
        container.append(summary);
        document.body.append(container);
    }
    container.append(entry.notice);
    tidyIndependentUnsavedList();
}
export function attachIndependentUnsavedNotices(host, key, record) {
    if (!unsavedIndependentOutputs.size)
        return;
    clearSavedIndependentOutputNotices(readStore());
    for (const entry of unsavedIndependentOutputs.values()) {
        if (entry.slot === key && (entry.unmerged ? entry.record.sourceHash === host.dataset.rmSourceHash : entry.record.html === String(record?.html || host.__rabbitMirrorIndependentSource || '')))
            placeIndependentUnsavedNotice(entry, host);
        else if (entry.notice.parentElement === host) {
            entry.notice.remove();
            placeIndependentUnsavedNotice(entry);
        }
    }
}
export function clearSavedIndependentOutputNotices(store = null) {
    if (!unsavedIndependentOutputs.size)
        return;
    const savedStore = store || readStore();
    for (const [id, entry] of unsavedIndependentOutputs) {
        if (entry.history) {
            if (faceSwipeSnapshotStored(entry.historySlot, entry.history)) {
                entry.notice.remove();
                unsavedIndependentOutputs.delete(id);
            }
            continue;
        }
        const saved = savedStore?.[entry.slot];
        if (!saved || saved.html !== entry.record.html || String(saved.initialHtml || '') !== String(entry.record.initialHtml || '')
            || String(saved.sourceHash || '') !== String(entry.record.sourceHash || ''))
            continue;
        if (entry.record.ownerLineage && ['id', 'chatKey', 'mesid', 'swipe', 'originSourceHash', 'acceptedBodyHash']
            .some(key => saved.ownerLineage?.[key] !== entry.record.ownerLineage[key]))
            continue;
        entry.notice.remove();
        unsavedIndependentOutputs.delete(id);
    }
    tidyIndependentUnsavedList();
}
export function clearIndependentHistorySaveNotice(slot, states) {
    const id = `${slot}\u0000history`;
    const entry = unsavedIndependentOutputs.get(id);
    if (entry && JSON.stringify(entry.history) === JSON.stringify(states)) {
        entry.notice.remove();
        unsavedIndependentOutputs.delete(id);
        tidyIndependentUnsavedList();
    }
}
export function showIndependentUnsavedOutput(record, ownerSlot = '', { unmerged = false, history = null, historySlot = '' } = {}) {
    if (!record?.html || typeof document === 'undefined' || !document.body)
        return;
    const slot = String(ownerSlot || independentLineageOriginSlot(record) || '');
    const id = `${slot || String(record.ownerLineage?.id || '')}\u0000${history ? 'history' : hashText(record.html)}`;
    if (dismissedIndependentOutputs.has(id))
        return;
    let entry = unsavedIndependentOutputs.get(id);
    if (entry) {
        entry.record = record;
        if (history)
            entry.history = history;
        placeIndependentUnsavedNotice(entry);
        return;
    }
    const notice = document.createElement('aside');
    entry = { slot, record, notice, unmerged, history, historySlot };
    unsavedIndependentOutputs.set(id, entry);
    notice.setAttribute('data-rabbit-mirror-unsaved-output', 'true');
    if (unmerged)
        notice.setAttribute('data-rabbit-mirror-unmerged-output', 'true');
    if (history)
        notice.setAttribute('data-rabbit-mirror-unsaved-history', 'true');
    notice.setAttribute('data-rabbit-mirror-unsaved-id', hashText(id));
    notice.setAttribute('role', 'status');
    notice.style.cssText = 'position:static!important;display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:8px!important;margin:8px 0!important;padding:8px 10px!important;max-width:100%!important;box-sizing:border-box!important;border:1px solid #bb8a43!important;border-radius:8px!important;background:#fff8e8!important;color:#45301a!important;font:13px/1.5 sans-serif!important';
    const description = document.createElement('span');
    description.style.cssText = 'font:13px/1.5 sans-serif!important;color:#45301a!important;white-space:normal!important';
    description.textContent = history ? __rmT("UFH3Aw8GYo7RChc7ONagPlXmn5h0I3DC_gcTyVq6n3kjr2dqwiUsoOwL1RjfPAHHuYkzl_.FDngWBY6s99idwfJMWAT") : unmerged
        ? __rmT("wqfJNPa4qgAlUMAPcmKTqvyynSf8JFvyDsDC7fwPLH1MW8HDenDqiJKmYmgzl36tHOk5eIdilF87maYP.jNM8EZUOa_eqs887lDLRf") : __rmT("xUVohfY4awHzeuhsc7EeIPSKZUqF34WUl5BaTJGQq1mwqkSoRPS1QYfkenkpFECM7nAAczhXnskobh");
    const download = document.createElement('button');
    download.type = 'button';
    download.textContent = history ? __rmT("QP41AzBbmT2op_Hf") : __rmT("QP41ArDHo7drkZ30");
    download.addEventListener('click', () => {
        const backup = entry.history ? Object.entries(entry.history).flatMap(([index, state]) => (state.versions || []).map((version, number) => {
            const details = extractReadyDetails(version.html, true);
            if (details)
                details.open = true;
            return `${__rmT("pb6ZjqxyJuNMrlBq")}${Number(index) + 1}${__rmT("7aATSXte7LCA0CQkgPD")}${number + 1}${__rmT("7aAN2wmeqLUs0UT6lgD")}${details?.outerHTML || ''}`;
        })).join('\n') : String(entry.record.html);
        const metadata = entry.history ? `<script type="application/json" id="rabbit-mirror-history-backup">${JSON.stringify({ record: entry.record, states: entry.history }).replace(/</g, '\\u003c')}</script>` : '';
        const url = URL.createObjectURL(new Blob([entry.history ? __rmT("u3e4lyTRnChEdEEbRdyI85ZgRJykC3QUiZ7GeVHdnvnxqykZqmRe0yUZkqoq1t_I8yWCOrMttBbtOmtHybGB3iz3LRTDC2KKQh3FR3ah4EgFzJZzQXCbL78yAP0RSpoILXHrk3V5_P934Zn5ghoVqVoPrfouzs6hEiCKX0oGAWnESI8iPFfCINJuVTsLf0cDBGLcjXJ8w48s6eFhdvUngNX3oYX04K3cgFJs7xSNq1QqosMJ9_wrPVPkLQbyobptQepTY5TqoHVQ2YZwAHRjRPE5yOA0QDHfkk1U9RaqjpoKWaID0Vc2U6zs5BB39G8bpIZRco4mIYbdRRwvsNm7Lk") : '', backup, metadata], { type: 'text/html;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `RabbitMirror-${Number(entry.record.ts) || Date.now()}.html`;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 0);
    });
    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.textContent = unmerged ? __rmT("bMMH4Y267G8") : __rmT("yHG5VB2MwNl");
    for (const button of [download, dismiss])
        button.style.cssText = 'font:13px/1.5 sans-serif!important;color:#45301a!important;background:#fff8e8!important;border:1px solid #bb8a43!important;border-radius:5px!important;padding:5px 8px!important;cursor:pointer!important;width:auto!important';
    if (unmerged) {
        const preview = document.createElement('section');
        preview.setAttribute('data-rabbit-mirror-local-result', 'true');
        preview.style.cssText = 'flex:1 0 100%;min-width:0;width:100%;box-sizing:border-box';
        const details = extractReadyDetails(record.html, true);
        if (details) {
            details.open = true;
            preview.append(details);
        }
        dismiss.addEventListener('click', () => { preview.hidden = !preview.hidden; dismiss.textContent = preview.hidden ? __rmT("vQdxJrDHRwarkZ30") : __rmT("bMMH4Y267G8"); });
        notice.append(description, download, dismiss, preview);
        placeIndependentUnsavedNotice(entry);
        if (details)
            armRabbitMirrorFirstUseInteraction(details);
        return;
    }
    dismiss.addEventListener('click', () => { dismissedIndependentOutputs.add(id); unsavedIndependentOutputs.delete(id); notice.remove(); tidyIndependentUnsavedList(); });
    notice.append(description, download, dismiss);
    placeIndependentUnsavedNotice(entry);
}
function persistIndependentRepairFromEvent(event) {
    const detail = event?.detail || {};
    const host = detail.host?.matches?.(`[${SOURCE_ATTR}][data-rm-source="independent"]`)
        ? detail.host
        : detail.root?.closest?.(`[${SOURCE_ATTR}][data-rm-source="independent"]`);
    const abort = reason => {
        detail.persisted = false;
        detail.persistenceReason = String(reason || 'unknown');
        console.debug('[RabbitMirror] independent repair not persisted:', reason);
        return false;
    };
    if (!host?.isConnected)
        return abort('host missing or detached');
    if (host.dataset.rmState !== 'ready')
        return abort(`host state=${host.dataset.rmState || 'unknown'}`);
    const index = messageIndexForExternalHost(host);
    if (!Number.isInteger(index) || index < 0)
        return abort('owner message index unresolved');
    const identity = currentGenerationIdentity(index);
    if (!identity)
        return abort(`generation identity unavailable for index ${index}`);
    const mountedSource = String(host.dataset.rmSourceHash || '');
    if (!mountedSource)
        return abort('mounted sourceHash missing');
    if (mountedSource !== identity.sourceHash)
        return abort('mounted sourceHash no longer matches current source');
    const faces = externalFaceDetails(host);
    const requestedRoot = detail.root;
    const details = faces.length > 1
        ? faces.find(face => face === requestedRoot || face.contains?.(requestedRoot))
        : readyDetailsFromHost(host);
    if (!details || !usableReadyDetails(details))
        return abort('no usable owner face in host');
    if (details.querySelector?.('[data-rabbit-mirror-source-truncation-notice]'))
        return abort('blank shell with maintenance notice only');
    details.setAttribute(MAINTENANCE_PERSISTED_LAYOUT_ATTR, 'true');
    const clone = restoreRuntimeAnimationClone(details, details.cloneNode(true));
    stripEphemeralFailureArtifacts(clone);
    clone.setAttribute(MAINTENANCE_PERSISTED_LAYOUT_ATTR, 'true');
    clone.querySelectorAll?.('[data-rabbit-mirror-tool-entry-host], [data-rm-face-swipe-host], [data-rm-image-region], [data-rm-image-portal], [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-rabbit-mirror-resay]')?.forEach(node => node.remove());
    const rawHtml = faces.length > 1 ? serializeExternalFaceDetails(host) : String(clone.outerHTML || '').trim();
    const store = readStore();
    const existing = savedIndependentRecordForOwner(identity.ctx, identity.index, identity.msg, store);
    const existingSlot = independentLineageOriginSlot(existing) || identity.slot;
    const baseline = String(existing?.initialHtml || host.__rabbitMirrorIndependentInitialSource || initialHtmlForRecord(existingSlot, existing) || existing?.html || rawHtml);
    const initialHtml = scrubIndependentInteractionState(baseline, baseline);
    const html = scrubIndependentInteractionState(rawHtml, initialHtml || baseline);
    if (!independentStoredHtmlRestorable(html))
        return abort('scrubbed html failed restorability check');
    const previousClean = existing?.html ? scrubIndependentInteractionState(existing.html, initialHtml || baseline) : '';
    const repaired = {
        ...(existing || {}),
        html,
        initialHtml: initialHtml || html,
        sourceHash: identity.sourceHash,
        bodyHash: identity.bodyHash,
        displayHash: identity.displayHash,
        reasoningHash: identity.reasoningHash,
        paletteFingerprint: independentPaletteFingerprintFromHtml(html),
        ts: Date.now(),
        model: String(existing?.model || getSettings().independentApiModel || ''),
        runtime: RUNTIME_VERSION,
        repairedByMaintenance: true,
        ownerLineage: null,
    };
    if (!independentRecordWithinBudget(repaired))
        return abort('repaired mirror exceeds storage budget');
    if (previousClean && previousClean !== html) {
        const repairedFace = faces.length > 1 ? faces.findIndex(face => face === details) : 0;
        const faceIndex = Math.max(0, repairedFace);
        const repairedHtml = scrubSwipeDetailsHtml(clone.outerHTML);
        if (repairedHtml)
            mutateFaceSwipe(identity.baseSlot, faceIndex, state => {
                const seedHtml = faceDetailsListFromHtml(existing?.initialHtml || previousClean)[faceIndex]?.detailsHtml || previousClean;
                const seeded = seedSwipeState(state, { html: seedHtml, initialHtml: seedHtml, ts: Number(existing?.ts || Date.now()) });
                return updateCurrentSwipeHtml(seeded.state, repairedHtml);
            });
    }
    bindIndependentRecordContinuity(identity.ctx, identity.index, identity.msg, repaired, null, { completed: true, commit: false });
    sealIndependentTextReplacementRecord(repaired, identity.slot);
    saveRecordForSlot(store, identity.slot, repaired);
    writePersistedOwner(identity.ctx, identity.index, identity.msg, repaired, { overwrite: true });
    requestSafeChatSave(identity.ctx, identity.index, identity.msg, __rmT("fTiWvCReABTVdT"));
    host.__rabbitMirrorIndependentSource = html;
    host.__rabbitMirrorIndependentInitialSource = initialHtml || html;
    host.hidden = false;
    clearExternalHostFreshSourceState(host);
    const localSaved = writeStore(store) && String(findSavedRecord(readStore(), identity.slot, identity.legacySlots || [])?.html || '') === html;
    const chatSaved = () => writtenToChatMetadata(identity.ctx, identity.index, identity.msg, html, identity.sourceHash);
    if (!localSaved && !chatSaved()) {
        showIndependentUnsavedOutput(repaired, identity.slot);
        return abort(`${__rmT("8U0gJX5o1EISPAxN3cMY6gS1I83hiUHi9K_3iTUUcyVeSMbOXx0pogwZM9PdtwSOBznTGCIWY3Y")}${describeLocalStorageUsage()}`);
    }
    if (!localSaved && !savedInChatFile(identity.ctx, identity.index, identity.msg, html, identity.sourceHash))
        showIndependentUnsavedOutput(repaired, identity.slot);
    if (localSaved) {
        setOwnerLockForBase(identity.baseSlot, identity.slot, identity.sourceHash);
        const savedOwnerLock = ownerLockForBase(identity.baseSlot);
        if ((String(savedOwnerLock?.slot || '') !== identity.slot || String(savedOwnerLock?.sourceHash || '') !== identity.sourceHash) && !chatSaved())
            return abort('owner lock read-back mismatch');
    }
    bindIndependentRecordContinuity(identity.ctx, identity.index, identity.msg, repaired, null, { completed: true });
    writePersistedOwner(identity.ctx, identity.index, identity.msg, repaired, { overwrite: true });
    const persistedOwner = persistedOwnerForMessage(identity.ctx, identity.index, identity.msg);
    if (String(persistedOwner?.html || '') !== html || String(persistedOwner?.sourceHash || '') !== identity.sourceHash)
        return abort('chat metadata read-back mismatch');
    host.__rabbitMirrorIndependentSource = html;
    host.__rabbitMirrorIndependentInitialSource = initialHtml || html;
    host.dataset.rmSourceHash = identity.sourceHash;
    host.hidden = false;
    clearExternalHostFreshSourceState(host);
    scheduleExternalShellTint(host, html);
    detail.persisted = true;
    detail.persistenceReason = '';
    return true;
}
export function installRepairPersistenceListener() {
    if (repairPersistenceListenerInstalled || typeof document === 'undefined')
        return;
    document.addEventListener(INDEPENDENT_REPAIR_PERSIST_EVENT, persistIndependentRepairFromEvent);
    repairPersistenceListenerInstalled = true;
}
export function removeRepairPersistenceListener() {
    if (!repairPersistenceListenerInstalled || typeof document === 'undefined')
        return;
    document.removeEventListener(INDEPENDENT_REPAIR_PERSIST_EVENT, persistIndependentRepairFromEvent);
    repairPersistenceListenerInstalled = false;
}
function mirrorImageFaceSource(source, faceIndex) {
    const text = String(source || '');
    if (hasMultifaceMarkup(text)) {
        const parsed = parseMultifaceOutput(text, { allowProse: true });
        return parsed.ok ? String(parsed.faces?.[faceIndex]?.html || '') : '';
    }
    if (faceIndex !== 0)
        return '';
    const toto = text.match(/<toto\b[^>]*>([\s\S]*?)<\/toto>/i);
    if (toto)
        return toto[1].trim();
    const trimmed = text.trim();
    return /^<details\b/i.test(trimmed) && /<\/details>$/i.test(trimmed) ? trimmed : '';
}
function mirrorImageReferenceSnapshot(ctx, settings) {
    const char = ctx.characters?.[ctx.characterId] || ctx.character || {};
    const data = char.data && typeof char.data === 'object' ? char.data : char;
    const clean = value => stripExcludedTagsFromReference(String(value || ''));
    const character = settings.independentReadCharacterCardSummary === false ? { name: String(char.name || data.name || ctx.name2 || '') } :
        { name: String(char.name || data.name || ctx.name2 || ''), description: clean(data.description || char.description), personality: clean(data.personality || char.personality), scenario: clean(data.scenario || char.scenario) };
    const persona = { name: String(ctx.name1 || globalThis.name1 || ''), description: settings.independentReadPersonaSummary === false ? '' : clean(ctx.powerUserSettings?.persona_description || globalThis.power_user?.persona_description || ctx.personaDescription) };
    return { character, persona };
}
const FACE_RECIPE_ATTR = 'data-rm-face-recipe';
const FACE_RECIPE_KEYS = ['samplingMode', 'themeIds', 'formatIds', 'textIds', 'worldBookEntryId', 'blankLongText', 'requestedPresentationMode', 'presentationMode', 'forcedVisualScenery', 'visualSceneryCombination', 'selfInventScope', 'pureOrderFace', 'userDirectiveApplied'];
function compactFaceRecipe(recipe) {
    if (!recipe || typeof recipe !== 'object')
        return null;
    const out = faceDrawMetadataFields(recipe);
    for (const key of FACE_RECIPE_KEYS) {
        const value = recipe[key];
        if (Array.isArray(value))
            out[key] = value.map(String).slice(0, recipe.faceDrawConfigured === true ? 16 : 12);
        else if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number')
            out[key] = value;
    }
    const unDrawn = out.samplingMode === 'self_invent' || out.pureOrderFace === true || out.userDirectiveApplied === true;
    const usable = unDrawn || out.blankLongText === true || out.worldBookEntryId || ['themeIds', 'formatIds', 'textIds'].some(key => Array.isArray(out[key]) && out[key].length);
    return usable ? { ...out, ...atmosphereSelectionFields(recipe) } : null;
}
const OPEN_TAG_ATTRS = `(?:[^>"']|"[^"]*"|'[^']*')*`;
const FIRST_DETAILS_OPENING = new RegExp(`<details\\b(${OPEN_TAG_ATTRS})>`, 'i');
const FACE_DETAILS_OPENINGS = new RegExp(`(<toto\\b${OPEN_TAG_ATTRS}>(?:(?!<toto\\b|<details\\b)[\\s\\S])*)(<details\\b${OPEN_TAG_ATTRS}>)`, 'gi');
function stampFaceRecipe(detailsHtml, recipe) {
    const compact = compactFaceRecipe(recipe);
    const html = String(detailsHtml || '');
    if (!compact || !/<details\b/i.test(html))
        return html;
    const value = JSON.stringify(compact).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return html.replace(FIRST_DETAILS_OPENING, (match, attrs) => `<details${String(attrs).replace(/\sdata-rm-face-recipe="[^"]*"/i, '')} ${FACE_RECIPE_ATTR}="${value}">`);
}
function stampFaceRecipesInHtml(html, diagnostic) {
    const source = String(html || '');
    if (!diagnostic || !/<details\b/i.test(source))
        return source;
    let face = 0;
    const stampOne = (prefix, tag) => { const out = prefix + stampFaceRecipe(tag, faceRecipeFromDiagnostic(diagnostic, face)); face += 1; return out; };
    const result = source.replace(FACE_DETAILS_OPENINGS, (all, prefix, tag) => stampOne(prefix, tag));
    if (face)
        return result;
    const first = source.match(FIRST_DETAILS_OPENING);
    return first ? source.replace(first[0], () => stampOne('', first[0])) : source;
}
function displayedFaceRecipe(details) {
    const raw = details?.getAttribute?.(FACE_RECIPE_ATTR);
    if (!raw)
        return null;
    try {
        return compactFaceRecipe(JSON.parse(raw));
    }
    catch {
        return null;
    }
}
function faceRecipeFromDiagnostic(diagnostic, faceIndex) {
    const faces = Array.isArray(diagnostic?.faces) ? diagnostic.faces : [];
    return faces.length ? faces[faceIndex] || null : (faceIndex === 0 ? diagnostic : null);
}
function prepareMirrorImageTarget(root) {
    if (!root?.isConnected || !currentRuntime())
        return null;
    const details = root.matches?.('details') ? root : root.querySelector?.(':scope > details') || root.querySelector?.('details');
    if (!details)
        return null;
    const ctx = getContext();
    const cached = mirrorImageTargetCache.get(details);
    if (cached) {
        try {
            cached.assertCurrent();
            return cached;
        }
        catch {
            mirrorImageTargetCache.delete(details);
        }
    }
    const independentHost = independentHostForRoot(root);
    let index, msg, faceIndex, readSource;
    if (independentHost) {
        if (!independentHost.contains(details) || independentHost.dataset.rmState !== 'ready')
            return null;
        const identity = resolveIndependentActionIdentity(details);
        if (!identity)
            return null;
        index = identity.index;
        msg = identity.msg;
        faceIndex = externalFaceDetails(independentHost).indexOf(details);
        if (faceIndex < 0)
            return null;
        readSource = () => mirrorImageFaceSource(savedIndependentRecordForOwner(getContext(), index, msg, readStore())?.html, faceIndex);
    }
    else {
        const followHost = details.closest?.(`[${SOURCE_ATTR}][data-rm-source="follow"]`);
        const el = followHost ? messageElementForExternalHost(followHost) : details.closest?.('.mes[mesid], [mesid].mes');
        const owner = followRecoveryOwner(el);
        if (!owner || !isRabbitMirrorEligibleAssistantMessage(owner.message))
            return null;
        index = owner.index;
        msg = owner.message;
        faceIndex = (followHost ? externalFaceDetails(followHost) : inlineRabbitMirrorDetails(el)).indexOf(details);
        if (faceIndex < 0)
            return null;
        readSource = () => {
            for (const source of followMessageSourceCandidates(msg)) {
                const face = mirrorImageFaceSource(source, faceIndex);
                if (face)
                    return face;
            }
            return '';
        };
    }
    const faceSource = readSource();
    if (!faceSource)
        return null;
    const ownerChat = chatKey(ctx), ownerSwipe = swipeId(msg), ownerSource = messageSourceFingerprint(msg);
    const template = document.createElement('template');
    template.innerHTML = faceSource;
    template.content.querySelectorAll('script,style,noscript,[data-rabbit-mirror-tool-entry-host], [data-rm-face-swipe-host], [data-rm-image-region], [data-rm-image-portal],[data-rm-image-region]').forEach(node => node.remove());
    const title = String(template.content.querySelector('summary')?.textContent || __rmT("9.JSSv1i")).trim();
    const faceText = String(template.content.textContent || '').trim();
    if (!faceText)
        return null;
    const drawFree = template.content.cloneNode(true);
    drawFree.querySelectorAll('[data-rm-draw-prompt],[data-rm-draw-char],[data-rm-draw-tags],[data-rm-draw-char-tags]').forEach(node => node.remove());
    const faceTextWithoutDraw = String(drawFree.textContent || '').trim() || faceText;
    const imageHasCharacter = !!(ctx.characters?.[ctx.characterId] || ctx.character);
    const char = ctx.characters?.[ctx.characterId] || ctx.character || {};
    const imageCharacterId = ctx.characterId;
    const st = getSettings();
    const imageReadCharacter = st.independentReadCharacterCardSummary !== false;
    const imageReadPersona = st.independentReadPersonaSummary !== false;
    const { character, persona } = mirrorImageReferenceSnapshot(ctx, st);
    const imageReferenceKey = JSON.stringify({ character, persona });
    const key = JSON.stringify([ownerChat, index, ownerSwipe, faceIndex, hashText(faceSource)]);
    const altKeys = [];
    if (independentHost) {
        try {
            const record = savedIndependentRecordForOwner(ctx, index, msg, readStore());
            const initialFace = record?.initialHtml ? mirrorImageFaceSource(record.initialHtml, faceIndex) : '';
            if (initialFace && initialFace !== faceSource)
                altKeys.push(JSON.stringify([ownerChat, index, ownerSwipe, faceIndex, hashText(initialFace)]));
        }
        catch { }
    }
    const assertCurrent = () => {
        const live = getContext();
        const settings = getSettings();
        const currentCharacter = live.characters?.[live.characterId] || live.character || null;
        if (!currentRuntime() || !root.isConnected || !details.isConnected || chatKey(live) !== ownerChat || live.chat?.[index] !== msg
            || live.characterId !== imageCharacterId || (imageHasCharacter ? currentCharacter !== char : currentCharacter !== null)
            || (settings.independentReadCharacterCardSummary !== false) !== imageReadCharacter
            || (settings.independentReadPersonaSummary !== false) !== imageReadPersona
            || JSON.stringify(mirrorImageReferenceSnapshot(live, settings)) !== imageReferenceKey
            || swipeId(msg) !== ownerSwipe || messageSourceFingerprint(msg) !== ownerSource || readSource() !== faceSource)
            throw new Error(__rmT("FTF.VQlMvoTQKtcitZT7Rt.vPrL8YPhb5L8RE_wqIo8EgBxIkgTSRQs0sOOZK9.8XJ7ulSKSdZhR1hn07XXr8slWpPFARTQlnNl3mAw9"));
        return true;
    };
    const savedDiagnostic = independentHost ? savedIndependentRecordForOwner(ctx, index, msg, readStore())?.apiRequest : null;
    const recipe = independentHost ? (Array.isArray(savedDiagnostic?.faces) ? savedDiagnostic.faces[faceIndex] : faceIndex === 0 ? savedDiagnostic : null)
        : getRabbitMirrorRecipe({ chatKey: ownerChat, messageIndex: index, swipeId: ownerSwipe, message: msg, faceIndex, includeExternalOnly: true });
    const formats = (Array.isArray(recipe?.formatIds) ? recipe.formatIds : []).map((id, index) => {
        const item = String(id).startsWith('ext:') ? recipe?.formatDescriptors?.find(item => item.id === id) : PRESENTATION_FORMATS.find(item => item.id === id);
        const label = String(recipe?.formatLabels?.[index] || '');
        return item ? { title: String(item.title || ''), summary: String(item.summary || '') } : label.startsWith(`${id} `) ? { title: label.slice(String(id).length + 1), summary: '' } : null;
    }).filter(Boolean);
    const presentationMode = recipe?.requestedPresentationMode === 'longtext' ? 'longtext' : recipe?.presentationMode || 'html';
    const target = { key, altKeys, title, faceText, faceTextWithoutDraw, floor: index, character, persona, presentationMode, formats, group: character.name || persona.name || __rmT("9.JSSv1i"), assertCurrent,
        plan: (input = {}, options = {}) => requestMirrorImagePlan(target, input, options) };
    mirrorImageTargetCache.set(details, target);
    return target;
}
async function requestMirrorImagePlan(target, input = {}, options = {}) {
    target.assertCurrent();
    const current = getSettings();
    if (current.imageEnabled !== true && !(options.builtin === true && current.builtinImageEnabled === true))
        throw new Error(__rmT("8STykmYHLDUz0S8r9hy7tP9wut__8DbUYo_PTBNQgG8"));
    const { imageLlmSettings } = await import('../imageLlm.js?rmv=2.5.2');
    const st = imageLlmSettings({ ...current, independentExcludedParams: Array.isArray(current.independentExcludedParams) ? [...current.independentExcludedParams] : current.independentExcludedParams });
    if ((!st.independentConnectionProfileId && !st.independentApiBaseUrl) || !st.independentApiModel)
        throw new Error(__rmT("KVbwQfB8jdVy4ATr1_jgvi2TRRcSg4LmxLopxSIYLEJ.bNiayOeN_.TEkNrEzWrKPa12mp1QUuA1dzRVT0ixsT1NOjV504YO"));
    const { buildImagePlanningPrompt, parseImagePlan } = await import('../imagePlan.js?rmv=2.5.2');
    target.assertCurrent();
    const focus = String(input.focus || '').trim();
    const promptFormat = (input.promptFormat || st.imagePromptFormat) === 'nai45-tags' ? 'nai45-tags' : 'nai5-natural';
    const sceneCharacters = (Array.isArray(input.sceneCharacters) ? input.sceneCharacters : []).slice(0, 4)
        .map(person => ({ name: String(person?.name || '').slice(0, 40), text: String(person?.text || '').slice(0, 800) })).filter(person => person.name && person.text);
    let worldBookCast = '';
    try {
        const { readCharacterWorldBookContext } = await import('../characterWorldBook.js?rmv=2.5.2');
        const castFocus = [target.faceText, focus, ...sceneCharacters.map(person => person.name)].join('\n').slice(-20000);
        const cast = await readCharacterWorldBookContext(getContext(), { signal: options.signal, disabledBooks: current.independentWorldInfoDisabledBooks || [], focusText: castFocus, filterContent: value => stripExcludedTagsFromReference(value), onlyMentioned: true, maxChars: 3000, assertCurrent: () => target.assertCurrent() });
        worldBookCast = String(cast?.text || '');
    }
    catch (error) {
        if (error?.name === 'AbortError')
            throw error;
        worldBookCast = '';
    }
    target.assertCurrent();
    const planningInput = cast => ({ ...input, title: target.title, faceText: focus ? (target.faceTextWithoutDraw || target.faceText) : target.faceText, focus, sceneCharacters, worldBookCast: cast,
        floor: target.floor, character: target.character, persona: target.persona, presentationMode: target.presentationMode, formats: target.formats,
        compositionMode: input.compositionMode || st.imageCompositionMode, promptFormat });
    const maxRequestChars = configuredIndependentMaxRequestChars(st);
    let { systemPrompt, userPrompt } = buildImagePlanningPrompt(planningInput(worldBookCast));
    if (worldBookCast && systemPrompt.length + userPrompt.length > maxRequestChars)
        ({ systemPrompt, userPrompt } = buildImagePlanningPrompt(planningInput('')));
    if (systemPrompt.length + userPrompt.length > maxRequestChars)
        throw new Error(`${__rmT("QRNfapX7Ct8A9cd6QfNSLgzsXkE0VwbBmUdoDf")}${maxRequestChars}${__rmT("3IrbiuwEa3ocpeXEhoAkGL2y6zro0k1RnF2sXewdCsJDo_C8Jb3td15X")}`);
    const connectionKeys = ['imageEnabled', 'independentApiBaseUrl', 'independentApiKey', 'independentApiModel', 'independentConnectionProfileId',
        'independentAdvancedEnabled', 'independentReasoningEffort', 'independentExtraParams', 'independentExcludedParams', 'independentMaxRequestChars'];
    const assertCurrent = () => {
        target.assertCurrent();
        options.assertCallerCurrent?.();
        const live = imageLlmSettings(getSettings());
        if (connectionKeys.some(key => JSON.stringify(live[key]) !== JSON.stringify(st[key])))
            throw new Error(__rmT("8dX4mtKS2RTAGFO4ilyn7EfWNDHgaMv0TVJHIefiaJQc1PCiMB.HbYqc2hvi0aJ8LRtlxNhJCbpNvcZUqAk"));
        if (options.signal?.aborted)
            throw new DOMException(__rmT("UnzpnAi8v7xarN9v1yk"), 'AbortError');
    };
    const lease = createManualDispatchLease();
    const guardedLease = { consume() { assertCurrent(); return lease.consume(); }, release: () => lease.release(), consumed: () => lease.consumed() };
    const result = await requestIndependentCompletion(st, systemPrompt, userPrompt, { signal: options.signal, dispatchLease: guardedLease,
        advancedSettings: st, assertAdvancedCurrent: assertCurrent, onProgress: options.onProgress, diagnosticContext: { imagePlanning: true } });
    if (!result.response?.ok || result.semanticError)
        throw new Error(result.semanticError || __rmT("qwM0XII4syUDq1HGvbJhFqaDi6hJgrJeYU_uImKq"));
    const plan = { ...parseImagePlan(result.result?.text || '', { promptFormat }), promptFormat };
    options.onCompleted?.(plan);
    assertCurrent();
    return plan;
}
export function independentBackfillFloorToken(index) {
    try {
        const m = getContext().chat?.[Number(index)];
        if (!m)
            return '';
        const text = String(m.mes || '');
        return `${String(m.send_date || '')}|${text.length}|${text.slice(0, 32)}`;
    }
    catch {
        return '';
    }
}
export async function prepareIndependentBackfillFloor(index, { chat = '', token = '', keepGoing = null } = {}) {
    const id = Number(index);
    if (!Number.isInteger(id) || messageElement(id))
        return;
    const ctx = getContext();
    if (chat && chatKey(ctx) !== chat)
        return;
    const st = getSettings();
    if (st.enabled === false || st.autoRabbitMirrorInjection === false || independentGenerationTiming(st) === 'off')
        return;
    if (!currentRuntime() || runtimeMode() !== 'independent')
        return;
    const msg = ctx.chat?.[id];
    if (!isRabbitMirrorEligibleAssistantMessage(msg) || !hasUsableAssistantBody(msg))
        return;
    if (token && independentBackfillFloorToken(id) !== token)
        return;
    try {
        if (mainReplyAbnormalReason(msg, automaticMainReplySafetyOptions(ctx, id)))
            return;
    }
    catch { }
    try {
        if (hasExistingFollowRabbitMirror(ctx, id, msg))
            return;
        const saved = savedIndependentRecordForOwner(ctx, id, msg, readStore());
        if (saved?.html && independentStoredHtmlRestorable(saved.html))
            return;
    }
    catch { }
    const go = () => (!chat || chatKey(getContext()) === chat) && (typeof keepGoing !== 'function' || keepGoing() !== false);
    try {
        const snapshot = await import('../theaterSnapshot.js?rmv=2.5.2');
        await snapshot.revealChatFloor(id, { keepGoing: go });
    }
    catch { }
}
export async function backfillIndependentFloor(index, { chat = '', token = '' } = {}) {
    const ctx = getContext();
    const st = getSettings();
    if (st.enabled === false || st.autoRabbitMirrorInjection === false || independentGenerationTiming(st) === 'off')
        return { status: 'stopped', message: __rmT("RP6BSnkqu9y3pCJpKNpPlh") };
    if (!currentRuntime() || runtimeMode() !== 'independent')
        return { status: 'stopped', message: __rmT("K3BLkop9i3XVqS3qKewoqnCAvv1xA.2VBsf") };
    if (chat && chatKey(ctx) !== chat)
        return { status: 'stopped', message: __rmT("uqMnIPTnay0AkrIF") };
    const id = Number(index);
    const msg = ctx.chat?.[id];
    if (!Number.isInteger(id) || !isRabbitMirrorEligibleAssistantMessage(msg) || !hasUsableAssistantBody(msg))
        return { status: 'skipped', message: __rmT("NSRKo0FeUXrfXgI.kXE") };
    if (token && independentBackfillFloorToken(id) !== token)
        return { status: 'skipped', message: __rmT("doJ4lTvuutLq9IeJ64iUyJ18O6quvkcD8MXyAtZ8") };
    try {
        const odd = mainReplyAbnormalReason(msg, automaticMainReplySafetyOptions(ctx, id));
        if (odd)
            return { status: 'skipped', message: `${String(odd).slice(0, 80)}${__rmT("2OkQLTC90UqBDcvPt8zWKk")}` };
    }
    catch { }
    const has = () => {
        const live = getContext();
        const m = live.chat?.[id];
        if (!m)
            return false;
        if (hasExistingFollowRabbitMirror(live, id, m))
            return true;
        const saved = savedIndependentRecordForOwner(live, id, m, readStore());
        return !!(saved?.html && independentStoredHtmlRestorable(saved.html));
    };
    if (has())
        return { status: 'skipped', message: __rmT("Unz3BE9vH0OpcnJiStT") };
    if (!messageElement(id))
        return { status: 'skipped', message: __rmT("3cKSeLkvFkiwuns1b06CqYLgB89j11jCDuYAs4qrPjA8EPXn0QR9yl6vg4PHFClX.zDEtJDacTBeEf") };
    try {
        await generateFor(id, msg, true, true, null, null, null, null, null, '');
    }
    catch (error) {
        return { status: 'failed', message: String(error?.message || error || __rmT("eP6y8dbkGU_")) };
    }
    const live = getContext();
    if (chat && chatKey(live) !== chat)
        return { status: 'stopped', message: __rmT("uqMnIPTnay0AkrIF") };
    if (has())
        return { status: 'done' };
    let message = __rmT("zYLTVV2SY9w84peSvkQUFNMmJOCMYjoRnKLYHRTuF8Dd0uIROg9kBXpvkCY");
    try {
        const m = live.chat?.[id];
        const observed = m ? passiveObservedIdentity(live, id, m) : null;
        const stop = observed ? automaticFailureStopFor(observed.slot, observed.sourceHash) : null;
        if (stop?.message && !isMissingShellStop(stop))
            message = String(stop.message).slice(0, 200);
    }
    catch { }
    return { status: 'failed', message };
}
export function independentBackfillChatKey() { try {
    return String(chatKey(getContext()) || '');
}
catch {
    return '';
} }
export function independentBackfillBusy() {
    try {
        if (hostGenerationLooksActive())
            return true;
    }
    catch { }
    try {
        return globalFlights().size > 0;
    }
    catch {
        return false;
    }
}
export function installIndependentActionBridge() {
    writeIndependentActionBridge({
        runtime: RUNTIME_VERSION,
        generateManual: root => generateManualIndependentMirror(root),
        prepareImageTarget: root => prepareMirrorImageTarget(root),
        prepareQuickResay: (root, owner = {}, options = {}) => prepareQuickResay(root, owner, options),
        resay: (root, owner = {}, options = {}) => resayIndependentMirror(root, owner, options),
        history: (root, owner = {}) => true,
        recoverSaved: (root, owner = {}) => recoverSavedIndependentMirror(root, owner),
        swipeView: (root, owner = {}) => independentFaceSwipeView(root, owner),
        selectSwipe: (root, index, owner = {}) => applyIndependentFaceSwipe(root, index, owner),
        deleteSwipe: (root, owner = {}) => deleteIndependentFaceSwipe(root, owner),
        restoreInitial: root => restoreIndependentFaceSwipeInitial(root),
        hasSwipeInitial: root => hasIndependentSwipeInitial(root),
        canResay: (root, owner = {}) => canIndependentFaceResay(root, owner),
    });
    globalThis[ACTION_BRIDGE_KEY] = independentActionBridge;
}
export function removeIndependentActionBridge() {
    if (globalThis[ACTION_BRIDGE_KEY] === independentActionBridge)
        delete globalThis[ACTION_BRIDGE_KEY];
    writeIndependentActionBridge(null);
}
function handleFeedbackMirrorActionEvent(event) {
    const detail = event?.detail;
    if (!detail || typeof detail !== 'object')
        return;
    if (event.type === RESAY_EVENT) {
        if (resayIndependentMirror(detail.root, detail.owner || {}, detail.options || {}))
            detail.handled = true;
        return;
    }
    if (event.type === HISTORY_EVENT) {
        if (showIndependentHistory(detail.root, detail.owner || {}))
            detail.handled = true;
    }
}
export function installFeedbackMirrorActionListeners() {
    if (feedbackActionListenerInstalled)
        return;
    document.addEventListener(RESAY_EVENT, handleFeedbackMirrorActionEvent);
    document.addEventListener(HISTORY_EVENT, handleFeedbackMirrorActionEvent);
    feedbackActionListenerInstalled = true;
}
export function removeFeedbackMirrorActionListeners() {
    if (!feedbackActionListenerInstalled)
        return;
    document.removeEventListener(RESAY_EVENT, handleFeedbackMirrorActionEvent);
    document.removeEventListener(HISTORY_EVENT, handleFeedbackMirrorActionEvent);
    feedbackActionListenerInstalled = false;
    closeIndependentHistoryPanel();
}
function handleFollowMultifaceCommitted(event) {
    if (runtimeMode() !== 'follow-external')
        return false;
    const detail = event?.detail;
    const index = Number(detail?.messageIndex);
    const sourceHash = String(detail?.sourceHash || '').slice(0, 64);
    const batchId = String(detail?.batchId || '').slice(0, 180);
    if (!Number.isInteger(index) || index < 0 || !sourceHash || !batchId)
        return false;
    const ctx = getContext();
    const msg = ctx?.chat?.[index];
    if (!isRabbitMirrorEligibleAssistantMessage(msg) || messageSourceFingerprint(msg) !== sourceHash)
        return false;
    queueMessageSync([index]);
    return true;
}
function followAutomaticRerollDeps() {
    return {
        getContext,
        hostBusy: hostGenerationLooksActive,
        maxRequestChars: configuredIndependentMaxRequestChars(getSettings()),
        followBatchFailure: getRabbitMirrorFollowBatchFailure,
        messageElement,
        extractReadyDetails,
        replaceExternalFace: replaceExternalMultifaceFace,
        context: (ctx, index) => { const snapshot = globalWorldInfoSnapshotFor(ctx, index, ctx.chat[index]); return contextBundle(ctx, index, snapshot, globalWorldInfoContextView(snapshot), CONTEXT_TOTAL_BUDGET, createIndependentVisibleTextReader(index)); },
    };
}
export function installFollowMultifaceCommitListener() {
    if (followMultifaceCommitListenerInstalled)
        return;
    globalThis.addEventListener?.(FOLLOW_MULTIFACE_COMMITTED_EVENT, handleFollowMultifaceCommitted);
    globalThis.addEventListener?.(FOLLOW_MULTIFACE_REJECTED_EVENT, handleFollowMultifaceRejected);
    globalThis.addEventListener?.(FOLLOW_GENERATION_SETTLED_EVENT, handleFollowGenerationSettled);
    followMultifaceCommitListenerInstalled = true;
}
export function removeFollowMultifaceCommitListener() {
    if (!followMultifaceCommitListenerInstalled)
        return;
    globalThis.removeEventListener?.(FOLLOW_MULTIFACE_COMMITTED_EVENT, handleFollowMultifaceCommitted);
    globalThis.removeEventListener?.(FOLLOW_MULTIFACE_REJECTED_EVENT, handleFollowMultifaceRejected);
    globalThis.removeEventListener?.(FOLLOW_GENERATION_SETTLED_EVENT, handleFollowGenerationSettled);
    followMultifaceCommitListenerInstalled = false;
}
function handleFollowMultifaceRejected(event) {
    const index = Number(event?.detail?.messageIndex);
    if (!Number.isInteger(index) || index < 0)
        return false;
    const ctx = getContext();
    const failure = getRabbitMirrorFollowBatchFailure(ctx?.chat, index);
    if (!failure || failure.batchId !== event?.detail?.batchId)
        return false;
    queueMessageSync([index]);
    void import('../followAutomaticReroll.js?rmv=2.5.2').then(({ maybeAutomaticFollowReroll }) => maybeAutomaticFollowReroll(index, followAutomaticRerollDeps()));
    return true;
}
function handleFollowGenerationSettled(event) {
    const index = Number(event?.detail?.messageIndex);
    if (!Number.isInteger(index) || index < 0)
        return false;
    if (event?.detail?.cancelled === true) {
        void import('../followAutomaticReroll.js?rmv=2.5.2').then(({ markFollowAutomaticRerollCancelled }) => {
            markFollowAutomaticRerollCancelled(getContext(), index);
        });
        return true;
    }
    void import('../followAutomaticReroll.js?rmv=2.5.2').then(({ maybeAutomaticFollowReroll }) => maybeAutomaticFollowReroll(index, followAutomaticRerollDeps()));
    return true;
}
function cloneFollowFaceForExternal(root) {
    const clone = restoreRuntimeAnimationClone(root, root.cloneNode(true));
    const controls = [...root.querySelectorAll('input, textarea, select')];
    const copies = [...clone.querySelectorAll('input, textarea, select')];
    for (let index = 0; index < controls.length; index++) {
        const original = controls[index], copy = copies[index];
        if (!copy || copy.tagName !== original.tagName)
            continue;
        if (original.matches('input[type="checkbox"], input[type="radio"]')) {
            copy.toggleAttribute('checked', !!original.checked);
        }
        else if (original.tagName === 'SELECT') {
            for (let option = 0; option < original.options.length; option++)
                copy.options[option]?.toggleAttribute('selected', !!original.options[option].selected);
        }
        else if (original.tagName === 'TEXTAREA')
            copy.textContent = original.value;
        else if (original.type !== 'file' && original.type !== 'password')
            copy.setAttribute('value', original.value);
    }
    return clone;
}
export function externalizeFollowMirror(index, msg) {
    const st = getSettings();
    if (st.generationSource !== 'follow' || st.followDisplayMode !== 'external')
        return;
    const el = messageElement(index);
    const body = messageBody(el);
    if (!body)
        return;
    const ctx = getContext();
    if (ctx?.chat?.[index] !== msg)
        return;
    const rejected = getRabbitMirrorFollowBatchFailure(ctx.chat, index);
    if (rejected) {
        showFollowRecoveryNotice(el, rejected);
        return;
    }
    const mirrors = inlineRabbitMirrorDetails(el);
    const mirror = mirrors[0] || null;
    if (!mirror)
        return;
    const key = `follow:${recordKey(ctx, index, msg)}`;
    const multiSource = followMessageSourceCandidates(msg).find(hasMultifaceMarkup);
    if (multiSource) {
        const parsed = parseMultifaceOutput(multiSource, { allowProse: true });
        if (!parsed.ok || mirrors.length !== parsed.faces.length)
            return;
        let verifiedRoots = [];
        const proven = mirrors.every((details, faceIndex) => {
            const root = details.closest?.('toto[data-rabbit-mirror="true"]') || details;
            const proof = getSanitizedRabbitMirrorFaceProof(root);
            const valid = proof?.origin === 'follow'
                && Number(proof.faceIndex) === faceIndex
                && Number(proof.faceCount) === parsed.faces.length
                && String(proof.sourceHash || '') === rabbitMirrorMultifaceSourceHash(parsed.faces[faceIndex]?.html || '');
            if (valid)
                verifiedRoots.push(root);
            return valid;
        });
        if (!proven) {
            let recoveryFailure = null;
            const recovered = recoveredFollowFaces(multiSource, { ctx, messageIndex: index, message: msg,
                onFailure: failure => { recoveryFailure = failure; } });
            if (recovered.length !== parsed.faces.length) {
                if (recoveryFailure)
                    showFollowRecoveryNotice(el, recoveryFailure);
                return;
            }
            verifiedRoots = recovered;
        }
        const preparedFaces = verifiedRoots.map((root, faceIndex) => {
            const clone = cloneFollowFaceForExternal(root);
            normalizeRecoveredFollowRoot(clone);
            stripIndependentTransientLayoutArtifacts(clone);
            return wrapPreparedIndependentFace(clone.outerHTML, faceIndex);
        });
        if (preparedFaces.some(face => !face))
            return;
        const html = preparedFaces.join('\n');
        if (!parseMultifaceOutput(html, { expectedCount: parsed.faces.length }).ok)
            return;
        const host = ensureExternalUi(el, key, html, 'ready', 'follow', messageSourceFingerprint(msg));
        if (!host || externalFaceDetails(host).length !== parsed.faces.length || !externalFaceDetails(host).every(usableReadyDetails))
            return;
        followOriginMarker(el, mirror.closest?.('toto') || mirror, true);
        for (const original of mirrors)
            removeInlineMirrorDuplicate(original);
        return;
    }
    const sourceClone = cloneFollowFaceForExternal(mirror);
    sourceClone.querySelectorAll?.('[data-rabbit-mirror-tool-entry-host], [data-rm-face-swipe-host], [data-rm-image-region], [data-rm-image-portal], [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-rabbit-mirror-resay]')?.forEach(node => node.remove());
    const sourceHtml = String(sourceClone.outerHTML || '');
    const semanticFingerprint = mirrorSemanticFingerprint(mirror);
    if (!followOriginMarker(el, null, false)) {
        const legacyContainer = legacyFollowOriginContainer(body);
        if (legacyContainer && !legacyContainer.contains(mirror))
            legacyContainer.append(mirror);
    }
    followOriginMarker(el, mirror, true);
    let host = collapseDuplicateIdentityHosts(el, key, 'follow', '');
    if (!host) {
        host = document.createElement('div');
        host.setAttribute(SOURCE_ATTR, 'true');
        host.setAttribute(EXTERNAL_SHELL_ATTR, 'true');
        host.className = 'rabbit-mirror-external-host rabbit-mirror-external-shell';
    }
    const previous = host.querySelector?.(':scope > details');
    const existingTools = externalToolHost(previous);
    mirror.querySelector?.(':scope > summary > [data-rabbit-mirror-tool-entry-host]')?.remove?.();
    mirror.querySelectorAll?.('[data-rm-face-swipe-host]')?.forEach(node => node.remove());
    if (existingTools && mirror.querySelector?.(':scope > summary'))
        mirror.querySelector(':scope > summary').append(existingTools);
    mirror.removeAttribute('open');
    markExternalDetails(mirror, key, 'follow');
    if (previous?.isConnected)
        previous.replaceWith(mirror);
    else
        host.append(mirror);
    host.dataset.rmKey = key;
    host.dataset.rmSource = 'follow';
    host.dataset.rmState = 'ready';
    host.__rabbitMirrorIndependentSource = sourceHtml;
    placeExternalHost(el, host, key, 'follow');
    removeDuplicateExternalHosts(el, host, 'follow');
    for (const duplicate of inlineRabbitMirrorDetails(el)) {
        if (duplicate === mirror)
            continue;
        if (semanticFingerprint && mirrorSemanticFingerprint(duplicate) === semanticFingerprint)
            removeInlineMirrorDuplicate(duplicate);
    }
    scheduleExternalShellTint(host, sourceHtml);
    ensureExternalTools(host);
}
export function restoreFollowInline(elOrHost) {
    const el = elOrHost?.matches?.(`[${SOURCE_ATTR}]`) ? messageElementForExternalHost(elOrHost) : elOrHost;
    const host = elOrHost?.matches?.(`[${SOURCE_ATTR}][data-rm-source="follow"]`)
        ? elOrHost
        : externalHosts(el).find(node => node.dataset.rmSource === 'follow');
    if (!host)
        return false;
    const owner = followRecoveryOwner(el);
    const rejected = owner ? getRabbitMirrorFollowBatchFailure(owner.ctx.chat, owner.index) : null;
    if (rejected) {
        showFollowRecoveryNotice(el, rejected);
        return false;
    }
    const faces = externalFaceDetails(host);
    if (faces.length > 1) {
        if (!owner || host.dataset.rmSourceHash !== messageSourceFingerprint(owner.message))
            return false;
        const source = followMessageSourceCandidates(owner.message).find(hasMultifaceMarkup);
        const parsed = source ? parseMultifaceOutput(source, { allowProse: true }) : null;
        if (!parsed?.ok || parsed.faces.length !== faces.length || faces.some((details, faceIndex) => {
            const proof = getSanitizedRabbitMirrorFaceProof(details);
            return proof?.origin !== 'follow' || proof.faceIndex !== faceIndex || proof.faceCount !== faces.length
                || proof.sourceHash !== messageSourceFingerprint(owner.message);
        }))
            return false;
        const body = messageBody(el);
        if (!body)
            return false;
        const marker = followOriginMarker(el, null, false);
        const fragment = document.createDocumentFragment();
        for (const [index, details] of faces.entries()) {
            normalizeRecoveredFollowRoot(details);
            const toto = document.createElement('toto');
            toto.setAttribute('data-rabbit-mirror', 'true');
            toto.setAttribute('data-rm-face', String(index + 1));
            toto.append(details);
            markSanitizedRabbitMirrorFace(toto, { origin: 'follow', faceIndex: index, faceCount: faces.length,
                sourceHash: rabbitMirrorMultifaceSourceHash(parsed.faces[index].html), ...presentationModeFields(getSanitizedRabbitMirrorFaceProof(details)) });
            fragment.append(toto);
        }
        if (marker)
            marker.replaceWith(fragment);
        else
            body.append(fragment);
        host.remove();
        removeEmptyFollowExternalAnchors(el || document);
        return true;
    }
    const mirror = host.querySelector(':scope > details');
    const body = messageBody(el);
    if (!mirror || !body) {
        host.hidden = false;
        return false;
    }
    {
        mirror.removeAttribute('data-rabbit-mirror-external-details');
        mirror.removeAttribute('data-rabbit-mirror-external-owner');
        delete mirror.dataset.rabbitMirrorExternalOwner;
        delete mirror.dataset.rabbitMirrorExternalSource;
        delete mirror.dataset.rabbitMirrorOwnerChat;
        delete mirror.dataset.rabbitMirrorOwnerMesid;
        delete mirror.dataset.rabbitMirrorOwnerSwipe;
        delete mirror.dataset.rabbitMirrorOwnerKey;
        delete mirror.dataset.rabbitMirrorOwnerSourceHash;
        const marker = followOriginMarker(el, null, false);
        if (marker)
            marker.replaceWith(mirror);
        else {
            const legacyContainer = legacyFollowOriginContainer(body);
            if (legacyContainer)
                legacyContainer.append(mirror);
            else
                body.append(mirror);
        }
    }
    const parent = host.parentElement;
    host.remove();
    if (parent?.hasAttribute?.(FOLLOW_EXTERNAL_ANCHOR_ATTR) && !parent.querySelector?.(`[${SOURCE_ATTR}][data-rm-source="follow"]`))
        parent.remove();
    removeEmptyFollowExternalAnchors(el || document);
    return true;
}
function followDetailsRootFromHtml(html = '') {
    const raw = String(html || '');
    if (!raw || !/<(?:toto|details)\b/i.test(raw) || !__rmR("c7Hz9EYKo8c4TBl7X_tm7iBWfDGQaqkGxvAwLJVKGmp18oVQbtjPkXMdpFxQR1ZVI13Wa5M2yaw.Pcj9K1k", "i").test(raw))
        return null;
    const cleaned = cleanRabbitMirrorOutput(raw);
    if (!cleaned)
        return null;
    const source = sanitizeIndependentReadyFragment(cleaned);
    if (!source)
        return null;
    try {
        const template = document.createElement('template');
        template.innerHTML = source;
        const details = [...template.content.querySelectorAll('details')].find(node => isRabbitMirrorDetails(node));
        if (!details)
            return null;
        const toto = details.closest('toto');
        const root = (toto || details).cloneNode(true);
        rearmRabbitMirrorSerializedInteractionRoot(root);
        return root;
    }
    catch {
        return null;
    }
}
function followRecoveryOwner(el, message = null) {
    const ctx = getContext();
    const raw = el?.getAttribute?.('mesid');
    const index = raw == null ? -1 : Number(raw);
    if (!Number.isInteger(index) || index < 0 || messageElement(index) !== el)
        return null;
    const current = ctx?.chat?.[index];
    if (!current || current.is_user === true || isRabbitMirrorToolResultMessage(current) || (message && current !== message))
        return null;
    return { ctx, index, message: current };
}
function showFollowRecoveryNotice(el, failure = {}) {
    if (!el)
        return;
    let notice = el.querySelector?.('[data-rabbit-mirror-follow-failure], [data-rabbit-mirror-follow-recovery-notice]');
    if (!notice) {
        notice = document.createElement('div');
        (messageBody(el) || el).append(notice);
    }
    notice.setAttribute('data-rabbit-mirror-follow-recovery-notice', 'true');
    notice.setAttribute('role', 'status');
    const face = Number(failure.terminalFace);
    const label = Number.isInteger(face) && face > 0 ? `${__rmT("KW5o9cc6")}${face}${__rmT("qGyf7qZp")}` : '';
    const knownFailure = failure.kind === 'follow-multiface-rejected';
    notice.textContent = `${__rmT("9.JSSv1i")}${knownFailure ? __rmT("kuW4tep6ImZWyEyM") : __rmT("9McD4zTirEsYIbeD")}${label}${__rmT("7ys")}${String(failure.message || __rmT("WzH1RrCcgXQ4vmN3p.nKwL7.5ql7iOgD29E"))}${__rmT("4JO21wKoGFy1lgo6gZSen7BRqPmrrk")}`;
    notice.dataset.rmRecoveryCode = String(failure.code || 'follow-recovery-rejected');
}
function clearFollowRecoveryNotice(el) {
    el?.querySelectorAll?.('[data-rabbit-mirror-follow-failure], [data-rabbit-mirror-follow-recovery-notice]')?.forEach(node => node.remove());
}
function followRecipeSource(message) {
    const swipe = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
    return swipe >= 0 && typeof message?.swipes?.[swipe] === 'string' ? message.swipes[swipe] : String(message?.mes || '');
}
function nativeRecoveredFollowMedia(details) {
    const radios = [...details.querySelectorAll('input[type="radio"][id]')];
    const labels = [...details.querySelectorAll('label[for]')];
    const linked = labels.filter(label => radios.some(input => input.id === label.getAttribute('for')));
    const range = details.querySelector('input[type="range"][min][max]');
    const text = String(details.textContent || '');
    if (radios.length >= 2 && linked.length >= 2 && range && /\b(?:FM|AM|MHz|kHz)\b/i.test(text)) {
        const min = Number(range.getAttribute('min')), max = Number(range.getAttribute('max'));
        if (Number.isFinite(min) && Number.isFinite(max) && max > min && linked.filter(label => __rmR("CxgmN9gOG72IHarRLLr8sPD4OV5ZRX0Ce8ZlQbEQ6JdKnSfg4a2KZT0ebBTIeT", "i").test(label.textContent || '')).length >= 2) {
            return [{ id: 'legacy-structure:radio-tuner', title: __rmT("bg8iAcYeVCD"), summary: __rmT("Up4oE2t40_ypR3QnV7jwzl0bx_XS_b2QDgAMe76xCXE9oFTGnX7ou15X"), tags: ['tuner'] }];
        }
    }
    const css = [...details.querySelectorAll('style')].map(style => String(style.textContent || '')).join('\n');
    if (radios.length >= 2 && linked.filter(label => __rmR("ixlYkubOFHNgYG78l_RyKaxwt.w_RdSas5deDjwb1LMnT8GwIdB3FwE.5yKYQPYLD3yPFYy.hgeE540c4WZ9EIhiAzC2YyRO5IfKIf", "").test(label.textContent || '')).length >= 2
        && /rotateY\s*\(/i.test(css) && /transform-style\s*:\s*preserve-3d/i.test(css) && /:checked\b/.test(css)) {
        return [{ id: 'legacy-structure:page-turn', title: __rmT("hPrR5MqdsCD"), summary: __rmT("lOG5.SobGtAi7ee48hmRu9aEo4I2gYCxxaGX2uie1If0LIZ6vYfRa90itmIDWGWwqbw7cFGP"), tags: ['page-turn'] }];
    }
    return [];
}
function resayFaceSummaryKey(detailsHtml = '') {
    return normalizedSummaryText(parseMultifaceOutput(`<toto data-rabbit-mirror="true" data-rm-face="1">${detailsHtml}</toto>`, { storedDisplay: true }).faces[0]?.summaryHtml || '');
}
function distinctResayFaceDetails(detailsHtml, neighbors, faceIndex) {
    const key = resayFaceSummaryKey(detailsHtml);
    if (!key || !neighbors.some(face => normalizedSummaryText(face.summaryHtml || '') === key))
        return detailsHtml;
    const summary = parseMultifaceOutput(`<toto data-rabbit-mirror="true" data-rm-face="1">${detailsHtml}</toto>`, { storedDisplay: true }).faces[0]?.summaryHtml;
    if (typeof summary !== 'string')
        return detailsHtml;
    const at = detailsHtml.indexOf(`${summary}</summary>`);
    if (at < 0)
        return detailsHtml;
    const end = at + summary.length;
    const mark = `${__rmT("KW5o9cc6")}${faceIndex + 1}${__rmT("qGyf7qZp")}`;
    const retitled = __rmR("HCYeOLfpV_R_Th", "").test(summary)
        ? detailsHtml.slice(0, at) + summary.replace(__rmR("3UcM1QmehLCX0C_6JPD", ""), `${mark}${__rmT("66tLApx6")}`) + detailsHtml.slice(end)
        : detailsHtml.slice(0, end) + mark + detailsHtml.slice(end);
    return resayFaceSummaryKey(retitled) && !neighbors.some(face => normalizedSummaryText(face.summaryHtml || '') === resayFaceSummaryKey(retitled)) ? retitled : detailsHtml;
}
function mergeResayFaceIntoBatch(candidates, faceIndex, replacementDetails, diagnostic) {
    const reasons = [];
    const seen = new Set();
    for (const candidate of candidates) {
        const source = String(candidate?.html || '');
        if (!source || seen.has(source))
            continue;
        seen.add(source);
        const strictBase = parseMultifaceOutput(source);
        const previous = strictBase.ok ? strictBase : parseMultifaceOutput(source, { storedDisplay: true });
        if (!previous.ok) {
            reasons.push(`base:${previous.errors?.[0]?.code || 'invalid'}`);
            continue;
        }
        if (!previous.faces.some(face => face.index === faceIndex)) {
            reasons.push('base:face-missing');
            continue;
        }
        const details = distinctResayFaceDetails(replacementDetails, previous.faces.filter(face => face.index !== faceIndex), faceIndex);
        const html = previous.faces.map(face => face.index === faceIndex ? wrapIndependentFace(details, faceIndex) : face.html).join('\n');
        try {
            assertIndependentMarkupComplexityWithDiagnostic(html, 'multiface-resay-merged', diagnostic);
        }
        catch (error) {
            reasons.push(`size:${error?.kind || error?.code || 'limit'}`);
            continue;
        }
        const merged = parseMultifaceOutput(html, strictBase.ok ? { expectedCount: previous.faces.length } : { expectedCount: previous.faces.length, storedDisplay: true });
        if (!merged.ok) {
            reasons.push(`merge:${merged.errors?.[0]?.code || 'invalid'}`);
            continue;
        }
        if (!independentStoredHtmlRestorable(html)) {
            reasons.push('merge:not-restorable');
            continue;
        }
        return { ok: true, html, record: candidate, previous, details };
    }
    return { ok: false, reasons };
}
function recoveredFollowFaces(html = '', options = {}) {
    const fail = (code, message, terminalFace = null) => {
        options.onFailure?.({ code, message, terminalFace });
        return [];
    };
    if (!hasMultifaceMarkup(html))
        return [];
    const parsed = parseMultifaceOutput(html, { allowProse: true });
    if (!parsed.ok)
        return fail(parsed.errors?.[0]?.code || 'multiface-incomplete', __rmT("pL9I9100EExARyKv.J.OTTL5N3ys7tddihP4aS6wIGWtZfGAV7qlUpo.b9WXkS91WUE"), parsed.errors?.[0]?.terminalFace || null);
    const ctx = options.ctx, index = Number(options.messageIndex), message = options.message;
    if (!ctx || !Number.isInteger(index) || ctx.chat?.[index] !== message || !message)
        return fail('follow-recovery-owner-missing', __rmT("ZpxE1vbwFCg2AdO71hPgDvl7FIlHbgNzJmYjwO4Hm4Ry.WrznWKd3BA8zBG"));
    const rejected = getRabbitMirrorFollowBatchFailure(ctx.chat, index);
    if (rejected) {
        options.onFailure?.(rejected);
        return [];
    }
    const recipeSource = followRecipeSource(message);
    const partialRecord = readFollowPartialResult(ctx.chat, index);
    const exactPartial = !!partialRecord && (partialRecord.html === html || (options.snapshotOwnerVerified === true && options.recipeSourceHash === rabbitMirrorMultifaceSourceHash(recipeSource)));
    const roots = [];
    for (const face of parsed.faces) {
        const localFailure = exactPartial ? partialRecord.failedFaces.find(item => item.faceIndex === face.index) : null;
        const failureInner = localFailure ? parseMultifaceOutput(createMultifaceFailureSlot(face.index, localFailure.code)).faces[0]?.inner : null;
        const rules = getSettings()?.rabbitMirrorBannedWords || [];
        const storedFace = exactPartial && partialRecord.html === html && !localFailure;
        const alreadyFiltered = storedFace && matchesRabbitMirrorTextReplacementReceipt(partialRecord.textReplacementReceipts?.[face.index], face.html, rules, followPartialResultFaceOwnerKey(partialRecord, face.index));
        const details = extractReadyDetails(failureInner || face.inner, !!alreadyFiltered);
        if (!usableReadyDetails(details))
            return fail('multiface-sanitized-invalid', __rmT("4Dc1iG.N.fLpRyXmzuLuRg7nmIgqzQ4rsfUDj0KxLGU9pL1WATAr7f"), face.index + 1);
        normalizeRecoveredFollowRoot(details);
        const toto = document.createElement('toto');
        toto.setAttribute('data-rabbit-mirror', 'true');
        toto.setAttribute('data-rm-face', String(face.index + 1));
        toto.append(details);
        if (localFailure) {
            roots.push(toto);
            continue;
        }
        if (details.hasAttribute(MULTIFACE_FAILURE_ATTR))
            return fail('untrusted-failure-slot', __rmT("Fa9MLJ_bYmieerT1A0Su1taAojQxmetRrnqIMzs3RJXOb4l5Pg9jrsbgm48eXv6nAZpP5pA1wK_obh"), face.index + 1);
        roots.push(toto);
    }
    const prepared = roots.map(root => root.outerHTML).join('\n');
    if (!parseMultifaceOutput(prepared, { expectedCount: parsed.faces.length }).ok) {
        return fail('multiface-sanitized-invalid', __rmT("z2keDPP7liuKP2R1c2lycp8HPNcfCqQhASrNxfWyk4H4H55.D4pzbTs_NkfjcUSh8ZmSHvR3Y3Y"));
    }
    for (let faceIndex = 0; faceIndex < roots.length; faceIndex += 1) {
        const originalHash = options.snapshotOwnerVerified === true && Array.isArray(options.faceSourceHashes)
            && options.faceSourceHashes.length === roots.length ? options.faceSourceHashes[faceIndex] : null;
        if (!markSanitizedRabbitMirrorFace(roots[faceIndex], { origin: 'follow', faceIndex, faceCount: roots.length,
            sourceHash: originalHash || rabbitMirrorMultifaceSourceHash(parsed.faces[faceIndex].html), ...presentationModeFields(getRabbitMirrorRecipe({ chatKey: chatKey(ctx), messageIndex: index, swipeId: swipeId(message), message, faceIndex, includeExternalOnly: true })) }))
            return fail('follow-recovery-proof-rejected', __rmT("HMuB6JTP_C_vBfXIN7OK3Eq8ck3byjEYBtayPpYD2pd1GURAq8_"), faceIndex + 1);
    }
    return roots;
}
function normalizeRecoveredFollowRoot(root) {
    if (!root)
        return null;
    root.querySelectorAll?.('[data-rabbit-mirror-tool-entry-host], [data-rm-face-swipe-host], [data-rm-image-region], [data-rm-image-portal], [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-rabbit-mirror-resay], [data-rabbit-mirror-resay-status], [data-rabbit-mirror-generation-progress]')?.forEach(node => node.remove());
    const details = root.matches?.('details') ? root : root.querySelector?.('details');
    if (!details)
        return null;
    ['data-rabbit-mirror-external-details', 'data-rabbit-mirror-external-owner', 'data-rabbit-mirror-external-source', 'data-rabbit-mirror-owner-chat', 'data-rabbit-mirror-owner-mesid', 'data-rabbit-mirror-owner-swipe', 'data-rabbit-mirror-owner-key', 'data-rabbit-mirror-owner-source-hash'].forEach(attr => details.removeAttribute(attr));
    return root;
}
function followMessageSourceCandidates(msg) {
    const candidates = [];
    const seen = new Set();
    const push = value => { const text = String(value || ''); if (!text || seen.has(text))
        return; seen.add(text); candidates.push(text); };
    const live = getContext();
    const index = Array.isArray(live?.chat) ? live.chat.indexOf(msg) : -1;
    const partial = index >= 0 ? readFollowPartialResult(live.chat, index) : null;
    if (partial) {
        push(partial.html);
        return candidates;
    }
    push(msg?.extra?.display_text);
    const swipeIndex = Number.isInteger(msg?.swipe_id) ? Number(msg.swipe_id) : -1;
    if (swipeIndex >= 0)
        push(msg?.swipes?.[swipeIndex]);
    push(msg?.mes);
    return candidates;
}
export function restoreFollowMirrorFromMessageSource(el, msg) {
    if (!el)
        return false;
    const owner = followRecoveryOwner(el, msg);
    if (!owner)
        return false;
    const rejected = getRabbitMirrorFollowBatchFailure(owner.ctx.chat, owner.index);
    if (rejected) {
        showFollowRecoveryNotice(el, rejected);
        return false;
    }
    if (inlineRabbitMirrorDetails(el).length || externalHosts(el).some(node => node.dataset.rmSource === 'follow')) {
        clearFollowRecoveryNotice(el);
        return false;
    }
    const body = messageBody(el);
    if (!body)
        return false;
    let recoveryFailure = null;
    for (const source of followMessageSourceCandidates(msg)) {
        if (hasMultifaceMarkup(source)) {
            const faces = recoveredFollowFaces(source, { ctx: owner.ctx, messageIndex: owner.index, message: msg, onFailure: failure => { recoveryFailure = failure; } });
            if (!faces.length) {
                if (recoveryFailure) {
                    showFollowRecoveryNotice(el, recoveryFailure);
                    return false;
                }
                continue;
            }
            body.append(...faces);
            for (const face of faces) {
                try {
                    refreshRabbitMirrorToolsInScope(face);
                }
                catch { }
            }
            clearFollowRecoveryNotice(el);
            return true;
        }
        const root = normalizeRecoveredFollowRoot(followDetailsRootFromHtml(source));
        if (!root)
            continue;
        const details = root.matches?.('details') ? root : root.querySelector?.('details');
        if (!isRabbitMirrorDetails(details))
            continue;
        body.append(root);
        try {
            refreshRabbitMirrorToolsInScope(root);
        }
        catch { }
        clearFollowRecoveryNotice(el);
        return true;
    }
    return false;
}
function mountedFollowRootForMessage(el) {
    if (!el)
        return null;
    const host = externalHosts(el).find(node => node.dataset.rmSource === 'follow');
    const externalDetails = host?.querySelector?.(':scope > details');
    if (externalDetails)
        return externalDetails;
    const inlineDetails = inlineRabbitMirrorDetails(el)[0] || null;
    if (!inlineDetails)
        return null;
    return inlineDetails.closest?.('toto') || inlineDetails;
}
export function captureMountedFollowSnapshots() {
    const snapshots = [];
    const seen = new Set();
    const ctx = getContext();
    for (const { i } of assistantMessages(ctx)) {
        const index = Number(i);
        if (!Number.isInteger(index) || index < 0)
            continue;
        const message = ctx?.chat?.[index];
        if (!message || getRabbitMirrorFollowBatchFailure(ctx.chat, index))
            continue;
        const el = messageElement(index);
        const root = mountedFollowRootForMessage(el);
        if (!root)
            continue;
        const host = externalHosts(el).find(node => node.dataset.rmSource === 'follow');
        const inline = inlineRabbitMirrorDetails(el);
        const html = host && externalFaceDetails(host).length > 1 ? serializeExternalFaceDetails(host)
            : inline.length > 1 ? inline.slice(0, 5).map((details, faceIndex) => wrapPreparedIndependentFace((details.closest?.('toto') || details).outerHTML, faceIndex)).join('\n')
                : String(root.outerHTML || '').trim();
        if (!html)
            continue;
        let faceSourceHashes = null;
        if (hasMultifaceMarkup(html)) {
            const source = followMessageSourceCandidates(message).find(hasMultifaceMarkup);
            const original = source ? parseMultifaceOutput(source, { allowProse: true }) : null;
            const mounted = host ? externalFaceDetails(host) : inline;
            if (!original?.ok || mounted.length !== original.faces.length)
                continue;
            faceSourceHashes = original.faces.map(face => rabbitMirrorMultifaceSourceHash(face.html));
            const current = mounted.every((details, faceIndex) => {
                const proof = getSanitizedRabbitMirrorFaceProof(host ? details : (details.closest?.('toto') || details));
                if (proof?.origin !== 'follow' || proof.faceIndex !== faceIndex || proof.faceCount !== mounted.length)
                    return false;
                if (proof.sourceHash === faceSourceHashes[faceIndex])
                    return true;
                return !!host && host.dataset.rmSourceHash === messageSourceFingerprint(message)
                    && proof.sourceHash === messageSourceFingerprint(message);
            });
            if (!current)
                continue;
        }
        const fingerprint = hashText(html.replace(/\s+/g, ' '));
        const identity = `${index}:${fingerprint}`;
        if (seen.has(identity))
            continue;
        seen.add(identity);
        snapshots.push({ mesid: index, html, message, chatKey: chatKey(ctx), swipeId: swipeId(message), faceSourceHashes,
            sourceHash: rabbitMirrorMessageSourceHash(message),
            recipeSourceHash: rabbitMirrorMultifaceSourceHash(followRecipeSource(message)) });
    }
    return snapshots;
}
export function restoreMountedFollowSnapshots(snapshots = []) {
    const ctx = getContext();
    for (const item of snapshots) {
        const index = Number(item?.mesid);
        if (!Number.isInteger(index) || index < 0)
            continue;
        const message = ctx?.chat?.[index];
        if (!message || item.message !== message || item.chatKey !== chatKey(ctx) || item.swipeId !== swipeId(message)
            || item.sourceHash !== rabbitMirrorMessageSourceHash(message)
            || item.recipeSourceHash !== rabbitMirrorMultifaceSourceHash(followRecipeSource(message)))
            continue;
        const el = messageElement(index);
        const body = messageBody(el);
        if (!body)
            continue;
        const rejected = getRabbitMirrorFollowBatchFailure(ctx.chat, index);
        if (rejected) {
            showFollowRecoveryNotice(el, rejected);
            continue;
        }
        if (inlineRabbitMirrorDetails(el).length || externalHosts(el).some(node => node.dataset.rmSource === 'follow'))
            continue;
        if (hasMultifaceMarkup(item.html)) {
            const roots = recoveredFollowFaces(item.html, { ctx, messageIndex: index, message, snapshotOwnerVerified: true,
                recipeSourceHash: item.recipeSourceHash, faceSourceHashes: item.faceSourceHashes, onFailure: failure => showFollowRecoveryNotice(el, failure) });
            if (roots.length) {
                body.append(...roots);
                for (const root of roots) {
                    try {
                        refreshRabbitMirrorToolsInScope(root);
                    }
                    catch { }
                }
                clearFollowRecoveryNotice(el);
            }
            continue;
        }
        const root = normalizeRecoveredFollowRoot(followDetailsRootFromHtml(item.html));
        if (!root)
            continue;
        body.append(root);
        try {
            refreshRabbitMirrorToolsInScope(root);
        }
        catch { }
        clearFollowRecoveryNotice(el);
    }
}
export function automaticIndependentTiming() { return independentGenerationTiming(getSettings()) === 'auto'; }
export function manualIndependentTiming() { return independentGenerationTiming(getSettings()) === 'manual'; }
export function manualIntentForMessage(ctx, index) {
    if (!manualIndependentTiming())
        return null;
    const findBound = () => {
        const intents = globalThis[MANUAL_INTENTS_KEY];
        if (!Array.isArray(intents))
            return null;
        return intents.slice().reverse().find(intent => !intent.cancelled && intent.chat === ctx.chat
            && intent.chatKey === chatKey(ctx) && intent.index === Number(index)
            && intent.message === ctx.chat?.[index] && intent.swipe === swipeId(intent.message)) || null;
    };
    const bound = findBound();
    if (bound)
        return bound;
    globalThis.__rabbitMirrorBindIndependentManualIntent?.(Number(index));
    return findBound();
}
function captureManualBodyOwner(ctx, index, msg, intent = null, { firstGeneration = false } = {}) {
    const visible = createIndependentVisibleTextReader(index, getSettings())(msg, index);
    const processor = ctx.streamingProcessor;
    return { chat: ctx.chat, chatKey: chatKey(ctx), index, message: msg, swipe: swipeId(msg),
        baseSlot: messageBaseSlotKey(ctx, index, msg), epoch: operationEpochForBase(messageBaseSlotKey(ctx, index, msg)),
        sourceText: String(msg.mes || ''), visible: Object.freeze({ ...visible }), intent, firstGeneration,
        processor: Number(processor?.messageId) === index ? processor : null };
}
export function manualBodyOwnerCurrent(owner) {
    const ctx = getContext();
    if (!owner || runtimeMode() !== 'independent' || independentGenerationTiming(getSettings()) === 'off'
        || owner.intent?.cancelled || owner.chat !== ctx.chat || owner.chatKey !== chatKey(ctx)
        || owner.message !== ctx.chat?.[owner.index] || owner.swipe !== swipeId(owner.message)
        || owner.epoch !== operationEpochForBase(owner.baseSlot)
        || !isRabbitMirrorEligibleAssistantMessage(owner.message)
        || hasExplicitSourceReplacementEvidence(ctx, owner.index, owner.message))
        return false;
    const source = String(owner.message.mes || '');
    return source === owner.sourceText || (!!owner.sourceText && source.startsWith(owner.sourceText));
}
function currentManualPlaceholder(host, ctx, index, msg, intent) {
    const owner = host && manualPlaceholderOwners.get(host);
    return !!(host?.isConnected && host.dataset.rmState === 'manual' && owner
        && owner.intent === intent && owner.chat === ctx.chat && owner.chatKey === chatKey(ctx)
        && owner.index === index && owner.message === msg && owner.swipe === swipeId(msg)
        && host.querySelector?.('[data-rm-manual-generate]'));
}
export function ensureManualGenerationPlaceholder(ctx, index, msg, intent, settlingFlight = null) {
    const el = messageElement(index);
    try {
        globalThis.__rabbitMirrorManualEntryDiagnosticRecord?.('placeholder', { result: 'entered', index, elementFound: !!el, intentPresent: !!intent, consumed: !!intent?.consumed, cancelled: !!intent?.cancelled, timingManual: manualIndependentTiming() });
    }
    catch { }
    if (!el || !intent || intent.consumed || intent.cancelled || !manualIndependentTiming())
        return null;
    const existing = externalHosts(el).find(host => host.dataset.rmSource === 'independent');
    const active = activeIndependentFlightForBase(messageBaseSlotKey(ctx, index, msg));
    if (readyDetailsFromHost(existing) || (active && active !== settlingFlight))
        return existing || null;
    if (currentManualPlaceholder(existing, ctx, index, msg, intent))
        return existing;
    const host = ensureExternalUi(el, recordKey(ctx, index, msg), intent.manualSkipReason || __rmT("dDe76S_ixXym3IubbTL1Pv5RtXCOp3lVmro6wPmPCp9cdfJ8q8_"), 'manual', 'independent', messageSourceFingerprint(msg));
    if (!host) {
        try {
            globalThis.__rabbitMirrorManualEntryDiagnosticRecord?.('placeholder', { result: 'unavailable', index });
        }
        catch { }
        return null;
    }
    manualPlaceholderOwners.set(host, { intent, chat: ctx.chat, chatKey: chatKey(ctx), index, message: msg, swipe: swipeId(msg) });
    const details = host.querySelector?.(':scope > details');
    const body = details?.querySelector?.(':scope > .rabbit-mirror-external-placeholder-body');
    if (body && !body.querySelector('[data-rm-manual-generate]')) {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('data-rm-manual-generate', 'true');
        button.className = 'rabbit-mirror-external-manual-action';
        button.textContent = __rmT("9kIuFARe2FhCeT");
        body.append(button);
    }
    try {
        globalThis.__rabbitMirrorManualEntryDiagnosticRecord?.('placeholder', { result: 'created', index, connected: !!host.isConnected, hidden: !!host.hidden, hasButton: !!host.querySelector?.('[data-rm-manual-generate]') });
    }
    catch { }
    return host;
}
function settleSkippedManualIndependentFlightUi(flight, result) {
    const owner = flight.manualBodyOwner, intent = owner?.intent;
    if (!owner?.firstGeneration || !intent || flight.dispatchLease?.consumed?.()
        || !manualIndependentTiming() || !manualBodyOwnerCurrent(owner))
        return false;
    intent.consumed = false;
    intent.manualSkipReason = result.reason === 'directive-disabled'
        ? __rmT("7JoqMEU00lxblXAZazM5NXjDy7kMaSTOn1amAEMcZ4l9_.MUNzSjXpbqTyb2yJkEMQwlQPgmVUYMCMuhbpIGRhw00Xuwj810wclGknOB79s") : __rmT("g6ir1MkpYjBJtkNSphmHvdo_bgP3bcnJZoMRAZK43toqIzGKoiGKVfZkqP6X8PXV04.nQ8EW7LUvr43RITm.sZpOv8PJEnYO");
    const ctx = getContext();
    const host = ensureManualGenerationPlaceholder(ctx, owner.index, owner.message, intent, flight);
    if (host)
        flight.uiSettled = true;
    return !!host;
}
function rememberManualClickOwner(owner) {
    if (!owner)
        return;
    manualTerminalOwners.set(owner.baseSlot, owner);
    const intent = owner?.intent;
    if (!intent)
        return;
    intent.consumed = true;
}
function generateManualIndependentMirror(root) {
    try {
        globalThis.__rabbitMirrorManualEntryDiagnosticRecord?.('click', { result: 'entered', runtimeCurrent: currentRuntime(), timingManual: manualIndependentTiming() });
    }
    catch { }
    const host = root?.matches?.('.rabbit-mirror-external-host') ? root : root?.closest?.('.rabbit-mirror-external-host');
    const owner = host && manualPlaceholderOwners.get(host);
    if (!owner || !host.isConnected || host.dataset.rmState !== 'manual' || !manualIndependentTiming() || runtimeMode() !== 'independent')
        return false;
    const ctx = getContext(), intent = owner.intent, msg = ctx.chat?.[owner.index];
    if (owner.chat !== ctx.chat || owner.chatKey !== chatKey(ctx) || owner.message !== msg || owner.swipe !== swipeId(msg)
        || !isRabbitMirrorEligibleAssistantMessage(msg) || intent.cancelled || intent.consumed
        || manualIntentForMessage(ctx, owner.index) !== intent)
        return false;
    if (activeIndependentFlightForBase(messageBaseSlotKey(ctx, owner.index, msg)))
        return true;
    const snapshot = captureManualBodyOwner(ctx, owner.index, msg, intent, { firstGeneration: true });
    rememberManualClickOwner(snapshot);
    for (const button of host.querySelectorAll('[data-rm-manual-generate]'))
        button.disabled = true;
    void generateFor(owner.index, msg, true, true, null, null, snapshot);
    return true;
}
export function handleIndependentManualBridge(event = {}) {
    try {
        globalThis.__rabbitMirrorManualEntryDiagnosticRecord?.('bridge', { runtimeCurrent: currentRuntime(), timingManual: manualIndependentTiming(), index: Number.isInteger(event.intent?.index) ? event.intent.index : -1 });
    }
    catch { }
    if (!currentRuntime())
        return;
    const ctx = getContext();
    for (const flight of globalFlights().values()) {
        const snapshot = flight.manualBodyOwner;
        if (!snapshot)
            continue;
        const intent = event.intent;
        const replacement = intent && intent !== snapshot.intent && !intent.cancelled
            && intent.chat === snapshot.chat && intent.chatKey === snapshot.chatKey
            && ['continue', 'swipe', 'regenerate'].includes(intent.type) && intent.tailIndex === snapshot.index;
        if (replacement || !manualBodyOwnerCurrent(snapshot))
            abortFlight(flight, replacement ? 'manual-source-replaced' : 'manual-owner-replaced');
    }
    if (event.kind === 'clear') {
        manualTerminalOwners.clear();
        for (const host of allExternalHosts())
            if (host.dataset.rmState === 'manual')
                host.remove();
        return;
    }
    if (!manualIndependentTiming())
        return;
    const index = Number.isInteger(event.intent?.index) && event.intent.index >= 0 ? event.intent.index : ctx.chat?.length - 1;
    if (!Number.isInteger(index) || index < 0 || !isRabbitMirrorEligibleAssistantMessage(ctx.chat?.[index]))
        return;
    const intent = manualIntentForMessage(ctx, index), el = messageElement(index);
    try {
        globalThis.__rabbitMirrorManualEntryDiagnosticRecord?.('bridge', { index, intentPresent: !!intent, elementFound: !!el });
    }
    catch { }
    if (!intent || intent.consumed)
        return;
    if (externalHosts(el).some(host => currentManualPlaceholder(host, ctx, index, ctx.chat[index], intent)))
        return;
    queueMessageSync([index]);
}
export function queueManualGenerationTerminalSync() {
    const ids = new Set(), ctx = getContext();
    let ownsEndedProcessor = false;
    for (const [base, owner] of manualTerminalOwners) {
        if (owner.intent && !owner.intent.consumed)
            continue;
        if (!manualBodyOwnerCurrent(owner)) {
            manualTerminalOwners.delete(base);
            continue;
        }
        ids.add(owner.index);
        if (owner.processor && owner.processor === ctx.streamingProcessor
            && Number(owner.processor.messageId) === owner.index
            && (owner.processor.isFinished === true || owner.processor.isStopped === true))
            ownsEndedProcessor = true;
    }
    if (ids.size && (manualIndependentTiming() || ownsEndedProcessor)
        && !automaticGenerationCutovers.get(chatKey(ctx))?.activeHostGeneration && !externalHostGenerationActivity().active) {
        writeHostGenerationInProgress(false);
        writeHostGenerationHintStartedAt(0);
    }
    if (ids.size)
        queueMessageSync([...ids]);
}
export function reconcileManualTimingChange() {
    const timing = independentGenerationTiming(getSettings());
    if (lastAppliedIndependentTiming !== null && lastAppliedIndependentTiming !== timing) {
        clearScheduledGeneration();
        globalThis[INDEPENDENT_GENERATION_INTENTS_KEY] = [];
        for (const cutover of automaticGenerationCutovers.values()) {
            cutover.authorized.clear();
            const paidEarly = [...(cutover.earlyBodies?.values() || [])].some(owner => !owner.cancelled && owner.flight?.dispatchLease?.consumed?.());
            if (!paidEarly) {
                clearAutomaticHostGenerationSettlement(cutover.activeHostGeneration);
                cutover.activeHostGeneration = null;
            }
            for (const owner of cutover.earlyBodies?.values() || [])
                if (!owner.flight?.dispatchLease?.consumed?.())
                    cancelEarlyBodyOwner(owner, 'generation-timing-changed');
        }
        for (const flight of globalFlights().values())
            if (!flight.dispatchLease?.consumed?.())
                abortFlight(flight, 'generation-timing-changed');
        for (const host of allExternalHosts())
            if (host.dataset.rmState === 'manual')
                host.remove();
    }
    writeLastAppliedIndependentTiming(timing);
}
export function runtimeMode() {
    const st = getSettings();
    if (st.enabled === false || st.autoRabbitMirrorInjection === false)
        return 'off';
    if (st.generationSource === 'independent')
        return 'independent';
    if (st.generationSource === 'follow' && st.followDisplayMode === 'external')
        return 'follow-external';
    return 'inline';
}
export function passiveObservedIdentity(ctx, index, msg) {
    return {
        [INDEPENDENT_OWNER_OBSERVATION]: { ctx, index, msg },
        slot: messageSlotKey(ctx, index, msg),
        sourceHash: messageSourceFingerprint(msg),
        bodyHash: messageBodyFingerprint(msg),
        displayHash: messageDisplayFingerprint(msg),
        reasoningHash: messageReasoningFingerprint(msg),
        legacySlots: legacyMessageSlotKeys(ctx, index, msg),
    };
}
export function automaticCutoverVersionToken(msg) {
    return `${swipeId(msg)}:${messageBodyFingerprint(msg)}`;
}
export function boundIndependentIntentOwner(intent, ctx, index) {
    const owner = intent?.[INDEPENDENT_INTENT_OWNER];
    return owner && owner.chat === ctx.chat && owner.tail === ctx.chat?.[Number(intent.tailIndex)]
        && owner.message === ctx.chat?.[index] && owner.index === Number(index) && owner.swipe === swipeId(owner.message)
        ? owner : null;
}
export function refreshDeferredIndependentProof(ctx, index) {
    if (externalHostGenerationActivity().active)
        return false;
    let changed = false;
    const source = deferredIndependentGenerationIntents();
    const next = source.map(intent => {
        if (deferredIndependentIntentCandidateIndex(intent, ctx) !== Number(index)
            || intent.terminalReason !== 'generation-ended' || !intent.terminalAt || intent.auxiliaryTerminalPending
            || intent.intermediateAt)
            return intent;
        const owner = boundIndependentIntentOwner(intent, ctx, index);
        if (!owner || (!owner.receivedAt && !owner.renderedAt))
            return intent;
        const proof = automaticHostRenderProof(index);
        const processor = hostModule?.streamingProcessor || ctx.streamingProcessor;
        if (proof === 'stream-tool-intermediate' || processor?.isStopped === true || processor?.abortController?.signal?.aborted === true)
            return intent;
        const toolCapable = intent.toolCapable !== false || automaticHostGenerationMayUseTools(intent.type, ctx);
        if (!owner.renderedAt && toolCapable && proof !== 'stream-final')
            return intent;
        const bodyHash = messageBodyFingerprint(owner.message);
        if (!String(owner.message.mes || '').trim() || (intent.completedAt && intent.finalBodyHash === bodyHash))
            return intent;
        changed = true;
        return Object.freeze({ ...intent, toolCapable, completedAt: Date.now(), finalIndex: Number(index), finalBodyHash: bodyHash,
            finalProof: owner.renderedAt ? (intent.finalProof || proof) : 'received-ended', completionReason: 'owner-ended-reconciled' });
    });
    if (changed)
        globalThis[INDEPENDENT_GENERATION_INTENTS_KEY] = next;
    return changed;
}
export function automaticAuthorizationLineage(ctx, index, evidence) {
    const fromIntent = boundIndependentIntentOwner(evidence, ctx, index);
    const fromRender = evidence?.tentativeRender;
    const owner = fromIntent || (fromRender?.message === ctx.chat?.[index] && fromRender?.chat === ctx.chat ? fromRender : null);
    if (!owner)
        return null;
    const ended = fromIntent ? evidence.terminalReason === 'generation-ended'
        : evidence.terminalReason === String(hostModule?.event_types?.GENERATION_ENDED || 'GENERATION_ENDED');
    return { chat: ctx.chat, message: ctx.chat[index], index: Number(index), swipe: swipeId(ctx.chat[index]),
        terminalEnded: ended, epoch: operationEpochForBase(messageBaseSlotKey(ctx, index, ctx.chat[index])) };
}
export function stampAutomaticAuthorizationEpoch(ctx, index) {
    const proof = automaticGenerationCutovers.get(chatKey(ctx))?.authorized?.get(Number(index))?.[INDEPENDENT_INTENT_OWNER];
    if (proof)
        proof.epoch = operationEpochForBase(messageBaseSlotKey(ctx, index, ctx.chat[index]));
}
function refreshUnpaidAutomaticAuthorization(ctx, index, authorization) {
    const cutover = automaticGenerationCutovers.get(chatKey(ctx));
    const proof = authorization?.[INDEPENDENT_INTENT_OWNER];
    const msg = ctx.chat?.[index];
    if (!proof || cutover?.authorized.get(Number(index)) !== authorization || proof.chat !== ctx.chat
        || proof.message !== msg || proof.index !== Number(index) || proof.swipe !== swipeId(msg) || !proof.terminalEnded)
        return false;
    const base = messageBaseSlotKey(ctx, index, msg);
    if (proof.epoch !== operationEpochForBase(base) || automaticDispatchAlreadyConsumed(base)
        || activeIndependentFlightForBase(base))
        return false;
    if ([...automaticFailureStops.values()].some(failure => failure.baseSlot === base && failure.operationEpoch === proof.epoch && !isMissingShellStop(failure)))
        return false;
    if (cutover.activeHostGeneration || externalHostGenerationActivity().active)
        return 'waiting';
    authorization.token = automaticCutoverVersionToken(msg);
    return true;
}
export function deferredIndependentGenerationIntents() {
    const now = Date.now();
    const source = Array.isArray(globalThis[INDEPENDENT_GENERATION_INTENTS_KEY]) ? globalThis[INDEPENDENT_GENERATION_INTENTS_KEY] : [];
    const current = source.filter(intent => intent
        && INDEPENDENT_GENERATION_INTENT_TYPES.has(String(intent.type || ''))
        && now - Number(intent.startedAt || 0) <= INDEPENDENT_GENERATION_INTENT_TTL_MS);
    if (current.length !== source.length)
        globalThis[INDEPENDENT_GENERATION_INTENTS_KEY] = current;
    return current;
}
export function deferredIndependentIntentCandidateIndex(intent, ctx = getContext()) {
    if (!intent || String(intent.chatKey || '') !== chatKey(ctx))
        return null;
    const chat = Array.isArray(ctx?.chat) ? ctx.chat : [];
    const tailIndex = Number(intent.tailIndex);
    if (!Number.isInteger(tailIndex) || tailIndex < 0)
        return null;
    const tail = chat[tailIndex];
    const tailRole = String(intent.tailRole || '');
    const roleMatches = tailRole === 'user'
        ? tail?.is_user === true
        : tailRole === 'system'
            ? isRabbitMirrorToolResultMessage(tail)
            : tailRole === 'assistant'
                ? isRabbitMirrorEligibleAssistantMessage(tail)
                : false;
    const type = String(intent.type || '');
    if (type === 'normal') {
        if (!roleMatches
            || messageBodyFingerprint(tail) !== String(intent.tailBodyHash || '')
            || swipeId(tail) !== Number(intent.tailSwipeId || 0))
            return null;
        const candidate = chat[tailIndex + 1];
        return isRabbitMirrorEligibleAssistantMessage(candidate) && String(candidate.mes || '').trim() ? tailIndex + 1 : null;
    }
    if (['continue', 'swipe', 'regenerate'].includes(type) && tailRole === 'assistant' && isRabbitMirrorEligibleAssistantMessage(tail)) {
        const changed = messageBodyFingerprint(tail) !== String(intent.tailBodyHash || '') || swipeId(tail) !== Number(intent.tailSwipeId || 0);
        return changed ? tailIndex : null;
    }
    return null;
}
function deferredIndependentIntentHasFinalProof(intent, ctx, index) {
    const normalized = Number(index);
    const message = ctx?.chat?.[normalized];
    const proof = String(intent?.finalProof || '');
    const lifecycleComplete = Number(intent?.terminalAt) > 0 || proof === 'stream-final' || proof === 'non-tool-final';
    return Number(intent?.finalIndex) === normalized
        && Number(intent?.completedAt) > 0
        && lifecycleComplete
        && isRabbitMirrorEligibleAssistantMessage(message)
        && (!intent?.[INDEPENDENT_INTENT_OWNER] || !!boundIndependentIntentOwner(intent, ctx, normalized))
        && messageBodyFingerprint(message) === String(intent?.finalBodyHash || '');
}
export function deferredIndependentIntentCompletedAt(ctx, index) {
    const normalized = Number(index);
    return deferredIndependentGenerationIntents()
        .filter(intent => deferredIndependentIntentCandidateIndex(intent, ctx) === normalized
        && deferredIndependentIntentHasFinalProof(intent, ctx, normalized))
        .reduce((latest, intent) => Math.max(latest, Number(intent?.completedAt) || 0), 0);
}
export function claimDeferredIndependentGenerationIntent(ctx, index, reason = 'deferred-generation-intent', { requireFinalProof = false } = {}) {
    const normalized = Number(index);
    const source = deferredIndependentGenerationIntents();
    const matching = source.filter(intent => deferredIndependentIntentCandidateIndex(intent, ctx) === normalized
        && (!requireFinalProof || deferredIndependentIntentHasFinalProof(intent, ctx, normalized)));
    if (!matching.length || !unlockAutomaticGenerationCutover(ctx, normalized, reason, matching.at(-1)))
        return false;
    const consumed = new Set(matching);
    globalThis[INDEPENDENT_GENERATION_INTENTS_KEY] = source.filter(intent => !consumed.has(intent));
    return true;
}
export function ensureAutomaticGenerationCutover(ctx = getContext()) {
    const ownerChat = chatKey(ctx);
    if (automaticGenerationCutovers.has(ownerChat))
        return automaticGenerationCutovers.get(ownerChat);
    const cutover = { authorized: new Map(), activeHostGeneration: null, createdAt: Date.now(), failureRecoveryToken: {} };
    automaticGenerationCutovers.set(ownerChat, cutover);
    return cutover;
}
export function earlyBodyConfigSignature(settings = getSettings()) {
    const advanced = settings.independentAdvancedEnabled === true ? independentAdvancedOptionsSignature(settings) : '';
    return JSON.stringify([settings.enabled !== false, settings.autoRabbitMirrorInjection !== false,
        settings.generationSource, settings.mode, settings.independentEarlyBodyEnabled === true,
        String(settings.independentEarlyBodyChatKey || ''), settings.independentEarlyBodyTags || [],
        settings.independentContextExcludedTags || [],
        ['independentConnectionProfileId', 'independentApiBaseUrl', 'independentApiModel', 'independentApiTemperature', 'independentApiMaxTokens', 'independentMaxRequestChars',
            'independentContextMaxLayers', 'independentReadCharacterCardSummary', 'independentReadPersonaSummary', 'independentReadGlobalWorldInfo', 'independentWorldInfoDisabledBooks',
            'rabbitMirrorFaceCount', 'samplingMode', 'selfInventMode', 'rawPolicy', 'showCot', 'avoidRepeat', 'cooldownRounds', 'blacklistEnabled', 'blacklistedThemeIds', 'blacklistedFormatIds',
            'favoriteThemeIds', 'favoriteFormatIds', 'favoriteThemeMultipliers', 'favoriteFormatMultipliers', 'presentationWorldviewLock', 'richFormatBias',
            'externalWorldBookRandomEnabled', 'externalWorldBookMixMode', 'darkVisualMode', 'visualToneMode', 'postGenerationRecolor', 'visualDesignMode', 'visualPromptEditingEnabled', 'visualPrompt', 'visualExtraPrompt', 'visualAvoidPrompt',
            'appearanceReferenceEnabled', 'appearanceReferenceRevision', 'behaviorRuleMode', 'behaviorRuleText', 'forceVisualScenery', 'visualSceneryCombination', 'rabbitMirrorBannedWords', 'materialTextureEnabled', 'webFontsEnabled']
            .map(key => settings[key]), ...(advanced ? [advanced] : [])]);
}
export function earlyBodyEnabled(ctx = getContext(), settings = getSettings()) {
    return settings.enabled !== false && settings.autoRabbitMirrorInjection !== false
        && settings.generationSource === 'independent' && settings.mode !== 'off'
        && settings.independentEarlyBodyEnabled === true
        && !!String(settings.independentEarlyBodyChatKey || '')
        && String(settings.independentEarlyBodyChatKey) === chatKey(ctx)
        && Array.isArray(settings.independentEarlyBodyTags) && settings.independentEarlyBodyTags.length > 0;
}
function earlyBodyOwnerFor(ctx, index) {
    const owner = automaticGenerationCutovers.get(chatKey(ctx))?.earlyBodies?.get(Number(index));
    return owner && owner.chat === ctx.chat && owner.message === ctx.chat?.[Number(index)]
        && owner.swipe === swipeId(owner.message) ? owner : null;
}
function containFavoriteHostLayout(host) {
    if (!host?.style)
        return;
    host.style.setProperty('position', 'relative', 'important');
    host.style.setProperty('inset', 'auto', 'important');
    host.style.setProperty('left', 'auto', 'important');
    host.style.setProperty('top', 'auto', 'important');
    host.style.setProperty('right', 'auto', 'important');
    host.style.setProperty('bottom', 'auto', 'important');
    host.style.setProperty('width', '100%', 'important');
    host.style.setProperty('max-width', '100%', 'important');
    host.style.setProperty('height', 'auto', 'important');
    host.style.setProperty('transform', 'none', 'important');
    host.style.setProperty('z-index', 'auto', 'important');
    for (const el of host.querySelectorAll?.('[style]') || []) {
        const position = String(el.style?.position || '').toLowerCase();
        if (position === 'fixed' || position === 'sticky')
            el.style.position = 'absolute';
    }
}
function legacyFavoriteImageFace(html) {
    try {
        const template = document.createElement('template');
        template.innerHTML = String(html || '');
        const outer = [...template.content.querySelectorAll('details')].filter(details => !details.parentElement?.closest?.('details'));
        if (outer.length !== 1)
            return null;
        const values = ['data-rm-image-owner-face', 'data-rabbit-mirror-face-index'].map(name => outer[0].getAttribute(name))
            .filter(value => value !== null);
        if (!values.length || values.some(value => !/^\d+$/.test(value)))
            return null;
        const faces = values.map(Number);
        return faces.every(face => Number.isSafeInteger(face) && face >= 0 && face < 5 && face === faces[0]) ? faces[0] : null;
    }
    catch {
        return null;
    }
}
export function hydrateIndependentFavoriteHtml(container, record) {
    if (!container)
        return null;
    const html = expandHtmlDocumentCodeBlocks(String(record?.html || '').trim());
    if (!html)
        return null;
    const savedImageFace = Number.isInteger(record?.faceIndex) && record.faceIndex >= 0 ? record.faceIndex : legacyFavoriteImageFace(record?.html);
    const host = document.createElement('div');
    host.setAttribute('data-rm-theater-favorite-host', 'true');
    host.className = 'rabbit-mirror-theater-favorite-host';
    host.dataset.rmKey = String(record?.id || 'favorite');
    host.dataset.rmSource = 'favorite';
    host.dataset.rmState = 'ready';
    host.dataset.rmFavorite = 'true';
    host.dataset.rmPlacement = 'contained';
    if (hasMultifaceMarkup(html)) {
        if (!mountExternalFaceDetails(host, 'favorite', 'favorite', html, { locallyPrepared: false })) {
            container.replaceChildren();
            container.append(__rmT("5zhCxoE2TcqvEJbm1oiE1.95HtCUFThy8y_acTefgG8"));
            return null;
        }
    }
    else {
        const details = extractReadyDetails(html, false);
        if (!details) {
            container.replaceChildren();
            container.append(__rmT("5zhCxoE2TcAG9dttXKi91NaB8RFWFu5_HZ4Wvwv8gG8"));
            return null;
        }
        markExternalDetails(details, 'favorite', 'favorite');
        host.append(details);
    }
    host.__rabbitMirrorIndependentSource = html;
    delete host.dataset.rmOwnerChat;
    delete host.dataset.rmOwnerMesid;
    delete host.dataset.rmExternalOwnerMessage;
    delete host.dataset.rmOwnerSwipe;
    delete host.dataset.rmSourceHash;
    stampExternalDetailsOwnership(host);
    if (record?.chatKey && Number.isInteger(record?.mesid) && Number.isInteger(record?.swipe) && record?.images) {
        try {
            lendMirrorImages(record.chatKey, record.mesid, record.swipe, record.images);
        }
        catch { }
    }
    const favoriteFaces = externalFaceDetails(host);
    for (const details of host.querySelectorAll('details')) {
        if (record?.chatKey)
            details.dataset.rmImageOwnerChat = String(record.chatKey);
        if (Number.isInteger(record?.mesid))
            details.dataset.rmImageOwnerMesid = String(record.mesid);
        if (Number.isInteger(record?.swipe))
            details.dataset.rmImageOwnerSwipe = String(record.swipe);
        const outerFace = favoriteFaces.findIndex(face => face === details || face.contains(details));
        const imageFace = favoriteFaces.length > 1 ? outerFace : savedImageFace;
        if (Number.isInteger(imageFace) && imageFace >= 0)
            details.dataset.rmImageOwnerFace = String(imageFace);
    }
    markMountedFaceProofs(host, 'favorite', null);
    containFavoriteHostLayout(host);
    container.replaceChildren(host);
    ensureExternalTools(host);
    containFavoriteHostLayout(host);
    if (host.querySelector('[data-rm-sprite]')) {
        void import('../pixelSprites.js?rmv=2.5.2').then(module => { if (host.isConnected)
            module.applyPixelSprites(host); }).catch(() => { });
    }
    if (host.querySelector('[data-rm-draw-frame]')) {
        void import('../builtinImage.js?rmv=2.5.2').then(module => {
            if (!host.isConnected)
                return;
            for (const details of host.querySelectorAll('details'))
                if (details.querySelector('[data-rm-draw-frame]'))
                    module.restoreSavedBuiltinImages(details);
        }).catch(() => { });
    }
    return host;
}
