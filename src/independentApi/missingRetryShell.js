import { rmT as __rmT } from "../textTable.js?rmv=1.99.20";
export const MISSING_INDEPENDENT_RETRY_SHELL_LIMIT = 10;
export const MISSING_SHELL_SCAN_RANGE_ALL = 'all';
export const MISSING_SHELL_SCAN_RANGE_OPTIONS = [10, 20, 'all'];
export const MISSING_INDEPENDENT_RETRY_SHELL_MESSAGE = __rmT("xwkATr7sQOW0obJ.vtPXaTk3qtg03tWn3cR3liLkptcg32j26.4VWc8dKQvViHqi_TixrRwwJuYHFHaBM3SIR_An19cN2EOJVnaAFRgHc.Jmk0NQZPlrw8LUF6cTRpArwuLxsGvdS6vNIgKZW0r55VWorKDFWGTnsHXkakdED1G");
export const SAFETY_VALVE_SHELL_PREFIX = __rmT("kls8q6VkrYU5KsopQ3mt9YWYhM2YZh");
export function safetyValveShellMessage(reason) {
    return `${SAFETY_VALVE_SHELL_PREFIX}${__rmT("7ys")}${String(reason || __rmT("kBft.abe4UwGV6ajz9ivTh"))}${__rmT("nlxA.HNd9VvM72saFzxpgM7FLDrAhWD3iew0aK10AKAnVZhuCPTeT.N97K67RzxlrZtwnBl.taAfIGT4dm18BVfeoyd.52bot9eYzNHmnKaLwpqJ8YHpNufxT__NpsAmaLOCcUAc")}`;
}
export const INDEPENDENT_HISTORY_READ_ERROR_MESSAGE = __rmT("GbGhQoiB5lAAi7PE2KwIbCSdW95RhwGf1p5USGbAfqKrpEWOR2CrDckvorPzNoYxovS_sgdO5fzAHir0mnLgyaKFXNKGO1YE4KJLz87psVAgBozdBy_Vmlpwgio21LTCuD4RM03c1FT");
export function normalizeMissingShellScanRange(value) {
    if (value === MISSING_SHELL_SCAN_RANGE_ALL || value === Infinity)
        return MISSING_SHELL_SCAN_RANGE_ALL;
    const n = Number(value);
    if (n === 20)
        return 20;
    return MISSING_INDEPENDENT_RETRY_SHELL_LIMIT;
}
export function assistantRowsInScanRange(rows, range) {
    const list = Array.isArray(rows) ? rows.filter(row => Number.isInteger(Number(row?.i)) && Number(row.i) >= 0) : [];
    const normalized = normalizeMissingShellScanRange(range);
    if (normalized === MISSING_SHELL_SCAN_RANGE_ALL)
        return list;
    return list.slice(-normalized);
}
export function isRecentAssistantIndex(recentRows, index) {
    const id = Number(index);
    if (!Number.isInteger(id) || id < 0 || !Array.isArray(recentRows))
        return false;
    return recentRows.some(row => Number(row?.i) === id);
}
export function isMissingShellTargetFloor(index, { recentIndices, syncedIndices } = {}) {
    const id = Number(index);
    if (!Number.isInteger(id) || id < 0)
        return false;
    if (recentIndices instanceof Set && recentIndices.has(id))
        return true;
    if (syncedIndices instanceof Set && syncedIndices.has(id))
        return true;
    return false;
}
export function hasUsableAssistantBody(message) {
    return !!(String(message?.mes || '').trim() || String(message?.extra?.display_text || '').trim());
}
export function formatMissingShellFloorLabel(index) {
    const id = Number(index);
    return Number.isInteger(id) && id >= 0 ? `#${id}` : '';
}
export function formatMissingShellReport({ range, floors } = {}) {
    const normalized = normalizeMissingShellScanRange(range);
    const items = Array.isArray(floors) ? floors : [];
    const labels = items.map(item => formatMissingShellFloorLabel(item?.index ?? item)).filter(Boolean);
    const scope = normalized === MISSING_SHELL_SCAN_RANGE_ALL ? __rmT("7NKZ5X__jt7DRo.i") : `${__rmT("mif0jcc6")}${normalized}${__rmT("4b62yy__jt7DRo.i")}`;
    if (!labels.length)
        return `${scope}${__rmT("YhRHEEKLDu7Hrzl1wknOWGkPbNs")}`;
    return `${scope}${__rmT("PWFfj_qy_g1uDozzadj_Lk")}${labels.join(__rmT("jvk"))}${__rmT("EXcFrHn7m7sSY.qUSjRvq0c2w0j3NFWYVybgNXuNPeult0KBf0HPvcXhVX8O9k")}`;
}
export function shouldRestoreMissingIndependentRetryShell({ timing = '', hasSavedHtml = false, persistedDeleted = false, hasHost = false, hasActiveFlight = false, hasScheduledGeneration = false, hasFollowMirror = false, isTargetFloor = false, hasMessageBody = false, isActiveGenerationTarget = false, quickWaiting = false, } = {}) {
    if (timing !== 'auto' && timing !== 'manual')
        return false;
    if (hasSavedHtml || persistedDeleted || hasHost || hasActiveFlight || hasScheduledGeneration || hasFollowMirror)
        return false;
    if (isActiveGenerationTarget || quickWaiting)
        return false;
    return !!(isTargetFloor && hasMessageBody);
}
