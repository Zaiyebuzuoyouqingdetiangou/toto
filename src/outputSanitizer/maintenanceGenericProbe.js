// 通用实测：不认写法，只看结果。在隐藏隔离副本里把这一面每个看得见的控件都操作一遍
// （点 label／按钮、拖滑杆、开合内层 details），比较操作前后的画面快照；没有任何变化的就是“点了没反应”。
// 副本里会重新接上和真实页面一样的修复，所以修好的控件在副本里也能动。
// 真实页面上的控件一个不碰；结果只写回一个属性，供维修兔的结论和诊断引用。
import { createMaintenanceLabeledCheckedProbeSandbox, installNestedDetailsReplacementContainment } from './fallbackRescue.js?rmv=1.67.57';
import { rearmOrphanStateWiring } from './orphanStateWiring.js?rmv=1.67.57';
import { activateRabbitMirrorInteractionRescue, rearmRabbitMirrorSerializedInteractionRoot } from './idsAndRearm.js?rmv=1.67.57';
import { clearPersistedCheckedInlineArtifacts } from './checkedStateRescue.js?rmv=1.67.57';

export const GENERIC_PROBE_RESULT_ATTR = 'data-rabbit-mirror-generic-probe';
const TOOL_SELECTOR = '[data-rabbit-mirror-tool-entry-host],[data-rabbit-mirror-diagnostic-panel],.rabbit-mirror-maintenance-menu,[data-rm-face-swipe-host],[data-rm-image-region],[data-rm-mobile-controls],[data-rabbit-mirror-maintenance-rabbit],[data-rabbit-mirror-feedback-cat]';
const MAX_CONTROLS = 40;
const MAX_SNAPSHOT_NODES = 1600;
const TIME_BUDGET_MS = 900;

function controlName(element) {
    const text = String(element.getAttribute?.('aria-label') || element.textContent || '').replace(/\s+/g, ' ').trim();
    if (text) return text.slice(0, 12);
    if (element.matches?.('input[type="range"]')) return '滑杆';
    if (element.matches?.('summary')) return '折叠';
    return element.tagName.toLowerCase();
}

function visible(element) {
    try {
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < 0.05) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 2 && rect.height > 2;
    } catch { return false; }
}

function hash(text) {
    let h = 0;
    for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
    return h;
}

// 画面快照：每个元素的显隐、透明度、变换、背景、高度、勾选与展开状态，加上整面文字。
function snapshot(details) {
    const parts = [String(details.innerText || '').slice(0, 20000)];
    let count = 0;
    for (const element of details.querySelectorAll('*')) {
        if (count++ > MAX_SNAPSHOT_NODES) break;
        if (element.closest(TOOL_SELECTOR)) continue;
        let style;
        try { style = getComputedStyle(element); } catch { continue; }
        const rect = element.getBoundingClientRect();
        parts.push(`${rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && Number(style.opacity) > 0.05 ? 1 : 0}${style.transform}${style.clipPath}${Number(style.opacity).toFixed(2)}${style.backgroundColor}${style.color}${Math.round(rect.height)}${element.checked ? 'c' : ''}${element.open ? 'o' : ''}`);
    }
    return hash(parts.join('|'));
}

function labelInput(details, label) {
    const id = label.getAttribute('for');
    if (id) return [...details.querySelectorAll('input')].find(input => input.id === id) || null;
    return label.querySelector('input[type="checkbox"], input[type="radio"]');
}

function collectControls(details) {
    const outerSummary = details.querySelector(':scope > summary');
    const controls = [];
    const seen = new Set();
    const push = (element, kind) => {
        if (seen.has(element) || element.closest(TOOL_SELECTOR) || element === outerSummary || outerSummary?.contains(element)) return;
        if (!visible(element)) return;
        seen.add(element);
        controls.push({ element, kind });
    };
    for (const label of details.querySelectorAll('label')) push(label, 'label');
    for (const button of details.querySelectorAll('button, [role="button"]')) push(button, 'button');
    for (const input of details.querySelectorAll('input[type="range"]')) push(input, 'range');
    for (const summary of details.querySelectorAll('details > summary')) push(summary, 'summary');
    for (const input of details.querySelectorAll('input[type="checkbox"], input[type="radio"]')) {
        if (input.closest('label') || [...details.querySelectorAll('label[for]')].some(label => label.getAttribute('for') === input.id)) continue;
        push(input, 'input');
    }
    // 没有真正控件、只是鼠标变成手形的元素，也算一种入口。
    if (controls.length < MAX_CONTROLS) {
        for (const element of details.querySelectorAll('div, span, li, p, figure, svg, g, path, circle, rect')) {
            if (controls.length >= MAX_CONTROLS) break;
            if (element.closest('label, button, summary, [role="button"]')) continue;
            // 里面已经有真正控件的外层（鼠标变手形只是顺带的），入口是里面那个，不单独算。
            if (element.querySelector('label, button, input, summary, [role="button"]')) continue;
            let style;
            try { style = getComputedStyle(element); } catch { continue; }
            if (style.cursor !== 'pointer' || style.pointerEvents === 'none') continue;
            const parent = element.parentElement;
            if (parent && parent !== details) { try { if (getComputedStyle(parent).cursor === 'pointer') continue; } catch {} }
            push(element, 'pointer');
        }
    }
    return controls.slice(0, MAX_CONTROLS);
}

function fire(element, type, init = {}) {
    try {
        const EventClass = type.startsWith('pointer') ? (globalThis.PointerEvent || MouseEvent) : /click|mouse/.test(type) ? MouseEvent : Event;
        element.dispatchEvent(new EventClass(type, { bubbles: true, cancelable: true, ...init }));
    } catch { /* 副本里派发失败就当没动 */ }
}

function activate(details, control) {
    const { element, kind } = control;
    if (kind === 'label') {
        const input = labelInput(details, element);
        if (input?.type === 'radio' && input.checked) return 'skip';
        if (input?.disabled) return 'skip';
        fire(element, 'pointerdown'); fire(element, 'pointerup');
        try { element.click(); } catch { fire(element, 'click'); }
        return 'done';
    }
    if (kind === 'input') {
        if (element.type === 'radio' && element.checked) return 'skip';
        try { element.click(); } catch { fire(element, 'click'); }
        return 'done';
    }
    if (kind === 'range') {
        if (element.disabled) return 'dead';
        const min = Number(element.min === '' ? 0 : element.min), max = Number(element.max === '' ? 100 : element.max);
        const current = Number(element.value);
        element.value = String(Math.abs(current - min) > Math.abs(max - current) ? min : max);
        fire(element, 'input'); fire(element, 'change');
        return 'done';
    }
    if (kind === 'summary') {
        try { element.click(); } catch { fire(element, 'click'); }
        return 'done';
    }
    // 「按住」类按钮：按下时才有变化、松手就复原。先按下，看完画面再松开（见下面的 hold 处理）。
    if (element.matches?.('[data-rm-hold]')) { fire(element, 'pointerdown', { button: 0, isPrimary: true, pointerId: 1 }); return 'hold'; }
    fire(element, 'pointerdown'); fire(element, 'pointerup');
    try { element.click(); } catch { fire(element, 'click'); }
    return 'done';
}

// 返回 { tested, dead: [名称…], skipped, truncated }；无法建立副本时返回 null。
export function runMaintenanceGenericProbe(root) {
    if (!root?.isConnected || typeof getComputedStyle !== 'function') return null;
    const sandbox = createMaintenanceLabeledCheckedProbeSandbox(root);
    if (!sandbox) return null;
    const started = Date.now();
    try {
        const sandboxRoot = sandbox.root;
        const details = sandboxRoot.matches?.('details') ? sandboxRoot : sandboxRoot.querySelector?.('details');
        if (!details) return null;
        details.open = true;
        const toto = sandboxRoot.closest?.('toto') || sandboxRoot;
        // 副本是克隆出来的：“已修过”的标记还在，监听却没有了。先去掉这些标记、清掉未勾选开关上留下的旧内联样式，
        // 再接上和真实页面一样的修复链；接不上也照样测，只是结论会偏严。
        try { rearmRabbitMirrorSerializedInteractionRoot(toto); } catch {}
        try {
            const unchecked = [...toto.querySelectorAll('input[type="checkbox"], input[type="radio"]')].filter(input => !input.checked);
            if (unchecked.length) clearPersistedCheckedInlineArtifacts(toto, unchecked);
        } catch {}
        try { activateRabbitMirrorInteractionRescue(toto); } catch { /* 副本接线失败不影响真实页面 */ }
        // 工具栏链接的那几种线（内层整页 details 的「轻触返回」、只有状态类的翻面开关）克隆后监听会丢，按属性接回。
        try { installNestedDetailsReplacementContainment(toto); } catch {}
        try { rearmOrphanStateWiring(toto); } catch {}
        // 副本外壳本身是 pointer-events:none（且 inert、在屏幕外），会被里面所有元素继承；
        // 收集控件时临时放开外壳，才能看出哪些元素是本面自己写了 pointer-events:none 的纯装饰。
        try { sandbox.host?.style?.setProperty('pointer-events', 'auto', 'important'); } catch {}
        let controls;
        try { controls = collectControls(details); } finally {
            try { sandbox.host?.style?.setProperty('pointer-events', 'none', 'important'); } catch {}
        }
        const dead = [];
        let tested = 0, skipped = 0, uncertain = 0, truncated = false;
        for (const control of controls) {
            if (Date.now() - started > TIME_BUDGET_MS) { truncated = true; break; }
            const before = snapshot(details);
            const outcome = activate(details, control);
            if (outcome === 'skip') { skipped += 1; continue; }
            tested += 1;
            if (outcome === 'dead') { dead.push(controlName(control.element)); continue; }
            try { void details.offsetHeight; } catch {}
            const changed = snapshot(details) !== before;
            if (outcome === 'hold') fire(control.element, 'pointerup', { button: 0, isPrimary: true, pointerId: 1 });
            if (changed) continue;
            // 只是鼠标变手形的元素：可能只是悬停效果（副本里的模拟点击不会触发 :hover），不能据此判它“点了没反应”。
            if (control.kind === 'pointer') { tested -= 1; uncertain += 1; continue; }
            dead.push(controlName(control.element));
        }
        const result = { tested, dead, skipped, uncertain, truncated, total: controls.length };
        try { root.setAttribute(GENERIC_PROBE_RESULT_ATTR, JSON.stringify(result)); } catch {}
        return result;
    } catch (error) {
        console.debug('[RabbitMirror] generic probe failed:', error);
        return null;
    } finally {
        try { sandbox.destroy(); } catch {}
    }
}

export function describeGenericProbe(result) {
    if (!result) return '';
    if (!result.tested) return '';
    if (!result.dead.length) return `实测：副本里操作了 ${result.tested} 个控件，画面都有变化`;
    const names = [...new Set(result.dead)].slice(0, 5).map(name => `「${name}」`).join('');
    return `实测：${result.tested} 个控件里有 ${result.dead.length} 个操作后画面没有变化：${names}${result.dead.length > 5 ? '…' : ''}${result.truncated ? '（时间有限，未测完）' : ''}`;
}
