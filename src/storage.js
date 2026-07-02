const STORAGE_KEY = 'rabbit_hole_theater:last_combo:v3';

export function getLastCombo() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

export function setLastCombo(combo) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...combo, ts: Date.now() }));
    } catch (error) {
        console.warn('[RabbitHole] Failed to store last combo:', error);
    }
}

export function clearLastCombo() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {}
}
