import { RAW_EXECUTION_RULES } from '../data/raw/rawExecutionRules.js';
import { resolveThemeRaw, resolvePresentationRaw } from '../data/raw/rawSegmentLookup.js';
import { pickCombination } from './picker.js';


const UI_AUDIT_PROTOCOL = String.raw`
【UI 自查优化协议】
1. 生成前必须回看并执行《格式与美感规范》，并根据本轮【展现形式】选择对应的版式语言：聊天类像聊天界面，票据类像票据，神秘学类像牌阵/命盘，游戏类像游戏 UI，媒体类像节目/报刊/播放器，文学类保留文本美学与排版节奏。
2. 必须使用清晰的视觉分区或文本层级；可根据本轮形式选择 Flexbox/Grid、卡片、时间轴、票据栏、弹幕层、歌词分段、信纸排版、档案栏、舞台剧本格式等。
3. 必须具备本轮专属的视觉锚点；例如标题牌、状态栏、印章、进度条、牌面、缩略图、弹幕层、票根、便签、相册格、坐标轴、菜单栏、播放器、章节条等。
4. 必须有符合氛围的色彩、边框、阴影、渐变、字体层级或留白；不要求每次都重视觉，但必须避免连续套用同一套版式。
5. 必须采用自适配容器：主容器与关键子容器应使用 box-sizing:border-box; max-width:100%; width:100%; 或 width:min(100%,500px); 等自适配写法。多栏、卡片、时间轴、图形、弹幕、票据、图片、表格等内容应避免横向溢出，并根据手机/电脑宽度自动收缩、换行或允许内部滚动。
6. 必须进行文本溢出检查：长文本段落应使用 overflow-wrap:anywhere; word-break:break-word; line-height:1.6; 等安全写法。仅在需要保留换行的叙事段落、信件、诗歌、日志、转录文本中使用 white-space:pre-wrap；短标签、按钮、标题、状态栏不强制使用 pre-wrap。
`;

const VISUAL_SCENERY_PROTOCOL = String.raw`
【Visual Scenery 专用执行协议】
本轮展现形式锁定为：

【10.2 可视化小剧场】
打破纯文本叙事，重度依赖 CSS 构建纯视觉面板。
用图形、色块和排版作为主要叙事载体。

【10.2.2 Visual Scenery】
纯粹利用 CSS 色块、渐变和动画，在屏幕上绘制出一幅极具氛围感的风景。
用纯粹的视觉传递情绪。

本轮生成时必须同时遵循 10.2 父级规则与 10.2.2 子项规则。
可在 details 内使用紧凑 <style> 标签与唯一 class 名实现动态效果；容器需保持自适配，避免横向溢出。
`;

const UNIVERSAL_EXECUTION_CORE = String.raw`
【通用执行规则核心版】
1. 本轮必须进行多维组合与跨界融合：至少融合 1 个【主题元素】与 1 个【展现形式】，鼓励 1-3 个主题 + 1-2 个展现形式产生复合效果。
2. 插件已完成本轮主题/展现形式抽取与冷却排除；必须使用【本轮指定组合】，不得自行替换成上一轮组合或固定模板。
3. 兔子洞不是普通文本补充，而是主回复最底部的高完成度 HTML 小剧场；必须根据本轮展现形式选择对应版式与视觉层级。
4. UI 必须依据本轮展现形式定制：必须有明确视觉主题、色彩系统、层级排版、边框/阴影/渐变/装饰元素或文本节奏等设计。
5. 输出前必须自查 HTML 标签闭合、inline style、自适配容器、文本不溢出、段落间距、max-width 与 box-sizing。
6. 如启用 <thinking>，只输出简短可见执行摘要，不输出隐藏思维链或详细推理过程。
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
D. 冷却校验：插件已排除上一轮具体子项；若候选池不足，则允许回退。[pass]
E. 语言：简体中文。[pass]
F. 模式：一体化自动协议；抽到正文衍生类条目则自动使用正文衍生分支，否则自动使用独立分支。
G. UI构思：根据本轮展现形式定制高完成度版式，不复用单一模板；若启用 Visual Scenery，则以纯视觉氛围场景为核心。
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
    const visualModeLine = settings.forceVisualScenery ? '本轮已启用设置项【Visual Scenery 动态渐变模式】，必须把 Visual Scenery 作为核心展现形式。' : '未启用强制 Visual Scenery；如本轮抽到 Visual Scenery，也必须执行其专用协议。';
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

【固定注入：UI 自查与去模板化】
${uiAuditText}

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
1. 【输出位置最高优先级】必须先完整生成主回复正文，正文全部结束后，才能追加兔子洞模块。兔子洞必须是本轮 assistant 消息的最后一个可见内容。
2. 如果主回复使用 HTML / Markdown 容器，兔子洞必须位于所有正文容器、段落、列表、代码块、引用块的最后一个闭合内容之后；不得插入正文中途、不得出现在正文之前、不得包裹正文。
3. 兔子洞内所有文字必须且只能使用简体中文；外语/术语出现时必须立即用 [] 给出简体中文翻译。
4. 使用 <details><summary>【兔子洞：本次标题】</summary>...</details> 包裹。
5. 兔子洞模块直接以 <details> 开始，并以 </details> 结束。
6. 所有 HTML 样式使用 inline style；主容器与关键子容器必须采用自适配容器写法，例如 box-sizing:border-box; max-width:100%; width:100%; 或 width:min(100%,500px)。长文本段落需做安全换行；仅在需要保留换行的文本中使用 white-space:pre-wrap。
7. 必须执行 UI 自查优化：根据本轮展现形式选择对应版式，建立清晰视觉分区或文本层级，并具备本轮专属视觉锚点；避免连续复用同一套外观。
8. 最终小剧场必须体现本轮主题与展现形式的专属设计，不要只输出无版式设计的纯文字堆叠。
9. 严禁用 <br> 制造间距，段落使用 p 标签和 margin/line-height。
10. 严禁连续复用上一轮完全相同的主题具体子项或展现形式具体子项。
11. 若选择塔罗牌，图片地址遵守 rawExecutionRules 中 tarot.com Rider deck ID 计算规则。
12. 【Toto 水印】Toto 仅作为插件设置界面的界面水印存在；不得在主回复正文或兔子洞 <details> 小剧场内部生成 Toto 水印。
13. 如启用 <thinking>，其中只输出可见的执行摘要，不输出隐藏思维链或详细推理过程。
14. 不要解释你正在遵守规则，不要输出代码块，直接输出最终可渲染 HTML。
</RabbitHoleTheaterAutoInjection>
`;

    if (settings.debug) {
        console.debug('[RabbitHole] generationType:', generationType, 'combo:', combo, 'prompt chars:', prompt.length);
    }
    return prompt.trim();
}
