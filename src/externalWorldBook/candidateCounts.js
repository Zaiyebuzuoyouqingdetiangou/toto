export function externalCandidateCounts(snapshot, libraryId) {
    const count = key => (snapshot?.[key] || []).find(library => library.libraryId === libraryId)?.ids.length || 0;
    const theme = count('themesByLibrary');
    const format = count('formatsByLibrary');
    const text = count('textsByLibrary');
    return { theme, format, text, total: theme + format + text };
}
