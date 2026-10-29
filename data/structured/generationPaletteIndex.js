import { rmT as __rmT } from "../../src/textTable.js?rmv=1.99.20";
const family = (id, title, mood, fit, neutral, companions) => Object.freeze({
    id, title, mood, fit: Object.freeze(fit.split('|').filter(Boolean)), neutral,
    companions: Object.freeze(companions.split('|')),
});
export const COLOR_FAMILIES = Object.freeze([
    family('gray', __rmT("AsqeEkAg"), __rmT("EOEF8xBAuPBV.k"), __rmT("12gbGIaSKfqHB7Gw8ZGfEdOi"), 'gray', 'blue|gold|ruby'),
    family('mauve', __rmT("cb8l7hAg"), __rmT("BxDfpOBArNZbfh"), __rmT("TfYi14c40dWSrOD6I.Y"), 'mauve', 'plum|crimson|gold'),
    family('slate', __rmT("DT_IHTAg"), __rmT("kzffpOBAh2XXdf"), __rmT("HPgwExaSt5FNk9O8VokfEiHr"), 'slate', 'blue|amber|teal'),
    family('sage', __rmT("1CMAZT"), __rmT("EOiGMIBAcYQyET"), __rmT("282OGIzS09gx_tUNXwkilf"), 'sage', 'jade|bronze|pink'),
    family('olive', __rmT("iiUaifAg"), __rmT("tSFMmxBA3CIfHf"), __rmT("C2Ta97aSlOeNk.F7N6FNcKNA"), 'olive', 'grass|brown|plum'),
    family('sand', __rmT("n9rAZT"), __rmT("WOwb8xBAO6cWGT"), __rmT("Qi5NaYUgCuwGSlEwUVYG9NzXzlT"), 'sand', 'orange|teal|ruby'),
    family('tomato', __rmT("yCKd7f"), __rmT("WOwb8xBAGcK4PT"), __rmT("I2IuPxaSvS3NkOzFN6F5xvQ_"), 'mauve', 'sage|teal|gold'),
    family('red', __rmT("b2Fd7f"), __rmT("LhLIK7BAiFacYT"), __rmT("Cb4Na2Kg1shLzUuhK.3IU9zXqop"), 'mauve', 'jade|gold|slate'),
    family('ruby', __rmT("BKhIHKsV"), __rmT("FISDV7BAsPzq7T"), __rmT("EbyUQFC7bqbhFxPGl0PeoFarzC9AEf"), 'mauve', 'gold|sage|blue'),
    family('crimson', __rmT("pbcuGKsV"), __rmT("InitqOBAX2A4fT"), __rmT("buG0aKkh9j44uKNCN6MHAwRt"), 'mauve', 'sage|gold|teal'),
    family('pink', __rmT("nTp7Htf1"), __rmT("5t9IsxBAV9aEHf"), __rmT("i2l0aKkh9j4o3yHXN66VTLKO"), 'mauve', 'mint|gold|violet'),
    family('plum', __rmT("v21w7h"), __rmT("FISDV7BAMMnAUh"), __rmT("Xq2AA00Mg9Wx_RogXwIh5T"), 'mauve', 'gold|jade|pink'),
    family('purple', __rmT("cbMUPTA9"), __rmT("Mfv7mIBAeNFnPf"), __rmT("bP2AAEPJI32uMaLcXw4uTf"), 'mauve', 'amber|teal|crimson'),
    family('violet', __rmT("qIql0VBr"), __rmT("EO.rV7BAdNE4Wk"), __rmT("NG0AA9WzCM0x_kV2XwIh5T"), 'mauve', 'mint|gold|pink'),
    family('iris', __rmT("DTbfnClW"), __rmT("5t9SaOBAZPtfCk"), __rmT("Hg.fi7aSQi3anIGwzRhfEPIz"), 'slate', 'amber|mint|crimson'),
    family('indigo', __rmT("VA8uwT"), __rmT("7OSezOBA.9sOef"), __rmT("hEwNafVtBu2GSklFixPRxLTci_k"), 'slate', 'gold|bronze|pink'),
    family('blue', __rmT("rP_uwT"), __rmT("EOikcIBAy23bGh"), __rmT("9gC0a8CA9j4lnIGwKwpfEEZc"), 'slate', 'amber|bronze|mint'),
    family('cyan', __rmT("ygXLPk"), __rmT("PoerV7BAy9qDHT"), __rmT("9gC0aA06PTHNkOVzN66jTuHV"), 'slate', 'orange|gold|pink'),
    family('teal', __rmT("1C85nT"), __rmT("tS8fpOBAy9qoPT"), __rmT("NMp0ax2t9jkZ2OGwbXhfEHIz"), 'sage', 'tomato|gold|plum'),
    family('jade', __rmT("xNG67f"), __rmT("WOwwMIBAnQqAUh"), __rmT("MF5AAG0xI3uMIl5uSFdwcf"), 'sage', 'red|bronze|crimson'),
    family('green', __rmT("iGG67f"), __rmT("jb7mKIBA0MuW.T"), __rmT("Cmwt96lBACPGS4YeUs4RxngLMth"), 'sage', 'brown|pink|amber'),
    family('grass', __rmT("IeG67f"), __rmT("YFdOkpKXzytPRqcU"), __rmT("Ja5AACWpI3BYV2N.XwkPsf"), 'olive', 'tomato|plum|gold'),
    family('brown', __rmT("L6p7YT"), __rmT("WOwb8xBAwHKTHf"), __rmT(".wjNaZOK1shEKUuh7StRxeP.0_T"), 'sand', 'blue|jade|amber'),
    family('bronze', __rmT("9DGBPT"), __rmT("Bxgb8xBAaJB7Ek"), __rmT("s4T9YRKaXjHnBUzR85cuJk208RyEbh"), 'sand', 'teal|blue|ruby'),
    family('gold', __rmT("dg8e9h"), __rmT("5vZlpxBAV9qAUh"), __rmT("LH7qTBU1G9H5Gr2pgq4JlJPsXI7n4Lav"), 'sand', 'indigo|jade|plum'),
    family('sky', __rmT("uBkuwT"), __rmT("5t9IsxBAtFxEek"), __rmT("Z62AAdt6I3uDV_5u8BrIcf"), 'slate', 'tomato|amber|pink'),
    family('mint', __rmT("vVv5ik"), __rmT("EO.AKxBAfN70Wf"), __rmT("C8T0am01AT7NkUQ4N689F8Fw"), 'sage', 'pink|brown|iris'),
    family('lime', __rmT("1C8Cjk"), __rmT("0IScM7BAy9qL0k"), __rmT("Hg.fi7aSbkR7YxGwl.hfEWoG"), 'olive', 'plum|cyan|tomato'),
    family('yellow', __rmT("Pg8kHf"), __rmT("i7ySaOBA7pTrHf"), __rmT("78WAAUsAI3Nc1PX6XwIqQf"), 'sand', 'blue|violet|jade'),
    family('amber', __rmT("NNApZk"), __rmT("WOwb8xBA3HQWGT"), __rmT("FKp9YDHOR7gPmrdyYg0nn7Yn8RR2wk"), 'sand', 'blue|teal|plum'),
    family('orange', __rmT("k6M3Yf"), __rmT("WOwb8xBAGcK4PT"), __rmT("I2IuPxaSCvLxjIGwql_fEGeL"), 'sand', 'teal|blue|violet'),
]);
export const PALETTE_GROUP_LABELS = Object.freeze({
    warm_neutral: __rmT("b6Z.gliTyRhhtwdYNNRFojBucWUsKA2AxIcPjAT66_3olZdx"),
    cool_neutral: __rmT("Y.9pkwdpx3wRcn46nmP81rdD2Adfq_Y8NeJsmtZ8"),
    dark_neutral: __rmT("q_e61EQxyFkWW7NBmZB9cA5a6JtRcT"),
    red: __rmT("jtakYGB1"), pink: __rmT("3mXkYGB1"), purple: __rmT("cbMkYGB1"), blue: __rmT("DTokYGB1"), cyan: __rmT("PIZkYGB1"),
    green: __rmT("kbakYGB1"), yellow: __rmT("yOakYGB1"), orange: __rmT("HXdkYGB1"), brown: __rmT("WJltpZf2bJB"),
});
const SCALE_GROUPS = Object.freeze({
    gray: 'neutral', mauve: 'neutral', slate: 'neutral', sage: 'green', olive: 'green', sand: 'brown',
    tomato: 'red', red: 'red', ruby: 'red', crimson: 'pink', pink: 'pink', plum: 'purple', purple: 'purple', violet: 'purple',
    iris: 'blue', indigo: 'blue', blue: 'blue', cyan: 'cyan', teal: 'cyan', jade: 'green', green: 'green', grass: 'green',
    brown: 'brown', bronze: 'brown', gold: 'brown', sky: 'blue', mint: 'green', lime: 'green', yellow: 'yellow', amber: 'orange', orange: 'orange',
});
export function paletteScaleGroup(id, brightness) {
    const group = SCALE_GROUPS[id];
    if (group === 'neutral')
        return brightness === 'dark' ? 'dark_neutral' : 'cool_neutral';
    if (group === 'brown' && brightness === 'light')
        return 'warm_neutral';
    return group || '';
}
export const GENERATION_PALETTE_INDEX = Object.freeze(COLOR_FAMILIES.flatMap(family => [...new Set([family.id, family.neutral, 'gray'])].flatMap(surface => family.companions.flatMap(companion => ['light', 'dark'].map(brightness => ({
    id: `radix-${family.id}-${surface}-${companion}-${brightness}`,
    family: family.id, surfaceFamily: surface, companionFamily: companion, brightness,
    colorGroup: paletteScaleGroup(family.id, brightness), surfaceGroup: brightness === 'light' && ['brown', 'bronze', 'gold', 'sand', 'amber', 'yellow', 'orange'].includes(surface) ? 'warm_neutral' : paletteScaleGroup(surface, brightness),
    title: `${family.title}${__rmT("x_akYWJp")}${COLOR_FAMILIES.find(x => x.id === surface).title}${__rmT("hortjqJp")}${COLOR_FAMILIES.find(x => x.id === companion).title}${__rmT("QCXGET")}`,
    mood: family.mood, fit: family.fit,
})))))
    .map((item, index) => Object.freeze({ ...item, code: `P.${String(index + 1).padStart(3, '0')}` })));
