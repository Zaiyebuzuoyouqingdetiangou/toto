import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=2.1.10";
import { getSettings } from '../settings.js?rmv=2.1.10';
export const RUNTIME_VERSION = '2.1.10';
export const RUNTIME_VERSION_ATTR = 'data-rabbit-mirror-runtime-version';
export const FEEDBACK_CAT_RUNTIME_STYLE_ID = 'rabbit-mirror-feedback-cat-runtime-style';
export const TOOL_ENTRY_HOST_ATTR = 'data-rabbit-mirror-tool-entry-host';
export const EXTERNAL_REFERENCE_NOTE_ATTR = 'data-rabbit-mirror-reference-note';
export const MIRROR_TITLE_PREFIX_ATTR = 'data-rabbit-mirror-title-prefix';
export const MIRROR_TITLE_PART_ATTR = 'data-rabbit-mirror-title-part';
export const MIRROR_TITLE_DISPLAY_ATTR = 'data-rabbit-mirror-title-display';
export const MIRROR_TITLE_SOURCE_ATTR = 'data-rabbit-mirror-title-source';
export const TITLE_CHROME_ATTR = 'data-rm-title-chrome';
export const MIRROR_TITLE_LABEL_ATTR = 'data-rm-title-label';
export const MIRROR_TOTO_SELECTOR = 'toto[data-rabbit-mirror="true"], toto[data-rabbit-hole="true"]';
export const REVERSIBLE_STYLE_BASELINE_ATTR = 'data-rm-reversible-style-baseline';
export const REVERSIBLE_TEXT_BASELINE_ATTR = 'data-rm-reversible-text-baseline';
export const RAW_SELF_MUTATION_HTML_BASELINE_ATTR = 'data-rm-self-mutation-html-baseline';
export const RAW_SELF_MUTATION_ACTIVE_ATTR = 'data-rm-self-mutation-active';
export const MAINTENANCE_RABBIT_ATTR = 'data-rabbit-mirror-maintenance-rabbit';
export const INTERACTION_HOME_ATTR = 'data-rabbit-mirror-interaction-home';
export const FEEDBACK_CAT_ATTR = 'data-rabbit-mirror-feedback-cat';
export const RECIPE_BUTTON_ATTR = 'data-rabbit-mirror-recipe';
export const RABBIT_MIRROR_CSS_SCOPE_ATTR = 'data-rabbit-mirror-css-scope';
export function ensureFeedbackCatRuntimeStyle() {
    if (typeof document === 'undefined')
        return;
    let style = document.getElementById(FEEDBACK_CAT_RUNTIME_STYLE_ID);
    if (!style) {
        style = document.createElement('style');
        style.id = FEEDBACK_CAT_RUNTIME_STYLE_ID;
        (document.head || document.documentElement)?.appendChild(style);
    }
    const css = `
summary span[${MIRROR_TITLE_PART_ATTR}][${MIRROR_TITLE_PART_ATTR}],
summary span[${MIRROR_TITLE_PART_ATTR}][${MIRROR_TITLE_PART_ATTR}]::before {
    all: unset !important;
    display: inline !important;
}
summary span[${MIRROR_TITLE_PART_ATTR}][${MIRROR_TITLE_PART_ATTR}]::before {
    content: attr(${MIRROR_TITLE_DISPLAY_ATTR}) !important;
}
summary span[${MIRROR_TITLE_PART_ATTR}]::after {
    content: none !important;
}
summary span[${MIRROR_TITLE_PART_ATTR}] > span[${MIRROR_TITLE_SOURCE_ATTR}][${MIRROR_TITLE_SOURCE_ATTR}] {
    display: none !important;
}
summary [data-rabbit-mirror-title-extra][data-rabbit-mirror-title-extra] {
    display: none !important;
}
#chat summary[${TITLE_CHROME_ATTR}][${TITLE_CHROME_ATTR}],
#chat .rabbit-mirror-external-shell[data-rm-source="independent"][data-rm-placement="external"] > details[data-rabbit-mirror-external-details="true"] > summary[${TITLE_CHROME_ATTR}][${TITLE_CHROME_ATTR}] {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 6px 8px !important;
    white-space: normal !important;
    overflow: visible !important;
}
#chat summary[${TITLE_CHROME_ATTR}][${TITLE_CHROME_ATTR}]::-webkit-details-marker {
    display: none !important;
}
#chat summary[${TITLE_CHROME_ATTR}][${TITLE_CHROME_ATTR}]::marker {
    content: none !important;
    font-size: 0 !important;
}
#chat summary[${TITLE_CHROME_ATTR}][${TITLE_CHROME_ATTR}]::before {
    content: '' !important;
    flex: 0 0 auto !important;
    width: 0 !important;
    height: 0 !important;
    margin: 0.35em 2px 0 0 !important;
    border-style: solid !important;
    border-width: 0.32em 0 0.32em 0.46em !important;
    border-color: transparent transparent transparent currentColor !important;
    opacity: .62 !important;
    transform: none !important;
    pointer-events: none !important;
}
#chat details[open] > summary[${TITLE_CHROME_ATTR}][${TITLE_CHROME_ATTR}]::before {
    transform: rotate(90deg) !important;
    margin-top: 0.42em !important;
}
#chat span[${MIRROR_TITLE_LABEL_ATTR}][${MIRROR_TITLE_LABEL_ATTR}${__rmT("kaB6fLzqdLlydpmG78otpMD5NJpQMxYq0JKtKUT9QWYkefJ3rxClHprt7y8aiPqzzWIIVzXPUskTSTP73dZnQ45_cKmp5G8zMyGNB2c5kAI_AYLGBD7Se4C0eh8aqdtFPftFlJoZBrRtrhPifcbsj5_wrrT6LO3Z8sFqLeIN46Tl1oCxJ_oZsD9a.NtmfY25iyfubhhrrhnK5pDHy8.zW.xtgKbuW1ta_BjqOS6uADcbuaPi0wWMrwayKxrCWOyEE9WZPnr_XOWsGDwFkK_JQCwsme7qSN61U5Dpl1L5Tb10lxTwEWZYX64JpCEON9OR.HabsXnCsHUjTXJzdeh_oTqg7D7t6GX3_2n3rjcQOb7VhJjWamnoUV8_PeWOywPqqttk9jCTRxVrVpstdN507FosRvcIT3e4zgHL_fHnwlMXl69YGar4iFjttzWMFenLUPxfvuEfgD4Z8Pnp80VjqlnVNz.Z4HMBp0rWRNztpi6Qt8q.3UoVx8fW9dIeT4QU0Li3jdblhsXXkmej1Vy6kgumDbqAEd_PRQUquAe8SrlTkvGNJvi0EgGIO2AUSwmOJYSSgkkKhItBZlgULw52aNROdfVK6hM1o.Km0aGsmqrYAu1Oq36JTzl4NDAZ6bg2TFOq_5CDoR3TZ0pPm47Zs6AglyBFdxHfEpbkfQLxH6C6nq5UZCeiismfxMMdLQNBVBgpwmzO5X7ukjE_OF8IOOoUnOejKyIGhIvIK3jLfUl2_QRpautlAM6bp49d7wyUktzLeyfeu30LwjBkn0VGGjPw9vAeOBQygxqHKkRMvGEoXIQ4vvN9oVrG5tgpEjCXPRA1MEv.jeDY.mxiYbqehu6B2uuz9wE1KwhrXniQxgpYWe_Meoe5UqPGxd48jXaiZlY5HIH26Qq_9r.ND_J3522l4dSNlqm3GY2NjRZqmbelkO43TGropF0D4gxTE9AzaRYrOLEooP91508MYPh_jHNYp.dpZhHssvUo1NcxzDoGvmLOlmHoq_6lspS8Hg6y_vOJ_RSblXDvYaTtrm5lZN6zwmHSHTeehX7.h6m6l5JS3xT3vSKiqjjd_RXCHpy89ieX1fexrU9GOPqH.VR04Nv5fFnCCiyl5QFdIT1MF6lTNjlw9PM_ZtA.EoqXKizjRMt41ccH7.dOBtbqBQejSH4TS2OzMZ7IgbY67.NWjnZmRXi3wW6mSpcbcHMF.uADAIxM1q3wVepb2JPftib_o0Dc7RcB0GSeA0WH1KkS1NrD8PEIPfeB6xhl0FcC5NPQIlkTGd3HdlX40RK0qhA8q_e370FsjiOdnE57hT7OoPXksZLaH0ryyoceH6yCOPN140fbt6E_hi1NgkjbxfyWIMnqRvosTv6PwlIRMnk4zm06aOnj6bSeXCHA9uZBXLbbNA9UJh5j.K4SvP8qgedmUYoSVs9MkUT4pkucj5HqIHlYwVlFnbptQmKfYU8LL6XNIPFF9MpD3rKxcjclz3LRzHnw7ykiq_oGSr6c7wzFPjPWKW525DHVcxgUQdxgZHQpEkCO2oY_y2u0d_KE83oxMSReY33tzUJsY_G2qwKkEiETibcjTnCwfOF5sLrKyA1BX2dkcdDa7.h2EyNVgqRl4oBoaNa_Gg_tWmEIpXkmG_ucHpuyWSqTQuva")}${TOOL_ENTRY_HOST_ATTR}][${TOOL_ENTRY_HOST_ATTR}] {
    all: initial !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 2px !important;
    float: none !important;
    flex: 0 0 auto !important;
    position: relative !important;
    z-index: 2147483000 !important;
    width: auto !important;
    min-width: max-content !important;
    height: auto !important;
    min-height: 0 !important;
    max-width: none !important;
    max-height: none !important;
    margin: 0 !important;
    margin-inline-start: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    transform: none !important;
    filter: none !important;
    clip: auto !important;
    clip-path: none !important;
    white-space: nowrap !important;
    vertical-align: middle !important;
    color: inherit !important;
    font: inherit !important;
    line-height: 1 !important;
    isolation: isolate !important;
}
[${TOOL_ENTRY_HOST_ATTR}] > button[${MAINTENANCE_RABBIT_ATTR}],
[${TOOL_ENTRY_HOST_ATTR}] > button[${FEEDBACK_CAT_ATTR}],
[${TOOL_ENTRY_HOST_ATTR}] > button[${RECIPE_BUTTON_ATTR}] {
    all: initial !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
    z-index: 2147483001 !important;
    flex: 0 0 auto !important;
    width: auto !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 20px !important;
    max-width: none !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 1px 3px !important;
    border: 0 !important;
    border-radius: 5px !important;
    background: transparent !important;
    color: inherit !important;
    font: inherit !important;
    font-size: 14px !important;
    line-height: 1 !important;
    text-indent: 0 !important;
    letter-spacing: normal !important;
    white-space: nowrap !important;
    overflow: visible !important;
    visibility: visible !important;
    opacity: .94 !important;
    pointer-events: auto !important;
    cursor: pointer !important;
    transform: none !important;
    filter: none !important;
    clip: auto !important;
    clip-path: none !important;
    box-shadow: none !important;
    appearance: none !important;
    -webkit-appearance: none !important;
    touch-action: manipulation !important;
    -webkit-tap-highlight-color: transparent !important;
}
[${TOOL_ENTRY_HOST_ATTR}] > button[${MAINTENANCE_RABBIT_ATTR}]::before,
[${TOOL_ENTRY_HOST_ATTR}] > button[${MAINTENANCE_RABBIT_ATTR}]::after,
[${TOOL_ENTRY_HOST_ATTR}] > button[${FEEDBACK_CAT_ATTR}]::before,
[${TOOL_ENTRY_HOST_ATTR}] > button[${FEEDBACK_CAT_ATTR}]::after,
[${TOOL_ENTRY_HOST_ATTR}] > button[${RECIPE_BUTTON_ATTR}]::before,
[${TOOL_ENTRY_HOST_ATTR}] > button[${RECIPE_BUTTON_ATTR}]::after {
    content: none !important;
    display: none !important;
}
`;
    if (style.textContent !== css)
        style.textContent = css;
}
export function isCurrentRuntime() {
    return globalThis.__rabbitMirrorRuntimeVersion === RUNTIME_VERSION;
}
export function isFeedbackCatEnabled() {
    try {
        return getSettings().feedbackCatEnabled !== false;
    }
    catch {
        return true;
    }
}
export function isMaintenanceAutoPatrolEnabled() {
    try {
        const settings = getSettings();
        return settings.maintenanceRabbitEnabled !== false && settings.maintenanceRabbitAutoSafeEnabled === true && settings.maintenanceRabbitAutoSafeConsent === true;
    }
    catch {
        return false;
    }
}
export function isMaintenanceRabbitEnabled() {
    try {
        return getSettings().maintenanceRabbitEnabled !== false;
    }
    catch {
        return true;
    }
}
export function hashInteractionSignature(text) {
    let hash = 2166136261;
    for (const char of String(text || '')) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}
export function escapeRegExp(text) {
    return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
export function getRabbitMirrorLocalStyleElements(root) {
    if (!root?.querySelectorAll)
        return [];
    const styles = [];
    const seen = new Set();
    const remember = (style) => {
        if (!style || seen.has(style))
            return;
        seen.add(style);
        styles.push(style);
    };
    root.querySelectorAll('style').forEach(remember);
    const scopedNode = root.matches?.('[data-rabbit-mirror-css-scope]')
        ? root
        : root.querySelector?.('[data-rabbit-mirror-css-scope]');
    const scopeValue = String(scopedNode?.getAttribute?.('data-rabbit-mirror-css-scope') || '').trim();
    if (!scopeValue)
        return styles;
    const boundary = root.closest?.('.mes_text') || root.closest?.('.mes') || root.parentElement;
    if (!boundary?.querySelectorAll)
        return styles;
    const scopePattern = new RegExp(`\\[\\s*data-rabbit-mirror-css-scope\\s*=\\s*["']${escapeRegExp(scopeValue)}["']\\s*\\]`, 'i');
    boundary.querySelectorAll('style').forEach(style => {
        if (scopePattern.test(String(style.textContent || '')))
            remember(style);
    });
    return styles;
}
export function escapeCssIdentifier(value) {
    const text = String(value || '');
    try {
        if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function')
            return CSS.escape(text);
    }
    catch {
    }
    return text.replace(/(^-?\d)|[^a-zA-Z0-9_-]/g, match => `\\${match}`);
}
export function getRenderedRabbitMirrorInteractionRoots(root) {
    if (!root?.querySelectorAll)
        return [];
    const candidates = new Set();
    if (root.nodeType === 1) {
        if (root.matches?.(MIRROR_TOTO_SELECTOR))
            candidates.add(root);
        else if (root.matches?.('details') && isRabbitMirrorDetails(root))
            candidates.add(root);
    }
    root.querySelectorAll(MIRROR_TOTO_SELECTOR).forEach(node => candidates.add(node));
    root.querySelectorAll('details').forEach(details => {
        if (!isRabbitMirrorDetails(details))
            return;
        if (details.closest(MIRROR_TOTO_SELECTOR))
            return;
        candidates.add(details);
    });
    return [...candidates];
}
export function clearMirrorTitleDisplayArtifacts(root) {
    root?.querySelectorAll?.(`span[${MIRROR_TITLE_SOURCE_ATTR}], span[${MIRROR_TITLE_PART_ATTR}]`)
        .forEach(node => node.replaceWith(...node.childNodes));
    root?.querySelectorAll?.(`span[${MIRROR_TITLE_PREFIX_ATTR}]`).forEach(node => {
        if (!node.textContent)
            node.remove();
    });
    root?.querySelectorAll?.('[data-rabbit-mirror-title-extra]').forEach(node => node.removeAttribute('data-rabbit-mirror-title-extra'));
}
export function getChatRoot() {
    if (typeof document === 'undefined')
        return null;
    return document.querySelector('#chat')
        || document.querySelector('#chat_block')
        || document.querySelector('.chat')
        || document.querySelector('[id*=chat]');
}
export function isInsideChatMessage(node) {
    const root = getChatRoot();
    if (!root || !node || !root.contains(node))
        return false;
    if (node.closest('#extensions_settings, #extensions_settings2, #rm_extensions_block, #extensionsMenu, .popup, .modal, .ui-dialog, [data-rm-theater-favorite-viewer], [data-rm-theater-favorite-library], [data-rm-theater-favorite-stage], [data-rm-theater-favorite-host]'))
        return false;
    const messageScope = node.closest('.mes, [mesid], .mes_text, [data-message-id], [data-messageid], .swipe_right, .swipe_left');
    return !!messageScope || root === node.closest('#chat') || root === node.closest('#chat_block');
}
function isOwnRabbitMirrorFace(details) {
    if (!details?.getAttribute)
        return false;
    if (/^rmcss-[a-z0-9-]+$/i.test(String(details.getAttribute(RABBIT_MIRROR_CSS_SCOPE_ATTR) || '').trim()))
        return true;
    if (details.getAttribute('data-rabbit-mirror-external-details') === 'true')
        return true;
    const summary = details.querySelector?.(':scope > summary');
    return __rmR("m10HJIJj1U505CT5FVUg_l3ktAhg1G1oa8t4ATvQ5_TQAbD4UzcaVoKOo2G", "i").test(String(summary?.textContent || ''));
}
export function isRabbitMirrorDetails(details) {
    if (!details?.querySelector)
        return false;
    const summary = details.querySelector(':scope > summary') || details.querySelector('summary');
    if (!summary)
        return false;
    const title = (summary.textContent || '').replace(/\s+/g, ' ').trim();
    if (__rmR("oNm9IIeyZTRqsgEq", "").test(title) || /rabbit\s*mirror/i.test(title))
        return true;
    const ownScope = String(details.getAttribute?.(RABBIT_MIRROR_CSS_SCOPE_ATTR) || '').trim();
    if (/^rmcss-[a-z0-9-]+$/i.test(ownScope))
        return true;
    const scopedHost = details.closest?.(`[${RABBIT_MIRROR_CSS_SCOPE_ATTR}]`);
    const scopedValue = String(scopedHost?.getAttribute?.(RABBIT_MIRROR_CSS_SCOPE_ATTR) || '').trim();
    if (scopedHost && scopedHost !== details && /^rmcss-[a-z0-9-]+$/i.test(scopedValue)) {
        const parentDetails = details.parentElement?.closest?.('details');
        if (parentDetails && isOwnRabbitMirrorFace(parentDetails))
            return false;
        if (!parentDetails || !scopedHost.contains?.(parentDetails))
            return true;
    }
    return false;
}
export function isRabbitMirrorOuterChatDetails(details) {
    if (!details?.matches?.('details') || !isInsideChatMessage(details) || !isRabbitMirrorDetails(details))
        return false;
    const chat = getChatRoot();
    for (let parent = details.parentElement?.closest?.('details'); parent && chat?.contains(parent); parent = parent.parentElement?.closest?.('details')) {
        if (isRabbitMirrorDetails(parent) || parent.parentElement?.matches?.(MIRROR_TOTO_SELECTOR))
            return false;
    }
    return true;
}
export function isHostDetailsCollapseControl(node) {
    return !!(node?.parentElement?.matches?.('details')
        && node.matches?.('.details-collapse-btn, [data-collapse-btn]')
        && !node.children?.length
        && __rmR("bmLzwxuMs75.Vqqc5r8Da1N62A18uXxizkJyv8NQXxwnHvdhX2_", "").test(String(node.textContent || '').trim()));
}
