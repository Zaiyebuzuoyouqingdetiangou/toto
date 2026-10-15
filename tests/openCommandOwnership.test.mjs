import test from 'node:test';
import assert from 'node:assert/strict';
import { registerCommandOnParser, unregisterRabbitMirrorOpenCommand } from '../src/openCommand.js';

// Same overwrite semantics as SillyTavern's SlashCommandParser.addCommandObject.
function parser() {
    const commands = {};
    return { commands, addCommandObject(command) { commands[command.name] = command; for (const alias of command.aliases || []) commands[alias] = command; } };
}
const SlashCommand = { fromProps: props => ({ ...props }) };

test('another extension that already owns /兔子镜 keeps it', () => {
    const p = parser();
    const theirs = { name: '兔子镜', aliases: [] };
    p.commands['兔子镜'] = theirs;
    assert.equal(registerCommandOnParser(p, SlashCommand, () => {}), false);
    assert.equal(p.commands['兔子镜'], theirs);
    unregisterRabbitMirrorOpenCommand();
    assert.equal(p.commands['兔子镜'], theirs);
});

test('a taken alias is handed back while the name itself registers', () => {
    const p = parser();
    const theirs = { name: 'rabbitmirror', aliases: [] };
    p.commands.rabbitmirror = theirs;
    assert.equal(registerCommandOnParser(p, SlashCommand, () => {}), true);
    assert.equal(p.commands.rabbitmirror, theirs);
    assert.ok(p.commands['兔子镜']);
    unregisterRabbitMirrorOpenCommand();
    assert.equal(p.commands['兔子镜'], undefined);
    assert.equal(p.commands.rabbitmirror, theirs);
});

test('unregistering an old copy does not delete a newer copy’s command', () => {
    const p = parser();
    assert.equal(registerCommandOnParser(p, SlashCommand, () => {}), true);
    const newer = { ...p.commands['兔子镜'] };
    newer[Symbol.for('rabbit-mirror-open-command')] = true;
    p.commands['兔子镜'] = newer;
    unregisterRabbitMirrorOpenCommand();
    assert.equal(p.commands['兔子镜'], newer);
});
