import { rmT as __rmT } from "./textTable.js?rmv=2.1.10";
import { recentPaletteHueFamilies } from './visualDiversityPolicy.js?rmv=2.1.10';
const FAMILY_NAMES = Object.freeze({ red: __rmT("mr8"), orange: __rmT("IqG"), yellow: __rmT("dG8"), green: __rmT("GL8"), cyan: __rmT("4D_"), blue: __rmT("hFf"), purple: __rmT("3LA"), pink: __rmT("caT") });
const validColor = color => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color);
export function serialPaletteExecutionReminder(observations, target = {}, settings = {}) {
    const { faceIndex, faceCount } = target;
    if (target.presentationMode !== 'html' || target.pureOrder === true
        || !Number.isInteger(faceCount) || faceCount < 2 || faceCount > 5
        || !Number.isInteger(faceIndex) || faceIndex < 0 || faceIndex >= faceCount
        || !Array.isArray(observations))
        return '';
    const seen = new Set();
    const lines = [];
    for (const item of observations.slice(0, 5)) {
        const index = item?.faceIndex;
        if (!Number.isInteger(index) || index < 0 || index >= faceCount || index === faceIndex || seen.has(index)
            || item.presentationMode !== 'html' || item.pureOrder === true)
            continue;
        const palette = item.paletteFingerprint;
        const confidence = Number(palette?.confidence);
        if (!Number.isFinite(confidence) || confidence < .35)
            continue;
        const mainColors = Array.isArray(palette.mainColors) ? palette.mainColors.slice(0, 1).filter(validColor) : [];
        const contentSurfaceColors = confidence >= .5 && Array.isArray(palette.contentSurfaceColors)
            ? palette.contentSurfaceColors.slice(0, 1).filter(validColor) : [];
        if (!mainColors.length && !contentSurfaceColors.length)
            continue;
        const facts = [mainColors.length ? `${__rmT("x_AXYID3")}${mainColors[0]}` : '', contentSurfaceColors.length ? `${__rmT("x_aREh4A")}${contentSurfaceColors[0]}` : ''].filter(Boolean);
        const families = recentPaletteHueFamilies([{ presentationMode: 'html', paletteFingerprint: { confidence, mainColors, contentSurfaceColors } }]);
        if (families.length)
            facts.push(`${families.map(key => FAMILY_NAMES[key]).join(__rmT("Yos"))}${__rmT("tUEgjh")}`);
        lines.push(`${__rmT("_dE")}${index + 1}${__rmT("gC6oxk")}${facts.join(__rmT("Yis"))}`);
        seen.add(index);
    }
    if (!lines.length)
        return '';
    return `${__rmT("d5YWHOHPjMS4Xm4ch22YH6povBLqVhT2")}${lines.join(__rmT("7os"))}${__rmT(".ffpP_e_UxasJB9b.6rTfhHU1vwL1mYu9K7cgcWGakw823IMI_yHGJ_XVZZfe4UCeATba7Sbprawm.ili63zpPFnjuPaEW56UwfSwviFnYqllMWNPgW6cLCAmkDkxHcl42aCbqEwh.BfTBLklXUWCe0GbHtJxUJdhkz..BIvqPE5wQFrZu8_rGFaguJyKDC266AojXh1C3JcMlw9418D4jfyjpNU6KRxfWQmJEOX")}${settings.darkVisualMode === true ? __rmT("iSQnb5J8hyEcFrVC4DD") : settings.visualToneMode === 'soft' ? __rmT("fuHoigjVLZ702xZ.R.7067EI") : ''}`;
}
