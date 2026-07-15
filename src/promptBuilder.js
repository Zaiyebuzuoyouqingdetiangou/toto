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

function coreOutputProtocol() {
    return String.raw`
强制输出:
  - 主回复正文完成后，必须在消息最底部追加一个完整兔子镜小剧场。
  - 固定外壳：<toto data-rabbit-mirror="true" style="display:block;"><details><summary>【兔子镜：中文短标题】</summary>内部 HTML</details></toto>
  - 外层 <details>/<summary> 只负责折叠整段兔子镜，summary 必须使用「【兔子镜：6到14字简体中文标题】」格式。
  - 兔子镜必须是最后一个可见模块；禁止解释规则、禁止省略、禁止 Markdown 代码块、禁止 <pre>/<code>/HTML 注释。
  - 禁止 script、iframe、object、embed、form、事件属性；所有标签必须闭合，最终必须以 </toto> 结束。`;
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
  - 兔子镜必须像复杂精美的微型交互 HTML 媒介作品，而不是普通信息页、单列内容块、简单表单或文字摘要。
  - 展现形式必须决定 DOM/CSS 的整体轮廓、空间结构、阅读路径、交互方式和文字寄生位置，不能只写进标题。
  - 必须具备主视觉结构、前中后景层级、视觉锚点、材质质感、排版呼吸感与非单调阅读路径。
  - 除最外层兔子镜折叠外，每轮内部必须至少包含一个真实可操作或可探索的交互入口；最外层 details/summary 不计入内部交互。
  - 内部交互必须从本轮展现形式自身的结构、阅读方式、空间关系或叙事逻辑中推导，严禁直接套用固定模板。设计时，应先判断当前媒介中什么内容或意象天然适合被触发、改变或探索，再决定触发对象、变化路径与阅读结果。
  - 交互触发后，必须使作品本体产生清晰、肉眼可见且具有叙事意义的变化；仅改变边框、颜色、阴影，或只做出“看起来可点”的外观，不算有效交互。
  - 交互实现方案每轮必须重新设计，不得照搬前轮方案或长期重复同一种交互骨架；不得默认连续使用 details/summary，也不得机械堆叠折叠组件。只有本轮展现形式天然需要分段展开或层层阅读时，才允许使用内部 details。
  - 必须采用安全、可稳定渲染的纯 HTML/CSS 结构；严禁使用内联 JavaScript 事件，不得把 hover 作为移动端唯一触发方式，交互区域不得被装饰层遮挡。
  - 鼓励使用 Flex/Grid、absolute 定位、SVG、linear-gradient、box-shadow、filter、clip-path、mask、transform、transition 或轻量 CSS 动效构建空间与质感。
  - 不得只靠换标题、换色、换边框或换装饰复用同一种视觉骨架。`;
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
Visual Scenery 交互联动:
  - 本轮既有的内部交互要求必须直接落实在同一 Visual Scenery 视觉画布中；交互入口、受控对象与变化结果必须属于同一画面，并由本轮展现形式自身的结构、空间关系或叙事逻辑自然产生。
  - 触发后，画面主体、核心物件、空间层级、构图关系或内容显隐必须发生清晰且具有意义的变化。
  - 不得把交互另行拼接成画面之外的独立按钮区、状态反馈区或说明组件；仅改变边框、颜色、阴影，或只浮现提示文字，不算完成交互。
  - 具体实现继续遵守常驻交互规范与安全 HTML/CSS 规则。`;
}

function htmlSafetyCore() {
    return String.raw`
HTML 直接渲染:
  只输出可直接渲染的 HTML/CSS/SVG/details/summary；优先 inline style；主容器与关键子容器使用 box-sizing:border-box；长文本需自适配屏幕宽度并避免溢出。
  所有 style 属性必须使用成对引号完整包裹，CSS 函数括号必须闭合，尤其 rgba()/hsla()/linear-gradient()/box-shadow 不得漏写右括号或引号；不得让下一个 HTML 标签被吞进 style 属性值。`;
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

function uiAuditRule() {
    return String.raw`
UI 自查短版:
  输出前检查：媒介本体是否靠 DOM/CSS 成立、是否有空间层级/视觉锚点/质感、是否存在真实可触发且触发后产生明显内容变化的内部交互、是否退化为普通纵向内容流。失败则重写。`;
}

function buildPrompt({ combo, settings, selectedThemes, selectedFormats, visualSceneryMode, tarotRulesText, directive }) {
    const chunks = [];
    const mode = combo?.samplingMode || settings?.samplingMode || 'classic';
    chunks.push('<兔子镜自动注入>');
    chunks.push(coreOutputProtocol());
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
    chunks.push(visualColorTruthRule());
    chunks.push(stateBarIsolationRule());

    if (settings.userDirectivePriority && directive) {
        chunks.push(String.raw`
用户点播优先:
  最后一条用户输入已匹配到兔子镜点播条目；点播优先，未指定部分由插件随机补足。兔子镜不得抢占、稀释或改写主回复正文。`);
    }

    if (settings.uiAudit) {
        chunks.push(uiAuditRule());
    }

    if (settings.avoidRepeat) {
        chunks.push(String.raw`
近期视觉避让:
${shortVisualAvoidance(combo, 3)}${recentRiskCorrection()}`);
    }

    if (visualSceneryMode) {
        chunks.push(String.raw`
Visual Scenery 模式:
  允许使用纯 CSS/SVG 构建风景化、光影化、流动渐变或环境动态效果；必须服务本轮展现形式，不得为了动而动。`);
        chunks.push(VISUAL_SCENERY_RULES);
        chunks.push(visualSceneryInteractionLinkRule());
    }

    if (tarotRulesText) chunks.push(tarotRulesText);
    chunks.push(htmlSafetyCore());
    chunks.push(String.raw`
最终保底:
  先完整生成主回复正文；正文结束后必须继续生成兔子镜。先保证 <toto> 出现，再追求复杂度。不要解释规则，直接输出最终内容。`);
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
