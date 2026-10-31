import { markRabbitMirrorBootstrapEvaluated, runRabbitMirrorStartupStep, reportRabbitMirrorStartupFailure, setRabbitMirrorStartupOpener, setRabbitMirrorOpenCommandAvailable, checkRabbitMirrorEntryVisibility, checkRabbitMirrorDuplicateInstall, disposeRabbitMirrorStartupGuard } from './src/startupGuard.js?rmv=2.3.4';
import { rmT as __rmT } from "./src/textTable.js?rmv=2.3.4";
import { unregisterRabbitMirrorOpenCommand, watchRabbitMirrorOpenCommand } from './src/openCommand.js?rmv=2.3.4';
import { rabbitMirrorGenerateInterceptor, clearRabbitMirrorPrompt, destroyIndependentGenerationIntentBridge, initIndependentGenerationIntentBridge, prewarmRabbitMirrorGenerationRuntime } from './src/injector.js?rmv=2.3.4';
import { clearLastCombo } from './src/storage.js?rmv=2.3.4';
import { clearAllFeedbackCatState, destroyFeedbackCatPromptSync, initFeedbackCatPromptSync } from './src/feedbackCat.js?rmv=2.3.4';
import { initPromptHistoryStrip, destroyPromptHistoryStrip } from './src/promptHistoryStrip.js?rmv=2.3.4';
import { getSettings, updateSettings } from './src/settings.js?rmv=2.3.4';
import { installRabbitMirrorPublicAPI } from './src/publicApi.js?rmv=2.3.4';
import { initRabbitMirrorIndependentSecurityGuard, destroyRabbitMirrorIndependentSecurityGuard } from './src/independentSecurityGuard.js?rmv=2.3.4';
import { initRabbitMirrorHostCompatibility, isRabbitMirrorManagedChatSurface, getRabbitMirrorMountedMessages, subscribeRabbitMirrorChatSurface, getRabbitMirrorEarlyBootstrap, getRabbitMirrorHostCompatibilityStatus } from './src/hostCompatibility.js?rmv=2.3.4';
runRabbitMirrorStartupStep(__rmT("SQqb4wpegR0_8sKi"), () => initRabbitMirrorHostCompatibility());
const GOLDEN_MERGE_VERSION = '2.3.4';
const RABBIT_MIRROR_RUNTIME_VERSION = '2.3.4';
const earlyBootstrap = getRabbitMirrorEarlyBootstrap();
let runtimeCancelled = earlyBootstrap?.cancelled === true || (!!globalThis.__rabbitMirrorTtBootstrap && !earlyBootstrap);
let runtimeClaimed = !runtimeCancelled;
const runtimeIsActive = () => !runtimeCancelled && (earlyBootstrap
    ? globalThis.__rabbitMirrorTtBootstrap === earlyBootstrap && !earlyBootstrap.cancelled
    : !globalThis.__rabbitMirrorTtBootstrap);
const disposePublicAPI = runtimeIsActive() ? installRabbitMirrorPublicAPI(runtimeIsActive) : null;
function standDownError() {
    const error = new Error(__rmT("qBq0vbzvMo9yC5N5sADXFmuYLRK.X_jLLJI7FqPuG3p4WpDDihdQ.jedgrxsb5ssxQ7xkHwOr9MPmf_lMgBt20_W6KIgy8ZycRTh2NReN0khWFb2OGHHA0iSVZ2zxNOEuzmhHe3LCEFJWDKNWCKNIg78HKN6iJIVVmXx2vfb1itpCg8pFxm2uymO"));
    error.stack = '';
    return error;
}
if (runtimeCancelled)
    reportRabbitMirrorStartupFailure(__rmT("6JOmX8BLvcD"), standDownError(), { canOpen: false });
let deferredRuntimePromise = null;
let deferredRuntimeModules = null;
let deferredStartingModules = null;
const deferredModuleInitializations = new Map();
let deferredBootTimer = 0;
let deferredIdleHandle = 0;
let deferredTtBootTimer = 0;
let deferredTtBootAttempts = 0;
let deferredLoadHandler = null;
let deferredChatWakeObserver = null;
let deferredChatSurfaceWakeCleanup = null;
let deferredHostSignature = '';
let deferredHostStableSince = 0;
let generationPrewarmStarted = false;
let generationPrewarmDone = false;
let externalDiagnosticsPromise = null;
let externalDiagnosticsModule = null;
let externalDiagnosticsApi = null;
let externalDiagnosticsOperationRevision = 0;
let externalDiagnosticsDesiredEnabled = false;
let lazyPointerHandler = null;
let lazyFocusHandler = null;
let lazyClickHandler = null;
if (!runtimeCancelled) {
    try {
        globalThis.__rabbitMirrorFeedbackCatSyncCleanup?.();
    }
    catch { }
    globalThis.__rabbitMirrorRuntimeVersion = RABBIT_MIRROR_RUNTIME_VERSION;
    globalThis.rabbitMirrorGenerateInterceptor = earlyBootstrap?.interceptor || rabbitMirrorGenerateInterceptor;
    globalThis.__rabbitMirrorGoldenMerge = {
        version: GOLDEN_MERGE_VERSION,
        deferredReady: () => !!deferredRuntimeModules,
        optionalLoaded: () => [],
    };
    globalThis.__rabbitMirrorEnsureDeferredCoreRuntime = ensureDeferredCoreRuntime;
}
function captureDeferredBootBoundary() {
    try {
        const context = globalThis.SillyTavern?.getContext?.();
        const chat = Array.isArray(context?.chat) ? context.chat : [];
        globalThis.__rabbitMirrorDeferredBootBoundary = Object.freeze({
            chatLength: chat.length,
            maxExistingIndex: chat.length - 1,
            capturedAt: Date.now(),
        });
    }
    catch { }
}
function canCleanDeferredModule() {
    const current = globalThis.__rabbitMirrorEnsureDeferredCoreRuntime;
    return (!current || current === ensureDeferredCoreRuntime) && (earlyBootstrap
        ? globalThis.__rabbitMirrorTtBootstrap === earlyBootstrap
        : !globalThis.__rabbitMirrorTtBootstrap);
}
const DEFERRED_MODULE_LABELS = {
    output: __rmT("yfHbcOUJv6aL0f"), visual: __rmT("_PMsVF2xBPA"), independent: __rmT("TBxxQLFyeH2rBMsq"), touch: __rmT("YbTx87OBLQVzUf"),
    ui: __rmT("KAzTmxPEFYA"), clearance: __rmT("QtGEcVVEfVt7Zf"), avatars: __rmT("kAwqaLgkZDG"),
};
function initializeDeferredModule(name, module, initialize, destroy) {
    if (deferredModuleInitializations.has(name))
        return deferredModuleInitializations.get(name);
    const cleanup = () => {
        if (!canCleanDeferredModule())
            return;
        try {
            module[destroy]?.();
        }
        catch (error) {
            console.warn(`[RabbitMirror] ${name} startup cleanup failed:`, error);
        }
    };
    const task = Promise.resolve().then(async () => {
        if (!runtimeIsActive())
            return;
        try {
            await module[initialize]?.({ isActive: runtimeIsActive });
            if (!runtimeIsActive())
                cleanup();
        }
        catch (error) {
            cleanup();
            try {
                if (error && typeof error === 'object')
                    error.rabbitMirrorStartupStep ??= name;
            }
            catch { }
            throw error;
        }
    }).catch(error => {
        if (deferredModuleInitializations.get(name) === task)
            deferredModuleInitializations.delete(name);
        throw error;
    });
    deferredModuleInitializations.set(name, task);
    return task;
}
async function ensureDeferredCoreRuntime(reason = 'scheduled-idle') {
    if (!runtimeIsActive())
        return null;
    if (deferredRuntimeModules)
        return deferredRuntimeModules;
    if (deferredRuntimePromise)
        return deferredRuntimePromise;
    deferredRuntimePromise = Promise.all([
        import('./src/outputSanitizer.js?rmv=2.3.4'),
        import('./src/visualScanner.js?rmv=2.3.4'),
        import('./src/independentApi.js?rmv=2.3.4'),
        import('./src/touchTheater.js?rmv=2.3.4'),
        import('./src/ui.js?rmv=2.3.4'),
        import('./src/composerClearance.js?rmv=2.3.4'),
        import('./src/chatAvatars.js?rmv=2.3.4'),
    ]).then(async ([output, visual, independent, touch, ui, clearance, avatars]) => {
        if (!runtimeIsActive())
            return null;
        const modules = { output, visual, independent, touch, ui, clearance, avatars };
        deferredStartingModules = modules;
        await Promise.all([
            initializeDeferredModule('output', output, 'initOutputSanitizer', 'destroyOutputSanitizer'),
            initializeDeferredModule('visual', visual, 'initVisualScanner', 'destroyVisualScanner'),
            initializeDeferredModule('independent', independent, 'initIndependentRabbitMirror', 'destroyIndependentRabbitMirror'),
        ]);
        if (!runtimeIsActive())
            return null;
        await initializeDeferredModule('touch', touch, 'initTouchTheaterBridge', 'destroyTouchTheaterBridge');
        if (!runtimeIsActive())
            return null;
        await initializeDeferredModule('ui', ui, 'initRabbitMirrorUI', 'destroyRabbitMirrorUI');
        if (!runtimeIsActive())
            return null;
        await initializeDeferredModule('clearance', clearance, 'initRabbitMirrorComposerClearance', 'destroyRabbitMirrorComposerClearance');
        if (!runtimeIsActive())
            return null;
        await initializeDeferredModule('avatars', avatars, 'initRabbitMirrorChatAvatars', 'destroyRabbitMirrorChatAvatars');
        if (!runtimeIsActive())
            return null;
        deferredRuntimeModules = modules;
        deferredStartingModules = null;
        lastCoreLoadError = null;
        console.log(`[RabbitMirror] deferred core ready (${reason}) via ${GOLDEN_MERGE_VERSION}`);
        scheduleEntryVisibilityCheck();
        return deferredRuntimeModules;
    }).catch(error => {
        deferredRuntimePromise = null;
        console.error('[RabbitMirror] deferred core failed to load:', error);
        const step = DEFERRED_MODULE_LABELS[error?.rabbitMirrorStartupStep];
        lastCoreLoadError = error;
        if (runtimeIsActive())
            reportRabbitMirrorStartupFailure(step ? `${__rmT("B8cENf")}${step}` : __rmT("x5swCFopG0QDrcecjbA"), error, { canOpen: false });
        return null;
    });
    return deferredRuntimePromise;
}
function hostControlVisible(selector) {
    try {
        const node = document?.querySelector?.(selector);
        if (!node || node.hidden || node.classList?.contains('displayNone') || node.getAttribute?.('aria-hidden') === 'true')
            return false;
        const style = globalThis.getComputedStyle?.(node);
        if (style && (style.display === 'none' || style.visibility === 'hidden' || style.contentVisibility === 'hidden'))
            return false;
        const rects = node.getClientRects?.();
        return !rects || rects.length > 0;
    }
    catch {
        return false;
    }
}
function hostLooksBusy() {
    try {
        const context = globalThis.SillyTavern?.getContext?.();
        if ([context?.isGenerating, context?.is_generating, context?.is_send_press, globalThis.is_send_press, globalThis.is_group_generating].some(value => value === true))
            return true;
        const streamingMessage = document?.querySelector?.('#chat .mes.streaming, #chat .mes[data-is-streaming="true"], #chat .mes[is_generating="true"], #chat .mes[data-generating="true"]');
        return !!streamingMessage || hostControlVisible('#mes_stop') || hostControlVisible('#stop_but');
    }
    catch {
        return true;
    }
}
function stableHostChatSignature() {
    try {
        const chatRoot = document?.querySelector?.('#chat');
        if (!chatRoot?.isConnected || document?.readyState !== 'complete')
            return '';
        const context = globalThis.SillyTavern?.getContext?.();
        const chat = Array.isArray(context?.chat) ? context.chat : [];
        if (chat.length) {
            if (isRabbitMirrorManagedChatSurface()) {
                const mounted = getRabbitMirrorMountedMessages().filter(item => item.element?.isConnected);
                if (!mounted.length)
                    return '';
                return `${chat.length}:managed:${mounted.map(item => item.mesid).join(',')}`;
            }
            const tail = chat.length - 1;
            const renderedTail = chatRoot.querySelector?.(`.mes[mesid="${tail}"], [mesid="${tail}"].mes`);
            if (!renderedTail?.isConnected)
                return '';
            return `${chat.length}:${tail}:${renderedTail.getAttribute?.('mesid') || ''}:${String(chat[tail]?.mes || '').length}`;
        }
        return '';
    }
    catch {
        return '';
    }
}
function shouldBypassEmptyChatGate() {
    try {
        const status = getRabbitMirrorHostCompatibilityStatus();
        return status.host === 'tauritavern' && status.managed === true && status.registered !== true;
    }
    catch {
        return false;
    }
}
function bootTtLateProjectionRuntime() {
    if (!runtimeIsActive() || deferredRuntimeModules || deferredRuntimePromise)
        return false;
    if (!shouldBypassEmptyChatGate())
        return false;
    if (deferredTtBootTimer) {
        clearTimeout(deferredTtBootTimer);
        deferredTtBootTimer = 0;
    }
    void ensureDeferredCoreRuntime('tt-late-projection');
    return true;
}
function scheduleTtLateProjectionBackup() {
    if (deferredTtBootTimer || deferredRuntimeModules || deferredRuntimePromise)
        return;
    deferredTtBootTimer = setTimeout(() => {
        deferredTtBootTimer = 0;
        if (!runtimeIsActive() || deferredRuntimeModules || deferredRuntimePromise)
            return;
        if (bootTtLateProjectionRuntime())
            return;
        if (++deferredTtBootAttempts > 24)
            return;
        scheduleTtLateProjectionBackup();
    }, deferredTtBootAttempts ? 250 : 50);
}
function requestDeferredIdleCheck(delay = 1400) {
    if (!runtimeIsActive() || deferredRuntimeModules || deferredRuntimePromise)
        return;
    if (bootTtLateProjectionRuntime())
        return;
    deferredBootTimer = setTimeout(() => {
        deferredBootTimer = 0;
        if (bootTtLateProjectionRuntime())
            return;
        if (typeof globalThis.requestIdleCallback === 'function') {
            deferredIdleHandle = globalThis.__TAURITAVERN__
                ? globalThis.requestIdleCallback(runDeferredBoot, { timeout: 2000 })
                : globalThis.requestIdleCallback(runDeferredBoot);
        }
        else {
            runDeferredBoot();
        }
    }, Math.max(600, Number(delay) || 1400));
}
function beginGenerationRuntimePrewarm() {
    if (generationPrewarmStarted || generationPrewarmDone || !runtimeIsActive())
        return false;
    generationPrewarmStarted = true;
    const settings = getSettings();
    const task = settings.enabled !== false && settings.autoRabbitMirrorInjection !== false && settings.generationSource !== 'independent'
        ? prewarmRabbitMirrorGenerationRuntime()
        : Promise.resolve(true);
    void task.catch(error => console.debug('[RabbitMirror] generation prewarm skipped:', error)).finally(() => {
        generationPrewarmDone = true;
        requestDeferredIdleCheck(1800);
    });
    return true;
}
function installDeferredChatWakeObserver() {
    if (isRabbitMirrorManagedChatSurface()) {
        if (!deferredChatSurfaceWakeCleanup) {
            deferredChatSurfaceWakeCleanup = subscribeRabbitMirrorChatSurface({
                id: 'bootstrap-wake',
                didMount() { if (!deferredBootTimer && !deferredIdleHandle)
                    requestDeferredIdleCheck(1200); },
            });
        }
        return true;
    }
    if (deferredChatWakeObserver || typeof MutationObserver !== 'function')
        return false;
    const chatRoot = document?.querySelector?.('#chat');
    if (!chatRoot?.isConnected)
        return false;
    deferredChatWakeObserver = new MutationObserver(records => {
        if (!records?.some(record => Number(record?.addedNodes?.length || 0) > 0))
            return;
        deferredChatWakeObserver?.disconnect?.();
        deferredChatWakeObserver = null;
        requestDeferredIdleCheck(1200);
    });
    deferredChatWakeObserver.observe(chatRoot, { childList: true, subtree: true });
    return true;
}
function runDeferredBoot() {
    deferredBootTimer = 0;
    deferredIdleHandle = 0;
    if (bootTtLateProjectionRuntime())
        return;
    const signature = stableHostChatSignature();
    if (hostLooksBusy()) {
        deferredHostSignature = '';
        deferredHostStableSince = 0;
        requestDeferredIdleCheck(1600);
        return;
    }
    if (!signature) {
        installDeferredChatWakeObserver();
        if (bootTtLateProjectionRuntime())
            return;
        if (!generationPrewarmDone && beginGenerationRuntimePrewarm())
            return;
        if (!generationPrewarmDone && generationPrewarmStarted)
            return;
        return;
    }
    deferredChatWakeObserver?.disconnect?.();
    deferredChatWakeObserver = null;
    deferredChatSurfaceWakeCleanup?.();
    deferredChatSurfaceWakeCleanup = null;
    const current = Date.now();
    if (signature !== deferredHostSignature) {
        deferredHostSignature = signature;
        deferredHostStableSince = current;
        requestDeferredIdleCheck(1600);
        return;
    }
    if (!deferredHostStableSince || current - deferredHostStableSince < 3000) {
        requestDeferredIdleCheck(1400);
        return;
    }
    if (!generationPrewarmDone) {
        beginGenerationRuntimePrewarm();
        return;
    }
    void ensureDeferredCoreRuntime('post-paint-idle');
}
function scheduleDeferredCoreRuntime() {
    if (bootTtLateProjectionRuntime())
        return;
    const schedule = () => {
        if (!runtimeIsActive() || deferredRuntimeModules || deferredRuntimePromise)
            return;
        if (bootTtLateProjectionRuntime())
            return;
        requestDeferredIdleCheck(3500);
        scheduleTtLateProjectionBackup();
    };
    if (document?.readyState === 'complete')
        schedule();
    else {
        deferredLoadHandler = () => { deferredLoadHandler = null; schedule(); };
        window.addEventListener('load', deferredLoadHandler, { once: true });
        scheduleTtLateProjectionBackup();
    }
}
let renderedVisualFeedbackStarted = false;
let checkedSelectorRepairStarted = false;
function loadMirrorVisualCompat() {
    if (!deferredRuntimeModules)
        return Promise.resolve(null);
    if (!renderedVisualFeedbackStarted) {
        renderedVisualFeedbackStarted = true;
        try {
            deferredRuntimeModules.visual.initRenderedVisualFeedback?.();
        }
        catch (error) {
            renderedVisualFeedbackStarted = false;
            console.warn('[RabbitMirror] rendered visual feedback init failed:', error);
        }
    }
    if (!checkedSelectorRepairStarted) {
        checkedSelectorRepairStarted = true;
        try {
            deferredRuntimeModules.output.initRabbitMirrorCheckedSelectorRepair?.();
        }
        catch (error) {
            checkedSelectorRepairStarted = false;
            console.warn('[RabbitMirror] checked selector repair init failed:', error);
        }
    }
    return Promise.resolve(null);
}
function loadMaintenanceCompat() {
    return ensureDeferredCoreRuntime('maintenance-intent');
}
function isRabbitMirrorSurface(target) {
    return !!target?.closest?.('[data-rabbit-mirror-external-source="true"], toto[data-rabbit-mirror], toto, .rabbit-mirror-maintenance-toolbar');
}
function isRabbitMirrorSettingsSurface(target) {
    return !!target?.closest?.(__rmT("ZCevOKDgo4OpRfAVVfqa6MdLy8YYFLoLsGtmbWo4wuF5Kq8raTKp3tRpho4lknHvvYYSMCFhKSqMEVQaSDDE2AXgZOG3YZsWTsCyUkSdXtLBzLiG1Xs.KwaHaHiYs6F0vyI73uU3NYDjZdTXqiM5HDvtA3IflBuFH3D7XkwWijHCk8dpyr_5.sEgXFaoGTfuwVoClpRoqPxjNpU0i5PqdNf4dUxww6HNg4RMUcgykNTCO8qZ8.uwyX0jDe.qcBqSnTMWqimRBdc1ocB71EJ27qVSrNUaaWtha4piyosFCWAN2Twe7W1Ivf"));
}
async function openRabbitMirrorSettings(reason = 'open-intent') {
    if (!runtimeIsActive()) {
        if (runtimeClaimed)
            throw standDownError();
        return false;
    }
    const modules = await ensureDeferredCoreRuntime(reason);
    if (!runtimeIsActive()) {
        if (runtimeClaimed)
            throw standDownError();
        return false;
    }
    const workbench = document.getElementById('rabbit_mirror_theater_settings')?.__rabbitMirrorWorkbench;
    if (!workbench)
        throw (!modules && lastCoreLoadError) || new Error(modules ? __rmT("qrndPZ4jrApE1gdXOQtlMf") : __rmT("otCrz6dp_Uxsg_opQ3XVoHTQ0gV2oh"));
    workbench.open();
    return true;
}
function openRabbitMirrorSettingsFromCommand() {
    return openRabbitMirrorSettings('slash-command').catch(error => {
        if (runtimeClaimed)
            reportRabbitMirrorStartupFailure(__rmT("IRcaYlG71YRmynHK4gOaZi1uDUS9eT"), error, { canOpen: false, opening: true });
        return false;
    });
}
let entryCheckTimer = 0;
let lastCoreLoadError = null;
function scheduleEntryVisibilityCheck(delay = 5000, options = {}) {
    if (entryCheckTimer)
        clearTimeout(entryCheckTimer);
    entryCheckTimer = setTimeout(() => {
        entryCheckTimer = 0;
        if (!runtimeIsActive())
            return;
        void checkRabbitMirrorEntryVisibility(options).catch(error => console.debug('[RabbitMirror] entry check skipped:', error));
    }, delay);
}
let wandMenuWaitTimer = 0;
let wandMenuWaitCount = 0;
function waitForWandMenu() {
    if (wandMenuWaitTimer || !runtimeIsActive())
        return;
    if (wandMenuWaitCount >= 40) {
        wandMenuWaitCount = 0;
        reportRabbitMirrorStartupFailure(__rmT("8XM_M_eELHJ2Cf"), new Error(__rmT("ZBAhuuLRbL39L114Lu8udTBDE5EgLbzhtiPvPcE1JBmYraTkRhzDcbg8W8skY2jVSmfQMzoXB.Z8_Dss4gwg6.XzkxdbDgaHBljZ1m3kA32lkutTRLmRRvPHTejXL.uj6N81mB_uUN0ZAf6WvUaaPnZgpKBSIf")));
        return;
    }
    wandMenuWaitCount += 1;
    wandMenuWaitTimer = setTimeout(() => { wandMenuWaitTimer = 0; installSettingsWandEntry(); }, 500);
}
function installSettingsWandEntry() {
    if (!runtimeIsActive() || document.getElementById('rabbit_mirror_wand_entry'))
        return;
    const menu = document.getElementById('extensionsMenu');
    if (!menu) {
        waitForWandMenu();
        return;
    }
    wandMenuWaitCount = 0;
    if (document.getElementById('rabbit_mirror_wand_bootstrap'))
        return;
    const entry = document.createElement('div');
    entry.id = 'rabbit_mirror_wand_bootstrap';
    entry.setAttribute('role', 'button');
    entry.tabIndex = 0;
    entry.className = 'list-group-item flex-container flexGap5';
    entry.style.cssText = 'background:transparent;background-color:transparent;color:inherit;border:0;box-shadow:none;appearance:none;-webkit-appearance:none;';
    entry.innerHTML = __rmT("zBSlOMuUvbmutoD8JQCJrPTw9R3XZTldwcwi6C0x1cjw0RDa_NJMNwlabv1nR100d7jf0QzgMoQdKBbgNZs4dYAQMlfU3t9T2IKrbUG7wAh56QAE1W819Ji4.DSBhWs7vsRK_EvZbeb3jZAdOC_6A5qYqg9rvEXvUNt6XbzYEk0qB5K28OdX51uvhYF3ReUeinktV9.vjqgIrWaarulHreMZ7mxbet2SGuR5hhlOLv8rvjV5d43zfcCChwhuc9dNMPpGon7g5uXMt5moEy3zlRfQYig6BmPMao7Ncuma71KEvzXoRQmtEkWGEsO4RQOJy.wB52pv2R75JSQ_w_MoKKli0DuRzpvbzvNGazOC8zErZwutA2NjrGGNA7u68CcU5l_8yUrYFfgxSsAepPYLtTNx051v1vU4TIHrffH4zUVGiy9r.QyQvNNRouTU2iGoPfFlblV6WVZhG9mVHOhxDUpozb2zXV27l5rbDV_ieXiQytDxP0jEIVZw57H_jrcESWF4Teod63Y1mPUguTxYekYZFGcJRtwiwm8tE47eULFZtORvfLt7qX70NBk_fYqx1_7C3lpBziU_eKFVOTuiZKVP.sKICSvSTduvjVKRqzabrHjZcmyuPAwzgEiek0Yu.NllK4of8_1fshevgb6DCk.G9oa7PkcZ2aJEpmbu8II4TOGr4jsJLyhYiMjPKfHZoskum2Is52gMvDEAAEQHRWcPgeUDJD3081jTL8Yo8f9ecKuSvuVp9GTr8hHRQz_REZDnId6CDKpGFeIxeGVVvRoBhkas7E2GON3IIksw1pzBCbOt4cah9gnAoViIoUWlvFxnsec7_1s1hye6zyVCrt.L9VUesxci_bDZyuzbTf93BEbaxCKlPczk4Tvk2h");
    entry.setAttribute('aria-haspopup', 'dialog');
    entry.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ')
            return;
        event.preventDefault();
        if (!event.repeat)
            entry.click();
    });
    entry.addEventListener('click', async () => {
        if (entry.disabled || !runtimeClaimed)
            return;
        entry.disabled = true;
        entry.setAttribute('aria-disabled', 'true');
        const label = entry.querySelector('span:last-child');
        if (label)
            label.textContent = __rmT("kBZhOnmkoBWuDozzadjhOT");
        try {
            await openRabbitMirrorSettings('wand-settings-intent');
        }
        catch (error) {
            if (entry.isConnected && runtimeClaimed && label)
                label.textContent = __rmT("ar_gWUQfS1h4jcWWQWQ6Go40ApLe5ArX");
            console.debug('[RabbitMirror] settings entry could not open:', error);
            if (runtimeClaimed)
                reportRabbitMirrorStartupFailure(__rmT("PJ1_Z2Wy966opPzry1iGak"), error, { canOpen: false, opening: true });
        }
        finally {
            if (entry.isConnected) {
                entry.disabled = false;
                entry.removeAttribute('aria-disabled');
            }
        }
    });
    menu.append(entry);
}
function installOnDemandCompatTriggers() {
    if (typeof document === 'undefined')
        return;
    lazyPointerHandler = event => {
        const target = event?.target;
        if (!target?.closest || event?.isTrusted === false)
            return;
        if (isRabbitMirrorSettingsSurface(target)) {
            void ensureDeferredCoreRuntime('settings-intent');
        }
        if (target.closest?.('[data-rabbit-mirror-maintenance-rabbit="true"]'))
            void loadMaintenanceCompat();
    };
    lazyFocusHandler = event => {
        const target = event?.target;
        if (!target?.closest || event?.isTrusted === false)
            return;
        if (isRabbitMirrorSettingsSurface(target)) {
            void ensureDeferredCoreRuntime('settings-focus');
        }
        if (target.closest?.('[data-rabbit-mirror-maintenance-rabbit="true"]'))
            void loadMaintenanceCompat();
    };
    lazyClickHandler = event => {
        const target = event?.target;
        if (target?.closest?.('#extensionsMenuButton')) {
            installSettingsWandEntry();
            scheduleEntryVisibilityCheck(450, { menuOpen: true });
        }
        if (!target?.closest || event?.isTrusted === false || !isRabbitMirrorSurface(target))
            return;
        setTimeout(() => { if (deferredRuntimeModules)
            void loadMirrorVisualCompat(); }, 700);
    };
    document.addEventListener('pointerover', lazyPointerHandler, true);
    document.addEventListener('pointerdown', lazyPointerHandler, true);
    document.addEventListener('focusin', lazyFocusHandler, true);
    document.addEventListener('click', lazyClickHandler, false);
}
function removeOnDemandCompatTriggers() {
    if (typeof document === 'undefined')
        return;
    if (lazyPointerHandler) {
        document.removeEventListener('pointerover', lazyPointerHandler, true);
        document.removeEventListener('pointerdown', lazyPointerHandler, true);
    }
    if (lazyFocusHandler)
        document.removeEventListener('focusin', lazyFocusHandler, true);
    if (lazyClickHandler)
        document.removeEventListener('click', lazyClickHandler, false);
    lazyPointerHandler = null;
    lazyFocusHandler = null;
    lazyClickHandler = null;
}
async function ensureExternalDiagnostics() {
    if (!runtimeIsActive())
        return null;
    externalDiagnosticsDesiredEnabled = true;
    if (externalDiagnosticsApi)
        return externalDiagnosticsApi;
    if (externalDiagnosticsPromise)
        return externalDiagnosticsPromise;
    const revision = ++externalDiagnosticsOperationRevision;
    const loadPromise = import('./src/externalDiagnostics.js?rmv=2.3.4').then(mod => {
        if (!runtimeIsActive() || !externalDiagnosticsDesiredEnabled || revision !== externalDiagnosticsOperationRevision)
            return null;
        externalDiagnosticsModule = mod;
        externalDiagnosticsApi = mod.initRabbitMirrorExternalDiagnostics?.() || null;
        externalDiagnosticsApi?.mark?.('externalDiag.userEnabled', { readyState: String(document?.readyState || '') });
        return externalDiagnosticsApi;
    }).finally(() => {
        if (externalDiagnosticsPromise === loadPromise)
            externalDiagnosticsPromise = null;
    });
    externalDiagnosticsPromise = loadPromise;
    return loadPromise;
}
function disableExternalDiagnostics() {
    externalDiagnosticsDesiredEnabled = false;
    externalDiagnosticsOperationRevision += 1;
    externalDiagnosticsPromise = null;
    try {
        externalDiagnosticsModule?.destroyRabbitMirrorExternalDiagnostics?.();
    }
    catch { }
    externalDiagnosticsApi = null;
}
function clearDeferredGenerationSnapshots() {
    void import('./src/generationGuard.js?rmv=2.3.4')
        .then(mod => {
        if (earlyBootstrap ? globalThis.__rabbitMirrorTtBootstrap !== earlyBootstrap : !!globalThis.__rabbitMirrorTtBootstrap)
            return;
        mod.clearRabbitMirrorGenerationSnapshots?.();
    })
        .catch(() => { });
}
if (!runtimeCancelled) {
    globalThis.__rabbitMirrorEnsureExternalDiag = ensureExternalDiagnostics;
    globalThis.__rabbitMirrorDisableExternalDiag = disableExternalDiagnostics;
}
markRabbitMirrorBootstrapEvaluated();
jQuery(() => {
    if (!runtimeIsActive())
        return;
    const step = runRabbitMirrorStartupStep;
    setRabbitMirrorStartupOpener(reason => openRabbitMirrorSettings(reason));
    captureDeferredBootBoundary();
    step(__rmT("906NOoSdDhGiKaQwNKC"), () => {
        initFeedbackCatPromptSync(() => getSettings().feedbackCatEnabled !== false);
        globalThis.__rabbitMirrorFeedbackCatSyncCleanup = destroyFeedbackCatPromptSync;
    });
    step(__rmT("nBuoZv5TAI8h3GVJfXssMYLC"), () => initPromptHistoryStrip(() => getSettings().stripOldMirrorsBeforeSend !== false));
    step(__rmT("TR93JEY7zIQmBSmG4ghMjb1CvV.OZT"), () => initIndependentGenerationIntentBridge());
    step(__rmT("TR93JEY7zIQmBSmG4gSE_8WjPCehZh"), () => initRabbitMirrorIndependentSecurityGuard({ getSettings, updateSettings }));
    step(__rmT("QQaMvy8_NOUTM03C"), () => installOnDemandCompatTriggers());
    step(__rmT("8XM_M_eELHJ2Cf"), () => installSettingsWandEntry());
    step(__rmT("ZrArnuyyPwTA0ORwMwT"), () => watchRabbitMirrorOpenCommand(openRabbitMirrorSettingsFromCommand, runtimeIsActive, setRabbitMirrorOpenCommandAvailable));
    step(__rmT("VB6Ril1T9tKvY5uAZv.jmpHX"), () => { if (!bootTtLateProjectionRuntime())
        scheduleDeferredCoreRuntime(); });
    setTimeout(() => { if (runtimeIsActive())
        void checkRabbitMirrorDuplicateInstall().catch(() => { }); }, 4000);
    console.log(`[RabbitMirror] lightweight bootstrap ${RABBIT_MIRROR_RUNTIME_VERSION} ready; heavy runtime deferred`);
});
export function onDisable() {
    disposePublicAPI?.();
    runtimeCancelled = true;
    if (earlyBootstrap && globalThis.__rabbitMirrorTtBootstrap !== earlyBootstrap)
        return;
    if (!runtimeClaimed)
        return;
    runtimeClaimed = false;
    if (deferredBootTimer)
        clearTimeout(deferredBootTimer);
    deferredBootTimer = 0;
    if (deferredTtBootTimer)
        clearTimeout(deferredTtBootTimer);
    deferredTtBootTimer = 0;
    deferredTtBootAttempts = 0;
    if (deferredIdleHandle && typeof globalThis.cancelIdleCallback === 'function')
        globalThis.cancelIdleCallback(deferredIdleHandle);
    deferredIdleHandle = 0;
    if (deferredLoadHandler)
        window.removeEventListener('load', deferredLoadHandler);
    deferredLoadHandler = null;
    deferredChatWakeObserver?.disconnect?.();
    deferredChatWakeObserver = null;
    deferredChatSurfaceWakeCleanup?.();
    deferredChatSurfaceWakeCleanup = null;
    deferredHostSignature = '';
    deferredHostStableSince = 0;
    generationPrewarmStarted = false;
    generationPrewarmDone = false;
    document.getElementById('rabbit_mirror_wand_bootstrap')?.remove();
    if (wandMenuWaitTimer)
        clearTimeout(wandMenuWaitTimer);
    wandMenuWaitTimer = 0;
    wandMenuWaitCount = 0;
    if (entryCheckTimer)
        clearTimeout(entryCheckTimer);
    entryCheckTimer = 0;
    unregisterRabbitMirrorOpenCommand();
    try {
        const closeSnapshot = globalThis.__rabbitMirrorCloseSnapshot;
        if (closeSnapshot?.runtime === RABBIT_MIRROR_RUNTIME_VERSION)
            closeSnapshot();
    }
    catch { }
    disposeRabbitMirrorStartupGuard();
    removeOnDemandCompatTriggers();
    renderedVisualFeedbackStarted = false;
    checkedSelectorRepairStarted = false;
    destroyFeedbackCatPromptSync();
    destroyPromptHistoryStrip();
    destroyIndependentGenerationIntentBridge({ clearIntents: true });
    clearRabbitMirrorPrompt();
    const modules = deferredRuntimeModules || deferredStartingModules;
    modules?.avatars?.destroyRabbitMirrorChatAvatars?.();
    modules?.ui?.destroyRabbitMirrorUI?.();
    modules?.clearance?.destroyRabbitMirrorComposerClearance?.();
    modules?.output?.destroyOutputSanitizer?.();
    modules?.visual?.destroyVisualScanner?.();
    modules?.independent?.destroyIndependentRabbitMirror?.();
    modules?.touch?.destroyTouchTheaterBridge?.();
    deferredRuntimeModules = null;
    deferredStartingModules = null;
    deferredModuleInitializations.clear();
    destroyRabbitMirrorIndependentSecurityGuard();
    if (globalThis.rabbitMirrorGenerateInterceptor === rabbitMirrorGenerateInterceptor ||
        globalThis.rabbitMirrorGenerateInterceptor === earlyBootstrap?.interceptor)
        delete globalThis.rabbitMirrorGenerateInterceptor;
    clearDeferredGenerationSnapshots();
    disableExternalDiagnostics();
    if (globalThis.__rabbitMirrorEnsureDeferredCoreRuntime === ensureDeferredCoreRuntime) {
        try {
            delete globalThis.__rabbitMirrorEnsureDeferredCoreRuntime;
        }
        catch { }
    }
    try {
        delete globalThis.__rabbitMirrorEnsureExternalDiag;
    }
    catch { }
    try {
        delete globalThis.__rabbitMirrorDisableExternalDiag;
    }
    catch { }
}
export { rabbitMirrorGenerateInterceptor };
export function onClean() {
    if (earlyBootstrap && globalThis.__rabbitMirrorTtBootstrap !== earlyBootstrap)
        return;
    onDisable();
    clearRabbitMirrorPrompt();
    clearLastCombo();
    clearAllFeedbackCatState();
    clearDeferredGenerationSnapshots();
}
