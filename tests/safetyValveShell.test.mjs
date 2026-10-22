// 安全阀拦下本轮自动生成（标签没闭合、正文太短）时，缺壳卡写明原因，不说成「旧镜面待恢复」。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { safetyValveShellMessage, SAFETY_VALVE_SHELL_PREFIX, MISSING_INDEPENDENT_RETRY_SHELL_MESSAGE } from '../src/independentApi/missingRetryShell.js';

test('safety-valve shell message keeps the reason and says it is not a lost old mirror', () => {
    const text = safetyValveShellMessage('正文结构未完整（<content> 标签未闭合，疑似截断）');
    assert.ok(text.startsWith(SAFETY_VALVE_SHELL_PREFIX));
    assert.match(text, /<content> 标签未闭合/);
    assert.match(text, /不是旧作品丢了/);
    assert.notEqual(text, MISSING_INDEPENDENT_RETRY_SHELL_MESSAGE);
});

test('missing-shell message and title use the safety-valve wording in automatic timing', () => {
    const early = readFileSync(new URL('../src/independentApi/earlyBody.js', import.meta.url), 'utf8');
    const fn = early.slice(early.indexOf('function missingIndependentHistoryMessage('), early.indexOf('const manualFillFloors'));
    assert.match(fn, /automaticIndependentTiming\(\)/);
    assert.match(fn, /floorMirrorEvidence\(ctx,index,msg\)/);
    assert.match(fn, /mainReplyAbnormalReason\(msg\)/);
    assert.match(fn, /safetyValveShellMessage\(reason\)/);
    const geometry = readFileSync(new URL('../src/independentApi/geometry.js', import.meta.url), 'utf8');
    assert.match(geometry, /startsWith\(SAFETY_VALVE_SHELL_PREFIX\)\) return '【兔子镜：本轮没有自动生成】'/);
});
