import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=2.1.4";
import { bindRolePaletteCode } from '../roleColorVariants.js?rmv=2.1.4';
import { faceDrawNeedsExternal } from '../faceDrawRules.js?rmv=2.1.4';
import { designSamplingChecksFromHtml } from '../interactionSampling.js?rmv=2.1.4';
import { getRabbitMirrorRecipe } from '../blacklist.js?rmv=2.1.4';
import { claimGenerationEvidence, associateGenerationEvidence, generationEvidenceFor } from '../generationEvidence.js?rmv=2.1.4';
import { createGenerationTimer } from '../generationTiming.js?rmv=2.1.4';
import { isRabbitMirrorManagedChatSurface } from '../hostCompatibility.js?rmv=2.1.4';
import { resolveBehaviorRuleText } from '../behaviorRules.js?rmv=2.1.4';
import { presentationModeFields, hasExplicitTextFace } from '../presentationMode.js?rmv=2.1.4';
import { readCharacterWorldBookContext } from '../characterWorldBook.js?rmv=2.1.4';
import { getSettings } from '../settings.js?rmv=2.1.4';
import { configuredIndependentMaxRequestChars } from '../independentRequestBudget.js?rmv=2.1.4';
import { independentGenerationTiming } from '../independentTiming.js?rmv=2.1.4';
import { prepareRabbitMirrorAvatarPrompt, rabbitMirrorAvatarPromptIdentity } from '../chatAvatarPromptReady.js?rmv=2.1.4';
import { assertRabbitMirrorIndependentResponseBytes, assertRabbitMirrorIndependentResponseText, authorizeRabbitMirrorIndependentServiceRequest, } from '../independentSecurityGuard.js?rmv=2.1.4';
import { parseIndependentAdvancedOptions, buildIndependentAdvancedCarrier, applyIndependentAdvancedExclusions, } from '../advancedRequestOptions.js?rmv=2.1.4';
import { buildRabbitMirrorPromptDetails, planRabbitMirrorPromptDetails, promptPlanSelections, renderRabbitMirrorPromptPlan, prepareSelectedMemoryForPrompt, memoryRequestSettingsKey, assertMemoryRequestSettings, } from '../promptBuilder.js?rmv=2.1.4';
import { getExternalPoolHydrationStatus, getSelectedExternalEntries, hydrateExternalPoolMetadata } from '../externalWorldBook/store.js?rmv=2.1.4';
import { describeExternalWorldBookPreflightFailure } from '../externalWorldBook/errors.js?rmv=2.1.4';
import { cleanRabbitMirrorOutput } from '../outputSanitizer.js?rmv=2.1.4';
import { parseMultifaceOutput, recoverableMultifaceFrames, MULTIFACE_FAILURE_ATTR, normalizedSummaryText, createMultifaceFailureSlot } from '../multifaceProtocol.js?rmv=2.1.4';
import { applyAtmosphereFields, atmosphereNotesFromHtml, stripAtmosphereChoiceMarkup } from '../atmosphereChoice.js?rmv=2.1.4';
import { isLocalPreflightFailure, isQuotaInsufficientFailure, configuredAutomaticRerollMax, automaticRerollEnabled } from '../automaticReroll.js?rmv=2.1.4';
import { scanRabbitMirrorHtml } from '../visualScanner.js?rmv=2.1.4';
import { serialPaletteExecutionReminder } from '../serialPaletteContext.js?rmv=2.1.4';
import { createVisualHistorySelection, resolveVisualHistorySelection, parseVisualFamilySkeleton, visualFamilyForCooldown, markPendingBatchAttempt, findPendingComboBatchPlan, releasePendingComboBatch, setChatRecentFacesProvider, } from '../storage.js?rmv=2.1.4';
import { promptSectionBreakdown, recordRabbitMirrorIndependentPrompt } from '../tokenMeter.js?rmv=2.1.4';
import { PRESENTATION_FORMATS } from '../../data/structured/presentationIndex.js?rmv=2.1.4';
import { RUNTIME_VERSION, EXTERNAL_SHELL_ATTR, FOLLOW_EXTERNAL_ANCHOR_ATTR, FOLLOW_ORIGIN_ATTR, INLINE_ANCHOR_ATTR, SOURCE_ATTR, byteLength, getContext, hashText, } from './runtime.js?rmv=2.1.4';
import { operationEpochForBase } from './flights.js?rmv=2.1.4';
import { INDEPENDENT_HTML_BUDGET_BYTES, INDEPENDENT_MAX_APPROX_DEPTH, INDEPENDENT_MAX_ATTRIBUTES, INDEPENDENT_MAX_CSS_CHARS, INDEPENDENT_MAX_CSS_RULES, INDEPENDENT_MAX_DATA_URI_CHARS, INDEPENDENT_MAX_TAGS, INDEPENDENT_RAW_MARKUP_BUDGET_CHARS, historyEntriesForSlot, normalizeHistoryEntry, normalizedConfiguredTemperature, readHistoryStore, readStore, } from './persistence.js?rmv=2.1.4';
import { API_PROFILE_ORDER, chatKey, contextBundle, createIndependentVisibleTextReader, explainEmptyIndependentVisibleBody, endpoint, fetchIndependentUrl, forgetRememberedApiProfileIfMatches, getRememberedApiProfile, getStagedApiProfile, globalWorldInfoContextView, globalWorldInfoSnapshotFor, headers, independentBatchPlanPreflightError, independentConnectionProfilePreflightError, independentConnectionProxyPresets, independentDiagnosticBase, independentLocalPreflightFailure, isRabbitMirrorEligibleAssistantMessage, messageBaseSlotKey, messageBody, messageSourceFingerprint, normalizeIndependentConnectionText, profileTokenField, profileUsesStreaming, profileUsesSystemMessage, publishIndependentApiRequestDiagnostic, readLastIndependentApiRequestDiagnostic, rememberApiProfile, safeJson, stageNextApiProfile, stripExcludedTagsFromReference, isOutputFormatInstruction, swipeId, validatedIndependentConnectionProfile, connectionProfileSecretState, } from './connection.js?rmv=2.1.4';
import { externalGeometryCycleSequence, externalGeometryLifecycleEpoch, externalGeometryLifecycleReason, externalGeometryOwnerNodes, prepareIndependentReadyHtml, readyDetailsFromHost, writeExternalGeometryCycleSequence, writeExternalGeometryLifecycleEpoch, writeExternalGeometryLifecycleReason, } from './geometry.js?rmv=2.1.4';
import { INDEPENDENT_REJECTED_PREVIEW_MAX_CHARS, INDEPENDENT_REJECTED_PREVIEW_MAX_ENTRIES, automaticIndependentTiming, externalFaceDetails, externalHostSyncIndex, independentRejectedFaceControlsWired, independentRejectedFacePreviews, independentRejectedPreviewChars, independentRejectedPreviewSequence, manualBodyOwnerCurrent, writeExternalHostSyncIndex, writeIndependentRejectedPreviewChars, writeIndependentRejectedPreviewSequence, } from './mount.js?rmv=2.1.4';
import { assertEarlyBodyOwner } from './earlyBody.js?rmv=2.1.4';
const NON_STREAM_PROFILE_BY_STREAM_PROFILE = {
    chat_system_user_full: 'chat_system_user_full_nostream',
    chat_system_user_completion: 'chat_system_user_completion_nostream',
    chat_system_user_no_temp_full: 'chat_system_user_no_temp_full_nostream',
    chat_system_user_no_temp_completion: 'chat_system_user_no_temp_completion_nostream',
    chat_system_user_minimal: 'chat_system_user_minimal_nostream',
    chat_user_only_full: 'chat_user_only_full_nostream',
    chat_user_only_completion: 'chat_user_only_completion_nostream',
    chat_user_only_no_temp_full: 'chat_user_only_no_temp_full_nostream',
    chat_user_only_no_temp_completion: 'chat_user_only_no_temp_completion_nostream',
    chat_user_only_minimal: 'chat_user_only_minimal_nostream',
};
const independentPresentationFormatById = new Map(PRESENTATION_FORMATS.map(item => [String(item?.id || ''), item]).filter(([id]) => id));
const EXTERNAL_GEOMETRY_CYCLE_VERSION = '1';
const EXTERNAL_GEOMETRY_STABILITY_TOLERANCE_PX = 3;
export const EXTERNAL_GEOMETRY_SETTLE_STEPS_MS = [420, 1500];
function textFromContent(value) {
    if (typeof value === 'string')
        return value;
    if (Array.isArray(value))
        return value.map(textFromContent).filter(Boolean).join('\n');
    if (value && typeof value === 'object') {
        if (value.thought === true || /^(?:reasoning|reasoning_text|analysis|thinking|thought)$/i.test(String(value.type || '')))
            return '';
        return String(value.text ?? value.content ?? value.output_text ?? value.value ?? '');
    }
    return '';
}
function extractResponseText(payload) {
    const choice = payload?.choices?.[0] || null;
    const candidates = [
        choice?.message?.content,
        choice?.text,
        choice?.delta?.content,
        payload?.output_text,
        payload?.response,
        payload?.text,
        payload?.content,
        payload?.message?.content,
        payload?.data?.output_text,
        payload?.data?.content,
        payload?.candidates?.[0]?.content?.parts,
        payload?.candidates?.[0]?.output,
    ];
    for (const candidate of candidates) {
        const text = textFromContent(candidate).trim();
        if (text)
            return text;
    }
    if (Array.isArray(payload?.output)) {
        const text = payload.output.flatMap(item => Array.isArray(item?.content) ? item.content : [item?.content, item?.text]).map(textFromContent).filter(Boolean).join('\n').trim();
        if (text)
            return text;
    }
    return '';
}
function independentStreamDeltaText(content) {
    if (Array.isArray(content))
        return content.map(independentStreamDeltaText).join('');
    return textFromContent(content);
}
function independentTransportFinishReason(payload) {
    const raw = String(payload?.choices?.[0]?.finish_reason ?? payload?.stop_reason ?? payload?.candidates?.[0]?.finishReason ?? '').trim().toLowerCase();
    if (!raw)
        return 'unknown';
    return /^(?:stop|length|max_tokens|max_output_tokens|end_turn|stop_sequence|tool_calls|function_call|content_filter|safety|recitation)$/.test(raw) ? raw : 'other';
}
function independentTransportContentType(value) {
    const mime = String(value || '').split(';', 1)[0].trim().toLowerCase();
    return /^(?:text\/(?:event-stream|plain|html)|application\/(?:json|x-ndjson|ndjson|octet-stream|problem\+json))$/.test(mime) ? mime : (mime ? 'other' : null);
}
function mergeIndependentStreamPayload(current = '', payload = null) {
    const previous = String(current || '');
    const delta = payload?.choices?.[0]?.delta;
    if (delta && typeof delta === 'object' && Object.prototype.hasOwnProperty.call(delta, 'content')) {
        return previous + independentStreamDeltaText(delta.content);
    }
    const part = extractResponseText(payload);
    return part ? mergeIndependentStreamText(previous, part) : previous;
}
function parseSsePayload(text = '') {
    const state = { payload: null, text: '', dataLines: [], done: false };
    const consumePayload = data => {
        const value = String(data || '').trim();
        if (!value)
            return true;
        if (value === '[DONE]') {
            state.done = true;
            return true;
        }
        try {
            const payload = JSON.parse(value);
            state.payload = payload;
            state.text = mergeIndependentStreamPayload(state.text, payload);
            return true;
        }
        catch {
            return false;
        }
    };
    const flush = () => {
        if (!state.dataLines.length)
            return;
        consumePayload(state.dataLines.join('\n'));
        state.dataLines = [];
    };
    for (const line of String(text).split(/\r\n|\n|\r/)) {
        if (!line) {
            flush();
            continue;
        }
        if (line.startsWith(':'))
            continue;
        const colon = line.indexOf(':');
        const field = colon >= 0 ? line.slice(0, colon) : line;
        if (field !== 'data')
            continue;
        let data = colon >= 0 ? line.slice(colon + 1) : '';
        if (data.startsWith(' '))
            data = data.slice(1);
        state.dataLines.push(data);
        if (consumePayload(state.dataLines.join('\n')))
            state.dataLines = [];
    }
    flush();
    return { payload: state.payload, text: state.text, done: state.done };
}
function parseNdjsonPayload(text = '') {
    let payload = null;
    let merged = '';
    let done = false;
    for (const line of String(text).split(/\r\n|\n|\r/)) {
        const data = line.trim();
        if (!data)
            continue;
        if (data === '[DONE]') {
            done = true;
            continue;
        }
        try {
            payload = JSON.parse(data);
            merged = mergeIndependentStreamPayload(merged, payload);
        }
        catch { }
    }
    return { payload, text: merged, done };
}
function mergeIndependentStreamText(current = '', incoming = '') {
    const previous = String(current || '');
    const next = String(incoming || '');
    if (!next)
        return previous;
    if (!previous)
        return next;
    if (next.startsWith(previous))
        return next;
    if (previous === next)
        return previous;
    return previous + next;
}
function incrementalIndependentStreamState(kind = 'sse') {
    const state = { kind, payload: null, text: '', rawChunks: [], lineBuffer: '', scanOffset: 0, dataLines: [], done: false, finishReason: 'unknown', jsonMessages: 0, sawSse: false };
    const consumeJson = data => {
        const value = String(data || '').trim();
        if (!value)
            return true;
        if (value === '[DONE]') {
            state.done = true;
            return true;
        }
        try {
            const payload = JSON.parse(value);
            state.payload = payload;
            state.jsonMessages += 1;
            const finishReason = independentTransportFinishReason(payload);
            if (finishReason !== 'unknown')
                state.finishReason = finishReason;
            state.text = mergeIndependentStreamPayload(state.text, payload);
            return true;
        }
        catch {
            return false;
        }
    };
    const flushSseEvent = () => {
        if (!state.dataLines.length)
            return;
        consumeJson(state.dataLines.join('\n'));
        state.dataLines = [];
    };
    const consumeLine = line => {
        if (state.kind === 'ndjson' || (state.kind === 'auto' && line && !line.startsWith(':') && !/^data(?:\s*:|$)/.test(line))) {
            consumeJson(line);
            return;
        }
        if (!line) {
            flushSseEvent();
            return;
        }
        if (line.startsWith(':'))
            return;
        const colon = line.indexOf(':');
        const field = colon >= 0 ? line.slice(0, colon) : line;
        if (field !== 'data')
            return;
        state.sawSse = true;
        let data = colon >= 0 ? line.slice(colon + 1) : '';
        if (data.startsWith(' '))
            data = data.slice(1);
        state.dataLines.push(data);
        if (consumeJson(state.dataLines.join('\n')))
            state.dataLines = [];
    };
    const drainLines = final => {
        while (state.lineBuffer) {
            let end = -1;
            let width = 1;
            for (let i = state.scanOffset; i < state.lineBuffer.length; i += 1) {
                if (state.lineBuffer[i] === '\n') {
                    end = i;
                    break;
                }
                if (state.lineBuffer[i] === '\r') {
                    if (i === state.lineBuffer.length - 1 && !final) {
                        state.scanOffset = i;
                        return;
                    }
                    end = i;
                    width = state.lineBuffer[i + 1] === '\n' ? 2 : 1;
                    break;
                }
            }
            if (end < 0) {
                state.scanOffset = state.lineBuffer.length;
                if (final) {
                    consumeLine(state.lineBuffer);
                    state.lineBuffer = '';
                    state.scanOffset = 0;
                }
                return;
            }
            consumeLine(state.lineBuffer.slice(0, end));
            state.lineBuffer = state.lineBuffer.slice(end + width);
            state.scanOffset = 0;
        }
    };
    return {
        state,
        push(text) { const chunk = String(text || ''); if (chunk)
            state.rawChunks.push(chunk); state.lineBuffer += chunk; drainLines(false); },
        finish() { drainLines(true); if (state.kind !== 'ndjson')
            flushSseEvent(); return { raw: state.rawChunks.join(''), payload: state.payload, text: state.text, streamed: true }; },
    };
}
async function readApiResponse(response, { expectedStream = false, signal = null, onProgress = null } = {}) {
    const contentType = String(response.headers?.get?.('content-type') || '').toLowerCase();
    const declaredStreamKind = /text\/event-stream/.test(contentType) ? 'sse' : (/application\/(?:x-)?ndjson/.test(contentType) ? 'ndjson' : '');
    const streamKind = (declaredStreamKind || expectedStream) ? 'auto' : '';
    const reader = typeof response.body?.getReader === 'function' ? response.body.getReader() : null;
    let receivedBytes = 0;
    let reachedEof = false;
    const transport = (parsed, state = {}, error = null, exact = true) => {
        const guardRejected = response.status === 413 && Number(response.headers?.get?.('x-rabbit-mirror-response-limit')) > 0;
        const wholeJson = parsed.parserFormat === 'json';
        const finishReason = !wholeJson && state.finishReason && state.finishReason !== 'unknown' ? state.finishReason : independentTransportFinishReason(parsed.payload);
        const protocolDone = !wholeJson && state.done === true;
        const terminal = protocolDone || !['unknown', 'other'].includes(finishReason);
        const parserFormat = parsed.parserFormat || (state.sawSse ? 'sse' : (declaredStreamKind === 'ndjson' || state.jsonMessages > 1 ? 'ndjson' : (state.jsonMessages === 1 ? 'json' : (declaredStreamKind || 'unknown'))));
        const completeJson = parserFormat === 'json' && parsed.payload !== null;
        const local = signal?.aborted === true || error?.rabbitMirrorLocalAbort === true;
        const limited = /^RABBIT_MIRROR_RESPONSE_TOO_(?:LARGE|COMPLEX)$/.test(String(error?.code || ''));
        let observedBytes = receivedBytes;
        let bytesExact = exact;
        if (error?.code === 'RABBIT_MIRROR_RESPONSE_TOO_LARGE') {
            const guardBytes = error.observedBytes;
            if (Number.isSafeInteger(guardBytes) && guardBytes >= receivedBytes)
                observedBytes = guardBytes;
            else
                bytesExact = false;
        }
        if (guardRejected)
            return { status: null, contentType: null, parserFormat: 'unknown', receivedBytes: null, receivedBytesExact: false,
                contentChars: 0, finishReason: 'unknown', terminalObserved: false, readerReachedEof: null, termination: 'response-limit', endedNormally: false, prematureClose: null };
        return { status: Number.isInteger(response.status) && response.status >= 100 && response.status <= 599 ? response.status : null,
            contentType: independentTransportContentType(contentType), parserFormat, receivedBytes: observedBytes, receivedBytesExact: bytesExact,
            contentChars: String(parsed.text || '').length, finishReason, terminalObserved: terminal, readerReachedEof: reachedEof,
            termination: error ? (local ? 'local-abort' : limited ? 'response-limit' : 'stream-error') : (protocolDone ? 'protocol-done' : terminal ? 'provider-finish' : completeJson ? 'json-complete' : 'eof-unconfirmed'),
            endedNormally: error ? false : (terminal || completeJson ? true : null), prematureClose: error ? (local || limited ? null : !terminal) : (terminal || completeJson ? false : null) };
    };
    const finalize = (parsed, state = {}) => {
        if (!state.sawSse) {
            try {
                parsed.payload = JSON.parse(parsed.raw);
                parsed.text = mergeIndependentStreamPayload('', parsed.payload);
                parsed.parserFormat = 'json';
                parsed.streamed = false;
            }
            catch {
                if (!streamKind) {
                    parsed.text = String(parsed.raw || '').trim();
                    parsed.parserFormat = 'text';
                    parsed.streamed = false;
                }
            }
        }
        return parsed;
    };
    const bufferedResult = (raw, exact = true) => {
        if (/^\s*data:/m.test(raw)) {
            const incremental = incrementalIndependentStreamState('sse');
            incremental.push(raw);
            const parsed = incremental.finish();
            return { ...parsed, contentType, transport: transport(parsed, incremental.state, null, exact) };
        }
        let parsed;
        try {
            const payload = JSON.parse(raw);
            parsed = { raw, payload, text: extractResponseText(payload), streamed: false, parserFormat: 'json' };
        }
        catch {
            parsed = { raw, payload: null, text: String(raw || '').trim(), streamed: false, parserFormat: 'text' };
        }
        return { ...parsed, contentType, transport: transport(parsed, {}, null, exact) };
    };
    if (reader && !streamKind) {
        const decoder = new TextDecoder();
        const chunks = [];
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    reachedEof = true;
                    break;
                }
                receivedBytes += Number(value?.byteLength || 0);
                onProgress?.('response-chunk');
                chunks.push(decoder.decode(value, { stream: true }));
            }
            chunks.push(decoder.decode());
            onProgress?.('response-complete');
            return bufferedResult(chunks.join(''));
        }
        catch (error) {
            try {
                error.partialResult = { transport: transport({ text: '', payload: null, parserFormat: 'unknown' }, {}, error) };
            }
            catch { }
            if (signal?.aborted && error && typeof error === 'object')
                try {
                    error.rabbitMirrorLocalAbort = true;
                }
                catch { }
            throw error;
        }
        finally {
            chunks.length = 0;
            try {
                reader.releaseLock?.();
            }
            catch { }
        }
    }
    if (reader) {
        const decoder = new TextDecoder();
        const incremental = incrementalIndependentStreamState(streamKind || 'auto');
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    reachedEof = true;
                    break;
                }
                receivedBytes += Number(value?.byteLength || 0);
                const textBefore = incremental.state.text.length;
                incremental.push(decoder.decode(value, { stream: true }));
                onProgress?.(incremental.state.text.length > textBefore ? 'response-chunk' : 'response-frame', incremental.state.text);
                if (incremental.state.done)
                    break;
            }
            incremental.push(decoder.decode());
            const parsed = finalize(incremental.finish(), incremental.state);
            if (!parsed.text && parsed.parserFormat !== 'json') {
                const fallback = !/^\s*(?:data|event|id|retry)\s*:/m.test(parsed.raw) ? parseNdjsonPayload(parsed.raw) : parseSsePayload(parsed.raw);
                parsed.payload = parsed.payload || fallback.payload;
                parsed.text = fallback.text;
            }
            return { ...parsed, contentType, transport: transport(parsed, incremental.state) };
        }
        catch (error) {
            try {
                incremental.push(decoder.decode());
            }
            catch { }
            const partial = finalize(incremental.finish(), incremental.state);
            try {
                error.partialResult = { ...partial, contentType, terminatedAfterComplete: false, transport: transport(partial, incremental.state, error) };
            }
            catch { }
            if (signal?.aborted && error && typeof error === 'object') {
                try {
                    error.rabbitMirrorLocalAbort = true;
                }
                catch { }
            }
            throw error;
        }
        finally {
            try {
                reader.releaseLock?.();
            }
            catch { }
        }
    }
    const raw = await response.text();
    reachedEof = true;
    try {
        receivedBytes = new TextEncoder().encode(raw).byteLength;
    }
    catch {
        receivedBytes = null;
    }
    onProgress?.('response-complete');
    if (streamKind) {
        const incremental = incrementalIndependentStreamState(streamKind || 'auto');
        incremental.push(raw);
        const parsed = finalize(incremental.finish(), incremental.state);
        return { ...parsed, contentType, transport: transport(parsed, incremental.state, null, false) };
    }
    return bufferedResult(raw, false);
}
function escapeLongText(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function salvageLongTextProse(raw) {
    const source = String(raw || '');
    const end = source.toLowerCase().lastIndexOf('</toto>');
    const tail = end >= 0 ? source.slice(end + 7) : source;
    const text = tail.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length >= 80 ? text : '';
}
function salvagedLongTextFace(text, index) {
    const inner = `${__rmT("pA8NrQsElUVDCrG.Q5NTjBqJH3p1DZBBQjzsczw6wVyanfCpM_JMJnfWcmaFtElfHqB_KFFVqJ2B_.RuYAeynMiaCcebBSkaCtTNDdsmhn_8gQBHzdtlVPvo62xmV8ZBKOZf_G.EaSBbr7x07AemeT6EvbIzrovyi9jjtnoe54niIubWYQy2YKnr9LpPSvlp6o15nI7ei7znJK8X1wjZ8FnQafPE1CFMfn4Jv25SL4Lfo85pfZ6W3g36k5eB49Q9NryeMqRqZVYPBtlJuYPWnCN2")}${escapeLongText(text)}</p></article></details>`;
    return { index, inner, html: `<toto data-rabbit-mirror="true" data-rm-face="${index + 1}">${inner}</toto>`, details: inner, summaryHtml: `${__rmT("B4ucJ93mSUy2ff3UZ5SWT4zKRjj67M8WkVdZLh")}${index + 1}${__rmT("tD_")}` };
}
export function salvageCutDrawNotes(raw) { return salvageCutDrawNotesDetail(raw).html; }
export function salvageCutDrawNotesDetail(raw) {
    const none = { html: '', droppedFrames: 0 };
    const source = String(raw || '');
    if (/<\/toto>/i.test(source) || !/<summary\b[\s\S]*?<\/summary>/i.test(source))
        return none;
    const opens = [...source.matchAll(/<div\b[^>]*\bdata-rm-draw-notes\s*=\s*["']?(\d+)["']?[^>]*>/gi)];
    if (!opens.length)
        return none;
    const before = source.slice(0, opens[0].index);
    const openDetails = (before.match(/<details\b/gi) || []).length - (before.match(/<\/details\s*>/gi) || []).length;
    if (openDetails !== 1)
        return none;
    const parts = [];
    let droppedFrames = 0;
    const lost = new Set();
    for (const [index, match] of opens.entries()) {
        const from = match.index;
        const limit = index + 1 < opens.length ? opens[index + 1].index : source.length;
        let chunk = source.slice(from, limit);
        const close = chunk.indexOf('</div>');
        if (close >= 0) {
            parts.push(chunk.slice(0, close + 6));
            continue;
        }
        const tail = chunk.search(/<\/details\s*>/i);
        const complete = tail >= 0 || index + 1 < opens.length;
        if (tail >= 0)
            chunk = chunk.slice(0, tail);
        chunk = chunk.replace(/<[^>]*$/, '');
        const prompt = chunk.match(/<p\b[^>]*data-rm-draw-prompt[^>]*>([\s\S]*?)(?:<\/p>|$)/i);
        const promptText = String(prompt?.[1] || '').replace(/<[^>]*>/g, '').trim();
        const unclosedP = (chunk.match(/<p\b/gi) || []).length - (chunk.match(/<\/p\s*>/gi) || []).length;
        if (complete || promptText.length >= 20)
            parts.push(chunk + '</p>'.repeat(Math.max(0, unclosedP)) + '</div>');
        else
            lost.add(match[1]);
    }
    const last = opens[opens.length - 1];
    const lastClose = source.indexOf('</div>', last.index);
    if (lastClose >= 0 && !/^\s*(?:<\/?[a-z]*\s*>?\s*)*$/i.test(source.slice(lastClose + 6)))
        return none;
    let body = before;
    for (const number of lost) {
        if (new RegExp(`<figure\\b[^>]*\\bdata-rm-draw-frame\\s*=\\s*["']?${number}["']?`, 'i').test(body))
            droppedFrames += 1;
    }
    return { html: `${body}${parts.join('')}</details>${/<toto\b/i.test(body) ? '</toto>' : ''}`, droppedFrames };
}
function stripEchoedStatusBar(html) {
    return String(html || '').replace(/<status[\s_-]?bar\b[^>]*>[\s\S]*?<\/status[\s_-]?bar\s*>/gi, '');
}
function wrapMissingMirrorShell(inner, openTag = '') {
    const original = String(inner || '').trim();
    if (!original)
        return original;
    const lead = original.replace(/^(?:\s|<style\b[\s\S]*?<\/style>|<script\b[\s\S]*?<\/script>|<!--[\s\S]*?-->|<svg\b[^>]*\swidth\s*=\s*["']?0(?:px)?["'\s>][\s\S]*?<\/svg>)*/i, '');
    if (/^<details\b(?![^>]*\bhidden\b)/i.test(lead))
        return original;
    const source = stripEchoedStatusBar(original).trim();
    const body = source.replace(/<style\b[\s\S]*?<\/style>/gi, '').replace(/<script\b[\s\S]*?<\/script>/gi, '');
    const text = body.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
    const designed = /<style\b/i.test(source) || /<(?:div|section|article|figure|ul|ol|table|svg|button)\b[^>]*\bclass\s*=/i.test(body);
    if (!designed || (text.length < 20 && !/<(?:img|svg|canvas|button|input|table|figure)\b/i.test(body)))
        return original;
    const plain = value => String(value || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(__rmR("yoXB8WaZQ32L_y5uamz2HT", "g"), '').replace(/\s+/g, ' ').trim();
    const titled = body.match(/<(h[1-4])\b[^>]*>([\s\S]*?)<\/\1>/i)?.[2]
        || body.match(/<([a-z0-9]+)\b[^>]*\bclass\s*=\s*["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/\1>/i)?.[2]
        || '';
    const heading = String(titled || '').replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').trim()
        .replace(__rmR("F7J2NG072D6QRAzRYxfYG2A4MV5guEZmZOr3QbfQSMdindfgNuWgZx5e3DTzeT", ""), '').replace(__rmR("gc0VJZM57uOcwdz3D9lbGgDhgUUzcQSZ7G.psDtTmLt.8y6sukqVuLIBXDU_gw4s0U1sVW1SQIOV4qcZAsdOftxVZdE4DP7iXuA", ""), '');
    const bracketed = heading.match(__rmR("GxGd9isRf8cFT_5i0tyt7PTWoGGcaTlBsSArLgrzasp58oOQttLGkMMdjFTCIkWY4vT9b0d2bQn9YIqNh1k", ""))?.[1] || '';
    const whole = plain(heading).replace(/^[^\p{L}\p{N}]+/u, '');
    const headline = plain(bracketed || heading).replace(/^[^\p{L}\p{N}]+/u, '').split(__rmR("W93OJkayE04KPF2W9nvYF2peFcodk6Vj_7ZNRTdMEKzHmH4AFlc91RYTPPscHXGt4UR725j4mnwexZFoEpSp6IJoS0U9Kf", ""))[0].trim();
    const title = [...([...headline].length >= 2 ? headline : whole)].slice(0, 14).join('').trim() || __rmT("s3XehC_E");
    const scope = String(openTag || '').match(/\bdata-rabbit-mirror-css-scope\s*=\s*["']([^"']+)["']/i)?.[1] || '';
    const scopeAttr = scope ? ` data-rabbit-mirror-css-scope="${escapeLongText(scope)}"` : '';
    return `<details${scopeAttr}${__rmT("a8wK2MbJU6wZecYpdNwqNOKqPKmTWuML5Fafroo8")}${escapeLongText(title)}${__rmT("tuO9YlG7yOQNBhwGf2OpJQyrF3tMJk")}${source}</details>`;
}
export function extractMirrorInner(raw) {
    const cleaned = cleanRabbitMirrorOutput(raw);
    let firstInner = null;
    const totos = [...cleaned.matchAll(/<toto\b[^>]*>([\s\S]*?)<\/toto>/gi)];
    for (const toto of totos) {
        const inner = toto[1].trim();
        if (firstInner === null)
            firstInner = inner;
        if (independentMirrorBodyEvidence(inner))
            return inner;
    }
    for (const toto of totos) {
        const inner = wrapMissingMirrorShell(toto[1], toto[0].match(/^<toto\b[^>]*>/i)?.[0] || '');
        if (inner !== toto[1].trim() && independentMirrorBodyEvidence(inner))
            return inner;
    }
    if (firstInner !== null)
        return firstInner;
    const details = cleaned.match(/<details\b[\s\S]*?<\/details>/i);
    const hasRabbitMirrorOpening = /<toto\b[^>]*>/i.test(cleaned);
    if (details && (hasRabbitMirrorOpening || __rmR("fbBLzB1P_ROkc7yn3GS3fb6OpJOX.JL1S6er.IbbjP8", "i").test(details[0])))
        return details[0].trim();
    return '';
}
function recoverableCompletedIndependentAbort(error, signal, text) {
    return !signal?.aborted
        && !error?.rabbitMirrorLocalAbort
        && error?.name === 'AbortError'
        && error?.code !== 'RABBIT_MIRROR_RESPONSE_TOO_LARGE'
        && !!text
        && !!extractMirrorInner(text);
}
function responseFinishReason(payload) { const reason = independentTransportFinishReason(payload); return reason === 'unknown' ? '' : reason; }
function independentRequestProfiles(st, systemPrompt, userPrompt, options = {}) {
    const model = st.independentApiModel;
    const maxTokens = Number(options.maxTokens ?? st.independentApiMaxTokens) || 12000;
    const temperature = Number.isFinite(Number(options.temperature ?? st.independentApiTemperature)) ? Number(options.temperature ?? st.independentApiTemperature) : 0.8;
    const stream = options.stream !== false;
    const systemUser = [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }];
    const userOnly = [{ role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }];
    const profiles = {
        chat_system_user_full: { kind: 'chat', body: { model, messages: systemUser, temperature, max_tokens: maxTokens, stream } },
        chat_system_user_completion: { kind: 'chat', body: { model, messages: systemUser, temperature, max_completion_tokens: maxTokens, stream } },
        chat_system_user_no_temp_full: { kind: 'chat', body: { model, messages: systemUser, max_tokens: maxTokens, stream } },
        chat_system_user_no_temp_completion: { kind: 'chat', body: { model, messages: systemUser, max_completion_tokens: maxTokens, stream } },
        chat_system_user_minimal: { kind: 'chat', body: { model, messages: systemUser, stream } },
        chat_user_only_full: { kind: 'chat', body: { model, messages: userOnly, temperature, max_tokens: maxTokens, stream } },
        chat_user_only_completion: { kind: 'chat', body: { model, messages: userOnly, temperature, max_completion_tokens: maxTokens, stream } },
        chat_user_only_no_temp_full: { kind: 'chat', body: { model, messages: userOnly, max_tokens: maxTokens, stream } },
        chat_user_only_no_temp_completion: { kind: 'chat', body: { model, messages: userOnly, max_completion_tokens: maxTokens, stream } },
        chat_user_only_minimal: { kind: 'chat', body: { model, messages: userOnly, stream } },
        chat_system_user_full_nostream: { kind: 'chat', body: { model, messages: systemUser, temperature, max_tokens: maxTokens, stream: false } },
        chat_system_user_completion_nostream: { kind: 'chat', body: { model, messages: systemUser, temperature, max_completion_tokens: maxTokens, stream: false } },
        chat_system_user_no_temp_full_nostream: { kind: 'chat', body: { model, messages: systemUser, max_tokens: maxTokens, stream: false } },
        chat_system_user_no_temp_completion_nostream: { kind: 'chat', body: { model, messages: systemUser, max_completion_tokens: maxTokens, stream: false } },
        chat_system_user_minimal_nostream: { kind: 'chat', body: { model, messages: systemUser, stream: false } },
        chat_user_only_full_nostream: { kind: 'chat', body: { model, messages: userOnly, temperature, max_tokens: maxTokens, stream: false } },
        chat_user_only_completion_nostream: { kind: 'chat', body: { model, messages: userOnly, temperature, max_completion_tokens: maxTokens, stream: false } },
        chat_user_only_no_temp_full_nostream: { kind: 'chat', body: { model, messages: userOnly, max_tokens: maxTokens, stream: false } },
        chat_user_only_no_temp_completion_nostream: { kind: 'chat', body: { model, messages: userOnly, max_completion_tokens: maxTokens, stream: false } },
        chat_user_only_minimal_nostream: { kind: 'chat', body: { model, messages: userOnly, stream: false } },
        chat_system_user_nostream: { kind: 'chat', body: { model, messages: systemUser, max_completion_tokens: maxTokens, stream: false } },
        chat_user_only_nostream: { kind: 'chat', body: { model, messages: userOnly, max_completion_tokens: maxTokens, stream: false } },
    };
    const remembered = getRememberedApiProfile(st);
    const order = [remembered, ...API_PROFILE_ORDER].filter(Boolean);
    return [...new Set(order)].map(name => ({ name, ...profiles[name] })).filter(x => x.body && x.kind);
}
function nextCompatibilityProfileName(currentProfile = '', preferNonStreaming = false) {
    const current = String(currentProfile || '');
    if (preferNonStreaming) {
        const exact = String(NON_STREAM_PROFILE_BY_STREAM_PROFILE[current] || '');
        if (exact && API_PROFILE_ORDER.includes(exact))
            return exact;
        const wantsSystem = profileUsesSystemMessage(current);
        const fallback = API_PROFILE_ORDER.find(name => !profileUsesStreaming(name) && profileUsesSystemMessage(name) === wantsSystem);
        if (fallback)
            return fallback;
    }
    const start = Math.max(-1, API_PROFILE_ORDER.indexOf(current));
    const tail = API_PROFILE_ORDER.slice(start + 1);
    return tail.find(name => profileUsesStreaming(name) === profileUsesStreaming(current)) || '';
}
function stageManualNonStreamRetry(st, currentProfile = '', reason = '') {
    const current = String(currentProfile || '');
    if (!current || !profileUsesStreaming(current))
        return '';
    const next = nextCompatibilityProfileName(current, true);
    if (!next || profileUsesStreaming(next))
        return '';
    stageNextApiProfile(st, next, reason, { streamRefused: true });
    return next;
}
function republishIndependentSemanticFailure(requestDiagnostic, semanticFailure, nextProfile = '', extra = {}) {
    return publishIndependentApiRequestDiagnostic({
        ...(requestDiagnostic && typeof requestDiagnostic === 'object' ? requestDiagnostic : {}),
        ok: false,
        semanticFailure: String(semanticFailure || 'semantic-failure'),
        nextProfile: String(nextProfile || ''),
        ...(extra && typeof extra === 'object' ? extra : {}),
        ts: Date.now(),
    });
}
function independentRequestDiagnosticMatchesOwner(diagnostic, ctx, index, msg, sourceHash = '', operationEpoch = 0) {
    if (!diagnostic || typeof diagnostic !== 'object')
        return false;
    const expectedEpoch = Math.max(0, Number(operationEpoch) || 0);
    return String(diagnostic.chatKeyHash || '') === hashText(chatKey(ctx))
        && Number(diagnostic.mesid) === Number(index)
        && Number(diagnostic.swipe) === swipeId(msg)
        && String(diagnostic.sourceHash || '') === String(sourceHash || '')
        && (!expectedEpoch || Number(diagnostic.operationEpoch) === expectedEpoch);
}
function independentTerminalFailureDetails(error, diagnostic = {}) {
    const message = String(error?.message || error || __rmT("uqbkiAlQ6tebGJdjmZyH7ZYJ.Yqhr7s2"));
    const faceMatch = message.match(__rmR("N3FSeHKCwgUIPgkREeiAqYkAqSrSA.aw4hT", ""));
    const detail = error?.rabbitMirrorMultifaceDiagnostic || {};
    const locatedFace = [detail.terminalFace, diagnostic.terminalFace, faceMatch ? Number(faceMatch[1]) : 0].find(face => Number.isInteger(face) && face >= 1 && face <= 5) || 0;
    const protocolOffset = [detail.protocolOffset, diagnostic.protocolOffset].find(offset => Number.isSafeInteger(offset) && offset >= 0);
    const localPreflight = independentLocalPreflightFailure(error);
    const semanticFailure = String(diagnostic?.semanticFailure || (localPreflight ? 'local-preflight' : ''));
    const code = String(error?.code || semanticFailure || (faceMatch ? 'multiface-face-rejected' : 'independent-generation-failed')).slice(0, 120);
    let terminalStage = 'postprocess';
    if (/local-preflight|context-boundary|batch-plan|connection-profile/i.test(`${semanticFailure} ${code}`))
        terminalStage = 'preflight';
    else if (/transport|empty-stream|unparsed-stream|gateway-timeout|parameter-error|empty-content|error-payload|response-boundary/i.test(`${semanticFailure} ${code}`))
        terminalStage = 'transport';
    else if (__rmR("y7rK8.rjQDvAfgAA3Fu8jSdHiClbCha9HbtNIUSGqNevJHZGPjTWKIxu", "i").test(`${semanticFailure} ${code} ${message}`))
        terminalStage = 'multiface-postprocess';
    else if (/quality|sanitize|visual-program|empty-mirror-body|incomplete-mirror|truncated-output/i.test(`${semanticFailure} ${code}`))
        terminalStage = 'postprocess';
    return { message, code, semanticFailure: semanticFailure || code, terminalStage, terminalFace: locatedFace,
        protocolErrorCode: String(detail.protocolErrorCode || diagnostic.protocolErrorCode || '').replace(/[^a-z0-9-]/gi, '').slice(0, 120), protocolOffset };
}
export function republishIndependentTerminalFailure(ctx, index, msg, sourceHash, baseSlot, operationEpoch, error, dispatchLease = null) {
    const expectedEpoch = Math.max(1, Number(operationEpoch) || operationEpochForBase(baseSlot));
    const attached = error?.rabbitMirrorRequestDiagnostic;
    const latest = readLastIndependentApiRequestDiagnostic();
    const diagnostic = independentRequestDiagnosticMatchesOwner(attached, ctx, index, msg, sourceHash, expectedEpoch)
        ? attached
        : independentRequestDiagnosticMatchesOwner(latest, ctx, index, msg, sourceHash, expectedEpoch)
            ? latest
            : {};
    const terminal = independentTerminalFailureDetails(error, diagnostic);
    let requestCount = Number(diagnostic?.requestCount);
    if (!Number.isFinite(requestCount)) {
        try {
            requestCount = typeof dispatchLease?.consumeCount === 'function' ? dispatchLease.consumeCount() : (dispatchLease?.consumed?.() === true ? 1 : 0);
        }
        catch {
            requestCount = 0;
        }
    }
    return publishIndependentApiRequestDiagnostic({
        ...diagnostic,
        ok: false,
        chatKeyHash: hashText(chatKey(ctx)),
        mesid: Number(index),
        swipe: swipeId(msg),
        sourceHash: String(sourceHash || ''),
        baseSlotHash: hashText(baseSlot || messageBaseSlotKey(ctx, index, msg)),
        operationEpoch: expectedEpoch,
        requestCount: Math.max(0, requestCount),
        semanticFailure: terminal.semanticFailure,
        terminalStage: terminal.terminalStage,
        terminalErrorCode: terminal.code,
        terminalFace: terminal.terminalFace || undefined,
        protocolErrorCode: terminal.protocolErrorCode || undefined,
        protocolOffset: terminal.protocolOffset,
        diagnosticUpdatedAt: Date.now(),
        ts: Date.now(),
    });
}
function compactRemoteError(status, raw = '') {
    const source = safeIndependentErrorDetail(raw);
    if (Number(status) === 429 || __rmR("B4CzHlFbic9JxzdM7WjBghQRgDF6UTABO9pFCxq.jGmhge70qgoIvljHjvUganon05CYrCvRRKPxlHIM6oGVxs4X8wdhdQqK2RXlz2yZx8drqf", "i").test(source)) {
        return __rmT("DNMRy3PGc5GYDlRF3S_PlsZXCSAU0jnWl.J0vl6R0qwGcHz4x_U7GR2678L.G7esBpVX1FLWgnmkeumt_mrwb34Eni4faajwSYKyU4ShP3opo22L8BjRhp_3JtBVD4YaZrvs2eAc");
    }
    if (Number(status) === 524 || /\b524\b|a timeout occurred|cloudflare/i.test(source)) {
        return __rmT("cln4TS3D1ot7PLidVdqnJQGzRiLgE7vFfhKSFMsFwfeWNalF1F6AljZVheXwNHh6Zb3NtR_0rZY3eZcL7oKlMduqWNnmH6GJyCw5yTXLI.L.oLvNe9Xzy.daPm30kcFOZ09OvT");
    }
    if (/^\s*<!doctype html|<html[\s>]/i.test(source)) {
        const text = source.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
        return text.slice(0, 220) || `HTTP ${status}`;
    }
    return source.replace(/\s+/g, ' ').trim().slice(0, 220);
}
function retryableParameterError(status, result) {
    const code = Number(status);
    if (![400, 422, 500].includes(code))
        return false;
    const text = `${result?.raw || ''} ${safeJson(result?.payload || {}, 4000)}`;
    if (upstreamGenerationDisabled(text))
        return false;
    if (unsupportedIndependentStreaming(text))
        return true;
    const parameterEvidence = __rmR("DaEpnSfc8bfxNDCwpg..87L6bXK_keK.GlDX0AoCxmBS1wGw4BehY7aaWU8EStpcXIzRomDM.UQBeXQmK7GUtXws73QWqS9AyHHTFn4nxKgZwiFOhe9.nDX1HMBfbzdIgzXrgedOKHpi9H_XxMnzx0fRaHqCu9hcBHuO4SRzUVeZeM87gigPgNYBshCtoUMcqKyuDMeCZglbsphPig4ku2b5JieVfFvbYChoZOdh3megABa9.YoY0pto0nr8CXH1R9eO7xKe1wMDFXhaLGS58Y5by2NW5JPwqIjKgNeikKJSrVmV_QH1UWhOi940ZMkznX10XMi_TX9YaP5pLBFbV70.GYBs60zH6.C_xTTShNd9HHOFZI_74IDwU481GWRiCTTBArNpkhxiHLec23bGg7unQBoKqWRDFXNsspxjG0UcXwajKFMha.9Op7zYclEbMkUOlWRxLDg4EMxYmTTH2xnZciViL.JeWkKgdlgEwghP3HoEjXl7BmY3roLPU2pQ0oB3Xk", "i");
    if (!parameterEvidence.test(text))
        return false;
    if (code !== 500)
        return true;
    const strong500 = __rmR("IEp1A7uHB4hETVQeAVTpcGdNI4OmZ2QzT3Sv3SkBfRrS5f0UXpvOZpTjrxep3083RMJySRUBMzGbk21Bs.D8rF_RhkJLEIE8kDmTfNzfXj38Qs2Oyt5K3e7w54LPj6tdzFFqNDQB9cAu38EVe29wl2TUZ.KfRL3VuZyn3Z5WTPtBAWiXwHILYOoc_SeEa4KDGpJqhW8kbqkYIKyo31JF7TgIbM3t4HUtLJIarQPkFtx10AqwhDUE9uLHZmYzMAAKplRmfboR0UjrQUNbSg5tgPMMAhmVx7WN02I2TkXjeuJhpkR5Lwf8jQDXwi.XBfRxOw_.yKv16prTzh.dQXGjEh0FFx7w1Am3Buxy86JviVZKc8T.OIIA69l8a0x9DBB5IHiNv_OHvh0DMHLt.3BfSAoMciMS92m6FcfNmPdCjrJSEbZGLaf68HWe6C6_LecMsVfvpO4z.WoeHeeAJ4bX1dFZbcTTBcpfa0z4ZzUTLJeFMTBjIIRiKzpNubtiE_bAd9ncg5VaFf5vouLLaffk2BQxu2Muggrer1ZVZijlHVbCTdrHnecZi6kBv3JcBdwhpfjcvGmrx13xsfGc.LVNz1XzTHL2kO5KypB36M2xFb9iDLt1sLkX48Z4pCdWrtw8IikS9S6UlgZp1iKTnarPZA_NaDBK_W3gg6zIsdOaaPDDv7qg6P2ZGz3MQPunkGbeKL7q0h2WJzzypaXeEGUl_1VfY7z.InEz4ztE73Pe139S.FKFQG6q.k4uUtKZB1NNsiqcuZ.2z.uKhA05FkdqHLhee_P9rXRj._Zq4WxgG6EOUhcV8JZZjbm30DvOarPWZWgv5BSVlkXDr4aafnaBxiaxXMuUs2aWAAyFBP3qwaZ6xj2287edNKNXM91jYVRyaGCdLVmuAfh4qs1kbhyqDxWzBYH96KhikgE1PZtQELsMWLxbxFWj.hWlooCAXP4mtczXiMlkCAZ_HXukAOOOkYyxD6BnNbnRLHjxiMph0S0ZfLl9R6jaf3unRcjW.T_M2.CdEhw094DLXrvF6yYeY_9ENKmac2sGuOgiEOZO7W.y1RGmJyLf.gcBTgeNqKgdDVJ5X00KqA3D.qldDQ3X1is8zID4gDTOYsH0ipfj3Ik_AUPguMG8BlPmyG2TwmHzpmasBwEllpzxDJy83i3q_8C9WSB3pnfVCSqwM7YWuHFYHT9dqrc7ef_DfM6zY_qfMZOXDq6OqimwCX0evJslfyJA63uY73KoP2VICh", "i");
    return strong500.test(text);
}
const STREAM_REFUSED_WORDS = '(?:unsupported|not\\s+(?:supported|allowed|accepted|enabled|available)|disabled|must\\s+be\\s+false)';
const STREAM_METHOD_NAMES = '(?:streamGenerateContent|stream_generate_content|streamRawPredict|ConverseStream|InvokeModelWithResponseStream)';
const STREAM_REFUSED_PATTERNS = [
    new RegExp(`\\b(?:stream|streaming)\\b[\\s"':=]*(?:(?:parameter|mode|option|value|true|is|are|currently|generation|outputs?|responses?|requests?)[\\s"':=]*){0,4}${STREAM_REFUSED_WORDS}\\b`, 'i'),
    /\b(?:unsupported|not\s+supported|does\s+not\s+support|doesn['’]t\s+support|disabled)\s+(?:the\s+)?(?:stream|streaming)\b/i,
    new RegExp(`\\b${STREAM_METHOD_NAMES}\\b[^\\n\\r]{0,40}?${STREAM_REFUSED_WORDS}\\b`, 'i'),
    new RegExp(`(?:\\b(?:SSE|server[- ]sent\\s+events?|event-stream)\\b|\\balt=sse\\b)[^\\n\\r]{0,20}?${STREAM_REFUSED_WORDS}\\b`, 'i'),
    __rmR("w81c_u.eGZDIv4SSds4WxwbNoNMarZIpTw3V33tplf_tGmM9lCwTAX3vdgKyeNxDKGZBrFpCyiMwGMHvC7S.KipWdNQkTEX0LcewL.MdurWbXwwT81zy8lBrx1HVovm1M.AciC7r5pKSws6iBoFbubkN8fizqj_msjjQZsePKQflV3MWH5OVyYgRvrfaVLjpwA348Eb9O9HjNyEp.QKcOypn9Mfa_8aZYFDiLH32RYFFtO.fChvMqhjxszAB37YatfyYAB2kiiOgc0d_OioIug1A5whpzPmWmf1Nar47ikt8qJjTf2JFbfwb86gMWn7Ig4vpyjWR", "i"),
];
const GENERATION_DISABLED_PATTERN = /\b(?:[a-z]+_)*generation_disabled\b/gi;
const GENERATION_DISABLED_HINT = __rmT("elg4exKSRloyhhnLefF8.Zean_.Hx4PDaN.TRj3y9Eh_C0qzJ4eB_iYrUkZn5TjqXerUPYXGqNgGrMdBS31p7pdHzUKSI2I99WAIC4UM3c4Lu0fvSCmjbaPcslfZmq31VRf");
function upstreamGenerationDisabled(value = '') {
    const codes = String(value || '').slice(0, 4000).match(GENERATION_DISABLED_PATTERN) || [];
    return codes.some(code => !/stream/i.test(code));
}
function unsupportedIndependentStreaming(value = '') {
    const text = String(value || '').slice(0, 4000).replace(/\bnon[\s_-]*stream(?:ing)?\b/gi, ' nonstream ').replace(__rmR("GIZ5wjDC", "g"), __rmT("pCMVeh"));
    if (upstreamGenerationDisabled(text))
        return false;
    return STREAM_REFUSED_PATTERNS.some(pattern => pattern.test(text));
}
function independentResponseFailure(message, diagnostic, phase = 'response') {
    const codes = { 'empty-stream': 'EMPTY_RESPONSE', 'empty-content': 'EMPTY_RESPONSE', 'unparsed-stream': 'UNPARSED_RESPONSE',
        'error-payload': 'UPSTREAM_ERROR', 'gateway-timeout': 'GATEWAY_TIMEOUT', 'parameter-error': 'PARAMETER_ERROR',
        'incomplete-mirror': 'INCOMPLETE_MIRROR', 'truncated-output': 'TRUNCATED_OUTPUT' };
    const error = new Error(message);
    error.code = `RABBIT_MIRROR_${codes[diagnostic?.semanticFailure] || 'HTTP_ERROR'}`;
    error.rabbitMirrorFailurePhase = phase;
    error.rabbitMirrorRequestDiagnostic = diagnostic;
    return error;
}
function responsePayloadErrorText(payload) {
    const error = payload?.error;
    if (!error)
        return '';
    if (typeof error === 'string')
        return error.trim();
    if (error && typeof error === 'object') {
        for (const value of [error.message, error.msg, error.detail, error.code]) {
            const text = String(value ?? '').trim();
            if (text)
                return text;
        }
        return String(safeJson(error, 1600) || '').trim();
    }
    return String(error || '').trim();
}
function safeIndependentErrorDetail(value) {
    return String(value || '')
        .replace(__rmR("Le0ZJZi5SIRPA0nJZbfbGQEhZxomdin_XRa0wH9OGSqcEudvYV69uZ3BXDU_gw4s0U1sVdjStK_S45v.HlWAw8zMZaExDHHiXuA", "gi"), '')
        .replace(/https?:\/\/[^\s<>"']+/gi, __rmT("trcSZ8yzk4ZprJrXY6D"))
        .replace(/Bearer\s+\S+/gi, __rmT("vfeiTfDQqme9GQJjmZt.ll_cVDDJpYkP"))
        .replace(/\b(?:sk-[A-Za-z0-9_-]{10,}|AIza[A-Za-z0-9_-]{16,})\b/g, __rmT("trahfeR4to5FqTIBY6D"))
        .replace(/\b(?:api[_-]?key|access[_-]?token|password|secret)["']?\s*[:=]\s*["']?[^"'\s,;{}]+["']?/gi, __rmT("trahfeR4to5FqTIBY6D"))
        .replace(/\s+/g, ' ').trim().slice(0, 280);
}
function connectionProfileApiError(value, visibleText = '') {
    const structured = responsePayloadErrorText(value);
    const visible = String(visibleText || '');
    const marked = __rmR("rQsCbwwTuJioqJrQX639K3bc5Uy55zafLSXX8uddK8KlcmS5s3eK74c1ITShzcR0Q7haov07zerZOEnIkalTjCsGKtfopnflEplu2SttZkMVtggIrgTMUJ6fb9dPY0ZG3wjabXpSRJT", "i").test(visible)
        && !/<(?:toto|details)\b/i.test(visible);
    if (!structured && !marked)
        return null;
    const raw = structured || visible;
    const detail = safeIndependentErrorDetail(raw);
    const error = new Error(detail || __rmT("Xw8Vr40PZymw8ETRUVwtqZkAGS1D7xhC29E"));
    error.code = 'RABBIT_MIRROR_HOST_API_ERROR';
    error.rabbitMirrorVisibleApiError = marked;
    for (const candidate of [value?.status, value?.statusCode, value?.error?.status, value?.error?.statusCode]) {
        const status = Number(candidate);
        if (Number.isInteger(status) && status >= 400 && status <= 599) {
            error.status = status;
            break;
        }
    }
    return error;
}
async function requestIndependentConnectionProfileCompletion(runtime, profile, options) {
    options = options || {};
    const service = runtime?.ctx?.ConnectionManagerRequestService;
    const profileId = normalizeIndependentConnectionText(runtime?.id, 160);
    if (!profileId || typeof service?.sendRequest !== 'function')
        throw independentConnectionProfilePreflightError(__rmT("cBrCDL2DGNzaLhkjlAyE.8tYA96BWiXQ5cfUq6v_VTvq3CUEgUZvbM3m9x6qvz4TLjUvly8h0hxIPi6LqgU9YlCy5RXWqZmNa_SniDF6L8n3t.eZ6UZrMK5lNumQ0nBIhZbtb1B86quD2pGySnhkaZ_bBfFRhkys57i8tjtXOogXFq_P06ouBHokNC2gDjq7L_MLMOyiwzTjQr_lL7SC1s74jEqPjzehPJy1v.PTB9x5hX4jBZbMhTGwMtNlpE5I1EH.Xm4mMWIJd5uHYhs4fX5.aYzSMQ4xcfeCbDG8gCywib2UYTdcMEw2S_wS6teyPxbIsk8zjmpQMHS5"), 'request-service-unavailable');
    let rawBody = profile?.body && typeof profile.body === 'object' ? profile.body : {};
    const activeProfileId = normalizeIndependentConnectionText(runtime?.ctx?.extensionSettings?.connectionManager?.selectedProfile, 160);
    const savedSecretId = normalizeIndependentConnectionText(runtime?.profile?.['secret-id'], 240) || normalizeIndependentConnectionText(runtime?.fallbackSecretId, 240);
    const proxyName = normalizeIndependentConnectionText(runtime?.profile?.proxy, 240);
    if (options.earlyBodyOwner && activeProfileId && activeProfileId !== profileId && !savedSecretId) {
        const proxySource = ['openai', 'claude', 'makersuite', 'mistralai', 'deepseek', 'xai', 'moonshot', 'zai'].includes(String(runtime?.apiMap?.source || ''));
        const proxyCandidate = proxySource && !!proxyName && !/^(?:none|<none>)$/i.test(proxyName);
        const ownProxy = proxyCandidate && (await independentConnectionProxyPresets()).some(item => {
            if (String(item?.name || '') !== proxyName)
                return false;
            try {
                return /^https?:$/.test(new URL(normalizeIndependentConnectionText(item?.url, 2000)).protocol);
            }
            catch {
                return false;
            }
        });
        if (!ownProxy)
            throw independentConnectionProfilePreflightError(__rmT("_WXonq9czEBPA.65hFR2Ru6izjdJKR0bY.lh6ZteIrJUdKvP9ef1qKF6Kk.Pw7efkBINHbgFKCM1UiuVesNfR4BLskwP5HXHPSQFNCjCrRI_LrKMnqsQvkSigO996p6a8Xti_LUYL70zCNGSatdLEG1_SJn7uMZwhU.SE3BKqSQafV_RIIRo.NGhNgtDM9I1dzFX7Q1vlYj0IalNLySfjLU_Err2LN86.QNONplrdnDpagUPINr6k9yxlWn_sH.wmfZAfk1ijdYT8etGc1xQh0zQ5xFEfyWFzC7jdshhc0nMbK0MQAXxEMQpNljyPWEcBH.hV8cvndd4fiZ0dUqHDthZmbra6WG5AmdfoEsSBxlh3My5imZUcqfxYIa9vO6S1GihfcF3YqW1cQQkC.f"), 'profile-secret-unbound');
    }
    if (runtime?.apiMap?.source === 'custom') {
        const response = await fetchIndependentUrl('/chat/completions', {
            method: 'POST', settings: { ...options.settings, independentConnectionProfileId: profileId },
            body: JSON.stringify(rawBody), signal: options.signal, dispatchLease: options.dispatchLease,
            advancedOptions: options.advancedOptions, assertAdvancedCurrent: options.assertAdvancedCurrent,
            onEvidenceRequest: body => options.onEvidenceRequest?.(body, 'connection-profile-response'),
        });
        options.onProgress?.('response-headers');
        const result = await readApiResponse(response, { expectedStream: rawBody.stream !== false, signal: options.signal, onProgress: options.onProgress });
        return { response, result };
    }
    const advancedCarrier = options.advancedOptions ? buildIndependentAdvancedCarrier(options.advancedOptions, { source: runtime?.apiMap?.source, apiFormat: runtime?.profile?.['custom-api-format'] }) : null;
    if (options.advancedOptions?.excludedParams?.length)
        rawBody = applyIndependentAdvancedExclusions(rawBody, options.advancedOptions);
    options.assertAdvancedCurrent?.();
    const body = authorizeRabbitMirrorIndependentServiceRequest(advancedCarrier && Object.keys(advancedCarrier).length ? { ...rawBody, ...advancedCarrier } : rawBody, options.dispatchLease);
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    if (!messages.length)
        throw new Error(__rmT("7zu4I9Q4gbh.ZQTq2bx5kVwS2UsBy1p9MgtmAU_gZtfTSLHizZTIgBnSPTKmlp8y9umDFAZ9TwNRcsVL_5orBLGu"));
    const stream = body.stream !== false;
    const maxTokens = Math.max(1, Number(body.max_tokens ?? body.max_completion_tokens ?? options.maxTokens) || 12000);
    const overrides = {
        model: normalizeIndependentConnectionText(body.model, 240),
        stream,
        max_tokens: Object.prototype.hasOwnProperty.call(body, 'max_tokens') ? body.max_tokens : undefined,
    };
    if (Object.prototype.hasOwnProperty.call(body, 'max_completion_tokens'))
        overrides.max_completion_tokens = body.max_completion_tokens;
    if (Object.prototype.hasOwnProperty.call(body, 'temperature'))
        overrides.temperature = body.temperature;
    if (!normalizeIndependentConnectionText(runtime?.profile?.['secret-id'], 240) && runtime?.fallbackSecretId)
        overrides.secret_id = runtime.fallbackSecretId;
    if (advancedCarrier && Object.prototype.hasOwnProperty.call(advancedCarrier, 'custom_include_body'))
        overrides.custom_include_body = body.custom_include_body;
    if (advancedCarrier && Object.prototype.hasOwnProperty.call(advancedCarrier, 'custom_exclude_body'))
        overrides.custom_exclude_body = body.custom_exclude_body;
    let serviceResult;
    try {
        options.onEvidenceRequest?.({ messages, maxTokens, options: { stream, extractData: true, includePreset: false, includeInstruct: false }, overrides }, 'connection-manager');
    }
    catch { }
    serviceResult = await service.sendRequest(profileId, messages, maxTokens, {
        stream,
        signal: options.signal || null,
        extractData: true,
        includePreset: false,
        includeInstruct: false,
    }, overrides);
    options.onProgress?.('response-headers');
    let text = '';
    let terminatedAfterComplete = false;
    const observedHidden = {};
    let finishReason = 'unknown';
    const observeFinish = value => {
        const raw = String(value?.finish_reason ?? value?.choices?.[0]?.finish_reason ?? value?.stop_reason ?? value?.candidates?.[0]?.finishReason ?? '').trim().toLowerCase();
        if (raw)
            finishReason = /^(?:stop|length|max_tokens|max_output_tokens|end_turn|stop_sequence|tool_calls|function_call|content_filter|safety|recitation)$/.test(raw) ? raw : 'other';
    };
    const adapterTransport = (termination = 'host-complete') => ({ status: null, contentType: null, parserFormat: 'host-adapter', receivedBytes: null, receivedBytesExact: false,
        contentChars: text.length, finishReason, terminalObserved: !['unknown', 'other'].includes(finishReason), readerReachedEof: null,
        termination, endedNormally: termination === 'host-complete' ? (!['unknown', 'other'].includes(finishReason) ? true : (text.trim() ? null : false)) : false, prematureClose: termination === 'stream-error' ? true : null });
    const incrementalFieldBytes = new Map();
    const incrementalStringPayloadBytes = new Map();
    let incrementalObservedBytes = 2;
    const jsonStringByteLength = value => {
        const text = String(value ?? '');
        let bytes = 2;
        for (let index = 0; index < text.length; index += 1) {
            const code = text.charCodeAt(index);
            if (code === 0x22 || code === 0x5c || code === 0x08 || code === 0x0c || code === 0x0a || code === 0x0d || code === 0x09) {
                bytes += 2;
                continue;
            }
            if (code <= 0x1f) {
                bytes += 6;
                continue;
            }
            if (code <= 0x7f) {
                bytes += 1;
                continue;
            }
            if (code <= 0x7ff) {
                bytes += 2;
                continue;
            }
            if (code >= 0xd800 && code <= 0xdbff && index + 1 < text.length) {
                const low = text.charCodeAt(index + 1);
                if (low >= 0xdc00 && low <= 0xdfff) {
                    bytes += 4;
                    index += 1;
                    continue;
                }
            }
            if (code >= 0xd800 && code <= 0xdfff) {
                bytes += 6;
                continue;
            }
            bytes += 3;
        }
        return bytes;
    };
    const responseComplexityError = (work = 0, depth = 0) => {
        const error = new TypeError(__rmT("VQsubiPTgJiPqDMQK63nKo5c8Vyw51LfYSK.Ca0_5OPSjRZ5q3Yw7DDnmVuLboPc.Hq3zfrxFZsE8eOyPZcOIqUtHfwrn47_GzS44Yd9tbpL2vODLKbOs3ooKtPUy25LvQJsVGHT1FT"));
        error.name = 'RabbitMirrorResponseComplexityError';
        error.code = 'RABBIT_MIRROR_RESPONSE_TOO_COMPLEX';
        error.limitWork = 512;
        error.limitDepth = 64;
        error.observedWork = Math.max(0, Number(work) || 0);
        error.observedDepth = Math.max(0, Number(depth) || 0);
        return error;
    };
    const serializedResponseValueBytes = (value, arraySlot = false, seen = new WeakSet(), budget = { work: 0 }, depth = 0) => {
        budget.work += 1;
        if (budget.work > 512 || depth > 64)
            throw responseComplexityError(budget.work, depth);
        if (typeof value === 'string')
            return jsonStringByteLength(value);
        if (typeof value === 'bigint')
            return jsonStringByteLength(String(value));
        if (value === null)
            return 4;
        if (value === undefined || typeof value === 'function' || typeof value === 'symbol')
            return arraySlot ? 4 : 0;
        if (typeof value === 'boolean')
            return value ? 4 : 5;
        if (typeof value === 'number')
            return Number.isFinite(value) ? String(Object.is(value, -0) ? 0 : value).length : 4;
        if (!value || typeof value !== 'object')
            return jsonStringByteLength(String(value ?? ''));
        if (seen.has(value))
            return jsonStringByteLength('[Circular]');
        seen.add(value);
        let bytes = 2;
        if (Array.isArray(value)) {
            if (value.length > 512)
                throw responseComplexityError(budget.work + value.length, depth);
            for (let index = 0; index < value.length; index += 1) {
                if (index)
                    bytes += 1;
                bytes += serializedResponseValueBytes(value[index], true, seen, budget, depth + 1);
                assertRabbitMirrorIndependentResponseBytes(bytes);
            }
            return bytes;
        }
        let emitted = 0;
        for (const objectKey in value) {
            budget.work += 1;
            if (budget.work > 512)
                throw responseComplexityError(budget.work, depth);
            if (!Object.prototype.hasOwnProperty.call(value, objectKey)
                || !Object.prototype.propertyIsEnumerable.call(value, objectKey))
                continue;
            const nested = value[objectKey];
            if (nested === undefined || typeof nested === 'function' || typeof nested === 'symbol')
                continue;
            if (emitted)
                bytes += 1;
            bytes += jsonStringByteLength(objectKey) + 1 + serializedResponseValueBytes(nested, false, seen, budget, depth + 1);
            emitted += 1;
            assertRabbitMirrorIndependentResponseBytes(bytes);
        }
        return bytes;
    };
    const setIncrementalResponseFieldBytes = (key, serializedValueBytes) => {
        const fieldBytes = jsonStringByteLength(String(key)) + 1 + serializedValueBytes;
        const previous = incrementalFieldBytes.get(key);
        if (previous === undefined && incrementalFieldBytes.size >= 64)
            throw responseComplexityError(incrementalFieldBytes.size + 1, 1);
        if (previous === undefined && incrementalFieldBytes.size)
            incrementalObservedBytes += 1;
        incrementalObservedBytes += fieldBytes - (previous || 0);
        incrementalFieldBytes.set(key, fieldBytes);
        assertRabbitMirrorIndependentResponseBytes(incrementalObservedBytes);
    };
    const setIncrementalResponseField = (key, value) => {
        const serializedValueBytes = serializedResponseValueBytes(value);
        setIncrementalResponseFieldBytes(key, serializedValueBytes);
        return serializedValueBytes;
    };
    const observeIncrementalNonStringField = (key, value) => {
        setIncrementalResponseField(key, value);
    };
    const appendIncrementalResponseString = (key, previous, next) => {
        const oldText = String(previous || '');
        const newText = String(next || '');
        const priorBytes = incrementalStringPayloadBytes.get(key) || 0;
        const payloadBytes = newText.startsWith(oldText)
            ? priorBytes + jsonStringByteLength(newText.slice(oldText.length)) - 2
            : jsonStringByteLength(newText) - 2;
        incrementalStringPayloadBytes.set(key, payloadBytes);
        setIncrementalResponseFieldBytes(key, payloadBytes + 2);
    };
    appendIncrementalResponseString('text', '', '');
    if (stream) {
        if (typeof serviceResult !== 'function')
            throw new Error(__rmT("d2bXmEKzV.lWblv4BSDc9Qa.pdDH.KJGFTI83OZ__V_LCioPNVihlMFHYf4oGmlOqRjOa.t06xDfg500tTpFrh"));
        const generator = serviceResult();
        if (!generator || typeof generator[Symbol.asyncIterator] !== 'function')
            throw new Error(__rmT("wOGZ9HpK_Bc1Tuf76ly67wEWn8HgacsG5vAcLycK9bpg8oVQgwef0pgTMXGBNZXgOcJWJeW5gEEqvCztqAk"));
        try {
            for await (const frame of generator) {
                const reportedError = connectionProfileApiError(frame);
                if (reportedError)
                    throw reportedError;
                observeFinish(frame);
                const incoming = textFromContent(frame?.text ?? frame?.content ?? '');
                let grew = false;
                if (incoming) {
                    const previousText = text;
                    text = mergeIndependentStreamText(text, incoming);
                    if (text !== previousText) {
                        appendIncrementalResponseString('text', previousText, text);
                        grew = true;
                    }
                }
                options.onProgress?.(grew ? 'response-chunk' : 'response-frame', text);
                const hiddenKeys = [];
                if (frame && typeof frame === 'object') {
                    let hiddenScanWork = 0;
                    for (const key in frame) {
                        hiddenScanWork += 1;
                        if (hiddenScanWork > 64)
                            throw responseComplexityError(hiddenScanWork, 1);
                        if (!Object.prototype.hasOwnProperty.call(frame, key)
                            || !Object.prototype.propertyIsEnumerable.call(frame, key)
                            || key === 'text' || key === 'content' || frame[key] == null)
                            continue;
                        hiddenKeys.push(key);
                        if (hiddenKeys.length > 63)
                            throw responseComplexityError(hiddenKeys.length + 1, 1);
                    }
                }
                if (hiddenKeys.length) {
                    for (const key of hiddenKeys) {
                        const value = frame[key];
                        if (typeof value === 'string') {
                            const previous = String(observedHidden[key] || '');
                            const next = mergeIndependentStreamText(previous, value);
                            observedHidden[key] = next;
                            if (next !== previous)
                                appendIncrementalResponseString(key, previous, next);
                        }
                        else
                            observeIncrementalNonStringField(key, value);
                    }
                }
            }
        }
        catch (error) {
            if (recoverableCompletedIndependentAbort(error, options.signal, text))
                terminatedAfterComplete = true;
            else {
                try {
                    error.partialResult = { raw: text, payload: null, text, streamed: true, contentType: 'connection-manager', terminatedAfterComplete: false,
                        transport: adapterTransport(options.signal?.aborted ? 'local-abort' : /^RABBIT_MIRROR_RESPONSE_TOO_/.test(String(error?.code || '')) ? 'response-limit' : 'stream-error') };
                }
                catch { }
                throw error;
            }
        }
        assertRabbitMirrorIndependentResponseBytes(incrementalObservedBytes);
        assertRabbitMirrorIndependentResponseText(Object.keys(observedHidden).length ? { text, ...observedHidden } : text);
    }
    else {
        options.onProgress?.('connection-manager-complete');
        observeFinish(serviceResult);
        text = textFromContent(serviceResult?.content ?? serviceResult);
        assertRabbitMirrorIndependentResponseText(serviceResult && typeof serviceResult === 'object' ? serviceResult : text);
    }
    const reportedError = connectionProfileApiError(stream ? null : serviceResult, text);
    if (reportedError) {
        const evidenceText = reportedError.rabbitMirrorVisibleApiError ? reportedError.message : text;
        reportedError.partialResult = { raw: evidenceText, payload: null, text: evidenceText, streamed: stream, contentType: 'connection-manager',
            transport: { ...adapterTransport(), contentChars: evidenceText.length, endedNormally: false, prematureClose: null } };
        throw reportedError;
    }
    const payload = { choices: [{ message: { content: text } }] };
    return {
        response: { ok: true, status: 200, statusText: 'OK' },
        result: { raw: text, payload, text, streamed: stream, contentType: 'connection-manager', terminatedAfterComplete,
            transport: adapterTransport(terminatedAfterComplete ? 'stream-error' : 'host-complete') },
    };
}
export async function requestIndependentCompletion(st, systemPrompt, userPrompt, options = {}) {
    const attempts = [];
    const rememberedProfile = getRememberedApiProfile(st);
    const stagedProfile = (options.manualRetry || options.automaticReroll === true) ? getStagedApiProfile(st, true) : '';
    const profiles = independentRequestProfiles(st, systemPrompt, userPrompt, options);
    let profile = (stagedProfile && profiles.find(item => item.name === stagedProfile)) || profiles[0];
    if (!profile) {
        const semanticError = __rmT("6MFE49H04TRJjUe3BekVKlXjdG8NLb0QyOtfvtcvctrEVX0H3zjhX7Oz2AwYQ9Lv8eUT96Fz9XQeuxCue._yqT8omMwCN5YO");
        return { response: { ok: false, status: 0 }, result: { raw: '', payload: null, text: '', streamed: false }, profile: '', attempts, requestDiagnostic: null, semanticError };
    }
    const connectionId = normalizeIndependentConnectionText(st.independentConnectionProfileId, 160);
    const url = connectionId ? '/chat/completions' : endpoint(st.independentApiBaseUrl, profile.kind === 'responses' ? '/responses' : '/chat/completions');
    const stageCompatibility = (reason = '', preferNonStreaming = false) => {
        if (preferNonStreaming && profileUsesStreaming(profile.name))
            return stageManualNonStreamRetry(st, profile.name, reason);
        const next = nextCompatibilityProfileName(profile.name, false);
        if (next) {
            stageNextApiProfile(st, next, reason);
            forgetRememberedApiProfileIfMatches(st, profile.name);
        }
        return next;
    };
    const diagnosticContext = options.diagnosticContext && typeof options.diagnosticContext === 'object' ? options.diagnosticContext : {};
    const generationCapture = claimGenerationEvidence({ version: RUNTIME_VERSION, profile: profile.name, owner: diagnosticContext, settings: st, faceIndex: options.evidenceFaceIndex, serial: options.evidenceSerial });
    const requestTimer = createGenerationTimer();
    const onEvidenceRequest = (body, boundary) => {
        requestTimer.start();
        options.onProgress?.('request-sent');
        generationCapture?.request(body, boundary);
    };
    const transportSummary = (value = {}, fallback = {}) => {
        const input = value && typeof value === 'object' ? value : {};
        const number = value => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
        const tri = value => typeof value === 'boolean' ? value : null;
        const hasStatus = Object.prototype.hasOwnProperty.call(input, 'status');
        const status = number(hasStatus ? input.status : fallback.status);
        const reason = String(input.finishReason || 'unknown');
        const mime = String(Object.prototype.hasOwnProperty.call(input, 'contentType') ? (input.contentType || '') : (fallback.contentType || '')).split(';', 1)[0].trim().toLowerCase();
        return { status: status >= 100 && status <= 599 ? status : null,
            contentType: /^(?:text\/(?:event-stream|plain|html)|application\/(?:json|x-ndjson|ndjson|octet-stream|problem\+json))$/.test(mime) ? mime : (mime ? 'other' : null),
            parserFormat: /^(?:sse|ndjson|json|text|host-adapter)$/.test(String(input.parserFormat || '')) ? input.parserFormat : (connectionId ? 'host-adapter' : 'unknown'),
            receivedBytes: number(input.receivedBytes), receivedBytesExact: input.receivedBytesExact === true, contentChars: number(input.contentChars) ?? 0,
            finishReason: /^(?:stop|length|max_tokens|max_output_tokens|end_turn|stop_sequence|tool_calls|function_call|content_filter|safety|recitation|other|unknown)$/.test(reason) ? reason : 'other',
            terminalObserved: tri(input.terminalObserved), readerReachedEof: tri(input.readerReachedEof),
            termination: /^(?:protocol-done|provider-finish|json-complete|eof-unconfirmed|local-abort|response-limit|stream-error|host-complete|fetch-error|not-dispatched)$/.test(String(input.termination || '')) ? input.termination : (fallback.termination || 'fetch-error'),
            failureCategory: /^(?:none|unknown|authentication|rate-limit|concurrency|network|response-boundary|local-preflight)$/.test(String(input.failureCategory || fallback.failureCategory || '')) ? (input.failureCategory || fallback.failureCategory) : 'none',
            endedNormally: tri(input.endedNormally), prematureClose: tri(input.prematureClose) };
    };
    const transportFailure = (error, kind = 'transport') => {
        const requestElapsedMs = requestTimer.finish();
        const evidence = [];
        const seenErrors = new Set();
        let cursor = error;
        let reportedHttpStatus = null;
        for (let depth = 0; cursor && depth < 4 && !seenErrors.has(cursor); depth += 1) {
            seenErrors.add(cursor);
            for (const value of [cursor?.name, cursor?.message, cursor?.code, cursor?.status, cursor?.statusCode, cursor?.statusText]) {
                const part = String(value ?? '').trim().slice(0, 2000);
                if (part)
                    evidence.push(part);
            }
            for (const status of [cursor?.status, cursor?.statusCode]) {
                const code = Number(status);
                if (Number.isInteger(code) && code >= 400 && code <= 599)
                    reportedHttpStatus = code;
            }
            const hostStatus = String(cursor?.message || '').match(/\b(?:Got response status|HTTP(?:\s+status)?(?:\s+code)?)\s*[:=]?\s*([45]\d\d)\b/i);
            if (hostStatus && !reportedHttpStatus)
                reportedHttpStatus = Number(hostStatus[1]);
            cursor = cursor?.cause;
        }
        const classification = evidence.join(' · ');
        const codedLocalPreflight = independentLocalPreflightFailure(error);
        let dispatchWasNotConsumed = false;
        try {
            dispatchWasNotConsumed = typeof options.dispatchLease?.consumed === 'function'
                && options.dispatchLease.consumed() === false;
        }
        catch { }
        const localPreflight = codedLocalPreflight || (dispatchWasNotConsumed ? error : null);
        const hostApiError = error?.code === 'RABBIT_MIRROR_HOST_API_ERROR';
        const connectionInterrupted = /(?:\bAbortError\b|operation was aborted|request aborted|socket (?:closed|hang up)|ECONNRESET|ERR_NETWORK|networkerror|load failed|failed to fetch)/i.test(classification)
            || (hostApiError && __rmR("zE5XgQwMaC9EecG9.xNVXTQPXIhrZsg2AUKEKpo9SnNmIkIQK8CkgBaMZ0MIM1W8FX6Gvf", "").test(classification));
        const rawDetail = safeIndependentErrorDetail(error?.message || error || __rmT("bDVdDu4IEwLWyEyM"));
        const detail = connectionInterrupted && !hostApiError ? __rmT("mqGtqkp.IChSZYyg2vWxPX6fYTL.dQGQnLoYdZtZE18GUEH5cph") : rawDetail;
        let connectionSecretUnknown = false;
        try {
            connectionSecretUnknown = !!connectionId && connectionProfileSecretState(connectionId) === 'unknown';
        }
        catch { }
        const profileAuthFailure = !!connectionId && ([401, 403].includes(reportedHttpStatus) || /(?:\bunauthori[sz]ed\b|\bforbidden\b|\b(?:invalid|missing|incorrect|expired|revoked)[ _-]+(?:api[ _-]?key|access[ _-]?token|token|secret)\b|\b(?:api[ _-]?key|access[ _-]?token|secret)\b[^\n\r]{0,32}\b(?:invalid|missing|incorrect|expired|revoked|not\s+(?:set|found))\b)/i.test(classification));
        const rateLimited = reportedHttpStatus === 429 || /\brate[_ -]?limit(?:ed|ing)?\b|too many requests/i.test(classification);
        const concurrencyFailure = /\b(?:concurrent|concurrency|parallel)\b[^\n\r]{0,60}\b(?:limit|exceeded|not allowed|not supported)\b|already (?:generating|processing a request)|generation (?:already )?in progress/i.test(classification);
        const responseBoundaryFailure = /RABBIT_MIRROR_RESPONSE_TOO_(?:LARGE|COMPLEX)/.test(classification);
        const generationDisabled = upstreamGenerationDisabled(classification);
        const next = !localPreflight && profileUsesStreaming(profile.name) && !profileAuthFailure && !rateLimited && !concurrencyFailure && !responseBoundaryFailure && !connectionInterrupted && unsupportedIndependentStreaming(classification)
            ? stageCompatibility('stream-explicitly-unsupported', true)
            : '';
        const failureKind = localPreflight ? 'local-preflight' : (responseBoundaryFailure ? 'response-boundary' : hostApiError ? 'host-api-error' : kind);
        attempts.push({ profile: profile.name, status: 0, detail, kind: failureKind });
        const failureCategory = localPreflight ? 'local-preflight' : responseBoundaryFailure ? 'response-boundary' : profileAuthFailure ? 'authentication' : rateLimited ? 'rate-limit' : concurrencyFailure ? 'concurrency' : connectionInterrupted ? 'network' : 'unknown';
        const failureTransport = transportSummary(error?.partialResult?.transport, { status: r?.status ?? reportedHttpStatus, contentType: connectionId ? null : r?.headers?.get?.('content-type'), termination: localPreflight ? 'not-dispatched' : (r ? 'stream-error' : 'fetch-error'), failureCategory });
        if (failureTransport.status === null && !localPreflight && reportedHttpStatus)
            failureTransport.status = reportedHttpStatus;
        failureTransport.failureCategory = failureCategory;
        if (error?.partialResult)
            generationCapture?.response({ ...error.partialResult, partial: true }, failureTransport, failureTransport.status);
        generationCapture?.fail('transport', error, { requestCount: localPreflight ? 0 : 1 });
        const requestDiagnostic = publishIndependentApiRequestDiagnostic({
            ok: false, status: failureTransport.status, model: String(st.independentApiModel || ''), baseUrl: independentDiagnosticBase(st),
            configuredTemperature: normalizedConfiguredTemperature(st), profile: profile.name, temperatureSent: Object.prototype.hasOwnProperty.call(profile.body || {}, 'temperature'),
            systemMessageSent: profileUsesSystemMessage(profile.name), streamSent: profile.body?.stream !== false, tokenField: profileTokenField(profile.name),
            rememberedProfile, stagedProfile, attempts: [{ profile: profile.name, status: 0, kind: failureKind }], requestCount: localPreflight ? 0 : 1, automaticProfileFallback: false, automaticRetry: false,
            semanticFailure: failureKind, transportCause: localPreflight ? 'local-preflight' : (responseBoundaryFailure ? 'response-boundary' : (connectionInterrupted ? 'connection-interrupted' : 'transport-failure')), nextProfile: next, ...diagnosticContext,
            transport: failureTransport, requestElapsedMs, requestTimingEnd: 'failure',
        });
        const retryHint = next
            ? `${__rmT("jaCvT4.cRh7Xi4uXbI2xqh5YGX3jJCvUHfMOV9Jiel6EHNES6.k8LS8uiL35HZZ.a0GiD5teu5wk5nH_MRSIR_AnXUy_jaFrnkrTJ9vOgpOB1MNCNnK3v.4t1iGjIpQX3I8TWPvCeHbdZxhrsLjnlMot3AgTml5nUqrb85SUJPY")}${next}${__rmT("Jk9df4CBepM8fxubefeS_d2K_0Zp4nEFlpv9WcDu6rM6e7KkAih")}` : __rmT("yh9rakh7MclUdRJl9EI.PEDyozMVu8ViLTJVGg4sc1CZZ7xIq8_");
        const profileHint = profileAuthFailure
            ? (connectionSecretUnknown
                ? __rmT("iMA2DRnuC1MShZErIzumo2AcEHaBA66yy3K1DksvEAjdM28vKeFj2tf9I.whgrd0hA5NyWH9E33GmyF8wd0JXwcUj8uqDyDdNf_eiBC43Csmp16lPV6j.TQtgR3kgahJadvQ46WyqIk2Vyh3rsCM9ZXXFIdPES27xzeG6Sy.SB7Cb1teX8KBWRLZXmlyfaDqTWX0g3UvlVEN1szugwnqBlgctMXM4lFYqiXTriyky2vjwCaprtA3kD4ZUtiOnVbUhAPRxMkO5BWBITdroCxZtr2VG98nPYFyYU6wAKXN0oRtnYNPLcmel9TctlbVlwEmaVDFo89BNlwugRP.kuLhxIeSAXL_AamwNg8Q.c5BIZruFBPj") : __rmT("lwPSX39KPDYfpZxFrBYhBGWGWfqLzRex6Jufjf2p5hhhiKl7MqtKKm5pauqDuFtVhjNdZP8QvQHajVc51dXjIRFcqcaInTu9ozHUujZ7ZCtd9M65MwDGmdrNKCrgOx4Uku2e9e3ePVwzcMXxtDy.oGf93n_jDEOUXfkX2gDS79c9jXOzKP3cj4D9_MLE57cjVsD"))
            : rateLimited ? __rmT("rzy.yPDRMaVfzGqVxSyPuc.GA8RSiCP.TL3KKsJOG_odJu1GHAu1FyyIxRppQXodHW80XOgjiGsnytZDt3_Vxsn44LHO3hV4") : concurrencyFailure ? __rmT("dULvfUFsSZJ31ZamZpMRbG5ZBVxLJl2rbYOfaqKImkxHK34xklsxUhA7NumhYU4DCt3DXNBBoJbUEIVE_UKst4jfOIT6O5q6DOzHDtvVeQG05HA2PHfQmk") : generationDisabled ? GENERATION_DISABLED_HINT
                : hostApiError ? __rmT("mW7XRyXpR07OkZr7VvzQUYTf78xqsSLY.6t_60Tn") : connectionId ? __rmT("9XsugxGXSAf4B7iUICxr80n4UPl4HdjstWCEEs.MFflkVozSwA8xE26MQqeHxzSaJyXrLJOx52g7ei_qERtCXx1_qsnl7xqCxdiTjiYjUqDBXWWcfa_JQdrp4y76Qh") : '';
        const wrapped = localPreflight
            ? new Error(`${__rmT("G8FxM_fyqqP_Nz4Ecd.bgH.E.3WhXU0V8KPNXWc1_rkWQR1UkvGoSh")}${rawDetail}${__rmT("fpTyRfgXECVljj8qcrtpFSdoutiwcM5lXHTJiFFqn0NijYwpFDUXZU0GiUhZ07Lau2cY3h")}`)
            : responseBoundaryFailure
                ? new Error(`${__rmT("n9oJwaOMdx5mVXmfEOsGGahL901cty56sUWld9j1UDaFC0xrxAh")}${rawDetail}${__rmT("N9bInWss0_j86fYRJNRZGlCh4q5768rXNUNZAiQosay_mUC50fxeKQGgqjubBDMvwOMh74aIIZh74TS.S_W_w8zM_dEXD9HiANA")}`)
                : new Error(`${hostApiError ? __rmT("s_zraB8Bls03SkHhtRHwCsYPCIf") : __rmT("_t1ZnsGBA958QP8AUOxqf3k7VemaZyNcOhz2Pk")}${__rmT("7ys")}${detail}${profileHint}${retryHint}`);
        if (localPreflight?.code || ((responseBoundaryFailure || hostApiError) && error?.code))
            wrapped.code = String(localPreflight?.code || error.code);
        wrapped.rabbitMirrorRequestDiagnostic = requestDiagnostic;
        try {
            wrapped.cause = error;
        }
        catch { }
        return wrapped;
    };
    let r = null;
    let result = null;
    const publishLocalCancellation = error => {
        const requestElapsedMs = requestTimer.finish();
        const summary = transportSummary(error?.partialResult?.transport, { status: connectionId ? null : r?.status,
            contentType: connectionId ? null : r?.headers?.get?.('content-type'), termination: 'local-abort' });
        summary.termination = 'local-abort';
        summary.endedNormally = false;
        summary.prematureClose = null;
        if (error?.partialResult)
            generationCapture?.response({ ...error.partialResult, partial: true }, summary);
        generationCapture?.fail('cancelled', error);
        let requestCount = 1;
        try {
            if (options.dispatchLease?.consumed?.() === false)
                requestCount = 0;
        }
        catch { }
        const diagnostic = publishIndependentApiRequestDiagnostic({ ok: false, status: summary.status, profile: profile.name, streamSent: profile.body?.stream !== false,
            requestCount, automaticProfileFallback: false, automaticRetry: false, semanticFailure: 'local-cancel', transportCause: 'local-cancel', nextProfile: '',
            ...diagnosticContext, transport: summary, finishReason: summary.finishReason, responseChars: summary.contentChars,
            requestElapsedMs, requestTimingEnd: 'failure' });
        try {
            error.rabbitMirrorRequestDiagnostic = diagnostic;
        }
        catch { }
    };
    if (connectionId) {
        try {
            options.assertAdvancedCurrent?.();
            const advancedSettings = options.advancedSettings || st;
            const advancedOptions = advancedSettings.independentAdvancedEnabled === true ? parseIndependentAdvancedOptions(advancedSettings) : null;
            if (advancedOptions?.excludedParams?.length)
                profile = { ...profile, body: applyIndependentAdvancedExclusions(profile.body, advancedOptions) };
            const runtime = await validatedIndependentConnectionProfile(connectionId);
            const completed = await requestIndependentConnectionProfileCompletion(runtime, profile, { ...options, settings: st, onEvidenceRequest, advancedOptions, maxTokens: Number(st.independentApiMaxTokens) || 12000 });
            r = completed.response;
            result = completed.result;
        }
        catch (error) {
            if (options.signal?.aborted) {
                publishLocalCancellation(error);
                throw error;
            }
            const partial = error?.partialResult;
            if (recoverableCompletedIndependentAbort(error, options.signal, partial?.text)) {
                r = { ok: true, status: 200, statusText: 'OK' };
                result = { ...partial, terminatedAfterComplete: true };
            }
            else
                throw transportFailure(error, 'transport-profile');
        }
    }
    else {
        try {
            options.assertAdvancedCurrent?.();
            const advancedSettings = options.advancedSettings || st;
            const advancedOptions = advancedSettings.independentAdvancedEnabled === true ? parseIndependentAdvancedOptions(advancedSettings) : null;
            if (advancedOptions?.excludedParams?.length)
                profile = { ...profile, body: applyIndependentAdvancedExclusions(profile.body, advancedOptions) };
            r = await fetchIndependentUrl(url, { method: 'POST', headers: headers(st), body: JSON.stringify(profile.body), signal: options.signal, dispatchLease: options.dispatchLease, advancedOptions, assertAdvancedCurrent: options.assertAdvancedCurrent, onEvidenceRequest });
            options.onProgress?.('response-headers');
        }
        catch (error) {
            if (options.signal?.aborted) {
                publishLocalCancellation(error);
                throw error;
            }
            throw transportFailure(error, 'transport-fetch');
        }
        try {
            result = await readApiResponse(r, { expectedStream: profile.body?.stream !== false, signal: options.signal, onProgress: options.onProgress });
        }
        catch (error) {
            if (options.signal?.aborted) {
                publishLocalCancellation(error);
                throw error;
            }
            const partial = error?.partialResult;
            if (recoverableCompletedIndependentAbort(error, options.signal, partial?.text))
                result = { ...partial, terminatedAfterComplete: true };
            else
                throw transportFailure(error, 'transport-body');
        }
    }
    const requestElapsedMs = requestTimer.finish();
    if (r.ok) {
        const reported = connectionProfileApiError(null, result.text);
        if (reported) {
            reported.partialResult = { ...result, raw: reported.message, text: reported.message, payload: null,
                transport: { ...result.transport, endedNormally: false, prematureClose: null } };
            throw transportFailure(reported, 'transport-body');
        }
    }
    attempts.push({ profile: profile.name, status: r.status, detail: String(result.raw || '').slice(0, 280), kind: 'response' });
    const responseTransport = transportSummary(result.transport, { status: connectionId ? null : r.status, contentType: connectionId ? null : result.contentType, termination: 'eof-unconfirmed' });
    generationCapture?.response(result, responseTransport, responseTransport.status);
    associateGenerationEvidence(result, generationCapture);
    const diagnosticBase = {
        ok: !!r.ok,
        status: responseTransport.status,
        model: String(st.independentApiModel || ''),
        baseUrl: independentDiagnosticBase(st),
        configuredTemperature: normalizedConfiguredTemperature(st),
        profile: profile.name,
        temperatureSent: Object.prototype.hasOwnProperty.call(profile.body || {}, 'temperature'),
        systemMessageSent: profileUsesSystemMessage(profile.name),
        streamSent: profile.body?.stream !== false,
        tokenField: profileTokenField(profile.name),
        rememberedProfile,
        stagedProfile,
        attempts: [{ profile: profile.name, status: responseTransport.status, kind: 'response' }],
        requestCount: 1,
        automaticProfileFallback: false,
        automaticRetry: false,
        ...diagnosticContext,
        requestElapsedMs,
        requestTimingEnd: 'response',
        transport: responseTransport,
        finishReason: responseTransport.finishReason,
        responseChars: responseTransport.contentChars,
    };
    if (r.ok) {
        const parsedText = String(result.text || '').trim();
        const payloadError = responsePayloadErrorText(result.payload);
        if (payloadError) {
            const compatibility = retryableParameterError(400, result);
            const next = compatibility ? stageCompatibility('http-200-parameter-error', unsupportedIndependentStreaming(payloadError)) : '';
            const requestDiagnostic = publishIndependentApiRequestDiagnostic({ ...diagnosticBase, ok: false, semanticFailure: 'error-payload', nextProfile: next });
            const streamTwin = next && profileUsesStreaming(profile.name) && !profileUsesStreaming(next);
            const suffix = upstreamGenerationDisabled(`${payloadError} ${result.raw || ''}`) ? `${GENERATION_DISABLED_HINT}${__rmT("CtGWHharGgEe6TGL3jp6B7f4_FX1XIs2")}` : !next ? __rmT("sSqpQGOxpwuDsxw9EGaQjUSRYG6MIYjA7_XuYoiLKZ_.QzQX") : streamTwin ? `${__rmT("c07jgk5lotzskkE_s4mz3JgSsnyJ8p3RGpLPk9hHhpEhz_7oYBpiyfFATgjuPszmlnCrBE2lmAqslFkrc1Q12KijNlZDs6jHohFLAykQialF8Zz9L6_InegGhleMA5I4dZ9Xl7w7914iwcecoKf_XVZu")}${next}${__rmT("Jk9df4CBepM8fxubefeS_d2K_0Zp4nEFlpv9WcDu6rM6e7KkAih")}` : `${__rmT("fbZVtO2APwURh_aqGN7vd4y28yO.UGRgOQXttfdHnfKDgAyUHbT5c15bszj262v_dYcZtXUFDnJNGp2Dc8Mk0wzPO8l")}${next}`;
            return { response: r, result, profile: profile.name, attempts, requestDiagnostic, semanticError: `${__rmT("fmHaYJf7r7QdBC2GX4b6bwhn_c0ocT")}${compactRemoteError(200, payloadError || result.raw || '') || __rmT("IFUbJpfkgmStKhds")}${suffix}` };
        }
        if (parsedText) {
            const requestDiagnostic = publishIndependentApiRequestDiagnostic({ ...diagnosticBase, ok: true, nextProfile: '' });
            return { response: r, result, profile: profile.name, attempts, requestDiagnostic, semanticError: '' };
        }
        const raw = String(result.raw || '').trim();
        if (!raw && profileUsesStreaming(profile.name)) {
            const requestDiagnostic = publishIndependentApiRequestDiagnostic({ ...diagnosticBase, ok: false, semanticFailure: 'empty-stream', nextProfile: '' });
            return { response: r, result, profile: profile.name, attempts, requestDiagnostic, semanticError: __rmT("TP0P1qO_s23bbfnxHOa3SB3M91SGY1OU.RlFXONLBNOk1paeBAjRztr.hKYqEAWo2oj5fYkKg9A1Pb5DM7VolHYLtw5SvFggxlJ_FGU7f0a7xxIenc9QsKJ3c_JF96sMeVv2KlG.hSD01baQf_C") };
        }
        if (result.streamed) {
            const requestDiagnostic = publishIndependentApiRequestDiagnostic({ ...diagnosticBase, ok: false, semanticFailure: 'unparsed-stream', nextProfile: '' });
            return { response: r, result, profile: profile.name, attempts, requestDiagnostic, semanticError: __rmT("D.ZKumsj73bHt0YItUGTKKKNxAeVKFBvLXp7tgiRMWuUAj7uo0XOz3mx_Bos7niEMk9r43F7U32dyQe9imJcRlJWG8O1Q4DEnemVjtbQI3xgQfQWVrgt04ykcoHVoCX_WTEFD0wSpoGy_faQ53Hn1k") };
        }
        const requestDiagnostic = publishIndependentApiRequestDiagnostic({ ...diagnosticBase, ok: false, semanticFailure: 'empty-content', nextProfile: '' });
        return { response: r, result, profile: profile.name, attempts, requestDiagnostic, semanticError: __rmT("7IMlG6PIdroA.Q8PzG1aMDaywGVITdP3jrSMs1ygXhF0TPwwNf.9bQ5ka5UZm0gVO1_5APwu9iZTmZSdFoowmR4u9XdufZI3VDTGXXwQePqlQ_cCaTUuiaidOIAoNMJtBfRUgmIx9ai.4tnU4hh5Xs7PgCNDMWZa4opx_T") };
    }
    let next = '';
    let semanticFailure = '';
    if (Number(r.status) === 524) {
        semanticFailure = 'gateway-timeout';
    }
    if (!next && retryableParameterError(r.status, result)) {
        semanticFailure = semanticFailure || 'parameter-error';
        next = stageCompatibility(`http-${Number(r.status || 0)}-parameter-error`, unsupportedIndependentStreaming(responsePayloadErrorText(result.payload) || result.raw));
    }
    const requestDiagnostic = publishIndependentApiRequestDiagnostic({ ...diagnosticBase, ok: false, semanticFailure, nextProfile: next });
    return { response: r, result, profile: profile.name, attempts, requestDiagnostic, semanticError: '' };
}
export function wrappedIndependentMirrorHtml(inner = '') {
    if (hasMultifaceMarkup(inner))
        return String(inner || '');
    return `<toto data-rabbit-mirror="true" style="display:block;">${String(inner || '')}</toto>`;
}
export function hasMultifaceMarkup(html = '') {
    return /<toto\b[^>]*\bdata-rm-face\s*=/i.test(String(html || ''));
}
export function wrapIndependentFace(inner, index) {
    return `<toto data-rabbit-mirror="true" data-rm-face="${index + 1}">${String(inner || '')}</toto>`;
}
export function wrapPreparedIndependentFace(html, index) {
    const source = String(html || '').trim();
    if (!/^<toto\b/i.test(source))
        return wrapIndependentFace(source, index);
    const template = document.createElement('template');
    template.innerHTML = source;
    const nodes = [...template.content.childNodes].filter(node => node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim()));
    const root = nodes[0];
    if (nodes.length !== 1 || root?.tagName !== 'TOTO' || root.querySelector('toto'))
        return '';
    root.setAttribute('data-rabbit-mirror', 'true');
    root.setAttribute('data-rm-face', String(index + 1));
    return root.outerHTML;
}
export function independentMarkupLimitError(kind, observed, limit) {
    const error = new Error(`${__rmT("INk0ys2XjPhzwgOPy.XjhDyq3WEs4Evr3_.2NzielwSGyZSx")}${kind}: ${observed}/${limit}${__rmT("jk2LmhqVFe3YsVI50saf.tsjJ8ELrwIr4UjLTnWqa6L.bh")}`);
    error.name = 'RabbitMirrorMarkupLimitError';
    error.code = 'RABBIT_MIRROR_MARKUP_TOO_COMPLEX';
    error.kind = kind;
    error.observed = observed;
    error.limit = limit;
    return error;
}
export function assertIndependentMarkupComplexity(value = '') {
    const source = String(value || '');
    if (source.length > INDEPENDENT_RAW_MARKUP_BUDGET_CHARS)
        throw independentMarkupLimitError('chars', source.length, INDEPENDENT_RAW_MARKUP_BUDGET_CHARS);
    if (byteLength(source) > INDEPENDENT_HTML_BUDGET_BYTES)
        throw independentMarkupLimitError('bytes', byteLength(source), INDEPENDENT_HTML_BUDGET_BYTES);
    let tags = 0;
    let attributes = 0;
    let depth = 0;
    let maxDepth = 0;
    let cursor = 0;
    const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
    while (cursor < source.length) {
        const start = source.indexOf('<', cursor);
        if (start < 0)
            break;
        const end = source.indexOf('>', start + 1);
        if (end < 0)
            break;
        if (end - start > 32768)
            throw independentMarkupLimitError('tag-chars', end - start, 32768);
        const fragment = source.slice(start + 1, end);
        cursor = end + 1;
        const match = fragment.match(/^\s*(\/?)\s*([a-z][\w:-]*)/i);
        if (!match)
            continue;
        tags += 1;
        if (tags > INDEPENDENT_MAX_TAGS)
            throw independentMarkupLimitError('tags', tags, INDEPENDENT_MAX_TAGS);
        const closing = !!match[1];
        const name = String(match[2] || '').toLowerCase();
        if (closing)
            depth = Math.max(0, depth - 1);
        else if (!voidTags.has(name) && !/\/\s*$/.test(fragment)) {
            depth += 1;
            maxDepth = Math.max(maxDepth, depth);
        }
        if (maxDepth > INDEPENDENT_MAX_APPROX_DEPTH)
            throw independentMarkupLimitError('depth', maxDepth, INDEPENDENT_MAX_APPROX_DEPTH);
        if (!closing) {
            const attrSource = fragment.slice(match[0].length);
            let found;
            const attrRe = /\s+[a-z_:][\w:.-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/gi;
            while ((found = attrRe.exec(attrSource))) {
                attributes += 1;
                if (attributes > INDEPENDENT_MAX_ATTRIBUTES)
                    throw independentMarkupLimitError('attributes', attributes, INDEPENDENT_MAX_ATTRIBUTES);
            }
        }
    }
    let cssChars = 0;
    let cssRules = 0;
    for (const match of source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)) {
        const css = String(match[1] || '');
        cssChars += css.length;
        cssRules += (css.match(/{/g) || []).length;
        if (cssChars > INDEPENDENT_MAX_CSS_CHARS)
            throw independentMarkupLimitError('css-chars', cssChars, INDEPENDENT_MAX_CSS_CHARS);
        if (cssRules > INDEPENDENT_MAX_CSS_RULES)
            throw independentMarkupLimitError('css-rules', cssRules, INDEPENDENT_MAX_CSS_RULES);
    }
    let dataUriChars = 0;
    for (const match of source.matchAll(/data:[^\s"')>]+/gi)) {
        dataUriChars += String(match[0] || '').length;
        if (dataUriChars > INDEPENDENT_MAX_DATA_URI_CHARS)
            throw independentMarkupLimitError('data-uri-chars', dataUriChars, INDEPENDENT_MAX_DATA_URI_CHARS);
    }
    return { tags, attributes, maxDepth, cssChars, cssRules, dataUriChars };
}
export function assertIndependentMarkupComplexityWithDiagnostic(value = '', scope = 'raw', requestDiagnostic = null) {
    try {
        return assertIndependentMarkupComplexity(value);
    }
    catch (error) {
        if (error?.code === 'RABBIT_MIRROR_MARKUP_TOO_COMPLEX') {
            republishIndependentSemanticFailure(requestDiagnostic, 'markup-too-complex', '', {
                markupScope: String(scope || 'raw').slice(0, 16),
                markupKind: String(error?.kind || '').slice(0, 32),
                markupObserved: Number(error?.observed || 0),
                markupLimit: Number(error?.limit || 0),
                responseChars: String(value || '').length,
            });
        }
        throw error;
    }
}
function independentMirrorBodyEvidence(inner = '') {
    if (typeof DOMParser === 'undefined') {
        const stripped = String(inner || '').replace(/<style\b[\s\S]*?<\/style>/gi, '').replace(/<script\b[\s\S]*?<\/script>/gi, '');
        const body = stripped.replace(/<summary\b[\s\S]*?<\/summary>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').trim();
        return body.length > 0 || /<(?:img|svg|canvas|video|audio|iframe|input|button|select|textarea|table|ul|ol|section|article|main|figure)\b/i.test(stripped);
    }
    try {
        const doc = new DOMParser().parseFromString(wrappedIndependentMirrorHtml(inner), 'text/html');
        const details = doc.querySelector('toto > details, details');
        if (!details)
            return false;
        const summary = details.querySelector(':scope > summary');
        if (!summary || !String(summary.textContent || '').trim())
            return false;
        for (const node of [...details.childNodes]) {
            if (node === summary)
                continue;
            if (node.nodeType === Node.TEXT_NODE && String(node.textContent || '').trim())
                return true;
            if (node.nodeType !== Node.ELEMENT_NODE)
                continue;
            const element = node;
            if (['STYLE', 'SCRIPT', 'TEMPLATE', 'LINK', 'META'].includes(element.tagName))
                continue;
            if (element.hasAttribute('hidden') || String(element.getAttribute('aria-hidden') || '').toLowerCase() === 'true')
                continue;
            const inline = String(element.getAttribute('style') || '').toLowerCase();
            if (/(?:^|;)\s*display\s*:\s*none\b/.test(inline) || /(?:^|;)\s*visibility\s*:\s*hidden\b/.test(inline))
                continue;
            if (element.matches('img,svg,canvas,video,audio,iframe,input,button,select,textarea'))
                return true;
            if (String(element.textContent || '').trim() || element.querySelector('img,svg,canvas,video,audio,iframe,input,button,select,textarea,table,ul,ol,section,article,main,figure,[role],[data-action]'))
                return true;
            if (['DIV', 'SECTION', 'ARTICLE', 'MAIN', 'FIGURE', 'TABLE', 'UL', 'OL', 'FORM'].includes(element.tagName) && element.children.length)
                return true;
        }
    }
    catch { }
    return false;
}
function independentVisualProgramIntegrity(inner = '') {
    const source = String(inner || '');
    const styleBodies = [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => String(match[1] || ''));
    const stylesheet = styleBodies.join('\n');
    const meaningfulStylesheet = /\{[\s\S]{0,2400}:[\s\S]{0,2400}\}/.test(stylesheet.replace(/\/\*[\s\S]*?\*\//g, ' '));
    const classValues = [...source.matchAll(/\bclass\s*=\s*(["'])([\s\S]*?)\1/gi)].map(match => String(match[2] || '').trim()).filter(Boolean);
    const uniqueClasses = new Set();
    for (const value of classValues)
        for (const token of value.split(/\s+/))
            if (token)
                uniqueClasses.add(token);
    const inlineStyles = [...source.matchAll(/\bstyle\s*=\s*(["'])([\s\S]*?)\1/gi)].map(match => String(match[2] || ''));
    const variableRefs = new Set([...source.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/gi)].map(match => String(match[1] || '')));
    const variableDefs = new Set([...(`${stylesheet}\n${inlineStyles.join('\n')}`).matchAll(/(--[A-Za-z0-9_-]+)\s*:/gi)].map(match => String(match[1] || '')));
    const externallyProvidedVariable = /^--(?:SmartTheme|rm-|st-|mes-|mainFontSize|font-scale)/i;
    const unresolvedVariables = [...variableRefs].filter(name => !variableDefs.has(name) && !externallyProvidedVariable.test(name));
    const hasStateControl = /<input\b[^>]*\btype\s*=\s*(["']?)(?:checkbox|radio)\1[^>]*>/i.test(source)
        && /<label\b[^>]*\bfor\s*=/i.test(source);
    const stateLikeClasses = [...uniqueClasses].filter(name => /(?:toggle|trigger|secret|hidden|drawer|overlay|modal|panel|reveal|checked|selected|btn[-_]?text[-_]?(?:init|done|on|off)|state[-_]?(?:on|off|open|closed))/i.test(name));
    const classHeavy = uniqueClasses.size >= 12 && classValues.length >= 10;
    const almostNoInlineStyling = inlineStyles.length <= 2;
    const missingVariableProgram = unresolvedVariables.length >= 2 && uniqueClasses.size >= 4;
    const missingStateProgram = hasStateControl && stateLikeClasses.length >= 2;
    const missingClassProgram = classHeavy && almostNoInlineStyling && !/<(?:svg|canvas)\b/i.test(source);
    const missing = !meaningfulStylesheet && (missingVariableProgram || missingStateProgram || missingClassProgram);
    return {
        ok: !missing, missing, meaningfulStylesheet, styleBlocks: styleBodies.length, classAttributes: classValues.length,
        uniqueClasses: uniqueClasses.size, inlineStyles: inlineStyles.length, unresolvedVariables,
        hasStateControl, stateLikeClassCount: stateLikeClasses.length,
        reason: missing ? (missingVariableProgram ? 'unresolved-css-variables' : missingStateProgram ? 'state-css-missing' : missingClassProgram ? 'class-stylesheet-missing' : '') : '',
    };
}
export function independentPaletteFingerprintFromHtml(inner = '') {
    try {
        return scanRabbitMirrorHtml(wrappedIndependentMirrorHtml(inner), null)?.paletteFingerprint || null;
    }
    catch {
        return null;
    }
}
function recentIndependentPaletteRecords(limit = 3) {
    const max = Math.max(1, Number(limit) || 3);
    const flattened = [];
    for (const [slot, entries] of Object.entries(readHistoryStore().slots || {})) {
        for (const raw of Array.isArray(entries) ? entries : []) {
            const item = normalizeHistoryEntry(raw);
            if (item?.html)
                flattened.push({ slot, item });
        }
    }
    flattened.sort((a, b) => Number(b.item?.ts || 0) - Number(a.item?.ts || 0));
    if (flattened.length)
        return flattened.slice(0, max).map(entry => entry.item);
    return Object.values(readStore()).filter(item => item?.html).sort((a, b) => Number(b?.ts || 0) - Number(a?.ts || 0)).slice(0, max);
}
function independentVisualFamilyFromHtml(inner = '') {
    try {
        const scanned = scanRabbitMirrorHtml(wrappedIndependentMirrorHtml(inner), null) || {};
        return visualFamilyForCooldown(parseVisualFamilySkeleton(scanned.skeleton || ''));
    }
    catch {
        return {};
    }
}
function repeatedIndependentVisualDimensions(families = []) {
    const usable = (Array.isArray(families) ? families : []).filter(item => item && typeof item === 'object' && Object.keys(item).length);
    if (usable.length < 2)
        return [];
    const latest = usable[0];
    const labels = { surface_family: __rmT("VPkwkuB8rrWrIlMM"), contrast_family: __rmT("7McQFSjDbJB"), contour_family: __rmT("tNMR55hLeDf"), reading_family: __rmT("nVAUz6CYk8Y"), unit_family: __rmT("9DZx8ktJvHY"), space_family: __rmT("l6p9VBjWk6A") };
    const result = [];
    for (const [key, label] of Object.entries(labels)) {
        const value = latest[key];
        if (!value)
            continue;
        let streak = 0;
        for (const family of usable) {
            if (family?.[key] !== value)
                break;
            streak += 1;
        }
        if (streak >= 2)
            result.push({ key, label, value, streak });
    }
    return result;
}
function independentVisualHistoryContext({ needsBackfill = false, slot = '', manualRetry = false } = {}) {
    const scanned = new Map();
    const scanOnce = html => {
        if (!scanned.has(html)) {
            let raw = {};
            try {
                raw = scanRabbitMirrorHtml(wrappedIndependentMirrorHtml(html), null) || {};
            }
            catch {
                raw = {};
            }
            scanned.set(html, { family: visualFamilyForCooldown(parseVisualFamilySkeleton(raw.skeleton || '')), visualSkeleton: String(raw.skeleton || ''),
                paletteFingerprint: raw.paletteFingerprint && typeof raw.paletteFingerprint === 'object' ? raw.paletteFingerprint : null });
        }
        return scanned.get(html);
    };
    const recent = needsBackfill ? recentIndependentPaletteRecords(5).map(item => scanOnce(item.html)) : [];
    const previous = manualRetry && slot ? historyEntriesForSlot(String(slot))[0] : null;
    const previousScan = previous?.html && !hasMultifaceMarkup(previous.html) ? scanOnce(previous.html) : null;
    return { families: recent.map(item => item.family), recent: recent.map(({ visualSkeleton, paletteFingerprint }) => ({ visualSkeleton, paletteFingerprint })),
        previous: previousScan && Object.keys(previousScan.family).length ? previousScan.family : null,
        previousSkeleton: previousScan?.visualSkeleton || '', previousPalette: previousScan?.paletteFingerprint || null };
}
export function commitIndependentVisualResult(inner = '', onScan = null) {
    try {
        if (hasMultifaceMarkup(inner)) {
            const parsed = parseMultifaceOutput(inner);
            if (!parsed.ok)
                return null;
            let firstPalette = null;
            for (const face of parsed.faces) {
                const scanned = scanRabbitMirrorHtml(wrapIndependentFace(face.inner, face.index), null) || {};
                onScan?.(scanned, face.index);
                if (!firstPalette)
                    firstPalette = scanned.paletteFingerprint || null;
            }
            return firstPalette;
        }
        const scanned = scanRabbitMirrorHtml(wrappedIndependentMirrorHtml(inner), null) || {};
        onScan?.(scanned, 0);
        return scanned.paletteFingerprint || null;
    }
    catch (error) {
        console.debug('[RabbitMirror] independent visual signature skipped:', error);
        return null;
    }
}
const chatFaceScanCache = new Map();
let chatFaceListCache = { key: '', records: [] };
function scanSavedMirrorFaces(html, onScan) {
    if (hasMultifaceMarkup(html)) {
        const parsed = parseMultifaceOutput(html, { storedDisplay: true });
        if (!parsed.ok)
            return;
        for (const face of parsed.faces)
            onScan(scanRabbitMirrorHtml(wrapIndependentFace(face.inner, face.index), null) || {}, face.index);
        return;
    }
    onScan(scanRabbitMirrorHtml(wrappedIndependentMirrorHtml(html), null) || {}, 0);
}
function chatRecentFaceRecords() {
    let ctx = null;
    try {
        ctx = getContext();
    }
    catch {
        return [];
    }
    const owners = ctx?.chatMetadata?.rabbit_mirror_independent_outputs_v2?.owners;
    const chat = Array.isArray(ctx?.chat) ? ctx.chat : [];
    const key = String(chatKey(ctx) || '');
    const ownerEntries = Object.entries(owners && typeof owners === 'object' ? owners : {})
        .filter(([, record]) => record && record.deleted !== true && typeof record.html === 'string' && record.html && Number(record.ts) > 0);
    const last = chat[chat.length - 1];
    const listKey = `${key}|${chat.length}|${String(last?.mes || '').length}|${Number(last?.swipe_id) || 0}|${ownerEntries.map(([owner, record]) => `${owner}:${Number(record.ts)}`).join(',')}`;
    if (chatFaceListCache.key === listKey)
        return chatFaceListCache.records;
    const recent = ownerEntries.slice();
    for (let index = chat.length - 1, seen = 0, looked = 0; index >= 0 && seen < 8 && looked < 40; index -= 1) {
        const msg = chat[index];
        if (!msg || msg.is_user || msg.is_system)
            continue;
        looked += 1;
        const text = String(msg.mes || '');
        const at = text.search(/<toto\b/i);
        if (at < 0)
            continue;
        const end = text.toLowerCase().lastIndexOf('</toto>');
        if (end < at)
            continue;
        const ts = Number(new Date(msg.gen_finished || msg.send_date || 0)) || 0;
        if (!ts)
            continue;
        const html = /<toto\b[^>]*\bdata-rm-face=/i.test(text) ? text.slice(at, end + 7) : text.slice(text.indexOf('>', at) + 1, end);
        let apiRequest = null;
        try {
            const swipe = Number(msg.swipe_id) || 0;
            const pick = face => face && typeof face === 'object' ? { themeIds: Array.isArray(face.themeIds) ? face.themeIds.map(String) : [], formatIds: Array.isArray(face.formatIds) ? face.formatIds.map(String) : [],
                themeGroups: Array.isArray(face.themeGroups) ? face.themeGroups.map(String) : [], formatGroups: Array.isArray(face.formatGroups) ? face.formatGroups.map(String) : [],
                samplingMode: String(face.samplingMode || ''), ...presentationModeFields(face) } : null;
            const single = getRabbitMirrorRecipe({ chatKey: key, messageIndex: index, swipeId: swipe, message: msg });
            if (single)
                apiRequest = pick(single);
            else {
                const faces = [];
                for (let faceIndex = 0; faceIndex < 5; faceIndex += 1)
                    faces.push(pick(getRabbitMirrorRecipe({ chatKey: key, messageIndex: index, swipeId: swipe, message: msg, faceIndex })));
                if (faces.some(Boolean))
                    apiRequest = { faces };
            }
        }
        catch {
            apiRequest = null;
        }
        recent.push([`follow:${index}:${Number(msg.swipe_id) || 0}`, { html, ts, apiRequest }]);
        seen += 1;
    }
    recent.sort((a, b) => Number(b[1].ts) - Number(a[1].ts));
    recent.splice(8);
    const out = [];
    for (const [owner, record] of recent) {
        const cacheKey = `${key}|${owner}|${Number(record.ts)}|${hashText(record.html)}`;
        if (!chatFaceScanCache.has(cacheKey)) {
            const diagnostic = record.apiRequest && typeof record.apiRequest === 'object' ? record.apiRequest : {};
            const faces = [];
            try {
                scanSavedMirrorFaces(record.html, (scan, faceIndex) => {
                    const meta = Array.isArray(diagnostic.faces) ? diagnostic.faces[faceIndex] || {} : diagnostic;
                    faces.push({
                        ts: Number(record.ts), fromChat: true, diversityRound: `chat:${key}:${owner}:${Number(record.ts)}`, faceIndex,
                        themeIds: Array.isArray(meta.themeIds) ? meta.themeIds.map(String) : [], formatIds: Array.isArray(meta.formatIds) ? meta.formatIds.map(String) : [],
                        samplingMode: String(meta.samplingMode || ''), ...presentationModeFields(meta),
                        visualSkeleton: String(scan?.skeleton || ''), paletteFingerprint: scan?.paletteFingerprint && typeof scan.paletteFingerprint === 'object' ? scan.paletteFingerprint : undefined,
                        interactionFamily: scan?.interactionFamily || undefined,
                    });
                });
            }
            catch { }
            if (chatFaceScanCache.size > 64)
                chatFaceScanCache.delete(chatFaceScanCache.keys().next().value);
            chatFaceScanCache.set(cacheKey, faces);
        }
        out.push(...chatFaceScanCache.get(cacheKey));
    }
    const records = out.sort((a, b) => a.ts - b.ts || Number(a.faceIndex || 0) - Number(b.faceIndex || 0));
    chatFaceListCache = { key: listKey, records };
    return records;
}
try {
    setChatRecentFacesProvider(chatRecentFaceRecords);
}
catch { }
export function independentSelectedFormatDescriptors(faceMetadata = {}) {
    const ids = Array.isArray(faceMetadata?.formatIds) ? faceMetadata.formatIds : [];
    const labels = Array.isArray(faceMetadata?.formatLabels) ? faceMetadata.formatLabels : [];
    const descriptors = Array.isArray(faceMetadata?.formatDescriptors) ? faceMetadata.formatDescriptors.slice(0, 8) : [];
    const text = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
    let externalCount = 0;
    return ids.map((value, index) => {
        const id = String(value || '');
        const item = independentPresentationFormatById.get(id) || null;
        if (item || !id.startsWith('ext:'))
            return {
                id,
                title: String(item?.title || labels[index] || ''),
                summary: String(item?.summary || ''),
                tags: Array.isArray(item?.tags) ? item.tags.map(tag => String(tag || '')).filter(Boolean) : [],
            };
        if (typeof value !== 'string' || id.length > 2048 || externalCount >= 8)
            return null;
        externalCount += 1;
        const external = descriptors.find(item => item?.id === id) || null;
        return {
            id,
            title: text(external?.title || labels[index] || '', 160),
            summary: text(external?.summary, 210),
            tags: Array.isArray(external?.tags) ? external.tags.slice(0, 4).map(tag => text(tag, 64)).filter(Boolean) : [],
        };
    }).filter(Boolean);
}
function independentMultifacePostprocessError(message, code, faceIndex = 0, extra = {}) {
    const error = new Error(String(message || __rmT("OlwpnH.QlFtD1Z8F6SrkWtC5bNs")));
    error.code = String(code || 'multiface-postprocess').slice(0, 120);
    error.rabbitMirrorMultifaceDiagnostic = {
        ...(Number.isInteger(faceIndex) && faceIndex >= 0 ? { terminalFace: faceIndex + 1 } : {}),
        ...(extra && typeof extra === 'object' ? extra : {}),
    };
    return error;
}
function independentMultifaceFailureSemantic(error) {
    const code = String(error?.code || '');
    return code.startsWith('multiface-') ? code : 'multiface-postprocess';
}
function independentMultifaceIncompleteHint(protocolErrorCode = '', finishReason = '') {
    if (/^(length|max_tokens|max_output_tokens)$/i.test(String(finishReason || '')))
        return __rmT("s1q_XgUGiiKGULZoBHQEvN7cjOmRO7OdmP.kHqwa4HdgOi_E3FopugwmmIy0euFbyUlcrS6FS_BNt.cOqAk");
    if (/^(content_filter|safety|recitation)$/i.test(String(finishReason || '')))
        return __rmT("Glzrnwx0PxJj1eXz6N4iBB0S2VaCkQgpUDj1AU5LIhaQTCWJ1VDdUvTFj9Yq2kkQWlydFmXgV0EJPNu482VO5GTQUFBKOc1lL.1srBXrUP08qAGYLGT0if");
    if (protocolErrorCode === 'unclosed-raw-text')
        return __rmT("CEhxALedPvcZSSg3p6amBIXVpDHF_MHq.U9U3Bi7f3ueRLmCXGJ5xNExbO8Oxoi7Pu7H7Ag8uGxKB9EFN7clg0mkb1kdJI9fNh2SMpC_F05qZ7Grph2yh..S75SZP.Dr");
    if (protocolErrorCode === 'outside-content')
        return __rmT("uYpekI7A7vgUBsNFvUjUKv7g0XVdRFwUWFh5QrWuBw3h.k.hWd85RI_ASIG7Znnv2CJ3loTdmpmw_zBU1lWi6qbFcRIGD8ZuX2SCLDky.K5GhCWgwLOmxYyKXz5qX_MdlU0AHLpGDKbniiP1UVcNoUVcMmiTiE7hsv7Zrx1SvzchnbfTwz6XNimO");
    return __rmT("wOVN2_Ij962xq0Vre_NTQHBFXb56csGglA6WlPWC5rjfLxfrPYi8y.7oJuWu4wPn7eg1f6bWs4wjABgMzjiS8a7hmwHgz9glu3.B63Bp3rtM6DMCbPeaXBUt");
}
function cacheIndependentRejectedFacePreview(html = '') {
    if (!html || html.length > INDEPENDENT_REJECTED_PREVIEW_MAX_CHARS)
        return '';
    while (independentRejectedFacePreviews.size && (independentRejectedFacePreviews.size >= INDEPENDENT_REJECTED_PREVIEW_MAX_ENTRIES || independentRejectedPreviewChars + html.length > INDEPENDENT_REJECTED_PREVIEW_MAX_CHARS)) {
        const oldest = independentRejectedFacePreviews.keys().next().value;
        writeIndependentRejectedPreviewChars(independentRejectedPreviewChars - independentRejectedFacePreviews.get(oldest).length);
        independentRejectedFacePreviews.delete(oldest);
    }
    const id = `rejected-${Date.now().toString(36)}-${writeIndependentRejectedPreviewSequence(independentRejectedPreviewSequence + (1))}`;
    independentRejectedFacePreviews.set(id, html);
    writeIndependentRejectedPreviewChars(independentRejectedPreviewChars + (html.length));
    return id;
}
function independentRejectedFaceReason(code = '') {
    const reason = String(code || '');
    const serial = {
        'serial-http-error': __rmT("6wh.rZfv5A4oY5j7UpGXoJmXs8_hy1Yz9NS7kS2ZQQIEHFip7Jc6aZRbtwfbRvZ_Nda1gzjKXOBWPfMv7PkH4E1ujy2tSvjRAs0JI7Uq_rsXxYpWPC8G3h"),
        'serial-auth': __rmT("S.WO2FjJEPwaexhpbRc4l_t0O6a0vHH7Rp8o6SkF"), 'serial-rate-limited': __rmT("G8FxM_fyqqP_Nz4E_ju_g6wpYDPnNSvjfNcbjOOEwUTtAw_lPfbPQh"),
        'serial-upstream-error': __rmT("cp4hN.WOBD62R5aRBjtHsvVFykarGGJr7miv3kJpes5FEeRxbnQ2aP7o3Rm1Ik"), 'serial-quota': __rmT("s_zraB8Bls03SkHh3_AjdK1T5ID"),
        'serial-model-refusal': __rmT("S.WO2FjJEPwaexhpbRaCkyAhf6AKAcyL7CWlTHmf"), 'serial-empty-response': __rmT("3j.4.756LoEQ5TeS63Oyp_wlC7h6VdWAVqHXZD1Fkt6f_N4FyI8WUW_x"),
        'serial-truncated': __rmT("B_nb.Q3pnoIPpzzs_v7bSbzoCcFfYaPayrgw_pRG32GwL4ideQyfc9116R_h2OsxVvBVVrvf"), 'serial-incomplete': __rmT("hjBpeMjYvjJGMpItKi2o9C5VFqCbcbFqAdUO5MgVJdrdEf"),
        'serial-empty-face': __rmT("XzoDISdkM18dIBd6p.8bYLjTrBQK_T"), 'serial-unparsed': __rmT("8l23In0PZymw8i4vCxfXEB9KpCBPhFnpMm8"),
        'serial-local-preflight': __rmT("1a5TqtWj3whodoI8.C1Glgv1v2LGEJv1ZwbFBGkjK5XSn9qmDl6v2AX.bTZ_q2.rdzMIeKdtpBC"), 'serial-network': __rmT("bDVdDu4IEwL6gY.Z"),
        'serial-not-sent': __rmT("2JbDJr69XAM6LnQfd4e7hAbGFmeJ6gv7GGaCO_AoujbEHBKXqz_"), 'atmosphere-ticket-missing': __rmT("w2mY0l4yqI_wCC.O4iFUDd3J"),
        'serial-face-failed': __rmT("lLjDJ4Btaq8josNqsxzEWs.OjTvEkk4UgUaYd30BUc7MC2F6cph"),
    }[reason];
    if (serial)
        return serial;
    if (reason.startsWith('serial-face-failed-'))
        return `${__rmT("In_Cx_Dg1g95ijwAdRtwDFso8bW2QRYZV06jXWdWRCp")}${reason.slice('serial-face-failed-'.length)}${__rmT("eXs")}`;
    if (/(?:unclosed|incomplete|face-count|missing-face|post-sanitize-protocol)/.test(reason))
        return __rmT("dJcyj84y5eEgc2OxWbNNd_Y7iMQcwn.POjIpxI15ZMXWrh");
    if (reason === 'multiface-empty-face')
        return __rmT("Kb46JDxTr0ZW7JU_v4vWT1MzALvR7BX.c4DF7k");
    if (/(?:post-sanitize-empty|sanitizer-rejected|sanitized-invalid)/.test(reason))
        return __rmT("2RzHtOZ2KySxkFUGs_5_1aAF1BZYvzLY.6RQqYf_");
    if (/(?:untrusted|reserved)/.test(reason))
        return __rmT("QDus1Xy.RyxbsO88JMGUubJxeeaa4scK2Tig7HRg346mxF4V");
    if (/(?:summary|title)/.test(reason))
        return __rmT("6PHTa3vTu_Qpq05MV8BDsQd4_rWLpoakNswZbZVnwlInD3Ak");
    if (/(?:budget|too-large|too-complex|quota)/.test(reason))
        return __rmT("TtZ14bGr5igImrdkgTGLOhVUyqGofM_FLEC");
    return __rmT("tknID2u3vRT54pxOFKMez1ke_2GcTYy_KFbvME_X");
}
function createIndependentMultifaceFailureSlot(faceIndex, failure = {}) {
    const code = String(failure?.code || 'incomplete-face').replace(/[^a-z0-9-]/gi, '').slice(0, 80) || 'incomplete-face';
    const ordinal = faceIndex + 1;
    const previewId = cacheIndependentRejectedFacePreview(String(failure?.previewHtml || ''));
    const previewButton = previewId ? `<button type="button" data-rm-rejected-preview-toggle="${previewId}${__rmT("kmLYwsT3TrE3WvdveZCFP1PVTdzJuKQi4hgfvKiQ9xigTdk.m2_")}` : '';
    const previewHost = previewId ? `<div data-rm-rejected-preview-host="${previewId}" hidden></div>` : '';
    return `<toto data-rabbit-mirror="true" data-rm-face="${ordinal}"><details ${MULTIFACE_FAILURE_ATTR}="${code}${__rmT("vKgLf3PX2ghWwQxP3KKU4TwdqkLrNeC6FOLzNIK7DCWYckIy")}${ordinal}${__rmT("Zl4AVEU01XQblX236dzjQ7r.Be6nP4QTTySuhXbiJ9B7pYPPH1e7khm_PGm2yrwwgGn6x7jArQHtnh7gSNWTI8AM_XK3fcj1WkhyDSRbjdk")}${independentRejectedFaceReason(code)}${__rmT("ESzN3kFTAZR7lzbM07KIdiuDlEeLmvVxcZ9.Fo9VdCafUNtI9ZeT8qdbo4E9xkXaJyXILt3x5Pgpe9fqyAu7BaE0ZAK3D1Xnw5Da5Uv_IxoX0kaZ8yObNu_gWdsfof")}${previewButton}${__rmT("4AW1PNIMCoJYVnGh3WTErvZVKzR18DTpj76Q093jG6IvoqMcX4Gj9K7VICOESNtU.FuzXcUipTeYxp1HZpu3Gl.NVN0SKxhUE8RyXCZX2_qeww7Bs6l2XzU8mNF7YE6hts5Sa7naxVXB3AYQpRfA5TVlGNrYMRgwdNwr9spkUbyWzrQ6K2F5zAg2pcx926JPHgJ5Zf")}${previewHost}${__rmT("0I4L3IKTPrccbmV6fYcRpCp2FYFTCAQIDqtl_hGYt_2xNdZZVPZUOh594edfZqw8gq0WNyuxO6geewCqBCunBa80nYK3D1oninDA5Uv_IIoh0VNZFiOVNBBgAasfof")}`;
}
function readableGenericFailureReason(details) {
    const code = String(details.getAttribute(MULTIFACE_FAILURE_ATTR) || '');
    if (!code)
        return;
    const raw = `${__rmT("B3kZOdop")}${code}${__rmT("jzk")}`;
    for (const paragraph of details.querySelectorAll(':scope > p')) {
        const text = String(paragraph.textContent || '');
        if (!text.includes(raw))
            continue;
        const readable = code === 'serial-face-failed' && String(details.textContent || '').includes(__rmT("wiQZY9VzV570qMJ9SEf"))
            ? __rmT("V64xk.BZF_sRdXI8H2BTv9fNCBYMSqqqe_vgU82IS7SvGJbOS41popscTqkamseTr0DbUlFZLOG") : independentRejectedFaceReason(code);
        paragraph.textContent = text.replace(raw, `${__rmT("B3kZOdop")}${readable}${__rmT("jzk")}`);
        return;
    }
}
export function wireIndependentRejectedFaceControls(host) {
    for (const details of externalFaceDetails(host)) {
        if (!details.hasAttribute(MULTIFACE_FAILURE_ATTR))
            continue;
        try {
            readableGenericFailureReason(details);
        }
        catch { }
        const actions = details.querySelector(':scope > [data-rm-rejected-face-actions]');
        if (!actions)
            continue;
        const button = actions.querySelector('[data-rm-rejected-preview-toggle]');
        const target = details.querySelector(':scope > [data-rm-rejected-preview-host]');
        if (button && target && !independentRejectedFaceControlsWired.has(button)) {
            independentRejectedFaceControlsWired.add(button);
            const id = String(button.getAttribute('data-rm-rejected-preview-toggle') || '');
            const closePreview = () => {
                target.hidden = true;
                if (target.childNodes.length)
                    target.replaceChildren();
                const available = independentRejectedFacePreviews.has(id);
                button.textContent = available ? __rmT("hhHuNaO3VkEX6y.9.XC") : __rmT("lXaI4yeu4HGTHT");
                button.setAttribute('aria-expanded', 'false');
                button.disabled = !available;
            };
            closePreview();
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                if (!target.hidden) {
                    closePreview();
                    return;
                }
                const html = independentRejectedFacePreviews.get(id);
                if (!html) {
                    closePreview();
                    return;
                }
                const template = document.createElement('template');
                template.innerHTML = html;
                for (const child of template.content.children) {
                    if (child.tagName === 'DETAILS')
                        child.open = true;
                    else if (child.tagName === 'TOTO') {
                        const face = child.querySelector(':scope > details');
                        if (face)
                            face.open = true;
                    }
                }
                target.replaceChildren(template.content);
                target.hidden = false;
                button.textContent = __rmT("bMMH43DIncl");
                button.setAttribute('aria-expanded', 'true');
            }, true);
            details.addEventListener('toggle', () => { if (!details.open)
                closePreview(); });
        }
        const resay = actions.querySelector('[data-rm-rejected-face-resay]');
        if (resay && !independentRejectedFaceControlsWired.has(resay)) {
            independentRejectedFaceControlsWired.add(resay);
            resay.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                void import('../outputSanitizer/toolsChrome.js?rmv=2.1.4').then(module => module.openRabbitMirrorResayChooser(details)).catch(() => globalThis.toastr?.warning?.(__rmT("Qpl_vG7HBRK8aT5PZ2ApY1YuYGFaQMxLx7YyEINjKZ_.QzQX")));
            }, true);
        }
    }
}
export function repairMultifaceDrawNotesTail(raw) {
    const source = String(raw || '');
    const starts = [...source.matchAll(/<toto\b[^>]*>/gi)];
    if (!starts.length)
        return source;
    const last = starts[starts.length - 1];
    const tail = source.slice(last.index);
    if (/<\/toto\s*>/i.test(tail))
        return source;
    const repaired = salvageCutDrawNotesDetail(tail);
    return repaired.html ? source.slice(0, last.index) + repaired.html : source;
}
function prepareIndependentMultifaceResult(raw, metadata, requestDiagnostic, requestOptions = {}) {
    raw = repairMultifaceDrawNotesTail(raw);
    const parsed = parseMultifaceOutput(raw, { expectedCount: Number(metadata.faceCount) });
    const sourceFaces = recoverableMultifaceFrames(parsed).slice();
    const canSalvageLongText = Array.isArray(metadata?.faces) && metadata.faces.some(face => face?.requestedPresentationMode === 'longtext') && !!salvageLongTextProse(raw);
    if (!sourceFaces.length && !canSalvageLongText) {
        const first = parsed.errors?.[0] || {};
        const detail = { completedFaces: parsed.faces?.length || 0, expectedFaces: metadata.faceCount,
            protocolErrorCode: String(first.code || 'face-count-mismatch').slice(0, 120),
            protocolOffset: Number.isSafeInteger(first.offset) && first.offset >= 0 ? first.offset : undefined,
            terminalFace: first.terminalFace };
        republishIndependentSemanticFailure(requestDiagnostic, 'multiface-incomplete', '', { responseChars: raw.length, ...detail });
        throw independentMultifacePostprocessError(`${__rmT(".BVQPtcXVGVTf91.SymeQOiMplAET35UsY986TvM4g8")}${parsed.faces?.length || 0}/${metadata.faceCount}${__rmT("2RddPk")}${detail.terminalFace ? `${__rmT("sW5o9cc6")}${detail.terminalFace}${__rmT("2RddPk")}` : ''}${__rmT("7os")}${detail.protocolErrorCode}${__rmT("G3N6fajTgp2G4EIhd_dmtGuk2pOQ1EdcLk03wqRaMGQXWWrznWKOWepvzBG")}${independentMultifaceIncompleteHint(detail.protocolErrorCode, requestDiagnostic?.finishReason)}`, 'multiface-incomplete', -1, detail);
    }
    const count = Number(metadata.faceCount);
    const prepared = Array(count).fill(null);
    const scans = Array(count).fill(null);
    const failures = Array(count).fill(null);
    const seenTitles = new Set();
    let tailUsed = false;
    const metaFaces = Array.isArray(metadata?.faces) ? metadata.faces : [];
    for (let index = 0; index < count; index += 1) {
        if (sourceFaces.some(face => face.index === index))
            continue;
        if (!tailUsed && metaFaces[index]?.requestedPresentationMode === 'longtext') {
            const prose = salvageLongTextProse(raw);
            if (prose) {
                tailUsed = true;
                sourceFaces.push(salvagedLongTextFace(prose, index));
                continue;
            }
        }
        failures[index] = { faceIndex: index, status: 'failed', code: String(parsed.errors?.[0]?.code || 'incomplete-face') };
    }
    for (const face of sourceFaces) {
        try {
            const prefix = `${__rmT("VcRro5_pp6OBTh")}${face.index + 1}${__rmT("qGyf7aop")}`;
            if (typeof document !== 'undefined') {
                const sourceTemplate = document.createElement('template');
                sourceTemplate.innerHTML = face.html;
                if (sourceTemplate.content.querySelector(`[${MULTIFACE_FAILURE_ATTR}]`))
                    throw independentMultifacePostprocessError(`${prefix}${__rmT("CZPhkrG9ZmBTaLO6XnvwSUO.HM5LiC_C29E")}`, 'multiface-untrusted-failure-marker', face.index);
                if (sourceTemplate.content.querySelector('[data-rabbit-mirror-css-scope]'))
                    throw independentMultifacePostprocessError(`${prefix}${__rmT("f6N.PBbtniSHRTdnVppEo8UyAoLUo7JsTbE_L84wzNfXWLLikM5swpo.b9WFMwNRWUE")}`, 'multiface-untrusted-css-scope', face.index);
            }
            if (!independentMirrorBodyEvidence(face.inner))
                throw independentMultifacePostprocessError(`${prefix}${__rmT("2LoTVp6maUpYtvu2UTBc0T_EezXrn_zP5yhB.d7aMGQXWWrznWKOWepvzBG")}`, 'multiface-empty-face', face.index);
            const html = prepareIndependentReadyHtml(bindRolePaletteCode(face.inner, metaFaces[face.index], requestOptions.colorAtmosphereNotes?.[face.index]));
            if (!html || !independentMirrorBodyEvidence(html))
                throw independentMultifacePostprocessError(`${prefix}${__rmT("9J6z6iCPqYX8faMs3SxnPiwPWfESk9i73CvXOpYD2pdkZGKXq8_")}`, 'multiface-post-sanitize-empty', face.index);
            const scan = scanRabbitMirrorHtml(wrappedIndependentMirrorHtml(html), null) || {};
            const candidate = wrapPreparedIndependentFace(html, face.index);
            const title = normalizedSummaryText(parseMultifaceOutput(candidate).faces[0]?.summaryHtml || '');
            if (!title || seenTitles.has(title))
                throw independentMultifacePostprocessError(`${prefix}${__rmT("ASSStRl9SJ8ewoGggENVy8r4NiuVF7PQdvgFQjLrgG8")}`, 'multiface-sanitized-duplicate-summary', face.index);
            seenTitles.add(title);
            prepared[face.index] = candidate;
            scans[face.index] = { ...scan, faceIndex: face.index };
        }
        catch (error) {
            if (!error?.rabbitMirrorMultifaceDiagnostic)
                throw error;
            failures[face.index] = { faceIndex: face.index, status: 'failed', code: String(error.code || 'multiface-postprocess').slice(0, 80) };
        }
    }
    const succeeded = scans.filter(Boolean).length;
    if (!succeeded)
        throw independentMultifacePostprocessError(__rmT("V1tIO3skVKwqQsrCA7W2R9Wyq2Tb00sUa6q9Zo8Hpb_sGOW6Jb3td15X"), 'multiface-all-failed', -1, { completedFaces: 0, expectedFaces: count, failedFaces: failures.filter(Boolean) });
    for (let index = 0; index < count; index += 1)
        if (!prepared[index])
            prepared[index] = createIndependentMultifaceFailureSlot(index, failures[index]);
    const html = prepared.join('\n');
    const finalProtocol = parseMultifaceOutput(html, { expectedCount: Number(metadata.faceCount) });
    if (!finalProtocol.ok) {
        const first = finalProtocol.errors?.[0] || {};
        throw independentMultifacePostprocessError(__rmT("XPXQcPqXzowu4asMzYq1osL_3frUn.NS7EKA0uDJNpOqcXZ.oDF4ksgKBE2ZKxdWXenjbvzJwzbXtEH9"), 'multiface-post-sanitize-protocol', -1, {
            protocolErrorCode: String(first.code || 'face-count-mismatch').slice(0, 120),
            protocolOffset: Number.isSafeInteger(first.offset) && first.offset >= 0 ? first.offset : undefined,
            terminalFace: first.terminalFace,
        });
    }
    assertIndependentMarkupComplexityWithDiagnostic(html, 'multiface-sanitized', requestDiagnostic);
    return { html, faceScans: scans, failedFaces: failures.filter(Boolean), completedFaces: succeeded };
}
function independentPromptOwnerPreflightError() {
    const error = new Error(__rmT("ZF.TQTAj5MxT7fiBijSxm8swFUkXkIli61Sruo6_MjaomhdC5Y_FO4gAkCFuH.k8EJpjIfDSwirX9o.fllULIR.TJ3mo9cnmqlceh4jnK8BO6dmTordzy5XNNofEZf"));
    error.name = 'RabbitMirrorPromptOwnerPreflightError';
    error.code = 'RABBIT_MIRROR_DISPATCH_LEASE_REJECTED';
    error.requestCount = 0;
    return error;
}
function independentExternalPromptPreflightError(cause, owner) {
    const known = independentLocalPreflightFailure(cause);
    const appearanceFailure = known && /^RABBIT_MIRROR_APPEARANCE_/.test(known.code);
    const memoryFailure = known?.code === 'RABBIT_MIRROR_MEMORY_STALE';
    const needsRebuild = cause?.code === 'WORLD_BOOK_ENTRY_STATE_CONFLICT' && cause?.details?.reason === 'metadata-rebuild-required';
    const explanation = describeExternalWorldBookPreflightFailure(known || cause);
    const error = new Error(cause?.code === 'RABBIT_MIRROR_CHARACTER_WORLD_BOOK_UNAVAILABLE'
        ? `${__rmT("uPV76MTEOgf8tR_lN1yOVFrN_ZiWRsoVp4ZNGjqXYd_ZgyLJrCMYhEisyfz2Lt2OhxaMgnXTbCdbDSjjF6sWwexsRIgLo.f7PdkuWNRHZ_1K.VoqfTHYWrIpJpVoxjqvDd3C1XRTv2SicdfF")}${cause?.message || ''}` : memoryFailure ? `${known.message}${__rmT("wHJJw9rj2GNyxs4Ofk3sekCcbNs")}` : appearanceFailure
        ? `${known.code === 'RABBIT_MIRROR_APPEARANCE_MISSING' ? __rmT("y4rscIbfwdtueYAQjOXyIXZeRi7EkMf.FxOc2YLA5U_dg0BS2pG3AELw.jQo2ewLRzU5THHRRm61bvAtEZ1qcumEW.YwrJPPQj7pFiptXj5yhwdFlzY7Ov8avT.5.vXD5RlOOXL2T_ax5ENAa_6FLt8q0GKefqi24m86E.itkX5Gkf") : __rmT("nVQPAgGGG43RChc7yJGe.TZZFn8LWcCGl7z4F5qo7O_xTvUDokmj8t1gKyEpWCUFSjlsl.VW5m_Vwl_uBDpE.ZHmWAT")}${__rmT("hAI5FebOWZY")}${known.code}${__rmT("VF39R2txQPm4OWl48TyKguEoNoBHXvBrYobFQNcYgG8")}` : needsRebuild
        ? __rmT("tFuY1AGas_OIJwbpEtq_oFWeF.a5k8PEVaUVtq6bdV9QUoZrygEqtmT2MHi4O3PPAou6UStW5eJKt3Bm7j29J.rHFsBu2Pdyu8pD.ARNqmywNhmr3AhcuWgHvMbnEzYduWn2YAoAR7gdwXMIrwqnFeFL") : `${explanation.message}${__rmT("UqL44PHOtP.Stf")}${explanation.code}${__rmT("L4iVtO2AS3zrWZNdmWaKH78trSAc.LwMU2aFmN0PhN6mr4M5Uu8QOYypq6zv5n0FXOpiBc1vzWvl0t_DB8xL26aBWAT")}`);
    error.name = 'RabbitMirrorExternalPromptPreflightError';
    error.code = known?.code || 'RABBIT_MIRROR_EXTERNAL_PREFLIGHT_REJECTED';
    error.requestCount = 0;
    error.cause = cause;
    error.rabbitMirrorRequestDiagnostic = {
        ok: false, requestCount: 0, semanticFailure: 'local-preflight', transportCause: 'local-preflight', nextProfile: '',
        automaticRetry: false, automaticProfileFallback: false,
        chatKeyHash: hashText(owner.chatKey), mesid: owner.index, swipe: owner.swipe, sourceHash: owner.sourceHash,
        baseSlotHash: hashText(owner.baseSlot), operationEpoch: owner.operationEpoch,
    };
    return error;
}
function independentPromptBatchSignature(plan, owner) {
    if (!plan)
        return '';
    const identity = plan.identity;
    const count = plan.requestedFaceCount;
    if (plan.kind !== 'rabbit-mirror-multiface-plan' || plan.schemaVersion !== 1
        || typeof plan.batchId !== 'string' || !plan.batchId || plan.batchId.length > 2048
        || identity?.chatKey !== owner.chatKey || identity?.generationScopeKey !== owner.generationScopeKey
        || identity?.mesid !== owner.index || identity?.swipeId !== owner.swipe || identity?.sourceHash !== owner.sourceHash
        || !Number.isSafeInteger(count) || count < 2 || count > 5 || !Array.isArray(plan.faces) || plan.faces.length !== count)
        throw independentPromptOwnerPreflightError();
    const faces = plan.faces.map((face, index) => {
        if (face?.faceIndex !== index || !face.combo)
            throw independentPromptOwnerPreflightError();
        const ids = kind => {
            const values = face.combo[kind];
            if (!Array.isArray(values) || values.length > 16 || values.some(id => typeof id !== 'string' || !id || id.length > 2048))
                throw independentPromptOwnerPreflightError();
            return values;
        };
        return [index, ids('themeIds'), ids('formatIds'), ...((face.combo?.presentationMode || face.combo?.visualSceneryCombination === true) ? [presentationModeFields(face.combo)] : [])];
    });
    return JSON.stringify([plan.batchId, identity.chatKey, identity.generationScopeKey, identity.mesid, identity.swipeId, identity.sourceHash, identity.settingsKey, count, faces]);
}
function independentCreationSettingsKey(settings) {
    return JSON.stringify([settings.writingStyle || '', settings.rabbitMirrorPresentationModes || [], settings.rabbitMirrorFaceDrawRules || []]);
}
function captureIndependentPromptOwner(ctx, index, msg, signal, requestOptions, generationScopeKey) {
    const baseSlot = messageBaseSlotKey(ctx, index, msg);
    const owner = { chat: ctx?.chat, index, message: msg, chatKey: chatKey(ctx), swipe: swipeId(msg), sourceHash: messageSourceFingerprint(msg),
        baseSlot, operationEpoch: operationEpochForBase(baseSlot), signal, requestOptions, generationScopeKey,
        earlyBody: requestOptions.earlyBodyOwner || null, manualBody: requestOptions.manualBodyOwner || null,
        awaited: false, batchPlan: null, batchSignature: '', batchBound: false, batchPublished: false, batchReleaseIdentity: null };
    const currentSettings = getSettings();
    const character = ctx.characters?.[ctx.characterId] || ctx.character || null;
    owner.creationSettingsKey = independentCreationSettingsKey(currentSettings);
    owner.characterWorldBook = { enabled: currentSettings.independentReadCharacterWorldBook === true, characterId: ctx.characterId, character,
        linkedName: String(character?.data?.extensions?.world || ''), embedded: character?.data?.character_book ?? character?.character_book,
        disabledBooks: JSON.stringify(currentSettings.independentWorldInfoDisabledBooks || []) };
    assertIndependentPromptOwner(owner);
    return owner;
}
function assertIndependentPromptOwner(owner) {
    if (owner.creationSettingsKey !== undefined && owner.creationSettingsKey !== independentCreationSettingsKey(getSettings()))
        throw independentPromptOwnerPreflightError();
    if (owner.earlyBody)
        assertEarlyBodyOwner(owner.earlyBody);
    if (owner.manualBody && !manualBodyOwnerCurrent(owner.manualBody))
        throw independentPromptOwnerPreflightError();
    if (independentGenerationTiming(getSettings()) === 'off'
        || (!owner.requestOptions.dispatchLease?.consumed?.() && !owner.requestOptions.manualRetry && !owner.manualBody && !automaticIndependentTiming()))
        throw independentPromptOwnerPreflightError();
    if (owner.memoryRequestSettingsKey)
        assertMemoryRequestSettings(getSettings(), owner.memoryRequestSettingsKey, 'independent');
    const reference = owner.appearanceReference;
    if (reference) {
        const current = getSettings();
        if ((current.appearanceReferenceEnabled === true) !== reference.enabled
            || (reference.enabled && String(current.appearanceReferenceRevision || '') !== reference.revision)) {
            const error = new Error(__rmT("nVQPAgGGG4bH7YUQDNppfEZ0rnb3H6hoF2xwC5Wi6O1ZgBa4.k85c15bszYx7hSeCXM8M4L7oZtjwDfZkJHE3ZHmWAT"));
            error.code = 'RABBIT_MIRROR_APPEARANCE_STALE';
            error.requestCount = 0;
            throw error;
        }
    }
    const live = getContext();
    if (owner.avatarIdentity !== undefined && owner.avatarIdentity !== rabbitMirrorAvatarPromptIdentity(live))
        throw independentPromptOwnerPreflightError();
    const characterBook = owner.characterWorldBook;
    if (characterBook) {
        const settings = getSettings();
        const character = live.characters?.[live.characterId] || live.character || null;
        if ((settings.independentReadCharacterWorldBook === true) !== characterBook.enabled
            || (characterBook.enabled && (live.characterId !== characterBook.characterId || character !== characterBook.character
                || String(character?.data?.extensions?.world || '') !== characterBook.linkedName
                || (character?.data?.character_book ?? character?.character_book) !== characterBook.embedded
                || JSON.stringify(settings.independentWorldInfoDisabledBooks || []) !== characterBook.disabledBooks)))
            throw independentPromptOwnerPreflightError();
    }
    if (owner.signal?.aborted || !Array.isArray(owner.chat) || live?.chat !== owner.chat
        || !Number.isSafeInteger(owner.index) || owner.index < 0 || live.chat[owner.index] !== owner.message
        || chatKey(live) !== owner.chatKey || swipeId(owner.message) !== owner.swipe
        || (!owner.earlyBody && !owner.manualBody && messageSourceFingerprint(owner.message) !== owner.sourceHash)
        || messageBaseSlotKey(live, owner.index, owner.message) !== owner.baseSlot
        || operationEpochForBase(owner.baseSlot) !== owner.operationEpoch
        || (Number.isSafeInteger(owner.requestOptions.dispatchLease?.epoch) && owner.requestOptions.dispatchLease.epoch !== owner.operationEpoch)
        || (owner.awaited && typeof owner.requestOptions.isPromptOwnerCurrent === 'function' && !owner.requestOptions.isPromptOwnerCurrent())
        || independentPromptBatchSignature(owner.batchPlan, owner) !== owner.batchSignature
        || (owner.batchPublished && typeof owner.requestOptions.currentBatchPlan === 'function' && owner.requestOptions.currentBatchPlan() !== owner.batchPlan))
        throw independentPromptOwnerPreflightError();
}
async function loadIndependentAppearanceReference(owner) {
    if (!owner.appearanceReference?.enabled)
        return null;
    let module;
    assertIndependentPromptOwner(owner);
    try {
        try {
            module = await import('../appearanceReference.js?rmv=2.1.4');
        }
        catch {
            const error = new Error(__rmT("IS67c4vVThP1Ly.hIHwohgJTlK4AnIsOwptpMBsmkfV43khz3.ytHEzTNaGYuyMbYxZPOYn6ZdtH0StbyfW9hLGu"));
            error.code = 'RABBIT_MIRROR_APPEARANCE_MODULE_UNAVAILABLE';
            error.requestCount = 0;
            throw error;
        }
    }
    finally {
        owner.awaited = true;
        assertIndependentPromptOwner(owner);
    }
    try {
        return await module.loadAppearanceReferenceMaterial(owner.appearanceReference.revision);
    }
    finally {
        owner.awaited = true;
        assertIndependentPromptOwner(owner);
    }
}
function bindIndependentPromptBatch(owner, plan = null) {
    const signature = independentPromptBatchSignature(plan, owner);
    if (owner.batchBound && signature !== owner.batchSignature)
        throw independentPromptOwnerPreflightError();
    if (!owner.batchBound && plan) {
        const identity = plan.identity;
        owner.batchReleaseIdentity = Object.freeze({ batchId: plan.batchId, identity: Object.freeze({
                chatKey: identity.chatKey, generationScopeKey: identity.generationScopeKey, mesid: identity.mesid,
                swipeId: identity.swipeId, sourceHash: identity.sourceHash, settingsKey: identity.settingsKey,
            }) });
    }
    owner.batchPlan = plan;
    owner.batchSignature = signature;
    owner.batchBound = true;
    assertIndependentPromptOwner(owner);
}
function settleAtmosphereSingle(note, metadata, diagnostic) {
    const menu = metadata?.atmosphereMenu;
    if (!Array.isArray(menu) || menu.length < 2)
        return;
    if (note?.choice == null)
        throw Object.assign(new Error(__rmT("WzGXrD65RKehvXL3XIe4j0xWnPIeHDWY29E")), { code: 'ATMOSPHERE_TICKET_MISSING' });
    applyAtmosphereFields(diagnostic, menu, note);
}
function settleAtmosphereMultiface(prepared, metadata, notes) {
    const faces = Array.isArray(metadata?.faces) && metadata.faces.length ? metadata.faces : [metadata];
    const menus = faces.map(face => face?.atmosphereMenu || null);
    if (!menus.some(menu => Array.isArray(menu) && menu.length > 1))
        return prepared;
    const parsed = parseMultifaceOutput(prepared.html, { expectedCount: menus.length });
    const choices = menus.map((menu, index) => (Array.isArray(menu) && menu.length > 1 ? notes?.[index]?.choice ?? null : null));
    let html = stripAtmosphereChoiceMarkup(prepared.html || '');
    const failedFaces = Array.isArray(prepared.failedFaces) ? [...prepared.failedFaces] : [];
    const faceScans = Array.isArray(prepared.faceScans) ? [...prepared.faceScans] : null;
    choices.forEach((choice, index) => {
        const menu = menus[index];
        if (!Array.isArray(menu) || menu.length < 2)
            return;
        if (choice != null) {
            applyAtmosphereFields(faces[index], menu, notes[index]);
            return;
        }
        if (failedFaces.some(face => face?.faceIndex === index))
            return;
        const slot = createMultifaceFailureSlot(index, 'atmosphere-ticket-missing');
        const face = (parsed.faces || []).find(item => item.index === index);
        if (face?.html && html.includes(face.html))
            html = html.replace(face.html, slot);
        else
            html += `\n${slot}`;
        failedFaces.push({ faceIndex: index, status: 'failed', code: 'atmosphere-ticket-missing' });
        if (faceScans)
            faceScans[index] = null;
    });
    const completedFaces = menus.length - failedFaces.length;
    return { ...prepared, html, chosenTickets: choices, failedFaces, ...(faceScans ? { faceScans } : {}), completedFaces: Math.max(0, completedFaces) };
}
export function canonicalSerialFace(html, faceIndex) {
    const wrapped = wrapSerialFace(html, faceIndex);
    const ok = candidate => !!candidate && parseMultifaceOutput(`${candidate.replace(/data-rm-face\s*=\s*["']\d+["']/, 'data-rm-face="1"')}\n${createMultifaceFailureSlot(1)}`, { expectedCount: 2, storedDisplay: true }).ok;
    if (ok(wrapped))
        return wrapped;
    if (typeof document === 'undefined')
        return '';
    const template = document.createElement('template');
    template.innerHTML = String(html || '');
    const details = template.content.querySelector('details');
    if (!details)
        return '';
    const summary = details.querySelector(':scope > summary');
    const scoped = details.parentElement?.closest?.('[data-rabbit-mirror-css-scope]');
    if (scoped && !details.hasAttribute('data-rabbit-mirror-css-scope'))
        details.setAttribute('data-rabbit-mirror-css-scope', scoped.getAttribute('data-rabbit-mirror-css-scope'));
    const carried = [...template.content.querySelectorAll('style, svg, input')].filter(node => !details.contains(node) && !node.parentElement?.closest?.('svg'));
    let anchor = summary || null;
    for (const node of carried) {
        details.insertBefore(node, anchor ? anchor.nextSibling : details.firstChild);
        anchor = node;
    }
    for (const nested of [...details.querySelectorAll('toto')])
        nested.replaceWith(...nested.childNodes);
    const candidate = wrapPreparedIndependentFace(details.outerHTML, faceIndex);
    return ok(candidate) ? candidate : '';
}
function wrapSerialFace(html, faceIndex) {
    const ordinal = faceIndex + 1;
    const text = String(html || '').trim();
    if (/<toto\b/i.test(text)) {
        if (/data-rm-face\s*=/.test(text))
            return text.replace(/data-rm-face\s*=\s*["']\d+["']/, `data-rm-face="${ordinal}"`);
        return text.replace(/<toto\b/i, `<toto data-rm-face="${ordinal}"`);
    }
    return `<toto data-rabbit-mirror="true" data-rm-face="${ordinal}">${text}</toto>`;
}
function serialRemoteRejection(error) {
    const diagnostic = error?.rabbitMirrorRequestDiagnostic || {};
    const status = Number(diagnostic?.transport?.status ?? diagnostic?.status ?? error?.status ?? 0);
    if (diagnostic?.transport?.failureCategory === 'authentication' || diagnostic?.failureCategory === 'authentication' || status === 401 || status === 403)
        return 'authentication';
    if ([400, 404, 422].includes(status))
        return 'parameter-error';
    return '';
}
function serialFaceFailureCode(error) {
    const d = error?.rabbitMirrorRequestDiagnostic || {};
    const code = String(error?.code || '');
    const sem = String(d.semanticFailure || '');
    const status = Number(d?.transport?.status ?? d?.status ?? error?.status ?? 0);
    const message = String(error?.message || '');
    if (code === 'ATMOSPHERE_TICKET_MISSING')
        return 'atmosphere-ticket-missing';
    if (isQuotaInsufficientFailure(error, d))
        return 'serial-quota';
    if (status === 429)
        return 'serial-rate-limited';
    if (status === 401 || status === 403)
        return 'serial-auth';
    if (status >= 500 || code === 'RABBIT_MIRROR_GATEWAY_TIMEOUT')
        return 'serial-upstream-error';
    if (status >= 400)
        return 'serial-http-error';
    if (sem === 'model-refusal')
        return 'serial-model-refusal';
    if (sem === 'empty-response' || code === 'RABBIT_MIRROR_EMPTY_RESPONSE')
        return 'serial-empty-response';
    if (sem === 'truncated-output' || code === 'RABBIT_MIRROR_TRUNCATED_OUTPUT')
        return 'serial-truncated';
    if (sem === 'incomplete-mirror' || code === 'RABBIT_MIRROR_INCOMPLETE_MIRROR')
        return 'serial-incomplete';
    if (__rmR("3lrwwEOTXczzMOADFTGcEM2p0l_", "").test(message))
        return 'multiface-empty-face';
    if (__rmR("5tFLIvTchyHWXpcOq45r9rQM2jgFHFnpMm8", "").test(message))
        return 'multiface-post-sanitize-empty';
    if (__rmR("tmMwwOijwuF6axfrASTcEcWwxEf", "").test(message))
        return 'serial-empty-face';
    if (__rmR("IFUuc.8HQsnczrVZ", "").test(message))
        return 'serial-unparsed';
    if (isLocalPreflightFailure(error, d))
        return 'serial-local-preflight';
    if (__rmR("_DHaTeeMH75nV6wfzpwnm2roUL4uuKui1hgfvsvQPIiuTGzSoRf", "i").test(message))
        return 'serial-network';
    const detail = String(code || error?.name || '').replace(/^RABBIT_MIRROR_/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
    return detail && detail !== 'error' ? `serial-face-failed-${detail}` : 'serial-face-failed';
}
function serialFailureIsFatal(error, signal, hasSuccess = false) {
    if (signal?.aborted || error?.name === 'AbortError' || error?.rabbitMirrorLocalAbort === true)
        return true;
    const diagnostic = error?.rabbitMirrorRequestDiagnostic || {};
    if (isQuotaInsufficientFailure(error, diagnostic))
        return true;
    const status = Number(diagnostic?.transport?.status ?? diagnostic?.status ?? error?.status ?? 0);
    if (diagnostic?.transport?.failureCategory === 'authentication' || diagnostic?.failureCategory === 'authentication' || [401, 403].includes(status))
        return true;
    if (!hasSuccess && [400, 404, 422].includes(status))
        return true;
    if (error?.name === 'RabbitMirrorPromptOwnerPreflightError' || String(error?.code || '') === 'RABBIT_MIRROR_DISPATCH_LEASE_REJECTED')
        return true;
    if (!hasSuccess && isLocalPreflightFailure(error, diagnostic))
        return true;
    return false;
}
async function runIndependentSerialFaces({ ctx, index, msg, signal, requestOptions, promptPlan, promptOwner, details, st }) {
    const selections = promptPlanSelections(promptPlan);
    const faceCount = selections.length;
    if (!faceCount || faceCount !== (Number(details.metadata?.faceCount) || faceCount)) {
        throw Object.assign(new Error(__rmT("OMC72QtS04V7gGZzyMxfGbRTCihiYJSa4Tixg60Np4Ow3esMVg6lU1xmca.PMLLvWUE")), { code: 'MULTIFACE_PLAN_UNAVAILABLE', requestCount: 0 });
    }
    assertIndependentPromptOwner(promptOwner);
    if (details.batchPlan && !markPendingBatchAttempt(details.batchPlan, { transient: true })) {
        throw Object.assign(new Error(__rmT("igW2FRwAjemSyl7b8vXQXqmtQzPYbQNU.1v5.V6SmuIy.CHfF6q5WEDRzBG")), { code: 'MULTIFACE_PLAN_UNAVAILABLE', requestCount: 0 });
    }
    requestOptions.onBatchPlan?.(details.batchPlan || null);
    promptOwner.batchPublished = true;
    const assertParentCurrent = () => {
        assertIndependentPromptOwner(promptOwner);
        if (typeof requestOptions.isPromptOwnerCurrent === 'function' && !requestOptions.isPromptOwnerCurrent())
            throw independentPromptOwnerPreflightError();
        if (details.batchPlan) {
            const registered = findPendingComboBatchPlan(details.batchPlan.identity);
            if (!registered || independentPromptBatchSignature(registered, promptOwner) !== promptOwner.batchSignature)
                throw independentPromptOwnerPreflightError();
        }
    };
    assertParentCurrent();
    requestOptions.onRequestSelection?.({ faceCount, faces: details.metadata?.faces || [], serialDispatch: true });
    const htmlByFace = Array(faceCount).fill('');
    const faceScans = Array(faceCount).fill(null);
    const failed = new Set(Array.from({ length: faceCount }, (_, faceIndex) => faceIndex));
    const choices = Array(faceCount).fill(null);
    const designSelectionChecks = [];
    const acceptFace = (faceIndex, faceResult) => {
        const menu = selections[faceIndex]?.combo?.atmosphereMenu;
        let html = stripAtmosphereChoiceMarkup(faceResult?.html || '');
        if (Array.isArray(menu) && menu.length > 1) {
            const note = faceResult?.atmosphereNote || { choice: null, reason: '' };
            if (note.choice == null)
                throw Object.assign(new Error(`${__rmT("BJgCyT")}${faceIndex + 1}${__rmT("9TeHeEQUHQDrllqukN40BmWFkrJ66xs2")}`), { code: 'ATMOSPHERE_TICKET_MISSING' });
            choices[faceIndex] = note.choice;
            applyAtmosphereFields(details.metadata?.faces?.[faceIndex], menu, note);
        }
        if (!html)
            throw new Error(`${__rmT("BJgCyT")}${faceIndex + 1}${__rmT("uNe_TYADWKMKD5Q2yhSOicRRIU3YhA6A29E")}`);
        const designCheck = faceResult?.requestDiagnostic?.designSelectionChecks?.[0];
        if (designCheck)
            designSelectionChecks.push({ ...designCheck, faceIndex });
        const canonical = canonicalSerialFace(html, faceIndex);
        if (!canonical)
            throw Object.assign(new Error(`${__rmT("BJgCyT")}${faceIndex + 1}${__rmT("tMyfakKiY3DcfnKBphXSjlLqiHTMnNvLA0Mspf")}`), { code: 'serial-face-unstorable' });
        htmlByFace[faceIndex] = canonical;
        failed.delete(faceIndex);
        try {
            requestOptions.onSerialPartial?.({
                faceCount,
                missing: [...failed],
                html: selections.map((_, index) => htmlByFace[index]
                    || createIndependentMultifaceFailureSlot(index, { faceIndex: index, status: 'failed', code: 'serial-not-sent' })).join('\n'),
            });
        }
        catch (error) {
            console.debug('[RabbitMirror] serial partial report skipped:', error);
        }
        try {
            faceScans[faceIndex] = { ...scanRabbitMirrorHtml(htmlByFace[faceIndex], null), faceIndex };
        }
        catch (error) {
            console.debug('[RabbitMirror] serial visual scan skipped:', error);
            faceScans[faceIndex] = { faceIndex, visualSignature: '', visualSkeleton: '', riskFlags: [] };
        }
    };
    const sendFace = async (faceIndex) => {
        assertParentCurrent();
        requestOptions.onProgress?.('serial-face-start', { faceIndex, faceCount });
        const result = await callIndependentApi(ctx, index, msg, signal, {
            ...requestOptions,
            currentBatchPlan: () => null,
            isPromptOwnerCurrent: () => { assertParentCurrent(); return true; },
            dispatchLease: { ...requestOptions.dispatchLease, consume() {
                    assertParentCurrent();
                    return requestOptions.dispatchLease?.consume?.() === true;
                } },
            serialChild: true,
            pinnedSelections: [selections[faceIndex]],
            serialFaceIndex: faceIndex,
            serialFaceCount: faceCount,
            serialPaletteObservations: faceScans.flatMap((scan, index) => scan ? [{
                    faceIndex: index,
                    presentationMode: details.metadata?.faces?.[index]?.presentationMode,
                    pureOrder: details.metadata?.faces?.[index]?.pureOrder === true,
                    paletteFingerprint: scan.paletteFingerprint,
                }] : []),
            onBatchPlan() { },
            onRequestSelection() { },
        });
        assertParentCurrent();
        return result;
    };
    let fatalError = null;
    const faceFailures = new Map();
    for (const faceIndex of [...failed]) {
        if (signal?.aborted) {
            fatalError = Object.assign(new Error(__rmT("nG0djjtjN27mgLNJ4HqpUT")), { name: 'AbortError' });
            break;
        }
        try {
            acceptFace(faceIndex, await sendFace(faceIndex));
        }
        catch (error) {
            faceFailures.set(faceIndex, serialFaceFailureCode(error));
            if (serialFailureIsFatal(error, signal, htmlByFace.some(Boolean))) {
                fatalError = error;
                break;
            }
        }
    }
    if (!fatalError && failed.size && requestOptions.manualRetry !== true && automaticRerollEnabled(st)) {
        const queue = [...failed];
        let used = 0;
        const budget = configuredAutomaticRerollMax(st);
        while (queue.length && used < budget) {
            if (signal?.aborted) {
                fatalError = Object.assign(new Error(__rmT("nG0djjtjN27mgLNJ4HqpUT")), { name: 'AbortError' });
                break;
            }
            const faceIndex = queue.shift();
            used += 1;
            try {
                acceptFace(faceIndex, await sendFace(faceIndex));
            }
            catch (error) {
                faceFailures.set(faceIndex, serialFaceFailureCode(error));
                if (serialFailureIsFatal(error, signal, htmlByFace.some(Boolean))) {
                    fatalError = error;
                    break;
                }
                if (failed.has(faceIndex) && !isLocalPreflightFailure(error, error?.rabbitMirrorRequestDiagnostic || {}))
                    queue.push(faceIndex);
            }
        }
    }
    if (fatalError && !htmlByFace.some(Boolean))
        throw fatalError;
    if (failed.size === faceCount)
        throw fatalError || Object.assign(new Error(__rmT("0hgpn.I._MHHrDEl8nDKWE5_bNs")), { code: 'multiface-all-failed' });
    const stoppedDiagnostic = fatalError ? {
        serialStopped: true,
        semanticFailure: signal?.aborted || fatalError.name === 'AbortError' || fatalError.rabbitMirrorLocalAbort === true
            ? 'cancelled' : isQuotaInsufficientFailure(fatalError, fatalError.rabbitMirrorRequestDiagnostic || {})
            ? 'insufficient-quota' : serialRemoteRejection(fatalError) || 'local-preflight',
        terminalErrorCode: String(fatalError.code || fatalError.name || 'serial-stopped'),
    } : {};
    const joined = () => selections.map((_, faceIndex) => htmlByFace[faceIndex] || createIndependentMultifaceFailureSlot(faceIndex, { faceIndex, status: 'failed', code: faceFailures.get(faceIndex) || 'serial-face-failed' })).join('\n');
    const fits = () => {
        const html = joined();
        try {
            assertIndependentMarkupComplexity(html);
        }
        catch (error) {
            if (String(error?.code || '') === 'RABBIT_MIRROR_MARKUP_TOO_COMPLEX')
                return false;
        }
        return parseMultifaceOutput(html, { expectedCount: faceCount, storedDisplay: true }).ok;
    };
    let budgetDemoted = false;
    while (!fits() && htmlByFace.filter(Boolean).length > 1) {
        budgetDemoted = true;
        let largest = -1;
        htmlByFace.forEach((html, faceIndex) => { if (html && (largest < 0 || html.length > htmlByFace[largest].length))
            largest = faceIndex; });
        htmlByFace[largest] = '';
        failed.add(largest);
        faceFailures.set(largest, 'serial-batch-budget');
        if (faceScans)
            faceScans[largest] = null;
    }
    const failedFaces = [...failed].map(faceIndex => ({ faceIndex, status: 'failed', code: faceFailures.get(faceIndex) || (fatalError ? 'serial-not-sent' : 'serial-face-failed') }));
    return {
        html: selections.map((_, faceIndex) => htmlByFace[faceIndex] || createIndependentMultifaceFailureSlot(faceIndex, failedFaces.find(item => item.faceIndex === faceIndex))).join('\n'),
        faceScans,
        failedFaces, completedFaces: faceCount - failed.size, batchPlan: details.batchPlan || null, chosenTickets: choices,
        requestDiagnostic: { visualHistoryBatchId: details.batchPlan?.batchId || '', faceCount, serialDispatch: true, partial: failed.size > 0, failedFaces, completedFaces: faceCount - failed.size, faces: details.metadata?.faces || [], ...stoppedDiagnostic, ...(budgetDemoted ? { serialStopped: true } : {}), ...(designSelectionChecks.length ? { designSelectionChecks } : {}) },
        executionLockChars: String(details.executionLock || '').length,
    };
}
export async function callIndependentApi(ctx, index, msg, signal = null, requestOptions = {}) {
    const currentSettings = getSettings();
    const missingRetry = requestOptions.missingFaceRetry;
    const missingIndexes = Array.isArray(missingRetry?.indexes) ? missingRetry.indexes.filter(index => Number.isInteger(index) && index >= 0 && index <= 4) : [];
    const resay = missingIndexes.length ? null : requestOptions.multifaceResay;
    const st = missingIndexes.length
        ? { ...currentSettings, rabbitMirrorFaceCount: missingIndexes.length }
        : resay ? { ...currentSettings, rabbitMirrorFaceCount: 1,
            rabbitMirrorPresentationModes: [currentSettings.rabbitMirrorPresentationModes?.[resay.faceIndex] || 'auto'] }
            : currentSettings;
    const advancedSettings = Object.freeze({ independentAdvancedEnabled: currentSettings.independentAdvancedEnabled === true,
        independentReasoningEffort: currentSettings.independentReasoningEffort ?? '', independentExtraParams: currentSettings.independentExtraParams ?? '',
        independentExcludedParams: Array.isArray(currentSettings.independentExcludedParams) ? Object.freeze(currentSettings.independentExcludedParams.slice(0, 11))
            : currentSettings.independentExcludedParams === undefined ? Object.freeze([]) : currentSettings.independentExcludedParams });
    const assertAdvancedCurrent = () => {
        const current = getSettings();
        if ((current.independentAdvancedEnabled === true) !== advancedSettings.independentAdvancedEnabled
            || (advancedSettings.independentAdvancedEnabled && ((current.independentReasoningEffort ?? '') !== advancedSettings.independentReasoningEffort || (current.independentExtraParams ?? '') !== advancedSettings.independentExtraParams
                || (() => {
                    const now = current.independentExcludedParams === undefined ? [] : current.independentExcludedParams;
                    const before = advancedSettings.independentExcludedParams;
                    return !Array.isArray(now) || !Array.isArray(before) || now.length !== before.length || before.some((name, index) => name !== now[index]);
                })()))) {
            const error = new Error(__rmT("UNCVToBo6puqbBNTrtrLyU8GbaSTBpFyf.PV0ma2pquR0YbRaOsP0w0C1mfY6tjXo.gQxx5J2bTDoZIjdiXDzem97IzsaglNtYz09aTvq2YwYo_z"));
            error.code = 'RABBIT_MIRROR_ADVANCED_OPTIONS_REJECTED';
            error.requestCount = 0;
            throw error;
        }
    };
    const generationScopeKey = `independent:${Date.now().toString(36)}:${index}:${swipeId(msg)}`;
    const regularVisibleReader = createIndependentVisibleTextReader(index, st);
    const earlyBody = requestOptions.earlyBodyOwner || null;
    const manualBody = requestOptions.manualBodyOwner || null;
    if (earlyBody)
        assertEarlyBodyOwner(earlyBody);
    const visibleOwner = earlyBody || manualBody;
    const readVisible = visibleOwner ? Object.assign((message, realIndex) => Number(realIndex) === Number(index)
        ? visibleOwner.visible : regularVisibleReader(message, realIndex), { renderedIndexes: regularVisibleReader.renderedIndexes }) : regularVisibleReader;
    const activeFeedback = null;
    const feedbackPrompt = '';
    const feedbackFinalCheck = '';
    const targetVisibleAtStart = readVisible(msg, index);
    if (!targetVisibleAtStart.text)
        throw Object.assign(new Error(explainEmptyIndependentVisibleBody(msg, index, st)), { code: 'RABBIT_MIRROR_VISIBLE_BODY_EMPTY', requestCount: 0 });
    const directiveStart = Math.max(0, index - 3);
    const boundedDirectiveChat = Array.isArray(ctx.chat) ? ctx.chat.slice(directiveStart, index + 1)
        .map((message, offset) => ({ message, realIndex: directiveStart + offset }))
        .filter(({ message }) => message?.is_user === true || isRabbitMirrorEligibleAssistantMessage(message))
        .map(({ message, realIndex }) => ({
        is_user: !!message?.is_user,
        mes: realIndex === index ? targetVisibleAtStart.text : readVisible(message, realIndex).text,
    })) : [];
    const generationContext = {
        chat: boundedDirectiveChat,
        batchIdentity: { mesid: index, swipeId: swipeId(msg), sourceHash: messageSourceFingerprint(msg) },
        ...(missingIndexes.length ? { missingFaceRetry: { indexes: missingIndexes, faces: missingRetry.faces } } : {}),
        ...(resay ? { multifaceResay: resay } : {}),
        ...(Array.isArray(requestOptions.pinnedSelections) ? { pinnedSelections: requestOptions.pinnedSelections } : {}),
        ...(Number.isInteger(requestOptions.serialFaceIndex) ? { serialFaceIndex: requestOptions.serialFaceIndex, serialFaceCount: Number(requestOptions.serialFaceCount) || 0 } : {}),
    };
    const externalEnabled = (st.externalWorldBookRandomEnabled === true && String(st.externalWorldBookMixMode || 'builtin-only') !== 'builtin-only') || hasExplicitTextFace(st) || faceDrawNeedsExternal(currentSettings);
    const appearanceEnabled = st.appearanceReferenceEnabled === true;
    const characterWorldBookEnabled = st.independentReadCharacterWorldBook === true;
    const imageCastEnabled = st.builtinImageEnabled === true && !characterWorldBookEnabled;
    const memoryWorldBookEnabled = st.memoryScanEnabled === true && ((st.memoryWorldBookEnabled === true && !!String(st.memoryWorldBookId || '').trim()) || (Array.isArray(st.memoryProviderIds) && st.memoryProviderIds.includes('global:qqj_v3_public_bridge_v1')));
    const retryFaces = missingIndexes.length
        ? missingIndexes.map(index => missingRetry?.faces?.[index]).filter(Boolean)
        : [resay?.faces?.[resay?.faceIndex]].filter(Boolean);
    const externalResay = retryFaces.some(resayFace => [...(Array.isArray(resayFace?.themeIds) ? resayFace.themeIds : []), ...(Array.isArray(resayFace?.formatIds) ? resayFace.formatIds : []), ...(Array.isArray(resayFace?.textIds) ? resayFace.textIds : [])].some(id => typeof id === 'string' && id.startsWith('ext:')));
    let details;
    let promptPlan = null;
    let promptOwner = null;
    let characterWorldBookContext = null;
    if (externalEnabled || externalResay || appearanceEnabled || memoryWorldBookEnabled || characterWorldBookEnabled || imageCastEnabled || earlyBody) {
        promptOwner = captureIndependentPromptOwner(ctx, index, msg, signal, requestOptions, generationScopeKey);
        promptOwner.appearanceReference = Object.freeze({ enabled: appearanceEnabled, revision: String(st.appearanceReferenceRevision || '') });
        if (memoryWorldBookEnabled)
            promptOwner.memoryRequestSettingsKey = memoryRequestSettingsKey(st, 'independent');
        try {
            const avatarIdentity = rabbitMirrorAvatarPromptIdentity(ctx);
            const avatarReady = prepareRabbitMirrorAvatarPrompt();
            if (avatarReady) {
                promptOwner.avatarIdentity = avatarIdentity;
                try {
                    await avatarReady;
                }
                finally {
                    promptOwner.awaited = true;
                    assertIndependentPromptOwner(promptOwner);
                }
            }
            if (resay?.pureOrder !== true && (externalEnabled || externalResay) && getExternalPoolHydrationStatus().hydrated !== true) {
                assertIndependentPromptOwner(promptOwner);
                try {
                    await hydrateExternalPoolMetadata();
                }
                finally {
                    promptOwner.awaited = true;
                    assertIndependentPromptOwner(promptOwner);
                }
            }
            if (resay?.pureOrder !== true && externalEnabled && !externalResay && getExternalPoolHydrationStatus().enabledMetadataRebuildRequired?.length) {
                const error = new Error('enabled external metadata needs rebuilding');
                error.code = 'WORLD_BOOK_ENTRY_STATE_CONFLICT';
                error.details = { reason: 'metadata-rebuild-required' };
                throw error;
            }
            const plan = promptPlan = planRabbitMirrorPromptDetails(st, 'independent', null, generationScopeKey, generationContext);
            const reference = plan.appearanceReference || { enabled: appearanceEnabled, revision: String(st.appearanceReferenceRevision || '') };
            bindIndependentPromptBatch(promptOwner, plan.batchPlan || null);
            let materials = null;
            let appearanceMaterial = null;
            let memoryMaterial;
            try {
                if (plan.selectedExternalIds.length) {
                    assertIndependentPromptOwner(promptOwner);
                    try {
                        materials = await getSelectedExternalEntries(plan.selectedExternalIds);
                    }
                    finally {
                        promptOwner.awaited = true;
                        assertIndependentPromptOwner(promptOwner);
                    }
                }
                if (reference.enabled)
                    appearanceMaterial = await loadIndependentAppearanceReference(promptOwner);
                if (plan.memoryWorldBook?.enabled) {
                    assertIndependentPromptOwner(promptOwner);
                    try {
                        memoryMaterial = await prepareSelectedMemoryForPrompt(plan.args.settings, { generationType: 'independent', hasSharedMemoryTheme: true, filterText: value => stripExcludedTagsFromReference(value) });
                    }
                    finally {
                        promptOwner.awaited = true;
                        assertIndependentPromptOwner(promptOwner);
                    }
                }
                if (characterWorldBookEnabled || imageCastEnabled) {
                    const characterWorldBookFocus = (Array.isArray(ctx.chat) ? ctx.chat.slice(Math.max(0, index - 2), index + 1) : []).map(message => String(message?.mes || '')).join('\n').slice(-20000);
                    try {
                        characterWorldBookContext = await readCharacterWorldBookContext(ctx, { signal, disabledBooks: st.independentWorldInfoDisabledBooks || [], focusText: characterWorldBookFocus, filterContent: value => isOutputFormatInstruction(value) ? '' : stripExcludedTagsFromReference(value), ...(imageCastEnabled ? { onlyMentioned: true, maxChars: 3000 } : {}), assertCurrent: () => assertIndependentPromptOwner(promptOwner) });
                        if (imageCastEnabled && characterWorldBookContext)
                            characterWorldBookContext.imageCast = true;
                    }
                    catch (error) {
                        if (error?.name !== 'AbortError' && imageCastEnabled) {
                            characterWorldBookContext = { text: '', entryCount: 0, titles: [], imageCast: true, reason: `${__rmT("ntMbcSu3rCFStf")}${String(error?.message || error).slice(0, 120)}` };
                        }
                        else {
                            if (error?.name !== 'AbortError')
                                error.code = 'RABBIT_MIRROR_CHARACTER_WORLD_BOOK_UNAVAILABLE';
                            throw error;
                        }
                    }
                    finally {
                        promptOwner.awaited = true;
                        assertIndependentPromptOwner(promptOwner);
                    }
                }
                details = renderRabbitMirrorPromptPlan(plan, materials, appearanceMaterial, memoryMaterial, ({ needsBackfill }) => independentVisualHistoryContext({ needsBackfill, slot: requestOptions.slot, manualRetry: requestOptions.manualRetry === true }));
                bindIndependentPromptBatch(promptOwner, details.batchPlan || null);
            }
            finally {
                materials?.clear?.();
                materials = null;
                appearanceMaterial = null;
                memoryMaterial = null;
            }
        }
        catch (error) {
            if (!promptOwner.batchPublished && promptOwner.batchReleaseIdentity) {
                try {
                    releasePendingComboBatch(promptOwner.batchReleaseIdentity);
                }
                catch { }
            }
            throw independentExternalPromptPreflightError(error, promptOwner);
        }
    }
    else {
        promptOwner = captureIndependentPromptOwner(ctx, index, msg, signal, requestOptions, generationScopeKey);
        const avatarIdentity = rabbitMirrorAvatarPromptIdentity(ctx);
        const avatarReady = prepareRabbitMirrorAvatarPrompt();
        if (avatarReady) {
            promptOwner.avatarIdentity = avatarIdentity;
            try {
                await avatarReady;
            }
            finally {
                promptOwner.awaited = true;
                assertIndependentPromptOwner(promptOwner);
            }
        }
        promptPlan = planRabbitMirrorPromptDetails(st, 'independent', null, generationScopeKey, generationContext);
        details = renderRabbitMirrorPromptPlan(promptPlan, null, null, undefined, ({ needsBackfill }) => independentVisualHistoryContext({ needsBackfill, slot: requestOptions.slot, manualRetry: requestOptions.manualRetry === true }));
        bindIndependentPromptBatch(promptOwner, details.batchPlan || null);
    }
    const faceCount = Number(details.metadata?.faceCount) || 1;
    if (details.batchPlan && Array.isArray(details.metadata?.faces)) {
        details = { ...details, metadata: { ...details.metadata, faces: details.metadata.faces.map((face, faceIndex) => ({ ...face, visualHistoryBatchId: details.batchPlan.batchId, visualHistoryFaceIndex: faceIndex })) } };
    }
    const basePrompt = String(details.prompt || '').trim();
    let executionLock = String(details.executionLock || '').trim();
    if (details.metadata?.disabled || !basePrompt || !executionLock) {
        requestOptions.onBatchPlan?.(null);
        if (promptOwner)
            assertIndependentPromptOwner(promptOwner);
        return { skipped: true, reason: details.metadata?.disabled ? 'directive-disabled' : 'empty-prompt' };
    }
    if ((!st.independentConnectionProfileId && !st.independentApiBaseUrl) || !st.independentApiModel)
        throw Object.assign(new Error(__rmT("DJMNCMYy5WPVNpWEkok11HU_MR1xzp_r5EiRgPIcwC20JB0fBRK9zh")), { code: 'RABBIT_MIRROR_CONNECTION_UNCONFIGURED', requestCount: 0 });
    if (st.multifaceDispatch === 'serial' && faceCount > 1 && !resay && !missingIndexes.length && requestOptions.serialChild !== true) {
        return runIndependentSerialFaces({ ctx, index, msg, signal, requestOptions, promptPlan, promptOwner, details, st });
    }
    const serialPaletteReminder = requestOptions.serialChild === true
        ? serialPaletteExecutionReminder(requestOptions.serialPaletteObservations, {
            faceIndex: requestOptions.serialFaceIndex, faceCount: requestOptions.serialFaceCount,
            presentationMode: details.metadata?.presentationMode, pureOrder: details.metadata?.pureOrder === true,
        }, st) : '';
    if (serialPaletteReminder)
        executionLock += `\n${serialPaletteReminder}`;
    const feedbackBlock = feedbackPrompt ? `

${feedbackPrompt}${feedbackFinalCheck ? `

${feedbackFinalCheck}` : ''}` : '';
    const resayNote = String(requestOptions.resayNote || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, resay?.userPicked === true ? 2000 : 400);
    const resayNoteBlock = resayNote ? `

${resay?.userPicked === true ? __rmT("VGWxzO5YRyAbcBTCdVKg8q9Rx4JCOKzSnXSAG8n8uBoNvqvsgHE0lI2fWEzguIhLQC7ruPe_7mfdC.JU") : __rmT("ZTGsCTFpIiQxIS.9VpA")}
${JSON.stringify(resayNote)}${__rmT("ROLGG7LO3absienuGFWlSesT2IcLYFOq9p6OmooDY_1z0DcaWGCvjQPDBiTdDsbcfup6Esj9EFG0TB15eNflMhUcjiItr9Hx5sm_gW7_xXnoY6qqI16iPwwBaCOmuxcn42lOXIlA6u3QRR5GhdFfig784fkSIf")}` : '';
    const keepSelectionRewrite = !!resay && resay.pureOrder !== true && (resay.preserveSelection === true || resay.userPicked === true || resay.preserveVariation === true);
    const keepSelectionForm = resay?.presentationOverride === 'longtext' ? 'longtext' : resay?.presentationOverride === 'html' ? 'html' : '';
    const keepSelectionRewriteBlock = keepSelectionRewrite ? `

${resay?.userPicked === true ? __rmT("IODEOSm1eq8Gh4t57V36QUzMMg7E6q27yJkBGvLv_ZiAXZRkZ4O10S4Hrxreu9fh9Yt_c98ig1G8wEwfKONboyQxwYYQ6EWMbYAI8o68d0t_ad79c0.tqOy1mObzc7Kou4Gt7vC5g8XUCasaiww.QxSvLEk40CYByQgBd.W6dTOcNbXjAlFkMSz0EcE1NJv_uEV1mZIFEg6k.XjwMHTa2qmtGopRy7Z6tf5AfHY3hxfedT") : __rmT("tU8RJFYFffWBey8S9X7EbALv83tBMLR6_bPYFeJ0iOoAg770C6bSdBSYEWcTOb6h5LuH7o5ZtYD2B_DZfMYGEPsIC63WY7pIP2c.8kLBBdLo.k")}${keepSelectionForm === 'longtext' ? __rmT("LzYReA7uHSL1lLHpTYqtBnRtUaGRyQt09DmbAG6._zzstFm0WtWvSwtfIhwXuC5Xu.x8zLhwk4ctOiU5C5LOpbCgTnC6OxywfCooZ52hvX7_9Z_gEAT0if") : __rmT("QT5vWUTf") + (keepSelectionForm === 'html' ? __rmT("L89BEpvSl32u_tquvw4JLk") : '') + __rmT("Bv_tusLGwYnUaqSTFwkThhAtcoIAFGEvEUnOZbdTh05m5r7ihO7oeoFp7gluJSiWFjUoZptH_ITf4U_mnbBPaA7ENXXWNsmpA.GTkFqhiHE_XxuSqrrfzDUt")}` : '';
    const independentSystemRules = __rmT("Z5RBxfjxOGCb11n55ApkGc9ajb28uD.d9weNBV08vKbjojWA12PmGSyz_CSSgW3WRv.u3JA33KlGXq3x1b23.C0i5Etmt7xgSF0EVrPqKnbGzqFLKAH2VQWa_l0UZJc4lpo4fng4lPtq2f75bCgOL47vd6Tt8NeVq8daciZ8tT1Wqcd2nsNz.K_iESuwSbtTIywdL6L_xM5cknsXKMwY3Mod1me5i4cAf2d01D5ErkRI1t1SUjl6UVc25_h_A5vDBHW.4o6L4z4ZL1EACmM.tUyxBafKE2PpuiMCiRZN5bbBbumcBP0gu7R3CyV6AezCLx0K3T92vRtPD7ufTn27kCCy");
    const independentBehaviorPatch = '';
    const systemPrompt = `${basePrompt}${feedbackBlock}${keepSelectionRewriteBlock}${resayNoteBlock}${independentBehaviorPatch ? `

${independentBehaviorPatch}` : ''}

${independentSystemRules}`;
    const independentUserLead = __rmT("GVpKD8NPXPJ2sbdjfhGm.jVHJgwZFjEmgRldAMEhDLUiKGglxnsshEyEmgTeGHKQN1QFNdnxk7lt5BokOrR6TaISMjnlCEqXY_XnGgNeo2mC3a4Morl");
    function independentDesignChecklist(metadata, faceCount = 1) {
        const faces = faceCount > 1 && Array.isArray(metadata?.faces) ? metadata.faces : [metadata];
        const picks = faces.map((face, index) => {
            const pick = Number(face?.designCandidatePick);
            return Number.isInteger(pick) && pick >= 1 && pick <= 3 ? { index, pick } : null;
        }).filter(Boolean);
        if (!picks.length)
            return '';
        const menuFaces = picks.filter(({ index }) => Array.isArray(faces[index]?.atmosphereMenu) && faces[index].atmosphereMenu.length > 1).length;
        if (!menuFaces)
            return '';
        return `${__rmT("HOBqm9otNHxStf")}${menuFaces === picks.length ? '' : __rmT("QQd04AboNoAZVBZh")}${__rmT("XUC_wiNuOFNiFU5UbUbOLvseb5XwZOND9plRKFc8jRZLMn8JSH.PbbqH4RcAZRVZruDDdZuMJGLScfRqTMMXijbs99s19Mkko4..uI0J3Anc4d1CZDXc95Gmd4SwJButOcR2l.BCZtMKLZ9l1tECRkPKZsr0tyWmmUG_1KUX0s1VhYPcI0Wftaio5y448Hjw44JiXD5SMrBkcSqU7HmXZZU2qtjcJvl_xJl7qwwzoeMJrYoY0DjhMerSHzqT..JPzG_R36lBWh5o2evZVru_ZSb7_uelL1rF8whveYV4jrg2DBSAz5tZRrVZXfwpXxPw_LfsDv.mtSZQS8INQ2k6ftKlyD5GBFYEcZwwXYXo0Ct4wVnhcUOruREm")}`;
    }
    const designChecklist = independentDesignChecklist(details.metadata, faceCount);
    const independentUserTail = `${designChecklist ? `${designChecklist}\n\n` : ''}${faceCount > 1
        ? `${__rmT("H37iIYkxBPEz77kp9oGHp0u93wGmZc1DaRM86aSK4g8")}${faceCount}${__rmT("FmQ4EwncYLvJZaCqR_7r41ZrlgjdY7QbDes8pbAZ6GTOeQhaStHrg4tw6H0AiySV")}${(Array.isArray(details.metadata?.faces) ? details.metadata.faces : []).some(face => Array.isArray(face?.atmosphereMenu) && face.atmosphereMenu.length > 1) ? __rmT("YAT5l7DJWUJEoX2a8A1AOyDeeQbyJRMzhKQ8KtkUfUjUj7wp98WIavkjx72hKH_mTSxbif") : ''}${__rmT("97dAtYnyEC2rckOOdLCAt98YJxuunySfO_amAxiQhETfAbG40vcGVbROzBG")}` : `${__rmT("38VI98jDK1egH0wETaHCpVK3M2ANf3zbJYYD_TIrdgx4rdamI1yvwNxqmP2fwSUi")}${Array.isArray(details.metadata?.atmosphereMenu) && details.metadata.atmosphereMenu.length > 1 ? __rmT("YAT5l7DJWUJEoX2a8A1AOyDeeQbyJRMzhKQ8KtkUfUjUj7wp98WIavkjx72hKH_mTSxbif") : ''}${__rmT("cCS_Ez4g3B9vsaEJ4qIfeT22afrNyrjFzU.SpcL_Jc_1Cw9PtV.ijFCy98siKnQvrc8BSZyeTjKP_DZ3WLBFrh")}`}`;
    const maxRequestChars = configuredIndependentMaxRequestChars(st);
    const fixedRequestChars = systemPrompt.length + executionLock.length + independentUserLead.length + independentUserTail.length + 16;
    const characterWorldBookBlock = characterWorldBookContext?.imageCast
        ? (characterWorldBookContext.text ? `${__rmT("ZelXj_MEKEN7QTZOQo7QnP0jJEMBrR6EJkXpQMto5..30hwrJCCqLWuKcJYApPp765toQ0JIIIYbXC9E7lsu88e936zj3ckR9pYZ9GCfCmssc3YhRRjpERlCUK8a5zWTXBSygilHoH1W7AOx0GCJ3UsNCWjcwjqGDAe8UR_EYS7Dx2n1J_.HSNEgkeTGuDdiHQ1XsY.jJRKAAcvuqDGJkLKg2SFTpDtdPB8")}${characterWorldBookContext.text}` : '')
        : characterWorldBookContext?.text ? `${__rmT("xs.xZqQ5Qi1P1nlYJiKANFj1ZEaiTGWKxLqj8_j1W4LtNwu4rMgCJz6VSFhR9wn9W_KB_eqttN2N8l8n5Bg7kLUmrmDy2HSWQdSxjaOBvkpmhTpSbRn_uWRuPB.kWrERoP5qeWrR6vQui7OdUoTmGcud")}${characterWorldBookContext.text}` : '';
    const availableContextChars = maxRequestChars - fixedRequestChars - characterWorldBookBlock.length;
    if (availableContextChars <= 0) {
        const error = new Error(`${__rmT("CMlFHAfZjHX4oMB.jUWV6cK3U6itP0OVxjWnNXpZa8ToeJYaxmPA3cxcVVcejfDY")}${maxRequestChars}${__rmT("v3JmrEzVUilM6jj50NfbsVLIOrMZ4HOBEKZ4nQXM55aMTvQX")}`);
        error.code = 'RABBIT_MIRROR_REQUEST_TOO_LARGE';
        error.requestCount = 0;
        throw error;
    }
    const globalWorldInfoSnapshot = globalWorldInfoSnapshotFor(ctx, index, msg);
    const globalWorldInfoView = globalWorldInfoContextView(globalWorldInfoSnapshot);
    const contextResult = contextBundle(ctx, index, globalWorldInfoSnapshot, globalWorldInfoView, availableContextChars, readVisible);
    if (!contextResult.targetVisibleChars)
        throw Object.assign(new Error(explainEmptyIndependentVisibleBody(msg, index, st)), { code: 'RABBIT_MIRROR_VISIBLE_BODY_EMPTY', requestCount: 0 });
    const contextText = contextResult.text + characterWorldBookBlock;
    const userPrompt = `${independentUserLead}

${contextText}

${executionLock}

${independentUserTail}`;
    const totalRequestChars = systemPrompt.length + userPrompt.length;
    if (totalRequestChars > maxRequestChars) {
        const error = new Error(`${__rmT("sKpFRNEBTM5OQ._AFalWuJigg8khoSQe_RNoDf")}${maxRequestChars}${__rmT("v3JmrEzVUilM6jj50NfbsVLIOrMZ4HOBEKZ4nQXM55aMTvQX")}`);
        error.code = 'RABBIT_MIRROR_REQUEST_TOO_LARGE';
        error.requestCount = 0;
        throw error;
    }
    const behaviorRuleText = resolveBehaviorRuleText(st).trim();
    let behaviorRuleCharsInBase = 0, rulesWithoutBehavior = basePrompt;
    if (behaviorRuleText) {
        const headAt = basePrompt.indexOf(__rmT("R95dpzwrYE3ZMwKU"));
        const bodyAt = headAt >= 0 ? basePrompt.indexOf(behaviorRuleText, headAt) : -1;
        if (bodyAt >= 0 && bodyAt - headAt < 40) {
            const end = bodyAt + behaviorRuleText.length;
            behaviorRuleCharsInBase = end - headAt;
            rulesWithoutBehavior = basePrompt.slice(0, headAt) + basePrompt.slice(end);
        }
    }
    recordRabbitMirrorIndependentPrompt({
        extensionPrompt: [basePrompt, feedbackBlock, keepSelectionRewriteBlock, resayNoteBlock, independentBehaviorPatch, independentSystemRules, independentUserLead, executionLock, independentUserTail].filter(Boolean).join('\n\n'),
        basePrompt,
        feedbackPrompt: feedbackBlock,
        executionLock,
        contextChars: contextText.length,
        contextLayers: contextResult.layers,
        contextMaxLayers: contextResult.maxLayers,
        filteredRabbitMirrorChars: contextResult.filteredRabbitMirrorChars,
        filteredContextTagChars: contextResult.filteredExcludedTagChars,
        totalRequestChars,
        metadata: details.metadata,
        sections: [
            { label: __rmT("WV1HFBf_Z0NscWKlelSKIC5IxxlhYratV.Sng1g1vJGThl.BiP0kWQC5kCY"), chars: behaviorRuleCharsInBase },
            ...promptSectionBreakdown(rulesWithoutBehavior, 16).map(item => ({ label: `${__rmT("yhPPhEH6")}${item.label}`, chars: item.chars })),
            { label: __rmT("WxBNF5xqsH4TLT"), chars: feedbackBlock.length },
            { label: __rmT("9wvdUsT9ZxWD4u9TkRf"), chars: keepSelectionRewriteBlock.length + resayNoteBlock.length },
            { label: __rmT("zbCJV_ims.CXqWHGsVZitPb80PhdQkRy8VuUImZ8"), chars: independentSystemRules.length },
            { label: __rmT("uwPNziceAP7FeT"), chars: executionLock.length },
        ],
        contextParts: {
            transcript: contextResult.transcriptChars,
            reference: contextResult.referenceContextChars,
            worldInfo: contextResult.worldInfoContextChars,
            characterWorldBook: characterWorldBookBlock.length,
        },
    });
    const historySelection = faceCount === 1 && requestOptions.serialChild !== true
        ? createVisualHistorySelection(promptPlanSelections(promptPlan)[0]?.combo, generationScopeKey) : null;
    const requestSelectionDiagnostic = {
        ...(historySelection ? { visualHistoryId: historySelection.historyId } : {}),
        ...(details.batchPlan ? { visualHistoryBatchId: details.batchPlan.batchId } : {}),
        chatKeyHash: hashText(chatKey(ctx)),
        mesid: Number(index),
        swipe: swipeId(msg),
        sourceHash: messageSourceFingerprint(msg),
        baseSlotHash: hashText(messageBaseSlotKey(ctx, index, msg)),
        operationEpoch: Math.max(1, Number(requestOptions.dispatchLease?.epoch) || operationEpochForBase(messageBaseSlotKey(ctx, index, msg))),
        ...(faceCount > 1 ? { faceCount, faces: details.metadata.faces } : {}),
        samplingMode: String(details.metadata?.samplingMode || ''),
        ...(details.metadata?.designCandidatePick ? { designCandidatePick: details.metadata.designCandidatePick } : {}),
        ...(details.metadata?.hasExternalReferences ? { hasExternalReferences: true, externalSources: details.metadata.externalSources || [] } : {}),
        themeIds: Array.isArray(details.metadata?.themeIds) ? details.metadata.themeIds : [],
        formatIds: Array.isArray(details.metadata?.formatIds) ? details.metadata.formatIds : [],
        ...presentationModeFields(details.metadata),
        themeLabels: Array.isArray(details.metadata?.themeLabels) ? details.metadata.themeLabels : [],
        hueFamilies: (Array.isArray(details.metadata?.faces) && details.metadata.faces.length ? details.metadata.faces : [details.metadata]).map(face => String(face?.hueFamily || '')),
        formatLabels: Array.isArray(details.metadata?.formatLabels) ? details.metadata.formatLabels : [],
        customThemeCount: Number(details.metadata?.customThemeCount) || 0,
        customFormatCount: Number(details.metadata?.customFormatCount) || 0,
        customRequestCount: Number(details.metadata?.customRequestCount) || 0,
        executionLockChars: executionLock.length,
        userDirectiveApplied: !!details.metadata?.userDirectiveApplied,
        forcedVisualScenery: !!details.metadata?.forcedVisualScenery,
        globalWorldInfoEnabled: st.independentReadGlobalWorldInfo === true,
        globalWorldInfoCaptured: !!globalWorldInfoView?.block,
        globalWorldInfoEntries: Number(globalWorldInfoView?.includedEntries || 0),
        globalWorldInfoFormatEntriesSkipped: Number(globalWorldInfoView?.formatEntriesSkipped || 0),
        globalWorldInfoTotalEntries: Number(globalWorldInfoView?.totalEntries || 0),
        globalWorldInfoChars: Number(globalWorldInfoView?.chars || 0),
        globalWorldInfoTruncated: globalWorldInfoView?.truncated === true,
        characterWorldBookEnabled,
        characterWorldBookEntries: Number(characterWorldBookContext?.entryCount || 0),
        characterWorldBookTruncated: characterWorldBookContext?.truncated === true,
        imageCastEnabled,
        imageCastEntries: imageCastEnabled ? Number(characterWorldBookContext?.entryCount || 0) : 0,
        imageCastTitles: imageCastEnabled ? (characterWorldBookContext?.titles || []).slice(0, 8).map(title => String(title).slice(0, 30)) : [],
        imageCastReason: imageCastEnabled ? String(characterWorldBookContext?.reason || (characterWorldBookContext?.entryCount ? '' : (characterWorldBookContext?.skippedNoLooks ? `${__rmT("wiQZY9cNDhGCqyHRgPD")}${characterWorldBookContext.skippedNoLooks}${__rmT(".5CZWtT7lE.HpmQTtgOaC7v0Hw9Sa3V3NzD7UQ2hIQOzDC8r.FDmbRufqTZfWBNvi0Y")}` : __rmT("IAAV0d8dJsP0jOEepwA8tWvX3qY2mbw_L0EvlPPRCC25ZM3YPGHDvpnoTo6V81t0N0AgIKYakwq2Tf")))) : '',
        totalRequestChars,
    };
    const batchPlan = details.batchPlan || null;
    requestOptions.onBatchPlan?.(batchPlan);
    if (promptOwner) {
        promptOwner.batchPublished = true;
        assertIndependentPromptOwner(promptOwner);
    }
    requestOptions.onRequestSelection?.(requestSelectionDiagnostic);
    const originalLease = requestOptions.dispatchLease;
    const dispatchLease = batchPlan || promptOwner ? {
        ...originalLease,
        consume() {
            assertAdvancedCurrent();
            if (promptOwner)
                assertIndependentPromptOwner(promptOwner);
            if (signal?.aborted)
                return false;
            let batchReason = 'BATCH_PLAN_INVALID';
            if (batchPlan && !markPendingBatchAttempt(batchPlan, { transient: true, onRejected: code => { batchReason = code; } }))
                throw independentBatchPlanPreflightError(batchReason);
            if (promptOwner)
                assertIndependentPromptOwner(promptOwner);
            const accepted = originalLease?.consume?.() === true;
            if (!accepted && batchPlan)
                releasePendingComboBatch(batchPlan);
            return accepted;
        },
    } : originalLease;
    const { response: r, result, profile, attempts, requestDiagnostic: transportDiagnostic, semanticError } = await requestIndependentCompletion(st, systemPrompt, userPrompt, { signal, manualRetry: requestOptions.manualRetry === true, automaticReroll: requestOptions.automaticReroll === true, diagnosticContext: requestSelectionDiagnostic, dispatchLease, onProgress: requestOptions.onProgress, earlyBodyOwner: requestOptions.earlyBodyOwner, advancedSettings, assertAdvancedCurrent, evidenceFaceIndex: requestOptions.serialFaceIndex ?? resay?.faceIndex, evidenceSerial: requestOptions.serialChild === true });
    let requestDiagnostic = transportDiagnostic;
    const evidence = generationEvidenceFor(result);
    try {
        if (semanticError)
            throw independentResponseFailure(semanticError, requestDiagnostic);
        if (!r.ok) {
            const detail = compactRemoteError(r.status, result.raw || '');
            const mode = String(profile || '');
            const next = String(requestDiagnostic?.nextProfile || '');
            const exactNonStreamRetry = next && profileUsesStreaming(mode) && !profileUsesStreaming(next);
            const retryHint = upstreamGenerationDisabled(`${result.raw || ''} ${safeJson(result.payload || {}, 4000)}`) ? `${GENERATION_DISABLED_HINT}${__rmT("sSqpQEoetmbIlXTq5cnej1OaDAiBNjhgCCn5LVvxJRftQrDS")}` : next
                ? exactNonStreamRetry
                    ? `${__rmT("5qnqKYuS2I.mcnOVrc0TKILn3ARcS45t1SeFds1NK2KIJqNkq934c6aXGizFabXHrGoFJLgiqzEEAJ8GIwHqe5Jur2_NWymdGbVZAnsRaIE1E_w5iqQHR5cUH1NXc2zoov98gxEOMcZFYtgHY5u6t1dYRSFv52soCj7vdkIFN8ogdbsEJtqe2.Qu.QGj4l93vHoqkSS3AAr1nOqa8VA0pqy3zuT")}${next}${__rmT("sSq8DqdEpovglKEUxVzO2tLvOrs5thQVwIkwGaixuSrFTSs7")}` : `${__rmT("z_utTFEAmOezZawdEm8Cbe63U_kqUcYBvMVxX1NBlic0HWCtEB_BiVy8DhWGZt6aEpxao1q_VG1BHXONNDKqdMMSZqg6fR5o2D6za3zY4cdroT")}${next}`
                : __rmT("sSqpQEoetmbIlXTq5cnej1OaDAiBNjhgCCn5LVvxJRftQrDS");
            throw independentResponseFailure(`${__rmT("iBE7oTrSOn5j0GYYGGRK_V6vSPYvH5ba1hMYGaXYK09tnh")}${r.status}${detail ? ` · ${detail}` : ''}${mode ? `${__rmT("RhV8448PRwvutt5D")}${mode}` : ''}${retryHint}`, requestDiagnostic, 'transport');
        }
        const raw = String(result.text || '').trim();
        if (!raw) {
            const keys = result.payload && typeof result.payload === 'object' ? Object.keys(result.payload).slice(0, 12).join(', ') : __rmT("TCQmaviSOWIHkShwR6M8t_3W");
            throw new Error(`${__rmT("oAi8hZrIA9ohfEnUFlF0bc3oKisc3ICPR5sMTACIdMI5fIAMSBbi41d0zJqgyuJcOHf")}${keys || __rmT("wWY")}${__rmT("RhV8448PRwvutt5D")}${profile}${__rmT("eXs")}`);
        }
        assertIndependentMarkupComplexityWithDiagnostic(raw, 'raw', requestDiagnostic);
        const designSelectionChecks = designSamplingChecksFromHtml(raw, details.metadata);
        if (designSelectionChecks.length)
            requestDiagnostic = publishIndependentApiRequestDiagnostic({ ...requestDiagnostic, designSelectionChecks });
        const atmosphereMenus = faceCount > 1
            ? (Array.isArray(details.metadata?.faces) ? details.metadata.faces : []).map(face => face?.atmosphereMenu || null)
            : [details.metadata?.atmosphereMenu || null];
        const atmosphereNotes = atmosphereNotesFromHtml(raw, atmosphereMenus);
        const mirrorSource = stripAtmosphereChoiceMarkup(raw);
        if (faceCount > 1) {
            let prepared;
            try {
                prepared = prepareIndependentMultifaceResult(mirrorSource, details.metadata, requestDiagnostic, { ...requestOptions, colorAtmosphereNotes: atmosphereNotes });
                evidence?.processed(prepared.html, { stage: 'after-sanitize', faceCount });
            }
            catch (error) {
                const detail = error?.rabbitMirrorMultifaceDiagnostic && typeof error.rabbitMirrorMultifaceDiagnostic === 'object' ? error.rabbitMirrorMultifaceDiagnostic : {};
                const semantic = independentMultifaceFailureSemantic(error);
                const diagnostic = republishIndependentSemanticFailure(requestDiagnostic, semantic, '', { responseChars: raw.length, expectedFaces: faceCount, ...detail });
                error.rabbitMirrorRequestDiagnostic = diagnostic;
                throw error;
            }
            rememberApiProfile(st, profile);
            const settled = settleAtmosphereMultiface(prepared, details.metadata, atmosphereNotes);
            const batchDiagnostic = settled.failedFaces?.length ? { ...requestDiagnostic, partial: true, completedFaces: settled.completedFaces, failedFaces: settled.failedFaces } : requestDiagnostic;
            if (settled.failedFaces?.length)
                publishIndependentApiRequestDiagnostic(batchDiagnostic);
            evidence?.processed(settled.html, { stage: 'ready-to-mount', faceCount, completedFaces: settled.completedFaces, failedFaces: settled.failedFaces || [] });
            evidence?.finish({ phase: 'ready-to-mount', partial: !!settled.failedFaces?.length });
            return { ...settled, feedbackId: activeFeedback?.id || '', feedbackPrompt, requestDiagnostic: batchDiagnostic, executionLockChars: executionLock.length, batchPlan: details.batchPlan };
        }
        let inner = extractMirrorInner(mirrorSource);
        if (!inner) {
            const salvaged = salvageCutDrawNotesDetail(mirrorSource);
            const rescued = salvaged.html ? extractMirrorInner(salvaged.html) : null;
            if (rescued && independentMirrorBodyEvidence(rescued)) {
                inner = rescued;
            }
        }
        if (!inner) {
            const metaFaces = Array.isArray(details.metadata?.faces) && details.metadata.faces.length ? details.metadata.faces : [details.metadata];
            if (metaFaces.length === 1 && metaFaces[0]?.requestedPresentationMode === 'longtext') {
                const prose = salvageLongTextProse(mirrorSource);
                if (prose) {
                    const preparedHtml = prepareIndependentReadyHtml(salvagedLongTextFace(prose, 0).inner);
                    evidence?.processed(preparedHtml, { stage: 'after-sanitize', salvagedLongText: true });
                    if (preparedHtml && independentMirrorBodyEvidence(preparedHtml)) {
                        rememberApiProfile(st, profile);
                        evidence?.finish({ phase: 'ready-to-mount', truncated: true });
                        return { html: preparedHtml, historySelection: resolveVisualHistorySelection(historySelection, atmosphereNotes[0]?.choice), truncated: true, feedbackId: activeFeedback?.id || '', feedbackPrompt, requestDiagnostic, executionLockChars: executionLock.length };
                    }
                }
            }
            const transportFinish = String(requestDiagnostic?.finishReason || result.transport?.finishReason || '');
            const finish = transportFinish && transportFinish !== 'unknown' ? transportFinish : responseFinishReason(result.payload);
            const configuredMax = Number(st.independentApiMaxTokens) || 12000;
            if (/length|max_tokens|MAX_TOKENS/i.test(finish)) {
                const diagnostic = republishIndependentSemanticFailure(requestDiagnostic, 'truncated-output', '', { finishReason: finish, responseChars: raw.length });
                const recommendation = configuredMax < 8192 ? __rmT("fp5B4lgMpCZIgWmk6pK1zv7py635ZvEBx8403BOF4VLaj7npEGCmZh5GxhvM1lnnVsOrQk") : '';
                throw independentResponseFailure(`${__rmT("UNCVToBo6puqbBNTrtrsmZquBacVeRKzBCg.naX271fybFEtdlty995Er_ezfjD7t0Kyx_edzdvLshT6mxklh0MQZpX4SdS7l0X2vN.hbSnkaEYv")}${finish}${__rmT("Qe3YBguyIpkwIYrxw5bboesRs95ocT")}${configuredMax}${recommendation}${__rmT("RhV8448PRwvutt5D")}${profile}`, diagnostic, 'output');
            }
            if (!String(raw || '').trim()) {
                const emptyDiagnostic = republishIndependentSemanticFailure(requestDiagnostic, 'empty-response', '', { finishReason: finish, responseChars: 0 });
                throw independentResponseFailure(`${__rmT("irl4dQajpBvRfQDARHu8RjnqVncE0UceCgx7Nhqt2Z91b4tdS5yJCZde")}${finish ? `${__rmT("1ehhYP7XB.O6cfrnbDShfojOkNOZ.gX1UPeN.pgb4g8")}${finish}${__rmT("eXs")}` : ''}${__rmT("H12TIhPHDm82R0ai1mEa_il9c6KV6rrWAjcP6KRh4rJOATK8SrcUwulIXkifs.8QPglw04qqbVZqCeVlT6jS_aasVX0ylsG6pidobjyki3qMu5vJ92qnfxgTuXR_gtQURpAdQCK6KWU6WnkZjIfM.naadC1OmmbbTmObo5GJWTlt9MZzP_.CUjZdOviLbhmBRxPIquqTH4jEef")}${profile}`, emptyDiagnostic, 'output');
            }
            const refusalText = String(raw || '').replace(/\s+/g, ' ').trim();
            if (refusalText.length < 800 && !/<[a-z!]/i.test(refusalText)
                && __rmR("2hUZIOC5yjSJQ4uZ.K2O8UFV9goynUC9XU213clsp8KKbI5_v4YK7We8FIhRlc7XTjoy4UW67inU6OQJDt3nkbTpBvi.dn.Xyy4r5wRtja0lGIi6lTsN.SBgF2R3LH0ItVXAAUCu0nq3e5ucZ7.OZFj7ZUMxIMpAL3_QT7A.LV0G.FRRaLA4Pw.fig40Lr84RZy_XblqkQMlpShLg71eM4S4vSHsrqvyYYRugrartQZT.w.cvD_", "i").test(refusalText)) {
                const refusalDiagnostic = republishIndependentSemanticFailure(requestDiagnostic, 'model-refusal', '', { finishReason: finish, responseChars: raw.length });
                throw independentResponseFailure(`${__rmT("y9wMkLzSU45y0iTYIwLPCubQNB6JeJ.1081k6eY2wlL52h")}${refusalText.slice(0, 80)}${refusalText.length > 80 ? '…' : ''}${__rmT("e9_jq1fwvC875VwZ_EMofp21OdPqU856mLIOHVqedP.oliZsgxts3nqIRNKRKqZyqT3_WxPx0Zs2Rikiwh6CBl4n70BHJlco1WsGzqoXGBWWFJuRHE6k5X9097Dn_xU_D_TY1iBUtDUfRzr7R8mXko0TbzNLR8k7U14gMU.pYiKtHIvzjkY")}${profile}`, refusalDiagnostic, 'output');
            }
            if (/^(content_filter|safety|recitation)$/i.test(String(finish || ''))) {
                const filterDiagnostic = republishIndependentSemanticFailure(requestDiagnostic, 'incomplete-mirror', '', { finishReason: finish, responseChars: raw.length });
                throw independentResponseFailure(`${__rmT("VGWii8_omYuiboXTwD3wvWDIQrPTeaujQyMWmFIzrY05itYR059x9HWE9tTqomt6inOU6EedzdvLshT6mxklh0MQZpX4SdS7l0X2vN.hbSnkaEYv")}${finish}${__rmT("nmNXWQhyVZt2ma9XYG3hK6ldU12mkJfi_qWPgRDdQDABMuU8i0a5WVd3fuoDgDy9fq4GQMrRrzaEaaKMDNhKjOFfQAkemQ8w2goUhyjzcXV5smgcFU7oqC0AOX_sV4MmgS7_hmzZxrZG4HPM_cZPTxr5Qr86e4OMI9Q9sY6co8jq.vP_YouKWwB5vwFeQdU8735Mdxueks5VphGLII1hM1X4qYCVoYhBkO1IZOjNcigAqklS86_")}`, filterDiagnostic, 'output');
            }
            const diagnostic = republishIndependentSemanticFailure(requestDiagnostic, 'incomplete-mirror', '', { finishReason: finish, responseChars: raw.length });
            throw independentResponseFailure(`${__rmT("irl4dQajpBvRfQDARH2HkFhdrILaiy0xahvaZfWdUEte_25RSSc3PvQ2")}${finish ? `${__rmT("1ehhYP7XB.O6cfrnbDShfojOkNOZ.gX1UPeN.pgb4g8")}${finish}${__rmT("eXs")}` : ''}${__rmT("RhV8448PRwvutt5D")}${profile}${__rmT("RcoOaMF58Y4SsKNRlsAcZPjj5DSBwf")}`, diagnostic, 'output');
        }
        assertIndependentMarkupComplexityWithDiagnostic(inner, 'inner', requestDiagnostic);
        if (!independentMirrorBodyEvidence(inner)) {
            republishIndependentSemanticFailure(requestDiagnostic, 'empty-mirror-body', '', { responseChars: raw.length });
            throw new Error(__rmT("AroQSgm4tzWygHdw_tdu0TAvFxAKSNvYljcQRvOUuiow7DcaDWGD0_XHGRfvxRAMMHRRhFPkS6ysTudlONj46GmGaz1qtAZcuo_6RPH2kbvNBpjrY2MIySt5cnBbEKeZf2irmVGClGnFIbtXIIYujAU0SghSIf"));
        }
        const preparedHtml = prepareIndependentReadyHtml(bindRolePaletteCode(inner, details.metadata, atmosphereNotes[0]));
        evidence?.processed(preparedHtml, { stage: 'after-sanitize', faceCount: 1 });
        if (!preparedHtml || !independentMirrorBodyEvidence(preparedHtml)) {
            republishIndependentSemanticFailure(requestDiagnostic, 'post-sanitize-empty', '', { responseChars: raw.length });
            throw new Error(__rmT("Idkd35IFKKgmJ05pcN5SIzK6nifByRohEe1RcSVgIHlUXdADT.aMGo6kKkVIXVWDEJ8OnxAZiUIq.LVqnWVy_VigDtMijyC4Qo4DYGrB9XBobOohsB1T8wsopHRuglu8iDxc8ascFOQNPjlNfvskdo.jYqPOmX55LKV4WXpQamV29_Bz7nj7G3JhOvwZCIJ3FZwUMo5IKmmAdh"));
        }
        assertIndependentMarkupComplexityWithDiagnostic(preparedHtml, 'sanitized', requestDiagnostic);
        rememberApiProfile(st, profile);
        if (requestOptions.serialChild === true) {
            evidence?.finish({ phase: 'ready-to-mount', serial: true });
            return { html: preparedHtml, atmosphereNote: atmosphereNotes[0] || { choice: null, reason: '' }, feedbackId: activeFeedback?.id || '', feedbackPrompt, requestDiagnostic, executionLockChars: executionLock.length };
        }
        settleAtmosphereSingle(atmosphereNotes[0], details.metadata, requestDiagnostic);
        const resolvedHistorySelection = resolveVisualHistorySelection(historySelection, atmosphereNotes[0]?.choice);
        evidence?.finish({ phase: 'ready-to-mount' });
        return { html: preparedHtml, historySelection: resolvedHistorySelection, feedbackId: activeFeedback?.id || '', feedbackPrompt, requestDiagnostic, executionLockChars: executionLock.length };
    }
    catch (error) {
        evidence?.fail(error?.rabbitMirrorFailurePhase || 'postprocess', error);
        throw error;
    }
}
export function externalOwnerMesid(el) {
    return String(el?.getAttribute?.('mesid') ?? el?.dataset?.messageId ?? el?.dataset?.messageid ?? '').trim();
}
function addExternalHostToIndexMap(map, key, host) {
    if (!key || !host)
        return;
    let bucket = map.get(key);
    if (!bucket) {
        bucket = new Set();
        map.set(key, bucket);
    }
    bucket.add(host);
}
function buildExternalHostSyncIndex() {
    const hosts = liveChatExternalHosts(document.querySelectorAll?.(`[${SOURCE_ATTR}]`));
    const byMesid = new Map();
    const byKey = new Map();
    for (const host of hosts) {
        addExternalHostToIndexMap(byMesid, String(host?.dataset?.rmOwnerMesid || host?.dataset?.rmExternalOwnerMessage || ''), host);
        addExternalHostToIndexMap(byKey, String(host?.dataset?.rmKey || ''), host);
    }
    return { hosts, hostSet: new Set(hosts), byMesid, byKey };
}
export function registerExternalHostInSyncIndex(host) {
    const index = externalHostSyncIndex;
    if (!index || !host || isTheaterFavoriteHost(host))
        return;
    if (!index.hostSet.has(host)) {
        index.hostSet.add(host);
        index.hosts.push(host);
    }
    addExternalHostToIndexMap(index.byMesid, String(host.dataset?.rmOwnerMesid || host.dataset?.rmExternalOwnerMessage || ''), host);
    addExternalHostToIndexMap(index.byKey, String(host.dataset?.rmKey || ''), host);
}
export function withExternalHostSyncIndex(run) {
    const owns = !externalHostSyncIndex;
    if (owns)
        writeExternalHostSyncIndex(buildExternalHostSyncIndex());
    try {
        return run();
    }
    finally {
        if (owns)
            writeExternalHostSyncIndex(null);
    }
}
export function isTheaterFavoriteHost(node) {
    return !!(node?.dataset?.rmFavorite === 'true'
        || node?.classList?.contains('rabbit-mirror-theater-favorite-host')
        || node?.closest?.('[data-rm-theater-favorite-host="true"], [data-rm-theater-favorite-stage], [data-rm-theater-favorite-viewer], [data-rm-theater-favorite-library]'));
}
function liveChatExternalHosts(nodes) {
    return [...(nodes || [])].filter(node => node?.isConnected !== false && node?.hasAttribute?.(SOURCE_ATTR) && !isTheaterFavoriteHost(node));
}
function liveIndexedExternalHosts(bucket) {
    return liveChatExternalHosts(bucket);
}
function cssAttributeValue(value = '') {
    const text = String(value || '');
    try {
        return globalThis.CSS?.escape ? globalThis.CSS.escape(text) : text.replace(/[\\"\n\r\f]/g, char => `\\${char}`);
    }
    catch {
        return text.replace(/[\\"\n\r\f]/g, char => `\\${char}`);
    }
}
export function allExternalHosts() {
    if (externalHostSyncIndex)
        return liveChatExternalHosts(externalHostSyncIndex.hosts);
    return liveChatExternalHosts(document.querySelectorAll?.(`[${SOURCE_ATTR}]`));
}
export function indexedExternalHostsByMesid(mesid = '') {
    const id = String(mesid || '');
    if (externalHostSyncIndex)
        return liveIndexedExternalHosts(externalHostSyncIndex.byMesid.get(id)).filter(node => String(node.dataset?.rmOwnerMesid || node.dataset?.rmExternalOwnerMessage || '') === id);
    if (!id)
        return [];
    const escaped = cssAttributeValue(id);
    return [...(document.querySelectorAll?.(`[${SOURCE_ATTR}][data-rm-owner-mesid="${escaped}"], [${SOURCE_ATTR}][data-rm-external-owner-message="${escaped}"]`) || [])]
        .filter(node => String(node.dataset?.rmOwnerMesid || node.dataset?.rmExternalOwnerMessage || '') === id);
}
export function externalHostsByIdentityKey(key = '', source = '', currentChat = chatKey(getContext())) {
    const id = String(key || '');
    const pool = externalHostSyncIndex && id
        ? liveIndexedExternalHosts(externalHostSyncIndex.byKey.get(id))
        : id
            ? [...(document.querySelectorAll?.(`[${SOURCE_ATTR}][data-rm-key="${cssAttributeValue(id)}"]`) || [])]
            : [];
    return pool.filter(node => String(node.dataset?.rmKey || '') === id
        && (!source || node.dataset?.rmSource === source)
        && (!node.dataset?.rmOwnerChat || node.dataset.rmOwnerChat === currentChat));
}
export function physicalExternalHostOwner(host) {
    if (!host?.isConnected)
        return null;
    const inside = host.closest?.('.mes');
    if (inside)
        return inside;
    if (globalThis.__TAURITAVERN__)
        return null;
    try {
        if (isRabbitMirrorManagedChatSurface())
            return null;
    }
    catch {
        return null;
    }
    for (let cur = host, depth = 0; cur && depth < 4; cur = cur.parentElement, depth += 1) {
        for (let sib = cur.previousElementSibling; sib; sib = sib.previousElementSibling) {
            if (sib.matches?.('.mes'))
                return sib;
        }
    }
    return null;
}
export function restampExternalHostsAfterMessageDeletion(mapSlot) {
    if (typeof mapSlot !== 'function' || typeof document === 'undefined')
        return 0;
    let currentChat = '';
    try {
        currentChat = chatKey(getContext());
    }
    catch {
        return 0;
    }
    if (!currentChat)
        return 0;
    let changed = 0;
    for (const host of [...(document.querySelectorAll?.(`[${SOURCE_ATTR}]`) || [])]) {
        if (String(host.dataset?.rmOwnerChat || '') !== currentChat)
            continue;
        const oldText = String(host.dataset?.rmOwnerMesid ?? host.dataset?.rmExternalOwnerMessage ?? '');
        const old = Number(oldText);
        if (!oldText || !Number.isInteger(old) || old < 0)
            continue;
        const swipe = Number(host.dataset?.rmOwnerSwipe);
        let target;
        try {
            target = mapSlot(`${currentChat}:${old}:${Number.isInteger(swipe) && swipe >= 0 ? swipe : 0}`);
        }
        catch {
            continue;
        }
        if (target === null) {
            host.remove();
            changed += 1;
            continue;
        }
        const match = /:(\d+):(\d+)$/.exec(String(target || ''));
        if (!match || Number(match[1]) === old)
            continue;
        const next = String(Number(match[1]));
        host.dataset.rmOwnerMesid = next;
        host.dataset.rmExternalOwnerMessage = next;
        const key = String(host.dataset?.rmKey || '');
        if (key) {
            try {
                const mappedKey = mapSlot(key);
                if (typeof mappedKey === 'string' && mappedKey)
                    host.dataset.rmKey = mappedKey;
            }
            catch { }
        }
        host.setAttribute('aria-label', `${__rmT("BJgCyT")}${next}${__rmT("fimH.2gA3DsQIiZDc9iNlh")}`);
        stampExternalDetailsOwnership(host);
        changed += 1;
    }
    return changed;
}
export function externalHosts(el) {
    if (!el)
        return [];
    const mesid = externalOwnerMesid(el);
    const currentChat = chatKey(getContext());
    const descendants = [...(el.querySelectorAll?.(`[${SOURCE_ATTR}]`) || [])];
    const checkPlacement = !!el.matches?.('.mes');
    const owned = mesid ? indexedExternalHostsByMesid(mesid).filter(node => {
        const ownerChat = String(node.dataset.rmOwnerChat || '');
        if (ownerChat && ownerChat !== currentChat)
            return false;
        if (checkPlacement) {
            const physical = physicalExternalHostOwner(node);
            if (physical && physical !== el)
                return false;
        }
        return true;
    }) : [];
    return [...new Set([...descendants, ...owned])];
}
export function matchingExternalHosts(el, key = '', source = '') {
    return externalHosts(el).filter(node => (!key || node.dataset.rmKey === key) && (!source || node.dataset.rmSource === source));
}
export function removeDuplicateExternalHosts(el, keep = null, source = '') {
    const keepReady = readyDetailsFromHost(keep);
    for (const node of externalHosts(el)) {
        if (node === keep)
            continue;
        if (source && node.dataset.rmSource !== source)
            continue;
        if (!keepReady && readyDetailsFromHost(node) && String(node.dataset?.rmOwnerMesid || node.dataset?.rmExternalOwnerMessage || '') === externalOwnerMesid(el))
            continue;
        node.remove();
    }
}
export function externalInsertTarget(el) {
    return el;
}
export function inlineAnchorForMessage(el, create = false) {
    const body = messageBody(el);
    if (!el || !body)
        return null;
    const contentParent = (body !== el && body.parentElement && el.contains(body.parentElement))
        ? body.parentElement
        : el;
    const anchors = [...(el.querySelectorAll?.(`[${INLINE_ANCHOR_ATTR}]`) || [])];
    let anchor = anchors[0] || null;
    const putAfterBody = (node) => {
        if (!node)
            return;
        if (body !== el && contentParent === body.parentElement) {
            body.insertAdjacentElement?.('afterend', node);
        }
        else if (node.parentElement !== contentParent) {
            contentParent.append(node);
        }
    };
    if (anchor && anchor.parentElement !== contentParent)
        putAfterBody(anchor);
    if (!anchor && create) {
        anchor = document.createElement('div');
        anchor.setAttribute(INLINE_ANCHOR_ATTR, 'true');
        anchor.dataset.rmOwnerMesid = externalOwnerMesid(el);
        putAfterBody(anchor);
    }
    for (const duplicate of [...(el.querySelectorAll?.(`[${INLINE_ANCHOR_ATTR}]`) || [])]) {
        if (duplicate !== anchor) {
            for (const host of [...(duplicate.querySelectorAll?.(`:scope > [${SOURCE_ATTR}]`) || [])]) {
                if (anchor)
                    anchor.append(host);
            }
            duplicate.remove();
        }
    }
    if (anchor && body !== el && anchor.previousElementSibling !== body)
        putAfterBody(anchor);
    return anchor;
}
export function removeEmptyInlineAnchors(scope = document) {
    scope?.querySelectorAll?.(`[${INLINE_ANCHOR_ATTR}]`)?.forEach(anchor => {
        if (!anchor.querySelector?.(`[${SOURCE_ATTR}]`))
            anchor.remove();
    });
}
export function followExternalAnchorForMessage(el, create = false) {
    const body = messageBody(el);
    if (!el || !body)
        return null;
    const anchors = [...(el.querySelectorAll?.(`[${FOLLOW_EXTERNAL_ANCHOR_ATTR}]`) || [])];
    let anchor = anchors[0] || null;
    const origin = followOriginMarker(el, null, false);
    const placeAtOrigin = (node) => {
        if (!node)
            return;
        if (origin?.isConnected && body.contains(origin)) {
            if (node.previousElementSibling !== origin || node.parentElement !== origin.parentElement) {
                origin.insertAdjacentElement?.('afterend', node);
            }
            return;
        }
        if (node.parentElement !== body)
            body.append(node);
    };
    if (anchor)
        placeAtOrigin(anchor);
    if (!anchor && create) {
        anchor = document.createElement('div');
        anchor.setAttribute(FOLLOW_EXTERNAL_ANCHOR_ATTR, 'true');
        anchor.dataset.rmOwnerMesid = externalOwnerMesid(el);
        placeAtOrigin(anchor);
    }
    for (const duplicate of [...(el.querySelectorAll?.(`[${FOLLOW_EXTERNAL_ANCHOR_ATTR}]`) || [])]) {
        if (duplicate === anchor)
            continue;
        for (const host of [...(duplicate.querySelectorAll?.(`:scope > [${SOURCE_ATTR}][data-rm-source="follow"]`) || [])])
            anchor?.append(host);
        duplicate.remove();
    }
    if (anchor)
        placeAtOrigin(anchor);
    return anchor;
}
export function removeEmptyFollowExternalAnchors(scope = document) {
    scope?.querySelectorAll?.(`[${FOLLOW_EXTERNAL_ANCHOR_ATTR}]`)?.forEach(anchor => {
        if (!anchor.querySelector?.(`[${SOURCE_ATTR}][data-rm-source="follow"]`))
            anchor.remove();
    });
}
export function followOriginMarker(el, mirror = null, create = false) {
    const body = messageBody(el);
    if (!body)
        return null;
    const markers = [...(body.querySelectorAll?.(`[${FOLLOW_ORIGIN_ATTR}]`) || [])];
    let marker = create && mirror ? markers.find(node => node.nextElementSibling === mirror) || null : markers[0] || null;
    if (create && mirror && body.contains(mirror)) {
        for (const duplicate of markers)
            if (duplicate !== marker)
                duplicate.remove();
        if (!marker) {
            marker = document.createElement('span');
            marker.setAttribute(FOLLOW_ORIGIN_ATTR, 'true');
            marker.dataset.rmOwnerMesid = externalOwnerMesid(el);
            marker.hidden = true;
            mirror.insertAdjacentElement?.('beforebegin', marker);
        }
    }
    return marker;
}
export function legacyFollowOriginContainer(body) {
    if (!body?.querySelectorAll)
        return null;
    const candidates = [...body.querySelectorAll('toto')].reverse();
    return candidates.find(node => {
        if (node.querySelector?.('details'))
            return false;
        if (String(node.textContent || '').trim())
            return false;
        return !node.querySelector?.('img,svg,canvas,video,audio,iframe,input,button,select,textarea,table,ul,ol,section,article,main,figure,[role],[data-action]');
    }) || null;
}
export function stampExternalDetailsOwnership(host) {
    if (!host)
        return;
    const faces = externalFaceDetails(host);
    for (const [index, details] of faces.entries()) {
        details.dataset.rabbitMirrorOwnerChat = String(host.dataset.rmOwnerChat || '');
        details.dataset.rabbitMirrorOwnerMesid = String(host.dataset.rmOwnerMesid || host.dataset.rmExternalOwnerMessage || '');
        details.dataset.rabbitMirrorOwnerSwipe = String(host.dataset.rmOwnerSwipe || '0');
        details.dataset.rabbitMirrorOwnerKey = String(host.dataset.rmKey || '');
        details.dataset.rabbitMirrorOwnerSourceHash = String(host.dataset.rmSourceHash || '');
        if (faces.length > 1)
            details.dataset.rabbitMirrorFaceIndex = String(index);
        else if (Number(host.dataset?.rmFaceCount || 0) <= 1)
            delete details.dataset.rabbitMirrorFaceIndex;
    }
}
export function stampExternalHostOwnership(el, host, key = '', source = 'independent') {
    if (!el || !host)
        return;
    const ctx = getContext();
    const mesid = externalOwnerMesid(el);
    const msg = Number.isInteger(Number(mesid)) ? ctx.chat?.[Number(mesid)] : null;
    host.setAttribute(SOURCE_ATTR, 'true');
    host.setAttribute(EXTERNAL_SHELL_ATTR, 'true');
    host.classList.add('rabbit-mirror-external-host', 'rabbit-mirror-external-shell');
    host.dataset.rmKey = String(key || host.dataset.rmKey || '');
    host.dataset.rmSource = String(source || host.dataset.rmSource || 'independent');
    host.dataset.rmOwnerMesid = mesid;
    host.dataset.rmExternalOwnerMessage = mesid;
    host.dataset.rmOwnerChat = chatKey(ctx);
    host.dataset.rmOwnerSwipe = String(swipeId(msg));
    host.setAttribute('role', 'region');
    host.setAttribute('aria-label', `${__rmT("BJgCyT")}${mesid || '?'}${__rmT("fimH.2gA3DsQIiZDc9iNlh")}`);
    stampExternalDetailsOwnership(host);
}
export function clearExternalHostGeometryTokens(host) {
    if (!host)
        return;
    for (const name of ['--rm-external-lane-width', '--rm-external-lane-left', '--rm-external-inline-start', '--rm-external-inline-end', '--rm-external-compact-width']) {
        if (host.style.getPropertyValue(name))
            host.style.removeProperty(name);
    }
}
function stableMessageContentLane(el) {
    const body = messageBody(el);
    if (!el || !body)
        return null;
    if (body !== el) {
        const parent = body.parentElement;
        if (parent?.isConnected && el.contains(parent))
            return parent;
        return body;
    }
    return el.querySelector?.('.mes_block') || el;
}
export function elementContentBoxRect(node) {
    if (!node?.isConnected)
        return null;
    try {
        const rect = node.getBoundingClientRect();
        const style = typeof getComputedStyle === 'function' ? getComputedStyle(node) : null;
        const borderLeft = Math.max(0, parseFloat(style?.borderLeftWidth || '0') || 0);
        const borderRight = Math.max(0, parseFloat(style?.borderRightWidth || '0') || 0);
        const paddingLeft = Math.max(0, parseFloat(style?.paddingLeft || '0') || 0);
        const paddingRight = Math.max(0, parseFloat(style?.paddingRight || '0') || 0);
        const left = Number(rect.left || 0) + borderLeft + paddingLeft;
        const right = Number(rect.right || 0) - borderRight - paddingRight;
        const width = Math.max(0, right - left);
        if (!Number.isFinite(left) || !Number.isFinite(right) || !Number.isFinite(width))
            return null;
        return { left, right, width };
    }
    catch {
        return null;
    }
}
function independentExternalMobilePlatformHint() {
    if (globalThis.navigator?.userAgentData?.mobile === true)
        return true;
    return /(?:Android|iPhone|iPad|iPod|Mobile)/i.test(String(globalThis.navigator?.userAgent || ''));
}
export function independentExternalEffectiveViewportWidth() {
    const normalize = value => {
        const number = Number(value);
        return Number.isFinite(number) && number > 0 ? number : 0;
    };
    const visualWidth = normalize(globalThis.visualViewport?.width);
    const layoutWidths = [
        normalize(globalThis.innerWidth),
        normalize(globalThis.document?.documentElement?.clientWidth),
        normalize(globalThis.screen?.width),
    ].filter(Boolean);
    const allWidths = [visualWidth, ...layoutWidths].filter(Boolean);
    if (!allWidths.length)
        return 0;
    if (layoutWidths.some(width => width < 900))
        return Math.min(...allWidths);
    if (visualWidth > 0 && visualWidth < 900 && independentExternalMobilePlatformHint())
        return Math.min(...allWidths);
    return layoutWidths.length ? Math.min(...layoutWidths) : visualWidth;
}
export function roundedGeometryNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number * 10) / 10 : 0;
}
export function geometryCssValue(value) { return `${roundedGeometryNumber(value)}px`; }
export function geometryNearlyEqual(a, b, tolerance = EXTERNAL_GEOMETRY_STABILITY_TOLERANCE_PX) {
    if (!a || !b)
        return false;
    return Math.abs(Number(a.left) - Number(b.left)) <= tolerance
        && Math.abs(Number(a.width) - Number(b.width)) <= tolerance;
}
export function readGeometryDataset(host, prefix) {
    const width = Number(host?.dataset?.[`${prefix}Width`]);
    const left = Number(host?.dataset?.[`${prefix}Left`]);
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(left))
        return null;
    return { width, left };
}
export function writeGeometryDataset(host, prefix, geometry) {
    if (!host?.dataset || !geometry)
        return;
    host.dataset[`${prefix}Width`] = String(roundedGeometryNumber(geometry.width));
    host.dataset[`${prefix}Left`] = String(roundedGeometryNumber(geometry.left));
}
export function clearGeometryDataset(host, prefix) {
    if (!host?.dataset)
        return;
    delete host.dataset[`${prefix}Width`];
    delete host.dataset[`${prefix}Left`];
}
export function clampGeometryToStructural(geometry, structural) {
    if (!geometry || !structural)
        return structural || geometry || null;
    const structuralLeft = Number(structural.left);
    const structuralWidth = Math.max(0, Number(structural.width));
    const structuralRight = structuralLeft + structuralWidth;
    if (!Number.isFinite(structuralLeft) || !Number.isFinite(structuralWidth) || structuralWidth <= 0)
        return geometry;
    let left = Number(geometry.left);
    let width = Math.max(0, Number(geometry.width));
    if (!Number.isFinite(left) || !Number.isFinite(width) || width <= 0)
        return structural;
    left = Math.max(structuralLeft, Math.min(left, structuralRight));
    width = Math.min(width, Math.max(0, structuralRight - left));
    if (width <= 0)
        return structural;
    return { left, width };
}
function confirmedExternalHostGeometry(host) { return readGeometryDataset(host, 'rmGeometryConfirmed'); }
export function markExternalGeometryLifecycle(reason = 'lifecycle-refresh') {
    writeExternalGeometryLifecycleEpoch(externalGeometryLifecycleEpoch + (1));
    writeExternalGeometryLifecycleReason(String(reason || 'lifecycle-refresh'));
}
export function beginExternalHostGeometryCycle(host, reason = 'geometry-refresh', el = null) {
    if (!host?.dataset || host.dataset.rmSource !== 'independent' || String(host.dataset.rmPlacement || 'external') !== 'external')
        return '';
    const cycleId = String(writeExternalGeometryCycleSequence(externalGeometryCycleSequence + (1)));
    host.dataset.rmGeometryCycleId = cycleId;
    host.dataset.rmGeometryCycleVersion = EXTERNAL_GEOMETRY_CYCLE_VERSION;
    host.dataset.rmGeometryCycleReason = String(reason || 'geometry-refresh');
    host.dataset.rmGeometryLifecycleEpoch = String(externalGeometryLifecycleEpoch);
    host.dataset.rmGeometrySettleState = 'pending';
    delete host.dataset.rmGeometrySettlePass;
    delete host.dataset.rmGeometrySettleCycle;
    delete host.dataset.rmGeometrySettleCorrected;
    delete host.dataset.rmGeometryScheduleCycle;
    clearGeometryDataset(host, 'rmGeometryCandidate');
    clearGeometryDataset(host, 'rmGeometryLate');
    delete host.dataset.rmGeometryCandidateSource;
    delete host.dataset.rmGeometryLateSource;
    if (el)
        externalGeometryOwnerNodes.set(host, el);
    return cycleId;
}
export function ensureExternalHostGeometryCycle(el, host, forceReason = '') {
    if (!host?.dataset || host.dataset.rmSource !== 'independent' || String(host.dataset.rmPlacement || 'external') !== 'external')
        return '';
    const current = String(host.dataset.rmGeometryCycleId || '');
    const ownerKnown = externalGeometryOwnerNodes.has(host);
    const previousOwner = ownerKnown ? externalGeometryOwnerNodes.get(host) : null;
    let reason = '';
    if (!current)
        reason = 'new-host';
    else if (!ownerKnown)
        reason = 'runtime-adopt';
    else if (el && previousOwner !== el)
        reason = 'owner-dom-replaced';
    else if (String(host.dataset.rmGeometryLifecycleEpoch || '') !== String(externalGeometryLifecycleEpoch))
        reason = externalGeometryLifecycleReason || 'lifecycle-refresh';
    else if (forceReason)
        reason = String(forceReason);
    if (reason)
        return beginExternalHostGeometryCycle(host, reason, el);
    if (el)
        externalGeometryOwnerNodes.set(host, el);
    return current;
}
export function updateExternalGeometryDiagnostics(host, plan) {
    if (!host?.dataset || !plan?.mobileIndependent)
        return;
    writeGeometryDataset(host, 'rmGeometryStructural', plan.structural);
    if (plan.body) {
        writeGeometryDataset(host, 'rmGeometryBody', plan.body);
    }
    else
        clearGeometryDataset(host, 'rmGeometryBody');
    writeGeometryDataset(host, 'rmGeometryCandidate', plan.candidate);
    host.dataset.rmGeometryCandidateSource = String(plan.candidateSource || 'structural');
}
export function confirmExternalHostGeometry(host, geometry, reason = '', source = 'message-text') {
    if (!host?.dataset || !geometry)
        return null;
    writeGeometryDataset(host, 'rmGeometryConfirmed', geometry);
    host.dataset.rmGeometryConfirmedCycle = String(host.dataset.rmGeometryCycleId || '');
    host.dataset.rmGeometryConfirmedReason = String(reason || 'time-stable');
    host.dataset.rmGeometryConfirmedSource = String(source || 'message-text');
    return geometry;
}
export function chooseMobileExternalAppliedGeometry(host, plan) {
    const structural = plan?.structural;
    if (plan?.mobileIndependent && plan?.canonicalStructuralLane) {
        return { geometry: structural, kind: 'structural' };
    }
    const confirmed = confirmedExternalHostGeometry(host);
    if (confirmed) {
        return { geometry: clampGeometryToStructural(confirmed, structural), kind: String(host.dataset.rmGeometryConfirmedCycle || '') === String(host.dataset.rmGeometryCycleId || '') ? 'confirmed' : 'last-known-good' };
    }
    return { geometry: structural, kind: 'structural' };
}
export function computeExternalHostGeometryPlan(el, host) {
    if (!host?.isConnected)
        return { skip: true };
    const source = String(host.dataset.rmSource || 'independent');
    const placement = String(host.dataset.rmPlacement || 'external');
    if (placement !== 'external' || !el?.isConnected) {
        return { clear: true, mode: placement === 'inline' ? 'inline-content-lane' : 'stable-fallback' };
    }
    const lane = stableMessageContentLane(el);
    const body = messageBody(el);
    if (source === 'follow') {
        const laneBox = elementContentBoxRect(lane);
        const bodyBox = body && body !== el ? elementContentBoxRect(body) : null;
        const bodyLooksStable = !!(laneBox && bodyBox && bodyBox.width >= 220 && bodyBox.width >= laneBox.width * .62
            && bodyBox.left >= laneBox.left - 2 && bodyBox.right <= laneBox.right + 2);
        if (bodyLooksStable) {
            const insetLeft = Math.max(0, bodyBox.left - laneBox.left);
            const insetRight = Math.max(0, laneBox.right - bodyBox.right);
            return { clear: true, mode: (insetLeft >= 4 || insetRight >= 4) ? 'follow-content-lane' : 'follow-stable-fallback' };
        }
        return { clear: true, mode: 'follow-stable-fallback' };
    }
    if (source !== 'independent')
        return { clear: true, mode: 'stable-fallback' };
    if (['body', 'message'].includes(String(host.dataset.rmExternalAnchor || '')) && host.closest?.('.mes') === el && !globalThis.__TAURITAVERN__ && !isRabbitMirrorManagedChatSurface())
        return { clear: true, mode: 'inside-message' };
    const parent = host.parentElement;
    if (!lane?.isConnected || !parent?.isConnected)
        return { clear: true, mode: 'stable-fallback' };
    try {
        const parentRect = parent.getBoundingClientRect();
        const parentStyle = typeof getComputedStyle === 'function' ? getComputedStyle(parent) : null;
        const padLeft = Math.max(0, parseFloat(parentStyle?.paddingLeft || '0') || 0);
        const padRight = Math.max(0, parseFloat(parentStyle?.paddingRight || '0') || 0);
        const borderLeft = Math.max(0, Number(parent.clientLeft || 0));
        const borderRight = Math.max(0, Number(parentRect.width || 0) - Number(parent.clientWidth || 0) - borderLeft);
        const contentLeft = Number(parentRect.left || 0) + borderLeft + padLeft;
        const contentRight = Number(parentRect.right || 0) - borderRight - padRight;
        const contentWidth = Math.max(0, contentRight - contentLeft);
        const laneBox = elementContentBoxRect(lane);
        if (!laneBox || contentWidth <= 0)
            throw new Error('invalid content-lane geometry');
        let structuralLeft = Number(laneBox.left || 0) - contentLeft;
        let structuralWidth = Number(laneBox.width || 0);
        if (!Number.isFinite(structuralLeft) || !Number.isFinite(structuralWidth))
            throw new Error('invalid structural-lane geometry');
        structuralLeft = Math.max(0, Math.min(structuralLeft, Math.max(0, contentWidth - 1)));
        structuralWidth = Math.min(structuralWidth, Math.max(0, contentWidth - structuralLeft));
        if (structuralWidth < 220 || (contentWidth >= 320 && structuralWidth < contentWidth * .55))
            return { clear: true, mode: 'stable-fallback' };
        const structural = { left: structuralLeft, width: structuralWidth };
        const viewportWidth = independentExternalEffectiveViewportWidth();
        if (viewportWidth > 0 && viewportWidth < 900) {
            const bodyBox = body && body !== el ? elementContentBoxRect(body) : null;
            const bodyMeasurable = !!(bodyBox
                && bodyBox.width >= 220
                && bodyBox.left >= laneBox.left - 8
                && bodyBox.right <= laneBox.right + 8
                && bodyBox.left >= contentLeft - 8
                && bodyBox.right <= contentRight + 8
                && bodyBox.width <= contentWidth + 16);
            let bodyGeometry = null;
            if (bodyMeasurable) {
                let bodyLeft = Number(bodyBox.left || 0) - contentLeft;
                let bodyWidth = Number(bodyBox.width || 0);
                if (Number.isFinite(bodyLeft) && Number.isFinite(bodyWidth)) {
                    bodyLeft = Math.max(0, Math.min(bodyLeft, Math.max(0, contentWidth - 1)));
                    bodyWidth = Math.min(bodyWidth, Math.max(0, contentWidth - bodyLeft));
                    if (bodyWidth >= 220)
                        bodyGeometry = { left: bodyLeft, width: bodyWidth };
                }
            }
            const candidate = structural;
            return {
                clear: false,
                mobileIndependent: true,
                canonicalStructuralLane: true,
                mode: 'mobile-structural-content-lane',
                structural,
                body: bodyGeometry,
                candidate,
                candidateSource: 'structural',
            };
        }
        return {
            clear: false,
            mode: 'inline-parent-content-box',
            width: geometryCssValue(structural.width),
            left: geometryCssValue(structural.left),
        };
    }
    catch {
        return { clear: true, mode: 'stable-fallback' };
    }
}
