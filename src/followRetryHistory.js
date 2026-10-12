import { getCurrentChatKey, commitRetriedFaceHistory } from './storage.js?rmv=1.68.14';
import { parseMultifaceOutput } from './multifaceProtocol.js?rmv=1.68.14';
import { recipeFromSelectionMetadata } from './blacklist.js?rmv=1.68.14';
import { readFollowPartialResult } from './followPartialResults.js?rmv=1.68.14';
import { rabbitMirrorMessageSourceHash } from './multifaceProof.js?rmv=1.68.14';

// 跟随模式自动补发、手动重试单面补回来的面，以前不进避重记录：配色、布局、交互都没记，
// 下一轮可能撞色撞交互。这里在补回的面保存好之后，按实际发出去的抽签记录逐面补记。
// 只记账，不改显示、不发请求；任何一步失败都静默跳过，绝不影响已经补回的面。
export function followRetryCombo(metadata, localIndex, fallback = null) {
    try {
        const recipe = recipeFromSelectionMetadata(metadata, { faceIndex: localIndex });
        if (recipe && (recipe.themeIds?.length || recipe.formatIds?.length || recipe.pureOrder)) return recipe;
    } catch { /* fall back to the saved recipe */ }
    return fallback && typeof fallback === 'object' ? fallback : null;
}

export async function recordFollowRetriedFaces({ chat, index, message, html, combos = {}, scanHtml = null } = {}) {
    try {
        const faceIndexes = Object.keys(combos).map(Number).filter(faceIndex => Number.isInteger(faceIndex) && combos[faceIndex]);
        if (!faceIndexes.length) return 0;
        const parsed = parseMultifaceOutput(String(html || ''), { allowProse: true });
        if (!parsed.faces?.length) return 0;
        // 扫描器按需加载（它连着宿主模块），记账失败也不影响补回的面。
        let scan = typeof scanHtml === 'function' ? scanHtml : null;
        if (!scan) { try { scan = (await import('./visualScanner.js?rmv=1.68.14')).scanRabbitMirrorHtml; } catch { scan = null; } }
        const chatKey = getCurrentChatKey(chat);
        const swipeId = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
        if (!chatKey || !Number.isInteger(index) || index < 0) return 0;
        // 原批次编号（部分成功时随结果保存）：补回的面记成原批次的那一面，和先出的面同一轮。
        // 没有时（整批没出、旧记录）按这条回复本身单独记一轮；带上正文指纹，删掉重生成的同楼层不会撞上。
        const batchId = String(readFollowPartialResult(chat, index)?.historyRound || '');
        let sourceHash = '';
        try { sourceHash = String(rabbitMirrorMessageSourceHash(message) || ''); } catch { sourceHash = ''; }
        const roundKey = `follow-retry:${chatKey}:${index}:${swipeId}:${sourceHash.slice(0, 24)}`;
        let recorded = 0;
        for (const faceIndex of faceIndexes) {
            const face = parsed.faces.find(item => item.index === faceIndex);
            if (!face?.inner) continue;
            let scanned = null;
            try { scanned = scan ? scan(`<toto data-rabbit-mirror="true" data-rm-face="${faceIndex + 1}">${face.inner}</toto>`, null) : null; } catch { scanned = null; }
            if (commitRetriedFaceHistory(combos[faceIndex], scanned || {}, { roundKey, faceIndex, batchId })) recorded += 1;
        }
        return recorded;
    } catch (error) {
        console.debug('[RabbitMirror] follow retry history skipped:', error);
        return 0;
    }
}
