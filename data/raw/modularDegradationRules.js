export const MODULAR_DEGRADATION_RULES = String.raw`
媒介结构降级兜底:
  enforcement_level: "mandatory"
  rule:
    - "禁止把本轮展现形式降级为通用、浅层或可任意换标题的内容承载结构。"
    - "禁止用多个同构内容单元顺次承载主要文字来替代媒介本体。"
    - "若展现形式只存在于标题、栏目名或说明文字中，而 DOM/CSS 本身缺乏可辨认的媒介结构，判定失败，必须重写。"
`;
