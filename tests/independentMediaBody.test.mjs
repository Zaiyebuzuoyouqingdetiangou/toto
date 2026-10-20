import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/independentApi/request.js', import.meta.url), 'utf8');
const bodyEvidence = source.slice(source.indexOf('function independentMirrorBodyEvidence'), source.indexOf('function independentVisualProgramIntegrity'));
function check(tag, { hidden = false, style = '', text = '', childMedia = false, children = [] } = {}) {
    const summary = { nodeType: 1, tagName: 'SUMMARY', textContent: '兔子镜' };
    // querySelector intentionally searches descendants, never the element itself.
    const element = { nodeType: 1, tagName: tag, textContent: text, children,
        matches: selector => selector.split(',').includes(tag.toLowerCase()),
        hasAttribute: name => name === 'hidden' && hidden,
        getAttribute: name => name === 'style' ? style : null,
        querySelector: () => childMedia ? { tagName: 'SVG' } : null };
    const details = { childNodes: [summary, element], querySelector: () => summary };
    const context = vm.createContext({ Node: { ELEMENT_NODE: 1, TEXT_NODE: 3 },
        DOMParser: class { parseFromString() { return { querySelector: () => details }; } },
        wrappedIndependentMirrorHtml: value => value });
    vm.runInContext(bodyEvidence, context);
    return context.independentMirrorBodyEvidence('<details><summary>兔子镜</summary></details>');
}

test('direct media is valid body evidence without a decorative wrapping div', () => {
    for (const tag of ['SVG', 'IMG', 'CANVAS', 'VIDEO', 'AUDIO']) assert.equal(check(tag), true, tag);
});
test('hidden media cannot make an empty mirror acceptable', () => {
    for (const tag of ['SVG', 'IMG']) {
        assert.equal(check(tag, { hidden: true }), false);
        assert.equal(check(tag, { style: 'display:none' }), false);
        assert.equal(check(tag, { style: 'visibility:hidden' }), false);
    }
});
test('style-only, script-only and empty containers are still empty', () => {
    assert.equal(check('STYLE', { text: 'body{color:red}' }), false);
    assert.equal(check('SCRIPT', { text: 'alert(1)' }), false);
    assert.equal(check('DIV'), false);
});
test('ordinary prose and wrapped media remain acceptable', () => {
    assert.equal(check('P', { text: 'A completed story.' }), true);
    assert.equal(check('DIV', { childMedia: true, children: [{ tagName: 'SVG' }] }), true);
});
