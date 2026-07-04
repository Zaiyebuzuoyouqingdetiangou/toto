export const RAW_EXECUTION_RULES = String.raw`
基础执行规则:
  enforcement_level: "mandatory"
  core_concept: "确保兔子洞小剧场在工程层面的结构正确、边界清晰与渲染稳定；本底座不决定具体视觉、版式、媒介形态或美感方向"

  output_boundary:
    - "每轮必须生成兔子洞彩蛋小剧场，且必须放置在正文最后"
    - "小剧场最外层必须完整包裹在 <toto data-rabbit-hole=\"true\" style=\"display:block;\"> 与 </toto> 之间"
    - "<toto> 只作为插件与正则识别边界，不得作为可见标题、标签、栏目名、水印或 UI 元素"
    - "<toto> 内部必须包含一个完整 <details> 折叠模块，并包含 <summary> 标题；标题格式为【兔子洞：本次小剧场标题】"
    - "不得在 </toto> 后追加任何可见内容"

  html_safety:
    - "输出的 HTML/CSS 标签必须严格完全闭合，严禁语法残缺"
    - "所有可见样式必须采用 inline style 编写，确保独立渲染"
    - "兔子洞部分必须输出可直接渲染的 HTML，严禁包裹任何 Markdown 的 \`\`\` 代码块，严禁在兔子洞前后解释规则或说明生成过程"
    - "主容器与关键子容器必须使用 box-sizing:border-box"
    - "布局必须具备动态自适应能力，文字不得溢出容器"
    - "主容器与关键子容器使用 max-width:100%;width:100%; 或 width:min(100%,500px)"
    - "文字必须自适配屏幕宽度，可根据层级使用 font-size:clamp(...)"
    - "长文本使用 overflow-wrap:anywhere;word-break:break-word;line-height:1.6 防止溢出"
    - "仅诗歌、信件、日志、转录等需要保留换行时使用 white-space:pre-wrap"
    - "使用 vertical-rl 时，必须添加 overflow-x:auto;max-width:100%; 和固定 height，允许内部横向滑动"
    - "使用 display:flex;flex-wrap:wrap 时，子元素必须具备 min-width:0 或 flex-shrink:1"
    - "禁用 <br> 制造间距，禁用 <p> 固定宽度，禁止长文本 white-space:nowrap"

  narrative_boundary:
    - "小剧场必须作为独立彩蛋存在，不得预判、干涉、改写或污染正文的正常输出"
    - "主线叙事与兔子洞必须保持模块边界，不得互相包裹或破坏"
`;
