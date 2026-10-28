export function preserveIndependentFaceStyles(details) {
    if (!details?.querySelectorAll || details.isConnected)
        return details;
    const wrapper = details.closest('toto');
    const boundary = wrapper || details.getRootNode();
    if (!boundary?.querySelectorAll || boundary.nodeType === 9)
        return details;
    const styles = [...boundary.querySelectorAll('style')].filter(style => !style.closest('details') && style.closest('toto') === wrapper);
    const before = [];
    const after = [];
    for (const style of styles) {
        (style.compareDocumentPosition(details) & 4 ? before : after).push(style);
    }
    const summary = details.querySelector(':scope > summary');
    const reference = summary ? summary.nextSibling : details.firstChild;
    for (const style of before) {
        if (reference)
            details.insertBefore(style, reference);
        else
            details.append(style);
    }
    for (const style of after)
        details.append(style);
    return details;
}
