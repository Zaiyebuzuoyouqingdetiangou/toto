// 交给生图之前把英文标签理一遍（只理标签，不动自然语言画面描述）：
//   1. 人数和性别标签放最前面：生图模型靠开头的 1boy, 1girl 知道画面里有几个人、是男是女。
//   2. 粘在一起的拆开：模型偶尔写成「1girl piggyback」，生图模型认不出这里有一个女孩。
//   3. 「1 girl」写成「1girl」：生图模型认的是不带空格的写法。
//   4. 重复的去掉（大小写不同也算重复）。
// 带权重的写法（1.2::tag::、{tag}、[tag]）原样保留，不拆。

const COUNT = /^(\d{1,2}\+?)\s*(boys?|girls?|others?)(?![\w'’-])\s*(.*)$/i;

function countTag(number, noun) {
    const word = noun.toLowerCase();
    const plural = number === '1' ? word.replace(/s$/, '') : (word.endsWith('s') ? word : `${word}s`);
    return `${number}${plural}`;
}

/** 理一行逗号分隔的英文标签；不像标签（没有逗号、又很长）的原样返回。 */
export function tidyImageTags(text) {
    const source = String(text || '');
    if (!source.trim()) return source;
    if (!source.includes(',') && source.length > 60) return source;
    // 自然语言画面描述（中文，或英文长句用逗号连起来）不当标签理。
    if (/[\u3400-\u9fff]/.test(source)) return source;
    // 跨逗号的权重组（1.2::red hair, 1 girl::）拆开会把标签挪出组：整行不动。
    if (/::/.test(source)) return source;
    const parts = source.split(',').map(item => item.trim()).filter(Boolean);
    const longParts = parts.filter(item => item.split(/\s+/).length > 4).length;
    if (longParts > parts.length / 3) return source;
    const counts = [];
    const rest = [];
    for (const raw of source.split(',')) {
        const item = raw.trim();
        if (!item) continue;
        if (/[:{}[\]]/.test(item)) { rest.push(item); continue; }
        // 「1boy 1girl piggyback」：开头连着几个人数标签都拆出来。
        let remainder = item;
        let match = COUNT.exec(remainder);
        while (match) {
            counts.push(countTag(match[1], match[2]));
            remainder = match[3].trim();
            match = remainder ? COUNT.exec(remainder) : null;
        }
        if (remainder) rest.push(remainder);
    }
    const seen = new Set();
    return [...counts, ...rest].filter(item => {
        const key = item.toLowerCase().replace(/\s+/g, ' ');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).join(', ');
}

/**
 * 一整份生图请求。哪些字段是标签由调用方说清楚，不靠猜：
 *   promptIsTags：prompt 是标签栏（不是退回来的自然语言画面）。
 *   flatTagLines：flatPrompt 里哪些行是标签——'all' 每一行各理各的（人物行不和别人去重）、'first' 只理第一行、'none' 不动。
 * 人物标签栏都理。
 */
export function tidyImagePayload(payload, { promptIsTags = true, flatTagLines = 'none' } = {}) {
    if (!payload || typeof payload !== 'object') return payload;
    const flat = String(payload.flatPrompt || '');
    const lines = flat.split('\n');
    const flatPrompt = flatTagLines === 'all' ? lines.map(line => tidyImageTags(line)).join('\n')
        : flatTagLines === 'first' ? [tidyImageTags(lines[0]), ...lines.slice(1)].join('\n') : flat;
    return {
        ...payload,
        prompt: promptIsTags ? tidyImageTags(payload.prompt) : payload.prompt,
        flatPrompt,
        characters: Array.isArray(payload.characters)
            ? payload.characters.map(person => person && typeof person === 'object' ? { ...person, tag: tidyImageTags(person.tag) } : person)
            : payload.characters,
    };
}
