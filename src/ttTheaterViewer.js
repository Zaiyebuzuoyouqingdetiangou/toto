// TT-only, click-loaded read-only view. This module intentionally imports no
// generator, repair engine, storage bucket or host-internal ChatSurface service.
const METADATA_KEY = 'rabbit_mirror_independent_outputs_v2';
const PAGE_SIZE = 20;
const MAX_SOURCE_CHARS = 1200000;
const MAX_NODES = 20000;
let activeViewer = null;

function contextNow() {
    try { return globalThis.SillyTavern?.getContext?.() || null; } catch { return null; }
}
function chatIdentity(ctx) {
    const meta = ctx?.chatMetadata;
    return [ctx?.chatId, ctx?.chat_id, ctx?.characterId, ctx?.groupId,
        meta?.chat_id, meta?.file_name, meta?.name].map(value => String(value ?? '')).join('\u0000');
}
function swipeOf(message) {
    const value = Number(message?.swipe_id ?? message?.swipeId ?? 0);
    return Number.isInteger(value) && value >= 0 ? value : -1;
}
function sourceHash(text) {
    let hash = 2166136261;
    for (const char of text) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
    return (hash >>> 0).toString(36);
}
function eligible(message) {
    return message && message.is_user !== true && message.is_system !== true
        && message.extra?.isSmallSys !== true
        && !Object.prototype.hasOwnProperty.call(message.extra || {}, 'tool_invocations')
        && typeof message.mes === 'string';
}
function savedFor(ctx, index, message) {
    const state = ctx?.chatMetadata?.[METADATA_KEY];
    if (state?.version !== 2 || swipeOf(message) < 0) return null;
    const key = `${index}:${swipeOf(message)}`;
    if (!Object.prototype.hasOwnProperty.call(state.owners || {}, key)) return null;
    const record = state.owners[key];
    return record && record.deleted !== true && typeof record.html === 'string' && record.html.trim() ? record : null;
}
function possibleInline(text) {
    return typeof text === 'string' && text.length <= MAX_SOURCE_CHARS
        && (/<toto\b/i.test(text) || (/<details\b/i.test(text) && /兔子镜|data-rabbit-mirror/.test(text)));
}
function inlineSource(message) {
    const display = message?.extra?.display_text;
    // A translated display layer that no longer contains the mirror must not
    // hide a genuine original toto block. Never inspect reasoning or swipes[].
    if (possibleInline(display)) return display;
    return possibleInline(message.mes) ? message.mes : '';
}

// Parse only inert templates, never a live hidden subtree. Every displayed byte
// is subsequently isolated in a no-permission iframe with a restrictive CSP.
function extractInline(source, doc) {
    const template = doc.createElement('template');
    template.innerHTML = source;
    if (template.content.querySelectorAll('*').length > MAX_NODES) throw new Error('limit');
    const candidates = [...template.content.querySelectorAll('toto, details')].filter(node => {
        if (node.localName === 'toto') return true;
        const summary = node.querySelector(':scope > summary');
        return /兔子镜/.test(summary?.textContent || '') || node.hasAttribute('data-rabbit-mirror-css-scope');
    });
    const roots = [];
    for (const node of candidates) {
        if (!roots.at(-1)?.contains(node)) roots.push(node);
        if (roots.length === 5) break;
    }
    // The original wrappers carry their own local styles. Do not copy arbitrary
    // surrounding message text/styles into a theater result.
    return roots.slice(0, 5).map(node => node.outerHTML).join('\n');
}

const ALLOWED_TAGS = new Set(('toto details summary div span p br hr strong b em i u s small blockquote pre code '
    + 'h1 h2 h3 h4 h5 h6 ul ol li dl dt dd table thead tbody tfoot tr td th caption colgroup col '
    + 'style label input button section article header footer main aside figure figcaption img '
    + 'svg g path rect circle ellipse line polyline polygon text tspan defs lineargradient radialgradient stop clippath').split(' '));
const ALLOWED_ATTRS = new Set(('id class style title role lang dir open for name type value checked disabled '
    + 'colspan rowspan scope width height alt viewbox fill stroke stroke-width d points x y x1 y1 x2 y2 '
    + 'cx cy r rx ry opacity transform offset stop-color stop-opacity gradientunits gradienttransform clip-path').split(' '));

export function createRabbitMirrorTtViewerDocument(source, doc = globalThis.document) {
    if (typeof source !== 'string' || source.length > MAX_SOURCE_CHARS) throw new Error('limit');
    const template = doc.createElement('template');
    template.innerHTML = source;
    const elements = [...template.content.querySelectorAll('*')];
    if (elements.length > MAX_NODES) throw new Error('limit');
    for (const node of elements) {
        if (!ALLOWED_TAGS.has(node.localName.toLowerCase())) { node.remove(); continue; }
        for (const attribute of [...node.attributes]) {
            const name = attribute.name.toLowerCase();
            if (name === 'src' && node.localName === 'img'
                && /^data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(attribute.value)) continue;
            if (!ALLOWED_ATTRS.has(name) && !name.startsWith('aria-') && !name.startsWith('data-')) node.removeAttribute(attribute.name);
        }
        if (node.localName === 'input' && !['checkbox', 'radio', 'hidden'].includes(node.type)) node.setAttribute('disabled', '');
        if (node.localName === 'button') node.setAttribute('type', 'button');
        if (node.localName === 'img' && !node.getAttribute('src')) {
            node.replaceWith(doc.createTextNode(node.getAttribute('alt') || '［外部图片未加载］'));
        }
    }
    // Links, nested frames, refresh/base elements, forms, SVG references and all
    // scripts are absent. CSP additionally blocks CSS imports/URLs and fetches.
    return '<!doctype html><html><head><meta charset="utf-8">'
        + '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'none\'; style-src \'unsafe-inline\'; img-src data:; font-src \'none\'; connect-src \'none\'; media-src \'none\'; frame-src \'none\'; object-src \'none\'; base-uri \'none\'; form-action \'none\'">'
        + '<meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1">'
        + '<style>html{color-scheme:light dark}body{margin:12px;font:16px/1.6 system-ui,sans-serif;overflow-wrap:anywhere}img{max-width:100%;height:auto}toto{display:block}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}</style>'
        + '</head><body>' + template.innerHTML + '</body></html>';
}

export function openRabbitMirrorTtTheaterViewer({ isCurrent } = {}) {
    if (!globalThis.__TAURITAVERN__) return null;
    const owner = globalThis.__rabbitMirrorTtBootstrap;
    const current = typeof isCurrent === 'function' ? isCurrent : () => !owner?.cancelled && globalThis.__rabbitMirrorTtBootstrap === owner;
    if (!current()) return null;
    activeViewer?.close();
    const doc = globalThis.document;
    let initial = contextNow();
    let chat = initial?.chat;
    let metadata = initial?.chatMetadata;
    let identity = chatIdentity(initial);
    let eventSource = initial?.eventSource;
    const changedEvent = initial?.eventTypes?.CHAT_CHANGED;
    const unsubscribe = typeof eventSource?.removeListener === 'function' ? 'removeListener'
        : typeof eventSource?.off === 'function' ? 'off' : '';
    const safeContext = Array.isArray(chat) && changedEvent && typeof eventSource?.on === 'function' && unsubscribe;
    initial = null;
    let returnFocus = doc.activeElement;
    const dialog = doc.createElement('dialog');
    dialog.id = 'rabbit_mirror_tt_viewer';
    dialog.setAttribute('aria-label', 'TT 已有小剧场查看');
    dialog.setAttribute('data-tt-mobile-surface', 'fullscreen-window');
    dialog.style.cssText = 'box-sizing:border-box;width:min(960px,calc(100vw - 24px));max-width:calc(100vw - 24px);max-height:calc(100dvh - 24px);padding:0;border:1px solid #777;border-radius:12px;z-index:2147483001;background:Canvas;color:CanvasText;';
    const surface = doc.createElement('div');
    dialog.append(surface);
    const shadow = surface.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>
      :host{color-scheme:light dark}*{box-sizing:border-box}.panel{padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));font:16px/1.5 system-ui,sans-serif;overflow-wrap:anywhere;overflow:auto;max-height:calc(100dvh - 26px);color:CanvasText;background:Canvas}
      h2{font-size:1.15em;margin:0}.toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:12px 0}.heading{position:sticky;top:0;z-index:2;background:Canvas;padding:4px 0}button{font:inherit;min-height:48px;padding:8px 12px;cursor:pointer;touch-action:manipulation;white-space:normal;border:1px solid currentColor;border-radius:8px;color:ButtonText;background:ButtonFace}button:focus-visible{outline:3px solid Highlight;outline-offset:2px}button:active{opacity:.7}button:disabled{opacity:.55;cursor:default}.close{margin-left:auto}.note{margin:12px 0}.rows{display:grid;gap:8px}.rows button{text-align:left;width:100%}iframe{display:block;width:100%;height:55vh;min-height:280px;border:1px solid #888;border-radius:8px;background:Canvas}#preview:empty{display:none}#selection{font-weight:600}p{margin:8px 0}
    </style><section class="panel"><div class="toolbar heading"><h2>TT 已有小剧场查看</h2><button class="close" type="button">关闭</button></div>
      <p class="note">仅查看当前聊天已有结果，不生成、不重试。此面板不等于修复原位置内嵌。</p>
      <details><summary style="min-height:48px;cursor:pointer;padding:10px 0">查看范围与交互限制</summary><p>每页读取 20 楼，只显示各楼当前选中的回复。旧版仅存在本机缓存、未进入当前聊天元数据的独立结果暂不可读。</p><p>脚本、维修交互、外部媒体和链接不可用；原生折叠及部分 CSS 交互可用。只读预览不会修改原记录。</p></details>
      <div class="toolbar"><button id="newer" type="button">较新 20 楼</button><button id="older" type="button">较早 20 楼</button><button id="refresh" type="button">刷新本页</button></div>
      <p id="status" role="status" aria-live="polite" aria-atomic="true"></p><div class="rows"></div><p id="selection"></p><div id="preview"></div>
      <p>预览区内的快捷键受隔离限制；可用上方或下方“关闭”，键盘可按 Tab 移出预览。</p><button id="close-bottom" type="button">关闭查看面板</button></section>`;
    const get = selector => shadow.querySelector(selector);
    let closed = false;
    let listening = false;
    let end = Array.isArray(chat) ? chat.length : 0;
    function sameChat() {
        const live = contextNow();
        return current() && live?.chat === chat && live?.chatMetadata === metadata && chatIdentity(live) === identity;
    }
    function close() {
        if (closed) return;
        closed = true;
        if (listening) {
            try { eventSource[unsubscribe](changedEvent, onChatChanged); } catch { /* Still remove our DOM/resources. */ }
            listening = false;
        }
        globalThis.removeEventListener('pagehide', close);
        get('#preview').replaceChildren();
        if (dialog.open && typeof dialog.close === 'function') dialog.close();
        dialog.remove();
        shadow.replaceChildren();
        if (activeViewer === controller) activeViewer = null;
        if (owner?.viewerClose === close) delete owner.viewerClose;
        if (current() && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
        // A settings UI can retain the idempotent controller after closing.
        // Do not let that controller retain the previous chat or HTML tree.
        chat = null; metadata = null; eventSource = null; identity = ''; returnFocus = null;
    }
    function onChatChanged() { close(); }
    function guard() { if (!closed && sameChat()) return true; close(); return false; }
    function show(index, expectedMessage, expectedSwipe, kind) {
        if (!guard()) return;
        const live = contextNow(), message = chat[index];
        get('#preview').replaceChildren();
        if (message !== expectedMessage || swipeOf(message) !== expectedSwipe) { page(); return; }
        let html = '', description = '';
        try {
            if (kind === 'saved') {
                const record = savedFor(live, index, message);
                if (!record) { page(); return; }
                html = record.html;
                const body = message.mes;
                const matches = body.length <= MAX_SOURCE_CHARS
                    && [record.sourceHash, record.bodyHash].filter(Boolean).includes(sourceHash(body));
                description = matches ? '已保存版本；源正文一致。' : '已保存版本；源正文已变更或无法核验，不代表当前正文的新成品。';
            } else {
                html = extractInline(inlineSource(message), doc);
                description = '来自当前回复中的兔子镜代码。';
            }
            if (!html) throw new Error('empty');
            const content = createRabbitMirrorTtViewerDocument(html, doc);
            if (!guard()) return;
            const frame = doc.createElement('iframe');
            frame.setAttribute('sandbox', '');
            frame.setAttribute('referrerpolicy', 'no-referrer');
            frame.setAttribute('title', `第 ${index + 1} 楼兔子镜隔离预览`);
            frame.srcdoc = content;
            get('#selection').textContent = `第 ${index + 1} 楼 · 回复 ${expectedSwipe + 1} · ${description}`;
            get('#preview').replaceChildren(frame);
        } catch {
            get('#selection').textContent = '此条内容过大、结构不受支持或没有可查看的小剧场；原记录未修改。';
        }
    }
    function page() {
        if (!guard()) return;
        get('#preview').replaceChildren(); get('#selection').textContent = '';
        const rows = get('.rows'); rows.replaceChildren();
        end = Math.min(Math.max(0, end), chat.length);
        const start = Math.max(0, end - PAGE_SIZE), ctx = contextNow();
        let count = 0;
        for (let index = end - 1; index >= start; index--) {
            const message = chat[index];
            if (!eligible(message)) continue;
            const kinds = [];
            if (savedFor(ctx, index, message)) kinds.push(['saved', '独立 API · 已保存版本']);
            if (inlineSource(message)) kinds.push(['inline', '跟随正文中的小剧场']);
            for (const [kind, label] of kinds) {
                const button = doc.createElement('button'); button.type = 'button';
                const swipe = swipeOf(message);
                button.textContent = `第 ${index + 1} 楼 · 回复 ${swipe + 1} · ${label}`;
                button.addEventListener('click', () => show(index, message, swipe, kind));
                rows.append(button); count++;
            }
        }
        get('#newer').disabled = end >= chat.length;
        get('#older').disabled = start === 0;
        get('#status').textContent = chat.length ? `第 ${start + 1}–${end} 楼：找到 ${count} 项。未显示不等于原记录被删除。` : '当前聊天没有消息。';
    }
    get('.close').addEventListener('click', close);
    get('#close-bottom').addEventListener('click', close);
    get('#newer').addEventListener('click', () => { if (!guard()) return; end = Math.min(chat.length, end + PAGE_SIZE); page(); });
    get('#older').addEventListener('click', () => { if (!guard()) return; end = Math.max(0, end - PAGE_SIZE); page(); });
    get('#refresh').addEventListener('click', page);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('close', close);
    const controller = Object.freeze({ close, dispose: close });
    activeViewer = controller;
    if (owner) owner.viewerClose = close;
    doc.body.append(dialog);
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    globalThis.addEventListener('pagehide', close, { once: true });
    if (safeContext) {
        try { eventSource.on(changedEvent, onChatChanged); listening = true; } catch { /* Fail closed below. */ }
    }
    if (listening) page();
    else {
        get('#status').textContent = '当前宿主未提供完整聊天上下文或聊天切换通知，暂不能安全读取。请打开聊天后重新进入；没有读取其他聊天或本机缓存。';
        for (const id of ['#newer', '#older', '#refresh']) get(id).disabled = true;
    }
    get('.close').focus({ preventScroll: true });
    return controller;
}
