import { resolveInteractionDetail, INTERACTION_MECHANISMS } from '../data/raw/rawInteractionRecipes.js?rmv=1.62.61';
import { INTERACTION_RECIPES } from '../data/structured/interactionIndex.js?rmv=1.62.61';

const BY_ID = new Map(INTERACTION_RECIPES.map(recipe => [recipe.id, recipe]));

export function interactionRecipeFields(source) {
    if (source?.presentationMode === 'text' || source?.pureOrder === true) return {};
    const values = Array.isArray(source?.interactionRecipeIds) ? source.interactionRecipeIds : [source?.interactionRecipeId];
    const ids = [...new Set(values.filter(id => BY_ID.has(id)))];
    // Keep the singular first-ID alias for old records and consumers.
    return ids.length ? { interactionRecipeId: ids[0], interactionRecipeIds: ids } : {};
}

export function interactionRecipesFor(source) {
    return (interactionRecipeFields(source).interactionRecipeIds || []).map(id => BY_ID.get(id));
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
    return INTERACTION_RECIPES.filter(recipe => recipe.universal
        || (pureScenery && recipe.sceneryCompatible)
        || recipe.fit.some(word => text.includes(word)));
}

export function selectInteractionRecipe(combo, { randomUnit = Math.random, recent = [], usedIds = [], excludedFamilies = [], companionIds = [] } = {}) {
    let eligible = eligibleInteractionRecipes(combo).filter(recipe => !excludedFamilies.includes(recipe.family));
    const textSwitchObserved = recent.some(record => /operation_family\s*:\s*(?:text_panel_switch|text_disclosure_stack)(?:；|$)/.test(record?.visualSkeleton || ''));
    if (!eligible.length) return null;
    const used = new Set(usedIds);
    const recentIds = new Set(recent.flatMap(record => interactionRecipeFields(record).interactionRecipeIds || []));
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
            const picked = held.length ? held : selectInteractionRecipes(source, { ...options, usedIds: [...usedIds] });
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
    const assignments = [];
    const mechanisms = new Set();
    for (const [index, face] of (faceContexts || []).entries()) {
        if (face.textPresentation || face.combo?.pureOrder) continue;
        const candidates = face.atmosphereFaces || [face];
        for (const [ticketIndex, candidate] of candidates.entries()) {
            const scope = `第 ${index + 1} 面${face.atmosphereFaces ? `／仅选签 ${ticketIndex + 1} 时` : ''}`;
            for (const recipe of interactionRecipesFor(candidate.combo)) {
            let entry = `${scope}：${recipe.code}「${recipe.title}｜${recipe.summary}」`;
            // Compact never resolves detailed material. Other policies resolve only drawn IDs.
            if (rawPolicy !== 'compact') {
                const detail = resolveInteractionDetail(recipe.id);
                if (detail) entry += `\n操作：${detail.action}。\n可见结果：${detail.result}。`;
                if (rawPolicy === 'full') mechanisms.add(recipe.mechanism);
            }
            assignments.push(entry);
            }
        }
    }
    const numbers = (faceContexts || []).flatMap((face, index) => !face.textPresentation && !face.combo?.pureOrder ? [index + 1] : []);
    if (!numbers.length || (!assignments.length && !constructionRule)) return '';
    const construction = constructionRule
        ? `共用适用规则【${numbers.map(number => `第 ${number} 面 HTML`).join('；')}】\n${constructionRule}`
        : '先构造展现形式本体，再把本签各项操作与可见结果安放到它实际具备的部件、内容区域和使用流程。各交互共同服务同一个媒介，不各自搭一张无关卡片；同一种交互可复用于多个对象，不限制控件数量。用户明确玩法与原形式固有功能优先，不为交互签更换媒介。';
    if (!assignments.length) return construction;
    const implementation = mechanisms.size ? `\n本轮实现依据（各列一次，标识符须面内唯一）：\n${[...mechanisms].map(key => `${key}：${INTERACTION_MECHANISMS[key]}`).join('\n')}` : '';
    return `交互构造库【第三抽取池；仅下列 HTML 面／选中签适用】：
${construction}
${assignments.join('\n\n')}${implementation}`;
}

export function interactionExecutionReminder(combo) {
    if (combo?.presentationMode === 'text' || combo?.pureOrder) return '';
    if (combo?.atmosphereMenu?.some(ticket => interactionRecipeFor(ticket))) {
        return '第三池同签执行：交互取选中签已抽好的构造，用本面主体完成操作与可见结果；不要串用未选签。';
    }
    const recipes = interactionRecipesFor(combo);
    return recipes.length ? `第三池已锁定「${recipes.map(recipe => recipe.title).join('；')}」：各操作与结果落实到本面形式的实际部件，可在不同对象上复用。` : '';
}
