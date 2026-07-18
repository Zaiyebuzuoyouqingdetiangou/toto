const STORAGE_KEY = 'rabbit_mirror_theater:last_combo:v11';
const PENDING_KEY = 'rabbit_mirror_theater:pending_combo:v11';
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

function signatureOf(combo) {
    return JSON.stringify({
        themeIds: combo?.themeIds || [],
        formatIds: combo?.formatIds || [],
        samplingMode: combo?.samplingMode || 'classic',
        forcedVisualScenery: !!combo?.forcedVisualScenery,
    });
}

export function getComboHistory(limit = 10) {
    const history = readHistory();
    return history.slice(-Math.max(0, Number(limit) || 10));
}

export function getLastCombo() {
    const history = readHistory();
    return history[history.length - 1] || {};
}

export function getRecentIds(limit = 10) {
    const history = getComboHistory(limit);
    const themeIds = new Set();
    const formatIds = new Set();
    const themeGroups = new Set();
    const formatGroups = new Set();
    const uiReviewFocus = [];

    for (const combo of history) {
        for (const id of combo?.themeIds || []) themeIds.add(id);
        for (const id of combo?.formatIds || []) formatIds.add(id);
        for (const id of combo?.themeGroups || []) themeGroups.add(id);
        for (const id of combo?.formatGroups || []) formatGroups.add(id);
        if (Array.isArray(combo?.uiReviewFocus) && combo.uiReviewFocus.length) {
            uiReviewFocus.push(combo.uiReviewFocus.join('；'));
        }
    }

    return {
        themeIds: [...themeIds],
        formatIds: [...formatIds],
        themeGroups: [...themeGroups],
        formatGroups: [...formatGroups],
        uiReviewFocus: uiReviewFocus.slice(-limit),
    };
}


export function getRecentRiskFlags(limit = 3) {
    const history = getComboHistory(limit);
    const flags = [];
    for (const item of history) {
        if (Array.isArray(item?.riskFlags)) flags.push(...item.riskFlags);
    }
    return [...new Set(flags)];
}

export function getRecentRiskFlagCounts(limit = 3) {
    const history = getComboHistory(limit);
    const counts = {};
    for (const item of history) {
        for (const flag of item?.riskFlags || []) {
            counts[flag] = (counts[flag] || 0) + 1;
        }
    }
    return counts;
}


export function getRecentPaletteFingerprints(limit = 3) {
    return getComboHistory(limit)
        .map(item => item?.paletteFingerprint)
        .filter(item => item && typeof item === 'object' && Number(item.confidence || 0) >= 0.35)
        .slice(-Math.max(0, Number(limit) || 3));
}

function isDarkPaletteTrigger(fingerprint) {
    if (!fingerprint || typeof fingerprint !== 'object') return false;
    const confidence = Number(fingerprint.confidence || 0);
    const darkAreaRatio = Number(fingerprint.darkAreaRatio || 0);
    const averageLuminance = Number(fingerprint.averageLuminance || 255);
    return confidence >= 0.5
        && fingerprint.brightness === 'dark'
        && (darkAreaRatio >= 0.55 || averageLuminance <= 105);
}

// 一次低明度主承载输出触发后续五轮冷却；冷却期内若再次命中则重新从五轮开始。
export function getActivePaletteCooldown(rounds = 5) {
    const cooldownRounds = Math.max(1, Number(rounds) || 5);
    const history = readHistory();
    for (let index = history.length - 1; index >= 0; index -= 1) {
        const fingerprint = history[index]?.paletteFingerprint;
        if (!isDarkPaletteTrigger(fingerprint)) continue;
        const completedSinceTrigger = history.length - 1 - index;
        if (completedSinceTrigger >= cooldownRounds) return { active: false, remaining: 0 };
        return {
            active: true,
            remaining: cooldownRounds - completedSinceTrigger,
            completedSinceTrigger,
            fingerprint,
        };
    }
    return { active: false, remaining: 0 };
}

export function setPendingCombo(combo) {
    try {
        if (!combo) return;
        const pending = { ...combo, signature: signatureOf(combo), pendingTs: Date.now() };
        localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    } catch (error) {
        console.warn('[RabbitMirror] Failed to store pending combo:', error);
    }
}

export function commitPendingCombo(visualSignature = '', visualSkeleton = '', riskFlags = [], paletteFingerprint = null) {
    try {
        const raw = localStorage.getItem(PENDING_KEY);
        if (!raw) return;
        const pending = JSON.parse(raw);
        if (!pending || typeof pending !== 'object') return;

        const history = readHistory();
        const now = Date.now();
        const sig = pending.signature || signatureOf(pending);
        const last = history[history.length - 1];
        if (last?.signature === sig && now - Number(last?.ts || 0) < 120000) {
            if (visualSignature) last.visualSignature = String(visualSignature).slice(0, 280);
            if (visualSkeleton) last.visualSkeleton = String(visualSkeleton).slice(0, 360);
            if (Array.isArray(riskFlags) && riskFlags.length) last.riskFlags = [...new Set(riskFlags)].slice(0, 8);
            if (paletteFingerprint && typeof paletteFingerprint === 'object') last.paletteFingerprint = paletteFingerprint;
            last.visualSignatureTs = now;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_STORED)));
            localStorage.removeItem(PENDING_KEY);
            return;
        }

        history.push({
            ...pending,
            signature: sig,
            ts: now,
            visualSignature: visualSignature ? String(visualSignature).slice(0, 280) : pending.visualSignature,
            visualSkeleton: visualSkeleton ? String(visualSkeleton).slice(0, 360) : pending.visualSkeleton,
            riskFlags: Array.isArray(riskFlags) ? [...new Set(riskFlags)].slice(0, 8) : [],
            paletteFingerprint: paletteFingerprint && typeof paletteFingerprint === 'object' ? paletteFingerprint : undefined,
            visualSignatureTs: visualSignature || visualSkeleton || (Array.isArray(riskFlags) && riskFlags.length) || paletteFingerprint ? now : undefined,
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_STORED)));
        localStorage.removeItem(PENDING_KEY);
    } catch (error) {
        console.warn('[RabbitMirror] Failed to commit pending combo:', error);
    }
}

// 兼容旧调用：0.31.21 起不再在 prompt 构建时直接写入“最近历史”，只暂存为 pending。
export function setLastCombo(combo) {
    setPendingCombo(combo);
}

export function clearLastCombo() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PENDING_KEY);
        // 清理旧版 key，防止旧记录混淆。
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v3');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v4');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v5');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v6');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v7');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v8');
        localStorage.removeItem('rabbit_mirror_theater:pending_combo:v8');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v9');
        localStorage.removeItem('rabbit_mirror_theater:pending_combo:v9');
        localStorage.removeItem('rabbit_mirror_theater:last_combo:v10');
        localStorage.removeItem('rabbit_mirror_theater:pending_combo:v10');
    } catch {}
}

export function updateLatestVisualSignature(visualSignature, visualSkeleton = '', riskFlags = [], paletteFingerprint = null) {
    if (!visualSignature && !visualSkeleton && !(Array.isArray(riskFlags) && riskFlags.length) && !paletteFingerprint) return;
    try {
        commitPendingCombo(visualSignature, visualSkeleton, riskFlags, paletteFingerprint);
        const history = readHistory();
        if (!history.length) return;
        const last = history[history.length - 1];
        if (visualSignature) last.visualSignature = String(visualSignature).slice(0, 280);
        if (visualSkeleton) last.visualSkeleton = String(visualSkeleton).slice(0, 360);
        if (Array.isArray(riskFlags) && riskFlags.length) last.riskFlags = [...new Set(riskFlags)].slice(0, 8);
        if (paletteFingerprint && typeof paletteFingerprint === 'object') last.paletteFingerprint = paletteFingerprint;
        last.visualSignatureTs = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_STORED)));
    } catch (error) {
        console.warn('[RabbitMirror] Failed to store visual signature:', error);
    }
}
