// Two model-original visual rules. Old saved/frozen trial settings migrate to
// guidance at every generation entry; existing artwork/colour variants are kept.
export function visualDesignMode(settings) {
    return settings?.visualDesignMode === 'reference1553' ? 'reference1553' : 'guided1553';
}

export function usesModelOriginalColors(settings) {
    return true; // Both supported rules use the model's original colours.
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

// Source: RabbitMirror-1.5.53-HOSTUIFIX1-FULL.zip, src/promptBuilder.js.
export const REFERENCE_VISUAL_FLOOR = '展现形式与媒介本体决定具体长相。成品须主次清楚，比例、空间、材质、信息组织、细节与配色均服务本轮内容；不得把黑／深灰系统面板、蓝色科技 UI、浅暖纸面或通用圆角卡片当作默认高级感模板。';

// The new rules replace only the floor above. No second model request,
// fixed style menu, example HTML, control quota or acceptance gate is added.
export const GUIDED_VISUAL_FLOOR = '依本面已选展现形式与正文，先确定视觉风格、主体焦点和阅读顺序，再写 HTML。比例、留白、字级与字重拉开主次，背景、主体和文字以明暗、冷暖相互衬托；具体颜色、构图与工艺由本面决定，只输出完成的成品。';

// Shared by both visual floors, once per HTML batch. Drawing no longer needs
// a separate toggle; motion and document flow keep their existing shared rules.
export const COMMON_VISUAL_DRAWING = '必须用 HTML/CSS 或安全内联 SVG 依展现形式绘出主体轮廓、部件连接与材质接缝，按需呈现前后遮挡，受光与投影一致；交互就地改变对应对象的内容或空间状态。不固定布局，不强制 SVG。';
