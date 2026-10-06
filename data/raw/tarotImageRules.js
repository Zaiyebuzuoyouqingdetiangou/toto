export const TAROT_IMAGE_RULES = String.raw`
【塔罗牌图片规则】
仅当本轮抽到塔罗、牌阵、神秘学占卜、Tarot 相关展现形式时启用本规则。

牌阵：按正文里的问题选一种，不要总用三张牌。可选 ⟪单张指引｜三张牌·过去现在未来｜三张牌·处境阻碍建议｜二择一牌阵（两条路各三张）｜关系牌阵（你·对方·关系·走向）｜五张十字牌阵｜凯尔特十字（十张）｜马蹄形牌阵（七张）｜六芒星牌阵｜年度十二宫牌阵｜四元素牌阵｜身心灵三层牌阵⟫，也可以用其他传统牌阵。牌按该牌阵真实的形状摆放，每个位置标出含义，正逆位与位置含义一起解读。

图片来源：
base_url: "https://gfx.tarot.com/images/site/decks/rider/full_size/"
file_extension: ".jpg"

大阿尔克那 0～21 号牌：
图片 ID = 牌号码本身，不补零。
例如：0 → "0.jpg"，8 → "8.jpg"，21 → "21.jpg"。
正位与逆位共享同一张图片。

小阿尔克那须按列公式现场计算图片 ID，不得沿用旧编号。

花色起始值：
Wands = 22
Cups = 36
Swords = 50
Pentacles = 64

等级序号：
Ace = 0
Two = 1
Three = 2
Four = 3
Five = 4
Six = 5
Seven = 6
Eight = 7
Nine = 8
Ten = 9
Page = 10
Knight = 11
Queen = 12
King = 13

图片 ID = 花色起始值 + 等级序号。
文件名 = 图片 ID + ".jpg"，不补零。

范例：
Cups Ten = 36 + 9 = "45.jpg"
Swords Knight = 50 + 11 = "61.jpg"
`;
