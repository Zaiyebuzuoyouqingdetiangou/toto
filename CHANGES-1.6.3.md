# 兔子镜 1.6.3 修复说明（基于官方 1.6）

## 本轮修复（1.6.3）

### 1. 聊天 DOM 虚拟化停止（"Bounded ChatSurface contains an unknown direct child: div"）
- 根因分两层：
  1. **ChatSurface 注册赛跑**：iOS 上第三方扩展延迟加载，求值时 TT 宿主 ABI 尚未就绪；官方 1.6 在
     "host 已存在但 api.chatSurface 不完整"的分支把 `initialized` 锁存为 true，之后永不重试。
     注册推迟到 ~1.4s 后重型模块图的第一次 subscribe，TT 首次投影已冻结注册表。
  2. **即便尚未 `managed`，扩展仍可能把 `<div>` 插成 `#chat` 的直接子节点**：输入栏垫片
     （`rabbit-mirror-composer-clearance`）和外置壳在 ABI 未 latch 时走原生酒馆路径
     `insertBefore(host, .mes.nextSibling)`。ChatSurface 只允许 `#chat > .mes`，看到未知 `div` 就停止虚拟化。
- 修复：
  - `scheduleEarlyHostWatch()`：求值期 ABI 未就绪则 50ms 轮询（上限 4s），一出现立即注册。
  - "api 不完整"不再锁存；`initialize()` 仅在已有终态时短路。
  - `externalPlacementParent()` 在 `__TAURITAVERN__` 已存在、ownership 尚未 latch 时仍返回 `.mes_block`。
  - `placeExternalHost()` 在 TT 上永远把外置壳挂在楼层内（`.mes_text` 后面），不再成为 `#chat` 兄弟。
  - 输入栏垫片不再缓存 `managed`；TT 上只挂在当前最后一条 `.mes` 里，找不到楼层就不挂。
- 回归测试：tests/hostCompatEarlyWatch.test.mjs（ABI 晚到、late-projection、dispose、api 不完整不锁存、TT 未 latch 仍进 `.mes_block`）。

### 2. 收藏星标点了提示「当前没有可收藏的兔子镜」
- 根因：独立 API 的占位 `details.rabbit-mirror-external-placeholder` 标题也带「兔子镜」，
  会被当成交互根并装上星标。点击时 `captureTheaterFavoriteFromRoot` 直接拒绝占位卡。
  切脸/转工具后星标还可能带着旧 `root` 闭包，同样采空。
- 修复（src/theaterFavorites.js、src/outputSanitizer/toolsChrome.js）：
  - 捕获时若当前是占位卡，改去同楼层外置壳里找真正的成品 `details`。
  - 占位卡不再装星标。
  - 星标与删除键一样 `rmFavoriteWired` 只绑一次，点击时从按钮所在 live details 再解析。

### 3. 标题行（手机优先）
- 窄屏不再把工具栏拉满整行（去掉 720px `width:100%`），翻页 / 星标 / 兔子 / × 收成一组，互不拉开。
- 标题单独进左栏，最多两行后省略；控件不够一行时整组换到下一行，而不是把翻页条拉成空白长条。
- × 改回控件组末尾（不再 float 到标题右上角）。翻页条做成胶囊；星标 / 兔子 / × 统一 36px 触控。

### 4. 默认补充创作规则替换
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
- × 删除按钮曾移至标题行右上角；1.6.3 改回收进控件组末尾。

## 缓存破坏（rmv）引用点
- index.js / manifest.js → ?rmv=1.6.3
- independentBehaviorPatch.js → ?rmv=1.6.3-rule1（src/behaviorRules.js）
- hostCompatibilityCore.js → ?rmv=1.6.3-ttchild1（src/hostCompatibility.js）
- composerClearance.js / geometry.js → ?rmv=1.6.3-ttchild1
- theaterFavorites.js → ?rmv=1.6.3-fav1
- toolsChrome.js → ?rmv=1.6.3-title1（outputSanitizer.js / diagnostics.js / lifecycle.js / maintenanceInspect.js）
- runtime.js → ?rmv=1.6.3-title1（toolsChrome.js）
- mirrorToolMenu.js → ?rmv=1.6.3-title1
- style.css → ?rmv=1.6.3-title1

## 测试
- 标题行布局：tests/titleChromeLayout.test.mjs；multifaceOpenCarry 的删除键断言已改为「控件组末尾」。
