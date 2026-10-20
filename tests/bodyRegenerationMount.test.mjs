import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const sources = Object.fromEntries(['mount', 'geometry'].map(file => [file,
    readFileSync(new URL(`../src/independentApi/${file}.js`, import.meta.url), 'utf8')]));
function install(context, file, name) {
    const match = sources[file].match(new RegExp(`^(?:export )?function ${name}\\([^]*?^}\\r?$`, 'm'));
    assert.ok(match, name);
    vm.runInContext(match[0].replace(/^export /, ''), context);
}
// A small DOM boundary, not a second implementation of the owner/ready logic.
class Element {
    constructor(tag, text = '', className = '') {
        this.tagName = tag.toUpperCase(); this.nodeType = 1; this.text = text;
        this.children = []; this.dataset = {}; this.attrs = {}; this.isConnected = true;
        const classes = new Set(className.split(' ').filter(Boolean));
        this.classList = { contains: name => classes.has(name), remove: name => classes.delete(name) };
    }
    get childNodes() { return this.children; }
    get textContent() { return this.text + this.children.map(child => child.textContent).join(''); }
    set textContent(value) { this.text = value; this.children = []; }
    append(...nodes) { for (const node of nodes) { node.parentElement = this; this.children.push(node); } }
    replaceChildren(...nodes) { for (const node of this.children) node.isConnected = false; this.children = []; this.append(...nodes); }
    remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(node => node !== this); this.isConnected = false; }
    replaceWith(node) { const parent = this.parentElement; const index = parent.children.indexOf(this); parent.children.splice(index, 1, node); node.parentElement = parent; this.isConnected = false; }
    hasAttribute(name) { return Object.hasOwn(this.attrs, name); }
    getAttribute(name) { return this.attrs[name] ?? null; }
    removeAttribute(name) { delete this.attrs[name]; }
    setAttribute(name, value) { this.attrs[name] = value; }
    matches(selector) { return selector.split(',').some(part => part.trim().toUpperCase() === this.tagName); }
    querySelectorAll(selector) {
        if (selector === ':scope > details') return this.children.filter(child => child.tagName === 'DETAILS');
        if (selector === ':scope > summary') return this.children.filter(child => child.tagName === 'SUMMARY');
        if (selector === ':scope > .rabbit-mirror-external-placeholder-body') return this.children.filter(child => child.classList.contains('rabbit-mirror-external-placeholder-body'));
        return [];
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}
function face(text, placeholder = false) {
    const el = new Element('details', '', placeholder ? 'rabbit-mirror-external-placeholder' : '');
    el.append(new Element('summary', '【兔子镜：' + text + '】'), new Element('p', text));
    return el;
}
function harness(count = 1) {
    const message = { mes: 'new-body', swipe_id: 0 }, ctx = { chat: [message] };
    const host = new Element('div', '', 'rabbit-mirror-multiface-host');
    host.dataset = { rmKey: 'chat:0:0:old-body', rmSource: 'independent', rmSourceHash: 'old-body', rmState: 'ready',
        rmOwnerChat: 'chat', rmOwnerMesid: '0', rmOwnerSwipe: '0', rmFaceCount: String(count), rmFaceView: String(count - 1) };
    const originals = Array.from({ length: count }, (_, i) => face('old-face-' + i));
    host.append(...originals);
    host.__rabbitMirrorIndependentSource = 'old-result';
    host.__rabbitMirrorIndependentInitialSource = 'old-initial';
    const saved = Object.freeze({ html: 'old-result', sourceHash: 'old-body' });
    const store = { 'chat:0:0:old-body': saved };
    const faces = node => node.querySelectorAll(':scope > details');
    const sandbox = {
        console, Node: { ELEMENT_NODE: 1, TEXT_NODE: 3 },
        externalInsertTarget: () => host, collapseDuplicateIdentityHosts: () => host,
        matchingExternalHosts: (_el, key) => host.dataset.rmKey === key ? [host] : [], externalHosts: () => [host],
        externalFaceDetails: faces, hasMultifaceMarkup: () => false,
        repatriateExternalDetails: () => faces(host)[0], recoverEscapedExternalDetails: () => null,
        stampExternalDetailsOwnership(node) { const parts = node.dataset.rmKey.split(':'); node.dataset.rmOwnerChat = parts[0]; node.dataset.rmOwnerMesid = parts[1]; node.dataset.rmOwnerSwipe = parts[2]; },
        placeExternalHost() {}, removeDuplicateExternalHosts() {}, ensureExternalTools() {},
        showIndependentResayStatus: node => { node.dataset.pending = 'true'; }, clearIndependentResayStatus: node => { delete node.dataset.pending; },
        clearExternalHostFreshSourceState() {}, independentMaintenanceLiveRepairLocked: () => false,
        scheduleExternalShellTint() {}, scheduleIndependentReadyPostprocess() {}, markHistoricalLightHostForRestore() {},
        markMountedFaceProofs() {}, markExternalDetails() {}, transferExternalTools() {},
        fallbackExternalDetails: (_state, text) => face(text, true),
        externalPlaceholderTitle: state => state, setPlaceholderSummary: (details, text) => { details.children[0].textContent = text; },
        renderExternalErrorBody: (details, text) => { details.children[1].textContent = text; },
        extractReadyDetails: text => face(text), document: { createElement: tag => new Element(tag) },
        chatKey: () => 'chat', swipeId: msg => msg.swipe_id, recordKey: (_ctx, _i, msg) => `chat:0:${msg.swipe_id}:${msg.mes}`,
        messageElement: () => host, persistedOwnerForMessage: () => saved, readStore: () => store,
        ownerLockForBase: () => ({ slot: 'chat:0:0:old-body' }), independentStoredHtmlRestorable: () => true,
        savedRecordMatchesObserved: (record, observed) => record.sourceHash === observed.sourceHash,
    };
    const context = vm.createContext(sandbox);
    for (const name of ['usableReadyDetails', 'completeReadyFaceDetails', 'readyDetailsFromHost', 'mountedIndependentReadyHostMatchesObserved']) install(context, 'geometry', name);
    for (const name of ['ensureExternalUiCore', 'exactIndependentReadyForIdentity']) install(context, 'mount', name);
    const identity = () => ({ ctx, msg: message, key: `chat:0:${message.swipe_id}:${message.mes}`, slot: `chat:0:${message.swipe_id}:${message.mes}`,
        baseSlot: `chat:0:${message.swipe_id}`, sourceHash: message.mes, legacySlots: [] });
    return { host, context, message, originals, store, saved, identity,
        paint(state, content = 'generation pending') { const live = identity(); return context.ensureExternalUiCore(host, live.key, content, state, 'independent', live.sourceHash); } };
}

for (const state of ['loading', 'error']) for (const count of [1, 3]) {
    test(`new body ${state} cannot promote ${count} old faces to the new owner`, () => {
        const h = harness(count); h.paint(state);
        assert.equal(h.host.dataset.rmState, state);
        assert.equal(h.context.exactIndependentReadyForIdentity(0, h.identity()), null, 'old DOM must not enter the ready-cache shortcut');
        assert.equal(h.host.querySelectorAll(':scope > details').length, 1);
        assert.doesNotMatch(h.host.textContent, /old-face/);
        assert.equal(h.store['chat:0:0:old-body'], h.saved, 'old saved result remains available');
        assert.equal(h.host.dataset.rmFaceCount, undefined);
        assert.equal(h.host.dataset.rmFaceView, undefined);
        assert.equal(h.host.__rabbitMirrorIndependentInitialSource, '');
    });
}
test('a new body result replaces the placeholder and becomes the only completed result', () => {
    const h = harness(3); h.paint('loading'); h.paint('ready', 'new-result');
    assert.match(h.host.textContent, /new-result/); assert.doesNotMatch(h.host.textContent, /old-face/);
    assert.equal(h.host.querySelectorAll(':scope > details').length, 1);
    assert.equal(h.context.exactIndependentReadyForIdentity(0, h.identity())?.kind, 'mounted');
    assert.equal(h.store['chat:0:0:old-body'], h.saved);
});
test('changing the main reply swipe cannot relabel an old completed result', () => {
    const h = harness(3); h.message.swipe_id = 1; h.paint('loading');
    assert.equal(h.context.exactIndependentReadyForIdentity(0, h.identity()), null);
    assert.doesNotMatch(h.host.textContent, /old-face/);
});
for (const state of ['loading', 'error']) {
    test(`same-body manual resay ${state} retains original faces and interaction DOM`, () => {
        const h = harness(3); h.message.mes = 'old-body'; h.paint(state);
        assert.equal(h.host.dataset.rmState, 'ready');
        assert.deepEqual(h.host.querySelectorAll(':scope > details'), h.originals);
        assert.equal(h.host.__rabbitMirrorIndependentInitialSource, 'old-initial');
        assert.equal(h.host.dataset.rmFaceView, '2');
    });
}
