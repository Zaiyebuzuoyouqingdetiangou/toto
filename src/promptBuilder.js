import { TAROT_IMAGE_RULES } from '../data/raw/tarotImageRules.js';
import { VISUAL_SCENERY_RULES } from '../data/raw/visualSceneryRules.js';
import { pickCombination } from './picker.js';
import { getComboHistory, getRecentRiskFlags, getRecentRiskFlagCounts } from './storage.js';

function asText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function truncate(text, max = 220) {
    const raw = asText(text);
    if (!raw || raw.length <= max) return raw;
    return `${raw.slice(0, Math.max(20, max - 1)).trim()}…`;
}

function compactItemLine(item, kind) {
    const id = item?.id || '?';
    const title = item?.title || '未命名';
    const tags = Array.isArray(item?.tags) && item.tags.length ? `；tags: ${item.tags.slice(0, 4).join(',')}` : '';
    const summary = item?.summary || item?.raw || '';
    const note = kind === 'presentation'
        ? '；执行：让该展现形式决定 DOM/CSS 轮廓、空间结构、交互方式和文字寄生位置。'
        : '；执行：自然融入本轮剧情气味，不要关键词拼贴。';
    return `- 【${id} ${title}】${summary ? `：${truncate(summary, 170)}` : ''}${tags}${note}`;
}

function formatItemsCompact(items, kind) {
    if (!Array.isArray(items) || !items.length) return '- 无';
    return items.map(item => compactItemLine(item, kind)).join('\n');
}

function signatureOf(combo) {
    return JSON.stringify({
        themeIds: combo?.themeIds || [],
        formatIds: combo?.formatIds || [],
        samplingMode: combo?.samplingMode || 'classic',
        forcedVisualScenery: !!combo?.forcedVisualScenery,
    });
}

function samplingModeLabel(combo, settings) {
    const mode = combo?.samplingMode || settings?.samplingMode || 'classic';
    return mode === 'format_only' ? '仅展现形式' : '主题元素 + 展现形式';
}

function hasVisualScenery(combo) {
    return combo?.formats?.some(item => item.id === '10.2.2' || String(item.title || '').toLowerCase().includes('visual scenery'));
}

function isTarotRelated(combo) {
    const keywords = ['塔罗', '牌阵', '占卜', '神秘学', 'tarot'];
    const text = [
        ...(combo?.themes || []),
        ...(combo?.formats || []),
    ].map(item => `${item?.id || ''} ${item?.title || ''} ${item?.summary || ''} ${item?.raw || ''} ${(item?.tags || []).join(' ')}`).join('\n').toLowerCase();
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
}

function shortVisualAvoidance(combo, limit = 3) {
    const history = getComboHistory(limit + 1);
    const currentSig = signatureOf(combo);
    const trimmed = history[history.length - 1]?.signature === currentSig ? history.slice(0, -1) : history;
    const recent = trimmed
        .filter(item => item?.visualSignature || item?.visualSkeleton || (Array.isArray(item?.riskFlags) && item.riskFlags.length))
        .slice(-limit);
    if (!recent.length) return '暂无实际历史；本轮仍需避免普通信息页、单列内容块和换皮复用。';
    return recent.map((item, index) => {
        const formats = (item.formatIds || []).join(' + ') || '未记录';
        const riskCount = Array.isArray(item.riskFlags) ? item.riskFlags.length : 0;
        const signature = item.visualSignature ? truncate(item.visualSignature, 110) : '已记录视觉骨架';
        return `${index + 1}. 近期展现形式：${formats}；避让摘要：${signature}${riskCount ? `；结构风险 ${riskCount} 项` : ''}`;
    }).join('\n');
}

function recentRiskCorrection() {
    const flags = getRecentRiskFlags(4);
    const counts = getRecentRiskFlagCounts(4);
    if (!flags.length) return '';
    const lines = [];

    const hasRepeatedStructure = flags.some(flag => [
        'same_block_stack',
        'same_grid_card_risk',
        'catalog_page_risk',
        'info_page_degrade',
        'flat_vertical_flow',
        'repeated_unit_shape',
    ].includes(flag));
    if (hasRepeatedStructure) {
        lines.push('近期真实输出的内容承载骨架或阅读路径过于相似。本轮必须改变主视觉结构、空间组织与内容寄生方式，不得继续用多个相似信息块自上而下堆叠。');
    }

    const hasWeakMedia = flags.some(flag => ['weak_media_body', 'weak_spatial_complexity'].includes(flag));
    if (hasWeakMedia) {
        lines.push('近期真实输出的媒介本体偏弱。本轮必须让 DOM/CSS 直接呈现可辨认的媒介轮廓、前中后景层级与视觉锚点，而不是把媒介名只写在标题里。');
    }

    const hasWeakInteraction = flags.some(flag => ['missing_interaction', 'visual_promise_unfulfilled'].includes(flag));
    if (hasWeakInteraction) {
        lines.push('近期真实输出的交互或动态实现偏弱。本轮至少加入一个内部可探索入口或状态变化结构，并让 CSS/SVG/HTML 机制真实承担效果。');
    }

    if ((counts.same_block_stack || 0) >= 2 || (counts.info_page_degrade || 0) >= 2 || (counts.flat_vertical_flow || 0) >= 2) {
        lines.push('连续重复风险偏高。本轮必须显著改变阅读路径，例如改为分层视窗、横向/环形/地图式空间、局部展开、遮罩探索或多焦点跳读。');
    }

    if (!lines.length) return '';
    return `\n真实视觉纠偏【由插件扫描实际 HTML/CSS 后触发，只给抽象方向】:\n${lines.map(x => `  - "${x}"`).join('\n')}`;
}


function hardStartupReserve() {
    return String.raw`
兔子镜输出预留:
  - 本轮必须完成“主回复正文 + 完整兔子镜”；兔子镜是本轮输出的必需组成，不是可省略的附加项。
  - 开始正文前先为固定外壳与完整内部画面预留足够输出长度，正文不得耗尽全部可用篇幅。
  - 若篇幅冲突，先收束正文，再减少兔子镜内部文字与次要装饰；不得省略整段兔子镜、改成纯文字占位或留下未闭合结构。`;
}

function coreOutputProtocol() {
    return String.raw`
兔子镜强制输出【每轮必需】:
  - 主回复正文结束后，立即继续输出一个完整兔子镜；未出现完整 <toto>...</toto> 即代表本轮尚未完成。
  - 固定外壳：<toto data-rabbit-mirror="true" style="display:block;"><details><summary>【兔子镜：中文短标题】</summary>内部 HTML</details></toto>
  - 外层 <details>/<summary> 只负责折叠整段兔子镜，summary 必须使用「【兔子镜：6到14字简体中文标题】」格式。
  - 兔子镜须位于主回复正文之后；若剩余输出长度不足，应立即收束正文并精简内部次要文字与装饰，但仍须完整输出并闭合。
  - 禁止解释规则、Markdown 代码块、<pre>/<code> 与 HTML 注释；禁止 script、iframe、object、embed、form、事件属性。
  - 只有完整输出 </toto> 后才允许结束本轮回复。`;
}

function compactCreativeRule(enabled, formatOnly = false) {
    if (formatOnly) {
        return enabled ? String.raw`
仅展现形式发散:
  本轮只把展现形式当作媒介、阅读路径和视觉结构的灵感种子；可以发散材质、空间、交互痕迹与细节，但不得额外调用或补造独立题材分类。内容素材只取自当前对话语境。` : String.raw`
仅展现形式收敛:
  本轮只围绕展现形式生成媒介结构与视觉读法，不另起题材分类，不在标题、summary 或正文中标注额外类别；内容素材只取自当前对话语境。`;
    }
    if (enabled) {
        return String.raw`
发散孵化:
  抽取结果是灵感种子，不是封闭模板；保留核心气味/媒介痕迹/关系逻辑，同时允许扩展库外媒介、材质、空间结构、交互痕迹与外延剧情。发散必须能追溯回本轮抽取结果，禁止跑题。`;
    }
    return String.raw`
经典收敛:
  优先围绕当前抽取结果生成，不延续历史模板，不另起炉灶；允许自然补足，但禁止关键词拼贴、平均堆叠和过度魔改。`;
}

function complexInteractiveCore() {
    return String.raw`
复杂交互视觉核心:
  - 兔子镜必须是复杂精美的微型交互媒介作品，不能退化为普通信息页、单列内容块、简单表单或文字摘要。
  - 展现形式必须直接决定 DOM/CSS 轮廓、空间结构、阅读路径、交互方式与文字寄生位置；画面须有主视觉、前中后景、视觉锚点、材质与呼吸感，不能只在标题中成立。
  - 除最外层折叠外，每轮至少有一个从本轮叙事核心、媒介本体或画面内部关系自然生长的交互变化；触发对象、操作方式与反馈结果须随内容重新设计，触发后作品本体须发生清晰且有意义的内容、空间、构图或状态变化，仅换颜色、边框、阴影不算。
  - 交互与视觉骨架每轮重新设计，不得换皮复用或机械堆叠内部 details；仅当媒介天然需要分层阅读时才可使用内部 details。
  - 使用安全、可稳定渲染的 HTML/CSS；禁止内联 JavaScript。核心交互须兼容触屏，hover 只能辅助，装饰层不得遮挡热区。
  - 可用 Flex/Grid、定位、SVG、渐变、阴影、滤镜、clip-path、mask、transform、transition 与 CSS 动画构成空间和质感。`;
}


function innerDetailsCooldownRule() {
    const recentFlags = getRecentRiskFlags(5);
    if (!recentFlags.includes('inner_details_used')) return '';
    return String.raw`
内部折叠冷却【最近五轮实际输出已使用内部 details】:
  - 本轮禁止在最外层兔子镜内部再次使用 details/summary；最外层固定折叠不受影响。
  - 改用当前媒介自然产生的点击或轻触交互，hover 仅作辅助。`;
}


function visibleChineseHardLock() {
    return String.raw`
可见中文硬锁:
  - 兔子镜内所有用户能看见的文字必须使用简体中文，包括 summary、标题、正文、按钮、标签、状态、警告、提示、角标、反馈文案和样式 content 生成的文字。
  - 禁止纯英文界面、英文按钮、英文大写系统词和英文状态句；HTML 标签、CSS 属性、class/id/data、选择器和 URL 不适用。
  - 若确实需要出现外语学习内容，必须采用「外语 [简体中文释义]」格式，且不能让外语成为按钮、标题或主界面的唯一文字。`;
}

function visualSceneryInteractionLinkRule() {
    return String.raw`
Visual Scenery 动态与交互:
  - 画面打开后必须通过持续动画完整成立，核心内容不得依赖用户操作才能出现。
  - 每轮保留至少一个由本轮叙事核心、媒介本体或画面内部关系自然产生的交互变化，用于呈现具有意义的第二状态。
  - 触发对象、操作方式与反馈结果应随本轮内容重新设计，不得连续复用整幅画面点击、长按、按钮、开关或其他固定交互骨架。
  - 交互应发生在画面本体内部，不得为了提示操作增加独立按钮、操作面板或大段说明。
  - 触发后须改变内容显隐、关系结构、空间层级、构图、材质状态或观察方式，仅改变颜色、边框或阴影不算完成。
  - 用户未操作时，画面仍须具有完整构图、清晰主体与持续生命感。`;
}


function htmlSafetyCore() {
    return String.raw`
HTML 直接渲染:
  只输出可直接渲染的 HTML/CSS/SVG/details/summary；普通静态局部可用 inline style，动画、响应式结构与状态联动可使用兔子镜内部的局部 <style> 和专属类名；主容器与关键子容器使用 box-sizing:border-box，长文本须自适配且不溢出。
  所有 style 属性必须由成对引号完整包裹，CSS 函数括号必须闭合，不得让后续 HTML 标签被吞入 style 属性值。`;
}

function presentationFirstColorRule() {
    return String.raw`
展现形式优先配色:
  - 必须先确定媒介本体、材质、时代、环境与光线，再由这些条件自然推导配色。
  - 配色必须体现当前媒介真实存在的材质色、环境光色与使用痕迹，不得脱离本体单独设计。
  - 主色、结构色、文字色与强调色应形成清晰层级，并共同服务于当前展现形式。
  - 视觉高级感应通过构图、材质、空间、光影、细节与色彩关系建立，不得依赖固定底色套路。
  - 不得将不同媒介统一套成同一种科技界面、终端界面、玻璃面板或低照度模板。
  - 场景具有特殊光线或材质需求时，应按其真实视觉条件处理，同时保证主体、层次与材质清晰可辨。
  - 每轮应依据本轮展现形式重新组织色彩关系，不得机械复用近期的主色结构与配色套路。`;
}

function visualColorTruthRule() {
    return String.raw`
视觉真实:
  明暗、纸面、屏幕、材质等描述必须与实际 CSS background/background-color 一致；不得用文字声明替代真实 CSS。`;
}

function stateBarIsolationRule() {
    return String.raw`
状态栏隔离:
  正文已有的状态栏、属性栏或数据栏只用于理解剧情信息，不得复刻其字段、顺序、标签、配色、卡片结构与信息组织；兔子镜必须按本轮展现形式重新构成。`;
}

function buildPrompt({ combo, settings, selectedThemes, selectedFormats, visualSceneryMode, tarotRulesText, directive }) {
    const chunks = [];
    const mode = combo?.samplingMode || settings?.samplingMode || 'classic';
    chunks.push('<兔子镜自动注入>');
    if (settings.hardStartup !== false) chunks.push(hardStartupReserve());
    chunks.push(visibleChineseHardLock());
    if (mode === 'format_only') {
        chunks.push(String.raw`
本轮抽取模式: 仅展现形式
本轮内容来源: 当前对话语境；不使用题材抽取池，不额外补造独立类别。
本轮展现形式:
${selectedFormats}`);
    } else {
        chunks.push(String.raw`
本轮抽取模式: ${samplingModeLabel(combo, settings)}
本轮主题元素:
${selectedThemes}

本轮展现形式:
${selectedFormats}`);
    }
    chunks.push(compactCreativeRule(!!settings.creativeExpansionMode, mode === 'format_only'));
    chunks.push(complexInteractiveCore());
    chunks.push(innerDetailsCooldownRule());
    chunks.push(presentationFirstColorRule());
    chunks.push(visualColorTruthRule());
    chunks.push(stateBarIsolationRule());

    if (settings.userDirectivePriority && directive) {
        chunks.push(String.raw`
用户点播优先:
  最后一条用户输入已匹配到兔子镜点播条目；点播优先，未指定部分由插件随机补足。兔子镜不得抢占、稀释或改写主回复正文。`);
    }

    if (settings.avoidRepeat) {
        chunks.push(String.raw`
近期视觉避让:
${shortVisualAvoidance(combo, 3)}${recentRiskCorrection()}`);
    }

    if (visualSceneryMode) {
        chunks.push(VISUAL_SCENERY_RULES);
        chunks.push(visualSceneryInteractionLinkRule());
    }

    if (tarotRulesText) chunks.push(tarotRulesText);
    chunks.push(htmlSafetyCore());
    // 强制输出契约放在注入末尾，利用指令近因保证每轮正文后继续生成完整兔子镜。
    chunks.push(coreOutputProtocol());
    chunks.push('</兔子镜自动注入>');
    return chunks.filter(Boolean).join('\n\n').trim();
}

export function buildRabbitMirrorPrompt(settings, generationType = 'normal') {
    if (!settings?.enabled || !settings?.autoRabbitMirrorInjection || settings?.mode === 'off') return '';
    const { combo, directive, disabled } = pickCombination(settings);
    if (disabled) {
        if (settings.debug) console.debug('[RabbitMirror] skipped by user directive');
        return '';
    }

    const selectedThemes = formatItemsCompact(combo.themes, 'theme');
    const selectedFormats = formatItemsCompact(combo.formats, 'presentation');
    const visualSceneryMode = !!(settings.forceVisualScenery || hasVisualScenery(combo));
    const tarotRulesText = isTarotRelated(combo) ? TAROT_IMAGE_RULES : '';
    const prompt = buildPrompt({ combo, settings, selectedThemes, selectedFormats, visualSceneryMode, tarotRulesText, directive });

    if (settings.debug) {
        console.debug('[RabbitMirror] generationType:', generationType, 'combo:', combo, 'prompt chars:', prompt.length);
    }
    return prompt;
}
