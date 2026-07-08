# 兔子洞小剧场 / Rabbit Hole Theater

Toto v0.31.15

## v0.31.15 更新

本版在 v0.31.14 基础上进行保守精简：压缩 `RAW_EXECUTION_RULES` 中重复的基础执行规则，保留媒介本体、复杂视觉结构、显式背景、HTML 闭合自检、视觉骨架冷却、受控随机与自适配要求。格式防御继续由 sanitizer 兜底，避免在 prompt 中重复堆叠同类禁令。


- 增加 HTML 注释清理与零宽字符清理，降低 SillyTavern/Markdown 将兔子洞正文误判为代码块的概率。

- 增加 summary 锚点修复：当兔子洞标题已经被渲染、但正文 HTML 被代码块插件显示为源码时，只在聊天消息内把正文拆回真实 HTML，不触碰扩展设置页。

- 兔子洞外层统一使用 `<toto data-rabbit-hole="true" style="display:block;">...</toto>` 作为插件/正则识别边界。
- 设置面板新增「不发送小剧场正则」与「复制推荐正则」按钮，方便手动导入 SillyTavern 正则。
- 继续保留展现形式优先、状态栏隔离、UI审查重点、视觉家族冷却与 10 轮冷却。
- 新增主容器显式背景/文字色要求，降低黑底继承或白底反转问题。
- 新增 HTML 结构完整性自检规则，但不进行自动补标签，避免插件擅自改坏 DOM。
- 版本号更新为 v0.31.15。

推荐正则：

```regex
/```(?:html|xml|javascript|js|css)?\s*<toto\b[^>]*>[\s\S]*?<\/toto>\s*```|<toto\b[^>]*>[\s\S]*?<\/toto>\s*/gi
```

推荐设置：替换留空／勾选 AI输出／勾选 仅格式提示词。

## 安装

将本仓库放入 SillyTavern 的第三方扩展目录，或通过 Extensions 安装 GitHub 仓库地址。

## 说明

完整主题库与展现形式库仍保存在 `data/raw/` 与 `data/structured/` 中。插件每轮只注入运行必要规则、本轮抽到的主题/展现形式片段、UI审查重点，以及必要的条件规则。

### v0.31.15 说明

- 保守精简基础执行规则，减少重复 token。
- 保留媒介本体、高级质感、复杂度硬指标、视觉冷却与自适配安全规则。
- sanitizer 继续处理 HTML 注释、Markdown 代码块、pre/code、语法高亮 class 与多余空行。
