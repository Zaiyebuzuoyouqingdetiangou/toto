// Local selection metadata only. Never derive presentation from model HTML.
export function normalizePresentationModes(value) {
    return Array.from({ length: 5 }, (_, index) =>
        ['auto', 'html', 'text'].includes(value?.[index]) ? value[index] : 'auto');
}

export function requestedPresentationMode(settings, index = 0) {
    return normalizePresentationModes(settings?.rabbitMirrorPresentationModes)[index] || 'auto';
}

export function isTextPresentation(source) {
    return source?.presentationMode === 'text';
}

export function hasExplicitTextFace(settings) {
    const count = Math.min(5, Math.max(1, Number(settings?.rabbitMirrorFaceCount) || 1));
    return normalizePresentationModes(settings?.rabbitMirrorPresentationModes).slice(0, count).includes('text');
}

// Optional fields keep old records and default Prompt plans byte-compatible.
// Bounds match existing selection metadata; raw imported content is never copied.
export function presentationModeFields(source) {
    if (!source || !['html', 'text'].includes(source.presentationMode)) return {};
    const fields = {
        requestedPresentationMode: ['auto', 'html', 'text'].includes(source.requestedPresentationMode)
            ? source.requestedPresentationMode : 'auto',
        presentationMode: source.presentationMode,
    };
    if (Array.isArray(source.textIds)) fields.textIds = source.textIds.slice(0, 16)
        .filter(id => typeof id === 'string' && id.length <= 2048 && /^ext:[A-Za-z0-9:._!~*'()-]+$/.test(id));
    if (Array.isArray(source.textLabels)) fields.textLabels = source.textLabels.slice(0, 16)
        .filter(label => typeof label === 'string').map(label => label.slice(0, 160));
    return fields;
}
