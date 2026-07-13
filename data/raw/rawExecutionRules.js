export const RAW_EXECUTION_RULES = String.raw`
## [small_theater]
# 必须每轮回复都自动生成小剧场

<兔子镜执行规则 v2.1>

执行边界:
  enforcement_level: "mandatory"
  trigger: "主回复完成后，回复最后必须追加完整 <toto data-rabbit-mirror="true" style="display:block;"> 包裹的 <details> 小剧场"
  summary: "标题写入 <summary>，格式为【兔子镜：本次小剧场标题】"
  narrative_boundary:
    - "不得以任何形式干预或改写主线叙事内容"
    - "主线叙事与兔子镜必须保持模块边界，不得互相包裹或破坏"
  characters: ["{{char}}", "{{user}}", "已出现 NPC"]
  exemption: "兔子镜内容属于绝对虚构，可豁免合理性、道德性与时间线一致性约束"

正文体裁隔离:
  enforcement_level: "mandatory"
  rule:
    - "兔子镜不得机械继承当前正文、用户指令或现实任务的文本体裁"
    - "小剧场的展现形式必须以本轮抽取结果为准；除非用户指定，否则不得借用当前正文体裁"

输出结构:
  enforcement_level: "mandatory"
  wrapper: "<toto data-rabbit-mirror="true" style="display:block;"><details>...</details></toto>"
  rule:
    - "小剧场最外层必须使用 <toto data-rabbit-mirror="true" style="display:block;"> 作为插件识别边界，内部再使用 <details> 折叠模块，并在 <summary> 中显示标题"
    - "<toto> 只作为插件与正则识别边界，不得作为可见标题、标签、栏目名、水印或 UI 元素"
    - "内部 HTML 结构、版式、色彩、层级、视觉锚点必须根据本轮展现形式重新设计"
    - "不提供固定 HTML 模板；任何示例不得固化为固定卡片模板"
    - "最终输出为可直接渲染的紧凑 HTML，不输出代码块，不解释规则"
    - "小剧场最外层必须完整包裹在 <toto data-rabbit-mirror="true" style="display:block;"> 与 </toto> 之间，禁止遗漏闭合标签；不得在 </toto> 后追加任何可见内容"

去模板化冷却:
  enforcement_level: "mandatory"
  scope: ["主题", "展现形式", "视觉观感", "版式结构", "空间层级", "阅读节奏"]
  rule:
    - "最近 10 轮内严禁重复相同主题、展现形式或近似视觉观感"
    - "仅更换标题、数值、颜色、图标、边框或装饰，不构成新的 UI"
    - "判定重复时，不以主题、标题、角色名或台词为准，而以实际观感为准"

格式与美感规范:
  enforcement_level: "mandatory"
  design_principles:
    - "视觉秩序: 根据本轮媒介选择合适布局，确保对齐、间距、层级与自适配关系清晰，不强制固定布局技术"
    - "盒模型安全: 主容器与关键子容器必须 box-sizing:border-box"
    - "材质完成度: 通过与本轮媒介相符的色彩、表面、光影、边界与空间关系形成质感，不得机械堆叠固定效果清单"
    - "媒介定制: 风格必须从本轮展现形式自然生成，不能退化为通用信息卡、状态面板或分块说明"
    - "伪差异无效: 不得仅通过更换标题、颜色、图标、边框或阴影伪装新 UI"

  visual_details:
    - "建立清晰字重层级，段落需具备合适 line-height 与 margin，避免均等密度长段堆叠"
    - "文字与背景须保持清晰可读；配色由本轮媒介与氛围决定，不得把黑灰、深蓝或低亮渐变当作默认高级感"
    - "根据氛围选择衬线或无衬线字体，允许用字号、字重、字距、留白形成节奏"
    - "画面须形成主色、辅助色与局部强调关系；若近期明暗、色温或饱和结构近似，本轮必须改变整体色彩关系，不得只换强调色"
    - "若使用图片，必须使用真实公共 URL，并添加 max-width:100%;height:auto;display:block"

完成度底线:
  enforcement_level: "mandatory"
  rule:
    - "每轮必须在主视觉、空间组织、媒介质感、排版节奏与内容承载之间形成完整且相互支持的设计，不得退化为纯文字流或同构卡片堆叠"
    - "复杂度来自本轮媒介自身需要，而不是机械凑齐固定 CSS 属性、层级数量、装饰数量或组件清单"
    - "若移除标题和说明文字后无法从轮廓、空间、材质与阅读方式辨认本轮展现形式，则完成度不合格，必须重写"

UI审查重点:
  enforcement_level: "mandatory"
  definition: "UI审查重点只用于输出前自检，不指定可见标题、标签、栏目名、组件顺序、配色或固定版式"
  rule:
    - "具体 UI 形态必须从本轮展现形式自然生成，而不是从审查重点生成"
    - "审查重点用于检查展现形式载体感、媒介语法准确度、高级质感、空间层级、文字密度、阅读节奏、装饰契合度与近期观感去重"
    - "审查时必须判断视觉家族是否与最近数轮近似；即使组件、颜色、标题不同，只要一眼整体观感近似，也视为不合格，必须重写"
    - "若通过审查后仍像普通信息卡、状态栏、报告页、通用系统面板或最近10轮近似 UI，则视为不合格，必须重写"

受控随机:
  enforcement_level: "mandatory"
  rule:
    - "随机性用于提高新鲜感，而不是制造混乱"
    - "当本轮抽到多个主题或多个展现形式时，不要求平均分配篇幅，应自然判断表达重心"
    - "融合方式不得固定化，不得每次都采用相同的主次结构、附加结构或装饰方式"
    - "若组合过于冲突，应自动收束为更自然的表达方式，保留最有表现力的元素，弱化其他元素"

自适配与文字安全:
  enforcement_level: "mandatory"
  rule:
    - "小剧场必须采用自适配布局，根据当前显示宽度自动调整容器、字号、间距与排列方式"
    - "主容器与关键子容器使用 max-width:100%;width:100%; 或 width:min(100%,500px)"
    - "文字必须自适配屏幕宽度，可根据层级使用 font-size:clamp(...)"
    - "长文本使用 overflow-wrap:anywhere;word-break:break-word;line-height:1.6 防止溢出"
    - "仅诗歌、信件、日志、转录等需要保留换行时使用 white-space:pre-wrap"
    - "使用 vertical-rl 时，必须添加 overflow-x:auto;max-width:100%; 和固定 height，允许内部横向滑动"
    - "使用 display:flex;flex-wrap:wrap 时，子元素必须具备 min-width:0 或 flex-shrink:1"
    - "禁用 <br> 制造间距，禁用 <p> 固定宽度，禁止长文本 white-space:nowrap"

</兔子镜执行规则>
`;
