// 外置模式下，标题被做成单独的一条标题条，模型给整面写的外框（底色、边框、圆角、阴影）会被插件清掉，
// 否则外框会把标题条和正文一起包住，框套框。清掉以后正文直接露在聊天背景上，看着很怪。
// 这里把模型写的外框挪到标题下面的正文那一块：标题条照旧单独一条，正文用模型自己写的外框框起来。
//
// 只记在两个标记和几条变量上，真正画框的是 style.css 里一条只在「外置壳」里生效的规则：
//   - 存档、收藏、内嵌模式里这条规则不生效，不会框套框；存档前清掉标记，下次挂载重新量。
//   - 插件别的修复用 !important 写在正文上的（比如清掉整宽的衬底）照样压得住它，不会被刷回来。
// 正文那一块自己已经画了的那一项不补；正文分成好几块时不挪（不知道该框哪一块）。

const PROBE_ATTR = 'data-rm-frame-probe';
export const FACE_FRAME_ATTR = 'data-rm-face-frame';
export const FACE_FRAME_BODY_ATTR = 'data-rm-face-frame-body';
export const FACE_FRAME_VARS = ['--rm-face-frame-bg', '--rm-face-frame-bg-image', '--rm-face-frame-border', '--rm-face-frame-radius', '--rm-face-frame-shadow'];
const SKIP_TAGS = new Set(['SUMMARY', 'STYLE', 'SCRIPT', 'TEMPLATE', 'LINK', 'META']);

function alphaOf(color) {
    const text = String(color || '').trim().toLowerCase();
    if (!text || text === 'transparent') return 0;
    const slash = text.match(/\/\s*([\d.]+%?)\s*\)$/);
    if (slash) return slash[1].endsWith('%') ? Number.parseFloat(slash[1]) / 100 : Number.parseFloat(slash[1]);
    const match = text.match(/^rgba?\(([^)]*)\)$/);
    if (!match) return 1;
    const parts = match[1].split(/[\s,]+/).filter(Boolean);
    return parts.length >= 4 ? Number.parseFloat(parts[3]) : 1;
}

// 四边一样的看得见的边框，返回「宽 样式 颜色」；没有边框或四边不一样就取最显眼的一边。
function borderOf(style) {
    const sides = ['Top', 'Right', 'Bottom', 'Left']
        .map(side => ({ width: Number.parseFloat(style[`border${side}Width`]) || 0, style: style[`border${side}Style`], color: style[`border${side}Color`] }))
        .filter(side => side.width > 0 && side.style !== 'none' && alphaOf(side.color) > 0.02);
    if (!sides.length) return '';
    const best = sides.sort((a, b) => b.width - a.width)[0];
    return `${best.width}px ${best.style} ${best.color}`;
}

// 模型给 details 写的样子：插件那条清空规则带着 :not([data-rm-frame-probe])，量的时候先让它不生效；
// 探测时过渡关掉（style.css），免得量到过渡起点的透明。
function authoredFrame(details, view) {
    details.setAttribute(PROBE_ATTR, 'true');
    try {
        const style = view.getComputedStyle(details);
        return {
            bg: alphaOf(style.backgroundColor) > 0.02 ? style.backgroundColor : '',
            bgImage: style.backgroundImage && style.backgroundImage !== 'none' ? style.backgroundImage : '',
            border: borderOf(style),
            radius: style.borderRadius && !/^0(?:px)?(?:\s+0(?:px)?)*$/.test(style.borderRadius) ? style.borderRadius : '',
            shadow: style.boxShadow && style.boxShadow !== 'none' ? style.boxShadow : '',
        };
    } catch {
        return null;
    } finally {
        details.removeAttribute(PROBE_ATTR);
    }
}

function faceBody(details) {
    const children = [...details.children].filter(node => !SKIP_TAGS.has(node.tagName)
        && !node.matches('[data-collapse-btn], .details-collapse-btn, [data-rm-mobile-controls], [popover]'));
    return children.length === 1 ? children[0] : null;
}

export function clearFaceFrame(details) {
    if (!details?.removeAttribute) return;
    details.removeAttribute(FACE_FRAME_ATTR);
    for (const name of FACE_FRAME_VARS) details.style?.removeProperty?.(name);
    for (const node of details.querySelectorAll?.(`[${FACE_FRAME_BODY_ATTR}]`) || []) node.removeAttribute(FACE_FRAME_BODY_ATTR);
    for (const node of details.querySelectorAll?.(`[${FACE_FLUSH_ATTR}]`) || []) node.removeAttribute(FACE_FLUSH_ATTR);
    details.removeAttribute('data-rm-face-flush-checked');
    for (const node of details.querySelectorAll?.('[data-rm-face-flush-checked]') || []) node.removeAttribute('data-rm-face-flush-checked');
}

// 模型常把正文那一块写成「外框里缩进一圈」（margin:16px），外框是 details 自己画的。外置时外框被清掉，
// 正文就比上面的标题条左右各窄一截。这里把这种左右对称、不大的缩进去掉（只去左右，上下不动），正文和标题一样宽。
// 只认「宽度跟着容器走」的块：试着去掉左右外边距，它跟着变宽才算缩进；写死宽度、靠 margin:auto 居中的卡片
// 去掉外边距也不会变宽，不动（不然会被挤到左边）。左右很宽的（窄面在宽屏上居中）也不动。
// 这样量出来的结论和屏幕多宽无关；只在这一面真的显示着时量（收起、切到别的面时量不准，等显示出来再量）。
export const FACE_FLUSH_ATTR = 'data-rm-face-flush';
const FLUSH_CHECKED_ATTR = 'data-rm-face-flush-checked';
const MAX_INSET = 40;
export function flushFaceBlocks(details) {
    const view = details?.ownerDocument?.defaultView;
    if (!details?.isConnected || typeof view?.getComputedStyle !== 'function') return 0;
    if (details.hasAttribute(FLUSH_CHECKED_ATTR)) return 0;
    // 收起、藏着的面先不量（便宜的判断在前，不为它强制排版）；展开和切面时会再叫到这里。
    if (!details.open || details.hidden || details.style.display === 'none' || details.hasAttribute('data-rm-ephemeral-failure')) return 0;
    const blocks = [...details.children].filter(node => !SKIP_TAGS.has(node.tagName)
        && !node.matches('[data-collapse-btn], .details-collapse-btn, [data-rm-mobile-controls], [popover]'));
    // 没显示出来（收起、多面里不是当前这一面）：现在量不准，先不量。
    if (!blocks.length || !blocks.some(node => node.getClientRects().length)) return 0;
    let count = 0;
    for (const node of blocks) {
        if (!node.getClientRects().length) continue;
        let style;
        try { style = view.getComputedStyle(node); } catch { continue; }
        if (style.position === 'absolute' || style.position === 'fixed' || style.display.startsWith('inline')) continue;
        const left = Number.parseFloat(style.marginLeft) || 0, right = Number.parseFloat(style.marginRight) || 0;
        if (left <= 0 || right <= 0 || left > MAX_INSET || right > MAX_INSET || Math.abs(left - right) > 2) continue;
        const before = node.getBoundingClientRect().width;
        node.setAttribute(FACE_FLUSH_ATTR, 'true');
        const after = node.getBoundingClientRect().width;
        if (after - before < (left + right) - 2) { node.removeAttribute(FACE_FLUSH_ATTR); continue; }
        count += 1;
    }
    details.setAttribute(FLUSH_CHECKED_ATTR, 'true');
    return count;
}

/** 把一面（details）模型写的外框挪到它的正文那一块上。返回是否挪了。 */
export function carryFaceFrame(details) {
    const view = details?.ownerDocument?.defaultView;
    if (!details?.isConnected || typeof view?.getComputedStyle !== 'function') return false;
    // 量过了（挪了是 true，没什么可挪是 none）：不再量，ensureExternalTools 常被调到。
    if (details.hasAttribute(FACE_FRAME_ATTR)) {
        // 记号还在、正文却换了（维修兔修复是换一份克隆上去）：重新量。
        if (details.getAttribute(FACE_FRAME_ATTR) !== 'true' || details.querySelector(':scope > [data-rm-face-frame-body]')) return details.getAttribute(FACE_FRAME_ATTR) === 'true';
        clearFaceFrame(details);
    }
    // 「这一版失败」遮罩挂着时正文不是真正的正文：不量、不记。
    if (details.hasAttribute('data-rm-ephemeral-failure')) return false;
    const body = faceBody(details);
    const none = () => { details.setAttribute(FACE_FRAME_ATTR, 'none'); return false; };
    if (!body) return none();
    const frame = authoredFrame(details, view);
    if (!frame) return false;
    if (!frame.bg && !frame.bgImage && !frame.border && !frame.shadow) return none();
    let own;
    try { own = view.getComputedStyle(body); } catch { return false; }
    const ownBackground = alphaOf(own.backgroundColor) > 0.02 || (own.backgroundImage && own.backgroundImage !== 'none');
    const vars = {
        '--rm-face-frame-bg': ownBackground ? '' : frame.bg,
        '--rm-face-frame-bg-image': ownBackground ? '' : frame.bgImage,
        '--rm-face-frame-border': borderOf(own) ? '' : frame.border,
        '--rm-face-frame-radius': (Number.parseFloat(own.borderTopLeftRadius) || 0) ? '' : frame.radius,
        '--rm-face-frame-shadow': own.boxShadow && own.boxShadow !== 'none' ? '' : frame.shadow,
    };
    if (!vars['--rm-face-frame-bg'] && !vars['--rm-face-frame-bg-image'] && !vars['--rm-face-frame-border'] && !vars['--rm-face-frame-shadow']) return none();
    // 正文上记下要补哪几项（bg / bgimg / border / radius / shadow）：样式只画这几项，没补的保持正文自己的。
    const parts = { '--rm-face-frame-bg': 'bg', '--rm-face-frame-bg-image': 'bgimg', '--rm-face-frame-border': 'border', '--rm-face-frame-radius': 'radius', '--rm-face-frame-shadow': 'shadow' };
    const tokens = [];
    for (const [name, value] of Object.entries(vars)) {
        if (value) { details.style.setProperty(name, value); tokens.push(parts[name]); } else details.style.removeProperty(name);
    }
    body.setAttribute(FACE_FRAME_BODY_ATTR, tokens.join(' '));
    details.setAttribute(FACE_FRAME_ATTR, 'true');
    return true;
}

/** 外置宿主里每一面都挪一遍。 */
const TOGGLE_BOUND = new WeakSet();
export function carryExternalFaceFrames(host) {
    let count = 0;
    for (const details of host?.querySelectorAll?.(':scope > details[data-rabbit-mirror-external-details="true"]:not(.rabbit-mirror-external-placeholder)') || []) {
        // 收起着挂上去的面：展开时再量一次缩进。
        if (!TOGGLE_BOUND.has(details)) {
            TOGGLE_BOUND.add(details);
            details.addEventListener('toggle', () => { if (details.open && details.closest('[data-rm-placement="external"]')) { try { flushFaceBlocks(details); } catch { /* 量不了就照原样 */ } } });
        }
        try { flushFaceBlocks(details); } catch { /* 量不了就照原样 */ }
        try { if (carryFaceFrame(details)) count += 1; } catch { /* 一面挪不了不影响别的面 */ }
    }
    return count;
}
