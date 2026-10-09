import { classifyPaletteSamples } from './paletteObservation.js?rmv=1.67.42';

const HUE_FAMILY_LABELS = Object.freeze({
    red: '红色族', orange: '橙色族', yellow: '黄色族', green: '绿色族', cyan: '青色族',
    blue: '蓝色族', purple: '紫色族', pink: '粉色族', neutral: '无彩色族（黑／白／灰）',
});

// The caller supplies completed rounds, not a face count or planned palettes.
// Reuse its hue result, not brightness-based palette labels: every family keeps
// its light/dark variants together, including achromatic black/white/gray.
// Never infer colors from prose, accents or a selected-but-unused palette.
// 近三轮实际主色所属的色族键（red/orange/…），黑白灰不计。与下方提醒用同一套判断。
export function recentPaletteHueFamilies(recent = []) {
    return [...new Set(recent.flatMap(item => {
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
            return observed?.hueFamily === 'neutral' || !HUE_FAMILY_LABELS[observed?.hueFamily] ? '' : observed.hueFamily;
        }).filter(Boolean);
    }))];
}

export function recentPaletteExecutionReminder(recent = [], settings = {}) {
    const families = recentPaletteHueFamilies(recent).map(key => HUE_FAMILY_LABELS[key]);
    if (!families.length) return '';
    return `HTML 面配色短检：近三轮主背景／主承载用过「${families.join('、')}」；同一色族的深色和浅色算同一种（深橙、浅橙都是橙色族），本轮主背景与主承载换用其他色族，只换深浅、饱和或点缀不算。用户明确配色与形式固有材质优先。${settings.darkVisualMode === true ? '在深色范围内换色族，不改亮。' : settings.visualToneMode === 'soft' ? '在柔和浅色范围内换色族，不改艳也不改暗。' : ''}`;
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

// 柔和浅色里的几种风格。每轮随机抽一种（避开最近两轮用过的），只把这一种的一句说明和四个举例色发出去；
// 举例色避开近三轮用过的色族和上次给过的颜色，免得模型总挑写在前面的那几个。米黄类一律不放进来。
// 每个颜色记着所属色族，用来和近期实际主色避重。
const SOFT_TONE_STYLES = Object.freeze([
    { id: 'morandi', name: '莫兰迪灰调', desc: '每种颜色都掺一点灰，低饱和、安静、高级', colors: [
        ['豆沙红', 'red'], ['灰玫红', 'red'], ['干枯玫瑰', 'red'], ['杏灰', 'orange'], ['珊瑚灰', 'orange'], ['芥末灰黄', 'yellow'],
        ['灰豆绿', 'green'], ['鼠尾草绿', 'green'], ['橄榄灰', 'green'], ['雾青', 'cyan'], ['青瓷灰', 'cyan'], ['雾蓝', 'blue'],
        ['雾霾蓝', 'blue'], ['烟灰蓝', 'blue'], ['雾紫', 'purple'], ['藕荷紫', 'purple'], ['灰丁香', 'purple'], ['灰粉', 'pink'],
        ['藕粉', 'pink'], ['脏粉', 'pink'], ['鸽灰', 'neutral'], ['水泥灰', 'neutral']] },
    { id: 'pastel', name: '干净浅色', desc: '干净透亮的浅色，不掺灰，轻盈柔软', colors: [
        ['浅玫瑰', 'red'], ['浅杏', 'orange'], ['蜜桃橘', 'orange'], ['淡柠黄', 'yellow'], ['薄荷绿', 'green'], ['嫩芽绿', 'green'],
        ['冰川青', 'cyan'], ['浅水青', 'cyan'], ['婴儿蓝', 'blue'], ['浅天蓝', 'blue'], ['淡紫', 'purple'], ['浅香芋紫', 'purple'],
        ['浅粉', 'pink'], ['樱花粉', 'pink'], ['蜜桃粉', 'pink'], ['芭蕾粉', 'pink']] },
    { id: 'chinese', name: '浅色传统色', desc: '只取浅淡的中国传统色，像瓷器、织物、古画的底色', colors: [
        ['水红', 'red'], ['桃夭', 'pink'], ['粉红藕', 'pink'], ['藕荷', 'purple'], ['丁香', 'purple'], ['月白', 'blue'],
        ['缥色', 'blue'], ['天青', 'cyan'], ['天水碧', 'cyan'], ['鸭卵青', 'cyan'], ['葱青', 'green'], ['苍色', 'neutral']] },
    { id: 'airy', name: '清透空气感', desc: '大量带一点蓝或青的浅底，像有风、有光，干净通透', colors: [
        ['天空浅蓝', 'blue'], ['玻璃蓝', 'blue'], ['玻璃青', 'cyan'], ['浅海青', 'cyan'], ['晨雾白蓝', 'blue'], ['薄荷水绿', 'green'],
        ['浅樱粉', 'pink'], ['淡雾紫', 'purple']] },
    { id: 'watercolor', name: '水彩晕染', desc: '浅色像水彩一样淡淡晕开，边缘柔和；可用很浅的同色晕染做底，正文放在颜色平稳的一块上', colors: [
        ['水彩粉', 'pink'], ['浅玫瑰晕', 'red'], ['杏色晕', 'orange'], ['浅绿晕', 'green'], ['青色水痕', 'cyan'], ['淡蓝水痕', 'blue'],
        ['淡紫晕', 'purple']] },
    { id: 'pearl', name: '珍珠贝母', desc: '带一点粉、一点蓝紫光泽的珍珠色浅底，温柔、微微梦幻；光泽用很淡的渐变表现，不用亮片和大块高光', colors: [
        ['珍珠粉', 'pink'], ['贝壳粉', 'pink'], ['贝母蓝', 'blue'], ['珠光紫', 'purple'], ['月光青', 'cyan'], ['珠光杏', 'orange'],
        ['珍珠灰', 'neutral']] },
    { id: 'spring', name: '春日花色', desc: '花季的浅色，明亮但不艳', colors: [
        ['樱花粉', 'pink'], ['海棠浅红', 'red'], ['丁香紫', 'purple'], ['嫩芽绿', 'green'], ['新柳青', 'cyan'], ['浅杏', 'orange'],
        ['迎春浅黄', 'yellow'], ['勿忘我蓝', 'blue']] },
    { id: 'frost', name: '冰雪雾凇', desc: '清冷干净的冰雪色，像霜、冰面和雾凇', colors: [
        ['冰蓝', 'blue'], ['霜白蓝', 'blue'], ['雾凇青', 'cyan'], ['浅银灰', 'neutral'], ['冰紫', 'purple'], ['寒梅浅粉', 'pink'],
        ['冰薄荷', 'green']] },
]);
const SOFT_TONE_RECENT_KEY = 'rabbitMirrorSoftToneExamplesRecent';
const SOFT_TONE_STYLE_RECENT_KEY = 'rabbitMirrorSoftToneStyleRecent';
const SOFT_TONE_EXAMPLE_COUNT = 4;

function softRandomIndex(limit) {
    try {
        const buffer = new Uint32Array(1);
        globalThis.crypto.getRandomValues(buffer);
        return buffer[0] % limit;
    } catch {
        return Math.floor(Math.random() * limit);
    }
}

function softShuffled(list) {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const other = softRandomIndex(index + 1);
        [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
}

function readRecentList(key) {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(key) || '[]');
        return Array.isArray(value) ? value : [];
    } catch { return []; }
}

export function drawSoftToneExamples({ avoidFamilies = [] } = {}) {
    const recentStyles = readRecentList(SOFT_TONE_STYLE_RECENT_KEY);
    const freshStyles = SOFT_TONE_STYLES.filter(style => !recentStyles.includes(style.id));
    const style = softShuffled(freshStyles.length ? freshStyles : SOFT_TONE_STYLES)[0];
    const recent = readRecentList(SOFT_TONE_RECENT_KEY);
    // 每个色族先挑一个颜色，再取四个不同色族；近期用过的色族排到最后，不够时才用。
    const byFamily = new Map();
    for (const [name, family] of softShuffled(style.colors)) {
        const current = byFamily.get(family);
        if (!current || (recent.includes(current) && !recent.includes(name))) byFamily.set(family, name);
    }
    const families = softShuffled([...byFamily.keys()]);
    const ordered = [...families.filter(key => !avoidFamilies.includes(key)), ...families.filter(key => avoidFamilies.includes(key))];
    const picks = ordered.slice(0, SOFT_TONE_EXAMPLE_COUNT).map(key => byFamily.get(key));
    try {
        globalThis.localStorage?.setItem(SOFT_TONE_RECENT_KEY, JSON.stringify([...recent.filter(color => !picks.includes(color)), ...picks].slice(-24)));
        globalThis.localStorage?.setItem(SOFT_TONE_STYLE_RECENT_KEY, JSON.stringify([...recentStyles.filter(id => id !== style.id), style.id].slice(-2)));
    } catch { /* best effort */ }
    return { style: style.name, desc: style.desc, examples: picks };
}

// 柔和浅色模式：与深色模式对称，只在选了这一档时发送。
export function softLightVisualGenerationRule(settings, { avoidFamilies = [] } = {}) {
    if (settings?.visualToneMode !== 'soft' || settings?.darkVisualMode === true) return '';
    const { style, desc, examples } = drawSoftToneExamples({ avoidFamilies });
    return `柔和浅色模式【本次所有新生成镜面，包括长文本】：
  - 本轮风格：${style}——${desc}。例如${examples.join('、')}，只是举例，按本面题材在这种风格里自己定色。
  - 背景与主要承载面用柔和的浅色；米黄、米白、奶油色、羊皮纸黄这类暖黄纸色不作主背景和主承载，信纸、日记、旧书这类纸张也换成其他柔和的颜色表现纸感；不用纯白，也不用高饱和的大面积色块或深色铺底；主体部件可用中等明度的颜色。
  - 主次靠明暗与冷暖拉开，不靠鲜艳；正文用同色相的深灰或深褐，对比清楚；可操作的部件用一处稍深或稍暖的同调强调色，一眼看出能点。
  - 仍须强避重：在柔和浅色范围内换色族与冷暖，不改艳也不改暗；形式自带的标志色保留，调柔后使用。长文本只做阅读配色，不添加交互或动画。`;
}

export function visualDiversityExecutionLock(_settings, { textRevealRotation = false, flipRotation = false, slideRotation = false, noButtonRow = false, paleBan = false, softTone = false, paletteReminder = '' } = {}) {
    // The shared ledger is sent once; only active, concrete reminders are repeated here, closest to output.
    return [
        noButtonRow ? '本面媒介本身没有成排按钮：主交互不用一排同款按钮或标签切换内容，交互落在媒介自己的部件上。' : '',
        flipRotation ? '近三面的交互多是翻面、展开或切页：本面主交互换成会直接改变画面的操作（按住、刮开、累积点亮、重排、描画、拖动、滑杆等，可用提供的插件写法），翻面和展开最多作辅助。' : '',
        slideRotation ? '近三面的主交互多是滑杆或拖动：本面主交互不用滑杆、进度条和拖动，换成点按、按住、刮开、累积点亮、重排、描画或整体切换状态等，滑杆和拖动最多作辅助。' : '',
        textRevealRotation ? '本轮换口味：整面交互作用在同一个主体上（可以分几步），不让每个条目各配一个开关。' : '',
        softTone ? '柔和浅色：主背景与主承载不用米黄、米白、奶油色、羊皮纸这类暖黄纸色，纸张类媒介也换成其他柔和的颜色。' : '',
        paleBan && softTone ? '本轮浅底换一种明显带色相的浅（近三轮已两次接近纯白），不用接近纯白的底，仍保持柔和浅色。' : '',
        paleBan && !softTone ? '本轮主背景与主承载不用米白、米黄或其他近白浅底（近三轮已出现两次），媒介本身是白纸白底时用纸张以外的部分拉开颜色。' : '',
        paletteReminder,
    ].filter(Boolean).join('\n');
}
