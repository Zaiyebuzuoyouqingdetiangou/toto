import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=2.1.6";
import { RAW_SCRIPT_TIMELINE_RESCUE_ATTR } from './checkedStateRescue.js?rmv=2.1.6';
import { hasBehaviorInteractionControl, isBehaviorInteractionOwned } from './behaviorInteractions.js?rmv=2.1.6';
import { isNameMaskActive, unmaskNameMaskClone, writeNameMaskOriginalText } from '../nameMask.js?rmv=2.1.6';
import { FEEDBACK_CAT_ATTR, MAINTENANCE_RABBIT_ATTR, RECIPE_BUTTON_ATTR, TOOL_ENTRY_HOST_ATTR, escapeCssIdentifier, } from './runtime.js?rmv=2.1.6';
import { DETACHED_CHECKED_HAS_CONTROL_ATTR, DIRECT_ID_CLASS_STATE_RESCUE_ATTR, DIRECT_ID_CLICK_RESCUE_ATTR, HINTED_PSEUDO_RESCUE_ATTR, INLINE_PSEUDO_RESCUE_ATTR, interactionCapabilityStates, } from './checkedStateRescue.js?rmv=2.1.6';
import { RENDERED_BUTTON_ADJACENT_HIDDEN_RESCUE_ATTR, RENDERED_CLICKABLE_ADJACENT_HIDDEN_RESCUE_ATTR, RENDERED_CLICKABLE_ADJACENT_POPUP_RESCUE_ATTR, RENDERED_CSS_STATE_SIBLING_RESCUE_ATTR, findRenderedButtonAdjacentHiddenTarget, findRenderedClickableAdjacentHiddenTarget, findRenderedClickableAdjacentPopupTarget, getClassTokens, } from './renderedStateRescue.js?rmv=2.1.6';
import { RAW_SELF_MUTATION_RESCUE_ATTR, detectInteractionCapabilities, filterRabbitMirrorRuntimeText, isRabbitMirrorRuntimeTextTarget, } from './scriptedInteractionRescue.js?rmv=2.1.6';
import { DISABLED_ONLY_CHOICE_CONTROL_ATTR, DISABLED_ONLY_CHOICE_RESCUE_ATTR, FILL_IN_CHOICE_ACTIVE_ATTR, FILL_IN_CHOICE_AVAILABLE_ATTR, FILL_IN_CHOICE_BLANK_ATTR, FILL_IN_CHOICE_CODE_ATTR, FILL_IN_CHOICE_COUNT_ATTR, FILL_IN_CHOICE_FILLED_ATTR, FILL_IN_CHOICE_OPTION_ATTR, FILL_IN_CHOICE_RESCUE_ATTR, FILL_IN_CHOICE_SELECTED_ATTR, FILL_IN_CHOICE_STYLE_ATTR, FILL_IN_CHOICE_USED_ATTR, INERT_ACTION_BUTTON_RESCUE_ATTR, INERT_ACTION_STATUS_ATTR, RESAY_ATTR, SELECTION_ONLY_FALLBACK_ATTR, SELECTION_ONLY_PLACEHOLDER_ATTR, SELECTION_ONLY_SOURCE_ATTR, STATIC_CHOICE_SELECTION_COUNT_ATTR, STATIC_CHOICE_SELECTION_ITEM_ATTR, STATIC_CHOICE_SELECTION_RESCUE_ATTR, STATIC_CHOICE_SELECTION_SELECTED_ATTR, STATIC_CHOICE_SELECTION_STYLE_ATTR, STRUCTURED_STATIC_DISCLOSURE_BODY_ATTR, STRUCTURED_STATIC_DISCLOSURE_COUNT_ATTR, STRUCTURED_STATIC_DISCLOSURE_OPEN_ATTR, STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR, STRUCTURED_STATIC_DISCLOSURE_STYLE_ATTR, STRUCTURED_STATIC_DISCLOSURE_TRIGGER_ATTR, diagnosticCompactText, diagnosticComputedStyle, diagnosticFindAssociatedLabel, diagnosticIsInternalUiNode, diagnosticQueryContentAll, fillInChoiceRescueStates, staticChoiceSelectionRescueStates, structuredStaticDisclosureRescueStates, } from './diagnostics.js?rmv=2.1.6';
import { maintenanceCheckedInteractionDepth } from './maintenanceInspect.js?rmv=2.1.6';
const STATIC_CHOICE_TITLE_RE = __rmR("rkdNBmRbbqSyXPQJ.K2UtVOAlbUgJslhLvOYX01RG.T1gPPSqr7TPuXuFIO21JcFhOJYmBaHmgLbwkuJgt32kbppDZwidZIXRy475w.tjd0lGkS6RfsQ.SBgm6RuLG2IDVXTAUpuS5a2exFcrOE9ZKm7re6iI8BA2K3gTZC.nc0M.KFRHZts8QAopoBVVWHZZda19lVFg_a8pdkLb7rLMky45zGmrAyy4ClwA6yr4Hn8.HxewD_", "i");
const STATIC_CHOICE_CONTEXT_RE = __rmR("CxtVVDf6_eVnRLbjmL3IiM9q6mof0L4GxYnJs4FaQs6xCSC6lGZTislSSMSPL.9AL4d0Xe2QzYCuc2ANHXso_HfNmrOTviGiJBkT4Nmzkkwa7R1x4m.z15DxiErNTX9xVOq90YdfxKbK2lYW2jPRpxXfZr3Bq29a7wL6GHFT", "i");
const FILL_IN_CHOICE_PLACEHOLDER_RE = __rmR("3I8YXrY_Bo3_fC1RDqgbz21CUj7RG9hvLHvVGMmm7HQTFarqXzA89v5EKMxKbTzEfKD9mgIDtTm2x4j5JdGrvZ1oClej9hmKMoTbIeI2C7lsHJ_9IjvdTgJLmbf5ssoOOacIDwwpnmEB1XOP8EJN3zKOBzY", "i");
const FILL_IN_CHOICE_HINT_RE = __rmR("GTN0Zzu7VULEPXt2Yi1h0eaBnvPmLdwy2Q42YMUkM6dVmRkn9v_gn._H.9jCqAqhK6NpG7RT..dqbMohbPNrhAx4WlIs1bjCJTJNBda5IxFz_625hSmBV4cYzxotxfUr0_68BbYm5.ndfDW8GkgpPHxGfbCYEL09Cxp", "i");
const FILL_IN_CHOICE_CONTEXT_RE = __rmR("F_.pZcO41i2_Rua3qnDCbbXQ1X0I14UKGFw9KzzSaj6RkdsRjrf2JQP5tP3omP9bUN0NI6LF.zmABPR3cX3qnq4v9Q3PCbwH3fFkAt8Qwala8ZN9I632Jkzd5secA5Q4Cz9xl717X1kj6iWXVQHnCqed", "i");
const STRUCTURED_STATIC_DISCLOSURE_INTENT_RE = __rmR("SO5E1emkGKnMF1yhyqRD92NmD9ATMyZK4OskEhmefkoKVENPL4Ng0l36OaUUP4Gtt8tYLTd_5NBHhElguQJdvsnnUkoo9Z9q_75HrkwthBEdL4eMY1XtPWbqQO9ASd1f.FuGONXa2jAd0_8cHEWpSG4P6iwAn97h5hUCEHETiRsJP9K6.CSND32bKRuXO9DmeNjTVuZ71xPBLxC9qayF4zsgKrrCLND6.uN0NpGrd5DkaJRP4MrHkwoxp1nNsHQwskZafI0ifaeh8fvd6ScUafs_hxFnfy0Fkp7RdK_hA5nMb8mM90VBMtsNWB9HKNiAmENgB3KvordNfiy00eq8DyAZdkFjwTFOQJXtpn.1cu59VlKlCML30prCyeteOuUHi.0nDZYpkz.h0cwYiof", "i");
const STRUCTURED_STATIC_DISCLOSURE_CLASS_RE = /(?:accordion|collapse|collapsible|disclosure|toggle|expander|fold|drawer|spoiler|reveal|expandable)/i;
const MAINTENANCE_PERSISTED_REPAIR_ATTR = 'data-rabbit-mirror-maintenance-persisted-layout';
const INERT_ACTION_BUTTON_TEXT_RE = __rmR("95gMVjHN4JzLbuFi1ZvPC.y0kdhS4GnbSmmZb9D4WbKX66cezCbBlg1Lysx1F61ISI8MyVB9pd6kOykvO7P7qCTr2Tf1AHbQExkGLF8JcpuV_ZklZln63GtCREeCgb1Vq09xcS5dhaF2ZKVgSAHFx9mulaehofXjuBAG8_A2_Sumvo98AoylIFE9KuO8DCU7Vf.c1t0DA8Z7GMMG2ebtNLn4x3_ECKtau3JcVu76KqM95tktik0eSwAAzUhgJgq7.rGLDgH.YZsOL9LBilHXnUZM5QIeHAMPejyBR8KP6BUlH3X.VJ0e9sqUALvMcwSwpmLNhhiEdGVRKZ9aqPYEZBQI2i_g9sT7EOQnwRHdDQbb8ecZR_kvycQCValOtawXmcJNqtSaTf6CEXu2s5wqHhKM7wYyiGjT7OeH2qKKLiAtl1wcDM7VZU4ze8A9bxyYs1Gnh8zg_op1s3gkg2B0g42NVoy21T40pnox56YQhCWOvBAK_cls.WMqi3NyXXE_uFrDre4bxHL4IWKPuzQgF9eYPaXdbOgyDcARCM1cToRvtvw5abZiLCPi964L9GCnS3835KW82js9sGIoX1f_Tneg8v3ttRf2e1quwQPVtxZRITRG9pT.w092yZEiQ.lnvT8GieLTFYiRuja.lwrz__nAZdjwKrGDykCZWaHT.jMfYYkSc71VeYmbnsXjCo9gF5bOjldJtxHfCzKXjlce7eIhmtBkNQZP_RZtPl.CnNHzU9z1hEo5g_dU", "i");
const INERT_ACTION_RITUAL_TEXT_RE = __rmR("twyaRI0mLewjoE0abxW.MNULRFbIw17cfJ8Q_42l4DwA9VYG3IUCdejLfcnMsuv.98w9x0BYCkGbxOV20QCyCXOhs0oHwfAmFNdsNPMexTlMg35PDdD6qzwobZmzQMCj0gqaBjaa4E5qTqL1s1r0J747DiwU3b1TWzlCGj11fi3zKuQihwCnrye7h3bbOP9u.bX_oGVH1xEdoQWhB1MiIkNlwiMYOjHqjF.qkOjbbBt5m6iV", "i");
let inertActionStatusCounter = 0;
function selectionOnlyFallbackLabelText(input) {
    const label = input?.closest?.('label');
    const text = diagnosticCompactText(label?.textContent || input?.value || input?.id || __rmT("rT06fkn0"), 120);
    return text || __rmT("rT06fkn0");
}
function lowestCommonElementAncestor(elements, boundary) {
    const list = (elements || []).filter(Boolean);
    if (!list.length)
        return null;
    let node = list[0];
    while (node && node !== boundary) {
        if (list.every(element => node.contains?.(element)))
            return node;
        node = node.parentElement;
    }
    return boundary && list.every(element => boundary.contains?.(element)) ? boundary : null;
}
function nextSelectionOnlyContentRegion(groupContainer, root) {
    let current = groupContainer;
    while (current && current !== root) {
        let sibling = current.nextElementSibling;
        while (sibling) {
            const tag = String(sibling.tagName || '').toLowerCase();
            const text = String(sibling.textContent || '').replace(/\s+/g, ' ').trim();
            if (!['style', 'script', 'br'].includes(tag)
                && !(tag === 'p' && !text)
                && !diagnosticIsInternalUiNode(sibling)
                && !sibling.matches?.(`[${SELECTION_ONLY_PLACEHOLDER_ATTR}]`)) {
                const hasControls = !!sibling.querySelector?.('input, select, textarea, button, label');
                if (!hasControls && text.length >= 60)
                    return sibling;
                break;
            }
            sibling = sibling.nextElementSibling;
        }
        current = current.parentElement;
    }
    return null;
}
function maintenanceElementLooksClickable(element) {
    if (!element)
        return false;
    const inlineCursor = String(element.style?.getPropertyValue?.('cursor') || '').trim().toLowerCase();
    const computedCursor = String(diagnosticComputedStyle(element)?.cursor || '').trim().toLowerCase();
    return inlineCursor === 'pointer'
        || computedCursor === 'pointer'
        || element.getAttribute?.('role') === 'button'
        || element.hasAttribute?.('tabindex');
}
export function findDisabledOnlyChoiceGroupCandidates(root) {
    if (!root?.querySelectorAll)
        return [];
    const groups = new Map();
    for (const input of diagnosticQueryContentAll(root, 'input[type="radio"][name]')) {
        const name = String(input.name || '').trim();
        if (!name)
            continue;
        if (!groups.has(name))
            groups.set(name, []);
        groups.get(name).push(input);
    }
    const candidates = [];
    for (const inputs of groups.values()) {
        if (inputs.length < 2 || !inputs.every(input => input.disabled))
            continue;
        const labels = inputs.map(input => diagnosticFindAssociatedLabel(root, input)).filter(Boolean);
        if (labels.length !== inputs.length || !labels.some(maintenanceElementLooksClickable))
            continue;
        const groupContainer = lowestCommonElementAncestor(labels, root);
        if (!groupContainer || groupContainer === root || groupContainer.hasAttribute?.(DISABLED_ONLY_CHOICE_RESCUE_ATTR))
            continue;
        if (groupContainer.getAttribute?.('aria-disabled') === 'true')
            continue;
        candidates.push({ inputs, labels, groupContainer });
    }
    return candidates;
}
export function installDisabledOnlyChoiceFallback(root) {
    let installed = 0;
    for (const candidate of findDisabledOnlyChoiceGroupCandidates(root)) {
        for (const input of candidate.inputs) {
            input.setAttribute(DISABLED_ONLY_CHOICE_CONTROL_ATTR, 'true');
            input.disabled = false;
        }
        candidate.groupContainer.setAttribute(DISABLED_ONLY_CHOICE_RESCUE_ATTR, 'true');
        candidate.groupContainer.dataset.rabbitMirrorDisabledChoiceCount = String(candidate.inputs.length);
        installed += 1;
    }
    if (installed > 0)
        root.dataset.rabbitMirrorDisabledChoiceFallback = String(installed);
    return installed;
}
function staticChoiceCardTitle(element) {
    if (!element?.querySelector)
        return '';
    const title = element.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > header, :scope > strong, :scope > b');
    return diagnosticCompactText(title?.textContent || element.textContent || '', 160);
}
function staticChoiceCardHasRealControl(element) {
    if (!element?.querySelector)
        return false;
    return !!element.querySelector('button, input, select, textarea, a[href], label, details, summary, [popovertarget], [commandfor], [contenteditable="true"]');
}
function staticChoiceCardLooksEligible(element) {
    if (!element || diagnosticIsInternalUiNode(element) || staticChoiceCardHasRealControl(element))
        return false;
    const tag = String(element.tagName || '').toLowerCase();
    if (!/^(?:div|section|article|li|figure)$/.test(tag))
        return false;
    if (!maintenanceElementLooksClickable(element))
        return false;
    const text = diagnosticCompactText(element.textContent || '', 1600);
    if (text.length < 18 || text.length > 1500)
        return false;
    return STATIC_CHOICE_TITLE_RE.test(staticChoiceCardTitle(element));
}
export function findStaticChoiceSelectionCandidates(root) {
    if (!root?.querySelectorAll)
        return [];
    const candidates = [];
    const managedGroups = new Set((staticChoiceSelectionRescueStates.get(root)?.entries || []).map(entry => entry.group));
    for (const group of diagnosticQueryContentAll(root, 'div, section, article, main, ul, ol')) {
        if (isBehaviorInteractionOwned(group))
            continue;
        if (managedGroups.has(group))
            continue;
        const managedAncestor = group.parentElement?.closest?.(`[${STATIC_CHOICE_SELECTION_RESCUE_ATTR}]`);
        if (managedAncestor && managedGroups.has(managedAncestor))
            continue;
        if (group.querySelector?.('input, button, select, textarea, details, summary, [popovertarget], [commandfor]'))
            continue;
        const children = [...(group.children || [])]
            .filter(child => !/^(?:style|script|template|br)$/i.test(String(child.tagName || '')));
        if (children.length < 2 || children.length > 8)
            continue;
        if (!children.every(staticChoiceCardLooksEligible))
            continue;
        const style = diagnosticComputedStyle(group);
        const display = String(style?.display || group.style?.display || '').toLowerCase();
        if (!/(?:grid|flex)/.test(display))
            continue;
        const contextText = diagnosticCompactText(`${group.previousElementSibling?.textContent || ''} ${group.parentElement?.textContent || ''}`, 1200);
        const titles = children.map(staticChoiceCardTitle);
        if (!titles.every(title => STATIC_CHOICE_TITLE_RE.test(title)))
            continue;
        if (!STATIC_CHOICE_CONTEXT_RE.test(contextText) && children.length < 3)
            continue;
        candidates.push({ group, items: children, titles });
    }
    return candidates;
}
function ensureStaticChoiceSelectionStyle(root) {
    let style = root.querySelector?.(`style[${STATIC_CHOICE_SELECTION_STYLE_ATTR}]`);
    if (!style) {
        style = document.createElement('style');
        style.setAttribute(STATIC_CHOICE_SELECTION_STYLE_ATTR, 'true');
        root.appendChild(style);
    }
    style.textContent = `
[${STATIC_CHOICE_SELECTION_RESCUE_ATTR}] [${STATIC_CHOICE_SELECTION_ITEM_ATTR}] { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
[${STATIC_CHOICE_SELECTION_RESCUE_ATTR}="active"] [${STATIC_CHOICE_SELECTION_ITEM_ATTR}]:not([${STATIC_CHOICE_SELECTION_SELECTED_ATTR}="true"]) { opacity: .72 !important; }
[${STATIC_CHOICE_SELECTION_ITEM_ATTR}="true"][${STATIC_CHOICE_SELECTION_SELECTED_ATTR}="true"] { outline: 2px solid currentColor !important; outline-offset: 2px !important; }
`;
}
function applyStaticChoiceSelectionState(entry, selectedItem = null) {
    if (!entry?.group)
        return;
    entry.selectedItem = selectedItem && entry.items.includes(selectedItem) ? selectedItem : null;
    entry.group.setAttribute(STATIC_CHOICE_SELECTION_RESCUE_ATTR, entry.selectedItem ? 'active' : 'true');
    for (const item of entry.items) {
        const selected = item === entry.selectedItem;
        item.setAttribute(STATIC_CHOICE_SELECTION_SELECTED_ATTR, selected ? 'true' : 'false');
        item.setAttribute('aria-checked', selected ? 'true' : 'false');
    }
}
export function installStaticChoiceSelectionFallback(root) {
    if (!root?.querySelectorAll)
        return 0;
    const candidates = findStaticChoiceSelectionCandidates(root);
    if (!candidates.length)
        return Number.parseInt(root.getAttribute?.(STATIC_CHOICE_SELECTION_COUNT_ATTR) || '0', 10) || 0;
    ensureStaticChoiceSelectionStyle(root);
    let state = staticChoiceSelectionRescueStates.get(root);
    if (!state) {
        state = { entries: [] };
        staticChoiceSelectionRescueStates.set(root, state);
    }
    let installed = 0;
    for (const candidate of candidates) {
        const rememberedSelectedItem = candidate.items.find(item => item.getAttribute?.(STATIC_CHOICE_SELECTION_SELECTED_ATTR) === 'true') || null;
        const entry = { ...candidate, selectedItem: rememberedSelectedItem };
        candidate.group.setAttribute(STATIC_CHOICE_SELECTION_RESCUE_ATTR, rememberedSelectedItem ? 'active' : 'true');
        candidate.group.setAttribute('role', 'radiogroup');
        candidate.group.setAttribute('aria-label', __rmT("TJCq8UsQmCD"));
        for (const [index, item] of candidate.items.entries()) {
            item.setAttribute(STATIC_CHOICE_SELECTION_ITEM_ATTR, 'true');
            item.setAttribute(STATIC_CHOICE_SELECTION_SELECTED_ATTR, 'false');
            item.setAttribute('role', 'radio');
            item.setAttribute('aria-checked', 'false');
            item.setAttribute('aria-label', candidate.titles[index] || `${__rmT("KxygZVc6")}${index + 1}`);
            if (!item.hasAttribute('tabindex'))
                item.setAttribute('tabindex', '0');
            const activate = event => {
                if (event?.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ')
                    return;
                if (event?.type === 'keydown')
                    event.preventDefault();
                if (event?.type === 'click' && event.target?.closest?.('a,button,input,select,textarea,label,summary'))
                    return;
                const next = entry.selectedItem === item ? null : item;
                applyStaticChoiceSelectionState(entry, next);
            };
            item.addEventListener('click', activate, false);
            item.addEventListener('keydown', activate, false);
        }
        state.entries.push(entry);
        applyStaticChoiceSelectionState(entry, rememberedSelectedItem);
        installed += 1;
    }
    const total = new Set([...root.querySelectorAll?.(`[${STATIC_CHOICE_SELECTION_RESCUE_ATTR}]`) || []]).size;
    if (total)
        root.setAttribute(STATIC_CHOICE_SELECTION_COUNT_ATTR, String(total));
    return installed;
}
function fillInChoiceDirectTextNode(element) {
    if (!element?.childNodes)
        return null;
    let fallback = null;
    for (const node of element.childNodes) {
        if (node?.nodeType !== 3)
            continue;
        fallback ||= node;
        if (FILL_IN_CHOICE_PLACEHOLDER_RE.test(String(node.nodeValue || '')))
            return node;
    }
    return fallback;
}
function fillInChoiceDirectText(element) {
    if (!element?.childNodes)
        return '';
    return [...element.childNodes]
        .filter(node => node?.nodeType === 3)
        .map(node => String(node.nodeValue || ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function fillInChoiceExtractCodes(value) {
    const raw = String(value || '').toUpperCase().replace(__rmR("Yos", "g"), '/');
    const found = [];
    const add = code => {
        const clean = String(code || '').trim().toUpperCase();
        if (!/^[A-Z0-9]{1,3}$/.test(clean) || found.includes(clean))
            return;
        found.push(clean);
    };
    for (const match of raw.matchAll(/\[\s*([A-Z0-9]{1,3})\s*\]/g))
        add(match[1]);
    const stripped = raw
        .replace(__rmR("kAvnGs1ITbopglDPxc8Og.ryr3D_YCg3LItZd4agOf84TilfuCZppRiW7gzIdY9j9I5K.mPHT8yS_Co9jX5Z24qtpP0YfLEVnFcg0hTh9JuWJ6a2qKo9UwAW2Am2yE5CaBOAfMMyDyzh2OLq0FWtWG_onZnaiaq.1qfNfT", "g"), ' ')
        .replace(__rmR("AkY0TYGQHfGrjmzW5It9lrFGaIZBUpkP", "g"), ' ');
    for (const token of stripped.split(__rmR("19eSeERCU8UVPy4v6UipDOYAqSrSA99w7FE", "")))
        add(token);
    return found;
}
function fillInChoiceBlankEvidence(element) {
    if (!element || diagnosticIsInternalUiNode(element))
        return null;
    const tag = String(element.tagName || '').toLowerCase();
    if (!/^(?:span|div|p|em|strong|b|i|code|small)$/.test(tag))
        return null;
    if (element.querySelector?.('button, input, select, textarea, a[href], label, details, summary'))
        return null;
    const directText = fillInChoiceDirectText(element);
    const semantic = `${element.id || ''} ${getClassTokens(element).join(' ')} ${element.getAttribute?.('title') || ''}`;
    if (!FILL_IN_CHOICE_PLACEHOLDER_RE.test(`${directText} ${semantic}`))
        return null;
    let hintNode = null;
    let allowedCodes = [];
    for (const node of element.querySelectorAll?.('*') || []) {
        const hint = diagnosticCompactText(node.textContent || '', 180);
        if (!FILL_IN_CHOICE_HINT_RE.test(hint))
            continue;
        const codes = fillInChoiceExtractCodes(hint);
        if (!codes.length)
            continue;
        hintNode = node;
        allowedCodes = codes;
        break;
    }
    if (!allowedCodes.length) {
        const fallbackHint = `${element.getAttribute?.('aria-label') || ''} ${element.getAttribute?.('title') || ''}`;
        allowedCodes = fillInChoiceExtractCodes(fallbackHint);
    }
    if (!allowedCodes.length)
        return null;
    const textNode = fillInChoiceDirectTextNode(element);
    if (!textNode)
        return null;
    return {
        blank: element,
        textNode,
        originalText: String(textNode.nodeValue || ''),
        placeholder: directText || '_______',
        hintNode,
        allowedCodes,
    };
}
function fillInChoiceOptionEvidence(element) {
    if (!element || diagnosticIsInternalUiNode(element))
        return null;
    const tag = String(element.tagName || '').toLowerCase();
    if (!/^(?:div|li|p|span|article|section)$/.test(tag))
        return null;
    if (element.querySelector?.('button, input, select, textarea, a[href], label, details, summary'))
        return null;
    const directTag = [...(element.children || [])].find(child => /^\s*\[[A-Z0-9]{1,3}\]\s*$/i.test(String(child.textContent || '')));
    let code = '';
    let tagText = '';
    if (directTag) {
        tagText = String(directTag.textContent || '').trim();
        code = fillInChoiceExtractCodes(tagText)[0] || '';
    }
    else {
        const directText = fillInChoiceDirectText(element);
        const match = /^\s*\[([A-Z0-9]{1,3})\]\s*/i.exec(directText);
        if (!match)
            return null;
        code = String(match[1] || '').toUpperCase();
        tagText = match[0];
    }
    if (!code)
        return null;
    const allText = diagnosticCompactText(element.textContent || '', 240);
    const label = diagnosticCompactText(allText.replace(tagText, ''), 180);
    if (label.length < 2 || label.length > 160)
        return null;
    const nestedTagged = [...(element.querySelectorAll?.('div, li, p, span, article, section') || [])]
        .filter(node => node !== element && node !== directTag)
        .some(node => {
        const direct = fillInChoiceDirectText(node);
        const total = diagnosticCompactText(node.textContent || '', 220);
        return /^\s*\[[A-Z0-9]{1,3}\]/i.test(direct) && total.replace(direct, '').trim().length >= 2;
    });
    if (nestedTagged)
        return null;
    return { option: element, code, label, tagText };
}
function fillInChoiceOriginalElement(element) {
    const clone = element.cloneNode(true);
    unmaskNameMaskClone(clone, element);
    return clone;
}
function fillInChoiceOriginalBlank(entry) {
    if (!isNameMaskActive())
        return entry;
    const clone = fillInChoiceOriginalElement(entry.blank);
    const index = [...entry.blank.childNodes].indexOf(entry.textNode);
    return { ...entry, originalText: String(clone.childNodes[index].nodeValue || ''),
        placeholder: fillInChoiceDirectText(clone) || '_______' };
}
function fillInChoiceOriginalOption(item) {
    if (!isNameMaskActive())
        return item;
    const clone = fillInChoiceOriginalElement(item.option);
    const text = diagnosticCompactText(clone.textContent || '', item.tagText ? 240 : 180);
    const label = item.tagText
        ? diagnosticCompactText(text.replace(item.tagText, ''), 180)
        : text.replace(new RegExp(`^\\s*\\[?${item.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]?\\s*`), '').trim();
    return { ...item, label };
}
function fillInChoiceHasExistingControl(root) {
    if (!root?.querySelectorAll)
        return true;
    const outerDetails = root.matches?.('details') ? root : root.querySelector?.(':scope > details');
    const outerSummary = outerDetails?.querySelector?.(':scope > summary') || null;
    return diagnosticQueryContentAll(root, 'button, input:not([type="hidden"]), select, textarea, a[href], label, details, summary, [contenteditable="true"], [popovertarget], [commandfor]')
        .some(element => {
        if (outerSummary && (element === outerSummary || outerSummary.contains?.(element)))
            return false;
        if (element === outerDetails)
            return false;
        if (element.matches?.(`[${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [${RECIPE_BUTTON_ATTR}], [${RESAY_ATTR}], [${TOOL_ENTRY_HOST_ATTR}]`))
            return false;
        return true;
    });
}
export function findFillInChoiceCandidates(root) {
    if (!root?.querySelectorAll || fillInChoiceHasExistingControl(root))
        return [];
    if (Number.parseInt(root.getAttribute?.(FILL_IN_CHOICE_COUNT_ATTR) || '0', 10) > 0)
        return [];
    const blanks = diagnosticQueryContentAll(root, 'span, div, p, em, strong, b, i, code, small')
        .map(fillInChoiceBlankEvidence)
        .filter(Boolean)
        .filter(entry => !entry.blank.closest?.(`[${FILL_IN_CHOICE_RESCUE_ATTR}]`));
    if (!blanks.length || blanks.length > 12)
        return [];
    const options = diagnosticQueryContentAll(root, 'div, li, p, span, article, section')
        .map(fillInChoiceOptionEvidence)
        .filter(Boolean);
    if (options.length < 2 || options.length > 36)
        return [];
    const optionCodes = new Set(options.map(item => item.code));
    const matchedBlanks = blanks.map(entry => ({
        ...entry,
        allowedCodes: entry.allowedCodes.filter(code => optionCodes.has(code)),
    })).filter(entry => entry.allowedCodes.length > 0);
    if (!matchedBlanks.length)
        return [];
    const usedCodes = new Set(matchedBlanks.flatMap(entry => entry.allowedCodes));
    const matchedOptions = options.filter(item => usedCodes.has(item.code));
    if (matchedOptions.length < 2)
        return [];
    const contextText = diagnosticCompactText(root.textContent || '', 2600);
    if (!FILL_IN_CHOICE_CONTEXT_RE.test(contextText))
        return [];
    if (matchedBlanks.length === 1 && matchedOptions.length < 2)
        return [];
    return [{ blanks: matchedBlanks, options: matchedOptions }];
}
function ensureFillInChoiceStyle(root) {
    let style = root.querySelector?.(`style[${FILL_IN_CHOICE_STYLE_ATTR}]`);
    if (!style) {
        style = document.createElement('style');
        style.setAttribute(FILL_IN_CHOICE_STYLE_ATTR, 'true');
        root.appendChild(style);
    }
    style.textContent = `
[${FILL_IN_CHOICE_BLANK_ATTR}] { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
[${FILL_IN_CHOICE_BLANK_ATTR}][${FILL_IN_CHOICE_ACTIVE_ATTR}="true"] { outline: 2px solid currentColor !important; outline-offset: 3px !important; }
[${FILL_IN_CHOICE_BLANK_ATTR}][${FILL_IN_CHOICE_FILLED_ATTR}="true"] { font-style: normal !important; min-width: 0 !important; }
[${FILL_IN_CHOICE_OPTION_ATTR}] { cursor: pointer !important; touch-action: manipulation; -webkit-tap-highlight-color: transparent; transition: opacity .16s ease, outline-color .16s ease, transform .16s ease; }
[${FILL_IN_CHOICE_RESCUE_ATTR}="active"] [${FILL_IN_CHOICE_OPTION_ATTR}][${FILL_IN_CHOICE_AVAILABLE_ATTR}="false"] { opacity: .34 !important; pointer-events: none !important; }
[${FILL_IN_CHOICE_OPTION_ATTR}][${FILL_IN_CHOICE_SELECTED_ATTR}="true"] { outline: 2px solid currentColor !important; outline-offset: 2px !important; }
[${FILL_IN_CHOICE_OPTION_ATTR}][${FILL_IN_CHOICE_USED_ATTR}="true"] { box-shadow: inset 0 0 0 1px currentColor !important; }
[${FILL_IN_CHOICE_BLANK_ATTR}]:focus-visible, [${FILL_IN_CHOICE_OPTION_ATTR}]:focus-visible { outline: 2px solid currentColor !important; outline-offset: 3px !important; }
`;
}
function fillInChoiceSetBlankText(entry, value) {
    if (!entry?.textNode || !isRabbitMirrorRuntimeTextTarget(entry.textNode))
        return false;
    const text = filterRabbitMirrorRuntimeText(value);
    try {
        if (isNameMaskActive())
            return writeNameMaskOriginalText(entry.textNode, text);
        entry.textNode.nodeValue = text;
        return true;
    }
    catch (error) {
        console.debug('[RabbitMirror] fill choice original text could not be restored:', error);
        return false;
    }
}
function applyFillInChoiceState(state) {
    if (!state?.root)
        return;
    state.root.setAttribute(FILL_IN_CHOICE_RESCUE_ATTR, state.activeEntry ? 'active' : 'true');
    for (const entry of state.entries) {
        const active = state.activeEntry === entry;
        entry.blank.setAttribute(FILL_IN_CHOICE_ACTIVE_ATTR, active ? 'true' : 'false');
        entry.blank.setAttribute(FILL_IN_CHOICE_FILLED_ATTR, entry.selectedCode ? 'true' : 'false');
        if (entry.selectedCode)
            entry.blank.setAttribute(FILL_IN_CHOICE_CODE_ATTR, entry.selectedCode);
        else
            entry.blank.removeAttribute(FILL_IN_CHOICE_CODE_ATTR);
        entry.blank.setAttribute('aria-expanded', active ? 'true' : 'false');
        entry.blank.setAttribute('aria-label', entry.selectedLabel
            ? `${__rmT("4RMuSrop")}${entry.selectedLabel}${__rmT("mW781vX24tZrl0n6wJwhNhHqKRXYPNm1ws2Q8HW7")}` : __rmT("dwvuVmVSdelDedeUvnoSP5NlN1OP_2MDwEW1if"));
    }
    for (const item of state.options) {
        const available = !state.activeEntry || state.activeEntry.allowedCodes.includes(item.code);
        const selected = !!state.activeEntry && state.activeEntry.selectedCode === item.code;
        const used = state.entries.some(entry => entry.selectedCode === item.code);
        item.option.setAttribute(FILL_IN_CHOICE_AVAILABLE_ATTR, available ? 'true' : 'false');
        item.option.setAttribute(FILL_IN_CHOICE_SELECTED_ATTR, selected ? 'true' : 'false');
        item.option.setAttribute(FILL_IN_CHOICE_USED_ATTR, used ? 'true' : 'false');
        item.option.setAttribute('aria-disabled', available ? 'false' : 'true');
        item.option.setAttribute('aria-selected', selected ? 'true' : 'false');
        item.option.tabIndex = available ? 0 : -1;
    }
}
function fillInChoiceClearEntry(state, entry, { focus = true } = {}) {
    if (!entry)
        return;
    if (!fillInChoiceSetBlankText(entry, entry.originalText || entry.placeholder || '_______'))
        return;
    entry.selectedCode = '';
    entry.selectedLabel = '';
    state.activeEntry = null;
    applyFillInChoiceState(state);
    if (focus)
        entry.blank.focus?.();
}
function fillInChoiceSelectOption(state, entry, optionEntry) {
    if (!entry || !optionEntry || !entry.allowedCodes.includes(optionEntry.code))
        return;
    if (entry.selectedCode === optionEntry.code) {
        fillInChoiceClearEntry(state, entry);
        return;
    }
    if (!fillInChoiceSetBlankText(entry, optionEntry.label))
        return;
    entry.selectedCode = optionEntry.code;
    entry.selectedLabel = optionEntry.label;
    state.activeEntry = null;
    applyFillInChoiceState(state);
    entry.blank.focus?.();
}
function fillInChoiceEligibleOptions(state) {
    if (!state?.activeEntry)
        return state?.options || [];
    return state.options.filter(item => state.activeEntry.allowedCodes.includes(item.code));
}
export function installFillInChoiceFallback(root) {
    if (!root?.querySelectorAll)
        return 0;
    const candidates = findFillInChoiceCandidates(root).map(candidate => ({
        blanks: candidate.blanks.map(fillInChoiceOriginalBlank),
        options: candidate.options.map(fillInChoiceOriginalOption),
    }));
    if (!candidates.length)
        return Number.parseInt(root.getAttribute?.(FILL_IN_CHOICE_COUNT_ATTR) || '0', 10) || 0;
    ensureFillInChoiceStyle(root);
    let state = fillInChoiceRescueStates.get(root);
    if (!state) {
        state = { root, entries: [], options: [], activeEntry: null };
        fillInChoiceRescueStates.set(root, state);
    }
    let installed = 0;
    for (const candidate of candidates) {
        for (const rawEntry of candidate.blanks) {
            if (state.entries.some(entry => entry.blank === rawEntry.blank))
                continue;
            const entry = { ...rawEntry, selectedCode: '', selectedLabel: '' };
            entry.blank.setAttribute(FILL_IN_CHOICE_BLANK_ATTR, 'true');
            entry.blank.setAttribute('role', 'button');
            if (!entry.blank.hasAttribute('tabindex'))
                entry.blank.tabIndex = 0;
            state.entries.push(entry);
            installed += 1;
            entry.blank.addEventListener('click', event => {
                if (event.target?.closest?.(`[${FILL_IN_CHOICE_OPTION_ATTR}]`))
                    return;
                state.activeEntry = state.activeEntry === entry ? null : entry;
                applyFillInChoiceState(state);
            }, false);
            entry.blank.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    state.activeEntry = state.activeEntry === entry ? null : entry;
                    applyFillInChoiceState(state);
                    if (state.activeEntry === entry)
                        fillInChoiceEligibleOptions(state)[0]?.option?.focus?.();
                    return;
                }
                if ((event.key === 'Delete' || event.key === 'Backspace') && entry.selectedCode) {
                    event.preventDefault();
                    fillInChoiceClearEntry(state, entry);
                    return;
                }
                if (event.key === 'Escape') {
                    event.preventDefault();
                    state.activeEntry = null;
                    applyFillInChoiceState(state);
                }
            }, false);
        }
        for (const rawOption of candidate.options) {
            if (state.options.some(item => item.option === rawOption.option))
                continue;
            const item = { ...rawOption };
            item.option.setAttribute(FILL_IN_CHOICE_OPTION_ATTR, 'true');
            item.option.setAttribute(FILL_IN_CHOICE_CODE_ATTR, item.code);
            item.option.setAttribute('role', 'option');
            if (!item.option.hasAttribute('tabindex'))
                item.option.tabIndex = 0;
            state.options.push(item);
            const choose = event => {
                if (event?.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ')
                    return;
                if (event?.type === 'keydown')
                    event.preventDefault();
                let entry = state.activeEntry;
                if (!entry || !entry.allowedCodes.includes(item.code)) {
                    const eligible = state.entries.filter(candidateEntry => candidateEntry.allowedCodes.includes(item.code));
                    entry = eligible.find(candidateEntry => !candidateEntry.selectedCode) || eligible[0] || null;
                }
                if (!entry)
                    return;
                fillInChoiceSelectOption(state, entry, item);
            };
            item.option.addEventListener('click', choose, false);
            item.option.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    choose(event);
                    return;
                }
                if (event.key === 'Escape') {
                    event.preventDefault();
                    const active = state.activeEntry;
                    state.activeEntry = null;
                    applyFillInChoiceState(state);
                    active?.blank?.focus?.();
                    return;
                }
                const eligible = fillInChoiceEligibleOptions(state);
                const currentIndex = eligible.indexOf(item);
                if (currentIndex < 0)
                    return;
                let nextIndex = currentIndex;
                if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
                    nextIndex = (currentIndex + 1) % eligible.length;
                else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
                    nextIndex = (currentIndex - 1 + eligible.length) % eligible.length;
                else if (event.key === 'Home')
                    nextIndex = 0;
                else if (event.key === 'End')
                    nextIndex = eligible.length - 1;
                else
                    return;
                event.preventDefault();
                eligible[nextIndex]?.option?.focus?.();
            }, false);
        }
    }
    if (installed > 0 && !state.outsideListenerInstalled) {
        root.addEventListener('click', event => {
            if (!state.activeEntry)
                return;
            if (event.target?.closest?.(`[${FILL_IN_CHOICE_BLANK_ATTR}], [${FILL_IN_CHOICE_OPTION_ATTR}]`))
                return;
            state.activeEntry = null;
            applyFillInChoiceState(state);
        }, false);
        state.outsideListenerInstalled = true;
    }
    const total = state.entries.length;
    if (total)
        root.setAttribute(FILL_IN_CHOICE_COUNT_ATTR, String(total));
    applyFillInChoiceState(state);
    return installed;
}
function structuredStaticDisclosureInlineStyle(element) {
    return String(element?.getAttribute?.('style') || '').toLowerCase();
}
function structuredStaticDisclosureFontWeight(element) {
    const style = diagnosticComputedStyle(element);
    const raw = String(style?.fontWeight || element?.style?.fontWeight || '').toLowerCase();
    if (raw === 'bold' || raw === 'bolder')
        return 700;
    const numeric = Number.parseInt(raw, 10);
    return Number.isFinite(numeric) ? numeric : 400;
}
function structuredStaticDisclosureLooksSegmented(container) {
    if (!container)
        return false;
    const style = diagnosticComputedStyle(container);
    const inline = structuredStaticDisclosureInlineStyle(container);
    const display = String(style?.display || container.style?.display || '').toLowerCase();
    const className = String(container.className || '').toLowerCase();
    return /(?:grid|flex)/.test(display)
        || /(?:border(?:-|:)|background(?:-|:)|box-shadow\s*:|padding\s*:)/.test(inline)
        || /(?:card|panel|item|entry|row|metric|stat|evidence|record|section|block)/.test(className);
}
function structuredStaticDisclosureTitleLooksExplicit(trigger, container, children) {
    const title = diagnosticCompactText(trigger?.textContent || '', 180);
    if (title.length < 2 || title.length > 120)
        return false;
    if (/^(?:h[1-6]|legend|dt|th)$/i.test(String(trigger?.tagName || '')))
        return true;
    if (structuredStaticDisclosureFontWeight(trigger) >= 600)
        return true;
    const triggerStyle = diagnosticComputedStyle(trigger);
    const textTransform = String(triggerStyle?.textTransform || trigger?.style?.textTransform || '').toLowerCase();
    const letterSpacing = Number.parseFloat(triggerStyle?.letterSpacing || trigger?.style?.letterSpacing || '0') || 0;
    if (textTransform && textTransform !== 'none')
        return true;
    if (Math.abs(letterSpacing) >= 0.4)
        return true;
    const emphasizedDescendant = [...(trigger.querySelectorAll?.('strong, b, h1, h2, h3, h4, h5, h6, [style]') || [])]
        .some(node => /font-weight\s*:\s*(?:bold|[6-9]00)\b/i.test(String(node.getAttribute?.('style') || ''))
        || /^(?:strong|b|h[1-6])$/i.test(String(node.tagName || '')));
    if (emphasizedDescendant)
        return true;
    if (children.length === 2 && structuredStaticDisclosureFontWeight(children[1]) >= 600)
        return true;
    return false;
}
function structuredStaticDisclosureBodyLooksMeaningful(bodies) {
    const visibleBodies = bodies.filter(body => {
        const style = diagnosticComputedStyle(body);
        const position = String(style?.position || body?.style?.position || '').toLowerCase();
        const opacity = Number.parseFloat(style?.opacity || body?.style?.opacity || '1');
        return position !== 'absolute' && position !== 'fixed' && !(Number.isFinite(opacity) && opacity <= 0.08);
    });
    if (!visibleBodies.length)
        return false;
    const textLength = visibleBodies.reduce((sum, body) => sum + diagnosticCompactText(body.textContent || '', 1200).length, 0);
    if (textLength >= 2)
        return true;
    return visibleBodies.some(body => {
        const inline = structuredStaticDisclosureInlineStyle(body);
        return /(?:background(?:-|:)|border(?:-|:)|height\s*:\s*(?:[2-9]|[1-9]\d))/i.test(inline)
            || !!body.querySelector?.('img, svg, canvas, video, progress, meter');
    });
}
function structuredStaticDisclosureHasExplicitIntent(trigger, container, ignoreGeneratedRescueSemantics = false) {
    if (!trigger || !container)
        return false;
    const ariaLabel = String(trigger.getAttribute?.('aria-label') || '');
    const generatedLabel = __rmR("yLA1flyJFkESMxdaVpA", "").test(ariaLabel);
    const semanticLabel = ignoreGeneratedRescueSemantics && generatedLabel ? '' : ariaLabel;
    const text = diagnosticCompactText(`${trigger.textContent || ''} ${semanticLabel} ${trigger.getAttribute?.('title') || ''}`, 220);
    if (STRUCTURED_STATIC_DISCLOSURE_INTENT_RE.test(text))
        return true;
    const identity = `${trigger.id || ''} ${trigger.className || ''} ${container.id || ''} ${container.className || ''}`;
    if (STRUCTURED_STATIC_DISCLOSURE_CLASS_RE.test(identity))
        return true;
    const inline = structuredStaticDisclosureInlineStyle(trigger);
    if (/cursor\s*:\s*pointer\b/i.test(inline))
        return true;
    if (trigger.hasAttribute?.('onclick') || trigger.hasAttribute?.('aria-controls'))
        return true;
    if (!ignoreGeneratedRescueSemantics) {
        const role = String(trigger.getAttribute?.('role') || '').toLowerCase();
        if (role === 'button' || role === 'switch' || role === 'tab')
            return true;
    }
    return false;
}
function rabbitMirrorHasPersistedMaintenanceRepair(root) {
    if (!root?.getAttribute)
        return false;
    if (root.getAttribute(MAINTENANCE_PERSISTED_REPAIR_ATTR) === 'true')
        return true;
    const details = root.matches?.('details')
        ? root
        : root.querySelector?.(':scope > details') || root.querySelector?.('details');
    if (details?.getAttribute?.(MAINTENANCE_PERSISTED_REPAIR_ATTR) === 'true')
        return true;
    return root.closest?.(`[${MAINTENANCE_PERSISTED_REPAIR_ATTR}="true"]`) ? true : false;
}
export function clearOrphanedStructuredStaticDisclosureArtifacts(root) {
    if (!root?.querySelectorAll || structuredStaticDisclosureRescueStates.get(root)?.entries?.length)
        return 0;
    if (rabbitMirrorHasPersistedMaintenanceRepair(root))
        return 0;
    let cleared = 0;
    for (const container of root.querySelectorAll(`[${STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR}]`)) {
        const trigger = container.querySelector?.(`:scope > [${STRUCTURED_STATIC_DISCLOSURE_TRIGGER_ATTR}]`);
        if (trigger && structuredStaticDisclosureHasExplicitIntent(trigger, container, true))
            continue;
        if (trigger) {
            const generatedLabel = __rmR("yLA1flyJFkESMxdaVpA", "").test(String(trigger.getAttribute('aria-label') || ''));
            trigger.removeAttribute(STRUCTURED_STATIC_DISCLOSURE_TRIGGER_ATTR);
            if (generatedLabel) {
                if (trigger.getAttribute('role') === 'button')
                    trigger.removeAttribute('role');
                if (trigger.getAttribute('tabindex') === '0')
                    trigger.removeAttribute('tabindex');
                trigger.removeAttribute('aria-label');
                trigger.removeAttribute('aria-expanded');
            }
        }
        container.querySelectorAll?.(`:scope > [${STRUCTURED_STATIC_DISCLOSURE_BODY_ATTR}]`)
            ?.forEach(body => body.removeAttribute(STRUCTURED_STATIC_DISCLOSURE_BODY_ATTR));
        container.removeAttribute(STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR);
        container.removeAttribute(STRUCTURED_STATIC_DISCLOSURE_OPEN_ATTR);
        cleared += 1;
    }
    const remaining = root.querySelectorAll(`[${STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR}]`).length;
    if (remaining <= 0) {
        root.querySelector?.(`style[${STRUCTURED_STATIC_DISCLOSURE_STYLE_ATTR}]`)?.remove();
        root.removeAttribute?.(STRUCTURED_STATIC_DISCLOSURE_COUNT_ATTR);
    }
    else {
        root.setAttribute?.(STRUCTURED_STATIC_DISCLOSURE_COUNT_ATTR, String(remaining));
    }
    return cleared;
}
function structuredStaticDisclosureHasExistingInteraction(root) {
    if (!root?.querySelectorAll)
        return true;
    const outerDetails = root.matches?.('details') ? root : root.querySelector?.(':scope > details');
    const outerSummary = outerDetails?.querySelector?.(':scope > summary') || null;
    const selector = [
        'button', 'input:not([type="hidden"])', 'select', 'textarea', 'a[href]',
        '[role="button"]', '[role="switch"]', '[role="tab"]', '[role="radio"]',
        '[contenteditable="true"]', '[popovertarget]', '[commandfor]', '[tabindex]', 'summary',
    ].join(',');
    return diagnosticQueryContentAll(root, selector).some(element => {
        if (outerSummary && (element === outerSummary || outerSummary.contains?.(element)))
            return false;
        if (element.matches?.(`[${MAINTENANCE_RABBIT_ATTR}], [${FEEDBACK_CAT_ATTR}], [${RECIPE_BUTTON_ATTR}], [${RESAY_ATTR}], [${TOOL_ENTRY_HOST_ATTR}]`))
            return false;
        return true;
    });
}
export function findStructuredStaticDisclosureCandidates(root) {
    if (!root?.querySelectorAll || structuredStaticDisclosureHasExistingInteraction(root))
        return [];
    const managed = new Set((structuredStaticDisclosureRescueStates.get(root)?.entries || []).map(entry => entry.container));
    const rawCandidates = [];
    for (const container of diagnosticQueryContentAll(root, 'div, section, article, main, li, dl')) {
        if (managed.has(container) || diagnosticIsInternalUiNode(container))
            continue;
        if (container.hasAttribute?.(STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR))
            continue;
        if (container.querySelector?.('input, button, select, textarea, details, summary, a[href], [popovertarget], [commandfor], [contenteditable="true"]'))
            continue;
        const children = [...(container.children || [])]
            .filter(child => !/^(?:style|script|template|br)$/i.test(String(child.tagName || '')))
            .filter(child => !diagnosticIsInternalUiNode(child));
        if (children.length < 2 || children.length > 5)
            continue;
        if (!structuredStaticDisclosureLooksSegmented(container))
            continue;
        const [trigger, ...bodies] = children;
        const inlinePair = children.length === 2 && children.every(child => /^(?:span|small|em|strong|b|i|code)$/i.test(String(child.tagName || '')));
        if (inlinePair && structuredStaticDisclosureFontWeight(children[1]) < 600)
            continue;
        const triggerStyle = diagnosticComputedStyle(trigger);
        const triggerPosition = String(triggerStyle?.position || trigger?.style?.position || '').toLowerCase();
        const triggerOpacity = Number.parseFloat(triggerStyle?.opacity || trigger?.style?.opacity || '1');
        if (triggerPosition === 'absolute' || triggerPosition === 'fixed')
            continue;
        if (Number.isFinite(triggerOpacity) && triggerOpacity <= 0.08)
            continue;
        if (!structuredStaticDisclosureTitleLooksExplicit(trigger, container, children))
            continue;
        if (!structuredStaticDisclosureHasExplicitIntent(trigger, container))
            continue;
        if (!structuredStaticDisclosureBodyLooksMeaningful(bodies))
            continue;
        const wholeTextLength = diagnosticCompactText(container.textContent || '', 2200).length;
        if (wholeTextLength < 6 || wholeTextLength > 2000)
            continue;
        rawCandidates.push({ container, trigger, bodies, title: diagnosticCompactText(trigger.textContent || '', 80) });
    }
    const leafCandidates = rawCandidates.filter(candidate => !rawCandidates.some(other => (other !== candidate && candidate.container.contains?.(other.container))));
    if (leafCandidates.length < 2)
        return [];
    return leafCandidates.slice(0, 12);
}
function ensureStructuredStaticDisclosureStyle(root) {
    let style = root.querySelector?.(`style[${STRUCTURED_STATIC_DISCLOSURE_STYLE_ATTR}]`);
    if (!style) {
        style = document.createElement('style');
        style.setAttribute(STRUCTURED_STATIC_DISCLOSURE_STYLE_ATTR, 'true');
        root.appendChild(style);
    }
    style.textContent = `
[${STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR}] > [${STRUCTURED_STATIC_DISCLOSURE_TRIGGER_ATTR}] { cursor: pointer !important; touch-action: manipulation; -webkit-tap-highlight-color: transparent; position: relative; padding-right: max(1.8em, 28px) !important; }
[${STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR}] > [${STRUCTURED_STATIC_DISCLOSURE_TRIGGER_ATTR}]::after { content: '−'; position: absolute; right: .35em; top: 50%; transform: translateY(-50%); font: 700 1em/1 sans-serif; opacity: .66; }
[${STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR}][${STRUCTURED_STATIC_DISCLOSURE_OPEN_ATTR}="false"] > [${STRUCTURED_STATIC_DISCLOSURE_TRIGGER_ATTR}]::after { content: '+'; }
[${STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR}][${STRUCTURED_STATIC_DISCLOSURE_OPEN_ATTR}="false"] > [${STRUCTURED_STATIC_DISCLOSURE_BODY_ATTR}] { display: none !important; }
[${STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR}] > [${STRUCTURED_STATIC_DISCLOSURE_TRIGGER_ATTR}]:focus-visible { outline: 2px solid currentColor !important; outline-offset: 3px !important; }
`;
}
function applyStructuredStaticDisclosureState(entry, open) {
    if (!entry?.container || !entry?.trigger)
        return;
    entry.open = !!open;
    entry.container.setAttribute(STRUCTURED_STATIC_DISCLOSURE_OPEN_ATTR, entry.open ? 'true' : 'false');
    entry.trigger.setAttribute('aria-expanded', entry.open ? 'true' : 'false');
}
export function installStructuredStaticDisclosureFallback(root) {
    if (!root?.querySelectorAll)
        return 0;
    clearOrphanedStructuredStaticDisclosureArtifacts(root);
    const candidates = findStructuredStaticDisclosureCandidates(root);
    if (!candidates.length)
        return Number.parseInt(root.getAttribute?.(STRUCTURED_STATIC_DISCLOSURE_COUNT_ATTR) || '0', 10) || 0;
    ensureStructuredStaticDisclosureStyle(root);
    let state = structuredStaticDisclosureRescueStates.get(root);
    if (!state) {
        state = { entries: [] };
        structuredStaticDisclosureRescueStates.set(root, state);
    }
    let installed = 0;
    for (const candidate of candidates) {
        if (state.entries.some(entry => entry.container === candidate.container))
            continue;
        const entry = { ...candidate, open: true };
        candidate.container.setAttribute(STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR, 'true');
        candidate.trigger.setAttribute(STRUCTURED_STATIC_DISCLOSURE_TRIGGER_ATTR, 'true');
        candidate.trigger.setAttribute('role', 'button');
        if (!candidate.trigger.hasAttribute('tabindex'))
            candidate.trigger.setAttribute('tabindex', '0');
        if (!candidate.trigger.hasAttribute('aria-label')) {
            candidate.trigger.setAttribute('aria-label', `${__rmT("oJJMkVhEDbtO6w5D")}${candidate.title || __rmT("rHZnA.tDtGp")}`);
        }
        for (const body of candidate.bodies)
            body.setAttribute(STRUCTURED_STATIC_DISCLOSURE_BODY_ATTR, 'true');
        state.entries.push(entry);
        applyStructuredStaticDisclosureState(entry, true);
        const activate = event => {
            if (event?.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ')
                return;
            if (event?.type === 'keydown')
                event.preventDefault();
            if (event?.type === 'click' && event.target?.closest?.('a,button,input,select,textarea,label,summary'))
                return;
            applyStructuredStaticDisclosureState(entry, !entry.open);
        };
        candidate.trigger.addEventListener('click', activate, false);
        candidate.trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                activate(event);
                return;
            }
            const currentIndex = state.entries.indexOf(entry);
            if (event.key === 'Escape') {
                event.preventDefault();
                for (const item of state.entries)
                    applyStructuredStaticDisclosureState(item, true);
                candidate.trigger.focus?.();
                return;
            }
            let nextIndex = currentIndex;
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
                nextIndex = (currentIndex + 1) % state.entries.length;
            else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
                nextIndex = (currentIndex - 1 + state.entries.length) % state.entries.length;
            else if (event.key === 'Home')
                nextIndex = 0;
            else if (event.key === 'End')
                nextIndex = state.entries.length - 1;
            else
                return;
            event.preventDefault();
            state.entries[nextIndex]?.trigger?.focus?.();
        }, false);
        installed += 1;
    }
    const total = new Set([...root.querySelectorAll?.(`[${STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR}]`) || []]).size;
    if (total)
        root.setAttribute(STRUCTURED_STATIC_DISCLOSURE_COUNT_ATTR, String(total));
    return installed;
}
function inertActionStatusMessage(button) {
    const rawLabel = diagnosticCompactText(button?.textContent || button?.getAttribute?.('aria-label') || '', 80)
        .replace(__rmR("xKe3MaI3vGs1kUCwZPF1E0Ax", "g"), '')
        .trim();
    const label = rawLabel || __rmT("rHZnAHwKaFY");
    if (INERT_ACTION_RITUAL_TEXT_RE.test(label)) {
        return `“${label}${__rmT("AxK1tPjU7lcg377gPirT61sO0U1fiR7CfKFgUH6eCtu4W45.y4VXMsE4YHzpTYUTHS8CGmIZY3Y")}`;
    }
    return `“${label}${__rmT("849tKAXaZ.DhsLOzYFHIvLFahyuSwlQgRLJSkxh0ZG3h.j8qqBEBuIWqcE3zXMaV3YoztH6J5E35vKNsqAk")}`;
}
function buttonHasKnownInteractionRoute(button, root) {
    if (!button || !root)
        return true;
    if (hasBehaviorInteractionControl(root, button))
        return true;
    if (diagnosticIsInternalUiNode(button) || button.closest?.('summary, form, label'))
        return true;
    if (button.disabled)
        return true;
    if (button.hasAttribute?.('onclick') || button.hasAttribute?.('onchange') || button.hasAttribute?.('oninput'))
        return true;
    if (button.hasAttribute?.('popovertarget') || button.hasAttribute?.('commandfor') || button.hasAttribute?.('formaction'))
        return true;
    if (button.hasAttribute?.('aria-controls')) {
        const targetId = String(button.getAttribute('aria-controls') || '').trim();
        if (targetId && root.querySelector?.(`#${escapeCssIdentifier(targetId)}`))
            return true;
    }
    const rescueAttrs = [
        RENDERED_BUTTON_ADJACENT_HIDDEN_RESCUE_ATTR,
        RENDERED_CLICKABLE_ADJACENT_HIDDEN_RESCUE_ATTR,
        RENDERED_CLICKABLE_ADJACENT_POPUP_RESCUE_ATTR,
        RENDERED_CSS_STATE_SIBLING_RESCUE_ATTR,
        DIRECT_ID_CLICK_RESCUE_ATTR,
        DIRECT_ID_CLASS_STATE_RESCUE_ATTR,
        RAW_SELF_MUTATION_RESCUE_ATTR,
        INLINE_PSEUDO_RESCUE_ATTR,
        HINTED_PSEUDO_RESCUE_ATTR,
        INERT_ACTION_BUTTON_RESCUE_ATTR,
        RAW_SCRIPT_TIMELINE_RESCUE_ATTR,
    ];
    if (rescueAttrs.some(attribute => button.hasAttribute?.(attribute)))
        return true;
    if (button.hasAttribute?.('data-rm-sibling-tab'))
        return true;
    if (button.hasAttribute?.('data-rm-orphan-state-trigger'))
        return true;
    if (button.hasAttribute?.('data-rm-attr-cycle'))
        return true;
    if (findRenderedButtonAdjacentHiddenTarget(button)
        || findRenderedClickableAdjacentHiddenTarget(button)
        || findRenderedClickableAdjacentPopupTarget(button))
        return true;
    return false;
}
export function findUnmappedNavigationButtons(root) {
    return diagnosticQueryContentAll(root, 'button').filter(button => !buttonHasKnownInteractionRoute(button, root)
        && __rmR("vnU2X5MI9NbqpVy5ilMAbJVKdGa_f5dk4jzKTQn.3s3pfITv_igEwNcS9wijgzof.LE", "").test(diagnosticCompactText(button.textContent || '', 80)));
}
function buttonHasPressStateRule(root, button) {
    const classes = [...(button.classList || [])].filter(Boolean);
    if (!classes.length)
        return false;
    const css = [...(root.querySelectorAll?.('style') || [])].map(node => node.textContent || '').join('\n');
    return classes.some(name => new RegExp(`\\.${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[.:#\\[][^{,]*)?:(?:focus|active|focus-within|focus-visible)\\b`).test(css));
}
export function findInertActionButtonCandidates(root) {
    if (!root?.querySelectorAll)
        return [];
    return diagnosticQueryContentAll(root, 'button').filter(button => {
        if (buttonHasKnownInteractionRoute(button, root))
            return false;
        const text = diagnosticCompactText(button.textContent || button.getAttribute?.('aria-label') || '', 180);
        if (text.length < 2)
            return false;
        if (INERT_ACTION_BUTTON_TEXT_RE.test(text))
            return true;
        if (__rmR("KGPpPkDKYT5CcSHvJL.unNZBELz0EY6PiYpXFmNajUBwNxdjK_Qmi99sYLC_V4AgKSuQ2EFs4jExe2Gk7pUaHfUrZFoPsghQ_DfJNwjMwu_WyLpfaxUu7HGBVB2NPLtBoedJXT", "u").test(text))
            return false;
        return text.length <= 24 && !buttonHasPressStateRule(root, button);
    });
}
export function installInertActionButtonFallback(root) {
    let installed = 0;
    for (const button of findInertActionButtonCandidates(root)) {
        const status = document.createElement('div');
        status.setAttribute(INERT_ACTION_STATUS_ATTR, 'true');
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        status.id = `rm-inert-action-status-${(++inertActionStatusCounter).toString(36)}`;
        status.hidden = true;
        status.style.cssText = 'display:none;box-sizing:border-box;width:100%;margin-top:10px;padding:10px 12px;border:1px dashed currentColor;border-radius:6px;font-size:13px;line-height:1.55;opacity:.8;';
        status.textContent = inertActionStatusMessage(button);
        button.insertAdjacentElement('afterend', status);
        try {
            if (/grid/.test(getComputedStyle(button.parentElement).display))
                status.style.gridColumn = '1 / -1';
        }
        catch { }
        const describedBy = String(button.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
        if (!describedBy.includes(status.id))
            describedBy.push(status.id);
        button.setAttribute('aria-describedby', describedBy.join(' '));
        let active = false;
        const render = () => {
            const claimed = button.hasAttribute('data-rm-orphan-state-trigger') || button.hasAttribute('data-rm-attr-cycle');
            status.hidden = !active || claimed;
            status.style.display = active && !claimed ? 'block' : 'none';
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
            button.dataset.rabbitMirrorInertActionActive = active ? 'true' : 'false';
        };
        button.addEventListener('click', event => {
            if (button.hasAttribute('data-rm-attr-cycle')) {
                status.remove();
                return;
            }
            event.preventDefault();
            active = !active;
            render();
        }, false);
        button.setAttribute(INERT_ACTION_BUTTON_RESCUE_ATTR, 'true');
        render();
        installed += 1;
    }
    if (installed > 0)
        root.dataset.rabbitMirrorInertActionFallback = String(installed);
    return installed;
}
export function findSelectionOnlyRadioFallbackCandidates(root) {
    if (!root?.querySelectorAll)
        return [];
    const groups = new Map();
    for (const input of diagnosticQueryContentAll(root, 'input[type="radio"]')) {
        const name = String(input.name || '').trim();
        if (!name)
            continue;
        if (!groups.has(name))
            groups.set(name, []);
        groups.get(name).push(input);
    }
    const candidates = [];
    for (const inputs of groups.values()) {
        if (inputs.length < 2)
            continue;
        if (inputs.some(input => input.hasAttribute?.(DETACHED_CHECKED_HAS_CONTROL_ATTR)))
            continue;
        const labels = inputs.map(input => input.closest?.('label')).filter(Boolean);
        if (labels.length !== inputs.length)
            continue;
        const groupContainer = lowestCommonElementAncestor(labels, root);
        if (!groupContainer || groupContainer === root || groupContainer.hasAttribute?.(SELECTION_ONLY_FALLBACK_ATTR))
            continue;
        const checkedInput = inputs.find(input => input.checked) || null;
        const nearbyContentRegion = nextSelectionOnlyContentRegion(groupContainer, root);
        const mode = nearbyContentRegion && checkedInput ? 'content-region' : 'status-only';
        candidates.push({
            inputs,
            labels,
            groupContainer,
            contentRegion: mode === 'content-region' ? nearbyContentRegion : null,
            defaultInput: mode === 'content-region' ? checkedInput : null,
            mode,
        });
    }
    return candidates;
}
export function installSelectionOnlyStateFallback(root) {
    if (!root?.querySelectorAll)
        return 0;
    const checkedDepth = maintenanceCheckedInteractionDepth(root);
    const forcedDisabledChoiceGroup = !!root.querySelector?.(`[${DISABLED_ONLY_CHOICE_RESCUE_ATTR}]`);
    if (!checkedDepth.checkedSelectionOnly && !forcedDisabledChoiceGroup)
        return 0;
    let installed = 0;
    for (const candidate of findSelectionOnlyRadioFallbackCandidates(root)) {
        const { inputs, groupContainer, contentRegion, defaultInput, mode } = candidate;
        const placeholder = document.createElement('div');
        placeholder.setAttribute(SELECTION_ONLY_PLACEHOLDER_ATTR, 'true');
        placeholder.setAttribute('role', 'status');
        placeholder.setAttribute('aria-live', 'polite');
        placeholder.hidden = true;
        placeholder.style.cssText = 'box-sizing:border-box;width:100%;padding:16px;border:1px dashed currentColor;border-radius:6px;line-height:1.6;opacity:.82;';
        const title = document.createElement('div');
        title.style.cssText = 'font-weight:700;margin-bottom:6px;';
        const note = document.createElement('div');
        note.style.cssText = 'font-size:13px;opacity:.78;';
        placeholder.append(title, note);
        if (mode === 'content-region' && contentRegion) {
            note.textContent = __rmT("BCdasavvF3TDHS3vk8vaguaqLIgwPo.5yWtoznYd5lVHEAAbcdEhSQYaVhZaesL5jcwQp60YoyVZmPrxqAk");
            contentRegion.insertAdjacentElement('afterend', placeholder);
            contentRegion.setAttribute(SELECTION_ONLY_SOURCE_ATTR, 'true');
        }
        else {
            note.textContent = __rmT("6IBVN.oilq4DsaezFyMMlXwlyZbpMKlalwKhQ20jga_dC9TB_LGmG9NpnBazZKsg4ACCNbwjyhHEpBpm4InLRNqk5sHDVQga_fz.Jn2rRNOn1pLEpMW048Ut");
            groupContainer.insertAdjacentElement('afterend', placeholder);
        }
        const originalDisplay = contentRegion?.style?.getPropertyValue?.('display') || '';
        const originalPriority = contentRegion?.style?.getPropertyPriority?.('display') || '';
        const render = () => {
            const selected = inputs.find(input => input.checked) || null;
            if (mode === 'content-region' && contentRegion && defaultInput) {
                const showOriginal = !selected || selected === defaultInput;
                if (showOriginal) {
                    if (originalDisplay)
                        contentRegion.style.setProperty('display', originalDisplay, originalPriority);
                    else
                        contentRegion.style.removeProperty('display');
                    placeholder.hidden = true;
                    placeholder.style.display = 'none';
                }
                else {
                    contentRegion.style.setProperty('display', 'none', 'important');
                    title.textContent = selectionOnlyFallbackLabelText(selected);
                    placeholder.hidden = false;
                    placeholder.style.display = 'block';
                }
            }
            else if (selected) {
                title.textContent = selectionOnlyFallbackLabelText(selected);
                placeholder.hidden = false;
                placeholder.style.display = 'block';
            }
            else {
                placeholder.hidden = true;
                placeholder.style.display = 'none';
            }
            groupContainer.dataset.rabbitMirrorSelectionOnlySelected = String(selected?.id || selected?.value || '');
        };
        const onChange = event => {
            if (!inputs.includes(event.target))
                return;
            render();
        };
        groupContainer.addEventListener('change', onChange, false);
        groupContainer.setAttribute(SELECTION_ONLY_FALLBACK_ATTR, mode);
        render();
        installed += 1;
    }
    if (installed > 0) {
        const capabilities = detectInteractionCapabilities(root);
        capabilities.selectionFallback = true;
        interactionCapabilityStates.set(root, capabilities);
        root.dataset.rabbitMirrorInteractionRoutes = Object.entries(capabilities)
            .filter(([, enabled]) => enabled)
            .map(([name]) => name)
            .join(',') || 'none';
    }
    return installed;
}
const capturedMaintenanceRepairStates = new WeakSet();
function maintenanceRepairStateDetails(root) {
    return root?.matches?.('details') ? root : root?.querySelector?.(':scope > details') || root?.querySelector?.('details');
}
function maintenanceRepairStateChildren(node) {
    return [...(node?.children || [])].filter(child => !/^(?:style|script|template)$/i.test(String(child.tagName || ''))
        && !diagnosticIsInternalUiNode(child));
}
function maintenanceRepairStatePath(root, node) {
    const path = [];
    while (node && node !== root && path.length < 64) {
        const parent = node.parentElement;
        const siblings = maintenanceRepairStateChildren(parent);
        const index = siblings.indexOf(node);
        if (index < 0)
            return null;
        path.unshift(Object.freeze([index, String(node.tagName || ''), siblings.length]));
        node = parent;
    }
    return node === root ? Object.freeze(path) : null;
}
function maintenanceRepairStateNode(root, path) {
    if (!Array.isArray(path) || path.length > 64)
        return null;
    let node = root;
    for (const [index, tag, count] of path) {
        const children = maintenanceRepairStateChildren(node);
        if (children.length !== count || children[index]?.tagName !== tag)
            return null;
        node = children[index];
    }
    return node || null;
}
export function captureRabbitMirrorMaintenanceRepairState(root) {
    const details = maintenanceRepairStateDetails(root);
    if (!details)
        return null;
    const roots = root === details ? [root] : [details, root];
    const entries = (registry, key) => {
        const seen = new Set();
        return roots.flatMap(target => registry.get(target)?.entries || []).slice(0, 2200).filter(entry => {
            if (seen.has(entry[key]))
                return false;
            seen.add(entry[key]);
            return true;
        });
    };
    const locate = node => node && details.contains?.(node) ? maintenanceRepairStatePath(details, node) : null;
    const staticChoice = entries(staticChoiceSelectionRescueStates, 'group').map(entry => {
        const group = locate(entry.group);
        const items = entry.items.map(locate);
        return group && items.every(Boolean) ? Object.freeze({ group, items: Object.freeze(items), selectedIndex: entry.items.indexOf(entry.selectedItem) }) : null;
    }).filter(Boolean);
    const disclosure = entries(structuredStaticDisclosureRescueStates, 'container').map(entry => {
        const container = locate(entry.container), trigger = locate(entry.trigger);
        const bodies = entry.bodies.map(locate);
        return container && trigger && bodies.every(Boolean) ? Object.freeze({ container, trigger, bodies: Object.freeze(bodies), open: !!entry.open }) : null;
    }).filter(Boolean);
    const fillStates = roots.map(target => fillInChoiceRescueStates.get(target)).filter(Boolean);
    const seenBlanks = new Set(), seenOptions = new Set();
    const fillEntries = fillStates.flatMap(state => (state.entries || []).map(entry => {
        if (seenBlanks.has(entry.blank))
            return null;
        seenBlanks.add(entry.blank);
        const blank = locate(entry.blank);
        const textIndex = [...(entry.blank.childNodes || [])].indexOf(entry.textNode);
        return blank && textIndex >= 0 ? Object.freeze({ blank, textIndex,
            originalText: String(entry.originalText || ''), placeholder: String(entry.placeholder || ''),
            allowedCodes: Object.freeze([...entry.allowedCodes]), selectedCode: String(entry.selectedCode || ''),
            selectedLabel: String(entry.selectedLabel || ''), active: state.activeEntry === entry,
        }) : null;
    })).filter(Boolean).slice(0, 2200);
    const fillOptions = fillStates.flatMap(state => (state.options || []).map(item => {
        if (seenOptions.has(item.option))
            return null;
        seenOptions.add(item.option);
        const option = locate(item.option);
        return option ? Object.freeze({ option, code: item.code }) : null;
    })).filter(Boolean).slice(0, 2200);
    if (!staticChoice.length && !disclosure.length && !fillEntries.length)
        return null;
    const snapshot = Object.freeze({ staticChoice: Object.freeze(staticChoice), disclosure: Object.freeze(disclosure),
        fillEntries: Object.freeze(fillEntries), fillOptions: Object.freeze(fillOptions) });
    capturedMaintenanceRepairStates.add(snapshot);
    return snapshot;
}
function resolveMaintenanceRepairState(root, snapshot) {
    if (!snapshot || !capturedMaintenanceRepairStates.has(snapshot))
        return null;
    const details = maintenanceRepairStateDetails(root);
    const node = path => maintenanceRepairStateNode(details, path);
    const staticChoice = new Map(), disclosure = new Map();
    for (const record of snapshot.staticChoice) {
        const group = node(record.group), items = record.items.map(node);
        const current = [...(group?.children || [])].filter(item => item.hasAttribute?.(STATIC_CHOICE_SELECTION_ITEM_ATTR));
        if (!group?.hasAttribute?.(STATIC_CHOICE_SELECTION_RESCUE_ATTR) || items.some((item, i) => !item || item !== current[i]) || current.length !== items.length)
            continue;
        staticChoice.set(group, { selectedItem: items[record.selectedIndex] || null });
    }
    for (const record of snapshot.disclosure) {
        const container = node(record.container), trigger = node(record.trigger), bodies = record.bodies.map(node);
        const current = [...(container?.querySelectorAll?.(`:scope > [${STRUCTURED_STATIC_DISCLOSURE_BODY_ATTR}]`) || [])];
        if (!container?.hasAttribute?.(STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR)
            || trigger !== container.querySelector?.(`:scope > [${STRUCTURED_STATIC_DISCLOSURE_TRIGGER_ATTR}]`)
            || bodies.some((body, i) => !body || body !== current[i]) || bodies.length !== current.length)
            continue;
        disclosure.set(container, { open: record.open });
    }
    const options = snapshot.fillOptions.map(record => ({ option: node(record.option), code: record.code }))
        .filter(item => item.option?.hasAttribute?.(FILL_IN_CHOICE_OPTION_ATTR) && item.option.getAttribute(FILL_IN_CHOICE_CODE_ATTR) === item.code);
    const codes = new Set(options.map(item => item.code));
    const fillEntries = snapshot.fillEntries.map(record => {
        const blank = node(record.blank), textNode = blank?.childNodes?.[record.textIndex];
        if (!blank?.hasAttribute?.(FILL_IN_CHOICE_BLANK_ATTR) || textNode?.nodeType !== 3
            || !record.allowedCodes.every(code => codes.has(code))
            || (record.selectedCode && !record.allowedCodes.includes(record.selectedCode)))
            return null;
        return { ...record, blank, textNode, allowedCodes: [...record.allowedCodes] };
    }).filter(Boolean);
    return { staticChoice, disclosure, fill: { entries: fillEntries, options } };
}
function rehydrateStaticChoiceSelectionRepair(root, saved = null) {
    if (!root?.querySelectorAll)
        return 0;
    const existing = staticChoiceSelectionRescueStates.get(root);
    if (existing?.entries?.length)
        return 0;
    const groups = [...root.querySelectorAll(`[${STATIC_CHOICE_SELECTION_RESCUE_ATTR}]`)];
    if (!groups.length)
        return 0;
    ensureStaticChoiceSelectionStyle(root);
    const state = { entries: [] };
    staticChoiceSelectionRescueStates.set(root, state);
    let rebound = 0;
    for (const group of groups) {
        if (saved && !saved.has(group))
            continue;
        const items = [...(group.children || [])].filter(item => item.hasAttribute?.(STATIC_CHOICE_SELECTION_ITEM_ATTR));
        if (items.length < 2)
            continue;
        const titles = items.map(staticChoiceCardTitle);
        const entry = { group, items, titles, selectedItem: null };
        group.setAttribute(STATIC_CHOICE_SELECTION_RESCUE_ATTR, 'true');
        group.setAttribute('role', 'radiogroup');
        if (!group.hasAttribute('aria-label'))
            group.setAttribute('aria-label', __rmT("TJCq8UsQmCD"));
        for (const [index, item] of items.entries()) {
            item.setAttribute(STATIC_CHOICE_SELECTION_ITEM_ATTR, 'true');
            item.setAttribute(STATIC_CHOICE_SELECTION_SELECTED_ATTR, 'false');
            item.setAttribute('role', 'radio');
            item.setAttribute('aria-checked', 'false');
            if (!item.hasAttribute('aria-label'))
                item.setAttribute('aria-label', titles[index] || `${__rmT("KxygZVc6")}${index + 1}`);
            if (!item.hasAttribute('tabindex'))
                item.setAttribute('tabindex', '0');
            const activate = event => {
                if (event?.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ')
                    return;
                if (event?.type === 'keydown')
                    event.preventDefault();
                if (event?.type === 'click' && event.target?.closest?.('a,button,input,select,textarea,label,summary'))
                    return;
                const next = entry.selectedItem === item ? null : item;
                applyStaticChoiceSelectionState(entry, next);
            };
            item.addEventListener('click', activate, false);
            item.addEventListener('keydown', activate, false);
        }
        state.entries.push(entry);
        applyStaticChoiceSelectionState(entry, saved?.get(group)?.selectedItem || null);
        rebound += 1;
    }
    if (state.entries.length)
        root.setAttribute(STATIC_CHOICE_SELECTION_COUNT_ATTR, String(state.entries.length));
    else
        staticChoiceSelectionRescueStates.delete(root);
    return rebound;
}
function rehydrateStructuredStaticDisclosureRepair(root, saved = null) {
    if (!root?.querySelectorAll)
        return 0;
    const existing = structuredStaticDisclosureRescueStates.get(root);
    if (existing?.entries?.length)
        return 0;
    const containers = [...root.querySelectorAll(`[${STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR}]`)];
    if (!containers.length)
        return 0;
    ensureStructuredStaticDisclosureStyle(root);
    const state = { entries: [] };
    structuredStaticDisclosureRescueStates.set(root, state);
    let rebound = 0;
    for (const container of containers) {
        if (saved && !saved.has(container))
            continue;
        const trigger = container.querySelector?.(`:scope > [${STRUCTURED_STATIC_DISCLOSURE_TRIGGER_ATTR}]`);
        const bodies = [...(container.querySelectorAll?.(`:scope > [${STRUCTURED_STATIC_DISCLOSURE_BODY_ATTR}]`) || [])];
        if (!trigger || !bodies.length)
            continue;
        const entry = {
            container,
            trigger,
            bodies,
            title: diagnosticCompactText(trigger.textContent || '', 80),
            open: true,
        };
        container.setAttribute(STRUCTURED_STATIC_DISCLOSURE_RESCUE_ATTR, 'true');
        trigger.setAttribute(STRUCTURED_STATIC_DISCLOSURE_TRIGGER_ATTR, 'true');
        trigger.setAttribute('role', 'button');
        if (!trigger.hasAttribute('tabindex'))
            trigger.setAttribute('tabindex', '0');
        if (!trigger.hasAttribute('aria-label'))
            trigger.setAttribute('aria-label', `${__rmT("oJJMkVhEDbtO6w5D")}${entry.title || __rmT("rHZnA.tDtGp")}`);
        state.entries.push(entry);
        applyStructuredStaticDisclosureState(entry, saved?.get(container)?.open ?? true);
        const activate = event => {
            if (event?.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ')
                return;
            if (event?.type === 'keydown')
                event.preventDefault();
            if (event?.type === 'click' && event.target?.closest?.('a,button,input,select,textarea,label,summary'))
                return;
            applyStructuredStaticDisclosureState(entry, !entry.open);
        };
        trigger.addEventListener('click', activate, false);
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                activate(event);
                return;
            }
            const currentIndex = state.entries.indexOf(entry);
            if (event.key === 'Escape') {
                event.preventDefault();
                for (const item of state.entries)
                    applyStructuredStaticDisclosureState(item, true);
                trigger.focus?.();
                return;
            }
            let nextIndex = currentIndex;
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
                nextIndex = (currentIndex + 1) % state.entries.length;
            else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
                nextIndex = (currentIndex - 1 + state.entries.length) % state.entries.length;
            else if (event.key === 'Home')
                nextIndex = 0;
            else if (event.key === 'End')
                nextIndex = state.entries.length - 1;
            else
                return;
            event.preventDefault();
            state.entries[nextIndex]?.trigger?.focus?.();
        }, false);
        rebound += 1;
    }
    if (state.entries.length)
        root.setAttribute(STRUCTURED_STATIC_DISCLOSURE_COUNT_ATTR, String(state.entries.length));
    else
        structuredStaticDisclosureRescueStates.delete(root);
    return rebound;
}
function rehydrateFillInChoiceRepair(root, saved = null) {
    if (!root?.querySelectorAll)
        return 0;
    const existing = fillInChoiceRescueStates.get(root);
    if (existing?.entries?.length || existing?.options?.length)
        return 0;
    const rawBlanks = [...root.querySelectorAll(`[${FILL_IN_CHOICE_BLANK_ATTR}]`)];
    const rawOptions = [...root.querySelectorAll(`[${FILL_IN_CHOICE_OPTION_ATTR}]`)];
    if (!rawBlanks.length || rawOptions.length < 2)
        return 0;
    const eligibleOptions = saved ? rawOptions.filter(option => saved.options.some(item => item.option === option)) : rawOptions;
    const optionEvidence = eligibleOptions.map(option => {
        const parsed = fillInChoiceOptionEvidence(option);
        if (parsed)
            return parsed;
        const code = String(option.getAttribute?.(FILL_IN_CHOICE_CODE_ATTR) || '').trim().toUpperCase();
        if (!code)
            return null;
        const label = diagnosticCompactText(option.textContent || '', 180).replace(new RegExp(`^\\s*\\[?${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]?\\s*`), '').trim();
        return label ? { option, code, label } : null;
    }).filter(Boolean).map(fillInChoiceOriginalOption);
    const optionCodes = new Set(optionEvidence.map(item => item.code));
    const blankEvidence = (saved ? saved.entries : rawBlanks.map(blank => fillInChoiceBlankEvidence(blank)).filter(Boolean).map(fillInChoiceOriginalBlank)).map(entry => ({
        ...entry,
        allowedCodes: entry.allowedCodes.filter(code => optionCodes.has(code)),
    })).filter(entry => entry.allowedCodes.length);
    if (!blankEvidence.length || optionEvidence.length < 2)
        return 0;
    ensureFillInChoiceStyle(root);
    const state = { root, entries: [], options: [], activeEntry: null, outsideListenerInstalled: false };
    fillInChoiceRescueStates.set(root, state);
    let rebound = 0;
    for (const rawEntry of blankEvidence) {
        const entry = { ...rawEntry, selectedCode: saved ? rawEntry.selectedCode : '', selectedLabel: saved ? rawEntry.selectedLabel : '' };
        entry.blank.setAttribute(FILL_IN_CHOICE_BLANK_ATTR, 'true');
        entry.blank.removeAttribute(FILL_IN_CHOICE_CODE_ATTR);
        entry.blank.setAttribute('role', 'button');
        if (!entry.blank.hasAttribute('tabindex'))
            entry.blank.tabIndex = 0;
        state.entries.push(entry);
        if (saved && rawEntry.active)
            state.activeEntry = entry;
        rebound += 1;
        entry.blank.addEventListener('click', event => {
            if (event.target?.closest?.(`[${FILL_IN_CHOICE_OPTION_ATTR}]`))
                return;
            state.activeEntry = state.activeEntry === entry ? null : entry;
            applyFillInChoiceState(state);
        }, false);
        entry.blank.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                state.activeEntry = state.activeEntry === entry ? null : entry;
                applyFillInChoiceState(state);
                if (state.activeEntry === entry)
                    fillInChoiceEligibleOptions(state)[0]?.option?.focus?.();
                return;
            }
            if ((event.key === 'Delete' || event.key === 'Backspace') && entry.selectedCode) {
                event.preventDefault();
                fillInChoiceClearEntry(state, entry);
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                state.activeEntry = null;
                applyFillInChoiceState(state);
            }
        }, false);
    }
    for (const rawOption of optionEvidence) {
        const item = { ...rawOption };
        item.option.setAttribute(FILL_IN_CHOICE_OPTION_ATTR, 'true');
        item.option.setAttribute(FILL_IN_CHOICE_CODE_ATTR, item.code);
        item.option.setAttribute('role', 'option');
        if (!item.option.hasAttribute('tabindex'))
            item.option.tabIndex = 0;
        state.options.push(item);
        const choose = event => {
            if (event?.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ')
                return;
            if (event?.type === 'keydown')
                event.preventDefault();
            let entry = state.activeEntry;
            if (!entry || !entry.allowedCodes.includes(item.code)) {
                const eligible = state.entries.filter(candidateEntry => candidateEntry.allowedCodes.includes(item.code));
                entry = eligible.find(candidateEntry => !candidateEntry.selectedCode) || eligible[0] || null;
            }
            if (!entry)
                return;
            fillInChoiceSelectOption(state, entry, item);
        };
        item.option.addEventListener('click', choose, false);
        item.option.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                choose(event);
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                const active = state.activeEntry;
                state.activeEntry = null;
                applyFillInChoiceState(state);
                active?.blank?.focus?.();
                return;
            }
            const eligible = fillInChoiceEligibleOptions(state);
            const currentIndex = eligible.indexOf(item);
            if (currentIndex < 0)
                return;
            let nextIndex = currentIndex;
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
                nextIndex = (currentIndex + 1) % eligible.length;
            else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
                nextIndex = (currentIndex - 1 + eligible.length) % eligible.length;
            else if (event.key === 'Home')
                nextIndex = 0;
            else if (event.key === 'End')
                nextIndex = eligible.length - 1;
            else
                return;
            event.preventDefault();
            eligible[nextIndex]?.option?.focus?.();
        }, false);
    }
    if (state.entries.length && state.options.length) {
        root.addEventListener('click', event => {
            if (!state.activeEntry)
                return;
            if (event.target?.closest?.(`[${FILL_IN_CHOICE_BLANK_ATTR}], [${FILL_IN_CHOICE_OPTION_ATTR}]`))
                return;
            state.activeEntry = null;
            applyFillInChoiceState(state);
        }, false);
        state.outsideListenerInstalled = true;
        root.setAttribute(FILL_IN_CHOICE_COUNT_ATTR, String(state.entries.length));
        applyFillInChoiceState(state);
        return rebound;
    }
    fillInChoiceRescueStates.delete(root);
    return 0;
}
export function rehydrateRabbitMirrorMaintenanceRepairs(root, { cloned = false, state = null } = {}) {
    if (!root?.querySelectorAll || (!cloned && !rabbitMirrorHasPersistedMaintenanceRepair(root)))
        return 0;
    let rebound = 0;
    const run = (label, fn) => {
        try {
            rebound += Number(fn(root)) || 0;
        }
        catch (error) {
            console.debug(`[RabbitMirror] ${label} rehydrate skipped:`, error);
        }
    };
    const saved = cloned ? resolveMaintenanceRepairState(root, state) : null;
    run('static choice', target => rehydrateStaticChoiceSelectionRepair(target, saved?.staticChoice));
    run('structured disclosure', target => rehydrateStructuredStaticDisclosureRepair(target, saved?.disclosure));
    run('fill-in choice', target => rehydrateFillInChoiceRepair(target, saved?.fill));
    return rebound;
}
