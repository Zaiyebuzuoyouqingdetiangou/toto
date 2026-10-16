// 没开生图 LLM 时，图框里每个人那一条要写衣着：这一幕穿的衣服和配饰，没写就用角色卡里的常穿衣着；标签里也要有衣着。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/promptBuilder.js', import.meta.url), 'utf8');
const canon = source.match(/const CANON_APPEARANCE_RULE = [^\n]*;/)?.[0];
const fn = source.match(/function builtinImageFrameRule\([^]*?\r?\n}/)?.[0];
const context = vm.createContext({});
vm.runInContext(`${canon}\n${fn}\nglobalThis.rule = builtinImageFrameRule;`, context);

test('person lines ask for clothing in both prompt formats', () => {
    const nl = context.rule({ builtinImageEnabled: true, imagePromptFormat: 'nai5-natural' });
    assert.match(nl, /hidden>外貌和衣着<\/p><p data-rm-draw-char-tags="原名" hidden>简短外貌和衣着英文标签/);
    assert.match(nl, /再写这一幕里这个人穿的衣服和身上的配饰，和画面里写的衣着一致，正文或这一面写了就照写，没写就用角色卡里的常穿衣着/);
    assert.match(nl, /英文标签 4～10 个，衣着也要有/);
    // 其余仍是 1.68.95 那版：画面约 100～200 字，不写比喻。
    assert.match(nl, /约 100～200 字/);
    assert.match(nl, /不写对白、心理和比喻/);
    const tags = context.rule({ builtinImageEnabled: true, imagePromptFormat: 'nai45-tags' });
    assert.match(tags, /hidden>外貌和衣着英文短标签<\/p>/);
    assert.match(tags, /再写这一幕里这个人穿的衣服和身上的配饰，和画面里写的衣着一致/);
    assert.match(tags, /4～10 个，衣着也要有/);
});

test('library tags no longer drop the model-written clothing tags', () => {
    const src = readFileSync(new URL('../src/builtinImage.js', import.meta.url), 'utf8');
    const merge = src.match(/function mergeTagLists\([^]*?\r?\n}/)?.[0];
    const appearance = src.match(/function mergeAppearance\([^]*?\r?\n}/)?.[0];
    const ctx = vm.createContext({});
    vm.runInContext(`${merge}\n${appearance}\nglobalThis.merge = mergeTagLists; globalThis.appearance = mergeAppearance;`, ctx);
    const library = { tag: '1girl, black hair, pink eyes', nl: '' };
    // 标签写法：角色库在前，模型写的衣着接在后面，一样的去掉。
    assert.equal(ctx.appearance(library, '1girl, black hair, white inner robe, jade hairpin', true), '1girl, black hair, pink eyes, white inner robe, jade hairpin');
    // NAI 5 人物标签栏同样合并。
    assert.equal(ctx.merge('1boy, black hair', '1boy, black and red robe'), '1boy, black hair, black and red robe');
    assert.match(src, /const tagOf = person => mergeTagLists\(person\.libraryTag, person\.modelTag\);/);
});
