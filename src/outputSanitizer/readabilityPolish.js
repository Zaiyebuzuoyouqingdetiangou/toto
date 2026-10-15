// 读得舒服：画面显示出来后，兔子镜自己量几项常见的小毛病，当场修，不调用模型、不发规则。
//   1. 中文排版：标点不放在行首（line-break:strict），中英文之间自动留一点空（text-autospace，浏览器支持时）。
//   2. 字太小：手机上正文小于 12px 看不清，放大到 12px。
//   3. 中文段落行距太挤：一段较长的中文行距低于 1.45 倍，放到 1.6 倍。
//   4. 字贴着边：有底色的块里文字左右几乎没留白，补一点内边距。
//   5. 按钮太小：小于 28px 的按钮、可点的小圆点，只把「能按到的范围」扩大，样子不变。
// 每一项改完都量一遍：改了以后撑破了原来的框（多出滚动、被裁掉），就撤回这一项，不硬改。
// 改动都靠属性加一条样式规则，撤掉属性就回到模型原来的样子；不碰模型写的内联样式。

const POLISH_ATTR = 'data-rm-polish';
const FONT_ATTR = 'data-rm-polish-font';
const LINE_ATTR = 'data-rm-polish-line';
const PAD_ATTR = 'data-rm-polish-pad';
const TAP_ATTR = 'data-rm-polish-tap';
const STYLE_ID = 'rabbit-mirror-readability-polish-style';
const SEEN = new WeakSet();
const BOUND = new WeakSet();
const MAX_ELEMENTS = 600;

const TOTO_CHROME = 'summary, [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-rabbit-mirror-recipe], '
    + '[data-rabbit-mirror-resay], [data-rabbit-mirror-tool-entry-host], [data-rm-face-swipe-host], [data-rm-image-region], [data-rm-image-portal], '
    + '[data-rabbit-mirror-maintenance-menu], [data-rabbit-mirror-feedback-cat-menu], [data-rabbit-mirror-recipe-menu], [data-rabbit-mirror-interaction-diagnostic]';
const TAPPABLE = 'button, [role="button"], label[for], input[type="button"], input[type="submit"], [data-rm-step], [data-rm-pick], [data-rm-toggle], [data-rm-hold], [data-rm-spoiler]';

function ensureStyle(doc) {
    if (!doc?.head || doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
        `details[${POLISH_ATTR}]{line-break:strict;text-autospace:normal}`,
        `[${FONT_ATTR}]{font-size:12px!important}`,
        `[${LINE_ATTR}]{line-height:1.6!important}`,
        `[${PAD_ATTR}]{padding-left:8px!important;padding-right:8px!important}`,
        // 只扩大能按到的范围：一层看不见的透明区域盖在按钮四周。
        `[${TAP_ATTR}]::after{content:"";position:absolute;inset:calc(var(--rm-tap-grow,6px) * -1);pointer-events:auto}`,
    ].join('');
    doc.head.append(style);
}

function view(node) { return node.ownerDocument?.defaultView || globalThis; }
function css(node, pseudo) { try { return view(node).getComputedStyle(node, pseudo); } catch { return null; } }

function directText(node) {
    let text = '';
    for (const child of node.childNodes) if (child.nodeType === 3) text += child.textContent;
    return text.replace(/\s+/g, '');
}

function transparent(color) { return !color || /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/i.test(color); }

function lineCount(node) {
    const style = css(node);
    const size = parseFloat(style?.fontSize) || 14;
    const line = style?.lineHeight === 'normal' ? size * 1.3 : (parseFloat(style?.lineHeight) || size * 1.3);
    return Math.max(1, Math.round(node.getBoundingClientRect().height / line));
}

// 改一项，量一下有没有把框撑破；撑破了就撤回。
// short：短标签、小标题这类。放大后自己多折出一行，或者把同一排的东西挤得变高（折行），也算改坏了。
function tryFix(node, attr, value = '', short = false) {
    const watch = [node, node.parentElement, node.parentElement?.parentElement].filter(Boolean);
    const before = watch.map(el => [el.scrollWidth - el.clientWidth, el.scrollHeight - el.clientHeight]);
    const siblings = short && node.parentElement ? [...node.parentElement.children].filter(el => el !== node) : [];
    const siblingHeights = siblings.map(el => el.getBoundingClientRect().height);
    const lines = short ? lineCount(node) : 0;
    node.setAttribute(attr, value || 'true');
    if (short && (lineCount(node) > lines || siblings.some((el, index) => el.getBoundingClientRect().height > siblingHeights[index] + 1))) {
        node.removeAttribute(attr);
        return false;
    }
    const broke = watch.some((el, index) => {
        const style = css(el);
        const clips = style && /(hidden|clip|auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`);
        const grewX = el.scrollWidth - el.clientWidth > Math.max(1, before[index][0] + 1);
        const grewY = clips && el.scrollHeight - el.clientHeight > Math.max(1, before[index][1] + 1);
        return grewX || grewY;
    });
    if (broke) { node.removeAttribute(attr); return false; }
    return true;
}

function polishText(node, phone) {
    const text = directText(node);
    if (!text) return;
    const style = css(node);
    if (!style || style.display === 'none' || style.visibility === 'hidden') return;
    const size = parseFloat(style.fontSize) || 0;
    // 2. 字太小（只看手机宽度；一两个字的图标、角标不算）。
    if (phone && size > 0 && size < 12 && text.length >= 3 && !node.closest('svg')) tryFix(node, FONT_ATTR, '', text.length < 30);
    // 3. 中文段落行距太挤。
    const cjk = (text.match(/[㐀-鿿]/g) || []).length;
    if (cjk >= 24 && style.display !== 'inline') {
        const line = style.lineHeight === 'normal' ? 1.3 : (parseFloat(style.lineHeight) || 0) / (parseFloat(css(node).fontSize) || 1);
        if (line > 0 && line < 1.45) tryFix(node, LINE_ATTR);
    }
    // 4. 自己有一块看得见的底色（和外面不一样）的块，文字左右几乎没留白。
    if (style.display !== 'inline' && text.length >= 4) {
        const own = !transparent(style.backgroundColor) || (style.backgroundImage && style.backgroundImage !== 'none');
        const parent = css(node.parentElement);
        const differs = !parent || style.backgroundColor !== parent.backgroundColor || (style.backgroundImage && style.backgroundImage !== 'none');
        const pad = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
        if (own && differs && pad < 4 && node.getBoundingClientRect().width >= 60) tryFix(node, PAD_ATTR);
    }
}

function polishTap(node) {
    if (node.hasAttribute(TAP_ATTR) || node.disabled) return;
    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const small = Math.min(rect.width, rect.height);
    if (small >= 28) return;
    const after = css(node, '::after');
    if (after && after.content && after.content !== 'none' && after.content !== 'normal') return; // 模型自己用了 ::after，不抢
    const style = css(node);
    // 透明扩大区要以按钮为参照；按钮是普通排布时补一个不移动位置的 relative。里面有绝对定位的东西就不动，免得它们换参照。
    if (style?.position === 'static') {
        if ([...node.querySelectorAll('*')].some(child => /absolute|fixed/.test(css(child)?.position || ''))) return;
        node.style.position = 'relative';
        node.setAttribute('data-rm-polish-pos', 'true');
    }
    // 最多往外扩 6px，免得挨得很近的几个小按钮互相抢着被按到。
    node.style.setProperty('--rm-tap-grow', `${Math.min(6, Math.ceil((32 - small) / 2))}px`);
    node.setAttribute(TAP_ATTR, 'true');
}

/** 量一遍这一面里还没看过的元素（新打开的内容也会补上）。 */
export function polishReadability(root) {
    const face = root?.matches?.('details') ? root : root?.querySelector?.('details');
    if (!face) return 0;
    ensureStyle(face.ownerDocument);
    face.setAttribute(POLISH_ATTR, 'true');
    const phone = (view(face).innerWidth || 1024) <= 520;
    let count = 0;
    for (const node of face.querySelectorAll('*')) {
        if (count >= MAX_ELEMENTS) break;
        if (SEEN.has(node) || node.closest(TOTO_CHROME) || node.closest('svg') || /^(STYLE|SCRIPT|SVG|IMG|BR|INPUT|TEXTAREA|SELECT)$/i.test(node.tagName)) continue;
        const rect = node.getBoundingClientRect();
        if (!rect.width || !rect.height) continue; // 还没显示出来的，等它出来再看
        SEEN.add(node);
        count += 1;
        try {
            polishText(node, phone);
            if (node.matches(TAPPABLE)) polishTap(node);
        } catch { /* 量不了就跳过这一个 */ }
    }
    return count;
}

/** 装到一面上：现在量一遍；之后每次点击、展开，过一会儿再补量新出现的内容。 */
export function installReadabilityPolish(root) {
    const face = root?.matches?.('details') ? root : root?.querySelector?.('details');
    if (!face || BOUND.has(face)) return;
    BOUND.add(face);
    const run = () => { try { polishReadability(face); } catch { /* 只是锦上添花 */ } };
    run();
    let timer = 0;
    const later = () => { const win = view(face); win.clearTimeout(timer); timer = win.setTimeout(run, 350); };
    face.addEventListener('click', later, true);
    face.addEventListener('toggle', later, true);
}
