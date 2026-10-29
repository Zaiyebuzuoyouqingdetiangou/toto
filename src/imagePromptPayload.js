import { rmT as __rmT } from "./textTable.js?rmv=1.99.22";
function text(value) { return typeof value === 'string' ? value.trim() : ''; }
export function buildSingleImagePrompt(plan = {}) {
    const tagsOnly = plan?.promptFormat === 'nai45-tags';
    const scene = text(plan?.flatPrompt) || (tagsOnly
        ? text(plan?.prompt) || text(plan?.nl)
        : text(plan?.nl) || text(plan?.prompt));
    const blocks = [];
    const seen = new Set();
    for (const [index, person] of (Array.isArray(plan?.characters) ? plan.characters : []).entries()) {
        const tag = text(person?.tag);
        const nl = text(person?.nl);
        const appearance = tagsOnly ? tag || nl : [...new Set([nl, tag].filter(Boolean))].join('; ');
        if (!appearance)
            continue;
        const name = text(person?.name) || `${__rmT("7la2GUc6")}${index + 1}`;
        const block = `${name}: ${appearance}`;
        if (seen.has(block) || `\n${scene}\n`.includes(`\n${block}\n`))
            continue;
        seen.add(block);
        blocks.push(block);
    }
    return [scene, ...blocks].filter(Boolean).join('\n');
}
