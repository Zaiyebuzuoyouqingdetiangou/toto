// Pure, bounded generation preferences. These are not output gates, candidate
// filters or a menu of interaction components. Unknown/native mechanisms remain
// free to be designed by the model; no mother-library text is inspected here.
import { INTERACTION_FAMILY_LABELS as FAMILY_LABELS, recentInteractionCooldowns } from './interactionCooldown.js?rmv=1.78.12';
import { recentDiversityRecords } from './compositionFingerprint.js?rmv=1.78.12';

// 近五轮里至少两轮用过的交互家族（同一轮多面只算一轮）。
// 以前取的是近五轮出现过的全部家族，多面模式下几乎全被列进去，等于没有区分。
function recentRepeatedFamilies(recentFamilies) {
    const rounds = new Map();
    recentDiversityRecords(recentFamilies, 5).forEach((item, index) => {
        if (!item || Number(item.confidence ?? 1) < 0.6 || !Object.hasOwn(FAMILY_LABELS, item.id)) return;
        const round = item.diversityRound || item.batchId || `legacy:${index}`;
        if (!rounds.has(item.id)) rounds.set(item.id, new Set());
        rounds.get(item.id).add(round);
    });
    const repeated = Object.keys(FAMILY_LABELS).filter(id => (rounds.get(id)?.size || 0) >= 2);
    // 旧算法保留作兜底：新算法读不到轮次时不至于整段为空。
    return repeated.length || rounds.size ? repeated : recentInteractionCooldowns(recentFamilies).filter(item => item.count >= 2).map(item => item.id);
}

/** Freeze at most five per-face comparisons before any external material read. */
export function planBatchInteractionDiversity(faceCount, { enabled = false, recentFamilies = [], presentationModes = [] } = {}) {
    if (enabled !== true || !Number.isSafeInteger(faceCount) || faceCount < 2 || faceCount > 5) return null;
    const htmlIndices = Array.from({ length: faceCount }, (_, index) => index).filter(index => presentationModes[index] !== 'text');
    if (htmlIndices.length < 2) return null;
    const recentAvoidFamilyIds = recentRepeatedFamilies(recentFamilies);
    return Array.from({ length: faceCount }, (_, faceIndex) => presentationModes[faceIndex] === 'text' ? null : ({
        schemaVersion: 1, faceIndex, faceCount,
        compareWithFaceIndices: htmlIndices.filter(index => index < faceIndex),
        preferredMaxFamilyUses: Math.min(2, htmlIndices.length - 1),
        recentAvoidFamilyIds: [...recentAvoidFamilyIds],
        allowNativeRepeat: true,
    }));
}

/** Render once for the batch. Missing old hints are a no-op, never a failure. */
export function buildBatchInteractionDiversityRule(combos, settings) {
    if (!Array.isArray(combos) || combos.length < 2 || combos.length > 5) return '';
    const htmlIndices = combos.map((combo, index) => combo?.presentationMode === 'text' ? -1 : index).filter(index => index >= 0);
    if (htmlIndices.length < 2) return '';
    const first = combos[htmlIndices[0]]?.interactionDiversity;
    if (!first || !Array.isArray(first.recentAvoidFamilyIds) || first.recentAvoidFamilyIds.length > Object.keys(FAMILY_LABELS).length ||
        first.recentAvoidFamilyIds.some(id => !Object.hasOwn(FAMILY_LABELS, id))) return '';
    const expected = planBatchInteractionDiversity(combos.length, { enabled: true, presentationModes: combos.map(combo => combo?.presentationMode || 'html') });
    for (const index of htmlIndices) {
        const value = combos[index]?.interactionDiversity;
        const reference = expected[index];
        if (!value || value.schemaVersion !== 1 || value.faceIndex !== index || value.faceCount !== combos.length ||
            value.preferredMaxFamilyUses !== reference.preferredMaxFamilyUses || value.allowNativeRepeat !== true ||
            !Array.isArray(value.compareWithFaceIndices) || value.compareWithFaceIndices.length !== reference.compareWithFaceIndices.length ||
            value.compareWithFaceIndices.some((position, at) => position !== reference.compareWithFaceIndices[at]) ||
            !Array.isArray(value.recentAvoidFamilyIds) || value.recentAvoidFamilyIds.length !== first.recentAvoidFamilyIds.length ||
            value.recentAvoidFamilyIds.some((id, at) => id !== first.recentAvoidFamilyIds[at])) return '';
    }
    // 抽签时冻结的「近期多轮重复的交互家族」，以前算好了没发出去；现在作为偏好写进这一段。
    const recentLabels = first.recentAvoidFamilyIds.map(id => FAMILY_LABELS[id]).filter(Boolean);
    const recentLine = recentLabels.length ? `近期多轮重复的交互家族：${recentLabels.join('、')}；本批各面的主交互尽量避开，作辅助可以。` : '';
    const opening = htmlIndices.length === combos.length
        ? `本批交互分散：从第 2 面起对照此前各面，必须改变重复的主交互操作路径与状态组织；只换标题、颜色、按钮文案或数量不算换。`
        : `本批交互分散：仅在第 ${htmlIndices.map(index => index + 1).join('、')} 面 HTML 作品之间对照，后面的 HTML 面必须改变重复的主交互操作路径与状态组织；文本面不参与交互比较。只换标题、颜色、按钮文案或数量不算换。`;
    return opening +
        `同一主交互家族尽量不超过 ${first.preferredMaxFamilyUses} 面。` + recentLine +
        '明确点菜、母本原有玩法和强制展现模式优先；可行机制不足时允许自然复用，不为凑种类另造控件，也不从固定组件菜单机械轮换。';
}
