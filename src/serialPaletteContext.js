import { recentPaletteHueFamilies } from './visualDiversityPolicy.js?rmv=1.67.55';

const FAMILY_NAMES = Object.freeze({ red: '红', orange: '橙', yellow: '黄', green: '绿', cyan: '青', blue: '蓝', purple: '紫', pink: '粉' });
const validColor = color => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color);

// Request-local observations from accepted siblings only. This is a creative
// reminder, not a palette recipe, an output validator, or a retry condition.
// Keep only bounded color facts: never carry sibling HTML, prose or titles.
export function serialPaletteExecutionReminder(observations, target = {}, settings = {}) {
    const { faceIndex, faceCount } = target;
    if (target.presentationMode !== 'html' || target.pureOrder === true
        || !Number.isInteger(faceCount) || faceCount < 2 || faceCount > 5
        || !Number.isInteger(faceIndex) || faceIndex < 0 || faceIndex >= faceCount
        || !Array.isArray(observations)) return '';
    const seen = new Set();
    const lines = [];
    for (const item of observations.slice(0, 5)) {
        const index = item?.faceIndex;
        if (!Number.isInteger(index) || index < 0 || index >= faceCount || index === faceIndex || seen.has(index)
            || item.presentationMode !== 'html' || item.pureOrder === true) continue;
        const palette = item.paletteFingerprint;
        const confidence = Number(palette?.confidence);
        if (!Number.isFinite(confidence) || confidence < .35) continue;
        const mainColors = Array.isArray(palette.mainColors) ? palette.mainColors.slice(0, 1).filter(validColor) : [];
        const contentSurfaceColors = confidence >= .5 && Array.isArray(palette.contentSurfaceColors)
            ? palette.contentSurfaceColors.slice(0, 1).filter(validColor) : [];
        if (!mainColors.length && !contentSurfaceColors.length) continue;
        const facts = [mainColors.length ? `主背景${mainColors[0]}` : '', contentSurfaceColors.length ? `主承载${contentSurfaceColors[0]}` : ''].filter(Boolean);
        const families = recentPaletteHueFamilies([{ presentationMode: 'html', paletteFingerprint: { confidence, mainColors, contentSurfaceColors } }]);
        if (families.length) facts.push(`${families.map(key => FAMILY_NAMES[key]).join('／')}色族`);
        lines.push(`第${index + 1}面：${facts.join('，')}`);
        seen.add(index);
    }
    if (!lines.length) return '';
    return `【本批已完成镜面的配色】${lines.join('；')}。这些是其他面已用的颜色，不是本面配色模板。本面主背景与主承载优先换用其他色族，只改深浅或点缀不算；用户明确配色、原条目要求与形式固有材质优先，不更换本面已选主题和展现形式。${settings.darkVisualMode === true ? '保持深色模式。' : settings.visualToneMode === 'soft' ? '保持柔和浅色模式。' : ''}`;
}
