import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createRuntime } from './helpers/vmLoader.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = fs.readFileSync(path.join(root, 'src/independentApi.js'), 'utf8');

test('Chinese context tag names survive settings normalization and deduplicate', async () => {
  const runtime = createRuntime(root);
  const settings = await runtime.load('src/settings.js');
  assert.deepEqual(
    [...settings.normalizeIndependentContextExcludedTags(['<角色手机>', '幕后故事', '</幕后摘记>', '主持评价', 'THINKING', '角色手机'])],
    ['角色手机', '幕后故事', '幕后摘记', '主持评价', 'thinking'],
  );
});

test('context tag parser accepts Unicode letter names in raw and encoded filtering paths', () => {
  assert.match(source, /\\p\{L\}.*\\p\{N\}/);
  assert.match(source, /new RegExp\([^\n]+,'giu'\)/);
  assert.match(source, /toLocaleLowerCase\(\)/);
});

test('builtin independent generation captures the final owner before dispatch', () => {
  const marker = "details=buildRabbitMirrorPromptDetails(st,'independent',null,generationScopeKey,generationContext);";
  const start = source.indexOf(marker);
  assert.ok(start >= 0);
  const nearby = source.slice(start, start + 900);
  assert.match(nearby, /promptOwner=captureIndependentPromptOwner\(ctx,index,msg,signal,requestOptions,generationScopeKey\)/);
  assert.match(nearby, /bindIndependentPromptBatch\(promptOwner,details\.batchPlan\|\|null\)/);
});

test('request sizing uses actual final request rather than an arbitrary 8000-char reserve', () => {
  assert.doesNotMatch(source, /availableContextChars<8000/);
  assert.match(source, /if\(totalRequestChars>MAX_INDEPENDENT_REQUEST_CHARS\)/);
  assert.match(source, /RABBIT_MIRROR_REQUEST_TOO_LARGE/);
});
