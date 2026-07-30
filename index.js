import { initRabbitMirrorUI, destroyRabbitMirrorUI } from './src/ui.js?rmv=1.1.0b14h1p1';
import { rabbitMirrorGenerateInterceptor, clearRabbitMirrorPrompt } from './src/injector.js?rmv=1.1.0b14h1p1';
import { clearLastCombo } from './src/storage.js?rmv=1.1.0b14h1p1';
import { initVisualScanner } from './src/visualScanner.js?rmv=1.1.0b14h1p1';
import { initOutputSanitizer, destroyOutputSanitizer } from './src/outputSanitizer.js?rmv=1.1.0b14h1p1';
import { clearAllFeedbackCatState, destroyFeedbackCatPromptSync, initFeedbackCatPromptSync } from './src/feedbackCat.js?rmv=1.1.0b14h1p1';
import { getSettings } from './src/settings.js?rmv=1.1.0b14h1p1';
import { clearRabbitMirrorGenerationSnapshots } from './src/generationGuard.js?rmv=1.1.0b14h1p1';

const RABBIT_MIRROR_RUNTIME_VERSION = '1.1.0-beta.14.1.1';

// Claim the active runtime before UI/DOM initialization. Versioned module URLs ensure this file and its internal graph cannot be satisfied by a stale hot-reload cache.
try { globalThis.__rabbitMirrorFeedbackCatSyncCleanup?.(); } catch {}
try { globalThis.__rabbitMirrorOutputSanitizerCleanup?.(); } catch {}
globalThis.__rabbitMirrorRuntimeVersion = RABBIT_MIRROR_RUNTIME_VERSION;

// SillyTavern reads this global function name from manifest.json -> generate_interceptor.
globalThis.rabbitMirrorGenerateInterceptor = rabbitMirrorGenerateInterceptor;

jQuery(async () => {
    initFeedbackCatPromptSync(() => getSettings().feedbackCatEnabled !== false);
    globalThis.__rabbitMirrorFeedbackCatSyncCleanup = destroyFeedbackCatPromptSync;
    initRabbitMirrorUI();
    initOutputSanitizer();
    initVisualScanner();
    console.log(`[RabbitMirror] runtime ${RABBIT_MIRROR_RUNTIME_VERSION} loaded`);
});

export function onDisable() {
    destroyFeedbackCatPromptSync();
    clearRabbitMirrorPrompt();
    destroyRabbitMirrorUI();
    destroyOutputSanitizer();
    clearRabbitMirrorGenerationSnapshots();
}

export function onClean() {
    destroyFeedbackCatPromptSync();
    destroyRabbitMirrorUI();
    destroyOutputSanitizer();
    clearRabbitMirrorPrompt();
    clearLastCombo();
    clearAllFeedbackCatState();
    clearRabbitMirrorGenerationSnapshots();
}
