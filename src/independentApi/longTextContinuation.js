import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=2.8.0";
export const CONTINUATION_DIRECTION_MAX_CHARS = 300;
export function normalizeContinuationDirection(value) {
    return String(value ?? '')
        .replace(__rmR("54UtX5XIhFbO_.1UE_FfsAsPcGaNQ00YgjIUHQ9Dys3vpOO7YiJnsFAEFwiPBC1oTLE", "g"), ' ')
        .replace(/\s+/g, ' ')
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
