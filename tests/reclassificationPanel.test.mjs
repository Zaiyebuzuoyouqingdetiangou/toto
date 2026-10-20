import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/externalWorldBook/reclassificationPanel.js', import.meta.url), 'utf8')
    .replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
// Run the real panel module against a small DOM boundary, including inherited
// fieldset disabling. Storage is injected; durable storage has separate tests.
class Element {
    constructor(tag, doc) { this.tagName = tag; this.ownerDocument = doc; this.children = []; this.style = {}; this.attrs = {}; this.events = {}; this.textContent = ''; this.value = ''; }
    setAttribute(name, value) { this.attrs[name] = value; }
    append(...nodes) { for (const node of nodes) { node.remove(); node.parentElement = this; this.children.push(node); if (this.tagName === 'select' && this.children.length === 1) this.value = node.value; } }
    remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = null; }
    replaceChildren(...nodes) { for (const child of [...this.children]) child.remove(); this.append(...nodes); }
    addEventListener(name, callback) { this.events[name] = callback; }
    get isConnected() { return this === this.ownerDocument.body || !!this.parentElement?.isConnected; }
    get blocked() { return !!this.disabled || !!this.parentElement?.blocked; }
    querySelectorAll(selector) { return this.children.flatMap(child => [child, ...child.querySelectorAll('*')]).filter(child => selector === '*' || (selector === 'input[type="checkbox"]' && child.tagName === 'input' && child.type === 'checkbox')); }
    async fire(name, fields = {}) { if (!this.blocked) return this.events[name]?.({ target: this, preventDefault() {}, ...fields }); }
    async check(checked) { if (this.blocked) return; this.checked = checked; await this.fire('change'); }
}
const flush = () => new Promise(resolve => setImmediate(resolve));
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
function setup({ read, save } = {}) {
    const doc = { createElement(tag) { return new Element(tag, doc); } }; doc.body = doc.createElement('body');
    const container = doc.createElement('div'); doc.body.append(container);
    const choices = Array.from({ length: 60 }, (_, i) => ({ externalId: `id-${i}`, title: `entry-${i}`, classification: ['theme', 'format', 'text'][i % 3], enabled: i % 2 === 0, reclassifiable: true }));
    choices.push({ externalId: 'aux', title: 'auxiliary', classification: 'auxiliary', enabled: true, reclassifiable: false });
    const calls = [], reads = [];
    const context = vm.createContext({
        listExternalLibraryEntryChoices: (libraryId, options) => { reads.push([libraryId, options]); return read ? read(libraryId, options) : Promise.resolve((() => { const rows = choices.filter(item => item.title.includes(options.query)); return { choices: rows.slice(options.offset, options.offset + options.pageSize), hasNext: rows.length > options.offset + options.pageSize }; })()); },
        reclassifyExternalLibraryEntries: (libraryId, selection, target) => { calls.push(JSON.parse(JSON.stringify({ libraryId, selection, target }))); return save ? save(libraryId, selection, target) : Promise.resolve({ selectedCount: 1, changedCount: 1 }); },
    });
    vm.runInContext(source, context);
    const open = (id = 'book-a', options) => context.openExternalReclassificationPanel(container, { libraryId: id, displayName: id }, options);
    const panel = open();
    return { doc, container, panel, open, calls, reads };
}
const nodes = panel => panel.querySelectorAll('*');
const button = (panel, label) => nodes(panel).find(node => node.tagName === 'button' && node.textContent === label);
const box = (panel, id) => panel.querySelectorAll('input[type="checkbox"]').find(node => node.value === id);
const selected = panel => nodes(panel).find(node => node.attrs['data-rh-reclass-selection']);
const search = panel => nodes(panel).find(node => node.type === 'search');

test('manual selection survives pagination and search and submits only chosen IDs', async () => {
    const f = setup(); await flush();
    await box(f.panel, 'id-0').check(true);
    await button(f.panel, '下一页').fire('click'); await flush();
    await box(f.panel, 'id-55').check(true);
    assert.equal(box(f.panel, 'aux').disabled, true);
    search(f.panel).value = 'entry-0'; await button(f.panel, '查找条目').fire('click'); await flush();
    assert.equal(box(f.panel, 'id-0').checked, true);
    assert.match(selected(f.panel).textContent, /已选择 2 条/);
    await button(f.panel, '应用重新分类').fire('click');
    assert.deepEqual(f.calls, [{ libraryId: 'book-a', selection: { ids: ['id-0', 'id-55'] }, target: 'text' }]);
});

test('whole-library selection retains cross-page exclusions through filtering', async () => {
    const f = setup(); await flush();
    await button(f.panel, '全选整本（跨页）').fire('click');
    await box(f.panel, 'id-2').check(false);
    await button(f.panel, '下一页').fire('click'); await flush();
    assert.equal(box(f.panel, 'id-55').checked, true);
    assert.equal(box(f.panel, 'aux').checked, false);
    await box(f.panel, 'id-55').check(false);
    search(f.panel).value = 'entry-2'; await search(f.panel).fire('keydown', { key: 'Enter' }); await flush();
    assert.equal(box(f.panel, 'id-2').checked, false);
    assert.match(selected(f.panel).textContent, /排除 2 条/);
    await button(f.panel, '应用重新分类').fire('click');
    assert.deepEqual(f.calls[0].selection, { all: true, excludedIds: ['id-2', 'id-55'] });
});

test('cancel and collapse perform no storage writes', async () => {
    const f = setup(); await flush();
    await button(f.panel, '全选本页').fire('click');
    assert.match(selected(f.panel).textContent, /已选择 50 条/);
    await button(f.panel, '取消全选').fire('click');
    assert.equal(button(f.panel, '应用重新分类').disabled, true);
    await box(f.panel, 'id-0').check(true);
    await button(f.panel, '收起重新分类').fire('click');
    assert.equal(f.panel.isConnected, false);
    assert.equal(f.calls.length, 0);
});

test('pending save disables editing and failure retains the original selection for retry', async () => {
    const pending = deferred(); let count = 0;
    const f = setup({ save: () => ++count === 1 ? pending.promise : Promise.resolve({ selectedCount: 1, changedCount: 1 }) }); await flush();
    await box(f.panel, 'id-1').check(true);
    const applying = button(f.panel, '应用重新分类').fire('click');
    assert.equal(button(f.panel, '取消全选').blocked, true);
    assert.equal(search(f.panel).blocked, true);
    await button(f.panel, '取消全选').fire('click');
    await button(f.panel, '应用重新分类').fire('click');
    assert.equal(f.calls.length, 1);
    pending.reject(new Error('quota')); await applying;
    assert.equal(button(f.panel, '应用重新分类').blocked, false);
    assert.equal(box(f.panel, 'id-1').checked, true);
    assert.match(selected(f.panel).textContent, /已选择 1 条/);
    await button(f.panel, '应用重新分类').fire('click');
    assert.deepEqual(f.calls[1].selection, { ids: ['id-1'] });
});

test('late list response cannot replace a different library panel or a newer search', async () => {
    const requests = [];
    const f = setup({ read: () => { const pending = deferred(); requests.push(pending); return pending.promise; } });
    const newer = f.open('book-b');
    requests[1].resolve({ choices: [{ externalId: 'b', title: 'book b', classification: 'text', reclassifiable: true }], hasNext: false }); await flush();
    requests[0].resolve({ choices: [{ externalId: 'a', title: 'book a', classification: 'text', reclassifiable: true }], hasNext: false }); await flush();
    assert.equal(f.container.children[0], newer);
    assert.ok(box(newer, 'b')); assert.equal(box(newer, 'a'), undefined);
    search(newer).value = 'first'; await button(newer, '查找条目').fire('click');
    search(newer).value = 'second'; await button(newer, '查找条目').fire('click');
    requests[3].resolve({ choices: [{ externalId: 'second', title: 'second', classification: 'format', reclassifiable: true }], hasNext: false }); await flush();
    requests[2].resolve({ choices: [{ externalId: 'first', title: 'first', classification: 'theme', reclassifiable: true }], hasNext: false }); await flush();
    assert.ok(box(newer, 'second')); assert.equal(box(newer, 'first'), undefined);
});

test('late completed save never clears or repaints the new library selection', async () => {
    const pending = deferred(); const f = setup({ save: () => pending.promise }); await flush();
    await box(f.panel, 'id-1').check(true);
    const applying = button(f.panel, '应用重新分类').fire('click');
    const newer = f.open('book-b'); await flush();
    await box(newer, 'id-2').check(true);
    pending.resolve({ selectedCount: 1, changedCount: 1 }); await applying;
    assert.equal(f.container.children[0], newer);
    assert.equal(box(newer, 'id-2').checked, true);
    assert.match(selected(newer).textContent, /已选择 1 条/);
    assert.equal(f.calls[0].libraryId, 'book-a');
});
