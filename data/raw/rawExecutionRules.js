export const RAW_EXECUTION_RULES = String.raw`
## [small_theater]

#**必须每轮回复都自动生成小剧场**

<兔子洞执行规则>
# Easter Egg Theater Module Configuration
# Version: 1.0
# This YAML file defines the execution rules, formatting standards, and content protocols
# for the "Nono's Rabbit Hole" easter egg module.

# I. 执行与边界控制 (Execution & Boundaries)
execution_and_boundaries:
  module_id: "EASTER_EGG_THEATER_MODULE" # 模块的唯一标识符
  name: "兔子洞" # 模块的显示名称

  trigger_conditions:
    event: "main_narrative_response_completion" # 触发事件：在主叙事回应完成后
    action: "force_new_bubble" # 触发行为：强制产生一个新的对话气泡

  insertion_point:
    description: "位于所有正文内容容器的最后一个 </div> 标签之后。"
    html_wrapper: "<details>" # 使用 <details> 标签作为最外层容器
    summary_text: "【兔子洞】" # <details> 标签的标题

  final_check:
    # 最终检查：模型在生成后需要进行的自我核查步骤
    self_verification_query: "我是否已正确地在主响应之外，产生了【兔子洞】<details> 模块？"

  narrative_boundary:
    # 叙事边界：确保模块内容的独立性
    rule: "absolute_independence"
    constraints:
      - "不得以任何形式干预、引用或暗示主线叙事的内容。"
      - "主线叙事与此模块内容必须完全隔离。"

  character_limitation:
    # 角色限制：定义允许在模块中出现的角色范围
    allowed:
      - "{{char}}"
      - "{{user}}"
      - "Previously_appeared_NPCs" # 仅限在主叙事中已经登场的 NPC

  content_exemption:
    # 内容豁免：给予模块内容创作上的绝对自由
    description: "内容被定义为绝对虚构，因此豁免以下所有常规约束："
    exemptions:
      - "合理性 (Plausibility)"
      - "道德性 (Morality)"
      - "时间线一致性 (Timeline Consistency)"

  cooldown_mechanism:
    # 冷却机制：防止重复使用相同的视觉表现形式
    rule: "严禁连续 2 轮使用完全相同的【展现形式】子项目。"
    scope: "Applies to the direct children of the 'presentation_format' key in the implementation logic."

  
# II. 格式与美感规范 [强制执行]
format_and_aesthetics_specifications:
  enforcement_level: "mandatory"
  
  html_structure_directives:
    # [核心：容器与渲染方式]
    core_setup: "模块需由 <details> 或 <div> 包裹。仅限使用 HTML 内嵌样式 (inline style)。代码必须紧凑无空格。"
    
    # [设计原则：高保真、定制化、像素级]
    design_principles: >
      1. **像素级完美:** 使用 Flexbox/Grid 精确对齐。
      2. **盒模型安全:** 所有容器必须强制设定 'box-sizing: border-box;' 以防止内边距撑破布局。
      3. **高级质感:** 利用 box-shadow (多层模拟Z轴), linear-gradient, filter 创造质感。
      4. **情景定制:** 风格须根据内容唯一对应，严禁重复单一范本。
    
    # [视觉细节：排版与色彩] - *此处已修复溢出问题*
    visual_details:
      - "排版安全: 所有文本容器强制添加 'word-wrap: break-word; white-space: pre-wrap;' 以确保文本自动换行，严禁溢出。"
       - "垂直排版安全: 凡使用 'vertical-rl'，必须添加 'overflow-x: auto; max-width: 100%;' 和固定 'height'，允许内部横向滑动，严禁撑破屏幕。"
      - "层级: 建立清晰字重层级。所有 <p> 标签强制设定 'line-height: 1.6; margin: 0 0 12px 0;'。"
      - "色彩: 采用高对比度文本。使用语义化色彩（Semantic Color）。背景色需柔和。"
      - "字体: 根据氛围选择衬线/无衬线字体。"
    
    # [资源与适配：图片与手机] - *此处强化了宽度限制*
    resources_and_mobile:
      - "图片: 允许使用 <img> (真实公共URL)，必须添加 style='max-width:100%; height:auto; display:block;'。"
      - "手机适配: 严格遵从 Mobile-First。主容器和所有子容器必须设置 'max-width: 100%;'。"
      - "Flex布局: 使用 'display: flex; flex-wrap: wrap;' 时，必须确保子元素具备 'min-width: 0;' 或 'flex-shrink: 1;' 以允许收缩。"

    # [禁令：红线]
    prohibitions:
      - "排版禁令: 禁用 <br> 制造间距。禁用 <p> 固定宽度。"
      - "溢出禁令: 严禁对长文本段落使用 'white-space: nowrap' (仅允许用于短标签)。"

#IIB. [兔子洞语言输出]
  language_and_terminology:
    language_lock:
      status: "MANDATORY"
      rule: "【兔子洞】内所有输出的文字，必须且只能使用【简体中文】。"
    term_translation_protocol: "任何外语或专业术语，必须在出现时立即附加一个使用中括号 \`[]\` 包裹的简体中文翻译。"
{{setvar::兔子洞执行规则::兔子洞主语言输出必须为简体中文，任何外语或专业术语，必须在出现时立即附加一个使用中括号 \`[]\` 包裹的简体中文翻译。}}

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

IV. [创造力与输出格式]
  creativity_requirements:
 •必须以有趣、跳脱的创意思维构建 UI,严禁直接照搬任何过往的简单范例
 •UI 的复杂度与美观度必须符合 'Format & Aesthetics Specifications' 中的最高标准.
• 最终输出格式(HTML 压缩代码)
<输出格式>
####**输出格式如下**你必须完整地显示完整格式：
{    
<yinuomeme>
<details>
<summary>【兔子洞：{{本次小剧场标题}}】</b></summary>
 <!-- 步骤一：套用「容器宽度协议」到最外层div,并遵守[最高内部权限指令] 语言锁定 (简体中文)生成 -->
 <div style="background-color:#f8f9fa; border:1px solid #dee2e6; border-radius:8px; padding:20px; max-width:500px; margin:auto; position:relative;">

 <!-- 若有深度交互需求，可在此处插入 <style> 与 <script> 标签 -->
 
 <!-- 步骤二：套用「段落排版协议」到所有p卷标 -->
 <p style="font-size:14px; line-height:1.6; margin:0 0 12px 0;">
 这是第一段内容。它的宽度会根据外部容器的500px最大宽度自动调整，在手机上则会填满屏幕，看起来非常自然。 
</p >

 <p style="font-size:14px; line-height:1.6; margin:0 0 12px 0;">
 这是第二段内容，同样遵循排版协议，确保了与上一段之间有12px的清晰间距，并且行高为1.6，阅读起来毫不费力。 
</p >
 </div>
</details>

</输出格式>
---
`;
