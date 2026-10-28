const COUNT = /^(\d{1,2}\+?)\s*(boys?|girls?|others?)(?![\w'’-])\s*(.*)$/i;
function countTag(number, noun) {
    const word = noun.toLowerCase();
    const plural = number === '1' ? word.replace(/s$/, '') : (word.endsWith('s') ? word : `${word}s`);
    return `${number}${plural}`;
}
export function tidyImageTags(text) {
    const source = String(text || '');
    if (!source.trim())
        return source;
    const label = /^(?![({[])([^,:\n]{1,40}):\s+(?=\S)/.exec(source);
    if (label && !/::/.test(source))
        return `${label[0]}${tidyImageTags(source.slice(label[0].length))}`;
    if (!source.includes(',') && source.length > 60)
        return source;
    if (/[\u3400-\u9fff]/.test(source))
        return source;
    if (/::/.test(source))
        return source;
    const parts = source.split(',').map(item => item.trim()).filter(Boolean);
    const longParts = parts.filter(item => item.split(/\s+/).length > 4).length;
    if (longParts > parts.length / 3)
        return source;
    const counts = [];
    const rest = [];
    for (const raw of source.split(',')) {
        const item = raw.trim();
        if (!item)
            continue;
        if (/[:{}[\]]/.test(item)) {
            rest.push(item);
            continue;
        }
        let remainder = item;
        let match = COUNT.exec(remainder);
        while (match) {
            counts.push(countTag(match[1], match[2]));
            remainder = match[3].trim();
            match = remainder ? COUNT.exec(remainder) : null;
        }
        if (remainder)
            rest.push(remainder);
    }
    const seen = new Set();
    return [...counts, ...rest].filter(item => {
        const key = item.toLowerCase().replace(/\s+/g, ' ');
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    }).join(', ');
}
export function tidyImagePayload(payload, { promptIsTags = true, flatTagLines = 'none' } = {}) {
    if (!payload || typeof payload !== 'object')
        return payload;
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
