import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.3.3";
import { getSettings } from './settings.js?rmv=2.3.3';
import { getCurrentChatKey } from './storage.js?rmv=2.3.3';
import { getRabbitMirrorRecipe } from './blacklist.js?rmv=2.3.3';
import { readFollowPartialResult, saveFollowCompletedRetryResult, replaceFollowPartialResultFace } from './followPartialResults.js?rmv=2.3.3';
import { markSanitizedRabbitMirrorFace, rabbitMirrorMultifaceSourceHash, rabbitMirrorMessageSourceHash } from './multifaceProof.js?rmv=2.3.3';
import { parseMultifaceOutput } from './multifaceProtocol.js?rmv=2.3.3';
import { planRabbitMirrorPromptDetails, renderRabbitMirrorPromptPlan, prepareSelectedMemoryForPrompt, memoryRequestSettingsKey, assertMemoryRequestSettings } from './promptBuilder.js?rmv=2.3.3';
import { hydrateExternalPoolMetadata, getSelectedExternalEntries } from './externalWorldBook/store.js?rmv=2.3.3';
import { refreshRabbitMirrorToolsInScope, isolateRabbitMirrorInteractionIds } from './outputSanitizer.js?rmv=2.3.3';
import { authorizeRabbitMirrorIndependentServiceRequest, assertRabbitMirrorIndependentResponseText } from './independentSecurityGuard.js?rmv=2.3.3';
import { presentationModeFields } from './presentationMode.js?rmv=2.3.3';
import { automaticRerollEnabled, automaticRerollStatusText, configuredAutomaticRerollIdleMs, configuredAutomaticRerollMax, isAutomaticRerollStall, isQuotaInsufficientFailure, isNonRetryableRequestFailure, isLocalPreflightFailure, shouldAutomaticReroll, stallTimeoutError, } from './automaticReroll.js?rmv=2.3.3';
import { mergeMissingIndependentFaces, missingIndexesFromIndependentResult, recipesCoverMissing } from './missingFaceMerge.js?rmv=2.3.3';
import { inspectRabbitMirrorGenerationSource, getRabbitMirrorGenerationSnapshot } from './generationGuard.js?rmv=2.3.3';
import { prepareRabbitMirrorAvatarPrompt, rabbitMirrorAvatarPromptIdentity } from './chatAvatarPromptReady.js?rmv=2.3.3';
import { followRetryCombo, recordFollowRetriedFaces } from './followRetryHistory.js?rmv=2.3.3';
const inFlight = new Set();
const consumeCounts = new Map();
const cancelledOwners = new Set();
function connectionIdentity(ctx) {
    const settings = ctx?.chatCompletionSettings || {};
    const modelEntries = Object.keys(settings).filter(key => /(?:^|_)model$/.test(key) && typeof settings[key] === 'string').sort().map(key => [key, settings[key]]);
    return JSON.stringify([ctx?.mainApi, settings.chat_completion_source, modelEntries, settings.custom_url, settings.reverse_proxy]);
}
function ownerKey(ctx, index) {
    const message = ctx?.chat?.[index];
    return `${getCurrentChatKey(ctx?.chat || [])}\u0000${index}\u0000${Number.isInteger(message?.swipe_id) ? message.swipe_id : -1}\u0000${rabbitMirrorMessageSourceHash(message)}`;
}
function wrapFace(inner, index) {
    return `<toto data-rabbit-mirror="true" data-rm-face="${index + 1}">${String(inner || '')}</toto>`;
}
function followRecipes(ctx, index, expectedCount) {
    const message = ctx.chat?.[index];
    const chatKey = getCurrentChatKey(ctx.chat);
    const swipeId = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
    return Array.from({ length: expectedCount }, (_, faceIndex) => getRabbitMirrorRecipe({
        chatKey, messageIndex: index, swipeId, message, faceIndex, includeExternalOnly: true,
    }) || null);
}
function expectedFollowFaceCount(ctx, index, rejected = null) {
    const partial = readFollowPartialResult(ctx.chat, index);
    if (partial) {
        const parsed = parseMultifaceOutput(partial.html);
        if (parsed.ok)
            return parsed.faces.length;
    }
    if (Number(rejected?.expectedFaceCount) >= 1)
        return Number(rejected.expectedFaceCount);
    const parsed = parseMultifaceOutput(String(ctx.chat?.[index]?.mes || ''), { allowProse: true });
    if (parsed.ok && parsed.faces.length)
        return parsed.faces.length;
    const configured = Number(getSettings().rabbitMirrorFaceCount);
    return Number.isInteger(configured) && configured >= 1 ? configured : 1;
}
export function collectFollowMissingIndexes(ctx, index, deps = {}) {
    const rejected = typeof deps.followBatchFailure === 'function' ? deps.followBatchFailure(ctx.chat, index) : null;
    const expected = expectedFollowFaceCount(ctx, index, rejected);
    const partial = readFollowPartialResult(ctx.chat, index);
    if (partial?.failedFaces?.length) {
        return [...new Set(partial.failedFaces.map(face => Number(face.faceIndex)).filter(faceIndex => Number.isInteger(faceIndex) && faceIndex >= 0 && faceIndex < expected))].sort((left, right) => left - right);
    }
    if (rejected)
        return Array.from({ length: expected }, (_, faceIndex) => faceIndex);
    const mes = String(ctx.chat?.[index]?.mes || '');
    if (/\bdata-rm-face\s*=/i.test(mes)) {
        const parsed = parseMultifaceOutput(mes, { allowProse: true, expectedCount: expected });
        return missingIndexesFromIndependentResult({ html: parsed.ok ? parsed.faces.map(face => face.html).join('\n') : '' }, expected);
    }
    const inspection = inspectRabbitMirrorGenerationSource(mes);
    if (inspection?.complete)
        return [];
    if (__rmR("y1_Ej_nLmB9Zl.lqLtxlkp6SgVXnETKr.Evg0SHEBu13mvuizZTCgujSshKIl1syKumOFaZ9Xw2ecKFLPTiFL0Zs", "i").test(mes))
        return Array.from({ length: expected }, (_, faceIndex) => faceIndex);
    const snapshot = getRabbitMirrorGenerationSnapshot(ctx.chat?.[index], ctx.chat, index);
    if (snapshot && !snapshot.complete)
        return Array.from({ length: expected }, (_, faceIndex) => faceIndex);
    return [];
}
function raceIdle(task, idleMs) {
    const seconds = Math.max(1, Math.round(Number(idleMs || 0) / 1000) || 90);
    let timer = 0;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(stallTimeoutError(Date.now(), seconds)), idleMs);
    });
    return Promise.race([task, timeout]).finally(() => { if (timer)
        clearTimeout(timer); });
}
async function requestFollowMissingFaces(ctx, index, missingIndexes, faces, deps) {
    const message = ctx.chat?.[index];
    const generate = ctx.generateRaw;
    if (typeof generate !== 'function' || ctx.mainApi !== 'openai') {
        const error = new Error(__rmT("IDeQrBck59XfJz.Ij_W5PRxrFXOf21IYvPun8Mx3E50nbFcycrx7EwNE62TyGGRQNjDqN0Mmk7RkhmwWGXvHW9FuDCHmwagBg1MdEWoCg1F4Hq84BJT"));
        error.requestCount = 0;
        throw error;
    }
    const settings = { ...getSettings(), rabbitMirrorFaceCount: Math.max(1, missingIndexes.length) };
    const useRecipes = recipesCoverMissing(faces, missingIndexes);
    const generationContext = useRecipes
        ? { missingFaceRetry: { indexes: missingIndexes, faces } }
        : {};
    let appearanceOwner = { enabled: settings.appearanceReferenceEnabled === true, revision: String(settings.appearanceReferenceRevision || '') };
    let memorySettingsKey = '';
    const avatarIdentity = rabbitMirrorAvatarPromptIdentity(ctx);
    if (settings.memoryScanEnabled === true && ((settings.memoryWorldBookEnabled === true && String(settings.memoryWorldBookId || '').trim()) || (Array.isArray(settings.memoryProviderIds) && settings.memoryProviderIds.includes('global:qqj_v3_public_bridge_v1')))) {
        memorySettingsKey = memoryRequestSettingsKey(settings, 'independent');
    }
    const assertCurrent = () => {
        const current = deps.getContext();
        if (rabbitMirrorAvatarPromptIdentity(current) !== avatarIdentity
            || current.chat !== ctx.chat || current.chat?.[index] !== message || getCurrentChatKey(current.chat) !== getCurrentChatKey(ctx.chat)
            || (Number.isInteger(message.swipe_id) ? message.swipe_id : -1) !== (Number.isInteger(current.chat?.[index]?.swipe_id) ? current.chat[index].swipe_id : -1)
            || rabbitMirrorMessageSourceHash(current.chat?.[index]) !== rabbitMirrorMessageSourceHash(message)
            || getSettings().generationSource !== 'follow' || getSettings().enabled === false || getSettings().autoRabbitMirrorInjection === false
            || connectionIdentity(current) !== connectionIdentity(ctx) || current.generateRaw !== generate) {
            const error = new Error(__rmT("P6bL0DfXYbYTzxNyNakArAVdwRWqyfFGu4evvOOBJedWp.4Ff0lr7f"));
            error.stale = true;
            throw error;
        }
        if (deps.hostBusy()) {
            const error = new Error(__rmT("fH8.aCG78AiHB.Xv_67g3GPUo5mr44_gKcdA9N13ZY9kZGKXq8_"));
            error.cancelled = true;
            throw error;
        }
        if (appearanceOwner?.enabled && (getSettings().appearanceReferenceEnabled !== true || getSettings().appearanceReferenceRevision !== appearanceOwner.revision)) {
            const error = new Error(__rmT("PYEz8c9vlT8Ew1tvWCdfs.OfaNy5YtHPrsGf3GNu.s.E15.NViF1rQyPdXE9uT"));
            error.requestCount = 0;
            throw error;
        }
        if (memorySettingsKey)
            assertMemoryRequestSettings(getSettings(), memorySettingsKey, 'independent');
    };
    assertCurrent();
    const avatarReady = prepareRabbitMirrorAvatarPrompt();
    if (avatarReady) {
        await avatarReady;
        assertCurrent();
    }
    if (useRecipes && missingIndexes.some(faceIndex => [...(faces[faceIndex]?.themeIds || []), ...(faces[faceIndex]?.formatIds || []), ...(faces[faceIndex]?.textIds || [])].some(id => String(id).startsWith('ext:')))) {
        await hydrateExternalPoolMetadata();
        assertCurrent();
    }
    const plan = planRabbitMirrorPromptDetails(settings, 'independent', null, `follow-reroll:${getCurrentChatKey(ctx.chat)}:${rabbitMirrorMultifaceSourceHash(String(ctx.chat?.[index]?.mes || ''))}:${index}:${missingIndexes.join(',')}`, generationContext);
    let materials = null, appearanceMaterial = null, memoryMaterial, prompt;
    try {
        if (plan.selectedExternalIds.length) {
            materials = await getSelectedExternalEntries(plan.selectedExternalIds);
            assertCurrent();
        }
        if (plan.appearanceReference.enabled) {
            const appearance = await import('./appearanceReference.js?rmv=2.3.3');
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
    if (!prompt.prompt || !prompt.executionLock || prompt.metadata?.disabled) {
        const error = new Error(__rmT("X199sYw.naHvW.NzWvFHCYmVSheKMzsKBtayP16NxBEZZ7xIq8_"));
        error.requestCount = 0;
        throw error;
    }
    const context = deps.context(ctx, index);
    if (!context.targetVisibleChars) {
        const error = new Error(__rmT("7whgkg8eS6qeLH2Kr.5V4Xa2bc_uAxqYXzj4t595gG8"));
        error.requestCount = 0;
        throw error;
    }
    const count = missingIndexes.length;
    const messages = [
        { role: 'system', content: `${prompt.prompt}${__rmT("UQQlS.I._MP1ca_vAS9hde0DjFs")}${count}${__rmT("7Lstz095ZWzhiJx9Jp1Mwf4ysHkgKsnuKtaVP62SQnGOvGZXZE9dAeMutX1QoUmh1SMKHhdBdGOPjK460yPvHcTFv_33Ez7zHZStuVuwUo9SfZ_dQLi_eSslAm4PWI7zGmcfVYxI318DHk0kku21.f8Z6ZtFaEhDUcIxd4AzHPXHRMsqrAQsrT")}` },
        { role: 'user', content: `${__rmT("syUR1IhTRH2fjJqDYkedQQEoNoB_AW5Sm.2fXdDhQP8")}${context.text}\n\n${prompt.executionLock}${__rmT("NyKsHlWIMUUqDNz67MnpUT")}` },
    ];
    if (messages.reduce((n, item) => n + item.content.length, 0) > deps.maxRequestChars) {
        const error = new Error(__rmT("Fjv56Z_ATeJKLYScXEu6_0fewkTOmv_eBtayP16NxBEZZ7xIq8_"));
        error.requestCount = 0;
        throw error;
    }
    assertCurrent();
    let consumed = false;
    const authorized = authorizeRabbitMirrorIndependentServiceRequest({ messages, stream: false }, {
        consume() { assertCurrent(); if (consumed)
            return false; consumed = true; return true; },
    });
    const raw = await raceIdle(generate({ prompt: authorized.messages, api: ctx.mainApi, quietToLoud: false, trimNames: false }), configuredAutomaticRerollIdleMs(getSettings()));
    assertCurrent();
    assertRabbitMirrorIndependentResponseText(raw);
    let source = String(raw || '');
    if (count === 1 && !/\bdata-rm-face\s*=/i.test(source)) {
        if (/<toto\b[^>]*\bdata-rabbit-mirror\b/i.test(source))
            source = source.replace(/<toto\b(?=[^>]*\bdata-rabbit-mirror\b)/i, '<toto data-rm-face="1"');
        else if (/^\s*<details\b/i.test(source))
            source = wrapFace(source.trim(), 0);
    }
    const parsed = parseMultifaceOutput(source, count > 1 ? { expectedCount: count } : {});
    if (!parsed.ok && !(count === 1 && parsed.faces.length === 1 && parsed.faces[0].index === 0)) {
        throw new Error(__rmT("0VGFp0LkhKXITWYlVFrDeka4wwHJRgRNR0JTHVdgFbdOaSQX"));
    }
    const filtered = face => {
        if (typeof deps.extractReadyDetails !== 'function')
            return face.details || face.inner || '';
        try {
            return deps.extractReadyDetails(face.inner || face.details || '')?.outerHTML || '';
        }
        catch {
            return '';
        }
    };
    const html = parsed.faces.map((face, local) => wrapFace(filtered(face), local)).join('\n');
    return { html, metadata: prompt.metadata || null, failedFaces: parsed.faces.length < count ? Array.from({ length: count - parsed.faces.length }, (_, local) => ({ faceIndex: parsed.faces.length + local, status: 'failed', code: 'incomplete-face' })) : [] };
}
function mountFollowRetryHtml(ctx, index, html, deps) {
    const message = ctx.chat?.[index];
    const el = deps.messageElement?.(index);
    const host = el?.querySelector?.('[data-rabbit-mirror-external-source="true"][data-rm-source="follow"]');
    const parsed = parseMultifaceOutput(html);
    if (!parsed.ok)
        return false;
    if (host && typeof deps.replaceExternalFace === 'function') {
        parsed.faces.forEach(face => deps.replaceExternalFace(host, host.dataset.rmKey, 'follow', html, face.index, true));
        host.__rabbitMirrorIndependentSource = html;
        refreshRabbitMirrorToolsInScope(host);
        return true;
    }
    const roots = el ? [...el.querySelectorAll('toto[data-rabbit-mirror="true"]')] : [];
    parsed.faces.forEach(face => {
        if (typeof deps.extractReadyDetails !== 'function')
            return;
        const details = deps.extractReadyDetails(face.inner);
        if (!details)
            return;
        const replacement = document.createElement('toto');
        replacement.setAttribute('data-rabbit-mirror', 'true');
        replacement.setAttribute('data-rm-face', String(face.index + 1));
        replacement.append(details);
        isolateRabbitMirrorInteractionIds(replacement);
        markSanitizedRabbitMirrorFace(replacement, {
            origin: 'follow', faceIndex: face.index, faceCount: parsed.faces.length,
            sourceHash: rabbitMirrorMultifaceSourceHash(face.html),
            ...presentationModeFields(followRecipes(ctx, index, parsed.faces.length)[face.index] || {}),
        });
        const existing = roots.find(node => Number(node.getAttribute('data-rm-face')) === face.index + 1);
        if (existing)
            existing.replaceWith(replacement);
        else if (el) {
            const body = el.querySelector?.('.mes_text') || el;
            body.append(replacement);
        }
        refreshRabbitMirrorToolsInScope(replacement);
    });
    return true;
}
export function markFollowAutomaticRerollCancelled(ctx, index) {
    cancelledOwners.add(ownerKey(ctx, index));
}
export async function maybeAutomaticFollowReroll(index, deps) {
    const ctx = deps.getContext();
    if (!Number.isInteger(index) || index < 0 || !ctx?.chat?.[index])
        return false;
    const settings = getSettings();
    if (!automaticRerollEnabled(settings) || settings.generationSource !== 'follow' || settings.enabled === false || settings.autoRabbitMirrorInjection === false)
        return false;
    const key = ownerKey(ctx, index);
    if (cancelledOwners.has(key) || inFlight.has(key) || deps.hostBusy?.())
        return false;
    const missing = collectFollowMissingIndexes(ctx, index, deps);
    if (!missing.length)
        return false;
    const expected = expectedFollowFaceCount(ctx, index, deps.followBatchFailure?.(ctx.chat, index));
    const max = configuredAutomaticRerollMax(settings);
    const failedPosts = Math.max(1, Number(consumeCounts.get(key) || 1));
    consumeCounts.set(key, failedPosts);
    if (!shouldAutomaticReroll({ enabled: true, complete: false, failedPosts, max }))
        return false;
    inFlight.add(key);
    try {
        let retainedHtml = readFollowPartialResult(ctx.chat, index)?.html || '';
        let missingIndexes = missing;
        const faces = followRecipes(ctx, index, expected);
        while (missingIndexes.length) {
            const posts = Math.max(1, Number(consumeCounts.get(key) || 1));
            if (!shouldAutomaticReroll({ enabled: automaticRerollEnabled(getSettings()), complete: false, failedPosts: posts, max: configuredAutomaticRerollMax(getSettings()), stale: false }))
                break;
            globalThis.toastr?.info?.(automaticRerollStatusText(posts, configuredAutomaticRerollMax(getSettings()), missingIndexes.length));
            let incoming;
            try {
                incoming = await requestFollowMissingFaces(ctx, index, missingIndexes, faces, deps);
            }
            catch (error) {
                if (error?.stale || error?.cancelled || isLocalPreflightFailure(error) || isQuotaInsufficientFailure(error))
                    break;
                consumeCounts.set(key, posts + 1);
                if (isAutomaticRerollStall(error)) {
                    globalThis.toastr?.warning?.(__rmT("k8.Ypg73oW7I6yy5S7ub2IcXvxbOlYfpv3qRBSftU2I.gtvxMna96e8KUyjLDRjp1DqURmXhHLe0VgrGRMtfMM5vAGF2ejbiaRQHdXaeO2xFwoWCBJT"));
                    break;
                }
                if (isNonRetryableRequestFailure(error))
                    break;
                if (isQuotaInsufficientFailure(error, { message: error?.message }) || __rmR("H5XbnloVTFz3mS_Yx3VlwKc8oRFpMfpDp2WpKZLNDr8Dx3znceBfVzUZIm._E_8OcyYddZRJ8rh", "i").test(String(error?.message || '')))
                    break;
                continue;
            }
            consumeCounts.set(key, posts + 1);
            const askedIndexes = missingIndexes;
            const merged = retainedHtml && missingIndexes.length
                ? mergeMissingIndependentFaces(retainedHtml, expected, missingIndexes, incoming)
                : incoming;
            retainedHtml = merged.html;
            missingIndexes = missingIndexesFromIndependentResult(merged, expected, missingIndexes);
            const live = deps.getContext();
            const message = live.chat?.[index];
            if (message) {
                const owner = { chatKey: getCurrentChatKey(live.chat), messageIndex: index, swipeId: Number.isInteger(message.swipe_id) ? message.swipe_id : -1, sourceHash: rabbitMirrorMessageSourceHash(message), message };
                const savedFaces = new Set();
                if (!missingIndexes.length) {
                    if (saveFollowCompletedRetryResult(live.chat, index, owner, retainedHtml, getSettings()?.rabbitMirrorBannedWords || []))
                        askedIndexes.forEach(faceIndex => savedFaces.add(faceIndex));
                }
                else {
                    let current = readFollowPartialResult(live.chat, index);
                    if (current) {
                        for (const faceIndex of missing.filter(item => !missingIndexes.includes(item))) {
                            const parsed = parseMultifaceOutput(retainedHtml, { expectedCount: expected });
                            const html = parsed.faces[faceIndex]?.html;
                            const replaced = html ? replaceFollowPartialResultFace(live.chat, index, owner, { expectedHtml: current.html, faceIndex, html, appliedRules: getSettings()?.rabbitMirrorBannedWords || [] }) : null;
                            if (replaced)
                                current = (replaced && typeof replaced === 'object' && typeof replaced.html === 'string') ? replaced : (readFollowPartialResult(live.chat, index) || current);
                            if (replaced && askedIndexes.includes(faceIndex))
                                savedFaces.add(faceIndex);
                        }
                    }
                }
                mountFollowRetryHtml(live, index, retainedHtml, deps);
                const combos = {};
                askedIndexes.forEach((faceIndex, local) => {
                    if (missingIndexes.includes(faceIndex) || !savedFaces.has(faceIndex))
                        return;
                    const combo = followRetryCombo(incoming.metadata, local, faces[faceIndex]);
                    if (combo)
                        combos[faceIndex] = combo;
                });
                if (Object.keys(combos).length)
                    void recordFollowRetriedFaces({ chat: live.chat, index, message, html: retainedHtml, combos });
            }
        }
        return !missingIndexes.length;
    }
    catch (error) {
        console.debug('[RabbitMirror] follow automatic reroll skipped:', error);
        return false;
    }
    finally {
        inFlight.delete(key);
    }
}
