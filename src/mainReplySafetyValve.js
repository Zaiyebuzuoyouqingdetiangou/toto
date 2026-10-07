// 安全阀（仅自动生成）：正文异常时不自动生成兔子镜，避免浪费额度。
// 只看正文本身，不改正文；手动生成不受影响。判定都偏保守：需要多个信号同时出现，
// 或者整段很短、只有报错／拒答／空内容提示，避免误伤剧情里正常出现的“抱歉”“超时”。
// 按消息本身去重：流式输出时正文长度一直在变，不能用长度当去重依据。
const NOTIFIED = new WeakMap();
const STATUS_CODE = /\b(?:400|401|403|408|413|429|500|502|503|504|520|521|522|523|524|529)\b/;
const ERROR_EN = /(?:\berror\b|too many requests|rate.?limit|quota|resource.?exhausted|service unavailable|bad gateway|gateway time-?out|timed? ?out|upstream|internal server error|overloaded|unauthorized|forbidden|cloudflare)/i;
const ERROR_CN = /(?:请求失败|请求过多|请求过于频繁|请求太频繁|频率限制|限流|服务繁忙|负载过高|余额不足|额度不足|配额|无可用渠道|上游|接口错误|服务器错误|状态码|错误码)/;
const ERROR_START = /^(?:error|错误|报错|请求失败|api ?error|\{\s*"error"|\{\s*"code"|\[error\])/i;
const EMPTY_HINT = /(?:未返回|无内容|没有内容|内容为空|空回复|空响应|no content|empty response|^null$|^undefined$)/i;
const REFUSAL_START = /^(?:抱歉|对不起|很抱歉|非常抱歉|我很抱歉|sorry|i'?m sorry|i am sorry|i apologi[sz]e|i can'?t|i cannot|i'?m unable|i am unable|as an ai|作为(?:一个)?(?:ai|人工智能|语言模型))/i;
const REFUSAL_WORDS = /(?:无法|不能|不可以|不便|拒绝|政策|规定|准则|安全|can'?t|cannot|unable|not able|won'?t|policy|guidelines|content)/i;
// 酒馆预设里正文外层一般是 <content>；只认它和 <details>，其他标签名在状态栏等处可能合法地出现，容易误伤。
const WRAPPER_TAGS = ['content', 'details'];

function plainText(raw) {
    return String(raw || '').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function htmlApiErrorHeader(raw) {
    // HTML 本身可以是正常正文；长网关错误页则仍需识别明确的错误标题，不能依赖模板总长度。
    if (!/^(?:<!doctype\s+html\b|<html\b)/i.test(raw.trim())) return false;
    const header = plainText([
        raw.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] || '',
        raw.match(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/i)?.[1] || '',
    ].join(' '));
    return (STATUS_CODE.test(header) && (ERROR_EN.test(header) || ERROR_CN.test(header)))
        || (/\bcloudflare\b/i.test(header) && /(?:too many requests|rate.?limit|service unavailable|bad gateway|gateway time-?out|timed? ?out|timeout|overloaded)/i.test(header));
}

function unclosedWrapper(raw) {
    for (const tag of WRAPPER_TAGS) {
        const name = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const open = (raw.match(new RegExp(`<${name}(?:\\s[^>]*)?>`, 'gi')) || []).length;
        const close = (raw.match(new RegExp(`</${name}\\s*>`, 'gi')) || []).length;
        if (open > close) return tag;
    }
    return '';
}

// 返回异常原因；正常返回空串。
export function mainReplyAbnormalReason(message, { partial = false } = {}) {
    if (!message) return '';
    const raw = String(message.mes || '');
    if (message.extra?.error || message.extra?.api_error) return '宿主标记为错误';
    const text = plainText(raw);
    // 提前生成阶段正文还在写，短不代表异常；只在正文完成后判断“过短”。
    if (!partial && (text.length < 30 || (text.length < 80 && EMPTY_HINT.test(text)))) return '正文未返回内容或过短';
    const signals = [STATUS_CODE, ERROR_EN, ERROR_CN].filter(pattern => pattern.test(text)).length;
    if (ERROR_START.test(text.slice(0, 40)) || ERROR_START.test(raw.trim().slice(0, 40)) || htmlApiErrorHeader(raw)
        || (text.length < 1500 && signals >= 2) || (text.length < 150 && signals >= 1)) return '正文像是接口报错（如 429/524）';
    if (text.length < 400 && REFUSAL_START.test(text) && REFUSAL_WORDS.test(text)) return '正文是模型拒答或道歉';
    if ((raw.match(/```/g) || []).length % 2 === 1) return '正文疑似截断（代码块未闭合）';
    const wrapper = unclosedWrapper(raw);
    if (wrapper) return `正文疑似截断（<${wrapper}> 标签未闭合）`;
    return '';
}

export function notifySafetyValve(message, reason) {
    if (!message || typeof message !== 'object') return;
    const shown = NOTIFIED.get(message) || new Set();
    if (shown.has(reason)) return;
    shown.add(reason);
    NOTIFIED.set(message, shown);
    try { globalThis.toastr?.info?.(`${reason}，本轮兔子镜不自动生成；需要时可手动生成。`, '兔子镜安全阀'); } catch { /* ignore */ }
}
