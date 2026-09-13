# RabbitMirror × TauriTavern iOS 2.2.0 preprojection 修复

目标基线：Darkatse/TauriTavern `223be954afa7b60c8637a44a43319524a185ea11`（用户真机显示 2.2.0 dev / 223be954afa7）。

问题：开启 Chat DOM 虚化时，RabbitMirror 作为普通 third-party 扩展在首次聊天投影后才激活；此时 ChatSurface participant registry 已冻结，兔子镜诊断得到 `managed=true / registered=false / late-projection`。

修复范围：仅改 `src/scripts/extensions.js` 的 `activateRequiredChatSurfaceExtensions()`。在 TT 已有的“首次聊天物化前必须激活的 ChatSurface 扩展”阶段，额外识别已启用 RabbitMirror 的 `tt-entry.js`，提前激活并要求 `rabbitmirror/message-runtime` 完成注册。

识别条件同时要求：
- extension 类型为 local/global；
- 未禁用；
- `generate_interceptor === rabbitMirrorGenerateInterceptor`；
- JS 入口去掉 query/hash 后恰为 `tt-entry.js`。

不会把 RabbitMirror 加入 JS-Slash-Runner / LittleWhiteBox 的互斥 renderer 名单；它只作为 decorator participant 一起做 preprojection 激活。

## 应用

在 TT 源码根目录任选一种：

```bash
git apply TT-RabbitMirror-iOS-2.2.0-223be954-preprojection.patch
```

或：

```bash
node apply-rabbitmirror-preprojection.mjs
```

Node 脚本只在原函数块与目标基线精确匹配时修改，否则安全停止，并自动备份 `src/scripts/extensions.js.rabbitmirror-223be954.bak`。

## 回退

若用 Node 脚本：

```bash
node revert-rabbitmirror-preprojection.mjs
```

若用 git patch：

```bash
git apply -R TT-RabbitMirror-iOS-2.2.0-223be954-preprojection.patch
```

## 构建后真机验收

保持 TT 的 Chat DOM 虚化开启，RabbitMirror 1.5.49 启用，完整退出并重新打开 TT。兔子镜 TT 诊断应从：

`managed=true / registered=false / late-projection`

变为至少：

`managed=true / registered=true`

并且 ChatSurface 分发区开始出现 didMount / didCommitContent。随后再检查长聊天滚动、兔子镜展开、Swipe/重新生成、外置/文末模式。

注意：这是 TT 源码补丁，不是可直接安装到现有 iOS App 的兔子镜 ZIP。iOS 仍需重新构建/签名 TT 才能实机使用。
