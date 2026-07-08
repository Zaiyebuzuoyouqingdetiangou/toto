export const RAW_EXECUTION_RULES = String.raw`
## [small_theater]
# 每轮主回复完成后，必须在最后自动追加兔子洞小剧场

<兔子洞执行规则 v3.0 compact>

执行边界:
  enforcement_level: "mandatory"
  trigger: "主回复完成后，回复最后追加完整 <toto data-rabbit-hole="true" style="display:block;"><details>...</details></toto> 小剧场"
  boundary:
    - "兔子洞不得干预、改写、包裹主线叙事；主线与兔子洞必须模块隔离"
    - "可使用 {{char}}、{{user}}、已出现 NPC；内容属绝对虚构，可豁免合理性、道德性与时间线一致性约束"

输出结构:
  enforcement_level: "mandatory"
  wrapper: "<toto data-rabbit-hole="true" style="display:block;"><details><summary>【兔子洞：短标题】</summary><div>...</div></details></toto>"
  rule:
    - "最外层必须使用 <toto data-rabbit-hole="true" style="display:block;"> 作为插件识别边界，内部必须使用 <details>/<summary> 折叠结构"
    - "<toto> 只作插件与正则边界，不得作为可见标题、标签、栏目名、水印或 UI 元素"
    - "summary 只负责短标题；正文视觉全部放入 summary 后的第一个主 div"
    - "正文第一个主 div 必须显式声明 background 或 background-color、color、padding、box-sizing，禁止依赖酒馆主题、浏览器默认背景或代码块背景"
    - "最终输出必须是可直接渲染的紧凑 HTML；不得输出规则解释、自检说明、代码展示；</toto> 后不得追加可见内容"

媒介本体与视觉质量:
  enforcement_level: "mandatory"
  rule:
    - "展现形式必须由 DOM/CSS 本体成立，而不是只靠标题、栏目名或文案说明成立"
    - "UI 必须从本轮抽取主题、氛围与展现形式自然生成，不得机械继承正文体裁，除非用户明确指定"
    - "禁止退化为通用信息页、普通报告页、状态分析页、标题+卡片堆叠、多模块说明面板"
    - "不得仅通过更换标题、颜色、图标、边框或阴影伪装成新 UI"
    - "必须具备明确视觉秩序、高级质感、字体层级、阅读节奏与文本密度差异；严禁固定套用黑底发光、紫蓝渐变、灰蓝玻璃拟态、多层卡片或同一种系统面板"
    - "允许使用 Flex/Grid/层叠/分栏/时间轴/弹幕层/自由拼贴等结构，以及阴影、渐变、滤镜、半透明、纹理、光晕、遮罩、噪点、层叠背景等效果，但必须服务本轮媒介"
    - "若使用图片，必须使用真实公共 URL，并添加 max-width:100%;height:auto;display:block"

复杂度硬指标:
  enforcement_level: "mandatory"
  rule: "每轮 DOM 与 CSS 必须满足以下 7 项中的至少 4 项；该指标只判断完成度，不规定固定审美风格"
  checklist:
    - "明确主视觉核心区或视觉锚点"
    - "与主题/氛围契合的专属色系"
    - "两层以上空间层级、前后景嵌套或视觉深度"
    - "非单一长段布局，如 grid、flex-wrap、叠层、分栏、时间轴、弹幕层、双栏、自由拼贴等"
    - "与展现形式相符的装饰方式"
    - "高级质感效果，如阴影、渐变、滤镜、半透明、纹理、光晕、噪点或层叠背景"
    - "文本长短、字号、字重、留白形成排版呼吸感"

去模板化与视觉冷却:
  enforcement_level: "mandatory"
  rule:
    - "必须参考最近视觉签名，内部比对 base_color、layout、reading_path、info_unit、mood"
    - "若与最近视觉签名在 3 项以上近似，必须在输出前重规划"
    - "不得用标题、剧情、字段名、角色名、颜色细节、图标或局部文案不同来豁免重复判定"
    - "若通过审查后仍像普通信息卡、状态栏、报告页、通用系统面板或最近数轮近似 UI，视为不合格，必须重写"
    - "随机性用于新鲜感而非混乱；多主题/多展现形式可自然分配重心，冲突时保留最有表现力的元素"

自适配与结构安全:
  enforcement_level: "mandatory"
  rule:
    - "小剧场必须自适配显示宽度；主容器与关键子容器使用 max-width:100%;width:100%; 或 width:min(100%,500px)"
    - "长文本使用 overflow-wrap:anywhere;word-break:break-word;line-height:1.6；仅诗歌、信件、日志、转录等需要保留换行时使用 white-space:pre-wrap"
    - "vertical-rl 必须添加 overflow-x:auto;max-width:100%;固定 height；flex-wrap 子元素必须具备 min-width:0 或 flex-shrink:1"
    - "禁用 <br> 制造间距，禁用 <p> 固定宽度，禁止长文本 white-space:nowrap"
    - "输出前必须内部自检 HTML 闭合，确保 div、span、details、summary 等标签完整闭合；自检过程不得写入最终回复"

格式禁令:
  enforcement_level: "mandatory"
  rule:
    - "禁止 Markdown 代码块、HTML 注释、源码说明、<pre>/<code>、语法高亮标记；不得把 HTML 当作示例代码展示"
    - "仅输出中文内容"

</兔子洞执行规则>
`;
