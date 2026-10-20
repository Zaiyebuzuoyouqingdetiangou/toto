import test from 'node:test';
import assert from 'node:assert/strict';
import { pickMovedIndependentRecord, pickOwnStaleRecord } from '../src/independentApi/movedRecord.js';

const opts = (chatHashes, wanted = 'H5') => ({
    index: 5,
    matches: record => record.sourceHash === wanted || record.bodyHash === wanted,
    ownHashes: floor => [chatHashes[floor] || ''],
});

test('finds a mirror saved under a shifted floor number by body fingerprint', () => {
    const chat = { 5: 'H5', 6: 'H6', 7: 'H7' };
    const picked = pickMovedIndependentRecord([
        { record: { html: '<toto>a</toto>', sourceHash: 'H6', ts: 3 }, from: { index: 6, swipe: 0 } },
        { record: { html: '<toto>b</toto>', sourceHash: 'H5', ts: 2 }, from: { index: 6, swipe: 0 } },
    ], opts(chat));
    assert.equal(picked.record.html, '<toto>b</toto>');
    assert.equal(picked.from.index, 6);
});

test('a record that matches its own floor body stays with that floor', () => {
    const chat = { 5: 'H5', 6: 'H5' }; // 两层正文一模一样
    const picked = pickMovedIndependentRecord([
        { record: { html: '<toto>x</toto>', sourceHash: 'H5', ts: 9 }, from: { index: 6, swipe: 0 } },
    ], opts(chat));
    assert.equal(picked, null);
});

test('deleted, empty, unrestorable and non-matching records are ignored; newest wins', () => {
    const chat = { 5: 'H5' };
    const picked = pickMovedIndependentRecord([
        { record: { deleted: true, html: '<toto>d</toto>', sourceHash: 'H5', ts: 99 }, from: { index: 9, swipe: 0 } },
        { record: { html: '', sourceHash: 'H5', ts: 98 }, from: { index: 9, swipe: 0 } },
        { record: { html: 'bad', sourceHash: 'H5', ts: 97 }, from: { index: 9, swipe: 0 } },
        { record: { html: '<toto>other</toto>', sourceHash: 'H8', ts: 96 }, from: { index: 9, swipe: 0 } },
        { record: { html: '<toto>old</toto>', bodyHash: 'H5', ts: 1 }, from: { index: 12, swipe: 0 } },
        { record: { html: '<toto>new</toto>', sourceHash: 'H5', ts: 5 }, from: { index: 11, swipe: 1 } },
    ], { ...opts(chat), restorable: html => html !== 'bad' });
    assert.equal(picked.record.html, '<toto>new</toto>');
});

test('floors past the end of the chat (deleted messages) can still hand back their record', () => {
    const picked = pickMovedIndependentRecord([
        { record: { html: '<toto>t</toto>', sourceHash: 'H5', ts: 1 }, from: { index: 40, swipe: 0 } },
    ], opts({ 5: 'H5' }));
    assert.equal(picked.from.index, 40);
});

test('a mirror set aside by an earlier recovery (no floor) can be picked by its own reply', () => {
    const picked = pickMovedIndependentRecord([
        { record: { html: '<toto>aside</toto>', sourceHash: 'H5', ts: 1 }, from: { index: null, swipe: 0, moved: 'H5' } },
        { record: { html: '<toto>nope</toto>', sourceHash: 'H5', ts: 9 }, from: { index: 'x', swipe: 0 } },
    ], opts({ 5: 'H5', 7: 'H7' }));
    assert.equal(picked.record.html, '<toto>aside</toto>');
    assert.equal(picked.from.moved, 'H5');
});

test('own-floor record with an edited body is picked when its hash belongs to no other floor', () => {
    const picked = pickOwnStaleRecord([
        { record: { html: '<toto>mine</toto>', sourceHash: 'OLD5', ts: 2 }, from: { index: 5, swipe: 0 } },
        { record: { html: '<toto>older</toto>', sourceHash: 'OLDER5', ts: 1 }, from: { index: 5, swipe: 0 } },
        { record: { html: '<toto>other</toto>', sourceHash: 'H7', ts: 9 }, from: { index: 7, swipe: 0 } },
    ], { index: 5, otherHashes: ['H6', 'H7'] });
    assert.equal(picked.record.html, '<toto>mine</toto>');
});

test('own-floor record whose hash matches another floor is a shifted record, not an edited one', () => {
    const picked = pickOwnStaleRecord([
        { record: { html: '<toto>shifted</toto>', sourceHash: 'H6', ts: 2 }, from: { index: 5, swipe: 0 } },
    ], { index: 5, otherHashes: ['H6'] });
    assert.equal(picked, null);
});
