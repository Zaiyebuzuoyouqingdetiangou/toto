// 打码名单：保存要立刻存盘并读回核对，确认后才说「已保存」；失败要明说。加进名单就顺手存。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ui = readFileSync(new URL('../src/ui.js', import.meta.url), 'utf8');
const settings = readFileSync(new URL('../src/settings.js', import.meta.url), 'utf8');
const handler = ui.slice(ui.indexOf('const doSaveNameMaskLists = async'), ui.indexOf("$('#rh_name_mask_save').on('click'"));

test('the save button waits for a verified save before saying saved', () => {
    const verify = handler.indexOf('await saveSettingsNowAndVerify(');
    const saved = handler.indexOf('已保存到酒馆设置');
    assert.ok(verify > 0 && saved > verify, '先核对再提示');
    assert.match(handler, /没能确认存进去/);
    assert.doesNotMatch(handler, /已保存；下次打开打码时生效/);
});

test('the verified save writes now and reads the server copy back', () => {
    const fn = settings.slice(settings.indexOf('export async function saveSettingsNowAndVerify'));
    assert.match(fn, /await host\.saveSettings\(\)/);
    assert.match(fn, /\/api\/settings\/get/);
    assert.match(fn, /extension_settings\?\.\[MODULE_NAME\]/);
});

test('adding picked names saves right away', () => {
    const add = ui.slice(ui.indexOf("$('#rh_name_mask_candidates_add').on('click'"), ui.indexOf("$('#rh_name_mask_candidates_add').on('click'") + 1600);
    assert.match(add, /void saveNameMaskLists\(\)/);
});
