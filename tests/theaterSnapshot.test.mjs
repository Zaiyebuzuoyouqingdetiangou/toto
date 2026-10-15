import test from 'node:test';
import assert from 'node:assert/strict';
import { collectTheaterSnapshots, theaterSnapshotPage, THEATER_SNAPSHOT_PAGE_SIZE, snapshotTitleFromHtml, snapshotUsesVirtualChat } from '../src/theaterSnapshot.js';

const mirror = (title, body = '正文') => `<toto data-rabbit-mirror="true"><details><summary>【兔子镜：${title}】</summary><p>${body}</p></details></toto>`;

function chatOf(count) {
    const chat = [];
    for (let index = 0; index < count; index += 1) {
        chat.push(index % 2 === 0
            ? { is_user: true, mes: '用户' }
            : { is_user: false, mes: `故事 ${index}\n${mirror(`第${index}面`)}` });
    }
    return chat;
}

test('virtual chat is handed to the host jump instead of scrolling the list', () => {
    assert.equal(snapshotUsesVirtualChat({ chatLength: 100, mountedCount: 20, hasShowMore: false }), true);
    assert.equal(snapshotUsesVirtualChat({ chatLength: 100, mountedCount: 20, hasShowMore: true }), false);
    assert.equal(snapshotUsesVirtualChat({ chatLength: 20, mountedCount: 20, hasShowMore: false }), false);
    assert.equal(snapshotUsesVirtualChat({ chatLength: 0, mountedCount: 0, hasShowMore: false }), false);
});

test('snapshot keeps assistant mirrors newest first and pages by ten', () => {
    const items = collectTheaterSnapshots(chatOf(50));
    assert.equal(items.length, 25);
    assert.equal(items[0].mesid, 49);
    assert.equal(items.at(-1).mesid, 1);
    assert.equal(THEATER_SNAPSHOT_PAGE_SIZE, 10);
    const first = theaterSnapshotPage(items, 0);
    const last = theaterSnapshotPage(items, 99);
    assert.deepEqual(first.items.map(item => item.mesid), [49, 47, 45, 43, 41, 39, 37, 35, 33, 31]);
    assert.equal(last.page, 2);
    assert.deepEqual(last.items.map(item => item.mesid), [9, 7, 5, 3, 1]);
    assert.equal(first.items[0].title, '【兔子镜：第49面】');
});

test('snapshot skips bare assistant floors and in-progress placeholders', () => {
    const chat = [
        { is_user: false, mes: '只有故事，没有兔子镜' },
        { is_user: false, mes: '<details class="rabbit-mirror-external-placeholder"><summary>【兔子镜：正在生成中……】</summary></details>' },
        { is_user: true, mes: mirror('不该收用户楼') },
    ];
    assert.deepEqual(collectTheaterSnapshots(chat), []);
});

test('snapshot keeps a failed floor that has no finished mirror', () => {
    const chat = [
        { is_user: false, mes: '正文还在。兔子镜本批生成失败（第 1/1 面）：超时。不会自动重发。' },
        { is_user: false, mes: mirror('完好的') },
        { is_user: false, mes: '这一层正文还在，兔子镜挂在页面上失败了。' },
    ];
    const items = collectTheaterSnapshots(chat, { domErrors: [{ mesid: 2, text: '独立 API 生成失败。' }] });
    assert.equal(items.length, 3);
    assert.equal(items[0].kind, 'error');
    assert.equal(items[0].mesid, 2);
    assert.match(items[0].errorText, /独立 API 生成失败/);
    assert.equal(items[1].kind, 'ready');
    assert.equal(items[2].kind, 'error');
    assert.match(items[2].errorText, /本批生成失败/);
});

test('snapshot shows a face-failure mirror and the saved independent html for the current swipe', () => {
    const failed = '<toto data-rabbit-mirror="true"><details data-rabbit-mirror-face-failure="incomplete-face"><summary>【兔子镜：第 2 面未完成】</summary><p>未通过检查</p></details></toto>';
    const chat = [
        { is_user: false, swipe_id: 1, mes: '旧正文', swipes: ['旧', '当前正文没有标签'] },
        { is_user: false, mes: failed },
    ];
    const items = collectTheaterSnapshots(chat, {
        persisted: [
            { index: 0, swipe: 0, html: mirror('旧版') },
            { index: 0, swipe: 1, html: mirror('当前存档') },
        ],
    });
    assert.equal(items.length, 2);
    assert.equal(items[0].mesid, 1);
    assert.equal(items[0].failed, true);
    assert.equal(snapshotTitleFromHtml(items[0].html), '【兔子镜：第 2 面未完成】');
    assert.equal(items[1].title, '【兔子镜：当前存档】');
    assert.equal(items[1].swipe, 1);
});

test('ordinary replies that merely mention 生成失败 or 面未完成 are not listed as failed mirrors', () => {
    const chat = [
        { is_user: true, mes: '用户' },
        { is_user: false, mes: '图片生成失败了，再试一次吧。' },
        { is_user: true, mes: '用户' },
        { is_user: false, mes: '第二面未完成的稿子还压在桌上。' },
        { is_user: true, mes: '用户' },
        { is_user: false, mes: '<toto data-rabbit-mirror="true"><details><summary>【兔子镜：生成失败】</summary><p>原因</p></details></toto>' },
    ];
    const items = collectTheaterSnapshots(chat);
    assert.deepEqual(items.map(item => item.mesid), [5]);
    assert.equal(items[0].failed, true);
});
