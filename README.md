# Extension-RabbitHole / 兔子洞小剧场

SillyTavern 第三方扩展版「兔子洞小剧场」。

## 当前版本：一体化低 token + 设置界面 Toto 水印版

这一版不需要在原预设里放 `{{rabbit_hole}}`。插件会在生成前自动临时注入兔子洞规则，并要求模型在**主回复正文最底部**追加 `<details>` 兔子洞模块。

本版重点：

- 兔子洞作为一个整体协议自动运行，不再拆成多个模式给用户手选。
- 完整原始四大模块保存在 `data/raw/`，保留注释原文。
- 结构化随机索引保存在 `data/structured/`，用于每轮随机抽取和防重复。
- 默认采用低 token 注入：不每轮塞完整原始大库，只注入核心协议 + 本轮抽到的主题/展现形式。
- 每轮自动抽取 1～3 个主题元素、1～2 个展现形式。
- 抽到正文衍生类条目时，自动使用正文衍生分支；其他情况按独立兔子洞执行。
- `Toto` 水印显示在插件设置界面，不再要求生成进兔子洞小剧场。
- 不追加额外安全补丁；边界由你的主预设/原预设自行处理。

## 文件结构

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
│  └─ safetyPatch.js               # 保留占位，不默认注入
└─ src/
   ├─ settings.js
   ├─ storage.js
   ├─ picker.js
   ├─ promptBuilder.js
   ├─ injector.js
   └─ ui.js
```

## 安装

1. 解压本插件。
2. 把 `Extension-RabbitHole` 文件夹内的内容上传到 GitHub 仓库根目录。
3. SillyTavern → Extensions → Install Extension。
4. 粘贴仓库 URL。
5. 安装后刷新页面。

仓库根目录应直接看到：

```txt
manifest.json
index.js
style.css
README.md
data/
src/
```

不要把 zip 上传，也不要多套一层文件夹。

## 使用

不需要在预设里放任何占位符。

插件启用后会通过生成前拦截自动注入兔子洞规则，并用 SillyTavern 的 extension prompt 临时写入；不会修改角色卡，也不会写入你的预设。

## 设置说明

界面保留以下开关：

- 启用兔子洞自动注入：总开关。
- 输出 `<thinking>` 执行摘要：测试时可开，正式使用建议关闭以节省输出空间。注意它是可见执行摘要，不是隐藏思维链。
- 避免连续重复主题/展现形式：对应冷却机制。
- 跳过 quiet 后台生成：避免污染后台摘要等功能。
- 跳过 impersonate 生成：避免模拟用户发言时生成兔子洞。
- 控制台调试日志：排错用。

## Token 说明

插件保存完整原文不会自动省 token。真正省 token 的方式是：完整原文留在 `data/raw/` 当母本，不每轮发送；每轮只注入核心执行协议和本轮抽到的少量条目。

当前默认就是这个低 token 逻辑。

## Toto 水印

本版将 `Toto` 水印显示在插件设置界面，不再要求模型把 `Toto` 写进生成的小剧场。


## VNext: 完整执行规则 + 通用核心 + ID → 母本片段检索

本版采用“结构化索引 = 目录，data/raw = 母本正文”的方式运行：

1. 每轮先从 `data/structured/` 抽取主题 ID 和展现形式 ID。
2. 插件再根据 ID 到 `data/raw/` 中检索对应完整原文片段。
3. 实际注入 prompt 的不是完整大库，而是“核心执行协议 + 本轮抽中 ID 对应的母本完整描述”。
4. 因此完整原文可长期保存在插件里，平时不会整库占 token。

如果某个 ID 在母本中找不到完全匹配，插件会自动回退到结构化索引里的 `raw` 字段，避免注入失败。


## 当前注入策略

本版采用低 token 但保留 UI 强度的策略：

- `rawExecutionRules.js`：每轮完整注入，保留格式、美感、语言、输出位置等强约束。
- 通用执行规则：每轮只注入精简核心版，避免长范例占 token。
- 主题元素：先从结构化索引抽 ID，再到 `data/raw/rawThematicCategories.js` 检索对应母本片段，只注入本轮抽中的片段。
- 展现形式：先从结构化索引抽 ID，再到 `data/raw/rawPresentationFormats.js` 检索对应母本片段，只注入本轮抽中的片段。
- 防重复：由插件代码执行，不依赖模型自觉随机。
- Toto：只显示在插件设置界面，不生成进小剧场。
