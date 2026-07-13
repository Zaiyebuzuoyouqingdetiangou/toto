# RabbitMirror 0.31.63 — 双急救开关稳定版

基于 0.31.62。

## 本轮变更
- 新增独立“交互急救模式（测试版）”开关，默认关闭。
- 交互急救仅处理兔子镜内部常见的 ID/label/:checked/内联隐藏冲突，不重构背景、布局与配色。
- 可与代码块急救同时开启，固定顺序：代码块恢复真实 DOM → 交互急救。
- 缩减可交互模式的技术细节 Prompt，保留媒介本体、交互价值、清晰反馈与无 JS 底线。
- 保留 0.31.62 的去模板化规则、CSS 动画修复、背景包裹与代码块主容器保护。

## 手机最少替换
- `src/settings.js`
- `src/ui.js`
- `src/outputSanitizer.js`
- `src/promptBuilder.js`

同步版本显示：`manifest.json`。
