// The existing transport guard requires one bounded USER input and a final lock.
// This is explicitly caller-supplied text, never a snapshot of host chat/history.
export function buildScriptUserPrompt(prompt) {
    return `【酒馆助手脚本调用】\n下面仅为调用者本次提供的输入。编号 0 仅用于请求边界，不代表酒馆楼层；本接口未读取聊天或角色卡，记忆仅在调用者明确选择时附带。\n【当前聊天逐轮正文】\n[0 USER]\n${prompt}\n<兔子镜近输出短锁 data-source="independent-api-near-output">\n仅处理本次脚本输入，返回文本；不得声称已修改酒馆聊天或插件存储。\n</兔子镜近输出短锁>`;
}
