// 发给作者的东西长什么样：兔子镜往作者收件处发的每一份，都由这个文件拼出来。
// 这个文件和打码的那个文件（src/outputSanitizer/writingSkeleton.js）在公开版里不编码、不打包、留着注释，
// 酒馆里跑的就是你在仓库里看到的这一份，谁都能读。
//
// 发的只有两种：
//   1. 待修样本：一面兔子镜的「写法骨架」。文字全换成了占位「字」「字×12」，图片和链接地址换成「…」，
//      只留标签、类名、样式。另外带维修兔自己写的一句结论（里面提到的按钮名也换成了「字×N」）。
//      2.77.0 起，那一面量过看不看得清的，结论后面跟着几个数（对比度、字号、用了几种颜色），不带面里的字。
//      用户在维修兔菜单里点「发给作者」、自己写了备注的，备注原样带上（2.25.0，最多 500 字；不写就没有这一项）。
//      2.78.13 用户手动点「发给作者」的，另带几个数：屏幕宽高、这一面宽高、是不是展开着，最后点的是哪一种控件
//      （只有标签名和兔子镜认的控件名，比如 button:data-rm-next）、点完变没变、点了多久以前。
//   2. 失败回执：副 API 没生成出来时的错误类别、模型型号和几个数字。没有任何一段文字。
//   3. 报告（2.79.0）：工具里各处「📮 发给作者」，只有用户自己点、看过要发的内容、再点「确定发送」才发，从不自动发。
//      是兔子镜自己写的诊断文字（存档清单、闪退自查、卡顿自查……），本来就不含聊天正文；发之前再过一遍 scrubReportText：
//      网址、IP、邮箱、像密钥的字串换成代号，这个聊天里的人名、聊天名换成 {{user}}、{{char}}、[角色]、[聊天名]。
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
        ...(entry?.device ? { device: deviceFields(entry.device) } : {}),
        // 2.25.0 用户自己写的备注（只有手动「发给作者」时写了才有）：原样带上，不打码
        ...(entry?.note ? { note: String(entry.note).trim().slice(0, 500) } : {}),
        // version 是记下这份样本时的版本；sentVersion 是发出去时正在用的版本。
        sentVersion: String(sentVersion || ''),
    };
}

// 2.78.13 手动发来的那几个数：只留认得的几项，数是非负整数（像素比留两位小数），控件种类只许小写英文、数字和 : _ -
function deviceFields(device) {
    const whole = value => (Number.isFinite(Number(value)) && Number(value) >= 0 ? Math.round(Number(value)) : null);
    const kind = /^[a-z0-9:_-]{1,40}$/.test(String(device?.tap || '')) ? String(device.tap) : null;
    return {
        vw: whole(device?.vw), vh: whole(device?.vh), dpr: Number.isFinite(Number(device?.dpr)) ? Math.round(Number(device.dpr) * 100) / 100 : null,
        faceW: whole(device?.faceW), faceH: whole(device?.faceH), open: typeof device?.open === 'boolean' ? device.open : null,
        ...(kind ? { tap: kind, tapChanged: typeof device?.tapChanged === 'boolean' ? device.tapChanged : null, tapAgoS: whole(device?.tapAgoS) } : {}),
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

// 2.63.15 发出去的规则里有没有破限词、这一面定的是🔞还是清水：只认兔子镜自己写的固定说法，记成开关和一个英文词，
// 规则和正文的字一个都不留（拒写、一个字不写的回执要分清是没带破限词，还是带了也被拦）。
// 开了「输入转成 Unicode 编码」时，请求里的字是 \uXXXX，先还原再认。
function requestTextOf(body) {
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const text = messages.map(message => typeof message?.content === 'string' ? message.content
        : Array.isArray(message?.content) ? message.content.map(part => String(part?.text || '')).join('') : '').join('\n');
    return text.replace(/\\u([0-9a-fA-F]{4})/g, (whole, hex) => String.fromCharCode(parseInt(hex, 16)));
}
function requestHeat(text) {
    const adult = /是🔞/.test(text), clean = /是清水/.test(text);
    return adult && clean ? 'mixed' : adult ? 'adult' : clean ? 'clean' : '';
}

/**
 * 从一次失败的生成里拿回执要的那几项：只取错误类别、模型型号、开关和数字。
 * 提示词、聊天正文、模型回复、连接地址和 key 都不碰；上游报错只留状态码、类别和英文那一截（2.22.6）。编号由调用方按 receiptSignature 算。
 */
export function failureReceiptFields(record) {
    const outcome = record?.outcome || {};
    const transport = record?.response?.transport || record?.outcome?.transport || {};
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
        behaviorRuleMode: ascii(settings.behaviorRuleMode, 16),
        behaviorRuleSent: /创作补充/.test(requestTextOf(body)),
        heat: requestHeat(requestTextOf(body)),
        transport: {
            status: count(transport.status), contentType: ascii(transport.contentType, 40), parserFormat: ascii(transport.parserFormat, 16),
            receivedBytes: count(transport.receivedBytes), contentChars: count(transport.contentChars), finishReason: ascii(transport.finishReason, 24),
            termination: ascii(transport.termination, 24), failureCategory: ascii(transport.failureCategory, 24),
            endedNormally: flag(transport.endedNormally), prematureClose: flag(transport.prematureClose),
            // 流里一帧帧的样子：几帧、最后一帧的结束原因和字段名、是不是只有思考、带没带错误（只记有没有，原文不要）
            ...(shape ? { frames: count(shape.frames), frameFinish: ascii(shape.finish, 24), reasoningOnly: shape.reasoning === true,
                frameError: !!String(shape.error || '').trim(), lastFrameKeys: ascii(shape.keys, 200) } : {}),
            // 2.55.5 收字时间线（毫秒，从连上算）：第一个字、最后一个字、分几次收到、收字期间在后台待了多久
            ...(transport.timing && typeof transport.timing === 'object' ? { firstTextMs: transport.timing.firstTextMs == null ? null : count(transport.timing.firstTextMs), lastTextMs: transport.timing.lastTextMs == null ? null : count(transport.timing.lastTextMs),
                textReads: count(transport.timing.textReads), hiddenMs: count(transport.timing.hiddenMs) } : {}),
        },
        ms: count(record?.timing?.totalMs ?? (Date.parse(record?.finishedAt) - Date.parse(record?.startedAt))),
        // 2.22.6 宿主、上游报错的提示：状态码、哪一类、报错里英文的那一截（地址、key 已去掉，中文不留）
        ...(count(outcome.errorStatus) !== null ? { errorStatus: count(outcome.errorStatus) } : {}),
        ...(outcome.errorKind ? { errorKind: ascii(outcome.errorKind, 24) } : {}),
        ...(outcome.errorText ? { errorText: ascii(outcome.errorText, 120) } : {}),
    };
}
/** 同一种失败认成同一张回执用的签名（错误、模型、版本、结束原因、帧的样子）。 */
export function receiptSignature(receipt) {
    return [receipt.code, receipt.phase, receipt.model, receipt.version, receipt.transport?.finishReason, receipt.transport?.failureCategory, receipt.transport?.lastFrameKeys || ''].join('|');
}

/** 一张回执要发的内容：只挑下面这些字段，字都只留英文、数字和符号。 */
const RECEIPT_KEYS = ['id', 'version', 'code', 'phase', 'model', 'stream', 'maxTokens', 'requestChars', 'faces', 'modes', 'dispatch', 'samplingMode', 'behaviorRuleMode', 'behaviorRuleSent', 'heat', 'transport', 'errorStatus', 'errorKind', 'errorText', 'ms', 'hits', 'at', 'firstAt', 'steps', 'page'];
// 2.64.2 页面突然没了又回来（PAGE_RELOADED）的回执：没了之前页面上的几个数字（见 stepTrail.js），没有一个字的内容
// 2.76.23 多几样数：回到前台多久（fgS）、读好的图整页／面里多少百万像素、画布几块多大、内嵌页面几个、网页字体下了几包
// 2.77.1 再多两样：最后一步之后页面还活了多久（stepS）、这份聊天一共多少楼（chat；messages 只是页面上摆着的那几楼）
const PAGE_KEYS = ['gapS', 'ageS', 'fgS', 'stepS', 'up', 'hidden', 'nodes', 'messages', 'chat', 'faces', 'busy', 'images', 'drawn', 'drawnMP', 'imgMP', 'canvases', 'canvasMP', 'iframes', 'fonts', 'anims', 'heapMB', 'vw', 'vh', 'dpr'];
/** 页面突然没了：只留几个数字和英文代号拼成回执（编号由调用方按 receiptSignature 算）。 */
export function pageReloadReceiptFields(ended, version = '') {
    const page = ended?.page && typeof ended.page === 'object' ? ended.page : {};
    return {
        kind: 'failure', version: ascii(version, 32), code: 'PAGE_RELOADED', phase: ended?.background ? 'background' : 'foreground',
        steps: ascii(ended?.steps, 200),
        page: Object.fromEntries(PAGE_KEYS.map(key => [key, key === 'gapS' ? ended?.gapS : page[key]]).filter(([, value]) => typeof value === 'boolean' || Number.isFinite(Number(value)) && value !== null && value !== '')
            .map(([key, value]) => [key, typeof value === 'boolean' ? value : Math.round(Number(value) * 100) / 100])),
    };
}
const TRANSPORT_KEYS = ['status', 'contentType', 'parserFormat', 'receivedBytes', 'contentChars', 'finishReason', 'termination', 'failureCategory', 'endedNormally', 'prematureClose', 'frames', 'frameFinish', 'reasoningOnly', 'frameError', 'lastFrameKeys', 'firstTextMs', 'lastTextMs', 'textReads', 'hiddenMs'];
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
        else if (key === 'page') payload.page = Object.fromEntries(PAGE_KEYS.filter(name => entry.page?.[name] !== undefined).map(name => [name, onlyPlain(entry.page[name])]));
        else payload[key] = onlyPlain(entry[key]);
    }
    payload.sentVersion = ascii(sentVersion, 32);
    return payload;
}

/** 真正发出去的那串字：就是这一份 JSON（发样本、发回执都一样）。 */
export function payloadText(payload) {
    return JSON.stringify(payload);
}

// —— 3. 报告 ——
/** 报告能是哪几种（收件处也只认这几种）。 */
export const REPORT_TOPICS = Object.freeze(['trouble', 'crash', 'inventory', 'manual', 'trace', 'lag', 'external', 'health']);
export const REPORT_MAX_CHARS = 120000;
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/**
 * 报告发出去之前再过一遍：网址、IP、邮箱、像密钥的字串换成代号；names 里的每个名字（[原名, 代号]）换成代号。
 * 名字按长的先换（「某某某」不会被「某某」先换掉一半）；一个字的名字不换（会把别的字也换掉）。
 */
export function scrubReportText(text, names = []) {
    let out = String(text || '');
    out = out.replace(/\b(?:https?|wss?|ftp):\/\/[^\s'"<>）)】」]+/gi, '[网址]');
    out = out.replace(/\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b/g, '[邮箱]');
    out = out.replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?\b/g, '[地址]');
    out = out.replace(/\b(?:sk|pk|rk|ak)-[A-Za-z0-9_-]{8,}/g, '[密钥]');
    out = out.replace(/\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/gi, '[密钥]');
    out = out.replace(/\bAIza[0-9A-Za-z_-]{20,}/g, '[密钥]');
    const list = (Array.isArray(names) ? names : [])
        .map(([name, as]) => [String(name || '').trim(), String(as || '[名字]')])
        .filter(([name]) => [...name].length >= 2)
        .sort((a, b) => b[0].length - a[0].length);
    for (const [name, as] of list) out = out.replace(new RegExp(escapeRegExp(name), 'g'), as);
    return out;
}
/** 报告那一份：编号、版本、哪一种、内容（过长的截掉，说明截了）。 */
export function reportPayload({ id, topic, text, version = '', sentVersion = '', at = Date.now() }) {
    const body = String(text || '');
    const cut = body.length > REPORT_MAX_CHARS ? `${body.slice(0, REPORT_MAX_CHARS)}\n……（太长，后面截掉了 ${body.length - REPORT_MAX_CHARS} 字）` : body;
    return { kind: 'report', id: ascii(id, 64), version: ascii(version, 32), sentVersion: ascii(sentVersion, 32),
        topic: REPORT_TOPICS.includes(topic) ? topic : 'trouble', at: Math.round(Number(at) || Date.now()), text: cut };
}
