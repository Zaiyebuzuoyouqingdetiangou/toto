import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// checkedStateRescue.js pulls the tavern host graph, so this runs the moved
// functions from that file instead of importing the whole module.
const source = readFileSync(new URL('../src/outputSanitizer/checkedStateRescue.js', import.meta.url), 'utf8');
const start = source.indexOf('const MIRROR_ROOT_SELECTOR');
const end = source.indexOf('function mirrorRootFor');
const chunk = source.slice(start, end).replace(/^export /gm, '');
const sandbox = {
    escapeRegExp(text) {
        return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
};
vm.runInNewContext(`${chunk}\nthis.findSafeCheckedDescendantSelectorRepair = findSafeCheckedDescendantSelectorRepair;\nthis.checkedSelectorRepairRulesForStyle = checkedSelectorRepairRulesForStyle;`, sandbox);

const SCOPE = '[data-rabbit-mirror-css-scope="rm1"]';
const ORIGINAL = `${SCOPE} input:checked ~ .panel.hidden`;
const REPAIRED = `${SCOPE} input:checked ~ .panel .hidden`;

function mirrorRoot(matches) {
    return {
        getAttribute(name) {
            return name === 'data-rabbit-mirror-css-scope' ? 'rm1' : '';
        },
        querySelectorAll(selector) {
            return matches[selector] || [];
        },
        contains() {
            return true;
        },
    };
}

test('checked sibling with two adjacent classes repairs to a descendant selector', () => {
    const root = mirrorRoot({
        [`${SCOPE} input ~ .panel.hidden`]: [],
        [`${SCOPE} input ~ .panel .hidden`]: [{ id: 'panel' }],
    });
    assert.equal(sandbox.findSafeCheckedDescendantSelectorRepair(root, ORIGINAL), REPAIRED);
    const rule = { selectorText: ORIGINAL, style: { cssText: 'display: block;' } };
    assert.deepEqual(Array.from(sandbox.checkedSelectorRepairRulesForStyle(root, [rule])), [`${REPAIRED} { display: block; }`]);
});

test('checked selector repair leaves selectors that are not this scoped sibling pattern', () => {
    const root = mirrorRoot({});
    assert.equal(sandbox.findSafeCheckedDescendantSelectorRepair(root, `${SCOPE} .panel.hidden`), null);
    assert.equal(sandbox.findSafeCheckedDescendantSelectorRepair(root, '[data-rabbit-mirror-css-scope="other"] input:checked ~ .panel.hidden'), null);
    const alreadyWorks = mirrorRoot({
        [`${SCOPE} input ~ .panel.hidden`]: [{ id: 'already' }],
    });
    assert.equal(sandbox.findSafeCheckedDescendantSelectorRepair(alreadyWorks, ORIGINAL), null);
    assert.deepEqual(Array.from(sandbox.checkedSelectorRepairRulesForStyle(root, [
        { selectorText: `${SCOPE} .panel`, style: { cssText: 'color: red;' } },
    ])), []);
});
