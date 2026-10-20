// 像素小屋的写法要完整发给模型：不管母本原文策略是哪一档（精简、平衡），做法那几行都不能被截掉或去重成空。
import test from 'node:test';
import assert from 'node:assert/strict';
import { PRESENTATION_FORMATS } from '../data/structured/presentationIndex.js';
import { resolveRawSnippetForItem } from '../data/raw/rawSegmentLookup.js';
import { FORMAT_USAGES } from '../data/raw/formatUsages.js';

test('10.2.32 carries its full how-to as a supplement', () => {
    // 举例只用一颗心：举成人物时模型会照抄那个 5 行的小脑袋，每个人都长一样。
    const item = PRESENTATION_FORMATS.find(entry => entry.id === '10.2.32');
    assert.ok(item);
    assert.equal(item.fullRaw, true);
    assert.ok(item.summary.length <= 170, 'summary fits the balanced/compact cut');
    const supplement = resolveRawSnippetForItem(item, 'presentation', Infinity);
    for (const part of ['data-rm-pixel-scene="120x68"', 'shape-rendering="crispEdges"', '<i data-rm-sprite=".r.r./rrrrr/', 'data-rm-palette="r #e06a86"', 'data-rm-at="60,20"', '人物画全身', '不再另写 left、top', '点是透明', 'steps()']) {
        assert.ok(supplement.includes(part), part);
    }
    assert.ok(FORMAT_USAGES['10.2.32']?.length >= 3);

    assert.ok(!supplement.includes('..hhhh..'), 'no copyable person example');
});
