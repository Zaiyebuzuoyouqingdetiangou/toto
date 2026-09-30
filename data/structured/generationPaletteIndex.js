// Colour families are components, not fixed five-colour skins. Only chosen
// combinations are resolved against the vendored light/dark scales.
const family = (id, title, mood, fit, neutral, companions) => Object.freeze({
    id, title, mood, fit: Object.freeze(fit.split('|').filter(Boolean)), neutral,
    companions: Object.freeze(companions.split('|')),
});

export const COLOR_FAMILIES = Object.freeze([
    family('gray', '中性灰', '清晰、留白', '极简|素描|银|影', 'gray', 'blue|gold|ruby'),
    family('mauve', '紫雾灰', '柔静、朦胧', '梦|雾|银|月', 'mauve', 'plum|crimson|gold'),
    family('slate', '蓝石灰', '冷静、精密', '机械|仪|城市|石', 'slate', 'blue|amber|teal'),
    family('sage', '青灰', '清淡、自然', '植物|瓷|草|雨', 'sage', 'jade|bronze|pink'),
    family('olive', '橄榄灰', '安稳、草木', '植物|旧|纸|收藏', 'olive', 'grass|brown|plum'),
    family('sand', '砂灰', '温暖、纸感', '纸|历史|信|沙|卷', 'sand', 'orange|teal|ruby'),
    family('tomato', '陶红', '温暖、鲜活', '料理|土|陶|生活', 'mauve', 'sage|teal|gold'),
    family('red', '朱红', '热烈、庄重', '戏|印|节|舞台|红', 'mauve', 'jade|gold|slate'),
    family('ruby', '宝石红', '浓郁、珍藏', '宝石|收藏|舞台|首饰', 'mauve', 'gold|sage|blue'),
    family('crimson', '绯玫红', '亲密、细腻', '信|花|日记|情绪', 'mauve', 'sage|gold|teal'),
    family('pink', '花瓣粉', '轻盈、温柔', '春|花|相册|玩偶', 'mauve', 'mint|gold|violet'),
    family('plum', '梅紫', '浓郁、柔和', '香|塔罗|剧|梦', 'mauve', 'gold|jade|pink'),
    family('purple', '紫罗兰', '神秘、浪漫', '夜|梦|魔法|星', 'mauve', 'amber|teal|crimson'),
    family('violet', '鸢尾紫', '清透、梦幻', '月|情绪|花|梦', 'mauve', 'mint|gold|pink'),
    family('iris', '蓝鸢尾', '轻快、灵动', '游戏|音乐|星|玩', 'slate', 'amber|mint|crimson'),
    family('indigo', '靛蓝', '深远、沉静', '夜|城市|天体|记忆', 'slate', 'gold|bronze|pink'),
    family('blue', '湖蓝', '清凉、理性', '水|雨|仪|信|蓝', 'slate', 'amber|bronze|mint'),
    family('cyan', '晴青', '通透、清新', '水|天空|海|玻璃', 'slate', 'orange|gold|pink'),
    family('teal', '青瓷', '安静、清润', '瓷|海|水|器|玉', 'sage', 'tomato|gold|plum'),
    family('jade', '玉绿', '温润、平和', '玉|古|瓷|植物', 'sage', 'red|bronze|crimson'),
    family('green', '叶绿', '自然、新生', '植物|花|生长|森林', 'sage', 'brown|pink|amber'),
    family('grass', '草绿', '松弛、生命力', '草|春|料理|园', 'olive', 'tomato|plum|gold'),
    family('brown', '栗棕', '温暖、岁月', '木|旧|纸|皮|历史', 'sand', 'blue|jade|amber'),
    family('bronze', '古铜', '柔暖、旧物', '铜|机械|收藏|旧|器', 'sand', 'teal|blue|ruby'),
    family('gold', '柔金', '典雅、温和', '金|仪式|历史|钟|首饰', 'sand', 'indigo|jade|plum'),
    family('sky', '天蓝', '轻盈、开阔', '天|夏|旅|照片', 'slate', 'tomato|amber|pink'),
    family('mint', '薄荷', '清爽、松弛', '夏|料理|水|商店', 'sage', 'pink|brown|iris'),
    family('lime', '青柠', '活泼、清亮', '游戏|玩具|春|饮', 'olive', 'plum|cyan|tomato'),
    family('yellow', '柠黄', '明快、轻松', '春|阳|游戏|花', 'sand', 'blue|violet|jade'),
    family('amber', '琥珀', '温暖、光感', '秋|灯|黄昏|时间|钟', 'sand', 'blue|teal|plum'),
    family('orange', '杏橙', '温暖、鲜活', '料理|商店|秋|果', 'sand', 'teal|blue|violet'),
]);

export const PALETTE_GROUP_LABELS = Object.freeze({
    warm_neutral: '暖浅中性色（米白／米黄／奶油／燕麦）',
    cool_neutral: '冷浅中性色（冷白／雾灰／银灰）',
    dark_neutral: '深中性色（灰黑／炭灰）',
    red: '红色系', pink: '粉色系', purple: '紫色系', blue: '蓝色系', cyan: '青色系',
    green: '绿色系', yellow: '黄色系', orange: '橙色系', brown: '棕金色系',
});
const SCALE_GROUPS = Object.freeze({
    gray:'neutral',mauve:'neutral',slate:'neutral',sage:'green',olive:'green',sand:'brown',
    tomato:'red',red:'red',ruby:'red',crimson:'pink',pink:'pink',plum:'purple',purple:'purple',violet:'purple',
    iris:'blue',indigo:'blue',blue:'blue',cyan:'cyan',teal:'cyan',jade:'green',green:'green',grass:'green',
    brown:'brown',bronze:'brown',gold:'brown',sky:'blue',mint:'green',lime:'green',yellow:'yellow',amber:'orange',orange:'orange',
});
export function paletteScaleGroup(id, brightness) {
    const group = SCALE_GROUPS[id];
    if (group === 'neutral') return brightness === 'dark' ? 'dark_neutral' : 'cool_neutral';
    if (group === 'brown' && brightness === 'light') return 'warm_neutral';
    return group || '';
}
// Lightweight recipe index: no RGB scales are read while drawing. Append new
// families/variants rather than reordering existing entries to keep display codes stable.
export const GENERATION_PALETTE_INDEX = Object.freeze(COLOR_FAMILIES.flatMap(family =>
    [...new Set([family.id, family.neutral, 'gray'])].flatMap(surface => family.companions.flatMap(companion =>
        ['light', 'dark'].map(brightness => ({
            id: `radix-${family.id}-${surface}-${companion}-${brightness}`,
            family: family.id, surfaceFamily: surface, companionFamily: companion, brightness,
            colorGroup: paletteScaleGroup(family.id, brightness), surfaceGroup: brightness === 'light' && ['brown','bronze','gold','sand','amber','yellow','orange'].includes(surface) ? 'warm_neutral' : paletteScaleGroup(surface, brightness),
            title: `${family.title}主色／${COLOR_FAMILIES.find(x => x.id === surface).title}承载／${COLOR_FAMILIES.find(x => x.id === companion).title}陪衬`,
            mood: family.mood, fit: family.fit,
        })))))
    .map((item, index) => Object.freeze({ ...item, code: `P.${String(index + 1).padStart(3, '0')}` })));
