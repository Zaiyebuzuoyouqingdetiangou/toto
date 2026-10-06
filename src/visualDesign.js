// Compatibility export: all saved/frozen choices now use the retained guidance.
// Existing artwork/colour variants are not rewritten.
export function visualDesignMode(settings) {
    return 'guided1553';
}

export function usesModelOriginalColors(settings) {
    return true; // Use the model's original colours.
}

export function postGenerationRecolorEnabled(settings) {
    // Retained export for old callers; the generation trial has been retired.
    return false;
}

// Work on the frozen sending copy only. Existing saved products and recipes
// remain intact, including when a user rewrites an older, palette-bearing face.
export function withoutPaletteRecipe(combo) {
    if (!combo || typeof combo !== 'object') return combo;
    const next = { ...combo };
    delete next.paletteRecipeId;
    if (Array.isArray(combo.atmosphereMenu)) next.atmosphereMenu = combo.atmosphereMenu.map(withoutPaletteRecipe);
    return next;
}

// Retained default guidance, unchanged when the old/new choice was retired.
export const GUIDED_VISUAL_FLOOR = '依本面已选展现形式与正文，先确定视觉风格、主体焦点和阅读顺序，再写 HTML。比例、留白、字级与字重拉开主次，背景、主体和文字以明暗、冷暖相互衬托；具体颜色、构图与工艺由本面决定，只输出完成的成品。';

// Retained visual enhancement, once per HTML batch. Drawing no longer needs
// a separate toggle; motion and document flow keep their existing shared rules.
export const COMMON_VISUAL_DRAWING = '必须用 HTML/CSS 或安全内联 SVG 依展现形式绘出主体轮廓、部件连接与材质接缝，首个主体内部分出远近层次（底层、主体、近处细节），层与层之间有遮挡或投影，受光与投影一致；这些层都在本体之内，不在外面另套框。图形、装置与场景类的面首屏以画面为主，可见文字控制在三四百字以内，书信、日志、论坛等文字媒介不受此限；交互就地改变对应对象的内容或空间状态。不固定布局，不强制 SVG。';
