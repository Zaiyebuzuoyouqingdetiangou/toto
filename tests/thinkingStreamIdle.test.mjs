// 会思考的模型：开头只发一个空帧或保活，然后安静地想很久。没写出字之前不启动「没动静就掐断」；开始写字后照常计时。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src = readFileSync(new URL('../src/independentApi/flights.js', import.meta.url), 'utf8');
const fn = src.match(/export function createIndependentRequestDeadline\([^]*?\n}\n/)[0].replace(/^export /, '');
function makeDeadline() {
    const timers = new Map(); let seq = 0; let now = 0; const fired = [];
    const ctx = vm.createContext({
        Date: { now: () => now },
        setTimeout: (cb, ms) => { seq += 1; timers.set(seq, { at: now + ms, cb }); return seq; },
        clearTimeout: id => timers.delete(id),
        INDEPENDENT_REQUEST_ABSOLUTE_TIMEOUT_MS: 20 * 60 * 1000,
        configuredAutomaticRerollIdleMs: () => 90000, getSettings: () => ({}),
        stallTimeoutError: () => Object.assign(new Error('stall'), { code: 'stall' }),
    });
    vm.runInContext(`${fn}\nglobalThis.make = createIndependentRequestDeadline;`, ctx);
    const d = ctx.make({ abort() {} }, error => fired.push(error.code || error.message), { idleMs: 90000 });
    const advance = ms => {
        now += ms;
        for (const [id, t] of [...timers].sort((a, b) => a[1].at - b[1].at)) if (t.at <= now && timers.has(id)) { timers.delete(id); t.cb(); }
    };
    return { d, advance, fired };
}

test('an empty opening frame does not start the 90s silence limit', () => {
    const { d, advance, fired } = makeDeadline();
    d.progress('request-sent'); d.progress('response-headers'); d.progress('response-frame');
    advance(300000);
    assert.deepEqual(fired, [], 'thinking silently for 5 minutes is fine');
    d.progress('response-chunk');
    advance(91000);
    assert.deepEqual(fired, ['stall'], 'after text started, 90s of silence still stops it');
});

test('keepalive frames after text started keep it alive', () => {
    const { d, advance, fired } = makeDeadline();
    d.progress('request-sent'); d.progress('response-chunk');
    advance(60000); d.progress('response-frame'); advance(60000);
    assert.deepEqual(fired, []);
});

test('the next face of a serial batch starts counting from scratch again', () => {
    const { d, advance, fired } = makeDeadline();
    d.progress('request-sent'); d.progress('response-chunk'); d.progress('response-complete');
    d.progress('serial-face-start'); d.progress('request-sent'); d.progress('response-headers'); d.progress('response-frame');
    advance(300000);
    assert.deepEqual(fired, []);
});
