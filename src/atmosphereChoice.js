export function parseAtmosphereTicketIndex(html, menuLength) {
    const count = Number(menuLength);
    if (!Number.isInteger(count) || count < 2) return null;
    const text = String(html || '');
    const match = text.match(/<rm-ticket>\s*(\d+)\s*<\/rm-ticket>/i) || text.match(/data-rm-ticket\s*=\s*["'](\d+)["']/i);
    if (!match) return null;
    const index = Number(match[1]) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= count) return null;
    return index;
}

export function stripAtmosphereTicketTag(html) {
    return String(html || '').replace(/<rm-ticket>\s*\d+\s*<\/rm-ticket>/gi, '');
}

export function atmosphereChoicesFromFaces(faces, menus) {
    const list = Array.isArray(faces) ? faces : [];
    return (Array.isArray(menus) ? menus : []).map((menu, index) => {
        if (!Array.isArray(menu) || menu.length < 2) return null;
        const face = list.find(item => item?.index === index) || list[index];
        return parseAtmosphereTicketIndex(face?.html || '', menu.length);
    });
}
