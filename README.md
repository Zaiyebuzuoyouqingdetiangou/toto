# RabbitMirror 0.33.84 TEST — 维修兔直接 ID 类名状态恢复

基线：RabbitMirror 0.33.83 TEST。

本次只升级小小维修兔，不修改 Prompt、母本库、随机抽取库、挨打猫、Menu QR 或输出锁。

## 修复内容

- 小小维修兔升级为 v1.57。
- 从当前消息原始 HTML 安全回读以下固定形式：
  - `document.getElementById("...").classList.toggle("...")`
  - `document.getElementById("...").classList.add("...")`
  - `document.getElementById("...").classList.remove("...")`
- 只接受固定 ID、固定 class 和上述三种有限操作，不执行模型生成的 JavaScript。
- 依据原始目标 class 与渲染后 class 的对应关系推导酒馆 CSS 作用域前缀。
- 只有状态 class 同时存在于原始 CSS 与渲染 CSS 时才安装恢复，避免无依据接管。
- 同一目标状态的打开／关闭按钮会同步 `aria-pressed`。
- 真实类名状态恢复在“无动作按钮兜底”之前安装，避免翻面按钮被错误替换成通用“操作已记录”。

## 对应案例

“一张过期的单程机票”中：

- `[ 翻转查看背面字迹 ]` 恢复为给 `#rabbitPass` 切换 `flipped` 状态；
- `[ 翻回正面 ]` 恢复为移除同一状态；
- 背面原有留言真实显示，不生成新文案；
- 通用无动作按钮兜底不再接管这两个按钮。

## 保留能力

- 维修兔仪式按钮可逆状态恢复
- 填空候选恢复
- 结构化静态分段恢复
- 空壳／源码截断识别
- 母本精确检索与预算控制
- Menu QR v2.2
- 挨打猫 v1.4
- 最终输出锁顺序
