import { rmT as __rmT } from "../textTable.js?rmv=2.5.0";
import { untrackMirrorAnimations, pruneMirrorAnimationVisibility, destroyMirrorAnimationVisibility } from '../animationVisibility.js?rmv=2.5.0';
import { disposeReadabilityPolish, pruneReadabilityPolish, destroyReadabilityPolish } from './readabilityPolish.js?rmv=2.5.0';
import { installDesktopFaceZoom, destroyDesktopFaceZoom } from '../desktopFaceZoom.js?rmv=2.5.0';
import { rabbitMirrorChatTapTarget } from './ttTapTarget.js?rmv=2.5.0';
import { scheduleRabbitMirrorComposerClearance } from '../composerClearance.js?rmv=2.5.0';
import { isRabbitMirrorManagedChatSurface, subscribeRabbitMirrorChatSurface } from '../hostCompatibility.js?rmv=2.5.0';
import { recordTtSurface, ttSurfaceNow, nextTtSurfaceClickSeq } from '../ttSurfaceDiagnostics.js?rmv=2.5.0';
import { getSettings } from '../settings.js?rmv=2.5.0';
import { getCurrentChatKey } from '../storage.js?rmv=2.5.0';
import { restoreRabbitMirrorAvatarClone } from '../chatAvatars.js?rmv=2.5.0';
import { RECIPE_RECORDED_EVENT } from '../blacklist.js?rmv=2.5.0';
import { EXTERNAL_REFERENCE_NOTE_ATTR, FEEDBACK_CAT_ATTR, FEEDBACK_CAT_RUNTIME_STYLE_ID, MAINTENANCE_RABBIT_ATTR, RECIPE_BUTTON_ATTR, RUNTIME_VERSION_ATTR, TOOL_ENTRY_HOST_ATTR, ensureFeedbackCatRuntimeStyle, getChatRoot, getRenderedRabbitMirrorInteractionRoots, hashInteractionSignature, isCurrentRuntime, isRabbitMirrorOuterChatDetails, } from './runtime.js?rmv=2.5.0';
import { getAvailableHostChat, getExternalOwnerMessageIndex, getRabbitMirrorSummaryText, getRawAssistantMessageForRenderedRoot, } from './scriptedInteractionRescue.js?rmv=2.5.0';
import { firstUseInteractionBindings } from './idsAndRearm.js?rmv=2.5.0';
import { FEEDBACK_CAT_MENU_ATTR, MAINTENANCE_AUTO_SAFE_ATTR, MAINTENANCE_AUTO_SAFE_RESULT_ATTR, MAINTENANCE_MENU_ATTR, MAINTENANCE_REASON_ATTR, MAINTENANCE_REPAIR_ATTR, MAINTENANCE_STATE_ATTR, RECIPE_MENU_ATTR, cancelCurrentHighConfidenceTextRepairs, failMaintenanceRabbit, maintenanceHighConfidenceTextRepairFrames, maintenancePreRepairSnapshots, rabbitMirrorInteractionResetSnapshots, removeAllInteractionDiagnosticPanels, scheduleCurrentHighConfidenceTextRepair, stripMaintenanceRabbitGlyphs, } from './diagnostics.js?rmv=2.5.0';
import { destroyRabbitMirrorCheckedSelectorRepair } from './checkedStateRescue.js?rmv=2.5.0';
import { cancelMaintenanceRepairRun, cancelMaintenanceRepairRuns, captureRabbitMirrorInteractionResetFromEventTarget, getRenderedMessageElement, maintenanceRepairRootBudget, rabbitMirrorInteractionRootFromTarget, rejectOversizedMaintenanceRepair, runMaintenanceSafeAutomaticRepairs, } from './maintenanceInspect.js?rmv=2.5.0';
import { decodeHtmlEntities } from './markup.js?rmv=2.5.0';
import { getRabbitMirrorFacePosition } from './layoutRescue.js?rmv=2.5.0';
import { cancelStartupMaintenanceHistoryInstall, closeFeedbackCatMenu, closeMaintenanceRabbitMenu, closeRecipeMenu, handleFeedbackCatClick, handleMaintenanceRabbitClick, handleRecipeClick, installMaintenanceRabbitsDeferredInChatDom, installMaintenanceRabbitsInScope, rabbitMirrorToolRootFromButton, removeFeedbackCatsInChatDom, removeMaintenanceRabbitsInChatDom, toolOutsideCloseOwners, } from './toolsChrome.js?rmv=2.5.0';
export let hostScriptModule = null;
let outputHostSubscriptions = [];
let recipeRecordedHandler = null;
export const TRANSIENT_RERENDER_REASONING_ENVELOPE_RE = /<\s*\/?\s*(?:thinking|think|analysis|reasoning|thought)\b[^>]*>/i;
let chatInstallObserver = null;
let chatRootReadyObserver = null;
let observedChatInstallRoot = null;
let chatInstallDebounceTimer = 0;
const pendingObservedMessageRoots = new Set();
let toolEntryDelegationRoot = null;
let toolEntryDelegatedClickHandler = null;
let toolEntryDelegatedPointerHandler = null;
let toolEntryDelegatedKeydownHandler = null;
let toolEntryDelegatedPointerUpHandler = null;
let toolEntryDelegatedPointerMoveHandler = null;
let toolEntryDelegatedPointerCancelHandler = null;
let ttOuterSummaryTapState = null;
let ttOuterSummaryDelayedClickSuppressions = new WeakMap();
let ttOuterSummaryMouseActivations = new WeakMap();
const TT_OUTER_SUMMARY_TAP_MAX_MS = 700;
const TT_OUTER_SUMMARY_TAP_MAX_MOVE_PX = 12;
const TT_OUTER_SUMMARY_DELAYED_CLICK_TTL_MS = 2200;
const TT_OUTER_SUMMARY_PENDING_POINTER_LIMIT = 64;
const maintenanceInstallTimers = new Set();
const maintenanceAutoSafePendingRoots = new Map();
const maintenanceAutoSafeBaselineSignatures = new Set();
let maintenanceAutoSafeAttemptedRoots = new WeakMap();
const maintenanceAutoSafeCurrentMessageTimers = new Map();
const maintenanceAutoSafeOpenBindings = new Map();
export const followMaintenanceRepairRecipes = new Map();
export const maintenanceRepairRunTokens = new Map();
export const maintenanceRepairActiveRuns = new Set();
export const maintenanceRepairRunRecords = new Map();
export const maintenanceRepairTimers = new Map();
let maintenanceAutoSafeReady = false;
let maintenanceAutoSafeStartupTimer = 0;
const managedOuterSummaryToggleFallbackPending = new WeakSet();
const managedOuterSummaryToggleIntents = new Map();
const MANAGED_OUTER_SUMMARY_INTENT_TTL_MS = 2500;
const MANAGED_OUTER_SUMMARY_INTENT_MAX = 24;
let managedRabbitMirrorToolsUnsubscribe = null;
export function getMessageIndexFromMirrorNode(node) {
    const externalIndex = getExternalOwnerMessageIndex(node);
    if (externalIndex >= 0)
        return externalIndex;
    const messageNode = node?.closest?.('.mes, [mesid], [data-message-id], [data-messageid]');
    if (!messageNode)
        return -1;
    const raw = messageNode.getAttribute('mesid')
        ?? messageNode.dataset?.messageId
        ?? messageNode.dataset?.messageid;
    const index = Number(raw);
    return Number.isInteger(index) && index >= 0 ? index : -1;
}
export function messageContainsReasoningEnvelope(message) {
    const candidates = [];
    const swipeIndex = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
    if (swipeIndex >= 0 && typeof message?.swipes?.[swipeIndex] === 'string')
        candidates.push(message.swipes[swipeIndex]);
    if (typeof message?.mes === 'string')
        candidates.push(message.mes);
    if (typeof message?.extra?.display_text === 'string')
        candidates.push(message.extra.display_text);
    return candidates.some(source => TRANSIENT_RERENDER_REASONING_ENVELOPE_RE.test(decodeHtmlEntities(source)));
}
export function messageUsesDistinctDisplaySource(message) {
    if (typeof message?.extra?.display_text !== 'string')
        return false;
    const displayText = decodeHtmlEntities(message.extra.display_text).trim();
    if (!displayText)
        return false;
    const swipeIndex = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
    const rawSource = swipeIndex >= 0 && typeof message?.swipes?.[swipeIndex] === 'string'
        ? message.swipes[swipeIndex]
        : message?.mes;
    if (typeof rawSource !== 'string')
        return false;
    return displayText !== decodeHtmlEntities(rawSource).trim();
}
function isMaintenanceAutoSafeEnabled() {
    const settings = getSettings();
    return settings.maintenanceRabbitEnabled !== false
        && settings.maintenanceRabbitAutoSafeEnabled === true
        && settings.maintenanceRabbitAutoSafeConsent === true;
}
function maintenanceAutoSafeSignature(root) {
    if (!root)
        return '';
    const chatKey = (() => {
        try {
            return String(getCurrentChatKey?.() || 'chat');
        }
        catch {
            return 'chat';
        }
    })();
    const messageIndex = getMessageIndexFromMirrorNode(root);
    const summary = stripMaintenanceRabbitGlyphs(getRabbitMirrorSummaryText(root)).replace(/🐈/g, '').trim();
    const source = getRawAssistantMessageForRenderedRoot(root) || root.outerHTML || root.textContent || '';
    return `${chatKey}:${messageIndex}:${hashInteractionSignature(`${summary}\n${source}`)}`;
}
function maintenanceAutoSafeLiveFingerprint(root, { budgetChecked = false } = {}) {
    if (!root?.querySelectorAll)
        return '';
    if (!budgetChecked && !maintenanceRepairRootBudget(root).ok)
        return '';
    let structural = '';
    try {
        const clone = root.cloneNode(true);
        restoreRabbitMirrorAvatarClone(root, clone);
        clone.querySelectorAll?.(`[data-rm-image-region], [data-rm-image-portal], [${EXTERNAL_REFERENCE_NOTE_ATTR}], [${TOOL_ENTRY_HOST_ATTR}], [${MAINTENANCE_MENU_ATTR}], [${FEEDBACK_CAT_MENU_ATTR}], [${RECIPE_MENU_ATTR}]`).forEach(node => node.remove());
        const volatile = new Set([
            RUNTIME_VERSION_ATTR,
            MAINTENANCE_AUTO_SAFE_ATTR,
            MAINTENANCE_AUTO_SAFE_RESULT_ATTR,
            MAINTENANCE_STATE_ATTR,
            MAINTENANCE_REASON_ATTR,
            MAINTENANCE_REPAIR_ATTR,
        ]);
        for (const node of [clone, ...(clone.querySelectorAll?.('*') || [])]) {
            for (const attribute of [...(node.attributes || [])]) {
                if (volatile.has(attribute.name))
                    node.removeAttribute(attribute.name);
            }
        }
        structural = String(clone.innerHTML || clone.outerHTML || '');
    }
    catch {
        structural = String(root.innerHTML || root.textContent || '');
    }
    const state = [...root.querySelectorAll('details, input, select, textarea')]
        .slice(0, 512)
        .map((node, index) => {
        if (node.matches?.('details'))
            return `d${index}:${node.open ? 1 : 0}`;
        if (node.matches?.('input[type="checkbox"], input[type="radio"]'))
            return `i${index}:${node.checked ? 1 : 0}:${node.disabled ? 1 : 0}`;
        if (node.matches?.('select'))
            return `s${index}:${Number(node.selectedIndex)}`;
        return `t${index}:${String(node.value || '').length}`;
    })
        .join('|');
    return hashInteractionSignature(`${structural}\n${state}`);
}
function maintenanceAutoSafeAttemptKey(root, sourceSignature = '', { budgetChecked = false } = {}) {
    const source = sourceSignature || maintenanceAutoSafeSignature(root);
    if (!source)
        return '';
    return `${source}:${maintenanceAutoSafeLiveFingerprint(root, { budgetChecked })}`;
}
function cancelMaintenanceAutoSafeCurrentMessageTimers() {
    for (const timer of maintenanceAutoSafeCurrentMessageTimers.values())
        clearTimeout(timer);
    maintenanceAutoSafeCurrentMessageTimers.clear();
}
function cancelMaintenanceAutoSafeTimers() {
    for (const [root, entry] of maintenanceAutoSafePendingRoots.entries()) {
        clearTimeout(entry.timer);
        if (root?.getAttribute?.(MAINTENANCE_AUTO_SAFE_ATTR) === 'pending')
            root.removeAttribute(MAINTENANCE_AUTO_SAFE_ATTR);
    }
    maintenanceAutoSafePendingRoots.clear();
    cancelMaintenanceAutoSafeCurrentMessageTimers();
    if (maintenanceAutoSafeStartupTimer)
        clearTimeout(maintenanceAutoSafeStartupTimer);
    maintenanceAutoSafeStartupTimer = 0;
}
function initializeMaintenanceAutoSafeStartupGuard() {
    cancelMaintenanceAutoSafeTimers();
    maintenanceAutoSafeBaselineSignatures.clear();
    maintenanceAutoSafeAttemptedRoots = new WeakMap();
    maintenancePreRepairSnapshots.clear();
    rabbitMirrorInteractionResetSnapshots.clear();
    maintenanceAutoSafeReady = false;
    if (!isMaintenanceAutoSafeEnabled())
        return;
    maintenanceAutoSafeStartupTimer = setTimeout(() => {
        maintenanceAutoSafeReady = true;
        maintenanceAutoSafeStartupTimer = 0;
    }, 1100);
}
export function configureMaintenanceAutoSafeMode(enabled) {
    cancelMaintenanceAutoSafeTimers();
    maintenanceAutoSafeBaselineSignatures.clear();
    maintenanceAutoSafeAttemptedRoots = new WeakMap();
    maintenanceAutoSafeReady = !!enabled;
}
export function scheduleMaintenanceAutoSafeForRoot(root, button, { forceCurrent = false, delay = 720 } = {}) {
    if (!isMaintenanceAutoSafeEnabled() || !root?.isConnected || !button?.isConnected)
        return false;
    if (rejectOversizedMaintenanceRepair(root, button, __rmT("GAHaAPbpwpG")))
        return false;
    const sourceSignature = maintenanceAutoSafeSignature(root);
    if (!sourceSignature)
        return false;
    if (!maintenanceAutoSafeReady) {
        if (!forceCurrent) {
            maintenanceAutoSafeBaselineSignatures.add(sourceSignature);
            return false;
        }
        const pending = maintenanceAutoSafePendingRoots.get(root);
        if (pending?.timer)
            clearTimeout(pending.timer);
        root.setAttribute(MAINTENANCE_AUTO_SAFE_ATTR, 'pending');
        const timer = setTimeout(() => {
            maintenanceAutoSafePendingRoots.delete(root);
            if (!root?.isConnected || !button?.isConnected)
                return;
            scheduleMaintenanceAutoSafeForRoot(root, button, { forceCurrent: true, delay: Math.min(420, Math.max(180, Number(delay) || 320)) });
        }, 1180);
        maintenanceAutoSafePendingRoots.set(root, { signature: `startup:${sourceSignature}`, timer });
        return true;
    }
    if (!forceCurrent && maintenanceAutoSafeBaselineSignatures.has(sourceSignature))
        return false;
    const attemptKey = maintenanceAutoSafeAttemptKey(root, sourceSignature, { budgetChecked: true });
    if (!attemptKey)
        return false;
    if (maintenanceAutoSafeAttemptedRoots.get(root) === attemptKey)
        return false;
    const pending = maintenanceAutoSafePendingRoots.get(root);
    if (pending?.signature === attemptKey)
        return false;
    if (pending?.timer)
        clearTimeout(pending.timer);
    root.setAttribute(MAINTENANCE_AUTO_SAFE_ATTR, 'pending');
    const timer = setTimeout(() => {
        maintenanceAutoSafePendingRoots.delete(root);
        if (!isMaintenanceAutoSafeEnabled() || !maintenanceAutoSafeReady)
            return;
        if (!root?.isConnected || !button?.isConnected)
            return;
        if (rejectOversizedMaintenanceRepair(root, button, __rmT("GAHaAPbpwpG")))
            return;
        const liveSourceSignature = maintenanceAutoSafeSignature(root);
        if (liveSourceSignature !== sourceSignature) {
            scheduleMaintenanceAutoSafeForRoot(root, button, { forceCurrent, delay: 260 });
            return;
        }
        const liveAttemptKey = maintenanceAutoSafeAttemptKey(root, liveSourceSignature, { budgetChecked: true });
        if (liveAttemptKey !== attemptKey) {
            scheduleMaintenanceAutoSafeForRoot(root, button, { forceCurrent, delay: 260 });
            return;
        }
        root.setAttribute(MAINTENANCE_AUTO_SAFE_ATTR, 'attempted');
        try {
            runMaintenanceSafeAutomaticRepairs(root, button);
        }
        catch (error) {
            console.debug('[RabbitMirror] auto-safe patrol failed:', error);
            failMaintenanceRabbit(button, __rmT("QgFu1UjB0f47d_ctwgl0fVEPHJ67iQ7e_ZULuRk7VHVmGO2DKTCG7OD4DMIOQyFicyLLWEIgNGk"));
        }
        finally {
            const postBudgetRejected = rejectOversizedMaintenanceRepair(root, button, __rmT("xqsZ4NsngkN2y.Fb"));
            const postSourceSignature = postBudgetRejected ? '' : (maintenanceAutoSafeSignature(root) || liveSourceSignature);
            const postAttemptKey = postBudgetRejected
                ? liveAttemptKey
                : (maintenanceAutoSafeAttemptKey(root, postSourceSignature, { budgetChecked: true }) || liveAttemptKey);
            maintenanceAutoSafeAttemptedRoots.set(root, postAttemptKey);
        }
    }, Math.max(120, Number(delay) || 720));
    maintenanceAutoSafePendingRoots.set(root, { signature: attemptKey, timer });
    return true;
}
function maintenanceAutoSafeEventMessageIndex(value, { fallbackLatest = false } = {}) {
    const chat = getAvailableHostChat();
    const raw = value && typeof value === 'object'
        ? (value.messageId ?? value.mesid ?? value.index)
        : value;
    const parsed = Number(raw);
    if (Number.isInteger(parsed) && parsed >= 0 && chat[parsed] && !chat[parsed]?.is_user)
        return parsed;
    if (!fallbackLatest)
        return -1;
    for (let index = chat.length - 1; index >= 0; index -= 1) {
        if (chat[index] && !chat[index]?.is_user)
            return index;
    }
    return -1;
}
function scheduleMaintenanceAutoSafeForMessageIndex(messageIndex, { delay = 180, attempts = 3 } = {}) {
    if (!isMaintenanceAutoSafeEnabled())
        return false;
    const index = Number(messageIndex);
    if (!Number.isInteger(index) || index < 0)
        return false;
    const chatKey = (() => {
        try {
            return String(getCurrentChatKey?.() || 'chat');
        }
        catch {
            return 'chat';
        }
    })();
    const key = `${chatKey}:${index}`;
    const previous = maintenanceAutoSafeCurrentMessageTimers.get(key);
    if (previous)
        clearTimeout(previous);
    const run = remaining => {
        const timer = setTimeout(() => {
            maintenanceAutoSafeCurrentMessageTimers.delete(key);
            if (!isCurrentRuntime() || !isMaintenanceAutoSafeEnabled())
                return;
            const messageRoot = getRenderedMessageElement(index);
            if (!messageRoot?.isConnected) {
                if (remaining > 1)
                    run(remaining - 1);
                return;
            }
            installMaintenanceRabbitsInScope(messageRoot, { autoSafeForceCurrent: true });
        }, Math.max(60, Number(delay) || 180));
        maintenanceAutoSafeCurrentMessageTimers.set(key, timer);
    };
    run(Math.max(1, Number(attempts) || 1));
    return true;
}
export function installMaintenanceAutoSafeOpenPatrol(root) {
    return !!root?.isConnected;
}
export function pruneMaintenanceAutoSafeOpenBindings() {
    for (const [details, handler] of maintenanceAutoSafeOpenBindings.entries()) {
        if (details?.isConnected)
            continue;
        try {
            details?.removeEventListener?.('toggle', handler, false);
        }
        catch { }
        maintenanceAutoSafeOpenBindings.delete(details);
    }
}
function removeMaintenanceAutoSafeOpenBindings() {
    for (const [details, handler] of maintenanceAutoSafeOpenBindings.entries()) {
        try {
            details?.removeEventListener?.('toggle', handler, false);
        }
        catch { }
    }
    maintenanceAutoSafeOpenBindings.clear();
}
function scheduleMaintenanceRabbitInstall() {
    if (!isCurrentRuntime())
        return;
    if (maintenanceInstallTimers.size)
        return;
    const timer = setTimeout(() => {
        maintenanceInstallTimers.delete(timer);
        installMaintenanceRabbitsDeferredInChatDom();
    }, 180);
    maintenanceInstallTimers.add(timer);
}
function scheduleObservedChatInstall(messageRoots = []) {
    if (!isCurrentRuntime())
        return;
    for (const root of messageRoots)
        if (root?.isConnected)
            pendingObservedMessageRoots.add(root);
    if (chatInstallDebounceTimer)
        return;
    chatInstallDebounceTimer = setTimeout(() => {
        chatInstallDebounceTimer = 0;
        const roots = [...pendingObservedMessageRoots];
        pendingObservedMessageRoots.clear();
        for (const root of roots) {
            try {
                installMaintenanceRabbitsInScope(root);
            }
            catch (error) {
                console.debug('[RabbitMirror] scoped tool install skipped:', error);
            }
        }
    }, 120);
}
function removeToolEntryDelegation() {
    if (toolEntryDelegationRoot && toolEntryDelegatedClickHandler) {
        toolEntryDelegationRoot.removeEventListener('click', toolEntryDelegatedClickHandler, true);
    }
    if (toolEntryDelegationRoot && toolEntryDelegatedPointerHandler) {
        toolEntryDelegationRoot.removeEventListener('pointerdown', toolEntryDelegatedPointerHandler, true);
    }
    if (toolEntryDelegationRoot && toolEntryDelegatedPointerUpHandler) {
        toolEntryDelegationRoot.removeEventListener('pointerup', toolEntryDelegatedPointerUpHandler, true);
    }
    if (toolEntryDelegationRoot && toolEntryDelegatedPointerMoveHandler) {
        toolEntryDelegationRoot.removeEventListener('pointermove', toolEntryDelegatedPointerMoveHandler, true);
    }
    if (toolEntryDelegationRoot && toolEntryDelegatedPointerCancelHandler) {
        toolEntryDelegationRoot.removeEventListener('pointercancel', toolEntryDelegatedPointerCancelHandler, true);
    }
    if (toolEntryDelegationRoot && toolEntryDelegatedKeydownHandler) {
        toolEntryDelegationRoot.removeEventListener('keydown', toolEntryDelegatedKeydownHandler, true);
    }
    toolEntryDelegationRoot = null;
    toolEntryDelegatedClickHandler = null;
    toolEntryDelegatedPointerHandler = null;
    toolEntryDelegatedPointerUpHandler = null;
    toolEntryDelegatedPointerMoveHandler = null;
    toolEntryDelegatedPointerCancelHandler = null;
    toolEntryDelegatedKeydownHandler = null;
    ttOuterSummaryTapState = null;
    ttOuterSummaryDelayedClickSuppressions = new WeakMap();
    ttOuterSummaryMouseActivations = new WeakMap();
}
function isTauriTavernRuntimeForOuterSummaryTap() {
    try {
        return !!globalThis.__TAURITAVERN__;
    }
    catch {
        return false;
    }
}
function ttOuterSummaryTapTarget(target) {
    if (!isTauriTavernRuntimeForOuterSummaryTap())
        return null;
    const tap = rabbitMirrorChatTapTarget(target);
    if (!tap?.fast)
        return null;
    const face = getRabbitMirrorFacePosition(tap.details);
    if (face && face.details !== tap.details)
        return null;
    return { ...tap, face: face || { details: tap.details, faceIndex: -1 } };
}
function pendingTtOuterSummaryClicks(details, now) {
    const pending = ttOuterSummaryDelayedClickSuppressions.get(details);
    if (!pending)
        return null;
    for (const [key, receipt] of pending)
        if (receipt.expires <= now)
            pending.delete(key);
    if (!pending.size) {
        ttOuterSummaryDelayedClickSuppressions.delete(details);
        return null;
    }
    return pending;
}
function rememberTtOuterSummaryDelayedClick(details, state) {
    const now = performance.now();
    const pending = pendingTtOuterSummaryClicks(details, now) || new Map();
    const key = `${state.pointerType}:${state.pointerId}:${state.x}:${state.y}`;
    const previous = pending.get(key);
    if (!previous && pending.size >= TT_OUTER_SUMMARY_PENDING_POINTER_LIMIT)
        return false;
    pending.set(key, {
        pointerType: state.pointerType, pointerId: state.pointerId,
        count: (previous?.count || 0) + 1,
        mouseCompatibleCount: (previous?.mouseCompatibleCount || 0) + 1,
        expires: now + TT_OUTER_SUMMARY_DELAYED_CLICK_TTL_MS,
        x: state.x, y: state.y,
    });
    ttOuterSummaryDelayedClickSuppressions.set(details, pending);
    return true;
}
function consumeTtOuterSummaryDelayedClick(details, event) {
    if (!details || !event.cancelable)
        return false;
    const now = performance.now();
    const pointerType = String(event.pointerType || '');
    if (event.detail === 0 && pointerType !== 'touch' && pointerType !== 'pen')
        return false;
    const identifiedPointer = Number.isFinite(event.pointerId) && event.pointerId >= 0 && !!pointerType;
    const mouseCompatiblePointer = pointerType === 'mouse' && identifiedPointer;
    const mouseActivation = ttOuterSummaryMouseActivations.get(details);
    const explicitTouch = event.sourceCapabilities?.firesTouchEvents === true;
    const matchesMouse = mouseActivation?.expires > now
        && Math.hypot(Number(event.clientX || 0) - mouseActivation.x, Number(event.clientY || 0) - mouseActivation.y)
            <= TT_OUTER_SUMMARY_TAP_MAX_MOVE_PX;
    if ((pointerType === 'mouse' && (!identifiedPointer
        || (mouseActivation?.expires > now && mouseActivation.pointerId === event.pointerId)))
        || (!pointerType && !explicitTouch && matchesMouse)) {
        ttOuterSummaryMouseActivations.delete(details);
        return false;
    }
    if (pointerType && pointerType !== 'touch' && pointerType !== 'pen' && !mouseCompatiblePointer)
        return false;
    if (!pointerType && event.sourceCapabilities?.firesTouchEvents === false)
        return false;
    const pending = pendingTtOuterSummaryClicks(details, now);
    if (!pending)
        return false;
    const key = [...pending].find(([, receipt]) => (!pointerType || receipt.pointerType === pointerType
        || (mouseCompatiblePointer && receipt.mouseCompatibleCount > 0))
        && (!identifiedPointer || receipt.pointerId === event.pointerId)
        && Math.hypot(Number(event.clientX || 0) - receipt.x, Number(event.clientY || 0) - receipt.y)
            <= TT_OUTER_SUMMARY_TAP_MAX_MOVE_PX)?.[0];
    const receipt = pending.get(key);
    if (!receipt)
        return false;
    receipt.count -= 1;
    if (mouseCompatiblePointer)
        receipt.mouseCompatibleCount -= 1;
    receipt.mouseCompatibleCount = Math.min(receipt.mouseCompatibleCount, receipt.count);
    if (!receipt.count)
        pending.delete(key);
    if (!pending.size)
        ttOuterSummaryDelayedClickSuppressions.delete(details);
    return mouseCompatiblePointer ? 'pointer-mouse-compatible'
        : identifiedPointer ? 'pointer' : explicitTouch ? 'legacy-touch' : 'legacy-spatial';
}
function managedOuterSummaryIntentKey(details, face = getRabbitMirrorFacePosition(details)) {
    if (!details || !face)
        return '';
    const owner = details.closest?.('.mes, [mesid]');
    const mesid = String(owner?.getAttribute?.('mesid') ?? owner?.dataset?.mesid ?? '').trim();
    if (!mesid)
        return '';
    let chatKey = 'chat';
    try {
        chatKey = String(getCurrentChatKey?.() || 'chat');
    }
    catch { }
    return `${chatKey}:${mesid}:${Number(face.faceIndex || 0)}`;
}
function trimManagedOuterSummaryToggleIntents(now = Date.now()) {
    for (const [key, value] of managedOuterSummaryToggleIntents) {
        if (!value || now - Number(value.ts || 0) > MANAGED_OUTER_SUMMARY_INTENT_TTL_MS)
            managedOuterSummaryToggleIntents.delete(key);
    }
    while (managedOuterSummaryToggleIntents.size > MANAGED_OUTER_SUMMARY_INTENT_MAX) {
        const oldest = managedOuterSummaryToggleIntents.keys().next().value;
        if (oldest === undefined)
            break;
        managedOuterSummaryToggleIntents.delete(oldest);
    }
}
function rememberManagedOuterSummaryToggleIntent(details, face, desiredOpen) {
    const key = managedOuterSummaryIntentKey(details, face);
    if (!key)
        return false;
    const now = Date.now();
    trimManagedOuterSummaryToggleIntents(now);
    managedOuterSummaryToggleIntents.delete(key);
    managedOuterSummaryToggleIntents.set(key, { open: !!desiredOpen, ts: now });
    trimManagedOuterSummaryToggleIntents(now);
    return true;
}
function applyManagedOuterSummaryToggleIntents(owner, roots) {
    if (!isRabbitMirrorManagedChatSurface() || !owner?.isConnected)
        return 0;
    const now = Date.now();
    trimManagedOuterSummaryToggleIntents(now);
    let restored = 0;
    for (const root of roots || []) {
        const face = getRabbitMirrorFacePosition(root);
        const details = face?.details || (root?.matches?.('details') ? root : root?.querySelector?.(':scope > details') || null);
        if (!details?.isConnected || !face)
            continue;
        const key = managedOuterSummaryIntentKey(details, face);
        const intent = key ? managedOuterSummaryToggleIntents.get(key) : null;
        if (!intent || now - Number(intent.ts || 0) > MANAGED_OUTER_SUMMARY_INTENT_TTL_MS)
            continue;
        if (!!details.open !== !!intent.open) {
            details.open = !!intent.open;
            restored += 1;
        }
    }
    if (restored) {
        globalThis.__rabbitMirrorPerfDiag?.mark?.('tt.outerSummaryToggleRemountRestore', { restored });
        recordTtSurface('intent-restore', { restored });
    }
    return restored;
}
function scheduleManagedOuterSummaryToggleFallback(summary) {
    if (!isRabbitMirrorManagedChatSurface() || !(summary instanceof Element))
        return false;
    const details = summary.parentElement;
    if (!isRabbitMirrorOuterChatDetails(details))
        return false;
    const face = getRabbitMirrorFacePosition(details);
    if (face && face.details !== details)
        return false;
    if (managedOuterSummaryToggleFallbackPending.has(details))
        return true;
    const before = !!details.open;
    const faceIndex = face?.faceIndex ?? -1;
    recordTtSurface('summary-activate', { seq: nextTtSurfaceClickSeq(), faceIndex, open: before });
    if (face)
        rememberManagedOuterSummaryToggleIntent(details, face, !before);
    managedOuterSummaryToggleFallbackPending.add(details);
    setTimeout(() => {
        managedOuterSummaryToggleFallbackPending.delete(details);
        if (!details.isConnected || summary.parentElement !== details)
            return;
        if (!!details.open !== before)
            return;
        details.open = !before;
        globalThis.__rabbitMirrorPerfDiag?.mark?.('tt.outerSummaryToggleFallback', {
            faceIndex,
            opened: !!details.open,
        });
        recordTtSurface('fallback-toggle', { faceIndex, open: !!details.open });
    }, 0);
    return true;
}
function installToolEntryDelegation(chatRoot = getChatRoot()) {
    if (!isCurrentRuntime() || !chatRoot?.addEventListener)
        return false;
    if (toolEntryDelegationRoot === chatRoot && toolEntryDelegatedClickHandler)
        return true;
    removeToolEntryDelegation();
    toolEntryDelegationRoot = chatRoot;
    toolEntryDelegatedPointerHandler = event => {
        captureRabbitMirrorInteractionResetFromEventTarget(event.target);
        const isTouchOrPen = event.pointerType === 'touch' || event.pointerType === 'pen';
        const tapTarget = ttOuterSummaryTapTarget(event.target);
        if (tapTarget && event.pointerType === 'mouse' && event.button === 0 && event.isPrimary !== false) {
            const now = performance.now();
            ttOuterSummaryMouseActivations.set(tapTarget.receipt, {
                pointerId: event.pointerId,
                expires: now + TT_OUTER_SUMMARY_DELAYED_CLICK_TTL_MS,
                x: Number(event.clientX || 0), y: Number(event.clientY || 0),
            });
            const pending = pendingTtOuterSummaryClicks(tapTarget.receipt, now);
            for (const receipt of pending?.values() || []) {
                if (receipt.pointerId === event.pointerId)
                    receipt.mouseCompatibleCount = 0;
            }
        }
        const interruptedPointer = ttOuterSummaryTapState && ttOuterSummaryTapState.pointerId !== event.pointerId;
        if (!interruptedPointer && tapTarget && isTouchOrPen && event.isPrimary !== false && event.button === 0
            && Number.isFinite(event.pointerId) && event.pointerId >= 0 && !event.defaultPrevented) {
            ttOuterSummaryTapState = {
                pointerId: event.pointerId,
                pointerType: event.pointerType,
                summary: tapTarget.summary,
                details: tapTarget.details,
                disclosure: tapTarget.disclosure,
                element: tapTarget.element,
                receipt: tapTarget.receipt,
                kind: tapTarget.kind,
                downEvent: event,
                owner: tapTarget.details.closest('.mes, [mesid]'),
                messageId: tapTarget.details.closest('.mes, [mesid]')?.getAttribute('mesid'),
                chatKey: getCurrentChatKey(),
                faceIndex: tapTarget.face.faceIndex,
                x: Number(event.clientX || 0),
                y: Number(event.clientY || 0),
                startedAt: performance.now(),
            };
        }
        else {
            ttOuterSummaryTapState = null;
        }
        const button = event.target?.closest?.(`[${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [${RECIPE_BUTTON_ATTR}]`);
        if (!button || !chatRoot.contains(button))
            return;
        event.stopPropagation();
    };
    toolEntryDelegatedPointerMoveHandler = event => {
        const state = ttOuterSummaryTapState;
        if (!state || state.pointerId !== event.pointerId)
            return;
        if (Math.hypot(Number(event.clientX || 0) - state.x, Number(event.clientY || 0) - state.y)
            > TT_OUTER_SUMMARY_TAP_MAX_MOVE_PX)
            ttOuterSummaryTapState = null;
    };
    toolEntryDelegatedPointerUpHandler = event => {
        const state = ttOuterSummaryTapState;
        if (!state || state.pointerId !== event.pointerId)
            return;
        ttOuterSummaryTapState = null;
        if (event.defaultPrevented || state.downEvent?.defaultPrevented || event.isPrimary === false
            || event.pointerType !== state.pointerType || event.button !== 0)
            return;
        const elapsed = performance.now() - state.startedAt;
        const dx = Number(event.clientX || 0) - state.x;
        const dy = Number(event.clientY || 0) - state.y;
        if (elapsed > TT_OUTER_SUMMARY_TAP_MAX_MS || Math.hypot(dx, dy) > TT_OUTER_SUMMARY_TAP_MAX_MOVE_PX)
            return;
        if (!state.details?.isConnected || !state.element?.isConnected || state.chatKey !== getCurrentChatKey())
            return;
        if (state.details.closest('.mes, [mesid]') !== state.owner
            || state.owner?.getAttribute('mesid') !== state.messageId)
            return;
        const currentTarget = ttOuterSummaryTapTarget(event.target);
        if (!currentTarget || currentTarget.details !== state.details || currentTarget.element !== state.element)
            return;
        if (!rememberTtOuterSummaryDelayedClick(state.receipt, state))
            return;
        if (state.kind === 'outer') {
            if (isRabbitMirrorManagedChatSurface()) {
                const face = getRabbitMirrorFacePosition(state.details);
                if (face)
                    rememberManagedOuterSummaryToggleIntent(state.details, face, !state.details.open);
            }
            state.details.open = !state.details.open;
            scheduleCurrentHighConfidenceTextRepair(rabbitMirrorInteractionRootFromTarget(state.element));
        }
        else {
            state.element.click();
        }
        recordTtSurface(state.kind === 'outer' ? 'tt-fast-toggle' : 'tt-fast-control', {
            faceIndex: state.faceIndex, open: state.disclosure ? !!state.disclosure.open : undefined,
            ms: elapsed, targetKind: state.kind,
            pointerId: state.pointerId, pointerType: state.pointerType, eventTime: event.timeStamp
        });
    };
    toolEntryDelegatedPointerCancelHandler = event => {
        if (ttOuterSummaryTapState?.pointerId === event.pointerId)
            ttOuterSummaryTapState = null;
    };
    toolEntryDelegatedKeydownHandler = event => {
        const activationKey = event.key === 'Enter' || event.key === ' ';
        const radioArrowKey = event.key === 'ArrowLeft' || event.key === 'ArrowRight'
            || event.key === 'ArrowUp' || event.key === 'ArrowDown';
        if (!activationKey && !radioArrowKey)
            return;
        const target = event.target;
        if (!(target instanceof Element))
            return;
        let control = target.closest?.('input[type="checkbox"], input[type="radio"]') || null;
        if (!control) {
            const label = target.closest?.('label');
            control = label?.control || label?.querySelector?.('input[type="checkbox"], input[type="radio"]') || null;
            if (!control) {
                const forId = String(label?.getAttribute?.('for') || '').trim();
                const candidate = forId ? label?.ownerDocument?.getElementById?.(forId) : null;
                if (candidate?.matches?.('input[type="checkbox"], input[type="radio"]'))
                    control = candidate;
            }
        }
        if (!control)
            return;
        if (radioArrowKey && !control.matches?.('input[type="radio"]'))
            return;
        captureRabbitMirrorInteractionResetFromEventTarget(control);
    };
    toolEntryDelegatedClickHandler = event => {
        const tap = isTauriTavernRuntimeForOuterSummaryTap() ? rabbitMirrorChatTapTarget(event.target) : null;
        if (tap && ttOuterSummaryTapState?.receipt === tap.receipt)
            ttOuterSummaryTapState = null;
        const suppressed = tap && consumeTtOuterSummaryDelayedClick(tap.receipt, event);
        if (suppressed) {
            event.preventDefault();
            if (tap.kind !== 'outer')
                event.stopImmediatePropagation();
            recordTtSurface('tt-delayed-click-suppressed', {
                open: tap.disclosure ? !!tap.disclosure.open : undefined, targetKind: tap.kind,
                pointerId: event.pointerId, pointerType: event.pointerType, eventTime: event.timeStamp,
                defaultPrevented: event.defaultPrevented, suppressed: true, match: suppressed
            });
            return;
        }
        const manualButton = event.target?.closest?.('[data-rm-manual-generate="true"]');
        if (manualButton && chatRoot.contains(manualButton)) {
            event.preventDefault();
            event.stopPropagation();
            const manualHost = manualButton.closest('.rabbit-mirror-external-host');
            if (!manualHost?.isConnected || manualButton.disabled)
                return;
            const action = globalThis.__rabbitMirrorIndependentActionsV1?.generateManual;
            if (typeof action === 'function') {
                Promise.resolve(action(manualHost)).catch(error => console.warn('[RabbitMirror] Manual generation failed:', error));
            }
            return;
        }
        const clickedSummary = event.target?.closest?.('summary');
        if (clickedSummary && !event.target?.closest?.(`[${TOOL_ENTRY_HOST_ATTR}]`)) {
            const innerAction = event.target?.closest?.('button, input, select, textarea, a[href], [role="button"], [contenteditable="true"]');
            if (!innerAction || innerAction === clickedSummary)
                scheduleManagedOuterSummaryToggleFallback(clickedSummary);
            const summaryRoot = rabbitMirrorInteractionRootFromTarget(clickedSummary);
            const outerDetails = getRabbitMirrorFacePosition(summaryRoot)?.details
                || (summaryRoot?.matches?.('details') ? summaryRoot : summaryRoot?.querySelector?.(':scope > details') || null);
            if (clickedSummary.parentElement === outerDetails)
                scheduleCurrentHighConfidenceTextRepair(summaryRoot);
        }
        captureRabbitMirrorInteractionResetFromEventTarget(event.target);
        const button = event.target?.closest?.(`[${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [${RECIPE_BUTTON_ATTR}]`);
        if (!button || !chatRoot.contains(button))
            return;
        const root = rabbitMirrorToolRootFromButton(button);
        if (!root)
            return;
        if (button.matches(`[${MAINTENANCE_RABBIT_ATTR}]`)) {
            handleMaintenanceRabbitClick(event, root, button);
            return;
        }
        if (button.matches(`[${RECIPE_BUTTON_ATTR}]`)) {
            handleRecipeClick(event, root, button);
            return;
        }
        handleFeedbackCatClick(event, root, button);
    };
    chatRoot.addEventListener('pointerdown', toolEntryDelegatedPointerHandler, true);
    chatRoot.addEventListener('pointerup', toolEntryDelegatedPointerUpHandler, true);
    chatRoot.addEventListener('pointermove', toolEntryDelegatedPointerMoveHandler, { capture: true, passive: true });
    chatRoot.addEventListener('pointercancel', toolEntryDelegatedPointerCancelHandler, true);
    chatRoot.addEventListener('keydown', toolEntryDelegatedKeydownHandler, true);
    chatRoot.addEventListener('click', toolEntryDelegatedClickHandler, true);
    return true;
}
export function outputHostGenerationLooksActive() {
    try {
        if (hostScriptModule?.is_send_press === true || hostScriptModule?.isGenerating?.() === true)
            return true;
        return !!document?.querySelector?.('#chat .mes.streaming, #chat .mes[data-is-streaming="true"], #chat .mes[is_generating="true"], #chat .mes[data-generating="true"]');
    }
    catch {
        return false;
    }
}
export function installManagedRabbitMirrorTools() {
    if (managedRabbitMirrorToolsUnsubscribe)
        return;
    const install = (context, wholeMessage = false) => {
        if (context.signal.aborted || !context.element?.isConnected)
            return;
        const owner = context.element;
        const timerChatKey = (() => { try {
            return String(getCurrentChatKey?.() || 'chat');
        }
        catch {
            return 'chat';
        } })();
        const messageTimerKey = `${timerChatKey}:${context.mesid}`;
        installToolEntryDelegation(getChatRoot());
        installMaintenanceRabbitsInScope(owner, { historyRestoreLight: true });
        const ownedScope = wholeMessage ? owner : context.content;
        const roots = getRenderedRabbitMirrorInteractionRoots(ownedScope);
        applyManagedOuterSummaryToggleIntents(owner, roots);
        return () => {
            pendingObservedMessageRoots.delete(owner);
            const releasedRoots = new Set([...roots, ...getRenderedRabbitMirrorInteractionRoots(ownedScope)]);
            for (const entry of [...toolOutsideCloseOwners.values()]) {
                if (ownedScope.contains(entry.button) || [...releasedRoots].some(root => root.contains(entry.button)))
                    entry.close();
            }
            for (const root of releasedRoots) {
                untrackMirrorAnimations(root);
                disposeReadabilityPolish(root);
                firstUseInteractionBindings.get(root)?.dispose?.();
                const pending = maintenanceAutoSafePendingRoots.get(root);
                if (pending?.timer)
                    clearTimeout(pending.timer);
                maintenanceAutoSafePendingRoots.delete(root);
                const frame = maintenanceHighConfidenceTextRepairFrames.get(root);
                if (frame)
                    cancelAnimationFrame(frame);
                maintenanceHighConfidenceTextRepairFrames.delete(root);
            }
            const messageTimer = maintenanceAutoSafeCurrentMessageTimers.get(messageTimerKey);
            if (messageTimer)
                clearTimeout(messageTimer);
            maintenanceAutoSafeCurrentMessageTimers.delete(messageTimerKey);
            for (const recipe of followMaintenanceRepairRecipes.values()) {
                if (releasedRoots.has(recipe.lastRoot))
                    recipe.lastRoot = null;
            }
            for (const run of [...maintenanceRepairRunRecords.values()]) {
                if (ownedScope.contains(run.button) || [...releasedRoots].some(root => root.contains(run.button))) {
                    cancelMaintenanceRepairRun(run, __rmT("D8FCUutm1XpBu5eTLiTTQqid"), { notify: false });
                }
            }
        };
    };
    managedRabbitMirrorToolsUnsubscribe = subscribeRabbitMirrorChatSurface({
        id: 'rabbitmirror/output-tools', didMount: context => install(context, true), didCommitContent: install,
    });
}
function installChatMutationObserver() {
    if (!isCurrentRuntime() || typeof MutationObserver === 'undefined')
        return false;
    const chatRoot = getChatRoot();
    if (!chatRoot)
        return false;
    installToolEntryDelegation(chatRoot);
    if (isRabbitMirrorManagedChatSurface()) {
        chatInstallObserver?.disconnect?.();
        chatInstallObserver = null;
        observedChatInstallRoot = null;
        cancelStartupMaintenanceHistoryInstall();
        const ttStart = ttSurfaceNow();
        installManagedRabbitMirrorTools();
        recordTtSurface('install', { sub: 'output-tools', ms: ttStart ? performance.now() - ttStart : 0 });
        return true;
    }
    if (chatInstallObserver && observedChatInstallRoot === chatRoot)
        return true;
    chatInstallObserver?.disconnect?.();
    observedChatInstallRoot = chatRoot;
    chatInstallObserver = new MutationObserver(mutations => {
        if (mutations.some(mutation => [...(mutation.removedNodes || [])].some(node => node.nodeType === 1))) {
            pruneMirrorAnimationVisibility();
            pruneReadabilityPolish();
        }
        const perfEnd = globalThis.__rabbitMirrorPerfDiag?.begin?.('maintenance.mutationObserver', { records: mutations.length }, 8);
        if (outputHostGenerationLooksActive()) {
            perfEnd?.({ affectedMessages: 0, skippedStreaming: true });
            return;
        }
        const messageRoots = new Set();
        for (const mutation of mutations) {
            if (mutation.type !== 'childList')
                continue;
            const targetElement = mutation.target?.nodeType === 1 ? mutation.target : mutation.target?.parentElement;
            if (targetElement?.closest?.(`toto, [${EXTERNAL_REFERENCE_NOTE_ATTR}], [${TOOL_ENTRY_HOST_ATTR}], [${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [data-rabbit-mirror-external-source]`))
                continue;
            const targetMessage = targetElement?.closest?.('.mes, [mesid]') || null;
            const added = [...(mutation.addedNodes || [])].filter(node => node?.nodeType === 1);
            if (targetMessage) {
                const relevant = added.some(node => {
                    if (node.matches?.(`[${EXTERNAL_REFERENCE_NOTE_ATTR}], [${TOOL_ENTRY_HOST_ATTR}], [${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [data-rabbit-mirror-external-source]`))
                        return false;
                    return node.matches?.('toto, details, .mes_text') || !!node.querySelector?.('toto, details');
                });
                if (relevant)
                    messageRoots.add(targetMessage);
                continue;
            }
            for (const node of added) {
                if (node.matches?.(`[${EXTERNAL_REFERENCE_NOTE_ATTR}], [${TOOL_ENTRY_HOST_ATTR}], [${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [data-rabbit-mirror-external-source]`))
                    continue;
                if (node.matches?.('.mes, [mesid]')) {
                    messageRoots.add(node);
                    continue;
                }
                if (targetElement === chatRoot) {
                    for (const nested of node.querySelectorAll?.('.mes[mesid], [mesid].mes') || [])
                        messageRoots.add(nested);
                }
            }
        }
        if (messageRoots.size) {
            scheduleObservedChatInstall(messageRoots);
            scheduleRabbitMirrorComposerClearance();
        }
        perfEnd?.({ affectedMessages: messageRoots.size });
    });
    chatInstallObserver.observe(chatRoot, { childList: true, subtree: true });
    return true;
}
function installChatRootReadyObserver() {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined' || !document.body)
        return;
    chatRootReadyObserver?.disconnect?.();
    chatRootReadyObserver = null;
    if (isRabbitMirrorManagedChatSurface()) {
        installManagedRabbitMirrorTools();
        return;
    }
    if (installChatMutationObserver())
        return;
    chatRootReadyObserver = new MutationObserver(() => {
        if (!installChatMutationObserver())
            return;
        chatRootReadyObserver?.disconnect?.();
        chatRootReadyObserver = null;
        scheduleMaintenanceRabbitInstall();
    });
    chatRootReadyObserver.observe(document.body, { childList: true, subtree: true });
}
function unsubscribeOutputHostEvents() {
    for (const { eventSource, eventName, handler } of outputHostSubscriptions) {
        try {
            eventSource?.off?.(eventName, handler);
        }
        catch { }
    }
    outputHostSubscriptions = [];
}
export async function initOutputSanitizer({ isActive = () => true } = {}) {
    if (!isActive() || !isCurrentRuntime())
        return;
    try {
        globalThis.__rabbitMirrorOutputSanitizerCleanup?.();
    }
    catch { }
    globalThis.__rabbitMirrorOutputSanitizerCleanup = destroyOutputSanitizer;
    unsubscribeOutputHostEvents();
    removeAllInteractionDiagnosticPanels();
    ensureFeedbackCatRuntimeStyle();
    initializeMaintenanceAutoSafeStartupGuard();
    installChatRootReadyObserver();
    installToolEntryDelegation();
    try {
        installDesktopFaceZoom(document);
    }
    catch (error) {
        console.debug('[RabbitMirror] desktop face zoom unavailable', error);
    }
    installChatMutationObserver();
    installMaintenanceRabbitsDeferredInChatDom();
    if (recipeRecordedHandler)
        globalThis.removeEventListener?.(RECIPE_RECORDED_EVENT, recipeRecordedHandler);
    recipeRecordedHandler = event => {
        const index = Number(event?.detail?.messageIndex);
        setTimeout(() => {
            if (!isCurrentRuntime())
                return;
            const chatRoot = getChatRoot();
            if (!chatRoot || !Number.isInteger(index) || index < 0)
                return;
            const messageRoot = chatRoot.querySelector?.(`.mes[mesid="${index}"], [mesid="${index}"].mes`);
            if (messageRoot)
                installMaintenanceRabbitsInScope(messageRoot);
        }, 60);
    };
    globalThis.addEventListener?.(RECIPE_RECORDED_EVENT, recipeRecordedHandler);
    try {
        const mod = await import('../../../../../../script.js');
        if (!isActive())
            return;
        hostScriptModule = mod;
        const eventSource = mod?.eventSource;
        const eventTypes = mod?.event_types || {};
        if (eventSource?.on) {
            const historyOnlyEvents = [eventTypes.CHAT_CHANGED].filter(Boolean);
            for (const eventName of [...new Set(historyOnlyEvents)]) {
                const handler = () => {
                    installChatMutationObserver();
                    cancelMaintenanceRepairRuns(__rmT("NixDU0cVhF6ozklF6TbnHhP.KmD"), { notify: true });
                    cancelMaintenanceAutoSafeCurrentMessageTimers();
                    scheduleMaintenanceRabbitInstall();
                };
                eventSource.on(eventName, handler);
                outputHostSubscriptions.push({ eventSource, eventName, handler });
            }
            const currentMessageEvents = [
                eventTypes.MESSAGE_RECEIVED,
                eventTypes.CHARACTER_MESSAGE_RENDERED,
                eventTypes.MESSAGE_SWIPED,
                eventTypes.MESSAGE_EDITED,
            ].filter(Boolean);
            for (const eventName of [...new Set(currentMessageEvents)]) {
                const handler = messageId => {
                    installChatMutationObserver();
                    if (eventName === eventTypes.MESSAGE_SWIPED || eventName === eventTypes.MESSAGE_EDITED) {
                        cancelMaintenanceRepairRuns(__rmT("1NTr4OZ0mXFvwJQP23K.4TWdTkLBNeKHAZKeeUL69nCimJh0"), { notify: true });
                    }
                    const index = maintenanceAutoSafeEventMessageIndex(messageId, { fallbackLatest: eventName === eventTypes.CHARACTER_MESSAGE_RENDERED });
                    if (index >= 0)
                        scheduleMaintenanceAutoSafeForMessageIndex(index, { delay: 180, attempts: 1 });
                    else
                        scheduleMaintenanceRabbitInstall();
                };
                eventSource.on(eventName, handler);
                outputHostSubscriptions.push({ eventSource, eventName, handler });
            }
            const generationFinishedEvents = [eventTypes.GENERATION_STOPPED, eventTypes.GENERATION_ENDED].filter(Boolean);
            for (const eventName of [...new Set(generationFinishedEvents)]) {
                const handler = messageId => {
                    installChatMutationObserver();
                    const index = maintenanceAutoSafeEventMessageIndex(messageId, { fallbackLatest: true });
                    if (index >= 0)
                        scheduleMaintenanceAutoSafeForMessageIndex(index, { delay: 220, attempts: 1 });
                    else
                        scheduleMaintenanceRabbitInstall();
                };
                eventSource.on(eventName, handler);
                outputHostSubscriptions.push({ eventSource, eventName, handler });
            }
        }
        console.debug('[RabbitMirror] output sanitizer initialized (maintenance rabbit + feedback cat)');
    }
    catch (error) {
        console.debug('[RabbitMirror] host event integration unavailable; DOM observer fallback remains active:', error);
    }
}
export function destroyOutputSanitizer() {
    try {
        destroyRabbitMirrorCheckedSelectorRepair();
    }
    catch { }
    destroyReadabilityPolish();
    try {
        destroyDesktopFaceZoom();
    }
    catch { }
    destroyMirrorAnimationVisibility();
    managedRabbitMirrorToolsUnsubscribe?.();
    managedRabbitMirrorToolsUnsubscribe = null;
    unsubscribeOutputHostEvents();
    if (recipeRecordedHandler)
        globalThis.removeEventListener?.(RECIPE_RECORDED_EVENT, recipeRecordedHandler);
    recipeRecordedHandler = null;
    chatInstallObserver?.disconnect?.();
    chatInstallObserver = null;
    chatRootReadyObserver?.disconnect?.();
    chatRootReadyObserver = null;
    removeToolEntryDelegation();
    managedOuterSummaryToggleIntents.clear();
    observedChatInstallRoot = null;
    if (chatInstallDebounceTimer) {
        clearTimeout(chatInstallDebounceTimer);
        chatInstallDebounceTimer = 0;
    }
    pendingObservedMessageRoots.clear();
    cancelCurrentHighConfidenceTextRepairs();
    for (const timer of maintenanceInstallTimers)
        clearTimeout(timer);
    maintenanceInstallTimers.clear();
    cancelStartupMaintenanceHistoryInstall();
    cancelMaintenanceAutoSafeTimers();
    removeMaintenanceAutoSafeOpenBindings();
    maintenanceAutoSafeBaselineSignatures.clear();
    maintenanceAutoSafeAttemptedRoots = new WeakMap();
    maintenancePreRepairSnapshots.clear();
    rabbitMirrorInteractionResetSnapshots.clear();
    followMaintenanceRepairRecipes.clear();
    cancelMaintenanceRepairRuns();
    maintenanceAutoSafeReady = false;
    removeMaintenanceRabbitsInChatDom();
    removeFeedbackCatsInChatDom();
    closeMaintenanceRabbitMenu();
    closeFeedbackCatMenu();
    closeRecipeMenu();
    removeAllInteractionDiagnosticPanels();
    document?.getElementById?.(FEEDBACK_CAT_RUNTIME_STYLE_ID)?.remove?.();
    if (globalThis.__rabbitMirrorOutputSanitizerCleanup === destroyOutputSanitizer)
        delete globalThis.__rabbitMirrorOutputSanitizerCleanup;
}
