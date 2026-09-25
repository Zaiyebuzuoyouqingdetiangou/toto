import { parseMultifaceOutput, createMultifaceFailureSlot } from './multifaceProtocol.js?rmv=1.5.53-cn-boundary1';
import { compactFormatDescriptors } from './selectionImageMetadata.js?rmv=1.6.4-creation1';
import { isBlankLongTextSelection } from './presentationMode.js?rmv=1.6.16-test.4';

function wrapIndependentFaceForMerge(inner, index) {
    return `<toto data-rabbit-mirror="true" data-rm-face="${index + 1}">${String(inner || '')}</toto>`;
}

function isFailureFaceHtml(html = '') {
    return /data-rabbit-mirror-face-failure/i.test(String(html || ''));
}

function retryFaces(incomingHtml, count) {
    const source = String(incomingHtml || '').trim();
    if (!source || count < 1 || count > 5) return [];
    if (count > 1) {
        const parsed = parseMultifaceOutput(source, { expectedCount: count });
        return parsed.ok ? parsed.faces : [];
    }
    // The request layer has already sanitized a single response into details.
    // Keep the shared parser's budgets and structural checks: its sole error
    // may be the deliberate 2..5-face minimum, never a malformed suffix.
    const framed = /^<details\b/i.test(source) ? wrapIndependentFaceForMerge(source, 0) : source;
    const parsed = parseMultifaceOutput(framed);
    return parsed.faces.length === 1 && parsed.faces[0].index === 0
        && parsed.errors.length === 1 && parsed.errors[0].code === 'face-count-mismatch'
        ? parsed.faces : [];
}

const RETRY_SELECTION_FIELDS = Object.freeze([
    'samplingMode', 'themeIds', 'formatIds', 'textIds', 'themeLabels', 'formatLabels', 'textLabels',
    'requestedPresentationMode', 'presentationMode', 'blankLongText', 'forcedVisualScenery', 'visualSceneryCombination',
    'hasExternalReferences', 'externalSources', 'customThemeCount', 'customFormatCount', 'customRequestCount',
]);

function retrySelectionFields(value) {
    if (!value || !Array.isArray(value.themeIds) || !Array.isArray(value.formatIds)) return null;
    const ids = ['themeIds', 'formatIds', ...(value.textIds !== undefined ? ['textIds'] : [])];
    if (ids.some(key => !Array.isArray(value[key]) || value[key].length > 16
        || value[key].some(id => typeof id !== 'string' || !id.trim()))) return null;
    if (value.blankLongText !== undefined && !isBlankLongTextSelection(value)) return null;
    if (!isBlankLongTextSelection(value) && !ids.some(key => value[key].length) && !['customThemeCount', 'customFormatCount', 'customRequestCount']
        .some(key => Number(value[key]) > 0)) return null;
    const selection = Object.fromEntries(RETRY_SELECTION_FIELDS.filter(key => Object.hasOwn(value, key))
        .map(key => [key, Array.isArray(value[key]) ? [...value[key]] : value[key]]));
    const descriptors = compactFormatDescriptors(value);
    if (descriptors.length) selection.formatDescriptors = descriptors;
    return selection;
}

// failedFaces is already expressed in original batch indices by the HTML merge.
// A network error may have no selection metadata: retain the frozen recipes,
// and leave unknown entries null rather than inventing retry authority.
export function mergeRetrySelectionDiagnostic(previousFaces, incomingDiagnostic, missingIndexes, expectedCount, failedFaces = []) {
    const count = Number.isInteger(expectedCount) && expectedCount >= 1 && expectedCount <= 5 ? expectedCount : 0;
    const diagnostic = incomingDiagnostic && typeof incomingDiagnostic === 'object' && !Array.isArray(incomingDiagnostic)
        ? incomingDiagnostic : {};
    const faces = Array.from({ length: count }, (_, index) => {
        const old = Array.isArray(previousFaces) ? previousFaces[index] : null;
        return old && typeof old === 'object' && !Array.isArray(old) ? { ...old, faceIndex: index } : null;
    });
    const missing = [...new Set((Array.isArray(missingIndexes) ? missingIndexes : [])
        .filter(index => Number.isInteger(index) && index >= 0 && index < count))].sort((a, b) => a - b);
    const incomingFaces = Array.isArray(diagnostic.faces) && diagnostic.faces.length === missing.length
        ? diagnostic.faces : missing.length === 1 && !Array.isArray(diagnostic.faces) ? [diagnostic] : [];
    missing.forEach((index, localIndex) => {
        const incoming = incomingFaces[localIndex];
        if (incoming?.faceIndex !== undefined && incoming.faceIndex !== localIndex) return;
        const selection = retrySelectionFields(incoming);
        if (selection) {
            // A deliberately fresh selection can change text/HTML or source.
            // Missing optional fields must not retain the old recipe's flags.
            faces[index] = { ...selection, faceIndex: index };
        }
    });
    const failures = (Array.isArray(failedFaces) ? failedFaces : [])
        .filter(face => Number.isInteger(face?.faceIndex) && face.faceIndex >= 0 && face.faceIndex < count)
        .filter((face, index, list) => list.findIndex(other => other.faceIndex === face.faceIndex) === index)
        .map(face => ({ ...face }));
    return { ...diagnostic, faceCount: count, faces, partial: failures.length > 0,
        failedFaces: failures, completedFaces: count - failures.length };
}

export function recipesCoverMissing(recipes, indexes = []) {
    if (!Array.isArray(recipes) || !indexes.length) return false;
    return indexes.every(index => Number.isInteger(index) && index >= 0 && recipes[index]);
}

export function remapRetryFaceIndexes(failedFaces, missingIndexes) {
    const missing = Array.isArray(missingIndexes) ? missingIndexes : [];
    return (Array.isArray(failedFaces) ? failedFaces : [])
        .map(face => {
            const local = Number(face?.faceIndex);
            const original = Number.isInteger(local) ? missing[local] : undefined;
            return Number.isInteger(original) ? { ...face, faceIndex: original } : null;
        })
        .filter(Boolean);
}

export function missingIndexesFromIndependentResult(result, expectedCount = 1, previousMissing = []) {
    const expected = Math.max(1, Number(expectedCount) || 1);
    if (result?.skipped) return [];
    if (Array.isArray(result?.failedFaces) && result.failedFaces.length) {
        return [...new Set(result.failedFaces
            .map(face => Number(face.faceIndex))
            .filter(index => Number.isInteger(index) && index >= 0 && index < expected))]
            .sort((left, right) => left - right);
    }
    const html = String(result?.html || '');
    if (!html.trim()) {
        return previousMissing.length
            ? [...previousMissing]
            : Array.from({ length: expected }, (_, index) => index);
    }
    if (expected <= 1) {
        if (/<details\b/i.test(html) && !isFailureFaceHtml(html)) return [];
        return [0];
    }
    const parsed = parseMultifaceOutput(html, { expectedCount: expected });
    if (!parsed.ok) {
        return previousMissing.length
            ? [...previousMissing]
            : Array.from({ length: expected }, (_, index) => index);
    }
    const missing = [];
    for (const face of parsed.faces) {
        if (isFailureFaceHtml(face.html || face.inner || '')) missing.push(face.index);
    }
    for (let index = 0; index < expected; index += 1) {
        if (!parsed.faces.some(face => face.index === index)) missing.push(index);
    }
    return [...new Set(missing)].sort((left, right) => left - right);
}

export function mergeMissingIndependentFaces(previousHtml, expectedCount, missingIndexes, incoming = {}) {
    const expected = Math.max(1, Number(expectedCount) || 1);
    const missing = [...new Set((Array.isArray(missingIndexes) ? missingIndexes : [])
        .filter(index => Number.isInteger(index) && index >= 0 && index < expected))]
        .sort((left, right) => left - right);
    const previous = parseMultifaceOutput(String(previousHtml || ''), { expectedCount: expected });
    const previousFaces = previous.ok ? previous.faces : [];
    const incomingHtml = String(incoming?.html || '');
    const incomingFaces = retryFaces(incomingHtml, missing.length);
    const incomingFailed = new Set((Array.isArray(incoming?.failedFaces) ? incoming.failedFaces : [])
        .map(face => Number(face.faceIndex)));
    const next = [];
    const failedFaces = [];
    let incomingCursor = 0;
    for (let index = 0; index < expected; index += 1) {
        if (!missing.includes(index)) {
            const kept = previousFaces.find(face => face.index === index);
            next.push(kept?.html || createMultifaceFailureSlot(index, 'incomplete-face'));
            if (!kept || isFailureFaceHtml(kept.html || '')) {
                failedFaces.push({ faceIndex: index, status: 'failed', code: 'incomplete-face' });
            }
            continue;
        }
        const piece = incomingFaces[incomingCursor];
        const incomingIndex = incomingCursor;
        incomingCursor += 1;
        if (piece && !isFailureFaceHtml(piece.html || piece.inner || '') && !incomingFailed.has(incomingIndex)) {
            next.push(wrapIndependentFaceForMerge(piece.details || piece.inner || '', index));
        } else {
            const code = String(incoming?.failedFaces?.find(face => Number(face.faceIndex) === incomingIndex)?.code || 'incomplete-face');
            const old = previousFaces.find(face => face.index === index);
            next.push(old?.html || createMultifaceFailureSlot(index, code));
            failedFaces.push({ faceIndex: index, status: 'failed', code });
        }
    }
    return {
        html: next.join('\n'),
        failedFaces,
        completedFaces: expected - failedFaces.length,
        mergedFromMissingRetry: true,
    };
}
