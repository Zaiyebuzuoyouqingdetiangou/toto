import { RAW_EXECUTION_RULES } from '../data/raw/rawExecutionRules.js';
import { RUNTIME_LANGUAGE_RULES } from '../data/raw/runtimeLanguageRules.js';
import { TAROT_IMAGE_RULES } from '../data/raw/tarotImageRules.js';
import { resolveThemeRaw, resolvePresentationRaw } from '../data/raw/rawSegmentLookup.js';
import { pickCombination } from './picker.js';

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
4. 不得只通过更换标题、颜色、图标、边框或装饰来伪装新 UI；如果版式结构、信息排列方式、视觉重心、文本密度或阅读节奏与近期结果相近，必须在输出前重构。
5. 必须采用自适配容器与文字安全写法，避免横向溢出、长文本撑破、标签过宽或固定模板化排版。
`;

const VISUAL_SCENERY_PROTOCOL = String.raw`
【Visual Scenery 专用执行协议｜强制视觉画布版】
本轮展现形式锁定为【10.2.2 Visual Scenery】时，必须生成 CSS 视觉画布，而不是文字说明块。
<details> 内部第一个主要内容块必须是视觉画布，以 CSS 背景、形状、光源、遮罩、线条、粒子、前后景层次、动画或渐变承担主要表达。
允许使用紧凑 <style> 标签与唯一 class 名实现 keyframes 动态效果；若使用 <style>，class 名需带有 rh-vs- 前缀。
画布容器需自适配：box-sizing:border-box; width:min(100%,500px); max-width:100%; margin:auto; overflow:hidden; position:relative;。
画布至少包含 5 个以上不同层次的视觉元素，并形成前景/中景/远景或光影/遮罩/景深的空间关系。
文字只能作为标题、短注、坐标、题签、极短旁白或画面标注；不得让多段说明、选项块或长文本成为主体。
`;

const UNIVERSAL_EXECUTION_CORE = String.raw`
【通用执行规则核心版】
1. 本轮必须融合插件抽取的【主题元素】与【展现形式】；当抽到多个元素时，自然融合而不是随机词拼贴。
2. 插件已完成本轮抽取与冷却排除；必须使用【本轮指定组合】，不得自行替换成上一轮组合或固定模板。
3. 兔子洞是主回复最底部的高完成度 HTML 小剧场，必须根据本轮展现形式重新设计版式与视觉层级。
4. 输出前必须自查 HTML 标签闭合、inline style、自适配容器、文本不溢出、段落间距、max-width 与 box-sizing。
5. 如启用 <thinking>，只输出简短可见执行摘要，不输出隐藏思维链或详细推理过程。
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

function formatUiBeautyConcept(combo) {
    const design = combo?.design;
    if (!design) return '插件未生成 UI美化构思；请自行根据本轮展现形式建立专属版式。';
    return design.concept || `版式结构=${design.construct}；色彩策略=${design.palette}；主视觉锚点=${design.anchor}`;
}

function formatRecentUiBeautyConcepts(combo) {
    const concepts = combo?.recentUiBeautyConcepts || [];
    if (!concepts.length) return '无记录或首次运行。';
    return concepts.map((item, index) => `${index + 1}. ${item}`).join('\n');
}

function hasVisualScenery(combo) {
    return combo?.formats?.some(item => item.id === '10.2.2' || String(item.title || '').toLowerCase().includes('visual scenery'));
}

function isTarotRelated(combo) {
    const keywords = ['塔罗', '牌阵', '占卜', '神秘学', 'tarot', 'Tarot'];
    const themeText = (combo?.themes || []).map(item => `${item.id || ''} ${item.title || ''} ${(item.tags || []).join(' ')} ${resolveThemeRaw(item) || ''}`).join('\n');
    const formatText = (combo?.formats || []).map(item => `${item.id || ''} ${item.title || ''} ${(item.tags || []).join(' ')} ${resolvePresentationRaw(item) || ''}`).join('\n');
    const text = `${themeText}\n${formatText}`;
    return keywords.some(keyword => text.includes(keyword));
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
D. 冷却校验：插件已按最近 10 轮执行主题、展现形式与 UI美化构思冷却；若候选池不足，则允许回退。[pass]
E. 语言：简体中文。[pass]
F. 模式：一体化自动协议；抽到正文衍生类条目则自动使用正文衍生分支，否则自动使用独立分支。
G. UI美化构思：${formatUiBeautyConcept(combo)}
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
    const tarotRulesText = isTarotRelated(combo) ? TAROT_IMAGE_RULES : '';
    const tarotRequirement = tarotRulesText ? '如本轮使用塔罗牌图片，必须遵守已注入的【塔罗牌图片规则】计算图片地址。' : '本轮未注入塔罗图片规则；不要自行扩展塔罗图片编号规则。';
    const uiBeautyConcept = formatUiBeautyConcept(combo);
    const recentUiBeautyConcepts = formatRecentUiBeautyConcepts(combo);
    const boundary = selectedHasCanon
        ? '当前为一体化自动协议：本轮抽到了正文衍生类主题/展现形式，因此自动使用正文衍生分支；但必须保持兔子洞作为主回复之后的独立折叠模块，不得破坏或包裹主回复。'
        : '当前为一体化自动协议：本轮未抽到正文衍生类条目，因此兔子洞必须按独立分支执行，不得引用、复述、评价或暗示主线正文内容；只允许使用 {{char}}、{{user}} 与已出现 NPC 作为虚构元素。';

    const prompt = String.raw`
<RabbitHoleTheaterAutoInjection>
你必须在本轮主回复完成后，额外输出一个【兔子洞】小剧场模块。此模块由 SillyTavern 第三方扩展自动注入，不需要用户在预设里放任何内容。插件按【一体化自动协议】运行，不拆成用户手动选择项。

【固定注入：运行版执行规则】
${RAW_EXECUTION_RULES}

【固定注入：通用执行规则核心版】
${UNIVERSAL_EXECUTION_CORE}

【固定注入：中文锁定】
${settings.hardChineseLock ? RUNTIME_LANGUAGE_RULES : ''}

【固定注入：强制启动增强】
${settings.hardStartup ? HARD_STARTUP_PROTOCOL : ''}

【固定注入：最高优先级结尾保底协议】
${FINAL_GUARD_PROTOCOL}

【固定注入：UI 自查与去模板化】
${uiAuditText}

【本轮 UI美化构思：必须参考，避免与前 10 轮重复】
${uiBeautyConcept}

【最近 10 轮已使用 UI美化构思：禁止复用或近似复用】
${recentUiBeautyConcepts}

【Visual Scenery 专用协议】
${visualModeLine}
${visualSceneryText}

【塔罗牌图片规则：仅塔罗相关轮次注入】
${tarotRulesText}

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
2. 兔子洞模块直接以 <details> 开始，并以 </details> 结束；小剧场必须使用 <summary> 显示【兔子洞：本次标题】。
3. 兔子洞内所有可见文字必须使用简体中文；禁止英文承担主要界面标签。如必须使用外语或专业术语，必须采用“外语【简体中文翻译】”格式。
4. 内部 HTML 不提供固定模板；必须体现本轮主题、展现形式与 UI美化构思，不得只输出无版式设计的纯文字堆叠。
5. 所有 HTML 样式使用 inline style；必须执行自适配、文字安全、复杂度硬指标与 UI美化构思冷却。
6. 严禁复用最近 10 轮内已经使用过的完全相同主题、展现形式或 UI美化构思；插件已列出近期 UI美化构思，模型不得自行回到近期模板。
7. ${tarotRequirement}
8. 【Toto 水印】Toto 仅作为插件设置界面的界面水印存在；不得在主回复正文或兔子洞 <details> 小剧场内部生成 Toto 水印。
9. 如启用 <thinking>，其中只输出可见的执行摘要，不输出隐藏思维链或详细推理过程。
10. 不要解释你正在遵守规则，不要输出代码块，直接输出最终可渲染 HTML。
11. 【最终结尾检查】本轮回复的最后一个可见模块必须是完整的兔子洞 <details> 小剧场。该模块为本轮回复格式的固定组成部分，不得视为可选彩蛋。
</RabbitHoleTheaterAutoInjection>
`;

    if (settings.debug) {
        console.debug('[RabbitHole] generationType:', generationType, 'combo:', combo, 'prompt chars:', prompt.length);
    }
    return prompt.trim();
}
