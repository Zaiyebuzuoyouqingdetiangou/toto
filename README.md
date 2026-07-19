# RabbitMirror 0.33.8 TEST｜小小维修兔 v1.7 全急救库完整迁移版

本版以 0.33.7 TEST 为唯一基线，只整理本地急救调度，不修改 Prompt、母本或抽取池。

## 本次完成

- 将旧急救能力登记为维修兔内部模块，由当前兔子镜的维修菜单统一调度。
- 新增独立入口：`📃 显示了一堆纯文字`。
- `📄 显示了一堆代码` 与纯文字恢复不再混为同一个用户选项。
- 强制维修会依次运行全部已登记模块，并在完成后重新巡逻。
- 所有维修只作用于当前消息／当前兔子镜的临时显示层，不写回聊天原文、swipe 或 `display_text`。

## 已迁入维修兔的旧急救库

1. 代码块、TH Render、`pre/code/hljs` 外壳恢复。
2. 完整纯文字 `<toto>…</toto>` 恢复。
3. 已渲染兔子镜内部源码块恢复。
4. 原始消息源码临时副本重绘。
5. 损坏 SVG Data URI 保主体恢复。
6. Markdown 破坏 CSS 注释边界修复。
7. CSS、ID、`label for`、radio `name` 作用域隔离。
8. Touch Hover 兜底。
9. checkbox／radio、focus→checked 与 checked 状态增强。
10. 原始安全 ID 状态程序、自变化与 onchange 状态程序。
11. 状态层、相邻隐藏组、label 内隐藏、label 后置结果。
12. CSS 状态兄弟、按钮／可点击后置内容、弹层。
13. 遮罩揭示、列表详情、ID 目标显隐。
14. `data-active`／class 状态程序及 label fallback。

## Token

全部迁移均为本地 JavaScript、DOM 与 CSS 逻辑，不注入模型 Prompt，不增加聊天 token。

## 保留不变

- 101 条主题元素。
- 177 条展现形式。
- Menu QR v2.1。
- RabbitMirror 全链路诊断。
