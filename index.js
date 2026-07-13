import { initRabbitMirrorUI } from './src/ui.js';
import { rabbitMirrorGenerateInterceptor, clearRabbitMirrorPrompt } from './src/injector.js';
import { clearLastCombo } from './src/storage.js';
import { initVisualScanner } from './src/visualScanner.js';
import { initOutputSanitizer } from './src/outputSanitizer.js';

// SillyTavern reads this global function name from manifest.json -> generate_interceptor.
globalThis.rabbitMirrorGenerateInterceptor = rabbitMirrorGenerateInterceptor;

let rabbitMirrorStarted = false;
function startRabbitMirror() {
    if (rabbitMirrorStarted) return;
    rabbitMirrorStarted = true;

    try { initRabbitMirrorUI(); } catch (error) { console.error('[RabbitMirror] UI init failed', error); }
    try { initOutputSanitizer(); } catch (error) { console.error('[RabbitMirror] sanitizer init failed', error); }
    try { initVisualScanner(); } catch (error) { console.error('[RabbitMirror] scanner init failed', error); }
    console.log('[RabbitMirror] loaded v0.31.80');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startRabbitMirror, { once: true });
} else {
    startRabbitMirror();
}

// Compatibility fallback for SillyTavern builds that initialize extension UI through jQuery ready.
try { globalThis.jQuery?.(startRabbitMirror); } catch {}

export function onDisable() {
    clearRabbitMirrorPrompt();
}

export function onClean() {
    clearRabbitMirrorPrompt();
    clearLastCombo();
}
