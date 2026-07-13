export const DYNAMIC_VISUAL_RULES = String.raw`
视觉复杂度保持:
  enforcement_level: "guidance"
  core_concept: "紧凑 HTML 只限制源码排版方式，不限制视觉复杂度、DOM/CSS 嵌套层级、动态效果或媒介质感"

  rule:
    - "不得因为禁止缩进、注释或 Markdown 代码块，而主动简化 UI、减少层级、删减视觉锚点、降低媒介质感或削弱必要的动态效果"
    - "若本轮展现形式需要动态感、光影感、空间感或媒介质感，应选择与媒介相符的 CSS 视觉手段完成，不得按固定技术清单堆砌效果"
    - "动态视觉开启时，每轮必须包含打开后立即自动、持续运行的 CSS 动画；hover、active、transition 与点击变化只能作为辅助"
    - "视觉复杂度与动态必须服务本轮展现形式，不得退化为通用卡片、系统面板或装饰性乱闪"
`;
