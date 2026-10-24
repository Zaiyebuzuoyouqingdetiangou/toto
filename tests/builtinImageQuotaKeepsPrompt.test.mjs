// 本机满了、整份存档写不下：消息上已写好完整记录时，生图不再用只剩地址的那份去盖它（否则新图显示「旧版本画的」、长相来源消失）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/builtinImage.js', import.meta.url), 'utf8');
const block = source.slice(source.indexOf('catch (error) {', source.indexOf('saveMirrorImageForOwner(key, record, owner')), source.indexOf("console.warn('[RabbitMirror] 内置生图已画成"));

test('the fallback save honours a message copy that was already written', () => {
    assert.match(block, /let minimalSaved = error\?\.messageCopySaved === true;/);
    assert.match(block, /if \(!minimalSaved\) for \(const tier of tiers\)/);
    assert.match(block, /tierError\?\.messageCopySaved === true\) \{ minimalSaved = true; break; \}/);
});

test('the first fallback tier still carries prompt text and appearance sources', () => {
    const first = block.slice(block.indexOf('const tiers = ['), block.indexOf('];', block.indexOf('const tiers = [')));
    assert.match(first, /prompt: record\.prompt/);
    assert.match(first, /looksSources: record\.looksSources/);
    assert.match(first, /promptMetadata: textMeta/);
});
