# 兔子洞小剧场 / Rabbit Hole Theater

Toto v0.20.0

## v0.20.0 更新

- 执行规则改为轻量运行版，删除常驻英文 YAML 母本，减少每轮注入 token。
- 中文锁定独立为 `runtimeLanguageRules.js`，常驻注入，但不再重复写入执行规则。
- 塔罗牌图片编号规则独立为 `tarotImageRules.js`，仅在抽到塔罗、牌阵、神秘学占卜、Tarot 相关展现形式时注入。
- 保留 10 轮冷却：主题、展现形式、UI美化构思、版式结构、空间层级与阅读节奏。
- 保留 UI美化构思冷却、受控随机、Visual Scenery 视觉画布、强制启动、正文体裁隔离、自适配与文字安全。
- 删除固定 HTML 模板与 yinuomeme 外层内容。

## 安装

将本仓库放入 SillyTavern 的第三方扩展目录，或通过 Extensions 安装 GitHub 仓库地址。

## 说明

完整主题库与展现形式库仍保存在 `data/raw/` 与 `data/structured/` 中。插件每轮只注入运行必要规则、本轮抽到的主题/展现形式片段、近期 UI美化构思冷却记录，以及必要的条件规则。
