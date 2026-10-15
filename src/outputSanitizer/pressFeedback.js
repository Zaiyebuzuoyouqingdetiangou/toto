// 按下手感：模型画了看起来能按的东西，却常常没写「按下去」的样子，按了毫无反应，手感很假。
// 这里按它「看起来是什么」补一个对得上的按下反馈，只在按住的那一下出现，松手就回去：
//   凸起的（有外阴影）→ 往下沉，外阴影收短，顶上压出一点内阴影，像按下一颗实体键；
//   平的色块或描边按钮 → 轻轻缩一点、暗一点；
//   小圆钮 → 缩得多一点，像戳了一下；
//   纯文字、行内字 → 只淡一下，不动位置。
// 不碰的情况：模型自己写了 :active（它有自己的手感）、禁用的、本身就有 transform 的不位移只变暗、
// 兔子镜自己的按钮和标题栏。不改模型写的样式：反馈全靠一个临时属性和一条样式规则，松手即撤。
// 系统设了「减少动态效果」时只变暗、不位移不缩放。

const KIND_ATTR = 'data-rm-press';
const PRESSING_ATTR = 'data-rm-pressing';
const RELEASING_ATTR = 'data-rm-press-release';
const SHADOW_VAR = '--rm-press-shadow';
const SINK_VAR = '--rm-press-sink';
const STYLE_ID = 'rabbit-mirror-press-feedback-style';
const BOUND = new WeakSet();
const ACTIVE_CSS_CACHE = new WeakMap();

const CANDIDATE = 'button, [role="button"], label, input[type="button"], input[type="submit"], input[type="reset"], [data-rm-step], [data-rm-reset], [data-rm-spoiler], [data-rm-toggle]';
const TOTO_CHROME = [
    'summary', '[data-rabbit-mirror-maintenance-rabbit]', '[data-rabbit-mirror-feedback-cat]', '[data-rabbit-mirror-recipe]',
    '[data-rabbit-mirror-resay]', '[data-rabbit-mirror-tool-entry-host]', '[data-rm-face-swipe-host]', '[data-rm-image-region]',
    '[data-rm-image-portal]', '[data-rabbit-mirror-maintenance-menu]', '[data-rabbit-mirror-feedback-cat-menu]',
    '[data-rabbit-mirror-recipe-menu]', '[data-rabbit-mirror-interaction-diagnostic]',
].join(',');

function ensureStyle(doc) {
    if (!doc?.head || doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    const press = 'transition:transform .07s ease-out,box-shadow .07s ease-out,filter .07s ease-out,opacity .07s ease-out!important;';
    const release = 'transition:transform .16s ease-out,box-shadow .16s ease-out,filter .16s ease-out,opacity .16s ease-out!important;';
    style.textContent = [
        `[${PRESSING_ATTR}]{${press}}`,
        `[${RELEASING_ATTR}]{${release}}`,
        `[${KIND_ATTR}="raised"][${PRESSING_ATTR}]{transform:translateY(var(${SINK_VAR},1px))!important;box-shadow:var(${SHADOW_VAR})!important;filter:brightness(.97)!important}`,
        `[${KIND_ATTR}="flat"][${PRESSING_ATTR}]{transform:scale(.97)!important;filter:brightness(.94)!important}`,
        `[${KIND_ATTR}="knob"][${PRESSING_ATTR}]{transform:scale(.92)!important;filter:brightness(.94)!important}`,
        `[${KIND_ATTR}="tint"][${PRESSING_ATTR}]{filter:brightness(.93)!important}`,
        `[${KIND_ATTR}="ink"][${PRESSING_ATTR}]{opacity:.62!important}`,
        `@media (prefers-reduced-motion:reduce){[${PRESSING_ATTR}]{transform:none!important}}`,
    ].join('');
    doc.head.append(style);
}

function splitTopLevel(text) {
    const parts = [];
    let depth = 0, start = 0;
    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (char === '(') depth += 1;
        else if (char === ')') depth = Math.max(0, depth - 1);
        else if (char === ',' && depth === 0) { parts.push(text.slice(start, index).trim()); start = index + 1; }
    }
    parts.push(text.slice(start).trim());
    return parts.filter(Boolean);
}

/** 按下去时的阴影：外阴影的偏移和模糊收短（像离桌面更近），内阴影保留，再在顶上压一点内阴影。 */
export function pressedShadow(computedShadow) {
    const text = String(computedShadow || '').trim();
    let maxDrop = 0;
    const out = [];
    if (text && text !== 'none') {
        for (const part of splitTopLevel(text)) {
            if (/\binset\b/.test(part)) { out.push(part); continue; }
            const color = (part.match(/(rgba?\([^)]*\)|#[0-9a-f]{3,8}|\b[a-z]+\b(?=\s|$))/i) || [''])[0];
            const numbers = part.replace(color, ' ').match(/-?\d*\.?\d+px|\b0\b/g) || [];
            const [x = 0, y = 0, blur = 0, spread = 0] = numbers.map(value => parseFloat(value) || 0);
            // 只有不模糊的实心阴影才是「按键的厚度」，决定沉多少；柔和的环境阴影只跟着收短。
            if (blur <= 1) maxDrop = Math.max(maxDrop, y);
            out.push(`${color} ${(x * 0.3).toFixed(1)}px ${(y * 0.3).toFixed(1)}px ${(blur * 0.5).toFixed(1)}px ${spread}px`.trim());
        }
    }
    out.push('inset 0 1px 2px rgba(0,0,0,.16)');
    // 立体按键（底下一条实心阴影当厚度）按下去要沉得更多，最多 3px。
    const sink = Math.max(1, Math.min(3, Math.round(maxDrop * 0.6)));
    return { shadow: out.join(', '), sink: `${sink}px` };
}

function hasOuterShadow(shadow) {
    const text = String(shadow || '');
    return !!text && text !== 'none' && splitTopLevel(text).some(part => !/\binset\b/.test(part));
}

function transparentColor(color) {
    return !color || /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/i.test(color);
}

// 模型自己写了 :active 的元素：它有自己的按下样子，不叠加。
function authorActiveSelectors(face) {
    if (ACTIVE_CSS_CACHE.has(face)) return ACTIVE_CSS_CACHE.get(face);
    const selectors = [];
    for (const style of face.querySelectorAll('style')) {
        if (style.id === STYLE_ID) continue;
        const css = String(style.textContent || '').replace(/\/\*[\s\S]*?\*\//g, '');
        for (const match of css.matchAll(/([^{}@]+)\{/g)) {
            for (const selector of match[1].split(',')) {
                if (!/:active\b/.test(selector)) continue;
                // 去掉 :active 和它后面的部分，拿前面那段去匹配被按的元素或它的祖先。
                const base = selector.split(/:active\b/)[0].trim();
                if (base) selectors.push(base);
            }
        }
    }
    ACTIVE_CSS_CACHE.set(face, selectors);
    return selectors;
}

function hasAuthorActive(el, face) {
    for (const selector of authorActiveSelectors(face)) {
        try { if (el.matches(selector) || el.closest(selector)) return true; } catch { /* 写坏的选择器跳过 */ }
    }
    return false;
}

/** 判断一个被按的元素该用哪种按下手感；不该加时返回空字符串。 */
export function pressKindFor(el, face) {
    const view = el.ownerDocument?.defaultView || globalThis;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return '';
    if (face && hasAuthorActive(el, face)) return '';
    let style;
    try { style = view.getComputedStyle(el); } catch { return ''; }
    if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none') return '';
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return '';
    const viewportHeight = view.innerHeight || 800;
    const filled = !transparentColor(style.backgroundColor) || (style.backgroundImage && style.backgroundImage !== 'none');
    const bordered = ['Top', 'Right', 'Bottom', 'Left'].some(side => parseFloat(style[`border${side}Width`]) > 0 && !transparentColor(style[`border${side}Color`]));
    const outer = hasOuterShadow(style.boxShadow);
    if (style.display === 'inline' || (!filled && !bordered && !outer)) return 'ink';
    const ownFilter = style.filter && style.filter !== 'none';
    // 本身带 transform（旋转、偏移）的不再位移，免得把模型摆好的角度冲掉；也自带滤镜时就不加了。
    if (style.transform && style.transform !== 'none') return ownFilter ? '' : 'tint';
    // 很大的一块（有时模型把整面都包进一个 label）：按哪里整面都会变暗，不加。
    if (rect.height > viewportHeight * 0.45 || rect.height > 320) return '';
    if (ownFilter) return '';
    if (outer) return 'raised';
    const radius = parseFloat(style.borderTopLeftRadius) || 0;
    if (rect.width <= 64 && rect.height <= 64 && radius >= Math.min(rect.width, rect.height) / 2 - 1) return 'knob';
    return 'flat';
}

function pointerCursor(node) {
    try { return (node.ownerDocument.defaultView || globalThis).getComputedStyle(node).cursor === 'pointer'; } catch { return false; }
}

function findPressable(target, face) {
    const start = target?.nodeType === 1 ? target : target?.parentElement;
    if (!start || !face.contains(start) || start.closest?.(TOTO_CHROME)) return null;
    // 先找最近的按钮、标签这类明确能按的东西。
    const candidate = start.closest?.(CANDIDATE);
    if (candidate && face.contains(candidate) && candidate !== face) return candidate;
    // 再看手形光标：光标会被子元素继承，所以往上找到「是它自己设的」那一层（它的父元素不是手形）。
    if (!pointerCursor(start)) return null;
    let node = start;
    while (node.parentElement && node.parentElement !== face && face.contains(node.parentElement) && pointerCursor(node.parentElement)) node = node.parentElement;
    if (node === face) return null;
    // 模型有时给整面或整块大底板设了手形光标：点哪里都会整块变暗，不对，这种不算。
    const view = node.ownerDocument.defaultView || globalThis;
    const height = node.getBoundingClientRect().height;
    if (height > 320 || height > (view.innerHeight || 800) * 0.45) return null;
    return node;
}

function hasOwnTransition(el) {
    try {
        const durations = String((el.ownerDocument.defaultView || globalThis).getComputedStyle(el).transitionDuration || '0s');
        return durations.split(',').some(value => parseFloat(value) > 0);
    } catch { return false; }
}

function press(el, face) {
    const kind = pressKindFor(el, face);
    if (!kind) return null;
    // 要在套上按下样式之前看（先撤掉上一次还没结束的回弹），按下时的过渡是兔子镜自己的。
    el.removeAttribute(RELEASING_ATTR);
    if (hasOwnTransition(el)) el.setAttribute('data-rm-press-own-transition', 'true');
    else el.removeAttribute('data-rm-press-own-transition');
    el.setAttribute(KIND_ATTR, kind);
    if (kind === 'raised') {
        let shadow = '';
        try { shadow = (el.ownerDocument.defaultView || globalThis).getComputedStyle(el).boxShadow; } catch { shadow = ''; }
        const pressed = pressedShadow(shadow);
        el.style.setProperty(SHADOW_VAR, pressed.shadow);
        el.style.setProperty(SINK_VAR, pressed.sink);
    }
    el.removeAttribute(RELEASING_ATTR);
    el.setAttribute(PRESSING_ATTR, 'true');
    return el;
}

function release(el) {
    if (!el?.hasAttribute?.(PRESSING_ATTR)) return;
    el.removeAttribute(PRESSING_ATTR);
    // 松手后紧接着就是点击：模型常让被点的东西自己翻面、展开，写了自己的过渡时间（比如翻牌 0.6 秒）。
    // 这时不能再套回弹的过渡，否则会把模型的翻面压成 0.16 秒；只在模型没写过渡时才加回弹。
    if (!el.hasAttribute('data-rm-press-own-transition')) el.setAttribute(RELEASING_ATTR, 'true');
    const view = el.ownerDocument?.defaultView || globalThis;
    view.setTimeout(() => {
        if (el.hasAttribute(PRESSING_ATTR)) return;
        el.removeAttribute(RELEASING_ATTR);
        el.removeAttribute('data-rm-press-own-transition');
        el.style.removeProperty(SHADOW_VAR);
        el.style.removeProperty(SINK_VAR);
        if (!el.getAttribute('style')?.trim()) el.removeAttribute('style');
    }, 200);
}

/** 给一面兔子镜装上按下手感（重复调用不会重复装）。 */
export function installPressFeedback(root) {
    const face = root?.matches?.('details') ? root : root?.querySelector?.('details');
    if (!face || BOUND.has(face)) return;
    BOUND.add(face);
    const doc = face.ownerDocument;
    ensureStyle(doc);
    let current = null, startX = 0, startY = 0;
    const end = () => { if (current) release(current); current = null; };
    face.addEventListener('pointerdown', event => {
        if (event.button > 0) return;
        end();
        const el = findPressable(event.target, face);
        if (!el) return;
        current = press(el, face);
        startX = event.clientX; startY = event.clientY;
    }, true);
    face.addEventListener('pointermove', event => {
        // 手指一滑就是在滚动，不算按（鼠标按住移动不是滚动，移出那个元素时才松开）。
        if (current && event.pointerType !== 'mouse' && Math.hypot(event.clientX - startX, event.clientY - startY) > 10) end();
    }, true);
    for (const type of ['pointerup', 'pointercancel']) face.addEventListener(type, end, true);
    // 手指或鼠标移出这一面就松开。pointerleave 在捕获阶段也会收到「按钮里的小字」这类子元素的离开，
    // 那时手还按着，不能松；只认这一面自己的离开，以及离开被按的那个元素本身。
    face.addEventListener('pointerleave', event => {
        if (event.target === face || event.target === current) end();
    }, true);
    // 键盘：回车、空格按住时也有同样的手感。
    face.addEventListener('keydown', event => {
        if ((event.key !== 'Enter' && event.key !== ' ') || event.repeat) return;
        const el = findPressable(event.target, face);
        if (el && el === event.target) { end(); current = press(el, face); }
    }, true);
    face.addEventListener('keyup', end, true);
}
