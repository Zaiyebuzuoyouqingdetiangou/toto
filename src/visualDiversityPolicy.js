// Shared generation policy, emitted once after composing all faces/candidates.
// These are creative requirements, not parser gates or automatic retry triggers.
export function strongVisualDiversityRule({ hasHistory = false } = {}) {
    const scope = '用户明确指定、保存并启用的视觉偏好及形式固有功能、材质优先；保留本轮锁定条目和完整候选，不换签、不删形式、不改主回复；动态视觉、视觉增强及组合不进入冷却，SVG、动画、空间层次、材质细节、可读性与控件数量不是避重对象，正常装置的功能不同的同款控件保留，文本面不新增交互或动画。';
    return `默认强避重【每次生成、同批各面均执行】：
  - ${scope}
  - ${hasHistory
        ? '必须脱离共用历史中重复的配色组合、主体构图、操作路径、展现形式运用与主题元素；骨架按画文分区、内容承载和实际操作判断，换标题、文字、CSS 类名、抽签名、按钮数量或仅换强调色不算变化。保留上述固定要求，在其余可变部分强避重；配色从媒介材质、环境和光线推导，不机械轮换色板，不靠删除画面或削减绘制避重。'
        : '没有历史时，从本轮正文和选中条目独立构思，同批各面在可变的配色、构图、操作、形式运用与主题表达上强避重；配色从媒介材质与光线推导，不套默认底盘。'}`;
}

export function darkVisualGenerationRule(settings) {
    if (settings?.darkVisualMode !== true) return '';
    return `深色生成模式【本次所有新生成镜面，包括长文本】：
  - 整体背景、主要承载面与阅读正文区域均采用适合夜间阅读的低明度背景，文字、标签和操作反馈保持清晰对比。局部高光或物件可按材质保留，不能用大面积浅色纸面、米黄卡片或白色正文框抵消深色模式。
  - 在深色明度范围内落实用户色彩偏好，仍须强避重：从本轮形式与材质推导不同的主辅色、冷暖、饱和度和受光关系，不连续套同一黑灰界面，也不把“深色”本身判成重复并改亮。
  - 保留形式的固有结构、材质纹理与原有玩法，通过夜间环境、染色材质或低明度同类材料表达；不能把所有媒介都改成终端面板。长文本仍只做原有阅读美化，不添加 HTML 面的交互或动画。`;
}

export function visualDiversityExecutionLock(settings) {
    return '强避重短锁：交互避用、结构与配色按上文共用历史执行；用户指定、固有功能和材质优先，保留各面已启用能力。' +
        (settings?.darkVisualMode === true ? '深色模式仅约束明暗，其余构造、绘制与交互要求共用。' : '');
}
