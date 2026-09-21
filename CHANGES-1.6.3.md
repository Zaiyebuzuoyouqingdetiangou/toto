# 兔子镜 1.6.3 修复说明（基于官方 1.6）

## 本轮修复（1.6.3）

### 1. 聊天 DOM 虚拟化停止（"Bounded ChatSurface contains an unknown direct child: div"）
- 根因：不是 DOM 结构差异，而是 **ChatSurface 注册赛跑失败**。iOS 上第三方扩展延迟加载——
  扩展求值时 TT 宿主 ABI（`__TAURITAVERN__.api.chatSurface`）尚未就绪；官方 1.6 在
  "host 已存在但 api.chatSurface 不完整"的分支把 `initialized` 锁存为 true，之后永不重试。
  注册因此推迟到 ~1.4s 后重型模块图的第一次 subscribe，而 TT 的首次投影早已冻结注册表，
  于是 `registerParticipant` 被拒绝（late-projection），扩展落入可见层 fallback，
  fallback 挂载的 DOM 不受 ChatSurface 托管 → TT 判定"未知直接子节点"→ 停止虚拟化。
- 修复（src/hostCompatibilityCore.js）：
  - 新增 `scheduleEarlyHostWatch()`：求值期若 ABI 未就绪，每 50ms 轮询一次（上限 80 次 = 4s），
    ABI 一出现立即 `initialize()` 完成注册——抢在首次投影冻结之前。
  - "api 不完整"分支不再锁存：`initialized = false` 并挂上守望，允许重试。
  - `initialize()` 重入守卫改为：仅当已有终态（registered / errorCode / ownershipDetermined）才短路。
  - `dispose()` 清理守望定时器。
- 回归测试：tests/hostCompatEarlyWatch.test.mjs（4 个场景：ABI 晚到先注册成功、
  late-projection 仍正确报错并走 fallback、dispose 后守望停止、api 不完整不锁存）。

### 2. 收藏星星位置：挨着兔子图标
- 之前三元素行用 space-between，把 ☆ 顶到了中间。改为窄屏堆叠模式下
  翻页条用 `margin-inline-end: auto` 自己贴左，整行保持 `justify-content: flex-end`，
  ☆ 与 🐰 始终成组靠右相邻（src/outputSanitizer/toolsChrome.js）。

### 3. 默认补充创作规则替换
- data/independentBehaviorPatch.js 的 `INDEPENDENT_BEHAVIOR_EDITOR_DEFAULT`
  逐字替换为用户指定的「lannuomi · 兔子镜小剧场生成助手 · 超级自由版」。
- 只影响出厂默认值：已保存过自定义规则的用户不受影响
  （normalizeBehaviorRuleText 仅在 null 时回落默认）。

## 沿用自 1.6.2（已含）
- × 删除按钮从持久化 HTML 剥离清单补全（PERSISTED_RUNTIME_UI_SELECTOR 等 5 处），
  根治 1.6.1 的"脏记录同步循环"卡顿/发热。
- 复活按钮重接线守卫（rmDeleteWired）。

## 沿用自 1.6.1（已含）
- imagePlan.js 容错 JSON 解析（整串 → ```json 围栏 → 平衡括号逆序扫描），根治 PLAN_INVALID_JSON。
- 切脸/切版本后保持镜子展开状态（showMultifaceFace carryOpen）。
- 翻页键 ‹ › 下移并适度放大（36×34px），touch-action: manipulation 治"点着点着没响应"。
- × 删除按钮移至标题行绝对右上角（float: inline-end，30px 圆形）。

## 缓存破坏（rmv）引用点
- independentBehaviorPatch.js → ?rmv=1.6.3-rule1（src/behaviorRules.js）
- hostCompatibilityCore.js → ?rmv=1.6.3-hostwatch1（src/hostCompatibility.js）
- toolsChrome.js → ?rmv=1.6.3-star1（outputSanitizer.js / diagnostics.js / lifecycle.js / maintenanceInspect.js）

## 测试
- 全套 184 项：175 通过 / 2 失败（官方 1.6 原生既有失败：batchStorageQuota:356、
  theaterFavorites:6，与本补丁无关）/ 7 跳过。
