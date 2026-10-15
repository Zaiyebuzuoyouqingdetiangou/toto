// 写法清单：不同时给「开关切换」和「弹窗」；最近用过这两种时，这一面一种都不给。
import test from 'node:test';
import assert from 'node:assert/strict';

test('toggle and popup never arrive together, and are skipped after recent use', async () => {
    const store = new Map();
    globalThis.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, String(value)), removeItem: key => store.delete(key) };
    const { drawDriverOffer } = await import('../src/interactionMethods.js');
    // 用法里同时有「播放旧照片」（多半配开关）和「点开回忆一段」（多半配弹窗）：最容易凑成一对的情况。
    const usages = ['播放旧照片', '翻到下一页讲稿', '点开回忆一段'];
    let sawToggle = 0, sawPopup = 0;
    for (let i = 0; i < 300; i++) {
        const offer = drawDriverOffer({ usages });
        assert.ok(!(offer.includes('toggle') && offer.includes('popup')), `together: ${offer}`);
        assert.equal(new Set(offer).size, offer.length);
        if (offer.includes('toggle')) sawToggle++;
        if (offer.includes('popup')) sawPopup++;
        const avoided = drawDriverOffer({ usages, avoidSwitchPopup: true });
        assert.ok(!avoided.includes('toggle') && !avoided.includes('popup'), `avoided: ${avoided}`);
        assert.ok(avoided.length >= 2);
    }
    assert.ok(sawToggle + sawPopup > 0, 'they still appear when not recently used');
    delete globalThis.localStorage;
});
