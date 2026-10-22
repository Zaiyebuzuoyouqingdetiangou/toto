// 「点一下就开始播放／录音」写成 .按钮.broadcasting 这类「正在做某事」的状态类，也要接上开关；heading、padding 这类普通名词，typing、loading、incoming 这类聊天气泡和加载状态的词不算。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/outputSanitizer/toolsChrome.js', import.meta.url), 'utf8');
const R = new Function(`return ${src.match(/const ORPHAN_STATE_NAME = (\/.*\/i);/)[1]}`)();

test('ongoing-state class names count', () => {
    for (const name of ['rmc-x-broadcasting', 'recording', 'spinning', 'glowing', 'active', 'flipped', 'pressed']) assert.ok(R.test(name), name);
});
test('ordinary nouns ending in -ing do not', () => {
    for (const name of ['heading', 'x-padding', 'x-setting', 'string', 'ring', 'drawing', 'painting', 'incoming', 'outgoing', 'typing', 'pending', 'loading', 'subheading', 'rating', 'spring', 'x-incoming', 'live', 'running']) assert.ok(!R.test(name), name);
});
