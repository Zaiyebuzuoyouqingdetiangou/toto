import { RAW_EXECUTION_RULES } from '../data/raw/rawExecutionRules.js';
import { resolveThemeRaw, resolvePresentationRaw } from '../data/raw/rawSegmentLookup.js';
import { pickCombination } from './picker.js';

const HARD_CHINESE_LANGUAGE_PROTOCOL = String.raw`
【简体中文语言锁定增强】
1. 兔子洞内所有可见文字必须使用简体中文，包括标题、状态栏、按钮、标签、表头、时间地点栏、系统提示、观察记录、注释、弹幕、UI 小字。
2. 不得输出全英文界面或大段英文段落；不要使用 OBSERVATION LOG / STATUS / SYSTEM / LOCATION / TIME 等全英文 UI 标签，需改为“观察记录 / 状态 / 系统 / 地点 / 时间”等中文。
3. 外语、专有名词、平台名、术语如必须出现，需立即用 [] 给出简体中文翻译，并且不得让外语成为主要可见文本。
`;

const HARD_STARTUP_PROTOCOL = String.raw`
【强制启动增强协议】
1. 小剧场不是可选附加内容，而是本轮回复格式的固定组成部分。
2. 主回复正文完成后必须继续生成小剧场，不能在正文结束处直接停止。
3. 生成优先级为：先保证小剧场出现，再追求正文展开长度。
`;

const UI_AUDIT_PROTOCOL = String.raw`
【UI 自查优化协议】
1. 生成前必须回看并执行《格式与美感规范》与《UI 核心驱动协议》。
2. 本轮小剧场必须像一个独立完成的微型 HTML 作品，而不是正文附录或普通说明卡。
3. 必须根据本轮【展现形式】重新决定内部 HTML 结构、版式、色彩、层级、视觉锚点与阅读节奏；不得把输出结构说明当成固定模板。
4. 必须具备清晰的视觉分区或文本层级，并形成本轮专属的视觉焦点。
5. 不得只通过更换标题、颜色、图标、边框或装饰来伪装新 UI；如果版式结构、信息排列方式、视觉重心、文本密度或阅读节奏与近期结果相近，必须在输出前重构。
6. 必须采用自适配容器：主容器与关键子容器应使用 box-sizing:border-box; max-width:100%; width:100%; 或 width:min(100%,500px); 等自适配写法。多栏、时间轴、图形、弹幕、票据、图片、表格等内容应避免横向溢出，并根据手机/电脑宽度自动收缩、换行或允许内部滚动。
7. 必须进行文本溢出检查：长文本段落应使用 overflow-wrap:anywhere; word-break:break-word; line-height:1.6; 等安全写法。仅在需要保留换行的叙事段落、信件、诗歌、日志、转录文本中使用 white-space:pre-wrap；短标签、按钮、标题、状态栏不强制使用 pre-wrap。
`;

const VISUAL_SCENERY_PROTOCOL = String.raw`
【Visual Scenery 专用执行协议｜强制视觉画布版】
本轮展现形式锁定为：

【10.2 可视化小剧场】
打破纯文本叙事，重度依赖 CSS 构建纯视觉面板。
用图形、色块和排版作为主要叙事载体。

【10.2.2 Visual Scenery】
纯粹利用 CSS 色块、渐变和动画，在屏幕上绘制出一幅极具氛围感的风景。
用纯粹的视觉传递情绪。

本轮生成时必须同时遵循 10.2 父级规则与 10.2.2 子项规则。

【视觉画布硬性结构】
1. <details> 内部的第一个主要内容块必须是“视觉画布”，不是文字说明块。
2. 视觉画布必须成为主体：以 CSS 构成的背景、形状、光源、遮罩、线条、粒子、前后景层次、动画或渐变承担主要表达。
3. 允许使用紧凑 <style> 标签与唯一 class 名实现 keyframes 动态效果；若使用 <style>，class 名需带有 rh-vs- 前缀，避免污染其他内容。
4. 画布容器需自适配：box-sizing:border-box; width:min(100%,500px); max-width:100%; margin:auto; overflow:hidden; position:relative;。
5. 画布至少包含 5 个以上不同层次的视觉元素，并形成前景/中景/远景或光影/遮罩/景深的空间关系。
6. 文字只能作为标题、短注、坐标、题签、极短旁白或画面标注；不得让多段说明、选项块或长文本成为主体。
7. 若最终结果看起来主要是在阅读文字，而不是观看一幅由 CSS 构成的画面，则视为未执行 Visual Scenery，必须改写为视觉画布优先。
`;

const UNIVERSAL_EXECUTION_CORE = String.raw`
【通用执行规则核心版】
1. 本轮必须进行多维组合与受控随机融合：至少融合 1 个【主题元素】与 1 个【展现形式】；当插件抽到多个元素时，需自然融合而不是随机词拼贴。
2. 插件已完成本轮主题/展现形式抽取与冷却排除；必须使用【本轮指定组合】，不得自行替换成上一轮组合或固定模板。
3. 兔子洞不是普通文本补充，而是主回复最底部的高完成度 HTML 小剧场；必须根据本轮展现形式重新设计版式与视觉层级。
4. UI 必须依据本轮展现形式定制：必须有明确视觉主题、色彩系统、层级排版、边框/阴影/渐变/装饰元素或文本节奏等设计。
5. 输出前必须自查 HTML 标签闭合、inline style、自适配容器、文本不溢出、段落间距、max-width 与 box-sizing。
6. 如启用 <thinking>，只输出简短可见执行摘要，不输出隐藏思维链或详细推理过程。
`;



const CONTROLLED_RANDOM_PROTOCOL = String.raw`
【受控随机协议】
随机性用于提高新鲜感，而不是制造混乱。系统允许主题元素与展现形式进行跨界融合，但最终结果必须保持整体设计感、可读性与内部逻辑，不得变成随机词拼贴。
1. 当本轮抽到多个主题或多个展现形式时，不要求平均分配篇幅，应自然判断表达重心。
2. 融合方式不得固定化，不得每次都采用相同的主次结构、附加结构或装饰方式。
3. 若组合过于冲突，应自动收束为更自然的表达方式，保留最有表现力的元素，弱化其他元素。
4. 禁止为了随机而随机；最终结果必须像一个完整设计过的小剧场，而不是多个关键词拼接。
`;

const FINAL_GUARD_PROTOCOL = String.raw`
【结尾保底规则】
1. 本轮回复的最后一个可见模块必须是完整的 <details> 小剧场。
2. 正文完成后，必须在消息最底部追加该模块。
`;

function formatItems(items, kind) {
    return items.map(item => {
        const fullRaw = kind === 'theme' ? resolveThemeRaw(item) : resolvePresentationRaw(item);
        return `- 【${item.id} ${item.title}】\n${fullRaw}`;
    }).join('\n\n');
}

function formatLast(last) {
    if (!last || (!last.themeIds && !last.formatIds)) return '无记录或首次运行';
    return `上轮主题：${(last.themeIds || []).join(' + ') || '无'}；上轮展现形式：${(last.formatIds || []).join(' + ') || '无'}`;
}

function formatDesignSignature(combo) {
    const design = combo?.design;
    if (!design) return '插件未生成设计签名；请自行根据本轮展现形式建立专属版式。';
    return `构图=${design.construct}；色彩策略=${design.palette}；视觉锚点=${design.anchor}`;
}

function hasVisualScenery(combo) {
    return combo?.formats?.some(item => item.id === '10.2.2' || String(item.title || '').toLowerCase().includes('visual scenery'));
}

function thinkingBlock(combo, last, settings, directive = null) {
    if (!settings.showCot) return '';
    const themeText = combo.themes.map(x => `【${x.id} ${x.title}】`).join(' + ');
    const formatText = combo.formats.map(x => `【${x.id} ${x.title}】`).join(' + ');
    const directiveLine = directive
        ? `H. 正文指令优先：已识别用户指定并优先采用；未指定的部分由插件随机补足。`
        : `H. 正文指令优先：本轮未识别到有效指定，使用插件随机组合。`;
    return String.raw`
<thinking>
A. 上轮组合：${formatLast(last)}
B. 本轮主题：${themeText}
C. 本轮展现形式：${formatText}
D. 冷却校验：插件已按最近 10 轮执行具体子项冷却，并对近期高频父类降权；若候选池不足，则允许回退。[pass]
E. 语言：简体中文。[pass]
F. 模式：一体化自动协议；抽到正文衍生类条目则自动使用正文衍生分支，否则自动使用独立分支。
G. UI构思：根据本轮展现形式定制高完成度版式，不复用单一模板；本轮设计签名：${formatDesignSignature(combo)}；若启用 Visual Scenery，则以纯视觉氛围场景为核心。
${directiveLine}
</thinking>
`;
}

export function buildRabbitHolePrompt(settings, generationType = 'normal') {
    const { combo, last, directive, disabled } = pickCombination(settings);
    if (disabled) {
        if (settings.debug) console.debug('[RabbitHole] skipped by user directive');
        return '';
    }

    const selectedThemes = formatItems(combo.themes, 'theme');
    const selectedFormats = formatItems(combo.formats, 'presentation');

    const selectedHasCanon = [...combo.themes, ...combo.formats].some(item => (item.tags || []).includes('canon'));
    const uiAuditText = settings.uiAudit ? UI_AUDIT_PROTOCOL : '';
    const visualSceneryText = (settings.forceVisualScenery || hasVisualScenery(combo)) ? VISUAL_SCENERY_PROTOCOL : '';
    const visualModeLine = settings.forceVisualScenery ? '本轮已启用设置项【Visual Scenery 动态渐变模式】，展现形式已由插件强制锁定为【10.2.2 Visual Scenery】，输出必须按视觉画布优先执行。' : '未启用强制 Visual Scenery；如本轮抽到或正文指令指定 Visual Scenery，也必须执行其专用协议。';
    const designSignature = formatDesignSignature(combo);
    const boundary = selectedHasCanon
        ? '当前为一体化自动协议：本轮抽到了正文衍生类主题/展现形式，因此自动使用正文衍生分支，可基于当前篇章、角色状态、已发生剧情进行幕后/插曲/弹幕/后日谈/心理补完；但必须保持兔子洞作为主回复之后的独立折叠模块，不得破坏或包裹主回复。'
        : '当前为一体化自动协议：本轮未抽到正文衍生类条目，因此兔子洞必须按独立分支执行，不得引用、复述、评价或暗示主线正文内容；只允许使用 {{char}}、{{user}} 与已出现 NPC 作为虚构元素。';

    const prompt = String.raw`
<RabbitHoleTheaterAutoInjection>
你必须在本轮主回复完成后，额外输出一个【兔子洞】小剧场模块。此模块由 SillyTavern 第三方扩展自动注入，不需要用户在预设里放任何内容。插件按【一体化自动协议】运行，不拆成用户手动选择项。

【固定注入：完整执行规则母本】
${RAW_EXECUTION_RULES}

【固定注入：通用执行规则核心版】
${UNIVERSAL_EXECUTION_CORE}

【固定注入：受控随机协议】
${CONTROLLED_RANDOM_PROTOCOL}

【固定注入：简体中文语言锁定增强】
${settings.hardChineseLock ? HARD_CHINESE_LANGUAGE_PROTOCOL : ''}

【固定注入：强制启动增强】
${settings.hardStartup ? HARD_STARTUP_PROTOCOL : ''}

【固定注入：最高优先级结尾保底协议】
${FINAL_GUARD_PROTOCOL}

【固定注入：UI 自查与去模板化】
${uiAuditText}

【本轮 UI 设计签名：必须参考，避免与前 10 轮重复】
${designSignature}

【Visual Scenery 专用协议】
${visualModeLine}
${visualSceneryText}

【本轮边界】
${boundary}

【本轮随机主题元素：必须融合；以下为按 ID 从母本检索的对应完整描述】
${selectedThemes}

【本轮随机展现形式：必须融合；以下为按 ID 从母本检索的对应完整描述】
${selectedFormats}

${thinkingBlock(combo, last, settings, directive)}

【正文指令优先】
${directive ? '本轮已检测到用户正文中的兔子洞指定指令。必须优先使用上方【本轮随机主题元素/展现形式】中的指定结果；不要因为随机习惯改成别的主题或格式。未被用户指定的部分已由插件随机补足。' : '本轮未检测到有效兔子洞指定指令，按插件随机抽取结果执行。'}

【最终输出硬性要求】
1. 【输出位置最高优先级】必须先完整生成主回复正文；正文全部结束后，才能追加兔子洞模块。兔子洞必须是本轮 assistant 消息的最后一个可见内容。
2. 如果主回复使用 HTML / Markdown 容器，兔子洞必须位于所有正文容器、段落、列表、代码块、引用块的最后一个闭合内容之后；不得插入正文中途、不得出现在正文之前、不得包裹正文。
3. 兔子洞内所有可见文字必须且只能使用简体中文，UI 标签/状态栏/标题/表头/按钮/系统提示也必须中文化；不得输出全英文界面。外语/术语出现时必须立即用 [] 给出简体中文翻译。
4. 小剧场必须使用 <details> 折叠模块，并在 <summary> 中显示【兔子洞：本次标题】；除外层折叠结构外，不提供固定 HTML 模板。
5. 兔子洞模块直接以 <details> 开始，并以 </details> 结束；6. 所有 HTML 样式使用 inline style；主容器与关键子容器必须采用自适配容器写法，例如 box-sizing:border-box; max-width:100%; width:100%; 或 width:min(100%,500px)。长文本段落需做安全换行；仅在需要保留换行的文本中使用 white-space:pre-wrap。
7. 必须执行 UI 自查优化与 UI 核心驱动协议：至少满足复杂度 7 项指标中的 4 项，并根据本轮展现形式建立清晰视觉分区、文本层级与专属视觉锚点；避免连续复用同一套外观。
8. 最终小剧场必须体现本轮主题与展现形式的专属设计，不要只输出无版式设计的纯文字堆叠。
9. 严禁用 <br> 制造间距，段落使用 p 标签和 margin/line-height。
10. 严禁复用最近 10 轮内已经使用过的完全相同主题具体子项、展现形式具体子项或整体 UI 构图；插件已执行 10 轮冷却，模型不得自行回到近期模板。
11. 若选择塔罗牌，图片地址遵守 rawExecutionRules 中 tarot.com Rider deck ID 计算规则。
12. 【Toto 水印】Toto 仅作为插件设置界面的界面水印存在；不得在主回复正文或兔子洞 <details> 小剧场内部生成 Toto 水印。
13. 如启用 <thinking>，其中只输出可见的执行摘要，不输出隐藏思维链或详细推理过程。
14. 不要解释你正在遵守规则，不要输出代码块，直接输出最终可渲染 HTML。
15. 【最终结尾检查】本轮回复的最后一个可见模块必须是完整的兔子洞 <details> 小剧场。该模块为本轮回复格式的固定组成部分，不得视为可选彩蛋。
</RabbitHoleTheaterAutoInjection>
`;

    if (settings.debug) {
        console.debug('[RabbitHole] generationType:', generationType, 'combo:', combo, 'prompt chars:', prompt.length);
    }
    return prompt.trim();
}
