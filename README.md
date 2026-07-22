# RabbitMirror 0.33.45 TEST｜文生图全链路修复

## 0.33.45 修复

- 文生图触发不再受视觉扫描“三次尝试”限制；手机端会独立等待 RabbitMirror DOM，并在 0.25～7.5 秒内分阶段重试。
- 免费成图不再使用跨域 `fetch` 下载图片，改为浏览器直接加载图片地址。
- 用户填写 `https://image.pollinations.ai/` 时会自动补全为可直接生成图片的 `/prompt/{prompt}` 地址。
- 免费成图使用压缩版 2D 图片 Prompt，避免超长 URL 被拒绝。
- 自定义 API 支持输入根地址、`/v1` 或完整 `/v1/images/generations` 地址，并自动规范化。
- 自定义 API 直连遇到浏览器 CORS/网络错误时，自动尝试 SillyTavern 同源 `/proxy/` 代理；模型拉取使用同一回退链。
- 无法跨域且服务器 CORS 代理未开启时，会显示明确错误，不再静默失败。
- 开关关闭时仍不构建图片 Prompt、不创建画框、不发出任何图片请求。
- RabbitMirror 主 Prompt、展现形式池、主题池和 0.33.44 的正文流安全规则未改动。

## 两种模式

- 免费成图：可填写 Pollinations 根地址或带 `{prompt}`、`{width}`、`{height}` 的直接图片模板。
- 自定义 API：填写 OpenAI 兼容地址与 API Key，点击连接并拉取模型后选择模型。

两种模式均使用独立的 2D 动漫画风 Prompt，并包含 CHAR/USER 外观、防人体异常、禁止 UI/乱码、水印，以及非血腥、非暴力、非恐怖约束。
