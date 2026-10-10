import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeFaceDrawLane } from '../src/faceDrawRules.js';

// Only host/storage boundaries are replaced. The catalog paging and category
// selection implementation below is the actual source used by the settings UI.
const file = await readFile(new URL('../src/faceDrawCatalog.js', import.meta.url), 'utf8');
const fixtureDependencies = `
const THEMATIC_CATEGORIES = [{id:'D.1',group:'D',title:'童话',raw:'must not retain'}, {id:'D.2',group:'D',title:'宇宙'}];
const PRESENTATION_FORMATS = [{id:'2.1',group:'2',title:'信件',raw:'must not retain'}];
const filterRandomThemePool = (items, settings) => items.filter(item => settings.blacklistEnabled === false || !(settings.blacklistedThemeIds || []).includes(item.id));
const filterRandomFormatPool = (items, settings) => items.filter(item => settings.blacklistEnabled === false || !(settings.blacklistedFormatIds || []).includes(item.id));
const listExternalLibraries = () => { throw new Error('unexpected real storage access'); };
const listExternalLibraryEntryChoices = () => { throw new Error('unexpected real storage access'); };
`;
const mod = await import(`data:text/javascript;base64,${Buffer.from(fixtureDependencies + file.replace(/^import .*;\r?$/gm, '')).toString('base64')}`);
const { loadFaceDrawCatalog, faceCategorySelection, toggleFaceCategory, toggleFaceItem } = mod;
const category = { id: 'builtin:D', title: '世界观', items: [{ id: 'a', title: '甲' }, { id: 'b', title: '乙' }, { id: 'blocked', title: '黑名单', blocked: true }] };

test('whole categories remain dynamic scopes; a deselected child becomes explicit remaining children', () => {
    const lane = normalizeFaceDrawLane({ itemIds: ['elsewhere'] });
    toggleFaceCategory(lane, category, true);
    assert.deepEqual(lane.categoryIds, ['builtin:D']);
    assert.deepEqual(lane.itemIds, ['elsewhere']);
    assert.deepEqual(faceCategorySelection(lane, category), { count: 2, total: 2, checked: true, mixed: false });
    toggleFaceItem(lane, category, 'a', false);
    assert.deepEqual(lane.categoryIds, []);
    assert.deepEqual(lane.itemIds, ['elsewhere', 'b']);
    assert.deepEqual(faceCategorySelection(lane, category), { count: 1, total: 2, checked: false, mixed: true });
    assert.equal(lane.itemIds.includes('blocked'), false);
});

test('resident selection is separate from optional scope and does not lose picks in another category', () => {
    const lane = normalizeFaceDrawLane({ requiredIds: ['elsewhere'], categoryIds: ['builtin:D'], itemIds: ['other-candidate'] });
    toggleFaceCategory(lane, category, true, true);
    assert.deepEqual(lane.requiredIds, ['elsewhere', 'a', 'b']);
    assert.deepEqual(lane.categoryIds, ['builtin:D']);
    assert.deepEqual(lane.itemIds, ['other-candidate']);
    toggleFaceItem(lane, category, 'a', false, true);
    assert.deepEqual(lane.requiredIds, ['elsewhere', 'b']);
    assert.equal(faceCategorySelection(lane, category, true).mixed, true);
    toggleFaceCategory(lane, category, false, true);
    assert.deepEqual(lane.requiredIds, ['elsewhere']);
});

test('unavailable explicit IDs survive unrelated category changes', () => {
    const lane = normalizeFaceDrawLane({ requiredIds: ['deleted-required'], itemIds: ['deleted-optional'], categoryIds: ['external:removed'] });
    toggleFaceCategory(lane, category, true);
    toggleFaceItem(lane, category, 'b', false);
    assert.ok(lane.requiredIds.includes('deleted-required'));
    assert.ok(lane.itemIds.includes('deleted-optional'));
    assert.ok(lane.categoryIds.includes('external:removed'));
});

test('no new selection limit: large categories retain every selected candidate', () => {
    const large = { id: 'external:large', items: Array.from({ length: 80 }, (_, index) => ({ id: `ext:large:text:${index}` })) };
    const lane = normalizeFaceDrawLane();
    toggleFaceCategory(lane, large, true, true);
    assert.equal(lane.requiredIds.length, 80);
    toggleFaceCategory(lane, large, true);
    toggleFaceItem(lane, large, large.items[0].id, false);
    assert.equal(lane.itemIds.length, 79);
});

test('catalog keeps only metadata, pages enabled libraries, and ignores disabled or unconfirmed entries', async () => {
    const calls = [];
    const catalog = await loadFaceDrawCatalog({ blacklistedThemeIds: ['D.2'], blacklistedFormatIds: ['ext:l:text:4'] }, {
        listLibraries: async () => [{ libraryId: 'off', enabled: false }, { libraryId: 'l', enabled: true, displayName: '外置故事' }],
        listChoices: async (id, options) => {
            calls.push([id, options.offset]);
            return options.offset === 0 ? {
                offset: 0, hasNext: true, choices: [
                    { externalId: 'ext:l:theme:1', title: '世界', enabled: true, selectable: true, classification: 'theme', rawContent: 'private' },
                    { externalId: 'ext:l:format:2', title: '关闭', enabled: false, selectable: true, classification: 'format' },
                    { externalId: 'ext:l:text:3', title: '未确认', enabled: true, selectable: false, classification: 'text' },
                ],
            } : { offset: 3, hasNext: false, choices: [{ externalId: 'ext:l:text:4', title: '长篇', enabled: true, selectable: true, classification: 'text' }] };
        },
    });
    assert.deepEqual(calls, [['l', 0], ['l', 3]]);
    assert.equal(catalog.theme[0].items.find(item => item.id === 'D.2').blocked, true);
    assert.equal(catalog.theme[1].id, 'external:l');
    assert.equal(catalog.format.length, 1);
    assert.equal(catalog.text[0].items[0].blocked, true);
    assert.equal(catalog.warnings.length, 0);
    assert.equal(JSON.stringify(catalog).includes('rawContent'), false);
    assert.equal(JSON.stringify(catalog).includes('private'), false);
    assert.equal(JSON.stringify(catalog).includes('must not retain'), false);
});

test('unreadable external storage leaves builtins available and reports the failure', async () => {
    const catalog = await loadFaceDrawCatalog({}, { listLibraries: async () => { throw new Error('offline IDB'); } });
    assert.ok(catalog.theme[0].items.length > 0);
    assert.match(catalog.warnings[0], /offline IDB/);
});

test('a repeated storage page ends safely instead of spinning or accepting an incomplete library', async () => {
    let reads = 0;
    const catalog = await loadFaceDrawCatalog({}, {
        listLibraries: async () => [{ libraryId: 'l', enabled: true, displayName: '目录' }],
        listChoices: async () => { reads++; return { offset: 0, hasNext: true, choices: [{ externalId: 'ext:l:text:1', title: '一', enabled: true, selectable: true, classification: 'text' }] }; },
    });
    assert.equal(reads, 2);
    assert.equal(catalog.text.length, 0);
    assert.match(catalog.warnings[0], /未读取完整/);
});
