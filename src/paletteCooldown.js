import { getRecentPaletteCooldown } from './storage.js?rmv=1.62.33';

const SAFE_PALETTE_LABEL_RE = /^(?:(?:低|中|高)明度)?(?:暖|冷|中性)?(?:红|橙|黄|绿|青|蓝|紫|粉|中性色)?(?:(?:低|中|高)饱和)?$/;

function recentPaletteLabels() {
    return [...new Set(getRecentPaletteCooldown(3).map(item => String(item?.label || '').trim())
        .filter(label => label && label.length <= 24 && SAFE_PALETTE_LABEL_RE.test(label)))];
}

export function buildPaletteCooldownExecutionLock(settings) {
    const labels = recentPaletteLabels();
    if (!labels.length) return '';
    return `近期配色「${labels.join('、')}」强避重；用户指定与材质所需颜色保留，在其余主辅色关系中实际变化，不只换强调色` +
        (settings?.darkVisualMode === true ? '；深色范围内避重，不把低明度本身禁用' : '；明暗不单独禁用');
}

export function buildPaletteCooldownRule(settings) {
    const labels = recentPaletteLabels();
    if (!labels.length) return '';
    return `配色短冷却【近期三轮实际配色（含各轮多面），深浅一视同仁】：
  - 近期配色：${labels.map(label => `「${label}」`).join('、')}。本轮必须从选中形式的材质、环境和光线重新推导，改变可变的主色相、冷暖或饱和度关系，不得只调亮暗或换一处强调色。
  - 用户明确配色与形式固有材质优先；在剩余可变部分避重，不为换色破坏材质，不机械轮换固定色板。${settings?.darkVisualMode === true ? '深色模式下仍保持低明度主背景与阅读承载，只在深色范围内形成差异。' : '深色和浅色均可使用，不因前一面深色而禁止后续深色。'}`;
}
