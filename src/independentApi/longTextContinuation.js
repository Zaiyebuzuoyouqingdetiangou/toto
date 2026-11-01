import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=2.10.1";
export const CONTINUATION_DIRECTION_MAX_CHARS = 2000;
export function normalizeContinuationDirection(value) {
    return String(value ?? '')
        .replace(/\r\n?/g, '\n')
        .replace(__rmR("vIljkutO43WwX978nGcXiZWq_.wWopj8a9r_DLoC_L6fTFCwkLBAF9s.mJ1GNRFBc8e09cwsEmEqWeZ6JZoPEpBiwzUBYtFOq8xQIf", "g"), ' ')
        .replace(/[ \t\u3000]+/g, ' ')
        .replace(/ *\n */g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, CONTINUATION_DIRECTION_MAX_CHARS)
        .trim();
}
export function longTextContinuationPrompts({ existingText = '', subject = '', direction = '', index = 0 } = {}) {
    const wish = normalizeContinuationDirection(direction);
    const systemPrompt = `${__rmT("MAdA1mpwOHneoeShioTdBv11NvIvwrO2w8MmjR3TZw_dhHHtuAfCyZI8xUHNC1veNiwCxHY0h8JZhDniO4K6pwCZ9QK87Df24CTCMa6LCSlQJ8g5yjv_OkcYDG_9AOb7XJvuk0ZPGXfGD.v9L1fMR9YtsguFACvC3pD")}${subject ? `${__rmT("7ys")}${subject}` : ''}${__rmT("jzk")}${wish ? `${__rmT("ZmV_TLhZ7XGssD.s4RZcCKI7CqeDhXcfBJE")}${wish}${__rmT("FygCwd99YiPea7w9gJMO21yG9bGOy1Uul7s8EWLc4.yWvzQX")}` : __rmT("Vt40wp7LXHdCaE4OqSZ1GDtubNs")}${__rmT("YYVnFLJThyELfN0dYuIpjERRfKeZHHdKFRWDfi7SQE5FEeRVsisarYoKWxf9uT")}`;
    const userPrompt = `${__rmT("d5eBWSF2FqYdXbk1EM5eL6DRUZntUpBP")}${Number(index) || 0} ASSISTANT]\n${JSON.stringify(String(existingText ?? ''))}${__rmT("HXPI1Te_KourQWOCGxqfYt.UtqY.ExCDq8vePw2DkHOIockNFOuHL8DKuH.vEAjo2XL6J0VDLEXeQEMChy8Kby.uEjACdoruSMpm.BCAHdv3PDWoN4254V_LEMIXXfoPC4WAhNKtGWR77Hs_ZbC")}${wish ? `${__rmT("CG1Bwh2n4tslnRKJIiPc8Tty")}${JSON.stringify(wish)}${__rmT("niWyyT")}` : ''}${__rmT(".CqU.UeZL14N5_.uko_02JM4tfg0qyHia3XXcIahB3vY.OqFpYNFcboQ0w_.hztSKYyzPuTj3UNPy6qSAPakdr9rGPKm9Pea5P74IZfFXWE0qsjeB5DFZ781UE7esFoOsacQ_KSbnr6CCz2ClHlokA4A3vY")}`;
    return { systemPrompt, userPrompt, direction: wish };
}
const CONTINUATION_OPEN = '<section data-rm-continuation="true">';
export function continuationParagraphs(text) {
    return String(text ?? '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\r\n?/g, '\n')
        .split(/\n+/)
        .map(part => part.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
}
const escapeHtml = text => String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function continuationSectionHtml(paragraphs) {
    const list = Array.isArray(paragraphs) ? paragraphs.map(part => String(part ?? '').trim()).filter(Boolean) : continuationParagraphs(paragraphs);
    return `${CONTINUATION_OPEN}${list.map(part => `<p>${escapeHtml(part)}</p>`).join('')}</section>`;
}
function articleBounds(html, faceIndex) {
    const source = String(html);
    const index = Math.max(0, Math.floor(Number(faceIndex)) || 0);
    const faces = [...source.matchAll(/<toto\b[^>]*?\sdata-rm-face\s*=\s*["']?(\d+)/gi)];
    let from = 0;
    let to = source.length;
    let nth = index;
    if (faces.length) {
        const at = faces.findIndex(match => Number(match[1]) === index + 1);
        if (at < 0)
            return null;
        from = faces[at].index;
        to = at + 1 < faces.length ? faces[at + 1].index : source.length;
        nth = 0;
    }
    let close = from - 1;
    for (let seen = 0; seen <= nth; seen += 1) {
        close = source.indexOf('</article>', close + 1);
        if (close < 0 || close >= to)
            return null;
    }
    const open = source.lastIndexOf('<article', close);
    if (open < from)
        return null;
    return { open, close };
}
export function appendContinuationToFaceHtml(html, faceIndex, paragraphs) {
    const source = String(html ?? '');
    const bounds = articleBounds(source, faceIndex);
    if (!bounds)
        return source;
    return `${source.slice(0, bounds.close)}${continuationSectionHtml(paragraphs)}${source.slice(bounds.close)}`;
}
