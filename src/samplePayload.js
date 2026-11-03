// 发给作者的东西长什么样：兔子镜往作者收件处发的每一份，都由这个文件拼出来。
// 这个文件和打码的那个文件（src/outputSanitizer/writingSkeleton.js）在公开版里不编码、不打包、留着注释，
// 酒馆里跑的就是你在仓库里看到的这一份，谁都能读。
//
// 发的只有两种：
//   1. 待修样本：一面兔子镜的「写法骨架」。文字全换成了占位「字」「字×12」，图片和链接地址换成「…」，
//      只留标签、类名、样式。另外带维修兔自己写的一句结论（里面提到的按钮名也换成了「字×N」）。
//   2. 失败回执：副 API 没生成出来时的错误类别、模型型号和几个数字。没有任何一段文字。
// 这里只挑认得的字段，别的一概不带；骨架里只要还有占位以外的汉字，这一份就不发。
// 本文件不引用别的文件：要拼什么、挑哪些字段，全在下面。

/** 骨架里允许出现的汉字只有占位「字」「×」和省略号，外加兔子镜自己补样式时留的那句注释。 */
const PLUGIN_STYLE_NOTE = '/* 插件补的样式，略 */';
export function skeletonLooksClean(text) {
    return !/[^\x00-\x7f字×…]/.test(String(text || '').split(PLUGIN_STYLE_NOTE).join(''));
}

/** 发出去用的编号：样本编号 + 记下它的版本（2.5.2 → 2_5_2）。 */
export function uploadIdOf(entry) {
    const id = String(entry?.id || '').replace(/[^a-z0-9]/gi, '').slice(0, 40);
    const version = String(entry?.version || '').replace(/[^0-9.]/g, '').replace(/\./g, '_').slice(0, 20) || '0';
    return id ? `${id}-v${version}` : '';
}

// 维修兔的结论里，「」括起来的是按钮、选项的名字：再保险一次，没换成「字×N」的这里换掉。
function maskQuoted(text) {
    return String(text || '').replace(/「[^」]*」/g, match => {
        const inner = match.slice(1, -1).replace(/\s+/g, ' ').trim();
        return /^字×\d+$/.test(inner) ? match : `「字×${inner.length}」`;
    }).slice(0, 400);
}
// 认不出的写法键：「类型:键」，键已换成长度；英文短键照留。
function maskUnmatched(item) {
    const text = String(item || '');
    const at = text.indexOf(':');
    const type = at >= 0 ? text.slice(0, at) : '';
    const token = at >= 0 ? text.slice(at + 1) : text;
    const plain = /^!?[\w.-]{1,24}$/.test(token) || /^字×\d+$/.test(token);
    return `${type.replace(/[^\w-]/g, '').slice(0, 24)}:${plain ? token : `字×${token.length}`}`.slice(0, 80);
}

/**
 * 一份待修样本要发的内容。resanitize：打码函数（发之前用这一版的打码规则把骨架再过一遍）；sentVersion：正在用的兔子镜版本。
 */
export function samplePayload(entry, { resanitize = null, sentVersion = '' } = {}) {
    const clean = value => {
        const text = String(value || '');
        if (!text || typeof resanitize !== 'function') return text;
        try { return String(resanitize(text) || ''); } catch { return ''; }
    };
    const dialect = entry?.dialect && typeof entry.dialect === 'object' ? {
        declared: entry.dialect.declared === true,
        dialects: (Array.isArray(entry.dialect.dialects) ? entry.dialect.dialects : []).slice(0, 12).map(item => String(item).replace(/[^\w.-]/g, '').slice(0, 40)),
        unmatched: (Array.isArray(entry.dialect.unmatched) ? entry.dialect.unmatched : []).slice(0, 40).map(maskUnmatched),
    } : null;
    return {
        id: uploadIdOf(entry), version: String(entry?.version || ''), trigger: String(entry?.trigger || 'patrol'),
        reason: maskQuoted(entry?.reason),
        controls: (Array.isArray(entry?.controls) ? entry.controls : []).slice(0, 12).map(name => (/^字×\d+$/.test(String(name)) ? String(name) : `字×${String(name).length}`)),
        dialect,
        hits: Number(entry?.hits) || 1, at: Number(entry?.at) || Date.now(),
        source: clean(entry?.source), rendered: clean(entry?.rendered),
        // version 是记下这份样本时的版本；sentVersion 是发出去时正在用的版本。
        sentVersion: String(sentVersion || ''),
    };
}

/** 这一份样本能不能发：要有编号、要有骨架、骨架里没有占位以外的汉字。 */
export function sampleSendable(payload) {
    return !!payload?.id && !!(payload.source || payload.rendered) && skeletonLooksClean(payload.source) && skeletonLooksClean(payload.rendered);
}

// ——— 失败回执

// 回执里的字只许是英文、数字和符号；数字只许非负整数。
const ascii = (value, max = 64) => String(value ?? '').replace(/[^\x20-\x7e]/g, '').trim().slice(0, max);
const count = value => (Number.isFinite(Number(value)) && Number(value) >= 0 ? Math.round(Number(value)) : null);
const flag = value => (typeof value === 'boolean' ? value : null);

/** 模型名只留型号：去掉中转站加的方括号前缀、中文和空白，只剩字母数字和 ._:/- */
export function bareModelName(value) {
    return String(value || '')
        .replace(/\[[^\]]*\]|【[^】]*】|（[^）]*）|\([^)]*\)/g, '')
        .replace(/[^A-Za-z0-9._:/-]/g, '')
        .replace(/^[-_.:/]+/, '')
        .slice(0, 64);
}

/**
 * 从一次失败的生成里拿回执要的那几项：只取错误类别、模型型号、开关和数字。
 * 提示词、聊天正文、模型回复、上游报错原文、连接地址和 key 都不碰。编号由调用方按 receiptSignature 算。
 */
export function failureReceiptFields(record) {
    const outcome = record?.outcome || {};
    const transport = record?.response?.transport || {};
    const settings = record?.context?.settings || {};
    const body = record?.request?.body || {};
    const shape = transport.streamShape && typeof transport.streamShape === 'object' ? transport.streamShape : null;
    return {
        kind: 'failure',
        version: ascii(record?.context?.version, 32),
        code: ascii(outcome.code, 100) || 'UNCLASSIFIED',
        phase: ascii(outcome.phase, 40),
        model: bareModelName(body.model),
        stream: flag(body.stream),
        maxTokens: count(body.max_tokens ?? body.max_completion_tokens),
        requestChars: count(record?.context?.owner?.totalRequestChars),
        faces: count(settings.rabbitMirrorFaceCount),
        modes: Array.isArray(settings.rabbitMirrorPresentationModes) ? settings.rabbitMirrorPresentationModes.slice(0, 5).map(mode => ascii(mode, 12)) : [],
        dispatch: ascii(settings.multifaceDispatch, 16),
        samplingMode: ascii(settings.samplingMode, 16),
        transport: {
            status: count(transport.status), contentType: ascii(transport.contentType, 40), parserFormat: ascii(transport.parserFormat, 16),
            receivedBytes: count(transport.receivedBytes), contentChars: count(transport.contentChars), finishReason: ascii(transport.finishReason, 24),
            termination: ascii(transport.termination, 24), failureCategory: ascii(transport.failureCategory, 24),
            endedNormally: flag(transport.endedNormally), prematureClose: flag(transport.prematureClose),
            // 流里一帧帧的样子：几帧、最后一帧的结束原因和字段名、是不是只有思考、带没带错误（只记有没有，原文不要）
            ...(shape ? { frames: count(shape.frames), frameFinish: ascii(shape.finish, 24), reasoningOnly: shape.reasoning === true,
                frameError: !!String(shape.error || '').trim(), lastFrameKeys: ascii(shape.keys, 200) } : {}),
        },
        ms: count(record?.timing?.totalMs ?? (Date.parse(record?.finishedAt) - Date.parse(record?.startedAt))),
    };
}
/** 同一种失败认成同一张回执用的签名（错误、模型、版本、结束原因、帧的样子）。 */
export function receiptSignature(receipt) {
    return [receipt.code, receipt.phase, receipt.model, receipt.version, receipt.transport?.finishReason, receipt.transport?.failureCategory, receipt.transport?.lastFrameKeys || ''].join('|');
}

/** 一张回执要发的内容：只挑下面这些字段，字都只留英文、数字和符号。 */
const RECEIPT_KEYS = ['id', 'version', 'code', 'phase', 'model', 'stream', 'maxTokens', 'requestChars', 'faces', 'modes', 'dispatch', 'samplingMode', 'transport', 'ms', 'hits', 'at', 'firstAt'];
const TRANSPORT_KEYS = ['status', 'contentType', 'parserFormat', 'receivedBytes', 'contentChars', 'finishReason', 'termination', 'failureCategory', 'endedNormally', 'prematureClose', 'frames', 'frameFinish', 'reasoningOnly', 'frameError', 'lastFrameKeys'];
function onlyPlain(value) {
    if (typeof value === 'string') return ascii(value, 200);
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'boolean' || value === null) return value;
    return null;
}
export function failurePayload(entry, { sentVersion = '' } = {}) {
    const payload = { kind: 'failure' };
    for (const key of RECEIPT_KEYS) {
        if (entry?.[key] === undefined) continue;
        if (key === 'modes') payload.modes = (Array.isArray(entry.modes) ? entry.modes : []).slice(0, 5).map(mode => ascii(mode, 12));
        else if (key === 'transport') payload.transport = Object.fromEntries(TRANSPORT_KEYS.filter(name => entry.transport?.[name] !== undefined).map(name => [name, onlyPlain(entry.transport[name])]));
        else payload[key] = onlyPlain(entry[key]);
    }
    payload.sentVersion = ascii(sentVersion, 32);
    return payload;
}

/** 真正发出去的那串字：就是这一份 JSON（发样本、发回执都一样）。 */
export function payloadText(payload) {
    return JSON.stringify(payload);
}
