# RabbitMirror 0.33.87 TEST — 前置 label checked 真实切换验收

基线：RabbitMirror 0.33.85 TEST。

## 新增功能

设置面板顶部新增“本轮 RabbitMirror 注入”统计区。每次生成拦截器完成最终 Prompt 拼接后自动更新：

- 最终实际注入字符数（精确）
- 模型中立的 Token 估算值
- 保守 Token 范围
- 基础 RabbitMirror Prompt 估算
- 挨打猫追加估算；未选择时显示 0
- 本轮母本补充字符数
- 抽中共同回忆时的额外资料字符数

Token 会因 OpenAI、Claude、Gemini及本地模型使用的分词器不同而变化，因此不伪装成精确值。字符数是最终送入 `setExtensionPrompt` 的实际字符串长度；统计面板本身不会写入 Prompt。

统计记录只保存数字、抽取 ID 和模式标志，不保存 Prompt 原文。关闭、跳过或手动清空注入时显示 0 Token。

## 保留内容

- 0.33.85 的全部 Prompt 与输出锁顺序
- 母本库、随机抽取库与 Menu QR v2.2
- 挨打猫 v1.4
- 小小维修兔 v1.58
- 每轮母本检索预算


## 0.33.87 维修兔 v1.58

- 修复 label 位于隐藏 checkbox/radio 前方时，部分 iOS WebView 不执行默认切换的问题。
- 仅对已有明确 `:checked` 结果目标的局部结构安装显式切换。
- 点击后在 0/60/260ms 复核 checked 状态，必要时校正并重新落实结果样式。
- 诊断新增“前置label切换验收”与最近一次真实切换记录。
- 不新增正文，不改 Prompt、母本库、抽取库、Menu QR、挨打猫或 Token 测算。
