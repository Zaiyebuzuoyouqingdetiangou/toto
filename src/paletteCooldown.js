import { getRecentPaletteCooldown, getActivePaletteCooldown } from './storage.js?rmv=1.67.42';

const SAFE_PALETTE_LABEL_RE = /^(?:(?:低|中|高)明度)?(?:暖|冷|中性)?(?:红|橙|黄|绿|青|蓝|紫|粉|中性色)?(?:(?:低|中|高)饱和)?$/;

function recentPaletteLabels() {
    return [...new Set(getRecentPaletteCooldown(3).map(item => String(item?.label || '').trim())
        .filter(label => label && label.length <= 24 && SAFE_PALETTE_LABEL_RE.test(label)))];
}

function ordinaryDarkCooldown(settings) {
    if (settings?.darkVisualMode === true || settings?.visualToneMode === 'soft') return null;
    const cooldown = getActivePaletteCooldown(3);
    return cooldown.active ? cooldown : null;
}

export function buildPaletteCooldownExecutionLock(settings) {
    const labels = recentPaletteLabels();
    const cooldown = ordinaryDarkCooldown(settings);
    const palette = labels.length ? `近期配色「${labels.join('、')}」强避重；用户指定与材质所需颜色保留，在其余主辅色关系中实际变化，不只换强调色` +
        (settings?.darkVisualMode === true ? '；深色范围内避重，不把低明度本身禁用' : settings?.visualToneMode === 'soft' ? '；柔和浅色范围内避重' : cooldown ? '' : '；明暗不单独禁用') : '';
    return [palette, cooldown ? `普通模式深色冷却剩余 ${cooldown.remaining} 轮；本轮禁止再次使用大面积深色背景承载正文` : ''].filter(Boolean).join('；');
}

// Actual colours are listed once with completed selections by the composer.
// This independent state keeps the existing five-round dark-mode exception.
export function buildPaletteCooldownRule(settings) {
    const cooldown = ordinaryDarkCooldown(settings);
    return cooldown ? `普通模式深色冷却【剩余 ${cooldown.remaining} 轮；同批多面算一轮】：主要正文不得继续使用大面积深色底，深色只作局部结构或强调；用户明确配色优先。` : '';
}
