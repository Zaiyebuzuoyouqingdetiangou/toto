# RabbitMirror v0.31.57

基于 v0.31.55。修复交互 ID 同步阶段无条件重写 `<style>` 导致 MutationObserver 循环、CSS `@keyframes` 动画持续重启而表现为静止的问题。

- 不修改 Prompt
- 不修改动态视觉规则
- 不修改交互、背景包裹或代码块急救的功能边界
- 仅在 CSS ID 引用实际变化时更新样式节点
