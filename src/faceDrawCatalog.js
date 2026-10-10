import { THEMATIC_CATEGORIES } from '../data/structured/thematicIndex.js?rmv=1.67.42-face-atlas-test3';
import { PRESENTATION_FORMATS } from '../data/structured/presentationIndex.js?rmv=1.67.42-face-atlas-test3';
import { filterRandomThemePool, filterRandomFormatPool } from './blacklist.js?rmv=1.67.42-face-atlas-test3';
import { listExternalLibraries, listExternalLibraryEntryChoices } from './externalWorldBook/store.js?rmv=1.67.42-face-atlas-test3';

const GROUPS = {
    theme: { A: '色情与感官', B: '心理 / 情感暗流', C: '温馨 / 日常', D: '世界观 / 侧写', E: '荒诞 / 超现实', F: '幽默 / 搞笑', G: '平行时空 / IF 线', H: '悬疑 / 怪谈', I: '本世界观 / 当前篇章' },
    format: { 1: '数字生活', 2: '纸本与实物', 3: '专业与学术', 4: '媒体与出版', 5: '艺术与表演', 6: '游戏与互动', 7: '网络文学与同人创作', 8: '后设叙事与第四面墙', 10: '视觉实验' },
};

// The picker uses the same category IDs. Keep this catalog light: no prompts,
// entry bodies, or worldbook rawContent are retained by the settings editor.
export async function loadFaceDrawCatalog(settings, dependencies = {}) {
    const readLibraries = dependencies.listLibraries || listExternalLibraries;
    const readChoices = dependencies.listChoices || listExternalLibraryEntryChoices;
    const catalog = { theme: [], format: [], text: [], warnings: [] };
    for (const [kind, source] of [['theme', THEMATIC_CATEGORIES], ['format', PRESENTATION_FORMATS]]) {
        const allowed = new Set((kind === 'theme' ? filterRandomThemePool : filterRandomFormatPool)(source, settings).map(item => item.id));
        const groups = new Map();
        for (const item of source) {
            const id = `builtin:${item.group || 'other'}`;
            if (!groups.has(id)) groups.set(id, { id, title: GROUPS[kind][item.group] || item.group || '其他', source: 'builtin', items: [] });
            groups.get(id).items.push({ id: String(item.id), title: String(item.title || item.id), blocked: !allowed.has(item.id) });
        }
        catalog[kind] = [...groups.values()];
    }
    try {
        const libraries = await readLibraries();
        const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
        for (const library of libraries.filter(item => item.enabled === true).sort((a, b) => compare(a.libraryId, b.libraryId))) {
            const groups = Object.fromEntries(['theme', 'format', 'text'].map(kind => [kind, {
                id: `external:${library.libraryId}`, title: String(library.displayName || library.libraryId), source: 'external', items: [],
            }]));
            try {
                let offset = 0;
                const seen = new Set();
                for (;;) {
                    const page = await readChoices(library.libraryId, { offset, pageSize: 50 });
                    const rows = Array.isArray(page.choices) ? page.choices : [];
                    for (const row of rows) {
                        if (!row.enabled || !row.selectable || !groups[row.classification] || seen.has(row.externalId)) continue;
                        seen.add(row.externalId);
                        const item = { id: String(row.externalId), title: String(row.title || row.externalId) };
                        item.blocked = (row.classification === 'theme' ? filterRandomThemePool : filterRandomFormatPool)([item], settings).length === 0;
                        groups[row.classification].items.push(item);
                    }
                    if (!page.hasNext) break;
                    const nextOffset = Number(page.offset) + rows.length;
                    if (!Number.isFinite(nextOffset) || nextOffset <= offset) throw new Error('条目目录分页没有继续前进');
                    offset = nextOffset;
                }
                for (const kind of ['theme', 'format', 'text']) if (groups[kind].items.length) {
                    groups[kind].items.sort((a, b) => compare(a.id, b.id));
                    catalog[kind].push(groups[kind]);
                }
            } catch (error) {
                catalog.warnings.push(`「${library.displayName || library.libraryId}」目录未读取完整：${String(error?.message || error)}。已保存的选择仍保留，请刷新目录后再核对。`);
            }
        }
    } catch (error) {
        catalog.warnings.push(`外置母本库目录暂时无法读取：${String(error?.message || error)}。已保存的外置选择仍保留。`);
    }
    return catalog;
}

export function faceCategorySelection(lane, category, resident = false) {
    const items = category.items.filter(item => !item.blocked);
    const selected = new Set(resident ? lane.requiredIds : lane.itemIds);
    const whole = !resident && lane.categoryIds.includes(category.id);
    const count = items.filter(item => whole || selected.has(item.id)).length;
    return { count, total: items.length, checked: items.length > 0 && count === items.length, mixed: count > 0 && count < items.length };
}

export function toggleFaceCategory(lane, category, checked, resident = false) {
    const allowedIds = category.items.filter(item => !item.blocked).map(item => item.id);
    const allIds = new Set(category.items.map(item => item.id));
    if (resident) {
        lane.requiredIds = [...new Set([...lane.requiredIds.filter(id => !allIds.has(id)), ...(checked ? allowedIds : [])])];
    } else {
        lane.itemIds = lane.itemIds.filter(id => !allIds.has(id));
        lane.categoryIds = [...lane.categoryIds.filter(id => id !== category.id), ...(checked ? [category.id] : [])];
    }
}

export function toggleFaceItem(lane, category, id, checked, resident = false) {
    if (resident) {
        lane.requiredIds = [...lane.requiredIds.filter(value => value !== id), ...(checked ? [id] : [])];
        return;
    }
    // Unchecking one child turns a whole-category selection into explicit
    // child selections, so future new children are not silently reselected.
    if (lane.categoryIds.includes(category.id)) {
        lane.categoryIds = lane.categoryIds.filter(value => value !== category.id);
        lane.itemIds = [...new Set([...lane.itemIds, ...category.items.filter(item => !item.blocked).map(item => item.id)])];
    }
    lane.itemIds = [...lane.itemIds.filter(value => value !== id), ...(checked ? [id] : [])];
}
