import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.1.7";
const HUE_FAMILIES = Object.freeze(['orange', 'green', 'blue', 'purple', 'pink', 'red', 'cyan', 'yellow']);
export const HUE_FAMILY_NAMES = Object.freeze({
    red: __rmT("jtakYPDo"), orange: __rmT("3_DCASHAfoApROLYMzBCrR_V0VPRcT"), yellow: __rmT("yOakYPDo"), green: __rmT("kbakYPDo"), cyan: __rmT("PIZkYPDo"),
    blue: __rmT("DTokYPDo"), purple: __rmT("cbMkYPDo"), pink: __rmT("3mXkYPDo"),
});
const COLOR_PREFERENCE = __rmR("prRxqiUG1FabV9s8qCdPTRrMtadfMAFAMmv1JpfErYm4Wj2r4pFMsh8BFi5L2aNTXmNYVNw.AeWoTOo.cnfFIb5HZfmvfWtcYC2x8qeBCdW3A_04v.QZumC0PWf4S9AmpPiSnYsvhhhSevCWUSLyT8j2zfKXUvm7irbw9zMxjqwWgp4y4vI5GIAC_5q_XAfxIZ4cVzIvK1SlCtDu", "iu");
export function userDirectsColor(settings, { defaultPrompt = '', clean = value => String(value || '') } = {}) {
    const extra = String(settings?.visualExtraPrompt || '');
    if (COLOR_PREFERENCE.test(extra))
        return true;
    if (settings?.visualPromptEditingEnabled !== true)
        return false;
    const own = clean(settings.visualPrompt ?? defaultPrompt), factory = clean(defaultPrompt);
    if (own === factory)
        return false;
    const factoryLines = new Set(factory.split('\n').map(line => line.trim()).filter(Boolean));
    const added = own.split('\n').map(line => line.trim()).filter(line => line && !factoryLines.has(line)).join('\n');
    return COLOR_PREFERENCE.test(added);
}
export function assignFaceHueFamilies(faces, recentFamilies = [], randomUnit = Math.random) {
    const list = Array.isArray(faces) ? faces : [];
    const recent = new Set((Array.isArray(recentFamilies) ? recentFamilies : []).filter(key => HUE_FAMILIES.includes(key)));
    const htmlCount = list.filter(face => face?.html).length;
    if (!htmlCount)
        return list.map(() => '');
    let pool = HUE_FAMILIES.filter(key => !recent.has(key));
    if (pool.length < htmlCount)
        pool = [...pool, ...recent];
    const picked = [];
    const out = list.map(face => {
        if (!face?.html)
            return '';
        const candidates = pool.filter(key => !picked.includes(key));
        if (!candidates.length)
            return '';
        const raw = Number(randomUnit());
        const roll = Number.isFinite(raw) ? Math.max(0, Math.min(.999999999, raw)) : 0;
        const key = candidates[Math.floor(roll * candidates.length)];
        picked.push(key);
        return key;
    });
    return out;
}
export function hueFamilyInstruction(key) {
    const name = HUE_FAMILY_NAMES[key];
    return name ? `${__rmT("_GLEkHWsWZY")}${name}${__rmT("Z48mar7ZKd3EQ1Is7nTUhtarxt.ZRnVsrRolDeJNYRTa97VDeYInxW1_94L.Jv4SNgY5_uYPxc8oWvPqLEAni65DpyCS5BPASCE00nRPV8e_UIS6lz42s1kLFWuL4Jjwn0bL21JZruxUoQqdxBTCQx1qZxY")}` : '';
}
