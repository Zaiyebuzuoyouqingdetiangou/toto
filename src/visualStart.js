// 视觉起点：每个 HTML 面由程序从光线、材质、色调三个独立维度各抽一项，
// 只给方向词、不给色值，让模型从光和材质出发建立层次，而不是平铺浅色卡片。
// 抽取在出题计划冻结时完成，重说、逐面子请求沿用同一份；近期用过的词尽量避开。
const LIGHTS = Object.freeze(['侧逆光', '低角度斜阳', '顶光', '窗格投光', '烛火或灯盏的暖点光', '阴天散射光', '水面反光', '背光剪影']);
const MATERIALS = Object.freeze(['旧木与铜', '湿石与苔', '厚纸与布纹', '玻璃与水', '陶瓷与釉', '皮革与缝线', '金属与铆钉', '丝绸与刺绣', '砖瓦与灰泥', '藤编与竹']);
const TONES = Object.freeze([
    '中明度灰蓝底，赭红只给物件', '雾绿底，旧金点在高光', '灰紫底，杏橙给受光面', '石青底，朱砂给关键物件',
    '暖灰褐底，青绿给细节', '烟粉底，墨蓝给轮廓与阴影', '橄榄灰底，砖红给主体', '钢蓝灰底，琥珀给光源',
    '陶土橙底，深青给暗部', '苔绿底，铜黄给金属与光',
]);
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

function pickFrom(list, used) {
    const fresh = list.filter(item => !used.includes(item));
    const pool = fresh.length ? fresh : list;
    return pool[randomIndex(pool.length)];
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
        tone: pickFrom(dark ? DARK_TONES : TONES, used(toneKey)),
    };
    const remember = (key, value) => [value, ...used(key).filter(item => item !== value)].slice(0, RECENT_LIMIT);
    writeRecent({ ...recent, light: remember('light', start.light), material: remember('material', start.material), [toneKey]: remember(toneKey, start.tone) });
    return Object.freeze(start);
}

export function visualStartRule(faceContexts) {
    const lines = (faceContexts || []).flatMap((face, index) => {
        if (face.textPresentation || face.combo?.pureOrder) return [];
        const start = normalizeVisualStart(face.visualStart);
        return start ? [`第 ${index + 1} 面：光线「${start.light}」｜材质「${start.material}」｜色调「${start.tone}」`] : [];
    });
    if (!lines.length) return '';
    return `视觉起点【程序抽取，只是出发点】：\n${lines.join('\n')}\n由光线建立明暗与投影，由材质建立纹理与边缘；背景不用近白，高饱和只给物件、光与强调。与展现形式不符的部分按形式调整，用户明确配色与形式固有材质优先。`;
}
