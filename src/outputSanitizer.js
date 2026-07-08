const TOTO_BLOCK_RE = /<toto\b[\s\S]*?<\/toto>/gi;
const TOTO_BLOCK_SINGLE_RE = /<toto\b[\s\S]*?<\/toto>/i;

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
    let text = String(responseText || '').replace(/\r\n?/g, '\n');

    // 1. 如果整个回复被 Markdown 代码块包住，先扒掉外壳。
    text = text
        .replace(/^\s*```(?:html|HTML)?\s*\n?/i, '')
        .replace(/\n?\s*```\s*$/i, '')
        .trim();

    // 2. 如果 <toto>...</toto> 被单独包在代码块里，单独扒掉代码块外壳。
    text = text.replace(/```(?:html|HTML)?\s*\n?([\s\S]*?<toto\b[\s\S]*?<\/toto>[\s\S]*?)```/gi, '$1');

    // 3. 只压缩 <toto>...</toto> 内部，避免误伤主回复正文。
    text = text.replace(TOTO_BLOCK_RE, (block) => compactTotoBlock(block));

    return text.trim();
}

function findRecentAssistantMessages(mod) {
    const chat = mod?.chat || globalThis.chat;
    if (!Array.isArray(chat) || !chat.length) return [];
    return chat.slice(-6).filter(item => !item?.is_user && typeof item?.mes === 'string');
}

function sanitizeLatestRawMessages(mod) {
    let changed = false;
    for (const message of findRecentAssistantMessages(mod)) {
        const decoded = decodeHtmlEntities(message.mes);
        if (!TOTO_BLOCK_SINGLE_RE.test(decoded) && !/```(?:html|HTML)?[\s\S]*?<toto\b/i.test(decoded)) continue;
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

function sanitizeCodeBlocksInDom() {
    if (typeof document === 'undefined') return;
    const candidates = [...document.querySelectorAll('pre, code')];
    for (const node of candidates) {
        const raw = decodeHtmlEntities(node.textContent || '');
        if (!/<toto\b[\s\S]*?<\/toto>/i.test(raw)) continue;
        const cleaned = cleanRabbitHoleOutput(raw);
        const match = cleaned.match(TOTO_BLOCK_SINGLE_RE);
        if (!match) continue;
        const rendered = parseTotoFragment(match[0]);
        if (!rendered) continue;
        const target = node.closest('pre') || node;
        target.replaceWith(rendered);
    }
}

function scheduleSanitize(mod) {
    setTimeout(() => {
        sanitizeLatestRawMessages(mod);
        sanitizeCodeBlocksInDom();
    }, 80);
    setTimeout(() => {
        sanitizeLatestRawMessages(mod);
        sanitizeCodeBlocksInDom();
    }, 650);
    setTimeout(() => {
        sanitizeLatestRawMessages(mod);
        sanitizeCodeBlocksInDom();
    }, 1800);
}

export async function initOutputSanitizer() {
    try {
        const mod = await import('../../../../../script.js');
        const eventSource = mod?.eventSource;
        const eventTypes = mod?.event_types || {};
        if (eventSource?.on) {
            const events = [eventTypes.MESSAGE_RECEIVED, eventTypes.GENERATION_ENDED, eventTypes.CHAT_CHANGED, eventTypes.MESSAGE_SWIPED].filter(Boolean);
            for (const eventName of events) eventSource.on(eventName, () => scheduleSanitize(mod));
        }

        if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
            let timer = null;
            const observer = new MutationObserver(() => {
                clearTimeout(timer);
                timer = setTimeout(() => sanitizeCodeBlocksInDom(), 120);
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        scheduleSanitize(mod);
        console.debug('[RabbitHole] output sanitizer initialized');
    } catch (error) {
        console.debug('[RabbitHole] output sanitizer disabled:', error);
    }
}
