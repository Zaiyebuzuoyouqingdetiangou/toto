import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function stripModuleSyntax(source) {
    return source
        .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];\s*/gm, '')
        .replace(/^export /gm, '');
}

function loadMarkup() {
    const runtime = stripModuleSyntax(readFileSync(new URL('../src/outputSanitizer/runtime.js', import.meta.url), 'utf8'));
    const markup = stripModuleSyntax(readFileSync(new URL('../src/outputSanitizer/markup.js', import.meta.url), 'utf8'));
    const context = vm.createContext({
        console,
        URL,
        Map,
        Set,
        WeakMap,
        WeakSet,
        document: undefined,
        getSettings: () => ({}),
        applyRabbitMirrorBannedWordsToDom() {},
    });
    vm.runInContext(`${runtime}\n${markup}`, context);
    return context;
}

// 与导出样本同构的镜面片段：纯 CSS radio tab 切换 + 作者自建定位容器 + 全尺寸事件覆盖层。
const SAMPLE_MIRROR_CSS = `
.tmgs-console{position:relative;width:100%;max-width:420px;height:440px;margin:0 auto;}
.tmgs-main-screen{position:relative;height:420px;overflow:hidden;}
.thought-panel{position:absolute;bottom:0;left:0;right:0;height:40%;z-index:20;}
.thought-box{display:none;height:100%;}
#tab-2:checked ~ .thought-panel .tb-2{display:block;}
.rmc-adv-overlay{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(18,22,34,.92);z-index:50;display:none;}
#adv-1:checked ~ .tmgs-main-screen .rmc-adv-overlay{display:flex !important;}
`;

test('sample-shaped mirror CSS keeps full-size absolute stacking layers when the template has authored positioning', () => {
    const { sanitizeGeneratedStyleSheet } = loadMarkup();
    const cleaned = sanitizeGeneratedStyleSheet(SAMPLE_MIRROR_CSS, { allowContainedAbsoluteStack: true });
    assert.ok(cleaned.includes('position:absolute;top:0;left:0;width:100%;height:100%'), 'event overlay keeps position:absolute');
    assert.ok(cleaned.includes('.thought-panel{position:absolute;bottom:0;left:0;right:0;height:40%;z-index:20;}'));
    assert.ok(cleaned.includes('#adv-1:checked ~ .tmgs-main-screen .rmc-adv-overlay{display:flex !important;}'), 'tab/overlay :checked rules survive');
    assert.ok(cleaned.includes('.tmgs-main-screen{position:relative;height:420px;overflow:hidden;}'));
});

test('without the exemption the same rule loses position:absolute (historical bug behaviour)', () => {
    const { sanitizeGeneratedStyleSheet } = loadMarkup();
    const cleaned = sanitizeGeneratedStyleSheet(SAMPLE_MIRROR_CSS);
    const overlayRule = cleaned.match(/\.rmc-adv-overlay\{([^}]*)\}/)?.[1] || '';
    assert.ok(!/position\s*:/.test(overlayRule), 'strict mode strips position from full-size absolute layer');
    assert.ok(overlayRule.includes('width:100%'), 'geometry declarations themselves were kept');
});

// 1.68 起 position:fixed 一律改写成 absolute（fixed 相对酒馆窗口定位，能盖住酒馆界面；absolute 只在兔子镜范围里叠放）。
// 作者自建定位上下文（豁免开启）时，镜内的 absolute 全尺寸层是有意的叠放，放行；sticky 全屏层仍然清理。
// 没有豁免（严格模式）时，全尺寸 / 四边全贴加超高 z-index 的 absolute 层照旧清理。
test('fixed covers become contained absolute layers; sticky covers stay stripped; the exemption only affects absolute', () => {
    const { sanitizeGeneratedStyleSheet } = loadMarkup();
    const exempt = { allowContainedAbsoluteStack: true };
    const body = (css, options) => sanitizeGeneratedStyleSheet(css, options).match(/\.ad\{([^}]*)\}/)?.[1] || '';
    for (const fixedCover of ['.ad{position:fixed;inset:0;background:#000;}', '.ad{position:fixed;top:0;left:0;width:100%;height:100%;}']) {
        assert.ok(!/position\s*:\s*fixed/.test(body(fixedCover, exempt)), `fixed never survives: ${fixedCover}`);
        assert.ok(/position\s*:\s*absolute/.test(body(fixedCover, exempt)), `rewritten to a contained absolute layer under the exemption: ${fixedCover}`);
    }
    assert.ok(!/position\s*:/.test(body('.ad{position:sticky;top:0;width:100%;height:100%;}', exempt)), 'sticky cover stripped under the exemption');
    for (const stacked of ['.ad{position:absolute;top:0;right:0;bottom:0;left:0;z-index:9999;background:#000;}', '.ad{position:absolute;inset:0;z-index:1000;}']) {
        assert.ok(/position\s*:\s*absolute/.test(body(stacked, exempt)), `authored absolute stack kept under the exemption: ${stacked}`);
        assert.ok(!/position\s*:/.test(body(stacked, {})), `strict mode still strips it: ${stacked}`);
    }
    assert.ok(!/position\s*:/.test(body('.ad{position:fixed;top:0;left:0;width:100%;height:100%;}', {})), 'strict mode strips the rewritten viewport cover too');
});

test('inline tab-state snapshots and inline stacked layers follow the same narrow rule', () => {
    const { sanitizeGeneratedCssDeclarationBlock } = loadMarkup();
    assert.equal(sanitizeGeneratedCssDeclarationBlock('display: none !important;', { allowContainedAbsoluteStack: true }), 'display: none !important;');
    const inline = 'position:absolute;inset:0;width:100%;height:100%;display:flex;';
    assert.ok(sanitizeGeneratedCssDeclarationBlock(inline, { allowContainedAbsoluteStack: true }).includes('position:absolute'));
    assert.ok(!sanitizeGeneratedCssDeclarationBlock(inline).includes('position:absolute'), 'strict inline mode unchanged');
});

test('authored positioning context is detected from style sheets or inline styles only', () => {
    const { rabbitMirrorTemplateHasAuthoredPositioningContext } = loadMarkup();
    const template = (styles, styledElements = []) => ({
        content: {
            querySelectorAll(selector) {
                if (selector === 'style') return styles.map(textContent => ({ textContent }));
                if (selector === '[style]') return styledElements.map(value => ({ getAttribute: name => (name === 'style' ? value : null) }));
                return [];
            },
        },
    });
    assert.equal(rabbitMirrorTemplateHasAuthoredPositioningContext(template([SAMPLE_MIRROR_CSS])), true);
    assert.equal(rabbitMirrorTemplateHasAuthoredPositioningContext(template([], ['position:relative;height:420px'])), true);
    assert.equal(rabbitMirrorTemplateHasAuthoredPositioningContext(template(['.ad{position:absolute;inset:0;width:100%;height:100%;z-index:5}'])), true, 'absolute rule still counts as authored positioning evidence');
    assert.equal(rabbitMirrorTemplateHasAuthoredPositioningContext(template(['.plain{display:flex;color:red}'])), false);
    assert.equal(rabbitMirrorTemplateHasAuthoredPositioningContext(template([], [])), false);
});
