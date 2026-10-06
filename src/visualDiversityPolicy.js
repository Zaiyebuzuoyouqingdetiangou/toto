import { classifyPaletteSamples } from './paletteObservation.js?rmv=1.65.7';

const HUE_FAMILY_LABELS = Object.freeze({
    red: '红色族', orange: '橙色族', yellow: '黄色族', green: '绿色族', cyan: '青色族',
    blue: '蓝色族', purple: '紫色族', pink: '粉色族', neutral: '无彩色族（黑／白／灰）',
});

// The caller supplies completed rounds, not a face count or planned palettes.
// Reuse its hue result, not brightness-based palette labels: every family keeps
// its light/dark variants together, including achromatic black/white/gray.
// Never infer colors from prose, accents or a selected-but-unused palette.
export function recentPaletteExecutionReminder(recent = [], settings = {}) {
    const families = [...new Set(recent.flatMap(item => {
        if (!item || item.presentationMode === 'text' || item.pureOrder) return [];
        const palette = item.paletteFingerprint;
        if (!Number.isFinite(Number(palette?.confidence)) || Number(palette.confidence) < .35) return [];
        const validColor = color => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color);
        // 只看主背景和第一个主承载面；按钮、强调色等点缀不计入，否则一轮就会带进好几个色族。
        const main = Array.isArray(palette.mainColors) && palette.mainColors.every(validColor) ? palette.mainColors.slice(0, 1) : [];
        const surfaces = Number(palette?.confidence) >= .5 && Array.isArray(palette?.contentSurfaceColors)
            ? palette.contentSurfaceColors.slice(0, 1).filter(validColor) : [];
        return [...new Set([...main, ...surfaces])].map(hex => {
            const [r, g, b] = hex.slice(1).match(/../g).map(value => parseInt(value, 16));
            const observed = classifyPaletteSamples([{ color: { r, g, b, a: 1 }, weight: 1 }], palette.source || 'raw', true);
            // 黑白灰不进色族禁令：白纸、黑底等是很多媒介的固有材质，近白浅底另有提醒负责。
            return observed?.hueFamily === 'neutral' ? '' : HUE_FAMILY_LABELS[observed?.hueFamily];
        }).filter(Boolean);
    }))];
    if (!families.length) return '';
    return `HTML 面配色短检：近三轮主背景／主承载用过「${families.join('、')}」；同一色族的深色和浅色算同一种（深橙、浅橙都是橙色族），本轮主背景与主承载换用其他色族，只换深浅、饱和或点缀不算。用户明确配色与形式固有材质优先。${settings.darkVisualMode === true ? '在深色范围内换色族，不改亮。' : ''}`;
}

// Shared generation policy, emitted once after composing all faces/candidates.
// These are creative requirements, not parser gates or automatic retry triggers.
export function strongVisualDiversityRule({ hasHistory = false, textOnly = false, textRevealRotation = false } = {}) {
    const basis = hasHistory ? '参考近期选材与实际主色' : '依正文独立构思';
    if (textOnly || !hasHistory) return `避重：${basis}，同批及相邻轮优先变化，允许部分复用；用户指定、固有功能与材质优先。${textOnly ? '文本面只调整题材与阅读配色，不新增交互或动画。' : ''}`;
    return 'HTML 面避重：近三轮实际主色及同族相近色必须避开；背景与主承载须换色族，改深浅、饱和或点缀色不算。主题、形式和交互编号可部分复用，但近期重复的页面布局与操作方式必须改变。仅换名称、按钮数量、颜色或编号不算变化。'
        // 不长期禁止：近三轮有两轮属于这一类时才换一次口味，之后照常可用。
        + (textRevealRotation ? '近三轮有两轮的主交互属于「多个入口各显示一段文字」（切页、折叠、并列开关都算同一类）：本轮改为直接操作媒介自身的部件，结果改变媒介本身，整面交互作用在同一个主体上，不让每个条目各配一个开关；之后这类写法照常可以用。' : '')
        + '用户指定优先；保留必要固有色、功能与材质，材质不豁免整面用色与结构避重。';
}

export function darkVisualGenerationRule(settings) {
    if (settings?.darkVisualMode !== true) return '';
    return `深色生成模式【本次所有新生成镜面，包括长文本】：
  - 整体背景、主要承载面与阅读正文区域均采用适合夜间阅读的低明度背景，文字、标签和操作反馈保持清晰对比。局部高光或物件可按材质保留，不能用大面积浅色纸面、米黄卡片或白色正文框抵消深色模式。
  - 在深色明度范围内落实用户色彩偏好，仍须强避重：从本轮形式与材质推导不同的主辅色、冷暖、饱和度和受光关系，不连续套同一黑灰界面，也不把“深色”本身判成重复并改亮。
  - 保留形式的固有结构、材质纹理与原有玩法，通过夜间环境、染色材质或低明度同类材料表达；不能把所有媒介都改成终端面板。长文本仍只做原有阅读美化，不添加 HTML 面的交互或动画。`;
}

export function visualDiversityExecutionLock(_settings, { textRevealRotation = false, noButtonRow = false, paleBan = false, paletteReminder = '' } = {}) {
    // The shared ledger is sent once; only active, concrete reminders are repeated here, closest to output.
    return [
        noButtonRow ? '本面媒介本身没有成排按钮：主交互不用一排同款按钮或标签切换内容，交互落在媒介自己的部件上。' : '',
        textRevealRotation ? '本轮换口味：整面交互作用在同一个主体上（可以分几步），不让每个条目各配一个开关。' : '',
        paleBan ? '本轮主背景与主承载不用米白、米黄或其他近白浅底（近三轮已出现两次），媒介本身是白纸白底时用纸张以外的部分拉开颜色。' : '',
        paletteReminder,
    ].filter(Boolean).join('\n');
}
