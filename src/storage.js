const STORAGE_KEY = 'rabbit_hole_theater:last_combo:v6';
const MAX_STORED = 20;

function readHistory() {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === 'object') return [raw];
        return [];
    } catch {
        return [];
    }
}

export function getComboHistory(limit = 10) {
    const history = readHistory();
    return history.slice(-Math.max(1, Number(limit) || 10));
}

export function getLastCombo() {
    const history = readHistory();
    return history[history.length - 1] || {};
}

export function getRecentIds(limit = 10) {
    const history = getComboHistory(limit);
    const themeIds = new Set();
    const formatIds = new Set();
    const designIds = new Set();
    const designConstructs = new Set();
    const designPalettes = new Set();
    const designAnchors = new Set();
    const designConcepts = [];
    for (const combo of history) {
        for (const id of combo?.themeIds || []) themeIds.add(id);
        for (const id of combo?.formatIds || []) formatIds.add(id);
        if (combo?.design?.id) designIds.add(combo.design.id);
        if (combo?.design?.construct) designConstructs.add(combo.design.construct);
        if (combo?.design?.palette) designPalettes.add(combo.design.palette);
        if (combo?.design?.anchor) designAnchors.add(combo.design.anchor);
        if (combo?.design?.concept) designConcepts.push(combo.design.concept);
    }
    const themeGroups = new Set();
    const formatGroups = new Set();
    for (const combo of history) {
        for (const id of combo?.themeGroups || []) themeGroups.add(id);
        for (const id of combo?.formatGroups || []) formatGroups.add(id);
    }
    return {
        themeIds: [...themeIds],
        formatIds: [...formatIds],
        designIds: [...designIds],
        designConstructs: [...designConstructs],
        designPalettes: [...designPalettes],
        designAnchors: [...designAnchors],
        designConcepts: designConcepts.slice(-limit),
        themeGroups: [...themeGroups],
        formatGroups: [...formatGroups],
    };
}

export function setLastCombo(combo) {
    try {
        const history = readHistory();
        history.push({ ...combo, ts: Date.now() });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_STORED)));
    } catch (error) {
        console.warn('[RabbitHole] Failed to store combo history:', error);
    }
}

export function clearLastCombo() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        // 清理旧版 key，防止旧记录混淆。
        localStorage.removeItem('rabbit_hole_theater:last_combo:v3');
        localStorage.removeItem('rabbit_hole_theater:last_combo:v4');
        localStorage.removeItem('rabbit_hole_theater:last_combo:v5');
    } catch {}
}
