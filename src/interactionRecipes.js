import { resolveInteractionDetail, INTERACTION_MECHANISMS } from '../data/raw/rawInteractionRecipes.js?rmv=1.62.37';
import { INTERACTION_RECIPES } from '../data/structured/interactionIndex.js?rmv=1.62.37';

const BY_ID = new Map(INTERACTION_RECIPES.map(recipe => [recipe.id, recipe]));

export function interactionRecipeFields(source) {
    if (source?.presentationMode === 'text' || source?.pureOrder === true) return {};
    return BY_ID.has(source?.interactionRecipeId) ? { interactionRecipeId: source.interactionRecipeId } : {};
}

export function interactionRecipeFor(source) {
    return BY_ID.get(interactionRecipeFields(source).interactionRecipeId) || null;
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
    return INTERACTION_RECIPES.filter(recipe => recipe.universal || recipe.fit.some(word => text.includes(word)));
}

export function selectInteractionRecipe(combo, { randomUnit = Math.random, recent = [], usedIds = [] } = {}) {
    const eligible = eligibleInteractionRecipes(combo);
    if (!eligible.length) return null;
    const used = new Set(usedIds);
    const recentIds = new Set(recent.map(record => interactionRecipeFields(record).interactionRecipeId).filter(Boolean));
    const recentFamilies = new Set([...recentIds].map(id => BY_ID.get(id)?.family).filter(Boolean));
    // Prefer genuinely unused recipes; exhaustion softens selection, never blocks generation.
    const unused = eligible.filter(recipe => !used.has(recipe.id));
    const pool = unused.length ? unused : eligible;
    const fresh = pool.filter(recipe => !recentIds.has(recipe.id));
    const candidates = fresh.length ? fresh : pool;
    const weights = candidates.map(recipe => (recipe.universal ? 1 : 3) * (recentFamilies.has(recipe.family) ? .35 : 1));
    const value = Number(randomUnit());
    let cursor = (Number.isFinite(value) ? Math.min(.999999999, Math.max(0, value)) : 0) * weights.reduce((a, b) => a + b, 0);
    return candidates.find((_recipe, index) => (cursor -= weights[index]) < 0) || candidates[candidates.length - 1];
}

export function attachInteractionRecipes(combo, options = {}) {
    if (!combo || combo.presentationMode === 'text' || combo.pureOrder) return combo;
    const usedIds = new Set(options.usedIds || []);
    const menu = combo.atmosphereMenu;
    if (Array.isArray(menu) && menu.length > 1) {
        combo.atmosphereMenu = menu.map(ticket => {
            const formats = (ticket.formatFullLines || ticket.formatLines || []).map((title, index) => ({ id: ticket.formatIds?.[index], title }));
            const source = { ...combo, ...ticket, formats, atmosphereMenu: undefined };
            const held = interactionRecipeFor(source);
            const picked = held || selectInteractionRecipe(source, { ...options, usedIds: [...usedIds] });
            if (picked) usedIds.add(picked.id);
            return { ...ticket, ...(picked ? { interactionRecipeId: picked.id } : {}) };
        });
        // No ticket has been chosen. The first candidate must not masquerade as a result.
        delete combo.interactionRecipeId;
    } else if (!interactionRecipeFor(combo)) {
        const picked = selectInteractionRecipe(combo, options);
        if (picked) combo.interactionRecipeId = picked.id;
    }
    return combo;
}

export function diversifyBatchInteractionRecipes(combos, options = {}) {
    const usedIds = new Set();
    for (const combo of combos || []) {
        if (!combo || combo.presentationMode === 'text' || combo.pureOrder) continue;
        const candidates = combo.atmosphereMenu?.length > 1 ? combo.atmosphereMenu : [combo];
        for (const candidate of candidates) {
            if (usedIds.has(candidate.interactionRecipeId)) {
                const source = candidate === combo ? combo : { ...combo, ...candidate,
                    formats: (candidate.formatFullLines || candidate.formatLines || []).map((title, index) => ({ id: candidate.formatIds?.[index], title })) };
                const picked = selectInteractionRecipe(source, { ...options, usedIds: [...usedIds] });
                if (picked) candidate.interactionRecipeId = picked.id;
            }
            if (candidate.interactionRecipeId) usedIds.add(candidate.interactionRecipeId);
        }
    }
}

export function buildInteractionRecipeRule(faceContexts, rawPolicy = 'balanced') {
    const assignments = [];
    const mechanisms = new Set();
    for (const [index, face] of (faceContexts || []).entries()) {
        if (face.textPresentation || face.combo?.pureOrder) continue;
        const candidates = face.atmosphereFaces || [face];
        for (const [ticketIndex, candidate] of candidates.entries()) {
            const recipe = interactionRecipeFor(candidate.combo);
            if (!recipe) continue;
            const scope = `第 ${index + 1} 面${face.atmosphereFaces ? `／仅选签 ${ticketIndex + 1} 时` : ''}`;
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
    if (!assignments.length) return '';
    const implementation = mechanisms.size ? `\n本轮实现依据（各列一次，标识符须面内唯一）：\n${[...mechanisms].map(key => `${key}：${INTERACTION_MECHANISMS[key]}`).join('\n')}` : '';
    return `交互构造库【第三抽取池；仅下列 HTML 面／选中签适用】：
把本签操作与可见结果落实到正文对应的主体、部位或证据；用户明确玩法与原形式固有功能优先，不为交互签更换媒介。
${assignments.join('\n\n')}${implementation}`;
}

export function interactionExecutionReminder(combo) {
    if (combo?.presentationMode === 'text' || combo?.pureOrder) return '';
    if (combo?.atmosphereMenu?.some(ticket => interactionRecipeFor(ticket))) {
        return '第三池同签执行：交互取选中签已抽好的构造，用本面主体完成操作与可见结果；不要串用未选签。';
    }
    const recipe = interactionRecipeFor(combo);
    return recipe ? `第三池已锁定「${recipe.title}」：把共用交互构造中的操作与结果落实到本面主体。` : '';
}
