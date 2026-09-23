import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Execute production boundaries against a minimal DOM fixture, as in the other
// host-dependent tests. This verifies serialization, not browser layout.
const geometry = readFileSync(new URL('../src/independentApi/geometry.js', import.meta.url), 'utf8');
const diagnostics = readFileSync(new URL('../src/outputSanitizer/diagnostics.js', import.meta.url), 'utf8');
function functionSource(source, name) {
    const match = source.match(new RegExp(`(?:export )?function ${name}\\([^]*?\\r?\\n\\}`));
    assert.ok(match, `${name} source exists`);
    return match[0].replace(/^export /, '');
}
class Element {
    constructor(tag, text = '', attrs = {}) {
        this.tagName = tag.toUpperCase(); this.text = text;
        this.attrs = { ...attrs }; this.children = []; this.isConnected = true;
    }
    append(...nodes) { for (const node of nodes) { node.parentElement = this; this.children.push(node); } }
    appendChild(node) { this.append(node); return node; }
    remove() { this.parentElement.children = this.parentElement.children.filter(node => node !== this); }
    removeAttribute(name) { delete this.attrs[name]; }
    matches(selector) {
        return selector.split(',').some(part => {
            part = part.trim();
            if (part === '*') return true;
            if (part.startsWith('[')) return Object.hasOwn(this.attrs, part.slice(1, -1).split('=')[0]);
            return part.toUpperCase() === this.tagName;
        });
    }
    querySelectorAll(selector) {
        const parts = selector.split(',').map(part => part.trim());
        if (parts.length === 1 && parts[0].startsWith(':scope > ')) {
            const segments = parts[0].slice(9).split(' > ');
            let nodes = [this];
            for (const segment of segments) nodes = nodes.flatMap(node => node.children.filter(child => child.matches(segment)));
            return nodes;
        }
        const all = this.children.flatMap(child => [child, ...child.querySelectorAll('*')]);
        return all.filter(node => node.matches(selector));
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    cloneNode(deep) {
        const clone = new Element(this.tagName, this.text, this.attrs);
        if (deep) clone.append(...this.children.map(child => child.cloneNode(true)));
        return clone;
    }
    get textContent() { return this.text + this.children.map(child => child.textContent).join(''); }
    get outerHTML() {
        const tag = this.tagName.toLowerCase();
        return `<${tag}${Object.entries(this.attrs).map(([key, value]) => ` ${key}="${value}"`).join('')}>${this.text}${this.children.map(child => child.outerHTML).join('')}</${tag}>`;
    }
}
function fixture(withFooter = true) {
    const details = new Element('details');
    const summary = new Element('summary', '兔子镜：保留真实信件');
    summary.append(new Element('span', '顶部控件', { 'data-rabbit-mirror-tool-entry-host': 'true' }));
    details.append(summary, new Element('p', '亲爱的你：今天在街角偶遇的全部正文。'), new Element('button', '打开信件'));
    if (withFooter) {
        const footer = new Element('div', '', { 'data-rm-face-swipe-host': 'true', 'data-rm-face-swipe-position': 'bottom' });
        footer.append(new Element('button', '‹'), new Element('span', '2/5'), new Element('button', '›'));
        details.append(footer);
    }
    return details;
}
function load(source, names, globals) {
    const context = vm.createContext(globals);
    vm.runInContext(names.map(name => functionSource(source, name)).join('\n'), context);
    return context;
}
test('moving pager to the bottom cannot change the content fingerprint', () => {
    const { mirrorSemanticFingerprint } = load(geometry, ['mirrorSemanticFingerprint'], {
        isRabbitMirrorDetails: () => true, hashText: value => value,
    });
    const original = fixture(); const before = original.outerHTML;
    assert.equal(mirrorSemanticFingerprint(original), mirrorSemanticFingerprint(fixture(false)));
    assert.equal(original.outerHTML, before, 'fingerprint must not mutate the live face');
});
test('single-face ready records do not save bottom controls or their empty shell', () => {
    const original = fixture(); const before = original.outerHTML;
    const { readyRecordFromHost } = load(geometry, ['readyRecordFromHost'], {
        completeReadyFaceDetails: () => [original], DEFERRED_INTERACTION_RESCUE_ATTR: 'deferred',
        stripIndependentTransientLayoutArtifacts: () => {}, independentStoredHtmlRestorable: () => true,
        RUNTIME_VERSION: 'test',
    });
    const saved = readyRecordFromHost({ dataset: {} }, { sourceHash: 'source' });
    assert.doesNotMatch(saved.html, /face-swipe|2\/5|顶部控件/);
    assert.match(saved.html, /今天在街角偶遇的全部正文。/);
    assert.match(saved.html, /<button>打开信件<\/button>/);
    assert.equal(original.outerHTML, before);
});
test('copy/download keeps authored content but excludes bottom paging chrome', () => {
    const globals = {
        isRabbitMirrorDetails: () => true, validateRabbitMirrorTemplateStructuralBudget: () => true,
        cloneRabbitMirrorFilteredNode: node => node.cloneNode(true), sanitizeRabbitMirrorUntrustedTemplate: () => true,
        RABBIT_MIRROR_MAX_TEMPLATE_SOURCE_CHARS: 100000,
        document: { createElement() {
            const content = new Element('fragment');
            return { content, get innerHTML() { return content.children.map(node => node.outerHTML).join(''); } };
        } },
    };
    for (const constant of functionSource(diagnostics, 'buildRabbitMirrorCurrentFaceHtml').matchAll(/\b[A-Z][A-Z_]{3,}\b/g)) {
        if (!(constant[0] in globals)) globals[constant[0]] = constant[0] === 'TOOL_ENTRY_HOST_ATTR' ? 'data-rabbit-mirror-tool-entry-host' : `test-${constant[0]}`;
    }
    const { buildRabbitMirrorCurrentFaceHtml } = load(diagnostics, ['buildRabbitMirrorCurrentFaceHtml'], globals);
    const original = fixture(); const before = original.outerHTML;
    const html = buildRabbitMirrorCurrentFaceHtml(original);
    assert.doesNotMatch(html, /face-swipe|2\/5|顶部控件/);
    assert.match(html, /今天在街角偶遇的全部正文。/);
    assert.match(html, /<button>打开信件<\/button>/);
    assert.equal(original.outerHTML, before);
});
