export const RAW_EXECUTION_RULES = String.raw`
<兔子镜执行规则 v2.2>

执行边界:
  enforcement_level: "mandatory"
  trigger: "主回复完成后，回复最后必须追加完整 <toto data-rabbit-mirror="true" style="display:block;">...</toto> 兔子镜内容"
  summary: "标题可写入主视觉标题区；仅在确实使用 details 时写入 <summary>"
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
  wrapper: "<toto data-rabbit-mirror="true" style="display:block;"><div>...</div></toto>"
  rule:
    - "小剧场最外层必须使用 <toto data-rabbit-mirror="true" style="display:block;"> 作为插件识别边界；内部主体优先使用 <div> 作为主容器，仅当本轮展现形式确实需要翻面、揭示或分段探索时才使用 <details>/<summary>"
    - "<toto> 只作为插件与正则识别边界，不得作为可见标题、标签、栏目名、水印或 UI 元素"
    - "内部 HTML 结构、版式、色彩、层级、视觉锚点必须根据本轮展现形式重新设计"
    - "不提供固定 HTML 模板；任何示例不得固化为固定视觉骨架"
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
    - "像素级完美: 必须使用 Flexbox/Grid 精确对齐，界面需要明确视觉秩序"
    - "盒模型安全: 主容器与关键子容器必须 box-sizing:border-box"
    - "高级质感: 根据本轮展现形式使用 box-shadow、linear-gradient、filter、半透明、光晕、遮罩、纹理、线条、噪点、层叠背景等"
    - "媒介定制: 风格必须从本轮展现形式自然生成，不能退化为常规内容区域或分块说明"
    - "伪差异无效: 不得仅通过更换标题、颜色、图标、边框或阴影伪装新 UI"

  visual_details:
    - "建立清晰字重层级，段落需具备合适 line-height 与 margin，避免均等密度长段堆叠"
    - "采用高对比度文本与语义化色彩，背景色需服务本轮氛围"
    - "根据氛围选择衬线或无衬线字体，允许用字号、字重、字距、留白形成节奏"
    - "不得单一套用同一种底盘、同一种色光组合、同一种内容排列或同一种浅层装饰逻辑"
    - "若使用图片，必须使用真实公共 URL，并添加 max-width:100%;height:auto;display:block"

复杂度硬指标:
  enforcement_level: "mandatory"
  rule: "每轮 DOM 与 CSS 必须同时满足以下 7 项中的至少 4 项；该指标只判断完成度，不规定固定审美风格"
  checklist:
    - "明确的主视觉核心区或视觉锚点"
    - "与本轮主题或氛围契合的专属色系"
    - "两层以上空间层级、前后景嵌套或视觉深度"
    - "非单一长段布局：必须改变内容的空间组织方式、阅读路径或层级关系；不得仅用多个相似内容区域排列来冒充复杂布局"
    - "与本轮展现形式相符的装饰方式，不得硬塞与氛围不符的装饰"
    - "高级质感效果，例如阴影、渐变、滤镜、半透明遮罩、纹理、光晕、噪点或层叠背景"
    - "文本长短交错，字体大小和粗细错落，利用留白形成排版呼吸感"

UI审查重点:
  enforcement_level: "mandatory"
  definition: "UI审查重点只用于输出前自检，不指定可见标题、标签、栏目名、组件顺序、配色或固定版式"
  rule:
    - "具体 UI 形态必须从本轮展现形式自然生成，而不是从审查重点生成"
    - "审查重点用于检查展现形式载体感、媒介语法准确度、高级质感、空间层级、文字密度、阅读节奏、装饰契合度与近期观感去重"
    - "审查时必须判断视觉家族是否与最近数轮近似；即使组件、颜色、标题不同，只要一眼整体观感近似，也视为不合格，必须重写"
    - "若通过审查后整体骨架、阅读路径、信息承载方式或视觉层级仍与近期输出近似，视为不合格，必须重写"

受控随机:
  enforcement_level: "mandatory"
  rule:
    - "随机性用于提高新鲜感，而不是制造混乱"
    - "当本轮抽到多个主题或多个展现形式时，不要求平均分配篇幅，应自然判断表达重心"
    - "融合方式不得固定化，不得每次都采用相同的主次结构、附加结构或装饰方式"
    - "若组合过于冲突，应自动收束为更自然的表达方式，保留最有表现力的元素，弱化其他元素"

交互可用性:
  enforcement_level: "mandatory"
  rule:
    - "不强制每轮都使用可点击结构；若使用交互，必须使用无 JS 的原生可操作结构，例如 details/summary、横向滚动区、锚点跳转或 checkbox/radio + label 状态切换"
    - "禁止依赖 onclick、button 或需要脚本才能生效的伪交互；若看起来可点击，必须真的能改变可见层级、阅读路径或界面状态"
    - "可点击元素必须具备 cursor:pointer；summary 使用 list-style:none；label 与 input 必须使用唯一 id/for 绑定"
    - "absolute 背景、遮罩、光效、装饰层不得覆盖交互，必要时使用 pointer-events:none；交互层使用 position:relative 与更高 z-index"

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

动态反馈与交互:
  enforcement_level: "mandatory"
  rule:
    - "每轮可以具备可感知的动态反馈或交互感，但不强制每轮都使用可点击结构"
    - "动态反馈必须从本轮展现形式的媒介材质和场景逻辑中产生，不得脱离本轮媒介另起一套通用操作面板"
    - "反馈可表现为媒介本体内部的翻动、揭示、滑动、显隐、光影变化、状态反馈或阅读路径变化；只有本轮确实需要选择、探索或分段推进时，才使用可点击/可切换结构"
    - "不得为了满足交互而机械堆叠 <details>/<summary>；折叠结构不能连续成为默认解法"
    - "若使用可点击或可切换结构，必须无需 JS 即可生效，且交互区域不得被装饰层遮挡；summary 需 cursor:pointer 与 list-style:none；checkbox/radio 必须配唯一 id 与 label for；装饰层必要时 pointer-events:none"

明暗关系冷却:
  enforcement_level: "mandatory"
  rule:
    - "不以具体颜色判断好坏，只判断主底盘光源、明暗关系和材质气质是否连续重复"
    - "若近期输出连续偏暗，本轮必须切换主背景气质、光源结构、材质层次与视觉锚点，避免继续复用同类暗色发光骨架"
    - "即使本轮主题偏悬疑、怪谈或神秘，也不得自动退回整页暗底；可以通过留白、纸质、雾面、褪色、微光、局部阴影或高反差局部表达气氛"

</兔子镜执行规则>
`;
