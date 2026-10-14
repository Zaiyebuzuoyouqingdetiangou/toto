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

test('diagnostic text drops hosts and quoted snippets', () => {
    const { shortPath, errorText, errorStack } = guard.startupGuardForTests;
    assert.equal(shortPath('at x (http://192.168.1.5:8000/scripts/extensions/third-party/foo/a.js:1:1)'), 'at x (extensions/third-party/foo/a.js:1:1)');
    assert.equal(shortPath('at y (https://my.host.example/script.js:2:2)'), 'at y (/script.js:2:2)');
    const err = new SyntaxError('Unexpected token \'o\', "{"secret chat text"}" is not valid JSON');
    assert.ok(!errorText(err).includes('secret'));
    const multi = new Error('first line\n"second line secret"');
    assert.ok(!errorText(multi).includes('secret'));
    assert.ok(!errorStack(multi).includes('secret'));
    assert.match(errorStack(multi), /at /);
});

test('index.js imports the startup guard first and marks evaluation', async () => {
    const { readFile } = await import('node:fs/promises');
    const source = await readFile(new URL('../index.js', import.meta.url), 'utf8');
    const firstImport = source.split('\n').find(line => line.startsWith('import '));
    assert.match(firstImport, /from '\.\/src\/startupGuard\.js\?rmv=/);
    assert.match(source, /^markRabbitMirrorBootstrapEvaluated\(\);$/m);
});

test('/兔子镜 command registers with alias and only removes its own entries', async () => {
    const { registerRabbitMirrorOpenCommand, unregisterRabbitMirrorOpenCommand } = await import('../src/openCommand.js');
    const commands = {};
    const parser = { commands, addCommandObject(command) { commands[command.name] = command; for (const alias of command.aliases) commands[alias] = command; } };
    const previous = globalThis.SillyTavern;
    let opened = 0;
    globalThis.SillyTavern = { getContext: () => ({ SlashCommandParser: parser, SlashCommand: { fromProps: props => ({ ...props }) } }) };
    try {
        assert.equal(registerRabbitMirrorOpenCommand(() => { opened += 1; }), true);
        assert.equal(commands['兔子镜'], commands.rabbitmirror);
        assert.equal(commands['兔子镜'].callback(), '');
        assert.equal(opened, 1);
        const other = { name: 'rabbitmirror' };
        commands.rabbitmirror = other;
        unregisterRabbitMirrorOpenCommand();
        assert.equal(commands['兔子镜'], undefined);
        assert.equal(commands.rabbitmirror, other);
        globalThis.SillyTavern = { getContext: () => ({}) };
        assert.equal(registerRabbitMirrorOpenCommand(() => {}), false);
    } finally {
        globalThis.SillyTavern = previous;
    }
});
