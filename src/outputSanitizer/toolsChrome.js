import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=2.5.4";
import { paletteRecipeFor } from '../paletteRecipes.js?rmv=2.5.4';
import { tidyLooseMarkdown } from './looseMarkdown.js?rmv=2.5.4';
import { wireStateGroups } from './stateGroupWiring.js?rmv=2.5.4';
import { recordInteractionMethods, recordSelfInventedForm, selfInventedOf } from '../interactionMethodLedger.js?rmv=2.5.4';
import { armVsImplementationCheck, getVsImplementationCheck, describeVsImplementationProblem } from './vsImplementationCheck.js?rmv=2.5.4';
import { roleColorFaces, setRoleColorVariant, inspectRoleColorReadability } from '../roleColorVariants.js?rmv=2.5.4';
import { interactionRecipesFor } from '../interactionRecipes.js?rmv=2.5.4';
import { trackMirrorAnimations, pruneMirrorAnimationVisibility } from '../animationVisibility.js?rmv=2.5.4';
import { installPressFeedback } from './pressFeedback.js?rmv=2.5.4';
import { installRevealMotion } from './revealMotion.js?rmv=2.5.4';
import { installWebFonts, WEB_FONTS } from '../webFonts.js?rmv=2.5.4';
import { installReadabilityPolish } from './readabilityPolish.js?rmv=2.5.4';
import { noteDesktopZoomFace } from '../desktopFaceZoom.js?rmv=2.5.4';
import { hideLeakedAtmosphereThink } from './atmosphereThinkLeak.js?rmv=2.5.4';
import { parseAtmosphereThink } from '../atmosphereChoice.js?rmv=2.5.4';
import { installMirrorToolMenu, fitMirrorToolPanel } from '../mirrorToolMenu.js?rmv=2.5.4';
import { installMirrorUpdateMenuHook } from '../mirrorUpdateMenu.js?rmv=2.5.4';
import { placeFacePager, facePagerDetails, removeFacePager, cleanupFacePagers, placeBottomCollapse, removeBottomCollapse, cleanupBottomCollapses } from '../facePagerPlacement.js?rmv=2.5.4';
import { isTextPresentation } from '../presentationMode.js?rmv=2.5.4';
import { isRabbitMirrorManagedChatSurface } from '../hostCompatibility.js?rmv=2.5.4';
import { getSettings, syncExternalReferenceVisibility } from '../settings.js?rmv=2.5.4';
import { getCurrentChatKey } from '../storage.js?rmv=2.5.4';
import { getContext } from '../independentApi/runtime.js?rmv=2.5.4';
import { isNameMaskActive, toggleNameMask, nameMaskRulesFor } from '../nameMask.js?rmv=2.5.4';
import { nameMaskCardKey } from '../nameMaskCandidates.js?rmv=2.5.4';
import { getSanitizedRabbitMirrorFaceProof } from '../multifaceProof.js?rmv=2.5.4';
import { bindRabbitMirrorAvatarRoot } from '../chatAvatars.js?rmv=2.5.4';
import { captureTheaterFavoriteFromRoot, openTheaterFavoriteLibrary, toggleTheaterFavorite, isTheaterFavoriteHtml, } from '../theaterFavorites.js?rmv=2.5.4';
import { FACE_SWIPE_FULL_MESSAGE, faceSwipeBarIntent, fallbackFaceSwipeView, multifaceFacePagerView } from '../swipeVersions.js?rmv=2.5.4';
import { FEEDBACK_CAT_TYPES, clearActiveFeedbackForCurrentChat, feedbackCatReceiptText, feedbackCatStatusText, getActiveFeedbackForCurrentChat, getFeedbackCatLastReceiptForCurrentChat, setActiveFeedbackForCurrentChat, } from '../feedbackCat.js?rmv=2.5.4';
import { scanRabbitMirrorHtml } from '../visualScanner.js?rmv=2.5.4';
import { FAVORITE_MULTIPLIER_MAX, FAVORITE_MULTIPLIER_MIN, blacklistEntries, clearBlacklist, clearFavorites, favoriteEntries, getBlacklistState, getFavoriteMultiplier, getFavoritesState, getRabbitMirrorRecipe, recipeFromSelectionMetadata, isBlacklisted, isFavorited, removeBlacklistItem, removeFavoriteItem, selectionCatalogEntries, setBlacklistEnabled, setFavoriteMultiplier, toggleBlacklistItem, toggleFavoriteItem, } from '../blacklist.js?rmv=2.5.4';
import { EXTERNAL_REFERENCE_NOTE_ATTR, FEEDBACK_CAT_ATTR, MAINTENANCE_RABBIT_ATTR, MIRROR_TITLE_DISPLAY_ATTR, MIRROR_TITLE_LABEL_ATTR, MIRROR_TITLE_PART_ATTR, MIRROR_TITLE_PREFIX_ATTR, MIRROR_TITLE_SOURCE_ATTR, TITLE_CHROME_ATTR, MIRROR_TOTO_SELECTOR, RECIPE_BUTTON_ATTR, RUNTIME_VERSION, RUNTIME_VERSION_ATTR, TOOL_ENTRY_HOST_ATTR, ensureFeedbackCatRuntimeStyle, getChatRoot, getRenderedRabbitMirrorInteractionRoots, isCurrentRuntime, isFeedbackCatEnabled, isInsideChatMessage, isMaintenanceRabbitEnabled, isRabbitMirrorDetails, } from './runtime.js?rmv=2.5.4';
import { getAvailableHostChat, getRawAssistantMessageForRenderedRoot, getAssistantMessageForRenderedRoot } from './scriptedInteractionRescue.js?rmv=2.5.4';
import { messageStampSeconds } from '../messageStamp.js?rmv=2.5.4';
import { wireAttributeCycleButtons } from './attributeCycleWiring.js?rmv=2.5.4';
import { ORPHAN_STATE_ATTR, attachOrphanStateToggle, isOrphanStateWired, rearmOrphanStateWiring, innerButtonIsFree } from './orphanStateWiring.js?rmv=2.5.4';
import { armNestedDetailsReplacementContainment, installNestedDetailsReplacementContainment } from './fallbackRescue.js?rmv=2.5.4';
import { armRabbitMirrorFirstUseInteraction, repairRabbitMirrorScopedClassAliasesInScope } from './idsAndRearm.js?rmv=2.5.4';
import { FEEDBACK_CAT_MENU_ATTR, FEEDBACK_HISTORY_EVENT, FEEDBACK_RESAY_EVENT, MAINTENANCE_MENU_ATTR, MAINTENANCE_MIRROR_IDENTITY_ATTR, MAINTENANCE_REASON_ATTR, MAINTENANCE_STATES, MAINTENANCE_STATE_ATTR, MAINTENANCE_STATE_STAMP_ATTR, RECIPE_MENU_ATTR, RESAY_ATTR, bindRevealedInteractionMemory, clearLegacyRabbitMirrorAutoFrameArtifacts, copyRabbitMirrorCurrentFaceHtml, downloadRabbitMirrorCurrentFaceHtml, failMaintenanceRabbit, getRabbitMirrorMaintenanceRecommendation, maintenanceMenuProblemText, mergeMaintenanceProblemAndRecommendation, rabbitMirrorLanguageBalance, scheduleCurrentHighConfidenceTextRepair, setMaintenanceRabbitState, } from './diagnostics.js?rmv=2.5.4';
import { clearOrphanedStructuredStaticDisclosureArtifacts } from './choiceRescue.js?rmv=2.5.4';
import { MAINTENANCE_FINDING_STAGE_LABELS, beginMaintenanceRepairRun, finishMaintenanceRepairRun, hasRabbitMirrorInteractionResetSnapshot, hasMaintenancePreRepairSnapshot, restoreMaintenancePreRepairSnapshotAndForget, maintenanceFindingReason, maintenanceRepairModesForFindings, maintenanceRepairPlanLabel, patrolMaintenanceRabbit, rejectOversizedMaintenanceRepair, removeRabbitMirrorInteractionHomeControls, replayFollowMaintenanceRepair, restoreRabbitMirrorInteractionResetSnapshot, runMaintenanceNarrowFaceRepair, runMaintenanceRevealClipRepair, runMaintenanceUserRepair, triggerDiagnosticForMaintenanceRoot, getRenderedMessageElement, } from './maintenanceInspect.js?rmv=2.5.4';
import { getRabbitMirrorFacePosition, installMaintenanceHorizontalClipOpenRescue, repairLegacyMaintenanceMobileStateRows, } from './layoutRescue.js?rmv=2.5.4';
import { getMessageIndexFromMirrorNode, installMaintenanceAutoSafeOpenPatrol, installManagedRabbitMirrorTools, pruneMaintenanceAutoSafeOpenBindings, scheduleMaintenanceAutoSafeForRoot, } from './lifecycle.js?rmv=2.5.4';
installMirrorUpdateMenuHook();
let recipeOutsideCloseCleanup = null;
let maintenanceOutsideCloseCleanup = null;
let maintenanceResultPanel = null;
let feedbackOutsideCloseCleanup = null;
export const toolOutsideCloseOwners = new Map();
const PALETTE_DEDUPE_CHECKED_ATTR = 'data-rabbit-mirror-palette-dedupe-checked';
let mirrorImageModule = null;
let startupMaintenanceInstallTimer = 0;
let startupMaintenanceInstallQueue = [];
let startupMaintenanceVisibilityObserver = null;
let startupMaintenanceFallbackRoot = null;
let startupMaintenanceFallbackHandler = null;
export function closeMaintenanceRabbitMenu() {
    maintenanceResultPanel = null;
    try {
        maintenanceOutsideCloseCleanup?.();
    }
    catch { }
    maintenanceOutsideCloseCleanup = null;
    toolOutsideCloseOwners.delete('maintenance');
    document.querySelectorAll?.(`[${MAINTENANCE_MENU_ATTR}]`)?.forEach(panel => panel.remove());
}
function maintenanceResultContext(root, knownIndex = getMessageIndexFromMirrorNode(root)) {
    const index = knownIndex;
    const message = getAvailableHostChat()?.[index];
    const swipe = Number.isInteger(message?.swipe_id) ? message.swipe_id : 0;
    return { chat: getCurrentChatKey(), index, swipe,
        source: message?.mes, display: message?.extra?.display_text ?? message?.display_text,
        selected: message?.swipes?.[swipe] };
}
function maintenancePanelFaceStillCurrent(feedback) {
    const context = maintenanceResultContext(feedback.root, feedback.context.index);
    if (Object.keys(feedback.context).some(key => feedback.context[key] !== context[key]))
        return false;
    if (feedback.face?.source === 'independent' && (!feedback.face.host.isConnected
        || String(feedback.face.host.dataset?.rmKey || '') !== feedback.ownerKey
        || String(feedback.face.host.dataset?.rmSourceHash || '') !== feedback.sourceHash
        || String(feedback.face.host.dataset?.rmFaceRemountEpoch || '0') !== feedback.remountEpoch))
        return false;
    return true;
}
export function updateMaintenanceRabbitMenuState(button, state, reason) {
    const feedback = maintenanceResultPanel;
    if (!feedback?.panel?.isConnected || !button)
        return;
    if (!maintenancePanelFaceStillCurrent(feedback)) {
        closeMaintenanceRabbitMenu();
        return;
    }
    if (!maintenanceButtonBelongsToPanel(feedback, button))
        return;
    const recommendation = getRabbitMirrorMaintenanceRecommendation(state, reason);
    feedback.status.textContent = mergeMaintenanceProblemAndRecommendation(maintenanceMenuProblemText(state, reason), recommendation);
    if (recommendation)
        feedback.status.setAttribute('data-rm-recommended-action', 'detected');
    feedback.status.setAttribute('data-rm-maintenance-result-state', state);
}
function maintenanceButtonBelongsToPanel(feedback, button) {
    let belongs = button === feedback.button || feedback.root.contains?.(button);
    if (!belongs && feedback.face?.source === 'independent') {
        const face = getRabbitMirrorFacePosition(button);
        belongs = face?.source === 'independent' && face.host === feedback.face.host
            && face.faceIndex === feedback.face.faceIndex
            && String(face.host.dataset?.rmKey || '') === feedback.ownerKey
            && String(face.host.dataset?.rmSourceHash || '') === feedback.sourceHash;
    }
    if (!belongs && feedback.face?.source !== 'independent') {
        const identity = feedback.root.getAttribute?.(MAINTENANCE_MIRROR_IDENTITY_ATTR);
        const owner = button.closest?.(`[${MAINTENANCE_MIRROR_IDENTITY_ATTR}]`);
        belongs = !!identity && owner?.getAttribute(MAINTENANCE_MIRROR_IDENTITY_ATTR) === identity
            && getMessageIndexFromMirrorNode(owner) === feedback.context.index;
    }
    return !!belongs;
}
function keepMaintenanceResultPanel(panel, root, button) {
    const status = panel.querySelector('[data-rm-maintenance-problem-text]');
    if (!status)
        return;
    panel.querySelectorAll('.rabbit-mirror-maintenance-menu-group').forEach(item => item.remove());
    panel.querySelectorAll('[data-rm-maintenance-action]').forEach(item => {
        if (item.getAttribute('data-rm-maintenance-action') !== 'close')
            item.remove();
    });
    panel.querySelector('[data-rm-copy-html-status]')?.remove();
    panel.querySelector('.rabbit-mirror-maintenance-menu-title').textContent = __rmT("GfcBIArSX73pUuQ7Xbrm5DeL");
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = __rmT("m6Fq0rj6AT7cjZ.KZvEyQns7");
    const face = getRabbitMirrorFacePosition(root);
    maintenanceResultPanel = { panel, status, root, button, face, context: maintenanceResultContext(root),
        ownerKey: String(face?.host?.dataset?.rmKey || ''),
        sourceHash: String(face?.host?.dataset?.rmSourceHash || ''),
        remountEpoch: String(face?.host?.dataset?.rmFaceRemountEpoch || '0') };
}
const MAINTENANCE_PANEL_WAITING = __rmT("m6Fq0rj6AT7cjZ.KZvEyQns7");
function liveMaintenancePanelButton(feedback, button) {
    if (button?.isConnected)
        return button;
    const scope = (feedback.face?.source === 'independent' ? feedback.face.host : null)
        || (Number.isInteger(feedback.context?.index) && feedback.context.index >= 0 ? getRenderedMessageElement(feedback.context.index) : null);
    if (!scope?.querySelectorAll)
        return null;
    for (const candidate of scope.querySelectorAll(`[${MAINTENANCE_RABBIT_ATTR}]`)) {
        try {
            if (maintenanceButtonBelongsToPanel(feedback, candidate))
                return candidate;
        }
        catch { }
    }
    return null;
}
function settleMaintenanceResultPanel(button, stampBefore) {
    const feedback = maintenanceResultPanel;
    if (!feedback?.status?.isConnected || feedback.button !== button)
        return true;
    if (feedback.status.textContent !== MAINTENANCE_PANEL_WAITING)
        return true;
    if (!maintenancePanelFaceStillCurrent(feedback)) {
        closeMaintenanceRabbitMenu();
        return true;
    }
    const live = liveMaintenancePanelButton(feedback, button);
    if (!live)
        return false;
    const stamp = Number(live.getAttribute(MAINTENANCE_STATE_STAMP_ATTR)) || 0;
    const state = live.getAttribute(MAINTENANCE_STATE_ATTR) || MAINTENANCE_STATES.idle;
    if (live === button && stamp === stampBefore) {
        feedback.status.textContent = __rmT("G5W1WsBgTP0cS3XwYdWDkWUyucqccEEGwRtNZzlCh8QArJWzzXtBm9hU7tFqKL4DyPcY2.OMi8RQWBTvVi32EUpujYeEgSVKU9mm5NhOWpSuibr6CF1cm_4xhFuSvO47VxYE7aMnPhIefEeSVUUI23G16iTgJK76kF3b7h._4SoUHgsfnIjDkY6k17E");
        feedback.status.setAttribute('data-rm-maintenance-result-state', MAINTENANCE_STATES.unknown);
        return true;
    }
    if (state === MAINTENANCE_STATES.checking)
        return false;
    const reason = live.getAttribute(MAINTENANCE_REASON_ATTR) || '';
    feedback.status.textContent = mergeMaintenanceProblemAndRecommendation(maintenanceMenuProblemText(state, reason), '');
    feedback.status.setAttribute('data-rm-maintenance-result-state', state);
    return true;
}
function watchMaintenanceResultPanel(button, stampBefore) {
    const delays = [1500, 6000, 20000, 60000, 180000];
    const tick = index => setTimeout(() => {
        let done = true;
        try {
            done = settleMaintenanceResultPanel(button, stampBefore);
        }
        catch {
            done = true;
        }
        if (!done && index + 1 < delays.length)
            tick(index + 1);
    }, delays[index] - (index ? delays[index - 1] : 0));
    tick(0);
}
function bindMaintenanceOutsideClose(panel, button) {
    try {
        maintenanceOutsideCloseCleanup?.();
    }
    catch { }
    toolOutsideCloseOwners.set('maintenance', { button, close: closeMaintenanceRabbitMenu });
    let closeOnOutside = null;
    const timer = setTimeout(() => {
        if (!panel?.isConnected)
            return;
        closeOnOutside = event => {
            if (!panel.isConnected || (!panel.contains(event.target) && event.target !== button))
                closeMaintenanceRabbitMenu();
        };
        document.addEventListener('pointerdown', closeOnOutside, true);
    }, 0);
    maintenanceOutsideCloseCleanup = () => {
        clearTimeout(timer);
        if (closeOnOutside)
            document.removeEventListener('pointerdown', closeOnOutside, true);
        closeOnOutside = null;
    };
}
function feedbackCatEscapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
export function closeFeedbackCatMenu() {
    try {
        feedbackOutsideCloseCleanup?.();
    }
    catch { }
    feedbackOutsideCloseCleanup = null;
    toolOutsideCloseOwners.delete('feedback');
    document.querySelectorAll?.(`[${FEEDBACK_CAT_MENU_ATTR}]`)?.forEach(panel => panel.remove());
}
function positionFeedbackCatPanel(panel, button, preferredWidth = 300) {
    if (typeof fitMirrorToolPanel === 'function')
        return fitMirrorToolPanel(panel, button, preferredWidth);
    const rect = button.getBoundingClientRect();
    const viewport = globalThis.visualViewport || null;
    const viewportWidth = Math.max(0, Number(viewport?.width || globalThis.innerWidth || 0));
    const viewportHeight = Math.max(0, Number(viewport?.height || globalThis.innerHeight || 0));
    const viewportLeft = Number(viewport?.offsetLeft || 0);
    const viewportTop = Number(viewport?.offsetTop || 0);
    const width = Math.min(preferredWidth, Math.max(250, viewportWidth - 24));
    panel.style.width = `${width}px`;
    panel.style.maxHeight = `${Math.max(160, viewportHeight - 24)}px`;
    const left = Math.max(viewportLeft + 12, Math.min(rect.left, viewportLeft + viewportWidth - width - 12));
    panel.style.left = `${left}px`;
    const panelHeight = Math.min(panel.offsetHeight || 0, Math.max(160, viewportHeight - 24));
    const top = Math.max(viewportTop + 12, Math.min(rect.bottom + 6, viewportTop + viewportHeight - panelHeight - 12));
    panel.style.top = `${top}px`;
}
function bindFeedbackCatOutsideClose(panel, button) {
    try {
        feedbackOutsideCloseCleanup?.();
    }
    catch { }
    toolOutsideCloseOwners.set('feedback', { button, close: closeFeedbackCatMenu });
    let closeOnOutside = null;
    const timer = setTimeout(() => {
        if (!panel?.isConnected)
            return;
        closeOnOutside = event => {
            if (!panel.isConnected || (!panel.contains(event.target) && event.target !== button))
                closeFeedbackCatMenu();
        };
        document.addEventListener('pointerdown', closeOnOutside, true);
    }, 0);
    feedbackOutsideCloseCleanup = () => {
        clearTimeout(timer);
        if (closeOnOutside)
            document.removeEventListener('pointerdown', closeOnOutside, true);
        closeOnOutside = null;
    };
}
function bindRecipeOutsideClose(panel, button) {
    try {
        recipeOutsideCloseCleanup?.();
    }
    catch { }
    toolOutsideCloseOwners.set('recipe', { button, close: closeRecipeMenu });
    let closeOnOutside = null;
    const timer = setTimeout(() => {
        if (!panel?.isConnected)
            return;
        closeOnOutside = event => {
            if (!panel.isConnected || (!panel.contains(event.target) && event.target !== button)) {
                closeRecipeMenu();
            }
        };
        document.addEventListener('pointerdown', closeOnOutside, true);
    }, 0);
    recipeOutsideCloseCleanup = () => {
        clearTimeout(timer);
        if (closeOnOutside)
            document.removeEventListener('pointerdown', closeOnOutside, true);
        closeOnOutside = null;
    };
}
function feedbackCatSourceIdentity(root) {
    const messageId = getMessageIndexFromMirrorNode(root);
    const chat = getAvailableHostChat();
    const message = messageId >= 0 ? chat[messageId] : null;
    const swipeId = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
    let sourceFingerprint = null;
    try {
        const renderedToto = root?.matches?.('toto') ? root : root?.closest?.('toto') || root;
        const scanned = scanRabbitMirrorHtml(String(message?.mes || renderedToto?.outerHTML || ''), renderedToto);
        sourceFingerprint = scanned && typeof scanned === 'object' ? {
            signature: scanned.signature || '',
            skeleton: scanned.skeleton || '',
            riskFlags: Array.isArray(scanned.riskFlags) ? scanned.riskFlags : [],
            paletteFingerprint: scanned.paletteFingerprint || null,
            interactionFamily: scanned.interactionFamily || null,
        } : null;
    }
    catch (error) {
        console.debug('[RabbitMirror] feedback cat source fingerprint skipped:', error);
    }
    return { messageId, swipeId, sourceFingerprint };
}
function feedbackCatButtonTitle() {
    const active = getActiveFeedbackForCurrentChat();
    return active
        ? `${__rmT("BNSR8Wq9WZY")}${feedbackCatStatusText(active)}${__rmT("OvPd9FP5yStDneKJk3xHq1aW")}` : __rmT("wcGhdZPvSehKpfes1Ypzuz.M..2aET8PLx_uRpt9mNQyjrfo1621dZu6JqfslJJtQnk");
}
function updateFeedbackCatButtonTitles(scope = document) {
    const title = feedbackCatButtonTitle();
    scope.querySelectorAll?.(`[${FEEDBACK_CAT_ATTR}]`)?.forEach(button => {
        button.title = title;
        button.setAttribute('aria-label', title);
        normalizeRabbitMirrorToolButton(button);
        normalizeRabbitMirrorToolHost(button.parentElement?.matches?.(`[${TOOL_ENTRY_HOST_ATTR}]`) ? button.parentElement : null);
    });
}
function saveFeedbackCatChoice(root, types, customText, rounds) {
    try {
        const source = feedbackCatSourceIdentity(root);
        const record = setActiveFeedbackForCurrentChat({
            types,
            customText,
            rounds,
            sourceMessageId: source.messageId,
            sourceSwipeId: source.swipeId,
            sourceFingerprint: source.sourceFingerprint,
        });
        updateFeedbackCatButtonTitles();
        const rangeText = Number(rounds) === 1 ? __rmT("K_qvWOtA") : `${__rmT("6J0e50tXHKG")}${rounds}${__rmT("2Rd9.k")}`;
        globalThis.toastr?.success?.(`${__rmT("nT8IbiSdfiQ2ToOcgPD")}${types.length}${__rmT("fimxZ91xsYXI06NVKMsgsT")}${rangeText}${__rmT("jzk")}`);
        return record;
    }
    catch (error) {
        globalThis.toastr?.warning?.(error?.message || __rmT("GauBGAOM4QCrxck_CdvM5sg0ZBYf1xs2"));
        return null;
    }
}
function showFeedbackCatRangeMenu(root, button, types, customText = '') {
    closeFeedbackCatMenu();
    const selectedTypes = [...new Set((Array.isArray(types) ? types : [types]).filter(type => FEEDBACK_CAT_TYPES[type]))];
    const panel = document.createElement('div');
    panel.className = 'rabbit-mirror-feedback-cat-menu';
    panel.setAttribute(FEEDBACK_CAT_MENU_ATTR, 'true');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', __rmT("nT8IbiSdt59_Vaa8Xif"));
    panel.innerHTML = `${__rmT("nj3_Pq3vHN_zabxknAvBmIQQ_sl_yLi1AKMOy3GxGbLCrIyzAwIhQfIVdi0_WAs5OCdy6Q8NQ8TWIYgS4fVbYhRp1pIWzC_zyEaV07KDJP5HTc.ys2d5nWHW7W_wKijAkI4G.2CV6RVRZNqGFd6s7B5jVwPIjLX9PMLlkrKWdGj3SVwrzVd85wi6OfFwModp.STD1ab.eZCyzDzvkRBNpT2XjQtZzPNF9kkeRKG9k38K0yzCz82S00ryx9KTQXibHBTcrH0QrZXS.RZfSxEI_8SZ81GYWu8tAQTz5PHpplZIrzi4k3cbUE.3P5Oh1UBZbARDW5NZIzctdIUlaGNkCdKzx4S_ytOSVwnPLh")}${selectedTypes.length}${__rmT("qGygZrop")}${feedbackCatEscapeHtml(selectedTypes.map(type => FEEDBACK_CAT_TYPES[type]).join(__rmT("jvk")))}${__rmT("Bq2.imbusGLhIO52mcK5y8j0Eae_ij8iCiMj77AdmXTUu.dZVFKuD2s76JAgalGhToVqDqyCBda.CU8bTI0RBaJYlYWQ0YhCAbRU3uFDr3ZST18QtD_.f48iXCOqOfvSBNzg0E.vdMMZJMQbgVYDwhfrfRaSckTMZ_xC2dagodas7VTV86EqF2FYigXi5tuR5ur0PUYO0K.fLeYWZHbcmzkp1aCOpfO6IUcQFboR7Wgg.O.kw2_kxiVLV8BK7i49ygpaHDaP_5IDOBzW3w.KqqW5sAk9rSxjblyeLXdyqpnC_rEqQLQlWccVq1ASyWNd9sLpbG8zsgsxvBoAscHOWV9TsBHGoKBV4Cl4S_e4FUxUg.Vnroj_LUJP1zmKTDrjEivIuuxeWaCrZaxx5QfDGxfptt1iZazsmKPLHNFO9AZ2Kmmj8BT7hGsgGHS5vofhe9._dfHXBARCAIvmMOc0zvQCrYHZtj.Jys0lSzlAgVm9drumv7BFCdwaKVOqbKnrfyTR6ZiH4Ss1EZV_QC67aiUkWxchyGq7yz1pdBgWzAUoeh6HRA4I.H8jIJ330LqElKY8pqrg5DpcIq3f0yREmGJqYUi6nh4Y.dML6s1BB0IM4hKvi6W9Quehvu6dvFPXtt.HNs61Kt4rQ_ebtTLI.kkjpxZc_EbRSZr2_XZB4y01I0G3Zy8cwEs7OnZItQYfjs2UUfW_HkWzecNkfBij4meTVZHEie36COs44WmKy40ADeg9tyRnTJZs_Gm_ABfYXtJTSl6uR4GgGGyB._tn7MScBQp0nNvmgR3g.WCa4Bc2YN_kXoLEdTnzCzWRiQPMyK6fA9nGtw8HddPAxKbLj4TlReyORM.E2akDFETf.u1RBvtT2gzSHGXw9ngzl4zmlI8HOcc5Rtt.o7CEs_x7cSCSqKI3HFY4bcC56rabhu.KyB7DcwbTG.pCUQYgqBPfINzjr1jfpXJDxfOj1gLMvhhGAAqrRbjYIPMM5NZYZKovRQ4Xe7bl_M4Ec3Frwxc6szPHMvu_wqLqfoW7_wh2wtSXbuE0QR44HMJiabjmr3iTqRDbznQTpTKEmezRFnjG0ktvEtR5PlYfEtOUOS48.I6.IJ5avz57zURmevqZoHWlSJKBSmxicsVpIro0Z.HpDB5Dr.mM1wATHcgZxN_WYHsLFgm_27zKx.E")}`;
    document.body.appendChild(panel);
    positionFeedbackCatPanel(panel, button);
    panel.addEventListener('click', event => {
        const roundsButton = event.target?.closest?.('[data-rm-feedback-rounds]');
        const action = event.target?.closest?.('[data-rm-feedback-action]')?.getAttribute('data-rm-feedback-action');
        if (!roundsButton && !action)
            return;
        event.preventDefault();
        event.stopPropagation();
        if (roundsButton) {
            const rounds = Number(roundsButton.getAttribute('data-rm-feedback-rounds'));
            const saved = saveFeedbackCatChoice(root, selectedTypes, customText, rounds);
            if (saved)
                closeFeedbackCatMenu();
            return;
        }
        if (action === 'back') {
            showFeedbackCatMenu(root, button, { types: selectedTypes, customText });
            return;
        }
        closeFeedbackCatMenu();
    }, true);
    bindFeedbackCatOutsideClose(panel, button);
    return true;
}
function feedbackCatIndependentOwner(root, button = null) {
    if (!root)
        return null;
    const details = root.matches?.('details') ? root : root.closest?.('details') || root.querySelector?.('details');
    const host = root?.matches?.('[data-rabbit-mirror-external-source="true"][data-rm-source="independent"]')
        ? root
        : root?.closest?.('[data-rabbit-mirror-external-source="true"][data-rm-source="independent"]')
            || root?.querySelector?.('[data-rabbit-mirror-external-source="true"][data-rm-source="independent"]')
            || details?.parentElement?.closest?.('[data-rabbit-mirror-external-source="true"][data-rm-source="independent"]');
    const buttonMesid = Number(button?.dataset?.rmFeedbackOwnerMesid);
    const directMesid = Number(details?.dataset?.rabbitMirrorOwnerMesid);
    const messageId = getMessageIndexFromMirrorNode(root);
    const targetMesid = Number.isInteger(directMesid) && directMesid >= 0
        ? directMesid
        : Number.isInteger(buttonMesid) && buttonMesid >= 0
            ? buttonMesid
            : messageId;
    const directKey = String(details?.dataset?.rabbitMirrorOwnerKey
        || details?.dataset?.rabbitMirrorExternalOwner
        || button?.dataset?.rmFeedbackOwnerKey
        || '');
    const directSource = String(details?.dataset?.rabbitMirrorExternalSource || button?.dataset?.rmFeedbackOwnerSource || '');
    const resolvedHost = host || (targetMesid >= 0
        ? [...(document.querySelectorAll?.('[data-rabbit-mirror-external-source="true"][data-rm-source="independent"]') || [])]
            .find(candidate => Number(candidate?.dataset?.rmOwnerMesid ?? candidate?.dataset?.rmExternalOwnerMessage) === targetMesid)
        : directKey
            ? [...(document.querySelectorAll?.('[data-rabbit-mirror-external-source="true"][data-rm-source="independent"]') || [])]
                .find(candidate => String(candidate?.dataset?.rmKey || '') === directKey)
            : null);
    if (!resolvedHost && directSource !== 'independent')
        return null;
    const chat = getAvailableHostChat();
    const finalMesid = Number(resolvedHost?.dataset?.rmOwnerMesid
        ?? resolvedHost?.dataset?.rmExternalOwnerMessage
        ?? targetMesid);
    if (!Number.isInteger(finalMesid) || finalMesid < 0 || chat[finalMesid]?.is_user)
        return null;
    const message = chat[finalMesid] || null;
    let ownerChat = '';
    try {
        ownerChat = String(getCurrentChatKey?.(chat) || '');
    }
    catch { }
    const faceIndex = getRabbitMirrorFacePosition(root)?.faceIndex;
    return {
        chat: String(resolvedHost?.dataset?.rmOwnerChat
            || details?.dataset?.rabbitMirrorOwnerChat
            || button?.dataset?.rmFeedbackOwnerChat
            || ownerChat),
        mesid: finalMesid,
        swipe: Number(resolvedHost?.dataset?.rmOwnerSwipe
            ?? details?.dataset?.rabbitMirrorOwnerSwipe
            ?? button?.dataset?.rmFeedbackOwnerSwipe
            ?? (Number.isInteger(message?.swipe_id) ? message.swipe_id : 0)),
        key: String(resolvedHost?.dataset?.rmKey || directKey),
        sourceHash: String(resolvedHost?.dataset?.rmSourceHash
            || details?.dataset?.rabbitMirrorOwnerSourceHash
            || button?.dataset?.rmFeedbackOwnerSourceHash
            || ''),
        ...(Number.isInteger(faceIndex) ? { faceIndex } : {}),
    };
}
function invokeFeedbackMirrorAction(action, root, owner) {
    const bridge = globalThis.__rabbitMirrorIndependentActionsV1;
    if (bridge?.runtime === RUNTIME_VERSION && typeof bridge?.[action] === 'function') {
        try {
            if (bridge[action](root, owner || {}))
                return true;
        }
        catch (error) {
            console.debug('[RabbitMirror] independent action bridge failed, using event fallback:', error);
        }
    }
    const detail = { root, owner: owner || {}, handled: false };
    document.dispatchEvent(new CustomEvent(action === 'resay' ? FEEDBACK_RESAY_EVENT : FEEDBACK_HISTORY_EVENT, { detail }));
    return !!detail.handled;
}
function showFeedbackCatMenu(root, button, draft = null) {
    closeMaintenanceRabbitMenu();
    closeFeedbackCatMenu();
    if (!root?.isConnected || !button?.isConnected)
        return false;
    const active = getActiveFeedbackForCurrentChat();
    const lastReceipt = getFeedbackCatLastReceiptForCurrentChat();
    const initialTypes = Array.isArray(draft?.types)
        ? draft.types
        : Array.isArray(active?.types)
            ? active.types
            : active?.type
                ? [active.type]
                : [];
    const selected = new Set(initialTypes.filter(type => FEEDBACK_CAT_TYPES[type]));
    let customText = String(draft?.customText ?? active?.customText ?? '');
    const panel = document.createElement('div');
    panel.className = 'rabbit-mirror-feedback-cat-menu';
    panel.setAttribute(FEEDBACK_CAT_MENU_ATTR, 'true');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', __rmT("nT8IbiSdM4k319RGOSE"));
    const receiptLine = lastReceipt
        ? `${__rmT("Co9w1cI_c6_abYbx1HDSqqDAGfD7QOEDvBvePi4DkuhVoc_NHIuxLFCK3F.UExbotXjmJ0UDLsXeQ.9COX8vbyxuwqcWdbNuxMp9.3fAwr5pPD2oon2W4VBLwJkwXj0UF1b94.wbNtv.pluXLfB")}${feedbackCatEscapeHtml(feedbackCatReceiptText(lastReceipt))}</div>` : '';
    const status = active
        ? `${__rmT("oHs_bi1TyJwSqQdQcP32Koqc8etK5zLfkzmh8_rd0IPJjtz5i3eS7zu1rhShzxe0zxOroa27Yc1ROwwIfLlRjUhGTwfupfElGARZ2UgtefMRtD0IngTnUJWfkNdmY05qkN_OA5Z6Icl")}${feedbackCatEscapeHtml(feedbackCatStatusText(active))}</div>${receiptLine}` : lastReceipt
        ? `${__rmT("oQuMHqloBpwRRAhSxucI0jFpe9UJJUXUKT6Ob3m2Q9xvgHcyToIbV1KqtXTlMX6ybaUznU9Jrlf_wNYRUwh.HIFa0SNOteCjbe9BwFvI9ZqrnpqrtnK2v.btniHlI1kOepvxsGvd_MvygURDVIRvBVTLp1gEmrMzQwPaPLmy1pG")}${receiptLine}` : __rmT("vcFC37KTNfWg9r_OIgFweyW_upJNQICGkg4g6isAkA7wPd6D_0r3DfS70opqigGJC1IHL1O57Jlp37gjMpdPzT58a7oNzukvMZWK2J7JdXk1EtqAmo4eZUeDjvjIaUFW.I1lrmwzDhmZqjppAUg3mQShJ63TLcyiNvf62DpfiRo8P_fM2XtysCS.E4.VoJo9iPHYFRBNxmA");
    panel.innerHTML = `${__rmT("PJDKhHOGjehEj4KEnU9yfKJsgYgpFMM_ag_MGT9N4WKfgxgMZ7pP3O2BFifJGwyYkNSX3VmiIj1uGYteRhD3FjUsOJs5Mb3dQUpZv406YAiXbZc6ONIETXXXYcPipFVPWDbCmk4LQFrjrdsAK1rYqNwgKtGIbLD7z2PlTv_HK1vOo5HIIOs3vR11QDw404zZ8mMIMaNl7hoav3U.frY")}${status}${__rmT("pN_3bTHt4eW3sc1BlelSmx8BjfK.wsQWeoktBGXpuWfwE.Uh5D6WVLczIWiIGvJFYwvPpkFBwUoMtaEDNOBoB4Kg6KS8qDBVmOOwvCfdpfwZxEs_3EJd463ckJeoN0pKVGnQ0MPyWZoCmGNfLOJzb4a_VrjhkwS77NcxRpbuuX1DNVj_ScbpSYHkU36LLihFFSCvmoIh6oyc8CFTjuOdkqJAvCgvnKW_lF43Kd6zeBkRgDSPMsaj1APdNvi8475qVDqb2wHbH8RhXQH0yzO8_Hz1QSK_PXRwaF.paB_t8O0qIiaBOwqF6HiF8XQ4LUh_7u04_M0nb1HDf0LzO14kX_gtAQmWACcekmDRXw05r4Y")}${FEEDBACK_CAT_TYPES.color}</button>
      <button type="button" data-rm-feedback-type="structure">▦ ${FEEDBACK_CAT_TYPES.structure}</button>
      <button type="button" data-rm-feedback-type="overall">◉ ${FEEDBACK_CAT_TYPES.overall}</button>
      <button type="button" data-rm-feedback-type="interaction">✦ ${FEEDBACK_CAT_TYPES.interaction}</button>
      <button type="button" data-rm-feedback-type="language">🌐 ${FEEDBACK_CAT_TYPES.language}${__rmT("If67n65bTLsAjf3bu_qBHgc2mVjX9PmwZT9oukxe9w.06vFll5fWK5uZzXzlesZC8Q_aAv5ZTcsHafljzBKqRpS16URt3.C_HSbvgYxO0NSnJNmWcwTZzOzH3q.G6sktP_tVhgecPOQaqs3vafkM8BP4Ptwc.K7458xjVMe6b1X1Gm94uahSDIPiuL55nswxYVqHjt2JUV006HlFaqq6jJqfNDOs.FQePkRNdtNJnXFaytPW6GUwRiQvlmJuAUhQS2sp1mlyA5PUIp2eGY_ep40BPeRR3pSrwVOA00EtZrxJUVeFrDjAO5t1W_PVfeJZYteWzKEawfiGYF2Bg2RbHNAsHiqO6t7CB0.C4mN.65pgvRRNIzmDPJrq.IwrQftB42U9j7nCIF8E9k9y.Gy9o.WknurszZ4za7rFmKq7lpPqt85t7fqxQc07k5pM44yj_.AwDr.ElNiwS0ExMMWuiqZqp6a_fWb89Ty4Njfje7bup7bgzl6kOiFIIDmBg6EtuAxsKx3OpvUc0oxoewg3.Q_rbVuRdZkT3.aZMT_Re0AsgTnlHbJlbaqkis.455woNLNz0fKte5GWFKCNseyeVAybZbkrSDDEbnzPXz56ghA0aFU8EGpQjq2scGGuXmfvnIpxllEgKdgLpE1cNpaSFcAT_sNe3wE.E_lLMcinO9uW5IuwDqRP9lh9l2mLERPSYZsabPMao5xhgRpEe.Oecjfl6OY9AwY7R_S13llrvx0TBdpypVJt9LpmohYQjkOZBCYDC8eDS.qfbYkhKV9Epkixqg6uYw7y7DxlR3NOUBnGLjVB7Seje_b.BxNntbYmYKx5i2ZeiCM6Yhw4yUAKTsmeeQ9kpHpc70wC0ZL9rHi5EjVH_UGrIBwA.9QQfeAIALSOcvmDVz4tsgYMDvBh3ZtDrvPq.UphIoXICOumtHw29FMAZGku6d8S546BW1OYjHLVhL0gMEJ5SskzXI1D7Nmpvo9q4ufZ3WOH.92PqY5T7E_Vw4MduffX_DhsVh_NXQibdI7iU1uWtCwnpuQe_ngIOOhuSb9dNP2JLYcvAZF6f6PsljehrDaKh7FAPLw_S3lYoM9398J_1UFGArGb7kWK3C6_3z2Zcant6hRkyc16QlqRZG4ZPzyc82C2tkpZltUdB4u_E309sk9MelWeWa498Y5U0H8UCBupkzboTlBmXk5xpG13z8_sg1u8AgZlHXi3H1ZJpMeyJvXkPgIEZtXupZvH3oenKiDWb0S.E9HgAh")}${active ? __rmT("MDiFCODQyVZBLCGuGRlIHak4SkAUSr0tkveMsgvwCRqzGp4EEF_WdNbf3dwfU5wJi3Zu7pzx.Rn8G1OFbRPbxibsBEQGm.9qC9HU7ks.nqFS6j9KLIkdRvIU6j2ic2No3S9TgcGOG4ri1PtHe0uit1vYlvFv5u1OaZLHdR.ah9UYr18Uneiwj5UeHN1lFwabVeYXN3PZEzgmkgrUdJQ7nshLgLl") : ''}${__rmT("mlV6iH6M.A7agprRhy8RSdetuL6KMslFzCYOJYuy0ibXcmeT.x2sXwQD4fRW4Xxl7iyxeofDHf2j1kamKfsb3gJKILlDAbKhPKZHw2xxmm5VT._fPD6Ulbtr.FDPXGSy7La8jpsP_TbsHtn.22s3DjF60ts31EjhF4hQ2IktmbHDd_y9.otIubi7YbV7Dcv7")}`;
    const textarea = panel.querySelector('.rabbit-mirror-feedback-cat-custom-inline');
    textarea.value = customText;
    const render = () => {
        panel.querySelectorAll('[data-rm-feedback-type]').forEach(item => {
            const type = item.getAttribute('data-rm-feedback-type');
            const on = selected.has(type);
            item.classList.toggle('is-selected', on);
            item.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        const customOn = selected.has('custom');
        textarea.classList.toggle('is-visible', customOn);
        textarea.hidden = !customOn;
        panel.querySelector('[data-rm-feedback-action="submit"]').disabled = selected.size === 0;
    };
    document.body.appendChild(panel);
    positionFeedbackCatPanel(panel, button, 340);
    render();
    panel.addEventListener('click', event => {
        const typeButton = event.target?.closest?.('[data-rm-feedback-type]');
        const action = event.target?.closest?.('[data-rm-feedback-action]')?.getAttribute('data-rm-feedback-action');
        if (!typeButton && !action)
            return;
        event.preventDefault();
        event.stopPropagation();
        if (typeButton) {
            const type = typeButton.getAttribute('data-rm-feedback-type');
            if (selected.has(type))
                selected.delete(type);
            else
                selected.add(type);
            render();
            if (type === 'custom' && selected.has('custom'))
                setTimeout(() => textarea.focus(), 0);
            return;
        }
        if (action === 'reset') {
            selected.clear();
            customText = '';
            textarea.value = '';
            render();
            return;
        }
        if (action === 'submit') {
            customText = textarea.value.trim();
            if (!selected.size) {
                globalThis.toastr?.warning?.(__rmT("2c7yOahvtIDdnIXqaiqCJxEI"));
                return;
            }
            if (selected.has('custom') && !customText) {
                globalThis.toastr?.warning?.(__rmT("bDFhdbHBE3eFsn2uTkR6B6qxkYes5xs2"));
                textarea.focus();
                return;
            }
            showFeedbackCatRangeMenu(root, button, [...selected], customText);
            return;
        }
        if (action === 'clear-active') {
            clearActiveFeedbackForCurrentChat();
            updateFeedbackCatButtonTitles();
            closeFeedbackCatMenu();
            globalThis.toastr?.success?.(__rmT("GauBGAOMjM0kq00Dep4U2qhMZY3R47s2"));
            return;
        }
        if (action === 'history') {
            if (!panel.isConnected)
                return;
            const owner = feedbackCatIndependentOwner(root, button) || {};
            const handled = invokeFeedbackMirrorAction(action, root, owner);
            closeFeedbackCatMenu();
            if (!handled)
                globalThis.toastr?.warning?.(__rmT("KjqIO_tcBR8p56HnvlkLI6jvYOaqW568KwyxIUZGsJeFJH5F0S37Bj5X"));
            return;
        }
        closeFeedbackCatMenu();
    }, true);
    textarea.addEventListener('input', () => { customText = textarea.value; });
    bindFeedbackCatOutsideClose(panel, button);
    return true;
}
function rabbitMirrorExternalGenerationState(root) {
    const host = root?.matches?.('[data-rabbit-mirror-external-source="true"][data-rm-state]')
        ? root
        : root?.closest?.('[data-rabbit-mirror-external-source="true"][data-rm-state]');
    return String(host?.getAttribute?.('data-rm-state') || '');
}
function rabbitMirrorExternalGenerationNotice(root, kind = 'maintenance') {
    const state = rabbitMirrorExternalGenerationState(root);
    if (state === 'loading') {
        const message = kind === 'feedback'
            ? __rmT("m10HJIYz08_9zhFrS4EYt99m3ZEMbly.._vqOr4sKM6GSG.OM1CPfNhYzBG") : __rmT("pb7i424xLm3IXmR8xndvCajg3NP_9y6m29E");
        globalThis.toastr?.info?.(message);
        return true;
    }
    if (state === 'error' && kind === 'maintenance') {
        globalThis.toastr?.warning?.(__rmT("WZGdY5r5tHOFwCa3JNRscbUz1A6PVFA0NNlXs2PT1COnqeqKJk3w6hCAvI5wHuh4UfSzdszxxjMRYUWgTgzkMJ2P75k4.ADmANA"));
        return true;
    }
    return false;
}
const RESAY_CHOOSER_ATTR = 'data-rm-resay-chooser';
const RESAY_PICK_MAX = Object.freeze({ theme: 3, format: 2 });
const EXTERNAL_STORE_MODULE = '../externalWorldBook/store.js?rmv=2.5.4';
function createResayTopicPicker(doc, kind, onChange) {
    const tree = buildSelectionCatalog(kind);
    const max = RESAY_PICK_MAX[kind] || 1;
    const groupNames = kind === 'format' ? FORMAT_GROUP_NAMES : THEME_GROUP_NAMES;
    const kindLabel = kind === 'format' ? __rmT("1Q3is5nrSDY") : __rmT("jztJOyteqLCA0Sc9gEs");
    const selected = [];
    const titles = new Map();
    let open = false;
    let source = 'builtin';
    let query = '';
    let group = '';
    let libraries = null;
    let libraryId = '';
    let externalChoices = null;
    let externalHasNext = false;
    let externalError = '';
    let loadToken = 0;
    const wrap = doc.createElement('div');
    wrap.setAttribute('data-rm-resay-pick-kind', kind);
    wrap.style.cssText = 'margin-top:8px;';
    const head = doc.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;';
    const headName = doc.createElement('span');
    const toggle = doc.createElement('button');
    toggle.type = 'button';
    toggle.setAttribute('data-rm-resay-pick-toggle', 'true');
    toggle.style.cssText = 'min-height:34px;padding:4px 10px;border:1px solid rgba(127,127,127,.4);border-radius:999px;background:transparent;color:inherit;font:inherit;font-size:11px;cursor:pointer;';
    head.append(headName, toggle);
    const chips = doc.createElement('div');
    chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;margin-top:5px;';
    const browser = doc.createElement('div');
    browser.hidden = true;
    browser.style.cssText = 'margin-top:6px;';
    const tabs = doc.createElement('div');
    tabs.style.cssText = 'display:flex;gap:6px;margin-bottom:6px;';
    const search = doc.createElement('input');
    search.type = 'search';
    search.setAttribute('aria-label', `${__rmT("Ygqd7h")}${kindLabel}`);
    search.style.cssText = 'width:100%;box-sizing:border-box;min-height:40px;border:1px solid rgba(127,127,127,.4);border-radius:8px;padding:6px 8px;background:transparent;color:inherit;-webkit-text-fill-color:currentColor;font:inherit;font-size:16px;';
    const list = doc.createElement('div');
    list.style.cssText = 'margin-top:5px;max-height:220px;overflow:auto;border:1px solid rgba(127,127,127,.24);border-radius:8px;padding:2px 6px;';
    browser.append(tabs, search, list);
    wrap.append(head, chips, browser);
    const rowStyle = 'display:flex;width:100%;align-items:center;justify-content:space-between;gap:8px;min-height:40px;border:0;border-bottom:1px solid rgba(127,127,127,.16);padding:6px 2px;background:transparent;color:inherit;cursor:pointer;font:inherit;text-align:left;';
    const tabStyle = on => `flex:1;min-height:34px;border:1px solid ${on ? 'currentColor' : 'rgba(127,127,127,.4)'};border-radius:8px;background:${on ? 'rgba(127,127,127,.14)' : 'transparent'};color:inherit;font:inherit;font-size:11px;font-weight:${on ? 800 : 500};cursor:pointer;`;
    const note = text => `<div style="padding:10px 2px;opacity:.62;font-size:11px;line-height:1.5;">${feedbackCatEscapeHtml(text)}</div>`;
    const itemRow = (id, title, meta, depth = 0) => {
        const on = selected.includes(id);
        return `<button type="button" data-rm-resay-pick-id="${feedbackCatEscapeHtml(id)}" data-rm-resay-pick-title="${feedbackCatEscapeHtml(title)}" aria-pressed="${on ? 'true' : 'false'}" style="${rowStyle}padding-left:${2 + Math.min(4, depth) * 12}px;">
          <span style="min-width:0;flex:1;"><span style="display:block;font-size:12px;font-weight:${on ? 800 : 600};line-height:1.4;overflow-wrap:anywhere;">${feedbackCatEscapeHtml(title || id)}</span>${meta ? `<span style="display:block;font-size:10px;opacity:.55;overflow-wrap:anywhere;">${feedbackCatEscapeHtml(meta)}</span>` : ''}</span>
          <span aria-hidden="true" style="flex:0 0 auto;font-size:13px;font-weight:800;">${on ? '✓' : '+'}</span>
        </button>`;
    };
    const renderBuiltin = () => {
        if (query) {
            const needle = query.toLowerCase();
            const matches = tree.entries.filter(item => `${item.id} ${item.title} ${item.summary}`.toLowerCase().includes(needle));
            list.innerHTML = matches.slice(0, 40).map(item => itemRow(item.id, item.title, `${item.id}${isBlacklisted(kind, item.id) ? __rmT("4b8RjaFyF_.bknoH") : ''}`)).join('') || note(__rmT("T8yI.ejxRp_QIEUIND2pUT"));
            if (matches.length > 40)
                list.insertAdjacentHTML('beforeend', note(`${__rmT("tB0CyT")}${matches.length}${__rmT("FmDfuI78_pLCnFDN3rdHuaPDeoB9D8uZlwZefR.gkKaiI_u8EJV7Yv3l8Vj0uvkC")}`));
            return;
        }
        if (group) {
            const items = tree.entries.filter(item => String(item.group || __rmT("yGhZ3f")) === group)
                .sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
            const base = items.length ? Math.min(...items.map(item => item.id.split('.').length)) : 0;
            list.innerHTML = `<button type="button" data-rm-resay-pick-group="" style="${rowStyle}${__rmT("l3HPZ82DNmvKwKWDuUhtRnATmohS2zUYa6ub8633W50lbFVyxaxYEioE8gx3GEQQtqDENSbx1xl8G8wWtdRjvD3YVdbdqJMgeB1Fc3gqLo62gVQwjQT")}` + (items.map(item => itemRow(item.id, item.title, `${item.id}${isBlacklisted(kind, item.id) ? __rmT("4b8RjaFyF_.bknoH") : ''}`, item.id.split('.').length - base)).join('') || note(__rmT("iazDWJ0_ag9pVsUIND2pUT")));
            return;
        }
        const keys = [...new Set(tree.entries.map(item => String(item.group || __rmT("yGhZ3f"))))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        list.innerHTML = keys.map(key => {
            const count = tree.entries.filter(item => String(item.group || __rmT("yGhZ3f")) === key).length;
            return `<button type="button" data-rm-resay-pick-group="${feedbackCatEscapeHtml(key)}" style="${rowStyle}"><span style="font-size:12px;font-weight:700;">${feedbackCatEscapeHtml(groupNames[key] ? `${key} · ${groupNames[key]}` : `${__rmT("SJbCyT")}${key}`)}</span><span style="font-size:10px;opacity:.56;">${count}${__rmT("6RTG_NYy.e9HNzmEYiI.f.D6zGPbNSdjucDxGLkLxkSafav1EVfM3f")}`;
        }).join('');
    };
    const renderExternal = () => {
        if (externalError) {
            list.innerHTML = note(externalError);
            return;
        }
        if (!libraries) {
            list.innerHTML = note(__rmT("m6Fq0QGHkvtPNYHDOyIJC0s7"));
            return;
        }
        if (!libraries.length) {
            list.innerHTML = note(__rmT("aclrrDlpwV8cz0fGxZuHsX9jFGlT1QtEJRNMs5l74o3Bp_oaF4fq_SdDiWsrRu96.VxrF2lqWNT7emLDVk_VsjBYjN8uUnYO"));
            return;
        }
        if (!libraryId) {
            list.innerHTML = libraries.map(library => `<button type="button" data-rm-resay-pick-library="${feedbackCatEscapeHtml(library.libraryId)}" style="${rowStyle}"><span style="font-size:12px;font-weight:700;overflow-wrap:anywhere;">${feedbackCatEscapeHtml(library.displayName || library.sourceWorldBookName || library.libraryId)}</span><span style="font-size:10px;opacity:.56;">›</span></button>`).join('');
            return;
        }
        const back = `<button type="button" data-rm-resay-pick-library="" style="${rowStyle}${__rmT("8R5v4Aqc61nXRcHYKbmEfAHTag2maVxbDHD8erx93vaQWCS1007dZavbRzG9iM3EFcT.QeqWXHe8a.shnyhrhs7aHxV0wlhRTiSeK1_fJsCE580Z.MCwX49Vq.k")}`;
        if (!externalChoices) {
            list.innerHTML = back + note(__rmT("kBZhOu_HP8jEVcMwGR4hOT"));
            return;
        }
        const rows = externalChoices.map(choice => itemRow(choice.externalId, choice.title, __rmT("lX0o.X8U"))).join('');
        list.innerHTML = back + (rows || note(`${__rmT("CpnvFsj1ZAE")}${query ? __rmT("VOUk8SFj_Ugs.k") : __rmT("0QJ5ygTnylJXVdQI")}${kindLabel}${__rmT("WXf_HWKg")}`))
            + (externalHasNext ? note(__rmT("wCgaODbi136Kfy8AQHB6jSqyq25_iPnCvHbZoTtkDncTe_bAqbmFGW5X")) : '');
    };
    const loadLibraries = async () => {
        const token = ++loadToken;
        try {
            const store = await import(EXTERNAL_STORE_MODULE);
            const rows = await store.listExternalLibraries();
            if (token !== loadToken)
                return;
            libraries = (rows || []).filter(row => row?.enabled === true && row?.libraryId);
        }
        catch {
            if (token !== loadToken)
                return;
            externalError = __rmT("dQgauPgst637qbcRHTM7IQWtcuytEPFjdAkwspn20CX.bh");
        }
        render();
    };
    const loadChoices = async () => {
        const token = ++loadToken;
        externalChoices = null;
        render();
        try {
            const store = await import(EXTERNAL_STORE_MODULE);
            const page = await store.listExternalLibraryEntryChoices(libraryId, { pageSize: 50, query });
            if (token !== loadToken)
                return;
            externalChoices = (page?.choices || []).filter(choice => choice.enabled && choice.selectable && choice.classification === kind);
            externalHasNext = page?.hasNext === true;
        }
        catch {
            if (token !== loadToken)
                return;
            externalChoices = [];
            externalError = __rmT("_NNeVDns29M7kFeVXn6jIUqgSx.B7scn.1TNhO1abcnq0cuRzjF6L9hYzBG");
        }
        render();
    };
    function render() {
        headName.innerHTML = `${feedbackCatEscapeHtml(kindLabel)} <span style="opacity:.6;font-size:11px;">${selected.length}/${max}</span>`;
        toggle.textContent = open ? __rmT("oPv5.h") : (selected.length ? __rmT("f0nXhg0LwPs") : __rmT("f0nXhIWAncl"));
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        chips.innerHTML = selected.length
            ? selected.map(id => `<button type="button" data-rm-resay-pick-remove="${feedbackCatEscapeHtml(id)}${__rmT("q4Gkyw.MNSVSHQLOTB5julVbcT7zZBGIx6m77VkvxnktAdHa01X6CpK.nrkEGGQ1G6JOc54iPQmhiX0EIoNbH.2b2fRssIEvp7z7z_gbJPmJImrV.U4Y8Af0bxFvmcuC8Oso9U71yep3n.BghkhriRoXHdSE54RSio12GDTxgGno6aQyxSLIyGrW3BkuVNrdrCLS3Pg_cQhAbuVqKUgQYNYXS6hdWR0h_IcxCoYuqYhSfwvAfH.71EKTdUtmd_lI4ybAi94IANGKndTQTNMs2txi3MM1L_mlIptC6kL7QIzWUZ9RNHJfwVEqy8Cx1SPtK7btcfuaQDN9YQK7HIQSpS0FAM7_G1XSWrXOE9CsNl4T0AXe3xeoQ_CdSCeYg_3m_TYbRlFbp6yBnCzOZY.w6L8utW24Jmc6bqfnX1qXHbnstj2ILypfD.YFiGL7YD90SP9gNTi5fuW40CkW0yCq5KYyJn7NHQjdcRWwH0Z.jNSVRBSZb3teAEZ4BhYn_whd9kCOSgtdvnhm85sFWAIkPl4c1YOSKy7EwWabIPwUc6_a8NddMy50YGE6hcShYKs1m9S8ILrBEocJq5fjJv0zTMS9bzO.eb3NjSMCEJXAyL_BYGiPMhnn6eekLzdGemFuPlerbb9X4EHyJ7QVQDunFh")}${id.startsWith('ext:') ? '📖 ' : ''}${feedbackCatEscapeHtml(titles.get(id) || id)} ×</button>`).join('')
            : '';
        chips.hidden = !selected.length;
        browser.hidden = !open;
        if (!open)
            return;
        tabs.innerHTML = `<button type="button" data-rm-resay-pick-source="builtin" style="${tabStyle(source === 'builtin')}${__rmT("LWlHXZzni7H7GHhiXhkFb1yBcbbrWDK8kr0qfZqooXX.TkZk_ScK0Sw_I33S2Uc_Ft4fIbq71wzr0h.YzOhKDCsbt.Ifq2f_X1ZrdSXrR58.kU18MxbuI8rfn3bbGyFsEYMeCj89BjTHZQMk9R0QoZX.ix1vw1WErSAroDUS3S5Ni9Dt4ngBk55Ks80ItMyseNNJVjgE_wJn8ZmFWpv6yihk")}${tabStyle(source === 'external')}${__rmT("RM38YET_SJ6bwU6AOK24f20OI9Or.gS102e2.I2bpP8")}`;
        search.placeholder = source === 'external' ? __rmT("lu9BDSsHXoz7zqMw") : __rmT("ksbflGul_.L7QPpAFayKfzSKXk.RVGbBfKJT7T");
        if (source === 'external')
            renderExternal();
        else
            renderBuiltin();
    }
    const choose = (id, title) => {
        const at = selected.indexOf(id);
        if (at >= 0)
            selected.splice(at, 1);
        else if (selected.length >= max) {
            globalThis.toastr?.info?.(`${kindLabel}${__rmT("ZN5paesQHKG")}${max}${__rmT("uNYYrto2qi0fqIFfqlwd7uQRFPb7WRqO29E")}`);
            return;
        }
        else {
            selected.push(id);
            if (title)
                titles.set(id, title);
        }
        render();
        onChange?.();
    };
    let searchTimer = 0;
    wrap.addEventListener('click', event => {
        const target = event.target?.closest?.('button');
        if (!target || !wrap.contains(target))
            return;
        event.preventDefault();
        if (target.hasAttribute('data-rm-resay-pick-toggle')) {
            open = !open;
            render();
            onChange?.();
            return;
        }
        if (target.hasAttribute('data-rm-resay-pick-id')) {
            choose(target.getAttribute('data-rm-resay-pick-id'), target.getAttribute('data-rm-resay-pick-title'));
            return;
        }
        if (target.hasAttribute('data-rm-resay-pick-remove')) {
            choose(target.getAttribute('data-rm-resay-pick-remove'));
            return;
        }
        if (target.hasAttribute('data-rm-resay-pick-group')) {
            group = target.getAttribute('data-rm-resay-pick-group') || '';
            render();
            list.scrollTop = 0;
            return;
        }
        if (target.hasAttribute('data-rm-resay-pick-source')) {
            const next = target.getAttribute('data-rm-resay-pick-source') === 'external' ? 'external' : 'builtin';
            if (next === source)
                return;
            source = next;
            query = '';
            search.value = '';
            externalError = '';
            render();
            if (source === 'external' && !libraries)
                void loadLibraries();
            return;
        }
        if (target.hasAttribute('data-rm-resay-pick-library')) {
            libraryId = target.getAttribute('data-rm-resay-pick-library') || '';
            externalChoices = null;
            externalError = '';
            query = '';
            search.value = '';
            if (libraryId)
                void loadChoices();
            else
                render();
        }
    });
    search.addEventListener('input', () => {
        query = search.value.trim();
        if (source === 'external') {
            clearTimeout(searchTimer);
            if (libraryId)
                searchTimer = setTimeout(() => { void loadChoices(); }, 250);
            return;
        }
        render();
        list.scrollTop = 0;
    });
    for (const item of tree.entries)
        titles.set(item.id, item.title);
    render();
    return { element: wrap, selected: () => selected.slice() };
}
export function closeRabbitMirrorResayChooser() {
    document.querySelectorAll?.(`[${RESAY_CHOOSER_ATTR}]`)?.forEach(panel => panel.remove());
}
export function quickResayRabbitMirror(root, options = {}) {
    const bridge = independentActionBridge();
    if (bridge?.runtime !== RUNTIME_VERSION)
        return false;
    const action = bridge.prepareQuickResay?.(root, {}, options);
    return typeof action === 'function' ? action() !== false : false;
}
export function openRabbitMirrorResayChooser(root, anchor = null) {
    closeRabbitMirrorResayChooser();
    closeFeedbackCatMenu();
    closeRecipeMenu();
    closeMaintenanceRabbitMenu();
    if (!root?.isConnected)
        root = liveRootFor(root, anchor);
    if (!root?.isConnected) {
        globalThis.toastr?.info?.(__rmT("X1PDJ1APdAb9h.Lzu7dgPqt6yoXHdpbUKUl3iMm1FjkGYM9dq8_"));
        try {
            const scope = anchor?.closest?.('.mes');
            if (scope)
                refreshRabbitMirrorToolsInScope(scope);
        }
        catch { }
        return false;
    }
    if (rabbitMirrorExternalGenerationNotice(root, 'feedback'))
        return false;
    const bridge = globalThis.__rabbitMirrorIndependentActionsV1;
    const gate = getSettings().generationSource === 'follow' ? null
        : bridge?.runtime === RUNTIME_VERSION ? bridge.canResay?.(root, {}) : null;
    if (gate && gate.ok === false) {
        globalThis.toastr?.warning?.(gate.message || __rmT("7xadUMatA6isqv_iV3esezhcbNs"));
        return false;
    }
    const doc = root.ownerDocument || document;
    const panel = doc.createElement('div');
    panel.setAttribute(RESAY_CHOOSER_ATTR, 'true');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', __rmT("oiZK4EMgt8ANef"));
    panel.style.cssText = 'position:fixed;z-index:2147483646;box-sizing:border-box;padding:12px 13px;border:1px solid rgba(127,127,127,.35);border-radius:10px;background-color:#1a2030;background-image:linear-gradient(var(--SmartThemeBlurTintColor,rgba(28,28,32,.94)),var(--SmartThemeBlurTintColor,rgba(28,28,32,.94)));color:var(--SmartThemeBodyColor,#eee);box-shadow:0 10px 32px rgba(0,0,0,.28);overflow:auto;font-family:inherit;';
    const title = doc.createElement('div');
    title.textContent = __rmT("j5ol4AvS.p3FXaULOPMClk");
    title.style.cssText = 'font-weight:800;font-size:13px;margin-bottom:4px;';
    const help = doc.createElement('p');
    help.textContent = __rmT("fEwIr8owE5iKCKgsZy9aPGMjVSL0H84cb.Iv2rfHjWmkRTtLpJtUxo_eDjRjerr_ejKJplckT.HzcBJ3KiOEpIH49sf87LOzGRfdzLLLXArhZjat_lF9N5iXHo_kavbF2JbE5w7f1FT");
    help.style.cssText = 'font-size:11px;line-height:1.5;opacity:.72;margin:0 0 8px;';
    let mode = '';
    const choices = doc.createElement('div');
    choices.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
    const makeChoice = (value, label, detail) => {
        const button = doc.createElement('button');
        button.type = 'button';
        button.setAttribute('data-rm-resay-mode', value);
        button.style.cssText = 'min-height:44px;text-align:left;padding:8px 10px;border:1px solid rgba(127,127,127,.4);border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer;';
        const name = doc.createElement('strong');
        name.textContent = label;
        name.style.display = 'block';
        const copy = doc.createElement('span');
        copy.textContent = detail;
        copy.style.cssText = 'display:block;font-size:11px;opacity:.68;font-weight:400;';
        button.append(name, copy);
        choices.append(button);
        return button;
    };
    const selfInventResay = (() => { try {
        const st = getSettings();
        return st.selfInventMode === true && Number(st.rabbitMirrorFaceCount || 1) === 1;
    }
    catch {
        return false;
    } })();
    makeChoice('original', __rmT("JzukVBX_sUgOCT"), __rmT("Im0DSxThZD1rzHnR0PHs9Ra.jrQJFPmezU74JEjw3fOs5uUY55FLIz.NHBKDKYOvNUF6SjoeYXmZ8ew8y0_Frh"));
    makeChoice('fresh', selfInventResay ? __rmT("5iu53CSzb50W6dFcgKC") : __rmT("oinF8JHdt8cBWf"), selfInventResay
        ? __rmT("CAxP3917.rgbG1lwAfvmFy9jnXwROaLaysyjLU.2Bk7PUraX6fyM2bxrZsnYU5pQpknyK.a_h6jJFV6cc6mahVVxhq2CIIwG1KDLRf") : __rmT("jjJ2wb4V6ho5txNUHwyYv12yov1UiUcea6ctNS53EX.uuJBWcXve215X"));
    makeChoice('order', __rmT("YbcgGJ18"), __rmT("GJ7pSfl61ReGIShyg3xyC2FBXW_dN4UrcftKtOHfBNOUMTlNT7uDL6AKZuEqEaMslWIenqlwl0kb3ew9JM4gFIT12fc4zN6jt0UX.3BA6a5UsVo.2ad3YvWHTo6X9HbUppsO8Cloqnqv5XRTf_C"));
    const pickSection = doc.createElement('div');
    pickSection.hidden = true;
    const pickLabel = doc.createElement('div');
    pickLabel.textContent = __rmT("kHgQ_7ufRh9_Xkhn5PlYAPmp83itVBAtaTxVTT7AR18tJzmhnfGRSh");
    pickLabel.style.cssText = 'margin:10px 0 0;font-size:12px;';
    const pickStatus = doc.createElement('p');
    pickStatus.style.cssText = 'font-size:11px;line-height:1.5;opacity:.75;margin:6px 0 0;';
    const themePicker = createResayTopicPicker(doc, 'theme', () => paint());
    const formatPicker = createResayTopicPicker(doc, 'format', () => paint());
    pickSection.append(pickLabel, themePicker.element, formatPicker.element, pickStatus);
    let form = 'keep';
    const formLabel = doc.createElement('div');
    formLabel.textContent = __rmT("iazDWpqQYNRRtwSjFJmQXk");
    formLabel.style.cssText = 'margin:10px 0 4px;font-size:12px;';
    const forms = doc.createElement('div');
    forms.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    const makeForm = (value, label) => {
        const button = doc.createElement('button');
        button.type = 'button';
        button.setAttribute('data-rm-resay-form', value);
        button.textContent = label;
        button.style.cssText = 'min-height:36px;padding:6px 10px;border:1px solid rgba(127,127,127,.4);border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer;';
        forms.append(button);
    };
    makeForm('keep', __rmT("akVMNjyda0MfXkxCkoA"));
    makeForm('html', __rmT("7eHXEV01x7DrkS8wf68OEUYx"));
    makeForm('longtext', __rmT("wiQ53m9T8h.PrXUoD.Y"));
    const noteLabel = doc.createElement('label');
    noteLabel.textContent = __rmT("5zOr1tTem6Snjgg3jl2X_u9wFZ15XGnQsYP2FqVtQYp");
    noteLabel.style.cssText = 'display:block;margin:10px 0 4px;font-size:12px;';
    const note = doc.createElement('textarea');
    note.maxLength = 400;
    note.rows = 3;
    note.placeholder = __rmT("ENp3qJUe4IZDRQnsyq56B.sIbvosj5rSGxBhGrG6UnjNcnzI0CVjYuWPuntfLwMMMWhA2OIkV462FEH9");
    note.style.cssText = 'width:100%;box-sizing:border-box;min-height:72px;resize:vertical;border:1px solid rgba(127,127,127,.4);border-radius:8px;padding:8px;background:transparent;color:inherit;-webkit-text-fill-color:currentColor;font:inherit;';
    const actions = doc.createElement('div');
    actions.style.cssText = 'display:flex;gap:8px;margin-top:10px;';
    const submit = doc.createElement('button');
    submit.type = 'button';
    submit.textContent = __rmT("ZufeauED_cp");
    submit.disabled = true;
    submit.style.cssText = 'flex:1;min-height:44px;border:1px solid rgba(127,127,127,.4);border-radius:8px;background:rgba(127,127,127,.12);color:inherit;font:inherit;cursor:pointer;';
    const cancel = doc.createElement('button');
    cancel.type = 'button';
    cancel.textContent = __rmT("dGHleh");
    cancel.style.cssText = submit.style.cssText;
    actions.append(submit, cancel);
    panel.append(title, help, choices, formLabel, forms, pickSection, noteLabel, note, actions);
    doc.body.append(panel);
    const button = anchor?.isConnected ? anchor : root;
    positionFeedbackCatPanel(panel, button, 340);
    const paint = () => {
        for (const item of choices.querySelectorAll('[data-rm-resay-mode]')) {
            const on = item.getAttribute('data-rm-resay-mode') === mode;
            item.setAttribute('aria-pressed', on ? 'true' : 'false');
            item.style.borderColor = on ? 'currentColor' : 'rgba(127,127,127,.4)';
        }
        const ordering = mode === 'order';
        formLabel.textContent = ordering ? __rmT("6ZeuFmcft8aciT") : __rmT("iazDWpqQYNRRtwSjFJmQXk");
        noteLabel.textContent = ordering ? __rmT("n2VQtsm1CXkjM972") : __rmT("5zOr1tTem6Snjgg3jl2X_u9wFZ15XGnQsYP2FqVtQYp");
        note.placeholder = ordering
            ? __rmT("YbhnH6iKoQc4Dp4fsavWcmgvXInGXQRjpruCKlqSVL3UsDKYekDQAMwxG.NdSq_0ukchAU.9G5roXNbGTbpFrh") : __rmT("ENp3qJUe4IZDRQnsyq56B.sIbvosj5rSGxBhGrG6UnjNcnzI0CVjYuWPuntfLwMMMWhA2OIkV462FEH9");
        note.maxLength = ordering ? 2000 : 400;
        for (const item of forms.querySelectorAll('[data-rm-resay-form]')) {
            const value = item.getAttribute('data-rm-resay-form');
            item.hidden = ordering ? value === 'keep' : false;
            const on = value === form;
            item.setAttribute('aria-pressed', on ? 'true' : 'false');
            item.style.borderColor = on ? 'currentColor' : 'rgba(127,127,127,.4)';
        }
        const wasHidden = pickSection.hidden;
        pickSection.hidden = !ordering;
        let orderReady = true;
        if (ordering) {
            const themes = themePicker.selected();
            const formats = formatPicker.selected();
            const text = note.value.trim();
            const picked = themes.length + formats.length > 0;
            if (form !== 'html' && form !== 'longtext') {
                orderReady = false;
                pickStatus.textContent = __rmT("4bfqxExCqPCKPJpRdeimqjKLm27L.KwD29E");
            }
            else if (!picked && !text) {
                orderReady = false;
                pickStatus.textContent = __rmT("KJk11Z4ARyqJx020f9.01t5XYdUGSdib9_1qSo9f_.ecF5JEfCglllwfWEzguIhLpQGEG.JDaopBI_H9");
            }
            else if (form === 'html' && picked && !formats.length && !text) {
                orderReady = false;
                pickStatus.textContent = __rmT("L131j2tL0BPrl.Mhx9s9CQZE37VqJvdFjFcjmU8S5o0OGmG3r1Rq_wE35LAvuvOkFkhC.0gpeQuXjdYh.vXgUdGu");
            }
            else {
                pickStatus.textContent = picked
                    ? `${__rmT("7eHbUflc55sy3TuhPE6Gx4Cx")}${themes.length}${__rmT("wHJlUm7LXczASkehvVjvUt54b9s")}${formats.length}${__rmT("7aabuuNQfOHaALVCkCA")}${text ? __rmT("MG.LirPE.XoS3yode3DQcBIh") : __rmT("Dgkq4E1BgbpPknIC")}${__rmT("jzk")}` : __rmT("KQjnuH0Z5NTbVUKJ0Wxh9IjKaMyyoMUmc8oz5c65mr9.bh");
            }
            noteLabel.textContent = picked ? __rmT("m.ceiYM7F68ekLhl8JHoU.Yi3dk") : __rmT("n2VQtsm1CXkjM972");
        }
        if (wasHidden !== pickSection.hidden && panel.isConnected)
            positionFeedbackCatPanel(panel, button, 340);
        submit.disabled = !mode || !orderReady;
    };
    choices.addEventListener('click', event => {
        const value = event.target?.closest?.('[data-rm-resay-mode]')?.getAttribute('data-rm-resay-mode');
        if (!value)
            return;
        event.preventDefault();
        mode = value;
        if (mode === 'order' && form === 'keep')
            form = '';
        if (mode !== 'order' && !form)
            form = 'keep';
        paint();
    });
    forms.addEventListener('click', event => {
        const value = event.target?.closest?.('[data-rm-resay-form]')?.getAttribute('data-rm-resay-form');
        if (!value)
            return;
        event.preventDefault();
        form = value;
        paint();
    });
    note.addEventListener('input', () => paint());
    cancel.addEventListener('click', event => {
        event.preventDefault();
        closeRabbitMirrorResayChooser();
    });
    submit.addEventListener('click', event => {
        event.preventDefault();
        if (!mode || !panel.isConnected)
            return;
        const text = note.value.trim();
        if (mode === 'order' && submit.disabled)
            return;
        const picked = mode === 'order' ? { themeIds: themePicker.selected(), formatIds: formatPicker.selected() } : {};
        closeRabbitMirrorResayChooser();
        const live = globalThis.__rabbitMirrorIndependentActionsV1;
        const options = { mode, note: text, ...picked, ...(form === 'html' || form === 'longtext' ? { form } : {}) };
        const quick = live?.runtime === RUNTIME_VERSION && typeof live.prepareQuickResay === 'function'
            ? live.prepareQuickResay(root, {}, options) : null;
        const handled = typeof quick === 'function' ? quick() !== false
            : live?.runtime === RUNTIME_VERSION && typeof live.resay === 'function'
                ? live.resay(root, {}, options)
                : invokeFeedbackMirrorAction('resay', root, {});
        if (!handled)
            globalThis.toastr?.warning?.(__rmT(".l.tRNl_tDPgLWg33OsfpWJw9nW1tA0xPo7C6v7JgG8"));
    });
    paint();
    setTimeout(() => {
        if (!panel.isConnected)
            return;
        const closeOnOutside = event => {
            if (!panel.isConnected || panel.contains(event.target) || event.target === button)
                return;
            document.removeEventListener('pointerdown', closeOnOutside, true);
            closeRabbitMirrorResayChooser();
        };
        document.addEventListener('pointerdown', closeOnOutside, true);
    }, 0);
    return true;
}
export function handleFeedbackCatClick(event, root, button) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    if (rabbitMirrorExternalGenerationNotice(root, 'feedback'))
        return;
    closeRecipeMenu();
    closeRabbitMirrorResayChooser();
    showFeedbackCatMenu(root, button);
}
export function closeRecipeMenu() {
    try {
        recipeOutsideCloseCleanup?.();
    }
    catch { }
    recipeOutsideCloseCleanup = null;
    toolOutsideCloseOwners.delete('recipe');
    document.querySelectorAll?.(`[${RECIPE_MENU_ATTR}]`)?.forEach(panel => panel.remove());
}
function rabbitMirrorRecipeIdentity(root) {
    const details = root?.matches?.('details') ? root : root?.querySelector?.(':scope > details') || root?.querySelector?.('details');
    const chat = getAvailableHostChat();
    const ownerChat = String(details?.dataset?.rabbitMirrorOwnerChat || '').trim();
    const ownerMesid = Number(details?.dataset?.rabbitMirrorOwnerMesid);
    const messageIndex = Number.isInteger(ownerMesid) && ownerMesid >= 0 ? ownerMesid : getMessageIndexFromMirrorNode(root);
    const message = messageIndex >= 0 ? chat?.[messageIndex] : null;
    const ownerSwipe = Number(details?.dataset?.rabbitMirrorOwnerSwipe);
    const swipeId = Number.isInteger(ownerSwipe) && ownerSwipe >= 0
        ? ownerSwipe
        : Number.isInteger(message?.swipe_id) && message.swipe_id >= 0
            ? message.swipe_id
            : 0;
    const chatKey = ownerChat || getCurrentChatKey(chat);
    const proof = getSanitizedRabbitMirrorFaceProof(details);
    const faceIndex = getRabbitMirrorFacePosition(root)?.faceIndex
        ?? (proof?.origin === 'follow' ? proof.faceIndex : null);
    return { chatKey, messageIndex, swipeId, message, ...(Number.isInteger(faceIndex) ? { faceIndex } : {}) };
}
export function rabbitMirrorTextPresentation(root) {
    const details = root?.matches?.('details') ? root : root?.querySelector?.(':scope > details');
    const proof = getSanitizedRabbitMirrorFaceProof(root) || getSanitizedRabbitMirrorFaceProof(details)
        || getSanitizedRabbitMirrorFaceProof(root?.closest?.('toto'));
    if (proof?.presentationMode)
        return isTextPresentation(proof);
    return isTextPresentation(rabbitMirrorRecipeForRoot(root, true));
}
function diagnosticFromJsonStore(storageKey, slot) {
    if (!slot || !globalThis.localStorage?.getItem)
        return null;
    try {
        const store = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const diagnostic = store?.[slot]?.apiRequest;
        return diagnostic && typeof diagnostic === 'object' ? diagnostic : null;
    }
    catch {
        return null;
    }
}
function savedMirrorSelectionMetadata(root, identity) {
    const details = root?.matches?.('details') ? root : root?.querySelector?.('details');
    const shell = root?.matches?.('[data-rm-key]') ? root : root?.closest?.('[data-rm-key]');
    const slot = String(shell?.getAttribute?.('data-rm-key') || details?.dataset?.rabbitMirrorOwnerKey || '');
    const mounted = diagnosticFromJsonStore('rabbit_mirror_independent_outputs_v1', slot);
    if (mounted && (Array.isArray(mounted.themeIds) || Array.isArray(mounted.formatIds) || Array.isArray(mounted.faces) || Array.isArray(mounted.textIds) || mounted.blankLongText === true))
        return mounted;
    if (!Number.isInteger(identity?.messageIndex) || identity.messageIndex < 0)
        return null;
    let metadata = null;
    try {
        metadata = getContext()?.chatMetadata;
    }
    catch { }
    metadata = metadata || globalThis.chat_metadata;
    const swipe = Number.isInteger(identity.swipeId) && identity.swipeId >= 0 ? identity.swipeId : 0;
    const owner = metadata?.rabbit_mirror_independent_outputs_v2?.owners?.[`${identity.messageIndex}:${swipe}`];
    const diagnostic = owner?.deleted === true ? null : owner?.apiRequest;
    return diagnostic && typeof diagnostic === 'object' ? diagnostic : null;
}
function rabbitMirrorRecipeForRoot(root, includeExternalOnly = false) {
    const details = root?.matches?.('details') ? root : root?.querySelector?.(':scope > details') || root?.querySelector?.('details');
    const displayed = details?.getAttribute?.('data-rm-face-recipe');
    const identity = rabbitMirrorRecipeIdentity(root);
    if (displayed) {
        let recipe = null;
        try {
            recipe = recipeFromSelectionMetadata(JSON.parse(displayed), { includeExternalOnly });
        }
        catch {
            return null;
        }
        if (recipe && !Array.isArray(recipe.atmosphereMenu) && !recipe.atmosphereReason) {
            try {
                const local = getRabbitMirrorRecipe({ ...identity, includeExternalOnly });
                const same = key => JSON.stringify(local?.[key] || []) === JSON.stringify(recipe[key] || []);
                if (local && (Array.isArray(local.atmosphereMenu) || local.atmosphereReason) && same('themeIds') && same('formatIds')) {
                    recipe = { ...recipe, atmosphereMenu: local.atmosphereMenu, atmosphereReason: local.atmosphereReason, atmosphereChoice: local.atmosphereChoice };
                }
            }
            catch { }
        }
        return recipe;
    }
    return getRabbitMirrorRecipe({ ...identity, includeExternalOnly })
        || recipeFromSelectionMetadata(savedMirrorSelectionMetadata(root, identity), {
            faceIndex: identity.faceIndex,
            includeExternalOnly,
        });
}
const THEME_GROUP_NAMES = { A: __rmT("xbolF7UJDJghdf"), B: __rmT("H4QYNy5eRTCg6mU3nKs"), C: __rmT("WOwO14hpa9ukWk"), D: __rmT("y64aJG51yQBxg1Kd"), E: __rmT("bqcCcrVyCOEdp1OE"), F: __rmT("vSi7r5hpDN3Hif"), G: __rmT("p21pLHP1kMvS_tWuTtIFaf"), H: __rmT("rxjBs4hpVNRTnh"), I: __rmT("EgQQUZqjVmCQk0eTLivPvbUg") };
const FORMAT_GROUP_NAMES = { 1: __rmT("yNMQaAWEwg_"), 2: __rmT("4T.U8OUJGuh7Ek"), 3: __rmT("H4.nvxUJLuOjHf"), 4: __rmT("QZsNvOUJxuDTEk"), 5: __rmT("5b3d8OUJeA.EPf"), 6: __rmT("0x.rFxUJPBqfCk"), 7: __rmT("5N94Ho21EvEGnrH6PbIq8peX"), 8: __rmT("CG1OYg0xj08GnpHY5yhyQBIH"), 10: __rmT("0ADjz_0zzAk") };
function selectionDisplayTitle(label, id) {
    const text = String(label || '').trim();
    const key = String(id || '');
    if (!text)
        return key;
    if (text === key)
        return key;
    if (key && text.startsWith(`${key} `))
        return text.slice(key.length + 1);
    return text;
}
function recipeDrawnRows(recipe) {
    if (!recipe)
        return [];
    const rows = [];
    const seen = new Set();
    const push = row => {
        const key = `${row.kind}:${row.id}`;
        if (!row.id || seen.has(key))
            return;
        seen.add(key);
        rows.push(row);
    };
    for (const item of recipe.themes || []) {
        push({ ...item, category: `${__rmT("H3TXfosBnlSASrCxvzS7xLiXjFs")}${THEME_GROUP_NAMES[item.group] || item.group || __rmT("cynAhPCV")}`, actionable: true });
    }
    for (const item of recipe.formats || []) {
        push({ ...item, category: `${__rmT("l01S2MrJmnBA0.C6gPD")}${FORMAT_GROUP_NAMES[item.group] || item.group || __rmT("cynAhPCV")}`, actionable: true });
    }
    const descriptors = new Map((recipe.formatDescriptors || []).filter(item => item?.id).map(item => [item.id, item]));
    (recipe.themeIds || []).forEach((id, index) => {
        if (seen.has(`theme:${id}`))
            return;
        push({ id, kind: 'theme', title: selectionDisplayTitle(recipe.themeLabels?.[index], id), category: __rmT("Qyc9cMEBPNv7Q.cUFxMgta0iXk.AnAKDo0JZ7h"), actionable: false });
    });
    (recipe.formatIds || []).forEach((id, index) => {
        if (seen.has(`format:${id}`))
            return;
        const descriptor = descriptors.get(id);
        push({ id, kind: 'format', title: descriptor?.title || selectionDisplayTitle(recipe.formatLabels?.[index], id), category: __rmT("obndD83y7CAtB.1G4gh5_fCLY20GnT"), actionable: false });
    });
    (recipe.textIds || []).forEach((id, index) => {
        push({ id, kind: 'text', title: selectionDisplayTitle(recipe.textLabels?.[index], id), category: __rmT("Ybcc.ep_"), actionable: false });
    });
    if (recipe.blankLongText)
        push({ id: 'blank-longtext', kind: 'text', title: __rmT("sjKa.xv_JHk0xXxGArAgYwh491yCsmR3"), category: __rmT("Ybcc.ep_"), actionable: false });
    if (recipe.worldBookEntryId)
        push({ id: recipe.worldBookEntryId, kind: 'text', title: recipe.worldBookTitle || __rmT("GnEVs1VJj9ZL.k"), category: __rmT("GnEVs1VJj9ZL.k"), actionable: false });
    return rows;
}
function recipeButtonTitle(recipe) {
    if (!recipe)
        return __rmT("vovw8rdGWlzU9gHSrlF9yuqs78xCaqoUZuesIMhB");
    const drawn = recipeDrawnRows(recipe);
    const count = drawn.length;
    const items = [...(recipe.themes || []), ...(recipe.formats || [])];
    const blocked = items.filter(item => isBlacklisted(item.kind, item.id)).length;
    const favored = items.filter(item => isFavorited(item.kind, item.id)).length;
    return `${__rmT("dxDWz9Hdf2OStf")}${count}${__rmT("2RdKGT")}${favored ? `${__rmT("7os")}${favored}${__rmT("UqYT1oeuzNNq7T")}` : ''}${blocked ? `${__rmT("7os")}${blocked}${__rmT("fimxZH6maBnGDLV1SMZnKk")}` : ''}`;
}
function recipePanelRow(item) {
    const blocked = item.actionable === false ? false : isBlacklisted(item.kind, item.id);
    const favored = item.actionable === false ? false : isFavorited(item.kind, item.id);
    const kindLabel = item.category || (item.kind === 'format' ? __rmT("1Q3is5nrSDY") : item.kind === 'text' ? __rmT("Ybcc.ep_") : __rmT("jztJOyteqLCA0Sc9gEs"));
    const blacklistAction = item?.ambiguous
        ? blocked ? __rmT("OyfaSio2Sm1VprRwLXp") : __rmT("DNHlyG_ExhSvguXw")
        : blocked ? __rmT("etT.psNNlH_.Cf") : __rmT("Vv_EclNNlH_.Cf");
    const favoriteAction = item?.ambiguous
        ? favored ? __rmT("5WbovLGk2hMhISdv") : __rmT("DNHlyWhPaIyvguXw")
        : favored ? __rmT("WFOL6L4sZVs") : __rmT("Vv_EczVOsp2_df");
    const ambiguityNote = item?.ambiguous
        ? __rmT("6Bj2iDDC5r2CfJaqwDMKdx.3b9qADxugD2Fh1lbqEeGf8quu94W90qQaWv62OYxArMGiyIXM85E7gEWjdBoPy.pXobgkH0SY29ZUDx5jt3guZEF.VBgvUJllvt7STV3Lw8neXLgTuSYdDDJkL.e7jlt2JnJFxBw93DQM1sOce_m6UOxZbZCaIEKUft_HwvBxd4Kfs2GyPq7bjMWed1oKOgPPvW8KntrsP5RQsSrkvdSJJqR7E8sc2X5a_GMRU9mysRLDRkg_tsnh_13tsA2gmxRpckroBujYSRg1IqmDkJ5eSVtutR8") : '';
    const actions = item.actionable === false ? '' : `<div style="display:flex;flex:0 0 auto;gap:5px;flex-wrap:wrap;justify-content:flex-end;max-width:190px;">
        <button type="button" data-rm-recipe-favorite-kind="${feedbackCatEscapeHtml(item.kind)}" data-rm-recipe-favorite-id="${feedbackCatEscapeHtml(item.id)}" style="border:1px solid rgba(127,127,127,.34);border-radius:7px;padding:5px 8px;background:${favored ? 'rgba(222,170,55,.16)' : 'rgba(222,170,55,.07)'};color:inherit;cursor:pointer;font:inherit;font-size:11px;">${favored ? '★ ' : '☆ '}${favoriteAction}</button>
        <button type="button" data-rm-recipe-blacklist-kind="${feedbackCatEscapeHtml(item.kind)}" data-rm-recipe-blacklist-id="${feedbackCatEscapeHtml(item.id)}" style="border:1px solid rgba(127,127,127,.34);border-radius:7px;padding:5px 8px;background:${blocked ? 'rgba(127,127,127,.12)' : 'rgba(190,70,70,.08)'};color:inherit;cursor:pointer;font:inherit;font-size:11px;">${blocked ? '✓ ' : '🚫 '}${blacklistAction}</button>
      </div>`;
    const idLine = item.actionable === false && item.id === 'blank-longtext' ? '' : `<div style="font-size:10px;opacity:.5;overflow-wrap:anywhere;">${feedbackCatEscapeHtml(item.id)}</div>`;
    return `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(127,127,127,.18);">
      <div style="min-width:0;flex:1;line-height:1.35;">
        <div style="font-size:10px;opacity:.58;margin-bottom:2px;">${feedbackCatEscapeHtml(kindLabel)}</div>
        <div style="font-size:12px;font-weight:700;overflow-wrap:anywhere;">${feedbackCatEscapeHtml(item.title)}</div>
        ${idLine}
        ${ambiguityNote}
      </div>
      ${actions}
    </div>`;
}
function recipeBlacklistManagerRow(item) {
    const kindLabel = item.kind === 'format' ? __rmT("1Q3is5nrSDY") : __rmT("jztJOyteqLCA0Sc9gEs");
    return `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(127,127,127,.18);">
      <div style="min-width:0;flex:1;line-height:1.35;">
        <div style="font-size:10px;opacity:.58;margin-bottom:2px;">${kindLabel}</div>
        <div style="font-size:12px;font-weight:700;overflow-wrap:anywhere;">${feedbackCatEscapeHtml(item.id)} ${feedbackCatEscapeHtml(item.title)}</div>
      </div>
      <button type="button" data-rm-blacklist-manager-remove="true" data-rm-blacklist-manager-kind="${feedbackCatEscapeHtml(item.kind)}" data-rm-blacklist-manager-id="${feedbackCatEscapeHtml(item.id)}${__rmT("vIsTxSzQQuuj_QsDDv1MUxwZPT.VlALYaRK6c0108Az7_kRrZJL1oeuNKyUZnwUTUY3ZIyzuIQLZoAVl1w88_P8KwcykI_5HZwcVE1vTDGQ1bUZoeq3_d695Ps0ZIEMO2d74XYGR71pnzLSxmNf6.d.n20FX8HqGGbz1kG_8ngG2hbLI_DBNT7uvnihuTa_iUjY61TEecruh0jS4luNF7gzSp9S_ztE8QXp2ZktIqJH82eCTKVg4ucsA67Ei1zRPAuF54R1W2jxNGWDW1pVIAPNDlgJEFZlQ9z2JDc_ZooqPtUH8.RHKfnpmWD1EV5l6hFeQVbt6s1P4S01Glqde1mxRKmHbXXgtVbDt1uol2wDhlQ_5RYnO8ec1EBsE8QS2UcEE._FoFc6E_RBphId0FhdAmuFpDz3w0ttf5PUrgoylf4U0HnV0u639_yoMPxpwPUu2dIhoKrD0piQOetAt.Vu4MDZmxlS8PCVdoJN22M4909IVZPrIC3pn9xT9mSAh4.X2_sPMSfpXMZFzcVwMybj2pQUajGmWPRm1orejrPom35.cAFXhLh")}`;
}
function showBlacklistManagerMenu(root, button) {
    closeRecipeMenu();
    closeFeedbackCatMenu();
    closeMaintenanceRabbitMenu();
    const state = getBlacklistState();
    const themes = blacklistEntries('theme');
    const formats = blacklistEntries('format');
    const panel = document.createElement('div');
    panel.setAttribute(RECIPE_MENU_ATTR, 'true');
    panel.style.cssText = 'position:fixed;z-index:2147483646;box-sizing:border-box;padding:12px 13px;border:1px solid rgba(127,127,127,.35);border-radius:10px;background:var(--SmartThemeBlurTintColor,rgba(28,28,32,.97));color:var(--SmartThemeBodyColor,#eee);box-shadow:0 10px 32px rgba(0,0,0,.28);overflow:auto;font-family:inherit;';
    const themeRows = themes.map(recipeBlacklistManagerRow).join('');
    const formatRows = formats.map(recipeBlacklistManagerRow).join('');
    panel.innerHTML = `${__rmT("4NS28B1la0tlZ4R6tmRwTfpoyZcgDkPkQr6XadtDmRVBQiV0KUmvap_vCMLsItro3.seiTGGhHJTmyXeLHWfZtoozEyTSSs_6CFm7vpuUH6AnqD9iPkFgVdcgp6DOdihfnZ902eb10ob.pCEGtFe0T6R4aCuRS6iwV5YTLuI4EAXmGqcaJ6RbZX0CJA328LYN0UUdKF9IDYaYVdosIjPE9ZVnFYWK8Bj7CfcuH_MaCsYlkp7q.EePuC20rN6s0gCX3Ha5l4k.Qtr0nu00H3dU57YDj0JV6J.jt1q5N3k.u0mTBzjySVhG6KW94TwDWqSsKk0yl3cgBBXZYfn12hzFBBOdEMOjKeUPiVj1qboSb__a9Khmnx6tdlsBY6RH57HC95PcSiGDd6EwcvPQ7svWNk3yVOIkj.W0.rhwdSgVXGgj3dtk7C5xJz60g1TJj17BUSh9XxfljaujzvOHZmdeSKfIzRYtHxuTCoVNMv0rYZAC9Qb72Qw3QeKcLN0ehx_si8JMkIbJc_8ut5WdrkBUPS5I68FXYvQSDYDzb1WDRj_53kygKvAkPEVgeSD8C8xjgSdN0v5hixm77bvSlIFKdpRgRMUDCGJ64tsRgcntfzRkcJYO9dEqKbgFJ_rBBIRG9QykvL1vMu6UpZSDubGS5tFEoBW.Q._GzsvwN4fEnlcXwM6Rby4zSlm9SX6U8u9GEpV0Ws3Kg1Gl48jpauScY5IEM.UP2JG03WrwrZfQD_PfajSDTMNRaYnibYPp4oBF6wjkeLx89yrlWy5TzOCpTJCD.cOORI8nbmBhQ7EgjY9GoG8Bc9NmxU4hXvDIVr9ZI_id6w5K69GFeMODSorVr4Wz2ZAqkQqkxseiNKXpG6KCXgWgPEXsqM2n28JD5_QsDw9EIhltBH6EM3bn.m7lGxiywCgE1PxqoJXZFNnQJedrpv8C9pbAVeuNlpk_UnuhGmK5u1ItIFTjtIRnesYBlVDi07uaDdaJnpoU1mrMnROFjM85ZPO_S67KxI1oJKBwY3E0ZkGxnSl06G16wqmYdSv6rgCXuZ.PuDOeR9_IkxazMgeUPGqFstO.DK6roCJ2rm8gibsjHByiry_FEv_nADEvZEKo5TqbBQfU9ZiJShthRJxppelvyejxV.AjxF88jag628V8r9nCxU6gkp4gF_9kZ.H8i9745YvNrJPjEaFljc0TjBngY2c0gigApcuF_tzgIf3tnpMPhT4sxnjMTeCiOPsTL38cCPoWfii9ojOclgymHkjUeARg5PTttz4.R0K2sV3ba5Bx_vyWXpIpQPlk4iweLaDs6MvngVNqg8a57xDXHH4xAg21y8yL3HXWCg0Eu0tPJPZQiW8YUa7qtUpJChSfnnHsuipYaiXggNiXae1C1dE3.QBWPJxYBkJbJ52.x1e0pJf9qEC0Y6G5gumRbjFpB6BDiW011ro1H4JfuWcsPS169HHsNf6Fyq9zW2uhBasQOZ559YteurSYI0cyonD8vsC_DaV9z5RMdIfXEs6hWqWOyTkK3msY9EVS_tpDbtUnb7NAYY2sv3777CxGbxW9g1vpnNiy.PjHDAdH03Imfl8Z9kDAqvUap70Rr1nQE9OBbzMJ51AklCn24NsIzQbnD3fGNP2JnkbBrIkwyycnJCHsGHeMSZWOjk10a47aafSrCCoVSbS6T8_pHPG3VL8neHctShn4sDWP6FPaz9bm50kfYMRxlcYQ9nWoun4L0OA7Lrq3y7NuT2uWwLrzRaqlRGpu_XU4Kud9N1fXJEb3iAX__PnP9MgdSyuS4eo0O8jnea6E1pirm2OPBddWB7j3Gzq")}${state.enabled ? __rmT("4R63OVYy") : __rmT("4RFT.SpP")}</div>
        <button type="button" data-rm-blacklist-manager-action="toggle-enabled" style="border:1px solid rgba(127,127,127,.34);border-radius:7px;padding:5px 8px;background:rgba(127,127,127,.10);color:inherit;cursor:pointer;font:inherit;font-size:11px;">${state.enabled ? __rmT("R7lec_NNlH_.Cf") : __rmT("dzVOslNNlH_.Cf")}${__rmT("yoAOrdahMDJx8W.nlDxMPXA9aOpQHqOPoV.QJ6Z7tfTmzlujBajAwpCpqow0GM6UF_SWsFkGpu3x00x88Q3WWmGy99yFGKpu9kpNnl6jAX8XrQlQorpzrXYc1hwSICFYcvn7DMO85DaDhEC81eHUjiAJhewPYjJjNaY8w7VSyHBZFibgegndTSuxujHN5f1n7c5RIfMhbeGrqTgIeyXjdvqUXEvJVFA1thYtqc1DFyFQeDHmbaAE_hLT")}${themes.length}${__rmT("VU5ynMfBF95BQihAXLyOtmmiXk.zVGbBUcdoDf")}${themeRows || __rmT("oQuMHqloBpwRRchSqucu0LVpfJUJJUXUKf6Ob3W2DJxvgG3ySXkDVzFqtoTrMM1ytLUYnUyJ4_fBwNDRWbh8Hk7aqvNStfTjgUPjwKoI.Zq_nV0ru4K3vEqtViGjIIUXJI8OWwjIVRWKZcTrPdYKenn9p1gEmrMzQwPaPLmy1pG")}${__rmT("2asV7Q2G1OLhigI9bprHw74yKQI3K84uFwaVPM6Su4Gav.SXzE9SAeSuQorfoOmhIzMdHhrBCDh0jK56WiPaHcBFOs3jE1uzXS0hdmkpvMnop0uvzvL4r4_l0t40WkVzEtcoVYUINj8XLqryhXhiF1MZmjP9En3.GJKocHzRz2QwV7Ed3GHack")}${formats.length}${__rmT("VU5ynMfBF95BQihAXLyOtmmiXk.zVGbBUcdoDf")}${formatRows || __rmT("oQuMHqloBpwRRchSqucu0LVpfJUJJUXUKf6Ob3W2DJxvgG3ySXkDVzFqtoTrMM1ytLUYnUyJ4_fBwNDRWbh8Hk7aqvNStfTjgUPjwKoI.Zq_nV0ru4K3vEqtViGjIIUXJI8OWwjIVRWKZcTrPdYKenn9p1gEmrMzQwPaPLmy1pG")}${__rmT("2V7OpQbS7CN7Q2vNAonKm1i6afaAWcBeBPf3209erpIF4jdjPCgg3L57i1TsrDaR8hV9vrZwsbP3m.yGewisXw6W8Hv8CmL7syyZ72GiMgd168wFG9yG0RytE_MeVzHaglnqJdthG2JPryiw8xPvVMqCCNqlNzdMYLYj_kvGehM6U_KQT5BSoM9ceqwaFDeMxH2SX5Bjfjcep4VqtPrwv3o3dGW2fZuIWXjVWsKkxeHbunR1W9CnDVb2mBmPc2ILtzrnfd.9XjcroSsknHB0R5NEEan5VWzgPfSE4cgMyAowt9QA8iV9SPBmGnggqBJKp8q4SD9yNs6SqpQ5r3drrBmX6G1qMybdh1sqQaziwU4TgbUr0zuwjM0ew5a2.v2orevfYzTb6ITO3iaRBvgx3WxXifJpJsYtROJATA.RBl4Yq8G.DhL48K.kw82XorxLBpUNtKwgibl1cK4duHgJmXxX7aGYWcY1xDN0KavE.zcW40tIVyFUwIXAz69spj15CcNGbgWoNvk17rFp8gV4.D8wFOV8Q7pDI2KSLsoZNOaRoc1I6fJIsi175hze7gCNpuFpQke1JBkluffH21guTSC2hl6JRSbomk8leWDWHoSmOuwxWA9eUkSAPqwF8WUHYbj3aS8zyWCjE0I7eRU9nTatNd88gSmDzS7RjW6CxAFn4yB5QZn0Eb0h4uJjL7VtiwU9JCrKaAzSTEDpL9prnxrXdaoyHTh6SSzVjzGS_OH8e899TfSyp9golGf20qHW05NAX.oFyNGde18WxWLjiduwVLkT2bX0EJtK7Rj6fo7EngM5z7Sgcvw6lPJpVlFl2ilPKgsh9e6LDE_OWqQd_Oi94HU4wyD.lUM.7dQNlkppE7MLmTmzYWjXMMIe8Dmm8FxYMDHdKWWvrSKWZB06keG0M_NsX_8C5aM9mx3UkFZiXAd_T8N3VzcWazgLVchruQGQ4g1QAZfpfqrQGZ.dimt9mFm0nhX1shiipq1DdShFMg4r8.6CGUnQyxI5TLJ6T7F2p8MTNPG0yFC5c9cHgeAwVqqEhvdjTZY")}${themes.length || formats.length ? '' : 'disabled'} style="flex:1;border:1px solid rgba(190,70,70,.34);border-radius:7px;padding:6px 8px;background:rgba(190,70,70,.08);color:inherit;cursor:${themes.length || formats.length ? 'pointer' : 'default'};opacity:${themes.length || formats.length ? '1' : '.45'}${__rmT("KEE3ZTc4r66ZnKi3lLAOQoiQB6SM0zxKqhiG249S8hjPNd_RtoxZuWagkse1miNb5NS1IMdFUvXnBiQ3.i3bDeoDME29kNWHQhFkAy_Q9dlE8ZJ9V2_rJrJdhlYsAqV4cZP.le67.1Il6inXpHHgCaQd")}`;
    document.body.appendChild(panel);
    positionFeedbackCatPanel(panel, button, 380);
    panel.addEventListener('click', event => {
        const remove = event.target?.closest?.('[data-rm-blacklist-manager-remove="true"]');
        if (remove && panel.contains(remove)) {
            event.preventDefault();
            event.stopPropagation();
            const kind = remove.getAttribute('data-rm-blacklist-manager-kind') === 'format' ? 'format' : 'theme';
            const id = String(remove.getAttribute('data-rm-blacklist-manager-id') || '');
            if (removeBlacklistItem(kind, id))
                globalThis.toastr?.success?.(`${__rmT("UnzxUN34Dm_ua0.GVpA")}${id}`);
            const freshRecipe = rabbitMirrorRecipeForRoot(root);
            button.title = recipeButtonTitle(freshRecipe);
            button.setAttribute('aria-label', button.title);
            closeRecipeMenu();
            showBlacklistManagerMenu(root, button);
            return;
        }
        const action = event.target?.closest?.('[data-rm-blacklist-manager-action]');
        if (!action || !panel.contains(action))
            return;
        event.preventDefault();
        event.stopPropagation();
        const value = action.getAttribute('data-rm-blacklist-manager-action');
        if (value === 'back') {
            closeRecipeMenu();
            showRecipeMenu(root, button);
            return;
        }
        if (value === 'toggle-enabled') {
            setBlacklistEnabled(!getBlacklistState().enabled);
            const freshRecipe = rabbitMirrorRecipeForRoot(root);
            button.title = recipeButtonTitle(freshRecipe);
            button.setAttribute('aria-label', button.title);
            closeRecipeMenu();
            installRecipeButtonForRoot(root);
            return;
        }
        if (value === 'clear') {
            if (themes.length || formats.length) {
                clearBlacklist('all');
                globalThis.toastr?.success?.(__rmT("qwentHKPDYt1s.iJYEtA.i5ZvB4rrk"));
            }
            const freshRecipe = rabbitMirrorRecipeForRoot(root);
            button.title = recipeButtonTitle(freshRecipe);
            button.setAttribute('aria-label', button.title);
            closeRecipeMenu();
            showBlacklistManagerMenu(root, button);
        }
    });
    bindRecipeOutsideClose(panel, button);
    return true;
}
function recipeFavoriteManagerRow(item) {
    const multiplier = getFavoriteMultiplier(item.kind, item.id);
    return `<div style="display:flex;gap:7px;align-items:center;padding:7px 0;border-bottom:1px solid rgba(127,127,127,.18);">
      <div style="min-width:0;flex:1;">
        <div style="font-size:11px;font-weight:700;line-height:1.35;overflow-wrap:anywhere;">${feedbackCatEscapeHtml(item.title || item.id)}</div>
        <div style="font-size:9px;opacity:.55;margin-top:2px;">${feedbackCatEscapeHtml(item.id)} · ${item.kind === 'format' ? __rmT("1Q3is5nrSDY") : __rmT("jztJOyteqLCA0Sc9gEs")}</div>
      </div>
      <label style="display:inline-flex;align-items:center;gap:3px;flex:0 0 auto;font-size:10px;opacity:.9;">×<input type="number" inputmode="decimal" min="${FAVORITE_MULTIPLIER_MIN}" max="${FAVORITE_MULTIPLIER_MAX}" step="0.5" value="${feedbackCatEscapeHtml(String(multiplier))}" data-rm-favorite-multiplier-kind="${feedbackCatEscapeHtml(item.kind)}" data-rm-favorite-multiplier-id="${feedbackCatEscapeHtml(item.id)}" style="width:50px;box-sizing:border-box;border:1px solid rgba(222,170,55,.38);border-radius:6px;padding:4px 5px;background:rgba(127,127,127,.10);color:inherit;font:inherit;font-size:11px;"></label>
      <button type="button" data-rm-favorite-manager-remove="true" data-rm-favorite-manager-kind="${feedbackCatEscapeHtml(item.kind)}" data-rm-favorite-manager-id="${feedbackCatEscapeHtml(item.id)}${__rmT("vIsTxSzQQuuj_QsDDv1MUxwZPT.VlALYaRK6c0108Az7_kRrZJL1oeuNKyUZnwUTUY3ZIyzuIQLZoAVl1w88_P8KwcykI_5HZwcVE1vTDGQ1bUZoeq3_d695Pl0ZIEiO2d74XYsRfqpnzLvxX9fh.dUn_5FF8G4GEm4okGG8Y2GRhbZIu8uVTYUvjoh_TaGiSjYK1ADeaLBW0jz4_H2v7JrSVMS_ztB8DypZZV6IAMGK2epTPVg2ux_AF7..11HPAHFx4RWWBjxtGdsWICVNAPvD2PgCFnBQPZ2QDx8ZBXqGtUH8PKHhfn_mWG1qVvG6OFejVoP66jP3SSWGyWWb1MORXtHbXm5tftDY1_yl2mDPlDA5yYnW8fK1HGKS8Dd2CeEx._KoEU6i_Dlpd7dSFOZAKHFzD1Uwdtyp5PVrRitBfz70snVSu6x9NioaPx_wmVuQdpTomrD8p9VOYmcg.VK4FDnmxQv8HYpWoyX2QJzT09eV2uobC77Wkq1mpGB54.X2_sPMSfpXMZFzcVwMybj2pQUajGmWPRm1orejrPom35.cAFXhLh")}`;
}
function showFavoriteManagerMenu(root, button) {
    closeRecipeMenu();
    closeFeedbackCatMenu();
    closeMaintenanceRabbitMenu();
    const themes = favoriteEntries('theme');
    const formats = favoriteEntries('format');
    const panel = document.createElement('div');
    panel.setAttribute(RECIPE_MENU_ATTR, 'true');
    panel.style.cssText = 'position:fixed;z-index:2147483646;box-sizing:border-box;padding:12px 13px;border:1px solid rgba(127,127,127,.35);border-radius:10px;background:var(--SmartThemeBlurTintColor,rgba(28,28,32,.97));color:var(--SmartThemeBodyColor,#eee);box-shadow:0 10px 32px rgba(0,0,0,.28);overflow:auto;font-family:inherit;';
    const themeRows = themes.map(recipeFavoriteManagerRow).join('');
    const formatRows = formats.map(recipeFavoriteManagerRow).join('');
    panel.innerHTML = `${__rmT("iYwoHmI1CSxAS8jwpeyMK8pBybrXE7H1AWmi5yAbHBbCkh_DtpizYr8LMZuZdy8AyDesWGOIxWZUtbdRN0APS6jf0bbucUVMHexN4TA4067IEpLaJJ91LlrFUzHNO2WInFGKAHLIp9NWTVbfo7AODtd.xht6NdAl9IItCpR9TOZM5D8NHRqjPisMqraaSaNnCIsGmceDq41pwWVM017tA2Hr7sm91xNhAw50dOqrfQcQ0FfR5FOt.khR0vdDMllhezEvfYHUaMqamIyqJQ1KLyu8JylRbDmZcPvwNPGxCWiV0xF7YC1u3OPS3QUsxnSvOeZKJ7VQLNeCOFsELZSp.K9lR4ScBs_8maFqSczlmRbaz25ZtAC5EYhR5QtndG9xBcHc9Kkko7nNqsCQ5Enql5THEbKnJ9BVewFNK9quzvBtd1WQY0K9nQAJ9Y4vQ4VLenbD0XJOMcXboAMPdcPOWGWEZnp_kfciBRHFsV4pUzng8.FxdZqWrVHtlDDb_3HJDJlwxoyEfGIaFJp.zCUJxRzqrqmBeCGmnYkcP5tPdbp8Z.qmSjdOTOi5xs6huZkz2kDphovy98sePMchBL1uDofAyaXofjo0FJveMC91_GoxhsbN8jc95FDtzVgKIjNPXTYbn2jDTzbLIrMQMXV6cFZ6pzmJ3gJbWSQBGGzuuFTHTYEMDbWNXTPVXtYc4WKWfQUKgMOnsuS9AViRi5gg.6KpfGMpWQrP7.9rR_qqGyRBTIZZE6W2SJZUqov4QDw9z0DSahthnTqVe6unySNvGHOuQUiFMZwfkNJ6l.Dw0w03clUIMQrt36Cc685Hg_RnzdSw63Z7MfZfea4CUoPxEskwSomiDuvlRLN40gspPBD5SHx1Lf1YtCmXoiqHFFpg8q8ix4Z9Pm.RT9aoQzSBt5Ez3mdUdJJnsnEaqZ8C82BbNhiX3.HNWvVTN0SbN0PiC89cr.BNJdoeYUXDfmwzOxDlyw0_.ziuDE6HTQQE3AjE9jYwTOxymXAdrTpbR9jSxFcsO9qml0eG9tPzr2VZ0e4QgOb44YryjZ.BW4jdMDzr.oeR1gGyb9Z6QU.YrPQoISucPRoq58sPCEorc4hf1Voabzc1CH5XoY0b1PoYxXYpPUt49.lhStbl.2ieGxYupY_gvxcQJ_IcS8FcYT_lC3hR0RcLpwEj4.92G3mcXApM.b13UANWTUPTIGs_ev4XvVt6xGwNcst49I6dEu_mHRnmuMnT5.ElFTf_NF8Bjl575EaZhRkPITGltq_bWaIgB9v3XTMxkDORRQdxc.OHbLwLQpJ2ZNT_ID2IlqH37TTusLXQK70of5bE0oSY97U7hhjmBXFcRxKY1Rzt.kOYQPV7a1pQGViTaro7G1U.P7QelIskSQuuyu_13GH.fBU5sZN_8Nn4jDVqaP1AXw.OvUQcSf91b__ewjpofcv2pR00cgjCJoIDKqsI1wQMwuTpLyVwx.ZGSbkhBQZVh6vAI4DLUSRYQS1jBPmUEHxBxvAXTVVYbwZwquMxyxgkE68gqy0dKi0HIlTqOCQIudZ_oZ7jE7ITlArKfpU3DbRxXKDbw9l3jIy7XbJB.zk")}${themes.length}${__rmT("VU5ynMfBF95BQihAXLyOtmmiXk.zVGbBUcdoDf")}${themeRows || __rmT("oQuMHqloBpwRRchSqucu0LVpfJUJJUXUKf6Ob3W2DJxvgG3ySXkDVzFqtoTrMM1ytLUYnUyJ4_fBwNDRWbh8Hk7aqvNStfTjgUPjwKoI.Zq_nV0ru4K3vEqtViGjIIUXJI8OWwjIVRWKZcTrPdYKenn9p1gEmrMzQwPaPLmy1pG")}${__rmT("2asV7Q2G1OLhigI9bprHw74yKQI3K84uFwaVPM6Su4Gav.SXzE9SAeSuQorfoOmhIzMdHhrBCDh0jK56WiPaHcBFOs3jE1uzXS0hdmkpvMnop0uvzvL4r4_l0t40WkVzEtcoVYUINj8XLqryhXhiF1MZmjP9En3.GJKocHzRz2QwV7Ed3GHack")}${formats.length}${__rmT("VU5ynMfBF95BQihAXLyOtmmiXk.zVGbBUcdoDf")}${formatRows || __rmT("oQuMHqloBpwRRchSqucu0LVpfJUJJUXUKf6Ob3W2DJxvgG3ySXkDVzFqtoTrMM1ytLUYnUyJ4_fBwNDRWbh8Hk7aqvNStfTjgUPjwKoI.Zq_nV0ru4K3vEqtViGjIIUXJI8OWwjIVRWKZcTrPdYKenn9p1gEmrMzQwPaPLmy1pG")}${__rmT("pTQoh7bv_BwIT8Su92o0PTDFzwwyL09GegiIWbHgXrVoEeCVnim_VagtCNvbs0e7EQzBgygz7F0yz5cr_FDcawH8noAIzDW5Dasi3xE6IIkMFc95PmqgXbL6hO6FQl_JsTUwFQDTqSreERDMLciuTQQYVNvHuq7YqDcLRv_s3Oxb9BQIZyEPBHOr9IK5kT9SggdCGgHO7Weh3nT_Tglqf4qRkhYwZP.HjiM2H6XXBxPFjnfl8qHt5n5D8hbrp9vZp6B.AM2HVaSFfduna9ynnzO3iJbT10JnHXAfvhUsRzCA.D2TYTUAtkqLw1dnxGu4HVFpiQlKIhlzgzTG0CyYOeBtgaIhb_C.nQWSkkn7WcdCq.FOrHrcKBShAy.tjcQIP8LHV1iVve98PpaHTVZixPYFpF_SzIKBT1pJhMuVJzq2u8UhIzPnamEPGp0AILq16ODY.BMh2hX5ylBgp0v7TwQo0S_8Cb41F3iNS7_dPqsqmvxWQbVfWb9vzUvYbXYasSGDE3CkknnWUCgeIkN0_vlqngiSCaF9AoDd1qH.4BFhdzRrhYGF9.wEFDlf6agtZ.EH3pLeOnf7.kfnFm3ubrlmvT_k2S.q4RufOSUrThQl7.hBqnNJydZGKzovwlQ1biNfL1RsjWpTFA7tJf3GA_UaH4cuxu02e7J9honNOcyN2c9voBR08adNYy6Q03VyAyZ5asoHiZhaLQ1RyR_zziexosUNYzzXCtpxNUQkdF9iriTrc4BgE4jY1B9P5Fcd7W0rpsNJb8Qr.zlERLn_WUIs6n2qRZf.18x1Vm3UBl0rVefRGeVWTHI2OkCMXtk22zu8OguCixbHTDdPh45ywBOWgGntQ87kz7s_eHHpKOtcZcdWCU1HI6_BfXhMrJ7HSUulch1fKItL22aNcxtmz1jVD6G9L.lw23FSdjKGccMH1ac_c5n9aQAudSCBvQQv75BJh3dqI7Q1Tq0NkowGou4gPw1MDshO0CNzPSOIfFMwbCKIcHl2VkMLOmReYmzlMwXqSIMX4z18lD.rXHT79GnZd99.xk")}${themes.length || formats.length ? '' : 'disabled'} style="flex:1;border:1px solid rgba(222,170,55,.34);border-radius:7px;padding:6px 8px;background:rgba(222,170,55,.08);color:inherit;cursor:${themes.length || formats.length ? 'pointer' : 'default'};opacity:${themes.length || formats.length ? '1' : '.45'}${__rmT("uxFRX4k_ey3qfCfvVqgJzoPCq17zGPAvzg5VGmwmIuQ0FadqSZcU9xWEGMxpbxZEz3D9myxDyhX_xQJEb5QmH54sqRPCgcT.wP7lIeI2SIlHHgA9kjvATy9LWw7ms8iOmrAKD90pltEQ1FHPPlJN343O3vY")}`;
    document.body.appendChild(panel);
    positionFeedbackCatPanel(panel, button, 400);
    panel.addEventListener('change', event => {
        const input = event.target?.closest?.('[data-rm-favorite-multiplier-kind][data-rm-favorite-multiplier-id]');
        if (!input || !panel.contains(input))
            return;
        const kind = input.getAttribute('data-rm-favorite-multiplier-kind') === 'format' ? 'format' : 'theme';
        const id = String(input.getAttribute('data-rm-favorite-multiplier-id') || '');
        const raw = String(input.value ?? '').trim();
        if (!raw || !Number.isFinite(Number(raw))) {
            input.value = String(getFavoriteMultiplier(kind, id));
            globalThis.toastr?.warning?.(`${__rmT("eDH1ea1vm9LWVcMLwFj_Lk")}${id}${__rmT(".YLX4GZgLHQBTh")}${FAVORITE_MULTIPLIER_MIN}${__rmT("kys")}${FAVORITE_MULTIPLIER_MAX}${__rmT("7aAuY03k3OKCM5Uh4DD")}`);
            return;
        }
        const value = setFavoriteMultiplier(kind, id, raw);
        if (value == null) {
            globalThis.toastr?.warning?.(`${__rmT("9Pzfjd5vYhy12dKDXbVecTty")}${id}${__rmT("7FjQqBD_l0JlQFLeyvcZCAV0.pfoectA29E")}`);
            closeRecipeMenu();
            showFavoriteManagerMenu(root, button);
            return;
        }
        input.value = String(value);
        globalThis.toastr?.success?.(`${__rmT("9Pzfjd5vYhtYjKSCgbIlEE8x")}${value}${__rmT("7ys")}${id}`);
    });
    panel.addEventListener('click', event => {
        const remove = event.target?.closest?.('[data-rm-favorite-manager-remove="true"]');
        if (remove && panel.contains(remove)) {
            event.preventDefault();
            event.stopPropagation();
            const kind = remove.getAttribute('data-rm-favorite-manager-kind') === 'format' ? 'format' : 'theme';
            const id = String(remove.getAttribute('data-rm-favorite-manager-id') || '');
            if (removeFavoriteItem(kind, id))
                globalThis.toastr?.success?.(`${__rmT("qMRE4lB0DbRuFw5D")}${id}`);
            const freshRecipe = rabbitMirrorRecipeForRoot(root);
            button.title = recipeButtonTitle(freshRecipe);
            button.setAttribute('aria-label', button.title);
            closeRecipeMenu();
            showFavoriteManagerMenu(root, button);
            return;
        }
        const action = event.target?.closest?.('[data-rm-favorite-manager-action]');
        if (!action || !panel.contains(action))
            return;
        event.preventDefault();
        event.stopPropagation();
        const value = action.getAttribute('data-rm-favorite-manager-action');
        if (value === 'back') {
            closeRecipeMenu();
            showRecipeMenu(root, button);
            return;
        }
        if (value === 'clear') {
            if (themes.length || formats.length) {
                clearFavorites('all');
                globalThis.toastr?.success?.(__rmT("UnIj_Pdwxk52zsHh4DD"));
            }
            const freshRecipe = rabbitMirrorRecipeForRoot(root);
            button.title = recipeButtonTitle(freshRecipe);
            button.setAttribute('aria-label', button.title);
            closeRecipeMenu();
            showFavoriteManagerMenu(root, button);
        }
    });
    bindRecipeOutsideClose(panel, button);
    return true;
}
function catalogParentId(item, idSet) {
    const id = String(item?.id || '');
    const parts = id.split('.').filter(Boolean);
    for (let cut = parts.length - 1; cut >= 1; cut--) {
        const candidate = parts.slice(0, cut).join('.');
        if (idSet.has(candidate))
            return candidate;
    }
    return '';
}
function buildSelectionCatalog(kind) {
    const entries = selectionCatalogEntries(kind);
    const idSet = new Set(entries.map(item => item.id));
    const byId = new Map(entries.map(item => [item.id, item]));
    const children = new Map();
    const groups = new Map();
    for (const item of entries) {
        const parentId = catalogParentId(item, idSet);
        if (parentId) {
            if (!children.has(parentId))
                children.set(parentId, []);
            children.get(parentId).push(item);
        }
        else {
            const group = String(item.group || __rmT("yGhZ3f"));
            if (!groups.has(group))
                groups.set(group, []);
            groups.get(group).push(item);
        }
    }
    const sortItems = items => [...items].sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
    for (const [key, items] of children)
        children.set(key, sortItems(items));
    for (const [key, items] of groups)
        groups.set(key, sortItems(items));
    return { kind, entries, idSet, byId, children, groups };
}
function catalogItemRow(item, tree) {
    const favored = isFavorited(item.kind, item.id);
    const blocked = isBlacklisted(item.kind, item.id);
    const childCount = tree.children.get(item.id)?.length || 0;
    const multiplier = favored ? getFavoriteMultiplier(item.kind, item.id) : 0;
    return `<div style="display:flex;gap:6px;align-items:center;padding:7px 0;border-bottom:1px solid rgba(127,127,127,.16);">
      <button type="button" ${childCount ? `data-rm-catalog-enter-id="${feedbackCatEscapeHtml(item.id)}"` : 'disabled'} style="flex:0 0 25px;width:25px;height:25px;border:1px solid rgba(127,127,127,.28);border-radius:6px;background:rgba(127,127,127,.08);color:inherit;cursor:${childCount ? 'pointer' : 'default'};opacity:${childCount ? '1' : '.28'};font:inherit;">${childCount ? '›' : '·'}</button>
      <div style="min-width:0;flex:1;">
        <div style="font-size:11px;font-weight:700;line-height:1.35;overflow-wrap:anywhere;">${feedbackCatEscapeHtml(item.title || item.id)}</div>
        <div style="font-size:9px;opacity:.54;margin-top:2px;overflow-wrap:anywhere;">${feedbackCatEscapeHtml(item.id)}${childCount ? `${__rmT("4b8RjaFy1Rhx1_Bq")}${childCount}${__rmT("2RdKGT")}` : ''}</div>
      </div>
      <button type="button" data-rm-catalog-favorite-kind="${feedbackCatEscapeHtml(item.kind)}" data-rm-catalog-favorite-id="${feedbackCatEscapeHtml(item.id)}" style="flex:0 0 auto;border:1px solid rgba(222,170,55,.34);border-radius:7px;padding:5px 7px;background:${favored ? 'rgba(222,170,55,.22)' : 'rgba(127,127,127,.08)'};color:inherit;cursor:pointer;font:inherit;font-size:10px;font-weight:700;">${favored ? `★ ×${feedbackCatEscapeHtml(String(multiplier))}` : '☆'}</button>
      <button type="button" data-rm-catalog-blacklist-kind="${feedbackCatEscapeHtml(item.kind)}" data-rm-catalog-blacklist-id="${feedbackCatEscapeHtml(item.id)}" style="flex:0 0 auto;border:1px solid rgba(190,70,70,.34);border-radius:7px;padding:5px 7px;background:${blocked ? 'rgba(190,70,70,.22)' : 'rgba(127,127,127,.08)'};color:inherit;cursor:pointer;font:inherit;font-size:10px;font-weight:700;">${blocked ? '🚫' : '○'}</button>
    </div>`;
}
function showSelectionCatalogMenu(root, button, navigation = {}) {
    closeRecipeMenu();
    closeFeedbackCatMenu();
    closeMaintenanceRabbitMenu();
    const kind = navigation.kind === 'format' ? 'format' : navigation.kind === 'theme' ? 'theme' : '';
    const group = String(navigation.group || '');
    const parentId = String(navigation.parentId || '');
    const query = String(navigation.query || '').trim();
    const panel = document.createElement('div');
    panel.setAttribute(RECIPE_MENU_ATTR, 'true');
    panel.style.cssText = 'position:fixed;z-index:2147483646;box-sizing:border-box;padding:12px 13px;border:1px solid rgba(127,127,127,.35);border-radius:10px;background:var(--SmartThemeBlurTintColor,rgba(28,28,32,.97));color:var(--SmartThemeBodyColor,#eee);box-shadow:0 10px 32px rgba(0,0,0,.28);overflow:auto;font-family:inherit;';
    let body = '';
    let tree = null;
    if (!kind) {
        const themeCount = selectionCatalogEntries('theme').length;
        const formatCount = selectionCatalogEntries('format').length;
        body = `${__rmT("lpx2dHkX6VVOjFQyCJw5.O054Pa.hA3I3XmkQLAcx1rxJe9tUftv7d4Wf3X2rv6BCpY2b_484idE6WE8mNLI_AKicPrCWcy5bgOwC4QXWHC5yVvvixaHviS7uEWweQZm4hTZT1NyUvxFmwe93pGiHD8Qx_.7q97vVb0.4MdtstNL.vc84K_GH2BJEkMaIEKGQbQDsSzIVbOGNR1r7uDw8878P9.Qmny9yIqiqTWnVvYLweZqyswlq4JXkYyRgyFV3zTf7DlZ7Ek8lBRdFU3U_7wSeFJrrufDY0s8xCT9XAetwl3sXrel2Gtc.21ducvWrJdRi7egCzSfiirPf0.trvlqnKaMaPm2597on18m90nc.meqOXJPb73PydcsCfDk0UNFBPaAlxFedTcaVreO3rpGtKtyONi11eiJfJvxN4U7TawKiy2W5uzbor9Lt48sFgmCtFm1aMQbeNEBPLCQgNPQtN.2VZFV.6mEj2SHB01TovIlCDkMcfhygVLMZgzZ96ABs28CQ4SkMUwaP3jhbflUgS.HDrtps9wiUBnsfGvn4qFS9eigZmoCs6nA.GBFf2iU0R84hJZuiyGny5kzXo6n9gC63p8W2rlOCWqQWiqPwVbk3PjgR417iBRokW.8es_HpBIoet.OQYsgh0u1OUM1XJptWKOdXRk_8H7UqZ4glOROXdmjNVPwvVt71aEu9Vj5f2Ys_UEyhZs4v_b0TDeRlH6fRWqHY4FK9u9ZDl0BJnBzfZXdebjo18a4cYOZYQcVraBYG_nCqTmpI1kmMs2maD9ryCk3.ES_6G6Ccgp8hSZt89hmnbqCqE2I.IuAJ._qw_PwQmIxU6NoY68nuTt8fJ9yjQfL7JJhabSGD4_JKXhN7FKLZdzaTB_tz.y8BghlucX.X9JTbVOn8V8dlcqaHVMbXAGRQdKw6hcpfafwvhzwJHxFJeLO3Ooq3ptWq8RGsfKZOB5HON3z5UIq5WgWbzExRcXpnkP4JBB97jaG2ChQJFseViyGybXPbyYeKY93hZ8.Qqw2p5OG1Ns24cqMmQW.3itRpLKGcf")}${themeCount}${__rmT("m6w1Oll5W59_Zju7XC9tzOJ.UWeopCgCohwDBrntuO9ToVbYVFaUscSbJZiqav.PmAve9cIzbJBc76Gfml.WDZt3XAbIJ7q12fd6zmhVRGBCVUBwJYe_gPz6B3k7l_IuxdCH81kH2lNZdCbcDCwOZ3jiMvgc7kK9eIKkOczZhkpQKcWKpIy1p3mJbXJYJ52Xijrbc1jVLyFljm8hfUyOWb0rN49VfvB2DiUfNqdtQh1pq4kMNqhvl8eeqUcCMtAi2kBbTzwUyItsbtkmXioR4JH.4UTQz6CcOCVMtKBw_ttlvkN6bb14Wgx3DvFXwkcyHSyvKqcQBQQZJjCI0z.GQTHrejFGaFuCrkcuhK4UkrKFIx7H5OaGIx1vrdEhwgn_BizBkNyN0E7rxZyVyh_Z8_vYF1xusAfykNrsuwhxASFAwLoPEW0nj.kEtXn43cVf00HmL3NVZhWG3a1A1LVR0SQ4L5CxPcd3Ew2VkZ3KhIpV3AZEw5By_hHZRv.QkgIuE9k7kFocSz9QA3gCzRoHj9G3RTt2a0xo9axW_cBBFOFpNWsB56siblSV1Xjq0T435YjWSp.WuSP0S4v.6Is4KaOg3tmtTCkjNyVx9FENPkL1HKWtGE2QG.sDgFTUXTfy2lLqCTNCkutRnWBe9utGOdh1q0Z2dJs2quP6I7MzUutsWIiJUa5DHSfK4PVTon7vE3Ji_WNAho1.lVqALuK2koxSF_DcOThlWZtKkIGnP0Q56vS61gBpJdIcEParLlHRu4yjEIe59nyNSK0KE_Jd1fgkwqN8gCTXeZIdLY8LxIkf4.l7tqEvBgKXNJqO6Oy1QX3PgF24x70jGFXv8DyOno4NjF.ifttfw_w4Gblq6HWhfKyatdmzE4yZeBl")}${formatCount}${__rmT("l139x_gL6G9elETqnbxRkz5S_UmkEcVrHsvN0SHE2F1Nmq7i_zxBg3bSXTsMlklyHHX3Fxo9dm2fc8eLCU9bkeBH")}`;
    }
    else {
        tree = buildSelectionCatalog(kind);
        const kindLabel = kind === 'format' ? __rmT("1Q3is5nrSDY") : __rmT("jztJOyteqLCA0Sc9gEs");
        const searchResults = query ? tree.entries.filter(item => `${item.id} ${item.title} ${item.summary}`.toLowerCase().includes(query.toLowerCase())) : [];
        const clippedResults = searchResults.slice(0, 80);
        let rows = '';
        let title = kindLabel;
        if (query) {
            title = `${kindLabel}${__rmT("UqjXOn_pDM3NwT")}`;
            rows = clippedResults.map(item => catalogItemRow(item, tree)).join('') || __rmT("UIjUjUY022oWKJthOTvM9_8V2Bfl2JX1ImZB.7BdMGjz5CehirFuRrsAdI9grPVvq_cjBDi5s3Sn0AHPhCU9Cu9GUHMl3Nbk5BSMtFHUX6iU5zZY9mKpWgjEJ1bGWH1F7R4OKaHdf6YAMRA8M7RHR4erQKQCiyaNCvUnFOIoggb_TdHOqa4BmRt7");
            if (searchResults.length > clippedResults.length)
                rows += `${__rmT("BIFtX4B_ny_0fhAvzWg3zo6Cq1fRGwBvrPv7Gmtm1HDhFaMq5ZcE9xjE8MTBbcMEfRDhmtRDlhmrxRyEJ4DyvnyrAgsV9Eca.67BIeK2WIlwHJ89IqvATtdL8tfTsKiOFdAPDw0pNtEy1F3PKEgJQT5TNZY")}${searchResults.length}${__rmT("fimxZdI3wQS5VG9hvMgdHT")}${clippedResults.length}${__rmT("v3J7abAIM4ycTOTelMkgYT9qSFIc8CE60CnKlvbpY2NyPxFy")}`;
        }
        else if (!group) {
            title = `${kindLabel}${__rmT("UqjXOn_prQ9swk")}`;
            const groupKeys = [...tree.groups.keys()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
            rows = groupKeys.map(key => {
                const roots = tree.groups.get(key) || [];
                const descendantCount = tree.entries.filter(item => String(item.group || __rmT("yGhZ3f")) === key).length;
                return `<button type="button" data-rm-catalog-group="${feedbackCatEscapeHtml(key)}${__rmT("cI6YPmMXumkWR1HM5Sj292wEskcrsfbbRyjGZVeyo2OCQMfPzjJzGxlYhvq7EDnHstvZMkS3kX9tK8rOM0adbqLIm7I.ZSVbd7xwOt3QciKSpYVl6PXvzykKGmKzVd5wpBkQ2uGLWoURZdxmADLea8glqrI7QNEEoAY7SDH52q.iAUPSo7T3X99EQ_6IakfDkgI11YT7FcqRF_V_Fl3IceXQhpB5OUJvwHg2pwzvk6tt2u_tZjuu7zbBcLU6ZrccH33N93vtYhMJP1g0zM.KmolX11EpSpYHJpWgIJHbbmSAuSmrXiNX2V7Xch3Xf_F9Zac70n9PgO601ObtHM2aP8fjt.434GLOZpun6xno2ggD2YGSE8Z3_yXoTEUveNxjcUe12KMAbMCK__IKTjzTPiFAvSYqbFyEX.9Nad2qHEbcWxC1hWDUNI3dG_D6tA2FGcKCRApqgg.umPGX1im1WA8gdY3JKwZ_IBD2iBRL5S5Cl3_jYEEhbU7dOSJ3rZM.N.VgY0ZVYCzzMVr3ztPIqCtHWGE.kr_IV41seSFEcNgUVg8YahwvSiqqgI4bjNVGFHlqz.hZS.J16F1wPpieWYZo5vrat2CdqNttyaAKIY3GudPfuzRfiG2iKsSzTW_kWIoIaXd5jRoP6WHOdmXecE.iO.upZ.0ZFuuPVuo0u9vGSb4pgW5NEReodB1iGPhvCPi3NTM1k52CX8BBqjZF20xCEwtb.LHuWF5bl2wgs.yc9pAPYAvxlZ6R8RJFl3LbSEOsX2UaYVE")}${feedbackCatEscapeHtml(key)}</span><span style="font-size:9px;opacity:.56;">${descendantCount}${__rmT("UqYT1n_pSlRBTh")}${roots.length}${__rmT("SzdntnstkQYSjZEnHVCL_RekgYhD1G2oCBy0AczQO_T7Aos4CScPVoFOR2G")}`;
            }).join('');
        }
        else {
            const current = parentId ? tree.byId.get(parentId) : null;
            title = current ? `${kindLabel} · ${current.title}` : `${kindLabel}${__rmT("UqjXOn_pX6cBTh")}${group}`;
            const items = parentId ? (tree.children.get(parentId) || []) : (tree.groups.get(group) || []);
            rows = items.map(item => catalogItemRow(item, tree)).join('') || __rmT("7PNzKkFWw3XvMXkWtQuG0jbuehvB02LKD8Irvz7t5KYaZCyAdQAlEeLAokp7UxcDkyKXt4EHpTTxBGK7sMCZEWBuYAYmgWKKxNmlmbIJbZAzqvmoF9VFCoN.MEC7RjbOaH8ft72GqC8d41l50ZUmDvg0KeapyjOu7W07ebHb11jxKLMpxFOPSHLUDZE");
        }
        body = `<div style="display:flex;gap:6px;margin:8px 0;">
          <input type="search" value="${feedbackCatEscapeHtml(query)}${__rmT("hvYiOqv6Rm.CpWiJepbvZwpiqU6KxleFgvygnoIlDopIskKNbg4LzVv4zn1besV6UUa4lSioRpT7gB5mW9pFp1x41aeGa4E.0qV28uR5WSr6gHDJeVvfQpaNNIT1P7654k7ksCW9DrBSSzpGNMbMdqXKQDuDDVxfPwhIe_csT25wEG6d5bMP01EfyDr7Bha1h5NRWRNMmko88Lz3O9Ue_NUSpoNVGM0kaa14uj7heCCmU8XbO4bWnSUFiDD_zBh6tnYRxskCRvFfr4DNAy8dbettK0.EWTILGnvMFH86Xs0cNz4v8xoxCaBO4_56NIMQBEJHpUYUqUfNz2wYypztIrGJFMZNEkXkSn0CaNF3KKKAYujIfeUPJfT9.nGTqleayfRUcyOy4GMFD8NHzFwEpoy1H27BHI7PujofluQY.1MW9Wkp2PrBbP8QU2Tr2Hw3Pl8SiwHSrvSmwcopuuonjewMRBVebQrvgSQUnp7rEbCBHqhldmqawbJ1jeiRL5DJ6gjOsGmRi.zI_e58P.zT5NFcozD3i7nkQNDkd7ez.2Aq08msXYLi6AJH03Su97hxIVljosRQ3lMJcEcvmQ0_QlB3Ko21I_j7sPlR5eJSxwyTkaiI6T__9UIPuKhKJei6E8A4w73bS9a1YQXMwRWcr_W5SHuFERB1XgdvbkqT5Gkfgl_oDn.gF6dn84mB96vsE9VCKvZb828_NcZYt2KpX_G85AyB7PKulxMI6T_V7y1CGyLceh9hNXaqe663.omRP6wC1vS74iiBCbhkE1A4l2md8tnRX3CY8opyYZgBg.Qz4rbJB5XwFhAlRE5VJpTVI_mCEKcC_qMOjHrELASeiZKHr70jHPJPHUqmrTQw3H4USWwx20ghuaLdsPC66WoLGxLpeMewcNNtjHh8ixorRVQug0D7cNsDsxjnK1kVmBG3bc84RlHkAD0.V3oHE5fvX5FMerly7gOjDqriiNCJO7soWw4iDBFtjjUnFbqoth7GiuIiNZURzMIfTlXSLdGb8uuEhkCHx9UaTqOLJUOqVR6E7DHzYjM8NWUlV.VkYnd939S28.LiFu2OwBerU8kWCTlT2hu_u3yknpGsizBFxsKT8dUf93FIOsTADqh6YXOr1whu6EAzr2WhAGGFvy8NPSkiBvn0jfebUhRduyhRZlrMONzdTAN8.vWtx7UeQN.UmelJdu0kaPs560OqpV8refgtaVbNjpIIa.nUysZea17jvsora3M4kfuPbr9UhiQVO.IATWaumT680yzd7BPXFoF7crQa9cqfUmK5EKPY6fT9Ypgi9Qc15P54jshGLvr5g90bR5ZkjpfoSKwZQewsczPu4iNfq9.9HrNwrZkk7Cbv102VGh")}${query ? __rmT("Kz3lnbB1usg5DpDS0Igik4nqAgleXK644IcY7gWuWtHB6v0nXzqoLKvEC7raU5yRHsofISfQiBWDQvxjuvDdx.pmCKXuXxRT5Tl1VufrqaE5rLuXWgRQplcTswdPgNv5ct0CtnYJLx5i2hqvKyXCZGzI.rFAg9ncNi0frysOx8ycuESPI5JSXNuUyxMwgsEHdsWa4ON3qO3IglqDNVvIChQz9ktBtaYc9r5q6iGuvAn_ueStcdiHvpogFaY.LruU3zQAewgVMqc6N5uZD48QWPNgJ6__pK5wCVJhDsyx2MR8RH7LrZg_ikJLtE3cdQemf.104HCrrZ7kijUQeMeJZ9Xdv4agxcBQVxMzVIMoaPzAjv3.pUCrU0Y9CkcUw8Jf7FNVCZt06MFgVqML0T5yxuchiOE14bCwSNzsG2VAHsMcg6rfr_Xc1pvOk7.6lNjJzMkIFkkl56JgA3IGKo8S3Wek6_4J7PkHmiv9vsF9vLGKUlD22_CJWsT8cHVSRs3vEsGyZ9t7I0TpFixrXSgJ9w2GBlDTCZtGlqF8CVV_gSf5o8haswdgLoAmN99r_f5MQxf9yYnHyJaooxcju1xFv02nHA9hAAq16riJAAmsPMSWtCmx7DUd_VXnx2gIXG5eqAy0uJHT") : ''}
        </div><div style="font-size:10px;font-weight:700;opacity:.72;margin:3px 0 4px;">${feedbackCatEscapeHtml(title)}</div>${rows}`;
    }
    panel.innerHTML = `${__rmT("uEpIAe3HJnhaTpOevUTgcGZN4nhPZb7za3Si30ABfKr657WUsY5AZVhjkxep3SD3_JJNSR.BMSGLk24B9RDmrsGRwhJCEph8V8myfb9fwq_5QFWOywvW3YVw54LajX5d7FFSNDOB6VAZ38lVfP9Cl2pU43sORL3V3Sy63nPWO2yJAWiXmuI1YOacJzY0ar7DqCgvhSTkDqIZIF9oljgc7A2IN93x4GFt3MI_rJWkFtT60AwwHDUW9_zHLwYYMxsKrlRjforRveLjQCMbT25Vg9dMxTmDxeqNd6IJTVojLQJvpkQ5ZmfCjQDX9XEWBf3xhb_UyKi16pr9zdHd3iHoEOPFs77A1xq3gHxt86JvHVZccFY.5Ik869G8a5xqDuY54uwIvNFHdkStM9it..u2SxyMSXMK9216MUfPm9dCzLJKEoyGerfd8H2esA6_Le3MvUfmphwz81orHeuADnbU1WeZJUTqBakfx0zQZ4ITeJe0MA8jrxRwK4BNomtxE34AA9nCgvHaXf5ioBZLTkfI2_cx_2MnggMekjZLZ.4l9VbjTU9HBcceiFhBhRJyBWmhnTL.vHPrOq3UsZTcEdVDz1rzvHLzkhPK3YBl6MwxMt9iDj21Mdkq4sa4eYdWrtt8ZoIC9SPUg2n21PVT1aVYNhsN98BE_SUgJgzksW3axgQuvLjgiPNjGrRMoPBrkEWewdfF0UjWyvzQpaLemDUf_1Vf3IzvIjYzYzyS734e1396.8FF286s.kwuCwKIBpJNKoqCujQ2L3Bihx25shdEHLle7_PirsxjwEZx4CegX6E8UhVV99Z4jNP3aD5Xa4EmXNMa5u5YQLtdeGBmz4q1xwdxmNuOsboWwptKBi.qsLnAxZg2W7YHNKJXmN1gYVeyUDU4LkquOfOrq8jkDhtSDAwz2CH.6spie6ENPZwQHdsFWjcbHHdr.Cnl3XCaX90mbezMiMsk0YZVH6Qk0IhUkLXxJgB4NbPRZuj5iM_hUv0Zfjs9N2jxf2xnucL1.5YMLKCdE0g0K5D0X1JF.oeoYu9EgKXxc3DGJOgvEOMO7qEI1DYmED4tD8k0cSqb97xiT_nMWbdbWTCPOTQVt_iMBlKePu.UnwxVVg_u6z1GKpyrHJzGQ_XBFB1m_DNXwAkhwdtnWeRGkfsl2S5P3202QKVRaq1hOa.S0CrfVdxHSEN7KYid8LAJenfDnJ6yYji4dqc9Da6OhyXbIWVoS9stQvAmE3uFzKk60RQDCh")}${body}`;
    document.body.appendChild(panel);
    positionFeedbackCatPanel(panel, button, 420);
    const reopen = next => { closeRecipeMenu(); showSelectionCatalogMenu(root, button, next); };
    const parentOf = id => {
        if (!tree || !id)
            return '';
        const item = tree.byId.get(id);
        return item ? catalogParentId(item, tree.idSet) : '';
    };
    panel.addEventListener('keydown', event => {
        const input = event.target?.closest?.('[data-rm-catalog-search]');
        if (!input || event.key !== 'Enter')
            return;
        event.preventDefault();
        reopen({ kind, query: input.value });
    });
    panel.addEventListener('click', event => {
        const action = event.target?.closest?.('[data-rm-catalog-action]');
        if (action && panel.contains(action)) {
            event.preventDefault();
            event.stopPropagation();
            if (!kind) {
                closeRecipeMenu();
                showRecipeMenu(root, button);
                return;
            }
            if (query) {
                reopen({ kind });
                return;
            }
            if (parentId) {
                const previousParent = parentOf(parentId);
                reopen({ kind, group, parentId: previousParent });
                return;
            }
            if (group) {
                reopen({ kind });
                return;
            }
            reopen({});
            return;
        }
        const kindButton = event.target?.closest?.('[data-rm-catalog-kind]');
        if (kindButton && panel.contains(kindButton)) {
            event.preventDefault();
            event.stopPropagation();
            reopen({ kind: kindButton.getAttribute('data-rm-catalog-kind') });
            return;
        }
        const groupButton = event.target?.closest?.('[data-rm-catalog-group]');
        if (groupButton && panel.contains(groupButton)) {
            event.preventDefault();
            event.stopPropagation();
            reopen({ kind, group: String(groupButton.getAttribute('data-rm-catalog-group') || '') });
            return;
        }
        const enterButton = event.target?.closest?.('[data-rm-catalog-enter-id]');
        if (enterButton && panel.contains(enterButton)) {
            event.preventDefault();
            event.stopPropagation();
            reopen({ kind, group, parentId: String(enterButton.getAttribute('data-rm-catalog-enter-id') || '') });
            return;
        }
        const searchAction = event.target?.closest?.('[data-rm-catalog-search-action]');
        if (searchAction && panel.contains(searchAction)) {
            event.preventDefault();
            event.stopPropagation();
            const mode = searchAction.getAttribute('data-rm-catalog-search-action');
            const input = panel.querySelector('[data-rm-catalog-search]');
            if (mode === 'clear')
                reopen({ kind });
            else
                reopen({ kind, query: String(input?.value || '') });
            return;
        }
        const favoriteAction = event.target?.closest?.('[data-rm-catalog-favorite-kind][data-rm-catalog-favorite-id]');
        if (favoriteAction && panel.contains(favoriteAction)) {
            event.preventDefault();
            event.stopPropagation();
            const actionKind = favoriteAction.getAttribute('data-rm-catalog-favorite-kind') === 'format' ? 'format' : 'theme';
            const id = String(favoriteAction.getAttribute('data-rm-catalog-favorite-id') || '');
            const before = isFavorited(actionKind, id);
            const after = toggleFavoriteItem(actionKind, id);
            if (after === before)
                globalThis.toastr?.warning?.(`${__rmT("eDH1es0Fag9pVcMLwFj_Lk")}${id}${__rmT("jzk")}`);
            else
                globalThis.toastr?.success?.(after ? `${__rmT("Un4vn9Npxk52zsHhVpA")}${id}${__rmT("jfBzW8YHF4xf0wsY0WxU94nQ0BWBP8UZip1Fx02pDYddEf")}` : `${__rmT("qMRE4lB0DbRuFw5D")}${id}`);
            const freshRecipe = rabbitMirrorRecipeForRoot(root);
            button.title = recipeButtonTitle(freshRecipe);
            button.setAttribute('aria-label', button.title);
            reopen({ kind, group, parentId, query });
            return;
        }
        const blacklistAction = event.target?.closest?.('[data-rm-catalog-blacklist-kind][data-rm-catalog-blacklist-id]');
        if (blacklistAction && panel.contains(blacklistAction)) {
            event.preventDefault();
            event.stopPropagation();
            const actionKind = blacklistAction.getAttribute('data-rm-catalog-blacklist-kind') === 'format' ? 'format' : 'theme';
            const id = String(blacklistAction.getAttribute('data-rm-catalog-blacklist-id') || '');
            const before = isBlacklisted(actionKind, id);
            const after = toggleBlacklistItem(actionKind, id);
            if (after === before)
                globalThis.toastr?.warning?.(`${__rmT("EqrVO0Wxag9pVcMLwFj_Lk")}${id}${__rmT("jzk")}`);
            else
                globalThis.toastr?.success?.(after ? `${__rmT("Un4vn9NpDm_ua0.GVpA")}${id}` : `${__rmT("UnzxUN34Dm_ua0.GVpA")}${id}`);
            const freshRecipe = rabbitMirrorRecipeForRoot(root);
            button.title = recipeButtonTitle(freshRecipe);
            button.setAttribute('aria-label', button.title);
            reopen({ kind, group, parentId, query });
        }
    });
    bindRecipeOutsideClose(panel, button);
    return true;
}
function atmosphereTicketLines(ticket, fullKey, shortKey) {
    const full = Array.isArray(ticket?.[fullKey]) ? ticket[fullKey].filter(Boolean) : [];
    const lines = full.length ? full : (Array.isArray(ticket?.[shortKey]) ? ticket[shortKey] : []);
    return lines.map(line => String(line || '').trim()).filter(Boolean);
}
function interactionRecipeNote(source) {
    const recipes = interactionRecipesFor(source);
    const palette = paletteRecipeFor(source);
    const paletteLine = palette ? `${__rmT("OxyoVR_600yNea0jhtb7a29qhabYVn6GH7NJUZxawpR06zB6St9JFKGSlvG0JHoAG2Wdux1QICCBc2TN9XKf_HCNFLOavwAiRBk.4bPzjTiC7D4xYb.l15GxisrYTXvxVOa60YXfxKb82DEWtWPIpTLfkL_2qo9aNrZODJat")}${feedbackCatEscapeHtml(`${palette.code} ${palette.title}`)}</div>` : '';
    return recipes.map(recipe => `${__rmT("dCuRSjUF2NkYYrmp8J5gIkH6zXnx.vwaY7si0nEiGoalW7gq6uDtqAxt7cGB9NSucwcjr83Xq531TkfFxzQgIe4hTHwV2JQC2D.wgzbmUMh9lbmwC.9r12QF4O5Ybq8Pcx5oPnEciIDJPLOxNUHhXan_JO2tkRXKbu6N10c2ur4UX9nKc2MCTFajkE0riFXd_3plahT7m0jEef")}${feedbackCatEscapeHtml(`${recipe.code} ${recipe.title}`)}</strong><br>${feedbackCatEscapeHtml(recipe.summary)}${__rmT("ueci1y5eUdUK0Oh6lgD")}`).join('') + paletteLine;
}
function atmosphereTicketBlock(ticket, index, picked) {
    const themes = atmosphereTicketLines(ticket, 'themeFullLines', 'themeLines');
    const formats = atmosphereTicketLines(ticket, 'formatFullLines', 'formatLines');
    const rows = [
        ...themes.map(line => `<div style="font-size:11px;line-height:1.45;margin-top:4px;">${feedbackCatEscapeHtml(line)}</div>`),
        ...formats.map(line => `<div style="font-size:11px;line-height:1.45;margin-top:4px;opacity:.72;">${feedbackCatEscapeHtml(line)}</div>`),
    ].join('') || __rmT("OxyoVR_600yNea0jhtb7a29qhabYVn6GH7NJUZxawpR06zB6St9JFKGSlvG0JHoAG2Wdux1QIYCIc2lNPosY_GYNXLhUvPfiN8IP4bwzkTwP7lbx4b.D15YxFlr1TX9xzIaE0fXfaRbT2DGWJW9tpFqcId_Lq2zantLUGGUT");
    return `<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(127,127,127,.16);">
      <div style="font-size:10px;font-weight:700;opacity:${picked ? '1' : '.72'}${__rmT("01ePOZCpf2OBTh")}${index + 1}${picked ? __rmT("UqjXOn_pRURe0k") : ''}</div>
      ${rows}
      ${interactionRecipeNote(ticket)}
    </div>`;
}
function selfThinkFold(self) {
    const thought = String(self?.thought || '').trim();
    return `${__rmT("my1UrpWENzpNnFQCDx3HIhONeoB3LYN9twse8sfcNutCEQ3e38DkNxjVVULlR94Fs21kYL09T5.Uf.LEvqZMMR8BhTwKxZr4rC21dIvO0regCsOaPkiQ8AOBT9cZYC_Xtm07OqhkHIKb3RHqcfGWJY00UyjGF.4GgLCrgPVXPSOrlVhqy.Lu8eBw4N1i6boi5idywYL77xQVeOBmnjlJ6HVysvbdJggjDIMzG28XW.PB.dxpu9YE2SqjCH9ZFW8dyP9BqwUQQ_0dTjf8nzCFHH8uDe3tpo3m5fGuSCo6wD1kLhljZTHQ.g021K4OiRH4quSBvftoMbo1toPxvcRfVUtoKQK9gEQSs6MF66TfpI1XtLUVTFk139Jy6CNOmy3NplT97XbX1Dru2BbGSEw27mFR1tsSH.BcSP5QgfVvSHIp6wDxvHxJJCB0Ag53gxjRQG4aFYmgm4YTpMrdNu6L8Eikww62IHYfpYwK8OvEN2mKZdtHkKifZVRpMvPR98Ec85dvnSFmMt7VkWMUh.h8a3VU9BD_Z1PF7G3USJxteOYyl_Wh9T1D782T91UOm_az9gDTFG1b3GPBQrcTV.AdjoiYSid0SAwLPbNwLVnzVi1kLSw8v7fVdRJUGlG")}${thought ? feedbackCatEscapeHtml(thought) : __rmT("k5S7Eltea2Kgrm2a1LxIvIAh3QAGq7nmQavtQqU0kneapPPRNVE5j8Cy.GsiKZOvIc6ZxxP1EfGtpdmP9HCFrh")}</div>
    </details>`;
}
function atmosphereThinkFold(recipe) {
    const menu = Array.isArray(recipe?.atmosphereMenu) ? recipe.atmosphereMenu : [];
    if (menu.length < 2 && !recipe?.atmosphereReason)
        return '';
    const choice = Number.isInteger(recipe?.atmosphereChoice) ? recipe.atmosphereChoice : null;
    const reason = String(recipe?.atmosphereReason || '').trim();
    const chosen = [];
    const rest = [];
    menu.forEach((ticket, index) => {
        const picked = index === choice;
        const block = atmosphereTicketBlock(ticket, index, picked);
        if (picked)
            chosen.push(block);
        else
            rest.push(block);
    });
    const restFold = rest.length
        ? `${__rmT("E06ffxQGuWctaXLSe1oNyH6RdKgq6lHMYDOn2bsGa36Ws8ZWBl2rCpLuPajFFFzyiai_6P7jJBA5bb9fvHgaIlgSQKjgO0hMvNeYZUXyhSZqXHkDfKvS2kOzJya4efeX9_Hun7q93EX.XI60C0oyltknM30DWj0UDLzX7z4SPj2OR1hZCL71All_I0YCDUirWpV4zbmVP5Sh57bpsjAlPWMs44c42vRtUrTAzeyF6TX_EOYrbttWZntBQVMK3U0AAHZZ.maznko0t9DhwTLlCp8tyxX3xqNyMsFYS1HD4GepHfZKbIicJR30DdaJZd2cOK2FG4afGBu1JyBdCxk")}${rest.length}${__rmT("o6lz47DJHzNv4hvWwONFOgle7Fb7JD9zv3DNKgCU4VLijfjp98C.Zh5GMVOj0eZaJgca7h")}${rest.join('')}
          </details>` : '';
    return `${__rmT("eq3jNup0lPCDJIjRibyaeCZIGjIXOlepPZU.K8ykRef53CR_93.RqcL2Ru4ehqqof3jEt.svXtg9VkzVFNoNidPxF0YgnjHdFUCMT2tveKiPu5zk9Q0dXwRsbbWSzBA13j4NEwK.njEWkkDiCE.YNIMg02wpyXWmZosPtUnxhIO04M.Tl_ZcZKY7K_rTl5EiPtraFe0dXRmsLaXQIqS1OJupWPGhMksUndJUWbH.ybAkpBaHx2HOm6bNUThQGXfJq8cvg5w_rtdy4H8xr0yutgTbqWVlAzY2nvhf.S8MhkPlVrg7pAqKhClWFEZ0zXGRALl15hfI0rEcDGPfrsJJklZkVPWXzuHBMkuc2Q0N97USPzXkywl28B_zEzWahhHnB6Vn.DhthbELgI9.2A7YqMghyoCPFGOi5G0XBCjLWQBMTHlzgG4VCFNe8B5kjJ60uMHcj5maw56VTOgvubF9FtPLG9KCbgXLCVcdHqlbWjzkQ1hvqjBnHQubTLMd650TopfUDUnEfAv6P3EJjIft6yj1BPmvD.3h_mT017VLJ9A")}${reason ? feedbackCatEscapeHtml(reason) : (choice !== null ? __rmT("xyVJykcVTKIeIJVebij6pupCWZIITeyLd2gKXbKq") : __rmT("YGGg0Tro4QCrx6WScdaWYAEnhd4A87s2"))}</div>
      ${chosen.join('')}
      ${restFold}
    </details>`;
}
function showRecipeMenu(root, button) {
    closeRecipeMenu();
    closeFeedbackCatMenu();
    closeMaintenanceRabbitMenu();
    closeRabbitMirrorResayChooser();
    const faceDetails = root?.matches?.('details') ? root : root?.querySelector?.('details');
    let selfInvented = null;
    try {
        selfInvented = selfInventedOf(faceDetails);
    }
    catch {
        selfInvented = null;
    }
    let stamped = null;
    try {
        stamped = JSON.parse(faceDetails?.getAttribute?.('data-rm-face-recipe') || 'null');
    }
    catch {
        stamped = null;
    }
    const loadedRecipe = rabbitMirrorRecipeForRoot(root, true);
    const stampedMode = stamped && typeof stamped === 'object' && typeof stamped.samplingMode === 'string' ? stamped.samplingMode : '';
    const selfFace = stampedMode ? stampedMode === 'self_invent' : (!!selfInvented || loadedRecipe?.samplingMode === 'self_invent');
    if (!selfFace)
        selfInvented = null;
    const recipe = selfFace ? null : loadedRecipe;
    const state = getBlacklistState();
    const favoriteState = getFavoritesState();
    const items = recipeDrawnRows(recipe);
    const panel = document.createElement('div');
    panel.setAttribute(RECIPE_MENU_ATTR, 'true');
    panel.style.cssText = 'position:fixed;z-index:2147483646;box-sizing:border-box;padding:12px 13px;border:1px solid rgba(127,127,127,.35);border-radius:10px;background:var(--SmartThemeBlurTintColor,rgba(28,28,32,.97));color:var(--SmartThemeBodyColor,#eee);box-shadow:0 10px 32px rgba(0,0,0,.28);overflow:auto;font-family:inherit;';
    const directiveNote = recipe?.userDirectiveApplied ? __rmT("MFY1_5tnEdy.ZMBVeAlTV8QgbOW2wbJobV0vfPIReKhVriQSB85qiOQqjPnIBSkC") : '';
    const forcedNote = recipe?.forcedVisualScenery ? __rmT("3K7lqY_UBWk1e3bcvWBZ47o_1l4lniOK4BZJP6OtDT9Yp0agTKS4IJRXs0XdpqWSjoFY3h") : '';
    const emptyNote = selfFace
        ? (selfInvented?.form ? __rmT("lVc54XiTRXsvAJpTcC8Ds4dpfpicQ6ZgOzp3.ULds3fHlZQX") : __rmT("QQeKFQa9wipPHCH5FP0oi2.Iky4h0I.g5Y2_tL2stMv3h7_mIhG1L4qJKEcZZEHeHjrOVote839b8fpeqAk"))
        : stamped?.pureOrderFace === true ? __rmT("_NNFtZEk2NX.DMO47RG00spxtfbTnavGghP3wvjuB6HGg0Hw6A9F3m8NzBG") : !recipe && stamped?.userDirectiveApplied === true ? __rmT("1WcHEWGfmLbMuGkAEe2dIFQuqQNyejF4NaoIflq.yXI1lvQ8OFBG3XZIjP7HZSkC") : !recipe ? __rmT("Nump85pZB1o323ZpTYhCu3B1EMC6dICp9dZbi01heZmfaT9q8riRo5ybl0.Hx40W2uQH4Ds.rl11z_OGj1NxgoeTSnfwe16zCrMQYzgD2AZ3wpmqjLadtuHNqklEZf") : __rmT("UqLiFndRyoWgfO24hA3axm7M7S9CofxsRGniQN_Q8w0elAOHQ0GdyzJJzRl9uT");
    const lead = selfFace
        ? `${__rmT("JsfU9A._qRFXeFaFJh2kXZLHPxn7ZWDxNrrdoLUGo1Y9SSXcH1mly9yfTl473EGrdSUZqOx.")}${selfInvented?.usage ? __rmT("VX2yvyfOJAAhtLbBm0r43dqZ.JB77k") : __rmT("LNpfZdaZr8dzg5vRe1UhXf")}${__rmT("Cdc4UTeg8Qy66SfkGI.zHe0DbNs")}` : __rmT("xGYuqpAUP4rdkBlJz5JFf46PJmulXW85lHy521ySPfjry5RT19QAy9n8rFG.G3MwobWBog0okeU1lZYnwGJev0ifZmjn488L6d.9G0u1nzq_ob4DwwUCu54KTMAfgVTRsCUjNEMAUTe50kZDAiWGmcFL");
    const selfRows = selfInvented ? [
        [__rmT("giWovwcXDKhvcn1zRtjbfZ4O7JhZqCbfp5nVMBim9lh"), selfInvented.theme],
        [__rmT("ptdyQB86douQPVERKeiX.XQ0NJkh0TntMyA"), selfInvented.form],
        [__rmT("WUISuf"), selfInvented.angle],
        [__rmT("IRa4tlY7mODtBCozHXmt974226Rkjh"), selfInvented.usage],
    ].filter(([, value]) => value).map(([label, value]) => `<div data-rm-self-row style="padding:8px 0;border-bottom:1px solid rgba(127,127,127,.18);line-height:1.35;">
        <div style="font-size:10px;opacity:.58;margin-bottom:2px;">${feedbackCatEscapeHtml(label)}</div>
        <div style="font-size:12px;font-weight:700;overflow-wrap:anywhere;">${feedbackCatEscapeHtml(value)}</div>
      </div>`).join('') : '';
    const totalBlocked = state.themeIds.length + state.formatIds.length;
    const totalFavorites = favoriteState.themeIds.length + favoriteState.formatIds.length;
    panel.innerHTML = `<div style="font-weight:800;font-size:13px;margin-bottom:3px;">${selfFace ? __rmT(".KaF1ClQhuQOgXOGmpCKuKmH3YCaKInY") : __rmT("L6jhTXteqhFMk3Ru_lC")}</div>
      <div style="font-size:10px;opacity:.62;line-height:1.45;margin-bottom:7px;">${lead}</div>
      ${selfRows}
      ${items.map(recipePanelRow).join('') || `<div data-rm-recipe-record-status style="padding:8px 0;opacity:.68;font-size:11px;">${emptyNote}</div>`}
      ${selfFace || recipe?.atmosphereMenu?.length > 1 ? '' : interactionRecipeNote(recipe)}
      ${selfFace ? selfThinkFold(selfInvented) : atmosphereThinkFold(recipe)}${__rmT("zVbPC_ggeQFl7VdoSdWxbfU0C5r6ea.wJ9RFmPf2fGodijRHERUD0FSDgccKfbpAkWbMiTCPUJiT9MxnG0gXG9w6YLo9lpmHkjXn3F7SWy1rPmbCfpFWOneMjZvRE4RAbALRUkFFW_54WS.LLhphoAeNkrPV2_elCn6zfcKG94xCLgf1Oue6oEsaE7bGxU3v.o_eKQDfYRC1R1Zth8noqoCxHE8pcamM0lKRhffD8jK74KGSjp_rfC2oNCt9CDKBHP8tMhkex6jgeMbhX72wiMPSTJuMM72YSFOdB4Z1hhRQQdSn_C1nz2whdurvs6DjSH.jbp8SeE9Dn5RoVeGn9RSSYjoBkSPeIvno_6KdTwX6WmIQGzhbEDH2KxHuTFJHFDTSf9Q_.5FSbaGeHRJx88sKVGvHpkn3MnhdK931ka6oH2t3NMNw.mU07m1jNB7GWGzzghan3jtP_JcdxPBVlSAWJ646MJ.h1bu62TMvynNQ3.HikaanB8I8SwIMbXoCgibnd4TK8t9KFnP7CPgNCOKG4Lc.K1TkJBqUtSVhGKU_fTFP1CTAHqmNqFquleLsSgiyD91Kwi8nx5K9oG1sYinpH.dMr11yyravg2BeZz69oS.z_0dRqIQH61bxyOCTryvURql54MDpwf1H8n_yUH40EKqo4qc2uF1E6dBCnHmGBAuS.xQImAVr8aZ36gpZ9Tk6lsQYDkR2i5CzI5q9YWLZyUpVGeWkK0SBwwmw3r510Gsn_UjZepd_ca0sl_2_vYLNFlyepZx2a3ePmeyoamZgAlB8qd1vPJVeRVj2y.HkuQTPUoTFOTof6ILPPKY6dG5OBrJerJpVtlICEqOc2czLU4MNtZynpxYrEpblKwjPMvg7LOmL2jpc3ztWZ72yxMCpETmC.BX23V0YLsn7TtnpJhHZjHJ2q.hnZf")}${totalFavorites ? `${__rmT("eis")}${totalFavorites}${__rmT("eXs")}` : ''}${__rmT("ulZeDQIM6JRKPVCMEPjfgJza2.0KTloFJgecUs.37NZm8971lF5KIOq7ySavXo5dzuiNR5BV6s6XPMpwsu1ZVxm5g0LNtZ6wGRmh.xF2YaeaxmWVWrk28p8SdUn187nUzTjd9_sABvb09id_.X8fbWaTzGOdhexAdqWI5uvVSXoo6oJuM7oRSvQyD0JUpfUTwwBrV.3NAbVrPVYnaJFJgvgM_BcQripxuodSoA9ck2Hbxxnr9yOYD8yfSl2.bcvHqqXkBPQQ73TVYY07PekLIok4gFTpyTbrVvwbPhGDY3RYDpqyCl9FC.1gZqiABaxQLAEGL42yYXUNuwPNJoEX9yPlHf7rBi_sot8Yif2W1ipAQ1FcYMxv2hRiHOCEkkA80rLwacRbe8s3uM6zHPSxKrthmlQX79OSEszzAl3jSTeRT4U2iRInGidc55bK6Hi0OdYv2_qrpmfmxGpj5CKtvjVCwFQpDTYig31NNAjClypeQqmma9K61RjTl3c090aWg_IQv1MCrk4kcXL49mpu5J7o1cLKByrVJEjydkn2bMdFfPT8EUCy_CfTxq5e5NDWjPjkInUl11EZ9EvminnSY4jgFkYPaBHhLhQ8hLw5XJ99o1M0J_Pq3d7k5MerK9f_Ft10z7RO3GyL_3J2qcWk4GXUIKVNn7FHW3dsBLqKog1UoQ.2unV7XFvcaPcbps_qpPAT1kPnl46kdtYnopCzM.TimqgoYuWvV8sK1m0k6YAWe2eaUeU77ibLmqUrRx8usZiucJ5f")}${totalBlocked ? `${__rmT("eis")}${totalBlocked}${__rmT("eXs")}` : ''}${__rmT("oNXlN84AQIG6aqcuwvUiPYDjtK9z2PzueAj.OoXWbjcuV7E.SPghmheACJV2qObXZb0ep8yopIUOszDo2UpMKXiTcMb6fZMep0BMEV0Yzw8p5ciHhxXiwu1s0uvBmTf_5J.pOgtml6SFcpr2BCLUIDnRaGWVMxLYJRl8QjCtCjoT9HfXMGHz_V2imV4anQ7K23jz4Bwf_BwCQHbzKXz6MpgWvH8Hx7dyEjWVPm808xJC3vGIwMFrdHK0qSIK9SEuuEkXJhFrb2zleMJWlv7Pm3Fi8gSvPNFxZvVlh2Oti3pgY9Q2Eqw15qYP.b9lei2BlEPGKWnVc6FdfziJTy5HhtHXroH4vk_olN3mk.8BlNYeiT0bNnnD8OGP4tNgwV0h3Z3pacBbq.OIBecXHTZLHM8WDn_E9S8sbSHssWI9OfWQ6C6SNzUTwZq.LKTaFfhh6ZNO0RbovgzhZn6837t.j4ZvqU11ZfRoV0FNTj.TOZs.l_KbRnaFQ7VW0FNv.UUfFUpIBOlhU31UQRX7XqNqTd_tXbO8u0QFk6G2Nf20rCH.e_bvtH8HDdfAsMgrAptb4pL.xo2ghbJVHO0h_mgbBmhEafRvf.zObQPIYbgAx6ygGcrFrQn.fde0gOlYMLHPZ.GDbBMHUfm5Xp6ZH8V8pZHicu.5FVjEMjL5pt34g2Dmr0CNTu1k_vyyR9xelS80cqr3DPRyyxufX2gdhIjj8DxHDmgMB6y9pzkOORWybUbBCKPdlkg85H3ajRA0TURE5Y4me2R8GrmSST7RTIZ.rta0cED3xNSf6fQ27Z81yVFBRE1lESbEx0_pD4T2LCQH_MUSSIRkEA6vUz7sPwPGcq3BBCRK3yVCUXnSfG9AaFNRt26U86s0I_6bMdVQeGThxO5bByNF6qn9dg5ttLiP4iH7gwg_BLtU6cRW57AUiu2h0jhUhcuT61csoq9mtboFsMuoVVDXeyMjsxE12tGplgp.W2ecTvfkfXJJW56xK2Sv6oQxNYgb0ee8tg413aJlYYYaX1lTv8f")}${state.enabled ? __rmT(".wRbZQNrk4f6aCuy4DD") : __rmT("x4UgIGh.89FbOm4c8ia0p2XYbc_X8QWYRtwHXvr9gG8")}${directiveNote ? `<br>${feedbackCatEscapeHtml(directiveNote)}` : ''}${forcedNote ? `<br>${feedbackCatEscapeHtml(forcedNote)}` : ''}</div>`;
    document.body.appendChild(panel);
    positionFeedbackCatPanel(panel, button, 360);
    panel.addEventListener('click', event => {
        const managerAction = event.target?.closest?.('[data-rm-recipe-action="blacklist-manager"], [data-rm-recipe-action="favorite-manager"], [data-rm-recipe-action="catalog-manager"]');
        if (managerAction && panel.contains(managerAction)) {
            event.preventDefault();
            event.stopPropagation();
            const manager = managerAction.getAttribute('data-rm-recipe-action');
            closeRecipeMenu();
            if (manager === 'favorite-manager')
                showFavoriteManagerMenu(root, button);
            else if (manager === 'catalog-manager')
                showSelectionCatalogMenu(root, button);
            else
                showBlacklistManagerMenu(root, button);
            return;
        }
        const favoriteAction = event.target?.closest?.('[data-rm-recipe-favorite-kind][data-rm-recipe-favorite-id]');
        if (favoriteAction && panel.contains(favoriteAction)) {
            event.preventDefault();
            event.stopPropagation();
            const kind = favoriteAction.getAttribute('data-rm-recipe-favorite-kind') === 'format' ? 'format' : 'theme';
            const id = String(favoriteAction.getAttribute('data-rm-recipe-favorite-id') || '');
            const wasFavorited = isFavorited(kind, id);
            const nowFavorited = toggleFavoriteItem(kind, id);
            if (nowFavorited === wasFavorited) {
                globalThis.toastr?.warning?.(`${__rmT("eDH1es0Fag9pVcMLwFj_Lk")}${id}${__rmT("5iTG_L.8BzUGMtJxpgUeQ6mp_i0j4KGZihm.gSepzelRAhWQ0EDr7f")}`);
            }
            else {
                globalThis.toastr?.success?.(nowFavorited ? `${__rmT("Un4vn9Npxk52zsHhVpA")}${id}${__rmT("jUHcryDTrZKnvcVwXIY3.yF1dr8IEZsc29E")}` : `${__rmT("qMRE4lB0DbRuFw5D")}${id}`);
            }
            const freshRecipe = rabbitMirrorRecipeForRoot(root);
            button.title = recipeButtonTitle(freshRecipe);
            button.setAttribute('aria-label', button.title);
            closeRecipeMenu();
            showRecipeMenu(root, button);
            return;
        }
        const action = event.target?.closest?.('[data-rm-recipe-blacklist-kind][data-rm-recipe-blacklist-id]');
        if (!action || !panel.contains(action))
            return;
        event.preventDefault();
        event.stopPropagation();
        const kind = action.getAttribute('data-rm-recipe-blacklist-kind') === 'format' ? 'format' : 'theme';
        const id = String(action.getAttribute('data-rm-recipe-blacklist-id') || '');
        const wasBlocked = isBlacklisted(kind, id);
        const nowBlocked = toggleBlacklistItem(kind, id);
        if (nowBlocked === wasBlocked) {
            globalThis.toastr?.warning?.(`${__rmT("EqrVO0Wxag9pVcMLwFj_Lk")}${id}${__rmT("5iTG_L.8BzUGMtJxpgUeQ6mp_i0EtC4pihm.gSepzelRAhWQ0EDr7f")}`);
        }
        else {
            globalThis.toastr?.success?.(nowBlocked ? `${__rmT("Un4vn9NpDm_ua0.GVpA")}${id}${__rmT("IVTskBILhigb97rSmffLjfdKaVZHn6S.m5vspf")}` : `${__rmT("UnzxUN34Dm_ua0.GVpA")}${id}`);
        }
        const freshRecipe = rabbitMirrorRecipeForRoot(root);
        button.title = recipeButtonTitle(freshRecipe);
        button.setAttribute('aria-label', button.title);
        closeRecipeMenu();
        showRecipeMenu(root, button);
    });
    bindRecipeOutsideClose(panel, button);
    return true;
}
export function handleRecipeClick(event, root, button) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    if (rabbitMirrorExternalGenerationNotice(root, 'feedback'))
        return;
    showRecipeMenu(root, button);
}
function maintenanceRecommendationForInspection(inspection) {
    const findings = inspection?.findings || [];
    const plan = maintenanceRepairModesForFindings(findings);
    if (findings.length) {
        return {
            mode: 'auto',
            label: `${__rmT(".PLraZLuvF93Mc48uT.Vi5gxjFs")}${findings.length}${__rmT("2RdKGT")}`,
            reason: `${__rmT("3xAzMl7MGM7Stf")}${maintenanceFindingReason(findings)}${__rmT("gsFyDNkI2f8utb5D")}${maintenanceRepairPlanLabel(plan)}`,
        };
    }
    if (inspection?.state === MAINTENANCE_STATES.notice) {
        return { mode: 'patrol', label: __rmT("p1Ir0sY75W3WzH399KcVo5j.A8l_Eh"), reason: inspection.reason || __rmT("sS0vxbOr8v7O7N7RqQvd_new_VU2_5MQc4DF7k") };
    }
    if (inspection?.state === MAINTENANCE_STATES.unknown) {
        return { mode: 'diagnostic', label: __rmT("GAH.IosBbgapMCDxVEVoZIBcAwG"), reason: __rmT(".l.tRL65p81njO5TmhUjpFFx0_9M6MnLVmGF6u3ZCsk") };
    }
    return { mode: 'patrol', label: __rmT("9N6oVMgWNuY"), reason: __rmT("bsX3ZoemEHECXmgMOSHfS.6O7sp") };
}
function maintenanceRecommendationText(inspection) {
    const findings = inspection?.findings || [];
    if (findings.length) {
        const labels = [];
        for (const finding of findings) {
            const label = finding?.stage === 'visibility'
                ? __rmT("Q7BIKx06kNeziT") : (MAINTENANCE_FINDING_STAGE_LABELS[finding?.stage] || __rmT("yGhZ3f"));
            if (!labels.includes(label))
                labels.push(label);
        }
        return `${__rmT("SNye6L2gHKG")}${findings.length}${__rmT("qGygZrop")}${labels.join(__rmT("jvk"))}`;
    }
    if (inspection?.state === MAINTENANCE_STATES.notice)
        return __rmT("Np1v1WWVL42.4.zM15xxrVbzaSAQnnvc8RR1Zj3aHHq_LGHbJ25cUT_pkCY");
    if (inspection?.state === MAINTENANCE_STATES.unknown)
        return __rmT("UsrdRThZOBRMOV2Iioq5wWSvoKA0c9nLIv12y2QYh3E");
    return __rmT("ZDOuh357GY504crLOJmXXf");
}
function showMaintenanceRabbitMenu(root, button) {
    closeFeedbackCatMenu();
    closeMaintenanceRabbitMenu();
    if (!root?.isConnected || !button?.isConnected)
        return false;
    const panel = document.createElement('div');
    panel.className = 'rabbit-mirror-maintenance-menu';
    panel.setAttribute(MAINTENANCE_MENU_ATTR, 'true');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', __rmT("zwA_WvC9"));
    panel.innerHTML = `${__rmT("onqOd4RUlhSjzHeF6cHtj5skT8heRkErn9AW9sDPcN0u4Xh0PvWCeWZMULdQdy2SI2YxtkAUYY6rnQa37.uRTnQO9C4wi1yF1VkOuUCyNBZcmIiTgpTSJZywWsWaZF2RfiEM3YFAqP8q9x_fOJ87X4iBgDa7PI_P48C7j8piNecITRMWHIpEUzuRlSjJEnfJXqZ6SmtJKO4f0XhHRTTKpJZysMdKxgkb4woH4P1t3D7UYlIbjGPdExhLfXt8DZGpl.SwZQmEyjrl2IKS9Cjf7Ddg1A2Dtqf7NhH547BIc_APMp_wroWBbOAw4UQ7bgW5qq_AL1iacicgizZEH6tbUHUfG947RL1sAIEhtNqMGLR5R_iBDjGRUPC7qFHC2EcjsB2_EoxzgJrfmfDWojBYCpvkKBfzdvpzsoSfNBcI3LlXSqZURIT.lWub7lkGBKju224j5J.MB_qvhIMXsHz2mAz7C_37ur56aWpKsFoseYYKZe.4h7R9D6ueQKtwRqWoRGAorE7ke84AX5aRI.4JArf2eERVyA9rlFAXVvef8FcX7MzZAdz5g0MnzInyhxMjuc_c.K404BzCyRllCuIcLsta9lnL9YOoPCqzHfo0lKtqY6g9X6Nv8htK01DkKHRDeptemm1I5Zo06m09_Ium_c5kmEOQJf9Ue0kUQNh76g50VN439lRPqmI9A7aF6DYGOp6DYguVERztNSrHbdyr_2Kn3yY0ztXXxO0MbIyz7peu95RbFqZQtICKus93fG9HkS3h44T0G7uJgz6jlJyE933qf8wnD5rmpk7DQ4dGTNaLX4660WlpbNGTXlangpTMvm0NVczOoCUpbcE5sL_9E1Lk_Sxp3Uak1n1cquQDpExgSYmLq6.0A_9Bzr8I4pEU6fgAzC_pFD8ALSZTW3NeWwwmu9LS9iCAX2nVTfYqs5pQeZ3DETcaEO6GV6SFMm4fr47eD1QxZerf4sAC.VqymEtS2YZEYNg010j3CqVte4iUFURW_mJ3KNbWxivHiypGBCqPHC7KtHxBB21WZzVBGvaTME2aUA4O3qAYURm8fF7xCThE9xrZIyF2qdkYPed0wklSnUo50ejG7lSRiDq.MCcrk4up9HXiFjfaLeIFJMN1k6W4YpF6ehjvViQRkS4UkR_aOSodZvuKgKVHH1e62Ae8ZDHw_uiIwb1vzpXOcxwSX.ckmbcJCH5MIVS0qNQZBzc9Mp7tokFQhOoDAh0gMPuSck3d1np1LkEWgRRHin8Twe4ZaOP81CMBgjVUWhGBF0_gS2HyUkKeyA5v0o3kIUnD7sm0tDDfw36Z1GLxNW41e90Oohb5BOJqQLDUuHRwtnHlYJoa2ShhNgoCMopJ8yCRATkBhe08m1NF_g1RONhCT0q2WuGRQ5_tMQZfnkZbVxJFrGe5EIY9ayxIfM37Pua5vVMVt2q1wp.qr3mjBxT6QLcUTEPZ2fkMIS543hBLVCSWjPSE6OGIjjRHo6IU3UQavV7ueypnCvVPcz5ZIONQ.LudQ9EfFGTYBRY2clVW.Tcc.slNc_G6_xoJi.huYpbXmJbwK.D75hIWQ9LNSWVwFxfGFzR0E1r.J3t9GmtYzvhzG8b3FTXstBaCIVZNWkpgSIHFyFZH.ZOHJzkvHIXE3E4JtSZTKSaxvNJhtUkRmB_e1hpncqniKqGX3URl.P5zJ2QK135a0RfDv_AIcqbdoQ1YOePky70h8E.ZBWJNLK_Sjsy8eGRw2RrUpw9l1GByCP4cN2AN4RwoApuT8epiZSHBQUPd4Wh49aFiNbc8AFYyF03oFE5ClLnKLj_hegjjK6vHowgscob5mqhI8bhr2LZfR052mFSDCQpzbscERl0i6S7UGLpfGEx1p4p13.Cjt4Bka4veEHzTlKaG9VrmaH3xHA.K9XJ01jt8p9XHdAlc.U2FwwAg0CQb_4DU7KPcrEWQO4.jFgZd576MC9rP1Ei0wvYLYjB8GOfTAsteHYSpvXhXqlJcKfhoKXPf5uNNqapgUbgdafJeJV168ZeVbUwRgkpcJf7NaLt.mvr74MS62eqkG4ezfDhq1_SJi6h3MM5Xu17gUQ559jk2QmG4f3lyksdn5ywqOhaFffXi.p_nTN0rxn_j60qolXXXgtWtsHbazzTZ7svAXAptiJul6xjNGBEyh3uiIpFCVRXR5H06PAjwHzAtdCyoqfqKpPgCTPgG1dyof3oXu77b0zac8HPdDA39pYMoGJ6SQV3hgi.1JX9A379POQJYGWptzL.jtZOqmJi7fvHLBJpBlNmFocxIixH7yataT4yz8L20_X2v_CeZPZtjYhcczMQAIkY5lyiujbsM4v7Q4hsQcZzFgtnjJSzkc88QM0jkdc1yq4blcp0uT.bXlc6_DQrwP8sB4U3SVdq1XeLRmcT6FqBMO7mhBdR7JkTf_X1HrgldoUp7tAs.f0RTk0TGR3jHXkRC4OxB0pFJ1T4X23NjFW8AmW7LaEp_nUCa6kb0No0bRlZ1fsFtF9UszRE.hQ4kskOFrqD5v9eRkkkO8RnctalVAhvNjesBSkLFoM0k3xmlkDlsuk6GM2knSTxc3n49e0wI.Vhsln65ZEyEpN_g_OeUjhe2Lhb5hA1uHMKqDDsjfsKOyOVDdP5FF1ZrLsT_lW5oMgGcVYQ6NrD_eufpSeyXkU7J67U1Z_lIxpjwUa6emWWywZLQVPk2yTKzYJGX4cBvnXm.8HjJox_2.EBnscVGmmjPHKN9SS2Cgbfgkt1Wv_EziBSdyZuu4oL1gV7_CltFydvIl7xNthKUHCUXcJIUpUaBBIqS8nNw7L7aHsokZ8X29VTIhA6j4meLqHdhCglk07PJS.DO3zg5FrHNS9zk0SnnlRi9Wr2Xe7SWDNrecCt2.0FubAnJrD.ynrZXO1TrqnvKiKg.kcKtjMCzWxtkvpfNLPK4LFP9qYfqjAvKaPltCp_DE_oRuntChpoMr.Ij9wro6nAVuXW.V_tzeWc6icqvSBYZQAkR70e721aC981Vazf_PMxF2LuZW6QQK3wOows8gDMojrQo8ab2If3Absg3SCEjYIHhIEGlIZ.UCMZWwEgq0AtrulOh_X.6mdmX3ycfYv.gmZd9GGhAFAxLhjSParwi0eN52ynKQmuzHDKT8lXVLaB0VmM6HKzAnthlu5lR0SR8A6A9H9Se4JY1GxeXmW7MbdP8Bfg4KwrNBIvuVLuF.LLtN36G.aRSP5VwqkjCh9axqZlGxrO2ngot7N347ktNi1C2zSBDSIgDcjaVaPKblX.Jbp5KLmA9grb7zXZN2tNI61Lqp39ngsseAl.y0YtSF7pHg_wYKnm438.Jysa2neM_08w1Wa.tbXdT6IfU9rS9OlGaRWM7Rkd0OyxpXs.wG.0R")}${hasRabbitMirrorInteractionResetSnapshot(root) || hasMaintenancePreRepairSnapshot(root) || (typeof canRestoreIndependentSwipeInitial === 'function' && canRestoreIndependentSwipeInitial(root)) ? '' : 'disabled'}${__rmT("iA.fOgU1OCxuAENKokpDPijW9DK.mWYew8z65gpb.8bKkODDlYwjYrBLivBKdgBAD8YKWE7I0qnStNiRQnAqS6jfWtb2cCxMwcxR4xp4C27fEIaaoJPoLRyFhZHoOo5IruHwAEaInNNPTpgfNOcPDyJ.xft6NdDlHOIZCVU9a7Zv5RGNK.qQPwfMhdaFS5dnX7KsmxxDC5rJwdxM0WfgAbRrrEmw1Tahvb5Cdh2r7FAJ0sDRSQhz2J27CSdcW2VzZj98c31GbSBcdnUDC_IlRzmSMGnQ1iSrPYtXNPhxUWi70xx7ZY1p3OqStHCnxnLvvVnsJeKQrJY0OsBEZZ0_.sXlD5SiBsk8ErF.SxZlP.bxzo4ZbCCME7sRdQtYdHrx3VG69FYkDIZuqKsQTlZGlvGHibslJwpVIm8DK91u1SBQd15Qe4KanQpJiYzxQ47L44bD0mdOFeXboTzPveP0WHnEj4pgke7ilKHisVgpUzZr8GxxAzqMrpctRDDb_ueJNMlax2rEn8kiFgE.1pUlxlLqZjm_eOsmppIwP5bPOtVPZGmmhWdXTO95T_MiuZhz2kDBh2JyX8KzPKfF24yn7id03LXSffM0a9vTM0O8tRysMmdVaGDd5sYtYeg8ILyPMTYYn2gDCzo6I1ZQXopPcsv6pzmo3tMbOzDLG.Nugu5L8ICMgwWlXT2VmtYC4ScW4QCOgK3nHu0XAIZRKngQ.6KpIG6VWRdPfKPzR_Wq6olrTkaZ96WoSJXUUy5pQDt9I4DSaOnhITabe6QnlzNOGHUutew.MZ6fpMgwlGBwWm0_cl.IsF143M8c9856g3QnjL0v6_L7ifZ2evmC5i90EmYpUymM748QX4q70gApGBDmSGR1kkratOwXByqKF8YgEqFaxzd9Mb.pTPZotZ0YtAYzRwWPdtNnM0EAqnkCcwhrFY6uBCcNWxHTZ0SPNOPicGGtbTQY_rbeYUyDfwi2OxYltt0D.1zupE68TDQEQALA9L8w07TzmXhdpfpkRw1SaHAWOwbmuneq9gtzrgpL0eqQQIoo4ezyVZ.uWz2d6Bzo.bQRjPHYbwr6ucENr9xo7vucPRXqvGshC.orU4hl1VoaNZc_CGnXlp0J1ioYqieRPO04K3l66e7QRi0gKVxX1I4F9gjnveB06VGjsef9K0o_GzDGjQF4eK9WG_0c9YVc.ob30p2HT.RmSKAhI5ZWRn2QWNGUM8qPFX7P4O0eyPLPLmoDPrX4cLt4yGKgRmxFH3TJr8RpeR3XPmxp81.gUMvZXcAj83HzoCj4peairIL5ws_ycAZjJ1WnbYTy2d0SU0hoxvO04JTwK.ssOgvbVxgHBvUCjE4JP3ztnfd5yIBAr5mVX8nOXUo6THlvlAlXkVYkduBqy381DDH5fNR5sZN_82041GpSaijAEw.9vUecqTPnb_AeijpzfTa2eKSscygCyXInKq8IItQcw_speoVAxELGAwksBRNVWP5OIrfLdzRRQS6j32mHEGuBqvc9TIxYgwZMq_ZxR7geEMYgcy0OKPwHzsThOCVIoLneojOj8xkalTWE0KxbDo_mkYHJwwh3zIyK9g5Uh.s")}`;
    const recommendation = panel.querySelector('.rabbit-mirror-maintenance-recommendation');
    if (recommendation) {
        const state = button.getAttribute(MAINTENANCE_STATE_ATTR) || MAINTENANCE_STATES.idle;
        const reason = button.getAttribute(MAINTENANCE_REASON_ATTR) || '';
        const suggestion = getRabbitMirrorMaintenanceRecommendation(state, reason);
        recommendation.textContent = mergeMaintenanceProblemAndRecommendation(maintenanceMenuProblemText(state, reason), suggestion);
        if (suggestion)
            recommendation.setAttribute('data-rm-recommended-action', 'detected');
        recommendation.setAttribute('data-rm-maintenance-problem-text', 'true');
    }
    if (button?.getAttribute?.('data-rm-patrol-pending') === 'true' && recommendation) {
        const note = document.createElement('div');
        note.className = 'rabbit-mirror-maintenance-recommendation';
        note.setAttribute('data-rm-patrol-pending-note', 'true');
        note.textContent = __rmT("qaXA6Fm85N22moCe2javT3U9K.riJ7AHv8..uRsIlquClBdb7P3nG19Ie4URM76QhxaD.IyPSLF3A7TGv8GUOP92w04DUuqKPd4rd9VsNoOWSPUAOvFdiFwmh1M5uAEERRo4AJe.tYxa2LfF");
        recommendation.after(note);
    }
    let vsProblem = '';
    try {
        if (typeof describeVsImplementationProblem === 'function')
            vsProblem = describeVsImplementationProblem(getVsImplementationCheck(root));
    }
    catch {
        vsProblem = '';
    }
    if (vsProblem && recommendation) {
        const note = document.createElement('div');
        note.className = 'rabbit-mirror-maintenance-recommendation';
        note.setAttribute('data-rm-vs-check-note', 'true');
        note.textContent = `${__rmT("4OkI6ZKExHOStf")}${vsProblem}${__rmT("5ksVlUPJ8EpeEYxNJHX7RIj5IS1uS2SupyUAHSqRM4lSU4lfsfj_upHSnSlF2QDOOyxAnzlAY3Y")}`;
        recommendation.after(note);
    }
    document.body.appendChild(panel);
    const rect = button.getBoundingClientRect();
    const width = Math.min(300, Math.max(240, globalThis.innerWidth - 24));
    panel.style.width = `${width}px`;
    const left = Math.max(12, Math.min(rect.left, globalThis.innerWidth - width - 12));
    panel.style.left = `${left}px`;
    panel.style.top = `${Math.min(rect.bottom + 6, globalThis.innerHeight - panel.offsetHeight - 12)}px`;
    if (typeof fitMirrorToolPanel === 'function')
        fitMirrorToolPanel(panel, button, 340);
    panel.addEventListener('click', event => {
        const action = event.target?.closest?.('[data-rm-maintenance-action]')?.getAttribute('data-rm-maintenance-action');
        if (!action)
            return;
        event.preventDefault();
        event.stopPropagation();
        if (action === 'download-html') {
            downloadRabbitMirrorCurrentFaceHtml(root, event.target.closest('[data-rm-maintenance-action]'), panel);
            return;
        }
        if (action === 'copy-html') {
            void copyRabbitMirrorCurrentFaceHtml(root, event.target.closest('[data-rm-maintenance-action]'), panel);
            return;
        }
        if (action === 'close') {
            closeMaintenanceRabbitMenu();
            return;
        }
        if (['interaction', 'auto', 'patrol', 'text', 'source', 'style', 'all', 'narrow-width', 'reveal-clip'].includes(action)) {
            keepMaintenanceResultPanel(panel, root, button);
            watchMaintenanceResultPanel(button, Number(button?.getAttribute?.(MAINTENANCE_STATE_STAMP_ATTR)) || 0);
        }
        else
            closeMaintenanceRabbitMenu();
        if (!root?.isConnected || !button?.isConnected) {
            failMaintenanceRabbit(button, __rmT("I9NjYqAqH9.cATR93iYMWOIOnrbNiFcEIL5kmlm9Z1j61T"));
            return;
        }
        if (action === 'narrow-width') {
            void runMaintenanceNarrowFaceRepair(root, button);
            return;
        }
        if (action === 'reveal-clip') {
            runMaintenanceRevealClipRepair(root, button);
            return;
        }
        if (action === 'reset-interaction') {
            const repairRun = beginMaintenanceRepairRun(root, button);
            if (!repairRun)
                return;
            try {
                const restoreSwipe = globalThis.__rabbitMirrorIndependentActionsV1?.restoreInitial;
                if (typeof restoreSwipe === 'function' && restoreSwipe(root)) {
                    finishMaintenanceRepairRun(repairRun);
                    return;
                }
                if (!rejectOversizedMaintenanceRepair(root, button, __rmT("c7epqz3LDHr5dT"))) {
                    if (!restoreMaintenancePreRepairSnapshotAndForget(root, button))
                        restoreRabbitMirrorInteractionResetSnapshot(root, button);
                }
            }
            catch (error) {
                console.debug('[RabbitMirror] interaction reset failed:', error);
                failMaintenanceRabbit(button, __rmT("S6gUrRNEki9uFuBQeU_ceUxP9bHt8UuXGSNMBPcfc5EvQDAP"));
            }
            finally {
                finishMaintenanceRepairRun(repairRun);
            }
            return;
        }
        if (action === 'patrol') {
            patrolMaintenanceRabbit(root, button);
            return;
        }
        if (action === 'diagnostic') {
            triggerDiagnosticForMaintenanceRoot(root);
            return;
        }
        runMaintenanceUserRepair(root, button, action);
    }, true);
    bindMaintenanceOutsideClose(panel, button);
    return true;
}
export function handleMaintenanceRabbitClick(event, root, button) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    if (rabbitMirrorExternalGenerationNotice(root, 'maintenance'))
        return;
    const begin = globalThis.performance?.now?.() ?? Date.now();
    const waited = Number.isFinite(event?.timeStamp) && event.timeStamp > 0 && event.timeStamp <= begin ? Math.round(begin - event.timeStamp) : null;
    showMaintenanceRabbitMenu(root, button);
    const built = Math.round((globalThis.performance?.now?.() ?? Date.now()) - begin);
    const text = `${__rmT(".mOq0cc6")}${waited ?? '?'}${__rmT("zdAO1lT9s02D4n.GgPD")}${built}ms`;
    try {
        button.setAttribute('data-rm-menu-latency', text);
    }
    catch { }
    try {
        if (root)
            maintenanceMenuLatency.set(root, text);
    }
    catch { }
}
const maintenanceMenuLatency = new WeakMap();
export function maintenanceMenuLatencyFor(root) {
    for (let node = root; node; node = node.parentElement) {
        const value = maintenanceMenuLatency.get(node);
        if (value)
            return value;
    }
    for (const node of root?.querySelectorAll?.('toto, details') || []) {
        const value = maintenanceMenuLatency.get(node);
        if (value)
            return value;
    }
    return '';
}
function setImportantStyle(element, property, value) {
    if (!element?.style)
        return false;
    if (element.style.getPropertyValue(property) === value && element.style.getPropertyPriority(property) === 'important')
        return false;
    element.style.setProperty(property, value, 'important');
    return true;
}
function isTheaterFavoriteSurface(node) {
    return !!node?.closest?.('[data-rm-theater-favorite-host], [data-rm-theater-favorite-stage], [data-rm-theater-favorite-viewer], [data-rm-theater-favorite-library]');
}
function normalizeRabbitMirrorToolHost(host) {
    if (!host)
        return false;
    host.hidden = false;
    host.removeAttribute?.('aria-hidden');
    host.setAttribute(TOOL_ENTRY_HOST_ATTR, 'true');
    host.setAttribute(RUNTIME_VERSION_ATTR, RUNTIME_VERSION);
    host.setAttribute('role', 'group');
    host.setAttribute('aria-label', __rmT("8vfuqCi7aH8tCT"));
    const styles = {
        all: 'initial', display: 'inline-flex', 'align-items': 'center', 'justify-content': 'flex-start', gap: '2px',
        float: 'none', flex: '0 0 auto', position: 'relative',
        'z-index': '2147483000', width: 'auto',
        'min-width': 'max-content', height: 'auto', 'min-height': '0', 'max-width': 'none', 'max-height': 'none',
        margin: '0', 'margin-inline-start': '0', padding: '0',
        overflow: 'visible', visibility: 'visible', opacity: '1',
        'pointer-events': 'auto', transform: 'none', filter: 'none', clip: 'auto', 'clip-path': 'none',
        'white-space': 'nowrap', 'vertical-align': 'middle', color: 'inherit', font: 'inherit', 'line-height': '1',
        isolation: 'isolate',
    };
    let changed = false;
    for (const [property, value] of Object.entries(styles))
        changed = setImportantStyle(host, property, value) || changed;
    return changed;
}
export function normalizeRabbitMirrorToolButton(button) {
    if (!button)
        return false;
    button.hidden = false;
    button.disabled = false;
    button.removeAttribute?.('aria-hidden');
    button.tabIndex = 0;
    const styles = {
        all: 'initial', display: 'inline-flex', 'align-items': 'center', 'justify-content': 'center', position: 'relative',
        'z-index': '2147483001', flex: '0 0 auto', width: 'auto', 'min-width': '0', height: 'auto',
        'min-height': '20px', 'max-width': 'none', 'max-height': 'none', margin: '0', padding: '1px 3px', border: '0',
        'border-radius': '5px', background: 'transparent', color: 'inherit', font: 'inherit', 'font-size': '14px',
        'line-height': '1', 'text-indent': '0', 'letter-spacing': 'normal', 'white-space': 'nowrap', overflow: 'visible',
        visibility: 'visible', opacity: '.94', 'pointer-events': 'auto', cursor: 'pointer', transform: 'none', filter: 'none',
        clip: 'auto', 'clip-path': 'none', 'box-shadow': 'none', appearance: 'none', '-webkit-appearance': 'none',
        'touch-action': 'manipulation', '-webkit-tap-highlight-color': 'transparent',
    };
    let changed = false;
    for (const [property, value] of Object.entries(styles))
        changed = setImportantStyle(button, property, value) || changed;
    return changed;
}
export function containRabbitMirrorTitleToolFloat(summary) {
    if (!summary?.isConnected || typeof getComputedStyle !== 'function')
        return;
    const attr = 'data-rabbit-mirror-title-flow-end';
    let end = summary.querySelector(`:scope > [${attr}]`);
    if (summary.hasAttribute?.(TITLE_CHROME_ATTR)) {
        end?.remove();
        return;
    }
    const display = getComputedStyle(summary).display;
    const flow = ['block', 'list-item', 'flow-root', 'flow-root list-item', 'inline', 'inline-block'].includes(display);
    if (!flow && !end)
        return;
    if (!end) {
        end = summary.ownerDocument.createElement('span');
        end.setAttribute(attr, 'true');
        end.setAttribute('aria-hidden', 'true');
    }
    if (summary.lastElementChild !== end)
        summary.appendChild(end);
    const styles = { display: flow ? 'block' : 'none', position: 'static', float: 'none', clear: 'both', width: '0', height: '0',
        'min-width': '0', 'max-width': '0', 'min-height': '0', 'max-height': '0', margin: '0', padding: '0',
        border: '0', 'line-height': '0', 'font-size': '0', 'pointer-events': 'none', visibility: 'hidden' };
    for (const [property, value] of Object.entries(styles))
        setImportantStyle(end, property, value);
}
const TITLE_CHROME_SKIP = `[${TOOL_ENTRY_HOST_ATTR}], [data-rm-face-swipe-delete], [data-rm-face-swipe-host], [data-rm-face-swipe-bar], [data-rm-face-favorite-star], [data-rm-tool-menu-button], [${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [${RECIPE_BUTTON_ATTR}], [data-rabbit-mirror-title-flow-end]`;
function ensureMirrorTitleLabel(summary, host) {
    if (!summary?.querySelectorAll)
        return null;
    let label = summary.querySelector(`:scope > [${MIRROR_TITLE_LABEL_ATTR}]`);
    if (!label) {
        label = summary.ownerDocument.createElement('span');
        label.setAttribute(MIRROR_TITLE_LABEL_ATTR, 'true');
    }
    for (const node of [...summary.childNodes]) {
        if (node === label || node === host)
            continue;
        if (node.nodeType === 1 && node.matches?.(TITLE_CHROME_SKIP))
            continue;
        label.append(node);
    }
    if (host?.parentElement === summary) {
        if (label.parentElement !== summary || host.previousElementSibling !== label)
            summary.insertBefore(label, host);
    }
    else if (label.parentElement !== summary)
        summary.append(label);
    return label;
}
const WEB_FONT_FAMILIES = new Set(WEB_FONTS.map(font => font.family.toLowerCase()));
function withoutWebFonts(stack) {
    const parts = String(stack || '').split(',').map(item => item.trim()).filter(Boolean);
    const kept = parts.filter(item => !WEB_FONT_FAMILIES.has(item.replace(/^["']|["']$/g, '').trim().toLowerCase()));
    return kept.length === parts.length ? null : kept.join(', ');
}
function keepTitleOutOfWebFonts(summary, label) {
    const view = summary.ownerDocument?.defaultView;
    if (!view?.getComputedStyle)
        return;
    let stripped = false;
    for (const node of [summary, ...(label ? label.querySelectorAll('*') : [])]) {
        if (node !== summary && node.closest(TITLE_CHROME_SKIP))
            continue;
        const next = withoutWebFonts(view.getComputedStyle(node).fontFamily);
        if (next === null)
            continue;
        setImportantStyle(node, 'font-family', next || 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif');
        stripped = true;
    }
    if (stripped && (Number.parseInt(view.getComputedStyle(summary).fontWeight, 10) || 400) < 600)
        setImportantStyle(summary, 'font-weight', '700');
}
function ensureRabbitMirrorToolHost(summary) {
    if (!summary?.querySelectorAll)
        return null;
    ensureFeedbackCatRuntimeStyle();
    summary.setAttribute(TITLE_CHROME_ATTR, 'true');
    const hosts = [...summary.querySelectorAll(`:scope > [${TOOL_ENTRY_HOST_ATTR}]`)];
    let host = hosts.find(item => item.getAttribute(RUNTIME_VERSION_ATTR) === RUNTIME_VERSION) || hosts[0] || null;
    hosts.filter(item => item !== host).forEach(item => item.remove());
    if (!host) {
        host = document.createElement('span');
        summary.appendChild(host);
    }
    normalizeRabbitMirrorToolHost(host);
    const label = ensureMirrorTitleLabel(summary, host);
    try {
        keepTitleOutOfWebFonts(summary, label);
    }
    catch { }
    containRabbitMirrorTitleToolFloat(summary);
    if (summary) {
        setImportantStyle(summary, 'overflow', 'visible');
        setImportantStyle(summary, 'overflow-x', 'visible');
    }
    return host;
}
export function rabbitMirrorToolRootFromButton(button) {
    if (!button?.closest)
        return null;
    const toto = button.closest(MIRROR_TOTO_SELECTOR);
    if (toto && isInsideChatMessage(toto))
        return toto;
    const details = button.closest('details');
    if (details && isRabbitMirrorDetails(details) && isInsideChatMessage(details))
        return details;
    return null;
}
function ensureMaintenanceRabbitButton(root, summary, host) {
    const existing = [...summary.querySelectorAll?.(`[${MAINTENANCE_RABBIT_ATTR}]`) || []];
    let current = existing.find(button => button.getAttribute(RUNTIME_VERSION_ATTR) === RUNTIME_VERSION) || existing[0] || null;
    existing.filter(button => button !== current).forEach(button => button.remove());
    if (!current) {
        current = document.createElement('button');
        current.type = 'button';
        current.className = 'rabbit-mirror-maintenance-rabbit';
        current.setAttribute(MAINTENANCE_RABBIT_ATTR, 'true');
        current.setAttribute(MAINTENANCE_STATE_ATTR, MAINTENANCE_STATES.idle);
    }
    current.type = 'button';
    current.className = 'rabbit-mirror-maintenance-rabbit';
    current.setAttribute(MAINTENANCE_RABBIT_ATTR, 'true');
    current.setAttribute(RUNTIME_VERSION_ATTR, RUNTIME_VERSION);
    if (current.parentElement !== host)
        host.appendChild(current);
    const externalState = rabbitMirrorExternalGenerationState(root);
    if (externalState === 'loading') {
        setMaintenanceRabbitState(current, MAINTENANCE_STATES.checking, __rmT("RP6BSnkqrPaUQMXEUHgPMf"));
        current.setAttribute('data-rabbit-mirror-external-waiting', 'true');
    }
    else if (externalState === 'error') {
        setMaintenanceRabbitState(current, MAINTENANCE_STATES.unknown, __rmT("J8zSO0S1ax2JJoV0rniLpCM9egswPifcrVDKWVFIo.9sz3QfqBRfoqxIE8cgHJ3V"));
        current.removeAttribute('data-rabbit-mirror-external-waiting');
    }
    else {
        const wasWaiting = current.hasAttribute('data-rabbit-mirror-external-waiting');
        current.removeAttribute('data-rabbit-mirror-external-waiting');
        const languageBalance = rabbitMirrorLanguageBalance(root);
        const state = current.getAttribute(MAINTENANCE_STATE_ATTR) || MAINTENANCE_STATES.idle;
        const reason = current.getAttribute(MAINTENANCE_REASON_ATTR) || '';
        const preserveTechnicalState = state === MAINTENANCE_STATES.repairable
            || state === MAINTENANCE_STATES.unknown
            || state === MAINTENANCE_STATES.checking;
        if (languageBalance.foreignDominant && !preserveTechnicalState) {
            setMaintenanceRabbitState(current, MAINTENANCE_STATES.notice, `${languageBalance.reason}${__rmT("OLaqOfzQCCGn6fY1I3FsSFqwxxf")}`);
        }
        else if (wasWaiting) {
            setMaintenanceRabbitState(current, MAINTENANCE_STATES.idle, __rmT("pb7i424xS_xF5dILxndnDGuWycp9hx2veTE"));
        }
        else if (state === MAINTENANCE_STATES.notice && !languageBalance.foreignDominant) {
            setMaintenanceRabbitState(current, MAINTENANCE_STATES.idle, __rmT("iuPDNrWsaslw12UYrssOpgwp5O_USq5CYu2gZt05.e9aoj1BQZqE9Yeo"));
        }
        else {
            setMaintenanceRabbitState(current, state, reason);
        }
    }
    return current;
}
function stampFeedbackCatIndependentOwner(button, owner) {
    if (!button)
        return;
    const attributes = {
        rmFeedbackOwnerSource: owner ? 'independent' : '',
        rmFeedbackOwnerChat: String(owner?.chat || ''),
        rmFeedbackOwnerMesid: Number.isInteger(owner?.mesid) && owner.mesid >= 0 ? String(owner.mesid) : '',
        rmFeedbackOwnerSwipe: Number.isInteger(owner?.swipe) && owner.swipe >= 0 ? String(owner.swipe) : '',
        rmFeedbackOwnerKey: String(owner?.key || ''),
        rmFeedbackOwnerSourceHash: String(owner?.sourceHash || ''),
    };
    for (const [name, value] of Object.entries(attributes)) {
        if (value)
            button.dataset[name] = value;
        else
            delete button.dataset[name];
    }
}
function ensureFeedbackCatButton(root, summary, host) {
    const existing = [...summary.querySelectorAll?.(`[${FEEDBACK_CAT_ATTR}]`) || []];
    let current = existing.find(button => button.getAttribute(RUNTIME_VERSION_ATTR) === RUNTIME_VERSION) || existing[0] || null;
    existing.filter(button => button !== current).forEach(button => button.remove());
    if (!current)
        current = document.createElement('button');
    current.type = 'button';
    current.className = 'rabbit-mirror-feedback-cat';
    current.setAttribute(FEEDBACK_CAT_ATTR, 'true');
    current.setAttribute(RUNTIME_VERSION_ATTR, RUNTIME_VERSION);
    current.textContent = '🐈';
    const externalState = rabbitMirrorExternalGenerationState(root);
    current.title = externalState === 'loading'
        ? __rmT("b1J2hQ2CZWyQpB.wZhR8RLnXanB0Sq5Cah5w_xnJRbFQZl2slZmkHmuj") : feedbackCatButtonTitle();
    current.setAttribute('aria-label', current.title);
    if (externalState === 'loading')
        current.setAttribute('data-rabbit-mirror-external-waiting', 'true');
    else
        current.removeAttribute('data-rabbit-mirror-external-waiting');
    if (current.parentElement !== host)
        host.appendChild(current);
    stampFeedbackCatIndependentOwner(current, feedbackCatIndependentOwner(root));
    normalizeRabbitMirrorToolButton(current);
    return current;
}
function recipeButtonShouldBeVisible(recipe, blacklistState = getBlacklistState()) {
    return blacklistState?.enabled === true;
}
function mirrorTitleDisplayParts(texts, skip = new Set()) {
    const chars = texts.flatMap((node, part) => skip.has(part) ? [] : Array.from(node.data, char => ({ char, part })));
    const trim = () => {
        while (chars.length && /\s/u.test(chars[0].char))
            chars.shift();
        while (chars.length && /\s/u.test(chars[chars.length - 1].char))
            chars.pop();
    };
    const pairs = { [__rmT("nSk")]: __rmT("nvk"), '[': ']', [__rmT("uos")]: __rmT("BXs") };
    for (let pass = 0; pass < 8 && chars.length; pass += 1) {
        trim();
        if (!chars.length)
            break;
        if (pairs[chars[0].char] === chars[chars.length - 1].char) {
            chars.shift();
            chars.pop();
            continue;
        }
        const text = chars.map(item => item.char).join('');
        const brand = text.match(__rmR("VB_K6tNhiZOkH9iVvpKD5HMx_5Ec5DK..0DxLMZI.sMfu4nuypJ6S9oZ.irSUZw_df3IW5WxdZs7RPcROaTcyvu_IAP8Jz7oVoUz5rQg63YbC.YWnQdilQ6IMpLa6YhDIFmv05Url7m6iv0.BspYdYaC3jHe7lOyTzm5aGtGb8Gv5d432tG", "iu"));
        if (!brand)
            break;
        const decorationLength = Array.from(brand[1]).length;
        chars.splice(decorationLength, Array.from(brand[0]).length - decorationLength);
    }
    trim();
    let start = 0;
    while (start < chars.length && !pairs[chars[start].char] && /[\p{So}\p{Sk}\p{Sm}\s\u200d\ufe0f]/u.test(chars[start].char))
        start += 1;
    if (start < chars.length && pairs[chars[start].char]) {
        const open = chars[start].char, close = pairs[open];
        let depth = 0, end = -1;
        for (let index = start; index < chars.length; index += 1) {
            if (chars[index].char === open)
                depth += 1;
            else if (chars[index].char === close && --depth === 0) {
                end = index;
                break;
            }
        }
        const inner = end > start + 1 ? chars.slice(start + 1, end) : [];
        if (end > start && inner.some(item => !/\s/u.test(item.char))) {
            if (end === chars.length - 1)
                chars.pop();
            else {
                const closePart = chars[end].part;
                const sameText = chars.slice(end + 1).some(item => item.part === closePart && !/\s/u.test(item.char));
                if (sameText) {
                    chars[end] = { char: '·', part: closePart };
                    while (end + 1 < chars.length && /\s/u.test(chars[end + 1].char))
                        chars.splice(end + 1, 1);
                }
                else
                    chars.splice(end);
            }
            chars.splice(start, 1);
        }
    }
    trim();
    if (!chars.length)
        return null;
    const display = texts.map(() => '');
    for (const { char, part } of chars)
        display[part] += char === '•' ? '·' : char;
    display[chars[0].part] = `${__rmT("HAY3cp3bBcuStf")}${display[chars[0].part]}`;
    display[chars[chars.length - 1].part] += __rmT("nvk");
    return display;
}
const MIRROR_TITLE_EXTRA_ATTR = 'data-rabbit-mirror-title-extra';
function markMirrorTitleExtras(summary, texts, display) {
    summary.querySelectorAll?.(`[${MIRROR_TITLE_EXTRA_ATTR}]`).forEach(node => node.removeAttribute(MIRROR_TITLE_EXTRA_ATTR));
    if (!display)
        return;
    const dropped = new Set(texts.filter((node, index) => !display[index] && /\S/u.test(node.data)));
    if (!dropped.size)
        return;
    const shown = texts.filter((node, index) => display[index] && /\S/u.test(display[index]));
    for (const node of dropped) {
        let target = null;
        for (let element = node.parentElement; element && element !== summary; element = element.parentElement) {
            if (element.hasAttribute(MIRROR_TITLE_LABEL_ATTR))
                break;
            if (shown.some(text => element.contains(text)))
                break;
            if (!element.hasAttribute(MIRROR_TITLE_SOURCE_ATTR) && !element.hasAttribute(MIRROR_TITLE_PART_ATTR))
                target = element;
        }
        target?.setAttribute(MIRROR_TITLE_EXTRA_ATTR, 'true');
    }
}
function trailingTitleBadges(summary, texts) {
    const skip = new Set();
    const first = texts.findIndex(node => /\S/u.test(node.data));
    if (first < 0)
        return skip;
    const badgeOf = node => {
        for (let element = node.parentElement; element && element !== summary; element = element.parentElement) {
            if (element.hasAttribute(MIRROR_TITLE_LABEL_ATTR))
                return null;
            if (element.contains(texts[first]))
                return null;
            if (/(?:^|;)\s*(?:background(?:-color)?|border(?:-radius)?|padding)\s*:/i.test(element.getAttribute('style') || ''))
                return element;
        }
        return null;
    };
    for (let index = texts.length - 1; index > first; index -= 1) {
        if (!/\S/u.test(texts[index].data)) {
            skip.add(index);
            continue;
        }
        if (!badgeOf(texts[index]))
            break;
        skip.add(index);
    }
    for (const index of [...skip])
        if (!/\S/u.test(texts[index].data))
            skip.delete(index);
    return skip;
}
function ensureMirrorTitleDisplay(summary) {
    if (!summary?.childNodes || summary.childNodes.length > 256)
        return;
    const skip = `[${TOOL_ENTRY_HOST_ATTR}], [${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [${RECIPE_BUTTON_ATTR}], [${RESAY_ATTR}], [${MIRROR_TITLE_PREFIX_ATTR}], button, input, select, textarea, a, label, svg, style, script, template, noscript, [contenteditable], [role="button"], [role="link"], [data-rm-face-swipe-bar], [data-rm-face-favorite-star], [data-rm-face-swipe-delete]`;
    const texts = [];
    const stack = [...summary.childNodes].reverse();
    let visited = 0, length = 0;
    while (stack.length) {
        const node = stack.pop();
        if (++visited > 256)
            return;
        if (node.nodeType === 3) {
            length += node.data.length;
            if (length > 2048 || texts.length >= 64)
                return;
            texts.push(node);
        }
        else if (node.nodeType === 1 && !node.matches(skip)) {
            if (node.hidden || node.getAttribute('aria-hidden') === 'true')
                continue;
            if (visited + stack.length + node.childNodes.length > 256)
                return;
            stack.push(...[...node.childNodes].reverse());
        }
    }
    const display = mirrorTitleDisplayParts(texts, trailingTitleBadges(summary, texts));
    markMirrorTitleExtras(summary, texts, display);
    if (!display)
        return;
    const raw = texts.map(node => node.data).join('');
    const alreadyFormatted = display.join('') === raw;
    summary.querySelectorAll(`:scope > span[${MIRROR_TITLE_PREFIX_ATTR}]`).forEach(node => {
        if (!node.textContent)
            node.remove();
    });
    let styleReady = false;
    texts.forEach((node, index) => {
        const source = node.parentElement;
        let part = source?.hasAttribute(MIRROR_TITLE_SOURCE_ATTR)
            && source.parentElement?.hasAttribute(MIRROR_TITLE_PART_ATTR) ? source.parentElement : null;
        if (alreadyFormatted || display[index] === node.data) {
            if (part)
                part.replaceWith(node);
            return;
        }
        if (!part) {
            if (!styleReady) {
                ensureFeedbackCatRuntimeStyle();
                styleReady = true;
            }
            part = summary.ownerDocument.createElement('span');
            part.setAttribute(MIRROR_TITLE_PART_ATTR, 'true');
            const original = summary.ownerDocument.createElement('span');
            original.setAttribute(MIRROR_TITLE_SOURCE_ATTR, 'true');
            node.replaceWith(part);
            original.appendChild(node);
            part.appendChild(original);
        }
        if (part.getAttribute(MIRROR_TITLE_DISPLAY_ATTR) !== display[index]) {
            part.setAttribute(MIRROR_TITLE_DISPLAY_ATTR, display[index]);
        }
    });
}
function installExternalReferenceNote(details, recipe) {
    const settings = getSettings();
    syncExternalReferenceVisibility(settings);
    const existing = [...details.querySelectorAll(`:scope > [${EXTERNAL_REFERENCE_NOTE_ATTR}]`)];
    if (settings.externalWorldBookRandomEnabled !== true || !recipe?.hasExternalReferences) {
        existing.forEach(node => node.remove());
        return;
    }
    const sources = (Array.isArray(recipe.externalSources) ? recipe.externalSources : [])
        .filter(name => typeof name === 'string').slice(0, 24)
        .map(name => name.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200)).filter(Boolean);
    const text = sources.length ? `${__rmT("ZTGsCqMqQ4HxMbFeVpA")}${[...new Set(sources)].join(__rmT("jvk"))}` : __rmT("x2Lr5Ui_voEqaapVkz40NEU.sV9Z4H7pMOmpbfXxjw0cXKkq");
    const note = existing[0] || document.createElement('small');
    existing.slice(1).forEach(node => node.remove());
    if (note.getAttribute(EXTERNAL_REFERENCE_NOTE_ATTR) !== 'true')
        note.setAttribute(EXTERNAL_REFERENCE_NOTE_ATTR, 'true');
    if (note.textContent !== text)
        note.textContent = text;
    if (note.parentElement !== details || note !== details.lastElementChild)
        details.appendChild(note);
}
function removeRecipeButtonsFromSummary(summary) {
    if (!summary?.querySelectorAll)
        return 0;
    const existing = [...summary.querySelectorAll(`[${RECIPE_BUTTON_ATTR}]`)];
    existing.forEach(button => button.remove());
    if (existing.length)
        closeRecipeMenu();
    for (const host of summary.querySelectorAll(`:scope > [${TOOL_ENTRY_HOST_ATTR}]`)) {
        if (!host.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [${RECIPE_BUTTON_ATTR}], [${RESAY_ATTR}]`))
            host.remove();
    }
    return existing.length;
}
function ensureRecipeButton(root, summary, host, recipe = rabbitMirrorRecipeForRoot(root)) {
    const existing = [...summary.querySelectorAll?.(`[${RECIPE_BUTTON_ATTR}]`) || []];
    let current = existing.find(button => button.getAttribute(RUNTIME_VERSION_ATTR) === RUNTIME_VERSION) || existing[0] || null;
    existing.filter(button => button !== current).forEach(button => button.remove());
    if (!current)
        current = document.createElement('button');
    current.type = 'button';
    current.className = 'rabbit-mirror-recipe-button';
    current.setAttribute(RECIPE_BUTTON_ATTR, 'true');
    current.setAttribute(RUNTIME_VERSION_ATTR, RUNTIME_VERSION);
    current.textContent = '🎲';
    const faceDetails = summary?.closest?.('details');
    let selfFace = !!faceDetails?.hasAttribute?.('data-rm-self');
    if (!selfFace) {
        try {
            selfFace = JSON.parse(faceDetails?.getAttribute?.('data-rm-face-recipe') || 'null')?.samplingMode === 'self_invent';
        }
        catch {
            selfFace = false;
        }
    }
    current.title = selfFace ? __rmT("ic833kUXEEc6VL3CRuynCq2Ym1JOYuNtMviYAH1rCcKzDOTyk2qWTqXU_JYfR09X_XB") : recipeButtonTitle(recipe);
    current.setAttribute('aria-label', current.title);
    current.dataset.rmRecipeAvailable = recipe ? 'true' : 'false';
    if (current.parentElement !== host)
        host.appendChild(current);
    normalizeRabbitMirrorToolButton(current);
    return current;
}
function installRecipeButtonForRoot(root) {
    if (!isCurrentRuntime() || !root?.querySelector)
        return false;
    const details = root.matches?.('details') ? root : root.querySelector(':scope > details') || root.querySelector('details');
    const summary = details?.querySelector?.(':scope > summary') || details?.querySelector?.('summary');
    if (!summary)
        return false;
    ensureMirrorTitleDisplay(summary);
    const recipe = rabbitMirrorRecipeForRoot(root, true);
    installExternalReferenceNote(details, recipe);
    if (!recipeButtonShouldBeVisible(recipe, getBlacklistState()) && !details?.hasAttribute?.('data-rm-self')) {
        removeRecipeButtonsFromSummary(summary);
        return true;
    }
    const host = ensureRabbitMirrorToolHost(summary);
    if (!host)
        return false;
    ensureRecipeButton(root, summary, host, recipe);
    return true;
}
export function installMaintenanceRabbitForRoot(root) {
    if (!isCurrentRuntime() || !root?.querySelector)
        return false;
    clearOrphanedStructuredStaticDisclosureArtifacts(root);
    const details = root.matches?.('details') ? root : root.querySelector(':scope > details') || root.querySelector('details');
    const summary = details?.querySelector?.(':scope > summary') || details?.querySelector?.('summary');
    if (!summary)
        return false;
    const host = ensureRabbitMirrorToolHost(summary);
    if (!host)
        return false;
    ensureMaintenanceRabbitButton(root, summary, host);
    return true;
}
function installFeedbackCatForRoot(root) {
    if (!isCurrentRuntime() || !root?.querySelector)
        return false;
    const details = root.matches?.('details') ? root : root.querySelector(':scope > details') || root.querySelector('details');
    const summary = details?.querySelector?.(':scope > summary') || details?.querySelector?.('summary');
    if (!summary)
        return false;
    const host = ensureRabbitMirrorToolHost(summary);
    if (!host)
        return false;
    ensureFeedbackCatButton(root, summary, host);
    return true;
}
function removeEmptyRabbitMirrorToolHosts(chatRoot = getChatRoot()) {
    chatRoot?.querySelectorAll?.(`[${TOOL_ENTRY_HOST_ATTR}]`)?.forEach(host => {
        if (!host.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [${RECIPE_BUTTON_ATTR}], [${RESAY_ATTR}]`))
            host.remove();
    });
}
export function removeMaintenanceRabbitsInChatDom() {
    const chatRoot = getChatRoot();
    chatRoot?.querySelectorAll?.(`[${MAINTENANCE_RABBIT_ATTR}]`)?.forEach(button => button.remove());
    removeEmptyRabbitMirrorToolHosts(chatRoot);
}
export function removeFeedbackCatsInChatDom() {
    const chatRoot = getChatRoot();
    chatRoot?.querySelectorAll?.(`[${FEEDBACK_CAT_ATTR}]`)?.forEach(button => button.remove());
    removeEmptyRabbitMirrorToolHosts(chatRoot);
    closeFeedbackCatMenu();
}
function beginHostWorkTiming(name) {
    let end;
    try {
        end = globalThis.__rabbitMirrorExternalDiag?.beginHostWork?.(name);
    }
    catch { }
    if (typeof end !== 'function')
        return null;
    return () => { try {
        end();
    }
    catch { } };
}
function loadMirrorImageModule() {
    if (!mirrorImageModule)
        mirrorImageModule = import('../imageUi.js?rmv=2.5.4').catch(error => { mirrorImageModule = null; throw error; });
    return mirrorImageModule;
}
function canRestoreIndependentSwipeInitial(root) {
    try {
        return !!globalThis.__rabbitMirrorIndependentActionsV1?.hasSwipeInitial?.(root);
    }
    catch {
        return false;
    }
}
function independentActionBridge() {
    return globalThis.__rabbitMirrorIndependentActionsV1;
}
function stopTitleToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
}
function favoriteStarIsOn(button) {
    return button?.classList?.contains('is-favorited') || button?.getAttribute('aria-pressed') === 'true';
}
function paintFavoriteStar(button, on) {
    if (!button)
        return;
    const next = !!on;
    if (button.dataset.rmFavoritePainted === String(next) && favoriteStarIsOn(button) === next && button.querySelector('svg'))
        return;
    button.dataset.rmFavoritePainted = String(next);
    button.classList.toggle('is-favorited', next);
    button.setAttribute('aria-pressed', next ? 'true' : 'false');
    button.title = next ? __rmT("XMAvlWhPaIyMIDZh") : __rmT("bM87IjPXFYA");
    button.setAttribute('aria-label', button.title);
    button.innerHTML = next
        ? '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 3.6 14.5 9l6 .5-4.6 4 1.4 5.9L12 16.8 6.7 19.4 8.1 13.5 3.5 9.5 9.5 9z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M12 4.2 14.2 9l5.3.4-4.1 3.5 1.3 5.2L12 15.7 7.3 18.1 8.6 12.9 4.5 9.4 9.8 9z"/></svg>';
}
function favoriteCaptureRootFromStar(star, fallbackRoot) {
    return rabbitMirrorToolRootFromButton(star)
        || star?.closest?.('details')
        || fallbackRoot;
}
function runFavoriteStarToggle(star, fallbackRoot, event) {
    stopTitleToggle(event);
    if (star.dataset.rmFavoriteBusy === 'true')
        return;
    const captured = captureTheaterFavoriteFromRoot(favoriteCaptureRootFromStar(star, fallbackRoot));
    if (!captured) {
        globalThis.toastr?.warning?.(__rmT("aVHrCsQUHQghsK2vp9Bv7dpFcpXuk7s2"));
        return;
    }
    const next = !favoriteStarIsOn(star);
    const seq = String((Number(star.dataset.rmFavoriteSeq) || 0) + 1);
    star.dataset.rmFavoriteSeq = seq;
    star.dataset.rmFavoriteBusy = 'true';
    star.dataset.rmFavoriteHydrate = String((Number(star.dataset.rmFavoriteHydrate) || 0) + 1);
    paintFavoriteStar(star, next);
    void toggleTheaterFavorite(captured, next ? 'add' : 'remove').then(result => {
        if (star.dataset.rmFavoriteSeq !== seq)
            return;
        paintFavoriteStar(star, result.favorited);
        globalThis.toastr?.success?.(result.already ? __rmT("X199sYw.yYVFNoo1ZZF5otP1lwp0J2v7adM.PrDBvYgnHFrGq8_") : result.favorited ? __rmT("2lXfwJHQRFWpAq2cq0IXfyjWbNs") : __rmT("qMRE4lB0DbRuFif1"));
    }).catch(error => {
        if (star.dataset.rmFavoriteSeq !== seq)
            return;
        paintFavoriteStar(star, !next);
        globalThis.toastr?.warning?.(String(error?.message || __rmT("h7zrkzu3rCFMsh")));
    }).finally(() => {
        if (star.dataset.rmFavoriteSeq === seq)
            delete star.dataset.rmFavoriteBusy;
    });
}
function installFavoriteStar(root, host, before) {
    let star = host.querySelector(':scope > [data-rm-face-favorite-star]');
    if (!star) {
        star = document.createElement('button');
        star.type = 'button';
        star.setAttribute('data-rm-face-favorite-star', 'true');
        star.className = 'rabbit-mirror-face-favorite-star';
    }
    if (!star.dataset.rmFavoriteWired) {
        star.dataset.rmFavoriteWired = 'true';
        star.addEventListener('pointerup', event => {
            if (event.button !== 0)
                return;
            star.dataset.rmFavoritePointer = '1';
            runFavoriteStarToggle(star, root, event);
            clearTimeout(star._rmFavoriteClickTimer);
            star._rmFavoriteClickTimer = setTimeout(() => delete star.dataset.rmFavoritePointer, 500);
        }, true);
        star.addEventListener('click', event => {
            stopTitleToggle(event);
            if (star.dataset.rmFavoritePointer) {
                delete star.dataset.rmFavoritePointer;
                return;
            }
            runFavoriteStarToggle(star, root, event);
        }, true);
        star.addEventListener('pointercancel', () => {
            delete star.dataset.rmFavoritePointer;
        }, true);
    }
    if (before?.parentElement === host)
        host.insertBefore(star, before);
    else
        host.append(star);
    if (star.dataset.rmFavoriteBusy === 'true')
        return star;
    if (!star.querySelector('svg'))
        paintFavoriteStar(star, false);
    const captured = captureTheaterFavoriteFromRoot(favoriteCaptureRootFromStar(star, root));
    if (!captured?.html)
        return star;
    const hydrate = String((Number(star.dataset.rmFavoriteHydrate) || 0) + 1);
    star.dataset.rmFavoriteHydrate = hydrate;
    void isTheaterFavoriteHtml(captured.html).then(on => {
        if (!star.isConnected || star.dataset.rmFavoriteBusy === 'true' || star.dataset.rmFavoriteHydrate !== hydrate)
            return;
        paintFavoriteStar(star, on);
    }).catch(() => { });
    return star;
}
function liveFaceSwipeView(root) {
    const bridge = independentActionBridge();
    if (bridge?.runtime !== RUNTIME_VERSION)
        return null;
    return bridge.swipeView?.(root) || fallbackFaceSwipeView();
}
function liveRootFor(root, node) {
    if (root?.isConnected)
        return root;
    if (!node?.isConnected)
        return null;
    const anchor = facePagerDetails(node) || node;
    const scope = node.closest?.('.mes') || node.ownerDocument || document;
    try {
        return getRenderedRabbitMirrorInteractionRoots(scope).find(candidate => candidate?.contains?.(anchor)) || null;
    }
    catch {
        return null;
    }
}
function multifaceFacesFor(node) {
    let face = facePagerDetails(node) || node?.closest?.('details') || null;
    while (face && !face.parentElement?.classList?.contains('rabbit-mirror-multiface-host')) {
        face = face.parentElement?.closest?.('details') || null;
    }
    if (!face)
        return null;
    const host = face.parentElement;
    const faces = [...host.children].filter(child => child.tagName === 'DETAILS').slice(0, 5);
    const index = faces.indexOf(face);
    return faces.length > 1 && index >= 0 ? { host, faces, index } : null;
}
function showMultifaceFaceLocally(host, faces, index) {
    const next = Math.max(0, Math.min(faces.length - 1, index));
    const previous = Math.max(0, Math.min(faces.length - 1, Number(host.dataset.rmFaceView) || 0));
    const carryOpen = previous !== next ? faces[previous]?.hasAttribute('open') : null;
    host.dataset.rmFaceView = String(next);
    faces.forEach((face, i) => {
        const current = i === next;
        if (current)
            face.setAttribute('data-rm-face-current', 'true');
        else
            face.removeAttribute('data-rm-face-current');
        if (!current)
            face.style.setProperty('display', 'none', 'important');
        else
            face.style.removeProperty('display');
        if (carryOpen !== null) {
            if (current && carryOpen)
                face.setAttribute('open', '');
            else
                face.removeAttribute('open');
        }
    });
    try {
        refreshRabbitMirrorToolsInScope(host);
    }
    catch { }
}
function faceSwipeViewFor(root, node) {
    const multiface = multifaceFacesFor(node);
    const view = liveFaceSwipeView(root);
    if (!multiface)
        return view;
    const overlay = view && view.count === multiface.faces.length ? view.overlay === true : false;
    return multifaceFacePagerView(multiface.faces.length, multiface.index, overlay);
}
function installFaceSwipeBar(root, host) {
    const view = faceSwipeViewFor(root, host);
    let bar = host.querySelector(':scope > [data-rm-face-swipe-bar]');
    if (!view) {
        bar?.remove();
        return null;
    }
    if (!bar) {
        bar = document.createElement('span');
        bar.setAttribute('data-rm-face-swipe-bar', 'true');
        bar.className = 'rabbit-mirror-face-swipe-bar';
        bar.innerHTML = __rmT("PEhh2X3qf32hPYwwAsuB1FyIQXXC0OGiubdZ6a4eTJgd_WgM.YSqQd0Op7e0Giw77_W4U8nLz9YEfGe97dT_Fb.Aa5BoXjiXG69LDgljkWHgruzGiJ4C9bnABu6PQb7VPfj0PWi.QmQk6UpdO1c.wzZqSDFtI0aEO9dAw9z1uVq3dw1C70WXeaX1va6WZj7lpCIPzq4mwLfna8hjtzae2PybP0ccLFeDt1B_VWCTxKGtcXCo6Cw3kseba_w2QBBl8bLy522mGQv3f755yyoJRyqMdo9_eFvTczfzcL2kzqwo0kgODr9E9lDWVVWOrSaOS44AmbVJd3fAwKfNNeePC4r_SKsgwfaiLTFPypZaFXgtP9arvvGSRNNjbO3JJK9ILq7_WfZ4drnSJtSEdwBqkfecMTO975OcBUVxNklAs4xcsz0cwwhfPF7TNG_nB0O16Ev0xvJIKz8AFc9B54i6jtueXbYoAXLEN3WhUeYROIXDTV8iXj3vhf");
        bar.addEventListener('click', event => {
            const action = event.target?.closest?.('[data-rm-face-swipe]')?.getAttribute('data-rm-face-swipe');
            if (!action)
                return;
            stopTitleToggle(event);
            const live = independentActionBridge();
            const liveRoot = liveRootFor(root, bar);
            const current = faceSwipeViewFor(liveRoot, bar);
            if (!current)
                return;
            const intent = faceSwipeBarIntent(current, action);
            const multiface = multifaceFacesFor(bar);
            if (intent.type === 'select' && multiface) {
                let switched = false;
                try {
                    switched = !!live?.selectSwipe?.(liveRoot, intent.index);
                }
                catch { }
                const shown = multiface.faces[intent.index];
                if (!switched || shown?.getAttribute('data-rm-face-current') !== 'true')
                    showMultifaceFaceLocally(multiface.host, multiface.faces, intent.index);
            }
            else if (intent.type === 'select')
                live?.selectSwipe?.(liveRoot, intent.index);
            else if (intent.type === 'resay')
                openRabbitMirrorResayChooser(liveRoot || root, event.target);
            else if (intent.type === 'delete')
                live?.deleteSwipe?.(liveRoot);
        }, true);
    }
    host.prepend(bar);
    bar.style.removeProperty('margin-inline-end');
    const label = bar.querySelector('[data-rm-face-swipe-label]');
    if (label)
        label.textContent = view.label;
    const prev = bar.querySelector('[data-rm-face-swipe="prev"]');
    const next = bar.querySelector('[data-rm-face-swipe="next"]');
    if (prev) {
        prev.disabled = !(view.canPrev || view.canResay);
        prev.title = view.canPrev ? __rmT("KlqvW0YQ") : (view.canResay ? __rmT("oiZK4EMgt8ANef") : __rmT("qMRcDLpGyXaLgNFV"));
        prev.setAttribute('aria-label', prev.title);
    }
    if (next) {
        next.disabled = !(view.canNext || view.canResay);
        next.title = view.canNext ? __rmT("K_qvW0YQ") : (view.canResay ? __rmT("oiZK4EMgt8ANef") : FACE_SWIPE_FULL_MESSAGE);
        next.setAttribute('aria-label', next.title);
    }
    bar.title = view.overlay ? __rmT("xS5vk_R9W3dO7JK.8iMWT4zKqcdsfJaL.xbaYT") : (view.full ? FACE_SWIPE_FULL_MESSAGE : __rmT("tyHSPfTFnD9.gM073ppYa.6JuFAFFNwxSV7VV1j4aEN1rYCG1fhRGJMo2yqRuDY0Qd6MrybTpxqQDmqmrO2W9f"));
    return view;
}
function installFaceSwipeDelete(root, host, view) {
    if (!host?.appendChild)
        return null;
    const scope = host.parentElement || host;
    const stale = [...(scope.querySelectorAll?.('[data-rm-face-swipe-delete]') || [])];
    let del = stale.find(node => node.parentElement === host) || stale[0] || null;
    stale.filter(node => node !== del).forEach(node => node.remove());
    if (!view) {
        del?.remove();
        return null;
    }
    if (!del) {
        del = document.createElement('button');
        del.type = 'button';
        del.setAttribute('data-rm-face-swipe-delete', 'true');
        del.textContent = '×';
    }
    if (!del.dataset.rmDeleteWired) {
        del.dataset.rmDeleteWired = 'true';
        del.className = 'rabbit-mirror-face-swipe-delete';
        del.addEventListener('click', event => {
            stopTitleToggle(event);
            const live = independentActionBridge();
            const liveRoot = liveRootFor(root, del);
            const current = faceSwipeViewFor(liveRoot, del);
            if (!current)
                return;
            const intent = faceSwipeBarIntent(current, 'delete');
            if (intent.type === 'delete')
                live?.deleteSwipe?.(liveRoot);
        }, true);
    }
    if (host.lastElementChild !== del)
        host.append(del);
    del.disabled = !view.canDelete;
    del.title = view.canDelete ? __rmT("75saSHzJw5wRkLFc7Ek") : (view.overlay ? __rmT("pJvtlw4cvcJJbsJouf7OEHwVsHXSRL88_YvCOob6.AhJCe.4eRf") : __rmT("3GBaSL1EWfgfua.OM0Fl81aW"));
    del.setAttribute('aria-label', del.title);
    return del;
}
function isPlaceholderMirrorRoot(root) {
    const details = root?.matches?.('details') ? root : root?.querySelector?.(':scope > details, details');
    return !!details?.classList?.contains('rabbit-mirror-external-placeholder')
        || !!details?.hasAttribute?.('data-rabbit-mirror-placeholder');
}
function installFaceTitleChrome(root, host) {
    const summary = host?.parentElement;
    const rabbit = host.querySelector(':scope > [data-rm-tool-menu-button]');
    if (isPlaceholderMirrorRoot(root))
        host.querySelectorAll(':scope > [data-rm-face-favorite-star]').forEach(node => node.remove());
    else
        installFavoriteStar(root, host, rabbit);
    host.querySelectorAll(':scope > [data-rm-face-swipe-bar]').forEach(node => node.remove());
    summary?.querySelectorAll?.(':scope > [data-rm-face-swipe-host]').forEach(node => node.remove());
    const view = installFaceSwipeBar(root, host);
    installFaceSwipeDelete(root, host, view);
    if (!view)
        removeFacePager(summary?.parentElement);
    else
        placeFacePager(summary?.parentElement, host, getSettings().facePagerPosition);
    if (isPlaceholderMirrorRoot(root))
        removeBottomCollapse(summary?.parentElement);
    else
        placeBottomCollapse(summary?.parentElement);
    if (summary)
        ensureMirrorTitleLabel(summary, host);
}
function stripTheaterFavoriteTitleChrome(scope) {
    if (!scope?.querySelectorAll)
        return;
    scope.querySelectorAll(`[${TOOL_ENTRY_HOST_ATTR}], [data-rm-face-swipe-host], [data-rm-face-swipe-bar], [data-rm-face-swipe-delete], [data-rm-face-favorite-star], [${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [${RECIPE_BUTTON_ATTR}], [data-rm-tool-menu-button]`).forEach(node => node.remove());
}
function mirrorFaceCanContinue(root) {
    const recipe = rabbitMirrorRecipeForRoot(root, true);
    if (recipe?.requestedPresentationMode === 'html' || recipe?.presentationMode === 'html')
        return false;
    if (recipe?.requestedPresentationMode === 'longtext' || recipe?.blankLongText === true || recipe?.presentationMode === 'text')
        return true;
    const details = root?.matches?.('details') ? root : root?.querySelector?.('details');
    if (!details)
        return false;
    const body = details.cloneNode(true);
    body.querySelectorAll(`summary, style, script, [data-rabbit-mirror-source-truncation-notice], ${TITLE_CHROME_SKIP}`).forEach(node => node.remove());
    if (body.querySelector?.('input, button, select, textarea'))
        return false;
    return String(body.textContent || '').replace(/\s+/g, '').length >= 80;
}
function installUnifiedMirrorTools(root) {
    const details = root.matches?.('details') ? root : root.querySelector(':scope > details') || root.querySelector('details');
    const summary = details?.querySelector(':scope > summary');
    if (!summary)
        return;
    if (isTheaterFavoriteSurface(root)) {
        stripTheaterFavoriteTitleChrome(root);
        void import('../materialTexture.js?rmv=2.5.4').then(module => { if (root.isConnected)
            module.applyMaterialTextures(root); }).catch(() => { });
        void import('../pixelSprites.js?rmv=2.5.4').then(module => { if (root.isConnected)
            module.applyPixelSprites(root); }).catch(() => { });
        void loadMirrorImageModule().then(module => { if (root.isConnected)
            return module.mountMirrorImage(root); }).catch(() => { });
        if (root.querySelector?.('[data-rm-draw-frame]')) {
            void import('../builtinImage.js?rmv=2.5.4').then(module => { if (root.isConnected)
                module.restoreSavedBuiltinImages(root); }).catch(() => { });
        }
        return;
    }
    void import('../materialTexture.js?rmv=2.5.4').then(module => { if (root.isConnected)
        module.applyMaterialTextures(root); }).catch(() => { });
    void import('../pixelSprites.js?rmv=2.5.4').then(module => { if (root.isConnected)
        module.applyPixelSprites(root); }).catch(() => { });
    const host = ensureRabbitMirrorToolHost(summary);
    const actions = [];
    if (roleColorFaces(root).length) {
        const mode = roleColorFaces(root).some(face => face.getAttribute('data-rm-color-variant') === 'mapped') ? 'original' : 'mapped';
        actions.push({ id: 'color-variant', label: mode === 'original' ? __rmT("p14X0sY7be5uI8ytQsspfdP7k8za9h") : __rmT("GkqqIprSkbm8eR.RN_YODai5"), run: () => {
                setRoleColorVariant(root, mode);
                installUnifiedMirrorTools(root);
            } });
        actions.push({ id: 'color-readability', label: __rmT("pjI20_Y7SjPJInLqBo9Sn223uBhffT"), run: () => {
                const result = inspectRoleColorReadability(root);
                const message = `${__rmT("b91q4Np3oo8vMlBq")}${result.checked}${__rmT("fiXlSXw1gGaI0sND966dHT")}${result.lowContrast}${__rmT("4JOZzN.oxcTtBUgGkPhfJRirP3tbcT")}${result.unverified}${__rmT("SzdKJ9WIY9bN4Ok4okH6gys63vXYWGNdzTS38cjiQMZI.hieJNSvu8pIzBG")}`;
                globalThis.toastr?.info?.(message, __rmT("b91q4ftbu77LzTRf"));
            } });
    }
    actions.push({ id: 'resay', label: __rmT("S9cRL4_psUJlZf"), run: (_event, opener) => openRabbitMirrorResayChooser(root, opener) });
    if (mirrorFaceCanContinue(root)) {
        actions.push({ id: 'continue', label: __rmT("iUQro5_pAPqOCT"), run: () => {
                void import('../independentApi/mount.js?rmv=2.5.4').then(module => module.continueIndependentLongText(root))
                    .catch(() => globalThis.toastr?.error?.(__rmT("zteBtWLdMKTdI0QJKVfNyflfVNd4xCaS7AWCamKq")));
            } });
    }
    const add = (attr, enabled, id, label, handler) => {
        const button = host.querySelector(`[${attr}]`);
        if (button && enabled)
            actions.push({ id, label, run: event => handler(event, root, button) });
        else if (button && !enabled)
            button.remove();
    };
    add(MAINTENANCE_RABBIT_ATTR, isMaintenanceRabbitEnabled(), 'maintenance', __rmT("pzNKhaFy8XO8ggQd"), handleMaintenanceRabbitClick);
    add(FEEDBACK_CAT_ATTR, isFeedbackCatEnabled(), 'feedback', __rmT("pzNvhaFytmjVk_cp"), handleFeedbackCatClick);
    add(RECIPE_BUTTON_ATTR, true, 'recipe', __rmT("p14C0sY7dDTSR0y6DwBQn8sQD2rMYT"), handleRecipeClick);
    actions.push({ id: 'image', label: __rmT("pzBrhCrTRFNQVOOO"), run: (_event, opener) => {
            const scope = root.closest?.('.mes') || root;
            void loadMirrorImageModule().then(module => {
                if (root.isConnected)
                    return module.openMirrorImagePanel(root, {
                        opener,
                        onClose: () => { if (scope.isConnected)
                            installMaintenanceRabbitsInScope(scope, { historyRestoreLight: true }); },
                    });
            })
                .catch(() => globalThis.toastr?.warning?.(__rmT("K9_LV87HBRK8aT5PZ2ApY1YuYGFcXtUi8Z2Z2paf.o_.QzQX")));
        } });
    actions.push({ id: 'theater-snapshot', label: __rmT("S9aXLn_pcQvcGk"), run: () => {
            void import('../theaterSnapshot.js?rmv=2.5.4').then(module => module.openTheaterSnapshot())
                .catch(error => globalThis.toastr?.warning?.(String(error?.message || __rmT("04JbbSyTQTe16rFC4DD"))));
        } });
    actions.push({ id: 'theater-favorite-library', label: __rmT("pzuEhaFyDbRuF.Ki"), run: () => {
            void import('../independentApi.js?rmv=2.5.4').then(module => openTheaterFavoriteLibrary((container, record) => module.hydrateIndependentFavoriteHtml(container, record)))
                .catch(error => globalThis.toastr?.warning?.(String(error?.message || __rmT("hGH3w0mkoBd6VjK_wMWpUT"))));
        } });
    actions.push({ id: 'face-health', label: __rmT("GhAUIYrSc7bq0BuX3ZCmm3Uu"), get hidden() { return getSettings().faceHealthInMenu !== true; }, run: () => {
            void import('../faceHealthUi.js?rmv=2.5.4').then(module => module.openFaceHealthReport({ limit: 30 }))
                .catch(error => globalThis.toastr?.warning?.(`${__rmT("lNIDiwwBdGYE1yy6O9m_Lk")}${String(error?.message || error || '')}`));
        } });
    actions.push({ id: 'name-mask', get label() { return isNameMaskActive() ? __rmT("GfAjIYrSkvyi2KxOriGmAIOQ") : __rmT("LPYNTiteZz_ua0cu4sG"); }, run: () => {
            const result = toggleNameMask({ extra: ctx => nameMaskRulesFor(getSettings(), nameMaskCardKey(ctx)) });
            if (result.blocked)
                return;
            if (result.active)
                globalThis.toastr?.info?.(`${__rmT("tVysVc5jHKG")}${result.count}${__rmT("bI8I.UQD225x1AHsSIbrNHJrL0PkaK5Rz2vRGm0mrQDfrIgPJUDNeJQU9v8shz1TtBTZkFF89VvoGB6JoA.aRCbDAKHOJ.pwl0saLSdCvY9ZKk7C6mYTfZjgXd73Tv2Tu7A32JdwIHCznfYyXuM7VpT8ZxY")}`, __rmT("s8jnckj6O9D"));
            else if (result.turnedOff)
                globalThis.toastr?.info?.(__rmT("jsjly8oG8sRRzC.eVnMQUeh79MNz5_ookQjIatKq"), __rmT("s8jnckj6O9D"));
            else
                globalThis.toastr?.warning?.(__rmT("A4ZnZv1OmOVgqB4PIt_AXmtbbYS4vR._.Df_gAmRKA9dE_NveU6KunUBsBCLnVVcc.y9fUl3od2oBa6JppOu8HWSCxcZ3HDKANA"), __rmT("s8jnckj6O9D"));
        } });
    installMirrorToolMenu(root, host, actions, () => {
        closeMaintenanceRabbitMenu();
        closeFeedbackCatMenu();
        closeRecipeMenu();
        closeRabbitMirrorResayChooser();
        mirrorImageModule?.then(module => module.closeMirrorImagePanel?.()).catch(() => { });
    });
    installFaceTitleChrome(root, host);
    void loadMirrorImageModule().then(module => { if (root.isConnected)
        return module.mountMirrorImage(root); })
        .catch(() => { });
    if (root.querySelector?.('[data-rm-draw-frame]')) {
        const drawNew = getSettings().builtinImageEnabled === true;
        void import('../builtinImage.js?rmv=2.5.4').then(module => {
            if (!root.isConnected)
                return;
            if (drawNew)
                module.fillBuiltinImageFrames(root);
            else
                module.restoreSavedBuiltinImages(root);
        }).catch(() => { });
    }
}
export function installMaintenanceRabbitsInScope(scope, options = {}) {
    const end = beginHostWorkTiming('maintenance.installScope');
    try {
        return installMaintenanceRabbitsInScopeCore(scope, options);
    }
    finally {
        end?.();
    }
}
function installMaintenanceRabbitsInScopeCore(scope, { allowGlobalRemoval = false, autoSafeForceCurrent = false, historyRestoreLight = false } = {}) {
    if (!isCurrentRuntime() || !scope?.querySelectorAll)
        return;
    const perfEnd = globalThis.__rabbitMirrorPerfDiag?.begin?.('maintenance.installScope', { allowGlobalRemoval: !!allowGlobalRemoval, historyRestoreLight: !!historyRestoreLight }, 8);
    pruneMirrorAnimationVisibility();
    const maintenanceEnabled = isMaintenanceRabbitEnabled();
    const feedbackEnabled = isFeedbackCatEnabled();
    if (allowGlobalRemoval && !maintenanceEnabled)
        removeMaintenanceRabbitsInChatDom();
    if (allowGlobalRemoval && !feedbackEnabled)
        removeFeedbackCatsInChatDom();
    getRenderedRabbitMirrorInteractionRoots(scope).forEach(root => {
        if (!isTheaterFavoriteSurface(root) && !isInsideChatMessage(root))
            return;
        try {
            noteDesktopZoomFace(root);
        }
        catch { }
        trackMirrorAnimations(root);
        try {
            const raw = getRawAssistantMessageForRenderedRoot(root);
            const selfDetails = root?.matches?.('details[data-rm-self]') ? root : root?.querySelector?.('details[data-rm-self]');
            if (selfDetails && !selfDetails.hasAttribute('data-rm-self-think')) {
                const think = parseAtmosphereThink(raw);
                if (think)
                    selfDetails.setAttribute('data-rm-self-think', think);
            }
            hideLeakedAtmosphereThink(root, raw);
        }
        catch { }
        try {
            installPressFeedback(root);
        }
        catch { }
        try {
            installRevealMotion(root);
        }
        catch { }
        try {
            installWebFonts(root);
        }
        catch { }
        try {
            installReadabilityPolish(root);
        }
        catch { }
        if (isTheaterFavoriteSurface(root))
            return;
        bindRabbitMirrorAvatarRoot(root);
        armRabbitMirrorFirstUseInteraction(root);
        bindRevealedInteractionMemory(root);
        tidyNativeToggles(root);
        wireOrphanStateClasses(root);
        bringOpenedStateToFront(root);
        unwrapDecorativeFrame(root);
        containBodyPositioning(root);
        try {
            tidyLooseMarkdown(root);
        }
        catch { }
        bridgeCrossParentChecked(root);
        hideSecondStateByDefault(root);
        wireInertPlayButtons(root);
        try {
            recordInteractionMethods(root.matches?.('details') ? root : root.querySelector?.('details'));
        }
        catch { }
        try {
            let fallbackAt = 0;
            try {
                const message = getAssistantMessageForRenderedRoot(root);
                fallbackAt = messageStampSeconds(message, Number.isInteger(message?.swipe_id) ? message.swipe_id : -1) * 1000;
            }
            catch {
                fallbackAt = 0;
            }
            recordSelfInventedForm(root.matches?.('details') ? root : root.querySelector?.('details'), { fallbackAt });
        }
        catch { }
        try {
            armVsImplementationCheck(root);
        }
        catch { }
        removeRabbitMirrorInteractionHomeControls(root);
        replayFollowMaintenanceRepair(root);
        try {
            clearLegacyRabbitMirrorAutoFrameArtifacts(root);
        }
        catch (error) {
            console.debug('[RabbitMirror] legacy frame palette cleanup skipped for one mirror:', error);
        }
        try {
            armNestedDetailsReplacementContainment(root);
            if (!allowGlobalRemoval && !historyRestoreLight)
                installNestedDetailsReplacementContainment(root);
        }
        catch (error) {
            console.debug('[RabbitMirror] nested details containment skipped for one mirror:', error);
        }
        if (maintenanceEnabled) {
            try {
                installMaintenanceRabbitForRoot(root);
                const maintenanceButton = root.querySelector?.(`[${MAINTENANCE_RABBIT_ATTR}]`);
                if (autoSafeForceCurrent && maintenanceButton) {
                    scheduleMaintenanceAutoSafeForRoot(root, maintenanceButton, { forceCurrent: true, delay: 720 });
                }
            }
            catch (error) {
                console.debug('[RabbitMirror] maintenance rabbit install recovered for one mirror:', error);
            }
        }
        if (maintenanceEnabled) {
            try {
                installMaintenanceAutoSafeOpenPatrol(root);
            }
            catch (error) {
                console.debug('[RabbitMirror] auto-safe open-patrol binding skipped for one mirror:', error);
            }
        }
        if (maintenanceEnabled) {
            try {
                installMaintenanceHorizontalClipOpenRescue(root);
            }
            catch (error) {
                console.debug('[RabbitMirror] horizontal clip open-rescue binding skipped for one mirror:', error);
            }
        }
        if (feedbackEnabled) {
            try {
                installFeedbackCatForRoot(root);
            }
            catch (error) {
                console.debug('[RabbitMirror] feedback cat install recovered for one mirror:', error);
            }
        }
        try {
            installRecipeButtonForRoot(root);
        }
        catch (error) {
            console.debug('[RabbitMirror] recipe button install recovered for one mirror:', error);
        }
        if (typeof installUnifiedMirrorTools === 'function')
            installUnifiedMirrorTools(root);
        if (!historyRestoreLight)
            scheduleCurrentHighConfidenceTextRepair(root);
    });
    if (feedbackEnabled)
        updateFeedbackCatButtonTitles(scope);
    perfEnd?.();
}
function installMaintenanceRabbitsInChatDom() {
    const chatRoot = getChatRoot();
    if (!chatRoot)
        return;
    pruneMaintenanceAutoSafeOpenBindings();
    installMaintenanceRabbitsInScope(chatRoot, {
        allowGlobalRemoval: true,
    });
}
export function cancelStartupMaintenanceHistoryInstall() {
    if (startupMaintenanceInstallTimer)
        clearTimeout(startupMaintenanceInstallTimer);
    startupMaintenanceInstallTimer = 0;
    startupMaintenanceInstallQueue = [];
    try {
        startupMaintenanceVisibilityObserver?.disconnect?.();
    }
    catch { }
    startupMaintenanceVisibilityObserver = null;
    if (startupMaintenanceFallbackRoot && startupMaintenanceFallbackHandler) {
        try {
            startupMaintenanceFallbackRoot.removeEventListener('scroll', startupMaintenanceFallbackHandler, false);
        }
        catch { }
        try {
            startupMaintenanceFallbackRoot.removeEventListener('pointerdown', startupMaintenanceFallbackHandler, true);
        }
        catch { }
        try {
            startupMaintenanceFallbackRoot.removeEventListener('focusin', startupMaintenanceFallbackHandler, true);
        }
        catch { }
    }
    startupMaintenanceFallbackRoot = null;
    startupMaintenanceFallbackHandler = null;
}
export function installMaintenanceRabbitsDeferredInChatDom() {
    const chatRoot = getChatRoot();
    if (!chatRoot)
        return;
    cancelStartupMaintenanceHistoryInstall();
    if (isRabbitMirrorManagedChatSurface()) {
        installManagedRabbitMirrorTools();
        return;
    }
    pruneMaintenanceAutoSafeOpenBindings();
    const visited = new WeakSet();
    const install = root => {
        if (!root?.isConnected || visited.has(root))
            return;
        installMaintenanceRabbitsInScope(root, {
            historyRestoreLight: true,
        });
        visited.add(root);
    };
    const recent = [];
    for (let node = chatRoot.lastElementChild; node && recent.length < 6; node = node.previousElementSibling) {
        if (node.matches?.('.mes[mesid], [mesid].mes'))
            recent.push(node);
    }
    globalThis.__rabbitMirrorPerfDiag?.mark?.('maintenance.startupDeferred', { bounded: true, immediate: recent.length });
    for (const root of recent.reverse())
        install(root);
    const trackAll = () => {
        if (!isCurrentRuntime() || !chatRoot.isConnected)
            return;
        try {
            for (const root of getRenderedRabbitMirrorInteractionRoots(chatRoot))
                if (!isTheaterFavoriteSurface(root))
                    trackMirrorAnimations(root);
        }
        catch (error) {
            console.debug('[RabbitMirror] animation visibility tracking skipped:', error);
        }
    };
    if (typeof globalThis.requestIdleCallback === 'function')
        globalThis.requestIdleCallback(trackAll, { timeout: 3000 });
    else
        setTimeout(trackAll, 800);
    let queued = false;
    const probe = event => {
        const direct = event?.target?.closest?.('.mes[mesid], [mesid].mes');
        if (direct && chatRoot.contains?.(direct)) {
            install(direct);
            return;
        }
        if (queued)
            return;
        queued = true;
        startupMaintenanceInstallTimer = setTimeout(() => {
            startupMaintenanceInstallTimer = 0;
            queued = false;
            if (!isCurrentRuntime())
                return;
            const box = chatRoot.getBoundingClientRect?.();
            if (!box || typeof document.elementsFromPoint !== 'function')
                return;
            const x = Math.max(box.left + 1, Math.min(box.right - 1, box.left + box.width / 2));
            const roots = new Set();
            for (const y of [box.top + 8, box.top + box.height / 2, box.bottom - 8]) {
                for (const element of document.elementsFromPoint(x, y) || []) {
                    const root = element?.closest?.('.mes[mesid], [mesid].mes');
                    if (root && chatRoot.contains?.(root))
                        roots.add(root);
                    if (roots.size >= 6)
                        break;
                }
                if (roots.size >= 6)
                    break;
            }
            for (const root of roots)
                install(root);
        }, 80);
    };
    startupMaintenanceFallbackRoot = chatRoot;
    startupMaintenanceFallbackHandler = probe;
    chatRoot.addEventListener('scroll', probe, { passive: true });
    chatRoot.addEventListener('pointerdown', probe, true);
    chatRoot.addEventListener('focusin', probe, true);
    probe();
}
export function refreshMaintenanceRabbits() {
    installMaintenanceRabbitsInChatDom();
}
export function refreshFeedbackCats() {
    installMaintenanceRabbitsInChatDom();
}
export function refreshRecipeButtons() {
    installMaintenanceRabbitsInChatDom();
}
const ORPHAN_STATE_NAME = /(?:^|-)(?:flipped|flip|active|open|opened|show|shown|reveal|revealed|lit|playing|expanded|turned|toggled|selected|on|pressed|clicked|started|done|checked|recording|broadcasting|spinning|glowing|ringing|shaking|pulsing|flashing|listening|streaming|charging|counting|ticking|burning|boiling|lighting|igniting|unlocked|activated|triggered|powered|burned|burnt|scorched|ignited|unfolded|unsealed|torn|peeled|stamped|decoded|deciphered)$/i;
export const orphanStateNameMatches = name => ORPHAN_STATE_NAME.test(String(name || ''));
function orphanStatePairs(root) {
    const pairs = new Map();
    for (const style of root.querySelectorAll('style')) {
        const css = String(style.textContent || '').replace(/\{[^{}]*\}/g, '{}');
        for (const selector of css.split(/[{},]/)) {
            const tail = selector.trim().split(/[\s>+~]+/).pop() || '';
            const classes = [...tail.matchAll(/\.([\w-]+)/g)].map(match => match[1]);
            if (classes.length < 2 || /[:[]/.test(tail))
                continue;
            const state = classes[classes.length - 1];
            if (!ORPHAN_STATE_NAME.test(state))
                continue;
            const base = classes.slice(0, -1).join('.');
            if (!pairs.has(base))
                pairs.set(base, new Set());
            pairs.get(base).add(state);
        }
    }
    return pairs;
}
function ancestorOrphanStatePairs(root) {
    const pairs = new Map();
    for (const style of root.querySelectorAll('style')) {
        const css = String(style.textContent || '').replace(/\{[^{}]*\}/g, '{}');
        for (const selector of css.split(/[{},]/)) {
            const parts = selector.trim().split(/[\s>+~]+/).filter(Boolean);
            for (const compound of parts.slice(0, -1)) {
                const classes = [...compound.matchAll(/\.([\w-]+)/g)].map(match => match[1]);
                if (classes.length < 2 || /[:[]/.test(compound))
                    continue;
                const state = classes[classes.length - 1];
                if (!ORPHAN_STATE_NAME.test(state))
                    continue;
                const base = classes.slice(0, -1).join('.');
                if (!pairs.has(base))
                    pairs.set(base, new Set());
                pairs.get(base).add(state);
            }
        }
    }
    return pairs;
}
const isShown = node => { try {
    const style = getComputedStyle(node);
    return style.display !== 'none' && style.visibility !== 'hidden';
}
catch {
    return false;
} };
const ancestorOrphanTried = new WeakMap();
const ancestorOrphanWaiting = new WeakSet();
function wireAncestorOrphanStates(root) {
    let wired = 0;
    const face = root.matches?.('details') ? root : root.querySelector?.('details');
    if (face && !face.open) {
        if (!ancestorOrphanWaiting.has(face)) {
            ancestorOrphanWaiting.add(face);
            face.addEventListener('toggle', function retry() {
                if (!face.open)
                    return;
                face.removeEventListener('toggle', retry);
                ancestorOrphanWaiting.delete(face);
                try {
                    wireAncestorOrphanStates(root);
                }
                catch { }
            });
        }
        return 0;
    }
    if (!root.getClientRects?.().length || (typeof root.checkVisibility === 'function' && !root.checkVisibility()))
        return 0;
    const styleKey = [...root.querySelectorAll('style')].reduce((sum, style) => sum + String(style.textContent || '').length, 0);
    const faceText = String(root.textContent || '').length;
    for (const [base, states] of ancestorOrphanStatePairs(root)) {
        let hosts;
        try {
            hosts = [...root.querySelectorAll('.' + base.split('.').map(name => CSS.escape(name)).join('.'))];
        }
        catch {
            continue;
        }
        if (!hosts.length || hosts.length > 12)
            continue;
        for (const state of states) {
            let present = false;
            try {
                present = [...root.querySelectorAll('.' + CSS.escape(state))].some(node => node.getAttribute(ORPHAN_STATE_ATTR) !== state);
            }
            catch {
                present = true;
            }
            if (present)
                continue;
            for (const host of hosts) {
                if (host.closest?.(`[${TOOL_ENTRY_HOST_ATTR}]`) || isOrphanStateWired(host))
                    continue;
                const tried = ancestorOrphanTried.get(host);
                if (tried?.has(`${state}:${styleKey}`))
                    continue;
                const remember = () => { const set = ancestorOrphanTried.get(host) || new Set(); set.add(`${state}:${styleKey}`); ancestorOrphanTried.set(host, set); };
                if (!isShown(host) || host.matches('details') || host.querySelector('summary') || String(host.textContent || '').length > faceText * 0.6) {
                    remember();
                    continue;
                }
                const faint = node => { try {
                    return Number(getComputedStyle(node).opacity) < 0.1;
                }
                catch {
                    return false;
                } };
                const hidden = [...host.querySelectorAll('*')].filter(node => !isShown(node) || faint(node));
                if (!hidden.length) {
                    remember();
                    continue;
                }
                let revealed = [];
                const paused = hidden.map(node => [node, node.style.getPropertyValue('transition'), node.style.getPropertyPriority('transition')]);
                paused.forEach(([node]) => node.style.setProperty('transition', 'none', 'important'));
                host.classList.add(state);
                try {
                    revealed = hidden.filter(node => isShown(node) && !faint(node));
                }
                finally {
                    host.classList.remove(state);
                    paused.forEach(([node]) => { try {
                        void getComputedStyle(node).opacity;
                    }
                    catch { } });
                    paused.forEach(([node, value, priority]) => { if (value)
                        node.style.setProperty('transition', value, priority);
                    else
                        node.style.removeProperty('transition'); if (!node.getAttribute('style'))
                        node.removeAttribute('style'); });
                }
                if (!revealed.length) {
                    remember();
                    continue;
                }
                const buttons = [...host.querySelectorAll('button, [role="button"]')]
                    .filter(button => !revealed.some(node => node.contains(button)) && button.getClientRects().length && isShown(button));
                if (!buttons.length) {
                    let pointer = false;
                    try {
                        pointer = getComputedStyle(host).cursor === 'pointer';
                    }
                    catch {
                        pointer = false;
                    }
                    if (pointer && innerButtonIsFree(host) && attachOrphanStateToggle(host, state)) {
                        wired += 1;
                        continue;
                    }
                    remember();
                    continue;
                }
                if (buttons.length !== 1 || !innerButtonIsFree(buttons[0])) {
                    remember();
                    continue;
                }
                if (attachOrphanStateToggle(host, state, buttons[0]))
                    wired += 1;
            }
        }
    }
    return wired;
}
export function wireOrphanStateClasses(root) {
    if (!root?.querySelectorAll || root.querySelector?.('input[type="checkbox"], input[type="radio"]'))
        return 0;
    let wired = rearmOrphanStateWiring(root);
    for (const [base, states] of orphanStatePairs(root)) {
        let targets;
        try {
            targets = [...root.querySelectorAll('.' + base.split('.').map(name => CSS.escape(name)).join('.'))];
        }
        catch {
            continue;
        }
        if (!targets.length || targets.length > 12)
            continue;
        for (const state of states) {
            let present = false;
            try {
                present = [...root.querySelectorAll('.' + CSS.escape(state))].some(node => node.getAttribute(ORPHAN_STATE_ATTR) !== state);
            }
            catch {
                present = true;
            }
            if (present)
                continue;
            for (const target of targets) {
                if (target.closest?.(`[${TOOL_ENTRY_HOST_ATTR}]`) || isOrphanStateWired(target))
                    continue;
                if (attachOrphanStateToggle(target, state))
                    wired += 1;
            }
        }
    }
    try {
        wired += wireAncestorOrphanStates(root);
    }
    catch { }
    try {
        wired += wireAttributeCycleButtons(root);
    }
    catch { }
    try {
        wired += wireStateGroups(root, target => isOrphanStateWired(target));
    }
    catch { }
    return wired;
}
const FRONT_BOUND = new WeakSet();
function bringOpenedStateToFront(root) {
    if (!root?.addEventListener || FRONT_BOUND.has(root))
        return;
    FRONT_BOUND.add(root);
    let layer = 1000;
    root.addEventListener('change', event => {
        const input = event.target;
        if (!input?.matches?.('input[type="checkbox"], input[type="radio"]') || !input.checked)
            return;
        const host = input.parentElement;
        if (!host || host === root)
            return;
        let position = 'static';
        try {
            position = getComputedStyle(host).position;
        }
        catch { }
        if (position === 'static')
            return;
        layer += 1;
        host.style.setProperty('z-index', String(layer));
    }, true);
}
const FRAME_UNWRAPPED_ATTR = 'data-rm-unwrapped-frame';
const UNWRAP_RETRY = new WeakSet();
function isOpaqueBackground(style) {
    const color = String(style.backgroundColor || '');
    const image = String(style.backgroundImage || 'none');
    return (image && image !== 'none') || !/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/i.test(color);
}
function backgroundColors(style) {
    const text = `${style.backgroundImage || ''} ${style.backgroundColor || ''}`;
    return [...text.matchAll(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/g)].map(match => {
        const alphaText = match[4];
        const alpha = alphaText === undefined ? 1 : alphaText.endsWith('%') ? parseFloat(alphaText) / 100 : parseFloat(alphaText);
        return { r: +match[1], g: +match[2], b: +match[3], a: alpha };
    }).filter(color => color.a > 0);
}
function relativeLuminance({ r, g, b }) {
    const channel = value => { const v = value / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
function solidBody(style) {
    const image = String(style.backgroundImage || 'none');
    if (image && image !== 'none' && !/gradient/i.test(image))
        return true;
    const colors = backgroundColors(style);
    if (!colors.length)
        return isOpaqueBackground(style) && !/rgba|\/|oklch|color\(/i.test(String(style.backgroundColor || ''));
    return colors.some(color => color.a >= 0.85);
}
function framedBodyInside(node, depth = 0) {
    let style;
    try {
        style = getComputedStyle(node);
    }
    catch {
        return null;
    }
    if (isOpaqueBackground(style))
        return solidBody(style) ? { body: node, depth, style } : null;
    if (depth >= 2)
        return null;
    const visible = [...node.children].filter(child => {
        if (/^(STYLE|SCRIPT|TEMPLATE)$/.test(child.tagName))
            return false;
        try {
            return getComputedStyle(child).display !== 'none';
        }
        catch {
            return false;
        }
    });
    if (!visible.length)
        return null;
    const height = node.getBoundingClientRect?.().height || 0;
    if (height <= 0)
        return null;
    const sized = visible.map(child => ({ child, height: child.getBoundingClientRect?.().height || 0 }))
        .sort((a, b) => b.height - a.height);
    const main = sized[0];
    if (main.height < height * 0.7)
        return null;
    return framedBodyInside(main.child, depth + 1);
}
function sameToneBacking(outerStyle, bodyStyle) {
    const outer = backgroundColors(outerStyle), body = backgroundColors(bodyStyle);
    if (!outer.length || !body.length)
        return false;
    const average = colors => colors.reduce((sum, color) => sum + relativeLuminance(color), 0) / colors.length;
    const [light, dark] = [average(outer), average(body)].sort((x, y) => y - x);
    return (light + 0.05) / (dark + 0.05) < 1.6;
}
function thickContrastRim(style) {
    const fill = backgroundColors(style).filter(color => color.a >= 0.5);
    if (!fill.length)
        return false;
    const topWidth = /none|hidden/.test(style.borderTopStyle || '') ? 0 : parseFloat(style.borderTopWidth) || 0;
    if (topWidth >= 1)
        return false;
    const base = fill.reduce((sum, color) => sum + relativeLuminance(color), 0) / fill.length;
    let sides = 0;
    for (const side of ['Right', 'Bottom', 'Left']) {
        if ((parseFloat(style[`border${side}Width`]) || 0) < 4 || /none|hidden/.test(style[`border${side}Style`] || ''))
            continue;
        const [color] = backgroundColors({ backgroundColor: style[`border${side}Color`] });
        if (!color || color.a < 0.6)
            continue;
        const [light, dark] = [base, relativeLuminance(color)].sort((x, y) => y - x);
        if ((light + 0.05) / (dark + 0.05) >= 2.5)
            sides += 1;
    }
    return sides >= 2;
}
function unwrapDecorativeFrame(root) {
    if (!root?.querySelector || typeof getComputedStyle !== 'function')
        return;
    const details = root.matches?.('details') ? root : root.querySelector('details');
    if (!details)
        return;
    const wrapper = [...details.children].find(node => !/^(SUMMARY|STYLE|SCRIPT)$/.test(node.tagName));
    if (!wrapper || wrapper.tagName !== 'DIV' || wrapper.hasAttribute(FRAME_UNWRAPPED_ATTR))
        return;
    if (wrapper.hasAttribute('data-rm-visual-scenery'))
        return;
    const kids = [...wrapper.children].filter(node => !/^(STYLE|SCRIPT)$/.test(node.tagName));
    const directText = [...wrapper.childNodes].some(node => node.nodeType === 3 && node.textContent.trim());
    if (kids.length !== 1 || directText)
        return;
    let outer;
    try {
        outer = getComputedStyle(wrapper);
    }
    catch {
        return;
    }
    const padding = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].map(key => parseFloat(outer[key]) || 0);
    if (padding.filter(value => value >= 8).length < 2)
        return;
    if (!isOpaqueBackground(outer))
        return;
    if (thickContrastRim(outer))
        return;
    const found = framedBodyInside(kids[0]);
    const comparable = found && backgroundColors(outer).length && backgroundColors(found.style).length;
    if (found && (comparable ? !sameToneBacking(outer, found.style) : found.depth > 0))
        return;
    if (!found) {
        if (!details.open && !wrapper.getBoundingClientRect().height && !UNWRAP_RETRY.has(details)) {
            UNWRAP_RETRY.add(details);
            details.addEventListener('toggle', () => { if (details.open)
                unwrapDecorativeFrame(details); }, { once: true });
        }
        return;
    }
    wrapper.setAttribute(FRAME_UNWRAPPED_ATTR, 'true');
    for (const [property, value] of [['background', 'transparent'], ['padding', '0'], ['box-shadow', 'none'], ['border', '0'], ['border-radius', '0']]) {
        wrapper.style.setProperty(property, value, 'important');
    }
}
const BODY_CONTAINED_ATTR = 'data-rm-body-contained';
function containBodyPositioning(root) {
    if (!root?.querySelector || typeof getComputedStyle !== 'function')
        return;
    const details = root.matches?.('details') ? root : root.querySelector('details');
    if (!details)
        return;
    for (const body of [...details.children]) {
        if (/^(SUMMARY|STYLE|SCRIPT|TEMPLATE|LINK|META)$/.test(body.tagName) || body.hasAttribute(BODY_CONTAINED_ATTR))
            continue;
        let position = '';
        try {
            position = getComputedStyle(body).position;
        }
        catch {
            continue;
        }
        if (position !== 'static')
            continue;
        body.setAttribute(BODY_CONTAINED_ATTR, 'true');
        body.style.setProperty('position', 'relative');
    }
}
const XCHECK_BOUND = new WeakSet();
function splitCssBlocks(css) {
    const out = [];
    const text = String(css || '').replace(/\/\*[\s\S]*?\*\//g, '');
    const re = /([^{}@]+)\{([^{}]*)\}/g;
    let match;
    while ((match = re.exec(text)))
        out.push({ selectors: match[1].trim(), body: match[2].trim() });
    return out;
}
export function bridgeCrossParentChecked(root) {
    if (!root?.querySelector)
        return;
    const details = root.matches?.('details') ? root : root.querySelector('details');
    if (!details)
        return;
    const old = details.querySelector(':scope > style[data-rm-xchecked-bridge]');
    if (old?.getAttribute('data-rm-xchecked-bridge') === '2' && XCHECK_BOUND.has(details))
        return;
    if (old) {
        old.remove();
        for (const name of [...details.getAttributeNames()])
            if (/^data-rm-xchecked-\d+$/.test(name))
                details.removeAttribute(name);
    }
    const scope = details.getAttribute('data-rabbit-mirror-css-scope');
    const css = [...details.querySelectorAll('style')].map(style => style.textContent).join('\n');
    const bridges = new Map();
    const rules = [];
    for (const { selectors, body } of splitCssBlocks(css)) {
        if (!body || !selectors.includes(':checked'))
            continue;
        for (const raw of selectors.split(',')) {
            const match = raw.trim().match(/^(.*?)((?:input)?[.#][\w-]+):checked\s*([~+])\s*(.+)$/);
            if (!match || /:not\(/.test(match[0]))
                continue;
            const [, prefix, controlSel, combinator, rest] = match;
            let controls, targets;
            try {
                controls = [...details.querySelectorAll(controlSel)].filter(node => node.matches('input[type="checkbox"], input[type="radio"]'));
                targets = details.querySelectorAll(rest);
            }
            catch {
                continue;
            }
            if (!controls.length || !targets.length)
                continue;
            const first = rest.trim().split(/\s+|>/)[0];
            const tail = rest.trim().slice(first.length);
            const siblingHitFor = control => {
                try {
                    let node = control.nextElementSibling;
                    while (node) {
                        if (node.matches(first))
                            return true;
                        if (combinator === '+')
                            return false;
                        node = node.nextElementSibling;
                    }
                }
                catch {
                    return true;
                }
                return false;
            };
            if (controls.some(siblingHitFor))
                continue;
            let pairs = null;
            if (controls.length > 1) {
                let firstTargets = [];
                try {
                    firstTargets = [...details.querySelectorAll(first)];
                }
                catch {
                    firstTargets = [];
                }
                if (firstTargets.length !== controls.length)
                    continue;
                pairs = firstTargets;
            }
            const head = key => (scope && /data-rabbit-mirror-css-scope/.test(prefix)
                ? `[data-rabbit-mirror-css-scope="${scope}"][${key}]`
                : `details[${key}]`);
            controls.forEach((control, index) => {
                if (!bridges.has(control))
                    bridges.set(control, `data-rm-xchecked-${bridges.size + 1}`);
                const key = bridges.get(control);
                if (!pairs) {
                    rules.push(`${head(key)} ${rest}{${body}}`);
                    return;
                }
                pairs[index].setAttribute('data-rm-xchecked-pair', key);
                rules.push(`${head(key)} ${first}[data-rm-xchecked-pair="${key}"]${tail}{${body}}`);
            });
        }
    }
    if (!rules.length)
        return;
    const style = details.ownerDocument.createElement('style');
    style.setAttribute('data-rm-xchecked-bridge', '2');
    style.textContent = rules.join('\n');
    details.appendChild(style);
    const sync = () => { for (const [control, key] of bridges)
        details.toggleAttribute(key, !!control.checked); };
    sync();
    if (!XCHECK_BOUND.has(details)) {
        XCHECK_BOUND.add(details);
        details.addEventListener('change', sync, true);
    }
}
function secondStateRuleTooBroad(line) {
    const match = String(line || '').match(/^\s*(?:\[data-rabbit-mirror-css-scope="[^"]*"\]){1,2}\s+(.+?)\s*\{|^\s*details(?:\[open\])?\s+(.+?)\s*\{/);
    if (!match)
        return false;
    const sel = (match[1] || match[2] || '').trim();
    return !/[.#\[]/.test(sel);
}
function secondStateHidesOnlyTrigger(details, control, targets) {
    let label = control.closest?.('label') || null;
    if (!label && control.id) {
        try {
            label = details.querySelector(`label[for="${CSS.escape(control.id)}"]`);
        }
        catch {
            label = null;
        }
    }
    if (!label || !targets.some(node => label.contains(node)))
        return false;
    const hidden = node => {
        for (let el = node; el && el !== label.parentElement; el = el.parentElement) {
            if (targets.includes(el))
                return true;
            try {
                if (getComputedStyle(el).display === 'none')
                    return true;
            }
            catch {
                return true;
            }
        }
        return false;
    };
    const walker = details.ownerDocument.createTreeWalker(label, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node === control || control.contains(node))
            continue;
        const visual = node.nodeType === 3 ? /\S/.test(node.nodeValue || '') : /^(?:img|svg|canvas|video|picture)$/i.test(node.tagName || '');
        if (!visual)
            continue;
        if (!hidden(node.nodeType === 3 ? node.parentElement : node))
            return false;
    }
    return true;
}
function hideSecondStateByDefault(root) {
    if (!root?.querySelector || typeof getComputedStyle !== 'function')
        return;
    const details = root.matches?.('details') ? root : root.querySelector('details');
    if (!details)
        return;
    const existing = details.querySelector(':scope > style[data-rm-second-state-default]');
    if (existing) {
        const kept = String(existing.textContent || '').split('\n').filter(line => !secondStateRuleTooBroad(line));
        if (kept.length !== String(existing.textContent || '').split('\n').length) {
            if (kept.length)
                existing.textContent = kept.join('\n');
            else
                existing.remove();
        }
        return;
    }
    const scope = details.getAttribute('data-rabbit-mirror-css-scope');
    const css = [...details.querySelectorAll('style')].filter(style => !style.hasAttribute('data-rm-second-state-default'))
        .map(style => style.textContent).join('\n');
    const rules = [];
    const blocks = splitCssBlocks(css);
    const shownByDefault = new Set();
    for (const { selectors, body } of blocks) {
        if (/:checked/i.test(selectors) || !/display\s*:\s*(?!none)[a-z-]+/i.test(body))
            continue;
        for (const raw of selectors.split(',')) {
            try {
                for (const node of details.querySelectorAll(raw.trim()))
                    shownByDefault.add(node);
            }
            catch { }
        }
    }
    for (const { selectors, body } of blocks) {
        if (!/display\s*:\s*(?!none)[a-z-]+/i.test(body) || /display\s*:\s*none/i.test(body))
            continue;
        for (const raw of selectors.split(',')) {
            const match = raw.trim().match(/^(.*?)((?:input)?[.#\[][^\s:~+>]*?):checked\s*([~+])\s*(.+)$/);
            if (!match || /:not\(|::/.test(match[0]))
                continue;
            const [, prefix, controlSel, combinator, rest] = match;
            let control, targets, target, sibling = true;
            try {
                control = details.querySelector(controlSel);
            }
            catch {
                continue;
            }
            if (!control?.matches?.('input[type="checkbox"], input[type="radio"]') || control.checked)
                continue;
            try {
                target = `${controlSel}${combinator}${rest}`;
                targets = [...details.querySelectorAll(target)];
            }
            catch {
                targets = [];
            }
            if (!targets.length) {
                if (!/[.#\[]/.test(rest))
                    continue;
                try {
                    targets = [...details.querySelectorAll(rest)];
                }
                catch {
                    continue;
                }
                target = rest;
                sibling = false;
            }
            targets = targets.filter(node => !node.contains(control));
            if (!targets.length)
                continue;
            if (secondStateHidesOnlyTrigger(details, control, targets))
                continue;
            const visible = targets.filter(node => { try {
                return getComputedStyle(node).display !== 'none' && !shownByDefault.has(node);
            }
            catch {
                return false;
            } });
            if (!visible.length)
                continue;
            const scoped = scope && /data-rabbit-mirror-css-scope/.test(prefix);
            const head = sibling
                ? (scoped ? `[data-rabbit-mirror-css-scope="${scope}"]` : 'details')
                : (scoped ? `[data-rabbit-mirror-css-scope="${scope}"][data-rabbit-mirror-css-scope="${scope}"]` : 'details[open]');
            const rule = `${head} ${target}{display:none}`;
            if (!secondStateRuleTooBroad(rule))
                rules.push(rule);
        }
    }
    if (!rules.length)
        return;
    const style = details.ownerDocument.createElement('style');
    style.setAttribute('data-rm-second-state-default', 'true');
    style.textContent = [...new Set(rules)].join('\n');
    details.insertBefore(style, details.querySelector(':scope > summary')?.nextSibling || details.firstChild);
}
const PLAY_GLYPH = __rmR("qMGUreGvHYkO3dW7mkabI.vnehSjYaieTwANSuv3YrKXhQL02JAKXjKbewf2RTz_rHg4_CCfZ0ca8XI2TFPfjTSzKaUJFY9w3CoMZxPhsift9fFXXREVSf", "i");
const PLAY_LABEL = __rmR("ilR8RMVX0PFyOfMnuDSnfb2O1NOt.gv1dgeI.kwbZ28", "i");
const PLAYBACK_BOUND = new WeakSet();
function hasRunningAnimation(node) {
    const nodes = [node, ...node.querySelectorAll('*')].slice(0, 400);
    return nodes.some(item => {
        try {
            const style = getComputedStyle(item);
            return style.animationName && style.animationName !== 'none';
        }
        catch {
            return false;
        }
    });
}
function wireInertPlayButtons(root) {
    if (!root?.querySelectorAll || typeof getComputedStyle !== 'function')
        return;
    const details = root.matches?.('details') ? root : root.querySelector('details');
    if (!details)
        return;
    const candidates = [...details.querySelectorAll('button, [role="button"], span, div, a, i, b, em')].filter(node => {
        if (PLAYBACK_BOUND.has(node) || node.closest('summary, label, [data-rm-ui], [data-rabbit-mirror-tool-entry-host]'))
            return false;
        if ([...node.attributes].some(attr => /^data-rabbit-mirror-.*(?:rescue|program|repair)/i.test(attr.name)))
            return false;
        if (node.matches('[data-rm-flag-toggle], [data-rm-select-step], [data-rm-select-item], [data-rm-attr-cycle]'))
            return false;
        if (node.matches('input, label') || node.children.length > 1)
            return false;
        const text = String(node.textContent || '').replace(/\s+/g, '').trim();
        const aria = `${node.getAttribute('aria-label') || ''} ${node.getAttribute('title') || ''}`;
        return (text && text.length <= 4 && PLAY_GLYPH.test(text)) || (!text && PLAY_LABEL.test(aria));
    }).filter(node => !candidatesContain(node));
    if (!candidates.length)
        return;
    let style = details.querySelector(':scope > style[data-rm-playback-style]');
    for (const button of candidates) {
        let container = button.parentElement;
        while (container && container !== details && !hasRunningAnimation(container))
            container = container.parentElement;
        if (!container || !hasRunningAnimation(container))
            continue;
        if (!style) {
            style = details.ownerDocument.createElement('style');
            style.setAttribute('data-rm-playback-style', 'true');
            style.textContent = '[data-rm-playback="paused"],[data-rm-playback="paused"] *{animation-play-state:paused!important}';
            details.appendChild(style);
        }
        PLAYBACK_BOUND.add(button);
        if (!container.hasAttribute('data-rm-playback'))
            container.setAttribute('data-rm-playback', 'playing');
        const glyphOnly = !button.children.length && PLAY_GLYPH.test(String(button.textContent || '').trim());
        const paint = () => {
            const paused = container.getAttribute('data-rm-playback') === 'paused';
            button.setAttribute('aria-pressed', paused ? 'false' : 'true');
            if (glyphOnly)
                button.textContent = paused ? '▶' : '⏸';
        };
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
        button.style.cursor = 'pointer';
        const toggle = event => {
            if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ')
                return;
            event.preventDefault?.();
            event.stopPropagation?.();
            container.setAttribute('data-rm-playback', container.getAttribute('data-rm-playback') === 'paused' ? 'playing' : 'paused');
            paint();
        };
        button.addEventListener('click', toggle);
        button.addEventListener('keydown', toggle);
        paint();
    }
}
function candidatesContain(node) {
    const parent = node.parentElement;
    if (!parent)
        return false;
    const text = String(parent.textContent || '').replace(/\s+/g, '').trim();
    return parent.matches('button, [role="button"]') && PLAY_GLYPH.test(text);
}
function tidyNativeToggles(root) {
    if (!root?.querySelectorAll || typeof getComputedStyle !== 'function')
        return;
    const inputs = root.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    for (const input of inputs) {
        if (input.hasAttribute('data-rm-native-toggle'))
            continue;
        if (input.closest(`[${TOOL_ENTRY_HOST_ATTR}]`))
            continue;
        let style;
        try {
            style = getComputedStyle(input);
        }
        catch {
            continue;
        }
        const appearance = String(style.appearance || style.webkitAppearance || '').toLowerCase();
        const hiddenAlready = style.display === 'none' || style.visibility === 'hidden'
            || Number(style.opacity) < 0.05 || appearance === 'none'
            || parseFloat(style.width) <= 2 || parseFloat(style.height) <= 2;
        if (hiddenAlready)
            continue;
        const id = input.getAttribute('id');
        let labelled = false;
        if (id) {
            try {
                labelled = !!root.querySelector(`label[for="${CSS.escape(id)}"]`);
            }
            catch {
                labelled = false;
            }
        }
        const wrapper = input.closest('label');
        if (!labelled && wrapper && wrapper !== input && String(wrapper.textContent || '').trim())
            labelled = true;
        input.setAttribute('data-rm-native-toggle', labelled ? 'hidden' : 'styled');
    }
}
function stripNestedFaceChrome(scope) {
    for (const summary of [...scope.querySelectorAll(`summary[${TITLE_CHROME_ATTR}]`)]) {
        const details = summary.parentElement;
        const outer = details?.parentElement?.closest?.('details');
        if (!details?.matches?.('details') || !outer || isRabbitMirrorDetails(details) || !isRabbitMirrorDetails(outer))
            continue;
        summary.querySelectorAll(`:scope > [${TOOL_ENTRY_HOST_ATTR}]`).forEach(node => node.remove());
        summary.removeAttribute(TITLE_CHROME_ATTR);
        const label = summary.querySelector(`:scope > [${MIRROR_TITLE_LABEL_ATTR}]`);
        if (label)
            label.replaceWith(...label.childNodes);
    }
}
export function refreshRabbitMirrorToolsInScope(scope, { historyRestoreLight = false } = {}) {
    cleanupFacePagers(scope);
    cleanupBottomCollapses(scope);
    if (!scope?.querySelectorAll)
        return;
    try {
        stripNestedFaceChrome(scope);
    }
    catch { }
    repairRabbitMirrorScopedClassAliasesInScope(scope);
    if (!historyRestoreLight)
        repairLegacyMaintenanceMobileStateRows(scope);
    installMaintenanceRabbitsInScope(scope, { historyRestoreLight });
}
