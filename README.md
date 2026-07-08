# 兔子洞小剧场 / Rabbit Hole Theater

Toto v0.31.12

## v0.31.12 更新

- 增加 HTML 注释清理与零宽字符清理，降低 SillyTavern/Markdown 将兔子洞正文误判为代码块的概率。

- 增加 summary 锚点修复：当兔子洞标题已经被渲染、但正文 HTML 被代码块插件显示为源码时，只在聊天消息内把正文拆回真实 HTML，不触碰扩展设置页。

- 兔子洞外层统一使用 `<toto data-rabbit-hole="true" style="display:block;">...</toto>` 作为插件/正则识别边界。
- 设置面板新增「不发送小剧场正则」与「复制推荐正则」按钮，方便手动导入 SillyTavern 正则。
- 继续保留展现形式优先、状态栏隔离、UI审查重点、视觉家族冷却与 10 轮冷却。
- 版本号更新为 v0.30。

推荐正则：

```regex
/<toto\b[^>]*>[\s\S]*?<\/toto>\s*/gi
```

推荐设置：替换留空／勾选 AI输出／勾选 仅格式提示词。

## 安装

将本仓库放入 SillyTavern 的第三方扩展目录，或通过 Extensions 安装 GitHub 仓库地址。

## 说明

完整主题库与展现形式库仍保存在 `data/raw/` 与 `data/structured/` 中。插件每轮只注入运行必要规则、本轮抽到的主题/展现形式片段、UI审查重点，以及必要的条件规则。
