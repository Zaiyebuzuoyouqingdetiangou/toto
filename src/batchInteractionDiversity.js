import { rmT as __rmT } from "./textTable.js?rmv=2.3.0";
import { INTERACTION_FAMILY_LABELS as FAMILY_LABELS, recentInteractionCooldowns } from './interactionCooldown.js?rmv=2.3.0';
import { recentDiversityRecords } from './compositionFingerprint.js?rmv=2.3.0';
function recentRepeatedFamilies(recentFamilies) {
    const rounds = new Map();
    recentDiversityRecords(recentFamilies, 5).forEach((item, index) => {
        if (!item || Number(item.confidence ?? 1) < 0.6 || !Object.hasOwn(FAMILY_LABELS, item.id))
            return;
        const round = item.diversityRound || item.batchId || `legacy:${index}`;
        if (!rounds.has(item.id))
            rounds.set(item.id, new Set());
        rounds.get(item.id).add(round);
    });
    const repeated = Object.keys(FAMILY_LABELS).filter(id => (rounds.get(id)?.size || 0) >= 2);
    return repeated.length || rounds.size ? repeated : recentInteractionCooldowns(recentFamilies).filter(item => item.count >= 2).map(item => item.id);
}
export function planBatchInteractionDiversity(faceCount, { enabled = false, recentFamilies = [], presentationModes = [] } = {}) {
    if (enabled !== true || !Number.isSafeInteger(faceCount) || faceCount < 2 || faceCount > 5)
        return null;
    const htmlIndices = Array.from({ length: faceCount }, (_, index) => index).filter(index => presentationModes[index] !== 'text');
    if (htmlIndices.length < 2)
        return null;
    const recentAvoidFamilyIds = recentRepeatedFamilies(recentFamilies);
    return Array.from({ length: faceCount }, (_, faceIndex) => presentationModes[faceIndex] === 'text' ? null : ({
        schemaVersion: 1, faceIndex, faceCount,
        compareWithFaceIndices: htmlIndices.filter(index => index < faceIndex),
        preferredMaxFamilyUses: Math.min(2, htmlIndices.length - 1),
        recentAvoidFamilyIds: [...recentAvoidFamilyIds],
        allowNativeRepeat: true,
    }));
}
export function buildBatchInteractionDiversityRule(combos, settings) {
    if (!Array.isArray(combos) || combos.length < 2 || combos.length > 5)
        return '';
    const htmlIndices = combos.map((combo, index) => combo?.presentationMode === 'text' ? -1 : index).filter(index => index >= 0);
    if (htmlIndices.length < 2)
        return '';
    const first = combos[htmlIndices[0]]?.interactionDiversity;
    if (!first || !Array.isArray(first.recentAvoidFamilyIds) || first.recentAvoidFamilyIds.length > Object.keys(FAMILY_LABELS).length ||
        first.recentAvoidFamilyIds.some(id => !Object.hasOwn(FAMILY_LABELS, id)))
        return '';
    const expected = planBatchInteractionDiversity(combos.length, { enabled: true, presentationModes: combos.map(combo => combo?.presentationMode || 'html') });
    for (const index of htmlIndices) {
        const value = combos[index]?.interactionDiversity;
        const reference = expected[index];
        if (!value || value.schemaVersion !== 1 || value.faceIndex !== index || value.faceCount !== combos.length ||
            value.preferredMaxFamilyUses !== reference.preferredMaxFamilyUses || value.allowNativeRepeat !== true ||
            !Array.isArray(value.compareWithFaceIndices) || value.compareWithFaceIndices.length !== reference.compareWithFaceIndices.length ||
            value.compareWithFaceIndices.some((position, at) => position !== reference.compareWithFaceIndices[at]) ||
            !Array.isArray(value.recentAvoidFamilyIds) || value.recentAvoidFamilyIds.length !== first.recentAvoidFamilyIds.length ||
            value.recentAvoidFamilyIds.some((id, at) => id !== first.recentAvoidFamilyIds[at]))
            return '';
    }
    const recentLabels = first.recentAvoidFamilyIds.map(id => FAMILY_LABELS[id]).filter(Boolean);
    const recentLine = recentLabels.length ? `${__rmT("LGGYHWUfTqPzloqyLeYZb9_dlCsJsfbY")}${recentLabels.join(__rmT("jvk"))}${__rmT("cvRK0wxESv6qm8ZNr9MF4zVcL3BiXaG1ZkcbjCUuRB3Ppo5YyxGr7f")}` : '';
    const opening = htmlIndices.length === combos.length
        ? __rmT("9lQ5ySizg4kaLZSDkiiJ3J9r9v7_g2Jl8w.n7GnxWTs46Svz9HdYuh48jDRVMAVnsUcfJkjQTzd_HL6Wsl.NVYJ698aXAJcqKJACRFQwlx2FkfuamC7HYzBICaDio0k3hHL6.qJardBY1eSVrB0fM21tc25HBAs0") : `${__rmT("klswlCVbacTHlkLRRCbhuEW7EJ0CJk")}${htmlIndices.map(index => index + 1).join(__rmT("jvk"))}${__rmT("yBf8sV6j9XLfXjlBIcrdc37N.jGdK9DK6zu7570DTxZUOnfFJnKXGcRuOALPZiOkjr8KluR_k.bgZ1zW0OiHQNNtkwTnxkPtcKBOGZ_lLizvJQCnPY8HWxuBeVrg22RLcdmkxLTG8QJORlSJLp8nPX_YCp0.jSvFP0nHkw89eWxfKEAMWRGf2fhYevz.A6hGhd1b7HFD")}`;
    return opening + `${__rmT("ZbpXrR_9lwb68UHLr0MShNNU0aKYj5khnQE")}${first.preferredMaxFamilyUses}${__rmT("qGyf7qKg")}` + recentLine + __rmT("lWlESSN5GN9b1OqpbQ6ZYKG4vzkz.SdW4pPWmL.28bvI_fubfpX5ODk11KTSabvSsJuOHwG5821Tq0.DEdi.xDFyPxPa0UyAXX_5rBR_UlsGBUT528TY1MOHSp0U30RgC8Ftx2YHMB7NvB6BDUQCH.RWKmESIf");
}
