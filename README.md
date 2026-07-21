# RabbitMirror 0.33.38 TEST｜挨打猫单图标缓存修复版

- 根目录保持正常结构：`index.js`、`style.css`、`manifest.json`。
- manifest 仅通过查询参数强制请求最新 JS/CSS，不新增版本化根文件。
- 新运行时会移除旧版本按钮，只创建一个普通 `🐈`。
- JS 运行时强制关闭旧缓存 CSS 的 `::before` / `::after`，避免再次出现双猫或黑方块。
- 未修改 RabbitMirror 固定 Prompt、主题池、展现形式池或挨打猫反馈内容。
