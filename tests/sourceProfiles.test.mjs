// 跟随主 API 和独立 API 各记一套开关：打开后切换生成方式，开关换成那一边记住的值；关着时切换不动开关。
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/vmLoader.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

test('switching the generation source swaps the remembered switch set', async () => {
    const runtime = createRuntime(root);
    const sm = await runtime.load('src/settings.js');
    const settings = sm.getSettings();
    Object.assign(settings, JSON.parse(JSON.stringify(sm.defaultSettings)));
    // 关着：切换不动开关。
    sm.updateSettings({ generationSource: 'follow', rabbitMirrorFaceCount: 3, materialTextureEnabled: true, builtinImageEnabled: true });
    sm.updateSettings({ generationSource: 'independent' });
    assert.equal(sm.getSettings().rabbitMirrorFaceCount, 3);
    assert.equal(sm.getSettings().materialTextureEnabled, true);
    sm.updateSettings({ generationSource: 'follow' });
    // 打开：两边都从现在的开关起步。
    sm.updateSettings({ sourceProfilesEnabled: true });
    assert.deepEqual(Object.keys(sm.getSettings().sourceProfiles).sort(), ['follow', 'independent']);
    assert.equal(sm.getSettings().sourceProfiles.independent.rabbitMirrorFaceCount, 3);
    // 跟随这边改成一面、关纹理、关生图；切到独立：还是三面、纹理开、生图开。
    sm.updateSettings({ rabbitMirrorFaceCount: 1, materialTextureEnabled: false, builtinImageEnabled: false, visualToneMode: 'dark' });
    sm.updateSettings({ generationSource: 'independent' });
    let current = sm.getSettings();
    assert.equal(current.generationSource, 'independent');
    assert.equal(current.rabbitMirrorFaceCount, 3);
    assert.equal(current.materialTextureEnabled, true);
    assert.equal(current.builtinImageEnabled, true);
    assert.equal(current.visualToneMode, 'normal');
    assert.equal(current.darkVisualMode, false, 'dark switch follows the tone mode of that side');
    // 跟随那边的改动记住了：切回去还是一面、纹理关、深色。
    sm.updateSettings({ generationSource: 'follow' });
    current = sm.getSettings();
    assert.equal(current.rabbitMirrorFaceCount, 1);
    assert.equal(current.materialTextureEnabled, false);
    assert.equal(current.visualToneMode, 'dark');
    assert.equal(current.darkVisualMode, true);
    // 文字框两边共用：不在记的名单里。
    assert.ok(!sm.SOURCE_PROFILE_KEYS.includes('visualPrompt'));
    assert.ok(!sm.SOURCE_PROFILE_KEYS.includes('writingStyle'));
    // 关掉再打开：两边都从现在的开关起步，不翻出以前记的那一套。
    sm.updateSettings({ sourceProfilesEnabled: false });
    assert.equal(sm.getSettings().sourceProfiles, null);
    sm.updateSettings({ sourceProfilesEnabled: true });
    sm.updateSettings({ generationSource: 'independent' });
    assert.equal(sm.getSettings().rabbitMirrorFaceCount, 1, 'fresh start, not the old independent set');
    sm.updateSettings({ generationSource: 'follow' });
    // 关掉：以现在这一套为准，切换不再换。
    sm.updateSettings({ sourceProfilesEnabled: false });
    sm.updateSettings({ generationSource: 'independent' });
    assert.equal(sm.getSettings().rabbitMirrorFaceCount, 1);
    assert.equal(sm.getSettings().materialTextureEnabled, false);
});
