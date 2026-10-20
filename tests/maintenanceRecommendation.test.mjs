import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/outputSanitizer/diagnostics.js', import.meta.url), 'utf8');
const start = source.indexOf('const ROUTES = Object.freeze([');
const end = source.indexOf('export function setMaintenanceRabbitState');
const chunk = source.slice(start, end).replace(/^export /gm, '');
const sandbox = {};
vm.runInNewContext(`${chunk}\nthis.getRabbitMirrorMaintenanceRecommendation = getRabbitMirrorMaintenanceRecommendation;`, sandbox);

test('maintenance recommendation names the style route for a CSS reason', () => {
    assert.equal(sandbox.getRabbitMirrorMaintenanceRecommendation('repairable', 'CSS 异常'), '推荐使用：🎨 样子不对');
});

test('maintenance recommendation stays empty while the mirror is healthy', () => {
    assert.equal(sandbox.getRabbitMirrorMaintenanceRecommendation('healthy', 'CSS 异常'), '');
});
