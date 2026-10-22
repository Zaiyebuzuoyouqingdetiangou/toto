// 启动自检必须是第一个 import：后面任何启动文件加载时抛错，它都已经在听了。
import { markRabbitMirrorBootstrapEvaluated, runRabbitMirrorStartupStep, reportRabbitMirrorStartupFailure, setRabbitMirrorStartupOpener, setRabbitMirrorOpenCommandAvailable, checkRabbitMirrorEntryVisibility, checkRabbitMirrorDuplicateInstall, disposeRabbitMirrorStartupGuard } from './src/startupGuard.js?rmv=1.76.10';
import { unregisterRabbitMirrorOpenCommand, watchRabbitMirrorOpenCommand } from './src/openCommand.js?rmv=1.76.10';
import { rabbitMirrorGenerateInterceptor, clearRabbitMirrorPrompt, destroyIndependentGenerationIntentBridge, initIndependentGenerationIntentBridge, prewarmRabbitMirrorGenerationRuntime } from './src/injector.js?rmv=1.76.10';
import { clearLastCombo } from './src/storage.js?rmv=1.76.10';
import { clearAllFeedbackCatState, destroyFeedbackCatPromptSync, initFeedbackCatPromptSync } from './src/feedbackCat.js?rmv=1.76.10';
import { initPromptHistoryStrip, destroyPromptHistoryStrip } from './src/promptHistoryStrip.js?rmv=1.76.10';
import { getSettings, updateSettings } from './src/settings.js?rmv=1.76.10';
import { installRabbitMirrorPublicAPI } from './src/publicApi.js?rmv=1.76.10';
import { initRabbitMirrorIndependentSecurityGuard, destroyRabbitMirrorIndependentSecurityGuard } from './src/independentSecurityGuard.js?rmv=1.76.10';
import { initRabbitMirrorHostCompatibility, isRabbitMirrorManagedChatSurface, getRabbitMirrorMountedMessages, subscribeRabbitMirrorChatSurface, getRabbitMirrorEarlyBootstrap, getRabbitMirrorHostCompatibilityStatus } from './src/hostCompatibility.js?rmv=1.76.10';

// TT requires ownership registration before its first projection, not after the
// deferred DOM runtime loads. This bridge has no network, timers or heavy imports.
runRabbitMirrorStartupStep('接入宿主聊天', () => initRabbitMirrorHostCompatibility());

// SecurityFix2 leaves only the prompt interceptor and request guard in the parser-critical
// graph. The 1.8 MiB UI/sanitizer/independent runtime graph is imported after the host has
// received a paint/idle opportunity, or immediately after explicit RabbitMirror intent.
const GOLDEN_MERGE_VERSION = '1.76.10';
const RABBIT_MIRROR_RUNTIME_VERSION = '1.76.10';
const earlyBootstrap = getRabbitMirrorEarlyBootstrap();
let runtimeCancelled = earlyBootstrap?.cancelled === true || (!!globalThis.__rabbitMirrorTtBootstrap && !earlyBootstrap);
let runtimeClaimed = !runtimeCancelled;
const runtimeIsActive = () => !runtimeCancelled && (earlyBootstrap
    ? globalThis.__rabbitMirrorTtBootstrap === earlyBootstrap && !earlyBootstrap.cancelled
    : !globalThis.__rabbitMirrorTtBootstrap);
const disposePublicAPI = runtimeIsActive() ? installRabbitMirrorPublicAPI(runtimeIsActive) : null;
// 页面里已经有别处的兔子镜启动桩（别的文件夹、别的版本）：这一份让位，但要说出来，不能什么都不显示。
function standDownError() {
    const error = new Error('页面里已有另一份兔子镜先启动（启动桩来自别的文件夹或别的版本），这一份不启动。请只保留一份兔子镜：到「管理扩展」删掉另一份，然后刷新网页。');
    error.stack = '';
    return error;
}
if (runtimeCancelled) reportRabbitMirrorStartupFailure('接管运行', standDownError(), { canOpen: false });
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
try { globalThis.__rabbitMirrorFeedbackCatSyncCleanup?.(); } catch {}
globalThis.__rabbitMirrorRuntimeVersion = RABBIT_MIRROR_RUNTIME_VERSION;
globalThis.rabbitMirrorGenerateInterceptor = earlyBootstrap?.interceptor || rabbitMirrorGenerateInterceptor;
globalThis.__rabbitMirrorGoldenMerge = {
    version: GOLDEN_MERGE_VERSION,
    deferredReady: () => !!deferredRuntimeModules,
    optionalLoaded: () => [],
};
// The lightweight generation interceptor calls this without awaiting it when
// independent mode is selected. That closes the cold-start event gap without
// making the host's main generation wait for the 1.8 MiB UI/runtime graph.
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
    } catch {}
}

function canCleanDeferredModule() {
    const current = globalThis.__rabbitMirrorEnsureDeferredCoreRuntime;
    return (!current || current === ensureDeferredCoreRuntime) && (earlyBootstrap
        ? globalThis.__rabbitMirrorTtBootstrap === earlyBootstrap
        : !globalThis.__rabbitMirrorTtBootstrap);
}

const DEFERRED_MODULE_LABELS = {
    output: '美化与维修', visual: '画面检查', independent: '独立 API', touch: '触摸小剧场',
    ui: '设置界面', clearance: '输入框避让', avatars: '聊天头像',
};

function initializeDeferredModule(name, module, initialize, destroy) {
    if (deferredModuleInitializations.has(name)) return deferredModuleInitializations.get(name);
    const cleanup = () => {
        if (!canCleanDeferredModule()) return;
        try { module[destroy]?.(); }
        catch (error) { console.warn(`[RabbitMirror] ${name} startup cleanup failed:`, error); }
    };
    const task = Promise.resolve().then(async () => {
        if (!runtimeIsActive()) return;
        try {
            await module[initialize]?.({ isActive: runtimeIsActive });
            if (!runtimeIsActive()) cleanup();
        } catch (error) {
            cleanup();
            try { if (error && typeof error === 'object') error.rabbitMirrorStartupStep ??= name; } catch {}
            throw error;
        }
    }).catch(error => {
        if (deferredModuleInitializations.get(name) === task) deferredModuleInitializations.delete(name);
        throw error;
    });
    deferredModuleInitializations.set(name, task);
    return task;
}

async function ensureDeferredCoreRuntime(reason = 'scheduled-idle') {
    if (!runtimeIsActive()) return null;
    if (deferredRuntimeModules) return deferredRuntimeModules;
    if (deferredRuntimePromise) return deferredRuntimePromise;
    deferredRuntimePromise = Promise.all([
        import('./src/outputSanitizer.js?rmv=1.76.10'),
        import('./src/visualScanner.js?rmv=1.76.10'),
        import('./src/independentApi.js?rmv=1.76.10'),
        import('./src/touchTheater.js?rmv=1.76.10'),
        import('./src/ui.js?rmv=1.76.10'),
        import('./src/composerClearance.js?rmv=1.76.10'),
        import('./src/chatAvatars.js?rmv=1.76.10'),
    ]).then(async ([output, visual, independent, touch, ui, clearance, avatars]) => {
        if (!runtimeIsActive()) return null;
        const modules = { output, visual, independent, touch, ui, clearance, avatars };
        // Loaded modules remain available to disable/cleanup, but do not imply
        // readiness. Keep successful/pending initializers when another one fails.
        deferredStartingModules = modules;
        await Promise.all([
            initializeDeferredModule('output', output, 'initOutputSanitizer', 'destroyOutputSanitizer'),
            initializeDeferredModule('visual', visual, 'initVisualScanner', 'destroyVisualScanner'),
            initializeDeferredModule('independent', independent, 'initIndependentRabbitMirror', 'destroyIndependentRabbitMirror'),
        ]);
        if (!runtimeIsActive()) return null;
        await initializeDeferredModule('touch', touch, 'initTouchTheaterBridge', 'destroyTouchTheaterBridge');
        if (!runtimeIsActive()) return null;
        await initializeDeferredModule('ui', ui, 'initRabbitMirrorUI', 'destroyRabbitMirrorUI');
        if (!runtimeIsActive()) return null;
        await initializeDeferredModule('clearance', clearance, 'initRabbitMirrorComposerClearance', 'destroyRabbitMirrorComposerClearance');
        if (!runtimeIsActive()) return null;
        await initializeDeferredModule('avatars', avatars, 'initRabbitMirrorChatAvatars', 'destroyRabbitMirrorChatAvatars');
        if (!runtimeIsActive()) return null;
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
        if (runtimeIsActive()) reportRabbitMirrorStartupFailure(step ? `启动${step}` : '加载兔子镜主体', error, { canOpen: false });
        return null;
    });
    return deferredRuntimePromise;
}

function hostControlVisible(selector) {
    try {
        const node = document?.querySelector?.(selector);
        if (!node || node.hidden || node.classList?.contains('displayNone') || node.getAttribute?.('aria-hidden') === 'true') return false;
        const style = globalThis.getComputedStyle?.(node);
        if (style && (style.display === 'none' || style.visibility === 'hidden' || style.contentVisibility === 'hidden')) return false;
        const rects = node.getClientRects?.();
        return !rects || rects.length > 0;
    } catch { return false; }
}

function hostLooksBusy() {
    try {
        const context = globalThis.SillyTavern?.getContext?.();
        if ([context?.isGenerating, context?.is_generating, context?.is_send_press, globalThis.is_send_press, globalThis.is_group_generating].some(value => value === true)) return true;
        const streamingMessage = document?.querySelector?.('#chat .mes.streaming, #chat .mes[data-is-streaming="true"], #chat .mes[is_generating="true"], #chat .mes[data-generating="true"]');
        return !!streamingMessage || hostControlVisible('#mes_stop') || hostControlVisible('#stop_but');
    } catch { return true; }
}

function stableHostChatSignature() {
    try {
        const chatRoot = document?.querySelector?.('#chat');
        if (!chatRoot?.isConnected || document?.readyState !== 'complete') return '';
        const context = globalThis.SillyTavern?.getContext?.();
        const chat = Array.isArray(context?.chat) ? context.chat : [];
        if (chat.length) {
            if (isRabbitMirrorManagedChatSurface()) {
                // The tail may legitimately be virtualized away. Only use public
                // mounted leases; never materialize history just to start our runtime.
                const mounted = getRabbitMirrorMountedMessages().filter(item => item.element?.isConnected);
                if (!mounted.length) return '';
                return `${chat.length}:managed:${mounted.map(item => item.mesid).join(',')}`;
            }
            const tail = chat.length - 1;
            const renderedTail = chatRoot.querySelector?.(`.mes[mesid="${tail}"], [mesid="${tail}"].mes`);
            if (!renderedTail?.isConnected) return '';
            return `${chat.length}:${tail}:${renderedTail.getAttribute?.('mesid') || ''}:${String(chat[tail]?.mes || '').length}`;
        }
        // An empty context is indistinguishable from a chat that has not finished
        // loading. Fail closed; a genuinely new empty chat needs no background DOM runtime.
        return '';
    } catch { return ''; }
}

function shouldBypassEmptyChatGate() {
    try {
        const status = getRabbitMirrorHostCompatibilityStatus();
        return status.host === 'tauritavern' && status.managed === true && status.registered !== true;
    } catch { return false; }
}

function bootTtLateProjectionRuntime() {
    if (!runtimeIsActive() || deferredRuntimeModules || deferredRuntimePromise) return false;
    if (!shouldBypassEmptyChatGate()) return false;
    if (deferredTtBootTimer) {
        clearTimeout(deferredTtBootTimer);
        deferredTtBootTimer = 0;
    }
    void ensureDeferredCoreRuntime('tt-late-projection');
    return true;
}

function scheduleTtLateProjectionBackup() {
    if (deferredTtBootTimer || deferredRuntimeModules || deferredRuntimePromise) return;
    deferredTtBootTimer = setTimeout(() => {
        deferredTtBootTimer = 0;
        if (!runtimeIsActive() || deferredRuntimeModules || deferredRuntimePromise) return;
        if (bootTtLateProjectionRuntime()) return;
        if (++deferredTtBootAttempts > 24) return;
        scheduleTtLateProjectionBackup();
    }, deferredTtBootAttempts ? 250 : 50);
}

function requestDeferredIdleCheck(delay = 1400) {
    if (!runtimeIsActive() || deferredRuntimeModules || deferredRuntimePromise) return;
    if (bootTtLateProjectionRuntime()) return;
    deferredBootTimer = setTimeout(() => {
        deferredBootTimer = 0;
        if (bootTtLateProjectionRuntime()) return;
        if (typeof globalThis.requestIdleCallback === 'function') {
            // SillyTavern keeps no timeout so a long chat load cannot be forced
            // onto the 1.8 MiB graph. TT already deferred third-party until after
            // APP_READY; iOS WKWebView idle often never comes under virtualization.
            deferredIdleHandle = globalThis.__TAURITAVERN__
                ? globalThis.requestIdleCallback(runDeferredBoot, { timeout: 2000 })
                : globalThis.requestIdleCallback(runDeferredBoot);
        } else {
            runDeferredBoot();
        }
    }, Math.max(600, Number(delay) || 1400));
}

function beginGenerationRuntimePrewarm() {
    if (generationPrewarmStarted || generationPrewarmDone || !runtimeIsActive()) return false;
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
                didMount() { if (!deferredBootTimer && !deferredIdleHandle) requestDeferredIdleCheck(1200); },
            });
        }
        return true;
    }
    if (deferredChatWakeObserver || typeof MutationObserver !== 'function') return false;
    const chatRoot = document?.querySelector?.('#chat');
    if (!chatRoot?.isConnected) return false;
    deferredChatWakeObserver = new MutationObserver(records => {
        if (!records?.some(record => Number(record?.addedNodes?.length || 0) > 0)) return;
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
    if (bootTtLateProjectionRuntime()) return;
    const signature = stableHostChatSignature();
    if (hostLooksBusy()) {
        deferredHostSignature = '';
        deferredHostStableSince = 0;
        requestDeferredIdleCheck(1600);
        return;
    }
    if (!signature) {
        // Empty chat and not-yet-loaded chat are intentionally indistinguishable for
        // the heavy DOM graph. A no-timeout idle slot may still prewarm only the much
        // smaller generation graph so the first send does not pay its parse cost.
        installDeferredChatWakeObserver();
        if (bootTtLateProjectionRuntime()) return;
        if (!generationPrewarmDone && beginGenerationRuntimePrewarm()) return;
        if (!generationPrewarmDone && generationPrewarmStarted) return;
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
    if (bootTtLateProjectionRuntime()) return;
    const schedule = () => {
        if (!runtimeIsActive() || deferredRuntimeModules || deferredRuntimePromise) return;
        if (bootTtLateProjectionRuntime()) return;
        // SillyTavern still waits for a stable idle chat. TT late-projection
        // already returned above; remaining TT paths use a 2s idle timeout.
        requestDeferredIdleCheck(3500);
        scheduleTtLateProjectionBackup();
    };
    if (document?.readyState === 'complete') schedule();
    else {
        deferredLoadHandler = () => { deferredLoadHandler = null; schedule(); };
        window.addEventListener('load', deferredLoadHandler, { once: true });
        // WKWebView injected scripts can miss window load. Keep a bounded backup.
        scheduleTtLateProjectionBackup();
    }
}

let renderedVisualFeedbackStarted = false;
let checkedSelectorRepairStarted = false;

function loadMirrorVisualCompat() {
    // A normal details/label/radio click must never bootstrap the whole heavy graph.
    // Compatibility helpers may join only after the runtime was already loaded at a
    // stable idle boundary or by an explicit RabbitMirror settings/maintenance action.
    if (!deferredRuntimeModules) return Promise.resolve(null);
    if (!renderedVisualFeedbackStarted) {
        renderedVisualFeedbackStarted = true;
        try { deferredRuntimeModules.visual.initRenderedVisualFeedback?.(); }
        catch (error) {
            renderedVisualFeedbackStarted = false;
            console.warn('[RabbitMirror] rendered visual feedback init failed:', error);
        }
    }
    if (!checkedSelectorRepairStarted) {
        checkedSelectorRepairStarted = true;
        try { deferredRuntimeModules.output.initRabbitMirrorCheckedSelectorRepair?.(); }
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
    return !!target?.closest?.('#rabbit_mirror_theater_settings, #rh_independent_api_fields, #rh_generation_independent, [data-extension-name="兔子镜"]');
}

// 魔法棒入口、/兔子镜 命令、自检提示里的按钮都走这里打开设置。
async function openRabbitMirrorSettings(reason = 'open-intent') {
    // 启动后才被别处的兔子镜接管：入口还在菜单里，点了要说明，不能没反应。
    if (!runtimeIsActive()) { if (runtimeClaimed) throw standDownError(); return false; }
    const modules = await ensureDeferredCoreRuntime(reason);
    if (!runtimeIsActive()) { if (runtimeClaimed) throw standDownError(); return false; }
    const workbench = document.getElementById('rabbit_mirror_theater_settings')?.__rabbitMirrorWorkbench;
    // 主体加载失败时抛回原来那个错误：自检按错误去重，不会再弹一个说不清原因的提示。
    if (!workbench) throw (!modules && lastCoreLoadError) || new Error(modules ? '设置界面没有挂上' : '兔子镜主体没有加载成功');
    workbench.open();
    return true;
}

function openRabbitMirrorSettingsFromCommand() {
    return openRabbitMirrorSettings('slash-command').catch(error => {
        if (runtimeClaimed) reportRabbitMirrorStartupFailure('用 /兔子镜 打开设置', error, { canOpen: false, opening: true });
        return false;
    });
}

let entryCheckTimer = 0;
let lastCoreLoadError = null;
function scheduleEntryVisibilityCheck(delay = 5000, options = {}) {
    if (entryCheckTimer) clearTimeout(entryCheckTimer);
    entryCheckTimer = setTimeout(() => {
        entryCheckTimer = 0;
        if (!runtimeIsActive()) return;
        void checkRabbitMirrorEntryVisibility(options).catch(error => console.debug('[RabbitMirror] entry check skipped:', error));
    }, delay);
}

// 魔法棒菜单（#extensionsMenu）还没出现就先等；等了 20 秒还没有，说出来，别让人以为没装上。
let wandMenuWaitTimer = 0;
let wandMenuWaitCount = 0;
function waitForWandMenu() {
    if (wandMenuWaitTimer || !runtimeIsActive()) return;
    if (wandMenuWaitCount >= 40) {
        wandMenuWaitCount = 0;
        reportRabbitMirrorStartupFailure('魔法棒入口', new Error('页面上一直没有魔法棒菜单（#extensionsMenu），兔子镜的入口没地方放。可能是美化或别的插件把魔法棒换掉了。'));
        return;
    }
    wandMenuWaitCount += 1;
    wandMenuWaitTimer = setTimeout(() => { wandMenuWaitTimer = 0; installSettingsWandEntry(); }, 500);
}

function installSettingsWandEntry() {
    if (!runtimeIsActive() || document.getElementById('rabbit_mirror_wand_entry')) return;
    const menu = document.getElementById('extensionsMenu');
    if (!menu) { waitForWandMenu(); return; }
    wandMenuWaitCount = 0;
    if (document.getElementById('rabbit_mirror_wand_bootstrap')) return;
    const entry = document.createElement('div');
    entry.id = 'rabbit_mirror_wand_bootstrap';
    entry.setAttribute('role', 'button');
    entry.tabIndex = 0;
    entry.className = 'list-group-item flex-container flexGap5';
    entry.style.cssText = 'background:transparent;background-color:transparent;color:inherit;border:0;box-shadow:none;appearance:none;-webkit-appearance:none;';
    entry.innerHTML = '<span class="extensionsMenuExtensionButton rabbit-mirror-wand-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 16C4 2 11 1 14 14M18 14C20 1 27 2 23 16M9 16c-7 11 3 15 9 14s13-8 5-14c-4-3-10-3-14 0Z"/><path d="M12 22h1m6 0h1m-6 4 2 1 2-1"/></svg></span><span>兔子镜</span>';
    entry.setAttribute('aria-haspopup', 'dialog');
    entry.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        if (!event.repeat) entry.click();
    });
    entry.addEventListener('click', async () => {
        if (entry.disabled || !runtimeClaimed) return;
        entry.disabled = true;
        entry.setAttribute('aria-disabled', 'true');
        const label = entry.querySelector('span:last-child');
        if (label) label.textContent = '正在打开兔子镜…';
        try {
            await openRabbitMirrorSettings('wand-settings-intent');
        } catch (error) {
            if (entry.isConnected && runtimeClaimed && label) label.textContent = '打开失败，点击重试兔子镜';
            console.debug('[RabbitMirror] settings entry could not open:', error);
            if (runtimeClaimed) reportRabbitMirrorStartupFailure('从魔法棒打开设置', error, { canOpen: false, opening: true });
        } finally { if (entry.isConnected) { entry.disabled = false; entry.removeAttribute('aria-disabled'); } }
    });
    menu.append(entry);
}

function installOnDemandCompatTriggers() {
    if (typeof document === 'undefined') return;
    lazyPointerHandler = event => {
        const target = event?.target;
        if (!target?.closest || event?.isTrusted === false) return;
        if (isRabbitMirrorSettingsSurface(target)) {
            void ensureDeferredCoreRuntime('settings-intent');
        }
        if (target.closest?.('[data-rabbit-mirror-maintenance-rabbit="true"]')) void loadMaintenanceCompat();
    };
    lazyFocusHandler = event => {
        const target = event?.target;
        if (!target?.closest || event?.isTrusted === false) return;
        if (isRabbitMirrorSettingsSurface(target)) {
            void ensureDeferredCoreRuntime('settings-focus');
        }
        if (target.closest?.('[data-rabbit-mirror-maintenance-rabbit="true"]')) void loadMaintenanceCompat();
    };
    lazyClickHandler = event => {
        const target = event?.target;
        if (target?.closest?.('#extensionsMenuButton')) {
            installSettingsWandEntry();
            // 菜单刚打开时看一眼兔子镜入口是不是真的显示出来了。
            scheduleEntryVisibilityCheck(450, { menuOpen: true });
        }
        if (!target?.closest || event?.isTrusted === false || !isRabbitMirrorSurface(target)) return;
        // Native details/label/radio interaction completes first. If the heavy runtime
        // is not already ready, this click stays entirely native and performs no import.
        setTimeout(() => { if (deferredRuntimeModules) void loadMirrorVisualCompat(); }, 700);
    };
    document.addEventListener('pointerover', lazyPointerHandler, true);
    document.addEventListener('pointerdown', lazyPointerHandler, true);
    document.addEventListener('focusin', lazyFocusHandler, true);
    document.addEventListener('click', lazyClickHandler, false);
}

function removeOnDemandCompatTriggers() {
    if (typeof document === 'undefined') return;
    if (lazyPointerHandler) {
        document.removeEventListener('pointerover', lazyPointerHandler, true);
        document.removeEventListener('pointerdown', lazyPointerHandler, true);
    }
    if (lazyFocusHandler) document.removeEventListener('focusin', lazyFocusHandler, true);
    if (lazyClickHandler) document.removeEventListener('click', lazyClickHandler, false);
    lazyPointerHandler = null;
    lazyFocusHandler = null;
    lazyClickHandler = null;
}

async function ensureExternalDiagnostics() {
    if (!runtimeIsActive()) return null;
    externalDiagnosticsDesiredEnabled = true;
    if (externalDiagnosticsApi) return externalDiagnosticsApi;
    if (externalDiagnosticsPromise) return externalDiagnosticsPromise;
    const revision = ++externalDiagnosticsOperationRevision;
    const loadPromise = import('./src/externalDiagnostics.js?rmv=1.76.10').then(mod => {
        if (!runtimeIsActive() || !externalDiagnosticsDesiredEnabled || revision !== externalDiagnosticsOperationRevision) return null;
        externalDiagnosticsModule = mod;
        externalDiagnosticsApi = mod.initRabbitMirrorExternalDiagnostics?.() || null;
        externalDiagnosticsApi?.mark?.('externalDiag.userEnabled', { readyState: String(document?.readyState || '') });
        return externalDiagnosticsApi;
    }).finally(() => {
        if (externalDiagnosticsPromise === loadPromise) externalDiagnosticsPromise = null;
    });
    externalDiagnosticsPromise = loadPromise;
    return loadPromise;
}

function disableExternalDiagnostics() {
    externalDiagnosticsDesiredEnabled = false;
    externalDiagnosticsOperationRevision += 1;
    externalDiagnosticsPromise = null;
    try { externalDiagnosticsModule?.destroyRabbitMirrorExternalDiagnostics?.(); } catch {}
    externalDiagnosticsApi = null;
}

function clearDeferredGenerationSnapshots() {
    void import('./src/generationGuard.js?rmv=1.76.10')
        .then(mod => {
            // Disable may await this import while a newer installation takes
            // ownership. Do not clear that owner's shared snapshot/attempt keys.
            if (earlyBootstrap ? globalThis.__rabbitMirrorTtBootstrap !== earlyBootstrap : !!globalThis.__rabbitMirrorTtBootstrap) return;
            mod.clearRabbitMirrorGenerationSnapshots?.();
        })
        .catch(() => {});
}

if (!runtimeCancelled) {
    globalThis.__rabbitMirrorEnsureExternalDiag = ensureExternalDiagnostics;
    globalThis.__rabbitMirrorDisableExternalDiag = disableExternalDiagnostics;
}

markRabbitMirrorBootstrapEvaluated();

jQuery(() => {
    if (!runtimeIsActive()) return;
    // 每一步单独包起来：一步出错只弹提示，后面的入口照样装上。
    const step = runRabbitMirrorStartupStep;
    setRabbitMirrorStartupOpener(reason => openRabbitMirrorSettings(reason));
    captureDeferredBootBoundary();
    step('反馈猫提示同步', () => {
        initFeedbackCatPromptSync(() => getSettings().feedbackCatEnabled !== false);
        globalThis.__rabbitMirrorFeedbackCatSyncCleanup = destroyFeedbackCatPromptSync;
    });
    // 发送前去掉聊天记录里的旧兔子镜（不用再靠用户配正则）；本轮注入说明原样保留。
    step('发送前清理旧兔子镜', () => initPromptHistoryStrip(() => getSettings().stripOldMirrorsBeforeSend !== false));
    step('独立 API 生成衔接', () => initIndependentGenerationIntentBridge());
    step('独立 API 安全防护', () => initRabbitMirrorIndependentSecurityGuard({ getSettings, updateSettings }));
    step('按需加载触发', () => installOnDemandCompatTriggers());
    step('魔法棒入口', () => installSettingsWandEntry());
    // 同步登记失败不抛错；鸡尾酒+还可能晚点才换上真正执行输入的解析器，所以这里会再补登记。
    step('/兔子镜 命令', () => watchRabbitMirrorOpenCommand(
        openRabbitMirrorSettingsFromCommand,
        runtimeIsActive,
        setRabbitMirrorOpenCommandAvailable,
    ));
    step('安排加载兔子镜主体', () => { if (!bootTtLateProjectionRuntime()) scheduleDeferredCoreRuntime(); });
    setTimeout(() => { if (runtimeIsActive()) void checkRabbitMirrorDuplicateInstall().catch(() => {}); }, 4000);
    console.log(`[RabbitMirror] lightweight bootstrap ${RABBIT_MIRROR_RUNTIME_VERSION} ready; heavy runtime deferred`);
});

export function onDisable() {
    disposePublicAPI?.();
    runtimeCancelled = true;
    if (earlyBootstrap && globalThis.__rabbitMirrorTtBootstrap !== earlyBootstrap) return;
    if (!runtimeClaimed) return;
    runtimeClaimed = false;
    if (deferredBootTimer) clearTimeout(deferredBootTimer);
    deferredBootTimer = 0;
    if (deferredTtBootTimer) clearTimeout(deferredTtBootTimer);
    deferredTtBootTimer = 0;
    deferredTtBootAttempts = 0;
    if (deferredIdleHandle && typeof globalThis.cancelIdleCallback === 'function') globalThis.cancelIdleCallback(deferredIdleHandle);
    deferredIdleHandle = 0;
    if (deferredLoadHandler) window.removeEventListener('load', deferredLoadHandler);
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
    if (wandMenuWaitTimer) clearTimeout(wandMenuWaitTimer);
    wandMenuWaitTimer = 0;
    wandMenuWaitCount = 0;
    if (entryCheckTimer) clearTimeout(entryCheckTimer);
    entryCheckTimer = 0;
    unregisterRabbitMirrorOpenCommand();
    try {
        const closeSnapshot = globalThis.__rabbitMirrorCloseSnapshot;
        if (closeSnapshot?.runtime === RABBIT_MIRROR_RUNTIME_VERSION) closeSnapshot();
    } catch { /* 快拍没开 */ }
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
        globalThis.rabbitMirrorGenerateInterceptor === earlyBootstrap?.interceptor) delete globalThis.rabbitMirrorGenerateInterceptor;
    clearDeferredGenerationSnapshots();
    disableExternalDiagnostics();
    if (globalThis.__rabbitMirrorEnsureDeferredCoreRuntime === ensureDeferredCoreRuntime) {
        try { delete globalThis.__rabbitMirrorEnsureDeferredCoreRuntime; } catch {}
    }
    try { delete globalThis.__rabbitMirrorEnsureExternalDiag; } catch {}
    try { delete globalThis.__rabbitMirrorDisableExternalDiag; } catch {}
}

export { rabbitMirrorGenerateInterceptor };

export function onClean() {
    if (earlyBootstrap && globalThis.__rabbitMirrorTtBootstrap !== earlyBootstrap) return;
    onDisable();
    clearRabbitMirrorPrompt();
    clearLastCombo();
    clearAllFeedbackCatState();
    clearDeferredGenerationSnapshots();
}
