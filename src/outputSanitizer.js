import { getSettings } from './settings.js';

// Cached SillyTavern script module. In module builds, chat is not guaranteed to be exposed on globalThis.
let hostScriptModule = null;

const TOTO_BLOCK_RE = /<toto\b[\s\S]*?<\/toto>/gi;
const TOTO_BLOCK_SINGLE_RE = /<toto\b[\s\S]*?<\/toto>/i;
const FENCED_BLOCK_RE = /```(?:html|HTML|xml|XML)?\s*\n?([\s\S]*?)\n?```/gi;
const WHOLE_FENCED_BLOCK_RE = /^\s*```(?:html|HTML|xml|XML)?\s*\n?([\s\S]*?)\n?```\s*$/i;
const TRAILING_HTML_START_RE = /(?:^|\n)(<(?:div|section|article|details)\b[\s\S]*)$/i;
const PRE_CODE_RE = /<pre\b[^>]*>\s*<code\b[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi;
const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;
const CODE_FENCE_OPEN_RE = /```(?:html|xml|javascript|js|css)?\s*/gi;
const TILDE_FENCE_OPEN_RE = /~~~(?:html|xml|javascript|js|css)?\s*/gi;
const CODE_LIKE_TAG_RE = /<\/?(?:pre|code|kbd|samp)\b[^>]*>/gi;
const CLASS_ATTR_RE = /\sclass=(["'])([^"']*)\1/gi;
const HIGHLIGHT_CLASS_TOKEN_RE = /^(?:language-(?:html|xml|js|javascript|css)|hljs|prism|prettyprint)$/i;
const MULTI_BLANK_LINE_RE = /\n\s*\n/g;

function isCodeBlockRescueModeEnabled() {
    try {
        return !!getSettings().codeBlockRescueMode;
    } catch {
        return false;
    }
}

function isInteractionRescueModeEnabled() {
    try {
        return !!getSettings().interactionRescueMode;
    } catch {
        return false;
    }
}


const MIRROR_TOTO_SELECTOR = 'toto[data-rabbit-mirror="true"], toto[data-rabbit-hole="true"]';
let interactionScopeCounter = 0;
const interactionScopeStates = new WeakMap();
const SCOPED_INTERACTION_ID_RE = /^(rm-[a-z0-9]+-[a-z0-9]+-[a-z0-9]{5}-)(.+)$/i;

const INTERACTION_RESCUE_MEMORY_KEY = 'rabbitMirrorInteractionRescueMemoryV1';
const rememberedInteractionRescueKeys = new Set();

function hashInteractionSignature(text) {
    let hash = 2166136261;
    for (const char of String(text || '')) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

function getInteractionRescueKey(toto) {
    if (!toto?.querySelectorAll) return '';
    const summary = (toto.querySelector('summary')?.textContent || '').replace(/\s+/g, ' ').trim();
    const bodyText = (toto.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 1200);
    const inputs = toto.querySelectorAll('input[type="checkbox"], input[type="radio"]').length;
    const labels = toto.querySelectorAll('label').length;
    return hashInteractionSignature(`${summary}|${inputs}|${labels}|${bodyText}`);
}

function loadRememberedInteractionRescues() {
    if (rememberedInteractionRescueKeys.size) return;
    try {
        const values = JSON.parse(sessionStorage.getItem(INTERACTION_RESCUE_MEMORY_KEY) || '[]');
        if (Array.isArray(values)) values.forEach(value => value && rememberedInteractionRescueKeys.add(String(value)));
    } catch {
        // sessionStorage unavailable; in-memory memory still works.
    }
}

function rememberInteractionRescue(toto) {
    const key = getInteractionRescueKey(toto);
    if (!key) return;
    loadRememberedInteractionRescues();
    rememberedInteractionRescueKeys.add(key);
    try {
        sessionStorage.setItem(INTERACTION_RESCUE_MEMORY_KEY, JSON.stringify([...rememberedInteractionRescueKeys].slice(-300)));
    } catch {
        // Ignore storage failures.
    }
}

function wasInteractionRescued(toto) {
    const key = getInteractionRescueKey(toto);
    if (!key) return false;
    loadRememberedInteractionRescues();
    return rememberedInteractionRescueKeys.has(key);
}

function createInteractionScopePrefix() {
    interactionScopeCounter += 1;
    const timePart = Date.now().toString(36);
    const countPart = interactionScopeCounter.toString(36);
    const randomPart = Math.random().toString(36).slice(2, 7);
    return `rm-${timePart}-${countPart}-${randomPart}-`;
}

function escapeRegExp(text) {
    return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceIdReferenceTokens(value, idMap) {
    return String(value || '')
        .split(/\s+/)
        .map(token => idMap.get(token) || token)
        .join(' ');
}

function rewriteCssIdReferences(cssText, idMap) {
    let css = String(cssText || '');
    for (const [oldId, newId] of idMap.entries()) {
        const escaped = escapeRegExp(oldId);
        // 常规 #id 选择器与 CSS/SVG url(#id) 引用。
        css = css
            .replace(new RegExp(`#${escaped}(?![\\w-])`, 'g'), `#${newId}`)
            .replace(new RegExp(`url\\(\\s*(["']?)#${escaped}\\1\\s*\\)`, 'g'), `url(#${newId})`);

        // ID 隔离后，CSS 属性选择器也必须同步。
        // 典型模型输出：#d1:checked ~ label[for="d1"] div。
        // 过去只改写 #d1 与真实 label.for，遗漏了 style 文本中的 [for="d1"]，
        // 导致整条选择器永久失配。这里只处理明确承载 ID 引用的属性。
        for (const attr of ['for', 'aria-controls', 'aria-labelledby', 'aria-describedby']) {
            css = css.replace(
                new RegExp(`(\\[\\s*${attr}\\s*=\\s*["'])${escaped}(["']\\s*\\])`, 'gi'),
                `$1${newId}$2`,
            );
        }
        for (const attr of ['href', 'xlink\\:href']) {
            css = css.replace(
                new RegExp(`(\\[\\s*${attr}\\s*=\\s*["']#)${escaped}(["']\\s*\\])`, 'gi'),
                `$1${newId}$2`,
            );
        }
    }
    return css;
}

function rewriteSmilIdReferences(value, idMap) {
    let output = String(value || '');
    for (const [oldId, newId] of idMap.entries()) {
        const escaped = escapeRegExp(oldId);
        output = output.replace(new RegExp(`(^|[;\\s])${escaped}(?=\\.)`, 'g'), `$1${newId}`);
    }
    return output;
}


function addImportantToDeclarationBlock(blockText) {
    return String(blockText || '').replace(
        /(^|;)\s*([a-z-]+)\s*:\s*([^;{}]+?)(\s*!important\s*)?(?=;|$)/gi,
        (match, separator, property, value) => {
            const cleanValue = String(value || '').trim().replace(/\s*!important\s*$/i, '');
            if (!cleanValue) return match;
            return `${separator}${property}: ${cleanValue} !important`;
        },
    );
}

function strengthenCheckedCssText(cssText) {
    // 生成内容经常把初始隐藏状态写成内联 style（display:none / height:0 / opacity:0）。
    // 普通 :checked 规则无法覆盖内联样式，因此只对交互状态规则追加 !important。
    return String(cssText || '').replace(/([^{}]*:checked[^{}]*)\{([^{}]*)\}/gi, (match, selector, declarations) => {
        return `${selector}{${addImportantToDeclarationBlock(declarations)}}`;
    });
}

function strengthenRabbitMirrorCheckedStateCss(toto) {
    if (!toto?.querySelectorAll) return;

    toto.querySelectorAll('style').forEach(styleEl => {
        const currentText = String(styleEl.textContent || '');
        if (!/:checked\b/i.test(currentText)) return;

        // 文本级处理可覆盖流式晚到的 style，也不依赖 CSSStyleSheet 是否已挂载。
        const strengthened = strengthenCheckedCssText(currentText);
        if (strengthened !== currentText) styleEl.textContent = strengthened;

        // CSSOM 再兜底一次，支持 @media/@supports 内的状态规则。
        try {
            const visitRules = (rules) => {
                for (const rule of [...(rules || [])]) {
                    if (rule?.cssRules) visitRules(rule.cssRules);
                    if (!rule?.selectorText || !/:checked\b/i.test(rule.selectorText) || !rule.style) continue;
                    for (const property of [...rule.style]) {
                        const value = rule.style.getPropertyValue(property);
                        if (value) rule.style.setProperty(property, value, 'important');
                    }
                }
            };
            visitRules(styleEl.sheet?.cssRules);
        } catch {
            // 某些宿主会暂时禁止读取 CSSOM；文本级修复仍然有效。
        }
    });
}



const interactionInlineOverrideStates = new WeakMap();


function parseCheckedRulesFromText(toto, input) {
    if (!toto?.querySelectorAll || !input?.id) return [];
    const escapedId = escapeRegExp(input.id);
    const selectorNeedle = new RegExp(`#${escapedId}:checked\\s*([+~])\\s*([^,{]+)`, 'i');
    const results = [];

    for (const styleEl of toto.querySelectorAll('style')) {
        const css = String(styleEl.textContent || '');
        const blockRe = /([^{}]+)\{([^{}]*)\}/g;
        let match;
        while ((match = blockRe.exec(css))) {
            const selectors = String(match[1] || '').split(',').map(v => v.trim()).filter(Boolean);
            const declarations = String(match[2] || '');
            for (const selector of selectors) {
                const selectorMatch = selector.match(selectorNeedle);
                if (!selectorMatch) continue;
                const relation = selectorMatch[1];
                const targetSelector = selectorMatch[2].trim();
                const styleMap = [];
                declarations.replace(/(^|;)\s*([a-z-]+)\s*:\s*([^;{}]+?)(\s*!important\s*)?(?=;|$)/gi,
                    (_m, _sep, property, value) => {
                        const cleanValue = String(value || '').trim().replace(/\s*!important\s*$/i, '');
                        if (property && cleanValue) styleMap.push([property, cleanValue]);
                        return _m;
                    });
                if (styleMap.length) results.push({ relation, targetSelector, styleMap });
            }
        }
    }
    return results;
}

function getSiblingTargetsForCheckedRule(input, relation, targetSelector) {
    const targets = [];
    if (!input?.parentElement || !targetSelector) return targets;
    let node = input.nextElementSibling;
    if (relation === '+') {
        if (node?.matches?.(targetSelector)) targets.push(node);
        return targets;
    }
    while (node) {
        if (node.matches?.(targetSelector)) targets.push(node);
        node = node.nextElementSibling;
    }
    return targets;
}

function getCrossContainerTargetsForCheckedRule(root, targetSelector) {
    if (!root?.querySelectorAll || !targetSelector) return [];
    try {
        const targets = [...root.querySelectorAll(targetSelector)];
        // 跨容器急救只接受当前兔子镜内明确且数量可控的目标，避免宽泛选择器误伤整页。
        if (!targets.length || targets.length > 12) return [];
        return targets;
    } catch {
        return [];
    }
}

function applyCheckedRuleTextFallback(toto, input) {
    if (!toto || !input) return 0;
    restoreInteractionInlineOverrides(input);
    if (!input.checked) return 0;

    const records = [];
    for (const rule of parseCheckedRulesFromText(toto, input)) {
        let targets = getSiblingTargetsForCheckedRule(input, rule.relation, rule.targetSelector);
        // 模型常把 input 放在按钮容器、反馈放在相邻内容容器，导致 +/~ 永远跨不出父级。
        // 原结构无匹配时，降级为当前兔子镜根内的受控目标查找，直接实现规则最终状态。
        if (!targets.length) targets = getCrossContainerTargetsForCheckedRule(toto, rule.targetSelector);
        for (const target of targets) {
            for (const [property, value] of rule.styleMap) {
                records.push({
                    element: target,
                    property,
                    value: target.style.getPropertyValue(property),
                    priority: target.style.getPropertyPriority(property),
                });
                target.style.setProperty(property, value, 'important');
            }
        }
    }
    if (records.length) interactionInlineOverrideStates.set(input, records);
    return records.length;
}

function restoreInteractionInlineOverrides(input) {
    const records = interactionInlineOverrideStates.get(input);
    if (!records) return;
    for (const record of records) {
        const { element, property, value, priority } = record;
        if (!element?.style) continue;
        if (value) element.style.setProperty(property, value, priority || '');
        else element.style.removeProperty(property);
    }
    interactionInlineOverrideStates.delete(input);
}

function applyCheckedRuleInlineFallback(toto, input) {
    if (!toto?.querySelectorAll || !input?.id) return;

    restoreInteractionInlineOverrides(input);
    if (!input.checked) return;

    const escapedId = typeof CSS !== 'undefined' && CSS.escape
        ? CSS.escape(input.id)
        : String(input.id).replace(/([^a-zA-Z0-9_-])/g, '\\$1');
    const idNeedle = `#${escapedId}:checked`;
    const records = [];

    const applyRule = (selectorText, style) => {
        if (!selectorText || !style || !selectorText.includes(idNeedle)) return;
        let targets = [];
        try {
            targets = [...toto.querySelectorAll(selectorText)];
        } catch {
            return;
        }
        for (const target of targets) {
            for (const property of [...style]) {
                const value = style.getPropertyValue(property);
                if (!value) continue;
                records.push({
                    element: target,
                    property,
                    value: target.style.getPropertyValue(property),
                    priority: target.style.getPropertyPriority(property),
                });
                target.style.setProperty(property, value, 'important');
            }
        }
    };

    for (const styleEl of toto.querySelectorAll('style')) {
        try {
            const visitRules = (rules) => {
                for (const rule of [...(rules || [])]) {
                    if (rule?.cssRules) visitRules(rule.cssRules);
                    if (rule?.selectorText && rule?.style) applyRule(rule.selectorText, rule.style);
                }
            };
            visitRules(styleEl.sheet?.cssRules);
        } catch {
            // CSSOM 不可读时，文本级 !important 修复仍然保留。
        }
    }

    if (records.length) interactionInlineOverrideStates.set(input, records);
}




const TARGET_ACTIVE_ATTR = 'data-rm-target-active';
const TARGET_RESCUE_STYLE_ATTR = 'data-rabbit-mirror-target-rescue';
const interactionCapabilityStates = new WeakMap();

const INLINE_PSEUDO_RESCUE_ATTR = 'data-rabbit-mirror-inline-pseudo-rescue';
const HINTED_PSEUDO_RESCUE_ATTR = 'data-rabbit-mirror-hinted-pseudo-rescue';
const CHANGE_PSEUDO_RESCUE_ATTR = 'data-rabbit-mirror-change-pseudo-rescue';
const DIRECT_ID_CLICK_RESCUE_ATTR = 'data-rabbit-mirror-direct-id-click-rescue';
const PSEUDO_ACTIVE_ATTR = 'data-rm-pseudo-active';
const pseudoInteractionStates = new WeakMap();

// 渲染后结构型状态层急救：不依赖可能已被宿主删除的 onclick/onchange。
// 仅处理非常明确的结构：label 直属隐藏 checkbox/radio + 两层几何重合的前景/隐藏层。
const RENDERED_STATE_LAYER_RESCUE_ATTR = 'data-rabbit-mirror-rendered-state-layer-rescue';
const RENDERED_STATE_LAYER_ROLE_ATTR = 'data-rm-rendered-state-layer-role';
const renderedStateLayerRescueStates = new WeakMap();

function getInlineStyleValue(element, property) {
    return String(element?.style?.getPropertyValue?.(property) || '').trim();
}

function isExplicitlyHiddenStateLayer(element) {
    const display = getInlineStyleValue(element, 'display').toLowerCase();
    const visibility = getInlineStyleValue(element, 'visibility').toLowerCase();
    const opacityText = getInlineStyleValue(element, 'opacity');
    const opacity = Number.parseFloat(opacityText);
    return display === 'none'
        || visibility === 'hidden'
        || (opacityText !== '' && Number.isFinite(opacity) && opacity <= 0.05);
}

function isOverlayLikeStateLayer(element) {
    const position = getInlineStyleValue(element, 'position').toLowerCase();
    if (position === 'absolute' || position === 'fixed') return true;

    const inset = getInlineStyleValue(element, 'inset');
    if (inset) return true;

    const edges = ['top', 'right', 'bottom', 'left']
        .map(property => getInlineStyleValue(element, property))
        .filter(Boolean).length;
    if (edges >= 3) return true;

    const width = getInlineStyleValue(element, 'width').replace(/\s+/g, '');
    const height = getInlineStyleValue(element, 'height').replace(/\s+/g, '');
    return width === '100%' && height === '100%';
}

function getStateLayerGeometryScore(first, second) {
    if (!first || !second) return 0;
    let score = 0;
    for (const property of ['position', 'inset', 'top', 'right', 'bottom', 'left', 'width', 'height']) {
        const firstValue = getInlineStyleValue(first, property).replace(/\s+/g, '').toLowerCase();
        const secondValue = getInlineStyleValue(second, property).replace(/\s+/g, '').toLowerCase();
        if (firstValue && secondValue && firstValue === secondValue) score += 1;
    }
    return score;
}

function neutralizeStateLayerTransform(transformText) {
    let transform = String(transformText || '').trim();
    if (!transform || transform.toLowerCase() === 'none') return '';

    let changed = false;
    transform = transform
        .replace(/translate3d\([^)]*\)/gi, () => {
            changed = true;
            return 'translate3d(0, 0, 0)';
        })
        .replace(/translate(?:x|y|z)?\([^)]*\)/gi, match => {
            changed = true;
            const name = match.slice(0, match.indexOf('('));
            if (/^translate$/i.test(name)) return 'translate(0, 0)';
            return `${name}(0)`;
        })
        .replace(/scale3d\([^)]*\)/gi, () => {
            changed = true;
            return 'scale3d(1, 1, 1)';
        })
        .replace(/scale(?:x|y|z)?\([^)]*\)/gi, match => {
            changed = true;
            const name = match.slice(0, match.indexOf('('));
            if (/^scale$/i.test(name)) return 'scale(1)';
            return `${name}(1)`;
        });

    return changed ? transform : '';
}

function buildRenderedStateLayerEntry(label, input) {
    if (!label?.children || !input || input.parentElement !== label) return null;

    const children = [...label.children];
    const inputIndex = children.indexOf(input);
    if (inputIndex < 0) return null;

    // 只看 input 后面的直属元素，避免把 label 里的说明文字或嵌套控件误当成状态层。
    const candidates = children.slice(inputIndex + 1)
        .filter(element => element?.nodeType === 1 && !/^(?:style|script|input)$/i.test(element.tagName || ''))
        .filter(isOverlayLikeStateLayer)
        .slice(0, 6);
    if (candidates.length < 2) return null;

    const hiddenCandidates = candidates.filter(isExplicitlyHiddenStateLayer);
    const visibleCandidates = candidates.filter(element => !isExplicitlyHiddenStateLayer(element));
    if (!hiddenCandidates.length || !visibleCandidates.length) return null;

    // 至少需要一组几何高度重合的前后层。冰柜示例为 position/top/right/bottom/left 全部一致。
    const hiddenLayers = hiddenCandidates.filter(hidden => (
        visibleCandidates.some(visible => getStateLayerGeometryScore(visible, hidden) >= 3)
    ));
    const visibleLayers = visibleCandidates.filter(visible => (
        hiddenLayers.some(hidden => getStateLayerGeometryScore(visible, hidden) >= 3)
    ));
    if (!hiddenLayers.length || !visibleLayers.length) return null;

    const visibleStates = visibleLayers.map(target => ({
        target,
        originalStyles: capturePseudoStyleState(target, ['opacity', 'pointer-events']),
    }));
    const hiddenStates = hiddenLayers.map(target => ({
        target,
        originalStyles: capturePseudoStyleState(target, ['display', 'visibility', 'opacity', 'pointer-events', 'transform']),
        activeTransform: neutralizeStateLayerTransform(getInlineStyleValue(target, 'transform')),
        wasDisplayNone: getInlineStyleValue(target, 'display').toLowerCase() === 'none',
        wasVisibilityHidden: getInlineStyleValue(target, 'visibility').toLowerCase() === 'hidden',
    }));

    visibleLayers.forEach(target => target.setAttribute(RENDERED_STATE_LAYER_ROLE_ATTR, 'front'));
    hiddenLayers.forEach(target => target.setAttribute(RENDERED_STATE_LAYER_ROLE_ATTR, 'reveal'));

    return { label, input, visibleStates, hiddenStates };
}

function applyRenderedStateLayerEntry(entry) {
    if (!entry?.input) return;
    const active = !!entry.input.checked;

    for (const state of entry.visibleStates || []) {
        restorePseudoStyleState(state.target, state.originalStyles);
        if (active) {
            applyPseudoStyleAssignments(state.target, [
                { property: 'opacity', value: '0' },
                { property: 'pointer-events', value: 'none' },
            ]);
        }
    }

    for (const state of entry.hiddenStates || []) {
        restorePseudoStyleState(state.target, state.originalStyles);
        if (!active) continue;

        const assignments = [
            { property: 'opacity', value: '1' },
            { property: 'pointer-events', value: 'auto' },
        ];
        if (state.wasDisplayNone) assignments.push({ property: 'display', value: 'block' });
        if (state.wasVisibilityHidden) assignments.push({ property: 'visibility', value: 'visible' });
        if (state.activeTransform) assignments.push({ property: 'transform', value: state.activeTransform });
        applyPseudoStyleAssignments(state.target, assignments);
    }

    entry.label?.setAttribute?.('aria-pressed', active ? 'true' : 'false');
    entry.input?.setAttribute?.('aria-pressed', active ? 'true' : 'false');
}

function applyRenderedStateLayerEntries(root) {
    const state = renderedStateLayerRescueStates.get(root);
    if (!state?.entries?.size) return;
    for (const entry of state.entries.values()) applyRenderedStateLayerEntry(entry);
}

function installRenderedStateLayerRescue(root) {
    if (!root?.querySelectorAll) return;

    let state = renderedStateLayerRescueStates.get(root);
    if (!state) {
        state = { entries: new Map() };
        renderedStateLayerRescueStates.set(root, state);
    }

    for (const label of root.querySelectorAll('label')) {
        const input = label.querySelector(':scope > input[type="checkbox"], :scope > input[type="radio"]');
        if (!input || state.entries.has(input)) continue;
        const entry = buildRenderedStateLayerEntry(label, input);
        if (!entry) continue;
        state.entries.set(input, entry);
        input.setAttribute(RENDERED_STATE_LAYER_RESCUE_ATTR, 'true');
    }

    if (!state.entries.size) return;

    if (root.dataset.rabbitMirrorRenderedStateLayerFallback !== 'true') {
        const refresh = event => {
            const input = event.target;
            if (!input || !state.entries.has(input)) return;
            // radio 切换会同步取消同组旧项，因此统一刷新当前兔子镜内全部结构状态。
            applyRenderedStateLayerEntries(root);
        };
        root.addEventListener('input', refresh, false);
        root.addEventListener('change', refresh, false);
        root.dataset.rabbitMirrorRenderedStateLayerFallback = 'true';
    }

    applyRenderedStateLayerEntries(root);
}


// 渲染后“相邻隐藏内容组”急救：用于 label/checkbox 后方紧邻的多段隐藏内容。
// 不依赖 onchange 原文，专门覆盖 querySelectorAll(...)[n] 在宿主净化后无法回读的情况。
const RENDERED_ADJACENT_HIDDEN_GROUP_RESCUE_ATTR = 'data-rabbit-mirror-adjacent-hidden-group-rescue';
const RENDERED_ADJACENT_HIDDEN_ITEM_ATTR = 'data-rm-adjacent-hidden-item';
const renderedAdjacentHiddenGroupRescueStates = new WeakMap();
const ADJACENT_HIDDEN_TRIGGER_HINT_RE = /(?:点击|轻触|触摸|按下|查看|读取|提取|感知|共振|唤醒|揭示|显示|开启|切换|进入)|\b(?:click|tap|touch|open|reveal|show|inspect|sense)\b/i;
const ADJACENT_HIDDEN_CLASS_HINT_RE = /(?:hidden|reveal|secret|thought|detail|info|result|message|dialog|caption|note|content|text)/i;

function getClassTokens(element) {
    return String(element?.getAttribute?.('class') || '')
        .split(/\s+/)
        .map(token => token.trim())
        .filter(Boolean);
}

function isAdjacentHiddenTextCandidate(element) {
    if (!element || !isExplicitlyHiddenStateLayer(element)) return false;
    if (element.hasAttribute?.(RENDERED_STATE_LAYER_ROLE_ATTR)
        || element.hasAttribute?.(RENDERED_LIST_DETAIL_PANEL_ATTR)) return false;
    const tagName = String(element.tagName || '').toLowerCase();
    if (!/^(?:p|div|span|section|article|aside|blockquote|small|em|strong)$/.test(tagName)) return false;
    const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
    return text.length >= 6 && text.length <= 1200;
}

function findAdjacentHiddenGroupHost(label) {
    let node = label?.nextElementSibling || null;
    for (let step = 0; node && step < 3; step += 1, node = node.nextElementSibling) {
        if (/^(?:style|script|input|label)$/i.test(node.tagName || '')) continue;
        const candidates = [node, ...(node.querySelectorAll?.('*') || [])].filter(isAdjacentHiddenTextCandidate);
        if (candidates.length) return node;
        // 遇到新的明确交互块后停止跨越，避免误抓更远处的隐藏内容。
        if (node.querySelector?.('input, label, button, details, summary')) break;
    }
    return null;
}

function collectAdjacentHiddenGroupTargets(host) {
    if (!host?.querySelectorAll) return [];
    const candidates = [host, ...host.querySelectorAll('*')]
        .filter(isAdjacentHiddenTextCandidate)
        .slice(0, 24);
    if (!candidates.length) return [];

    // 优先选择共享的语义 class 组，例如两个 .hidden-thought，避免把同一容器内无关隐藏层一起揭开。
    const groups = new Map();
    for (const element of candidates) {
        for (const token of getClassTokens(element)) {
            if (!ADJACENT_HIDDEN_CLASS_HINT_RE.test(token)) continue;
            if (!groups.has(token)) groups.set(token, []);
            groups.get(token).push(element);
        }
    }
    const best = [...groups.values()]
        .map(group => [...new Set(group)])
        .filter(group => group.length >= 1 && group.length <= 8)
        .sort((a, b) => b.length - a.length)[0];
    if (best?.length) return best;

    // 没有语义 class 时，只接受数量很少、且直属于同一个紧邻容器的隐藏文本。
    const direct = [...(host.children || [])].filter(isAdjacentHiddenTextCandidate);
    return direct.length >= 1 && direct.length <= 4 ? direct : [];
}

function buildRenderedAdjacentHiddenGroupEntry(label, input) {
    if (!label || !input || !ADJACENT_HIDDEN_TRIGGER_HINT_RE.test(String(label.textContent || ''))) return null;
    const host = findAdjacentHiddenGroupHost(label);
    if (!host) return null;
    const targets = collectAdjacentHiddenGroupTargets(host);
    if (!targets.length) return null;

    const targetStates = targets.map(target => ({
        target,
        originalStyles: capturePseudoStyleState(target, [
            'display', 'visibility', 'opacity', 'pointer-events', 'transform', 'max-height',
        ]),
        activeTransform: neutralizeStateLayerTransform(getInlineStyleValue(target, 'transform')),
        wasDisplayNone: getInlineStyleValue(target, 'display').toLowerCase() === 'none',
        wasVisibilityHidden: getInlineStyleValue(target, 'visibility').toLowerCase() === 'hidden',
        hadCollapsedMaxHeight: /^(?:0|0px|0em|0rem|0%)$/i.test(getInlineStyleValue(target, 'max-height').replace(/\s+/g, '')),
    }));

    const hostState = {
        target: host,
        originalStyles: capturePseudoStyleState(host, ['min-height', 'overflow']),
        needsHeight: targets.some(target => ['absolute', 'fixed'].includes(getInlineStyleValue(target, 'position').toLowerCase())),
    };

    targets.forEach((target, index) => target.setAttribute(RENDERED_ADJACENT_HIDDEN_ITEM_ATTR, String(index)));
    input.setAttribute(RENDERED_ADJACENT_HIDDEN_GROUP_RESCUE_ATTR, 'true');
    return { label, input, hostState, targetStates };
}

function applyRenderedAdjacentHiddenGroupEntry(entry) {
    if (!entry?.input) return;
    const active = !!entry.input.checked;
    restorePseudoStyleState(entry.hostState.target, entry.hostState.originalStyles);

    for (const state of entry.targetStates || []) {
        restorePseudoStyleState(state.target, state.originalStyles);
        if (!active) continue;
        const assignments = [
            { property: 'opacity', value: '1' },
            { property: 'visibility', value: 'visible' },
            { property: 'pointer-events', value: 'auto' },
        ];
        if (state.wasDisplayNone) assignments.push({ property: 'display', value: 'block' });
        if (state.activeTransform) assignments.push({ property: 'transform', value: state.activeTransform });
        if (state.hadCollapsedMaxHeight) assignments.push({ property: 'max-height', value: '1000px' });
        applyPseudoStyleAssignments(state.target, assignments);
    }

    if (active && entry.hostState.needsHeight) {
        // 绝对定位文本不会撑开父容器；给相邻内容区保留可见高度，避免内容虽已 opacity:1 仍被外层裁切。
        const estimatedHeight = Math.min(240, Math.max(56, (entry.targetStates?.length || 1) * 42));
        applyPseudoStyleAssignments(entry.hostState.target, [
            { property: 'min-height', value: `${estimatedHeight}px` },
            { property: 'overflow', value: 'visible' },
        ]);
    }

    entry.label?.setAttribute?.('aria-pressed', active ? 'true' : 'false');
    entry.input?.setAttribute?.('aria-pressed', active ? 'true' : 'false');
}

function applyRenderedAdjacentHiddenGroupEntries(root) {
    const state = renderedAdjacentHiddenGroupRescueStates.get(root);
    if (!state?.entries?.size) return;
    for (const entry of state.entries.values()) applyRenderedAdjacentHiddenGroupEntry(entry);
}

function installRenderedAdjacentHiddenGroupRescue(root) {
    if (!root?.querySelectorAll) return;
    let state = renderedAdjacentHiddenGroupRescueStates.get(root);
    if (!state) {
        state = { entries: new Map() };
        renderedAdjacentHiddenGroupRescueStates.set(root, state);
    }

    for (const label of root.querySelectorAll('label')) {
        const input = label.querySelector('input[type="checkbox"], input[type="radio"]');
        if (!input || state.entries.has(input)) continue;
        const entry = buildRenderedAdjacentHiddenGroupEntry(label, input);
        if (entry) state.entries.set(input, entry);
    }
    if (!state.entries.size) return;

    if (root.dataset.rabbitMirrorAdjacentHiddenGroupFallback !== 'true') {
        const refresh = event => {
            if (!state.entries.has(event.target)) return;
            applyRenderedAdjacentHiddenGroupEntries(root);
        };
        root.addEventListener('input', refresh, false);
        root.addEventListener('change', refresh, false);
        root.dataset.rabbitMirrorAdjacentHiddenGroupFallback = 'true';
    }
    applyRenderedAdjacentHiddenGroupEntries(root);
}


// 渲染后“列表项目 → 详情视图”急救：不依赖已被宿主删除的 onclick。
// 仅处理严格结构：同一布局中，前置区域存在 N 个明确可点击候选项，后置详情容器直属包含 N 个隐藏详情层。
const RENDERED_LIST_DETAIL_RESCUE_ATTR = 'data-rabbit-mirror-rendered-list-detail-rescue';
const RENDERED_LIST_DETAIL_TRIGGER_ATTR = 'data-rm-list-detail-trigger';
const RENDERED_LIST_DETAIL_PANEL_ATTR = 'data-rm-list-detail-panel';
const RENDERED_LIST_DETAIL_ACTIVE_ATTR = 'data-rm-list-detail-active';
const renderedListDetailRescueStates = new WeakMap();
const LIST_DETAIL_DEFAULT_HINT_RE = /(?:等待|请选择|选择|选取|点击|轻触|触摸|查看|展开).{0,24}(?:目标|项目|条目|内容|详情|证物|报告|视图|对象|选项)?|\b(?:waiting|select|choose|pick|tap|click)\b/i;

function isMeaningfulListDetailPanel(element) {
    if (!element?.id || !isExplicitlyHiddenStateLayer(element)) return false;
    const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length < 24) return false;
    const tagName = String(element.tagName || '').toLowerCase();
    if (!/^(?:div|section|article|aside|li)$/.test(tagName)) return false;
    return !!element.querySelector?.('h1, h2, h3, h4, h5, h6, p, ul, ol, dl, table, [style*="border"], [style*="background"]')
        || text.length >= 80;
}

function isLikelyListDetailTrigger(element) {
    if (!element?.style || !element?.textContent) return false;
    const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text || text.length > 120) return false;

    const tagName = String(element.tagName || '').toLowerCase();
    if (/^(?:input|textarea|select|option|details|summary)$/.test(tagName)) return false;

    const cursor = getInlineStyleValue(element, 'cursor').toLowerCase();
    const decoration = `${getInlineStyleValue(element, 'text-decoration')} ${getInlineStyleValue(element, 'text-decoration-line')}`.toLowerCase();
    const role = String(element.getAttribute?.('role') || '').toLowerCase();
    const explicitlyClickable = cursor === 'pointer'
        || decoration.includes('underline')
        || role === 'button'
        || element.hasAttribute?.('onclick');
    if (!explicitlyClickable) return false;

    // 选择最内层的明确触发项，避免同时把 li 与内部 span 都计入。
    const nestedClickable = [...(element.querySelectorAll?.('[style*="cursor"], [style*="text-decoration"], [role="button"], [onclick]') || [])]
        .some(child => child !== element && isLikelyListDetailTrigger(child));
    return !nestedClickable;
}

function collectListDetailTriggersBeforeHost(host, expectedCount) {
    const parent = host?.parentElement;
    if (!parent || expectedCount < 2 || expectedCount > 8) return [];
    const siblings = [...parent.children];
    const hostIndex = siblings.indexOf(host);
    if (hostIndex <= 0) return [];

    const searchRoots = siblings.slice(0, hostIndex);
    const candidates = [];
    for (const searchRoot of searchRoots) {
        if (isLikelyListDetailTrigger(searchRoot)) candidates.push(searchRoot);
        for (const element of searchRoot.querySelectorAll?.('*') || []) {
            if (isLikelyListDetailTrigger(element)) candidates.push(element);
        }
    }

    const unique = [...new Set(candidates)]
        .filter(candidate => !candidates.some(other => other !== candidate && candidate.contains?.(other)));
    return unique.length === expectedCount ? unique : [];
}

function getListDetailDefaultViews(host, panels) {
    const panelSet = new Set(panels);
    return [...host.children].filter(element => {
        if (panelSet.has(element) || isExplicitlyHiddenStateLayer(element)) return false;
        const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
        const id = String(element.id || '').toLowerCase();
        if (!text || text.length > 180) return false;
        return /(?:default|empty|placeholder|waiting|select|choose)/i.test(id)
            || LIST_DETAIL_DEFAULT_HINT_RE.test(text);
    }).slice(0, 3);
}

function buildRenderedListDetailEntry(host) {
    if (!host?.children) return null;
    const panels = [...host.children].filter(isMeaningfulListDetailPanel);
    if (panels.length < 2 || panels.length > 8) return null;

    const triggers = collectListDetailTriggersBeforeHost(host, panels.length);
    if (triggers.length !== panels.length) return null;

    const defaultViews = getListDetailDefaultViews(host, panels);
    const panelStates = panels.map(panel => ({
        panel,
        originalStyles: capturePseudoStyleState(panel, ['display', 'visibility', 'opacity', 'pointer-events']),
        wasDisplayNone: getInlineStyleValue(panel, 'display').toLowerCase() === 'none',
        wasVisibilityHidden: getInlineStyleValue(panel, 'visibility').toLowerCase() === 'hidden',
    }));
    const defaultStates = defaultViews.map(view => ({
        view,
        originalStyles: capturePseudoStyleState(view, ['display', 'visibility', 'opacity', 'pointer-events']),
    }));

    panels.forEach((panel, index) => {
        panel.setAttribute(RENDERED_LIST_DETAIL_PANEL_ATTR, String(index));
        panel.setAttribute('aria-hidden', 'true');
    });
    triggers.forEach((trigger, index) => {
        trigger.setAttribute(RENDERED_LIST_DETAIL_TRIGGER_ATTR, String(index));
        trigger.setAttribute('aria-controls', panels[index].id);
        trigger.setAttribute('aria-pressed', 'false');
    });

    return { host, triggers, panelStates, defaultStates, activeIndex: -1 };
}

function applyRenderedListDetailEntry(entry, activeIndex) {
    if (!entry) return;
    entry.activeIndex = Number.isInteger(activeIndex) ? activeIndex : -1;

    for (const [index, state] of entry.panelStates.entries()) {
        restorePseudoStyleState(state.panel, state.originalStyles);
        const active = index === entry.activeIndex;
        if (active) {
            const assignments = [
                { property: 'visibility', value: 'visible' },
                { property: 'opacity', value: '1' },
                { property: 'pointer-events', value: 'auto' },
            ];
            if (state.wasDisplayNone) assignments.push({ property: 'display', value: 'block' });
            applyPseudoStyleAssignments(state.panel, assignments);
            state.panel.setAttribute('aria-hidden', 'false');
            state.panel.setAttribute(RENDERED_LIST_DETAIL_ACTIVE_ATTR, 'true');
        } else {
            state.panel.setAttribute('aria-hidden', 'true');
            state.panel.removeAttribute(RENDERED_LIST_DETAIL_ACTIVE_ATTR);
        }
    }

    for (const state of entry.defaultStates) {
        restorePseudoStyleState(state.view, state.originalStyles);
        if (entry.activeIndex >= 0) {
            applyPseudoStyleAssignments(state.view, [
                { property: 'display', value: 'none' },
                { property: 'opacity', value: '0' },
                { property: 'pointer-events', value: 'none' },
            ]);
            state.view.setAttribute('aria-hidden', 'true');
        } else {
            state.view.removeAttribute('aria-hidden');
        }
    }

    entry.triggers.forEach((trigger, index) => {
        const active = index === entry.activeIndex;
        trigger.setAttribute('aria-pressed', active ? 'true' : 'false');
        if (active) trigger.setAttribute(RENDERED_LIST_DETAIL_ACTIVE_ATTR, 'true');
        else trigger.removeAttribute(RENDERED_LIST_DETAIL_ACTIVE_ATTR);
    });
}

function findRenderedListDetailEntries(root) {
    if (!root?.querySelectorAll) return [];
    const entries = [];
    for (const host of root.querySelectorAll('div, section, article, aside')) {
        const entry = buildRenderedListDetailEntry(host);
        if (entry) entries.push(entry);
    }
    return entries;
}

function hasRenderedListDetailCandidates(root) {
    return findRenderedListDetailEntries(root).length > 0;
}

function installRenderedListDetailRescue(root) {
    if (!root?.querySelectorAll) return;
    let state = renderedListDetailRescueStates.get(root);
    if (!state) {
        state = { hosts: new Map() };
        renderedListDetailRescueStates.set(root, state);
    }

    for (const entry of findRenderedListDetailEntries(root)) {
        if (state.hosts.has(entry.host)) continue;
        state.hosts.set(entry.host, entry);
        entry.host.setAttribute(RENDERED_LIST_DETAIL_RESCUE_ATTR, 'true');

        entry.triggers.forEach((trigger, index) => {
            preparePseudoTrigger(trigger);
            const activate = event => {
                if (event?.type === 'keydown') {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                }
                applyRenderedListDetailEntry(entry, index);
            };
            trigger.addEventListener('click', activate, false);
            trigger.addEventListener('keydown', activate, false);
        });
        applyRenderedListDetailEntry(entry, -1);
    }
}

const PSEUDO_INTERACTION_HINT_RE = /(?:鼠标\s*)?(?:悬停|划过|移入)|\bhover\b|(?:点击|轻触|触摸).{0,16}(?:显示|查看|展开|播放|切换)/i;
const EXISTING_INTERACTIVE_SELECTOR = 'a, button, input, label, summary, select, textarea, [role="button"], [contenteditable="true"]';

function normalizeStylePropertyName(property) {
    return String(property || '')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase();
}

function parseInlineStyleAssignments(scriptText) {
    const assignments = new Map();
    const source = String(scriptText || '');
    if (!source || !/this\.style/i.test(source)) return [];

    const remember = (property, value) => {
        const normalizedProperty = normalizeStylePropertyName(property);
        const normalizedValue = String(value || '').trim();
        if (!normalizedProperty || !normalizedValue) return;
        assignments.set(normalizedProperty, normalizedValue);
    };

    // 只解析安全且意图明确的 this.style.xxx='value'，绝不执行模型输出的 JavaScript。
    const dotAssignmentRe = /this\.style\.([a-zA-Z][\w]*)\s*=\s*(['"])([\s\S]*?)\2\s*;?/g;
    let match;
    while ((match = dotAssignmentRe.exec(source))) remember(match[1], match[3]);

    const bracketAssignmentRe = /this\.style\[\s*(['"])([a-zA-Z-]+)\1\s*\]\s*=\s*(['"])([\s\S]*?)\3\s*;?/g;
    while ((match = bracketAssignmentRe.exec(source))) remember(match[2], match[4]);

    return [...assignments.entries()].map(([property, value]) => ({ property, value }));
}

function collectInlineAssignments(element, attributeNames) {
    const combined = new Map();
    for (const attributeName of attributeNames) {
        const value = element?.getAttribute?.(attributeName);
        for (const assignment of parseInlineStyleAssignments(value)) {
            combined.set(assignment.property, assignment.value);
        }
    }
    return [...combined.entries()].map(([property, value]) => ({ property, value }));
}

function resolveScopedPseudoId(root, rawId) {
    const id = String(rawId || '').trim();
    if (!root?.querySelectorAll || !id) return null;

    const direct = [...root.querySelectorAll('[id]')].find(element => element.id === id);
    if (direct) return direct;

    const mappedId = interactionScopeStates.get(root)?.idMap?.get?.(id);
    if (mappedId) {
        const mapped = [...root.querySelectorAll('[id]')].find(element => element.id === mappedId);
        if (mapped) return mapped;
    }

    return null;
}

function resolveParentElementExpression(element, expression) {
    const source = String(expression || '').replace(/\s+/g, '');
    if (!/^this(?:\.parentElement)+$/.test(source)) return null;
    const depth = (source.match(/\.parentElement/g) || []).length;
    let current = element;
    for (let index = 0; index < depth; index += 1) {
        current = current?.parentElement || null;
        if (!current) return null;
    }
    return current;
}

function isSafeLocalQuerySelector(selector) {
    const source = String(selector || '').trim();
    // 仅允许一个简单的 ID、class 或标签选择器；禁止组合器、属性、伪类与通配符。
    return /^(?:#[a-zA-Z_][\w:.-]*|\.[a-zA-Z_][\w-]*|[a-zA-Z][\w-]*)$/.test(source);
}

function resolveSafeScopedQuery(scope, selector, root) {
    const safeSelector = String(selector || '').trim();
    if (!scope?.querySelector || !root?.contains || !root.contains(scope) || !isSafeLocalQuerySelector(safeSelector)) return null;
    if (safeSelector.startsWith('#')) {
        return resolveScopedPseudoId(scope, safeSelector.slice(1)) || resolveScopedPseudoId(root, safeSelector.slice(1));
    }
    try {
        const target = scope.querySelector(safeSelector);
        return target && root.contains(target) ? target : null;
    } catch {
        return null;
    }
}

function resolveSafeScopedQueryAll(scope, selector, root) {
    const safeSelector = String(selector || '').trim();
    if (!scope?.querySelectorAll || !root?.contains || !root.contains(scope) || !isSafeLocalQuerySelector(safeSelector)) return [];
    if (safeSelector.startsWith('#')) {
        const target = resolveScopedPseudoId(scope, safeSelector.slice(1)) || resolveScopedPseudoId(root, safeSelector.slice(1));
        return target ? [target] : [];
    }
    try {
        return [...scope.querySelectorAll(safeSelector)].filter(target => target && root.contains(target)).slice(0, 64);
    } catch {
        return [];
    }
}

function resolveRelativeQueryExpression(input, expression, root) {
    const source = String(expression || '').replace(/\s+/g, '');
    const match = /^(this(?:\.parentElement)*)\.querySelector\((['"])([.#][\w:.-]+)\2\)$/.exec(source);
    if (!match) return null;
    const scope = match[1] === 'this' ? input : resolveParentElementExpression(input, match[1]);
    return resolveSafeScopedQuery(scope, match[3], root);
}

function findMatchingScriptBrace(sourceText, openIndex) {
    const source = String(sourceText || '');
    if (source[openIndex] !== '{') return -1;
    let depth = 0;
    let quote = '';
    let escaped = false;

    for (let index = openIndex; index < source.length; index += 1) {
        const char = source[index];
        if (quote) {
            if (escaped) escaped = false;
            else if (char === '\\') escaped = true;
            else if (char === quote) quote = '';
            continue;
        }
        if (char === '"' || char === "'" || char === '`') {
            quote = char;
            continue;
        }
        if (char === '{') depth += 1;
        else if (char === '}') {
            depth -= 1;
            if (depth === 0) return index;
        }
    }
    return -1;
}

function extractCheckedConditionalBranches(scriptText) {
    const source = String(scriptText || '');
    const conditionMatch = /if\s*\(\s*this\.checked\s*\)/i.exec(source);
    if (!conditionMatch) return null;

    const activeOpen = source.indexOf('{', conditionMatch.index + conditionMatch[0].length);
    if (activeOpen < 0) return null;
    const activeClose = findMatchingScriptBrace(source, activeOpen);
    if (activeClose < 0) return null;

    const tail = source.slice(activeClose + 1);
    const elseMatch = /^\s*else\s*/i.exec(tail);
    if (!elseMatch) return null;
    const inactiveOpen = source.indexOf('{', activeClose + 1 + elseMatch[0].length);
    if (inactiveOpen < 0) return null;
    const inactiveClose = findMatchingScriptBrace(source, inactiveOpen);
    if (inactiveClose < 0) return null;

    return {
        active: source.slice(activeOpen + 1, activeClose),
        inactive: source.slice(inactiveOpen + 1, inactiveClose),
    };
}

function parseNamedStyleAssignments(scriptText, targetMap, targetCollections = new Map()) {
    const assignmentsByTarget = new Map();
    const source = String(scriptText || '');

    const rememberTarget = (target, property, value) => {
        const normalizedProperty = normalizeStylePropertyName(property);
        const normalizedValue = String(value || '').trim();
        if (!target || !normalizedProperty || !normalizedValue) return;
        if (!assignmentsByTarget.has(target)) assignmentsByTarget.set(target, new Map());
        assignmentsByTarget.get(target).set(normalizedProperty, normalizedValue);
    };
    const remember = (targetName, property, value) => rememberTarget(targetMap.get(targetName), property, value);
    const rememberIndexed = (collectionName, rawIndex, property, value) => {
        const index = Number(rawIndex);
        const collection = targetCollections.get(collectionName);
        if (!Number.isSafeInteger(index) || index < 0 || index > 63 || !collection) return;
        rememberTarget(collection[index], property, value);
    };

    const dotAssignmentRe = /([a-zA-Z_$][\w$]*)\.style\.([a-zA-Z][\w]*)\s*=\s*(['"])([\s\S]*?)\3\s*;?/g;
    let match;
    while ((match = dotAssignmentRe.exec(source))) remember(match[1], match[2], match[4]);

    const bracketAssignmentRe = /([a-zA-Z_$][\w$]*)\.style\[\s*(['"])([a-zA-Z-]+)\2\s*\]\s*=\s*(['"])([\s\S]*?)\4\s*;?/g;
    while ((match = bracketAssignmentRe.exec(source))) remember(match[1], match[3], match[5]);

    const indexedDotAssignmentRe = /([a-zA-Z_$][\w$]*)\s*\[\s*(\d{1,2})\s*\]\s*\.style\.([a-zA-Z][\w]*)\s*=\s*(['"])([\s\S]*?)\4\s*;?/g;
    while ((match = indexedDotAssignmentRe.exec(source))) rememberIndexed(match[1], match[2], match[3], match[5]);

    const indexedBracketAssignmentRe = /([a-zA-Z_$][\w$]*)\s*\[\s*(\d{1,2})\s*\]\s*\.style\[\s*(['"])([a-zA-Z-]+)\3\s*\]\s*=\s*(['"])([\s\S]*?)\5\s*;?/g;
    while ((match = indexedBracketAssignmentRe.exec(source))) rememberIndexed(match[1], match[2], match[4], match[6]);

    return new Map(
        [...assignmentsByTarget.entries()].map(([target, assignments]) => [
            target,
            [...assignments.entries()].map(([property, value]) => ({ property, value })),
        ]),
    );
}

function parseNamedTextAssignments(scriptText, targetMap, targetCollections = new Map()) {
    const textByTarget = new Map();
    const source = String(scriptText || '');
    const rememberText = (target, mode, rawValue) => {
        if (!target) return;
        const value = decodeSafeInlineString(rawValue);
        // innerHTML 只接受纯文本；任何标签形态都放弃该条文字赋值。
        if (mode === 'innerHTML' && /<[^>]*>/.test(value)) return;
        textByTarget.set(target, value);
    };

    const textAssignmentRe = /([a-zA-Z_$][\w$]*)\.(innerHTML|innerText|textContent)\s*=\s*(['"])((?:\\.|(?!\3)[\s\S])*)\3\s*;?/g;
    let match;
    while ((match = textAssignmentRe.exec(source))) rememberText(targetMap.get(match[1]), match[2], match[4]);

    const indexedTextAssignmentRe = /([a-zA-Z_$][\w$]*)\s*\[\s*(\d{1,2})\s*\]\s*\.(innerHTML|innerText|textContent)\s*=\s*(['"])((?:\\.|(?!\4)[\s\S])*)\4\s*;?/g;
    while ((match = indexedTextAssignmentRe.exec(source))) {
        const index = Number(match[2]);
        const collection = targetCollections.get(match[1]);
        if (!Number.isSafeInteger(index) || index < 0 || index > 63 || !collection) continue;
        rememberText(collection[index], match[3], match[5]);
    }
    return textByTarget;
}

function parseCheckedChangeStyleProgramFromSource(input, root, scriptText) {
    const source = String(scriptText || '');
    if (!source || !/if\s*\(\s*this\.checked\s*\)/i.test(source)) return null;

    // 只接受结构清晰的 if(this.checked){...} else {...}，绝不执行模型输出的 JavaScript。
    const branches = extractCheckedConditionalBranches(source);
    if (!branches) return null;

    const targetMap = new Map([['this', input]]);
    const targetCollections = new Map();

    // 支持：const wrapper = this.parentElement.parentElement;
    const parentAliasRe = /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(this(?:\s*\.\s*parentElement)+)\s*;?/g;
    let match;
    while ((match = parentAliasRe.exec(source))) {
        const resolved = resolveParentElementExpression(input, match[2]);
        if (resolved && root.contains(resolved)) targetMap.set(match[1], resolved);
    }

    // 支持：const target = this.parentElement.parentElement.querySelector('.target-class');
    // 以及 const target = wrapper.querySelector('#target-id')。只允许单一 class / ID 选择器。
    const relativeQueryAliasRe = /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(this(?:\s*\.\s*parentElement)*)\s*\.\s*querySelector\(\s*(['"])([.#][a-zA-Z_][\w:.-]*)\3\s*\)\s*;?/g;
    while ((match = relativeQueryAliasRe.exec(source))) {
        const expression = `${match[2]}.querySelector('${match[4]}')`;
        const target = resolveRelativeQueryExpression(input, expression, root);
        if (target) targetMap.set(match[1], target);
    }

    const queryAliasRe = /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*([a-zA-Z_$][\w$]*)\.querySelector\(\s*(['"])([.#]?[a-zA-Z_][\w:.-]*)\3\s*\)\s*;?/g;
    while ((match = queryAliasRe.exec(source))) {
        const scope = targetMap.get(match[2]);
        const target = resolveSafeScopedQuery(scope, match[4], root);
        if (target) targetMap.set(match[1], target);
    }

    // 模型常用 document.querySelector；急救器不会访问整页，而是强制收敛到当前兔子镜。
    const documentQueryAliasRe = /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*document\s*\.\s*querySelector\(\s*(['"])([.#]?[a-zA-Z_][\w:.-]*)\2\s*\)\s*;?/g;
    while ((match = documentQueryAliasRe.exec(source))) {
        const target = resolveSafeScopedQuery(root, match[3], root);
        if (target) targetMap.set(match[1], target);
    }

    // document 作用域别名建立后，再解析依赖它的二级查询，例如 core = cluster.querySelector('div')。
    queryAliasRe.lastIndex = 0;
    while ((match = queryAliasRe.exec(source))) {
        const scope = targetMap.get(match[2]);
        const target = resolveSafeScopedQuery(scope, match[4], root);
        if (target) targetMap.set(match[1], target);
    }

    // 支持固定索引的安全集合访问：const nodes = document/queryScope.querySelectorAll('.item'); nodes[0].style...
    const documentQueryAllAliasRe = /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*document\s*\.\s*querySelectorAll\(\s*(['"])([.#]?[a-zA-Z_][\w:.-]*)\2\s*\)\s*;?/g;
    while ((match = documentQueryAllAliasRe.exec(source))) {
        const targets = resolveSafeScopedQueryAll(root, match[3], root);
        if (targets.length) targetCollections.set(match[1], targets);
    }

    const scopedQueryAllAliasRe = /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*([a-zA-Z_$][\w$]*)\.querySelectorAll\(\s*(['"])([.#]?[a-zA-Z_][\w:.-]*)\3\s*\)\s*;?/g;
    while ((match = scopedQueryAllAliasRe.exec(source))) {
        const scope = targetMap.get(match[2]);
        const targets = resolveSafeScopedQueryAll(scope, match[4], root);
        if (targets.length) targetCollections.set(match[1], targets);
    }

    const activeByTarget = parseNamedStyleAssignments(branches.active, targetMap, targetCollections);
    const inactiveByTarget = parseNamedStyleAssignments(branches.inactive, targetMap, targetCollections);
    const activeTextByTarget = parseNamedTextAssignments(branches.active, targetMap, targetCollections);
    const inactiveTextByTarget = parseNamedTextAssignments(branches.inactive, targetMap, targetCollections);
    const targets = new Set([
        ...activeByTarget.keys(),
        ...inactiveByTarget.keys(),
        ...activeTextByTarget.keys(),
        ...inactiveTextByTarget.keys(),
    ]);
    if (!targets.size || (!activeByTarget.size && !activeTextByTarget.size)) return null;

    const states = [];
    for (const target of targets) {
        const activeAssignments = activeByTarget.get(target) || [];
        const inactiveAssignments = inactiveByTarget.get(target) || [];
        const properties = new Set([...activeAssignments, ...inactiveAssignments].map(item => item.property));
        const hasActiveText = activeTextByTarget.has(target);
        const hasInactiveText = inactiveTextByTarget.has(target);
        if (!properties.size && !hasActiveText && !hasInactiveText) continue;
        states.push({
            target,
            activeAssignments,
            inactiveAssignments,
            activeText: hasActiveText ? activeTextByTarget.get(target) : undefined,
            inactiveText: hasInactiveText ? inactiveTextByTarget.get(target) : undefined,
            originalText: target.textContent,
            originalStyles: capturePseudoStyleState(target, properties),
        });
    }

    return states.length ? states : null;
}

function parseCheckedChangeStyleProgram(input, root) {
    return parseCheckedChangeStyleProgramFromSource(input, root, input?.getAttribute?.('onchange') || '');
}

function applyCheckedChangeProgram(input, states) {
    const active = !!input?.checked;
    for (const state of states || []) {
        if (!state?.target) continue;
        if (active) {
            if (state.activeText !== undefined) state.target.textContent = state.activeText;
            applyPseudoStyleAssignments(state.target, state.activeAssignments);
            state.target.setAttribute(PSEUDO_ACTIVE_ATTR, 'true');
        } else {
            restorePseudoStyleState(state.target, state.originalStyles);
            if (state.inactiveText !== undefined) state.target.textContent = state.inactiveText;
            else if (state.originalText !== undefined) state.target.textContent = state.originalText;
            applyPseudoStyleAssignments(state.target, state.inactiveAssignments);
            state.target.removeAttribute(PSEUDO_ACTIVE_ATTR);
        }
    }
    input?.setAttribute?.('aria-pressed', active ? 'true' : 'false');
}

function bindCheckedChangeProgram(input, states) {
    if (!input || !states?.length || input.hasAttribute(CHANGE_PSEUDO_RESCUE_ATTR)) return false;
    input.addEventListener('change', () => applyCheckedChangeProgram(input, states), false);
    input.addEventListener('input', () => applyCheckedChangeProgram(input, states), false);
    input.removeAttribute('onchange');
    input.setAttribute(CHANGE_PSEUDO_RESCUE_ATTR, 'true');
    applyCheckedChangeProgram(input, states);
    return true;
}

function installCheckedChangePseudoInteractionRescue(root) {
    if (!root?.querySelectorAll) return;
    const candidates = [...root.querySelectorAll('input[type="checkbox"][onchange], input[type="radio"][onchange]')];

    for (const input of candidates) {
        if (input.hasAttribute(CHANGE_PSEUDO_RESCUE_ATTR)) continue;
        const states = parseCheckedChangeStyleProgram(input, root);
        if (!states?.length) continue;
        bindCheckedChangeProgram(input, states);
    }
}

function capturePseudoStyleState(element, properties) {
    const captured = new Map();
    for (const property of properties) {
        captured.set(property, {
            value: element.style?.getPropertyValue?.(property) || '',
            priority: element.style?.getPropertyPriority?.(property) || '',
        });
    }
    return captured;
}

function applyPseudoStyleAssignments(element, assignments) {
    for (const { property, value } of assignments || []) {
        if (!property || !value) continue;
        element.style?.setProperty?.(property, value, 'important');
    }
}

function restorePseudoStyleState(element, captured) {
    for (const [property, previous] of captured || []) {
        if (previous?.value) element.style?.setProperty?.(property, previous.value, previous.priority || '');
        else element.style?.removeProperty?.(property);
    }
}

function setPseudoInteractionState(state, active) {
    if (!state?.target) return;
    state.active = !!active;
    if (state.active) {
        applyPseudoStyleAssignments(state.target, state.activeAssignments);
        state.target.setAttribute(PSEUDO_ACTIVE_ATTR, 'true');
    } else {
        restorePseudoStyleState(state.target, state.originalStyles);
        applyPseudoStyleAssignments(state.target, state.inactiveAssignments);
        state.target.removeAttribute(PSEUDO_ACTIVE_ATTR);
    }
    state.trigger?.setAttribute?.('aria-pressed', state.active ? 'true' : 'false');
}

function isPseudoTriggerUsable(element) {
    if (!element?.style) return false;
    const display = String(element.style.getPropertyValue('display') || '').trim().toLowerCase();
    const visibility = String(element.style.getPropertyValue('visibility') || '').trim().toLowerCase();
    const pointerEvents = String(element.style.getPropertyValue('pointer-events') || '').trim().toLowerCase();
    return display !== 'none' && visibility !== 'hidden' && pointerEvents !== 'none';
}

function preparePseudoTrigger(trigger) {
    if (!trigger?.setAttribute) return;
    const tagName = String(trigger.tagName || '').toLowerCase();
    const alreadyInteractive = /^(?:a|button|input|label|summary|select|textarea)$/.test(tagName)
        || trigger.hasAttribute('tabindex')
        || trigger.hasAttribute('role');
    if (!alreadyInteractive) {
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
    }
    trigger.setAttribute('aria-pressed', 'false');
    if (!trigger.style?.getPropertyValue?.('cursor')) trigger.style?.setProperty?.('cursor', 'pointer');
}

function shouldIgnorePseudoToggleEvent(event, trigger) {
    const interactive = event.target?.closest?.(EXISTING_INTERACTIVE_SELECTOR);
    return !!(interactive && interactive !== trigger && trigger?.contains?.(interactive));
}

function bindPseudoToggle(trigger, state) {
    if (!trigger?.addEventListener || !state) return;
    preparePseudoTrigger(trigger);

    trigger.addEventListener('click', event => {
        if (shouldIgnorePseudoToggleEvent(event, trigger)) return;
        setPseudoInteractionState(state, !state.active);
    }, false);

    trigger.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        setPseudoInteractionState(state, !state.active);
    }, false);
}

function findHintedHiddenLayerPairs(root) {
    if (!root?.querySelectorAll) return [];
    const pairs = [];
    const hints = [...root.querySelectorAll('div, p, span, small, em, strong')]
        .filter(element => {
            const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
            return text && text.length <= 100 && PSEUDO_INTERACTION_HINT_RE.test(text);
        });

    for (const hint of hints) {
        const host = hint.parentElement;
        if (!host || !root.contains(host)) continue;
        const candidates = [...host.children].filter(candidate => {
            if (candidate === hint || candidate.contains(hint) || candidate.hasAttribute(HINTED_PSEUDO_RESCUE_ATTR) || candidate.hasAttribute(INLINE_PSEUDO_RESCUE_ATTR)) return false;
            const opacity = Number.parseFloat(candidate.style?.getPropertyValue?.('opacity') || '');
            const visibility = String(candidate.style?.getPropertyValue?.('visibility') || '').trim().toLowerCase();
            const hidden = (Number.isFinite(opacity) && opacity <= 0.05) || visibility === 'hidden';
            if (!hidden) return false;

            const position = String(candidate.style?.getPropertyValue?.('position') || '').trim().toLowerCase();
            const width = String(candidate.style?.getPropertyValue?.('width') || '').trim();
            const height = String(candidate.style?.getPropertyValue?.('height') || '').trim();
            const inset = String(candidate.style?.getPropertyValue?.('inset') || '').trim();
            const looksLikeLayer = /^(?:absolute|fixed)$/.test(position)
                && (width === '100%' || height === '100%' || inset === '0' || inset === '0px');
            if (!looksLikeLayer) return false;

            const animatedDescendant = candidate.querySelector?.('[style*="animation"], animate, animateTransform');
            const meaningfulContent = String(candidate.textContent || '').replace(/\s+/g, ' ').trim().length >= 12;
            return !!animatedDescendant || meaningfulContent;
        });
        if (!candidates.length) continue;
        pairs.push({ hint, host, target: candidates[0] });
    }
    return pairs;
}

function hasPseudoInteractionCandidates(root) {
    if (!root?.querySelectorAll) return false;
    if (root.querySelector('[onmouseover], [onmouseenter], [onmouseout], [onmouseleave], [onclick], [onchange]')) return true;
    return findHintedHiddenLayerPairs(root).length > 0;
}


function decodeSafeInlineString(value) {
    return String(value || '')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\(['"\\])/g, '$1');
}

function collectDirectIdClickAssignments(scriptText, root) {
    const source = String(scriptText || '');
    if (!source || !/document\s*\.\s*getElementById\s*\(/i.test(source)) return null;

    const matches = [];
    const addMatch = (match, action) => {
        matches.push({ start: match.index, end: match.index + match[0].length, action });
    };

    // document.getElementById('id').style.left = '70%';
    const styleDotRe = /document\s*\.\s*getElementById\s*\(\s*(['"])([a-zA-Z_][\w:.-]*)\1\s*\)\s*\.\s*style\s*\.\s*([a-zA-Z][\w]*)\s*=\s*(['"])((?:\\.|(?!\4)[\s\S])*)\4\s*;?/g;
    let match;
    while ((match = styleDotRe.exec(source))) {
        const target = resolveScopedPseudoId(root, match[2]);
        const property = normalizeStylePropertyName(match[3]);
        const value = decodeSafeInlineString(match[5]);
        if (!target || !property || !value) return null;
        addMatch(match, { type: 'style', target, property, value });
    }

    // document.getElementById('id').style['left'] = '70%';
    const styleBracketRe = /document\s*\.\s*getElementById\s*\(\s*(['"])([a-zA-Z_][\w:.-]*)\1\s*\)\s*\.\s*style\s*\[\s*(['"])([a-zA-Z-]+)\3\s*\]\s*=\s*(['"])((?:\\.|(?!\5)[\s\S])*)\5\s*;?/g;
    while ((match = styleBracketRe.exec(source))) {
        const target = resolveScopedPseudoId(root, match[2]);
        const property = normalizeStylePropertyName(match[4]);
        const value = decodeSafeInlineString(match[6]);
        if (!target || !property || !value) return null;
        addMatch(match, { type: 'style', target, property, value });
    }

    // document.getElementById('id').innerText/textContent = '...';
    const textRe = /document\s*\.\s*getElementById\s*\(\s*(['"])([a-zA-Z_][\w:.-]*)\1\s*\)\s*\.\s*(innerText|textContent)\s*=\s*(['"])((?:\\.|(?!\4)[\s\S])*)\4\s*;?/g;
    while ((match = textRe.exec(source))) {
        const target = resolveScopedPseudoId(root, match[2]);
        const value = decodeSafeInlineString(match[5]);
        if (!target) return null;
        addMatch(match, { type: 'text', target, value });
    }

    if (!matches.length) return null;
    matches.sort((a, b) => a.start - b.start);

    // 只接受由上述明确赋值与空白/分号组成的脚本。任何未知语句都会放弃，绝不部分执行。
    let cursor = 0;
    let remainder = '';
    for (const item of matches) {
        if (item.start < cursor) continue;
        remainder += source.slice(cursor, item.start);
        cursor = item.end;
    }
    remainder += source.slice(cursor);
    if (remainder.replace(/[\s;]+/g, '') !== '') return null;

    return matches.map(item => item.action);
}

function applyDirectIdClickAssignments(actions) {
    for (const action of actions || []) {
        if (!action?.target) continue;
        if (action.type === 'style') {
            action.target.style?.setProperty?.(action.property, action.value, 'important');
        } else if (action.type === 'text') {
            action.target.textContent = action.value;
        }
    }
}

function installDirectIdClickProgramRescue(root) {
    if (!root?.querySelectorAll) return;
    const candidates = [...root.querySelectorAll('[onclick]')];

    for (const trigger of candidates) {
        if (trigger.hasAttribute(DIRECT_ID_CLICK_RESCUE_ATTR)) continue;
        const source = trigger.getAttribute('onclick');
        const actions = collectDirectIdClickAssignments(source, root);
        if (!actions?.length) continue;

        preparePseudoTrigger(trigger);
        const activate = event => {
            if (event?.type === 'click' && shouldIgnorePseudoToggleEvent(event, trigger)) return;
            if (event?.type === 'keydown') {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
            }
            applyDirectIdClickAssignments(actions);
        };

        trigger.addEventListener('click', activate, false);
        trigger.addEventListener('keydown', activate, false);
        trigger.removeAttribute('onclick');
        trigger.removeAttribute('aria-pressed');
        trigger.setAttribute(DIRECT_ID_CLICK_RESCUE_ATTR, 'true');
    }
}


function getRabbitMirrorSummaryText(root) {
    return String(root?.querySelector?.('summary')?.textContent || '')
        .replace(/\s+/g, ' ')
        .trim();
}

function getAvailableHostChat() {
    try {
        const contextChat = globalThis.SillyTavern?.getContext?.()?.chat;
        if (Array.isArray(contextChat)) return contextChat;
    } catch {
        // Fall through to the imported script module.
    }

    if (Array.isArray(hostScriptModule?.chat)) return hostScriptModule.chat;
    if (Array.isArray(globalThis.chat)) return globalThis.chat;
    return [];
}

function getRawAssistantMessageForRenderedRoot(root) {
    const chat = getAvailableHostChat();
    if (!chat.length || !root?.closest) return '';

    const messageElement = root.closest('.mes, [mesid], [data-message-id], [data-messageid]');
    const rawMessageId = messageElement?.getAttribute?.('mesid')
        ?? messageElement?.getAttribute?.('data-message-id')
        ?? messageElement?.getAttribute?.('data-messageid')
        ?? messageElement?.dataset?.messageId
        ?? messageElement?.dataset?.messageid;

    const numericId = Number.parseInt(String(rawMessageId ?? ''), 10);
    if (Number.isInteger(numericId) && typeof chat[numericId]?.mes === 'string') {
        return chat[numericId].mes;
    }

    // 某些主题不保留 mesid。此时仅在近期助手消息里按兔子镜标题精确回查。
    const summary = getRabbitMirrorSummaryText(root);
    if (!summary) return '';
    for (let index = chat.length - 1; index >= Math.max(0, chat.length - 12); index -= 1) {
        const item = chat[index];
        if (item?.is_user || typeof item?.mes !== 'string') continue;
        if (item.mes.includes(summary)) return item.mes;
    }
    return '';
}

function collectRawRabbitMirrorRoots(rawHtml) {
    if (!rawHtml || typeof document === 'undefined') return [];
    try {
        const template = document.createElement('template');
        template.innerHTML = normalizeMirrorAttribute(String(rawHtml));
        const roots = [...template.content.querySelectorAll(MIRROR_TOTO_SELECTOR)];
        if (roots.length) return roots;

        return [...template.content.querySelectorAll('details')]
            .filter(details => isRabbitMirrorDetails(details));
    } catch {
        return [];
    }
}

function chooseMatchingRawRabbitMirrorRoot(rawHtml, renderedRoot) {
    const candidates = collectRawRabbitMirrorRoots(rawHtml);
    if (!candidates.length) return null;

    const renderedSummary = getRabbitMirrorSummaryText(renderedRoot);
    const matched = candidates.find(candidate => getRabbitMirrorSummaryText(candidate) === renderedSummary)
        || candidates.find(candidate => renderedSummary && getRabbitMirrorSummaryText(candidate).includes(renderedSummary))
        || candidates[0];

    if (!matched) return null;
    const renderedTag = String(renderedRoot?.tagName || '').toLowerCase();
    const matchedTag = String(matched.tagName || '').toLowerCase();
    if (renderedTag === matchedTag) return matched;

    if (renderedTag === 'details') {
        return matched.querySelector?.(':scope > details') || matched.querySelector?.('details') || matched;
    }
    if (renderedTag === 'toto' && matchedTag === 'details') return matched;
    return matched;
}

function getElementChildIndexPath(root, element) {
    if (!root || !element || root === element) return [];
    const path = [];
    let current = element;
    while (current && current !== root) {
        const parent = current.parentElement;
        if (!parent) return null;
        const index = [...parent.children].indexOf(current);
        if (index < 0) return null;
        path.unshift(index);
        current = parent;
    }
    return current === root ? path : null;
}

function resolveElementChildIndexPath(root, path) {
    let current = root;
    for (const index of path || []) {
        current = current?.children?.[index] || null;
        if (!current) return null;
    }
    return current;
}

function bindDirectIdClickActions(trigger, actions) {
    if (!trigger || !actions?.length || trigger.hasAttribute(DIRECT_ID_CLICK_RESCUE_ATTR)) return false;

    preparePseudoTrigger(trigger);
    const activate = event => {
        if (event?.type === 'click' && shouldIgnorePseudoToggleEvent(event, trigger)) return;
        if (event?.type === 'keydown') {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
        }
        applyDirectIdClickAssignments(actions);
    };

    trigger.addEventListener('click', activate, false);
    trigger.addEventListener('keydown', activate, false);
    trigger.removeAttribute('onclick');
    trigger.removeAttribute('aria-pressed');
    trigger.setAttribute(DIRECT_ID_CLICK_RESCUE_ATTR, 'true');
    return true;
}

function installRawMessageDirectIdClickProgramRescue(root) {
    if (!root?.querySelectorAll) return 0;
    const rawMessage = getRawAssistantMessageForRenderedRoot(root);
    const rawRoot = chooseMatchingRawRabbitMirrorRoot(rawMessage, root);
    if (!rawRoot?.querySelectorAll) return 0;

    let installed = 0;
    for (const rawTrigger of rawRoot.querySelectorAll('[onclick]')) {
        const path = getElementChildIndexPath(rawRoot, rawTrigger);
        if (!path) continue;
        const renderedTrigger = resolveElementChildIndexPath(root, path);
        if (!renderedTrigger || renderedTrigger.hasAttribute(DIRECT_ID_CLICK_RESCUE_ATTR)) continue;

        const source = rawTrigger.getAttribute('onclick');
        const actions = collectDirectIdClickAssignments(source, root);
        if (!actions?.length) continue;
        if (bindDirectIdClickActions(renderedTrigger, actions)) installed += 1;
    }
    return installed;
}

function installRawMessageCheckedChangeProgramRescue(root) {
    if (!root?.querySelectorAll) return 0;
    const rawMessage = getRawAssistantMessageForRenderedRoot(root);
    const rawRoot = chooseMatchingRawRabbitMirrorRoot(rawMessage, root);
    if (!rawRoot?.querySelectorAll) return 0;

    let installed = 0;
    for (const rawInput of rawRoot.querySelectorAll('input[type="checkbox"][onchange], input[type="radio"][onchange]')) {
        const path = getElementChildIndexPath(rawRoot, rawInput);
        if (!path) continue;
        const renderedInput = resolveElementChildIndexPath(root, path);
        if (!renderedInput?.matches?.('input[type="checkbox"], input[type="radio"]')) continue;
        if (renderedInput.hasAttribute(CHANGE_PSEUDO_RESCUE_ATTR)) continue;

        const source = rawInput.getAttribute('onchange') || '';
        const states = parseCheckedChangeStyleProgramFromSource(renderedInput, root, source);
        if (!states?.length) continue;
        if (bindCheckedChangeProgram(renderedInput, states)) installed += 1;
    }
    return installed;
}

function installInlineEventPseudoInteractionRescue(root) {
    if (!root?.querySelectorAll) return;
    const candidates = [...root.querySelectorAll('[onmouseover], [onmouseenter], [onmouseout], [onmouseleave], [onclick]')];

    for (const target of candidates) {
        if (target.hasAttribute(INLINE_PSEUDO_RESCUE_ATTR)) continue;
        const hoverOn = collectInlineAssignments(target, ['onmouseover', 'onmouseenter']);
        const hoverOff = collectInlineAssignments(target, ['onmouseout', 'onmouseleave']);
        const clickOn = collectInlineAssignments(target, ['onclick']);
        const activeAssignments = hoverOn.length ? hoverOn : clickOn;
        if (!activeAssignments.length) continue;

        const properties = new Set([...activeAssignments, ...hoverOff].map(item => item.property));
        const originalStyles = capturePseudoStyleState(target, properties);
        const trigger = isPseudoTriggerUsable(target) ? target : target.parentElement;
        if (!trigger || !root.contains(trigger)) continue;

        const state = {
            target,
            trigger,
            active: false,
            activeAssignments,
            inactiveAssignments: hoverOff,
            originalStyles,
        };
        pseudoInteractionStates.set(target, state);
        bindPseudoToggle(trigger, state);

        // 桌面鼠标继续保留原本的进入/离开语义；触屏则通过点击切换。
        if (hoverOn.length) {
            trigger.addEventListener('pointerenter', event => {
                if (event.pointerType === 'mouse') setPseudoInteractionState(state, true);
            }, false);
            trigger.addEventListener('pointerleave', event => {
                if (event.pointerType === 'mouse') setPseudoInteractionState(state, false);
            }, false);
        }

        // 识别成功后移除对应内联事件，避免 CSP 报错或浏览器与急救器双重执行。
        for (const attributeName of ['onmouseover', 'onmouseenter', 'onmouseout', 'onmouseleave', 'onclick']) {
            const eventCode = target.getAttribute(attributeName);
            if (parseInlineStyleAssignments(eventCode).length) target.removeAttribute(attributeName);
        }
        target.setAttribute(INLINE_PSEUDO_RESCUE_ATTR, 'true');
    }
}

function installHintedHiddenLayerRescue(root) {
    for (const { host, target } of findHintedHiddenLayerPairs(root)) {
        if (target.hasAttribute(HINTED_PSEUDO_RESCUE_ATTR)) continue;
        const properties = new Set(['opacity', 'visibility', 'pointer-events']);
        const originalStyles = capturePseudoStyleState(target, properties);
        const activeAssignments = [
            { property: 'opacity', value: '1' },
            { property: 'visibility', value: 'visible' },
            { property: 'pointer-events', value: 'auto' },
        ];
        const state = {
            target,
            trigger: host,
            active: false,
            activeAssignments,
            inactiveAssignments: [],
            originalStyles,
        };
        pseudoInteractionStates.set(target, state);
        bindPseudoToggle(host, state);
        target.setAttribute(HINTED_PSEUDO_RESCUE_ATTR, 'true');
    }
}

function installPseudoInteractionRescue(root) {
    installCheckedChangePseudoInteractionRescue(root);
    installDirectIdClickProgramRescue(root);
    installInlineEventPseudoInteractionRescue(root);
    // 某些宿主会在渲染前移除 onmouseover/onclick。此路径只在“悬停/点击提示 + 隐藏全覆盖层”同时存在时启用。
    installHintedHiddenLayerRescue(root);
}

function detectInteractionCapabilities(root) {
    if (!root?.querySelectorAll) return { checked: false, hover: false, details: false, target: false, pseudo: false, listDetail: false };
    const cssText = [...root.querySelectorAll('style')].map(style => style.textContent || '').join('\n');
    const outerDetails = root.matches?.('details') ? root : root.querySelector(':scope > details');
    const nestedDetails = [...root.querySelectorAll('details')].filter(item => item !== outerDetails);
    const capabilities = {
        checked: !!root.querySelector('input[type="checkbox"], input[type="radio"]') || /:checked\b/i.test(cssText),
        hover: /:hover\b/i.test(cssText),
        details: nestedDetails.length > 0,
        target: /:target\b/i.test(cssText) || !!root.querySelector('a[href^="#"]'),
        pseudo: hasPseudoInteractionCandidates(root),
        listDetail: hasRenderedListDetailCandidates(root),
    };
    interactionCapabilityStates.set(root, capabilities);
    root.dataset.rabbitMirrorInteractionRoutes = Object.entries(capabilities)
        .filter(([, enabled]) => enabled)
        .map(([name]) => name)
        .join(',') || 'none';
    return capabilities;
}

function collectTargetRulesFromCss(cssText) {
    const rules = [];
    const blockRe = /([^{}]+)\{([^{}]*)\}/g;
    let match;
    while ((match = blockRe.exec(String(cssText || '')))) {
        const selectorText = String(match[1] || '').trim();
        if (!selectorText || selectorText.startsWith('@') || !/:target\b/i.test(selectorText)) continue;
        const declarations = addImportantToDeclarationBlock(String(match[2] || ''));
        if (!declarations.trim()) continue;
        const selectors = selectorText.split(',')
            .map(value => value.trim())
            .filter(Boolean)
            .map(selector => selector.replace(/:target\b/gi, `[${TARGET_ACTIVE_ATTR}="true"]`));
        if (selectors.length) rules.push(`${selectors.join(', ')} {${declarations}}`);
    }
    return rules.join('\n');
}

function refreshTargetRescue(root) {
    if (!root?.querySelectorAll) return;
    let combinedCss = '';
    root.querySelectorAll(`style:not([${TARGET_RESCUE_STYLE_ATTR}])`).forEach(styleEl => {
        const parsed = collectTargetRulesFromCss(styleEl.textContent || '');
        if (parsed) combinedCss += `${parsed}\n`;
    });
    let rescueStyle = root.querySelector(`style[${TARGET_RESCUE_STYLE_ATTR}]`);
    if (combinedCss.trim()) {
        if (!rescueStyle) {
            rescueStyle = document.createElement('style');
            rescueStyle.setAttribute(TARGET_RESCUE_STYLE_ATTR, 'true');
            root.appendChild(rescueStyle);
        }
        const nextCss = combinedCss.trim();
        if (rescueStyle.textContent !== nextCss) rescueStyle.textContent = nextCss;
    } else if (rescueStyle) {
        rescueStyle.remove();
    }

    if (root.dataset.rabbitMirrorTargetFallback === 'true') return;
    root.addEventListener('click', event => {
        const anchor = event.target?.closest?.('a[href^="#"]');
        if (!anchor || !root.contains(anchor)) return;
        const rawId = String(anchor.getAttribute('href') || '').slice(1);
        if (!rawId) return;
        let target = null;
        try {
            target = [...root.querySelectorAll('[id]')].find(el => el.id === decodeURIComponent(rawId));
        } catch {
            target = [...root.querySelectorAll('[id]')].find(el => el.id === rawId);
        }
        if (!target) return;
        event.preventDefault();
        root.querySelectorAll(`[${TARGET_ACTIVE_ATTR}="true"]`).forEach(el => {
            if (el !== target) el.removeAttribute(TARGET_ACTIVE_ATTR);
        });
        const active = target.getAttribute(TARGET_ACTIVE_ATTR) === 'true';
        if (active) target.removeAttribute(TARGET_ACTIVE_ATTR);
        else target.setAttribute(TARGET_ACTIVE_ATTR, 'true');
    }, true);
    root.dataset.rabbitMirrorTargetFallback = 'true';
}

function installNestedDetailsFallback(root) {
    if (!root?.querySelectorAll || root.dataset.rabbitMirrorDetailsFallback === 'true') return;
    const outerDetails = root.matches?.('details') ? root : root.querySelector(':scope > details');
    root.addEventListener('click', event => {
        const summary = event.target?.closest?.('summary');
        const details = summary?.parentElement;
        if (!summary || !details || details.tagName !== 'DETAILS' || details === outerDetails || !root.contains(details)) return;
        // 仅当宿主没有在本次点击中改变 open 状态时才兜底，避免双重切换。
        const before = details.open;
        setTimeout(() => {
            if (details.isConnected && details.open === before) details.open = !before;
        }, 0);
    }, true);
    root.dataset.rabbitMirrorDetailsFallback = 'true';
}

function installIntelligentInteractionRescue(root) {
    // SillyTavern/DOMPurify 可能在渲染前移除 onclick。此时从当前消息的原始 HTML
    // 回读安全可解析的 getElementById 样式/文字赋值，并按同一 DOM 路径绑定到渲染节点。
    installRawMessageDirectIdClickProgramRescue(root);
    // 同样从原始消息回读受限的 onchange 状态程序，覆盖宿主已删除事件属性的情况。
    installRawMessageCheckedChangeProgramRescue(root);

    const capabilities = detectInteractionCapabilities(root);
    if (capabilities.checked) {
        strengthenRabbitMirrorCheckedStateCss(root);
        // 先从已渲染的安全 DOM 识别前景/隐藏层，再由 label 兜底触发 input/change。
        // 此路径完全不依赖已被宿主删除的 onclick/onchange。
        installRenderedStateLayerRescue(root);
        // 补救 label 后方的多段隐藏内容（如 querySelectorAll(...)[0/1]），不依赖事件原文。
        installRenderedAdjacentHiddenGroupRescue(root);
        installInteractionLabelFallback(root);
    }
    if (capabilities.hover) refreshTouchHoverRescue(root);
    if (capabilities.target) refreshTargetRescue(root);
    if (capabilities.details) installNestedDetailsFallback(root);
    if (capabilities.pseudo) installPseudoInteractionRescue(root);
    if (capabilities.listDetail) installRenderedListDetailRescue(root);
}

const touchHoverRescueStates = new WeakMap();
const TOUCH_HOVER_ATTR = 'data-rm-touch-hover';
const TOUCH_HOVER_STYLE_ATTR = 'data-rabbit-mirror-touch-hover-rescue';

function collectTouchHoverRulesFromCss(cssText) {
    const rules = [];
    const subjects = new Set();
    const blockRe = /([^{}]+)\{([^{}]*)\}/g;
    let match;

    while ((match = blockRe.exec(String(cssText || '')))) {
        const selectorText = String(match[1] || '').trim();
        if (!selectorText || selectorText.startsWith('@') || !/:hover\b/i.test(selectorText)) continue;

        const declarations = addImportantToDeclarationBlock(String(match[2] || ''));
        if (!declarations.trim()) continue;

        const transformedSelectors = [];
        for (const selector of selectorText.split(',').map(value => value.trim()).filter(Boolean)) {
            if (!/:hover\b/i.test(selector)) continue;

            // 手机端以一个持久属性模拟当前元素的 :hover 状态。
            transformedSelectors.push(selector.replace(/:hover\b/gi, `[${TOUCH_HOVER_ATTR}="true"]`));

            // 只提取紧邻 :hover 的简单主体（class / id / tag / attribute compound）。
            // 这覆盖模型最常生成的 .area:hover、#panel:hover、label:hover 等结构。
            const subjectRe = /((?:[a-zA-Z][\w-]*)?(?:[#.][\w-]+|\[[^\]]+\])*)\s*:hover\b/gi;
            let subjectMatch;
            while ((subjectMatch = subjectRe.exec(selector))) {
                const subject = String(subjectMatch[1] || '').trim();
                if (subject) subjects.add(subject);
            }
        }

        if (transformedSelectors.length) {
            rules.push(`${transformedSelectors.join(', ')} {${declarations}}`);
        }
    }

    return { cssText: rules.join('\n'), subjects: [...subjects] };
}

function refreshTouchHoverRescue(toto) {
    if (!toto?.querySelectorAll) return;

    let combinedCss = '';
    const subjects = new Set();
    toto.querySelectorAll(`style:not([${TOUCH_HOVER_STYLE_ATTR}])`).forEach(styleEl => {
        const parsed = collectTouchHoverRulesFromCss(styleEl.textContent || '');
        if (parsed.cssText) combinedCss += `${parsed.cssText}\n`;
        parsed.subjects.forEach(subject => subjects.add(subject));
    });

    let rescueStyle = toto.querySelector(`style[${TOUCH_HOVER_STYLE_ATTR}]`);
    if (combinedCss.trim()) {
        if (!rescueStyle) {
            rescueStyle = document.createElement('style');
            rescueStyle.setAttribute(TOUCH_HOVER_STYLE_ATTR, 'true');
            toto.appendChild(rescueStyle);
        }
        const nextCss = combinedCss.trim();
        if (rescueStyle.textContent !== nextCss) rescueStyle.textContent = nextCss;
    } else if (rescueStyle) {
        rescueStyle.remove();
    }

    touchHoverRescueStates.set(toto, { subjects: [...subjects] });

    if (toto.dataset.rabbitMirrorTouchHoverFallback === 'true') return;
    toto.addEventListener('click', (event) => {
        const state = touchHoverRescueStates.get(toto);
        if (!state?.subjects?.length) return;

        let hoverTarget = null;
        for (const subject of state.subjects) {
            try {
                const candidate = event.target?.closest?.(subject);
                if (candidate && toto.contains(candidate)) {
                    hoverTarget = candidate;
                    break;
                }
            } catch {
                // Ignore malformed model-generated selectors.
            }
        }
        if (!hoverTarget) return;

        const isActive = hoverTarget.getAttribute(TOUCH_HOVER_ATTR) === 'true';
        if (isActive) hoverTarget.removeAttribute(TOUCH_HOVER_ATTR);
        else hoverTarget.setAttribute(TOUCH_HOVER_ATTR, 'true');
    }, false);

    toto.dataset.rabbitMirrorTouchHoverFallback = 'true';
}

function installInteractionLabelFallback(toto) {
    if (!toto || toto.dataset.rabbitMirrorInteractionFallback === 'true') return;

    // 使用捕获阶段，避免主题或其他插件在内部 stopPropagation 后导致 label 完全点不开。
    toto.addEventListener('click', (event) => {
        const label = event.target?.closest?.('label');
        if (!label || !toto.contains(label)) return;

        const targetId = label.getAttribute('for');
        const input = targetId
            ? [...toto.querySelectorAll('input[id]')].find(el => el.id === targetId)
            : label.querySelector('input[type="checkbox"], input[type="radio"]');
        if (!input || !/^(?:checkbox|radio)$/i.test(input.type || '') || input.disabled) return;

        // 浏览器/主题层有时不会可靠触发隐藏 input；只在当前兔子镜内手动完成一次。
        event.preventDefault();
        const previous = !!input.checked;
        if (input.type === 'radio') {
            // 先恢复同组上一分支由急救器写入的内联状态，再切换到当前分支。
            const radioName = String(input.name || '');
            [...toto.querySelectorAll('input[type="radio"]')]
                .filter(item => item !== input && (!radioName || item.name === radioName))
                .forEach(item => restoreInteractionInlineOverrides(item));
            input.checked = true;
        } else {
            input.checked = !input.checked;
        }

        // 在部分移动端 WebView 中，晚到的 <style> 即使被补上 !important，
        // 也可能未稳定覆盖元素原有的内联 display:none。这里直接按真实 :checked
        // 规则把状态声明落到匹配目标上，取消勾选时再恢复，作为最终兜底。
        // 先走不依赖 CSSOM 的文本解析兜底；酒馆/WebView 即使不给 style.sheet，仍能修复。
        // 文本规则命中后不要再运行 CSSOM 兜底，否则后者开头的恢复动作会撤销刚应用的状态。
        const textRuleCount = applyCheckedRuleTextFallback(toto, input);
        // 仅在文本解析没有命中时再尝试 CSSOM（例如规则位于复杂 @media 内）。
        if (!textRuleCount) applyCheckedRuleInlineFallback(toto, input);

        if (previous !== input.checked) {
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, true);

    toto.dataset.rabbitMirrorInteractionFallback = 'true';
}

function collectExistingIdReferences(text, existingIds, output) {
    const value = String(text || '');
    // 按 DOM 中真实存在的 ID 精确匹配，避免把 :checked / :hover 等伪类误当成 ID 的一部分。
    for (const id of existingIds) {
        const escaped = escapeRegExp(id);
        if (new RegExp(`#${escaped}(?![\\w-])`).test(value)
            || new RegExp(`url\\(\\s*["']?#${escaped}(?:["']?\\s*)\\)`, 'i').test(value)) {
            output.add(id);
        }
    }
}

function collectUrlIdReferences(text, existingIds, output) {
    const pattern = /url\(\s*["']?#([^\s)"']+)/gi;
    let match;
    while ((match = pattern.exec(String(text || '')))) {
        const id = match[1];
        if (existingIds.has(id)) output.add(id);
    }
}

function buildElementsById(toto) {
    const elementsById = new Map();
    toto.querySelectorAll('[id]').forEach(el => {
        const id = String(el.id || '').trim();
        if (!id) return;
        if (!elementsById.has(id)) elementsById.set(id, []);
        elementsById.get(id).push(el);
    });
    return elementsById;
}

function collectCurrentIdsToScope(toto, elementsById, mappedValues = new Set()) {
    const existingIds = new Set(elementsById.keys());
    const idsToScope = new Set();
    const controls = [...toto.querySelectorAll('input[type="checkbox"], input[type="radio"]')];

    controls.forEach(input => {
        const id = String(input.id || '').trim();
        if (id && !mappedValues.has(id)) idsToScope.add(id);
    });

    toto.querySelectorAll('label[for], [href^="#"], [xlink\\:href^="#"], [aria-controls], [aria-labelledby], [aria-describedby]').forEach(el => {
        const forValue = el.getAttribute('for');
        if (forValue && existingIds.has(forValue) && !mappedValues.has(forValue)) idsToScope.add(forValue);
        for (const attr of ['href', 'xlink:href']) {
            const value = el.getAttribute(attr);
            const id = value?.startsWith('#') ? value.slice(1) : '';
            if (id && existingIds.has(id) && !mappedValues.has(id)) idsToScope.add(id);
        }
        for (const attr of ['aria-controls', 'aria-labelledby', 'aria-describedby']) {
            const value = el.getAttribute(attr);
            if (value) value.split(/\s+/).filter(Boolean).forEach(id => {
                if (existingIds.has(id) && !mappedValues.has(id)) idsToScope.add(id);
            });
        }
    });

    toto.querySelectorAll('style').forEach(styleEl => {
        collectExistingIdReferences(styleEl.textContent, existingIds, idsToScope);
    });
    toto.querySelectorAll('*').forEach(el => {
        for (const attr of [...(el.attributes || [])]) {
            if (!attr?.value || /^(?:id|class)$/i.test(attr.name)) continue;
            collectUrlIdReferences(attr.value, existingIds, idsToScope);
            if (/^(?:begin|end)$/i.test(attr.name) && attr.value.includes('.')) {
                for (const id of existingIds) {
                    if (!mappedValues.has(id) && new RegExp(`(^|[;\\s])${escapeRegExp(id)}(?=\\.)`).test(attr.value)) idsToScope.add(id);
                }
            }
        }
    });

    return { controls, idsToScope };
}

function synchronizeInteractionReferences(toto, idMap) {
    if (!idMap?.size) return;

    toto.querySelectorAll('label[for]').forEach(label => {
        const oldFor = label.getAttribute('for');
        if (idMap.has(oldFor)) label.setAttribute('for', idMap.get(oldFor));
    });

    toto.querySelectorAll('[href^="#"], [xlink\\:href^="#"]').forEach(el => {
        for (const attr of ['href', 'xlink:href']) {
            const value = el.getAttribute(attr);
            if (!value?.startsWith('#')) continue;
            const oldId = value.slice(1);
            if (idMap.has(oldId)) el.setAttribute(attr, `#${idMap.get(oldId)}`);
        }
    });

    for (const attr of ['aria-controls', 'aria-labelledby', 'aria-describedby']) {
        toto.querySelectorAll(`[${attr}]`).forEach(el => {
            el.setAttribute(attr, replaceIdReferenceTokens(el.getAttribute(attr), idMap));
        });
    }

    // 流式生成时 <style> 往往最后才到达。每次扫描都重新同步，避免旧 ID 留在晚到的 CSS 中。
    toto.querySelectorAll('style').forEach(styleEl => {
        const currentText = String(styleEl.textContent || '');
        const rewrittenText = rewriteCssIdReferences(currentText, idMap);
        // 仅在内容确实变化时重建样式表。无条件写回会触发 MutationObserver，
        // 让 @keyframes 动画不断从 0 秒重启，视觉上表现为完全静止。
        if (rewrittenText !== currentText) styleEl.textContent = rewrittenText;
    });

    // 同步所有属性中的 url(#id)，覆盖 SVG 的 fill/stroke/filter/clip-path/mask/marker 等。
    toto.querySelectorAll('*').forEach(el => {
        for (const attr of [...(el.attributes || [])]) {
            if (!attr?.value) continue;
            if (/url\(\s*["']?#/i.test(attr.value)) {
                el.setAttribute(attr.name, rewriteCssIdReferences(attr.value, idMap));
            } else if (/^(?:begin|end)$/i.test(attr.name) && attr.value.includes('.')) {
                el.setAttribute(attr.name, rewriteSmilIdReferences(attr.value, idMap));
            }
        }
    });
}

function recoverInteractionScopeState(toto) {
    const idMap = new Map();
    let prefix = '';
    toto.querySelectorAll('[id]').forEach(el => {
        const currentId = String(el.id || '').trim();
        const match = currentId.match(SCOPED_INTERACTION_ID_RE);
        if (!match) return;
        prefix ||= match[1];
        if (match[1] === prefix && match[2]) idMap.set(match[2], currentId);
    });
    return idMap.size ? { prefix, idMap } : null;
}

function scopeRabbitMirrorInteractionIds(toto) {
    if (!toto?.querySelector) return;

    // WeakMap 记录同一 DOM 在流式生成期间的映射；旧版本留下的 data 标记则从已加前缀的 ID 中恢复。
    let state = interactionScopeStates.get(toto);
    if (!state && toto.dataset.rabbitMirrorInteractionScoped === 'true') {
        state = recoverInteractionScopeState(toto);
        if (state) interactionScopeStates.set(toto, state);
        else delete toto.dataset.rabbitMirrorInteractionScoped;
    }

    if (!state) {
        state = { prefix: createInteractionScopePrefix(), idMap: new Map() };
        interactionScopeStates.set(toto, state);
    }

    const mappedValues = new Set(state.idMap.values());
    const elementsById = buildElementsById(toto);
    const { controls, idsToScope } = collectCurrentIdsToScope(toto, elementsById, mappedValues);

    // 新到达的交互控件或 SVG/CSS 引用只追加到原映射，不会给已有 ID 再套第二层前缀。
    for (const oldId of idsToScope) {
        if (state.idMap.has(oldId) || mappedValues.has(oldId) || !elementsById.has(oldId)) continue;
        const newId = `${state.prefix}${oldId}`;
        state.idMap.set(oldId, newId);
        mappedValues.add(newId);
        for (const el of elementsById.get(oldId) || []) el.id = newId;
    }

    controls.filter(input => input.type === 'radio' && input.hasAttribute('name')).forEach(input => {
        const name = input.getAttribute('name') || '';
        if (name && !name.startsWith(state.prefix)) input.name = `${state.prefix}${name}`;
    });

    synchronizeInteractionReferences(toto, state.idMap);
    installIntelligentInteractionRescue(toto);
    toto.dataset.rabbitMirrorInteractionScoped = 'true';
}

function getRenderedRabbitMirrorInteractionRoots(root) {
    if (!root?.querySelectorAll) return [];
    const candidates = new Set(root.querySelectorAll(MIRROR_TOTO_SELECTOR));

    // 部分酒馆渲染/净化链会移除未知的 <toto> 外壳，但保留带“兔子镜”标题的 <details>。
    // 代码块急救原本已有该兼容路径；交互急救也必须识别同一类实际渲染结果。
    root.querySelectorAll('details').forEach(details => {
        if (!isRabbitMirrorDetails(details)) return;
        if (details.closest(MIRROR_TOTO_SELECTOR)) return;
        candidates.add(details);
    });

    return [...candidates];
}

function scopeRabbitMirrorInteractionsInChatDom() {
    const root = getChatRoot();
    if (!root) return;
    const enabled = isInteractionRescueModeEnabled();
    getRenderedRabbitMirrorInteractionRoots(root).forEach(mirrorRoot => {
        if (!isInsideChatMessage(mirrorRoot)) return;
        const remembered = wasInteractionRescued(mirrorRoot);
        if (!enabled && !remembered) return;
        if (enabled && !remembered) rememberInteractionRescue(mirrorRoot);
        scopeRabbitMirrorInteractionIds(mirrorRoot);
        mirrorRoot.dataset.rabbitMirrorInteractionRescued = 'true';
    });
}

function stripHtmlComments(text) {
    return String(text || '').replace(HTML_COMMENT_RE, '');
}

function normalizeMirrorAttribute(text) {
    return String(text || '').replace(new RegExp('data-rabbit-' + 'h' + 'ole', 'gi'), 'data-rabbit-mirror');
}

function stripSyntaxHighlightClasses(text) {
    return String(text || '').replace(CLASS_ATTR_RE, (match, quote, classValue) => {
        const kept = String(classValue || '')
            .split(/\s+/)
            .filter(token => token && !HIGHLIGHT_CLASS_TOKEN_RE.test(token));
        return kept.length ? ` class=${quote}${kept.join(' ')}${quote}` : '';
    });
}

function stripCodeBlockTriggers(text) {
    return normalizeMirrorAttribute(stripHtmlComments(String(text || '')))
        .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
        .replace(CODE_FENCE_OPEN_RE, '')
        .replace(/```/g, '')
        .replace(TILDE_FENCE_OPEN_RE, '')
        .replace(/~~~/g, '')
        .replace(CODE_LIKE_TAG_RE, '')
        .replace(CLASS_ATTR_RE, (match, quote, classValue) => {
            const kept = String(classValue || '')
                .split(/\s+/)
                .filter(token => token && !HIGHLIGHT_CLASS_TOKEN_RE.test(token));
            return kept.length ? ` class=${quote}${kept.join(' ')}${quote}` : '';
        })
        .replace(MULTI_BLANK_LINE_RE, '\n')
        .trim();
}

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

    // 只接管“像兔子镜 UI 作品”的整段 HTML，避免误伤普通聊天里的 HTML 教程代码。
    const htmlSignal = /\bstyle\s*=|display\s*:\s*(?:grid|flex|block)|box-sizing\s*:|max-width\s*:|linear-gradient\(|box-shadow\s*:|filter\s*:|border-radius\s*:/i.test(html);
    const theaterSignal = /兔子镜|小剧场|互动区|海龟汤|剖面图|Layer|视觉|展现形式|summary|details/i.test(html);
    const enoughTags = (html.match(/<\/(?:div|p|span|h[1-6]|section|article)>/gi) || []).length >= 3;
    return htmlSignal && (theaterSignal || enoughTags);
}

function wrapNakedHtmlAsToto(html) {
    const body = compactTotoBlock(html);
    if (TOTO_BLOCK_SINGLE_RE.test(body)) return body;
    if (/<details\b/i.test(body) && /<summary\b/i.test(body)) {
        return `<toto data-rabbit-mirror="true" style="display:block;">${body}</toto>`;
    }
    return `<toto data-rabbit-mirror="true" style="display:block;"><details style="display:block;box-sizing:border-box;"><summary style="cursor:pointer;list-style:none;font-weight:700;margin:0 0 8px 0;">【兔子镜：小剧场】</summary>${body}</details></toto>`;
}

function cleanCodeFencePayload(payload) {
    const raw = stripHtmlComments(stripOneCodeFence(decodeHtmlEntities(payload)));
    if (!raw) return raw;
    if (TOTO_BLOCK_SINGLE_RE.test(raw)) return cleanRabbitMirrorOutput(raw);
    if (looksLikeCompleteHtmlBlock(raw)) return wrapNakedHtmlAsToto(raw);
    return null;
}

function unwrapCodeBlocksInsideToto(block) {
    let html = stripHtmlComments(String(block || ''));

    // 关键兜底：外层 <toto>/<details> 已经成立，但模型把正文 HTML 又塞进 ```html 代码块时，
    // 这里只拆掉内部代码块，保留原本的外层 summary，不再二次包 <toto>。
    html = html.replace(FENCED_BLOCK_RE, (match, payload) => {
        const raw = stripHtmlComments(stripOneCodeFence(decodeHtmlEntities(payload)));
        if (looksLikeCompleteHtmlBlock(raw)) return compactTotoBlock(raw);
        if (TOTO_BLOCK_SINGLE_RE.test(raw)) return compactTotoBlock(raw.replace(/^<toto\b[^>]*>/i, '').replace(/<\/toto>\s*$/i, ''));
        return match;
    });

    // 兼容已经被 Markdown 渲染成 <pre><code>&lt;div...&gt;</code></pre> 后又写回消息的情况。
    html = html.replace(PRE_CODE_RE, (match, payload) => {
        const raw = stripHtmlComments(stripOneCodeFence(decodeHtmlEntities(payload)));
        if (looksLikeCompleteHtmlBlock(raw)) return compactTotoBlock(raw);
        if (TOTO_BLOCK_SINGLE_RE.test(raw)) return compactTotoBlock(raw.replace(/^<toto\b[^>]*>/i, '').replace(/<\/toto>\s*$/i, ''));
        return match;
    });

    return stripCodeBlockTriggers(html);
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
    let html = normalizeMirrorAttribute(stripCodeBlockTriggers(block));
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

    return html
        .replace(CLASS_ATTR_RE, (match, quote, classValue) => {
            const kept = String(classValue || '')
                .split(/\s+/)
                .filter(token => token && !HIGHLIGHT_CLASS_TOKEN_RE.test(token));
            return kept.length ? ` class=${quote}${kept.join(' ')}${quote}` : '';
        })
        .replace(MULTI_BLANK_LINE_RE, '\n')
        .trim();
}

export function cleanRabbitMirrorOutput(responseText = '') {
    // 代码块急救模式关闭时，严格不干预原始输出。
    // 开启后才拆代码块外壳、pre/code、语法高亮 class 等。
    if (!isCodeBlockRescueModeEnabled()) return String(responseText || '');

    let text = normalizeMirrorAttribute(stripHtmlComments(String(responseText || '')))
        .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
        .replace(/\r\n?/g, '\n')
        .trim();

    // 1. 如果整个回复被一层 ```html 包住，先扒掉最外层。
    const wholeFence = text.match(WHOLE_FENCED_BLOCK_RE);
    if (wholeFence) {
        const payload = decodeHtmlEntities(wholeFence[1]).trim();
        if (TOTO_BLOCK_SINGLE_RE.test(payload) || looksLikeCompleteHtmlBlock(payload)) text = payload;
    }

    // 2. 先处理已经有 <toto> 外壳的块：拆掉内部 ```html / <pre><code>，再压缩。
    text = text.replace(TOTO_BLOCK_RE, (block) => compactTotoBlock(unwrapCodeBlocksInsideToto(block)));

    // 3. 再处理外层裸露的代码块：如果整块是兔子镜或裸 HTML，则补边界。
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
    if (!isCodeBlockRescueModeEnabled()) return false;
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
    if (!isCodeBlockRescueModeEnabled()) return false;
    let changed = false;
    for (const message of findRecentAssistantMessages(mod)) {
        const decoded = decodeHtmlEntities(message.mes);
        if (!needsSanitize(decoded)) continue;
        const cleaned = cleanRabbitMirrorOutput(decoded);
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
            console.debug('[RabbitMirror] save after sanitizer failed:', error);
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
        const toto = template.content.querySelector('toto[data-rabbit-mirror="true"], toto');
        return toto ? toto.cloneNode(true) : null;
    } catch {
        return null;
    }
}

const CODE_SHELL_SELECTOR = 'pre, code, .hljs, .code_block, .code-block, .codeblock, [class*="codeblock"], [class*="code-block"]';

function isCodeShellNode(node) {
    return !!node?.matches?.(CODE_SHELL_SELECTOR);
}

function findCodeReplaceTarget(node) {
    // 只替换真正的代码块节点；绝不根据父层文字或样式向上吞掉普通容器。
    // 因而主容器的 background / border / padding / radius / shadow / layout 会原样保留。
    if (!node?.closest) return null;
    const pre = node.closest('pre');
    if (pre) return pre;
    return isCodeShellNode(node) ? node : null;
}

function getChatRoot() {
    if (typeof document === 'undefined') return null;
    return document.querySelector('#chat')
        || document.querySelector('#chat_block')
        || document.querySelector('.chat')
        || document.querySelector('[id*=chat]');
}

function isInsideChatMessage(node) {
    const root = getChatRoot();
    if (!root || !node || !root.contains(node)) return false;
    // 只允许修聊天区，绝不碰扩展设置页/弹窗，避免再次影响其他插件勾选。
    // 注意：不要用 .drawer-content 做全局排除，部分主题/插件会把聊天消息也包在 drawer 类容器里。
    if (node.closest('#extensions_settings, #extensions_settings2, #rm_extensions_block, #extensionsMenu, .popup, .modal, .ui-dialog')) return false;
    const messageScope = node.closest('.mes, [mesid], .mes_text, [data-message-id], [data-messageid], .swipe_right, .swipe_left');
    return !!messageScope || root === node.closest('#chat') || root === node.closest('#chat_block');
}

function getCodeCandidateText(node) {
    const clone = node.cloneNode(true);
    // 去掉代码块工具栏文字，避免“隐藏代码块/复制”等字样影响 HTML 判断。
    for (const el of [...clone.querySelectorAll('button, .copy_code, .code-copy, .codeblock-header, .code_block_header, .toolbar, .hljs-button')]) el.remove();
    return clone.textContent || '';
}


function extractLikelyHtmlFromText(text) {
    let raw = stripOneCodeFence(decodeHtmlEntities(String(text || '')))
        .replace(/\u00a0/g, ' ')
        .trim();
    if (!raw) return '';

    // 去掉“隐藏代码块/复制”等代码块工具栏文字；有些主题会把它们混进 textContent。
    raw = raw
        .replace(/^(?:隐藏代码块|显示代码块|Hide code|Show code|Copy|Copied|复制|复制代码|代码块|Code)\s*/i, '')
        .trim();

    const startMatch = raw.match(/<\s*(?:toto|div|section|article|details)\b/i);
    if (!startMatch) return '';
    raw = raw.slice(startMatch.index).trim();

    // 如果末尾混入了复制按钮/提示文字，从最后一个可信闭合标签截断。
    const closingTags = ['</toto>', '</details>', '</article>', '</section>', '</div>'];
    let end = -1;
    for (const tag of closingTags) {
        const index = raw.toLowerCase().lastIndexOf(tag);
        if (index >= 0) end = Math.max(end, index + tag.length);
    }
    if (end >= 0) raw = raw.slice(0, end).trim();

    return raw;
}

function isRabbitMirrorDetails(details) {
    if (!details?.querySelector) return false;
    const summary = details.querySelector(':scope > summary') || details.querySelector('summary');
    const title = (summary?.textContent || '').replace(/\s+/g, ' ').trim();
    return /^【兔子镜[:：]/.test(title) || /兔子镜/.test(title);
}

function sanitizeRenderedRabbitMirrorDetailsDom() {
    if (!isCodeBlockRescueModeEnabled()) return;
    const root = getChatRoot();
    if (!root) return;
    const detailsList = [...root.querySelectorAll('toto details, details')].filter(isRabbitMirrorDetails);

    for (const details of detailsList) {
        if (!isInsideChatMessage(details)) continue;

        // 以 summary 为锚点修复：标题已经被渲染成功时，说明外层兔子镜成立；
        // 这时只要把 summary 后面被当成源码显示的 HTML 正文拆回真实 DOM。
        const candidates = [...details.querySelectorAll('pre, code, .hljs, .code_block, .code-block, .codeblock, [class*="codeblock"], [class*="code-block"]')]
            .filter(node => node !== details && !node.closest('summary'))
            .sort((a, b) => (b.querySelectorAll('*').length - a.querySelectorAll('*').length));

        for (const node of candidates) {
            if (!node?.isConnected || !details.contains(node)) continue;
            if (node.querySelector?.('toto, details')) continue;

            const raw = extractLikelyHtmlFromText(getCodeCandidateText(node));
            if (!raw) continue;

            let replacement = null;
            if (TOTO_BLOCK_SINGLE_RE.test(raw)) {
                const cleaned = cleanRabbitMirrorOutput(raw);
                const inner = cleaned
                    .replace(/^\s*<toto\b[^>]*>/i, '')
                    .replace(/<\/toto>\s*$/i, '')
                    .trim();
                replacement = parseHtmlFragment(compactTotoBlock(inner));
            } else if (looksLikeCompleteHtmlBlock(raw)) {
                replacement = parseHtmlFragment(compactTotoBlock(raw));
            }

            if (!replacement) continue;
            const target = findCodeReplaceTarget(node);
            if (target?.isConnected && details.contains(target) && isInsideChatMessage(target) && isCodeShellNode(target)) {
                target.replaceWith(replacement);
                break;
            }
        }
    }
}

function sanitizeCodeBlocksInChatDom() {
    if (!isCodeBlockRescueModeEnabled()) return;
    const root = getChatRoot();
    if (!root) return;
    const candidates = [...new Set([...root.querySelectorAll(CODE_SHELL_SELECTOR)])]
        .filter(node => !node.querySelector?.('pre, code') || node.matches('pre, code, .hljs'));

    for (const node of candidates) {
        if (!node?.isConnected || !isInsideChatMessage(node)) continue;
        const raw = stripOneCodeFence(decodeHtmlEntities(getCodeCandidateText(node)));
        if (!raw) continue;

        let replacement = null;
        const ownerDetails = node.closest('details');
        const insideRabbitMirror = !!node.closest(MIRROR_TOTO_SELECTOR) || !!(ownerDetails && isRabbitMirrorDetails(ownerDetails));

        if (TOTO_BLOCK_SINGLE_RE.test(raw)) {
            const cleaned = cleanRabbitMirrorOutput(raw);
            const match = cleaned.match(TOTO_BLOCK_SINGLE_RE);
            replacement = match ? parseTotoFragment(match[0]) : null;
        } else if (looksLikeCompleteHtmlBlock(raw)) {
            // 已经在兔子镜 details 里面时，只把代码块内容变成真实 HTML，避免再套一层小剧场。
            replacement = insideRabbitMirror
                ? parseHtmlFragment(compactTotoBlock(raw))
                : parseTotoFragment(wrapNakedHtmlAsToto(raw));
        }

        if (!replacement) continue;
        const target = findCodeReplaceTarget(node);
        if (target?.isConnected && isInsideChatMessage(target) && isCodeShellNode(target)) {
            target.replaceWith(replacement);
        }
    }
}

export function triggerInteractionRescue() {
    try {
        // 已经修复过的兔子镜会被会话记忆继续维护；关闭开关只停止处理新消息。
        scopeRabbitMirrorInteractionsInChatDom();
    } catch (error) {
        console.debug('[RabbitMirror] interaction rescue trigger failed:', error);
    }
}

export function triggerCodeBlockRescue(mod = null) {
    try {
        if (isCodeBlockRescueModeEnabled()) {
            sanitizeLatestRawMessages(mod || globalThis);
            sanitizeCodeBlocksInChatDom();
            sanitizeRenderedRabbitMirrorDetailsDom();
        }
        // 两项同时开启时固定为：先恢复真实 DOM，再修交互。
        triggerInteractionRescue();
    } catch (error) {
        console.debug('[RabbitMirror] code block rescue trigger failed:', error);
    }
}

function scheduleSanitize(mod) {
    const run = () => {
        if (isCodeBlockRescueModeEnabled()) {
            // 先修原始消息，避免保存后继续携带代码块壳。
            sanitizeLatestRawMessages(mod);
            // 再只修聊天区内已经渲染出来的代码块，不扫描设置页，避免误伤其他插件 UI。
            sanitizeCodeBlocksInChatDom();
            sanitizeRenderedRabbitMirrorDetailsDom();
        }
        // 交互急救独立受控；若代码块急救也开启，此时 DOM 已恢复完成。
        triggerInteractionRescue();
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
        hostScriptModule = mod;
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

        // 只修聊天消息，但监听要更稳：如果初始化时 #chat 还没挂载，就监听 body 等它出现。
        if (typeof MutationObserver !== 'undefined') {
            const chatRoot = getChatRoot();
            if (chatRoot) {
                const observer = new MutationObserver(() => scheduleSanitize(mod));
                observer.observe(chatRoot, { childList: true, subtree: true });
            } else if (typeof document !== 'undefined' && document.body) {
                const observer = new MutationObserver((mutations) => {
                    if (getChatRoot() || mutations.some(m => [...m.addedNodes].some(n => n?.querySelector?.('#chat, #chat_block, .mes, .mes_text')))) {
                        scheduleSanitize(mod);
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            }
        }

        scheduleSanitize(mod);
        console.debug('[RabbitMirror] output sanitizer initialized');
    } catch (error) {
        console.debug('[RabbitMirror] output sanitizer disabled:', error);
    }
}
