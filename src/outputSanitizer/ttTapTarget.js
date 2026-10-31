import { isRabbitMirrorOuterChatDetails } from './runtime.js?rmv=2.3.5';
const TOOLS = '[data-rabbit-mirror-tool-entry-host], [data-rabbit-mirror-maintenance-rabbit], '
    + '[data-rabbit-mirror-feedback-cat], [data-rabbit-mirror-recipe], [data-rabbit-mirror-resay], '
    + '[data-rm-manual-generate], [data-rm-face-swipe-host], [data-rm-image-region], [data-rm-image-portal], '
    + '[data-rabbit-mirror-maintenance-menu], [data-rabbit-mirror-feedback-cat-menu], '
    + '[data-rabbit-mirror-recipe-menu], [data-rabbit-mirror-interaction-diagnostic]';
const ACTIONS = 'summary, button, label, input, select, textarea, a[href], [role="button"]';
const GESTURES = '[data-rm-hold], [data-rm-charge], [data-rm-knob], [data-rm-surface], '
    + '[data-rm-canvas], [draggable="true"], [data-rm-ui="swipe"] [data-rm-card], '
    + '[data-rm-ui="drag"] [data-rm-item], [data-rm-ui="reorder"] [data-rm-item]';
export function rabbitMirrorChatTapTarget(target) {
    if (!(target instanceof Element) || target.closest(TOOLS))
        return null;
    let outer = target.closest('details');
    while (outer && !isRabbitMirrorOuterChatDetails(outer))
        outer = outer.parentElement?.closest('details');
    if (!outer)
        return null;
    const element = target.closest(ACTIONS);
    if (!element || !outer.contains(element))
        return null;
    const summary = element.matches('summary') ? element : null;
    const disclosure = summary?.parentElement;
    if (summary && !disclosure?.matches('details'))
        return null;
    if (!summary && outer.querySelector(':scope > summary')?.contains(element))
        return null;
    const kind = summary ? disclosure === outer ? 'outer' : 'details'
        : element.matches('label') ? 'label' : element.matches('input') ? 'input' : 'control';
    let fast = !target.closest('[inert], [aria-disabled="true"], [contenteditable="true"], ' + GESTURES)
        && !element.matches(':disabled') && typeof element.click === 'function';
    if (element.matches('select, textarea') || (element.matches('input')
        && !element.matches('input[type="checkbox"], input[type="radio"], input[type="button"]')))
        fast = false;
    if (element.matches('button, input') && element.form)
        fast = false;
    if (element.matches('a') && !/^#[^\s]+$/.test(element.getAttribute('href') || ''))
        fast = false;
    if (kind === 'label') {
        const input = element.control;
        if (!input || !outer.contains(input) || input.matches(':disabled')
            || !input.matches('input[type="checkbox"], input[type="radio"]'))
            fast = false;
    }
    return { element, details: outer, summary, disclosure,
        receipt: disclosure || element, kind, fast };
}
