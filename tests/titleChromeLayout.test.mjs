import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const toolsChrome = readFileSync(new URL('../src/outputSanitizer/toolsChrome.js', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('../src/outputSanitizer/runtime.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const menu = readFileSync(new URL('../src/mirrorToolMenu.js', import.meta.url), 'utf8');

test('narrow screens no longer stretch the title tool host to 100%', () => {
    assert.equal(toolsChrome.includes('toolHostShouldStack'), false);
    assert.equal(/@media \(max-width:\s*720px\)[\s\S]{0,240}min-width:\s*100%/.test(css), false);
    assert.equal(/@media \(max-width:\s*720px\)[\s\S]{0,240}min-width:\s*100%/.test(runtime), false);
    assert.match(css, /\[data-rabbit-mirror-tool-entry-host\][\s\S]{0,400}width:\s*auto/);
    assert.match(runtime, /justify-content:\s*flex-start/);
});

test('title chrome wraps the label and keeps the control cluster compact', () => {
    assert.match(toolsChrome, /function ensureMirrorTitleLabel/);
    assert.match(toolsChrome, /TITLE_CHROME_ATTR/);
    assert.match(css, /-webkit-line-clamp:\s*2/);
    assert.match(css, /data-rm-title-chrome/);
    assert.match(runtime, /line-clamp:\s*2/);
});

test('delete button is last in the tool host, not floated on the summary', () => {
    assert.match(toolsChrome, /function installFaceSwipeDelete\(root, host, view\)/);
    assert.match(toolsChrome, /host\.append\(del\)/);
    assert.equal(toolsChrome.includes('summary.insertBefore(del, summary.firstElementChild)'), false);
    assert.match(css, /rabbit-mirror-face-swipe-delete[\s\S]{0,280}float:\s*none/);
});

test('mobile tap targets stay compact and aligned', () => {
    assert.match(css, /rabbit-mirror-face-swipe-bar button[\s\S]{0,220}min-height:\s*36px/);
    assert.match(css, /rabbit-mirror-face-favorite-star[\s\S]{0,280}width:\s*36px/);
    assert.match(menu, /width:36px!important;height:36px!important/);
});
