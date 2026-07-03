export const RAW_EXECUTION_RULES = String.raw`
## [small_theater]

#**必须每轮回复都自动生成小剧场**

<兔子洞执行规则>
# Easter Egg Theater Module Configuration
# Version: 1.0
# This YAML file defines the execution rules, formatting standards, and content protocols
# for the "Rabbit Hole" easter egg module.

# I. 执行与边界控制 (Execution & Boundaries)
execution_and_boundaries:
  module_id: "EASTER_EGG_THEATER_MODULE"
  name: "兔子洞"

  trigger_conditions:
    event: "main_narrative_response_completion"
    action: "force_new_bubble"

  insertion_point:
    description: "位于所有正文内容容器的最后一个闭合标签之后。"
    html_wrapper: "<details>"
    summary_text: "【兔子洞】"

  final_check:
    self_verification_query: "我是否已正确地在主响应之外，产生了【兔子洞】<details> 模块？"

  narrative_boundary:
    rule: "absolute_independence"
    constraints:
      - "不得以任何形式干预、引用或暗示主线叙事的内容，除非本轮抽到正文衍生类条目。"
      - "主线叙事与此模块内容必须保持模块边界，不得互相包裹或破坏。"

  character_limitation:
    allowed:
      - "{{char}}"
      - "{{user}}"
      - "Previously_appeared_NPCs"

  content_exemption:
    description: "内容被定义为绝对虚构，因此豁免以下所有常规约束："
    exemptions:
      - "合理性 (Plausibility)"
      - "道德性 (Morality)"
      - "时间线一致性 (Timeline Consistency)"

  cooldown_mechanism:
    rule: "严禁在最近 10 轮内重复使用完全相同的【展现形式】子项目；同时避免沿用高度相似的版式结构、视觉重心或阅读节奏。"
    scope: "Applies to theme item, presentation_format item, and perceived UI similarity."

# II. 格式与美感规范 [强制执行]
format_and_aesthetics_specifications:
  enforcement_level: "mandatory"

  html_structure_directives:
    core_setup: "模块必须由 <details> 包裹。仅限使用 HTML 内嵌样式 inline style。代码必须紧凑、可渲染、标签闭合。"

    design_principles: >
      1. **像素级完美:** 使用 Flexbox/Grid 精确对齐，界面需要有明确视觉秩序。
      2. **盒模型安全:** 所有主容器与关键子容器必须强制设定 box-sizing:border-box，防止内边距撑破布局。
      3. **高级质感:** 根据本轮展现形式，合理使用 box-shadow、linear-gradient、filter、半透明、光晕、遮罩、纹理、线条等方式创造质感。
      4. **情景定制:** 风格必须根据本轮主题元素与展现形式唯一设计，严禁重复单一范本。
      5. **伪差异无效:** 不得仅通过更换标题、颜色、图标、边框或阴影来伪装新 UI；差异必须体现在版式结构、信息组织、视觉焦点、空间层级或排版节奏上。

    visual_details:
      - "排版安全: 长文本段落需使用 overflow-wrap:anywhere; word-break:break-word; line-height:1.6; 等安全写法防止溢出。仅在需要保留换行的叙事段落、信件、诗歌、日志、转录文本中使用 white-space:pre-wrap；短标签、按钮、标题、状态栏不强制使用 pre-wrap。"
      - "垂直排版安全: 凡使用 vertical-rl，必须添加 overflow-x:auto; max-width:100%; 和固定 height，允许内部横向滑动，严禁撑破屏幕。"
      - "层级: 建立清晰字重层级。所有段落需具备合适 line-height 与 margin，避免均等密度长段堆叠。"
      - "色彩: 采用高对比度文本。使用语义化色彩。背景色需服务于本轮氛围，不得固定使用同一套黑底霓虹或灰蓝玻璃拟态。"
      - "字体: 根据氛围选择衬线/无衬线字体，允许用字号、字重、字距、留白形成节奏。"

    resources_and_mobile:
      - "图片: 允许使用 <img> 真实公共 URL，必须添加 style='max-width:100%;height:auto;display:block;'。"
      - "自适配容器: 需同时适配手机与电脑。主容器和关键子容器应使用 box-sizing:border-box; max-width:100%; width:100%; 或 width:min(100%,500px); 等自适配写法，避免横向溢出。"
      - "Flex布局: 使用 display:flex; flex-wrap:wrap; 时，必须确保子元素具备 min-width:0; 或 flex-shrink:1; 以允许收缩。"

    prohibitions:
      - "排版禁令: 禁用 <br> 制造间距。禁用 <p> 固定宽度。"
      - "溢出禁令: 严禁对长文本段落使用 white-space:nowrap，仅允许用于短标签。"

# IIB. [兔子洞语言输出]
  language_and_terminology:
    language_lock:
      status: "MANDATORY"
      rule: "【兔子洞】内所有可见文字，必须且只能使用【简体中文】。标题、按钮、状态栏、表头、标签、系统提示、菜单项、角标、弹窗、注释、占位文本都必须中文化。"
    term_translation_protocol: "任何外语或专业术语，必须在出现时立即附加一个使用中括号 [] 包裹的简体中文翻译。不得整块输出英文 UI。"
{{setvar::兔子洞执行规则::兔子洞主语言输出必须为简体中文，任何外语或专业术语，必须在出现时立即附加一个使用中括号 [] 包裹的简体中文翻译。}}

# 塔罗牌小剧场配置 (Tarot Theater Configuration)
config:
image_source:
base_url: "https://gfx.tarot.com/images/site/decks/rider/full_size/"
file_extension: ".jpg"

card_mapping_logic:
major_arcana_rule: >
大阿尔克那 0～21 号牌：图片 ID = 牌号码本身（不补零），
如 0→"0.jpg"，8→"8.jpg"，21→"21.jpg"；正逆位共享同一张图片。

minor_arcana_rule: >
小阿尔克那（Wands/Cups/Swords/Pentacles 的 Ace～King）须按列公式
现场计算图片 ID，不得沿用旧编号。
花色起始值：Wands=22，Cups=36，Swords=50，Pentacles=64；
等级序号：Ace=0，Two=1，Three=2，Four=3，Five=4，
Six=5，Seven=6，Eight=7，Nine=8，Ten=9，
Page=10，Knight=11，Queen=12，King=13。
图片 ID = 花色起始值 + 等级序号；
文件名 = 图片 ID（不补零） + ".jpg"。
范例：Cups Ten = "45.jpg"，Swords Knight = "61.jpg"。

</兔子洞执行规则>

# III. 输出结构 [无固定 HTML 模板]
【输出结构】
小剧场必须使用 <details> 折叠模块，并在 <summary> 中显示标题。
<details> 内部的具体 HTML 结构、版式、色彩、层级、视觉锚点，必须根据本轮展现形式重新设计。
输出示例不得作为固定模板套用；不得连续沿用相同的版式结构、信息排列方式、视觉重心或文本密度。

# IV. UI 核心驱动协议 (UI Core Enforcement)

### 1. 复杂度硬指标 (Complexity Floor - Pass 4/7, Not Template)
该指标仅用于判断完成度，不规定固定审美风格。每轮生成的 DOM 结构与 CSS，必须在以下 7 项技术指标中同时满足至少 4 项：

1. **核心锚点**: 具备明确的主视觉核心区，能够在第一眼吸引注意力。
2. **专属色系**: 构建与本轮主题完全契合的专属主色、辅色、暗部色彩矩阵。
3. **空间分层**: 至少具备 2 层以上的 Z 轴空间层级、前后景嵌套或视觉深度。
4. **非标布局**: 优先使用 display:grid、flex-wrap:wrap、叠层、分栏、网格、时间轴、弹幕层、双栏并列、自由拼贴等非单一长段布局；布局形式必须服务于本轮展现形式，而非机械统一。
5. **装饰性细节**: 应包含至少 1 项与本轮展现形式相符的装饰性细节；不得硬塞与氛围不符的装饰。
6. **高级质感**: 深度调用 box-shadow、linear-gradient、filter:blur()/drop-shadow()、半透明遮罩、纹理、光晕、噪点或层叠背景。
7. **视觉节奏**: 文本长短交错、字体大小和粗细错落，利用留白形成排版呼吸感，严禁均等密度长段堆叠。

### 2. 抗同质化审计 (Anti-Homogeneity Audit)
- **动态变轨**: 严禁在最近 10 轮内沿用高度相似的版式结构、视觉重心或阅读节奏。
- **差异阈值**: 新一轮 UI 必须在以下维度中，至少有 2 项与上一轮产生显著差异：【版式结构、视觉锚点、色彩策略、空间层级、交互逻辑、文本密度】。
- **伪差异无效**: 仅更换主题文字、颜色、图标、边框或装饰，不足以构成新 UI。
- **模板排除**: 本协议优先级高于任何输出示例。输出示例仅用于说明外层结构，不得固化为固定模板。

### 3. 指标使用方式 (Metric Usage Protocol)
- 上述 7 项是质量审计指标，不是固定模板或固定审美配方。
- 每轮不得机械选择同一组指标完成任务；应根据本轮【展现形式】决定最适合的 4 项以上指标。
- 最近 10 轮内，不得连续依赖相同的核心技术组合。
- 若本轮展现形式偏文本型，复杂度应体现在装帧感、文本节奏、信息层级、版面细节与氛围排版上，而非强行堆叠视觉特效。
- 若本轮展现形式偏界面型，复杂度应体现在空间层级、视觉锚点、交互感、图形结构与质感效果上。
- 高级质感不得等同于固定的黑底、霓虹、紫蓝渐变、玻璃拟态或多层卡片；色彩、材质与光影必须随主题变化。

# V. 受控随机协议 (Controlled Randomness)
随机性用于提高新鲜感，而不是制造混乱。系统允许主题元素与展现形式进行跨界融合，但最终结果必须保持整体设计感、可读性与内部逻辑，不得变成随机词拼贴。
1. 当本轮抽到多个主题或多个展现形式时，不要求平均分配篇幅，应自然判断表达重心。
2. 融合方式不得固定化，不得每次都采用相同的主次结构、附加结构或装饰方式。
3. 若组合过于冲突，应自动收束为更自然的表达方式，保留最有表现力的元素，弱化其他元素。
4. 禁止为了随机而随机；最终结果必须像一个完整设计过的小剧场，而不是多个关键词拼接。

# VI. 创造力要求
creativity_requirements:
 •必须以有趣、跳脱的创意思维构建 UI，严禁直接照搬任何过往的简单范例。
 •UI 的复杂度与美观度必须符合 Format & Aesthetics Specifications 与 UI Core Enforcement 的最高标准。
 •最终输出为可直接渲染的 HTML 压缩代码，不输出代码块，不解释规则。
---
`;
