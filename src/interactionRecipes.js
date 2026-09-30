import { INTERACTION_RECIPES, INTERACTION_MECHANISMS } from '../data/structured/interactionIndex.js?rmv=1.62.36';

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

export function buildInteractionRecipeRule(faceContexts) {
    const assignments = [];
    const mechanisms = new Set();
    for (const [index, face] of (faceContexts || []).entries()) {
        if (face.textPresentation || face.combo?.pureOrder) continue;
        const candidates = face.atmosphereFaces || [face];
        for (const [ticketIndex, candidate] of candidates.entries()) {
            const recipe = interactionRecipeFor(candidate.combo);
            if (!recipe) continue;
            mechanisms.add(recipe.mechanism);
            const scope = `第 ${index + 1} 面${face.atmosphereFaces ? `／仅选签 ${ticketIndex + 1} 时` : ''}`;
            assignments.push(`${scope}：${recipe.id}「${recipe.title}」〔${recipe.mechanism}〕\n操作：${recipe.action}。\n可见结果：${recipe.result}。`);
        }
    }
    if (!assignments.length) return '';
    return `交互构造库【第三抽取池；仅下列 HTML 面／选中签适用】：
主题提供内容，原展现形式决定主体，交互签提供操作与状态的构造依据；三者共同成立。用户明确玩法和原形式固有功能优先，按它们映射操作对象，不为了交互签更换媒介。
先用本轮具体物件、图中位置或原文证据替换下面的抽象对象，再组织初始画面、操作态和可返回的结果态。直接操作主体上的部位或证据；说明文字补充画面已经表现的关系，文字媒介仍保留其正文，不强行缩成摘要。按钮、翻页与折叠按用途保留，数量不限。
${assignments.join('\n\n')}
本轮用到的实现依据（每种只列一次；标识符是结构示意，实际须面内唯一）：
${[...mechanisms].map(key => `${key}：${INTERACTION_MECHANISMS[key]}`).join('\n')}
使用已有安全 HTML/CSS，不写 script、事件属性或借用宿主函数。触屏操作不可只依赖 hover；状态输入保留可聚焦入口和关联标签。普通 range/color 输入不会自动驱动其他 CSS；不伪称自由拖拽、实时物理、真正随机判定、录音或跨次持久化。复杂过程可用诚实标明的有限状态实现。`;
}

export function interactionExecutionReminder(combo) {
    if (combo?.presentationMode === 'text' || combo?.pureOrder) return '';
    if (combo?.atmosphereMenu?.some(ticket => interactionRecipeFor(ticket))) {
        return '第三池同签执行：交互取选中签已抽好的构造，用本面主体完成操作与可见结果；不要串用未选签。';
    }
    const recipe = interactionRecipeFor(combo);
    return recipe ? `第三池已锁定「${recipe.title}」：把共用交互构造中的操作与结果落实到本面主体。` : '';
}
