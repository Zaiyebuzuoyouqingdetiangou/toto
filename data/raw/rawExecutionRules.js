export const RAW_EXECUTION_RULES = String.raw`
<兔子镜执行规则 v2.1>

执行边界:
  enforcement_level: "mandatory"
  trigger: "主回复完成后，回复最后必须追加完整 <toto data-rabbit-hole=\"true\" style=\"display:block;\"> 包裹的 <details> 小剧场"
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
  wrapper: "<toto data-rabbit-hole=\"true\" style=\"display:block;\"><details>...</details></toto>"
  rule:
    - "小剧场最外层必须使用 <toto data-rabbit-hole=\"true\" style=\"display:block;\"> 作为插件识别边界，内部再使用 <details> 折叠模块，并在 <summary> 中显示标题"
    - "<toto> 只作为插件与正则识别边界，不得作为可见标题、标签、栏目名、水印或 UI 元素"
    - "内部 HTML 结构、版式、色彩、层级与视觉锚点必须根据本轮展现形式重新设计"
    - "不提供固定 HTML 模板；任何示例不得固化为固定视觉骨架"
    - "最终输出为可直接渲染的紧凑 HTML，不输出代码块，不解释规则"
    - "小剧场必须完整包裹在 <toto data-rabbit-hole=\"true\" style=\"display:block;\"> 与 </toto> 之间，不得在 </toto> 后追加可见内容"


格式与美感规范:
  enforcement_level: "mandatory"
  design_principles:
    - "像素级完美: 使用 Flexbox/Grid 或其他明确布局方式建立视觉秩序与精确对齐"
    - "盒模型安全: 主容器与关键子容器必须 box-sizing:border-box"
    - "高级质感: 根据本轮展现形式使用阴影、渐变、滤镜、半透明、光晕、遮罩、纹理、线条、噪点或层叠背景"
    - "媒介定制: 风格必须从本轮展现形式自然生成，不能退化为浅层内容承载或重复分区"

  visual_details:
    - "建立清晰字重层级，段落需具备合适 line-height 与 margin，避免均等密度长段堆叠"
    - "采用高对比度文本与语义化色彩，背景色需服务本轮氛围"
    - "根据氛围选择衬线或无衬线字体，允许用字号、字重、字距与留白形成节奏"
    - "不得反复套用同一明暗关系、材质组合、内容分区或视觉骨架"
    - "若使用图片，必须使用真实公共 URL，并添加 max-width:100%;height:auto;display:block"

复杂度硬指标:
  enforcement_level: "mandatory"
  rule: "每轮 DOM 与 CSS 必须同时满足以下 7 项中的至少 4 项；该指标只判断完成度，不规定固定审美风格"
  checklist:
    - "明确的主视觉核心区或视觉锚点"
    - "与本轮主题或氛围契合的专属色系"
    - "两层以上空间层级、前后景嵌套或视觉深度"
    - "非单一长段布局：必须改变内容的空间组织方式、阅读路径或层级关系；不得仅用多个相似内容区域排列来冒充复杂设计"
    - "与本轮展现形式相符的装饰方式，不得硬塞与氛围不符的装饰"
    - "高级质感效果，例如阴影、渐变、滤镜、半透明遮罩、纹理、光晕、噪点或层叠背景"
    - "文本长短交错，字体大小和粗细错落，利用留白形成排版呼吸感"

UI审查重点:
  enforcement_level: "mandatory"
  definition: "UI审查重点只用于输出前自检，不指定可见标题、标签、栏目名、组件顺序、配色或固定版式"
  rule:
    - "具体 UI 形态必须从本轮展现形式自然生成，而不是从审查重点生成"
    - "审查重点用于检查媒介载体感、质感、空间层级、文字密度、阅读节奏、装饰契合度与近期观感去重"
    - "若通过审查后整体骨架、阅读路径、信息承载方式或视觉层级仍与近期输出近似，视为不合格，必须重写"

受控随机:
  enforcement_level: "mandatory"
  rule:
    - "随机性用于提高新鲜感，而不是制造混乱"
    - "当本轮抽到多个主题或多个展现形式时，不要求平均分配篇幅，应自然判断表达重心"
    - "融合方式不得固定化，不得每次采用相同主次结构、附加结构或装饰方式"
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
