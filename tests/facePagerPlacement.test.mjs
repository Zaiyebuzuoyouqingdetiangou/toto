import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { placeFacePager, refreshFacePagerPositions } from '../src/facePagerPlacement.js';
import { createRuntime } from './helpers/vmLoader.mjs';

class Element {
    constructor(tag, document) { this.tagName = tag.toUpperCase(); this.ownerDocument = document; this.children = []; this.attrs = new Map(); }
    setAttribute(key, value) { this.attrs.set(key, value); }
    append(node) { node.remove(); node.parentElement = this; this.children.push(node); }
    prepend(node) { node.remove(); node.parentElement = this; this.children.unshift(node); }
    remove() { if (this.parentElement) { const siblings = this.parentElement.children; siblings.splice(siblings.indexOf(this), 1); this.parentElement = null; } }
    replaceChildren(node) { [...this.children].forEach(child => child.remove()); this.append(node); }
    get lastElementChild() { return this.children.at(-1); }
    querySelectorAll(selector) {
        const attr = selector.match(/\[([^\]]+)\]/)?.[1];
        if (selector.startsWith(':scope > ')) return this.children.filter(node => node.attrs.has(attr));
        return this.children.flatMap(node => [node, ...node.querySelectorAll('*')]).filter(node => selector === '*' || (node.attrs.has(attr) && node.parentElement?.tagName === 'SUMMARY'));
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}
function fixture() {
    const document = { createElement: tag => new Element(tag, document) };
    const details = document.createElement('details'), summary = document.createElement('summary'), host = document.createElement('span');
    host.setAttribute('data-rabbit-mirror-tool-entry-host', 'true');
    details.append(summary); summary.append(host);
    const body = document.createElement('article'); body.content = 'Original unmodified mirror'; details.append(body);
    const bar = document.createElement('span'); bar.setAttribute('data-rm-face-swipe-bar', 'true');
    bar.listener = () => 'same swipe handler'; host.append(bar);
    const rabbit = document.createElement('button'); host.append(rabbit);
    return { document, details, summary, host, body, bar, rabbit };
}

test('bottom pager lives inside its own face after content and keeps the same controls', () => {
    const f = fixture();
    placeFacePager(f.details, f.host, 'bottom');
    const footer = f.details.lastElementChild;
    assert.equal(footer.attrs.get('data-rm-face-swipe-position'), 'bottom');
    assert.equal(footer.children[0], f.bar);
    assert.equal(f.bar.listener(), 'same swipe handler');
    assert.equal(f.body.content, 'Original unmodified mirror');
    assert.equal(f.body.parentElement, f.details);
    assert.equal(f.rabbit.parentElement, f.host);
});

test('repeated setting changes keep exactly one pager and preserve nested content', () => {
    const f = fixture();
    const inner = fixture(); f.body.append(inner.details);
    for (let i = 0; i < 4; i++) {
        placeFacePager(f.details, f.host, 'bottom');
        placeFacePager(f.details, f.host, 'bottom');
        assert.equal(f.details.querySelectorAll(':scope > [data-rm-face-swipe-host]').length, 1);
        placeFacePager(f.details, f.host, 'top');
        assert.equal(f.details.querySelectorAll(':scope > [data-rm-face-swipe-host]').length, 0);
        assert.equal(f.host.children[0], f.bar);
        assert.equal(inner.bar.parentElement, inner.host);
    }
});

test('remount replaces a saved footer bar with the newly wired title bar', () => {
    const f = fixture(); placeFacePager(f.details, f.host, 'bottom');
    const fresh = f.document.createElement('span'); fresh.setAttribute('data-rm-face-swipe-bar', 'true');
    fresh.listener = () => 'live'; f.host.prepend(fresh);
    placeFacePager(f.details, f.host, 'bottom');
    assert.equal(f.details.lastElementChild.children[0], fresh);
    assert.equal(f.details.lastElementChild.children.length, 1);
    assert.equal(f.bar.parentElement, null);
    assert.equal(fresh.listener(), 'live');
});

test('refresh moves controls for multiple faces without changing their open state', () => {
    const a = fixture(), b = fixture(); a.details.setAttribute('open', '');
    const scope = a.document.createElement('div'); scope.append(a.details); scope.append(b.details);
    refreshFacePagerPositions(scope, 'bottom');
    assert.equal(a.bar.parentElement, a.details.lastElementChild);
    assert.equal(b.bar.parentElement, b.details.lastElementChild);
    assert.equal(a.details.attrs.has('open'), true);
    assert.equal(b.details.attrs.has('open'), false);
});

test('settings UI saves bottom/top with real normalization and refreshes current mirrors', async () => {
    const runtime = createRuntime(fileURLToPath(new URL('..', import.meta.url)));
    const config = await runtime.load('src/settings.js');
    assert.equal(config.getSettings().facePagerPosition, 'top');
    const source = readFileSync(new URL('../src/ui.js', import.meta.url), 'utf8');
    const start = source.indexOf("    $('#rh_face_pager_position').val");
    const body = source.slice(start, source.indexOf("    $('#rh_image_composition')", start));
    let handler; const calls = [];
    const doc = {};
    vm.runInNewContext(body, { $: () => ({ val() { return this; }, on(type, cb) { handler = cb; } }),
        settings: config.getSettings(), getSettings: config.getSettings, updateSettings: config.updateSettings, document: doc,
        refreshFacePagerPositions: (scope, position) => calls.push([scope, position]) });
    handler({ target: { value: 'bottom' } });
    assert.equal(config.getSettings().facePagerPosition, 'bottom');
    assert.deepEqual(calls.at(-1), [doc, 'bottom']);
    handler({ target: { value: 'top' } });
    assert.equal(config.getSettings().facePagerPosition, 'top');
    config.updateSettings({ facePagerPosition: 'invalid' });
    assert.equal(config.getSettings().facePagerPosition, 'top');
});
