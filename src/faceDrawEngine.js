import { rmT as __rmT } from "./textTable.js?rmv=2.0.0";
import { FACE_DRAW_KINDS, FACE_DRAW_LABELS, faceDrawCategoryId } from './faceDrawRules.js?rmv=2.0.0';
import { externalPoolItem } from './externalWorldBook/externalPool.js?rmv=2.0.0';
export function faceDrawFingerprint(value) {
    const text = JSON.stringify(value);
    let a = 2166136261, b = 2246822519, c = 3266489917, d = 668265263;
    for (let i = 0; i < text.length; i += 1) {
        const n = text.charCodeAt(i);
        a = Math.imul(a ^ n, 16777619);
        b = Math.imul(b ^ n, 2246822519);
        c = Math.imul(c ^ n, 3266489917);
        d = Math.imul(d ^ n, 668265263);
    }
    return [a, b, c, d].map(n => (n >>> 0).toString(16).padStart(8, '0')).join('');
}
function failure(faceIndex, kind, message, reasonCode) {
    const error = new Error(`${__rmT("BJgCyT")}${faceIndex + 1}${__rmT("qGyf7mCR")}${FACE_DRAW_LABELS[kind] || __rmT("KJCDAXhZMNY")}${__rmT("7ys")}${message}${__rmT("wHJJwiF5ouZX6mE5M_ernH6ZbNs")}`);
    error.code = 'MULTIFACE_PLAN_UNAVAILABLE';
    error.reasonCode = reasonCode;
    error.faceIndex = faceIndex;
    error.requestCount = 0;
    throw error;
}
function randomCount(min, max, randomUnit) {
    return min + Math.floor(Math.max(0, Math.min(0.9999999999999999, Number(randomUnit()) || 0)) * (max - min + 1));
}
function catalogFor(kind, builtins, snapshot) {
    const field = kind === 'theme' ? 'themesByLibrary' : kind === 'format' ? 'formatsByLibrary' : 'textsByLibrary';
    const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
    const external = [...(snapshot?.[field] || [])].sort((a, b) => compare(a.libraryId, b.libraryId)).flatMap(library => [...library.ids].sort(compare).map(id => ({
        ...externalPoolItem(id, kind), libraryId: library.libraryId,
    })));
    return [...builtins, ...external].filter(item => item?.id);
}
function builtinsFor(kind, builtinThemes, builtinFormats) {
    return kind === 'theme' ? builtinThemes : kind === 'format' ? builtinFormats : [];
}
const FIX_HINT = __rmT("xVkiIzBl.OSw1mylEpxGa071KJgXEfp9Jx0RQ.bsL8a8QFwWMzHpPjwg1rMpYUI1JpVOpz9C0BjVaj8Gns_mnaXgF1db9eZI.8kGWxquzTszsHn9tH39ZLQjlElTNwR7inqZY3Vt6hclIYh6fCdptbr4jZgzu2xnTJV9tdetKnP2OcGw_5F5gLkrx8zGtf3O77yp91ZWhsqRuvHxidoCaVa5OCXufJ1Xy1tGBc53bwyqDBeV86_");
function shortfallReason(lane, kind, builtins, externalSnapshot, blocked, requiredIds) {
    if (lane.scope !== 'selected')
        return `${__rmT("_NNFtngPPuG9JQeVXn6jIUf3C0BInTIyhyLW0ffnsNFlOC93MqU77C5TzBG")}${FIX_HINT}`;
    const pickedCount = lane.itemIds.length + lane.categoryIds.length;
    if (!pickedCount)
        return `${__rmT("aPqOte14XhucDFhRGe3XkPL3xyjOqO5dpUwPugrdyQ2FR_J5Zrwmmyj9G0Nk7NAFjxvu.zjSFA.N84pp7Wqd2Ni9RqBjVpbeGrksNSZpBzjBEeEjPwp174N0BA9ENDwv2LoD54IopCENyGOm")}${requiredIds.size ? __rmT("2FJ8n5a13z_EAILOIAA") : ''}${__rmT("jzk")}${FIX_HINT}`;
    const full = catalogFor(kind, builtins, externalSnapshot);
    const categories = new Set(lane.categoryIds), items = new Set(lane.itemIds);
    const inRange = full.filter(item => items.has(item.id) || categories.has(faceDrawCategoryId(item)));
    const asRequired = inRange.filter(item => requiredIds.has(item.id)).length;
    const asBlocked = inRange.filter(item => !requiredIds.has(item.id) && blocked.has(item.id)).length;
    const knownIds = new Set(full.map(item => item.id));
    const missing = lane.itemIds.filter(id => !knownIds.has(id)).length
        + lane.categoryIds.filter(id => !full.some(item => faceDrawCategoryId(item) === id)).length;
    const parts = [];
    if (asRequired)
        parts.push(`${asRequired}${__rmT("SzWkMAj4.Jx3pXKOS4imtH8oQ.QO83zkcIC2Hjg1mBtHh4zgLAspLMpJkCY")}`);
    if (asBlocked)
        parts.push(`${asBlocked}${__rmT("7aAPOyizDm_ua0.GTSl")}`);
    if (missing)
        parts.push(`${missing}${__rmT("ri6d1uwKBXiLz_psHVVyYiyEoHBP06LnLlkjO7wwx3.vFIrjDojA4fAtF7bP3fraKjCpdTMLqmcYp_rU")}`);
    return `${__rmT("CyeLZ80kcwtZerEbavXZ8Qc1")}${parts.length ? `${__rmT("7ys")}${parts.join(__rmT("Yis"))}` : __rmT("k8OdHR57YBVT8gajNNtiAh")}${__rmT("jzk")}${FIX_HINT}`;
}
export function drawFaceRule({ rule, faceIndex = 0, chatKey, builtinThemes = [], builtinFormats = [], externalSnapshot, blockedThemeIds = [], blockedFormatIds = [], randomUnit = Math.random, readCursor, presentationMode = 'html', requestedMode = 'html' }) {
    const selected = {}, steps = [];
    for (const kind of FACE_DRAW_KINDS) {
        const lane = rule[kind];
        const blocked = new Set(kind === 'theme' ? blockedThemeIds : blockedFormatIds);
        const catalog = catalogFor(kind, kind === 'theme' ? builtinThemes : kind === 'format' ? builtinFormats : [], externalSnapshot).filter(item => !blocked.has(item.id));
        const byId = new Map(catalog.map(item => [item.id, item]));
        const unavailable = lane.requiredIds.filter(id => !byId.has(id));
        if (unavailable.length)
            failure(faceIndex, kind, `${__rmT("hAv6stdrqwSbobgo7rVkjSVftKx.NOL3tw1kVYFP_4b0gQyNTTyfrniH4Wlv9k")}${unavailable.join(__rmT("jvk"))}${__rmT("gHSOascrujeRK3O0fE_Duijbd9brrk")}`, 'FACE_DRAW_REQUIRED_UNAVAILABLE');
        let required = lane.requiredIds.map(id => byId.get(id));
        if (required.length > 16) {
            const rest = [...required];
            required = [];
            while (required.length < 16)
                required.push(...rest.splice(randomCount(0, rest.length - 1, randomUnit), 1));
        }
        const requiredIds = new Set(lane.requiredIds);
        const categories = new Set(lane.categoryIds), items = new Set(lane.itemIds), seen = new Set();
        const pool = catalog.filter(item => lane.scope !== 'selected' || items.has(item.id) || categories.has(faceDrawCategoryId(item))).filter(item => {
            if (requiredIds.has(item.id) || seen.has(item.id))
                return false;
            seen.add(item.id);
            return true;
        });
        let picked = [];
        if (lane.mode !== 'none') {
            const capacity = Math.min(pool.length, 16 - required.length);
            if (lane.min > capacity)
                failure(faceIndex, kind, `${__rmT("58GZSLDODZN0Y8UsM01l84Cx")}${capacity}${__rmT("wRYdfac3C5mehq35VvW.y5Cx")}${lane.min}${__rmT("qGygZ1Kg")}${shortfallReason(lane, kind, builtinsFor(kind, builtinThemes, builtinFormats), externalSnapshot, blocked, requiredIds)}`, 'FACE_DRAW_POOL_EXHAUSTED');
            const count = randomCount(lane.min, Math.min(lane.max, capacity), randomUnit);
            if (count && lane.mode === 'sequence') {
                const signature = faceDrawFingerprint({ requiredIds: lane.requiredIds, min: lane.min, max: lane.max, ids: pool.map(item => item.id) });
                const { cursor, epoch } = readCursor({ chatKey, faceIndex, kind, signature });
                picked = Array.from({ length: count }, (_, index) => pool[(cursor + index) % pool.length]);
                steps.push({ chatKey, faceIndex, kind, signature, cursor, next: cursor + count, epoch });
            }
            else if (count) {
                const remaining = [...pool];
                while (picked.length < count)
                    picked.push(...remaining.splice(randomCount(0, remaining.length - 1, randomUnit), 1));
            }
        }
        selected[kind] = [...required, ...picked];
    }
    const empty = FACE_DRAW_KINDS.every(kind => selected[kind].length === 0);
    if (empty && requestedMode !== 'longtext')
        failure(faceIndex, '', __rmT("j1uA5bN.lEtu0MQoGQaHqDQVqkjgSjRtfV.uN1watjImwuPuFFopnoYXBaRtuUX2bVUIRI0.jhVfvSZRqAk"), 'FACE_DRAW_EMPTY');
    return {
        themes: selected.theme, formats: selected.format, texts: selected.text,
        requestedPresentationMode: requestedMode, presentationMode,
        ...(empty ? { blankLongText: true, themeIds: [], formatIds: [], textIds: [] } : {}),
        faceDrawConfigured: true,
        ...(steps.length ? { faceDrawState: { version: 1, steps } } : {}),
        forcedFormats: [], formatFairnessEligibleIds: [], formatFairnessSelectedIds: [],
    };
}
