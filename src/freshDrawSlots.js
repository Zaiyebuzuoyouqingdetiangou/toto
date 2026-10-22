// 这次打开页面以后发过兔子镜生成请求的楼层（整条或其中某一面）。
// 插图记录找不到时，只有这些面自动画图；以前生成的面只留「重新生图」，不自动花额度。
const KEY = '__rabbitMirrorFreshDrawSlots';
const LIMIT = 500;

function slots() {
    const value = globalThis[KEY];
    if (value instanceof Map) return value;
    const created = new Map();
    globalThis[KEY] = created;
    return created;
}
function slotName(chat, mes, swipe) {
    return `${String(chat ?? '').replace(/^chat:/, '')}|${Number(mes)}|${Number(swipe)}`;
}
function faceOf(faceIndex) {
    if (faceIndex === null || faceIndex === undefined || String(faceIndex).trim() === '') return null;
    const index = Number(faceIndex);
    return Number.isInteger(index) && index >= 0 ? index : null;
}

export function markFreshDrawSlot(chat, mes, swipe, faceIndex = null) {
    if (!Number.isInteger(Number(mes)) || !Number.isInteger(Number(swipe))) return;
    const map = slots();
    const name = slotName(chat, mes, swipe);
    const faces = map.get(name) || new Set();
    const face = faceOf(faceIndex);
    faces.add(face === null ? 'all' : face);
    map.delete(name);
    map.set(name, faces);
    while (map.size > LIMIT) map.delete(map.keys().next().value);
}

export function isFreshDrawSlot(chat, mes, swipe, faceIndex = null) {
    const faces = slots().get(slotName(chat, mes, swipe));
    if (!faces) return false;
    const face = faceOf(faceIndex);
    return faces.has('all') || (face !== null && faces.has(face));
}
