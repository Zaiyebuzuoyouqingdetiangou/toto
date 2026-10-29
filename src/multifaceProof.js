import { presentationModeFields } from './presentationMode.js?rmv=1.99.19';
const sanitizedFaceProofs = new WeakMap();
export function rabbitMirrorMultifaceSourceHash(text = '') {
    let hash = 2166136261;
    for (const char of String(text || '')) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}
const messageSourceHashes = new WeakMap();
export function rabbitMirrorMessageSourceHash(message) {
    if (!message || typeof message !== 'object')
        return rabbitMirrorMultifaceSourceHash('');
    const source = String(message.mes || '');
    let cached = messageSourceHashes.get(message);
    if (!cached || cached.source !== source) {
        cached = { source, hash: rabbitMirrorMultifaceSourceHash(source) };
        messageSourceHashes.set(message, cached);
    }
    return cached.hash;
}
export function markSanitizedRabbitMirrorFace(root, proof = {}) {
    if (!root || typeof root !== 'object')
        return false;
    const faceIndex = Number(proof.faceIndex);
    const faceCount = Number(proof.faceCount);
    if (!Number.isInteger(faceIndex) || !Number.isInteger(faceCount)
        || faceCount < 1 || faceCount > 5 || faceIndex < 0 || faceIndex >= faceCount)
        return false;
    const value = Object.freeze({
        faceIndex,
        faceCount,
        sourceHash: String(proof.sourceHash || ''),
        origin: String(proof.origin || ''),
        ...presentationModeFields(proof),
    });
    sanitizedFaceProofs.set(root, value);
    return true;
}
export function getSanitizedRabbitMirrorFaceProof(root) {
    return root && typeof root === 'object' ? (sanitizedFaceProofs.get(root) || null) : null;
}
export function clearSanitizedRabbitMirrorFaceProof(root) {
    return !!(root && typeof root === 'object' && sanitizedFaceProofs.delete(root));
}
