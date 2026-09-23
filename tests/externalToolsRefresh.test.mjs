import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const geometry = readFileSync(new URL('../src/independentApi/geometry.js', import.meta.url), 'utf8');
const menu = readFileSync(new URL('../src/mirrorToolMenu.js', import.meta.url), 'utf8');
function sourceFunction(name) {
    const match = geometry.match(new RegExp(`(?:export )?function ${name}\\([^]*?\\r?\\n\\}`));
    assert.ok(match, `${name} source found`);
    return match[0].replace('export ', '');
}

// A connected tree double keeps node identity, movement and listener closures.
// Layout and sanitizer parsing are boundaries; refresh, transfer, installation
// and the actual menu click/action handlers execute their production functions.
class Node {
    constructor(tag = 'div') {
        this.tagName = tag.toUpperCase(); this.children = []; this.parentElement = null;
        this.attrs = new Map(); this.dataset = {}; this.events = new Map();
        this.style = { setProperty() {} };
    }
    get isConnected() { return this.tagName === 'BODY' || !!this.parentElement?.isConnected; }
    setAttribute(name, value) { this.attrs.set(name, String(value)); }
    getAttribute(name) { return this.attrs.get(name) ?? null; }
    hasAttribute(name) { return this.attrs.has(name); }
    removeAttribute(name) { this.attrs.delete(name); }
    append(...nodes) { for (const node of nodes) { node.remove(); node.parentElement = this; this.children.push(node); } }
    appendChild(node) { this.append(node); return node; }
    remove() {
        if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(node => node !== this);
        this.parentElement = null;
    }
    replaceWith(node) {
        const parent = this.parentElement, index = parent.children.indexOf(this);
        node.remove(); parent.children[index] = node; node.parentElement = parent; this.parentElement = null;
    }
    querySelectorAll(selector) {
        if (selector === ':scope > summary > [data-rabbit-mirror-tool-entry-host]') {
            return this.querySelector(':scope > summary')?.querySelectorAll(':scope > [data-rabbit-mirror-tool-entry-host]') || [];
        }
        const direct = selector.startsWith(':scope > '), simple = selector.replace(':scope > ', '');
        const candidates = direct ? this.children : this.children.flatMap(node => [node, ...node.querySelectorAll('*')]);
        if (simple === '*') return candidates;
        if (simple.includes(',')) return []; // Fixture has no legacy tool buttons.
        const attr = simple.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
        return candidates.filter(node => attr ? node.hasAttribute(attr[1]) && (attr[2] === undefined || node.getAttribute(attr[1]) === attr[2]) : node.tagName.toLowerCase() === simple);
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    addEventListener(type, handler) { this.events.set(type, handler); }
    removeEventListener(type) { this.events.delete(type); }
    contains(node) { return node === this || this.children.some(child => child.contains(node)); }
    focus() {}
    click() { this.events.get('click')?.({ preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {} }); }
}

function fixture({ open = true, version = 'old', invalid = false } = {}) {
    const body = new Node('body'), host = new Node(), old = new Node('details'), summary = new Node('summary'), tools = new Node('span');
    body.append(host); host.append(old); old.append(summary); summary.append(tools);
    tools.setAttribute('data-rabbit-mirror-tool-entry-host', 'true');
    const marker = 'data-rabbit-mirror-independent-sanitizer-version';
    old.setAttribute(marker, version); if (open) old.setAttribute('open', '');
    host.dataset.rmState = 'ready'; host.dataset.rmSource = 'independent';
    let installs = 0, lastActionRoot = null, parses = 0;
    const context = vm.createContext({
        document: { body, createElement: tag => new Node(tag), addEventListener() {}, removeEventListener() {} },
        RUNTIME_VERSION: 'current', INDEPENDENT_SANITIZER_ATTR: marker,
        beginHostWorkTiming: () => null,
        externalFaceDetails: target => target.children.filter(node => node.tagName === 'DETAILS'),
        prepareLocalDetailsClone: details => details,
        extractReadyDetails: () => {
            parses++; if (invalid) return null;
            const next = new Node('details'); next.append(new Node('summary')); next.setAttribute(marker, 'current'); return next;
        },
        markExternalDetails() {}, wireIndependentRejectedFaceControls() {}, stampExternalDetailsOwnership() {},
        historicalLightHost: () => false, armExternalInteractionTools() {}, repairRabbitMirrorPersistedExclusiveGridSpan() {},
        removeIndependentResayButtons() {},
        refreshRabbitMirrorToolsInScope: target => {
            installs++;
            for (const details of target.children) context.installMirrorToolMenu(details, tools,
                [{ id: 'feedback', label: '反馈', run: () => { lastActionRoot = details; } }]);
        },
    });
    vm.runInContext(menu.replaceAll('export ', ''), context);
    vm.runInContext('fitMirrorToolPanel = () => {};', context); // Layout is checked separately.
    vm.runInContext(['refreshExistingExternalDetails', 'refreshExistingExternalDetailsCore', 'externalToolHost', 'transferExternalTools', 'ensureExternalTools'].map(sourceFunction).join('\n'), context);
    context.ensureExternalTools(host); installs = 0;
    return { context, host, old, tools, body, parses: () => parses, installs: () => installs, lastActionRoot: () => lastActionRoot };
}

for (const open of [true, false]) test(`replaced ${open ? 'open' : 'closed'} face retains tools and rebinds clicks to its live root`, () => {
    const f = fixture({ open });
    const button = f.tools.querySelector('[data-rm-tool-menu-button]');
    const next = f.context.refreshExistingExternalDetails(f.host, 'key');
    assert.notEqual(next, f.old);
    assert.equal(f.old.isConnected, false);
    assert.equal(next.isConnected, true);
    assert.equal(next.hasAttribute('open'), open);
    assert.equal(next.querySelector(':scope > summary > [data-rabbit-mirror-tool-entry-host]'), f.tools);
    assert.equal(f.tools.querySelector('[data-rm-tool-menu-button]'), button, 'preserve the existing live control');
    button.click();
    const panel = f.body.querySelector('[data-rm-tool-menu]');
    assert.ok(panel, 'rabbit must open after the old root is detached');
    panel.querySelector('[data-rm-tool-choice="feedback"]').click();
    assert.equal(f.lastActionRoot(), next, 'action must target the replacement face');
    assert.equal(f.installs(), 1);
    f.context.refreshExistingExternalDetails(f.host, 'key');
    assert.equal(f.installs(), 1, 'current version needs no repeated rebind');
});

test('already current face preserves root and skips parsing and installation', () => {
    const f = fixture({ version: 'current' });
    assert.equal(f.context.refreshExistingExternalDetails(f.host, 'key'), f.old);
    assert.equal(f.parses(), 0); assert.equal(f.installs(), 0);
});

test('failed replacement parsing leaves the original live tools untouched', () => {
    const f = fixture({ invalid: true });
    assert.equal(f.context.refreshExistingExternalDetails(f.host, 'key'), f.old);
    assert.equal(f.old.isConnected, true); assert.equal(f.installs(), 0);
    f.tools.querySelector('[data-rm-tool-menu-button]').click();
    assert.ok(f.body.querySelector('[data-rm-tool-menu]'));
});
