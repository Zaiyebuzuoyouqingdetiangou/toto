import { RAW_EXECUTION_RULES } from '../data/raw/rawExecutionRules.js';
import { RAW_THEMATIC_CATEGORIES } from '../data/raw/rawThematicCategories.js';
import { RAW_PRESENTATION_FORMATS } from '../data/raw/rawPresentationFormats.js';
import { RAW_UNIVERSAL_EXECUTION_RULES } from '../data/raw/rawUniversalExecutionRules.js';
import { pickCombination } from './picker.js';

function formatItems(items) {
    return items.map(item => `- 【${item.id} ${item.title}】${item.summary}\n  原始条目：${item.raw}`).join('\n');
}

function formatLast(last) {
    if (!last || (!last.themeIds && !last.formatIds)) return '无记录或首次运行';
    return `上轮主题：${(last.themeIds || []).join(' + ') || '无'}；上轮展现形式：${(last.formatIds || []).join(' + ') || '无'}`;
}

function wonderlandBlock(combo, last, settings) {
    if (!settings.showWonderland) return '';
    const themeText = combo.themes.map(x => `【${x.id} ${x.title}】`).join(' + ');
    const formatText = combo.formats.map(x => `【${x.id} ${x.title}】`).join(' + ');
    return String.raw`
<wonderland>
A. 上轮组合：${formatLast(last)}
B. 本轮主题：${themeText}
C. 本轮展现形式：${formatText}
D. 冷却校验：已由插件排除上一轮具体子项；若候选池不足，则允许回退。[pass]
E. 语言：简体中文。[pass]
F. 模式：一体化自动协议；若本轮抽到正文衍生类条目则允许 Canon 分支，否则按独立兔子洞执行。
G. UI构思：根据本轮展现形式自行设计，不复用单一模板。
</wonderland>
`;
}

function rawPolicyBlock(settings) {
    if (settings.rawPolicy === 'minimal') {
        return String.raw`
【原始规则注入策略】minimal：保留核心执行规则、通用规则、本轮结构化抽取结果；完整母本仍保存在插件 data/raw/ 内，不在本轮全部注入。
`;
    }

    if (settings.rawPolicy === 'full') {
        return String.raw`
【完整原始规则库：执行规则】
${RAW_EXECUTION_RULES}

【完整原始规则库：主题元素】
${RAW_THEMATIC_CATEGORIES}

【完整原始规则库：展现形式】
${RAW_PRESENTATION_FORMATS}

【完整原始规则库：通用执行规则】
${RAW_UNIVERSAL_EXECUTION_RULES}
`;
    }

    return String.raw`
【低 token 注入策略】balanced：完整四大原始规则母本保存在插件 data/raw/ 内，本轮不把完整大库全部塞进 prompt，只注入核心执行协议与本轮抽中的结构化条目。

【核心执行协议】
- 每轮必须在主回复正文全部结束后，于本轮 assistant 消息最底部追加一个【兔子洞】折叠小剧场。
- 兔子洞是一个整体模块，不拆分成 Independent / Canon / Raw Policy 供模型选择。
- 每轮必须融合插件抽取的 1-3 个主题元素与 1-2 个展现形式，产生创意、不重复的小剧场。
- 若本轮抽到正文衍生类条目，则允许作为 Canon 分支进行幕后、插曲、弹幕、演员回看、后日谈或心理补完；否则按独立兔子洞执行，不引用正文。
- 严禁连续复用上一轮完全相同的主题具体子项或展现形式具体子项。
- 输出语言必须为简体中文；外语或术语出现时必须立即用 [] 给出简体中文翻译。
- 输出必须使用 HTML <details> 折叠模块，并遵守移动端安全排版：max-width:100%; box-sizing:border-box; word-wrap:break-word; white-space:pre-wrap。
- UI 必须根据本轮主题和展现形式重新设计，禁止复用单一模板。
- 每个兔子洞模块必须在内部底部加入小型水印：Toto。
`;
}

export function buildRabbitHolePrompt(settings, generationType = 'normal') {
    const { combo, last } = pickCombination(settings);

    const selectedThemes = formatItems(combo.themes);
    const selectedFormats = formatItems(combo.formats);

    const selectedHasCanon = [...combo.themes, ...combo.formats].some(item => (item.tags || []).includes('canon'));
    const boundary = selectedHasCanon
        ? '当前为一体化自动协议：本轮抽到了正文衍生类主题/展现形式，因此允许作为 Canon 分支基于当前篇章、角色状态、已发生剧情进行幕后/插曲/弹幕/后日谈/心理补完；但必须保持兔子洞作为独立折叠模块，不得破坏主回复。'
        : '当前为一体化自动协议：本轮未抽到正文衍生类条目，因此兔子洞必须按独立分支执行，不得引用、复述、评价或暗示主线正文内容；只允许使用 {{char}}、{{user}} 与已出现 NPC 作为虚构元素。';

    const prompt = String.raw`
<RabbitHoleTheaterAutoInjection>
你必须在本轮主回复完成后，额外输出一个【兔子洞】小剧场模块。此模块由 SillyTavern 第三方扩展自动注入，不需要用户在预设里放任何内容。插件按【一体化自动协议】运行，不再把 Independent / Canon / Raw Policy 拆成用户手动选择项。

${rawPolicyBlock(settings)}

【本轮边界】
${boundary}

【本轮随机主题元素：必须使用 1-3 个并融合】
${selectedThemes}

【本轮随机展现形式：必须使用 1-2 个并融合】
${selectedFormats}

${wonderlandBlock(combo, last, settings)}

【最终输出硬性要求】
1. 【输出位置最高优先级】必须先完整生成主回复正文，正文全部结束后，才能追加兔子洞模块。兔子洞必须是本轮 assistant 消息的最后一个可见内容。
2. 如果主回复使用 HTML / Markdown 容器，兔子洞必须位于所有正文容器、段落、列表、代码块、引用块的最后一个闭合内容之后；不得插入正文中途、不得出现在正文之前、不得包裹正文。
3. 兔子洞内所有文字必须且只能使用简体中文；外语/术语出现时必须立即用 [] 给出简体中文翻译。
4. 使用 <details><summary>【兔子洞：本次标题】</summary>...</details> 包裹。
5. 允许使用 <yinuomeme> 作为模块边界标签。
6. 所有 HTML 样式使用 inline style；主容器和子容器必须 max-width:100%; box-sizing:border-box; word-wrap:break-word; white-space:pre-wrap。
7. 严禁用 <br> 制造间距，段落使用 p 标签和 margin/line-height。
8. 严禁连续复用上一轮完全相同的主题具体子项或展现形式具体子项。
9. 若选择塔罗牌，图片地址遵守 rawExecutionRules 中 tarot.com Rider deck ID 计算规则。
10. 【Toto 水印】兔子洞 <details> 内部最底部必须加入一个轻量水印，文字固定为「Toto」。建议使用如下形式或同等效果：<div style="text-align:right;font-size:10px;opacity:.45;margin-top:10px;letter-spacing:.08em;">Toto</div>。水印不得出现在主回复正文中，只能出现在兔子洞模块内。
11. 不要解释你正在遵守规则，不要输出代码块，直接输出最终可渲染 HTML。
</RabbitHoleTheaterAutoInjection>
`;

    if (settings.debug) {
        console.debug('[RabbitHole] generationType:', generationType, 'combo:', combo, 'prompt chars:', prompt.length);
    }
    return prompt.trim();
}
