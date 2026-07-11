import { TAROT_IMAGE_RULES } from '../data/raw/tarotImageRules.js';
import { VISUAL_SCENERY_RULES } from '../data/raw/visualSceneryRules.js';
import { pickCombination } from './picker.js';
import { getComboHistory, getLastCombo, getRecentRiskFlags, getRecentRiskFlagCounts } from './storage.js';

function asText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function truncate(text, max = 220) {
    const raw = asText(text);
    if (!raw || raw.length <= max) return raw;
    return `${raw.slice(0, Math.max(20, max - 1)).trim()}…`;
}

function stripEnglishPromptNoise(text) {
    let out = asText(text);
    if (!out) return out;
    const replacements = [
        [/Visual\s+Scenery/gi, '纯CSS风景画布'],
        [/AI\s+Chatbot/gi, '人工智能对话界面'],
        [/AI\s+Persona\s+Parody/gi, '人工智能人格戏仿'],
        [/To-Do\s+List/gi, '待办清单'],
        [/Love\s+Chronicle\s*\/\s*Flip-book/gi, '恋爱纪念翻页手账'],
        [/Memory\s+Grid/gi, '回忆拼图'],
        [/Intimate\s+Q&A/gi, '尺度递进访谈'],
        [/Shared\s+Memory\s+Replay/gi, '共同回忆重放'],
        [/General\s+NSFW/gi, '综合尺度题材'],
        [/Happy\s+Ending\s+IF/gi, '圆满结局假想'],
        [/NSFW\s*\/\s*SFW/gi, '尺度分级'],
        [/ChatGPT|Claude|Siri|YouTube|TikTok|Twitter|Twitch|OnlyFans|Patreon|Fansly|ManyVids|Pornhub|Xvideos|Chaturbate|WeChat|Instagram|IG/gi, '平台语感'],
        [/APP\b/gi, '应用界面'],
        [/Char\b/gi, '角色'],
        [/CSS\b/gi, '样式'],
        [/HTML\b/gi, '网页结构'],
        [/SVG\b/gi, '矢量图形'],
    ];
    for (const [re, repl] of replacements) out = out.replace(re, repl);
    // 删掉剩余英文括注，避免模型复制成可见 UI。
    out = out.replace(/[（(]\s*[A-Za-z][A-Za-z0-9&/ .:+_-]{1,80}\s*[）)]/g, '');
    // 剩余连续英文词只保留为“外文风格词”，防止直接灌入界面。
    out = out.replace(/\b[A-Za-z][A-Za-z0-9_-]{2,}\b/g, '外文风格词');
    return out.replace(/\s+/g, ' ').trim();
}

function compactItemLine(item, kind) {
    const id = item?.id || '?';
    const title = stripEnglishPromptNoise(item?.title || '未命名');
    const summary = stripEnglishPromptNoise(item?.summary || item?.raw || '');
    const note = kind === 'presentation'
        ? '；执行：让该展现形式决定网页结构轮廓、空间结构、反馈方式和文字寄生位置。'
        : '；执行：自然融入本轮剧情气味，不要关键词拼贴。';
    return `- 【${id} ${title}】${summary ? `：${truncate(summary, 150)}` : ''}${note}`;
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
        const signature = item.visualSignature ? truncate(stripEnglishPromptNoise(item.visualSignature), 110) : '已记录视觉骨架';
        return `${index + 1}. 近期展现形式：${formats}；避让摘要：${signature}${riskCount ? `；结构风险 ${riskCount} 项` : ''}`;
    }).join('\n');
}

function recentRiskCorrection() {
    const flags = getRecentRiskFlags(4);
    const counts = getRecentRiskFlagCounts(4);
    if (!flags.length) return '';
    const lines = [];
    const recent = getComboHistory(3);
    const recentSkeletons = recent.map(item => String(item?.visualSkeleton || '')).filter(Boolean);
    const recentTwoDark = recentSkeletons.slice(-2).length === 2 && recentSkeletons.slice(-2).every(text => /contrast:\s*dark_weighted|digital_dark_surface|暗色高对比底盘/.test(text));
    const recentDarkMood = recentSkeletons.slice(-2).length === 2 && recentSkeletons.slice(-2).every(text => /霓虹|发光|监控|控制台|档案\/后台|digital_dark_surface/.test(text));

    if (recentTwoDark || recentDarkMood) {
        lines.push('近期输出的明暗关系与主底盘光源重复度过高。本轮优先切换为浅色、中明度或混合材质主底盘，并确保文字与背景高对比可读；不得继续复用整页暗底或同类暗色发光骨架。');
    }

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

    if (flags.includes('low_text_contrast')) {
        lines.push('近期真实输出出现文字对比不足。本轮必须优先保证可读性：深底浅字、浅底深字，复杂背景上的文字必须有承托层、阴影、描边或纯色底。');
    }

    if (flags.includes('english_visible_text')) {
        lines.push('近期真实输出出现可见英文过多。本轮所有 summary、标题、正文、按钮、状态、警告、提示、反馈文案与 样式 content 必须使用简体中文；禁止纯英文界面、英文按钮、英文大写系统词和英文状态句。');
    }

    if (flags.includes('summary_title_format')) {
        lines.push('近期真实输出的外层折叠标题格式不稳定。本轮 summary 必须严格写成「【兔子镜：6到14字简体中文标题】」，禁止只写“兔子镜”，也禁止只写标题不带“兔子镜：”前缀。');
    }

    const hasWeakInteraction = flags.some(flag => ['details_overused', 'visual_promise_unfulfilled', 'broken_css_state_interaction'].includes(flag));
    if (hasWeakInteraction) {
        lines.push('近期真实输出曾出现视觉承诺未兑现或内部折叠堆叠。本轮让动态反馈从当前媒介材质中产生；除外层折叠壳外，内部若使用交互必须采用可生效的 CSS 状态结构，input 位于触发标签和反馈内容之前，且反馈内容与 input 同级可被 :checked 选择器命中。');
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
  - 固定外壳：<toto data-rabbit-mirror="true" style="display:block;"><details><summary>【兔子镜：中文短标题】</summary><div>内部网页结构</div></details></toto>。
  - 外层 <details>/<summary> 只负责把整段兔子镜折叠起来；summary 必须使用「【兔子镜：6到14字简体中文标题】」格式。
  - summary 禁止只写“兔子镜”，也禁止只写标题而不带“兔子镜：”前缀；summary 不承载正文，且不得出现纯英文。
  - summary 后的主体优先使用 <div> 作为主容器；除非本轮展现形式确实需要翻面、揭示或分段探索，否则不要在内部继续堆叠 <details>/<summary>。
  - 兔子镜必须是最后一个可见模块；禁止解释规则、禁止省略、禁止 Markdown 代码块、禁止 <pre>/<code>/HTML 注释。
  - 禁止 script、iframe、object、embed、form、事件属性；所有标签必须闭合，最终必须以 </toto> 结束。`;
}

function compactCreativeRule(enabled, formatOnly = false) {
    if (formatOnly) {
        return enabled ? String.raw`
仅展现形式发散:
  本轮只把展现形式当作媒介、阅读路径和视觉结构的灵感种子；可以发散材质、空间、动态反馈与细节，但不得额外调用或补造独立题材分类。内容素材只取自当前对话语境。` : String.raw`
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

function visibleChineseHardLock() {
    return String.raw`
可见中文硬锁:
  - 兔子镜内所有用户能看见的文字必须是简体中文，包括 summary、标题、正文、按钮、标签、状态、警告、提示、角标、反馈文案和 样式 content 生成的文字。
  - 禁止纯英文界面，禁止英文大写系统词，禁止英文按钮，禁止英文状态句，禁止把抽取条目里的英文名、平台名或英文缩写复制到可见界面。
  - 只有网页标签、样式属性、class/id/data、选择器和 URL 可以使用英文；这些英文不得出现在屏幕文字里。
  - 若确实需要出现外语学习内容，必须采用「外语 [简体中文释义]」格式，且不能让外语成为按钮、标题或主界面的唯一文字。`;
}

function complexInteractiveCore() {
    return String.raw`
复杂视觉核心:
  - 兔子镜必须像复杂精美的微型 HTML 媒介作品，而不是普通信息页、单列内容块、简单表单或文字摘要。
  - 展现形式必须决定 DOM/CSS 的整体轮廓、空间结构、阅读路径、反馈方式和文字寄生位置，不能只写进标题。
  - 必须具备主视觉结构、前中后景层级、视觉锚点、材质质感、排版呼吸感与非单调阅读路径。
  - 动态反馈必须从本轮展现形式的媒介材质和场景逻辑中产生，不得脱离本轮媒介材质另起一套无关界面语法。
  - 每轮可以具备可感知的动态反馈或交互感，但外层折叠壳之外不强制每轮都使用额外可点击结构；只有本轮确实需要选择、探索或分段推进时，才使用内部可点击/可切换结构。
  - 不得为了满足交互而在外层折叠壳内部继续机械堆叠 <details>/<summary>；内部折叠结构不能连续成为默认解法。
  - 若使用可点击或可切换结构，必须无需 JS 即可生效：禁止 onclick、button 伪交互；外层 summary 与内部 summary 均需 cursor:pointer 与 list-style:none；装饰遮罩不得覆盖交互，必要时 pointer-events:none，交互层使用更高 z-index。
  - 若使用 checkbox/radio 状态切换，必须采用可生效的 CSS 结构：input 必须出现在 label 和被控制内容之前；被控制内容必须与 input 位于同一父级或后续同级位置；选择器使用 input:checked + label + .panel 或 input:checked ~ .panel。禁止把反馈内容藏在无法被 + 或 ~ 命中的嵌套容器里，禁止把反馈父容器设置为 opacity:0，禁止只用 样式 content 伪元素作为唯一反馈。
  - 内部可点击按钮、状态文字、反馈文案和 样式 content 文字必须使用简体中文；不要生成英文系统词、英文注入按钮、英文状态句或英文警告提示。
  - 鼓励使用 弹性/网格布局、绝对定位分层、矢量图形、渐变、阴影、滤镜、裁切、遮罩、变形、过渡或轻量样式动效构建空间与质感。
  - 可读性优先：所有主要文字必须与所在背景高对比，深底浅字、浅底深字；禁止黑底灰字、暗底暗字、低透明文字压在复杂纹理上。
  - 本轮不得默认整页暗底或黑色发光底盘；若主题需要暗色，只能作为局部层次或必须确保全部文字清晰可读。
  - 不得只靠换标题、换色、换边框或换装饰复用同一种视觉骨架；若整体骨架、阅读路径或内容承载方式仍近似上一轮，必须重写。`;
}

function htmlSafetyCore() {
    return String.raw`
网页结构直接渲染:
  只输出可直接渲染的 网页结构、样式、矢量图形、details/summary；优先 inline style；主容器与关键子容器使用 box-sizing:border-box；长文本需自适配屏幕宽度并避免溢出。`;
}

function visualColorTruthRule() {
    return String.raw`
视觉真实:
  明暗、纸面、屏幕、材质等描述必须与实际 CSS background/background-color 一致；不得用文字声明替代真实 CSS。文字色必须与所在背景形成清晰对比，复杂背景上的文字必须有承托层、阴影、描边或纯色底。`;
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

    if (settings.userDirectivePriority && directive) {
        chunks.push(String.raw`
用户点播优先:
  最后一条用户输入已匹配到兔子镜点播条目；点播优先，未指定部分由插件随机补足。兔子镜不得抢占、稀释或改写主回复正文。`);
    }

    if (settings.uiAudit) {
        chunks.push(String.raw`
UI 自查短版:
  输出前检查：媒介本体是否靠 DOM/CSS 成立、是否有空间层级/视觉锚点/质感、是否有动态反馈或媒介内反馈、是否退化为普通纵向内容流。失败则重写。`);
    }

    if (settings.avoidRepeat) {
        chunks.push(String.raw`
近期视觉避让:
${shortVisualAvoidance(combo, 3)}${recentRiskCorrection()}`);
    }

    if (visualSceneryMode) {
        chunks.push(String.raw`
动态渐变模式:
  允许使用纯 样式/矢量图形 构建风景化、光影化、流动渐变或环境动态效果；必须服务本轮展现形式，不得为了动而动。`);
        chunks.push(VISUAL_SCENERY_RULES);
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
