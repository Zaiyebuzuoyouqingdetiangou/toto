// Shared generation policy, emitted once after composing all faces/candidates.
// These are creative requirements, not parser gates or automatic retry triggers.
export function strongVisualDiversityRule({ hasHistory = false, textOnly = false } = {}) {
    if (textOnly) return `默认强避重【本次均为文本面】：保留用户指定与已启用能力；题材表达与阅读配色${hasHistory ? '避开近期重复' : '依正文独立构思'}，不新增交互或动画。`;
    return `默认强避重【每次生成、同批各面均执行】：保留用户指定、视觉偏好、形式固有特征与已启用能力；换主题、形式或交互编号不算变化，可变的实际画文分区、内容承载与操作路径${hasHistory ? '须脱离近期及同批重复' : '依正文独立构思，同批形成差异'}；媒介需要的分页、频道、折叠照常使用，控件数量不限，文本面不新增交互或动画。`;
}

export function darkVisualGenerationRule(settings) {
    if (settings?.darkVisualMode !== true) return '';
    return `深色生成模式【本次所有新生成镜面，包括长文本】：
  - 整体背景、主要承载面与阅读正文区域均采用适合夜间阅读的低明度背景，文字、标签和操作反馈保持清晰对比。局部高光或物件可按材质保留，不能用大面积浅色纸面、米黄卡片或白色正文框抵消深色模式。
  - 在深色明度范围内落实用户色彩偏好，仍须强避重：从本轮形式与材质推导不同的主辅色、冷暖、饱和度和受光关系，不连续套同一黑灰界面，也不把“深色”本身判成重复并改亮。
  - 保留形式的固有结构、材质纹理与原有玩法，通过夜间环境、染色材质或低明度同类材料表达；不能把所有媒介都改成终端面板。长文本仍只做原有阅读美化，不添加 HTML 面的交互或动画。`;
}

export function visualDiversityExecutionLock(settings, { textOnly = false } = {}) {
    if (textOnly) return '强避重短锁：阅读配色按上文共用历史避重；用户指定与材质优先。';
    return '强避重短锁：交互避用、结构与配色按上文共用历史执行；用户指定、固有功能和材质优先，保留各面已启用能力。' +
        (settings?.darkVisualMode === true ? '深色模式仅约束明暗，其余构造、绘制与交互要求共用。' : '');
}
