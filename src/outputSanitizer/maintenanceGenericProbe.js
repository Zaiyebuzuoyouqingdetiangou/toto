import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=1.99.21";
import { createMaintenanceLabeledCheckedProbeSandbox, installNestedDetailsReplacementContainment } from './fallbackRescue.js?rmv=1.99.21';
import { rearmOrphanStateWiring } from './orphanStateWiring.js?rmv=1.99.21';
import { activateRabbitMirrorInteractionRescue, rearmRabbitMirrorSerializedInteractionRoot } from './idsAndRearm.js?rmv=1.99.21';
import { clearPersistedCheckedInlineArtifacts } from './checkedStateRescue.js?rmv=1.99.21';
import { rehydrateRabbitMirrorMaintenanceRepairs, installSelectionOnlyStateFallback } from './choiceRescue.js?rmv=1.99.21';
import { remoteMotionGroup, remoteToggleGroup } from './behaviorDialect.js?rmv=1.99.21';
export const GENERIC_PROBE_RESULT_ATTR = 'data-rabbit-mirror-generic-probe';
const TOOL_SELECTOR = '[data-rabbit-mirror-tool-entry-host],[data-rabbit-mirror-diagnostic-panel],.rabbit-mirror-maintenance-menu,[data-rm-face-swipe-host],[data-rm-image-region],[data-rm-mobile-controls],[data-rabbit-mirror-maintenance-rabbit],[data-rabbit-mirror-feedback-cat]';
const MAX_CONTROLS = 40;
const MAX_SNAPSHOT_NODES = 1600;
const TIME_BUDGET_MS = 900;
function controlName(element) {
    const text = String(element.getAttribute?.('aria-label') || element.textContent || '').replace(/\s+/g, ' ').trim();
    if (text)
        return text.slice(0, 12);
    if (element.matches?.('input[type="range"]'))
        return __rmT("W2ozjk");
    if (element.matches?.('summary'))
        return __rmT("cgECNk");
    return element.tagName.toLowerCase();
}
function visible(element) {
    try {
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < 0.05)
            return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 2 && rect.height > 2;
    }
    catch {
        return false;
    }
}
function hash(text) {
    let h = 0;
    for (let i = 0; i < text.length; i += 1)
        h = (h * 31 + text.charCodeAt(i)) | 0;
    return h;
}
function snapshot(details, ignore = null) {
    const parts = [String(details.innerText || '').slice(0, 20000)];
    let count = 0;
    for (const element of details.querySelectorAll('*')) {
        if (count++ > MAX_SNAPSHOT_NODES)
            break;
        if (element.closest(TOOL_SELECTOR))
            continue;
        if (ignore && (element === ignore || ignore.contains(element)))
            continue;
        let style;
        try {
            style = getComputedStyle(element);
        }
        catch {
            continue;
        }
        const rect = element.getBoundingClientRect();
        parts.push(`${rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && Number(style.opacity) > 0.05 ? 1 : 0}${style.transform}${style.rotate}${style.clipPath}${Number(style.opacity).toFixed(2)}${style.backgroundColor}${style.backgroundImage}${style.filter}${style.color}${style.outlineStyle}${Math.round(rect.left)},${Math.round(rect.top)},${Math.round(rect.width)},${Math.round(rect.height)}${element.checked ? 'c' : ''}${element.open ? 'o' : ''}`);
    }
    return hash(parts.join('|'));
}
const PROBE_CONTROL = 'button, [role="button"], input, select, textarea, label, summary, [data-rm-knob], [data-rm-hold], [data-rm-toggle], [data-rm-pick], [data-rm-fire], [data-rm-play], [data-rm-reverse], [data-rm-step], [data-rm-roll], [data-rm-end], [data-rm-code], [data-rm-goto], [data-rm-prev], [data-rm-next], [data-rm-left], [data-rm-right], [data-rm-tap], [data-rm-charge], [data-rm-qte], [data-rm-peek], [data-rm-spoiler]';
const PROBE_CONTENT = '[data-rm-show], [data-rm-result], [data-rm-part], [data-rm-page], [data-rm-cover], [data-rm-item], [data-rm-canvas], [data-rm-surface], [data-rm-card], [data-rm-at], [data-rm-clock], output';
function probeGroupOf(details, element) {
    const group = element.closest?.('[data-rm-ui]');
    if (group)
        return group.getAttribute('data-rm-ui') === 'scroll' ? null : group;
    try {
        return remoteToggleGroup(details, element) || remoteMotionGroup(details, element);
    }
    catch {
        return null;
    }
}
function probeGroupHasContent(group) {
    return [...group.querySelectorAll(PROBE_CONTENT)].some(node => node.closest('[data-rm-ui]') === group && !node.closest(PROBE_CONTROL));
}
function contentSnapshot(group) {
    const parts = [];
    let count = 0;
    for (const element of group.querySelectorAll('*')) {
        if (count++ > MAX_SNAPSHOT_NODES)
            break;
        if (element.closest(TOOL_SELECTOR) || element.closest(PROBE_CONTROL))
            continue;
        let style;
        try {
            style = getComputedStyle(element);
        }
        catch {
            continue;
        }
        const rect = element.getBoundingClientRect();
        const text = [...element.childNodes].filter(node => node.nodeType === 3).map(node => node.nodeValue).join('').trim().slice(0, 200);
        parts.push(`${rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.05 ? 1 : 0}${style.transform}${style.rotate}${style.clipPath}${Number(style.opacity).toFixed(2)}${style.backgroundColor}${style.color}${Math.round(rect.left)},${Math.round(rect.top)},${Math.round(rect.width)},${Math.round(rect.height)}${element.open ? 'o' : ''}${text}`);
    }
    return hash(parts.join('|'));
}
function labelInput(details, label) {
    const id = label.getAttribute('for');
    if (id)
        return [...details.querySelectorAll('input')].find(input => input.id === id) || null;
    return label.querySelector('input[type="checkbox"], input[type="radio"]');
}
function collectControls(details) {
    const outerSummary = details.querySelector(':scope > summary');
    const controls = [];
    const seen = new Set();
    const push = (element, kind) => {
        if (controls.length > MAX_CONTROLS)
            return;
        if (seen.has(element) || element.closest(TOOL_SELECTOR) || element === outerSummary || outerSummary?.contains(element))
            return;
        if (!visible(element))
            return;
        seen.add(element);
        controls.push({ element, kind });
    };
    for (const label of details.querySelectorAll('label'))
        push(label, 'label');
    for (const button of details.querySelectorAll('button, [role="button"]'))
        push(button, 'button');
    for (const input of details.querySelectorAll('input[type="range"]'))
        push(input, 'range');
    for (const summary of details.querySelectorAll('details > summary'))
        push(summary, 'summary');
    for (const input of details.querySelectorAll('input[type="checkbox"], input[type="radio"]')) {
        if (input.closest('label') || [...details.querySelectorAll('label[for]')].some(label => label.getAttribute('for') === input.id))
            continue;
        push(input, 'input');
    }
    if (controls.length <= MAX_CONTROLS) {
        for (const element of details.querySelectorAll('div, span, li, p, figure, svg, g, path, circle, rect')) {
            if (controls.length > MAX_CONTROLS)
                break;
            if (element.closest('label, button, summary, [role="button"]'))
                continue;
            if (element.querySelector('label, button, input, summary, [role="button"]'))
                continue;
            let style;
            try {
                style = getComputedStyle(element);
            }
            catch {
                continue;
            }
            if (style.cursor !== 'pointer' || style.pointerEvents === 'none')
                continue;
            const parent = element.parentElement;
            if (parent && parent !== details) {
                try {
                    if (getComputedStyle(parent).cursor === 'pointer')
                        continue;
                }
                catch { }
            }
            push(element, 'pointer');
        }
    }
    return controls;
}
function fire(element, type, init = {}) {
    try {
        const EventClass = type.startsWith('pointer') ? (globalThis.PointerEvent || MouseEvent) : /click|mouse/.test(type) ? MouseEvent : Event;
        element.dispatchEvent(new EventClass(type, { bubbles: true, cancelable: true, ...init }));
    }
    catch { }
}
const DECORATION_TEXT = __rmR("KGPpPkDKYT5CcSHvJL.unNZBELz0EY6PiYpXFmNajUBwNxdjK_Qmi99sYLC_V4AgKSuQ2EFs4jExe2Gk7pUaHfUrZFoPsghQ_DfJNwjMwu_WyLpfaxUu7HGBVB2NPLtBoedJXT", "u");
function activate(details, control) {
    const { element, kind } = control;
    if (!visible(element))
        return 'skip';
    if (element.disabled || element.getAttribute?.('aria-disabled') === 'true')
        return 'skip';
    if (kind === 'label') {
        const input = labelInput(details, element);
        if (input?.type === 'radio' && input.checked)
            return 'skip';
        if (input?.disabled)
            return 'skip';
        if (input && !/^(?:checkbox|radio)$/.test(input.type))
            return 'skip';
        if (!input && !element.querySelector('input[type="checkbox"], input[type="radio"]'))
            return 'skip';
        fire(element, 'pointerdown');
        fire(element, 'pointerup');
        try {
            element.click();
        }
        catch {
            fire(element, 'click');
        }
        return 'done';
    }
    if (kind === 'input') {
        if (element.type === 'radio' && element.checked)
            return 'skip';
        try {
            element.click();
        }
        catch {
            fire(element, 'click');
        }
        return 'done';
    }
    if (kind === 'range') {
        const min = Number(element.min === '' ? 0 : element.min), max = Number(element.max === '' ? 100 : element.max);
        const current = Number(element.value);
        element.value = String(Math.abs(current - min) > Math.abs(max - current) ? min : max);
        fire(element, 'input');
        fire(element, 'change');
        return 'done';
    }
    if (kind === 'summary') {
        try {
            element.click();
        }
        catch {
            fire(element, 'click');
        }
        return 'done';
    }
    if (element.matches?.('[data-rm-pick][data-rm-active="true"], [data-rm-goto][data-rm-active="true"]'))
        return 'skip';
    if (element.matches?.('[data-rm-ui] [data-rm-reset]'))
        return 'skip';
    if (element.matches?.('[data-rm-sibling-tab="active"]'))
        return 'skip';
    if (/rm-inert-action-status/.test(String(element.getAttribute?.('aria-describedby') || '')))
        return 'skip';
    if (!element.matches?.('[data-rm-ui] *') && ![...element.attributes || []].some(attribute => attribute.name.startsWith('data-rm-') && !/^data-rm-(?:polish|press|mobile|texture|feedback)/.test(attribute.name))
        && DECORATION_TEXT.test(String(element.textContent || '').trim()))
        return 'skip';
    if (element.matches?.('[data-rm-hold]')) {
        fire(element, 'pointerdown', { button: 0, isPrimary: true, pointerId: 1 });
        return 'hold';
    }
    fire(element, 'pointerdown');
    fire(element, 'pointerup');
    try {
        element.click();
    }
    catch {
        fire(element, 'click');
    }
    return 'done';
}
export function openGenericProbeSandbox(root, beforeRearm = null) {
    if (!root?.isConnected || typeof getComputedStyle !== 'function')
        return null;
    const sandbox = createMaintenanceLabeledCheckedProbeSandbox(root);
    if (!sandbox)
        return null;
    const liveHadSelectionOnly = !!(root.matches?.('[data-rabbit-mirror-selection-only-fallback]') || root.querySelector?.('[data-rabbit-mirror-selection-only-fallback]'));
    try {
        const sandboxRoot = sandbox.root;
        const details = sandboxRoot.matches?.('details') ? sandboxRoot : sandboxRoot.querySelector?.('details');
        if (!details) {
            sandbox.destroy();
            return null;
        }
        details.open = true;
        const toto = sandboxRoot.closest?.('toto') || sandboxRoot;
        try {
            beforeRearm?.(toto, details);
        }
        catch (error) {
            console.debug('[RabbitMirror] probe sandbox prepare failed:', error);
        }
        try {
            rearmRabbitMirrorSerializedInteractionRoot(toto);
        }
        catch { }
        try {
            const unchecked = [...toto.querySelectorAll('input[type="checkbox"], input[type="radio"]')].filter(input => !input.checked);
            if (unchecked.length)
                clearPersistedCheckedInlineArtifacts(toto, unchecked);
        }
        catch { }
        try {
            activateRabbitMirrorInteractionRescue(toto);
        }
        catch { }
        try {
            installNestedDetailsReplacementContainment(toto);
        }
        catch { }
        try {
            rearmOrphanStateWiring(toto);
        }
        catch { }
        try {
            rehydrateRabbitMirrorMaintenanceRepairs(toto, { cloned: true });
        }
        catch { }
        if (liveHadSelectionOnly) {
            try {
                installSelectionOnlyStateFallback(toto);
            }
            catch { }
        }
        return { sandbox, details, toto };
    }
    catch (error) {
        try {
            sandbox.destroy();
        }
        catch { }
        console.debug('[RabbitMirror] probe sandbox failed:', error);
        return null;
    }
}
export function collectGenericProbeControls(opened) {
    const { sandbox, details } = opened;
    try {
        sandbox.host?.style?.setProperty('pointer-events', 'auto', 'important');
    }
    catch { }
    try {
        const controls = collectControls(details);
        opened.controlLimitReached = controls.length > MAX_CONTROLS;
        opened.controlCount = controls.length;
        return controls.slice(0, MAX_CONTROLS);
    }
    finally {
        try {
            sandbox.host?.style?.setProperty('pointer-events', 'none', 'important');
        }
        catch { }
    }
}
export function probeGenericControls(details, controls, started = Date.now(), budget = TIME_BUDGET_MS) {
    const outcomes = new Map();
    const feedbackOnly = new Set();
    const contentChanged = new Map();
    let truncated = false;
    for (const control of controls) {
        if (Date.now() - started > budget) {
            truncated = true;
            break;
        }
        const group = probeGroupOf(details, control.element);
        const watch = group && probeGroupHasContent(group) ? group : null;
        const ignore = control.kind === 'range' ? control.element : null;
        const before = snapshot(details, ignore);
        const contentBefore = watch ? contentSnapshot(watch) : 0;
        const pressedBefore = control.element.getAttribute?.('aria-pressed');
        const outcome = activate(details, control);
        if (outcome === 'skip') {
            outcomes.set(control, 'skip');
            continue;
        }
        if (outcome === 'dead') {
            outcomes.set(control, 'dead');
            continue;
        }
        try {
            void details.offsetHeight;
        }
        catch { }
        const playPressed = control.element.matches?.('[data-rm-play], [data-rm-reverse]') && control.element.getAttribute('aria-pressed') !== pressedBefore;
        const changed = snapshot(details, ignore) !== before || playPressed;
        const contentMoved = watch ? contentSnapshot(watch) !== contentBefore || playPressed : changed;
        if (outcome === 'hold')
            fire(control.element, 'pointerup', { button: 0, isPrimary: true, pointerId: 1 });
        if (watch)
            contentChanged.set(watch, (contentChanged.get(watch) || false) || contentMoved);
        if (changed) {
            outcomes.set(control, 'live');
            if (watch && !contentMoved)
                feedbackOnly.add(control);
            continue;
        }
        const mutedMotion = control.kind === 'range' && !!control.element.closest?.('[data-rm-ui="motion"]');
        outcomes.set(control, control.kind === 'pointer' || mutedMotion ? 'uncertain' : 'dead');
    }
    for (const control of [...feedbackOnly])
        if (contentChanged.get(probeGroupOf(details, control.element)))
            feedbackOnly.delete(control);
    return { outcomes, truncated, feedbackOnly };
}
export { controlName as genericProbeControlName };
export function runMaintenanceGenericProbe(root, { budget = TIME_BUDGET_MS, recordResult = true } = {}) {
    const started = Date.now();
    const opened = openGenericProbeSandbox(root);
    if (!opened)
        return null;
    const openedMs = Date.now() - started;
    try {
        const controls = collectGenericProbeControls(opened);
        const collectedMs = Date.now() - started - openedMs;
        const { outcomes, truncated: timedOut, feedbackOnly } = probeGenericControls(opened.details, controls, started, budget);
        const dead = [];
        const contentStill = [];
        let tested = 0, skipped = 0, uncertain = 0;
        for (const [control, outcome] of outcomes) {
            if (outcome === 'skip') {
                skipped += 1;
                continue;
            }
            if (outcome === 'uncertain') {
                uncertain += 1;
                continue;
            }
            tested += 1;
            if (outcome === 'dead')
                dead.push(controlName(control.element));
            else if (feedbackOnly.has(control))
                contentStill.push(controlName(control.element));
        }
        const controlLimitReached = !!opened.controlLimitReached;
        const result = { tested, dead, feedbackOnly: contentStill, skipped, uncertain,
            truncated: timedOut || controlLimitReached, controlLimitReached, total: opened.controlCount,
            ms: { open: openedMs, collect: collectedMs, total: Date.now() - started } };
        if (recordResult) {
            try {
                root.setAttribute(GENERIC_PROBE_RESULT_ATTR, JSON.stringify(result));
            }
            catch { }
        }
        return result;
    }
    catch (error) {
        console.debug('[RabbitMirror] generic probe failed:', error);
        return null;
    }
    finally {
        try {
            opened.sandbox.destroy();
        }
        catch { }
    }
}
export function describeGenericProbe(result) {
    if (!result)
        return '';
    const notes = `${result.uncertain ? `${__rmT("7os")}${result.uncertain}${__rmT("xBwPDjyHVteeIlLpARMzzo60jgis8EB8cJwIT0EL")}` : ''}${result.controlLimitReached ? __rmT("xzy0.4iIwvSF4vr1OGtP41RnhocUsGgE7JcQm7xxVaEA4ZWhUnCRSh") : result.truncated ? __rmT("Udcfw4iRN9mp1SNbT0gM9V4U3dk") : ''}`;
    if (!result.tested) {
        if (result.truncated || result.uncertain)
            return `${__rmT("SmTRtsoIce_5w.tm1oK5rGo4WXudXawC4miTTw7V6nY")}${notes}`;
        return result.total ? `${__rmT("BRSFwLop")}${result.skipped || 0}${__rmT("tMtBkZx63ygSo3RdQTNP9IJJOp7iMeLV7R7FPh")}` : __rmT("SmTRtsoIj83bOKtm1ommcOuG9_xwXA0xVi2ct3Xsawk");
    }
    const still = Array.isArray(result.feedbackOnly) ? result.feedbackOnly : [];
    const stillText = still.length ? `${__rmT("Y0f8AcmXHKG")}${still.length}${__rmT("FmQ4EO1CCeSYbYDTlVvkItI_0ab6bSouPAYuDb.I73izxLOkB9wI38Usy8YIB00P")}${[...new Set(still)].slice(0, 5).map(name => `${__rmT("YSk")}${name}${__rmT("Yvk")}`).join('')}${still.length > 5 ? '…' : ''}` : '';
    if (!result.dead.length)
        return `${__rmT("klW..RjW4Q986X2xQn1.SUPTjFs")}${result.tested}${__rmT("Uqe0v6IWvBcAtf")}${still.length ? __rmT("0kkPpOF0FFIiCf") : __rmT("VGwBvgto1wVyltIC")}${stillText}${notes}`;
    const names = [...new Set(result.dead)].slice(0, 5).map(name => `${__rmT("YSk")}${name}${__rmT("Yvk")}`).join('');
    return `${__rmT("BRSFwLop")}${result.tested}${__rmT("7ac8YdZaIzbB1a3_gPD")}${result.dead.length}${__rmT("9TYO0MF.s2GIKRwSw6fjj4TtjpbnxTbY")}${names}${result.dead.length > 5 ? '…' : ''}${stillText}${notes}`;
}
