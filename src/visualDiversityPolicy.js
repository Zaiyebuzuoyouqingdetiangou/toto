// Shared generation policy, emitted once after composing all faces/candidates.
// These are creative requirements, not parser gates or automatic retry triggers.
export function strongVisualDiversityRule({ hasHistory = false, textOnly = false, hasRecentTextPanelSwitch = false, hasRecentTextDisclosure = false } = {}) {
    const basis = hasHistory ? '参考近期选材与实际主色' : '依正文独立构思';
    if (textOnly || !hasHistory) return `避重：${basis}，同批及相邻轮优先变化，允许部分复用；用户指定、固有功能与材质优先。${textOnly ? '文本面只调整题材与阅读配色，不新增交互或动画。' : ''}`;
    return 'HTML 面避重：近三轮实际主色及同族相近色必须避开；只换色号或点缀色不算。主题、形式和交互编号可部分复用，但近期重复的页面布局与操作方式必须改变。仅换名称、按钮数量、颜色或编号不算变化。'
        + (hasRecentTextPanelSwitch ? '本轮严禁再次采用“并列入口仅切换同位长文”。' : '')
        + (hasRecentTextDisclosure ? '本轮严禁再以展开／收起文字充当主交互。' : '')
        + '用户指定优先；保留展现形式必需的功能与材质，不得以此为由复刻整套结构。';
}

export function darkVisualGenerationRule(settings) {
    if (settings?.darkVisualMode !== true) return '';
    return `深色生成模式【本次所有新生成镜面，包括长文本】：
  - 整体背景、主要承载面与阅读正文区域均采用适合夜间阅读的低明度背景，文字、标签和操作反馈保持清晰对比。局部高光或物件可按材质保留，不能用大面积浅色纸面、米黄卡片或白色正文框抵消深色模式。
  - 在深色明度范围内落实用户色彩偏好，仍须强避重：从本轮形式与材质推导不同的主辅色、冷暖、饱和度和受光关系，不连续套同一黑灰界面，也不把“深色”本身判成重复并改亮。
  - 保留形式的固有结构、材质纹理与原有玩法，通过夜间环境、染色材质或低明度同类材料表达；不能把所有媒介都改成终端面板。长文本仍只做原有阅读美化，不添加 HTML 面的交互或动画。`;
}

export function visualDiversityExecutionLock() {
    // The shared ledger and its one execution sentence are already sent once.
    return '';
}
