# Extension-RabbitHole

SillyTavern 第三方扩展：每轮在主回复末尾追加一个 `<toto><details>` 兔子洞小剧场。

## 本版说明

- 无副 API：兔子洞跟随主模型生成。
- 正则边界：`<toto data-rabbit-hole="true" style="display:block;">...</toto>`。
- 已关闭富版式关键词加权，避免抽取被“界面/面板/直播”等列举词推向通用系统面板。
- 已整理规则职责，减少重复与互相抢权：
  - `rawExecutionRules.js`：只管工程底座、边界、闭合、自适应、不代码块。
  - `formatPriorityRules.js`：管展现形式优先，决定 UI 像什么与怎么读。
  - `uiAuditRules.js`：管美感与完成度审查，不提供固定模板。
  - `visualFamilyCooldownRules.js`：管视觉家族冷却、通用面板骨架否决、技术指标反劫持。

## 推荐正则

```regex
/<toto\b[^>]*>[\s\S]*?<\/toto>\s*/gi
```

设置：替换留空／勾选 AI输出／勾选 仅格式提示词。
