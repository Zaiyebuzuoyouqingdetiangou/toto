// 一键补楼层的排队器：按楼层从早到晚一层一层来、不同时发；跳过的不等；连着失败自动暂停；能暂停、继续、停止；换聊天整队停。
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBackfillQueue, describeBackfill } from '../src/backfillQueue.js';

const tick = () => new Promise(resolve => setImmediate(resolve));
async function until(check, label) {
    for (let i = 0; i < 500; i++) { if (check()) return; await tick(); }
    assert.fail(`timed out: ${label}`);
}

test('runs floors oldest first, one at a time, waits between real requests only', async () => {
    const calls = [];
    let running = 0, maxRunning = 0;
    const waits = [];
    const q = createBackfillQueue({
        run: async floor => {
            running++; maxRunning = Math.max(maxRunning, running);
            calls.push(floor);
            await tick();
            running--;
            return floor === 5 ? { status: 'skipped', message: '已经有兔子镜了' } : { status: 'done' };
        },
        wait: ms => { waits.push(ms); return Promise.resolve(); },
        gapMs: 3000,
    });
    assert.equal(q.start([9, 3, 5, 3, -1, 'x']), true);
    assert.equal(q.start([1]), false, 'a second start while running is refused');
    await q.finished();
    assert.deepEqual(calls, [3, 5, 9]);
    assert.equal(maxRunning, 1);
    // 3 成功后等一次；5 跳过不等；9 是最后一层不等。
    assert.deepEqual(waits, [3000]);
    const view = q.snapshot();
    assert.equal(view.status, 'finished');
    assert.deepEqual(view.done, [3, 9]);
    assert.deepEqual(view.skipped, [{ floor: 5, message: '已经有兔子镜了' }]);
    assert.match(describeBackfill(view), /补完了：一共 3 层，成功 2 层，跳过 1 层（已经有兔子镜了）/);
});

test('three failures in a row pause the queue; resume continues where it stopped', async () => {
    const calls = [];
    const q = createBackfillQueue({
        run: async floor => { calls.push(floor); return floor < 4 ? { status: 'failed', message: '429 Too Many Requests' } : { status: 'done' }; },
        wait: () => Promise.resolve(),
    });
    q.start([1, 2, 3, 4, 5]);
    await until(() => q.snapshot().status === 'paused', 'auto pause');
    assert.deepEqual(calls, [1, 2, 3]);
    const paused = q.snapshot();
    assert.match(paused.note, /连着 3 层都没生成成功，先停下了。最后一层的原因：429 Too Many Requests/);
    assert.match(describeBackfill(paused), /进度 3\/5.*没成 3 层：#1、#2、#3/s);
    await tick(); await tick();
    assert.deepEqual(calls, [1, 2, 3], 'stays paused');
    q.resume();
    await q.finished();
    assert.deepEqual(calls, [1, 2, 3, 4, 5]);
    const view = q.snapshot();
    assert.equal(view.status, 'finished');
    assert.deepEqual(view.failed.map(item => item.floor), [1, 2, 3]);
    assert.equal(view.failed[0].message, '429 Too Many Requests');
    assert.match(describeBackfill(view), /最后没成的那层原因：429 Too Many Requests\n没成的那几层下面挂着卡/);
});

test('a failure on the last floor does not pause a finished queue', async () => {
    const q = createBackfillQueue({ run: async () => ({ status: 'failed' }), wait: () => Promise.resolve() });
    q.start([1, 2, 3]);
    await q.finished();
    assert.equal(q.snapshot().status, 'finished');
});

test('stop lets the current floor finish and sends nothing more', async () => {
    const calls = [];
    let release;
    const q = createBackfillQueue({
        run: floor => { calls.push(floor); return new Promise(resolve => { release = () => resolve({ status: 'done' }); }); },
        wait: () => new Promise(() => {}), // 间隔永远等不完：只能靠停止叫醒
    });
    q.start([1, 2, 3]);
    await until(() => calls.length === 1, 'first floor started');
    assert.equal(q.stop(), true);
    assert.equal(q.snapshot().status, 'stopping');
    assert.match(describeBackfill(q.snapshot()), /正在停下/);
    release();
    await q.finished();
    assert.deepEqual(calls, [1]);
    const view = q.snapshot();
    assert.equal(view.status, 'stopped');
    assert.deepEqual(view.done, [1]);
    assert.match(describeBackfill(view), /已停止：补了 1\/3 层/);
    assert.equal(q.reset(), true);
    assert.equal(q.snapshot().status, 'idle');
});

test('stop during the gap wakes up immediately', async () => {
    const calls = [];
    const q = createBackfillQueue({ run: async floor => { calls.push(floor); return { status: 'done' }; }, wait: () => new Promise(() => {}) });
    q.start([1, 2]);
    await until(() => q.snapshot().position === 1, 'first done');
    q.stop();
    await q.finished();
    assert.deepEqual(calls, [1]);
    assert.equal(q.snapshot().status, 'stopped');
});

test('a run that says stopped (chat switched) ends the whole queue with its reason', async () => {
    const calls = [];
    const q = createBackfillQueue({
        run: async floor => { calls.push(floor); return floor === 2 ? { status: 'stopped', message: '聊天已经换了' } : { status: 'done' }; },
        wait: () => Promise.resolve(),
    });
    q.start([1, 2, 3]);
    await q.finished();
    assert.deepEqual(calls, [1, 2]);
    const view = q.snapshot();
    assert.equal(view.status, 'stopped');
    assert.match(describeBackfill(view), /已停止（聊天已经换了）/);
});

test('waits while the tavern or another mirror request is busy', async () => {
    const calls = [];
    let busy = true;
    let polls = 0;
    const seen = [];
    const q = createBackfillQueue({
        run: async floor => { calls.push(floor); return { status: 'done' }; },
        busy: () => busy,
        onChange: view => { if (view.waiting) seen.push(describeBackfill(view)); },
        wait: () => { polls++; if (polls >= 3) busy = false; return Promise.resolve(); },
    });
    q.start([7]);
    await q.finished();
    assert.ok(polls >= 3);
    assert.deepEqual(calls, [7]);
    assert.match(seen[0], /酒馆正在生成.*等它结束再接着补/);
});

test('pause between floors holds the next floor until resume', async () => {
    const calls = [];
    const q = createBackfillQueue({ run: async floor => { calls.push(floor); return { status: 'done' }; }, wait: () => new Promise(() => {}) });
    q.start([1, 2]);
    await until(() => q.snapshot().position === 1, 'first done');
    q.pause();
    await tick(); await tick();
    assert.deepEqual(calls, [1]);
    assert.match(describeBackfill(q.snapshot()), /已暂停。进度 1\/2/);
    q.resume();
    await q.finished();
    assert.deepEqual(calls, [1, 2]);
});

test('a thrown error counts as a failure and the queue keeps going', async () => {
    const q = createBackfillQueue({ run: async floor => { if (floor === 1) throw new Error('网络断了'); return { status: 'done' }; }, wait: () => Promise.resolve() });
    q.start([1, 2]);
    await q.finished();
    const view = q.snapshot();
    assert.deepEqual(view.failed, [{ floor: 1, message: '网络断了' }]);
    assert.deepEqual(view.done, [2]);
});

test('waiting a long time on a busy tavern says how to get out', async () => {
    let clock = 0;
    const views = [];
    const q = createBackfillQueue({
        run: async () => ({ status: 'done' }),
        busy: () => true,
        now: () => clock,
        onChange: view => views.push(view),
        wait: () => new Promise(resolve => setImmediate(resolve)),
    });
    q.start([1]);
    await until(() => q.snapshot().waiting, 'waiting');
    assert.doesNotMatch(describeBackfill(views.at(-1)), /等了一阵子/);
    clock = 120_000;
    // 界面靠 onChange 刷新：等着的时候每轮都要刷一次，提示才看得见。
    await until(() => /已经等了一阵子/.test(describeBackfill(views.at(-1))), 'long wait shown through onChange');
    assert.match(describeBackfill(views.at(-1)), /已经等了一阵子。如果酒馆其实没在生成，可以点「停止」/);
    q.stop();
    await q.finished();
    assert.equal(q.snapshot().status, 'stopped');
});

test('an empty list does not start', () => {
    const q = createBackfillQueue({ run: async () => ({ status: 'done' }) });
    assert.equal(q.start([]), false);
    assert.equal(q.snapshot().status, 'idle');
    assert.equal(describeBackfill(q.snapshot()), '');
});
