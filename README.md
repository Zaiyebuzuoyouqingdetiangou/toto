# Extension-RabbitHole / 兔子洞小剧场

这是 SillyTavern 第三方扩展版「兔子洞小剧场」。

## 这版和之前的区别

这版采用“双层规则库”：

```txt
Extension-RabbitHole/
├─ manifest.json
├─ index.js
├─ style.css
├─ README.md
├─ data/
│  ├─ raw/                         # 原始母本，保留你的注释原文
│  │  ├─ rawExecutionRules.js
│  │  ├─ rawThematicCategories.js
│  │  ├─ rawPresentationFormats.js
│  │  └─ rawUniversalExecutionRules.js
│  ├─ structured/                  # 结构化索引，用于随机抽取和防重复
│  │  ├─ thematicIndex.js
│  │  └─ presentationIndex.js
│  └─ safetyPatch.js
└─ src/
   ├─ settings.js
   ├─ storage.js
   ├─ picker.js
   ├─ promptBuilder.js
   ├─ injector.js
   └─ ui.js
```

`data/raw/` 里保存完整原始规则和注释；`data/structured/` 里保存可随机抽取的索引。
默认不会每轮把完整主题库和展现形式库全部塞进 prompt，避免 token 爆炸。

## 安装

1. 把本仓库上传到 GitHub。
2. SillyTavern → Extensions → Install Extension。
3. 粘贴仓库 URL。
4. 安装后刷新页面。

## 使用

不需要在预设里放 `{{rabbit_hole}}`。

插件启用后会通过 `generate_interceptor` 自动注入兔子洞规则，并使用 `setExtensionPrompt` 写入 SillyTavern 的 extension prompt。

## 设置说明

- **Independent**：默认模式。兔子洞不引用、不复述、不暗示主线正文。
- **Canon**：正文衍生模式。允许弹幕、演员回看、后日谈、心理补完等。
- **Raw Policy**：
  - `balanced`：执行规则 + 通用规则 + 本轮抽取条目。推荐。
  - `minimal`：更少注入。
  - `full`：每轮注入完整原始母本，非常占 token。

## 安全补丁

`data/safetyPatch.js` 会以更高优先级覆盖风险条目。原始文本中涉及非自愿、无意识、药物/酒精剥夺意识等内容，仅作为旧分类记录保存在 raw 母本里，不会按原意执行。
