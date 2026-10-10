import { presentationModeFields } from './presentationMode.js?rmv=1.67.57';
const sanitizedFaceProofs = new WeakMap();

export function rabbitMirrorMultifaceSourceHash(text = '') {
    let hash = 2166136261;
    for (const char of String(text || '')) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

// 同一条消息的正文指纹在挂载、头像绑定、逐面重掷里被反复算；按消息对象记住上一次的结果，
// 正文字符串没变（同一个字符串）就直接用，变了才重算。
const messageSourceHashes = new WeakMap();
export function rabbitMirrorMessageSourceHash(message) {
    if (!message || typeof message !== 'object') return rabbitMirrorMultifaceSourceHash('');
    const source = String(message.mes || '');
    let cached = messageSourceHashes.get(message);
    if (!cached || cached.source !== source) { cached = { source, hash: rabbitMirrorMultifaceSourceHash(source) }; messageSourceHashes.set(message, cached); }
    return cached.hash;
}

export function markSanitizedRabbitMirrorFace(root, proof = {}) {
    if (!root || typeof root !== 'object') return false;
    const faceIndex = Number(proof.faceIndex);
    const faceCount = Number(proof.faceCount);
    if (!Number.isInteger(faceIndex) || !Number.isInteger(faceCount)
        || faceCount < 1 || faceCount > 5 || faceIndex < 0 || faceIndex >= faceCount) return false;
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
