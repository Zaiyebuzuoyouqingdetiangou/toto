import test from 'node:test';
import assert from 'node:assert/strict';

function detect({ manifests, types, disabled = [], renderer = [] }) {
  const isDeferred = name => ['local', 'global'].includes(types[name]);
  const decorators = Object.entries(manifests)
    .filter(([name, manifest]) => isDeferred(name)
      && !disabled.includes(name)
      && manifest?.generate_interceptor === 'rabbitMirrorGenerateInterceptor'
      && typeof manifest.js === 'string'
      && manifest.js.split(/[?#]/)[0] === 'tt-entry.js')
    .map(([internalName]) => ({ extensionName: 'RabbitMirror', participantId: 'rabbitmirror/message-runtime', internalName }));
  if (decorators.length > 1) throw new Error('multiple RabbitMirror');
  return [...renderer, ...decorators];
}

const rm = { generate_interceptor: 'rabbitMirrorGenerateInterceptor', js: 'tt-entry.js?rmv=1.5.49-ttimmediate1' };
test('1.5.49 manifest with cache-bust is detected', () => {
  const out = detect({ manifests: { 'third-party/RabbitMirror': rm }, types: { 'third-party/RabbitMirror': 'local' } });
  assert.equal(out.length, 1);
  assert.equal(out[0].participantId, 'rabbitmirror/message-runtime');
});
test('disabled RabbitMirror is not preactivated', () => {
  const out = detect({ manifests: { 'third-party/RabbitMirror': rm }, types: { 'third-party/RabbitMirror': 'local' }, disabled: ['third-party/RabbitMirror'] });
  assert.equal(out.length, 0);
});
test('wrong entry is not mistaken for RabbitMirror', () => {
  const out = detect({ manifests: { 'third-party/X': { ...rm, js: 'index.js' } }, types: { 'third-party/X': 'local' } });
  assert.equal(out.length, 0);
});
test('renderer requirement is preserved alongside RabbitMirror decorator', () => {
  const renderer = [{ extensionName: 'JS-Slash-Runner', participantId: 'js-slash-runner/message-runtime', internalName: 'third-party/JS-Slash-Runner' }];
  const out = detect({ manifests: { 'third-party/RabbitMirror': rm }, types: { 'third-party/RabbitMirror': 'global' }, renderer });
  assert.equal(out.length, 2);
  assert.equal(out[0].participantId, 'js-slash-runner/message-runtime');
  assert.equal(out[1].participantId, 'rabbitmirror/message-runtime');
});
test('multiple enabled RabbitMirror installs fail closed', () => {
  assert.throws(() => detect({ manifests: { a: rm, b: rm }, types: { a: 'local', b: 'global' } }), /multiple RabbitMirror/);
});
