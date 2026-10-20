import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createRuntime } from './helpers/vmLoader.mjs';

// Settings appearance moves already-bound fields out of its hidden source vault.
// Exercise that production routing block and the existing save handler together.
const appearance = readFileSync(new URL('../src/settingsAppearance.js', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../src/ui.js', import.meta.url), 'utf8');
class Node {
    constructor(id = '') { this.id = id; this.children = []; this.hidden = false; this.handlers = new Map(); }
    append(node) {
        if (node.parentElement) node.parentElement.children = node.parentElement.children.filter(child => child !== node);
        node.parentElement = this; this.children.push(node);
    }
    matches() { return false; }
    removeAttribute() {}
    querySelectorAll() { return []; }
    get visible() { return !this.hidden && (!this.parentElement || this.parentElement.visible); }
    change(value) { this.value = value; this.handlers.get('change')?.({ target: this }); }
}
function routeDisplayControls(nodes, display) {
    const startMove = appearance.indexOf('    const move = ');
    const endMove = appearance.indexOf('    const row = ', startMove);
    const startDisplay = appearance.indexOf("    const followDisplay=move('rh_follow_display_row'");
    const endDisplay = appearance.indexOf("    move('rh_independent_manual_legacy'", startDisplay);
    assert.ok(startMove >= 0 && endMove > startMove && startDisplay >= 0 && endDisplay > startDisplay);
    vm.runInNewContext(appearance.slice(startMove, endMove) + appearance.slice(startDisplay, endDisplay), {
        get: id => nodes.get(id),
        body: key => { assert.equal(key, 'display'); return display; },
    });
}
test('display page exposes the original pager field and retains its live save/refresh handler', async () => {
    const root = new Node(), vault = new Node('rh-ui-source'), display = new Node('display');
    vault.hidden = true; root.append(vault); root.append(display);
    const nodes = new Map(['rh_follow_display_row', 'rh_independent_display_row', 'rh_face_pager_settings', 'rh_face_pager_position'].map(id => [id, new Node(id)]));
    for (const id of ['rh_follow_display_row', 'rh_independent_display_row', 'rh_face_pager_settings']) vault.append(nodes.get(id));
    const wrapper = nodes.get('rh_face_pager_settings'), select = nodes.get('rh_face_pager_position');
    wrapper.append(select);
    const runtime = createRuntime(fileURLToPath(new URL('..', import.meta.url)));
    const config = await runtime.load('src/settings.js');
    const calls = [];
    const startHandler = ui.indexOf("    $('#rh_face_pager_position').val");
    const endHandler = ui.indexOf("    $('#rh_image_composition')", startHandler);
    assert.ok(startHandler >= 0 && endHandler > startHandler);
    vm.runInNewContext(ui.slice(startHandler, endHandler), {
        $: selector => {
            assert.equal(selector, '#rh_face_pager_position');
            return { val(value) { select.value = value; return this; }, on(event, callback) { select.handlers.set(event, callback); } };
        },
        settings: config.getSettings(), getSettings: config.getSettings, updateSettings: config.updateSettings,
        document: root, refreshFacePagerPositions: (scope, position) => calls.push([scope, position]),
    });
    const originalHandler = select.handlers.get('change');
    assert.equal(select.visible, false, 'original template fields begin in the hidden source vault');
    routeDisplayControls(nodes, display);
    assert.equal(wrapper.parentElement, display, 'pager settings must be routed to the display page');
    assert.equal(select.visible, true, 'opening the display page must expose the pager select');
    assert.equal(wrapper.children[0], select, 'retain the original field, never a clone');
    assert.equal(select.handlers.get('change'), originalHandler);
    select.change('bottom');
    assert.equal(config.getSettings().facePagerPosition, 'bottom');
    assert.deepEqual(calls, [[root, 'bottom']], 'changing the moved field refreshes current mirrors immediately');
    select.change('top');
    assert.equal(config.getSettings().facePagerPosition, 'top');
    assert.deepEqual(calls.at(-1), [root, 'top']);
    assert.equal(vault.hidden, true, 'do not reveal unrelated legacy settings');
    assert.equal(display.children.filter(node => node === wrapper).length, 1);
});

test('settings home links to the same display page that owns the pager selector', () => {
    assert.match(appearance, /row\('settings','display','兔子镜显示模式'\)/);
    assert.match(appearance, /display:\['settings','兔子镜显示模式'/);
    const template = readFileSync(new URL('../src/ui/settingsTemplate.js', import.meta.url), 'utf8');
    assert.match(template, /id="rh_face_pager_settings"[\s\S]*?多面切页位置[\s\S]*?id="rh_face_pager_position"[\s\S]*?<option value="bottom">底部切页<\/option>/);
});
