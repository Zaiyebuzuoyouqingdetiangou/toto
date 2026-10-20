// 独立 API 的外置兔子镜挂在这条消息的哪一层。
//   body     正文（.mes_text）最后面：美化把气泡画在正文这一层时，兔子镜跟着进气泡
//   message  正文下面、还在这条消息里（.mes_block 里紧跟 .mes_text）：美化把整条消息画成卡片时也在卡片里
//   outside  整条消息外面（挂在 .mes 后面，老位置）：不想进美化卡片的人手动选
// 「自动」只认一条判得准的规则：正文这一层自己画了底色／边框／阴影，而且正文显示着、够宽，才进正文；其余一律 message。

export const EXTERNAL_ANCHORS = Object.freeze(['auto', 'body', 'outside']);

export function normalizeExternalAnchor(value) {
    const text = String(value || '').trim();
    return EXTERNAL_ANCHORS.includes(text) ? text : 'auto';
}

// 颜色的透明度：rgba(0,0,0,0)、rgb(0 0 0 / 0)、color(srgb 1 1 1 / 0)、oklch(… / 0%) 都认；认不出的当不透明。
function colorAlpha(value) {
    const text = String(value || '').trim().toLowerCase();
    if (!text || text === 'transparent' || text === 'none') return 0;
    const slash = text.match(/\/\s*([\d.]+%?)\s*\)$/);
    if (slash) return slash[1].endsWith('%') ? Number.parseFloat(slash[1]) / 100 : Number.parseFloat(slash[1]);
    const match = text.match(/^(?:rgba?|hsla?)\(([^)]*)\)$/);
    if (!match) return 1;
    const parts = match[1].split(/[\s,]+/).filter(Boolean);
    if (parts.length < 4) return 1;
    const last = parts[parts.length - 1];
    const alpha = last.endsWith('%') ? Number.parseFloat(last) / 100 : Number.parseFloat(last);
    return Number.isFinite(alpha) ? alpha : 1;
}

// 这一层自己画了「气泡」：有底色、背景图、看得见的边框或阴影。
export function paintsBubble(node, view = node?.ownerDocument?.defaultView || globalThis) {
    if (!node || typeof view?.getComputedStyle !== 'function') return false;
    let style;
    try { style = view.getComputedStyle(node); } catch { return false; }
    if (!style) return false;
    if (colorAlpha(style.backgroundColor) > 0.02) return true;
    if (style.backgroundImage && style.backgroundImage !== 'none') return true;
    if (style.boxShadow && style.boxShadow !== 'none') return true;
    for (const side of ['Top', 'Bottom', 'Left', 'Right']) {
        const width = Number.parseFloat(style[`border${side}Width`]) || 0;
        if (width > 0 && style[`border${side}Style`] !== 'none' && colorAlpha(style[`border${side}Color`]) > 0.02) return true;
    }
    return false;
}

function bodyUsable(body, view) {
    if (!body?.isConnected || typeof view?.getComputedStyle !== 'function') return false;
    let style;
    try { style = view.getComputedStyle(body); } catch { return false; }
    if (!style || style.display === 'none' || style.visibility === 'hidden') return false;
    let rect;
    try { rect = body.getBoundingClientRect(); } catch { return false; }
    return rect.width >= 220 && rect.height > 0;
}

/**
 * 决定挂在哪一层。
 * @param {Element} messageElement 这条消息（.mes）
 * @param {Element|null} body 正文（.mes_text）
 * @param {string} setting 设置值 auto / body / outside
 * @param {{busy?:boolean}} [options] busy：这一层正文正在流式输出或编辑中
 * @returns {'body'|'message'|'outside'}
 */
export function resolveExternalAnchor(messageElement, body, setting = 'auto', { busy = false } = {}) {
    const mode = normalizeExternalAnchor(setting);
    if (mode === 'outside') return 'outside';
    const view = messageElement?.ownerDocument?.defaultView || globalThis;
    const hasBody = !!(body && body !== messageElement && messageElement?.contains?.(body));
    // 正文正在被酒馆反复重写（流式输出、编辑中）：先放正文下面，写完再进正文。
    if (!hasBody || busy) return 'message';
    if (mode === 'body') return bodyUsable(body, view) ? 'body' : 'message';
    return bodyUsable(body, view) && paintsBubble(body, view) ? 'body' : 'message';
}
