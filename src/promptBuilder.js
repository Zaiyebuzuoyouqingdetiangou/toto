import { RAW_EXECUTION_RULES } from '../data/raw/rawExecutionRules.js';
import { resolveThemeRaw, resolvePresentationRaw } from '../data/raw/rawSegmentLookup.js';
import { pickCombination } from './picker.js';

const UNIVERSAL_EXECUTION_CORE = String.raw`
【通用执行规则核心版】
1. 本轮必须进行多维组合与跨界融合：至少融合 1 个【主题元素】与 1 个【展现形式】，鼓励 1-3 个主题 + 1-2 个展现形式产生复合效果。
2. 插件已完成本轮主题/展现形式抽取与冷却排除；必须使用【本轮指定组合】，不得自行替换成上一轮组合或固定模板。
3. 兔子洞不是普通文本补充，而是主回复最底部的高完成度 HTML 视觉小剧场；不得输出简单资料卡、普通日志、普通列表或无设计感黑框白字。
4. UI 必须依据本轮展现形式定制：必须有明确视觉主题、色彩系统、层级排版、边框/阴影/渐变/装饰元素/拟物组件等视觉设计。
5. 输出前必须自查 HTML 标签闭合、inline style、移动端适配、文本不溢出、段落间距、max-width 与 box-sizing。
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

function thinkingBlock(combo, last, settings) {
    if (!settings.showCot) return '';
    const themeText = combo.themes.map(x => `【${x.id} ${x.title}】`).join(' + ');
    const formatText = combo.formats.map(x => `【${x.id} ${x.title}】`).join(' + ');
    return String.raw`
<thinking>
A. 上轮组合：${formatLast(last)}
B. 本轮主题：${themeText}
C. 本轮展现形式：${formatText}
D. 冷却校验：插件已排除上一轮具体子项；若候选池不足，则允许回退。[pass]
E. 语言：简体中文。[pass]
F. 模式：一体化自动协议；抽到正文衍生类条目则自动使用正文衍生分支，否则自动使用独立分支。
G. UI构思：根据本轮展现形式定制高完成度视觉组件，不复用单一模板。
</thinking>
`;
}

export function buildRabbitHolePrompt(settings, generationType = 'normal') {
    const { combo, last } = pickCombination(settings);

    const selectedThemes = formatItems(combo.themes, 'theme');
    const selectedFormats = formatItems(combo.formats, 'presentation');

    const selectedHasCanon = [...combo.themes, ...combo.formats].some(item => (item.tags || []).includes('canon'));
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

【本轮边界】
${boundary}

【本轮随机主题元素：必须融合；以下为按 ID 从母本检索的对应完整描述】
${selectedThemes}

【本轮随机展现形式：必须融合；以下为按 ID 从母本检索的对应完整描述】
${selectedFormats}

${thinkingBlock(combo, last, settings)}

【最终输出硬性要求】
1. 【输出位置最高优先级】必须先完整生成主回复正文，正文全部结束后，才能追加兔子洞模块。兔子洞必须是本轮 assistant 消息的最后一个可见内容。
2. 如果主回复使用 HTML / Markdown 容器，兔子洞必须位于所有正文容器、段落、列表、代码块、引用块的最后一个闭合内容之后；不得插入正文中途、不得出现在正文之前、不得包裹正文。
3. 兔子洞内所有文字必须且只能使用简体中文；外语/术语出现时必须立即用 [] 给出简体中文翻译。
4. 使用 <details><summary>【兔子洞：本次标题】</summary>...</details> 包裹。
5. 兔子洞模块直接以 <details> 开始，并以 </details> 结束。
6. 所有 HTML 样式使用 inline style；主容器和子容器必须 max-width:100%; box-sizing:border-box; word-wrap:break-word; white-space:pre-wrap。
7. UI 必须做成高完成度视觉组件，至少使用三种视觉手段：多层 box-shadow、linear-gradient、Grid/Flex 分区、主题色标题、标签/状态栏/进度条/票据/卡片/时间轴等拟物 UI、半透明背景或装饰性边框。
8. 严禁只输出普通报告、普通列表、普通资料卡或单调黑框文本。
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
