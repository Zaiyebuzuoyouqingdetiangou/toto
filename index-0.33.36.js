import { initRabbitMirrorUI, destroyRabbitMirrorUI } from './src/ui.js?rmv=0.33.36';
import { rabbitMirrorGenerateInterceptor, clearRabbitMirrorPrompt } from './src/injector.js?rmv=0.33.36';
import { clearLastCombo } from './src/storage.js?rmv=0.33.36';
import { initVisualScanner } from './src/visualScanner.js?rmv=0.33.36';
import { initOutputSanitizer, destroyOutputSanitizer } from './src/outputSanitizer.js?rmv=0.33.36';
import { clearAllFeedbackCatState } from './src/feedbackCat.js?rmv=0.33.36';

const RABBIT_MIRROR_RUNTIME_VERSION = '0.33.36';

// Claim the active runtime before UI/DOM initialization. Versioned module URLs ensure this file and its internal graph cannot be satisfied by a stale hot-reload cache.
globalThis.__rabbitMirrorRuntimeVersion = RABBIT_MIRROR_RUNTIME_VERSION;

// SillyTavern reads this global function name from manifest.json -> generate_interceptor.
globalThis.rabbitMirrorGenerateInterceptor = rabbitMirrorGenerateInterceptor;

jQuery(async () => {
    initRabbitMirrorUI();
    initOutputSanitizer();
    initVisualScanner();
    console.log(`[RabbitMirror] runtime ${RABBIT_MIRROR_RUNTIME_VERSION} loaded`);
});

export function onDisable() {
    clearRabbitMirrorPrompt();
    destroyRabbitMirrorUI();
    destroyOutputSanitizer();
}

export function onClean() {
    destroyRabbitMirrorUI();
    destroyOutputSanitizer();
    clearRabbitMirrorPrompt();
    clearLastCombo();
    clearAllFeedbackCatState();
}
