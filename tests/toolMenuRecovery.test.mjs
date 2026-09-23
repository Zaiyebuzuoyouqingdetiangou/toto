import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const menuSource = readFileSync(new URL('../src/mirrorToolMenu.js', import.meta.url), 'utf8').replace(/^export /gm, '');
class Element {
    constructor(tag) { this.tagName = tag; this.children = []; this.attrs = new Map(); this.events = new Map(); this.style = { setProperty() {} }; this.offsetHeight = 300; }
    get isConnected() { return this.tagName === 'body' || !!this.parentElement?.isConnected; }
    append(node) { node.remove(); node.parentElement = this; this.children.push(node); }
    remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(n => n !== this); this.parentElement = null; }
    setAttribute(k, v) { this.attrs.set(k, v); }
    addEventListener(k, v) { this.events.set(k, v); }
    removeEventListener(k) { this.events.delete(k); }
    contains(node) { return this === node || this.children.some(n => n.contains(node)); }
    getBoundingClientRect() { return { left: 30, bottom: 50 }; }
    focus() {}
    querySelectorAll(selector) {
        const direct = selector.startsWith(':scope > ');
        const nodes = direct ? this.children : this.children.flatMap(n => [n, ...n.querySelectorAll('*')]);
        if (selector === '*') return nodes;
        if (selector === 'button') return nodes.filter(n => n.tagName === 'button');
        const names = [...selector.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]);
        return nodes.filter(n => names.some(k => n.attrs.has(k)));
    }
    querySelector(s) { return this.querySelectorAll(s)[0] || null; }
    click() { this.events.get('click')?.({ preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {} }); }
}
function fixture(source = menuSource) {
    const body = new Element('body'), root = new Element('details'), host = new Element('span');
    body.append(root); root.append(host);
    const doc = { body, createElement: tag => new Element(tag), getElementById: () => null, querySelector: () => null, addEventListener() {}, removeEventListener() {} };
    const context = vm.createContext({ document: doc, innerWidth: 390, innerHeight: 700, addEventListener() {}, removeEventListener() {}, MutationObserver: class { observe() {} disconnect() {} } });
    vm.runInContext(source, context);
    let feedback = 0, repairs = 0;
    const install = () => context.installMirrorToolMenu(root, host, [
        { id: 'feedback', label: '反馈', run: () => feedback++ },
        { id: 'maintenance', label: '维修', run: () => repairs++ },
    ]);
    const rabbit = () => host.querySelector('[data-rm-tool-menu-button]');
    const choose = id => body.querySelector('[data-rm-tool-menu]')?.children.find(n => n.attrs.get('data-rm-tool-choice') === id)?.click();
    return { root, host, body, install, rabbit, choose, feedback: () => feedback, repairs: () => repairs };
}

test('reinstall after host child replacement rebinds visible rabbit and feedback actions', () => {
    const f = fixture(); f.install();
    const stale = f.rabbit(); stale.remove();
    const serialized = new Element('button'); serialized.setAttribute('data-rm-tool-menu-button', 'true'); f.host.append(serialized);
    f.install(); f.rabbit().click(); f.choose('feedback');
    assert.equal(f.feedback(), 1);
    assert.notEqual(f.rabbit(), serialized);
    f.rabbit().click(); f.choose('maintenance');
    assert.equal(f.repairs(), 1);
    assert.equal(f.host.querySelectorAll('[data-rm-tool-menu-button]').length, 1);
});
test('ordinary reinstallation keeps one live button and each action fires once', () => {
    const f = fixture(); f.install(); const original = f.rabbit();
    f.install(); f.install(); assert.equal(f.rabbit(), original);
    f.rabbit().click(); f.choose('feedback'); assert.equal(f.feedback(), 1);
});
test('replacing an open menu owner removes its stale popup before rebinding', () => {
    const f = fixture(); f.install(); f.rabbit().click();
    assert.ok(f.body.querySelector('[data-rm-tool-menu]'));
    f.rabbit().remove(); f.install();
    assert.equal(f.body.querySelector('[data-rm-tool-menu]'), null);
    f.rabbit().click(); f.choose('feedback'); assert.equal(f.feedback(), 1);
});
test('closing image panel removes its portal before restoring current message tools once', () => {
    const source = readFileSync(new URL('../src/imageUi.js', import.meta.url), 'utf8');
    const start = source.indexOf('function closePanel() {'), end = source.indexOf('export function closeMirrorImagePanel', start);
    const calls = [];
    const context = vm.createContext({ console, panel: { cleanup: () => calls.push('cleanup'), host: { remove: () => calls.push('remove') }, onClose: () => calls.push('restore'), opener: { isConnected: true, focus: () => calls.push('focus') } } });
    vm.runInContext(source.slice(start, end) + '\nclosePanel(); closePanel();', context);
    assert.deepEqual(calls, ['cleanup', 'remove', 'restore', 'focus']);
    assert.equal(context.panel, null);
});
