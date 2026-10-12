import { getRecentPaletteCooldown, getActivePaletteCooldown } from './storage.js?rmv=1.68.7';

const SAFE_PALETTE_LABEL_RE = /^(?:(?:低|中|高)明度)?(?:暖|冷|中性)?(?:红|橙|黄|绿|青|蓝|紫|粉|中性色)?(?:(?:低|中|高)饱和)?$/;

// 主背景近白、近黑（几乎没有颜色）的不点名：和色族短检同一个判断，免得白底又被说成「暖橙」「冷蓝」。
// 近白重复另有近白提醒负责。
function nearNeutralMain(fingerprint) {
    const hex = Array.isArray(fingerprint?.mainColors) ? fingerprint.mainColors[0] : '';
    if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) return false;
    const [r, g, b] = hex.slice(1).match(/../g).map(value => parseInt(value, 16));
    return Math.max(r, g, b) - Math.min(r, g, b) < 16;
}

function recentPaletteLabels(skipHueFamilies = new Set()) {
    return [...new Set(getRecentPaletteCooldown(3).filter(item => !skipHueFamilies.has(item?.fingerprint?.hueFamily) && !nearNeutralMain(item?.fingerprint)).map(item => String(item?.label || '').trim())
        .filter(label => label && label.length <= 24 && SAFE_PALETTE_LABEL_RE.test(label)))];
}

function ordinaryDarkCooldown(settings) {
    if (settings?.darkVisualMode === true || settings?.visualToneMode === 'soft') return null;
    const cooldown = getActivePaletteCooldown(3);
    return cooldown.active ? cooldown : null;
}

// 近输出短锁里的配色一句。skipHueFamilies：同一短锁里「色族短检」已经点名的色族，这里不再用另一套叫法重复一遍。
export function buildPaletteCooldownExecutionLock(settings, { skipHueFamilies = [] } = {}) {
    const labels = recentPaletteLabels(new Set(Array.isArray(skipHueFamilies) ? skipHueFamilies : []));
    const cooldown = ordinaryDarkCooldown(settings);
    const palette = labels.length ? `近期配色「${labels.join('、')}」强避重；用户指定与材质所需颜色保留，在其余主辅色关系中实际变化，不只换强调色` +
        (settings?.darkVisualMode === true ? '；深色范围内避重，不把低明度本身禁用' : settings?.visualToneMode === 'soft' ? '；柔和浅色范围内避重' : cooldown ? '' : '；明暗不单独禁用') : '';
    return [palette, cooldown ? `普通模式深色冷却剩余 ${cooldown.remaining} 轮；本轮禁止再次使用大面积深色背景承载正文（用户明确配色优先）` : ''].filter(Boolean).join('；');
}

// Actual colours are listed once with completed selections by the composer.
// This independent state keeps the existing five-round dark-mode exception.
export function buildPaletteCooldownRule(settings) {
    const cooldown = ordinaryDarkCooldown(settings);
    return cooldown ? `普通模式深色冷却【剩余 ${cooldown.remaining} 轮；同批多面算一轮】：主要正文不得继续使用大面积深色底，深色只作局部结构或强调；用户明确配色优先。` : '';
}
