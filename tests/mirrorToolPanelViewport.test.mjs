import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/mirrorToolMenu.js', import.meta.url), 'utf8').replaceAll('export ', '');
function fixture({ top = 0, height = 700, composerTop = 620, composerHeight = 80, focused = false } = {}) {
    const events = new Map(), viewEvents = new Map(), panelEvents = new Map(), styles = new Map();
    let disconnected = 0;
    const view = { width: 390, height, offsetTop: top, offsetLeft: 0,
        addEventListener: (n, f) => viewEvents.set(n, f), removeEventListener: n => viewEvents.delete(n) };
    const input = { matches: () => true, getBoundingClientRect: () => ({ top: 400, bottom: 508 }) };
    const panel = { isConnected: true, offsetHeight: 550, scrollTop: 0, clientHeight: 250,
        contains: el => el === input,
        style: { setProperty: (n, v) => styles.set(n, v) },
        addEventListener: (n, f) => panelEvents.set(n, f), removeEventListener: n => panelEvents.delete(n),
        getBoundingClientRect: () => ({ top: Number.parseFloat(styles.get('top')), bottom: Number.parseFloat(styles.get('top')) + Math.min(550, Number.parseFloat(styles.get('max-height'))) }) };
    const composer = { getBoundingClientRect: () => ({ top: composerTop, bottom: composerTop + composerHeight, height: composerHeight, width: 390 }) };
    const document = { body: {}, activeElement: focused ? input : null, getElementById: () => composer };
    const observers = [];
    const context = vm.createContext({ document, visualViewport: view, innerWidth: 390, innerHeight: 700,
        addEventListener: (n, f) => events.set(n, f), removeEventListener: n => events.delete(n),
        MutationObserver: class { constructor(fn) { observers.push(fn); } observe() {} disconnect() { disconnected++; } },
        ResizeObserver: class { observe() {} disconnect() { disconnected++; } } });
    vm.runInContext(source, context);
    context.fitMirrorToolPanel(panel, { getBoundingClientRect: () => ({ left: 300, bottom: 590 }) });
    return { styles, view, viewEvents, panelEvents, panel, input, document, observers, disconnected: () => disconnected };
}

test('normal panel stays above visible chat composer and within horizontal viewport', () => {
    const f = fixture();
    assert.equal(f.styles.get('max-height'), '600px');
    assert.ok(parseFloat(f.styles.get('top')) + 550 <= 612);
    assert.ok(parseFloat(f.styles.get('left')) + 340 <= 378);
});
test('keyboard panning must not collapse feedback to a sliver above stale chat composer', () => {
    const f = fixture({ top: 230, height: 300, composerTop: 200, focused: true });
    assert.equal(f.styles.get('max-height'), '276px');
    assert.equal(f.styles.get('top'), '242px');
});
test('hidden or above-viewport composer cannot consume usable feedback height', () => {
    for (const composer of [{ composerTop: 0, composerHeight: 0 }, { composerTop: -100 }, { composerTop: 35 }]) {
        const f = fixture({ height: 300, ...composer });
        assert.equal(f.styles.get('max-height'), '276px');
    }
});
test('focus and keyboard resize preserve feedback editing space; dismiss restores composer avoidance', () => {
    const f = fixture();
    f.document.activeElement = f.input;
    f.panelEvents.get('focusin')?.();
    assert.equal(f.styles.get('max-height'), '676px');
    f.view.height = 300; f.view.offsetTop = 230;
    f.viewEvents.get('resize')();
    assert.equal(f.styles.get('max-height'), '276px');
    f.document.activeElement = null; f.view.height = 700; f.view.offsetTop = 0;
    f.viewEvents.get('resize')();
    assert.equal(f.styles.get('max-height'), '600px');
    f.panel.isConnected = false; f.observers[0]();
    assert.equal(f.viewEvents.size, 0);
    assert.equal(f.panelEvents.size, 0);
    assert.ok(f.disconnected() >= 1);
});
