import { RAW_EXECUTION_RULES } from '../data/raw/rawExecutionRules.js';
import { RAW_THEMATIC_CATEGORIES } from '../data/raw/rawThematicCategories.js';
import { RAW_PRESENTATION_FORMATS } from '../data/raw/rawPresentationFormats.js';
import { RAW_UNIVERSAL_EXECUTION_RULES } from '../data/raw/rawUniversalExecutionRules.js';
import { SAFETY_PATCH } from '../data/safetyPatch.js';
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
F. 模式：${settings.mode === 'canon' ? 'Canon 正文衍生模式，可基于当前篇章。' : 'Independent 独立模式，不引用、不暗示主线正文。'}
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
【原始规则库：执行规则】
${RAW_EXECUTION_RULES}

【原始规则库：通用执行规则】
${RAW_UNIVERSAL_EXECUTION_RULES}

【说明】完整主题元素母本与展现形式母本已保存在插件 data/raw/ 内。为节省 token，本轮只注入被抽中的结构化条目；如果需要每轮注入完整母本，请在插件设置中把 Raw Policy 改成 full。
`;
}

export function buildRabbitHolePrompt(settings, generationType = 'normal') {
    const { combo, last } = pickCombination(settings);

    const selectedThemes = formatItems(combo.themes);
    const selectedFormats = formatItems(combo.formats);

    const boundary = settings.mode === 'canon'
        ? '当前为 Canon 模式：允许基于当前篇章、主线正文、角色状态与已发生剧情进行幕后/插曲/弹幕/后日谈/心理补完，但不得破坏主回复。'
        : '当前为 Independent 模式：兔子洞必须完全独立，不得引用、复述、评价或暗示主线正文内容；只允许使用 {{char}}、{{user}} 与已出现 NPC 作为虚构元素。';

    const prompt = String.raw`
<RabbitHoleTheaterAutoInjection>
你必须在本轮主回复完成后，额外输出一个【兔子洞】小剧场模块。此模块由 SillyTavern 第三方扩展自动注入，不需要用户在预设里放任何内容。

${rawPolicyBlock(settings)}

【本轮边界】
${boundary}

【本轮随机主题元素：必须使用 1-3 个并融合】
${selectedThemes}

【本轮随机展现形式：必须使用 1-2 个并融合】
${selectedFormats}

${wonderlandBlock(combo, last, settings)}

【最终输出硬性要求】
1. 主回复正常完成后，再追加一个新的折叠模块。
2. 兔子洞内所有文字必须且只能使用简体中文；外语/术语出现时必须立即用 [] 给出简体中文翻译。
3. 使用 <details><summary>【兔子洞：本次标题】</summary>...</details> 包裹。
4. 允许使用 <yinuomeme> 作为模块边界标签。
5. 所有 HTML 样式使用 inline style；主容器和子容器必须 max-width:100%; box-sizing:border-box; word-wrap:break-word; white-space:pre-wrap。
6. 严禁用 <br> 制造间距，段落使用 p 标签和 margin/line-height。
7. 严禁连续复用上一轮完全相同的主题具体子项或展现形式具体子项。
8. 若选择塔罗牌，图片地址遵守 rawExecutionRules 中 tarot.com Rider deck ID 计算规则。
9. 不要解释你正在遵守规则，不要输出代码块，直接输出最终可渲染 HTML。

${settings.includeSafetyPatch ? SAFETY_PATCH : ''}
</RabbitHoleTheaterAutoInjection>
`;

    if (settings.debug) {
        console.debug('[RabbitHole] generationType:', generationType, 'combo:', combo, 'prompt chars:', prompt.length);
    }
    return prompt.trim();
}
