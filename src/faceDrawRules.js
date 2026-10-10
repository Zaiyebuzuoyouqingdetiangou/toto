// Per-face draw preferences. This module stores IDs only, never library content.
export const FACE_DRAW_KINDS = Object.freeze(['theme', 'format', 'text']);
export const FACE_DRAW_LABELS = Object.freeze({ theme: '主题元素', format: '展现形式', text: '纯文本' });

const ids = value => [...new Set((Array.isArray(value) ? value : []).filter(id => typeof id === 'string' && id.length > 0))];
const count = (value, fallback) => Number.isSafeInteger(value) && value >= 0 ? value : fallback;

export function normalizeFaceDrawLane(value = {}) {
    const min = count(value?.min, 1);
    return {
        requiredIds: ids(value?.requiredIds),
        mode: ['none', 'random', 'sequence'].includes(value?.mode) ? value.mode : 'none',
        scope: value?.scope === 'selected' ? 'selected' : 'all',
        categoryIds: ids(value?.categoryIds),
        itemIds: ids(value?.itemIds),
        min,
        max: Math.max(min, count(value?.max, min)),
    };
}

export function normalizeFaceDrawRule(value = {}) {
    return { enabled: value?.enabled === true, ...Object.fromEntries(FACE_DRAW_KINDS.map(kind => [kind, normalizeFaceDrawLane(value?.[kind])])) };
}

export function normalizeFaceDrawRules(value) {
    return Array.from({ length: 5 }, (_, index) => normalizeFaceDrawRule(value?.[index]));
}

export function normalizeFaceDrawPresets(value) {
    const seen = new Set();
    return (Array.isArray(value) ? value : []).filter(item => {
        if (!item || typeof item.id !== 'string' || !item.id || seen.has(item.id) || typeof item.name !== 'string' || !item.name.trim()) return false;
        seen.add(item.id); return true;
    }).map(item => ({ id: item.id, name: item.name.trim(), rule: normalizeFaceDrawRule(item.rule) }));
}

export function faceDrawRule(settings, faceIndex = 0) {
    const rule = normalizeFaceDrawRule(settings?.rabbitMirrorFaceDrawRules?.[faceIndex]);
    return rule.enabled ? rule : null;
}

export function hasFaceDrawRules(settings) {
    const count = Math.min(5, Math.max(1, Number(settings?.rabbitMirrorFaceCount) || 1));
    return normalizeFaceDrawRules(settings?.rabbitMirrorFaceDrawRules).slice(0, count).some(rule => rule.enabled);
}

// Explicit face scopes can use enabled external libraries even when the old
// global mix switch is off. Hydration still reads only the selected raw IDs.
export function faceDrawNeedsExternal(settings) {
    const count = Math.min(5, Math.max(1, Number(settings?.rabbitMirrorFaceCount) || 1));
    return normalizeFaceDrawRules(settings?.rabbitMirrorFaceDrawRules).slice(0, count).some(rule => rule.enabled && FACE_DRAW_KINDS.some(kind => {
        const lane = rule[kind];
        return lane.requiredIds.some(id => id.startsWith('ext:')) || (lane.mode !== 'none' && lane.max > 0 && (
            lane.scope === 'all' || lane.categoryIds.some(id => id.startsWith('external:')) || lane.itemIds.some(id => id.startsWith('ext:'))
        ));
    }));
}

export function faceDrawCategoryId(item) {
    if (item?.libraryId) return `external:${item.libraryId}`;
    return `builtin:${String(item?.group || 'other')}`;
}

// Preserve frozen rotation state through recipe records and HTML version stamps.
// Copy only the small, validated state; never persist arbitrary imported fields.
export function faceDrawMetadataFields(value) {
    if (value?.faceDrawConfigured !== true) return {};
    const fields = { faceDrawConfigured: true };
    const state = value.faceDrawState;
    if (state?.version !== 1 || !Array.isArray(state.steps) || !state.steps.length || state.steps.length > 3) return fields;
    const steps = [];
    for (const step of state.steps) {
        if (!step || typeof step.chatKey !== 'string' || !step.chatKey || step.chatKey.length > 1024
            || !Number.isInteger(step.faceIndex) || step.faceIndex < 0 || step.faceIndex > 4
            || !FACE_DRAW_KINDS.includes(step.kind) || !/^[a-f0-9]{32}$/.test(step.signature || '')
            || !Number.isSafeInteger(step.cursor) || step.cursor < 0
            || !Number.isSafeInteger(step.next) || step.next < step.cursor || step.next - step.cursor > 16
            || !Number.isSafeInteger(step.epoch) || step.epoch < 1) return fields;
        const { chatKey, faceIndex, kind, signature, cursor, next, epoch } = step;
        steps.push({ chatKey, faceIndex, kind, signature, cursor, next, epoch });
    }
    return { ...fields, faceDrawState: { version: 1, steps } };
}
