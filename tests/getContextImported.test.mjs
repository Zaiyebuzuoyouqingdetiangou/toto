import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src', import.meta.url));
const files = dir => readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : path.endsWith('.js') ? [path] : [];
});

test('every module that calls a bare getContext() imports or defines it', () => {
    const missing = files(root).filter(path => {
        const source = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
        const calls = /(^|[^.\w$])getContext\s*\(/m.test(source.replace(/function\s+getContext\s*\(/g, ''));
        if (!calls) return false;
        const provided = /import\s*\{[^}]*\bgetContext\b[^}]*\}/.test(source)
            || /function\s+getContext\s*\(/.test(source)
            || /(const|let|var)\s+getContext\b/.test(source)
            || /\{\s*[^}]*\bgetContext\b[^}]*\}\s*=/.test(source);
        return !provided;
    }).map(path => path.slice(root.length + 1));
    assert.deepEqual(missing, [], '漏了 import 的 getContext 在浏览器里是未定义，typeof 判断会悄悄跳过整条补读路径');
});
