import test from 'node:test';
import assert from 'node:assert/strict';
import { UI_THEMES, normalizeAppearance } from '../src/settingsAppearance.js';

// Expected palette data transcribed from the supplied Hearttrace constants,
// not calculated from RabbitMirror's UI implementation.
const expected = [
 ['default','#f5f4fb','#ffffff','#34495d','#586b7c','#ce729c','#58a59e','#cfdae5'],
 ['night','#171d28','#232c3a','#edf1f8','#b8c5d6','#d9a8c1','#90c9c5','#455269'],
 ['gs1','#edf6e5','#ffffff','#234831','#50624d','#43833d','#e7b83b','#bad7a7'],
 ['gs2','#e9f3ff','#ffffff','#233d61','#52647d','#287dc3','#9b79c8','#b4d2ee'],
 ['gs3','#fff0f5','#ffffff','#572c43','#78536a','#cc4d87','#68a97d','#edb6cf'],
 ['gs4','#fff1d9','#fffefd','#553b24','#74604b','#c77425','#5096c8','#e9ca94'],
];
for (const [id,...colors] of expected) test(`UI theme ${id} retains the supplied Hearttrace palette`, () => {
 const theme=UI_THEMES.find(t=>t.id===id);
 assert.ok(theme);
 assert.deepEqual(['background','surface','text','muted','accent','accentAlt','border'].map(k=>theme.palette[k]),colors);
});
test('missing appearance preferences keep host theme without changing generation settings', () => {
 assert.equal(normalizeAppearance(null).mode,'host');
 assert.deepEqual(Object.keys(normalizeAppearance(null)).sort(),['custom','mode']);
});
test('custom palette roundtrips and reading it does not mutate the input', () => {
 const source={mode:'custom',custom:Object.fromEntries(['background','surface','text','muted','accent','accentAlt','border'].map(k=>[k,'#123456']))};
 const original=JSON.stringify(source);
 assert.deepEqual(normalizeAppearance(source),source);
 assert.equal(JSON.stringify(source),original);
});
test('corrupt saved appearance is recoverable and arbitrary CSS is not accepted as a colour', () => {
 const source={mode:'missing-theme',custom:{background:'url(https://example.invalid/track)',text:'#112233'}};
 const original=JSON.stringify(source), normalized=normalizeAppearance(source);
 assert.equal(normalized.mode,'host');
 assert.equal(normalized.custom.background,'#f5f4fb');
 assert.equal(normalized.custom.text,'#112233');
 assert.equal(JSON.stringify(source),original);
});
