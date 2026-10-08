import { classifyPaletteSamples } from './paletteObservation.js?rmv=1.67.33';

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

// 柔和浅色的举例色：莫兰迪灰调色与干净的浅色两类，每个色族各有一串。每次只随机拿几个不同色族的放进说明，
// 两类都会出现，避开近三轮用过的色族和上一次给过的颜色，免得模型总挑写在前面的那几个。米黄类不放进来。
const SOFT_TONE_POOL = Object.freeze({
    red: { muted: ['豆沙红', '灰玫红', '干枯玫瑰', '砖灰红', '旧胭脂'], light: ['浅玫瑰', '淡珊瑚红'] },
    orange: { muted: ['杏灰', '陶土橘', '赭石灰', '焦糖灰', '柿子灰'], light: ['浅杏', '蜜桃橘', '浅珊瑚'] },
    yellow: { muted: ['芥末灰黄', '姜黄灰', '旧铜黄灰', '苔黄灰'], light: ['淡柠黄', '柠檬浅黄'] },
    green: { muted: ['灰豆绿', '鼠尾草绿', '橄榄灰', '苔藓灰绿', '抹茶灰'], light: ['薄荷绿', '浅豆绿', '嫩芽绿'] },
    cyan: { muted: ['雾青', '灰青', '石青灰', '湖水灰绿', '青瓷灰'], light: ['冰川青', '浅水青', '浅湖蓝'] },
    blue: { muted: ['雾蓝', '雾霾蓝', '灰牛仔蓝', '烟灰蓝', '远山蓝'], light: ['浅天蓝', '婴儿蓝', '浅矢车菊蓝'] },
    purple: { muted: ['雾紫', '藕荷紫', '灰丁香', '烟紫', '薰衣草灰'], light: ['淡紫', '浅香芋紫', '浅丁香紫'] },
    pink: { muted: ['灰粉', '藕粉', '脏粉', '胭脂灰粉', '樱花灰'], light: ['浅粉', '樱花粉', '蜜桃粉', '芭蕾粉'] },
    neutral: { muted: ['鸽灰', '雾灰', '水泥灰', '银灰', '烟灰'], light: [] },
});
const SOFT_TONE_RECENT_KEY = 'rabbitMirrorSoftToneExamplesRecent';
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

export function drawSoftToneExamples({ avoidFamilies = [] } = {}) {
    let recent = [];
    try { recent = JSON.parse(globalThis.localStorage?.getItem(SOFT_TONE_RECENT_KEY) || '[]'); } catch { recent = []; }
    if (!Array.isArray(recent)) recent = [];
    const allFamilies = Object.keys(SOFT_TONE_POOL);
    const open = allFamilies.filter(key => !avoidFamilies.includes(key));
    const families = softShuffled(open.length >= SOFT_TONE_EXAMPLE_COUNT ? open : allFamilies).slice(0, SOFT_TONE_EXAMPLE_COUNT);
    // 先给每个色族定是灰调还是浅色，保证四个里两类都有。
    const kinds = families.map((key, index) => SOFT_TONE_POOL[key].light.length ? (index % 2 ? 'muted' : 'light') : 'muted');
    const shuffledKinds = softShuffled(kinds);
    const picks = families.map((key, index) => {
        const kind = SOFT_TONE_POOL[key][shuffledKinds[index]].length ? shuffledKinds[index] : 'muted';
        const colors = SOFT_TONE_POOL[key][kind];
        const fresh = colors.filter(color => !recent.includes(color));
        return softShuffled(fresh.length ? fresh : colors)[0];
    });
    try { globalThis.localStorage?.setItem(SOFT_TONE_RECENT_KEY, JSON.stringify([...recent.filter(color => !picks.includes(color)), ...picks].slice(-24))); } catch { /* best effort */ }
    return picks;
}

// 柔和浅色模式：与深色模式对称，只在选了这一档时发送。
export function softLightVisualGenerationRule(settings, { avoidFamilies = [] } = {}) {
    if (settings?.visualToneMode !== 'soft' || settings?.darkVisualMode === true) return '';
    const examples = drawSoftToneExamples({ avoidFamilies });
    return `柔和浅色模式【本次所有新生成镜面，包括长文本】：
  - 背景与主要承载面用柔和的浅色：莫兰迪那种带一点灰的低饱和色，或干净的浅色（浅粉、浅蓝这一类），任何色相都可以，例如${examples.join('、')}，只是举例，按本面题材自己定色；米黄、米白、奶油色、羊皮纸黄这类暖黄纸色不算柔和浅色，不作主背景和主承载，信纸、日记、旧书这类纸张也换成其他柔和的颜色表现纸感；不用纯白，也不用高饱和的大面积色块或深色铺底；主体部件可用中等明度的灰调色。
  - 主次靠明暗与冷暖拉开，不靠鲜艳；正文用同色相的深灰或深褐，对比清楚；可操作的部件用一处稍深或稍暖的同调强调色，一眼看出能点。
  - 仍须强避重：在柔和浅色范围内换色族与冷暖，不改艳也不改暗；形式自带的标志色保留，调灰后使用。长文本只做阅读配色，不添加交互或动画。`;
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
