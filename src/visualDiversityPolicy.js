import { rmT as __rmT } from "./textTable.js?rmv=1.99.10";
import { classifyPaletteSamples } from './paletteObservation.js?rmv=1.99.10';
const HUE_FAMILY_LABELS = Object.freeze({
    red: __rmT("jtakYPDo"), orange: __rmT("HXdkYPDo"), yellow: __rmT("yOakYPDo"), green: __rmT("kbakYPDo"), cyan: __rmT("PIZkYPDo"),
    blue: __rmT("DTokYPDo"), purple: __rmT("cbMkYPDo"), pink: __rmT("3mXkYPDo"), neutral: __rmT("5lAm4FonOW_WW23aDA3BjiFF6JtRcT"),
});
export function recentPaletteHueFamilies(recent = []) {
    return [...new Set(recent.flatMap(item => {
            if (!item || item.presentationMode === 'text' || item.pureOrder)
                return [];
            const palette = item.paletteFingerprint;
            if (!Number.isFinite(Number(palette?.confidence)) || Number(palette.confidence) < .35)
                return [];
            const validColor = color => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color);
            const main = Array.isArray(palette.mainColors) && palette.mainColors.every(validColor) ? palette.mainColors.slice(0, 1) : [];
            const surfaces = Number(palette?.confidence) >= .5 && Array.isArray(palette?.contentSurfaceColors)
                ? palette.contentSurfaceColors.slice(0, 1).filter(validColor) : [];
            return [...new Set([...main, ...surfaces])].map(hex => {
                const [r, g, b] = hex.slice(1).match(/../g).map(value => parseInt(value, 16));
                if (Math.max(r, g, b) - Math.min(r, g, b) < 16)
                    return '';
                const observed = classifyPaletteSamples([{ color: { r, g, b, a: 1 }, weight: 1 }], palette.source || 'raw', true);
                return observed?.hueFamily === 'neutral' || !HUE_FAMILY_LABELS[observed?.hueFamily] ? '' : observed.hueFamily;
            }).filter(Boolean);
        }))];
}
export function describeHueFamilies(keys = []) {
    return [...new Set(keys)].map(key => HUE_FAMILY_LABELS[key]).filter(Boolean);
}
export function recentPaletteExecutionReminder(recent = [], settings = {}) {
    const families = recentPaletteHueFamilies(recent).map(key => HUE_FAMILY_LABELS[key]);
    if (!families.length)
        return '';
    return `${__rmT("0mDKmVL1cONMJ_PA3JP6F2ymHB8fqzFVDpeaWwH_ehTOlitQqgf1nULbvMtfwS8C")}${families.join(__rmT("jvk"))}${__rmT("tWdXY.CiFNvZUFHVWkPK3SD1kj3v0uirKajWaEYursCyOtwB5UI8d6lGbvgcroa4dwx7o2EgNtGcyAzyelC46dqN1sMtie3P9oVj3fw3D60z6ApLF41FWeo1_wckleMRkM1oMY3wtkwsVBUF3NE2hNhq2hIDV.dRilqJAmd7Cq137dsCUyrqjjos24Ed8EtCdiytof")}${settings.darkVisualMode === true ? __rmT("Rmf4DwdNhZKV_I.UHf4uw7zgct7wLQMKr7ospf") : settings.visualToneMode === 'soft' ? __rmT("FDiV0hUNvObWMhRwc2NBpKVBVhhi4xUG77x9xrNY6A2t4nPSZnDr7f") : ''}`;
}
export function strongVisualDiversityRule({ hasHistory = false, textOnly = false, textRevealRotation = false } = {}) {
    const basis = hasHistory ? __rmT("6w.eA4ZoeWYds0NtDwN6_MffHFaa9h") : __rmT("XSDx3AZT1OwbKyH_pKD");
    if (textOnly || !hasHistory)
        return `${__rmT("h7lmfLop")}${basis}${__rmT("ewZU4fpuNoZwiQvduqWWOU9O55kF9Bapbg6lFmAuOE5cpqZUPdVtsIwd9KR_UCwQuY3rIJyhcmvYGrPX7USF96oUWAT")}${textOnly ? __rmT("t1bE4bHaa.a7iaWGKDTBxEIRxsHCwRUcuk2RaGH1p_xPVwHV8ZSkJoS1ttC9uT") : ''}`;
    return __rmT("xgDYkjwseaACzcQyZfxnSMP4CIAH4GaTP08YahQ21sOq8jK20Z7BfIRpQx2wWKNMzLL40rELdC.AOotHXHvwMtnQkwt6GdX_3aYpcQE.tIPHVDeDkD5Ix5ihjqNr.mvEnfOAxqg9dJXyqqkJ8hqjEWMb3WQZ7K3YIyNptYd_byQmy5ozfvAi0k7ja34forjCeSrb5qD_CzBvpvk_Q_drHWwMqLQWk4A6DQoPhiwp1dqE.C_OFK4oQ.xaajM_P9Gf8dGr4VDDZRGogRfs4n6ZgkgAjXsC0k") + (textRevealRotation ? __rmT("jncQncO5phGh7eFLEi9UeI7vAKxX1rcxtVegV7R2zI.o8j32bzoNnsJV8tX.HbHFosLgg1o6DclNAqjVDB17iwsB20duWdFt7uzbYJ8_5nWjIBa1NXHOKpRRqaysOWHBFZYiazvel2w3zui6JKx_dxH2Q1glKOQe2KQZzqUbMy9Fg4yfFVxCtJrKHzzFHmP50O0zD00_Wvxvkff_AXyQHE07qEJwposGcHUuW8SnReLJhfbCVXbcLReJIgwqRz6t6fF4rcwaxXW3tAfoyzM9I4mHB_CC0k") : '')
        + __rmT("JMdfVGAkcVhzpeflL9KFcFXVEDJ5HB2HxtmhQ087ysuTmoW8QWDmmKCE0ACOFtzW58_3XGEWdjYApCi2FOJ5qGf.4LPs_nYO");
}
export function darkVisualGenerationRule(settings) {
    if (settings?.darkVisualMode !== true)
        return '';
    return __rmT("1LNANUqErTQX4Y9Vv3HfsmaFmI__MR9Pc4LBY6VW0FeBne.Ucv2QRjqMtXgeQaujP0jdGK0VqsL380A_.8e9KmxDw69hfCass3RnECzuHQKG4qtai9tfuRYTUEyrMXfXb3rMDBvhi3fHh32HneCGmghCAc7cSL8QHs8NQZFFDm0tcfLvSa76N0kl39IubXW892qTWDBfSZXcwvz_qwcDjmve6QGzOz_JD_eexD5Yoy.QeVm6gm9l1ApioOLhR7OsKf1iLcskdg5bVdzqNetr62b.eEvHYoJ0aeez0DFR22bs1zzqklKkv0lR_aGAP3xskfs3CTxvmXYqKupvSnBX5nykL6YUkWNYzgIv_vzFml7Kaxbi45VeqzTe96mUOimG5kOtvZtVK5bltdKSiuxvqI6.3Ei0mQgdAzWFy3kxQoU3itmBqm9N2Y6SFHRGgIRPK9kW9421reykOWFAl.ooQ3mq7hwulMvSJVt8eHtbOg0YvCTVSCJomGtMLBZN6AqjqRZ.YFlCiGy9it.tmTDdR2KG5KlpslHoDBZNPB79GWZFnpdKI7I9B0ojGIMgTKyIObgR4T93dyFewNgZmLwQD9WUwFRDJ8g1KLfZbqKOZ_zHXlbZIgcUOA3GOPuv8V7IYCfPGc66APm1D5Kb8AAlyiUeVsyE9DDs2zHVa2ovBePV9jZYwrbWTxfDGqwPkw44X9TLaN7xL8GIkamOVnVBkTZzIHaAP2GU_9s97jYrLgL0JL2EWk4xkP325BKC8DYFhVSzm0QvBB6pcuP4VJV2VFViR3f");
}
const SOFT_TONE_STYLES = Object.freeze([
    { id: 'morandi', name: __rmT("1tBFctagn6R6nh"), desc: __rmT("6HFWxPjSiuFgOqL5bTYV02tisHmPJl1qKcNUXv2ZWB5CsGNqoEC"), colors: [
            [__rmT("ikKPwRsV"), 'red'], [__rmT("0wRuGKsV"), 'red'], [__rmT("yFexFmq9KM8"), 'red'], [__rmT("k6MAZT"), 'orange'], [__rmT("RtzGHkAg"), 'orange'], [__rmT("6pWcFv2HfAf"), 'yellow'],
            [__rmT("0wyAjDDV"), 'green'], [__rmT("NenhqIsNoJf"), 'green'], [__rmT("iiUaifAg"), 'green'], [__rmT("ECXLPk"), 'cyan'], [__rmT("PIfVHkAg"), 'cyan'], [__rmT("ECsuwT"), 'blue'],
            [__rmT("kIjl7M4m"), 'blue'], [__rmT("DbyzGJ4m"), 'blue'], [__rmT("ECmw7h"), 'purple'], [__rmT("JTNVYcBr"), 'purple'], [__rmT("0wt5WinS"), 'purple'], [__rmT("tJUR7T"), 'pink'],
            [__rmT("dexR7T"), 'pink'], [__rmT("fcOR7T"), 'pink'], [__rmT("_YoAZT"), 'neutral'], [__rmT("visjwkAg"), 'neutral']
        ] },
    { id: 'pastel', name: __rmT("yFYoA7tAKeh"), desc: __rmT("umdrkKgiGHNLG5bXuhP5wH9wqE.4xlI8h0PsT9v8f5p"), colors: [
            [__rmT("iXFuGTAt"), 'red'], [__rmT("z2Zgjk"), 'orange'], [__rmT("8hZxizY7"), 'orange'], [__rmT("1X8Z.6WU"), 'yellow'], [__rmT("ohNVY8DV"), 'green'], [__rmT("VKUtYGDV"), 'green'],
            [__rmT("n.Dw0ZmE"), 'cyan'], [__rmT("iX6rwzmE"), 'cyan'], [__rmT("S.WRhN4m"), 'blue'], [__rmT("iX62SN4m"), 'blue'], [__rmT("P2nw7h"), 'purple'], [__rmT("4Ju1r3A2PJ_"), 'purple'],
            [__rmT("z27R7T"), 'pink'], [__rmT("5XU4Ywf1"), 'pink'], [__rmT("8hZxitf1"), 'pink'], [__rmT("YTrlebf1"), 'pink']
        ] },
    { id: 'chinese', name: __rmT("sOh6I53g8gAJfk"), desc: __rmT("YYpLy3alAolLfn44CYQG6OVKERMnvViA8bzH_8BFu.o_tVs6U5L.tEZ0C.QNcf"), colors: [
            [__rmT("oged7f"), 'red'], [__rmT("461HBh"), 'pink'], [__rmT("3mKfP90X"), 'pink'], [__rmT("dev5ik"), 'purple'], [__rmT("nu33Gh"), 'purple'], [__rmT("7gMFnf"), 'blue'],
            [__rmT("NNNaif"), 'blue'], [__rmT("uBzLPk"), 'cyan'], [__rmT("cKPrwRG4"), 'cyan'], [__rmT("Axa1hvmE"), 'cyan'], [__rmT("teaLPk"), 'green'], [__rmT("heiaif"), 'neutral']
        ] },
    { id: 'airy', name: __rmT("EO.rVLcXJMKWGT"), desc: __rmT("WpEtX6MmllkP7skQoWBNRCHcO5pJNuh2a3nDfCd7GQWsJ73NbFWCVBzp17TWxT"), colors: [
            [__rmT("BQJCXOtALU8"), 'blue'], [__rmT("7bIxHJ4m"), 'blue'], [__rmT("7bIxHzmE"), 'cyan'], [__rmT("iXMVwZmE"), 'cyan'], [__rmT("DNAhVSwwLU8"), 'blue'], [__rmT("5YMHkagcoJf"), 'green'],
            [__rmT("iX64iwf1"), 'pink'], [__rmT("1X8l7UBr"), 'purple']
        ] },
    { id: 'watercolor', name: __rmT("bNoqqTtmegA"), desc: __rmT("ecf7QWYtM0N8dq2AY7AYf68h7ihjvr0WYSFD6gaJP.itA.fTdsDHUXapiUsH0nT7XUXcbjt3A8ZD5uB7rBKtGHiHkdrz0JmyDMjmKtrTecrLvh"), colors: [
            [__rmT("viX20mf1"), 'pink'], [__rmT("4Jucsv2.APT"), 'red'], [__rmT("EoZkYSh3"), 'orange'], [__rmT("iX8RPSh3"), 'green'], [__rmT("rcvEkdgcY9s"), 'cyan'], [__rmT("9JB4IrgcY9s"), 'blue'],
            [__rmT("1X6uPZh3"), 'purple']
        ] },
    { id: 'pearl', name: __rmT("OghXsAEYZPp"), desc: __rmT("GDJ3fu9Vpf0ZIvCNQBKgxTfR9X_5.yCHWXrhQvjGjYIETze8xVP2gIdw8qLXFzspHkDRa0NaybUH0q3mofH_GxU5YvLBNdsEHHXCiWIUF8_owjzrFtkjP8Tb9Bp"), colors: [
            [__rmT("lmkZGmf1"), 'pink'], [__rmT("8T8IStf1"), 'pink'], [__rmT("8T8miM4m"), 'blue'], [__rmT("1wz6heBr"), 'purple'], [__rmT("KiZ6hZmE"), 'cyan'], [__rmT("1wz6hnD_"), 'orange'],
            [__rmT("lmkZGTAg"), 'neutral']
        ] },
    { id: 'spring', name: __rmT("2JA6Fo_2Keh"), desc: __rmT("WZGczaVW41K38rGjD.Mgu9bQCuaq9h"), colors: [
            [__rmT("5XU4Ywf1"), 'pink'], [__rmT("t9BXMItAQNf"), 'red'], [__rmT("mscPZeBr"), 'purple'], [__rmT("VKUtYGDV"), 'green'], [__rmT("niBI.vmE"), 'cyan'], [__rmT("z2Zgjk"), 'orange'],
            [__rmT("OAn6FOtAfAf"), 'yellow'], [__rmT(".HCrqAb6LU8"), 'blue']
        ] },
    { id: 'frost', name: __rmT("XuGAV9htfDE"), desc: __rmT("YQ3.YVtsIrA4X1xVNIj8o7IO3gTgwZTFFUXSRgbkLJxG1T"), colors: [
            [__rmT("mDhuwT"), 'blue'], [__rmT("8OZtH94m"), 'blue'], [__rmT("kIYchZmE"), 'cyan'], [__rmT("iX8p7kAg"), 'neutral'], [__rmT("mD0w7h"), 'purple'], [__rmT("dFI2MItA49B"), 'pink'],
            [__rmT("n.QaefP8"), 'green']
        ] },
]);
const SOFT_TONE_RECENT_KEY = 'rabbitMirrorSoftToneExamplesRecent';
const SOFT_TONE_STYLE_RECENT_KEY = 'rabbitMirrorSoftToneStyleRecent';
const SOFT_TONE_EXAMPLE_COUNT = 4;
function softRandomIndex(limit) {
    try {
        const buffer = new Uint32Array(1);
        globalThis.crypto.getRandomValues(buffer);
        return buffer[0] % limit;
    }
    catch {
        return Math.floor(Math.random() * limit);
    }
}
function softShuffled(list) {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const other = softRandomIndex(index + 1);
        [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
}
function readRecentList(key) {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(key) || '[]');
        return Array.isArray(value) ? value : [];
    }
    catch {
        return [];
    }
}
const SOFT_TONE_FAMILY_RECENT_KEY = 'rabbitMirrorSoftToneFamilyRecent';
const SOFT_TONE_FAMILY_MEMORY = 5;
const COOL_FAMILIES = new Set(['green', 'cyan', 'blue', 'purple']);
const WARM_FAMILIES = new Set(['red', 'orange', 'yellow', 'pink']);
export const SOFT_FAMILY_LABELS = Object.freeze({ red: __rmT("mr8"), orange: __rmT("IqG"), yellow: __rmT("dG8"), green: __rmT("GL8"), cyan: __rmT("4D_"), blue: __rmT("hFf"), purple: __rmT("3LA"), pink: __rmT("caT") });
function assignSoftFamilies(style, count, avoidFamilies) {
    const available = [...new Set(style.colors.map(([, family]) => family))].filter(family => SOFT_FAMILY_LABELS[family]);
    const history = readRecentList(SOFT_TONE_FAMILY_RECENT_KEY);
    const assigned = [];
    for (let index = 0; index < count; index += 1) {
        const recent = [...history, ...assigned];
        const lastTwo = recent.slice(-2);
        const needWarm = lastTwo.length === 2 && lastTwo.every(family => COOL_FAMILIES.has(family));
        const tiers = [
            family => !assigned.includes(family) && !avoidFamilies.includes(family) && !recent.slice(-SOFT_TONE_FAMILY_MEMORY).includes(family) && (!needWarm || WARM_FAMILIES.has(family)),
            family => !assigned.includes(family) && !avoidFamilies.includes(family) && (!needWarm || WARM_FAMILIES.has(family)),
            family => !assigned.includes(family) && !recent.slice(-2).includes(family),
            family => !assigned.includes(family),
            () => true,
        ];
        let pool = [];
        for (const test of tiers) {
            pool = available.filter(test);
            if (pool.length)
                break;
        }
        if (!pool.length)
            break;
        assigned.push(softShuffled(pool)[0]);
    }
    try {
        globalThis.localStorage?.setItem(SOFT_TONE_FAMILY_RECENT_KEY, JSON.stringify([...history, ...assigned].slice(-12)));
    }
    catch { }
    return assigned;
}
export function drawSoftToneExamples({ avoidFamilies = [], faceCount = 1 } = {}) {
    const recentStyles = readRecentList(SOFT_TONE_STYLE_RECENT_KEY);
    const freshStyles = SOFT_TONE_STYLES.filter(style => !recentStyles.includes(style.id));
    const style = softShuffled(freshStyles.length ? freshStyles : SOFT_TONE_STYLES)[0];
    const recent = readRecentList(SOFT_TONE_RECENT_KEY);
    const byFamily = new Map();
    for (const [name, family] of softShuffled(style.colors)) {
        const current = byFamily.get(family);
        if (!current || (recent.includes(current) && !recent.includes(name)))
            byFamily.set(family, name);
    }
    const mainFamilies = assignSoftFamilies(style, Math.max(1, Math.min(5, Number(faceCount) || 1)), avoidFamilies);
    const mains = mainFamilies.map(family => ({ family, color: softShuffled(style.colors.filter(([, item]) => item === family))[0]?.[0] || '' }));
    const families = softShuffled([...byFamily.keys()]);
    const ordered = [...families.filter(key => !avoidFamilies.includes(key)), ...families.filter(key => avoidFamilies.includes(key))];
    const picks = ordered.slice(0, SOFT_TONE_EXAMPLE_COUNT).map(key => byFamily.get(key));
    try {
        globalThis.localStorage?.setItem(SOFT_TONE_RECENT_KEY, JSON.stringify([...recent.filter(color => !picks.includes(color)), ...picks].slice(-24)));
        globalThis.localStorage?.setItem(SOFT_TONE_STYLE_RECENT_KEY, JSON.stringify([...recentStyles.filter(id => id !== style.id), style.id].slice(-2)));
    }
    catch { }
    return { style: style.name, desc: style.desc, examples: picks, mains };
}
export function softLightVisualGenerationRule(settings, { avoidFamilies = [], faceCount = 1, faceNumbers = [] } = {}) {
    if (settings?.visualToneMode !== 'soft' || settings?.darkVisualMode === true)
        return '';
    const { style, desc, examples, mains = [] } = drawSoftToneExamples({ avoidFamilies, faceCount });
    const yellowNote = mains.some(item => item.family === 'yellow') ? __rmT("p9q.evYcVbVy7HAsrwJBB0zAaQqf62EAsyeWaqDGJdHTej9OfCy3ipWohk_MvtGwnAlmkHBg3Okobh") : '';
    const numbered = Array.isArray(faceNumbers) && faceNumbers.length === mains.length;
    const faceLabel = index => `${__rmT("BJgCyT")}${numbered ? faceNumbers[index] : index + 1}${__rmT("2RddPk")}`;
    const mainLine = !mains.length ? ''
        : mains.length === 1 && !numbered
            ? `${__rmT("Q9OaYlY7uIDtBC9tnSsouHlpY62ocT")}${SOFT_FAMILY_LABELS[mains[0].family]}${__rmT("tUEgjh")}${mains[0].color ? `${__rmT("7zurBh")}${mains[0].color}${__rmT("eXs")}` : ''}${__rmT("JjxhDFZW74trXEVQG8VJJBjugT8e0pxbTTcLBubBxwVNG2xon3RtuH5HoiT5KpbMgWMAMJDLw_aRtYMOqz7BDPWpGFxfR6wRD8jycZmkQY4gQglurZDwb1.aZZSbxBM91yPGJywk1PvhI9pWfbZnmR3JtdG7TPOcDmBx_T")}${yellowNote}${__rmT("ewa0a6nwtJahSCmcRBkPX.sUakrDebJvzYnR_QEenh9IkEKVP3oQtzik1T_V4a5FfyxY3h")}` : `\n  - ${mains.length === 1 ? __rmT("x_akYPDo") : __rmT("EvpPpSxJnYrqHT")}${__rmT("7ys")}${mains.map((item, index) => `${faceLabel(index)}${SOFT_FAMILY_LABELS[item.family]}${__rmT("tUEgjh")}${item.color ? `${__rmT("7zurBh")}${item.color}${__rmT("eXs")}` : ''}`).join(__rmT("Yis"))}${__rmT("WiLnLT6pLZf3nIURN0pyQnVd")}${mains.length === 1 ? __rmT("Ue2p3f") : __rmT("ZDAiih")}${__rmT("t1FSjV3FYLU7qXGNg0BpK9uIZ04aZfgFop4qld0lxIgUvEE5kuq.l1ZcXRNUcRCJM3V7bLY4XaZLfz5E44cMec2U1ytjqM.4KrnZU4HNGlkxPPgZpy98uUGVJwuy4Vk3rLY2uVAc")}${yellowNote}${__rmT("ewa0a6nwtJahSCmcRBkPX.sUakrDebJvzYnR_QEenh9IkEKVP3oQtzik1T_V4a5FfyxY3h")}`;
    return `${__rmT("0dTU4nALAneaHzOHr_2nP0y2eTpdWnpoDHHC4CC_8hWA.ed4LbTBpJwOhRbjmekrU7VwBx5vIqvM6O2XkVHwbly_O8l")}${style}——${desc}${__rmT("mgRFWmsS")}${examples.join(__rmT("jvk"))}${__rmT("HRunDr2xbDoQpOqlCnGeVsnjx3kFo_zQ3hxZ9Pp7aMZGf1rzVqzonwg0zBG")}${mainLine}${__rmT("enUsVsFjnzj7OYTSEiivT3_cWu1PNqh2aegAapfaL.DFSedoNi5UoK90dPn1vyqixLzTmxad0GyehyTU2OmaugB.1Vi9JDiAqsF5u9NAWeWx5W1pGW0Ppu5QQtz0s8Tn_ENiGUrlcW.E7NJyKeUahv.JxGTcTnTZmBdBnlfRzRtfIVnd10q0SvLL6SRASpaT4dVLUIjTIjJsWQ9BKOHk_jRRGeEqPYOvkuYYQD7oXtKT_W.KBW1wZxI62yWOP9w_B7qFhaLQ02WzjYeex2zBwoE.mf.l5eCV7nc_ooBVgOynaj.yjC18LRyirhF5o9h1OWQJ8NwrUWBDLC8OYjgefUv0qWITx9csnfyoZ9DGPffNGYFyDEnjPaffyzFPUD0foPjHcQjIBZupguo07E8OEg8tl2Ir58LcDSwHn04NVbiVDvTlJBuwDkrtP5c31XlClse9fKFw48Faatncs8TE4XRNCMR7kGeNBbh35O43McnrFGUwICwWLs_5pK1Z9eolJrLOIS38RTgJTyn8CKOCA7cIjAB1u2UA8fXFrvnVJirWWZ.5XRyIgpst.YX9yz8mUDQiJYTgbW.JGNeU6UW6wmN8t9pPa8ZGkMEb80Ve_.oaTgr1n6EmdmgUXnyV36wyLxjGOqKf6Q5iqrTKBBuYo.3M6x8dx3UthWMx2s.cq3ObujP9DKW_4WzQT_8.96URssrNBmrd4QjTxLxyvZLjJBpnGYE33FPbChl7ZI401msAvuNknznD6m1ejaG2ErGNc2UeqR.w5ImPmaIqwaz4UNwIGtfRdSH5dhvYY66DdyRTXKGolJVb0.mRYcwccBiZb51WaRgQtmMg6xqlYYHZf82_0LM0GCVlneGdOLxSm3Od66Q0Ei.AaTQ0az6MXpcD2OGksmQfNyDRFzsbnY4BLo8T")}`;
}
export function visualDiversityExecutionLock(_settings, { textRevealRotation = false, flipRotation = false, slideRotation = false, tabRotation = false, noButtonRow = false, paleBan = false, softTone = false, paletteReminder = '', paletteLock = '', previousVersion = '' } = {}) {
    return [
        noButtonRow ? __rmT("jvJEHRu6kdsyxxMwqEAcrwDXOhPM81gKQtmMIxjX71Jmhhk2GUGxHSXIvPaQrQ6lmUjyb8gXj5.8DKDhwRX0Yhex9b92qX6T6O7sJ4sQjNn.VuxUhPYEDBUt") : '',
        flipRotation ? __rmT("vYt4NMrmdTtVK.50mOKyLb0gdiZzd4PJY_ZoR9xow.T2h7SMyplD.bTYsbgyo68mJ5rqJhU9zwstcxY3NyJpdXK4Z4BNI.MurlXXTkUEX.akoxfrzwVv0U_wcDBK4L9fwQC0NGJhILcCNLmNK5SeHucjDPa8H_TwEunR5iXIYHDDhxdk33s46Mim1o5hSJVBn9l67xgttYB01D6ztrk1t.F1e.ht01_DMzu.ZCQxLqoHMX7rrxeY92mZngg127yYwMFq8viwSGuNtSgedsNpBRAcWsCIYzb0y8_GJyTOAk4s6E5_RpYwqx6A2g0iWT") : '',
        tabRotation ? __rmT("vk.nJ7xkX25UCOu.57XrdxHabYq4gV1M3x86sOO0ZIVXZ2ST4U3Da1gIvqjOrgqBRFHLXip6DYAmbRXO0hTVQGa0RRrDMLCmWbwQ7RAGYmxdy7ASArwd1dm8qrig2jHtMWA.spf8f67Rk7yQj633MdmfUPqs26qoGmEjXu5JG5PsK0mOlsHTYW_pAf.G44pfa16ONHFD") : '',
        slideRotation ? __rmT("vk.nJ7xkuFtm.FHLa7X_0J35HYkPqA4JTxXo6h6D8ZoUOBEIPjrC6fGj80kaQD8WtsC08YMNL.Lbna.YJxkOPtXS..Ijmgb8S9WOYYT963M9VQU4HJVshhvj1Vo_bK4xINMKMrRLn2XsQtKGaUf1mjCSGLn.uRuzrjuAXEjnL6yDXvjQUXiyu6BCQvQ8rXCHCQYY3FFD") : '',
        textRevealRotation ? __rmT("7Jb84GVW_yGsIoAZHhjNEE20OO4S8q_VS2mWcFMhtihLjadCC4ik_i4IJe2q4upi0rkvYwxErZifUIciE8Yylh12Oo2RWf5s.1N7gPIB79s") : '',
        softTone ? __rmT("zicqX1cfbTyzJ3LqjaIJJFv57NihA5Ya1AV9CiUVZF.ZLxdMBRhzSCzTvd8ZU9Uubfo2rpK3hNGaJbDT0BMvaALJ8hHw0dTTpN1ClrLAYt5FbAv9kunbDKUombe0k6J_e.iOvT") : '',
        paleBan && softTone ? __rmT("P_c0USIbzO6clILbSc1.BIbL4VuZKym09Nh0FrxImok.MNpg8wktUvDAPFoaittSrXZa0oSgo7BSUE3onCY4DfjA1xXXi5KfxTCjI194Y8tTmZ8nGcC0if") : '',
        paleBan && !softTone ? __rmT("8NTexVCRin6QJomnBvlT7m8rzm2hXnBIcqaZjzmoZuinzre_x9gTMLWKtJSqGR7hgZomZ2_a1jQZlqkiPJU6QzfR0dSfvcMWQLdQjPcwGxjhW54_6iWynY4nrgEs0gfR8qRQ7FuI0SJ90DzOFTQtpeFL") : '',
        paletteReminder,
        paletteLock ? `${__rmT("Xif6ImH5tUuStf")}${paletteLock}${__rmT("jzk")}` : '',
        previousVersion,
    ].filter(Boolean).join('\n');
}
