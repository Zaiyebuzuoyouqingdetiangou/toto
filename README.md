# RabbitMirror 0.31.91

本版以 **0.31.90 Visual Scenery 原义恢复版**为底座，仅扩展智能交互急救。

新增支持在当前兔子镜范围内安全转换以下伪交互：

- `document.getElementById(...).style.xxx = ...`
- `document.getElementById(...).innerText = ...`
- `document.getElementById(...).textContent = ...`

急救器不会执行模型生成的 JavaScript，也不使用 `eval`；只有整段脚本均由可确认的目标样式/文字赋值组成时才会接管。Visual Scenery、Prompt、完整主题库、代码块急救和设置逻辑均未修改。

详细变更见 `README-0.31.91.md`。
