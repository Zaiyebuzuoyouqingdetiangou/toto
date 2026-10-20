import test from 'node:test';
import assert from 'node:assert/strict';
import { describeBatchPlanFailure, describeExternalWorldBookPreflightFailure } from '../src/externalWorldBook/errors.js';

// 1.68.42：逐面设置／世界书抽签的失败原因以前不在说明表里，
// 经外部准备链路包装后一律显示成「具体原因尚未确认 BATCH_PLAN_INVALID」。

test('face-draw and lottery reason codes carry their own explanation', () => {
    for (const code of ['FACE_DRAW_EMPTY', 'FACE_DRAW_REQUIRED_UNAVAILABLE', 'FACE_DRAW_SELECTION_TOO_LARGE',
        'FACE_DRAW_POOL_EXHAUSTED', 'FACE_DRAW_CURSOR_UNAVAILABLE', 'LOTTERY_WORLD_BOOK_EMPTY']) {
        const reason = describeBatchPlanFailure(code);
        assert.equal(reason.code, code);
        assert.ok(!reason.message.includes('尚未确认'), code);
    }
    assert.equal(describeBatchPlanFailure('SOMETHING_ELSE').code, 'BATCH_PLAN_INVALID');
});

test('preflight wrapper keeps the face number and the real reason, never the entry names', () => {
    const error = Object.assign(new Error('第 2 面的主题元素：常驻条目不可用：秘密条目甲。 本次尚未发送请求。'), {
        code: 'MULTIFACE_PLAN_UNAVAILABLE', reasonCode: 'FACE_DRAW_REQUIRED_UNAVAILABLE', faceIndex: 1, requestCount: 0,
    });
    const explained = describeExternalWorldBookPreflightFailure(error);
    assert.equal(explained.reasonCode, 'FACE_DRAW_REQUIRED_UNAVAILABLE');
    assert.match(explained.message, /^本轮多面抽取计划无法建立：第 2 面：/);
    assert.ok(explained.message.includes('诊断原因：FACE_DRAW_REQUIRED_UNAVAILABLE'));
    assert.ok(!explained.message.includes('秘密条目甲'));
    assert.ok(!explained.message.includes('尚未确认'));

    const noFace = describeExternalWorldBookPreflightFailure(Object.assign(new Error('x'), { code: 'MULTIFACE_PLAN_UNAVAILABLE', reasonCode: 'LOTTERY_WORLD_BOOK_EMPTY' }));
    assert.ok(!noFace.message.includes('第 '));
    assert.ok(noFace.message.includes('世界书抽签'));

    const bogusFace = describeExternalWorldBookPreflightFailure(Object.assign(new Error('x'), { code: 'MULTIFACE_PLAN_UNAVAILABLE', reasonCode: 'FACE_DRAW_EMPTY', faceIndex: 99 }));
    assert.ok(!bogusFace.message.includes('第 100 面'));
});
