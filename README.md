# RabbitMirror 0.31.72

智能交互急救实验版：先识别交互类型，再选择 checked、触摸 hover、嵌套 details 或 :target 修复路径。与代码块急救同时开启时，固定先恢复真实 DOM，再运行交互急救。未修改 Prompt、审美规则、动画规则或已有 UI。


## v0.31.82
- 修复 v0.31.74 `outputSanitizer.js` 中动态正则字符串反斜杠丢失导致的 ES 模块语法错误。
- 保留 v0.31.74 的属性选择器 ID 同步修复；未改动 Prompt、UI 结构或其他运行逻辑。
