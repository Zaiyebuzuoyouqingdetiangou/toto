import { rmT as __rmT } from "./textTable.js?rmv=1.99.14";
import { THEMATIC_CATEGORIES } from '../data/structured/thematicIndex.js?rmv=1.99.14';
import { PRESENTATION_FORMATS } from '../data/structured/presentationIndex.js?rmv=1.99.14';
import { filterRandomThemePool, filterRandomFormatPool } from './blacklist.js?rmv=1.99.14';
import { listExternalLibraries, listExternalLibraryEntryChoices, listExternalLibraryTitleIndex } from './externalWorldBook/store.js?rmv=1.99.14';
const GROUPS = {
    theme: { A: __rmT("xbolF7UJDJghdf"), B: __rmT("j8HuPArSXWkrk9RtzRm6cVO_"), C: __rmT("nhtMOoteqLCA0G.oRiT"), D: __rmT("3J1pHM8PL3NS_Q4uD2KbKh"), E: __rmT("lrxLLYvSe.N._4eYRGRBmk"), F: __rmT("r0yJhiteqLCA0WIb1sC"), G: __rmT("jmBNaIRAlahtBCWG4gOEJJorwRR6eh"), H: __rmT("vTq4NoteqLCA0C72I08"), I: __rmT("klKk19UCSFEtBCWG4gOa3M5YLMhCYh") },
    format: { 1: __rmT("yNMQaAWEwg_"), 2: __rmT("4T.U8OUJGuh7Ek"), 3: __rmT("H4.nvxUJLuOjHf"), 4: __rmT("QZsNvOUJxuDTEk"), 5: __rmT("5b3d8OUJeA.EPf"), 6: __rmT("0x.rFxUJPBqfCk"), 7: __rmT("5N94Ho21EvEGnrH6PbIq8peX"), 8: __rmT("CG1OYg0xj08GnpHY5yhyQBIH"), 10: __rmT("0ADjz_0zzAk") },
};
export async function loadFaceDrawCatalog(settings, dependencies = {}) {
    const readLibraries = dependencies.listLibraries || listExternalLibraries;
    const readChoices = dependencies.listChoices || listExternalLibraryEntryChoices;
    const catalog = { theme: [], format: [], text: [], warnings: [] };
    for (const [kind, source] of [['theme', THEMATIC_CATEGORIES], ['format', PRESENTATION_FORMATS]]) {
        const allowed = new Set((kind === 'theme' ? filterRandomThemePool : filterRandomFormatPool)(source, settings).map(item => item.id));
        const groups = new Map();
        for (const item of source) {
            const id = `builtin:${item.group || 'other'}`;
            if (!groups.has(id))
                groups.set(id, { id, title: GROUPS[kind][item.group] || item.group || __rmT("yGhZ3f"), source: 'builtin', items: [] });
            groups.get(id).items.push({ id: String(item.id), title: String(item.title || item.id), blocked: !allowed.has(item.id) });
        }
        catalog[kind] = [...groups.values()];
    }
    if (!dependencies.listChoices && !dependencies.listLibraries) {
        try {
            const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
            const index = await (dependencies.listTitleIndex || listExternalLibraryTitleIndex)();
            for (const { library, entries } of index.sort((a, b) => compare(a.library.libraryId, b.library.libraryId))) {
                const groups = Object.fromEntries(['theme', 'format', 'text'].map(kind => [kind, {
                        id: `external:${library.libraryId}`, title: String(library.displayName || library.libraryId), source: 'external', items: [],
                    }]));
                const seen = new Set();
                for (const row of entries) {
                    if (!groups[row.classification] || seen.has(row.externalId))
                        continue;
                    seen.add(row.externalId);
                    const item = { id: String(row.externalId), title: String(row.title || row.externalId) };
                    item.blocked = (row.classification === 'theme' ? filterRandomThemePool : filterRandomFormatPool)([item], settings).length === 0;
                    groups[row.classification].items.push(item);
                }
                for (const kind of ['theme', 'format', 'text'])
                    if (groups[kind].items.length) {
                        groups[kind].items.sort((a, b) => compare(a.id, b.id));
                        catalog[kind].push(groups[kind]);
                    }
            }
        }
        catch (error) {
            catalog.warnings.push(`${__rmT("zb9_lpu5PEESo1IzC0THLZdgyrMqoUxnBf9Cqh")}${String(error?.message || error)}${__rmT("7Fjlz5pP5ig.awHYivZLnBILnaslWN6N29E")}`);
        }
        return catalog;
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
                        if (!row.enabled || !row.selectable || !groups[row.classification] || seen.has(row.externalId))
                            continue;
                        seen.add(row.externalId);
                        const item = { id: String(row.externalId), title: String(row.title || row.externalId) };
                        item.blocked = (row.classification === 'theme' ? filterRandomThemePool : filterRandomFormatPool)([item], settings).length === 0;
                        groups[row.classification].items.push(item);
                    }
                    if (!page.hasNext)
                        break;
                    const nextOffset = Number(page.offset) + rows.length;
                    if (!Number.isFinite(nextOffset) || nextOffset <= offset)
                        throw new Error(__rmT("MdgU.8cmXJGQsHYtbpXmeKDLNL9DxENC"));
                    offset = nextOffset;
                }
                for (const kind of ['theme', 'format', 'text'])
                    if (groups[kind].items.length) {
                        groups[kind].items.sort((a, b) => compare(a.id, b.id));
                        catalog[kind].push(groups[kind]);
                    }
            }
            catch (error) {
                catalog.warnings.push(`${__rmT("YSk")}${library.displayName || library.libraryId}${__rmT("CoLxPnnKmxb3S2IsdXYBcTty")}${String(error?.message || error)}${__rmT("eSpMwa4BzR3uR.JCmmnLpQ1dW5BmV9BO8NVkBXPo6tHjbCjFFOnAPq5X")}`);
            }
        }
    }
    catch (error) {
        catalog.warnings.push(`${__rmT("zb9_lpu5PEESo1IzC0THLZdgyrMqoUxnBf9Cqh")}${String(error?.message || error)}${__rmT("7Fjlz5pP5ig.awHYivZLnBILnaslWN6N29E")}`);
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
    }
    else {
        lane.itemIds = lane.itemIds.filter(id => !allIds.has(id));
        lane.categoryIds = [...lane.categoryIds.filter(id => id !== category.id), ...(checked ? [category.id] : [])];
    }
}
export function toggleFaceItem(lane, category, id, checked, resident = false) {
    if (resident) {
        lane.requiredIds = [...lane.requiredIds.filter(value => value !== id), ...(checked ? [id] : [])];
        return;
    }
    if (lane.categoryIds.includes(category.id)) {
        lane.categoryIds = lane.categoryIds.filter(value => value !== category.id);
        lane.itemIds = [...new Set([...lane.itemIds, ...category.items.filter(item => !item.blocked).map(item => item.id)])];
    }
    lane.itemIds = [...lane.itemIds.filter(value => value !== id), ...(checked ? [id] : [])];
}
