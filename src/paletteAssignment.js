// 配色避重：以前只在提示词里说「近期配色强避重」「各面色系形成真实差异」，模型不听就重了（同一批三面两面绿）。
// 现在发请求前直接给每一面点名一个色族（主背景和主承载面以它为主）：避开近三轮用过的色族，同一批各面互不相同。
// 只点名色族，深浅、材质、具体颜色仍由模型按内容配；用户在视觉偏好里写了颜色时不点名，照用户的。
// 黑白灰不算色族（白纸、黑底是很多媒介的固有材质），物件固有色（血、雪、金属）不受限。
const HUE_FAMILIES = Object.freeze(['orange', 'green', 'blue', 'purple', 'pink', 'red', 'cyan', 'yellow']);
export const HUE_FAMILY_NAMES = Object.freeze({
    red: '红色族', orange: '橙色族（含米黄、茶褐）', yellow: '黄色族', green: '绿色族', cyan: '青色族',
    blue: '蓝色族', purple: '紫色族', pink: '粉色族',
});
// 「角色」「景色」「特色」不算；颜色词、配色、冷暖、饱和、明度算。
const COLOR_PREFERENCE = /颜色|配色|色调|色系|色彩|色相|冷色|暖色|饱和|明度|[红橙黄绿青蓝紫粉黑白灰金银棕米]色|\b(?:hue|colou?rs?|palette)\b/iu;

/**
 * 用户自己写的视觉偏好里提了颜色：由用户定，不点名。
 * 只看用户自己写的那部分（出厂默认的视觉提示里本来就有「配色」字样，不算），加上附加偏好。
 */
export function userDirectsColor(settings, { defaultPrompt = '', clean = value => String(value || '') } = {}) {
    const extra = String(settings?.visualExtraPrompt || '');
    if (COLOR_PREFERENCE.test(extra)) return true;
    if (settings?.visualPromptEditingEnabled !== true) return false;
    const own = clean(settings.visualPrompt ?? defaultPrompt), factory = clean(defaultPrompt);
    if (own === factory) return false;
    const factoryLines = new Set(factory.split('\n').map(line => line.trim()).filter(Boolean));
    const added = own.split('\n').map(line => line.trim()).filter(line => line && !factoryLines.has(line)).join('\n');
    return COLOR_PREFERENCE.test(added);
}

/**
 * 给每一面点名色族。
 * @param {Array<{html:boolean}>} faces 每面是不是 HTML 面（文本面、纯顺序面不点名）
 * @param {string[]} recentFamilies 近三轮主色所属色族（recentPaletteHueFamilies 的结果）
 * @param {() => number} [randomUnit]
 * @returns {string[]} 每面的色族键，不点名的是 ''
 */
export function assignFaceHueFamilies(faces, recentFamilies = [], randomUnit = Math.random) {
    const list = Array.isArray(faces) ? faces : [];
    const recent = new Set((Array.isArray(recentFamilies) ? recentFamilies : []).filter(key => HUE_FAMILIES.includes(key)));
    const htmlCount = list.filter(face => face?.html).length;
    if (!htmlCount) return list.map(() => '');
    // 先用近三轮没用过的；不够分时才从用过的里补（recentFamilies 按时间从旧到新，先补最旧的）。
    let pool = HUE_FAMILIES.filter(key => !recent.has(key));
    if (pool.length < htmlCount) pool = [...pool, ...recent];
    const picked = [];
    const out = list.map(face => {
        if (!face?.html) return '';
        const candidates = pool.filter(key => !picked.includes(key));
        if (!candidates.length) return '';
        const raw = Number(randomUnit());
        const roll = Number.isFinite(raw) ? Math.max(0, Math.min(.999999999, raw)) : 0;
        const key = candidates[Math.floor(roll * candidates.length)];
        picked.push(key);
        return key;
    });
    return out;
}

/** 写进提示词的一句。 */
export function hueFamilyInstruction(key) {
    const name = HUE_FAMILY_NAMES[key];
    return name ? `主色族：${name}——主背景与主要承载面以此色族为主，深浅、饱和与材质按内容定；物件固有色（血、雪、金属、肤色）与媒介固有材质不受限。` : '';
}
