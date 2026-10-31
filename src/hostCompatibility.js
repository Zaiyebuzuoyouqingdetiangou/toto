import { recordTtSurface, ttSurfaceNow } from './ttSurfaceDiagnostics.js?rmv=2.3.1';
import { createRabbitMirrorHostCompatibility as createHostCompatibility } from './hostCompatibilityCore.js?rmv=2.3.1';
const COHORT = '1.5.58-fork1';
const rootUrl = new URL('../', import.meta.url).href;
export function getRabbitMirrorEarlyBootstrap() {
    const entry = globalThis.__rabbitMirrorTtBootstrap;
    return entry?.cohort === COHORT && entry.rootUrl === rootUrl
        && entry.host === globalThis.__TAURITAVERN__ ? entry : null;
}
export function createRabbitMirrorHostCompatibility(hostGlobal = globalThis) {
    return createHostCompatibility(hostGlobal, { record: recordTtSurface, now: ttSurfaceNow });
}
const compatibility = getRabbitMirrorEarlyBootstrap()?.bridge || createRabbitMirrorHostCompatibility();
if (globalThis.__rabbitMirrorTtBootstrap && !getRabbitMirrorEarlyBootstrap())
    compatibility.dispose();
compatibility.attachDiagnostics({ record: recordTtSurface, now: ttSurfaceNow });
export const initRabbitMirrorHostCompatibility = () => compatibility.initialize();
export const isRabbitMirrorManagedChatSurface = () => compatibility.isManaged();
export const getRabbitMirrorHostCompatibilityStatus = () => compatibility.getStatus();
export const subscribeRabbitMirrorChatSurface = definition => compatibility.subscribe(definition);
export const getRabbitMirrorMountedMessages = () => compatibility.getMountedMessages();
export const getRabbitMirrorExternalPlacementParent = message => compatibility.externalPlacementParent(message);
export const applyRabbitMirrorHostSurface = (element, surface) => compatibility.applySurface(element, surface);
