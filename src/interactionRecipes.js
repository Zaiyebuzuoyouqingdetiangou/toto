// Read-only legacy recipe decoding and observed behavior history. No draw pool or generation templates.
import { INTERACTION_HISTORY_TYPES, INTERACTION_RECIPE_REPLACEMENTS } from '../data/structured/interactionIndex.js?rmv=1.67.18';

const BY_ID = new Map(INTERACTION_HISTORY_TYPES.map(recipe => [recipe.id, recipe]));

function canonicalRecipeIds(values) {
    return [...new Set(values.map(id => typeof id === 'string'
        ? (Object.hasOwn(INTERACTION_RECIPE_REPLACEMENTS, id) ? INTERACTION_RECIPE_REPLACEMENTS[id] : id) : null)
        .filter(id => BY_ID.has(id)))];
}

export function interactionRecipeFields(source) {
    if (source?.presentationMode === 'text' || source?.pureOrder === true) return {};
    const values = Array.isArray(source?.interactionRecipeIds) ? source.interactionRecipeIds : [source?.interactionRecipeId];
    const ids = canonicalRecipeIds(values);
    // Keep the singular first-ID alias for old records and consumers.
    return ids.length ? { interactionRecipeId: ids[0], interactionRecipeIds: ids } : {};
}

export function interactionRecipesFor(source) {
    return (interactionRecipeFields(source).interactionRecipeIds || []).map(id => BY_ID.get(id));
}

export function observedInteractionRecipesFor(source) {
    if (source?.presentationMode === 'text' || source?.pureOrder === true) return [];
    const observed = source?.interactionFamily;
    if (Array.isArray(observed?.observedRecipeIds)) {
        return canonicalRecipeIds(observed.observedRecipeIds).map(id => BY_ID.get(id));
    }
    // Old records have only a coarse scan. Do not reinterpret generic radio or
    // checkbox controls as pages/layers, and never fall back to unused plans.
    const legacy = { inner_details_family: 'fold', flip_card_family: 'flip', popover_family: 'popup' };
    const id = Number(observed?.confidence) >= .8 && Object.hasOwn(legacy, observed?.id) ? legacy[observed.id] : null;
    return id ? [BY_ID.get(id)] : [];
}

export function interactionRecipeFor(source) {
    return interactionRecipesFor(source)[0] || null;
}

// Strip only the sending copy. Saved works and their original records stay intact.
export function withoutInteractionRecipe(combo) {
    if (!combo || typeof combo !== 'object') return combo;
    const next = { ...combo };
    delete next.interactionRecipeId;
    delete next.interactionRecipeIds;
    if (Array.isArray(combo.atmosphereMenu)) next.atmosphereMenu = combo.atmosphereMenu.map(withoutInteractionRecipe);
    return next;
}
