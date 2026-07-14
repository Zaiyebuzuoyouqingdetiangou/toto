# RabbitMirror 0.31.90

## Visual Scenery 名称与语义恢复

- 设置面板中的“动态视觉模式”改名为 `Visual Scenery`。
- 内部设置键仍为 `force_visual_scenery`，旧勾选状态可继续继承。
- 恢复 7.10 的原始含义：Visual Scenery 首先是 CSS 视觉画布，动画只是可按画面需要自然使用的表现手段之一。
- 移除 0.31.89 新增的“必须自动持续动画 / 必须 @keyframes + animation”硬性兑现规则。

## 保留内容

- 0.31.88 的默认交互与探索规范。
- 0.31.89 的 checkbox/radio `onchange` 多目标伪交互急救。
- 代码块急救与原有智能交互急救。
- 完整主题库、展现形式库与正式版设置结构。

## 未改动

- `src/outputSanitizer.js`
- `src/settings.js`
- `src/injector.js`
- `src/picker.js`
- `src/storage.js`
- `src/visualScanner.js`
- `index.js`
- `style.css`
