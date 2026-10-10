import { FACE_DRAW_KINDS, FACE_DRAW_LABELS, faceDrawCategoryId } from './faceDrawRules.js?rmv=1.67.55';
import { externalPoolItem } from './externalWorldBook/externalPool.js?rmv=1.67.55';

// Compact, synchronous identity of ID-only settings/catalogs. Four independent
// 32-bit accumulators avoid storing large imported names in every frozen plan.
export function faceDrawFingerprint(value) {
    const text = JSON.stringify(value);
    let a = 2166136261, b = 2246822519, c = 3266489917, d = 668265263;
    for (let i = 0; i < text.length; i += 1) {
        const n = text.charCodeAt(i);
        a = Math.imul(a ^ n, 16777619); b = Math.imul(b ^ n, 2246822519);
        c = Math.imul(c ^ n, 3266489917); d = Math.imul(d ^ n, 668265263);
    }
    return [a, b, c, d].map(n => (n >>> 0).toString(16).padStart(8, '0')).join('');
}

function failure(faceIndex, kind, message, reasonCode) {
    const error = new Error(`第 ${faceIndex + 1} 面的${FACE_DRAW_LABELS[kind] || '抽取设置'}：${message} 本次尚未发送请求。`);
    error.code = 'MULTIFACE_PLAN_UNAVAILABLE';
    error.reasonCode = reasonCode;
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

// 说清楚“为什么范围里一项都抽不出来”，并告诉用户怎么改。
const FIX_HINT = '如果只想用常驻的内容，把「其余内容怎么抽」的「抽取方式」改成「不追加」；想再随机加几项，就点「选择范围」勾上别的分类或条目，或把「抽取范围」改成「全部可用条目」。改完点「保存本面」。';
function shortfallReason(lane, kind, builtins, externalSnapshot, blocked, requiredIds) {
    if (lane.scope !== 'selected') return `这一类可用的条目已经全部是常驻或在黑名单里。${FIX_HINT}`;
    const pickedCount = lane.itemIds.length + lane.categoryIds.length;
    if (!pickedCount) return `可能是「其余内容怎么抽」开了「随机抽取」、抽取范围是「只在勾选范围」，但「选择范围」里还没有勾任何分类或条目${requiredIds.size ? '（只勾了常驻）' : ''}。${FIX_HINT}`;
    const full = catalogFor(kind, builtins, externalSnapshot);
    const categories = new Set(lane.categoryIds), items = new Set(lane.itemIds);
    const inRange = full.filter(item => items.has(item.id) || categories.has(faceDrawCategoryId(item)));
    const asRequired = inRange.filter(item => requiredIds.has(item.id)).length;
    const asBlocked = inRange.filter(item => !requiredIds.has(item.id) && blocked.has(item.id)).length;
    const knownIds = new Set(full.map(item => item.id));
    const missing = lane.itemIds.filter(id => !knownIds.has(id)).length
        + lane.categoryIds.filter(id => !full.some(item => faceDrawCategoryId(item) === id)).length;
    const parts = [];
    if (asRequired) parts.push(`${asRequired} 项同时也勾成了常驻（常驻的不会再被抽一次）`);
    if (asBlocked) parts.push(`${asBlocked} 项在黑名单里`);
    if (missing) parts.push(`${missing} 项在目录里找不到（外置库可能没启用、没重建索引或改了分类）`);
    return `「选择范围」里勾的${parts.length ? `：${parts.join('，')}` : '条目现在都不可用'}。${FIX_HINT}`;
}

/** Only the supplied eligible catalogs are consulted. No raw reads or writes. */
export function drawFaceRule({ rule, faceIndex = 0, chatKey, builtinThemes = [], builtinFormats = [], externalSnapshot,
    blockedThemeIds = [], blockedFormatIds = [], randomUnit = Math.random, readCursor, presentationMode = 'html', requestedMode = 'html' }) {
    const selected = {}, steps = [];
    for (const kind of FACE_DRAW_KINDS) {
        const lane = rule[kind];
        const blocked = new Set(kind === 'theme' ? blockedThemeIds : blockedFormatIds);
        const catalog = catalogFor(kind, kind === 'theme' ? builtinThemes : kind === 'format' ? builtinFormats : [], externalSnapshot).filter(item => !blocked.has(item.id));
        const byId = new Map(catalog.map(item => [item.id, item]));
        const unavailable = lane.requiredIds.filter(id => !byId.has(id));
        if (unavailable.length) failure(faceIndex, kind, `常驻条目不可用（可能已禁用、拉黑或重新分类）：${unavailable.join('、')}。请在本面设置中处理。`, 'FACE_DRAW_REQUIRED_UNAVAILABLE');
        const required = lane.requiredIds.map(id => byId.get(id));
        if (required.length > 16) failure(faceIndex, kind, '常驻条目超过现有单面记录可保存的 16 项；请减少本面同时使用的条目。', 'FACE_DRAW_SELECTION_TOO_LARGE');
        const requiredIds = new Set(lane.requiredIds);
        const categories = new Set(lane.categoryIds), items = new Set(lane.itemIds), seen = new Set();
        // Scope is a set; toggling a checkbox must not reorder a rotation.
        const pool = catalog.filter(item => lane.scope !== 'selected' || items.has(item.id) || categories.has(faceDrawCategoryId(item))).filter(item => {
                if (requiredIds.has(item.id) || seen.has(item.id)) return false;
                seen.add(item.id); return true;
            });
        let picked = [];
        if (lane.mode !== 'none') {
            const capacity = Math.min(pool.length, 16 - required.length);
            if (lane.min > capacity) failure(faceIndex, kind, `当前范围内可追加 ${capacity} 项，但至少需要 ${lane.min} 项。${shortfallReason(lane, kind, builtinsFor(kind, builtinThemes, builtinFormats), externalSnapshot, blocked, requiredIds)}`, 'FACE_DRAW_POOL_EXHAUSTED');
            const count = randomCount(lane.min, Math.min(lane.max, capacity), randomUnit);
            if (count && lane.mode === 'sequence') {
                const signature = faceDrawFingerprint({ requiredIds: lane.requiredIds, min: lane.min, max: lane.max, ids: pool.map(item => item.id) });
                const { cursor, epoch } = readCursor({ chatKey, faceIndex, kind, signature });
                picked = Array.from({ length: count }, (_, index) => pool[(cursor + index) % pool.length]);
                steps.push({ chatKey, faceIndex, kind, signature, cursor, next: cursor + count, epoch });
            } else if (count) {
                const remaining = [...pool];
                while (picked.length < count) picked.push(...remaining.splice(randomCount(0, remaining.length - 1, randomUnit), 1));
            }
        }
        selected[kind] = [...required, ...picked];
    }
    const empty = FACE_DRAW_KINDS.every(kind => selected[kind].length === 0);
    if (empty && requestedMode !== 'longtext') failure(faceIndex, '', '没有选中任何常驻或追加条目。请至少选择一项，或使用空白长文本。', 'FACE_DRAW_EMPTY');
    return {
        themes: selected.theme, formats: selected.format, texts: selected.text,
        requestedPresentationMode: requestedMode, presentationMode,
        ...(empty ? { blankLongText: true, themeIds: [], formatIds: [], textIds: [] } : {}),
        faceDrawConfigured: true,
        ...(steps.length ? { faceDrawState: { version: 1, steps } } : {}),
        forcedFormats: [], formatFairnessEligibleIds: [], formatFairnessSelectedIds: [],
    };
}
