import { rmT as __rmT } from "./textTable.js?rmv=1.99.11";
import { presentationModeFields } from './presentationMode.js?rmv=1.99.11';
import { getSettings } from './settings.js?rmv=1.99.11';
import { getCurrentChatKey } from './storage.js?rmv=1.99.11';
import { getRabbitMirrorRecipe } from './blacklist.js?rmv=1.99.11';
import { readFollowPartialResult, replaceFollowPartialResultFace } from './followPartialResults.js?rmv=1.99.11';
import { getSanitizedRabbitMirrorFaceProof, markSanitizedRabbitMirrorFace, rabbitMirrorMultifaceSourceHash, rabbitMirrorMessageSourceHash } from './multifaceProof.js?rmv=1.99.11';
import { parseMultifaceOutput, MULTIFACE_FAILURE_ATTR } from './multifaceProtocol.js?rmv=1.99.11';
import { planRabbitMirrorPromptDetails, renderRabbitMirrorPromptPlan, prepareSelectedMemoryForPrompt, memoryRequestSettingsKey, assertMemoryRequestSettings } from './promptBuilder.js?rmv=1.99.11';
import { hydrateExternalPoolMetadata, getSelectedExternalEntries } from './externalWorldBook/store.js?rmv=1.99.11';
import { refreshRabbitMirrorToolsInScope, isolateRabbitMirrorInteractionIds } from './outputSanitizer.js?rmv=1.99.11';
import { authorizeRabbitMirrorIndependentServiceRequest, assertRabbitMirrorIndependentResponseText } from './independentSecurityGuard.js?rmv=1.99.11';
import { prepareRabbitMirrorAvatarPrompt, rabbitMirrorAvatarPromptIdentity } from './chatAvatarPromptReady.js?rmv=1.99.11';
import { followRetryCombo, recordFollowRetriedFaces } from './followRetryHistory.js?rmv=1.99.11';
import { markFreshDrawSlot } from './freshDrawSlots.js?rmv=1.99.11';
const active = new WeakSet();
const FOLLOW_FACE_RETRY_MAX_WAIT_MS = 10 * 60 * 1000;
const fail = message => { const error = new Error(message); error.rabbitMirrorFollowRetry = true; throw error; };
function connectionIdentity(ctx) {
    const settings = ctx?.chatCompletionSettings || {};
    const modelEntries = Object.keys(settings).filter(key => /(?:^|_)model$/.test(key) && typeof settings[key] === 'string').sort().map(key => [key, settings[key]]);
    return JSON.stringify([ctx?.mainApi, settings.chat_completion_source, modelEntries, settings.custom_url, settings.reverse_proxy]);
}
export async function retryFollowFace(root, suppliedOwner, deps) {
    let message = null, acquired = false;
    try {
        const located = deps.resolveOwner(root);
        if (!located)
            fail(__rmT("TuImAA_z2F3wdlXo13T8S8Coc5Wqyy8vBtayP16NxBEZZ7xIq8_"));
        const { ctx, index } = located;
        message = located.message;
        const details = root?.matches?.('details') ? root : root?.querySelector?.(':scope > details') || root?.closest?.('details');
        const toto = details?.closest?.('toto[data-rabbit-mirror="true"]');
        const proof = getSanitizedRabbitMirrorFaceProof(toto) || getSanitizedRabbitMirrorFaceProof(details);
        const saved = readFollowPartialResult(ctx.chat, index);
        if (!proof || proof.origin !== 'follow' || !saved || proof.faceCount !== parseMultifaceOutput(saved.html).faces.length
            || !saved.failedFaces.some(item => item.faceIndex === proof.faceIndex)) {
            fail(__rmT("DhohomwhYtAGq_ClqzS7mn7w3aJqXgzqEQRYvRm8aM4CQ9ORmRrBJvWt_yYQZLvw7780BrM6kJjtO4gvK0NzaztHVwiG9BYzANA"));
        }
        if (active.has(message))
            fail(__rmT("BHaO4YNqt33hNOn92VG9R9cGMh.ZHCVwrWEaPEFvQtNdp7RuOyqYQFyPLyE9uT"));
        const faceIndex = proof.faceIndex;
        const owner = { ...saved, message };
        const host = details.parentElement?.dataset?.rmSource === 'follow' ? details.parentElement : null;
        const target = host ? details : toto;
        if (!target?.isConnected || !details.hasAttribute(MULTIFACE_FAILURE_ATTR))
            fail(__rmT("gwPjTEuj6RR4oAuWAnzTTtLQzeO0OUInKnLspf"));
        const expectedProofHash = host ? owner.sourceHash : rabbitMirrorMultifaceSourceHash(parseMultifaceOutput(saved.html).faces[faceIndex].html);
        if (proof.sourceHash !== expectedProofHash)
            fail(__rmT("5zOr1gmHSJ6njW5cF.Y85GSrbc_uAxqYXzj4t595gG8"));
        if (suppliedOwner?.mesid != null && Number(suppliedOwner.mesid) !== index)
            fail(__rmT("UsM3gKU1qtzsNQFMlXJTTtLQzeO0OUInKnLspf"));
        const connection = connectionIdentity(ctx), generate = ctx.generateRaw;
        if (typeof generate !== 'function' || ctx.mainApi !== 'openai')
            fail(__rmT("DI94B7Vv962wlLz9b5NKKg4RCwIqKbxHbfzHZ3zTG0vZ5r.i57nyxetedR2UoA7BhnodVFJVorCO4W3x7DnmPohmr6ZG452AaZcYR_FqOHM8l1eUhqICk8Ut"));
        const recipe = getRabbitMirrorRecipe({ chatKey: owner.chatKey, messageIndex: index, swipeId: owner.swipeId, message, faceIndex, includeExternalOnly: true });
        if (!recipe || recipe.faceIndex !== faceIndex || recipe.faces?.length !== proof.faceCount)
            fail(__rmT("v4fAibIpbbTeHMZ.vvFxuRv_twYtfSrbW9f8CSy_vZIKNNzn.VrqJ9cb8oUSEinT6wdJMuGP"));
        let appearanceOwner = null;
        let memorySettingsKey = '';
        const avatarIdentity = rabbitMirrorAvatarPromptIdentity(ctx);
        const assertCurrent = () => {
            const current = deps.getContext();
            if (rabbitMirrorAvatarPromptIdentity(current) !== avatarIdentity
                || current.chat !== ctx.chat || current.chat?.[index] !== message || getCurrentChatKey(current.chat) !== owner.chatKey
                || (Number.isInteger(message.swipe_id) ? message.swipe_id : -1) !== owner.swipeId
                || rabbitMirrorMessageSourceHash(message) !== owner.sourceHash
                || !target.isConnected || getSettings().generationSource !== 'follow'
                || getSettings().enabled === false || getSettings().autoRabbitMirrorInjection === false
                || connectionIdentity(current) !== connection || current.generateRaw !== generate)
                fail(__rmT("vADXVCSWWpNWth37H0s4zoEtl5o2f5zRi3zpgVtix93HWTQZhq5jNxTrzBG"));
            if (deps.hostBusy())
                fail(__rmT("vADXVSPsNH83JkV7UJ2yXXs6aI_J3LX6DKStEj13NHaHfpMDtMDpLXgazBG"));
            if (appearanceOwner?.enabled && (getSettings().appearanceReferenceEnabled !== true || getSettings().appearanceReferenceRevision !== appearanceOwner.revision))
                fail(__rmT("PYEz8c9vlT8Ew1tvWCdfs.OfaNy5YtHPrsGf3GNu.s.E15.Nww34TQyPdXE9uT"));
            if (memorySettingsKey)
                assertMemoryRequestSettings(getSettings(), memorySettingsKey, 'independent');
        };
        assertCurrent();
        active.add(message);
        acquired = true;
        const settings = { ...getSettings(), rabbitMirrorFaceCount: 1 };
        appearanceOwner = { enabled: settings.appearanceReferenceEnabled === true, revision: String(settings.appearanceReferenceRevision || '') };
        if (settings.memoryScanEnabled === true && ((settings.memoryWorldBookEnabled === true && String(settings.memoryWorldBookId || '').trim()) || (Array.isArray(settings.memoryProviderIds) && settings.memoryProviderIds.includes('global:qqj_v3_public_bridge_v1'))))
            memorySettingsKey = memoryRequestSettingsKey(settings, 'independent');
        const avatarReady = prepareRabbitMirrorAvatarPrompt();
        if (avatarReady) {
            await avatarReady;
            assertCurrent();
        }
        const selected = recipe.faces[faceIndex];
        if ([...(selected.themeIds || []), ...(selected.formatIds || []), ...(selected.textIds || [])].some(id => String(id).startsWith('ext:'))) {
            await hydrateExternalPoolMetadata();
            assertCurrent();
        }
        const plan = planRabbitMirrorPromptDetails(settings, 'independent', null, `follow-retry:${index}:${faceIndex}`, { multifaceResay: { faceIndex, faces: recipe.faces, preserveVariation: true, ...(deps.presentationOverride === 'html' || deps.presentationOverride === 'longtext' ? { presentationOverride: deps.presentationOverride } : {}) } });
        let materials = null, appearanceMaterial = null, memoryMaterial, prompt;
        try {
            if (plan.selectedExternalIds.length) {
                materials = await getSelectedExternalEntries(plan.selectedExternalIds);
                assertCurrent();
            }
            if (plan.appearanceReference.enabled) {
                const appearance = await import('./appearanceReference.js?rmv=1.99.11');
                assertCurrent();
                appearanceMaterial = await appearance.loadAppearanceReferenceMaterial(plan.appearanceReference.revision);
                assertCurrent();
            }
            if (plan.memoryWorldBook?.enabled) {
                assertCurrent();
                memoryMaterial = await prepareSelectedMemoryForPrompt(plan.args.settings, { generationType: 'independent', hasSharedMemoryTheme: true });
                assertCurrent();
            }
            prompt = renderRabbitMirrorPromptPlan(plan, materials, appearanceMaterial, memoryMaterial);
        }
        finally {
            materials?.clear?.();
            appearanceMaterial = null;
            memoryMaterial = null;
        }
        if (!prompt.prompt || !prompt.executionLock || prompt.metadata?.disabled)
            fail(__rmT("X199sYw.naHvW.NzWvFHCYmVSheKMzsKBtayP16NxBEZZ7xIq8_"));
        const context = deps.context(ctx, index);
        if (!context.targetVisibleChars)
            fail(__rmT("7whgkg8eS6qeLH2Kr.5V4Xa2bc_uAxqYXzj4t595gG8"));
        const resayNote = String(deps.resayNote || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400);
        const resayNoteBlock = resayNote ? `${__rmT("NyXC.fD..p3FXKe7TM1_Lk")}${JSON.stringify(resayNote)}${__rmT("_jYCB1dUeqGZsdvibXKoMdB9AikMz.cuPryQy6zkYeWUUMfMIUGxS5h9XuhjQgGM1g51__g0BOkvVA_nxRI0tJqkRwGxI4gI1ScVyxPa9FP5ytz4bLiXK8Ut")}` : '';
        const formLine = deps.presentationOverride === 'longtext'
            ? __rmT("LzYReA7uHSL1lLHpTYqtBnRtUaGRyQt09DmbAG6._zzstFm0WtWvSwtfIhwXuC5Xu.x8zLhwk4ctOiU5C5LOpbCgTnC6OxywfCooZ52hvX7_9Z_gEAT0if") : deps.presentationOverride === 'html'
            ? __rmT("Ukd3JuKsggJTj4YIOkoTopTlvSODdtBcKRN_ZGdWoe58r6r3cMx1tbqxuGj2nRZnnamltNBa.UUkNafF7mgXMcgzzKUsax8Qxje9YShqnbF1Up32SUwkjEiQLB.._ON4LhQ9.3Gggx4p.rSzP0un1k") : __rmT("UPgQeAL274H12XmlKyUbfQuG9OZEx2IFJBaOqw0YwtMbd75vt9QR1M3uQuZXheAp8Fl_RKGrChvc4dQZeR8iB0yzeeXgrxxHe3p59IDpjUAPBPXGcpLDu0D0m.x01MRkr6A");
        const messages = [{ role: 'system', content: `${prompt.prompt}${__rmT("pxBnNZe3R4LDejttuKbi2jrzN6EBEBXk0QXpdEsgOrgsFiQbOT7xBhipSIIiZ0KK2vrYAHj_TohF5SYVQ8IRYeAnL0WmhaGViFS8PEzp5GHqYMkJSV9xrd9BU9WI5I3hOTNshIxB_GmSJ979rUIRvzuwwAfp1JDkIhIYbgDf7QJFA_JuprmawirHscDmvci9b8RM6NLpLxOQHtKLa8pn.A5qhbqqHdMp_QWlpBW0ybG5sfcQg3r13E_5cMnVQDq5BkH8LONZhiWyjJ4POSb0oPaJJJnAsDrysmHPRnYO3Ik3.kaIjru4RBxU")}${formLine}${resayNoteBlock}` },
            { role: 'user', content: `${__rmT("syUR1IhTRH2fjJqDYkedQQEoNoB_AW5Sm.2fXdDhQP8")}${context.text}\n\n${prompt.executionLock}${__rmT("UQQZPaH6sp3iafYcMIiOHxq9bNs")}` }];
        if (messages.reduce((n, item) => n + item.content.length, 0) > deps.maxRequestChars)
            fail(__rmT("Fjv56Z_ATeJKLYScXEu6_0fewkTOmv_eBtayP16NxBEZZ7xIq8_"));
        assertCurrent();
        globalThis.toastr?.info?.(`${__rmT("RHgve0Evk6tYABVr8ohRW0voXix1JdfQ3h8Rli8bSCrtnh")}${faceIndex + 1}${__rmT("4JhAxXWitAtFgk7msb_CZX5D7D4rrk")}`);
        let consumed = false;
        const authorized = authorizeRabbitMirrorIndependentServiceRequest({ messages, stream: false }, { consume() { assertCurrent(); if (consumed)
                return false; consumed = true; return true; } });
        let retryTimer = 0;
        const raw = await Promise.race([
            generate({ prompt: authorized.messages, api: ctx.mainApi, quietToLoud: false, trimNames: false }),
            new Promise((_, reject) => { retryTimer = setTimeout(() => reject(new Error(__rmT("3m9Q5o3P9g3UBeCB_bMWXZgRzcioY1kPiMS8V_wqhocBV36VP8no.nCng7KSyEiDEMXrEAZy60Vn4ctXlTmd7y1U7FL9IRoBYH0zTCw9"))), FOLLOW_FACE_RETRY_MAX_WAIT_MS); }),
        ]).finally(() => { if (retryTimer)
            clearTimeout(retryTimer); });
        assertCurrent();
        assertRabbitMirrorIndependentResponseText(raw);
        const parsed = parseMultifaceOutput(String(raw || ''));
        const oneCompleteFrame = parsed.faces.length === 1 && parsed.faces[0].index === 0
            && parsed.errors.length === 1 && parsed.errors[0].code === 'face-count-mismatch';
        if (!oneCompleteFrame || String(raw).includes(MULTIFACE_FAILURE_ATTR))
            fail(__rmT("6r7mRtGpeq.UNYiq_hYTHPb6FusMRgCQbc2rj1grxj0G0DuXq8_"));
        const newDetails = deps.extractReadyDetails(parsed.faces[0].inner);
        if (!newDetails)
            fail(__rmT("kYapBUuTpxcey7Nmg6ff4VxGntmMUBPpfnejKjoI2Yb4Dk6QIh_r7f"));
        const replacement = document.createElement('toto');
        replacement.setAttribute('data-rabbit-mirror', 'true');
        replacement.setAttribute('data-rm-face', String(faceIndex + 1));
        replacement.append(newDetails);
        assertCurrent();
        const updated = replaceFollowPartialResultFace(ctx.chat, index, owner, { expectedHtml: saved.html, faceIndex, html: replacement.outerHTML, appliedRules: getSettings()?.rabbitMirrorBannedWords || [] });
        if (!updated)
            fail(__rmT("1WcHEWGf7cWz_GDp.LzuIYS91DfPZkajsehyf.P.I3K1lKQfqByUBvU56H0tBSkC"));
        markFreshDrawSlot(owner.chatKey, index, owner.swipeId, faceIndex, {
            message, outputIdentity: updated.html,
            getOutputIdentity: () => readFollowPartialResult(ctx.chat, ctx.chat.indexOf(message))?.html || '',
        });
        if (host) {
            if (!deps.replaceExternalFace(host, host.dataset.rmKey, 'follow', updated.html, faceIndex, true))
                fail(__rmT("VD5cdXPN7cWz_9Z_NdnpRLzijFsh7kiEdL846hv4JiC3RixHPjH73_34h2BNNzkC"));
            host.__rabbitMirrorIndependentSource = updated.html;
            refreshRabbitMirrorToolsInScope(host.children[faceIndex]);
        }
        else {
            const frame = parseMultifaceOutput(updated.html).faces[faceIndex];
            markSanitizedRabbitMirrorFace(replacement, { origin: 'follow', faceIndex, faceCount: proof.faceCount, sourceHash: rabbitMirrorMultifaceSourceHash(frame.html), ...presentationModeFields(selected) });
            if (details.open)
                newDetails.open = true;
            isolateRabbitMirrorInteractionIds(replacement);
            target.replaceWith(replacement);
            refreshRabbitMirrorToolsInScope(replacement);
        }
        const historyCombo = followRetryCombo(prompt.metadata, 0, selected);
        if (historyCombo)
            void recordFollowRetriedFaces({ chat: ctx.chat, index, message, html: updated.html, combos: { [faceIndex]: historyCombo } });
        globalThis.toastr?.success?.(`${__rmT("BJgCyT")}${faceIndex + 1}${__rmT("xBi0XzNjgvGtlS3xMldoU7kd7FrzyizhH9RCqwKq")}`);
        return { ok: true, faceIndex };
    }
    catch (error) {
        const message = error?.rabbitMirrorFollowRetry || /^RABBIT_MIRROR_(?:APPEARANCE|MEMORY)_/.test(String(error?.code || '')) ? error.message : __rmT("46vbd801sIeMGpTzXXrtltvzbClc8FPRkTArR64QWK.P_4NPhGW5AQWbKO7VZxnLHtgOzYPwBKAobh");
        globalThis.toastr?.error?.(message);
        return { ok: false, error: message };
    }
    finally {
        if (acquired && message)
            active.delete(message);
    }
}
