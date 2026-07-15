# Rabbit Mirror Theater 0.31.97

本版以用户上传的「7.15最满意.zip」（0.31.94）为底包。

保留：
- Visual Scenery 原规则
- Visual Scenery 交互联动提示词
- 主题库、展现形式库、孵化模式与其他 Prompt
- 代码块急救与既有智能交互急救

修复：
- 当 checkbox/radio 隐藏在 label 内，且原始 onclick 使用 `this.parentElement`、`this.nextElementSibling` 等安全相对节点链时，急救器改为监听 input/change 状态事件。
- 兼容 RabbitMirror 既有 label fallback：该 fallback 会阻止原生 click 并手动派发 input/change，因此旧版只绑定 click 的方案无法生效。
- 若宿主渲染前移除了 onclick，会继续从当前助手消息的原始 HTML 回读并按 DOM 路径绑定。

未增加或修改任何 Prompt。
