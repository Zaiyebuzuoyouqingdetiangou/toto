import { INTERACTION_MECHANISMS } from '../data/raw/rawInteractionRecipes.js?rmv=1.62.85';
import { INTERACTION_RECIPES, INTERACTION_RECIPE_REPLACEMENTS } from '../data/structured/interactionIndex.js?rmv=1.62.85';

const BY_ID = new Map(INTERACTION_RECIPES.map(recipe => [recipe.id, recipe]));

// Generation policy only. Keep all 18 IDs and runtime mechanisms readable for
// old works, frozen plans, repair and actual-effect history.
export const FORM_INTERACTION_CONSTRUCTION = '交互先从展现形式的结构、功能、使用方式与叙事推导，操作和反馈融入本体；不得从固定候选清单反推玩法。操作须带来内容相关的发现、反应或后续，运行支持仅供已构思的操作按需采用。除外层整面开合外，禁止内部 details/summary 及展开／收起正文的替代结构；禁止并列按钮／标签仅轮换同位置正文，改名或改数量也算。条目或参考若含这些做法，保留其内容与展现形式，改用本体其他真实操作。';

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

function formText(combo) {
    // Theme words must not turn a book into a machine. Match only form material.
    const formats = combo?.formats || [];
    const primary = combo?.visualSceneryCombination ? formats.filter(item => item.id !== '10.2.2') : formats;
    const items = primary.length ? primary : formats;
    return items.map(item => `${item.title || ''} ${item.summary || ''} ${(item.tags || []).join(' ')}`)
        .join(' ').toLowerCase();
}

export function eligibleInteractionRecipes(combo) {
    if (!combo || combo.presentationMode === 'text' || combo.pureOrder) return [];
    const text = formText(combo);
    const formats = combo.formats || [];
    const pureScenery = formats.length > 0 && formats.every(item => item.id === '10.2.2');
    return INTERACTION_RECIPES.filter(recipe => recipe.id !== 'fold' && (recipe.universal
        || (pureScenery && recipe.sceneryCompatible)
        || recipe.fit.some(word => text.includes(word))));
}

export function selectInteractionRecipe(combo, { randomUnit = Math.random, recent = [], usedIds = [], excludedFamilies = [], companionIds = [] } = {}) {
    usedIds = canonicalRecipeIds(usedIds);
    companionIds = canonicalRecipeIds(companionIds);
    let eligible = eligibleInteractionRecipes(combo).filter(recipe => !excludedFamilies.includes(recipe.family));
    const textSwitchObserved = recent.some(record => /operation_family\s*:\s*(?:text_panel_switch|text_disclosure_stack)(?:；|$)/.test(record?.visualSkeleton || ''));
    if (!eligible.length) return null;
    const used = new Set(usedIds);
    const recentIds = new Set(recent.flatMap(record => observedInteractionRecipesFor(record).map(recipe => recipe.id)));
    const recentFamilies = new Set([...recentIds, ...usedIds].map(id => BY_ID.get(id)?.family).filter(Boolean));
    if (textSwitchObserved) {
        const freshPhysical = eligible.filter(recipe => ['object_state', 'spatial_scroll'].includes(recipe.effect)
            && !recentIds.has(recipe.id) && !used.has(recipe.id) && !recentFamilies.has(recipe.family));
        const nonPageAlternatives = eligible.filter(recipe => recipe.effect !== 'reading_navigation');
        if (freshPhysical.length) eligible = freshPhysical;
        else if (nonPageAlternatives.length) eligible = nonPageAlternatives;
    }
    const companionGroups = new Set(companionIds.map(id => BY_ID.get(id)?.pairingGroup).filter(Boolean));
    if (companionGroups.size) {
        const complementary = eligible.filter(recipe => !companionGroups.has(recipe.pairingGroup));
        // Exhaustion softens this preference; it never cancels a valid draw.
        if (complementary.length) eligible = complementary;
    }
    // Prefer genuinely unused recipes; exhaustion softens selection, never blocks generation.
    const unused = eligible.filter(recipe => !used.has(recipe.id));
    const pool = unused.length ? unused : eligible;
    const fresh = pool.filter(recipe => !recentIds.has(recipe.id));
    const idCandidates = fresh.length ? fresh : pool;
    const freshFamilies = idCandidates.filter(recipe => !recentFamilies.has(recipe.family));
    const candidates = freshFamilies.length ? freshFamilies : idCandidates;
    const weights = candidates.map(recipe => (recipe.universal ? 1 : 3) * (recentFamilies.has(recipe.family) ? .35 : 1));
    const value = Number(randomUnit());
    let cursor = (Number.isFinite(value) ? Math.min(.999999999, Math.max(0, value)) : 0) * weights.reduce((a, b) => a + b, 0);
    return candidates.find((_recipe, index) => (cursor -= weights[index]) < 0) || candidates[candidates.length - 1];
}

export function selectInteractionRecipes(combo, options = {}) {
    const first = selectInteractionRecipe(combo, options);
    if (!first) return [];
    const picked = [first], random = options.randomUnit || Math.random;
    // Draw a variable set of complementary operations, not a quota of controls.
    // Each family appears once in the recipe set; the model can reuse it on objects.
    while (Number(random()) < (picked.length === 1 ? .75 : .3 / picked.length)) {
        const next = selectInteractionRecipe(combo, { ...options,
            usedIds: [...(options.usedIds || []), ...picked.map(item => item.id)],
            companionIds: picked.map(item => item.id),
            excludedFamilies: picked.map(item => item.family) });
        if (!next) break;
        picked.push(next);
    }
    return picked;
}

export function attachInteractionRecipes(combo, options = {}) {
    if (!combo || combo.presentationMode === 'text' || combo.pureOrder) return combo;
    const usedIds = new Set(options.usedIds || []);
    const menu = combo.atmosphereMenu;
    if (Array.isArray(menu) && menu.length > 1) {
        combo.atmosphereMenu = menu.map(ticket => {
            const formats = (ticket.formatFullLines || ticket.formatLines || []).map((title, index) => ({ id: ticket.formatIds?.[index], title }));
            const source = { ...combo, ...ticket, formats, atmosphereMenu: undefined };
            const held = interactionRecipesFor(source);
            if (held.length) {
                held.forEach(item => usedIds.add(item.id));
                return { ...ticket };
            }
            const picked = selectInteractionRecipes(source, { ...options, usedIds: [...usedIds] });
            picked.forEach(item => usedIds.add(item.id));
            return { ...ticket, ...interactionRecipeFields({ interactionRecipeIds: picked.map(item => item.id) }) };
        });
        // No ticket has been chosen. The first candidate must not masquerade as a result.
        delete combo.interactionRecipeId;
        delete combo.interactionRecipeIds;
    } else if (!interactionRecipeFor(combo)) {
        const picked = selectInteractionRecipes(combo, options);
        Object.assign(combo, interactionRecipeFields({ interactionRecipeIds: picked.map(item => item.id) }));
    }
    return combo;
}

export function diversifyBatchInteractionRecipes(combos, options = {}) {
    const usedIds = new Set();
    for (const combo of combos || []) {
        if (!combo || combo.presentationMode === 'text' || combo.pureOrder) continue;
        const candidates = combo.atmosphereMenu?.length > 1 ? combo.atmosphereMenu : [combo];
        for (const candidate of candidates) {
            if (interactionRecipesFor(candidate).some(recipe => usedIds.has(recipe.id)
                || [...usedIds].some(id => BY_ID.get(id)?.family === recipe.family))) {
                const source = candidate === combo ? combo : { ...combo, ...candidate,
                    formats: (candidate.formatFullLines || candidate.formatLines || []).map((title, index) => ({ id: candidate.formatIds?.[index], title })) };
                const picked = selectInteractionRecipes(source, { ...options, usedIds: [...usedIds] });
                Object.assign(candidate, interactionRecipeFields({ interactionRecipeIds: picked.map(item => item.id) }));
            }
            interactionRecipesFor(candidate).forEach(recipe => usedIds.add(recipe.id));
        }
    }
}

export function buildInteractionRecipeRule(faceContexts, rawPolicy = 'balanced', constructionRule = '') {
    // Keep the draw in local metadata, but do not prescribe it to a face or
    // candidate. Deduplicated wiring is a capability reference, not a play menu.
    const mechanisms = new Set();
    for (const face of faceContexts || []) {
        if (face.textPresentation || face.combo?.pureOrder) continue;
        const candidates = face.atmosphereFaces || [face];
        for (const candidate of candidates) {
            for (const recipe of interactionRecipesFor(candidate.combo)) {
                if (recipe.id !== 'fold') mechanisms.add(recipe.mechanism);
            }
        }
    }
    const numbers = (faceContexts || []).flatMap((face, index) => !face.textPresentation && !face.combo?.pureOrder ? [index + 1] : []);
    if (!numbers.length) return '';
    const construction = `共用适用规则【${numbers.map(number => `第 ${number} 面 HTML`).join('；')}】\n${constructionRule || FORM_INTERACTION_CONSTRUCTION}`;
    const resultConditions = { drag: 'placed=甲,乙', adjust: 'p>=0.6', reveal: 'p>=0.6', view: 'p>=0.6', input: 'match', reorder: 'order=甲,乙', accumulate: 'count>=2' };
    const conditions = [...new Set([...mechanisms].map(key => resultConditions[key]).filter(Boolean))];
    const results = conditions.length ? `\n阶段联动：采用对应构造时，在 data-rm-ui 内写实际结果节点 data-rm-result hidden，data-rm-when="${conditions.join('"或"')}"；驱动按状态显隐，复原同步。结果用景物、细节或后续控件承接。` : '';
    const implementation = mechanisms.size ? `\n局部运行支持（按需采用，不限定玩法；标识限本面；不执行模型脚本）：\n${[...mechanisms].map(key => INTERACTION_MECHANISMS[key]).join('\n')}` : '';
    return `交互构造库【先构思本体操作，再参考实现】：
${construction}
${implementation}${results}`;
}

export function interactionExecutionReminder(combo) {
    // Compatibility export: final checks are shared by the prompt builder.
    // Repeating sampled recipe names near output would override form-led design.
    return '';
}
