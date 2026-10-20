import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/vmLoader.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const entry = (library, kind, suffix, extra = {}) => ({
    externalId: `ext:${library}:${kind}:${suffix}`, classification: kind,
    enabled: true, userConfirmed: true, ...extra,
});
const plain = value => JSON.parse(JSON.stringify(value));

async function fixture() {
    const runtime = createRuntime(root);
    const pool = await runtime.load('src/externalWorldBook/externalPool.js');
    const { externalCandidateCounts } = await runtime.load('src/externalWorldBook/candidateCounts.js');
    return { pool, count: id => plain(externalCandidateCounts(pool.getExternalPoolSnapshot(), id)) };
}

test('candidate counts follow the real eligible pool rather than imported category totals', async () => {
    const { pool, count } = await fixture();
    pool.setExternalPoolSnapshot([{ libraryId: 'a', enabled: true, entryCount: 1000 }], new Map([['a', [
        entry('a', 'theme', 'yes'), entry('a', 'format', 'yes'), entry('a', 'text', 'yes'),
        entry('a', 'text', 'unchecked', { enabled: false }),
        entry('a', 'text', 'unconfirmed', { userConfirmed: false }),
        entry('a', 'auxiliary', 'aux'), entry('a', 'pending', 'pending'),
    ]]]));
    assert.deepEqual(count('a'), { theme: 1, format: 1, text: 1, total: 3 });
    assert.deepEqual(count('absent'), { theme: 0, format: 0, text: 0, total: 0 });
});

test('disabled libraries remain at zero even when they contain enabled confirmed entries', async () => {
    const { pool, count } = await fixture();
    pool.setExternalPoolSnapshot([{ libraryId: 'a', enabled: false }, { libraryId: 'b', enabled: true }], new Map([
        ['a', [entry('a', 'text', 'yes')]], ['b', [entry('b', 'text', 'yes')]],
    ]));
    assert.deepEqual(count('a'), { theme: 0, format: 0, text: 0, total: 0 });
    assert.deepEqual(count('b'), { theme: 0, format: 0, text: 1, total: 1 });
});

test('counts track refreshed ID-only metadata after checkbox changes without raw material', async () => {
    const { pool, count } = await fixture();
    const library = { libraryId: 'a', enabled: true };
    const entries = [entry('a', 'text', 'one'), entry('a', 'text', 'two')];
    const refresh = () => pool.setExternalPoolMetadataSnapshot([library], [pool.externalPoolMetadataForLibrary(library, entries)]);
    refresh();
    assert.equal(count('a').text, 2);
    entries[0].enabled = false;
    refresh();
    assert.equal(count('a').text, 1);
    entries[1].enabled = false;
    refresh();
    assert.equal(count('a').total, 0);
    entries[0].enabled = true;
    refresh();
    assert.equal(count('a').text, 1);
});
