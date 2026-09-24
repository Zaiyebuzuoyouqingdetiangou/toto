// Local selection metadata only. Never derive presentation from model HTML.
export function normalizePresentationModes(value) {
    // 旧的「文本」档并进长文本。已生成成品上的 presentationMode 仍用 text 表示散文，不在这里改。
    return Array.from({ length: 5 }, (_, index) => {
        const mode = value?.[index] === 'text' ? 'longtext' : value?.[index];
        return ['auto', 'html', 'longtext'].includes(mode) ? mode : 'auto';
    });
}

export function normalizeLongTextSource(value) {
    return ['blank', 'text', 'mixed'].includes(value) ? value : 'blank';
}

export function isBlankLongTextSelection(source) {
    return source?.requestedPresentationMode === 'longtext' && source.presentationMode === 'text'
        && source.blankLongText === true && source.customDirective !== true
        && Array.isArray(source.themeIds) && source.themeIds.length === 0
        && Array.isArray(source.formatIds) && source.formatIds.length === 0
        && (source.textIds === undefined || (Array.isArray(source.textIds) && source.textIds.length === 0));
}

export function requestedPresentationMode(settings, index = 0) {
    return normalizePresentationModes(settings?.rabbitMirrorPresentationModes)[index] || 'auto';
}

export function isTextPresentation(source) {
    return source?.presentationMode === 'text';
}

export function hasExplicitTextFace(settings) {
    const count = Math.min(5, Math.max(1, Number(settings?.rabbitMirrorFaceCount) || 1));
    return normalizePresentationModes(settings?.rabbitMirrorPresentationModes).slice(0, count)
        .some(mode => mode === 'text');
}

export function visualSceneryCombinationEnabled(settings) {
    return settings?.forceVisualScenery === true && settings?.visualSceneryCombination === true;
}

// Optional fields keep old records and default Prompt plans byte-compatible.
// Bounds match existing selection metadata; raw imported content is never copied.
export function presentationModeFields(source) {
    // Batch parents never lend a face-specific flag to a sibling recipe.
    const combination = source?.visualSceneryCombination === true && source?.presentationMode !== 'text' && !(Array.isArray(source?.faces) && source.faces.length >= 2 && !Number.isInteger(source.faceIndex))
        ? { visualSceneryCombination: true } : {};
    if (!source || !['html', 'text'].includes(source.presentationMode)) return combination;
    const fields = {
        ...combination,
        requestedPresentationMode: ['auto', 'html', 'text', 'longtext'].includes(source.requestedPresentationMode)
            ? source.requestedPresentationMode : 'auto',
        presentationMode: source.presentationMode,
    };
    if (isBlankLongTextSelection(source)) fields.blankLongText = true;
    if (Array.isArray(source.textIds)) fields.textIds = source.textIds.slice(0, 16)
        .filter(id => typeof id === 'string' && id.length <= 2048 && /^ext:[A-Za-z0-9:._!~*'()-]+$/.test(id));
    if (Array.isArray(source.textLabels)) fields.textLabels = source.textLabels.slice(0, 16)
        .filter(label => typeof label === 'string').map(label => label.slice(0, 160));
    const worldBookEntryId = String(source.worldBookEntryId || '').trim().slice(0, 360);
    if (worldBookEntryId) {
        fields.worldBookEntryId = worldBookEntryId;
        fields.worldBookTitle = String(source.worldBookTitle || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200);
        fields.worldBookExcerpt = String(source.worldBookExcerpt || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 1800);
    }
    return fields;
}
