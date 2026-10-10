import test from 'node:test';
import assert from 'node:assert/strict';
import {
    atlasSlotsText, atlasSlotMatchesFavorite, buildFavoriteAtlas,
    favoriteAtlasProgress, parseAtlasSlots, setAtlasSelection,
} from '../src/favoriteAtlases.js';

const makeAtlas = () => buildFavoriteAtlas({ name: '塔罗牌', slotsText: '愚者 | The Fool | 0号愚者牌\n魔术师 | The Magician' });
const favorite = (id, title, html = `<details><summary>${title}</summary><p>已保存的原文。</p></details>`) => ({ id, title, html });

test('bulk slots retain independent IDs and aliases, accepting blank lines and Windows newlines', () => {
    const atlas = makeAtlas();
    assert.equal(atlas.slots.length, 2);
    assert.notEqual(atlas.slots[0].id, atlas.slots[1].id);
    assert.deepEqual(atlas.slots[0].keywords, ['愚者', 'The Fool', '0号愚者牌']);
    assert.equal(parseAtlasSlots('\r\n猫\r\n\r\n狗\r\n').length, 2);
    assert.equal(atlasSlotsText(atlas.slots), '愚者 | The Fool | 0号愚者牌\n魔术师 | The Magician');
    assert.throws(() => parseAtlasSlots('cat\nＣＡＴ'), /重复/);
    assert.throws(() => parseAtlasSlots('| cat'), /缺少/);
    assert.throws(() => buildFavoriteAtlas({ name: ' ', slotsText: '猫' }), /名称/);
    assert.throws(() => buildFavoriteAtlas({ name: '猫', slotsText: ' ' }), /至少/);
});

test('title, named headings, standalone labels and aliases count as collection evidence', () => {
    const [fool, magician] = makeAtlas().slots;
    assert.equal(atlasSlotMatchesFavorite(fool, favorite('a', '【兔子镜：愚者】')), true);
    assert.equal(atlasSlotMatchesFavorite(fool, favorite('b', '信件', '<h2>The <em>Fool</em></h2>')), true);
    assert.equal(atlasSlotMatchesFavorite(fool, favorite('c', '信件', '<p>「愚者」</p>')), true);
    assert.equal(atlasSlotMatchesFavorite(fool, favorite('d', '信件', '<p>&#24858;&#32773;</p>')), true);
    assert.equal(atlasSlotMatchesFavorite(magician, favorite('e', '魔术师的来信')), true);
    assert.equal(atlasSlotMatchesFavorite(fool, favorite('f', '信件', '<h2>0号愚者牌的故事</h2>')), true);
});

test('ordinary body mentions, partial words, attributes, scripts and styles do not falsely light cells', () => {
    const [fool] = makeAtlas().slots;
    const cat = parseAtlasSlots('猫 | cat')[0];
    for (const row of [
        favorite('a', '新来信', '<p>我今天想起了愚者，然后离开了。</p>'),
        favorite('b', '新来信', '<style>/*愚者*/</style><script>"愚者"</script><template>愚者</template>'),
        favorite('c', '新来信', '<!-- <h1>愚者</h1> --><p title="愚者">普通故事</p>'),
        favorite('d', 'The Foolish story'),
        favorite('quoted-attribute', '新来信', '<h2 data-note="> 愚者 <">普通故事</h2><p title=">愚者">仍是普通故事</p>'),
    ]) assert.equal(atlasSlotMatchesFavorite(fool, row), false, row.id);
    assert.equal(atlasSlotMatchesFavorite(cat, favorite('e', '猫咪的来信')), false);
    assert.equal(atlasSlotMatchesFavorite(cat, favorite('f', 'catalogue')), false);
    assert.equal(atlasSlotMatchesFavorite(cat, favorite('g', '【猫】')), true);
});

test('manual correction overrides auto matches, supports multiple favorites, blank override and restore-auto', () => {
    const atlas = makeAtlas(), id = atlas.slots[0].id;
    const rows = [favorite('auto', '愚者'), favorite('manual', '另一封信'), favorite('third', '其他')];
    assert.deepEqual(favoriteAtlasProgress(atlas, rows).slots[0].matches.map(x => x.id), ['auto']);
    const linked = setAtlasSelection(atlas, id, ['manual', 'third', 'manual']);
    assert.deepEqual(favoriteAtlasProgress(linked, rows).slots[0].matches.map(x => x.id), ['manual', 'third']);
    const cleared = setAtlasSelection(linked, id, []);
    assert.equal(favoriteAtlasProgress(cleared, rows).count, 0);
    assert.equal(favoriteAtlasProgress(cleared, rows).slots[0].manual, true);
    const restored = setAtlasSelection(cleared, id, null);
    assert.equal(favoriteAtlasProgress(restored, rows).count, 1);
    assert.equal(favoriteAtlasProgress(restored, rows).slots[0].manual, false);
    assert.deepEqual(atlas.selections, {}, 'pure edits must not prematurely mutate live persisted model');
});

test('editing aliases/reordering retains associations; removed/renamed slots drop only their association', () => {
    let atlas = makeAtlas();
    atlas = setAtlasSelection(atlas, atlas.slots[0].id, ['favorite-old']);
    const edited = buildFavoriteAtlas({ name: '我的塔罗', slotsText: '魔术师 | Magician\n愚者 | 新别名', previous: atlas });
    assert.equal(edited.id, atlas.id);
    assert.equal(edited.createdAt, atlas.createdAt);
    assert.equal(edited.slots[1].id, atlas.slots[0].id);
    assert.deepEqual(edited.selections[edited.slots[1].id], ['favorite-old']);
    const removed = buildFavoriteAtlas({ name: '缩减图鉴', slotsText: '魔术师', previous: edited });
    assert.deepEqual(removed.selections, {});
    assert.equal(atlas.slots.length, 2);
    assert.deepEqual(atlas.selections[atlas.slots[0].id], ['favorite-old']);
});

test('legacy saved records are recognized without migration or any HTML/title/identity edits', () => {
    const rows = [favorite('old-id', '愚者', '<details data-old="1"><summary>愚者</summary><p>原文 &amp; 图片</p><img src="old.png"></details>')];
    rows[0].unknownLegacyField = { preserve: true };
    const before = structuredClone(rows), atlas = makeAtlas();
    assert.equal(favoriteAtlasProgress(atlas, rows).count, 1);
    assert.deepEqual(rows, before);
    assert.equal(favoriteAtlasProgress(setAtlasSelection(atlas, atlas.slots[0].id, ['old-id']), []).count, 0, 'deleted favorite cannot leave a ghost lit cell');
});

test('matching evidence cache invalidates when original record content changes', () => {
    const slot = makeAtlas().slots[0], row = favorite('same', '愚者');
    assert.equal(atlasSlotMatchesFavorite(slot, row), true);
    row.title = '星星'; row.html = '<p>星星</p>';
    assert.equal(atlasSlotMatchesFavorite(slot, row), false);
});
