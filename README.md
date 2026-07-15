# RabbitMirror 0.31.96

- 修复 `this.parentElement`、`this.nextElementSibling` 等链式伪交互：在消息事件到达时立即缓存原始交互程序，并在渲染后安全重绑。
- 增加严格的双层揭示兜底：隐藏 checkbox 位于 label 内、前后两个绝对定位层分别为可见／隐藏时，可恢复“擦开／揭示”类交互。
- “不发送小剧场正则”复制内容改为：`/<toto\b[^>]*>[\s\S]*?<\/toto>\s*/gi`。
- 不修改 Prompt、Visual Scenery、主题库及现有设置结构。
