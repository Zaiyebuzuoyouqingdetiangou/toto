import { paletteGroupLabels } from './paletteRecipes.js?rmv=1.62.60';
import { getRecentPaletteCooldown, getActivePaletteCooldown, getRecentDiversityHistory } from './storage.js?rmv=1.62.60';

const SAFE_PALETTE_LABEL_RE = /^(?:(?:低|中|高)明度)?(?:暖|冷|中性)?(?:红|橙|黄|绿|青|蓝|紫|粉|中性色)?(?:(?:低|中|高)饱和)?$/;

function recentPaletteLabels() {
    return [...new Set(getRecentPaletteCooldown(3).map(item => String(item?.label || '').trim())
        .filter(label => label && label.length <= 24 && SAFE_PALETTE_LABEL_RE.test(label)))];
}

function ordinaryDarkCooldown(settings) {
    if (settings?.darkVisualMode === true) return null;
    const cooldown = getActivePaletteCooldown(5);
    return cooldown.active ? cooldown : null;
}

export function buildPaletteCooldownExecutionLock(settings) {
    const labels = recentPaletteLabels();
    const cooldown = ordinaryDarkCooldown(settings);
    const palette = labels.length ? `近期配色「${labels.join('、')}」强避重；用户指定与材质所需颜色保留，在其余主辅色关系中实际变化，不只换强调色` +
        (settings?.darkVisualMode === true ? '；深色范围内避重，不把低明度本身禁用' : cooldown ? '' : '；明暗不单独禁用') : '';
    return [palette, cooldown ? `普通模式深色冷却剩余 ${cooldown.remaining} 轮；本轮背景、主要承载面与正文阅读区采用中高明度，深色只作局部结构、物件或强调` : ''].filter(Boolean).join('；');
}

export function buildPaletteCooldownRule(settings, { includeIndexedFamily = false, compact = false } = {}) {
    const labels = recentPaletteLabels();
    const cooldown = ordinaryDarkCooldown(settings);
    const groups = includeIndexedFamily ? paletteGroupLabels(getRecentDiversityHistory(3)) : [];
    if (compact) {
        return [
            labels.length ? `近期三轮实际配色：${labels.join('、')}。` : '',
            groups.length ? `近期三轮色族（抽中与实际识别）：${groups.join('、')}。` : '',
            cooldown ? `普通模式深色冷却【剩余 ${cooldown.remaining} 轮；同批多面算一轮】：本轮背景、主要承载面与正文阅读区采用中高明度，优先于一般明暗与材质建议；局部深色物件、结构、阴影和强调保留，不固定色板。` : '',
        ].filter(Boolean).join('\n');
    }
    const palette = labels.length ? `配色短冷却【近期三轮实际配色（含各轮多面），深浅一视同仁】：
  - 近期配色：${labels.map(label => `「${label}」`).join('、')}。本轮必须从选中形式的材质、环境和光线重新推导，改变可变的主色相、冷暖或饱和度关系，不得只调亮暗或换一处强调色。
  - 用户明确配色与形式固有材质优先；在剩余可变部分避重，不为换色破坏材质，不机械轮换固定色板。${settings?.darkVisualMode === true ? '深色模式下仍保持低明度主背景与阅读承载，只在深色范围内形成差异。' : cooldown ? '明暗执行下方普通模式深色冷却，其余配色关系继续避重。' : '深色和浅色均可使用，不因前一面深色而禁止后续深色。'}` : '';
    const dark = cooldown ? `普通模式深色冷却【剩余 ${cooldown.remaining} 轮；同批多面算一轮】：
  - 本轮各面的整体背景、主要承载面及正文阅读区域采用中高明度，禁止再次以大面积深色作为主底；深色可保留在局部物件、结构、阴影和强调中。
  - 这是当前冷却期的明暗要求，优先于一般的自由明暗与材质配色建议；具体色彩仍随媒介选择，不固定色板，不改变抽中的形式、主体绘制、动态和正常控件。` : '';
    const family = groups.length ? `色族避重【近三轮抽中色族与已识别实际色族】：${groups.join('、')}。同族相近色一起避重，米白／米黄／奶油／燕麦视为同族；改变可变的主色调与主要承载，不以换色号或局部点色冒充变化。正文黑白字和必要局部颜色可正常使用；用户指定与原材质优先。` : '';
    return [palette, family, dark].filter(Boolean).join('\n\n');
}
