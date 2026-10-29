import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=1.100.0";
import { SETTINGS_UI_VERSION, RUNTIME_VERSION, escapeHtml, isCurrentRuntime } from './ui/runtime.js?rmv=1.100.0';
import { reportRabbitMirrorStartupFailure } from './startupGuard.js?rmv=1.100.0';
import { chatu8Status } from './chatu8Image.js?rmv=1.100.0';
import { fetchImageLlmModels, imageLlmStatusText, importCurrentConnectionForImageLlm, listImageLlmProfiles, selectImageLlmProfile } from './imageLlm.js?rmv=1.100.0';
import { buildRabbitMirrorSettingsDialogHtml, buildWorldInfoPromptModalHtml, buildTagFilterModalHtml } from './ui/settingsTemplate.js?rmv=1.100.0';
import { attachIndependentApiDiagnosticListener, attachTokenMeterListener, renderIndependentApiDiagnostic, renderTokenMeter } from './ui/tokenMeter.js?rmv=1.100.0';
import { attachWorldInfoBooksListener, clearCollapsedAllWorldInfoBookRows, clearPulledWorldInfoBooks, installWorldInfoBookVisibilityObserver, pullAllWorldInfoBooks, renderWorldInfoBookSettings, resetWorldInfoBookUiState } from './ui/worldInfoBooks.js?rmv=1.100.0';
import { mountGenerationEvidenceUi, destroyGenerationEvidenceUi } from './ui/generationEvidence.js?rmv=1.100.0';
import { installTtDiagnosticEntry } from './ui/ttDiagnostics.js?rmv=1.100.0';
import { normalizePresentationModes } from './presentationMode.js?rmv=1.100.0';
import { renderFaceDrawSettings } from './faceDrawUi.js?rmv=1.100.0';
import { listHostWorldBooks, readHostWorldBook } from './externalWorldBook/hostReader.js?rmv=1.100.0';
import { refreshFacePagerPositions } from './facePagerPlacement.js?rmv=1.100.0';
import { refreshMirrorAnimationIdlePause } from './animationVisibility.js?rmv=1.100.0';
import { DEFAULT_INDEPENDENT_CONTEXT_EXCLUDED_TAGS, DEFAULT_VISUAL_PROMPT, INDEPENDENT_CONTEXT_EXCLUDED_TAG_MAX_COUNT, RABBIT_MIRROR_BANNED_WORD_MAX_COUNT, VISUAL_AVOID_PROMPT_MAX_CHARS, VISUAL_EXTRA_PROMPT_MAX_CHARS, VISUAL_PROMPT_MAX_CHARS, getSettings, normalizeIndependentContextExcludedTags, normalizeRabbitMirrorBannedWords, updateSettings, resetSettings, resetSettingsAndSaveNow, saveSettingsNowAndVerify } from './settings.js?rmv=1.100.0';
import { DEFAULT_INDEPENDENT_MAX_REQUEST_CHARS } from './independentRequestBudget.js?rmv=1.100.0';
import { clearLastCombo, getCurrentChatKey } from './storage.js?rmv=1.100.0';
import { normalizeEarlyBodyTags } from './earlyBodyTags.js?rmv=1.100.0';
import { independentGenerationTiming } from './independentTiming.js?rmv=1.100.0';
import { applyRabbitMirrorHostSurface } from './hostCompatibility.js?rmv=1.100.0';
import { DEFAULT_BEHAVIOR_RULE_TEXT, resolveBehaviorRuleText } from './behaviorRules.js?rmv=1.100.0';
import { clearRecentIndependentTransportDiagnostics } from './transportDiagnostics.js?rmv=1.100.0';
import { parseIndependentAdvancedOptions } from './advancedRequestOptions.js?rmv=1.100.0';
import { parseRabbitMirrorReplacementLines, formatRabbitMirrorReplacementLines } from './bannedWords.js?rmv=1.100.0';
import { normalizeNameMaskRules, NAME_MASK_MAX_RULES } from './nameMask.js?rmv=1.100.0';
import { nameMaskCardKey, nameMaskCardLabel, findNameMaskCandidates } from './nameMaskCandidates.js?rmv=1.100.0';
import { measureStorageCleanup, runStorageCleanup, prepareStorageCleanup, rabbitMirrorLocalBytes, formatCleanupBytes } from './storageCleanup.js?rmv=1.100.0';
import { scanAllChatsForCleanup, applyAllChatsCleanup } from './storageCleanupAllChats.js?rmv=1.100.0';
let allChatsCleanupPlan = null;
let allChatsCleanupAbort = null;
let nameMaskChatListenerBound = false;
import { clearRabbitMirrorPrompt, startManualEntryDiagnostic, stopManualEntryDiagnostic, getManualEntryDiagnosticState } from './injector.js?rmv=1.100.0';
import { clearFeedbackCatExtensionPrompt, getActiveFeedbackForCurrentChat, syncFeedbackCatExtensionPrompt } from './feedbackCat.js?rmv=1.100.0';
import { configureMaintenanceAutoSafeMode, refreshMaintenanceRabbits } from './outputSanitizer.js?rmv=1.100.0';
import { scanMemoryPlugins, testMemoryProvider } from './memoryScanner.js?rmv=1.100.0';
import { fetchIndependentModels, getIndependentConnectionProfiles, getIndependentSavedModels, getLastIndependentModelListDiagnostic, hydrateIndependentFavoriteHtml, backfillIndependentFloor, prepareIndependentBackfillFloor, independentBackfillBusy, independentBackfillChatKey, independentBackfillFloorToken, importCurrentSillyTavernConnection, listMissingIndependentRetryFloors, refreshRabbitMirrorGenerationMode, resyncMissingIndependentRetryShells, buildRabbitMirrorArchiveInventory, scanCurrentChatIndependentContextTags, testIndependentConnection, getObservedWorldInfoBooks } from './independentApi.js?rmv=1.100.0';
import { configureRabbitMirrorNoSendRegex, inspectRabbitMirrorNoSendRegex, openSillyTavernRegexSettings } from './regexConfigurator.js?rmv=1.100.0';
import { BLACKLIST_CHANGED_EVENT, blacklistEntries, blacklistPoolStats, clearBlacklist, removeBlacklistItem, setBlacklistEnabled, favoriteEntries, removeFavoriteItem, setFavoriteMultiplier, clearFavorites } from './blacklist.js?rmv=1.100.0';
import { THEATER_FAVORITES_CHANGED_EVENT, deleteTheaterFavorite, groupTheaterFavoritesByCharacter, listTheaterFavorites, openTheaterFavoriteLibrary, openTheaterFavoriteViewer } from './theaterFavorites.js?rmv=1.100.0';
import { mountSettingsAppearance, destroySettingsAppearance } from './settingsAppearance.js?rmv=1.100.0';
import { applyUserSkin, removeUserSkin } from './userSkin.js?rmv=1.100.0';
import { mountBackfillControls, stopBackfill } from './ui/backfillPanel.js?rmv=1.100.0';
const LOTTERY_ENTRY_LIMIT = 80;
const MOBILE_MODAL_IDS = ['rh_advanced_modal', 'rh_world_info_prompt_modal', 'rh_independent_tag_filter_modal'];
let mobileModalRootObserver = null;
const mobileModalObservers = new Map();
function rabbitMirrorMobileLike() {
    try {
        return globalThis.matchMedia?.('(max-width: 900px), (pointer: coarse)')?.matches === true;
    }
    catch {
        return false;
    }
}
function closeThroughExistingControl(dialog) {
    const closeId = dialog.id === 'rh_advanced_modal'
        ? 'rh_advanced_close'
        : (dialog.id === 'rh_independent_tag_filter_modal' ? 'rh_independent_tag_filter_close' : 'rh_world_info_prompt_close');
    const closeButton = dialog.querySelector(`#${closeId}`);
    if (closeButton) {
        closeButton.click();
        return;
    }
    if (dialog.getAttribute('aria-hidden') !== 'true')
        dialog.setAttribute('aria-hidden', 'true');
    if (dialog.style.display !== 'none')
        dialog.style.display = 'none';
    try {
        if (dialog.open && typeof dialog.close === 'function')
            dialog.close();
    }
    catch { }
}
function syncDialogTopLayer(dialog) {
    if (!(dialog instanceof HTMLElement))
        return;
    const wantsOpen = dialog.getAttribute('aria-hidden') === 'false'
        || dialog.style.display === 'flex'
        || dialog.style.display === 'grid'
        || dialog.style.display === 'block';
    if (wantsOpen) {
        if (dialog.getAttribute('aria-hidden') !== 'false')
            dialog.setAttribute('aria-hidden', 'false');
        if (dialog.style.display !== 'flex')
            dialog.style.display = 'flex';
        if (!dialog.hasAttribute('open')) {
            try {
                if (typeof dialog.showModal === 'function')
                    dialog.showModal();
                else
                    dialog.setAttribute('open', '');
            }
            catch {
                dialog.setAttribute('open', '');
            }
        }
        return;
    }
    if (dialog.getAttribute('aria-hidden') !== 'true')
        dialog.setAttribute('aria-hidden', 'true');
    if (dialog.hasAttribute('open')) {
        try {
            if (typeof dialog.close === 'function')
                dialog.close();
            else
                dialog.removeAttribute('open');
        }
        catch {
            dialog.removeAttribute('open');
        }
    }
    if (dialog.style.display !== 'none')
        dialog.style.display = 'none';
}
function bindPromotedDialog(dialog) {
    const existing = mobileModalObservers.get(dialog.id);
    if (existing?.node === dialog && dialog.dataset.rabbitMirrorTopLayerBound === 'true') {
        syncDialogTopLayer(dialog);
        return;
    }
    if (existing?.observer) {
        try {
            existing.observer.disconnect();
        }
        catch { }
    }
    dialog.dataset.rabbitMirrorTopLayerBound = 'true';
    dialog.addEventListener('cancel', event => {
        event.preventDefault();
        closeThroughExistingControl(dialog);
    });
    const observer = new MutationObserver(() => syncDialogTopLayer(dialog));
    observer.observe(dialog, { attributes: true, attributeFilter: ['aria-hidden', 'style'] });
    mobileModalObservers.set(dialog.id, { node: dialog, observer });
    syncDialogTopLayer(dialog);
}
function promoteModal(id) {
    let modal = document.getElementById(id);
    if (!modal)
        return null;
    if (modal.tagName !== 'DIALOG') {
        const dialog = document.createElement('dialog');
        for (const attr of Array.from(modal.attributes)) {
            dialog.setAttribute(attr.name, attr.value);
        }
        while (modal.firstChild)
            dialog.appendChild(modal.firstChild);
        modal.replaceWith(dialog);
        modal = dialog;
    }
    modal.classList.add('rabbit-mirror-top-layer-modal');
    bindPromotedDialog(modal);
    return modal;
}
function destroyRabbitMirrorMobileModals() {
    try {
        mobileModalRootObserver?.disconnect?.();
    }
    catch { }
    mobileModalRootObserver = null;
    for (const entry of mobileModalObservers.values()) {
        try {
            entry?.observer?.disconnect?.();
        }
        catch { }
    }
    mobileModalObservers.clear();
}
function installRabbitMirrorMobileModals() {
    destroyRabbitMirrorMobileModals();
    if (!rabbitMirrorMobileLike() || typeof document === 'undefined')
        return;
    for (const id of MOBILE_MODAL_IDS)
        promoteModal(id);
    if (typeof MutationObserver !== 'function')
        return;
    mobileModalRootObserver = new MutationObserver(() => {
        for (const id of MOBILE_MODAL_IDS)
            promoteModal(id);
    });
    mobileModalRootObserver.observe(document.body, { childList: true, subtree: false });
}
let uiMountRetryTimer = 0;
let uiMountRetryCount = 0;
let retainedExternalDiagnosticReport = '';
let retainedExternalDiagnosticStatus = null;
let memoryWorldBookDirectory = [];
let memoryWorldBookDirectoryLoaded = false;
let memoryWorldBookDirectoryBusy = false;
let memoryWorldBookDirectorySequence = 0;
let settingsToolsRefreshPending = false;
function scheduleSettingsToolsRefresh() {
    if (settingsToolsRefreshPending)
        return;
    settingsToolsRefreshPending = true;
    const refresh = () => {
        settingsToolsRefreshPending = false;
        if (isCurrentRuntime())
            refreshMaintenanceRabbits();
    };
    if (typeof globalThis.requestAnimationFrame === 'function') {
        globalThis.requestAnimationFrame(() => setTimeout(refresh, 0));
    }
    else
        setTimeout(refresh, 0);
}
function scheduleUiMountRetry() {
    if (!isCurrentRuntime() || uiMountRetryTimer)
        return;
    if (uiMountRetryCount >= 20) {
        reportRabbitMirrorStartupFailure(__rmT(".72q4WU6_6BNef"), new Error(__rmT("iVluqrhR3bIZyY4xYfG2wU2UcRkY4xkiGwZT24dSKfjxNWBRbixZuWagVEelm9XbEN0nI6oFdSXOW_vSRdTAlrr18kz0muvyzaAGWHkFlnzUBLglK_hioq6pSFoBHBlhka71YvHJj7vxOiJ3swd6qeFL")), { canOpen: false });
        return;
    }
    uiMountRetryCount += 1;
    globalThis.__rabbitMirrorPerfDiag?.mark?.('ui.mountRetryScheduled', { retry: uiMountRetryCount });
    uiMountRetryTimer = setTimeout(() => {
        uiMountRetryTimer = 0;
        try {
            initRabbitMirrorUI();
        }
        catch (error) {
            reportRabbitMirrorStartupFailure(__rmT(".72q4WU6_6BNef"), error, { canOpen: false });
        }
    }, Math.min(1000, 120 + uiMountRetryCount * 40));
}
function checked(id, value) {
    $(id).prop('checked', !!value);
}
function renderImageLlmProfiles(settings = getSettings()) {
    const select = $('#rh_image_llm_profile_select');
    if (!select.length)
        return;
    const current = String(settings.imageLlmProfileId || '');
    const rows = listImageLlmProfiles();
    select.empty().append($('<option>').val('').text(rows.length ? __rmT("hHjSGaR1O6wKmNArEcTv7dbFkGA2r6OD") : __rmT("A4nCnw6h_EpIv84PL5gUynowSqnruuVg1VnTwPaOUvq9E3XvjV6luZHBH8UUgw1svUr1Vd6SzvOy4cX.cldBwKJMqnSM2lAhadD")));
    for (const row of rows)
        select.append($('<option>').val(row.id).text([row.name, row.model, row.api].filter(Boolean).join(' · ')));
    if (current && rows.some(row => row.id === current))
        select.val(current);
}
function renderImageBackendStatus(settings = getSettings()) {
    const line = $('#rh_image_backend_status');
    if (!line.length)
        return;
    if (settings.imageBackend !== 'chatu8') {
        line.text(__rmT("VAL7IG2TqFgNDKaSNhna4iw7DI1.NldAQRZo8KP9IQmGOLVZr1iMWi8ozBG"));
        return;
    }
    const status = chatu8Status();
    line.text(status.configured ? `${__rmT("Ft7XHvRICuLUclko8J9fPKtOuLk")}${status.mode}${__rmT("5hcUkMbPEdthnqk3cLQVK9ve9HO1EGJnPjAFoAHVd65PRTKUNMMzb3urjecFnSkC")}` : status.reason);
}
function renderVisualPromptStatus(settings = getSettings()) {
    const target = $('#rh_visual_prompt_status');
    if (!target.length)
        return;
    const enabled = !!settings?.visualPromptEditingEnabled;
    const official = String(settings?.visualPrompt ?? DEFAULT_VISUAL_PROMPT).replace(/\r\n?/g, '\n');
    const extra = String(settings?.visualExtraPrompt || '').trim();
    const avoid = String(settings?.visualAvoidPrompt || '').trim();
    const parts = [];
    if (official !== DEFAULT_VISUAL_PROMPT)
        parts.push(__rmT("OCeqP9_P1tWSSqKKFoyzmZIY"));
    if (extra)
        parts.push(__rmT("kYcQh9_P1tUHYO.aFoyxmYV9"));
    if (avoid)
        parts.push(__rmT("GoZ2U2xVIbmdA6RAeiC"));
    if (enabled && !official.trim()) {
        target.text(__rmT("GEh_WMOVbQQMv8KHTfhOEJR1xQHcmmbXlyoc3yB6mYygUB.g7qRfM337kAmtmhhBjQXBwhAah4vEHKaXMA4CXmRZhy1Q.Nn4_FR9XD1hB0IFy6PCpGkjVRyuHBw2KLjCuRpIBX0JKglWFUWiOX7j_oIvFcBBNZHr8qoMEVsy9lEShqRw"));
        return;
    }
    if (!enabled) {
        target.text(parts.length
            ? `${__rmT("TpxdY6_ozFuw77kYj.xCq0N0N962OMLaKS5QDLNC2a6nT88w2auxFPs.YmJfrWP7lTxXxSLrdkncTg0AVqxv8BHchL3v1xhviIT_Xh")}${parts.join(' / ')}${__rmT("7Z2rzT")}` : __rmT("PCYTXyjzzbJ5nOKKmug8D2.5zbKWQIUdPdlF5Ap5wWxy8NQQDtLqk6JdjuxHIk4YvqK5tJlZMIaLThyfqAk"));
        return;
    }
    target.text(parts.length
        ? `${__rmT("bm_2kwmijaaX6BMpZoWj3_6Z.J2lcT")}${parts.join(' / ')}${__rmT("eXs")}` : __rmT("UJACPhQ80rCgHCktjrH6yWr_nul7qDzVkj6qf.3.zTtJDwNd58XXHoruQcsyBvkC"));
}
function renderBlacklistSettings() {
    const target = $('#rh_blacklist_summary');
    if (!target.length)
        return;
    const settings = getSettings();
    const themes = blacklistEntries('theme');
    const formats = blacklistEntries('format');
    const stats = blacklistPoolStats();
    const row = item => `<div style="display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:1px solid color-mix(in srgb,currentColor 10%,transparent);">
      <span style="min-width:0;flex:1;overflow-wrap:anywhere;">${escapeHtml(item.id)} ${escapeHtml(item.title)}</span>
      <button type="button" class="menu_button rh-blacklist-remove" data-kind="${escapeHtml(item.kind)}" data-id="${escapeHtml(item.id)}${__rmT("ZL67O.H25n9NJ0IevYgkeHDeTHD2LhJCfYEb6Zdpj.TEbRv8i5n2LBwfGWJsnktLQL_FGiYoWq_0KHeE6UOnjwfnG8U278Nvcbav.uJt0BtRMSgSk1VgbUNkVDD8DNP.o8ILIXgJXCqz6WjU4GrIksjDs_rNp4nJ5LiMyZq3Sr5Ylf")}`;
    const section = (title, items) => `<div style="margin-top:7px;"><div style="font-weight:700;font-size:11px;opacity:.74;margin-bottom:2px;">${title}${__rmT("eis")}${items.length}${__rmT("2HQi1y5eUdUK0Oh6lgD")}${items.length ? items.map(row).join('') : __rmT("OxyoVR_600yNea0jhtb7a29qhabYVn6GPINeUZRa9AlW6zp6dtPJFFpStzGWJHaA.6WxuAnQ1CU_cNpNHXs1_HfNidhiv9EigBkO4bwz1hwP7R1x4w.D15YxPE1QT6NxzIqi07ifdRo52QlWRWG53uqcId_Lq2zantLUGGUT")}</div>`;
    const warnings = [];
    if (stats.themePoolEmpty)
        warnings.push(__rmT("KjVHcQZVdu42mhQV0JTa66qG68RziQaBMiwXHRfpk4GkUiREJsIb_qA_Mal667RRfI9uUvoYY3Y"));
    if (stats.formatPoolEmpty)
        warnings.push(__rmT("Tdj4SrtoWt0HpG7cRHlDGHo67.mt3s7Jbz7VKMuqOVVF37Tyk2qhPTxkqFvVlSFyWUE"));
    target.html(`${__rmT("kIYdsw24zvdXg9ywQtCAkgKCIVt9aGb5YILXPck1QBXRrqGklfzIcb68vGKbYbbV.wfYM1JXoKnB0Xq4to9a.oEj8dXn_nWM9NdLZ1fUqPthlYd0sXXRY3ZL.hNgyQfV13SEWC.jl_9xZiygD5ja5GtGxE3.uT")}${settings.blacklistEnabled !== false ? __rmT("B8qEnh") : __rmT("5PXBNT")}${__rmT("OvHCUbCMKjkQkCBweyKl55Cx")}${themes.length}/${stats.themeTotal}${__rmT("Df1wkm8K3_dutlBq")}${formats.length}/${stats.formatTotal}${__rmT("pkdvyP_gSTC6U6pchO.MirY9Pi5Ixr0WFiKIxAS193OHGHExZtWAO80H2SUjaZrnT0CLrUaR7y98l.HMXiGBxsjXGtWM4wvflRK2h.1XDkNsOk")}${warnings.length ? `<div style="margin-top:5px;color:#d97706;font-size:11px;line-height:1.45;">${warnings.map(escapeHtml).join('<br>')}</div>` : ''}
      ${section(__rmT("jztJOyteqLCA0Sc9gEs"), themes)}
      ${section(__rmT("1Q3is5nrSDY"), formats)}`);
}
function renderFavoriteSettings() {
    const target = $('#rh_favorite_summary');
    if (!target.length)
        return;
    const themes = favoriteEntries('theme');
    const formats = favoriteEntries('format');
    const row = item => `<div style="display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:7px;padding:6px 0;border-bottom:1px solid color-mix(in srgb,currentColor 10%,transparent);">
      <span style="min-width:0;overflow-wrap:anywhere;">${escapeHtml(item.id)} ${escapeHtml(item.title)}${__rmT("ATsyu4TftYOpM.uHJuDSVL0HBtDasERCFe8tTs63UVzqY8xojDwDZzReTEXJzY_q_u27dIQYX1vmQSRVYGcPW4KWSb4x3r9IRsodG2XeNLtK0M2laldrw075rT9QJCnd_u4QvkOU7CArPjNrhMgZ2wV37QS3s91HX4PNu_RplLXClNGttH3zDLAOmh8lC8S6TeaU3rmy5Kn8sTAa7qV8weLeAv4ATNSwk9l16lWZ1Y_ZWYz9u42DMnFAdaSI3BaIT5Ef93c_TZImsZrxY7c.EwfStn_kvwyNazKaFJFC6iFFOgeDgsOYp2GPX3g5i6R5ExVJfDFzWK9NBvjEDzByKllzVkIOYgIHnraHHdT3l0rkvbX5A9UtPg8n1eos3RY5CqmANQCR.dvX7zRjy8UHfdFPyhdEKyUn6g_M_CwF1JPDXjr.AgNeVKoyTzEQGfCqpVLJRKXbG4QKCXHUbEhHK6Z1hfS7nBl.ruxFI57g.nmn5Z3dB9tbWhmfK60KH0oDx8yg5ZAoNb7exDNo.Rb8cx3fa9TVn.hCQIT")}${escapeHtml(item.multiplier)}" data-kind="${escapeHtml(item.kind)}" data-id="${escapeHtml(item.id)}" style="width:66px;min-height:28px;padding:2px 5px;"></label>
      <button type="button" class="menu_button rh-favorite-remove" data-kind="${escapeHtml(item.kind)}" data-id="${escapeHtml(item.id)}${__rmT("ZL67O.H25n9NJ0IevYgkeHDeTHD2LhJCfYEb6Zdpj.TEbRv8i5n2LBwfGWJsnktLQL_FGiYoWq_0KHeE6UOnjwfnG8U278NvcbaX.uJt0BtRMSgSk1VXHgH6VDD8DNP.o8ILIXgJXCqz6WjU4GrIksjDs_rNp4nJ5LiMyZq3Sr5Ylf")}`;
    const section = (title, items) => `<div style="margin-top:7px;"><div style="font-weight:700;font-size:11px;opacity:.74;margin-bottom:2px;">${title}${__rmT("eis")}${items.length}${__rmT("2HQi1y5eUdUK0Oh6lgD")}${items.length ? items.map(row).join('') : __rmT("eaMeOEI255P4JSKeapJpe.TecFQ1LCZCZCEr6ZNpL.xmbQ98E0ZuLBjfG1gFnp4Lor_6GiDoOj_0KGFE8UOkjwBnsBCo78avUmqX.3dtOByjMdnSLW1IKcTLn8D.Dbw.bGINI62JHYaj6dWUyGp0ufL.FM7cUnnJ5LiMyZq3Sr5Ylf")}</div>`;
    target.html(`${__rmT("pA8NrQlElVpQC1k.t5NMj_1JHRV2DjkBDW4Xc4b6Heyan7Bp6sJiJnBWdbq.tGGfGquuK83VxJ24_EOuLpYknMJahUenBSlaawxfDdCmT530gl8HjrtzVPMoK2TSVFDRIj1VV2dnqCrxZJh8_g9vIRaZuEZpBqnebmNWEn2T0ey5YWUxrtZORz3jduF1xYIfiDE7r8PN3YgLJM8Xztj_88qQvk9c1SoV8cioY3avEpB7JVet4azS3IO670Y6se39JLtjMT71peYdBJCJlpPOnCN2")}${section(__rmT("jztJOyteqLCA0Sc9gEs"), themes)}${section(__rmT("1Q3is5nrSDY"), formats)}`);
}
async function renderTheaterFavoriteSettings(knownRows) {
    const target = $('#rh_theater_favorite_summary');
    if (!target.length)
        return;
    try {
        const rows = Array.isArray(knownRows) ? knownRows : await listTheaterFavorites();
        if (!target.length)
            return;
        const groups = groupTheaterFavoritesByCharacter(rows);
        if (!groups.length) {
            target.html(__rmT("YsV7BZhWhnlyxPrh4TFqcUCmYEPWBNobpQfVZsJaLyVvUJqxtTTb135ZMbiAERpb6s4PMBsL_DvEhj4Q4DVV0LGutTwh_bcYDJIyqhOsgVkCFrsHLZWqVOaEi9ZHhev1fPVffTnLhQd015KDqCIKjYzbKej0AOVmyo7nfodZHLIq_jkrs8rp6Vx8ugoOIx3Mh9V2NAx9Gegf5xLFDoq8ztip7a0LDJ6DHY._3zf7r2YtdETe4gcX69tfGm58dZU0"));
            return;
        }
        target.html(groups.map(group => `<div style="margin-top:8px;">
      <div style="font-weight:700;font-size:11px;opacity:.8;margin-bottom:4px;">${escapeHtml(group.characterName)}${__rmT("eis")}${group.items.length}${__rmT("VU5ynMfBF95BQihAXLyOtmmiXk.zVGbBUcdoDf")}${group.items.map(item => `<div style="display:flex;align-items:center;gap:7px;padding:6px 0;border-bottom:1px solid color-mix(in srgb,currentColor 10%,transparent);">
      <span style="min-width:0;flex:1;overflow-wrap:anywhere;">${escapeHtml(item.title)} <small style="opacity:.62;">${escapeHtml(item.mode)}</small></span>
      <button type="button" class="menu_button rh-theater-favorite-open" data-id="${escapeHtml(item.id)}${__rmT("MyYXQIdNZ3UFw35ZzVar4njmQpEVB.rp1ZWEsqJ6SFVB8OB1u_TVp8M4V0Iir7zFE0zpZL_3musx8_qZSpgOQD_Tcdqs4pw7O4HGE2JLshs.p8biBhkcLaF06H4O1UsFglsIbKHmBbi6nz1h225M0gVmV3NWiqnhaAg7_QFYKUz3lVLzv.VPMQ6eTZlRZNYX03q62H4QWCrORUJffIoucgIi.8MilAjSfjWZ2tgbADEGU9ft6RZapAfQ5HN.Kp40768wq4ZlTwHEKpucApEogztV77SOnqjuArcq7EhtFBxASE9veo02W5hkuezLaXAFjc5clXiX5d6aCMVzEof8joxFQrjr0oSFwWbbI84X6d_TGDxXC7l")}${escapeHtml(item.id)}${__rmT("ZL67O.H25n9NJ0IevYgkeHDeTHD2LhJCfYEb6Zdpj.TEbRv8i5n2LBwfGWJsnktLQL_FGiYoWq_0KHeE6UOnjwfnG8U278NvcbaX.uJt0BtRMSgSk1rDHeNkVDD8DNP.o8ILIXgJXCqz6WjU4GrIksjDs_rNp4nJ5LiMyZq3Sr5Ylf")}`).join('')}
    </div>`).join(''));
    }
    catch (error) {
        target.html(`<div style="opacity:.7;font-size:11px;">${escapeHtml(error?.message || __rmT("eDH1ecj6d2RB1p.ZYJtpUT"))}</div>`);
    }
}
function independentModelPullSnapshotMatches(snapshot, state) {
    state = state || {};
    if (!snapshot || Number(snapshot.epoch) !== Number(state.epoch))
        return false;
    if (Number(snapshot.profileRevision) !== Number(state.profileRevision))
        return false;
    if (String(snapshot.activeProfileId || '').trim() !== String(state.activeProfileId || '').trim())
        return false;
    if (snapshot.source?.mode === 'profile')
        return String(snapshot.source.profileId || '').trim() === String(state.activeProfileId || '').trim();
    if (snapshot.source?.mode === 'manual')
        return String(snapshot.source.baseUrl || '').trim() === String(state.manualBaseUrl || '').trim()
            && String(snapshot.source.apiKey || '') === String(state.manualApiKey || '');
    return false;
}
let independentModelPullEpoch = 0;
function invalidateIndependentModelPull() {
    independentModelPullEpoch += 1;
}
function beginIndependentConnectionOperation() {
    const next = Number(globalThis.__rabbitMirrorIndependentConnectionOperationRevision || 0) + 1;
    globalThis.__rabbitMirrorIndependentConnectionOperationRevision = next;
    return next;
}
function independentConnectionOperationIsCurrent(revision) {
    return isCurrentRuntime()
        && Number(globalThis.__rabbitMirrorIndependentConnectionOperationRevision || 0) === Number(revision);
}
function renderMemoryScanResults(results) {
    const settings = getSettings();
    const selected = new Set(settings.memoryProviderIds || []);
    const container = $('#rh_memory_scan_results');
    if (!container.length)
        return;
    const list = Array.isArray(results) ? results : [];
    const readable = list.filter(item => item?.readable && item?.selectedAllowed);
    const pending = list.filter(item => !item?.readable);
    const contextBlock = __rmT("cFk9gqLKPjFCOGYB63XAYkHTTO.lYsXh3xovvkQ47.HZIh4Wt54_sAxLw0WST4qAv8i4YF7xAPy8ideG.b37Vg8pjP5WglbqRS.wvTD7Oi_H955Pn3vH4E3._JLbnVkK5.ruYRtn0xb_8bVQZREY._RVNerrbnmFJbGFxwkQf7UYiaHoMbC.oYCWIcOZxDqH874UnpKuKSfLZJ5C8jSA.t.GFZpz9f021Kl6xaCRGOa19UU0CB3YUomV0Oil6trWkHhQYfmukS7VPRaMPuaCKXhMv8ygJsZKy8a.l2kdgFikdtxkmUW5clVoN.pYKrLtnGhMcR5DgpMRIUTCvwdFVM5Q_xNA8JwqL6X0QhipKsCupnjsJQWUEPEYcMhYkCj9_iFjaMgO8IjpJ8Le9et2rEq4DpFQ9D1HAsi.xLXNLYIwTz4uC2norBoHyPdbVgrqWKiJSkca9ghJDoBbJF5_KdjtBna3D8uSmKsPSX8eNZ6SYmp8TgtxH678kl91KK.tV4MEJ7Z9N2DqYiUIKiNBKdU32cpjVu7Wk.SNiOp3LaMp_kNXhcpgKF.Ok7JSEbKu6wTa_m21NRCv6CItdIoWK_BnNFI3yilx5fFXIuVHgEkpAHjOrNoXeDCHT6kzsbn_Dyk1Hx6dLukc3bc_m81NSD02NOjxt0xB62m9.YvCZ4oZraw6knH2IYC49KJm6fKX4nZdr._VRBPBRF10JuJVUEW_iR67clCVya82U.wG1Gn7kpJgq8BN6lf333ILJLeihx0QNlq26xfD5t5kPw7lVVp30IM21oA4zZskdqxMMEzK7iGIbO0bmT");
    const readableRows = readable.map(item => {
        const checkedAttr = selected.has(item.id) ? ' checked' : '';
        return `<div class="rh-memory-provider" style="padding:8px 0;border-top:1px solid color-mix(in srgb, var(--SmartThemeBorderColor) 65%, transparent);">
          <label class="checkbox_label" style="align-items:flex-start;">
            <input class="rh-memory-provider-check" type="checkbox" data-provider-id="${escapeHtml(item.id)}"${checkedAttr}>
            <span><b>${escapeHtml(item.name)}${__rmT("zNkKPP0yQpsaWzsMg79clhIgtnxZubifFhTAiaIe7w.6141OEx4K4qLpXsvx0cUQr2QUqvnE1L88BtBuwVqbisT_MyBCBf8TYxH.yTvIP1W1VuYDosGsnLWezrS0X3bvTYsdCbDyu.wqKHx8G62REeUIzGHpg0R8.wSMNzK5XUQiOVZ1pAaXNEfDeazs4IBCiuAQM.yRXOI6FRuGTqOkKpQgV5Id7jYsx80_vmC8_7Xw2hg1dBbMA8Oe9a0PgBoqysZyd6FOi5iYaj_qrQcRey4oop8YgKkQigyi70PSgoO2zbIT.QEMH7W7nB1AqSro49vJx26vmU9JncPOVG.OyxGlYwnapZFkqrpk_HAX3Eh5r04PR4lCHAGOtwX9.HanMk02AaectvyAnAZFY4TVkfAvf2GV9qQmnMaJRUfxNJ3yzhmwP3TN0P7cL4p6g8qQqFovZz.h0kAT3yGbBUyEcf")}${item.details ? `<div style="margin:3px 0 0 26px;opacity:.62;font-size:11px;line-height:1.4;word-break:break-word;">${escapeHtml(item.details)}</div>` : ''}
          <button class="menu_button rh-memory-test" type="button" data-provider-id="${escapeHtml(item.id)}${__rmT("PPQhkYjs2acKzc5uYFv0rHDsgQQIfQpmeaY8nV_eeA9gEhltyCrkRwgg3ufNTDAS7tLcAT4HgEEh8FaWGRJASicrprwqTjGohhk6JKQD.jolo2x8k7YcCx2zST2wvyki2YNgwIjNviVx7xCMKVgS6Bbgw4v5zNfPO6ef2E_lV2k_BdwqB.D2T65Bwg38MeJK8cbBeazgMqOQnTxZc9a7OI_YJ2uA4190RwD7Au5APvtMcZecoNWOV.seeXPlvALITc9MUkzJbPhGYxKwgqkOe6yWt6TBwk")}`;
    }).join('');
    const readableBlock = readableRows || __rmT("8_kHMrUAROGTfr8hL0U.7n7zCDARAyW98zVGu2CsJznCRsvGzgJwFeJlaIH7r2n9rD0xWF7B2_GILYSacon0gxX10H28vXb4f15EJXF1foOZ55OS0.ilGdPcC5i_Smh4tHycGC.BIrClZsnfnz7BWS_zmA4OjN1yedgx0klmXOkqJhlFebKQOfp1X9Lb2NWS8zWVh.NsHsMt5E6zjdgueq6RFpROQnc0sYaHlm8i.eE9.fdXfs11Bh");
    let pendingBlock = '';
    if (pending.length) {
        const visiblePending = pending.slice(0, 10);
        const pendingRows = visiblePending.map(item => `<div style="padding:5px 0;border-top:1px solid color-mix(in srgb, var(--SmartThemeBorderColor) 45%, transparent);">
          <div style="font-size:12px;"><b>${escapeHtml(item.name)}${__rmT("Gjf02tF4473VqUeY5YxxWi8y88KNITYuIebdi.WOyc4iB5IaGrmRVPJhRhVxt9LqVitqMobsdiDZE_WPV4SYpiA9Nh4F3arbP2So2YbgqtAO.jsNll92S1Iyeuu53kzuX.TaNTCPlYmiG8E.SjhSocbwGkH5Y5JX.l9ejOA5XSBwWOJEK.k.8zKBTohtMu4K4dPJ653og2uL77ohd4xUuQFJcvgmUbrmNs3qqqka8PgI090BzGRkI1fDivp0j_YmGw4KgonVXEKESY5QTuyigX_pwb16i9lxH4BreT8J7nb392z1P.px3mH.2OyUrlj5jWWe87dda4FzTADMvTjRfWcvFsNARVpTmDD.RLS3O5WQMGH63e5EL1_W7zD5UvnZIAQCxDS42W8mmYRxcJJ09N0dnbD")}${escapeHtml(item.source || item.status || '')}</div>
        </div>`).join('');
        const omitted = pending.length > visiblePending.length
            ? `${__rmT("iJeiLy2lv18fz50.2IfKyiPK6S7ng2zlsrxVvxd9W18yOfmfv_q2sjh1K.xy_ADa1T6.ijzfbcmDM69Hk8jA_jbAlkI40FCF2Rsfea875aSpmGlUsS_NyQyu8eg280SbF9LDcyASPklE3n2WYiAKoDJIHQZzuaAn")}${pending.length - visiblePending.length}${__rmT("RN3E1lfiIYh8ESbtVRbIQMaBuHht.yy1W2e3.k6bpP8")}` : '';
        pendingBlock = `${__rmT("ZPESBe8FUgg0vdfdSLZmtvHn1RfZtv_HddmOydt4yhyEWQNt7SPhCIUTPuGSWl4Y.eewE4m4pVH0mLyrz5fRDCdL4xD6N0mu7LDOZigDanMB4ZDGilpteSmfjpUrke9HFhsD38CC_UBYVm4bClbAg1_OiX7axUOm4wR2625fAOk5rxNAUx5coIwPPun7DNO.ZtRBcFeXwwrLr4LUrRX3fSPIf8xJUGoP6BnAmLBbQm52FDBuY1kUBl8400.wAeK6CFSD3KqhWtRGFWxFG4lm4BqTL_gBpqpBc0clqKJNeGwtWO5oGGKrbv_PAauCxrLnEqbSIyHk5rczVFNzEstdQlauUZjoQbNvAPSlTmz1pDb3eaW2Z26UZSZSyYk8EQ6JCU4NAKFSGakDy_Fv9eyL1G1oFUyRtu4b1H5_5l1jmRhigB8oxtcz9hFAngq4qb01z2SZqdDIFHvo9ye5HeEvu_I3jdNYDnNUBjMQAoQhLiTxWZJLQBe0aPzc.BiA2byad1asG8tdifLMqQEO8zo.EZOsdl_YxfoRJJdWlWgXYk8DxbVm4mBwqgG3Uq3TcQ5pVwrJgO8SNSCOZO950zelG0bfI9hjkqmPFFWw3Eu8eeEHy_3bjzYuzxoKYxjarT")}${pending.length}${__rmT("x471ZAc4IP6nn8v3RLAiQbrQb60a0pKKShi521vSPfLUN0lRlyTIu0ZgL_YomPSbUN0kImdFWzm_BPU3Fy_mnx4vGQ3vCbnH2fFrAtEQErlm8jo9n63DJIzdhlYEAqV4xZP.lYm7i1kn6w0XfQGbCaQd")}${pendingRows}${omitted}</div>
        </details>`;
    }
    if (!readable.length && !pending.length) {
        container.html(`${contextBlock}${__rmT("8_kHMrUAROGTfr8hL0U.7n7zCDARAyW98zVGu2CsJznCRsvGzgJwFeJlaIH7r2n9rD0xWF7B2_GILYSacon0gxX10H28vXb4f15EJXF1foOZ55OS0.ilGdPcC5i_Smh4tHycGC.BIrClZsnfnz7BWS_zmA4OjN1yedgx0klmXOkqJhlFebKQOfp1X9Lb2NWSZvRI0RNsHsMt5E6zjdgueq6RFpROQnc0sYaHlm8i.eE9.fdXfs11Bh")}`);
        return;
    }
    container.html(`${contextBlock}${readableBlock}${pendingBlock}`);
}
function renderMemoryWorldBookBinding(message = '') {
    const select = document.getElementById('rh_memory_worldbook_id');
    if (!select)
        return;
    const settings = getSettings();
    const bound = settings.memoryWorldBookId;
    const options = [{ fileId: '', displayName: __rmT("ZDOuPt2FvecggMNjvGLhMf") }, ...memoryWorldBookDirectory];
    if (bound && !memoryWorldBookDirectory.some(book => book.fileId === bound)) {
        options.push({ fileId: bound, displayName: `${bound}${__rmT("eis")}${memoryWorldBookDirectoryLoaded ? __rmT("ntvm1Leicmy_Ng7nifr223l77cS5N4a4NO2Wek") : __rmT("2lK6UH3425oyckk1qT_IG4gDJEk")}${__rmT("eXs")}` });
    }
    select.replaceChildren(...options.map(book => {
        const option = document.createElement('option');
        option.value = book.fileId;
        option.textContent = book.displayName;
        return option;
    }));
    select.value = bound;
    checked('#rh_memory_worldbook_enabled', settings.memoryWorldBookEnabled);
    $('#rh_memory_worldbook_refresh').prop('disabled', memoryWorldBookDirectoryBusy)
        .text(memoryWorldBookDirectoryBusy ? __rmT("mbdy00Zn.uizxdBe0O.bE8WOL2s") : __rmT("Y4mSo3L2wOxvTDIRLXA"));
    $('#rh_memory_worldbook_clear').prop('disabled', !bound);
    $('#rh_memory_worldbook_status').attr('aria-busy', String(memoryWorldBookDirectoryBusy)).text(message || (memoryWorldBookDirectoryBusy ? __rmT("RHgve.GHpdmOTlVk2tjbHIIO.9gEGb.NRaCice0mDeXQ2h") : !settings.memoryScanEnabled ? __rmT("ZMiQ0J63HyrYZqApPncP4TNDX8bi3J6YE5pZMBCY02fH2rNFSSJ_z3CDinSvtX0SmwStIrw9JXEobh") : !settings.memoryWorldBookEnabled ? __rmT("bVoj.HRkTTm5QdLgEB6w1sI9S7mMUobJU7AgXHVhBjuBrR6DOvpr7f") : !bound ? __rmT("nCqSOL5Hv.bb_zvmD_ZPyMgbCxTKwehMtF1TZz0tzZMb336dChUPiW5X") : __rmT("zsCgHelbHuTNQ67sAaxAmAmtYZTH.KNG9kkW3UL_uhumxCwK0hnqy9F.O706bEGOJMpMxAqNB77xmxkL3nYFrh")));
}
async function refreshMemoryWorldBookDirectory() {
    const select = document.getElementById('rh_memory_worldbook_id');
    if (!select || memoryWorldBookDirectoryBusy)
        return;
    const sequence = ++memoryWorldBookDirectorySequence;
    const isAlive = () => sequence === memoryWorldBookDirectorySequence && select.isConnected
        && document.getElementById('rh_memory_worldbook_id') === select && isCurrentRuntime();
    memoryWorldBookDirectoryBusy = true;
    renderMemoryWorldBookBinding();
    try {
        const { listMemoryWorldBooks, normalizeMemoryWorldBookId } = await import('./memoryWorldBook.js?rmv=1.100.0');
        if (!isAlive())
            return;
        const books = await listMemoryWorldBooks();
        if (!isAlive())
            return;
        const seen = new Set();
        memoryWorldBookDirectory = books.flatMap(book => {
            const fileId = normalizeMemoryWorldBookId(book?.fileId);
            if (!fileId || seen.has(fileId))
                return [];
            seen.add(fileId);
            return [{ fileId, displayName: String(book.displayName || fileId) }];
        });
        memoryWorldBookDirectoryLoaded = true;
        memoryWorldBookDirectoryBusy = false;
        renderMemoryWorldBookBinding(memoryWorldBookDirectory.length
            ? `${__rmT("iFBUz84JHKG")}${memoryWorldBookDirectory.length}${__rmT("o6lyRjGmcVt6ftw7xCDCm3g9v_Zgbm0lnP_uu1I1mZEYI086Go6aTb969nXuXxb30KOY3h")}` : __rmT("ypjJS.ko7mMAcRTqcT..RpvsSYpCKojxJcP5KICXDJXdEPUeCQt3lSgoi4lOt44UTvQGlIhckiEobh"));
    }
    catch {
        if (!isAlive())
            return;
        memoryWorldBookDirectoryBusy = false;
        renderMemoryWorldBookBinding(__rmT("2FLz59Iff5IvD0f669QmX352E_7beP3WKyNUnSvBbJoh.a8jY0CavK_suKXPdDEDCEfKga0MB0OrhHU9S0IDAy2EkfrKmawbwYdKU.Ukq2YwYo_z"));
    }
}
function memoryTestMessage(result) {
    if (!result?.ok)
        return `${__rmT("ntMbcSu3rCFStf")}${result?.error || __rmT("BMT6KAslNVp")}`;
    const parts = [
        `${result.providerName || __rmT("4Yu1FntXV6f")}${__rmT("ECkDAA26rDh")}`,
        `${__rmT("sm0f817wiJuBTh")}${result.chars}${__rmT("qGyUScEk")}`,
        result.characterName ? `${__rmT("gk9kYdop")}${result.characterName}` : '',
        result.chatId ? `${__rmT(".kt2SLop")}${result.chatId}` : '',
        result.coverageComplete === false ? `${__rmT("rUvQPL5ELZ.Zua6fg_V3M5Cx")}${result.missingFloors || 0}${__rmT("wRecUYrSU1IwkCBwNK_i6O4y")}` : '',
        `${__rmT("Mflp.ec6")}${result.elapsed || 0}ms`,
        result.note || '',
    ].filter(Boolean);
    return parts.join(__rmT("7os"));
}
export function initRabbitMirrorUI() {
    if (!isCurrentRuntime())
        throw new Error(`${__rmT("CIy0XRMpd_AtqgxvPtPelnPSfezEQBJcEM10MwVq")}${String(globalThis.__rabbitMirrorRuntimeVersion ?? '') || __rmT("QrG")}${__rmT("NUco8xHNsSbHTpV3gPD")}${RUNTIME_VERSION}${__rmT("lWMxzJCYc_DqK.OAbEEM4wOvEr63uDp202_vHIqCDtRigsbU3C6R.LfmrSMYMerWtP8MWmZyiDIZwP8MsZCFycb4GHjNrTx1uB7n5pw9")}`);
    try {
        applyUserSkin();
    }
    catch (error) {
        console.warn(__rmT("4xrN8.vjlGvmfgDABHuLjSLH.pRIMnM9Hty.ISZGRKHtoLWpcx.wUqZk"), error);
    }
    void import('./extensionUpdater.js?rmv=1.100.0')
        .then(updater => updater.setupRabbitMirrorExtensionReloadWatch())
        .catch(error => console.warn(__rmT("kgRTYhcxXS2m4ONWwxNuOg_eeQb7JQvzO3QRKgCUa4lXyzifBfSUrIiMo4qL8jq7z.F_zk"), error));
    const finishUiInit = globalThis.__rabbitMirrorPerfDiag?.begin?.('ui.initCall', { retry: uiMountRetryCount }, 0);
    const settings = getSettings();
    const noSendRegex = '/<toto\\b[^>]*>[\\s\\S]*?<\\/toto>\\s*/gi';
    const existing = $('#rabbit_mirror_theater_settings');
    if (existing.length) {
        const currentPanels = existing.filter(`[data-rabbit-mirror-ui-version="${SETTINGS_UI_VERSION}"][data-rabbit-mirror-runtime-version="${RUNTIME_VERSION}"]`)
            .filter((_, panel) => panel.dataset.rabbitMirrorUiReady === 'true'
            && panel.dataset.rhWorkbench === 'ui3'
            && panel.tagName === 'DIALOG'
            && panel.__rabbitMirrorWorkbench?.hasEntry()
            && panel.__rabbitMirrorWorkbench?.isComplete()
            && panel.querySelector('#rh_enabled')
            && panel.querySelector('#rh_ui_theme')
            && panel.querySelectorAll('.rh-ui-tabs').length === 1);
        if (existing.length === 1 && currentPanels.length === 1) {
            finishUiInit?.({ outcome: 'already-mounted' });
            return;
        }
        try {
            globalThis.__rabbitMirrorTagFilterScanUiCleanup?.();
        }
        catch { }
        globalThis.__rabbitMirrorTagFilterScanUiCleanup = null;
        try {
            globalThis.__rabbitMirrorTtDiagnosticUiCleanup?.();
        }
        catch { }
        existing.each((_, panel) => destroySettingsAppearance(panel));
        existing.remove();
        $('body > #rh_advanced_modal, body > #rh_world_info_prompt_modal, body > #rh_independent_tag_filter_modal').remove();
    }
    memoryWorldBookDirectorySequence += 1;
    memoryWorldBookDirectoryBusy = false;
    const settingsMount = $('body');
    if (!settingsMount.length || !document.getElementById('extensionsMenu')) {
        scheduleUiMountRetry();
        finishUiInit?.({ outcome: 'mount-missing' });
        return;
    }
    uiMountRetryCount = 0;
    const html = buildRabbitMirrorSettingsDialogHtml();
    try {
        globalThis.__rabbitMirrorQuickStartUiCleanup?.();
    }
    catch { }
    globalThis.__rabbitMirrorQuickStartUiCleanup = null;
    $('body > #rh_advanced_modal, body > #rh_world_info_prompt_modal, body > #rh_independent_tag_filter_modal').remove();
    settingsMount.append(html);
    if (globalThis.__TAURITAVERN__)
        document.getElementById('rabbit_mirror_theater_settings')?.setAttribute('data-rm-host', 'tauritavern');
    $('#rh_advanced_modal').appendTo(document.body);
    $(buildWorldInfoPromptModalHtml()).appendTo(document.body);
    $(buildTagFilterModalHtml()).appendTo(document.body);
    for (const id of ['rh_advanced_modal', 'rh_world_info_prompt_modal', 'rh_independent_tag_filter_modal']) {
        const modal = document.getElementById(id);
        applyRabbitMirrorHostSurface(modal, 'backdrop');
        applyRabbitMirrorHostSurface(modal?.firstElementChild, 'fullscreen-window');
    }
    installRabbitMirrorMobileModals();
    attachTokenMeterListener();
    renderTokenMeter();
    checked('#rh_enabled', settings.autoRabbitMirrorInjection !== false && settings.enabled !== false);
    $('#rh_independent_generation_timing').val(independentGenerationTiming(settings));
    $(`input[name="rh_generation_source"][value="${settings.generationSource || 'follow'}"]`).prop('checked', true);
    $(`input[name="rh_follow_display"][value="${settings.followDisplayMode || 'inline'}"]`).prop('checked', true);
    $(`input[name="rh_independent_display"][value="${settings.independentDisplayMode || 'external'}"]`).prop('checked', true);
    $(`input[name="rh_independent_anchor"][value="${settings.independentExternalAnchor || 'outside'}"]`).prop('checked', true);
    $('#rh_missing_shell_range').val(String(settings.missingShellScanRange || 10));
    $('#rh_independent_base').val(settings.independentApiBaseUrl || '');
    $('#rh_independent_key').val(settings.independentApiKey || '');
    $('#rh_independent_temperature').val(settings.independentApiTemperature ?? 0.8);
    $('#rh_independent_max_tokens').val(settings.independentApiMaxTokens ?? 30000);
    $('#rh_independent_max_request_chars').val(settings.independentMaxRequestChars ?? DEFAULT_INDEPENDENT_MAX_REQUEST_CHARS);
    $('#rh_independent_automatic_reroll').val(settings.independentAutomaticRerollMax ?? 2);
    $('#rh_independent_automatic_reroll_idle').val(settings.independentAutomaticRerollIdleSeconds ?? 90);
    checked('#rh_automatic_reroll_enabled', settings.automaticRerollEnabled !== false);
    $('#rh_automatic_reroll_fields').prop('hidden', settings.automaticRerollEnabled === false);
    checked('#rh_independent_advanced_enabled', settings.independentAdvancedEnabled === true);
    $('#rh_independent_reasoning_effort').val(settings.independentReasoningEffort || '');
    $('#rh_independent_extra_params').val(typeof settings.independentExtraParams === 'string' ? settings.independentExtraParams : '');
    const setExcludedSelection = fields => {
        const selected = new Set(Array.isArray(fields) ? fields : []);
        document.querySelectorAll('#rh_independent_excluded_params [data-rh-exclude-param]').forEach(input => {
            input.checked = selected.has(input.getAttribute('data-rh-exclude-param'));
        });
    };
    setExcludedSelection(settings.independentExcludedParams);
    $('#rh_independent_context_layers').val(settings.independentContextMaxLayers ?? 20);
    checked('#rh_follow_tag_isolation', settings.followTagIsolationEnabled === true);
    $('#rh_banned_words_save').parent().parent().appendTo('#rh_advanced_page_replacement');
    $('#rh_name_mask_block').appendTo('#rh_advanced_page_replacement');
    $('#rh_advanced_page_external').prepend($('#rh_external_library_actions'));
    document.getElementById('rh_advanced_page_worldinfo').prepend(document.getElementById('rh_behavior_rules'));
    $('#rh_banned_words').val(formatRabbitMirrorReplacementLines(settings.rabbitMirrorBannedWords || []));
    $('#rh_name_mask_rules').val(formatRabbitMirrorReplacementLines(settings.nameMaskRules || []));
    refreshNameMaskCardUi();
    $('#rh_banned_words_status').text(`${__rmT("iFB45T6zHKG")}${(settings.rabbitMirrorBannedWords || []).length} / ${RABBIT_MIRROR_BANNED_WORD_MAX_COUNT}${__rmT("qGtBWP4T")}`);
    $('#rh_independent_model').val(settings.independentApiModel || '');
    const tagFilterPresetLabels = new Map([
        ['thinking', 'thinking'],
        ['updatevariable', 'UpdateVariable'],
        ['updatevarible', 'UpdateVarible'],
    ]);
    let tagFilterDraft = new Set();
    let tagFilterDetected = new Map();
    let tagFilterScanController = null;
    let tagFilterScanEpoch = 0;
    const renderTagFilterSummary = () => {
        const current = getSettings();
        const tags = normalizeIndependentContextExcludedTags(current.independentContextExcludedTags);
        const followHint = current.followTagIsolationEnabled === true ? __rmT("sWlcv3PBPyKCtiuG") : __rmT("sWlcv3PBPyXsIyuG");
        const summary = tags.length
            ? `${__rmT("4R66fVc6")}${tags.length}${__rmT("qGygZrop")}${tags.slice(0, 3).map(tag => tagFilterPresetLabels.get(tag) || tag).join(__rmT("jvk"))}${tags.length > 3 ? '…' : ''}${__rmT("7os")}${followHint}` : `${__rmT("IFd55M_Ept6GrtqD")}${followHint}`;
        $('#rh_independent_tag_filter_summary').text(summary);
    };
    const renderTagFilterDraft = () => {
        const list = $('#rh_independent_tag_filter_list').empty();
        const knownTags = [...new Set([...DEFAULT_INDEPENDENT_CONTEXT_EXCLUDED_TAGS, ...tagFilterDraft, ...tagFilterDetected.keys()])];
        for (const tag of knownTags) {
            const row = $('<div>').css({ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '8px', alignItems: 'center', padding: '8px 9px', border: '1px solid color-mix(in srgb,currentColor 13%,transparent)', borderRadius: '10px' });
            const label = $('<label>').addClass('checkbox_label').css({ minWidth: 0, overflowWrap: 'anywhere' });
            const checkbox = $('<input>').attr({ type: 'checkbox', 'data-rh-context-tag': tag }).prop('checked', tagFilterDraft.has(tag));
            label.append(checkbox, document.createTextNode(` <${tagFilterPresetLabels.get(tag) || tag}>`));
            row.append(label);
            const detectedCount = Number(tagFilterDetected.get(tag) || 0);
            if (detectedCount > 0)
                row.append($('<span>').text(`${__rmT("D9C78a2gHKG")}${detectedCount}${__rmT("2RWUYk")}`).css({ opacity: .68, fontSize: '10px', whiteSpace: 'nowrap' }));
            else if (tagFilterPresetLabels.has(tag))
                row.append($('<span>').text(__rmT("3DbEnh")).css({ opacity: .62, fontSize: '10px' }));
            else
                row.append($('<button>').attr({ type: 'button', 'data-rh-remove-context-tag': tag }).addClass('menu_button').text(__rmT(".MzhPf")).css({ minWidth: '64px' }));
            list.append(row);
        }
        if (!knownTags.length)
            list.append($('<div>').text(__rmT("58GZS_4yqIbQYLXmpRBZv7EI")).css({ opacity: .65, fontSize: '11px' }));
    };
    const cancelTagFilterScan = () => {
        tagFilterScanEpoch += 1;
        try {
            tagFilterScanController?.abort?.();
        }
        catch { }
        tagFilterScanController = null;
        $('#rh_independent_tag_filter_scan').prop('disabled', false).text(__rmT("zBc1EnmKRDn1sQdkhuS8qk"));
        $('#rh_independent_tag_filter_save').prop('disabled', false);
    };
    try {
        globalThis.__rabbitMirrorTagFilterScanUiCleanup?.();
    }
    catch { }
    globalThis.__rabbitMirrorTagFilterScanUiCleanup = cancelTagFilterScan;
    const setTagFilterOpen = open => {
        const modal = $('#rh_independent_tag_filter_modal');
        cancelTagFilterScan();
        if (open) {
            tagFilterDraft = new Set(normalizeIndependentContextExcludedTags(getSettings().independentContextExcludedTags));
            tagFilterDetected = new Map();
            $('#rh_independent_tag_filter_input').val('');
            $('#rh_independent_tag_filter_error').text('');
            $('#rh_independent_tag_filter_scan_status').text(__rmT("UWSvvNxSY.KGf3FDNHFvVydGHbTDEQeRtCReVdli4qhRSOfEVfHjbf4IB.Q4ZsHem16V1rTgRmBJ8VzxqAk"));
            renderTagFilterDraft();
        }
        modal.attr('aria-hidden', open ? 'false' : 'true').css('display', open ? 'flex' : 'none');
        if (open)
            setTimeout(() => $('#rh_independent_tag_filter_input').trigger('focus'), 0);
    };
    renderTagFilterSummary();
    const earlyBodyChat = () => { try {
        return String(getCurrentChatKey(globalThis.SillyTavern?.getContext?.()?.chat || []) || '');
    }
    catch {
        return '';
    } };
    let earlyBodyRenderedChat = '';
    const renderEarlyBodySettings = () => {
        const value = getSettings();
        const currentChat = earlyBodyChat();
        if (currentChat !== earlyBodyRenderedChat) {
            $('#rh_early_body_candidates').empty();
            earlyBodyRenderedChat = currentChat;
        }
        const sameChat = value.independentEarlyBodyChatKey === currentChat;
        checked('#rh_early_body_enabled', sameChat && value.independentEarlyBodyEnabled === true);
        $('#rh_early_body_tags').val(sameChat ? (value.independentEarlyBodyTags || []).join(', ') : '');
        $('#rh_early_body_status').text(sameChat && value.independentEarlyBodyEnabled === true ? __rmT("_9PW6LtM8CepZEXtYIXWkSWR05KGl6EhoAvVGpt64a1M.AFtq8_") : __rmT("aVHrCvdQOJTUxX4DsW3dYqhMda1eKOs2"));
    };
    renderEarlyBodySettings();
    globalThis.__rabbitMirrorRenderEarlyBodySettings = renderEarlyBodySettings;
    $('#rh_early_body_options').on('toggle', event => { if (event.currentTarget.open)
        renderEarlyBodySettings(); });
    $('#rh_early_body_enabled').on('change', event => {
        if (!event.currentTarget.checked && getSettings().independentEarlyBodyChatKey === earlyBodyChat()) {
            updateSettings({ independentEarlyBodyEnabled: false });
            refreshRabbitMirrorGenerationMode();
            $('#rh_early_body_status').text(__rmT("HCv6EckzYPv5QErC3ba_yFmjdZfKwY6bxHVA_pjVE.Xpu_WgA5geHq5X"));
        }
        else
            $('#rh_early_body_status').text(__rmT("ph4DmMdnh3k8l0KEO.zQUoEdnQz8KSXQWFW0atKq"));
    });
    $('#rh_early_body_save').on('click', () => {
        const enabled = $('#rh_early_body_enabled').prop('checked') === true;
        const input = String($('#rh_early_body_tags').val() || '').split(__rmR("xugMa2TBnsSB3v.fAcL9yGrXeQs", "")).filter(Boolean);
        const tags = normalizeEarlyBodyTags(input);
        const context = globalThis.SillyTavern?.getContext?.() || {};
        const key = earlyBodyChat();
        if (!Array.isArray(context.chat) || !context.chat.length || !key) {
            $('#rh_early_body_status').text(__rmT("avlok2u5ZYaiMKO0fEoOj9Er.BPrrk"));
            return;
        }
        if (enabled && !tags.length) {
            $('#rh_early_body_status').text(__rmT("Fmx8ILo18BPjl9sjVtT4k4SE75SWcUk.eNWHFSkj4_Lwkp_hOMT1B.XjxdsuEzDXWIM7hz1DsMow0gq4m4JjodGu"));
            return;
        }
        if (enabled && tags.some(tag => (getSettings().independentContextExcludedTags || []).includes(tag))) {
            $('#rh_early_body_status').text(__rmT("HE59Eh0L52niI1.KrpEr29e2k3OK2BAmRLXXQXG7OBpOYOIdJPad_Od6Ho3r6y0kVTVpqsrITpvsW9pBxxlLiZ8Qv2Acxf"));
            return;
        }
        updateSettings({ independentEarlyBodyEnabled: enabled, independentEarlyBodyTags: tags, independentEarlyBodyChatKey: key });
        refreshRabbitMirrorGenerationMode();
        $('#rh_early_body_status').text(enabled ? __rmT("HCTePojlj1lB4wR07_UL4kBH6x9qWcPCcPq72o0N_.KrjK0JTfUVCj5X") : __rmT(".m00r2fmdCNF5MVbvSMtwmudbMrShxGM29E"));
    });
    $('#rh_early_body_scan').on('click', async (event) => {
        const button = event.currentTarget, owner = earlyBodyChat();
        if (button.disabled)
            return;
        button.disabled = true;
        $('#rh_early_body_status').text(__rmT("P63FwiFEfIUWRNzXjrXuRyICJ3SPM05y7Jco6TKu78ykgvg.eflr7f"));
        try {
            const result = await scanCurrentChatIndependentContextTags();
            if (!button.isConnected || owner !== earlyBodyChat())
                return;
            const target = document.getElementById('rh_early_body_candidates');
            target.replaceChildren();
            const selected = new Set(normalizeEarlyBodyTags(String($('#rh_early_body_tags').val() || '').split(__rmR("xugMa2TBnsSB3v.fAcL9yGrXeQs", "")).filter(Boolean)));
            for (const row of result?.tags || []) {
                const name = normalizeEarlyBodyTags([row?.name])[0];
                if (!name)
                    continue;
                const label = document.createElement('label');
                label.className = 'checkbox_label';
                label.style.minHeight = '44px';
                const control = document.createElement('input');
                control.type = 'checkbox';
                control.checked = selected.has(name);
                control.addEventListener('change', () => {
                    const current = new Set(normalizeEarlyBodyTags(String($('#rh_early_body_tags').val() || '').split(__rmR("xugMa2TBnsSB3v.fAcL9yGrXeQs", "")).filter(Boolean)));
                    if (control.checked && current.size >= 8 && !current.has(name)) {
                        control.checked = false;
                        return;
                    }
                    if (control.checked)
                        current.add(name);
                    else
                        current.delete(name);
                    $('#rh_early_body_tags').val([...current].join(', '));
                });
                label.append(control, document.createTextNode(name));
                target.append(label);
            }
            $('#rh_early_body_status').text(target.childElementCount ? __rmT("mVisdDqNhsjv_Wyq5eFmOIxkBwwQnuJx3OOiqMn_cGh2ZLLikM5swpo.b9USlzFyWUE") : __rmT("KjqIO_tcBR8vpmRI3ba_yAwIi4hmVP6Fl6a6uJ5MAwqkosmkGk_kG15X"));
        }
        catch {
            if (button.isConnected)
                $('#rh_early_body_status').text(__rmT("tHEeBhwVZroj6l4P3f0Ch6heMgRNoroQbcbyKmBV_6r.bh"));
        }
        finally {
            if (button.isConnected)
                button.disabled = false;
        }
    });
    const renderIndependentConnectionStatus = () => {
        const currentSettings = getSettings();
        const currentId = String(currentSettings.independentConnectionProfileId || '').trim();
        const actualModel = String(currentSettings.independentApiModel || '').trim();
        const profile = getIndependentConnectionProfiles().find(item => item.id === currentId);
        const target = $('#rh_independent_connection_status');
        if (!currentId) {
            target.text(`${__rmT("iGaUp5Oxi..Df6GQEGaO2Q9cwwPEyIUf6.pUikrGr3x5X49x")}${actualModel || __rmT("YFbAF5qI1GE")}`);
            return;
        }
        if (!profile) {
            target.text(__rmT("..ZltfHV7KORzhU3ElMQUu1sjpFfvl9QEeyI1ul8"));
            return;
        }
        const profileDefault = String(profile.model || '').trim();
        const defaultHint = profileDefault && profileDefault !== actualModel ? `${__rmT("hmH2T7pQTweHGDdjEZtnlIeGjDHO1TbY")}${profileDefault}${__rmT("eXs")}` : '';
        target.text(`${__rmT("FzGpcsdgd9IStf")}${profile.name}${__rmT("OvGgS01FSoj7SZ74R.nWFfty")}${actualModel || profileDefault || __rmT("YFbAFcsQ2Ph")}${defaultHint}`);
    };
    renderIndependentConnectionStatus();
    checked('#rh_independent_read_global_world_info', settings.independentReadGlobalWorldInfo === true);
    checked('#rh_independent_include_character_summary', settings.independentReadCharacterCardSummary !== false);
    checked('#rh_independent_include_persona_summary', settings.independentReadPersonaSummary !== false);
    installWorldInfoBookVisibilityObserver();
    const syncGenerationModeFields = () => {
        const current = getSettings();
        const independent = current.generationSource === 'independent';
        const timing = independentGenerationTiming(current);
        const timingDescriptions = {
            auto: __rmT("l8AkcPPRZ7nNIy_E_dV_N_y_Nu2tSFuKHoVsGDYp8KQNapousgBBlKmP4vEp7OaJbpS43oNWx.HWzlH9"),
            manual: __rmT("Z8aupPkNvcTVJTTmeTWJF8zB3XcZBc0.Btqx56OpJlX31XWSoi9ikSMzdYNlyy1QCjFkvoQS.G4P61.cOTFkGpVJDwH884YO"),
            off: __rmT("Tq1iyNnW8ErPH7aIPi1vsyAR68tqHScn5XhSPhUUlTOwwy13NnDFLmCXL8MS8EVTHy0lnx7JY3Y"),
        };
        $('#rh_independent_generation_timing').val(timing);
        $('#rh_independent_generation_timing_row').prop('hidden', !independent);
        $('#rh_independent_generation_timing_hint').text(timingDescriptions[timing]);
        $('#rh_enabled').prop('checked', current.autoRabbitMirrorInjection !== false && current.enabled !== false);
        $('#rh_enabled').closest('.rabbit-mirror-primary-row').prop('hidden', independent);
        $('#rh_independent_api_fields').show();
        $('#rh_follow_display_row').toggle(!independent);
        $('#rh_independent_mode_status').text(independent
            ? `${__rmT("l24VhktTL32l_y4u5m4_Lk")}${{ auto: __rmT("GAHaACWEU6h"), manual: __rmT("k9UaACWEU6h"), off: __rmT("t8hHPh") }[timing]}${__rmT("jzk")}${timingDescriptions[timing]}` : `${__rmT("_9PW6eBc8ad9RxI3sRqwGG6lqd4CuXIilhJFM67aTqy2i_96uE8")}${current.followTagIsolationEnabled === true ? __rmT("4R6v0cDw") : __rmT("cynv0cDw")}${__rmT("FZaopgXxss9ux.VPLKKY454dOfYr8S3Aj7_zYkML3ZoLAzQX")}`);
        renderMissingShellReport();
    };
    function renderMissingShellReport() {
        const target = document.getElementById('rh_missing_shell_report');
        if (!target)
            return;
        try {
            target.textContent = listMissingIndependentRetryFloors({ manual: true }).text;
        }
        catch {
            target.textContent = __rmT("ntvm1_rB9meH9uRMyiRPe59Q8WZ7n.ixKfLspf");
        }
    }
    syncGenerationModeFields();
    mountBackfillControls({
        list: () => listMissingIndependentRetryFloors({ manual: true }),
        afterList: listed => {
            try {
                resyncMissingIndependentRetryShells();
            }
            catch { }
            const target = document.getElementById('rh_missing_shell_report');
            if (target && listed?.text)
                target.textContent = listed.text;
        },
        prepare: (floor, chat, opts) => prepareIndependentBackfillFloor(floor, { chat, token: opts?.token, keepGoing: opts?.keepGoing }),
        generate: (floor, chat, token) => backfillIndependentFloor(floor, { chat, token }),
        floorToken: floor => independentBackfillFloorToken(floor),
        busy: () => independentBackfillBusy(),
        chatKey: () => independentBackfillChatKey(),
        faceCount: () => getSettings().rabbitMirrorFaceCount,
        available: () => {
            const current = getSettings();
            if (current.generationSource !== 'independent')
                return { ok: false, message: __rmT("7.VLMXc8lEJkhI4N75_ZGHgV675GiowSieLO8oJdwOP9jDd4BPkWleL8.8e3WZCsRpHgoA17uU1OOPmIHxY84a.5KLp23X7BGZSOzqXIYBRh2LaqRpl41RooHo3C1zgMvDyfMbFX1FT") };
            if (current.enabled === false || current.autoRabbitMirrorInjection === false || independentGenerationTiming(current) === 'off')
                return { ok: false, message: __rmT(".WUSDcO68P_15d8aJb2hwkJZHxk1PN83nPMuXu1m0rrTrqZ1wKkVpWmdPymyl9I8RARukjofhSFWbWB7uvGE.uHsWAT") };
            return { ok: true };
        },
    });
    renderIndependentApiDiagnostic();
    attachIndependentApiDiagnosticListener();
    attachWorldInfoBooksListener();
    try {
        globalThis.__rabbitMirrorBlacklistUiCleanup?.();
    }
    catch { }
    const blacklistListener = event => { checked('#rh_blacklist_enabled', getSettings().blacklistEnabled !== false); if (event?.detail?.action === 'enabled')
        scheduleSettingsToolsRefresh(); if (document.getElementById('rh_random_preference_section')?.open) {
        renderBlacklistSettings();
        renderFavoriteSettings();
        void renderTheaterFavoriteSettings();
    } };
    const theaterFavoriteListener = event => { void renderTheaterFavoriteSettings(event?.detail?.rows); };
    globalThis.addEventListener?.(BLACKLIST_CHANGED_EVENT, blacklistListener);
    document.addEventListener(THEATER_FAVORITES_CHANGED_EVENT, theaterFavoriteListener);
    globalThis.__rabbitMirrorBlacklistUiCleanup = () => {
        globalThis.removeEventListener?.(BLACKLIST_CHANGED_EVENT, blacklistListener);
        document.removeEventListener(THEATER_FAVORITES_CHANGED_EVENT, theaterFavoriteListener);
    };
    checked('#rh_feedback_cat', settings.feedbackCatEnabled);
    checked('#rh_strip_old_mirrors', settings.stripOldMirrorsBeforeSend !== false);
    checked('#rh_maintenance_rabbit', settings.maintenanceRabbitEnabled);
    checked('#rh_maintenance_auto_safe', settings.maintenanceRabbitAutoSafeEnabled === true && settings.maintenanceRabbitAutoSafeConsent === true);
    $('#rh_sampling_mode').val(settings.samplingMode || 'classic');
    $('#rh_single_pair_sampling').prop('checked', settings.singlePairSampling === true);
    $('#rh_raw_policy').val(settings.rawPolicy || 'balanced');
    checked('#rh_user_directive', settings.userDirectivePriority);
    checked('#rh_worldview_lock', settings.presentationWorldviewLock === true);
    checked('#rh_creative_expansion', settings.creativeExpansionMode);
    const visualSceneryMode = settings.visualSceneryCombination ? 'combined' : settings.forceVisualScenery ? 'scenery' : 'ordinary';
    $(`input[name="rh_visual_scenery_mode"][value="${visualSceneryMode}"]`).prop('checked', true);
    checked('#rh_image_enabled', settings.imageEnabled);
    checked('#rh_builtin_image', settings.builtinImageEnabled === true);
    checked('#rh_material_texture', settings.materialTextureEnabled === true);
    checked('#rh_web_fonts', settings.webFontsEnabled !== false);
    checked('#rh_collection_taste', settings.collectionTasteEnabled !== false);
    $('#rh_image_backend').val(settings.imageBackend === 'chatu8' ? 'chatu8' : 'baibai');
    renderImageBackendStatus(settings);
    checked('#rh_image_llm_enabled', settings.imageLlmEnabled === true);
    $('#rh_image_llm_base').val(settings.imageLlmBaseUrl || '');
    $('#rh_image_llm_key').val(settings.imageLlmKey || '');
    $('#rh_image_llm_model').val(settings.imageLlmModel || '');
    $('#rh_image_llm_temperature').val(settings.imageLlmTemperature ?? 0.8);
    $('#rh_image_llm_max_tokens').val(settings.imageLlmMaxTokens ?? 4096);
    $('#rh_image_llm_status').text(imageLlmStatusText(settings));
    renderImageLlmProfiles(settings);
    $('#rh_image_prompt_format').val(settings.imagePromptFormat);
    $('#rh_visual_tone_mode').val(settings.visualToneMode || (settings.darkVisualMode === true ? 'dark' : 'normal'));
    checked('#rh_blacklist_enabled', settings.blacklistEnabled !== false);
    checked('#rh_memory_scan_enabled', settings.memoryScanEnabled);
    renderMemoryWorldBookBinding();
    checked('#rh_multiface_enabled', settings.rabbitMirrorFaceCount > 1);
    $('#rh_multiface_count').val(String(settings.rabbitMirrorFaceCount > 1 ? settings.rabbitMirrorFaceCount : 2));
    $('#rh_multiface_count_row').prop('hidden', settings.rabbitMirrorFaceCount <= 1);
    $('#rh_multiface_count').prop('disabled', settings.rabbitMirrorFaceCount <= 1);
    $('#rh_multiface_dispatch_row').prop('hidden', settings.rabbitMirrorFaceCount <= 1);
    $(`input[name="rh_multiface_dispatch"][value="${settings.multifaceDispatch === 'serial' ? 'serial' : 'single'}"]`).prop('checked', true);
    $(`input[name="rh_lottery_method"][value="${settings.lotteryMethod === 'atmosphere' ? 'atmosphere' : 'random'}"]`).prop('checked', true);
    $('#rh_atmosphere_percent_row').prop('hidden', settings.lotteryMethod !== 'atmosphere');
    $('#rh_atmosphere_story_percent').val(String(Math.max(0, Math.min(100, Math.round(Number(settings.atmosphereStoryPercent) || 0)))));
    $('#rh_atmosphere_story_percent_value').text(String(Math.max(0, Math.min(100, Math.round(Number(settings.atmosphereStoryPercent) || 0)))));
    renderFacePresentationSettings(settings);
    checked('#rh_visual_prompt_enabled', settings.visualPromptEditingEnabled);
    $('#rh_visual_prompt').val(settings.visualPrompt ?? DEFAULT_VISUAL_PROMPT);
    $('#rh_visual_extra_prompt').val(settings.visualExtraPrompt || '');
    $('#rh_visual_avoid_prompt').val(settings.visualAvoidPrompt || '');
    renderVisualPromptStatus(settings);
    let appearanceFileSequence = 0;
    let appearanceSaving = false;
    $('#rh_behavior_rule_mode').val(settings.behaviorRuleMode || 'always');
    $('#rh_behavior_rule_text').val(resolveBehaviorRuleText(settings));
    $('#rh_writing_style').val(settings.writingStyle || '');
    $('#rh_writing_style_save').on('click', () => {
        updateSettings({ writingStyle: String($('#rh_writing_style').val() ?? '') });
        refreshRabbitMirrorGenerationMode();
        $('#rh_writing_style_status').text(__rmT("CEJDvSs0Au3J0WFEaE2A4FowzS3WFu5_HZkPTnzMgG8"));
    });
    $('#rh_writing_style_clear').on('click', () => {
        $('#rh_writing_style').val('');
        updateSettings({ writingStyle: '' });
        refreshRabbitMirrorGenerationMode();
        $('#rh_writing_style_status').text(__rmT("4r4VLuVY9Q.caixGfWzdYwfsLei_87s2"));
    });
    $('#rh_animation_idle_pause').val(settings.animationIdlePause || 'auto').on('change', e => {
        updateSettings({ animationIdlePause: e.target.value });
        refreshMirrorAnimationIdlePause();
    });
    $('#rh_desktop_face_zoom').prop('checked', settings.desktopFaceZoom !== false).on('change', e => {
        updateSettings({ desktopFaceZoom: e.target.checked === true });
        void import('./desktopFaceZoom.js?rmv=1.100.0').then(module => module.refreshDesktopFaceZoom()).catch(() => { });
    });
    $('#rh_face_pager_position').val(settings.facePagerPosition || 'top').on('change', e => {
        updateSettings({ facePagerPosition: e.target.value });
        refreshFacePagerPositions(document, getSettings().facePagerPosition);
    });
    $('#rh_image_composition').val(settings.imageCompositionMode || 'scene').on('change', e => updateSettings({ imageCompositionMode: e.target.value }));
    for (const [id, key] of [['#rh_image_looks_library', 'imageLooksLibrary'], ['#rh_image_looks_card', 'imageLooksCard'], ['#rh_image_looks_myriad', 'imageLooksMyriad'], ['#rh_image_looks_world_book', 'imageLooksWorldBook'], ['#rh_image_looks_model', 'imageLooksModel']]) {
        $(id).prop('checked', settings[key] !== false).on('change', e => updateSettings({ [key]: e.target.checked === true }));
    }
    $('#rh_character_world_book').prop('checked', settings.independentReadCharacterWorldBook === true).on('change', e => updateSettings({ independentReadCharacterWorldBook: e.target.checked === true }));
    $('#rh_behavior_rule_status').text(settings.behaviorRuleMode === 'off' ? __rmT("I9NjY5.3vjQw89UVdjx8HE1786onjJOB6cYR6o22mAX.bh") : settings.behaviorRuleMode === 'adult-only' ? __rmT("MpaRyDDoK_zMBJ4wjpuBTq7R7TAd2rJIIKk.eAx5hNdAnh8gydNaZMSFB.A9uT") : __rmT("IAMVEJ3GWXo55sHhXinfQrvHOAR0M7S9KwlBNd1FZmSpuu45LvaAPq5X"));
    $('#rh_behavior_rule_mode').on('change', () => {
        const mode = String($('#rh_behavior_rule_mode').val());
        updateSettings({ behaviorRuleMode: mode });
        refreshRabbitMirrorGenerationMode();
        $('#rh_behavior_rule_status').text(mode === 'off' ? __rmT("RNsNPbYZUiUYuMl.yjjWMzUVNJ02_tFNsDfBjFuVhjRBJqaFB9wI3XeotHUy7zkC") : __rmT("QUyY1fqhi_sQGFx2KDG0f1GaVHk9Hxi1e_5nCko9QTdDSPbDDz4S_LGcW2fpcgKwY5Q7UzXYY3Y"));
    });
    $('#rh_behavior_rule_save').on('click', () => {
        updateSettings({ behaviorRuleText: String($('#rh_behavior_rule_text').val() ?? '') });
        refreshRabbitMirrorGenerationMode();
        $('#rh_behavior_rule_status').text(__rmT("f9tfHXPN7cWz_9Z_KqLzJeMrzaCeePowlwnjo0x_2f_lyyx7mNyffpcI8FhaLSkC"));
    });
    $('#rh_behavior_rule_clear').on('click', () => {
        $('#rh_behavior_rule_text').val('');
        updateSettings({ behaviorRuleText: '' });
        refreshRabbitMirrorGenerationMode();
        $('#rh_behavior_rule_status').text(__rmT("r8m.gFvpNoNtsMCTVSkQfLyHn8ffyvv42IDJPo3two3IKzQX"));
    });
    $('#rh_behavior_rule_reset').on('click', () => {
        $('#rh_behavior_rule_text').val(DEFAULT_BEHAVIOR_RULE_TEXT);
        updateSettings({ behaviorRuleText: null });
        refreshRabbitMirrorGenerationMode();
        $('#rh_behavior_rule_status').text(__rmT("tGp5SBOjeXfx88LKdg.P1rFAtR1MUbq6gft9xIHQ2Yb4Dk6QIh_r7f"));
    });
    const appearanceUIOwner = document.getElementById('rh_appearance_reference');
    const appearanceRawInput = document.getElementById('rh_appearance_reference_input');
    const appearanceFileInput = document.getElementById('rh_appearance_reference_file');
    const appearanceOwnerIsCurrent = () => isCurrentRuntime() && appearanceUIOwner?.isConnected === true && document.getElementById('rh_appearance_reference') === appearanceUIOwner;
    const appearanceStatus = message => { if (appearanceOwnerIsCurrent())
        $('#rh_appearance_reference_status').text(message); };
    let appearanceRecoveryRevision = '';
    const showAppearanceRecovery = (error, revision) => {
        if (!appearanceOwnerIsCurrent() || getSettings().appearanceReferenceRevision !== revision)
            return;
        const code = String(error?.code || '');
        if (!['RABBIT_MIRROR_APPEARANCE_RETAIN_MISSING', 'RABBIT_MIRROR_APPEARANCE_MISSING'].includes(code))
            return;
        appearanceRecoveryRevision = revision;
        $('#rh_appearance_reference_unlink').prop('hidden', false);
        appearanceStatus(__rmT("4AVd9irjt28FtLKi0zmjLRuCtfDFxuxjwimKDFmtO_rAUTrj7M7vtuoQrmsSmcqK2VDrqDNq9V5YUeAFhaVFZn5B6KVttDEWc07wX0seqYpFlPUtkIKQWU11gNKp4y4wA0df_6NS1MnGYyAToJ_xQAgOZxY"));
    };
    const renderAppearanceState = () => {
        const current = getSettings();
        checked('#rh_appearance_reference_enabled', current.appearanceReferenceEnabled === true);
        appearanceStatus(current.appearanceReferenceEnabled
            ? __rmT("5RThcXsohAS2gqQL3XQL8h1QbrnpNylwKPZ5E6q_1X8FmEmN9cgo.ubb4v5.6ei9rM7_9SrvQZVmJ52LV8jXyv2OeeIUyYKIhPjuApw9") : __rmT("trJz1eCfPrmCScVaLPfSsYm5v8AsSM72ZvUuHhBNgkf9Gia0ehi8Lx8QK8cUcnyGO4R3S13xY3Y"));
    };
    const clearAppearanceInput = () => {
        appearanceFileSequence += 1;
        if (appearanceRawInput)
            appearanceRawInput.value = '';
        if (appearanceFileInput)
            appearanceFileInput.value = '';
    };
    renderAppearanceState();
    $('#rh_appearance_reference').on('toggle', async () => {
        if (!appearanceUIOwner?.open || !appearanceOwnerIsCurrent() || appearanceSaving)
            return;
        const revision = String(getSettings().appearanceReferenceRevision || '');
        if (!revision)
            return;
        const sequence = appearanceFileSequence;
        try {
            const module = await import('./appearanceReference.js?rmv=1.100.0');
            if (!appearanceOwnerIsCurrent() || !appearanceUIOwner.open || sequence !== appearanceFileSequence || appearanceSaving)
                return;
            await module.loadAppearanceReferenceMaterial(revision);
            if (!appearanceOwnerIsCurrent() || !appearanceUIOwner.open || sequence !== appearanceFileSequence || appearanceSaving || getSettings().appearanceReferenceRevision !== revision)
                return;
            appearanceRecoveryRevision = '';
            $('#rh_appearance_reference_unlink').prop('hidden', true);
        }
        catch (error) {
            if (!appearanceSaving && sequence === appearanceFileSequence && appearanceUIOwner?.open)
                showAppearanceRecovery(error, revision);
        }
    });
    $('#rh_appearance_reference_unlink').on('click', () => {
        if (!appearanceOwnerIsCurrent() || appearanceSaving || !appearanceRecoveryRevision || getSettings().appearanceReferenceRevision !== appearanceRecoveryRevision)
            return;
        if (!globalThis.confirm(__rmT("7y7XZDSWS7Uea.oz7NSeLlGFnHF5JeP1CcYDKi4Dj5FTQsR61olgSabQoHpQelmzZKT6IgTfK3pr1rK5_BLey0DzE0kKOAjXqkdMgOL4O3Z2c8BkxGsX3h")))
            return;
        updateSettings({ appearanceReferenceEnabled: false, appearanceReferenceRevision: '' });
        appearanceRecoveryRevision = '';
        $('#rh_appearance_reference_unlink').prop('hidden', true);
        renderAppearanceState();
        appearanceStatus(__rmT("hTYyG1YUdtqP6f_3owDqDyjbjWJhXfJzrDxHF_nrqWmSQ6rzUZaTl9fgZbYAGFLoP_Vy3RS1Aau5sVWgKuucsJPOHTM3__niANA"));
    });
    $('#rh_appearance_reference_enabled').on('change', e => {
        if (e.target.checked && !getSettings().appearanceReferenceRevision) {
            e.target.checked = false;
            appearanceStatus(__rmT("1Udhp4N3voEC8STCfGfpfeyGEcxM8D.BE_no5lMeVXgfaSQX"));
            return;
        }
        updateSettings({ appearanceReferenceEnabled: e.target.checked === true });
        renderAppearanceState();
    });
    $('#rh_appearance_reference_file').on('change', async (e) => {
        const file = e.target.files?.[0];
        const sequence = ++appearanceFileSequence;
        if (!file)
            return;
        if (!/\.(?:html?|txt)$/i.test(file.name) || file.size > 128 * 1024) {
            clearAppearanceInput();
            appearanceStatus(__rmT("vfGrpv8QUtWf6gMjeMTQ2_OzC0oqRXeKDnmaMOd9L_ENb.XXb.iDZ0F3kA.suW556EhR5B5HCjmuQgmmrYH6QTb7BDhCcZOAN6RgXAw9"));
            return;
        }
        appearanceStatus(__rmT("vAJ7QgD_UQGiySVC155ttPam7x74onL7KKSngz41MGQXWCil99L4_1BwzBG"));
        try {
            const text = await file.text();
            if (sequence !== appearanceFileSequence || !appearanceOwnerIsCurrent())
                return;
            $('#rh_appearance_reference_input').val(text);
            appearanceStatus(__rmT("3Z6n9KiLViGZBZTC6fAqex2wjOalnCTXn9L3Zbl.3xrRN_ZW91C9gctKVE1PidpLav1gIuGP"));
        }
        catch {
            if (sequence === appearanceFileSequence)
                appearanceStatus(__rmT("Bi8qDZKIRySy4OaQ8cfNyLsfY850gozhH9RCqwKq"));
        }
    });
    $('#rh_appearance_reference_save').on('click', async () => {
        if (appearanceSaving || !appearanceOwnerIsCurrent())
            return;
        appearanceSaving = true;
        $('#rh_appearance_reference_save, #rh_appearance_reference_input, #rh_appearance_reference_file').prop('disabled', true);
        appearanceStatus(__rmT("3ExiIfA3aGi20OPzCt8Etxyrtlvvt2PuQtHE6c6mzH8"));
        const retainRevision = String(getSettings().appearanceReferenceRevision || '');
        let raw = String($('#rh_appearance_reference_input').val() || '');
        try {
            const module = await import('./appearanceReference.js?rmv=1.100.0');
            if (!appearanceOwnerIsCurrent())
                return;
            if (String(getSettings().appearanceReferenceRevision || '') !== retainRevision) {
                appearanceStatus(__rmT("UBC1vFiuZqxS8Hy.cT.FvW7jFGtyDAktLo.6EX8aMsoLrrCbTncUcODUUYl86lBihbwI1VNi2prmzlLBMRxXVuOUJAJQhs5u7R4BeNS0GgKHBafABJT"));
                return;
            }
            const saved = await module.saveAppearanceReference(raw, { retainRevision });
            if (!appearanceOwnerIsCurrent())
                return;
            if (String(getSettings().appearanceReferenceRevision || '') !== retainRevision) {
                appearanceStatus(__rmT("fmCyd7u0vsIU4SvAWWwwXj1Y981tQoGeq8tmak1wkkSNgl031VQ.USs8JFXMokn1ntYFX5DzQT31E3vas2Li28sQGT1Zwd4T7xLFrSKhS24xXgBxSBk0if"));
                return;
            }
            updateSettings({ appearanceReferenceRevision: saved.revision });
            appearanceRecoveryRevision = '';
            $('#rh_appearance_reference_unlink').prop('hidden', true);
            appearanceStatus(`${__rmT("iFB45T6zHKG")}${saved.nodeCount}${__rmT("7ac8YOzP3hML4R3g48D")}${saved.ruleCount}${__rmT("wRYXwV2JaSmSSqKKrAp385Cx")}${saved.chars}${__rmT("6RTrE9Rc0YGJy8oQ3Pi7VwoaKyfnRM6pTnVbjGNuceCT1h2HHz8r7f")}${getSettings().appearanceReferenceEnabled ? __rmT("QPzMpZ4IzytoIif1") : __rmT("7whgkIkTb8Wmf1FEXKEIpFFx2iNJA_5BSif28Vz9gG8")}`);
        }
        catch (error) {
            appearanceStatus(`${String(error?.code || '').startsWith('RABBIT_MIRROR_APPEARANCE_') ? error.message : __rmT("jGu_LA4D9Ob6nnFAQi3QtxEI")}${__rmT("wHDFSEumqYtMKm_wMnNsSTn.bNs")}`);
            showAppearanceRecovery(error, retainRevision);
        }
        finally {
            raw = '';
            clearAppearanceInput();
            appearanceSaving = false;
            if (appearanceOwnerIsCurrent())
                $('#rh_appearance_reference_save, #rh_appearance_reference_input, #rh_appearance_reference_file').prop('disabled', false);
        }
    });
    const showAdvancedMenu = () => {
        $('.rh-advanced-page').hide();
        $('#rh_advanced_menu').css('display', 'grid');
        $('#rh_advanced_back_top').hide();
        $('#rh_advanced_modal_title').text(__rmT("CeVFmihZMNY"));
        $('#rh_advanced_modal_hint').text(__rmT("NqKOEyAPoUPFVnZwmahGAf"));
        const scroll = document.getElementById('rh_advanced_scroll');
        if (scroll)
            scroll.scrollTop = 0;
    };
    const setAdvancedOpen = open => {
        const modal = $('#rh_advanced_modal');
        modal.attr('aria-hidden', open ? 'false' : 'true');
        modal.css('display', open ? 'flex' : 'none');
    };
    const closeAdvancedModal = () => {
        clearAppearanceInput();
        setAdvancedOpen(false);
        showAdvancedMenu();
    };
    $('#rh_advanced_open').on('click', () => {
        showAdvancedMenu();
        setAdvancedOpen(true);
    });
    $('#rh_advanced_close').on('click', closeAdvancedModal);
    $('#rh_advanced_back_top').on('click', showAdvancedMenu);
    $('#rh_advanced_modal').on('click', function (event) {
        if (event.target === this)
            closeAdvancedModal();
    });
    const showAdvancedPage = page => {
        const target = $(`#rh_advanced_page_${page}`);
        if (!target.length)
            return false;
        $('#rh_advanced_menu').hide();
        $('.rh-advanced-page').hide();
        target.show();
        $('#rh_advanced_back_top').show();
        $('#rh_advanced_modal_title').text(String(target.data('title') || __rmT("CeVFmihZMNY")));
        $('#rh_advanced_modal_hint').text(__rmT("IFq7QyS9V.wR6mhlqUB3jNZHme6yR83VwIkmnevxJRnWadhP"));
        const scroll = document.getElementById('rh_advanced_scroll');
        if (scroll)
            scroll.scrollTop = 0;
        if (page === 'worldinfo')
            renderWorldInfoBookSettings({ current: true, all: false });
        return true;
    };
    $('.rh-advanced-choice').on('click', function () {
        showAdvancedPage(String($(this).data('page') || ''));
    });
    $('#rh_independent_advanced_open').on('click', () => {
        showAdvancedMenu();
        setAdvancedOpen(true);
        showAdvancedPage('worldinfo');
    });
    const quickStart = document.getElementById('rh_quick_start');
    let guideLoading = false;
    let guideCleanup = null;
    let guideDisposed = false;
    const loadQuickStart = async () => {
        if (!quickStart.open || guideLoading || guideCleanup || guideDisposed)
            return;
        guideLoading = true;
        try {
            const module = await import('./quickStart.js?rmv=1.100.0');
            if (guideDisposed || !quickStart.isConnected || !isCurrentRuntime())
                return;
            guideCleanup = module.mountRabbitMirrorQuickStart({
                root: document.getElementById('rabbit_mirror_theater_settings'),
                openAdvanced: page => { showAdvancedMenu(); setAdvancedOpen(true); showAdvancedPage(page); },
                closeAdvanced: closeAdvancedModal,
            });
        }
        catch {
            if (!guideDisposed && quickStart.isConnected)
                quickStart.querySelector('.rabbit-mirror-quick-start-body').textContent = __rmT("TQVsGFPO21yTnhhx7gZVdJU4Y8RKPwroFQPRdElSI3K1lcJKSBLcBE34WQCm7zkC");
        }
        finally {
            guideLoading = false;
        }
    };
    quickStart.addEventListener('toggle', loadQuickStart);
    globalThis.__rabbitMirrorQuickStartUiCleanup = () => {
        guideDisposed = true;
        quickStart.removeEventListener('toggle', loadQuickStart);
        guideCleanup?.();
    };
    const setWorldInfoPromptOpen = open => {
        const modal = $('#rh_world_info_prompt_modal');
        modal.attr('aria-hidden', open ? 'false' : 'true');
        modal.css('display', open ? 'flex' : 'none');
    };
    const applyIndependentWorldInfoChoice = enabled => {
        updateSettings({ independentReadGlobalWorldInfo: enabled === true });
        checked('#rh_independent_read_global_world_info', enabled === true);
        setWorldInfoPromptOpen(false);
        toastr?.info?.(enabled ? __rmT("uL75Hz6eOodsRXiPtALaG1tYJlyONILN1mmscd1vJs_zpSF77Xgrs6QuxHd4VaX6WUE") : __rmT("X6q4KnaeoxYxl8tVjPKej6DBEasweCFy_HAeScLcRzmkvFRBSIb29ljFvmflCxWjjIt4GVX8nrvkwYHyhV85K541YsQG6xzxbWVWj5DVp1we0i_z"));
    };
    $('#rh_world_info_prompt_enable').on('click', () => applyIndependentWorldInfoChoice(true));
    $('#rh_world_info_prompt_disable').on('click', () => applyIndependentWorldInfoChoice(false));
    $('#rh_world_info_prompt_close').on('click', () => setWorldInfoPromptOpen(false));
    $('#rh_world_info_prompt_modal').on('click', function (event) { if (event.target === this)
        setWorldInfoPromptOpen(false); });
    $('#rh_independent_tag_filter_open').on('click', () => setTagFilterOpen(true));
    $('#rh_independent_tag_filter_close, #rh_independent_tag_filter_cancel').on('click', () => setTagFilterOpen(false));
    $('#rh_independent_tag_filter_modal').on('click', function (event) { if (event.target === this)
        setTagFilterOpen(false); });
    $('#rh_independent_tag_filter_list').on('change', '[data-rh-context-tag]', function () {
        const tag = String($(this).attr('data-rh-context-tag') || '');
        if (!tag)
            return;
        if (this.checked && !tagFilterDraft.has(tag) && tagFilterDraft.size >= INDEPENDENT_CONTEXT_EXCLUDED_TAG_MAX_COUNT) {
            this.checked = false;
            $('#rh_independent_tag_filter_error').text(`${__rmT("uTHD7Zdr4XWnkBHegPD")}${INDEPENDENT_CONTEXT_EXCLUDED_TAG_MAX_COUNT}${__rmT("Uqe0vxIEf2OMsh")}`);
            return;
        }
        if (this.checked)
            tagFilterDraft.add(tag);
        else
            tagFilterDraft.delete(tag);
        $('#rh_independent_tag_filter_error').text('');
    });
    $('#rh_independent_tag_filter_list').on('click', '[data-rh-remove-context-tag]', function () {
        tagFilterDraft.delete(String($(this).attr('data-rh-remove-context-tag') || ''));
        renderTagFilterDraft();
    });
    const addTagFilterDraft = () => {
        const raw = String($('#rh_independent_tag_filter_input').val() || '').trim();
        const normalized = normalizeIndependentContextExcludedTags([raw]);
        if (!normalized.length) {
            $('#rh_independent_tag_filter_error').text(__rmT("O.RXHWnSpb85ghtc3KOiKtgbxpZtvvUjvGB3co6XvW70mqWO_hee4CHGGoxj3Bgl1ZrdQUZERqPk_LN3NQOb6ynBvofDoopeANA"));
            return;
        }
        if (!tagFilterDraft.has(normalized[0]) && tagFilterDraft.size >= INDEPENDENT_CONTEXT_EXCLUDED_TAG_MAX_COUNT) {
            $('#rh_independent_tag_filter_error').text(`${__rmT("uTHD7Zdr4XWnkBHegPD")}${INDEPENDENT_CONTEXT_EXCLUDED_TAG_MAX_COUNT}${__rmT("Uqe0vxIEf2OMsh")}`);
            return;
        }
        tagFilterDraft.add(normalized[0]);
        $('#rh_independent_tag_filter_input').val('');
        $('#rh_independent_tag_filter_error').text('');
        renderTagFilterDraft();
    };
    $('#rh_independent_tag_filter_add').on('click', addTagFilterDraft);
    $('#rh_independent_tag_filter_input').on('keydown', event => {
        if (event.key !== 'Enter')
            return;
        event.preventDefault();
        addTagFilterDraft();
    });
    $('#rh_independent_tag_filter_scan').on('click', async () => {
        cancelTagFilterScan();
        const controller = new AbortController();
        tagFilterScanController = controller;
        const epoch = ++tagFilterScanEpoch;
        $('#rh_independent_tag_filter_scan').prop('disabled', true).text(__rmT("cIFOAWxdsJIo8h"));
        $('#rh_independent_tag_filter_save').prop('disabled', true);
        $('#rh_independent_tag_filter_scan_status').text(__rmT("a1WGtuM5Zo5Fe3gitAEVs8Z4MTe.N0ZaNT.VYX7SQExUDVIVW4ejTSyXhyCy3T"));
        $('#rh_independent_tag_filter_error').text('');
        try {
            const result = await scanCurrentChatIndependentContextTags({ signal: controller.signal });
            if (epoch !== tagFilterScanEpoch || $('#rh_independent_tag_filter_modal').attr('aria-hidden') !== 'false')
                return;
            tagFilterDetected = new Map((result?.tags || [])
                .map(item => [String(item?.name || ''), Number(item?.count || 0)])
                .filter(([name, count]) => name && count > 0));
            renderTagFilterDraft();
            const total = [...tagFilterDetected.values()].reduce((sum, count) => sum + count, 0);
            const base = result?.available === false
                ? __rmT("VwH5IpADWKMrm83wr0h29vyA9qSvij4J29E") : (tagFilterDetected.size
                ? `${__rmT("D9C78a2gHKG")}${tagFilterDetected.size}${__rmT("qGlm9jxg")}${total}${__rmT("xBwPDnFgoy4arnKEO.zoUjTPi6hJgrJeBunV1tKq")}` : __rmT("Xq2ADfljNF4TkgVOF3uNrvpU_k2D_irFb.kwGQ4N6UvyYkVBPal4bb8NzBG"));
            $('#rh_independent_tag_filter_scan_status').text(`${base}${result?.truncated ? __rmT("3bCGjQs.Kr8ycN7VSlqN27IONQJgn_QN986R62btAUX.bh") : ''}`);
        }
        catch (error) {
            if (epoch !== tagFilterScanEpoch || controller.signal.aborted)
                return;
            $('#rh_independent_tag_filter_scan_status').text(error?.name === 'AbortError' ? String(error?.message || __rmT("8rbpGHVYoMN15oxGJ9O6GBYR6qBJKxs2")) : __rmT("7s9ulK7D2Qs0WuV0D_DPbzTjZe0rrk"));
        }
        finally {
            if (epoch === tagFilterScanEpoch) {
                tagFilterScanController = null;
                $('#rh_independent_tag_filter_scan').prop('disabled', false).text(__rmT("zBc1EnmKRDn1sQdkhuS8qk"));
                $('#rh_independent_tag_filter_save').prop('disabled', false);
            }
        }
    });
    $('#rh_independent_tag_filter_save').on('click', () => {
        const selectedTags = normalizeIndependentContextExcludedTags([...tagFilterDraft]);
        updateSettings({ independentContextExcludedTags: selectedTags });
        renderTagFilterSummary();
        setTagFilterOpen(false);
        toastr?.success?.(__rmT("Vep3qTnYEzY0dNwctS6wA2lmatfqUvYBiMpuCAW.J_rYBcjEBiZhLyL6XN2I.ceE_gnH01PZz8SClP7M5iG8xFtXUFHCdrbHpDkDAFN_nDMo.k"));
    });
    $('#rh_follow_tag_isolation').on('change', e => {
        const enabled = e.target.checked === true;
        updateSettings({ followTagIsolationEnabled: enabled });
        renderTagFilterSummary();
        syncGenerationModeFields();
        toastr?.info?.(enabled
            ? __rmT("InGoNJB9I90LMOnMF1K_KKqF_Qq1XundOCF8XZ1R7TTwI8Pok48NGl7UkiGyiv_sGsNQkUP2.4zAXlwtxmkFrh") : __rmT("InGoNJB9I90LMOnMF1swX7s8uFqUxenZHhIj3SL_jU3nCO13dfhk5XH_hi3X0.wKT5zQk0W9G51DDFPz20DFrh"));
    });
    checked('#rh_source_profiles', settings.sourceProfilesEnabled === true);
    $('#rh_source_profiles').on('change', e => {
        updateSettings({ sourceProfilesEnabled: e.target.checked === true });
        toastr?.info?.(e.target.checked ? __rmT("865f_XYjeVh9LGkAwYaQyzaupd.wZyfcgUUM_.FWSi6qloRHpuKsopH5F8Jn7vkC") : __rmT("_2oRLz1K.accAs7kjRLJ.Yw1ExyWLfeo081k6L5RPsL.bh"));
    });
    $('input[name="rh_generation_source"]').on('change', e => {
        const generationSource = e.target.value === 'independent' ? 'independent' : 'follow';
        const texturesBefore = getSettings().materialTextureEnabled === true;
        updateSettings({ generationSource });
        clearRabbitMirrorPrompt(generationSource === 'independent' ? 'independent-api' : 'mode-change');
        syncGenerationModeFields();
        if (getSettings().sourceProfilesEnabled === true) {
            renderSourceProfileControls(getSettings());
            if (texturesBefore !== (getSettings().materialTextureEnabled === true)) {
                void import('./materialTexture.js?rmv=1.100.0').then(module => {
                    const chat = document.getElementById('chat');
                    if (chat)
                        module.applyMaterialTextures(chat, undefined, { record: false });
                }).catch(() => { });
            }
        }
        refreshRabbitMirrorGenerationMode();
        renderTokenMeter();
        toastr?.info?.(generationSource === 'independent' ? __rmT("qwe7kG3v_c54pJaZ4gOCJgrrc3trrk") : __rmT(".mhFID81PtoaDLy2OhnZ0ACATvrIAPMw29E"));
        void refreshNoSendRegexStatus();
        if (generationSource === 'independent')
            setWorldInfoPromptOpen(true);
    });
    $('#rh_independent_generation_timing').on('change', e => {
        updateSettings({ independentGenerationTiming: e.target.value });
        clearRabbitMirrorPrompt('independent-api');
        syncGenerationModeFields();
        refreshRabbitMirrorGenerationMode();
        renderTokenMeter();
    });
    $('input[name="rh_follow_display"]').on('change', e => { updateSettings({ followDisplayMode: e.target.value === 'external' ? 'external' : 'inline' }); refreshRabbitMirrorGenerationMode(); });
    $('input[name="rh_independent_display"]').on('change', e => { updateSettings({ independentDisplayMode: e.target.value === 'external_then_inline' ? 'external_then_inline' : 'external' }); refreshRabbitMirrorGenerationMode(); });
    $('input[name="rh_independent_anchor"]').on('change', e => { updateSettings({ independentExternalAnchor: ['body', 'outside'].includes(e.target.value) ? e.target.value : 'auto' }); refreshRabbitMirrorGenerationMode(); });
    $('#rh_missing_shell_range').on('change', e => {
        updateSettings({ missingShellScanRange: e.target.value });
        const listed = resyncMissingIndependentRetryShells();
        const target = document.getElementById('rh_missing_shell_report');
        if (target)
            target.textContent = listed.text;
    });
    $('#rh_archive_inventory').on('click', async () => {
        const button = document.getElementById('rh_archive_inventory');
        if (button)
            button.disabled = true;
        try {
            const text = await buildRabbitMirrorArchiveInventory();
            const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = __rmT("qc72d0X_htejX8tmapq0Bx.GsIZKUrCP");
            link.rel = 'noopener';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            toastr?.info?.(__rmT("r8sbv9ZZVtBwlMCTo2_IBZvcPb9cQaQbXln6NENehoqxYzQX"));
        }
        catch (error) {
            toastr?.error?.(`${__rmT("xD8sEanlhzy12HHA6osQcfty")}${String(error?.message || error || '')}`);
        }
        finally {
            if (button)
                button.disabled = false;
        }
    });
    const repairSamplesNote = () => {
        const note = document.getElementById('rh_repair_samples_note');
        const button = document.getElementById('rh_repair_samples_export');
        void import('./outputSanitizer/repairSamples.js?rmv=1.100.0').then(module => {
            const count = module.countRepairSamples();
            if (button) {
                button.textContent = count ? `${__rmT("WP7vhXWKUFdMrQvXR8wyLk")}${count}${__rmT("qGyf7qZp")}` : __rmT("BEU_SpH10Bo08kB1LZMFy92p3dk");
                button.disabled = !count;
            }
            const clear = document.getElementById('rh_repair_samples_clear');
            if (clear)
                clear.disabled = !count;
            if (note && !count)
                note.textContent = __rmT("X9RjgRl8L.0_RLjPLUa6LaqrYiUEIAh5YVGJtBWy04LnztczU9gFMnw.aJWwPY0IoR8eU5WG02SCW3GZBd2v1Nofrs2jmnc5wadZL6HoIXvY_peemRQw_T4q0MRshITlX3jkbcLVTwIJ.TLwTEpA2VFL");
            else if (note)
                note.textContent = `${__rmT("4RFzLcc6")}${count}${__rmT("n9Yp2Zf97._uC1tzRWl6hj8bC4HPAx5kDBprCnyggwEIVlv5velgVKfqKTOvt21tavcHdcJOHH_h1pfFwh2n_XxQKc1egfyz3pZQ.ccI3s79yOcLIU9R53M_x3UKWCk805tDtMHtXNSzZh")}`;
        }).catch(() => { });
    };
    repairSamplesNote();
    try {
        globalThis.__rabbitMirrorRepairSamplesUiCleanup?.();
    }
    catch { }
    globalThis.addEventListener?.('rabbitmirror:repair-samples', repairSamplesNote);
    globalThis.__rabbitMirrorRepairSamplesUiCleanup = () => globalThis.removeEventListener?.('rabbitmirror:repair-samples', repairSamplesNote);
    $('#rh_repair_samples_export').on('click', async () => {
        try {
            const module = await import('./outputSanitizer/repairSamples.js?rmv=1.100.0');
            if (!module.countRepairSamples()) {
                toastr?.info?.(__rmT("YkeXoqJiqfKiKyHR4DD"));
                return;
            }
            const text = module.buildRepairSamplesExport();
            const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = __rmT("pb7i424xi6WEsTQz80y5i.OtPzrUAGXwrQE");
            link.rel = 'noopener';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            toastr?.info?.(__rmT("AMO3RrELTVggdp9tCfZgUomFnxi.dgAhYV2iZ82ffYH_debZq8_"));
        }
        catch (error) {
            toastr?.error?.(`${__rmT("eBoC.3quagHxJA9D8Fb_Lk")}${String(error?.message || error || '')}`);
        }
    });
    $('#rh_repair_samples_clear').on('click', async () => {
        if (!globalThis.confirm?.(__rmT("t84Um52cBKgAtS1JNAO_85d.Y0E7EorgoxesG4mhmmWp8ovySpm0IExOpho8eKdKrVeGE3vQSb75XlH9")))
            return;
        try {
            const module = await import('./outputSanitizer/repairSamples.js?rmv=1.100.0');
            module.clearRepairSamples();
            repairSamplesNote();
        }
        catch { }
    });
    $('#rh_missing_shell_rescan').on('click', () => {
        const listed = resyncMissingIndependentRetryShells();
        const target = document.getElementById('rh_missing_shell_report');
        if (target)
            target.textContent = listed.text;
        toastr?.info?.(listed.floors.length ? `${__rmT("4R8PPUc6")}${listed.floors.length}${__rmT("3IrJwO56LoiQpB.wZhybJQgmvxGxSUwC.M4sX2qBatuG30YGTfC3UW5X")}` : listed.text);
    });
    $('#rh_independent_read_global_world_info').on('change', e => {
        updateSettings({ independentReadGlobalWorldInfo: e.target.checked === true });
        toastr?.info?.(e.target.checked ? __rmT("FmHr4bD9rHuoGIn36TlHpHEo9iB8XE5QU5GPTnzMgG8") : __rmT("FmGck54PrHuoGIn36TlHpHEo9iB8XE5QU5GPTnzMgG8"));
    });
    $('#rh_independent_include_character_summary').on('change', e => {
        updateSettings({ independentReadCharacterCardSummary: e.target.checked === true });
    });
    $('#rh_independent_include_persona_summary').on('change', e => {
        updateSettings({ independentReadPersonaSummary: e.target.checked === true });
    });
    $('#rh_world_info_all_books').on('toggle', function () {
        if (this.open)
            renderWorldInfoBookSettings({ current: false, all: true });
        else
            clearCollapsedAllWorldInfoBookRows();
    });
    $('#rh_world_info_books_fetch').on('click', async function () {
        const button = $(this);
        const status = $('#rh_world_info_books_fetch_status');
        button.prop('disabled', true);
        status.text(__rmT("cIFOA.FdMuIo8h"));
        try {
            const pulledCount = await pullAllWorldInfoBooks();
            status.text(`${__rmT("iFBj8G4JHKG")}${pulledCount}${__rmT("2RWGjk")}`);
            toastr?.success?.(`${__rmT("iFBj8G4JHKG")}${pulledCount}${__rmT("xBw.zlJpPE6urZt66mW.8PE8vJPDXUJUbFjaqqhL")}`);
        }
        catch (error) {
            clearPulledWorldInfoBooks();
            const message = String(error?.message || error);
            status.text(message.includes(__rmT("vefvjh")) ? __rmT("hJCDAKlY_2s") : __rmT("hJCDAabkGU_"));
            toastr?.warning?.(message);
        }
        finally {
            button.prop('disabled', false);
        }
    });
    $('#rh_world_info_book_filters, #rh_world_info_all_book_filters').on('change', '.rh-world-info-book-toggle', function () {
        const index = Number($(this).attr('data-book-index'));
        const container = $(this).closest('#rh_world_info_book_filters, #rh_world_info_all_book_filters');
        const books = container.data('rm-world-info-books') || [];
        const name = String(books[index] || '').trim();
        if (!name)
            return;
        const nextDisabled = new Set(getSettings().independentWorldInfoDisabledBooks || []);
        if (this.checked)
            nextDisabled.delete(name);
        else
            nextDisabled.add(name);
        updateSettings({ independentWorldInfoDisabledBooks: [...nextDisabled] });
        $('.rh-world-info-book-toggle').each(function () {
            if (String($(this).attr('data-book-id') || '') === name)
                $(this).prop('checked', !nextDisabled.has(name));
        });
        const safeName = escapeHtml(name);
        toastr?.info?.(this.checked ? `${__rmT("iF2oqqWRSXG")}${safeName}${__rmT("foWrzT")}` : `${__rmT("iFN.A2ElSXG")}${safeName}${__rmT("foWrzT")}`);
    });
    $('#rh_independent_import_current').on('click', async function () {
        const connectionRevision = beginIndependentConnectionOperation();
        invalidateIndependentModelPull();
        const button = $(this);
        button.prop('disabled', true);
        try {
            const imported = await importCurrentSillyTavernConnection({
                isCurrent: () => independentConnectionOperationIsCurrent(connectionRevision),
            });
            if (!independentConnectionOperationIsCurrent(connectionRevision))
                return;
            const fresh = getSettings();
            document.getElementById('rh_independent_profile_refresh')?.click?.();
            syncIndependentProfileSelector(String(fresh.independentConnectionProfileId || ''));
            $('#rh_independent_model').val(fresh.independentApiModel || imported?.model || '');
            renderIndependentConnectionStatus();
            const savedModels = getIndependentSavedModels();
            const source = { mode: 'profile', profileId: String(fresh.independentConnectionProfileId || ''), label: String(imported?.name || __rmT("b91q475bCfKD6pRY")) };
            renderIndependentModelSelect(savedModels, String($('#rh_independent_model').val() || ''), source, {
                statusText: savedModels.length ? `${__rmT("iFN045tDHKG")}${savedModels.length}${__rmT("XPo6EttnmC9TDjglnWUKTWWMuFaTxanFdS4ByI1q7_2czAEC6n0DtjV3HyLgGhVZvkAkaXbTDS7PVb5tvX8Frh")}` : `${__rmT("CgJWOCnjJA_gMLFLDFtJUT")}${source.label}${__rmT("O0YftHZzVDjAsoWA_63mYil6HjFyTxs2")}`,
            });
            refreshRabbitMirrorGenerationMode();
            toastr?.success?.(`${__rmT("2lXdUXrRgUWMKq0x2ExwZWW3uLk")}${String(imported?.name || __rmT("rHZnAGhLDPC"))}`);
        }
        catch (error) {
            if (error?.code === 'INDEPENDENT_CONNECTION_SELECTION_SUPERSEDED' || !isCurrentRuntime())
                return;
            toastr?.error?.(`${__rmT("uvRsSBFpWIBUcAiaVpA")}${String(error?.message || error)}`);
        }
        finally {
            button.prop('disabled', false);
        }
    });
    $('#rh_independent_use_manual').on('click', () => {
        beginIndependentConnectionOperation();
        invalidateIndependentModelPull();
        const temperature = Number($('#rh_independent_temperature').val());
        const maxTokens = Number($('#rh_independent_max_tokens').val());
        const maxRequestChars = Number($('#rh_independent_max_request_chars').val());
        const rerollMax = Number($('#rh_independent_automatic_reroll').val());
        const rerollIdle = Number($('#rh_independent_automatic_reroll_idle').val());
        const contextLayers = Number($('#rh_independent_context_layers').val());
        updateSettings({
            independentConnectionProfileId: '',
            independentApiBaseUrl: $('#rh_independent_base').val(),
            independentApiKey: $('#rh_independent_key').val(),
            independentApiModel: $('#rh_independent_model').val(),
            independentApiTemperature: Number.isFinite(temperature) ? temperature : 0.8,
            independentApiMaxTokens: Number.isFinite(maxTokens) && maxTokens > 0 ? maxTokens : 30000,
            independentMaxRequestChars: Number.isFinite(maxRequestChars) && maxRequestChars > 0 ? maxRequestChars : DEFAULT_INDEPENDENT_MAX_REQUEST_CHARS,
            automaticRerollEnabled: $('#rh_automatic_reroll_enabled').prop('checked') === true,
            independentAutomaticRerollMax: Number.isFinite(rerollMax) ? rerollMax : 2,
            independentAutomaticRerollIdleSeconds: Number.isFinite(rerollIdle) ? rerollIdle : 90,
            independentContextMaxLayers: Number.isFinite(contextLayers) && contextLayers > 0 ? contextLayers : 20,
        });
        syncIndependentProfileSelector('');
        const source = { mode: 'manual', baseUrl: String($('#rh_independent_base').val() || '').trim(), apiKey: String($('#rh_independent_key').val() || ''), label: __rmT("elVN1NEB5N5IQwEA9Lt9tF2iXkEo7xM4p0H3_h") };
        renderIndependentModelSelect([], String($('#rh_independent_model').val() || ''), source, { selectCurrent: false, statusText: __rmT("9VNizxGBdbC_PDKCPQY_dhCt8y0O.yYf3Gq_tP49BsAxJD94UtnEASI6i.DOEMo18VFWVWoffZZ6Og1yn.jGFgwAWAT") });
        renderIndependentConnectionStatus();
        refreshRabbitMirrorGenerationMode();
        toastr?.info?.(__rmT("tGVLiX3..n7v4YiyS2DKfwT6VD9pNWijzeDNGnYL5VU6rJ2Ctf_r7f"));
    });
    const saveIndependentFields = () => {
        const temperature = Number($('#rh_independent_temperature').val());
        const maxTokens = Number($('#rh_independent_max_tokens').val());
        const maxRequestChars = Number($('#rh_independent_max_request_chars').val());
        const rerollMax = Number($('#rh_independent_automatic_reroll').val());
        const rerollIdle = Number($('#rh_independent_automatic_reroll_idle').val());
        const contextLayers = Number($('#rh_independent_context_layers').val());
        updateSettings({
            independentApiBaseUrl: $('#rh_independent_base').val(),
            independentApiKey: $('#rh_independent_key').val(),
            independentApiModel: $('#rh_independent_model').val(),
            independentApiTemperature: Number.isFinite(temperature) ? temperature : 0.8,
            independentApiMaxTokens: Number.isFinite(maxTokens) && maxTokens > 0 ? maxTokens : 30000,
            independentMaxRequestChars: Number.isFinite(maxRequestChars) && maxRequestChars > 0 ? maxRequestChars : DEFAULT_INDEPENDENT_MAX_REQUEST_CHARS,
            automaticRerollEnabled: $('#rh_automatic_reroll_enabled').prop('checked') === true,
            independentAutomaticRerollMax: Number.isFinite(rerollMax) ? rerollMax : 2,
            independentAutomaticRerollIdleSeconds: Number.isFinite(rerollIdle) ? rerollIdle : 90,
            independentContextMaxLayers: Number.isFinite(contextLayers) && contextLayers > 0 ? contextLayers : 20,
        });
    };
    const advancedDraft = () => ({
        independentAdvancedEnabled: $('#rh_independent_advanced_enabled').prop('checked') === true,
        independentReasoningEffort: String($('#rh_independent_reasoning_effort').val() || ''),
        independentExtraParams: String($('#rh_independent_extra_params').val() || ''),
        independentExcludedParams: Array.from(document.querySelectorAll('#rh_independent_excluded_params input:checked'), input => input.value),
    });
    const showAdvancedError = message => {
        const error = document.getElementById('rh_independent_advanced_error');
        error.textContent = message;
        error.hidden = !message;
        document.getElementById('rh_independent_extra_params').setAttribute('aria-invalid', message ? 'true' : 'false');
    };
    const validateAdvancedDraft = () => {
        const draft = advancedDraft();
        try {
            if (draft.independentExtraParams.length > 8192)
                throw new Error(__rmT("hanQP.PYMWyNnPDMrnixuamDjyB8DKmJkAetZi3HhjyFqseQzGcaoJeItHUtNSkC"));
            const parsed = parseIndependentAdvancedOptions(draft);
            showAdvancedError('');
            return { draft, parsed };
        }
        catch (error) {
            showAdvancedError(String(error?.message || __rmT("B8OWVV9vfy.vYUjG3XimJhFPQ5imRK6C7BZyQ_CQhNClVnX1bZOYr4zTyKT9uT")));
            $('#rh_independent_advanced_status').text(__rmT("tsz21BYUVvbbdTq_ttqc46NJUwjiXFn_b_yJtxNhgG8"));
            return null;
        }
    };
    const renderAdvancedSavedStatus = () => {
        const current = getSettings();
        if (!current.independentAdvancedEnabled) {
            $('#rh_independent_advanced_status').text(__rmT("tGpSirS2UBLBQwc0h2Qz4gFcKidVmRbpy43bjEOuEL.3ptflW4hr7f"));
            return;
        }
        try {
            const parsed = parseIndependentAdvancedOptions(current);
            const count = Object.keys(parsed.body || {}).length;
            const exclusions = parsed.excludedParams?.length || 0;
            $('#rh_independent_advanced_status').text(count || exclusions ? `${__rmT("UnztYFiyMQ2Hk_FHgPD")}${count}${__rmT("4b64xAJxObjvK_Bq")}${exclusions}${__rmT("uNe15wo2Wb3H8EcdyZUYHquICCtyH6mJ29E")}` : __rmT("HC5W.HjSj1t11tVn9IccD_Ghp4YUSstQEdLQWOKjuyHBZeb6Jb3td15X"));
        }
        catch (error) {
            showAdvancedError(String(error?.message || __rmT("qwLg16cJ5LnqXlrL6i.enf10cg2rrk")));
            $('#rh_independent_advanced_status').text(__rmT("RNXAEA4_1d4jilB_yNxWJ4a0bOWK9gaduVCzjS3TEyFz9XV8m2LZPBIzgCbziSkC"));
        }
    };
    const saveAdvancedDraft = () => {
        const valid = validateAdvancedDraft();
        if (!valid)
            return false;
        updateSettings(valid.draft);
        renderAdvancedSavedStatus();
        return true;
    };
    $('#rh_independent_advanced_save').on('click', () => {
        if (!saveAdvancedDraft())
            document.getElementById('rh_independent_extra_params')?.focus();
    });
    $('#rh_independent_advanced_enabled').on('change', () => {
        if (!saveAdvancedDraft())
            checked('#rh_independent_advanced_enabled', getSettings().independentAdvancedEnabled === true);
    });
    $('#rh_independent_reasoning_effort, #rh_independent_extra_params').on('input change', () => {
        showAdvancedError('');
        $('#rh_independent_advanced_status').text(__rmT("jj2SOL4BzR3uR0e6gmlkGbjut7DwvB5U09hGWJtLomBHnKLDTfUVCj5X"));
    }).on('blur', validateAdvancedDraft);
    $('#rh_independent_excluded_params input').on('change', () => {
        showAdvancedError('');
        $('#rh_independent_advanced_status').text(__rmT("yCP3FYk19MEBkn.Y77uOJ6amF4SZnmnX_E51SJ_nfgJdhi.dXTA2BlhpzBG"));
    });
    $('#rh_independent_exclude_common').on('click', () => {
        setExcludedSelection(['temperature', 'frequency_penalty', 'presence_penalty', 'top_p']);
        showAdvancedError('');
        $('#rh_independent_advanced_status').text(__rmT("HC5I_H4uNRgcRfIS2T8kGbjut7DwvB5U09hGWJtLomBHnKLDTfUVCj5X"));
    });
    $('#rh_independent_exclude_none').on('click', () => {
        setExcludedSelection([]);
        showAdvancedError('');
        $('#rh_independent_advanced_status').text(__rmT("HCToEnjMTiXFc.JCmmfkGbjut7DwvB5U09hGWJtLomBHnKLDTfUVCj5X"));
    });
    $('#rh_independent_extra_clear').on('click', () => {
        $('#rh_independent_extra_params').val('');
        showAdvancedError('');
        $('#rh_independent_advanced_status').text(__rmT("tGVYOmKAdfYpFANpyOXClCO9oJGsQYqlCl0AqK3VTrqbBx5vU0pr7f"));
    });
    $('#rh_independent_advanced_reset').on('click', () => {
        checked('#rh_independent_advanced_enabled', false);
        $('#rh_independent_reasoning_effort').val('');
        $('#rh_independent_extra_params').val('');
        setExcludedSelection([]);
        saveAdvancedDraft();
    });
    renderAdvancedSavedStatus();
    $('#rh_independent_base, #rh_independent_key, #rh_independent_model').on('change blur', saveIndependentFields);
    $('#rh_independent_temperature, #rh_independent_max_tokens, #rh_independent_max_request_chars, #rh_independent_automatic_reroll, #rh_independent_automatic_reroll_idle, #rh_independent_context_layers').on('change', saveIndependentFields);
    $('#rh_automatic_reroll_enabled').on('change', () => {
        const enabled = $('#rh_automatic_reroll_enabled').prop('checked') === true;
        $('#rh_automatic_reroll_fields').prop('hidden', !enabled);
        updateSettings({ automaticRerollEnabled: enabled });
    });
    let independentModelListSource = null;
    const independentProfileSourceRevision = () => Number(globalThis.__rabbitMirrorIndependentProfileSourceRevision || 0);
    const syncIndependentProfileSelector = profileId => {
        const select = $('#rh_independent_profile_select');
        if (!select.length)
            return;
        select.val(String(profileId || '').trim());
    };
    function profiles() {
        try {
            const rows = getIndependentConnectionProfiles();
            return Array.isArray(rows) ? rows.filter(item => item?.id) : [];
        }
        catch {
            return [];
        }
    }
    function selectedProfileId() {
        try {
            return String(getSettings()?.independentConnectionProfileId || '').trim();
        }
        catch {
            return '';
        }
    }
    function profileLabel(item) {
        const name = String(item?.name || __rmT("W7DAA7Hf8Y53Gf")).trim();
        const model = String(item?.model || '').trim();
        const api = String(item?.api || '').trim();
        return [name, model, api].filter(Boolean).join(' · ');
    }
    function updateStatus(profile) {
        const status = document.getElementById('rh_independent_connection_status');
        if (!status)
            return;
        let actualModel = '';
        try {
            actualModel = String(getSettings()?.independentApiModel || '').trim();
        }
        catch { }
        if (!profile) {
            if (selectedProfileId()) {
                status.textContent = __rmT("Xq2ADu_BFMPTkzI9A4Tc0c1gCRWuoXSfh72ZfO1asNF.fjQO.gvz0V6iP.C");
                return;
            }
            status.textContent = `${__rmT("iGaUp5Oxi..Df6GQEGaO2Q9cwwPEyIUf6.pUikrGr3x5X49x")}${actualModel || __rmT("YFbAF5qI1GE")}`;
            return;
        }
        const profileDefault = String(profile.model || '').trim();
        const defaultHint = profileDefault && profileDefault !== actualModel ? `${__rmT("hmH2T7pQTweHGDdjEZtnlIeGjDHO1TbY")}${profileDefault}${__rmT("eXs")}` : '';
        status.textContent = `${__rmT("FzGpcsdgd9IStf")}${profile.name || __rmT("W7DAA7Hf8Y53Gf")}${__rmT("OvGgS01FSoj7SZ74R.nWFfty")}${actualModel || profileDefault || __rmT("YFbAFcsQ2Ph")}${defaultHint}`;
    }
    function syncModel(profile) {
        const model = String(profile?.model || '').trim();
        if (!model)
            return;
        const input = document.getElementById('rh_independent_model');
        if (input && input.value !== model)
            input.value = model;
        const select = document.getElementById('rh_independent_model_select');
        if (select) {
            let option = [...select.options].find(item => item.value === model);
            if (!option) {
                option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                select.appendChild(option);
            }
            select.value = model;
        }
    }
    function clearModelListForSource(profile) {
        const select = document.getElementById('rh_independent_model_select');
        if (select) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = profile
                ? `${__rmT("CyN_YHVp3t4Jk_.BkGD")}${profile.name || __rmT("W7DAA7Hf8Y53Gf")}${__rmT("NUab0jyTyTwzqYK7OoY")}` : __rmT("phktDBu2uzQOaQcW6EWyzl8URgT4mhyUZuj.FWBf");
            select.innerHTML = '';
            select.appendChild(option);
            select.value = '';
            if (select.dataset)
                select.dataset.rhModelSource = '';
        }
        const source = document.getElementById('rh_independent_model_list_source');
        if (source)
            source.textContent = profile
                ? `${__rmT("fUPMiknV776YjaVK33cLmIYI")}${profile.name || __rmT("W7DAA7Hf8Y53Gf")}${__rmT("glLxfl8bPWEdooMMKIvPPMEL44ahz_GY3mcnfrDB318EGDOXq8_")}` : __rmT("mqGtqpT3LqQpZESz1ZSWkSn6dT_czuppsVL5d__IRC2hPz7jq8_");
    }
    function renderProfileOptions({ force = false } = {}) {
        const select = document.getElementById('rh_independent_profile_select');
        if (!select)
            return;
        if (!force && select.dataset.rabbitMirrorProfilesReady === 'true')
            return;
        const rows = profiles();
        const selected = selectedProfileId();
        const known = new Set(rows.map(item => String(item.id)));
        const options = [__rmT("OxyeVl8604tneqnjdwoDaNzqOaoVVLWGHO2BULIaMCRT6JJTMrGuOusSLSH6JE9Aw2WWuq6QzAC1c2_Nwysn_.pNTaOTvwfil8ks4Ntzrhw07RPxItEI1xBx9lr3TXZx1xq50YdfSRbVm3KBR19opxJfZd3Rq2aaZwLKGGUT")];
        if (selected && !known.has(selected)) {
            options.push(`<option value="${escapeHtml(selected)}${__rmT("Xgoxm.Qz13libl943ZDG9Qo.rrDH.miG6TIU3OZ_3e_bCwzPgVEmjm77vRq3iCfHGv0HIwgajzDZtPtrS5pOcf")}${escapeHtml(selected)}</option>`);
        }
        for (const item of rows) {
            const id = String(item.id || '');
            options.push(`<option value="${escapeHtml(id)}"${id === selected ? ' selected' : ''}>${escapeHtml(profileLabel(item))}</option>`);
        }
        select.innerHTML = options.join('');
        select.dataset.rabbitMirrorProfilesReady = 'true';
        const current = rows.find(item => String(item.id) === selected) || null;
        updateStatus(current);
    }
    function onProfileChange(event) {
        const select = event.currentTarget;
        const id = String(select?.value || '').trim();
        const match = profiles().find(item => String(item.id) === id) || null;
        const previousId = selectedProfileId();
        let previousModel = '';
        try {
            previousModel = String(getSettings()?.independentApiModel || '').trim();
        }
        catch { }
        const selectedModel = match && (id !== previousId || !previousModel)
            ? String(match.model || '').trim()
            : previousModel;
        globalThis.__rabbitMirrorIndependentProfileSourceRevision = Number(globalThis.__rabbitMirrorIndependentProfileSourceRevision || 0) + 1;
        globalThis.__rabbitMirrorIndependentConnectionOperationRevision = Number(globalThis.__rabbitMirrorIndependentConnectionOperationRevision || 0) + 1;
        const patch = { independentConnectionProfileId: id };
        if (id)
            patch.independentApiKey = '';
        if (selectedModel)
            patch.independentApiModel = selectedModel;
        updateSettings(patch);
        if (match)
            syncModel({ ...match, model: selectedModel || match.model });
        if (id !== previousId)
            clearModelListForSource(match);
        updateStatus(match);
        try {
            refreshRabbitMirrorGenerationMode();
        }
        catch { }
    }
    function onRefreshClick() {
        renderProfileOptions({ force: true });
    }
    $('#rh_independent_profile_select').on('change', onProfileChange);
    $('#rh_independent_profile_refresh').on('click', onRefreshClick);
    renderProfileOptions();
    const independentModelSourceKey = source => {
        if (source?.mode === 'profile')
            return `profile:${String(source.profileId || '').trim()}`;
        if (source?.mode === 'manual')
            return `manual:${String(source.baseUrl || '').trim()}`;
        return '';
    };
    const independentModelSourceIsActive = source => {
        const current = getSettings();
        if (source?.mode === 'profile')
            return String(current.independentConnectionProfileId || '').trim() === String(source.profileId || '').trim();
        if (source?.mode === 'manual')
            return !String(current.independentConnectionProfileId || '').trim()
                && String(current.independentApiBaseUrl || '').trim() === String(source.baseUrl || '').trim();
        return false;
    };
    const beginIndependentModelPull = source => ({
        epoch: ++independentModelPullEpoch,
        profileRevision: independentProfileSourceRevision(),
        activeProfileId: String(getSettings().independentConnectionProfileId || '').trim(),
        source: { ...source },
    });
    const independentModelPullIsCurrent = snapshot => {
        return independentModelPullSnapshotMatches(snapshot, {
            epoch: independentModelPullEpoch,
            profileRevision: independentProfileSourceRevision(),
            activeProfileId: String(getSettings().independentConnectionProfileId || '').trim(),
            manualBaseUrl: String($('#rh_independent_base').val() || '').trim(),
            manualApiKey: String($('#rh_independent_key').val() || ''),
        });
    };
    const renderIndependentModelSelect = (models, currentModel = '', source = null, options = {}) => {
        const select = $('#rh_independent_model_select');
        const current = String(currentModel || '').trim();
        const safeModels = Array.isArray(models) ? models : [];
        independentModelListSource = source && independentModelSourceKey(source) ? { ...source } : null;
        const sourceKey = independentModelSourceKey(independentModelListSource);
        select.attr('data-rh-model-source', sourceKey);
        const placeholder = options.placeholderText || (safeModels.length
            ? `${__rmT("wGfJ3f")}${source?.label || __rmT("rHZnA0tXV6f")}${__rmT("RXpChcc6")}${safeModels.length}${__rmT("fiXSWpqDsGrI0A3Z0akwxf")}` : __rmT("phktDBu2uzQOaQcW6EWyzl8URgT4mhyUZuj.FWBf"));
        select.empty().append($('<option>').val('').text(placeholder));
        for (const id of safeModels) {
            select.append($('<option>').val(id).text(id));
        }
        const selectCurrent = options.selectCurrent !== false && independentModelSourceIsActive(independentModelListSource);
        select.val(selectCurrent && safeModels.includes(current) ? current : '');
        const sourceText = options.statusText || (independentModelListSource
            ? `${__rmT("7hbuZKZ1diVxMbFeVpA")}${independentModelListSource.label || __rmT("rHZnA0tXV6f")}${__rmT("eS1I_Unc7KMcvtHoW_1.yAILqkTmwNbtcau9j3AWCXi1HLqgixi3dW5X")}` : __rmT("o.dHIjE0sJM1YUjkkWfzcKTUl_jgGQ2Uu6ToiEHMBf_fIdIZ9iyr1nNW5hH_qqtoI..Y3h"));
        $('#rh_independent_model_list_source').text(sourceText);
    };
    $('#rh_independent_base, #rh_independent_key, #rh_independent_model').on('input', invalidateIndependentModelPull);
    $('#rh_independent_base, #rh_independent_key').on('change blur', () => {
        if (independentModelListSource?.mode !== 'manual')
            return;
        const baseUrl = String($('#rh_independent_base').val() || '').trim();
        const apiKey = String($('#rh_independent_key').val() || '');
        if (baseUrl === String(independentModelListSource.baseUrl || '').trim() && apiKey === String(independentModelListSource.apiKey || ''))
            return;
        invalidateIndependentModelPull();
        const source = { mode: 'manual', baseUrl, apiKey, label: __rmT("elVN1NEB5N5IQwEA9Lt9tF2iXkEo7xM4p0H3_h") };
        renderIndependentModelSelect([], String($('#rh_independent_model').val() || ''), source, {
            selectCurrent: false,
            statusText: __rmT("pLCIzcO68P_15d8aJb2tWUJWkfptXEH6LysR24LQ_EtIg8Z4Pdrk8kqiQXb7WvQx2YxJ4YNDQGR.ub_DqPIGOSdWWAT"),
        });
    });
    $('#rh_independent_model_select').on('change', e => {
        const model = String(e.target.value || '').trim();
        if (!model)
            return;
        const source = independentModelListSource;
        if (!source || String($(e.target).attr('data-rh-model-source') || '') !== independentModelSourceKey(source)) {
            toastr?.warning?.(__rmT("nPNy.Z4Prt4Wpye.fgSXbRHDhXGMZyoQfzUBTNuqmpvyhs8Ax8kTGJR8LM9esEMsWUE"));
            $(e.target).val('');
            return;
        }
        beginIndependentConnectionOperation();
        invalidateIndependentModelPull();
        $('#rh_independent_model').val(model);
        if (source.mode === 'profile') {
            updateSettings({ independentConnectionProfileId: String(source.profileId || '').trim(), independentApiKey: '', independentApiModel: model });
            syncIndependentProfileSelector(String(source.profileId || '').trim());
        }
        else {
            updateSettings({
                independentConnectionProfileId: '',
                independentApiBaseUrl: String(source.baseUrl || '').trim(),
                independentApiKey: String(source.apiKey || ''),
                independentApiModel: model,
            });
            syncIndependentProfileSelector('');
        }
        renderIndependentConnectionStatus();
        refreshRabbitMirrorGenerationMode();
        $('#rh_independent_model_list_source').text(`${__rmT("iF2jpgm6WZY")}${source.label || __rmT("rHZnA0tXV6f")} / ${model}${__rmT("DsLOsZCAMWbS7HXgDKFg3G1vX45NJQh21aUM7kP9vUjp9ReMq8_")}`);
    });
    $('#rh_independent_model').on('change blur', () => {
        invalidateIndependentModelPull();
        const current = String($('#rh_independent_model').val() || '').trim();
        const select = $('#rh_independent_model_select');
        const exists = select.find('option').toArray().some(option => String(option.value || '') === current);
        select.val(exists ? current : '');
        renderIndependentConnectionStatus();
    });
    $('#rh_independent_models').on('click', async function () {
        const button = $(this);
        const originalText = button.text();
        const currentSettings = getSettings();
        const profileId = String(currentSettings.independentConnectionProfileId || '').trim();
        const profile = getIndependentConnectionProfiles().find(item => item.id === profileId);
        if (!profileId || !profile) {
            toastr?.warning?.(__rmT("Fmx24tMB6xXPGKQDyH89CtiknO1VmL1jeVjy0OcE2F1Nmv7i1vT2gBtSEhKclpAyHHm.FAL9vtNuc8OLUc9lkLGu"));
            return;
        }
        const source = { mode: 'profile', profileId, label: String(profile.name || __rmT("b91q475bCfKD6pRY")) };
        const pullSnapshot = beginIndependentModelPull(source);
        const current = String($('#rh_independent_model').val() || currentSettings.independentApiModel || '').trim();
        const savedModels = getIndependentSavedModels();
        button.prop('disabled', true).text(__rmT("cIFOA.FdMuIo8h"));
        renderIndependentModelSelect(savedModels, current, source, { statusText: `${__rmT("kBZhONgEJA_gMLFLDFtJUT")}${source.label}${__rmT("H7dyDbWvBMyQzhuOsRpS0vjttvUpYD77PXZVS02vBHRpANh4cSACVeDBguG")}` });
        try {
            const models = await fetchIndependentModels({ mode: 'profile', profileId });
            if (!isCurrentRuntime() || !independentModelPullIsCurrent(pullSnapshot))
                return;
            renderIndependentModelSelect(models, current, source);
            if (current) {
                $('#rh_independent_model').val(current);
            }
            else if (models[0]) {
                $('#rh_independent_model').val(models[0]);
                $('#rh_independent_model_select').val(models[0]);
                updateSettings({ independentApiModel: models[0] });
            }
            const diagnostic = getLastIndependentModelListDiagnostic();
            if (diagnostic?.mode === 'saved-fallback') {
                toastr?.warning?.(`${__rmT("3JuLzL0Kvu8e4qd6U7bLD88c7Po2fKN8UbPRfwCfyYtIEPuRyaQ_nhfjJ6G")}${models.length}${__rmT("Uqe0v5ui.Q7Msh")}${diagnostic.error || ''}`);
            }
            else {
                toastr?.success?.(`${__rmT("Unz_YHVp3t4Jk_.BkGD")}${source.label}${__rmT("7tEj8G4JHKG")}${models.length}${__rmT("ACEt9TSOKieE5vUgw7mzYUMoqSYrSzkw6Jj.uTirLzKgjRDjR1ntJjsw2iaXPmsw1Sz9FHGP")}`);
            }
        }
        catch (error) {
            if (!isCurrentRuntime() || !independentModelPullIsCurrent(pullSnapshot))
                return;
            renderIndependentModelSelect(savedModels, current, source, { statusText: savedModels.length ? `${__rmT("szoFJSx5WApoyARURAbj3n5QxN2Drk")}${source.label}${__rmT("s6RaHUc6")}${savedModels.length}${__rmT("wHJlUFaQFeVdcb_wEkMfPcbHbNs")}` : `${__rmT("864G5E0jv7C5kyG1")}${source.label}${__rmT("DlF5tuh3QEX56if1")}` });
            if (current)
                $('#rh_independent_model').val(current);
            const fallbackText = savedModels.length ? `${__rmT("CtPFWgFrKDI3lLBysrcp2ohWqpKI80AP")}${savedModels.length}${__rmT("N_wA5Wb54DA")}` : '';
            toastr?.warning?.(`${__rmT("f8Y4OjwTpeFppdNJ.MW0Jh")}${fallbackText}${__rmT("jzk")}${String(error?.message || error)}`);
        }
        finally {
            button.prop('disabled', false).text(originalText);
        }
    });
    $('#rh_independent_manual_models').on('click', async function () {
        const button = $(this);
        const originalText = button.text();
        const baseUrl = String($('#rh_independent_base').val() || '').trim();
        const apiKey = String($('#rh_independent_key').val() || '');
        if (!baseUrl) {
            toastr?.warning?.(__rmT("MzSM1iIkrmqM74udFat9t8miCf.zVHotKTMspf"));
            return;
        }
        const source = { mode: 'manual', baseUrl, apiKey, label: __rmT("elVN1NEB5N5IQwEA9Lt9tF2iXkEo7xM4p0H3_h") };
        const pullSnapshot = beginIndependentModelPull(source);
        const current = String($('#rh_independent_model').val() || getSettings().independentApiModel || '').trim();
        const sourceWasActive = independentModelSourceIsActive(source);
        button.prop('disabled', true).text(__rmT("cIFOA.FdMuIo8h"));
        renderIndependentModelSelect([], current, source, { selectCurrent: false, statusText: __rmT("yLzI4PBcMRjmWk_aZtNwvewTRalbP_pEKDaSt5n0zsW0.eroPKV8cfnxmXXgWxOGrBOwBa5vL15c6UvuIKjRFQPAWAT") });
        try {
            const models = await fetchIndependentModels({ mode: 'manual', baseUrl, apiKey });
            if (!isCurrentRuntime() || !independentModelPullIsCurrent(pullSnapshot))
                return;
            renderIndependentModelSelect(models, current, source, { selectCurrent: sourceWasActive });
            if (sourceWasActive && !current && models[0]) {
                $('#rh_independent_model').val(models[0]);
                $('#rh_independent_model_select').val(models[0]);
                updateSettings({ independentConnectionProfileId: '', independentApiBaseUrl: baseUrl, independentApiKey: apiKey, independentApiModel: models[0] });
                renderIndependentConnectionStatus();
            }
            toastr?.success?.(`${__rmT("2GS7UZPkbZJ4BBesq.vM8nCx")}${models.length}${__rmT(".5Uu.Z4Prt4PwB7cgNv2wjKUxX_O_7ikN5s_sV5.4QYO_Y84caAS0ouyb9Uz6BJKWUE")}`);
        }
        catch (error) {
            if (!isCurrentRuntime() || !independentModelPullIsCurrent(pullSnapshot))
                return;
            renderIndependentModelSelect([], current, source, { selectCurrent: false, statusText: __rmT("k1rMgO5jUHzMmOpYF3ptw8fwjBW0SMR2oXzXoIFU7hTXW_6FgTVVVkKZRmE3EjKwY5Q3S13xY3Y") });
            toastr?.warning?.(`${__rmT("4EoLIpC13oHDxd3NThWqeNILe1ghSKDS29E")}${String(error?.message || error)}`);
        }
        finally {
            button.prop('disabled', false).text(originalText);
        }
    });
    $('#rh_independent_test').on('click', async () => {
        saveIndependentFields();
        const result = await testIndependentConnection();
        if (result.verified) {
            toastr?.success?.(`${__rmT("ulXckbEam0rrcUeKyhSq91ggfCdNwsbKnQE")}${result.models.length}${__rmT("N_wA5Wb54DA")}`);
            return;
        }
        if (result.code === 'MODEL_LIST_SAVED_FALLBACK') {
            toastr?.warning?.(`${__rmT("zPxTPsEM..y8o7jnAvQakeaE4oA1cO1Z0oVDKS_3agpF2oJ4qMOA5IBIJbSjyFwZB5aYV1_sRwhsnh")}${result.models.length}${__rmT("Uqe0v5ui.Q7Msh")}${result.error || ''}`);
            return;
        }
        const manualModel = String($('#rh_independent_model').val() || result.manualModel || '').trim();
        toastr?.[manualModel ? 'warning' : 'error']?.(manualModel
            ? `${__rmT(".1f30HjS_D5vfgBAouumjSdH9CRkMjr9LdCx07KjZmSpuu13mxNrGqgX")}${manualModel}${__rmT("CMJCMZIgU68xM5YeX4bM9kCcbNs")}${result.error}` : `${__rmT("wrk.EN5JlPiWVMHQfjm_Lk")}${result.error}`);
    });
    $('#rh_enabled').on('change', e => { updateSettings({ enabled: e.target.checked, autoRabbitMirrorInjection: e.target.checked, mode: e.target.checked ? 'integrated' : 'off' }); if (e.target.checked)
        syncFeedbackCatExtensionPrompt(getActiveFeedbackForCurrentChat());
    else
        clearFeedbackCatExtensionPrompt(); refreshRabbitMirrorGenerationMode(); });
    $('#rh_strip_old_mirrors').on('change', e => {
        updateSettings({ stripOldMirrorsBeforeSend: e.target.checked });
        toastr?.info?.(e.target.checked ? __rmT("sJNPgafGAeR_UdozxIhcWGCoc5Ce6yYx.FlhwY0ECp9cdfJ8q8_") : __rmT("sB1YQLbaHDJv4J_yv4R4muJOQBuiiL3knspyTaIwIb0k6Dn32A_20nJaSqKul9VsUpZtQPscELDctGdZwfyxsKCAYFzM.5YO"));
    });
    $('#rh_feedback_cat').on('change', e => {
        updateSettings({ feedbackCatEnabled: e.target.checked });
        if (e.target.checked)
            syncFeedbackCatExtensionPrompt(getActiveFeedbackForCurrentChat());
        else
            clearFeedbackCatExtensionPrompt();
        scheduleSettingsToolsRefresh();
        toastr?.[e.target.checked ? 'info' : 'success']?.(e.target.checked
            ? __rmT("ViQ_8oTBNXHMReV.2etqIHEUmd212tgGYWzJ0ktnl_mxIItDz.w8CW9Ig6nvzULY3Fw3ezMlw4Vp4PfXiv0p3VMaAR.DeLsnD.Nj9Yw9") : __rmT("wcGhdZPvBb94paITq0VWdXo5hKxQ3ooQShUAl9uqXu9ojZBJT6ViNSKJS9.A4CJtWUE"));
    });
    $('#rh_maintenance_rabbit').on('change', e => {
        const enabled = !!e.target.checked;
        updateSettings({
            maintenanceRabbitEnabled: enabled,
            ...(enabled ? {} : { maintenanceRabbitAutoSafeEnabled: false, maintenanceRabbitAutoSafeConsent: false }),
        });
        if (!enabled) {
            checked('#rh_maintenance_auto_safe', false);
            configureMaintenanceAutoSafeMode(false);
        }
        scheduleSettingsToolsRefresh();
        toastr?.[enabled ? 'info' : 'success']?.(enabled
            ? __rmT("gEUmEbYnSGF.JDba4RanTFtJJ4Ru6llKWpsGppmUXvL8MI13NVEsOM4ZgMC2zEnEhKjMxaq2F7aqDhPkdtBFrh") : __rmT("l8v1EA5LNpwHopjaDs70FwNNOgExEmyoqaFPfzv1UWRQt1Zih9i2bKHRrJK5HvkC"));
    });
    $('#rh_maintenance_auto_safe').on('change', e => {
        const enabled = !!e.target.checked;
        if (enabled)
            checked('#rh_maintenance_rabbit', true);
        updateSettings({
            maintenanceRabbitEnabled: enabled ? true : getSettings().maintenanceRabbitEnabled,
            maintenanceRabbitAutoSafeEnabled: enabled,
            maintenanceRabbitAutoSafeConsent: enabled,
        });
        configureMaintenanceAutoSafeMode(enabled);
        scheduleSettingsToolsRefresh();
        toastr?.[enabled ? 'info' : 'success']?.(enabled
            ? __rmT("wqOvYs4mmMxcAsxgP3orIt2RYLamolRrcWLesRYIt9J.bh") : __rmT("QUqFia7n.yHWRjyK51Y1wY3VSELcyqbq7f.H66HGXaH9pZg.AfEr7f"));
    });
    for (let index = 0; index < 5; index += 1) {
        $(`#rh_face_mode_${index}`).on('change', e => {
            const modes = normalizePresentationModes(getSettings().rabbitMirrorPresentationModes);
            modes[index] = e.target.value;
            updateSettings({ rabbitMirrorPresentationModes: modes });
            renderFacePresentationSettings(getSettings());
        });
    }
    $('#rh_multiface_enabled').on('change', e => {
        const enabled = e.target.checked === true;
        const count = Number($('#rh_multiface_count').val());
        updateSettings({ rabbitMirrorFaceCount: enabled && Number.isInteger(count) && count >= 2 && count <= 5 ? count : enabled ? 2 : 1 });
        $('#rh_multiface_count_row').prop('hidden', !enabled);
        $('#rh_multiface_count').prop('disabled', !enabled);
        $('#rh_multiface_dispatch_row').prop('hidden', !enabled);
        renderFacePresentationSettings(getSettings());
    });
    $('#rh_multiface_count').on('change', e => {
        if ($('#rh_multiface_enabled').prop('checked') === true)
            updateSettings({ rabbitMirrorFaceCount: Number(e.target.value) });
        renderFacePresentationSettings(getSettings());
    });
    $('input[name="rh_multiface_dispatch"]').on('change', e => {
        if (e.target.checked)
            updateSettings({ multifaceDispatch: e.target.value === 'serial' ? 'serial' : 'single' });
    });
    $('input[name="rh_lottery_method"]').on('change', e => {
        if (!e.target.checked)
            return;
        const lotteryMethod = e.target.value === 'atmosphere' ? 'atmosphere' : 'random';
        $('#rh_atmosphere_percent_row').prop('hidden', lotteryMethod !== 'atmosphere');
        updateSettings({ lotteryMethod });
    });
    $('#rh_atmosphere_story_percent').on('input change', e => {
        const atmosphereStoryPercent = Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0)));
        $('#rh_atmosphere_story_percent_value').text(String(atmosphereStoryPercent));
        if (e.type === 'change')
            updateSettings({ atmosphereStoryPercent });
    });
    $('#rh_auto_longtext_percent').on('input change', e => {
        const autoLongTextPercent = Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0)));
        $('#rh_auto_longtext_percent_value').text(String(autoLongTextPercent));
        if (e.type === 'change')
            updateSettings({ autoLongTextPercent });
    });
    $('#rh_lottery_source').on('change', e => {
        const lotterySource = ['builtin', 'worldbook', 'both'].includes(e.target.value) ? e.target.value : 'builtin';
        updateSettings({ lotterySource });
        renderFacePresentationSettings(getSettings());
    });
    $('#rh_lottery_builtin_percent').on('input change', e => {
        const lotteryBuiltinPercent = Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0)));
        $('#rh_lottery_builtin_percent_value').text(String(lotteryBuiltinPercent));
        if (e.type === 'change')
            updateSettings({ lotteryBuiltinPercent });
    });
    $('#rh_lottery_book_search').on('input', () => renderLotteryBookList());
    $('#rh_lottery_book_list').on('change', 'input[data-lottery-book]', e => {
        const name = e.target.getAttribute('data-lottery-book');
        const books = lotterySelectedBooks(getSettings()).filter(book => book !== name);
        if (e.target.checked)
            books.push(name);
        if (e.target.checked)
            lotteryBooksCache.open.add(name);
        else
            lotteryBooksCache.open.delete(name);
        updateSettings({
            lotteryBooks: books,
            lotteryEntries: (getSettings().lotteryEntries || []).filter(entry => books.includes(entry.book)),
        });
        renderLotteryBooks(getSettings());
    });
    $('#rh_lottery_entries').on('click', '[data-lottery-remove-book]', e => {
        e.preventDefault();
        e.stopPropagation();
        const name = e.target.getAttribute('data-lottery-remove-book');
        const books = lotterySelectedBooks(getSettings()).filter(book => book !== name);
        lotteryBooksCache.open.delete(name);
        updateSettings({
            lotteryBooks: books,
            lotteryEntries: (getSettings().lotteryEntries || []).filter(entry => entry.book !== name),
        });
        renderLotteryBooks(getSettings());
    });
    $('#rh_lottery_entries').on('toggle', '[data-lottery-fold]', e => {
        if (!e.target?.matches?.('[data-lottery-fold]') || lotteryBooksCache.rendering)
            return;
        const name = e.target.getAttribute('data-lottery-fold');
        if (e.target.open)
            lotteryBooksCache.open.add(name);
        else
            lotteryBooksCache.open.delete(name);
    });
    $('#rh_lottery_entries').on('click', '[data-lottery-entry]', e => {
        e.preventDefault();
        e.stopPropagation();
        const button = e.target.closest('[data-lottery-entry]');
        if (!button)
            return;
        const id = button.getAttribute('data-lottery-entry');
        const current = getSettings().lotteryEntries || [];
        const book = button.getAttribute('data-lottery-book');
        const uid = button.getAttribute('data-lottery-uid');
        const title = button.getAttribute('data-lottery-title') || uid;
        const exists = current.some(entry => entry.id === id);
        if (!exists && current.length >= LOTTERY_ENTRY_LIMIT) {
            toastr?.warning?.(`${__rmT("SHEnPhbENIQBoLuD4o3UD0Cx")}${LOTTERY_ENTRY_LIMIT}${__rmT("3bd6uSc3RdVDslLpBXAl.f3Os6qIoNeC.UXOxg2VPM9.bh")}`);
            return;
        }
        updateSettings({ lotteryEntries: exists ? current.filter(entry => entry.id !== id) : current.concat([{ id, book, uid, title, content: lotteryEntryContent(book, uid) }]) });
        renderLotteryEntries(getSettings());
    });
    $('#rh_lottery_entries').on('click', '[data-lottery-select-all]', e => {
        const book = e.target.getAttribute('data-lottery-select-all');
        const turningOn = e.target.getAttribute('data-lottery-all-state') !== 'on';
        const others = (getSettings().lotteryEntries || []).filter(entry => entry.book !== book);
        let adding = turningOn ? lotteryBookEntries(book).map(entry => lotteryEntryRecord(book, entry)) : [];
        const room = Math.max(0, LOTTERY_ENTRY_LIMIT - others.length);
        if (turningOn && adding.length > room) {
            toastr?.warning?.(room
                ? `${__rmT("SHEnPhbENIQBoLuD4o3UD0Cx")}${LOTTERY_ENTRY_LIMIT}${__rmT("fimH.ju3GVdOVKNj0FbdHT")}${adding.length}${__rmT("4JhqRXWiCQAyzBv6QZhwudbDAB1CJk")}${room}${__rmT("qGyn.qKg")}` : `${__rmT("SHEnPhbENIQBoLuD4o3UD0Cx")}${LOTTERY_ENTRY_LIMIT}${__rmT("3IrHO2VGoKFuRPcMFlwYDpYFQvacHAHeW9DdeB5VLbf8nYjF.SApu15X")}`);
            adding = adding.slice(0, room);
            if (!adding.length)
                return;
        }
        updateSettings({ lotteryEntries: turningOn ? others.concat(adding) : others });
        renderLotteryEntries(getSettings());
    });
    $('#rh_visual_prompt_enabled').on('change', e => {
        const enabled = !!e.target.checked;
        updateSettings({ visualPromptEditingEnabled: enabled });
        renderVisualPromptStatus(getSettings());
        toastr?.[enabled ? 'info' : 'success']?.(enabled
            ? __rmT("kvMCj.m3S2BwaF.WDCxfSbHpRk9aeMDSYo.vL72Y5uMeUExNwLCoSbxwN3u1alxJs5Mfk1z8LAATH0l7Rb3jeo4GKuGcxf") : __rmT("QUqgEExkZbR_8bJxYP1TcM0p9En9QIjuJEYxT7OtNQudvl_yxTBr7f"));
    });
    $('#rh_visual_prompt_save').on('click', () => {
        const visualPrompt = String($('#rh_visual_prompt').val() ?? '').replace(/\r\n?/g, '\n').slice(0, VISUAL_PROMPT_MAX_CHARS);
        const visualExtraPrompt = String($('#rh_visual_extra_prompt').val() ?? '').replace(/\r\n?/g, '\n').slice(0, VISUAL_EXTRA_PROMPT_MAX_CHARS);
        const visualAvoidPrompt = String($('#rh_visual_avoid_prompt').val() ?? '').replace(/\r\n?/g, '\n').slice(0, VISUAL_AVOID_PROMPT_MAX_CHARS);
        updateSettings({ visualPrompt, visualExtraPrompt, visualAvoidPrompt });
        renderVisualPromptStatus(getSettings());
        const total = visualPrompt.length + visualExtraPrompt.length + visualAvoidPrompt.length;
        if (getSettings().visualPromptEditingEnabled && !visualPrompt.trim()) {
            toastr?.warning?.(`${__rmT("iFB45T6z0vY")}${total}${__rmT("dxJjl2MNyjrovVwz.DPEJhSJzKe2wGaayoJ6jTRmiUBtptzkpfN2pHOgGT_9uT")}`);
        }
        else {
            toastr?.success?.(getSettings().visualPromptEditingEnabled
                ? `${__rmT("LUvLYP1I6TWPSu7vvwpAM71y")}${total}${__rmT("o6RczYGJC3d7sLWBLHCsMg.pcl903K5LXvAL9V3PQxiypA3nqKO3pjIKvkoscrw4fROY3h")}` : `${__rmT("LUvLYP1I6TWPSu7vvwpAM71y")}${total}${__rmT("dxJjl2MNyjrovVwzodwugSuwHTqlNRdau3YEEQ5aPybwkBKB_wutRLrm0RE9uT")}`);
        }
    });
    $('#rh_visual_prompt_reset').on('click', () => {
        $('#rh_visual_prompt').val(DEFAULT_VISUAL_PROMPT);
        updateSettings({ visualPrompt: DEFAULT_VISUAL_PROMPT });
        renderVisualPromptStatus(getSettings());
        toastr?.success?.(__rmT("9oFkldpGfghFO2CikHsf4_31tLhXEyj2lewub3ucYfvkpcHYbIXDrFL5V73a6WW8AyFY3h"));
    });
    $('#rh_memory_scan_enabled').on('change', e => {
        updateSettings({ memoryScanEnabled: e.target.checked });
        renderMemoryWorldBookBinding();
        toastr?.[e.target.checked ? 'info' : 'success']?.(e.target.checked
            ? __rmT("9VNHIU_wAiu2dwUh5MUSYfZHYXMaWqPTM6xiCmmNSbUVJ1roUu8iOfJpW24d52v_AWRegl3FmzKGEsnguAjphaXNWAT") : __rmT("ZYX5yqeAP7Np2UCkKjr5JOOfaNtAeei1xbH3fh.3jmwsqiMkQ0dlIQaNjwC9uT"));
    });
    $('#rh_memory_scan_now').on('click', () => {
        const results = scanMemoryPlugins();
        renderMemoryScanResults(results);
        const readableCount = results.filter(item => item.readable).length;
        const pendingCount = results.length - readableCount;
        toastr?.info?.(`${__rmT("qIorFH.bgMVStf")}${readableCount}${__rmT("Uqe0vmOjxpSiCf")}${pendingCount ? `${__rmT("Yis")}${pendingCount}${__rmT("wRecU7b5k58mYdXmFoRNcaMs")}` : ''}${__rmT("jzk")}`);
    });
    $('#rh_memory_worldbook_refresh').on('click', refreshMemoryWorldBookDirectory);
    $('#rh_memory_worldbook_enabled').on('change', e => {
        updateSettings({ memoryWorldBookEnabled: e.target.checked });
        renderMemoryWorldBookBinding();
    });
    $('#rh_memory_worldbook_id').on('change', e => {
        updateSettings({ memoryWorldBookId: e.target.value });
        renderMemoryWorldBookBinding();
    });
    $('#rh_memory_worldbook_clear').on('click', () => {
        updateSettings({ memoryWorldBookId: '' });
        renderMemoryWorldBookBinding(__rmT("zsCgHelbb2A8I9RsraxrFTCd90rFtVWqCpFNkxtZ4JhVTAtUih2m4NMoRfnr9E87A7IZ6Eb6_5kopX2no5YFrh"));
    });
    $('#rh_memory_scan_results').on('change', '.rh-memory-provider-check', function () {
        const id = String($(this).data('provider-id') || '');
        const current = new Set(getSettings().memoryProviderIds || []);
        if (this.checked)
            current.add(id);
        else
            current.delete(id);
        updateSettings({ memoryProviderIds: [...current] });
    });
    $('#rh_memory_scan_results').on('click', '.rh-memory-test', function () {
        const id = String($(this).data('provider-id') || '');
        const result = testMemoryProvider(id);
        if (result.ok)
            toastr?.success?.(memoryTestMessage(result));
        else
            toastr?.error?.(memoryTestMessage(result));
    });
    $('#rh_sampling_mode').on('change', e => updateSettings({ samplingMode: e.target.value }));
    $('#rh_single_pair_sampling').on('change', e => updateSettings({ singlePairSampling: e.target.checked === true }));
    $('#rh_raw_policy').on('change', e => updateSettings({ rawPolicy: e.target.value }));
    $('#rh_user_directive').on('change', e => updateSettings({ userDirectivePriority: e.target.checked }));
    $('#rh_worldview_lock').on('change', e => {
        const enabled = !!e.target.checked;
        if (!enabled) {
            updateSettings({ presentationWorldviewLock: false });
            toastr?.info?.(__rmT("qUd6EhVLG9Gu695S1M9qH__cKAYGk7s2"));
            return;
        }
        const currentMode = String(getSettings().samplingMode || 'classic');
        if (currentMode !== 'format_only') {
            const accepted = globalThis.confirm?.(__rmT("Jxy4KXbOWn.RxKxAAepXsy16RkhYevtKXhaL46weuDjuGkHvX7b9oHP8k3j8cxMqDUgOMTdNFR57g3meyp.q8a1mO9ov4GAliWpRMY2Q3aLcIcC4U7u0SBljQCXuy9vzERvjlltuL6Jp4L2Fq6UrADFz0UoXFzivnVfEwk")) !== false;
            if (!accepted) {
                e.target.checked = false;
                return;
            }
            updateSettings({ presentationWorldviewLock: true, samplingMode: 'format_only' });
            $('#rh_sampling_mode').val('format_only');
            toastr?.info?.(__rmT("26DwK.1chEgerp1BrgHzSZr0_0BZh._nw_kJSaTRa3Lg8xSDg8HZlMgKQfbeJRrW.CoR0o91cwkvn_H9"));
            return;
        }
        updateSettings({ presentationWorldviewLock: true });
        toastr?.info?.(__rmT("qUd6EhVLG9Gu695S1M9qH__cOpw9TIs2"));
    });
    $('#rh_creative_expansion').on('change', e => updateSettings({ creativeExpansionMode: e.target.checked }));
    $('input[name="rh_visual_scenery_mode"]').on('change', e => {
        if (!e.target.checked)
            return;
        const mode = e.target.value;
        if (!['ordinary', 'scenery', 'combined'].includes(mode))
            return;
        updateSettings({ forceVisualScenery: mode !== 'ordinary', visualSceneryCombination: mode === 'combined' });
    });
    $('#rh_image_enabled').on('change', e => {
        updateSettings({ imageEnabled: e.target.checked });
        scheduleSettingsToolsRefresh();
    });
    $('#rh_builtin_image').on('change', e => updateSettings({ builtinImageEnabled: e.target.checked === true }));
    $('#rh_web_fonts').on('change', e => {
        updateSettings({ webFontsEnabled: e.target.checked === true });
        void import('./webFonts.js?rmv=1.100.0').then(module => module.applyWebFontsSetting(e.target.checked === true)).catch(() => { });
    });
    $('#rh_collection_taste').on('change', e => updateSettings({ collectionTasteEnabled: e.target.checked === true }));
    $('#rh_material_texture').on('change', e => {
        updateSettings({ materialTextureEnabled: e.target.checked === true });
        void import('./materialTexture.js?rmv=1.100.0').then(module => {
            const chat = document.getElementById('chat');
            if (chat)
                module.applyMaterialTextures(chat, undefined, { record: false });
        }).catch(() => { });
    });
    $('#rh_image_backend').on('change', e => { updateSettings({ imageBackend: e.target.value === 'chatu8' ? 'chatu8' : 'baibai' }); renderImageBackendStatus(); });
    const refreshImageLlmStatus = () => $('#rh_image_llm_status').text(imageLlmStatusText(getSettings()));
    $('#rh_image_llm_enabled').on('change', e => { updateSettings({ imageLlmEnabled: e.target.checked === true }); refreshImageLlmStatus(); });
    $('#rh_image_llm_import_current').on('click', async function () {
        const button = $(this);
        button.prop('disabled', true);
        try {
            const imported = await importCurrentConnectionForImageLlm();
            const fresh = getSettings();
            $('#rh_image_llm_enabled').prop('checked', true);
            $('#rh_image_llm_model').val(fresh.imageLlmModel || imported.model || '');
            refreshImageLlmStatus();
            renderImageLlmProfiles(fresh);
            toastr?.success?.(`${__rmT("Xw8mybnJPPw5eqYpaJ.qRxC8iN9vtpxofYUH6Xo8")}${imported.name}`);
        }
        catch (error) {
            toastr?.error?.(`${__rmT("kRBlrNEB595KQ.lAFayP_bV6UuGlNuNIC.ZCqh")}${String(error?.message || error)}`);
        }
        finally {
            button.prop('disabled', false);
        }
    });
    $('#rh_image_llm_profile_refresh').on('click', () => renderImageLlmProfiles());
    $('#rh_image_llm_profile_select').on('change', async (e) => {
        const id = String(e.target.value || '');
        if (!id)
            return;
        try {
            const picked = await selectImageLlmProfile(id);
            const fresh = getSettings();
            $('#rh_image_llm_enabled').prop('checked', true);
            $('#rh_image_llm_model').val(fresh.imageLlmModel || picked?.model || '');
            refreshImageLlmStatus();
            toastr?.success?.(`${__rmT("Xw8mybnJPPw5eqYpaJ.qRcsZiN9vtpxofYUH6Xo8")}${picked?.name || id}`);
        }
        catch (error) {
            toastr?.error?.(`${__rmT("B4sTbxcNeTGUcAiaVpA")}${String(error?.message || error)}`);
            renderImageLlmProfiles();
        }
    });
    $('#rh_image_llm_use_manual').on('click', () => {
        updateSettings({ imageLlmEnabled: true, imageLlmProfileId: '', imageLlmBaseUrl: String($('#rh_image_llm_base').val() || '').trim(),
            imageLlmKey: String($('#rh_image_llm_key').val() || ''), imageLlmModel: String($('#rh_image_llm_model').val() || '').trim() });
        $('#rh_image_llm_enabled').prop('checked', true);
        refreshImageLlmStatus();
        $('#rh_image_llm_profile_select').val('');
        toastr?.info?.(__rmT("Xw8mybnJPPw5eqYpaJ.qRcsZiN9P5aJey9YwqmKq"));
    });
    $('#rh_image_llm_base, #rh_image_llm_key').on('change', () => {
        if (String(getSettings().imageLlmProfileId || ''))
            return;
        updateSettings({ imageLlmBaseUrl: String($('#rh_image_llm_base').val() || '').trim(), imageLlmKey: String($('#rh_image_llm_key').val() || '') });
        refreshImageLlmStatus();
    });
    $('#rh_image_llm_model').on('change', e => { updateSettings({ imageLlmModel: String(e.target.value || '').trim() }); refreshImageLlmStatus(); });
    $('#rh_image_llm_model_select').on('change', e => {
        const value = String(e.target.value || '');
        if (!value)
            return;
        $('#rh_image_llm_model').val(value);
        updateSettings({ imageLlmModel: value });
        refreshImageLlmStatus();
    });
    $('#rh_image_llm_temperature, #rh_image_llm_max_tokens').on('change', () => {
        const temperature = Number($('#rh_image_llm_temperature').val());
        const maxTokens = Number($('#rh_image_llm_max_tokens').val());
        updateSettings({ imageLlmTemperature: Number.isFinite(temperature) ? temperature : 0.8, imageLlmMaxTokens: maxTokens > 0 ? maxTokens : 4096 });
    });
    $('#rh_image_llm_models').on('click', async function () {
        const button = $(this);
        button.prop('disabled', true);
        try {
            const models = await fetchImageLlmModels();
            const select = $('#rh_image_llm_model_select').empty().append($('<option>').val('').text(models.length ? `${__rmT("tB0CyT")}${models.length}${__rmT("fiXSWpqDsGrI06UQOP6EMf")}` : __rmT("JdCzH9HPWN_ivdwkA3xuBq8JgpNi5D7M")));
            for (const model of models)
                select.append($('<option>').val(model).text(model));
            const current = String(getSettings().imageLlmModel || '');
            if (current && models.includes(current))
                select.val(current);
            toastr?.info?.(models.length ? `${__rmT("iFBj8G4JHKG")}${models.length}${__rmT("Uqe0v5ui.Q7Msh")}` : __rmT("1Wp0yndRyoUrilt2nj64K.U79.Znv1iqss9J7vK2vwVE1qKOX4raZTWef8T9uT"));
        }
        catch (error) {
            toastr?.error?.(`${__rmT("PhXpnXJmon8UcAiaVpA")}${String(error?.message || error)}`);
        }
        finally {
            button.prop('disabled', false);
        }
    });
    $('#rh_image_prompt_format').on('change', e => updateSettings({ imagePromptFormat: e.target.value }));
    $('#rh_image_status_refresh').on('click', async () => {
        const output = document.getElementById('rh_image_provider_status');
        try {
            const { getImageBackendStatus } = await import('./baibaiImage.js?rmv=1.100.0');
            const status = await getImageBackendStatus();
            output.textContent = status.configured ? `${__rmT("Y6gzhgW_Qvq80_RlR662E0Cx")}${status.backend || ''} ${status.model || ''}` : (status.reason || __rmT("6HDqFtppAYz__DQIpnZTk0fe.0pEt1jd4e5HLE1azqx8dBunq8_"));
        }
        catch {
            output.textContent = __rmT("iK2qtHbMnWeZNogspahJzq.aJdOYG5t9pPjzUaKPk5yGz3ouJK.Txe9a7kRW65CWuEQY3h");
        }
    });
    $('#rh_visual_tone_mode').on('change', e => updateSettings({ visualToneMode: e.target.value }));
    $('#rh_random_preference_section').on('toggle', function () {
        if (!this.open)
            return;
        renderBlacklistSettings();
        renderFavoriteSettings();
    });
    $('#rh_theater_favorite_section').on('toggle', function () {
        if (!this.open)
            return;
        void renderTheaterFavoriteSettings();
    });
    void renderTheaterFavoriteSettings();
    $('#rh_blacklist_enabled').on('change', e => {
        setBlacklistEnabled(e.target.checked);
        renderBlacklistSettings();
        toastr?.info?.(e.target.checked ? __rmT(".wRbZQNrk4fYAYVw4DD") : __rmT("U4E5kPCquynPvPI3aNZZSnxWnaslWN6N29E"));
    });
    $('#rh_blacklist_summary').on('click', '.rh-blacklist-remove', function () {
        const kind = String($(this).data('kind') || '') === 'format' ? 'format' : 'theme';
        const id = String($(this).data('id') || '');
        if (removeBlacklistItem(kind, id))
            toastr?.success?.(`${__rmT("UnzxUN34Dm_ua0.GVpA")}${id}`);
        renderBlacklistSettings();
        scheduleSettingsToolsRefresh();
    });
    $('#rh_blacklist_clear').on('click', () => {
        clearBlacklist('all');
        renderBlacklistSettings();
        scheduleSettingsToolsRefresh();
        toastr?.success?.(__rmT("2lX0.6eSzFUsrQ_zUSFhLK19JET"));
    });
    $('#rh_favorite_summary').on('change', '.rh-favorite-multiplier', function () {
        const kind = String($(this).data('kind') || '') === 'format' ? 'format' : 'theme';
        const id = String($(this).data('id') || '');
        const multiplier = setFavoriteMultiplier(kind, id, $(this).val());
        if (multiplier == null)
            toastr?.warning?.(`${__rmT("9Pzfjd5vYhy12dKDXbVecTty")}${id}`);
        else
            toastr?.success?.(`${__rmT("eDH1ea1vm9emgYZmRHj_Lk")}${id} ×${multiplier}`);
        renderFavoriteSettings();
        scheduleSettingsToolsRefresh();
    });
    $('#rh_favorite_summary').on('click', '.rh-favorite-remove', function () {
        const kind = String($(this).data('kind') || '') === 'format' ? 'format' : 'theme';
        const id = String($(this).data('id') || '');
        if (removeFavoriteItem(kind, id))
            toastr?.success?.(`${__rmT("qMRE4lB0DbRuFw5D")}${id}`);
        renderFavoriteSettings();
        scheduleSettingsToolsRefresh();
    });
    $('#rh_favorite_clear').on('click', () => {
        clearFavorites('all');
        renderFavoriteSettings();
        scheduleSettingsToolsRefresh();
        toastr?.success?.(__rmT("UnIj_Pdwd00s1UOoTn_"));
    });
    $('#rh_theater_favorite_open_library').on('click', async () => {
        try {
            await openTheaterFavoriteLibrary((container, record) => hydrateIndependentFavoriteHtml(container, record));
        }
        catch (error) {
            toastr?.warning?.(String(error?.message || __rmT("hGH3w0mkoBd6VjK_wMWpUT")));
        }
    });
    $('#rh_theater_favorite_summary').on('click', '.rh-theater-favorite-open', async function () {
        const id = String($(this).data('id') || '');
        try {
            await openTheaterFavoriteViewer(id, (container, record) => hydrateIndependentFavoriteHtml(container, record));
        }
        catch (error) {
            toastr?.warning?.(String(error?.message || __rmT("OTS1_Qzqs0BSMMrX4DD")));
        }
    });
    $('#rh_theater_favorite_summary').on('click', '.rh-theater-favorite-remove', async function () {
        const id = String($(this).data('id') || '');
        try {
            await deleteTheaterFavorite(id);
            toastr?.success?.(__rmT("qwLB1PVkrYU5KczR85A___1YXpjrrk"));
            void renderTheaterFavoriteSettings();
        }
        catch (error) {
            toastr?.warning?.(String(error?.message || __rmT("Uv_.pvu3rCFMsh")));
        }
    });
    const libraryEntryViews = { rh_external_plain_open: 'plain', rh_external_file_open: 'file', rh_external_transfer_open: 'transfer' };
    document.getElementById('rh_lottery_open_library')?.addEventListener('click', () => {
        document.getElementById('rabbit_mirror_theater_settings')?.__rabbitMirrorWorkbench?.navigate?.('library');
    });
    let libraryOpening = false;
    for (const [id, initialView] of Object.entries(libraryEntryViews)) {
        const button = document.getElementById(id);
        const label = button.textContent;
        button.addEventListener('click', async () => {
            if (libraryOpening)
                return;
            libraryOpening = true;
            for (const key of Object.keys(libraryEntryViews))
                document.getElementById(key).disabled = true;
            button.textContent = __rmT("cIFOAP3LfCxo8h");
            try {
                const module = await import('./externalWorldBook/importWizard.js?rmv=1.100.0');
                if (!isCurrentRuntime() || !button.isConnected)
                    return;
                module.openExternalWorldBookImportWizard?.({ initialView });
            }
            catch (error) {
                console.error('[RabbitMirror] library tool failed:', error);
                toastr?.warning?.(__rmT("zHUVd8wur1IEnDDpxgwNIeMjN7WK91J2C1EBjXIFdg5XQXe73J7cB0QbaPttBSkC"));
            }
            finally {
                libraryOpening = false;
                for (const key of Object.keys(libraryEntryViews)) {
                    const entry = document.getElementById(key);
                    if (entry)
                        entry.disabled = false;
                }
                button.textContent = label;
            }
        });
    }
    const setNoSendRegexStatus = (text, tone = '') => {
        $('[data-rh-no-send-regex-status]').text(text).css('opacity', tone === 'ok' ? '.92' : '.78');
    };
    const refreshNoSendRegexStatus = async () => {
        if (getSettings().generationSource !== 'follow') {
            setNoSendRegexStatus(__rmT(".UT7yuUxuRmz2ppB4qK7sKnsgSFYn2nCe8Z7Q_8QhNW8klRpQowvDzyX1.89uT"));
            return;
        }
        setNoSendRegexStatus(__rmT("piA01D9DcwqOb_JOHkSv2_Y7iaIJfLoTm4ZBkf"));
        const result = await inspectRabbitMirrorNoSendRegex();
        if (!result?.available) {
            setNoSendRegexStatus(__rmT("pDUb6b01w_X7x8EAX0l71g2XVLUBc9tEMFFWOIwwbASv8KM_5NE9gi0PkaWpYZJ6ZqO.boi5TtAvn_H9"));
            return;
        }
        if (result.status === 'read-failed')
            setNoSendRegexStatus(__rmT("86Uvrkl8QUgOc_GypspSko2TQKcjgIim9Q09HIsOEs2UKbxQj1gFtovaCPKWVwpLBehwFR_qFsD7thKgf4sTDalONMhET4YO"));
        else if (result.status === 'configured')
            setNoSendRegexStatus(result.disabled === true
                ? __rmT("cReQm1wEhA7G3yjveAZVdIS1Rqoli.mJoT.KpNBZm8TaelTa.JYcbGyBB9sm7zkC") : result.disabled === false ? __rmT("4DnZn8uLYmXT.EHUU50q9PvVTedfZXHQaZNspf") : __rmT("cGIRca5e9HAf4_zQq2v0rWKTp5wqov6_rBYM00aNWKzZkbsgS4DM1RTT0oCoTs.PJ7uIERKG6adaUqkvrwtmGXCQY9pcxf"), result.disabled === false ? 'ok' : '');
        else if (result.status === 'managed-update')
            setNoSendRegexStatus(__rmT("lSRiSIduj2DUlp12RWaiIdttXW8j1eRh8o9qpGpRzAjhz5dRrG8dlMcbQRa5Pswc67788QGP"));
        else if (result.status === 'conflict')
            setNoSendRegexStatus(__rmT("4UoMDBnjiEna9h32jG5IsDA3dNOQhdxNYYNOiqGJf4mnn4WU9JdZWT84UHTaxizT5Xn0P43LY3Y"));
        else
            setNoSendRegexStatus(__rmT("jmCYlN1cXluC80coclwg04UwqPZvio6K29E"));
    };
    $('.rh_regex_configure').on('click', async function () {
        const buttons = $('.rh_regex_configure');
        buttons.prop('disabled', true);
        setNoSendRegexStatus(__rmT("QE8LkN1cXluC80coclwg04UwqPZvio6KZPE"));
        try {
            const result = await configureRabbitMirrorNoSendRegex();
            if (!result?.available) {
                setNoSendRegexStatus(__rmT("FVhxQtmGOEJH2soR0RVKwKV8o.FtMfADNPCpHmhNVHrMUH4_0zRFRpEg7NdeAiJSJONuUnlCY3Y"));
                toastr?.warning?.(__rmT("tszryHBntDHk7tfJRDS.fbgOkMOL.gZ1a2LPFGebgG8"));
            }
            else if (result.status === 'conflict') {
                setNoSendRegexStatus(__rmT("4gfNOge_hvMBtpN0A6q54BHo8tvzkf5VYMqv57xxLGU9pBYyzzDr7f"));
                toastr?.warning?.(__rmT("NCVTruZct3H8.GbLQeGPv.3759yUoo.ALKe1PVVmYmZH10xhdo_XrfcpNbl9uT"));
            }
            else if (!result.ok) {
                const message = result.saveAttempted
                    ? __rmT("RmHTSKGcJHM1kB1WKBxBhpHF9zsKSV_BpAKwNB1KcSskSWcEFCYf0j9HhGK9U8pmudlGnc40AsnZi5sOnwCF0inTBCAcxf") : __rmT("_q2X2ZZM32hVfZ8PN75DD4WqpRivokm88Mr7DjoCe0vDZ6wf3Trw9NuDRXXRQKs58K_5elrwmgfwM1d2fW6I8H.RqJGgyKk5HJTLRf");
                setNoSendRegexStatus(message);
                toastr?.warning?.(message);
            }
            else {
                const message = result.status === 'updated' ? __rmT("OCwNCdJuXN7bX6TzwCSwBE_c_1Qcs7s2") : __rmT("OCwNCdJuXN7bX6TzwCSwBE_cvBLPMxs2");
                const enabledHint = result.disabled === true ? __rmT("MBRrs60OBG6qRq9Rz7fTGo84CftZunKEUmqHYDwaeSJK1qVbLxR5TzdqY.k9uT") : result.disabled === false ? '' : __rmT("pS6TSYo5anCUGNuz31aoIdmtMj8m1YQhEXP93lOueO1Gb.DjGQ781E0zW.DRNGEba7G.8HGP");
                const listHint = __rmT("Je84okyj6IrlyOoXZLhqQB7Hcym.UoD_bT40xrzyAHmlVX2hcZlr7f");
                const notice = `${message} ${enabledHint} ${listHint}`.replace(/\s+/g, ' ').trim();
                setNoSendRegexStatus(`✓ ${notice}`, result.disabled === false ? 'ok' : '');
                toastr?.[result.disabled === false ? 'success' : 'warning']?.(notice);
            }
        }
        catch (error) {
            console.error('[RabbitMirror] regex auto-config failed:', error);
            setNoSendRegexStatus(__rmT("D2ipJdnPHLy1niH3_67nPP57cOLF76Aqnekl9tsJHq4sCplRq8_"));
            toastr?.warning?.(`${__rmT("IkugnGFpWIBUcAiaVpA")}${String(error?.message || error)}`);
        }
        finally {
            buttons.prop('disabled', false);
        }
    });
    $('.rh_regex_open').on('click', async () => {
        const result = await openSillyTavernRegexSettings();
        if (!result?.ok)
            toastr?.warning?.(__rmT("J2.NKr4SFUVQtITzpspSko2TQKcjgIim9Q09HIsOMy1wMi.Qhu6utDVDzCg2kuZgacolJJG79Dk_yICuiUTVGr3JVmHQ84YO"));
        else
            toastr?.info?.(__rmT("RmGX.fmO8eFCvNAB8_t3FbheGcbOkMHj_Y30fkuUJVghYmz4xcesoEuQGiSDs9di2xxIERKGMrUwCV4axiXbSlTrwgpcxf"));
    });
    let nameMaskSaving = null;
    const saveNameMaskLists = async () => {
        if (nameMaskSaving) {
            await nameMaskSaving.catch(() => { });
        }
        nameMaskSaving = doSaveNameMaskLists();
        try {
            await nameMaskSaving;
        }
        finally {
            nameMaskSaving = null;
        }
    };
    const doSaveNameMaskLists = async () => {
        const settings = getSettings();
        const rules = normalizeNameMaskRules(parseRabbitMirrorReplacementLines($('#rh_name_mask_rules').val()));
        const cardKey = String($('#rh_name_mask_card_rules').attr('data-card-key') || '');
        const byCard = { ...(settings.nameMaskRulesByCard || {}) };
        if (cardKey) {
            const cardRules = normalizeNameMaskRules(parseRabbitMirrorReplacementLines($('#rh_name_mask_card_rules').val()));
            if (cardRules.length)
                byCard[cardKey] = cardRules;
            else
                delete byCard[cardKey];
        }
        updateSettings({ nameMaskRules: rules, nameMaskRulesByCard: byCard });
        $('#rh_name_mask_save').prop('disabled', true);
        $('#rh_name_mask_status').text(__rmT("cIFOAEHguFOo8h"));
        const same = (left, right) => JSON.stringify(left || []) === JSON.stringify(right || []);
        let result = { ok: false, reason: '' };
        try {
            result = await saveSettingsNowAndVerify(saved => same(saved.nameMaskRules, rules)
                && (!cardKey || same(saved.nameMaskRulesByCard?.[cardKey], byCard[cardKey])));
        }
        catch (error) {
            result = { ok: false, reason: String(error?.message || error) };
        }
        $('#rh_name_mask_save').prop('disabled', false);
        refreshNameMaskCardUi();
        if (result.ok)
            $('#rh_name_mask_status').text(`${__rmT("oe0L00.ZWN33lLByBM0Bn5ajWGn.8nAP")}${rules.length}${__rmT("7ac8YEgUJXBAAfKGgPD")}${cardKey ? (byCard[cardKey] || []).length : 0}${__rmT("tMtBku4WBoQIj5KBP4EwZbo2c4..Z9Jriddqqh")}`);
        else {
            $('#rh_name_mask_status').text(`${__rmT("T8RcYhgNqeqeJa.LtNt_Lk")}${result.reason || __rmT("cHhXcUwjS2T")}${__rmT("aDo_9wf7GVx9JqBlRACtvwgvXI7sgmAmZHpNSnqRtkYkTKPrhRQHzNwxfhkkiTBKrkXMay6UP0pXr52ZX5AFrh")}`);
            toastr?.error?.(__rmT("fxYZQbyzURU1jCrqfGZ1SsX.Vhn0n1EjXuM3qxpIvI0_9YN73cuaoj95BWsNbhQUS9Kh9rmxKQnXPXTzPhWClLGu"));
        }
    };
    $('#rh_name_mask_save').on('click', () => { void saveNameMaskLists(); });
    $('#rh_name_mask_find').on('click', async () => {
        const ctx = nameMaskHostContext();
        if (!nameMaskCardKey(ctx)) {
            $('#rh_name_mask_find_status').text(__rmT("emJOgB.1hiJ2NpvK.orKjji7CGwdBycBWhzspf"));
            return;
        }
        $('#rh_name_mask_find_status').text(__rmT("IkuMZXXvvk6xM7IuJQD"));
        const listed = [...parseRabbitMirrorReplacementLines($('#rh_name_mask_card_rules').val()), ...(getSettings().nameMaskRules || [])]
            .map(rule => typeof rule === 'string' ? rule : rule.find);
        const cardKey = nameMaskCardKey(ctx);
        let candidates = [];
        let extraBooks = [];
        try {
            extraBooks = getObservedWorldInfoBooks().map(item => item.name);
        }
        catch {
            extraBooks = [];
        }
        $('#rh_name_mask_find').prop('disabled', true);
        try {
            candidates = await findNameMaskCandidates(ctx, { exclude: listed, extraBooks });
        }
        catch {
            candidates = [];
        }
        finally {
            $('#rh_name_mask_find').prop('disabled', false);
        }
        if (cardKey !== String($('#rh_name_mask_card_rules').attr('data-card-key') || ''))
            return;
        const list = $('#rh_name_mask_candidate_list').empty().attr('data-card-key', cardKey);
        for (const { name, from, mentions, place } of candidates) {
            const label = $('<label style="display:inline-flex;gap:4px;align-items:center;font-size:13px;"></label>');
            label.append($('<input type="checkbox">').attr('data-name', name).attr('data-mentions', String(mentions || 0)).attr('data-place', place ? 'true' : 'false'))
                .append($('<span></span>').text(name))
                .append($('<small style="opacity:.6;"></small>').text(`${place ? __rmT("94cSZsMIFk.KmQOci2D") : ''}${mentions ? `${from}${__rmT("k1Y4InF3scQBTh")}${mentions}${__rmT("2RWUYk")}` : from}`));
            list.append(label);
        }
        $('#rh_name_mask_candidates').prop('hidden', !candidates.length);
        const mentioned = candidates.filter(item => item.mentions > 0 && !item.place).length;
        const places = candidates.filter(item => item.place).length;
        $('#rh_name_mask_find_status').text(candidates.length ? `${__rmT("hy1zhUc6")}${candidates.length}${__rmT("4JOs1hHz.QJPVrisoXlHcFbjEuqCJk")}${mentioned}${__rmT("ohi4VsDcPiRmdLaaDJs5LySOHx4G3BdpP8x_yc028hWA.ja6xb.D8vjWXXiCL.azra34WlJhBngjwgbDuNJO9Ey4UDl")}${places ? `${__rmT("7os")}${places}${__rmT("uNYYrzlAHiFCXtHwwzUHCajgppgFObbDBEs")}` : ''}` : __rmT("JdUcGcR2GJVNsvTrINTjj4TtkrgDTpHT"));
    });
    $('#rh_name_mask_candidates_mentioned').on('click', () => {
        $('#rh_name_mask_candidate_list input').each((_, el) => { if (Number(el.getAttribute('data-mentions')) > 0 && el.getAttribute('data-place') !== 'true')
            el.checked = true; });
    });
    $('#rh_name_mask_candidates_all').on('click', () => { $('#rh_name_mask_candidate_list input').prop('checked', true); });
    $('#rh_name_mask_candidates_none').on('click', () => { $('#rh_name_mask_candidate_list input').prop('checked', false); });
    $('#rh_name_mask_candidates_add').on('click', () => {
        if (String($('#rh_name_mask_candidate_list').attr('data-card-key') || '') !== String($('#rh_name_mask_card_rules').attr('data-card-key') || '')) {
            refreshNameMaskCardUi();
            return;
        }
        const picked = $('#rh_name_mask_candidate_list input:checked').map((_, el) => String(el.getAttribute('data-name') || '')).get().filter(Boolean);
        if (!picked.length)
            return;
        const current = String($('#rh_name_mask_card_rules').val() || '').replace(/\s+$/, '');
        $('#rh_name_mask_card_rules').val([current, ...picked.map(name => `${name} => `)].filter(Boolean).join('\n'));
        $('#rh_name_mask_candidate_list input:checked').closest('label').remove();
        if (!$('#rh_name_mask_candidate_list input').length)
            $('#rh_name_mask_candidates').prop('hidden', true);
        void saveNameMaskLists();
    });
    $('#rh_name_mask_block').on('pointerenter focusin', () => {
        const shown = String($('#rh_name_mask_card_rules').attr('data-card-key') || '');
        if (shown !== nameMaskCardKey(nameMaskHostContext()))
            refreshNameMaskCardOnly();
    });
    if (!nameMaskChatListenerBound)
        try {
            const ctx = nameMaskHostContext();
            const type = ctx?.eventTypes?.CHAT_CHANGED || ctx?.event_types?.CHAT_CHANGED;
            if (type && typeof ctx?.eventSource?.on === 'function') {
                ctx.eventSource.on(type, () => refreshNameMaskCardUi());
                nameMaskChatListenerBound = true;
            }
        }
        catch { }
    $('#rh_banned_words_save').on('click', () => {
        const words = normalizeRabbitMirrorBannedWords(parseRabbitMirrorReplacementLines($('#rh_banned_words').val()));
        updateSettings({ rabbitMirrorBannedWords: words });
        $('#rh_banned_words').val(formatRabbitMirrorReplacementLines(words));
        $('#rh_banned_words_status').text(`${__rmT("iFB45T6zHKG")}${words.length} / ${RABBIT_MIRROR_BANNED_WORD_MAX_COUNT}${__rmT("wHJlUTJno43NxSpiMIwnYEtgRmG")}`);
        toastr?.success?.(words.length ? `${__rmT("FOZbUM.3k4nQTnuhgPD")}${words.length}${__rmT("tMtBkYNn0URmNQeMxvqQ9DimSVkXh6S.m5vspf")}` : __rmT("FOZbUM.3k4f78I7I4DD"));
    });
    $('#rh_replacement_add').on('click', () => {
        const find = String($('#rh_replacement_find').val() || '').trim();
        const replace = String($('#rh_replacement_value').val() || '').trim();
        if (!find) {
            toastr?.warning?.(__rmT("cEtRheuQ8CVx6cfz2zliUUw2bNs"));
            return;
        }
        const rules = normalizeRabbitMirrorBannedWords([
            ...parseRabbitMirrorReplacementLines($('#rh_banned_words').val()), { find, replace },
        ]);
        $('#rh_banned_words').val(formatRabbitMirrorReplacementLines(rules));
        $('#rh_banned_words_status').text(__rmT("tGr9Oze_wvSzydOCg7m9vfHgWKwKZE0BpkWZaRS3aD4bBK6DOhsr7f"));
        $('#rh_replacement_find').val('');
        $('#rh_replacement_value').val('');
    });
    void refreshNoSendRegexStatus();
    $('#rh_copy_regex').on('click', async () => {
        try {
            await navigator.clipboard.writeText(noSendRegex);
            toastr?.success?.(__rmT("UnIb7bL1LhHp4fcfVXk"));
        }
        catch (error) {
            const textarea = document.createElement('textarea');
            textarea.value = noSendRegex;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
            toastr?.success?.(__rmT("UnIb7bL1LhHp4fcfVXk"));
        }
    });
    $('#rh_storage_cleanup_refresh').on('click', () => renderStorageCleanup());
    $('#rh_storage_cleanup_all_scan').on('click', async () => {
        const ctx = nameMaskHostContext();
        allChatsCleanupPlan = null;
        $('#rh_storage_cleanup_all_run').prop('hidden', true);
        $('#rh_storage_cleanup_all_scan').prop('disabled', true);
        $('#rh_storage_cleanup_all_stop').prop('hidden', false);
        $('#rh_storage_cleanup_all_status').text(__rmT("mbdy00ZnJYSKANAV1OiQPZjUL2s"));
        allChatsCleanupAbort = new AbortController();
        try {
            const plan = await scanAllChatsForCleanup(ctx, { signal: allChatsCleanupAbort.signal, onProgress: ({ done, total }) => $('#rh_storage_cleanup_all_status').text(`${__rmT("nHLZz1Bd6EaMrlBq")}${done} / ${total}${__rmT("Uqe0vcapVHHo8h")}`) });
            if (allChatsCleanupAbort?.signal.aborted) {
                $('#rh_storage_cleanup_all_status').text(__rmT("2lmMSNc5253YxdDiV_Yf93WfbNs"));
                return;
            }
            allChatsCleanupPlan = plan;
            const parts = [`${__rmT("ZTHGoKz990J38M7GgPD")}${plan.chats}${__rmT("4JOs1EF45L7U8CXxDp_3fI03rHqCJk")}${plan.checked}${__rmT("2RWi3f")}`];
            if (plan.unreadable)
                parts.push(`${plan.unreadable}${__rmT("3I1SPpB_j_g.p.tgX_jdqP6AFOVjbAbD6F2KYhOjr0LxiE6MA5JUHW_x")}`);
            parts.push(plan.items.length ? `${__rmT("f8BocgtypwhT1_Bq")}${formatCleanupBytes(plan.freeable)}` : __rmT("xhV2oMa.eigH4d.eSEf"));
            $('#rh_storage_cleanup_all_status').text(parts.join(__rmT("7os")) + __rmT("jzk"));
            $('#rh_storage_cleanup_all_run').prop('hidden', !plan.items.length);
        }
        catch (error) {
            $('#rh_storage_cleanup_all_status').text(`${__rmT("sGk2cysSn_BNyt5D")}${String(error?.message || error).slice(0, 80)}${__rmT("ueaZYGi24mdc8d.e4DD")}`);
        }
        finally {
            $('#rh_storage_cleanup_all_scan').prop('disabled', false);
            $('#rh_storage_cleanup_all_stop').prop('hidden', true);
            allChatsCleanupAbort = null;
        }
    });
    $('#rh_storage_cleanup_all_stop').on('click', () => { allChatsCleanupAbort?.abort(); });
    $('#rh_storage_cleanup_all_run').on('click', () => {
        if (!allChatsCleanupPlan?.items?.length)
            return;
        const freed = applyAllChatsCleanup(allChatsCleanupPlan, nameMaskHostContext());
        allChatsCleanupPlan = null;
        $('#rh_storage_cleanup_all_run').prop('hidden', true);
        $('#rh_storage_cleanup_all_status').text(`${__rmT("CgJRwrPL3ZW5sY9DDD6dHT")}${formatCleanupBytes(freed)}${__rmT("jzk")}`);
        toastr?.success?.(`${__rmT("AMSwAZsy8p8vBBefeOQT2414CIhI64fBN1qsCJRaiHGbCmOnm2_")}${formatCleanupBytes(freed)}${__rmT("jzk")}`);
        if ($('#rh_storage_cleanup_list input').length)
            renderStorageCleanup();
    });
    $('#rh_storage_cleanup_run').on('click', async () => {
        const ids = $('#rh_storage_cleanup_list input:checked').map((_, el) => String(el.getAttribute('data-cleanup-id') || '')).get().filter(Boolean);
        if (!ids.length) {
            $('#rh_storage_cleanup_status').text(__rmT("T8yI.ugT_pBlX2LqkG2pUT"));
            return;
        }
        const risky = measureStorageCleanup().filter(item => !item.safe && ids.includes(item.id)).map(item => item.label);
        if (risky.length && !globalThis.confirm?.(`${__rmT("xgiOsLCBTGvN_tLq5s4HGEjzeoShz3n83mcpPWPUB1mUeAnZc6_")}${risky.join('\n')}${ids.includes('all-image-prompts') ? __rmT("E7DXtRXnwRPN7n193Uie6H3a59tYou9TaxjMYDoo24OVJFON34KrJ19Evh_9uT") : ''}${__rmT("Qm6YQKfepwSfVmWD")}`)) {
            $('#rh_storage_cleanup_status').text(__rmT("2lKTSC3c253YxdDiV_Yf93WfbNs"));
            return;
        }
        $('#rh_storage_cleanup_run').prop('disabled', true);
        $('#rh_storage_cleanup_status').text(__rmT("Mr80UU.OeJ6KmoWTEWrNeAlahjP484Eg"));
        try {
            const prepared = await prepareStorageCleanup(ids);
            const result = runStorageCleanup(ids);
            renderStorageCleanup();
            const note = result.failed ? `${__rmT("7os")}${result.failed}${__rmT("xBEsDL7I.XZellLpm_L41d9D4GxfQHXB2uE7TMfv")}` : !prepared.available ? __rmT("EK2xkLjTrHQORuRe205zXMEy27HU8_JFTbE6LtwmicCr7w77vCPaZVAiYEs") : ids.includes('covered') ? __rmT("jU9byiY4Xl1RQ8RbXnT295LO8gB_WzPhRo8") : '';
            $('#rh_storage_cleanup_status').text(`${__rmT("RAGCAb4WHKG")}${formatCleanupBytes(result.freed)}${__rmT("UzGgS01FSoYJuexD3Xcpx5Cx")}${formatCleanupBytes(result.before)} → ${formatCleanupBytes(result.after)}${__rmT("eXs")}${note}`);
            if (result.freed > 0)
                toastr?.success?.(`${__rmT("7ZhqIyced2cBTh")}${formatCleanupBytes(result.freed)}${__rmT("jzk")}`);
            else
                toastr?.info?.(__rmT("Yt.B9ET6Cgv7tHyfHdW8wTOUHdKfLnj16P77E9p_VMq62zBhVWDcM8FOIxSmlVE6YFm.782wZONLL3Notov.RQuc1zkvHgkHYgOXmDpFMk_vKMiJQJ0sDgHBeiZg5sYU0XkAovdX1OSVNjXF8.aWuPvN1Fg4PfKKt6r1n56CC_.gQjRw"));
        }
        catch {
            $('#rh_storage_cleanup_status').text(__rmT("hqGFl2JrwRLze7Vv7WldaL9D7SGwwlr6.X0Df932xnmFENdkbOvB18cpAh_9uT"));
        }
        finally {
            $('#rh_storage_cleanup_run').prop('disabled', false);
        }
    });
    $('#rh_storage_cleanup_run').prop('hidden', true);
    $('#rh_clear_last').on('click', () => {
        clearLastCombo();
        toastr?.success?.(__rmT("oehyPTobpQ3xaa2pgqz8bGDFsp3c1AOA"));
    });
    $('#rh_clear_injection').on('click', () => {
        clearRabbitMirrorPrompt('manual');
        toastr?.success?.(__rmT("2lX0.6eSlQbuaW8xik6.Y4nZrE8"));
    });
    if (settings.memoryScanEnabled || (settings.memoryProviderIds || []).length) {
        $('#rh_memory_scan_results').html(__rmT("IIuqIu9ZkJvJjzYCuhY7Vy_9iH0.6qdP7bUkrl8ZfvpOMcEDa5pJmzIPHL29G6WTJ_qNGgXmbGHmloBKtVi6oUjvQj_pL.5UT78eh5nMrL.jsGIeoOJ2kyokBSQP5Z.JCgxH1KrBfQ65Mam9sB._oXsjZY7fDSNmy.5FVWjOrGGWvUjabYfALjq03FGI0DTp628Dr9LCvcnBf6ZSFjQVkeRqjm8ryxy.V7ZIGH5h7MsO32ZK5mE3Q4AnXDDcZG45Wx_WEnKwThw0fqaW9AFmjmAKur4EAhRLk9f"));
    }
    const renderManualEntryDiagnostic = () => {
        const state = getManualEntryDiagnosticState();
        $('#rh_manual_diag_start').prop('disabled', state.active);
        $('#rh_manual_diag_stop').prop('disabled', !state.active);
        $('#rh_manual_diag_copy').prop('disabled', !state.report);
        $('#rh_manual_diag_output').val(state.report).prop('hidden', !state.report);
        $('#rh_manual_diag_status').text(state.active ? __rmT("HExVhgscFH4hBrQgTQQe_zro9zSemVfIkuZenW6xKB8dYHd26jT0oq735os0N4Na_XrnrZLMALsIGAkQ3T2yiFW98HCcxf") : state.report ? __rmT("ZYX_yw9J7.Itopn8vjBzK_T55xJbGIe.PmfM3QOsE_w0gQyNOXqzrOzyLxC9uT") : __rmT("CeCOHdRLu9TRCzG__puiPH10KAYGk7s2"));
    };
    $('#rh_manual_diag_start').on('click', () => { startManualEntryDiagnostic(); renderManualEntryDiagnostic(); });
    $('#rh_manual_diag_stop').on('click', () => { stopManualEntryDiagnostic(); renderManualEntryDiagnostic(); });
    $('#rh_manual_diag_copy').on('click', async () => {
        const report = getManualEntryDiagnosticState().report;
        if (!report)
            return;
        try {
            await navigator.clipboard.writeText(report);
            $('#rh_manual_diag_status').text(__rmT("SQ5Tz6TnrEXhlof1"));
        }
        catch {
            const output = document.getElementById('rh_manual_diag_output');
            output?.focus();
            output?.select();
            let copied = false;
            try {
                copied = document.execCommand('copy');
            }
            catch { }
            $('#rh_manual_diag_status').text(copied ? __rmT("SQ5Tz6TnrEXhlof1") : __rmT("vqfz6Zf0mYM1niH3_67g3PTgKTyiJfCgqd4iWsbB5BwGdaOmq8_"));
        }
    });
    renderManualEntryDiagnostic();
    mountGenerationEvidenceUi(document.getElementById('rabbit_mirror_theater_settings'), getSettings);
    let externalDiagnosticUiRevision = 0;
    const externalDiagnosticStatusText = (state, prefix = __rmT("RkOb.ekc")) => `${prefix}${__rmT("_fpU4DYjWROhg_Bq")}${Number(state?.entries || 0)}${__rmT("v3JQQi8IpwuKaUfQYD.ANWkuXb9Xy5Qq9gwpN9.Yb4.GTfIy")}${Number(state?.externalResources || 0)}${__rmT("_frEI92oNkyxt_Bq")}${Number(state?.externalLoaf || 0)}${__rmT("yFQHYWvPX7lwr4I0gPD")}${Number(state?.stalls || 0)}${__rmT("VnZtm8PWHKG")}${Number(state?.network || 0)}${__rmT("tOIsPDg.TJuaDZo0uNtdHT")}${Number(state?.maintenanceWindows || 0)}`;
    const renderExternalDiagnosticStatus = () => {
        const api = globalThis.__rabbitMirrorExternalDiag;
        const target = $('#rh_external_diag_status');
        if (!target.length)
            return;
        if (!api?.status) {
            target.text(retainedExternalDiagnosticReport && retainedExternalDiagnosticStatus
                ? externalDiagnosticStatusText(retainedExternalDiagnosticStatus, __rmT("2lKcHFImVuuQxqleM4JmCjW_R_E"))
                : __rmT("nMbj_1gfb0g8wj.5mQk2NNF3v.d0af8P_oo7gNb7i6Z.OX2QXD3PGiuyb9d_tfSJWUE"));
            return;
        }
        const state = api.status();
        target.text(externalDiagnosticStatusText(state));
    };
    const ensureExternalDiagnosticApi = async () => {
        const existing = globalThis.__rabbitMirrorExternalDiag;
        if (existing?.status)
            return existing;
        return await globalThis.__rabbitMirrorEnsureExternalDiag?.();
    };
    const renderExternalDiagnosticReport = async () => {
        const api = globalThis.__rabbitMirrorExternalDiag;
        const output = $('#rh_external_diag_output');
        const text = api?.report ? String(api.report() || '') : retainedExternalDiagnosticReport;
        if (!text) {
            toastr?.error?.(__rmT("jMgxDCWDSukYItd0Y.JYVN9mYI1u2fugRxi7OmgBRgD6.ic3XehY3vY4fo8"));
            return '';
        }
        output.val(text).show();
        renderExternalDiagnosticStatus();
        return text;
    };
    $('#rh_external_diag_start').on('click', async () => {
        const revision = ++externalDiagnosticUiRevision;
        const api = await ensureExternalDiagnosticApi();
        if (revision !== externalDiagnosticUiRevision)
            return;
        if (!api) {
            toastr?.error?.(__rmT("Sl.yZfLn59ac8WAqxTpuUXqWLOD"));
            return;
        }
        retainedExternalDiagnosticReport = '';
        retainedExternalDiagnosticStatus = null;
        api.reset?.('user-start');
        $('#rh_external_diag_output').hide().val('');
        renderExternalDiagnosticStatus();
        toastr?.success?.(__rmT("LLfOSoa12ZdUYz61w0CTa9RyiEHE8u4OEAuhlJ8X2KRsWx5vRMQQ1MRuZuZX50l23dB.aAXGNuN8csK44.YRBg9jdDI54D39GyIOTaNERNdSUEeRWg9oLa0wCOK64CI8r6A"));
    });
    $('#rh_external_diag_stop').on('click', () => {
        externalDiagnosticUiRevision += 1;
        const api = globalThis.__rabbitMirrorExternalDiag;
        const report = api?.report?.();
        const status = api?.status?.();
        if (report)
            retainedExternalDiagnosticReport = String(report);
        if (status)
            retainedExternalDiagnosticStatus = { ...status };
        globalThis.__rabbitMirrorDisableExternalDiag?.();
        if (retainedExternalDiagnosticReport)
            $('#rh_external_diag_output').val(retainedExternalDiagnosticReport).show();
        renderExternalDiagnosticStatus();
        toastr?.success?.(retainedExternalDiagnosticReport
            ? __rmT("ANiI2RDlRqRG31E3uU5myBy1tQywf2Lolwfhn69DZmHSkrISbNryZYIrpBwEZpNz") : __rmT("fMkvCoEHNed.Mo74Yh5r_T3OrGkon_QNZjwfT2mSVP1Mpf"));
    });
    $('#rh_external_diag_report').on('click', async () => { await renderExternalDiagnosticReport(); });
    $('#rh_external_diag_copy').on('click', async () => {
        const text = await renderExternalDiagnosticReport();
        if (!text)
            return;
        try {
            await navigator.clipboard.writeText(text);
            toastr?.success?.(__rmT("FmHgzXEErG1M7u13Vb4TwSSMjXBYc4p1l5MuA3aKuiG"));
        }
        catch {
            const output = document.getElementById('rh_external_diag_output');
            output?.focus?.();
            output?.select?.();
            try {
                document.execCommand('copy');
                toastr?.success?.(__rmT("FmHgzXEErG1M7u13Vb4TwSSMjXBYc4p1l5MuA3aKuiG"));
            }
            catch {
                toastr?.error?.(__rmT("OUTKCcQfS1h4jx__UCpoB0hxECuhKU3m"));
            }
        }
    });
    $('#rh_external_diag_reset').on('click', () => {
        clearRecentIndependentTransportDiagnostics();
        const api = globalThis.__rabbitMirrorExternalDiag;
        api?.reset?.('settings-button');
        retainedExternalDiagnosticReport = '';
        retainedExternalDiagnosticStatus = null;
        $('#rh_external_diag_output').hide().val('');
        renderExternalDiagnosticStatus();
        toastr?.success?.(api ? __rmT("HMnb2cwBAdew1hNbgXBM_pWI.xtuuQcMbUCRlGwxVP1Mpf") : __rmT("6b6qDbVShEim_CR6WOBwZ_dqlQiGWf9Kp0wA3f"));
    });
    renderExternalDiagnosticStatus();
    installTtDiagnosticEntry();
    $('#rh_reset').on('click', async () => {
        try {
            await resetSettingsAndSaveNow();
        }
        catch {
            resetSettings();
            await new Promise(resolve => setTimeout(resolve, 1800));
        }
        location.reload();
    });
    mountSettingsAppearance(document.getElementById('rabbit_mirror_theater_settings'), {
        onNavigate(page) {
            if (page === 'books')
                renderWorldInfoBookSettings({ current: true, all: false });
            if (page === 'connection')
                renderProfileOptions({ force: true });
            if (page === 'early') {
                try {
                    globalThis.__rabbitMirrorRenderEarlyBodySettings?.();
                }
                catch { }
            }
            if (page === 'preferences') {
                renderBlacklistSettings();
                renderFavoriteSettings();
                void renderTheaterFavoriteSettings();
            }
            if (page === 'library') {
                void import('./externalWorldBook/importWizard.js?rmv=1.100.0').then(module => {
                    module.mountMotherLibraryManager?.(document.getElementById('rh_external_inline_manage'));
                });
            }
        },
    });
    $('#rabbit_mirror_theater_settings').attr('data-rabbit-mirror-ui-ready', 'true');
    if (getSettings().noSendRegexAutoConfigured !== true) {
        setTimeout(() => {
            void configureRabbitMirrorNoSendRegex().then(result => {
                if (!result?.available || ['read-failed', 'save-failed', 'verification-failed'].includes(result.status))
                    return;
                updateSettings({ noSendRegexAutoConfigured: true });
                if (result.status === 'created' || result.status === 'updated')
                    toastr?.success?.(__rmT("RNX4b24ec8bAe97nR1eBRVKBl23NoJRbQ4.6o.OkUWR4rE74N9E5nGIzjecFnSkC"), __rmT("9.JSSv1i"));
            }).catch(() => { });
        }, 6000);
    }
    if (settings.externalWorldBookRandomEnabled === true) {
        setTimeout(() => {
            void import('./externalWorldBook/serverBackup.js?rmv=1.100.0').then(module => module.checkMotherLibraryServerBackupOnStartup({
                open: () => {
                    const workbench = document.getElementById('rabbit_mirror_theater_settings')?.__rabbitMirrorWorkbench;
                    workbench?.open?.();
                    workbench?.navigate?.('library');
                },
            })).catch(() => { });
        }, 6000);
    }
    setTimeout(() => {
        void import('./favoriteServerBackup.js?rmv=1.100.0').then(module => module.checkFavoriteServerBackupOnStartup()).catch(() => { });
    }, 8000);
    finishUiInit?.({ outcome: 'mounted' });
}
export function destroyRabbitMirrorUI() {
    try {
        removeUserSkin();
    }
    catch { }
    stopBackfill();
    destroyRabbitMirrorMobileModals();
    destroyGenerationEvidenceUi();
    destroySettingsAppearance(document.getElementById('rabbit_mirror_theater_settings'));
    memoryWorldBookDirectorySequence += 1;
    memoryWorldBookDirectory = [];
    memoryWorldBookDirectoryLoaded = false;
    memoryWorldBookDirectoryBusy = false;
    invalidateIndependentModelPull();
    beginIndependentConnectionOperation();
    try {
        globalThis.__rabbitMirrorTtDiagnosticUiCleanup?.();
    }
    catch { }
    try {
        globalThis.__rabbitMirrorQuickStartUiCleanup?.();
    }
    catch { }
    globalThis.__rabbitMirrorQuickStartUiCleanup = null;
    try {
        globalThis.__rabbitMirrorTagFilterScanUiCleanup?.();
    }
    catch { }
    globalThis.__rabbitMirrorTagFilterScanUiCleanup = null;
    $('#rh_advanced_modal, #rh_world_info_prompt_modal, #rh_independent_tag_filter_modal').remove();
    try {
        document.getElementById('rh_external_worldbook_import_modal')?.remove?.();
    }
    catch { }
    if (uiMountRetryTimer) {
        clearTimeout(uiMountRetryTimer);
        uiMountRetryTimer = 0;
    }
    uiMountRetryCount = 0;
    try {
        globalThis.__rabbitMirrorTokenMeterUiCleanup?.();
    }
    catch { }
    try {
        globalThis.__rabbitMirrorBlacklistUiCleanup?.();
    }
    catch { }
    globalThis.__rabbitMirrorBlacklistUiCleanup = null;
    globalThis.__rabbitMirrorTokenMeterUiCleanup = null;
    try {
        globalThis.__rabbitMirrorIndependentApiDiagnosticUiCleanup?.();
    }
    catch { }
    globalThis.__rabbitMirrorIndependentApiDiagnosticUiCleanup = null;
    try {
        globalThis.__rabbitMirrorWorldInfoBooksUiCleanup?.();
    }
    catch { }
    globalThis.__rabbitMirrorWorldInfoBooksUiCleanup = null;
    resetWorldInfoBookUiState();
    $('#rabbit_mirror_theater_settings').remove();
}
function renderSourceProfileControls(settings) {
    $('#rh_sampling_mode').val(settings.samplingMode || 'classic');
    $('#rh_raw_policy').val(settings.rawPolicy || 'balanced');
    checked('#rh_user_directive', settings.userDirectivePriority);
    checked('#rh_worldview_lock', settings.presentationWorldviewLock === true);
    checked('#rh_creative_expansion', settings.creativeExpansionMode);
    const visualSceneryMode = settings.visualSceneryCombination ? 'combined' : settings.forceVisualScenery ? 'scenery' : 'ordinary';
    $(`input[name="rh_visual_scenery_mode"][value="${visualSceneryMode}"]`).prop('checked', true);
    checked('#rh_builtin_image', settings.builtinImageEnabled === true);
    checked('#rh_material_texture', settings.materialTextureEnabled === true);
    checked('#rh_web_fonts', settings.webFontsEnabled !== false);
    checked('#rh_desktop_face_zoom', settings.desktopFaceZoom !== false);
    checked('#rh_collection_taste', settings.collectionTasteEnabled !== false);
    $('#rh_image_prompt_format').val(settings.imagePromptFormat);
    $('#rh_visual_tone_mode').val(settings.visualToneMode || (settings.darkVisualMode === true ? 'dark' : 'normal'));
    checked('#rh_memory_scan_enabled', settings.memoryScanEnabled);
    renderMemoryWorldBookBinding();
    checked('#rh_multiface_enabled', settings.rabbitMirrorFaceCount > 1);
    $('#rh_multiface_count').val(String(settings.rabbitMirrorFaceCount > 1 ? settings.rabbitMirrorFaceCount : 2));
    $('#rh_multiface_count_row').prop('hidden', settings.rabbitMirrorFaceCount <= 1);
    $('#rh_multiface_count').prop('disabled', settings.rabbitMirrorFaceCount <= 1);
    $('#rh_multiface_dispatch_row').prop('hidden', settings.rabbitMirrorFaceCount <= 1);
    renderFacePresentationSettings(settings);
    checked('#rh_visual_prompt_enabled', settings.visualPromptEditingEnabled);
    renderVisualPromptStatus(settings);
}
function renderFacePresentationSettings(settings) {
    const modes = normalizePresentationModes(settings.rabbitMirrorPresentationModes);
    const count = settings.rabbitMirrorFaceCount || 1;
    for (let index = 0; index < 5; index += 1) {
        const row = document.querySelector(`[data-rh-presentation-row="${index}"]`);
        if (row) {
            row.hidden = index >= count;
            row.style.display = index < count ? 'flex' : 'none';
        }
        const select = document.getElementById(`rh_face_mode_${index}`);
        if (select) {
            select.value = modes[index];
            select.disabled = index >= count;
        }
    }
    renderFaceDrawSettings(document.getElementById('rh_face_presentation_modes'), settings);
    const percent = Math.max(0, Math.min(100, Math.round(Number(settings.autoLongTextPercent) || 0)));
    const percentInput = document.getElementById('rh_auto_longtext_percent');
    if (percentInput && document.activeElement !== percentInput)
        percentInput.value = String(percent);
    const percentValue = document.getElementById('rh_auto_longtext_percent_value');
    if (percentValue)
        percentValue.textContent = String(percent);
    const source = ['builtin', 'worldbook', 'both'].includes(settings.lotterySource) ? settings.lotterySource : 'builtin';
    const sourceSelect = document.getElementById('rh_lottery_source');
    if (sourceSelect)
        sourceSelect.value = source;
    const builtin = Math.max(0, Math.min(100, Math.round(Number(settings.lotteryBuiltinPercent) || 0)));
    const builtinInput = document.getElementById('rh_lottery_builtin_percent');
    if (builtinInput && document.activeElement !== builtinInput)
        builtinInput.value = String(builtin);
    const builtinValue = document.getElementById('rh_lottery_builtin_percent_value');
    if (builtinValue)
        builtinValue.textContent = String(builtin);
    const builtinRow = document.getElementById('rh_lottery_builtin_row');
    if (builtinRow)
        builtinRow.hidden = source !== 'both';
    const books = document.getElementById('rh_lottery_books');
    if (books)
        books.hidden = source === 'builtin';
    if (source !== 'builtin')
        renderLotteryBooks(settings);
}
const lotteryBooksCache = { list: [], entries: new Map(), open: new Set(), pending: new Set(), rendering: false };
function lotteryBookLabel(book) {
    const found = lotteryBooksCache.list.find(item => String(item.fileId || item.displayName || '') === book);
    return String(found?.displayName || book);
}
function lotterySelectedBooks(settings) {
    if (Array.isArray(settings.lotteryBooks) && settings.lotteryBooks.length)
        return settings.lotteryBooks.slice();
    return [...new Set((settings.lotteryEntries || []).map(entry => entry.book).filter(Boolean))];
}
function lotteryBookEntries(book) {
    return lotteryBooksCache.entries.get(book) || [];
}
function lotteryEntryContent(book, uid) {
    return String(lotteryBookEntries(book).find(entry => String(entry.sourceEntryUid) === String(uid))?.content || '').slice(0, 1800);
}
function lotteryEntryRecord(book, entry) {
    const uid = String(entry.sourceEntryUid || '');
    return { id: `${book}::${uid}`, book, uid, title: entry.title || uid, content: String(entry.content || '').slice(0, 1800) };
}
function renderLotteryBookList() {
    const box = document.getElementById('rh_lottery_book_list');
    if (!box)
        return;
    const query = String(document.getElementById('rh_lottery_book_search')?.value || '').trim().toLocaleLowerCase();
    const selected = new Set(lotterySelectedBooks(getSettings()));
    const books = lotteryBooksCache.list.filter(book => !query || String(book.displayName || book.fileId || '').toLocaleLowerCase().includes(query));
    box.innerHTML = books.length ? books.map(book => {
        const name = String(book.fileId || book.displayName || '');
        const label = String(book.displayName || name);
        return `<label class="rh-lottery-book"><input type="checkbox" data-lottery-book="${escapeHtml(name)}" ${selected.has(name) ? 'checked' : ''}><span>${escapeHtml(label)}</span></label>`;
    }).join('') : __rmT("XN_3cvXXAlXyYyTBTltgFNDeFVbPkXQjuOnQVqZN8Rzukb_gdnDW1R8TWDXuXXcBy4kkq9vevjLnhplhHCS.qkuOxsBQKf");
}
function renderLotteryEntries(settings) {
    const box = document.getElementById('rh_lottery_entries');
    if (!box)
        return;
    lotteryBooksCache.rendering = true;
    try {
        const selected = new Set((settings.lotteryEntries || []).map(entry => entry.id));
        const books = lotterySelectedBooks(settings);
        box.innerHTML = books.map(book => {
            const entries = lotteryBookEntries(book);
            const loaded = lotteryBooksCache.entries.has(book);
            const failed = loaded && lotteryBooksCache.entries.get(book) === null;
            const picked = entries.filter(entry => selected.has(`${book}::${entry.sourceEntryUid}`)).length;
            const allOn = entries.length > 0 && picked === entries.length;
            const rows = !loaded
                ? __rmT("g130j36LGG9Jl.AqjmxfkzmS2VX3Ec.rmsv2003Egu1Nmvei4ST3g3jSFfKFLT.ub77P.V2RZB4uKKcLcV9ukeBH") : failed
                ? __rmT("neS3Jnr51QOVwdL3o9lfGRfh4IosdwW_ERaUwGoOAvqGE3vvYe6KuLUB68WuGNX2EOmPB5dEOp7aNQTdkQ0RatzJJa.TDP3i6uA") : !entries.length
                ? __rmT("neS3Jnr51QOVwdL3o9lfGRfh4IosdwW_ERaUwGoOAvqGE3vvYe6KuLUB68WuGNX2EOmPB5dEM2WoBa6JdMFrvbzJJa.TDP3i6uA") : entries.map(entry => {
                const id = `${book}::${entry.sourceEntryUid}`;
                const on = selected.has(id);
                const content = String(entry.content || '');
                return `<div class="rh-lottery-entry">
                  <button type="button" class="rh-lottery-pick" aria-pressed="${on ? 'true' : 'false'}" data-lottery-entry="${escapeHtml(id)}" data-lottery-book="${escapeHtml(book)}" data-lottery-uid="${escapeHtml(entry.sourceEntryUid)}" data-lottery-title="${escapeHtml(entry.title || '')}">${on ? __rmT("4R66fVkc") : __rmT("7YWH3f")}</button>
                  <details class="rh-lottery-read">
                    <summary>${escapeHtml(entry.title || entry.sourceEntryUid || __rmT("cyZtO1kw"))}</summary>
                    <div class="rh-lottery-source">${escapeHtml((content || __rmT("wiD5oaJFXTFqFoUo4DD")).slice(0, 1800))}${content.length > 1800 ? __rmT("yBtMErVgwl9gjKRdFayNtXbiMk.ZVGbB8kJqqh") : ''}</div>
                  </details>
                </div>`;
            }).join('');
            const tools = entries.length
                ? `<button type="button" class="rh-lottery-all" data-lottery-select-all="${escapeHtml(book)}" data-lottery-all-state="${allOn ? 'on' : 'off'}">${allOn ? __rmT("WFOL6n6D0CG") : __rmT("QD0R9T")}</button>`
                : '';
            return `<details class="rh-lottery-fold" data-lottery-fold="${escapeHtml(book)}" ${lotteryBooksCache.open.has(book) ? 'open' : ''}>
          <summary>
            <i class="rh-lottery-caret" aria-hidden="true"></i>
            <span>${escapeHtml(lotteryBookLabel(book))}</span>
            <small>${entries.length ? `${picked}/${entries.length}` : ''}</small>
            <button type="button" data-lottery-remove-book="${escapeHtml(book)}${__rmT("OJD0hCl7OTCTj4IE4VP1fsJslpg3FXz_O23_GAiNjjs4gTmMZxVF3UbBHy7DGP9YZNSs3p1irj1rGe5eykD3FZcsqJK_M2QdBUVfv1W6ppwcbZI6x9k.T6iXfUPWpFcPODoxmp6LtFrbrdhAMq1lqNwgitHYHYbRNQ98M1lH9IXjrLlvfxsbvRt1DGwu0r9Zxt64Mvdlkhbwv3..jdY")}${tools}${rows}</div>
        </details>`;
        }).join('');
    }
    finally {
        lotteryBooksCache.rendering = false;
    }
}
function renderLotteryBooks(settings) {
    renderLotteryBookList();
    renderLotteryEntries(settings);
    for (const book of lotterySelectedBooks(settings)) {
        if (!lotteryBooksCache.entries.has(book) && !lotteryBooksCache.pending.has(book))
            void openLotteryBook(book);
    }
    if (!lotteryBooksCache.list.length && !lotteryBooksCache.pending.has('')) {
        lotteryBooksCache.pending.add('');
        void listHostWorldBooks().then(list => {
            lotteryBooksCache.list = Array.isArray(list) ? list : [];
            renderLotteryBookList();
            renderLotteryEntries(getSettings());
        }).catch(() => {
            const box = document.getElementById('rh_lottery_book_list');
            if (box)
                box.textContent = __rmT("yiBNQBRbjCI1MEopQ3moGxwjX2nrrk");
        }).finally(() => lotteryBooksCache.pending.delete(''));
    }
}
async function openLotteryBook(book) {
    if (lotteryBooksCache.pending.has(book))
        return;
    if (lotteryBooksCache.entries.has(book)) {
        renderLotteryEntries(getSettings());
        return;
    }
    lotteryBooksCache.pending.add(book);
    try {
        const normalized = await readHostWorldBook({ fileId: book, displayName: book });
        lotteryBooksCache.entries.set(book, Array.isArray(normalized?.entries) ? normalized.entries : []);
    }
    catch {
        lotteryBooksCache.entries.set(book, null);
    }
    finally {
        lotteryBooksCache.pending.delete(book);
    }
    renderLotteryEntries(getSettings());
}
function nameMaskHostContext() {
    try {
        return globalThis.SillyTavern?.getContext?.() || null;
    }
    catch {
        return null;
    }
}
function refreshNameMaskCardOnly() {
    const box = $('#rh_name_mask_card_rules');
    const shownKey = String(box.attr('data-card-key') || '');
    const shownSaved = formatRabbitMirrorReplacementLines(shownKey ? getSettings().nameMaskRulesByCard?.[shownKey] || [] : []);
    if (shownKey && String(box.val() || '') !== shownSaved) {
        $('#rh_name_mask_status').text(__rmT("PVvf15ggidsS_LVg5BQHcq0HdNhn0RcNC0BMd30eeneuy9bz1ZuHQQE3JMIiA6Ru7zWeUzlAY3Y"));
        return;
    }
    const ctx = nameMaskHostContext();
    const cardKey = nameMaskCardKey(ctx);
    $('#rh_name_mask_card_label').text(cardKey ? nameMaskCardLabel(ctx) || __rmT("rHZnAGffKeh") : __rmT("NOkHwdjVJPZRgaQfK1gtLk"));
    box.attr('data-card-key', cardKey).prop('disabled', !cardKey)
        .val(formatRabbitMirrorReplacementLines(cardKey ? getSettings().nameMaskRulesByCard?.[cardKey] || [] : []));
}
function refreshNameMaskCardUi() {
    const settings = getSettings();
    const ctx = nameMaskHostContext();
    const cardKey = nameMaskCardKey(ctx);
    $('#rh_name_mask_rules').val(formatRabbitMirrorReplacementLines(settings.nameMaskRules || []));
    $('#rh_name_mask_card_label').text(cardKey ? nameMaskCardLabel(ctx) || __rmT("rHZnAGffKeh") : __rmT("NOkHwdjVJPZRgaQfK1gtLk"));
    $('#rh_name_mask_card_rules').attr('data-card-key', cardKey).prop('disabled', !cardKey)
        .val(formatRabbitMirrorReplacementLines(cardKey ? settings.nameMaskRulesByCard?.[cardKey] || [] : []));
    $('#rh_name_mask_candidates').prop('hidden', true);
    $('#rh_name_mask_candidate_list').empty();
    $('#rh_name_mask_find_status').text('');
    const cardCount = cardKey ? (settings.nameMaskRulesByCard?.[cardKey] || []).length : 0;
    $('#rh_name_mask_status').text(`${__rmT("FItNHec6")}${(settings.nameMaskRules || []).length}${__rmT("7ac8YEgUJXBAAfKGgPD")}${cardCount}${__rmT("7ac8YEE9K0AYMj7SgPD")}${NAME_MASK_MAX_RULES}${__rmT("qGtBWWZp")}`);
}
function renderStorageCleanup() {
    const list = $('#rh_storage_cleanup_list');
    if (!list.length)
        return;
    const checked = new Set(list.find('input').length
        ? list.find('input:checked').map((_, el) => String(el.getAttribute('data-cleanup-id') || '')).get()
        : measureStorageCleanup().filter(item => item.safe).map(item => item.id));
    list.empty();
    for (const item of measureStorageCleanup()) {
        const row = $('<label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;line-height:1.45;"></label>');
        const box = $('<input type="checkbox" style="margin-top:3px;">').attr('data-cleanup-id', item.id).prop('checked', checked.has(item.id));
        const text = $('<span></span>');
        const partial = item.id === 'covered' || item.id === 'image-prompts';
        text.append($('<b></b>').text(`${item.label}${__rmT("jSk")}${partial ? `${__rmT("2uvZzIBe3t6WlEBq")}${formatCleanupBytes(item.bytes)}` : formatCleanupBytes(item.bytes)}`));
        if (!item.safe)
            text.append($('<span style="color:#d9822b;font-size:12px;"></span>').text(item.id === 'all-image-prompts' ? __rmT("g_MMvDtbHmRfliVi") : __rmT(".AL0c0KnpM7zHf")));
        if (item.detail)
            text.append($('<br>')).append($('<small style="color:#7fb3d5;"></small>').text(item.detail));
        text.append($('<br>')).append($('<small style="opacity:.7;"></small>').text(item.note));
        row.append(box, text);
        list.append(row);
    }
    let all = 0;
    try {
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            all += (String(key).length + String(localStorage.getItem(key) || '').length) * 2;
        }
    }
    catch { }
    $('#rh_storage_cleanup_run').prop('hidden', false);
    $('#rh_storage_cleanup_refresh').text(__rmT("OVHiFBWWQUp"));
    $('#rh_storage_cleanup_usage').text(`${__rmT("vDfth4AqX7__ufustswJ54Cx")}${formatCleanupBytes(rabbitMirrorLocalBytes())}${all ? `${__rmT("CtGWHPH58H01JB0IOjhoB4YdKYe0M0AP")}${formatCleanupBytes(all)}${__rmT("Vc5GVw.K5_VFPmuS5Zq69jdfXk.jViPBKedqqh")}` : ''}${__rmT("jzk")}`);
}
