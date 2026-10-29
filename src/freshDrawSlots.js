import { getContext } from './independentApi/runtime.js?rmv=1.100.0';
const KEY = '__rabbitMirrorFreshDrawSlots';
const LIMIT = 500;
function slots() {
    const value = globalThis[KEY];
    if (value instanceof Map)
        return value;
    const created = new Map();
    globalThis[KEY] = created;
    return created;
}
function slotName(chat, mes, swipe) {
    return `${String(chat ?? '').replace(/^chat:/, '')}|${Number(mes)}|${Number(swipe)}`;
}
function faceOf(faceIndex) {
    if (faceIndex === null || faceIndex === undefined || String(faceIndex).trim() === '')
        return null;
    const index = Number(faceIndex);
    return Number.isInteger(index) && index >= 0 ? index : null;
}
export function markFreshDrawSlot(chat, mes, swipe, faceIndex = null, supplied = {}) {
    if (!Number.isInteger(Number(mes)) || !Number.isInteger(Number(swipe)))
        return;
    const ctx = getContext();
    const message = supplied.message || ctx?.chat?.[Number(mes)];
    const nameOfChat = String(chat).replace(/^chat:/, '');
    if (!message || ctx?.chat?.[Number(mes)] !== message || Number(message.swipe_id || 0) !== Number(swipe)
        || String(ctx?.getCurrentChatId?.() ?? ctx?.chatId ?? '').replace(/^chat:/, '') !== nameOfChat)
        return;
    const source = swipeSource(message, Number(swipe));
    const readOutput = typeof supplied.getOutputIdentity === 'function' ? supplied.getOutputIdentity
        : () => outputIdentity(ctx, message, Number(swipe));
    let output;
    try {
        output = String(supplied.outputIdentity ?? readOutput() ?? '');
    }
    catch {
        return;
    }
    if (!output)
        return;
    const map = slots();
    const name = slotName(chat, mes, swipe);
    const previous = [...map.values()].find(value => value?.message === message && value.chat === nameOfChat && value.swipe === Number(swipe));
    const faces = previous?.message === message && previous.source === source && previous.output === output ? previous.faces : new Set();
    const face = faceOf(faceIndex);
    faces.add(face === null ? 'all' : face);
    for (const [oldKey, grant] of map)
        if (grant?.message === message && grant.chat === nameOfChat && grant.swipe === Number(swipe))
            map.delete(oldKey);
    map.delete(name);
    map.set(name, { message, source, output, readOutput, faces, chat: String(chat).replace(/^chat:/, ''), swipe: Number(swipe) });
    while (map.size > LIMIT)
        map.delete(map.keys().next().value);
}
function freshDrawGrant(chat, mes, swipe, faceIndex = null) {
    const ctx = getContext(), message = ctx?.chat?.[Number(mes)];
    if (!message || Number(message.swipe_id || 0) !== Number(swipe)
        || String(ctx?.getCurrentChatId?.() ?? ctx?.chatId ?? '').replace(/^chat:/, '') !== String(chat).replace(/^chat:/, ''))
        return false;
    const grant = [...slots().values()].find(value => value?.message === message && value.chat === String(chat).replace(/^chat:/, '') && value.swipe === Number(swipe));
    if (!grant || grant.source !== swipeSource(message, Number(swipe)))
        return false;
    try {
        if (String(grant.readOutput() ?? '') !== grant.output)
            return false;
    }
    catch {
        return false;
    }
    const face = faceOf(faceIndex);
    return grant.faces.has('all') || (face !== null && grant.faces.has(face)) ? grant : null;
}
export function isFreshDrawSlot(chat, mes, swipe, faceIndex = null) {
    return !!freshDrawGrant(chat, mes, swipe, faceIndex);
}
export function freshDrawSlotIdentity(chat, mes, swipe, faceIndex = null) {
    return freshDrawGrant(chat, mes, swipe, faceIndex)?.output || '';
}
function swipeSource(message, swipe) {
    return String(Number(message?.swipe_id || 0) === swipe ? message?.mes ?? '' : message?.swipes?.[swipe] ?? '');
}
function outputIdentity(ctx, message, swipe) {
    const index = ctx?.chat?.indexOf(message);
    if (!(index >= 0))
        return '';
    return ctx?.chatMetadata?.rabbit_mirror_independent_outputs_v2?.owners?.[`${index}:${swipe}`]?.html
        || message?.extra?.display_text || swipeSource(message, swipe);
}
