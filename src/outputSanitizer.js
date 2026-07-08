const TOTO_BLOCK_RE = /<toto\b[\s\S]*?<\/toto>/gi;
const TOTO_BLOCK_SINGLE_RE = /<toto\b[\s\S]*?<\/toto>/i;
const FENCED_BLOCK_RE = /```(?:html|HTML|xml|XML)?\s*\n?([\s\S]*?)\n?```/gi;
const WHOLE_FENCED_BLOCK_RE = /^\s*```(?:html|HTML|xml|XML)?\s*\n?([\s\S]*?)\n?```\s*$/i;
const TRAILING_HTML_START_RE = /(?:^|\n)(<(?:div|section|article|details)\b[\s\S]*)$/i;
const PRE_CODE_RE = /<pre\b[^>]*>\s*<code\b[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi;

function decodeHtmlEntities(text) {
    const input = String(text || '');
    if (!input.includes('&')) return input;
    try {
        if (typeof document === 'undefined') return input;
        const textarea = document.createElement('textarea');
        textarea.innerHTML = input;
        return textarea.value;
    } catch {
        return input;
    }
}

function stripOneCodeFence(text) {
    const input = String(text || '').trim();
    const match = input.match(WHOLE_FENCED_BLOCK_RE);
    return match ? String(match[1] || '').trim() : input;
}

function looksLikeCompleteHtmlBlock(text) {
    const html = String(text || '').trim();
    if (!html) return false;
    if (TOTO_BLOCK_SINGLE_RE.test(html)) return true;
    if (!/^<(?:div|section|article|details)\b[\s\S]*<\/(?:div|section|article|details)>\s*$/i.test(html)) return false;

    // 只接管“像兔子洞 UI 作品”的整段 HTML，避免误伤普通聊天里的 HTML 教程代码。
    const htmlSignal = /\bstyle\s*=|display\s*:\s*(?:grid|flex|block)|box-sizing\s*:|max-width\s*:|linear-gradient\(|box-shadow\s*:|filter\s*:|border-radius\s*:/i.test(html);
    const theaterSignal = /兔子洞|小剧场|互动区|海龟汤|剖面图|Layer|视觉|展现形式|summary|details/i.test(html);
    const enoughTags = (html.match(/<\/(?:div|p|span|h[1-6]|section|article)>/gi) || []).length >= 3;
    return htmlSignal && (theaterSignal || enoughTags);
}

function wrapNakedHtmlAsToto(html) {
    const body = compactTotoBlock(html);
    if (TOTO_BLOCK_SINGLE_RE.test(body)) return body;
    if (/<details\b/i.test(body) && /<summary\b/i.test(body)) {
        return `<toto data-rabbit-hole="true" style="display:block;">${body}</toto>`;
    }
    return `<toto data-rabbit-hole="true" style="display:block;"><details style="display:block;box-sizing:border-box;"><summary style="cursor:pointer;list-style:none;font-weight:700;margin:0 0 8px 0;">【兔子洞：小剧场】</summary>${body}</details></toto>`;
}

function cleanCodeFencePayload(payload) {
    const raw = stripOneCodeFence(decodeHtmlEntities(payload));
    if (!raw) return raw;
    if (TOTO_BLOCK_SINGLE_RE.test(raw)) return cleanRabbitHoleOutput(raw);
    if (looksLikeCompleteHtmlBlock(raw)) return wrapNakedHtmlAsToto(raw);
    return null;
}

function unwrapCodeBlocksInsideToto(block) {
    let html = String(block || '');

    // 关键兜底：外层 <toto>/<details> 已经成立，但模型把正文 HTML 又塞进 ```html 代码块时，
    // 这里只拆掉内部代码块，保留原本的外层 summary，不再二次包 <toto>。
    html = html.replace(FENCED_BLOCK_RE, (match, payload) => {
        const raw = stripOneCodeFence(decodeHtmlEntities(payload));
        if (looksLikeCompleteHtmlBlock(raw)) return compactTotoBlock(raw);
        if (TOTO_BLOCK_SINGLE_RE.test(raw)) return compactTotoBlock(raw.replace(/^<toto\b[^>]*>/i, '').replace(/<\/toto>\s*$/i, ''));
        return match;
    });

    // 兼容已经被 Markdown 渲染成 <pre><code>&lt;div...&gt;</code></pre> 后又写回消息的情况。
    html = html.replace(PRE_CODE_RE, (match, payload) => {
        const raw = stripOneCodeFence(decodeHtmlEntities(payload));
        if (looksLikeCompleteHtmlBlock(raw)) return compactTotoBlock(raw);
        if (TOTO_BLOCK_SINGLE_RE.test(raw)) return compactTotoBlock(raw.replace(/^<toto\b[^>]*>/i, '').replace(/<\/toto>\s*$/i, ''));
        return match;
    });

    return html;
}

function wrapTrailingNakedHtml(text) {
    const input = String(text || '').trim();
    if (TOTO_BLOCK_SINGLE_RE.test(input)) return input;
    if (looksLikeCompleteHtmlBlock(input)) return wrapNakedHtmlAsToto(input);

    const match = input.match(TRAILING_HTML_START_RE);
    if (!match) return input;
    const htmlStart = match.index + match[0].indexOf('<');
    const prefix = input.slice(0, htmlStart).trimEnd();
    const tail = input.slice(htmlStart).trim();
    if (!looksLikeCompleteHtmlBlock(tail)) return input;
    return `${prefix}${prefix ? '\n' : ''}${wrapNakedHtmlAsToto(tail)}`.trim();
}

export function compactTotoBlock(block) {
    let html = String(block || '');
    const styleSlots = [];

    // 1. 保护 <style>...</style>，避免 CSS 文本被误插入 <br>。
    html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (match) => {
        const key = `%%RHT_STYLE_${styleSlots.length}%%`;
        styleSlots.push(
            match
                .replace(/\r\n?/g, '\n')
                .replace(/^[ \t]+/gm, '')
                .replace(/[ \t]+$/gm, '')
                .replace(/\n+/g, '')
                .replace(/>\s+</g, '><')
                .trim(),
        );
        return key;
    });

    // 2. 核心：清除每一行行首缩进，破坏 Markdown-it 的“行首 4 空格代码块”识别条件。
    html = html
        .replace(/\r\n?/g, '\n')
        .replace(/^[ \t]+/gm, '')
        .replace(/[ \t]+$/gm, '');

    // 3. 只删除标签之间的结构空白，尽量不碰属性文案。
    html = html
        .replace(/>\s+</g, '><')
        .replace(/\n(?=<)/g, '')
        .replace(/>\n/g, '>');

    // 4. 按标签切开：标签内换行压成空格；纯结构空白删除；真实文案里的换行转 <br>。
    html = html
        .split(/(<[^>]+>)/g)
        .map((part) => {
            if (!part) return '';
            if (part.startsWith('<')) {
                return part
                    .replace(/\s*\n\s*/g, ' ')
                    .replace(/[ \t]{2,}/g, ' ');
            }
            if (!part.trim()) return '';
            return part
                .replace(/[ \t]*\n[ \t]*/g, '<br>')
                .replace(/(?:<br>){3,}/g, '<br><br>');
        })
        .join('')
        .trim();

    // 5. 还原 <style>。
    styleSlots.forEach((style, index) => {
        html = html.replace(`%%RHT_STYLE_${index}%%`, style);
    });

    return html;
}

export function cleanRabbitHoleOutput(responseText = '') {
    let text = String(responseText || '').replace(/\r\n?/g, '\n').trim();

    // 1. 如果整个回复被一层 ```html 包住，先扒掉最外层。
    const wholeFence = text.match(WHOLE_FENCED_BLOCK_RE);
    if (wholeFence) {
        const payload = decodeHtmlEntities(wholeFence[1]).trim();
        if (TOTO_BLOCK_SINGLE_RE.test(payload) || looksLikeCompleteHtmlBlock(payload)) text = payload;
    }

    // 2. 先处理已经有 <toto> 外壳的块：拆掉内部 ```html / <pre><code>，再压缩。
    text = text.replace(TOTO_BLOCK_RE, (block) => compactTotoBlock(unwrapCodeBlocksInsideToto(block)));

    // 3. 再处理外层裸露的代码块：如果整块是兔子洞或裸 HTML，则补边界。
    text = text.replace(FENCED_BLOCK_RE, (match, payload) => {
        const cleaned = cleanCodeFencePayload(payload);
        return cleaned || match;
    }).trim();

    // 4. 兜底：残留的首尾三反引号。
    text = text
        .replace(/^\s*```(?:html|HTML|xml|XML)?\s*\n?/i, '')
        .replace(/\n?\s*```\s*$/i, '')
        .trim();

    // 5. 如果模型漏掉 <toto>，接管消息末尾的完整裸 HTML 小剧场并补上边界。
    text = wrapTrailingNakedHtml(text);

    // 6. 补完边界后再处理/压缩一次，确保内部代码块也被拆掉。
    text = text.replace(TOTO_BLOCK_RE, (block) => compactTotoBlock(unwrapCodeBlocksInsideToto(block)));

    return text.trim();
}

function needsSanitize(text) {
    const decoded = decodeHtmlEntities(String(text || ''));
    if (TOTO_BLOCK_SINGLE_RE.test(decoded)) return true;
    if (/```(?:html|HTML|xml|XML)?[\s\S]*?<toto\b/i.test(decoded)) return true;
    if (FENCED_BLOCK_RE.test(decoded)) {
        FENCED_BLOCK_RE.lastIndex = 0;
        let match;
        while ((match = FENCED_BLOCK_RE.exec(decoded))) {
            const raw = stripOneCodeFence(decodeHtmlEntities(match[1]));
            if (looksLikeCompleteHtmlBlock(raw) || TOTO_BLOCK_SINGLE_RE.test(raw)) {
                FENCED_BLOCK_RE.lastIndex = 0;
                return true;
            }
        }
        FENCED_BLOCK_RE.lastIndex = 0;
    }
    return wrapTrailingNakedHtml(decoded) !== decoded.trim();
}

function findRecentAssistantMessages(mod) {
    const chat = mod?.chat || globalThis.chat;
    if (!Array.isArray(chat) || !chat.length) return [];
    return chat.slice(-8).filter(item => !item?.is_user && typeof item?.mes === 'string');
}

function sanitizeLatestRawMessages(mod) {
    let changed = false;
    for (const message of findRecentAssistantMessages(mod)) {
        const decoded = decodeHtmlEntities(message.mes);
        if (!needsSanitize(decoded)) continue;
        const cleaned = cleanRabbitHoleOutput(decoded);
        if (cleaned && cleaned !== message.mes) {
            message.mes = cleaned;
            if (Array.isArray(message.swipes)) {
                const swipeIndex = Number.isInteger(message.swipe_id) ? message.swipe_id : message.swipes.length - 1;
                if (typeof message.swipes[swipeIndex] === 'string') message.swipes[swipeIndex] = cleaned;
            }
            changed = true;
        }
    }
    if (changed) {
        try {
            const saver = mod?.saveChatConditional || globalThis.saveChatConditional;
            if (typeof saver === 'function') saver();
        } catch (error) {
            console.debug('[RabbitHole] save after sanitizer failed:', error);
        }
    }
    return changed;
}

function parseHtmlFragment(html) {
    try {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template.content.childNodes.length ? template.content.cloneNode(true) : null;
    } catch {
        return null;
    }
}

function parseTotoFragment(html) {
    try {
        const template = document.createElement('template');
        template.innerHTML = html;
        const toto = template.content.querySelector('toto[data-rabbit-hole="true"], toto');
        return toto ? toto.cloneNode(true) : null;
    } catch {
        return null;
    }
}

function findCodeReplaceTarget(node) {
    let target = node.closest?.('pre') || node;
    // SillyTavern/代码块插件常会在 pre 外面包一层带“隐藏代码块/复制”的容器。
    // 如果父层除了按钮文案之外几乎只包含这个代码块，就连按钮一起替换掉。
    for (let i = 0; i < 3; i += 1) {
        const parent = target?.parentElement;
        if (!parent || parent === document.body) break;
        const targetText = target.textContent || '';
        const parentText = parent.textContent || '';
        const extra = parentText.replace(targetText, '').replace(/\s+/g, ' ').trim();
        const extraLooksLikeCodeToolbar = !extra || /^(隐藏代码块|显示代码块|Hide code|Show code|Copy|Copied|复制|复制代码|代码块|Code)$/i.test(extra);
        const hasSingleCodeArea = parent.querySelectorAll('pre, code').length <= 2;
        if (extraLooksLikeCodeToolbar && hasSingleCodeArea) target = parent;
        else break;
    }
    return target;
}

function sanitizeCodeBlocksInDom() {
    if (typeof document === 'undefined') return;
    const pres = [...document.querySelectorAll('pre')];
    const looseCodes = [...document.querySelectorAll('code')].filter(code => !code.closest('pre'));
    const candidates = [...pres, ...looseCodes];

    for (const node of candidates) {
        if (!node?.isConnected) continue;
        const raw = stripOneCodeFence(decodeHtmlEntities(node.textContent || ''));
        if (!raw) continue;

        let replacement = null;
        const insideRabbitHole = !!node.closest('toto, details');

        if (TOTO_BLOCK_SINGLE_RE.test(raw)) {
            const cleaned = cleanRabbitHoleOutput(raw);
            const match = cleaned.match(TOTO_BLOCK_SINGLE_RE);
            replacement = match ? parseTotoFragment(match[0]) : null;
        } else if (looksLikeCompleteHtmlBlock(raw)) {
            // 已经在兔子洞 details 里面时，只把代码块内容变成真实 HTML，避免再套一层小剧场。
            replacement = insideRabbitHole
                ? parseHtmlFragment(compactTotoBlock(raw))
                : parseTotoFragment(wrapNakedHtmlAsToto(raw));
        }

        if (!replacement) continue;
        const target = findCodeReplaceTarget(node);
        if (target?.isConnected) target.replaceWith(replacement);
    }
}

function scheduleSanitize(mod) {
    const run = () => {
        sanitizeLatestRawMessages(mod);
        sanitizeCodeBlocksInDom();
    };
    setTimeout(run, 80);
    setTimeout(run, 350);
    setTimeout(run, 900);
    setTimeout(run, 1800);
    setTimeout(run, 3200);
}

export async function initOutputSanitizer() {
    try {
        const mod = await import('../../../../../script.js');
        const eventSource = mod?.eventSource;
        const eventTypes = mod?.event_types || {};
        if (eventSource?.on) {
            const events = [
                eventTypes.MESSAGE_RECEIVED,
                eventTypes.GENERATION_ENDED,
                eventTypes.CHAT_CHANGED,
                eventTypes.MESSAGE_SWIPED,
                eventTypes.MESSAGE_UPDATED,
            ].filter(Boolean);
            for (const eventName of events) eventSource.on(eventName, () => scheduleSanitize(mod));
        }

        if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
            let timer = null;
            const observer = new MutationObserver(() => {
                clearTimeout(timer);
                timer = setTimeout(() => sanitizeCodeBlocksInDom(), 120);
            });
            const root = document.body || document.documentElement;
            if (root) observer.observe(root, { childList: true, subtree: true });
        }

        scheduleSanitize(mod);
        console.debug('[RabbitHole] output sanitizer initialized');
    } catch (error) {
        console.debug('[RabbitHole] output sanitizer disabled:', error);
    }
}
