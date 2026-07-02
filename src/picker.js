import { THEMATIC_CATEGORIES } from '../data/structured/thematicIndex.js';
import { PRESENTATION_FORMATS } from '../data/structured/presentationIndex.js';
import { getLastCombo, setLastCombo } from './storage.js';

function randomInt(min, max) {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return Math.floor(Math.random() * (high - low + 1)) + low;
}

function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function allowByMode(item, mode) {
    const tags = item.tags || [];
    if (mode === 'canon') return true;
    return !tags.includes('canon');
}

function pickMany(pool, count, lastIds = [], avoidRepeat = true) {
    const last = new Set(lastIds || []);
    let candidates = pool;
    if (avoidRepeat) {
        const filtered = candidates.filter(x => !last.has(x.id));
        if (filtered.length >= count) candidates = filtered;
    }
    return shuffle(candidates).slice(0, Math.max(1, Math.min(count, candidates.length)));
}

export function pickCombination(settings) {
    const last = getLastCombo();
    const themeCount = randomInt(settings.themesMin, settings.themesMax);
    const formatCount = randomInt(settings.formatsMin, settings.formatsMax);

    let themePool = THEMATIC_CATEGORIES.filter(item => allowByMode(item, settings.mode));
    let formatPool = PRESENTATION_FORMATS.filter(item => allowByMode(item, settings.mode));

    if (!themePool.length) themePool = THEMATIC_CATEGORIES;
    if (!formatPool.length) formatPool = PRESENTATION_FORMATS;

    const themes = pickMany(themePool, themeCount, last.themeIds, settings.avoidRepeat);
    const formats = pickMany(formatPool, formatCount, last.formatIds, settings.avoidRepeat);

    const combo = {
        themes,
        formats,
        themeIds: themes.map(x => x.id),
        formatIds: formats.map(x => x.id),
        mode: settings.mode,
    };

    setLastCombo(combo);
    return { combo, last };
}
