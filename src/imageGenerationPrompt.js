const MAX_MIRROR_CHARS = 2600;
const MAX_APPEARANCE_CHARS = 900;

function cleanText(value, maxChars) {
    return String(value ?? '')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxChars);
}

export function buildRabbitMirrorImagePrompt({
    mirrorContent = '',
    mirrorTitle = '',
    charName = 'CHAR',
    charAppearance = '',
    userName = 'USER',
    userAppearance = '',
} = {}) {
    const title = cleanText(mirrorTitle, 180) || '未命名兔子镜';
    const content = cleanText(mirrorContent, MAX_MIRROR_CHARS) || '当前兔子镜没有可提取的可见正文。';
    const safeCharName = cleanText(charName, 80) || 'CHAR';
    const safeUserName = cleanText(userName, 80) || 'USER';
    const safeCharAppearance = cleanText(charAppearance, MAX_APPEARANCE_CHARS) || '未提供明确外观；仅使用本轮内容中已经明确的信息，不得擅自固定发色、瞳色、体型或服装。';
    const safeUserAppearance = cleanText(userAppearance, MAX_APPEARANCE_CHARS) || '未提供明确外观；仅使用本轮内容中已经明确的信息，不得擅自固定发色、瞳色、体型或服装。';

    return `【RabbitMirror 文生图专用 Prompt｜仅用于本次配图】

请把下方兔子镜内容转换成一幅完整、自然、具有明确主体和空间关系的 2D 动漫插画。统一使用二次元插画语言、非写实、非摄影、非 3D、非真人风格；线条、上色、光影和材质表现都应服从 2D 动漫画风。兔子镜内容决定事件、情绪、场景和人物关系；CHAR／USER 外观资料只用于稳定人物身份，不得覆盖本轮内容。

【兔子镜标题】
${title}

【兔子镜当前可见内容】
${content}

【CHAR 外观锚点｜${safeCharName}】
${safeCharAppearance}

【USER 外观锚点｜${safeUserName}】
${safeUserAppearance}

【场景转换规则】
- 论坛、聊天、档案、判定面板、报告、信件、帖子或其他信息媒介，不得直接画成网页截图或大面积 UI；应转换成媒介背后的真实场景、人物行为、情绪反应或内容所指向的画面。
- 根据本轮内容判断 CHAR、USER、双方或无人场景谁实际需要入镜；只被提及但不在场的人不得强行加入，没有人物主体时不得硬塞人物。
- 双人或多人画面须分别明确每个人的位置、动作、视线、服装和空间关系，保持轮廓独立，不得把 CHAR 与 USER 的发色、五官、体型、服装或身份特征互换、混合或串用。
- 明确主体、前中后景、镜头距离、视角、构图、光源方向、时间、环境和氛围；主体与关键人物完整进入画面，避免无意义裁切。
- 不得把所有内容惯性套成黑红警报、霓虹、赛博朋克、阴暗恐怖或通用网页卡片风；具体审美必须由本轮内容自然决定。

【人体与画面稳定】
人体结构自然，四肢和手指数量合理，五官位置正常；多人之间保持明确距离与独立轮廓。避免多手多脚、额外或缺失肢体、手部融合、人物融合、面部重叠、重复人物、无关人物、错误比例、错误透视、漂浮物体、主体裁切、头部出框、脏乱背景、模糊、失焦和过度锐化。

【禁止网页与文字污染】
画面中不得出现可读文字、乱码、字幕、水印、标志、二维码、网页、按钮、边框、菜单、聊天气泡、控制面板或 UI 截图；除非兔子镜内容明确把某个实体文字物件作为关键剧情主体，否则只允许模糊、不可辨认的环境性屏幕光或纸面痕迹。

【温和画面】
画面保持非血腥、非暴力、非恐怖、非猎奇。不得描绘血液、流血、开放性伤口、断肢、尸体、内脏、酷刑、虐待、攻击命中过程、身体破坏、腐烂组织、惊悚怪物、恐怖脸孔或令人不适的身体变形。若原内容包含冲突、危险、受伤、死亡或恐怖情节，只通过距离、光影、表情、环境、象征物或事件前后的安全画面表达叙事张力，不直接呈现伤害过程和血腥结果。

直接生成画面，不要在图片中写出提示词或解释。`;
}
