import test from 'node:test';
import assert from 'node:assert/strict';

const guard = await import('../src/startupGuard.js');

test('startup guard names third-party extensions found in an error stack', () => {
    const stack = [
        'TypeError: boom',
        '    at set (http://127.0.0.1:8000/scripts/extensions/third-party/menu-tidy/index.js:5:1)',
        '    at http://127.0.0.1:8000/scripts/extensions/third-party/%E8%8F%9C%E5%8D%95/index.js:2:3',
        '    at http://127.0.0.1:8000/scripts/extensions/third-party/menu-tidy/util.js:9:9',
        '    at http://127.0.0.1:8000/scripts/extensions/quick-reply/index.js:1:1',
    ].join('\n');
    assert.deepEqual(guard.foreignExtensionsInStack(stack), ['third-party/menu-tidy', 'third-party/%E8%8F%9C%E5%8D%95']);
});

test('startup guard ignores stacks without other extensions', () => {
    assert.deepEqual(guard.foreignExtensionsInStack('Error: x\n    at foo (http://h/script.js:1:1)'), []);
});

test('startup step runner keeps going after a failing step', () => {
    guard.startupGuardForTests.reset();
    const value = guard.runRabbitMirrorStartupStep('ok-step', () => 7);
    const failed = guard.runRabbitMirrorStartupStep('bad-step', () => { throw new Error('nope'); });
    assert.equal(value, 7);
    assert.equal(failed, undefined);
    assert.deepEqual(guard.startupGuardForTests.steps.map(step => [step.label, step.ok]), [['ok-step', true], ['bad-step', false]]);
});
