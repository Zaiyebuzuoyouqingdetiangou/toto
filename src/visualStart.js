// 视觉起点：每个 HTML 面由程序从光线、材质、色调三个独立维度各抽一项，
// 只给方向词、不给色值，让模型从光和材质出发建立层次，而不是平铺浅色卡片。
// 抽取在出题计划冻结时完成，重说、逐面子请求沿用同一份；近期用过的词尽量避开。
const LIGHTS = Object.freeze(['侧逆光', '低角度斜阳', '顶光', '窗格投光', '烛火或灯盏的暖点光', '阴天散射光', '水面反光', '背光剪影']);
const MATERIALS = Object.freeze(['旧木与铜', '湿石与苔', '厚纸与布纹', '玻璃与水', '陶瓷与釉', '皮革与缝线', '金属与铆钉', '丝绸与刺绣', '砖瓦与灰泥', '藤编与竹']);
// 普通模式色调：浅色带明确色相、中明度、低频近白三档；明度写进词里，避免被压成近黑或退回米白。
const TONE_TABLE = Object.freeze([
    ['light', 'blue', '浅天蓝底（明亮但看得出蓝），深海军蓝给轮廓与文字'],
    ['light', 'green', '薄荷浅底，墨绿给主体与阴影'],
    ['light', 'orange', '浅杏粉底，砖红给主体'],
    ['light', 'purple', '淡藤紫底，深紫给轮廓，杏黄点光'],
    ['light', 'yellow', '浅柠黄底，靛蓝给轮廓与细节'],
    ['light', 'cyan', '浅水青底，珊瑚给主体'],
    ['light', 'sage', '浅鼠尾草绿底，铜棕给物件'],
    ['light', 'pink', '淡珊瑚粉底，青灰给阴影'],
    ['mid', 'blue', '中明度灰蓝底，赭红只给物件'],
    ['mid', 'green', '中明度雾绿底，旧金点在高光'],
    ['mid', 'purple', '中明度灰紫底，杏橙给受光面'],
    ['mid', 'cyan', '中明度石青底，朱砂给关键物件'],
    ['mid', 'brown', '中明度暖灰褐底，青绿给细节'],
    ['mid', 'pink', '中明度烟粉底，墨蓝给轮廓与阴影'],
    ['mid', 'olive', '中明度橄榄灰底，砖红给主体'],
    ['mid', 'slate', '中明度钢蓝灰底（不压成近黑），琥珀给光源'],
    ['mid', 'orange', '中明度陶土橙底，深青给暗部'],
    ['mid', 'moss', '中明度苔绿底，铜黄给金属与光'],
    ['pale', 'neutral', '近白底，墨色给轮廓与阴影'],
]);
// 权重：浅色约 45%，中明度约 45%，近白约 10%。
const TIER_WEIGHT = Object.freeze({ light: 1, mid: 0.8, pale: 1.8 });
const TONES = Object.freeze(TONE_TABLE.map(item => item[2]));
const TONE_HUE = new Map(TONE_TABLE.map(item => [item[2], item[1]]));
const TONE_TIER = new Map(TONE_TABLE.map(item => [item[2], item[0]]));
const PALE_TONE = '近白底，墨色给轮廓与阴影';
const DARK_TONES = Object.freeze([
    '深靛底，暖铜给受光', '墨绿底，月白给高光', '深酒红底，旧金给细节', '夜蓝灰底，橘黄给灯',
    '深茶褐底，青瓷给物件', '暗紫底，玫瑰金给边缘', '深海青底，珊瑚给主体', '炭灰蓝底，琥珀给光源',
]);
const RECENT_KEY = 'rabbitMirrorVisualStartRecent';
const RECENT_LIMIT = 3;

function randomIndex(limit) {
    try {
        const buffer = new Uint32Array(1);
        globalThis.crypto.getRandomValues(buffer);
        return buffer[0] % limit;
    } catch {
        return Math.floor(Math.random() * limit);
    }
}

function readRecent() {
    try {
        const parsed = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeRecent(recent) {
    try { globalThis.localStorage?.setItem(RECENT_KEY, JSON.stringify(recent)); } catch { /* best effort */ }
}

// 普通模式：避开最近 3 次用过的色调与最近 2 次的色相，按明度档加权。
function pickLightTone(usedTones, usedHues) {
    const fresh = TONES.filter(item => !usedTones.includes(item) && !usedHues.includes(TONE_HUE.get(item)));
    return pickFrom(fresh.length ? fresh : TONES, [], item => TIER_WEIGHT[TONE_TIER.get(item)] || 1);
}

function pickFrom(list, used, weightOf = () => 1) {
    const fresh = list.filter(item => !used.includes(item));
    const pool = fresh.length ? fresh : list;
    const weights = pool.map(weightOf);
    const total = weights.reduce((a, b) => a + b, 0);
    let cursor = randomIndex(1e6) / 1e6 * total;
    return pool.find((_item, index) => (cursor -= weights[index]) < 0) || pool[pool.length - 1];
}

export function normalizeVisualStart(value) {
    if (!value || typeof value !== 'object') return null;
    const { light, material, tone } = value;
    const ok = [light, material, tone].every(item => typeof item === 'string' && item.length > 0 && item.length <= 40);
    return ok ? Object.freeze({ light, material, tone }) : null;
}

export function drawVisualStart({ dark = false } = {}) {
    const recent = readRecent();
    const used = key => (Array.isArray(recent[key]) ? recent[key] : []);
    const toneKey = dark ? 'darkTone' : 'tone';
    const start = {
        light: pickFrom(LIGHTS, used('light')),
        material: pickFrom(MATERIALS, used('material')),
        tone: dark ? pickFrom(DARK_TONES, used(toneKey)) : pickLightTone(used(toneKey), used('hue')),
    };
    const remember = (key, value) => [value, ...used(key).filter(item => item !== value)].slice(0, RECENT_LIMIT);
    const hue = TONE_HUE.get(start.tone);
    writeRecent({ ...recent, light: remember('light', start.light), material: remember('material', start.material), [toneKey]: remember(toneKey, start.tone),
        ...(hue ? { hue: [hue, ...used('hue').filter(item => item !== hue)].slice(0, 2) } : {}) });
    return Object.freeze(start);
}

export function visualStartRule(faceContexts) {
    const lines = (faceContexts || []).flatMap((face, index) => {
        if (face.textPresentation || face.combo?.pureOrder) return [];
        const start = normalizeVisualStart(face.visualStart);
        const paleNote = start?.tone === PALE_TONE ? '（若近期记录已提示连续近白浅底，以该提示为准，改用中等明度底色）' : '';
        return start ? [`第 ${index + 1} 面：光线「${start.light}」｜材质「${start.material}」｜色调「${start.tone}」${paleNote}`] : [];
    });
    if (!lines.length) return '';
    return `视觉起点【程序抽取，只是出发点】：\n${lines.join('\n')}\n由光线建立明暗与投影，由材质建立纹理与边缘；色调里写的明度要照做：浅底就是明亮的浅色，中明度不压成近黑，除非写明近白，背景不用近白；高饱和只给物件、光与强调。与展现形式不符的部分按形式调整，用户明确配色与形式固有材质优先。`;
}
