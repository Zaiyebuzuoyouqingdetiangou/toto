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

function isPlainTextRescueModeEnabled() {
    try {
        return !!getSettings().plainTextRescueMode;
    } catch {
        return false;
    }
}

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


const FOCUS_TO_CHECKED_STYLE_ATTR = 'data-rabbit-mirror-focus-to-checked-rescue';
const FOCUS_TO_CHECKED_ROOT_ATTR = 'data-rabbit-mirror-focus-to-checked-rules';

function escapeCssIdentifier(value) {
    const text = String(value || '');
    try {
        if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(text);
    } catch {
        // Fall through to a conservative identifier escape.
    }
    return text.replace(/(^-?\d)|[^a-zA-Z0-9_-]/g, match => `\\${match}`);
}

function replaceCheckableFocusSubject(selector, input) {
    if (!selector || !input?.id || !/:focus\b\s*[+~]/i.test(selector)) return '';

    // 只接管“checkbox/radio 自身的 :focus 作为持久状态触发器”的明确误写。
    // 目标必须位于后续兄弟链；普通按钮/链接/文本输入的 focus 视觉完全不碰。
    const subjectRe = /((?:input\b)?(?:[#.][a-zA-Z0-9_-]+|\[[^\]]+\])*)\s*:focus\b(?=\s*[+~])/gi;
    let matched = false;
    const rewritten = String(selector).replace(subjectRe, (full, subject) => {
        const candidate = String(subject || '').trim();
        if (!candidate) return full;
        try {
            if (!input.matches(candidate)) return full;
        } catch {
            return full;
        }
        matched = true;
        return `#${escapeCssIdentifier(input.id)}:checked`;
    });
    return matched ? rewritten : '';
}

function collectFocusToCheckedRules(root) {
    if (!root?.querySelectorAll) return [];
    const inputs = [...root.querySelectorAll('input[type="checkbox"], input[type="radio"]')]
        .filter(input => input.id && !input.disabled);
    if (!inputs.length) return [];

    const rules = [];
    const seen = new Set();
    root.querySelectorAll(`style:not([${FOCUS_TO_CHECKED_STYLE_ATTR}])`).forEach(styleEl => {
        const css = String(styleEl.textContent || '');
        const blockRe = /([^{}]+)\{([^{}]*)\}/g;
        let match;
        while ((match = blockRe.exec(css))) {
            const selectorText = String(match[1] || '').trim();
            if (!selectorText || selectorText.startsWith('@') || !/:focus\b\s*[+~]/i.test(selectorText)) continue;
            const declarations = addImportantToDeclarationBlock(String(match[2] || ''));
            if (!declarations.trim()) continue;

            for (const selector of selectorText.split(',').map(value => value.trim()).filter(Boolean)) {
                for (const input of inputs) {
                    const rewritten = replaceCheckableFocusSubject(selector, input);
                    if (!rewritten) continue;
                    const key = `${rewritten}|${declarations}`;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    rules.push(`${rewritten} {${declarations}}`);
                }
            }
        }
    });
    return rules;
}

function refreshFocusToCheckedRescue(root) {
    if (!root?.querySelectorAll) return;
    const rules = collectFocusToCheckedRules(root);
    let rescueStyle = root.querySelector(`style[${FOCUS_TO_CHECKED_STYLE_ATTR}]`);

    if (rules.length) {
        if (!rescueStyle) {
            rescueStyle = document.createElement('style');
            rescueStyle.setAttribute(FOCUS_TO_CHECKED_STYLE_ATTR, 'true');
            root.appendChild(rescueStyle);
        }
        const nextCss = rules.join('\n');
        if (rescueStyle.textContent !== nextCss) rescueStyle.textContent = nextCss;
        root.setAttribute(FOCUS_TO_CHECKED_ROOT_ATTR, String(rules.length));
    } else {
        rescueStyle?.remove();
        root.removeAttribute(FOCUS_TO_CHECKED_ROOT_ATTR);
    }
}


const CHECKED_TEXT_RULE_RESCUE_ATTR = 'data-rabbit-mirror-checked-text-rule-rescue';
const EXPANDED_OPACITY_RESCUE_ATTR = 'data-rabbit-mirror-expanded-opacity-rescue';

function collectCheckedRevealSignal(candidate, property, value) {
    if (!candidate) return;
    const name = String(property || '').trim().toLowerCase();
    const cleanValue = String(value || '').trim().toLowerCase();
    if (!name || !cleanValue) return;

    if (name === 'opacity') {
        // 激活规则明确声明透明度时尊重原规则，不进行残留透明度保全。
        candidate.explicitOpacity = true;
        return;
    }

    if (name === 'display' && cleanValue !== 'none') candidate.expands = true;
    else if (name === 'visibility' && cleanValue !== 'hidden' && cleanValue !== 'collapse') candidate.expands = true;
    else if (name === 'height' || name === 'min-height' || name === 'max-height') {
        if (!isCollapsedDimensionValue(cleanValue)) candidate.expands = true;
    }
}

function rememberCheckedRevealCandidate(candidates, target, styleMap) {
    if (!target || !styleMap?.length) return;
    let candidate = candidates.get(target);
    if (!candidate) {
        candidate = { target, expands: false, explicitOpacity: false };
        candidates.set(target, candidate);
    }
    for (const [property, value] of styleMap) collectCheckedRevealSignal(candidate, property, value);
}

function applyExpandedOpacityResidualRescue(input, candidates, records) {
    if (!input?.checked || !candidates?.size || !records) return 0;

    for (const candidate of candidates.values()) {
        const target = candidate?.target;
        if (!target?.isConnected || !candidate.expands || candidate.explicitOpacity) continue;
        if (records.some(record => record.element === target
            && record.property === 'opacity'
            && record.rescueKind === 'expanded-opacity')) continue;

        let computed = null;
        try {
            computed = typeof getComputedStyle === 'function' ? getComputedStyle(target) : null;
        } catch {
            computed = null;
        }
        const opacity = Number.parseFloat(computed?.opacity || '1');
        const display = String(computed?.display || '').toLowerCase();
        const visibility = String(computed?.visibility || '').toLowerCase();
        if (!Number.isFinite(opacity) || opacity > 0.05
            || display === 'none' || visibility === 'hidden' || visibility === 'collapse') continue;

        let rectHeight = 0;
        try {
            rectHeight = Number(target.getBoundingClientRect?.().height || 0);
        } catch {
            rectHeight = 0;
        }
        const naturalHeight = Math.max(rectHeight, Number(target.scrollHeight || 0));
        const hasContent = String(target.textContent || '').replace(/\s+/g, '').length >= 2
            || Number(target.childElementCount || 0) > 0;
        if (!hasContent || naturalHeight <= 4) continue;

        records.push({
            element: target,
            property: 'opacity',
            value: target.style.getPropertyValue('opacity'),
            priority: target.style.getPropertyPriority('opacity'),
            rescueKind: 'expanded-opacity',
        });
        target.style.setProperty('opacity', '1', 'important');
    }

    const rescuedCount = new Set(records
        .filter(record => record.rescueKind === 'expanded-opacity')
        .map(record => record.element)).size;
    if (rescuedCount) input.setAttribute(EXPANDED_OPACITY_RESCUE_ATTR, String(rescuedCount));
    return rescuedCount;
}

function scheduleExpandedOpacityResidualRescue(input, candidates, records) {
    if (!input || !candidates?.size || !records) return;
    for (const delay of [0, 80, 260, 650]) {
        setTimeout(() => {
            if (!input.isConnected || !input.checked
                || interactionInlineOverrideStates.get(input) !== records) return;
            applyExpandedOpacityResidualRescue(input, candidates, records);
        }, delay);
    }
}

function buildCheckedSelectorNeedles(input) {
    const needles = [];
    if (input?.id) {
        const escapedId = escapeRegExp(input.id);
        needles.push({
            source: 'id',
            pattern: new RegExp(`#${escapedId}:checked\\s*([+~])\\s*([^,{]+)`, 'i'),
        });
    }

    for (const className of getClassTokens(input).slice(0, 8)) {
        if (!className || className.length > 120) continue;
        const escapedClass = escapeRegExp(className);
        needles.push({
            source: 'class-local',
            pattern: new RegExp(`\\.${escapedClass}:checked\\s*([+~])\\s*([^,{]+)`, 'i'),
        });
    }
    return needles;
}

function parseCheckedRulesFromText(toto, input) {
    if (!toto?.querySelectorAll || !input) return [];
    const selectorNeedles = buildCheckedSelectorNeedles(input);
    if (!selectorNeedles.length) return [];

    const results = [];
    const seen = new Set();
    for (const styleEl of toto.querySelectorAll('style')) {
        const css = String(styleEl.textContent || '');
        const blockRe = /([^{}]+)\{([^{}]*)\}/g;
        let match;
        while ((match = blockRe.exec(css))) {
            const selectors = String(match[1] || '').split(',').map(v => v.trim()).filter(Boolean);
            const declarations = String(match[2] || '');
            for (const selector of selectors) {
                for (const needle of selectorNeedles) {
                    const selectorMatch = selector.match(needle.pattern);
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
                    if (!styleMap.length) continue;
                    const key = `${needle.source}|${relation}|${targetSelector}|${JSON.stringify(styleMap)}`;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    results.push({ source: needle.source, relation, targetSelector, styleMap });
                }
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

function getLocalContainerTargetsForCheckedRule(input, targetSelector) {
    if (!input || !targetSelector) return [];
    const scope = input.closest?.('label') || input.parentElement;
    if (!scope?.querySelectorAll) return [];
    try {
        const targets = [...scope.querySelectorAll(targetSelector)].filter(target => target !== input);
        // class 型 :checked 规则若结构写错，只允许在当前 label/局部容器内补救，
        // 绝不把同类目标扩散到其他事件节点。
        if (!targets.length || targets.length > 8) return [];
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
    const routeKinds = new Set();
    const revealCandidates = new Map();
    for (const rule of parseCheckedRulesFromText(toto, input)) {
        let targets = getSiblingTargetsForCheckedRule(input, rule.relation, rule.targetSelector);
        if (!targets.length) {
            if (rule.source === 'class-local') {
                // 典型错误：.trigger:checked ~ .panel，但 .panel 实际嵌套在同一 label 的后代容器中。
                // 按当前 label 局部查找并落实规则状态，不影响其他同 class 节点。
                targets = getLocalContainerTargetsForCheckedRule(input, rule.targetSelector);
            } else {
                // 带唯一 ID 的规则允许在当前兔子镜根内寻找受控目标。
                targets = getCrossContainerTargetsForCheckedRule(toto, rule.targetSelector);
            }
        }
        for (const target of targets) {
            routeKinds.add(rule.source);
            rememberCheckedRevealCandidate(revealCandidates, target, rule.styleMap);
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
    if (records.length) {
        interactionInlineOverrideStates.set(input, records);
        input.setAttribute(CHECKED_TEXT_RULE_RESCUE_ATTR, [...routeKinds].join(','));
        applyExpandedOpacityResidualRescue(input, revealCandidates, records);
        scheduleExpandedOpacityResidualRescue(input, revealCandidates, records);
    }
    return records.length;
}

function restoreInteractionInlineOverrides(input) {
    const records = interactionInlineOverrideStates.get(input);
    if (!records) {
        input?.removeAttribute?.(EXPANDED_OPACITY_RESCUE_ATTR);
        return;
    }
    for (const record of records) {
        const { element, property, value, priority } = record;
        if (!element?.style) continue;
        if (value) element.style.setProperty(property, value, priority || '');
        else element.style.removeProperty(property);
    }
    interactionInlineOverrideStates.delete(input);
    input?.removeAttribute?.(EXPANDED_OPACITY_RESCUE_ATTR);
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
    const revealCandidates = new Map();

    const applyRule = (selectorText, style) => {
        if (!selectorText || !style || !selectorText.includes(idNeedle)) return;
        let targets = [];
        try {
            targets = [...toto.querySelectorAll(selectorText)];
        } catch {
            return;
        }
        const styleMap = [];
        for (const property of [...style]) {
            const value = style.getPropertyValue(property);
            if (value) styleMap.push([property, value]);
        }
        for (const target of targets) {
            rememberCheckedRevealCandidate(revealCandidates, target, styleMap);
            for (const [property, value] of styleMap) {
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

    if (records.length) {
        interactionInlineOverrideStates.set(input, records);
        applyExpandedOpacityResidualRescue(input, revealCandidates, records);
        scheduleExpandedOpacityResidualRescue(input, revealCandidates, records);
    }
}




const TARGET_ACTIVE_ATTR = 'data-rm-target-active';
const TARGET_RESCUE_STYLE_ATTR = 'data-rabbit-mirror-target-rescue';
const interactionCapabilityStates = new WeakMap();

const INLINE_PSEUDO_RESCUE_ATTR = 'data-rabbit-mirror-inline-pseudo-rescue';
const HINTED_PSEUDO_RESCUE_ATTR = 'data-rabbit-mirror-hinted-pseudo-rescue';
const CHANGE_PSEUDO_RESCUE_ATTR = 'data-rabbit-mirror-change-pseudo-rescue';
const DIRECT_ID_CLICK_RESCUE_ATTR = 'data-rabbit-mirror-direct-id-click-rescue';
const DIRECT_ID_CLASS_STATE_RESCUE_ATTR = 'data-rabbit-mirror-direct-id-class-state-rescue';
const MARKDOWN_CSS_COMMENT_RESCUE_ATTR = 'data-rabbit-mirror-markdown-css-comment-rescue';
const PSEUDO_ACTIVE_ATTR = 'data-rm-pseudo-active';
const pseudoInteractionStates = new WeakMap();
const directIdClassStateStates = new WeakMap();

// 统一可逆状态底座：第一次接管某个元素时，把原始内联样式写入 data 属性并保存在 WeakMap。
// 即使宿主随后克隆当前 DOM 或急救器再次扫描，也不会把“交互后状态”误记为新的初始状态。
const REVERSIBLE_STYLE_BASELINE_ATTR = 'data-rm-reversible-style-baseline';
const REVERSIBLE_TEXT_BASELINE_ATTR = 'data-rm-reversible-text-baseline';
const reversibleStyleBaselineStates = new WeakMap();
const reversibleTextBaselineStates = new WeakMap();

// 同一个 checkbox/radio 只允许一条“渲染后结构型”急救路线接管，避免多个兜底互相覆盖。
const RENDERED_INPUT_ROUTE_ATTR = 'data-rm-rendered-input-route';
const REVERSIBLE_TARGET_CLOSE_ATTR = 'data-rm-click-to-restore';
const interactionLabelFallbackRoots = new WeakSet();

function getRenderedInputRoute(input) {
    return String(input?.getAttribute?.(RENDERED_INPUT_ROUTE_ATTR) || '');
}

function claimRenderedInputRoute(input, routeName) {
    if (!input || !routeName) return false;
    const existing = getRenderedInputRoute(input);
    if (existing && existing !== routeName) return false;
    if (!existing) input.setAttribute(RENDERED_INPUT_ROUTE_ATTR, routeName);
    return true;
}

function dispatchRescuedInputState(input) {
    if (!input?.dispatchEvent) return;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

function installReversibleTargetClose(target, input, root) {
    if (!target?.addEventListener || !input || !root?.contains?.(target)
        || target.hasAttribute(REVERSIBLE_TARGET_CLOSE_ATTR)) return;

    target.addEventListener('click', event => {
        if (!input.checked) return;
        const nestedInteractive = event.target?.closest?.(EXISTING_INTERACTIVE_SELECTOR);
        if (nestedInteractive && nestedInteractive !== target && target.contains?.(nestedInteractive)) return;
        event.preventDefault();
        input.checked = false;
        restoreInteractionInlineOverrides(input);
        dispatchRescuedInputState(input);
    }, false);
    target.setAttribute(REVERSIBLE_TARGET_CLOSE_ATTR, 'true');
}

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

    const rememberedFront = candidates.filter(element => element.getAttribute?.(RENDERED_STATE_LAYER_ROLE_ATTR) === 'front');
    const rememberedReveal = candidates.filter(element => element.getAttribute?.(RENDERED_STATE_LAYER_ROLE_ATTR) === 'reveal');
    const hiddenCandidates = candidates.filter(isExplicitlyHiddenStateLayer);
    const visibleCandidates = candidates.filter(element => !isExplicitlyHiddenStateLayer(element));
    if ((!hiddenCandidates.length || !visibleCandidates.length) && (!rememberedFront.length || !rememberedReveal.length)) return null;

    // DOM 被宿主克隆时，优先沿用上次写入的 front/reveal 角色，避免把交互后状态反向识别。
    const hiddenLayers = rememberedReveal.length ? rememberedReveal : hiddenCandidates.filter(hidden => (
        visibleCandidates.some(visible => getStateLayerGeometryScore(visible, hidden) >= 3)
    ));
    const visibleLayers = rememberedFront.length ? rememberedFront : visibleCandidates.filter(visible => (
        hiddenLayers.some(hidden => getStateLayerGeometryScore(visible, hidden) >= 3)
    ));
    if (!hiddenLayers.length || !visibleLayers.length) return null;

    const visibleStates = visibleLayers.map(target => ({
        target,
        originalStyles: capturePseudoStyleState(target, ['opacity', 'pointer-events']),
    }));
    const hiddenStates = hiddenLayers.map(target => {
        const originalStyles = capturePseudoStyleState(target, ['display', 'visibility', 'opacity', 'pointer-events', 'transform']);
        return {
            target,
            originalStyles,
            activeTransform: neutralizeStateLayerTransform(getCapturedStyleValue(originalStyles, 'transform')),
            wasDisplayNone: getCapturedStyleValue(originalStyles, 'display').toLowerCase() === 'none',
            wasVisibilityHidden: getCapturedStyleValue(originalStyles, 'visibility').toLowerCase() === 'hidden',
        };
    });

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
        state = { entries: new Map(), listenerInstalled: false };
        renderedStateLayerRescueStates.set(root, state);
    }

    for (const label of root.querySelectorAll('label')) {
        const input = label.querySelector(':scope > input[type="checkbox"], :scope > input[type="radio"]');
        if (!input || state.entries.has(input)) continue;
        const existingRoute = getRenderedInputRoute(input);
        if (existingRoute && existingRoute !== 'state-layer') continue;
        const entry = buildRenderedStateLayerEntry(label, input);
        if (!entry || !claimRenderedInputRoute(input, 'state-layer')) continue;
        state.entries.set(input, entry);
        input.setAttribute(RENDERED_STATE_LAYER_RESCUE_ATTR, 'true');
    }

    if (!state.entries.size) return;

    if (!state.listenerInstalled) {
        const refresh = event => {
            const input = event.target;
            if (!input || !state.entries.has(input)) return;
            // radio 切换会同步取消同组旧项，因此统一刷新当前兔子镜内全部结构状态。
            applyRenderedStateLayerEntries(root);
        };
        root.addEventListener('input', refresh, false);
        root.addEventListener('change', refresh, false);
        state.listenerInstalled = true;
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
    if (!element) return false;
    const previouslyManaged = element.hasAttribute?.(RENDERED_ADJACENT_HIDDEN_ITEM_ATTR);
    if (!previouslyManaged && !isExplicitlyHiddenStateLayer(element)) return false;
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

    const targetStates = targets.map(target => {
        const originalStyles = capturePseudoStyleState(target, [
            'display', 'visibility', 'opacity', 'pointer-events', 'transform', 'max-height',
        ]);
        const originalTransform = getCapturedStyleValue(originalStyles, 'transform');
        return {
            target,
            originalStyles,
            activeTransform: neutralizeStateLayerTransform(originalTransform),
            wasDisplayNone: getCapturedStyleValue(originalStyles, 'display').toLowerCase() === 'none',
            wasVisibilityHidden: getCapturedStyleValue(originalStyles, 'visibility').toLowerCase() === 'hidden',
            hadCollapsedMaxHeight: /^(?:0|0px|0em|0rem|0%)$/i.test(getCapturedStyleValue(originalStyles, 'max-height').replace(/\s+/g, '')),
        };
    });

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
        state = { entries: new Map(), listenerInstalled: false };
        renderedAdjacentHiddenGroupRescueStates.set(root, state);
    }

    for (const label of root.querySelectorAll('label')) {
        const input = label.querySelector('input[type="checkbox"], input[type="radio"]');
        if (!input || state.entries.has(input)) continue;
        const existingRoute = getRenderedInputRoute(input);
        if (existingRoute && existingRoute !== 'adjacent-hidden') continue;
        const entry = buildRenderedAdjacentHiddenGroupEntry(label, input);
        if (!entry || !claimRenderedInputRoute(input, 'adjacent-hidden')) continue;
        state.entries.set(input, entry);
        for (const targetState of entry.targetStates || []) installReversibleTargetClose(targetState.target, input, root);
    }
    if (!state.entries.size) return;

    if (!state.listenerInstalled) {
        const refresh = event => {
            if (!state.entries.has(event.target)) return;
            applyRenderedAdjacentHiddenGroupEntries(root);
        };
        root.addEventListener('input', refresh, false);
        root.addEventListener('change', refresh, false);
        state.listenerInstalled = true;
        root.dataset.rabbitMirrorAdjacentHiddenGroupFallback = 'true';
    }
    applyRenderedAdjacentHiddenGroupEntries(root);
}


// 渲染后“label 内单块隐藏内容”急救：用于 checkbox/radio 与隐藏内容同处一个 label 的结构。
// 不依赖宿主可能已经删除的 onclick/onchange，只根据当前安全 DOM 建立状态切换。
const RENDERED_LABEL_INTERNAL_HIDDEN_RESCUE_ATTR = 'data-rabbit-mirror-label-internal-hidden-rescue';
const RENDERED_LABEL_INTERNAL_HIDDEN_ITEM_ATTR = 'data-rm-label-internal-hidden-item';
const renderedLabelInternalHiddenRescueStates = new WeakMap();

function isLabelInternalHiddenCandidate(element, input, label) {
    if (!element || element === input || element === label || !label?.contains?.(element)) return false;
    const tagName = String(element.tagName || '').toLowerCase();
    // 隐藏 input 是交互载体，不得误判为待显示内容。
    if (/^(?:input|select|textarea|option|button|label|style|script|template|svg|path)$/.test(tagName)) return false;
    if (element.hasAttribute?.(RENDERED_STATE_LAYER_ROLE_ATTR)
        || element.hasAttribute?.(RENDERED_ADJACENT_HIDDEN_ITEM_ATTR)
        || element.hasAttribute?.(RENDERED_LIST_DETAIL_PANEL_ATTR)) return false;
    const previouslyManaged = element.hasAttribute?.(RENDERED_LABEL_INTERNAL_HIDDEN_ITEM_ATTR);
    if (!previouslyManaged && !isExplicitlyHiddenStateLayer(element)) return false;

    const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length < 4 || text.length > 1800) return false;

    const classText = `${element.id || ''} ${getClassTokens(element).join(' ')}`;
    const semanticHint = ADJACENT_HIDDEN_CLASS_HINT_RE.test(classText);
    const inlineMaxHeight = getInlineStyleValue(element, 'max-height').replace(/\s+/g, '').toLowerCase();
    const inlineHeight = getInlineStyleValue(element, 'height').replace(/\s+/g, '').toLowerCase();
    const collapsedBox = /^(?:0|0px|0em|0rem|0%)$/.test(inlineMaxHeight)
        || /^(?:0|0px|0em|0rem|0%)$/.test(inlineHeight);

    // 严格补充“label 内弹层”结构：input 后隔着一段可见触发文字，再跟一块 display:none/opacity:0 内容。
    // 这覆盖模型常写错的 this.nextElementSibling（实际目标是下下个兄弟节点），但不会扫描 label 外部。
    const children = [...(label.children || [])];
    const inputIndex = children.indexOf(input);
    const elementIndex = children.indexOf(element);
    const directAfterInput = element.parentElement === label && inputIndex >= 0 && elementIndex > inputIndex;
    const leadingText = directAfterInput
        ? children.slice(inputIndex + 1, elementIndex)
            .filter(node => !isExplicitlyHiddenStateLayer(node))
            .map(node => String(node.textContent || '').replace(/\s+/g, ' ').trim())
            .join(' ')
        : '';
    const triggerHint = ADJACENT_HIDDEN_TRIGGER_HINT_RE.test(leadingText);
    const displayNone = getInlineStyleValue(element, 'display').toLowerCase() === 'none';
    const position = getInlineStyleValue(element, 'position').toLowerCase();
    const positionedPopup = position === 'absolute' || position === 'fixed';

    return previouslyManaged || semanticHint || collapsedBox || (directAfterInput && triggerHint && (displayNone || positionedPopup));
}

function collectLabelInternalHiddenTargets(label, input) {
    if (!label?.querySelectorAll) return [];
    const raw = [...label.querySelectorAll('*')]
        .filter(element => isLabelInternalHiddenCandidate(element, input, label));
    if (!raw.length) return [];

    // 如果父级隐藏容器已被选中，不再同时选择其内部子节点，避免重复写样式。
    const topLevel = raw.filter(element => !raw.some(other => other !== element && other.contains?.(element)));
    return topLevel.slice(0, 4);
}

function getComputedOverflowValue(element) {
    try {
        const style = typeof getComputedStyle === 'function' ? getComputedStyle(element) : null;
        return `${style?.overflow || ''} ${style?.overflowX || ''} ${style?.overflowY || ''}`.toLowerCase();
    } catch {
        return '';
    }
}

function getRenderedElementHeight(element) {
    try {
        return Number(element?.getBoundingClientRect?.().height || 0);
    } catch {
        return 0;
    }
}

function captureLabelInternalAncestorStates(target, label) {
    const states = [];
    let current = target?.parentElement || null;
    for (let depth = 0; current && depth < 5; depth += 1, current = current.parentElement) {
        if (!label.contains(current) && current !== label) break;
        const overflow = getComputedOverflowValue(current);
        const inlineHeight = getInlineStyleValue(current, 'height').replace(/\s+/g, '').toLowerCase();
        const inlineMaxHeight = getInlineStyleValue(current, 'max-height').replace(/\s+/g, '').toLowerCase();
        const collapsed = /^(?:0|0px|0em|0rem|0%)$/.test(inlineHeight)
            || /^(?:0|0px|0em|0rem|0%)$/.test(inlineMaxHeight)
            || getRenderedElementHeight(current) <= 1;
        const clips = /(?:hidden|clip)/.test(overflow);
        if (collapsed || clips || current === label) {
            states.push({
                target: current,
                originalStyles: capturePseudoStyleState(current, [
                    'display', 'height', 'min-height', 'max-height', 'overflow', 'overflow-x', 'overflow-y',
                ]),
                collapsed,
                clips,
            });
        }
        if (current === label) break;
    }
    return states;
}

function buildRenderedLabelInternalHiddenEntry(label, input, root) {
    if (!label || !input || input.closest?.('label') !== label) return null;
    const targets = collectLabelInternalHiddenTargets(label, input);
    if (!targets.length) return null;

    const targetStates = targets.map(target => {
        const originalStyles = capturePseudoStyleState(target, [
            'display', 'visibility', 'opacity', 'pointer-events', 'transform',
            'height', 'min-height', 'max-height', 'overflow', 'overflow-x', 'overflow-y',
            'position', 'inset', 'top', 'right', 'bottom', 'left', 'width', 'max-width',
            'box-sizing', 'margin', 'margin-top',
        ]);
        const originalTransform = getCapturedStyleValue(originalStyles, 'transform');
        const originalPosition = getCapturedStyleValue(originalStyles, 'position').toLowerCase();
        return {
            target,
            originalStyles,
            activeTransform: neutralizeStateLayerTransform(originalTransform),
            wasDisplayNone: getCapturedStyleValue(originalStyles, 'display').toLowerCase() === 'none',
            wasVisibilityHidden: getCapturedStyleValue(originalStyles, 'visibility').toLowerCase() === 'hidden',
            hadCollapsedHeight: /^(?:0|0px|0em|0rem|0%)$/i.test(getCapturedStyleValue(originalStyles, 'height').replace(/\s+/g, '')),
            hadCollapsedMaxHeight: /^(?:0|0px|0em|0rem|0%)$/i.test(getCapturedStyleValue(originalStyles, 'max-height').replace(/\s+/g, '')),
            isPositionedPopup: ['absolute', 'fixed'].includes(originalPosition),
            ancestorStates: captureLabelInternalAncestorStates(target, label),
        };
    });

    targets.forEach((target, index) => target.setAttribute(RENDERED_LABEL_INTERNAL_HIDDEN_ITEM_ATTR, String(index)));
    input.setAttribute(RENDERED_LABEL_INTERNAL_HIDDEN_RESCUE_ATTR, 'true');
    return { label, input, targetStates };
}

function restoreLabelInternalAncestorStates(entry) {
    const restored = new Set();
    for (const state of entry?.targetStates || []) {
        for (const ancestor of state.ancestorStates || []) {
            if (!ancestor?.target || restored.has(ancestor.target)) continue;
            restorePseudoStyleState(ancestor.target, ancestor.originalStyles);
            restored.add(ancestor.target);
        }
    }
}

function applyRenderedLabelInternalHiddenEntry(entry) {
    if (!entry?.input) return;
    const active = !!entry.input.checked;
    restoreLabelInternalAncestorStates(entry);

    for (const state of entry.targetStates || []) {
        restorePseudoStyleState(state.target, state.originalStyles);
        if (!active) continue;

        const naturalHeight = Math.max(80, Number(state.target?.scrollHeight || 0) + 24);
        const assignments = [
            { property: 'opacity', value: '1' },
            { property: 'visibility', value: 'visible' },
            { property: 'pointer-events', value: 'auto' },
            { property: 'overflow', value: 'visible' },
        ];
        if (state.wasDisplayNone) assignments.push({ property: 'display', value: 'block' });
        if (state.activeTransform) assignments.push({ property: 'transform', value: state.activeTransform });
        if (state.isPositionedPopup) {
            // 绝对定位弹层经常被外层 overflow:hidden 裁掉，也会盖住原触发区，导致无法再次关闭。
            // 急救时暂时改为同一 label 内的流式展开；取消勾选后由统一基线精确恢复。
            assignments.push(
                { property: 'position', value: 'relative' },
                { property: 'inset', value: 'auto' },
                { property: 'top', value: 'auto' },
                { property: 'right', value: 'auto' },
                { property: 'bottom', value: 'auto' },
                { property: 'left', value: 'auto' },
                { property: 'width', value: '100%' },
                { property: 'max-width', value: '100%' },
                { property: 'box-sizing', value: 'border-box' },
                { property: 'margin', value: '10px 0 0 0' },
            );
        }
        if (state.hadCollapsedHeight || getRenderedElementHeight(state.target) <= 1) {
            assignments.push({ property: 'height', value: 'auto' });
            assignments.push({ property: 'min-height', value: `${naturalHeight}px` });
        }
        if (state.hadCollapsedMaxHeight || getRenderedElementHeight(state.target) <= 1) {
            assignments.push({ property: 'max-height', value: `${Math.max(320, naturalHeight * 2)}px` });
        }
        applyPseudoStyleAssignments(state.target, assignments);

        for (const ancestor of state.ancestorStates || []) {
            const ancestorAssignments = [];
            if (ancestor.clips) {
                ancestorAssignments.push({ property: 'overflow', value: 'visible' });
                ancestorAssignments.push({ property: 'overflow-x', value: 'visible' });
                ancestorAssignments.push({ property: 'overflow-y', value: 'visible' });
            }
            if (ancestor.collapsed || ancestor.target === entry.label) {
                const contentHeight = Math.max(
                    Number(ancestor.target?.scrollHeight || 0),
                    naturalHeight + 48,
                );
                ancestorAssignments.push({ property: 'height', value: 'auto' });
                ancestorAssignments.push({ property: 'max-height', value: `${Math.max(480, contentHeight + 80)}px` });
                ancestorAssignments.push({ property: 'min-height', value: `${Math.min(1200, contentHeight)}px` });
            }
            applyPseudoStyleAssignments(ancestor.target, ancestorAssignments);
        }
    }

    entry.label?.setAttribute?.('aria-pressed', active ? 'true' : 'false');
    entry.input?.setAttribute?.('aria-pressed', active ? 'true' : 'false');
}

function applyRenderedLabelInternalHiddenEntries(root) {
    const state = renderedLabelInternalHiddenRescueStates.get(root);
    if (!state?.entries?.size) return;
    for (const entry of state.entries.values()) applyRenderedLabelInternalHiddenEntry(entry);
}

function installRenderedLabelInternalHiddenRescue(root) {
    if (!root?.querySelectorAll) return;
    let state = renderedLabelInternalHiddenRescueStates.get(root);
    if (!state) {
        state = { entries: new Map(), listenerInstalled: false };
        renderedLabelInternalHiddenRescueStates.set(root, state);
    }

    for (const label of root.querySelectorAll('label')) {
        const input = label.querySelector('input[type="checkbox"], input[type="radio"]');
        if (!input || state.entries.has(input)) continue;
        const existingRoute = getRenderedInputRoute(input);
        if (existingRoute && existingRoute !== 'label-internal') continue;
        const entry = buildRenderedLabelInternalHiddenEntry(label, input, root);
        if (!entry || !claimRenderedInputRoute(input, 'label-internal')) continue;
        state.entries.set(input, entry);
    }
    if (!state.entries.size) return;

    if (!state.listenerInstalled) {
        const refresh = event => {
            if (!state.entries.has(event.target)) return;
            applyRenderedLabelInternalHiddenEntries(root);
            // 某些主题会在 change 后一帧重新写布局；短延迟复核能避免刚显示又被压回 0 高度。
            for (const delay of [0, 80, 260]) {
                setTimeout(() => {
                    if (root.isConnected) applyRenderedLabelInternalHiddenEntries(root);
                }, delay);
            }
        };
        root.addEventListener('input', refresh, false);
        root.addEventListener('change', refresh, false);
        state.listenerInstalled = true;
        root.dataset.rabbitMirrorLabelInternalHiddenFallback = 'true';
    }
    applyRenderedLabelInternalHiddenEntries(root);
}



// 渲染后“label 后置结果层”急救：用于 checkbox/radio 位于 label 内，结果层紧跟在 label 后方的结构。
// 不依赖已被宿主删除的 onchange；优先保证隐藏结果能够显示，并可选增强同画布内的零尺寸视觉主体。
const RENDERED_LABEL_ADJACENT_RESULT_RESCUE_ATTR = 'data-rabbit-mirror-label-adjacent-result-rescue';
const RENDERED_LABEL_ADJACENT_RESULT_ITEM_ATTR = 'data-rm-label-adjacent-result-item';
const RENDERED_LABEL_ADJACENT_VISUAL_ITEM_ATTR = 'data-rm-label-adjacent-visual-item';
const renderedLabelAdjacentResultRescueStates = new WeakMap();
const LABEL_ADJACENT_RESULT_HINT_RE = /(?:detail|result|reaction|response|info|content|reveal|hidden|message|panel|output|详情|结果|反应|状态|信息|揭示)/i;
const LABEL_ADJACENT_VISUAL_HINT_RE = /(?:zone|radar|meter|gauge|ring|circle|field|area|territory|dominance|progress|pulse|wave|领域|雷达|区域|环|范围|进度)/i;

function isCollapsedDimensionValue(value) {
    return /^(?:0|0px|0em|0rem|0%)$/i.test(String(value || '').replace(/\s+/g, ''));
}

function isLabelAdjacentResultCandidate(element) {
    if (!element || /^(?:input|label|button|style|script|template)$/i.test(element.tagName || '')) return false;
    const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length < 8 || text.length > 2400) return false;

    const previouslyManaged = element.hasAttribute?.(RENDERED_LABEL_ADJACENT_RESULT_ITEM_ATTR);
    const hidden = isExplicitlyHiddenStateLayer(element)
        || isCollapsedDimensionValue(getInlineStyleValue(element, 'height'))
        || isCollapsedDimensionValue(getInlineStyleValue(element, 'max-height'));
    if (!previouslyManaged && !hidden) return false;

    const semantic = `${element.id || ''} ${getClassTokens(element).join(' ')}`;
    const hasStructure = !!element.querySelector?.('p, div, span, section, article, ul, ol, dl, table, [style*="background"], [style*="border"]');
    return LABEL_ADJACENT_RESULT_HINT_RE.test(semantic) || hasStructure || text.length >= 40;
}

function findLabelAdjacentResultTarget(label) {
    let node = label?.nextElementSibling || null;
    for (let step = 0; node && step < 3; step += 1, node = node.nextElementSibling) {
        if (/^(?:style|script)$/i.test(node.tagName || '')) continue;
        if (isLabelAdjacentResultCandidate(node)) return node;
        // 只允许跨过很短的空白装饰层；遇到新的交互结构即停止。
        if (node.querySelector?.('input, label, button, details, summary')) break;
        const text = String(node.textContent || '').replace(/\s+/g, ' ').trim();
        if (text.length > 24) break;
    }
    return null;
}

function collectLabelAdjacentVisualTargets(label) {
    const parent = label?.parentElement;
    if (!parent?.children) return [];
    const siblings = [...parent.children];
    const labelIndex = siblings.indexOf(label);
    if (labelIndex <= 0) return [];

    const searchRoots = siblings.slice(Math.max(0, labelIndex - 5), labelIndex).reverse();
    for (const searchRoot of searchRoots) {
        const candidates = [searchRoot, ...(searchRoot.querySelectorAll?.('[class], [id]') || [])]
            .filter(element => {
                const semantic = `${element.id || ''} ${getClassTokens(element).join(' ')}`;
                if (!LABEL_ADJACENT_VISUAL_HINT_RE.test(semantic)) return false;
                if (element.hasAttribute?.(RENDERED_LABEL_ADJACENT_VISUAL_ITEM_ATTR)) return true;
                const width = getInlineStyleValue(element, 'width');
                const height = getInlineStyleValue(element, 'height');
                if (!isCollapsedDimensionValue(width) || !isCollapsedDimensionValue(height)) return false;
                const radius = getInlineStyleValue(element, 'border-radius');
                return /(?:50%|999px|9999px)/i.test(radius) || /circle|ring|zone|radar/i.test(semantic);
            });
        if (candidates.length) return candidates.slice(0, 2);
    }
    return [];
}

function buildRenderedLabelAdjacentResultEntry(label, input) {
    if (!label || !input || input.closest?.('label') !== label) return null;
    const target = findLabelAdjacentResultTarget(label);
    if (!target) return null;

    const originalStyles = capturePseudoStyleState(target, [
        'display', 'visibility', 'opacity', 'pointer-events', 'transform',
        'height', 'min-height', 'max-height', 'overflow', 'overflow-x', 'overflow-y',
    ]);
    const targetState = {
        target,
        originalStyles,
        activeTransform: neutralizeStateLayerTransform(getCapturedStyleValue(originalStyles, 'transform')),
        wasDisplayNone: getCapturedStyleValue(originalStyles, 'display').toLowerCase() === 'none',
        hadCollapsedHeight: isCollapsedDimensionValue(getCapturedStyleValue(originalStyles, 'height')),
        hadCollapsedMaxHeight: isCollapsedDimensionValue(getCapturedStyleValue(originalStyles, 'max-height')),
    };

    const visualStates = collectLabelAdjacentVisualTargets(label).map(visual => ({
        target: visual,
        originalStyles: capturePseudoStyleState(visual, ['width', 'height', 'opacity', 'transform']),
    }));

    target.setAttribute(RENDERED_LABEL_ADJACENT_RESULT_ITEM_ATTR, 'true');
    visualStates.forEach((state, index) => state.target.setAttribute(RENDERED_LABEL_ADJACENT_VISUAL_ITEM_ATTR, String(index)));
    input.setAttribute(RENDERED_LABEL_ADJACENT_RESULT_RESCUE_ATTR, 'true');
    return { label, input, targetState, visualStates };
}

function applyRenderedLabelAdjacentResultEntry(entry) {
    if (!entry?.input || !entry?.targetState?.target) return;
    const active = !!entry.input.checked;
    const state = entry.targetState;
    restorePseudoStyleState(state.target, state.originalStyles);
    for (const visualState of entry.visualStates || []) restorePseudoStyleState(visualState.target, visualState.originalStyles);

    if (active) {
        const naturalHeight = Math.max(72, Number(state.target.scrollHeight || 0) + 20);
        const assignments = [
            { property: 'opacity', value: '1' },
            { property: 'visibility', value: 'visible' },
            { property: 'pointer-events', value: 'auto' },
            { property: 'overflow', value: 'visible' },
        ];
        if (state.wasDisplayNone) assignments.push({ property: 'display', value: 'block' });
        if (state.activeTransform) assignments.push({ property: 'transform', value: state.activeTransform });
        if (state.hadCollapsedHeight) assignments.push({ property: 'height', value: 'auto' });
        if (state.hadCollapsedMaxHeight || getRenderedElementHeight(state.target) <= 1) {
            assignments.push({ property: 'max-height', value: `${Math.max(360, naturalHeight * 2)}px` });
            assignments.push({ property: 'min-height', value: `${Math.min(1200, naturalHeight)}px` });
        }
        applyPseudoStyleAssignments(state.target, assignments);

        for (const visualState of entry.visualStates || []) {
            let size = 130;
            try {
                const rect = visualState.target.parentElement?.getBoundingClientRect?.();
                const candidate = Math.min(Number(rect?.width || 0), Number(rect?.height || 0)) * 0.72;
                if (Number.isFinite(candidate) && candidate >= 56) size = Math.max(72, Math.min(160, Math.round(candidate)));
            } catch {
                // Fallback size remains 130px.
            }
            applyPseudoStyleAssignments(visualState.target, [
                { property: 'width', value: `${size}px` },
                { property: 'height', value: `${size}px` },
                { property: 'opacity', value: '1' },
            ]);
        }
    }

    entry.label?.setAttribute?.('aria-pressed', active ? 'true' : 'false');
    entry.input?.setAttribute?.('aria-pressed', active ? 'true' : 'false');
}

function applyRenderedLabelAdjacentResultEntries(root) {
    const state = renderedLabelAdjacentResultRescueStates.get(root);
    if (!state?.entries?.size) return;
    for (const entry of state.entries.values()) applyRenderedLabelAdjacentResultEntry(entry);
}

function installRenderedLabelAdjacentResultRescue(root) {
    if (!root?.querySelectorAll) return;
    let state = renderedLabelAdjacentResultRescueStates.get(root);
    if (!state) {
        state = { entries: new Map(), listenerInstalled: false };
        renderedLabelAdjacentResultRescueStates.set(root, state);
    }

    for (const label of root.querySelectorAll('label')) {
        const input = label.querySelector('input[type="checkbox"], input[type="radio"]');
        if (!input || state.entries.has(input)) continue;
        const existingRoute = getRenderedInputRoute(input);
        if (existingRoute && existingRoute !== 'label-adjacent') continue;
        const entry = buildRenderedLabelAdjacentResultEntry(label, input);
        if (!entry || !claimRenderedInputRoute(input, 'label-adjacent')) continue;
        state.entries.set(input, entry);
        installReversibleTargetClose(entry.targetState?.target, input, root);
    }
    if (!state.entries.size) return;

    if (!state.listenerInstalled) {
        const refresh = event => {
            if (!state.entries.has(event.target)) return;
            applyRenderedLabelAdjacentResultEntries(root);
            for (const delay of [0, 80, 260]) {
                setTimeout(() => {
                    if (root.isConnected) applyRenderedLabelAdjacentResultEntries(root);
                }, delay);
            }
        };
        root.addEventListener('input', refresh, false);
        root.addEventListener('change', refresh, false);
        state.listenerInstalled = true;
        root.dataset.rabbitMirrorLabelAdjacentResultFallback = 'true';
    }
    applyRenderedLabelAdjacentResultEntries(root);
}


// checkbox/radio → ID目标显隐急救：专门解析安全的
// document.getElementById('id').style.xxx = this.checked ? 'A' : 'B'
// 不执行模型 JavaScript；将状态绑定到 input/change，因此 label 兜底手动切换时也能生效。
const RENDERED_CHECKED_ID_TARGET_RESCUE_ATTR = 'data-rabbit-mirror-checked-id-target-rescue';
const RENDERED_CHECKED_ID_TARGET_ITEM_ATTR = 'data-rm-checked-id-target-item';
const renderedCheckedIdTargetRescueStates = new WeakMap();
const CHECKED_ID_TARGET_ALLOWED_PROPERTIES = new Set([
    'display', 'visibility', 'opacity', 'pointer-events', 'transform',
    'height', 'min-height', 'max-height', 'width', 'min-width', 'max-width',
    'overflow', 'overflow-x', 'overflow-y', 'background', 'background-color', 'color',
]);

function collectCheckedIdTargetAssignments(scriptText, root) {
    const source = String(scriptText || '');
    if (!source || !/document\s*\.\s*getElementById\s*\(/i.test(source)
        || !/this\s*\.\s*checked/i.test(source)) return null;

    const matches = [];
    const remember = (match, rawId, rawProperty, checkedValue, uncheckedValue) => {
        const target = resolveScopedPseudoId(root, rawId);
        const property = normalizeStylePropertyName(rawProperty);
        const activeValue = decodeSafeInlineString(checkedValue).trim();
        const inactiveValue = decodeSafeInlineString(uncheckedValue).trim();
        if (!target || !property || !CHECKED_ID_TARGET_ALLOWED_PROPERTIES.has(property)
            || !activeValue || !inactiveValue) return false;
        matches.push({
            start: match.index,
            end: match.index + match[0].length,
            target,
            property,
            checkedValue: activeValue,
            uncheckedValue: inactiveValue,
        });
        return true;
    };

    // document.getElementById('id').style.display = this.checked ? 'block' : 'none';
    const dotRe = /document\s*\.\s*getElementById\s*\(\s*(['"])([a-zA-Z_][\w:.-]*)\1\s*\)\s*\.\s*style\s*\.\s*([a-zA-Z][\w]*)\s*=\s*this\s*\.\s*checked\s*\?\s*(['"])([\s\S]*?)\4\s*:\s*(['"])([\s\S]*?)\6\s*;?/g;
    let match;
    while ((match = dotRe.exec(source))) {
        if (!remember(match, match[2], match[3], match[5], match[7])) return null;
    }

    // document.getElementById('id').style['display'] = this.checked ? 'block' : 'none';
    const bracketRe = /document\s*\.\s*getElementById\s*\(\s*(['"])([a-zA-Z_][\w:.-]*)\1\s*\)\s*\.\s*style\s*\[\s*(['"])([a-zA-Z-]+)\3\s*\]\s*=\s*this\s*\.\s*checked\s*\?\s*(['"])([\s\S]*?)\5\s*:\s*(['"])([\s\S]*?)\7\s*;?/g;
    while ((match = bracketRe.exec(source))) {
        if (!remember(match, match[2], match[4], match[6], match[8])) return null;
    }

    if (!matches.length) return null;
    matches.sort((a, b) => a.start - b.start);

    // 仅接受上述条件赋值与空白、分号、注释。出现其他语句时整段放弃。
    let cursor = 0;
    let remainder = '';
    for (const item of matches) {
        if (item.start < cursor) continue;
        remainder += source.slice(cursor, item.start);
        cursor = item.end;
    }
    remainder += source.slice(cursor);
    remainder = remainder
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\r\n]*/g, '')
        .replace(/[\s;]+/g, '');
    if (remainder !== '') return null;

    return matches.map(item => ({
        target: item.target,
        property: item.property,
        checkedValue: item.checkedValue,
        uncheckedValue: item.uncheckedValue,
    }));
}

function collectRenderedCheckedIdTargetSources(root) {
    const sources = new Map();
    if (!root?.querySelectorAll) return sources;

    for (const input of root.querySelectorAll('input[type="checkbox"][onclick], input[type="radio"][onclick]')) {
        const source = String(input.getAttribute('onclick') || '');
        if (source) sources.set(input, source);
    }

    // 宿主若已删除 onclick，则从同一条消息的原始兔子镜按子节点路径回读。
    const rawMessage = getRawAssistantMessageForRenderedRoot(root);
    const rawRoot = chooseMatchingRawRabbitMirrorRoot(rawMessage, root);
    if (!rawRoot?.querySelectorAll) return sources;

    for (const rawInput of rawRoot.querySelectorAll('input[type="checkbox"][onclick], input[type="radio"][onclick]')) {
        const path = getElementChildIndexPath(rawRoot, rawInput);
        if (!path) continue;
        const renderedInput = resolveElementChildIndexPath(root, path);
        if (!renderedInput?.matches?.('input[type="checkbox"], input[type="radio"]') || sources.has(renderedInput)) continue;
        const source = String(rawInput.getAttribute('onclick') || '');
        if (source) sources.set(renderedInput, source);
    }
    return sources;
}

function buildRenderedCheckedIdTargetEntry(input, assignments) {
    if (!input || !assignments?.length) return null;
    const targetStates = assignments.map(action => {
        const originalStyles = capturePseudoStyleState(action.target, [action.property]);
        action.target.setAttribute(RENDERED_CHECKED_ID_TARGET_ITEM_ATTR, 'true');
        return { ...action, originalStyles };
    });
    input.setAttribute(RENDERED_CHECKED_ID_TARGET_RESCUE_ATTR, 'true');
    return { input, targetStates };
}

function applyRenderedCheckedIdTargetEntry(entry) {
    if (!entry?.input || !entry?.targetStates?.length) return;
    const active = !!entry.input.checked;
    for (const state of entry.targetStates) {
        restorePseudoStyleState(state.target, state.originalStyles);
        const value = active ? state.checkedValue : state.uncheckedValue;
        applyPseudoStyleAssignments(state.target, [{ property: state.property, value }]);
        if (state.property === 'display' || state.property === 'visibility' || state.property === 'opacity') {
            const hidden = (state.property === 'display' && value.toLowerCase() === 'none')
                || (state.property === 'visibility' && value.toLowerCase() === 'hidden')
                || (state.property === 'opacity' && Number.parseFloat(value) <= 0.05);
            state.target.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        }
    }
    entry.input.setAttribute('aria-pressed', active ? 'true' : 'false');
}

function installRenderedCheckedIdTargetRescue(root) {
    if (!root?.querySelectorAll) return;
    let state = renderedCheckedIdTargetRescueStates.get(root);
    if (!state) {
        state = { entries: new Map(), listenerInstalled: false };
        renderedCheckedIdTargetRescueStates.set(root, state);
    }

    for (const [input, source] of collectRenderedCheckedIdTargetSources(root)) {
        if (state.entries.has(input)) continue;
        const existingRoute = getRenderedInputRoute(input);
        if (existingRoute && existingRoute !== 'checked-id-target') continue;
        const assignments = collectCheckedIdTargetAssignments(source, root);
        if (!assignments?.length || !claimRenderedInputRoute(input, 'checked-id-target')) continue;
        const entry = buildRenderedCheckedIdTargetEntry(input, assignments);
        if (!entry) continue;
        state.entries.set(input, entry);
        // 避免浏览器原生 click 与本地 input/change 急救重复执行。
        input.removeAttribute('onclick');
    }
    if (!state.entries.size) return;

    if (!state.listenerInstalled) {
        const refresh = event => {
            const entry = state.entries.get(event.target);
            if (!entry) return;
            applyRenderedCheckedIdTargetEntry(entry);
            for (const delay of [0, 80, 260]) {
                setTimeout(() => {
                    if (root.isConnected && entry.input.isConnected) applyRenderedCheckedIdTargetEntry(entry);
                }, delay);
            }
        };
        root.addEventListener('input', refresh, false);
        root.addEventListener('change', refresh, false);
        state.listenerInstalled = true;
        root.dataset.rabbitMirrorCheckedIdTargetFallback = 'true';
    }

    for (const entry of state.entries.values()) applyRenderedCheckedIdTargetEntry(entry);
}


// 渲染后“按钮 + 后置隐藏内容”急救：用于宿主删除 onclick 后，只剩普通 button 与紧邻隐藏内容的结构。
// 该路线优先于触屏 hover 兜底；点击一次显示，第二次点击精确恢复最初状态。
const RENDERED_BUTTON_ADJACENT_HIDDEN_RESCUE_ATTR = 'data-rabbit-mirror-button-adjacent-hidden-rescue';
const RENDERED_BUTTON_ADJACENT_HIDDEN_ITEM_ATTR = 'data-rm-button-adjacent-hidden-item';
const renderedButtonAdjacentHiddenRescueStates = new WeakMap();
const BUTTON_ADJACENT_HIDDEN_HINT_RE = /(?:hidden|secret|detail|data|log|result|message|content|reveal|decode|机密|隐藏|秘密|详情|日志|结果|信息|内容|解码)/i;

function isRenderedButtonAdjacentHiddenTarget(element, button) {
    if (!element || !button || element === button) return false;
    const tagName = String(element.tagName || '').toLowerCase();
    if (!/^(?:div|section|article|aside|p|ul|ol|dl)$/.test(tagName)) return false;

    const previouslyManaged = element.hasAttribute?.(RENDERED_BUTTON_ADJACENT_HIDDEN_ITEM_ATTR);
    const hidden = isExplicitlyHiddenStateLayer(element)
        || isCollapsedDimensionValue(getInlineStyleValue(element, 'height'))
        || isCollapsedDimensionValue(getInlineStyleValue(element, 'max-height'));
    if (!previouslyManaged && !hidden) return false;

    const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length < 4 || text.length > 3200) return false;
    const semantic = `${element.id || ''} ${getClassTokens(element).join(' ')}`;
    return previouslyManaged || BUTTON_ADJACENT_HIDDEN_HINT_RE.test(semantic) || text.length >= 24;
}

function findRenderedButtonAdjacentHiddenTarget(button) {
    let node = button?.nextElementSibling || null;
    for (let step = 0; node && step < 3; step += 1, node = node.nextElementSibling) {
        if (/^(?:style|script|template)$/i.test(node.tagName || '')) continue;
        if (isRenderedButtonAdjacentHiddenTarget(node, button)) return node;

        // 只允许跨过空白/极短装饰节点；遇到另一处明确交互即停止，避免串到无关区域。
        if (node.querySelector?.('button, input, label, details, summary')) break;
        const text = String(node.textContent || '').replace(/\s+/g, ' ').trim();
        if (text.length > 12) break;
    }
    return null;
}

function hasRenderedButtonAdjacentHiddenCandidates(root) {
    if (!root?.querySelectorAll) return false;
    return [...root.querySelectorAll('button')].some(button => !!findRenderedButtonAdjacentHiddenTarget(button));
}

function buildRenderedButtonAdjacentHiddenEntry(button, target) {
    if (!button || !target) return null;
    const originalStyles = capturePseudoStyleState(target, [
        'display', 'visibility', 'opacity', 'pointer-events', 'transform',
        'height', 'min-height', 'max-height', 'overflow', 'overflow-x', 'overflow-y',
        'position', 'inset', 'top', 'right', 'bottom', 'left', 'width', 'max-width',
        'margin', 'margin-top',
    ]);
    const position = getCapturedStyleValue(originalStyles, 'position').toLowerCase();
    target.setAttribute(RENDERED_BUTTON_ADJACENT_HIDDEN_ITEM_ATTR, 'true');
    button.setAttribute(RENDERED_BUTTON_ADJACENT_HIDDEN_RESCUE_ATTR, 'true');
    return {
        button,
        target,
        active: false,
        originalStyles,
        activeTransform: neutralizeStateLayerTransform(getCapturedStyleValue(originalStyles, 'transform')),
        wasDisplayNone: getCapturedStyleValue(originalStyles, 'display').toLowerCase() === 'none',
        hadCollapsedHeight: isCollapsedDimensionValue(getCapturedStyleValue(originalStyles, 'height')),
        hadCollapsedMaxHeight: isCollapsedDimensionValue(getCapturedStyleValue(originalStyles, 'max-height')),
        isPositionedPopup: position === 'absolute' || position === 'fixed',
    };
}

function applyRenderedButtonAdjacentHiddenEntry(entry, active = entry?.active) {
    if (!entry?.button || !entry?.target) return;
    entry.active = !!active;
    restorePseudoStyleState(entry.target, entry.originalStyles);

    if (entry.active) {
        const naturalHeight = Math.max(64, Number(entry.target.scrollHeight || 0) + 20);
        const assignments = [
            { property: 'opacity', value: '1' },
            { property: 'visibility', value: 'visible' },
            { property: 'pointer-events', value: 'auto' },
        ];
        if (entry.wasDisplayNone) assignments.push({ property: 'display', value: 'block' });
        if (entry.activeTransform) assignments.push({ property: 'transform', value: entry.activeTransform });
        if (entry.hadCollapsedHeight) assignments.push({ property: 'height', value: 'auto' });
        if (entry.hadCollapsedMaxHeight || getRenderedElementHeight(entry.target) <= 1) {
            assignments.push({ property: 'max-height', value: `${Math.max(320, naturalHeight * 2)}px` });
            assignments.push({ property: 'min-height', value: `${Math.min(1200, naturalHeight)}px` });
        }
        if (entry.isPositionedPopup) {
            assignments.push(
                { property: 'position', value: 'relative' },
                { property: 'inset', value: 'auto' },
                { property: 'top', value: 'auto' },
                { property: 'right', value: 'auto' },
                { property: 'bottom', value: 'auto' },
                { property: 'left', value: 'auto' },
                { property: 'width', value: 'auto' },
                { property: 'max-width', value: '100%' },
                { property: 'margin-top', value: '10px' },
            );
        }
        applyPseudoStyleAssignments(entry.target, assignments);
    }

    entry.button.setAttribute('aria-expanded', entry.active ? 'true' : 'false');
    entry.button.setAttribute('aria-pressed', entry.active ? 'true' : 'false');
}

function installRenderedButtonAdjacentHiddenRescue(root) {
    if (!root?.querySelectorAll) return;
    let state = renderedButtonAdjacentHiddenRescueStates.get(root);
    if (!state) {
        state = { entries: new Map() };
        renderedButtonAdjacentHiddenRescueStates.set(root, state);
    }

    for (const button of root.querySelectorAll('button')) {
        if (button.closest?.(`[${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`) || state.entries.has(button)) continue;
        const target = findRenderedButtonAdjacentHiddenTarget(button);
        if (!target) continue;
        const entry = buildRenderedButtonAdjacentHiddenEntry(button, target);
        if (!entry) continue;
        state.entries.set(button, entry);

        button.addEventListener('click', event => {
            event.preventDefault();
            applyRenderedButtonAdjacentHiddenEntry(entry, !entry.active);
            // 某些主题会在点击后一帧重写 display；短延迟复核只重放当前可逆状态。
            for (const delay of [0, 80, 260]) {
                setTimeout(() => {
                    if (root.isConnected && entry.button.isConnected && entry.target.isConnected) {
                        applyRenderedButtonAdjacentHiddenEntry(entry, entry.active);
                    }
                }, delay);
            }
        }, false);
        applyRenderedButtonAdjacentHiddenEntry(entry, false);
    }

    if (state.entries.size) root.dataset.rabbitMirrorButtonAdjacentHiddenFallback = 'true';
}


// 渲染后“可点击容器 + 后置隐藏内容”急救：用于 onclick 被删除后，
// 只剩 cursor:pointer 的普通 div/span 与紧邻 display:none 正文的结构。
// 与“可点击画面 + 弹层”不同，本路线不要求关闭按钮，点击一次显示，第二次恢复。
const RENDERED_CLICKABLE_ADJACENT_HIDDEN_RESCUE_ATTR = 'data-rabbit-mirror-clickable-adjacent-hidden-rescue';
const RENDERED_CLICKABLE_ADJACENT_HIDDEN_ITEM_ATTR = 'data-rm-clickable-adjacent-hidden-item';
const renderedClickableAdjacentHiddenRescueStates = new WeakMap();
const CLICKABLE_ADJACENT_HIDDEN_TRIGGER_HINT_RE = /(?:点击|轻触|触摸|确认|查看|检视|检查|展开|打开|开启|读取|揭示|解锁|封存|归档|提交|播放)|\b(?:click|tap|touch|confirm|view|inspect|check|expand|open|read|reveal|unlock|archive|submit|play)\b/i;
const CLICKABLE_ADJACENT_HIDDEN_TRIGGER_CLASS_RE = /(?:trigger|button|action|click|tap|confirm|toggle|reveal|open|操作|按钮|触发)/i;
const CLICKABLE_ADJACENT_HIDDEN_TARGET_CLASS_RE = /(?:hidden|secret|detail|result|message|content|text|archive|record|system|隐藏|秘密|详情|结果|信息|内容|正文|档案|记录|判定)/i;

function isRenderedClickableAdjacentHiddenTrigger(element) {
    if (!element) return false;
    if (element.hasAttribute?.(RENDERED_CLICKABLE_ADJACENT_HIDDEN_RESCUE_ATTR)) return true;
    const tagName = String(element.tagName || '').toLowerCase();
    if (!/^(?:div|section|article|figure|aside|span|p)$/.test(tagName)) return false;
    if (isExplicitlyHiddenStateLayer(element)) return false;
    if (getInlineStyleValue(element, 'cursor').toLowerCase() !== 'pointer') return false;
    if (element.querySelector?.('button, input, label, summary, details, select, textarea, a[href]')) return false;

    const text = normalizeInteractionMatchText(element.textContent);
    if (text.length < 2 || text.length > 420) return false;
    const semantic = `${element.id || ''} ${getClassTokens(element).join(' ')}`;
    return CLICKABLE_ADJACENT_HIDDEN_TRIGGER_HINT_RE.test(text)
        || CLICKABLE_ADJACENT_HIDDEN_TRIGGER_CLASS_RE.test(semantic);
}

function isRenderedClickableAdjacentHiddenTarget(element, trigger) {
    if (!element || !trigger || element === trigger) return false;
    const tagName = String(element.tagName || '').toLowerCase();
    if (!/^(?:div|section|article|aside|p|ul|ol|dl|blockquote|pre)$/.test(tagName)) return false;

    const previouslyManaged = element.hasAttribute?.(RENDERED_CLICKABLE_ADJACENT_HIDDEN_ITEM_ATTR);
    const hidden = isExplicitlyHiddenStateLayer(element)
        || isCollapsedDimensionValue(getInlineStyleValue(element, 'height'))
        || isCollapsedDimensionValue(getInlineStyleValue(element, 'max-height'));
    if (!previouslyManaged && !hidden) return false;

    // 带独立关闭按钮或绝对/固定定位的结构继续交给“可点击画面弹层”路线，避免双重接管。
    const position = getInlineStyleValue(element, 'position').toLowerCase();
    if (!previouslyManaged && (/^(?:absolute|fixed)$/.test(position) || findRenderedClickableAdjacentPopupCloseButtons(element).length)) return false;

    const text = normalizeInteractionMatchText(element.textContent);
    if (text.length < 4 || text.length > 5000) return false;
    const semantic = `${element.id || ''} ${getClassTokens(element).join(' ')}`;
    return previouslyManaged
        || CLICKABLE_ADJACENT_HIDDEN_TARGET_CLASS_RE.test(semantic)
        || text.length >= 12;
}

function findRenderedClickableAdjacentHiddenTarget(trigger) {
    let node = trigger?.nextElementSibling || null;
    for (let step = 0; node && step < 3; step += 1, node = node.nextElementSibling) {
        if (/^(?:style|script|template)$/i.test(node.tagName || '')) continue;
        if (isRenderedClickableAdjacentHiddenTarget(node, trigger)) return node;

        // 允许跨过一个纯装饰短节点；遇到真实内容或另一交互区立即停止。
        if (node.querySelector?.('button, input, label, details, summary, select, textarea, a[href]')) break;
        const text = normalizeInteractionMatchText(node.textContent);
        if (text.length > 12) break;
    }
    return null;
}

function hasRenderedClickableAdjacentHiddenCandidates(root) {
    if (!root?.querySelectorAll) return false;
    return [...root.querySelectorAll('div, section, article, figure, aside, span, p')]
        .some(trigger => isRenderedClickableAdjacentHiddenTrigger(trigger)
            && !!findRenderedClickableAdjacentHiddenTarget(trigger));
}

function buildRenderedClickableAdjacentHiddenEntry(trigger, target) {
    if (!trigger || !target) return null;
    const targetOriginalStyles = capturePseudoStyleState(target, [
        'display', 'visibility', 'opacity', 'pointer-events', 'transform',
        'height', 'min-height', 'max-height', 'overflow', 'overflow-x', 'overflow-y',
        'position', 'inset', 'top', 'right', 'bottom', 'left', 'width', 'max-width',
        'margin', 'margin-top',
    ]);
    trigger.setAttribute(RENDERED_CLICKABLE_ADJACENT_HIDDEN_RESCUE_ATTR, 'true');
    target.setAttribute(RENDERED_CLICKABLE_ADJACENT_HIDDEN_ITEM_ATTR, 'true');
    return {
        trigger,
        target,
        active: false,
        targetOriginalStyles,
        activeTransform: neutralizeStateLayerTransform(getCapturedStyleValue(targetOriginalStyles, 'transform')),
        wasDisplayNone: getCapturedStyleValue(targetOriginalStyles, 'display').toLowerCase() === 'none',
        hadCollapsedHeight: isCollapsedDimensionValue(getCapturedStyleValue(targetOriginalStyles, 'height')),
        hadCollapsedMaxHeight: isCollapsedDimensionValue(getCapturedStyleValue(targetOriginalStyles, 'max-height')),
    };
}

function applyRenderedClickableAdjacentHiddenEntry(entry, active = entry?.active) {
    if (!entry?.trigger || !entry?.target) return;
    entry.active = !!active;
    restorePseudoStyleState(entry.target, entry.targetOriginalStyles);

    if (entry.active) {
        const naturalHeight = Math.max(48, Number(entry.target.scrollHeight || 0) + 20);
        const assignments = [
            { property: 'opacity', value: '1' },
            { property: 'visibility', value: 'visible' },
            { property: 'pointer-events', value: 'auto' },
        ];
        if (entry.wasDisplayNone) assignments.push({ property: 'display', value: 'block' });
        if (entry.activeTransform) assignments.push({ property: 'transform', value: entry.activeTransform });
        if (entry.hadCollapsedHeight) assignments.push({ property: 'height', value: 'auto' });
        if (entry.hadCollapsedMaxHeight || getRenderedElementHeight(entry.target) <= 1) {
            assignments.push({ property: 'max-height', value: `${Math.max(320, naturalHeight * 2)}px` });
            assignments.push({ property: 'min-height', value: `${Math.min(1200, naturalHeight)}px` });
        }
        applyPseudoStyleAssignments(entry.target, assignments);
    }

    entry.trigger.setAttribute('aria-expanded', entry.active ? 'true' : 'false');
    entry.trigger.setAttribute('aria-pressed', entry.active ? 'true' : 'false');
    entry.target.setAttribute('aria-hidden', entry.active ? 'false' : 'true');
}

function installRenderedClickableAdjacentHiddenRescue(root) {
    if (!root?.querySelectorAll) return;
    let state = renderedClickableAdjacentHiddenRescueStates.get(root);
    if (!state) {
        state = { entries: new Map() };
        renderedClickableAdjacentHiddenRescueStates.set(root, state);
    }

    for (const trigger of root.querySelectorAll('div, section, article, figure, aside, span, p')) {
        if (trigger.closest?.(`[${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`) || state.entries.has(trigger)) continue;
        if (!isRenderedClickableAdjacentHiddenTrigger(trigger)) continue;
        const target = findRenderedClickableAdjacentHiddenTarget(trigger);
        if (!target) continue;
        const entry = buildRenderedClickableAdjacentHiddenEntry(trigger, target);
        if (!entry) continue;
        state.entries.set(trigger, entry);
        preparePseudoTrigger(trigger);

        const toggle = event => {
            if (event?.type === 'click' && shouldIgnorePseudoToggleEvent(event, trigger)) return;
            if (event?.type === 'keydown') {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
            }
            event?.preventDefault?.();
            applyRenderedClickableAdjacentHiddenEntry(entry, !entry.active);
            for (const delay of [0, 80, 260]) {
                setTimeout(() => {
                    if (root.isConnected && entry.trigger.isConnected && entry.target.isConnected) {
                        applyRenderedClickableAdjacentHiddenEntry(entry, entry.active);
                    }
                }, delay);
            }
        };

        trigger.addEventListener('click', toggle, false);
        trigger.addEventListener('keydown', toggle, false);
        applyRenderedClickableAdjacentHiddenEntry(entry, false);
    }

    if (state.entries.size) root.dataset.rabbitMirrorClickableAdjacentHiddenFallback = 'true';
}


// 渲染后“可点击画面 + 相邻弹层”急救：用于宿主删除 onclick 后，
// 只剩带 cursor:pointer 的画面、紧邻隐藏弹层以及弹层内关闭按钮的结构。
// 点击画面打开，点击关闭入口恢复；不依赖原始事件代码，并保持完整可逆。
const RENDERED_CLICKABLE_ADJACENT_POPUP_RESCUE_ATTR = 'data-rabbit-mirror-clickable-adjacent-popup-rescue';
const RENDERED_CLICKABLE_ADJACENT_POPUP_ITEM_ATTR = 'data-rm-clickable-adjacent-popup-item';
const RENDERED_CLICKABLE_ADJACENT_POPUP_CLOSE_ATTR = 'data-rm-clickable-adjacent-popup-close';
const renderedClickableAdjacentPopupRescueStates = new WeakMap();
const CLICKABLE_ADJACENT_POPUP_TRIGGER_HINT_RE = /(?:点击|轻触|触摸|查看|检视|检查|打开|开启|进入|解锁|翻阅|读取|回忆|相簿|底片)|\b(?:click|tap|touch|open|inspect|view|enter|unlock|album|memory)\b/i;
const CLICKABLE_ADJACENT_POPUP_CLOSE_HINT_RE = /(?:关闭|合上|收起|返回|退出|结束|完成)|\b(?:close|back|exit|dismiss|done|cancel)\b/i;
const CLICKABLE_ADJACENT_POPUP_TARGET_HINT_RE = /(?:popup|modal|dialog|overlay|album|memory|detail|secret|hidden|弹层|弹窗|浮层|相簿|回忆|详情|秘密|隐藏)/i;

function isRenderedClickableAdjacentPopupTrigger(element) {
    if (!element || element.hasAttribute?.(RENDERED_CLICKABLE_ADJACENT_POPUP_RESCUE_ATTR)) return !!element;
    const tagName = String(element.tagName || '').toLowerCase();
    if (!/^(?:div|section|article|figure|aside|span)$/.test(tagName)) return false;
    if (isExplicitlyHiddenStateLayer(element)) return false;
    if (getInlineStyleValue(element, 'cursor').toLowerCase() !== 'pointer') return false;
    const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
    return text.length >= 2 && text.length <= 420;
}

function findRenderedClickableAdjacentPopupCloseButtons(target) {
    if (!target?.querySelectorAll) return [];
    const buttons = [...target.querySelectorAll('button, [role="button"]')];
    const hinted = buttons.filter(button => CLICKABLE_ADJACENT_POPUP_CLOSE_HINT_RE.test(
        String(button.textContent || button.getAttribute?.('aria-label') || '').replace(/\s+/g, ' ').trim(),
    ));
    return hinted.length ? hinted : (buttons.length === 1 ? buttons : []);
}

function isRenderedClickableAdjacentPopupTarget(element, trigger) {
    if (!element || !trigger || element === trigger) return false;
    const tagName = String(element.tagName || '').toLowerCase();
    if (!/^(?:div|section|article|aside|dialog)$/.test(tagName)) return false;

    const previouslyManaged = element.hasAttribute?.(RENDERED_CLICKABLE_ADJACENT_POPUP_ITEM_ATTR);
    if (!previouslyManaged && !isExplicitlyHiddenStateLayer(element)) return false;

    const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length < 8 || text.length > 5000) return false;

    const position = getInlineStyleValue(element, 'position').toLowerCase();
    const semantic = `${element.id || ''} ${getClassTokens(element).join(' ')}`;
    const closeButtons = findRenderedClickableAdjacentPopupCloseButtons(element);
    const triggerText = String(trigger.textContent || '').replace(/\s+/g, ' ').trim();
    const triggerHint = CLICKABLE_ADJACENT_POPUP_TRIGGER_HINT_RE.test(triggerText);
    const popupHint = /^(?:absolute|fixed)$/.test(position)
        || CLICKABLE_ADJACENT_POPUP_TARGET_HINT_RE.test(semantic)
        || closeButtons.length > 0;

    return previouslyManaged || (triggerHint && popupHint && closeButtons.length > 0);
}

function findRenderedClickableAdjacentPopupTarget(trigger) {
    let node = trigger?.nextElementSibling || null;
    for (let step = 0; node && step < 2; step += 1, node = node.nextElementSibling) {
        if (/^(?:style|script|template)$/i.test(node.tagName || '')) continue;
        if (isRenderedClickableAdjacentPopupTarget(node, trigger)) return node;
        break;
    }
    return null;
}

function hasRenderedClickableAdjacentPopupCandidates(root) {
    if (!root?.querySelectorAll) return false;
    return [...root.querySelectorAll('div, section, article, figure, aside, span')]
        .some(trigger => isRenderedClickableAdjacentPopupTrigger(trigger)
            && !!findRenderedClickableAdjacentPopupTarget(trigger));
}

function buildRenderedClickableAdjacentPopupEntry(trigger, target) {
    if (!trigger || !target) return null;
    const targetOriginalStyles = capturePseudoStyleState(target, [
        'display', 'visibility', 'opacity', 'pointer-events', 'transform',
        'height', 'min-height', 'max-height', 'overflow', 'overflow-x', 'overflow-y',
        'position', 'inset', 'top', 'right', 'bottom', 'left', 'width', 'max-width',
        'margin', 'margin-top', 'z-index',
    ]);
    const triggerOriginalStyles = capturePseudoStyleState(trigger, ['filter', 'opacity', 'transform']);
    const closeButtons = findRenderedClickableAdjacentPopupCloseButtons(target);
    if (!closeButtons.length) return null;

    trigger.setAttribute(RENDERED_CLICKABLE_ADJACENT_POPUP_RESCUE_ATTR, 'true');
    target.setAttribute(RENDERED_CLICKABLE_ADJACENT_POPUP_ITEM_ATTR, 'true');
    closeButtons.forEach(button => button.setAttribute(RENDERED_CLICKABLE_ADJACENT_POPUP_CLOSE_ATTR, 'true'));

    return {
        trigger,
        target,
        closeButtons,
        active: false,
        targetOriginalStyles,
        triggerOriginalStyles,
        activeTransform: neutralizeStateLayerTransform(getCapturedStyleValue(targetOriginalStyles, 'transform')),
        wasDisplayNone: getCapturedStyleValue(targetOriginalStyles, 'display').toLowerCase() === 'none',
        hadCollapsedHeight: isCollapsedDimensionValue(getCapturedStyleValue(targetOriginalStyles, 'height')),
        hadCollapsedMaxHeight: isCollapsedDimensionValue(getCapturedStyleValue(targetOriginalStyles, 'max-height')),
    };
}

function applyRenderedClickableAdjacentPopupEntry(entry, active = entry?.active) {
    if (!entry?.trigger || !entry?.target) return;
    entry.active = !!active;
    restorePseudoStyleState(entry.target, entry.targetOriginalStyles);
    restorePseudoStyleState(entry.trigger, entry.triggerOriginalStyles);

    if (entry.active) {
        const assignments = [
            { property: 'opacity', value: '1' },
            { property: 'visibility', value: 'visible' },
            { property: 'pointer-events', value: 'auto' },
        ];
        if (entry.wasDisplayNone) assignments.push({ property: 'display', value: 'block' });
        if (entry.activeTransform) assignments.push({ property: 'transform', value: entry.activeTransform });
        if (entry.hadCollapsedHeight) assignments.push({ property: 'height', value: 'auto' });
        if (entry.hadCollapsedMaxHeight) assignments.push({ property: 'max-height', value: '1200px' });
        applyPseudoStyleAssignments(entry.target, assignments);
    }

    entry.trigger.setAttribute('aria-expanded', entry.active ? 'true' : 'false');
    entry.trigger.setAttribute('aria-pressed', entry.active ? 'true' : 'false');
    entry.target.setAttribute('aria-hidden', entry.active ? 'false' : 'true');
}

function installRenderedClickableAdjacentPopupRescue(root) {
    if (!root?.querySelectorAll) return;
    let state = renderedClickableAdjacentPopupRescueStates.get(root);
    if (!state) {
        state = { entries: new Map() };
        renderedClickableAdjacentPopupRescueStates.set(root, state);
    }

    for (const trigger of root.querySelectorAll('div, section, article, figure, aside, span')) {
        if (trigger.closest?.(`[${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`) || state.entries.has(trigger)) continue;
        if (!isRenderedClickableAdjacentPopupTrigger(trigger)) continue;
        const target = findRenderedClickableAdjacentPopupTarget(trigger);
        if (!target) continue;
        const entry = buildRenderedClickableAdjacentPopupEntry(trigger, target);
        if (!entry) continue;
        state.entries.set(trigger, entry);
        preparePseudoTrigger(trigger);

        const toggle = event => {
            if (event && shouldIgnorePseudoToggleEvent(event, trigger)) return;
            event?.preventDefault?.();
            applyRenderedClickableAdjacentPopupEntry(entry, !entry.active);
            for (const delay of [0, 80, 260]) {
                setTimeout(() => {
                    if (root.isConnected && entry.trigger.isConnected && entry.target.isConnected) {
                        applyRenderedClickableAdjacentPopupEntry(entry, entry.active);
                    }
                }, delay);
            }
        };

        trigger.addEventListener('click', toggle, false);
        trigger.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            toggle(event);
        }, false);

        for (const closeButton of entry.closeButtons) {
            closeButton.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                applyRenderedClickableAdjacentPopupEntry(entry, false);
            }, false);
        }
        applyRenderedClickableAdjacentPopupEntry(entry, false);
    }

    if (state.entries.size) root.dataset.rabbitMirrorClickableAdjacentPopupFallback = 'true';
}



// 渲染后“可点击容器内部揭示”急救：用于 onclick 被删除后，
// 容器内部仍保留点击提示与 display:none / opacity:0 正文的结构。
// 每个容器独立、可逆，不依赖 class 原名或原始事件代码。
const RENDERED_CONTAINER_INTERNAL_REVEAL_ATTR = 'data-rabbit-mirror-container-internal-reveal';
const RENDERED_CONTAINER_INTERNAL_REVEAL_ITEM_ATTR = 'data-rm-container-internal-reveal-item';
const renderedContainerInternalRevealStates = new WeakMap();
const CONTAINER_INTERNAL_REVEAL_HINT_RE = /(?:点击|轻触|触摸|恢复|曝光|播放|读取|查看|展开|解锁|揭示)|\b(?:click|tap|touch|restore|expose|play|read|view|open|reveal)\b/i;
const CONTAINER_INTERNAL_REVEAL_CLASS_RE = /(?:hidden|secret|reveal|detail|content|text|message|msg|fragment|track|scene)/i;

function isRenderedContainerInternalRevealTarget(element, host) {
    if (!element || !host || element.parentElement !== host) return false;
    const tagName = String(element.tagName || '').toLowerCase();
    if (!/^(?:div|section|article|aside|p|blockquote|pre)$/.test(tagName)) return false;
    const previouslyManaged = element.hasAttribute?.(RENDERED_CONTAINER_INTERNAL_REVEAL_ITEM_ATTR);
    const hidden = isExplicitlyHiddenStateLayer(element)
        || isCollapsedDimensionValue(getInlineStyleValue(element, 'height'))
        || isCollapsedDimensionValue(getInlineStyleValue(element, 'max-height'));
    if (!previouslyManaged && !hidden) return false;
    const text = normalizeInteractionMatchText(element.textContent);
    return text.length >= 4 && text.length <= 6000;
}

function collectRenderedContainerInternalRevealHints(host, targets) {
    const targetSet = new Set(targets || []);
    return [...(host?.children || [])].filter(element => {
        if (targetSet.has(element) || isExplicitlyHiddenStateLayer(element)) return false;
        const text = normalizeInteractionMatchText(element.textContent);
        const semantic = `${element.id || ''} ${getClassTokens(element).join(' ')}`;
        return text.length > 0 && text.length <= 260
            && (CONTAINER_INTERNAL_REVEAL_HINT_RE.test(text) || /(?:hint|instruction|prompt|提示|操作)/i.test(semantic));
    }).slice(0, 4);
}

function buildRenderedContainerInternalRevealEntry(host) {
    if (!host?.children || host.hasAttribute?.(RENDERED_MASK_REVEAL_RESCUE_ATTR)
        || getInlineStyleValue(host, 'cursor').toLowerCase() !== 'pointer') return null;
    if (host.querySelector?.('input, label, button, summary, details, select, textarea')) return null;

    const targets = [...host.children].filter(element => isRenderedContainerInternalRevealTarget(element, host)).slice(0, 4);
    if (!targets.length) return null;
    const hints = collectRenderedContainerInternalRevealHints(host, targets);
    const semantic = `${host.id || ''} ${getClassTokens(host).join(' ')} ${normalizeInteractionMatchText(host.textContent).slice(0, 300)}`;
    if (!hints.length && !CONTAINER_INTERNAL_REVEAL_CLASS_RE.test(semantic)) return null;

    const targetStates = targets.map(target => ({
        target,
        originalStyles: capturePseudoStyleState(target, [
            'display', 'visibility', 'opacity', 'pointer-events', 'transform',
            'height', 'min-height', 'max-height', 'overflow', 'overflow-x', 'overflow-y',
        ]),
        activeTransform: neutralizeStateLayerTransform(getInlineStyleValue(target, 'transform')),
        wasDisplayNone: getInlineStyleValue(target, 'display').toLowerCase() === 'none',
        wasVisibilityHidden: getInlineStyleValue(target, 'visibility').toLowerCase() === 'hidden',
        hadCollapsedHeight: isCollapsedDimensionValue(getInlineStyleValue(target, 'height')),
        hadCollapsedMaxHeight: isCollapsedDimensionValue(getInlineStyleValue(target, 'max-height')),
    }));
    const hintStates = hints.map(target => ({
        target,
        originalStyles: capturePseudoStyleState(target, ['display', 'visibility', 'opacity', 'pointer-events']),
    }));

    host.setAttribute(RENDERED_CONTAINER_INTERNAL_REVEAL_ATTR, 'true');
    targets.forEach((target, index) => target.setAttribute(RENDERED_CONTAINER_INTERNAL_REVEAL_ITEM_ATTR, String(index)));
    return { host, targetStates, hintStates, active: false };
}

function applyRenderedContainerInternalRevealEntry(entry, active = entry?.active) {
    if (!entry?.host) return;
    entry.active = !!active;
    for (const state of entry.targetStates || []) {
        restorePseudoStyleState(state.target, state.originalStyles);
        if (!entry.active) continue;
        const assignments = [
            { property: 'opacity', value: '1' },
            { property: 'visibility', value: 'visible' },
            { property: 'pointer-events', value: 'auto' },
            { property: 'overflow', value: 'visible' },
        ];
        if (state.wasDisplayNone) assignments.push({ property: 'display', value: 'block' });
        if (state.wasVisibilityHidden) assignments.push({ property: 'visibility', value: 'visible' });
        if (state.activeTransform) assignments.push({ property: 'transform', value: state.activeTransform });
        if (state.hadCollapsedHeight) assignments.push({ property: 'height', value: 'auto' });
        if (state.hadCollapsedMaxHeight) assignments.push({ property: 'max-height', value: '1600px' });
        applyPseudoStyleAssignments(state.target, assignments);
    }
    for (const state of entry.hintStates || []) {
        restorePseudoStyleState(state.target, state.originalStyles);
        if (entry.active) applyPseudoStyleAssignments(state.target, [
            { property: 'display', value: 'none' },
            { property: 'opacity', value: '0' },
            { property: 'pointer-events', value: 'none' },
        ]);
    }
    entry.host.setAttribute('aria-expanded', entry.active ? 'true' : 'false');
    entry.host.setAttribute('aria-pressed', entry.active ? 'true' : 'false');
}

function findRenderedContainerInternalRevealEntries(root) {
    if (!root?.querySelectorAll) return [];
    const entries = [];
    for (const host of root.querySelectorAll('div, section, article, aside, figure')) {
        if (host.closest?.(`[${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`)) continue;
        const entry = buildRenderedContainerInternalRevealEntry(host);
        if (entry) entries.push(entry);
    }
    return entries;
}

function hasRenderedContainerInternalRevealCandidates(root) {
    if (!root?.querySelectorAll) return false;
    return [...root.querySelectorAll('div, section, article, aside, figure')].some(host => {
        if (getInlineStyleValue(host, 'cursor').toLowerCase() !== 'pointer') return false;
        if (host.querySelector?.('input, label, button, summary, details, select, textarea')) return false;
        const targets = [...(host.children || [])].filter(element => isRenderedContainerInternalRevealTarget(element, host));
        if (!targets.length) return false;
        return collectRenderedContainerInternalRevealHints(host, targets).length > 0
            || CONTAINER_INTERNAL_REVEAL_CLASS_RE.test(`${host.id || ''} ${getClassTokens(host).join(' ')}`);
    });
}

function installRenderedContainerInternalRevealRescue(root) {
    if (!root?.querySelectorAll) return;
    let state = renderedContainerInternalRevealStates.get(root);
    if (!state) {
        state = { entries: new Map() };
        renderedContainerInternalRevealStates.set(root, state);
    }

    for (const entry of findRenderedContainerInternalRevealEntries(root)) {
        if (state.entries.has(entry.host)) continue;
        state.entries.set(entry.host, entry);
        preparePseudoTrigger(entry.host);
        const toggle = event => {
            if (event?.type === 'click' && shouldIgnorePseudoToggleEvent(event, entry.host)) return;
            if (event?.type === 'keydown') {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
            }
            event?.preventDefault?.();
            applyRenderedContainerInternalRevealEntry(entry, !entry.active);
        };
        entry.host.addEventListener('click', toggle, false);
        entry.host.addEventListener('keydown', toggle, false);
        applyRenderedContainerInternalRevealEntry(entry, false);
    }
    if (state.entries.size) root.dataset.rabbitMirrorContainerInternalRevealFallback = 'true';
}

// 渲染后“遮罩—隐藏层揭示”急救：用于宿主已删除 onmouseover/onmouseout，且没有表单控件的画面揭层。
// 只识别同一容器内语义明确的遮罩层与隐藏正文层，点击/轻触一次显示，再次点击恢复。
const RENDERED_MASK_REVEAL_RESCUE_ATTR = 'data-rabbit-mirror-mask-reveal-rescue';
const RENDERED_MASK_REVEAL_TARGET_ATTR = 'data-rm-mask-reveal-target';
const renderedMaskRevealRescueStates = new WeakMap();
const MASK_REVEAL_MASK_HINT_RE = /(?:frost|fog|mist|mask|cover|veil|curtain|overlay|blur|霜|雾|遮罩|覆盖|幕)/i;
const MASK_REVEAL_HIDDEN_HINT_RE = /(?:hidden|reveal|secret|message|msg|detail|content|note|memo|thought|隐藏|揭示|秘密|信息|备忘|内容)/i;
const MASK_REVEAL_TRIGGER_HINT_RE = /(?:长按|按住|点击|轻触|触摸|擦拭|擦去|揭开|查看|显露|解锁|开启)|\b(?:click|tap|touch|hold|wipe|reveal|open|inspect)\b/i;

function isRenderedMaskRevealHiddenTarget(element) {
    if (!element) return false;
    const previouslyManaged = element.hasAttribute?.(RENDERED_MASK_REVEAL_TARGET_ATTR);
    if (!previouslyManaged && !isExplicitlyHiddenStateLayer(element)) return false;
    const tagName = String(element.tagName || '').toLowerCase();
    if (!/^(?:div|section|article|aside|p|span)$/.test(tagName)) return false;
    const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length < 8 || text.length > 1800) return false;
    const semantic = `${element.id || ''} ${getClassTokens(element).join(' ')}`;
    return MASK_REVEAL_HIDDEN_HINT_RE.test(semantic) || text.length >= 30;
}

function isRenderedMaskRevealMask(element) {
    if (!element || isExplicitlyHiddenStateLayer(element)) return false;
    const semantic = `${element.id || ''} ${getClassTokens(element).join(' ')}`;
    const clipPath = getInlineStyleValue(element, 'clip-path');
    const backdrop = getInlineStyleValue(element, 'backdrop-filter');
    const looksLikeMask = MASK_REVEAL_MASK_HINT_RE.test(semantic) || !!clipPath || !!backdrop;
    return looksLikeMask && isOverlayLikeStateLayer(element);
}

function findRenderedMaskRevealEntries(root) {
    if (!root?.querySelectorAll) return [];
    const entries = [];
    const seenHosts = new Set();

    for (const hidden of root.querySelectorAll('div, section, article, aside, p, span')) {
        if (!isRenderedMaskRevealHiddenTarget(hidden)) continue;
        const host = hidden.parentElement;
        if (!host || seenHosts.has(host) || host.hasAttribute?.(RAW_SELF_MUTATION_RESCUE_ATTR) || host.querySelector?.('input, label, button, select, textarea')) continue;
        const siblings = [...(host.children || [])];
        const masks = siblings.filter(item => item !== hidden && isRenderedMaskRevealMask(item));
        if (!masks.length) continue;

        const hostText = String(host.textContent || '').replace(/\s+/g, ' ').trim();
        const cursor = getInlineStyleValue(host, 'cursor').toLowerCase();
        if (cursor !== 'pointer' && !MASK_REVEAL_TRIGGER_HINT_RE.test(hostText)) continue;

        const mask = masks[0];
        const hiddenOriginalStyles = capturePseudoStyleState(hidden, ['display', 'visibility', 'opacity', 'pointer-events', 'transform']);
        const maskOriginalStyles = capturePseudoStyleState(mask, ['opacity', 'clip-path', 'pointer-events', 'filter']);
        const hiddenState = {
            target: hidden,
            originalStyles: hiddenOriginalStyles,
            activeTransform: neutralizeStateLayerTransform(getCapturedStyleValue(hiddenOriginalStyles, 'transform')),
            wasDisplayNone: getCapturedStyleValue(hiddenOriginalStyles, 'display').toLowerCase() === 'none',
        };
        const maskState = {
            target: mask,
            originalStyles: maskOriginalStyles,
            originalClipPath: getCapturedStyleValue(maskOriginalStyles, 'clip-path'),
        };
        entries.push({
            host,
            hiddenState,
            maskState,
            active: host.getAttribute?.('aria-pressed') === 'true',
        });
        seenHosts.add(host);
    }
    return entries;
}

function hasRenderedMaskRevealCandidates(root) {
    return findRenderedMaskRevealEntries(root).length > 0;
}

function applyRenderedMaskRevealEntry(entry, active) {
    if (!entry?.host) return;
    entry.active = !!active;
    restorePseudoStyleState(entry.hiddenState.target, entry.hiddenState.originalStyles);
    restorePseudoStyleState(entry.maskState.target, entry.maskState.originalStyles);

    if (entry.active) {
        const revealAssignments = [
            { property: 'opacity', value: '1' },
            { property: 'visibility', value: 'visible' },
            { property: 'pointer-events', value: 'auto' },
        ];
        if (entry.hiddenState.wasDisplayNone) revealAssignments.push({ property: 'display', value: 'flex' });
        if (entry.hiddenState.activeTransform) revealAssignments.push({ property: 'transform', value: entry.hiddenState.activeTransform });
        applyPseudoStyleAssignments(entry.hiddenState.target, revealAssignments);

        const maskAssignments = [
            { property: 'opacity', value: '0.18' },
            { property: 'pointer-events', value: 'none' },
        ];
        if (/circle\(/i.test(entry.maskState.originalClipPath)) {
            maskAssignments.push({ property: 'clip-path', value: 'circle(85% at 50% 50%)' });
        }
        applyPseudoStyleAssignments(entry.maskState.target, maskAssignments);
    }

    entry.host.setAttribute('aria-pressed', entry.active ? 'true' : 'false');
}

function installRenderedMaskRevealRescue(root) {
    if (!root?.querySelectorAll) return;
    let state = renderedMaskRevealRescueStates.get(root);
    if (!state) {
        state = { hosts: new Map() };
        renderedMaskRevealRescueStates.set(root, state);
    }

    for (const entry of findRenderedMaskRevealEntries(root)) {
        if (state.hosts.has(entry.host)) continue;
        state.hosts.set(entry.host, entry);
        entry.host.setAttribute(RENDERED_MASK_REVEAL_RESCUE_ATTR, 'true');
        entry.hiddenState.target.setAttribute(RENDERED_MASK_REVEAL_TARGET_ATTR, 'true');
        preparePseudoTrigger(entry.host);

        const activate = event => {
            if (event?.type === 'click' && shouldIgnorePseudoToggleEvent(event, entry.host)) return;
            if (event?.type === 'keydown') {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
            }
            applyRenderedMaskRevealEntry(entry, !entry.active);
        };
        entry.host.addEventListener('click', activate, false);
        entry.host.addEventListener('keydown', activate, false);
        applyRenderedMaskRevealEntry(entry, entry.active);
    }
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
        let target = scope.querySelector(safeSelector);
        // 酒馆净化器会把模型 class 改写为 custom-xxx。原始 onchange 仍引用旧 class，
        // 急救时仅在同一兔子镜范围内补查该安全前缀，不访问整页。
        if (!target && safeSelector.startsWith('.')) {
            const className = safeSelector.slice(1);
            target = scope.querySelector(`.custom-${className}`);
        }
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
        let targets = [...scope.querySelectorAll(safeSelector)].filter(target => target && root.contains(target));
        if (!targets.length && safeSelector.startsWith('.')) {
            const className = safeSelector.slice(1);
            targets = [...scope.querySelectorAll(`.custom-${className}`)].filter(target => target && root.contains(target));
        }
        return targets.slice(0, 64);
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


function resolveAncestorQueryExpression(input, expression, root) {
    const source = String(expression || '').trim();
    const match = /^(this(?:(?:\s*\.\s*(?:parentNode|parentElement))*))\s*\.\s*querySelector\(\s*(['"])([.#]?[a-zA-Z_][\w:.-]*)\2\s*\)$/.exec(source);
    if (!match) return null;

    const chain = match[1];
    const depth = (chain.match(/\.\s*(?:parentNode|parentElement)/g) || []).length;
    let scope = input;
    for (let index = 0; index < depth; index += 1) {
        scope = scope?.parentElement || null;
        if (!scope || !root?.contains?.(scope)) return null;
    }
    return resolveSafeScopedQuery(scope, match[3], root);
}

function parseSafeCssTextAssignments(cssText) {
    const assignments = [];
    const source = String(cssText || '').trim();
    if (!source || /[{}<>]/.test(source)) return assignments;
    for (const declaration of source.split(';')) {
        const index = declaration.indexOf(':');
        if (index <= 0) continue;
        const property = normalizeStylePropertyName(declaration.slice(0, index).trim());
        const value = declaration.slice(index + 1).trim();
        if (!/^[a-z][a-z0-9-]*$/i.test(property) || !value) continue;
        assignments.push({ property, value });
    }
    return assignments;
}

function resolveCheckedRelativeElementExpression(input, expression, root) {
    const source = String(expression || '').replace(/\s+/g, '');
    if (!/^this(?:\.(?:nextElementSibling|previousElementSibling|parentElement|parentNode)){0,6}$/.test(source)) return null;

    let target = input;
    const steps = source.match(/\.(?:nextElementSibling|previousElementSibling|parentElement|parentNode)/g) || [];
    for (const rawStep of steps) {
        const step = rawStep.slice(1);
        if (step === 'nextElementSibling') target = target?.nextElementSibling || null;
        else if (step === 'previousElementSibling') target = target?.previousElementSibling || null;
        else target = target?.parentElement || null;
        if (!target || !root?.contains?.(target)) return null;
    }
    return target && root?.contains?.(target) ? target : null;
}

function parseCheckedTernaryStyleProgramFromSource(input, root, scriptText) {
    const source = String(scriptText || '');
    if (!source || !/this\s*\.\s*checked\s*\?/i.test(source)) return null;

    const stateValues = new Map();
    const ternaryRe = /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*this\s*\.\s*checked\s*\?\s*(['"])((?:\\.|(?!\2)[\s\S])*)\2\s*:\s*(['"])((?:\\.|(?!\4)[\s\S])*)\4\s*;?/g;
    let match;
    while ((match = ternaryRe.exec(source))) {
        stateValues.set(match[1], {
            active: decodeSafeInlineString(match[3]),
            inactive: decodeSafeInlineString(match[5]),
        });
    }
    // 直接写在赋值右侧的三元表达式不需要先声明状态变量。
    // 不能在 stateValues 为空时提前退出，否则
    // this.nextElementSibling.style.opacity = this.checked ? '1' : '0'
    // 这类最常见结构会在真正解析前被误判为无程序。

    const statesByTarget = new Map();
    const ensureTargetState = target => {
        if (!target) return null;
        if (!statesByTarget.has(target)) {
            statesByTarget.set(target, {
                target,
                activeAssignments: [],
                inactiveAssignments: [],
                activeText: undefined,
                inactiveText: undefined,
            });
        }
        return statesByTarget.get(target);
    };

    // 支持模型最常见的直接相邻目标写法：
    // this.nextElementSibling.style.opacity = this.checked ? '1' : '0';
    // 仅沿当前 input 的有限亲属/兄弟链解析，不执行任意 JavaScript，也不会越出当前兔子镜。
    const rememberDirectStyle = (expression, property, rawActive, rawInactive) => {
        const target = resolveCheckedRelativeElementExpression(input, expression, root);
        const state = ensureTargetState(target);
        const normalizedProperty = normalizeStylePropertyName(property);
        if (!state || !/^[a-z][a-z0-9-]*$/i.test(normalizedProperty)) return;
        state.activeAssignments.push({ property: normalizedProperty, value: decodeSafeInlineString(rawActive) });
        state.inactiveAssignments.push({ property: normalizedProperty, value: decodeSafeInlineString(rawInactive) });
    };

    const directDotTernaryRe = /(this(?:\s*\.\s*(?:nextElementSibling|previousElementSibling|parentElement|parentNode)){0,6})\s*\.\s*style\s*\.\s*([a-zA-Z][\w]*)\s*=\s*this\s*\.\s*checked\s*\?\s*(['"])((?:\\.|(?!\3)[\s\S])*)\3\s*:\s*(['"])((?:\\.|(?!\5)[\s\S])*)\5\s*;?/g;
    let directMatch;
    while ((directMatch = directDotTernaryRe.exec(source))) {
        rememberDirectStyle(directMatch[1], directMatch[2], directMatch[4], directMatch[6]);
    }

    const directBracketTernaryRe = /(this(?:\s*\.\s*(?:nextElementSibling|previousElementSibling|parentElement|parentNode)){0,6})\s*\.\s*style\s*\[\s*(['"])([a-zA-Z-]+)\2\s*\]\s*=\s*this\s*\.\s*checked\s*\?\s*(['"])((?:\\.|(?!\4)[\s\S])*)\4\s*:\s*(['"])((?:\\.|(?!\6)[\s\S])*)\6\s*;?/g;
    while ((directMatch = directBracketTernaryRe.exec(source))) {
        rememberDirectStyle(directMatch[1], directMatch[3], directMatch[5], directMatch[7]);
    }

    const directTextTernaryRe = /(this(?:\s*\.\s*(?:nextElementSibling|previousElementSibling|parentElement|parentNode)){0,6})\s*\.\s*(innerText|textContent)\s*=\s*this\s*\.\s*checked\s*\?\s*(['"])((?:\\.|(?!\3)[\s\S])*)\3\s*:\s*(['"])((?:\\.|(?!\5)[\s\S])*)\5\s*;?/g;
    while ((directMatch = directTextTernaryRe.exec(source))) {
        const target = resolveCheckedRelativeElementExpression(input, directMatch[1], root);
        const state = ensureTargetState(target);
        if (!state) continue;
        state.activeText = decodeSafeInlineString(directMatch[4]);
        state.inactiveText = decodeSafeInlineString(directMatch[6]);
    }

    const queryExpressionPattern = String.raw`(this(?:(?:\s*\.\s*(?:parentNode|parentElement))*)\s*\.\s*querySelector\(\s*(['"])([.#]?[a-zA-Z_][\w:.-]*)\2\s*\))`;

    // 逐行解析，避免 cssText 的字符串内部包含分号时被错误截断。
    for (const rawLine of source.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || /^(?:const|let|var)\b/.test(line)) continue;

        let lineMatch = new RegExp(`^${queryExpressionPattern}\\s*\\.\\s*style\\s*\\.\\s*([a-zA-Z][\\w]*)\\s*=\\s*([a-zA-Z_$][\\w$]*)\\s*;?$`).exec(line);
        if (lineMatch) {
            const target = resolveAncestorQueryExpression(input, lineMatch[1], root);
            const values = stateValues.get(lineMatch[5]);
            const state = ensureTargetState(target);
            if (state && values) {
                const property = normalizeStylePropertyName(lineMatch[4]);
                state.activeAssignments.push({ property, value: values.active });
                state.inactiveAssignments.push({ property, value: values.inactive });
            }
            continue;
        }

        lineMatch = new RegExp(`^${queryExpressionPattern}\\s*\\.\\s*(innerText|textContent)\\s*=\\s*([a-zA-Z_$][\\w$]*)\\s*;?$`).exec(line);
        if (lineMatch) {
            const target = resolveAncestorQueryExpression(input, lineMatch[1], root);
            const values = stateValues.get(lineMatch[5]);
            const state = ensureTargetState(target);
            if (state && values) {
                state.activeText = values.active;
                state.inactiveText = values.inactive;
            }
            continue;
        }

        lineMatch = new RegExp(`^${queryExpressionPattern}\\s*\\.\\s*style\\s*\\.\\s*cssText\\s*=\\s*([a-zA-Z_$][\\w$]*)\\s*\\+\\s*(['"])((?:\\\\.|(?!\\5)[\\s\\S])*)\\5\\s*;?$`).exec(line);
        if (lineMatch) {
            const target = resolveAncestorQueryExpression(input, lineMatch[1], root);
            const values = stateValues.get(lineMatch[4]);
            const suffix = decodeSafeInlineString(lineMatch[6]);
            const state = ensureTargetState(target);
            if (state && values) {
                state.activeAssignments.push(...parseSafeCssTextAssignments(`${values.active}${suffix}`));
                state.inactiveAssignments.push(...parseSafeCssTextAssignments(`${values.inactive}${suffix}`));
            }
        }
    }

    const states = [];
    for (const state of statesByTarget.values()) {
        const properties = new Set([
            ...state.activeAssignments.map(item => item.property),
            ...state.inactiveAssignments.map(item => item.property),
        ]);
        if (!properties.size && state.activeText === undefined && state.inactiveText === undefined) continue;
        states.push({
            ...state,
            originalText: captureStableTextState(state.target),
            originalStyles: capturePseudoStyleState(state.target, properties),
        });
    }
    return states.length ? states : null;
}

function parseCheckedChangeStyleProgramFromSource(input, root, scriptText) {
    const source = String(scriptText || '');
    if (!source) return null;
    if (!/if\s*\(\s*this\.checked\s*\)/i.test(source)) {
        return parseCheckedTernaryStyleProgramFromSource(input, root, source);
    }

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

    // 模型常用 document.getElementById；宿主会删除 onchange，且 ID 可能已被兔子镜作用域化。
    // 这里只在当前兔子镜内解析安全的固定 ID，不访问整页，也不执行模型 JavaScript。
    const documentIdAliasRe = /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*document\s*\.\s*getElementById\(\s*(['"])([a-zA-Z_][\w:.-]*)\2\s*\)\s*;?/g;
    while ((match = documentIdAliasRe.exec(source))) {
        const target = resolveScopedPseudoId(root, match[3]);
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
            originalText: captureStableTextState(target),
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

function readReversibleStyleBaseline(element) {
    if (!element?.style) return new Map();
    const remembered = reversibleStyleBaselineStates.get(element);
    if (remembered) return remembered;

    const baseline = new Map();
    const encoded = element.getAttribute?.(REVERSIBLE_STYLE_BASELINE_ATTR) || '';
    if (encoded) {
        try {
            const parsed = JSON.parse(decodeURIComponent(encoded));
            if (parsed && typeof parsed === 'object') {
                for (const [property, state] of Object.entries(parsed)) {
                    baseline.set(property, {
                        value: String(state?.value || ''),
                        priority: String(state?.priority || ''),
                    });
                }
            }
        } catch {
            // 损坏或旧格式的本地标记直接忽略，并从当前原始 DOM 重新建立。
        }
    }
    reversibleStyleBaselineStates.set(element, baseline);
    return baseline;
}

function persistReversibleStyleBaseline(element, baseline) {
    if (!element?.setAttribute || !baseline?.size) return;
    try {
        const serializable = Object.fromEntries([...baseline.entries()].map(([property, state]) => [property, {
            value: String(state?.value || ''),
            priority: String(state?.priority || ''),
        }]));
        element.setAttribute(REVERSIBLE_STYLE_BASELINE_ATTR, encodeURIComponent(JSON.stringify(serializable)));
    } catch {
        // data 属性写入失败时，WeakMap 中的当前会话基线仍可使用。
    }
}

function capturePseudoStyleState(element, properties) {
    const captured = new Map();
    if (!element?.style) return captured;
    const baseline = readReversibleStyleBaseline(element);
    let changed = false;

    for (const property of properties) {
        if (!baseline.has(property)) {
            baseline.set(property, {
                value: element.style.getPropertyValue(property) || '',
                priority: element.style.getPropertyPriority(property) || '',
            });
            changed = true;
        }
        const state = baseline.get(property) || { value: '', priority: '' };
        captured.set(property, { value: state.value, priority: state.priority });
    }
    if (changed) persistReversibleStyleBaseline(element, baseline);
    return captured;
}

function getCapturedStyleValue(captured, property) {
    return String(captured?.get?.(property)?.value || '').trim();
}

function captureStableTextState(element) {
    if (!element) return '';
    if (reversibleTextBaselineStates.has(element)) return reversibleTextBaselineStates.get(element);

    let value = '';
    const encoded = element.getAttribute?.(REVERSIBLE_TEXT_BASELINE_ATTR) || '';
    if (encoded) {
        try {
            value = decodeURIComponent(encoded);
        } catch {
            value = '';
        }
    }
    if (!encoded) {
        value = String(element.textContent || '');
        try {
            if (value.length <= 4000) element.setAttribute(REVERSIBLE_TEXT_BASELINE_ATTR, encodeURIComponent(value));
        } catch {
            // WeakMap fallback remains available.
        }
    }
    reversibleTextBaselineStates.set(element, value);
    return value;
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

function getSafeClassTokens(value) {
    return String(value || '')
        .split(/\s+/)
        .map(token => token.trim())
        .filter(token => /^[a-zA-Z_][\w-]*$/.test(token));
}

function inferRenderedClassPrefix(target, rawTokens, root) {
    const currentTokens = [...(target?.classList || [])];
    const scores = new Map();
    for (const rawToken of rawTokens || []) {
        for (const currentToken of currentTokens) {
            if (currentToken === rawToken) scores.set('', (scores.get('') || 0) + 3);
            else if (currentToken.endsWith(rawToken)) {
                const prefix = currentToken.slice(0, -rawToken.length);
                if (/^[a-zA-Z0-9_-]+$/.test(prefix)) scores.set(prefix, (scores.get(prefix) || 0) + 2);
            }
        }
    }

    const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
    if (ranked.length) return ranked[0][0];

    const cssText = [...(root?.querySelectorAll?.('style') || [])]
        .map(style => style.textContent || '')
        .join('\n');
    if ((rawTokens || []).some(token => new RegExp(`\\.custom-${escapeRegExp(token)}(?![\\w-])`).test(cssText))) {
        return 'custom-';
    }
    return '';
}

function buildDirectIdClassStateAction(target, rawClassValue, root) {
    const rawTokens = getSafeClassTokens(decodeSafeInlineString(rawClassValue));
    if (!target?.classList || !rawTokens.length) return null;
    const prefix = inferRenderedClassPrefix(target, rawTokens, root);
    const classes = [...new Set(rawTokens.map(token => {
        if (target.classList.contains(token)) return token;
        if (prefix && target.classList.contains(`${prefix}${token}`)) return `${prefix}${token}`;
        return `${prefix}${token}`;
    }))];
    return classes.length ? { type: 'class-state', target, classes } : null;
}

function applyDirectIdClassState(action) {
    const target = action?.target;
    if (!target?.classList || !Array.isArray(action.classes)) return;

    let state = directIdClassStateStates.get(target);
    if (!state) {
        state = {
            baseline: new Set([...target.classList]),
            applied: new Set(),
        };
        directIdClassStateStates.set(target, state);
    }

    for (const className of state.applied) {
        if (!state.baseline.has(className)) target.classList.remove(className);
    }
    for (const className of state.baseline) target.classList.add(className);
    for (const className of action.classes) target.classList.add(className);

    state.applied = new Set(action.classes.filter(className => !state.baseline.has(className)));
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

    // document.getElementById('id').className = 'base active';
    // 只接受固定字符串，并把酒馆自动加入的 custom- 前缀映射回当前安全 DOM。
    const classNameRe = /document\s*\.\s*getElementById\s*\(\s*(['"])([a-zA-Z_][\w:.-]*)\1\s*\)\s*\.\s*className\s*=\s*(['"])((?:\\.|(?!\3)[\s\S])*)\3\s*;?/g;
    while ((match = classNameRe.exec(source))) {
        const target = resolveScopedPseudoId(root, match[2]);
        const action = buildDirectIdClassStateAction(target, match[4], root);
        if (!action) return null;
        addMatch(match, action);
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
        } else if (action.type === 'class-state') {
            applyDirectIdClassState(action);
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


function normalizeInteractionMatchText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function resolveRenderedCounterpart(rawRoot, renderedRoot, rawElement, selector = '*') {
    if (!rawRoot || !renderedRoot || !rawElement) return null;
    const rawTag = String(rawElement.tagName || '').toLowerCase();

    if (rawElement.matches?.('input[type="checkbox"], input[type="radio"]')) {
        const rawInputs = [...rawRoot.querySelectorAll('input[type="checkbox"], input[type="radio"]')];
        const renderedInputs = [...renderedRoot.querySelectorAll('input[type="checkbox"], input[type="radio"]')];
        const index = rawInputs.indexOf(rawElement);
        return index >= 0 ? (renderedInputs[index] || null) : null;
    }

    const path = getElementChildIndexPath(rawRoot, rawElement);
    const pathCandidate = path ? resolveElementChildIndexPath(renderedRoot, path) : null;
    if (pathCandidate && String(pathCandidate.tagName || '').toLowerCase() === rawTag) return pathCandidate;

    const rawText = normalizeInteractionMatchText(rawElement.textContent);
    const candidates = [...renderedRoot.querySelectorAll(selector)]
        .filter(candidate => String(candidate.tagName || '').toLowerCase() === rawTag);
    if (!candidates.length) return null;
    if (rawText) {
        const exact = candidates.find(candidate => normalizeInteractionMatchText(candidate.textContent) === rawText);
        if (exact) return exact;
        const prefix = rawText.slice(0, Math.min(64, rawText.length));
        const near = candidates.find(candidate => normalizeInteractionMatchText(candidate.textContent).includes(prefix));
        if (near) return near;
    }

    const rawPeers = [...rawRoot.querySelectorAll(rawTag || '*')];
    const index = rawPeers.indexOf(rawElement);
    return index >= 0 ? (candidates[index] || null) : null;
}

const RAW_SELF_MUTATION_RESCUE_ATTR = 'data-rabbit-mirror-self-mutation-rescue';
const RAW_SELF_MUTATION_HTML_BASELINE_ATTR = 'data-rm-self-mutation-html-baseline';
const RAW_SELF_MUTATION_ACTIVE_ATTR = 'data-rm-self-mutation-active';
const rawSelfMutationRescueStates = new WeakMap();

function parseSafeSelfMutationText(mode, rawValue) {
    const decoded = decodeSafeInlineString(rawValue);
    if (mode !== 'innerHTML') return decoded;
    if (typeof document === 'undefined') return decoded.replace(/<[^>]*>/g, '');
    try {
        const template = document.createElement('template');
        template.innerHTML = decoded;
        if (template.content.querySelector('script, style, iframe, object, embed, form, input, button, a')) return null;
        return String(template.content.textContent || '').replace(/\s+/g, ' ').trim();
    } catch {
        return null;
    }
}

function parseRelativeSelfMutationAssignments(scriptText, trigger, root) {
    const source = String(scriptText || '');
    const grouped = new Map();
    if (!source || !trigger || !root?.contains?.(trigger)) return [];

    const remember = (expression, property, value) => {
        const target = resolveCheckedRelativeElementExpression(trigger, expression, root);
        const normalizedProperty = normalizeStylePropertyName(property);
        const normalizedValue = String(value || '').trim();
        if (!target?.style || !normalizedProperty || !normalizedValue) return;
        let entry = grouped.get(target);
        if (!entry) {
            entry = { target, assignments: new Map() };
            grouped.set(target, entry);
        }
        // 同一目标、同一属性只保留脚本中的最后一次赋值，兼容 setTimeout 内的最终状态。
        entry.assignments.set(normalizedProperty, normalizedValue);
    };

    let match;
    const dotAssignmentRe = /(this(?:\s*\.\s*(?:nextElementSibling|previousElementSibling|parentElement|parentNode)){1,6})\s*\.\s*style\s*\.\s*([a-zA-Z][\w]*)\s*=\s*(['"])((?:\\.|(?!\3)[\s\S])*)\3\s*;?/g;
    while ((match = dotAssignmentRe.exec(source))) remember(match[1], match[2], match[4]);

    const bracketAssignmentRe = /(this(?:\s*\.\s*(?:nextElementSibling|previousElementSibling|parentElement|parentNode)){1,6})\s*\.\s*style\s*\[\s*(['"])([a-zA-Z-]+)\2\s*\]\s*=\s*(['"])((?:\\.|(?!\4)[\s\S])*)\4\s*;?/g;
    while ((match = bracketAssignmentRe.exec(source))) remember(match[1], match[3], match[5]);

    return [...grouped.values()].map(item => {
        const assignments = [...item.assignments.entries()].map(([property, value]) => ({ property, value }));
        return {
            target: item.target,
            assignments,
            originalStyles: capturePseudoStyleState(item.target, new Set(assignments.map(assignment => assignment.property))),
        };
    });
}


// 从原始消息安全回读 this.querySelector('固定选择器').style.xxx = '固定值'。
// 先在原始兔子镜内定位目标，再按 DOM 路径映射到已渲染节点，兼容宿主给 class 自动加前缀。
function parseRawDescendantSelfMutationAssignments(scriptText, rawTrigger, rawRoot, renderedRoot) {
    const source = String(scriptText || '');
    const grouped = new Map();
    if (!source || !rawTrigger?.querySelector || !rawRoot || !renderedRoot) return [];

    const remember = (selector, property, value) => {
        const safeSelector = String(selector || '').trim();
        if (!safeSelector || safeSelector.length > 240 || /[{};]/.test(safeSelector)) return;
        let rawTarget = null;
        try { rawTarget = rawTrigger.querySelector(safeSelector); } catch { return; }
        if (!rawTarget || rawTarget === rawTrigger) return;
        const target = resolveRenderedCounterpart(rawRoot, renderedRoot, rawTarget, '*');
        const normalizedProperty = normalizeStylePropertyName(property);
        const normalizedValue = decodeSafeInlineString(value).trim();
        if (!target?.style || !renderedRoot.contains?.(target) || !normalizedProperty || !normalizedValue) return;
        let entry = grouped.get(target);
        if (!entry) {
            entry = { target, assignments: new Map() };
            grouped.set(target, entry);
        }
        entry.assignments.set(normalizedProperty, normalizedValue);
    };

    let match;
    const dotAssignmentRe = /this\s*\.\s*querySelector\s*\(\s*(['"])((?:\\.|(?!\1)[\s\S]){1,240})\1\s*\)\s*\.\s*style\s*\.\s*([a-zA-Z][\w]*)\s*=\s*(['"])((?:\\.|(?!\4)[\s\S])*)\4\s*;?/g;
    while ((match = dotAssignmentRe.exec(source))) remember(decodeSafeInlineString(match[2]), match[3], match[5]);

    const bracketAssignmentRe = /this\s*\.\s*querySelector\s*\(\s*(['"])((?:\\.|(?!\1)[\s\S]){1,240})\1\s*\)\s*\.\s*style\s*\[\s*(['"])([a-zA-Z-]+)\3\s*\]\s*=\s*(['"])((?:\\.|(?!\5)[\s\S])*)\5\s*;?/g;
    while ((match = bracketAssignmentRe.exec(source))) remember(decodeSafeInlineString(match[2]), match[4], match[6]);


    // opacity=1 / zIndex=10 等不带引号的有限数字赋值。
    const dotNumericAssignmentRe = /this\s*\.\s*querySelector\s*\(\s*(['"])((?:\\.|(?!\1)[\s\S]){1,240})\1\s*\)\s*\.\s*style\s*\.\s*([a-zA-Z][\w]*)\s*=\s*(-?(?:\d+(?:\.\d+)?|\.\d+))\s*;?/g;
    while ((match = dotNumericAssignmentRe.exec(source))) remember(decodeSafeInlineString(match[2]), match[3], match[4]);

    const bracketNumericAssignmentRe = /this\s*\.\s*querySelector\s*\(\s*(['"])((?:\\.|(?!\1)[\s\S]){1,240})\1\s*\)\s*\.\s*style\s*\[\s*(['"])([a-zA-Z-]+)\3\s*\]\s*=\s*(-?(?:\d+(?:\.\d+)?|\.\d+))\s*;?/g;
    while ((match = bracketNumericAssignmentRe.exec(source))) remember(decodeSafeInlineString(match[2]), match[4], match[5]);

    return [...grouped.values()].map(item => {
        const assignments = [...item.assignments.entries()].map(([property, value]) => ({ property, value }));
        return {
            target: item.target,
            assignments,
            originalStyles: capturePseudoStyleState(item.target, new Set(assignments.map(assignment => assignment.property))),
        };
    });
}

function parseSelfMutationProgram(source, trigger, root, rawTrigger = null, rawRoot = null) {
    const script = String(source || '');
    if (!script || !/this\s*\.(?:innerHTML|innerText|textContent|style|nextElementSibling|previousElementSibling|parentElement|parentNode|querySelector)/i.test(script)) return null;

    const activeAssignments = parseInlineStyleAssignments(script);
    const relativeMutations = parseRelativeSelfMutationAssignments(script, trigger, root);
    const descendantMutations = parseRawDescendantSelfMutationAssignments(script, rawTrigger, rawRoot, root);
    const relatedMutations = [...relativeMutations, ...descendantMutations];
    let activeText;
    const textMatch = /this\s*\.\s*(innerHTML|innerText|textContent)\s*=\s*(['"])((?:\\.|(?!\2)[\s\S])*)\2\s*;?/i.exec(script);
    if (textMatch) activeText = parseSafeSelfMutationText(textMatch[1], textMatch[3]);
    if (!activeAssignments.length && activeText == null && !relatedMutations.length) return null;

    const properties = new Set(activeAssignments.map(item => item.property));
    let originalHtml = trigger.innerHTML;
    const encodedBaseline = trigger.getAttribute?.(RAW_SELF_MUTATION_HTML_BASELINE_ATTR) || '';
    if (encodedBaseline) {
        try { originalHtml = decodeURIComponent(encodedBaseline); } catch { originalHtml = trigger.innerHTML; }
    } else {
        try { trigger.setAttribute(RAW_SELF_MUTATION_HTML_BASELINE_ATTR, encodeURIComponent(originalHtml)); } catch {}
    }
    return {
        trigger,
        active: trigger.getAttribute?.(RAW_SELF_MUTATION_ACTIVE_ATTR) === 'true',
        activeAssignments,
        activeText,
        relatedMutations,
        originalHtml,
        originalStyles: capturePseudoStyleState(trigger, properties),
    };
}

function applyRawSelfMutationEntry(entry, active) {
    if (!entry?.trigger) return;
    entry.active = !!active;
    restorePseudoStyleState(entry.trigger, entry.originalStyles);
    for (const mutation of entry.relatedMutations || []) {
        restorePseudoStyleState(mutation.target, mutation.originalStyles);
    }
    if (entry.active) {
        if (entry.activeText != null) entry.trigger.textContent = entry.activeText;
        applyPseudoStyleAssignments(entry.trigger, entry.activeAssignments);
        for (const mutation of entry.relatedMutations || []) {
            applyPseudoStyleAssignments(mutation.target, mutation.assignments);
        }
    } else if (entry.activeText != null) {
        entry.trigger.innerHTML = entry.originalHtml;
    }
    entry.trigger.setAttribute('aria-pressed', entry.active ? 'true' : 'false');
    entry.trigger.setAttribute(RAW_SELF_MUTATION_ACTIVE_ATTR, entry.active ? 'true' : 'false');
}

function installRawMessageSelfMutationRescue(root) {
    if (!root?.querySelectorAll) return 0;
    const rawMessage = getRawAssistantMessageForRenderedRoot(root);
    const rawRoot = chooseMatchingRawRabbitMirrorRoot(rawMessage, root);
    if (!rawRoot?.querySelectorAll) return 0;

    let state = rawSelfMutationRescueStates.get(root);
    if (!state) {
        state = { entries: new Map() };
        rawSelfMutationRescueStates.set(root, state);
    }

    let installed = 0;
    for (const rawTrigger of rawRoot.querySelectorAll('[onclick]')) {
        const source = rawTrigger.getAttribute('onclick') || '';
        if (!/this\s*\.(?:innerHTML|innerText|textContent|style|nextElementSibling|previousElementSibling|parentElement|parentNode|querySelector)/i.test(source)) continue;
        const renderedTrigger = resolveRenderedCounterpart(rawRoot, root, rawTrigger, 'div, span, section, article, figure, aside, button');
        if (!renderedTrigger || state.entries.has(renderedTrigger)) continue;
        const entry = parseSelfMutationProgram(source, renderedTrigger, root, rawTrigger, rawRoot);
        if (!entry) continue;

        state.entries.set(renderedTrigger, entry);
        preparePseudoTrigger(renderedTrigger);
        const toggle = event => {
            if (event?.type === 'click' && shouldIgnorePseudoToggleEvent(event, renderedTrigger)) return;
            if (event?.type === 'keydown') {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
            }
            event?.preventDefault?.();
            applyRawSelfMutationEntry(entry, !entry.active);
        };
        renderedTrigger.addEventListener('click', toggle, false);
        renderedTrigger.addEventListener('keydown', toggle, false);
        renderedTrigger.setAttribute(RAW_SELF_MUTATION_RESCUE_ATTR, 'true');
        installed += 1;
    }
    if (installed || state.entries.size) root.dataset.rabbitMirrorSelfMutationFallback = 'true';
    return installed;
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
    if (actions.some(action => action?.type === 'class-state')) {
        trigger.setAttribute(DIRECT_ID_CLASS_STATE_RESCUE_ATTR, 'true');
    }
    return true;
}

function installRawMessageDirectIdClickProgramRescue(root) {
    if (!root?.querySelectorAll) return 0;
    const rawMessage = getRawAssistantMessageForRenderedRoot(root);
    const rawRoot = chooseMatchingRawRabbitMirrorRoot(rawMessage, root);
    if (!rawRoot?.querySelectorAll) return 0;

    let installed = 0;
    for (const rawTrigger of rawRoot.querySelectorAll('[onclick]')) {
        const renderedTrigger = resolveRenderedCounterpart(rawRoot, root, rawTrigger, '*');
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
        const renderedInput = resolveRenderedCounterpart(rawRoot, root, rawInput, 'input[type="checkbox"], input[type="radio"]');
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
    if (!root?.querySelectorAll) return { checked: false, hover: false, details: false, target: false, pseudo: false, listDetail: false, maskReveal: false, buttonAdjacent: false, clickableAdjacent: false, clickablePopup: false, containerReveal: false, selfMutation: false };
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
        maskReveal: hasRenderedMaskRevealCandidates(root),
        buttonAdjacent: hasRenderedButtonAdjacentHiddenCandidates(root),
        clickableAdjacent: hasRenderedClickableAdjacentHiddenCandidates(root),
        clickablePopup: hasRenderedClickableAdjacentPopupCandidates(root),
        containerReveal: hasRenderedContainerInternalRevealCandidates(root),
        selfMutation: (rawSelfMutationRescueStates.get(root)?.entries?.size || 0) > 0,
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

function repairMarkdownEmphasisInsideCssComments(cssText) {
    let changed = false;
    const repaired = String(cssText || '').replace(
        /\/\*([\s\S]*?)<(em|i)>\s*\/([\s\S]*?)\/\s*<\/\2>([\s\S]*?)\*\//gi,
        (full, before, tagName, rules, after) => {
            if (!/[{}]/.test(rules) || !/[.#:@\[]/.test(rules)) return full;
            changed = true;
            return `/*${before}*/${rules}/*${after}*/`;
        },
    );
    return { changed, repaired };
}

function repairMarkdownCorruptedCssComments(root) {
    if (!root?.querySelectorAll) return 0;
    let repairedCount = 0;
    for (const style of root.querySelectorAll('style')) {
        const current = String(style.textContent || '');
        if (!/<(?:em|i)>\s*\//i.test(current) || !/\/\s*<\/(?:em|i)>/i.test(current)) continue;
        const result = repairMarkdownEmphasisInsideCssComments(current);
        if (!result.changed || result.repaired === current) continue;
        style.textContent = result.repaired;
        style.setAttribute(MARKDOWN_CSS_COMMENT_RESCUE_ATTR, 'true');
        repairedCount += 1;
    }
    if (repairedCount) root.dataset.rabbitMirrorMarkdownCssCommentRescue = String(repairedCount);
    return repairedCount;
}

function installIntelligentInteractionRescue(root) {
    // Markdown 可能把相邻的 CSS 注释边界 */ ... /* 解析成 <em>/ ... /</em>，
    // 导致两段注释之间的状态规则被整段吞入注释。只在急救开启后修复当前 DOM 的明确损坏形态。
    repairMarkdownCorruptedCssComments(root);

    // SillyTavern/DOMPurify 可能在渲染前移除 onclick。此时从当前消息的原始 HTML
    // 回读安全可解析的 getElementById 样式/文字赋值，并按同一 DOM 路径绑定到渲染节点。
    installRawMessageDirectIdClickProgramRescue(root);
    // 回读只改写触发元素自身的安全 onclick（文字/样式），并改造成可逆点击。
    installRawMessageSelfMutationRescue(root);
    // 同样从原始消息回读受限的 onchange 状态程序，覆盖宿主已删除事件属性的情况。
    installRawMessageCheckedChangeProgramRescue(root);

    const capabilities = detectInteractionCapabilities(root);
    if (capabilities.checked) {
        // 模型常把 checkbox/radio 的可保持状态误写成 :focus ~ ...。
        // 仅在当前兔子镜内复制为唯一 input ID 的 :checked 规则；普通 focus 视觉不受影响。
        refreshFocusToCheckedRescue(root);
        strengthenRabbitMirrorCheckedStateCss(root);
        // 优先解析 checkbox/radio 中安全的 ID 目标条件显隐；绑定到 input/change，
        // 避免 label 兜底只切换 checked、却不触发原 onclick 的情况。
        installRenderedCheckedIdTargetRescue(root);
        // 先从已渲染的安全 DOM 识别前景/隐藏层，再由 label 兜底触发 input/change。
        // 此路径完全不依赖已被宿主删除的 onclick/onchange。
        installRenderedStateLayerRescue(root);
        // 补救 label 后方的多段隐藏内容（如 querySelectorAll(...)[0/1]），不依赖事件原文。
        installRenderedAdjacentHiddenGroupRescue(root);
        // 补救 checkbox/radio 与单块隐藏正文同处 label 内的结构。
        installRenderedLabelInternalHiddenRescue(root);
        // 补救 label 后方紧邻的单块结果层，并可选增强同画布内的零尺寸视觉主体。
        installRenderedLabelAdjacentResultRescue(root);
        installInteractionLabelFallback(root);
    }
    // 普通 button 后紧邻隐藏内容时，先建立真实揭示路线，避免只被归类为 hover 颜色反馈。
    if (capabilities.buttonAdjacent) installRenderedButtonAdjacentHiddenRescue(root);
    // 普通 cursor:pointer 容器后紧邻 display:none 正文时，不再错误要求弹层必须带关闭按钮。
    if (capabilities.clickableAdjacent) installRenderedClickableAdjacentHiddenRescue(root);
    if (capabilities.clickablePopup) installRenderedClickableAdjacentPopupRescue(root);
    if (capabilities.hover) refreshTouchHoverRescue(root);
    if (capabilities.target) refreshTargetRescue(root);
    if (capabilities.details) installNestedDetailsFallback(root);
    if (capabilities.pseudo) installPseudoInteractionRescue(root);
    // 遮罩类优先于普通容器内揭示，避免同一画面被两条路线重复接管。
    if (capabilities.maskReveal) installRenderedMaskRevealRescue(root);
    if (capabilities.containerReveal) installRenderedContainerInternalRevealRescue(root);
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
        // 按钮后置隐藏内容已经由可逆揭示路线接管；不要再叠加持久 hover 状态。
        if (hoverTarget.hasAttribute?.(RENDERED_BUTTON_ADJACENT_HIDDEN_RESCUE_ATTR)
            || hoverTarget.hasAttribute?.(RENDERED_CLICKABLE_ADJACENT_POPUP_RESCUE_ATTR)) return;

        const isActive = hoverTarget.getAttribute(TOUCH_HOVER_ATTR) === 'true';
        if (isActive) hoverTarget.removeAttribute(TOUCH_HOVER_ATTR);
        else hoverTarget.setAttribute(TOUCH_HOVER_ATTR, 'true');
    }, false);

    toto.dataset.rabbitMirrorTouchHoverFallback = 'true';
}

function installInteractionLabelFallback(toto) {
    if (!toto || interactionLabelFallbackRoots.has(toto)) return;

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
        const intendedChecked = input.type === 'radio' ? true : !previous;
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
        const renderedRoute = getRenderedInputRoute(input);
        if (renderedRoute) {
            // 结构型急救已经保存了不可变原始基线；不要再让通用 :checked 内联兜底重复写同一目标。
            // 多路线叠加是“打开后无法恢复”的主要来源之一。
            restoreInteractionInlineOverrides(input);
        } else {
            const textRuleCount = applyCheckedRuleTextFallback(toto, input);
            // 仅在文本解析没有命中时再尝试 CSSOM（例如规则位于复杂 @media 内）。
            if (!textRuleCount) applyCheckedRuleInlineFallback(toto, input);
        }

        if (previous !== input.checked) {
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // 某些移动 WebView 会在捕获阶段 preventDefault 后仍执行一次迟到的原生 label 切换，
        // 使 checkbox 刚被急救器设为 true 又立刻回到 false。下一任务强制确认本次意图，
        // 仅在状态被回滚时补发一次 input/change，不造成正常环境的双重切换。
        setTimeout(() => {
            if (!input.isConnected || input.checked === intendedChecked) return;
            input.checked = intendedChecked;
            restoreInteractionInlineOverrides(input);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }, 0);
    }, true);

    interactionLabelFallbackRoots.add(toto);
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



// 一次性交互诊断：仅在用户按下“开始一次交互诊断”后，临时监听聊天区的下一次交互。
// 捕获一个兔子镜后只读取该条内容，并在约 650ms 后自动停止全部诊断监听。
const INTERACTION_DIAGNOSTIC_PANEL_ATTR = 'data-rabbit-mirror-interaction-diagnostic';
const INTERACTION_DIAGNOSTIC_VERSION = '0.32.54-TEST-ONESHOT';
const DIAGNOSTIC_WAIT_TIMEOUT_MS = 45000;
const DIAGNOSTIC_SOURCE_LIMIT = 60000;
const interactionDiagnosticStates = new WeakMap();
let oneShotInteractionDiagnosticSession = null;

function diagnosticCompactText(value, maxLength = 80) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function diagnosticComputedStyle(element) {
    try {
        return typeof getComputedStyle === 'function' ? getComputedStyle(element) : null;
    } catch {
        return null;
    }
}

function diagnosticRect(element) {
    try {
        const rect = element?.getBoundingClientRect?.();
        if (!rect) return { width: 0, height: 0 };
        return {
            width: Math.round(rect.width * 10) / 10,
            height: Math.round(rect.height * 10) / 10,
        };
    } catch {
        return { width: 0, height: 0 };
    }
}

function diagnosticElementName(element) {
    if (!element) return '(none)';
    const tag = String(element.tagName || 'node').toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = getClassTokens(element).slice(0, 3).map(token => `.${token}`).join('');
    return `${tag}${id}${classes}`;
}

function diagnosticFindClippingAncestor(element, root) {
    let current = element?.parentElement || null;
    for (let depth = 0; current && depth < 7; depth += 1, current = current.parentElement) {
        if (current.closest?.(`[${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`)) return null;
        const style = diagnosticComputedStyle(current);
        const overflow = `${style?.overflow || ''}/${style?.overflowX || ''}/${style?.overflowY || ''}`.toLowerCase();
        const rect = diagnosticRect(current);
        if (/(?:hidden|clip)/.test(overflow) || rect.height <= 1) {
            return `${diagnosticElementName(current)} height=${rect.height}px overflow=${overflow}`;
        }
        if (current === root) break;
    }
    return null;
}

function diagnosticCollectTargets(root) {
    if (!root?.querySelectorAll) return [];
    const selectors = [
        '.hidden-thought',
        '[class*="hidden"]',
        '[class*="reveal"]',
        '[class*="secret"]',
        '[style*="opacity: 0"]',
        '[style*="opacity:0"]',
        '[style*="display: none"]',
        '[style*="display:none"]',
        '[style*="max-height: 0"]',
        '[style*="max-height:0"]',
        '[style*="height: 0"]',
        '[style*="height:0"]',
    ];
    const seen = new Set();
    const result = [];
    for (const element of root.querySelectorAll(selectors.join(','))) {
        if (element.closest?.(`[${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`)) continue;
        const tagName = String(element.tagName || '').toLowerCase();
        if (/^(?:input|select|textarea|option|button|label|style|script|template)$/.test(tagName)) continue;
        if (seen.has(element)) continue;
        seen.add(element);
        result.push(element);
        if (result.length >= 12) break;
    }
    return result;
}

function diagnosticRouteSummary(root) {
    return {
        adjacent: renderedAdjacentHiddenGroupRescueStates.get(root)?.entries?.size || 0,
        layers: renderedStateLayerRescueStates.get(root)?.entries?.size || 0,
        labelInternal: renderedLabelInternalHiddenRescueStates.get(root)?.entries?.size || 0,
        labelAdjacent: renderedLabelAdjacentResultRescueStates.get(root)?.entries?.size || 0,
        maskReveal: renderedMaskRevealRescueStates.get(root)?.hosts?.size || 0,
        listDetail: renderedListDetailRescueStates.get(root)?.entries?.size || 0,
        buttonAdjacent: renderedButtonAdjacentHiddenRescueStates.get(root)?.entries?.size || 0,
        clickableAdjacent: renderedClickableAdjacentHiddenRescueStates.get(root)?.entries?.size || 0,
        clickablePopup: renderedClickableAdjacentPopupRescueStates.get(root)?.entries?.size || 0,
        checkedIdTarget: renderedCheckedIdTargetRescueStates.get(root)?.entries?.size || 0,
        focusToChecked: Number.parseInt(root?.getAttribute?.(FOCUS_TO_CHECKED_ROOT_ATTR) || '0', 10) || 0,
        checkedTextRule: root?.querySelectorAll?.(`[${CHECKED_TEXT_RULE_RESCUE_ATTR}]`)?.length || 0,
        expandedOpacity: root?.querySelectorAll?.(`[${EXPANDED_OPACITY_RESCUE_ATTR}]`)?.length || 0,
        containerReveal: renderedContainerInternalRevealStates.get(root)?.entries?.size || 0,
        selfMutation: rawSelfMutationRescueStates.get(root)?.entries?.size || 0,
        classStateProgram: root?.querySelectorAll?.(`[${DIRECT_ID_CLASS_STATE_RESCUE_ATTR}]`)?.length || 0,
        cssCommentRepair: root?.querySelectorAll?.(`[${MARKDOWN_CSS_COMMENT_RESCUE_ATTR}]`)?.length || 0,
        changeProgram: root?.querySelectorAll?.(`[${CHANGE_PSEUDO_RESCUE_ATTR}]`)?.length || 0,
    };
}

function diagnosticInferReason(root, inputs, targets) {
    const routes = diagnosticRouteSummary(root);
    const routeCount = routes.adjacent + routes.layers + routes.labelInternal + routes.labelAdjacent + routes.maskReveal + routes.listDetail + routes.buttonAdjacent + routes.clickableAdjacent + routes.clickablePopup + routes.checkedIdTarget + routes.focusToChecked + routes.checkedTextRule + routes.expandedOpacity + routes.containerReveal + routes.selfMutation + routes.classStateProgram + routes.cssCommentRepair + routes.changeProgram;
    const checkedInputs = inputs.filter(input => input.checked);
    const visibleTargets = targets.filter(target => {
        const style = diagnosticComputedStyle(target);
        const rect = diagnosticRect(target);
        const opacity = Number.parseFloat(style?.opacity || '1');
        return style?.display !== 'none' && style?.visibility !== 'hidden' && opacity > 0.05 && rect.height > 0;
    });

    if (!inputs.length && routeCount && visibleTargets.length) return '非表单交互急救路线已建立，候选内容在计算样式中已有可见项。';
    if (!inputs.length && routeCount) return '非表单交互急救路线已建立，但候选内容最终仍不可见：样式可能被覆盖或被布局裁切。';
    if (!inputs.length) return '未找到 checkbox/radio：渲染后控件可能被删除，或当前交互并非表单状态结构。';
    if (!checkedInputs.length) return '捕获结束时没有勾选控件；可能发生了重复切换，或当前交互使用了其他状态机制。';
    if (!routeCount && targets.length) return 'checkbox 已切换，但没有任何渲染后急救路线建立：当前结构识别条件未命中。';
    if (routeCount && !visibleTargets.length) return '急救路线已建立，但候选内容最终仍不可见：样式可能未执行、被宿主覆盖，或被布局裁切。';
    if (visibleTargets.length) return '候选内容在计算样式中已有可见项；若屏幕仍看不到，请重点查看高度、裁切和时间快照。';
    return '尚无法自动归因，请连同源码与实际渲染代码一起反馈。';
}

function captureInteractionDiagnosticSnapshot(root, state, label) {
    if (!root || !state) return;
    const targets = diagnosticCollectTargets(root).slice(0, 6);
    const inputs = [...root.querySelectorAll('input[type="checkbox"], input[type="radio"]')].slice(0, 6);
    const targetSummary = targets.map((target, index) => {
        const computed = diagnosticComputedStyle(target);
        const rect = diagnosticRect(target);
        return `${index}:${diagnosticElementName(target)} opacity=${computed?.opacity || '?'} display=${computed?.display || '?'} height=${rect.height}px`;
    }).join(' | ');
    const inputSummary = inputs.map((input, index) => `${index}:${diagnosticElementName(input)}=${!!input.checked}`).join(' | ');
    state.snapshots.push(`${label} inputs[${inputSummary || 'none'}] targets[${targetSummary || 'none'}]`);
    if (state.snapshots.length > 6) state.snapshots.splice(0, state.snapshots.length - 6);
}

function buildInteractionDiagnosticText(root, state, phase = 'capture complete') {
    const inputs = [...root.querySelectorAll('input[type="checkbox"], input[type="radio"]')].slice(0, 8);
    const labels = [...root.querySelectorAll('label')].filter(label => !label.closest?.(`[${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`));
    const targets = diagnosticCollectTargets(root);
    const routes = diagnosticRouteSummary(root);
    const title = diagnosticCompactText(root.querySelector('summary')?.textContent, 64);
    const lines = [
        `RabbitMirror Interaction Diagnostic ${INTERACTION_DIAGNOSTIC_VERSION}`,
        `标题: ${title || '(未找到 summary)'}`,
        `阶段: ${phase}`,
        `诊断模式: 一次性捕获（已自动停止）`,
        `智能交互急救开关: ${isInteractionRescueModeEnabled() ? 'ON' : 'OFF'}`,
        `根节点: ${diagnosticElementName(root)} / connected=${!!root.isConnected}`,
        `labels=${labels.length} inputs=${inputs.length} hiddenCandidates=${targets.length}`,
        `相邻隐藏组 entries=${routes.adjacent} listener=${root.dataset.rabbitMirrorAdjacentHiddenGroupFallback || 'false'}`,
        `双层状态 entries=${routes.layers} listener=${root.dataset.rabbitMirrorRenderedStateLayerFallback || 'false'}`,
        `label内隐藏 entries=${routes.labelInternal} listener=${root.dataset.rabbitMirrorLabelInternalHiddenFallback || 'false'}`,
        `label后置结果 entries=${routes.labelAdjacent} listener=${root.dataset.rabbitMirrorLabelAdjacentResultFallback || 'false'}`,
        `遮罩揭示 entries=${routes.maskReveal} listener=${routes.maskReveal ? 'true' : 'false'}`,
        `列表详情 entries=${routes.listDetail} listener=${root.dataset.rabbitMirrorRenderedListDetailFallback || 'false'}`,
        `按钮后置内容 entries=${routes.buttonAdjacent} listener=${root.dataset.rabbitMirrorButtonAdjacentHiddenFallback || 'false'}`,
        `可点击后置内容 entries=${routes.clickableAdjacent} listener=${root.dataset.rabbitMirrorClickableAdjacentHiddenFallback || 'false'}`,
        `可点击画面弹层 entries=${routes.clickablePopup} listener=${root.dataset.rabbitMirrorClickableAdjacentPopupFallback || 'false'}`,
        `ID目标显隐 entries=${routes.checkedIdTarget} listener=${root.dataset.rabbitMirrorCheckedIdTargetFallback || 'false'}`,
        `focus→checked entries=${routes.focusToChecked} listener=${routes.focusToChecked ? 'true' : 'false'}`,
        `CSS状态规则 entries=${routes.checkedTextRule} listener=${routes.checkedTextRule ? 'true' : 'false'}`,
        `展开透明保全 entries=${routes.expandedOpacity} listener=${routes.expandedOpacity ? 'true' : 'false'}`,
        `容器内揭示 entries=${routes.containerReveal} listener=${root.dataset.rabbitMirrorContainerInternalRevealFallback || 'false'}`,
        `元素自变化 entries=${routes.selfMutation} listener=${root.dataset.rabbitMirrorSelfMutationFallback || 'false'}`,
        `类名状态程序 entries=${routes.classStateProgram} listener=${routes.classStateProgram ? 'true' : 'false'}`,
        `CSS注释保全 entries=${routes.cssCommentRepair} listener=${routes.cssCommentRepair ? 'true' : 'false'}`,
        `安全状态程序 entries=${routes.changeProgram} listener=${routes.changeProgram ? 'true' : 'false'}`,
        `label fallback=${root.dataset.rabbitMirrorLabelFallback || root.dataset.rabbitMirrorCheckedFallback || 'unknown'}`,
        '',
        '[捕获事件]',
    ];

    if (!state.events.length) lines.push('（未捕获 click / input / change）');
    else state.events.slice(-16).forEach(item => lines.push(item));

    lines.push('', '[时间快照]');
    if (!state.snapshots.length) lines.push('（无）');
    else state.snapshots.forEach(item => lines.push(item));

    lines.push('', '[输入控件]');
    if (!inputs.length) lines.push('（无）');
    inputs.forEach((input, index) => {
        const label = input.closest('label');
        lines.push(
            `${index}: ${diagnosticElementName(input)} type=${input.type} checked=${!!input.checked}`,
            `   label=${!!label} text="${diagnosticCompactText(label?.textContent, 68)}"`,
            `   attrs: route=${getRenderedInputRoute(input) || 'none'} adjacent=${input.getAttribute(RENDERED_ADJACENT_HIDDEN_GROUP_RESCUE_ATTR) || 'false'} layer=${input.getAttribute(RENDERED_STATE_LAYER_RESCUE_ATTR) || 'false'} labelInternal=${input.getAttribute(RENDERED_LABEL_INTERNAL_HIDDEN_RESCUE_ATTR) || 'false'} labelAdjacent=${input.getAttribute(RENDERED_LABEL_ADJACENT_RESULT_RESCUE_ATTR) || 'false'} idTarget=${input.getAttribute(RENDERED_CHECKED_ID_TARGET_RESCUE_ATTR) || 'false'} cssChecked=${input.getAttribute(CHECKED_TEXT_RULE_RESCUE_ATTR) || 'false'} expandedOpacity=${input.getAttribute(EXPANDED_OPACITY_RESCUE_ATTR) || 'false'} change=${input.getAttribute(CHANGE_PSEUDO_RESCUE_ATTR) || 'false'}`,
        );
    });

    lines.push('', '[疑似隐藏内容]');
    if (!targets.length) lines.push('（无）');
    targets.forEach((target, index) => {
        const computed = diagnosticComputedStyle(target);
        const rect = diagnosticRect(target);
        const parentRect = diagnosticRect(target.parentElement);
        const clipping = diagnosticFindClippingAncestor(target, root);
        lines.push(
            `${index}: ${diagnosticElementName(target)} text="${diagnosticCompactText(target.textContent, 70)}"`,
            `   inline: opacity=${getInlineStyleValue(target, 'opacity') || '(empty)'} display=${getInlineStyleValue(target, 'display') || '(empty)'} visibility=${getInlineStyleValue(target, 'visibility') || '(empty)'} transform=${getInlineStyleValue(target, 'transform') || '(empty)'} height=${getInlineStyleValue(target, 'height') || '(empty)'} maxHeight=${getInlineStyleValue(target, 'max-height') || '(empty)'}`,
            `   computed: opacity=${computed?.opacity || '?'} display=${computed?.display || '?'} visibility=${computed?.visibility || '?'} height=${rect.height}px parentHeight=${parentRect.height}px`,
            `   clipping: ${clipping || '未发现明显裁切祖先'}`,
        );
    });

    lines.push('', `[初步判断] ${diagnosticInferReason(root, inputs, targets)}`);
    return lines.join('\n');
}

function diagnosticLimitSource(text, maxLength = DIAGNOSTIC_SOURCE_LIMIT) {
    let source = String(text || '');
    source = source
        .replace(/data:[^"'<>\s]{240,}/gi, match => `${match.slice(0, 72)}…[资源内容已省略]`)
        .replace(/[A-Za-z0-9+/]{600,}={0,2}/g, '[超长编码内容已省略]');
    if (source.length <= maxLength) return source;
    return `${source.slice(0, maxLength)}\n<!-- 已截断：原长度 ${source.length} 字符 -->`;
}

function getDiagnosticRawSource(root) {
    const rawMessage = getRawAssistantMessageForRenderedRoot(root);
    const rawRoot = chooseMatchingRawRabbitMirrorRoot(rawMessage, root);
    if (rawRoot?.outerHTML) return diagnosticLimitSource(rawRoot.outerHTML);
    const match = String(rawMessage || '').match(TOTO_BLOCK_SINGLE_RE);
    return diagnosticLimitSource(match?.[0] || rawMessage || '（未能从宿主聊天数据中取得原始兔子镜源码）');
}

function getDiagnosticRenderedSource(root) {
    try {
        const clone = root.cloneNode(true);
        if (clone.matches?.(`[${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`)) return '（当前根节点为诊断面板，无法复制兔子镜）';
        clone.querySelectorAll?.(`[${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`).forEach(panel => panel.remove());
        return diagnosticLimitSource(clone.outerHTML || '（无法序列化实际渲染代码）');
    } catch {
        return '（无法序列化实际渲染代码）';
    }
}

function buildInteractionDiagnosticClipboardText(root, state) {
    const report = state.report || buildInteractionDiagnosticText(root, state, 'capture complete');
    return [
        report,
        '',
        '[隐私提醒] 以下源码包含当前这一条兔子镜中的文字内容；请确认后再发送给他人。超长资源与编码内容会自动省略。',
        '',
        '[原始兔子镜源码]',
        getDiagnosticRawSource(root),
        '',
        '[实际渲染代码]',
        getDiagnosticRenderedSource(root),
    ].join('\n');
}

async function copyDiagnosticText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const ok = document.execCommand('copy');
            textarea.remove();
            return !!ok;
        } catch {
            return false;
        }
    }
}

function removeInteractionDiagnostic(root) {
    const state = interactionDiagnosticStates.get(root);
    state?.panel?.remove?.();
    interactionDiagnosticStates.delete(root);
    root?.querySelectorAll?.(`[${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`).forEach(panel => panel.remove());
}

function removeAllInteractionDiagnosticPanels() {
    const chatRoot = getChatRoot();
    chatRoot?.querySelectorAll?.(`[${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`).forEach(panel => panel.remove());
}

function createOneShotInteractionDiagnosticPanel(root, state) {
    if (!root?.isConnected || state.panel?.isConnected) return;
    const panel = document.createElement('div');
    panel.setAttribute(INTERACTION_DIAGNOSTIC_PANEL_ATTR, 'true');
    panel.style.cssText = [
        'position:relative', 'z-index:2147483000', 'display:block', 'box-sizing:border-box',
        'margin:16px 8px 8px', 'padding:12px', 'border:3px solid #facc15', 'border-radius:8px',
        'background:#111827', 'color:#f9fafb', 'box-shadow:0 0 0 2px #ef4444 inset',
        'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace', 'font-size:11px', 'line-height:1.45',
        'white-space:normal', 'overflow:auto', 'max-height:520px',
    ].join(';');

    const heading = document.createElement('div');
    heading.textContent = '【一次性交互诊断｜捕获完成后自动停止】';
    heading.style.cssText = 'font-weight:800;color:#fde047;margin-bottom:8px;';

    const privacy = document.createElement('div');
    privacy.textContent = '仅诊断当前点击的这一条兔子镜。复制时会附带该条源码与实际渲染代码；不会自动上传。';
    privacy.style.cssText = 'color:#cbd5e1;margin-bottom:8px;font-size:10px;';

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;';
    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.textContent = '复制诊断＋代码';
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '关闭报告';
    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.textContent = '重新诊断';
    for (const button of [copyButton, closeButton, retryButton]) {
        button.style.cssText = 'cursor:pointer;padding:5px 10px;border:1px solid #fde047;border-radius:5px;background:#1f2937;color:#fff;';
    }
    actions.append(copyButton, closeButton, retryButton);

    const pre = document.createElement('pre');
    pre.textContent = '正在捕获本次交互，请稍候约半秒……';
    pre.style.cssText = 'margin:0;white-space:pre-wrap;word-break:break-word;color:#f3f4f6;background:transparent;border:0;padding:0;';
    panel.append(heading, privacy, actions, pre);

    const outerDetails = root.matches?.('details') ? root : root.querySelector(':scope > details');
    (outerDetails || root).appendChild(panel);
    Object.assign(state, { panel, pre, copyButton, closeButton, retryButton });

    copyButton.addEventListener('click', async event => {
        event.preventDefault();
        event.stopPropagation();
        const original = copyButton.textContent;
        copyButton.textContent = '正在整理源码…';
        const ok = await copyDiagnosticText(buildInteractionDiagnosticClipboardText(root, state));
        copyButton.textContent = ok ? '已复制' : '复制失败，请截图';
        setTimeout(() => { if (copyButton.isConnected) copyButton.textContent = original; }, 1400);
    });
    closeButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        removeInteractionDiagnostic(root);
    });
    retryButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        removeInteractionDiagnostic(root);
        triggerInteractionDiagnosticOnce();
    });
}

function getDiagnosticRootFromTarget(target) {
    if (!target?.closest) return null;
    if (target.closest(`[${INTERACTION_DIAGNOSTIC_PANEL_ATTR}]`)) return null;
    const toto = target.closest(MIRROR_TOTO_SELECTOR);
    if (toto && isInsideChatMessage(toto)) return toto;
    const details = target.closest('details');
    if (details && isRabbitMirrorDetails(details) && isInsideChatMessage(details)) return details;
    return null;
}

function stopOneShotInteractionDiagnosticSession() {
    const session = oneShotInteractionDiagnosticSession;
    if (!session) return;
    for (const [type, handler] of Object.entries(session.handlers || {})) {
        session.chatRoot?.removeEventListener?.(type, handler, true);
    }
    for (const timer of session.timers || []) clearTimeout(timer);
    oneShotInteractionDiagnosticSession = null;
}

function finalizeOneShotInteractionDiagnostic(root, state) {
    captureInteractionDiagnosticSnapshot(root, state, '+650ms');
    state.report = buildInteractionDiagnosticText(root, state, 'interaction +650ms');
    if (state.pre?.isConnected) state.pre.textContent = state.report;
    stopOneShotInteractionDiagnosticSession();
}

function handleOneShotInteractionDiagnosticEvent(session, event) {
    const root = getDiagnosticRootFromTarget(event?.target);
    if (!root) return;
    if (session.root && session.root !== root) return;

    if (!session.root) {
        session.root = root;
        removeInteractionDiagnostic(root);
        const state = { events: [], snapshots: [], panel: null, pre: null, report: '' };
        session.state = state;
        interactionDiagnosticStates.set(root, state);
        createOneShotInteractionDiagnosticPanel(root, state);
        captureInteractionDiagnosticSnapshot(root, state, '捕获前');
        for (const [label, delay] of [['+0ms', 0], ['+100ms', 100], ['+500ms', 500]]) {
            session.timers.push(setTimeout(() => captureInteractionDiagnosticSnapshot(root, state, label), delay));
        }
        session.timers.push(setTimeout(() => finalizeOneShotInteractionDiagnostic(root, state), 650));
    }

    const state = session.state;
    const target = event?.target;
    const checked = target?.matches?.('input[type="checkbox"], input[type="radio"]') ? ` checked=${!!target.checked}` : '';
    state.events.push(`${event.type}:capture target=${diagnosticElementName(target)}${checked}`);
    if (state.events.length > 24) state.events.splice(0, state.events.length - 24);
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
        if (enabled || remembered) {
            scopeRabbitMirrorInteractionIds(mirrorRoot);
            mirrorRoot.dataset.rabbitMirrorInteractionRescued = 'true';
        }
    });
}


const DAMAGED_DATA_URI_MESSAGE_ATTR = 'data-rabbit-mirror-damaged-data-uri-rescued';
const DAMAGED_DATA_URI_ROOT_ATTR = 'data-rabbit-mirror-data-uri-rescued';
const INLINE_SVG_DATA_URI_RE = /data:image\/svg\+xml(?:;[^,)]*)?,/i;
const UI_TAG_AFTER_DATA_URI_RE = /<(?:div|section|article|label|input|button|p|span|h[1-6]|ul|ol|li|table|thead|tbody|tfoot|tr|td|th|form|details|summary|figure|figcaption|main|header|footer|nav)\b/i;
const SVG_LEAK_TAGS = new Set([
    'svg', 'defs', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
    'filter', 'feturbulence', 'fecolormatrix', 'fegaussianblur', 'feoffset', 'feblend',
    'fedisplacementmap', 'femerge', 'femergenode', 'mask', 'clippath', 'pattern', 'lineargradient',
    'radialgradient', 'stop', 'text', 'tspan', 'use', 'symbol',
]);

function findLastInlineStyleMatch(tagPrefix) {
    let last = null;
    const re = /\bstyle\s*=\s*(["'])/gi;
    let match;
    while ((match = re.exec(String(tagPrefix || '')))) last = match;
    return last;
}

function findLastBackgroundDeclarationStart(stylePrefix, absoluteStart) {
    let found = -1;
    const re = /(?:^|;)\s*background(?:-image)?\s*:/gi;
    let match;
    while ((match = re.exec(String(stylePrefix || '')))) {
        const declarationOffset = match.index + (match[0].startsWith(';') ? 1 : 0);
        found = absoluteStart + declarationOffset;
    }
    return found;
}

function findNextUiTagStart(text, fromIndex) {
    const source = String(text || '');
    const tail = source.slice(Math.max(0, fromIndex));
    const match = UI_TAG_AFTER_DATA_URI_RE.exec(tail);
    return match ? Math.max(0, fromIndex) + match.index : -1;
}

function countRawUiTags(text) {
    return (String(text || '').match(/<(?:div|section|article|label|input|button|p|span|h[1-6]|ul|ol|li|table|form|details|summary|figure|main|header|footer|nav)\b/gi) || []).length;
}

function parsedElementCount(text) {
    try {
        if (typeof document === 'undefined') return -1;
        const template = document.createElement('template');
        template.innerHTML = String(text || '');
        return template.content.querySelectorAll('*').length;
    } catch {
        return -1;
    }
}

function isLikelyDamagedInlineSvgDataUri(text, candidate) {
    const source = String(text || '');
    const { styleQuote, styleValueStart, uriIndex, nextUiTagIndex } = candidate;
    if (!styleQuote || nextUiTagIndex <= uriIndex) return false;

    const span = source.slice(uriIndex, nextUiTagIndex);
    if (!INLINE_SVG_DATA_URI_RE.test(span)) return false;
    INLINE_SVG_DATA_URI_RE.lastIndex = 0;

    // 只有“inline style 属性中的原始 SVG 文本”才会被接管。
    // 百分号编码或 base64 的健康资源不会匹配 <svg / &lt;svg，因此保持原样。
    if (!/(?:<|&lt;)svg\b/i.test(span)) return false;

    // HTML 属性引号在 data URI 尚未结束前再次出现，说明 SVG 内部引号会提前截断 style 属性。
    // 反斜杠不能转义 HTML 属性引号，因此 \" 同样属于损坏信号。
    const lastParen = span.lastIndexOf(')');
    const quoteIndex = source.indexOf(styleQuote, uriIndex);
    const quoteInsideDataUri = quoteIndex >= 0 && quoteIndex < nextUiTagIndex
        && (lastParen < 0 || quoteIndex <= uriIndex + lastParen);
    const explicitDamageSignal = /\\["']|\\&quot;|&quot;|["']{2}|["']\s*&gt;/i.test(span);

    if (quoteInsideDataUri || explicitDamageSignal) return true;

    // 浏览器可用时再做一次保守判定：原文标签很多，但解析后主体被吞掉。
    const rawCount = countRawUiTags(source);
    const parsedCount = parsedElementCount(source);
    return rawCount >= 6 && parsedCount >= 0 && parsedCount + 4 < rawCount;
}

function removeSurplusSvgClosingTags(text, removedFragment) {
    let output = String(text || '');
    const removedNames = new Set();
    String(removedFragment || '').replace(/<\/?([a-z][\w:-]*)\b/gi, (_full, rawName) => {
        const name = String(rawName || '').toLowerCase();
        if (SVG_LEAK_TAGS.has(name)) removedNames.add(name);
        return _full;
    });

    for (const name of removedNames) {
        const escaped = escapeRegExp(name);
        const openRe = new RegExp(`<${escaped}\\b(?![^>]*\\/>)`, 'gi');
        const closeRe = new RegExp(`</${escaped}\\s*>`, 'gi');
        const opens = (output.match(openRe) || []).length;
        const closes = (output.match(closeRe) || []).length;
        let surplus = Math.max(0, closes - opens);
        if (!surplus) continue;

        output = output.replace(closeRe, match => {
            if (surplus <= 0) return match;
            surplus -= 1;
            return '';
        });
    }
    return output;
}

/**
 * 保全型 data URI 急救：只移除会截断 inline style 属性的损坏 SVG data URI 声明。
 * 不改色、不重写其余 DOM/CSS，也不处理健康的 percent-encoded/base64 资源。
 */
export function rescueDamagedDataUriRabbitMirrorOutput(responseText = '') {
    let text = String(responseText || '');
    if (!/(?:<toto\b|<details\b)/i.test(text) || !/data:image\/svg\+xml/i.test(text)) return text;

    let cursor = 0;
    let repairs = 0;
    while (repairs < 8) {
        const lower = text.toLowerCase();
        const uriIndex = lower.indexOf('data:image/svg+xml', cursor);
        if (uriIndex < 0) break;

        const tagStart = text.lastIndexOf('<', uriIndex);
        const tagEndBeforeUri = text.lastIndexOf('>', uriIndex);
        if (tagStart < 0 || tagEndBeforeUri > tagStart) {
            cursor = uriIndex + 18;
            continue;
        }

        const tagPrefix = text.slice(tagStart, uriIndex);
        const styleMatch = findLastInlineStyleMatch(tagPrefix);
        if (!styleMatch) {
            cursor = uriIndex + 18;
            continue;
        }

        const styleQuote = styleMatch[1];
        const styleValueStart = tagStart + styleMatch.index + styleMatch[0].length;
        const stylePrefix = text.slice(styleValueStart, uriIndex);
        const propertyStart = findLastBackgroundDeclarationStart(stylePrefix, styleValueStart);
        const nextUiTagIndex = findNextUiTagStart(text, uriIndex + 18);
        const candidate = { styleQuote, styleValueStart, uriIndex, nextUiTagIndex };

        if (propertyStart < styleValueStart || nextUiTagIndex < 0 || !isLikelyDamagedInlineSvgDataUri(text, candidate)) {
            cursor = uriIndex + 18;
            continue;
        }

        const removedFragment = text.slice(propertyStart, nextUiTagIndex);
        const safePrefix = text.slice(0, propertyStart).replace(/[ \t]+$/g, '');
        const safeSuffix = text.slice(nextUiTagIndex);
        text = `${safePrefix}${styleQuote}>\n${safeSuffix}`;
        text = removeSurplusSvgClosingTags(text, removedFragment);
        repairs += 1;
        cursor = Math.max(0, propertyStart + 2);
    }

    return text;
}

function setTransientMessageSource(message, repaired) {
    const transientMessage = cloneMessageForTransientRerender(message);
    transientMessage.mes = repaired;

    if (Array.isArray(transientMessage.swipes)) {
        const swipeIndex = Number.isInteger(transientMessage.swipe_id)
            ? transientMessage.swipe_id
            : transientMessage.swipes.length - 1;
        if (typeof transientMessage.swipes[swipeIndex] === 'string') transientMessage.swipes[swipeIndex] = repaired;
    }
    if (typeof transientMessage?.extra?.display_text === 'string') transientMessage.extra.display_text = repaired;
    return transientMessage;
}

function rescueRecentDamagedDataUriMessages(mod = null) {
    if (!isInteractionRescueModeEnabled()) return false;
    const host = mod || hostScriptModule || globalThis;
    let rerendered = false;

    for (const { message, index } of findRecentAssistantMessages(host)) {
        const source = getSelectedMessageSource(message);
        if (!source || !/data:image\/svg\+xml/i.test(source)) continue;
        const repaired = rescueDamagedDataUriRabbitMirrorOutput(source);
        if (!repaired || repaired === source) continue;

        const signature = hashInteractionSignature(`${source}|${repaired}`);
        const currentElement = getRenderedMessageElement(index);
        if (currentElement?.getAttribute(DAMAGED_DATA_URI_MESSAGE_ATTR) === signature) continue;

        const transientMessage = setTransientMessageSource(message, repaired);
        if (!preserveAndRerenderSanitizedMessage(host, index, transientMessage)) continue;

        const restoredElement = getRenderedMessageElement(index);
        restoredElement?.setAttribute(DAMAGED_DATA_URI_MESSAGE_ATTR, signature);
        restoredElement?.querySelectorAll?.('details, toto').forEach(root => {
            root.setAttribute(DAMAGED_DATA_URI_ROOT_ATTR, 'true');
        });
        rerendered = true;
    }
    return rerendered;
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

const plainTextRerenderedSignatures = new Set();

function splitCssVarArguments(value) {
    const source = String(value || '');
    let depth = 0;
    let quote = '';
    for (let index = 0; index < source.length; index += 1) {
        const char = source[index];
        if (quote) {
            if (char === '\\') index += 1;
            else if (char === quote) quote = '';
            continue;
        }
        if (char === '"' || char === "'") {
            quote = char;
            continue;
        }
        if (char === '(') depth += 1;
        else if (char === ')') depth = Math.max(0, depth - 1);
        else if (char === ',' && depth === 0) {
            return [source.slice(0, index).trim(), source.slice(index + 1).trim()];
        }
    }
    return [source.trim(), ''];
}

function replaceCssVarFunctions(value, resolver) {
    const source = String(value || '');
    let output = '';
    let cursor = 0;

    while (cursor < source.length) {
        const match = /var\s*\(/ig.exec(source.slice(cursor));
        if (!match) {
            output += source.slice(cursor);
            break;
        }

        const start = cursor + match.index;
        const open = start + match[0].lastIndexOf('(');
        output += source.slice(cursor, start);

        let depth = 1;
        let quote = '';
        let end = open + 1;
        for (; end < source.length; end += 1) {
            const char = source[end];
            if (quote) {
                if (char === '\\') end += 1;
                else if (char === quote) quote = '';
                continue;
            }
            if (char === '"' || char === "'") {
                quote = char;
                continue;
            }
            if (char === '(') depth += 1;
            else if (char === ')') {
                depth -= 1;
                if (depth === 0) break;
            }
        }

        if (depth !== 0) {
            output += source.slice(start);
            break;
        }

        const [name, fallback] = splitCssVarArguments(source.slice(open + 1, end));
        const resolved = resolver(name, fallback);
        output += resolved;
        cursor = end + 1;
    }

    return output;
}

function collectCssCustomPropertyValuesFromHtml(htmlText) {
    const html = String(htmlText || '');
    const values = new Map();
    const collect = (cssSource) => {
        const declarationRe = /(?:^|[;{])\s*(--[^\s:;{}]+)\s*:\s*([^;{}]*?)(?=;|})/g;
        let match;
        while ((match = declarationRe.exec(String(cssSource || '')))) {
            const name = String(match[1] || '').trim();
            const value = String(match[2] || '').trim();
            if (name && value) values.set(name, value);
        }
    };

    html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (full, css = '') => {
        collect(css);
        return full;
    });
    html.replace(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/gi, (full, quote, css = '') => {
        collect(`{${css}}`);
        return full;
    });
    return values;
}

function expandUnsupportedCssCustomProperties(cssText, inheritedValues = null) {
    const source = String(cssText || '');
    if (!/(?:^|[;{])\s*--[^\s:;{}]+\s*:|var\s*\(/i.test(source)) return source;

    const values = new Map(inheritedValues instanceof Map ? inheritedValues : []);
    const declarationRe = /(^|[;{])\s*(--[^\s:;{}]+)\s*:\s*([^;{}]*?)(?=;|})/g;
    let match;
    while ((match = declarationRe.exec(source))) {
        const name = String(match[2] || '').trim();
        const value = String(match[3] || '').trim();
        if (name && value) values.set(name, value);
    }

    const resolvedCache = new Map();
    const resolveName = (name, stack = new Set()) => {
        const key = String(name || '').trim();
        if (!key.startsWith('--')) return '';
        if (resolvedCache.has(key)) return resolvedCache.get(key);
        if (stack.has(key)) return '';
        const raw = values.get(key);
        if (raw === undefined) return '';

        const nextStack = new Set(stack);
        nextStack.add(key);
        const resolved = replaceCssVarFunctions(raw, (nestedName, fallback) => {
            const nested = resolveName(nestedName, nextStack);
            if (nested) return nested;
            if (fallback) {
                return replaceCssVarFunctions(fallback, (fallbackName, nestedFallback) => {
                    const fallbackResolved = resolveName(fallbackName, nextStack);
                    return fallbackResolved || nestedFallback || `var(${fallbackName})`;
                });
            }
            return `var(${nestedName})`;
        }).trim();
        resolvedCache.set(key, resolved);
        return resolved;
    };

    // 删除宿主旧 CSS 解析器不识别的 --自定义属性声明，保留前导 { / ; 作为声明边界。
    let repaired = source.replace(declarationRe, (full, boundary) => boundary || '');
    repaired = repaired.replace(/\{\s*(?:;\s*)+/g, '{');
    repaired = replaceCssVarFunctions(repaired, (name, fallback) => {
        const resolved = resolveName(name);
        if (resolved) return resolved;
        if (fallback) {
            return replaceCssVarFunctions(fallback, (fallbackName, nestedFallback) => {
                const fallbackResolved = resolveName(fallbackName);
                return fallbackResolved || nestedFallback || `var(${fallbackName})`;
            });
        }
        // 无法可靠解析时保留原 var()，绝不再用 initial 覆盖健康 UI 的颜色与背景。
        return `var(${name})`;
    });

    return repaired;
}

function repairLikelyBareRootSelector(cssText, htmlText) {
    let css = String(cssText || '');
    const html = String(htmlText || '');
    const classTokens = [];
    const classRe = /\sclass\s*=\s*(["'])([^"']+)\1/gi;
    let classMatch;
    while ((classMatch = classRe.exec(html))) {
        String(classMatch[2] || '').split(/\s+/).forEach(token => {
            if (/^rabbit-scenery-[a-z0-9_-]+$/i.test(token)) classTokens.push(token);
        });
    }

    for (const className of classTokens) {
        if (new RegExp(`\\.${escapeRegExp(className)}\\s*\\{`, 'i').test(css)) continue;
        const suffix = className.replace(/^rabbit-scenery-/i, '');
        const candidates = [className, suffix].filter(Boolean);
        for (const candidate of candidates) {
            const bareRe = new RegExp(`(^|})\\s*${escapeRegExp(candidate)}\\s*\\{`, 'i');
            if (!bareRe.test(css)) continue;
            css = css.replace(bareRe, (full, boundary) => `${boundary || ''}.${className}{`);
            break;
        }
    }
    return css;
}

// CSS 声明级保全：模型偶尔把 filter() 错塞进 transform 值中，
// 例如 transform: scale(1.1) filter(blur(4px));。
// 某些宿主 CSS 处理器会因此放弃整份样式。这里只修复这一种可明确还原的误写；
// 若 filter( 外层括号本身无法闭合，则仅丢弃该条 transform 声明，保住其余 CSS/HTML。
function splitWrappedFilterFromTransformValue(rawValue) {
    const source = String(rawValue || '');
    const pieces = [];
    const filters = [];
    let cursor = 0;
    let index = 0;
    let depth = 0;
    let quote = '';
    let escaped = false;
    let malformed = false;

    while (index < source.length) {
        const char = source[index];
        if (quote) {
            if (escaped) escaped = false;
            else if (char === '\\') escaped = true;
            else if (char === quote) quote = '';
            index += 1;
            continue;
        }
        if (char === '"' || char === "'") {
            quote = char;
            index += 1;
            continue;
        }
        if (char === '(') {
            depth += 1;
            index += 1;
            continue;
        }
        if (char === ')') {
            depth = Math.max(0, depth - 1);
            index += 1;
            continue;
        }

        if (depth === 0 && /[a-zA-Z_-]/.test(char)) {
            const tokenMatch = /^filter\s*\(/i.exec(source.slice(index));
            const previous = index > 0 ? source[index - 1] : '';
            if (tokenMatch && !/[a-zA-Z0-9_-]/.test(previous)) {
                const openIndex = index + tokenMatch[0].lastIndexOf('(');
                let scan = openIndex + 1;
                let filterDepth = 1;
                let filterQuote = '';
                let filterEscaped = false;
                while (scan < source.length && filterDepth > 0) {
                    const scanChar = source[scan];
                    if (filterQuote) {
                        if (filterEscaped) filterEscaped = false;
                        else if (scanChar === '\\') filterEscaped = true;
                        else if (scanChar === filterQuote) filterQuote = '';
                    } else if (scanChar === '"' || scanChar === "'") {
                        filterQuote = scanChar;
                    } else if (scanChar === '(') {
                        filterDepth += 1;
                    } else if (scanChar === ')') {
                        filterDepth -= 1;
                    }
                    scan += 1;
                }

                if (filterDepth !== 0) {
                    malformed = true;
                    break;
                }

                const closeIndex = scan - 1;
                const filterValue = source.slice(openIndex + 1, closeIndex).trim();
                if (!filterValue || /[;{}]/.test(filterValue)) {
                    malformed = true;
                    break;
                }

                pieces.push(source.slice(cursor, index));
                filters.push(filterValue);
                cursor = closeIndex + 1;
                index = cursor;
                continue;
            }
        }
        index += 1;
    }

    if (malformed) return { changed: true, malformed: true, transformValue: '', filterValue: '' };
    if (!filters.length) return { changed: false, malformed: false, transformValue: source, filterValue: '' };

    pieces.push(source.slice(cursor));
    const transformValue = pieces.join(' ').replace(/\s{2,}/g, ' ').trim();
    const filterValue = filters.join(' ').replace(/\s{2,}/g, ' ').trim();
    return { changed: true, malformed: false, transformValue, filterValue };
}

// CSS 注释剥离急救：SillyTavern/Markdown 的换行与强调解析偶尔会破坏
// <style> 内的 /* ... */ 边界，继而让宿主 CSS 解析器误报 missing '}'。
// 注释不参与最终视觉，因此在代码块急救或单条纯文字急救实际整理样式时，
// 仅删除引号外的 CSS 注释并以一个空格占位；不开对应急救时不会调用。
function stripCssComments(cssText) {
    const source = String(cssText || '');
    let output = '';
    let index = 0;
    let quote = '';
    let escaped = false;

    while (index < source.length) {
        const char = source[index];
        const next = source[index + 1] || '';

        if (quote) {
            output += char;
            if (escaped) escaped = false;
            else if (char === '\\') escaped = true;
            else if (char === quote) quote = '';
            index += 1;
            continue;
        }

        if (char === '"' || char === "'") {
            quote = char;
            output += char;
            index += 1;
            continue;
        }

        if (char === '/' && next === '*') {
            const closeIndex = source.indexOf('*/', index + 2);
            // 未闭合注释已经会吞掉后续全部 CSS；急救时直接丢弃其余注释内容，
            // 至少保住注释之前已经完整的规则，而不是把损坏边界继续交给宿主解析器。
            if (closeIndex < 0) break;
            if (output && !/\s$/.test(output)) output += ' ';
            index = closeIndex + 2;
            while (index < source.length && /[ \t]/.test(source[index])) index += 1;
            continue;
        }

        output += char;
        index += 1;
    }

    return output;
}

function repairMalformedCssDeclarations(cssText) {
    return String(cssText || '').replace(
        /(^|[;{])(\s*)transform\s*:\s*([^;{}]+)(;|(?=}))/gi,
        (full, boundary, spacing, rawValue, terminator) => {
            const important = /\s*!important\s*$/i.test(rawValue);
            const value = String(rawValue || '').replace(/\s*!important\s*$/i, '').trim();
            const split = splitWrappedFilterFromTransformValue(value);
            if (!split.changed) return full;
            if (split.malformed) return `${boundary}${spacing}`;

            const priority = important ? ' !important' : '';
            const declarations = [];
            if (split.transformValue) declarations.push(`transform: ${split.transformValue}${priority}`);
            if (split.filterValue) declarations.push(`filter: ${split.filterValue}${priority}`);
            return `${boundary}${spacing}${declarations.join(';')}${terminator === ';' ? ';' : ''}`;
        },
    );
}

function repairPlainTextCssInHtml(htmlText) {
    const html = String(htmlText || '');
    // CSS 变量可能定义在主容器的 inline style 中、却在局部 <style> 中被引用。
    // 先从整条兔子镜收集变量，避免把原本可用的配色错误替换成 initial。
    const inheritedValues = collectCssCustomPropertyValuesFromHtml(html);
    return html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (full, attrs = '', css = '') => {
        const normalized = String(css || '')
            .replace(/<br\s*\/?>/gi, '')
            .replace(/\r\n?/g, '\n');
        const commentStripped = stripCssComments(normalized);
        const declarationRepaired = repairMalformedCssDeclarations(commentStripped);
        const expanded = expandUnsupportedCssCustomProperties(declarationRepaired, inheritedValues);
        const repaired = repairLikelyBareRootSelector(expanded, html);
        return `<style${attrs}>${repaired}</style>`;
    });
}

function needsPlainTextCssRescue(text) {
    const source = decodeHtmlEntities(String(text || ''));
    if (!/<(?:toto|details)\b[\s\S]*?<style\b/i.test(source)) return false;
    return /(?:^|[;{])\s*--[^\s:;{}]+\s*:|var\s*\(/i.test(source);
}

export function rescuePlainTextRabbitMirrorOutput(responseText = '') {
    let text = normalizeMirrorAttribute(String(responseText || ''));
    text = repairPlainTextCssInHtml(text);
    text = text.replace(TOTO_BLOCK_RE, block => compactTotoBlock(block));
    return text.trim();
}

const RABBIT_MIRROR_CSS_SCOPE_ATTR = 'data-rabbit-mirror-css-scope';

function localizeRabbitMirrorRootSelector(html) {
    const source = String(html || '');
    if (!/<style\b[^>]*>[\s\S]*?:root(?=\s*(?:\{|,))/i.test(source)) return source;

    // 酒馆会隔离/净化消息内 CSS，`:root` 不再可靠地指向当前兔子镜。
    // 每条作品使用由原文生成的稳定局部作用域，既恢复变量继承，也避免不同消息互相串色。
    const scopeToken = `rmcss-${hashInteractionSignature(source).slice(0, 10)}`;
    const scopeSelector = `[${RABBIT_MIRROR_CSS_SCOPE_ATTR}="${scopeToken}"]`;
    let foundRootSelector = false;

    let localized = source.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (full, attrs = '', css = '') => {
        if (!/:root(?=\s*(?:\{|,))/i.test(css)) return full;
        foundRootSelector = true;
        const localizedCss = css.replace(/:root(?=\s*(?:\{|,))/gi, scopeSelector);
        return `<style${attrs}>${localizedCss}</style>`;
    });

    if (!foundRootSelector) return localized;

    const markTag = (tag) => {
        const attrRe = new RegExp(`\\s${RABBIT_MIRROR_CSS_SCOPE_ATTR}\\s*=\\s*(["']).*?\\1`, 'i');
        if (attrRe.test(tag)) return tag.replace(attrRe, ` ${RABBIT_MIRROR_CSS_SCOPE_ATTR}="${scopeToken}"`);
        return tag.replace(/^<([a-z][\w:-]*)\b/i, `<$1 ${RABBIT_MIRROR_CSS_SCOPE_ATTR}="${scopeToken}"`);
    };

    // 同时标记未知外壳 <toto> 与首个真实内容根；宿主删除 <toto> 后，details/div 仍可承接变量。
    localized = localized.replace(/<toto\b[^>]*>/i, markTag);
    localized = localized.replace(/<(details|div|section|article)\b[^>]*>/i, markTag);
    return localized;
}

export function compactTotoBlock(block) {
    let html = localizeRabbitMirrorRootSelector(normalizeMirrorAttribute(stripCodeBlockTriggers(block)));
    const styleSlots = [];

    // 1. 保护 <style>...</style>，避免 CSS 文本被误插入 <br>。
    html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (match) => {
        const key = `%%RHT_STYLE_${styleSlots.length}%%`;
        const compactedStyle = match
            // 清理宿主换行转换残留；这是代码块与纯文字急救共用的样式整理底层。
            .replace(/<br\s*\/?>/gi, '')
            .replace(/\r\n?/g, '\n')
            .replace(/^[ \t]+/gm, '')
            .replace(/[ \t]+$/gm, '')
            .replace(/\n+/g, '')
            .replace(/>\s+</g, '><')
            .trim();
        styleSlots.push(compactedStyle.replace(
            /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/i,
            (full, openTag, css, closeTag) => `${openTag}${repairMalformedCssDeclarations(stripCssComments(css))}${closeTag}`,
        ));
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
    const start = Math.max(0, chat.length - 8);
    return chat
        .slice(start)
        .map((message, offset) => ({ message, index: start + offset }))
        .filter(({ message }) => !message?.is_user && typeof message?.mes === 'string');
}

function getRenderedMessageElement(index) {
    if (typeof document === 'undefined') return null;
    // SillyTavern 的 mesid 是聊天数组下标，只会是非负整数。
    const safeIndex = Number.isInteger(Number(index)) ? String(Number(index)) : '';
    return safeIndex ? document.querySelector(`#chat [mesid="${safeIndex}"]`) : null;
}

function renderedMessageHasCssError(index) {
    const messageElement = getRenderedMessageElement(index);
    if (!messageElement) return false;
    const text = messageElement.querySelector('.mes_text')?.textContent || messageElement.textContent || '';
    return /CSS\s+ERROR\s*:/i.test(text) && !!messageElement.querySelector('details, toto');
}

function preserveAndRerenderSanitizedMessage(mod, index, message) {
    try {
        const updater = mod?.updateMessageBlock || globalThis.updateMessageBlock;
        if (typeof updater !== 'function' || typeof document === 'undefined') return false;

        const messageElement = getRenderedMessageElement(index);
        const detailsOpenStates = messageElement
            ? [...messageElement.querySelectorAll('details')].map(details => details.open)
            : [];

        updater(index, message);

        // updateMessageBlock 会重建消息正文。恢复用户当时已展开的兔子镜，避免急救时突然收起。
        const restoredElement = getRenderedMessageElement(index);
        if (restoredElement && detailsOpenStates.length) {
            [...restoredElement.querySelectorAll('details')].forEach((details, detailsIndex) => {
                if (detailsOpenStates[detailsIndex]) details.open = true;
            });
        }
        return true;
    } catch (error) {
        console.debug('[RabbitMirror] rerender after sanitizer failed:', error);
        return false;
    }
}

function sanitizeLatestRawMessages(mod) {
    if (!isCodeBlockRescueModeEnabled()) return false;
    let rawChanged = false;
    let rerendered = false;
    const rerenderEntries = [];

    for (const { message, index } of findRecentAssistantMessages(mod)) {
        let messageChanged = false;
        const decoded = decodeHtmlEntities(message.mes);
        if (needsSanitize(decoded)) {
            const cleaned = cleanRabbitMirrorOutput(decoded);
            if (cleaned && cleaned !== message.mes) {
                message.mes = cleaned;
                if (Array.isArray(message.swipes)) {
                    const swipeIndex = Number.isInteger(message.swipe_id) ? message.swipe_id : message.swipes.length - 1;
                    if (typeof message.swipes[swipeIndex] === 'string') message.swipes[swipeIndex] = cleaned;
                }
                messageChanged = true;
            }
        }

        // 部分消息以 extra.display_text 作为实际显示源；只清 mes 会导致重绘后仍使用旧文本。
        if (typeof message?.extra?.display_text === 'string') {
            const decodedDisplayText = decodeHtmlEntities(message.extra.display_text);
            if (needsSanitize(decodedDisplayText)) {
                const cleanedDisplayText = cleanRabbitMirrorOutput(decodedDisplayText);
                if (cleanedDisplayText && cleanedDisplayText !== message.extra.display_text) {
                    message.extra.display_text = cleanedDisplayText;
                    messageChanged = true;
                }
            }
        }

        if (messageChanged) rawChanged = true;

        // 代码块急救只在代码块/裸 HTML 整理实际改动原文时重绘。
        // CSS ERROR 检测、无变化强制重绘与对应去重，统一由“纯文字急救”开关负责。
        if (messageChanged) {
            rerenderEntries.push({ index, message });
        }
    }

    if (rerenderEntries.length) {
        // 旧版这里只改 chat[].mes 并保存，当前画面已经产生的 CSS ERROR 不会自动重绘。
        // 用酒馆原生 updateMessageBlock 立即重建正文，让压成单行的 <style> 重新进入解析链。
        for (const { index, message } of rerenderEntries) {
            rerendered = preserveAndRerenderSanitizedMessage(mod, index, message) || rerendered;
        }
    }

    if (rawChanged) {
        try {
            const saver = mod?.saveChatConditional || globalThis.saveChatConditional;
            if (typeof saver === 'function') saver();
        } catch (error) {
            console.debug('[RabbitMirror] save after sanitizer failed:', error);
        }
    }
    return rawChanged || rerendered;
}

function sanitizePlainTextRawMessages(mod) {
    if (!isPlainTextRescueModeEnabled()) return false;
    let rawChanged = false;
    let rerendered = false;
    const rerenderEntries = [];

    for (const { message, index } of findRecentAssistantMessages(mod)) {
        let messageChanged = false;
        const renderedHasError = renderedMessageHasCssError(index);
        const decoded = decodeHtmlEntities(message.mes);
        // 纯文字急救只处理已经实际显示 CSS ERROR 的消息。
        // 仅仅包含 CSS 变量不代表损坏；健康 UI 不得被预防性改写。
        if (renderedHasError) {
            const cleaned = rescuePlainTextRabbitMirrorOutput(decoded);
            if (cleaned && cleaned !== message.mes) {
                message.mes = cleaned;
                if (Array.isArray(message.swipes)) {
                    const swipeIndex = Number.isInteger(message.swipe_id) ? message.swipe_id : message.swipes.length - 1;
                    if (typeof message.swipes[swipeIndex] === 'string') message.swipes[swipeIndex] = cleaned;
                }
                messageChanged = true;
            }
        }

        if (typeof message?.extra?.display_text === 'string') {
            const decodedDisplayText = decodeHtmlEntities(message.extra.display_text);
            if (renderedHasError) {
                const cleanedDisplayText = rescuePlainTextRabbitMirrorOutput(decodedDisplayText);
                if (cleanedDisplayText && cleanedDisplayText !== message.extra.display_text) {
                    message.extra.display_text = cleanedDisplayText;
                    messageChanged = true;
                }
            }
        }

        if (messageChanged) rawChanged = true;
        const signature = `${index}:${hashInteractionSignature(message.mes)}`;
        if (messageChanged || (renderedHasError && !plainTextRerenderedSignatures.has(signature))) {
            plainTextRerenderedSignatures.add(signature);
            rerenderEntries.push({ index, message });
        }
    }

    for (const { index, message } of rerenderEntries) {
        rerendered = preserveAndRerenderSanitizedMessage(mod, index, message) || rerendered;
    }

    if (rawChanged) {
        try {
            const saver = mod?.saveChatConditional || globalThis.saveChatConditional;
            if (typeof saver === 'function') saver();
        } catch (error) {
            console.debug('[RabbitMirror] save after plain text rescue failed:', error);
        }
    }
    return rawChanged || rerendered;
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
        // data URI 保全急救使用临时消息副本重建当前 DOM，不改写或保存聊天原文。
        // 只在智能交互急救开启时处理明确会截断 inline style 的损坏 SVG data URI。
        rescueRecentDamagedDataUriMessages(hostScriptModule || globalThis);
        // 已经修复过的兔子镜会被会话记忆继续维护；关闭开关只停止处理新消息。
        scopeRabbitMirrorInteractionsInChatDom();
    } catch (error) {
        console.debug('[RabbitMirror] interaction rescue trigger failed:', error);
    }
}

export function triggerInteractionDiagnosticOnce() {
    try {
        const chatRoot = getChatRoot();
        if (!chatRoot) return false;
        stopOneShotInteractionDiagnosticSession();
        removeAllInteractionDiagnosticPanels();

        const session = { chatRoot, root: null, state: null, handlers: {}, timers: [] };
        for (const type of ['click', 'input', 'change']) {
            const handler = event => handleOneShotInteractionDiagnosticEvent(session, event);
            session.handlers[type] = handler;
            chatRoot.addEventListener(type, handler, true);
        }
        session.timers.push(setTimeout(() => stopOneShotInteractionDiagnosticSession(), DIAGNOSTIC_WAIT_TIMEOUT_MS));
        oneShotInteractionDiagnosticSession = session;
        return true;
    } catch (error) {
        console.debug('[RabbitMirror] one-shot interaction diagnostic failed:', error);
        stopOneShotInteractionDiagnosticSession();
        return false;
    }
}

function runEnabledRescueChain(mod = null) {
    const host = mod || globalThis;
    // 纯文字急救自 0.32.38 起为单条一次性选择，不再加入全局急救链。
    if (isCodeBlockRescueModeEnabled()) {
        sanitizeLatestRawMessages(host);
        sanitizeCodeBlocksInChatDom();
        sanitizeRenderedRabbitMirrorDetailsDom();
    }
    triggerInteractionRescue();
}

const PLAIN_TEXT_ONE_SHOT_TIMEOUT_MS = 30000;
let plainTextOneShotSelectionSession = null;

function notifyPlainTextRescue(message, level = 'info') {
    try {
        const toast = globalThis.toastr || globalThis.parent?.toastr;
        toast?.[level]?.(message);
    } catch {
        // 通知失败不影响急救本身。
    }
}

function removePlainTextSelectionStyle() {
    try {
        document.getElementById('rabbit-mirror-plain-text-selection-style')?.remove();
    } catch {
        // ignore
    }
}

function stopPlainTextOneShotSelection() {
    const session = plainTextOneShotSelectionSession;
    if (!session) return false;
    plainTextOneShotSelectionSession = null;
    try {
        session.chatRoot?.removeEventListener('click', session.clickHandler, true);
        document.removeEventListener('keydown', session.keyHandler, true);
        if (session.timer) clearTimeout(session.timer);
        session.chatRoot?.removeAttribute('data-rabbit-mirror-plain-text-pick');
    } catch {
        // ignore
    }
    removePlainTextSelectionStyle();
    return true;
}

function getMessageIndexFromMirrorNode(node) {
    const messageNode = node?.closest?.('.mes, [mesid], [data-message-id], [data-messageid]');
    if (!messageNode) return -1;
    const raw = messageNode.getAttribute('mesid')
        ?? messageNode.dataset?.messageId
        ?? messageNode.dataset?.messageid;
    const index = Number(raw);
    return Number.isInteger(index) && index >= 0 ? index : -1;
}

function cloneMessageForTransientRerender(message) {
    try {
        if (typeof structuredClone === 'function') return structuredClone(message);
    } catch {
        // fallback below
    }
    try {
        return JSON.parse(JSON.stringify(message));
    } catch {
        return { ...message };
    }
}

function getSelectedMessageSource(message) {
    const candidates = [];
    const swipeIndex = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
    if (swipeIndex >= 0 && typeof message?.swipes?.[swipeIndex] === 'string') {
        candidates.push(message.swipes[swipeIndex]);
    }
    if (typeof message?.mes === 'string') candidates.push(message.mes);
    if (typeof message?.extra?.display_text === 'string') candidates.push(message.extra.display_text);

    const scored = candidates
        .map(source => {
            const decoded = decodeHtmlEntities(source);
            let score = decoded.length;
            if (/<toto\b/i.test(decoded)) score += 100000;
            if (/<style\b/i.test(decoded)) score += 50000;
            if (/<details\b/i.test(decoded)) score += 20000;
            return { source: decoded, score };
        })
        .sort((a, b) => b.score - a.score);
    return scored[0]?.source || '';
}

function rescueSelectedPlainTextMirror(index) {
    const mod = hostScriptModule || globalThis;
    const chat = mod?.chat || globalThis.chat;
    const message = Array.isArray(chat) ? chat[index] : null;
    if (!message || message?.is_user) return false;

    const source = getSelectedMessageSource(message);
    if (!source || !/<(?:toto|details)\b/i.test(source)) return false;

    const repaired = rescuePlainTextRabbitMirrorOutput(source) || source;
    const transientMessage = cloneMessageForTransientRerender(message);
    transientMessage.mes = repaired;

    if (Array.isArray(transientMessage.swipes)) {
        const swipeIndex = Number.isInteger(transientMessage.swipe_id)
            ? transientMessage.swipe_id
            : transientMessage.swipes.length - 1;
        if (typeof transientMessage.swipes[swipeIndex] === 'string') {
            transientMessage.swipes[swipeIndex] = repaired;
        }
    }
    if (typeof transientMessage?.extra?.display_text === 'string') {
        transientMessage.extra.display_text = repaired;
    }

    // 只用临时副本重建当前 DOM：不改 chat[].mes、不改 swipe、不调用保存。
    const rerendered = preserveAndRerenderSanitizedMessage(mod, index, transientMessage);
    if (rerendered) {
        setTimeout(() => triggerInteractionRescue(), 80);
    }
    return rerendered;
}

function startPlainTextOneShotSelection() {
    const chatRoot = getChatRoot();
    if (!chatRoot) return false;

    stopPlainTextOneShotSelection();
    removePlainTextSelectionStyle();

    const style = document.createElement('style');
    style.id = 'rabbit-mirror-plain-text-selection-style';
    style.textContent = `
      [data-rabbit-mirror-plain-text-pick="true"] details,
      [data-rabbit-mirror-plain-text-pick="true"] toto { cursor: crosshair !important; }
      [data-rabbit-mirror-plain-text-pick="true"] details:hover {
        outline: 2px solid currentColor !important;
        outline-offset: 3px !important;
      }
    `;
    document.head?.appendChild(style);
    chatRoot.setAttribute('data-rabbit-mirror-plain-text-pick', 'true');

    const session = { chatRoot, timer: null, clickHandler: null, keyHandler: null };
    session.clickHandler = event => {
        const mirror = event.target?.closest?.('toto[data-rabbit-mirror="true"], toto, details');
        if (!mirror || !isInsideChatMessage(mirror)) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();

        const index = getMessageIndexFromMirrorNode(mirror);
        stopPlainTextOneShotSelection();
        if (index < 0) {
            notifyPlainTextRescue('没有识别到这条兔子镜所属的消息，未进行修改。', 'warning');
            return;
        }

        const repaired = rescueSelectedPlainTextMirror(index);
        if (repaired) {
            notifyPlainTextRescue('已仅修复选中的这一条兔子镜；其他消息与聊天原文均未改动。', 'success');
        } else {
            notifyPlainTextRescue('这条兔子镜没有找到可恢复的完整源码，未进行修改。', 'warning');
        }
    };
    session.keyHandler = event => {
        if (event.key !== 'Escape') return;
        stopPlainTextOneShotSelection();
        notifyPlainTextRescue('已取消单条纯文字急救。', 'info');
    };
    session.timer = setTimeout(() => {
        if (plainTextOneShotSelectionSession !== session) return;
        stopPlainTextOneShotSelection();
        notifyPlainTextRescue('单条纯文字急救已超时取消。', 'info');
    }, PLAIN_TEXT_ONE_SHOT_TIMEOUT_MS);

    chatRoot.addEventListener('click', session.clickHandler, true);
    document.addEventListener('keydown', session.keyHandler, true);
    plainTextOneShotSelectionSession = session;
    return true;
}

export function triggerPlainTextRescue() {
    try {
        if (plainTextOneShotSelectionSession) {
            stopPlainTextOneShotSelection();
            return false;
        }
        return startPlainTextOneShotSelection();
    } catch (error) {
        console.debug('[RabbitMirror] one-shot plain text rescue failed:', error);
        stopPlainTextOneShotSelection();
        return false;
    }
}

export function triggerCodeBlockRescue(mod = null) {
    try {
        runEnabledRescueChain(mod);
    } catch (error) {
        console.debug('[RabbitMirror] code block rescue trigger failed:', error);
    }
}

function scheduleSanitize(mod) {
    const run = () => {
        // 自动链只处理代码块与交互；纯文字急救必须由用户点选单条消息。
        if (isCodeBlockRescueModeEnabled()) {
            sanitizeLatestRawMessages(mod);
            sanitizeCodeBlocksInChatDom();
            sanitizeRenderedRabbitMirrorDetailsDom();
        }
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
