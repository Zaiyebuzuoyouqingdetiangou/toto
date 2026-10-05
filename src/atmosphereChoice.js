import { generationPaletteFields } from './paletteRecipes.js?rmv=1.62.92';
import { interactionRecipeFields } from './interactionRecipes.js?rmv=1.62.92';

const ATMOSPHERE_REASON_LIMIT = 300;

export function parseAtmosphereTicketIndex(html, menuLength) {
    const count = Number(menuLength);
    if (!Number.isInteger(count) || count < 2) return null;
    const text = String(html || '');
    const match = text.match(/<rm-ticket(?:\s[^>]*)?>\s*(\d+)\s*<\/rm-ticket\s*>/i) || text.match(/data-rm-ticket\s*=\s*["'](\d+)["']/i);
    if (!match) return null;
    const index = Number(match[1]) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= count) return null;
    return index;
}

export function parseAtmosphereThink(html) {
    const match = String(html || '').match(/<rm-think(?:\s[^>]*)?>([\s\S]*?)<\/rm-think\s*>/i);
    if (!match) return '';
    return match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, ATMOSPHERE_REASON_LIMIT);
}

export function stripAtmosphereTicketTag(html) {
    return String(html || '').replace(/<rm-ticket(?:\s[^>]*)?>\s*\d+\s*<\/rm-ticket\s*>/gi, '');
}

export function stripAtmosphereChoiceMarkup(html) {
    return stripAtmosphereTicketTag(html)
        .replace(/<rm-think(?:\s[^>]*)?>[\s\S]*?<\/rm-think\s*>/gi, '')
        .replace(/\sdata-rm-ticket\s*=\s*["']\d+["']/gi, '');
}

export function compactAtmosphereMenu(menu) {
    if (!Array.isArray(menu) || menu.length < 2) return null;
    const line = value => String(value || '').replace(/\s+/g, ' ').trim().slice(0, 140);
    const full = value => String(value || '').replace(/\s+/g, ' ').trim().slice(0, 2000);
    const ids = values => (Array.isArray(values) ? values : []).filter(id => typeof id === 'string' && id).slice(0, 6);
    const lines = (values, clean) => (Array.isArray(values) ? values : []).map(clean).filter(Boolean).slice(0, 6);
    return menu.slice(0, 4).map(ticket => ({
        ...interactionRecipeFields(ticket), ...generationPaletteFields(ticket),
        themeIds: ids(ticket?.themeIds),
        formatIds: ids(ticket?.formatIds),
        themeLines: lines(ticket?.themeLines, line),
        formatLines: lines(ticket?.formatLines, line),
        themeFullLines: lines(ticket?.themeFullLines, full),
        formatFullLines: lines(ticket?.formatFullLines, full),
    }));
}

function faceHtmlChunks(html, count) {
    const chunks = Array.from({ length: count }, () => '');
    const text = String(html || '');
    const pattern = /<toto\b[^>]*\bdata-rm-face\s*=\s*["'](\d+)["'][^>]*>[\s\S]*?<\/toto>/gi;
    let match;
    while ((match = pattern.exec(text))) {
        const index = Number(match[1]) - 1;
        if (index >= 0 && index < count && !chunks[index]) chunks[index] = match[0];
    }
    return chunks;
}

export function atmosphereNoteFromHtml(html, menu) {
    return {
        choice: parseAtmosphereTicketIndex(html, Array.isArray(menu) ? menu.length : 0),
        reason: parseAtmosphereThink(html),
    };
}

export function atmosphereNotesFromHtml(html, menus) {
    const list = Array.isArray(menus) ? menus : [];
    if (list.length < 2) return [atmosphereNoteFromHtml(html, list[0])];
    const chunks = faceHtmlChunks(html, list.length);
    return list.map((menu, index) => atmosphereNoteFromHtml(chunks[index], menu));
}

export function applyAtmosphereFields(target, menu, note) {
    if (!target || typeof target !== 'object') return target;
    const compact = compactAtmosphereMenu(menu);
    if (!compact) return target;
    target.atmosphereMenu = compact;
    const reason = String(note?.reason || '').trim().slice(0, ATMOSPHERE_REASON_LIMIT);
    if (reason) target.atmosphereReason = reason;
    const choice = note?.choice;
    if (!Number.isInteger(choice) || choice < 0 || choice >= compact.length) return target;
    target.atmosphereChoice = choice;
    const ticket = menu[choice] || compact[choice];
    delete target.interactionRecipeId; delete target.interactionRecipeIds; delete target.paletteRecipeId;
    Object.assign(target, interactionRecipeFields({ ...ticket, presentationMode: target.presentationMode }), generationPaletteFields({ ...ticket, presentationMode: target.presentationMode }));
    if (Array.isArray(ticket?.themeIds)) target.themeIds = ticket.themeIds.filter(id => typeof id === 'string' && id);
    if (Array.isArray(ticket?.formatIds)) target.formatIds = ticket.formatIds.filter(id => typeof id === 'string' && id);
    if (Array.isArray(ticket?.themeLines) && ticket.themeLines.length) target.themeLabels = ticket.themeLines.map(line => String(line));
    if (Array.isArray(ticket?.formatLines) && ticket.formatLines.length) target.formatLabels = ticket.formatLines.map(line => String(line));
    return target;
}

export function applyAtmosphereNotes(metadata, html) {
    if (!metadata || typeof metadata !== 'object') return metadata;
    let copy;
    try { copy = JSON.parse(JSON.stringify(metadata)); } catch { return metadata; }
    const faces = Array.isArray(copy.faces) && copy.faces.length >= 2 ? copy.faces : null;
    const menus = faces ? faces.map(face => face?.atmosphereMenu || null) : [copy.atmosphereMenu || null];
    const notes = atmosphereNotesFromHtml(html, menus);
    const targets = faces || [copy];
    targets.forEach((target, index) => {
        const menu = menus[index];
        const note = notes[index] || { choice: null, reason: '' };
        if (!Array.isArray(menu) || menu.length < 2) return;
        if (!note.reason && note.choice == null && target.atmosphereMenu) return;
        applyAtmosphereFields(target, menu, {
            choice: note.choice == null ? target.atmosphereChoice : note.choice,
            reason: note.reason || target.atmosphereReason || '',
        });
    });
    return copy;
}

export function atmosphereChoicesFromFaces(faces, menus) {
    const list = Array.isArray(faces) ? faces : [];
    return (Array.isArray(menus) ? menus : []).map((menu, index) => {
        if (!Array.isArray(menu) || menu.length < 2) return null;
        const face = list.find(item => item?.index === index) || list[index];
        return parseAtmosphereTicketIndex(face?.html || '', menu.length);
    });
}
