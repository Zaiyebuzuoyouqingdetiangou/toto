import { getCurrentChatKey, commitRetriedFaceHistory } from './storage.js?rmv=1.99.21';
import { parseMultifaceOutput } from './multifaceProtocol.js?rmv=1.99.21';
import { recipeFromSelectionMetadata } from './blacklist.js?rmv=1.99.21';
import { readFollowPartialResult } from './followPartialResults.js?rmv=1.99.21';
import { rabbitMirrorMessageSourceHash } from './multifaceProof.js?rmv=1.99.21';
export function followRetryCombo(metadata, localIndex, fallback = null) {
    try {
        const recipe = recipeFromSelectionMetadata(metadata, { faceIndex: localIndex });
        if (recipe && (recipe.themeIds?.length || recipe.formatIds?.length || recipe.pureOrder))
            return recipe;
    }
    catch { }
    return fallback && typeof fallback === 'object' ? fallback : null;
}
export async function recordFollowRetriedFaces({ chat, index, message, html, combos = {}, scanHtml = null } = {}) {
    try {
        const faceIndexes = Object.keys(combos).map(Number).filter(faceIndex => Number.isInteger(faceIndex) && combos[faceIndex]);
        if (!faceIndexes.length)
            return 0;
        const parsed = parseMultifaceOutput(String(html || ''), { allowProse: true });
        if (!parsed.faces?.length)
            return 0;
        let scan = typeof scanHtml === 'function' ? scanHtml : null;
        if (!scan) {
            try {
                scan = (await import('./visualScanner.js?rmv=1.99.21')).scanRabbitMirrorHtml;
            }
            catch {
                scan = null;
            }
        }
        const chatKey = getCurrentChatKey(chat);
        const swipeId = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
        if (!chatKey || !Number.isInteger(index) || index < 0)
            return 0;
        const batchId = String(readFollowPartialResult(chat, index)?.historyRound || '');
        let sourceHash = '';
        try {
            sourceHash = String(rabbitMirrorMessageSourceHash(message) || '');
        }
        catch {
            sourceHash = '';
        }
        const roundKey = `follow-retry:${chatKey}:${index}:${swipeId}:${sourceHash.slice(0, 24)}`;
        let recorded = 0;
        for (const faceIndex of faceIndexes) {
            const face = parsed.faces.find(item => item.index === faceIndex);
            if (!face?.inner)
                continue;
            let scanned = null;
            try {
                scanned = scan ? scan(`<toto data-rabbit-mirror="true" data-rm-face="${faceIndex + 1}">${face.inner}</toto>`, null) : null;
            }
            catch {
                scanned = null;
            }
            if (commitRetriedFaceHistory(combos[faceIndex], scanned || {}, { roundKey, faceIndex, batchId }))
                recorded += 1;
        }
        return recorded;
    }
    catch (error) {
        console.debug('[RabbitMirror] follow retry history skipped:', error);
        return 0;
    }
}
